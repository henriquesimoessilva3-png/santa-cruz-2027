#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Total do TIME (e, quando houver, minutos do jogador) nos anos em que o histórico só tinha os números do jogador
(oGol só com jogos, levantamento sem o time). Pedido do Henrique, 18/10/2026: "não pode trazer número aleatório" — a
minutagem do card só usa número levantado. Fonte: dados/total_time_complemento.csv (levantamento de 18/10).

Por (primaryKey, temporada): jogos/minutos do time = o MAIOR entre os clubes do ano (a temporada; ele não jogou a inteira em
nenhum); jogos/minutos do jogador = a soma dos clubes. Só preenche o que falta; o que o Wyscout já tinha vale.
O preparar_historico.py chama isto no fim (depois do complemento)."""
import json, os
import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
CSV = os.path.join(AQUI, "dados", "total_time_complemento.csv")

def aplicar(H=None):
    p = os.path.join(AQUI, "dados", "historico.json"); salvar = H is None
    if H is None: H = json.load(open(p, encoding="utf-8"))
    if not os.path.exists(CSV): return H
    d = pd.read_csv(CSV); d = d[d.primaryKey.notna()]
    for c in ("jogos_time", "minutos_time", "jogos", "minutos"): d[c] = pd.to_numeric(d.get(c), errors="coerce")
    T = [str(t) for t in H["temporadas"]]; n = 0
    for (pk, t), g in d.groupby(["primaryKey", d.temporada.astype(str)]):
        if t not in T or pk not in H["jogadores"]: continue
        x = H["jogadores"][pk][T.index(t)]
        if not x: continue
        gt = g[g.jogos_time.notna() & (g.jogos_time > 0)]
        if gt.empty: continue
        tj = int(gt.jogos_time.max()); tmin = int(gt.minutos_time.max()) if gt.minutos_time.notna().any() else tj * 90
        if not x.get("min") or x.get("fonte") == "ogol":
            if g.minutos.notna().any() and g.minutos.sum() > 0:   # minutos do jogador levantados
                x["min"] = int(g.minutos.sum()); x["j"] = int(g.jogos.sum()) if g.jogos.notna().any() else x.get("j")
                x["fonte"] = "levantamento"; x["src"] = ", ".join(sorted(set(g.fonte.astype(str))))
        if x.get("min") and x.get("fonte") != "ogol" and tmin < x["min"]: continue   # fontes que não batem: não usa
        x["tmin"], x["tj"] = tmin, tj; n += 1
    print(f"  total do time levantado: {n} temporadas")
    if salvar: json.dump(H, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    return H

if __name__ == "__main__":
    aplicar()
