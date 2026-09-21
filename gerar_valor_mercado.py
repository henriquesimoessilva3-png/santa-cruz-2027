#!/usr/bin/env python3
"""Valor de mercado dos jogadores da Serie B, do Transfermarkt, para a tela.

Le `dados/serieb_elencos.csv` (coletado por coletar_serieb_transfermarkt.py) e escreve
`static/valor_mercado.js`, que o app e a aba Estudo carregam.

## Por que nao usar o `mv` que a base do app ja tem

Ele existe, vem da coluna "Market value" do Wyscout e tem dois problemas medidos aqui:

1. **Cobertura**: 258 dos 1.136 jogadores da Serie B, contra 488 de 637 no Transfermarkt de 2026.
2. **Data**: e o retrato do dia da exportacao do Wyscout. Nos 61 jogadores presentes nas duas
   fontes a razao mediana entre elas e 1,33 — nao e cambio (euro para real daria ~6), sao **datas
   diferentes** do mesmo numero em euro. O `gerar_prototipo.py` ja tinha trocado pelo Transfermarkt
   pelo mesmo motivo, e esta tela passa a fazer o mesmo.

## A MOEDA, que e onde da erro

O valor e **EURO**, como o Transfermarkt publica. A ficha do app imprimia `j.mv` com `brl()`, ou
seja, rotulava euro como real. Aqui tudo sai com `€` e o campo se chama `eur`, para ninguem somar
com salario, que e em R$.

## A comparacao entre clubes

O `por_clube` soma o elenco de cada clube da Serie B na temporada mais recente e ordena. Serve
para responder "com estes jogadores, em que posicao de valor o time ficaria". A ressalva vai junto
no arquivo e tem de chegar a tela: a cobertura nao e cheia, entao a soma de cada clube e um PISO,
e clube com mais fichas preenchidas parece mais caro. Por isso o arquivo publica tambem quantos
jogadores entraram na soma de cada um.

Uso:
    python3 gerar_valor_mercado.py
"""
import csv
import json
import os
import statistics as st
import sys
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
DADOS = os.path.join(AQUI, "dados")
ENTRADA = os.path.join(DADOS, "serieb_elencos.csv")
SAIDA_JS = os.path.join(AQUI, "static", "valor_mercado.js")
SAIDA_JSON = os.path.join(DADOS, "valor_mercado.json")


def normal(t):
    t = unicodedata.normalize("NFD", str(t or ""))
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return " ".join(t.lower().replace("-", " ").split())


def main():
    linhas = list(csv.DictReader(open(ENTRADA, encoding="utf-8")))
    col_ano = "﻿ano" if "﻿ano" in linhas[0] else "ano"
    anos = sorted({l[col_ano] for l in linhas})
    recente = anos[-1]
    print(f"temporadas no arquivo: {', '.join(anos)} · usando {recente}")

    do_ano = [l for l in linhas if l[col_ano] == recente]

    # ---- jogador -> valor. A chave e (nome, clube) normalizados, e o nome sozinho como
    # segunda tentativa: a tela tem o nome curto do Wyscout ("J. Cuenú") e o Transfermarkt
    # escreve outro. Nome sozinho SO e aceito quando ele for unico no ano — homonimo nao
    # e adivinhado, e os descartados sao contados.
    por_nome = {}
    for l in do_ano:
        v = (l["valor_eur"] or "").strip()
        if v in ("", "0"):
            continue
        por_nome.setdefault(normal(l["jogador"]), []).append(l)

    jogadores, ambiguos = {}, 0
    for l in do_ano:
        v = (l["valor_eur"] or "").strip()
        if v in ("", "0"):
            continue
        jogadores[f"{normal(l['jogador'])}|{normal(l['clube'])}"] = float(v)
    somente_nome = {}
    for nome, ls in por_nome.items():
        if len({normal(x["clube"]) for x in ls}) == 1:
            somente_nome[nome] = float(ls[0]["valor_eur"])
        else:
            ambiguos += 1

    # ---- clube -> soma do elenco ----
    por_clube = {}
    for l in do_ano:
        c = l["clube"]
        d = por_clube.setdefault(c, {"clube": c, "eur": 0.0, "com_valor": 0, "plantel": 0})
        d["plantel"] += 1
        v = (l["valor_eur"] or "").strip()
        if v not in ("", "0"):
            d["eur"] += float(v)
            d["com_valor"] += 1
    ordem = sorted(por_clube.values(), key=lambda d: -d["eur"])
    for i, d in enumerate(ordem, 1):
        d["posto"] = i
        d["cobertura_pct"] = round(100 * d["com_valor"] / d["plantel"], 1)

    vals = [float(l["valor_eur"]) for l in do_ano
            if (l["valor_eur"] or "").strip() not in ("", "0")]
    saida = {
        "_doc": ("Valor de mercado do Transfermarkt, em EURO. Nao somar com salario, que e em R$. "
                 "A soma de cada clube e um PISO: a cobertura nao e cheia e varia entre clubes."),
        "fonte": "Transfermarkt, via coletar_serieb_transfermarkt.py",
        "temporada": recente,
        "moeda": "EUR",
        "coletado_em": __import__("datetime").date.fromtimestamp(
            os.path.getmtime(ENTRADA)).isoformat(),
        "cobertura": {"jogadores": len(do_ano), "com_valor": len(vals),
                      "pct": round(100 * len(vals) / len(do_ano), 1),
                      "mediana_eur": st.median(vals) if vals else None,
                      "nomes_ambiguos_descartados": ambiguos},
        "por_clube": ordem,
        "jogadores": jogadores,
        "por_nome": somente_nome,
    }
    json.dump(saida, open(SAIDA_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    with open(SAIDA_JS, "w", encoding="utf-8") as fh:
        fh.write("/* GERADO POR gerar_valor_mercado.py - NAO EDITE A MAO.\n"
                 "   Valor de mercado do Transfermarkt, em EURO. */\n")
        fh.write("const VALOR_MERCADO = " + json.dumps(saida, ensure_ascii=False) + ";\n")

    print(f"cobertura: {len(vals)} de {len(do_ano)} ({saida['cobertura']['pct']}%) · "
          f"mediana € {st.median(vals):,.0f}")
    print(f"nomes ambiguos descartados: {ambiguos}")
    print(f"\nvalor de elenco, {recente} (€ mi · jogadores com valor de quantos):")
    for d in ordem:
        print(f"  {d['posto']:2}. {d['clube'][:26]:26} {d['eur']/1e6:6.1f}  "
              f"({d['com_valor']}/{d['plantel']})")
    print(f"\n{os.path.relpath(SAIDA_JS, AQUI)} e {os.path.relpath(SAIDA_JSON, AQUI)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
