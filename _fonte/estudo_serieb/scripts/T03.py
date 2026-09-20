#!/usr/bin/env python3
"""T03 — o perfil de jogo do treinador: ele mostra os traços de quem sobe, e repete em clubes diferentes?

Junta o dono de cada rodada (T01) com o jogo a jogo, e mede o perfil DURANTE a passagem — não por
temporada. Os traços são os do índice do A14 que existem jogo a jogo:

    distância da finalização · xG por finalização · entradas na área · toques na área
    duelo defensivo ganho · xG por finalização sofrida · xG sofrido

Ficam de fora dois componentes do índice que são de temporada e não de jogo: `H_dinheiro` (valor do
elenco) e `I_estabilidade_11`. São justamente os dois que o treinador não escolhe — o que torna o
recorte melhor para a pergunta do T03, não pior.

O valor de cada passagem vai para PERCENTIL dentro da temporada, comparado contra a distribuição dos
20 clubes daquele ano. Assim uma passagem de 12 rodadas em 2023 é comparável a uma de 30 em 2025.

Duas perguntas:

1. **Repete em clubes diferentes?** Para quem tem duas ou mais passagens de 10+ rodadas em clubes
   distintos, a correlação entre os perfis e a amplitude de cada traço.
2. **Muda o time quando chega?** Comparação antes e depois, no mesmo clube e na mesma temporada, com
   pelo menos 8 jogos de cada lado — o corte que o CLAUDE.md pede.

Uso:
    python3 _fonte/estudo_serieb/scripts/T03.py
"""
import collections
import csv
import json
import math
import os
import re
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)

import _metodo  # noqa: E402  (precisa do sys.path acima)

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
ANOS = {"2022", "2023", "2024", "2025", "2026"}
MIN_RODADAS = 10
MIN_LADO = 8

# --- a saída por marcador (resultados/T03_numeros.json) ---------------------------------------
# A análise acima roda uma janela só, com 2026 dentro. O TEXTO publicado no T03.json fala de
# "2022 a 2025", e é nessa janela que quase todo marcador foi medido — é o recorte que
# T03_numeros_novos.json declara em cada `de_onde`. Por isso os marcadores saem de uma segunda
# leitura das MESMAS passagens, filtradas por temporada; nada aqui altera a análise, os CSV ou o
# T03_resumo.json. Quatro marcadores são da janela cheia e estão anotados um a um.
GERADO_EM = "2026-09-20"
FECHADAS = {"2022", "2023", "2024", "2025"}
SEMENTE_MARCADORES = 20260917
REPS_NULO_TREINADOR = 30000   # esperado_acaso, esperado_por_acaso, p_permutacao
REPS_FAMILIA = 4000           # bh_familia_7
REPS_ROBUSTEZ = 2000          # robustez_5de7
REPS_BOOT = 4000              # boot_clube_ad
POSICOES_POR_PONTO = 0.2      # 20 clubes numa escala de 0 a 100: 1 posição = 5 pontos
NOME_PT = {"dist_remate": "distância do remate", "entradas_area": "entradas na área",
           "duelo_def": "duelo defensivo", "xg": "xG criado", "xg_contra": "xG sofrido",
           "xg_por_remate": "xG por remate", "xg_por_remate_contra": "xG por remate sofrido"}

# traço -> (coluna no jogo a jogo, sinal). Sinal +1 = mais é melhor.
TRACOS = {
    "dist_remate": ("Distância média do remate", -1),
    "entradas_area": ("Entradas na grande área", 1),
    "duelo_def": ("Duelos defensivos ganhos, %", 1),
    "xg": ("Golos esperados", 1),
    "remates": ("Remates", 1),
}


def jogos():
    linhas = []
    with open(os.path.join(DADOS, "serieb_jogos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r.get("Competição") != "Brazil. Serie B":
                continue
            m = re.match(r"(\d{4})-\d{2}-\d{2}", r["Data"] or "")
            if not m or m.group(1) not in ANOS:
                continue
            def num(c):
                try:
                    return float(r[c])
                except (TypeError, ValueError, KeyError):
                    return None
            l = {"ano": m.group(1), "data": r["Data"][:10], "clube": r["Equipa"],
                 "adv": r["adversario"],
                 # só os marcadores de ponto por jogo usam estas duas; o perfil não as vê
                 "golos_pro": num("golos_pro"), "golos_contra": num("golos_contra")}
            for t, (col, _) in TRACOS.items():
                l[t] = num(col)
            linhas.append(l)
    idx = {(l["ano"], l["data"], l["clube"]): l for l in linhas}
    for l in linhas:
        o = idx.get((l["ano"], l["data"], l["adv"]))
        l["xg_contra"] = o["xg"] if o else None
        l["remates_contra"] = o["remates"] if o else None
    return linhas


def perfil(js):
    """O perfil de um conjunto de jogos: os traços derivados, ou None se faltar dado."""
    def m(c):
        v = [j[c] for j in js if j.get(c) is not None]
        return sum(v) / len(v) if v else None
    p = {"dist_remate": m("dist_remate"), "entradas_area": m("entradas_area"),
         "duelo_def": m("duelo_def"), "xg": m("xg"), "xg_contra": m("xg_contra")}
    xg, rem = m("xg"), m("remates")
    xgc, remc = m("xg_contra"), m("remates_contra")
    p["xg_por_remate"] = (xg / rem) if xg is not None and rem else None
    p["xg_por_remate_contra"] = (xgc / remc) if xgc is not None and remc else None
    return p


TRACO_SINAL = {"dist_remate": -1, "entradas_area": 1, "duelo_def": 1, "xg": 1,
               "xg_contra": -1, "xg_por_remate": 1, "xg_por_remate_contra": -1}


# ----------------------------------------------------------------------------------------------
# Os marcadores — nada abaixo daqui muda a análise; tudo aqui é leitura dela
# ----------------------------------------------------------------------------------------------
def _br(v, casas):
    """0.609 -> '0,609'. O -0,00 vira 0,00: sinal em zero é ruído de arredondamento."""
    x = round(float(v), casas)
    if x == 0:
        x = 0.0
    return f"{x:.{casas}f}".replace(".", ",")


def pontos_por_jogo(js):
    """Pontos por jogo derivados de golos_pro/golos_contra (3/1/0). Devolve (média, n)."""
    v = [3 if j["golos_pro"] > j["golos_contra"] else (1 if j["golos_pro"] == j["golos_contra"]
                                                       else 0)
         for j in js if j["golos_pro"] is not None and j["golos_contra"] is not None]
    return ((sum(v) / len(v)) if v else None), len(v)


def matriz_do_perfil(ps):
    """(M, clubes, treinadores, rho, sinal) das passagens.

    `rho` é o Spearman entre dois perfis feito como Pearson dos postos dos 7 traços — a matriz
    inteira de uma vez, que é o segundo caminho que T03_numeros_novos.json declara. `sinal` diz de
    que lado do meio da tabela (percentil 50) cada traço caiu: +1 acima, -1 abaixo, 0 em cima.
    """
    tr = list(TRACO_SINAL)
    M = np.array([[p[t] for t in tr] for p in ps], dtype=float)
    postos = np.apply_along_axis(stats.rankdata, 1, M)
    z = postos - postos.mean(axis=1, keepdims=True)
    n = np.linalg.norm(z, axis=1, keepdims=True)
    n[n == 0] = np.nan                       # perfil chapado não tem correlação definida
    z = z / n
    return (M, np.array([p["clube"] for p in ps]), np.array([p["treinador"] for p in ps]),
            z @ z.T, np.sign(M - 50))


def pares_entre_clubes(rotulos, clubes):
    """Para cada rótulo de treinador, os pares das suas passagens em CLUBES distintos."""
    idx = collections.defaultdict(list)
    for i, t in enumerate(rotulos):
        idx[t].append(i)
    grupos = []
    for ii in idx.values():
        pares = [(i, j) for k, i in enumerate(ii) for j in ii[k + 1:] if clubes[i] != clubes[j]]
        if pares:
            grupos.append(pares)
    return grupos


def estatisticas_do_rotulo(grupos, rho, sinal, linha):
    """O que se mede sobre um rótulo de treinador — o de verdade ou um embaralhado.

    Devolve (rho médio por treinador, quantos passam da linha, proporção por traço de
    comparações do mesmo lado do meio, n de comparações, quantos treinadores coincidem em 5+).
    """
    medias, n_acima, n_5de7 = [], 0, 0
    ok, tot = np.zeros(len(TRACO_SINAL)), 0
    for pares in grupos:
        rr = [rho[i, j] for i, j in pares if not np.isnan(rho[i, j])]
        if rr:
            m = float(np.mean(rr))
            medias.append(m)
            if m > linha:
                n_acima += 1
        coincidencias = []
        for i, j in pares:
            mesmo = (sinal[i] == sinal[j]) & (sinal[i] != 0)
            ok = ok + mesmo
            tot += 1
            coincidencias.append(int(mesmo.sum()))
        if coincidencias and float(np.mean(coincidencias)) >= 5:
            n_5de7 += 1
    return medias, n_acima, (ok / tot if tot else ok), tot, n_5de7


def marcadores(passagens, jogos_da_passagem, antes_depois, jogos_da_troca, percentil,
               linha_p90, repete):
    """Os 36 marcadores que o T03.json publica, calculados aqui — nenhum digitado.

    `linha_p90` e os dois rho nomeados são da janela CHEIA (a que a análise roda); o resto é da
    janela 2022–2025, que é a que o texto declara e a que cada `de_onde` de
    T03_numeros_novos.json nomeia.
    """
    tr = list(TRACO_SINAL)
    n = {}
    n["n_tracos"] = len(tr)
    n["linha_p90"] = linha_p90
    por_nome = {x["treinador"]: x["rho_medio_entre_clubes"] for x in repete}
    n["claud_rho"] = por_nome.get("Claudinei Oliveira")
    n["eb_rho"] = por_nome.get("Eduardo Baptista")

    # ---------------- T03-1: as passagens de 2022 a 2025 ----------------
    P = [p for p in passagens if p["temporada"] in FECHADAS]
    n["n_pass"] = len(P)
    n["n_tec"] = len({p["treinador"] for p in P})
    M, clubes, tecs, rho, sinal = matriz_do_perfil(P)
    grupos = pares_entre_clubes(tecs, clubes)
    medias, n_acima, prop, n_pares, n_5de7 = estatisticas_do_rotulo(grupos, rho, sinal, linha_p90)
    n["multi"] = len(grupos)
    n["n_um_par"] = sum(1 for g in grupos if len(g) == 1)
    n["n_acima"] = n_acima
    n["rho_treinador"] = round(float(np.mean(medias)), 3)
    n["dist_mesmo_lado"] = int(round(float(prop[tr.index("dist_remate")]) * 10))

    # pares do MESMO clube com treinadores diferentes: a contraprova do "é do clube"
    por_clube = collections.defaultdict(list)
    for i, p in enumerate(P):
        por_clube[p["clube"]].append(i)
    pares_clube = [(i, j) for ii in por_clube.values()
                   for k, i in enumerate(ii) for j in ii[k + 1:] if tecs[i] != tecs[j]]
    rc = [rho[i, j] for i, j in pares_clube if not np.isnan(rho[i, j])]
    n["n_pares_clube"] = len(pares_clube)
    n["rho_clube"] = round(float(np.mean(rc)), 3)

    # o acaso: embaralhar o rótulo de treinador preservando clube e n de passagens por nome
    rng = np.random.default_rng(SEMENTE_MARCADORES)
    acima_nulo, rho_nulo = [], []
    for _ in range(REPS_NULO_TREINADOR):
        g = pares_entre_clubes(rng.permutation(tecs), clubes)
        m_, a_, _p, _t, _5 = estatisticas_do_rotulo(g, rho, sinal, linha_p90)
        acima_nulo.append(a_)
        rho_nulo.append(float(np.mean(m_)) if m_ else np.nan)
    n["esperado_acaso"] = round(float(np.mean(acima_nulo)), 2)
    passou = int(np.sum(np.array(rho_nulo) >= n["rho_treinador"]))
    n["p_permutacao"] = round((1 + passou) / (1 + REPS_NULO_TREINADOR), 3)

    # o mesmo acaso na janela CHEIA — o par que o texto cita entre parênteses
    Mc, clubes_c, tecs_c, rho_c, sinal_c = matriz_do_perfil(passagens)
    rng_c = np.random.default_rng(SEMENTE_MARCADORES)
    acima_cheia = [estatisticas_do_rotulo(pares_entre_clubes(rng_c.permutation(tecs_c), clubes_c),
                                          rho_c, sinal_c, linha_p90)[1]
                   for _ in range(REPS_NULO_TREINADOR)]
    n["esperado_por_acaso"] = round(float(np.mean(acima_cheia)), 2)

    # a família dos 7: um teste por traço, contra o mesmo embaralhamento
    rng_f = np.random.default_rng(SEMENTE_MARCADORES)
    props = np.array([estatisticas_do_rotulo(pares_entre_clubes(rng_f.permutation(tecs), clubes),
                                             rho, sinal, linha_p90)[2]
                      for _ in range(REPS_FAMILIA)])
    ps = [(1 + int(np.sum(props[:, i] >= prop[i]))) / (1 + REPS_FAMILIA) for i in range(len(tr))]
    qs = _metodo.bh(ps)
    ordem = sorted(range(len(tr)), key=lambda i: (qs[i], ps[i]))
    n["bh_familia_7"] = " · ".join(f"{tr[i]} q={_br(qs[i], 3)}" for i in ordem)

    # contado de outro jeito: traços do mesmo lado, em vez da forma do perfil inteiro
    rng_r = np.random.default_rng(SEMENTE_MARCADORES)
    n5_nulo = [estatisticas_do_rotulo(pares_entre_clubes(rng_r.permutation(tecs), clubes),
                                      rho, sinal, linha_p90)[4]
               for _ in range(REPS_ROBUSTEZ)]
    n["robustez_5de7"] = (f"{n_5de7} treinadores contra "
                          f"{_br(float(np.mean(n5_nulo)), 1)} esperados")

    # o teto de medida: a mesma passagem cortada em jogos pares e ímpares
    metades = []
    for p in P:
        g = jogos_da_passagem[(p["treinador"], p["clube"], p["temporada"], p["inicio"])]
        pares_, impares = g[0::2], g[1::2]
        pa, pi = perfil(pares_), perfil(impares)
        metades.append({t: (percentil(p["temporada"], t, pa[t]),
                            percentil(p["temporada"], t, pi[t])) for t in tr})
    mesmo_lado = [sum(1 for t in tr
                      if None not in l[t] and ((l[t][0] > 50 and l[t][1] > 50)
                                               or (l[t][0] < 50 and l[t][1] < 50)))
                  for l in metades]
    n["meia_meia"] = round(float(np.mean(mesmo_lado)), 1)
    teto = {}
    for t in tr:
        xs = [l[t][0] for l in metades if None not in l[t]]
        ys = [l[t][1] for l in metades if None not in l[t]]
        r = float(stats.pearsonr(xs, ys)[0])
        teto[t] = round(2 * r / (1 + r), 2)       # Spearman-Brown: a passagem inteira, não a metade
    n["teto_por_traco"] = " · ".join(f"{t} {_br(v, 2)}"
                                     for t, v in sorted(teto.items(), key=lambda x: -x[1]))

    # ---------------- T03-2: as trocas de 2022 a 2025 ----------------
    AD = [(l, j) for l, j in zip(antes_depois, jogos_da_troca) if l["temporada"] in FECHADAS]
    n["ad_n"] = len(AD)
    n["ad_ct"] = len({(l["clube"], l["temporada"]) for l, _ in AD})
    n["ad_cl"] = len({l["clube"] for l, _ in AD})
    mudou = {t: [l[t + "_mudou"] for l, _ in AD if l[t + "_mudou"] is not None] for t in tr}
    mexe = {t: float(np.median(np.abs(v))) * POSICOES_POR_PONTO for t, v in mudou.items()}
    n["ad_mexe_min"] = round(min(mexe.values()), 1)
    n["ad_mexe_max"] = round(max(mexe.values()), 1)

    # poder do desenho PAREADO (o mesmo clube antes e depois), não o de dois grupos
    d_min = (stats.norm.ppf(0.975) + stats.norm.ppf(0.80)) / math.sqrt(len(AD))
    detec = {t: d_min * float(np.std(v, ddof=1)) * POSICOES_POR_PONTO for t, v in mudou.items()}
    n["dmin_min"] = round(min(detec.values()), 1)
    n["dmin_max"] = round(max(detec.values()), 1)

    pa = [pontos_por_jogo(j["antes"])[0] for _, j in AD]
    pd_ = [pontos_por_jogo(j["depois"])[0] for _, j in AD]
    n["pts_antes"] = round(float(np.mean(pa)), 2)
    n["pts_depois"] = round(float(np.mean(pd_)), 2)
    n["ad_sobe"] = sum(1 for a, b in zip(pa, pd_) if b > a)
    n["ad_sobe_desce"] = " · ".join(f"{sum(1 for x in mudou[t] if x > 0)}/"
                                    f"{sum(1 for x in mudou[t] if x < 0)}" for t in tr)

    ps_ad = [float(stats.wilcoxon(mudou[t])[1]) for t in tr]
    qs_ad = _metodo.bh(ps_ad)
    menor = min(range(len(tr)), key=lambda i: ps_ad[i])
    if len(set(round(q, 3) for q in qs_ad)) == 1:
        n["bh_ad"] = (f"todos os {len(tr)} com q = {_br(qs_ad[0], 3)} "
                      f"(menor p = {_br(ps_ad[menor], 3)}, no {NOME_PT[tr[menor]]})")
    else:
        n["bh_ad"] = " · ".join(f"{t} q={_br(q, 3)}" for t, q in zip(tr, qs_ad))

    # IC95 reamostrando CLUBE, não troca: 66 trocas não são 66 observações independentes
    rng_b = np.random.default_rng(SEMENTE_MARCADORES)
    por_clube_ad = collections.defaultdict(list)
    for l, _ in AD:
        por_clube_ad[l["clube"]].append(l)
    nomes = list(por_clube_ad)
    boot = {t: [] for t in tr}
    for _ in range(REPS_BOOT):
        am = [l for c in rng_b.choice(nomes, len(nomes), replace=True) for l in por_clube_ad[c]]
        for t in tr:
            v = [l[t + "_mudou"] for l in am if l[t + "_mudou"] is not None]
            if v:
                boot[t].append(float(np.median(v)))
    ics = {t: (float(np.percentile(v, 2.5)), float(np.percentile(v, 97.5)))
           for t, v in boot.items()}
    cruzam = [t for t, (lo, hi) in ics.items() if lo <= 0 <= hi]
    n["boot_clube_ad"] = (f"os {len(tr)} IC95 por reamostragem de clube cruzam zero"
                          if len(cruzam) == len(tr)
                          else " · ".join(f"{t} [{_br(lo, 1)}; {_br(hi, 1)}]"
                                          for t, (lo, hi) in ics.items()))

    # o placebo: a mesma conta SEM troca nenhuma, a passagem de um treinador só cortada ao meio
    placebo = []
    for (tec, clube, ano, ini), g in jogos_da_passagem.items():
        if ano not in FECHADAS:
            continue
        meio = len(g) // 2
        if meio < MIN_LADO or len(g) - meio < MIN_LADO:
            continue
        placebo.append((pontos_por_jogo(g[:meio])[0], pontos_por_jogo(g[meio:])[0]))
    n["placebo_n"] = len(placebo)
    n["placebo_antes"] = round(float(np.mean([a for a, _ in placebo])), 2)
    n["placebo_depois"] = round(float(np.mean([b for _, b in placebo])), 2)
    return n


def main():
    js = jogos()
    por_ct = collections.defaultdict(list)
    for l in js:
        por_ct[(l["ano"], l["clube"])].append(l)

    # a distribuição dos 20 clubes de cada ano, para virar percentil
    dist = collections.defaultdict(lambda: collections.defaultdict(list))
    for (ano, clube), g in por_ct.items():
        p = perfil(g)
        for t, v in p.items():
            if v is not None:
                dist[ano][t].append(v)

    def percentil(ano, t, v):
        d = dist[ano][t]
        if v is None or not d:
            return None
        pc = stats.percentileofscore(d, v, kind="mean")
        return pc if TRACO_SINAL[t] > 0 else 100 - pc

    donos = [r for r in csv.DictReader(open(os.path.join(R, "T01_rodada_treinador.csv"),
                                            encoding="utf-8")) if r["temporada"] in ANOS]
    por_pass = collections.defaultdict(list)
    for d in donos:
        por_pass[(d["treinador"], d["clube_wyscout"], d["temporada"], d["inicio"])].append(d)
    data_de = {(l["ano"], l["clube"], l["data"]) for l in js}
    jog_por = {(l["ano"], l["clube"], l["data"]): l for l in js}

    passagens = []
    jogos_da_passagem = {}   # só para os marcadores: os jogos de cada passagem, em ordem de data
    for (tec, clube, ano, ini), ds in por_pass.items():
        if len(ds) < MIN_RODADAS or ds[0]["interino"] == "1":
            continue
        meus = [jog_por[(ano, clube, d["data"])] for d in ds
                if (ano, clube, d["data"]) in jog_por]
        if len(meus) < MIN_RODADAS:
            continue
        jogos_da_passagem[(tec, clube, ano, ini)] = sorted(meus, key=lambda j: j["data"])
        p = perfil(meus)
        linha = {"treinador": tec, "clube": clube, "temporada": ano, "rodadas": len(meus),
                 "inicio": ini}
        for t, v in p.items():
            linha[t] = round(percentil(ano, t, v), 1) if percentil(ano, t, v) is not None else None
        passagens.append(linha)
    tr = [t for t in TRACO_SINAL]
    passagens = [p for p in passagens if all(p[t] is not None for t in tr)]
    print(f"passagens com 10+ rodadas e perfil completo: {len(passagens)} · "
          f"{len({p['treinador'] for p in passagens})} treinadores")

    # ---- 1. repete em clubes diferentes? ----
    por_tec = collections.defaultdict(list)
    for p in passagens:
        por_tec[p["treinador"]].append(p)
    multi = {k: v for k, v in por_tec.items() if len({x["clube"] for x in v}) >= 2}
    repete = []
    for tec, ps in multi.items():
        amp = {t: round(max(x[t] for x in ps) - min(x[t] for x in ps), 1) for t in tr}
        pares = [(a, b) for i, a in enumerate(ps) for b in ps[i + 1:] if a["clube"] != b["clube"]]
        rhos = []
        for a, b in pares:
            rho, _ = stats.spearmanr([a[t] for t in tr], [b[t] for t in tr])
            if not np.isnan(rho):
                rhos.append(float(rho))
        repete.append({"treinador": tec, "passagens": len(ps),
                       "clubes": len({x["clube"] for x in ps}),
                       "rho_medio_entre_clubes": round(float(np.mean(rhos)), 3) if rhos else None,
                       "amplitude_mediana": round(float(np.median(list(amp.values()))), 1),
                       "amplitude_por_traco": amp})
    repete.sort(key=lambda x: -(x["rho_medio_entre_clubes"] or -9))

    # a linha de base: dois clube-temporadas quaisquer se parecem quanto?
    todos = [p for p in passagens]
    nulo = []
    rng = np.random.default_rng(20260917)
    for _ in range(2000):
        a, b = rng.choice(len(todos), 2, replace=False)
        rho, _ = stats.spearmanr([todos[a][t] for t in tr], [todos[b][t] for t in tr])
        if not np.isnan(rho):
            nulo.append(float(rho))

    # ---- 2. antes e depois, no mesmo clube e temporada ----
    antes_depois = []
    jogos_da_troca = []   # só para os marcadores: os jogos de cada lado, na ordem de antes_depois
    for (tec, clube, ano, ini), ds in por_pass.items():
        if ds[0]["interino"] == "1":
            continue
        todas = sorted([d for d in donos if d["clube_wyscout"] == clube
                        and d["temporada"] == ano], key=lambda d: int(d["rodada"]))
        rodadas_dele = {int(d["rodada"]) for d in ds}
        if not rodadas_dele:
            continue
        r0 = min(rodadas_dele)
        antes = [jog_por[(ano, clube, d["data"])] for d in todas
                 if int(d["rodada"]) < r0 and (ano, clube, d["data"]) in jog_por]
        depois = [jog_por[(ano, clube, d["data"])] for d in todas
                  if int(d["rodada"]) in rodadas_dele and (ano, clube, d["data"]) in jog_por]
        if len(antes) < MIN_LADO or len(depois) < MIN_LADO:
            continue
        pa, pd_ = perfil(antes), perfil(depois)
        l = {"treinador": tec, "clube": clube, "temporada": ano,
             "jogos_antes": len(antes), "jogos_depois": len(depois)}
        for t in tr:
            a = percentil(ano, t, pa[t]); b = percentil(ano, t, pd_[t])
            l[t + "_antes"] = round(a, 1) if a is not None else None
            l[t + "_depois"] = round(b, 1) if b is not None else None
            l[t + "_mudou"] = round(b - a, 1) if a is not None and b is not None else None
        antes_depois.append(l)
        jogos_da_troca.append({"antes": antes, "depois": depois})

    with open(os.path.join(R, "T03_passagens.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(passagens[0]))
        w.writeheader(); w.writerows(passagens)
    if antes_depois:
        with open(os.path.join(R, "T03_antes_depois.csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(antes_depois[0]))
            w.writeheader(); w.writerows(antes_depois)

    mudancas = {t: [l[t + "_mudou"] for l in antes_depois if l[t + "_mudou"] is not None]
                for t in tr}
    json.dump({"tracos": tr, "n_passagens": len(passagens),
               "n_treinadores": len({p["treinador"] for p in passagens}),
               "multiclube": len(multi),
               "repete": repete,
               "nulo_dois_quaisquer": {"rho_medio": round(float(np.mean(nulo)), 3),
                                       "p50": round(float(np.percentile(nulo, 50)), 3),
                                       "p90": round(float(np.percentile(nulo, 90)), 3),
                                       "n": len(nulo)},
               "antes_depois": {"n": len(antes_depois),
                                "por_traco": {t: {"mediana": round(float(np.median(v)), 1),
                                                  "n": len(v),
                                                  "p_wilcoxon": round(float(stats.wilcoxon(v)[1]), 4)
                                                  if len(v) > 5 else None}
                                              for t, v in mudancas.items() if v}}},
              open(os.path.join(R, "T03_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*84}\nO PERFIL REPETE EM CLUBES DIFERENTES? ({len(multi)} treinadores multiclube)\n{'='*84}")
    print(f"{'treinador':24s} {'pass':>4s} {'cl':>3s} {'rho entre clubes':>17s} {'amplitude mediana':>18s}")
    for x in repete[:14]:
        print(f"{x['treinador'][:24]:24s} {x['passagens']:4d} {x['clubes']:3d} "
              f"{(x['rho_medio_entre_clubes'] if x['rho_medio_entre_clubes'] is not None else 0):17.2f} "
              f"{x['amplitude_mediana']:18.1f}")
    nl = json.load(open(os.path.join(R, "T03_resumo.json"), encoding="utf-8"))["nulo_dois_quaisquer"]
    print(f"\n  linha de base — duas passagens QUAISQUER: rho médio {nl['rho_medio']}, "
          f"mediana {nl['p50']}, percentil 90 {nl['p90']}")

    print(f"\n{'='*84}\nANTES E DEPOIS DA CHEGADA, mesmo clube e temporada ({len(antes_depois)} casos)\n{'='*84}")
    print(f"{'traço':24s} {'mudança mediana':>16s} {'n':>4s} {'p (Wilcoxon)':>13s}")
    for t, v in mudancas.items():
        if v:
            p = stats.wilcoxon(v)[1] if len(v) > 5 else float("nan")
            print(f"{t:24s} {np.median(v):+16.1f} {len(v):4d} {p:13.4f}")

    # ---- 3. os marcadores que o T03.json publica ----
    numeros = marcadores(passagens, jogos_da_passagem, antes_depois, jogos_da_troca, percentil,
                         round(float(np.percentile(nulo, 90)), 3), repete)
    json.dump({"gerado_por": "scripts/T03.py", "gerado_em": GERADO_EM, "numeros": numeros},
              open(os.path.join(R, "T03_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n{'='*84}\nMARCADORES ({len(numeros)}) → T03_numeros.json\n{'='*84}")
    for k, v in numeros.items():
        print(f"  {k:22s} {v}")


if __name__ == "__main__":
    main()
