"""Ranking físico por posição — os 20 melhores pelos indicadores físicos, em três mercados (Série B, campeonatos
sul-americanos, brasileiros e sul-americanos no exterior alcançável). Pontuação física = média ponderada dos
percentis dentro da posição (todos os mercados juntos): sprints/90 (2), alta intensidade/90 (2), arrancadas/90 (2),
PSV-99 (1), corridas sem bola/30 min (1). Distância fica fora (não rende ponto, B1-1). Filtros: ≥ 900 min, piso 27
km/h, sem vetados, valor ≤ € 2 MM, ≤ 35 anos. Saídas: listas/RANKING_FISICO.md/.csv"""
import os, numpy as np, pandas as pd
from _comum import RAIZ, chave, excluidos, caro
from top10 import FRACAS
from ideal10 import GRANDES
import listas as L
LI = os.path.join(RAIZ, "listas")
ORDEM = ["LD", "ZD", "ZE", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]
NOMES = {"LD": "Lateral direito", "ZD": "Zagueiro pela direita", "ZE": "Zagueiro pela esquerda", "LE": "Lateral esquerdo", "VOL": "Volante", "MED": "Médio", "MEI": "Meia", "ED": "Extremo pela direita", "EE": "Extremo pela esquerda", "CA": "Centroavante"}
PESO = {"sprint_count_p90": 2, "hi_count_p90": 2, "expl_accel_sprint_p90": 2, "psv99": 1, "runs_p30tip": 1}

def main():
    fora = excluidos()
    t = pd.read_csv(os.path.join(RAIZ, "resultados", "b15", "tipos_todos.csv")); t = t.loc[:, ~t.columns.duplicated()]
    t["k"] = t.chave + "|" + t.clube.map(chave)
    sb = pd.read_excel(os.path.join(LI, "listas_2027.xlsx"), "base_serie_B_2026"); sb["mercado_l"] = "Série B"
    s = pd.read_csv(os.path.join(LI, "base_sul_americanas.csv")); s["mercado_l"] = "Sul-americanas"
    e = pd.read_csv(os.path.join(LI, "base_sulam_exterior.csv")); e = e[e.liga.isin(L.ALCANCAVEIS) & ~e.clube.isin(GRANDES)]; e["mercado_l"] = "Brasileiros e sul-americanos no exterior"
    B = pd.concat([sb, s, e], ignore_index=True); B["k"] = B.jogador.map(chave) + "|" + B.clube.map(chave)
    B = B.drop(columns=[c for c in PESO if c in B], errors="ignore").merge(t[["k", "pos11", "tipo", "tipo_pref"] + list(PESO)].rename(columns={"pos11": "pos_fis"}), on="k", how="inner")
    B["pos11"] = B.pos_fis
    B = B[(B.minutos >= 900) & (B.idade <= 35) & (B.psv99 >= 27)]
    B = B[[not fora(j, c) for j, c in zip(B.jogador, B.clube)]]; B = B[~caro(B)]
    for c in PESO: B[c + "_p"] = B.groupby("pos11")[c].rank(pct=True) * 100
    B["fisico"] = sum(B[c + "_p"].fillna(50) * w for c, w in PESO.items()) / sum(PESO.values())
    B["fisico"] = B.fisico.round(0)
    B["livre"] = B.livre_2027.astype(str) == "True"
    B["br"] = B.nascido_em.eq("Brazil") | B.passaporte.fillna("").str.contains("Brazil")
    B = B.sort_values(["pos11", "fisico"], ascending=[True, False])
    f = lambda v, c=0: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")
    dt = lambda c: (str(c)[8:10] + "/" + str(c)[5:7] + "/" + str(c)[2:4]) if isinstance(c, str) and len(c) >= 10 else "—"
    md = ["# Ranking físico por posição", "", "*Dado: SkillCorner (Série B, estudo) e Portal (fora), temporada atual; Wyscout ago/26 para minutos, contrato e nota · 26/09/2026.*", "",
          "Os 20 melhores de cada posição **pelos indicadores físicos**, em três mercados. **Físico** = média ponderada dos percentis dentro da posição, todos os mercados juntos: sprints/90 (peso 2), ações de alta intensidade/90 (2), arrancadas explosivas/90 (2), PSV-99 (1), corridas sem bola por 30 min (1); distância fica fora (não rende ponto, B1-1). "
          "**Nota** é a técnica (aderência + nível), para não confundir: este ranking é só o físico. **Tipo** com ✓ = tipo físico que quem sobe mais usa (B8/B15). Filtros: ≥ 900 min, piso 27 km/h, sem vetados, valor ≤ € 2 MM, até 35 anos. (BR) = brasileiro. Clique no nome para abrir a ficha.", ""]
    for p in ORDEM:
        md += [f"## {NOMES[p]}", ""]
        for merc in ["Série B", "Sul-americanas", "Brasileiros e sul-americanos no exterior"]:
            x = B[(B.pos11 == p) & (B.mercado_l == merc)].head(20)
            md += [f"**{merc}**" + (" — sem jogador com físico" if x.empty else ""), ""]
            if x.empty: continue
            md += ["| # | Jogador | Clube |" + (" Liga |" if merc != "Série B" else "") + " Idade | Contrato | Físico | PSV-99 | Sprints/90 | Alta int./90 | Arrancadas/90 | Corridas s/ bola | Tipo | Nota |",
                   "|---|---|---|" + ("---|" if merc != "Série B" else "") + "---|---|---|---|---|---|---|---|---|---|"]
            for i, r in enumerate(x.itertuples(), 1):
                md.append(f"| {i} | **{r.jogador}**{' (BR)' if r.br and merc != 'Série B' else ''}{'' if r.livre else ' (e)'} | {r.clube} |" + (f" {r.liga} |" if merc != "Série B" else "") +
                          f" {int(r.idade)} | {dt(r.contrato)} | **{f(r.fisico)}** | {f(r.psv99, 1)} | {f(r.sprint_count_p90, 1)} | {f(r.hi_count_p90, 0)} | {f(r.expl_accel_sprint_p90, 2)} | {f(r.runs_p30tip, 1)} | {r.tipo}{' ✓' if r.tipo_pref else ''} | {f(r.nota)} |")
            md.append("")
    open(os.path.join(LI, "RANKING_FISICO.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    B.groupby(["pos11", "mercado_l"]).head(20)[["pos11", "mercado_l", "jogador", "clube", "liga", "idade", "minutos", "contrato", "livre", "br", "fisico", "psv99", "sprint_count_p90", "hi_count_p90", "expl_accel_sprint_p90", "runs_p30tip", "tipo", "tipo_pref", "nota"]].round(2).to_csv(os.path.join(LI, "RANKING_FISICO.csv"), index=False)
    print(B.groupby(["pos11", "mercado_l"]).size().unstack().fillna(0).astype(int))
    print(B.groupby("pos11").head(2)[["pos11", "mercado_l", "jogador", "clube", "fisico", "psv99", "sprint_count_p90", "tipo", "nota"]].to_string(index=False))

if __name__ == "__main__":
    main()
