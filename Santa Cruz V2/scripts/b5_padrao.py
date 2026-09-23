"""Bloco 5 — Padrão de equipes: o que os times que renderam acima do dinheiro têm em comum.

Unidade: clube-temporada 2022-2025 (80). Referência = quartil de cima em rendimento (20).
Traços: elenco (idade dos titulares, jogadores usados, concentração de minutos nos 11, % de
minutos de quem chegou no ano, estrangeiros), técnico do time (Bloco 2), bola parada (Bloco 3),
físico (Bloco 1), treinador (trocas no ano), e custo (valor de mercado dos 11 mais usados).
Escreve resultados/b5/clube_temporada.csv, testes.csv, referencia.csv, regua.csv
"""
import os
import numpy as np, pandas as pd
from _comum import *
from b1_time import boot_corr

def main():
    out = os.path.join(RES, "b5"); os.makedirs(out, exist_ok=True)
    ct = clube_temporada(); t = tecnico()
    e = ler_csv("serieb_elencos.csv"); e["clube"] = e.clube.map(CLUBE_TM)
    # --- elenco
    rows = []
    for (ano, cl), g in t.groupby(["ano", "clube"]):
        g = g.sort_values("minutos", ascending=False); tot = g.minutos.sum()
        onze = g.head(11); usados = (g.minutos >= 90).sum()
        rows.append(dict(ano=ano, clube=cl, idade_onze=np.average(onze.idade, weights=onze.minutos), idade_elenco=g.idade.mean(),
                         jogadores_usados=usados, conc_onze_pct=100 * onze.minutos.sum() / tot,
                         estrangeiros_min_pct=100 * g[g["País de nacionalidade"].ne("Brazil")].minutos.sum() / tot,
                         n_estrangeiros_500min=int(((g["País de nacionalidade"].ne("Brazil")) & (g.minutos >= 500)).sum()),
                         emprestados_min_pct=100 * g[g["Emprestado"].eq("sim")].minutos.sum() / tot,
                         altura_onze=np.average(onze["Altura"].fillna(onze["Altura"].mean()), weights=onze.minutos),
                         valor_onze_eur=onze["Valor de mercado"].sum(), valor_elenco_wy=g["Valor de mercado"].sum(),
                         sub23_min_pct=100 * g[g.idade <= 23].minutos.sum() / tot, vet30_min_pct=100 * g[g.idade >= 30].minutos.sum() / tot))
    el = pd.DataFrame(rows)
    # chegou no ano (Transfermarkt: no_clube_desde)
    e["desde"] = pd.to_datetime(e.no_clube_desde, dayfirst=True, errors="coerce"); e["chegou_no_ano"] = e.desde.dt.year >= e.ano
    ch = e.groupby(["ano", "clube"]).chegou_no_ano.mean().mul(100).rename("chegaram_no_ano_pct").reset_index()
    # treinador: trocas no ano
    tr = ler_csv("coletas/T01_rodada_treinador.csv"); tr = tr[tr.interino == 0]
    trocas = tr.groupby(["temporada", "clube_wyscout"]).treinador.nunique().sub(1).rename("trocas_treinador").reset_index().rename(columns={"temporada": "ano", "clube_wyscout": "clube"})
    # blocos anteriores
    b2 = pd.read_csv(os.path.join(RES, "b2", "time_indicadores.csv"))[["ano", "clube", "xg", "xg_sof", "dist_rem", "xg_por_rem", "xg_por_rem_sof", "rem_fora_sof_pct", "duel_aer_pct", "posse", "ppda"]]
    b3 = pd.read_csv(os.path.join(RES, "b3", "time_bp.csv"))[["ano", "clube", "saldo_bp", "bp_pro", "bp_sof", "gols_por_escanteio_pct", "esc_contra"]]
    b1 = pd.read_csv(os.path.join(RES, "b1", "time_fisico.csv"))[["ano", "clube", "spr_n", "hi_n", "dist", "runs_area"]]
    psv = pd.read_csv(os.path.join(RES, "b1", "forma_psv_kmh.csv"))[["ano", "clube", "psv_min_kmh", "psv_amp_kmh"]]
    d = ct.merge(el, on=["ano", "clube"]).merge(ch, on=["ano", "clube"], how="left").merge(trocas, on=["ano", "clube"], how="left")
    d = d.merge(b2, on=["ano", "clube"], how="left").merge(b3, on=["ano", "clube"], how="left").merge(b1, on=["ano", "clube"], how="left").merge(psv, on=["ano", "clube"], how="left")
    corte = ct[ct.ano <= 2025].rendimento.quantile(0.75); d["referencia"] = d.rendimento >= corte
    d.to_csv(os.path.join(out, "clube_temporada.csv"), index=False)
    f = d[d.ano <= 2025]
    tra = ["idade_onze", "idade_elenco", "sub23_min_pct", "vet30_min_pct", "jogadores_usados", "conc_onze_pct", "chegaram_no_ano_pct", "estrangeiros_min_pct", "n_estrangeiros_500min",
           "emprestados_min_pct", "altura_onze", "trocas_treinador", "valor_onze_eur", "xg", "xg_sof", "dist_rem", "xg_por_rem", "xg_por_rem_sof", "rem_fora_sof_pct", "duel_aer_pct", "posse", "ppda",
           "saldo_bp", "bp_pro", "bp_sof", "gols_por_escanteio_pct", "esc_contra", "spr_n", "hi_n", "dist", "runs_area", "psv_min_kmh", "psv_amp_kmh"]
    rows = []
    for c in tra:
        dd = f.dropna(subset=[c]); x = dd.groupby("ano")[c].rank(pct=True).values; y = dd.rendimento.values
        r = np.corrcoef(x, y)[0, 1]; ic, p = boot_corr(x, y, dd.clube.values, n=2000)
        rows.append(dict(traco=c, n=len(dd), r_rendimento=round(r, 3), ic_baixo=round(ic[0], 3), ic_alto=round(ic[1], 3),
                         r_pontos=round(np.corrcoef(x, dd.ppj)[0, 1], 3), r_valor=round(np.corrcoef(x, dd.log_valor)[0, 1], 3),
                         mediana_referencia=round(dd[dd.referencia][c].median(), 2), mediana_outros=round(dd[~dd.referencia][c].median(), 2),
                         med_sobe=round(dd[dd.faixa == "Sobe"][c].median(), 2), med_meio=round(dd[dd.faixa == "Meio"][c].median(), 2), med_cai=round(dd[dd.faixa == "Cai"][c].median(), 2)))
    te = pd.DataFrame(rows).sort_values("r_rendimento", key=abs, ascending=False); te.to_csv(os.path.join(out, "testes.csv"), index=False)
    pd.set_option("display.width", 260); print(te.to_string(index=False))
    ref = f[f.referencia].sort_values("rendimento", ascending=False)[["ano", "clube", "pos", "pontos", "posto_valor", "valor_eur", "rendimento", "idade_onze", "jogadores_usados", "conc_onze_pct", "chegaram_no_ano_pct", "n_estrangeiros_500min", "trocas_treinador", "saldo_bp", "xg_por_rem", "xg_sof"]]
    ref.to_csv(os.path.join(out, "referencia.csv"), index=False); print("\n=== os 20 de referência"); print(ref.round(2).to_string(index=False))
    # régua: pontos do 4º, 2º, 17º por ano
    reg = ct[ct.ano <= 2025].pivot_table(index="ano", columns="pos", values="pontos")[[1, 2, 4, 5, 8, 16, 17]]; reg.to_csv(os.path.join(out, "regua.csv")); print("\n=== régua de pontos por posição\n", reg)
    # quem subiu barato: posto de valor >= 11 e Sobe
    print("\n=== promovidos com elenco do 11º para baixo em valor:"); print(f[(f.faixa == "Sobe") & (f.posto_valor >= 11)][["ano", "clube", "pos", "pontos", "posto_valor"]].to_string(index=False))
    print("\nrendimento dos 20 de referência: quantos subiram:", int((ref.pos <= 4).sum()), "| 5º-8º:", int(((ref.pos >= 5) & (ref.pos <= 8)).sum()))

if __name__ == "__main__":
    main()
