#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""27/11/2026 — técnico do app no recorte de NOVEMBRO, sem trocar a chave de ninguém (varredura do app; pedido do Henrique: "trocar o recorte").

A base do app (dados/jogadores.json) é o cadastro de ago26: a chave de cada jogador (nome - clube - liga) é o que liga o campograma, os
grupos e os dados colados. Reconstruir a base em outro recorte trocaria a chave de quem mudou de clube. Por isso este script ATUALIZA NO
LUGAR quem ele acha no recorte nov26 sem filtro de minutos (Portal Ranking/dados/nov26/_pre_filtro; Série C do out26):
  - casa por nome + clube da temporada (ou clube atual) + liga; se o clube mudou dentro da liga, só quando há UM jogador com aquele nome
    na liga dos dois lados e a idade bate (±1);
  - só troca quando o recorte novo tem tantos minutos ou mais que o da base (liga de temporada cruzada: o nov26 já é a 26/27, com menos
    jogos — lá fica a 25/26 completa) e 300 minutos ou mais;
  - grava os 40 indicadores técnicos do estudo direto das colunas do Wyscout em static/tecnico_atual_dados.js (window.TEC_ATUAL, chave =
    chave do app), que a ficha e a seta leem ANTES da base do estudo, dos indicadores do ranking e do técnico extra (o técnico colado
    continua valendo por cima de tudo);
  - atualiza minutos, jogos e idade no dados/jogadores.json (campo tec_rec = recorte usado) e as linhas de static/subida_dados.js
    (Mercado), sem mexer no físico nem na régua.
Japão (a base tinha 2 jogos) e Dinamarca (uma fase de 7 jogos) entram pela mesma regra.

Uso: python3 atualizar_tecnico_nov26.py <ref_nov26_completo.csv.gz>   (sai de Santa Cruz V2/auditoria_app/r3_nov26_completo.py)"""
import datetime, json, os, re, sys, unicodedata
from collections import defaultdict
import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
MIN_NOVO = 300


def num(v, casas=3):
    try: x = float(v)
    except (TypeError, ValueError): return None
    return None if x != x else round(x, casas)


def sem(s): return re.sub(r"\s+", " ", unicodedata.normalize("NFD", str(s or "").lower()).encode("ascii", "ignore").decode()).strip()


def ler_js(p, var):
    s = open(p, encoding="utf-8").read(); i = s.index("window." + var); a = s.index("{", i); return s[:a], json.loads(s[a:s.rindex("}") + 1])


def main(arq_nov):
    N = pd.read_csv(arq_nov, low_memory=False)
    # rótulo do app -> coluna do Wyscout em inglês (as mesmas tabelas do gerar_caracteristicas_js.py e do gerar_subida_js.py)
    src = open(os.path.join(AQUI, "gerar_subida_js.py"), encoding="utf-8").read(); EN = eval(src[src.index("EN = {") + 5:src.index("}", src.index("EN = {")) + 1])
    car = open(os.path.join(AQUI, "gerar_caracteristicas_js.py"), encoding="utf-8").read(); PT = {}
    for bloco in ("PASSE", "ATAQUE", "DEFESA"):
        i = car.index("\n" + bloco + " = ["); lst = eval(car[i + len(bloco) + 4:car.index("]\n", i) + 1])
        for rot, col, *_ in lst: PT[rot] = col
    pre, S = ler_js(os.path.join(AQUI, "static", "subida_dados.js"), "SUBIDA")
    rots = [i["rot"] for i in S["inds"] if i["cat"] != "fis"]; kk = [i["k"] for i in S["inds"] if i["cat"] != "fis"]; NC = len(S["campos"])
    cols = [EN[PT[r]] for r in rots]; falta = [c for c in cols if c not in N.columns]; assert not falta, falta
    base = json.load(open(os.path.join(AQUI, "dados", "jogadores.json"), encoding="utf-8")); J = base["jogadores"]
    recs = N.to_dict("records")
    por_tw, por_at, por_nl = defaultdict(list), defaultdict(list), defaultdict(list)
    for r in recs:
        n = r.get("Player")
        if not isinstance(n, str): continue
        n = n.strip(); tw = str(r.get("Team within selected timeframe") or "").strip(); at = str(r.get("Team") or "").strip()
        por_tw[(n, tw, r["liga"])].append(r); por_at[(n, at, r["liga"])].append(r); por_nl[(n, r["liga"])].append(r)
    nb = defaultdict(int)
    for j in J: nb[(j["n"], j.get("l", ""))] += 1
    jog, meta, achou = {}, {}, {}
    cont = defaultdict(int)
    for j in J:
        pk = f"{j['n']} - {j.get('t', '')} - {j.get('l', '')}"; l = j.get("l", "")
        c = por_tw.get((j["n"], j.get("t", ""), l)) or por_at.get((j["n"], j.get("t", ""), l)) or []
        if not c:
            c = por_nl.get((j["n"], l)) or []
            ok = len(c) == 1 and nb[(j["n"], l)] == 1 and j.get("id_") is not None and num(c[0].get("Age")) is not None and abs(num(c[0].get("Age")) - j["id_"]) <= 1
            c = c if ok else []
        if len(c) != 1: cont["sem par no recorte novo"] += 1; continue
        r = c[0]; mn = num(r.get("Minutes played"), 0) or 0; jn = num(r.get("Matches played"), 0) or 0
        if mn < MIN_NOVO: cont["menos de 300 min no recorte novo"] += 1; continue
        if mn < (j.get("min") or 0) or (j.get("rk_ok") and jn < (j.get("jog") or 0)): cont["recorte novo com menos jogo (temporada nova)"] += 1; continue
        vals = [num(r.get(c_)) for c_ in cols]
        if sum(v is not None for v in vals) < 20: cont["linha sem indicadores"] += 1; continue
        jog[pk] = vals; meta[pk] = [int(mn), int(jn), r["pasta"]]; achou[pk] = r
        cont["atualizado" + (" (não tinha técnico)" if not j.get("rk_ok") else "")] += 1
        j["min"] = int(mn); j["jog"] = int(jn); j["tec_rec"] = r["pasta"]
        if num(r.get("Age"), 0): j["id_"] = int(num(r.get("Age"), 0))
        if not j.get("pw") and isinstance(r.get("Position"), str): j["pw"] = r["Position"]
    json.dump(base, open(os.path.join(AQUI, "dados", "jogadores.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    hoje = datetime.date.today().isoformat()
    for d in ("static", os.path.join("docs", "static")):
        with open(os.path.join(AQUI, d, "tecnico_atual_dados.js"), "w", encoding="utf-8") as fh:
            fh.write("/* GERADO POR atualizar_tecnico_nov26.py - NAO EDITE A MAO. Técnico do recorte nov26 do Wyscout (Série C: out26) para quem a base do app tinha com menos jogos. */\n")
            fh.write("window.TEC_ATUAL = " + json.dumps({"periodo": "nov26", "gerado_em": hoje, "rots": rots, "jog": jog, "meta": meta}, ensure_ascii=False, separators=(",", ":")) + ";\n")
    # linhas da aba Mercado (subida_dados.js): mesmos valores, no lugar
    por_id = {(j.get("id"), j.get("l")): j for j in J}; por_nome = defaultdict(list)
    for j in J: por_nome[(sem(j["n"]), j.get("l"))].append(j)
    n_lin = 0
    for p in S["ordem"]:
        for r in S["posicoes"][p]["jog"]:
            j = por_id.get((r[10], r[3])) if r[10] not in (None, -1) else None
            if not j:
                c = [x for x in por_nome.get((sem(r[0]), r[3])) or [] if r[4] is None or x.get("id_") is None or abs(r[4] - x["id_"]) <= 1]
                j = c[0] if len(c) == 1 else None
            if not j: continue
            pk = f"{j['n']} - {j.get('t', '')} - {j.get('l', '')}"
            if pk not in jog or meta[pk][0] < (r[7] or 0): continue
            for k, v in zip(kk, jog[pk]):
                if v is not None: r[NC + k] = v
            r[7] = meta[pk][0]; n_lin += 1
    S["tec_recorte"] = "nov26"; S["tec_atualizado_em"] = hoje
    for d in ("static", os.path.join("docs", "static")):
        open(os.path.join(AQUI, d, "subida_dados.js"), "w", encoding="utf-8").write(pre + json.dumps(S, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print(dict(cont)); print("TEC_ATUAL:", len(jog), "jogadores · linhas do Mercado atualizadas:", n_lin, "de", sum(len(S["posicoes"][p]["jog"]) for p in S["ordem"]))
    por_liga = defaultdict(int)
    for pk in jog: por_liga[pk.rsplit(" - ", 1)[-1]] += 1
    print(sorted(por_liga.items(), key=lambda t: -t[1])[:30])


if __name__ == "__main__":
    main(sys.argv[1])
