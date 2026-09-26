"""Bloco 15 — Sofascore jogo a jogo (Série B 2022–2026, 1.807 jogos): escalações com minutos, nota e
estatísticas por jogador; estatísticas de time por tempo (grandes chances, chutes na área, entradas no
terço final, posse por período); momentum minuto a minuto; desfalques com motivo. Em 2025–26 traz ainda
xG/xA por jogador e físico do próprio Sofascore (velocidade máxima, km, sprints).
Entrada: bases/coletas/sofascore_serieb_jogos.json.gz (+ bola_parada_jogadores_sofascore.json para o mapa evento → ano/clubes).
Saídas: resultados/b15/{time_jogo,jogador_jogo,momentum,desfalques,clube_temporada,jogador_temporada,testes}.csv e B15.md"""
import os, gzip, json, numpy as np, pandas as pd
from _comum import RAIZ, chave, tecnico
from b3_bp_jogadores_sofascore import TIMES
from b11_treinador_modelo import sp
OUT = os.path.join(RAIZ, "resultados", "b15"); os.makedirs(OUT, exist_ok=True)
RES = os.path.join(RAIZ, "resultados"); COL = os.path.join(RAIZ, "bases", "coletas")
MOTIVO = {1: "lesão", 3: "suspensão", 11: "outro", 13: "outro"}

def nome_clube(n, clubes):
    k = chave(n); k = TIMES.get(k, k)
    return clubes.get(chave(k), k)

def carregar():
    D = json.load(gzip.open(os.path.join(COL, "sofascore_serieb_jogos.json.gz"), "rt", encoding="utf-8"))["eventos"]
    J = json.load(open(os.path.join(COL, "bola_parada_jogadores_sofascore.json"), encoding="utf-8"))["jogos"]
    t = tecnico(); clubes = {chave(c): c for c in t.clube.unique()}
    meta = {}
    for comp, ano, ev, ts, h, a, gh, ga, *_ in J:
        meta[str(ev)] = dict(ano=ano, data=pd.to_datetime(ts, unit="s"), casa=nome_clube(h, clubes), fora=nome_clube(a, clubes), gh=gh, ga=ga)
    return D, meta

def main():
    D, meta = carregar()
    TJ, PJ, MO, DF = [], [], [], []
    for ev, e in D.items():
        m = meta.get(ev)
        if not m: continue
        st = e["st"]
        for lado, clube, adv, gp, gc, idx in (("casa", m["casa"], m["fora"], m["gh"], m["ga"], 0), ("fora", m["fora"], m["casa"], m["ga"], m["gh"], 1)):
            row = dict(evento=int(ev), ano=m["ano"], data=m["data"], clube=clube, adversario=adv, mando=lado, gp=gp, gc=gc,
                       pts=3 if gp > gc else (1 if gp == gc else 0), formacao=(e["h"] if idx == 0 else e["a"]).get("f"))
            for per in ("ALL", "1ST", "2ND"):
                for k, v in st.get(per, {}).items():
                    if isinstance(v, list) and len(v) == 2:
                        row[f"{k}_{per}"] = v[idx]; row[f"{k}_{per}_adv"] = v[1 - idx]
            TJ.append(row)
            side = e["h"] if idx == 0 else e["a"]
            for p in side["p"]:
                q = dict(evento=int(ev), ano=m["ano"], data=m["data"], clube=clube, sid=p["id"], nome=p["n"], pos=p.get("pos"), titular=1 - p.get("sub", 0))
                q.update({k: v for k, v in p.items() if k not in ("id", "n", "pos", "sub", "ratingVersions")})
                PJ.append(q)
            for mp in side["mp"]:
                DF.append(dict(evento=int(ev), ano=m["ano"], data=m["data"], clube=clube, sid=mp[0], nome=mp[1], motivo=MOTIVO.get(mp[2], "outro"), tipo=mp[3]))
        g = e.get("g") or []
        if g:
            vals = np.array([v for _, v in g], dtype=float); mins = np.array([mn for mn, _ in g])
            MO.append(dict(evento=int(ev), ano=m["ano"], casa=m["casa"], fora=m["fora"], n=len(g), casa_pos_pct=(vals > 0).mean(), soma=vals.sum(),
                           ult15=vals[mins >= 76].sum(), prim15=vals[mins <= 15].sum(), tempo1=vals[mins <= 45].sum(), tempo2=vals[mins > 45].sum()))
    TJ = pd.DataFrame(TJ); PJ = pd.DataFrame(PJ); MO = pd.DataFrame(MO); DF = pd.DataFrame(DF)
    for d, n in ((TJ, "time_jogo"), (PJ, "jogador_jogo"), (MO, "momentum"), (DF, "desfalques")):
        d.to_csv(os.path.join(OUT, n + ".csv"), index=False)
    print("time_jogo", TJ.shape, "jogador_jogo", PJ.shape, "momentum", MO.shape, "desfalques", DF.shape)
    print(TJ.clube.value_counts().tail(8).to_dict())

    # ---------- clube-temporada ----------
    ct = pd.read_csv(os.path.join(RES, "b5", "clube_temporada.csv"))[["ano", "clube", "pontos", "ppj", "rendimento", "faixa", "valor_eur"]]
    def g(c): return TJ[c] if c in TJ else np.nan
    TJ["bc_criadas"] = g("bigChanceCreated_ALL"); TJ["bc_perdidas"] = g("bigChanceMissed_ALL"); TJ["bc_marcadas"] = g("bigChanceScored_ALL")
    TJ["bc_cedidas"] = g("bigChanceCreated_ALL_adv"); TJ["chutes_area"] = g("totalShotsInsideBox_ALL"); TJ["chutes_fora_area"] = g("totalShotsOutsideBox_ALL")
    TJ["chutes_area_adv"] = g("totalShotsInsideBox_ALL_adv"); TJ["terco_final"] = g("finalThirdEntries_ALL"); TJ["terco_final_adv"] = g("finalThirdEntries_ALL_adv")
    TJ["posse_1t"] = g("ballPossession_1ST"); TJ["posse_2t"] = g("ballPossession_2ND"); TJ["defesas_gk"] = g("goalkeeperSaves_ALL")
    TJ["chutes_1t"] = g("totalShotsOnGoal_1ST"); TJ["chutes_2t"] = g("totalShotsOnGoal_2ND"); TJ["chutes_sof_1t"] = g("totalShotsOnGoal_1ST_adv"); TJ["chutes_sof_2t"] = g("totalShotsOnGoal_2ND_adv")
    TJ["pct_area"] = TJ.chutes_area / (TJ.chutes_area + TJ.chutes_fora_area)
    TJ["pct_area_adv"] = TJ.chutes_area_adv / (TJ.chutes_area_adv + g("totalShotsOutsideBox_ALL_adv"))
    TJ["bc_conv"] = TJ.bc_marcadas / TJ.bc_criadas.replace(0, np.nan)
    # momentum por clube-jogo
    mo = []
    for r in MO.itertuples():
        mo.append(dict(evento=r.evento, clube=r.casa, mom_pct=r.casa_pos_pct, mom_ult15=r.ult15, mom_t2=r.tempo2))
        mo.append(dict(evento=r.evento, clube=r.fora, mom_pct=1 - r.casa_pos_pct, mom_ult15=-r.ult15, mom_t2=-r.tempo2))
    TJ = TJ.merge(pd.DataFrame(mo), on=["evento", "clube"], how="left")
    IND = {"bc_criadas": "Grandes chances criadas", "bc_cedidas": "Grandes chances cedidas", "bc_perdidas": "Grandes chances perdidas", "bc_conv": "Conversão de grandes chances %",
           "chutes_area": "Chutes dentro da área", "chutes_area_adv": "Chutes dentro da área sofridos", "pct_area": "% dos chutes dentro da área", "pct_area_adv": "% dos chutes sofridos dentro da área",
           "terco_final": "Entradas no terço final", "terco_final_adv": "Entradas no terço final cedidas", "posse_1t": "Posse 1º tempo", "posse_2t": "Posse 2º tempo",
           "chutes_sof_1t": "Chutes sofridos 1º tempo", "chutes_sof_2t": "Chutes sofridos 2º tempo", "defesas_gk": "Defesas do goleiro",
           "mom_pct": "Minutos com momentum a favor %", "mom_ult15": "Momentum nos 15 finais", "mom_t2": "Momentum no 2º tempo"}
    CT = TJ.groupby(["ano", "clube"])[list(IND)].mean().reset_index()
    # desfalques e titulares
    dfl = DF[DF.motivo == "lesão"].groupby(["ano", "clube"]).size().rename("jogador_jogos_lesao").reset_index()
    dfs = DF[DF.motivo == "suspensão"].groupby(["ano", "clube"]).size().rename("jogador_jogos_suspensao").reset_index()
    tit = PJ[PJ.titular == 1].groupby(["ano", "clube"]).agg(titulares_distintos=("sid", "nunique"))
    top11 = PJ[PJ.titular == 1].groupby(["ano", "clube", "sid"]).size().reset_index(name="n").sort_values("n", ascending=False)
    top11 = top11.groupby(["ano", "clube"]).head(11).groupby(["ano", "clube"]).n.sum().rename("titularidades_top11")
    jogos_n = TJ.groupby(["ano", "clube"]).size().rename("jogos")
    tit = tit.join(top11).join(jogos_n).reset_index(); tit["onze_fixo_pct"] = tit.titularidades_top11 / (11 * tit.jogos)
    rat = PJ[PJ.minutesPlayed.fillna(0) >= 60].groupby(["ano", "clube"]).rating.agg(nota_media="mean", nota_desvio="std").reset_index()
    CT = CT.merge(dfl, how="left").merge(dfs, how="left").merge(tit, how="left").merge(rat, how="left").merge(ct, on=["ano", "clube"], how="inner")
    CT["jogador_jogos_lesao"] = CT.jogador_jogos_lesao.fillna(0); CT["jogador_jogos_suspensao"] = CT.jogador_jogos_suspensao.fillna(0)
    CT.round(3).to_csv(os.path.join(OUT, "clube_temporada.csv"), index=False)
    IND.update({"jogador_jogos_lesao": "Jogador-jogos perdidos por lesão", "jogador_jogos_suspensao": "Jogador-jogos por suspensão", "titulares_distintos": "Titulares distintos no ano",
                "onze_fixo_pct": "Titularidades dos 11 mais usados %", "nota_media": "Nota Sofascore média do time", "nota_desvio": "Desvio da nota (irregularidade)"})
    # testes: entre times (2022–2025) e dentro do clube jogo a jogo
    fech = CT[CT.ano <= 2025]
    rows = []
    for k, nome in IND.items():
        r1 = sp(fech[k], fech.rendimento); r2 = sp(fech[k], fech.ppj); rv = sp(fech[k], np.log(fech.valor_eur))
        rd = np.nan
        if k in TJ:
            x = TJ[["ano", "clube", k, "pts"]].dropna(); x["d"] = x[k] - x.groupby(["ano", "clube"])[k].transform("mean")
            rd = sp(x.d, x.pts) if len(x) > 100 else np.nan
        q = fech.dropna(subset=[k])
        if len(q) >= 20:
            hi = q[q[k] >= q[k].quantile(0.75)].pontos.mean(); lo = q[q[k] <= q[k].quantile(0.25)].pontos.mean()
        else: hi = lo = np.nan
        rows.append(dict(indicador=nome, k=k, n=len(q), r_rendimento=r1, r_ppj=r2, r_valor=rv, r_dentro_clube=rd, pts_q4=hi, pts_q1=lo,
                         sobe=q[q.faixa == "Sobe"][k].mean(), meio=q[q.faixa == "Meio"][k].mean(), cai=q[q.faixa == "Cai"][k].mean()))
    T = pd.DataFrame(rows).round(3); T.to_csv(os.path.join(OUT, "testes.csv"), index=False)
    # ---------- jogador-temporada ----------
    PJ["minutos"] = PJ.minutesPlayed.fillna(0)
    agg = {"minutos": "sum", "titular": "sum", "rating": "mean", "touches": "sum", "keyPass": "sum", "bigChanceCreated": "sum", "bigChanceMissed": "sum", "goals": "sum", "goalAssist": "sum",
           "expectedGoals": "sum", "expectedAssists": "sum", "totalProgression": "sum", "progressiveBallCarriesCount": "sum", "ballRecovery": "sum", "interceptionWon": "sum",
           "duelWon": "sum", "duelLost": "sum", "aerialWon": "sum", "aerialLost": "sum", "topSpeed": "max", "kilometersCovered": "sum", "numberOfSprints": "sum", "metersCoveredHighSpeedRunningKm": "sum"}
    agg = {k: v for k, v in agg.items() if k in PJ}
    PJr = PJ[PJ.minutos >= 60].copy(); PJr["rating_sd"] = PJr.rating
    JT = PJ.groupby(["ano", "clube", "sid", "nome"]).agg(agg).join(PJr.groupby(["ano", "clube", "sid", "nome"]).rating_sd.std()).join(PJ.groupby(["ano", "clube", "sid", "nome"]).size().rename("jogos")).reset_index()
    JT = JT.rename(columns={"titular": "titularidades", "rating": "nota_media"})
    for c in ["keyPass", "bigChanceCreated", "bigChanceMissed", "goals", "goalAssist", "expectedGoals", "expectedAssists", "totalProgression", "progressiveBallCarriesCount", "ballRecovery", "interceptionWon", "kilometersCovered", "numberOfSprints", "metersCoveredHighSpeedRunningKm"]:
        if c in JT: JT[c + "_p90"] = JT[c] / JT["minutos"].replace(0, np.nan) * 90
    if "duelWon" in JT: JT["duelos_pct"] = JT.duelWon / (JT.duelWon + JT.duelLost).replace(0, np.nan)
    if "aerialWon" in JT: JT["aereos_pct"] = JT.aerialWon / (JT.aerialWon + JT.aerialLost).replace(0, np.nan)
    JT["chave"] = JT.nome.map(chave)
    JT.round(3).to_csv(os.path.join(OUT, "jogador_temporada.csv"), index=False)
    # nota repete? pares do mesmo jogador em anos seguidos
    j = JT[JT["minutos"] >= 900]; pares = j.merge(j.assign(ano=j.ano - 1), on=["sid", "ano"], suffixes=("", "_2"))
    rep = {k: sp(pares[k], pares[k + "_2"]) for k in ["nota_media", "rating_sd", "keyPass_p90", "ballRecovery_p90", "duelos_pct", "aereos_pct"] if k in pares}
    cob = PJ[(PJ.ano == 2026)].groupby("sid").topSpeed.max().notna().mean() if "topSpeed" in PJ else np.nan
    print(T.sort_values("r_rendimento").to_string()); print("repete:", rep, "| físico Sofascore 2026 cobre", round(cob, 2)); print(DF.motivo.value_counts().to_dict())
    json.dump(dict(rep=rep, cob=cob, n_pares=len(pares)), open(os.path.join(OUT, "_resumo.json"), "w"))

if __name__ == "__main__":
    main()
