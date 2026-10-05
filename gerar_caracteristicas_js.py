#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Escreve static/caracteristicas_dados.js — a aba "Característica por posição".

Para cada posição, o que separa o titular de quem SOBE do de quem CAI na Série B 2022–2025
(temporadas fechadas), em três leituras:
  - mediana do indicador em cada faixa (Sobe / Meio / Cai);
  - separação = média do z-score (dentro do ano) de quem sobe menos a de quem cai, em desvios-padrão.
    O z é dentro do ano porque o Wyscout mudou critérios no período (duelos/90 caiu de 18 para 13);
  - tipo físico (centróides do F2) por faixa.
Fontes: bases/serieb_tecnico.csv (Wyscout), resultados/b1/perfis/jogadores.csv (SkillCorner),
resultados/b2/time_indicadores.csv (faixa do clube na temporada).
Rodar de novo quando o estudo mudar:  python3 gerar_caracteristicas_js.py
"""
import datetime, json, math, os, sys, warnings
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")
AQUI = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.join(AQUI, "Santa Cruz V2")
sys.path.insert(0, os.path.join(V2, "scripts"))
from _comum import tecnico, RES          # noqa: E402
from listas import pos11                 # noqa: E402
from ranking_fisico import tipo_centroide  # noqa: E402

SAIDA = os.path.join(AQUI, "static", "caracteristicas_dados.js")
MIN = 900
ANOS = (2022, 2023, 2024, 2025)
POS = [("GOL", "Goleiro"), ("LD", "Lateral direito"), ("ZD", "Zagueiro direito"), ("ZE", "Zagueiro esquerdo"),
       ("LE", "Lateral esquerdo"), ("VOL", "Volante"), ("MED", "Médio"), ("MEI", "Meia"),
       ("ED", "Extremo direito"), ("EE", "Extremo esquerdo"), ("CA", "Centroavante")]
SETOR = {"ZD": "Zaga", "ZE": "Zaga", "LD": "Lateral", "LE": "Lateral", "VOL": "Volante", "MED": "Meia", "MEI": "Meia",
         "ED": "Extremo", "EE": "Extremo", "CA": "Atacante"}

# (rótulo, coluna, casas, "menor é melhor")
FISICO = [("Velocidade máxima (PSV-99, km/h)", "psv99", 1, False), ("Sprints por 90", "sprint_count_p90", 1, False),
          ("Arrancadas explosivas por 90", "expl_accel_sprint_p90", 2, False),
          ("Ações de alta intensidade por 90", "hi_count_p90", 0, False), ("Acelerações fortes por 90", "high_accel_p90", 1, False),
          ("Distância por 90 (m)", "distance_p90", 0, False), ("Corridas sem bola por 30 min de posse", "runs_p30tip", 1, False),
          ("Corridas para a área por 30 min de posse", "runs_penalty_area_p30tip", 2, False)]
PASSE = [("Passes por 90", "Passes/90", 1, False), ("Passes certos %", "Passes certos, %", 1, False),
         ("Passes para frente por 90", "Passes para a frente/90", 1, False), ("Passes para frente certos %", "Passes para a frente certos, %", 1, False),
         ("Passes progressivos por 90", "Passes progressivos/90", 1, False), ("Passes progressivos certos %", "Passes progressivos certos, %", 1, False),
         ("Passes ao terço final por 90", "Passes para terço final/90", 1, False), ("Passes ao terço final certos %", "Passes certos para terço final, %", 1, False),
         ("Passes longos por 90", "Passes longos/90", 1, False), ("Passes longos certos %", "Passes longos certos, %", 1, False),
         ("Passes recebidos por 90", "Passes recebidos/90", 1, False), ("Conduções progressivas por 90", "Corridas progressivas/90", 2, False)]
ATAQUE = [("Gols por 90", "Golos/90", 2, False), ("xG por 90", "Golos esperados/90", 2, False), ("Finalizações por 90", "Remates/90", 2, False),
          ("Finalizações no gol %", "Remates à baliza, %", 1, False), ("Toques na área por 90", "Toques na área/90", 2, False),
          ("Gols de cabeça por 90", "Golos de cabeça/90", 2, False),
          ("Assistências por 90", "Assistências/90", 2, False), ("xA por 90", "Assistências esperadas/90", 2, False),
          ("Passes-chave por 90", "Passes chave/90", 2, False), ("Passes para a área por 90", "Passes para a área de penálti/90", 2, False),
          ("Cruzamentos por 90", "Cruzamentos/90", 2, False), ("Cruzamentos certos %", "Cruzamentos certos, %", 1, False),
          ("Dribles por 90", "Dribles/90", 2, False), ("Dribles certos %", "Dribles com sucesso, %", 1, False),
          ("Duelos ofensivos ganhos %", "Duelos ofensivos ganhos, %", 1, False), ("Faltas sofridas por 90", "Faltas sofridas/90", 2, False)]
DEFESA = [("Duelos por 90", "Duelos/90", 1, False), ("Duelos ganhos %", "Duelos ganhos, %", 1, False),
          ("Duelos defensivos por 90", "Duelos defensivos/90", 1, False), ("Duelos defensivos ganhos %", "Duelos defensivos ganhos, %", 1, False),
          ("Duelos aéreos por 90", "Duelos aéreos/90", 1, False), ("Duelos aéreos ganhos %", "Duelos aéreos ganhos, %", 1, False),
          ("Ações defensivas certas por 90", "Ações defensivas com êxito/90", 1, False),
          ("Interceptações (ajustadas à posse)", "Interceções ajust. à posse", 1, False),
          ("Carrinhos (ajustados à posse)", "Cortes de carrinho ajust. à posse", 2, False),
          ("Finalizações bloqueadas por 90", "Remates intercetados/90", 2, False),
          ("Faltas por 90", "Faltas/90", 2, True), ("Cartões amarelos por 90", "Cartões amarelos/90", 2, True)]
GOLEIRO = [("Defesas %", "Defesas, %", 1, False), ("Gols sofridos por 90", "Golos sofridos/90", 2, True),
           ("xG sofrido por 90", "Golos sofridos esperados/90", 2, True), ("Gols evitados por 90", "Golos expectáveis defendidos por 90´", 2, False),
           ("Finalizações sofridas por 90", "Remates sofridos/90", 1, True), ("Saídas por 90", "Saídas/90", 2, False),
           ("Duelos aéreos por 90", "Duelos aéreos GR/90", 2, False),
           ("Passes por 90", "Passes/90", 1, False), ("Passes certos %", "Passes certos, %", 1, False),
           ("Passes longos por 90", "Passes longos/90", 1, False), ("Passes longos certos %", "Passes longos certos, %", 1, False)]
PERFIL = [("Idade", "idade", 0, True), ("Altura (cm)", "Altura", 0, False)]


def num(v, casas=2):
    if v is None or (isinstance(v, float) and (math.isnan(v) or math.isinf(v))): return None
    return round(float(v), casas)


def linhas(df, defs):
    """Mediana por faixa e separação (z dentro do ano, Sobe − Cai e Sobe − Meio)."""
    out = []
    for rot, col, casas, menor in defs:
        if col not in df.columns: continue
        v = pd.to_numeric(df[col], errors="coerce")
        if col == "Altura": v = v.where(v >= 150)
        if v.notna().sum() < 20: continue
        g = v.groupby(df.ano)
        z = (v - g.transform("mean")) / g.transform("std")
        mz = z.groupby(df.faixa).mean()
        # indicador raro (gols, assistências de zagueiro…): a mediana dá 0 para todo mundo — usa a média
        raro = (v.fillna(0) == 0).mean() > 0.3
        med = v.groupby(df.faixa).mean() if raro else v.groupby(df.faixa).median()
        if not {"Sobe", "Cai"} <= set(mz.index): continue
        out.append({"rot": rot, "casas": casas, "menor": menor,
                    "sobe": num(med.get("Sobe"), casas + 1), "meio": num(med.get("Meio"), casas + 1), "cai": num(med.get("Cai"), casas + 1),
                    "d": num(mz["Sobe"] - mz["Cai"]), "dm": num(mz["Sobe"] - mz.get("Meio", np.nan)), **({"media": True} if raro else {})})
    return out


def main():
    ti = pd.read_csv(os.path.join(RES, "b2", "time_indicadores.csv"))[["ano", "clube", "faixa"]]
    T = tecnico(); T["pos11"] = T.posicao.map(pos11)
    T = T[T.ano.isin(ANOS) & (T.minutos >= MIN)].merge(ti, on=["ano", "clube"], how="left"); T = T[T.faixa.notna()]
    F = pd.read_csv(os.path.join(RES, "b1", "perfis", "jogadores.csv"))
    F = F[F.ano.isin(ANOS) & (F.minutos >= MIN) & F.psv99.notna() & F.faixa.notna()].copy()
    pf = pd.read_csv(os.path.join(RES, "b8", "tipos_preferidos_pos.csv")).fillna("")
    PREF = {r.pos11: [x.strip() for x in r.preferidos.split("/") if x.strip()] for r in pf.itertuples()}
    CAI = {r.pos11: [x.strip() for x in r.de_quem_cai.split("/") if x.strip()] for r in pf.itertuples()}
    arq = os.path.join(V2, "listas", "PREFERENCIAS_CLUBE.csv")
    clube_pref = {}
    if os.path.exists(arq):
        for r in pd.read_csv(arq).itertuples(): clube_pref[r.pos11] = r.tipo

    posicoes = {}
    for cod, nome in POS:
        t = T[T.pos11 == cod]
        n = {k: int(v) for k, v in t.faixa.value_counts().items()}
        blocos = []
        if cod == "GOL":
            blocos.append({"tit": "Goleiro", "fonte": "Wyscout", "linhas": linhas(t, GOLEIRO)})
        else:
            f = F[F.pos11 == cod].copy()
            lf = linhas(f, FISICO)
            piso = (f.psv99 < 27).groupby(f.faixa).mean() * 100
            if {"Sobe", "Cai"} <= set(piso.index):
                lf.append({"rot": "Abaixo do piso de 27 km/h (% dos jogadores)", "casas": 0, "menor": True, "pct": True,
                           "sobe": num(piso.get("Sobe"), 0), "meio": num(piso.get("Meio"), 0), "cai": num(piso.get("Cai"), 0), "d": None, "dm": None})
            blocos.append({"tit": "Físico", "fonte": "SkillCorner", "n": {k: int(v) for k, v in f.faixa.value_counts().items()}, "linhas": lf})
            blocos.append({"tit": "Passe e construção", "fonte": "Wyscout", "linhas": linhas(t, PASSE)})
            blocos.append({"tit": "Ataque e criação", "fonte": "Wyscout", "linhas": linhas(t, ATAQUE)})
            blocos.append({"tit": "Defesa e duelos", "fonte": "Wyscout", "linhas": linhas(t, DEFESA)})
        blocos.append({"tit": "Perfil", "fonte": "Wyscout", "linhas": linhas(t, PERFIL)})
        tipos = None
        if cod != "GOL":
            f["setor"] = SETOR[cod]; f["tipo"] = tipo_centroide(f)
            ct = pd.crosstab(f.tipo, f.faixa)
            tipos = {"pref": PREF.get(cod, []), "cai": CAI.get(cod, []), "clube": clube_pref.get(cod),
                     "linhas": [{"tipo": tp, "sobe": int(r.get("Sobe", 0)), "meio": int(r.get("Meio", 0)), "cai": int(r.get("Cai", 0))}
                                for tp, r in ct.iterrows()]}
        posicoes[cod] = {"nome": nome, "n": n, "blocos": blocos, "tipos": tipos}
        print(f"  {cod}: {n} · {sum(len(b['linhas']) for b in blocos)} indicadores")

    dados = {"gerado_em": datetime.date.today().isoformat(), "anos": list(ANOS), "min": MIN,
             "ordem": [c for c, _ in POS], "posicoes": posicoes}
    with open(SAIDA, "w", encoding="utf-8") as fh:
        fh.write("/* GERADO POR gerar_caracteristicas_js.py - NAO EDITE A MAO. */\n")
        fh.write("window.CARACTERISTICAS = " + json.dumps(dados, ensure_ascii=False) + ";\n")
    print(SAIDA)


if __name__ == "__main__":
    main()
