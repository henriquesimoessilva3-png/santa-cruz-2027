#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Escreve static/bp_jogo_dados.js — gols e assistências de BOLA PARADA jogo a jogo (Sofascore: origem de cada gol pelo mapa de
finalizações; assistência = ele é o assist1 de um gol de escanteio, falta ou lateral). Levantamento de 18/10/2026 para os
jogadores do grupo do campograma (dados/bola_parada_jogo_a_jogo.csv; o lance a lance em dados/bola_parada_lances.csv).
O Wyscout não separa gol nem assistência de bola parada — por isso esta fonte. Chave = primaryKey do card."""
import json, os
import pandas as pd
AQUI = os.path.dirname(os.path.abspath(__file__))
d = pd.read_csv(os.path.join(AQUI, "dados", "bola_parada_jogo_a_jogo.csv"), sep=";", engine="python", on_bad_lines=lambda r: r[:15] + [";".join(r[15:])])
C = {"gols_total": "g", "assist_total": "a", "gols_bp_escanteio": "ge", "gols_bp_falta_direta": "gf", "gols_bp_falta_lateral_ou_lateral": "gl",
     "gols_penalti": "gp", "gols_bp_cabeca": "gc", "assist_bp_escanteio": "ae", "assist_bp_falta": "af", "assist_bp_lateral": "al", "jogos_conferidos": "j"}
out = {}
for r in d.itertuples():
    try: t = str(int(float(str(r.temporada).strip()[:4])))
    except Exception: continue
    if t not in ("2024", "2025", "2026"): continue
    o = {}
    for c, k in C.items():
        v = getattr(r, c, None)
        if v is not None and not pd.isna(v): o[k] = int(v)
    o["obs"] = "" if pd.isna(r.obs) else str(r.obs)
    out.setdefault(r.primaryKey, {})[t] = o
with open(os.path.join(AQUI, "static", "bp_jogo_dados.js"), "w", encoding="utf-8") as fh:
    fh.write("/* GERADO POR gerar_bp_jogo_js.py - NAO EDITE A MAO. Bola parada jogo a jogo (Sofascore), por jogador e temporada. */\n")
    fh.write("window.BP_JOGO = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
print(len(out), "jogadores")
