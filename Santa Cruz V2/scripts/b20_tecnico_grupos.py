"""Estudo (18/10/2026): os indicadores TÉCNICOS por posição, em quatro grupos — os mesmos do ranking do Botafogo
(glossário do Portal Ranking): DEFENSIVO · PASSE · OFENSIVO · PARTICIPAÇÃO EM GOLS (o "DGP" do ranking).
Só técnico: o físico já está na letra. Em paralelo; não muda o app.

Perguntas, nos titulares da Série B 2022–2025 (≥ 900 min, Wyscout), por posição:
1. Quanto cada indicador separa quem sobe de quem cai (z dentro do ano, em desvios-padrão), e em que grupo está.
2. Quanto cada GRUPO separa — a ordem dos grupos é o peso que a posição pede (o dado), para confrontar com a intuição
   (volante: defesa > passe > ofensivo, participação em gols não conta) e com os pesos do ranking do Botafogo.
3. A seta: hoje são os 3 mais fortes de cada bloco (F). Alternativas testadas com um ano de fora por vez (AUC):
   F (como está, só técnico) · todos os P (separação ≥ 0,30) · os 8 mais fortes sem bloco · nota ponderada por grupo
   (média dos z de cada grupo, pesada pela separação do grupo na posição).

Saídas: resultados/b20/indicadores.csv, grupos.csv, auc.csv, B20.md.
"""
import os, sys, warnings
import numpy as np, pandas as pd
warnings.filterwarnings("ignore")
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
A = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(A); RES = os.path.join(R, "resultados"); OUT = os.path.join(RES, "b20"); os.makedirs(OUT, exist_ok=True)
sys.path.insert(0, A)
from _comum import tecnico
from listas import pos11
NOME = {"LD": "Lateral direito", "ZD": "Zagueiro pela direita", "ZE": "Zagueiro pela esquerda", "LE": "Lateral esquerdo", "VOL": "Volante",
        "MED": "Médio", "MEI": "Meia", "ED": "Extremo pela direita", "EE": "Extremo pela esquerda", "CA": "Centroavante"}
ORDEM = ["LD", "ZD", "ZE", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]
# grupos do ranking do Botafogo (GLOSSARIO_WYSCOUT do Portal Ranking), nos indicadores que a base da Série B tem.
# (rótulo, coluna, menor é melhor)
GRUPOS = {
    "Defensivo": [("Duelos defensivos ganhos %", "Duelos defensivos ganhos, %", False), ("Duelos ganhos %", "Duelos ganhos, %", False),
                  ("Duelos aéreos ganhos %", "Duelos aéreos ganhos, %", False), ("Interceptações (ajust. posse)", "Interceções ajust. à posse", False),
                  ("Carrinhos (ajust. posse)", "Cortes de carrinho ajust. à posse", False), ("Finalizações bloqueadas/90", "Remates intercetados/90", False),
                  ("Ações defensivas certas/90", "Ações defensivas com êxito/90", False), ("Faltas/90", "Faltas/90", True), ("Cartões amarelos/90", "Cartões amarelos/90", True)],
    "Passe": [("Passes/90", "Passes/90", False), ("Passes certos %", "Passes certos, %", False), ("Passes para frente/90", "Passes para a frente/90", False),
              ("Passes para frente certos %", "Passes para a frente certos, %", False), ("Passes progressivos/90", "Passes progressivos/90", False),
              ("Passes progressivos certos %", "Passes progressivos certos, %", False), ("Passes ao terço final/90", "Passes para terço final/90", False),
              ("Passes ao terço final certos %", "Passes certos para terço final, %", False), ("Passes longos/90", "Passes longos/90", False),
              ("Passes longos certos %", "Passes longos certos, %", False), ("Passes-chave/90", "Passes chave/90", False),
              ("Passes para a área/90", "Passes para a área de penálti/90", False), ("Passes para a área certos %", "Passes precisos para a área de penálti, %", False),
              ("Passes inteligentes/90", "Passes inteligentes/90", False), ("Passes em profundidade/90", "Passes em profundidade/90", False),
              ("Cruzamentos/90", "Cruzamentos/90", False), ("Cruzamentos certos %", "Cruzamentos certos, %", False), ("Assistências para finalização/90", "Assistências para remate/90", False)],
    "Ofensivo": [("Finalizações/90", "Remates/90", False), ("Finalizações no gol %", "Remates à baliza, %", False), ("Toques na área/90", "Toques na área/90", False),
                 ("Dribles/90", "Dribles/90", False), ("Dribles certos %", "Dribles com sucesso, %", False), ("Duelos ofensivos ganhos %", "Duelos ofensivos ganhos, %", False),
                 ("Ações ofensivas certas/90", "Acções atacantes com sucesso/90", False), ("Conduções progressivas/90", "Corridas progressivas/90", False),
                 ("Acelerações/90", "Acelerações/90", False), ("Passes recebidos/90", "Passes recebidos/90", False), ("Passes longos recebidos/90", "Passes longos recebidos/90", False),
                 ("Faltas sofridas/90", "Faltas sofridas/90", False), ("Recepções em profundidade/90", "Receção de passes em profundidade/90", False)],
    "Participação em gols": [("Gols/90", "Golos/90", False), ("Gols sem pênalti/90", "Golos sem ser por penálti/90", False), ("xG/90", "Golos esperados/90", False),
                             ("Gols de cabeça/90", "Golos de cabeça/90", False), ("Conversão de gols %", "Golos marcados, %", False), ("Assistências/90", "Assistências/90", False),
                             ("xA/90", "Assistências esperadas/90", False), ("Segundas assistências/90", "Segundas assistências/90", False), ("Terceiras assistências/90", "Terceiras assistências/90", False)],
}
SEM_CONTA = {"Duelos/90", "Duelos defensivos/90", "Duelos aéreos/90"}   # critério do Wyscout mudou no período (volume de duelo)
MIN, ANOS = 900, (2022, 2023, 2024, 2025)
# pesos do ranking do Botafogo por posição (config/pesos_from_pbi.tsv, soma por categoria), para confronto
PESO_RANKING = {"VOL": {"Defensivo": 9, "Passe": 52, "Ofensivo": 23, "Participação em gols": 16}, "MED": {"Defensivo": 10, "Passe": 48, "Ofensivo": 26, "Participação em gols": 16},
                "MEI": {"Defensivo": 7, "Passe": 45, "Ofensivo": 19, "Participação em gols": 15}, "LD": {"Defensivo": 11, "Passe": 28, "Ofensivo": 30, "Participação em gols": 30},
                "LE": {"Defensivo": 11, "Passe": 28, "Ofensivo": 30, "Participação em gols": 30}, "ZD": {"Defensivo": 37, "Passe": 24, "Ofensivo": 18, "Participação em gols": 20},
                "ZE": {"Defensivo": 37, "Passe": 24, "Ofensivo": 18, "Participação em gols": 20}, "ED": {"Defensivo": 2, "Passe": 52, "Ofensivo": 26, "Participação em gols": 20},
                "EE": {"Defensivo": 2, "Passe": 52, "Ofensivo": 26, "Participação em gols": 20}, "CA": {"Defensivo": 3, "Passe": 37, "Ofensivo": 28, "Participação em gols": 32}}

TI = pd.read_csv(os.path.join(RES, "b2", "time_indicadores.csv"))
TI["xg_j"] = TI.xg / TI.jogos.replace(0, np.nan) if TI.xg.max() > 5 else TI.xg
for c in ["xg_j", "posse", "passes", "duel_def_pct", "ppda"]:
    TI["tz_" + c] = TI.groupby("ano")[c].transform(lambda x: (x - x.mean()) / x.std())
ti = TI[["ano", "clube", "faixa", "tz_xg_j", "tz_posse", "tz_passes", "tz_duel_def_pct", "tz_ppda"]]
T = tecnico(); T["pos11"] = T.posicao.map(pos11)
T = T[T.ano.isin(ANOS) & (T.minutos >= MIN)].merge(ti, on=["ano", "clube"], how="left"); T = T[T.faixa.notna() & T.pos11.isin(ORDEM)].reset_index(drop=True)
IND = [(g, rot, col, menor) for g, L in GRUPOS.items() for rot, col, menor in L if col in T.columns]
# z dentro do ano e da posição (o Wyscout mudou critérios no período); "menor é melhor" vira sinal trocado
Z = pd.DataFrame(index=T.index)
for g, rot, col, menor in IND:
    v = pd.to_numeric(T[col], errors="coerce")
    z = v.groupby([T.ano, T.pos11]).transform(lambda s: (s - s.mean()) / s.std())
    Z[col] = -z if menor else z
Z["faixa"], Z["pos11"], Z["ano"] = T.faixa, T.pos11, T.ano
# "A TIME IGUAL" (18/10, dúvida do Henrique: participação em gols é do time?): tira-se de cada indicador a parte que o
# TIME explica — ataque/passe/participação contra o xG e a posse do time na temporada; defesa contra os duelos
# defensivos ganhos e o PPDA do time. O que sobra é do jogador. É com ISSO que se escolhe e se pesa.
TIME = {"Defensivo": ["tz_duel_def_pct", "tz_ppda"], "Passe": ["tz_xg_j", "tz_posse", "tz_passes"], "Ofensivo": ["tz_xg_j", "tz_posse"], "Participação em gols": ["tz_xg_j", "tz_posse"]}
ZT = Z.copy()
for g, rot, col, menor in IND:
    tcols = TIME[g]
    for p in ORDEM:
        m = (Z.pos11 == p) & Z[col].notna() & T[tcols].notna().all(axis=1)
        if m.sum() < 40: continue
        X = np.c_[np.ones(m.sum()), T.loc[m, tcols].values]; b, *_ = np.linalg.lstsq(X, Z.loc[m, col].values, rcond=None)
        ZT.loc[m, col] = Z.loc[m, col].values - (X @ b - b[0])

def sep(df, col):
    s, c = df[df.faixa == "Sobe"][col].dropna(), df[df.faixa == "Cai"][col].dropna()
    return np.nan if len(s) < 8 or len(c) < 8 else s.mean() - c.mean()

# 1. indicador a indicador, por posição
rows = []
for p in ORDEM:
    g = Z[Z.pos11 == p]
    for grupo, rot, col, menor in IND:
        d = sep(g, col); dt = sep(ZT[ZT.pos11 == p], col)
        rows.append({"pos": p, "posicao": NOME[p], "grupo": grupo, "indicador": rot, "menor_melhor": menor, "sep": round(d, 2) if pd.notna(d) else np.nan,
                     "sep_time_igual": round(dt, 2) if pd.notna(dt) else np.nan, "do_time": bool(pd.notna(d) and pd.notna(dt) and d >= 0.3 and dt < 0.3),
                     "principal": bool(pd.notna(dt) and dt >= 0.3 and rot not in SEM_CONTA)})
I = pd.DataFrame(rows); I.to_csv(os.path.join(OUT, "indicadores.csv"), index=False)

# 2. por grupo: separação média do grupo (média dos indicadores do grupo que separam a favor; 0 se nenhum) e nota do grupo
GR = []
for p in ORDEM:
    g = ZT[ZT.pos11 == p]; linha = {"pos": p, "posicao": NOME[p]}
    for grupo in GRUPOS:
        cols = [col for gg, rot, col, m in IND if gg == grupo]
        seps = [sep(g, c) for c in cols]; seps = [s for s in seps if pd.notna(s)]
        fav = [s for s in seps if s >= 0.3]
        linha[grupo + "_n_separam"] = len(fav)
        linha[grupo + "_sep_media"] = round(np.mean(seps), 2) if seps else np.nan          # média de todos (o grupo como um todo)
        linha[grupo + "_sep_dos_que_separam"] = round(np.mean(fav), 2) if fav else 0.0
    GR.append(linha)
G = pd.DataFrame(GR); G.to_csv(os.path.join(OUT, "grupos.csv"), index=False)

# 3. seta: alternativas, um ano de fora por vez (quem sobe × quem cai), regra escolhida no treino e aplicada no teste
D = Z[Z.faixa.isin(["Sobe", "Cai"])].copy(); D["y"] = (D.faixa == "Sobe").astype(int)
DT = ZT[ZT.faixa.isin(["Sobe", "Cai"])].copy()
BLOCO = {"Passe": "pas", "Ofensivo": "atq", "Defensivo": "def", "Participação em gols": "atq"}   # na seta de hoje, participação em gols está no bloco "ataque"
def escolhe(tr, p, modo):
    """devolve [(col, minimo_de_quem_sobe_mediana)] da posição, escolhidos só com o treino — pela separação A TIME IGUAL"""
    g = tr[tr.pos11 == p]; gt = DT.loc[g.index]; cand = []
    for grupo, rot, col, menor in IND:
        if rot in SEM_CONTA: continue
        d = sep(gt, col)
        if pd.isna(d) or d < 0.3: continue
        cand.append((col, d, grupo))
    if modo == "F":      # 3 por bloco (pas/atq/def), como hoje — participação em gols cai no bloco ataque
        out = []
        for b in ["pas", "atq", "def"]:
            out += sorted([c for c in cand if BLOCO[c[2]] == b], key=lambda c: -c[1])[:3]
    elif modo == "P": out = cand
    elif modo == "top8": out = sorted(cand, key=lambda c: -c[1])[:8]
    elif modo == "grupo": out = cand
    else: out = cand
    med = g[g.faixa == "Sobe"]
    return [(c[0], med[c[0]].median(), c[1], c[2]) for c in out]
def nota(df, regra, modo):
    if not regra: return pd.Series(np.nan, index=df.index)
    if modo == "grupo":
        # média dos z de cada grupo, pesada pela separação média do grupo (dos que separam)
        pesos = {}; cols = {}
        for col, m, d, grupo in regra: cols.setdefault(grupo, []).append(col); pesos[grupo] = pesos.get(grupo, 0) + d
        tot = sum(pesos.values()) or 1
        s = pd.Series(0.0, index=df.index)
        for grupo, cs in cols.items(): s = s + df[cs].mean(axis=1).fillna(0) * pesos[grupo] / tot
        return s
    ok = pd.DataFrame({col: (df[col] >= m).astype(float).where(df[col].notna()) for col, m, d, g in regra})
    return ok.mean(axis=1)   # fração dos fundamentais cumpridos (é a seta: ≥ 60% ▲)
res = []
for modo, rot in [("F", "F — 3 por bloco (como hoje, só técnico)"), ("P", "P — todos que separam (≥ 0,30)"), ("top8", "Os 8 mais fortes, sem bloco"), ("grupo", "Nota por grupo, pesada pela separação")]:
    aucs = []; por_pos = {p: [] for p in ORDEM}
    for ano in ANOS:
        tr, te = D[D.ano != ano], D[D.ano == ano]
        pred = pd.Series(np.nan, index=te.index)
        for p in ORDEM:
            regra = escolhe(tr, p, modo)
            m = te.pos11 == p
            if not regra or not m.any(): continue
            pred[m] = nota(te[m], regra, modo)
        ok = pred.notna() & te.y.notna()
        if te[ok].y.nunique() == 2: aucs.append(roc_auc_score(te[ok].y, pred[ok]))
        for p in ORDEM:
            mm = ok & (te.pos11 == p)
            if mm.sum() >= 16 and te[mm].y.nunique() == 2: por_pos[p].append(roc_auc_score(te[mm].y, pred[mm]))
    res.append({"regra": rot, "auc_medio": round(np.mean(aucs), 3), "anos": len(aucs), **{p: (round(np.mean(v), 2) if v else np.nan) for p, v in por_pos.items()}})
AUC = pd.DataFrame(res); AUC.to_csv(os.path.join(OUT, "auc.csv"), index=False)

f2 = lambda v: ("+" if v > 0 else "") + f"{v:.2f}".replace(".", ",") if pd.notna(v) else "—"
md = ["# Indicadores técnicos por posição — quatro grupos, pesos e a seta", "",
      "*18/10/2026 · titulares da Série B 2022–2025 (≥ 900 min, Wyscout) · só técnico (o físico está na letra) · em paralelo, não muda o app.*", "",
      "## Os quatro grupos (os do ranking do Botafogo)", ""]
for grupo, L in GRUPOS.items(): md.append(f"- **{grupo}** ({len([1 for g_, r_, c_, m_ in IND if g_ == grupo])}): " + " · ".join(r for r, c, m in L if c in T.columns))
md += ["", "Separação = média de quem sobe menos a de quem cai, em desvios-padrão da posição (z dentro do ano). **0,30** separa; **0,50** separa muito. Indicador em que quem sobe tem MENOS não conta a favor.", "",
       "**A time igual.** Dúvida do Henrique (18/10): participação em gols não é do time? Para responder, de cada indicador foi tirada a parte que o time explica (ataque, passe e participação contra o xG e a posse do time na temporada; defesa contra os duelos defensivos ganhos e o PPDA do time). O que sobra é do jogador. **Tudo abaixo — grupos, escolha e pesos — usa a separação a time igual.** Indicador que separava só por causa do time aparece marcado como *do time* e fica de fora.", "",
       "## Quanto cada grupo separa, por posição (a time igual) — e o peso que o ranking do Botafogo dá", "",
       "| Posição | Defensivo | Passe | Ofensivo | Participação em gols | ordem pelo dado | pesos do ranking (Def · Pas · Of · PG) |", "|---|---|---|---|---|---|---|"]
for _, r in G.iterrows():
    cel = lambda g: f"**{r[g + '_n_separam']}** separam · média {f2(r[g + '_sep_media'])}"
    ordem = sorted(GRUPOS, key=lambda g: -(r[g + "_n_separam"] * 10 + (r[g + "_sep_dos_que_separam"] or 0)))
    pr = PESO_RANKING[r.pos]
    md.append(f"| {r.posicao} | {cel('Defensivo')} | {cel('Passe')} | {cel('Ofensivo')} | {cel('Participação em gols')} | " + " > ".join(o.replace("Participação em gols", "Part. gols") for o in ordem) +
              f" | {pr['Defensivo']} · {pr['Passe']} · {pr['Ofensivo']} · {pr['Participação em gols']} |")
md += ["", "## Indicador a indicador — os que separam a favor de quem sobe a time igual (≥ 0,30), por posição", "", "Entre parênteses, a separação bruta. *Do time* = separava só pelo time, fica de fora.", ""]
for p in ORDEM:
    x = I[(I.pos == p) & I.principal].sort_values("sep_time_igual", ascending=False)
    dt = I[(I.pos == p) & I.do_time]
    md.append(f"**{NOME[p]}** — {len(x)} indicadores entram" + (f" · do time (fora): {', '.join(dt.indicador)}" if len(dt) else ""))
    md.append("")
    for grupo in GRUPOS:
        y = x[x.grupo == grupo]
        md.append(f"- {grupo}: " + (" · ".join(f"{r.indicador} **{f2(r.sep_time_igual)}** ({f2(r.sep)})" for r in y.itertuples()) if len(y) else "nenhum"))
    md.append("")
md += ["## A seta: qual regra prevê melhor quem sobe × quem cai (um ano de fora por vez; AUC — 0,50 é moeda)", "",
       "| Regra | AUC | " + " | ".join(NOME[p] for p in ORDEM) + " |", "|---|---|" + "---|" * len(ORDEM)]
for _, r in AUC.iterrows():
    md.append(f"| {r.regra} | **{str(r.auc_medio).replace('.', ',')}** | " + " | ".join(str(r[p]).replace(".", ",") if pd.notna(r[p]) else "—" for p in ORDEM) + " |")
open(os.path.join(OUT, "B20.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
print(G.to_string(index=False)); print(); print(AUC.to_string(index=False))
