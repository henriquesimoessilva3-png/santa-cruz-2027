#!/usr/bin/env python3
"""A20 — o que separa quem sobe é o titular médio ou ter um ou dois muito acima?

Todo o estudo compara MÉDIA: o A07 e o A11 usaram a média do time; o J04, o J10 e o J11
compararam jogador contra jogador. Montar elenco não é ter onze médios — pode ser ter um ou dois
muito acima e o resto normal, e ninguém mediu isso.

## A armadilha, resolvida por construção e não por controle

O máximo de uma amostra cresce com o tamanho dela: um clube que rodou mais jogadores rastreados
teria máximo maior sem ter ninguém melhor. Por isso o elenco é fixado em **onze** para todo mundo
— os 11 com mais minutos rastreados. Os 80 clube-temporadas têm de 20 a 46 jogadores com físico,
então nenhum fica de fora por falta de gente.

## A normalização, que é o que faz a pergunta ser a pergunta

Cada jogador entra pelo PERCENTIL dele dentro de setor × temporada, a mesma régua do J04, do J10 e
do J11, e só depois se calculam as três estatísticas. Sem isso, a dispersão de um elenco mediria a
mistura de posições: atacante corre diferente de zagueiro, e um onze com mais extremos teria mais
dispersão sem ter ninguém excepcional.

## O que decide a pergunta

Se o TOPO separar e o NÍVEL não, a resposta é "um ou dois muito acima". Se os dois separarem, o
topo pode ser só reflexo do nível — e é a família da DISTÂNCIA que desempata, porque ela é alta só
quando o elenco é desigual.

Uso:
    python3 _fonte/estudo_serieb/scripts/A20.py
"""
import collections
import csv
import json
import os
import sqlite3
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import comparar, d_minimo, pct, percentil_no_ano   # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
BANCO = os.path.join(ESTUDO, "dados_copiados", "skillcorner_serieb.db")
RNG = np.random.default_rng(20260921)
ANOS = ("2022", "2023", "2024", "2025")
ONZE = 11
GERADO_EM = "2026-09-21"


def br(v, casas):
    return f"{v:.{casas}f}".replace(".", ",")


def br_sinal(v, casas):
    return f"{v:+.{casas}f}".replace(".", ",")


def ic_br(ic):
    return f"{ic[0]:+.2f} a {ic[1]:+.2f}".replace(".", ",")


def main():
    dec = json.load(open(os.path.join(R, "A20_indicadores.json"), encoding="utf-8"))
    metricas = dec["metricas"]
    familias_dec = dec["familias"]
    ids = [i["id"] for f in familias_dec for i in f["indicadores"]]
    sinal = {i["id"]: i["sinal"] for f in familias_dec for i in f["indicadores"]}
    nome = {i["id"]: i["nome"] for f in familias_dec for i in f["indicadores"]}

    c = sqlite3.connect(BANCO)
    ed = {r[0]: str(r[1]) for r in
          c.execute("select sc_competition_edition_id, season_name from competitions")}
    fis = {}
    cols = ["sc_player_id", "sc_competition_edition_id", "minutes_played"] + metricas
    for r in c.execute(f'select {", ".join(cols)} from physical'):
        d = dict(zip(cols, r))
        t = ed.get(d["sc_competition_edition_id"])
        if t:
            fis[(t, str(d["sc_player_id"]))] = d
    c.close()

    # ---- jogadores com físico, com setor e minutos rastreados --------------------------------
    jog = []
    for l in csv.DictReader(open(os.path.join(R, "J04_base.csv"), encoding="utf-8")):
        if l["temporada"] not in ANOS or not l["sc_player_id"] or l["tem_fisico"] != "1":
            continue
        d = fis.get((l["temporada"], l["sc_player_id"]))
        if not d or any(d[m] is None for m in metricas):
            continue
        x = {"temporada": l["temporada"], "clube": l["clube"], "setor": l["setor"],
             "jogador": l["jogador"], "faixa": l["faixa"], "trave": l["trave"] == "1",
             "fronteira": l["fronteira"] == "1",
             "cobertura_baixa": l["cobertura_baixa"] == "1",
             "sc_min_tot": float(l["sc_min_tot"] or 0),
             "ano_setor": f"{l['temporada']}|{l['setor']}"}
        for m in metricas:
            x[m] = d[m]
        jog.append(x)
    print(f"jogadores com físico: {len(jog)} em "
          f"{len({(l['temporada'], l['clube']) for l in jog})} clube-temporadas")

    # o percentil de cada jogador DENTRO do setor e da temporada — a régua do J04/J10/J11
    percentil_no_ano(jog, metricas, chave_ano="ano_setor")

    por_ct = collections.defaultdict(list)
    for l in jog:
        por_ct[(l["temporada"], l["clube"])].append(l)
    tamanhos = sorted(len(v) for v in por_ct.values())
    print(f"jogadores rastreados por clube-temporada: de {tamanhos[0]} a {tamanhos[-1]} "
          f"(mediana {np.median(tamanhos):.1f}) — o onze fixo tira essa diferença da conta")

    base, sem_onze = [], 0
    for (temporada, clube), ls in por_ct.items():
        onze = sorted(ls, key=lambda l: -l["sc_min_tot"])[:ONZE]
        if len(onze) < ONZE:
            sem_onze += 1
            continue
        l0 = onze[0]
        x = {"temporada": temporada, "clube": clube, "faixa": l0["faixa"],
             "trave": l0["trave"], "fronteira": l0["fronteira"],
             "cobertura_baixa": any(l["cobertura_baixa"] for l in onze),
             "rastreados": len(ls), "min_do_onze": round(sum(l["sc_min_tot"] for l in onze))}
        for m in metricas:
            p = [l[pct(m)] for l in onze if l.get(pct(m)) is not None]
            if len(p) < ONZE:
                x[f"med_{m}"] = x[f"max_{m}"] = x[f"amp_{m}"] = None
                continue
            x[f"med_{m}"] = float(np.median(p))
            x[f"max_{m}"] = float(max(p))
            x[f"amp_{m}"] = float(max(p) - min(p))
            # O MÍNIMO não é indicador novo: é aritmética do que já foi declarado (min = max −
            # amplitude). Ele entra como DESCRIÇÃO, para dizer de que ponta vem a amplitude, e
            # NÃO entra em teste nenhum — inventar indicador depois de ver resultado é garimpo.
            x[f"min_{m}"] = float(min(p))
            # o bruto, só para a tela — não entra em teste nenhum
            bruto = [l[m] for l in onze]
            x[f"bruto_med_{m}"] = float(np.median(bruto))
            x[f"bruto_max_{m}"] = float(max(bruto))
        base.append(x)
    print(f"clube-temporadas com onze completo: {len(base)} · sem onze: {sem_onze}")
    buracos = {i: sum(1 for l in base if l.get(i) is None) for i in ids}
    print("buracos:", {k: v for k, v in buracos.items() if v} or "nenhum")
    base = [l for l in base if all(l.get(i) is not None for i in ids)]
    print("por faixa:", dict(collections.Counter(l["faixa"] for l in base)))

    percentil_no_ano(base, ids)

    familias = [(f["id"], [i["id"] for i in f["indicadores"]]) for f in familias_dec]
    GRUPO = {"SM": (lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
             "CM": (lambda l: l["faixa"] == "Cai", lambda l: l["faixa"] == "Meio")}
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    SUB = {"todos": lambda l: True, "sem_cobertura_baixa": lambda l: not l["cobertura_baixa"]}

    res = []
    for sub_id, sub_f in SUB.items():
        bs = [l for l in base if sub_f(l)]
        comps = [(cid, ga, gb) for cid, (ga, gb) in GRUPO.items()]
        r = comparar(bs, familias, comps, filtros, RNG, lambda i: sinal[i])
        for it in r:
            it["subamostra"] = sub_id
            it["unidade"] = "clube-temporada"
            it["medida_nome"] = ("percentil por setor do onze físico: "
                                 + ("mediana" if it["indicador"].startswith("med_")
                                    else "máximo" if it["indicador"].startswith("max_")
                                    else "máximo menos mínimo"))
        res += r
    for it in res:
        it["nome"] = nome[it["indicador"]]

    with open(os.path.join(R, "A20_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)

    # ---- o dinheiro ao lado, como ressalva -----------------------------------------------------
    tec = {}
    for l in csv.DictReader(open(os.path.join(DADOS, "serieb_clube_temporada.csv"),
                                 encoding="utf-8-sig")):
        try:
            tec[(l["ano"], l["clube"])] = float(l["tm_valor_total"])
        except (TypeError, ValueError):
            pass
    com_valor = [l for l in base if (l["temporada"], l["clube"]) in tec]
    dinheiro = {}
    for i in ids:
        rho, p = stats.spearmanr([l[pct(i)] for l in com_valor],
                                 [tec[(l["temporada"], l["clube"])] for l in com_valor])
        dinheiro[i] = {"rho": round(float(rho), 3), "p": round(float(p), 5), "n": len(com_valor)}

    T = {(it["subamostra"], it["fronteira"], it["comparacao"], it["indicador"]): it for it in res}

    def passam(sub, rot, comp):
        return {it["indicador"] for it in res if it["subamostra"] == sub
                and it["fronteira"] == rot and it["comparacao"] == comp and it["q"] < 0.05}
    nos_dois = {comp: sorted(passam("todos", "com", comp) & passam("todos", "sem", comp))
                for comp in ("SM", "CM")}
    por_familia = {fid: {"testes": len(inds),
                         "passam_nos_dois_SM": sum(1 for i in nos_dois["SM"] if i in inds),
                         "passam_nos_dois_CM": sum(1 for i in nos_dois["CM"] if i in inds)}
                   for fid, inds in familias}

    for comp in ("SM", "CM"):
        print(f"\n{'='*104}\n{comp} · todos · os dois cortes\n{'='*104}")
        print(f"{'família':10s} {'indicador':30s} {'d com':>7s} {'q com':>8s} {'d sem':>7s} "
              f"{'q sem':>8s} {'$':>6s}  passa nos dois")
        for fid, inds in familias:
            for i in inds:
                a, b = T[("todos", "com", comp, i)], T[("todos", "sem", comp, i)]
                print(f"{fid:10s} {i[:30]:30s} {a['d']:+7.2f} {a['q']:8.4f} {b['d']:+7.2f} "
                      f"{b['q']:8.4f} {dinheiro[i]['rho']:+6.2f}  "
                      f"{'SIM' if i in nos_dois[comp] else ''}")
    print("\npor família:", json.dumps(por_familia, ensure_ascii=False))

    resumo = {
        "gerado_em": GERADO_EM, "unidade": "clube-temporada",
        "o_onze_fisico": dec["o_onze_fisico"],
        "n": {"clube_temporadas": len(base), "clubes": len({l["clube"] for l in base}),
              "jogadores_com_fisico": len(jog),
              "rastreados_min": tamanhos[0], "rastreados_max": tamanhos[-1],
              "rastreados_mediana": float(np.median(tamanhos)),
              "por_faixa": dict(collections.Counter(l["faixa"] for l in base)),
              "sem_cobertura_baixa": sum(1 for l in base if not l["cobertura_baixa"])},
        "passam_nos_dois_cortes": nos_dois,
        "por_familia": por_familia,
        "cada_indicador_x_dinheiro": dinheiro,
        "de_que_ponta_vem_a_amplitude": {
            "o_que_e": ("decomposição ARITMÉTICA da amplitude declarada (min = max − amplitude), "
                        "não indicador novo e não testada. Serve para dizer se o elenco de quem "
                        "sobe é mais esticado por cima, por baixo ou pelos dois lados."),
            "por_metrica": {m: {"min": {f: round(float(np.median(
                                    [l[f"min_{m}"] for l in base if l["faixa"] == f])), 1)
                                for f in ("Sobe", "Meio", "Cai")},
                                "med": {f: round(float(np.median(
                                    [l[f"med_{m}"] for l in base if l["faixa"] == f])), 1)
                                for f in ("Sobe", "Meio", "Cai")},
                                "max": {f: round(float(np.median(
                                    [l[f"max_{m}"] for l in base if l["faixa"] == f])), 1)
                                for f in ("Sobe", "Meio", "Cai")}}
                            for m in metricas}},
        "poder_por_desenho": {
            "d_minimo_80_sobe_x_meio": d_minimo(
                sum(1 for l in base if l["faixa"] == "Sobe"),
                sum(1 for l in base if l["faixa"] == "Meio")),
            "d_minimo_80_sem_fronteira": d_minimo(
                sum(1 for l in base if l["faixa"] == "Sobe" and not l["fronteira"]),
                sum(1 for l in base if l["faixa"] == "Meio" and not l["fronteira"]))},
        "porta_temporal_nao_calculavel": {
            "parcial": None, "passa": False,
            "por_que": "a tabela `physical` é por temporada fechada, sem recorte por rodada. "
                       "Declarado em A20_indicadores.json antes de rodar. Teto: provável."},
    }
    json.dump(resumo, open(os.path.join(R, "A20_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    n_faixa = resumo["n"]["por_faixa"]
    numeros = {
        "n": len(base), "n_clubes": resumo["n"]["clubes"],
        "n_jogadores": len(jog), "n_sobe": n_faixa.get("Sobe", 0),
        "n_meio": n_faixa.get("Meio", 0), "n_cai": n_faixa.get("Cai", 0),
        "n_sem_cob": resumo["n"]["sem_cobertura_baixa"],
        "rast_min": tamanhos[0], "rast_max": tamanhos[-1],
        "rast_mediana": br(float(np.median(tamanhos)), 1),
        "onze": ONZE, "n_metricas": len(metricas), "n_indicadores": len(ids),
        "dmin": br(resumo["poder_por_desenho"]["d_minimo_80_sobe_x_meio"], 2),
        "dmin_sem": br(resumo["poder_por_desenho"]["d_minimo_80_sem_fronteira"], 2),
        "passam_nivel_sm": por_familia["nivel"]["passam_nos_dois_SM"],
        "passam_topo_sm": por_familia["topo"]["passam_nos_dois_SM"],
        "passam_dist_sm": por_familia["distancia"]["passam_nos_dois_SM"],
        "passam_nivel_cm": por_familia["nivel"]["passam_nos_dois_CM"],
        "passam_topo_cm": por_familia["topo"]["passam_nos_dois_CM"],
        "passam_dist_cm": por_familia["distancia"]["passam_nos_dois_CM"],
        "graf_nivel_sm": por_familia["nivel"]["passam_nos_dois_SM"],
        "graf_topo_sm": por_familia["topo"]["passam_nos_dois_SM"],
        "graf_dist_sm": por_familia["distancia"]["passam_nos_dois_SM"],
    }
    for it in res:
        if it["subamostra"] != "todos":
            continue
        pre = "" if it["comparacao"] == "SM" else "cm"
        k = f"{pre}{it['indicador']}"
        suf = "" if it["fronteira"] == "com" else "sem"
        numeros[f"d{suf}_{k}"] = br_sinal(it["d"], 2)
        numeros[f"q{suf}_{k}"] = br(it["q"], 4)
        numeros[f"graf_d{suf}_{k}"] = it["d"]
        if it["fronteira"] == "com":
            numeros[f"ic_{k}"] = ic_br(it["ic95_d"])
            numeros[f"sobe_{k}"] = br(it["cru_a"], 1)
            numeros[f"meio_{k}"] = br(it["cru_b"], 1)
            numeros[f"graf_sobe_{k}"] = round(it["cru_a"], 1)
            numeros[f"graf_meio_{k}"] = round(it["cru_b"], 1)
    for i, v in dinheiro.items():
        numeros[f"dinheiro_{i}"] = br_sinal(v["rho"], 2)
    for m, v in resumo["de_que_ponta_vem_a_amplitude"]["por_metrica"].items():
        for onde in ("min", "med", "max"):
            for f in ("Sobe", "Meio", "Cai"):
                numeros[f"p_{onde}_{m}_{f.lower()}"] = br(v[onde][f], 1)
                numeros[f"graf_p_{onde}_{m}_{f.lower()}"] = v[onde][f]
    json.dump({"gerado_por": "scripts/A20.py", "gerado_em": GERADO_EM,
               "numeros": dict(sorted(numeros.items()))},
              open(os.path.join(R, "A20_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n{len(numeros)} marcadores em A20_numeros.json")


if __name__ == "__main__":
    main()
