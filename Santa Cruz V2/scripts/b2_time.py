"""Bloco 2, pergunta 1 — indicadores técnicos do TIME contra rendimento, a dinheiro igual.

Duas contas, sempre as duas:
  (a) TEMPORADA: 80 clube-temporadas 2022-2025, indicador médio por jogo × rendimento
      (pontos/jogo acima do esperado pelo valor do elenco). Bootstrap de clube.
  (b) JOGO, dentro do mesmo clube: ~3.000 clube-jogos; indicador centrado na média do próprio
      clube-temporada e mando × pontos no jogo. Diz se o traço acompanha o ponto quando o
      MESMO time o faz mais — e não só se times melhores o têm.
Os números do adversário no mesmo jogo entram como "sofrido" (xG sofrido, distância do chute
sofrido, toques na área sofridos...).
Escreve resultados/b2/time_indicadores.csv, time_testes_temporada.csv, time_testes_jogo.csv
"""
import os
import numpy as np, pandas as pd
from _comum import *
from b1_time import boot_corr

# lista pré-declarada: (id, coluna do próprio time ou do adversário, nome, sentido)
IND = [
 ("xg", "Golos esperados", "xG criado por jogo", +1),
 ("xg_sof", "adv:Golos esperados", "xG sofrido por jogo", -1),
 ("rem", "Remates", "Finalizações por jogo", +1),
 ("rem_sof", "adv:Remates", "Finalizações sofridas por jogo", -1),
 ("dist_rem", "Distância média do remate", "Distância média da finalização (m)", -1),
 ("dist_rem_sof", "adv:Distância média do remate", "Distância média da finalização sofrida (m)", +1),
 ("xg_por_rem", "calc:xg_por_rem", "xG por finalização", +1),
 ("xg_por_rem_sof", "calc:xg_por_rem_sof", "xG por finalização sofrida", -1),
 ("rem_fora_pct", "calc:rem_fora_pct", "% das finalizações de fora da área", -1),
 ("rem_fora_sof_pct", "calc:rem_fora_sof_pct", "% das finalizações sofridas de fora da área", +1),
 ("toques", "Toques na área", "Toques na área por jogo", +1),
 ("toques_sof", "adv:Toques na área", "Toques na área sofridos por jogo", -1),
 ("entradas", "Entradas na grande área", "Entradas na área por jogo", +1),
 ("entradas_corrida", "Entradas na grande área por corrida", "Entradas na área por corrida", +1),
 ("entradas_cruz", "Entradas na grande área por cruzamento", "Entradas na área por cruzamento", +1),
 ("posse", "Posse, %", "Posse (%)", +1),
 ("passes", "Passes", "Passes por jogo", +1),
 ("passes_pct", "Passes certos, %", "Passes certos (%)", +1),
 ("longos_pct", "% de passe longo", "% de passe longo", +1),
 ("prog", "Passes progressivos", "Passes progressivos por jogo", +1),
 ("terco", "Passes para terço final", "Passes ao terço final por jogo", +1),
 ("intel", "Passes inteligentes", "Passes inteligentes por jogo", +1),
 ("cruz", "Cruzamentos", "Cruzamentos por jogo", +1),
 ("cruz_pct", "Cruzamentos certos, %", "Cruzamentos certos (%)", +1),
 ("posicional", "Ataques posicionais", "Ataques posicionais por jogo", +1),
 ("contra", "Contra-ataques", "Contra-ataques por jogo", +1),
 ("contra_rem_pct", "Contra-ataques com remates, %", "Contra-ataques com finalização (%)", +1),
 ("ppda", "PPDA", "PPDA (passes do adversário por ação defensiva)", -1),
 ("ppda_sof", "adv:PPDA", "PPDA do adversário (pressão sofrida)", +1),
 ("recup", "Recuperações", "Recuperações por jogo", +1),
 ("recup_curto", "Recuperações curto", "Recuperações rápidas (curto)", +1),
 ("intens", "Intensidade de jogo", "Intensidade de jogo", +1),
 ("duelos_pct", "Duelos ganhos, %", "Duelos ganhos (%)", +1),
 ("duel_def_pct", "Duelos defensivos ganhos, %", "Duelos defensivos ganhos (%)", +1),
 ("duel_aer_pct", "Duelos aéreos ganhos, %", "Duelos aéreos ganhos (%)", +1),
 ("duel_of_pct", "Duelos ofensivos ganhos, %", "Duelos ofensivos ganhos (%)", +1),
 ("intercep", "Interseções,", "Interceptações por jogo", +1),
 ("carrinhos", "Carrinhos", "Carrinhos por jogo", +1),
 ("faltas", "Faltas", "Faltas por jogo", -1),
 ("perdas", "Perdas", "Perdas de bola por jogo", -1),
 ("perdas_curto", "Perdas curto", "Perdas no campo próprio (curto)", -1),
 ("bp", "Bolas paradas", "Bolas paradas por jogo", +1),
 ("bp_rem", "Bolas paradas com remates", "Bolas paradas com finalização", +1),
 ("cantos", "Cantos", "Escanteios por jogo", +1),
 ("cantos_sof", "adv:Cantos", "Escanteios sofridos por jogo", -1),
]

def montar():
    j = jogos_serie_b().copy()
    j["pts"] = j["resultado"].map({"V": 3, "E": 1, "D": 0})
    adv = j[["ano", "Jogo", "Equipa"] + [c for c in j.columns if c not in ("ano", "Jogo", "Equipa")]].copy()
    adv = adv.rename(columns={"Equipa": "adversario"}); adv.columns = ["ano", "Jogo", "adversario"] + ["adv:" + c for c in adv.columns[3:]]
    j = j.merge(adv, on=["ano", "Jogo", "adversario"], how="left")
    j["calc:xg_por_rem"] = j["Golos esperados"] / j["Remates"].replace(0, np.nan)
    j["calc:xg_por_rem_sof"] = j["adv:Golos esperados"] / j["adv:Remates"].replace(0, np.nan)
    j["calc:rem_fora_pct"] = 100 * j["Remates de fora da área"] / j["Remates"].replace(0, np.nan)
    j["calc:rem_fora_sof_pct"] = 100 * j["adv:Remates de fora da área"] / j["adv:Remates"].replace(0, np.nan)
    return j

def main():
    out = os.path.join(RES, "b2"); os.makedirs(out, exist_ok=True)
    j = montar(); ct = clube_temporada()
    cols = {i: c for i, c, _, _ in IND}
    # (a) temporada
    tmp = j.groupby(["ano", "Equipa"])[list(cols.values())].mean().reset_index().rename(columns={"Equipa": "clube"})
    tmp = tmp.rename(columns={v: k for k, v in cols.items()})
    tmp = tmp.merge(ct, on=["ano", "clube"])
    tmp.to_csv(os.path.join(out, "time_indicadores.csv"), index=False)
    f = tmp[tmp.ano <= 2025]; fr = f[f.dist_g4.abs() > 3]
    rows = []
    for i, c, nome, sent in IND:
        d = f.dropna(subset=[i]); x = d.groupby("ano")[i].rank(pct=True).values * sent; y = d["rendimento"].values
        r = np.corrcoef(x, y)[0, 1]; ic, p = boot_corr(x, y, d.clube.values, n=3000)
        q = pd.qcut(x, 4, labels=False); ef = (y[q == 3].mean() - y[q == 0].mean()) * 38
        rb = np.corrcoef(x, d["ppj"].values)[0, 1]
        dd = fr.dropna(subset=[i]); xr = dd.groupby("ano")[i].rank(pct=True).values * sent
        rr = np.corrcoef(xr, dd["rendimento"].values)[0, 1]
        rows.append(dict(id=i, nome=nome, n=len(d), r=round(r, 3), ic_baixo=round(ic[0], 3), ic_alto=round(ic[1], 3), p_boot=round(p, 4),
                         r_sem_fronteira=round(rr, 3), r_pontos_brutos=round(rb, 3), top_menos_fundo_pts38=round(ef, 1),
                         mediana_sobe=round(d[d.faixa == "Sobe"][i].median(), 2), mediana_meio=round(d[d.faixa == "Meio"][i].median(), 2), mediana_cai=round(d[d.faixa == "Cai"][i].median(), 2)))
    ta = pd.DataFrame(rows).sort_values("r", ascending=False); ta.to_csv(os.path.join(out, "time_testes_temporada.csv"), index=False)
    # (b) jogo, dentro do clube
    jj = j[j.ano <= 2025].copy()
    for i, c, _, _ in IND:
        jj[i] = jj[c] - jj.groupby(["ano", "Equipa", "mando"])[c].transform("mean")
    jj["pts_c"] = jj["pts"] - jj.groupby(["ano", "Equipa", "mando"])["pts"].transform("mean")
    rows = []
    for i, c, nome, sent in IND:
        d = jj.dropna(subset=[i, "pts_c"]); x = d[i].values * sent; y = d["pts_c"].values
        r = np.corrcoef(x, y)[0, 1]; ic, p = boot_corr(x, y, d.Equipa.values, n=1000)
        # em unidade de jogo: pontos no jogo quando o indicador está no quartil de cima vs de baixo do próprio clube
        q = pd.qcut(x, 4, labels=False, duplicates="drop"); ef = d["pts"].values[q == q.max()].mean() - d["pts"].values[q == 0].mean()
        rows.append(dict(id=i, nome=nome, n_jogos=len(d), r_dentro_do_clube=round(r, 3), ic_baixo=round(ic[0], 3), ic_alto=round(ic[1], 3),
                         pts_por_jogo_top_menos_fundo=round(ef, 2)))
    tb = pd.DataFrame(rows).sort_values("r_dentro_do_clube", ascending=False); tb.to_csv(os.path.join(out, "time_testes_jogo.csv"), index=False)
    m = ta.merge(tb[["id", "r_dentro_do_clube", "pts_por_jogo_top_menos_fundo"]], on="id")
    pd.set_option("display.width", 250)
    print(m[["id", "nome", "r", "ic_baixo", "ic_alto", "r_sem_fronteira", "r_pontos_brutos", "top_menos_fundo_pts38", "r_dentro_do_clube", "pts_por_jogo_top_menos_fundo"]].to_string(index=False))

if __name__ == "__main__":
    main()
