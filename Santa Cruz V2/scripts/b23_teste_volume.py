"""b23 (18/10/2026) — TESTE: trocar 'corridas sem bola' (runs_p30tip, o SkillCorner só entrega na América do Sul) na letra por
um indicador que todo jogador com rastreio tem. Mesma regra do b16; o tipo é refeito pelo centróide mais próximo, com o 6º eixo
trocado (centróide do eixo novo = média dos jogadores daquele tipo). Mede: quantos mudam de letra e se a letra continua
separando quem sobe de quem cai (fatia de A+/A em quem sobe × em quem cai)."""
import os, json, numpy as np, pandas as pd
from b8_fisico_tecnico import base
AQ = os.path.dirname(os.path.abspath(__file__)); RES = os.path.join(os.path.dirname(AQ), "resultados")
C = json.load(open(os.path.join(RES, "b15", "centroides.json"), encoding="utf-8")); CORE = C["_core"]
PREF = pd.read_csv(os.path.join(os.path.dirname(AQ), "listas", "PREFERENCIAS_CLUBE.csv")).set_index("pos11")
SET = {"ZD": "Zaga", "ZE": "Zaga", "LD": "Lateral", "LE": "Lateral", "VOL": "Volante", "MED": "Meia", "MEI": "Meia", "ED": "Extremo", "EE": "Extremo", "CA": "Atacante"}
d = base(); ti = pd.read_csv(os.path.join(RES, "b2", "time_indicadores.csv"))[["ano", "clube", "faixa"]]
J = pd.read_csv(os.path.join(RES, "b8", "jogadores_tipo.csv")).merge(ti, on=["ano", "clube"], how="left")
J = J[J.faixa.notna() & J.pos11.isin(SET)].copy()
extra = d[["ano", "clube", "jogador", "hsr_distance_p90"]].drop_duplicates(["ano", "clube", "jogador"])
J = J.merge(extra, on=["ano", "clube", "jogador"], how="left")

def letra(pos, tipo, exp, vol):
    a, c = PREF.loc[pos, "tipo"], PREF.loc[pos, "cai"]; esv = tipo == c and exp > 0.25
    if pos == "MED": return "A" if vol > 0.5 else ("C" if tipo == c and not esv else "B")
    if tipo == a: return "A+" if pos != "MEI" and vol > 0.5 and exp > 0.5 else "A"
    return "C" if tipo == c and not esv else "B"

def roda(sexto):
    out = []
    for s in set(SET.values()):
        g = J[J.pos11.map(SET) == s].copy(); st = C[s]
        Z = pd.DataFrame({c: (g[c] - st["media"][i]) / st["desvio"][i] for i, c in enumerate(CORE)})
        if sexto == "hsr_distance_p90": Z["runs_p30tip"] = (g[sexto] - g[sexto].mean()) / g[sexto].std()
        cols = CORE if sexto != "so_distancia" else CORE[:5]
        cen = {t: np.array(v[:len(cols)]) for t, v in st["tipos"].items()}
        if sexto == "hsr_distance_p90":
            for t in cen: cen[t][5] = Z.loc[g.tipo == t, "runs_p30tip"].mean()
        for idx, r in Z.iterrows():
            v = r[cols].values.astype(float); ok = ~np.isnan(v)
            if ok.sum() < 4: continue
            tipo = min(cen, key=lambda t: np.sum((v[ok] - cen[t][ok]) ** 2))
            e = [x for x in v[:4] if not np.isnan(x)]; exp = np.mean(e) if len(e) >= 3 else np.nan
            vv = [x for x in v[4:] if not np.isnan(x)]; vol = np.mean(vv) if vv else np.nan
            out.append((idx, letra(g.loc[idx, "pos11"], tipo, exp, vol)))
    return pd.Series(dict(out))

J["L0"] = J.letra if "letra" in J else None
base_l = roda("runs_p30tip")
res = []
for nome, sexto in (("hoje (corridas sem bola)", "runs_p30tip"), ("distância HSR no lugar", "hsr_distance_p90"), ("só a distância (sem o 6º)", "so_distancia")):
    L = roda(sexto); g = J.loc[L.index].assign(L=L)
    boa = g.L.isin(["A+", "A"])
    sob, cai = boa[g.faixa == "Sobe"].mean(), boa[g.faixa == "Cai"].mean()
    res.append({"regra": nome, "mudam_de_letra": int((L != base_l.reindex(L.index)).sum()), "n": len(L), "A+/A em quem sobe": round(100 * sob), "A+/A em quem cai": round(100 * cai), "diferença (pontos)": round(100 * (sob - cai))})
print(pd.DataFrame(res).to_string(index=False))
