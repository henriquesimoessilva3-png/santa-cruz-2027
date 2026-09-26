"""Bloco 8 — Físico × técnico. O físico do jogador tem a ver com o que ele produz em campo?

Base: jogador-temporada da Série B 2022–2026 com físico (SkillCorner, resultados/b1/perfis/jogadores.csv)
casado com o técnico do Wyscout (serieb_tecnico.csv) pelo mesmo ano, clube e nome. ≥ 900 min,
jogadores de linha.

1. Ligações: correlação de postos (Spearman) entre cada indicador físico e cada indicador técnico,
   dentro do setor, com os dois lados padronizados dentro da temporada. Versão "a time igual":
   os dois lados descontam a média do clube-temporada (o que é do time sai).
2. Tipos físicos por setor: k-means (k=3) no perfil físico padronizado; cada tipo recebe nome pelo
   que mais o separa, e mostra o que produz no técnico e no resultado do time.
3. Destaques 2026: quem junta o físico que anda com a produção e a própria produção.
Saída: resultados/b8/*.csv e B8.md (escrito à mão a partir daqui).
"""
import os
import numpy as np, pandas as pd
from _comum import *

OUT = os.path.join(RES, "b8"); os.makedirs(OUT, exist_ok=True)
FIS = {"psv99": "Velocidade de pico (PSV-99)", "sprint_count_p90": "Sprints/90", "hi_count_p90": "Ações de alta intensidade/90",
       "expl_accel_sprint_p90": "Arrancadas explosivas/90", "distance_p90": "Distância/90", "high_accel_p90": "Acelerações fortes/90",
       "cod_count_p90": "Mudanças de direção/90", "runs_p30tip": "Corridas sem bola (30' com posse)",
       "runs_penalty_area_p30tip": "Corridas para a área (30' com posse)", "sprint_distance_p30tip": "Sprint com a bola (m/30')",
       "sprint_distance_p30otip": "Sprint sem a bola (m/30')"}
TEC = {"Duelos/90": "Duelos/90", "Duelos ganhos, %": "Duelos ganhos %", "Duelos defensivos/90": "Duelos defensivos/90",
       "Duelos defensivos ganhos, %": "Duelos def. ganhos %", "Duelos aéreos/90": "Duelos aéreos/90",
       "Duelos aéreos ganhos, %": "Duelos aéreos ganhos %", "Duelos ofensivos/90": "Duelos ofensivos/90",
       "Duelos ofensivos ganhos, %": "Duelos of. ganhos %", "Interseções/90": "Interceptações/90",
       "Dribles/90": "Dribles/90", "Corridas progressivas/90": "Corridas progressivas/90",
       "Toques na área/90": "Toques na área/90", "Acções atacantes com sucesso/90": "Ações ofensivas certas/90",
       "Golos esperados/90": "xG/90", "Assistências esperadas/90": "xA/90", "ga90": "Gols + assist./90",
       "xgxa90": "xG + xA/90", "Passes progressivos/90": "Passes progressivos/90", "Faltas sofridas/90": "Faltas sofridas/90",
       "Passes chave/90": "Passes chave/90"}
SETORES = ["Zaga", "Lateral", "Volante", "Meia", "Extremo", "Atacante"]


def base():
    f = pd.read_csv(os.path.join(RES, "b1", "perfis", "jogadores.csv"))
    f["chave"] = f.jogador.map(chave)
    f["setor"] = f.pos11.map({"ZD": "Zaga", "ZE": "Zaga", "LD": "Lateral", "LE": "Lateral", "VOL": "Volante", "MED": "Meia",
                              "MEI": "Meia", "ED": "Extremo", "EE": "Extremo", "CA": "Atacante"})
    t = tecnico()
    for c in TEC:
        if c in t: t[c] = pd.to_numeric(t[c], errors="coerce")
    t["ga90"] = pd.to_numeric(t["Golos/90"], errors="coerce") + pd.to_numeric(t["Assistências/90"], errors="coerce")
    t["xgxa90"] = t["Golos esperados/90"] + t["Assistências esperadas/90"]
    cols = ["ano", "clube", "chave"] + [c for c in TEC if c in t] + ["Altura", "Valor de mercado"]
    t = t[cols].drop_duplicates(["ano", "clube", "chave"])
    d = f.merge(t, on=["ano", "clube", "chave"], how="inner")
    d = d[(d.minutos >= 900) & (d.pos11 != "GOL") & d.setor.isin(SETORES)].copy()
    return d


def z_temporada(d, cols):
    z = d.copy()
    for c in cols:
        g = z.groupby(["ano", "setor"])[c]
        z[c] = (z[c] - g.transform("mean")) / g.transform("std")
    return z


def ligacoes(d):
    fis, tec = [c for c in FIS if c in d], [c for c in TEC if c in d]
    z = z_temporada(d, fis + tec)
    zt = z.copy()                                     # a time igual: tira a média do clube-temporada
    for c in fis + tec:
        zt[c] = zt[c] - zt.groupby(["ano", "clube"])[c].transform("mean")
    out = []
    for s in SETORES:
        a, b = z[z.setor == s], zt[zt.setor == s]
        for f_ in fis:
            for t_ in tec:
                x = a[[f_, t_]].dropna(); y = b[[f_, t_]].dropna()
                if len(x) < 40: continue
                r = x[f_].rank().corr(x[t_].rank()); r2 = y[f_].rank().corr(y[t_].rank())
                out.append(dict(setor=s, fisico=f_, tecnico=t_, n=len(x), r=round(r, 3), r_time_igual=round(r2, 3)))
    L = pd.DataFrame(out)
    L.to_csv(os.path.join(OUT, "ligacoes.csv"), index=False)
    return L


def tipos(d):
    from numpy.linalg import norm
    core = ["psv99", "sprint_count_p90", "hi_count_p90", "expl_accel_sprint_p90", "distance_p90", "runs_p30tip"]
    z = z_temporada(d, core)
    rng = np.random.default_rng(7)
    res = []
    for s in SETORES:
        a = z[z.setor == s].dropna(subset=core).copy()
        X = a[core].values
        best = None
        for _ in range(25):                               # k-means simples, várias sementes
            C = X[rng.choice(len(X), 3, replace=False)]
            for _ in range(100):
                lab = np.argmin(((X[:, None, :] - C[None]) ** 2).sum(2), 1)
                C2 = np.array([X[lab == k].mean(0) if (lab == k).any() else C[k] for k in range(3)])
                if np.allclose(C, C2): break
                C = C2
            sse = ((X - C[lab]) ** 2).sum()
            if best is None or sse < best[0]: best = (sse, lab, C)
        a["tipo_k"] = best[1]
        cen = pd.DataFrame(best[2], columns=core)
        def nome(row):
            vel = row.psv99; inten = (row.sprint_count_p90 + row.hi_count_p90 + row.expl_accel_sprint_p90) / 3
            vol = row.distance_p90; cor = row.runs_p30tip
            if inten > 0.5 and vel > 0.3: return "Explosivo e rápido"
            if inten > 0.5: return "Intenso (repete esforço)"
            if vol > 0.5 and inten <= 0.5: return "Motor de volume"
            if vel > 0.5: return "Rápido de pico, pouca repetição"
            if inten < -0.5 and vol < -0.3: return "Baixa intensidade"
            if cor > 0.5: return "Atacante de espaço (corre sem bola)"
            return "Médio em tudo"
        nomes = {k: nome(cen.iloc[k]) for k in range(3)}
        # nomes repetidos: desempata pelo centróide de intensidade
        a["tipo"] = a.tipo_k.map(nomes)
        if a.tipo.nunique() < 3:
            ordem = cen.assign(i=(cen.sprint_count_p90 + cen.hi_count_p90 + cen.expl_accel_sprint_p90) / 3).i.rank().astype(int)
            rot = {1: "Menos intenso", 2: "Intermediário", 3: "Mais intenso"}
            a["tipo"] = a.tipo_k.map({k: rot[ordem[k]] for k in range(3)})
        res.append(a)
    T = pd.concat(res)
    # perfil físico em unidade de jogo e produção técnica por tipo
    fis_u = ["psv99", "sprint_count_p90", "hi_count_p90", "expl_accel_sprint_p90", "distance_p90", "runs_p30tip"]
    tec_u = ["Duelos/90", "Duelos ganhos, %", "Duelos defensivos ganhos, %", "Duelos aéreos ganhos, %", "Duelos ofensivos/90",
             "Dribles/90", "Corridas progressivas/90", "Toques na área/90", "Acções atacantes com sucesso/90", "xgxa90", "ga90", "Interseções/90"]
    orig = d.set_index(["ano", "clube", "chave"])
    T = T.drop(columns=[c for c in fis_u + tec_u if c in T]).join(orig[fis_u + tec_u], on=["ano", "clube", "chave"])
    G = T.groupby(["setor", "tipo"]).agg(n=("chave", "size"), referencia=("time_referencia", "mean"),
                                         rendimento=("rendimento", "median"),
                                         **{c: (c, "median") for c in fis_u + tec_u}).reset_index()
    G.to_csv(os.path.join(OUT, "tipos_fisicos.csv"), index=False)
    T[["ano", "clube", "jogador", "pos11", "setor", "tipo", "minutos"] + fis_u + tec_u].to_csv(os.path.join(OUT, "jogadores_tipo.csv"), index=False)
    return G, T


if __name__ == "__main__":
    d = base()
    print("jogador-temporadas:", len(d), d.setor.value_counts().to_dict())
    L = ligacoes(d)
    pd.set_option("display.width", 250)
    for s in SETORES:
        x = L[(L.setor == s)].assign(a=lambda v: v.r.abs()).sort_values("a", ascending=False).head(10)
        print("\n==", s); print(x[["fisico", "tecnico", "n", "r", "r_time_igual"]].to_string(index=False))
    G, T = tipos(d)
    print(G.round(2).to_string())


# pares físico → produção escolhidos pelo que mais liga em cada setor (e sobrevive a time igual)
PARES = {"Zaga": ("cod_count_p90", "hi_count_p90", "Duelos defensivos/90", "Duelos ofensivos/90"),
         "Lateral": ("runs_penalty_area_p30tip", "hi_count_p90", "Toques na área/90", "Duelos/90"),
         "Volante": ("runs_penalty_area_p30tip", "sprint_distance_p30tip", "Toques na área/90", "xgxa90"),
         "Meia": ("runs_penalty_area_p30tip", "sprint_distance_p30tip", "xgxa90", "Toques na área/90"),
         "Extremo": ("runs_penalty_area_p30tip", "psv99", "Toques na área/90", "Golos esperados/90"),
         "Atacante": ("sprint_distance_p30tip", "distance_p90", "Corridas progressivas/90", "Duelos defensivos/90")}


def destaques(d):
    fora = excluidos()
    z = z_temporada(d, list(FIS) + [c for c in TEC if c in d])
    z = z[(z.ano == 2026)]
    out = []
    for s, (f1, f2, t1, t2) in PARES.items():
        a = z[z.setor == s].copy()
        a["fis"] = a[[f1, f2]].mean(1); a["tec"] = a[[t1, t2]].mean(1); a["score"] = a.fis + a.tec
        a = a[[not fora(j, c) for j, c in zip(a.jogador, a.clube)]]
        a = a[(a.fis > 0) & (a.tec > 0)].sort_values("score", ascending=False).head(6)
        orig = d.set_index(["ano", "clube", "chave"])
        for r in a.itertuples():
            o = orig.loc[(r.ano, r.clube, r.chave)]
            o = o.iloc[0] if isinstance(o, pd.DataFrame) else o
            out.append(dict(setor=s, jogador=r.jogador, clube=r.clube, pos=r.pos11, idade=r.idade, minutos=int(o.minutos),
                            fis1=f1, v_fis1=round(o[f1], 2), fis2=f2, v_fis2=round(o[f2], 2), tec1=t1, v_tec1=round(o[t1], 2),
                            tec2=t2, v_tec2=round(o[t2], 2), z_fis=round(r.fis, 2), z_tec=round(r.tec, 2)))
    D = pd.DataFrame(out); D.to_csv(os.path.join(OUT, "destaques_2026.csv"), index=False)
    return D


if __name__ == "__main__":
    print(destaques(base()).to_string())
