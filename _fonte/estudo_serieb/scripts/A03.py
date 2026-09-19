#!/usr/bin/env python3
"""A03 — casa e fora: quem sobe se diferencia ganhando fora ou dominando em casa?

Lista: `resultados/A03_indicadores.json`, fechada antes de rodar (12 indicadores, 3 famílias,
3 comparações). Método: `scripts/_metodo.py`.

## Pontos por mando são "o placar redescrito"

`pontos_casa` e `pontos_fora` estão literalmente na lista branca da §6: nunca entram em eixo,
agrupamento ou score. Entram aqui como a especificação manda — **mostrar e desqualificar**: medem o
tamanho da diferença e respondem "quem cai perde pontos onde?", mas nenhuma conclusão sobre
característica se apoia neles. Quem carrega a análise é o **xG por mando** e o **duelo defensivo por
mando**, que não estão na lista.

## Por que o duelo defensivo entra aqui

A06 achou o duelo defensivo como o maior separador do estudo. Testá-lo por mando responde se aquilo
é traço do time ou efeito de jogar em casa. É indicador novo nesta parte, e por isso foi declarado
antes de rodar.

## Público

O CLAUDE.md manda sinalizar temporada sem público em qualquer leitura de casa e fora. O recorte aqui
é 2022–2025, todo com público: a regra não morde. Ela morde na segunda parte (2018–2021).

Uso:
    python3 _fonte/estudo_serieb/scripts/A03.py
"""
import collections
import csv
import json
import math
import os
import re
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import comparar, d_minimo, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
RNG = np.random.default_rng(20260917)
ANOS = {"2022", "2023", "2024", "2025"}
PONTOS = {"V": 3, "E": 1, "D": 0}


def jogos():
    linhas = []
    with open(os.path.join(DADOS, "serieb_jogos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r.get("Competição") != "Brazil. Serie B":
                continue
            m = re.match(r"(\d{4})-\d{2}-\d{2}", r["Data"] or "")
            if not m or m.group(1) not in ANOS:
                continue
            def num(c):
                try:
                    return float(r[c])
                except (TypeError, ValueError, KeyError):
                    return None
            linhas.append({"ano": m.group(1), "data": r["Data"][:10], "clube": r["Equipa"],
                           "adv": r["adversario"], "mando": r["mando"],
                           "pts": PONTOS.get(r["resultado"], 0),
                           "xg": num("Golos esperados"),
                           "dd": num("Duelos defensivos ganhos, %")})
    idx = {(l["ano"], l["data"], l["clube"]): l for l in linhas}
    for l in linhas:
        o = idx.get((l["ano"], l["data"], l["adv"]))
        l["xgc"] = o["xg"] if o else None
    return linhas


def media(js, campo):
    v = [j[campo] for j in js if j[campo] is not None]
    return sum(v) / len(v) if v else None


def main():
    dec = json.load(open(os.path.join(R, "A03_indicadores.json"), encoding="utf-8"))
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]
    sinal = {i["id"]: i["sinal"] for i in inds}
    nome = {i["id"]: i["nome"] for i in inds}
    placar = {i["id"] for i in inds if i.get("placar_redescrito")}

    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    por = collections.defaultdict(list)
    for l in jogos():
        por[(l["ano"], l["clube"])].append(l)

    base = []
    for k, js in por.items():
        a = a01.get(k)
        if not a:
            continue
        casa = [j for j in js if j["mando"] == "casa"]
        fora = [j for j in js if j["mando"] == "fora"]
        if len(casa) < 15 or len(fora) < 15:
            continue
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"],
             "trave": a["trave"] == "1", "fronteira": a["fronteira"] == "1",
             "pj_casa": sum(j["pts"] for j in casa) / len(casa),
             "pj_fora": sum(j["pts"] for j in fora) / len(fora),
             "xg_casa": media(casa, "xg"), "xg_fora": media(fora, "xg"),
             "xgc_casa": media(casa, "xgc"), "xgc_fora": media(fora, "xgc"),
             "dd_casa": media(casa, "dd"), "dd_fora": media(fora, "dd"),
             "n_casa": len(casa), "n_fora": len(fora)}
        if any(l[c] is None for c in ("xg_casa", "xg_fora", "xgc_casa", "xgc_fora",
                                      "dd_casa", "dd_fora")):
            continue
        l["dif_pj"] = l["pj_casa"] - l["pj_fora"]
        l["dif_xg"] = l["xg_casa"] - l["xg_fora"]
        l["dif_xgc"] = l["xgc_fora"] - l["xgc_casa"]   # sofre mais fora = positivo
        l["dif_dd"] = l["dd_casa"] - l["dd_fora"]
        base.append(l)
    print(f"base: {len(base)} clube-temporadas · {len({l['clube'] for l in base})} clubes")

    percentil_no_ano(base, [i["id"] for i in inds])
    familias = [(f["id"], [i["id"] for i in f["indicadores"]]) for f in dec["familias"]]
    comparacoes = [
        ("SM", lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
        ("ST", lambda l: l["faixa"] == "Sobe", lambda l: l["trave"]),
        ("CM", lambda l: l["faixa"] == "Cai", lambda l: l["faixa"] == "Meio"),
    ]
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    res = comparar(base, familias, comparacoes, filtros, RNG, lambda i: sinal[i])
    for it in res:
        it["nome"] = nome[it["indicador"]]
        it["placar_redescrito"] = it["indicador"] in placar

    with open(os.path.join(R, "A03_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)

    # A vantagem de casa da liga inteira, e por faixa — a descrição que o A03 pede.
    def med(f, c):
        v = [l[c] for l in base if f(l)]
        return round(float(np.median(v)), 3)
    faixas = {"Sobe": lambda l: l["faixa"] == "Sobe", "Trave": lambda l: l["trave"],
              "Meio": lambda l: l["faixa"] == "Meio", "Cai": lambda l: l["faixa"] == "Cai",
              "Liga": lambda l: True}
    quadro = {nome_f: {c: med(f, c) for c in ("pj_casa", "pj_fora", "dif_pj", "xg_casa", "xg_fora",
                                              "xgc_casa", "xgc_fora", "dd_casa", "dd_fora",
                                              "dif_dd")}
              for nome_f, f in faixas.items()}

    json.dump({"quadro_por_faixa": quadro,
               "poder_por_desenho": {"16x48": d_minimo(16, 48), "8x32": d_minimo(8, 32),
                                     "16x16": d_minimo(16, 16), "8x7": d_minimo(8, 7)},
               "n": {"total": len(base),
                     "sobe_sf": sum(1 for l in base if l["faixa"] == "Sobe" and not l["fronteira"]),
                     "meio_sf": sum(1 for l in base if l["faixa"] == "Meio" and not l["fronteira"]),
                     "cai_sf": sum(1 for l in base if l["faixa"] == "Cai" and not l["fronteira"])}},
              open(os.path.join(R, "A03_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*84}\nO QUADRO POR FAIXA (medianas)\n{'='*84}")
    print(f"{'faixa':6s} {'pts/j casa':>10s} {'pts/j fora':>10s} {'dif':>6s} {'xG casa':>8s} "
          f"{'xG fora':>8s} {'xGs casa':>9s} {'xGs fora':>9s} {'duelo casa':>10s} {'duelo fora':>10s}")
    for f in ("Sobe", "Trave", "Meio", "Cai", "Liga"):
        q = quadro[f]
        print(f"{f:6s} {q['pj_casa']:10.2f} {q['pj_fora']:10.2f} {q['dif_pj']:6.2f} "
              f"{q['xg_casa']:8.2f} {q['xg_fora']:8.2f} {q['xgc_casa']:9.2f} {q['xgc_fora']:9.2f} "
              f"{q['dd_casa']:10.1f} {q['dd_fora']:10.1f}")

    for rot in ("com", "sem"):
        print(f"\n{'='*96}\n{rot.upper()} fronteira\n{'='*96}")
        print(f"{'fam':11s} {'indicador':12s} {'cmp':3s} {'n':>6s} {'A':>8s} {'B':>8s} "
              f"{'d':>6s} {'q':>8s} {'dmin':>5s}  selo")
        for it in res:
            if it["fronteira"] != rot:
                continue
            marca = " ⚑placar" if it["placar_redescrito"] else ""
            ns = f"{it['n_a']}x{it['n_b']}"
            print(f"{it['familia']:11s} {it['indicador'][:12]:12s} {it['comparacao']:3s} {ns:>6s} "
                  f"{it['cru_a']:8.2f} {it['cru_b']:8.2f} {it['d']:+6.2f} {it['q']:8.4f} "
                  f"{it['d_minimo_80']:5.2f}  {it['selo']}{marca}")


if __name__ == "__main__":
    main()
