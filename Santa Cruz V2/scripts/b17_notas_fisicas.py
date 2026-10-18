"""Teste (18/10/2026): letra física por DUAS NOTAS (Explosão e Volume, 0-100) em vez do tipo mais próximo,
e peso do físico por posição. Roda em paralelo — não muda o app.

Explosão = média dos z de PSV-99, sprints, ações de alta intensidade e arrancadas; Volume = média dos z de distância e
corridas sem bola (só distância quando falta a corrida). z pela Série B do setor (mesma base das letras atuais).
Nota = percentil entre os titulares da Série B do setor (2022–2025, ≥ 900 min).
Letra: A+ = explosão ≥ 60 e volume ≥ 60 · A = explosão ≥ 60 · C = as duas < 40 · B = o resto.
Médio: A = volume ≥ 60 (como hoje). Meia: sem A+.
Peso: onde o A separa quem sobe (LD, LE, EE, VOL, MED) a letra conta; nas outras o físico é piso (só não pode ser C).
"""
import os, json
import numpy as np, pandas as pd
A = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(A); RES = os.path.join(R, "resultados"); OUT = os.path.join(RES, "b17")
C = json.load(open(os.path.join(RES, "b15", "centroides.json"), encoding="utf-8")); CORE = C["_core"]
SET = {"ZD": "Zaga", "ZE": "Zaga", "LD": "Lateral", "LE": "Lateral", "VOL": "Volante", "MED": "Meia", "MEI": "Meia", "ED": "Extremo", "EE": "Extremo", "CA": "Atacante"}
EXIGE = {"LD", "LE", "EE", "VOL", "MED"}

def zs(df):
    o = pd.DataFrame(index=df.index)
    for i, c in enumerate(CORE):
        o["z_" + c] = [(v - C[SET[p]]["media"][i]) / C[SET[p]]["desvio"][i] if pd.notna(v) else np.nan for v, p in zip(df[c], df.pos11)]
    Z = ["z_" + c for c in CORE]
    e = o[Z[:4]]; o["exp"] = e.mean(1).where(e.notna().sum(1) >= 3)
    o["vol"] = o[Z[4:]].mean(1).where(o[Z[4]].notna()); o["vol_d"] = o[Z[4]]
    return o

J = pd.read_csv(os.path.join(RES, "b8", "jogadores_tipo.csv"))
ti = pd.read_csv(os.path.join(RES, "b2", "time_indicadores.csv"))[["ano", "clube", "faixa"]]
J = J.merge(ti, on=["ano", "clube"], how="left"); J = J[J.pos11.isin(SET)].reset_index(drop=True)
J = pd.concat([J, zs(J)], axis=1); J["setor"] = J.pos11.map(SET)

def pct(ref, v):
    ref = ref.dropna().values
    return np.nan if pd.isna(v) or not len(ref) else 100 * (ref <= v).mean()

def notas(df, ref):
    ex, vo = [], []
    for _, r in df.iterrows():
        g = ref[ref.setor == SET[r.pos11]]
        ex.append(pct(g.exp, r.exp))
        vo.append(pct(g.vol, r.vol) if pd.notna(r["runs_p30tip"]) else pct(g.vol_d, r.vol_d))
    return np.array(ex), np.array(vo)

def letra(p, e, v):
    if np.isnan(e) or np.isnan(v): return "—"
    if p == "MED": return "A" if v >= 60 else "C" if (e < 40 and v < 40) else "B"
    if e >= 60: return "A" if p == "MEI" or v < 60 else "A+"
    return "C" if (e < 40 and v < 40) else "B"

# ---- validação: régua 2022–24, aplicada em 2025 ----
ref = J[J.ano <= 2024]; t = J[(J.ano == 2025) & J.faixa.notna()].copy()
t["ex"], t["vo"] = notas(t, ref)
t["v2"] = [letra(p, e, v) for p, e, v in zip(t.pos11, t.ex, t.vo)]
v1 = pd.read_csv(os.path.join(RES, "b16", "letras_titulares.csv")); t = t.merge(v1[["ano", "clube", "jogador", "pos11", "letra"]], on=["ano", "clube", "jogador", "pos11"], how="left")
def sep(df, col):
    s, c = df[df.faixa == "Sobe"], df[df.faixa == "Cai"]
    a = lambda x: x[col].isin(["A", "A+"]).mean(); cc = lambda x: (x[col] == "C").mean()
    return len(s), len(c), 100 * (a(s) - a(c)), 100 * (cc(s) - cc(c))
lin = []
for nome, msk in [("Todas", t.pos11.notna()), ("Onde o físico separa (LD, LE, EE, VOL, MED)", t.pos11.isin(EXIGE)), ("Outras (ZD, ZE, MEI, ED, CA)", ~t.pos11.isin(EXIGE))]:
    g = t[msk]
    for col, rot in [("letra", "atual"), ("v2", "nova")]:
        ns, nc, da, dc = sep(g, col); lin.append((nome, rot, ns, nc, da, dc))
V = pd.DataFrame(lin, columns=["grupo", "regra", "n_sobe", "n_cai", "A_mais_sobe_pts", "C_mais_sobe_pts"]); V.to_csv(os.path.join(OUT, "validacao_2025.csv"), index=False)
print(V.round(1).to_string(index=False))
# mudança de letra na base (2022-25), régua inteira
J["ex"], J["vo"] = notas(J, J); J["v2"] = [letra(p, e, v) for p, e, v in zip(J.pos11, J.ex, J.vo)]
J = J.merge(v1[["ano", "clube", "jogador", "pos11", "letra"]], on=["ano", "clube", "jogador", "pos11"], how="left")
print("titulares que mudam de letra:", int((J.letra != J.v2).sum()), "de", len(J))
print(pd.crosstab(J.letra, J.v2))
# ---- EQUIPE 2027 ----
E = pd.read_csv(os.path.join(OUT, "equipe_2027_fisico.csv"), sep=";").rename(columns={"pos": "pos11", "psv": "psv99", "spr": "sprint_count_p90", "hi": "hi_count_p90", "expl": "expl_accel_sprint_p90", "dist": "distance_p90", "obr": "runs_p30tip"})
E = pd.concat([E, zs(E)], axis=1); E["setor"] = E.pos11.map(SET)
E["ex"], E["vo"] = notas(E, J)
E["v2"] = [letra(p, e, v) for p, e, v in zip(E.pos11, E.ex, E.vo)]
E["peso"] = ["letra conta" if p in EXIGE else "piso (não pode ser C)" for p in E.pos11]
E["situacao"] = [("ok" if l in ("A", "A+") else "abaixo do pedido") if p in EXIGE else ("ok" if l != "C" else "abaixo do piso") for p, l in zip(E.pos11, E.v2)]
E[["pos11", "nome", "v1", "ex", "vo", "v2", "peso", "situacao"]].round(0).to_csv(os.path.join(OUT, "equipe_2027_comparacao.csv"), index=False)
print(E[["pos11", "nome", "v1", "ex", "vo", "v2", "situacao"]].round(0).to_string(index=False))
