#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Minutagem do card, 5ª versão (27/11/2026 — varredura do app: caso Anderson Oliveira, Seoul: "2024: 1 jogo", "2026: 18 jogos").

Dois defeitos da 4ª versão, consertados por cima do dados/historico.json (não refaz o histórico, só troca as linhas velhas):

1. 2026 PARADO EM SETEMBRO. O ano corrente vinha do recorte set26 (Série B na rodada 29; Coreia e EUA num arquivo de 18/08;
   China, Noruega e Suécia num de 08/06). Agora vem do recorte nov26 SEM filtro de minutos (Portal Ranking/dados/nov26/_pre_filtro;
   Série C do out26, que é o último que tem). Casa por nome + clube da temporada + liga; se o clube mudou dentro da liga, só quando
   há UM jogador com aquele nome na liga dos dois lados e a idade bate (±1). Só troca se o recorte novo tem tantos jogos ou mais
   (nas ligas de temporada cruzada o nov26 já é a 26/27, com menos jogos: lá o "2026" continua sendo a 25/26 completa).
2. 2024 INCOMPLETO. A pasta "2024" do Portal é a 23/24 só até março nas ligas de temporada cruzada, e o começo da temporada em
   Coreia A/B, Japão A, Paraguai, Argentina A e Colômbia A. Para os BRASILEIROS há o export completo de 27/11/2026 (Advanced Search do
   Wyscout, nacionalidade Brasil; Santa Cruz V2/atualizacao_nov26/extremos/wyscout_br). Quem está nele ganha o ano completo.
   Total do time desse ano = rodadas da liga na temporada seguinte (mediana dos clubes na pasta 2025) × duração do jogo — aproximação,
   marcada com tot="rodadas da liga". Os estrangeiros dessas ligas continuam com o 2024 incompleto até uma extração sem filtro.

Uso: python3 preparar_minutagem_v5.py <ref_nov26_completo.csv.gz> <ref_wybr.csv.gz> <ref_wyscout.csv.gz>
(os três saem de Santa Cruz V2/auditoria_app/r1_ref_wyscout.py e r3_nov26_completo.py; ficam fora do repositório)."""
import json, os, sys
from collections import defaultdict
import pandas as pd
import preparar_minutagem_v4 as v4

AQUI = os.path.dirname(os.path.abspath(__file__))
CAMPOS = v4.CAMPOS
# as mesmas colunas do preparar_historico.py (não importo de lá: ele puxa o ranking_engine do Portal)
COLS = [("Minutes played", "min", 0), ("Matches played", "j", 0), ("Goals", "g", 0), ("Assists", "a", 0), ("Head goals", "gc", 0), ("Penalties taken", "pen", 0),
        ("Penalty conversion, %", "pen%", 0), ("Corners per 90", "esc", 2), ("Free kicks per 90", "fal", 2), ("Direct free kicks per 90", "fd", 2),
        ("Direct free kicks on target, %", "fd%", 0), ("xG per 90", "xg", 2)]


def num(v, casas=0):
    try: x = float(v)
    except (TypeError, ValueError): return None
    if x != x: return None
    return int(round(x)) if not casas else round(x, casas)
v4.RODADAS_FECHADAS[("2026", "Brasil B")] = 38     # Série B 2026 terminou


def linhas_de(df, col_tm="Team within selected timeframe"):
    out = []
    for r in df.to_dict("records"):
        n = r.get("Player")
        if not isinstance(n, str) or not n.strip(): continue
        reg = {"n": n.strip(), "tm": str(r.get(col_tm) if isinstance(r.get(col_tm), str) else "").strip(), "atual": str(r.get("Team") if isinstance(r.get("Team"), str) else "").strip(),
               "l": r["liga"], "idade": num(r.get("Age")), "pasta": str(r.get("pasta") if isinstance(r.get("pasta"), str) else r.get("cod"))}
        for col, k, cs in COLS:
            v = num(r.get(col), cs)
            if v is not None: reg[k] = v
        out.append(reg)
    return out


def main(arq_nov, arq_br, arq_ref):
    p = os.path.join(AQUI, "dados", "historico.json"); H = json.load(open(p, encoding="utf-8")); T = [str(t) for t in H["temporadas"]]
    base = {f"{j['n']} - {j.get('t', '')} - {j.get('l', '')}": j for j in json.load(open(os.path.join(AQUI, "dados", "jogadores.json"), encoding="utf-8"))["jogadores"]}
    NOV = linhas_de(pd.read_csv(arq_nov, low_memory=False)); BR = linhas_de(pd.read_csv(arq_br, low_memory=False))
    ref = pd.read_csv(arq_ref, low_memory=False); ref = ref[ref.pasta == "2025"].rename(columns={"liga": "liga"})
    L25 = linhas_de(ref.assign(pasta="2025"))
    TOT26 = v4.totais(NOV, "2026")
    # rodadas e duração do jogo por liga na pasta 2025 (referência para o total do time de 2024 dos exports só de brasileiros)
    jmax = defaultdict(int); jogo = defaultdict(list)
    for r in L25:
        j, m = r.get("j") or 0, r.get("min") or 0; jmax[(r["l"], r["tm"])] = max(jmax[(r["l"], r["tm"])], j)
        if j >= 10 and m: jogo[r["l"]].append(m / j)
    porliga = defaultdict(list)
    for (l, tm), j in jmax.items(): porliga[l].append(j)
    MED = {l: sorted(js)[len(js) // 2] for l, js in porliga.items()}
    DUR = {l: sorted(d)[min(len(d) - 1, int(len(d) * 0.95))] for l, d in jogo.items()}
    # índices do recorte novo
    por_chave = defaultdict(list); por_atual = defaultdict(list); por_nl = defaultdict(list)
    for r in NOV:
        por_chave[(r["n"], r["tm"], r["l"])].append(r); por_atual[(r["n"], r["atual"], r["l"])].append(r); por_nl[(r["n"], r["l"])].append(r)
    nomes_base = defaultdict(int)
    for pk in H["jogadores"]:
        a = pk.split(" - "); nomes_base[(a[0], a[-1])] += 1
    br_idx = defaultdict(list)
    for r in BR: br_idx[(r["n"], r["tm"], r["l"])].append(r)
    i26, i24 = T.index("2026"), T.index("2024")
    n26 = n26_clube = n24 = 0; ex = []
    for pk, linha in H["jogadores"].items():
        nome = pk.split(" - ")[0]; me = base.get(pk) or {}
        # ---- 2026 do recorte de novembro
        x = linha[i26] if len(linha) > i26 else None
        if x and not x.get("fonte") and x.get("l"):
            c = por_chave.get((nome, x["tm"], x["l"])) or por_atual.get((nome, x["tm"], x["l"])) or []
            mudou = False
            if not c:
                c = por_nl.get((nome, x["l"])) or []
                ok = len(c) == 1 and nomes_base[(nome, x["l"])] == 1 and me.get("id_") is not None and c[0].get("idade") is not None and abs(c[0]["idade"] - me["id_"]) <= 1
                c = c if ok else []; mudou = bool(c)
            if len(c) == 1 and (c[0].get("j") or 0) >= (x.get("j") or 0) and (c[0].get("min") or 0) >= (x.get("min") or 0):
                r = c[0]
                for k in CAMPOS:
                    if r.get(k) is not None: x[k] = r[k]
                if mudou and r["tm"] and r["tm"] != x["tm"]: x["tm"] = r["tm"]; n26_clube += 1
                x["rec"] = r["pasta"]; n26 += 1
                tt = TOT26.get((x["l"], x["tm"]))
                if tt: x["tj"] = max(tt[0], x.get("j") or 0); x["tmin"] = max(tt[1], x.get("min") or 0)
        # ---- 2024 completo para quem está no export de brasileiros
        x = linha[i24] if len(linha) > i24 else None
        if x and not x.get("fonte") and x.get("l"):
            c = [r for r in br_idx.get((nome, x["tm"], x["l"])) or [] if r["pasta"] in ("2024", "2324")]
            if len(c) == 1 and (c[0].get("j") or 0) > (x.get("j") or 0):
                r = c[0]; antes = (x.get("j"), x.get("min"))
                for k in CAMPOS:
                    if r.get(k) is not None: x[k] = r[k]
                x["rec"] = "export 27/11"; n24 += 1
                if x["l"] in MED and x["l"] in DUR:
                    tj = max(MED[x["l"]], x.get("j") or 0); x["tj"] = tj; x["tmin"] = max(int(round(tj * DUR[x["l"]])), x.get("min") or 0); x["tot"] = "rodadas da liga"
                else:
                    x["tj"] = None; x["tmin"] = None     # sem referência de rodadas (Dinamarca: a pasta 2025 só tem uma fase de 7 jogos) → ano fora do percentual
                if len(ex) < 6: ex.append(f"{pk}: {antes} -> ({x.get('j')}, {x.get('min')}) de {x.get('tj')} jogos")
    H["minutagem"] = dict(H.get("minutagem") or {}, versao=5, data="2026-11-27", recorte_2026="nov26", ano_2024="export de brasileiros de 27/11 onde a pasta 2024 era incompleta")
    json.dump(H, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"minutagem v5: 2026 do nov26 em {n26} jogadores ({n26_clube} com clube novo na liga) · 2024 completo em {n24} brasileiros"); print("\n".join(ex))


if __name__ == "__main__":
    main(*sys.argv[1:4])
