"""Ranking físico por posição — os 20 melhores pelos indicadores físicos, em três mercados (Série B, campeonatos
sul-americanos, brasileiros e sul-americanos no exterior alcançável). Pontuação física = média ponderada dos
percentis dentro da posição (todos os mercados juntos): sprints/90 (2), alta intensidade/90 (2), arrancadas/90 (2),
PSV-99 (1), corridas sem bola/30 min (1). Distância fica fora (não rende ponto, F1-1). Filtros: ≥ 900 min, piso 27
km/h, sem vetados, valor ≤ € 2 MM, ≤ 35 anos. Saídas: listas/RANKING_FISICO.md/.csv"""
import os, json, numpy as np, pandas as pd
from _comum import RAIZ, chave, excluidos, caro
from top10 import FRACAS
from ideal10 import GRANDES
import listas as L
LI = os.path.join(RAIZ, "listas")
ORDEM = ["LD", "ZD", "ZE", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]
NOMES = {"LD": "Lateral direito", "ZD": "Zagueiro pela direita", "ZE": "Zagueiro pela esquerda", "LE": "Lateral esquerdo", "VOL": "Volante", "MED": "Médio", "MEI": "Meia", "ED": "Extremo pela direita", "EE": "Extremo pela esquerda", "CA": "Centroavante"}
PESO = {"sprint_count_p90": 2, "hi_count_p90": 2, "expl_accel_sprint_p90": 2, "psv99": 1, "runs_p30tip": 1}
MIN_CURTO, MIN_CHEIO = 600, 900   # 600–899 min: amostra curta (~) — entra só nas listas físicas

def tipo_centroide(df, setor_col="setor"):
    """Classifica pelo centróide do setor (resultados/b15/centroides.json), como o app faz para quem não está nas listas."""
    C = json.load(open(os.path.join(RAIZ, "resultados", "b15", "centroides.json"), encoding="utf-8")); core = C["_core"]
    out = []
    for r in df.itertuples():
        c = C.get(getattr(r, setor_col)); 
        if not c: out.append(np.nan); continue
        z = [((getattr(r, k) - c["media"][i]) / c["desvio"][i]) if pd.notna(getattr(r, k, np.nan)) else np.nan for i, k in enumerate(core)]
        if sum(pd.notna(v) for v in z) < 3: out.append(np.nan); continue
        d = {t: sum((cv - zv) ** 2 for cv, zv in zip(cen, z) if pd.notna(zv)) for t, cen in c["tipos"].items()}
        out.append(min(d, key=d.get))
    return out

def curtos():
    """Jogadores com 600–899 min e físico rastreado, nos três mercados — fora das listas técnicas (nota precisa de 900),
    dentro das físicas com o marcador ~. Série B: perfis do F1 + Wyscout; fora: físico do Portal (dados/jogadores.json)."""
    from b15_sugestoes_tipo import SUL, FRACAS, SET, APP
    SETOR = {"ZD": "Zaga", "ZE": "Zaga", "LD": "Lateral", "LE": "Lateral", "VOL": "Volante", "MED": "Meia", "MEI": "Meia", "ED": "Extremo", "EE": "Extremo", "CA": "Atacante"}
    f = pd.read_csv(os.path.join(RAIZ, "resultados", "b1", "perfis", "jogadores.csv"))
    f = f[(f.ano == 2026) & (f.minutos >= MIN_CURTO) & (f.minutos < MIN_CHEIO) & f.pos11.isin(SETOR)].copy()
    t = L.tecnico(); t = t[t.ano == 2026][["chave", "clube", "Valor de mercado", "Contrato termina"]].drop_duplicates(["chave", "clube"])
    f["chave"] = f.jogador.map(chave); f = f.merge(t, on=["chave", "clube"], how="left")
    b = pd.DataFrame({"jogador": f.jogador, "clube": f.clube, "liga": "Série B", "mercado_l": "Série B", "pos11": f.pos11, "idade": f.idade, "minutos": f.minutos,
                      "contrato": f["Contrato termina"].astype(str).str[:10], "valor": pd.to_numeric(f["Valor de mercado"], errors="coerce"), "psv99": f.psv99,
                      "sprint_count_p90": f.sprint_count_p90, "hi_count_p90": f.hi_count_p90, "expl_accel_sprint_p90": f.expl_accel_sprint_p90, "distance_p90": f.distance_p90,
                      "runs_p30tip": f.runs_p30tip, "runs_penalty_area_p30tip": f.get("runs_penalty_area_p30tip"), "br": True})
    J = json.load(open(os.path.join(os.path.dirname(RAIZ), "dados", "jogadores.json"), encoding="utf-8"))
    J = pd.DataFrame(J if isinstance(J, list) else J["jogadores"])
    J["min"] = pd.to_numeric(J["min"], errors="coerce"); J["sc_n"] = pd.to_numeric(J.sc_n, errors="coerce")
    J = J[J.p.isin(SETOR) & J.psv.notna() & (J.sc_n >= 5) & (J["min"] >= MIN_CURTO) & (J["min"] < MIN_CHEIO) & (J.l.isin(SUL) | J.l.isin(FRACAS))]
    if "fis_src" in J: J = J[J.fis_src.isna()]
    SA = {"Brazil", "Brasil", "Argentina", "Uruguay", "Uruguai", "Colombia", "Colômbia", "Chile", "Paraguay", "Paraguai", "Ecuador", "Equador", "Peru", "Bolivia", "Bolívia", "Venezuela"}
    nac = J.nac.fillna("").astype(str)
    J = J[J.l.isin(SUL) | nac.apply(lambda x: any(n in x for n in SA))]; nac = J.nac.fillna("").astype(str)
    e = pd.DataFrame({"jogador": J.n, "clube": J.t, "liga": J.l, "mercado_l": np.where(J.l.isin(SUL), "Sul-americanas", "Brasileiros e sul-americanos no exterior"), "pos11": J.p,
                      "idade": pd.to_numeric(J.id_, errors="coerce"), "minutos": J["min"], "contrato": J.ct.astype(str).str[:10], "valor": pd.to_numeric(J.mv, errors="coerce"),
                      "psv99": J.psv, "sprint_count_p90": J.spr_n, "hi_count_p90": J.hi_n, "expl_accel_sprint_p90": J.expl, "distance_p90": J.dist, "runs_p30tip": J.obr,
                      "runs_penalty_area_p30tip": J.obr_area, "br": nac.str.contains("Bra")})
    c = pd.concat([b, e], ignore_index=True); c["setor"] = c.pos11.map(SETOR); c["tipo"] = tipo_centroide(c)
    c = c[c.tipo.notna()]; c["curto"] = True
    fora = excluidos(); c = c[[not fora(j, cl) for j, cl in zip(c.jogador, c.clube)]]
    c = c[~c.clube.isin(GRANDES)]; c = c[~caro(c)]
    c["livre"] = c.contrato.map(lambda x: (not isinstance(x, str)) or x in ("nan", "None", "") or x <= "2027-06-30")
    return c

def main():
    fora = excluidos()
    t = pd.read_csv(os.path.join(RAIZ, "resultados", "b15", "tipos_todos.csv")); t = t.loc[:, ~t.columns.duplicated()]
    t["k"] = t.chave + "|" + t.clube.map(chave)
    sb = pd.read_excel(os.path.join(LI, "listas_2027.xlsx"), "base_serie_B_2026"); sb["mercado_l"] = "Série B"
    s = pd.read_csv(os.path.join(LI, "base_sul_americanas.csv")); s["mercado_l"] = "Sul-americanas"
    e = pd.read_csv(os.path.join(LI, "base_sulam_exterior.csv")); e = e[e.liga.isin(L.ALCANCAVEIS) & ~e.clube.isin(GRANDES)]; e["mercado_l"] = "Brasileiros e sul-americanos no exterior"
    B = pd.concat([sb, s, e], ignore_index=True); B["k"] = B.jogador.map(chave) + "|" + B.clube.map(chave)
    B = B.drop(columns=[c for c in list(PESO) + ["runs_penalty_area_p30tip"] if c in B], errors="ignore").merge(t[["k", "pos11", "tipo", "tipo_pref", "runs_penalty_area_p30tip"] + list(PESO)].rename(columns={"pos11": "pos_fis"}), on="k", how="inner")
    B["pos11"] = B.pos_fis
    B = B[(B.minutos >= 900) & (B.idade <= 35) & (B.psv99 >= 27)]
    B = B[[not fora(j, c) for j, c in zip(B.jogador, B.clube)]]; B = B[~caro(B)]
    B["curto"] = False
    B["livre"] = B.livre_2027.astype(str) == "True"
    B["br"] = B.nascido_em.eq("Brazil") | B.passaporte.fillna("").str.contains("Brazil")
    # amostra curta (600–899 min): entra na lista física com ~, sem nota e sem lugar em "Os meus dez"
    cu = curtos(); cu = cu[(cu.idade.isna() | (cu.idade <= 35)) & (cu.psv99 >= 27)]
    PREFP = pd.read_csv(os.path.join(RAIZ, "resultados", "b8", "tipos_preferidos_pos.csv")).set_index("pos11").preferidos.fillna("")
    cu["tipo_pref"] = [t in str(PREFP.get(p, "")).split(" / ") for p, t in zip(cu.pos11, cu.tipo)]
    B = pd.concat([B, cu[[c for c in cu.columns if c in B.columns or c in ("curto",)]]], ignore_index=True)
    for c in PESO: B[c + "_p"] = B.groupby("pos11")[c].rank(pct=True) * 100
    B["fisico"] = sum(B[c + "_p"].fillna(50) * w for c, w in PESO.items()) / sum(PESO.values())
    B["fisico"] = B.fisico.round(0)
    PO = pd.read_csv(os.path.join(LI, "POOL_2027.csv")).set_index("k")
    B["score"] = B.k.map(PO.score); B["ordem_geral"] = B.k.map(PO.ordem_geral)
    B = B.sort_values(["pos11", "fisico"], ascending=[True, False])
    f = lambda v, c=0: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")
    dt = lambda c: (str(c)[8:10] + "/" + str(c)[5:7] + "/" + str(c)[2:4]) if isinstance(c, str) and len(c) >= 10 else "—"
    PREF = pd.read_csv(os.path.join(RAIZ, "resultados", "b8", "tipos_preferidos_pos.csv")).set_index("pos11").preferidos.fillna("")
    md = ["# Só o físico: ranking por posição", "", "*Dado: SkillCorner (Série B, estudo) e Portal (fora), temporada atual; Wyscout ago/26 para minutos, contrato e nota · 26/09/2026.*", "",
          "A visão só física — o par de `Os meus dez` (que junta técnico e físico). Os 20 melhores de cada posição **pelos indicadores físicos**, em três mercados. **Físico** = média ponderada dos percentis dentro da posição, todos os mercados juntos: sprints/90 (peso 2), ações de alta intensidade/90 (2), arrancadas explosivas/90 (2), PSV-99 (1), corridas sem bola por 30 min (1); distância fica fora (não rende ponto, F1-1). "
          "**Pontos** e **Geral** são os de `Os meus dez por posição` (a lista que vale; — = não entra nela, por nota ou filtro): este ranking é só o físico, para achar o piso e o tipo. **Corte de minutos**: as listas técnicas pedem **900 min** (a nota precisa desse volume); aqui entram também os de **600 a 899 min**, em *itálico* e com **~** — amostra curta, o físico já é confiável (≥ 7 jogos), a nota não existe. **Tipo** com ✓ = tipo físico que quem sobe mais usa (F2/F2). Filtros: ≥ 900 min, piso 27 km/h, sem vetados, valor ≤ € 2 MM, até 35 anos. (BR) = brasileiro. Clique no nome para abrir a ficha.", ""]
    for p in ORDEM:
        md += [f"## {NOMES[p]}" + (f" — tipo de quem sobe: **{PREF.get(p, '')}**" if PREF.get(p, "") else " — o físico não separa quem sobe de quem cai (F2-4)"), ""]
        for merc in ["Série B", "Sul-americanas", "Brasileiros e sul-americanos no exterior"]:
            x = B[(B.pos11 == p) & (B.mercado_l == merc)].head(20)
            md += [f"**{merc}**" + (" — sem jogador com físico" if x.empty else ""), ""]
            if x.empty: continue
            md += ["| # | Jogador | Clube |" + (" Liga |" if merc != "Série B" else "") + " Idade | Contrato | Físico | PSV-99 | Sprints/90 | Alta int./90 | Arrancadas/90 | Corridas s/ bola | Área/30' | Tipo | Min | Pontos | Geral |",
                   "|---|---|---|" + ("---|" if merc != "Série B" else "") + "---|---|---|---|---|---|---|---|---|---|---|---|---|"]
            for i, r in enumerate(x.itertuples(), 1):
                nome = (f"*{r.jogador}* ~" if r.curto else f"**{r.jogador}**")
                md.append(f"| {i} | {nome}{' (BR)' if r.br and merc != 'Série B' else ''}{'' if r.livre else ' (e)'} | {r.clube} |" + (f" {r.liga} |" if merc != "Série B" else "") +
                          f" {'—' if pd.isna(r.idade) else int(r.idade)} | {dt(r.contrato)} | **{f(r.fisico)}** | {f(r.psv99, 1)} | {f(r.sprint_count_p90, 1)} | {f(r.hi_count_p90, 0)} | {f(r.expl_accel_sprint_p90, 2)} | {f(r.runs_p30tip, 1)} | {f(r.runs_penalty_area_p30tip, 1)} | {r.tipo}{' ✓' if r.tipo_pref else ''} | {int(r.minutos)}{'~' if r.curto else ''} | {f(r.score)} | {'—' if pd.isna(r.ordem_geral) else str(int(r.ordem_geral)) + 'º'} |")
            md.append("")
    open(os.path.join(LI, "RANKING_FISICO.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    B.groupby(["pos11", "mercado_l"]).head(20)[["pos11", "mercado_l", "jogador", "clube", "liga", "idade", "minutos", "contrato", "livre", "br", "fisico", "psv99", "sprint_count_p90", "hi_count_p90", "expl_accel_sprint_p90", "runs_p30tip", "runs_penalty_area_p30tip", "tipo", "tipo_pref", "nota", "score", "ordem_geral", "curto"]].round(2).to_csv(os.path.join(LI, "RANKING_FISICO.csv"), index=False)
    print(B.groupby(["pos11", "mercado_l"]).size().unstack().fillna(0).astype(int))
    print(B.groupby("pos11").head(2)[["pos11", "mercado_l", "jogador", "clube", "fisico", "psv99", "sprint_count_p90", "tipo", "nota"]].to_string(index=False))

if __name__ == "__main__":
    main()
