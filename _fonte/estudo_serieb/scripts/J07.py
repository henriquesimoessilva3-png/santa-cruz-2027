#!/usr/bin/env python3
"""J07 — os estrangeiros na Série B: quantos, de onde, quanto jogaram e como renderam.

**Descritivo por decisão do CLAUDE.md**: "Resultados de estrangeiros na própria B são descritivos:
liste os casos, sem aplicar o critério de conclusão." Aqui não há teste de hipótese nem BH.

## Quem é estrangeiro

Nacionalidade de `serieb_elencos.csv`. O campo traz a lista separada por " / " e a primeira é a
principal. **Quem tem "Brasil" em qualquer posição da lista conta como brasileiro** — são 166 casos
de "Brasil / Itália", 43 de "Brasil / Portugal" e outros: cidadania europeia de descendente, que não
ocupa vaga de estrangeiro. O ⚑ da tela marca naturalizados; aqui a dupla nacionalidade com Brasil é
tratada como brasileira e o número sai à parte.

## A liga de origem

`clube_anterior` dá o clube, não a liga. Sem uma tabela de clube → liga, a origem sai por
NACIONALIDADE, que é uma aproximação: um argentino pode vir de um clube brasileiro. Está marcado.

## O que o script grava

`resultados/J07_resumo.json` — a análise descritiva acima, no cruzamento de nome exato, **inalterada**.
`resultados/J07_numeros.json` — os 39 marcadores que J07.json publica, no cruzamento de identidade
refeito em 19/09. Os dois discordam de propósito; o bloco no fim do arquivo explica por quê.

Uso:
    python3 _fonte/estudo_serieb/scripts/J07.py
"""
import collections
import csv
import json
import os
import re
import statistics as st
import unicodedata

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
ANOS = ["2022", "2023", "2024", "2025", "2026"]
FECHADAS = {"2022", "2023", "2024", "2025"}


def norm(t):
    t = unicodedata.normalize("NFD", str(t or ""))
    t = "".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9 ]", " ", t).strip()


def main():
    ponte = json.load(open(os.path.join(R, "T01_ponte_clubes.json"), encoding="utf-8"))
    faixa = {(r["temporada"], r["clube"]): r["faixa"]
             for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                          encoding="utf-8"))}
    # nacionalidade por (nome, ano, clube wyscout)
    nac, dupla = {}, {}
    with open(os.path.join(DADOS, "serieb_elencos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            wy = ponte.get(r["clube"], r["clube"])
            lista = [x.strip() for x in (r["nacionalidades"] or "").split("/") if x.strip()]
            if not lista:
                continue
            k = (norm(r["jogador"]), r["ano"], wy)
            nac[k] = lista
            dupla[k] = len(lista) > 1 and "Brasil" in lista
    # minutos, do J01
    linhas = []
    for r in csv.DictReader(open(os.path.join(R, "base_jogador_temporada.csv"), encoding="utf-8")):
        k = (norm(r["jogador"]), r["ano"], r["time"])
        ls = nac.get(k)
        try:
            mi = float(r["minutos"]); fat = float(r["fatia_pct"])
        except (TypeError, ValueError):
            continue
        linhas.append({"ano": r["ano"], "jogador": r["jogador"], "time": r["time"],
                       "grupo": r["grupo"], "idade": r["idade"], "minutos": mi, "fatia_pct": fat,
                       "faixa": faixa.get((r["ano"], r["time"])),
                       "nacionalidades": " / ".join(ls) if ls else None,
                       "estrangeiro": (None if not ls else int("Brasil" not in ls)),
                       "dupla_com_brasil": int(bool(dupla.get(k)))})
    com = [l for l in linhas if l["estrangeiro"] is not None]
    print(f"jogador-temporadas: {len(linhas)} · com nacionalidade: {len(com)} "
          f"({100*len(com)/len(linhas):.0f}%)")

    # ---- quantos, por temporada e por faixa ----
    por_ano = {}
    for ano in ANOS:
        g = [l for l in com if l["ano"] == ano]
        if not g:
            continue
        est = [l for l in g if l["estrangeiro"]]
        tot_min = sum(l["minutos"] for l in g)
        por_ano[ano] = {
            "jogadores": len(g), "estrangeiros": len(est),
            "pct_dos_jogadores": round(100 * len(est) / len(g), 1),
            "pct_dos_minutos": round(100 * sum(l["minutos"] for l in est) / tot_min, 1),
            "clubes_com_algum": len({l["time"] for l in est}),
            "dupla_com_brasil": sum(1 for l in g if l["dupla_com_brasil"]),
        }
    por_faixa = {}
    for fx in ("Sobe", "Trave", "Meio", "Cai"):
        g = [l for l in com if l["faixa"] == fx and l["ano"] in FECHADAS]
        if not g:
            continue
        est = [l for l in g if l["estrangeiro"]]
        por_faixa[fx] = {
            "jogadores": len(g), "estrangeiros": len(est),
            "pct_dos_minutos": round(100 * sum(l["minutos"] for l in est) /
                                     sum(l["minutos"] for l in g), 1),
            "estrangeiros_por_clube_temporada": round(
                len(est) / len({(l["ano"], l["time"]) for l in g}), 1)}

    # ---- de onde vêm ----
    origem = collections.Counter()
    for l in com:
        if l["estrangeiro"]:
            origem[l["nacionalidades"].split(" / ")[0]] += 1

    # ---- quanto jogaram, contra os brasileiros da mesma posição ----
    rend = {}
    for g in sorted({l["grupo"] for l in com if l["grupo"]}):
        e = [l["fatia_pct"] for l in com if l["grupo"] == g and l["estrangeiro"]]
        b = [l["fatia_pct"] for l in com if l["grupo"] == g and not l["estrangeiro"]]
        if len(e) >= 5:
            rend[g] = {"n_estrangeiros": len(e), "n_brasileiros": len(b),
                       "fatia_mediana_estrangeiro": round(st.median(e), 1),
                       "fatia_mediana_brasileiro": round(st.median(b), 1),
                       "pct_estrangeiros_com_fatia_alta": round(
                           100 * sum(1 for x in e if x >= 60) / len(e), 1),
                       "pct_brasileiros_com_fatia_alta": round(
                           100 * sum(1 for x in b if x >= 60) / len(b), 1)}

    # ---- permanência na temporada seguinte ----
    chaves = {(norm(l["jogador"]), l["ano"], l["time"]) for l in com}
    nomes_ano = collections.defaultdict(set)
    for l in com:
        nomes_ano[l["ano"]].add(norm(l["jogador"]))
    perm = {}
    for grupo, filtro in (("estrangeiro", lambda l: l["estrangeiro"]),
                          ("brasileiro", lambda l: not l["estrangeiro"])):
        fica = tot = 0
        for l in com:
            if l["ano"] == "2026" or not filtro(l):
                continue
            seg = str(int(l["ano"]) + 1)
            if seg not in nomes_ano:
                continue
            tot += 1
            fica += 1 if norm(l["jogador"]) in nomes_ano[seg] else 0
        perm[grupo] = {"n": tot, "ficou_na_serie_b_no_ano_seguinte_pct": round(100 * fica / tot, 1)}

    # primeira temporada na Série B
    primeira = {}
    vistos = collections.defaultdict(list)
    for l in sorted(com, key=lambda x: x["ano"]):
        vistos[norm(l["jogador"])].append(l)
    for grupo, filtro in (("estrangeiro", lambda l: l["estrangeiro"]),
                          ("brasileiro", lambda l: not l["estrangeiro"])):
        f = [v[0]["fatia_pct"] for v in vistos.values() if filtro(v[0])]
        primeira[grupo] = {"n": len(f), "fatia_mediana_na_primeira": round(st.median(f), 1)}

    json.dump({"por_temporada": por_ano, "por_faixa_do_time": por_faixa,
               "origem_por_nacionalidade": dict(origem.most_common()),
               "rendimento_por_posicao": rend, "permanencia": perm,
               "primeira_temporada": primeira,
               "cobertura": {"com_nacionalidade": len(com), "total": len(linhas),
                             "pct": round(100 * len(com) / len(linhas), 1)},
               "nota": "Descritivo por decisão do CLAUDE.md: sem teste de hipótese. Quem tem Brasil "
                       "na lista de nacionalidades conta como brasileiro."},
              open(os.path.join(R, "J07_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*84}\nESTRANGEIROS POR TEMPORADA\n{'='*84}")
    print(f"{'ano':6s} {'jogadores':>10s} {'estrang.':>9s} {'% dos jog.':>11s} {'% dos min.':>11s} "
          f"{'clubes':>7s} {'dupla c/ BR':>12s}")
    for ano, d in por_ano.items():
        print(f"{ano:6s} {d['jogadores']:10d} {d['estrangeiros']:9d} {d['pct_dos_jogadores']:10.1f}% "
              f"{d['pct_dos_minutos']:10.1f}% {d['clubes_com_algum']:7d} {d['dupla_com_brasil']:12d}")
    print(f"\n{'='*84}\nPOR FAIXA DO TIME (2022-2025)\n{'='*84}")
    for fx, d in por_faixa.items():
        print(f"  {fx:6s} {d['estrangeiros']:3d} estrangeiros · {d['estrangeiros_por_clube_temporada']:4.1f} "
              f"por clube-temporada · {d['pct_dos_minutos']:5.1f}% dos minutos")
    print(f"\n{'='*84}\nDE ONDE VÊM\n{'='*84}")
    for k, v in list(origem.most_common(12)):
        print(f"  {v:4d}  {k}")
    print(f"\n{'='*84}\nQUANTO JOGARAM, CONTRA OS BRASILEIROS DA MESMA POSIÇÃO\n{'='*84}")
    print(f"{'posição':12s} {'n est.':>7s} {'fatia est.':>11s} {'fatia bras.':>12s} "
          f"{'% est. alta':>12s} {'% bras. alta':>13s}")
    for g, d in rend.items():
        print(f"{g:12s} {d['n_estrangeiros']:7d} {d['fatia_mediana_estrangeiro']:10.1f}% "
              f"{d['fatia_mediana_brasileiro']:11.1f}% {d['pct_estrangeiros_com_fatia_alta']:11.1f}% "
              f"{d['pct_brasileiros_com_fatia_alta']:12.1f}%")
    print(f"\n{'='*84}\nPERMANÊNCIA E PRIMEIRA TEMPORADA\n{'='*84}")
    for k, v in perm.items():
        print(f"  {k:12s} fica na Série B no ano seguinte: {v['ficou_na_serie_b_no_ano_seguinte_pct']}% (n={v['n']})")
    for k, v in primeira.items():
        print(f"  {k:12s} fatia mediana na PRIMEIRA temporada: {v['fatia_mediana_na_primeira']}% (n={v['n']})")


# ==================================================================================================
# OS NÚMEROS QUE A PARTE PUBLICA — acrescentado em 20/09, sem tocar na análise acima
# ==================================================================================================
# Por que existe um SEGUNDO cruzamento aqui embaixo, em vez de consertar o de cima:
#
#   O cruzamento de `main()` casa jogador por nome normalizado exato. O Wyscout abrevia o prenome
#   ("C. Palacios") e o Transfermarkt não ("Carlos Palacios"), de modo que aquele casamento perde a
#   maior parte do estrangeiro — e perde de forma ENVIESADA, porque é justamente o estrangeiro que
#   tem o nome aberto de um lado e abreviado do outro. Some-se a isso que `faixa` é procurada pelo
#   nome do time do Wyscout, e Athletico Paranaense 2025 (a clube-temporada mais estrangeira da
#   faixa Sobe) sai sem faixa: A01_clube_temporada.csv escreve "Athletico-PR".
#
#   Em 19/09 o cruzamento foi refeito e conferido por dois caminhos, e é dele que saem TODOS os
#   números publicados em J07.json. A receita está escrita em resultados/J07_numeros_novos.json
#   (campo metodo_do_cruzamento e o `de_onde` de cada marcador); o script que a rodou ficou em /tmp
#   e não foi versionado — é essa lacuna que o bloco abaixo fecha.
#
#   `main()` NÃO foi alterado: J07_resumo.json continua saindo idêntico ao de antes, inclusive nos
#   valores que este bloco contradiz. A contradição é o achado, não um bug a esconder: quem comparar
#   J07_resumo.json com J07_numeros.json está vendo o cruzamento antigo ao lado do refeito, que é o
#   que os campos `prova` de J07.json já anunciam ("cruzamento antigo, a regerar").
#
# O que o bloco NÃO alcança, e por quê:
#   A receita escrita descreve a pontuação (id +100, nome igual +60, forma abreviada +45, idade
#   +25/+5/-60, corte em 60, empate não casa) mas não o código. Reimplementada ao pé da letra, ela
#   casa 2.993 das 3.160 linhas de 2022-2025 contra as 2.996 do original — 99,9% do mesmo conjunto,
#   e ainda assim 4 linhas de estrangeiro a menos. Os marcadores que dependem da contagem de
#   estrangeiro saem por isso 1 a 4 unidades abaixo do publicado. Está registrado, não corrigido.
GERADO_EM = "2026-09-20"
SULAMERICA = {"Argentina", "Colômbia", "Uruguai", "Paraguai", "Equador",
              "Venezuela", "Bolívia", "Chile", "Peru"}
VIZINHOS = ("Argentina", "Colômbia", "Uruguai", "Paraguai")


def virgula(v, casas=1):
    return f"{v:.{casas}f}".replace(".", ",")


def subsequencia(curto, cheio):
    """A forma abreviada do Wyscout cabe no nome cheio do Transfermarkt, na ordem.

    'C. Palacios' → 'Carlos Palacios'; 'G. Risso' → 'Gabriel Risso Patron'; 'Boschilia' →
    'Gabriel Boschilia'. Inicial casa com o token que começa por ela; exige ao menos um
    sobrenome inteiro em comum, para 'J. Silva' não casar com qualquer João.
    """
    if not curto or len(curto) > len(cheio):
        return False
    i, inteiros = 0, 0
    for t in curto:
        while i < len(cheio):
            if t == cheio[i] or (len(t) == 1 and cheio[i].startswith(t)):
                inteiros += len(t) > 1
                i += 1
                break
            i += 1
        else:
            return False
    return inteiros >= 1


def pontua(linha, elenco, ano):
    """Pontuação de identidade da receita de 19/09 (J07_numeros_novos.json.metodo_do_cruzamento)."""
    p = 0
    if linha.get("id_tm") and linha["id_tm"] == elenco.get("id_jogador"):
        p += 100
    a, b = norm(linha["jogador"]), norm(elenco["jogador"])
    if a == b:
        p += 60
    elif subsequencia(a.split(), b.split()):
        p += 45
    try:
        # a coluna idade de base_jogador_temporada.csv é a idade HOJE, não a da temporada
        d = abs((int(linha["idade"]) - (2026 - int(ano))) - int(elenco["idade"]))
        p += 25 if d <= 1 else (5 if d <= 2 else -60)
    except (TypeError, ValueError):
        pass
    return p


def numeros():
    """Grava resultados/J07_numeros.json: cada marcador de J07.json com o valor que sai do dado."""
    ponte = json.load(open(os.path.join(R, "T01_ponte_clubes.json"), encoding="utf-8"))
    inverso = {v: k for k, v in ponte.items()}
    base = list(csv.DictReader(open(os.path.join(R, "base_jogador_temporada.csv"),
                                    encoding="utf-8")))
    elencos = list(csv.DictReader(open(os.path.join(DADOS, "serieb_elencos.csv"),
                                       encoding="utf-8-sig")))
    a01 = list(csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"), encoding="utf-8")))
    faixa = {(r["temporada"], r["clube"]): r["faixa"] for r in a01}
    fronteira = {(r["temporada"], r["clube"]): r["fronteira"] == "1" for r in a01}
    times = {r["time"] for r in base}

    # índice do elenco por (ano, clube como a base de jogadores o escreve); ponte nos dois sentidos
    ind = collections.defaultdict(list)
    for r in elencos:
        c = r["clube"]
        alvos = {a for a in (c, ponte.get(c, c), inverso.get(c, c)) if a in times}
        for a in (alvos or {ponte.get(c, c)}):
            ind[(r["ano"], a)].append(r)

    linhas = []
    for r in base:
        melhor, topo, empate = None, -999, False
        for e in ind.get((r["ano"], r["time"]), ()):
            p = pontua(r, e, r["ano"])
            if p > topo:
                topo, melhor, empate = p, e, False
            elif p == topo:
                empate = True
        if melhor is None or topo < 60 or empate:
            melhor = None
        nac = [x.strip() for x in (melhor["nacionalidades"] or "").split("/")
               if x.strip()] if melhor else []
        clube = ponte.get(r["time"], r["time"])          # nome como A01_clube_temporada.csv escreve
        try:
            minutos, fatia = float(r["minutos"]), float(r["fatia_pct"])
        except (TypeError, ValueError):
            minutos, fatia = 0.0, None
        linhas.append({
            "ano": r["ano"], "clube": clube, "id": r["id_tm"], "nome": norm(r["jogador"]),
            "pessoa": r["id_tm"] or norm(r["jogador"]), "minutos": minutos, "fatia": fatia,
            "faixa": faixa.get((r["ano"], clube)), "fronteira": fronteira.get((r["ano"], clube)),
            "nac": nac, "pais": nac[0] if nac else None,
            "id_elenco": melhor["id_jogador"] if melhor else None,
            "entrou_no_ano": bool(melhor) and (melhor.get("no_clube_desde") or "")[-4:] == r["ano"],
            "estrangeiro": (None if not nac else "Brasil" not in nac),
            "dupla": bool(nac) and "Brasil" in nac and len(nac) > 1})

    janela = [l for l in linhas if l["ano"] in FECHADAS]
    com = [l for l in janela if l["nac"]]
    est = [l for l in com if l["estrangeiro"]]
    bra = [l for l in com if not l["estrangeiro"]]

    def pct_min(parte, todo):
        b = sum(l["minutos"] for l in todo)
        return round(100 * sum(l["minutos"] for l in parte) / b, 1) if b else None

    n = {}
    # ---- quantos, e em quantos clubes (J07-1) ----
    n["est_lin"] = n["total_est"] = n["est_lin_mesmo_cruzamento"] = n["n_perm_est"] = len(est)
    n["est_pes"] = n["total_pes"] = len({l["id_elenco"] for l in est})
    n["n_perm_br"] = len(bra)
    n["ct_total"] = len({(r["temporada"], r["clube"]) for r in a01 if r["temporada"] in FECHADAS})
    n["ct_com_algum"] = len({(l["ano"], l["clube"]) for l in est})
    n["liga_ct"] = round(len(est) / n["ct_total"], 1)
    p9 = [p for p in json.load(open(os.path.join(DADOS, "premissas.json"), encoding="utf-8"))
          if p.get("id") == "p9"]                        # premissa do app, não medida de jogo
    n["vagas"] = int(re.search(r"\d+", p9[0]["texto"]).group())

    # ---- quanto minuto por faixa, com e sem os times de fronteira (J07-1) ----
    for fx, chave in (("Sobe", "sobe"), ("Meio", "meio"), ("Cai", "cai")):
        g = [l for l in com if l["faixa"] == fx]
        e = [l for l in est if l["faixa"] == fx]
        n[chave + "_min"] = pct_min(e, g)
        if chave != "cai":
            n[chave + "_sem"] = pct_min([l for l in e if not l["fronteira"]],
                                        [l for l in g if not l["fronteira"]])
        if fx == "Sobe":
            n["sobe_n"] = len(e)
            n["ct_sobe_com_algum"] = len({(l["ano"], l["clube"]) for l in e})

    por_ano = {}
    for ano in ANOS:
        t = [l for l in linhas if l["ano"] == ano]
        g = [l for l in t if l["nac"]]
        e = [l for l in g if l["estrangeiro"]]
        por_ano[ano] = {
            "pct_min": pct_min(e, g), "cob": round(100 * len(g) / len(t), 1) if t else None,
            "sobe": pct_min([l for l in e if l["faixa"] == "Sobe"],
                            [l for l in g if l["faixa"] == "Sobe"]),
            "meio": pct_min([l for l in e if l["faixa"] == "Meio"],
                            [l for l in g if l["faixa"] == "Meio"])}
    n["pct_min_max"] = max(por_ano[a]["pct_min"] for a in FECHADAS)
    invertidos = [a for a in FECHADAS if (por_ano[a]["meio"] or 0) > (por_ano[a]["sobe"] or 0)]
    n["ano_invertido"] = invertidos[0] if len(invertidos) == 1 else " / ".join(invertidos)

    # ---- cobertura do cruzamento (J07-3) ----
    n["cobertura_nova"] = round(100 * len(com) / len(janela), 1)
    n["cobertura_por_faixa"] = " · ".join(
        f"{fx} {virgula(100 * len([l for l in com if l['faixa'] == fx]) / len([l for l in janela if l['faixa'] == fx]))}%"
        for fx in ("Sobe", "Meio", "Cai"))
    n["cobertura_perm_por_ano"] = " · ".join(f"{a}: {virgula(por_ano[a]['cob'])}%" for a in ANOS)

    # ---- de onde vêm, por linha e por pessoa (J07-3) ----
    origem = collections.Counter(l["pais"] for l in est)
    origem_pes = collections.Counter({l["id_elenco"]: l["pais"] for l in est}.values())
    n["sulamer"] = sum(v for k, v in origem.items() if k in SULAMERICA)
    n["sulamer_pes"] = sum(v for k, v in origem_pes.items() if k in SULAMERICA)
    n["por"], n["por_pes"] = origem.get("Portugal", 0), origem_pes.get("Portugal", 0)
    n["ordem_por_linha"] = ", ".join(
        f"{p} {v}" for p, v in sorted(((p, origem.get(p, 0)) for p in VIZINHOS), key=lambda x: -x[1]))
    n["ordem_por_pessoa"] = ", ".join(
        f"{p} {v}" for p, v in sorted(((p, origem_pes.get(p, 0)) for p in VIZINHOS), key=lambda x: -x[1]))
    n["dupla_lin"] = sum(1 for l in com if l["dupla"])

    # ---- a estreia, nas duas definições de "quem chega" (J07-2) ----
    estreia = {}
    for l in linhas:
        if l["pessoa"] not in estreia or l["ano"] < estreia[l["pessoa"]]["ano"]:
            estreia[l["pessoa"]] = l
    pri = [l for l in estreia.values()
           if l["ano"] in FECHADAS and l["nac"] and l["fatia"] is not None]
    for rot, eh in (("est", True), ("br", False)):
        f = [l["fatia"] for l in pri if l["estrangeiro"] is eh]
        fnc = [l["fatia"] for l in pri if l["estrangeiro"] is eh and l["entrou_no_ano"]]
        n["pri_" + rot], n["n_pri_" + rot] = round(st.median(f), 1), len(f)
        n["pri_" + rot + "_nc"], n["n_pri_" + rot + "_nc"] = round(st.median(fnc), 1), len(fnc)

    # ---- quem segue na Série B no ano seguinte (J07-2) ----
    # o alvo é montado sobre TODAS as linhas da base, não só as que casaram nacionalidade
    ids_ano, nomes_ano = collections.defaultdict(set), collections.defaultdict(set)
    for l in linhas:
        if l["id"]:
            ids_ano[l["ano"]].add(l["id"])
        nomes_ano[l["ano"]].add(l["nome"])

    def reaparece(l):
        seg = str(int(l["ano"]) + 1)
        return bool(l["id"] and l["id"] in ids_ano[seg]) or l["nome"] in nomes_ano[seg]

    for rot, grupo in (("est", est), ("br", bra)):
        n["perm_" + rot] = round(100 * sum(1 for l in grupo if reaparece(l)) / len(grupo), 1)
    n["pct_coorte_2025"] = round(100 * sum(1 for l in est if l["ano"] == "2025") / len(est), 1)

    json.dump({"gerado_por": "scripts/J07.py", "gerado_em": GERADO_EM,
               "cruzamento": "identidade refeita em 19/09 (J07_numeros_novos.json."
                             "metodo_do_cruzamento), reimplementada aqui; main() e J07_resumo.json "
                             "seguem no cruzamento antigo, de propósito",
               "numeros": n},
              open(os.path.join(R, "J07_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n{'='*84}\nNÚMEROS PUBLICADOS (cruzamento refeito)\n{'='*84}")
    for k in sorted(n):
        print(f"  {k:28s} {n[k]}")
    return n


if __name__ == "__main__":
    main()
    numeros()
