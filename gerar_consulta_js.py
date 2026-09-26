#!/usr/bin/env python3
"""Aba "Consulta de jogador": digita um nome, o app diz se ele adere ao modelo que rende na Série B
(técnico + físico) e onde ele está nas listas. Gera static/consulta_dados.js a partir das bases do
estudo V2 (Wyscout ago/26 de 66 ligas + Série B 2026, físico SkillCorner/Portal, tipos físicos B8/B15,
bola parada B3, patamar de A B13, Sofascore B14, "Os meus dez", vetados e teto de valor)."""
import os, sys, json, numpy as np, pandas as pd
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
    # físico: Série B (SkillCorner do estudo) e fora (Portal), tipos do B15
    tt = pd.read_csv(os.path.join(RES, "b15", "tipos_todos.csv")); tt["k"] = tt.chave + "|" + tt.clube.map(chave); tt = tt.drop_duplicates("k").set_index("k")
    for c in ["tipo", "tipo_pref", "psv99", "sprint_count_p90", "hi_count_p90", "expl_accel_sprint_p90", "distance_p90"]:
        D[c] = D.k.map(tt[c]) if c in tt else np.nan
    if "psv99_x" in D: D["psv99"] = D.psv99_x.fillna(D.psv99_y)
    # tipos preferidos e faixas físicas de referência por setor (B15/B8)
    G = pd.read_csv(os.path.join(RES, "b8", "tipos_fisicos.csv"))
    pref = {}
    for s, g in G.groupby("setor"):
        g = g.assign(dif=g.pct_sobe - g.pct_cai).sort_values("dif", ascending=False)
        pref[s] = [g.iloc[0].tipo] + ([g.iloc[1].tipo] if len(g) > 1 and g.iloc[1].dif >= 0.10 else [])
    # bola parada
    bp = {}
    x = pd.ExcelFile(os.path.join(LI, "bola_parada_especialistas.xlsx"))
    for sh in x.sheet_names:
        d = x.parse(sh); col = [c for c in d.columns if c.startswith("indice")][0]
        for r in d.itertuples():
            k = chave(r.jogador) + "|" + chave(str(r.clube)); v = getattr(r, col)
            if pd.notna(v): bp.setdefault(k, {})["cobrador" if "cobr" in sh else "finalizador"] = round(float(v))
    # patamar de A (B13) — só Série B
    pa = pd.read_csv(os.path.join(RES, "b13", "patamar_A_pool.csv")); pa["k"] = pa.jogador.map(chave) + "|" + pa.clube.map(chave); pa = pa[pa.liga == "Brasil B"].drop_duplicates("k").set_index("k")
    # sofascore 2026
    sj = pd.read_csv(os.path.join(RES, "b14", "jogador_temporada.csv")); sj = sj[(sj.ano == 2026) & (sj.minutos >= 450)].sort_values("minutos", ascending=False).drop_duplicates("chave").set_index("chave")
    # os meus dez
    ideal = pd.read_csv(os.path.join(LI, "IDEAL_2027.csv")); ideal["k"] = ideal.jogador.map(chave) + "|" + ideal.clube.map(chave); ideal = ideal.drop_duplicates("k").set_index("k")
    # faixas de referência físicas por posição (B1)
    fx = pd.read_csv(os.path.join(RES, "b1", "posicao_faixas.csv")) if os.path.exists(os.path.join(RES, "b1", "posicao_faixas.csv")) else None
    ficha = {p: [(en, w) for en, w in v] for p, v in L.FICHA.items()}
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
                   tipo=(None if pd.isna(r.tipo) else r.tipo), tpref=(bool(r.tipo_pref) if pd.notna(r.tipo_pref) else None),
                   alc=bool((r.liga == "Brasil B") or (r.mercado == "Sul-americano") or (r.mercado == "Exterior" and r.liga in L.ALCANCAVEIS and bool(r.sul_americano))) and r.clube not in GRANDES,
                   bp=bp.get(r.k), vet=bool(fora(r.jogador, r.clube)), caro=bool(v > TETO_VALOR) if pd.notna(v) else False,
                   pa=(None if r.k not in pa.index else {"tec": (None if pd.isna(pa.loc[r.k].tec_A) else round(float(pa.loc[r.k].tec_A))), "fis": (None if pd.isna(pa.loc[r.k].fis_A) else round(float(pa.loc[r.k].fis_A)))}),
                   sofa=(None if (r.liga != "Brasil B" or r.chave not in sj.index) else {"nota": round(float(sj.loc[r.chave].nota_media), 2), "xgxa": round(float(sj.loc[r.chave].expectedGoals_p90 or 0) + float(sj.loc[r.chave].expectedAssists_p90 or 0), 2), "vmax": (None if pd.isna(sj.loc[r.chave].topSpeed) else round(float(sj.loc[r.chave].topSpeed), 1)), "tit": int(sj.loc[r.chave].titularidades), "jogos": int(sj.loc[r.chave].jogos)}),
                   dez=(None if r.k not in ideal.index else {"ordem": int(ideal.loc[r.k].ordem), "pontos": float(ideal.loc[r.k].score)}))
        rows.append(rec)
    out = {"gerado_em": pd.Timestamp.now().strftime("%Y-%m-%d"), "n": len(rows), "pref": pref, "teto": TETO_VALOR,
           "regua": {"psv": 27, "ader_bom": 65, "ader_ok": 50, "nota_bom": 65, "nota_ok": 55},
           "jogadores": rows}
    with open(SAIDA, "w", encoding="utf-8") as fh:
        fh.write("/* gerado por gerar_consulta_js.py — não editar à mão */\nwindow.CONSULTA = ")
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":")); fh.write(";\n")
    print(SAIDA, len(rows), "jogadores;", round(os.path.getsize(SAIDA) / 1e6, 1), "MB")

if __name__ == "__main__":
    main()
