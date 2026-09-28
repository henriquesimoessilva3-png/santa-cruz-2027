"""F2-9 — Combinações entre posições: lateral + zagueiro do mesmo lado, volante + zaga, o onze inteiro (quantos do tipo A,
composição rápidos/volume/baixos) e todos os pares de posições em que uma combinação separa quem sobe de quem cai.
Titular = o mais usado da posição em cada clube-temporada 2022–2025 (≥ 900 min). Saída: resultados/b8/combinacoes.csv, item 9 do B8.md."""
import os, itertools, numpy as np, pandas as pd
from _comum import RAIZ
from b8_fisico_tecnico import base, tipos
OUT = os.path.join(RAIZ, "resultados", "b8")
POS = ["LD", "ZD", "ZE", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]
FAM = {"Explosivo e rápido": "rápido", "Mais intenso": "rápido", "Motor de volume": "volume", "Intermediário": "volume", "Médio em tudo": "volume", "Baixa intensidade": "baixo", "Menos intenso": "baixo"}
f = lambda v: f"{v:.0f}%"

def main():
    d = base(); G, T = tipos(d); T = T[T.minutos >= 900]
    P = pd.read_csv(os.path.join(OUT, "tipos_preferidos_pos.csv")).set_index("pos11").preferidos.fillna("")
    T["A"] = [t in str(P.get(p, "")).split(" / ") for p, t in zip(T.pos11, T.tipo)]
    tit = T.sort_values("minutos", ascending=False).groupby(["ano", "clube", "pos11"]).head(1)
    W = tit.pivot_table(index=["ano", "clube"], columns="pos11", values="tipo", aggfunc="first"); W["faixa"] = tit.groupby(["ano", "clube"]).faixa.first()
    def tab(cols, minn):
        x = W.dropna(subset=cols).copy(); x["combo"] = x[cols].agg(" | ".join, axis=1)
        t = pd.crosstab(x.combo, x.faixa).reindex(columns=["Sobe", "Meio", "Cai"], fill_value=0); p = t / t.sum()
        t["pS"] = p.Sobe * 100; t["pC"] = p.Cai * 100; t["dif"] = t.pS - t.pC; t["n"] = t[["Sobe", "Meio", "Cai"]].sum(1)
        return t[t.n >= minn].sort_values("dif", ascending=False)
    def md_tab(t, cab):
        out = [f"| {cab} | Subiu | Meio | Caiu | Sobe − Cai | n |", "|---|---|---|---|---|---|"]
        for k, r in t.iterrows(): out.append(f"| **{k}** | {f(r.pS)} | {f(100*r.Meio/max(1,(t.Meio.sum())))} | {f(r.pC)} | {'+' if r.dif >= 0 else ''}{r.dif:.0f} | {int(r.n)} |")
        return out
    md = ["## 9 · Combinações entre posições: o lado, o volante com a zaga, o onze inteiro e os pares que separam", "",
          "Titular = o mais usado da posição em cada clube-temporada (2022–2025, ≥ 900 min). Mesma leitura dos itens 7 e 8: de cada 100 times da faixa, quantos têm a combinação; amostra de 12–19 times por faixa — direção, não régua.", "",
          "### 9.1 · Lateral + zagueiro do mesmo lado", ""]
    md += ["**Lado direito (LD | ZD)**", ""] + md_tab(tab(["LD", "ZD"], 5), "LD | ZD") + [""]
    md += ["**Lado esquerdo (LE | ZE)**", ""] + md_tab(tab(["LE", "ZE"], 5), "LE | ZE") + [""]
    # condicional: dado o zagueiro, qual lateral
    md += ["**Dado o zagueiro, qual lateral sobe** (times que subiram × que caíram, por tipo do lateral):", ""]
    for z, l in [("ZD", "LD"), ("ZE", "LE")]:
        x = W.dropna(subset=[z, l])
        for zt, g in x.groupby(z):
            t = pd.crosstab(g[l], g.faixa).reindex(columns=["Sobe", "Meio", "Cai"], fill_value=0)
            md.append(f"- {z} **{zt}** → {l}: " + "; ".join(f"{k} {int(r.Sobe)} × {int(r.Cai)}" for k, r in t.iterrows()))
    md += ["", "### 9.2 · Volante com a zaga (VOL | ZD | ZE)", ""] + md_tab(tab(["VOL", "ZD", "ZE"], 3), "VOL | ZD | ZE") + [""]
    for z in ["ZD", "ZE"]:
        x = W.dropna(subset=[z, "VOL"])
        for zt, g in x.groupby(z):
            t = pd.crosstab(g["VOL"], g.faixa).reindex(columns=["Sobe", "Meio", "Cai"], fill_value=0)
            md.append(f"- {z} **{zt}** → volante: " + "; ".join(f"{k} {int(r.Sobe)} × {int(r.Cai)}" for k, r in t.iterrows()))
    # onze
    nA = tit[tit.pos11 != "GOL"].groupby(["ano", "clube"]).agg(nA=("A", "sum"), n=("A", "size"), faixa=("faixa", "first")); nA = nA[nA.n >= 8]
    m = nA.groupby("faixa").nA.mean()
    tt = tit[tit.pos11 != "GOL"].assign(fam=lambda x: x.tipo.map(FAM))
    F = tt.groupby(["ano", "clube", "fam"]).size().unstack(fill_value=0); F["n"] = F.sum(1); F = F[F.n >= 8]; F["faixa"] = W.faixa
    for c in ["rápido", "volume", "baixo"]: F[c] = F[c] / F.n * 100
    comp = F.groupby("faixa")[["rápido", "volume", "baixo"]].mean()
    F["perfil"] = np.where(F["rápido"] >= 40, "≥ 40% rápidos", np.where(F["baixo"] >= 40, "≥ 40% baixos", "misto"))
    pf = pd.crosstab(F.perfil, F.faixa).reindex(columns=["Sobe", "Meio", "Cai"], fill_value=0)
    md += ["", "### 9.3 · O onze inteiro", "",
           f"Titulares de linha do tipo A (o tipo de quem sobe na posição): quem sobe tem em média **{m['Sobe']:.1f}**, o meio {m['Meio']:.1f}, quem cai **{m['Cai']:.1f}** (times com ≥ 8 titulares com físico).", "",
           "Composição do onze por família de tipo — **rápidos** (explosivo e rápido, mais intenso), **volume** (motor de volume, intermediário, médio em tudo), **baixos** (baixa intensidade, menos intenso):", "",
           "| Faixa | rápidos | volume | baixos |", "|---|---|---|---|"] + [f"| {k} | {f(r['rápido'])} | {f(r['volume'])} | {f(r['baixo'])} |" for k, r in comp.reindex(["Sobe", "Meio", "Cai"]).iterrows()] + \
          ["", "| Perfil do onze | Subiu | Meio | Caiu |", "|---|---|---|---|"] + [f"| {k} | {int(r.Sobe)} | {int(r.Meio)} | {int(r.Cai)} |" for k, r in pf.iterrows()] + [""]
    # pares
    res = []
    for a, b in itertools.combinations(POS, 2):
        t = tab([a, b], 6)
        for k, r in t.iterrows():
            if abs(r.dif) >= 20: res.append(dict(par=f"{a} + {b}", combo=k, n=int(r.n), pS=r.pS, pC=r.pC, dif=r.dif))
    R = pd.DataFrame(res).sort_values("dif", ascending=False)
    R.to_csv(os.path.join(OUT, "combinacoes.csv"), index=False)
    md += ["### 9.4 · Pares de posições em que uma combinação separa (≥ 6 times, diferença ≥ 20 pontos)", "",
           "| Par | Combinação | Subiu | Caiu | Sobe − Cai | n |", "|---|---|---|---|---|---|"]
    for r in R.itertuples(): md.append(f"| {r.par} | **{r.combo}** | {f(r.pS)} | {f(r.pC)} | {'+' if r.dif >= 0 else ''}{r.dif:.0f} | {r.n} |")
    md += ["", "**Leitura.**",
           "- **Lado:** com zagueiro **de volume**, o lateral é livre — explosivo, médio em tudo ou baixa intensidade sobem na mesma proporção (o motor de volume carrega o lado); só não pode ser *médio em tudo* à direita com motor de volume (0% de quem sobe × 19% de quem cai). Com zagueiro **lento (baixa intensidade)**, o lateral **tem de ser explosivo**: LD explosivo + ZD baixa 33% × 19%; LE explosivo + ZE baixa 27% × 16%; dois lentos no mesmo lado é a pior combinação da esquerda (7% × 26%). Com zagueiro explosivo a amostra é pequena (5 times).",
           "- **Volante:** *menos intenso* ao lado de zaga lenta é o retrato de quem cai (ZE baixa + VOL menos intenso: 16% × 53%); *mais intenso* com zaga lenta sobe (ZD baixa + VOL mais intenso 21% × 0%; com as duas baixas, 18% × 0%). Dois motores de volume + volante intermediário não sobe (0% × 30%). Regra: quanto mais lenta a zaga, mais intenso o volante.",
           "- **O onze:** quem sobe tem 39% de rápidos no onze contra 24% de quem cai; um onze com ≥ 40% de rápidos subiu 5 vezes e nunca caiu; e tem em média 3,5 titulares do tipo A contra 2,4. Não é 'onze de um tipo': é 4 rápidos + o resto de volume, e no máximo 3 baixos.",
           "- **O que não é óbvio:** a combinação mais forte de todo o onze é **ZE motor de volume + EE explosivo** (45% × 0%, 12 times) — o lado esquerdo 'um que corre atrás, um que arranca na frente'; junto vem **ZE motor de volume + MEI médio em tudo** (50% × 11%). O **extremo esquerdo motor de volume** é o vilão escondido: com volante intermediário (0% × 40%), com centroavante explosivo (0% × 33%), com extremo direito também de volume (0% × 27%) — um 9 explosivo com extremo lento do lado não sobe. **LD explosivo + CA explosivo** sobe (38% × 11%, 18 times). E uma surpresa: **ZD baixa intensidade + EE baixa intensidade** sobe (38% × 9%) e **ZD baixa + MED médio em tudo** também (40% × 17%) — o zagueiro direito lento funciona quando o time é técnico no meio e tem o motor à esquerda, o que fecha com o item 4 (no ZD o físico não separa).", ""]
    p = os.path.join(OUT, "B8.md"); s = open(p, encoding="utf-8").read()
    i = s.find("## 9 · Combina"); s = (s[:i] if i > 0 else s.rstrip() + "\n\n") + "\n".join(md) + "\n"
    open(p, "w", encoding="utf-8").write(s)
    print(len(R), "pares fortes")

if __name__ == "__main__":
    main()
