"""Bloco 4 — Treinador: rendimento por passagem, 2018–2026.

Passagem = treinador × clube × temporada, não interina, com ≥ 10 jogos de Série B.
Para cada passagem: pontos/jogo, posição ao assumir e ao sair, e (2022+) rendimento acima do
esperado pelo valor do elenco, e os traços do time durante a passagem (xG, xG sofrido, distância
da finalização, PPDA, posse). Por treinador: passagens, clubes, pontos/jogo ponderado, rendimento
médio, pior e melhor, e se repete em clubes diferentes.
Escreve resultados/b4/passagens.csv, treinadores.csv
"""
import os
import numpy as np, pandas as pd
from _comum import *

def jogos_todos():
    a = jogos_serie_b()
    b = ler_csv("serieb_jogos_2018_2021.csv"); b = b[b["Competição"] == "Brazil. Serie B"].copy(); b["Data"] = pd.to_datetime(b["Data"])
    cols = ["ano", "Data", "Jogo", "Equipa", "Golos", "Golos esperados", "Remates", "Distância média do remate", "PPDA", "Posse, %", "adversario", "mando", "golos_pro", "golos_contra", "resultado"]
    cols = [c for c in cols if c in a.columns and c in b.columns]
    j = pd.concat([a[cols], b[cols]]).sort_values(["ano", "Equipa", "Data"])
    j["pts"] = j.resultado.map({"V": 3, "E": 1, "D": 0})
    adv = j[["ano", "Jogo", "Equipa", "Golos esperados", "Distância média do remate"]].rename(columns={"Equipa": "adversario", "Golos esperados": "xg_sof", "Distância média do remate": "dist_rem_sof"})
    j = j.merge(adv, on=["ano", "Jogo", "adversario"], how="left")
    j["n_jogo"] = j.groupby(["ano", "Equipa"]).cumcount() + 1
    j["pts_acum"] = j.groupby(["ano", "Equipa"]).pts.cumsum()
    return j

def posicao_na_rodada(j):
    """posição do clube após o seu n-ésimo jogo, pelos pontos acumulados de todos na mesma rodada-jogo."""
    p = j.groupby(["ano", "n_jogo"]).pts_acum.rank(ascending=False, method="min")
    return p

def main():
    out = os.path.join(RES, "b4"); os.makedirs(out, exist_ok=True)
    j = jogos_todos(); j["pos_apos"] = posicao_na_rodada(j)
    tr = ler_csv("coletas/T01_rodada_treinador.csv"); tr["data"] = pd.to_datetime(tr.data)
    tr = tr.rename(columns={"temporada": "ano", "clube_wyscout": "Equipa"}).sort_values("data")
    j = j.sort_values("Data")
    m = pd.merge_asof(j, tr[["ano", "Equipa", "data", "treinador", "interino"]], left_on="Data", right_on="data", by=["ano", "Equipa"], tolerance=pd.Timedelta("2D"), direction="nearest")
    m = m.dropna(subset=["treinador"])
    print("jogos com treinador:", len(m), "de", len(j))
    ct = clube_temporada()[["ano", "clube", "log_valor", "posto_valor", "ppj_esperado", "pos", "pontos"]].rename(columns={"Equipa": "clube"})
    m = m.merge(ct, left_on=["ano", "Equipa"], right_on=["ano", "clube"], how="left")
    # passagens
    g = m[m.interino == 0].groupby(["ano", "Equipa", "treinador"])
    p = g.agg(jogos=("pts", "size"), pontos=("pts", "sum"), ppj=("pts", "mean"), primeiro=("n_jogo", "min"), ultimo=("n_jogo", "max"),
              xg=("Golos esperados", "mean"), xg_sof=("xg_sof", "mean"), dist_rem=("Distância média do remate", "mean"), dist_rem_sof=("dist_rem_sof", "mean"),
              ppda=("PPDA", "mean"), posse=("Posse, %", "mean"), ppj_esperado=("ppj_esperado", "first"), posto_valor=("posto_valor", "first"), pos_final_clube=("pos", "first")).reset_index()
    p = p[p.jogos >= 10]
    # posição ao assumir (após o jogo anterior ao primeiro dele) e ao sair
    pos = m[["ano", "Equipa", "n_jogo", "pos_apos"]]
    p = p.merge(pos.rename(columns={"n_jogo": "primeiro", "pos_apos": "pos_saida_anterior"}).assign(primeiro=lambda d: d.primeiro + 1), on=["ano", "Equipa", "primeiro"], how="left")
    p = p.merge(pos.rename(columns={"n_jogo": "ultimo", "pos_apos": "pos_ao_sair"}), on=["ano", "Equipa", "ultimo"], how="left")
    p = p.rename(columns={"pos_saida_anterior": "pos_ao_assumir"}); p.loc[p.primeiro == 1, "pos_ao_assumir"] = np.nan
    p["rendimento"] = p.ppj - p.ppj_esperado
    p["temporada_inteira"] = (p.primeiro == 1) & (p.ultimo >= 37)
    # rendimento sem valor (2018-2021): ppj menos a média da liga (1,37) — só para descrever
    p["ppj_vs_liga"] = p.ppj - 38 * 1.37 / 38
    p = p.sort_values(["treinador", "ano"]); p.to_csv(os.path.join(out, "passagens.csv"), index=False)
    # por treinador
    rows = []
    for t, g in p.groupby("treinador"):
        g22 = g.dropna(subset=["rendimento"])
        rows.append(dict(treinador=t, passagens=len(g), clubes=g.Equipa.nunique(), jogos=int(g.jogos.sum()), anos=f"{g.ano.min()}–{g.ano.max()}",
                         ppj=round(np.average(g.ppj, weights=g.jogos), 2), ppj_pior=round(g.ppj.min(), 2), ppj_melhor=round(g.ppj.max(), 2),
                         rendimento_medio=round(np.average(g22.rendimento, weights=g22.jogos), 2) if len(g22) else np.nan,
                         rendimento_pior=round(g22.rendimento.min(), 2) if len(g22) else np.nan, passagens_com_valor=len(g22),
                         clubes_com_rendimento_positivo=int(g22[g22.rendimento > 0].Equipa.nunique()),
                         posto_valor_medio=round(g22.posto_valor.mean(), 1) if len(g22) else np.nan,
                         temporadas_inteiras=int(g.temporada_inteira.sum()), acessos=int((g.temporada_inteira & (g.pos_final_clube <= 4)).sum()),
                         g4_ao_sair=int((g.pos_ao_sair <= 4).sum()), subiu_posicoes_media=round((g.pos_ao_assumir - g.pos_ao_sair).mean(), 1),
                         xg=round(g.xg.mean(), 2), xg_sof=round(g.xg_sof.mean(), 2), dist_rem=round(g.dist_rem.mean(), 1), ppda=round(g.ppda.mean(), 1), posse=round(g.posse.mean(), 1),
                         clubes_lista=", ".join(f"{r.Equipa} {r.ano} ({r.jogos}j, {r.ppj:.2f})" for r in g.itertuples())))
    t = pd.DataFrame(rows)
    t.to_csv(os.path.join(out, "treinadores.csv"), index=False)
    pd.set_option("display.width", 260)
    print("\n=== passagens ≥10 jogos:", len(p), "| treinadores:", len(t))
    # repetição entre clubes: rendimento numa passagem prevê a seguinte, em clube diferente?
    pp = p.dropna(subset=["rendimento"]).sort_values(["treinador", "ano"])
    pares = []
    for tname, g in pp.groupby("treinador"):
        g = g.reset_index(drop=True)
        for i in range(len(g) - 1):
            if g.Equipa[i] != g.Equipa[i + 1]: pares.append((g.rendimento[i], g.rendimento[i + 1], g.ppj[i], g.ppj[i + 1]))
    pares = np.array(pares); print("pares de passagens seguidas em clubes diferentes:", len(pares), "| r rendimento:", round(np.corrcoef(pares[:, 0], pares[:, 1])[0, 1], 2), "| r ppj:", round(np.corrcoef(pares[:, 2], pares[:, 3])[0, 1], 2))
    # troca no meio do ano: pontos antes e depois, no mesmo clube-ano
    tro = []
    for (ano, cl), g in p.groupby(["ano", "Equipa"]):
        g = g.sort_values("primeiro")
        for i in range(len(g) - 1): tro.append((g.ppj.iloc[i], g.ppj.iloc[i + 1], g.pos_ao_sair.iloc[i], g.pos_ao_sair.iloc[i + 1]))
    tro = np.array(tro); print("trocas com ≥10 jogos de cada lado:", len(tro), "| ppj antes %.2f → depois %.2f" % (tro[:, 0].mean(), tro[:, 1].mean()), "| melhorou em", int((tro[:, 1] > tro[:, 0]).sum()))
    sel = t[(t.passagens_com_valor >= 2)].sort_values("rendimento_medio", ascending=False)
    print("\n=== treinadores com 2+ passagens desde 2022, por rendimento médio a dinheiro igual")
    print(sel[["treinador", "passagens", "clubes", "jogos", "anos", "ppj", "rendimento_medio", "rendimento_pior", "clubes_com_rendimento_positivo", "posto_valor_medio", "acessos", "temporadas_inteiras", "xg_sof", "dist_rem"]].head(25).to_string(index=False))
    print("\n=== uma passagem só desde 2022, rendimento > 0,25")
    print(t[(t.passagens_com_valor == 1) & (t.rendimento_medio > 0.25)].sort_values("rendimento_medio", ascending=False)[["treinador", "jogos", "anos", "ppj", "rendimento_medio", "posto_valor_medio", "acessos", "clubes_lista"]].to_string(index=False))

if __name__ == "__main__":
    main()
