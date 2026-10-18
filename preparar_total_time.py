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

import re, unicodedata
def _nz(x):
    x = "".join(c for c in unicodedata.normalize("NFD", str(x).lower()) if unicodedata.category(c) != "Mn")
    x = re.sub(r"[^a-z0-9 ]", " ", x)
    x = re.sub(r"\b(fc|cf|ec|sc|ac|club|clube|esporte|futebol|sport|de|do|da|ca|se|cr|ad|af|fk|sk)\b", " ", x)
    return re.sub(r"\s+", " ", x).strip()

def _real(x):
    if x.get("min") and x.get("fonte") != "ogol": return bool(x.get("tmin") and x["tmin"] >= x["min"])
    return bool(x.get("tj") and x["tj"] >= (x.get("j") or 0))

def aplicar(H=None):
    p = os.path.join(AQUI, "dados", "historico.json"); salvar = H is None
    if H is None: H = json.load(open(p, encoding="utf-8"))
    T = [str(t) for t in H["temporadas"]]; n = 0
    d = pd.read_csv(CSV) if os.path.exists(CSV) else pd.DataFrame(columns=["primaryKey", "temporada", "jogos_time", "minutos_time", "jogos", "minutos", "fonte"])
    d = d; d = d[d.primaryKey.notna()]
    for c in ("jogos_time", "minutos_time", "jogos", "minutos"): d[c] = pd.to_numeric(d.get(c), errors="coerce")
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
    # 2ª passada (18/10, "fazer de uma vez para a base toda"): o clube do ano achado nos arquivos do Wyscout daquele ano
    # (dados/minutos_time.json: jogos e minutos do time na liga). Só quando o clube aparece numa liga só (ou todas dão o mesmo
    # número) e quando os jogos dele cabem nos do time — o oGol conta todas as competições e o Wyscout, a liga: se ele tem mais
    # jogos que o time, as fontes não batem e o ano fica sem total (falta, não estimativa).
    cp = os.path.join(AQUI, "dados", "minutos_time.json")
    if os.path.exists(cp):
        MT = json.load(open(cp, encoding="utf-8")); idx = {}
        for t, dd in MT.items():
            ix = idx.setdefault(t, {})
            for k, v in dd.items():
                liga, tm = k.split("|", 1); ix.setdefault(_nz(tm), []).append((liga, v))
        m2 = 0
        for linha in H["jogadores"].values():
            for i, x in enumerate(linha):
                if not x or not (x.get("min") or x.get("j")) or _real(x): continue
                cand = idx.get(T[i], {}).get(_nz(x.get("tm", "")), [])
                if not cand: continue
                if x.get("l"): cand = [c for c in cand if c[0] == x["l"]] or cand
                if len({tuple(c[1]) for c in cand}) != 1: continue
                tmin, tj = cand[0][1]
                if x.get("min") and x.get("fonte") != "ogol":
                    if tmin < x["min"]: continue
                elif not x.get("j") or tj < x["j"]: continue
                x["tmin"], x["tj"], x["t_src"] = tmin, tj, "wyscout " + cand[0][0]; m2 += 1
        print(f"  total do time achado no Wyscout pelo clube: {m2} temporadas")
    # 3ª passada: jogos do clube por temporada levantados liga a liga (dados/total_time_clubes.csv). O oGol conta todas as
    # competições → usa jogos_todas_competicoes; minutos do Wyscout são da liga → usa jogos_liga × 90.
    cc = os.path.join(AQUI, "dados", "total_time_clubes.csv")
    if os.path.exists(cc):
        dc = pd.read_csv(cc); m3 = 0; tab = {}
        for r in dc.itertuples():
            tab[(str(r.temporada), str(r.clube))] = (pd.to_numeric(getattr(r, "jogos_liga", None), errors="coerce"), pd.to_numeric(getattr(r, "jogos_todas_competicoes", None), errors="coerce"), str(getattr(r, "liga", "") or ""))
        for linha in H["jogadores"].values():
            for i, x in enumerate(linha):
                if not x or not (x.get("min") or x.get("j")) or _real(x): continue
                v = tab.get((T[i], str(x.get("tm", ""))))
                if not v: continue
                jl, jt, liga = v
                if x.get("min") and x.get("fonte") != "ogol":
                    if pd.isna(jl) or jl * 90 < x["min"]: continue
                    x["tj"], x["tmin"] = int(jl), int(jl) * 90
                else:
                    tj = jt   # oGol conta todas as competições: só vale o total do time em todas as competições
                    if pd.isna(tj) or tj < (x.get("j") or 0): continue
                    x["tj"], x["tmin"] = int(tj), int(tj) * 90
                x["t_src"] = "levantamento " + liga; m3 += 1
        print(f"  total do time pela tabela dos clubes: {m3} temporadas")
    # 4ª passada — cards manuais (dados/manuais_temporadas.csv): ano a ano dos jogadores criados à mão no app, por clube e
    # competição. Jogos do time = soma das competições do clube; com mais de um clube no ano vale o maior (as passagens, abaixo,
    # corrigem com a data). Gols, assistências, cabeça, pênaltis e gol de falta entram para a bola parada.
    mt = os.path.join(AQUI, "dados", "manuais_temporadas.csv")
    try: dm = pd.read_csv(mt) if os.path.exists(mt) else None
    except Exception as e: print("  cards manuais: arquivo ainda incompleto, fica para depois (" + str(e)[:60] + ")"); dm = None
    if dm is not None:
        m4 = 0
        for c in ("jogos", "minutos", "gols", "assistencias", "gols_cabeca", "penaltis_cobrados", "penaltis_gol", "gols_falta", "jogos_time"):
            dm[c] = pd.to_numeric(dm.get(c), errors="coerce")
        for (pk, t), g in dm.groupby(["primaryKey", dm.temporada.astype(str)]):
            if t not in T: continue
            linha = H["jogadores"].setdefault(pk, [None] * len(T))
            if not g.jogos.notna().any(): continue
            soma = lambda c: int(g[c].sum()) if g[c].notna().any() else None
            porClube = g.groupby("clube").jogos_time.sum(min_count=1)
            x = {"t": t, "tm": " / ".join(dict.fromkeys(str(c) for c in g.clube)), "l": "", "j": soma("jogos"), "fonte": "levantamento", "src": ", ".join(sorted(set(g.fonte.astype(str))))}
            if soma("minutos"): x["min"] = soma("minutos")
            for c, k in (("gols", "g"), ("assistencias", "a"), ("gols_cabeca", "gc"), ("penaltis_cobrados", "pen"), ("gols_falta", "gfal"), ("penaltis_gol", "gpen")):
                if soma(c) is not None: x[k] = soma(c)
            if porClube.notna().any():
                tj = int(porClube.max()); x["tj"], x["tmin"] = tj, tj * 90
                if x.get("min") and x["tmin"] < x["min"]: x.pop("tj"); x.pop("tmin")
            linha[T.index(t)] = x; m4 += 1
        print(f"  cards manuais: {m4} temporadas")
    # 5ª passada — PASSAGENS (dados/passagens.csv): ano com troca de clube = soma das passagens, cada uma com os jogos do time
    # ENQUANTO ele estava lá (pela data de chegada e saída). Vale por cima do que havia no ano (pedido do Henrique, caso Madson).
    pp = os.path.join(AQUI, "dados", "passagens.csv")
    if os.path.exists(pp):
        dp = pd.read_csv(pp); m5 = 0
        for c in ("jogos", "minutos", "jogos_time_no_periodo"): dp[c] = pd.to_numeric(dp.get(c), errors="coerce")
        # jogador com a identificação "a conferir" fica de fora: errar o jogador é pior que faltar o dado (18/10)
        duv = set(dp[dp.obs.astype(str).str.contains("a conferir", case=False)].primaryKey); dp = dp[~dp.primaryKey.isin(duv)]
        dp = dp[(dp.chegada.notna()) | (dp.jogos.notna())]
        for (pk, t), g in dp.groupby(["primaryKey", dp.temporada.astype(str)]):
            if t not in T or not g.jogos.notna().any(): continue
            linha = H["jogadores"].setdefault(pk, [None] * len(T)); i = T.index(t); x = dict(linha[i] or {"t": t})
            g = g.sort_values("chegada")
            x["pass"] = [{"tm": str(r.clube), "de": str(r.chegada or ""), "ate": "" if pd.isna(r.saida) else str(r.saida),
                          "j": None if pd.isna(r.jogos) else int(r.jogos), "min": None if pd.isna(r.minutos) else int(r.minutos),
                          "tj": None if pd.isna(r.jogos_time_no_periodo) else int(r.jogos_time_no_periodo)} for r in g.itertuples()]
            x["tm"] = " → ".join(dict.fromkeys(str(c) for c in g.clube)); x["l"] = ""
            x["j"] = int(g.jogos.sum())
            if g.minutos.notna().all(): x["min"] = int(g.minutos.sum())
            else: x.pop("min", None)
            if g.jogos_time_no_periodo.notna().all():
                x["tj"] = int(g.jogos_time_no_periodo.sum()); x["tmin"] = x["tj"] * 90
            else: x.pop("tj", None); x.pop("tmin", None)
            x["fonte"] = "passagens"; x["src"] = ", ".join(sorted(set(g.fonte.astype(str))))
            linha[i] = x; m5 += 1
        print(f"  passagens (troca de clube): {m5} temporadas")
    if salvar: json.dump(H, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    return H

if __name__ == "__main__":
    aplicar()
