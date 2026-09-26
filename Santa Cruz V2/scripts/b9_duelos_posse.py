"""Bloco 9 — Duelos ajustados à posse. Volume de duelo ou aproveitamento: o que anda com time vencedor?

Ajuste à posse (padrão Wyscout/StatsBomb): ação defensiva × 50 / (100 − posse do time); ação ofensiva
× 50 / posse. Um zagueiro de time que tem 40% de bola defende 60% do tempo: o volume cru dele sobe só
por isso. Posse = média da temporada do clube na Série B (serieb_jogos.csv).

1. Quanto a posse do time explica o volume cru (e quanto sobra depois do ajuste).
2. Nível TIME: o duelo dos titulares (volume ajustado e aproveitamento) × rendimento acima do dinheiro,
   pontos e gols sofridos, 80 clube-temporadas 2022–2025.
3. Nível JOGADOR: quadrantes volume ajustado × aproveitamento, por setor — que parcela de cada quadrante
   está nos times que renderam acima do dinheiro.
4. Nível JOGO: no mesmo clube, o jogo em que o time ganha mais duelos é o jogo em que pontua?
"""
import os
import numpy as np, pandas as pd
from _comum import *

OUT = os.path.join(RES, "b9"); os.makedirs(OUT, exist_ok=True)
DEF = ["Duelos defensivos/90", "Interseções/90", "Cortes/90", "Duelos aéreos/90", "Ações defensivas com êxito/90"]
OF = ["Duelos ofensivos/90", "Dribles/90"]
PCT = ["Duelos defensivos ganhos, %", "Duelos ofensivos ganhos, %", "Duelos aéreos ganhos, %", "Duelos ganhos, %"]


def base():
    j = jogos_serie_b()
    for c in ["Posse, %", "Duelos defensivos ganhos, %", "Duelos ganhos, %", "Duelos aéreos ganhos, %", "Duelos ofensivos ganhos, %", "Golos"]:
        j[c] = pd.to_numeric(j[c], errors="coerce")
    posse = j.groupby(["ano", "Equipa"])["Posse, %"].mean().rename("posse").reset_index().rename(columns={"Equipa": "clube"})
    t = tecnico()
    for c in DEF + OF + PCT + ["minutos", "fatia"]:
        t[c] = pd.to_numeric(t[c], errors="coerce")
    t = t.merge(posse, on=["ano", "clube"], how="inner")
    for c in DEF: t[c + " PAdj"] = t[c] * 50 / (100 - t.posse)
    for c in OF: t[c + " PAdj"] = t[c] * 50 / t.posse
    t = t[(t.minutos >= 900) & (t.setor != "Goleiro") & (t.setor != "Outro")]
    ct = clube_temporada()
    t = t.merge(ct[["ano", "clube", "rendimento", "pontos", "gc", "faixa"]], on=["ano", "clube"], how="left")
    return t, j, posse, ct


def r(a, b):
    x = pd.concat([a, b], axis=1).dropna()
    return round(x.iloc[:, 0].rank().corr(x.iloc[:, 1].rank()), 2), len(x)


def main():
    t, j, posse, ct = base()
    out = []
    # 1. posse explica o volume cru?
    for s in ["Zaga", "Lateral", "Volante", "Meia", "Extremo", "Atacante"]:
        a = t[t.setor == s]
        for c in ["Duelos defensivos/90", "Interseções/90", "Duelos ofensivos/90"]:
            r1, n = r(a[c], a.posse); r2, _ = r(a[c + " PAdj"], a.posse)
            out.append(dict(parte="1 posse x volume", setor=s, indicador=c, n=n, r_cru=r1, r_ajustado=r2))
    # 2. nível time: titulares de zaga + volante (defesa) e todos (geral)
    tit = t[(t.fatia >= 0.6) & (t.ano <= 2025)]
    grupos = {"zaga+volante": tit[tit.setor.isin(["Zaga", "Volante"])], "todos os titulares": tit}
    for g, a in grupos.items():
        agg = a.groupby(["ano", "clube"]).agg(**{
            "duelos_def_cru": ("Duelos defensivos/90", "mean"), "duelos_def_padj": ("Duelos defensivos/90 PAdj", "mean"),
            "duelos_def_pct": ("Duelos defensivos ganhos, %", "mean"), "aereos_pct": ("Duelos aéreos ganhos, %", "mean"),
            "duelos_pct": ("Duelos ganhos, %", "mean"), "intercep_padj": ("Interseções/90 PAdj", "mean"),
            "duelos_of_padj": ("Duelos ofensivos/90 PAdj", "mean"), "duelos_of_pct": ("Duelos ofensivos ganhos, %", "mean")}).reset_index()
        agg = agg.merge(ct, on=["ano", "clube"]).merge(posse, on=["ano", "clube"])
        for c in ["duelos_def_cru", "duelos_def_padj", "duelos_def_pct", "aereos_pct", "duelos_pct", "intercep_padj", "duelos_of_padj", "duelos_of_pct"]:
            for alvo in ["rendimento", "pontos", "gc"]:
                rr, n = r(agg[c], agg[alvo])
                out.append(dict(parte="2 time", setor=g, indicador=c, alvo=alvo, n=n, r_cru=rr))
        agg.to_csv(os.path.join(OUT, f"time_{g.replace(' ', '_').replace('+', '_')}.csv"), index=False)
    # 3. quadrantes por setor (titulares 2022–2025)
    q = []
    for s, (vol, pct) in {"Zaga": ("Duelos defensivos/90 PAdj", "Duelos defensivos ganhos, %"),
                          "Volante": ("Duelos defensivos/90 PAdj", "Duelos defensivos ganhos, %"),
                          "Lateral": ("Duelos defensivos/90 PAdj", "Duelos defensivos ganhos, %"),
                          "Meia": ("Duelos defensivos/90 PAdj", "Duelos defensivos ganhos, %"),
                          "Extremo": ("Duelos ofensivos/90 PAdj", "Duelos ofensivos ganhos, %"),
                          "Atacante": ("Duelos ofensivos/90 PAdj", "Duelos ofensivos ganhos, %")}.items():
        a = tit[tit.setor == s].dropna(subset=[vol, pct, "rendimento"]).copy()
        a["vol_alto"] = a[vol] >= a[vol].median(); a["pct_alto"] = a[pct] >= a[pct].median()
        corte = ct[ct.ano <= 2025].rendimento.quantile(0.75)
        a["ref"] = a.rendimento >= corte
        for (v, p_), g in a.groupby(["vol_alto", "pct_alto"]):
            q.append(dict(setor=s, volume="alto" if v else "baixo", aproveitamento="alto" if p_ else "baixo", n=len(g),
                          em_times_referencia=round(g.ref.mean(), 2), rendimento_medio=round(g.rendimento.mean(), 3),
                          pontos_medio=round(g.pontos.mean(), 1), vol_mediana=round(g[vol].median(), 2), pct_mediana=round(g[pct].median(), 1)))
        rv, n = r(a[vol], a.rendimento); rp, _ = r(a[pct], a.rendimento)
        out.append(dict(parte="3 jogador", setor=s, indicador=vol, alvo="rendimento", n=n, r_cru=rv))
        out.append(dict(parte="3 jogador", setor=s, indicador=pct, alvo="rendimento", n=n, r_cru=rp))
    Q = pd.DataFrame(q); Q.to_csv(os.path.join(OUT, "quadrantes.csv"), index=False)
    # 4. nível jogo, dentro do clube: % de duelos ganhos no jogo × pontos no jogo
    jj = j.copy()
    gols = jj.groupby(["ano", "Data", "Jogo"])["Golos"].transform("sum")
    jj["gp"] = jj["Golos"]; jj["gc"] = gols - jj["Golos"]
    jj["pts"] = np.where(jj.gp > jj.gc, 3, np.where(jj.gp == jj.gc, 1, 0))
    for c in ["Duelos defensivos ganhos, %", "Duelos ganhos, %", "Duelos aéreos ganhos, %", "Duelos ofensivos ganhos, %"]:
        x = jj.copy(); x["d"] = x[c] - x.groupby(["ano", "Equipa"])[c].transform("mean")
        x["p"] = x.pts - x.groupby(["ano", "Equipa"]).pts.transform("mean")
        rr, n = r(x.d, x.p)
        out.append(dict(parte="4 jogo (dentro do clube)", setor="time", indicador=c, alvo="pontos no jogo", n=n, r_cru=rr))
    O = pd.DataFrame(out); O.to_csv(os.path.join(OUT, "testes.csv"), index=False)
    pd.set_option("display.width", 220)
    print(O.to_string()); print(Q.to_string())


if __name__ == "__main__":
    main()
