"""Bloco 1, camada descritiva — jogadores, posições do campograma e equipes.

Posições (11): GOL, LD, LE, ZD, ZE, VOL, MED (meia central), MEI (meia ofensivo), ED, EE, CA.
Mapa pela primeira posição do Wyscout: RCB→ZD, LCB→ZE, CB→ZD; RB/RWB→LD, LB/LWB→LE; DMF/LDMF/RDMF→VOL;
LCMF/RCMF→MED; AMF→MEI; RW/RAMF/RWF→ED; LW/LAMF/LWF→EE; CF→CA.

Escreve em resultados/b1/perfis/:
  jogadores.csv   — uma linha por jogador-temporada com físico, minutos, fatia, posição e percentil
                    dentro de (temporada × posição), mais o rendimento do clube
  posicoes.csv    — perfil de cada posição: mediana da liga, dos titulares, e dos titulares dos
                    times de referência (quartil de cima em rendimento), 2022-2025
  equipes.csv     — perfil físico de cada clube-temporada (média ponderada por minutos rastreados)
                    com percentil dentro da temporada, pontos, posição e rendimento
  onze.csv        — o mais usado em cada posição, por clube-temporada, com seu físico
  perfis.xlsx     — tudo acima em abas
"""
import os
import numpy as np, pandas as pd
from _comum import *

POS11 = {"GK": "GOL", "RCB": "ZD", "LCB": "ZE", "CB": "ZD", "RB": "LD", "RWB": "LD", "RB5": "LD",
         "LB": "LE", "LWB": "LE", "LB5": "LE", "DMF": "VOL", "LDMF": "VOL", "RDMF": "VOL",
         "LCMF": "MED", "RCMF": "MED", "LCMF3": "MED", "RCMF3": "MED", "AMF": "MEI",
         "RW": "ED", "RAMF": "ED", "RWF": "ED", "LW": "EE", "LAMF": "EE", "LWF": "EE", "CF": "CA"}
ORDEM = ["GOL", "LD", "ZD", "ZE", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]
MET = [("distance_p90", "Distância/90 (m)"), ("hsr_distance_p90", "Alta velocidade/90 (m)"),
       ("sprint_distance_p90", "Sprint/90 (m)"), ("sprint_count_p90", "Sprints/90"),
       ("hi_count_p90", "Ações alta intensidade/90"), ("high_accel_p90", "Acelerações fortes/90"),
       ("high_decel_p90", "Desacelerações fortes/90"), ("expl_accel_sprint_p90", "Arrancadas explosivas/90"),
       ("cod_count_p90", "Mudanças de direção/90"), ("psv99", "PSV-99 (km/h)"), ("psv99_top5", "PSV-99 top5 (km/h)"),
       ("sprint_distance_p30tip", "Sprint/30min com bola (m)"), ("sprint_distance_p30otip", "Sprint/30min sem bola (m)"),
       ("hsr_distance_p30tip", "Alta vel./30min com bola (m)"), ("hsr_distance_p30otip", "Alta vel./30min sem bola (m)"),
       ("runs_p30tip", "Corridas sem bola/30min posse"), ("runs_penalty_area_p30tip", "Corridas p/ área/30min posse"),
       ("runs_dangerous_p30tip", "Corridas perigosas/30min posse")]
COLS = [m[0] for m in MET]

def main():
    out = os.path.join(RES, "b1", "perfis"); os.makedirs(out, exist_ok=True)
    b = pd.read_csv(os.path.join(RES, "b1", "base_fisico.csv"))
    b["pos11"] = b["posicao"].astype(str).str.split(",").str[0].str.strip().map(POS11).fillna("Outro")
    ct = clube_temporada()
    b = b.merge(ct[["ano", "clube", "pos", "pontos", "faixa", "posto_valor", "rendimento"]], on=["ano", "clube"])
    b["titular"] = b["fatia"] >= 0.6
    corte = ct[ct.ano <= 2025]["rendimento"].quantile(0.75)
    b["time_referencia"] = b["rendimento"] >= corte
    # percentil dentro de temporada × posição (só quem tem >= 5 jogos rastreados)
    ok = b["matches"] >= 5
    for c in COLS:
        b[c + "_pct"] = np.nan
        b.loc[ok, c + "_pct"] = b[ok].groupby(["ano", "pos11"])[c].rank(pct=True).mul(100).round(0)
    b["rank_minutos_no_clube"] = b.groupby(["ano", "clube"])["minutos"].rank(ascending=False, method="first").astype(int)
    b["rank_minutos_na_posicao_do_clube"] = b.groupby(["ano", "clube", "pos11"])["minutos"].rank(ascending=False, method="first").astype(int)
    front = ["ano", "clube", "pos", "pontos", "faixa", "posto_valor", "rendimento", "time_referencia", "jogador", "posicao", "pos11",
             "idade", "jogos", "minutos", "fatia", "titular", "rank_minutos_no_clube", "rank_minutos_na_posicao_do_clube", "matches", "minutos_sc"]
    jog = b[front + COLS + [c + "_pct" for c in COLS]].sort_values(["ano", "clube", "rank_minutos_no_clube"])
    jog.to_csv(os.path.join(out, "jogadores.csv"), index=False)

    # perfil por posição
    fech = b[(b.ano <= 2025) & ok & (b.pos11 != "Outro")]
    rows = []
    for p in ORDEM:
        g = fech[fech.pos11 == p]
        if len(g) == 0: continue
        for c, nome in MET:
            liga, tit, ref = g[c], g[g.titular][c], g[g.titular & g.time_referencia][c]
            outros = g[g.titular & ~g.time_referencia][c]
            rows.append(dict(posicao=p, indicador=nome, qtd_jogadores_liga=liga.notna().sum(), liga_p25=liga.quantile(.25), liga_mediana=liga.median(),
                             liga_p75=liga.quantile(.75), titulares_mediana=tit.median(), qtd_titulares=tit.notna().sum(),
                             ref_mediana=ref.median(), qtd_titulares_referencia=ref.notna().sum(), outros_titulares_mediana=outros.median(),
                             ref_vs_outros_pct=100 * (ref.median() - outros.median()) / outros.median() if outros.notna().sum() else np.nan))
    posi = pd.DataFrame(rows).round(2); posi.to_csv(os.path.join(out, "posicoes.csv"), index=False)
    # a posição pede um perfil diferente das outras? mediana da posição contra a mediana da liga (todos de linha)
    rows = []
    for c, nome in MET:
        base = fech[fech.pos11 != "GOL"][c].median()
        for p in ORDEM[1:]:
            m = fech[(fech.pos11 == p)][c].median()
            rows.append(dict(indicador=nome, posicao=p, mediana_posicao=m, mediana_linha=base, dif_pct=round(100 * (m - base) / base, 1)))
    pd.DataFrame(rows).round(2).to_csv(os.path.join(out, "posicao_vs_liga.csv"), index=False)

    # perfil por equipe
    lin = b[(b.pos11 != "GOL") & (b.minutos_sc > 0)]
    def wmean(g):
        return pd.Series({c: np.average(g[c].dropna(), weights=g.loc[g[c].notna(), "minutos_sc"]) if g[c].notna().any() else np.nan for c in COLS})
    eq = lin.groupby(["ano", "clube"]).apply(wmean).reset_index()
    for c in COLS:
        eq[c + "_pct"] = eq.groupby("ano")[c].rank(pct=True).mul(100).round(0)
    eq = eq.merge(ct[["ano", "clube", "pos", "pontos", "faixa", "posto_valor", "rendimento"]], on=["ano", "clube"])
    eq = eq.sort_values(["ano", "pos"])
    eq.to_csv(os.path.join(out, "equipes.csv"), index=False)

    # onze mais usado por posição
    onze = b[(b.rank_minutos_na_posicao_do_clube == 1) & (b.pos11 != "Outro")].copy()
    onze["ordem"] = onze.pos11.map({p: i for i, p in enumerate(ORDEM)})
    onze = onze.sort_values(["ano", "clube", "ordem"])[front + COLS + [c + "_pct" for c in COLS]]
    onze.to_csv(os.path.join(out, "onze.csv"), index=False)

    with pd.ExcelWriter(os.path.join(out, "perfis.xlsx")) as w:
        posi.to_excel(w, "posicoes", index=False)
        pd.read_csv(os.path.join(out, "posicao_vs_liga.csv")).to_excel(w, "posicao_vs_liga", index=False)
        eq.round(1).to_excel(w, "equipes", index=False)
        onze.round(1).to_excel(w, "onze_mais_usado", index=False)
        jog.round(1).to_excel(w, "jogadores", index=False)
    print("jogadores", len(jog), "| titulares", int(jog.titular.sum()), "| pos11:", jog.pos11.value_counts().to_dict())

if __name__ == "__main__":
    main()
