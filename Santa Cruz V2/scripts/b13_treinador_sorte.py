"""Bloco 13 — Treinador: sorte × mérito. Pontos esperados (xPts) por passagem, a partir do xG a favor e
contra de cada jogo (Poisson), contra os pontos reais. O que sobra (pontos − xPts) é o que o xG não
explica: finalização, goleiro e sorte — e não repete. Prova: resultados/b13/passagens_xpts.csv"""
import os, numpy as np, pandas as pd
from math import exp, factorial
from _comum import RAIZ
from b11_treinador_modelo import jogos, sp
OUT = os.path.join(RAIZ, "resultados", "b13"); os.makedirs(OUT, exist_ok=True)
RES = os.path.join(RAIZ, "resultados")

def xpts(xg, xga, k=8):
    if pd.isna(xg) or pd.isna(xga): return np.nan
    p = lambda l, n: exp(-l) * l ** n / factorial(n)
    w = d = 0.0
    for i in range(k):
        for j in range(k):
            q = p(xg, i) * p(xga, j)
            if i > j: w += q
            elif i == j: d += q
    return 3 * w + d

def main():
    g = jogos(); g["xpts"] = [xpts(a, b) for a, b in zip(g.xg, g.xg_sof)]
    p = pd.read_csv(os.path.join(RES, "b4", "passagens.csv")); p = p[p.ano >= 2022].rename(columns={"Equipa": "clube"})
    rows = []
    for r in p.itertuples():
        x = g[(g.ano == r.ano) & (g.clube == r.clube) & (g.n_jogo >= r.primeiro) & (g.n_jogo <= r.ultimo)]
        if len(x) < 10: continue
        rows.append(dict(ano=r.ano, clube=r.clube, treinador=r.treinador, jogos=len(x), ppj=x.pts.mean(), xppj=x.xpts.mean(),
                         sorte=x.pts.mean() - x.xpts.mean(), xg=x.xg.mean(), xg_sof=x.xg_sof.mean(), gp=x.gp.mean(), gc=x.gc.mean(),
                         rendimento=r.rendimento))
    d = pd.DataFrame(rows).round(3); d.to_csv(os.path.join(OUT, "passagens_xpts.csv"), index=False)
    # sorte repete? pares seguidos do mesmo treinador
    d = d.sort_values(["treinador", "ano"]); pares = []
    for t, x in d.groupby("treinador"):
        x = x.reset_index(drop=True)
        for i in range(1, len(x)): pares.append((x.sorte[i - 1], x.sorte[i], x.xppj[i - 1], x.xppj[i], x.ppj[i - 1], x.ppj[i]))
    pr = pd.DataFrame(pares, columns=["s1", "s2", "x1", "x2", "p1", "p2"])
    rep = dict(n=len(pr), sorte=sp(pr.s1, pr.s2), xppj=sp(pr.x1, pr.x2), ppj=sp(pr.p1, pr.p2))
    agg = d.groupby("treinador").agg(passagens=("ano", "size"), jogos=("jogos", "sum"), ppj=("ppj", "mean"), xppj=("xppj", "mean"),
                                     sorte=("sorte", "mean"), rendimento=("rendimento", "mean")).round(2)
    agg = agg[agg.passagens >= 2].sort_values("xppj", ascending=False); agg.to_csv(os.path.join(OUT, "treinadores_xpts.csv"))
    F = ["Léo Condé", "Eduardo Baptista", "Mozart", "Claudio Tencati", "Guto Ferreira", "Thiago Carpini", "Enderson Moreira"]
    f = lambda v, c=2: f"{v:.{c}f}".replace(".", ",").replace("-", "−")
    md = ["# Bloco 13 — Treinador: sorte × mérito", "", "*Dado: Wyscout por jogo 2022–2026 e passagens do Bloco 4 · 25/09/2026.*", "",
          "Pontos esperados (xPts) de cada jogo pelo xG a favor e contra (Poisson); a diferença entre pontos reais e xPts é o que o xG não explica — finalização, goleiro e sorte. "
          f"Base: {len(d)} passagens com ≥ 10 jogos.", "",
          "## 1 · O que repete de uma passagem para a seguinte do mesmo treinador",
          "", "| Medida | r entre passagens seguidas | Leitura |", "|---|---|---|",
          f"| Pontos por jogo | {f(rep['ppj'])} | quase nada (B4-1) |",
          f"| **xPts por jogo** | **{f(rep['xppj'])}** | o que o time cria e cede — repete mais que o placar |",
          f"| Sorte (pontos − xPts) | {f(rep['sorte'])} | não repete: não pagar por ela |",
          f"", f"n = {rep['n']} pares.", "",
          "## 2 · Os treinadores em foco", "",
          "| Treinador | Passagens | Jogos | Pontos/j | xPts/j | Sorte/j | Rendimento | Leitura |", "|---|---|---|---|---|---|---|---|"]
    for t in F:
        if t not in agg.index: continue
        r = agg.loc[t]
        le = "mérito: xPts acima do que os pontos mostram" if r.sorte < -0.05 else ("sorte: pontos acima do que o jogo sustenta" if r.sorte > 0.1 else "pontos e xPts alinhados")
        md.append(f"| **{t}** | {int(r.passagens)} | {int(r.jogos)} | {f(r.ppj)} | {f(r.xppj)} | {f(r.sorte,2)} | {f(r.rendimento,2)} | {le} |")
    md += ["", "## 3 · Passagem a passagem (foco)", "", "| Ano | Clube | Treinador | Jogos | Pontos/j | xPts/j | Sorte/j | xG | xG sofrido |", "|---|---|---|---|---|---|---|---|---|"]
    for r in d[d.treinador.isin(F)].sort_values(["treinador", "ano"]).itertuples():
        md.append(f"| {r.ano} | {r.clube} | {r.treinador} | {r.jogos} | {f(r.ppj)} | {f(r.xppj)} | {f(r.sorte)} | {f(r.xg)} | {f(r.xg_sof)} |")
    top = agg.head(12)
    md += ["", "## 4 · Os 12 de maior xPts por jogo (2+ passagens)", "", "| Treinador | Passagens | Pontos/j | xPts/j | Sorte/j |", "|---|---|---|---|---|"]
    for t, r in top.iterrows(): md.append(f"| {t} | {int(r.passagens)} | {f(r.ppj)} | {f(r.xppj)} | {f(r.sorte)} |")
    open(os.path.join(OUT, "B13.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    print(rep); print(agg.loc[[t for t in F if t in agg.index]])

if __name__ == "__main__":
    main()
