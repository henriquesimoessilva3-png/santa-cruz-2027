"""F2-8 — Trios: o meio (os três mais usados entre volante, médio e meia) e o ataque (os dois extremos mais usados + o
centroavante mais usado), pelo tipo físico de cada um, em cada clube-temporada 2022–2025. Duas leituras: a combinação
dos três tipos (sem ordem) e, mais robusta, QUANTOS do trio são do tipo A da sua posição (F2-4). Saída: resultados/b8/trios.csv
e item 8 do B8.md."""
import os, numpy as np, pandas as pd
from _comum import RAIZ
from b8_fisico_tecnico import base, tipos
OUT = os.path.join(RAIZ, "resultados", "b8")
f = lambda v: f"{100*v:.0f}%"

def trio_meio(x):
    return x[x.pos11.isin(["VOL", "MED", "MEI"])].sort_values("minutos", ascending=False).groupby(["ano", "clube"]).head(3)
def trio_ataque(x):
    e = x[x.pos11.isin(["ED", "EE"])].sort_values("minutos", ascending=False).groupby(["ano", "clube"]).head(2)
    c = x[x.pos11 == "CA"].sort_values("minutos", ascending=False).groupby(["ano", "clube"]).head(1)
    return pd.concat([e, c])

def main():
    d = base(); G, T = tipos(d); T = T[T.minutos >= 900]
    P = pd.read_csv(os.path.join(OUT, "tipos_preferidos_pos.csv")).set_index("pos11").preferidos.fillna("")
    T["A"] = [t in str(P.get(p, "")).split(" / ") for p, t in zip(T.pos11, T.tipo)]
    linhas = []
    md = ["## 8 · Trios: o meio (volante + médio + meia) e o ataque (dois extremos + centroavante)", "",
          "Cada clube-temporada (2022–2025) entra com os **três mais usados** (≥ 900 min): no meio, entre volante, médio e meia; no ataque, os dois extremos mais usados e o centroavante mais usado. "
          "Como os tipos têm nomes diferentes por setor, a leitura que vale é **quantos do trio são do tipo A da sua posição** (o tipo de quem sobe, F2-4: mais intenso/intermediário no volante, médio em tudo no médio, explosivo no extremo esquerdo, motor de volume no centroavante; meia e extremo direito não têm tipo A). "
          "Depois, as combinações mais comuns. Amostra: 13–19 trios por faixa — direção, não régua.", ""]
    for nome, fn, ntrio in [("Meio", trio_meio, 3), ("Ataque", trio_ataque, 3)]:
        x = fn(T)
        if nome == "Ataque":
            x = x.assign(rot=np.where(x.pos11 == "CA", "CA " + x.tipo, x.tipo))
            comb = lambda s: " + ".join(sorted(v for v in s if not v.startswith("CA "))) + " · " + " ".join(v for v in s if v.startswith("CA "))
        else:
            x = x.assign(rot=x.tipo); comb = lambda s: " + ".join(sorted(s))
        g = x.groupby(["ano", "clube"]).agg(n=("tipo", "size"), nA=("A", "sum"), tipos=("rot", comb), faixa=("faixa", "first"), jog=("jogador", lambda s: ", ".join(s))).reset_index()
        g = g[g.n == ntrio]
        # 1. quantos do trio são tipo A
        tab = pd.crosstab(g.nA, g.faixa).reindex(columns=["Sobe", "Meio", "Cai"], fill_value=0); pct = tab / tab.sum()
        md += [f"**{nome}** — {int(tab['Sobe'].sum())} trios nos times que subiram, {int(tab['Meio'].sum())} no meio, {int(tab['Cai'].sum())} nos que caíram", "",
               "| Do trio, quantos são do tipo A | Subiu | Meio | Caiu | Sobe − Cai |", "|---|---|---|---|---|"]
        for k, r in tab.iterrows():
            md.append(f"| **{int(k)} de 3** | {f(pct.loc[k,'Sobe'])} | {f(pct.loc[k,'Meio'])} | {f(pct.loc[k,'Cai'])} | {'+' if pct.loc[k,'Sobe']-pct.loc[k,'Cai'] >= 0 else ''}{100*(pct.loc[k,'Sobe']-pct.loc[k,'Cai']):.0f} |")
        mA = g.groupby("faixa").nA.mean().reindex(["Sobe", "Meio", "Cai"])
        md += ["", f"Média de jogadores do tipo A no trio: quem sobe **{mA['Sobe']:.1f}**, meio {mA['Meio']:.1f}, quem cai **{mA['Cai']:.1f}**.", ""]
        # 2. combinações
        tb = pd.crosstab(g.tipos, g.faixa).reindex(columns=["Sobe", "Meio", "Cai"], fill_value=0); pc = tb / tb.sum()
        tb["dif"] = pc["Sobe"] - pc["Cai"]; tb["n"] = tb[["Sobe", "Meio", "Cai"]].sum(1)
        tb = tb[(tb.n >= 3) | (tb.Sobe >= 2)].sort_values(["dif", "n"], ascending=False)
        md += ["| Combinação" + (" (extremos · CA)" if nome == "Ataque" else "") + " (só com ≥ 3 trios ou ≥ 2 em quem subiu) | Subiu | Meio | Caiu | Sobe − Cai | n |", "|---|---|---|---|---|---|"]
        for t, r in tb.iterrows():
            md.append(f"| **{t}** | {f(pc.loc[t,'Sobe'])} | {f(pc.loc[t,'Meio'])} | {f(pc.loc[t,'Cai'])} | {'+' if r.dif >= 0 else ''}{100*r.dif:.0f} | {int(r.n)} |")
            linhas.append(dict(grupo=nome, trio=t, sobe=int(r.Sobe), meio=int(r.Meio), cai=int(r.Cai), dif=round(r.dif, 3)))
        ex = g[g.faixa == "Sobe"].sort_values("ano")
        md += ["", "Quem subiu, trio a trio: " + "; ".join(f"{r.clube} {r.ano} — {r.tipos} ({r.jog}; {int(r.nA)} do tipo A)" for r in ex.itertuples()), ""]
    md += ["**Leitura.** No **meio**, quem sobe tem mais gente do tipo A no trio (média 1,7 contra 1,3; 3 de 3 em 22% × 6%), e o trio que mais aparece em quem sobe é *intermediário + médio em tudo + médio em tudo* — um volante de ritmo e dois médios completos; os trios de quem cai levam *menos intenso* ou dois *baixa intensidade*. "
           "No **ataque**, ter **zero** do tipo A é o retrato de quem cai (69% × 36%); o trio de quem sobe é *um extremo explosivo + um extremo que segura (baixa intensidade) + centroavante explosivo* (27% × 8%). O centroavante motor de volume (tipo A na conta individual) aparece menos nos trios que sobem do que o explosivo — vale rever o A do CA quando a amostra crescer. "
           "Regra para a montagem: no meio, pelo menos dois dos três no tipo de quem sobe; no ataque, um extremo explosivo é obrigatório e o 9 explosivo é o que mais sobe.", ""]
    pd.DataFrame(linhas).to_csv(os.path.join(OUT, "trios.csv"), index=False)
    p = os.path.join(OUT, "B8.md"); s = open(p, encoding="utf-8").read()
    i = s.find("## 8 · Trios")
    s = (s[:i] if i > 0 else s.rstrip() + "\n\n") + "\n".join(md) + "\n"
    open(p, "w", encoding="utf-8").write(s)
    print("\n".join(l for l in md if not l.startswith("Quem subiu")))

if __name__ == "__main__":
    main()
