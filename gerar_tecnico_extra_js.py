#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Escreve static/tecnico_extra_dados.js — o técnico completo (os indicadores da aba Subida) de quem joga numa liga que a
base do estudo NÃO tem (a Série C, para começar: Eurico e os do Santa Cruz). Pedido do Henrique, 18/10/2026.

Lê os Excels do Wyscout do período atual (Portal Ranking/dados/ago26, aba BASE), só das ligas que faltam em
static/subida_dados.js, qualquer minutagem. Chave = primaryKey do app ("Jogador - Time - Liga"). Serve só para a ficha
e para a seta do card (subida.js); a lista do Mercado e o Estudo continuam com a base de sempre."""
import json, os, re, sys
import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, AQUI)
from gerar_subida_js import EN, BLOCOS   # noqa: E402
CAND = ["/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/fut/BOTA/Analytics/Portal Ranking",
        os.path.expanduser("~/mnt/Analytics/Portal Ranking")]
PERIODO = "ago26"

def ligas_da_subida():
    s = open(os.path.join(AQUI, "static", "subida_dados.js"), encoding="utf-8").read()
    D = json.loads(s[s.index("{"):s.rindex("}") + 1]); ls = set()
    for p in D["ordem"]:
        for r in D["posicoes"][p]["jog"]: ls.add(r[3])
    return ls, [i["rot"] for i in D["inds"] if i["cat"] != "fis"]

def main():
    base = next(b for b in CAND if os.path.isdir(b)); d = os.path.join(base, "dados", PERIODO)
    tem, rots = ligas_da_subida()
    pt = {rot: col for _, _, defs in BLOCOS for rot, col, *_ in defs}   # rótulo do app -> coluna PT -> EN
    out = {}
    for arq in sorted(os.listdir(d)):
        if not arq.endswith(".xlsx") or arq.startswith("~$"): continue
        liga = re.sub(r"^\d{2}-\d{2}-\d{4}_", "", os.path.splitext(arq)[0]).strip()
        if liga in tem: continue
        df = pd.read_excel(os.path.join(d, arq), sheet_name="BASE")
        ct = "Team within selected timeframe" if "Team within selected timeframe" in df.columns else "Team"
        cols = [EN.get(pt.get(r, ""), "") for r in rots]
        n0 = len(out)
        for _, r in df.iterrows():
            nome = r.get("Player")
            if not isinstance(nome, str): continue
            vals = []
            for c in cols:
                v = r.get(c) if c in df.columns else None
                try: v = round(float(v), 3)
                except (TypeError, ValueError): v = None
                vals.append(None if v is None or v != v else v)
            out[f"{nome.strip()} - {str(r.get(ct) or '').strip()} - {liga}"] = vals
        print(f"  {liga}: {len(out) - n0} jogadores")
    with open(os.path.join(AQUI, "static", "tecnico_extra_dados.js"), "w", encoding="utf-8") as fh:
        fh.write("/* GERADO POR gerar_tecnico_extra_js.py - NAO EDITE A MAO. Técnico completo de quem joga em liga fora da base do estudo (Série C). */\n")
        fh.write("window.TEC_EXTRA = " + json.dumps({"periodo": PERIODO, "rots": rots, "jog": out}, ensure_ascii=False, separators=(",", ":")) + ";\n")

if __name__ == "__main__":
    main()
