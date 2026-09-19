#!/usr/bin/env python3
"""A02 — a distância entre Sobe e Meio (e entre Sobe e Trave) está no que o time cria ou no que cede?

Lista de indicadores: `resultados/A02_indicadores.json`, fechada ANTES de rodar (13 indicadores,
3 famílias). Recorte 2022–2025; 2026 fica fora por estar em curso.

## O método é o da casa, não um meu

Apurado em 17/09 lendo `gerar_prototipo.py` e a §6 da ESPECIFICACAO.md:

- **Teste no POSTO dentro da temporada (percentil 0–100), nunca no valor bruto.** O valor bruto vai
  só para a tela. A primeira versão deste script testou no bruto e estava errada.
- **t de Welch bilateral** (a Protipo usa Welch; o `ranking_gaps.py` usa Mann-Whitney, mas é a
  régua da outra aba — misturar as duas não reconcilia com nenhuma).
- **d de Cohen agrupado**, no mesmo percentil, com o sinal do indicador alinhado (positivo = Sobe
  melhor).
- **BH a 5% dentro de cada família × cada comparação**, nunca no bolo dos 13.
- **IC95 por bootstrap de CLUBE, não de linha.** As 80 linhas são 40 clubes (§6.6): Welch e BH
  supõem independência que o painel não tem. O bootstrap reamostra clubes.
- **Poder por desenho**, como a casa faz: o menor d detectável a 80% para cada tamanho de grupo.

## Três indicadores são "o placar redescrito"

A lista branca da §6 (ESPECIFICACAO.md:82) proíbe `gp_jogo`, `gc_jogo`, `golos_sem_penalti`,
`xg_saldo`, `finalizacao` e outros de entrarem em eixo, agrupamento ou score: "isto é o placar, não
é característica". Deles, três estão nesta lista — `gols_pro_90` (= gp_jogo), `gols_contra_90`
(= gc_jogo) e `finalizacao`. Eles entram como a especificação manda: **mostrar e desqualificar**.
Servem para medir o tamanho da diferença e para a porta temporal, nunca para sustentar que são
característica. `xg` e `xg_contra` NÃO estão na lista branca e entram normalmente.

## O xG é uma régua curta

A §6 mede a confiabilidade split-half do xG em **0,30**, e a regra é dura: "indicador com teto
< 0,40 sai da tela hachurado — o efeito nunca pode ser maior que a régua". Toda leitura de xG aqui
sai com essa marca.

Uso:
    python3 _fonte/estudo_serieb/scripts/A02.py
"""
import collections
import csv
import json
import math
import os
import re
import statistics as st

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
RNG = np.random.default_rng(20260917)

CONFIABILIDADE = {"xg": 0.30}     # §6: split-half medido. < 0,40 = régua curta.
PLACAR = {"gols_pro_90", "gols_contra_90", "finalizacao"}   # lista branca da §6


def carregar(dec):
    anos = {str(a) for a in dec["recorte"]["temporadas"]}
    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            tec[(r["ano"], r["clube"])] = r
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]
    base = []
    for k, a in a01.items():
        if k[0] not in anos or k not in tec:
            continue
        t, J = tec[k], int(a["J"])
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"],
             "trave": a["trave"] == "1", "fronteira": a["fronteira"] == "1"}
        for i in inds:
            if i["id"] == "gols_pro_90":
                l[i["id"]] = int(a["GP"]) / J
            elif i["id"] == "gols_contra_90":
                l[i["id"]] = int(a["GC"]) / J
            else:
                v = t.get(i["id"])
                l[i["id"]] = float(v) if v not in (None, "", "nan") else None
        base.append(l)
    # POSTO DENTRO DA TEMPORADA — a normalização que o CLAUDE.md exige.
    por_ano = collections.defaultdict(list)
    for l in base:
        por_ano[l["temporada"]].append(l)
    for ls in por_ano.values():
        for i in inds:
            r = stats.rankdata([l[i["id"]] for l in ls])
            for l, rr in zip(ls, r):
                l[i["id"] + "_pct"] = 100 * (rr - 1) / (len(ls) - 1)
    return base, inds


def cohen_d(a, b):
    na, nb = len(a), len(b)
    va, vb = np.var(a, ddof=1), np.var(b, ddof=1)
    s = math.sqrt(((na - 1) * va + (nb - 1) * vb) / (na + nb - 2))
    return (np.mean(a) - np.mean(b)) / s if s else 0.0


def ic_por_clube(base, campo, grupo_a, grupo_b, sinal, reps=2000):
    """IC95 do d, reamostrando CLUBES (80 linhas são 40 clubes: §6.6)."""
    por_clube = collections.defaultdict(list)
    for l in base:
        por_clube[l["clube"]].append(l)
    clubes = list(por_clube)
    saida = []
    for _ in range(reps):
        amostra = [l for c in RNG.choice(clubes, len(clubes), replace=True) for l in por_clube[c]]
        a = [l[campo] for l in amostra if grupo_a(l)]
        b = [l[campo] for l in amostra if grupo_b(l)]
        if len(a) > 2 and len(b) > 2:
            saida.append(cohen_d(a, b) * sinal)
    return (round(float(np.percentile(saida, 2.5)), 2),
            round(float(np.percentile(saida, 97.5)), 2)) if saida else (None, None)


def d_minimo(n1, n2, alvo=0.80):
    """Menor d detectável a 80%, por desenho — como a casa faz."""
    lo, hi = 0.05, 3.0
    for _ in range(40):
        d = (lo + hi) / 2
        nc = d * math.sqrt(n1 * n2 / (n1 + n2))
        gl = n1 + n2 - 2
        crit = stats.t.ppf(0.975, gl)
        pot = 1 - stats.nct.cdf(crit, gl, nc) + stats.nct.cdf(-crit, gl, nc)
        if pot < alvo:
            lo = d
        else:
            hi = d
    return round(hi, 2)


def bh(ps):
    idx = sorted(range(len(ps)), key=lambda i: ps[i])
    m, q, menor = len(ps), [None] * len(ps), 1.0
    for r, i in enumerate(reversed(idx), 1):
        menor = min(menor, ps[i] * m / (m - r + 1))
        q[i] = menor
    return q


def porta_temporal():
    """1º turno prevendo o 2º, por clube-temporada. Spearman, como a §6.4."""
    anos = {"2022", "2023", "2024", "2025"}
    linhas = []
    with open(os.path.join(DADOS, "serieb_jogos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r.get("Competição") != "Brazil. Serie B":
                continue
            m = re.match(r"(\d{4})-\d{2}-\d{2}", r["Data"] or "")
            if not m or m.group(1) not in anos:
                continue
            try:
                xg = float(r["Golos esperados"])
            except (TypeError, ValueError):
                xg = None
            linhas.append({"ano": m.group(1), "data": r["Data"][:10], "clube": r["Equipa"],
                           "adv": r["adversario"], "gp": int(float(r["golos_pro"] or 0)),
                           "gc": int(float(r["golos_contra"] or 0)), "xg": xg})
    idx = {(l["ano"], l["data"], l["clube"]): l for l in linhas}
    for l in linhas:
        o = idx.get((l["ano"], l["data"], l["adv"]))
        l["xgc"] = o["xg"] if o else None
    por = collections.defaultdict(list)
    for l in linhas:
        por[(l["ano"], l["clube"])].append(l)
    for k in por:
        por[k].sort(key=lambda x: x["data"])

    def media(js, f):
        v = [f(j) for j in js if f(j) is not None]
        return sum(v) / len(v) if v else None

    metricas = {
        "xg": lambda j: j["xg"],
        "xg_contra": lambda j: j["xgc"],
        "gols_pro_90": lambda j: j["gp"],
        "gols_contra_90": lambda j: j["gc"],
        "finalizacao": lambda j: (j["gp"] - j["xg"]) if j["xg"] is not None else None,
        "defesa_vs_xg": lambda j: (j["xgc"] - j["gc"]) if j["xgc"] is not None else None,
    }
    out = {}
    for nome, f in metricas.items():
        A, B = [], []
        for js in por.values():
            if len(js) < 30:
                continue
            h = len(js) // 2
            a, b = media(js[:h], f), media(js[h:], f)
            if a is not None and b is not None:
                A.append(a); B.append(b)
        rho, p = stats.spearmanr(A, B)
        n = len(A)
        z, se = 0.5 * math.log((1 + rho) / (1 - rho)), 1 / math.sqrt(n - 3)
        out[nome] = {"rho": round(float(rho), 3), "p": round(float(p), 5), "n": n,
                     "ic": [round(math.tanh(z - 1.96 * se), 2), round(math.tanh(z + 1.96 * se), 2)],
                     "se_repete": bool(p < 0.05 and rho > 0.3)}
    return out


def main():
    dec = json.load(open(os.path.join(R, "A02_indicadores.json"), encoding="utf-8"))
    base, inds = carregar(dec)
    sinal = {i["id"]: i["sinal"] for i in inds}
    nome = {i["id"]: i["nome"] for i in inds}

    resultados = []
    for rot, filtro in (("com", lambda l: True), ("sem", lambda l: not l["fronteira"])):
        for fam in dec["familias"]:
            for cid, alvo_f in (("SM", lambda l: l["faixa"] == "Meio"),
                                ("ST", lambda l: l["trave"])):
                ps, itens = [], []
                for ind in fam["indicadores"]:
                    k = ind["id"] + "_pct"
                    ga = lambda l: l["faixa"] == "Sobe" and filtro(l)
                    gb = lambda l: alvo_f(l) and filtro(l)
                    a = [l[k] for l in base if ga(l)]
                    b = [l[k] for l in base if gb(l)]
                    if len(a) < 5 or len(b) < 5:
                        continue
                    t, p = stats.ttest_ind(a, b, equal_var=False)
                    d = cohen_d(a, b) * ind["sinal"]
                    lo, hi = ic_por_clube(base, k, ga, gb, ind["sinal"])
                    cru_a = st.median([l[ind["id"]] for l in base if ga(l)])
                    cru_b = st.median([l[ind["id"]] for l in base if gb(l)])
                    itens.append({
                        "fronteira": rot, "familia": fam["id"], "comparacao": cid,
                        "indicador": ind["id"], "nome": ind["nome"],
                        "n_sobe": len(a), "n_alvo": len(b),
                        "cru_sobe": round(cru_a, 3), "cru_alvo": round(cru_b, 3),
                        "dif_cru": round(cru_a - cru_b, 3),
                        "d": round(d, 3), "ic95_d": [lo, hi], "p": round(float(p), 5),
                        "d_minimo_80": d_minimo(len(a), len(b)),
                        "placar_redescrito": ind["id"] in PLACAR,
                        "regua_curta": CONFIABILIDADE.get(ind["id"]),
                    })
                    ps.append(float(p))
                for it, q in zip(itens, bh(ps)):
                    it["q"] = round(q, 5)
                    it["selo"] = ("firme" if q < 0.05 else
                                  ("pode ser sorte" if it["p"] < 0.05 else "sem diferença clara"))
                    it["poder_suficiente"] = abs(it["d"]) >= it["d_minimo_80"]
                resultados += itens

    porta = porta_temporal()
    with open(os.path.join(R, "A02_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(resultados[0]))
        w.writeheader(); w.writerows(resultados)
    json.dump({"porta_temporal": porta,
               "poder_por_desenho": {"16x48": d_minimo(16, 48), "16x16": d_minimo(16, 16),
                                     "8x32": d_minimo(8, 32), "8x7": d_minimo(8, 7)},
               "n": {"sobe": sum(1 for l in base if l["faixa"] == "Sobe"),
                     "meio": sum(1 for l in base if l["faixa"] == "Meio"),
                     "trave": sum(1 for l in base if l["trave"]),
                     "sobe_sem_fronteira": sum(1 for l in base if l["faixa"] == "Sobe" and not l["fronteira"]),
                     "trave_sem_fronteira": sum(1 for l in base if l["trave"] and not l["fronteira"]),
                     "clubes": len({l["clube"] for l in base})}},
              open(os.path.join(R, "A02_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    for rot in ("com", "sem"):
        print(f"\n{'='*100}\n{rot.upper()} fronteira — Welch no posto dentro do ano, d de Cohen, "
              f"BH por família × comparação\n{'='*100}")
        print(f"{'fam':6s} {'indicador':21s} {'cmp':3s} {'n':>7s} {'cru S':>7s} {'cru alvo':>8s} "
              f"{'d':>6s} {'IC95':>14s} {'q':>8s} {'d min':>6s}  selo")
        for it in resultados:
            if it["fronteira"] != rot:
                continue
            marca = " ⚑placar" if it["placar_redescrito"] else (" ⚑régua" if it["regua_curta"] else "")
            ns = f"{it['n_sobe']}x{it['n_alvo']}"
            print(f"{it['familia']:6s} {it['indicador'][:21]:21s} {it['comparacao']:3s} "
                  f"{ns:>7s} "
                  f"{it['cru_sobe']:7.2f} {it['cru_alvo']:8.2f} {it['d']:+6.2f} "
                  f"[{it['ic95_d'][0]:+5.2f},{it['ic95_d'][1]:+5.2f}] {it['q']:8.4f} "
                  f"{it['d_minimo_80']:6.2f}  {it['selo']}{marca}")

    print(f"\n{'='*100}\nPORTA TEMPORAL — 1º turno prevendo o 2º (Spearman, n=80 clube-temporadas)\n{'='*100}")
    for k, v in porta.items():
        print(f"  {nome.get(k, k):34s} rho {v['rho']:+.3f}  IC95 [{v['ic'][0]:+.2f},{v['ic'][1]:+.2f}]  "
              f"p {v['p']:.4f}   {'SE REPETE' if v['se_repete'] else 'NÃO se repete'}")


if __name__ == "__main__":
    main()
