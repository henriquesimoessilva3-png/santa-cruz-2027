#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Escreve static/bp_jogadores_dados.js — a aba "Bola parada · jogadores".

Fontes (estudo Santa Cruz V2):
  - Santa Cruz V2/listas/bola_parada_especialistas.xlsx  → os especialistas por mercado
    (cobradores e finalizadores aéreos; scripts/bolaparada_jogadores.py)
  - Santa Cruz V2/bases/coletas/bp_jogador_temporada.csv → produção real em bola parada por
    jogador × temporada na Série B 2022–2026, pelo Sofascore (scripts/b3_bp_jogadores_sofascore.py)
Rodar de novo quando qualquer um dos dois mudar:  python3 gerar_bp_jogadores_js.py
"""
import datetime, json, math, os, sys
import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.join(AQUI, "Santa Cruz V2")
sys.path.insert(0, os.path.join(V2, "scripts"))
from _comum import tecnico, excluidos  # noqa: E402
from listas import pos11     # noqa: E402

SAIDA = os.path.join(AQUI, "static", "bp_jogadores_dados.js")
MERC = [("1_serie_B", "Série B"), ("1b_serie_A", "Série A"), ("2_sul_americanas", "Ligas sul-americanas"),
        ("3_sulam_no_exterio", "Sul-americanos no exterior")]


def limpo(v):
    if v is None or (isinstance(v, float) and math.isnan(v)): return None
    if hasattr(v, "item"): v = v.item()
    if isinstance(v, float): return round(v, 2)
    if isinstance(v, (pd.Timestamp, datetime.date)): return str(v)[:10]
    return v


def main():
    xl = pd.ExcelFile(os.path.join(V2, "listas", "bola_parada_especialistas.xlsx"))
    esp = []
    for chave_m, rot in MERC:
        for tipo in ("cobr", "final"):
            d = xl.parse(f"{chave_m}_{tipo}")
            esp.append({"mercado": rot, "tipo": tipo, "colunas": list(d.columns),
                        "linhas": [[limpo(v) for v in r] for r in d.itertuples(index=False)]})
    bp = pd.read_csv(os.path.join(V2, "bases", "coletas", "bp_jogador_temporada.csv"))
    t = tecnico(); t["pos"] = t.posicao.map(pos11)
    pos = t.drop_duplicates(["ano", "clube", "chave"]).set_index(["ano", "clube", "chave"]).pos.to_dict()
    bp["pos"] = [pos.get((a, c, k)) for a, c, k in zip(bp.ano, bp.clube_wyscout, bp.chave)]
    cols = ["ano", "clube", "sid", "nome", "pos", "finalizacoes_bp", "gols_bp", "gols_bp_cabeca", "gols_escanteio",
            "gols_falta_direta", "gols_penalti", "xg_bp", "assist_bp", "assist_escanteio", "assist_falta"]
    prod = [[limpo(v) for v in r] for r in bp[cols].itertuples(index=False)]
    # GRÁFICO DO COBRADOR: volume (escanteios + faltas cobradas, Wyscout) × assistências de bola
    # parada (Sofascore), Série B 2024–2026, casados por temporada e clube, somados por jogador.
    tt = t[t.ano >= 2024].copy()
    for c in ("Cantos/90", "Livres/90", "minutos"):
        tt[c] = pd.to_numeric(tt[c], errors="coerce").fillna(0)
    tt["cobrancas"] = (tt["Cantos/90"] + tt["Livres/90"]) * tt.minutos / 90
    ass = bp[bp.ano >= 2024].groupby(["ano", "clube_wyscout", "chave"])[["assist_bp", "assist_escanteio", "gols_falta_direta"]].sum()
    tt = tt.join(ass, on=["ano", "clube", "chave"]).fillna({"assist_bp": 0, "assist_escanteio": 0, "gols_falta_direta": 0})
    ult = tt.sort_values(["ano", "minutos"]).groupby("chave").agg(jogador=("jogador", "last"), clube=("clube", "last"), pos=("pos", "last"))
    cb = tt.groupby("chave")[["cobrancas", "assist_bp", "assist_escanteio", "gols_falta_direta"]].sum().join(ult)
    cb = cb[cb.cobrancas >= 60].reset_index()
    fora = excluidos()                          # os nomes vetados pelo clube também saem do gráfico
    cb = cb[[not fora(j, c) for j, c in zip(cb.jogador, cb.clube)]]
    cobr = [[r.jogador, r.clube, r.pos, round(r.cobrancas), int(r.assist_bp), int(r.assist_escanteio), int(r.gols_falta_direta)]
            for r in cb.itertuples()]
    dados = {"gerado": datetime.date.today().isoformat(), "especialistas": esp,
             "cobradores_24_26": {"colunas": ["jogador", "clube", "pos", "cobrancas", "assist_bp", "assist_escanteio", "gols_falta_direta"],
                                  "linhas": cobr},
             "producao": {"colunas": cols, "linhas": prod},
             "excluidos": pd.read_csv(os.path.join(V2, "listas", "EXCLUIDOS.csv")).fillna("")[["jogador", "clube"]].values.tolist(),
             "fonte": "Wyscout (índices, ago/26) e Sofascore (1.810 jogos da Série B 2022–2026)"}
    with open(SAIDA, "w", encoding="utf-8") as f:
        f.write("/* GERADO POR gerar_bp_jogadores_js.py - NAO EDITE A MAO. */\n")
        f.write("window.BP_JOGADORES = " + json.dumps(dados, ensure_ascii=False) + ";\n")
    print(f"{SAIDA}: {sum(len(e['linhas']) for e in esp)} especialistas, {len(prod)} jogador-temporadas")


if __name__ == "__main__":
    main()
