#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Minutos do TIME por temporada, para a minutagem do card (pedido do Henrique, 18/10/2026):
"percentual de minutos dos últimos 3 anos, comparando com o da equipe".

Dos mesmos Excels do Wyscout do historico (Portal Ranking/dados/<periodo>/*.xlsx, aba BASE): para cada
(temporada, liga, time), o minuto do time = os minutos de quem MAIS jogou por aquele time naquela liga
(em geral o goleiro titular = todos os jogos); jogos do time = o maior número de jogos. Só as colunas
Team e Minutes/Matches played — o cabeçalho torto do template novo (últimas sete colunas) não as atinge.

Grava em dados/historico.json, em cada ano de cada jogador: "tmin" (minutos do time) e "tj" (jogos do time).
O preparar_historico.py chama isto no fim, para o campo não se perder quando o histórico é refeito."""
import json, os, re, sys
import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
CANDIDATOS = ["/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/fut/BOTA/Analytics/Portal Ranking",
              os.path.expanduser("~/mnt/Analytics/Portal Ranking")]
TEMPORADAS = [("2024", "2024"), ("2025", "2025"), ("2026", "ago26")]
CACHE = os.path.join(AQUI, "dados", "minutos_time.json")

def liga_do_arquivo(nome):
    return re.sub(r"^\d{2}-\d{2}-\d{4}_", "", os.path.splitext(os.path.basename(nome))[0]).strip()

def ler(base, pasta):
    out = {}
    d = os.path.join(base, "dados", pasta)
    for arq in sorted(os.listdir(d)):
        if not arq.endswith(".xlsx") or arq.startswith("~$"): continue
        try: df = pd.read_excel(os.path.join(d, arq), sheet_name="BASE")
        except Exception as e: print("   !", arq, e); continue
        ct = "Team within selected timeframe" if "Team within selected timeframe" in df.columns else "Team"
        if ct not in df.columns or "Minutes played" not in df.columns: continue
        liga = liga_do_arquivo(arq)
        g = df.groupby(df[ct].astype(str).str.strip()).agg(tmin=("Minutes played", "max"), tj=("Matches played", "max") if "Matches played" in df.columns else ("Minutes played", "size"))
        for tm, r in g.iterrows():
            if tm and tm != "nan": out[liga + "|" + tm] = [int(r.tmin or 0), int(r.tj or 0)]
    return out

def minutos_time(temporadas=None):
    cache = {}
    if os.path.exists(CACHE): cache = json.load(open(CACHE, encoding="utf-8"))
    base = next((b for b in CANDIDATOS if os.path.isdir(b)), None)
    for t, pasta in TEMPORADAS:
        if temporadas and t not in temporadas: continue
        if base is None: break
        print("  minutos do time:", t, "...", flush=True)
        cache[t] = ler(base, pasta)
        json.dump(cache, open(CACHE, "w", encoding="utf-8"), ensure_ascii=False)
    return cache

def aplicar(cache):
    p = os.path.join(AQUI, "dados", "historico.json"); H = json.load(open(p, encoding="utf-8"))
    n = 0
    for anos in H["jogadores"].values():
        for x in anos:
            if not x: continue
            m = cache.get(x.get("t"), {}).get((x.get("l") or "") + "|" + (x.get("tm") or ""))
            if m: x["tmin"], x["tj"] = m; n += 1
    json.dump(H, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("  minutos do time gravados em", n, "temporadas de jogador")

if __name__ == "__main__":
    so = sys.argv[1:] or None
    c = minutos_time(so)
    if not so or "--aplicar" in (so or []) or set(so) >= {"2024", "2025", "2026"}: aplicar(c)
