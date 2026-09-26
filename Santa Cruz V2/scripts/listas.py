"""Listas por posição (11 do campograma), quatro mercados, pela ficha dos blocos 1–3.

Aderência = média ponderada do percentil do jogador dentro de (liga × posição), só entre quem
tem >= 900 minutos, nos indicadores da ficha da posição (volume pesa mais que eficiência — B2-6).
Mercados de fora recebem o desconto de conversão do Bloco 6 (percentil de origem chega ao meio
da tabela: reta do B12 — fora do Brasil 31 + 0,30·p, Série A 48 + 0,28·p) — mostrado ao lado, nunca
escondido. Série B traz ainda físico (piso PSV-99, arrancadas, corrida para a área) e bola parada.
Escreve listas/listas_2027.xlsx e listas/*.csv
"""
import os, glob
import numpy as np, pandas as pd
from _comum import *
from b1_perfis import POS11, ORDEM

# ficha por posição: (indicador EN, peso). PT equivalente no mapa abaixo.
FICHA = {
 "GOL": [("Prevented goals per 90", 3), ("Save rate, %", 1), ("Exits per 90", 2), ("Accurate passes, %", 1), ("Long passes per 90", 1)],
 "LD":  [("Long passes per 90", 2), ("Crosses per 90", 2), ("xA per 90", 2), ("Defensive duels won, %", 2), ("Progressive runs per 90", 2), ("Aerial duels won, %", 1)],
 "LE":  [("xG per 90", 2), ("Touches in box per 90", 2), ("Crosses per 90", 2), ("Progressive runs per 90", 2), ("Defensive duels won, %", 1), ("Aerial duels won, %", 1)],
 "ZD":  [("Key passes per 90", 2), ("Smart passes per 90", 1), ("Long passes per 90", 2), ("Aerial duels won, %", 3), ("Defensive duels won, %", 2), ("Head goals per 90", 1), ("Progressive passes per 90", 1)],
 "ZE":  [("xG per 90", 2), ("Shots per 90", 1), ("Long passes per 90", 2), ("Progressive passes per 90", 2), ("Aerial duels won, %", 3), ("Head goals per 90", 1), ("Defensive duels won, %", 1)],
 "VOL": [("Aerial duels won, %", 3), ("Progressive runs per 90", 2), ("Defensive duels won, %", 2), ("PAdj Interceptions", 2), ("Progressive passes per 90", 2), ("Successful defensive actions per 90", 1)],
 "MED": [("xA per 90", 2), ("Key passes per 90", 2), ("Crosses per 90", 1), ("Passes to penalty area per 90", 2), ("Progressive passes per 90", 2), ("Defensive duels won, %", 2)],
 "MEI": [("xA per 90", 2), ("Key passes per 90", 2), ("Touches in box per 90", 2), ("Passes to penalty area per 90", 2), ("Corners per 90", 1), ("Free kicks per 90", 1), ("Progressive runs per 90", 1)],
 "ED":  [("Defensive duels won, %", 3), ("Key passes per 90", 2), ("Crosses per 90", 2), ("Touches in box per 90", 1), ("Progressive runs per 90", 2), ("Successful defensive actions per 90", 1)],
 "EE":  [("xG per 90", 3), ("Touches in box per 90", 2), ("Fouls suffered per 90", 1), ("Progressive runs per 90", 2), ("Shots per 90", 1), ("Key passes per 90", 1)],
 "CA":  [("Accelerations per 90", 2), ("Touches in box per 90", 3), ("xG per 90", 3), ("Head goals per 90", 1), ("Aerial duels won, %", 2), ("Shots per 90", 1)],
}
PT = {"Prevented goals per 90": "Golos expectáveis defendidos por 90´", "Save rate, %": "Defesas, %", "Exits per 90": "Saídas/90", "Accurate passes, %": "Passes certos, %",
      "Long passes per 90": "Passes longos/90", "Crosses per 90": "Cruzamentos/90", "xA per 90": "Assistências esperadas/90", "Defensive duels won, %": "Duelos defensivos ganhos, %",
      "Progressive runs per 90": "Corridas progressivas/90", "Aerial duels won, %": "Duelos aéreos ganhos, %", "xG per 90": "Golos esperados/90", "Touches in box per 90": "Toques na área/90",
      "Key passes per 90": "Passes chave/90", "Smart passes per 90": "Passes inteligentes/90", "Head goals per 90": "Golos de cabeça/90", "Progressive passes per 90": "Passes progressivos/90",
      "Shots per 90": "Remates/90", "PAdj Interceptions": "Interceções ajust. à posse", "Successful defensive actions per 90": "Ações defensivas com êxito/90",
      "Passes to penalty area per 90": "Passes para a área de penálti/90", "Corners per 90": "Cantos/90", "Free kicks per 90": "Livres/90", "Fouls suffered per 90": "Faltas sofridas/90", "Accelerations per 90": "Acelerações/90"}
SULAM = ["Argentina A", "Argentina B", "Uruguai", "Colombia A", "Colombia B", "Chile", "Paraguai", "Peru", "Equador A", "Equador B", "Bolivia", "Venezuela"]
PAIS_SA = {"Brazil", "Argentina", "Uruguay", "Colombia", "Paraguay", "Chile", "Ecuador", "Peru", "Bolivia", "Venezuela"}
ALCANCAVEIS = {"Portugal B", "Portugal C", "Espanha B", "Espanha C", "Italia B", "Italia C", "Alemanha B", "Inglaterra B", "França B", "Belgica B", "Coreia B", "Japao B",
               "Bulgaria", "Romenia", "Polonia", "Eslovaquia", "Servia", "Hungria", "Tcheca", "Bahrain", "Israel", "Grecia", "Suecia", "Noruega", "Dinamarca", "Croacia", "Escocia", "Austria", "Suiça", "China", "Marrocos", "EUA", "Mexico"}
# Conversão de liga (B6-5, revista no B12): quem chega de fora guarda pouco do destaque da origem.
# Em vez de um desconto fixo, a reta ajustada nos 210 pares origem -> Série B (percentil na
# origem -> percentil na B), com a inclinação encolhida para 0,3 (n pequeno fora do Brasil):
#   Série A (n=115): 48 + 0,28·p   (p90 -> 73, p50 -> 62)
#   fora do Brasil (n=47): 31 + 0,30·p   (p90 -> 58, p50 -> 46)
CONVERSAO = {"Série B": (0.0, 1.0), "Série A": (48.0, 0.28), "Sul-americano": (31.0, 0.30), "Exterior": (31.0, 0.30)}
def converter(mercado, ader):
    a, b = CONVERSAO.get(mercado, (0.0, 1.0)); return a + b * ader

SHIFT = {"Direct free kicks per 90": "Free kicks per 90", "Direct free kicks on target, %": "Direct free kicks per 90", "Corners per 90": "Direct free kicks on target, %",
         "Penalties taken": "Corners per 90", "Penalty conversion, %": "Penalties taken", "Conversão de penaltis, %": "Penalty conversion, %"}
def corrigir_shift(d):
    """Nos exports em inglês (ligas de fora) as colunas de bola parada estão deslocadas uma casa:
    a coluna 'Free kicks per 90' vem vazia e cada valor está na coluna seguinte. Conferido em 22/09 (Garro, Arrascaeta)."""
    if "Free kicks per 90" in d and d["Free kicks per 90"].isna().mean() > 0.9:
        d = d.drop(columns=["Free kicks per 90"]).rename(columns=SHIFT)
    return d

def pos11(p): return POS11.get(str(p).split(",")[0].strip(), "Outro")

def aderir(df, liga_col="liga"):
    df = df[df.minutos >= 900].copy()
    # percentil dentro de liga × posição; quando a liga tem menos de 10 jogadores na posição (Coreia B,
    # Bahrain…), o percentil sai todo 100 — nesses casos o percentil é dentro do mercado × posição
    grp = df["mercado"] if "mercado" in df.columns else pd.Series("Série B", index=df.index)
    n_lp = df.groupby([liga_col, "pos11"])["pos11"].transform("size")
    for en, _ in {x for v in FICHA.values() for x in v}:
        if en in df.columns:
            p_liga = df.groupby([liga_col, "pos11"])[en].rank(pct=True).mul(100)
            p_merc = df.groupby([grp, df["pos11"]])[en].rank(pct=True).mul(100)
            df[en + "_pct"] = np.where(n_lp >= 10, p_liga, p_merc)
    ad = []
    for _, r in df.iterrows():
        f = FICHA.get(r.pos11); 
        if not f: ad.append(np.nan); continue
        vals = [(r.get(en + "_pct"), w) for en, w in f if pd.notna(r.get(en + "_pct"))]
        ad.append(sum(v * w for v, w in vals) / sum(w for _, w in vals) if vals else np.nan)
    df["aderencia"] = np.round(ad, 1)
    df["criterios_com_dado"] = [sum(pd.notna(r.get(en + "_pct")) for en, _ in FICHA.get(r.pos11, [])) for _, r in df.iterrows()]
    return df

def serie_b():
    t = tecnico(); t = t[t.ano == 2026].copy(); t["pos11"] = t.posicao.map(pos11)
    t = t.rename(columns={v: k for k, v in PT.items()})
    t["liga"] = "Série B"; t["mercado"] = "Série B"
    t["nascido_em"] = t["Naturalidade"]; t["passaporte"] = t["País de nacionalidade"]; t["valor"] = t["Valor de mercado"]; t["contrato"] = t["Contrato termina"]
    t = t.rename(columns={"jogador": "jogador", "clube": "clube"})
    t = aderir(t)
    # regularidade: 2025 também com >= 900 min na B
    t25 = tecnico(); t25 = t25[(t25.ano == 2025) & (t25.minutos >= 900)][["chave", "idade"]].assign(idade=lambda d: d.idade + 1, rodou_2025=True)
    t = t.merge(t25.drop_duplicates(), on=["chave", "idade"], how="left"); t["rodou_2025"] = t.rodou_2025.fillna(False)
    # físico 2026
    b = pd.read_csv(os.path.join(RES, "b1", "base_fisico.csv")); b = b[b.ano == 2026][["clube", "jogador", "psv99", "expl_accel_sprint_p90", "runs_penalty_area_p30tip", "sprint_count_p90", "matches"]]
    t = t.merge(b, on=["clube", "jogador"], how="left")
    t["psv_ok"] = np.where(t.psv99.isna(), "sem dado", np.where(t.psv99 >= 27, "sim", "NÃO"))
    return t

def ligas():
    rows = []
    for f in sorted(glob.glob(os.path.join(BASES, "wyscout_ligas", "xlsx_ago26", "*.xlsx"))):
        liga = os.path.basename(f).split("_", 1)[1].replace(".xlsx", "")
        if liga in ("Brasil B", "Brasil C", "Argentina RESERVAS"): continue
        d = corrigir_shift(pd.read_excel(f)); d["liga"] = liga; rows.append(d)
    d = pd.concat(rows, ignore_index=True)
    d = d.rename(columns={"Player": "jogador", "Team within selected timeframe": "clube", "Age": "idade", "Minutes played": "minutos", "Contract expires": "contrato", "Market value": "valor", "Birth country": "nascido_em", "Passport country": "passaporte"})
    d["clube"] = d.clube.fillna(d.Team); d["pos11"] = d.Position.map(pos11)
    d["mercado"] = np.where(d.liga == "Brasil A", "Série A", np.where(d.liga.isin(SULAM), "Sul-americano", "Exterior"))
    d["sul_americano"] = d.nascido_em.isin(PAIS_SA) | d.passaporte.fillna("").apply(lambda s: any(p in s for p in PAIS_SA))
    d["ocupa_vaga_estrangeiro"] = ~(d.nascido_em.eq("Brazil") | d.passaporte.fillna("").str.contains("Brazil"))
    return aderir(d)

def ranking():
    """Ranking do Portal (ago/26): nível do jogador contra a referência mundial da posição, 0-100, 18.460 jogadores."""
    import json
    r = pd.DataFrame(json.load(open(os.path.join(BASES, "wyscout_ligas", "rankings_ago26.json"))))
    r["chave"] = r.Player.map(chave); r["liga"] = r.league.replace({"Brasil B": "Série B"})
    r = r.rename(columns={"overall": "nivel_overall", "rank": "rank_na_liga", "overall_bola_parada": "nivel_bola_parada", "phy_score": "nivel_fisico", "overall_offensive": "nivel_ofensivo", "overall_deffensive": "nivel_defensivo", "overall_pass": "nivel_passe"})
    PG = {"Goleiro": "GOL", "Lateral Direito": "LD", "Lateral Esquerdo": "LE", "Zagueiro - Direita": "ZD", "Zagueiro - Esquerda": "ZE", "Volante": "VOL", "Medio": "MED", "Meia": "MEI", "Extremo - Direita": "ED", "Extremo - Esquerda": "EE", "Atacante": "CA"}
    r["pos11"] = r.position_group_pt.map(PG); r["idade"] = r.Age
    r = r[~r.duplicated(["chave", "liga", "pos11", "idade"], keep=False)]
    return r[["chave", "liga", "pos11", "idade", "nivel_overall", "rank_na_liga", "nivel_ofensivo", "nivel_defensivo", "nivel_passe", "nivel_bola_parada", "nivel_fisico"]]

IDADE_MAX = 35

def padj(d):
    """Duelos ajustados à posse (B9). Fora da Série B não há posse do time: estimativa pela fatia de passes do
    clube na liga (passes/90 do elenco ponderados por minutos ÷ média da liga × 50)."""
    pp = pd.to_numeric(d.get("Passes per 90", d.get("Passes/90")), errors="coerce")
    mn = pd.to_numeric(d.minutos, errors="coerce").fillna(0)
    g = pd.DataFrame({"liga": d.liga, "clube": d.clube, "w": pp * mn, "m": mn})
    t = g.groupby(["liga", "clube"]).agg(w=("w", "sum"), m=("m", "sum")); t["p90"] = t.w / t.m.replace(0, np.nan)
    t["posse_est"] = (50 * t.p90 / t.groupby("liga").p90.transform("mean")).clip(30, 70)
    d["posse_est"] = d.set_index(["liga", "clube"]).index.map(t.posse_est).values
    dd = pd.to_numeric(d.get("Defensive duels per 90", d.get("Duelos defensivos/90")), errors="coerce")
    ae = pd.to_numeric(d.get("Aerial duels per 90", d.get("Duelos aéreos/90")), errors="coerce")
    do = pd.to_numeric(d.get("Offensive duels per 90", d.get("Duelos ofensivos/90")), errors="coerce")
    d["Duelos def/90 PAdj"] = (dd * 50 / (100 - d.posse_est)).round(2)
    d["Aéreos/90 PAdj"] = (ae * 50 / (100 - d.posse_est)).round(2)
    d["Duelos of/90 PAdj"] = (do * 50 / d.posse_est).round(2)

def main():
    out = os.path.join(RAIZ, "listas"); os.makedirs(out, exist_ok=True)
    global FORA
    FORA = excluidos()
    sb = serie_b(); lg = ligas(); rk = ranking()
    if "chave" not in sb: sb["chave"] = sb.jogador.map(chave)
    lg["chave"] = lg.jogador.map(chave)
    sb["idade"] = sb.idade.astype(float); lg["idade"] = lg.idade.astype(float)
    sb = sb.merge(rk, on=["chave", "liga", "pos11", "idade"], how="left"); lg = lg.merge(rk, on=["chave", "liga", "pos11", "idade"], how="left")
    print("nível casado: Série B", sb.nivel_overall.notna().mean().round(2), "| ligas", lg.nivel_overall.notna().mean().round(2))
    lg["aderencia_ajustada"] = np.array([converter(m, a) for m, a in zip(lg.mercado, lg.aderencia)]).clip(0, 100).round(1)
    sb["aderencia_ajustada"] = sb.aderencia
    for d in (sb, lg):
        # sem nível do ranking, entra a mediana do nível na mesma liga × posição (não a própria
        # aderência, que puxava a nota para cima de quem tem as duas partes)
        med = d.groupby(["liga", "pos11"]).nivel_overall.transform("median").fillna(d.nivel_overall.median())
        d["nota"] = ((d.aderencia_ajustada + d.nivel_overall.fillna(med)) / 2).round(1)
        d["nota_completa"] = d.nivel_overall.notna()   # False = nível imputado pela mediana da liga × posição: nota parcial
        padj(d)
    cols = ["mercado", "liga", "pos11", "jogador", "clube", "idade", "minutos", "contrato", "valor", "nascido_em", "passaporte", "aderencia", "aderencia_ajustada", "nivel_overall", "rank_na_liga", "nota", "nota_completa", "nivel_bola_parada", "nivel_fisico", "criterios_com_dado", "posse_est", "Duelos def/90 PAdj", "Aéreos/90 PAdj", "Duelos of/90 PAdj"]
    sbc = sb[cols + ["fatia", "rodou_2025", "psv99", "psv_ok", "expl_accel_sprint_p90", "runs_penalty_area_p30tip", "Corners per 90", "Free kicks per 90", "Head goals per 90", "Aerial duels won, %"]].copy()
    def vencido(c):
        # contrato que já acabou na data do dado (ago/26): renovou ou está livre — a confirmar
        s = pd.to_datetime(c, errors="coerce"); return s.notna() & (s < pd.Timestamp("2026-08-01"))
    def livre(c):
        s = pd.to_datetime(c, errors="coerce"); return s.isna() | (s <= pd.Timestamp("2027-06-30"))
    sbc["livre_2027"] = livre(sbc.contrato); sbc["contrato_vencido"] = vencido(sbc.contrato)
    lgc = lg[cols + ["sul_americano", "ocupa_vaga_estrangeiro", "On loan"]].copy(); lgc["livre_2027"] = livre(lgc.contrato); lgc["contrato_vencido"] = vencido(lgc.contrato)
    def top(df, n=12, filtro=None, teto_valor=None):
        d = df if filtro is None else df[filtro]
        d = d[[not FORA(j, c) for j, c in zip(d.jogador, d.clube)]]   # listas/EXCLUIDOS.csv
        d = d[~caro(d)]   # valor > € 2 MM (Wyscout, ou Transfermarkt quando o Wyscout não tem): inalcançável
        d = d[((d.idade <= IDADE_MAX) | ((d.pos11 == "GOL") & (d.idade <= 37))) & (d.criterios_com_dado >= 3) & (d.pos11 != "Outro")]   # idade não rende nem custa ponto (B5-3): teto alto, idade fica como coluna
        if teto_valor is not None:
            v = d.valor.fillna(0)
            d = d[((v > 0) & (v <= teto_valor)) | ((v == 0) & d.liga.isin(ALCANCAVEIS | set(SULAM) | {"Brasil A"}))]
        d = d.assign(nivel=np.where(d.idade <= 23, "N2 jovem", np.where(d.idade >= 26, "N1", "N1/N2")))
        d["ordem"] = d.pos11.map({p: i for i, p in enumerate(ORDEM)})
        return d.sort_values(["ordem", "nota"], ascending=[True, False]).groupby("pos11").head(n).drop(columns="ordem")
    l1 = top(sbc, 15); l1a = top(lgc[lgc.mercado == "Série A"], 8, teto_valor=3_000_000)
    l2 = top(lgc[lgc.mercado == "Sul-americano"], 12, teto_valor=2_000_000)
    l3 = top(lgc[(lgc.mercado == "Exterior") & lgc.sul_americano], 12, teto_valor=2_000_000)
    l4 = top(lgc[(lgc.mercado == "Exterior") & ~lgc.sul_americano], 10, teto_valor=1_500_000)
    ficha = pd.DataFrame([dict(posicao=p, indicador=en, peso=w) for p, v in FICHA.items() for en, w in v])
    with pd.ExcelWriter(os.path.join(out, "listas_2027.xlsx")) as w:
        ficha.to_excel(w, "ficha_por_posicao", index=False)
        l1.round(1).to_excel(w, "1_serie_B", index=False); l1a.round(1).to_excel(w, "1b_serie_A", index=False)
        l2.round(1).to_excel(w, "2_sul_americanas", index=False); l3.round(1).to_excel(w, "3_sulam_no_exterior", index=False); l4.round(1).to_excel(w, "4_outras_ligas", index=False)
        sbc.round(1).to_excel(w, "base_serie_B_2026", index=False)
    # base inteira dos brasileiros e sul-americanos no exterior (sem filtro de nota): serve para
    # cruzar com a minutagem da temporada europeia atual (quem joga pouco = empréstimo)
    lgc[(lgc.mercado == "Exterior") & lgc.sul_americano].round(1).to_csv(os.path.join(out, "base_sulam_exterior.csv"), index=False)
    lgc[lgc.mercado == "Sul-americano"].round(1).to_csv(os.path.join(out, "base_sul_americanas.csv"), index=False)
    for nome, d in (("1_serie_B", l1), ("1b_serie_A", l1a), ("2_sul_americanas", l2), ("3_sulam_no_exterior", l3), ("4_outras_ligas", l4)):
        d.to_csv(os.path.join(out, nome + ".csv"), index=False)
    print("Série B 2026 elegíveis:", len(sbc), "| A:", (lgc.mercado == "Série A").sum(), "| SA:", (lgc.mercado == "Sul-americano").sum(), "| SA no exterior:", ((lgc.mercado == "Exterior") & lgc.sul_americano).sum(), "| outras:", ((lgc.mercado == "Exterior") & ~lgc.sul_americano).sum())
    pd.set_option("display.width", 250)
    for nome, d in (("SÉRIE B", l1), ("SÉRIE A", l1a), ("SUL-AMERICANAS", l2), ("SUL-AM. NO EXTERIOR", l3), ("OUTRAS LIGAS", l4)):
        print(f"\n===== {nome}: top 3 por posição")
        print(d.groupby("pos11", sort=False).head(3)[["pos11", "jogador", "clube", "liga", "idade", "minutos", "contrato", "aderencia_ajustada", "nivel_overall", "nota", "nivel"] + (["psv_ok", "rodou_2025", "livre_2027"] if "psv_ok" in d else ["ocupa_vaga_estrangeiro", "livre_2027"])].to_string(index=False))

if __name__ == "__main__":
    main()
