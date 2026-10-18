"""Aprofundamento (18/10/2026): os outros indicadores do SkillCorner têm informação A MAIS que os seis da letra?
Roda em paralelo; não muda o app.

Três perguntas, nos titulares da Série B 2022–2025 (≥ 900 min, SkillCorner), z dentro do setor:
1. Cada indicador extra separa quem sobe de quem cai? (separação em desvios-padrão)
2. Separa ALÉM dos seis? — tira-se de cada extra a parte que os seis já explicam (regressão dentro do setor)
   e mede-se a separação do que sobra. Se o que sobra não separa, o indicador só repete.
3. Prever sobe × cai melhora com os extras? — regressão logística, um ano de fora por vez (treina em 3, testa no 4º),
   AUC médio: só os 6 · 6 + os 15 físicos · 6 + corridas sem bola (tipos) · tudo.

Saídas: resultados/b19/extras.csv, auc.csv, B19.md.
"""
import os, json, warnings
import numpy as np, pandas as pd
warnings.filterwarnings("ignore")
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
A = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(A); RES = os.path.join(R, "resultados"); OUT = os.path.join(RES, "b19"); os.makedirs(OUT, exist_ok=True)
SET = {"ZD": "Zaga", "ZE": "Zaga", "LD": "Lateral", "LE": "Lateral", "VOL": "Volante", "MED": "Meia", "MEI": "Meia", "ED": "Extremo", "EE": "Extremo", "CA": "Atacante"}
NOME = {"LD": "Lateral direito", "ZD": "Zagueiro pela direita", "ZE": "Zagueiro pela esquerda", "LE": "Lateral esquerdo", "VOL": "Volante",
        "MED": "Médio", "MEI": "Meia", "ED": "Extremo pela direita", "EE": "Extremo pela esquerda", "CA": "Centroavante"}
ORDEM = ["LD", "ZD", "ZE", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]
CORE = ["psv99", "sprint_count_p90", "hi_count_p90", "expl_accel_sprint_p90", "distance_p90", "runs_p30tip"]
FIS = {"m_per_min": "Metros por minuto", "hsr_count_p90": "Corridas HSR (20–25 km/h), contagem", "sprint_distance_p90": "Distância em sprint", "peak_velocity": "Velocidade de pico",
       "hi_distance_p90": "Distância em alta intensidade", "running_distance_p90": "Distância em corrida (15–20 km/h)", "psv99_top5": "PSV-99, média dos 5 melhores",
       "hsr_distance_p90": "Distância HSR", "expl_accel_hsr_p90": "Arrancadas explosivas até HSR", "cod_count_p90": "Mudanças de direção", "high_decel_p90": "Desacelerações fortes",
       "high_accel_p90": "Acelerações fortes", "medium_accel_p90": "Acelerações médias", "runs_penalty_area_p30tip": "Corridas para a área", "medium_decel_p90": "Desacelerações médias"}
RUNS = {"runs_above_hsr_p30tip": "Corridas sem bola acima de HSR", "runs_targeted_p30tip": "Corridas sem bola buscadas pelo passe", "runs_received_p30tip": "Corridas sem bola que receberam a bola",
        "runs_dangerous_p30tip": "Corridas perigosas", "runs_dangerous_targeted_p30tip": "Corridas perigosas buscadas", "runs_dangerous_received_p30tip": "Corridas perigosas recebidas",
        "runs_shot_within_10s_p30tip": "Corridas com finalização em 10 s", "runs_avg_distance": "Distância média da corrida sem bola"}
ROT = {"psv99": "PSV-99", "sprint_count_p90": "Sprints", "hi_count_p90": "Ações de alta intensidade", "expl_accel_sprint_p90": "Arrancadas explosivas", "distance_p90": "Distância", "runs_p30tip": "Corridas sem bola"}

J = pd.read_csv(os.path.join(RES, "b8", "jogadores_tipo.csv"))[["ano", "clube", "jogador", "pos11"]]
B = pd.read_csv(os.path.join(RES, "b1", "base_fisico.csv"))
B = B[["ano", "clube", "jogador"] + CORE + list(FIS) + list(RUNS)]
J = J.merge(B, on=["ano", "clube", "jogador"], how="left")
ti = pd.read_csv(os.path.join(RES, "b2", "time_indicadores.csv"))[["ano", "clube", "faixa"]]
J = J.merge(ti, on=["ano", "clube"], how="left"); J = J[J.pos11.isin(SET) & J.faixa.notna()].reset_index(drop=True); J["setor"] = J.pos11.map(SET)
TODOS = CORE + list(FIS) + list(RUNS)
Z = J[["setor"] + TODOS].copy()
for c in TODOS:
    g = Z.groupby("setor")[c]; Z[c] = (Z[c] - g.transform("mean")) / g.transform("std")
Z["faixa"] = J.faixa; Z["pos11"] = J.pos11; Z["ano"] = J.ano

def sep(df, col):
    s, c = df[df.faixa == "Sobe"][col].dropna(), df[df.faixa == "Cai"][col].dropna()
    if len(s) < 8 or len(c) < 8: return np.nan
    sd = df[col].std(); return (s.mean() - c.mean()) / sd if sd else np.nan

# o que sobra de cada extra depois dos seis (regressão linear dentro do setor)
def residuo(col):
    out = pd.Series(np.nan, index=Z.index)
    for s, g in Z.groupby("setor"):
        m = g[CORE + [col]].dropna()
        if len(m) < 40: continue
        X = np.c_[np.ones(len(m)), m[CORE].values]; b, *_ = np.linalg.lstsq(X, m[col].values, rcond=None)
        out.loc[m.index] = m[col].values - X @ b
    return out

rows = []
for col in list(FIS) + list(RUNS):
    r = residuo(col); Z[col + "_res"] = r
    corr6 = max(abs(Z[[col] + CORE].corr().loc[col, CORE])) if Z[col].notna().sum() > 50 else np.nan
    pior = Z[[col] + CORE].corr().loc[col, CORE].abs().idxmax() if pd.notna(corr6) else ""
    porpos = {p: sep(Z[Z.pos11 == p], col + "_res") for p in ORDEM}
    melhor = max(porpos, key=lambda p: abs(porpos[p]) if pd.notna(porpos[p]) else -1)
    rows.append({"indicador": (FIS | RUNS)[col], "grupo": "físico" if col in FIS else "corridas sem bola", "repete": ROT.get(pior, pior), "r_com_os_seis": round(corr6, 2),
                 "sep_bruta": round(sep(Z, col), 2), "sep_alem_dos_seis": round(sep(Z, col + "_res"), 2),
                 "melhor_posicao": NOME[melhor], "sep_alem_na_melhor": round(porpos[melhor], 2), **{p: round(porpos[p], 2) if pd.notna(porpos[p]) else np.nan for p in ORDEM}})
E = pd.DataFrame(rows).sort_values("sep_alem_dos_seis", key=lambda s: s.abs(), ascending=False); E.to_csv(os.path.join(OUT, "extras.csv"), index=False)
# referência: os seis, com a mesma régua
seis = pd.DataFrame([{"indicador": ROT[c], "sep_bruta": round(sep(Z, c), 2), **{p: round(sep(Z[Z.pos11 == p], c), 2) for p in ORDEM}} for c in CORE])
seis.to_csv(os.path.join(OUT, "seis.csv"), index=False)

# previsão sobe × cai: um ano de fora por vez
D = Z[Z.faixa.isin(["Sobe", "Cai"])].copy(); D["y"] = (D.faixa == "Sobe").astype(int)
def auc_lo(cols):
    aucs = []
    for ano in sorted(D.ano.unique()):
        tr, te = D[D.ano != ano], D[D.ano == ano]
        tr = tr.dropna(subset=cols); te = te.dropna(subset=cols)
        if te.y.nunique() < 2 or len(tr) < 50: continue
        m = LogisticRegression(C=0.5, max_iter=2000).fit(tr[cols].values, tr.y.values)
        aucs.append(roc_auc_score(te.y, m.predict_proba(te[cols].values)[:, 1]))
    return np.mean(aucs), len(aucs)
conj = [("Só os 6 da letra", CORE), ("6 + os 15 físicos", CORE + list(FIS)), ("6 + corridas sem bola (tipos)", CORE + list(RUNS)), ("Tudo (29)", TODOS),
        ("Só os 15 físicos (sem os 6)", list(FIS)), ("Explosão + volume (2 médias)", None)]
Z["exp"] = Z[CORE[:4]].mean(axis=1); Z["vol"] = Z[CORE[4:]].mean(axis=1); D["exp"] = Z.loc[D.index, "exp"]; D["vol"] = Z.loc[D.index, "vol"]
res = []
for nome, cols in conj:
    a, k = auc_lo(cols if cols else ["exp", "vol"]); res.append({"conjunto": nome, "auc_medio": round(a, 3), "anos_testados": k})
AUC = pd.DataFrame(res); AUC.to_csv(os.path.join(OUT, "auc.csv"), index=False)

f2 = lambda v: ("+" if v > 0 else "") + f"{v:.2f}".replace(".", ",") if pd.notna(v) else "—"
md = ["# Os outros indicadores do SkillCorner têm informação a mais?", "",
      "*18/10/2026 · titulares da Série B 2022–2025 (≥ 900 min), z dentro do setor · em paralelo, não muda as letras.*", "",
      "## Como ler", "",
      "- **Separação bruta**: diferença entre quem sobe e quem cai, em desvios-padrão (0,30 separa; 0,50 separa muito).",
      "- **Além dos seis**: a mesma separação, mas só no que sobra do indicador depois de tirar a parte que os seis da letra já explicam. É este número que diz se há informação nova.",
      "- **r com os seis**: a correlação com o mais parecido dos seis (quanto maior, mais repete).", "",
      "## Os seis da letra (referência)", "", "| Indicador | Separação bruta | " + " | ".join(NOME[p] for p in ORDEM) + " |", "|---|---|" + "---|" * len(ORDEM)]
for _, r in seis.iterrows():
    md.append(f"| {r.indicador} | **{f2(r.sep_bruta)}** | " + " | ".join(f2(r[p]) for p in ORDEM) + " |")
md += ["", "## Os extras: separa? e separa além dos seis?", "", "| Indicador | Grupo | Repete (r) | Separação bruta | **Além dos seis** | Onde mais sobra |", "|---|---|---|---|---|---|"]
for _, r in E.iterrows():
    md.append(f"| {r.indicador} | {r.grupo} | {r.repete} ({f2(r.r_com_os_seis).lstrip('+')}) | {f2(r.sep_bruta)} | **{f2(r.sep_alem_dos_seis)}** | {r.melhor_posicao} ({f2(r.sep_alem_na_melhor)}) |")
md += ["", "## Prever quem sobe × quem cai (regressão logística, um ano de fora por vez; AUC médio — 0,50 é moeda, 1,00 é acerto total)", "", "| Conjunto | AUC |", "|---|---|"]
for _, r in AUC.iterrows():
    md.append(f"| {r.conjunto} | **{str(r.auc_medio).replace('.', ',')}** |")
open(os.path.join(OUT, "B19.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
print(E[["indicador", "repete", "r_com_os_seis", "sep_bruta", "sep_alem_dos_seis", "melhor_posicao", "sep_alem_na_melhor"]].to_string(index=False)); print(); print(seis[["indicador", "sep_bruta"]].to_string(index=False)); print(); print(AUC.to_string(index=False))
