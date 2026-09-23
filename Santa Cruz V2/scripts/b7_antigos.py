"""Bloco 7 — o que os dois estudos antigos (Análise Série B e Protótipo) mediram e o V2 ainda não:
concentração de gols (artilheiro), resiliência (pontos após derrota, sequência sem vencer), lesões.
Escreve resultados/b7/testes.csv, clube_temporada.csv
"""
import os
import numpy as np, pandas as pd
from _comum import *
from b1_time import boot_corr

def main():
    out = os.path.join(RES, "b7"); os.makedirs(out, exist_ok=True)
    ct = clube_temporada(); t = tecnico(); j = jogos_serie_b().sort_values(["ano", "Equipa", "Data"])
    j["pts"] = j.resultado.map({"V": 3, "E": 1, "D": 0})
    # gols: artilheiro e top3
    g = t.groupby(["ano", "clube"]).apply(lambda d: pd.Series(dict(gols=d.Golos.sum(), artilheiro_pct=100 * d.Golos.max() / d.Golos.sum(), top3_pct=100 * d.Golos.nlargest(3).sum() / d.Golos.sum(),
                                                                   marcadores=int((d.Golos > 0).sum()), gols_zaga_vol=d[d.setor.isin(["Zaga", "Volante"])].Golos.sum(), gols_laterais=d[d.setor == "Lateral"].Golos.sum()))).reset_index()
    # resiliência
    rows = []
    for (ano, cl), d in j.groupby(["ano", "Equipa"]):
        r = d.resultado.values; p = d.pts.values
        apos_d = p[1:][r[:-1] == "D"]; apos_v = p[1:][r[:-1] == "V"]
        seq, mx = 0, 0
        for x in r:
            seq = seq + 1 if x != "V" else 0; mx = max(mx, seq)
        rows.append(dict(ano=ano, clube=cl, pts_apos_derrota=apos_d.mean() if len(apos_d) else np.nan, pts_apos_vitoria=apos_v.mean() if len(apos_v) else np.nan, maior_seq_sem_vencer=mx,
                         pts_casa=d[d.mando == "casa"].pts.mean(), pts_fora=d[d.mando != "casa"].pts.mean()))
    rs = pd.DataFrame(rows)
    # lesões: dias perdidos no ano por clube (Transfermarkt)
    e = ler_csv("serieb_elencos.csv"); e["clube"] = e.clube.map(CLUBE_TM); l = ler_csv("serieb_lesoes.csv")
    dias = {a: l.groupby("id_jogador")[f"dias_{a}"].sum() for a in range(2022, 2027)}
    e["dias_lesao"] = [dias[a].get(i, 0) for a, i in zip(e.ano, e.id_jogador)]
    le = e.groupby(["ano", "clube"]).agg(dias_lesao=("dias_lesao", "sum"), lesionados=("dias_lesao", lambda s: (s > 0).sum()), elenco_tm=("id_jogador", "size")).reset_index()
    d = ct.merge(g, on=["ano", "clube"]).merge(rs, on=["ano", "clube"]).merge(le, on=["ano", "clube"], how="left")
    d.to_csv(os.path.join(out, "clube_temporada.csv"), index=False)
    f = d[d.ano <= 2025]
    rows = []
    for c in ["artilheiro_pct", "top3_pct", "marcadores", "gols_zaga_vol", "gols_laterais", "pts_apos_derrota", "pts_apos_vitoria", "maior_seq_sem_vencer", "pts_casa", "pts_fora", "dias_lesao", "lesionados"]:
        dd = f.dropna(subset=[c]); x = dd.groupby("ano")[c].rank(pct=True).values; y = dd.rendimento.values
        r = np.corrcoef(x, y)[0, 1]; ic, p = boot_corr(x, y, dd.clube.values, n=2000)
        rows.append(dict(traco=c, n=len(dd), r_rendimento=round(r, 3), ic_baixo=round(ic[0], 3), ic_alto=round(ic[1], 3), r_pontos=round(np.corrcoef(x, dd.ppj)[0, 1], 3), r_valor=round(np.corrcoef(x, dd.log_valor)[0, 1], 3),
                         med_sobe=round(dd[dd.faixa == "Sobe"][c].median(), 2), med_meio=round(dd[dd.faixa == "Meio"][c].median(), 2), med_cai=round(dd[dd.faixa == "Cai"][c].median(), 2)))
    te = pd.DataFrame(rows); te.to_csv(os.path.join(out, "testes.csv"), index=False)
    pd.set_option("display.width", 220); print(te.to_string(index=False))

if __name__ == "__main__":
    main()
