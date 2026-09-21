#!/usr/bin/env python3
"""J10 — a corrida para dentro da área vira requisito de contratação?

O eixo firme do estudo é a qualidade da chance (A02-1). No time, o A11-1 já mediu que quem entra
mais na área é quem CORRE PARA DENTRO DELA, e não quem corre mais. A ponte disso para o jogador
existe na base e nunca tinha sido usada: a tabela `off_ball_runs` do `skillcorner_serieb.db`.

O J04 mediu corrida como VOLUME e intensidade, por 90 minutos, e achou quase nada. Aqui a pergunta
é outra — para ONDE ele corre — e a unidade também: **p30tip**, por 30 minutos de bola com o time
em posse, que é a unidade certa para corrida sem bola. Os números das duas partes não se comparam
um a um, e é por isso que a unidade vai declarada em cada linha da tabela.

Lista: `resultados/J10_indicadores.json`, fechada antes de rodar. A família `volume_de_corrida` é
o CONTROLE da pergunta: se correr muito separar tanto quanto correr para a área, o achado não é
"para onde ele corre".

Teto declarado antes de rodar: PROVÁVEL. A `off_ball_runs` tem uma linha por jogador-temporada,
sem recorte por rodada — ao contrário da `physical_match` —, então não há 1º turno e não há
anterioridade. Limite de dado, não reprovação.

Uso:
    python3 _fonte/estudo_serieb/scripts/J10.py
"""
import collections
import csv
import json
import os
import sqlite3
import sys

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import comparar, d_minimo, pct, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
R = os.path.join(ESTUDO, "resultados")
BANCO = os.path.join(ESTUDO, "dados_copiados", "skillcorner_serieb.db")
RNG = np.random.default_rng(20260921)
ANOS = {"2022", "2023", "2024", "2025"}
N_MIN_A, N_MIN_B = 8, 16                 # J10_indicadores.json, n_minimo_por_setor (o mesmo do J04)
GERADO_EM = "2026-09-21"


def br(v, casas):
    return f"{v:.{casas}f}".replace(".", ",")


def br_sinal(v, casas):
    return f"{v:+.{casas}f}".replace(".", ",")


def ic_br(ic):
    return f"{ic[0]:+.2f} a {ic[1]:+.2f}".replace(".", ",")


def corridas(ids):
    """A off_ball_runs por (temporada, sc_player_id). A ponte da temporada vem da competitions."""
    c = sqlite3.connect(BANCO)
    edicao = {str(r[1]): r[0] for r in
              c.execute("select sc_competition_edition_id, season_name from competitions")}
    cols = ["sc_player_id", "sc_competition_edition_id", "minutes", "minutes_tip", "matches"] + ids
    linhas = c.execute(f'select {", ".join(cols)} from off_ball_runs')
    por_edicao = {v: k for k, v in edicao.items()}
    out = {}
    for r in linhas:
        d = dict(zip(cols, r))
        temporada = por_edicao.get(d["sc_competition_edition_id"])
        if temporada:
            out[(temporada, str(d["sc_player_id"]))] = d
    c.close()
    return out, edicao


def main():
    dec = json.load(open(os.path.join(R, "J10_indicadores.json"), encoding="utf-8"))
    familias_dec = dec["familias"]
    ids = [i["id"] for f in familias_dec for i in f["indicadores"]]
    sinal = {i["id"]: i["sinal"] for f in familias_dec for i in f["indicadores"]}
    nome = {i["id"]: i["nome"] for f in familias_dec for i in f["indicadores"]}

    obr, edicao = corridas(ids)
    print(f"off_ball_runs: {len(obr)} jogador-temporada em {len(edicao)} edições")

    base, sem_corrida, sem_id = [], 0, 0
    for l in csv.DictReader(open(os.path.join(R, "J04_base.csv"), encoding="utf-8")):
        if l["temporada"] not in ANOS or l["titular"] != "1" or l["no_recorte"] != "1":
            continue
        if not l["sc_player_id"]:
            sem_id += 1
            continue
        d = obr.get((l["temporada"], l["sc_player_id"]))
        if not d:
            sem_corrida += 1
            continue
        x = {"temporada": l["temporada"], "clube": l["clube"], "setor": l["setor"],
             "jogador": l["jogador"], "faixa": l["faixa"], "trave": l["trave"] == "1",
             "fronteira": l["fronteira"] == "1",
             "cobertura_baixa": l["cobertura_baixa"] == "1",
             "identidade": l.get("identidade", ""),
             "minutos_tip": d["minutes_tip"], "jogos_sc": d["matches"],
             # O pool do percentil é setor × temporada: zagueiro e atacante correm para a área em
             # escalas diferentes, e um pool único faria a posição mandar no posto.
             "ano_setor": f"{l['temporada']}|{l['setor']}"}
        for i in ids:
            x[i] = d[i]
        base.append(x)

    print(f"titulares com corrida medida: {len(base)} · sem linha na off_ball_runs: {sem_corrida} "
          f"· sem sc_player_id: {sem_id}")
    print("por faixa:", dict(collections.Counter(l["faixa"] for l in base)))
    print("por setor:", dict(collections.Counter(l["setor"] for l in base)))
    buracos = {i: sum(1 for l in base if l[i] is None) for i in ids}
    print("buracos por indicador:", {k: v for k, v in buracos.items() if v} or "nenhum")
    base = [l for l in base if all(l[i] is not None for i in ids)]

    percentil_no_ano(base, ids, chave_ano="ano_setor")
    setores = sorted({l["setor"] for l in base})

    familias = [(f["id"], [i["id"] for i in f["indicadores"]]) for f in familias_dec]
    GRUPO = {"SM": (lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
             "CM": (lambda l: l["faixa"] == "Cai", lambda l: l["faixa"] == "Meio")}
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    SUB = {"todos": lambda l: True,
           "sem_cobertura_baixa": lambda l: not l["cobertura_baixa"]}

    res, n_por_setor, fora_por_n = [], {}, []
    for sub_id, sub_f in SUB.items():
        for setor in setores:
            bs = [l for l in base if l["setor"] == setor and sub_f(l)]
            for rot, filtro in filtros:
                bsf = [l for l in bs if filtro(l)]
                comps = []
                for cid, (ga, gb) in GRUPO.items():
                    na, nb = sum(1 for l in bsf if ga(l)), sum(1 for l in bsf if gb(l))
                    if na < N_MIN_A or nb < N_MIN_B:
                        fora_por_n.append({"subamostra": sub_id, "setor": setor,
                                           "comparacao": cid, "fronteira": rot,
                                           "n_a": na, "n_b": nb,
                                           "minimo": f"{N_MIN_A} de um lado, {N_MIN_B} do outro"})
                        continue
                    comps.append((cid, ga, gb))
                if not comps:
                    continue
                r = comparar(bs, familias, comps, [(rot, filtro)], RNG, lambda i: sinal[i])
                for it in r:
                    it["setor"] = setor
                    it["subamostra"] = sub_id
                    it["unidade"] = "jogador-temporada"
                    it["medida_nome"] = "corrida sem bola por 30 min de posse do time (p30tip)"
                res += r
            if sub_id == "todos":
                n_por_setor[setor] = {}
                for rot, filtro in filtros:
                    g = [l for l in bs if filtro(l)]
                    d = {"n_sobe": sum(1 for l in g if l["faixa"] == "Sobe"),
                         "n_meio": sum(1 for l in g if l["faixa"] == "Meio"),
                         "n_cai": sum(1 for l in g if l["faixa"] == "Cai"),
                         "clubes": len({l["clube"] for l in g})}
                    d["d_minimo_80_sobe_x_meio"] = (d_minimo(d["n_sobe"], d["n_meio"])
                                                    if d["n_sobe"] > 1 and d["n_meio"] > 1 else None)
                    n_por_setor[setor][rot] = d

    for it in res:
        it["nome"] = nome[it["indicador"]]

    with open(os.path.join(R, "J10_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)

    # ---- o que passou, por família: é "para onde corre" ou "quanto corre"? ----
    def passaram(sub, rot, comp, fam=None):
        return [it for it in res if it["subamostra"] == sub and it["fronteira"] == rot
                and it["comparacao"] == comp and it["q"] is not None and it["q"] < 0.05
                and (fam is None or it["familia"] == fam)]

    nos_dois = []
    for it in passaram("todos", "com", "SM"):
        par = next((x for x in passaram("todos", "sem", "SM")
                    if x["indicador"] == it["indicador"] and x["setor"] == it["setor"]), None)
        if par:
            nos_dois.append({"setor": it["setor"], "indicador": it["indicador"],
                             "familia": it["familia"], "nome": it["nome"],
                             "d_com": it["d"], "d_sem": par["d"],
                             "q_com": it["q"], "q_sem": par["q"],
                             "cru_sobe": it["cru_a"], "cru_meio": it["cru_b"],
                             "ic_com": it["ic95_d"]})

    por_familia = {f[0]: {"testes": sum(1 for it in res if it["familia"] == f[0]
                                        and it["subamostra"] == "todos" and it["comparacao"] == "SM"
                                        and it["fronteira"] == "com"),
                          "passam_nos_dois": sum(1 for x in nos_dois if x["familia"] == f[0])}
                   for f in familias}

    resumo = {
        "gerado_em": GERADO_EM, "unidade": "jogador-temporada",
        "fonte": "off_ball_runs (skillcorner_serieb.db), ponte pelo J04_base.csv",
        "n": {"titulares_com_corrida": len(base),
              "clubes": len({l["clube"] for l in base}),
              "sem_linha_na_tabela": sem_corrida, "sem_sc_player_id": sem_id,
              "por_faixa": dict(collections.Counter(l["faixa"] for l in base)),
              "por_setor": dict(collections.Counter(l["setor"] for l in base))},
        "n_por_setor": n_por_setor,
        "comparacoes_fora_por_n": fora_por_n,
        "passam_nos_dois_cortes_sobe_x_meio": nos_dois,
        "por_familia_sobe_x_meio": por_familia,
        "porta_temporal_nao_calculavel": {
            "parcial": None, "passa": False,
            "por_que": "A off_ball_runs tem UMA linha por jogador-temporada, sem recorte por "
                       "rodada nem por jogo — ao contrário da physical_match, que tem. Sem valor "
                       "de 1º turno não há 'antes'. Declarado em J10_indicadores.json antes de "
                       "rodar. Teto da parte: provável.",
        },
    }
    json.dump(resumo, open(os.path.join(R, "J10_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*104}\nO que passa nos DOIS cortes, Sobe × Meio\n{'='*104}")
    if not nos_dois:
        print("  nada")
    for x in sorted(nos_dois, key=lambda x: -abs(x["d_com"])):
        print(f"  {x['setor']:10s} {x['nome'][:48]:48s} d {x['d_com']:+.2f}/{x['d_sem']:+.2f} "
              f"q {x['q_com']:.4f}/{x['q_sem']:.4f}  sobe {x['cru_sobe']:.2f} × meio {x['cru_meio']:.2f}")
    print("\npor família (Sobe × Meio, corte com, todos):", por_familia)

    numeros = {
        "n": len(base), "n_clubes": resumo["n"]["clubes"],
        "n_setores": len(setores), "n_indicadores": len(ids), "n_familias": len(familias),
        "n_sobe": resumo["n"]["por_faixa"].get("Sobe", 0),
        "n_meio": resumo["n"]["por_faixa"].get("Meio", 0),
        "n_cai": resumo["n"]["por_faixa"].get("Cai", 0),
        "sem_linha": sem_corrida,
        "passam_area": por_familia["para_a_area"]["passam_nos_dois"],
        "passam_procurado": por_familia["procurado"]["passam_nos_dois"],
        "passam_volume": por_familia["volume_de_corrida"]["passam_nos_dois"],
        "testes_area": por_familia["para_a_area"]["testes"],
        "testes_volume": por_familia["volume_de_corrida"]["testes"],
        "passam_total": len(nos_dois),
        "fora_por_n": len(fora_por_n),
    }
    for setor, d in n_por_setor.items():
        s = setor.lower().replace(" ", "_")
        numeros[f"nsobe_{s}"] = d["com"]["n_sobe"]
        numeros[f"nmeio_{s}"] = d["com"]["n_meio"]
        numeros[f"dmin_{s}"] = (br(d["com"]["d_minimo_80_sobe_x_meio"], 2)
                                if d["com"]["d_minimo_80_sobe_x_meio"] else "—")
    # TODA linha de Sobe × Meio no corte com fronteira vira marcador — não só as que passaram.
    # Publicar só o que passou deixaria o texto do resultado NEGATIVO sem número para mostrar, e
    # foi para o resultado negativo que esta parte existiu.
    for it in res:
        if it["subamostra"] != "todos" or it["comparacao"] != "SM":
            continue
        s = f"{it['setor'].lower()}_{it['indicador']}"
        if it["fronteira"] == "sem":
            # o corte reduzido também vira marcador: sem ele o gráfico de dois cortes teria de
            # repetir a mesma linha duas vezes, que é desenho que finge comparação
            numeros[f"sobesem_{s}"] = br(it["cru_a"], 2)
            numeros[f"meiosem_{s}"] = br(it["cru_b"], 2)
            numeros[f"graf_sobesem_{s}"] = round(it["cru_a"], 2)
            numeros[f"graf_meiosem_{s}"] = round(it["cru_b"], 2)
            continue
        numeros[f"dsm_{s}"] = br_sinal(it["d"], 2)
        numeros[f"qsm_{s}"] = br(it["q"], 4)
        numeros[f"dminsm_{s}"] = br(it["d_minimo_80"], 2)
        numeros[f"sobesm_{s}"] = br(it["cru_a"], 2)
        numeros[f"meiosm_{s}"] = br(it["cru_b"], 2)
        numeros[f"graf_sobesm_{s}"] = round(it["cru_a"], 2)
        numeros[f"graf_meiosm_{s}"] = round(it["cru_b"], 2)
    for x in nos_dois:
        s = f"{x['setor'].lower()}_{x['indicador']}"
        numeros[f"d_{s}"] = br_sinal(x["d_com"], 2)
        numeros[f"dsem_{s}"] = br_sinal(x["d_sem"], 2)
        numeros[f"q_{s}"] = br(x["q_com"], 4)
        numeros[f"ic_{s}"] = ic_br(x["ic_com"])
        numeros[f"sobe_{s}"] = br(x["cru_sobe"], 2)
        numeros[f"meio_{s}"] = br(x["cru_meio"], 2)
        numeros[f"graf_sobe_{s}"] = round(x["cru_sobe"], 2)
        numeros[f"graf_meio_{s}"] = round(x["cru_meio"], 2)
    json.dump({"gerado_por": "scripts/J10.py", "gerado_em": GERADO_EM,
               "numeros": dict(sorted(numeros.items()))},
              open(os.path.join(R, "J10_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n{len(numeros)} marcadores em J10_numeros.json")


if __name__ == "__main__":
    main()
