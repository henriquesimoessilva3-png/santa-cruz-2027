#!/usr/bin/env python3
"""A15 — o que um time faz NUM JOGO que aumenta a chance de pontuar.

A pergunta do bloco A até aqui é da temporada: o que separa quem sobe de quem fica no meio, em 80
clube-temporadas. Esta parte desce à unidade do jogo — 3.036 linhas clube-jogo de 2022 a 2025 —
e pergunta outra coisa: o que muda, dentro de um jogo, entre pontuar e perder. Um time pode
pontuar com o que não o faz subir; as duas perguntas valem e nenhuma substitui a outra.

Lista: `resultados/A15_indicadores.json`, fechada antes de rodar (21 indicadores, 5 famílias).
Método: `scripts/_metodo_jogo.py`, que importa o `scripts/_metodo.py` da casa e troca só o p —
o porquê está no cabeçalho dele, e em resumo: 3.036 linhas são 40 clubes, e o t de Welch sobre
linhas trata pseudorréplica como prova.

## As duas leituras, e por que as duas

- **PD, entre times.** Jogo pontuado contra jogo perdido, misturando todo mundo. Boa parte da
  diferença é só que time bom pontua mais E joga melhor sempre. Sozinha, ela repete o bloco A com
  mais linhas.
- **PDC, dentro do clube.** O indicador entra centrado na média do próprio clube naquela
  temporada e naquele mando — o mesmo time contra ele mesmo, em casa contra os outros jogos dele
  em casa. Tira de uma vez o nível do elenco e a vantagem do mando. É a pergunta nova.

Conclusão só sobe se aparece nas duas leituras e nos dois cortes.

## Os dois cortes

`com` são os 3.036 jogos; `sem` tira os empates. O empate é a forma mais fraca de "pontuou" — o
jogo colado na linha —, e tirá-lo afasta os grupos por construção, exatamente como tirar os times
de fronteira afasta as faixas vizinhas. É teste de robustez, não recorte melhor.

Uso:
    python3 _fonte/estudo_serieb/scripts/A15.py
"""
import collections
import csv
import json
import os
import re
import sys

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import pct, percentil_no_ano  # noqa: E402
from _metodo_jogo import (_conferir_equivalencia, centrar_no_clube, comparar_por_clube,  # noqa: E402
                          diferenca_dentro_do_clube)

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
RNG = np.random.default_rng(20260921)
ANOS = {"2022", "2023", "2024", "2025"}
REPS = 10000        # o piso do p do bootstrap é 1/REPS: com 2.000 ele era 0,0005 e empilhava
                    # meia tabela no mesmo valor, sem que o dado tivesse empatado
GERADO_EM = "2026-09-21"          # fixa de propósito: o script é reprodutível


def br(v, casas):
    return f"{v:.{casas}f}".replace(".", ",")


def br_sinal(v, casas):
    return f"{v:+.{casas}f}".replace(".", ",")


def ic_br(ic):
    return f"{ic[0]:+.2f} a {ic[1]:+.2f}".replace(".", ",")


def ler_jogos():
    """As 3.036 linhas clube-jogo da Série B de 2022 a 2025, cada uma com a linha do adversário."""
    linhas = []
    with open(os.path.join(DADOS, "serieb_jogos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if (r.get("Competição") or "").strip() != "Brazil. Serie B":
                continue
            ano = (r.get("ano") or "").strip()
            if ano not in ANOS:
                continue
            linhas.append(r)
    por_jogo = collections.defaultdict(list)
    for r in linhas:
        por_jogo[(r["ano"], r["Jogo"])].append(r)
    sem_par = [k for k, v in por_jogo.items() if len(v) != 2]
    return linhas, por_jogo, sem_par


def num(r, c):
    try:
        v = float(r[c])
    except (TypeError, ValueError, KeyError):
        return None
    return None if v != v else v


def divide(a, b):
    return (a / b) if (a is not None and b) else None


def montar(linhas, por_jogo):
    base = []
    for r in linhas:
        outros = [o for o in por_jogo[(r["ano"], r["Jogo"])] if o["Equipa"] != r["Equipa"]]
        adv = outros[0] if len(outros) == 1 else None
        res = (r.get("resultado") or "").strip()
        base.append({
            "temporada": r["ano"], "clube": r["Equipa"], "mando": (r.get("mando") or "").strip(),
            "jogo": r["Jogo"], "data": (r.get("Data") or "")[:10], "resultado": res,
            "pontos": {"V": 3, "E": 1, "D": 0}.get(res),
            "pontuou": res in ("V", "E"), "venceu": res == "V",
            # família chance_criada
            "xg": num(r, "Golos esperados"),
            "xg_por_remate": divide(num(r, "Golos esperados"), num(r, "Remates")),
            "dist_remate": num(r, "Distância média do remate"),
            "toques_area": num(r, "Toques na área"),
            # família chance_cedida — o que se cede é o que o ADVERSÁRIO criou
            "xg_contra": num(adv, "Golos esperados") if adv else None,
            "xg_por_remate_contra": divide(num(adv, "Golos esperados") if adv else None,
                                           num(r, "Remates contra")),
            "dist_remate_contra": num(adv, "Distância média do remate") if adv else None,
            "remates_contra": num(r, "Remates contra"),
            # família com_bola
            "posse": num(r, "Posse, %"),
            "passes_certos_pct": num(r, "Passes certos, %"),
            "passes_terco_final": num(r, "Passes para terço final"),
            "passes_por_posse": num(r, "Média de passes por posse"),
            "contra_ataques": num(r, "Contra-ataques"),
            "ataques_posicionais": num(r, "Ataques posicionais"),
            # família sem_bola
            "ppda": num(r, "PPDA"),
            "recuperacoes": num(r, "Recuperações"),
            "duelos_def_pct": num(r, "Duelos defensivos ganhos, %"),
            "duelos_aereos_pct": num(r, "Duelos aéreos ganhos, %"),
            "intensidade": num(r, "Intensidade de jogo"),
            # família bola_parada
            "bolas_paradas_com_remates": num(r, "Bolas paradas com remates"),
            "cantos": num(r, "Cantos"),
        })
    return base


def main():
    dec = json.load(open(os.path.join(R, "A15_indicadores.json"), encoding="utf-8"))
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]
    ids = [i["id"] for i in inds]
    sinal = {i["id"]: i["sinal"] for i in inds}
    nome = {i["id"]: i["nome"] for i in inds}

    linhas, por_jogo, sem_par = ler_jogos()
    if sem_par:
        raise SystemExit(f"jogo sem as duas equipas: {sem_par[:5]}")
    base = montar(linhas, por_jogo)

    buracos = {i: sum(1 for l in base if l[i] is None) for i in ids}
    print(f"base: {len(base)} clube-jogos · {len(por_jogo)} jogos · "
          f"{len({l['clube'] for l in base})} clubes · "
          f"{len({(l['temporada'], l['clube']) for l in base})} clube-temporadas")
    print("buracos por indicador:", {k: v for k, v in buracos.items() if v} or "nenhum")

    percentil_no_ano(base, ids)
    centrar_no_clube(base, ids)

    pontuou = lambda l: l["pontuou"]           # noqa: E731
    perdeu = lambda l: not l["pontuou"]        # noqa: E731

    # A conta fechada do bootstrap é a única coisa aqui que não se confere de olho: antes de
    # qualquer teste, ela é comparada com a concatenação linha a linha, no mesmo sorteio.
    igual, pior, reps_conf = _conferir_equivalencia(base, pct("xg"), pontuou, perdeu, 1)
    print(f"equivalência do bootstrap (conta fechada × concatenação, {reps_conf} sorteios): "
          f"{'IGUAL' if igual else 'DIVERGE'}, maior diferença {pior:.2e}")
    if not igual:
        raise SystemExit("a conta rápida do bootstrap não reproduz a concatenação")

    familias = [(f["id"], [i["id"] for i in f["indicadores"]]) for f in dec["familias"]]
    filtros = [("com", lambda l: True), ("sem", lambda l: l["resultado"] != "E")]
    res = []
    res += comparar_por_clube(base, familias, [("PD", pontuou, perdeu)], filtros, RNG,
                              lambda i: sinal[i], reps=REPS)
    res += comparar_por_clube(base, familias, [("PDC", pontuou, perdeu)], filtros, RNG,
                              lambda i: sinal[i], campo_de=lambda i: pct(i) + "::dc", reps=REPS)
    for it in res:
        it["nome"] = nome[it["indicador"]]

    with open(os.path.join(R, "A15_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)

    # ---- a diferença dentro do clube, na unidade do jogo (o número que vai para a tela) ----
    dentro = {}
    for i in ids:
        for rot, filtro in (("com", lambda l: True), ("sem", lambda l: l["resultado"] != "E")):
            sub = [l for l in base if filtro(l)]
            mediana, celulas = diferenca_dentro_do_clube(sub, i, pontuou, perdeu)
            dentro[f"{i}|{rot}"] = {"mediana_da_diferenca": (round(mediana, 3) if mediana is not None else None),
                                    "celulas": celulas}

    T = {(it["fronteira"], it["comparacao"], it["indicador"]): it for it in res}

    def conta(fronteira, comparacao, chave):
        return sum(1 for it in res if it["fronteira"] == fronteira
                   and it["comparacao"] == comparacao and it[chave] < 0.05)

    resumo = {
        "gerado_em": GERADO_EM,
        "unidade": "clube-jogo",
        "n": {"linhas": len(base), "jogos": len(por_jogo),
              "clubes": len({l["clube"] for l in base}),
              "clube_temporadas": len({(l["temporada"], l["clube"]) for l in base}),
              "pontuou": sum(1 for l in base if l["pontuou"]),
              "perdeu": sum(1 for l in base if not l["pontuou"]),
              "venceu": sum(1 for l in base if l["venceu"]),
              "empatou": sum(1 for l in base if l["resultado"] == "E")},
        "buracos_por_indicador": buracos,
        "equivalencia_do_bootstrap": {"conta": "fechada por somas de clube × concatenação",
                                      "sorteios": reps_conf, "maior_diferenca": pior,
                                      "igual": bool(igual)},
        "o_teste_de_linha_x_o_de_clube": {
            "o_que_e": "quantos dos 21 indicadores sairiam com selo firme se o p viesse do t de "
                       "Welch sobre as 3.036 linhas, contra quantos saem com o p do bootstrap de "
                       "clube que esta parte usa",
            "PD_com": {"linha": conta("com", "PD", "q_linha"), "clube": conta("com", "PD", "q")},
            "PDC_com": {"linha": conta("com", "PDC", "q_linha"), "clube": conta("com", "PDC", "q")},
            "PD_sem": {"linha": conta("sem", "PD", "q_linha"), "clube": conta("sem", "PD", "q")},
            "PDC_sem": {"linha": conta("sem", "PDC", "q_linha"), "clube": conta("sem", "PDC", "q")},
        },
        "o_que_o_desenho_enxerga": {
            "limiar_visivel_mediano": round(float(np.median([it["limiar_visivel"] for it in res])), 3),
            "limiar_visivel_pior": round(max(it["limiar_visivel"] for it in res), 3),
            "d_minimo_80_se_fosse_linha": T[("com", "PD", "xg")]["d_minimo_80_se_fosse_linha"],
            "leitura": "o limiar é a meia-largura do IC95 por clube: o menor |d| que esta amostra "
                       "separa do zero. Abaixo dele, 'não separa' NÃO quer dizer 'não existe'. O "
                       "último número é o que um teste sobre as 3.036 linhas fingiria enxergar.",
        },
        "diferenca_dentro_do_clube": dentro,
        "porta_temporal_nao_calculavel": {
            "parcial": None,
            "passa": False,
            "por_que": "A porta da §6.4 é o indicador do 1º turno contra os PONTOS do 2º. Dentro "
                       "de um jogo, indicador e pontos são simultâneos: não existe 'antes'. "
                       "Declarado em A15_indicadores.json ANTES de rodar. Teto da parte: provável.",
        },
    }
    json.dump(resumo, open(os.path.join(R, "A15_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # ---- a tabela na tela ----
    for comp in ("PD", "PDC"):
        for rot in ("com", "sem"):
            print(f"\n{'='*104}\n{comp} · corte {rot}\n{'='*104}")
            print(f"{'familia':15s} {'indicador':26s} {'n':>10s} {'pontuou':>9s} {'perdeu':>9s} "
                  f"{'d':>6s} {'IC95':>16s} {'q':>8s} {'qlin':>9s}  selo")
            for it in res:
                if it["comparacao"] != comp or it["fronteira"] != rot:
                    continue
                print(f"{it['familia']:15s} {it['indicador'][:26]:26s} "
                      f"{f'{it[chr(110)+chr(95)+chr(97)]}x{it[chr(110)+chr(95)+chr(98)]}':>10s} "
                      f"{it['cru_a']:9.2f} {it['cru_b']:9.2f} {it['d']:+6.2f} "
                      f"{str(it['ic95_d']):>16s} {it['q']:8.5f} {it['q_linha']:9.2e}  {it['selo']}")

    print(f"\n{'='*104}\nA diferença DENTRO do clube, na unidade do jogo (corte com)\n{'='*104}")
    for i in ids:
        v = dentro[f"{i}|com"]
        print(f"  {nome[i][:46]:46s} {br_sinal(v['mediana_da_diferenca'], 3):>10s}  "
              f"({v['celulas']} células clube-temporada-mando)")

    # ==========================================================================================
    # OS NÚMEROS — resultados/A15_numeros.json (regra 1 do portão: todo marcador sai daqui)
    # ==========================================================================================
    n = resumo["n"]
    tl = resumo["o_teste_de_linha_x_o_de_clube"]
    numeros = {
        "n_linhas": n["linhas"], "n_jogos": n["jogos"], "n_clubes": n["clubes"],
        "n_ct": n["clube_temporadas"], "n_pontuou": n["pontuou"], "n_perdeu": n["perdeu"],
        "n_venceu": n["venceu"], "n_empatou": n["empatou"],
        "n_indicadores": len(ids), "n_familias": len(familias), "reps": REPS,
        "limiar": br(resumo["o_que_o_desenho_enxerga"]["limiar_visivel_mediano"], 2),
        "limiar_pior": br(resumo["o_que_o_desenho_enxerga"]["limiar_visivel_pior"], 2),
        "dmin_linha": br(resumo["o_que_o_desenho_enxerga"]["d_minimo_80_se_fosse_linha"], 2),
        "firme_linha_pdc": tl["PDC_com"]["linha"], "firme_clube_pdc": tl["PDC_com"]["clube"],
        "firme_linha_pd": tl["PD_com"]["linha"], "firme_clube_pd": tl["PD_com"]["clube"],
        "firme_linha_pdc_sem": tl["PDC_sem"]["linha"], "firme_clube_pdc_sem": tl["PDC_sem"]["clube"],
    }
    for i in ids:
        for comp in ("PD", "PDC"):
            for rot in ("com", "sem"):
                it = T.get((rot, comp, i))
                if not it:
                    continue
                p = f"{i}_{comp.lower()}_{rot}"
                numeros[f"d_{p}"] = br_sinal(it["d"], 2)
                numeros[f"q_{p}"] = br(it["q"], 4)
                numeros[f"limiar_{p}"] = br(it["limiar_visivel"], 2)
                numeros[f"ic_{p}"] = ic_br(it["ic95_d"])
                numeros[f"selo_{p}"] = it["selo"]
        for rot in ("com", "sem"):
            it = T.get((rot, "PD", i))
            if it:
                numeros[f"bruto_pontuou_{i}_{rot}"] = br(it["cru_a"], 2)
                numeros[f"bruto_perdeu_{i}_{rot}"] = br(it["cru_b"], 2)
            v = dentro[f"{i}|{rot}"]["mediana_da_diferenca"]
            if v is not None:
                # O marcador de GRAFICO vai como numero, nao como texto pt-BR: quem desenha
                # precisa do valor, e o pt-BR e decisao de tela. Os dois convivem de proposito
                # (o texto usa o formatado, o grafico usa este) e saem do mesmo v.
                numeros[f"graf_{i}_{rot}"] = round(v, 3)
                numeros[f"dentro_{i}_{rot}"] = br_sinal(v, 2)
                numeros[f"dentro3_{i}_{rot}"] = br_sinal(v, 3)
                numeros[f"dentro_abs_{i}_{rot}"] = br(abs(v), 2)
    json.dump({"gerado_por": "scripts/A15.py", "gerado_em": GERADO_EM,
               "metodo": "scripts/_metodo_jogo.py sobre scripts/_metodo.py",
               "numeros": dict(sorted(numeros.items()))},
              open(os.path.join(R, "A15_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n{len(numeros)} marcadores em A15_numeros.json")


if __name__ == "__main__":
    main()
