"""Bloco 1, pergunta 1 e 2 — físico do TIME contra rendimento, a dinheiro igual; e a forma do elenco.

Unidade: clube-temporada, 2022-2025 fechadas (2026 como teste à parte).
Físico do time = média dos jogadores ponderada pelos minutos rastreados.
Rendimento = pontos por jogo acima do esperado pelo valor do elenco (ver _comum.clube_temporada).
Teste: correlação parcial (metric ~ rendimento) por posto dentro da temporada; IC por bootstrap de CLUBE.
Escreve resultados/b1/time_fisico.csv, time_testes.csv, forma_elenco.csv, forma_testes.csv
"""
import os, json
import numpy as np, pandas as pd
from _comum import *

MET = {  # id: (coluna, nome em português, unidade)
 "dist": ("distance_p90", "Distância por 90", "m"),
 "hsr": ("hsr_distance_p90", "Alta velocidade por 90", "m"),
 "spr_d": ("sprint_distance_p90", "Sprint por 90", "m"),
 "spr_n": ("sprint_count_p90", "Sprints por 90", "n"),
 "hi_n": ("hi_count_p90", "Ações de alta intensidade por 90", "n"),
 "acc": ("high_accel_p90", "Acelerações fortes por 90", "n"),
 "expl": ("expl_accel_sprint_p90", "Arrancadas explosivas por 90", "n"),
 "psv": ("psv99", "Velocidade de pico (PSV-99)", "km/h"),
 "spr_otip": ("sprint_distance_p30otip", "Sprint por 30 min SEM a bola", "m"),
 "spr_tip": ("sprint_distance_p30tip", "Sprint por 30 min COM a bola", "m"),
 "hsr_otip": ("hsr_distance_p30otip", "Alta velocidade por 30 min SEM a bola", "m"),
 "hsr_tip": ("hsr_distance_p30tip", "Alta velocidade por 30 min COM a bola", "m"),
 "runs": ("runs_p30tip", "Corridas sem bola por 30 min com posse", "n"),
 "runs_area": ("runs_penalty_area_p30tip", "Corridas para a área por 30 min com posse", "n"),
 "runs_per": ("runs_dangerous_p30tip", "Corridas perigosas por 30 min com posse", "n"),
}

def boot_corr(x, y, clubes, n=4000, seed=1):
    rng = np.random.default_rng(seed); uc = np.unique(clubes); r = []
    for _ in range(n):
        s = rng.choice(uc, len(uc)); idx = np.concatenate([np.where(clubes == c)[0] for c in s])
        if np.std(x[idx]) == 0 or np.std(y[idx]) == 0: continue
        r.append(np.corrcoef(x[idx], y[idx])[0, 1])
    r = np.array(r); return np.percentile(r, [2.5, 97.5]), (r <= 0).mean() if np.corrcoef(x, y)[0, 1] > 0 else (r >= 0).mean()

def testes(df, cols, alvo, out):
    linhas = []
    for k, col in cols:
        d = df.dropna(subset=[col, alvo])
        # posto dentro da temporada, 0-1
        x = d.groupby("ano")[col].rank(pct=True).values; y = d[alvo].values
        r = np.corrcoef(x, y)[0, 1]; ic, p = boot_corr(x, y, d["clube"].values)
        # efeito em unidade de jogo: rendimento do quartil de cima menos o de baixo
        q = pd.qcut(x, 4, labels=False); efeito = y[q == 3].mean() - y[q == 0].mean()
        linhas.append(dict(id=k, indicador=col, nome=MET.get(k, (col, col, ""))[1], n=len(d), r=round(r, 3),
                           ic_baixo=round(ic[0], 3), ic_alto=round(ic[1], 3), p_boot=round(p, 4),
                           top_menos_fundo_ppj=round(efeito, 3), top_menos_fundo_pts38=round(efeito * 38, 1)))
    t = pd.DataFrame(linhas).sort_values("r", key=abs, ascending=False)
    t.to_csv(out, index=False); return t

def main():
    out = os.path.join(RES, "b1")
    b = pd.read_csv(os.path.join(out, "base_fisico.csv"))
    ct = clube_temporada()
    linha = b[b.setor != "Goleiro"].copy()
    w = linha["minutos_sc"]
    ag = {}
    for k, (col, _, _) in MET.items():
        ag[k] = linha.groupby(["ano", "clube"]).apply(lambda g: np.average(g[col].dropna(), weights=g.loc[g[col].notna(), "minutos_sc"]) if g[col].notna().any() else np.nan)
    tf = pd.DataFrame(ag).reset_index()
    cob = linha.groupby(["ano", "clube"])["minutos_sc"].sum().rename("min_rastreados").reset_index()
    tf = tf.merge(cob, on=["ano", "clube"]).merge(ct, on=["ano", "clube"])
    tf["cobertura"] = tf["min_rastreados"] / (tf["jogos"] * 90 * 10)
    tf.to_csv(os.path.join(out, "time_fisico.csv"), index=False)
    fech = tf[tf.ano <= 2025]
    cols = [(k, k) for k in MET]
    t1 = testes(fech, cols, "rendimento", os.path.join(out, "time_testes.csv"))
    t1b = testes(fech[fech.cobertura >= 0.75], cols, "rendimento", os.path.join(out, "time_testes_cobertura75.csv"))
    t1c = testes(fech, cols, "ppj", os.path.join(out, "time_testes_ppj_bruto.csv"))
    print("=== físico do time × rendimento (a dinheiro igual), 80 clube-temporadas"); print(t1.to_string(index=False))
    print("=== só cobertura >= 75%, n =", len(fech[fech.cobertura >= 0.75])); print(t1b[["id", "r", "ic_baixo", "ic_alto", "top_menos_fundo_pts38"]].to_string(index=False))
    print("=== contra pontos brutos (sem descontar dinheiro)"); print(t1c[["id", "r", "ic_baixo", "ic_alto", "top_menos_fundo_pts38"]].to_string(index=False))

    # ---- forma do elenco: os 11 de linha mais rastreados (10 jogadores de linha + goleiro fora => 10)
    rows = []
    for (ano, clube), g in linha.groupby(["ano", "clube"]):
        g = g.sort_values("minutos_sc", ascending=False).head(10)
        if len(g) < 10: continue
        r = dict(ano=ano, clube=clube)
        for k in ("dist", "hsr", "spr_d", "psv"):
            col = MET[k][0]
            pct = linha[linha.ano == ano].groupby("setor")[col].rank(pct=True)  # posto dentro de ano × setor
            v = pct.loc[g.index]
            r[f"{k}_media"] = v.mean(); r[f"{k}_max"] = v.max(); r[f"{k}_min"] = v.min()
            r[f"{k}_sd"] = v.std(); r[f"{k}_amplitude"] = v.max() - v.min()
        rows.append(r)
    fe = pd.DataFrame(rows).merge(ct, on=["ano", "clube"])
    fe.to_csv(os.path.join(out, "forma_elenco.csv"), index=False)
    fcols = [(c, c) for c in fe.columns if any(c.endswith(s) for s in ("_media", "_max", "_min", "_sd", "_amplitude"))]
    t2 = testes(fe[fe.ano <= 2025], fcols, "rendimento", os.path.join(out, "forma_testes.csv"))
    print("=== forma do elenco (10 de linha mais rastreados) × rendimento"); print(t2[["id", "n", "r", "ic_baixo", "ic_alto", "top_menos_fundo_pts38"]].to_string(index=False))
    # teste em 2026
    t26 = tf[tf.ano == 2026]
    print("=== 2026 (em curso), correlação bruta com rendimento:", {k: round(np.corrcoef(t26[k].rank(), t26["rendimento"])[0, 1], 2) for k in ("dist", "hsr", "spr_otip", "runs_area")})

if __name__ == "__main__":
    main()
