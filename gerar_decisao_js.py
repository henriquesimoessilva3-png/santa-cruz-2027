#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Escreve static/decisao_dados.js — as referências fixas da aba "Decisão" (07/11/2026):
  - forca: força de cada liga (Portal Ranking/Peso Ligas.xlsx, Inglaterra A = 100), a mesma tabela que o Portal usa;
  - conversao: as retas de conversão de liga do estudo V2 (listas.py, T4);
  - excluidos: listas/EXCLUIDOS.csv (vetados pelo clube);
  - grandes / alcancaveis / sulam / fracas / crivo / teto_valor: as listas do estudo (ideal10.py, top10.py, listas.py, _comum.py).
Rodar de novo quando qualquer uma dessas fontes mudar. Copiar para docs/static/ ao publicar."""
import json, os, sys
import pandas as pd
AQUI = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.join(AQUI, "Santa Cruz V2"); sys.path.insert(0, os.path.join(V2, "scripts"))
import listas as L   # noqa: E402
from top10 import FRACAS, CRIVO   # noqa: E402
from ideal10 import GRANDES   # noqa: E402
from _comum import TETO_VALOR   # noqa: E402
PESO = [os.path.expanduser("~/mnt/Analytics/Portal Ranking/Peso Ligas.xlsx"),
        "/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/fut/BOTA/Analytics/Portal Ranking/Peso Ligas.xlsx"]

def main():
    forca = {}
    p = next((x for x in PESO if os.path.exists(x)), None)
    if p:
        x = pd.read_excel(p)
        for _, r in x.iterrows():
            if pd.notna(r.get("Time")) and pd.notna(r.get("Força")):
                forca[str(r["Time"]).strip()] = round(float(r["Força"]), 1)
    ex = []
    f = os.path.join(V2, "listas", "EXCLUIDOS.csv")
    if os.path.exists(f):
        for r in pd.read_csv(f).fillna("").itertuples():
            ex.append([str(r.jogador).strip(), str(r.clube).strip(), str(r.motivo).strip()])
    out = {"gerado": pd.Timestamp.today().strftime("%Y-%m-%d"), "forca": forca, "forca_fonte": "Portal Ranking/Peso Ligas.xlsx (Inglaterra A = 100)",
           "conversao": {k: list(v) for k, v in L.CONVERSAO.items()}, "excluidos": ex, "grandes": sorted(GRANDES),
           "alcancaveis": sorted(L.ALCANCAVEIS), "sulam": list(L.SULAM), "fracas": sorted(FRACAS), "crivo": CRIVO, "teto_valor": TETO_VALOR,
           "ficha": {k: [[en, w] for en, w in v] for k, v in L.FICHA.items()}}
    dest = os.path.join(AQUI, "static", "decisao_dados.js")
    with open(dest, "w", encoding="utf-8") as fh:
        fh.write("/* GERADO POR gerar_decisao_js.py — NAO EDITE A MAO. Referências fixas da aba Decisão (força das ligas, retas de conversão, vetados). */\n")
        fh.write("window.DECISAO_REF = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print("ok:", len(forca), "ligas ·", len(ex), "vetados ->", dest)

if __name__ == "__main__":
    main()
