#!/usr/bin/env python3
"""J03 — o titular de quem sobe, no técnico.

Lista em `resultados/J03_indicadores.json`, fechada antes de rodar (com uma emenda datada: dois
nomes de coluna não existiam na base). Método: Welch no percentil, d de Cohen, BH por família.

## A armadilha da coluna de clube

`serieb_tecnico.csv` tem DUAS colunas de clube. `Equipa` traz o clube ATUAL do atleta e tem 531
valores distintos — está errada. A certa é `Equipa dentro de um período de tempo seleccionado`, com
42. Confundir as duas atribui o atleta ao clube errado em boa parte das linhas, em silêncio, porque
os dois nomes são de clube. (gerar_prototipo.py:528-540)

## Quem é titular

Por clube-temporada e por setor, os jogadores de mais minutos: 1 no gol, 2 na zaga, 2 no lateral,
2 no volante, 2 na meia, 2 no extremo e 2 no ataque. Com 900 minutos no mínimo, que é o corte que o
CLAUDE.md exige para entrar em percentil.

## O percentil

Dentro da mesma POSIÇÃO e TEMPORADA, entre TODOS os jogadores com 900+ minutos — não só entre
titulares. Assim o titular de quem sobe é comparado à liga, e não apenas aos seus pares.

## A saída dos números (20/09, etapa 6 do PLANO.md)

O script passou a gravar `resultados/J03_numeros.json`: todo marcador que `J03.json` publica sai
daqui, com o nome do marcador como chave. **A análise não mudou** — `J03_testes.csv` e
`J03_resumo.json` continuam idênticos byte a byte aos de 19/09. O que se acrescentou foi
(a) gravar, e (b) calcular os marcadores que até 19/09 só existiam digitados no `J03.json`:
os quatro cruzamentos (normalização por setor × por posição, com × sem os times de fronteira),
o poder por desenho contado em clube-temporada, a bola alta do goleiro em unidade de jogo e o
duelo defensivo do time inteiro. O corte com fronteira e a normalização por setor reproduzem o
`J03_testes.csv` publicado linha a linha — é essa reprodução que prova que os cortes novos saem
do mesmo código, e não de uma reimplementação.

Uso:
    python3 _fonte/estudo_serieb/scripts/J03.py
"""
import collections
import csv
import json
import os
import re
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import bh, cohen_d, d_minimo, pct, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
COL_CLUBE = "Equipa dentro de um período de tempo seleccionado"
MIN_MINUTOS = 900
QUANTOS = {"Goleiro": 1, "Zaga": 2, "Lateral": 2, "Volante": 2, "Meia": 2,
           "Extremo": 2, "Atacante": 2}
# Os dois sufixos de percentil. O primeiro é o que o script sempre usou (por SETOR) e é o que
# escreve J03_testes.csv; o segundo é a normalização DECLARADA em J03_indicadores.json (por
# POSIÇÃO) e só alimenta o cruzamento de robustez. Nenhum dos dois pode colidir com nome de
# coluna — é o aviso do _metodo.py.
PCT_SETOR = "::pct"
PCT_POSICAO = "::pctpos"
# Fora da lista pré-declarada: não entra em teste nenhum, não é rankeada e não filtra a base.
# Só alimenta marcador de tela (a bola alta do goleiro em unidade de jogo).
EXTRAS = ["Duelos aéreos/90"]
# Data fixa, de propósito: o script é reprodutível (mesma base, mesma saída), e carimbo de relógio
# faria a saída "mudar" a cada rodada sem que número nenhum tivesse mudado.
GERADO_EM = "2026-09-20"
DUELO_DEF = "Duelos defensivos ganhos, %"
AEREO = "Duelos aéreos ganhos, %"
FALTAS = "Faltas/90"
PASSES = "Passes certos, %"
INTERCECOES = "Interceções ajust. à posse"


def percentil(eleg, inds, chave, sufixo):
    """O posto de 0 a 100 dentro de (temporada × `chave`), entre quem tem 900+ minutos."""
    por = collections.defaultdict(list)
    for l in eleg:
        por[(l["ano"], l[chave])].append(l)
    for g in por.values():
        for i in inds:
            r = stats.rankdata([l[i["id"]] for l in g])
            for l, rr in zip(g, r):
                p = 100 * (rr - 1) / max(1, len(g) - 1)
                l[i["id"] + sufixo] = p if i["sinal"] > 0 else 100 - p


def comparar_setores(titulares, dec, sufixo, sem_fronteira=False, verboso=False):
    """Sobe × Meio em cada setor, no percentil `sufixo`. Welch, d de Cohen e BH por família.

    É a MESMA função para o corte publicado e para os cortes de robustez: o que muda entre eles é
    só o percentil usado e o filtro de fronteira. Rodar o corte publicado por aqui e conferir
    contra J03_testes.csv é o que prova que os outros três cortes não são reimplementação.
    """
    res = []
    for setor in QUANTOS:
        def grupo(f):
            return [l for l in titulares if l["setor"] == setor and l["faixa"] == f
                    and not (sem_fronteira and l["fronteira"])]
        sobe, meio = grupo("Sobe"), grupo("Meio")
        if len(sobe) < 4 or len(meio) < 8:
            if verboso:
                print(f"  {setor}: n insuficiente ({len(sobe)} × {len(meio)}), fica de fora")
            continue
        for fam in dec["familias"]:
            ps, itens = [], []
            for i in fam["indicadores"]:
                k = i["id"] + sufixo
                a = [l[k] for l in sobe]; b = [l[k] for l in meio]
                _, p = stats.ttest_ind(a, b, equal_var=False)
                itens.append({"setor": setor, "familia": fam["id"], "indicador": i["id"],
                              "n_sobe": len(a), "n_meio": len(b),
                              "pct_sobe": round(float(np.median(a)), 1),
                              "pct_meio": round(float(np.median(b)), 1),
                              "cru_sobe": round(float(np.median([l[i["id"]] for l in sobe])), 3),
                              "cru_meio": round(float(np.median([l[i["id"]] for l in meio])), 3),
                              "d": round(cohen_d(a, b), 3), "p": round(float(p), 5),
                              "d_minimo_80": d_minimo(len(a), len(b))})
                ps.append(float(p))
            for it, q in zip(itens, bh(ps)):
                it["q"] = round(q, 5)
                it["selo"] = ("firme" if q < 0.05 else
                              ("pode ser sorte" if it["p"] < 0.05 else "sem diferença clara"))
            res += itens
    return res


def duelo_do_time(anos):
    """O duelo defensivo por CLUBE-temporada: a média dos jogos de Série B, como o A06 o monta.

    `serieb_jogos.csv` é a única base que tem duelo defensivo — e só jogo a jogo. O A06 agrega
    pela média dos jogos da temporada; aqui se refaz a mesma agregação, sem ler o A06, para que o
    marcador do time saia de um cálculo e não de um número importado à mão.
    """
    por_ct = collections.defaultdict(list)
    with open(os.path.join(DADOS, "serieb_jogos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r.get("Competição") != "Brazil. Serie B":
                continue
            m = re.match(r"(\d{4})-\d{2}-\d{2}", r["Data"] or "")
            if not m or m.group(1) not in anos:
                continue
            try:
                v = float(r[DUELO_DEF])
            except (TypeError, ValueError, KeyError):
                continue
            por_ct[(m.group(1), r["Equipa"])].append(v)
    return {k: sum(v) / len(v) for k, v in por_ct.items()}


def main():
    dec = json.load(open(os.path.join(R, "J03_indicadores.json"), encoding="utf-8"))
    anos = {str(a) for a in dec["recorte"]["temporadas"]}
    setor_de = {p: s for s, ps in dec["setores"].items() for p in ps}
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]
    sinal = {i["id"]: i["sinal"] for i in inds}

    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    faixa = {k: r["faixa"] for k, r in a01.items()}
    # A coluna de fronteira do A01. O CLAUDE.md manda rodar toda comparação entre faixas também
    # sem esses times; até 19/09 o J03 rodava um corte só, e o segundo corte era digitado no texto.
    fronteira = {k: r["fronteira"] == "1" for k, r in a01.items()}
    ponte = json.load(open(os.path.join(R, "T01_ponte_clubes.json"), encoding="utf-8"))

    linhas = []
    with open(os.path.join(DADOS, "serieb_tecnico.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r["ano"] not in anos:
                continue
            try:
                mi = float(r["Minutos jogados:"])
            except (TypeError, ValueError):
                continue
            s = setor_de.get(r["posicao_1"])
            if not s:
                continue
            clube = ponte.get(r[COL_CLUBE], r[COL_CLUBE])
            l = {"ano": r["ano"], "jogador": r["Jogador"], "clube": clube,
                 "posicao": r["posicao_1"], "setor": s, "minutos": mi,
                 "faixa": faixa.get((r["ano"], clube)),
                 "fronteira": fronteira.get((r["ano"], clube), False)}
            for c in EXTRAS:
                try:
                    l[c] = float(r[c]) if r.get(c) not in (None, "", "nan") else None
                except ValueError:
                    l[c] = None
            ok = True
            for i in inds:
                v = r.get(i["id"])
                try:
                    l[i["id"]] = float(v) if v not in (None, "", "nan") else None
                except ValueError:
                    l[i["id"]] = None
                ok = ok and l[i["id"]] is not None
            if ok:
                linhas.append(l)
    print(f"jogador-temporadas com todos os indicadores: {len(linhas)}")
    print(f"  com faixa do clube: {sum(1 for l in linhas if l['faixa'])}")
    print(f"  com {MIN_MINUTOS}+ minutos: {sum(1 for l in linhas if l['minutos'] >= MIN_MINUTOS)}")

    # percentil dentro de POSIÇÃO e TEMPORADA, entre quem tem 900+ minutos
    elegiveis = [l for l in linhas if l["minutos"] >= MIN_MINUTOS]
    percentil(elegiveis, inds, "setor", PCT_SETOR)

    # titulares: os N de mais minutos por clube-temporada e setor
    por_ct = collections.defaultdict(list)
    for l in elegiveis:
        if l["faixa"]:
            por_ct[(l["ano"], l["clube"], l["setor"])].append(l)
    titulares = []
    for (ano, clube, setor), g in por_ct.items():
        g.sort(key=lambda l: -l["minutos"])
        for l in g[:QUANTOS[setor]]:
            l["titular"] = 1
            titulares.append(l)
    print(f"  titulares identificados: {len(titulares)}")
    cob = collections.Counter((l["setor"], l["faixa"]) for l in titulares)

    res = comparar_setores(titulares, dec, PCT_SETOR, verboso=True)

    with open(os.path.join(R, "J03_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)
    firmes = [r for r in res if r["selo"] == "firme"]
    json.dump({"n_titulares": len(titulares), "n_testes": len(res), "firmes": len(firmes),
               "firmes_detalhe": firmes,
               "por_setor": {s: {"firmes": sum(1 for r in firmes if r["setor"] == s),
                                 "testes": sum(1 for r in res if r["setor"] == s),
                                 "n_sobe": cob.get((s, "Sobe"), 0),
                                 "n_meio": cob.get((s, "Meio"), 0)}
                             for s in QUANTOS},
               "minimo_minutos": MIN_MINUTOS},
              open(os.path.join(R, "J03_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*100}\nO TITULAR DE QUEM SOBE × O TITULAR DO MEIO — só o que passou no BH\n{'='*100}")
    if not firmes:
        print("  nenhum indicador passou em nenhum setor.")
    for r in sorted(firmes, key=lambda x: (x["setor"], -abs(x["d"]))):
        print(f"  {r['setor']:9s} {r['indicador'][:34]:34s} {r['cru_sobe']:8.2f} vs {r['cru_meio']:8.2f} "
              f"· percentil {r['pct_sobe']:5.1f} vs {r['pct_meio']:5.1f} · d {r['d']:+5.2f} · q {r['q']:.4f}")
    print(f"\n{'='*100}\nPOR SETOR: quantos passaram, e com que amostra\n{'='*100}")
    j = json.load(open(os.path.join(R, "J03_resumo.json"), encoding="utf-8"))["por_setor"]
    for s, d in j.items():
        print(f"  {s:9s} {d['firmes']:2d} de {d['testes']:2d} · titulares: "
              f"{d['n_sobe']} de quem sobe, {d['n_meio']} do meio")

    # ==============================================================================================
    # A SAÍDA DOS NÚMEROS — resultados/J03_numeros.json
    # ==============================================================================================
    # Etapa 6 do PLANO.md, regras 1 e 9 do portão: todo marcador que J03.json publica tem de SAIR
    # daqui, com o nome do marcador como chave. Nada abaixo muda a análise — as medianas, os d, os
    # q e os selos de J03_testes.csv e de J03_resumo.json são os que já foram calculados acima e
    # continuam idênticos. O que se acrescenta é (a) gravar, e (b) calcular os marcadores que até
    # 19/09 só existiam digitados no J03.json.
    #
    # Os que faltavam, e de onde saem (o campo `de_onde` de J03_numeros_novos.json):
    #   n_usado, n_sobe_tot, n_meio_tot → contagem de titulares por faixa. Não corrige n_tit: os
    #       184 titulares do Cai são identificados e nunca comparados, porque a única comparação
    #       declarada em J03_indicadores.json é Sobe × Meio.
    #   n_ind_setor → 3 famílias × 4 indicadores da lista declarada.
    #   gk_ind_vazios → quantas das 12 linhas do Goleiro têm mediana zero nos DOIS grupos.
    #   firmes_dois_cortes → os quatro cruzamentos: normalização por setor × por POSIÇÃO (a que
    #       J03_indicadores.json declara) e com × sem os times de fronteira. Firme é o que passa
    #       nos DOIS cortes, como resultados/_metodo_fronteira.md manda. Pela normalização
    #       declarada a interseção tem UM item (Lateral / "Passes certos, %"); pela normalização
    #       como o código roda (por setor) ela é ZERO — os dois estão impressos abaixo.
    #   d_min_menor, d_min_maior, d_min_sem_menor, d_min_sem_maior → _metodo.d_minimo contando
    #       CLUBE-TEMPORADA, não linha de jogador: é o clube que é a unidade independente.
    #   gk_ganhos_*, gk_perd_* → a bola alta do goleiro em unidade de jogo: "Duelos aéreos/90" ×
    #       minutos/90 = bolas altas da temporada; × "Duelos aéreos ganhos, %"/100 = ganhas; o
    #       resto, perdidas. Mediana do grupo.
    #   gk_n_s_sem, gk_n_m_sem → os mesmos goleiros, sem os times de fronteira.
    #   dd_time, dd_time_pp, dd_time_s, dd_time_m, n_a06_s, n_a06_m → o duelo defensivo do TIME.
    #       Ele só existe jogo a jogo (serieb_jogos.csv): é agregado pela média dos jogos de Série
    #       B da temporada, como o A06 o monta, depois posto dentro do ano e d de Cohen pelo
    #       _metodo. dd_time é número do A06 e até 19/09 estava digitado aqui sem dizer de qual
    #       corte vinha — o que se faz agora é recalculá-lo do dado, no corte COM fronteira, que é
    #       o que vale publicar; o corte SEM está no bloco de conferência lá embaixo.
    T = {(r["setor"], r["indicador"]): r for r in res}

    # ---- os quatro cruzamentos, pela mesma função que escreveu J03_testes.csv ----
    percentil(elegiveis, inds, "posicao", PCT_POSICAO)
    cortes = {(n, f): comparar_setores(titulares, dec, suf, sem_fronteira=sem)
              for n, suf in (("setor", PCT_SETOR), ("posicao", PCT_POSICAO))
              for f, sem in (("com", False), ("sem", True))}
    mesma_porta = cortes[("setor", "com")] == res      # a prova de que os outros três não são
    if not mesma_porta:                                # reimplementação: o corte publicado sai
        raise SystemExit("o corte publicado não saiu igual pela porta comum — pare aqui")

    def firmes_de(corte):
        return {(x["setor"], x["indicador"]) for x in corte if x["selo"] == "firme"}

    nos_dois = firmes_de(cortes[("posicao", "com")]) & firmes_de(cortes[("posicao", "sem")])
    nos_dois_setor = firmes_de(cortes[("setor", "com")]) & firmes_de(cortes[("setor", "sem")])
    S = {chave: {(x["setor"], x["indicador"]): x for x in corte} for chave, corte in cortes.items()}

    # ---- poder por desenho, em clube-temporada ----
    def ct(setor, f, sem):
        return len({(l["ano"], l["clube"]) for l in titulares if l["setor"] == setor
                    and l["faixa"] == f and not (sem and l["fronteira"])})

    d_min = {sem: [d_minimo(ct(s, "Sobe", sem), ct(s, "Meio", sem)) for s in QUANTOS]
             for sem in (False, True)}

    # ---- a bola alta do goleiro, em unidade de jogo ----
    def bola_alta(f, sem=False):
        gks = [l for l in titulares if l["setor"] == "Goleiro" and l["faixa"] == f
               and not (sem and l["fronteira"]) and l["Duelos aéreos/90"] is not None]
        tot = [l["Duelos aéreos/90"] * l["minutos"] / 90 for l in gks]
        ganhas = [t * l[AEREO] / 100 for t, l in zip(tot, gks)]
        perdidas = [t - g for t, g in zip(tot, ganhas)]
        return (float(np.median(ganhas)), float(np.median(perdidas)), len(gks))

    gk_sobe, gk_meio = bola_alta("Sobe"), bola_alta("Meio")

    # ---- o duelo defensivo do time inteiro ----
    dd_ct = duelo_do_time(anos)
    base_time = [{"temporada": k[0], "clube": k[1], "faixa": a01[k]["faixa"],
                  "fronteira": a01[k]["fronteira"] == "1", DUELO_DEF: v}
                 for k, v in dd_ct.items() if k in a01]
    percentil_no_ano(base_time, [DUELO_DEF])

    def time_de(f, sem=False, campo=DUELO_DEF):
        return [l[campo] for l in base_time if l["faixa"] == f and not (sem and l["fronteira"])]

    dd_s, dd_m = float(np.median(time_de("Sobe"))), float(np.median(time_de("Meio")))
    dd_s_sem, dd_m_sem = float(np.median(time_de("Sobe", True))), float(np.median(time_de("Meio", True)))
    # sinal +1: no A06 o duelo defensivo é métrica de desempenho com alto = melhor.
    dd_d = round(cohen_d(time_de("Sobe", campo=pct(DUELO_DEF)),
                         time_de("Meio", campo=pct(DUELO_DEF))), 3)
    dd_d_sem = round(cohen_d(time_de("Sobe", True, pct(DUELO_DEF)),
                             time_de("Meio", True, pct(DUELO_DEF))), 3)

    numeros = {
        # ---- camada 1: o que o script já calculava e agora grava ----
        "n_tit": len(titulares),
        "n_testes": len(res),
        "firmes": len(firmes),
        "min_min": MIN_MINUTOS,
        "setores": len(QUANTOS),
        "dd_min": min(T[(s, DUELO_DEF)]["d"] for s in QUANTOS),
        "dd_max": max(T[(s, DUELO_DEF)]["d"] for s in QUANTOS),
        "dd_vol": T[("Volante", DUELO_DEF)]["d"],
        "dd_ext": T[("Extremo", DUELO_DEF)]["d"],
        "dd_zag_s": T[("Zaga", DUELO_DEF)]["cru_sobe"],
        "dd_zag_m": T[("Zaga", DUELO_DEF)]["cru_meio"],
        "dd_vol_s": T[("Volante", DUELO_DEF)]["cru_sobe"],
        "dd_vol_m": T[("Volante", DUELO_DEF)]["cru_meio"],
        "gk_s": round(T[("Goleiro", AEREO)]["cru_sobe"], 1),
        "gk_m": round(T[("Goleiro", AEREO)]["cru_meio"], 1),
        "gk_d": T[("Goleiro", AEREO)]["d"],
        "gk_q": T[("Goleiro", AEREO)]["q"],
        "gk_n_s": T[("Goleiro", AEREO)]["n_sobe"],
        "gk_n_m": T[("Goleiro", AEREO)]["n_meio"],
        "mf_s": T[("Meia", FALTAS)]["cru_sobe"],
        "mf_m": T[("Meia", FALTAS)]["cru_meio"],
        "mf_d": T[("Meia", FALTAS)]["d"],
        "mf_q": T[("Meia", FALTAS)]["q"],
        # ---- camada 2: o que estava digitado e o script passou a calcular ----
        "n_usado": sum(1 for l in titulares if l["faixa"] in ("Sobe", "Meio")),
        "n_sobe_tot": sum(1 for l in titulares if l["faixa"] == "Sobe"),
        "n_meio_tot": sum(1 for l in titulares if l["faixa"] == "Meio"),
        "n_ind_setor": len(inds),
        "gk_ind_vazios": sum(1 for r in res if r["setor"] == "Goleiro"
                             and r["cru_sobe"] == 0 and r["cru_meio"] == 0),
        "firmes_dois_cortes": len(nos_dois),
        "d_min_menor": min(d_min[False]),
        "d_min_maior": max(d_min[False]),
        "d_min_sem_menor": min(d_min[True]),
        "d_min_sem_maior": max(d_min[True]),
        "dd_time": dd_d,
        "dd_time_pp": round(dd_s - dd_m, 2),
        "dd_time_s": round(dd_s, 2),
        "dd_time_m": round(dd_m, 2),
        "n_a06_s": len(time_de("Sobe")),
        "n_a06_m": len(time_de("Meio")),
        "gk_ganhos_s": round(gk_sobe[0], 1),
        "gk_ganhos_m": round(gk_meio[0], 1),
        "gk_perd_s": round(gk_sobe[1], 1),
        "gk_perd_m": round(gk_meio[1], 1),
        "gk_n_s_sem": bola_alta("Sobe", True)[2],
        "gk_n_m_sem": bola_alta("Meio", True)[2],
        # ---- sem contraparte em J03.json: são os números que o texto de J03 hoje traz CRAVADOS,
        # sem marcador (o em_aberto do J03.json os lista um a um). Ficam aqui, calculados e na
        # precisão em que o texto os escreve, para que a próxima escrita do texto não precise
        # digitar nenhum. Nada aqui altera J03.json — quem decide o texto é o dono. ----
        "n_usado_sem": sum(1 for l in titulares if l["faixa"] in ("Sobe", "Meio") and not l["fronteira"]),
        "n_sobe_sem": sum(1 for l in titulares if l["faixa"] == "Sobe" and not l["fronteira"]),
        "n_meio_sem": sum(1 for l in titulares if l["faixa"] == "Meio" and not l["fronteira"]),
        "lat_s": round(S[("setor", "com")][("Lateral", PASSES)]["cru_sobe"], 1),
        "lat_m": round(S[("setor", "com")][("Lateral", PASSES)]["cru_meio"], 1),
        "lat_s_sem": round(S[("setor", "sem")][("Lateral", PASSES)]["cru_sobe"], 1),
        "lat_m_sem": round(S[("setor", "sem")][("Lateral", PASSES)]["cru_meio"], 1),
        "lat_q": S[("posicao", "com")][("Lateral", PASSES)]["q"],
        "lat_q_sem": S[("posicao", "sem")][("Lateral", PASSES)]["q"],
        "gk_s_sem": round(S[("setor", "sem")][("Goleiro", AEREO)]["cru_sobe"], 1),
        "gk_m_sem": round(S[("setor", "sem")][("Goleiro", AEREO)]["cru_meio"], 1),
        "gk_int_s": round(T[("Goleiro", INTERCECOES)]["cru_sobe"], 1),
        "gk_int_m": round(T[("Goleiro", INTERCECOES)]["cru_meio"], 1),
        "gk_int_s_sem": round(S[("setor", "sem")][("Goleiro", INTERCECOES)]["cru_sobe"], 1),
        "gk_int_m_sem": round(S[("setor", "sem")][("Goleiro", INTERCECOES)]["cru_meio"], 1),
        "dd_time_s_sem": round(dd_s_sem, 1),
        "dd_time_m_sem": round(dd_m_sem, 1),
        "n_a06_s_sem": len(time_de("Sobe", True)),
        "n_a06_m_sem": len(time_de("Meio", True)),
    }

    json.dump({"gerado_por": "scripts/J03.py", "gerado_em": GERADO_EM, "numeros": numeros},
              open(os.path.join(R, "J03_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*100}\nOS QUATRO CRUZAMENTOS — firme é o que passa nos DOIS cortes\n{'='*100}")
    for chave in (("setor", "com"), ("setor", "sem"), ("posicao", "com"), ("posicao", "sem")):
        nomes = sorted(f"{s}/{i[:26]}" for s, i in firmes_de(cortes[chave]))
        print(f"  percentil por {chave[0]:7s} · {chave[1]} fronteira: "
              f"{len(nomes)} firme(s) — {', '.join(nomes) or 'nenhum'}")
    print(f"  nos dois cortes, pela normalização DECLARADA (posição): {len(nos_dois)} — "
          f"{', '.join(sorted(f'{s}/{i}' for s, i in nos_dois)) or 'nenhum'}")
    print(f"  nos dois cortes, pela normalização do CÓDIGO (setor): {len(nos_dois_setor)} — "
          f"{', '.join(sorted(f'{s}/{i}' for s, i in nos_dois_setor)) or 'nenhum'}")
    print(f"  duelo defensivo do time: Sobe {dd_s:.3f} × Meio {dd_m:.3f} · d {dd_d:+.3f} "
          f"(com fronteira) · sem fronteira {dd_s_sem:.3f} × {dd_m_sem:.3f} · d {dd_d_sem:+.3f}")
    # O 2º caminho do dd_time: a linha que o A06 publica. Não é fonte — o valor acima veio do
    # dado —, é conferência. Se um dia deixar de bater, o motivo estará na base do A06, que
    # exige as 8 colunas da lista dela e pode encolher; o posto dentro do ano mudaria com ela.
    a06 = os.path.join(R, "A06_testes.csv")
    if os.path.exists(a06):
        for r6 in csv.DictReader(open(a06, encoding="utf-8")):
            if (r6.get("fronteira"), r6.get("comparacao"),
                    r6.get("indicador")) == ("com", "SM", "duelos_def_pct"):
                bate = abs(float(r6["d"]) - dd_d) < 1e-9
                print(f"    2º caminho, A06_testes.csv (com/SM/duelos_def_pct): d {r6['d']}, "
                      f"n {r6['n_a']}×{r6['n_b']} — {'bate' if bate else 'NÃO BATE'}")

    # ---- conferência contra o publicado. Divergir é ACHADO: nada é consertado aqui, e este
    # script não escreve em J03.json. ----
    caminho_pub = os.path.join(R, "J03.json")
    publicados = (json.load(open(caminho_pub, encoding="utf-8")).get("numeros", {})
                  if os.path.exists(caminho_pub) else {})
    faltam = sorted(set(publicados) - set(numeros))
    divergem = [(m, publicados[m], numeros[m]) for m in publicados
                if m in numeros and str(numeros[m]) != str(publicados[m])]
    print(f"\n{'='*100}\nNÚMEROS — {len(numeros)} marcadores gravados em J03_numeros.json\n{'='*100}")
    print(f"  publicados em J03.json: {len(publicados)} · sem contraparte no script: {len(faltam)}"
          f" · divergentes: {len(divergem)}")
    for m in faltam:
        print(f"  FALTA   {m}: publicado {publicados[m]!r} e o script não o produz")
    for m, pubv, calc in divergem:
        print(f"  DIVERGE {m}: publicado {pubv!r} · o script dá {calc!r}")
    if not faltam and not divergem:
        print("  todos batem")


if __name__ == "__main__":
    main()
