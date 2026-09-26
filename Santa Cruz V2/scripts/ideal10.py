"""Os meus dez por posição — 2027. Os três mercados juntos (Série B, campeonatos sul-americanos e
sul-americanos/brasileiros no exterior em ligas compatíveis com a B), ordenados do mais aderente
ao menos: pontuação = nota do estudo (aderência ao modelo que rende na B + nível do ranking)
+ 3 se é do tipo físico de quem sobe (B15) + 3 se é especialista de bola parada (índice ≥ 85, B3)
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
    tt = pd.read_csv(os.path.join(RAIZ, "resultados", "b15", "tipos_todos.csv"))
    tt["k"] = tt.chave + "|" + tt.clube.map(chave); tt = tt.drop_duplicates("k").set_index("k")
    d["tipo"] = d.k.map(tt.tipo); d["tipo_pref"] = d.k.map(tt.tipo_pref).fillna(False).astype(bool)
    d["psv"] = d.psv99 if "psv99" in d else np.nan
    d["psv"] = d.psv.fillna(d.k.map(tt.psv99))
    d = d[d.psv.isna() | (d.psv >= 27) | (d.pos11 == "GOL")]
    # Sofascore 2026 (B14): nota média, xG+xA/90 e velocidade máxima — colunas, não ordenação
    sj = pd.read_csv(os.path.join(RAIZ, "resultados", "b14", "jogador_temporada.csv"))
    sj = sj[(sj.ano == 2026) & (sj.minutos >= 450)].sort_values("minutos", ascending=False).drop_duplicates("chave").set_index("chave")
    kk = d.jogador.map(chave)
    d["sofa_nota"] = np.where(d.mercado_l == "Série B", kk.map(sj.nota_media), np.nan)
    d["sofa_xgxa"] = np.where(d.mercado_l == "Série B", kk.map(sj.expectedGoals_p90.fillna(0) + sj.expectedAssists_p90.fillna(0)), np.nan)
    d["sofa_vmax"] = np.where(d.mercado_l == "Série B", kk.map(sj.topSpeed), np.nan)
    bp = bp_indices(); d["bp"] = d.k.map(bp).fillna(0)
    d["livre"] = d.livre_2027.astype(str) == "True"
    # gol de defesa (B7-1): gols de zagueiro, volante e lateral rendem e não custam — xG/90 no quartil de cima da posição
    DEF = {"LD", "ZD", "ZE", "LE", "VOL"}
    # xG/90 com precisão: o export arredonda "xG per 90" a uma casa (0,0 / 0,1); o xG total não
    d["xg90"] = (pd.to_numeric(d.get("xG"), errors="coerce") / pd.to_numeric(d.minutos, errors="coerce") * 90)
    d["xg90"] = d.xg90.fillna(pd.to_numeric(d.get("xG per 90"), errors="coerce"))
    d["xg_p"] = d.groupby("pos11").xg90.rank(pct=True) * 100
    d["gol_def"] = d.pos11.isin(DEF) & (d.xg_p >= 90)          # ⚽ = decil de cima da posição
    d["gol_def_pts"] = np.where(d.pos11.isin(DEF), np.where(d.xg_p >= 90, 3, np.where(d.xg_p >= 75, 1, 0)), 0)
    # corrida para a área (B8-2): o físico que mais anda com participação em gol no meia, volante, lateral e extremo
    AREA = {"LD", "LE", "VOL", "MED", "MEI", "ED", "EE"}
    d["area"] = pd.to_numeric(d.get("runs_penalty_area_p30tip"), errors="coerce").fillna(d.k.map(tt.runs_penalty_area_p30tip) if "runs_penalty_area_p30tip" in tt else np.nan)
    d["area_p"] = d.groupby("pos11").area.rank(pct=True) * 100
    d["chega_area"] = d.pos11.isin(AREA) & (d.area_p >= 90)     # ➚ = decil de cima da posição
    d["area_pts"] = np.where(d.pos11.isin(AREA), np.where(d.area_p >= 90, 3, np.where(d.area_p >= 75, 1, 0)), 0)
    d["score"] = (d.nota + 3 * d.tipo_pref + 3 * (d.bp >= 85) + d.gol_def_pts + d.area_pts + d.scouts.map(BONUS).fillna(0) + d.liga.map(CRIVO).fillna(0)).round(1)
    d = d.sort_values("score", ascending=False).drop_duplicates(["k"])
    dt = lambda c: (str(c)[8:10] + "/" + str(c)[5:7] + "/" + str(c)[2:4]) if isinstance(c, str) and len(c) >= 10 else "—"
    f = lambda v, c=0: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")
    md = ["# Os meus dez por posição — 2027", "",
          "*Dado: Wyscout e contratos de ago/26; físico SkillCorner (Série B) e do Portal (fora) até set/26; bola parada Wyscout/Sofascore; scouts TransferRoom · 25/09/2026.*", "",
          "Os três mercados juntos — **Série B**, **campeonatos sul-americanos** e **brasileiros e sul-americanos no exterior** em ligas compatíveis com a B (Portugal B/C, Leste Europeu, Golfo, Ásia B) — ordenados do mais aderente ao menos. "
          "**Pontuação** = nota do estudo (aderência ao modelo que rende na Série B + nível do ranking) + 3 se é do tipo físico que quem sobe mais usa (B15) + 3 se é especialista de bola parada (índice ≥ 85) + 3 se é defensor ou volante com xG/90 no decil de cima da posição, 1 no quartil (⚽, gol de defesa: rende e não custa, B7-1) + 3 se é lateral, volante, meia ou extremo com corridas para a área no decil de cima da posição, 1 no quartil (➚, B8-2: o físico que mais anda com participação em gol) + bônus dos scouts, com −5 para Equador B, Bolívia e Argentina B. "
          "Filtros: ≥ 900 min, idade ≤ 35, fora os clubes grandes das ligas fracas (Olympiacos, Ludogorets, Maccabi, clubes do Golfo…), PSV-99 ≥ 27 km/h quando há rastreio, sem os vetados, valor ≤ € 2 MM, nota com as duas partes (ou aderência ≥ 65). "
          "Nas ligas de fora a aderência já está convertida pela reta de liga (B11: p90 na origem → 58 na B). **BP** = índice de cobrador/finalizador; ★ = scouts; (e) = contrato além de jun/27. **vmax Sofa**, **Nota Sofa** e **xG+xA/90** vêm do Sofascore 2026 (B14), só para a Série B: descrevem, não ordenam (a nota não repete de um ano para o outro, r 0,36). A vmax é pico de um jogo (r 0,33 com o PSV-99) e não substitui o piso: só abaixo de 32 km/h é alerta.", ""]
    out = []
    for p, nome, sub in POS:
        x = d[d.pos11 == p].head(10).assign(ordem=lambda t: range(1, len(t) + 1)); out.append(x)
        md += [f"\n### {nome}" + (f" — {sub}" if sub else ""), "",
               "| # | Jogador | Clube | Liga | Idade | Contrato | Pontos | Nota | Ader. | Nível | PSV | vmax Sofa | Tipo físico | BP | xG/90 | Área/30' | Nota Sofa | xG+xA/90 | Scouts |",
               "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
        for r in x.itertuples():
            liga = "Série B" if r.mercado_l == "Série B" else str(r.liga)
            tipo = "—" if pd.isna(r.tipo) else str(r.tipo) + ("" if r.tipo_pref else " *")
            md.append(f"| {r.ordem} | **{r.jogador}**{'' if r.livre else ' (e)'} | {r.clube} | {liga} | {int(r.idade)} | {dt(r.contrato)}{' *' if str(r.contrato_vencido) == 'True' else ''} | **{f(r.score)}** | {f(r.nota)}{'' if str(r.nota_completa) == 'True' else ' *'} | {f(r.aderencia_ajustada)} | {f(r.nivel_overall)} | {f(r.psv, 1)} | {f(r.sofa_vmax, 1)} | {tipo} | {f(r.bp) if r.bp else '—'} | {f(r.xg90, 2)}{' ⚽' if r.gol_def else ''} | {f(r.area, 1)}{' ➚' if r.chega_area else ''} | {f(r.sofa_nota, 2)} | {f(r.sofa_xgxa, 2)} | {('★ ' + str(r.scouts)) if isinstance(r.scouts, str) else ''} |")
    t = pd.concat(out)
    t[["ordem", "pos11", "jogador", "clube", "liga", "mercado_l", "idade", "minutos", "contrato", "livre", "valor", "nota", "aderencia_ajustada", "nivel_overall", "psv", "sofa_vmax", "tipo", "tipo_pref", "bp", "xg90", "gol_def", "area", "chega_area", "sofa_nota", "sofa_xgxa", "scouts", "score"]].to_csv(os.path.join(L, "IDEAL_2027.csv"), index=False)
    open(os.path.join(L, "IDEAL_2027.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    print(t.groupby("pos11").mercado_l.value_counts().unstack().fillna(0).astype(int).to_string())
    print(t[["ordem", "pos11", "jogador", "clube", "score", "nota", "psv", "tipo", "bp", "livre"]].head(60).to_string(index=False))

if __name__ == "__main__":
    main()
