#!/usr/bin/env python3
"""A11 — a intensidade vira ação e resultado?

Não é comparação de faixas: é relação. Spearman entre o esforço físico e a ação técnica que ele
deveria produzir, e depois entre o esforço e o resultado. Tudo no posto dentro da temporada, com
BH a 5% por família. Lista em `resultados/A11_indicadores.json`, fechada antes de rodar.

A tensão que motiva: o A07 mostrou que correr não separa quem sobe, mas a §7.3 mede a persistência
ano a ano e o físico é a coisa mais repetível depois do valor do elenco (0,722 contra 0,724). É um
traço estável do clube que não anda com o desfecho — A11 pergunta onde a corrida vai parar.

Uso:
    python3 _fonte/estudo_serieb/scripts/A11.py
"""
import collections
import csv
import json
import math
import os
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import bh, cohen_d, d_minimo, pct, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")


def main():
    dec = json.load(open(os.path.join(R, "A11_indicadores.json"), encoding="utf-8"))
    anos = {str(a) for a in dec["recorte"]["temporadas"]}
    sinais = {k: v for k, v in dec["sinais"].items() if isinstance(v, int)}
    usados = sorted({c for f in dec["familias"] for p in f["pares"] for c in p}
                    | set(dec["estratificacao"]["indice_tecnico"]))
    usados = [c for c in usados if c != "dist_g4"]

    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            tec[(r["ano"], r["clube"])] = r

    base = []
    for k, a in a01.items():
        if k[0] not in anos or k not in tec:
            continue
        t = tec[k]
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"],
             "trave": a["trave"] == "1", "fronteira": a["fronteira"] == "1",
             "dist_g4": int(a["dist_g4"])}
        ok = True
        for c in usados:
            v = t.get(c)
            try:
                l[c] = float(v) if v not in (None, "", "nan") else None
            except ValueError:
                l[c] = None
            ok = ok and l[c] is not None
        if ok:
            base.append(l)
    print(f"base: {len(base)} clube-temporadas · {len({l['clube'] for l in base})} clubes")

    percentil_no_ano(base, usados + ["dist_g4"])

    # ---------- as correlações declaradas ----------
    linhas = []
    for fam in dec["familias"]:
        ps, itens = [], []
        for x, y in fam["pares"]:
            a = [l[pct(x)] for l in base]
            b = [l[pct(y)] for l in base]
            rho, p = stats.spearmanr(a, b)
            s = sinais.get(y, 1)
            n = len(a)
            z, se = 0.5 * math.log((1 + rho) / (1 - rho)), 1 / math.sqrt(n - 3)
            itens.append({"familia": fam["id"], "esforco": x, "efeito": y,
                          "rho": round(float(rho), 3),
                          "rho_alinhado": round(float(rho) * s, 3),
                          "ic95": [round(math.tanh(z - 1.96 * se), 2),
                                   round(math.tanh(z + 1.96 * se), 2)],
                          "p": round(float(p), 5), "n": n,
                          "sinal_esperado": "negativo" if s == -1 else "positivo"})
            ps.append(float(p))
        for it, q in zip(itens, bh(ps)):
            it["q"] = round(q, 5)
            it["selo"] = ("firme" if q < 0.05 else
                          ("pode ser sorte" if it["p"] < 0.05 else "sem relação clara"))
            it["vai_no_sentido_esperado"] = it["rho_alinhado"] > 0
        linhas += itens

    with open(os.path.join(R, "A11_correlacoes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(linhas[0]))
        w.writeheader(); w.writerows(linhas)

    # ---------- o físico dentro de nível técnico parecido ----------
    inv = {"dist_remate", "xg_por_remate_contra"}
    for l in base:
        vs = [(100 - l[pct(c)]) if c in inv else l[pct(c)]
              for c in dec["estratificacao"]["indice_tecnico"]]
        l["indice_tecnico"] = sum(vs) / len(vs)
    ordenados = sorted(base, key=lambda l: l["indice_tecnico"])
    corte = len(ordenados) // 3
    for i, l in enumerate(ordenados):
        l["faixa_tecnica"] = "baixa" if i < corte else ("alta" if i >= 2 * corte else "média")

    fis = ["fis_distance_p90", "fis_hi_distance_p90", "fis_sprint_distance_p90",
           "fis_m_per_min_otip", "fis_m_per_min_tip"]
    estrat = []
    for ft in ("baixa", "média", "alta"):
        g = [l for l in base if l["faixa_tecnica"] == ft]
        sobe = [l for l in g if l["faixa"] == "Sobe"]
        meio = [l for l in g if l["faixa"] == "Meio"]
        ps, itens = [], []
        for c in fis:
            if len(sobe) < 4 or len(meio) < 4:
                continue
            a = [l[pct(c)] for l in sobe]; b = [l[pct(c)] for l in meio]
            _, p = stats.ttest_ind(a, b, equal_var=False)
            itens.append({"faixa_tecnica": ft, "indicador": c, "n_sobe": len(sobe),
                          "n_meio": len(meio), "d": round(cohen_d(a, b), 3),
                          "p": round(float(p), 5), "d_minimo_80": d_minimo(len(sobe), len(meio))})
            ps.append(float(p))
        for it, q in zip(itens, bh(ps) if ps else []):
            it["q"] = round(q, 5)
            it["selo"] = "firme" if q < 0.05 else ("pode ser sorte" if it["p"] < 0.05 else "sem diferença clara")
        estrat += itens
    if estrat:
        with open(os.path.join(R, "A11_estratificado.csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(estrat[0]))
            w.writeheader(); w.writerows(estrat)

    firmes = [l for l in linhas if l["selo"] == "firme"]
    json.dump({"n": len(base), "correlacoes": len(linhas), "firmes": len(firmes),
               "no_sentido_esperado": sum(1 for l in firmes if l["vai_no_sentido_esperado"]),
               "por_familia": {f["id"]: sum(1 for l in firmes if l["familia"] == f["id"])
                               for f in dec["familias"]},
               "estratificacao": {ft: {"n_sobe": next((e["n_sobe"] for e in estrat
                                                       if e["faixa_tecnica"] == ft), 0),
                                       "n_meio": next((e["n_meio"] for e in estrat
                                                       if e["faixa_tecnica"] == ft), 0),
                                       "firmes": sum(1 for e in estrat
                                                     if e["faixa_tecnica"] == ft and e["selo"] == "firme")}
                                 for ft in ("baixa", "média", "alta")},
               "persistencia_ja_medida_pela_prototipo": {
                   "fis_distance_p90": 0.722, "fis_m_per_min": 0.722, "tm_valor_total": 0.724,
                   "fis_psv99_top5": 0.377, "posse": 0.272, "xg_por_remate_contra": 0.214,
                   "xg": 0.144, "ppda": 0.129, "recuperacoes": 0.067,
                   "fonte": "ESPECIFICACAO.md §7.3, 36 pares ano a ano"}},
              open(os.path.join(R, "A11_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*94}\nA CORRIDA VIRA AÇÃO? (Spearman no posto dentro do ano, n={len(base)})\n{'='*94}")
    print(f"{'família':10s} {'esforço':30s} {'efeito':22s} {'rho':>6s} {'IC95':>14s} {'q':>8s}  selo")
    for l in linhas:
        print(f"{l['familia']:10s} {l['esforco'][:30]:30s} {l['efeito'][:22]:22s} {l['rho']:+6.2f} "
              f"[{l['ic95'][0]:+5.2f},{l['ic95'][1]:+5.2f}] {l['q']:8.4f}  {l['selo']}"
              + ("" if l["vai_no_sentido_esperado"] or l["selo"] == "sem relação clara"
                 else "  ⚠ SENTIDO CONTRÁRIO"))

    print(f"\n{'='*94}\nO FÍSICO DENTRO DE NÍVEL TÉCNICO PARECIDO\n{'='*94}")
    print(f"{'nível':7s} {'indicador':28s} {'n'"":>7s} {'d':>6s} {'q':>8s} {'dmin':>5s}  selo")
    for e in estrat:
        print(f"{e['faixa_tecnica']:7s} {e['indicador'][:28]:28s} {f'{e[chr(110)+chr(95)+chr(115)+chr(111)+chr(98)+chr(101)]}x{e['n_meio']}':>7s} "
              f"{e['d']:+6.2f} {e['q']:8.4f} {e['d_minimo_80']:5.2f}  {e['selo']}")


if __name__ == "__main__":
    main()
