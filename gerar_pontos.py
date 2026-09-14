#!/usr/bin/env python3
"""Gera dados/pontos.json — a aba Pontos: as dezesseis etapas do Protótipo com FAIXAS DE
APROVEITAMENTO no lugar de sobe/meio/cai.

## Por que esta aba existe

O dono, em 13/09/2026: "ao invés de pensar somente nos times que subiram, ficaram no meio de
tabela ou caíram, não seria melhor pensar em faixa de pontos? porque às vezes um time que
subiu em um ano fez menos pontos que o quinto colocado em outro ano". A posição final mistura
o time com o ano: o 4º de um campeonato apertado e o 5º de um folgado podem ter jogado a
mesma bola. O aproveitamento não mistura. O Protótipo NÃO sai do ar: esta é outra aba, que
espelha a construção inteira com outra régua, para que as duas possam ser lidas lado a lado.

## A régua, e por que ela é calculada e nunca digitada

    aproveitamento = pts / (3 × J)          J do PAINEL, não 38
    ALTA  = aproveitamento >= média do aproveitamento do 6º colocado em 2022-2025
    BAIXA = aproveitamento <  média do aproveitamento do 15º colocado em 2022-2025
    MÉDIA = o resto

J e não 38 porque há clube-temporada com 37 jogos por buraco da fonte. J do PAINEL e não do
jogo a jogo porque só o painel reproduz os cortes decididos: o jogo a jogo tem 37 jogos para
quatro clubes de 2022-2025 cujo painel diz 38, e contar por ele move o corte baixo.

A comparação é feita em FRAÇÃO EXATA (`fractions.Fraction`). Não é zelo: em ponto flutuante a
média do 6º sai um ulp ACIMA de 61/114 e três times com 61 pontos (Vila Nova 2023, Criciúma
2025, Goiás 2025) caem para a média sem aviso. A contagem que a leitura em float daria vai ao
JSON ao lado da exata, medida nesta rodada, para que ninguém precise acreditar.

## Como este script usa o gerador do Protótipo

Como biblioteca (`import gerar_prototipo as P`), e SEM editá-lo. As funções do gerador leem a
coluna `faixa` com os valores 'sobe'/'meio'/'cai'; aqui a coluna recebe alta→'sobe',
média→'meio', baixa→'cai' numa CÓPIA do painel, e a posição de verdade fica ao lado em
`faixa_posicao`. Na SAÍDA as chaves são renomeadas (sobe→alta, meio→media, cai→baixa,
SM→AM, SC→AB) e `faixas.rotulos` diz à tela o texto de cada faixa.

Onde a auditoria do gerador achou suposição que não vale com faixas de pontos, a função do
gerador é SUBSTITUÍDA por uma daqui (nunca editada lá): carregamento dos dois painéis, corte,
porta temporal com turnos de 37 jogos, etapa 0 (poder com os n medidos), etapa 1 (top-k com k
da alta, 2026 por ritmo), tipologia (eixos e cortes congelados aplicados à alta), etapa 10
(lista fixa), alvos físicos (caro = top-k da alta), teste por atleta refeito nas faixas de
pontos. Onde a etapa muda de natureza, a decisão vai ESCRITA no JSON com o motivo.

## O sorteio

O gerador do Protótipo sorteia por um `rng` global, e cada chamada consome o fluxo na ordem em
que é feita: chamar as funções dele daqui, com grupos de outro tamanho, deslocaria em silêncio
todo número sorteado depois. Por isso cada bloco que sorteia recebe um gerador PRÓPRIO,
`np.random.default_rng([7, n])`, atribuído a `P.rng` imediatamente antes da chamada (ou passado
como argumento, onde a função aceita), e a lista de geradores vai ao JSON.

## Os dois universos

Técnico COLETIVO existe em 2018-2025 (160 clube-temporada); técnico individual, físico e valor
de mercado só em 2022-2025 (80). Cada bloco diz de que universo veio. O posto dentro do ano
neutraliza a diferença de nível entre períodos, mas o valor CRU de indicador sensível a mando
não se junta entre períodos (a vantagem de mando mudou de bloco para bloco): no universo de
160, a faixa em valor cru sai POR BLOCO.

2026 tem 27 de 38 rodadas: aparece só pelo RITMO de hoje, marcado provisório, e nunca entra em
média, corte ou teste. Há `assert` disso.

Uso:
    python3 gerar_pontos.py            # escreve dados/pontos.json
    python3 gerar_pontos.py --rapido   # menos réplicas, para iterar no código
"""
import contextlib
import datetime as dt
import itertools
import json
import math
import os
import re
import sys
import warnings
from fractions import Fraction

import numpy as np
import pandas as pd
from scipy import stats
from sklearn.linear_model import LogisticRegression

import gerar_prototipo as P          # alias P, e não G: o gerador já chama o raio de G
import ranking_gaps as RG

G = P.G
RAIZ = P.RAIZ
SAIDA = os.path.join(RAIZ, "dados", "pontos.json")
SEMENTE = P.SEMENTE

# O gerador lê `--rapido` do sys.argv NA IMPORTAÇÃO; como é o mesmo argv, as réplicas dele
# ficam iguais às desta rodada. O assert garante que ninguém mudou isso por baixo.
RAPIDO = "--rapido" in sys.argv
assert P.RAPIDO == RAPIDO

INTERNO = {"alta": "sobe", "media": "meio", "baixa": "cai"}
ORDEM = ("alta", "media", "baixa")
# Rótulos da tela: saem da PRÓPRIA régua, preenchidos em `rotulos_da_regua` depois dos
# cortes. "Ritmo de briga pelo acesso" punha acesso na cabeça do leitor — o corte é a média
# do 6º, não o G4, e 8 dos 24 da alta não subiram.
ROTULOS = None


def rotulos_da_regua(corte_alto, corte_baixo):
    def pct(x):
        return f"{100 * float(x):.1f}".replace(".", ",") + "%"
    return {"alta": f"aproveitamento ≥ média do 6º colocado ({pct(corte_alto)})",
            "media": "aproveitamento entre os dois cortes",
            "baixa": f"aproveitamento < média do 15º colocado ({pct(corte_baixo)})"}


def potencia_t(d, n1, n2, alfa):
    """Poder do t de duas amostras para efeito d, por integração na distribuição do desvio.

    P(|T| > c) com T = (Z + nc) / sqrt(V/gl), V ~ qui-quadrado(gl): integra-se na V. Não usa
    `stats.nct`, que devolve NaN quando a não-centralidade é grande e o alfa pequeno — e a
    função do Protótipo, ao trocar NaN por 0 ou 1, erra o d mínimo com Bonferroni (24 x 56:
    devolve 1,144 onde o poder de 80% está em 1,176; conferido por simulação nesta obra).
    """
    from scipy import integrate
    gl = n1 + n2 - 2
    c = stats.t.ppf(1 - alfa / 2, gl)
    nc = d * np.sqrt(n1 * n2 / (n1 + n2))

    def f(v):
        s = c * np.sqrt(v / gl)
        return (stats.norm.cdf(nc - s) + stats.norm.cdf(-nc - s)) * stats.chi2.pdf(v, gl)
    return integrate.quad(f, 0, np.inf, limit=200)[0]


def d_minimo_detectavel(n1, n2, alfa=0.05, poder=0.80):
    lo, hi = 0.0, 4.0
    for _ in range(50):
        meio = (lo + hi) / 2
        lo, hi = (lo, meio) if potencia_t(meio, n1, n2, alfa) >= poder else (meio, hi)
    return (lo + hi) / 2
BLOCO_NOVO, BLOCO_VELHO = "2022-2025", "2018-2021"

r, r_sig, rotulo_p, num_br = P.r, P.r_sig, P.rotulo_p, P.num_br
posto_ano, d_cohen, welch_p, bh, auc = P.posto_ano, P.d_cohen, P.welch_p, P.bh, P.auc

GERADORES = {}
abaixo = RG.abaixo


def gerador(nome, *n):
    """Gerador próprio de um bloco, registrado para o JSON."""
    semente = [SEMENTE, *n]
    GERADORES[nome] = f"np.random.default_rng({semente})"
    return np.random.default_rng(semente)


class _RngVigiado:
    """Posto no lugar do `rng` global do Protótipo FORA dos blocos declarados.

    Trocar o `rng` só antes das chamadas que se sabe que sorteiam deixaria o último gerador
    pendurado no módulo: uma função do Protótipo que sorteasse sem ninguém saber consumiria
    dele em silêncio, e o número mudaria com a ordem das chamadas. Com o vigia, qualquer
    sorteio fora de um bloco declarado QUEBRA a rodada — é a prova de que a lista de
    geradores do JSON é completa.
    """
    def __getattr__(self, nome):
        raise RuntimeError(f"o gerador do Protótipo sorteou do rng GLOBAL (.{nome}) fora de um "
                           "bloco com gerador próprio declarado")


P.rng = _RngVigiado()


@contextlib.contextmanager
def rng_do_gerador(nome, *n):
    """Empresta ao Protótipo um gerador PRÓPRIO só durante uma chamada que sorteia do `rng` global.

    A função do Protótipo lê `rng` do módulo na hora da chamada; trocar o objeto antes dela é
    o único jeito de dar gerador próprio a quem não aceita `gen` sem editar o arquivo dele. Na
    saída o vigia volta.
    """
    P.rng = gerador(nome, *n)
    try:
        yield
    finally:
        P.rng = _RngVigiado()


ANO_MAXIMO = 2025


def sem_2026(*dfs):
    for d in dfs:
        assert int(pd.to_numeric(d.ano).max()) <= ANO_MAXIMO, "2026 entrou numa média — 27 de 38 rodadas"


# ══════════════════════════════════════════════════════════════════════════════
#  Bases: os dois painéis, a régua, os dois jogo a jogo
# ══════════════════════════════════════════════════════════════════════════════

def fracao(pts, J):
    return Fraction(int(pts), 3 * int(J))


# A decisão do dono em 13/09 foi tomada olhando estas contagens. Elas são GUARDA: se a base
# mudar e a régua passar a dar outra coisa, o script para em vez de publicar outra aba com o
# mesmo nome.
TAMANHOS_DECIDIDOS = {BLOCO_NOVO: (24, 35, 21), BLOCO_VELHO: (17, 45, 18)}
POR_ANO_DECIDIDO = {2022: (4, 12, 4), 2023: (8, 5, 7), 2024: (6, 9, 5), 2025: (6, 9, 5)}


LINHAS_LIDAS = {}      # preenchido por carregar_paineis: linhas de cada CSV do painel antes de filtro


def carregar_paineis():
    novo = pd.read_csv(os.path.join(RAIZ, "dados", "serieb_clube_temporada.csv"))
    velho = pd.read_csv(os.path.join(RAIZ, "dados", "serieb_clube_temporada_2018_2021.csv"))
    # Linhas LIDAS de cada arquivo, antes de qualquer filtro: é o que `etapa_0.linhas_no_arquivo_por_painel`
    # promete. Até a rodada 4 aquele campo somava os quadros já filtrados (d80 + d26, dv) — hoje dá o mesmo
    # (100 e 80), mas no dia em que uma linha sair num filtro ele deixaria de dizer quantas o arquivo tinha.
    LINHAS_LIDAS.update(painel_2022_2026=len(novo), painel_2018_2021=len(velho))
    d80 = novo[novo.ano <= 2025].copy().reset_index(drop=True)
    d26 = novo[novo.ano > 2025].copy().reset_index(drop=True)
    dv = velho[velho.ano <= 2025].copy().reset_index(drop=True)
    assert len(d80) == 80 and len(dv) == 80, (len(d80), len(dv))
    assert dv.ano.max() < d80.ano.min(), "os dois painéis se sobrepõem"
    sem_2026(d80, dv)
    d80["bloco"], dv["bloco"], d26["bloco"] = BLOCO_NOVO, BLOCO_VELHO, "2026"
    # Cruzeiro 2020: 55 medidos nos jogos, 49 oficiais (punição de 6). O painel de 2022-2026
    # não tem coluna de punição, então lá oficial = medido e isso vai dito.
    dv["pts_oficial"] = dv.pts - dv.punicao_pts
    d80["pts_oficial"], d26["pts_oficial"] = d80.pts, d26.pts

    def media_do_posto(pos):
        g = d80[d80.pos == pos]
        assert len(g) == d80.ano.nunique(), f"posição {pos} não aparece uma vez por ano"
        assert int(g.ano.max()) <= ANO_MAXIMO and int(g.ano.min()) >= 2022, "o corte saiu de fora de 2022-2025"
        fr = [fracao(p, j) for p, j in zip(g.pts, g.J)]
        return sum(fr, Fraction(0)) / len(fr), g

    corte_alto, g6 = media_do_posto(6)
    corte_baixo, g15 = media_do_posto(15)

    def faixa_de(p, j):
        a = fracao(p, j)
        return "alta" if a >= corte_alto else ("baixa" if a < corte_baixo else "media")

    for d in (d80, dv, d26):
        d["aproveitamento"] = [float(fracao(p, j)) for p, j in zip(d.pts, d.J)]
        d["faixa_pts"] = [faixa_de(p, j) for p, j in zip(d.pts, d.J)]
        d["faixa_posicao"] = d.faixa
        d["subiu_de_fato"] = d.faixa == "sobe"
        d["faixa"] = d.faixa_pts.map(INTERNO)        # o valor interno que o gerador lê
    dv["faixa_pts_oficial"] = [faixa_de(p, j) for p, j in zip(dv.pts_oficial, dv.J)]
    assert (dv.faixa_pts_oficial == dv.faixa_pts).all(), \
        "pts medido e pts oficial dão faixas diferentes: a decisão de qual entra precisa ser tomada"

    for bloco, d in ((BLOCO_NOVO, d80), (BLOCO_VELHO, dv)):
        cont = tuple(int((d.faixa_pts == f).sum()) for f in ORDEM)
        assert cont == TAMANHOS_DECIDIDOS[bloco], (bloco, cont)
    for ano, esperado in POR_ANO_DECIDIDO.items():
        g = d80[d80.ano == ano]
        assert tuple(int((g.faixa_pts == f).sum()) for f in ORDEM) == esperado, ano

    # A leitura em float que a auditoria mediu — gravada, não suposta.
    m6_float = float(np.mean((g6.pts / (3 * g6.J)).values))
    m15_float = float(np.mean((g15.pts / (3 * g15.J)).values))
    fl = ["alta" if p / (3 * j) >= m6_float else ("baixa" if p / (3 * j) < m15_float else "media")
          for p, j in zip(d80.pts, d80.J)]
    muda_float = [dict(ano=int(a), clube=c, pts=int(p), J=int(j), exata=e, float_=f)
                  for a, c, p, j, e, f in zip(d80.ano, d80.clube, d80.pts, d80.J, d80.faixa_pts, fl)
                  if e != f]
    regua = dict(
        corte_alto=dict(fracao=f"{corte_alto.numerator}/{corte_alto.denominator}",
                        valor=float(corte_alto), pct=r(100 * float(corte_alto), 3),
                        regra="média do aproveitamento (fração exata) do 6º colocado de cada ano de 2022-2025",
                        sextos=[dict(ano=int(a), clube=c, pts=int(p), J=int(j),
                                     aproveitamento_pct=r(100 * p / (3 * j), 3))
                                for a, c, p, j in zip(g6.ano, g6.clube, g6.pts, g6.J)],
                        pts_minimos_em_38_jogos=int(math.ceil(corte_alto * 114))),
        corte_baixo=dict(fracao=f"{corte_baixo.numerator}/{corte_baixo.denominator}",
                         valor=float(corte_baixo), pct=r(100 * float(corte_baixo), 3),
                         regra="média do aproveitamento (fração exata) do 15º colocado de cada ano de 2022-2025",
                         decimos_quintos=[dict(ano=int(a), clube=c, pts=int(p), J=int(j),
                                               aproveitamento_pct=r(100 * p / (3 * j), 3))
                                          for a, c, p, j in zip(g15.ano, g15.clube, g15.pts, g15.J)],
                         pts_maximos_em_38_jogos_para_baixa=int(math.ceil(corte_baixo * 114)) - 1),
        empate_no_corte=dict(
            tratamento="comparação em fractions.Fraction(pts, 3J) contra a média das frações: "
                       "igualdade exata conta como ALTA (a regra é >=)",
            media_do_6o_em_float=m6_float, media_do_15o_em_float=m15_float,
            contagem_se_fosse_float={f: int(sum(1 for x in fl if x == f)) for f in ORDEM},
            quem_mudaria_em_float=muda_float),
    )
    return d80, dv, d26, regua, (corte_alto, corte_baixo)


def carregar_jogos():
    """Os dois jogo a jogo, com o mesmo filtro de competição e assert POR BLOCO.

    O loader do Protótipo lê só o arquivo de 2022-2025; o de 2018-2021 precisa do mesmo
    filtro e da mesma guarda (mediana 38, 80 clube-temporada) no bloco dele — um assert nos
    160 juntos passaria com um bloco inteiro errado.
    """
    saida = {}
    j_all = pd.read_csv(os.path.join(RAIZ, "dados", "serieb_jogos.csv"), low_memory=False)
    j26 = j_all[(j_all["Competição"] == P.COMP_SERIE_B) & (j_all.ano > 2025)]
    for bloco, j in ((BLOCO_NOVO, j_all),
                     (BLOCO_VELHO, pd.read_csv(os.path.join(RAIZ, "dados", "serieb_jogos_2018_2021.csv"),
                                               low_memory=False))):
        j = j[(j["Competição"] == P.COMP_SERIE_B) & (j.ano <= 2025)].copy()
        j["pts"] = j.resultado.map({"V": 3, "E": 1, "D": 0})
        assert j.pts.notna().all()
        j = j.sort_values(["ano", "Equipa", "Data"]).reset_index(drop=True)
        j["rod"] = j.groupby(["ano", "Equipa"]).cumcount()
        tam = j.groupby(["ano", "Equipa"]).size()
        assert tam.median() == 38 and len(tam) == 80, (bloco, tam.median(), len(tam))
        j["bloco"] = bloco
        saida[bloco] = j
    return saida, j26.groupby(["ano", "Equipa"]).size()


# ══════════════════════════════════════════════════════════════════════════════
#  O bloco `faixas`
# ══════════════════════════════════════════════════════════════════════════════

def perto_do_corte_2026(d26, cortes, jogos26):
    """Quantos pontos (com o J de hoje) cada clube de 2026 precisa ganhar ou perder para trocar de faixa.

    A faixa de 2026 é provisória por ritmo; uma leitura que troca com um empate precisa dizer
    isso em número, não só em "provisório". E o denominador de hoje tem DUAS fontes: o J do
    painel e o número de jogos no jogo a jogo, que em 2026 divergem em alguns clubes (26 contra
    27). Onde divergem, a faixa é recalculada com o J do jogo a jogo e a troca, se houver, vai
    escrita ao lado: é uma segunda razão, além do empate, para a leitura ser provisória.
    """
    alto, baixo = cortes
    nome = {2: "alta", 1: "media", 0: "baixa"}

    def fx(p, j):
        a = fracao(p, j)
        return 2 if a >= alto else (0 if a < baixo else 1)
    out = []
    for c, p, j in zip(d26.clube, d26.pts, d26.J):
        p, j = int(p), int(j)
        f0 = fx(p, j)
        sobe = next((x for x in range(1, 3 * j + 1) if fx(p + x, j) > f0), None) if f0 < 2 else None
        desce = next((x for x in range(1, p + 1) if fx(p - x, j) < f0), None) if f0 > 0 else None
        L = dict(clube=c, pts=p, J_painel=j, pts_a_mais_para_subir_de_faixa=sobe,
                 pts_a_menos_para_descer_de_faixa=desce)
        jj = int(jogos26.get((2026, c), 0))
        L["jogos_no_jogo_a_jogo"] = jj
        if jj and jj != j:
            L["faixa_com_J_do_painel"] = nome[f0]
            L["faixa_com_jogos_do_jogo_a_jogo"] = nome[fx(p, jj)]
            L["aproveitamento_com_jogos_do_jogo_a_jogo_pct"] = r(100 * float(fracao(p, jj)), 2)
            L["troca_de_faixa_conforme_a_fonte_do_J"] = bool(fx(p, jj) != f0)
        out.append(L)
    return out


def bloco_faixas(d80, dv, d26, regua, jogos, jogos26, cortes):
    def por_ano(d):
        return [dict(ano=int(a), **{f: int((g.faixa_pts == f).sum()) for f in ORDEM})
                for a, g in d.groupby("ano")]

    def mudam(d):
        par = {"sobe": "alta", "meio": "media", "cai": "baixa"}
        return [dict(ano=int(a), clube=c, pos=int(p), pts=int(pt), J=int(j),
                     aproveitamento_pct=r(100 * ap, 2), faixa_posicao=fp, faixa_pontos=fx,
                     direcao=f"{fp} por posição, {fx} por pontos")
                for a, c, p, pt, j, ap, fp, fx in zip(d.ano, d.clube, d.pos, d.pts, d.J,
                                                     d.aproveitamento, d.faixa_posicao, d.faixa_pts)
                if par[fp] != fx]

    def jogos_divergentes(d, j):
        tam = j.groupby(["ano", "Equipa"]).size()
        return [dict(ano=int(a), clube=c, J_painel=int(jp), jogos_no_jogo_a_jogo=int(tam.get((a, c), 0)))
                for a, c, jp in zip(d.ano, d.clube, d.J) if int(tam.get((a, c), 0)) != int(jp)]

    def regua_estavel(d, pos):
        g = d[d.pos == pos]
        return r(100 * float(np.mean([float(fracao(p, j)) for p, j in zip(g.pts, g.J)])), 2)

    cruz = dv[dv.punicao_pts != 0]
    n160 = pd.concat([d80, dv])
    perto = perto_do_corte_2026(d26, cortes, jogos26)
    trocam_pelo_J = [x["clube"] for x in perto if x.get("troca_de_faixa_conforme_a_fonte_do_J")]
    faixa26 = dict(zip(d26.clube, d26.faixa_pts))
    assert all(x.get("faixa_com_J_do_painel", faixa26[x["clube"]]) == faixa26[x["clube"]] for x in perto), \
        "a faixa recalculada com o J do painel não bate com a faixa de 2026 do carregamento"
    a_1_ponto = [x["clube"] for x in perto
                 if (x["pts_a_mais_para_subir_de_faixa"] or 99) <= 1 or (x["pts_a_menos_para_descer_de_faixa"] or 99) <= 1]
    return dict(
        regra=("aproveitamento = pts / (3 × J), com pts e J do painel; ALTA = aproveitamento >= "
               "média do 6º colocado de 2022-2025; BAIXA = abaixo da média do 15º colocado de "
               "2022-2025; MÉDIA = o resto"),
        por_que_J_e_nao_38=("há clube-temporada com 37 jogos por buraco da fonte; dividir por 38 "
                            "puniria o clube pelo jogo que a base perdeu"),
        por_que_J_do_painel=("só o J do painel reproduz os cortes decididos; o jogo a jogo diverge "
                             "do painel nos clube-temporada listados em `J_divergente`"),
        rotulos=ROTULOS,
        chave_interna=dict(alta="sobe", media="meio", baixa="cai",
                           motivo=("as funções do gerador do Protótipo leem a coluna `faixa` com "
                                   "estes valores; a saída já vem renomeada para alta/media/baixa")),
        cortes=regua,
        tamanhos=dict(
            fisico_tecnico_individual_valor_2022_2025=dict(
                universo="80 clube-temporada de 2022-2025",
                **{f: int((d80.faixa_pts == f).sum()) for f in ORDEM}, por_ano=por_ano(d80)),
            tecnico_coletivo_2018_2021=dict(
                universo="80 clube-temporada de 2018-2021",
                **{f: int((dv.faixa_pts == f).sum()) for f in ORDEM}, por_ano=por_ano(dv)),
            tecnico_coletivo_2018_2025=dict(
                universo="160 clube-temporada de 2018-2025",
                **{f: int((n160.faixa_pts == f).sum()) for f in ORDEM})),
        quem_muda_de_grupo=dict(
            regra="sobe↔alta, meio↔media, cai↔baixa; lista quem não bate",
            **{BLOCO_NOVO: mudam(d80), BLOCO_VELHO: mudam(dv)}),
        regua_estavel=[dict(bloco=b, aproveitamento_medio_pct={f"{p}o": regua_estavel(d, p)
                                                               for p in (4, 6, 15, 17)})
                       for b, d in ((BLOCO_NOVO, d80), (BLOCO_VELHO, dv))],
        pts_oficial=dict(
            entra="pts medido nos jogos (coluna pts do painel)",
            motivo=("a régua foi decidida sobre a coluna pts; a punição é administrativa e não "
                    "é jogo jogado. As duas leituras dão a mesma faixa (assert no carregamento)"),
            casos=[dict(ano=int(a), clube=c, pts_medido=int(p), punicao=int(pu),
                        pts_oficial=int(po), faixa_medida=f1, faixa_oficial=f2)
                   for a, c, p, pu, po, f1, f2 in zip(cruz.ano, cruz.clube, cruz.pts, cruz.punicao_pts,
                                                     cruz.pts_oficial, cruz.faixa_pts,
                                                     cruz.faixa_pts_oficial)],
            painel_2022_2026="sem coluna de punição: pts oficial = pts medido"),
        J_divergente={BLOCO_NOVO: jogos_divergentes(d80, jogos[BLOCO_NOVO]),
                      BLOCO_VELHO: jogos_divergentes(dv, jogos[BLOCO_VELHO])},
        ano_2026=dict(
            provisorio=True, entra_em_media_corte_ou_teste=False,
            rodadas_no_painel=sorted({int(x) for x in d26.J}),
            rodadas_da_temporada_completa=int(d80.J.median()),
            regra=("o mesmo corte de 2022-2025 aplicado ao aproveitamento de hoje (pts / 3J com J "
                   "do painel): é o RITMO, não a faixa do fim da temporada"),
            **{f: int((d26.faixa_pts == f).sum()) for f in ORDEM},
            clubes=[dict(clube=c, pos_hoje=int(p), pts=int(pt), J_painel=int(j),
                         jogos_no_jogo_a_jogo=int(jogos26.get((2026, c), 0)),
                         aproveitamento_pct=r(100 * ap, 2), faixa_por_ritmo=fx,
                         faixa_posicao_hoje=fp)
                    for c, p, pt, j, ap, fx, fp in sorted(
                        zip(d26.clube, d26.pos, d26.pts, d26.J, d26.aproveitamento,
                            d26.faixa_pts, d26.faixa_posicao), key=lambda t: t[1])],
            perto_do_corte=dict(
                regra=("pontos a mais (ou a menos) com o J de hoje para trocar de faixa pela régua exata; "
                       "null = já está na faixa de cima (ou de baixo)"),
                clubes=perto, a_ate_1_ponto_de_um_corte=len(a_1_ponto), quem_esta_a_ate_1_ponto=a_1_ponto,
                J_divergente_entre_painel_e_jogo_a_jogo=sum(1 for x in perto if "faixa_com_J_do_painel" in x),
                trocam_de_faixa_conforme_a_fonte_do_J=len(trocam_pelo_J),
                quem_troca_de_faixa_conforme_a_fonte_do_J=trocam_pelo_J,
                contagem_com_jogos_do_jogo_a_jogo={f: sum(1 for x in perto if x.get(
                    "faixa_com_jogos_do_jogo_a_jogo", faixa26[x["clube"]]) == f) for f in ORDEM},
                regra_da_fonte_do_J=("onde o J do painel e os jogos do jogo a jogo divergem, a faixa é "
                                     "recalculada com os jogos do jogo a jogo; a faixa oficial desta aba "
                                     "segue a do J do painel (é a que reproduz os cortes decididos)"))),
        lista_de_resultado_versao=RG.VERSAO_DAS_LISTAS,
    )


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 7 — porta temporal com o turno partido pelo número REAL de jogos
# ══════════════════════════════════════════════════════════════════════════════

def porta_temporal(jog, meta, universo):
    """1º turno contra 2º turno, com o turno partido pelo meio do número real de jogos.

    O gerador do Protótipo parte em `rod < 19` e soma pontos: um clube com 37 jogos no
    arquivo fica com 18 no 2º turno e os pontos dele saem um jogo curtos. Aqui o 1º turno é
    `ceil(n/2)` jogos e o desfecho é o APROVEITAMENTO de cada turno, que não depende de quantos
    jogos cada um teve. Para os clubes com 38 o posto dentro do ano é o mesmo da soma.
    """
    j = jog
    sem_2026(j)
    n = j.groupby(["ano", "Equipa"]).rod.transform("size")
    t1 = (j.rod < np.ceil(n / 2)).values
    k = ["ano", "Equipa"]
    g1, g2 = j[t1].groupby(k), j[~t1].groupby(k)
    base = pd.concat([g1.pts.sum().rename("pts1"), g1.size().rename("n1"),
                      g2.pts.sum().rename("pts2"), g2.size().rename("n2")], axis=1).reset_index()
    base = base.rename(columns={"Equipa": "clube"})
    base["ap1"] = base.pts1 / (3 * base.n1)
    base["ap2"] = base.pts2 / (3 * base.n2)
    base["r1"], base["r2"] = posto_ano(base, "ap1"), posto_ano(base, "ap2")
    linhas = []
    for ind, m in meta.items():
        col = m.get("jogo")
        if not col or col not in j.columns:
            continue
        assert col not in RG.PLACAR_JOGO, f"coluna de placar usada como indicador: {col}"
        v = pd.to_numeric(j[col], errors="coerce")
        m1 = (pd.DataFrame(dict(ano=j.ano, clube=j.Equipa, v=v))[t1]
              .groupby(["ano", "clube"]).v.mean().rename("v1").reset_index())
        t = base.merge(m1, on=["ano", "clube"])
        t["rv"] = posto_ano(t, "v1")
        rho, p = stats.spearmanr(t.rv, t.r2)
        pr, pp = P.parcial_spearman(t.rv, t.r2, t.r1)
        # p por algarismo significativo (r_sig): em 4 casas um p de 1e-6 virava 0, e p nunca é zero
        linhas.append(dict(indicador=ind, n=len(t), rho_bruto=r(rho, 3), p_bruto=r_sig(p, 3),
                           rho_parcial=r(pr, 3), p_parcial=r_sig(pp, 3), sinal=m["sinal"],
                           sinal_certo=bool(m["sinal"] and np.isfinite(pr)
                                            and np.sign(pr) == np.sign(m["sinal"]))))
    linhas.sort(key=lambda x: -abs(x["rho_parcial"] or 0))
    ref = stats.spearmanr(base.r1, base.r2)
    turnos = base.groupby(["n1", "n2"]).size()
    return dict(universo=universo, n=len(base),
                regra_do_turno="1º turno = os primeiros ceil(n/2) jogos por data; 2º turno = o resto",
                jogos_por_turno_resumo=dict(jogos_1t_min=int(base.n1.min()), jogos_1t_max=int(base.n1.max()),
                                            jogos_2t_min=int(base.n2.min()), jogos_2t_max=int(base.n2.max())),
                desfecho="aproveitamento do 2º turno (pts / 3 × jogos do turno), em posto no ano",
                jogos_por_turno=[dict(jogos_1t=int(a), jogos_2t=int(b), clube_temporada=int(c))
                                 for (a, b), c in turnos.items()],
                referencia_ap1t_x_ap2t=dict(
                    rho=r(ref.statistic, 3), p=r_sig(ref.pvalue, 3),
                    **RG.referencia_de_resultado(
                        ["ap1t", "ap2t"],
                        "é o quanto o aproveitamento do 1º turno já prediz o do 2º: a referência que o ρ "
                        "parcial de cada linha desconta, não achado sobre faixa nenhuma")),
                linhas=linhas)


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 0
# ══════════════════════════════════════════════════════════════════════════════

def etapa_0(d80, dv, d26, meta, n_tecnico_col, funil):
    J_completa = int(d80.J.median())
    por_ano = []
    for d in (dv, d80, d26):
        for ano, g in d.groupby("ano"):
            por_ano.append(dict(ano=int(ano), bloco=g.bloco.iloc[0], n=len(g),
                                J=int(g.J.median()), completa=bool(g.J.median() == J_completa),
                                **{f: int((g.faixa_pts == f).sum()) for f in ORDEM},
                                faixa_provisoria=bool(ano > 2025),
                                # `entra_nas_medias` guarda o sentido que tinha no Protótipo: a
                                # linha está no universo das 80 de 2022-2025 (físico, técnico
                                # individual e valor). Com True em 2018-2021 o renderer somava os
                                # oito anos como anos do estudo (41/80/39). O universo das 160 do
                                # técnico coletivo tem flag próprio.
                                entra_nas_medias=bool(2022 <= ano <= 2025),
                                entra_no_universo_80_2022_2025=bool(2022 <= ano <= 2025),
                                entra_no_universo_160_tecnico_coletivo=bool(ano <= 2025),
                                universos=(["técnico coletivo"] if ano < 2022 else
                                           ["técnico coletivo", "técnico individual", "físico",
                                            "valor de mercado"] if ano <= 2025 else [])))

    def poder(d, testes, rotulo):
        n = {f: int((d.faixa_pts == f).sum()) for f in ORDEM}
        out = dict(universo=rotulo, n=n, testes_na_correcao_bonferroni=testes, alfa=0.05, poder=0.80,
                   formula=("menor d com poder >= 0,80 no t de duas amostras bilateral; alfa = 0,05 sem "
                            "correção e 0,05/testes com Bonferroni; poder por integração na qui-quadrado "
                            "(a MESMA fórmula nas duas colunas)"))
        for nome, a, b in (("alta_x_media", n["alta"], n["media"]),
                           ("alta_x_baixa", n["alta"], n["baixa"]),
                           ("alta_x_resto", n["alta"], n["media"] + n["baixa"]),
                           ("baixa_x_resto", n["baixa"], n["alta"] + n["media"])):
            out[nome] = dict(n1=a, n2=b, d_minimo=r(d_minimo_detectavel(a, b), 3),
                             d_minimo_bonferroni=r(d_minimo_detectavel(a, b, alfa=0.05 / testes), 3),
                             d_minimo_bonferroni_pela_funcao_do_prototipo=r(
                                 P.d_minimo_detectavel(a, b, alfa=0.05 / testes), 3))
        return out

    def universo_do_topo(d, fontes):
        # clubes_distintos e aparicoes_por_clube moram DENTRO do universo (fechamento, 14/09): até aqui saíam só
        # de d80 e ficavam soltos no topo, ao lado de `linhas_completas_dos_dois_periodos` (160) — o mesmo erro
        # que tirou `linhas_completas` do topo — e a contagem de 2018-2021 não existia em lugar nenhum.
        clubes = d.clube.value_counts()
        out = dict(linhas_completas=len(d), anos=sorted(int(a) for a in d.ano.unique()), fontes=fontes,
                   **{f: int((d.faixa_pts == f).sum()) for f in ORDEM},
                   clubes_distintos=int(d.clube.nunique()),
                   aparicoes_por_clube={str(k): int(v) for k, v in clubes.value_counts().sort_index().items()})
        assert sum(out[f] for f in ORDEM) == out["linhas_completas"], ("a partição das faixas não fecha", out)
        # cada clube aparece k vezes: a soma de k × (clubes com k aparições) tem de dar as linhas do universo
        assert sum(int(k) * v for k, v in out["aparicoes_por_clube"].items()) == out["linhas_completas"], out
        assert int(d.ano.max()) <= ANO_MAXIMO
        return out

    d160 = pd.concat([d80, dv])
    return dict(
        titulo_chave="etapa_0",
        estado_nesta_aba="adaptada",
        o_que_mudou=("tamanhos das faixas variam por ano; o poder sai dos n MEDIDOS, por universo, "
                     "e o número de testes do Bonferroni é o tamanho do catálogo, não um número digitado"),
        # O topo é separado POR UNIVERSO. Até 14/09 ele trazia linhas_completas = 160 ao lado de
        # alta/media/baixa das 80 (24 + 35 + 21): quem dividisse a alta pelas completas escreveria
        # "15% do que se compara", quando são 30% nas 80. Cada contagem de faixa agora mora ao lado das
        # completas do mesmo universo, com assert de que a partição fecha.
        linhas_no_arquivo_por_painel=dict(
            painel_2022_2026=LINHAS_LIDAS["painel_2022_2026"], painel_2018_2021=LINHAS_LIDAS["painel_2018_2021"],
            usadas=dict(painel_2022_2026=len(d80) + len(d26), painel_2018_2021=len(dv)),
            regra=("linhas lidas de cada CSV antes de qualquer filtro; `usadas` são as que ficaram depois do filtro "
                   "de ano (2026 está no painel 2022-2026 e fica fora das médias)")),
        universo_80_2022_2025=universo_do_topo(d80, "físico, técnico individual, valor de mercado e técnico coletivo"),
        universo_2018_2021=universo_do_topo(dv, "só técnico coletivo (as outras fontes não existem antes de 2022)"),
        linhas_completas_dos_dois_periodos=dict(
            n=len(d80) + len(dv),
            uso=("só o técnico coletivo junta os dois períodos (ranking dentro do ano); nenhuma contagem de faixa "
                 "deste topo se divide por este número")),
        por_ano=por_ano,
        rodadas_2026=int(d26.J.median()), rodadas_completa=J_completa,
        poder=dict(
            fisico_tecnico_individual_valor_2022_2025=poder(
                d80, len(meta), "80 clube-temporada de 2022-2025; testes = indicadores do catálogo"),
            tecnico_coletivo_2018_2025=poder(
                d160, n_tecnico_col, "160 clube-temporada de 2018-2025; testes = indicadores técnicos coletivos"),
            tecnico_coletivo_2018_2021=poder(
                dv, n_tecnico_col, "80 clube-temporada de 2018-2021")),
        indicadores_pre_declarados=len(meta),
        indicadores_por_familia={f: sum(1 for m in meta.values() if m["familia"] == f)
                                 for f in sorted({m["familia"] for m in meta.values()})},
        funil_candidatos=funil,
    )


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 1
# ══════════════════════════════════════════════════════════════════════════════

def etapa_1(d80, d26, jogos26):
    """A linha de base do dinheiro, com a faixa ALTA no lugar de quem subiu.

    Três trocas que a auditoria pediu e que não são de rótulo: (1) o "top-4 de valor" vira
    top-k com k = tamanho da alta NAQUELE ano (4/8/6/6), e o esperado por acaso é a soma de
    k·K/N por ano — com 24 na alta, 24×4/20 seria outra conta; (2) o palpite do dono ("14 dos
    16 no top-8") é pergunta da aba de posição e não é reaplicado; (3) 2026 é classificado
    pelo ritmo de hoje com o corte de 2022-2025, e nunca entra no ajuste.
    """
    d = d80.copy()
    sem_2026(d)
    d["r_val"] = posto_ano(d, "tm_valor_total")
    d["y"] = (d.faixa_pts == "alta").astype(int)
    d["posto_valor"] = d.groupby("ano").tm_valor_total.rank(ascending=False, method="min")

    q = pd.qcut(d.r_val, 4, labels=[1, 2, 3, 4])
    quartis = [dict(quartil=int(lab), n=len(g), na_alta=int(g.y.sum()),
                    taxa_de_alta_pct=r(100 * g.y.mean(), 1),
                    subiram_de_fato=int(g.subiu_de_fato.sum()),
                    taxa_de_subida_real_pct=r(100 * g.subiu_de_fato.mean(), 1),
                    valor_mediano_eur=r(g.tm_valor_total.median(), 0))
               for lab, g in d.groupby(q, observed=True)]

    # a curva do gerador, com y = alta; o palpite do dono sai (ver docstring)
    curva = P.curva_top_k(d)
    curva.pop("palpite_do_dono")
    # O aviso do Protótipo é montado em volta do k=8 do palpite (degrau 8→9). Aqui não há
    # palpite, então o aviso é refeito para a curva INTEIRA, lendo o dado: quais postos não têm
    # nenhum time da alta e onde está o maior degrau.
    aviso_proto = curva.pop("aviso_de_amostra")
    por_posto = curva["promovidos_por_posto"]
    degraus = [(L["k"], L["promovidos_acumulados"] - (curva["curva"][i - 1]["promovidos_acumulados"] if i else 0))
               for i, L in enumerate(curva["curva"])]
    k_maior, maior = max(degraus, key=lambda t: (t[1], -t[0]))
    n_anos = len(curva["anos"])
    aviso = dict(
        reaplicado_do_prototipo=False,
        motivo_de_nao_reaplicar=("o aviso do Protótipo olha o degrau entre k=8 e k=9 do palpite de 14 dos 16; "
                                 "sem o palpite, o aviso é refeito para a curva inteira"),
        chaves_do_aviso_do_prototipo_nao_reaplicadas=None,           # preenchidas abaixo, medindo
        postos_sem_nenhum_da_alta=[x["posto"] for x in por_posto if x["promovidos"] == 0],
        maior_degrau=dict(k=k_maior, times=maior),
        anos_na_amostra=n_anos, maximo_possivel_por_posto=n_anos,
        leitura=("cada posto k acrescenta de 0 a %d times (um por ano); o maior degrau é de %d time(s), no "
                 "posto %d: com %d anos a curva sobe em degraus de amostra, e nenhum degrau isolado é "
                 "fronteira de valor" % (n_anos, maior, k_maior, n_anos)))
    # Quais chaves do aviso do Protótipo NÃO voltam, medido contra o aviso refeito: uma chave que existe
    # aqui não pode ser dada como "não reaplicada" (a conferência de 14/09 achou `leitura` e
    # `anos_na_amostra` listadas assim ao lado delas mesmas).
    aviso["chaves_do_aviso_do_prototipo_nao_reaplicadas"] = sorted(k for k in aviso_proto if k not in aviso)
    aviso["chaves_com_mesmo_nome_e_mesmo_valor"] = sorted(k for k in aviso_proto if k in aviso
                                                          and aviso_proto[k] == aviso[k])
    aviso["chaves_com_mesmo_nome_e_outro_conteudo"] = sorted(k for k in aviso_proto if k in aviso
                                                             and aviso_proto[k] != aviso[k])
    sub_real = {(a, c): bool(s) for a, c, s in zip(d.ano, d.clube, d.subiu_de_fato)}
    ren = {"promovidos_no_posto_k": "alta_no_posto_k", "promovidos_acumulados": "alta_acumulados",
           "pct_dos_promovidos": "pct_da_alta", "taxa_de_subida_no_top_k_pct": "taxa_de_alta_no_top_k_pct"}
    postos_sub = d.posto_valor[d.subiu_de_fato].values
    for L in curva["curva"]:
        for a, b in ren.items():
            L[b] = L.pop(a)
        L["subiram_de_fato_acumulados"] = int((postos_sub <= L["k"]).sum())
    curva["alta_total"] = curva.pop("promovidos_total")
    curva["alta_por_ano"] = curva.pop("promovidos_por_ano")
    curva["alta_por_posto"] = [dict(posto=x["posto"], na_alta=x["promovidos"])
                               for x in curva.pop("promovidos_por_posto")]
    curva["membros_da_alta"] = [dict(**x, subiu_de_fato=sub_real[(x["ano"], x["clube"])])
                                for x in curva.pop("promovidos")]
    curva["aviso_de_amostra"] = aviso
    curva["modelo_do_acaso"] = ("hipergeométrica por ano (N clubes, K da faixa alta naquele ano, k "
                                "sorteados), convoluída nos anos; p = P(soma >= acumulado medido)")
    curva["palpite_do_dono"] = dict(
        reaplicado=False,
        motivo=("'14 dos 16 no top-8' é pergunta sobre os 16 que subiram, da aba de posição; com "
                "%d na alta e tamanhos %s por ano o limiar 14 não tem sentido, e escolher outro "
                "limiar depois de ver a curva seria ajustar a pergunta ao dado. A curva inteira "
                "fica, sem limiar" % (int(d.y.sum()), "/".join(str(x) for x in curva["alta_por_ano"]))))

    # top-k de valor com k = tamanho da alta no ano
    por_ano, acertos, esperado = [], 0, 0.0
    for a, g in d.groupby("ano"):
        k = int(g.y.sum())
        top = list(g.nlargest(k, "tm_valor_total").clube)
        alta = set(g.clube[g.y == 1])
        ac = len(set(top) & alta)
        acertos += ac
        esperado += k * k / len(g)
        por_ano.append(dict(ano=int(a), k=k, acertos=ac, top_k=top, esperado_por_acaso=r(k * k / len(g), 2)))
    top_k = dict(regra="top-k de valor do ano, com k = tamanho da faixa alta naquele ano",
                 acertos=int(acertos), de=int(d.y.sum()), esperado_por_acaso=r(esperado, 2),
                 formula_do_esperado="soma, por ano, de k × K / N (k = K = tamanho da alta)",
                 por_ano=por_ano)

    pred = np.full(len(d), np.nan)
    for ano in sorted(d.ano.unique()):
        tr, te = d.ano != ano, d.ano == ano
        mod = LogisticRegression(max_iter=1000).fit(d.loc[tr, ["r_val"]], d.loc[tr, "y"])
        pred[te.values] = mod.predict_proba(d.loc[te, ["r_val"]])[:, 1]
    d["pred"] = pred
    fx = d.faixa_pts.values

    # 2026 por ritmo
    d26 = d26.copy()
    d26["r_val"] = posto_ano(d26, "tm_valor_total")
    y26 = (d26.faixa_pts == "alta").values
    if len(d26) < 10 or not pd.to_numeric(d26.tm_valor_total, errors="coerce").notna().any():
        fora = dict(existe=False, motivo="não há linha de 2026 com valor de mercado no painel")
    else:
        mod26 = LogisticRegression(max_iter=1000).fit(d[["r_val"]], d["y"])
        assert d.ano.max() <= 2025
        p26 = mod26.predict_proba(d26[["r_val"]])[:, 1]
        k26 = int(y26.sum())
        top26 = list(d26.nlargest(k26, "tm_valor_total").clube)
        J26 = sorted({int(x) for x in d26.J})
        jj = sorted({int(jogos26.get((2026, c), 0)) for c in d26.clube})
        fora = dict(
            existe=True, ano=2026, n=len(d26), J_painel=J26, jogos_no_jogo_a_jogo=jj,
            rodadas_completa=int(d.J.median()), ajustado_em=BLOCO_NOVO, ajustado_n=len(d),
            faixa_provisoria=True, entra_nas_medias=False,
            motivo_provisoria=("2026 tem %s de %d rodadas no painel (%s jogos no jogo a jogo): a "
                               "faixa é o RITMO de hoje com o corte de 2022-2025, não a faixa do fim"
                               % ("/".join(map(str, J26)), int(d.J.median()), "/".join(map(str, jj)))),
            **{f"na_{f}": int((d26.faixa_pts == f).sum()) for f in ORDEM},
            auc_alta_x_resto=r(auc(p26[y26], p26[~y26]), 3),
            auc_alta_x_media=r(auc(p26[y26], p26[(d26.faixa_pts == "media").values]), 3),
            auc_alta_x_baixa=r(auc(p26[y26], p26[(d26.faixa_pts == "baixa").values]), 3),
            top_k_de_valor=dict(k=k26, acertos=len(set(top26) & set(d26.clube[y26])),
                                esperado_por_acaso=r(k26 * k26 / len(d26), 2), top_k=top26,
                                alta_por_ritmo=list(d26.clube[y26])))

    # controle: quanta gente o clube usou
    d["r_at"] = posto_ano(d, "fis_atletas")
    at = d.fis_atletas.values.astype(float)
    m = {f: fx == f for f in ORDEM}
    rho_pos, p_pos = stats.spearmanr(d.fis_atletas, d.pos)
    rho_ap, p_ap = stats.spearmanr(d.fis_atletas, d.aproveitamento)
    rho_dim, p_dim = stats.spearmanr(d.r_at, d.r_val)
    controle = dict(
        coluna="fis_atletas", n=int(np.isfinite(at).sum()),
        **{f"media_{f}": r(np.nanmean(at[m[f]]), 2) for f in ORDEM},
        d_AM=r(d_cohen(at[m["alta"]], at[m["media"]]), 3), p_AM=r_sig(welch_p(at[m["alta"]], at[m["media"]]), 3),
        d_AB=r(d_cohen(at[m["alta"]], at[m["baixa"]]), 3), p_AB=r_sig(welch_p(at[m["alta"]], at[m["baixa"]]), 3),
        rho_com_aproveitamento=r(rho_ap, 3), p_com_aproveitamento=r_sig(p_ap, 3),
        rho_com_posicao_final=r(rho_pos, 3), p_com_posicao_final=r_sig(p_pos, 3),
        rotulo_do_rho_com_posicao="posição final (1 = campeão): sinal oposto ao do aproveitamento",
        rho_posto_atletas_x_posto_valor=r(rho_dim, 3), p_atletas_x_valor=r(p_dim, 4),
        por_setor=[dict(setor=s, coluna=f"fis_{s}_atletas",
                        **{f"media_{f}": r(np.nanmean(d[f"fis_{s}_atletas"].values[m[f]]), 2) for f in ORDEM},
                        d_AM=r(d_cohen(d[f"fis_{s}_atletas"].values[m["alta"]],
                                       d[f"fis_{s}_atletas"].values[m["media"]]), 3),
                        p_AM=r(welch_p(d[f"fis_{s}_atletas"].values[m["alta"]],
                                       d[f"fis_{s}_atletas"].values[m["media"]]), 5))
                   for s in P.SETORES],
        entra_como="controle na coluna d_liq2 das linhas físicas da etapa 2",
        nao_entra_como="indicador: não é característica de jogo, é tamanho de rodízio")

    caliper = []
    for c in (0.10, 0.15, 0.20):
        com, ctr = 0, []
        for _, g in d.groupby("ano"):
            for v in g.r_val[g.faixa_pts == "alta"]:
                k = int(((g.faixa_pts != "alta") & (abs(g.r_val - v) <= c * 100)).sum())
                com += k > 0
                ctr.append(k)
        caliper.append(dict(caliper=c, alta_com_controle=int(com), de=int(d.y.sum()),
                            controles_medios=r(np.mean(ctr), 2)))
    cob = d.tm_com_valor / d.plantel
    return dict(
        titulo_chave="etapa_1", estado_nesta_aba="adaptada",
        o_que_mudou=("y = faixa alta (inclui quem não subiu); top-k com k da alta por ano e esperado "
                     "somado por ano; o palpite de 14 dos 16 não é reaplicado; 2026 por ritmo; "
                     "ρ do nº de atletas com o aproveitamento contínuo ao lado do da posição"),
        n=len(d), quartis=quartis, curva_top_k=curva,
        valor_por_setor=P.valor_por_setor(d),
        top_k_de_valor=top_k,
        auc_posto_de_valor=dict(
            alta_x_resto=r(auc(d.r_val[d.y == 1], d.r_val[d.y == 0]), 3),
            alta_x_media=r(auc(d.r_val[fx == "alta"], d.r_val[fx == "media"]), 3),
            alta_x_baixa=r(auc(d.r_val[fx == "alta"], d.r_val[fx == "baixa"]), 3),
            loso_alta_x_resto=r(auc(d.pred[d.y == 1], d.pred[d.y == 0]), 3),
            eventos_por_parametro=r(d.y.sum() / 2, 1), regra_pratica=10,
            leitura_da_faixa=("a alta inclui %d clube-temporada que não subiram; AUC alta x resto não "
                              "é chance de acesso" % int((d.y.astype(bool) & ~d.subiu_de_fato).sum()))),
        cobertura_do_valor=dict(
            tm_com_valor_mediana=r(d.tm_com_valor.median(), 1),
            pct_do_plantel_min=r(100 * cob.min(), 1), pct_do_plantel_max=r(100 * cob.max(), 1),
            pct_do_plantel_mediana=r(100 * cob.median(), 1),
            rho_cobertura_x_valor=r(stats.spearmanr(cob, d.r_val).statistic, 3),
            p_cobertura_x_valor=r_sig(stats.spearmanr(cob, d.r_val).pvalue, 3),
            p_cobertura_x_valor_rotulo=rotulo_p(stats.spearmanr(cob, d.r_val).pvalue)),
        fora_da_amostra_2026=fora,
        controle_n_atletas=controle,
        caliper=caliper,
        controles_disponiveis_por_ano=[dict(ano=int(a), fora_da_alta=int((g.faixa_pts != "alta").sum()))
                                       for a, g in d.groupby("ano")],
    )


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 8 — tipologia com eixos e cortes CONGELADOS, aplicada à alta
# ══════════════════════════════════════════════════════════════════════════════

LIMITE_EXATO = 3_000_000       # partições; acima disso, Monte Carlo com erro publicado
N_MC_EXATO = 200_000


def ler_cortes_congelados():
    txt = open(os.path.join(RAIZ, "_fonte", "prototipo", "CONGELADO_2022_2025.md"), encoding="utf-8").read()
    return {"TERRITORIO": float(re.search(r"CORTE_TERRITORIO\s*=\s*([\d.]+)", txt).group(1)),
            "ROTA": float(re.search(r"CORTE_ROTA\s*=\s*([\d.]+)", txt).group(1))}


def eta2_lote(M, Gm, k):
    """eta² de cada coluna de M para cada rotulagem de Gm, de uma vez.

    M (n × p) com NaN; Gm (R × n) inteiros 0..k-1. Mesma definição do `eta2` do gerador
    (buraco fora da conta; NaN com menos de 2 grupos presentes, menos de 4 valores ou
    variância zero), feita com somas matriciais para que a enumeração EXATA com 24 times
    caiba em segundos — em Python puro seriam horas.
    """
    M = np.asarray(M, float)
    F = np.isfinite(M)
    Ff = F.astype(float)
    X = np.where(F, M, 0.0)
    n_j = Ff.sum(0)
    with np.errstate(invalid="ignore", divide="ignore"):
        m_j = X.sum(0) / n_j
        ss = np.where(F, (M - m_j) ** 2, 0.0).sum(0)
        entre = np.zeros((Gm.shape[0], M.shape[1]))
        presentes = np.zeros((Gm.shape[0], M.shape[1]))
        for g in range(k):
            L = (Gm == g).astype(float)
            c = L @ Ff
            s = L @ X
            mg = np.where(c > 0, s / np.maximum(c, 1), 0.0)
            entre += np.where(c > 0, c * (mg - m_j) ** 2, 0.0)
            presentes += c > 0
        e = entre / ss
    invalido = (presentes < 2) | (n_j < 4)[None, :] | (ss == 0)[None, :]
    return np.where(invalido, np.nan, e)


def eta2_medio_lote(M, Gm, k):
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", RuntimeWarning)
        return np.nanmean(eta2_lote(M, Gm, k), axis=1)


def p_um_contra_o_resto(M, alvo, gen):
    """p exato (todas as C(n,k) rotulagens) quando cabe; Monte Carlo com IC quando não."""
    alvo = np.asarray(alvo, bool)
    n, k = len(alvo), int(alvo.sum())
    obs = float(eta2_medio_lote(M, alvo.astype(int)[None, :], 2)[0])
    total = math.comb(n, k)
    if total <= LIMITE_EXATO:
        acima = 0
        it = itertools.combinations(range(n), k)
        while True:
            bloco = list(itertools.islice(it, 200_000))
            if not bloco:
                break
            Gm = np.zeros((len(bloco), n), np.int8)
            np.put_along_axis(Gm, np.array(bloco), 1, axis=1)
            acima += int((eta2_medio_lote(M, Gm, 2) >= obs - 1e-12).sum())
        return dict(eta2_medio=r(obs, 3), metodo=f"exato ({total} partições)", particoes=total,
                    particoes_acima_ou_iguais=acima, p=r(acima / total, 5))
    Gm = np.array([gen.permutation(alvo.astype(int)) for _ in range(N_MC_EXATO)])
    acima = int((eta2_medio_lote(M, Gm, 2) >= obs - 1e-12).sum())
    lo = 0.0 if acima == 0 else float(stats.beta.ppf(0.025, acima, N_MC_EXATO - acima + 1))
    hi = 1.0 if acima == N_MC_EXATO else float(stats.beta.ppf(0.975, acima + 1, N_MC_EXATO - acima))
    return dict(eta2_medio=r(obs, 3), metodo=f"Monte Carlo ({N_MC_EXATO} de {total} partições)",
                particoes=total, replicas=N_MC_EXATO, acima_ou_iguais=acima,
                p=r((1 + acima) / (N_MC_EXATO + 1), 5), p_ic95_clopper_pearson=[r(lo, 5), r(hi, 5)])


def tipologia_congelada(d80, postos, jog):
    """A tipologia do Protótipo — os MESMOS dois eixos e os MESMOS dois cortes — aplicada à alta.

    DECISÃO (e o motivo): reconstruir a tipologia nos 24 da alta seria outro estudo, com eixos
    e cortes escolhidos depois de ver outro grupo, sem congelamento e sem teste cego. Por isso
    os eixos são os de `DECL['tipologia']` e os cortes são as medianas dos 16 que SUBIRAM em
    2022-2025 — recalculadas aqui e conferidas contra os valores gravados em
    `CONGELADO_2022_2025.md` antes de qualquer uso. O que muda é quem é classificado: os 24 da
    faixa alta. É tipologia EXPLORATÓRIA com eixos herdados, e nenhum p do teste cego de
    2018-2021 se aplica a ela.

    A enumeração exata do um-contra-o-resto passa de C(16,5)=4.368 para C(24,k), que em
    Python puro seria horas; aqui ela é vetorizada (`eta2_lote`) e continua EXATA até
    `LIMITE_EXATO` partições. O motor é conferido contra `P.p_exato_binario` num caso pequeno
    do próprio Protótipo, dentro desta função, a cada rodada.
    """
    gen = gerador("tipologia", 8)
    d = d80.reset_index(drop=True)
    alta = d.index[d.faixa_pts == "alta"].values
    sobe16 = d.index[d.subiu_de_fato].values
    decl = P.DECL["tipologia"]
    eixo_nomes = list(decl)
    terr, rota = eixo_nomes
    usadas = {c for comp in decl.values() for c, _ in comp}
    assert not any(RG.e_resultado(c) for c in usadas), "eixo da tipologia é pedaço do resultado"

    def eixo_tip(comp, Pc):
        return np.nanmean(np.column_stack([Pc[c] if s > 0 else 100 - Pc[c] for c, s in comp]), axis=1)

    Pc = {c: postos[c].values for c in postos.columns}
    V = {e: eixo_tip(decl[e], Pc) for e in eixo_nomes}
    cortes_recalc = {e: float(np.median(V[e][sobe16])) for e in eixo_nomes}
    congelados = ler_cortes_congelados()
    for e in eixo_nomes:
        assert abs(cortes_recalc[e] - congelados[e]) < 1e-9, (e, cortes_recalc[e], congelados[e])
    cortes = congelados

    def agrupa(Vt, Vr, ct, cr, idx):
        at, ar = Vt[idx] >= ct, Vr[idx] >= cr
        return np.where(at & ar, 0, np.where(at & ~ar, 1, np.where(~at & ar, 2, 3)))

    NOMES_G = ("G1", "G2", "G3", "G4")
    gi = agrupa(V[terr], V[rota], cortes[terr], cortes[rota], alta)
    grupo = np.array([NOMES_G[x] for x in gi])
    g16 = agrupa(V[terr], V[rota], cortes[terr], cortes[rota], sobe16)
    tam = [int((gi == k).sum()) for k in range(4)]
    grupos_presentes = [k for k in range(4) if tam[k] > 0]

    # conferência do motor vetorizado contra o do Protótipo, no caso de 560 partições
    bat_proto = [c for c in P.DECL["bateria_tipologia"] if c not in usadas]
    Pt_all = {}
    for c in set(bat_proto):
        Pt_all[c] = (postos[c].values if c in postos.columns
                     else pd.Series(d[c].values).groupby(d.ano.values).rank(pct=True).values * 100)
    M16 = np.column_stack([Pt_all[c][sobe16] for c in bat_proto])
    alvo_conf = g16 == 1
    if 0 < alvo_conf.sum() < len(alvo_conf) and math.comb(len(alvo_conf), int(alvo_conf.sum())) <= 5000:
        def est(rot):
            return float(np.nanmean([P.eta2(M16[:, j], rot) for j in range(M16.shape[1])]))
        _, ac_p, tot_p, p_p = P.p_exato_binario(est, alvo_conf, len(alvo_conf))
        meu = p_um_contra_o_resto(M16, alvo_conf, gen)
        assert meu["particoes_acima_ou_iguais"] == ac_p and meu["particoes"] == tot_p, (meu, ac_p, tot_p)
        conferencia = dict(caso="G2 dos 16 que subiram, bateria do Protótipo (com golos_cabeca)",
                           particoes=tot_p, acima_gerador_do_prototipo=ac_p,
                           acima_motor_vetorizado=meu["particoes_acima_ou_iguais"], bate=True,
                           **{RG.MARCA_SEM_TESTE: {c: dict(
                               motivo=RG.motivo_resultado(c),
                               por_que=("o caso só confere o motor de enumeração contra o do Protótipo, com a "
                                        "bateria dele como está; nenhum número deste caso é achado desta aba"))
                               for c in bat_proto if RG.e_resultado(c)}})
    else:
        conferencia = dict(bate=None, motivo="o G2 dos 16 não é um caso pequeno nesta base")

    # bateria de fora SEM as colunas circulares
    # As retiradas vão com a chave `col` (a mesma do resto da tipologia) e com a MARCA que a
    # guarda final confere contra a lista de resultado: é o motivo, e não o nome da chave, que
    # separa "listado como retirado" de "apresentado como achado".
    fora_tec = [c for c in bat_proto if not RG.e_resultado(c)]
    retiradas = [RG.retirada(c) for c in bat_proto if RG.e_resultado(c)]
    leitura_retirada = [RG.retirada(c) for c in P.DECL["tipologia_leitura"] if RG.e_resultado(c)]
    leitura = [c for c in P.DECL["tipologia_leitura"] if not RG.e_resultado(c)]
    Pt = {c: Pt_all[c] for c in fora_tec}
    for c in leitura:
        Pt[c] = postos[c].values if c in postos.columns else \
            pd.Series(d[c].values).groupby(d.ano.values).rank(pct=True).values * 100
    M_fora = np.column_stack([Pt[c][alta] for c in fora_tec])

    N_BATERIA = 200 if RAPIDO else 10000
    # Os nulos desta função permutam os rótulos dos 24 JUNTOS, sem estratificar por ano (a alta
    # é 4/8/6/6 por ano). Mantido como no Protótipo — que tinha 4 por ano e não precisava — e
    # DECLARADO em `nulo_nao_estratificado_por_ano`: estratificar mudaria todos os p desta
    # tipologia, e a enumeração exata do um-contra-o-resto não tem versão estratificada aqui.
    perms = np.array([gen.permutation(gi) for _ in range(N_BATERIA)])
    E_obs = eta2_lote(M_fora, gi[None, :], 4)[0]
    E_nulo = eta2_lote(M_fora, perms, 4)
    ok_col = np.isfinite(E_obs)
    p_ind = np.array([(1 + np.sum(E_nulo[:, j] >= E_obs[j])) / (N_BATERIA + 1) if ok_col[j] else np.nan
                      for j in range(len(fora_tec))])
    obs_medio = float(np.nanmean(E_obs))
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", RuntimeWarning)
        nulo_rot = np.nanmean(E_nulo, axis=1)

    # placebo: ordenar a alta por qualquer indicador real do catálogo e cortar nos mesmos tamanhos
    part = []
    for c in postos.columns:
        v = postos[c].values[alta]
        if np.isfinite(v).sum() != len(alta) or c in usadas or RG.e_resultado(c):
            continue
        ordem = np.argsort(v, kind="stable")
        g2 = np.empty(len(alta), int)
        i = 0
        for k in range(4):
            g2[ordem[i:i + tam[k]]] = k
            i += tam[k]
        part.append(g2)
    part = np.array(part)
    placebo = eta2_medio_lote(M_fora, part, 4)
    p_rotulo = (1 + (nulo_rot >= obs_medio).sum()) / (N_BATERIA + 1)
    p_placebo = (1 + (placebo >= obs_medio).sum()) / (len(placebo) + 1)

    limpos = []
    for c in fora_tec:
        rs = [abs(stats.spearmanr(Pt[c], V[e], nan_policy="omit").statistic) for e in eixo_nomes]
        if all(np.isfinite(x) and x < 0.50 for x in rs):
            limpos.append(c)
    if limpos:
        M_lim = np.column_stack([Pt[c][alta] for c in limpos])
        obs_lim = float(eta2_medio_lote(M_lim, gi[None, :], 4)[0])
        nulo_lim = eta2_medio_lote(M_lim, perms, 4)
        plac_lim = eta2_medio_lote(M_lim, part, 4)
        p_lim_rot = (1 + (nulo_lim >= obs_lim).sum()) / (N_BATERIA + 1)
        p_lim_plac = (1 + (plac_lim >= obs_lim).sum()) / (len(plac_lim) + 1)
    else:
        obs_lim = p_lim_rot = p_lim_plac = np.nan
        nulo_lim = plac_lim = np.array([np.nan])

    # físico
    fora_fis = [c for c in (P.DECL["fisico_col_elenco"]
                            + [c for s in P.SETORES for c in P.DECL["fisico_col_setor"][s]])
                if c in postos.columns]
    M_fis = np.column_stack([postos[c].values[alta] for c in fora_fis])
    E_fis = eta2_lote(M_fis, gi[None, :], 4)[0]
    E_fis_nulo = eta2_lote(M_fis, perms, 4)
    testadas = np.isfinite(E_fis)
    p_fis = np.array([(1 + np.sum(E_fis_nulo[:, j] >= E_fis[j])) / (N_BATERIA + 1)
                      for j in np.where(testadas)[0]])
    q_fis = bh(p_fis)
    fis_por_coluna = []
    for j in np.where(testadas)[0]:
        ok = np.isfinite(M_fis[:, j])
        fis_por_coluna.append(dict(col=fora_fis[j], n_clubes=int(ok.sum()),
                                   menor_grupo=min(int((gi[ok] == k).sum()) for k in grupos_presentes),
                                   grupos_com_algum=int(len(set(gi[ok].tolist())))))

    # formação
    sis = jog.copy()
    sis[["sis", "sis_pct"]] = pd.DataFrame([P.sistema_limpo(s) for s in sis.Sistema], index=sis.index)
    form = sis.groupby(["ano", "Equipa"]).agg(
        linha3=("sis", lambda s: float(np.mean([str(x).startswith(("3", "5")) for x in s.dropna()]))),
        distintas=("sis", lambda s: int(s.dropna().nunique())),
        principal_pct=("sis", lambda s: float(s.value_counts(normalize=True).iloc[0])
                       if s.notna().any() else np.nan)).reset_index()
    fidx = {(a, c): i for i, (a, c) in enumerate(zip(form.ano, form.Equipa))}
    lf = np.array([fidx[(int(d.ano[i]), d.clube[i])] for i in alta])
    nj = sis.groupby(["ano", "Equipa"]).size().reset_index(name="n")
    perms_f = np.array([gen.permutation(gi) for _ in range(500)])
    testes_form = {}
    for col in ("linha3", "distintas", "principal_pct"):
        v = form[col].values[lf].astype(float)[:, None]
        e = float(eta2_lote(v, gi[None, :], 4)[0, 0])
        nulo = eta2_lote(v, perms_f, 4)[:, 0]
        testes_form[col] = dict(eta2=r(e, 3), p=r((1 + np.sum(nulo >= e)) / 501, 4))
    testes_form["n"] = dict(clube_temporada=int(len(alta)), jogos=int(nj.n.values[lf].sum()),
                            jogos_por_clube_temporada=sorted({int(x) for x in nj.n.values[lf]}),
                            fonte="dados/serieb_jogos.csv, coluna Sistema")

    # dinheiro
    rv = posto_ano(d, "tm_valor_total").values
    posto_val = d.groupby("ano").tm_valor_total.rank(ascending=False, method="min").values
    e_din = float(eta2_lote(rv[alta][:, None], gi[None, :], 4)[0, 0])
    perms_d = np.array([gen.permutation(gi) for _ in range(2000)])
    nulo_din = eta2_lote(rv[alta][:, None], perms_d, 4)[:, 0]
    p_din = (1 + np.sum(nulo_din >= e_din)) / 2001
    kw = stats.kruskal(*[rv[alta][gi == k] for k in grupos_presentes]) if len(grupos_presentes) > 1 else None
    ordem = np.argsort(-rv[alta], kind="stable")
    g_din = np.empty(len(alta), int)
    i = 0
    for k in range(4):
        g_din[ordem[i:i + tam[k]]] = k
        i += tam[k]
    e_rival = float(eta2_medio_lote(M_fora, g_din[None, :], 4)[0])
    perms_r = np.array([gen.permutation(g_din) for _ in range(200)])
    nulo_rival = eta2_medio_lote(M_fora, perms_r, 4)
    p_rival = (1 + np.sum(nulo_rival >= e_rival)) / 201

    Pres = {c: pd.Series(P.residualiza(postos[c].values, rv)).groupby(d.ano.values)
            .rank(pct=True).values * 100 for c in usadas}
    V_res = {e: eixo_tip(decl[e], Pres) for e in eixo_nomes}
    ct_res = {e: float(np.median(V_res[e][sobe16])) for e in eixo_nomes}
    g_res = agrupa(V_res[terr], V_res[rota], ct_res[terr], ct_res[rota], alta)
    muda_t = int(((V[terr][alta] >= cortes[terr]) != (V_res[terr][alta] >= ct_res[terr])).sum())
    muda_r = int(((V[rota][alta] >= cortes[rota]) != (V_res[rota][alta] >= ct_res[rota])).sum())

    # Estabilidade. Com corte congelado, "tirar um time da alta" não mexe em corte nenhum e
    # daria zero por construção — um teste que não pode falhar não é teste. O análogo que PODE
    # falhar é tirar um dos 16 que DEFINIRAM o corte e refazer a mediana.
    def rotulo(i):
        return f"{d.clube[i]} {int(d.ano[i])}"
    trocas_time = []
    for k in range(len(sobe16)):
        mask = np.ones(len(sobe16), bool)
        mask[k] = False
        ct = {e: float(np.median(V[e][sobe16][mask])) for e in eixo_nomes}
        g2 = agrupa(V[terr], V[rota], ct[terr], ct[rota], alta)
        trocas_time.append(dict(removido_dos_16=rotulo(sobe16[k]), trocas=int((g2 != gi).sum()),
                                trocaram=[rotulo(alta[i]) for i in range(len(alta)) if g2[i] != gi[i]]))
    trocas_ind = []
    for eixo, comp in decl.items():
        for c, _ in comp:
            comp2 = {e: [(cc, ss) for cc, ss in decl[e] if cc != c] for e in eixo_nomes}
            if not comp2[eixo]:
                continue
            V2 = {e: eixo_tip(comp2[e], Pc) for e in eixo_nomes}
            ct = {e: float(np.median(V2[e][sobe16])) for e in eixo_nomes}
            g2 = agrupa(V2[terr], V2[rota], ct[terr], ct[rota], alta)
            trocas_ind.append(dict(removido=c, trocas=int((g2 != gi).sum())))

    X2 = np.column_stack([V[e][alta] for e in eixo_nomes])
    etiq = f"{len(alta)} da faixa alta, 2 eixos congelados da tipologia"
    sil_decl = P.silhueta_dos_rotulos(X2, grupo, P.N_NULO, etiq, gen) if len(grupos_presentes) > 1 else None
    sil2 = P.silhueta_contra_nulos(X2, [4], P.N_NULO, etiq, gen)
    jac2 = P.jaccard_bootstrap(X2, 4, min(P.N_JACCARD * 3, 1000), gen)

    um_contra = {}
    for k in range(4):
        if tam[k] == 0:
            um_contra[NOMES_G[k]] = dict(p=None, motivo="nenhum time da alta neste quadrante")
            continue
        um_contra[NOMES_G[k]] = p_um_contra_o_resto(M_fora, gi == k, gen)
    LIM_TIME_16, LIM_IND_16 = 1, 2       # os limiares do Protótipo, calibrados para n=16
    lim_time = int(LIM_TIME_16 * len(alta) // 16)
    lim_ind = int(LIM_IND_16 * len(alta) // 16)

    fronteira = []
    for kk, i in enumerate(alta):
        trocas = 0
        for _ in range(2000):
            t2 = V[terr][i] + gen.normal(0, 10)
            r2 = V[rota][i] + gen.normal(0, 10)
            g2 = (0 if (t2 >= cortes[terr] and r2 >= cortes[rota]) else
                  1 if t2 >= cortes[terr] else 2 if r2 >= cortes[rota] else 3)
            trocas += g2 != gi[kk]
        fronteira.append(dict(clube=d.clube[i], ano=int(d.ano[i]), grupo=grupo[kk],
                              territorio=r(V[terr][i], 1), rota=r(V[rota][i], 1),
                              dist_corte_territorio=r(V[terr][i] - cortes[terr], 1),
                              dist_corte_rota=r(V[rota][i] - cortes[rota], 1),
                              troca_sob_ruido_10pt_pct=r(100 * trocas / 2000, 1)))

    andares = {}
    for rot, mask in (("territorio_alto_G1_x_G2", V[terr][alta] >= cortes[terr]),
                      ("territorio_baixo_G3_x_G4", V[terr][alta] < cortes[terr])):
        idx = np.where(mask)[0]
        alto_rota = V[rota][alta][idx] >= cortes[rota]
        if len(set(alto_rota.tolist())) < 2:
            andares[rot] = dict(n=int(len(idx)), p=None, motivo="andar com um lado vazio")
            continue
        res_andar = p_um_contra_o_resto(M_fora[idx], alto_rota, gen)
        andares[rot] = dict(n=int(len(idx)), replicas=res_andar["metodo"], **res_andar)

    brutos_cols = [c for c in ["posse", "passes_pct", "passe_longo_pct", "compr_passe", "entradas_area",
                               "toques_area", "atq_posicional", "ppda", "recuperacoes", "cruzamentos",
                               "cantos", "faltas", "xg", "remates_contra", "xg_contra", "intensidade",
                               "clean_sheets", "defesa_vs_xg", "duelos_aereos"]
                   if c in d.columns and not RG.e_resultado(c)]
    pct_cols = [c for c in ["atq_posicional", "passes_frente_pct", "cantos", "cruzamentos", "recuperacoes",
                            "intensidade", "faltas", "duelos_aereos", "amarelos", "xg_contra",
                            "xg_por_remate_contra", "contra_ataques", "passes_terco_final",
                            "clean_sheets", "defesa_vs_xg"]
                if c in Pt and not RG.e_resultado(c)]
    # STATUS. O um-contra-o-resto roda na bateria de fora, e ela tem colunas correlacionadas com
    # os eixos que CORTARAM os grupos (passes, xg, remates...): um grupo cortado por esses eixos
    # separa nessa bateria por construção — é a mesma circularidade do resultado, com os eixos no
    # lugar dos pontos. Por isso o p dele sozinho não dá selo. TIPO exige também a bateria LIMPA
    # contra o placebo (a que não carrega os eixos) e as duas estabilidades; nesta aba a
    # tipologia é exploratória com eixos herdados, e a natureza vai gravada em cada grupo.
    passou_limpa = bool(np.isfinite(p_lim_plac) and p_lim_plac < 0.05)
    passou_est_time = bool(max(t["trocas"] for t in trocas_time) <= lim_time)
    passou_est_ind = bool(max(t["trocas"] for t in trocas_ind) <= lim_ind)
    grupos = []
    for k in range(4):
        sel = alta[gi == k]
        p_uc = um_contra[NOMES_G[k]].get("p")
        condicoes = dict(um_contra_o_resto_p_abaixo_de_5pct=abaixo(p_uc, 0.05),
                         bateria_limpa_passa_no_placebo=passou_limpa,
                         estavel_ao_tirar_um_dos_16=passou_est_time,
                         estavel_ao_tirar_um_indicador=passou_est_ind)
        grupos.append(dict(
            grupo=NOMES_G[k], n=int(len(sel)),
            territorio=r(np.mean(V[terr][sel]), 1) if len(sel) else None,
            rota=r(np.mean(V[rota][sel]), 1) if len(sel) else None,
            natureza="exploratoria_eixos_herdados",
            status=("TIPO" if len(sel) and all(condicoes.values()) else "DESCRITIVO"),
            condicoes_do_status=condicoes,
            status_julgado_por=("TIPO só se as quatro condições passam: o p do um-contra-o-resto sozinho separa "
                                "por construção, porque a bateria de fora carrega colunas correlacionadas com os "
                                "eixos que cortaram os grupos"),
            # `corte_do_status` null: o status depende de QUATRO condições, e o renderer do
            # Protótipo recalcula "firme" por `p_um_contra_o_resto < corte_do_status` — com 0,05
            # ali os quatro grupos DESCRITIVOS voltavam à tela como firmes. O corte do p fica com
            # o nome do que ele corta.
            corte_do_status=None,
            motivo_corte_do_status=("o status não sai de um corte: TIPO exige as quatro condições de "
                                    "condicoes_do_status; o corte do p está em corte_do_p_um_contra_o_resto"),
            corte_do_p_um_contra_o_resto=0.05, p_um_contra_o_resto=p_uc,
            metodo_um_contra_o_resto=um_contra[NOMES_G[k]].get("metodo"),
            replicas_um_contra_o_resto=um_contra[NOMES_G[k]].get("metodo"),
            valor_medio_eur=r(np.nanmean(d.tm_valor_total.values[sel]), 0) if len(sel) else None,
            times=[dict(clube=d.clube[i], ano=int(d.ano[i]), pos=int(d.pos[i]), pts=int(d.pts[i]),
                        aproveitamento_pct=r(100 * d.aproveitamento[i], 1),
                        subiu_de_fato=bool(d.subiu_de_fato[i]),
                        posto_valor=int(posto_val[i]), valor_eur=r(d.tm_valor_total[i], 0)) for i in sel],
            subiram_de_fato=int(d.subiu_de_fato.values[sel].sum()),
            posto_valor_medio=r(np.mean(posto_val[sel]), 2) if len(sel) else None,
            brutos={c: r(np.nanmean(d[c].values[sel]), 3) for c in brutos_cols} if len(sel) else {},
            percentis={c: r(np.nanmean(Pt[c][sel]), 0) for c in pct_cols} if len(sel) else {},
            formacao=dict(linha3_pct=r(100 * np.mean(form.linha3.values[lf][gi == k]), 1),
                          distintas=r(np.mean(form.distintas.values[lf][gi == k]), 1),
                          principal_pct=r(100 * np.mean(form.principal_pct.values[lf][gi == k]), 1))
            if len(sel) else {}))

    q_tec = bh(p_ind)
    p_sil = sil_decl["nulo_mesma_covariancia"]["p"] if sil_decl else None
    veredito = [
        dict(teste=f"bateria de fora, {len(fora_tec)} indicadores, contra rótulo sorteado",
             numero=r_sig(p_rotulo, 3), corte=0.05, passou=bool(p_rotulo < 0.05)),
        dict(teste="bateria de fora contra o NULO PLACEBO (partições por indicador real)",
             numero=r(p_placebo, 4), corte=0.05, passou=bool(p_placebo < 0.05)),
        dict(teste="bateria LIMPA (|rho|<0,50 contra os eixos) contra o NULO PLACEBO",
             numero=r(p_lim_plac, 4), corte=0.05, passou=bool(np.isfinite(p_lim_plac) and p_lim_plac < 0.05),
             p_contra_rotulo_sorteado=r(p_lim_rot, 4)),
        dict(teste="silhueta DOS RÓTULOS DECLARADOS nos 2 eixos contra gaussiana de mesma covariância",
             numero=p_sil, corte=0.05, passou=bool(p_sil is not None and p_sil < 0.05)),
        dict(teste="Jaccard de bootstrap do k-means k=4 no plano — NÃO é a partição declarada",
             numero=min(jac2["jaccard_por_grupo"]), corte=0.60,
             passou=bool(min(jac2["jaccard_por_grupo"]) >= 0.60), julga_a_tipologia=False),
        dict(teste=f"físico ({int(testadas.sum())} colunas fis_*) sobrevive a Benjamini-Hochberg",
             numero=int(np.nansum(q_fis < 0.05)), corte=1, passou=bool(np.nansum(q_fis < 0.05) >= 1)),
        dict(teste="formação separa os grupos (% de linha de três)",
             numero=testes_form["linha3"]["p"], corte=0.05,
             passou=abaixo(testes_form["linha3"]["p"], 0.05)),
        dict(teste="o dinheiro distingue os quatro grupos (permutação)",
             numero=r(p_din, 4), corte=0.05, passou=bool(p_din < 0.05)),
        dict(teste="partição rival feita SÓ com dinheiro explica a bateria de fora",
             numero=r(p_rival, 4), corte=0.05, passou=bool(p_rival < 0.05)),
        dict(teste="corte de ROTA dentro do território alto (G1 x G2)",
             numero=andares["territorio_alto_G1_x_G2"].get("p"), corte=0.05,
             passou=abaixo(andares["territorio_alto_G1_x_G2"].get("p"), 0.05)),
        dict(teste="corte de ROTA dentro do território baixo (G3 x G4)",
             numero=andares["territorio_baixo_G3_x_G4"].get("p"), corte=0.05,
             passou=abaixo(andares["territorio_baixo_G3_x_G4"].get("p"), 0.05)),
        dict(teste=f"estabilidade: trocas na alta ao tirar um dos 16 que definiram o corte "
                   f"(limiar {lim_time} = {LIM_TIME_16} do Protótipo × {len(alta)}/16)",
             numero=max(t["trocas"] for t in trocas_time), corte=lim_time,
             passou=bool(max(t["trocas"] for t in trocas_time) <= lim_time)),
        dict(teste=f"estabilidade: trocas na alta ao tirar um indicador dos eixos "
                   f"(limiar {lim_ind} = {LIM_IND_16} do Protótipo × {len(alta)}/16)",
             numero=max(t["trocas"] for t in trocas_ind), corte=lim_ind,
             passou=bool(max(t["trocas"] for t in trocas_ind) <= lim_ind)),
    ]
    return dict(
        decisao=("eixos e cortes CONGELADOS do Protótipo aplicados à faixa alta, não reconstruídos: "
                 "reconstruir nos %d viraria outro estudo, com eixos escolhidos depois de ver outro "
                 "grupo e sem teste cego. Tipologia exploratória, eixos herdados da aba de posição; "
                 "nenhum p do teste cego 2018-2021 se aplica" % len(alta)),
        status_e_p_declarados_do_prototipo=dict(
            copiados=False,
            motivo=("os status e p do TIPOLOGIA.md são da partição dos 16 que subiram: gravá-los aqui "
                    "ao lado de p medidos na alta compararia testes diferentes como se fossem o mesmo")),
        eixos={e: [[c, s] for c, s in decl[e]] for e in eixo_nomes},
        cortes={e: r(cortes[e], 2) for e in eixo_nomes},
        cortes_origem=dict(arquivo="_fonte/prototipo/CONGELADO_2022_2025.md",
                           recalculados_nos_16_que_subiram={e: r(cortes_recalc[e], 4) for e in eixo_nomes},
                           batem=True),
        enumeracao_do_um_contra_o_resto=dict(
            limite_exato_em_particoes=LIMITE_EXATO, replicas_monte_carlo_acima_do_limite=N_MC_EXATO,
            regra=("exata (todas as C(n,k) rotulagens, eta² vetorizado) até o limite; acima dele, Monte "
                   "Carlo com o gerador da tipologia e IC de Clopper-Pearson do p; o método usado vai "
                   "em cada `metodo`"),
            replicas_da_bateria=N_BATERIA),
        conferencia_do_motor_exato=conferencia,
        bateria_pre_declarada=fora_tec, retiradas_da_bateria_por_serem_resultado=retiradas,
        leitura_retirada_por_ser_resultado=leitura_retirada,
        veredito=veredito, andares=andares,
        plano=[dict(clube=d.clube[i], ano=int(d.ano[i]), pos=int(d.pos[i]), grupo=grupo[k],
                    subiu_de_fato=bool(d.subiu_de_fato[i]),
                    territorio=r(V[terr][i], 1), rota=r(V[rota][i], 1)) for k, i in enumerate(alta)],
        os_16_que_subiram_com_faixa_de_pontos=[
            dict(clube=d.clube[i], ano=int(d.ano[i]), grupo_no_prototipo=NOMES_G[g16[k]],
                 faixa_pontos=d.faixa_pts[i], aproveitamento_pct=r(100 * d.aproveitamento[i], 1))
            for k, i in enumerate(sobe16)],
        proporcao=dict(na_alta={NOMES_G[k]: tam[k] for k in range(4)},
                       nos_16_que_subiram={NOMES_G[k]: int((g16 == k).sum()) for k in range(4)}),
        grupos=grupos,
        teste_de_fora=dict(
            indicadores=len(fora_tec), eta2_medio_obs=r(obs_medio, 3),
            eta2_medio_nulo_rotulo=r(np.nanmean(nulo_rot), 3), p_rotulo=r_sig(p_rotulo, 3),
            p_rotulo_texto=rotulo_p(p_rotulo), replicas_rotulo=N_BATERIA,
            eta2_medio_nulo_placebo=r(np.mean(placebo), 3), placebo_particoes=len(placebo),
            p_placebo=r(p_placebo, 4),
            sobrevivem_bh5=int(np.nansum(q_tec < 0.05)), sobrevivem_bh10=int(np.nansum(q_tec < 0.10)),
            por_indicador=sorted([dict(col=c, eta2=r(E_obs[j], 3), p=r(p_ind[j], 5), q=r(q_tec[j], 5),
                                       percentil_por_grupo={NOMES_G[k]: r(np.nanmean(Pt[c][alta][gi == k]), 0)
                                                            if tam[k] else None for k in range(4)})
                                  for j, c in enumerate(fora_tec)], key=lambda x: -(x["eta2"] or 0))),
        bateria_limpa=dict(validadores=len(limpos), criterio="|rho| < 0,50 contra os dois eixos nas 80 linhas",
                           eta2_medio_obs=r(obs_lim, 3), p=r(p_lim_rot, 4),
                           eta2_medio_nulo=r(np.nanmean(nulo_lim), 3), replicas_rotulo=int(len(nulo_lim)),
                           eta2_medio_nulo_placebo=r(np.nanmean(plac_lim), 3), p_placebo=r(p_lim_plac, 4),
                           placebo_particoes=int(len(plac_lim)),
                           julgada_por="p_placebo", colunas=limpos),
        nulo_nao_estratificado_por_ano=dict(
            alta_por_ano={str(int(a)): int(((d.ano.values[alta]) == a).sum()) for a in sorted(set(d.ano.values[alta]))},
            regra=("os nulos de rótulo sorteado, formação, dinheiro e partição rival permutam os %d juntos, e a "
                   "enumeração do um-contra-o-resto conta todas as C(n,k) partições sem olhar o ano; o resto do "
                   "estudo sorteia DENTRO do ano. Mantido como no Protótipo (lá eram 4 por ano) e declarado: "
                   "estratificar mudaria todos os p desta tipologia" % len(alta)),
            limiares_de_estabilidade=("proporcionais (limiar do Protótipo × n/16), NÃO recalibrados por simulação "
                                      "com n=%d" % len(alta))),
        fisico=dict(colunas=len(fora_fis), colunas_testadas=int(testadas.sum()),
                    passam5=int(np.nansum(p_fis < 0.05)), esperados_por_acaso=r(testadas.sum() * 0.05, 1),
                    menor_q_bh=r(np.nanmin(q_fis) if len(q_fis) else np.nan, 3),
                    sobrevivem_bh5=int(np.nansum(q_fis < 0.05)), replicas=N_BATERIA,
                    n_clubes_minimo=min((x["n_clubes"] for x in fis_por_coluna), default=None),
                    n_clubes_maximo=max((x["n_clubes"] for x in fis_por_coluna), default=None),
                    menor_grupo_minimo=min((x["menor_grupo"] for x in fis_por_coluna), default=None),
                    por_coluna=fis_por_coluna,
                    colunas_fis_de_fora=[
                        dict(col=c, motivo=(
                            "denominador da média física (atletas rastreados), não indicador — entra como "
                            "controle, ver etapa_1.controle_n_atletas" if c.endswith("_atletas") else
                            "minutos rastreados do elenco: medida de exposição da base, não indicador de jogo"))
                        for c in sorted(c for c in d.columns if c.startswith("fis_") and c not in set(fora_fis))]),
        formacao=testes_form,
        dinheiro=dict(eta2_posto_valor=r(e_din, 3), p_permutacao=r(p_din, 4),
                      p_kruskal=r(kw.pvalue, 4) if kw else None,
                      particao_rival_so_dinheiro=dict(eta2_medio=r(e_rival, 3),
                                                      eta2_medio_nulo=r(np.nanmean(nulo_rival), 3),
                                                      p=r(p_rival, 4)),
                      residualizado=dict(regra=("resíduo do posto de valor nos itens dos eixos, re-ranqueado "
                                                "no ano; corte = mediana dos 16 que subiram no eixo residual"),
                                         muda_territorio=muda_t, muda_rota=muda_r, de=len(alta),
                                         trocaram=[rotulo(alta[k]) for k in range(len(alta)) if g_res[k] != gi[k]]),
                      rho_posto_valor_x_percentil_ppda=r(
                          stats.spearmanr(posto_val[alta], postos["ppda"].values[alta]).statistic, 3),
                      convencao_ppda=("posto de valor 1 = elenco mais caro do ano; percentil de PPDA alto = MENOS "
                                      "pressão. rho positivo significa elenco caro pressiona alto"),
                      n_do_rho=int(len(alta))),
        estabilidade=dict(tirar_um_dos_16=trocas_time, tirar_um_indicador=trocas_ind,
                          times_que_nunca_se_movem=[rotulo(i) for i in alta
                                                    if all(rotulo(i) not in t["trocaram"] for t in trocas_time)],
                          regra_times_que_nunca_se_movem="times da alta que não trocam de grupo em nenhuma das 16 retiradas",
                          tirar_um_time_da_alta=dict(
                              possivel=False,
                              motivo=("com o corte congelado, tirar um time da alta não move corte nenhum: "
                                      "daria zero trocas por construção")),
                          limiares=dict(prototipo=dict(tirar_um_time=LIM_TIME_16, tirar_um_indicador=LIM_IND_16, n=16),
                                        nesta_aba=dict(tirar_um_dos_16=lim_time, tirar_um_indicador=lim_ind,
                                                       n=len(alta)),
                                        regra="proporcional ao n: limiar do Protótipo × n / 16, arredondado para baixo"),
                          silhueta_espaco_reduzido=[sil_decl], fronteira=fronteira),
        kmeans_no_plano_da_tipologia=dict(
            etiqueta=("k-means k=4 no plano dos dois eixos — NÃO é a partição declarada"),
            tamanhos_do_kmeans=jac2["tamanhos"], tamanhos_dos_quadrantes=tam,
            silhueta=sil2, jaccard=jac2),
    )


def etapa_8(d80, postos, jog, Z, itens_eixo):
    alta = (d80.faixa_pts == "alta").values
    n = int(alta.sum())
    cem = P.silhueta_contra_nulos(Z.values[alta], [2, 3, 4], P.N_NULO,
                                  f"{n} da faixa alta, 9 eixos", gerador("cemiterio_alta", 81))
    cem += P.silhueta_contra_nulos(Z.values, [2, 3, 4], P.N_NULO, f"{len(d80)} clube-temporada, 9 eixos",
                                   gerador("cemiterio_80", 82))
    jac = [P.jaccard_bootstrap(Z.values[alta], k, P.N_JACCARD, gerador(f"jaccard_alta_k{k}", 83, k))
           for k in (2, 3, 4)]
    tip = tipologia_congelada(d80, postos, jog)
    km = tip.pop("kmeans_no_plano_da_tipologia")
    # Um eixo do cemitério feito SÓ de colunas de consequência (repetir o XI, concentrar minutos)
    # agrupa a alta pelo que acontece com quem ganha: vai marcado, como na etapa 2.
    so_consequencia = [e for e, its in itens_eixo.items() if its and all(RG.motivo_consequencia(c) for c in its)]
    return dict(titulo_chave="etapa_8", estado_nesta_aba="adaptada",
                o_que_mudou=("cemitério rodado nos %d da alta com geradores próprios; tipologia com os "
                             "eixos e cortes congelados do Protótipo aplicados à alta (ver `tipologia.decisao`); "
                             "status TIPO só com a bateria limpa e a estabilidade passando" % n),
                cemiterio=dict(linhas=cem, jaccard=jac, eixos_usados=itens_eixo,
                               eixos_so_de_consequencia=so_consequencia,
                               **RG.marca_consequencia([c for its in itens_eixo.values() for c in its]),
                               kmeans_no_plano_da_tipologia=km,
                               observacoes_por_dimensao=dict(n=n, dimensoes=Z.shape[1])),
                tipologia=tip)


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 10 — lista FIXA
# ══════════════════════════════════════════════════════════════════════════════

def etapa_10(d80, linhas_cat, pares):
    """"Não contrate para isto", com membresia que NÃO depende da porta.

    No Protótipo quem entra aqui sai da porta (D, que nunca acontece, ou B com ρ<0,15) — e a
    porta depende da faixa, então trocar sobe/meio/cai por faixas de pontos mudaria a lista
    sem ninguém ter mexido nela. Aqui a membresia é a lista declarada em `ranking_gaps`:
    RESULTADO (pedaço da faixa) e CONSEQUÊNCIA (o que acontece com quem ganha).
    """
    fx = d80.faixa_pts.values
    a = np.array([p[0] for p in pares])
    b = np.array([p[1] for p in pares])
    cat = {L["coluna_csv"]: L for L in linhas_cat}
    # A própria régua (pts, posição, a faixa, o aproveitamento) não é "resultado redescrito":
    # é a definição. Listá-la com d contra as faixas seria mostrar que a régua separa a si mesma.
    REGUA = set(RG.REGUA)
    linhas = []
    for col in d80.columns:
        mot_r, mot_c = RG.motivo_resultado(col), RG.motivo_consequencia(col)
        if not (mot_r or mot_c) or col in REGUA:
            continue
        v = pd.to_numeric(d80[col], errors="coerce").values.astype(float)
        if not np.isfinite(v).any() or col in ("faixa", "faixa_pts", "faixa_posicao"):
            continue
        rk = pd.Series(v).groupby(d80.ano.values).rank(pct=True).values * 100
        ok = np.isfinite(rk[a]) & np.isfinite(rk[b])
        rho = stats.spearmanr(rk[a][ok], rk[b][ok]).statistic if ok.sum() >= 8 else np.nan
        # linha de resultado vai MARCADA como retirada de teste: aqui ela é aviso ("não contrate
        # para isto"), e a guarda final confere a marca contra a lista, não o nome da etapa
        linhas.append(dict(indicador=col, tipo="resultado" if mot_r else "consequencia",
                           motivo=mot_r or mot_c, **({RG.MARCA_RETIRADA: mot_r} if mot_r else {}),
                           **{f"m_{f}": r(np.nanmean(v[fx == f]), 3) for f in ORDEM},
                           d_bruto_AM=r(d_cohen(v[fx == "alta"], v[fx == "media"]), 3),
                           d_bruto_AB=r(d_cohen(v[fx == "alta"], v[fx == "baixa"]), 3),
                           rho_persist=r(rho, 3),
                           porta_no_catalogo=cat[col]["porta"] if col in cat else None))
    linhas.sort(key=lambda x: -abs(x["d_bruto_AB"] or 0))
    return dict(titulo_chave="etapa_10", estado_nesta_aba="adaptada",
                o_que_mudou=("a lista é fixa (resultado + consequência, versão %s) e não sai da porta; "
                             "resultado nunca é testado, consequência fica marcada" % RG.VERSAO_DAS_LISTAS),
                universo="80 clube-temporada de 2022-2025",
                fora_por_serem_a_propria_regua=[
                    RG.retirada(c) if RG.e_resultado(c) else
                    dict(col=c, motivo="coluna criada por esta aba para carregar a régua (posição ou subida real)")
                    for c in sorted(REGUA) if c in d80.columns],
                linhas=linhas)


# ══════════════════════════════════════════════════════════════════════════════
#  ETAPA 13 — teste por atleta refeito, alvos, critério do setor
# ══════════════════════════════════════════════════════════════════════════════

def raio_nas_faixas_de_pontos(sc):
    """O teste por ATLETA de `gerar_raio_serieb.py` refeito com alta x baixa.

    O `raio_ref.json` foi calculado com a faixa por posição; ler dele os n, d, p e BH por atleta
    poria um teste posicional dentro de uma nota de pontos. A conta aqui é a mesma do raio
    (valor cru, cobertura >= 60% em cada lado, Welch, d de Cohen, BH na família dos 4 setores),
    na mesma estrutura, para que `P.sobecai_corrigido` a leia sem saber a diferença.
    """
    chaves = list(G.DE_PARA) + list(G.DE_PARA_JSON) + list(G.DE_PARA_OBR)
    setores, familia = {}, []
    for setor, codigos in G.SETOR_FUND.items():
        wy = {w for w, cs in G.POSICOES.items() if any(c in codigos for c in cs)}
        d = sc[sc.pos_wy.isin(wy)]
        g_s, g_c = d[d.faixa == "sobe"], d[d.faixa == "cai"]
        itens = []
        for k in chaves:
            col = G.DE_PARA.get(k) or G.DE_PARA_OBR.get(k) or k
            a = pd.to_numeric(g_s[col], errors="coerce").dropna()
            b = pd.to_numeric(g_c[col], errors="coerce").dropna()
            if len(a) < len(g_s) * 0.6 or len(b) < len(g_c) * 0.6:
                continue
            va, vb = a.var(ddof=1), b.var(ddof=1)
            ep = np.sqrt(va / len(a) + vb / len(b))
            if not ep or np.isnan(ep):
                continue
            p = float(stats.ttest_ind(a, b, equal_var=False).pvalue)
            dd = d_cohen(a, b)
            if k in G.MENOR_MELHOR:
                dd = -dd
            it = dict(k=k, n_sobe=int(len(a)), n_cai=int(len(b)), d=r(dd, 3), p=p)
            itens.append(it)
            familia.append(it)
        setores[setor] = dict(n_sobe=int(len(g_s)), n_cai=int(len(g_c)), itens=itens)
    qs = bh([x["p"] for x in familia])
    for it, q in zip(familia, qs):
        it["bh"] = bool(q < 0.05)
        it["p"] = r(it["p"], 5)
    return dict(sobecai=dict(setores=setores,
                             familia=dict(testes=len(familia), bh5=int(sum(1 for x in familia if x["bh"])))))


def alvos_fisicos(sc, corrigido, posto_val, k_por_ano):
    """Os cenários do alvo físico com a alta no lugar de quem subiu.

    DECISÃO sobre o "caro": no Protótipo, caro = subiu e top-8 de valor, com o 8 escolhido
    para quatro vagas por ano. Com a alta de tamanho variável (4/8/6/6), o análogo que não
    exige escolher número é o mesmo da etapa 1: caro = alta E entre os k mais caros do ano, com
    k = tamanho da alta naquele ano. Barato = alta fora desse top-k. Os n por cenário vão ao JSON.
    """
    sc = sc.copy()
    sc["posto_val"] = [posto_val.get((a, c), 99) for a, c in zip(sc.ano, sc.clube)]
    sc["k_ano"] = [k_por_ano.get(int(a), 0) for a in sc.ano]
    cenarios = {
        "sobe": lambda g: g.faixa == "sobe",
        "caro": lambda g: (g.faixa == "sobe") & (g.posto_val <= g.k_ano),
        "barato": lambda g: (g.faixa == "sobe") & (g.posto_val > g.k_ano),
        "cai": lambda g: g.faixa == "cai",
    }
    alvos, ns = {}, {}
    for setor, codigos in G.SETOR_FUND.items():
        wy = {w for w, cs in G.POSICOES.items() if any(c in codigos for c in cs)}
        d = sc[sc.pos_wy.isin(wy)]
        itens = {}
        for it in corrigido[setor]["itens"]:
            k = it["k"]
            col = G.DE_PARA.get(k) or G.DE_PARA_OBR.get(k) or k
            if col not in d.columns:
                continue
            ref = pd.to_numeric(d[col], errors="coerce").dropna().values
            if len(ref) < 30:
                continue
            # o n do teste por clube NÃO vai à linha: ele é, por construção, o mesmo n_clubes do
            # cenário alta/baixa (mesmas linhas, mesma média ponderada, mesmo dropna) — conferido
            # com assert abaixo. Dois nomes para o mesmo número convidavam a ler um pelo outro.
            linha = dict(d_clube=it["d_clube"], p_clube=it["p_clube"], q_clube=it["q_clube"],
                         bh_clube=it["bh_clube"], bh_atleta=it["bh_atleta"], menor=it["menor"],
                         n_atletas_serie_b=int(len(ref)))
            n_teste = (it["n_clube_sobe"], it["n_clube_cai"])
            falta = False
            for cen, filtro in cenarios.items():
                g = d[filtro(d)]
                ag = (pd.DataFrame(dict(ano=g.ano, clube=g.clube,
                                        v=pd.to_numeric(g[col], errors="coerce"), w=g.min_tot))
                      .groupby(["ano", "clube"])
                      .apply(lambda x: P.A.media_pond(x.v, x.w), include_groups=False).dropna())
                if len(ag) < 3:
                    linha[f"pct_{cen}"] = None
                    linha[f"n_clubes_{cen}"] = int(len(ag))
                    linha[f"motivo_{cen}"] = "menos de 3 clube-temporada com o indicador"
                    falta = falta or cen in ("sobe", "cai")
                    continue
                linha[f"pct_{cen}"] = r(100 * (ref < ag.mean()).mean(), 1)
                linha[f"n_clubes_{cen}"] = int(len(ag))
                ns[cen] = max(ns.get(cen, 0), len(ag))
            if not falta:
                assert (linha["n_clubes_sobe"], linha["n_clubes_cai"]) == n_teste, (setor, k, n_teste)
                itens[k] = linha
        alvos[setor] = itens
    alvos["_n_clube_por_cenario"] = ns
    return alvos


def indicadores_do_setor(alvo):
    """A mesma regra do Protótipo, com o texto do critério montado com os n MEDIDOS.

    Substitui `P.indicadores_do_setor` em memória (as funções `etapa_13` e `backtest_nota` do
    gerador a chamam pelo nome do módulo), porque a de lá escreve "16x16" e aqui o teste por
    clube é alta contra baixa com outros n. O fallback para o BH por atleta usa o teste por
    atleta REFEITO nas faixas de pontos (`raio_nas_faixas_de_pontos`), não o de posição.
    """
    campos_fis = P.DECL["blocos_encaixe"]["fisica"]
    # `abaixo` e não `(p or 1) < 0,05`: p_clube vem arredondado a 5 casas e um p de 1e-6 vira 0,0
    do_clube = [k for k, a in alvo.items() if k in campos_fis and abaixo(a["p_clube"], 0.05)]
    ns = [(a.get("n_clubes_sobe"), a.get("n_clubes_cai")) for k, a in alvo.items() if k in campos_fis]
    n1 = max([x for x, _ in ns if x is not None], default=0)
    n2 = max([y for _, y in ns if y is not None], default=0)
    if len(do_clube) >= 3:
        usa, pseudo = do_clube, False
        crit = f"p_clube < 0,05 (teste corrigido por clube, alta {n1} x baixa {n2})"
    else:
        usa = [k for k, a in alvo.items() if k in campos_fis and a["bh_atleta"]]
        pseudo = True
        if not do_clube:
            crit = ("nenhum indicador do bloco sobreviveu ao teste por CLUBE (alta %d x baixa %d); "
                    "caiu-se para BH no teste por ATLETA nas faixas de pontos (pseudorreplicado)" % (n1, n2))
        else:
            crit = (f"só {len(do_clube)} indicador(es) do bloco sobreviveu(ram) ao teste por clube "
                    f"(alta {n1} x baixa {n2}, p_clube<0,05); a nota do setor descansa sobre "
                    f"{len(usa)} indicador(es)")
    tetos = {}
    for c in ("sobe", "caro", "barato"):
        vs = [abs(alvo[k][f"pct_{c}"] - alvo[k]["pct_cai"]) / 100 for k in usa
              if alvo[k].get(f"pct_{c}") is not None and alvo[k].get("pct_cai") is not None]
        tetos[f"margem_{c}"] = float(np.mean(vs)) if vs else None
    return dict(usa=usa, criterio=crit, pseudorreplicado=pseudo,
                sobreviventes_por_clube=len(do_clube), tetos=tetos)


# ══════════════════════════════════════════════════════════════════════════════
#  O técnico coletivo nas 160
# ══════════════════════════════════════════════════════════════════════════════

def tecnico_2018_2025(d80, dv, jogos, meta_tc, cols):
    """As partes do técnico COLETIVO que existem nos oito anos, rodadas nas 160.

    O posto é dentro do ano (cada ano tem os seus 20), então juntar blocos é legítimo NO POSTO.
    O que não se junta: valor cru (a vantagem de mando mudou entre blocos, e a faixa em valor
    cru sai por bloco) e dinheiro (não existe antes de 2022: nenhuma coluna líquida aqui, e a
    porta A/B/C, que exige o líquido, não se aplica a este universo).
    """
    U = "técnico coletivo 2018-2025 (160 clube-temporada)"
    base = pd.concat([d80[["ano", "clube", "pos", "pts", "J", "aproveitamento", "faixa_pts", "subiu_de_fato",
                           "bloco"] + cols],
                      dv[["ano", "clube", "pos", "pts", "J", "aproveitamento", "faixa_pts", "subiu_de_fato",
                          "bloco"] + cols]]).sort_values(["ano", "pos"]).reset_index(drop=True)
    sem_2026(base, jogos[BLOCO_NOVO], jogos[BLOCO_VELHO])
    assert len(base) == 160
    bruto = base[cols].astype(float)
    postos = pd.DataFrame({c: base.groupby("ano")[c].rank(pct=True).values * 100 for c in cols})
    fx = base.faixa_pts.values
    blocos = {b: (base.bloco == b).values for b in (BLOCO_NOVO, BLOCO_VELHO)}

    def comp(v, mask):
        f = fx[mask]
        vv = v[mask]
        return dict(n=int(np.isfinite(vv).sum()),
                    **{f"r_{g}": r(np.nanmean(vv[f == g]), 1) for g in ORDEM},
                    d_AM=r(d_cohen(vv[f == "alta"], vv[f == "media"]), 3),
                    p_AM=r_sig(welch_p(vv[f == "alta"], vv[f == "media"]), 3),
                    d_AB=r(d_cohen(vv[f == "alta"], vv[f == "baixa"]), 3),
                    p_AB=r_sig(welch_p(vv[f == "alta"], vv[f == "baixa"]), 3))

    # persistência t -> t+1 nas 160, com o par que atravessa os dois painéis contado à parte
    idx = {(a, c): i for i, (a, c) in enumerate(zip(base.ano, base.clube))}
    pares = [(idx[(a, c)], idx[(a + 1, c)]) for (a, c) in idx if (a + 1, c) in idx]
    pa = np.array([p[0] for p in pares])
    pb = np.array([p[1] for p in pares])
    atravessa = np.array([base.bloco[i] != base.bloco[j] for i, j in pares])

    tempo = porta_temporal(pd.concat([jogos[BLOCO_VELHO], jogos[BLOCO_NOVO]], ignore_index=True), meta_tc, U)
    tempo_bloco = {b: porta_temporal(jogos[b], meta_tc, f"técnico coletivo {b}") for b in (BLOCO_NOVO, BLOCO_VELHO)}
    tmap = {L["indicador"]: L for L in tempo["linhas"]}

    linhas, pam, pab = [], [], []
    for c in cols:
        v = postos[c].values
        L = dict(indicador=c, nome=meta_tc[c]["nome"], sinal=meta_tc[c]["sinal"], universo=U,
                 **comp(v, np.ones(len(v), bool)),
                 por_bloco={b: dict(**comp(v, m),
                                    **{f"m_bruto_{g}": r(np.nanmean(bruto[c].values[m & (fx == g)]), 3)
                                       for g in ORDEM}) for b, m in blocos.items()})
        L["mesmo_sinal_AM_nos_dois_blocos"] = bool(
            L["por_bloco"][BLOCO_NOVO]["d_AM"] is not None and L["por_bloco"][BLOCO_VELHO]["d_AM"] is not None
            and np.sign(L["por_bloco"][BLOCO_NOVO]["d_AM"]) == np.sign(L["por_bloco"][BLOCO_VELHO]["d_AM"]))
        ok = np.isfinite(v[pa]) & np.isfinite(v[pb])
        L["rho_persist"] = r(stats.spearmanr(v[pa][ok], v[pb][ok]).statistic, 3) if ok.sum() >= 8 else None
        L["n_persist"] = int(ok.sum())
        ok2 = ok & ~atravessa
        L["rho_persist_sem_o_par_que_atravessa_os_paineis"] = (
            r(stats.spearmanr(v[pa][ok2], v[pb][ok2]).statistic, 3) if ok2.sum() >= 8 else None)
        L["rho_1T_2T"] = tmap.get(c, {}).get("rho_parcial")
        L["p_1T_2T"] = tmap.get(c, {}).get("p_parcial")
        L["liquido_de_dinheiro"] = None
        L["motivo_liquido"] = "sem valor de mercado antes de 2022: todo número deste universo é BRUTO"
        L["porta"] = None
        L["motivo_porta"] = ("a porta exige o líquido de dinheiro, que não existe em 2018-2021; a porta "
                             "de 2022-2025 está na etapa_2")
        L["consequencia_do_resultado"] = bool(RG.motivo_consequencia(c))
        linhas.append(L)
        pam.append(welch_p(v[fx == "alta"], v[fx == "media"]))
        pab.append(welch_p(v[fx == "alta"], v[fx == "baixa"]))
    for L, qa, qb in zip(linhas, bh(pam), bh(pab)):
        L["q_AM"], L["q_AB"] = r_sig(qa, 3), r_sig(qb, 3)

    # o sorteio da família técnica coletiva: nulo do garimpo nas 160
    sel = (fx == "alta") | (fx == "media")
    y = (fx == "alta")[sel]
    Pm = postos.values.astype(float)
    anos = base.ano.values

    def aucs(M):
        out = np.full(M.shape[1], np.nan)
        for k in range(M.shape[1]):
            vv = M[sel, k]
            ok = np.isfinite(vv)
            if ok.sum() < 20 or not (y[ok].any() and (~y[ok]).any()):
                continue
            rk = stats.rankdata(vv[ok])
            n1, n0 = int(y[ok].sum()), int((~y[ok]).sum())
            out[k] = (rk[y[ok]].sum() - n1 * (n1 + 1) / 2) / (n1 * n0)
        return out
    reais = np.abs(aucs(Pm) - 0.5)
    gen = gerador("garimpo_tecnico_160", 31)
    blocos_ano = [np.where(anos == a)[0] for a in np.unique(anos)]
    melhores = np.empty(P.N_GARIMPO)
    for it in range(P.N_GARIMPO):
        Q = Pm.copy()
        for b in blocos_ano:
            Q[b] = Q[b][gen.permutation(len(b))]
        melhores[it] = np.nanmax(np.abs(aucs(Q) - 0.5))
    kb = int(np.nanargmax(reais))
    acima = int((melhores >= reais[kb]).sum())

    # pilar técnico coletivo da etapa 5 nas 160
    alta_idx = np.where(fx == "alta")[0]
    clubes = [dict(clube=base.clube[i], ano=int(base.ano[i]), bloco=base.bloco[i], pos=int(base.pos[i]),
                   pts=int(base.pts[i]), aproveitamento_pct=r(100 * base.aproveitamento[i], 1),
                   subiu_de_fato=bool(base.subiu_de_fato[i]),
                   celulas=[[r(bruto[c].values[i], 3), r(postos[c].values[i], 1), int(base.J[i])] for c in cols])
              for i in alta_idx]

    def quartis(v):
        v = v[np.isfinite(v)]
        return [r(np.percentile(v, 25), 1), r(np.percentile(v, 50), 1), r(np.percentile(v, 75), 1)] \
            if len(v) >= 4 else [None, None, None]

    def quartis_b(v):
        v = v[np.isfinite(v)]
        return [r(np.percentile(v, 25), 3), r(np.percentile(v, 50), 3), r(np.percentile(v, 75), 3)] \
            if len(v) >= 4 else [None, None, None]

    pilar = dict(
        universo=U, indicadores=[dict(id=c, nome=meta_tc[c]["nome"], sinal=meta_tc[c]["sinal"],
                                      unidade_n="jogo", coluna_csv=c) for c in cols],
        clubes=clubes,
        **{f"faixa_{g}": [quartis(postos[c].values[fx == g]) for c in cols] for g in ORDEM},
        faixas_bruto_por_bloco={b: {f"faixa_{g}_bruto": [quartis_b(bruto[c].values[m & (fx == g)]) for c in cols]
                                    for g in ORDEM} for b, m in blocos.items()},
        motivo_bruto_por_bloco=("o valor cru não se junta entre blocos: a vantagem de mando mudou de um "
                                "período para o outro (etapa de regime do CONFERENCIA §3.5)"),
        legenda_celula=["bruto", "posto_no_ano", "n (jogos)"])

    return dict(
        universo=U,
        tamanhos={g: int((fx == g).sum()) for g in ORDEM},
        tamanhos_por_bloco={b: {g: int((fx[m] == g).sum()) for g in ORDEM} for b, m in blocos.items()},
        catalogo=dict(familia="tecnico_col", testes=len(cols), comparacao_primaria="alta x media",
                      teste=("Welch no percentil dentro do ano, com d de Cohen — o MESMO teste do catálogo da "
                             "etapa_2 (função do Protótipo), para que este bloco e a etapa_2 sejam comparáveis "
                             "linha a linha. As tabelas de gaps usam Mann-Whitney (percentil é ordinal): as "
                             "contagens passam5/bh5 daqui e as do ranking NÃO são do mesmo teste"),
                      bh="Benjamini-Hochberg nos %d indicadores, por comparação" % len(cols),
                      passam5_AM=int(np.nansum(np.array(pam) < 0.05)),
                      bh5_AM=int(sum(1 for L in linhas if abaixo(L["q_AM"], 0.05))),
                      passam5_AB=int(np.nansum(np.array(pab) < 0.05)),
                      bh5_AB=int(sum(1 for L in linhas if abaixo(L["q_AB"], 0.05))),
                      esperados_por_acaso_5pct=r(0.05 * len(cols), 2),
                      mesmo_sinal_AM_nos_dois_blocos=int(sum(L["mesmo_sinal_AM_nos_dois_blocos"] for L in linhas)),
                      linhas=linhas),
        sorteio_da_familia=dict(
            universo=U, replicas=P.N_GARIMPO, gerador=GERADORES["garimpo_tecnico_160"],
            comparacao="alta x media", linhas=int(sel.sum()), indicadores=len(cols),
            metodo=("embaralha as LINHAS dentro de cada ano — o clube-temporada leva os %d indicadores "
                    "juntos; a seleção do melhor entre N é refeita em cada réplica" % len(cols)),
            ganho_auc_real_melhor=r(reais[kb], 4), indicador_real_melhor=cols[kb],
            ganho_auc_nulo_media=r(melhores.mean(), 4), ganho_auc_nulo_p95=r(np.percentile(melhores, 95), 4),
            replicas_acima_do_real=acima, p_do_melhor=r((1 + acima) / (P.N_GARIMPO + 1), 4)),
        pilar_tecnico_coletivo_etapa_5=pilar,
        persistencia=dict(universo=U, pares=len(pares),
                          pares_que_atravessam_os_paineis=int(atravessa.sum()),
                          pares_dentro_de_2018_2021=int(sum(1 for i, j in pares if base.bloco[i] == BLOCO_VELHO
                                                            and base.bloco[j] == BLOCO_VELHO)),
                          pares_dentro_de_2022_2025=int(sum(1 for i, j in pares if base.bloco[i] == BLOCO_NOVO
                                                            and base.bloco[j] == BLOCO_NOVO)),
                          terminaram_em_alta=int(sum(1 for _, j in pares if fx[j] == "alta")),
                          regra="posto no ano em t contra posto em t+1, Spearman; ρ por indicador em `catalogo.linhas`"),
        porta_temporal=dict(juntos=tempo, **{f"so_{b.replace('-', '_')}": t for b, t in tempo_bloco.items()}),
    )


# ══════════════════════════════════════════════════════════════════════════════
#  Saída: renomear chaves, conferir textos
# ══════════════════════════════════════════════════════════════════════════════

PROTEGIDOS = ("fis_", "ti_", "fisico_col_", "tecnico_ind_", "val_", "setor_")
TROCA = {"sobe": "alta", "cai": "baixa", "meio": "media", "SM": "AM", "SC": "AB"}


RENOMEADAS = {}      # chave do Protótipo -> chave desta aba, registrada na troca (vai a `tela.mapa_de_chaves`)


def renomear_chave(k, irmaos):
    if not isinstance(k, str) or k.startswith(PROTEGIDOS):
        return k
    if k == "meio":            # 'meio' sozinho é faixa só quando mora ao lado de sobe/cai
        novo = "media" if irmaos & {"sobe", "cai"} else k
    else:
        novo = "_".join(TROCA.get(t, t) for t in k.split("_"))
    if novo != k:
        RENOMEADAS.setdefault(k, novo)
    return novo


def renomear(o):
    if isinstance(o, dict):
        irm = set(o)
        novo = {renomear_chave(k, irm): renomear(v) for k, v in o.items()}
        assert len(novo) == len(o), ("renomear colidiu chaves", sorted(o))
        return novo
    if isinstance(o, list):
        return [renomear(x) for x in o]
    return o


TEXTOS = ((re.compile(r"\bsobe x meio\b"), "alta x media"), (re.compile(r"\bsobe x cai\b"), "alta x baixa"),
          (re.compile(r"\bsobe x resto\b"), "alta x resto"),
          (re.compile(r"não separa sobe de meio"), "não separa a faixa alta da média"))


def traduzir_textos(o):
    """Os poucos textos do gerador que nomeiam a faixa interna — trocados pela faixa de pontos."""
    if isinstance(o, dict):
        return {k: traduzir_textos(v) for k, v in o.items()}
    if isinstance(o, list):
        return [traduzir_textos(x) for x in o]
    if isinstance(o, str):
        for padrao, novo in TEXTOS:
            o = padrao.sub(novo, o)
        # Identificador de CHAVE citado como valor (ex.: `alvo: "margem_sobe"` apontando para a
        # chave que já virou `margem_alta`). Só identificador composto, sem espaço e fora dos
        # prefixos de indicador; 'meio' fica de fora porque sozinho é setor.
        if ("_" in o and " " not in o and not o.startswith(PROTEGIDOS)
                and re.search(r"(^|_)(sobe|cai|SM|SC)(_|$)", o)):
            o = "_".join({"sobe": "alta", "cai": "baixa", "SM": "AM", "SC": "AB"}.get(t, t)
                         for t in o.split("_"))
    return o


def _todas_as_chaves(o, acc=None):
    acc = set() if acc is None else acc
    if isinstance(o, dict):
        for k, v in o.items():
            acc.add(k)
            _todas_as_chaves(v, acc)
    elif isinstance(o, list):
        for x in o:
            _todas_as_chaves(x, acc)
    return acc


# Trocas de chave feitas À MÃO (fora do `renomear`), do nome do Protótipo para o desta aba.
TROCAS_MANUAIS = {
    "acertos_top4": "acertos_top_k", "top4_de_valor": "top_k_de_valor", "top4": "top_k",
    "g4_provisorio": "alta_por_ritmo",
    "promovidos_no_posto_k": "alta_no_posto_k", "promovidos_acumulados": "alta_acumulados",
    "pct_dos_promovidos": "pct_da_alta", "taxa_de_subida_no_top_k_pct": "taxa_de_alta_no_top_k_pct",
    "promovidos_total": "alta_total", "promovidos_por_ano": "alta_por_ano",
    "promovidos_por_posto": "alta_por_posto", "promovidos": "membros_da_alta",
    "sobe_x_resto": "alta_x_resto", "sobe_x_meio": "alta_x_media", "sobe_x_cai": "alta_x_baixa",
    "loso_sobe_x_resto": "loso_alta_x_resto", "auc_sobe_x_resto": "auc_alta_x_resto",
    "auc_sobe_x_meio": "auc_alta_x_media", "auc_sobe_x_cai": "auc_alta_x_baixa",
    "subidas_com_controle": "alta_com_controle", "subiram": "na_alta", "taxa_pct": "taxa_de_alta_pct",
    "subidas_sem_ano_anterior_na_serie_b": "alta_sem_ano_anterior_na_serie_b", "subidas_totais": "alta_total",
    "terminaram_em_subida": "terminaram_em_alta",
    "taxa_de_subida_por_quartil_pct": "taxa_de_alta_por_quartil_pct",
    "taxa_historica_de_subida_do_quartil_pct": "taxa_historica_de_alta_do_quartil_pct",
    "trocas_medianas_em_38_jogos": "trocas_medianas_por_clube_temporada",
    "referencia_pts1t_x_pts2t": "referencia_ap1t_x_ap2t",
    "media_sobe": "media_alta", "media_meio": "media_media", "media_cai": "media_baixa",
    "d_SM": "d_AM", "p_SM": "p_AM", "d_SC": "d_AB", "p_SC": "p_AB",
    "m_sobe": "m_alta", "m_meio": "m_media", "m_cai": "m_baixa", "sobe": "alta", "cai": "baixa",
    "sobecai_corrigido_por_clube": "alta_baixa_corrigido_por_clube",
    "n_clubes_sobe": "n_clubes_alta", "n_clubes_cai": "n_clubes_baixa",
    "linhas_serie_b_2022_2025": "linhas_serie_b", "painel": "painel_2022_2026",
    "promovidos_no_posto": "alta_por_posto",
}

_M_PALPITE = "palpite de 14 dos 16 não reaplicado (motivo em etapa_1.curva_top_k.palpite_do_dono)"
_M_DECLARADO = ("valor declarado em documento sobre os 16 que subiram; não copiado "
                "(motivo em etapa_8.tipologia.status_e_p_declarados_do_prototipo)")
REMOVIDAS = {
    "pergunta": _M_PALPITE, "afirmado": _M_PALPITE, "confirma": _M_PALPITE, "menor_k_com_14": _M_PALPITE,
    "esperado_por_acaso_no_k": _M_PALPITE, "p_exato_do_medido": _M_PALPITE,
    "status_declarado_no_documento": _M_DECLARADO, "p_declarado_no_documento": _M_DECLARADO,
    "leitura_do_teste_cego": _M_DECLARADO, "declarado_em": _M_DECLARADO,
    "p_em_2018_2021_declarado": _M_DECLARADO, "p_medido_aqui_placebo": _M_DECLARADO,
    "p_medido_aqui_rotulo": _M_DECLARADO, "p_na_origem_2022_2025_declarado": _M_DECLARADO,
    "p_placebo_declarado_na_conferencia": _M_DECLARADO, "validadores_declarados_no_documento": _M_DECLARADO,
    "motivo_do_julgamento": ("texto do Protótipo que compara com os documentos dos 16; o critério segue em "
                             "bateria_limpa.julgada_por"),
}


_ETAPA0_PODER = "etapa_0.poder.fisico_tecnico_individual_valor_2022_2025"
_M_AVISO = ("aviso de amostra não reaplicado: olhava o degrau do palpite de 14 dos 16 (motivo em "
            "etapa_1.curva_top_k.aviso_de_amostra.motivo_de_nao_reaplicar)")

# Trocas por CAMINHO, do Protótipo para esta aba: onde o nome sozinho não diz para onde a chave
# foi (mudou de nível, virou dicionário, tem duas origens) ou não foi para lugar nenhum. Valor:
# (caminho aqui ou None, conversão/motivo). `[]` é "cada item da lista".
CAMINHOS_MANUAIS = {
    # contagens de clube: no Protótipo soltas no topo (um universo só); aqui dentro de cada universo
    "etapa_0.clubes_distintos": ("etapa_0.universo_80_2022_2025.clubes_distintos",
                                 "clubes distintos das 80 de 2022-2025; o de 2018-2021 está em universo_2018_2021"),
    "etapa_0.aparicoes_por_clube": ("etapa_0.universo_80_2022_2025.aparicoes_por_clube",
                                    "aparições por clube nas 80 de 2022-2025; o de 2018-2021 está em universo_2018_2021"),
    # d mínimo: no Protótipo, 16x16 é quem sobe contra quem CAI e 16x48 contra o MEIO (é assim
    # que proto_a.js rotula); aqui o d mínimo mora por universo e por comparação.
    "etapa_0.poder.d_minimo_16x16": (f"{_ETAPA0_PODER}.alta_x_baixa.d_minimo",
                                     "16x16 = quem sobe contra quem cai: alta x baixa, universo das 80"),
    "etapa_0.poder.d_minimo_16x16_bonferroni": (f"{_ETAPA0_PODER}.alta_x_baixa.d_minimo_bonferroni",
                                                "o Bonferroni do 16x16: alta x baixa, universo das 80"),
    "etapa_0.poder.d_minimo_16x48": (f"{_ETAPA0_PODER}.alta_x_media.d_minimo",
                                     "16x48 = quem sobe contra o meio: alta x média, universo das 80"),
    "etapa_0.poder.d_minimo_16x64": (f"{_ETAPA0_PODER}.alta_x_resto.d_minimo",
                                     "16x64 = quem sobe contra o resto: alta x resto, universo das 80"),
    "etapa_0.poder.alfa": (f"{_ETAPA0_PODER}.alfa", "o mesmo alfa, dentro do universo das 80"),
    "etapa_0.poder.poder": (f"{_ETAPA0_PODER}.poder", "o mesmo poder, dentro do universo das 80"),
    "etapa_0.poder.testes_na_correcao_bonferroni": (f"{_ETAPA0_PODER}.testes_na_correcao_bonferroni",
                                                    "tamanho do catálogo, dentro do universo das 80"),
    "bases.painel.linhas": (None, "o painel desta aba soma dois arquivos; linhas e colunas por arquivo não foram "
                                  "regravadas (ficam `usadas` e `ano_2026`)"),
    "bases.painel.colunas": (None, "o painel desta aba soma dois arquivos; linhas e colunas por arquivo não foram "
                                   "regravadas (ficam `usadas` e `ano_2026`)"),
    "bases.jogos.arquivo": ("bases.jogos.arquivos", "texto virou lista de dois arquivos, 2022-2025 primeiro"),
    "bases.jogos.linhas_serie_b_2022_2025": ("bases.jogos.linhas_serie_b.2022-2025",
                                             "o número do Protótipo é a entrada 2022-2025 do dicionário"),
    "etapa_1.curva_top_k.aviso_de_amostra.promovidos_no_posto": (None, _M_AVISO),
    "etapa_1.curva_top_k.aviso_de_amostra.postos_ate_k_sem_promovido": (None, _M_AVISO),
    "etapa_1.curva_top_k.aviso_de_amostra.degrau_k8_para_k9": (None, _M_AVISO),
    "etapa_1.curva_top_k.aviso_de_amostra.leitura": ("etapa_1.curva_top_k.aviso_de_amostra.leitura",
                                                      "mesmo nome, outro conteúdo: refeita para a curva inteira"),
    # etapa 0: o topo foi separado por universo (ver etapa_0)
    "etapa_0.linhas_no_arquivo": ("etapa_0.linhas_no_arquivo_por_painel.painel_2022_2026",
                                  "o 100 do Protótipo é o painel 2022-2026 (80 + 20 de 2026); o de 2018-2021 fica ao lado"),
    "etapa_0.linhas_completas": ("etapa_0.universo_80_2022_2025.linhas_completas",
                                 "as 80 completas de 2022-2025; as de 2018-2021 estão em universo_2018_2021"),
    "etapa_0.sobe": ("etapa_0.universo_80_2022_2025.alta", "quem subiu → faixa alta, dentro do universo das 80"),
    "etapa_0.meio": ("etapa_0.universo_80_2022_2025.media", "meio → faixa média, dentro do universo das 80"),
    "etapa_0.cai": ("etapa_0.universo_80_2022_2025.baixa", "quem caiu → faixa baixa, dentro do universo das 80"),
    **{f"etapa_1.curva_top_k.palpite_do_dono.{k}": (None, _M_PALPITE)
       for k in ("pergunta", "k", "afirmado", "medido", "confirma", "menor_k_com_14", "esperado_por_acaso_no_k",
                 "p_exato_do_medido")},
    "etapa_1.curva_top_k.promovidos_por_posto[].promovidos": ("etapa_1.curva_top_k.alta_por_posto[].na_alta",
                                                              "quantos da faixa alta naquele posto de valor"),
    "etapa_1.fora_da_amostra_2026.J": ("faixas.ano_2026.rodadas_no_painel",
                                       "número virou lista dos J do painel (os jogos do jogo a jogo divergem: "
                                       "faixas.ano_2026.perto_do_corte)"),
    "etapa_1.fora_da_amostra_2026.top4_de_valor.de": ("etapa_1.fora_da_amostra_2026.top_k_de_valor.k",
                                                       "`de` era o tamanho fixo do top-4; aqui k = tamanho da alta "
                                                       "por ritmo em 2026"),
    "etapa_7.rodadas_1t": ("etapa_7.jogos_por_turno_resumo.jogos_1t_max",
                           "rodadas do 1º turno (rod < 19) viraram jogos do 1º turno = ceil(n/2); min e max em "
                           "jogos_por_turno_resumo"),
    "etapa_7.rodadas_2t": ("etapa_7.jogos_por_turno_resumo.jogos_2t_max",
                           "rodadas do 2º turno viraram jogos do 2º turno = o resto; o mínimo (clube com 37 "
                           "jogos) está em jogos_2t_min"),
    "etapa_8.tipologia.estabilidade.tirar_um_time": ("etapa_8.tipologia.estabilidade.tirar_um_dos_16",
                                                     "com o corte congelado, a retirada é a de cada um dos 16 "
                                                     "que cortaram os eixos; tirar um da alta não move corte "
                                                     "(tirar_um_time_da_alta.possivel = false)"),
    "etapa_8.tipologia.estabilidade.tirar_um_time[].removido": (
        "etapa_8.tipologia.estabilidade.tirar_um_dos_16[].removido_dos_16", "o removido é um dos 16"),
    **{f"etapa_8.tipologia.bateria_limpa.{k}": (None, _M_DECLARADO)
       for k in ("leitura_do_teste_cego", "p_placebo_declarado_na_conferencia",
                 "validadores_declarados_no_documento")},
    "etapa_8.tipologia.bateria_limpa.motivo_do_julgamento": (None, REMOVIDAS["motivo_do_julgamento"]),
    "etapa_8.tipologia.grupos[].p_declarado_no_documento": (None, _M_DECLARADO),
    "etapa_8.tipologia.grupos[].status_declarado_no_documento": (None, _M_DECLARADO),
    "etapa_10.linhas[].nome": (None, "o Protótipo repetia o indicador em `nome`; aqui a linha tem só `indicador`"),
    "etapa_10.linhas[].porta": ("etapa_10.linhas[].porta_no_catalogo",
                                "a membresia não depende mais da porta; é null quando a coluna não está no "
                                "catálogo, que é o caso de toda coluna de resultado"),
}
# Colunas de resultado que o Protótipo mostrava e esta aba retira: a entrada é a retirada.
CAMINHOS_RETIRADOS = ("etapa_8.tipologia.grupos[].brutos.", "etapa_8.tipologia.grupos[].percentis.")

# Mudança de TIPO sob um caminho traduzido, com a conversão. Caminho (regex) -> texto.
TIPOS_DECLARADOS = (
    (re.compile(r"^etapa_5\.paineis\.[^.]+\.clubes\[\]\.celulas\[\]\[\]$"),
     "célula vira TEXTO com o motivo quando o setor tem menos de 3 atletas rastreados (ausência com motivo)"),
    (re.compile(r"^etapa_10\.linhas\[\]\.porta$"), "a porta virou `porta_no_catalogo`, null para coluna fora do catálogo"),
    (re.compile(r"^etapa_1\.fora_da_amostra_2026\.J$"), "número virou lista de J do painel"),
    (re.compile(r"^bases\.jogos\.arquivo$"), "texto virou lista de arquivos"),
)

_VALOR_DE_FAIXA = {"sobe": "alta", "meio": "media", "cai": "baixa", "SM": "AM", "SC": "AB"}


def _traduzir_valor(v):
    if not isinstance(v, str) or " " in v:
        return v
    return "_".join(_VALOR_DE_FAIXA.get(t, t) for t in v.split("_"))


def _tipo_json(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "bool"
    if isinstance(v, (int, float)):
        return "numero"
    if isinstance(v, str):
        return "texto"
    return "lista" if isinstance(v, list) else "dicionario"


def _caminhos_json(o, cam="", tipos=None, valores=None):
    """{caminho: tipos} e {caminho: textos} (até 40 textos distintos por caminho), listas como `[]`."""
    tipos = {} if tipos is None else tipos
    valores = {} if valores is None else valores
    if isinstance(o, dict):
        itens = [(f"{cam}.{k}" if cam else str(k), v) for k, v in o.items()]
    elif isinstance(o, list):
        itens = [(f"{cam}[]", v) for v in o]
    else:
        return tipos, valores
    for c, v in itens:
        tipos.setdefault(c, set()).add(_tipo_json(v))
        if isinstance(v, str):
            vs = valores.setdefault(c, set())
            if len(vs) < 40:
                vs.add(v)
        _caminhos_json(v, c, tipos, valores)
    return tipos, valores


def _segmentos(c):
    """'a.b[].c' -> ['a', 'b', '[]', 'c'] (chave com ponto não existe nos dois JSON)."""
    out = []
    for parte in c.split("."):
        nome = parte.replace("[]", "")
        if nome:
            out.append(nome)
        out.extend(["[]"] * parte.count("[]"))
    return out


def _juntar(segs):
    s = ""
    for x in segs:
        s = s + "[]" if x == "[]" else (f"{s}.{x}" if s else x)
    return s


def bloco_tela(saida):
    """O que a TELA precisa saber para ler esta aba — e por que o renderer do Protótipo não serve.

    `mapa_de_caminhos`: todo CAMINHO do `prototipo.json` (etapa.bloco.chave, `[]` para cada item
    de lista) com o caminho que o substitui aqui, a troca (automática sobe→alta, manual por nome,
    manual por caminho), o tipo de origem e o de destino — ou o motivo de não existir. A
    conferência é por caminho, não por nome solto: um nome que existe em OUTRO lugar do JSON não
    serve de par (foi assim que `etapa_0.meio` passou sem entrada). Sobra de caminho sem par, ou
    tipo que muda sem conversão declarada, quebra o gerador na rodada completa.
    `mapa_de_valores`: campos em que o VALOR (não a chave) mudou de sobe/meio/cai para
    alta/media/baixa — o renderer compara esses valores por literal.
    O mapa é INFORMATIVO. Ele não é camada de tradução suficiente: há comparações no renderer
    que nenhum mapa corrige (ver `renderer_do_prototipo.impedimentos`). A aba precisa de
    renderer próprio.
    """
    proto = json.load(open(os.path.join(RAIZ, "dados", "prototipo.json"), encoding="utf-8"))
    proto.pop("gerado_em", None)
    TP, VP = _caminhos_json(proto)
    TN, VN = _caminhos_json(saida)
    manuais = {c: v for c, v in CAMINHOS_MANUAIS.items()}
    for c, (dest, _) in manuais.items():
        assert dest is None or dest in TN, ("caminho manual aponta para caminho que não existe aqui", c, dest)

    traducao = {}          # caminho do Protótipo -> (caminho aqui | None, como, nota)
    mapa, sem_par, tipo_sem_conversao, valores = [], [], [], []
    for c in sorted(TP, key=lambda s: (s.count(".") + s.count("[]"), s)):
        segs = _segmentos(c)
        pai = _juntar(segs[:-1]) if len(segs) > 1 else None
        if pai is not None and pai in traducao and traducao[pai][0] is None:
            traducao[c] = (None, "herdado", None)          # o pai saiu: os filhos saem junto
            continue
        base = traducao[pai][0] if pai is not None else ""
        ultimo = segs[-1]
        if c in manuais:
            dest, nota = manuais[c]
            traducao[c] = (dest, "manual por caminho", nota)
        elif c.startswith(CAMINHOS_RETIRADOS) and RG.e_resultado(ultimo):
            traducao[c] = (None, "retirada", RG.motivo_resultado(ultimo))
        else:
            if ultimo == "[]":
                cands = [("[]", "igual")]
            else:
                cands = [(ultimo, "igual"), (RENOMEADAS.get(ultimo), "automática (sobe→alta, meio→media, cai→baixa)"),
                         (TROCAS_MANUAIS.get(ultimo), "manual por nome")]
            achou = None
            for nome, como in cands:
                if not nome:
                    continue
                alvo = (base + "[]") if nome == "[]" else (f"{base}.{nome}" if base else nome)
                if alvo in TN:
                    achou = (alvo, como)
                    break
            if achou is None:
                if RG.e_resultado(ultimo):
                    traducao[c] = (None, "retirada", RG.motivo_resultado(ultimo))
                elif ultimo in REMOVIDAS:
                    traducao[c] = (None, "removida", REMOVIDAS[ultimo])
                else:
                    traducao[c] = (None, "sem par", None)
                    sem_par.append(c)
                    continue
            else:
                traducao[c] = (achou[0], achou[1], None)
        dest, como, nota = traducao[c]
        tp = sorted(TP[c] - {"null"})
        tn = sorted(TN[dest] - {"null"}) if dest else []
        if dest and tp and tn and tp != tn:
            conv = next((txt for rx, txt in TIPOS_DECLARADOS if rx.search(c)), None)
            if conv is None:
                tipo_sem_conversao.append(dict(prototipo=c, aqui=dest, tipo_prototipo=tp, tipo_aqui=tn))
            nota = nota or conv
        # entrada só onde algo muda: nome, nível, tipo, ou saída (os filhos de um caminho trocado
        # herdam a troca e só entram se trocarem de novo)
        esperado = (base + "[]") if ultimo == "[]" else (f"{base}.{ultimo}" if base else ultimo)
        if dest != esperado or (dest and tp and tn and tp != tn) or (como == "manual por caminho" and nota):
            if como == "retirada":
                mapa.append(dict(RG.retirada(ultimo), prototipo=c, aqui=None))
            else:
                mapa.append(dict(prototipo=c, aqui=dest, troca=como, tipo_prototipo=tp,
                                 tipo_aqui=tn if dest else None, **({"nota": nota} if nota else {})))
        # valores literais de faixa
        if dest and c in VP and dest in VN:
            trocados = {v: _traduzir_valor(v) for v in sorted(VP[c])
                        if v not in VN[dest] and _traduzir_valor(v) != v and _traduzir_valor(v) in VN[dest]}
            if trocados:
                valores.append(dict(prototipo=c, aqui=dest, valores=trocados))
    # No modo --rapido algumas réplicas não produzem todos os campos (ex.: vagas da etapa 14):
    # ali a sobra é gravada; na rodada completa ela quebra.
    # Saída declarada (destino nulo) de um caminho que EXISTE aqui é mentira do mapa: a tela descartaria
    # um dado que está no JSON. Vale nos dois modos.
    nulo_que_existe = sorted(c for c, (d, como, _) in traducao.items() if d is None and como != "herdado" and c in TN)
    assert not nulo_que_existe, ("mapa dá como saída um caminho que existe nesta aba", nulo_que_existe)
    assert RAPIDO or not sem_par, ("caminho do Protótipo sem par nem motivo nesta aba", sem_par)
    assert RAPIDO or not tipo_sem_conversao, ("tipo mudou sem conversão declarada", tipo_sem_conversao)
    destinos = {}
    for e in mapa:
        if e.get("aqui"):
            destinos.setdefault(e["aqui"], []).append(e["prototipo"])
    muitos_para_um = {d: o for d, o in destinos.items() if len(o) > 1}
    assert not muitos_para_um, ("dois caminhos do Protótipo no mesmo destino: a volta não seria única", muitos_para_um)

    import glob
    # `prototipo.js` é o JSON do Protótipo copiado para JS (dado, não renderer): lê-lo como código
    # contava palavra de texto como "chave lida" e punha a própria cópia do dado em `onde`
    arquivos = sorted(f for f in glob.glob(os.path.join(RAIZ, "static", "proto*.js"))
                      if os.path.basename(f) != "prototipo.js")
    txt = {os.path.basename(f): open(f, encoding="utf-8").read() for f in arquivos}
    lidas = set()
    for t in txt.values():
        lidas |= set(re.findall(r"\.([A-Za-z_]\w*)", t)) | set(re.findall(r"\[['\"]([A-Za-z_]\w*)['\"]\]", t))
    # nomes lidos pelo renderer cujo caminho no Protótipo NÃO existe igual aqui
    ultimos_trocados = {_segmentos(c)[-1] for c, (d, _, _) in traducao.items() if d != c}
    lidas_trocadas = sorted(lidas & ultimos_trocados)
    prosa = re.compile(r"subi|promovid|rebaixad|acesso|\b16 que", re.I)
    # O renderer (proto*.js) está sendo REESCRITO por outra rodada enquanto esta aba fecha (14/09). Tudo o que
    # este bloco diz dele é uma FOTO do disco no instante de `gerado_em`: padrão que deixou de casar não quebra
    # mais o gerador — vai para `padroes_sem_linha_nesta_foto`. Perseguir números de linha de um arquivo que
    # muda de hora em hora seria trabalho perdido; o bloco será refeito quando a tela fechar.
    sem_linha_nesta_foto = []

    def onde(padrao, sem_comentario=False):
        # `sem_comentario`: pula linha de comentário de bloco/linha (`/* ... */`, ` * `, `//`). A lista é o
        # checklist de LEITURAS do renderer; o cabeçalho de proto_a.js cita `d.sobe + ' contra ' + d.cai` em
        # prosa, e isso não é um ponto de leitura.
        rx = re.compile(padrao)

        def sem_comentarios(t):
            # troca cada comentário de bloco por um texto em branco com as MESMAS quebras de linha (a numeração
            # das linhas não pode mudar) e corta o comentário de linha; strings com `//` não existem nas
            # linhas que estes padrões procuram
            t = re.sub(r"/\*.*?\*/", lambda m: "\n" * m.group(0).count("\n"), t, flags=re.S)
            return re.sub(r"(?m)^\s*//.*$", "", t)

        achou = [f"{f}:{i}" for f, t in sorted(txt.items())
                 for i, l in enumerate((sem_comentarios(t) if sem_comentario else t).splitlines(), 1) if rx.search(l)]
        if not achou:
            sem_linha_nesta_foto.append(padrao)
        return achou

    def impedimento_da_firmeza():
        """A firmeza da tipologia, lida no renderer que está no disco AGORA.

        O renderer do Protótipo muda em outras rodadas (em 14/09, entre duas gerações desta aba, `const
        passaGrupo` saiu de proto_b.js e entrou `pb8Firme`). Texto fixo sobre ele envelhece: a afirmação é
        montada a partir do código que existe, e quebra se nenhuma das duas formas conhecidas estiver lá."""
        grupos_ = saida["etapa_8"]["tipologia"]["grupos"]
        if any(re.search(r"const passaGrupo", t) for t in txt.values()):
            return dict(o_que=("firmeza da tipologia recalculada: passaGrupo decide 'firme' por p_um_contra_o_resto < "
                               "corte_do_status, sem ler o status; aqui o status exige quatro condições, "
                               "corte_do_status é null e o corte do p mora em corte_do_p_um_contra_o_resto"),
                        onde=onde(r"const passaGrupo"))
        if not any(re.search(r"function pb8Firme", t) for t in txt.values()):
            # renderer em reescrita: nenhuma das duas formas conhecidas está no disco nesta foto
            return dict(o_que=("firmeza da tipologia: nesta foto o renderer não tem passaGrupo nem pb8Firme; a leitura "
                               "da firmeza não foi reconhecida e fica para quando a tela fechar"),
                        onde=[])
        status = sorted({str(g.get("status")) for g in grupos_})
        lidos = all(s.upper() in ("TIPO", "DESCRITIVO") for s in status)
        return dict(
            o_que=("firmeza da tipologia: o renderer lê o status (pb8Firme: TIPO = firme, DESCRITIVO = só descrição) "
                   "e só usa p_um_contra_o_resto < corte_do_status para apontar discordância; aqui corte_do_status é "
                   "null (o corte do p mora em corte_do_p_um_contra_o_resto), então a discordância nunca aparece. "
                   + ("Status desta aba: %s — todos lidos pelo renderer." % ", ".join(status) if lidos else
                      "Status desta aba: %s — algum fora de TIPO/DESCRITIVO cai em 'desconhecido'." % ", ".join(status))),
            impede=not lidos,
            onde=onde(r"function pb8Firme|function pb8ContaDiscorda"))

    # As afirmações dos impedimentos novos, conferidas no próprio JSON antes de gravar
    por_ano = saida["etapa_0"]["por_ano"]
    anos_completos_fora = sorted(x["ano"] for x in por_ano if x["completa"] and not x["entra_nas_medias"])
    assert anos_completos_fora == [2018, 2019, 2020, 2021], anos_completos_fora
    grupos = saida["etapa_8"]["tipologia"]["grupos"]
    assert all("status_declarado_no_documento" not in g and g.get("corte_do_status") is None for g in grupos)
    return dict(
        mapa_de_caminhos=dict(
            caminhos_do_prototipo=len(TP), entradas=len(mapa), mapa=mapa,
            sem_par_so_no_modo_rapido=sem_par, tipo_sem_conversao_so_no_modo_rapido=tipo_sem_conversao,
            saidas_sem_destino=sum(1 for e in mapa if not e.get("aqui")),
            regra=("conferência por CAMINHO: cada caminho do Protótipo tem destino aqui (igual, troca automática, "
                   "troca manual por nome ou por caminho) ou motivo; tipo que muda precisa de conversão; nenhum "
                   "destino recebe dois caminhos; sobra quebra o gerador"),
            informativo=("o mapa descreve para onde cada caminho foi; ele NÃO basta como camada de tradução "
                         "para o renderer do Protótipo (ver renderer_do_prototipo.impedimentos)")),
        mapa_de_valores=dict(
            regra="campos cujo VALOR de texto mudou de sobe/meio/cai (e SM/SC) para alta/media/baixa (e AM/AB)",
            campos=valores),
        renderer_do_prototipo=dict(
            foto=("FOTO do renderer proto*.js no instante de `gerado_em`. O renderer está sendo reescrito por outra "
                  "rodada: números de linha (`onde`), contagens e textos deste bloco envelhecem sozinhos e NÃO são "
                  "checklist; o bloco será refeito quando a tela fechar"),
            padroes_sem_linha_nesta_foto=sem_linha_nesta_foto,
            reaproveitavel=False,
            veredito="NÃO: a aba Pontos precisa de renderer próprio; o mapa é informativo",
            arquivos=sorted(txt), fora_da_leitura=dict(arquivo="prototipo.js", motivo="é o dado copiado para JS, não código"),
            nomes_lidos_pelo_renderer_com_caminho_trocado_aqui=len(lidas_trocadas),
            dessas_sao_colunas_de_resultado_retiradas=sum(1 for k in lidas_trocadas if RG.e_resultado(k)),
            linhas_de_texto_fixo_com_subida_ou_acesso={f: sum(1 for l in t.splitlines() if prosa.search(l))
                                                      for f, t in txt.items()},
            referencias_ao_global_PROTO={f: len(re.findall(r"\bPROTO\b", t)) for f, t in txt.items()},
            ids_fixos_ptEt={f: len(re.findall(r"ptEt-", t)) for f, t in txt.items()},
            impedimentos=[
                dict(o_que=("o renderer lê chaves com os nomes do Protótipo e cai em traço silencioso quando falta; "
                            "traduzir por mapa_de_caminhos não resolve os casos abaixo")),
                impedimento_da_firmeza(),
                dict(o_que=("valores de faixa comparados por LITERAL (sobe/meio/cai): cor e texto das faixas dos "
                            "pares, grupo do alvo da etapa 14 (alvo.replace('margem_','') contra as chaves fixas "
                            "sobe/caro/barato/cai: o C_anti_queda sairia sempre 'o alvo não foi alcançado'); "
                            "os campos estão em mapa_de_valores"),
                     onde=onde(r"function pbCorFaixa|function pbFaixaTxt|replace\('margem_'|prox_sobe")),
                dict(o_que=("as quatro chaves d_minimo_16x* (16x16, 16x48, 16x64, 16x16_bonferroni) são lidas no "
                            "topo de poder e não existem aqui (aqui é poder.<universo>.<comparação>.d_minimo, e "
                            "mapa_de_caminhos diz qual); o filtro descarta os quatro recortes, nada é subtraído, e o "
                            "cartão do poder diz que o JSON não traz limite nenhum — quando ele traz três universos"),
                     onde=onde(r"d_minimo_16x")),
                dict(o_que=("contagens da etapa 0 lidas no topo (d.sobe/d.meio/d.cai, d.linhas_completas, "
                            "d.linhas_no_arquivo; e0.linhas_completas em proto.js): aqui o topo é separado por "
                            "universo (universo_80_2022_2025, universo_2018_2021), não há linhas_completas solto e "
                            "linhas_no_arquivo virou linhas_no_arquivo_por_painel; ptInt(d.meio + d.cai) soma dois "
                            "undefined e escreve NaN na tela"),
                     onde=onde(r"\b(d|e0)\.(sobe|meio|cai|linhas_completas|linhas_no_arquivo)\b", sem_comentario=True)),
                dict(o_que=("o renderer entende entra_nas_medias=false como ano INCOMPLETO: monta a lista 'fora' com "
                            "esses anos, diz que o campeonato parou na rodada J de %d, pinta o ano como 'fora da "
                            "conta' e escreve 'não — J de %d'. Aqui %s estão completos (38 de 38) e fora só do "
                            "universo das 80" % (saida["etapa_0"]["rodadas_completa"],
                                                 saida["etapa_0"]["rodadas_completa"],
                                                 "-".join(str(a) for a in (anos_completos_fora[0], anos_completos_fora[-1])))),
                     onde=onde(r"entra_nas_medias|ptInt\(d\.rodadas_completa\)")),
                dict(o_que=("tipologia lida contra chaves que esta aba não copia: a divergência com o documento "
                            "(g.status !== g.status_declarado_no_documento) é acusada nos %d grupos porque o "
                            "declarado não foi copiado e undefined difere de qualquer status; e o corte nulo é impresso "
                            "com ptNum(null) na frase do corte (a leitura do corte na firmeza está no impedimento da "
                            "firmeza, montado do código no disco)" % len(grupos)),
                     onde=onde(r"status_declarado_no_documento|p_declarado_no_documento|ptNum\(g\.corte_do_status")),
                dict(o_que=("o texto fixo do renderer diz 'times que subiram' onde aqui estão os da faixa alta, que "
                            "inclui quem não subiu: nenhuma frase dele pode ser herdada")),
                dict(o_que=("o renderer lê o global PROTO também para cruzar etapas e usa ids fixos: com as duas abas "
                            "na mesma página puxaria números do Protótipo e as tabelas colidiriam")),
            ]))


def contar_marcas(o):
    """Quantas referências declaradas como retiradas o JSON carrega (para a guarda não ser vazia)."""
    if isinstance(o, dict):
        return int(RG.MARCA_RETIRADA in o) + sum(contar_marcas(v) for v in o.values())
    if isinstance(o, list):
        return sum(contar_marcas(x) for x in o)
    return 0


def recontar_etapa_3(e3, linhas_cat):
    """Refaz as contagens de p e q da etapa 3 sem o idioma `(p or 1) < 0,05`.

    `P.etapa_3` conta `passam5_SC` com `(L["p_bruto_SC"] or 1) < 0.05`, e o `p_bruto_SC` da
    etapa 2 vem arredondado a 4 casas: nesta aba cinco p de alta x baixa saem 0,0 e sumiriam da
    contagem. As contagens são refeitas aqui (sem editar o gerador) e o que mudou vai ao JSON.
    """
    campos = dict(passam5_SM="p_bruto_SM", bh5_SM="q_SM", passam5_SC="p_bruto_SC", bh5_SC="q_SC",
                  passam5_liq_SM="p_liq_SM", bh5_liq_SM="q_liq_SM")
    mudou = {}
    for chave, campo in campos.items():
        novo = int(sum(1 for L in linhas_cat if abaixo(L.get(campo), 0.05)))
        if e3.get(chave) != novo:
            mudou[chave] = dict(gerador=e3.get(chave), recontado=novo)
        e3[chave] = novo
        for fam, rf in e3.get("por_familia", {}).items():
            n = int(sum(1 for L in linhas_cat if L["familia"] == fam and abaixo(L.get(campo), 0.05)))
            if rf.get(chave) != n:
                mudou[f"por_familia.{fam}.{chave}"] = dict(gerador=rf.get(chave), recontado=n)
            rf[chave] = n
    e3["recontagem"] = dict(
        motivo=("o gerador do Protótipo conta com `(p or 1) < 0,05`, e p arredondado a 0,0 vira 1; "
                "as contagens foram refeitas tratando 0,0 como passou"),
        p_arredondados_a_zero={campo: int(sum(1 for L in linhas_cat if L.get(campo) == 0))
                               for campo in dict.fromkeys(campos.values())},
        mudou=mudou)
    # o selo de porta do Protótipo usa `(p_bruto_SM or 1) < 0,10` para escolher o motivo: se um
    # p_bruto_SM sair 0,0 o motivo sai errado, e isso não se conserta daqui — então quebra
    assert not [L["indicador"] for L in linhas_cat if L.get("p_bruto_SM") == 0], \
        "p_bruto_SM arredondado a 0,0: o motivo da porta do Protótipo sairia errado"


# ══════════════════════════════════════════════════════════════════════════════
#  main — a MESMA ordem do main do gerador do Protótipo
# ══════════════════════════════════════════════════════════════════════════════

def main():
    global ROTULOS
    t0 = dt.datetime.now()
    P.DECL = P.carregar_declaracao()
    print(f"lista pré-declarada: versão {P.DECL['versao']} · listas de resultado {RG.VERSAO_DAS_LISTAS}")

    # 2-3. painéis e jogos (loaders próprios: os do gerador leem só 2022-2025)
    d80, dv, d26, regua, cortes = carregar_paineis()
    ROTULOS = rotulos_da_regua(*cortes)
    jogos, jogos26 = carregar_jogos()
    jog = jogos[BLOCO_NOVO]
    # 4-6. técnico, elencos, mercado, SkillCorner
    # O arquivo técnico traz 2026. `montar_matriz` e `backtest_nota` cortam por conta própria,
    # mas `etapa_11` não corta (pares 2025→2026 entram na persistência do atleta) e a etapa 5
    # recebe o arquivo inteiro. Aqui todo uso recebe o recorte até 2025; o arquivo inteiro só
    # vai ao backtest, que corta com assert e grava quais anos existiam.
    tec = P.carregar_tecnico()
    tec25 = tec[tec.ano <= ANO_MAXIMO].copy()
    sem_2026(tec25)
    elencos = pd.read_csv(os.path.join(RAIZ, "dados", "serieb_elencos.csv"), low_memory=False)
    base_j = json.load(open(os.path.join(RAIZ, "dados", "jogadores.json"), encoding="utf-8"))
    P.PERIODO = base_j["periodo"]
    jogs = base_j["jogadores"]
    kpis = json.load(open(os.path.join(RAIZ, "dados", "kpis.json"), encoding="utf-8"))
    sc = G.carregar()
    sem_2026(sc, jog, jogos[BLOCO_VELHO])
    faixa_pts = {(int(a), c): f for a, c, f in zip(d80.ano, d80.clube, d80.faixa_pts)}
    assert all((int(a), c) in faixa_pts for a, c in zip(sc.ano, sc.clube))
    sc_pos = sc.copy()                      # etapa 11 não depende de faixa: lê o original
    sc = sc.copy()
    sc["faixa_posicao"] = sc.faixa
    sc["faixa"] = [INTERNO[faixa_pts[(int(a), c)]] for a, c in zip(sc.ano, sc.clube)]
    print(f"painel {len(d80)}+{len(dv)} · jogos {len(jog)}+{len(jogos[BLOCO_VELHO])} · tecnico {len(tec)} · "
          f"skillcorner {len(sc)} · mercado {len(jogs)} ({P.PERIODO})")

    # 7. matriz
    bruto, postos, meta, vazios, ns_ti = P.montar_matriz(d80, tec25)
    circ = [c for c in meta if RG.e_resultado(meta[c]["coluna_csv"]) or RG.e_resultado(c)]
    assert not circ, ("indicador circular no catálogo", circ)
    assert not [c for c in P.DECL["tecnico_ind"] if RG.PLACAR_INDIVIDUAL.search(c)]
    assert not [c for c, m in meta.items() if m.get("jogo") in RG.PLACAR_JOGO], "coluna de placar no catálogo"
    print(f"matriz {bruto.shape[0]}x{bruto.shape[1]}")

    # 8-10. confiabilidade, porta temporal, persistência
    e4 = P.etapa_4(jog, meta)
    conf = {L["indicador"]: L.get("conf") for L in e4["linhas"]}
    e7 = porta_temporal(jog, meta, "80 clube-temporada de 2022-2025")
    temporal = {L["indicador"]: L for L in e7["linhas"]}
    pares = P.pares_consecutivos(d80)
    e6 = P.etapa_6(d80, postos, meta, pares)
    persist = e6["rho"]
    dd = d80.reset_index(drop=True)
    e6["pares"] = [dict(clube=c, ano_t=an, ano_t1=an + 1, faixa_t=dd.faixa_pts[i], faixa_t1=dd.faixa_pts[j],
                        faixa_posicao_t=dd.faixa_posicao[i], faixa_posicao_t1=dd.faixa_posicao[j])
                   for i, j, c, an in pares]
    b_idx = [p[1] for p in pares]
    # "Sem ano anterior na Série B" é um fato sobre a Série B, e esta aba tem os DOIS painéis:
    # olhar só 2022-2025 contava os quatro da alta de 2022 como vindos de fora, e Cruzeiro e
    # Vasco estavam na B em 2021. A contagem só dentro do painel fica ao lado, com outro nome.
    na_serie_b = set(zip(d80.ano.astype(int), d80.clube)) | set(zip(dv.ano.astype(int), dv.clube))
    alta_dd = dd[dd.faixa_pts == "alta"]
    sem_ant = [f"{c} {int(a)}" for a, c in zip(alta_dd.ano, alta_dd.clube) if (int(a) - 1, c) not in na_serie_b]
    com_ant_fora = [f"{c} {int(a)}" for a, c in zip(alta_dd.ano, alta_dd.clube)
                    if (int(a) - 1, c) in na_serie_b and (int(a) - 1, c) not in set(zip(d80.ano.astype(int), d80.clube))]
    n_alta_tr = int((dd.faixa_pts == "alta").sum())
    _dentro = int(sum(dd.faixa_pts[j] == "alta" for j in b_idx))
    assert (n_alta_tr - len(sem_ant)) - _dentro == len(com_ant_fora), \
        ("o truncamento não fecha: dois painéis - dentro de 2022-2025 != ano anterior só em 2018-2021",
         n_alta_tr, len(sem_ant), _dentro, com_ant_fora)
    e6["truncamento"] = dict(pares=len(pares),
                             terminaram_em_alta=int(sum(dd.faixa_pts[j] == "alta" for j in b_idx)),
                             regra_terminaram_em_alta="pares t→t+1 DENTRO de 2022-2025 que terminam na alta",
                             terminaram_em_alta_olhando_os_dois_paineis=n_alta_tr - len(sem_ant),
                             regra_terminaram_em_alta_olhando_os_dois_paineis=(
                                 "clube-temporada da alta cujo clube está no painel da Série B no ano anterior, "
                                 "olhando os dois painéis: é a contagem que fecha com a de sem ano anterior"),
                             fechamento=dict(com_ano_anterior_na_serie_b=n_alta_tr - len(sem_ant),
                                             sem_ano_anterior_na_serie_b=len(sem_ant), alta_total=n_alta_tr,
                                             regra=("com ano anterior na Série B (dois painéis) + sem ano anterior "
                                                    "= alta total; a diferença entre as duas contagens de 'com ano "
                                                    "anterior' são os da alta de 2022 cujo ano anterior está só no "
                                                    "painel 2018-2021")),
                             alta_total=n_alta_tr,
                             alta_sem_ano_anterior_na_serie_b=len(sem_ant),
                             alta_sem_ano_anterior_na_serie_b_quem=sem_ant,
                             regra_sem_ano_anterior=("clube-temporada da alta cujo clube NÃO está no painel da Série B "
                                                     "no ano anterior, olhando os dois painéis (2018-2021 e 2022-2025)"),
                             alta_sem_par_no_painel_2022_2025=int(n_alta_tr - sum(dd.faixa_pts[j] == "alta" for j in b_idx)),
                             regra_sem_par_no_painel=("alta total menos os pares t→t+1 dentro de 2022-2025 que terminam "
                                                      "na alta: inclui a alta de 2022, que não tem par dentro do painel"),
                             ano_anterior_so_no_painel_2018_2021=com_ant_fora,
                             terminaram_em_subida_real=int(sum(bool(dd.subiu_de_fato[j]) for j in b_idx)))
    e6.update(estado_nesta_aba="adaptada",
              o_que_mudou=("os ρ de persistência não dependem da faixa e são idênticos; o truncamento conta a alta e "
                           "olha o ano anterior nos dois painéis"),
              **RG.marca_consequencia(list(e6.get("rho", {})) + list(e6.get("dispersao", {}))))

    # 11-12. catálogo e bootstrap
    linhas_cat, resumo_fam, liq = P.etapa_2(d80, bruto, postos, meta, conf, temporal, persist, ns_ti)
    for L in linhas_cat:
        L["resultado"] = RG.e_resultado(L["coluna_csv"])
        assert not L["resultado"]
        mc = RG.motivo_consequencia(L["coluna_csv"])
        L["consequencia_do_resultado"] = bool(mc)
        if mc:
            L["motivo_consequencia"] = mc
    print("bootstrap por clube...")
    with rng_do_gerador("bootstrap_por_clube", 12):
        ics = P.bootstrap_por_clube(d80, postos, liq, list(postos.columns))
    for L in linhas_cat:
        L.update(ics[L["indicador"]])

    # 13-15.
    print("nulo do garimpo...")
    e3 = P.etapa_3(d80, postos, meta, linhas_cat, resumo_fam)
    ng = e3["nulo_do_garimpo"]
    ng["metodo"] = ("embaralha as LINHAS dentro de cada ano — o clube-temporada leva os %d indicadores "
                    "juntos, então a correlação ENTRE indicadores fica intacta e só o vínculo com a faixa é "
                    "quebrado; a seleção do melhor entre N é refeita em cada réplica" % ng["indicadores"])
    ng["gerador"] = "np.random.default_rng([7, 3]) — próprio, dentro do gerador do Protótipo"
    GERADORES["garimpo_etapa_3"] = "np.random.default_rng([7, 3]) — criado dentro de P.etapa_3"
    GERADORES["valor_por_setor_etapa_1"] = "np.random.default_rng([7, 11]) — criado dentro de P.valor_por_setor"
    recontar_etapa_3(e3, linhas_cat)
    e3.update(estado_nesta_aba="adaptada", comparacao="alta x media",
              linhas_na_comparacao=int(((d80.faixa_pts == "alta") | (d80.faixa_pts == "media")).sum()),
              o_que_mudou="o garimpo roda em alta x média; a frase do método é montada com o nº medido")
    e1 = etapa_1(d80, d26, jogos26)
    e5 = P.etapa_5(d80, bruto, postos, meta, vazios, ns_ti, tec25)
    info = {(int(a), c): (bool(s), fp, ap) for a, c, s, fp, ap in
            zip(d80.ano, d80.clube, d80.subiu_de_fato, d80.faixa_posicao, d80.aproveitamento)}
    sem_faixa = {}
    for nome, pn in e5["paineis"].items():
        for cl in pn["clubes"]:
            s, fp, ap = info[(cl["ano"], cl["clube"])]
            cl.update(subiu_de_fato=s, faixa_posicao=fp, aproveitamento_pct=r(100 * ap, 1))
        sem_faixa[nome] = {f: int(sum(1 for x in pn[f"faixa_{INTERNO[f]}"] if x[0] is None)) for f in ORDEM}
        for ind in pn.get("indicadores", []):
            mc = RG.motivo_consequencia(ind.get("coluna_csv"))
            if mc:
                ind.update(consequencia_do_resultado=True, motivo_consequencia=mc)
    e5.update(estado_nesta_aba="adaptada",
              o_que_mudou=("as linhas são os %d da alta (com `subiu_de_fato`); faixas nas duas escalas"
                           % int((d80.faixa_pts == "alta").sum())),
              indicadores_sem_4_valores_na_faixa=sem_faixa)
    E, Z, itens_eixo = P.eixos_matriz(d80, postos)
    assert not [c for its in itens_eixo.values() for c in its if RG.e_resultado(c)]

    # 17.
    print("silhuetas e tipologia...")
    e8 = etapa_8(d80, postos, jog, Z, itens_eixo)
    # 18-21.
    e9 = P.etapa_9(d80, E, itens_eixo, postos, linhas_cat)
    alta_rows = d80[d80.faixa_pts == "alta"]
    for reg in e9["reguas"]:
        its = itens_eixo[reg["eixo"]]
        reg["consequencia_do_resultado"] = bool(its) and all(RG.motivo_consequencia(c) for c in its)
        reg.update(RG.marca_consequencia(its))
    e9.update(estado_nesta_aba="adaptada", o_que_mudou="d e q em alta x média; a lista da alta vem com o clube",
              alta_clubes=[dict(clube=c, ano=int(a), subiu_de_fato=bool(s))
                           for c, a, s in zip(alta_rows.clube, alta_rows.ano, alta_rows.subiu_de_fato)])
    e10 = etapa_10(d80, linhas_cat, pares)
    # A etapa 11 não depende de faixa, mas o gerador do Protótipo a roda com o arquivo técnico
    # INTEIRO, e pares 2025→2026 (27 de 38 rodadas) entram na persistência técnica do atleta.
    # Aqui ela roda sem 2026; a rodada com 2026 é feita só para MEDIR o efeito, que vai ao JSON.
    e11_com_2026 = P.etapa_11(tec, sc_pos)
    e11 = P.etapa_11(tec25, sc_pos)
    e11.update(estado_nesta_aba="adaptada",
               o_que_mudou=("a persistência não depende de faixa; o técnico roda SEM 2026 (o gerador do "
                            "Protótipo inclui pares 2025→2026)"),
               efeito_de_retirar_2026=dict(
                   pares_mudou=dict(com_2026=e11_com_2026["tecnico"]["pares_mudou"],
                                    sem_2026=e11["tecnico"]["pares_mudou"]),
                   pares_ficou=dict(com_2026=e11_com_2026["tecnico"]["pares_ficou"],
                                    sem_2026=e11["tecnico"]["pares_ficou"]),
                   rho_mediano_mudou=dict(com_2026=e11_com_2026["tecnico"]["rho_mediano_mudou"],
                                          sem_2026=e11["tecnico"]["rho_mediano_mudou"]),
                   rho_mediano_ficou=dict(com_2026=e11_com_2026["tecnico"]["rho_mediano_ficou"],
                                          sem_2026=e11["tecnico"]["rho_mediano_ficou"])))
    print("funil, encaixe e elencos...")
    e12, pool = P.etapa_12(jogs, elencos)
    e12.update(estado_nesta_aba="completa", o_que_mudou="nada: o funil dos livres não depende de faixa")

    # 22-24.
    raio_p = raio_nas_faixas_de_pontos(sc)
    corrigido = P.sobecai_corrigido(sc, raio_p)
    rank_min = d80.groupby("ano").tm_valor_total.rank(ascending=False, method="min")
    posto_val = {(int(a), c): int(p) for a, c, p in zip(d80.ano, d80.clube, rank_min)}
    k_por_ano = {int(a): int((g.faixa_pts == "alta").sum()) for a, g in d80.groupby("ano")}
    alvos = alvos_fisicos(sc, corrigido, posto_val, k_por_ano)
    P.indicadores_do_setor = indicadores_do_setor
    # 25-27.
    bt = P.backtest_nota(tec, sc, alvos)
    bt["nota"] = "margem = proximidade ao vetor da faixa alta menos proximidade ao vetor da faixa baixa, do setor"
    with rng_do_gerador("erro_da_margem_etapa_13", 13):
        e13 = P.etapa_13(pool, jogs, kpis, alvos, bt)
    for setor, reg in corrigido.items():       # mesma armadilha do `(p or 1)` no gerador
        reg["p5_clube"] = int(sum(1 for x in reg["itens"] if abaixo(x["p_clube"], 0.05)))
    tg = e13.get("trilha_goleiro") or {}
    sem_teste = {c: dict(motivo=RG.motivo_resultado(c),
                         por_que=("percentil do goleiro CANDIDATO dentro da coorte da própria liga (kpis.json, "
                                  "mercado); não é comparado com faixa nenhuma desta aba e não entra em média, "
                                  "corte, teste nem na nota física de encaixe"))
                 for c in tg.get("indicadores", []) if RG.e_resultado(c)}
    if sem_teste:
        tg[RG.MARCA_SEM_TESTE] = sem_teste
    no_top_k = np.array([posto_val[(int(a), c)] <= k_por_ano[int(a)] for a, c in zip(d80.ano, d80.clube)])
    caro = d80[(d80.faixa_pts == "alta").values & no_top_k]
    e13["ordenacao"]["o_que_e"] = "margem do cenário alta dividida pelo teto do próprio setor"
    e13["ordenacao"]["motivo"] = e13["ordenacao"]["motivo"].replace("pct_sobe", "pct_alta").replace("pct_cai", "pct_baixa")
    e13["pesos"]["origem"] = ("digitados no gerador do Protótipo (faixas de ρ da etapa 11), copiados como estão; "
                              "não dependem da faixa")
    e13["regra_dos_cenarios"] = dict(
        alta="clube-temporada da faixa alta",
        caro="alta E entre os k mais caros do ano, k = tamanho da alta naquele ano (posto com method='min')",
        barato="alta fora desse top-k", baixa="clube-temporada da faixa baixa",
        k_por_ano=k_por_ano,
        clube_temporada_por_cenario=dict(
            alta=int((d80.faixa_pts == "alta").sum()), caro=len(caro),
            barato=int((d80.faixa_pts == "alta").sum()) - len(caro),
            baixa=int((d80.faixa_pts == "baixa").sum())),
        caro_lista=[f"{c} {int(a)}" for c, a in zip(caro.clube, caro.ano)],
        motivo=("o top-8 do Protótipo foi escolhido para 4 vagas por ano; com a alta de tamanho variável, "
                "o análogo sem número escolhido é o top-k com k = tamanho da alta (o mesmo da etapa 1)"))
    e13["teste_por_atleta"] = dict(origem="refeito nas faixas de pontos (não lido do raio_ref.json)",
                                   **raio_p["sobecai"]["familia"])
    e13.update(estado_nesta_aba="adaptada",
               o_que_mudou=("alvos alta/caro/barato/baixa, teste por clube e por atleta refeitos nas faixas de "
                            "pontos; o critério do setor é montado com os n medidos"))
    with rng_do_gerador("reamostragem_etapa_14", 14):
        e14 = P.etapa_14(e13["candidatos"], d80, elencos)
    dq = d80.copy()
    dq["r_val"] = posto_ano(dq, "tm_valor_total")
    qq = pd.qcut(dq.r_val, 4, labels=[1, 2, 3, 4])
    taxa_sub = {int(l): r(100 * g.subiu_de_fato.mean(), 1) for l, g in dq.groupby(qq, observed=True)}
    e14["taxa_de_alta_por_quartil_pct"] = e14.pop("taxa_de_subida_por_quartil_pct")
    e14["taxa_de_subida_real_por_quartil_pct"] = taxa_sub
    ncen = alvos["_n_clube_por_cenario"]
    signif = dict(
        A_caro=f"perfil FÍSICO dos clube-temporada da alta no top-k de valor do ano (até {ncen.get('caro')} com o indicador)",
        B_barato_transicao=f"perfil FÍSICO da alta fora do top-k de valor (até {ncen.get('barato')} com o indicador)",
        C_anti_queda=(f"distância ao perfil da faixa baixa, até {ncen.get('sobe')} contra "
                      f"{ncen.get('cai')} clube-temporada com o indicador"))
    for chave, pr in e14["propostas"].items():
        if pr.get("possivel"):
            pr["alvo_significa"] = signif[pr["cenario"]]
            cf = pr["contrafactual"]
            cf["taxa_historica_de_alta_do_quartil_pct"] = cf.pop("taxa_historica_de_subida_do_quartil_pct")
            cf["taxa_historica_de_subida_real_do_quartil_pct"] = taxa_sub.get(cf["quartil"])
    cat_idx = {L["indicador"]: L for L in linhas_cat}
    jd = e14["justificativa_no_dado"]
    jd["porta"] = cat_idx["share_11"]["porta"]
    jd["porta_de"] = "share_11, lida do catálogo (etapa_2)"
    # "Time que ganha repete o XI" justificando proposta: sem a marca, share_11 67 x 59 lê como
    # receita. As colunas saem das próprias chaves do bloco (<coluna>_<faixa>).
    cols_jd = [k.rpartition("_")[0] for k in jd if k.rpartition("_")[2] in ("sobe", "cai", "meio")]
    jd.update(consequencia_do_resultado=True, **RG.marca_consequencia(cols_jd))
    e14.update(estado_nesta_aba="adaptada",
               o_que_mudou=("propostas pelos alvos da faixa alta; o contrafactual publica a taxa de ALTA e a taxa "
                            "de SUBIDA REAL do quartil, com rótulos distintos"))
    # 28.
    e15 = P.etapa_15(jog, d80, dict(
        serieb_clube_temporada_colunas=len(d80.columns), serieb_jogos_colunas=len(jog.columns) - 3,
        serieb_tecnico_colunas=len(tec.columns) - 3, serieb_elencos_colunas=len(elencos.columns),
        jogadores_json_campos=len({c for x in jogs for c in x}),
        procurado_em="dados/*.csv, dados/*.json e os arquivos do ogol"))
    ps = e15["proxy_sistema"]
    ps["trocas_medianas_por_clube_temporada"] = ps.pop("trocas_medianas_em_38_jogos")
    ps["jogos_por_clube_temporada"] = sorted({int(x) for x in jog.groupby(["ano", "Equipa"]).size()})
    cr = e15["coleta_que_resolveria"]
    cr["clube_temporada"] = len(d80) + len(d26) + len(dv)
    cr["clube_temporada_de"] = "painéis 2018-2021 e 2022-2026"
    rp = e6["rho"]
    cr["perguntas_que_passariam_a_ser_respondiveis"][1] = (
        "se ppda (rho=%s) e posse (rho=%s) passam a persistir quando se condiciona a permanência do técnico"
        % (num_br(rp["ppda"]["rho"]), num_br(rp["posse"]["rho"])))
    e15.update(estado_nesta_aba="adaptada",
               o_que_mudou="os grupos são as faixas de pontos; contagens e ρ montados com o dado")

    # blocos que só esta aba tem
    print("técnico 2018-2025 e tabelas de gaps...")
    tc_cols = [it["col"] for it in P.DECL["tecnico_col"]]
    meta_tc = {c: meta[c] for c in tc_cols}
    tec160 = tecnico_2018_2025(d80, dv, jogos, meta_tc, tc_cols)

    # Series indexada por (ano, clube), não `.values`: `tabela_de_gaps` realinha pela chave dos postos
    # e recusa vetor sem índice (com `.values` a conferência de ordem nunca rodava). Mesma conta do
    # `posto_ano` do Protótipo (percentil dentro do ano, empate pela média).
    r_val = d80.set_index(["ano", "clube"]).groupby(level="ano")["tm_valor_total"].rank(pct=True) * 100
    assert np.allclose(r_val.to_numpy(), posto_ano(d80, "tm_valor_total").to_numpy(), equal_nan=True)
    controles = RG.controles_de_atletas_rastreados(meta, d80)
    # O outro período recebe TODA coluna do catálogo que existe no painel de 2018-2021, não só as
    # técnicas coletivas: "não dá para testar" tem de ser falta de dado, não de chamada. Só entram
    # famílias que o catálogo lê direto da coluna do painel (técnico coletivo e elenco).
    cols_outro = [c for c in postos.columns if meta[c]["coluna_csv"] in dv.columns]
    assert all(meta[c]["familia"] in ("tecnico_col", "elenco") for c in cols_outro), \
        [c for c in cols_outro if meta[c]["familia"] not in ("tecnico_col", "elenco")]
    # Rodada 4: anos, rótulos e o outro período também vão com a chave (ano, clube). `tabela_de_gaps` agora
    # recusa vetor sem índice para TODO vetor por linha — um sort_index nos postos com as faixas em `.values`
    # zerava os sobreviventes sem erro (ver `RG.autoteste_do_alinhamento`).
    dvp = pd.DataFrame({c: dv.groupby("ano")[meta[c]["coluna_csv"]].rank(pct=True).values * 100 for c in cols_outro},
                       index=pd.MultiIndex.from_frame(dv[["ano", "clube"]]))
    rk = RG.tabela_de_gaps(RG.pela_chave(d80, "ano"), postos, bruto, RG.pela_chave(d80, "faixa_pts"),
                           list(postos.columns), ORDEM,
                           r_val=r_val, controles=controles, meta=meta,
                           outro=dict(postos=dvp, rotulos=RG.pela_chave(dv, "faixa_pts"), anos=RG.pela_chave(dv, "ano"),
                                      rotulo=BLOCO_VELHO),
                           rotulo_universo="80 clube-temporada de 2022-2025, catálogo pré-declarado",
                           semente=(SEMENTE, 23), nomes_das_faixas=ROTULOS, ano_maximo=ANO_MAXIMO)
    GERADORES["linha_da_sorte_2022_2025"] = rk["linha_da_sorte"]["gerador"]
    rk["outro_periodo_colunas"] = dict(
        do_catalogo_no_painel_2018_2021=len(cols_outro), testadas=len(cols_outro),
        por_familia={f: sum(1 for c in cols_outro if meta[c]["familia"] == f)
                     for f in sorted({meta[c]["familia"] for c in cols_outro})},
        regra="toda coluna do catálogo presente em serieb_clube_temporada_2018_2021.csv, posto dentro do ano")
    # A MESMA tabela com as faixas por posição: é a conferência do módulo compartilhado contra a
    # prévia que o dono leu (PENDENTE_RODADA.md, itens 6 e 7). Só o resumo e a linha da sorte vão
    # ao JSON — as linhas por posição são da outra aba. Os rótulos ficam como lista de texto,
    # para a troca de chaves sobe→alta desta aba não os tocar.
    rk_pos = RG.tabela_de_gaps(RG.pela_chave(d80, "ano"), postos, bruto, RG.pela_chave(d80, "faixa_posicao"),
                               list(postos.columns), ("sobe", "meio", "cai"), r_val=r_val, controles=controles, meta=meta,
                               rotulo_universo="80 clube-temporada de 2022-2025, faixas por POSIÇÃO",
                               semente=(SEMENTE, 23), ano_maximo=ANO_MAXIMO)
    duelo = next(L for L in rk_pos["linhas"] if L["indicador"] == "ti_meio_duelos_defensivos_ganhos")
    rk["mesma_tabela_com_as_faixas_por_posicao"] = dict(
        para_que=("conferir o módulo compartilhado contra a prévia da aba de posição publicada em "
                  "_fonte/prototipo/PENDENTE_RODADA.md (itens 6 e 7)"),
        faixas_na_ordem=["sobe", "meio", "cai"], teste=rk_pos["teste"],
        linha_da_sorte=rk_pos["linha_da_sorte"], resumo=rk_pos["resumo"],
        ti_meio_duelos_defensivos_ganhos=dict(
            ordem_no_ranking=duelo["ordem"], gap=duelo["gap"],
            posicao_media_na_ordem_das_faixas=[duelo["posicao_media"][g] for g in ("sobe", "meio", "cai")],
            destoa=duelo["destoa"], lado=duelo["lado"], q=duelo["q"],
            p_descontado_dinheiro=duelo.get("p_descontado_dinheiro")))
    GERADORES["linha_da_sorte_por_posicao"] = rk_pos["linha_da_sorte"]["gerador"]

    # `clube` entra para a chave (ano, clube): os dois painéis não se sobrepõem em ano, então ela é única
    base160 = pd.concat([d80[["ano", "clube", "faixa_pts", "bloco"] + tc_cols],
                         dv[["ano", "clube", "faixa_pts", "bloco"] + tc_cols]], ignore_index=True)
    chave160 = pd.MultiIndex.from_frame(base160[["ano", "clube"]])
    p160 = pd.DataFrame({c: base160.groupby("ano")[c].rank(pct=True).values * 100 for c in tc_cols}, index=chave160)
    b160 = pd.DataFrame(base160[tc_cols].astype(float).to_numpy(), columns=tc_cols, index=chave160)
    rk160 = RG.tabela_de_gaps(RG.pela_chave(base160, "ano"), p160, b160, RG.pela_chave(base160, "faixa_pts"),
                              tc_cols, ORDEM, r_val=None, meta=meta_tc,
                              rotulo_universo="técnico coletivo 2018-2025 (160 clube-temporada)",
                              semente=(SEMENTE, 24), nomes_das_faixas=ROTULOS, ano_maximo=ANO_MAXIMO)
    GERADORES["linha_da_sorte_tecnico_160"] = rk160["linha_da_sorte"]["gerador"]
    por_bloco = {}
    for b, sem in ((BLOCO_NOVO, 25), (BLOCO_VELHO, 26)):
        m = (base160.bloco == b).values
        sub = base160[m]
        por_bloco[b] = RG.tabela_de_gaps(RG.pela_chave(sub, "ano"), p160[m], b160[m],
                                         RG.pela_chave(sub, "faixa_pts"), tc_cols, ORDEM, r_val=None, meta=meta_tc,
                                         rotulo_universo=f"técnico coletivo {b}", semente=(SEMENTE, sem),
                                         nomes_das_faixas=ROTULOS, ano_maximo=ANO_MAXIMO)
        GERADORES[f"linha_da_sorte_tecnico_{b}"] = por_bloco[b]["linha_da_sorte"]["gerador"]
    pb_idx = {b: {L["indicador"]: L for L in t["linhas"]} for b, t in por_bloco.items()}
    for L in rk160["linhas"]:
        L["mediana_crua"] = None
        L["motivo_mediana_crua"] = "valor cru não se junta entre blocos (mando mudou): ver `por_bloco`"
        L["por_bloco"] = {b: dict(gap=pb_idx[b][L["indicador"]]["gap"], destoa=pb_idx[b][L["indicador"]]["destoa"],
                                  lado=pb_idx[b][L["indicador"]]["lado"], p=pb_idx[b][L["indicador"]]["p"],
                                  mediana_crua=pb_idx[b][L["indicador"]]["mediana_crua"])
                          for b in por_bloco}
        so = [pb_idx[b][L["indicador"]] for b in por_bloco]
        L["mesmo_grupo_e_lado_nos_dois_blocos"] = bool(so[0]["destoa"] is not None
                                                       and so[0]["destoa"] == so[1]["destoa"]
                                                       and so[0]["lado"] == so[1]["lado"])
    rk160["linha_da_sorte_por_bloco"] = {b: t["linha_da_sorte"] for b, t in por_bloco.items()}

    todas_cols = sorted(set(d80.columns) | set(dv.columns), key=str)
    circulares = dict(
        o_que_e=("colunas que viraram pedaço da definição das faixas (ou reescala de gols): ficam FORA de "
                 "todo teste, eixo, bateria, agrupamento e nota desta aba"),
        versao=RG.VERSAO_DAS_LISTAS,
        colunas=[dict(coluna=c, motivo=RG.motivo_resultado(c), **{RG.MARCA_RETIRADA: RG.motivo_resultado(c)},
                      existe_em=[b for b, d in ((BLOCO_NOVO, d80), (BLOCO_VELHO, dv)) if c in d.columns])
                 for c in todas_cols if RG.e_resultado(c)],
        consequencia=[dict(coluna=c, motivo=RG.motivo_consequencia(c),
                           existe_em=[b for b, d in ((BLOCO_NOVO, d80), (BLOCO_VELHO, dv)) if c in d.columns])
                      for c in todas_cols if RG.motivo_consequencia(c)],
        aplicado_em=["catálogo (etapa 2)", "tabelas de gaps", "eixos (etapas 8 e 9)",
                     "bateria e leitura da tipologia", "técnico 2018-2025", "porta temporal (colunas de placar)"],
        listas_declaradas=RG.listas_declaradas())

    saida = {
        "_doc": ("Aba Pontos: as dezesseis etapas do Protótipo com faixas de APROVEITAMENTO (alta/media/baixa) no "
                 "lugar de sobe/meio/cai. Só número medido; ausência com motivo; cada bloco diz o universo."),
        "gerado_em": t0.strftime("%Y-%m-%d %H:%M"),
        "gerado_por": "gerar_pontos.py (usa gerar_prototipo.py como biblioteca, sem editá-lo)",
        "semente": SEMENTE,
        "replicas": dict(bootstrap_clube=P.N_BOOT, garimpo=P.N_GARIMPO, nulo_silhueta=P.N_NULO,
                         jaccard=P.N_JACCARD, elencos=P.N_ELENCO, erro_da_margem=P.N_ERRO, rapido=RAPIDO),
        "bases": dict(
            painel_2022_2026=dict(arquivo="dados/serieb_clube_temporada.csv", usadas=len(d80), ano_2026=len(d26)),
            painel_2018_2021=dict(arquivo="dados/serieb_clube_temporada_2018_2021.csv", usadas=len(dv)),
            jogos=dict(arquivos=["dados/serieb_jogos.csv", "dados/serieb_jogos_2018_2021.csv"],
                       linhas_serie_b={b: len(j) for b, j in jogos.items()}, filtro=P.COMP_SERIE_B),
            tecnico=dict(arquivo="dados/serieb_tecnico.csv", linhas=len(tec), coluna_de_clube=P.COL_CLUBE_TEC),
            elencos=dict(arquivo="dados/serieb_elencos.csv", linhas=len(elencos)),
            skillcorner=dict(atleta_temporada=len(sc), corte="min_tot >= 300"),
            mercado=dict(arquivo="dados/jogadores.json", periodo=P.PERIODO, jogadores=len(jogs)),
            kpis=dict(arquivo="dados/kpis.json", kpis=len(kpis["kpis"]), jogadores=len(kpis["jogadores"]))),
        "faixas": bloco_faixas(d80, dv, d26, regua, jogos, jogos26, cortes),
        "etapa_0": etapa_0(d80, dv, d26, meta, len(tc_cols), e12["degraus"]),
        "etapa_1": e1,
        "etapa_2": dict(titulo_chave="etapa_2", estado_nesta_aba="adaptada",
                        o_que_mudou=("comparação primária alta x média (inclui na alta quem não subiu); porta "
                                     "temporal com turnos pelo nº real de jogos; lista de resultado aplicada antes "
                                     "(porta D vazia por construção) e marca de consequência fixa"),
                        comparacao_primaria="sobe x meio",
                        porta_D=dict(linhas=0, motivo=("as colunas de resultado são retiradas ANTES do catálogo "
                                                       "(ver `circulares`); nenhuma chega a receber selo")),
                        colunas=["indicador", "nome", "coluna_csv", "pilar", "familia", "n", "conf", "m_sobe",
                                 "m_meio", "m_cai", "r_sobe", "r_meio", "r_cai", "d_bruto_SM", "p_bruto_SM", "q_SM",
                                 "d_liq_SM", "p_liq_SM", "q_liq_SM", "d_bruto_SC", "q_SC", "ic_bruto", "ic_liq",
                                 "rho_persist", "rho_1T_2T", "porta", "consequencia_do_resultado"],
                        linhas=linhas_cat),
        "etapa_3": e3,
        "etapa_4": dict(e4, estado_nesta_aba="completa", o_que_mudou="nada: a confiabilidade não depende de faixa"),
        "etapa_5": e5,
        "etapa_6": e6,
        "etapa_7": dict(e7, titulo_chave="etapa_7", estado_nesta_aba="adaptada",
                        o_que_mudou=("turno partido pelo nº real de jogos e desfecho em aproveitamento; não depende "
                                     "da faixa. Nas 160 do técnico coletivo: `tecnico_2018_2025.porta_temporal`. "
                                     "`nao_testaveis` passou a ser a família elenco INTEIRA do catálogo (%d colunas; "
                                     "no Protótipo eram só as de estabilidade do XI): nenhuma coluna dessa família tem "
                                     "valor por jogo, então nenhuma pode ser partida em turnos"
                                     % sum(1 for m in meta.values() if m["familia"] == "elenco")),
                        nao_testaveis=[i for i, m in meta.items() if m["familia"] == "elenco"],
                        **RG.marca_consequencia([i for i, m in meta.items() if m["familia"] == "elenco"]),
                        motivo_nao_testaveis=("minutagem.json guarda minuto por TEMPORADA e serieb_jogos.csv não "
                                              "traz escalação")),
        "etapa_8": e8,
        "etapa_9": e9,
        "etapa_10": e10,
        "etapa_11": e11,
        "etapa_12": e12,
        "etapa_13": e13,
        "etapa_14": e14,
        "etapa_15": e15,
        "alta_baixa_corrigido_por_clube": corrigido,
        "tecnico_2018_2025": tec160,
        "ranking_gaps": rk,
        "ranking_gaps_tecnico_2018_2025": rk160,
        "circulares": circulares,
        "controles_obrigatorios": dict(
            baseline_de_dinheiro=dict(auc=e1["auc_posto_de_valor"]["alta_x_resto"],
                                      acertos_top_k=e1["top_k_de_valor"]["acertos"],
                                      de=e1["top_k_de_valor"]["de"]),
            coluna_liquida_em_toda_linha=True, assert_ano_max=int(max(d80.ano.max(), dv.ano.max())),
            assert_filtro_competicao=P.COMP_SERIE_B),
    }
    saida = traduzir_textos(renomear(saida))
    # `colunas` da etapa 2 nomeia CHAVES como valor: recebe a mesma troca das chaves
    saida["etapa_2"]["colunas"] = [renomear_chave(c, set()) for c in saida["etapa_2"]["colunas"]]
    assert all(c in saida["etapa_2"]["linhas"][0] for c in saida["etapa_2"]["colunas"]), \
        [c for c in saida["etapa_2"]["colunas"] if c not in saida["etapa_2"]["linhas"][0]]
    saida["geradores"] = dict(GERADORES, regra=("cada bloco que sorteia tem gerador próprio; as funções do "
                                                "Protótipo que usam o rng global recebem um novo só durante a "
                                                "chamada, e fora dela o rng global é um vigia que quebra se usado"))

    # De que universo veio cada etapa, montado com os n medidos (a regra da casa: todo número diz
    # de onde veio). Onde a etapa mistura universos, o bloco interno já traz o seu `universo`.
    n_alta = int((d80.faixa_pts == "alta").sum())
    n_am = int(d80.faixa_pts.isin(["alta", "media"]).sum())
    u80 = f"{len(d80)} clube-temporada de {BLOCO_NOVO}"
    universos = {
        "etapa_0": f"{u80} e {len(dv)} de {BLOCO_VELHO} (poder por universo em `poder`); 2026 só em `por_ano`, fora das médias",
        "etapa_1": f"{u80} (valor de mercado); 2026 só pelo ritmo em `fora_da_amostra_2026`",
        "etapa_2": f"{u80}; o técnico coletivo nas {len(d80) + len(dv)} está em `tecnico_2018_2025.catalogo`",
        "etapa_3": f"{n_am} clube-temporada de {BLOCO_NOVO} (alta + média)",
        "etapa_4": f"jogo a jogo da Série B de {BLOCO_NOVO} ({len(jog)} linhas)",
        "etapa_5": f"{n_alta} clube-temporada da faixa alta de {BLOCO_NOVO}; nas 160 em `tecnico_2018_2025.pilar_tecnico_coletivo_etapa_5`",
        "etapa_6": f"pares consecutivos de {BLOCO_NOVO} ({len(pares)}); nas 160 em `tecnico_2018_2025.persistencia`",
        "etapa_8": f"{u80}; tipologia nos {n_alta} da alta",
        "etapa_9": u80,
        "etapa_11": f"atletas SkillCorner {BLOCO_NOVO} ({len(sc)}) e técnico individual {BLOCO_NOVO} ({len(tec25)} linhas)",
        "etapa_12": f"mercado `jogadores.json` ({P.PERIODO}, {len(jogs)} jogadores); elenco 2026 da Série B só para identificar atleta",
        "etapa_13": f"atletas SkillCorner {BLOCO_NOVO} ({len(sc)}) para os alvos; mercado ({P.PERIODO}) para os candidatos",
        "etapa_14": f"candidatos da etapa 13, {u80} para as taxas por quartil, elenco 2025 para a referência",
        "etapa_15": f"jogo a jogo da Série B de {BLOCO_NOVO}, {u80}",
    }
    for k, u in universos.items():
        saida[k].setdefault("universo", u)
    faltam_universo = [f"etapa_{n}" for n in range(16) if not saida[f"etapa_{n}"].get("universo")]
    assert not faltam_universo, ("etapa sem universo", faltam_universo)

    saida["tela"] = bloco_tela(saida)

    # GUARDA 1 — nenhum indicador circular apresentado como achado, em lugar nenhum do JSON.
    # Semântica: o que decide é o PAPEL do registro (listado como retirado x apresentado com
    # estatística), não o nome da chave; ver o cabeçalho de ranking_gaps. A etapa 10 é o único
    # bloco de exposição ("não contrate para isto") e `faixas` a única zona da régua.
    RG.autoteste_da_guarda()
    RG.autoteste_do_alinhamento()
    ruins =RG.referencias_circulares(saida, blocos_de_exposicao=(r"^\.etapa_10\.linhas\[\d+\]$",),
                                      zonas_da_regua=(r"^\.faixas(\.|$)",))
    assert not ruins, ("indicador circular aparece como achado", ruins[:10])
    assert all(L["tipo"] in ("resultado", "consequencia") for L in saida["etapa_10"]["linhas"])
    cons = RG.referencias_de_consequencia_sem_marca(saida)
    assert not cons, ("coluna de consequência sem a marca", cons[:10])
    marcas = contar_marcas(saida)
    assert marcas > 0, "a guarda não viu nenhuma retirada declarada: ela estaria olhando o vazio"

    # GUARDA 2 — nada de 2026 em média, corte ou teste. As entradas já passaram por `sem_2026`
    # e as tabelas de gaps por `ano_maximo`; aqui confere-se o que o JSON AFIRMA.
    assert saida["faixas"]["ano_2026"]["entra_em_media_corte_ou_teste"] is False
    assert all(x["ano"] <= ANO_MAXIMO for x in saida["faixas"]["cortes"]["corte_alto"]["sextos"]
               + saida["faixas"]["cortes"]["corte_baixo"]["decimos_quintos"])
    assert all(not x["entra_nas_medias"] for x in saida["etapa_0"]["por_ano"] if x["ano"] > ANO_MAXIMO)
    assert all(x["entra_nas_medias"] == x["entra_no_universo_80_2022_2025"] for x in saida["etapa_0"]["por_ano"])
    assert sum(x["n"] for x in saida["etapa_0"]["por_ano"] if x["entra_nas_medias"]) == len(d80)
    f26 = saida["etapa_1"]["fora_da_amostra_2026"]
    assert not f26.get("existe") or (f26["ajustado_em"] == BLOCO_NOVO and f26["entra_nas_medias"] is False)
    assert saida["etapa_11"]["tecnico"]["pares_mudou"] == saida["etapa_11"]["efeito_de_retirar_2026"]["pares_mudou"]["sem_2026"]

    faltam = [n for n in range(16) if f"etapa_{n}" not in saida]
    assert not faltam, faltam
    json.dump(saida, open(SAIDA, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    kb = os.path.getsize(SAIDA) / 1024
    print(f"guarda de circularidade: autoteste ok, {marcas} retiradas declaradas conferidas, 0 achados circulares, "
          f"0 consequências sem marca")
    print(f"gravado {SAIDA} ({kb:.0f} KB, {len(saida)} chaves) em {(dt.datetime.now() - t0).seconds}s")


if __name__ == "__main__":
    main()
