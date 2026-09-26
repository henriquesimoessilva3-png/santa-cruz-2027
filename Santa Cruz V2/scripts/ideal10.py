"""Os meus dez por posição — 2027. Os três mercados juntos (Série B, campeonatos sul-americanos e
sul-americanos/brasileiros no exterior em ligas compatíveis com a B), ordenados do mais aderente
ao menos: pontuação = nota do estudo (aderência ao modelo que rende na B + nível do ranking)
+ 3 se é do tipo físico de quem sobe (B10) + 3 se é especialista de bola parada (índice ≥ 85, B3)
+ bônus dos scouts + crivo de liga fraca. Filtros: ≥ 900 min, idade ≤ 35 (GOL ≤ 37), PSV-99 ≥ 27
quando há rastreio, sem vetados, valor ≤ € 2 MM, nota com as duas partes ou aderência ≥ 65.
Saídas: listas/IDEAL_2027.md, listas/IDEAL_2027.csv"""
import os, numpy as np, pandas as pd
from _comum import RAIZ, chave, excluidos, caro
from top10 import FRACAS, CRIVO, BONUS, POS
from listas_md import tipo_de

L = os.path.join(RAIZ, "listas")
# clubes grandes de ligas fracas: salário fora do alcance da B
GRANDES = {"Olympiacos Piraeus", "Olympiacos", "Panathinaikos", "AEK Athens", "PAOK", "Aris", "Maccabi Tel Aviv", "Maccabi Haifa", "Ludogorets", "Ludogorets Razgrad", "Legia Warszawa", "Lech Poznań", "Lech Poznan", "Red Star Belgrade", "Crvena Zvezda", "Partizan", "Dinamo Zagreb", "Hajduk Split", "Ferencváros", "Ferencvaros", "Al Sadd", "Al Duhail", "Al Ain", "Al Wahda", "Shabab Al Ahli", "Al Jazira", "Sharjah", "Al Nasr", "Shanghai Port", "Shanghai Shenhua", "Chengdu Rongcheng", "Beijing Guoan", "Shandong Taishan", "Sporting CP II", "Benfica B", "Porto B", "Braga B"}

def bp_indices():
    x = pd.ExcelFile(os.path.join(L, "bola_parada_especialistas.xlsx")); out = {}
    for sh in x.sheet_names:
        d = x.parse(sh); col = "indice_cobrador" if sh.endswith("cobr") else [c for c in d.columns if c.startswith("indice")][0]
        for r in d.itertuples():
            k = chave(r.jogador) + "|" + chave(str(r.clube)); v = getattr(r, col)
            if pd.notna(v): out[k] = max(out.get(k, 0), float(v))
    return out

def main():
    fora = excluidos()
    b = pd.read_excel(os.path.join(L, "listas_2027.xlsx"), "base_serie_B_2026"); b["mercado_l"] = "Série B"
    s = pd.read_csv(os.path.join(L, "base_sul_americanas.csv")); s["mercado_l"] = "Sul-americanas"
    e = pd.read_csv(os.path.join(L, "base_sulam_exterior.csv")); e = e[e.liga.isin(FRACAS)]; e["mercado_l"] = "Exterior"
    d = pd.concat([b, s, e], ignore_index=True)
    d = d[(d.minutos >= 900) & (d.criterios_com_dado >= 3) & (d.pos11 != "Outro")]
    d = d[((d.idade <= 35) | ((d.pos11 == "GOL") & (d.idade <= 37)))]
    d = d[[not fora(j, c) for j, c in zip(d.jogador, d.clube)]]
    d = d[~caro(d)]
    d = d[~d.clube.isin(GRANDES)]
    d = d[(d.nota_completa.astype(str) == "True") | (d.aderencia_ajustada >= 65)]
    # scouts
    sc = pd.read_csv(os.path.join(RAIZ, "scout", "alvos_scouts.csv"))
    sc["k"] = sc.jogador.map(chave) + "|" + sc.clube.map(chave)
    sinal = sc.drop_duplicates("k").set_index("k")["sinal_scouts"]
    d["k"] = d.jogador.map(chave) + "|" + d.clube.map(chave)
    d["scouts"] = d.k.map(sinal)
    # tipo físico e PSV (Série B tem psv99; fora, o do Portal via tipos_todos)
    tt = pd.read_csv(os.path.join(RAIZ, "resultados", "b10", "tipos_todos.csv"))
    tt["k"] = tt.chave + "|" + tt.clube.map(chave); tt = tt.drop_duplicates("k").set_index("k")
    d["tipo"] = d.k.map(tt.tipo); d["tipo_pref"] = d.k.map(tt.tipo_pref).fillna(False).astype(bool)
    d["psv"] = d.psv99 if "psv99" in d else np.nan
    d["psv"] = d.psv.fillna(d.k.map(tt.psv99))
    d = d[d.psv.isna() | (d.psv >= 27) | (d.pos11 == "GOL")]
    bp = bp_indices(); d["bp"] = d.k.map(bp).fillna(0)
    d["livre"] = d.livre_2027.astype(str) == "True"
    d["score"] = (d.nota + 3 * d.tipo_pref + 3 * (d.bp >= 85) + d.scouts.map(BONUS).fillna(0) + d.liga.map(CRIVO).fillna(0)).round(1)
    d = d.sort_values("score", ascending=False).drop_duplicates(["k"])
    dt = lambda c: (str(c)[8:10] + "/" + str(c)[5:7] + "/" + str(c)[2:4]) if isinstance(c, str) and len(c) >= 10 else "—"
    f = lambda v, c=0: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")
    md = ["# Os meus dez por posição — 2027", "",
          "*Dado: Wyscout e contratos de ago/26; físico SkillCorner (Série B) e do Portal (fora) até set/26; bola parada Wyscout/Sofascore; scouts TransferRoom · 25/09/2026.*", "",
          "Os três mercados juntos — **Série B**, **campeonatos sul-americanos** e **brasileiros e sul-americanos no exterior** em ligas compatíveis com a B (Portugal B/C, Leste Europeu, Golfo, Ásia B) — ordenados do mais aderente ao menos. "
          "**Pontuação** = nota do estudo (aderência ao modelo que rende na Série B + nível do ranking) + 3 se é do tipo físico que quem sobe mais usa (B10) + 3 se é especialista de bola parada (índice ≥ 85) + bônus dos scouts, com −5 para Equador B, Bolívia e Argentina B. "
          "Filtros: ≥ 900 min, idade ≤ 35, fora os clubes grandes das ligas fracas (Olympiacos, Ludogorets, Maccabi, clubes do Golfo…), PSV-99 ≥ 27 km/h quando há rastreio, sem os vetados, valor ≤ € 2 MM, nota com as duas partes (ou aderência ≥ 65). "
          "Nas ligas de fora a nota já tem o desconto de conversão (−15). **L** = livre (contrato até jun/27 ou sem contrato); **BP** = índice de cobrador/finalizador; ★ = scouts; (e) = contrato além de jun/27.", ""]
    out = []
    for p, nome, sub in POS:
        x = d[d.pos11 == p].head(10).assign(ordem=lambda t: range(1, len(t) + 1)); out.append(x)
        md += [f"\n### {nome}" + (f" — {sub}" if sub else ""), "",
               "| # | Jogador | Clube | Liga | Idade | Contrato | Pontos | Nota | Ader. | Nível | PSV | Tipo físico | BP | Scouts |",
               "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
        for r in x.itertuples():
            liga = "Série B" if r.mercado_l == "Série B" else str(r.liga)
            tipo = "—" if pd.isna(r.tipo) else str(r.tipo) + ("" if r.tipo_pref else " *")
            md.append(f"| {r.ordem} | **{r.jogador}**{'' if r.livre else ' (e)'} | {r.clube} | {liga} | {int(r.idade)} | {dt(r.contrato)}{' *' if str(r.contrato_vencido) == 'True' else ''} | **{f(r.score)}** | {f(r.nota)}{'' if str(r.nota_completa) == 'True' else ' *'} | {f(r.aderencia_ajustada)} | {f(r.nivel_overall)} | {f(r.psv, 1)} | {tipo} | {f(r.bp) if r.bp else '—'} | {('★ ' + str(r.scouts)) if isinstance(r.scouts, str) else ''} |")
    t = pd.concat(out)
    t[["ordem", "pos11", "jogador", "clube", "liga", "mercado_l", "idade", "minutos", "contrato", "livre", "valor", "nota", "aderencia_ajustada", "nivel_overall", "psv", "tipo", "tipo_pref", "bp", "scouts", "score"]].to_csv(os.path.join(L, "IDEAL_2027.csv"), index=False)
    open(os.path.join(L, "IDEAL_2027.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    print(t.groupby("pos11").mercado_l.value_counts().unstack().fillna(0).astype(int).to_string())
    print(t[["ordem", "pos11", "jogador", "clube", "score", "nota", "psv", "tipo", "bp", "livre"]].head(60).to_string(index=False))

if __name__ == "__main__":
    main()
