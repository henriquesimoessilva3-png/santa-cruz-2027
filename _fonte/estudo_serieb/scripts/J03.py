#!/usr/bin/env python3
"""J03 — o titular de quem sobe, no técnico.

Lista em `resultados/J03_indicadores.json`, fechada antes de rodar (com uma emenda datada: dois
nomes de coluna não existiam na base). Método: Welch no percentil, d de Cohen, BH por família.

## A armadilha da coluna de clube

`serieb_tecnico.csv` tem DUAS colunas de clube. `Equipa` traz o clube ATUAL do atleta e tem 531
valores distintos — está errada. A certa é `Equipa dentro de um período de tempo seleccionado`, com
42. Confundir as duas atribui o atleta ao clube errado em boa parte das linhas, em silêncio, porque
os dois nomes são de clube. (gerar_prototipo.py:528-540)

## Quem é titular

Por clube-temporada e por setor, os jogadores de mais minutos: 1 no gol, 2 na zaga, 2 no lateral,
2 no volante, 2 na meia, 2 no extremo e 2 no ataque. Com 900 minutos no mínimo, que é o corte que o
CLAUDE.md exige para entrar em percentil.

## O percentil

Dentro da mesma POSIÇÃO e TEMPORADA, entre TODOS os jogadores com 900+ minutos — não só entre
titulares. Assim o titular de quem sobe é comparado à liga, e não apenas aos seus pares.

Uso:
    python3 _fonte/estudo_serieb/scripts/J03.py
"""
import collections
import csv
import json
import os
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import bh, cohen_d, d_minimo  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
COL_CLUBE = "Equipa dentro de um período de tempo seleccionado"
MIN_MINUTOS = 900
QUANTOS = {"Goleiro": 1, "Zaga": 2, "Lateral": 2, "Volante": 2, "Meia": 2,
           "Extremo": 2, "Atacante": 2}


def main():
    dec = json.load(open(os.path.join(R, "J03_indicadores.json"), encoding="utf-8"))
    anos = {str(a) for a in dec["recorte"]["temporadas"]}
    setor_de = {p: s for s, ps in dec["setores"].items() for p in ps}
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]
    sinal = {i["id"]: i["sinal"] for i in inds}

    faixa = {(r["temporada"], r["clube"]): r["faixa"]
             for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                          encoding="utf-8"))}
    ponte = json.load(open(os.path.join(R, "T01_ponte_clubes.json"), encoding="utf-8"))

    linhas = []
    with open(os.path.join(DADOS, "serieb_tecnico.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r["ano"] not in anos:
                continue
            try:
                mi = float(r["Minutos jogados:"])
            except (TypeError, ValueError):
                continue
            s = setor_de.get(r["posicao_1"])
            if not s:
                continue
            clube = ponte.get(r[COL_CLUBE], r[COL_CLUBE])
            l = {"ano": r["ano"], "jogador": r["Jogador"], "clube": clube,
                 "posicao": r["posicao_1"], "setor": s, "minutos": mi,
                 "faixa": faixa.get((r["ano"], clube))}
            ok = True
            for i in inds:
                v = r.get(i["id"])
                try:
                    l[i["id"]] = float(v) if v not in (None, "", "nan") else None
                except ValueError:
                    l[i["id"]] = None
                ok = ok and l[i["id"]] is not None
            if ok:
                linhas.append(l)
    print(f"jogador-temporadas com todos os indicadores: {len(linhas)}")
    print(f"  com faixa do clube: {sum(1 for l in linhas if l['faixa'])}")
    print(f"  com {MIN_MINUTOS}+ minutos: {sum(1 for l in linhas if l['minutos'] >= MIN_MINUTOS)}")

    # percentil dentro de POSIÇÃO e TEMPORADA, entre quem tem 900+ minutos
    elegiveis = [l for l in linhas if l["minutos"] >= MIN_MINUTOS]
    por = collections.defaultdict(list)
    for l in elegiveis:
        por[(l["ano"], l["setor"])].append(l)
    for g in por.values():
        for i in inds:
            r = stats.rankdata([l[i["id"]] for l in g])
            for l, rr in zip(g, r):
                p = 100 * (rr - 1) / max(1, len(g) - 1)
                l[i["id"] + "::pct"] = p if i["sinal"] > 0 else 100 - p

    # titulares: os N de mais minutos por clube-temporada e setor
    por_ct = collections.defaultdict(list)
    for l in elegiveis:
        if l["faixa"]:
            por_ct[(l["ano"], l["clube"], l["setor"])].append(l)
    titulares = []
    for (ano, clube, setor), g in por_ct.items():
        g.sort(key=lambda l: -l["minutos"])
        for l in g[:QUANTOS[setor]]:
            l["titular"] = 1
            titulares.append(l)
    print(f"  titulares identificados: {len(titulares)}")
    cob = collections.Counter((l["setor"], l["faixa"]) for l in titulares)

    res = []
    for setor in QUANTOS:
        sobe = [l for l in titulares if l["setor"] == setor and l["faixa"] == "Sobe"]
        meio = [l for l in titulares if l["setor"] == setor and l["faixa"] == "Meio"]
        if len(sobe) < 4 or len(meio) < 8:
            print(f"  {setor}: n insuficiente ({len(sobe)} × {len(meio)}), fica de fora")
            continue
        for fam in dec["familias"]:
            ps, itens = [], []
            for i in fam["indicadores"]:
                k = i["id"] + "::pct"
                a = [l[k] for l in sobe]; b = [l[k] for l in meio]
                _, p = stats.ttest_ind(a, b, equal_var=False)
                itens.append({"setor": setor, "familia": fam["id"], "indicador": i["id"],
                              "n_sobe": len(a), "n_meio": len(b),
                              "pct_sobe": round(float(np.median(a)), 1),
                              "pct_meio": round(float(np.median(b)), 1),
                              "cru_sobe": round(float(np.median([l[i["id"]] for l in sobe])), 3),
                              "cru_meio": round(float(np.median([l[i["id"]] for l in meio])), 3),
                              "d": round(cohen_d(a, b), 3), "p": round(float(p), 5),
                              "d_minimo_80": d_minimo(len(a), len(b))})
                ps.append(float(p))
            for it, q in zip(itens, bh(ps)):
                it["q"] = round(q, 5)
                it["selo"] = ("firme" if q < 0.05 else
                              ("pode ser sorte" if it["p"] < 0.05 else "sem diferença clara"))
            res += itens

    with open(os.path.join(R, "J03_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)
    firmes = [r for r in res if r["selo"] == "firme"]
    json.dump({"n_titulares": len(titulares), "n_testes": len(res), "firmes": len(firmes),
               "firmes_detalhe": firmes,
               "por_setor": {s: {"firmes": sum(1 for r in firmes if r["setor"] == s),
                                 "testes": sum(1 for r in res if r["setor"] == s),
                                 "n_sobe": cob.get((s, "Sobe"), 0),
                                 "n_meio": cob.get((s, "Meio"), 0)}
                             for s in QUANTOS},
               "minimo_minutos": MIN_MINUTOS},
              open(os.path.join(R, "J03_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*100}\nO TITULAR DE QUEM SOBE × O TITULAR DO MEIO — só o que passou no BH\n{'='*100}")
    if not firmes:
        print("  nenhum indicador passou em nenhum setor.")
    for r in sorted(firmes, key=lambda x: (x["setor"], -abs(x["d"]))):
        print(f"  {r['setor']:9s} {r['indicador'][:34]:34s} {r['cru_sobe']:8.2f} vs {r['cru_meio']:8.2f} "
              f"· percentil {r['pct_sobe']:5.1f} vs {r['pct_meio']:5.1f} · d {r['d']:+5.2f} · q {r['q']:.4f}")
    print(f"\n{'='*100}\nPOR SETOR: quantos passaram, e com que amostra\n{'='*100}")
    j = json.load(open(os.path.join(R, "J03_resumo.json"), encoding="utf-8"))["por_setor"]
    for s, d in j.items():
        print(f"  {s:9s} {d['firmes']:2d} de {d['testes']:2d} · titulares: "
              f"{d['n_sobe']} de quem sobe, {d['n_meio']} do meio")


if __name__ == "__main__":
    main()
