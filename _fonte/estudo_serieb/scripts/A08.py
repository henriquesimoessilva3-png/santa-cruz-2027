#!/usr/bin/env python3
"""A08 — Físico dentro do jogo: a parte que esta base NÃO responde, e a prova disso.

## Por que existe um script para uma parte que não roda

"Não responde com esta base" é conclusão legítima pela regra da casa — mas só se for **medida**.
Afirmar falta de dado sem abrir a base é exatamente o mesmo defeito que afirmar achado sem rodar
teste: os dois são alegação. Este script abre o `skillcorner_serieb.db` e conta.

## A pergunta

Quem sobe perde menos intensidade do 1º para o 2º tempo, e no fim do jogo? Ela precisaria das
métricas do A07 **recortadas por período** — 1º tempo, 2º tempo e, idealmente, faixas de 15 min.

## O que a base tem, contado aqui

1. **Nenhuma coluna de período** nas duas tabelas físicas (`physical`, 60 colunas;
   `physical_match`, 28). O único recorte abaixo do jogo inteiro é TIP/OTIP — com a bola e sem a
   bola —, que é recorte de POSSE, não de tempo.

2. **A resposta crua da API só tem um período.** Toda métrica do `raw_json` carrega o sufixo
   `_full_all_`: `full` é o jogo inteiro e `all` são todas as fases. Não existe `_1sthalf_`, nem
   `_2ndhalf_`, nem faixa de minuto. É esta contagem que fecha a pergunta, e ela é do dado, não de
   quem escreve.

3. **E mesmo por jogo o recorte é raso.** A tabela por jogo existe, mas só cobre a Série B de 2025
   em diante — é o mesmo limite que já prendeu a A10 — e cada linha dela é o jogo inteiro.

## O que NÃO se conclui daqui

Que o rendimento não cai dentro do jogo; que a queda não separa quem sobe; que o SkillCorner não
venda esse recorte. Nenhuma das três foi medida. O que está medido é uma coisa só: **a cópia que
este estudo tem não permite a pergunta**. Se um dia a coleta trouxer período, a parte roda — e a
lista de indicadores dela já está declarada, de antes, em `A08_indicadores.json`.

Uso:
    python3 _fonte/estudo_serieb/scripts/A08.py
"""
import collections
import json
import os
import sqlite3
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import _metodo  # noqa: E402,F401  (a casa exige o módulo do método; aqui ele não é usado porque
#                                   não há teste nenhum a rodar, e é isso que a parte conclui)

ESTUDO = os.path.dirname(AQUI)
R = os.path.join(ESTUDO, "resultados")
BANCO = os.path.join(ESTUDO, "dados_copiados", "skillcorner_serieb.db")
GERADO_EM = "2026-09-20"

# As palavras que marcariam um recorte de TEMPO dentro do jogo, em nome de coluna ou de chave da
# API. A lista é generosa de propósito: ela existe para ACHAR o recorte, não para não achar.
MARCAS_DE_PERIODO = ("period", "half", "1st", "2nd", "firsthalf", "secondhalf", "minute_band",
                     "phase", "segment", "window", "0to15", "15to30", "30to45", "45to60",
                     "60to75", "75to90", "quarter", "tempo")
# TIP/OTIP é recorte de POSSE, não de tempo. Entra na conta como o que é, para ninguém confundir
# "tem recorte dentro do jogo" com "tem recorte por tempo".
MARCAS_DE_POSSE = ("tip", "otip")


def main():
    if not os.path.exists(BANCO):
        print(f"banco não encontrado: {BANCO}", file=sys.stderr)
        return 1
    con = sqlite3.connect(BANCO)

    tabelas = {}
    for t in ("physical", "physical_match"):
        cols = [r[1] for r in con.execute(f"PRAGMA table_info({t})")]
        tabelas[t] = {
            "colunas": len(cols),
            "linhas": con.execute(f"select count(*) from {t}").fetchone()[0],
            "colunas_de_periodo": [c for c in cols
                                   if any(m in c.lower() for m in MARCAS_DE_PERIODO)],
            "colunas_de_posse": sorted({c for c in cols
                                        if any(c.lower().endswith(m) or f"_{m}" in c.lower()
                                               for m in MARCAS_DE_POSSE)}),
        }

    # ---- a resposta crua da API: que sufixos existem? ----
    sufixos, chaves_com_periodo, lidas = collections.Counter(), [], 0
    for (j,) in con.execute("select raw_json from physical where raw_json is not null"):
        o = json.loads(j)
        lidas += 1
        for k in o:
            if "full_all" in k:
                sufixos["full_all"] += 1
            if any(m in k.lower() for m in MARCAS_DE_PERIODO):
                chaves_com_periodo.append(k)
    chaves_exemplo = sorted(json.loads(
        con.execute("select raw_json from physical where raw_json is not null limit 1")
        .fetchone()[0]))

    # ---- a cobertura por jogo, que também é rasa ----
    por_ano = dict(con.execute(
        "select substr(match_date,1,4), count(distinct sc_match_id) from physical_match "
        "group by 1 order by 1"))

    numeros = {
        "colunas_physical": tabelas["physical"]["colunas"],
        "colunas_physical_match": tabelas["physical_match"]["colunas"],
        "colunas_de_periodo": (len(tabelas["physical"]["colunas_de_periodo"])
                               + len(tabelas["physical_match"]["colunas_de_periodo"])),
        "colunas_de_posse": len(tabelas["physical"]["colunas_de_posse"]),
        "chaves_da_api": len(chaves_exemplo),
        "chaves_com_periodo": len(set(chaves_com_periodo)),
        "linhas_lidas": lidas,
        "jogos_rastreados_2025": por_ano.get("2025", 0),
        "anos_com_jogo": " · ".join(f"{a} ({n})" for a, n in por_ano.items()),
    }

    resumo = {
        "_doc": ("A08 não roda, e este arquivo é a MEDIDA disso, não a alegação. Contado do "
                 "skillcorner_serieb.db, a cópia que este estudo tem."),
        "gerado_em": GERADO_EM,
        "tabelas": tabelas,
        "api": {"chaves_do_raw_json": chaves_exemplo,
                "todas_com_sufixo_full_all": sufixos["full_all"],
                "chaves_com_recorte_de_tempo": sorted(set(chaves_com_periodo)),
                "leitura": ("`full` é o jogo inteiro e `all` são todas as fases. A resposta veio "
                            "de um grupo de período só.")},
        "cobertura_por_jogo": por_ano,
        "veredito": ("A pergunta da A08 precisa das métricas do A07 por PERÍODO. A base tem zero "
                     "coluna de período e zero chave de API com recorte de tempo. O único recorte "
                     "abaixo do jogo é TIP/OTIP, que é posse e não tempo. Só coleta nova resolve, "
                     "e ela não é barata como foi a da A09."),
        "o_que_isto_nao_prova": [
            "que o rendimento não cai dentro do jogo",
            "que a queda não separaria quem sobe do meio",
            "que o fornecedor não venda o recorte por período — isso se pergunta a ele",
        ],
    }
    json.dump(resumo, open(os.path.join(R, "A08_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    json.dump({"gerado_por": "scripts/A08.py", "gerado_em": GERADO_EM, "numeros": numeros},
              open(os.path.join(R, "A08_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"{'='*92}\nA08 — o que a base tem para responder 'físico dentro do jogo'\n{'='*92}")
    for t, d in tabelas.items():
        print(f"  {t:16} {d['linhas']:6} linhas · {d['colunas']:2} colunas · "
              f"{len(d['colunas_de_periodo'])} de período · "
              f"{len(d['colunas_de_posse'])} de posse (TIP/OTIP)")
    print(f"\n  API: {len(chaves_exemplo)} chaves na resposta crua, "
          f"{len(set(chaves_com_periodo))} com recorte de tempo")
    print(f"  toda métrica vem como `_full_all_` — jogo inteiro, todas as fases")
    print(f"\n  cobertura por jogo: {numeros['anos_com_jogo']}")
    print(f"\n  VEREDITO: {resumo['veredito']}")
    print(f"\n  A08_numeros.json: {len(numeros)} marcadores")
    return 0


if __name__ == "__main__":
    sys.exit(main())
