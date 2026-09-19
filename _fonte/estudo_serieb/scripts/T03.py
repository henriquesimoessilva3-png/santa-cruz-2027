#!/usr/bin/env python3
"""T03 — o perfil de jogo do treinador: ele mostra os traços de quem sobe, e repete em clubes diferentes?

Junta o dono de cada rodada (T01) com o jogo a jogo, e mede o perfil DURANTE a passagem — não por
temporada. Os traços são os do índice do A14 que existem jogo a jogo:

    distância da finalização · xG por finalização · entradas na área · toques na área
    duelo defensivo ganho · xG por finalização sofrida · xG sofrido

Ficam de fora dois componentes do índice que são de temporada e não de jogo: `H_dinheiro` (valor do
elenco) e `I_estabilidade_11`. São justamente os dois que o treinador não escolhe — o que torna o
recorte melhor para a pergunta do T03, não pior.

O valor de cada passagem vai para PERCENTIL dentro da temporada, comparado contra a distribuição dos
20 clubes daquele ano. Assim uma passagem de 12 rodadas em 2023 é comparável a uma de 30 em 2025.

Duas perguntas:

1. **Repete em clubes diferentes?** Para quem tem duas ou mais passagens de 10+ rodadas em clubes
   distintos, a correlação entre os perfis e a amplitude de cada traço.
2. **Muda o time quando chega?** Comparação antes e depois, no mesmo clube e na mesma temporada, com
   pelo menos 8 jogos de cada lado — o corte que o CLAUDE.md pede.

Uso:
    python3 _fonte/estudo_serieb/scripts/T03.py
"""
import collections
import csv
import json
import os
import re
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
ANOS = {"2022", "2023", "2024", "2025", "2026"}
MIN_RODADAS = 10
MIN_LADO = 8

# traço -> (coluna no jogo a jogo, sinal). Sinal +1 = mais é melhor.
TRACOS = {
    "dist_remate": ("Distância média do remate", -1),
    "entradas_area": ("Entradas na grande área", 1),
    "duelo_def": ("Duelos defensivos ganhos, %", 1),
    "xg": ("Golos esperados", 1),
    "remates": ("Remates", 1),
}


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
            l = {"ano": m.group(1), "data": r["Data"][:10], "clube": r["Equipa"],
                 "adv": r["adversario"]}
            for t, (col, _) in TRACOS.items():
                l[t] = num(col)
            linhas.append(l)
    idx = {(l["ano"], l["data"], l["clube"]): l for l in linhas}
    for l in linhas:
        o = idx.get((l["ano"], l["data"], l["adv"]))
        l["xg_contra"] = o["xg"] if o else None
        l["remates_contra"] = o["remates"] if o else None
    return linhas


def perfil(js):
    """O perfil de um conjunto de jogos: os traços derivados, ou None se faltar dado."""
    def m(c):
        v = [j[c] for j in js if j.get(c) is not None]
        return sum(v) / len(v) if v else None
    p = {"dist_remate": m("dist_remate"), "entradas_area": m("entradas_area"),
         "duelo_def": m("duelo_def"), "xg": m("xg"), "xg_contra": m("xg_contra")}
    xg, rem = m("xg"), m("remates")
    xgc, remc = m("xg_contra"), m("remates_contra")
    p["xg_por_remate"] = (xg / rem) if xg is not None and rem else None
    p["xg_por_remate_contra"] = (xgc / remc) if xgc is not None and remc else None
    return p


TRACO_SINAL = {"dist_remate": -1, "entradas_area": 1, "duelo_def": 1, "xg": 1,
               "xg_contra": -1, "xg_por_remate": 1, "xg_por_remate_contra": -1}


def main():
    js = jogos()
    por_ct = collections.defaultdict(list)
    for l in js:
        por_ct[(l["ano"], l["clube"])].append(l)

    # a distribuição dos 20 clubes de cada ano, para virar percentil
    dist = collections.defaultdict(lambda: collections.defaultdict(list))
    for (ano, clube), g in por_ct.items():
        p = perfil(g)
        for t, v in p.items():
            if v is not None:
                dist[ano][t].append(v)

    def percentil(ano, t, v):
        d = dist[ano][t]
        if v is None or not d:
            return None
        pc = stats.percentileofscore(d, v, kind="mean")
        return pc if TRACO_SINAL[t] > 0 else 100 - pc

    donos = [r for r in csv.DictReader(open(os.path.join(R, "T01_rodada_treinador.csv"),
                                            encoding="utf-8")) if r["temporada"] in ANOS]
    por_pass = collections.defaultdict(list)
    for d in donos:
        por_pass[(d["treinador"], d["clube_wyscout"], d["temporada"], d["inicio"])].append(d)
    data_de = {(l["ano"], l["clube"], l["data"]) for l in js}
    jog_por = {(l["ano"], l["clube"], l["data"]): l for l in js}

    passagens = []
    for (tec, clube, ano, ini), ds in por_pass.items():
        if len(ds) < MIN_RODADAS or ds[0]["interino"] == "1":
            continue
        meus = [jog_por[(ano, clube, d["data"])] for d in ds
                if (ano, clube, d["data"]) in jog_por]
        if len(meus) < MIN_RODADAS:
            continue
        p = perfil(meus)
        linha = {"treinador": tec, "clube": clube, "temporada": ano, "rodadas": len(meus),
                 "inicio": ini}
        for t, v in p.items():
            linha[t] = round(percentil(ano, t, v), 1) if percentil(ano, t, v) is not None else None
        passagens.append(linha)
    tr = [t for t in TRACO_SINAL]
    passagens = [p for p in passagens if all(p[t] is not None for t in tr)]
    print(f"passagens com 10+ rodadas e perfil completo: {len(passagens)} · "
          f"{len({p['treinador'] for p in passagens})} treinadores")

    # ---- 1. repete em clubes diferentes? ----
    por_tec = collections.defaultdict(list)
    for p in passagens:
        por_tec[p["treinador"]].append(p)
    multi = {k: v for k, v in por_tec.items() if len({x["clube"] for x in v}) >= 2}
    repete = []
    for tec, ps in multi.items():
        amp = {t: round(max(x[t] for x in ps) - min(x[t] for x in ps), 1) for t in tr}
        pares = [(a, b) for i, a in enumerate(ps) for b in ps[i + 1:] if a["clube"] != b["clube"]]
        rhos = []
        for a, b in pares:
            rho, _ = stats.spearmanr([a[t] for t in tr], [b[t] for t in tr])
            if not np.isnan(rho):
                rhos.append(float(rho))
        repete.append({"treinador": tec, "passagens": len(ps),
                       "clubes": len({x["clube"] for x in ps}),
                       "rho_medio_entre_clubes": round(float(np.mean(rhos)), 3) if rhos else None,
                       "amplitude_mediana": round(float(np.median(list(amp.values()))), 1),
                       "amplitude_por_traco": amp})
    repete.sort(key=lambda x: -(x["rho_medio_entre_clubes"] or -9))

    # a linha de base: dois clube-temporadas quaisquer se parecem quanto?
    todos = [p for p in passagens]
    nulo = []
    rng = np.random.default_rng(20260917)
    for _ in range(2000):
        a, b = rng.choice(len(todos), 2, replace=False)
        rho, _ = stats.spearmanr([todos[a][t] for t in tr], [todos[b][t] for t in tr])
        if not np.isnan(rho):
            nulo.append(float(rho))

    # ---- 2. antes e depois, no mesmo clube e temporada ----
    antes_depois = []
    for (tec, clube, ano, ini), ds in por_pass.items():
        if ds[0]["interino"] == "1":
            continue
        todas = sorted([d for d in donos if d["clube_wyscout"] == clube
                        and d["temporada"] == ano], key=lambda d: int(d["rodada"]))
        rodadas_dele = {int(d["rodada"]) for d in ds}
        if not rodadas_dele:
            continue
        r0 = min(rodadas_dele)
        antes = [jog_por[(ano, clube, d["data"])] for d in todas
                 if int(d["rodada"]) < r0 and (ano, clube, d["data"]) in jog_por]
        depois = [jog_por[(ano, clube, d["data"])] for d in todas
                  if int(d["rodada"]) in rodadas_dele and (ano, clube, d["data"]) in jog_por]
        if len(antes) < MIN_LADO or len(depois) < MIN_LADO:
            continue
        pa, pd_ = perfil(antes), perfil(depois)
        l = {"treinador": tec, "clube": clube, "temporada": ano,
             "jogos_antes": len(antes), "jogos_depois": len(depois)}
        for t in tr:
            a = percentil(ano, t, pa[t]); b = percentil(ano, t, pd_[t])
            l[t + "_antes"] = round(a, 1) if a is not None else None
            l[t + "_depois"] = round(b, 1) if b is not None else None
            l[t + "_mudou"] = round(b - a, 1) if a is not None and b is not None else None
        antes_depois.append(l)

    with open(os.path.join(R, "T03_passagens.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(passagens[0]))
        w.writeheader(); w.writerows(passagens)
    if antes_depois:
        with open(os.path.join(R, "T03_antes_depois.csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(antes_depois[0]))
            w.writeheader(); w.writerows(antes_depois)

    mudancas = {t: [l[t + "_mudou"] for l in antes_depois if l[t + "_mudou"] is not None]
                for t in tr}
    json.dump({"tracos": tr, "n_passagens": len(passagens),
               "n_treinadores": len({p["treinador"] for p in passagens}),
               "multiclube": len(multi),
               "repete": repete,
               "nulo_dois_quaisquer": {"rho_medio": round(float(np.mean(nulo)), 3),
                                       "p50": round(float(np.percentile(nulo, 50)), 3),
                                       "p90": round(float(np.percentile(nulo, 90)), 3),
                                       "n": len(nulo)},
               "antes_depois": {"n": len(antes_depois),
                                "por_traco": {t: {"mediana": round(float(np.median(v)), 1),
                                                  "n": len(v),
                                                  "p_wilcoxon": round(float(stats.wilcoxon(v)[1]), 4)
                                                  if len(v) > 5 else None}
                                              for t, v in mudancas.items() if v}}},
              open(os.path.join(R, "T03_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*84}\nO PERFIL REPETE EM CLUBES DIFERENTES? ({len(multi)} treinadores multiclube)\n{'='*84}")
    print(f"{'treinador':24s} {'pass':>4s} {'cl':>3s} {'rho entre clubes':>17s} {'amplitude mediana':>18s}")
    for x in repete[:14]:
        print(f"{x['treinador'][:24]:24s} {x['passagens']:4d} {x['clubes']:3d} "
              f"{(x['rho_medio_entre_clubes'] if x['rho_medio_entre_clubes'] is not None else 0):17.2f} "
              f"{x['amplitude_mediana']:18.1f}")
    nl = json.load(open(os.path.join(R, "T03_resumo.json"), encoding="utf-8"))["nulo_dois_quaisquer"]
    print(f"\n  linha de base — duas passagens QUAISQUER: rho médio {nl['rho_medio']}, "
          f"mediana {nl['p50']}, percentil 90 {nl['p90']}")

    print(f"\n{'='*84}\nANTES E DEPOIS DA CHEGADA, mesmo clube e temporada ({len(antes_depois)} casos)\n{'='*84}")
    print(f"{'traço':24s} {'mudança mediana':>16s} {'n':>4s} {'p (Wilcoxon)':>13s}")
    for t, v in mudancas.items():
        if v:
            p = stats.wilcoxon(v)[1] if len(v) > 5 else float("nan")
            print(f"{t:24s} {np.median(v):+16.1f} {len(v):4d} {p:13.4f}")


if __name__ == "__main__":
    main()
