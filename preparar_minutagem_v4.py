#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Minutagem do card, 4ª versão (19/10/2026 — caso Lucas Lima, Goiás: "21 de 21 jogos, 100%", errado).

Três defeitos das versões anteriores, consertados aqui, por cima do dados/historico.json:

1. TOTAL DO TIME. Era "os minutos de quem mais jogou pelo clube na liga". Quando ninguém jogou todos os jogos (goleiro
   que revezou), o total do time vira os minutos do próprio jogador e ele aparece com 100%. Agora:
   jogos do time = o maior entre os jogos do atleta do clube que mais jogou e a rodada da liga (ver totais());
   minutos do time = jogos do time × duração de um jogo inteiro naquela liga no Wyscout (o percentil 95 de minutos por
   jogo de quem tem 10+ jogos: ~100 min no Brasil, porque o Wyscout conta os acréscimos).
2. 2026 VELHO. O ano corrente vinha do recorte de ago26 (Série B na rodada ~21). Agora vem do recorte mais novo
   (set26), quando o jogador está nele com o mesmo nome, clube e liga.
3. HOMÔNIMO. Nome repetido na base (dois "Lucas Lima") não casava com as temporadas anteriores e o ano ficava só com os
   jogos do oGol (todas as competições, sem minutos e sem o total do time). Agora, se o oGol diz o clube daquele ano e há
   UM só atleta com o mesmo nome, nesse clube, com idade/altura/país compatíveis, nas planilhas do Wyscout daquele ano,
   o ano passa a usar o Wyscout (minutos da liga). Mais de um candidato = não mexe.

Lê os caches dados/_wy_<pasta>.json (gerados por _wy_cache.py). O preparar_historico.py chama isto no fim."""
import json, os, re, unicodedata
from collections import defaultdict

AQUI = os.path.dirname(os.path.abspath(__file__))
PASTAS = {"2024": "2024", "2025": "2025", "2026": "set26"}
BASE_PASTA = "ago26"           # recorte da base do app (chaves dos cards)
CAMPOS = ["min", "j", "g", "a", "gc", "pen", "pen%", "esc", "fal", "fd", "fd%", "xg"]


def sem_acento(x):
    return "".join(c for c in unicodedata.normalize("NFD", str(x or "").lower()) if unicodedata.category(c) != "Mn")


def nome(x):
    x = re.sub(r"\s*\((?:GOL|ZAG|LAT|VOL|MED|MEI|EXT|ATA)[^)]*\)\s*$", "", str(x or "").strip())
    return re.sub(r"\s+", " ", sem_acento(x)).strip()


def clube(x):
    x = re.sub(r"[\(\[].*?[\)\]]", " ", str(x or ""))
    x = re.sub(r"[^a-z0-9 ]", " ", sem_acento(x))
    x = re.sub(r"\b(fc|cf|ec|sc|ac|club|clube|esporte|futebol|de|do|da|ca|se|cr|ad|af|fk|sk|u20|u23|ii|b)\b", " ", x)
    return re.sub(r"\s+", " ", x).strip()


def mesmo_clube(a, b):
    a, b = clube(a), clube(b)
    if not a or not b: return False
    return a == b or (len(a) >= 4 and a in b) or (len(b) >= 4 and b in a)


def carregar(pasta):
    p = os.path.join(AQUI, "dados", f"_wy_{pasta}.json")
    if not os.path.exists(p): return None
    linhas = []
    for v in json.load(open(p, encoding="utf-8")).values():
        for r in v.get("linhas", []):
            r = dict(r); r["l"] = v["liga"]; linhas.append(r)
    return linhas


# temporada fechada de liga em pontos corridos com o número de rodadas conhecido: vale o calendário (o Sport de 2024 não
# teve ninguém nos 38 jogos e a conta pelo atleta dava 37)
RODADAS_FECHADAS = {("2024", "Brasil A"): 38, ("2024", "Brasil B"): 38, ("2025", "Brasil A"): 38, ("2025", "Brasil B"): 38}


def totais(linhas, temporada=None):
    """(liga, clube) -> (jogos do time, minutos do time).
    Jogos do time = o MAIOR entre (a) os jogos do atleta do clube que mais jogou e (b) a mediana desse número entre os
    clubes da liga. Só (a) subestima quando ninguém jogou todos (Goiás 2026: o Lucas Lima, com 25, era o que mais tinha;
    a Série B estava na rodada ~28). O máximo da liga não serve: liga com fase final (Colômbia, Série C, playoff na
    Espanha e na Inglaterra) dá mais jogos a quem avança, e quem trocou de clube dentro da liga infla a conta.
    Minutos do time = jogos do time × um jogo inteiro na liga (percentil 95 de minutos por jogo de quem tem 10+ jogos;
    ~100 no Brasil, porque o Wyscout conta os acréscimos)."""
    jmax = defaultdict(int); jogo = defaultdict(list)
    for r in linhas:
        j, m = r.get("j") or 0, r.get("min") or 0
        jmax[(r["l"], r["tm"])] = max(jmax[(r["l"], r["tm"])], j)
        if j >= 10 and m: jogo[r["l"]].append(m / j)
    med, dur = {}, {}
    porliga = defaultdict(list)
    for (l, tm), j in jmax.items(): porliga[l].append(j)
    for l, js in porliga.items():
        js = sorted(js); med[l] = js[len(js) // 2]
        d = sorted(jogo.get(l) or [95.0]); dur[l] = d[min(len(d) - 1, int(len(d) * 0.95))]
    out = {}
    for (l, tm), j in jmax.items():
        tj = RODADAS_FECHADAS.get((temporada, l)) or max(j, med[l])
        out[(l, tm)] = (tj, int(round(tj * dur[l])))
    return out


def aplicar(H=None):
    p = os.path.join(AQUI, "dados", "historico.json"); salvar = H is None
    if H is None: H = json.load(open(p, encoding="utf-8"))
    T = [str(t) for t in H["temporadas"]]
    W = {t: carregar(pa) for t, pa in PASTAS.items()}
    base = carregar(BASE_PASTA) or []
    if not all(W.values()):
        print("  minutagem v4: falta cache do Wyscout (rode _wy_cache.py) — nada feito"); return H
    TOT = {t: totais(ls, t) for t, ls in W.items()}
    TOT_BASE = totais(base, "2026") if base else {}   # 2026 que ficou no recorte da base (ago26): total do time do MESMO recorte
    # índices
    por_chave = {t: defaultdict(list) for t in W}
    por_nome = {t: defaultdict(list) for t in W}
    for t, ls in W.items():
        for r in ls:
            por_chave[t][(r["n"], r["tm"], r["l"])].append(r)
            por_nome[t][nome(r["n"])].append(r)
    info = {}
    for r in base: info.setdefault(f"{r['n']} - {r['tm']} - {r['l']}", r)
    # linhas do Wyscout já usadas por algum card em cada ano (para não dar a mesma a dois)
    usadas = defaultdict(set)
    for linha in H["jogadores"].values():
        for x in linha:
            if x and not x.get("fonte") and x.get("l"): usadas[x["t"]].add((x["tm"], x["l"], x.get("min"), x.get("j")))
    n_set = n_hom = n_tot = 0
    i26 = T.index("2026") if "2026" in T else None
    for pk, linha in H["jogadores"].items():
        # 2) 2026 do recorte mais novo
        if i26 is not None and linha[i26] and not linha[i26].get("fonte") and linha[i26].get("l"):
            x = linha[i26]
            c = por_chave["2026"].get((pk.split(" - ")[0], x["tm"], x["l"])) or []
            if len(c) == 1 and (c[0].get("j") or 0) >= (x.get("j") or 0):
                for k in CAMPOS:
                    if c[0].get(k) is not None: x[k] = c[0][k]
                x["rec"] = PASTAS["2026"]; n_set += 1
        # 3) ano só do oGol, com homônimo: o clube do oGol decide
        me = info.get(pk)
        for i, x in enumerate(linha):
            if not x or x.get("fonte") != "ogol" or not x.get("tm"): continue
            t = x["t"]
            if t not in W: continue
            nm = nome(pk.split(" - ")[0])
            # sem a idade do card não há como conferir a pessoa: não mexe ("a gente não pode errar qual jogador é")
            if not me or me.get("idade") is None: continue
            abreviado = bool(re.match(r"^[a-z]\. ", nm))
            cand = []
            for r in por_nome[t].get(nm, []):
                if not mesmo_clube(r["tm"], x["tm"]): continue
                if True:
                    if me.get("pais") and r.get("pais") and me["pais"] != r["pais"]: continue
                    if me.get("alt") and r.get("alt") and abs(me["alt"] - r["alt"]) > 2: continue
                    if me.get("idade") is not None and r.get("idade") is not None:
                        esp = me["idade"] - (2026 - int(t))
                        if min(abs(r["idade"] - esp), abs(r["idade"] - me["idade"])) > 1: continue
                if r.get("idade") is None: continue
                if abreviado and not ((me.get("alt") and r.get("alt")) or (me.get("pais") and r.get("pais"))): continue
                cand.append(r)
            if len(cand) != 1 or not cand[0].get("min"): continue
            r = cand[0]
            if (r["tm"], r["l"], r.get("min"), r.get("j")) in usadas[t]: continue
            novo = {"t": t, "tm": r["tm"], "l": r["l"], "lig": "clube do oGol"}
            for k in CAMPOS:
                if r.get(k) is not None: novo[k] = r[k]
            linha[i] = novo; usadas[t].add((r["tm"], r["l"], r.get("min"), r.get("j"))); n_hom += 1
        # 1) total do time = jogos do time × jogo inteiro da liga
        for x in linha:
            if not x or x.get("fonte") or not x.get("l") or x["t"] not in TOT: continue
            tab = TOT_BASE if (x["t"] == "2026" and x.get("rec") != PASTAS["2026"]) else TOT[x["t"]]
            tt = tab.get((x["l"], x["tm"]))
            if not tt: continue
            tj, tmin = tt
            x["tj"] = max(tj, x.get("j") or 0)
            x["tmin"] = max(tmin, x.get("min") or 0)
            n_tot += 1
    n_wy = aplicar_wyscout(H)
    H["minutagem"] = {"versao": 4, "wyscout_todas": n_wy, "data": "2026-10-19", "recorte_2026": PASTAS["2026"]}
    print(f"  minutagem v4: 2026 do {PASTAS['2026']} em {n_set} · homônimos ligados pelo clube do oGol: {n_hom} · total do time refeito: {n_tot}")
    if salvar: json.dump(H, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    return H


def aplicar_wyscout(H):
    """19/10 (Henrique): "buscar lá do Wyscout" — jogos e minutos do jogador em TODAS as competições oficiais (sem
    amistosos, seleção e base) e o total do time no mesmo período (jogos do clube na temporada × duração real de cada
    jogo), por temporada do clube (europeia 25/26 = 2026), igual ao Posições e Sistemas. Coletado no Chrome com o Wyscout
    logado, para os alvos do campograma: dados/minutagem_wyscout.json. Vale sobre a liga; o por-90 de bola parada segue
    da liga (min_l)."""
    p = os.path.join(AQUI, "dados", "minutagem_wyscout.json")
    if not os.path.exists(p): return 0
    W = json.load(open(p, encoding="utf-8"))["jogadores"]; T = [str(t) for t in H["temporadas"]]; n = 0
    for pk, r in W.items():
        linha = H["jogadores"].get(pk)
        if linha is None: linha = H["jogadores"][pk] = [None] * len(T)
        for t, cls in (r.get("anos") or {}).items():
            if t not in T or not cls: continue
            i = T.index(t); velho = linha[i] or {}
            x = {k: v for k, v in velho.items() if k in ("g", "a", "gc", "pen", "pen%", "esc", "fal", "fd", "fd%", "xg")}
            if velho.get("min") and velho.get("fonte") not in ("ogol",): x["min_l"] = velho["min"]
            x.update({"t": t, "tm": " / ".join(c[0] for c in cls), "l": "", "j": sum(c[1] for c in cls), "min": sum(c[2] for c in cls),
                      "tj": sum(c[3] for c in cls), "tmin": max(sum(c[4] for c in cls), sum(c[2] for c in cls)), "fonte": "wyscout", "wy": r.get("wy")})
            if len(cls) > 1: x["pass"] = [{"tm": c[0], "j": c[1], "min": c[2], "tj": c[3], "tmin": c[4]} for c in cls]
            linha[i] = x; n += 1
    print(f"  minutagem Wyscout (todas as competições): {len(W)} jogadores, {n} temporadas")
    return n


if __name__ == "__main__":
    aplicar()
