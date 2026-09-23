"""Bloco 6c — Conversão de liga: quem chegou à Série B de outra liga, quanto do destaque manteve.

Base: _temporal_photos.json (foto por temporada 2018–2026: jogador, liga, posição, minutos e
nota qz normalizada dentro de liga × posição; q_pct = percentil). Chave: nome sem pontuação
(nkey) + posição raiz. Par = mesmo jogador em liga X no ano t e Brasil B no ano t+1 (ou t+2 para
ligas de calendário europeu), ambos com >= 900 minutos.
Escreve resultados/b6/conversao_pares.csv, conversao_ligas.csv
"""
import os, json
import numpy as np, pandas as pd
from _comum import *

def main():
    out = os.path.join(RES, "b6"); os.makedirs(out, exist_ok=True)
    ph = json.load(open(os.path.join(BASES, "wyscout_ligas", "_temporal_photos.json")))
    rows = [r for yr, lst in ph.items() for r in lst]
    d = pd.DataFrame(rows); d["nkey"] = d.nkey.map(chave)
    d = d[d.minutes >= 900]
    print("linhas com >= 900 min:", len(d), "| ligas:", d.league.nunique(), "| anos:", sorted(d.year.unique()))
    # rótulos comprometidos (ARMADILHAS): Peru 2024/2025 etc. — fora
    ruins = {("Peru", 2024), ("Peru", 2025), ("Servia", 2024), ("Dinamarca", 2023), ("Equador B", 2023), ("Portugal A", 2023)}
    d = d[~d.apply(lambda r: (r.league, r.year) in ruins, axis=1)]
    b = d[d.league == "Brasil B"]
    o = d[d.league != "Brasil B"]
    pares = []
    for dy in (1, 2):
        m = o.merge(b, on=["nkey", "root"], suffixes=("_orig", "_b"))
        m = m[m.year_b - m.year_orig == dy]
        m["dy"] = dy; pares.append(m)
    p = pd.concat(pares)
    # o primeiro ano na B depois da origem; sem homônimo (um par por nkey/ano_b)
    p = p.sort_values(["nkey", "year_b", "dy"]).drop_duplicates(["nkey", "year_b"]); p = p[~p.duplicated(["nkey", "year_orig"], keep=False)]
    # excluir quem já estava na B no ano anterior à origem?—não: origem é a liga do ano anterior por definição
    p["delta_pct"] = p.q_pct_b - p.q_pct_orig
    p.to_csv(os.path.join(out, "conversao_pares.csv"), index=False)
    print("pares origem→Série B:", len(p), "| por dy:", p.dy.value_counts().to_dict())
    g = p.groupby("league_orig").agg(n=("nkey", "size"), pct_origem=("q_pct_orig", "mean"), pct_serie_b=("q_pct_b", "mean"), delta=("delta_pct", "mean"), delta_mediana=("delta_pct", "median"),
                                    chegaram_ao_top_quartil=("q_pct_b", lambda s: (s >= 75).mean() * 100)).reset_index()
    # regressão do encolhimento: pct_b = a + b*pct_orig, por liga com n>=8
    def enc(gr):
        if len(gr) < 8: return np.nan
        return np.polyfit(gr.q_pct_orig, gr.q_pct_b, 1)[0]
    g["inclinacao"] = [enc(p[p.league_orig == l]) for l in g.league_orig]
    g = g.sort_values("n", ascending=False).round(1); g.to_csv(os.path.join(out, "conversao_ligas.csv"), index=False)
    pd.set_option("display.width", 220); print(g[g.n >= 5].to_string(index=False))
    # geral: o 10º melhor de cada 100 na origem chega onde?
    x, y = p.q_pct_orig.values, p.q_pct_b.values; bb = np.polyfit(x, y, 1)
    print("\ngeral: pct_B = %.1f + %.2f × pct_origem | quem era percentil 90 na origem chega ao %.0f; percentil 75 chega ao %.0f" % (bb[1], bb[0], bb[1] + bb[0] * 90, bb[1] + bb[0] * 75))
    for grp, ligas in {"Sul-América": ["Argentina A", "Uruguai", "Colombia A", "Chile", "Paraguai", "Equador A", "Peru", "Bolivia", "Venezuela"], "Brasil A": ["Brasil A"], "Brasil C": ["Brasil C"], "Portugal": ["Portugal A", "Portugal B"]}.items():
        q = p[p.league_orig.isin(ligas)]
        if len(q) >= 8:
            bb = np.polyfit(q.q_pct_orig, q.q_pct_b, 1); print(f"{grp:12s} n={len(q):3d}  percentil 90 na origem → {bb[1]+bb[0]*90:.0f} na B; 75 → {bb[1]+bb[0]*75:.0f}; média origem {q.q_pct_orig.mean():.0f} → B {q.q_pct_b.mean():.0f}")

if __name__ == "__main__":
    main()
