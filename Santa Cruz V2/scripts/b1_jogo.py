"""Bloco 1, físico por JOGO (5 temporadas, desde 22/09/2026) — três perguntas:
 1) Anterioridade: a intensidade do time no 1º turno prevê os pontos do 2º turno, descontando os
    pontos do 1º turno e o valor do elenco? (porta temporal)
 2) Dentro do mesmo clube, o jogo em que corre mais forte é o jogo em que pontua?
 3) Desgaste: turno × returno, por temporada.
Escreve resultados/b1/jogo_time.csv, jogo_anterioridade.csv, jogo_dentro_clube.csv, desgaste.csv
"""
import os
import numpy as np, pandas as pd
from _comum import *
from b1_time import boot_corr

MET = [("distance_p90", "Distância/90"), ("hsr_distance_p90", "Alta velocidade/90"), ("sprint_distance_p90", "Sprint/90"),
       ("sprint_count_p90", "Sprints/90"), ("hi_count_p90", "Ações alta intensidade/90"), ("expl_accel_sprint_p90", "Arrancadas explosivas/90"),
       ("high_accel_p90", "Acelerações fortes/90"), ("psv99", "PSV-99")]

def main():
    out = os.path.join(RES, "b1"); con = skillcorner()
    pm = pd.read_sql("select * from physical_match where minutes_played >= 60 and position_group != 'Goalkeeper'", con)
    pm["ano"] = pm.sc_competition_edition_id.map(EDICOES); pm["data"] = pd.to_datetime(pm.match_date)
    print("jogador-jogo (>=60 min, linha):", len(pm), pm.groupby("ano").size().to_dict())
    # ponte de clube: team_name do SkillCorner -> clube Wyscout, por temporada, pelo conjunto de datas dos jogos
    j = jogos_serie_b(); j["data"] = j.Data.dt.normalize()
    ponte = {}
    for ano in sorted(pm.ano.unique()):
        sc = pm[pm.ano == ano].groupby("team_name").data.apply(lambda s: set(s.dt.normalize()))
        wy = j[j.ano == ano].groupby("Equipa").data.apply(set)
        for tn, ds in sc.items():
            melhor = max(wy.items(), key=lambda kv: len(ds & kv[1]))
            if len(ds & melhor[1]) >= 5: ponte[(ano, tn)] = melhor[0]
    pm["clube"] = [ponte.get((a, t)) for a, t in zip(pm.ano, pm.team_name)]
    print("clubes sem ponte:", pm[pm.clube.isna()].team_name.unique())
    pm = pm.dropna(subset=["clube"])
    # time-jogo: média dos jogadores (>=60 min) ponderada por minutos
    cols = [c for c, _ in MET]
    tj = pm.groupby(["ano", "clube", "data"]).apply(lambda g: pd.Series({**{c: np.average(g[c].dropna(), weights=g.loc[g[c].notna(), "minutes_played"]) if g[c].notna().any() else np.nan for c in cols}, "n_jog": len(g)})).reset_index()
    jj = j[["ano", "Equipa", "data", "resultado", "mando", "Golos esperados", "adversario"]].rename(columns={"Equipa": "clube"})
    jj["pts"] = jj.resultado.map({"V": 3, "E": 1, "D": 0})
    # casar por data com tolerância de 1 dia (fuso do SkillCorner)
    tj = tj.sort_values("data"); jj = jj.sort_values("data")
    tj = pd.merge_asof(tj, jj, on="data", by=["ano", "clube"], tolerance=pd.Timedelta("1D"), direction="nearest").dropna(subset=["pts"])
    tj = tj[~tj.duplicated(["ano", "clube", "adversario", "mando"], keep="first")]
    tj["n_jogo"] = tj.groupby(["ano", "clube"]).data.rank(method="first"); tj["turno"] = np.where(tj.n_jogo <= 19, 1, 2)
    tj.to_csv(os.path.join(out, "jogo_time.csv"), index=False)
    print("clube-jogos com físico e resultado:", len(tj), "| por ano:", tj.groupby("ano").size().to_dict())
    ct = clube_temporada()
    # 1) anterioridade
    f = tj[tj.ano <= 2025]
    t1 = f[f.turno == 1].groupby(["ano", "clube"]).agg(**{c: (c, "mean") for c in cols}, pts1=("pts", "sum"), n1=("pts", "size")).reset_index()
    t2 = f[f.turno == 2].groupby(["ano", "clube"]).agg(pts2=("pts", "sum"), n2=("pts", "size")).reset_index()
    a = t1.merge(t2, on=["ano", "clube"]).merge(ct[["ano", "clube", "log_valor"]], on=["ano", "clube"])
    a = a[(a.n1 >= 12) & (a.n2 >= 12)]
    rows = []
    for c, nome in MET:
        d = a.dropna(subset=[c]); x = d.groupby("ano")[c].rank(pct=True).values
        # resíduo de pts2 descontando pts1 e valor
        X = np.column_stack([np.ones(len(d)), d.pts1 / d.n1, d.log_valor]); y = d.pts2 / d.n2
        res = (y - X @ np.linalg.lstsq(X, y, rcond=None)[0]).values
        xr = x - np.column_stack([np.ones(len(d)), d.pts1 / d.n1, d.log_valor]) @ np.linalg.lstsq(np.column_stack([np.ones(len(d)), d.pts1 / d.n1, d.log_valor]), x, rcond=None)[0]
        r = np.corrcoef(xr, res)[0, 1]; ic, p = boot_corr(xr, res, d.clube.values, n=3000)
        r_bruto = np.corrcoef(x, y)[0, 1]
        rows.append(dict(indicador=nome, n=len(d), r_parcial_1o_turno_prev_2o=round(r, 3), ic_baixo=round(ic[0], 3), ic_alto=round(ic[1], 3), p_boot=round(p, 4), r_bruto=round(r_bruto, 3)))
    an = pd.DataFrame(rows).sort_values("r_parcial_1o_turno_prev_2o", ascending=False); an.to_csv(os.path.join(out, "jogo_anterioridade.csv"), index=False)
    print("\n=== 1º turno físico → pontos do 2º turno (descontado pontos do 1º e valor), n =", len(a)); print(an.to_string(index=False))
    # 2) dentro do clube
    d = f.copy()
    for c in cols: d[c + "_c"] = d[c] - d.groupby(["ano", "clube", "mando"])[c].transform("mean")
    d["pts_c"] = d.pts - d.groupby(["ano", "clube", "mando"]).pts.transform("mean")
    rows = []
    for c, nome in MET:
        dd = d.dropna(subset=[c + "_c"]); x = dd[c + "_c"].values; y = dd.pts_c.values
        r = np.corrcoef(x, y)[0, 1]; ic, p = boot_corr(x, y, dd.clube.values, n=1000)
        q = pd.qcut(x, 4, labels=False, duplicates="drop"); ef = dd.pts.values[q == q.max()].mean() - dd.pts.values[q == 0].mean()
        rows.append(dict(indicador=nome, n_jogos=len(dd), r_dentro_do_clube=round(r, 3), ic_baixo=round(ic[0], 3), ic_alto=round(ic[1], 3), pts_top_menos_fundo=round(ef, 2)))
    dc = pd.DataFrame(rows).sort_values("r_dentro_do_clube", ascending=False); dc.to_csv(os.path.join(out, "jogo_dentro_clube.csv"), index=False)
    print("\n=== dentro do mesmo clube: corre mais forte no jogo em que pontua?"); print(dc.to_string(index=False))
    # 3) desgaste, 5 temporadas: mesmo jogador, turno 2 - turno 1
    pm2 = pd.merge_asof(pm.sort_values("data"), tj[["ano", "clube", "data", "turno"]].sort_values("data"), on="data", by=["ano", "clube"], tolerance=pd.Timedelta("1D"), direction="nearest").dropna(subset=["turno"])
    rows = []
    for (ano, cl), g in pm2.groupby(["ano", "clube"]):
        for c in ("hsr_distance_p90", "sprint_distance_p90", "distance_p90"):
            t = g.groupby(["sc_player_id", "turno"])[c].mean().unstack().dropna(); t.columns = [int(x) for x in t.columns]
            if len(t) >= 5 and 1 in t.columns and 2 in t.columns: rows.append(dict(ano=ano, clube=cl, indicador=c, queda=round((t[2] - t[1]).mean(), 1), n_jog=len(t)))
    ds = pd.DataFrame(rows).merge(ct[["ano", "clube", "faixa", "rendimento", "pontos"]], on=["ano", "clube"]); ds.to_csv(os.path.join(out, "desgaste.csv"), index=False)
    print("\n=== desgaste turno→returno (mesmo jogador), média por ano e faixa")
    print(ds[ds.indicador == "hsr_distance_p90"].pivot_table(index="ano", columns="faixa", values="queda", aggfunc="mean").round(1))
    q = ds[(ds.indicador == "hsr_distance_p90") & (ds.ano <= 2025)]; print("queda HSR × rendimento r =", round(np.corrcoef(q.queda, q.rendimento)[0, 1], 3), "| média liga:", round(q.queda.mean(), 1))

if __name__ == "__main__":
    main()
