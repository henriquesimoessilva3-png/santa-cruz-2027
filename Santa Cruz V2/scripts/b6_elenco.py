"""Bloco 6b — Elenco: continuidade (quem já estava), estrangeiros na Série B, e os promovidos baratos.
Escreve resultados/b6/continuidade.csv, estrangeiros.csv, estrangeiros_casos.csv, baratos.csv
"""
import os
import numpy as np, pandas as pd
from _comum import *
from b1_time import boot_corr

def main():
    out = os.path.join(RES, "b6"); os.makedirs(out, exist_ok=True)
    t = tecnico(); ct = clube_temporada()
    # continuidade: jogador (chave+idade) que jogou pelo mesmo clube no ano anterior (>=1 min)
    prev = t[["ano", "clube", "chave", "idade"]].copy(); prev["ano"] += 1; prev["idade"] += 1; prev["ja_estava"] = True
    t2 = t.merge(prev.drop_duplicates(), on=["ano", "clube", "chave", "idade"], how="left"); t2["ja_estava"] = t2.ja_estava.fillna(False)
    # só clubes que estavam na Série B no ano anterior (senão não há base para comparar)
    clubes_ano = set(zip(ct.ano, ct.clube)); t2["clube_estava_na_b"] = [(a - 1, c) in clubes_ano for a, c in zip(t2.ano, t2.clube)]
    c = t2[t2.clube_estava_na_b].groupby(["ano", "clube"]).apply(lambda g: pd.Series(dict(min_de_quem_ja_estava_pct=100 * g[g.ja_estava].minutos.sum() / g.minutos.sum(),
                                                                                          titulares_que_ja_estavam=int((g.ja_estava & (g.fatia >= 0.6)).sum()), titulares=int((g.fatia >= 0.6).sum())))).reset_index()
    c = c.merge(ct, on=["ano", "clube"]); c.to_csv(os.path.join(out, "continuidade.csv"), index=False)
    f = c[c.ano <= 2025]; x = f.groupby("ano").min_de_quem_ja_estava_pct.rank(pct=True).values; y = f.rendimento.values
    r = np.corrcoef(x, y)[0, 1]; ic, p = boot_corr(x, y, f.clube.values)
    print("=== continuidade (clubes que já estavam na B), n =", len(f)); print("minutos de quem já estava (mediana):", round(f.min_de_quem_ja_estava_pct.median(), 1), "| por faixa:", f.groupby("faixa").min_de_quem_ja_estava_pct.median().round(1).to_dict())
    print("r com rendimento:", round(r, 3), "IC", ic.round(2), "| r com pontos:", round(np.corrcoef(x, f.ppj)[0, 1], 3))
    print("titulares que já estavam (mediana por faixa):", f.groupby("faixa").titulares_que_ja_estavam.median().to_dict())
    # estrangeiros
    t["estrangeiro"] = ~t["País de nacionalidade"].fillna("Brazil").str.contains("Brazil")
    t["sulam"] = t["País de nacionalidade"].isin(["Argentina", "Uruguay", "Colombia", "Paraguay", "Chile", "Ecuador", "Peru", "Bolivia", "Venezuela"])
    es = t[t.estrangeiro & (t.ano <= 2025)]
    print("\n=== estrangeiros 2022–2025: jogador-temporadas", len(es), "| pessoas", es.chave.nunique(), "| sul-americanos", int(es.sulam.sum()))
    print("por país:", es["País de nacionalidade"].value_counts().head(8).to_dict())
    print("por posição (setor):", es.setor.value_counts().to_dict())
    print("minutos: mediana estrangeiro", int(es.minutos.median()), "| brasileiro", int(t[~t.estrangeiro & (t.ano <= 2025)].minutos.median()), "| titular (>=60%): estrangeiro", round(100 * (es.fatia >= .6).mean(), 1), "% | brasileiro", round(100 * (t[~t.estrangeiro & (t.ano <= 2025)].fatia >= .6).mean(), 1), "%")
    # primeiro ano na Série B (não aparece antes na base) e permanência no ano seguinte
    primeiro = t.groupby("chave").ano.min().rename("primeiro_ano"); t = t.join(primeiro, on="chave"); t["estreante"] = t.ano == t.primeiro_ano
    seg = set(zip(t.chave, t.ano - 1)); t["segue_na_b"] = [(c, a) in seg for c, a in zip(t.chave, t.ano)]
    for lab, m in (("estrangeiro", t.estrangeiro), ("sul-americano", t.sulam), ("brasileiro", ~t.estrangeiro)):
        d = t[m & t.ano.between(2023, 2025)]; e1 = d[d.estreante]
        print(f"{lab:14s} estreantes {len(e1):4d}: fatia mediana {e1.fatia.median()*100:.0f}% | titular {100*(e1.fatia>=.6).mean():.0f}% | segue na B no ano seguinte {100*d[d.ano<=2024].segue_na_b.mean():.0f}%")
    fx = es.merge(ct[["ano", "clube", "faixa"]], on=["ano", "clube"]); tot = t[t.ano <= 2025].merge(ct[["ano", "clube", "faixa"]], on=["ano", "clube"])
    print("minutos de estrangeiro por faixa:", (fx.groupby("faixa").minutos.sum() / tot.groupby("faixa").minutos.sum() * 100).round(1).to_dict())
    es[["ano", "clube", "jogador", "País de nacionalidade", "setor", "idade", "minutos", "fatia", "Contrato termina", "Valor de mercado"]].sort_values(["ano", "minutos"], ascending=[True, False]).to_csv(os.path.join(out, "estrangeiros_casos.csv"), index=False)
    # baratos: promovidos com posto de valor >= 11, caso a caso
    b5 = pd.read_csv(os.path.join(RES, "b5", "clube_temporada.csv"))
    bar = b5[(b5.faixa == "Sobe") & (b5.posto_valor >= 11)]
    cols = ["ano", "clube", "pos", "pontos", "posto_valor", "valor_eur", "jogadores_usados", "conc_onze_pct", "trocas_treinador", "idade_onze", "chegaram_no_ano_pct", "n_estrangeiros_500min", "xg", "xg_sof", "dist_rem", "saldo_bp", "gols_por_escanteio_pct", "duel_aer_pct", "psv_min_kmh", "spr_n"]
    ref = b5[(b5.ano <= 2025)][cols].median(numeric_only=True).rename("mediana_liga")
    print("\n=== promovidos com elenco do 11º para baixo"); print(pd.concat([bar[cols].set_index(["ano", "clube"]).T, ref], axis=1).round(2).to_string())
    bar[cols].to_csv(os.path.join(out, "baratos.csv"), index=False)
    # treinador dos baratos
    p = pd.read_csv(os.path.join(RES, "b4", "passagens.csv"))
    print(p[(p.ano.isin(bar.ano)) & (p.Equipa.isin(bar.clube))][["ano", "Equipa", "treinador", "jogos", "ppj", "primeiro", "ultimo"]].to_string(index=False))

if __name__ == "__main__":
    main()
