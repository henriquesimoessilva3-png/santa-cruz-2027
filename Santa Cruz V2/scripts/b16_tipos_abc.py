"""Tipos físicos A, B e C por posição — a regra do clube (06/10/2026) com os ajustes de 11/10, 15/10 e 16/10.

Substitui, no Estudo Série B V2, o antigo "Os tipos de quem sobe" (B15, 30/09), que ainda usava a leitura
"tipo de quem sobe por posição". Mesma regra das letras do app (static/app.js: tipoLetra, tipoMais,
explosivoSemVolume). Mostra, por posição, como os titulares de 2022–2025 (≥ 900 min) se distribuem nas letras
nos times que subiram, no meio e nos que caíram.
"""
import os, json
import numpy as np, pandas as pd
AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.dirname(AQUI); RES = os.path.join(RAIZ, "resultados")
OUT = os.path.join(RES, "b16"); os.makedirs(OUT, exist_ok=True)
C = json.load(open(os.path.join(RES, "b15", "centroides.json"), encoding="utf-8")); CORE = C["_core"]
PREF = pd.read_csv(os.path.join(RAIZ, "listas", "PREFERENCIAS_CLUBE.csv")).set_index("pos11")
SET = {"ZD": "Zaga", "ZE": "Zaga", "LD": "Lateral", "LE": "Lateral", "VOL": "Volante", "MED": "Meia", "MEI": "Meia", "ED": "Extremo", "EE": "Extremo", "CA": "Atacante"}
NOME = {"LD": "Lateral direito", "ZD": "Zagueiro pela direita", "ZE": "Zagueiro pela esquerda", "LE": "Lateral esquerdo", "VOL": "Volante",
        "MED": "Médio", "MEI": "Meia", "ED": "Extremo pela direita", "EE": "Extremo pela esquerda", "CA": "Centroavante"}
ORDEM = ["LD", "ZD", "ZE", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]

def eixos(r):
    s = C[SET[r.pos11]]; z = [(r[c] - s["media"][i]) / s["desvio"][i] if pd.notna(r[c]) else np.nan for i, c in enumerate(CORE)]
    e = [v for v in z[:4] if not np.isnan(v)]
    return (np.mean(e) if len(e) >= 3 else np.nan), (np.nanmean(z[4:]) if not np.isnan(z[4]) else np.nan)

def letra(r):
    a, c = PREF.loc[r.pos11, "tipo"], PREF.loc[r.pos11, "cai"]; exp, vol = eixos(r)
    esv = r.tipo == c and exp > 0.25
    if r.pos11 == "MED":
        return "A" if vol > 0.5 else ("C" if r.tipo == c and not esv else "B")
    if r.tipo == a:
        return "A+" if r.pos11 != "MEI" and vol > 0.5 and exp > 0.5 else "A"
    return "C" if r.tipo == c and not esv else "B"

J = pd.read_csv(os.path.join(RES, "b8", "jogadores_tipo.csv"))
ti = pd.read_csv(os.path.join(RES, "b2", "time_indicadores.csv"))[["ano", "clube", "faixa"]]
J = J.merge(ti, on=["ano", "clube"], how="left"); J = J[J.faixa.notna() & J.pos11.isin(SET)]
J["letra"] = J.apply(letra, axis=1)
J[["ano", "clube", "jogador", "pos11", "tipo", "letra", "faixa"]].to_csv(os.path.join(OUT, "letras_titulares.csv"), index=False)

B = {"Zaga": "Motor de volume", "Lateral": "Médio em tudo", "Volante": "Intermediário", "Meia": "Médio em tudo", "Extremo": "Motor de volume", "Atacante": "Motor de volume"}
pc = lambda v: f"{100*v:.0f}%"
md = ["# Tipos físicos A, B e C por posição", "",
      "*Regra do clube (Henrique, 06/10/2026), com os ajustes de 11/10, 15/10 e 16/10 · titulares da Série B 2022–2025 (≥ 900 min, SkillCorner) · revisão 17/10/2026.*", "",
      "## A regra", "",
      "O tipo físico sai de **seis indicadores do SkillCorner** — velocidade máxima (PSV-99), sprints, ações de alta intensidade, arrancadas (explosão) e distância e corridas sem bola (volume) —, comparados com os jogadores do mesmo setor na Série B. Cada jogador cai no tipo do setor de que está mais perto. A letra vem do tipo:", "",
      "- **A** = o tipo **mais forte fisicamente** do setor: **Explosivo e rápido** (no volante, **Mais intenso**).",
      "- **B** = o tipo **do meio**: Motor de volume (zaga, extremo, atacante), Médio em tudo (lateral, médio, meia), Intermediário (volante).",
      "- **C** = o tipo de **menor intensidade**: **Baixa intensidade** (no volante, **Menos intenso**).", "",
      "Vale para todas as posições, mesmo onde o dado de sobe × cai apontava outro tipo — baixa intensidade nunca é o tipo bom.", "",
      "**Ajustes depois da regra:**", "",
      "- **11/10 — A+ (azul):** o A que também tem **volume** (distância e corridas sem bola acima de **+0,5 desvio**) e explosão acima de +0,5 — o perfil completo. Vale em zaga, lateral, volante, extremo e atacante.",
      "- **11/10 — Médio (CM):** no médio, o **A é o motor de volume** (volume acima de +0,5 desvio): o médio que sobe é o de volume. **C** continua sendo a baixa intensidade; o resto é B. No meia (AM) não há A+.",
      "- **15/10 — explosivo, pouco volume:** quem cai no tipo C só pelo volume, mas tem **explosão acima de +0,25 desvio**, fica **B** (\"Explosivo, pouco volume\") — o C é de quem é fraco nas duas coisas.",
      "- **16/10 — físico colado:** quando um físico é colado à mão no app, ele substitui o do estudo e é dele que sai a letra, em todo o app.", "",
      "| Posição | A | B | C |", "|---|---|---|---|"]
for p in ORDEM:
    s = SET[p]
    a = "Motor de volume (volume > +0,5)" if p == "MED" else ("Mais intenso" if s == "Volante" else "Explosivo e rápido") + ("" if p == "MEI" else " · **A+** com volume")
    c = "Menos intenso" if s == "Volante" else "Baixa intensidade"
    md.append(f"| {NOME[p]} | {a} | {'o resto' if p == 'MED' else B[s]} · explosivo com pouco volume | {c} |")
md += ["", "## Como as letras aparecem em quem sobe e em quem cai", "",
       "De cada 100 titulares de cada faixa, quantos são de cada letra. **n** = titulares na faixa. O dado é descrição, não a regra: a regra é a do clube, acima.", ""]
for p in ORDEM:
    g = J[J.pos11 == p]
    md += [f"**{NOME[p]}**", "", "| Faixa | n | A+ | A | B | C |", "|---|---|---|---|---|---|"]
    for f, rot in [("Sobe", "Times que subiram"), ("Meio", "Meio da tabela"), ("Cai", "Times que caíram")]:
        x = g[g.faixa == f]; n = len(x)
        if not n: continue
        q = lambda L: pc((x.letra == L).mean())
        md.append(f"| {rot} | {n} | **{q('A+')}** | **{q('A')}** | {q('B')} | {q('C')} |")
    s, c = g[g.faixa == "Sobe"], g[g.faixa == "Cai"]
    if len(s) and len(c):
        da = ((s.letra.isin(["A", "A+"])).mean() - (c.letra.isin(["A", "A+"])).mean()) * 100
        dc = ((s.letra == "C").mean() - (c.letra == "C").mean()) * 100
        md.append(f"\nA ou A+: **{da:+.0f} pontos** em quem sobe · C: **{dc:+.0f} pontos**.\n")
md += ["", "Os nomes de cada letra, por posição e mercado, estão na aba **Tipo físico A e B** do app (com PDF) e na letra de cada card do campograma."]
open(os.path.join(OUT, "B16.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
print(J.groupby(["pos11", "faixa"]).letra.value_counts(normalize=True).unstack().round(2).head(12))
