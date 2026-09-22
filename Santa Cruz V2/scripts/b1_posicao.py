"""Bloco 1, perguntas 3 e 4 — perfil físico por posição e físico × disponibilidade.

3) Titulares (>= 60% dos minutos do clube) 2022-2025. Para cada setor e métrica: correlação entre o
   posto do jogador (dentro de ano × setor) e o rendimento do clube (a dinheiro igual), IC por
   bootstrap de clube; e as faixas P25-P50-P75 dos titulares dos times de referência (quartil de
   cima em rendimento) contra os demais, em unidade de jogo.
4) O físico do ano t prevê minutos do ano t+1 (mesmo jogador, mesma liga)?
Escreve resultados/b1/posicao_testes.csv, posicao_faixas.csv, disponibilidade.csv
"""
import os
import numpy as np, pandas as pd
from _comum import *
from b1_time import MET, boot_corr

def main():
    out = os.path.join(RES, "b1")
    b = pd.read_csv(os.path.join(out, "base_fisico.csv"))
    ct = clube_temporada()
    b = b.merge(ct[["ano", "clube", "rendimento", "ppj", "faixa", "log_valor"]], on=["ano", "clube"])
    b = b[(b.setor != "Goleiro") & (b.ano <= 2025)]
    ref_corte = ct[ct.ano <= 2025]["rendimento"].quantile(0.75)
    b["referencia"] = b["rendimento"] >= ref_corte
    tit = b[b.fatia >= 0.6].copy()
    mets = dict(MET); mets["cod"] = ("cod_count_p90", "Mudanças de direção por 90", "n")
    mets["t_spr"] = ("psv99_top5", "PSV-99 média dos 5 melhores jogos", "km/h")
    linhas, faixas = [], []
    for s, g in tit.groupby("setor"):
        for k, (col, nome, un) in mets.items():
            d = g.dropna(subset=[col])
            if len(d) < 25: continue
            x = d.groupby("ano")[col].rank(pct=True).values; y = d["rendimento"].values
            r = np.corrcoef(x, y)[0, 1]; ic, p = boot_corr(x, y, d.clube.values, n=2000)
            linhas.append(dict(setor=s, id=k, nome=nome, n=len(d), n_ref=int(d.referencia.sum()), r=round(r, 3),
                               ic_baixo=round(ic[0], 3), ic_alto=round(ic[1], 3), p_boot=round(p, 4)))
            rf, ou = d[d.referencia][col], d[~d.referencia][col]
            faixas.append(dict(setor=s, id=k, nome=nome, unidade=un, n_ref=len(rf), n_outros=len(ou),
                               ref_p25=rf.quantile(.25), ref_p50=rf.median(), ref_p75=rf.quantile(.75),
                               outros_p50=ou.median(), dif_mediana_pct=round(100 * (rf.median() - ou.median()) / ou.median(), 1)))
    t = pd.DataFrame(linhas); t.to_csv(os.path.join(out, "posicao_testes.csv"), index=False)
    f = pd.DataFrame(faixas).round(2); f.to_csv(os.path.join(out, "posicao_faixas.csv"), index=False)
    print("=== por posição, titulares: métrica × rendimento do clube (IC fora do zero)")
    print(t[(t.ic_baixo > 0) | (t.ic_alto < 0)].sort_values(["setor", "r"]).to_string(index=False))
    print("\n=== quanto do perfil de fase é do clube: R² de clube-temporada na razão sprint OTIP/TIP")
    b["razao_spr"] = b["sprint_distance_p30otip"] / b["sprint_distance_p30tip"]
    d = tit.assign(razao=tit["sprint_distance_p30otip"] / tit["sprint_distance_p30tip"]).dropna(subset=["razao"])
    tot = d.razao.var(); entre = d.groupby(["ano", "clube"]).razao.transform("mean").var()
    print("R² clube:", round(entre / tot, 3), " n =", len(d))

    # 4) disponibilidade: físico em t → fatia em t+1 (mesmo sc_player_id, na Série B)
    b2 = pd.read_csv(os.path.join(out, "base_fisico.csv")); b2 = b2[b2.setor != "Goleiro"]
    nxt = b2[["sc_player_id", "ano", "fatia", "minutos", "jogos"]].copy(); nxt["ano"] -= 1
    nxt = nxt.rename(columns={"fatia": "fatia_prox", "minutos": "min_prox", "jogos": "jogos_prox"})
    pares = b2.merge(nxt, on=["sc_player_id", "ano"])
    pares = pares[pares.fatia >= 0.3]  # quem já jogava
    rows = []
    for k, (col, nome, un) in mets.items():
        d = pares.dropna(subset=[col]); x = d.groupby(["ano", "setor"])[col].rank(pct=True).values
        for alvo in ("fatia_prox",):
            y = d[alvo].values; r = np.corrcoef(x, y)[0, 1]
            # controlar pela fatia do próprio ano: correlação parcial
            z = d["fatia"].values; rxz = np.corrcoef(x, z)[0, 1]; ryz = np.corrcoef(y, z)[0, 1]
            rp = (r - rxz * ryz) / np.sqrt((1 - rxz**2) * (1 - ryz**2))
            rows.append(dict(id=k, nome=nome, n=len(d), r=round(r, 3), r_parcial_fatia=round(rp, 3)))
    dd = pd.DataFrame(rows).sort_values("r_parcial_fatia", key=abs, ascending=False)
    dd.to_csv(os.path.join(out, "disponibilidade.csv"), index=False)
    print("\n=== físico em t → fatia de minutos em t+1 (n pares =", len(pares), ")"); print(dd.to_string(index=False))
    print("idade × fatia_prox (parcial):", round(np.corrcoef(pares.idade, pares.fatia_prox)[0, 1], 3))

if __name__ == "__main__":
    main()
