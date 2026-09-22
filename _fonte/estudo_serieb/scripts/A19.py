#!/usr/bin/env python3
"""A19 — a formação do time muda o resultado do jogo?

A coluna `Sistema` de `serieb_jogos.csv` traz a formação dominante de cada clube em cada jogo, e
o estudo nunca a usou. É a pergunta mais comum de vestiário e de diretoria, e até aqui não tinha
número.

Lista: `resultados/A19_indicadores.json`, fechada antes de rodar. Seis formações (as que aparecem
em 150 jogos ou mais), duas leituras e dois cortes.

## A ressalva que manda nesta parte

A formação é ESCOLHIDA, e escolhida com informação que o teste não tem: o adversário, o elenco
daquele dia e o PLACAR. O dado é do jogo inteiro, então o time que virou três na defesa aos 30 do
segundo tempo, perdendo, entra na conta como 3-4-3. **Isto é seleção, não tratamento.** Nenhuma
leitura daqui é "jogar assim produz isto", e sim "quando este time jogou assim, saiu isto".

## As duas leituras

- **ET, entre times.** Que formação aparece nos jogos que rendem ponto, misturando todo mundo.
  Boa parte da diferença é só que time bom usa uma e time ruim usa outra.
- **DC, dentro do clube.** O mesmo clube-temporada, no mesmo mando, comparando os jogos em que
  usou aquela formação com os jogos em que usou outra. É a pergunta nova.

## Os dois cortes

`com` são todos os jogos; `sem` deixa só os jogos em que o time ficou 100% do tempo numa
formação. O jogo em que ele trocou de sistema no meio é o jogo colado na linha — está rotulado
com a dominante e foi, na prática, dois jogos.

Uso:
    python3 _fonte/estudo_serieb/scripts/A19.py
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
from _metodo import bh, cohen_d, d_minimo, pct, percentil_no_ano      # noqa: E402
from _metodo_jogo import amostras_de_d_por_clube, centrar_no_clube, ic_e_p  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
RNG = np.random.default_rng(20260921)
ANOS = ("2022", "2023", "2024", "2025")
REPS = 10000
GERADO_EM = "2026-09-21"
RE_SISTEMA = re.compile(r"^\s*([0-9-]+)\s*\(([\d.]+)%\)\s*$")


def br(v, casas):
    return f"{v:.{casas}f}".replace(".", ",")


def br_sinal(v, casas):
    return f"{v:+.{casas}f}".replace(".", ",")


def main():
    dec = json.load(open(os.path.join(R, "A19_indicadores.json"), encoding="utf-8"))
    entram = dec["formacoes_que_entram"]["lista"]
    comp_id = {c["nome"].split(" contra")[0]: c["id"] for c in dec["comparacoes"]}

    base, fora = [], collections.Counter()
    for l in csv.DictReader(open(os.path.join(DADOS, "serieb_jogos.csv"), encoding="utf-8-sig")):
        if (l.get("Competição") or "").strip() != "Brazil. Serie B" or l.get("ano") not in ANOS:
            continue
        m = RE_SISTEMA.match(l.get("Sistema") or "")
        if not m:
            fora["sem formação legível"] += 1
            continue
        f, tempo = m.group(1), float(m.group(2))
        res = (l.get("resultado") or "").strip()
        linha = {"temporada": l["ano"], "clube": l["Equipa"], "adversario": l["adversario"],
                 "mando": (l.get("mando") or "").strip(), "formacao": f, "tempo_na_formacao": tempo,
                 "inteira": tempo >= 100.0,
                 "pontos": {"V": 3, "E": 1, "D": 0}.get(res)}
        if f not in entram:
            fora[f] += 1
            continue
        base.append(linha)
    print(f"base: {len(base)} clube-jogos nas {len(entram)} formações da lista · "
          f"{sum(fora.values())} fora ({len(fora)} formações)")
    print("  fora:", dict(fora.most_common(6)))
    print(f"  jogos inteiros numa formação só: {sum(1 for l in base if l['inteira'])}")

    percentil_no_ano(base, ["pontos"])
    centrar_no_clube(base, ["pontos"], chaves=("temporada", "clube", "mando"))

    filtros = [("com", lambda l: True), ("sem", lambda l: l["inteira"])]
    leituras = [("ET", pct("pontos")), ("DC", pct("pontos") + "::dc")]

    res, n_min = [], 30
    for rot, filtro in filtros:
        for leitura, campo in leituras:
            ps, itens = [], []
            for f in entram:
                ga = (lambda ff=f, fi=filtro: (lambda l: l["formacao"] == ff and fi(l)))()
                gb = (lambda ff=f, fi=filtro: (lambda l: l["formacao"] != ff and fi(l)))()
                la = [l for l in base if ga(l) and l.get(campo) is not None]
                lb = [l for l in base if gb(l) and l.get(campo) is not None]
                if len(la) < n_min or len(lb) < n_min:
                    continue
                d = cohen_d([l[campo] for l in la], [l[campo] for l in lb])
                am = amostras_de_d_por_clube(base, campo, ga, gb, 1, RNG, reps=REPS)
                ic, p = ic_e_p(am, REPS)
                itens.append({
                    "fronteira": rot, "familia": "formacao", "comparacao": comp_id[f],
                    "indicador": "pontos", "unidade": "clube-jogo", "formacao": f,
                    "leitura": leitura,
                    "medida_nome": "efeito nos pontos do jogo, formação contra as outras",
                    "n_a": len(la), "n_b": len(lb),
                    "clubes_a": len({l["clube"] for l in la}),
                    "clubes_b": len({l["clube"] for l in lb}),
                    "cru_a": round(float(np.mean([l["pontos"] for l in la])), 3),
                    "cru_b": round(float(np.mean([l["pontos"] for l in lb])), 3),
                    "d": round(float(d), 3), "ic95_d": [ic[0], ic[1]], "p": round(float(p), 6),
                    "limiar_visivel": (round((ic[1] - ic[0]) / 2, 3)
                                       if ic[0] is not None else None),
                    "d_minimo_80_se_fosse_linha": d_minimo(len(la), len(lb)),
                })
                ps.append(float(p))
            for it, q in zip(itens, bh(ps)):
                it["q"] = round(q, 6)
                it["selo"] = ("firme" if q < 0.05 else
                              ("pode ser sorte" if it["p"] < 0.05 else "sem diferença clara"))
            res += itens

    with open(os.path.join(R, "A19_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)

    T = {(it["fronteira"], it["leitura"], it["formacao"]): it for it in res}
    for leitura, rotulo in (("ET", "ENTRE TIMES"), ("DC", "DENTRO DO CLUBE (mesmo mando)")):
        for rot in ("com", "sem"):
            print(f"\n{'='*96}\n{rotulo} · corte {rot}\n{'='*96}")
            print(f"{'formação':10s} {'n':>10s} {'pts/jogo':>9s} {'as outras':>10s} {'d':>7s} "
                  f"{'IC95':>16s} {'q':>9s}  selo")
            for f in entram:
                it = T.get((rot, leitura, f))
                if not it:
                    continue
                print(f"{f:10s} {f'{it[chr(110)+chr(95)+chr(97)]}x{it[chr(110)+chr(95)+chr(98)]}':>10s} "
                      f"{it['cru_a']:9.2f} {it['cru_b']:10.2f} {it['d']:+7.3f} "
                      f"{str(it['ic95_d']):>16s} {it['q']:9.5f}  {it['selo']}")

    passam = {(rot, le): [f for f in entram
                          if T.get((rot, le, f)) and T[(rot, le, f)]["q"] < 0.05]
              for rot in ("com", "sem") for le in ("ET", "DC")}
    nos_dois = {le: [f for f in passam[("com", le)] if f in passam[("sem", le)]]
                for le in ("ET", "DC")}
    print("\npassam nos dois cortes — entre times:", nos_dois["ET"] or "nenhuma",
          "· dentro do clube:", nos_dois["DC"] or "nenhuma")

    resumo = {
        "gerado_em": GERADO_EM, "unidade": "clube-jogo",
        "n": {"linhas": len(base), "clubes": len({l["clube"] for l in base}),
              "clube_temporadas": len({(l["temporada"], l["clube"]) for l in base}),
              "fora_da_lista": sum(fora.values()),
              "jogos_inteiros": sum(1 for l in base if l["inteira"])},
        "formacoes_fora": dict(fora),
        "passam_nos_dois_cortes": nos_dois,
        "pontos_por_jogo": {f: {"com_a_formacao": T[("com", "ET", f)]["cru_a"],
                                "nas_outras": T[("com", "ET", f)]["cru_b"],
                                "jogos": T[("com", "ET", f)]["n_a"]}
                            for f in entram if ("com", "ET", f) in T},
        "porta_temporal_nao_calculavel": {
            "parcial": None, "passa": False,
            "por_que": "formação e resultado são do mesmo jogo; não existe 'antes'. Declarado em "
                       "A19_indicadores.json antes de rodar. Teto: provável."},
        "a_ressalva_que_manda": dec["a_ressalva_que_manda_nesta_parte"],
    }
    json.dump(resumo, open(os.path.join(R, "A19_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    numeros = {
        "n": len(base), "n_clubes": resumo["n"]["clubes"], "n_ct": resumo["n"]["clube_temporadas"],
        "n_fora": resumo["n"]["fora_da_lista"], "n_inteiros": resumo["n"]["jogos_inteiros"],
        "n_formacoes": len(entram), "n_formacoes_fora": len(fora),
        "passam_et": len(nos_dois["ET"]), "passam_dc": len(nos_dois["DC"]),
    }
    for f in entram:
        k = f.replace("-", "")
        for rot in ("com", "sem"):
            for le in ("ET", "DC"):
                it = T.get((rot, le, f))
                if not it:
                    continue
                s = f"{k}_{le.lower()}_{rot}"
                numeros[f"d_{s}"] = br_sinal(it["d"], 2)
                numeros[f"q_{s}"] = br(it["q"], 4)
                numeros[f"ic_{s}"] = f"{it['ic95_d'][0]:+.2f} a {it['ic95_d'][1]:+.2f}".replace(".", ",")
                numeros[f"pts_{s}"] = br(it["cru_a"], 2)
                numeros[f"ptsout_{s}"] = br(it["cru_b"], 2)
                numeros[f"graf_pts_{s}"] = it["cru_a"]
                numeros[f"graf_d_{s}"] = it["d"]
        if ("com", "ET", f) in T:
            numeros[f"jogos_{k}"] = T[("com", "ET", f)]["n_a"]
    json.dump({"gerado_por": "scripts/A19.py", "gerado_em": GERADO_EM,
               "numeros": dict(sorted(numeros.items()))},
              open(os.path.join(R, "A19_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n{len(numeros)} marcadores em A19_numeros.json")


if __name__ == "__main__":
    main()
