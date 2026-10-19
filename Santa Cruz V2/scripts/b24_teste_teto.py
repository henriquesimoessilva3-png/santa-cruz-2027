"""b24 (19/10): teto de fundamentais por posição — volante tinha 28, meia 24. Testa AUC (ano de fora) com teto 10/12/15/20/sem teto,
mantendo os de maior separação (sep)."""
import os
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "b23_seta_sobe.py"), encoding="utf-8").read()
exec(compile(src.split("# regra final")[0], "b23", "exec"))
_esc = escolher
def com_teto(n):
    def f(anos):
        E = _esc(anos)
        if n:
            for rg in E:
                en = sorted(E[rg]["entra"], key=lambda e: -(e["sep"] or 0)); E[rg]["fora"] += [dict(e, motivo="teto") for e in en[n:]]; E[rg]["entra"] = sorted(en[:n], key=lambda e: e["k"])
        return E
    return f
for n in (8, 10, 12, 15, 20, None):
    esc_f = com_teto(n); aucs = []; por = {rg: [] for rg, _, _ in REGUAS}
    for ano in ANOS:
        tr = [a for a in ANOS if a != ano]; esc = esc_f(tr); med = medianas(tr)
        te = RAW[(RAW.ano == ano) & RAW.faixa.isin(["Sobe", "Cai"])]; y = (te.faixa == "Sobe").astype(int); pr = pontos(te, esc, med); ok = pr.notna()
        aucs.append(roc_auc_score(y[ok], pr[ok]))
        for rg, _, ps in REGUAS:
            mm = ok & te.pos11.isin(ps)
            if mm.sum() >= 16 and y[mm].nunique() == 2: por[rg].append(roc_auc_score(y[mm], pr[mm]))
    print("teto", n, "AUC", round(float(np.mean(aucs)), 3), {rg: (round(float(np.mean(v)), 2) if v else None) for rg, v in por.items()}, flush=True)
