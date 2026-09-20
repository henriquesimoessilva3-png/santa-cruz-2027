#!/usr/bin/env python3
"""Escreve static/estudo_serieb_dados.js — o Estudo Serie B do jeito que a aba le.

No molde do `gerar_bola_parada_js.py`: o dado entra por uma tag `<script>` antes do `app.js`,
para a aba nao abrir vazia com o Flask fora do ar. O `publicar_site.py` copia a pasta `static/`
inteira, mas de `dados/` so leva seis arquivos nomeados e nada de `_fonte/` — por isso TODO o
dado da aba tem de morar aqui dentro, e nao num JSON solto.

Entrada: `_fonte/estudo_serieb/resultados/<ID>.json`, um por parte respondida.
Saida:   `static/estudo_serieb_dados.js`.

## O roteiro

A aba existe desde antes das respostas: ela mostra as 29 perguntas do estudo com o status de
cada uma. Esse roteiro e espelho do `_fonte/estudo_serieb/CLAUDE.md` e vive aqui embaixo, em
ROTEIRO. Parte que ganhar um `<ID>.json` sem estar no roteiro faz o gerador reclamar, em vez de
sumir da tela.

## Os numeros nao sao digitados

As conclusoes vem com marcador (`"a mediana e de {mediana_efetivos} treinadores"`) e os valores
medidos em `numeros`. Aqui os marcadores sao trocados pelos valores. Marcador sem valor PARA o
gerador: numero de conclusao nao se digita a mao (regra "Texto e numero" do CLAUDE.md).

Uso:
    python3 gerar_estudo_serieb_js.py
"""
import datetime as dt
import glob
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RESULTADOS = os.path.join(AQUI, "_fonte", "estudo_serieb", "resultados")
SAIDA = os.path.join(AQUI, "static", "estudo_serieb_dados.js")

# Espelho do _fonte/estudo_serieb/CLAUDE.md. (id, bloco, pergunta em uma linha)
# bloco: A = que time montar · T = que treinador buscar · J = quem contratar · E = tarefa de tela
ROTEIRO = [
    ("E00", "E", "Criar a aba Estudo Série B"),
    ("A01", "A", "Quantos pontos separam as faixas em cada temporada, e quão estável é esse corte?"),
    ("A02", "A", "A distância entre quem sobe e o meio está no que o time cria ou no que cede?"),
    ("A03", "A", "Quem sobe se diferencia ganhando fora ou dominando em casa?"),
    ("A04", "A", "Quanto da produção vem de bola parada, e isso separa quem sobe?"),
    ("A05", "A", "Existe estilo com bola que separa quem sobe, ou sobe-se com estilos opostos?"),
    ("A06", "A", "Quem sobe pressiona mais alto ou apenas cede menos finalização de qualidade?"),
    ("A07", "A", "Quem sobe corre mais no total ou corre mais forte?"),
    ("A08", "A", "Quem sobe perde menos intensidade do 1º para o 2º tempo e no fim do jogo?"),
    ("A09", "A", "Em que faixas de minutos cada faixa marca e sofre, e como reage ao placar?"),
    ("A10", "A", "Quem sobe sustenta a intensidade no returno e em sequências de jogos?"),
    ("A11", "A", "A intensidade vira ação e resultado?"),
    ("A12", "A", "Em quais réguas os promovidos se concentram, e o Cenário Barato se sustenta?"),
    ("A13", "A", "Quem cai já estava mal no 1º turno ou despencou no 2º?"),
    ("A14", "A", "Quais indicadores mais separam quem sobe, e onde 2026 está nessa régua?"),
    ("T01", "T", "Quem comandou cada time da Série B, em quais rodadas, de 2018 a 2026?"),
    ("T02", "T", "Quais treinadores mantêm seus times mais rodadas no G4?"),
    ("T03", "T", "Os times do treinador mostram os traços de quem sobe, em clubes diferentes?"),
    ("T04", "T", "Quais treinadores combinam resultado, perfil alinhado e consistência?"),
    ("J01", "J", "Quem tem minutagem alta e regular em cada posição, e quanto é lesão?"),
    ("J02", "J", "Quem sobe concentra os minutos em menos jogadores e mantém mais a base?"),
    ("J03", "J", "Como os titulares de quem sobe se comparam aos do meio, no técnico?"),
    ("J04", "J", "Em que posições os titulares de quem sobe se diferenciam fisicamente?"),
    ("J05", "J", "Quais 4 a 6 métricas definem o jogador ideal em cada posição?"),
    ("J06", "J", "Quais jogadores da Série B atendem o perfil de cada posição?"),
    ("J07", "J", "Quantos estrangeiros jogaram a Série B, e como renderam?"),
    ("J08", "J", "Como os números de um jogador de outra liga se traduzem para a Série B?"),
    ("J09", "J", "Quais estrangeiros atendem o perfil, depois do ajuste de liga?"),
    ("R01", "E", "Aposentar as abas Análise Série B e Protótipo"),
]
SECOES = {"A": "Que time montar", "T": "Que treinador buscar", "J": "Quem contratar",
          "E": "Tarefas da tela"}

# Tarefa de tela nao entrega <ID>.json (nao tem conclusao), entao o status dela nao sai dos
# arquivos: fica aqui, com a data em que foi feita.
TAREFAS_FEITAS = {"E00": "2026-09-17"}

CABECALHO = """/* GERADO POR gerar_estudo_serieb_js.py - NAO EDITE A MAO.

   O Estudo Serie B como a aba le: o roteiro das %d perguntas com o status de cada uma, e as
   conclusoes das partes ja respondidas, com os numeros ja trocados pelos valores medidos.

   Fonte: _fonte/estudo_serieb/resultados/*.json
   Para mudar um numero: mexa no <ID>.json da parte e rode `python3 gerar_estudo_serieb_js.py`.

   Gerado em: %s - partes respondidas: %s
*/
"""


def trocar(texto, numeros, onde, erros):
    """Troca {marcador} pelo valor medido. Marcador sem valor vira erro, nao vira texto."""
    def um(m):
        chave = m.group(1)
        if chave not in numeros:
            erros.append(f"{onde}: marcador {{{chave}}} não tem valor em `numeros`")
            return m.group(0)
        v = numeros[chave]
        if isinstance(v, float):
            return f"{v:.2f}".rstrip("0").rstrip(".").replace(".", ",")
        if isinstance(v, int):
            return f"{v:,}".replace(",", ".")
        return str(v)
    return re.sub(r"\{(\w+)\}", um, texto or "")


def resolver_grafico(g, numeros, onde, erros):
    """Resolve os marcadores do grafico em valores, como o trocar() faz com o texto.

    A aba nao calcula nada — nem o grafico. Se um marcador do grafico nao tiver valor,
    isso e erro aqui, do mesmo jeito que um marcador de texto sem valor: o gerador para.
    """
    if not g:
        return None

    def serie(s):
        if "valor" in s and s["valor"] is not None:
            return {"nome": s.get("nome"), "valor": s["valor"]}
        m = s.get("marcador")
        if m in numeros:
            return {"nome": s.get("nome"), "valor": numeros[m]}
        erros.append(f"{onde}: o grafico usa o marcador {{{m}}}, que nao esta em numeros")
        return {"nome": s.get("nome"), "valor": None}

    out = {"tipo": g.get("tipo"), "titulo": g.get("titulo"), "unidade": g.get("unidade")}
    if g.get("series"):
        out["series"] = [serie(s) for s in g["series"]]
    if g.get("cortes"):
        out["cortes"] = [{"rotulo": c.get("rotulo"),
                          "series": [serie(s) for s in c.get("series", [])]}
                         for c in g["cortes"]]
    if g.get("linhas"):
        ls = []
        for l in g["linhas"]:
            it = {"nome": l.get("nome")}
            for lado in ("turno", "returno"):
                m = l.get(lado)
                if m in numeros:
                    it[lado] = numeros[m]
                else:
                    erros.append(f"{onde}: o grafico usa {{{m}}}, que nao esta em numeros")
                    it[lado] = None
            ls.append(it)
        out["linhas"] = ls
    if g.get("barras"):
        out["barras"] = [serie(b) for b in g["barras"]]
    if g.get("linha_de_corte") is not None:
        out["linha_de_corte"] = g["linha_de_corte"]
    return out


def main():
    por_id, erros = {}, []
    for caminho in sorted(glob.glob(os.path.join(RESULTADOS, "*.json"))):
        nome = os.path.basename(caminho)
        if nome.startswith("_") or "_" in nome[:-5]:
            continue  # T01_clubes.json, T01_lacunas.json e afins nao sao entrega de parte
        with open(caminho, encoding="utf-8") as f:
            por_id[nome[:-5]] = json.load(f)

    ids_roteiro = {i for i, _, _ in ROTEIRO}
    for pid in por_id:
        if pid not in ids_roteiro:
            erros.append(f"{pid}.json existe mas {pid} não está no ROTEIRO deste gerador")

    partes, validadas, negativas = [], [], []
    for pid, bloco, pergunta in ROTEIRO:
        d = por_id.get(pid)
        concl = []
        for c in (d or {}).get("conclusoes", []):
            numeros = d.get("numeros", {})
            onde = f"{pid} / {c.get('id', '?')}"
            item = {
                "id": c.get("id"), "parte": pid, "bloco": bloco,
                "manchete": trocar(c.get("manchete"), numeros, onde, erros),
                "o_que_vimos": trocar(c.get("o_que_vimos"), numeros, onde, erros),
                "para_o_santa_cruz": trocar(c.get("para_o_santa_cruz"), numeros, onde, erros),
                "premissa": c.get("premissa"), "premissa_motivo": c.get("premissa_motivo"),
                "confianca": c.get("confianca"),
                "confianca_motivo": trocar(c.get("confianca_motivo"), numeros, onde, erros),
                "n": trocar(c.get("n"), numeros, onde, erros),
                "prova": c.get("prova"), "status": c.get("status", "rascunho"),
                "negativa": bool(c.get("negativa")),
                "grafico": resolver_grafico(c.get("grafico"), numeros, onde, erros),
            }
            concl.append(item)
            if item["negativa"]:
                negativas.append(item)
            elif item["status"] == "validada":
                validadas.append(item)
        if bloco == "E":
            status = "feita" if pid in TAREFAS_FEITAS else "pendente"
        elif not d:
            status = "pendente"
        elif any(c["status"] == "validada" for c in concl):
            status = "validada"
        else:
            status = "rascunho"
        partes.append({
            "id": pid, "bloco": bloco, "secao": SECOES[bloco], "pergunta": pergunta,
            "status": status, "titulo": (d or {}).get("titulo"),
            "tipo": (d or {}).get("tipo"), "conclusoes": concl,
            "em_aberto": (d or {}).get("em_aberto"),
            "feita_em": TAREFAS_FEITAS.get(pid),
            "prova_arquivos": (d or {}).get("gerado_por"),
        })

    if erros:
        print("O gerador PAROU. Conserte e rode de novo:", file=sys.stderr)
        for e in erros:
            print("  -", e, file=sys.stderr)
        sys.exit(1)

    dado = {
        "gerado_em": dt.date.today().isoformat(),
        "partes": partes,
        "validadas": validadas[:7],   # "O que decidimos" mostra ate 7
        "negativas": negativas,
        "contagem": {
            "total": sum(1 for p in partes if p["bloco"] != "E"),
            "pendente": sum(1 for p in partes if p["status"] == "pendente" and p["bloco"] != "E"),
            "rascunho": sum(1 for p in partes if p["status"] == "rascunho"),
            "validada": sum(1 for p in partes if p["status"] == "validada"),
        },
    }
    respondidas = ", ".join(sorted(por_id)) or "nenhuma ainda"
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, "w", encoding="utf-8") as f:
        f.write(CABECALHO % (len(ROTEIRO), dado["gerado_em"], respondidas))
        f.write("const ESTUDO_SERIEB = ")
        json.dump(dado, f, ensure_ascii=False, indent=1)
        f.write(";\n")
    c = dado["contagem"]
    print(f"{SAIDA}")
    print(f"  {c['total']} perguntas: {c['validada']} validadas, {c['rascunho']} em rascunho, "
          f"{c['pendente']} pendentes")
    print(f"  partes respondidas: {respondidas}")


if __name__ == "__main__":
    main()
