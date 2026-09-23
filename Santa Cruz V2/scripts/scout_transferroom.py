"""Cruza as avaliações dos scouts (TransferRoom) com as listas do estudo e com a base inteira do Wyscout.

Chave robusta: (a) nome completo normalizado; (b) se falhar, inicial do primeiro nome + último sobrenome
(o Wyscout abrevia: "J. Campaz"), com idade a ±1,5 ano; empate desfeito pelo clube (token em comum).
Ambíguos (2+ candidatos sem clube em comum) ficam de fora e são listados.
Saídas: scout/transferroom_x_listas.xlsx (uma aba por lista, + destaques dos scouts fora das listas)
"""
import os, re, unicodedata, numpy as np, pandas as pd
from _comum import RAIZ, chave

def toks(s): return [t for t in chave(s).split() if len(t) > 1]
def chave2(nome):
    t = toks(nome)
    if not t: return ""
    return (t[0][0] + " " + t[-1]) if len(t) >= 2 else t[0]

def resumo(tr):
    g = tr.groupby("player_id").agg(nome_tr=("player_name", "first"), nome_completo=("player_full_name", "first"), idade_tr=("age", "max"), clube_tr=("squad", "last"), pos_tr=("pos1", "first"),
        avaliacoes=("nota", "size"), nota_media=("nota", "mean"), nota_max=("nota", "max"), ultima=("match_date", "max"), scouts=("scout", "nunique"),
        competicoes=("competition", lambda s: ", ".join(sorted(set(map(str, s.dropna()))))[:70]),
        veredito_ultimo=("overall_rating", lambda s: s.dropna().iloc[-1] if s.notna().any() else np.nan),
        contratar=("overall_rating", lambda s: int((s == "Contratar").sum())), urgencia=("overall_rating", lambda s: int((s == "Acompanhar com urgência").sum())),
        acompanhar=("overall_rating", lambda s: int((s == "Acompanhar").sum())), nao=("overall_rating", lambda s: int(s.isin(["Não acompanhar", "Não contratar"]).sum())),
        potential=("fr_potential", lambda s: "".join(sorted(set(s.dropna().astype(str))))), points=("fr_points", lambda s: "".join(sorted(set(s.dropna().astype(str))))),
        ultima_nota=("notes", lambda s: str(s.dropna().iloc[-1])[:400] if s.notna().any() else "")).reset_index()
    g["k1"] = g.nome_tr.map(chave); g["k1b"] = g.nome_completo.fillna("").map(chave); g["k2"] = g.nome_tr.map(chave2); g["ctoks"] = g.clube_tr.fillna("").map(lambda s: set(toks(s)))
    return g

def casar(l, g):
    """l: DataFrame com jogador, idade, clube. Devolve l com colunas do resumo e 'casamento'."""
    idx1 = {}; idx2 = {}
    for i, r in g.iterrows():
        idx1.setdefault(r.k1, []).append(i)
        if r.k1b: idx1.setdefault(r.k1b, []).append(i)
        idx2.setdefault(r.k2, []).append(i)
    out = []
    for _, r in l.iterrows():
        k1, k2 = chave(r.jogador), chave2(r.jogador); ct = set(toks(str(r.clube)))
        cands = list(dict.fromkeys(idx1.get(k1, []) + idx2.get(k2, [])))
        cands = [i for i in cands if pd.isna(g.at[i, "idade_tr"]) or pd.isna(r.idade) or abs(g.at[i, "idade_tr"] - r.idade) <= 1.5]
        how = ""
        if len(cands) > 1:
            c2 = [i for i in cands if ct & g.at[i, "ctoks"]]
            if len(c2) == 1: cands = c2; how = "nome+idade+clube"
            elif len(c2) > 1: cands = sorted(c2, key=lambda i: -g.at[i, "avaliacoes"])[:1]; how = "nome+idade+clube (mais avaliado)"
            else: how = "AMBÍGUO"; cands = []
        elif len(cands) == 1: how = "nome+idade" if k1 in idx1 else "inicial+sobrenome+idade"
        out.append((cands[0] if cands else None, how))
    l = l.copy().reset_index(drop=True); l["casamento"] = [o[1] for o in out]
    gg = g.drop(columns=["k1", "k1b", "k2", "ctoks"])
    rows = [gg.loc[o[0]] if o[0] is not None else pd.Series(index=gg.columns, dtype=object) for o in out]
    return pd.concat([l, pd.DataFrame(rows).reset_index(drop=True)], axis=1)

def main():
    tr = pd.read_csv(os.path.join(RAIZ, "scout", "transferroom_avaliacoes.csv"), low_memory=False)
    tr["match_date"] = pd.to_datetime(tr.match_date, errors="coerce"); tr["nota"] = pd.to_numeric(tr.fr_match_rating, errors="coerce")
    g = resumo(tr); print("jogadores no TransferRoom:", len(g))
    keep = ["casamento", "nome_tr", "clube_tr", "idade_tr", "pos_tr", "avaliacoes", "nota_media", "nota_max", "scouts", "veredito_ultimo", "contratar", "urgencia", "acompanhar", "nao", "potential", "points", "ultima", "competicoes", "ultima_nota"]
    out = {}
    for arq in ["1_serie_B", "1b_serie_A", "2_sul_americanas", "3_sulam_no_exterior", "4_outras_ligas", "argentina_A_livres"]:
        p = os.path.join(RAIZ, "listas", arq + ".csv")
        if not os.path.exists(p): continue
        l = pd.read_csv(p); m = casar(l, g)
        base = [c for c in ["pos11", "jogador", "clube", "liga", "idade", "minutos", "contrato", "nota", "aderencia_ajustada", "nivel_overall", "livre_2027"] if c in m.columns]
        out[arq] = m[base + keep]
        v = m.avaliacoes.notna()
        print(f"{arq:22s} {len(l):4d} na lista | vistos: {int(v.sum()):3d} | ambíguos: {int((m.casamento=='AMBÍGUO').sum()):2d} | Contratar/urgência: {int(((m.contratar>0)|(m.urgencia>0)).sum())}")
    # destaques dos scouts, base inteira do Wyscout (todas as ligas), cruzando ao contrário
    from listas import ligas, ranking, SULAM, PAIS_SA
    lg = ligas(); lg["chave"] = lg.jogador.map(chave); lg["idade"] = lg.idade.astype(float)
    rk = ranking(); lg = lg.merge(rk, on=["chave", "liga", "pos11", "idade"], how="left")
    dest = g[(g.contratar > 0) | (g.urgencia > 0) | ((g.nota_media >= 7) & (g.avaliacoes >= 3))].copy()
    print("\ndestaques dos scouts (Contratar / urgência / média ≥7 em 3+):", len(dest))
    lgm = lg[["jogador", "clube", "liga", "pos11", "idade", "minutos", "contrato", "valor", "nascido_em", "passaporte", "aderencia", "nivel_overall", "mercado"]].copy()
    mm = casar(lgm, g[g.player_id.isin(dest.player_id)])
    mm = mm[mm.avaliacoes.notna()]
    mm["aderencia_ajustada"] = mm.aderencia + mm.mercado.map({"Série A": 16, "Sul-americano": -15, "Exterior": -15}).fillna(0)
    mm["nota_estudo"] = ((mm.aderencia_ajustada.clip(0, 100) + mm.nivel_overall.fillna(mm.aderencia_ajustada)) / 2).round(1)
    ct = pd.to_datetime(mm.contrato, errors="coerce"); mm["livre_2027"] = ct.isna() | (ct <= pd.Timestamp("2027-06-30"))
    mm = mm.sort_values(["contratar", "urgencia", "nota_media"], ascending=False)
    out["destaques_scouts_x_wyscout"] = mm[["mercado", "liga", "pos11", "jogador", "clube", "idade", "minutos", "contrato", "livre_2027", "valor", "nascido_em", "aderencia_ajustada", "nivel_overall", "nota_estudo"] + keep]
    # destaques que NÃO estão em base nenhuma do Wyscout (jovens, base, ligas fora dos 66 exports)
    fora = dest[~dest.player_id.isin(mm.player_id)]
    out["destaques_fora_do_wyscout"] = fora.sort_values(["contratar", "urgencia", "nota_media"], ascending=False)[["nome_tr", "nome_completo", "idade_tr", "clube_tr", "pos_tr", "avaliacoes", "nota_media", "scouts", "veredito_ultimo", "contratar", "urgencia", "nao", "potential", "ultima", "competicoes", "ultima_nota"]]
    with pd.ExcelWriter(os.path.join(RAIZ, "scout", "transferroom_x_listas.xlsx")) as w:
        for k, v in out.items(): v.round(1).to_excel(w, k[:31], index=False)
    pd.set_option("display.width", 270); pd.set_option("display.max_colwidth", 70); pd.set_option("display.max_rows", 200)
    print("\n=== destaques dos scouts encontrados no Wyscout, por mercado")
    print(mm.groupby("mercado").size().to_dict())
    print(mm[mm.mercado != "Exterior"][["mercado", "liga", "pos11", "jogador", "clube", "idade", "contrato", "livre_2027", "aderencia_ajustada", "nivel_overall", "nota_estudo", "avaliacoes", "nota_media", "scouts", "veredito_ultimo", "contratar", "urgencia", "potential"]].head(80).to_string(index=False))
    print("\n=== destaques fora do Wyscout:", len(fora)); print(fora.sort_values(["contratar","urgencia","nota_media"],ascending=False)[["nome_tr","idade_tr","clube_tr","pos_tr","avaliacoes","nota_media","veredito_ultimo","contratar","urgencia","potential","competicoes"]].head(40).to_string(index=False))

if __name__ == "__main__":
    main()
