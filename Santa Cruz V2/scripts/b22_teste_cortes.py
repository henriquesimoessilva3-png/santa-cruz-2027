"""b22 (18/10/2026) — TESTE: mais indicadores fundamentais (cortes menores) e seta por CONTAGEM (pedido do Henrique:
"centroavante só ficou com três"; "contar os indicadores acima ou abaixo talvez seja melhor do que essa nota").
Reaproveita a base do b21 (mesma régua, mesmo 'a time igual'). Só mede; não grava nada no app."""
import os, sys
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "b21_seta_tecnica.py"), encoding="utf-8").read()
exec(compile(src.split("# ---------- a regra final")[0], "b21", "exec"))
import itertools
D = Z[Z.faixa.isin(["Sobe", "Cai"])].copy(); D["y"] = (D.faixa == "Sobe").astype(int)

def escolher_c(anos, corte, corte_t, clube=True):
    global CORTE, CORTE_T
    CORTE, CORTE_T = corte, corte_t
    return escolher(anos, clube)

def regra_cont(anos, rg, entra):
    g = Z[Z.ano.isin(anos) & (Z.regua == rg)]
    out = []
    for e in entra:
        c = COL_DE[e["rot"]]; ms, mc = g[g.faixa == "Sobe"][c].median(), g[g.faixa == "Cai"][c].median()
        if pd.notna(ms) and pd.notna(mc): out.append((c, float(ms), float(mc)))
    return out
def nota_cont(df, regra):
    if not regra: return pd.Series(np.nan, index=df.index)
    sc = pd.DataFrame({c: np.where(df[c].isna(), np.nan, np.where(df[c] >= ms, 1.0, np.where(df[c] <= mc, -1.0, 0.0))) for c, ms, mc in regra}, index=df.index)
    return sc.mean(axis=1)

GRADE = [(0.30, 0.20), (0.25, 0.15), (0.20, 0.15), (0.20, 0.10), (0.15, 0.10), (0.20, None), (0.15, None)]
linhas = []
for corte, ct in GRADE:
    ctv = -9 if ct is None else ct
    fin = escolher_c(ANOS, corte, ctv)
    nind = {rg: len(fin[rg]["entra"]) for rg, _, _ in REGUAS}
    for modo in ("nota", "conta"):
        aucs, por = [], {rg: [] for rg, _, _ in REGUAS}
        for ano in ANOS:
            tr = [a for a in ANOS if a != ano]; te = D[D.ano == ano]; pred = pd.Series(np.nan, index=te.index)
            esc = escolher_c(tr, corte, ctv)
            for rg, _, _ in REGUAS:
                m = te.regua == rg
                if not m.any(): continue
                reg = com_col(esc[rg]["entra"])
                pred[m] = nota(te[m], reg) if modo == "nota" else nota_cont(te[m], regra_cont(tr, rg, esc[rg]["entra"]))
            ok = pred.notna()
            if te[ok].y.nunique() == 2: aucs.append(roc_auc_score(te[ok].y, pred[ok]))
            for rg, _, _ in REGUAS:
                mm = ok & (te.regua == rg)
                if mm.sum() >= 16 and te[mm].y.nunique() == 2: por[rg].append(roc_auc_score(te[mm].y, pred[mm]))
        linhas.append({"corte": corte, "time_igual": "—" if ct is None else ct, "modo": modo, "auc": round(float(np.mean(aucs)), 3),
                       **{rg + "_n": nind[rg] for rg, _, _ in REGUAS}, **{rg: (round(float(np.mean(v)), 2) if v else None) for rg, v in por.items()}})
R_ = pd.DataFrame(linhas); os.makedirs(os.path.join(RES, "b22"), exist_ok=True); R_.to_csv(os.path.join(RES, "b22", "grade.csv"), index=False)
pd.set_option("display.width", 250); print(R_.to_string(index=False))
fin = escolher_c(ANOS, 0.20, 0.10)
for rg, nome, _ in REGUAS: print(nome, len(fin[rg]["entra"]), "|", " · ".join(e["rot"] for e in sorted(fin[rg]["entra"], key=lambda e: -e["w"])))
