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

def zs(r):
    s = C[SET[r.pos11]]; z = [(r[c] - s["media"][i]) / s["desvio"][i] if pd.notna(r[c]) else np.nan for i, c in enumerate(CORE)]
    z[5] = np.nan   # 18/10: corridas sem bola fora da letra (só existem na América do Sul) — 5 indicadores
    return z

def tipo5(r):
    """tipo pelo centróide mais próximo nos 5 indicadores (sem as corridas sem bola)"""
    z = np.array(zs(r)[:5], dtype=float); ok = ~np.isnan(z)
    if ok.sum() < 3: return r.tipo
    cen = C[SET[r.pos11]]["tipos"]
    return min(cen, key=lambda t: float(np.sum((np.array(cen[t][:5])[ok] - z[ok]) ** 2)))

def eixos(r):
    z = zs(r); e = [v for v in z[:4] if not np.isnan(v)]
    return (np.mean(e) if len(e) >= 3 else np.nan), (z[4] if not np.isnan(z[4]) else np.nan)

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
J["tipo"] = J.apply(tipo5, axis=1)
J["letra"] = J.apply(letra, axis=1)
J[["ano", "clube", "jogador", "pos11", "tipo", "letra", "faixa"]].to_csv(os.path.join(OUT, "letras_titulares.csv"), index=False)

B = {"Zaga": "Motor de volume", "Lateral": "Médio em tudo", "Volante": "Intermediário", "Meia": "Médio em tudo", "Extremo": "Motor de volume", "Atacante": "Motor de volume"}
pc = lambda v: f"{100*v:.0f}%"
md = ["# Tipos físicos A, B e C por posição", "",
      "*Regra do clube (Henrique, 06/10/2026), com os ajustes de 11/10, 15/10 e 16/10 · titulares da Série B 2022–2025 (≥ 900 min, SkillCorner) · revisão 17/10/2026.*", "",
      "## A regra", "",
      "O tipo físico sai de **cinco indicadores do SkillCorner** — velocidade máxima (PSV-99), sprints, ações de alta intensidade, arrancadas (explosão) e distância (volume; as corridas sem bola saíram em 18/10, porque só existem na América do Sul) —, comparados com os jogadores do mesmo setor na Série B. Cada jogador cai no tipo do setor de que está mais perto. A letra vem do tipo:", "",
      "- **A** = o tipo **mais forte fisicamente** do setor: **Explosivo e rápido** (no volante, **Mais intenso**).",
      "- **B** = o tipo **do meio**: Motor de volume (zaga, extremo, atacante), Médio em tudo (lateral, médio, meia), Intermediário (volante).",
      "- **C** = o tipo de **menor intensidade**: **Baixa intensidade** (no volante, **Menos intenso**).", "",
      "Vale para todas as posições, mesmo onde o dado de sobe × cai apontava outro tipo — baixa intensidade nunca é o tipo bom.", "",
      "**Ajustes depois da regra:**", "",
      "- **11/10 — A+ (azul):** o A que também tem **volume** (distância acima de **+0,5 desvio**) e explosão acima de +0,5 — o perfil completo. Vale em zaga, lateral, volante, extremo e atacante.",
      "- **11/10 — Médio (CM):** no médio, o **A é o motor de volume** (volume acima de +0,5 desvio): o médio que sobe é o de volume. **C** continua sendo a baixa intensidade; o resto é B. No meia (AM) não há A+.",
      "- **15/10 — explosivo, pouco volume:** quem cai no tipo C só pelo volume, mas tem **explosão acima de +0,25 desvio**, fica **B** (\"Explosivo, pouco volume\") — o C é de quem é fraco nas duas coisas.",
      "- **16/10 — físico colado:** quando um físico é colado à mão no app, ele substitui o do estudo e é dele que sai a letra, em todo o app.", ""]
# 18/10: a tabela "Posição | A | B | C" saiu — o que é cada letra agora vem na própria tabela de cada posição, abaixo
def desc(p, L):
    s_ = SET[p]
    if L == "A+": return "A com volume (explosão e volume acima de +0,5)"
    if L == "A": return "Motor de volume (volume acima de +0,5)" if p == "MED" else ("Mais intenso" if s_ == "Volante" else "Explosivo e rápido")
    if L == "B": return ("o resto" if p == "MED" else B[s_]) + " ou explosivo com pouco volume"
    return "Menos intenso" if s_ == "Volante" else "Baixa intensidade"
LISTAS = {}
def cel(p, L, f, n, pct):
    k = f"{p}~{L}~{f}"
    return f'<span class="b16c" data-k="{k}" title="clique para ver quem são"><b>{n}</b> ({pct})</span>' if n else f"**0** ({pct})"
md += ["", "## Quantos de cada letra estão em quem sobe, no meio e em quem cai", "",
       "Titulares de 2022–2025 (≥ 900 min). **Clique em qualquer número para ver quem são os jogadores.** Em cada letra: **quantos** jogadores no total e **quantos** deles estavam em times que subiram, no meio e em times que caíram. "
       "Como há menos titulares de quem sobe do que do meio, o número cru engana — por isso a última coluna **pondera**: "
       "**concentração em quem sobe** = a fatia da letra que está em quem sobe, dividida pela fatia de todos os titulares que está em quem sobe. "
       "**1,0** = a letra aparece em quem sobe na proporção normal · **1,5** = 50% mais do que o esperado · **0,5** = metade do esperado.", ""]
for p in ORDEM:
    g = J[J.pos11 == p]; N = len(g)
    ns = {f: int((g.faixa == f).sum()) for f in ["Sobe", "Meio", "Cai"]}
    md += [f"**{NOME[p]}** — {N} titulares: **{ns['Sobe']}** em quem subiu · **{ns['Meio']}** no meio · **{ns['Cai']}** em quem caiu", "",
           "| Letra | Total | Em quem subiu | No meio | Em quem caiu | Concentração em quem sobe |", "|---|---|---|---|---|---|"]
    base_s = ns["Sobe"] / N if N else 0
    for L in ["A+", "A", "B", "C"]:
        x = g[g.letra == L]; t = len(x)
        if not t: continue
        c = {f: int((x.faixa == f).sum()) for f in ["Sobe", "Meio", "Cai"]}
        conc = (c["Sobe"] / t) / base_s if base_s else float("nan")
        cs = f"**{conc:.1f}**".replace(".", ",")
        for f in ["Todos", "Sobe", "Meio", "Cai"]:
            y = x if f == "Todos" else x[x.faixa == f]
            LISTAS[f"{p}~{L}~{f}"] = [[r.jogador, r.clube, int(r.ano), {"Sobe": "subiu", "Meio": "meio", "Cai": "caiu"}.get(r.faixa, r.faixa), r.tipo] for r in y.sort_values(["ano", "clube"], ascending=[False, True]).itertuples()]
        pp = {f: f"{100*c[f]/t:.0f}%" for f in c}
        md.append(f"| **{L}** — {desc(p, L)} | " + cel(p, L, "Todos", t, f"{100*t/N:.0f}%") + " | " + cel(p, L, "Sobe", c["Sobe"], pp["Sobe"]) + " | " + cel(p, L, "Meio", c["Meio"], pp["Meio"]) + " | " + cel(p, L, "Cai", c["Cai"], pp["Cai"]) + f" | {cs} |")
    md.append("")
md += ["", "Os nomes de cada letra, por posição e mercado, estão na aba **Tipo físico A e B** do app (com PDF) e na letra de cada card do campograma."]
open(os.path.join(OUT, "B16.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
# as listas por célula, para o clique na tela (static/b16_listas.js)
with open(os.path.join(os.path.dirname(RAIZ), "static", "b16_listas.js"), "w", encoding="utf-8") as fh:
    fh.write("/* GERADO POR Santa Cruz V2/scripts/b16_tipos_abc.py - NAO EDITE A MAO. Quem são os titulares de cada letra (Estudo › Físico). */\n")
    fh.write("window.B16_LISTAS = " + json.dumps(LISTAS, ensure_ascii=False, separators=(",", ":")) + ";\n")
print(J.groupby(["pos11", "faixa"]).letra.value_counts(normalize=True).unstack().round(2).head(12))
