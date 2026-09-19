#!/usr/bin/env python3
"""A06 — quem sobe pressiona mais alto, ou apenas cede menos finalização de qualidade?

É a continuação direta do A02, que achou o lado defensivo como o que mais separa (xG sofrido
d 1,46; xG por finalização sofrida d 1,30). A02 disse ONDE está a diferença; A06 pergunta COMO ela
é conseguida: pressionando alto, ou só cedendo chance pior?

Lista: `resultados/A06_indicadores.json`, fechada antes de rodar (8 indicadores, 3 famílias, e
3 lacunas da base registradas). Método: `scripts/_metodo.py` (o da casa).

## Duas coisas que a base não tem, e uma que ela tem escondida

- **Recuperação por altura do campo não existe.** Há o total e a quebra por comprimento do passe
  (curto/médio/longo), que é outra coisa. "Pressiona mais alto" fica respondido por PPDA e
  recuperações totais.
- **Contra-ataque sofrido não existe** — só o do próprio time. Saiu da lista.
- **Duelo defensivo existe jogo a jogo** ("Duelos defensivos ganhos, %" em serieb_jogos.csv), mas
  não no clube-temporada. É agregado aqui pela média dos jogos de Série B da temporada.

## Ajuste pela posse do adversário

Time que fica com a bola sofre menos finalização só por isso. Os dois indicadores de volume cedido
entram divididos pela posse do adversário, normalizada em 50%: `remates_contra ÷ ((100−posse)/50)`.
`xg_por_remate_contra` já é uma taxa por finalização e não se ajusta.

Uso:
    python3 _fonte/estudo_serieb/scripts/A06.py
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
from _metodo import comparar, d_minimo, pct, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
RNG = np.random.default_rng(20260917)
ANOS = {"2022", "2023", "2024", "2025"}


def jogos_serieb():
    """Os jogos de Série B com as colunas sem bola, por clube e temporada."""
    out = collections.defaultdict(list)
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
            out[(m.group(1), r["Equipa"])].append({
                "data": r["Data"][:10],
                "ppda": num("PPDA"),
                "recuperacoes": num("Recuperações"),
                "duelos_def_pct": num("Duelos defensivos ganhos, %"),
                "duelos_aereos_pct": num("Duelos aéreos ganhos, %"),
                "posse": num("Posse, %"),
                "intensidade": num("Intensidade de jogo"),
            })
    for k in out:
        out[k].sort(key=lambda j: j["data"])
    return out


def main():
    dec = json.load(open(os.path.join(R, "A06_indicadores.json"), encoding="utf-8"))
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]
    sinal = {i["id"]: i["sinal"] for i in inds}
    nome = {i["id"]: i["nome"] for i in inds}

    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            tec[(r["ano"], r["clube"])] = r
    jogos = jogos_serieb()

    base, sem_duelo = [], 0
    for k, a in a01.items():
        if k[0] not in ANOS or k not in tec:
            continue
        t = tec[k]
        def num(c):
            v = t.get(c)
            return float(v) if v not in (None, "", "nan") else None
        posse = num("posse")
        posse_adv = (100 - posse) if posse is not None else None
        fator = (posse_adv / 50) if posse_adv else None
        dd = [j["duelos_def_pct"] for j in jogos.get(k, []) if j["duelos_def_pct"] is not None]
        if not dd:
            sem_duelo += 1
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"],
             "trave": a["trave"] == "1", "fronteira": a["fronteira"] == "1",
             "posse": posse,
             "ppda": num("ppda"), "recuperacoes": num("recuperacoes"),
             "intensidade": num("intensidade"),
             "duelos_aereos_pct": num("duelos_aereos_pct"),
             "duelos_def_pct": (sum(dd) / len(dd)) if dd else None,
             "xg_por_remate_contra": num("xg_por_remate_contra"),
             "remates_contra_aj": (num("remates_contra") / fator) if fator else None,
             "xg_contra_aj": (num("xg_contra") / fator) if fator else None}
        base.append(l)

    faltas = {i["id"]: sum(1 for l in base if l[i["id"]] is None) for i in inds}
    print(f"base: {len(base)} clube-temporadas · {len({l['clube'] for l in base})} clubes")
    print("buracos por indicador:", {k: v for k, v in faltas.items() if v} or "nenhum")
    if sem_duelo:
        print(f"  {sem_duelo} clube-temporadas sem duelo defensivo jogo a jogo")
    base = [l for l in base if all(l[i["id"]] is not None for i in inds)]
    print(f"base usada (sem buraco): {len(base)}")

    percentil_no_ano(base, [i["id"] for i in inds])
    familias = [(f["id"], [i["id"] for i in f["indicadores"]]) for f in dec["familias"]]
    comparacoes = [("SM", lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
                   ("ST", lambda l: l["faixa"] == "Sobe", lambda l: l["trave"])]
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    res = comparar(base, familias, comparacoes, filtros, RNG, lambda i: sinal[i])
    for it in res:
        it["nome"] = nome[it["indicador"]]

    with open(os.path.join(R, "A06_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)

    # ---- porta temporal: 1º turno prevendo o 2º ----
    porta = {}
    for campo in ("ppda", "recuperacoes", "duelos_def_pct", "duelos_aereos_pct", "posse",
                  "intensidade"):
        A, B = [], []
        for k, js in jogos.items():
            if len(js) < 30:
                continue
            v = [j[campo] for j in js if j[campo] is not None]
            if len(v) < 30:
                continue
            h = len(v) // 2
            A.append(sum(v[:h]) / h); B.append(sum(v[h:]) / len(v[h:]))
        if len(A) < 20:
            continue
        rho, p = stats.spearmanr(A, B)
        n = len(A)
        z, se = 0.5 * math.log((1 + rho) / (1 - rho)), 1 / math.sqrt(n - 3)
        porta[campo] = {"rho": round(float(rho), 3), "p": round(float(p), 5), "n": n,
                        "ic": [round(math.tanh(z - 1.96 * se), 2),
                               round(math.tanh(z + 1.96 * se), 2)],
                        "se_repete": bool(p < 0.05 and rho > 0.3)}

    # ---- PPDA e o valor do elenco: a ressalva, sem desconto ----
    valor = {}
    for k in {(l["temporada"], l["clube"]) for l in base}:
        v = tec[k].get("tm_valor_total")
        try:
            valor[k] = float(v) if v else None
        except ValueError:
            valor[k] = None
    pares = [(valor[(l["temporada"], l["clube"])], l[pct("ppda")]) for l in base
             if valor.get((l["temporada"], l["clube"]))]
    rho_v, p_v = stats.spearmanr([a for a, _ in pares], [b for _, b in pares])

    json.dump({"porta_temporal": porta,
               "ppda_x_valor_elenco": {"rho": round(float(rho_v), 3), "p": round(float(p_v), 5),
                                       "n": len(pares),
                                       "convencao": "percentil alto de PPDA = MENOS pressão; rho positivo = elenco caro pressiona alto"},
               "poder_por_desenho": {"16x48": d_minimo(16, 48), "8x32": d_minimo(8, 32),
                                     "16x16": d_minimo(16, 16), "8x7": d_minimo(8, 7)},
               "n": {"total": len(base),
                     "sobe_sem_fronteira": sum(1 for l in base if l["faixa"] == "Sobe" and not l["fronteira"]),
                     "meio_sem_fronteira": sum(1 for l in base if l["faixa"] == "Meio" and not l["fronteira"])}},
              open(os.path.join(R, "A06_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    for rot in ("com", "sem"):
        print(f"\n{'='*96}\n{rot.upper()} fronteira\n{'='*96}")
        print(f"{'fam':14s} {'indicador':22s} {'cmp':3s} {'n':>6s} {'Sobe':>8s} {'alvo':>8s} "
              f"{'d':>6s} {'q':>8s} {'dmin':>5s}  selo")
        for it in res:
            if it["fronteira"] != rot:
                continue
            print(f"{it['familia']:14s} {it['indicador'][:22]:22s} {it['comparacao']:3s} "
                  f"{f'{it[chr(110)+chr(95)+chr(97)]}x{it[chr(110)+chr(95)+chr(98)]}':>6s} "
                  f"{it['cru_a']:8.2f} {it['cru_b']:8.2f} {it['d']:+6.2f} {it['q']:8.4f} "
                  f"{it['d_minimo_80']:5.2f}  {it['selo']}")

    print(f"\n{'='*96}\nPORTA TEMPORAL — 1º turno prevendo o 2º\n{'='*96}")
    for k, v in porta.items():
        print(f"  {k:20s} rho {v['rho']:+.3f}  IC95 [{v['ic'][0]:+.2f},{v['ic'][1]:+.2f}]  "
              f"p {v['p']:.4f}  n {v['n']}   {'SE REPETE' if v['se_repete'] else 'NÃO se repete'}")
    print(f"\nPPDA × valor do elenco: rho {rho_v:+.3f} (p {p_v:.4f}, n {len(pares)}) — "
          f"ressalva, nunca desconto")


if __name__ == "__main__":
    main()
