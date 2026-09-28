"""Os dez por posição e mercado — a mesma pontuação e os mesmos filtros de "Os meus dez" (ideal10.pool), vistos
mercado a mercado (Série B, campeonatos sul-americanos, brasileiros e sul-americanos no exterior) e, na segunda
saída, só quem chega livre (contrato até jun/27 ou sem contrato). A coluna "Geral" é a posição do jogador na ordem
de "Os meus dez" (todos os mercados juntos), para as listas baterem entre si.
Saídas: listas/TOP10_POR_POSICAO.md, listas/LIVRES_2027.md"""
import os, pandas as pd
from _comum import RAIZ
from top10 import POS
from ideal10 import pool

L = os.path.join(RAIZ, "listas")
MERC = [("Série B", "Série B"), ("Sul-americanas", "Campeonatos sul-americanos"), ("Exterior", "Brasileiros e sul-americanos no exterior (ligas compatíveis com a B)")]
dt = lambda c: (str(c)[8:10] + "/" + str(c)[5:7] + "/" + str(c)[2:4]) if isinstance(c, str) and len(c) >= 10 else "—"
f = lambda v, c=0: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")

def tabela(x):
    md = ["| # | Geral | Jogador | Clube | Liga | Idade | Contrato | Pontos | Nota | Ader. | Nível | PSV | Tipo físico | BP | Scouts |",
          "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
    for i, r in enumerate(x.itertuples(), 1):
        liga = "Série B" if r.mercado_l == "Série B" else str(r.liga)
        tipo = "—" if pd.isna(r.tipo) else str(r.tipo) + ("" if r.tipo_pref else " *")
        md.append(f"| {i} | {r.ordem_geral}º | **{r.jogador}**{'' if r.livre else ' (e)'} | {r.clube} | {liga} | {int(r.idade)} | {dt(r.contrato)}{' *' if str(r.contrato_vencido) == 'True' else ''} | **{f(r.score)}** | {f(r.nota)}{'' if str(r.nota_completa) == 'True' else ' *'} | {f(r.aderencia_ajustada)} | {f(r.nivel_overall)} | {f(r.psv, 1)} | {tipo} | {f(r.bp) if r.bp else '—'} | {('★ ' + str(r.scouts)) if isinstance(r.scouts, str) else ''} |")
    return md

def doc(d, titulo, intro, arquivo, so_livres):
    md = [f"# {titulo}", "", "*Dado: Wyscout e contratos de ago/26; físico SkillCorner (Série B) e do Portal (fora) até set/26; scouts TransferRoom · 28/09/2026.*", "", intro,
          "**Pontos**, filtros e colunas são os mesmos de `Os meus dez por posição`; **Geral** = lugar do jogador naquela ordem (todos os mercados juntos). "
          "(e) = contrato além de jun/27; \\* no contrato = vencido no dado de ago/26 (confirmar); \\* na nota = nota com uma parte imputada; \\* no tipo = não é o tipo de quem sobe na posição. Clique no nome para abrir a ficha.", ""]
    for p, nome, sub in POS:
        md += [f"\n## {nome}" + (f" — {sub}" if sub else "")]
        for m, rot in MERC:
            x = d[(d.pos11 == p) & (d.mercado_l == m)]
            if so_livres: x = x[x.livre]
            x = x.head(10)
            md += ["", f"**{rot}**" + (" — ninguém passa nos filtros" if x.empty else ""), ""]
            if not x.empty: md += tabela(x)
    open(os.path.join(L, arquivo), "w", encoding="utf-8").write("\n".join(md) + "\n")

def main():
    d = pool()
    doc(d, "Os dez por posição e mercado — 2027",
        "A mesma lista de `Os meus dez por posição`, separada nos três mercados: **Série B**, **campeonatos sul-americanos** e **brasileiros e sul-americanos no exterior** em ligas compatíveis com a B. Serve para olhar um mercado só; a ordem dentro de cada mercado é a mesma da lista geral.",
        "TOP10_POR_POSICAO.md", False)
    doc(d, "Os dez por posição e mercado — só fim de contrato",
        "Só quem chega **livre** (contrato até jun/27 ou sem contrato registrado no dado de ago/26), nos três mercados, na mesma ordem de `Os meus dez por posição`. É a lista do passe zero; contrato e situação a confirmar antes de qualquer contato.",
        "LIVRES_2027.md", True)
    print(d[d.livre].groupby(["pos11", "mercado_l"]).size().unstack().fillna(0).astype(int))

if __name__ == "__main__":
    main()
