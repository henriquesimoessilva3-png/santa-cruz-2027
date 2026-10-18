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

def aplicar(H=None):
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
        for col, ch in (("minutos_time", "tmin"), ("jogos_time", "tj")):   # quando o levantamento trouxe o total do time
            if col in g.columns and pd.notna(g[col]).any(): linha[i][ch] = int(pd.to_numeric(g[col], errors="coerce").max())
        anos += 1
    print(f"  complemento da minutagem: {anos} anos preenchidos ({novos} jogadores novos no histórico)")
    if salvar: json.dump(H, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    return H

if __name__ == "__main__":
    aplicar()
