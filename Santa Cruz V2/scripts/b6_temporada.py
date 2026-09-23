"""Bloco 6a — Temporada: trajetória (quando o destino se decide) e gols por faixa de minuto.
Escreve resultados/b6/trajetoria.csv, trajetoria_resumo.csv, gols_minuto.csv
"""
import os
import numpy as np, pandas as pd
from _comum import *
from b4_treinador import jogos_todos, posicao_na_rodada

def main():
    out = os.path.join(RES, "b6"); os.makedirs(out, exist_ok=True)
    j = jogos_todos(); j["pos_apos"] = posicao_na_rodada(j)
    ct = classificacao()[["ano", "clube", "pos", "pontos", "faixa"]].rename(columns={"pos": "pos_final", "pontos": "pontos_final"})
    j = j.merge(ct, left_on=["ano", "Equipa"], right_on=["ano", "clube"])
    fech = j[j.ano.between(2018, 2025) & (j.ano != 2020)]  # 2020 pandemia: temporada atravessada, fica fora
    rows = []
    for n in (10, 15, 19, 24, 28, 32):
        d = fech[fech.n_jogo == n]
        g4 = d[d.pos_apos <= 4]; z4 = d[d.pos_apos >= 17]
        rows.append(dict(rodada=n, temporadas=d.ano.nunique(),
                         no_g4_que_subiram=int((g4.pos_final <= 4).sum()), no_g4=len(g4), promovidos_ja_no_g4_pct=round(100 * (g4.pos_final <= 4).sum() / (4 * d.ano.nunique()), 0),
                         no_z4_que_cairam=int((z4.pos_final >= 17).sum()), no_z4=len(z4), rebaixados_ja_no_z4_pct=round(100 * (z4.pos_final >= 17).sum() / (4 * d.ano.nunique()), 0),
                         pontos_mediana_futuros_promovidos=d[d.pos_final <= 4].pts_acum.median(), pontos_mediana_meio=d[(d.pos_final > 4) & (d.pos_final < 17)].pts_acum.median(),
                         pontos_mediana_futuros_rebaixados=d[d.pos_final >= 17].pts_acum.median(),
                         pior_posicao_de_um_promovido=int(d[d.pos_final <= 4].pos_apos.max()), melhor_posicao_de_um_rebaixado=int(d[d.pos_final >= 17].pos_apos.min())))
    tr = pd.DataFrame(rows); tr.to_csv(os.path.join(out, "trajetoria_resumo.csv"), index=False)
    pd.set_option("display.width", 250); print("=== trajetória (2018–2025 sem 2020, 7 temporadas)"); print(tr.to_string(index=False))
    # ponto por jogo no 1º e 2º turno por faixa final
    fech = fech.assign(turno=np.where(fech.n_jogo <= 19, 1, 2))
    piv = fech.groupby(["faixa", "turno"]).pts.mean().unstack().round(2); print("\npontos por jogo por turno:\n", piv)
    # quem virou: fora do G4 na 19 e subiu / no G4 na 19 e não subiu
    d19 = fech[fech.n_jogo == 19]
    vir = d19[(d19.pos_apos > 4) & (d19.pos_final <= 4)][["ano", "Equipa", "pos_apos", "pts_acum", "pos_final", "pontos_final"]]
    per = d19[(d19.pos_apos <= 4) & (d19.pos_final > 4)][["ano", "Equipa", "pos_apos", "pts_acum", "pos_final", "pontos_final"]]
    print("\nsubiram vindo de fora do G4 na metade:\n", vir.to_string(index=False)); print("\nestavam no G4 na metade e não subiram:\n", per.to_string(index=False))
    esc = d19[(d19.pos_apos >= 17) & (d19.pos_final < 17)]; print("\nescaparam do Z4 depois da metade:", len(esc), "| caíram vindo de fora do Z4:", int(((d19.pos_apos < 17) & (d19.pos_final >= 17)).sum()))
    d19[["ano", "Equipa", "pos_apos", "pts_acum", "pos_final", "pontos_final"]].to_csv(os.path.join(out, "trajetoria.csv"), index=False)
    # gols por minuto (oGol)
    gm = ler_csv("coletas/serieb_gols_por_minuto.csv")
    nomes = {"Athletico": "Athletico-PR", "Atlético Goianiense": "Atlético-GO", "América Mineiro": "América-MG", "Sport Recife": "Sport", "Vasco da Gama": "Vasco", "Grêmio Novorizontino": "Novorizontino", "Paysandu SC": "Paysandu", "Amazonas FC": "Amazonas", "Vila Nova FC": "Vila Nova", "Athletic Club": "Athletic", "Clube De Regatas Brasil": "CRB"}
    gm["clube"] = gm.clube_ogol.map(lambda s: nomes.get(s, s)); gm = gm.rename(columns={"temporada": "ano"})
    gm = gm.merge(ct, on=["ano", "clube"], how="inner"); print("\nclube-temporadas com gols por minuto casados:", gm.groupby("lado").size().to_dict())
    faixas = ["faixa_0_15", "faixa_15_30", "faixa_30_45", "faixa_45mais", "faixa_45_60", "faixa_60_75", "faixa_75_90", "faixa_90mais"]
    for c in faixas: gm[c + "_pj"] = gm[c] / gm.jogos
    res = gm[gm.ano.between(2022, 2025)].groupby(["lado", "faixa"])[[c + "_pj" for c in faixas]].mean().round(3)
    res.to_csv(os.path.join(out, "gols_minuto.csv")); print("\n=== gols por jogo por faixa de minuto, 2022–2025\n", res.to_string())

if __name__ == "__main__":
    main()
