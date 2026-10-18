#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Complemento da minutagem (18/10/2026): os anos 2024–2026 que o histórico do Wyscout não ligou (idade nos Excels antigos,
grafia diferente, card manual/Transfermarkt sem chave no ago26), levantados à mão em dados/minutagem_complemento.csv
(bases locais do Wyscout, Série B local, Sofascore, FotMob, Wikipedia, Soccerway, FBref).

Regra: SÓ preenche ano vazio — o que o Wyscout já ligou vale. Várias linhas do mesmo jogador e ano (dois clubes, Apertura e
Clausura) são somadas. Marca fonte "complemento". O preparar_historico.py chama isto no fim."""
import json, os
import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
CSV = os.path.join(AQUI, "dados", "minutagem_complemento.csv")

MT = {}
def liga_de(comp, t):
    c = str(comp or "")
    for pre, liga in (("Série A", "Brasil A"), ("Série B", "Brasil B"), ("Série C", "Brasil C")):
        if c.startswith(pre): return liga
    return c

def _n(x):
    import unicodedata
    return "".join(ch for ch in unicodedata.normalize("NFD", str(x).lower()) if unicodedata.category(ch) != "Mn")

def acha_time(t, liga, clube):
    """clube com grafia diferente (Sofascore × Wyscout): um nome contém o outro, na mesma liga e ano"""
    c = _n(clube)
    if not c or c in ("-", "nan"): return None
    achados = [v for k, v in MT.get(t, {}).items() if k.split("|")[0] == liga and (c in _n(k.split("|")[1]) or _n(k.split("|")[1]) in c)]
    return achados[0] if len(achados) == 1 else None

def aplicar(H=None):
    global MT
    cp = os.path.join(AQUI, "dados", "minutos_time.json")
    if os.path.exists(cp): MT = json.load(open(cp, encoding="utf-8"))
    p = os.path.join(AQUI, "dados", "historico.json")
    salvar = H is None
    if H is None: H = json.load(open(p, encoding="utf-8"))
    if not os.path.exists(CSV): return H
    d = pd.read_csv(CSV); d = d[d.primaryKey.notna()]
    d["jogos"] = pd.to_numeric(d.jogos, errors="coerce").fillna(0); d["minutos"] = pd.to_numeric(d.minutos, errors="coerce").fillna(0)
    T = [str(t) for t in H["temporadas"]]; novos = anos = 0
    for linha in H["jogadores"].values():          # refaz: tira o complemento antigo antes de aplicar o CSV de novo
        for i, x in enumerate(linha):
            if x and x.get("fonte") == "complemento": linha[i] = None
    for (pk, t), g in d.groupby(["primaryKey", d.temporada.astype(str)]):
        if t not in T: continue
        i = T.index(t); linha = H["jogadores"].get(pk)
        if linha is None: linha = H["jogadores"][pk] = [None] * len(T); novos += 1
        x = linha[i]
        if x and (x.get("min") or x.get("j")): continue
        j, m = int(g.jogos.sum()), int(g.minutos.sum())
        if not j and not m: continue
        linha[i] = {"t": t, "tm": " / ".join(dict.fromkeys(str(c) for c in g.clube_na_temporada if isinstance(c, str))), "l": "",
                    "j": j, "fonte": "complemento", "src": ", ".join(sorted(set(g.fonte.astype(str))))}
        if m: linha[i]["min"] = m
        # 18/10: minutos e jogos do TIME — do levantamento, ou do arquivo do Wyscout da liga/clube (minutos_time.json);
        # ano com dois clubes = a temporada mais longa dos dois (ele não jogou a temporada inteira em nenhum)
        tms = [MT.get(t, {}).get(f"{liga_de(r.competicao, t)}|{r.clube_na_temporada}") or acha_time(t, liga_de(r.competicao, t), r.clube_na_temporada) for r in g.itertuples()]
        tms = [x for x in tms if x]
        if tms and (not m or max(x[0] for x in tms) >= m):   # time com menos minutos que ele = fontes diferentes: não usa
            linha[i]["tmin"], linha[i]["tj"] = max(x[0] for x in tms), max(x[1] for x in tms)
        for col, ch in (("minutos_time", "tmin"), ("jogos_time", "tj")):   # quando o levantamento trouxe o total do time
            if col in g.columns and pd.notna(g[col]).any(): linha[i][ch] = int(pd.to_numeric(g[col], errors="coerce").max())
        anos += 1
    print(f"  complemento da minutagem: {anos} anos preenchidos ({novos} jogadores novos no histórico)")
    if salvar: json.dump(H, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    return H

if __name__ == "__main__":
    aplicar()
