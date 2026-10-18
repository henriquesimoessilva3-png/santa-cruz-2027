#!/usr/bin/env python3
"""Aba "Mercado" da visão nova (18/10/2026): o Banco Transfermarkt (static/banco_tm/, exportado no
Portal Transfermarkt do Mac) com duas coisas a mais, geradas AQUI a partir do que o app já tem:

  1. a coluna xT (índice de ameaça da aba Ameaça, static/ameaca_dados.js), casada jogador a jogador;
  2. os jogadores com dado técnico (Wyscout, ≥ 900 min) dos mercados que interessam — Série B, Série A,
     ligas sul-americanas e sul-americanos no exterior — que NÃO estão no Banco. Entram como linhas
     "só Wyscout": sem foto, sem link e sem o "+ Mais" (isso só o Portal, no Mac, consegue gerar);
     com letra física, bola parada, xT, valor e contrato do Wyscout.

Lê: static/banco_tm/{lista,meta,mais_*}.json, static/ameaca_dados.js, static/consulta_dados.js.
Escreve: static/mercado/lista.json e static/mercado/meta.json. Os mais_*.json continuam sendo lidos
de static/banco_tm/ (não são copiados). Rodar de novo depois de cada exportação nova do Portal.

Rodar: python3 gerar_mercado.py
"""
import os, json, re, unicodedata, calendar, datetime, collections

AQUI = os.path.dirname(os.path.abspath(__file__))
ST = os.path.join(AQUI, "static")
BANCO = os.path.join(ST, "banco_tm")
SAIDA = os.path.join(ST, "mercado")

def sem(s):
    s = unicodedata.normalize("NFD", str(s or "")).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9 ]", " ", s).strip()

def ler_js(nome):
    s = open(os.path.join(ST, nome), encoding="utf-8").read()
    return json.loads(s[s.index("=") + 1:].rstrip().rstrip(";"))

POS_TM = {"GOL": "Goleiro", "LD": "Lateral Dir.", "LE": "Lateral Esq.", "ZD": "Zagueiro", "ZE": "Zagueiro", "VOL": "Volante",
          "MED": "Meia Central", "MEI": "Meia Ofensivo", "ED": "Ponta Direita", "EE": "Ponta Esquerda", "CA": "Centroavante"}
SETOR = {"LD": "Lateral", "LE": "Lateral", "ZD": "Zaga", "ZE": "Zaga", "VOL": "Volante", "MED": "Meia", "MEI": "Meia",
         "ED": "Extremo", "EE": "Extremo", "CA": "Atacante"}
SA = ["Argentina A", "Argentina B", "Colombia A", "Colombia B", "Equador A", "Equador B", "Paraguai", "Uruguai", "Chile", "Peru", "Bolivia", "Venezuela"]
NAC = {"BR": "Brasil", "SA": "sul-americano", "": ""}
EXPL_SEM_VOL = 0.25

def fim_do_mes(ym):
    if not ym: return None
    if len(ym) >= 10: return ym[:10]
    a, m = int(ym[:4]), int(ym[5:7])
    return "%04d-%02d-%02d" % (a, m, calendar.monthrange(a, m)[1])

def letra_extra(r, C):
    """Letra física de quem só tem o dado da Consulta: mesma regra do app (tipoLetra), sem o eixo de
    volume (a Consulta não guarda distância e corridas) — por isso não dá A+ nem o A do médio."""
    tipo = r.get("tipo")
    if not tipo or r["p"] == "GOL": return None, None
    pos = r["p"]; pref = C["pref"].get(pos, []); cai = C["cai"].get(pos, [])
    cen = C["cen"].get(SETOR.get(pos, ""))
    exp = None
    if cen:
        z = []
        for i, k in enumerate(["psv", "spr", "hi", "expl"]):
            v = r.get(k)
            if v is not None and cen["desvio"][i]: z.append((v - cen["media"][i]) / cen["desvio"][i])
        if len(z) >= 3: exp = sum(z) / len(z)
    explosivo = exp is not None and exp > EXPL_SEM_VOL
    if pos == "MED":
        if tipo in cai and not explosivo: return "C", tipo
        return "B", tipo + (" · explosivo, pouco volume" if tipo in cai else " · volume não medido na Consulta")
    if tipo in pref: return "A", tipo
    if tipo in cai: return ("B", "Explosivo, pouco volume") if explosivo else ("C", tipo)
    return "B", tipo

def main():
    lista = json.load(open(os.path.join(BANCO, "lista.json"), encoding="utf-8"))
    meta = json.load(open(os.path.join(BANCO, "meta.json"), encoding="utf-8"))
    campos = lista["campos"]
    B = [dict(zip(campos, r)) for r in lista["linhas"]]
    for r in B:
        r["_t"] = sem(r["nome"]).split(); r["_c"] = sem(r["clube"])
    A = ler_js("ameaca_dados.js"); C = ler_js("consulta_dados.js")
    AJ = A["jog"]
    cons = {}
    for r in C["jogadores"]: cons.setdefault((sem(r["n"]), sem(r["c"]), r["p"]), r)

    # ---- 1. xT no Banco: pela ficha do "+ Mais" (posição, liga e minutos no Wyscout são a chave) ----
    por_chave = collections.defaultdict(list)
    for j in AJ: por_chave[(j["p"], j["l"], j["min"])].append(j)
    por_token = collections.defaultdict(set)
    for i, j in enumerate(AJ):
        for t in sem(j["n"]).split():
            if len(t) > 1: por_token[t].add(i)
    usados = set()   # índices de AJ já ligados a uma linha do Banco

    GRUPO_POS = {"ZD": "d", "ZE": "d", "LD": "d", "LE": "d", "VOL": "dm", "MED": "m", "MEI": "ma", "ED": "a", "EE": "a", "CA": "a"}
    def compat(p1, p2):
        a, b = GRUPO_POS.get(p1, "?"), GRUPO_POS.get(p2, "?")
        return p1 == p2 or bool(set(a) & set(b))
    def por_nome(r, cands, d=None):
        """Melhor candidato da Ameaça para a linha r do Banco. Pontos: nome (obrigatório) +2 clube, +2 mesmos
        minutos da ficha do + Mais, +1 mesma posição. Aceita com 3+ pontos, ou candidato único de posição
        compatível (clube e minutos mudam entre as exportações do Wyscout: Cuiabano, Beraldo...)."""
        best = None; n_ok = 0
        for i in cands:
            j = AJ[i]; jt = sem(j["n"]).split(); ini = [t for t in jt if len(t) == 1]
            full = [t for t in jt if len(t) > 1]
            if not full or not all(t in r["_t"] for t in full): continue
            if ini and not any(x.startswith(ini[0]) for x in r["_t"]): continue
            # apelido de um nome só ("Yago", "Franco") só casa com o mesmo nome só — senão "Franco" pega todo Franco Alguma-coisa
            if len(full) == 1 and not ini and len(r["_t"]) != 1: continue
            # o sobrenome do Banco (último nome) tem de estar no nome do Wyscout: "S. Ramos" não é "Santiago Ramos Mingo"
            if r["_t"][-1] not in full and not all(t in full for t in r["_t"] if len(t) > 1): continue
            n_ok += 1
            cj = sem(j["c"])
            sc = 1 + (2 if (cj and (cj in r["_c"] or r["_c"] in cj or cj.split()[0] in r["_c"])) else 0)
            if d:
                if d.get("min") == j["min"]: sc += 2
                if d.get("pos") == j["p"]: sc += 1
                elif not compat(d.get("pos"), j["p"]): sc -= 1
            if best is None or sc > best[0]: best = (sc, i)
        if not best: return None
        if best[0] >= 3 or (n_ok == 1 and best[0] >= 1): return best
        return None

    mais = {}
    for pos in sorted({r["pw"] for r in B if r["pw"]}):
        f = os.path.join(BANCO, "mais_%s.json" % pos)
        if os.path.exists(f): mais[pos] = json.load(open(f, encoding="utf-8"))
    n_xt_mais = n_xt_nome = 0
    for r in B:
        r["xt"] = None; r["xtp"] = None; r["fonte"] = "tm"
        d = mais.get(r["pw"], {}).get(str(r["id"])) if r["pw"] else None
        hit = None
        if d:
            cands = por_chave.get((d["pos"], d["liga"], d["min"]), [])
            if len(cands) == 1: hit = AJ.index(cands[0])
            elif cands:
                b = por_nome(r, [AJ.index(c) for c in cands], d); hit = b[1] if b else None
            if hit is not None: n_xt_mais += 1
        if hit is None:
            cands = set()
            for t in r["_t"]:
                if len(t) > 1: cands |= por_token.get(t, set())
            b = por_nome(r, [i for i in cands if i not in usados], d) if cands else None
            # sem a ficha do + Mais (sem posição e liga para conferir) só vale com o clube batendo
            if b and (d or b[0] >= 3):
                hit = b[1]; n_xt_nome += 1
        if hit is not None:
            usados.add(hit); j = AJ[hit]
            r["xt"] = j["xt"]; r["xtp"] = j.get("pp")

    # ---- 2. quem só existe no Wyscout (mercados que interessam) ----
    extras = []
    for i, j in enumerate(AJ):
        if i in usados or j["m"] not in ("b", "a", "sa", "ext"): continue
        c = cons.get((sem(j["n"]), sem(j["c"]), j["p"])) or {}
        if c.get("vet"): continue
        letra, letra_t = letra_extra(dict(c, p=j["p"]), C) if c else (None, None)
        val = c.get("val") if c.get("val") else (j["v"] * 1e6 if j.get("v") else None)
        ct = c.get("ct") or fim_do_mes(j.get("ct"))
        extras.append({
            "id": "w%d" % i, "nome": j["n"], "pos": POS_TM.get(j["p"], j["p"]), "idade": j.get("i"), "nasc": None,
            "nacs": NAC.get(j.get("nac") or "", ""), "clube": j["c"], "liga": j["l"], "valor": val, "contrato": ct, "ctf": "w",
            "altura": None, "pe": None, "foto": None, "url": None,
            "letra": letra, "letra_t": letra_t, "sB": None, "okB": None, "nB": None, "sA": None, "okA": None, "nA": None,
            "cob": bool(c.get("cob") is not None and c["cob"] >= 80), "aer": bool(c.get("aer_dp") is not None and c["aer_dp"] >= 80),
            "aerof": bool(c.get("aer") is not None and c["aer"] >= 80), "pen": False, "pw": None, "conf": "Wyscout",
            "xt": j["xt"], "xtp": j.get("pp"), "fonte": "w", "min": j.get("min"), "p11": j["p"],
        })
    # goleiros só do Wyscout, nos mesmos mercados (a Ameaça não tem goleiro)
    nomes_banco = collections.defaultdict(set)
    for r in B:
        for t in r["_t"]: nomes_banco[t].add(id(r))
    LB = {"Série B": "b", "Série A": "a"}
    for c in C["jogadores"]:
        if c["p"] != "GOL": continue
        m = LB.get(c["l"]) or ("sa" if c["l"] in SA else None)
        if not m: continue
        toks = [t for t in sem(c["n"]).split() if len(t) > 1]
        cands = set()
        for t in toks: cands |= nomes_banco.get(t, set())
        achou = False
        for r in B:
            if id(r) not in cands: continue
            if all(t in r["_t"] for t in toks) and (sem(c["c"]) in r["_c"] or r["_c"] in sem(c["c"]) or (sem(c["c"]).split() and sem(c["c"]).split()[0] in r["_c"])):
                achou = True; break
        if achou or c.get("vet"): continue
        extras.append({
            "id": "g%s" % len(extras), "nome": c["n"], "pos": "Goleiro", "idade": c.get("i"), "nasc": None, "nacs": "", "clube": c["c"], "liga": c["l"],
            "valor": c.get("val"), "contrato": c.get("ct"), "ctf": "w", "altura": None, "pe": None, "foto": None, "url": None,
            "letra": None, "letra_t": None, "sB": None, "okB": None, "nB": None, "sA": None, "okA": None, "nA": None,
            "cob": False, "aer": False, "aerof": False, "pen": False, "pw": None, "conf": "Wyscout", "xt": None, "xtp": None, "fonte": "w", "min": c.get("min"), "p11": "GOL",
        })

    campos2 = campos + ["xt", "xtp", "fonte", "min", "p11"]
    linhas = []
    for r in B:
        r.setdefault("min", None); r.setdefault("p11", None)
        linhas.append([r.get(k) for k in campos2])
    for r in extras: linhas.append([r.get(k) for k in campos2])
    os.makedirs(SAIDA, exist_ok=True)
    json.dump({"campos": campos2, "linhas": linhas}, open(os.path.join(SAIDA, "lista.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    meta2 = dict(meta)
    meta2["extras"] = len(extras)
    meta2["xt"] = {"n": sum(1 for r in B if r["xt"] is not None) + sum(1 for r in extras if r["xt"] is not None), "gerado": A.get("gerado_em")}
    meta2["gerado"] = datetime.date.today().isoformat()
    meta2["mais_url"] = "static/banco_tm/"
    json.dump(meta2, open(os.path.join(SAIDA, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False)
    por_m = collections.Counter(("GOL" if e["p11"] == "GOL" else {"b": "Série B", "a": "Série A", "sa": "Sul-americanas", "ext": "Sul-americanos fora"}.get(next((j["m"] for j in AJ if j["n"] == e["nome"] and j["c"] == e["clube"]), ""), "?")) for e in extras)
    print("Banco: %d linhas · xT casado em %d (%d pela ficha do + Mais, %d por nome e clube)" % (len(B), n_xt_mais + n_xt_nome, n_xt_mais, n_xt_nome))
    print("Só Wyscout: %d linhas a mais" % len(extras), dict(por_m))
    print("Escrito em", SAIDA)

if __name__ == "__main__":
    main()
