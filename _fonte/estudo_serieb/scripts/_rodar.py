#!/usr/bin/env python3
"""Executor genérico de uma parte do Bloco A que usa colunas diretas.

Lê `resultados/<ID>_indicadores.json`, monta a base a partir de `A01_clube_temporada.csv` (faixa,
trave, fronteira) e `dados/serieb_clube_temporada.csv` (os indicadores), roda o método da casa
(`_metodo.py`) e grava `<ID>_testes.csv` e `<ID>_resumo.json`.

Serve a A05, A07 e A11, que só precisam de colunas que já existem. Parte que derive indicador novo
(A03 com mando, A04 com a base de bola parada) tem script próprio.

O resumo traz, além dos testes:
  - `quadro_por_faixa`: mínimo, mediana e máximo de cada indicador em cada faixa — é o que o A05
    pede para mostrar a DISPERSÃO dentro da faixa, em vez de só a mediana.
  - `promovidos`: os 16 clube-temporadas de quem subiu, um a um, no percentil de cada indicador.
  - `firme_nos_dois_cortes`: a regra corrigida (ver _metodo_fronteira.md).

Uso:
    python3 _fonte/estudo_serieb/scripts/_rodar.py A05
"""
import collections
import csv
import json
import os
import sys

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import comparar, d_minimo, pct, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")


def rodar(pid, semente=20260917):
    rng = np.random.default_rng(semente)
    dec = json.load(open(os.path.join(R, f"{pid}_indicadores.json"), encoding="utf-8"))
    anos = {str(a) for a in dec["recorte"]["temporadas"]}
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]
    sinal = {i["id"]: i["sinal"] for i in inds}
    nome = {i["id"]: i["nome"] for i in inds}
    placar = set(dec.get("lista_branca", {}).get("afetados", []))

    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        cols = None
        for r in csv.DictReader(f):
            cols = cols or set(r)
            tec[(r["ano"], r["clube"])] = r
    faltam = [i["id"] for i in inds if i["id"] not in cols]
    if faltam:
        raise SystemExit(f"{pid}: estas colunas não existem em serieb_clube_temporada.csv: {faltam}")

    base, buracos = [], collections.Counter()
    for k, a in a01.items():
        if k[0] not in anos or k not in tec:
            continue
        t = tec[k]
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"], "pos": int(a["pos"]),
             "pontos": int(a["pontos"]),
             "trave": a["trave"] == "1", "fronteira": a["fronteira"] == "1"}
        for i in inds:
            v = t.get(i["id"])
            try:
                l[i["id"]] = float(v) if v not in (None, "", "nan") else None
            except ValueError:
                l[i["id"]] = None
            if l[i["id"]] is None:
                buracos[i["id"]] += 1
        base.append(l)
    if buracos:
        print(f"  buracos: {dict(buracos)}")
    base = [l for l in base if all(l[i["id"]] is not None for i in inds)]
    print(f"  base: {len(base)} clube-temporadas · {len({l['clube'] for l in base})} clubes")

    percentil_no_ano(base, [i["id"] for i in inds])
    familias = [(f["id"], [i["id"] for i in f["indicadores"]]) for f in dec["familias"]]
    comps = {"SM": (lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
             "ST": (lambda l: l["faixa"] == "Sobe", lambda l: l["trave"]),
             "CM": (lambda l: l["faixa"] == "Cai", lambda l: l["faixa"] == "Meio")}
    comparacoes = [(c["id"], *comps[c["id"]]) for c in dec["comparacoes"] if c["id"] in comps]
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    res = comparar(base, familias, comparacoes, filtros, rng, lambda i: sinal[i])
    for it in res:
        it["nome"] = nome[it["indicador"]]
        it["placar_redescrito"] = it["indicador"] in placar

    with open(os.path.join(R, f"{pid}_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)

    por = collections.defaultdict(dict)
    for r in res:
        por[(r["comparacao"], r["indicador"])][r["fronteira"]] = r
    dois = {c["id"]: [i for (cp, i), v in por.items() if cp == c["id"]
                      and v.get("com", {}).get("selo") == "firme"
                      and v.get("sem", {}).get("selo") == "firme"]
            for c in dec["comparacoes"] if c["id"] in comps}

    # DISPERSÃO: mínimo, mediana e máximo dentro de cada faixa — a regra do A05.
    faixas = {"Sobe": lambda l: l["faixa"] == "Sobe", "Trave": lambda l: l["trave"],
              "Meio": lambda l: l["faixa"] == "Meio", "Cai": lambda l: l["faixa"] == "Cai"}
    disp = {}
    for i in inds:
        disp[i["id"]] = {}
        for fx, f in faixas.items():
            v = [l[i["id"]] for l in base if f(l)]
            disp[i["id"]][fx] = {"min": round(min(v), 3), "mediana": round(float(np.median(v)), 3),
                                 "max": round(max(v), 3),
                                 "amplitude": round(max(v) - min(v), 3)}
    # Os promovidos um a um, no percentil.
    promovidos = [{"temporada": l["temporada"], "clube": l["clube"], "pos": l["pos"],
                   **{i["id"]: round(l[pct(i["id"])]) for i in inds}}
                  for l in sorted(base, key=lambda l: (l["temporada"], l["pos"]))
                  if l["faixa"] == "Sobe"]

    json.dump({"parte": pid, "dispersao_por_faixa": disp, "promovidos": promovidos,
               "firme_nos_dois_cortes": dois,
               "poder_por_desenho": {"16x48": d_minimo(16, 48), "8x32": d_minimo(8, 32),
                                     "16x16": d_minimo(16, 16), "8x7": d_minimo(8, 7)},
               "n": {"total": len(base),
                     "sobe_sf": sum(1 for l in base if l["faixa"] == "Sobe" and not l["fronteira"]),
                     "meio_sf": sum(1 for l in base if l["faixa"] == "Meio" and not l["fronteira"]),
                     "cai_sf": sum(1 for l in base if l["faixa"] == "Cai" and not l["fronteira"])}},
              open(os.path.join(R, f"{pid}_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n  FIRME NOS DOIS CORTES:")
    for cp, lista in dois.items():
        marca = lambda i: i + (" ⚑placar" if i in placar else "")
        print(f"    {cp}: {[marca(i) for i in lista] or 'nenhum'}")
    print(f"\n{'fam':12s} {'indicador':20s} {'cmp':3s} {'ct':3s} {'A':>8s} {'B':>8s} {'d':>6s} {'q':>8s}  selo")
    for it in res:
        if it["fronteira"] != "sem":
            continue
        print(f"{it['familia']:12s} {it['indicador'][:20]:20s} {it['comparacao']:3s} sem "
              f"{it['cru_a']:8.2f} {it['cru_b']:8.2f} {it['d']:+6.2f} {it['q']:8.4f}  {it['selo']}")
    return res, dois


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("uso: python3 _rodar.py <ID>")
    print(f"=== {sys.argv[1]} ===")
    rodar(sys.argv[1])
