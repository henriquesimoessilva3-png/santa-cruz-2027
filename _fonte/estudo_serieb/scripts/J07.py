#!/usr/bin/env python3
"""J07 — os estrangeiros na Série B: quantos, de onde, quanto jogaram e como renderam.

**Descritivo por decisão do CLAUDE.md**: "Resultados de estrangeiros na própria B são descritivos:
liste os casos, sem aplicar o critério de conclusão." Aqui não há teste de hipótese nem BH.

## Quem é estrangeiro

Nacionalidade de `serieb_elencos.csv`. O campo traz a lista separada por " / " e a primeira é a
principal. **Quem tem "Brasil" em qualquer posição da lista conta como brasileiro** — são 166 casos
de "Brasil / Itália", 43 de "Brasil / Portugal" e outros: cidadania europeia de descendente, que não
ocupa vaga de estrangeiro. O ⚑ da tela marca naturalizados; aqui a dupla nacionalidade com Brasil é
tratada como brasileira e o número sai à parte.

## A liga de origem

`clube_anterior` dá o clube, não a liga. Sem uma tabela de clube → liga, a origem sai por
NACIONALIDADE, que é uma aproximação: um argentino pode vir de um clube brasileiro. Está marcado.

Uso:
    python3 _fonte/estudo_serieb/scripts/J07.py
"""
import collections
import csv
import json
import os
import re
import statistics as st
import unicodedata

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
ANOS = ["2022", "2023", "2024", "2025", "2026"]
FECHADAS = {"2022", "2023", "2024", "2025"}


def norm(t):
    t = unicodedata.normalize("NFD", str(t or ""))
    t = "".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9 ]", " ", t).strip()


def main():
    ponte = json.load(open(os.path.join(R, "T01_ponte_clubes.json"), encoding="utf-8"))
    faixa = {(r["temporada"], r["clube"]): r["faixa"]
             for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                          encoding="utf-8"))}
    # nacionalidade por (nome, ano, clube wyscout)
    nac, dupla = {}, {}
    with open(os.path.join(DADOS, "serieb_elencos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            wy = ponte.get(r["clube"], r["clube"])
            lista = [x.strip() for x in (r["nacionalidades"] or "").split("/") if x.strip()]
            if not lista:
                continue
            k = (norm(r["jogador"]), r["ano"], wy)
            nac[k] = lista
            dupla[k] = len(lista) > 1 and "Brasil" in lista
    # minutos, do J01
    linhas = []
    for r in csv.DictReader(open(os.path.join(R, "base_jogador_temporada.csv"), encoding="utf-8")):
        k = (norm(r["jogador"]), r["ano"], r["time"])
        ls = nac.get(k)
        try:
            mi = float(r["minutos"]); fat = float(r["fatia_pct"])
        except (TypeError, ValueError):
            continue
        linhas.append({"ano": r["ano"], "jogador": r["jogador"], "time": r["time"],
                       "grupo": r["grupo"], "idade": r["idade"], "minutos": mi, "fatia_pct": fat,
                       "faixa": faixa.get((r["ano"], r["time"])),
                       "nacionalidades": " / ".join(ls) if ls else None,
                       "estrangeiro": (None if not ls else int("Brasil" not in ls)),
                       "dupla_com_brasil": int(bool(dupla.get(k)))})
    com = [l for l in linhas if l["estrangeiro"] is not None]
    print(f"jogador-temporadas: {len(linhas)} · com nacionalidade: {len(com)} "
          f"({100*len(com)/len(linhas):.0f}%)")

    # ---- quantos, por temporada e por faixa ----
    por_ano = {}
    for ano in ANOS:
        g = [l for l in com if l["ano"] == ano]
        if not g:
            continue
        est = [l for l in g if l["estrangeiro"]]
        tot_min = sum(l["minutos"] for l in g)
        por_ano[ano] = {
            "jogadores": len(g), "estrangeiros": len(est),
            "pct_dos_jogadores": round(100 * len(est) / len(g), 1),
            "pct_dos_minutos": round(100 * sum(l["minutos"] for l in est) / tot_min, 1),
            "clubes_com_algum": len({l["time"] for l in est}),
            "dupla_com_brasil": sum(1 for l in g if l["dupla_com_brasil"]),
        }
    por_faixa = {}
    for fx in ("Sobe", "Trave", "Meio", "Cai"):
        g = [l for l in com if l["faixa"] == fx and l["ano"] in FECHADAS]
        if not g:
            continue
        est = [l for l in g if l["estrangeiro"]]
        por_faixa[fx] = {
            "jogadores": len(g), "estrangeiros": len(est),
            "pct_dos_minutos": round(100 * sum(l["minutos"] for l in est) /
                                     sum(l["minutos"] for l in g), 1),
            "estrangeiros_por_clube_temporada": round(
                len(est) / len({(l["ano"], l["time"]) for l in g}), 1)}

    # ---- de onde vêm ----
    origem = collections.Counter()
    for l in com:
        if l["estrangeiro"]:
            origem[l["nacionalidades"].split(" / ")[0]] += 1

    # ---- quanto jogaram, contra os brasileiros da mesma posição ----
    rend = {}
    for g in sorted({l["grupo"] for l in com if l["grupo"]}):
        e = [l["fatia_pct"] for l in com if l["grupo"] == g and l["estrangeiro"]]
        b = [l["fatia_pct"] for l in com if l["grupo"] == g and not l["estrangeiro"]]
        if len(e) >= 5:
            rend[g] = {"n_estrangeiros": len(e), "n_brasileiros": len(b),
                       "fatia_mediana_estrangeiro": round(st.median(e), 1),
                       "fatia_mediana_brasileiro": round(st.median(b), 1),
                       "pct_estrangeiros_com_fatia_alta": round(
                           100 * sum(1 for x in e if x >= 60) / len(e), 1),
                       "pct_brasileiros_com_fatia_alta": round(
                           100 * sum(1 for x in b if x >= 60) / len(b), 1)}

    # ---- permanência na temporada seguinte ----
    chaves = {(norm(l["jogador"]), l["ano"], l["time"]) for l in com}
    nomes_ano = collections.defaultdict(set)
    for l in com:
        nomes_ano[l["ano"]].add(norm(l["jogador"]))
    perm = {}
    for grupo, filtro in (("estrangeiro", lambda l: l["estrangeiro"]),
                          ("brasileiro", lambda l: not l["estrangeiro"])):
        fica = tot = 0
        for l in com:
            if l["ano"] == "2026" or not filtro(l):
                continue
            seg = str(int(l["ano"]) + 1)
            if seg not in nomes_ano:
                continue
            tot += 1
            fica += 1 if norm(l["jogador"]) in nomes_ano[seg] else 0
        perm[grupo] = {"n": tot, "ficou_na_serie_b_no_ano_seguinte_pct": round(100 * fica / tot, 1)}

    # primeira temporada na Série B
    primeira = {}
    vistos = collections.defaultdict(list)
    for l in sorted(com, key=lambda x: x["ano"]):
        vistos[norm(l["jogador"])].append(l)
    for grupo, filtro in (("estrangeiro", lambda l: l["estrangeiro"]),
                          ("brasileiro", lambda l: not l["estrangeiro"])):
        f = [v[0]["fatia_pct"] for v in vistos.values() if filtro(v[0])]
        primeira[grupo] = {"n": len(f), "fatia_mediana_na_primeira": round(st.median(f), 1)}

    json.dump({"por_temporada": por_ano, "por_faixa_do_time": por_faixa,
               "origem_por_nacionalidade": dict(origem.most_common()),
               "rendimento_por_posicao": rend, "permanencia": perm,
               "primeira_temporada": primeira,
               "cobertura": {"com_nacionalidade": len(com), "total": len(linhas),
                             "pct": round(100 * len(com) / len(linhas), 1)},
               "nota": "Descritivo por decisão do CLAUDE.md: sem teste de hipótese. Quem tem Brasil "
                       "na lista de nacionalidades conta como brasileiro."},
              open(os.path.join(R, "J07_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*84}\nESTRANGEIROS POR TEMPORADA\n{'='*84}")
    print(f"{'ano':6s} {'jogadores':>10s} {'estrang.':>9s} {'% dos jog.':>11s} {'% dos min.':>11s} "
          f"{'clubes':>7s} {'dupla c/ BR':>12s}")
    for ano, d in por_ano.items():
        print(f"{ano:6s} {d['jogadores']:10d} {d['estrangeiros']:9d} {d['pct_dos_jogadores']:10.1f}% "
              f"{d['pct_dos_minutos']:10.1f}% {d['clubes_com_algum']:7d} {d['dupla_com_brasil']:12d}")
    print(f"\n{'='*84}\nPOR FAIXA DO TIME (2022-2025)\n{'='*84}")
    for fx, d in por_faixa.items():
        print(f"  {fx:6s} {d['estrangeiros']:3d} estrangeiros · {d['estrangeiros_por_clube_temporada']:4.1f} "
              f"por clube-temporada · {d['pct_dos_minutos']:5.1f}% dos minutos")
    print(f"\n{'='*84}\nDE ONDE VÊM\n{'='*84}")
    for k, v in list(origem.most_common(12)):
        print(f"  {v:4d}  {k}")
    print(f"\n{'='*84}\nQUANTO JOGARAM, CONTRA OS BRASILEIROS DA MESMA POSIÇÃO\n{'='*84}")
    print(f"{'posição':12s} {'n est.':>7s} {'fatia est.':>11s} {'fatia bras.':>12s} "
          f"{'% est. alta':>12s} {'% bras. alta':>13s}")
    for g, d in rend.items():
        print(f"{g:12s} {d['n_estrangeiros']:7d} {d['fatia_mediana_estrangeiro']:10.1f}% "
              f"{d['fatia_mediana_brasileiro']:11.1f}% {d['pct_estrangeiros_com_fatia_alta']:11.1f}% "
              f"{d['pct_brasileiros_com_fatia_alta']:12.1f}%")
    print(f"\n{'='*84}\nPERMANÊNCIA E PRIMEIRA TEMPORADA\n{'='*84}")
    for k, v in perm.items():
        print(f"  {k:12s} fica na Série B no ano seguinte: {v['ficou_na_serie_b_no_ano_seguinte_pct']}% (n={v['n']})")
    for k, v in primeira.items():
        print(f"  {k:12s} fatia mediana na PRIMEIRA temporada: {v['fatia_mediana_na_primeira']}% (n={v['n']})")


if __name__ == "__main__":
    main()
