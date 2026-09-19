#!/usr/bin/env python3
"""T04 — o treinador ideal: a lista curta, com o que a base sustenta e o que não sustenta.

O CLAUDE.md pede: "quais treinadores combinam resultado (T02), perfil alinhado ao que separa quem
sobe (T03) e consistência entre clubes?" — e uma lista de 3 a 5 nomes com pontos fortes, riscos e
tamanho da amostra.

**As duas premissas da pergunta falharam**, e isso muda o que a lista pode ser:

- **T02:** histórico de G4 não se transfere de clube. Dos 34 multiclube, 9 variam 50 pontos ou mais
  no tempo no G4, e o que manda é o tamanho do elenco (top-5 de valor passa 34% das rodadas no G4;
  do 11º para baixo, 8%).
- **T03:** o perfil de jogo não é traço do treinador. A semelhança entre os perfis do mesmo
  treinador em clubes diferentes é indistinguível do acaso, e o time não muda quando ele chega.

Então a lista NÃO é uma previsão. É o ranking do que já aconteceu, com três colunas que o dono pode
ponderar como quiser: resultado, perfil na régua do A14, e o valor do elenco com que foi feito. O
critério mais defensável, e o único que sobreviveu a um teste de repetição, é o piso: **a PIOR
passagem do treinador**, não a média. Foi assim que o T02 isolou o único nome que repete.

Uso:
    python3 _fonte/estudo_serieb/scripts/T04.py
"""
import collections
import csv
import json
import os
import statistics as st

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")

TRACOS = ["dist_remate", "entradas_area", "duelo_def", "xg", "xg_contra",
          "xg_por_remate", "xg_por_remate_contra"]
MIN_RODADAS_TOTAL = 30       # soma das passagens, para entrar na lista curta


def main():
    perfis = [r for r in csv.DictReader(open(os.path.join(R, "T03_passagens.csv"),
                                             encoding="utf-8"))]
    t02 = [r for r in csv.DictReader(open(os.path.join(R, "T02_passagem.csv"), encoding="utf-8"))
           if r["no_ranking"] == "1"]
    tec_csv = {r["treinador"]: r for r in csv.DictReader(
        open(os.path.join(R, "T02_treinador.csv"), encoding="utf-8"))}

    # posto do valor do elenco dentro do ano
    valor = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            try:
                valor[(r["ano"], r["clube"])] = float(r["tm_valor_total"])
            except (TypeError, ValueError):
                pass
    por_ano = collections.defaultdict(list)
    for (ano, clube), v in valor.items():
        por_ano[ano].append((v, clube))
    posto = {}
    for ano, ls in por_ano.items():
        for i, (v, c) in enumerate(sorted(set(ls), reverse=True), 1):
            posto[(ano, c)] = i

    # perfil na régua: média dos 7 traços já em percentil alinhado
    ind = {}
    for p in perfis:
        ind[(p["treinador"], p["clube"], p["temporada"])] = st.mean(float(p[t]) for t in TRACOS)

    por_tec = collections.defaultdict(list)
    for p in t02:
        k = (p["treinador"], p["clube"], p["temporada"])
        if k not in ind:
            continue
        por_tec[p["treinador"]].append({
            "clube": p["clube"], "temporada": p["temporada"], "rodadas": int(p["rodadas"]),
            "pct_g4": float(p["pct_g4"]), "ppj": float(p["ppj"]),
            "indice_perfil": round(ind[k], 1),
            "posto_valor": posto.get((p["temporada"], p["clube"])),
        })

    lista = []
    for tec, ps in por_tec.items():
        rod = sum(p["rodadas"] for p in ps)
        if rod < MIN_RODADAS_TOTAL:
            continue
        pv = [p["posto_valor"] for p in ps if p["posto_valor"]]
        lista.append({
            "treinador": tec, "passagens": len(ps), "clubes": len({p["clube"] for p in ps}),
            "rodadas": rod,
            "pct_g4_medio": round(sum(p["pct_g4"] * p["rodadas"] for p in ps) / rod, 1),
            "pct_g4_pior": round(min(p["pct_g4"] for p in ps), 1),
            "ppj": round(sum(p["ppj"] * p["rodadas"] for p in ps) / rod, 2),
            "indice_medio": round(st.mean(p["indice_perfil"] for p in ps), 1),
            "indice_pior": round(min(p["indice_perfil"] for p in ps), 1),
            "posto_valor_mediano": round(st.median(pv), 1) if pv else None,
            "passagens_detalhe": sorted(ps, key=lambda x: (x["temporada"], x["clube"])),
        })

    # a lista curta: ordenada pelo PISO, que é o único critério que sobreviveu a um teste
    lista.sort(key=lambda x: (-x["pct_g4_pior"], -x["indice_pior"]))
    curta = lista[:5]

    json.dump({"criterio": "ordenado pelo PISO — a pior passagem do treinador —, porque é o único "
                           "critério que sobreviveu a um teste de repetição (T02). A média premia "
                           "quem teve uma passagem boa em clube rico.",
               "premissas_que_falharam": {
                   "T02": "histórico de G4 não se transfere entre clubes",
                   "T03": "o perfil de jogo não é traço do treinador, e o time não muda quando ele chega"},
               "min_rodadas_total": MIN_RODADAS_TOTAL,
               "n_na_lista": len(lista), "lista_curta": curta, "lista_completa": lista},
              open(os.path.join(R, "T04_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"treinadores com {MIN_RODADAS_TOTAL}+ rodadas e perfil medido: {len(lista)}\n")
    print(f"{'treinador':22s} {'pass':>4s} {'cl':>3s} {'rod':>4s} {'%G4 méd':>8s} {'%G4 PIOR':>9s} "
          f"{'ppj':>5s} {'índice':>7s} {'índ. PIOR':>10s} {'valor med':>10s}")
    for x in lista:
        print(f"{x['treinador'][:22]:22s} {x['passagens']:4d} {x['clubes']:3d} {x['rodadas']:4d} "
              f"{x['pct_g4_medio']:8.1f} {x['pct_g4_pior']:9.1f} {x['ppj']:5.2f} "
              f"{x['indice_medio']:7.1f} {x['indice_pior']:10.1f} "
              f"{(x['posto_valor_mediano'] or 0):10.1f}")
    print(f"\n{'='*70}\nA LISTA CURTA (5), pelo piso\n{'='*70}")
    for x in curta:
        print(f"\n{x['treinador']} — {x['passagens']} passagens em {x['clubes']} clube(s), "
              f"{x['rodadas']} rodadas")
        print(f"   piso de G4 {x['pct_g4_pior']}% · média {x['pct_g4_medio']}% · ppj {x['ppj']} · "
              f"índice de perfil {x['indice_medio']} (piso {x['indice_pior']}) · "
              f"elenco mediano {x['posto_valor_mediano']}º")
        for p in x["passagens_detalhe"]:
            print(f"      {p['temporada']} {p['clube'][:16]:16s} {p['rodadas']:2d} rod · "
                  f"{p['pct_g4']:5.1f}% G4 · ppj {p['ppj']:.2f} · índice {p['indice_perfil']:5.1f} · "
                  f"elenco {p['posto_valor']}º")


if __name__ == "__main__":
    main()
