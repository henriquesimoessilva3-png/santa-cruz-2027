"""Teste (18/10/2026): um TERCEIRO EIXO físico — "frear e mudar de direção" — além de explosão e volume.
Roda em paralelo; não muda o app nem as letras.

Pergunta: as desacelerações fortes e as mudanças de direção (os dois indicadores do SkillCorner que menos
se parecem com os seis da letra) separam o titular de quem sobe do de quem cai? E separam ALÉM da explosão,
ou só repetem?

Definições (SkillCorner, via glossário Wyscout e artigos SkillCorner):
- Desaceleração forte (high_decel): freada com pico abaixo de −3 m/s², durando 1 s ou mais. Por 90 min.
- Aceleração forte (high_accel): arrancada com pico acima de +3 m/s², 1 s ou mais. Por 90 min.
- Mudança de direção (cod_count): contagem de mudanças de direção intensas, de qualquer tipo de corrida —
  SkillCorner apresenta como medida de agilidade e mobilidade sustentável. Por 90 min.
Eixo FREIO = média dos z de high_decel e cod_count (z pela Série B do setor, mesma régua das letras).

Saídas em resultados/b18/: separacao_eixos.csv (sobe × cai por posição, três eixos), validacao_2025.csv
(régua 2022–24 aplicada em 2025: quem está no topo de cada eixo, em quem sobe × quem cai) e B18.md.
"""
import os, json
import numpy as np, pandas as pd
A = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(A); RES = os.path.join(R, "resultados"); OUT = os.path.join(RES, "b18"); os.makedirs(OUT, exist_ok=True)
C = json.load(open(os.path.join(RES, "b15", "centroides.json"), encoding="utf-8")); CORE = C["_core"]
SET = {"ZD": "Zaga", "ZE": "Zaga", "LD": "Lateral", "LE": "Lateral", "VOL": "Volante", "MED": "Meia", "MEI": "Meia", "ED": "Extremo", "EE": "Extremo", "CA": "Atacante"}
NOME = {"LD": "Lateral direito", "ZD": "Zagueiro pela direita", "ZE": "Zagueiro pela esquerda", "LE": "Lateral esquerdo", "VOL": "Volante",
        "MED": "Médio", "MEI": "Meia", "ED": "Extremo pela direita", "EE": "Extremo pela esquerda", "CA": "Centroavante"}
ORDEM = ["LD", "ZD", "ZE", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]
FREIO = ["high_decel_p90", "cod_count_p90"]

# base do estudo (titulares com tipo) + os indicadores de freio, que ficaram fora do jogadores_tipo.csv
J = pd.read_csv(os.path.join(RES, "b8", "jogadores_tipo.csv"))
B = pd.read_csv(os.path.join(RES, "b1", "base_fisico.csv"))[["ano", "clube", "jogador", "high_decel_p90", "high_accel_p90", "cod_count_p90"]]
J = J.merge(B, on=["ano", "clube", "jogador"], how="left")
ti = pd.read_csv(os.path.join(RES, "b2", "time_indicadores.csv"))[["ano", "clube", "faixa"]]
J = J.merge(ti, on=["ano", "clube"], how="left"); J = J[J.pos11.isin(SET)].reset_index(drop=True); J["setor"] = J.pos11.map(SET)

# z pela Série B do setor: os seis pelo centróide (mesma régua das letras); os de freio pela própria base (média e desvio do setor, 2022–25)
for i, c in enumerate(CORE):
    J["z_" + c] = [(v - C[SET[p]]["media"][i]) / C[SET[p]]["desvio"][i] if pd.notna(v) else np.nan for v, p in zip(J[c], J.pos11)]
for c in FREIO + ["high_accel_p90"]:
    g = J.groupby("setor")[c]
    J["z_" + c] = (J[c] - g.transform("mean")) / g.transform("std")
Z = ["z_" + c for c in CORE]
J["exp"] = J[Z[:4]].mean(1).where(J[Z[:4]].notna().sum(1) >= 3)
J["vol"] = J[Z[4:]].mean(1).where(J[Z[4]].notna())
J["freio"] = J[["z_" + c for c in FREIO]].mean(1).where(J[["z_" + c for c in FREIO]].notna().sum(1) == 2)
# freio "limpo": o que sobra depois de tirar a parte que a explosão explica (regressão dentro do setor)
J["freio_res"] = np.nan
for s, g in J.groupby("setor"):
    m = g[["exp", "freio"]].dropna()
    if len(m) < 30: continue
    b = np.polyfit(m.exp, m.freio, 1)
    J.loc[m.index, "freio_res"] = m.freio - (b[0] * m.exp + b[1])

T = J[J.faixa.notna()].copy()
def d(df, col):
    s, c = df[df.faixa == "Sobe"][col].dropna(), df[df.faixa == "Cai"][col].dropna()
    if len(s) < 8 or len(c) < 8: return np.nan, len(s), len(c)
    sd = df[col].std()
    return (s.mean() - c.mean()) / sd if sd else np.nan, len(s), len(c)
rows = []
for p in ORDEM:
    g = T[T.pos11 == p]; r = {"pos": p, "posicao": NOME[p]}
    for col, nm in [("exp", "explosao"), ("vol", "volume"), ("freio", "freio"), ("freio_res", "freio_alem_da_explosao"), ("z_high_decel_p90", "desacel_forte"), ("z_cod_count_p90", "mud_direcao"), ("z_high_accel_p90", "acel_forte")]:
        v, ns, nc = d(g, col); r[nm] = round(v, 2) if pd.notna(v) else np.nan
    r["n_sobe"], r["n_cai"] = ns, nc
    rows.append(r)
S = pd.DataFrame(rows); S.to_csv(os.path.join(OUT, "separacao_eixos.csv"), index=False)

# correlação entre os eixos (titulares, dentro do setor já pelo z)
corr = T[["exp", "vol", "freio"]].corr(method="spearman").round(2)

# validação como no b17: régua 2022–24, aplicada em 2025 — quem está no topo (nota ≥ 60) de cada eixo, em quem sobe × quem cai
ref = T[T.ano <= 2024]; t = T[T.ano == 2025].copy()
def pct(refv, v):
    refv = refv.dropna().values
    return np.nan if pd.isna(v) or not len(refv) else 100 * (refv <= v).mean()
for col in ["exp", "vol", "freio"]:
    t["n_" + col] = [pct(ref[ref.setor == s][col], v) for s, v in zip(t.setor, t[col])]
val = []
for col, nm in [("n_exp", "Explosão ≥ 60"), ("n_vol", "Volume ≥ 60"), ("n_freio", "Freio ≥ 60")]:
    for nome, msk in [("Todas", t.pos11.notna()), ("LD, LE, EE, VOL, MED", t.pos11.isin({"LD", "LE", "EE", "VOL", "MED"})), ("ZD, ZE, MEI, ED, CA", ~t.pos11.isin({"LD", "LE", "EE", "VOL", "MED"}))]:
        x = t[msk]; s, c = x[x.faixa == "Sobe"], x[x.faixa == "Cai"]
        val.append({"eixo": nm, "posicoes": nome, "n_sobe": len(s), "n_cai": len(c), "pct_sobe": round(100 * (s[col] >= 60).mean(), 1), "pct_cai": round(100 * (c[col] >= 60).mean(), 1), "pontos": round(100 * ((s[col] >= 60).mean() - (c[col] >= 60).mean()), 1)})
V = pd.DataFrame(val); V.to_csv(os.path.join(OUT, "validacao_2025.csv"), index=False)

f2 = lambda v: ("+" if v > 0 else "") + f"{v:.2f}".replace(".", ",") if pd.notna(v) else "—"
md = ["# Teste: um terceiro eixo físico — frear e mudar de direção", "",
      "*18/10/2026 · em paralelo, não muda as letras · titulares da Série B 2022–2025 (≥ 900 min, SkillCorner).*", "",
      "## O que são os indicadores", "",
      "- **Desaceleração forte** (`high_decel`): freada com pico abaixo de **−3 m/s²**, de 1 s ou mais, por 90 min. Mede a capacidade de **parar** — o que acontece antes de uma mudança de direção, de um bote ou de uma recuperação defensiva.",
      "- **Mudança de direção** (`cod_count`): contagem de mudanças de direção **intensas**, em qualquer tipo de corrida, por 90 min. O SkillCorner apresenta como medida de **agilidade e mobilidade**, para achar jogador que cria separação em espaço curto (extremos de 1 × 1, marcadores que acompanham).",
      "- Aceleração forte (`high_accel`, pico acima de +3 m/s²) entra só como controle: ela anda com a explosão (r = 0,68).", "",
      "**Freio** = média dos desvios (contra a Série B do setor) de desaceleração forte e mudança de direção. Os dois se parecem com a explosão (r ≈ 0,7 com as ações de alta intensidade), por isso o teste olha também o **freio além da explosão** — o que sobra do freio depois de tirar a parte que a explosão já explica.", "",
      "## Correlação entre os eixos (titulares)", "", "| | Explosão | Volume | Freio |", "|---|---|---|---|"]
for a in ["exp", "vol", "freio"]:
    md.append("| " + {"exp": "Explosão", "vol": "Volume", "freio": "Freio"}[a] + " | " + " | ".join(f"{corr.loc[a, b]:.2f}".replace(".", ",") for b in ["exp", "vol", "freio"]) + " |")
md += ["", "## Separação sobe × cai por posição (desvios-padrão; 0,30 separa, 0,50 separa muito)", "",
       "| Posição | Explosão | Volume | **Freio** | Freio além da explosão | Desacel. forte | Mud. direção | n sobe / cai |", "|---|---|---|---|---|---|---|---|"]
for _, r in S.iterrows():
    md.append(f"| {r.posicao} | {f2(r.explosao)} | {f2(r.volume)} | **{f2(r.freio)}** | {f2(r.freio_alem_da_explosao)} | {f2(r.desacel_forte)} | {f2(r.mud_direcao)} | {r.n_sobe} / {r.n_cai} |")
md += ["", "## Validação (régua 2022–24 aplicada em 2025): quem está no topo de cada eixo (nota ≥ 60)", "",
       "| Eixo | Posições | % em quem sobe | % em quem cai | Diferença (pontos) |", "|---|---|---|---|---|"]
for _, r in V.iterrows():
    md.append(f"| {r.eixo} | {r.posicoes} | **{r.pct_sobe:.0f}%** (n={r.n_sobe}) | **{r.pct_cai:.0f}%** (n={r.n_cai}) | **{r.pontos:+.0f}** |")
open(os.path.join(OUT, "B18.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
print(S.to_string(index=False)); print(); print(corr); print(); print(V.to_string(index=False))
