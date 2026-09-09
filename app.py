#!/usr/bin/env python3
"""Santa Cruz 2027 - Montagem de Elenco.

App proprio, porta 5090. Nao faz parte do hub Botafogo (:5555).
Base de jogadores: dados/jogadores.json (gerada por preparar_base.py).
Cenarios salvos: dados/cenarios.json.
"""
import io
import json
import os
import uuid
from datetime import datetime

from flask import Flask, Response, jsonify, request, render_template, send_file, abort

AQUI = os.path.dirname(os.path.abspath(__file__))
ARQ_JOGADORES = os.path.join(AQUI, "dados", "jogadores.json")
ARQ_CENARIOS = os.environ.get("SC_CENARIOS") or os.path.join(AQUI, "dados", "cenarios.json")
PORTA = 5090

app = Flask(__name__)
app.json.ensure_ascii = False
# app local: template e static sempre frescos, sem cache do navegador
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
app.jinja_env.auto_reload = True

def senha_exigida():
    """Senha de acesso: definida por variavel de ambiente na hospedagem.
    Sem ela (rodando local), o app abre direto."""
    return os.environ.get("SC_SENHA", "").strip()


@app.before_request
def exigir_senha():
    senha = senha_exigida()
    if not senha:
        return None
    auth = request.authorization
    if auth and auth.password == senha:
        return None
    return Response(
        "Acesso restrito ao Santa Cruz 2027.", 401,
        {"WWW-Authenticate": 'Basic realm="Santa Cruz 2027"'})


@app.route("/dados/<path:arquivo>")
def dados(arquivo):
    """Bases servidas como arquivo: nada fica carregado na memoria do servidor."""
    caminho = os.path.normpath(os.path.join(AQUI, "dados", arquivo))
    if not caminho.startswith(os.path.join(AQUI, "dados")) or not os.path.exists(caminho):
        abort(404)
    if os.path.basename(caminho) == "cenarios.json":   # nao e publico
        abort(404)
    return send_file(caminho, max_age=3600)


def ler_cenarios():
    if not os.path.exists(ARQ_CENARIOS):
        return {}
    try:
        with open(ARQ_CENARIOS, encoding="utf-8") as fh:
            return json.load(fh)
    except (json.JSONDecodeError, OSError):
        return {}


def gravar_cenarios(dados):
    os.makedirs(os.path.dirname(ARQ_CENARIOS), exist_ok=True)
    tmp = ARQ_CENARIOS + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(dados, fh, ensure_ascii=False, indent=1)
    os.replace(tmp, ARQ_CENARIOS)


def versao_estatica():
    """Assinatura dos arquivos de front, para o navegador nunca servir versao velha."""
    marcas = []
    for nome in ("app.js", "style.css"):
        caminho = os.path.join(AQUI, "static", nome)
        marcas.append(str(int(os.path.getmtime(caminho))) if os.path.exists(caminho) else "0")
    return "-".join(marcas)


@app.route("/")
def index():
    resp = app.make_response(render_template("index.html", ver=versao_estatica()))
    resp.headers["Cache-Control"] = "no-store"
    return resp


@app.route("/escudo")
def escudo():
    """Serve o escudo que o usuario colocar em static/ (escudo.png/.svg/.jpg/.webp).
    Sem arquivo, devolve 404 e a tela cai no brasao desenhado."""
    for nome in ("escudo.svg", "escudo.png", "escudo.jpg", "escudo.jpeg", "escudo.webp"):
        caminho = os.path.join(AQUI, "static", nome)
        if os.path.exists(caminho):
            return send_file(caminho, max_age=0)
    abort(404)


@app.route("/api/comparativo")
def api_comparativo():
    """Resumo de cada grupo salvo, para a tela de comparacao."""
    SETOR = {"gol": ["GOL"], "defesa": ["LD", "LE", "ZD", "ZE"],
             "meio": ["VOL", "MED", "MEI"], "ataque": ["EE", "ED", "CA"]}
    saida = []
    for cid, c in ler_cenarios().items():
        elenco = c.get("elenco") or {}
        atletas = [j for lista in elenco.values() for j in lista]
        folha = sum(float(j.get("salario") or 0) for j in atletas)
        fator = float(c.get("fator") or 1) or 1
        comissao = float(c.get("comissao") or 0)
        teto = float(c.get("teto") or 0)
        idades = [float(j["idade"]) for j in atletas if j.get("idade")]
        setores = {}
        for s, poss in SETOR.items():
            setores[s] = sum(float(j.get("salario") or 0)
                             for p in poss for j in elenco.get(p, []))
        saida.append({
            "id": cid, "nome": c.get("nome", "sem nome"),
            "atualizado": c.get("atualizado", ""),
            "atletas": len(atletas),
            "estrangeiros": sum(1 for j in atletas if j.get("estrangeiro")),
            "folha": folha, "fator": fator, "comissao": comissao, "teto": teto,
            "custoElenco": folha * fator,
            "custoTotal": folha * fator + comissao,
            "sobra": teto - (folha * fator + comissao),
            "media": (folha / len(atletas)) if atletas else 0,
            "maior": max((float(j.get("salario") or 0) for j in atletas), default=0),
            "idadeMedia": (sum(idades) / len(idades)) if idades else 0,
            "semSalario": sum(1 for j in atletas if not j.get("salario")),
            "setores": setores,
        })
    saida.sort(key=lambda x: x["atualizado"], reverse=True)
    return jsonify(saida)


@app.route("/api/cenarios", methods=["GET", "POST"])
def api_cenarios():
    cen = ler_cenarios()
    if request.method == "GET":
        return jsonify([
            {"id": k, "nome": v.get("nome", "sem nome"),
             "atualizado": v.get("atualizado", ""),
             "total": v.get("total", 0), "atletas": v.get("atletas", 0)}
            for k, v in sorted(cen.items(), key=lambda kv: kv[1].get("atualizado", ""), reverse=True)
        ])

    corpo = request.get_json(silent=True) or {}
    cid = corpo.get("id") or uuid.uuid4().hex[:10]
    corpo["id"] = cid
    corpo["atualizado"] = datetime.now().strftime("%Y-%m-%d %H:%M")
    cen[cid] = corpo
    gravar_cenarios(cen)
    return jsonify({"ok": True, "id": cid, "atualizado": corpo["atualizado"]})


@app.route("/api/cenario/<cid>", methods=["GET", "DELETE"])
def api_cenario(cid):
    cen = ler_cenarios()
    if cid not in cen:
        abort(404)
    if request.method == "DELETE":
        cen.pop(cid)
        gravar_cenarios(cen)
        return jsonify({"ok": True})
    return jsonify(cen[cid])


@app.route("/api/exportar", methods=["POST"])
def api_exportar():
    """Recebe o elenco montado e devolve um .xlsx."""
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Font, PatternFill
    from openpyxl.utils import get_column_letter

    dados = request.get_json(silent=True) or {}
    nome_cen = dados.get("nome") or "Elenco Santa Cruz 2027"
    teto = float(dados.get("teto") or 0)
    comissao = float(dados.get("comissao") or 0)
    fator = float(dados.get("fator") or 1) or 1
    disponivel = float(dados.get("disponivel") or ((teto - comissao) / fator))
    linhas = dados.get("linhas") or []

    wb = Workbook()
    ws = wb.active
    ws.title = "Elenco 2027"

    tit = Font(bold=True, color="FFFFFF", size=11)
    fundo = PatternFill("solid", fgColor="8B0000")
    negrito = Font(bold=True)

    ws.append([nome_cen])
    ws["A1"].font = Font(bold=True, size=14)
    ws.append(["Custo total maximo (mes)", teto])
    ws.append(["Comissao tecnica (mes)", comissao])
    ws.append(["Fator de encargos", fator])
    ws.append(["Massa salarial disponivel", disponivel])
    for r in (2, 3, 5):
        ws.cell(row=r, column=2).number_format = 'R$ #,##0'
    ws.cell(row=4, column=2).number_format = '0.00'
    ws.append([])

    cab = ["Posicao", "Jogador", "Clube", "Liga", "Idade", "Overall", "Contrato",
           "Nacionalidade", "Estrangeiro", "Status",
           "Salario mensal (R$)", "Custo p/ o clube (R$)", "% da massa"]
    ws.append(cab)
    lin_cab = ws.max_row
    for c in range(1, len(cab) + 1):
        cel = ws.cell(row=lin_cab, column=c)
        cel.font = tit
        cel.fill = fundo
        cel.alignment = Alignment(horizontal="center")

    total = 0.0
    n_estr = 0
    for ln in linhas:
        sal = float(ln.get("salario") or 0)
        total += sal
        if str(ln.get("estrangeiro", "")).upper() == "SIM":
            n_estr += 1
        ws.append([
            ln.get("posicao", ""), ln.get("nome", ""), ln.get("clube", ""),
            ln.get("liga", ""), ln.get("idade", ""), ln.get("overall", ""),
            ln.get("contrato", ""), ln.get("nacionalidade", ""), ln.get("estrangeiro", ""),
            ln.get("status", ""), sal, sal * fator,
            (sal / disponivel) if disponivel else 0,
        ])

    ult = ws.max_row + 1
    ws.cell(row=ult, column=10, value="TOTAL").font = negrito
    ws.cell(row=ult, column=11, value=total).font = negrito
    ws.cell(row=ult, column=12, value=total * fator).font = negrito
    ws.cell(row=ult, column=13, value=(total / disponivel) if disponivel else 0).font = negrito

    ws.append([])
    for rot, val, fmt in (
        ("Atletas", len(linhas), "0"),
        ("Estrangeiros", n_estr, "0"),
        ("Folha salarial (jogadores)", total, 'R$ #,##0'),
        ("Custo do elenco (com encargos)", total * fator, 'R$ #,##0'),
        ("Custo total (elenco + comissao)", total * fator + comissao, 'R$ #,##0'),
        ("Sobra sobre o custo maximo", teto - (total * fator + comissao), 'R$ #,##0'),
    ):
        ws.append([rot, val])
        ws.cell(row=ws.max_row, column=1).font = negrito
        ws.cell(row=ws.max_row, column=2).number_format = fmt

    for r in range(lin_cab + 1, ult + 1):
        ws.cell(row=r, column=11).number_format = 'R$ #,##0'
        ws.cell(row=r, column=12).number_format = 'R$ #,##0'
        ws.cell(row=r, column=13).number_format = '0.0%'
    for c, larg in enumerate([18, 28, 20, 12, 7, 8, 12, 15, 11, 15, 19, 20, 11], start=1):
        ws.column_dimensions[get_column_letter(c)].width = larg
    ws.freeze_panes = ws.cell(row=lin_cab + 1, column=1)

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    seguro = "".join(ch for ch in nome_cen if ch.isalnum() or ch in " -_").strip() or "elenco"
    return send_file(buf, as_attachment=True,
                     download_name=f"{seguro}.xlsx",
                     mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


if __name__ == "__main__":
    if not os.path.exists(ARQ_JOGADORES):
        raise SystemExit("dados/jogadores.json nao existe. Rode: python3 preparar_base.py ago26")
    porta = int(os.environ.get("PORT", PORTA))
    print(f"\n  Santa Cruz 2027 - Montagem de Elenco")
    print(f"  http://localhost:{porta}\n")
    app.run(host="0.0.0.0" if os.environ.get("PORT") else "127.0.0.1", port=porta, debug=False)
