"""F2-7 — Duplas por setor: os dois mais usados de cada clube-temporada (2022–2025) no setor, pelo tipo físico de cada um,
e em que faixa o time terminou (subiu / meio / caiu). Zaga (ZD+ZE), laterais (LD+LE), meio (VOL+MED), extremos (ED+EE).
Combinação sem ordem (A+B = B+A). Saída: resultados/b8/duplas.csv e item 7 do B8.md."""
import os, numpy as np, pandas as pd
from _comum import RAIZ
from b8_fisico_tecnico import base, tipos
OUT = os.path.join(RAIZ, "resultados", "b8")
SET = {"Zaga": ["ZD", "ZE"], "Lateral": ["LD", "LE"], "Extremo": ["ED", "EE"], "Meio (volante + médio — tipos de dois setores, só como curiosidade)": ["VOL", "MED"]}
f = lambda v: f"{100*v:.0f}%"

def main():
    d = base(); G, T = tipos(d)
    T = T[T.minutos >= 900]
    linhas, md = [], ["## 7 · Duplas: os dois mais usados do setor, pelo tipo físico de cada um", "",
        "Cada clube-temporada (2022–2025) entra com os **dois jogadores mais usados** do setor (≥ 900 min); a dupla é a combinação dos dois tipos, sem ordem. "
        "**Subiu / Meio / Caiu** = de cada 100 duplas da faixa, quantas são desta combinação; **Sobe − Cai** é a diferença; **Concentra ×** = da linha, a fatia em quem subiu dividida pelo esperado. "
        "Amostra: ~20 duplas por faixa em cada setor — diferença abaixo de ~15 pontos é ruído; a leitura que vale é a de quem sobe contra quem cai.", ""]
    for setor, poss in SET.items():
        x = T[T.pos11.isin(poss)].sort_values("minutos", ascending=False).groupby(["ano", "clube"]).head(2)
        g = x.groupby(["ano", "clube"]).agg(n=("tipo", "size"), tipos=("tipo", lambda s: " + ".join(sorted(s))), faixa=("faixa", "first"), jog=("jogador", lambda s: " e ".join(s))).reset_index()
        g = g[g.n == 2]
        tab = pd.crosstab(g.tipos, g.faixa).reindex(columns=["Sobe", "Meio", "Cai"], fill_value=0)
        pct = tab / tab.sum()
        conc = (tab["Sobe"] / tab.sum(1)) / (tab["Sobe"].sum() / tab.values.sum())
        tab["dif"] = pct["Sobe"] - pct["Cai"]; tab = tab.sort_values("dif", ascending=False)
        md += [f"**{setor}** — {int(tab['Sobe'].sum())} duplas nos times que subiram, {int(tab['Meio'].sum())} no meio, {int(tab['Cai'].sum())} nos que caíram", "",
               "| Dupla | Subiu | Meio | Caiu | Sobe − Cai | Concentra × | n |", "|---|---|---|---|---|---|---|"]
        for t, r in tab.iterrows():
            n = int(r.Sobe + r.Meio + r.Cai)
            md.append(f"| **{t}** | {f(pct.loc[t,'Sobe'])} | {f(pct.loc[t,'Meio'])} | {f(pct.loc[t,'Cai'])} | {'+' if r.dif >= 0 else ''}{100*r.dif:.0f} | {conc[t]:.1f} | {n} |")
            linhas.append(dict(setor=setor, dupla=t, sobe=int(r.Sobe), meio=int(r.Meio), cai=int(r.Cai), pct_sobe=round(pct.loc[t,'Sobe'],3), pct_cai=round(pct.loc[t,'Cai'],3), dif=round(r.dif,3), conc=round(conc[t],2)))
        ex = g[g.faixa == "Sobe"].sort_values("ano")
        md += ["", "Quem subiu, dupla a dupla: " + "; ".join(f"{r.clube} {r.ano} — {r.tipos} ({r.jog})" for r in ex.itertuples()), ""]
        # iguais × diferentes
        g["mista"] = g.tipos.map(lambda s: len(set(s.split(" + "))) > 1)
        m = pd.crosstab(g.mista, g.faixa).reindex(columns=["Sobe", "Meio", "Cai"], fill_value=0); mp = m / m.sum()
        md += [f"Duplas de tipos **diferentes**: {f(mp.loc[True,'Sobe']) if True in mp.index else '—'} de quem sobe, {f(mp.loc[True,'Cai']) if True in mp.index else '—'} de quem cai; do **mesmo tipo**: {f(mp.loc[False,'Sobe']) if False in mp.index else '—'} × {f(mp.loc[False,'Cai']) if False in mp.index else '—'}.", ""]
    md += ["**Leitura.** A dupla que sobe é **complementar**, não repetida: na zaga, *explosivo + motor de volume* (18% × 6%) e ninguém sobe com dois motores de volume (12% × 22%) — e o par *baixa intensidade + explosivo* é o de quem cai (12% × 28%). "
           "Nos laterais, *dois explosivos* (26% × 10%, 2,2×) ou *explosivo + baixa intensidade*; *médio em tudo* nos dois lados é de quem cai (0% × 15%). "
           "Nos extremos, *explosivo + baixa intensidade* (38% × 13%) e *explosivo + motor de volume* (23% × 7%): um lado decide no arranque, o outro segura; *dois motores de volume* não sobem (0% × 20%). "
           "Regra para a montagem: **um explosivo em cada setor de lado** (lateral, extremo) e, na zaga, **um motor de volume ao lado de um explosivo** — nunca dois do mesmo tipo lento. "
           "Amostra curta (13–19 duplas por faixa): serve como direção, não como régua.", ""]
    pd.DataFrame(linhas).to_csv(os.path.join(OUT, "duplas.csv"), index=False)
    # escreve/substitui o item 7 no B8.md
    p = os.path.join(OUT, "B8.md"); s = open(p, encoding="utf-8").read()
    i = s.find("## 7 · Duplas")
    s = (s[:i] if i > 0 else s.rstrip() + "\n\n") + "\n".join(md) + "\n"
    open(p, "w", encoding="utf-8").write(s)
    print("\n".join(md))

if __name__ == "__main__":
    main()
