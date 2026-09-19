#!/usr/bin/env python3
"""A12 — as réguas contínuas e o Cenário Barato.

NÃO refaz agrupamento: a §7.1 já decidiu que não há grupos, e o CLAUDE.md proíbe reabrir.

Faz três coisas:

1. **Posiciona cada clube-temporada nas nove réguas** (A a I de `prototipo_indicadores.json`):
   média dos percentis dentro da temporada dos itens da régua, com o sinal alinhado. Depois compara
   as faixas em cada régua, com o método da casa e a regra da fronteira corrigida.

2. **Testa o Cenário Barato.** A §7.2(b) descreve o perfil dos 4 que subiram fora do top-8 de valor
   — PPDA 10,0-13,2, posse 47-52%, passe longo 10-14% — e o rotula como escolha de projeto, com
   n=4 impresso. O que faltava era o outro lado da conta: **quantos clube-temporadas que NÃO subiram
   também cabem nessa faixa?** Um perfil que 40 times têm e só 4 usaram para subir não é perfil, é
   descrição da liga. Ampliar o Cenário Barato com mais casos dependia de 2018-2021, que está fora
   do recorte (decisão de 17/09); então o que dá para acrescentar é este teste.

3. **Posiciona 2026 nas mesmas réguas**, como o CLAUDE.md pede.

Uso:
    python3 _fonte/estudo_serieb/scripts/A12.py
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
RNG = np.random.default_rng(20260917)
FECHADAS = {"2022", "2023", "2024", "2025"}
TESTE = "2026"

# A faixa do perfil do Cenário Barato, como a §7.2(b) a descreve.
PERFIL_BARATO = {"ppda": (10.0, 13.2), "posse": (47.0, 52.0), "passe_longo_pct": (10.0, 14.0)}


def main():
    eixos = json.load(open(os.path.join(DADOS, "prototipo_indicadores.json"),
                           encoding="utf-8"))["eixos"]
    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            tec[(r["ano"], r["clube"])] = r

    itens = sorted({i for v in eixos.values() for i, _ in v}
                   | set(PERFIL_BARATO) | {"tm_valor_total"})
    base, sem = [], collections.Counter()
    for k, a in a01.items():
        if k not in tec:
            continue
        t = tec[k]
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"], "pos": int(a["pos"]),
             "pontos": int(a["pontos"]), "trave": a["trave"] == "1",
             "fronteira": a["fronteira"] == "1"}
        for c in itens:
            v = t.get(c)
            try:
                l[c] = float(v) if v not in (None, "", "nan") else None
            except ValueError:
                l[c] = None
            if l[c] is None:
                sem[c] += 1
        base.append(l)
    if sem:
        print(f"  colunas com buraco: {dict(sem)}")
    base = [l for l in base if all(l[c] is not None for c in itens)]
    print(f"base: {len(base)} clube-temporadas ({len([l for l in base if l['temporada'] in FECHADAS])} fechadas)")

    percentil_no_ano(base, itens)
    # posição em cada régua = média dos percentis dos itens, com o sinal alinhado
    for l in base:
        for eixo, its in eixos.items():
            vs = [(l[pct(i)] if s > 0 else 100 - l[pct(i)]) for i, s in its]
            l[eixo] = sum(vs) / len(vs)
    # posto de valor dentro do ano (1 = mais caro)
    por_ano = collections.defaultdict(list)
    for l in base:
        por_ano[l["temporada"]].append(l)
    for ls in por_ano.values():
        for i, l in enumerate(sorted(ls, key=lambda x: -x["tm_valor_total"]), 1):
            l["posto_valor"] = i

    fechadas = [l for l in base if l["temporada"] in FECHADAS]
    percentil_no_ano(fechadas, list(eixos))
    familias = [("reguas", list(eixos))]
    comparacoes = [("SM", lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
                   ("ST", lambda l: l["faixa"] == "Sobe", lambda l: l["trave"]),
                   ("CM", lambda l: l["faixa"] == "Cai", lambda l: l["faixa"] == "Meio")]
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    res = comparar(fechadas, familias, comparacoes, filtros, RNG, lambda i: 1)
    with open(os.path.join(R, "A12_reguas.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)
    por = collections.defaultdict(dict)
    for r in res:
        por[(r["comparacao"], r["indicador"])][r["fronteira"]] = r
    dois = {cp: [i for (c, i), v in por.items() if c == cp
                 and v.get("com", {}).get("selo") == "firme"
                 and v.get("sem", {}).get("selo") == "firme"] for cp in ("SM", "ST", "CM")}

    # ---- o Cenário Barato: quem cabe no perfil, e quantos subiram ----
    def cabe(l):
        return all(lo <= l[c] <= hi for c, (lo, hi) in PERFIL_BARATO.items())
    no_perfil = [l for l in fechadas if cabe(l)]
    subiu_no_perfil = [l for l in no_perfil if l["faixa"] == "Sobe"]
    fora_top8 = [l for l in fechadas if l["posto_valor"] > 8]
    barato = [l for l in fora_top8 if l["faixa"] == "Sobe"]
    barato_no_perfil = [l for l in barato if cabe(l)]
    perfil_fora_top8 = [l for l in no_perfil if l["posto_valor"] > 8]

    # ---- 2026 nas réguas ----
    teste = sorted([l for l in base if l["temporada"] == TESTE], key=lambda l: l["pos"])

    json.dump({
        "reguas": list(eixos), "firme_nos_dois_cortes": dois,
        "mediana_por_faixa": {e: {fx: round(float(np.median([l[e] for l in fechadas
                                                            if (l["trave"] if fx == "Trave" else l["faixa"] == fx)])), 1)
                                  for fx in ("Sobe", "Trave", "Meio", "Cai")} for e in eixos},
        "cenario_barato": {
            "perfil_declarado_na_especificacao": PERFIL_BARATO,
            "promovidos_fora_do_top8_de_valor": [
                {"temporada": l["temporada"], "clube": l["clube"], "pos": l["pos"],
                 "pontos": l["pontos"], "posto_valor": l["posto_valor"],
                 "ppda": round(l["ppda"], 2), "posse": round(l["posse"], 1),
                 "passe_longo_pct": round(l["passe_longo_pct"], 1), "cabe_no_perfil": cabe(l)}
                for l in sorted(barato, key=lambda x: (x["temporada"], x["pos"]))],
            "quantos_cabem_no_perfil": len(no_perfil),
            "destes_quantos_subiram": len(subiu_no_perfil),
            "taxa_de_acesso_no_perfil": round(100 * len(subiu_no_perfil) / len(no_perfil), 1) if no_perfil else None,
            "taxa_de_acesso_geral": round(100 * 16 / len(fechadas), 1),
            "cabem_e_estao_fora_do_top8": len(perfil_fora_top8),
            "destes_quantos_subiram": len([l for l in perfil_fora_top8 if l["faixa"] == "Sobe"]),
            "taxa_fora_do_top8_geral": round(100 * len(barato) / len(fora_top8), 1),
            "n_promovidos_baratos": len(barato), "n_cabem_dos_baratos": len(barato_no_perfil),
        },
        "teste_2026": [{"pos": l["pos"], "clube": l["clube"], "posto_valor": l["posto_valor"],
                        **{e: round(l[e]) for e in eixos}} for l in teste],
        "n": {"fechadas": len(fechadas), "total": len(base)},
    }, open(os.path.join(R, "A12_resumo.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    print(f"\n{'='*86}\nAS NOVE RÉGUAS, mediana do percentil por faixa (2022-2025)\n{'='*86}")
    print(f"{'régua':24s} {'Sobe':>6s} {'Trave':>6s} {'Meio':>6s} {'Cai':>6s}   firme nos dois cortes?")
    med = json.load(open(os.path.join(R, "A12_resumo.json"), encoding="utf-8"))["mediana_por_faixa"]
    for e in eixos:
        m = med[e]
        onde = [cp for cp in ("SM", "ST", "CM") if e in dois[cp]]
        print(f"{e:24s} {m['Sobe']:6.1f} {m['Trave']:6.1f} {m['Meio']:6.1f} {m['Cai']:6.1f}   "
              f"{', '.join(onde) if onde else '—'}")

    print(f"\n{'='*86}\nO CENÁRIO BARATO: o perfil distingue?\n{'='*86}")
    print(f"  promovidos fora do top-8 de valor: {len(barato)}")
    for l in sorted(barato, key=lambda x: (x["temporada"], x["pos"])):
        print(f"     {l['temporada']} {l['clube'][:16]:16s} {l['pos']}º · valor {l['posto_valor']}º · "
              f"PPDA {l['ppda']:.2f} posse {l['posse']:.1f}% longo {l['passe_longo_pct']:.1f}%"
              f"{'  ✓ cabe no perfil' if cabe(l) else '  ✗ NÃO cabe'}")
    print(f"\n  clube-temporadas que CABEM no perfil (PPDA 10-13,2 · posse 47-52% · longo 10-14%): {len(no_perfil)}")
    print(f"     destes, subiram: {len(subiu_no_perfil)}  ->  taxa de acesso {100*len(subiu_no_perfil)/max(1,len(no_perfil)):.1f}%")
    print(f"     taxa de acesso da liga inteira: {100*16/len(fechadas):.1f}%")
    print(f"\n  cabem no perfil E estão fora do top-8 de valor: {len(perfil_fora_top8)}")
    print(f"     destes, subiram: {len([l for l in perfil_fora_top8 if l['faixa']=='Sobe'])}")
    print(f"     taxa de acesso de quem está fora do top-8, em geral: {100*len(barato)/len(fora_top8):.1f}%")


if __name__ == "__main__":
    main()
