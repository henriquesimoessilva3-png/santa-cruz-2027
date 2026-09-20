#!/usr/bin/env python3
"""T02 — quais treinadores mantêm seus times mais rodadas no G4.

Junta as duas partes que já existem:
  - `T01_rodada_treinador.csv` (A quem pertence cada rodada; a regra do interino que aninha
    dentro do efetivo mora no T01, não aqui.)
  - `classificacao_rodada.csv` (Em que posição o time estava no fim de cada rodada — A01.)

Recorte: **2022 a 2026**, como o A01 (decisão do dono em 17/09).

## O que é "rodada no G4"

A posição do time no fim de uma rodada que aquele treinador comandou. Conta-se de dois jeitos,
como o CLAUDE.md pede: **todas as rodadas** e **só da 10ª em diante** — antes disso a tabela
oscila demais para significar alguma coisa.

## Mínimo de 10 rodadas

Passagem com menos de 10 rodadas fica fora do ranking, mas continua na base, marcada. Sem isso o
topo vira um interino que pegou três jogos bons.

## Pontos por jogo e xG

Os pontos saem da diferença da tabela entre rodadas consecutivas (A01), não de uma conta nova.
O xG sofrido não existe como coluna em `serieb_jogos.csv` — mas o mesmo jogo aparece uma vez por
time, então o **xG do adversário é o xG sofrido**. As duas linhas são pareadas por data e por
adversário.

## O contexto obrigatório

Todo resultado vem com a posição do time quando o treinador assumiu e quando saiu, e com o valor
do elenco (`tm_valor_total`, do Transfermarkt) como descrição ao lado — nunca como desconto.

## A saída por marcador

`resultados/T02_numeros.json` é a última coisa que este script escreve: todo número que o
`T02.json` publica sai daqui, com o mesmo nome de marcador (regra 1 do portão, etapa 6 do
PLANO.md). Nada acima dessa seção mudou — `T02_passagem.csv`, `T02_treinador.csv` e
`T02_resumo.json` saem idênticos aos de 17/09, e é assim que se prova que a gravação não mexeu
na análise.

## A tabela de testes (20/09)

`resultados/T02_testes.csv` passou a ser gravado: é a comparação de faixa de valor que a função
`testes_de_faixa()` já calculava desde 19/09 e que só existia dentro do `T02_numeros.json`. Nada
foi recalculado para escrevê-la — a mesma função, com a mesma semente, devolve as mesmas linhas, e
os marcadores publicados continuam saindo dali. O que ela acrescenta é o que faltava gravar: o
**corte sem os clubes de fronteira de valor** (postos 5, 6, 10 e 11 do ranking de `tm_valor_total`
do ano, o análogo da fronteira nesta unidade, porque as faixas aqui são de preço de elenco e não de
posição na tabela) e a **contagem da 10ª rodada em diante**, cada contagem como uma família própria
para que o BH continue corrigindo os mesmos três p de antes.

Ela roda em dois recortes, e os dois convivem:
  - a **passagem** (o que este script sempre fez), 2022 a 2026, é o que vai para os CSV;
  - o **clube-temporada**, 2022 a 2025, que a T02-1 pede — 2026 fica fora de todo marcador,
    por ser temporada em curso e por o G4 ter deixado de ser a zona de acesso.

Uso:
    python3 _fonte/estudo_serieb/scripts/T02.py
"""
import collections
import csv
import json
import math
import os
import re
import statistics as st
import sys
from decimal import ROUND_HALF_UP, Decimal

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")

TEMPORADAS = {2022, 2023, 2024, 2025, 2026}
EM_CURSO = 2026
MIN_RODADAS = 10          # o mínimo do CLAUDE.md
DEPOIS_DA = 10            # "só a partir da 10ª rodada"

sys.path.insert(0, AQUI)
from _metodo import bh, cohen_d, d_minimo, ic_por_clube, pct, percentil_no_ano  # noqa: E402

# A saída por marcador. Data fixa porque o script é reprodutível: roda hoje e daqui a um ano com o
# mesmo resultado, e data dinâmica só faria o arquivo mudar sem nenhum número mudar.
NUMEROS_JSON = os.path.join(R, "T02_numeros.json")
GERADO_EM = "2026-09-20"

ANOS_FECHADOS = (2022, 2023, 2024, 2025)   # o recorte de todo marcador: 2026 fica fora
CORTE_TOP5, CORTE_MEIO = 5, 10             # faixas de valor: 1º–5º, 6º–10º, 11º para baixo
OSC_ALTO = 85                              # "o time lá em mais de 8 de cada 10 rodadas"
AMPLITUDE_GRANDE = 50                      # a cauda dos 50 pontos percentuais ou mais
SEMENTE = 42                               # o bootstrap de clube do _metodo.py


def ler_xg():
    """(temporada, clube, data) -> (xg_pro, xg_contra). O xG contra é o xG do adversário."""
    linhas = []
    for arq in ("serieb_jogos.csv", "serieb_jogos_2018_2021.csv"):
        caminho = os.path.join(DADOS, arq)
        if not os.path.exists(caminho):
            continue
        with open(caminho, encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                if r.get("Competição") != "Brazil. Serie B":
                    continue
                m = re.match(r"(\d{4})-\d{2}-\d{2}", r["Data"] or "")
                if not m or int(m.group(1)) not in TEMPORADAS:
                    continue
                try:
                    xg = float(r["Golos esperados"])
                except (TypeError, ValueError):
                    xg = None
                linhas.append({"data": r["Data"][:10], "clube": r["Equipa"],
                               "adv": r["adversario"], "xg": xg})
    por = {}
    indice = {(l["data"], l["clube"]): l for l in linhas}
    for l in linhas:
        outro = indice.get((l["data"], l["adv"]))
        por[(l["data"], l["clube"])] = (l["xg"], outro["xg"] if outro else None)
    return por


# ==============================================================================================
# A saída por marcador
# ==============================================================================================
# Daqui para baixo só se LÊ o que a análise acima já calculou (`linhas`, `por_passagem`, `tabela`)
# e o ranking de valor, e se escreve o T02_numeros.json.
#
# CAMADA 1: o que o script já calculava, agora com o nome do marcador como chave.
# CAMADA 2: os marcadores que até 19/09 só existiam digitados no T02.json. A receita de cada um
# está no campo `de_onde` de resultados/T02_numeros_novos.json, conferido por dois caminhos —
# nada foi reinventado aqui.

def br(v, casas):
    """O número em pt-BR, arredondando meio para CIMA — "arredonde, não trunque".

    `round()` devolve 9,4 para 9,45 porque o float é 9,4499…; a média do grupo 6º–10º é exatamente
    189/20, e é esse o caso que o T02.json publica como 9,5."""
    if v is None:
        return None
    exato = Decimal(repr(round(float(v), 10)))
    d = exato.quantize(Decimal(1).scaleb(-casas), rounding=ROUND_HALF_UP)
    return f"{d:f}".replace(".", ",")


def sem_decimal_a_toa(v):
    """A mediana de 20 valores inteiros sai 9.0 do statistics; o número é 9."""
    return int(v) if float(v).is_integer() else v


def faixa_do_posto(posto):
    return "top5" if posto <= CORTE_TOP5 else ("meio" if posto <= CORTE_MEIO else "baixo")


def ranking_de_valor(clubes_por_ano):
    """Posto do clube no ranking de `tm_valor_total` dentro da temporada, do maior para o menor.

    Desempate: `valor_total` (Wyscout) na mesma linha. Ele existe por um caso só, e um caso que
    muda o resultado: em 2023 CRB e Novorizontino têm o mesmo tm_valor_total (13,9 M EUR) e caem
    exatamente no corte 10º/11º. Pelo Wyscout o Novorizontino é o 10º."""
    valores = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            ano = next((r[k] for k in ("ano", "temporada", "season") if k in r), None)
            clube = next((r[k] for k in ("clube", "time", "Equipa") if k in r), None)
            if not ano or not clube:
                continue
            def numero(coluna):
                try:
                    return float(r.get(coluna) or 0) or 0.0
                except ValueError:
                    return 0.0
            try:
                valores[(int(float(ano)), clube)] = (numero("tm_valor_total"), numero("valor_total"))
            except ValueError:
                continue
    postos = {}
    for ano, clubes in clubes_por_ano.items():
        ordem = sorted(clubes, key=lambda c: (-valores.get((ano, c), (0.0, 0.0))[0],
                                              -valores.get((ano, c), (0.0, 0.0))[1], c))
        for i, clube in enumerate(ordem, 1):
            postos[(ano, clube)] = i
    return postos


def clube_temporada(tabela):
    """Uma linha por clube-temporada de 2022 a 2025, com as rodadas no G4 nos dois cortes e a
    faixa de valor do elenco. É a unidade da T02-1 — passagem não serve, porque o clube que troca
    de treinador apareceria duas vezes."""
    g4, g4_tarde, clubes = collections.Counter(), collections.Counter(), collections.defaultdict(set)
    for (ano, clube, rodada), t in tabela.items():
        if ano not in ANOS_FECHADOS:
            continue
        clubes[ano].add(clube)
        if int(t["pos"]) <= 4:
            g4[(ano, clube)] += 1
            if rodada >= DEPOIS_DA:
                g4_tarde[(ano, clube)] += 1
    postos = ranking_de_valor(clubes)
    base = [{"temporada": ano, "clube": clube, "posto_valor": postos[(ano, clube)],
             "faixa_valor": faixa_do_posto(postos[(ano, clube)]),
             "rodadas_no_g4": g4[(ano, clube)],
             "rodadas_no_g4_apos_10": g4_tarde[(ano, clube)]}
            for ano in sorted(clubes) for clube in sorted(clubes[ano])]
    base.sort(key=lambda l: (l["temporada"], l["posto_valor"]))
    return base, postos


# As três comparações da família, com o código curto que vai para a coluna `comparacao` do
# T02_testes.csv, no molde do SM/ST/CM das partes do bloco A: T = 5 elencos mais caros,
# M = 6º ao 10º, B = 11º para baixo.
COMPARACOES = (("top5_baixo", "TB", "top5", "baixo"),
               ("meio_baixo", "MB", "meio", "baixo"),
               ("top5_meio", "TM", "top5", "meio"))

# As duas contagens que o CLAUDE.md manda rodar, cada uma como uma FAMÍLIA à parte: o BH corrige
# dentro da família, e juntar as duas contagens num bolo só mudaria os q já publicados.
CONTAGENS = (("rodadas_no_g4", "valor", "Rodadas no G4 por temporada"),
             ("rodadas_no_g4_apos_10", "valor_apos10", "Rodadas no G4 da 10ª rodada em diante"))

# O corte de fronteira DESTA parte. A fronteira do G4/Z4 (CLAUDE.md, "Fronteira") é uma régua de
# posição na TABELA, e aqui as faixas comparadas não são de classificação: são de VALOR de elenco.
# O clube de fronteira, então, é o que cai colado no corte 5º/6º ou 10º/11º do ranking de
# tm_valor_total da temporada — postos 5, 6, 10 e 11. É o mesmo corte de robustez que a proposta v2
# rodou em 19/09 e que o T02.json descreve ("o corte sem os clubes dos postos de valor 5, 6, 10 e
# 11"); ele existia só na conferência, e é o que passa a ficar gravado aqui.
FRONTEIRA_DE_VALOR = (CORTE_TOP5, CORTE_TOP5 + 1, CORTE_MEIO, CORTE_MEIO + 1)

# O cabeçalho canônico do estudo, copiado de A07_testes.csv.
COLUNAS_TESTES = ["fronteira", "familia", "comparacao", "indicador", "n_a", "n_b", "cru_a",
                  "cru_b", "d", "ic95_d", "p", "d_minimo_80", "q", "selo", "poder_suficiente",
                  "nome", "placar_redescrito"]


def uma_familia(base, coluna):
    """O método da casa, do scripts/_metodo.py, na família das três comparações de faixa de valor:
    posto da contagem dentro da temporada, Welch bilateral, d de Cohen no posto, IC95 por
    bootstrap de CLUBE e BH a 5% sobre os três p.

    O `rng` nasce aqui, com a semente fixa: a função é determinística e roda igual quantas vezes
    for chamada — é o que permite que o marcador publicado e a linha do CSV saiam do mesmo número
    sem precisar carregar o resultado de um lado para o outro."""
    percentil_no_ano(base, [coluna])
    campo = pct(coluna)
    de = {f: (lambda fx: (lambda l: l["faixa_valor"] == fx))(f) for f in ("top5", "meio", "baixo")}
    rng = np.random.default_rng(SEMENTE)
    saida, ps = [], []
    for nome, codigo, a, b in COMPARACOES:
        va = [l[campo] for l in base if de[a](l)]
        vb = [l[campo] for l in base if de[b](l)]
        _, p = stats.ttest_ind(va, vb, equal_var=False)
        lo, hi = ic_por_clube(base, campo, de[a], de[b], 1, rng)
        saida.append({"nome": nome, "comparacao": codigo, "n_a": len(va), "n_b": len(vb),
                      "cru_a": float(np.median([l[coluna] for l in base if de[a](l)])),
                      "cru_b": float(np.median([l[coluna] for l in base if de[b](l)])),
                      "d": float(cohen_d(va, vb)), "ic95_d": [lo, hi], "p": float(p),
                      "d_minimo_80": d_minimo(len(va), len(vb))})
        ps.append(float(p))
    for linha, q in zip(saida, bh(ps)):
        linha["q"] = q
    return {t["nome"]: t for t in saida}


def testes_de_faixa(base):
    """A família que sustenta os marcadores da T02-1: a contagem de todas as rodadas."""
    return uma_familia(base, "rodadas_no_g4")


def tabela_de_testes(base):
    """As linhas do T02_testes.csv: 2 contagens × 3 comparações × 2 cortes de fronteira.

    O corte `sem` tira os clubes de fronteira de VALOR (postos 5, 6, 10 e 11 do ano) e roda tudo de
    novo sobre o que sobra — inclusive o posto dentro da temporada, que é recalculado entre os
    clubes restantes, porque "rodar sem" é rodar sem. As linhas do corte `sem` são cópias, para que
    esse recálculo não toque nas linhas de que os marcadores publicados saem."""
    sem = [dict(l) for l in base if l["posto_valor"] not in FRONTEIRA_DE_VALOR]
    linhas = []
    for rotulo, b in (("com", base), ("sem", sem)):
        for coluna, familia, nome in CONTAGENS:
            teste = uma_familia(b, coluna)
            for chave, codigo, _a, _b in COMPARACOES:
                t = teste[chave]
                linhas.append({
                    "fronteira": rotulo, "familia": familia, "comparacao": codigo,
                    "indicador": coluna, "n_a": t["n_a"], "n_b": t["n_b"],
                    "cru_a": round(t["cru_a"], 3), "cru_b": round(t["cru_b"], 3),
                    "d": round(t["d"], 3), "ic95_d": t["ic95_d"], "p": round(t["p"], 5),
                    "d_minimo_80": t["d_minimo_80"], "q": round(t["q"], 5),
                    "selo": ("firme" if t["q"] < 0.05 else
                             ("pode ser sorte" if t["p"] < 0.05 else "sem diferença clara")),
                    "poder_suficiente": abs(t["d"]) >= t["d_minimo_80"],
                    "nome": nome,
                    # Rodada no G4 é posição na tabela, não ação em campo: não há estado de jogo
                    # que a redescreva, e nenhuma linha desta parte é efeito do placar.
                    "placar_redescrito": False,
                })
    return linhas


def r_minimo(n, alvo=0.80, alfa=0.05):
    """O menor r detectável com 80% de poder, pela transformação z de Fisher. Mesmo desenho de
    poder do d_minimo() do _metodo.py, aplicado a correlação: a §6.7 manda publicar o poder para
    que "não se transfere" não vire "não existe"."""
    z = stats.norm.ppf(1 - alfa / 2) + stats.norm.ppf(alvo)
    return math.tanh(z / math.sqrt(n - 3))


def numeros_por_marcador(linhas, por_passagem, tabela):
    """Todo marcador que o T02.json publica, com o nome dele como chave."""
    base, postos = clube_temporada(tabela)
    teste = testes_de_faixa(base)

    def do_grupo(faixa, coluna="rodadas_no_g4"):
        return [l[coluna] for l in base if l["faixa_valor"] == faixa]

    # --- T02-2 e T02-3: a passagem, 2022 a 2025, no ranking (10+ rodadas e sem interino) ---
    fechadas = [l for l in linhas if l["temporada"] in ANOS_FECHADOS and l["no_ranking"]]
    por_treinador = collections.defaultdict(list)
    for l in fechadas:
        por_treinador[l["treinador"]].append(l)
    multi = {t: ls for t, ls in por_treinador.items() if len({l["clube"] for l in ls}) >= 2}

    # o piso: a pior passagem de cada treinador que trocou de clube, do maior piso para o menor
    pisos = sorted(((min(l["pct_g4"] for l in ls), t) for t, ls in multi.items()), reverse=True)
    primeiro, segundo = multi[pisos[0][1]], multi[pisos[1][1]]
    eb = sorted(primeiro, key=lambda l: (l["temporada"], l["rodada_1a"]))
    eb_pior = min(eb, key=lambda l: l["pct_g4"])
    eb_melhor = max(eb, key=lambda l: l["pct_g4"])
    seg_pior = min(segundo, key=lambda l: l["pct_g4"])
    # o clube em que ele repetiu (Novorizontino): é o recorte de ponto por jogo e de saldo de xG
    vezes = collections.Counter(l["clube"] for l in eb)
    clube_repetido = max(vezes, key=lambda c: (vezes[c], sum(l["rodadas"] for l in eb
                                                             if l["clube"] == c)))
    repetido = sorted((l for l in eb if l["clube"] == clube_repetido),
                      key=lambda l: l["temporada"])
    outro = [l for l in eb if l["clube"] != clube_repetido]
    jogos = [x for l in repetido
             for x in por_passagem[(l["treinador"], l["clube"], l["temporada"], l["inicio"])]
             if x["xg_pro"] is not None and x["xg_contra"] is not None]

    # --- T02-3: o mesmo treinador em anos opostos ---
    def amplitude(ls, coluna):
        v = [l[coluna] for l in ls if l[coluna] is not None]
        return (max(v) - min(v)) if v else None

    def oscilacao(conta_g4, conta_pct, rodadas_do_corte):
        """Quem teve um ano sem uma rodada sequer no G4 e outro com o time lá em mais de 8 de cada
        10 rodadas — e quanto o ano bom rendeu a mais no placar que o ano zerado de mais rodadas.

        As duas contagens que o CLAUDE.md manda rodar entram por aqui: as colunas de todas as
        rodadas ou as da 10ª em diante. O ponto por jogo é o da passagem inteira nas duas, e a
        passagem sem rodada nenhuma no corte não conta como ano zerado."""
        def zerou(l):
            return l[conta_g4] == 0 and l[rodadas_do_corte] > 0

        nomes = sorted(t for t, ls in multi.items()
                       if any(zerou(l) for l in ls)
                       and any((l[conta_pct] or 0) > OSC_ALTO for l in ls))
        difs, piores = [], 0
        for t in nomes:
            bom = max(multi[t], key=lambda l: (l[conta_pct] or 0))
            zerado = max((l for l in multi[t] if zerou(l)), key=lambda l: l["rodadas"])
            difs.append(round(bom["ppj"] - zerado["ppj"], 2))
            piores += bom["ppj"] <= zerado["ppj"]
        return nomes, st.median(difs), piores

    oscilam, osc_dppj, osc_piores = oscilacao("no_g4", "pct_g4", "rodadas")
    # a mesma frase da 10ª rodada em diante. NÃO são marcadores publicados: a T02-3 traz os três
    # cravados no texto ("8 nomes, 0,26 ponto por jogo e 2 casos iguais ou piores"), e o 0,26 é o
    # quarto decimal que faz a regra 1 do portão reprovar a parte.
    apos_10, dppj_apos_10, piores_apos_10 = oscilacao("no_g4_apos_10", "pct_g4_apos_10",
                                                      "rodadas_apos_10")

    # o mesmo treinador, no mesmo clube, em temporadas diferentes
    pares = collections.defaultdict(list)
    for l in fechadas:
        pares[(l["treinador"], l["clube"])].append(l)
    repetidos = [ls for ls in pares.values() if len(ls) >= 2]
    amp_todas = [amplitude(ls, "pct_g4") for ls in multi.values()]
    amp_apos10 = [a for a in (amplitude(ls, "pct_g4_apos_10") for ls in multi.values())
                  if a is not None]

    # a primeira passagem contra a primeira passagem em outro clube
    antes, depois = [], []
    for ls in multi.values():
        ordem = sorted(ls, key=lambda l: (l["temporada"], l["rodada_1a"]))
        antes.append(ordem[0]["pct_g4"])
        depois.append(next(l for l in ordem if l["clube"] != ordem[0]["clube"])["pct_g4"])
    r, p_r = stats.pearsonr(antes, depois)

    return {
        # -- T02-1: clube-temporada, faixa de valor do elenco --
        "ct_n": len(base),
        "ct_top5_n": len(do_grupo("top5")),
        "ct_meio_n": len(do_grupo("meio")),
        "ct_baixo_n": len(do_grupo("baixo")),
        "ct_top5_rod": br(st.mean(do_grupo("top5")), 1),
        "ct_meio_rod": br(st.mean(do_grupo("meio")), 1),
        "ct_baixo_rod": br(st.mean(do_grupo("baixo")), 1),
        "ct_top5_mediana": sem_decimal_a_toa(st.median(do_grupo("top5"))),
        "ct_meio_mediana": sem_decimal_a_toa(st.median(do_grupo("meio"))),
        "ct_baixo_mediana": sem_decimal_a_toa(st.median(do_grupo("baixo"))),
        "ct_baixo_zero": sum(1 for x in do_grupo("baixo") if x == 0),
        "q_top5_baixo": br(teste["top5_baixo"]["q"], 3),
        "d_top5_baixo": br(teste["top5_baixo"]["d"], 2),
        "ic_top5_baixo": "de {} a {}".format(br(teste["top5_baixo"]["ic95_d"][0], 2),
                                             br(teste["top5_baixo"]["ic95_d"][1], 2)),
        "q_meio_baixo": br(teste["meio_baixo"]["q"], 3),
        "q_top5_meio": br(teste["top5_meio"]["q"], 2),
        "d_minimo_80_20x40": br(teste["top5_baixo"]["d_minimo_80"], 2),
        "d_minimo_80_20x20": br(teste["top5_meio"]["d_minimo_80"], 2),
        # a mesma escada da 10ª rodada em diante. NÃO são marcadores publicados: a T02-1 traz os
        # três cravados no texto ("11,7 · 7,1 · 2,3 rodadas em 29"), que é a regra 1 do portão
        # reprovando. O T02.json está fora do alcance desta tarefa, então o valor sai calculado
        # aqui para que trocar o número cravado por marcador seja uma linha de edição.
        "ct_top5_rod_apos10": br(st.mean(do_grupo("top5", "rodadas_no_g4_apos_10")), 1),
        "ct_meio_rod_apos10": br(st.mean(do_grupo("meio", "rodadas_no_g4_apos_10")), 1),
        "ct_baixo_rod_apos10": br(st.mean(do_grupo("baixo", "rodadas_no_g4_apos_10")), 1),
        # -- T02-2: o piso mais alto de quem trocou de clube --
        "eb_nome": pisos[0][1],
        "eb_passagens": len(eb),
        "eb_clubes": len({l["clube"] for l in eb}),
        "eb_rodadas": sum(l["rodadas"] for l in eb),
        "eb_pior_rod": eb_pior["no_g4"],
        "eb_pior_tot": eb_pior["rodadas"],
        "eb_melhor_rod": eb_melhor["no_g4"],
        "eb_melhor_tot": eb_melhor["rodadas"],
        "eb_seg_nome": pisos[1][1],
        "eb_seg_rod": seg_pior["no_g4"],
        "eb_seg_tot": seg_pior["rodadas"],
        "eb_val_2023": postos[(repetido[0]["temporada"], repetido[0]["clube"])],
        "eb_val_2024": postos[(repetido[1]["temporada"], repetido[1]["clube"])],
        "eb_val_cri": postos[(outro[0]["temporada"], outro[0]["clube"])],
        "eb_ppj_nov": br(sum(l["pontos"] for l in repetido) / sum(l["rodadas"] for l in repetido), 2),
        "eb_xg_nov": br(sum(a - b for a, b in ((x["xg_pro"], x["xg_contra"]) for x in jogos))
                        / len(jogos), 2),
        # -- T02-3: o tempo no G4 não se transfere de um clube para o seguinte --
        "multi": len(multi),
        "osc_n": len(oscilam),
        "oscilam": ", ".join(oscilam[:-1]) + " e " + oscilam[-1],
        "osc_dppj": br(osc_dppj, 2),
        "osc_piores": osc_piores,
        "osc_n_apos10": len(apos_10),
        "osc_dppj_apos10": br(dppj_apos_10, 2),
        "osc_piores_apos10": piores_apos_10,
        "mc_pares": len(repetidos),
        "mc_osc_mediana": br(st.median(amplitude(ls, "pct_g4") for ls in repetidos), 1),
        "amp_mediana_todas": br(st.median(amp_todas), 1),
        "amp_mediana_apos10": br(st.median(amp_apos10), 1),
        "amp_50mais_todas": sum(1 for a in amp_todas if a >= AMPLITUDE_GRANDE),
        "amp_50mais_apos10": sum(1 for a in amp_apos10 if a >= AMPLITUDE_GRANDE),
        "r_prim_seg": br(r, 2),
        "p_prim_seg": br(p_r, 2),
        "r_min_80": br(r_minimo(len(antes)), 2),
    }


def main():
    # --- entradas ---
    donos = [r for r in csv.DictReader(open(os.path.join(R, "T01_rodada_treinador.csv"),
                                            encoding="utf-8"))
             if int(r["temporada"]) in TEMPORADAS]
    tabela = {}
    for r in csv.DictReader(open(os.path.join(R, "classificacao_rodada.csv"), encoding="utf-8")):
        tabela[(int(r["temporada"]), r["clube"], int(r["rodada"]))] = r
    xg = ler_xg()
    valor = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            ano = next((r[k] for k in ("ano", "temporada", "season") if k in r), None)
            clube = next((r[k] for k in ("clube", "time", "Equipa") if k in r), None)
            if ano and clube:
                try:
                    valor[(int(float(ano)), clube)] = float(r.get("tm_valor_total") or 0) or None
                except ValueError:
                    pass

    # --- uma linha por rodada, com posição e pontos ---
    por_passagem = collections.defaultdict(list)
    sem_tabela = 0
    for d in donos:
        ano, clube, rod = int(d["temporada"]), d["clube_wyscout"], int(d["rodada"])
        t = tabela.get((ano, clube, rod))
        if not t:
            sem_tabela += 1
            continue
        ant = tabela.get((ano, clube, rod - 1))
        pts = int(t["pontos"]) - (int(ant["pontos"]) if ant else 0)
        xp, xc = xg.get((d["data"], clube), (None, None))
        por_passagem[(d["treinador"], clube, ano, d["inicio"])].append({
            "rodada": rod, "pos": int(t["pos"]), "dist_g4": int(t["dist_g4"]),
            "pontos": pts, "xg_pro": xp, "xg_contra": xc,
            "interino": d["interino"], "incompleta": t["base_incompleta"],
        })
    if sem_tabela:
        print(f"  {sem_tabela} rodadas sem linha na tabela do A01 (fora do recorte)")

    # --- a passagem agregada ---
    linhas = []
    for (tec, clube, ano, ini), rs in por_passagem.items():
        rs.sort(key=lambda x: x["rodada"])
        tarde = [x for x in rs if x["rodada"] >= DEPOIS_DA]
        xgs = [(x["xg_pro"], x["xg_contra"]) for x in rs
               if x["xg_pro"] is not None and x["xg_contra"] is not None]
        linhas.append({
            "treinador": tec, "clube": clube, "temporada": ano, "inicio": ini,
            "interino": rs[0]["interino"],
            "rodadas": len(rs), "rodada_1a": rs[0]["rodada"], "rodada_ultima": rs[-1]["rodada"],
            "no_g4": sum(1 for x in rs if x["pos"] <= 4),
            "pct_g4": round(100 * sum(1 for x in rs if x["pos"] <= 4) / len(rs), 1),
            "rodadas_apos_10": len(tarde),
            "no_g4_apos_10": sum(1 for x in tarde if x["pos"] <= 4),
            "pct_g4_apos_10": (round(100 * sum(1 for x in tarde if x["pos"] <= 4) / len(tarde), 1)
                               if tarde else None),
            "pontos": sum(x["pontos"] for x in rs),
            "ppj": round(sum(x["pontos"] for x in rs) / len(rs), 2),
            "pos_ao_assumir": rs[0]["pos"], "pos_ao_sair": rs[-1]["pos"],
            "dist_g4_ao_assumir": rs[0]["dist_g4"], "dist_g4_ao_sair": rs[-1]["dist_g4"],
            "xg_saldo_pj": (round(sum(a - b for a, b in xgs) / len(xgs), 2) if xgs else None),
            "xg_jogos": len(xgs),
            "valor_elenco_eur": valor.get((ano, clube)),
            "base_incompleta": max(int(x["incompleta"]) for x in rs),
            "em_curso": int(ano == EM_CURSO),
            "no_ranking": int(len(rs) >= MIN_RODADAS and rs[0]["interino"] != "1"),
        })
    linhas.sort(key=lambda r: (-r["pct_g4"], -r["rodadas"]))

    # --- o mesmo time, com outros treinadores, no mesmo ano ---
    por_ct = collections.defaultdict(list)
    for l in linhas:
        por_ct[(l["clube"], l["temporada"])].append(l)
    for l in linhas:
        outros = [o for o in por_ct[(l["clube"], l["temporada"])] if o is not l]
        rod = sum(o["rodadas"] for o in outros)
        l["ppj_outros_mesmo_time"] = (round(sum(o["pontos"] for o in outros) / rod, 2)
                                      if rod else None)
        l["rodadas_outros"] = rod

    def grava(nome, ls, campos=None):
        with open(os.path.join(R, nome), "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=campos or list(ls[0]))
            w.writeheader(); w.writerows(ls)
        print(f"  {nome}: {len(ls)} linhas")

    print("gravando")
    grava("T02_passagem.csv", linhas)

    # --- o treinador, somando as passagens que entram no ranking ---
    porte = collections.defaultdict(list)
    for l in linhas:
        if l["no_ranking"]:
            porte[l["treinador"]].append(l)
    tec = []
    for nome, ls in porte.items():
        rod = sum(l["rodadas"] for l in ls)
        g4 = sum(l["no_g4"] for l in ls)
        tarde = sum(l["rodadas_apos_10"] for l in ls)
        g4t = sum(l["no_g4_apos_10"] for l in ls)
        xgs = [l for l in ls if l["xg_saldo_pj"] is not None]
        tec.append({
            "treinador": nome, "passagens": len(ls),
            "clubes": len({l["clube"] for l in ls}),
            "temporadas": " ".join(str(x) for x in sorted({l["temporada"] for l in ls})),
            "rodadas": rod, "no_g4": g4, "pct_g4": round(100 * g4 / rod, 1),
            "rodadas_apos_10": tarde,
            "pct_g4_apos_10": round(100 * g4t / tarde, 1) if tarde else None,
            "ppj": round(sum(l["pontos"] for l in ls) / rod, 2),
            "xg_saldo_pj": (round(sum(l["xg_saldo_pj"] * l["xg_jogos"] for l in xgs)
                                  / sum(l["xg_jogos"] for l in xgs), 2) if xgs else None),
            "valor_elenco_mediano_eur": (st.median([l["valor_elenco_eur"] for l in ls
                                                    if l["valor_elenco_eur"]])
                                         if any(l["valor_elenco_eur"] for l in ls) else None),
        })
    tec.sort(key=lambda t: (-t["pct_g4"], -t["rodadas"]))
    grava("T02_treinador.csv", tec)

    # A prova de que a comparação de faixa rodou, e rodou nos dois cortes de fronteira.
    base_ct, _postos = clube_temporada(tabela)
    grava("T02_testes.csv", tabela_de_testes(base_ct), campos=COLUNAS_TESTES)

    fora = [l for l in linhas if not l["no_ranking"]]
    com_g4 = [t for t in tec if t["no_g4"] > 0]
    repete = [t for t in tec if t["clubes"] >= 2 and t["no_g4"] > 0]
    resumo = {
        "temporadas": sorted(TEMPORADAS), "min_rodadas": MIN_RODADAS,
        "passagens": len(linhas), "no_ranking": len(linhas) - len(fora),
        "fora_do_ranking": len(fora),
        "treinadores_no_ranking": len(tec), "com_alguma_rodada_no_g4": len(com_g4),
        "repetem_g4_em_clubes_diferentes": len(repete),
        "top": tec[:12],
        "repete": [{"treinador": t["treinador"], "clubes": t["clubes"], "pct_g4": t["pct_g4"]}
                   for t in sorted(repete, key=lambda t: -t["pct_g4"])[:10]],
    }
    json.dump(resumo, open(os.path.join(R, "T02_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    numeros = numeros_por_marcador(linhas, por_passagem, tabela)
    json.dump({"gerado_por": "scripts/T02.py", "gerado_em": GERADO_EM, "numeros": numeros},
              open(NUMEROS_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"  T02_numeros.json: {len(numeros)} marcadores")

    print(f"\n{len(linhas)} passagens-temporada · {len(linhas) - len(fora)} no ranking "
          f"(10+ rodadas, sem interino) · {len(fora)} sinalizadas")
    print(f"{len(tec)} treinadores no ranking · {len(com_g4)} com alguma rodada no G4 · "
          f"{len(repete)} com G4 em mais de um clube\n")
    print(f"{'treinador':22s} {'cl':>2s} {'rod':>4s} {'G4':>4s} {'%G4':>6s} {'%G4≥10':>7s} "
          f"{'ppj':>5s} {'xG/j':>6s}")
    for t in tec[:12]:
        print(f"{t['treinador'][:22]:22s} {t['clubes']:2d} {t['rodadas']:4d} {t['no_g4']:4d} "
              f"{t['pct_g4']:6.1f} {(t['pct_g4_apos_10'] or 0):7.1f} {t['ppj']:5.2f} "
              f"{(t['xg_saldo_pj'] if t['xg_saldo_pj'] is not None else 0):6.2f}")


if __name__ == "__main__":
    main()
