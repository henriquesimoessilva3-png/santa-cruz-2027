#!/usr/bin/env python3
"""A04 — bola parada: quanto da produção vem dela, e isso separa quem sobe?

Lista: `resultados/A04_indicadores.json`, fechada antes de rodar. Método: `scripts/_metodo.py`,
com a regra da fronteira CORRIGIDA — firme = firme nos dois cortes (`_metodo_fronteira.md`).

## O gol de bola parada existe, ao contrário do que o CLAUDE.md supunha

O md dizia que o Wyscout não marca a origem do gol e que só daria para usar gol de bola parada "se
a base do estudo de bola parada cobrir a Série B". **Ela cobre**: `dados/bola_parada.json` tem Série
B de 2022 a 2026 com os gols separados em escanteio, falta direta, falta indireta, lateral e pênalti,
pró e contra. Agregado por clube-temporada dá 80 linhas de 38 jogos no recorte.

## Gol é placar

Os cinco indicadores de gol de bola parada são pedaço do placar, no mesmo espírito da lista branca
da §6. Entram como **mostrar e desqualificar**: respondem a pergunta descritiva do A04 ("quanto da
produção vem de bola parada"), mas nenhuma conclusão sobre característica se apoia neles. Quem pode
sustentar característica é o processo (escanteios, finalizações de bola parada, cruzamentos) e a
régua G.

Uso:
    python3 _fonte/estudo_serieb/scripts/A04.py
"""
import collections
import csv
import json
import os
import re
import sys
import unicodedata

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import comparar, d_minimo, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
RNG = np.random.default_rng(20260917)
ANOS = {"2022", "2023", "2024", "2025"}
TIPOS = ("esc", "fd", "fi", "lat")
# Constante, e não a data de hoje: o script é reprodutível, e data dinâmica faria a saída mudar
# sem que o dado tivesse mudado.
GERADO_EM = "2026-09-20"

# Casas decimais com que cada marcador aparece na tela do A04. Marcador que não está aqui é
# publicado como número cru — o inteiro da contagem ou o valor de 3 casas do quadro_por_faixa.
CASAS_DO_MARCADOR = {
    "c_aer": 1, "c_aer_m": 1, "c_aer_com": 1, "c_aer_m_com": 1, "c_aer_dif": 1,
    "saldo_sobe_38": 1, "pct_min": 1, "pct_q1": 1, "pct_q3": 1, "pct_max": 1,
    "cai_cantos": 1, "meio_cantos": 1,
    "dmin_sm_com": 2, "dmin_sm_sem": 2,
    "c_pro_com": 2, "c_pro_m_com": 2, "c_sof_com": 2, "c_sof_m_com": 2, "c_sal_com": 2,
    "c_sal_m_com": 0,
}


def norm(t):
    t = unicodedata.normalize("NFD", str(t or ""))
    t = "".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]", "", t)


def ponte(anos_bp, anos_wy):
    """Sofascore -> Wyscout, decidido pelas TEMPORADAS, não pelo nome.

    Pelo nome sozinho, "Grêmio Novorizontino" casa com Grêmio e com Novorizontino, e "Athletico"
    casa com Athletic e com Athletico-PR — os dois pares existiram na Série B no recorte. Os anos
    desempatam: dois clubes só são o mesmo se jogaram as mesmas temporadas. É a mesma regra do T01.
    """
    p, duvidas = {}, []
    for b, ab in anos_bp.items():
        cands = []
        for w, aw in anos_wy.items():
            # Quatro jeitos de um nome parecer com o outro. Nenhum decide sozinho: os ANOS decidem.
            if not (norm(w) in norm(b) or norm(b) in norm(w)          # Vila Nova FC / Vila Nova
                    or _iniciais(w) == _iniciais(b)                    # CRB / Clube De Regatas Brasil
                    or norm(w) == norm(b)
                    or _primeira(w) == _primeira(b)):                  # América-MG / América Mineiro
                continue
            jac = len(ab & aw) / max(1, len(ab | aw))
            cands.append((round(jac, 3), 1 if norm(w) == norm(b) else 0, w))
        cands.sort(reverse=True)
        if not cands or cands[0][0] < 0.5:
            duvidas.append((b, sorted(ab), cands[:3]))
            continue
        if len(cands) > 1 and cands[0][0] - cands[1][0] < 0.15:
            duvidas.append((b, sorted(ab), cands[:3]))
            continue
        p[b] = cands[0][2]
    return p, duvidas


def _primeira(nome):
    """A primeira palavra com 3+ letras. Casa "América-MG" com "América Mineiro"."""
    ps = [x for x in re.split(r"[^A-Za-zÀ-ÿ]+", str(nome)) if len(x) >= 3]
    return norm(ps[0]) if ps else norm(nome)


def _iniciais(nome):
    """CRB <-> Clube De Regatas Brasil: as iniciais das palavras com 3+ letras."""
    ps = [x for x in re.split(r"[^A-Za-zÀ-ÿ]+", str(nome)) if len(x) >= 3]
    return "".join(norm(x)[0] for x in ps) if len(ps) > 1 else norm(nome)


def br(v, casas):
    """O número como a tela escreve: vírgula decimal, casas fixas, sem “-0”."""
    t = f"{float(v):.{casas}f}"
    if t.startswith("-") and float(t) == 0:
        t = t[1:]
    return t.replace(".", ",")


def numeros_da_aba(base, res, quadro, inds, placar):
    """Marcador -> valor, com TODO número que a aba do A04 publica.

    Etapa 6 do PLANO.md, regras 1 e 9 do portão: nenhum número da tela pode ser digitado à mão, e
    o script que a parte declara em `gerado_por` tem de ser o que os produz. Isto NÃO é análise
    nova: são as mesmas contas que já alimentavam o `A04_resumo.json` e o `A04_testes.csv`, agora
    escritas com o nome do marcador ao lado, mais doze que até aqui só existiam digitados — os
    totais de gol por tipo, os quartis da fatia, a diferença do duelo aéreo, as duas leituras
    "numa temporada de 38 jogos" e a contagem dos indicadores de trabalho.

    A receita de cada um dos doze está em `resultados/A04_numeros_novos.json`, campo `de_onde`.
    """
    def linha(corte, comparacao, indicador):
        for it in res:
            if (it["fronteira"] == corte and it["comparacao"] == comparacao
                    and it["indicador"] == indicador):
                return it
        raise SystemExit(f"A04: {corte}/{comparacao}/{indicador} não saiu dos testes — sem essa "
                         "linha um marcador publicado ficaria sem conta, e isso é reprovação")

    conta = lambda f: sum(1 for l in base if f(l))
    sobe = lambda l: l["faixa"] == "Sobe"
    meio = lambda l: l["faixa"] == "Meio"
    cai = lambda l: l["faixa"] == "Cai"
    colados_fora = lambda f: (lambda l: f(l) and not l["fronteira"])
    mediana = lambda f, c: float(np.median([l[c] for l in base if f(l)]))
    pcts = [l["bp_pro_pct"] for l in base]

    def cm(indicador, corte="com"):
        """As duas medianas de Cai × Meio, CRUAS, e conferidas contra a linha dos testes.

        Por que cruas e não a coluna `cru_a` do CSV: ela já vem arredondada a 3 casas, e
        arredondar de novo para a tela arredonda duas vezes — 0,3552632 vira 0,355 e depois 0,35,
        quando o número é 0,36. É a mesma mediana, só sem a parada no meio do caminho; a conferência
        abaixo garante que é a mesma, e para se não for.
        """
        f_a, f_b = (cai, meio) if corte == "com" else (colados_fora(cai), colados_fora(meio))
        a, b = mediana(f_a, indicador), mediana(f_b, indicador)
        it = linha(corte, "CM", indicador)
        if (round(a, 3), round(b, 3)) != (it["cru_a"], it["cru_b"]):
            raise SystemExit(f"A04: a mediana crua de {indicador} ({corte}) não bate com a linha "
                             f"dos testes ({a}, {b} contra {it['cru_a']}, {it['cru_b']})")
        return a, b

    aer_a, aer_b = cm("duelos_aereos_pct")
    pro_a, pro_b = cm("bp_pro_90")
    sof_a, sof_b = cm("bp_sof_90")
    sal_a, sal_b = cm("bp_saldo_90")
    can_a, can_b = cm("cantos")
    aer_sf_a, aer_sf_b = cm("duelos_aereos_pct", "sem")

    crus = {
        # quanto da produção vem de bola parada, por faixa (o mesmo quadro_por_faixa)
        "n_total": len(base),
        "liga_pct": quadro["Liga"]["bp_pro_pct"],
        "liga_bp90": quadro["Liga"]["bp_pro_90"],
        "sobe_pct": quadro["Sobe"]["bp_pro_pct"],
        "meio_pct": quadro["Meio"]["bp_pro_pct"],
        "trave_pct": quadro["Trave"]["bp_pro_pct"],
        "cai_pct": quadro["Cai"]["bp_pro_pct"],
        # tamanho de cada grupo, nos dois cortes de fronteira
        "n_sobe_com": conta(sobe), "n_meio_com": conta(meio), "n_cai_com": conta(cai),
        "n_trave": conta(lambda l: l["trave"]),
        "n_sobe_sf": conta(colados_fora(sobe)), "n_meio_sf": conta(colados_fora(meio)),
        "n_cai_sf": conta(colados_fora(cai)),
        # o que o desenho enxergaria em Sobe × Meio (igual nas 13 linhas de cada corte)
        "dmin_sm_com": linha("com", "SM", "bp_pro_90")["d_minimo_80"],
        "dmin_sm_sem": linha("sem", "SM", "bp_pro_90")["d_minimo_80"],
        # indicadores de TRABALHO: os 13 menos os 5 que a lista branca declara placar redescrito
        "n_ind_carac": sum(1 for i in inds if i["id"] not in placar),
        # a fatia dos gols que vem de bola parada, entre os 80 clube-temporadas
        "pct_min": min(pcts), "pct_max": max(pcts),
        "pct_q1": float(np.percentile(pcts, 25)), "pct_q3": float(np.percentile(pcts, 75)),
        # o mesmo por-jogo lido numa temporada inteira de 38 jogos
        "liga_bp_38": int(round(mediana(lambda l: True, "bp_pro_90") * 38)),
        "saldo_sobe_38": mediana(sobe, "bp_saldo_90") * 38,
        # totais de gol por tipo no recorte inteiro (lateral fecha a soma e não vai à tela)
        "tot_esc": sum(l["esc_pro"] for l in base),
        "tot_falta": sum(l["falta_pro"] for l in base),
        "tot_pen": sum(l["pen_pro"] for l in base),
        "tot_bp": sum(l["bp_pro"] for l in base),
        # Cai × Meio no corte COM fronteira, que é o n que o A04-3 declara
        "c_aer_com": aer_a, "c_aer_m_com": aer_b, "c_aer_dif": aer_b - aer_a,
        "c_pro_com": pro_a, "c_pro_m_com": pro_b,
        "c_sof_com": sof_a, "c_sof_m_com": sof_b,
        "c_sal_com": sal_a, "c_sal_m_com": sal_b,
        "cai_cantos": can_a, "meio_cantos": can_b,
        # e o mesmo duelo aéreo no corte SEM os colados na linha
        "c_aer": aer_sf_a, "c_aer_m": aer_sf_b,
    }
    return {m: (br(v, CASAS_DO_MARCADOR[m]) if m in CASAS_DO_MARCADOR else v)
            for m, v in crus.items()}


def main():
    dec = json.load(open(os.path.join(R, "A04_indicadores.json"), encoding="utf-8"))
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]
    sinal = {i["id"]: i["sinal"] for i in inds}
    nome = {i["id"]: i["nome"] for i in inds}
    placar = set(dec["lista_branca"]["afetados"])

    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            tec[(r["ano"], r["clube"])] = r

    bp = json.load(open(os.path.join(DADOS, "bola_parada.json"), encoding="utf-8"))
    trab = [x for x in bp["trabalhos"] if x["comp"].startswith("Série B")]
    anos_bp = collections.defaultdict(set)
    for x in trab:
        anos_bp[x["time"]].add(x["comp"].split()[-1])
    anos_wy = collections.defaultdict(set)
    for (ano, clube) in a01:
        anos_wy[clube].add(ano)
    p, duvidas = ponte(dict(anos_bp), dict(anos_wy))
    json.dump(p, open(os.path.join(R, "A04_ponte_clubes.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"ponte de clube: {len(p)} de {len({x['time'] for x in trab})}")
    if duvidas:
        print("  SEM par claro (ficam de fora):", duvidas)

    ag = collections.defaultdict(collections.Counter)
    for x in trab:
        ano = x["comp"].split()[-1]
        wy = p.get(x["time"])
        if ano not in ANOS or not wy:
            continue
        k = (ano, wy)
        ag[k]["jogos"] += x["jogos"]; ag[k]["gp"] += x["gp"]; ag[k]["gc"] += x["gc"]
        for t in TIPOS:
            ag[k]["pro_" + t] += x["pro"][t]; ag[k]["sof_" + t] += x["sof"][t]
        ag[k]["pen_pro"] += x.get("pen") or 0
        ag[k]["pen_sof"] += x.get("pen_sof") or 0

    base = []
    for k, c in ag.items():
        a = a01.get(k); t = tec.get(k)
        if not a or not t or c["jogos"] < 30:
            continue
        def num(col):
            v = t.get(col)
            return float(v) if v not in (None, "", "nan") else None
        pro = sum(c["pro_" + x] for x in TIPOS) + c["pen_pro"]
        sof = sum(c["sof_" + x] for x in TIPOS) + c["pen_sof"]
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"],
             "trave": a["trave"] == "1", "fronteira": a["fronteira"] == "1",
             "jogos": c["jogos"], "gp": c["gp"], "gc": c["gc"],
             "bp_pro": pro, "bp_sof": sof,
             "pen_pro": c["pen_pro"], "pen_sof": c["pen_sof"],
             "esc_pro": c["pro_esc"], "esc_sof": c["sof_esc"],
             "falta_pro": c["pro_fd"] + c["pro_fi"], "falta_sof": c["sof_fd"] + c["sof_fi"],
             "bp_pro_90": pro / c["jogos"], "bp_sof_90": sof / c["jogos"],
             "bp_pro_pct": 100 * pro / c["gp"] if c["gp"] else None,
             "bp_sof_pct": 100 * sof / c["gc"] if c["gc"] else None,
             "bp_saldo_90": (pro - sof) / c["jogos"]}
        for col in ("bolas_paradas", "cantos", "cantos_remates", "livres_remates", "bp_conv",
                    "duelos_aereos_pct", "cruzamentos", "tm_altura"):
            l[col] = num(col)
        if any(l[i["id"]] is None for i in inds):
            continue
        base.append(l)
    print(f"base: {len(base)} clube-temporadas · {len({l['clube'] for l in base})} clubes")

    percentil_no_ano(base, [i["id"] for i in inds])
    familias = [(f["id"], [i["id"] for i in f["indicadores"]]) for f in dec["familias"]]
    comparacoes = [("SM", lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
                   ("ST", lambda l: l["faixa"] == "Sobe", lambda l: l["trave"]),
                   ("CM", lambda l: l["faixa"] == "Cai", lambda l: l["faixa"] == "Meio")]
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    res = comparar(base, familias, comparacoes, filtros, RNG, lambda i: sinal[i])
    for it in res:
        it["nome"] = nome[it["indicador"]]
        it["placar_redescrito"] = it["indicador"] in placar

    with open(os.path.join(R, "A04_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(res[0]))
        w.writeheader(); w.writerows(res)

    # firme nos DOIS cortes
    por = collections.defaultdict(dict)
    for r in res:
        por[(r["comparacao"], r["indicador"])][r["fronteira"]] = r
    dois = {cp: [i for (c, i), v in por.items() if c == cp
                 and v.get("com", {}).get("selo") == "firme"
                 and v.get("sem", {}).get("selo") == "firme"] for cp in ("SM", "ST", "CM")}

    def med(f, c):
        return round(float(np.median([l[c] for l in base if f(l)])), 3)
    faixas = {"Sobe": lambda l: l["faixa"] == "Sobe", "Trave": lambda l: l["trave"],
              "Meio": lambda l: l["faixa"] == "Meio", "Cai": lambda l: l["faixa"] == "Cai",
              "Liga": lambda l: True}
    quadro = {n: {c: med(f, c) for c in ("bp_pro_90", "bp_sof_90", "bp_pro_pct", "bp_sof_pct",
                                         "bp_saldo_90", "esc_pro", "falta_pro", "pen_pro",
                                         "cantos", "bp_conv", "duelos_aereos_pct", "tm_altura")}
              for n, f in faixas.items()}
    json.dump({"quadro_por_faixa": quadro, "firme_nos_dois_cortes": dois,
               "liga": {"bp_pro_pct_mediano": quadro["Liga"]["bp_pro_pct"],
                        "gols_bp_por_jogo": quadro["Liga"]["bp_pro_90"]},
               "n": {"total": len(base),
                     "sobe_sf": sum(1 for l in base if l["faixa"] == "Sobe" and not l["fronteira"]),
                     "meio_sf": sum(1 for l in base if l["faixa"] == "Meio" and not l["fronteira"])}},
              open(os.path.join(R, "A04_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*92}\nQUANTO DA PRODUÇÃO VEM DE BOLA PARADA (medianas)\n{'='*92}")
    print(f"{'faixa':6s} {'bp pró/j':>9s} {'bp sofr/j':>10s} {'% gols pró':>11s} {'% gols sofr':>12s} "
          f"{'saldo/j':>8s} {'esc pró':>8s} {'falta pró':>10s} {'pên pró':>8s}")
    for fx in ("Sobe", "Trave", "Meio", "Cai", "Liga"):
        q = quadro[fx]
        print(f"{fx:6s} {q['bp_pro_90']:9.3f} {q['bp_sof_90']:10.3f} {q['bp_pro_pct']:11.1f} "
              f"{q['bp_sof_pct']:12.1f} {q['bp_saldo_90']:8.3f} {q['esc_pro']:8.1f} "
              f"{q['falta_pro']:10.1f} {q['pen_pro']:8.1f}")

    print(f"\n{'='*92}\nFIRME NOS DOIS CORTES DE FRONTEIRA\n{'='*92}")
    for cp in ("SM", "ST", "CM"):
        marca = lambda i: i + (" ⚑placar" if i in placar else "")
        print(f"  {cp}: {[marca(i) for i in dois[cp]] or 'nenhum'}")

    print(f"\n{'='*92}\nDETALHE (sem fronteira)\n{'='*92}")
    print(f"{'fam':10s} {'indicador':20s} {'cmp':3s} {'A':>8s} {'B':>8s} {'d':>6s} {'q':>8s}  selo")
    for it in res:
        if it["fronteira"] != "sem":
            continue
        m = " ⚑" if it["placar_redescrito"] else ""
        print(f"{it['familia']:10s} {it['indicador'][:20]:20s} {it['comparacao']:3s} "
              f"{it['cru_a']:8.2f} {it['cru_b']:8.2f} {it['d']:+6.2f} {it['q']:8.4f}  {it['selo']}{m}")

    # Os números da tela, gravados por quem os calcula (etapa 6, regras 1 e 9 do portão).
    numeros = numeros_da_aba(base, res, quadro, inds, placar)
    json.dump({"gerado_por": "scripts/A04.py", "gerado_em": GERADO_EM, "numeros": numeros},
              open(os.path.join(R, "A04_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n{'='*92}\nNÚMEROS DA ABA\n{'='*92}")
    print(f"  {len(numeros)} marcadores → A04_numeros.json")


if __name__ == "__main__":
    main()
