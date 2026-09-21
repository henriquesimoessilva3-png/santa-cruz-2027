#!/usr/bin/env python3
"""A16 — dentro do que o dinheiro compra, qual traço dá mais ponto por real?

É a pergunta de quem não vai ter folha de top-5. O bloco A já sabe o que separa quem sobe; o que
ele não separou é o quanto disso é o traço e o quanto é o elenco caro. Aqui o dinheiro entra como
CONTROLE — nunca como desconto, que a especificação proibiu em 15/09 — e o que sobra depois dele
é a resposta.

Lista: `resultados/A16_indicadores.json`, fechada antes de rodar. Ela NÃO é escolhida aqui: são os
candidatos do A14 (firmes nos dois cortes em Sobe × Meio, sem placar redescrito), menos o
H_dinheiro, que aqui é o controle, e menos o I_estabilidade_11, que o A14 tirou por ser
consequência do resultado.

## As duas contas, e por que as duas

1. **A parcial**, receita idêntica à da §6.4 (`_porta_temporal.parcial`): resíduo por MQO contra o
   controle, depois Spearman entre os resíduos. Responde "sobra alguma coisa depois do dinheiro?".
2. **A porta com dinheiro**: o traço nas 19 primeiras rodadas contra os PONTOS das 19 últimas, com
   parcial dada à pontuação do 1º turno E ao dinheiro. É a §6.4 com um controle a mais — régua
   mais apertada, nunca mais frouxa. Sem o dinheiro ali, a porta não distingue "este traço vem
   antes" de "quem tem este traço é rico".

E, para a decisão sair em número de reunião, uma regressão dos pontos sobre os dois postos: quanto
vale sair do percentil 25 para o 75 no traço, em PONTOS, e a quanto de elenco isso equivale, em
EURO — que é a moeda da base do Transfermarkt.

Uso:
    python3 _fonte/estudo_serieb/scripts/A16.py
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
import A14                                 # noqa: E402  a base do clube-temporada, já montada lá
import _porta_temporal as p64              # noqa: E402  a §6.4, onde a parcial está conferida
from _metodo import bh, d_minimo, pct, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
ANOS = ("2022", "2023", "2024", "2025")
GERADO_EM = "2026-09-21"
VALOR = "tm_valor_total"


def br(v, casas):
    return f"{v:.{casas}f}".replace(".", ",")


def br_sinal(v, casas):
    return f"{v:+.{casas}f}".replace(".", ",")


def eur(v):
    """Euro em português, na escala que a diretoria lê: milhões com uma casa."""
    return f"{v / 1e6:.1f}".replace(".", ",") + " mi"


def parcial_multipla(x, y, controles, tol=1e-9):
    """A parcial da §6.4 com MAIS DE UM controle.

    Mesma receita, letra por letra: resíduo por MQO contra os controles (com intercepto), depois
    Spearman entre os dois resíduos. Com UM controle ela tem de devolver exatamente o que
    `_porta_temporal.parcial` devolve — e é isso que `_conferir_contra_a_64()` checa antes de
    qualquer número sair daqui. Generalizar sem conferir seria reimplementar o teste ao lado, que
    é justamente o que a regra 5 do portão existe para pegar.
    """
    n = len(x)
    A = np.column_stack([np.asarray(c, float) for c in controles] + [np.ones(n)])

    def resid(a):
        coef, *_ = np.linalg.lstsq(A, np.asarray(a, float), rcond=None)
        return np.asarray(a, float) - A @ coef

    rho, p = stats.spearmanr(resid(x), resid(y))
    return float(rho), float(p)


def _conferir_contra_a_64(x, y, z):
    """Com um controle só, a conta daqui é a da §6.4? Falha fechada se não for."""
    a = p64.parcial(x, y, z, len(x))
    b = parcial_multipla(x, y, [z])
    pior = max(abs(a[0] - b[0]), abs(a[1] - b[1]))
    return pior <= 1e-9, pior


def valor_por_temporada():
    """O valor do elenco, em euro, por clube-temporada, e o degrau entre o 25º e o 75º percentil.

    O degrau é o preço de referência: quanto custa, em elenco, subir do quarto de baixo para o
    quarto de cima da liga naquele ano. É com ele que o efeito de um traço vira euro.
    """
    val, por_ano = {}, collections.defaultdict(list)
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r["ano"] not in ANOS:
                continue
            try:
                v = float(r[VALOR])
            except (TypeError, ValueError):
                continue
            val[(r["ano"], r["clube"])] = v
            por_ano[r["ano"]].append(v)
    degraus = {a: float(np.percentile(vs, 75) - np.percentile(vs, 25)) for a, vs in por_ano.items()}
    return val, degraus, float(np.median(list(degraus.values())))


def por_turno(traços):
    """Os mesmos traços medidos só nas 19 primeiras rodadas, pelas funções da §6.4.

    Nada reimplementado: `ler_jogos`, `media`, `razao` e `pontos` são as do `_porta_temporal.py`,
    que é onde a §6.4 está conferida célula a célula contra a tabela publicada.
    """
    _, por = p64.ler_jogos()
    reg = []
    for (temporada, clube), js in por.items():
        a = js[:p64.TURNO]
        casa = [j for j in a if j["mando"] == "casa"]
        fora = [j for j in a if j["mando"] == "fora"]
        l = {"temporada": temporada, "clube": clube,
             "pts_1t": sum(p64.pontos(j) for j in a),
             "pts_2t": sum(p64.pontos(j) for j in js[p64.TURNO:]),
             "dist_remate": p64.media(a, "dist"),
             "duelos_def_pct": p64.media(a, "dd"),
             "dd_casa": p64.media(casa, "dd"),
             "dd_fora": p64.media(fora, "dd"),
             "xg_por_remate_contra": p64.razao(a, "xg_sofrido", "remates_contra"),
             "xgc_casa": p64.media(casa, "xg_sofrido"),
             "_E_dist_remate": p64.media(a, "dist"),
             "_E_xg_por_remate": p64.razao(a, "xg", "remates"),
             "_E_toques_area": p64.media(a, "toques_area"),
             "_E_entradas_area": p64.media(a, "entradas_area"),
             "_F_xg_contra": p64.media(a, "xg_sofrido"),
             "_F_remates_contra": p64.media(a, "remates_contra"),
             "_F_xg_por_remate_contra": p64.razao(a, "xg_sofrido", "remates_contra")}
        reg.append(l)
    percentil_no_ano(reg, ["pts_1t", "pts_2t"])
    # As duas réguas, remontadas POR TURNO — do mesmo jeito que a §6.4 remonta a E.
    for nome, itens in (("E_qualidade_chance", [("_E_dist_remate", -1), ("_E_xg_por_remate", 1),
                                                ("_E_toques_area", 1), ("_E_entradas_area", 1)]),
                        ("F_solidez", [("_F_xg_contra", -1), ("_F_remates_contra", -1),
                                       ("_F_xg_por_remate_contra", -1)])):
        completos = [l for l in reg if all(l[i] is not None for i, _ in itens)]
        percentil_no_ano(completos, [i for i, _ in itens])
        for l in reg:
            l[nome] = None
        for l in completos:
            l[nome] = sum((l[pct(i)] if s > 0 else 100 - l[pct(i)]) for i, s in itens) / len(itens)
    return {(l["temporada"], l["clube"]): l for l in reg}


def main():
    dec = json.load(open(os.path.join(R, "A16_indicadores.json"), encoding="utf-8"))
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]
    ids = [i["id"] for i in inds]
    sinal = {i["id"]: i["sinal"] for i in inds}
    nome = {i["id"]: i["nome"] for i in inds}

    # A lista é HERDADA do A14, e isso se confere, não se alega.
    a14 = json.load(open(os.path.join(R, "A14_resumo.json"), encoding="utf-8"))
    cand = [c["indicador"] for c in a14["candidatos"]]
    fora = {"H_dinheiro"} | {x[0] for x in a14["fora_por_ser_consequencia"]}
    esperado = [c for c in cand if c not in fora]
    if sorted(esperado) != sorted(ids):
        raise SystemExit(f"a lista não é a do A14: esperado {sorted(esperado)}, "
                         f"declarado {sorted(ids)}")
    print(f"lista herdada do A14, conferida: {len(ids)} traços "
          f"(fora: {', '.join(sorted(fora))})")

    base = A14.base_completa(ids + ["H_dinheiro", VALOR])
    base = [l for l in base if l["temporada"] in ANOS]
    val, degraus, degrau = valor_por_temporada()
    for l in base:
        l["valor_eur"] = val.get((l["temporada"], l["clube"]))
    base = [l for l in base if l["valor_eur"] is not None]
    percentil_no_ano(base, ["pontos"])
    print(f"base: {len(base)} clube-temporadas · {len({l['clube'] for l in base})} clubes")
    print(f"degrau do 25º ao 75º percentil de elenco, por ano: "
          + " · ".join(f"{a} {eur(v)}" for a, v in sorted(degraus.items()))
          + f" · mediana {eur(degrau)}")

    # A conta desta parte é a da §6.4? Conferido antes de qualquer número sair.
    ok, pior = _conferir_contra_a_64([l[pct("dist_remate")] for l in base],
                                     [l[pct("pontos")] for l in base],
                                     [l[pct(VALOR)] for l in base])
    print(f"parcial com um controle × _porta_temporal.parcial: "
          f"{'IDÊNTICA' if ok else 'DIVERGE'} (maior diferença {pior:.2e})")
    if not ok:
        raise SystemExit("a parcial daqui não reproduz a da §6.4")

    turno = por_turno(ids)

    controles = [("PV", VALOR, "valor total do elenco"),
                 ("PR", "H_dinheiro", "régua do dinheiro")]
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]

    res = []
    for rot, filtro in filtros:
        sub = [l for l in base if filtro(l)]
        for cid, ctrl, ctrl_nome in controles:
            for fam in dec["familias"]:
                ps, itens = [], []
                for i in fam["indicadores"]:
                    t = i["id"]
                    linhas = [l for l in sub if l.get(pct(t)) is not None]
                    x = [l[pct(t)] * sinal[t] for l in linhas]
                    y = [l[pct("pontos")] for l in linhas]
                    z = [l[pct(ctrl)] for l in linhas]
                    n = len(linhas)
                    rho_s, p_s = stats.spearmanr(x, y)
                    pr, pp = parcial_multipla(x, y, [z])
                    # O número de reunião: pontos e euro, da mesma regressão.
                    A = np.column_stack([x, z, np.ones(n)])
                    coef, *_ = np.linalg.lstsq(A, np.asarray([l["pontos"] for l in linhas], float),
                                               rcond=None)
                    b_tr, b_val = float(coef[0]), float(coef[1])
                    pontos_50 = b_tr * 50
                    eur_equiv = (degrau * (b_tr / b_val)) if b_val > 0 else None
                    # A porta da §6.4 com o dinheiro no controle
                    tt = [turno.get((l["temporada"], l["clube"])) for l in linhas]
                    pares = [(a, l) for a, l in zip(tt, linhas) if a and a.get(t) is not None]
                    porta = None
                    if len(pares) >= 20:
                        reg = [{**{k: a[k] for k in ("pts_1t", "pts_2t")}, "temporada": a["temporada"],
                                "clube": a["clube"], "v": a[t], "ctrl": l[pct(ctrl)]}
                               for a, l in pares]
                        # posto dentro do ano DENTRO deste corte, como a §6.4 faz
                        percentil_no_ano(reg, ["v", "pts_1t", "pts_2t"])
                        xt = [r[pct("v")] * sinal[t] for r in reg]
                        yt = [r[pct("pts_2t")] for r in reg]
                        z1 = [r[pct("pts_1t")] for r in reg]
                        z2 = [r["ctrl"] for r in reg]
                        rr, rp = parcial_multipla(xt, yt, [z1, z2])
                        # A MESMA porta SEM o dinheiro — a da §6.4 como a casa a roda. Ela entra
                        # ao lado para que a queda fique medida: é o tamanho do que o dinheiro
                        # estava segurando dentro do que parecia anterioridade do traço.
                        r64, p64v = p64.parcial(xt, yt, z1, len(reg))
                        porta = {"parcial": round(rr, 3), "p_parcial": round(rp, 5),
                                 "n": len(reg), "passa": bool(rp < 0.05 and rr > 0),
                                 "sem_dinheiro": round(r64, 3), "p_sem_dinheiro": round(p64v, 5),
                                 "passa_sem_dinheiro": bool(p64v < 0.05 and r64 > 0)}
                    itens.append({
                        "fronteira": rot, "familia": fam["id"], "comparacao": cid,
                        "indicador": t, "unidade": "clube-temporada",
                        "medida_nome": "correlação parcial (posto), dado o dinheiro",
                        "controle": ctrl, "n_a": n, "n_b": n,
                        "rho_sem_controle": round(float(rho_s), 3),
                        "p_sem_controle": round(float(p_s), 5),
                        "d": round(pr, 3), "p": round(float(pp), 5),
                        "pontos_por_50pct": round(pontos_50, 2),
                        "pontos_do_dinheiro_por_50pct": round(b_val * 50, 2),
                        "euro_equivalente": (round(eur_equiv) if eur_equiv is not None else None),
                        "porta_parcial": (porta or {}).get("parcial"),
                        "porta_p": (porta or {}).get("p_parcial"),
                        "porta_n": (porta or {}).get("n"),
                        "porta_passa": (porta or {}).get("passa"),
                        "porta_sem_dinheiro": (porta or {}).get("sem_dinheiro"),
                        "porta_p_sem_dinheiro": (porta or {}).get("p_sem_dinheiro"),
                        "porta_passa_sem_dinheiro": (porta or {}).get("passa_sem_dinheiro"),
                        "nome": nome[t],
                    })
                    ps.append(float(pp))
                for it, q in zip(itens, bh(ps)):
                    it["q"] = round(q, 5)
                    it["selo"] = ("firme" if q < 0.05 and it["porta_passa"] else
                                  ("provável" if q < 0.05 or it["porta_passa"] else
                                   "sem diferença clara"))
                res += itens

    with open(os.path.join(R, "A16_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)

    T = {(it["fronteira"], it["comparacao"], it["indicador"]): it for it in res}
    for rot in ("com", "sem"):
        print(f"\n{'='*112}\nCorte {rot} · controle = valor total do elenco\n{'='*112}")
        print(f"{'traço':34s} {'rho':>7s} {'parcial':>8s} {'q':>8s} {'pts/50pct':>10s} "
              f"{'= elenco':>10s} {'porta':>8s}  selo")
        for it in res:
            if it["fronteira"] != rot or it["comparacao"] != "PV":
                continue
            print(f"{it['nome'][:34]:34s} {it['rho_sem_controle']:+7.3f} {it['d']:+8.3f} "
                  f"{it['q']:8.4f} {it['pontos_por_50pct']:+10.2f} "
                  f"{(eur(it['euro_equivalente']) if it['euro_equivalente'] else '—'):>10s} "
                  f"{(str(it['porta_parcial']) if it['porta_parcial'] is not None else '—'):>8s}"
                  f"  {it['selo']}")

    resumo = {
        "gerado_em": GERADO_EM, "unidade": "clube-temporada",
        "n": {"total": len(base), "clubes": len({l["clube"] for l in base}),
              "sem_fronteira": sum(1 for l in base if not l["fronteira"])},
        "lista_herdada_de": {"parte": "A14", "candidatos": cand, "fora": sorted(fora),
                             "usados": sorted(ids)},
        "conferencia_da_parcial": {"contra": "_porta_temporal.parcial (a §6.4)",
                                   "maior_diferenca": pior, "identica": bool(ok)},
        "preco_do_elenco": {"degrau_25_75_por_ano_eur": {a: round(v) for a, v in degraus.items()},
                            "degrau_mediano_eur": round(degrau),
                            "o_que_e": "quanto custa, em elenco, subir do quarto de baixo para o "
                                       "quarto de cima da liga naquele ano"},
        "poder_por_desenho": {"d_minimo_80_80x80": d_minimo(len(base), len(base))},
        "porta_com_dinheiro": {
            "definicao": "traço nas 19 primeiras rodadas × PONTOS das 19 últimas, com parcial dada "
                         "à pontuação do 1º turno E ao dinheiro",
            "por_que_um_controle_a_mais": "sem o dinheiro ali, a porta não distingue 'este traço "
                                          "vem antes' de 'quem tem este traço é rico'",
            "parcial": T[("com", "PV", "dist_remate")]["porta_parcial"],
            "p_parcial": T[("com", "PV", "dist_remate")]["porta_p"],
            "passa": T[("com", "PV", "dist_remate")]["porta_passa"],
            "quantos_passam_com_dinheiro": sum(1 for t in ids if T[("com", "PV", t)]["porta_passa"]),
            "quantos_passam_sem_dinheiro": sum(1 for t in ids
                                               if T[("com", "PV", t)]["porta_passa_sem_dinheiro"]),
            "por_traco": {t: {"parcial": T[("com", "PV", t)]["porta_parcial"],
                              "sem_dinheiro": T[("com", "PV", t)]["porta_sem_dinheiro"],
                              "p": T[("com", "PV", t)]["porta_p"],
                              "passa": T[("com", "PV", t)]["porta_passa"]} for t in ids},
        },
    }
    json.dump(resumo, open(os.path.join(R, "A16_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # ------------------------------------------------------------------------------------------
    # O SALTO NA UNIDADE DO JOGO. A régua da parte é o posto, e "subir 50 postos" não diz a
    # ninguém o que o time tem de FAZER. Aqui o mesmo salto sai em metro, em gol esperado e em
    # por cento: o valor bruto no quartil pior e no quartil melhor, mediana das quatro
    # temporadas. É o que transforma "gastar em modelo de jogo" em instrução.
    quartis = {}
    for t in ids:
        piores, melhores = [], []
        for ano in sorted(ANOS):
            vs = sorted(((l[t] * sinal[t]), l[t]) for l in base
                        if l["temporada"] == ano and l.get(t) is not None)
            if len(vs) < 8:
                continue
            piores.append(vs[len(vs) // 4][1])          # quartil de baixo na escala alinhada
            melhores.append(vs[(3 * len(vs)) // 4][1])  # quartil de cima
        if piores:
            quartis[t] = {"pior": round(float(np.median(piores)), 3),
                          "melhor": round(float(np.median(melhores)), 3),
                          "o_que_e": "valor bruto no quartil pior e no quartil melhor da liga, "
                                     "mediana das quatro temporadas"}
    resumo["salto_na_unidade_do_jogo"] = quartis
    json.dump(resumo, open(os.path.join(R, "A16_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    numeros = {
        "n": len(base), "n_clubes": len({l["clube"] for l in base}),
        "n_sem": resumo["n"]["sem_fronteira"], "n_tracos": len(ids), "n_familias": len(dec["familias"]),
        "degrau_eur": eur(degrau),
        "porta_passam": resumo["porta_com_dinheiro"]["quantos_passam_com_dinheiro"],
        "porta_passam_sem": resumo["porta_com_dinheiro"]["quantos_passam_sem_dinheiro"],
        "pts_dinheiro": br(T[("com", "PV", "dist_remate")]["pontos_do_dinheiro_por_50pct"], 1),
        "dmin": br(resumo["poder_por_desenho"]["d_minimo_80_80x80"], 2),
    }
    for t in ids:
        for cid in ("PV", "PR"):
            for rot in ("com", "sem"):
                it = T[(rot, cid, t)]
                p = f"{t}_{cid.lower()}_{rot}"
                numeros[f"parcial_{p}"] = br_sinal(it["d"], 3)
                numeros[f"q_{p}"] = br(it["q"], 4)
                numeros[f"rho_{p}"] = br_sinal(it["rho_sem_controle"], 3)
                numeros[f"pts_{p}"] = br_sinal(it["pontos_por_50pct"], 1)
                numeros[f"ptsabs_{p}"] = br(abs(it["pontos_por_50pct"]), 1)
                numeros[f"selo_{p}"] = it["selo"]
                numeros[f"ptsdin_{p}"] = br(it["pontos_do_dinheiro_por_50pct"], 1)
                # os marcadores de GRÁFICO vão como número: pt-BR é decisão de tela, e texto
                # com vírgula decimal chega ao desenho como zero (o bug achado no A15 em 21/09)
                if cid == "PV":
                    numeros[f"graf_pts_{t}_{rot}"] = round(it["pontos_por_50pct"], 2)
                    if it["porta_parcial"] is not None:
                        numeros[f"graf_porta_{t}_{rot}"] = it["porta_parcial"]
                        numeros[f"graf_porta64_{t}_{rot}"] = it["porta_sem_dinheiro"]
                if it["euro_equivalente"]:
                    numeros[f"eur_{p}"] = eur(it["euro_equivalente"])
        it = T[("com", "PV", t)]
        numeros[f"porta_{t}"] = ("—" if it["porta_parcial"] is None
                                 else br_sinal(it["porta_parcial"], 3))
        numeros[f"portap_{t}"] = ("—" if it["porta_p"] is None else br(it["porta_p"], 4))
        numeros[f"porta64_{t}"] = ("—" if it["porta_sem_dinheiro"] is None
                                   else br_sinal(it["porta_sem_dinheiro"], 3))
        numeros[f"porta64p_{t}"] = ("—" if it["porta_p_sem_dinheiro"] is None
                                    else br(it["porta_p_sem_dinheiro"], 4))
        numeros[f"graf_pts_{t}"] = round(it["pontos_por_50pct"], 2)
        if t in quartis:
            casas = 2 if abs(quartis[t]["melhor"]) < 10 else 1
            numeros[f"pior_{t}"] = br(quartis[t]["pior"], casas)
            numeros[f"melhor_{t}"] = br(quartis[t]["melhor"], casas)
        if it["porta_parcial"] is not None:
            numeros[f"graf_porta_{t}"] = it["porta_parcial"]
            numeros[f"graf_porta64_{t}"] = it["porta_sem_dinheiro"]
        numeros[f"graf_ptsdin_{t}"] = round(it["pontos_do_dinheiro_por_50pct"], 2)
    json.dump({"gerado_por": "scripts/A16.py", "gerado_em": GERADO_EM,
               "numeros": dict(sorted(numeros.items()))},
              open(os.path.join(R, "A16_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n{len(numeros)} marcadores em A16_numeros.json")


if __name__ == "__main__":
    main()
