"""Bloco 3 — Bola parada.

Bases: coleta Sofascore de gols por origem (escanteio, falta direta, falta indireta, lateral,
pênalti) por trabalho de treinador, agregada aqui em clube-temporada; Wyscout por jogo (bolas
paradas / escanteios / faltas com finalização); Wyscout por jogador (cantos/90, livres/90, gols
de cabeça/90, duelos aéreos, xG, xA); elencos do Transfermarkt (altura).
Escreve resultados/b3/time_bp.csv, time_testes.csv, cobradores.csv, finalizadores.csv, defesa.csv
"""
import os, json
import numpy as np, pandas as pd
from _comum import *
from b1_time import boot_corr
from b1_perfis import POS11, ORDEM

SOFA = {'Amazonas FC': 'Amazonas', 'América Mineiro': 'América-MG', 'Athletic Club': 'Athletic', 'Athletico': 'Athletico-PR',
        'Atlético Goianiense': 'Atlético-GO', 'Clube De Regatas Brasil': 'CRB', 'Grêmio Novorizontino': 'Novorizontino',
        'Paysandu SC': 'Paysandu', 'Sport Recife': 'Sport', 'Vasco da Gama': 'Vasco', 'Vila Nova FC': 'Vila Nova'}

def testes(df, cols, alvo, sinal):
    rows = []
    for c in cols:
        d = df.dropna(subset=[c]); x = d.groupby("ano")[c].rank(pct=True).values * sinal.get(c, 1); y = d[alvo].values
        r = np.corrcoef(x, y)[0, 1]; ic, p = boot_corr(x, y, d.clube.values, n=3000)
        q = pd.qcut(x, 4, labels=False, duplicates="drop"); ef = (y[q == q.max()].mean() - y[q == 0].mean()) * 38
        fr = d[d.dist_g4.abs() > 3]; rr = np.corrcoef(fr.groupby("ano")[c].rank(pct=True) * sinal.get(c, 1), fr[alvo])[0, 1]
        rows.append(dict(indicador=c, n=len(d), r=round(r, 3), ic_baixo=round(ic[0], 3), ic_alto=round(ic[1], 3), p_boot=round(p, 4),
                         r_sem_fronteira=round(rr, 3), top_menos_fundo_pts38=round(ef, 1),
                         med_sobe=round(d[d.faixa == "Sobe"][c].median(), 2), med_meio=round(d[d.faixa == "Meio"][c].median(), 2), med_cai=round(d[d.faixa == "Cai"][c].median(), 2)))
    return pd.DataFrame(rows).sort_values("r", ascending=False)

def main():
    out = os.path.join(RES, "b3"); os.makedirs(out, exist_ok=True)
    ct = clube_temporada()
    bp = json.load(open(os.path.join(BASES, "coletas", "bola_parada_sofascore.json")))
    tr = pd.DataFrame(bp["trabalhos"]); tr = tr[tr.comp.str.startswith("Série B")].copy()
    tr["ano"] = tr.comp.str[-4:].astype(int); tr["clube"] = tr.time.map(lambda s: SOFA.get(s, s))
    for k in ("esc", "fd", "fi", "lat"):
        tr[f"pro_{k}"] = tr["pro"].map(lambda d: d[k]); tr[f"sof_{k}"] = tr["sof"].map(lambda d: d[k])
    g = tr.groupby(["ano", "clube"]).agg(jogos_sofa=("jogos", "sum"), gp=("gp", "sum"), gc=("gc", "sum"), pen=("pen", "sum"), pen_sof=("pen_sof", "sum"),
                                         esc_fav=("esc_fav", "sum"), esc_contra=("esc_contra", "sum"), xg_bp_pro=("xg_bp_pro", "sum"), xg_bp_sof=("xg_bp_sof", "sum"),
                                         **{c: (c, "sum") for c in tr.columns if c.startswith(("pro_", "sof_"))}).reset_index()
    g["bp_pro_sem_pen"] = g[["pro_esc", "pro_fd", "pro_fi", "pro_lat"]].sum(axis=1); g["bp_sof_sem_pen"] = g[["sof_esc", "sof_fd", "sof_fi", "sof_lat"]].sum(axis=1)
    g["bp_pro"] = g.bp_pro_sem_pen + g.pen; g["bp_sof"] = g.bp_sof_sem_pen + g.pen_sof
    g["saldo_bp"] = g.bp_pro - g.bp_sof; g["saldo_bp_sem_pen"] = g.bp_pro_sem_pen - g.bp_sof_sem_pen
    g["saldo_bola_rolando"] = (g.gp - g.bp_pro) - (g.gc - g.bp_sof)
    g["pct_gols_bp"] = 100 * g.bp_pro / g.gp; g["gols_por_escanteio_pct"] = 100 * g.pro_esc / g.esc_fav; g["gols_sof_por_escanteio_pct"] = 100 * g.sof_esc / g.esc_contra
    g["saldo_xg_bp"] = g.xg_bp_pro - g.xg_bp_sof
    # Wyscout por jogo
    j = jogos_serie_b()
    w = j.groupby(["ano", "Equipa"]).agg(bp_com_rem_pct=("Bolas paradas com remates, %", "mean"), cantos_com_rem_pct=("Cantos com remates, %", "mean"),
                                         livres_com_rem_pct=("Pontapés livre com remates, %", "mean"), cantos_pj=("Cantos", "mean"), duel_aer_pct=("Duelos aéreos ganhos, %", "mean")).reset_index().rename(columns={"Equipa": "clube"})
    # altura do elenco (Transfermarkt) — dos 15 com mais valor? usar média simples do elenco
    e = ler_csv("serieb_elencos.csv"); e["clube"] = e.clube.map(CLUBE_TM)
    alt = e.groupby(["ano", "clube"]).altura_m.mean().rename("altura_media").reset_index()
    tb = g.merge(w, on=["ano", "clube"], how="left").merge(alt, on=["ano", "clube"], how="left").merge(ct, on=["ano", "clube"])
    tb.to_csv(os.path.join(out, "time_bp.csv"), index=False)
    f = tb[tb.ano <= 2025]
    cols = ["saldo_bp", "saldo_bp_sem_pen", "bp_pro", "bp_pro_sem_pen", "bp_sof", "bp_sof_sem_pen", "pro_esc", "sof_esc", "pro_fd", "pro_fi", "pen", "pen_sof",
            "pct_gols_bp", "gols_por_escanteio_pct", "gols_sof_por_escanteio_pct", "saldo_xg_bp", "xg_bp_pro", "xg_bp_sof", "esc_fav", "esc_contra",
            "bp_com_rem_pct", "cantos_com_rem_pct", "livres_com_rem_pct", "cantos_pj", "duel_aer_pct", "altura_media", "saldo_bola_rolando"]
    sinal = {c: -1 for c in ["bp_sof", "bp_sof_sem_pen", "sof_esc", "pen_sof", "gols_sof_por_escanteio_pct", "xg_bp_sof", "esc_contra"]}
    t = testes(f, cols, "rendimento", sinal); t.to_csv(os.path.join(out, "time_testes.csv"), index=False)
    pd.set_option("display.width", 250); print("=== bola parada do time × rendimento (a dinheiro igual)"); print(t.to_string(index=False))
    print("\nliga: gols de BP por temporada (mediana por clube):", f.bp_pro.median(), "| % dos gols:", round(f.pct_gols_bp.median(), 1), "| escanteio:", f.pro_esc.median(), "| pênalti:", f.pen.median())
    # a metade defensiva e ofensiva separadas, e o saldo com bola rolando para comparar
    # ---- jogadores
    tec = tecnico(); tec["pos11"] = tec.posicao.astype(str).str.split(",").str[0].str.strip().map(POS11).fillna("Outro")
    tec = tec.merge(ct[["ano", "clube", "faixa", "rendimento"]], on=["ano", "clube"])
    reg = tec[tec.minutos >= 900].copy()
    cob = reg[["ano", "clube", "jogador", "pos11", "idade", "minutos", "fatia", "Contrato termina", "Cantos/90", "Livres/90", "Livres directos/90", "Assistências esperadas/90", "Passes para a área de penálti/90", "Cruzamentos/90", "Cruzamentos certos, %", "rendimento", "faixa"]].copy()
    cob["cantos_temp"] = cob["Cantos/90"] * cob.minutos / 90; cob["livres_temp"] = cob["Livres/90"] * cob.minutos / 90
    cob = cob.sort_values(["ano", "cantos_temp"], ascending=[True, False]); cob.to_csv(os.path.join(out, "cobradores.csv"), index=False)
    fin = reg[["ano", "clube", "jogador", "pos11", "idade", "Altura", "minutos", "fatia", "Contrato termina", "Golos de cabeça/90", "Golos de cabeça", "Duelos aéreos/90", "Duelos aéreos ganhos, %", "Golos esperados/90", "Remates/90", "Toques na área/90", "rendimento", "faixa"]].copy()
    fin["aereos_ganhos_90"] = fin["Duelos aéreos/90"] * fin["Duelos aéreos ganhos, %"] / 100
    fin = fin.sort_values(["ano", "Golos de cabeça"], ascending=[True, False]); fin.to_csv(os.path.join(out, "finalizadores.csv"), index=False)
    # repetição ano a ano de cobrar e cabecear
    a = reg.copy(); b = reg.copy(); b["ano"] -= 1; b["idade"] -= 1
    par = a.merge(b, on=["chave", "ano", "idade"], suffixes=("", "_prox")); par = par[~par.duplicated(["chave", "ano"], keep=False)]
    print("\n=== repetição ano a ano (n =", len(par), ")")
    for c in ["Cantos/90", "Livres/90", "Golos de cabeça/90", "Duelos aéreos ganhos, %", "Duelos aéreos/90"]:
        d = par.dropna(subset=[c, c + "_prox"]); print(f"{c:28s} r = {np.corrcoef(d[c], d[c+'_prox'])[0,1]:.2f}")
    # quem cobra: concentração — o cobrador nº1 do time cobra que % dos escanteios?
    top = cob.groupby(["ano", "clube"]).apply(lambda g: g.cantos_temp.max() / g.cantos_temp.sum() if g.cantos_temp.sum() else np.nan).rename("share_cobrador1").reset_index()
    print("\ncobrador nº1 concentra (mediana):", round(top.share_cobrador1.median() * 100), "% dos escanteios do time")
    print("posição do cobrador nº1:", cob[cob.groupby(["ano", "clube"]).cantos_temp.transform("max") == cob.cantos_temp].pos11.value_counts().to_dict())
    print("posição de quem faz gol de cabeça (titulares, soma 2022-2025):", reg[reg.ano <= 2025].groupby("pos11")["Golos de cabeça"].sum().sort_values(ascending=False).to_dict())

if __name__ == "__main__":
    main()
