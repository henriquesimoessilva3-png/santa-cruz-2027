#!/usr/bin/env python3
"""Aba "Consulta de jogador": digita um nome, o app diz se ele adere ao modelo que rende na Série B
(técnico + físico) e onde ele está nas listas. Gera static/consulta_dados.js a partir das bases do
estudo V2 (Wyscout ago/26 de 66 ligas + Série B 2026, físico SkillCorner/Portal, tipos físicos F2/F2,
bola parada T2, patamar de A F3, Sofascore M3, "Os meus dez", vetados e teto de valor)."""
import os, json, sys, numpy as np, pandas as pd
AQUI = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.join(AQUI, "Santa Cruz V2"); sys.path.insert(0, os.path.join(V2, "scripts"))
from _comum import RAIZ, chave, excluidos, caro, TETO_VALOR
import listas as L
from top10 import FRACAS
from ideal10 import GRANDES
SAIDA = os.path.join(AQUI, "static", "consulta_dados.js")
RES = os.path.join(V2, "resultados"); LI = os.path.join(V2, "listas")
ROT = {"xG per 90": "xG/90", "Shots per 90": "Finalizações/90", "Long passes per 90": "Passes longos/90", "Progressive passes per 90": "Passes progressivos/90",
       "Aerial duels won, %": "Duelos aéreos ganhos %", "Head goals per 90": "Gols de cabeça/90", "Defensive duels won, %": "Duelos defensivos ganhos %",
       "Key passes per 90": "Passes chave/90", "Smart passes per 90": "Passes inteligentes/90", "Crosses per 90": "Cruzamentos/90", "xA per 90": "xA/90",
       "Progressive runs per 90": "Corridas progressivas/90", "Touches in box per 90": "Toques na área/90", "PAdj Interceptions": "Interceptações (ajust. posse)",
       "Successful defensive actions per 90": "Ações defensivas certas/90", "Passes to penalty area per 90": "Passes para a área/90", "Corners per 90": "Escanteios/90",
       "Free kicks per 90": "Faltas cobradas/90", "Fouls suffered per 90": "Faltas sofridas/90", "Goals per 90": "Gols/90", "Accelerations per 90": "Acelerações com bola/90",
       "Passes per 90": "Passes/90", "Prevented goals per 90": "Gols evitados/90", "Save rate, %": "Defesas %", "Exits per 90": "Saídas/90", "Accurate passes, %": "Passes certos %",
       "Dribbles per 90": "Dribles/90", "Assists per 90": "Assistências/90", "Received passes per 90": "Passes recebidos/90", "Offensive duels won, %": "Duelos ofensivos ganhos %"}

def main():
    fora = excluidos()
    sb = L.serie_b(); sb["liga"] = "Brasil B"; lg = L.ligas()
    D = pd.concat([sb, lg], ignore_index=True)
    D = D[(D.minutos >= 900) & (D.pos11 != "Outro")].copy()
    D["idade"] = pd.to_numeric(D.idade, errors="coerce")
    D["aderencia_ajustada"] = [L.converter(m, a) if m != "Série B" else a for m, a in zip(D.mercado.fillna("Série B"), D.aderencia)]
    D.loc[D.liga == "Brasil B", "mercado"] = "Série B"
    rk = L.ranking(); D["chave"] = D.jogador.map(chave)
    D = D.merge(rk[["chave", "liga", "pos11", "idade", "nivel_overall", "rank_na_liga"]], on=["chave", "liga", "pos11", "idade"], how="left")
    med = D.groupby(["liga", "pos11"]).nivel_overall.transform("median").fillna(D.nivel_overall.median())
    D["nota"] = ((D.aderencia_ajustada + D.nivel_overall.fillna(med)) / 2).round(1)
    D["k"] = D.chave + "|" + D.clube.map(chave)
    # físico: Série B (SkillCorner do estudo) e fora (Portal), tipos do F2
    tt = pd.read_csv(os.path.join(RES, "b15", "tipos_todos.csv")); tt["k"] = tt.chave + "|" + tt.clube.map(chave); tt = tt.drop_duplicates("k").set_index("k")
    for c in ["tipo", "tipo_pref", "psv99", "sprint_count_p90", "hi_count_p90", "expl_accel_sprint_p90", "distance_p90", "runs_penalty_area_p30tip"]:
        D[c] = D.k.map(tt[c]) if c in tt else np.nan
    if "psv99_x" in D: D["psv99"] = D.psv99_x.fillna(D.psv99_y)
    # tipos preferidos e faixas físicas de referência por setor (F2/F2)
    # tipos de quem sobe e de quem cai, POR POSIÇÃO (F2-4, 28/09)
    T = pd.read_csv(os.path.join(RES, "b8", "tipos_preferidos_pos.csv"))
    pref = {r.pos11: ([t.strip() for t in r.preferidos.split("/")] if isinstance(r.preferidos, str) and r.preferidos else []) for r in T.itertuples()}
    cai = {r.pos11: ([t.strip() for t in r.de_quem_cai.split("/")] if isinstance(r.de_quem_cai, str) and r.de_quem_cai else []) for r in T.itertuples()}
    # bola parada
    bp = {}
    x = pd.ExcelFile(os.path.join(LI, "bola_parada_especialistas.xlsx"))
    for sh in x.sheet_names:
        d = x.parse(sh); col = [c for c in d.columns if c.startswith("indice")][0]
        for r in d.itertuples():
            k = chave(r.jogador) + "|" + chave(str(r.clube)); v = getattr(r, col)
            if pd.notna(v): bp.setdefault(k, {})["cobrador" if "cobr" in sh else "finalizador"] = round(float(v))
    # patamar de A (F3) — só Série B
    pa = pd.read_csv(os.path.join(RES, "b13", "patamar_A_pool.csv")); pa["k"] = pa.jogador.map(chave) + "|" + pa.clube.map(chave); pa = pa[pa.liga == "Brasil B"].drop_duplicates("k").set_index("k")
    # sofascore 2026
    sj = pd.read_csv(os.path.join(RES, "b14", "jogador_temporada.csv")); sj = sj[(sj.ano == 2026) & (sj.minutos >= 450)].sort_values("minutos", ascending=False).drop_duplicates("chave").set_index("chave")
    # os meus dez
    ideal = pd.read_csv(os.path.join(LI, "IDEAL_2027.csv")); ideal["k"] = ideal.jogador.map(chave) + "|" + ideal.clube.map(chave); ideal = ideal.drop_duplicates("k").set_index("k")
    # faixas de referência físicas por posição (F1)
    fx = pd.read_csv(os.path.join(RES, "b1", "posicao_faixas.csv")) if os.path.exists(os.path.join(RES, "b1", "posicao_faixas.csv")) else None
    ficha = {p: [(en, w) for en, w in v] for p, v in L.FICHA.items()}
    # gol de defesa (M4-1) e corrida para a área (F2-2): percentil dentro da posição, todos os mercados
    D["xg90"] = pd.to_numeric(D.get("xG"), errors="coerce") / D.minutos * 90
    D["xg_p"] = D.groupby("pos11").xg90.rank(pct=True) * 100
    D["area_p"] = D.groupby("pos11").runs_penalty_area_p30tip.rank(pct=True) * 100
    # jogo aéreo (T2): índice do finalizador aéreo, o mesmo de bolaparada_jogadores.py — percentil dentro da liga, entre
    # jogadores de linha com ≥ 2,5 duelos aéreos/90: gols de cabeça/90 (3), gols de cabeça (2), aéreos ganhos % (2), aéreos/90 (2), altura (1)
    FIN = [("Head goals per 90", 3), ("Head goals", 2), ("Aerial duels won, %", 2), ("Aerial duels per 90", 2), ("Height", 1)]
    PTF = {"Golos de cabeça/90": "Head goals per 90", "Golos de cabeça": "Head goals", "Duelos aéreos ganhos, %": "Aerial duels won, %", "Duelos aéreos/90": "Aerial duels per 90", "Altura": "Height"}
    T26 = L.tecnico(); T26 = T26[T26.ano == 2026].rename(columns=PTF); T26["k"] = T26.chave + "|" + T26.clube.map(chave); T26 = T26.drop_duplicates("k").set_index("k")
    for en, _ in FIN:
        if en not in D: D[en] = np.nan
        D[en] = pd.to_numeric(D[en], errors="coerce")
        m = (D.mercado == "Série B") & D[en].isna(); D.loc[m, en] = pd.to_numeric(D.loc[m, "k"].map(T26[en]), errors="coerce")
    lin = D.pos11 != "GOL"
    for en, _ in FIN: D.loc[lin, en + "_aer"] = D[lin].groupby("liga")[en].rank(pct=True) * 100
    def aer_idx(r):
        if r.pos11 == "GOL" or pd.isna(r["Aerial duels per 90"]) or r["Aerial duels per 90"] < 2.5: return np.nan
        v = [(r[en + "_aer"], w) for en, w in FIN if pd.notna(r.get(en + "_aer"))]
        return round(sum(a * w for a, w in v) / sum(w for _, w in v)) if len(v) >= 2 else np.nan
    D["aer"] = [aer_idx(r) for _, r in D.iterrows()]
    # duelo aéreo defensivo/geral: só o % de duelos aéreos ganhos, percentil na liga entre jogadores de linha com ≥ 2,5 duelos/90
    D["aer_dp"] = np.where(lin & (D["Aerial duels per 90"] >= 2.5), D["Aerial duels won, %_aer"], np.nan)
    m25 = lin & (D["Aerial duels per 90"] >= 2.5)
    D.loc[m25, "aer_dp"] = D[m25].groupby("liga")["Aerial duels won, %"].rank(pct=True) * 100
    # cobrador (T2): percentil na liga em escanteios/90 (3), faltas cobradas/90 (3), faltas diretas/90 (1), faltas diretas no alvo % (1), xA/90 (1), cruzamento certo % (1)
    COB = [("Corners per 90", 3), ("Free kicks per 90", 3), ("Direct free kicks per 90", 1), ("Direct free kicks on target, %", 1), ("xA per 90", 1), ("Accurate crosses, %", 1)]
    PTC = {"Cantos/90": "Corners per 90", "Livres/90": "Free kicks per 90", "Livres directos/90": "Direct free kicks per 90", "Pontapés livres directos à baliza, %": "Direct free kicks on target, %", "Assistências esperadas/90": "xA per 90", "Cruzamentos certos, %": "Accurate crosses, %"}
    T26c = L.tecnico(); T26c = T26c[T26c.ano == 2026].rename(columns=PTC); T26c["k"] = T26c.chave + "|" + T26c.clube.map(chave); T26c = T26c.drop_duplicates("k").set_index("k")
    for en, _ in COB:
        if en not in D: D[en] = np.nan
        D[en] = pd.to_numeric(D[en], errors="coerce")
        if en in T26c:
            m = (D.mercado == "Série B") & D[en].isna(); D.loc[m, en] = pd.to_numeric(D.loc[m, "k"].map(T26c[en]), errors="coerce")
        D[en + "_cob"] = D.groupby("liga")[en].rank(pct=True) * 100
    def cob_idx(r):
        v = [(r[en + "_cob"], w) for en, w in COB if pd.notna(r.get(en + "_cob"))]
        return round(sum(a * w for a, w in v) / sum(w for _, w in v)) if len(v) >= 2 else np.nan
    D["cob"] = [cob_idx(r) for _, r in D.iterrows()]
    D["cob_esc"] = (D["Corners per 90"] * pd.to_numeric(D.minutos, errors="coerce") / 90).round(0); D["cob_fal"] = (D["Free kicks per 90"] * pd.to_numeric(D.minutos, errors="coerce") / 90).round(0)
    # quantis por liga (0..100) dos indicadores do jogo aéreo e do cobrador — o app calcula o índice de um jogador
    # colado à mão (físico/técnico atualizado) contra a mesma régua
    Q = {}
    grid = np.arange(0, 1.0001, 0.01)
    for liga, g in D.groupby("liga"):
        if len(g) < 30: continue
        e = {}
        for en, _ in FIN:
            v = g.loc[g.pos11 != "GOL", en].dropna()
            if len(v) >= 20: e[en] = [round(float(x), 3) for x in v.quantile(grid)]
        v = g.loc[(g.pos11 != "GOL") & (g["Aerial duels per 90"] >= 2.5), "Aerial duels won, %"].dropna()
        if len(v) >= 20: e["won25"] = [round(float(x), 3) for x in v.quantile(grid)]
        for en, _ in COB:
            v = g[en].dropna()
            if len(v) >= 20: e[en] = [round(float(x), 3) for x in v.quantile(grid)]
        Q["Série B" if liga == "Brasil B" else liga] = e
    D["aer_won"] = D["Aerial duels won, %"]; D["aer_n"] = D["Aerial duels per 90"]; D["aer_g"] = D["Head goals"]
    rows = []
    for r in D.itertuples():
        f = ficha.get(r.pos11, [])
        pct = [[ROT.get(en, en), (None if pd.isna(getattr(r, "_" + str(D.columns.get_loc(en + "_pct") + 1), np.nan)) else round(float(getattr(r, "_" + str(D.columns.get_loc(en + "_pct") + 1))))), w] if (en + "_pct") in D.columns else [ROT.get(en, en), None, w] for en, w in f]
        s = {"pos": r.pos11, "setor": None}
        v = pd.to_numeric(r.valor, errors="coerce")
        rec = dict(n=r.jogador, c=r.clube, l=("Série B" if r.liga == "Brasil B" else r.liga), m=r.mercado, p=r.pos11, i=(None if pd.isna(r.idade) else int(r.idade)), min=int(r.minutos),
                   ct=(str(r.contrato)[:10] if isinstance(r.contrato, str) else None), val=(None if pd.isna(v) else float(v)),
                   ad=(None if pd.isna(r.aderencia) else round(float(r.aderencia))), adc=(None if pd.isna(r.aderencia_ajustada) else round(float(r.aderencia_ajustada))),
                   niv=(None if pd.isna(r.nivel_overall) else round(float(r.nivel_overall))), nota=(None if pd.isna(r.nota) else round(float(r.nota))),
                   crit=int(r.criterios_com_dado), ficha=pct,
                   psv=(None if pd.isna(r.psv99) else round(float(r.psv99), 1)), spr=(None if pd.isna(r.sprint_count_p90) else round(float(r.sprint_count_p90), 1)),
                   hi=(None if pd.isna(r.hi_count_p90) else round(float(r.hi_count_p90), 1)), expl=(None if pd.isna(r.expl_accel_sprint_p90) else round(float(r.expl_accel_sprint_p90), 2)),
                   area=(None if pd.isna(r.runs_penalty_area_p30tip) else round(float(r.runs_penalty_area_p30tip), 1)), area_p=(None if pd.isna(r.area_p) else round(float(r.area_p))),
                   xg=(None if pd.isna(r.xg90) else round(float(r.xg90), 2)), xg_p=(None if pd.isna(r.xg_p) else round(float(r.xg_p))),
                   tipo=(None if pd.isna(r.tipo) else r.tipo), tpref=(bool(r.tipo_pref) if pd.notna(r.tipo_pref) else None),
                   alc=bool((r.liga == "Brasil B") or (r.mercado == "Sul-americano") or (r.mercado == "Exterior" and r.liga in L.ALCANCAVEIS and bool(r.sul_americano))) and r.clube not in GRANDES,
                   bp=bp.get(r.k), aer=(None if pd.isna(r.aer) else int(r.aer)), aer_won=(None if pd.isna(r.aer_won) else round(float(r.aer_won))), aer_n=(None if pd.isna(r.aer_n) else round(float(r.aer_n), 1)), aer_g=(None if pd.isna(r.aer_g) else int(r.aer_g)), aer_dp=(None if pd.isna(r.aer_dp) else int(round(r.aer_dp))), cob=(None if pd.isna(r.cob) else int(r.cob)), cob_esc=(None if pd.isna(r.cob_esc) else int(r.cob_esc)), cob_fal=(None if pd.isna(r.cob_fal) else int(r.cob_fal)), vet=bool(fora(r.jogador, r.clube)), caro=bool(v > TETO_VALOR) if pd.notna(v) else False,
                   pa=(None if r.k not in pa.index else {"tec": (None if pd.isna(pa.loc[r.k].tec_A) else round(float(pa.loc[r.k].tec_A))), "fis": (None if pd.isna(pa.loc[r.k].fis_A) else round(float(pa.loc[r.k].fis_A)))}),
                   sofa=(None if (r.liga != "Brasil B" or r.chave not in sj.index) else {"nota": round(float(sj.loc[r.chave].nota_media), 2), "xgxa": round(float(sj.loc[r.chave].expectedGoals_p90 or 0) + float(sj.loc[r.chave].expectedAssists_p90 or 0), 2), "vmax": (None if pd.isna(sj.loc[r.chave].topSpeed) else round(float(sj.loc[r.chave].topSpeed), 1)), "tit": int(sj.loc[r.chave].titularidades), "jogos": int(sj.loc[r.chave].jogos)}),
                   dez=(None if r.k not in ideal.index else {"ordem": int(ideal.loc[r.k].ordem), "pontos": float(ideal.loc[r.k].score)}))
        rows.append(rec)
    cen = json.load(open(os.path.join(V2, "resultados", "b15", "centroides.json"), encoding="utf-8"))
    out = {"gerado_em": pd.Timestamp.now().strftime("%Y-%m-%d"), "n": len(rows), "pref": pref, "cai": cai, "cen": cen, "q": Q, "teto": TETO_VALOR,
           "regua": {"psv": 27, "ader_bom": 65, "ader_ok": 50, "nota_bom": 65, "nota_ok": 55},
           "jogadores": rows}
    with open(SAIDA, "w", encoding="utf-8") as fh:
        fh.write("/* gerado por gerar_consulta_js.py — não editar à mão */\nwindow.CONSULTA = ")
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":")); fh.write(";\n")
    print(SAIDA, len(rows), "jogadores;", round(os.path.getsize(SAIDA) / 1e6, 1), "MB")

if __name__ == "__main__":
    main()
