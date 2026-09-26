"""Bloco 11 — Treinador e modelo de jogo. Que time cada treinador monta, se o estilo viaja com ele,
e se estilo explica resultado.

Base: jogos da Série B 2022–2026 (serieb_jogos.csv, Wyscout, por time e jogo) + físico do time por jogo
(resultados/b1/jogo_time.csv, SkillCorner) + passagens de treinador (resultados/b4/passagens.csv: clube,
temporada, rodada do primeiro e do último jogo, rendimento acima do dinheiro). Cada jogo recebe o
treinador pelo número do jogo do clube na temporada. Estilo da passagem = média dos jogos,
padronizada dentro da temporada (z; 0 = média da liga naquele ano).
"""
import os
import numpy as np, pandas as pd
from _comum import *

OUT = os.path.join(RES, "b11"); os.makedirs(OUT, exist_ok=True)
EST = {  # coluna -> (rótulo, sentido)
    "posse": "Posse %", "passes_posse": "Passes por posse", "passe_longo": "% de passe longo", "ppda": "PPDA (maior = pressiona menos)",
    "rec_altas": "Recuperações no campo de ataque", "cruz": "Cruzamentos", "contra": "Contra-ataques", "posic": "Ataques posicionais",
    "entradas": "Entradas na área", "dist_rem": "Distância média do remate (m)", "xg": "xG a favor", "xg_sof": "xG sofrido",
    "bp": "Bolas paradas", "aereos": "Duelos aéreos ganhos %", "hi": "Ações de alta intensidade/90 (físico)", "spr": "Sprints/90 (físico)",
    "dist": "Distância/90 (físico)"}
FOCO = ["Léo Condé", "Eduardo Baptista", "Mozart", "Claudio Tencati", "Guto Ferreira", "Thiago Carpini"]


def jogos():
    j = jogos_serie_b()
    num = lambda c: pd.to_numeric(j[c], errors="coerce")
    g = pd.DataFrame({"ano": j.ano, "clube": j.Equipa, "data": j.Data, "jogo": j.Jogo, "sistema": j.Sistema.str.replace(r" \(.*", "", regex=True),
                      "posse": num("Posse, %"), "passes_posse": num("Média de passes por posse"), "passe_longo": num("% de passe longo"),
                      "ppda": num("PPDA"), "rec_altas": num("Recuperações longo"), "cruz": num("Cruzamentos"), "contra": num("Contra-ataques"),
                      "posic": num("Ataques posicionais"), "entradas": num("Entradas na grande área"), "dist_rem": num("Distância média do remate"),
                      "xg": num("Golos esperados"), "bp": num("Bolas paradas"), "aereos": num("Duelos aéreos ganhos, %"),
                      "gp": num("golos_pro"), "gc": num("golos_contra")})
    # xG sofrido = xG do adversário no mesmo jogo
    opp = g[["jogo", "data", "clube", "xg"]].rename(columns={"clube": "adv", "xg": "xg_sof"})
    g = g.merge(opp, on=["jogo", "data"]); g = g[g.clube != g.adv].drop(columns="adv")
    g["pts"] = np.where(g.gp > g.gc, 3, np.where(g.gp == g.gc, 1, 0))
    g = g.sort_values(["ano", "clube", "data"]); g["n_jogo"] = g.groupby(["ano", "clube"]).cumcount() + 1
    f = pd.read_csv(os.path.join(RES, "b1", "jogo_time.csv"), parse_dates=["data"])
    f = f.rename(columns={"hi_count_p90": "hi", "sprint_count_p90": "spr", "distance_p90": "dist"})[["ano", "clube", "data", "hi", "spr", "dist"]]
    return g.merge(f, on=["ano", "clube", "data"], how="left")


def sp(a, b):
    x = pd.DataFrame({"a": a, "b": b}).dropna()
    return round(x.a.rank().corr(x.b.rank()), 2)


def main():
    g = jogos()
    p = pd.read_csv(os.path.join(RES, "b4", "passagens.csv"))
    p = p[p.ano >= 2022].rename(columns={"Equipa": "clube"})
    rows = []
    for r in p.itertuples():
        x = g[(g.ano == r.ano) & (g.clube == r.clube) & (g.n_jogo >= r.primeiro) & (g.n_jogo <= r.ultimo)]
        if len(x) < 8: continue
        sis = x.sistema.value_counts(normalize=True)
        d = {"ano": r.ano, "clube": r.clube, "treinador": r.treinador, "jogos": len(x), "ppj": x.pts.mean(),
             "rendimento": r.rendimento, "sistema": sis.index[0], "sistema_pct": round(sis.iloc[0], 2),
             "sistemas": " / ".join(f"{k} {v:.0%}" for k, v in sis.head(3).items())}
        d.update({k: x[k].mean() for k in EST})
        rows.append(d)
    P = pd.DataFrame(rows)
    # z dentro da temporada (média de todas as passagens do ano)
    Z = P.copy()
    for k in EST:
        Z[k] = (P[k] - P.groupby("ano")[k].transform("mean")) / P.groupby("ano")[k].transform("std")
    P.to_csv(os.path.join(OUT, "passagens_estilo.csv"), index=False); Z.to_csv(os.path.join(OUT, "passagens_estilo_z.csv"), index=False)

    # 1. estilo × rendimento (passagens com ≥ 15 jogos)
    a = Z[(Z.jogos >= 15) & Z.rendimento.notna()]
    R = pd.DataFrame([{"estilo": EST[k], "k": k, "n": len(a), "r_rendimento": round(a[k].rank().corr(a.rendimento.rank()), 2),
                       "r_ppj": round(a[k].rank().corr(a.ppj.rank()), 2)} for k in EST]).sort_values("r_rendimento")
    R.to_csv(os.path.join(OUT, "estilo_x_resultado.csv"), index=False)

    # 2. o estilo viaja com o treinador? similaridade entre passagens do MESMO treinador em clubes
    #    diferentes × entre treinadores diferentes (correlação entre os vetores de estilo)
    V = Z.set_index(["treinador", "clube", "ano"])[list(EST)].dropna()
    idx = list(V.index); M = V.values
    mesmo, outro = [], []
    for i in range(len(idx)):
        for j_ in range(i + 1, len(idx)):
            c = np.corrcoef(M[i], M[j_])[0, 1]
            if idx[i][0] == idx[j_][0] and idx[i][1] != idx[j_][1]: mesmo.append(c)
            elif idx[i][0] != idx[j_][0]: outro.append(c)
    # e cada dimensão: correlação da passagem com a seguinte do mesmo treinador em outro clube
    pares = []
    for t_, x in Z.sort_values(["treinador", "ano"]).groupby("treinador"):
        x = x.reset_index(drop=True)
        for i in range(len(x) - 1):
            if x.clube[i] != x.clube[i + 1]: pares.append((x.iloc[i], x.iloc[i + 1]))
    viaja = pd.DataFrame([{"estilo": EST[k], "r_mesmo_treinador_outro_clube": sp([a_[k] for a_, b_ in pares], [b_[k] for a_, b_ in pares]),
                           "n_pares": len(pares)} for k in EST])
    # contra-prova: o clube repete o estilo com OUTRO treinador?
    pc = []
    for c_, x in Z.sort_values(["clube", "ano"]).groupby("clube"):
        x = x.reset_index(drop=True)
        for i in range(len(x) - 1):
            if x.treinador[i] != x.treinador[i + 1]: pc.append((x.iloc[i], x.iloc[i + 1]))
    viaja["r_mesmo_clube_outro_treinador"] = [sp([a_[k] for a_, b_ in pc], [b_[k] for a_, b_ in pc]) for k in EST]
    viaja["n_pares_clube"] = len(pc)
    viaja.to_csv(os.path.join(OUT, "estilo_viaja.csv"), index=False)
    print("similaridade média: mesmo treinador/outro clube", round(np.mean(mesmo), 2), len(mesmo), "| treinadores diferentes", round(np.mean(outro), 2), len(outro))

    # 3. perfis dos treinadores em foco
    F = Z[Z.treinador.isin(FOCO)].sort_values(["treinador", "ano"])
    F.to_csv(os.path.join(OUT, "perfis_foco_z.csv"), index=False)
    medios = Z[Z.treinador.isin(FOCO)].groupby("treinador")[list(EST)].mean()
    sim = medios.T.corr().round(2); sim.to_csv(os.path.join(OUT, "similaridade_foco.csv"))
    # 4. treinadores que rendem × os demais (passagens ≥ 15 jogos)
    a["grupo"] = np.where(a.rendimento >= a.rendimento.quantile(0.75), "rende (quartil de cima)", np.where(a.rendimento <= a.rendimento.quantile(0.25), "quartil de baixo", "meio"))
    Gp = a.groupby("grupo")[list(EST)].mean().T.round(2); Gp.to_csv(os.path.join(OUT, "estilo_por_grupo.csv"))
    sis = a.groupby("grupo").sistema.value_counts(normalize=True).round(2).unstack(0).fillna(0); sis.to_csv(os.path.join(OUT, "sistema_por_grupo.csv"))
    pd.set_option("display.width", 250)
    print(R.to_string()); print(viaja.to_string()); print(sim.to_string()); print(Gp.to_string()); print(sis.head(10).to_string())
    print(F[["treinador", "clube", "ano", "jogos", "rendimento", "sistemas"] + list(EST)].round(1).to_string())


if __name__ == "__main__":
    main()
