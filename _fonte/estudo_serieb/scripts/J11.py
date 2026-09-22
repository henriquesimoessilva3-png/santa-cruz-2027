#!/usr/bin/env python3
"""J11 — o titular de quem sobe corre proporcionalmente mais SEM a bola?

O J04 testou 20 medidas físicas por posição, uma a uma, e entre elas SEIS já em TIP/OTIP. O que
ele não fez foi a RAZÃO entre as duas fases: ele testou o nível com a bola e o nível sem a bola
como indicadores separados, cada um corrigido dentro da sua família. Nunca perguntou se o jogador
corre proporcionalmente mais numa fase que na outra — e é isso que distingue o jogador que
persegue do jogador que ataca, dois perfis que o nível por 90, e até o nível por fase, deixam
idênticos.

Os seis indicadores que o J04 já publica ficam FORA desta lista, para que nenhum saia com dois q
(regra 7 do portão).

Lista: `resultados/J11_indicadores.json`, fechada antes de rodar. Teto declarado: PROVÁVEL — a
tabela `physical` tem uma linha por jogador-temporada, sem recorte por rodada, então não há
anterioridade.

A ressalva que a parte MEDE em vez de alegar: a razão pode ser do TIME e não do jogador, porque
time que fica pouco com a bola dá mais minutos sem posse a todo mundo. A correlação entre a razão
de cada jogador e a posse do time dele sai publicada ao lado — ressalva, nunca desconto.

Uso:
    python3 _fonte/estudo_serieb/scripts/J11.py
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
ANOS = {"2022", "2023", "2024", "2025"}
N_MIN_A, N_MIN_B = 8, 16
GERADO_EM = "2026-09-21"

# A razão de cada família `razao`: (id, numerador otip, denominador tip)
RAZOES = [("r_distance", "distance_p30otip", "distance_p30tip"),
          ("r_hi_distance", "hi_distance_p30otip", "hi_distance_p30tip"),
          ("r_sprint_count", "sprint_count_p30otip", "sprint_count_p30tip"),
          ("r_high_accel", "high_accel_p30otip", "high_accel_p30tip"),
          ("r_cod_count", "cod_count_p30otip", "cod_count_p30tip")]
NIVEIS = ["distance_p30tip", "high_accel_p30tip", "cod_count_p30tip",
          "distance_p30otip", "high_accel_p30otip", "cod_count_p30otip"]


def br(v, casas):
    return f"{v:.{casas}f}".replace(".", ",")


def br_sinal(v, casas):
    return f"{v:+.{casas}f}".replace(".", ",")


def ic_br(ic):
    return f"{ic[0]:+.2f} a {ic[1]:+.2f}".replace(".", ",")


def fisico(colunas):
    c = sqlite3.connect(BANCO)
    ed = {r[0]: str(r[1]) for r in
          c.execute("select sc_competition_edition_id, season_name from competitions")}
    cols = ["sc_player_id", "sc_competition_edition_id", "minutes_played",
            "minutes_tip", "minutes_otip"] + colunas
    out = {}
    for r in c.execute(f'select {", ".join(cols)} from physical'):
        d = dict(zip(cols, r))
        t = ed.get(d["sc_competition_edition_id"])
        if t:
            out[(t, str(d["sc_player_id"]))] = d
    c.close()
    return out


def main():
    dec = json.load(open(os.path.join(R, "J11_indicadores.json"), encoding="utf-8"))
    familias_dec = dec["familias"]
    ids = [i["id"] for f in familias_dec for i in f["indicadores"]]
    sinal = {i["id"]: i["sinal"] for f in familias_dec for i in f["indicadores"]}
    nome = {i["id"]: i["nome"] for f in familias_dec for i in f["indicadores"]}

    precisa = sorted({c for _, a, b in RAZOES for c in (a, b)} | set(NIVEIS))
    fis = fisico(precisa)
    print(f"physical: {len(fis)} jogador-temporada em {len(precisa)} colunas")

    # posse do time, para a ressalva da razão
    posse = {}
    for l in csv.DictReader(open(os.path.join(DADOS, "serieb_clube_temporada.csv"),
                                 encoding="utf-8-sig")):
        try:
            posse[(l["ano"], l["clube"])] = float(l["posse"])
        except (TypeError, ValueError):
            pass

    base, sem_linha, sem_id = [], 0, 0
    for l in csv.DictReader(open(os.path.join(R, "J04_base.csv"), encoding="utf-8")):
        if l["temporada"] not in ANOS or l["titular"] != "1" or l["no_recorte"] != "1":
            continue
        if not l["sc_player_id"]:
            sem_id += 1
            continue
        d = fis.get((l["temporada"], l["sc_player_id"]))
        if not d:
            sem_linha += 1
            continue
        x = {"temporada": l["temporada"], "clube": l["clube"], "setor": l["setor"],
             "jogador": l["jogador"], "faixa": l["faixa"], "trave": l["trave"] == "1",
             "fronteira": l["fronteira"] == "1",
             "cobertura_baixa": l["cobertura_baixa"] == "1",
             "minutos_tip": d["minutes_tip"], "minutos_otip": d["minutes_otip"],
             "posse_do_time": posse.get((l["temporada"], l["clube"])),
             "ano_setor": f"{l['temporada']}|{l['setor']}"}
        for c in NIVEIS:
            x[c] = d[c]
        for rid, a, b in RAZOES:
            x[rid] = (d[a] / d[b]) if (d[a] is not None and d[b]) else None
        base.append(x)

    print(f"titulares: {len(base)} · sem linha na physical: {sem_linha} · sem sc_player_id: {sem_id}")
    print("por faixa:", dict(collections.Counter(l["faixa"] for l in base)))
    buracos = {i: sum(1 for l in base if l[i] is None) for i in ids}
    print("buracos:", {k: v for k, v in buracos.items() if v} or "nenhum")
    base = [l for l in base if all(l[i] is not None for i in ids)]

    percentil_no_ano(base, ids, chave_ano="ano_setor")
    setores = sorted({l["setor"] for l in base})

    familias = [(f["id"], [i["id"] for i in f["indicadores"]]) for f in familias_dec]
    GRUPO = {"SM": (lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
             "CM": (lambda l: l["faixa"] == "Cai", lambda l: l["faixa"] == "Meio")}
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    SUB = {"todos": lambda l: True, "sem_cobertura_baixa": lambda l: not l["cobertura_baixa"]}

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
                                           "n_a": na, "n_b": nb})
                        continue
                    comps.append((cid, ga, gb))
                if not comps:
                    continue
                r = comparar(bs, familias, comps, [(rot, filtro)], RNG, lambda i: sinal[i])
                for it in r:
                    it["setor"] = setor
                    it["subamostra"] = sub_id
                    it["unidade"] = "jogador-temporada"
                    it["medida_nome"] = ("razão entre as duas fases (sem a bola ÷ com a bola)"
                                         if it["indicador"].startswith("r_") else
                                         "nível por 30 min da fase")
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

    with open(os.path.join(R, "J11_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)

    # ---- a ressalva medida: a razão é do jogador ou do time? --------------------------------
    com_posse = [l for l in base if l["posse_do_time"] is not None]
    ressalva = {}
    for rid, _, _ in RAZOES:
        rho, p = stats.spearmanr([l[rid] for l in com_posse],
                                 [l["posse_do_time"] for l in com_posse])
        ressalva[rid] = {"rho_com_a_posse_do_time": round(float(rho), 3),
                         "p": round(float(p), 6), "n": len(com_posse)}
    # e a variação: quanto da razão é do clube-temporada?
    def eta2(campo):
        vs = [l[campo] for l in base]
        m = sum(vs) / len(vs)
        sst = sum((v - m) ** 2 for v in vs)
        g = collections.defaultdict(list)
        for l in base:
            g[(l["temporada"], l["clube"])].append(l[campo])
        ssb = sum(len(v) * (sum(v) / len(v) - m) ** 2 for v in g.values())
        return round(ssb / sst, 3) if sst else None
    for rid, _, _ in RAZOES:
        ressalva[rid]["variancia_explicada_pelo_clube"] = eta2(rid)
    print("\nressalva medida — a razão anda com a posse do time?")
    for k, v in ressalva.items():
        print(f"  {k:16s} rho {v['rho_com_a_posse_do_time']:+.3f} · "
              f"o clube explica {100*v['variancia_explicada_pelo_clube']:.1f}% da variação")

    def passam(sub, rot, comp):
        return [(it["setor"], it["indicador"]) for it in res
                if it["subamostra"] == sub and it["fronteira"] == rot
                and it["comparacao"] == comp and it["q"] is not None and it["q"] < 0.05]
    nos_dois = sorted(set(passam("todos", "com", "SM")) & set(passam("todos", "sem", "SM")))
    nos_dois_cm = sorted(set(passam("todos", "com", "CM")) & set(passam("todos", "sem", "CM")))

    T = {(it["subamostra"], it["fronteira"], it["comparacao"], it["setor"], it["indicador"]): it
         for it in res}
    for comp in ("SM", "CM"):
        print(f"\n{'='*104}\n{comp} · corte com · todos — o que passa na correção\n{'='*104}")
        achou = False
        for it in sorted([x for x in res if x["subamostra"] == "todos" and x["fronteira"] == "com"
                          and x["comparacao"] == comp and x["q"] < 0.05],
                         key=lambda x: -abs(x["d"])):
            s = T.get(("todos", "sem", comp, it["setor"], it["indicador"]))
            print(f"  {it['setor']:10s} {it['nome'][:46]:46s} d {it['d']:+.2f} q {it['q']:.4f}"
                  f"  · sem fronteira: d {s['d']:+.2f} q {s['q']:.4f}" if s else "")
            achou = True
        if not achou:
            print("  nada")
    print(f"\npassam nos DOIS cortes — Sobe × Meio: {nos_dois or 'nada'} · "
          f"Cai × Meio: {nos_dois_cm or 'nada'}")

    por_familia = {fid: {"testes": sum(1 for it in res if it["familia"] == fid
                                       and it["subamostra"] == "todos" and it["comparacao"] == "SM"
                                       and it["fronteira"] == "com"),
                         "passam_nos_dois": sum(1 for s, i in nos_dois
                                                if any(x["id"] == i for f in familias_dec
                                                       if f["id"] == fid
                                                       for x in f["indicadores"]))}
                   for fid, _ in familias}

    resumo = {"gerado_em": GERADO_EM, "unidade": "jogador-temporada",
              "n": {"titulares": len(base), "clubes": len({l["clube"] for l in base}),
                    "por_faixa": dict(collections.Counter(l["faixa"] for l in base)),
                    "por_setor": dict(collections.Counter(l["setor"] for l in base)),
                    "sem_linha_na_physical": sem_linha, "sem_sc_player_id": sem_id},
              "n_por_setor": n_por_setor,
              "comparacoes_fora_por_n": fora_por_n,
              "passam_nos_dois_cortes_sobe_x_meio": [{"setor": s, "indicador": i,
                                                      "d_com": T[("todos", "com", "SM", s, i)]["d"],
                                                      "d_sem": T[("todos", "sem", "SM", s, i)]["d"],
                                                      "q_com": T[("todos", "com", "SM", s, i)]["q"],
                                                      "q_sem": T[("todos", "sem", "SM", s, i)]["q"],
                                                      "cru_sobe": T[("todos", "com", "SM", s, i)]["cru_a"],
                                                      "cru_meio": T[("todos", "com", "SM", s, i)]["cru_b"],
                                                      "ic": T[("todos", "com", "SM", s, i)]["ic95_d"]}
                                                     for s, i in nos_dois],
              "passam_nos_dois_cortes_cai_x_meio": [{"setor": s, "indicador": i,
                                                     "d_com": T[("todos", "com", "CM", s, i)]["d"],
                                                     "d_sem": T[("todos", "sem", "CM", s, i)]["d"]}
                                                    for s, i in nos_dois_cm],
              "por_familia_sobe_x_meio": por_familia,
              "a_razao_e_do_time_ou_do_jogador": ressalva,
              "porta_temporal_nao_calculavel": {
                  "parcial": None, "passa": False,
                  "por_que": "a tabela physical tem uma linha por jogador-temporada, sem recorte "
                             "por rodada. Declarado em J11_indicadores.json antes de rodar."}}
    json.dump(resumo, open(os.path.join(R, "J11_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    numeros = {"n": len(base), "n_clubes": resumo["n"]["clubes"],
               "n_setores": len(setores), "n_indicadores": len(ids), "n_familias": len(familias),
               "n_razoes": len(RAZOES), "n_sobe": resumo["n"]["por_faixa"].get("Sobe", 0),
               "n_meio": resumo["n"]["por_faixa"].get("Meio", 0),
               "n_cai": resumo["n"]["por_faixa"].get("Cai", 0),
               "passam_sm": len(nos_dois), "passam_cm": len(nos_dois_cm),
               "testes_sm": sum(v["testes"] for v in por_familia.values()),
               "fora_por_n": len(fora_por_n)}
    for setor, d in n_por_setor.items():
        s = setor.lower().replace(" ", "_")
        numeros[f"nsobe_{s}"] = d["com"]["n_sobe"]
        numeros[f"nmeio_{s}"] = d["com"]["n_meio"]
        numeros[f"dmin_{s}"] = (br(d["com"]["d_minimo_80_sobe_x_meio"], 2)
                                if d["com"]["d_minimo_80_sobe_x_meio"] else "—")
    for it in res:
        # A subamostra sem cobertura baixa também vira marcador. Ela é o corte que o CLAUDE.md
        # manda rodar com dado físico, e é nela que estão as discordâncias entre cortes que o
        # texto precisa citar — publicar o corte de um lado só é a armadilha 4 do catálogo.
        if it["subamostra"] != "todos":
            pre2 = "cb" + ("" if it["comparacao"] == "SM" else "cm")
            k2 = f"{pre2}{it['setor'].lower()}_{it['indicador']}"
            suf2 = "" if it["fronteira"] == "com" else "sem"
            numeros[f"d{suf2}_{k2}"] = br_sinal(it["d"], 2)
            numeros[f"q{suf2}_{k2}"] = br(it["q"], 4)
            continue
        # A comparação Cai × Meio também vira marcador: o único achado que sobrevive aos dois
        # cortes nesta parte está nela, e resultado só existe na tela se tiver marcador.
        pre = "" if it["comparacao"] == "SM" else "cm"
        k = f"{pre}{it['setor'].lower()}_{it['indicador']}"
        suf = "" if it["fronteira"] == "com" else "sem"
        numeros[f"d{suf}_{k}"] = br_sinal(it["d"], 2)
        numeros[f"q{suf}_{k}"] = br(it["q"], 4)
        numeros[f"graf_d{suf}_{k}"] = it["d"]
        if it["fronteira"] == "com":
            # casas conforme a escala: 3.577 metros não se escreve com três decimais, e 3,16
            # arrancadas não se escreve com zero. A régua é o número, não a coluna.
            casas = 0 if abs(it["cru_a"]) >= 100 else (1 if abs(it["cru_a"]) >= 10 else 2)
            numeros[f"ic_{k}"] = ic_br(it["ic95_d"])
            numeros[f"sobe_{k}"] = br(it["cru_a"], casas)
            numeros[f"meio_{k}"] = br(it["cru_b"], casas)
            numeros[f"graf_sobe_{k}"] = round(it["cru_a"], 3)
            numeros[f"graf_meio_{k}"] = round(it["cru_b"], 3)
    for rid, v in ressalva.items():
        numeros[f"posse_{rid}"] = br_sinal(v["rho_com_a_posse_do_time"], 2)
        numeros[f"clube_{rid}"] = br(100 * v["variancia_explicada_pelo_clube"], 1)
        numeros[f"graf_clube_{rid}"] = round(100 * v["variancia_explicada_pelo_clube"], 1)
        numeros[f"graf_posse_{rid}"] = v["rho_com_a_posse_do_time"]
    json.dump({"gerado_por": "scripts/J11.py", "gerado_em": GERADO_EM,
               "numeros": dict(sorted(numeros.items()))},
              open(os.path.join(R, "J11_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n{len(numeros)} marcadores em J11_numeros.json")


if __name__ == "__main__":
    main()
