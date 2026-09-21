#!/usr/bin/env python3
"""A18 — a dividida no chão: o que ela mede no ano e o que ela mede no jogo.

A tensão, escrita em aberto no A15 e agora medida. De um lado, o A06-1: quem sobe ganha mais a
dividida no chão que o meio, e é o maior efeito do estudo. Do outro, a leitura de jogo do A15:
dentro do próprio clube e do mesmo mando, o jogo em que o time pontua é o jogo em que ele ganha
DE LEVE MENOS dividida. Enquanto isso não se resolver, a dividida não pode virar requisito de
contratação.

As quatro hipóteses estão declaradas em `A18_indicadores.json` ANTES de rodar, com o teste de
cada uma escrito ao lado. Em resumo:

- **H1, soma zero.** A dividida defensiva ganha de um time é o complemento da ofensiva ganha do
  outro, no mesmo jogo. Se for, a variação de jogo a jogo mede o ADVERSÁRIO tanto quanto o time.
- **H2, o adversário manda na variação.** Quanto da variância por jogo cada agrupamento explica.
- **H3, o controle do adversário desfaz o sinal.** A mesma comparação da A15, com o indicador
  centrado também na média do adversário.
- **H4, é dinheiro.** Na temporada, ganhar dividida anda com o valor do elenco.

O que a base NÃO tem, e por isso não se tenta: escalação por jogo. Não dá para saber quem eram os
zagueiros em cada jogo — só quem eram no ano.

Uso:
    python3 _fonte/estudo_serieb/scripts/A18.py
"""
import collections
import csv
import json
import os
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import pct, percentil_no_ano                              # noqa: E402
from _metodo_jogo import centrar_no_clube, comparar_por_clube          # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
RNG = np.random.default_rng(20260921)
ANOS = ("2022", "2023", "2024", "2025")
REPS = 10000
GERADO_EM = "2026-09-21"


def br(v, casas):
    return f"{v:.{casas}f}".replace(".", ",")


def br_sinal(v, casas):
    return f"{v:+.{casas}f}".replace(".", ",")


def num(v):
    try:
        x = float(v)
    except (TypeError, ValueError):
        return None
    return None if x != x else x


def eta2(linhas, campo, chaves):
    """Quanto da variância do campo o agrupamento explica, sozinho (eta²).

    Simples de propósito, e a limitação vai escrita: os três agrupamentos se sobrepõem, então as
    parcelas NÃO somam 100%. Cada uma responde "se eu soubesse só isto, quanto da variação eu
    explicaria?", que é a pergunta que interessa aqui.
    """
    vs = [l[campo] for l in linhas]
    media = sum(vs) / len(vs)
    sst = sum((v - media) ** 2 for v in vs)
    grupos = collections.defaultdict(list)
    for l in linhas:
        grupos[tuple(l[k] for k in chaves)].append(l[campo])
    ssb = sum(len(g) * (sum(g) / len(g) - media) ** 2 for g in grupos.values())
    return round(ssb / sst, 3) if sst else None


def main():
    dec = json.load(open(os.path.join(R, "A18_indicadores.json"), encoding="utf-8"))
    inds = dec["indicadores"]
    sinal = {i["id"]: i["sinal"] for i in inds}
    nome = {i["id"]: i["nome"] for i in inds}

    # ---- a base clube-jogo, com a linha do adversário ao lado --------------------------------
    cru = [l for l in csv.DictReader(open(os.path.join(DADOS, "serieb_jogos.csv"),
                                          encoding="utf-8-sig"))
           if (l.get("Competição") or "").strip() == "Brazil. Serie B" and l.get("ano") in ANOS]
    por_jogo = collections.defaultdict(list)
    for l in cru:
        por_jogo[(l["ano"], l["Jogo"])].append(l)
    base = []
    for l in cru:
        adv = [o for o in por_jogo[(l["ano"], l["Jogo"])] if o["Equipa"] != l["Equipa"]]
        if len(adv) != 1:
            continue
        a = adv[0]
        res = (l.get("resultado") or "").strip()
        base.append({
            "temporada": l["ano"], "clube": l["Equipa"], "adversario": l["adversario"],
            "mando": (l.get("mando") or "").strip(), "resultado": res,
            "pontuou": res in ("V", "E"),
            "duelos_def_pct": num(l["Duelos defensivos ganhos, %"]),
            "duelos_of_pct_adv": num(a["Duelos ofensivos ganhos, %"]),
            "duelos_def_n": num(l["Duelos defensivos"]),
            "adv_temporada": f"{l['ano']}|{l['adversario']}",
            "clube_temporada": f"{l['ano']}|{l['Equipa']}",
        })
    base = [l for l in base if all(l[i["id"]] is not None for i in inds)]
    print(f"base: {len(base)} clube-jogos · {len({l['clube'] for l in base})} clubes · "
          f"{len({l['clube_temporada'] for l in base})} clube-temporadas")

    # ---- H1: soma zero ------------------------------------------------------------------------
    x = [l["duelos_def_pct"] for l in base]
    y = [l["duelos_of_pct_adv"] for l in base]
    rho_h1, p_h1 = stats.spearmanr(x, y)
    soma = [a + b for a, b in zip(x, y)]
    h1 = {"rho": round(float(rho_h1), 4), "p": float(p_h1), "n": len(base),
          "soma_mediana": round(float(np.median(soma)), 2),
          "soma_desvio": round(float(np.std(soma)), 2),
          "leitura": ("as duas medidas são o complemento uma da outra: a dividida defensiva ganha "
                      "pelo time é a dividida ofensiva PERDIDA pelo adversário, no mesmo lance")}
    print(f"\nH1 soma zero: rho {h1['rho']:+.4f} · a soma das duas dá "
          f"{h1['soma_mediana']} na mediana, com desvio {h1['soma_desvio']}")

    # ---- H2: quem manda na variação -----------------------------------------------------------
    celulas = {k: len({tuple(l[c] for c in k) for l in base})
               for k in (("clube_temporada",), ("adv_temporada",), ("mando",),
                         ("clube_temporada", "adv_temporada"))}
    h2 = {"clube_temporada": eta2(base, "duelos_def_pct", ("clube_temporada",)),
          "adversario_temporada": eta2(base, "duelos_def_pct", ("adv_temporada",)),
          "mando": eta2(base, "duelos_def_pct", ("mando",)),
          "clube_e_adversario": eta2(base, "duelos_def_pct", ("clube_temporada", "adv_temporada")),
          "celulas_por_agrupamento": {"|".join(k): v for k, v in celulas.items()},
          "linhas_por_celula": {"|".join(k): round(len(base) / v, 2) for k, v in celulas.items()},
          "aviso": "os agrupamentos se sobrepõem; as parcelas NÃO somam 100%",
          "aviso_do_par": ("o agrupamento clube × adversário tem cerca de duas linhas por célula: "
                           "com tão poucos jogos por par, ele ajusta ruído e o valor dele NÃO se "
                           "lê como 'o par explica metade'. Fica publicado para que a inflação "
                           "seja visível, e não é usado em conclusão nenhuma.")}
    print(f"H2 variância explicada — clube {h2['clube_temporada']:.1%} · "
          f"adversário {h2['adversario_temporada']:.1%} · mando {h2['mando']:.1%}")

    # ---- H3: a comparação da A15, agora com o adversário no centro ---------------------------
    ids = [i["id"] for i in inds]
    percentil_no_ano(base, ids)
    centrar_no_clube(base, ids, chaves=("temporada", "clube", "mando"), sufixo="::dc")
    centrar_no_clube(base, ids, chaves=("temporada", "clube", "mando", "adv_temporada"),
                     sufixo="::dca")
    # Centrar por (clube, mando, adversário) deixa ~1 jogo por célula e apaga tudo. O certo é
    # tirar a média do clube E a do adversário, uma de cada vez, sobre o mesmo campo.
    for i in ids:
        campo = pct(i)
        por_adv = collections.defaultdict(list)
        for l in base:
            if l.get(campo + "::dc") is not None:
                por_adv[l["adv_temporada"]].append(l)
        for ls in por_adv.values():
            m = sum(l[campo + "::dc"] for l in ls) / len(ls)
            for l in ls:
                l[campo + "::dcadv"] = l[campo + "::dc"] - m

    pontuou = lambda l: l["pontuou"]           # noqa: E731
    perdeu = lambda l: not l["pontuou"]        # noqa: E731
    familias = [("dividida", ids)]
    filtros = [("com", lambda l: True), ("sem", lambda l: l["resultado"] != "E")]
    res = []
    for cid, campo_de in (("PDC", lambda i: pct(i) + "::dc"),
                          ("PDCA", lambda i: pct(i) + "::dcadv")):
        res += comparar_por_clube(base, familias, [(cid, pontuou, perdeu)], filtros, RNG,
                                  lambda i: sinal[i], campo_de=campo_de, reps=REPS)
    # ---- a regra 7 do portão: quem é DONO da linha, e quem só cita ---------------------------
    # A comparação PDC × duelos_def_pct é a MESMA célula que o A15 já publicou: mesma unidade,
    # mesma comparação, mesmo indicador, e o d sai idêntico. O que mudaria seria só o q, porque a
    # família daqui tem três indicadores e a de lá tem cinco — e o BH divide o crédito entre os
    # vizinhos. Dois q para a mesma medida é exatamente o defeito que a regra 7 caça, e a regra
    # da casa é: uma parte é dona e a outra cita. O A15 é dono; esta parte cita.
    dono_de = {"duelos_def_pct": "A15"}
    a15 = {(l["fronteira"], l["comparacao"], l["indicador"]): l
           for l in csv.DictReader(open(os.path.join(R, "A15_testes.csv"), encoding="utf-8"))}
    citadas = 0
    for it in res:
        it["nome"] = nome[it["indicador"]]
        it["q_de"] = ""
        it["citado"] = 0
        it["leitura"] = ("dentro do clube e do mando" if it["comparacao"] == "PDC"
                         else "dentro do clube, do mando E do adversário")
        dono = dono_de.get(it["indicador"])
        if dono and it["comparacao"] == "PDC":
            g = a15.get((it["fronteira"], "PDC", it["indicador"]))
            if not g or not g.get("q"):
                raise SystemExit(f"linha citada sem gêmea em {dono}: {it['indicador']}")
            if abs(float(g["d"]) - it["d"]) > 0.005:
                raise SystemExit(f"a célula citada não é a mesma: d {g['d']} × {it['d']}")
            it["q"], it["p"] = float(g["q"]), float(g["p"])
            it["selo"] = g.get("selo")
            it["q_de"] = dono
            it["citado"] = 1
            citadas += 1
    print(f"  {citadas} linhas citadas do A15 (mesma célula, q do dono)")
    with open(os.path.join(R, "A18_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)

    # ---- H4: o dinheiro, na temporada ---------------------------------------------------------
    tec = {(l["ano"], l["clube"]): l
           for l in csv.DictReader(open(os.path.join(DADOS, "serieb_clube_temporada.csv"),
                                        encoding="utf-8-sig"))}
    por_ct = collections.defaultdict(list)
    for l in base:
        por_ct[(l["temporada"], l["clube"])].append(l)
    temporada = []
    for (ano, clube), js in por_ct.items():
        t = tec.get((ano, clube))
        if not t:
            continue
        temporada.append({"temporada": ano, "clube": clube,
                          "duelos_def_pct": sum(j["duelos_def_pct"] for j in js) / len(js),
                          "valor": num(t.get("tm_valor_total"))})
    temporada = [l for l in temporada if l["valor"] is not None]
    percentil_no_ano(temporada, ["duelos_def_pct", "valor"])
    rho_h4, p_h4 = stats.spearmanr([l[pct("duelos_def_pct")] for l in temporada],
                                   [l[pct("valor")] for l in temporada])
    h4 = {"rho": round(float(rho_h4), 3), "p": round(float(p_h4), 5), "n": len(temporada),
          "convencao": "posto alto = ganha mais dividida; rho positivo = elenco caro ganha mais",
          "nunca_desconto": "decisão de 15/09: o valor do elenco descreve ao lado, não desconta"}
    print(f"H4 dividida × dinheiro na temporada: rho {h4['rho']:+.3f} (p {h4['p']:.4f}, n {h4['n']})")

    T = {(it["fronteira"], it["comparacao"], it["indicador"]): it for it in res}
    print(f"\n{'='*104}\nH3 — a mesma comparação, sem e com o adversário no centro\n{'='*104}")
    print(f"{'leitura':34s} {'corte':6s} {'indicador':24s} {'d':>7s} {'IC95':>16s} {'q':>9s}")
    for it in res:
        print(f"{it['leitura']:34s} {it['fronteira']:6s} {it['indicador'][:24]:24s} "
              f"{it['d']:+7.3f} {str(it['ic95_d']):>16s} {it['q']:9.5f}")

    resumo = {"gerado_em": GERADO_EM, "unidade": "clube-jogo",
              "n": {"linhas": len(base), "clubes": len({l["clube"] for l in base}),
                    "clube_temporadas": len({l["clube_temporada"] for l in base}),
                    "temporadas_com_valor": len(temporada)},
              "H1_soma_zero": h1, "H2_variancia": h2,
              "H3_controle_do_adversario": {
                  "sem_o_adversario": {k: {"d": T[(k, "PDC", "duelos_def_pct")]["d"],
                                           "q": T[(k, "PDC", "duelos_def_pct")]["q"],
                                           "ic": T[(k, "PDC", "duelos_def_pct")]["ic95_d"]}
                                       for k in ("com", "sem")},
                  "com_o_adversario": {k: {"d": T[(k, "PDCA", "duelos_def_pct")]["d"],
                                           "q": T[(k, "PDCA", "duelos_def_pct")]["q"],
                                           "ic": T[(k, "PDCA", "duelos_def_pct")]["ic95_d"]}
                                       for k in ("com", "sem")}},
              "H4_dinheiro": h4,
              "porta_temporal_nao_calculavel": {
                  "parcial": None, "passa": False,
                  "por_que": "unidade jogo: indicador e ponto são simultâneos, como a A15 declarou"},
              "o_que_a_base_nao_tem": "escalação por jogo — não há nome de jogador em "
                                      "serieb_jogos.csv, então não dá para saber quem eram os "
                                      "zagueiros em cada jogo, só quem eram no ano"}
    json.dump(resumo, open(os.path.join(R, "A18_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    numeros = {
        "n": len(base), "n_clubes": resumo["n"]["clubes"], "n_ct": resumo["n"]["clube_temporadas"],
        "h1_rho": br(abs(h1["rho"]), 3), "h1_soma": br(h1["soma_mediana"], 1),
        "h1_desvio": br(h1["soma_desvio"], 1),
        "h2_clube": br(100 * h2["clube_temporada"], 1),
        "h2_adv": br(100 * h2["adversario_temporada"], 1),
        "h2_mando": br(100 * h2["mando"], 1),
        "h2_juntos": br(100 * h2["clube_e_adversario"], 1),
        "h4_rho": br_sinal(h4["rho"], 2), "h4_p": br(h4["p"], 4), "h4_n": h4["n"],
        "graf_h2_clube": round(100 * h2["clube_temporada"], 1),
        "graf_h2_adv": round(100 * h2["adversario_temporada"], 1),
        "graf_h2_mando": round(100 * h2["mando"], 1),
    }
    for (rot, cid, i), it in T.items():
        k = f"{i}_{cid.lower()}_{rot}"
        numeros[f"d_{k}"] = br_sinal(it["d"], 2)
        numeros[f"d3_{k}"] = br_sinal(it["d"], 3)
        numeros[f"q_{k}"] = br(it["q"], 4)
        numeros[f"ic_{k}"] = f"{it['ic95_d'][0]:+.2f} a {it['ic95_d'][1]:+.2f}".replace(".", ",")
        numeros[f"graf_d_{k}"] = it["d"]
    json.dump({"gerado_por": "scripts/A18.py", "gerado_em": GERADO_EM,
               "numeros": dict(sorted(numeros.items()))},
              open(os.path.join(R, "A18_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n{len(numeros)} marcadores em A18_numeros.json")


if __name__ == "__main__":
    main()
