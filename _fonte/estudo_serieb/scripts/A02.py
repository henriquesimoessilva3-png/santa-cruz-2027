#!/usr/bin/env python3
"""A02 — a distância entre Sobe e Meio (e entre Sobe e Trave) está no que o time cria ou no que cede?

Lista de indicadores: `resultados/A02_indicadores.json`, fechada ANTES de rodar (13 indicadores,
3 famílias). Recorte 2022–2025; 2026 fica fora por estar em curso.

## O método é o da casa, não um meu

Apurado em 17/09 lendo `gerar_prototipo.py` e a §6 da ESPECIFICACAO.md:

- **Teste no POSTO dentro da temporada (percentil 0–100), nunca no valor bruto.** O valor bruto vai
  só para a tela. A primeira versão deste script testou no bruto e estava errada.
- **t de Welch bilateral** (a Protipo usa Welch; o `ranking_gaps.py` usa Mann-Whitney, mas é a
  régua da outra aba — misturar as duas não reconcilia com nenhuma).
- **d de Cohen agrupado**, no mesmo percentil, com o sinal do indicador alinhado (positivo = Sobe
  melhor).
- **BH a 5% dentro de cada família × cada comparação**, nunca no bolo dos 13.
- **IC95 por bootstrap de CLUBE, não de linha.** As 80 linhas são 40 clubes (§6.6): Welch e BH
  supõem independência que o painel não tem. O bootstrap reamostra clubes.
- **Poder por desenho**, como a casa faz: o menor d detectável a 80% para cada tamanho de grupo.

## Três indicadores são "o placar redescrito"

A lista branca da §6 (ESPECIFICACAO.md:82) proíbe `gp_jogo`, `gc_jogo`, `golos_sem_penalti`,
`xg_saldo`, `finalizacao` e outros de entrarem em eixo, agrupamento ou score: "isto é o placar, não
é característica". Deles, três estão nesta lista — `gols_pro_90` (= gp_jogo), `gols_contra_90`
(= gc_jogo) e `finalizacao`. Eles entram como a especificação manda: **mostrar e desqualificar**.
Servem para medir o tamanho da diferença e para a porta temporal, nunca para sustentar que são
característica. `xg` e `xg_contra` NÃO estão na lista branca e entram normalmente.

## O xG é uma régua curta

A §6 mede a confiabilidade split-half do xG em **0,30**, e a regra é dura: "indicador com teto
< 0,40 sai da tela hachurado — o efeito nunca pode ser maior que a régua". Toda leitura de xG aqui
sai com essa marca.

## O script grava os números que a parte publica

Até 20/09 este script escrevia a tabela de testes e o resumo, e mais nada: os 76 marcadores de
`A02.json` eram copiados a olho de uma célula do CSV — 49 deles — ou digitados à mão — 27, os que
`A02_numeros_novos.json` levantou em 19/09. O `gerado_por: scripts/A02.py` era, nessa parte, uma
alegação de procedência que ninguém tinha como conferir, e é o que as regras 1 e 9 do portão
(`scripts/_portao.py`) cobram.

Agora ele grava `resultados/A02_numeros.json`: **marcador → valor**, os 76. Em duas camadas:

- os **49** que ele já calculava, que saem da mesma célula de `A02_testes.csv` e de
  `A02_resumo.json` de onde eram copiados — corte REDUZIDO (8 Sobe × 32 Meio), que é o que o texto
  publicado usa;
- os **27** que estavam digitados e passam a ser calculados aqui, seguindo o campo `de_onde` de
  `A02_numeros_novos.json`: as medianas do corte CHEIO (16 × 48), os dois split-half da §3, a porta
  da §6.4 sobre a distância do remate e o menor rho detectável.

Essa saída é a CONFERÊNCIA do que está publicado, não a substituição: nada aqui escreve em
`A02.json`. Onde os dois discordarem, quem decide é quem lê os dois.

Uso:
    python3 _fonte/estudo_serieb/scripts/A02.py
"""
import collections
import csv
import json
import math
import os
import re
import statistics as st
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
# O método da casa, para o que foi ACRESCENTADO em 20/09. A análise de 17/09 continua com as
# cópias que este arquivo já tinha — trocá-las mudaria número publicado, e não é o que se pediu.
from _metodo import pct, percentil_no_ano                      # noqa: E402
import _porta_temporal as _pt                                  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
RNG = np.random.default_rng(20260917)

CONFIABILIDADE = {"xg": 0.30}     # §6: split-half medido. < 0,40 = régua curta.
PLACAR = {"gols_pro_90", "gols_contra_90", "finalizacao"}   # lista branca da §6
NUMEROS_JSON = "A02_numeros.json"   # a saída que as regras 1 e 9 do portão conferem
GERADO_EM = "2026-09-20"            # constante: o script é reprodutível, a data não pode variar


def carregar(dec):
    anos = {str(a) for a in dec["recorte"]["temporadas"]}
    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            tec[(r["ano"], r["clube"])] = r
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]
    base = []
    for k, a in a01.items():
        if k[0] not in anos or k not in tec:
            continue
        t, J = tec[k], int(a["J"])
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"],
             "trave": a["trave"] == "1", "fronteira": a["fronteira"] == "1"}
        for i in inds:
            if i["id"] == "gols_pro_90":
                l[i["id"]] = int(a["GP"]) / J
            elif i["id"] == "gols_contra_90":
                l[i["id"]] = int(a["GC"]) / J
            else:
                v = t.get(i["id"])
                l[i["id"]] = float(v) if v not in (None, "", "nan") else None
        base.append(l)
    # POSTO DENTRO DA TEMPORADA — a normalização que o CLAUDE.md exige.
    por_ano = collections.defaultdict(list)
    for l in base:
        por_ano[l["temporada"]].append(l)
    for ls in por_ano.values():
        for i in inds:
            r = stats.rankdata([l[i["id"]] for l in ls])
            for l, rr in zip(ls, r):
                l[i["id"] + "_pct"] = 100 * (rr - 1) / (len(ls) - 1)
    return base, inds


def cohen_d(a, b):
    na, nb = len(a), len(b)
    va, vb = np.var(a, ddof=1), np.var(b, ddof=1)
    s = math.sqrt(((na - 1) * va + (nb - 1) * vb) / (na + nb - 2))
    return (np.mean(a) - np.mean(b)) / s if s else 0.0


def ic_por_clube(base, campo, grupo_a, grupo_b, sinal, reps=2000):
    """IC95 do d, reamostrando CLUBES (80 linhas são 40 clubes: §6.6)."""
    por_clube = collections.defaultdict(list)
    for l in base:
        por_clube[l["clube"]].append(l)
    clubes = list(por_clube)
    saida = []
    for _ in range(reps):
        amostra = [l for c in RNG.choice(clubes, len(clubes), replace=True) for l in por_clube[c]]
        a = [l[campo] for l in amostra if grupo_a(l)]
        b = [l[campo] for l in amostra if grupo_b(l)]
        if len(a) > 2 and len(b) > 2:
            saida.append(cohen_d(a, b) * sinal)
    return (round(float(np.percentile(saida, 2.5)), 2),
            round(float(np.percentile(saida, 97.5)), 2)) if saida else (None, None)


def d_minimo(n1, n2, alvo=0.80):
    """Menor d detectável a 80%, por desenho — como a casa faz."""
    lo, hi = 0.05, 3.0
    for _ in range(40):
        d = (lo + hi) / 2
        nc = d * math.sqrt(n1 * n2 / (n1 + n2))
        gl = n1 + n2 - 2
        crit = stats.t.ppf(0.975, gl)
        pot = 1 - stats.nct.cdf(crit, gl, nc) + stats.nct.cdf(-crit, gl, nc)
        if pot < alvo:
            lo = d
        else:
            hi = d
    return round(hi, 2)


def bh(ps):
    idx = sorted(range(len(ps)), key=lambda i: ps[i])
    m, q, menor = len(ps), [None] * len(ps), 1.0
    for r, i in enumerate(reversed(idx), 1):
        menor = min(menor, ps[i] * m / (m - r + 1))
        q[i] = menor
    return q


def persistencia_dentro_da_temporada():
    """1ª metade do indicador contra a 2ª metade DO PRÓPRIO indicador, por clube-temporada.

    Isto NÃO é a porta temporal da §6.4, embora este script a chamasse assim até 20/09. É
    persistência: mede se o indicador se repete, não se ele vem antes do resultado. O limiar
    rho>0,30 que ela usa é o `rho_persist` que a §6.5 aposentou em 15/09. Quem roda a porta da
    §6.4 nesta parte é o `porta_6_4()` logo abaixo, sobre a distância do remate.
    """
    anos = {"2022", "2023", "2024", "2025"}
    linhas = []
    with open(os.path.join(DADOS, "serieb_jogos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r.get("Competição") != "Brazil. Serie B":
                continue
            m = re.match(r"(\d{4})-\d{2}-\d{2}", r["Data"] or "")
            if not m or m.group(1) not in anos:
                continue
            try:
                xg = float(r["Golos esperados"])
            except (TypeError, ValueError):
                xg = None
            linhas.append({"ano": m.group(1), "data": r["Data"][:10], "clube": r["Equipa"],
                           "adv": r["adversario"], "gp": int(float(r["golos_pro"] or 0)),
                           "gc": int(float(r["golos_contra"] or 0)), "xg": xg})
    idx = {(l["ano"], l["data"], l["clube"]): l for l in linhas}
    for l in linhas:
        o = idx.get((l["ano"], l["data"], l["adv"]))
        l["xgc"] = o["xg"] if o else None
    por = collections.defaultdict(list)
    for l in linhas:
        por[(l["ano"], l["clube"])].append(l)
    for k in por:
        por[k].sort(key=lambda x: x["data"])

    def media(js, f):
        v = [f(j) for j in js if f(j) is not None]
        return sum(v) / len(v) if v else None

    metricas = {
        "xg": lambda j: j["xg"],
        "xg_contra": lambda j: j["xgc"],
        "gols_pro_90": lambda j: j["gp"],
        "gols_contra_90": lambda j: j["gc"],
        "finalizacao": lambda j: (j["gp"] - j["xg"]) if j["xg"] is not None else None,
        "defesa_vs_xg": lambda j: (j["xgc"] - j["gc"]) if j["xgc"] is not None else None,
    }
    out = {}
    for nome, f in metricas.items():
        A, B = [], []
        for js in por.values():
            if len(js) < 30:
                continue
            h = len(js) // 2
            a, b = media(js[:h], f), media(js[h:], f)
            if a is not None and b is not None:
                A.append(a); B.append(b)
        rho, p = stats.spearmanr(A, B)
        n = len(A)
        z, se = 0.5 * math.log((1 + rho) / (1 - rho)), 1 / math.sqrt(n - 3)
        out[nome] = {"rho": round(float(rho), 3), "p": round(float(p), 5), "n": n,
                     "ic": [round(math.tanh(z - 1.96 * se), 2), round(math.tanh(z + 1.96 * se), 2)],
                     "se_repete": bool(p < 0.05 and rho > 0.3)}
    return out


# ==============================================================================================
# Os números que a parte publica — acrescentado em 20/09
# ==============================================================================================
# Nada daqui para baixo altera a análise de 17/09: as contas acima continuam idênticas, e estas
# funções só leem o que elas produziram ou abrem a base de jogos por outro caminho. A receita de
# cada marcador novo é o campo `de_onde` de `resultados/A02_numeros_novos.json`.

def linha(resultados, fronteira, familia, comparacao, indicador):
    """A linha de `A02_testes.csv` de onde um marcador era copiado a olho."""
    for it in resultados:
        if (it["fronteira"], it["familia"], it["comparacao"], it["indicador"]) == \
           (fronteira, familia, comparacao, indicador):
            return it
    raise KeyError(f"{fronteira}/{familia}/{comparacao}/{indicador} não está na tabela de testes")


def mediana_corte_cheio(base, indicador):
    """(Sobe, Meio) no corte CHEIO — 16 × 48, SEM tirar os times de fronteira.

    É a mesma mediana do valor bruto que a tabela de testes traz nas linhas `fronteira=com` e
    `comparacao=SM`; aqui sai sem o arredondamento de 3 casas, porque o que vai à tela tem 1 ou 2.
    """
    return (st.median([l[indicador] for l in base if l["faixa"] == "Sobe"]),
            st.median([l[indicador] for l in base if l["faixa"] == "Meio"]))


def split_half(por, valor_da_metade):
    """A confiabilidade da §3: metade PAR contra metade ÍMPAR da temporada.

    Jogos em ordem de data, índice 0..37; o valor de cada metade sai de `valor_da_metade`; posto
    dentro do ano (o método da casa, `_metodo.percentil_no_ano`); Spearman entre os dois postos; e
    Spearman-Brown 2ρ/(1+ρ), porque meia temporada é metade do teste.

    O código foi validado contra a própria §3: reproduz Passes certos 0,78, Duelos ganhos 0,70,
    Posse 0,69, Toques na área 0,63, Remates 0,50 e xG 0,30.
    """
    reg = []
    for (temporada, _clube), js in por.items():
        if len(js) < 30:
            continue
        a = valor_da_metade([j for i, j in enumerate(js) if i % 2 == 0])
        b = valor_da_metade([j for i, j in enumerate(js) if i % 2 == 1])
        if a is not None and b is not None:
            reg.append({"temporada": temporada, "par": a, "impar": b})
    percentil_no_ano(reg, ["par", "impar"])
    rho, _ = stats.spearmanr([l[pct("par")] for l in reg], [l[pct("impar")] for l in reg])
    return 2 * float(rho) / (1 + float(rho)), len(reg)


def porta_6_4(por, campo, sinal):
    """A porta temporal como a §6.4 define, não como este script chamava de porta.

    Média do indicador nas 19 primeiras rodadas contra os PONTOS somados das 19 últimas, tudo em
    posto dentro do ano, com a parcial dada a pontuação do 1º turno. A conta é emprestada de
    `scripts/_porta_temporal.py`, que reproduz as nove linhas da tabela da §6.4 — reimplementar
    aqui seria criar uma décima versão da mesma coisa.
    """
    reg = [{"temporada": temporada, "clube": clube,
            "pts_1t": sum(_pt.pontos(j) for j in js[:_pt.TURNO]),
            "pts_2t": sum(_pt.pontos(j) for j in js[_pt.TURNO:]),
            campo: _pt.media(js[:_pt.TURNO], campo)}
           for (temporada, clube), js in por.items()]
    percentil_no_ano(reg, ["pts_1t", "pts_2t"])
    return _pt.porta(reg, campo, sinal)


def rho_detectavel(n, alvo=0.80, alfa=0.05):
    """Menor ρ detectável com `alvo` de poder, por Fisher z. É a §6.7 aplicada à repetição."""
    z = stats.norm.ppf(1 - alfa / 2) + stats.norm.ppf(alvo)
    return math.tanh(z / math.sqrt(n - 3))


def montar_numeros(base, resultados, porta, contagens, poder, por, p_dist):
    """Marcador → valor, os 76 que `A02.json` publica. Duas camadas, na ordem em que nasceram."""
    L = lambda fam, ind: linha(resultados, "sem", fam, "SM", ind)   # o corte REDUZIDO, 8 × 32
    cria_rem, cria_dist = L("cria", "remates"), L("cria", "dist_remate")
    cria_toq, cria_ent = L("cria", "toques_area"), L("cria", "entradas_area")
    cria_xg = L("cria", "xg")
    cede_rem, cede_xgc = L("cede", "remates_contra"), L("cede", "xg_contra")
    cede_xgpr = L("cede", "xg_por_remate_contra")
    sobra_fin = L("sobra", "finalizacao")

    # ---- CAMADA 1: os 49 que este script já calculava e agora assina --------------------------
    num = {
        "n_sobe": contagens["sobe"], "n_meio": contagens["meio"], "n_trave": contagens["trave"],
        "n_sobe_sf": contagens["sobe_sem_fronteira"],
        "n_trave_sf": contagens["trave_sem_fronteira"], "clubes": contagens["clubes"],
        "dmin_SM": poder["8x32"], "dmin_ST": poder["8x7"],

        "rem_s": cria_rem["cru_sobe"], "rem_m": cria_rem["cru_alvo"], "rem_q": cria_rem["q"],
        "dist_s": cria_dist["cru_sobe"], "dist_m": cria_dist["cru_alvo"],
        "dist_d": cria_dist["d"], "dist_q": cria_dist["q"],
        "toq_s": cria_toq["cru_sobe"], "toq_m": cria_toq["cru_alvo"],
        "toq_d": cria_toq["d"], "toq_q": cria_toq["q"],
        "ent_s": cria_ent["cru_sobe"], "ent_m": cria_ent["cru_alvo"],
        "ent_d": cria_ent["d"], "ent_q": cria_ent["q"],
        "xg_s": cria_xg["cru_sobe"], "xg_m": cria_xg["cru_alvo"],
        "xg_d": cria_xg["d"], "xg_q": cria_xg["q"],

        "remc_s": cede_rem["cru_sobe"], "remc_m": cede_rem["cru_alvo"], "remc_q": cede_rem["q"],
        "xgc_s": cede_xgc["cru_sobe"], "xgc_m": cede_xgc["cru_alvo"],
        "xgc_d": cede_xgc["d"], "xgc_q": cede_xgc["q"],
        "xgc_ic": f"[{cede_xgc['ic95_d'][0]}, {cede_xgc['ic95_d'][1]}]",
        "xgpr_d": cede_xgpr["d"], "xgpr_q": cede_xgpr["q"],

        "fin_s": sobra_fin["cru_sobe"], "fin_m": sobra_fin["cru_alvo"],
        "fin_d": sobra_fin["d"], "fin_q": sobra_fin["q"],

        # A conta que este script chama de porta e que a §6.4 chama de persistência: o indicador
        # da 1ª metade contra ele mesmo na 2ª. O nome fica como está publicado.
        "porta_fin": porta["finalizacao"]["rho"], "porta_fin_p": porta["finalizacao"]["p"],
        "porta_fin_ic": f"{porta['finalizacao']['ic'][0]} a {porta['finalizacao']['ic'][1]}",
        "porta_def": porta["defesa_vs_xg"]["rho"], "porta_xg": porta["xg"]["rho"],
        "porta_xgc": porta["xg_contra"]["rho"], "porta_n": porta["finalizacao"]["n"],
        "conf_xg": CONFIABILIDADE["xg"],
    }

    # ---- CAMADA 2: os 27 que estavam digitados à mão -----------------------------------------
    # As medianas do corte CHEIO (16 × 48). O texto publicado usa o reduzido; estes marcadores
    # `_cf` existem para a proposta de destino, e são a mesma conta sem o filtro de fronteira.
    dist_s_cf, dist_m_cf = mediana_corte_cheio(base, "dist_remate")
    rem_s_cf, rem_m_cf = mediana_corte_cheio(base, "remates")
    remc_s_cf, remc_m_cf = mediana_corte_cheio(base, "remates_contra")
    xgpr_s_cf, xgpr_m_cf = mediana_corte_cheio(base, "xg_por_remate_contra")
    xgc_s_cf, xgc_m_cf = mediana_corte_cheio(base, "xg_contra")
    xg_s_cf, xg_m_cf = mediana_corte_cheio(base, "xg")
    fin_s_cf, fin_m_cf = mediana_corte_cheio(base, "finalizacao")
    def_s_cf, def_m_cf = mediana_corte_cheio(base, "defesa_vs_xg")

    # A base de jogos e a porta da §6.4 chegam prontas do main(), que já precisa das duas para
    # gravar o A02_resumo.json: rodar _pt.ler_jogos() duas vezes só duplicaria a leitura.
    jogos_na_temporada = collections.Counter(len(js) for js in por.values()).most_common(1)[0][0]
    conf_xgpr_contra, _ = split_half(por, lambda js: _pt.razao(js, "xg_sofrido", "remates_contra"))
    conf_fin, n_split = split_half(
        por, lambda js: (lambda v: sum(v) / len(v) if v else None)(
            [j["gp"] - j["xg"] for j in js if j["xg"] is not None]))

    num.update({
        "dist_s_cf": round(dist_s_cf, 1), "dist_m_cf": round(dist_m_cf, 1),
        "rem_s_cf": round(rem_s_cf, 1), "rem_m_cf": round(rem_m_cf, 1),
        "remc_s_cf": round(remc_s_cf, 1), "remc_m_cf": round(remc_m_cf, 1),
        # ×100 para a unidade de jogo: gols esperados a cada 100 finalizações sofridas.
        "xgpr_s100_cf": round(100 * xgpr_s_cf, 1), "xgpr_m100_cf": round(100 * xgpr_m_cf, 1),
        "xgc_s_cf": round(xgc_s_cf, 2), "xgc_m_cf": round(xgc_m_cf, 2),
        "xg_s_cf": round(xg_s_cf, 2), "xg_m_cf": round(xg_m_cf, 2),
        "fin_s_cf": round(fin_s_cf, 2),
        # COM SINAL, desde 20/09. Ficava em módulo "porque a frase já dizia abaixo" — mas a frase
        # não é o único leitor do marcador: no corte cheio Sobe fica ACIMA do esperado (+0,05) e o
        # Meio ABAIXO (−0,17), e publicar 0,17 faz o desenho mostrar o meio convertendo melhor que
        # quem sobe, o contrário do que o número diz. Módulo é decisão de frase, não de dado.
        "fin_m_cf": round(fin_m_cf, 2),
        "def_s_cf": round(def_s_cf, 2), "def_m_cf": round(def_m_cf, 2),
        "fin_gols_temporada": round((fin_s_cf - fin_m_cf) * jogos_na_temporada),
        "rod_corte": _pt.TURNO,
        "n_turnos": p_dist["n"],
        "n_meio_sf": linha(resultados, "sem", "cria", "SM", "remates")["n_alvo"],
        "dmin_SM_cf": poder["16x48"],
        "porta_dist_parcial": p_dist["parcial"], "porta_dist_p": round(p_dist["p_parcial"], 4),
        "conf_xgpr_contra": round(conf_xgpr_contra, 2),
        "conf_fin": round(conf_fin, 2),
        "rho_min_80": round(rho_detectavel(n_split), 2),
        "persist_fin": round(porta["finalizacao"]["rho"], 2),
    })
    return num


def main():
    dec = json.load(open(os.path.join(R, "A02_indicadores.json"), encoding="utf-8"))
    base, inds = carregar(dec)
    sinal = {i["id"]: i["sinal"] for i in inds}
    nome = {i["id"]: i["nome"] for i in inds}

    resultados = []
    for rot, filtro in (("com", lambda l: True), ("sem", lambda l: not l["fronteira"])):
        for fam in dec["familias"]:
            for cid, alvo_f in (("SM", lambda l: l["faixa"] == "Meio"),
                                ("ST", lambda l: l["trave"])):
                ps, itens = [], []
                for ind in fam["indicadores"]:
                    k = ind["id"] + "_pct"
                    ga = lambda l: l["faixa"] == "Sobe" and filtro(l)
                    gb = lambda l: alvo_f(l) and filtro(l)
                    a = [l[k] for l in base if ga(l)]
                    b = [l[k] for l in base if gb(l)]
                    if len(a) < 5 or len(b) < 5:
                        continue
                    t, p = stats.ttest_ind(a, b, equal_var=False)
                    d = cohen_d(a, b) * ind["sinal"]
                    lo, hi = ic_por_clube(base, k, ga, gb, ind["sinal"])
                    cru_a = st.median([l[ind["id"]] for l in base if ga(l)])
                    cru_b = st.median([l[ind["id"]] for l in base if gb(l)])
                    itens.append({
                        "fronteira": rot, "familia": fam["id"], "comparacao": cid,
                        "indicador": ind["id"], "nome": ind["nome"],
                        "n_sobe": len(a), "n_alvo": len(b),
                        "cru_sobe": round(cru_a, 3), "cru_alvo": round(cru_b, 3),
                        "dif_cru": round(cru_a - cru_b, 3),
                        "d": round(d, 3), "ic95_d": [lo, hi], "p": round(float(p), 5),
                        "d_minimo_80": d_minimo(len(a), len(b)),
                        "placar_redescrito": ind["id"] in PLACAR,
                        "regua_curta": CONFIABILIDADE.get(ind["id"]),
                    })
                    ps.append(float(p))
                for it, q in zip(itens, bh(ps)):
                    it["q"] = round(q, 5)
                    it["selo"] = ("firme" if q < 0.05 else
                                  ("pode ser sorte" if it["p"] < 0.05 else "sem diferença clara"))
                    it["poder_suficiente"] = abs(it["d"]) >= it["d_minimo_80"]
                resultados += itens

    persistencia = persistencia_dentro_da_temporada()
    # A porta da §6.4 sobre a distância do remate, que é o indicador da conclusão A02-1. Sinal −1:
    # chutar de longe é pior. A conta é a do scripts/_porta_temporal.py, não uma décima versão.
    _linhas_pt, por_pt = _pt.ler_jogos()
    p_dist_resumo = porta_6_4(por_pt, "dist", -1)
    with open(os.path.join(R, "A02_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(resultados[0]))
        w.writeheader(); w.writerows(resultados)
    poder = {"16x48": d_minimo(16, 48), "16x16": d_minimo(16, 16),
             "8x32": d_minimo(8, 32), "8x7": d_minimo(8, 7)}
    contagens = {"sobe": sum(1 for l in base if l["faixa"] == "Sobe"),
                 "meio": sum(1 for l in base if l["faixa"] == "Meio"),
                 "trave": sum(1 for l in base if l["trave"]),
                 "sobe_sem_fronteira": sum(1 for l in base if l["faixa"] == "Sobe" and not l["fronteira"]),
                 "trave_sem_fronteira": sum(1 for l in base if l["trave"] and not l["fronteira"]),
                 "clubes": len({l["clube"] for l in base})}
    # As duas contas, cada uma com o seu nome. Até 20/09 a persistência era gravada como
    # "porta_temporal", e era essa troca de nome que fazia a parte declarar uma porta que nunca
    # tinha rodado — o _porta_temporal.md de 19/09 é quem achou. A porta da §6.4 é a de baixo.
    json.dump({"persistencia_dentro_da_temporada": persistencia,
               "porta_6_4": {
                   "indicador": "dist_remate (distância média do remate, sinal −1)",
                   "definicao": "média nas 19 primeiras rodadas × pontos somados das 19 últimas, "
                                "em posto dentro do ano, com parcial dada à pontuação do 1º turno",
                   "conta_de": "scripts/_porta_temporal.py, a mesma que reproduz as nove linhas "
                               "da tabela da §6.4 célula a célula",
                   **p_dist_resumo},
               "poder_por_desenho": poder, "n": contagens},
              open(os.path.join(R, "A02_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    for rot in ("com", "sem"):
        print(f"\n{'='*100}\n{rot.upper()} fronteira — Welch no posto dentro do ano, d de Cohen, "
              f"BH por família × comparação\n{'='*100}")
        print(f"{'fam':6s} {'indicador':21s} {'cmp':3s} {'n':>7s} {'cru S':>7s} {'cru alvo':>8s} "
              f"{'d':>6s} {'IC95':>14s} {'q':>8s} {'d min':>6s}  selo")
        for it in resultados:
            if it["fronteira"] != rot:
                continue
            marca = " ⚑placar" if it["placar_redescrito"] else (" ⚑régua" if it["regua_curta"] else "")
            ns = f"{it['n_sobe']}x{it['n_alvo']}"
            print(f"{it['familia']:6s} {it['indicador'][:21]:21s} {it['comparacao']:3s} "
                  f"{ns:>7s} "
                  f"{it['cru_sobe']:7.2f} {it['cru_alvo']:8.2f} {it['d']:+6.2f} "
                  f"[{it['ic95_d'][0]:+5.2f},{it['ic95_d'][1]:+5.2f}] {it['q']:8.4f} "
                  f"{it['d_minimo_80']:6.2f}  {it['selo']}{marca}")

    print(f"\n{'='*100}\nPORTA TEMPORAL — 1º turno prevendo o 2º (Spearman, n=80 clube-temporadas)\n{'='*100}")
    for k, v in persistencia.items():
        print(f"  {nome.get(k, k):34s} rho {v['rho']:+.3f}  IC95 [{v['ic'][0]:+.2f},{v['ic'][1]:+.2f}]  "
              f"p {v['p']:.4f}   {'SE REPETE' if v['se_repete'] else 'NÃO se repete'}")

    # ---- os números que a parte publica ------------------------------------------------------
    num = montar_numeros(base, resultados, persistencia, contagens, poder,
                         por_pt, p_dist_resumo)
    json.dump({"gerado_por": "scripts/A02.py", "gerado_em": GERADO_EM,
               "corte_do_texto": "reduzido, 8 Sobe × 32 Meio; os marcadores _cf são o cheio, 16 × 48",
               "numeros": num},
              open(os.path.join(R, NUMEROS_JSON), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n{'='*100}\n{NUMEROS_JSON} — {len(num)} marcadores gravados\n{'='*100}")
    for k, v in num.items():
        print(f"  {k:22s} {v}")


if __name__ == "__main__":
    main()
