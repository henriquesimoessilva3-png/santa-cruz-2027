#!/usr/bin/env python3
"""J02 — rotação e continuidade: quem sobe concentra os minutos e mantém a base?

Lista em `resultados/J02_indicadores.json`, fechada antes de rodar. Método: `_metodo.py`.

## A ressalva que manda nesta parte

`share_11`, `conc_hhi`, `atletas_usados` e `nucleo_300` — a régua I inteira — estão na lista fixa de
**consequência do resultado** de `ranking_gaps.py`. O CLAUDE.md é explícito: nunca são tratadas como
característica. Time que vai bem repete o XI **porque** está ganhando. Elas entram como DESCRIÇÃO,
para responder "quem sobe concentra mais?", e nenhuma conclusão de característica se apoia nelas.

A **continuidade** é outra coisa e não está na lista: manter ou trocar o elenco é decisão tomada
ANTES da temporada. É ela que pode sustentar característica, e é por isso que o CLAUDE.md pede que
o J02 acrescente `no_clube_desde` e `clube_anterior`.

## Como a continuidade é medida

`no_clube_desde` vem do Transfermarkt como data. O jogador "já estava" se essa data é anterior a 1º
de janeiro da temporada. A fatia é calculada em MINUTOS (quem já estava e jogou) e também em
CONTAGEM de jogadores — a diferença entre as duas separa "manteve gente" de "manteve quem joga".

Uso:
    python3 _fonte/estudo_serieb/scripts/J02.py
"""
import collections
import csv
import json
import os
import re
import sys
import unicodedata

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import comparar, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
RNG = np.random.default_rng(20260917)


def norm(t):
    t = unicodedata.normalize("NFD", str(t or ""))
    t = "".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9 ]", " ", t).strip()


def main():
    dec = json.load(open(os.path.join(R, "J02_indicadores.json"), encoding="utf-8"))
    anos = {str(a) for a in dec["recorte"]["temporadas"]}
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]
    sinal = {i["id"]: i["sinal"] for i in inds}

    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec = {(r["ano"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(DADOS, "serieb_clube_temporada.csv"),
                                        encoding="utf-8-sig"))}
    # A ponte de CLUBE: os elencos são do Transfermarkt ("EC Juventude") e a minutagem é do
    # Wyscout ("Juventude"). Sem traduzir, a cobertura da ponte de jogador dá ZERO — foi o que
    # aconteceu na primeira versão. A ponte vem do T01, decidida pelas temporadas.
    ponte = json.load(open(os.path.join(R, "T01_ponte_clubes.json"), encoding="utf-8"))

    # quem já estava no clube, pelo Transfermarkt
    ja_estava = {}
    with open(os.path.join(DADOS, "serieb_elencos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            d = (r["no_clube_desde"] or "").strip()
            m = re.search(r"(\d{4})", d)
            if not m:
                continue
            wy = ponte.get(r["clube"], r["clube"])
            ja_estava[(norm(r["jogador"]), r["ano"], wy)] = int(m.group(1)) < int(r["ano"])
    # minutos por jogador, do J01
    mins = collections.defaultdict(list)
    for r in csv.DictReader(open(os.path.join(R, "base_jogador_temporada.csv"), encoding="utf-8")):
        try:
            mins[(r["ano"], r["time"])].append((norm(r["jogador"]), float(r["minutos"])))
        except (TypeError, ValueError):
            pass

    base, sem_cob = [], []
    for k, a in a01.items():
        if k[0] not in anos or k not in tec:
            continue
        t = tec[k]
        js = mins.get(k, [])
        if not js:
            continue
        # a ponte com os elencos: quantos minutos dá para classificar
        classificados = [(n, mi) for n, mi in js if (n, k[0], k[1]) in ja_estava]
        tot = sum(mi for _, mi in js)
        cob = sum(mi for _, mi in classificados) / tot if tot else 0
        if cob < 0.60:
            sem_cob.append({"temporada": k[0], "clube": k[1], "cobertura": round(cob, 2)})
            continue
        ficou_min = sum(mi for n, mi in classificados if ja_estava[(n, k[0], k[1])])
        base_min = sum(mi for _, mi in classificados)
        ficou_n = sum(1 for n, _ in classificados if ja_estava[(n, k[0], k[1])])
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"],
             "trave": a["trave"] == "1", "fronteira": a["fronteira"] == "1",
             "cobertura_da_ponte": round(cob, 3),
             "min_de_quem_ficou_pct": 100 * ficou_min / base_min,
             "min_de_contratado_pct": 100 * (base_min - ficou_min) / base_min,
             "jogadores_que_ficaram_pct": 100 * ficou_n / len(classificados)}
        ok = True
        for c in ("share_11", "conc_hhi", "atletas_usados", "nucleo_300"):
            v = t.get(c)
            try:
                l[c] = float(v) if v not in (None, "", "nan") else None
            except ValueError:
                l[c] = None
            ok = ok and l[c] is not None
        if ok:
            base.append(l)
    print(f"base: {len(base)} clube-temporadas · cobertura da ponte "
          f"{min(l['cobertura_da_ponte'] for l in base):.2f} a "
          f"{max(l['cobertura_da_ponte'] for l in base):.2f}")
    if sem_cob:
        print(f"  fora por cobertura < 60%: {len(sem_cob)} -> {sem_cob[:5]}")
    if not base:
        raise SystemExit("nenhum clube-temporada com cobertura suficiente — confira a ponte de clube")

    percentil_no_ano(base, [i["id"] for i in inds])
    familias = [(f["id"], [i["id"] for i in f["indicadores"]]) for f in dec["familias"]]
    comps = {"SM": (lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
             "ST": (lambda l: l["faixa"] == "Sobe", lambda l: l["trave"]),
             "CM": (lambda l: l["faixa"] == "Cai", lambda l: l["faixa"] == "Meio")}
    comparacoes = [(c["id"], *comps[c["id"]]) for c in dec["comparacoes"]]
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    res = comparar(base, familias, comparacoes, filtros, RNG, lambda i: sinal[i])
    for it in res:
        it["consequencia_do_resultado"] = it["indicador"] in {
            "share_11", "conc_hhi", "atletas_usados", "nucleo_300"}

    with open(os.path.join(R, "J02_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)
    por = collections.defaultdict(dict)
    for r in res:
        por[(r["comparacao"], r["indicador"])][r["fronteira"]] = r
    dois = {cp: [i for (c, i), v in por.items() if c == cp
                 and v.get("com", {}).get("selo") == "firme"
                 and v.get("sem", {}).get("selo") == "firme"] for cp in comps}

    faixas = {"Sobe": lambda l: l["faixa"] == "Sobe", "Trave": lambda l: l["trave"],
              "Meio": lambda l: l["faixa"] == "Meio", "Cai": lambda l: l["faixa"] == "Cai"}
    quadro = {fx: {i["id"]: round(float(np.median([l[i["id"]] for l in base if f(l)])), 1)
                   for i in inds} for fx, f in faixas.items()}
    json.dump({"quadro_por_faixa": quadro, "firme_nos_dois_cortes": dois,
               "fora_por_cobertura": sem_cob, "n": len(base)},
              open(os.path.join(R, "J02_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*94}\nCONCENTRAÇÃO E CONTINUIDADE, por faixa (medianas)\n{'='*94}")
    print(f"{'indicador':30s} {'Sobe':>8s} {'Trave':>8s} {'Meio':>8s} {'Cai':>8s}   firme nos dois?")
    for i in inds:
        marca = "⚑consequência" if i["id"] in {"share_11","conc_hhi","atletas_usados","nucleo_300"} else ""
        onde = [cp for cp in comps if i["id"] in dois[cp]]
        print(f"{i['id']:30s} {quadro['Sobe'][i['id']]:8.1f} {quadro['Trave'][i['id']]:8.1f} "
              f"{quadro['Meio'][i['id']]:8.1f} {quadro['Cai'][i['id']]:8.1f}   "
              f"{', '.join(onde) if onde else '—':12s} {marca}")
    print(f"\n{'='*94}\nDETALHE (sem fronteira)\n{'='*94}")
    for it in res:
        if it["fronteira"] != "sem":
            continue
        print(f"{it['familia']:14s} {it['indicador'][:28]:28s} {it['comparacao']:3s} "
              f"{it['cru_a']:8.2f} {it['cru_b']:8.2f} d {it['d']:+5.2f} q {it['q']:7.4f}  {it['selo']}"
              + ("  ⚑" if it["consequencia_do_resultado"] else ""))


if __name__ == "__main__":
    main()
