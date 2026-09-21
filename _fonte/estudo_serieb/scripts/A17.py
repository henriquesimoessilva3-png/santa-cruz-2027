#!/usr/bin/env python3
"""A17 — que jeito de jogar produz a chance boa?

A D13 manda gastar em modelo de jogo e diz QUANTO cada coisa paga. Ela não diz COMO se chega lá.
O A05 testou se o jeito de construir a jogada separa quem SOBE, e não separa — mas isso é outra
pergunta. Aqui o alvo não é o acesso: é o próprio eixo. O que um time faz que o leva a finalizar
de mais perto e a ceder finalização pior?

Lista: `resultados/A17_indicadores.json`, fechada antes de rodar — 17 preditores em 4 famílias,
2 alvos. Fora da lista, e escrito lá: toques e entradas na área, finalizações e gols. Eles não são
jeito de jogar; são a própria chegada, e predizer a distância da finalização com o número de
toques na área é medir a mesma coisa duas vezes.

## Três contas

1. **A correlação**, com IC95 e p por bootstrap de CLUBE (`_metodo_jogo.correlacionar_por_clube`):
   80 linhas são 40 clubes, e o teste de linha supõe uma independência que o painel não tem.
   BH a 5% por família × alvo, nos dois cortes de fronteira.
2. **A porta do eixo**: o preditor nas 19 primeiras rodadas contra o ALVO nas 19 últimas, com
   parcial dada ao alvo do 1º turno — a receita da §6.4 (`_porta_temporal.parcial`), com o alvo
   trocado. Passar nela quer dizer que o jeito de jogar vem ANTES da chance boa, e não que os dois
   são a mesma medida contada duas vezes.
3. **A leitura do jogo**, em `A17_jogo.csv`: a mesma correlação dentro do próprio clube-temporada
   e do mesmo mando, na unidade clube-jogo — a máquina do A15. Ela confirma direção e precisão, e
   sai SEM q: publicar um segundo q para o mesmo indicador é o defeito que a regra 7 caça.

Uso:
    python3 _fonte/estudo_serieb/scripts/A17.py
"""
import collections
import csv
import json
import os
import re
import sys

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import _porta_temporal as p64                                    # noqa: E402
from _metodo import pct, percentil_no_ano                        # noqa: E402
from _metodo_jogo import (centrar_no_clube, correlacionar_por_clube,  # noqa: E402
                          _amostras_de_rho_por_clube, ic_e_p)

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
RNG = np.random.default_rng(20260921)
ANOS = ("2022", "2023", "2024", "2025")
REPS = 10000
GERADO_EM = "2026-09-21"

# Como cada preditor se monta a partir de um jogo. Só entram aqui os que EXISTEM por jogo; os que
# não existirem ficam de fora da porta e da leitura do jogo, e isso vai publicado.
POR_JOGO = {
    "posse": ("media", "Posse, %"),
    "passes_pct": ("media", "Passes certos, %"),
    "passe_longo_pct": ("media", "% de passe longo"),
    "compr_passe": ("media", "Comprimento médio de passes"),
    "passes_progressivos": ("media", "Passes progressivos"),
    "passes_terco_final": ("media", "Passes para terço final"),
    "atq_posicional": ("media", "Ataques posicionais"),
    "contra_ataques": ("media", "Contra-ataques"),
    "cruzamentos": ("media", "Cruzamentos"),
    "cruz_certos_pct": ("media", "Cruzamentos certos, %"),
    "ppda": ("media", "PPDA"),
    "recuperacoes": ("media", "Recuperações"),
    "intensidade": ("media", "Intensidade de jogo"),
    "duelos_pct": ("media", "Duelos ganhos, %"),
    "duelos_aereos_pct": ("media", "Duelos aéreos ganhos, %"),
    "bolas_paradas": ("media", "Bolas paradas"),
    "cantos": ("media", "Cantos"),
}
ALVO_POR_JOGO = {"dist_remate": ("media", "Distância média do remate"),
                 "xg_por_remate_contra": ("razao", "xg_sofrido", "Remates contra")}


def br(v, casas):
    return f"{v:.{casas}f}".replace(".", ",")


def br_sinal(v, casas):
    return f"{v:+.{casas}f}".replace(".", ",")


def ic_br(ic):
    return f"{ic[0]:+.2f} a {ic[1]:+.2f}".replace(".", ",")


def num(v):
    try:
        x = float(v)
    except (TypeError, ValueError):
        return None
    return None if x != x else x


def jogos():
    """Os jogos de Série B de 2022–2025, com o espelho do adversário (para o xG sofrido)."""
    linhas = []
    with open(os.path.join(DADOS, "serieb_jogos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if (r.get("Competição") or "").strip() != "Brazil. Serie B":
                continue
            if (r.get("ano") or "") not in ANOS:
                continue
            linhas.append(r)
    idx = {(r["ano"], r["Jogo"], r["Equipa"]): r for r in linhas}
    por_jogo = collections.defaultdict(list)
    for r in linhas:
        por_jogo[(r["ano"], r["Jogo"])].append(r)
    for r in linhas:
        adv = [o for o in por_jogo[(r["ano"], r["Jogo"])] if o["Equipa"] != r["Equipa"]]
        r["xg_sofrido"] = num(adv[0]["Golos esperados"]) if len(adv) == 1 else None
    por_ct = collections.defaultdict(list)
    for r in linhas:
        por_ct[(r["ano"], r["Equipa"])].append(r)
    for k in por_ct:
        por_ct[k].sort(key=lambda x: x["Data"][:10])
    return linhas, por_ct


def monta(js, receita):
    tipo = receita[0]
    if tipo == "media":
        v = [num(j[receita[1]]) for j in js]
        v = [x for x in v if x is not None]
        return sum(v) / len(v) if v else None
    a = [j[receita[1]] for j in js]
    b = [num(j[receita[2]]) for j in js]
    pares = [(x, y) for x, y in zip(a, b) if x is not None and y]
    return (sum(x for x, _ in pares) / sum(y for _, y in pares)) if pares else None


def main():
    dec = json.load(open(os.path.join(R, "A17_indicadores.json"), encoding="utf-8"))
    familias_dec = dec["familias"]
    ids = [i["id"] for f in familias_dec for i in f["indicadores"]]
    sinal = {i["id"]: i["sinal"] for f in familias_dec for i in f["indicadores"]}
    nome = {i["id"]: i["nome"] for f in familias_dec for i in f["indicadores"]}
    alvos_dec = dec["alvos"]
    alvo_sinal = {a["id"]: a["sinal"] for a in alvos_dec}
    alvo_nome = {a["id"]: a["nome"] for a in alvos_dec}

    # ---- a base do clube-temporada -----------------------------------------------------------
    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec = {(r["ano"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(DADOS, "serieb_clube_temporada.csv"),
                                        encoding="utf-8-sig"))}
    base = []
    for k, a in a01.items():
        if k[0] not in ANOS or k not in tec:
            continue
        t = tec[k]
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"],
             "fronteira": a["fronteira"] == "1",
             "pontos": num(a.get("pontos")), "tm_valor_total": num(t.get("tm_valor_total"))}
        for c in ids + [a["id"] for a in alvos_dec]:
            l[c] = num(t.get(c))
        base.append(l)
    faltam = {c: sum(1 for l in base if l[c] is None) for c in ids + [a["id"] for a in alvos_dec]}
    print(f"base: {len(base)} clube-temporadas · {len({l['clube'] for l in base})} clubes")
    print("buracos:", {k: v for k, v in faltam.items() if v} or "nenhum")
    base = [l for l in base if all(l[c] is not None for c in ids + [a["id"] for a in alvos_dec])]

    percentil_no_ano(base, ids + [a["id"] for a in alvos_dec] + ["tm_valor_total"])
    familias = [(f["id"], [i["id"] for i in f["indicadores"]]) for f in familias_dec]
    alvos = [(a["id"], pct(a["id"]), a["sinal"]) for a in alvos_dec]
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]

    res = correlacionar_por_clube(base, familias, alvos, filtros, RNG, lambda i: sinal[i],
                                  reps=REPS)

    # ---- a porta do eixo: preditor do 1º turno × alvo do 2º, com parcial no alvo do 1º --------
    _, por_ct = jogos()
    reg = []
    for (ano, clube), js in por_ct.items():
        a, b = js[:p64.TURNO], js[p64.TURNO:]
        if len(a) < 15 or len(b) < 15:
            continue
        l = {"temporada": ano, "clube": clube}
        for i, receita in POR_JOGO.items():
            l[i] = monta(a, receita)
        for alvo, receita in ALVO_POR_JOGO.items():
            l[f"{alvo}_1t"] = monta(a, receita)
            l[f"{alvo}_2t"] = monta(b, receita)
        reg.append(l)
    campos = [i for i in POR_JOGO] + [f"{a}_{t}" for a in ALVO_POR_JOGO for t in ("1t", "2t")]
    reg = [l for l in reg if all(l[c] is not None for c in campos)]
    percentil_no_ano(reg, campos)
    porta = {}
    for alvo in ALVO_POR_JOGO:
        for i in POR_JOGO:
            x = [l[pct(i)] * sinal[i] for l in reg]
            y = [l[pct(f"{alvo}_2t")] * alvo_sinal[alvo] for l in reg]
            z = [l[pct(f"{alvo}_1t")] * alvo_sinal[alvo] for l in reg]
            rho, p = p64.parcial(x, y, z, len(reg))
            porta[f"{alvo}|{i}"] = {"parcial": round(rho, 3), "p": round(p, 5), "n": len(reg),
                                    "passa": bool(p < 0.05 and rho > 0)}
    print(f"porta do eixo: {len(reg)} clube-temporadas com os dois turnos completos")

    for it in res:
        it["nome"] = nome[it["indicador"]]
        it["alvo_nome"] = alvo_nome[it["comparacao"]]
        pt = porta.get(f"{it['comparacao']}|{it['indicador']}")
        it["porta_parcial"] = (pt or {}).get("parcial")
        it["porta_p"] = (pt or {}).get("p")
        it["porta_passa"] = (pt or {}).get("passa")
        it["selo"] = ("firme" if it["q"] < 0.05 and it["porta_passa"] else
                      ("provável" if it["q"] < 0.05 or it["porta_passa"] else
                       "sem diferença clara"))
    with open(os.path.join(R, "A17_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)

    # ---- o dinheiro ao lado, como ressalva e nunca como desconto ------------------------------
    from scipy import stats as _st
    dinheiro = {}
    for i in ids:
        rho, p = _st.spearmanr([l[pct(i)] * sinal[i] for l in base],
                               [l[pct("tm_valor_total")] for l in base])
        dinheiro[i] = {"rho": round(float(rho), 3), "p": round(float(p), 5)}

    # ---- a leitura do JOGO: dentro do clube-temporada e do mando ------------------------------
    linhas_jogo = []
    for (ano, clube), js in por_ct.items():
        for j in js:
            l = {"temporada": ano, "clube": clube, "mando": (j.get("mando") or "").strip()}
            for i, receita in POR_JOGO.items():
                l[i] = monta([j], receita)
            for alvo, receita in ALVO_POR_JOGO.items():
                l[alvo] = monta([j], receita)
            linhas_jogo.append(l)
    campos_j = ids + [a["id"] for a in alvos_dec]
    linhas_jogo = [l for l in linhas_jogo if all(l.get(c) is not None for c in campos_j)]
    percentil_no_ano(linhas_jogo, campos_j)
    centrar_no_clube(linhas_jogo, campos_j)
    jogo_res = []
    for alvo in ALVO_POR_JOGO:
        for i in ids:
            x_campo, y_campo = pct(i) + "::dc", pct(alvo) + "::dc"
            ls = [l for l in linhas_jogo if l.get(x_campo) is not None and l.get(y_campo) is not None]
            rho, _ = _st.spearmanr([l[x_campo] * sinal[i] for l in ls],
                                   [l[y_campo] * alvo_sinal[alvo] for l in ls])
            am = _amostras_de_rho_por_clube(ls, x_campo, y_campo, sinal[i], alvo_sinal[alvo],
                                            RNG, 2000)
            ic, p = ic_e_p(am, 2000)
            jogo_res.append({"alvo": alvo, "alvo_nome": alvo_nome[alvo], "indicador": i,
                             "nome": nome[i], "unidade": "clube-jogo",
                             "leitura": "dentro do clube-temporada e do mando",
                             "n": len(ls), "clubes": len({l["clube"] for l in ls}),
                             "rho": round(float(rho), 3), "ic95": ic, "p": round(float(p), 5),
                             "sem_q": "confirma direção; a correção está na tabela de "
                                      "clube-temporada (regra 7 do portão)"})
    with open(os.path.join(R, "A17_jogo.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(jogo_res[0]))
        w.writeheader(); w.writerows(jogo_res)

    # ---- o que sobreviveu ---------------------------------------------------------------------
    T = {(it["fronteira"], it["comparacao"], it["indicador"]): it for it in res}
    J = {(x["alvo"], x["indicador"]): x for x in jogo_res}
    sobrevivem = []
    for alvo in ALVO_POR_JOGO:
        for i in ids:
            c, s = T.get(("com", alvo, i)), T.get(("sem", alvo, i))
            if not c or not s or c["q"] >= 0.05 or s["q"] >= 0.05:
                continue
            j = J[(alvo, i)]
            sobrevivem.append({"alvo": alvo, "indicador": i, "nome": nome[i],
                               "familia": c["familia"], "rho_com": c["d"], "rho_sem": s["d"],
                               "q_com": c["q"], "q_sem": s["q"], "ic_com": c["ic95_d"],
                               "porta": c["porta_parcial"], "porta_p": c["porta_p"],
                               "porta_passa": c["porta_passa"], "selo": c["selo"],
                               "rho_no_jogo": j["rho"], "ic_no_jogo": j["ic95"],
                               "rho_com_dinheiro": dinheiro[i]["rho"]})

    resumo = {"gerado_em": GERADO_EM, "unidade": "clube-temporada",
              "n": {"total": len(base), "clubes": len({l["clube"] for l in base}),
                    "sem_fronteira": sum(1 for l in base if not l["fronteira"]),
                    "porta_n": len(reg), "jogos": len(linhas_jogo)},
              "sobrevivem_nos_dois_cortes": sobrevivem,
              "porta_do_eixo": {"definicao": "preditor nas 19 primeiras rodadas × ALVO nas 19 "
                                             "últimas, com parcial dada ao alvo do 1º turno; a "
                                             "receita da §6.4 com o alvo trocado",
                                "quantos_passam": sum(1 for v in porta.values() if v["passa"]),
                                "de": len(porta), "por_par": porta},
              "preditor_x_dinheiro": dinheiro,
              "leitura_do_jogo": {"o_que_e": dec["segunda_leitura"]["o_que_e"],
                                  "onde": "A17_jogo.csv", "sem_q": dec["segunda_leitura"]["por_que_sem_q"]}}
    json.dump(resumo, open(os.path.join(R, "A17_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    for alvo in ALVO_POR_JOGO:
        print(f"\n{'='*112}\nALVO: {alvo_nome[alvo]}\n{'='*112}")
        print(f"{'família':13s} {'preditor':30s} {'rho':>6s} {'rho sem':>8s} {'q':>8s} "
              f"{'porta':>7s} {'no jogo':>8s} {'$':>6s}  selo")
        linhas_ord = sorted([it for it in res if it["comparacao"] == alvo
                             and it["fronteira"] == "com"], key=lambda it: -abs(it["d"]))
        for it in linhas_ord:
            s = T[("sem", alvo, it["indicador"])]
            j = J[(alvo, it["indicador"])]
            print(f"{it['familia']:13s} {it['nome'][:30]:30s} {it['d']:+6.2f} {s['d']:+8.2f} "
                  f"{it['q']:8.4f} {(it['porta_parcial'] if it['porta_parcial'] is not None else 0):+7.2f} "
                  f"{j['rho']:+8.2f} {dinheiro[it['indicador']]['rho']:+6.2f}  {it['selo']}")
    print(f"\nsobrevivem nos dois cortes: {len(sobrevivem)} de {len(res) // 2}")
    print(f"passam na porta do eixo: {resumo['porta_do_eixo']['quantos_passam']} de {len(porta)}")

    numeros = {"n": len(base), "n_clubes": resumo["n"]["clubes"],
               "n_sem": resumo["n"]["sem_fronteira"], "n_porta": len(reg),
               "n_jogos": len(linhas_jogo), "n_preditores": len(ids),
               "n_familias": len(familias), "n_alvos": len(alvos_dec),
               "sobrevivem": len(sobrevivem), "testes": len(res) // 2,
               "porta_passam": resumo["porta_do_eixo"]["quantos_passam"],
               "porta_de": len(porta)}
    for it in res:
        if it["fronteira"] != "com":
            continue
        k = f"{it['comparacao']}_{it['indicador']}"
        numeros[f"rho_{k}"] = br_sinal(it["d"], 2)
        numeros[f"q_{k}"] = br(it["q"], 4)
        numeros[f"ic_{k}"] = ic_br(it["ic95_d"])
        numeros[f"graf_rho_{k}"] = it["d"]
    for it in res:
        if it["fronteira"] != "sem":
            continue
        numeros[f"rhosem_{it['comparacao']}_{it['indicador']}"] = br_sinal(it["d"], 2)
        numeros[f"qsem_{it['comparacao']}_{it['indicador']}"] = br(it["q"], 4)
        numeros[f"graf_rhosem_{it['comparacao']}_{it['indicador']}"] = it["d"]
    for x in jogo_res:
        numeros[f"jogo_{x['alvo']}_{x['indicador']}"] = br_sinal(x["rho"], 2)
        numeros[f"graf_jogo_{x['alvo']}_{x['indicador']}"] = x["rho"]
    for k, v in porta.items():
        a, i = k.split("|")
        numeros[f"porta_{a}_{i}"] = br_sinal(v["parcial"], 3)
        numeros[f"portap_{a}_{i}"] = br(v["p"], 4)
    for i, v in dinheiro.items():
        numeros[f"dinheiro_{i}"] = br_sinal(v["rho"], 2)
    json.dump({"gerado_por": "scripts/A17.py", "gerado_em": GERADO_EM,
               "numeros": dict(sorted(numeros.items()))},
              open(os.path.join(R, "A17_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n{len(numeros)} marcadores em A17_numeros.json")


if __name__ == "__main__":
    main()
