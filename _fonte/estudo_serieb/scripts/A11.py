#!/usr/bin/env python3
"""A11 — a intensidade vira ação e resultado?

Não é comparação de faixas: é relação. Spearman entre o esforço físico e a ação técnica que ele
deveria produzir, e depois entre o esforço e o resultado. Tudo no posto dentro da temporada, com
BH a 5% por família. Lista em `resultados/A11_indicadores.json`, fechada antes de rodar.

A tensão que motiva: o A07 mostrou que correr não separa quem sobe, mas a §7.3 mede a persistência
ano a ano e o físico é a coisa mais repetível depois do valor do elenco (0,722 contra 0,724). É um
traço estável do clube que não anda com o desfecho — A11 pergunta onde a corrida vai parar.

## A saída por marcador (20/09)

Além do `A11_correlacoes.csv`, do `A11_estratificado.csv` e do `A11_resumo.json`, este script passou
a gravar `resultados/A11_numeros.json`: o valor de **cada um dos marcadores** que o `A11.json`
publica, com o nome do marcador como chave. Antes, 49 dos 73 números da tela não saíam de script
nenhum — a procedência era disciplina, e o `gerado_por: "scripts/A11.py"` era, nessa parte, falso.
Agora é mecanismo, e a regra 1 do `scripts/_portao.py` confere.

Duas camadas entraram:
  * **1** — os 24 que o script já calculava (os 10 rho, os n, os selos, o d mínimo) passam a ser
    gravados em vez de lidos à mão do CSV.
  * **2** — os 49 que só existiam digitados passam a ser calculados aqui, seguindo o campo
    `de_onde` de `resultados/A11_numeros_novos.json` (escrito em 19/09 e conferido por dois
    caminhos): os terços, os cortes sem fronteira e sem cobertura baixa, o IC por reamostragem de
    clube, o mínimo detectável, o salto de posto e as quatro persistências ano a ano — que eram
    quatro constantes digitadas e agora saem dos 36 pares.

Essa saída é a **conferência** do que está publicado, não a substituição: nada em `A11.json` é
tocado, e divergência entre o que o script calcula e o que a parte publica é achado, não conserto.
Os valores saem na casa decimal em que a tela os lê, arredondados (nunca truncados).

**Nada acima do bloco marcado mudou.** O `A11_correlacoes.csv`, o `A11_estratificado.csv` e o
`A11_resumo.json` saem idênticos aos de 19/09 — é a trava desta alteração.

Uso:
    python3 _fonte/estudo_serieb/scripts/A11.py
"""
import collections
import csv
import json
import math
import os
import re
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import bh, cohen_d, d_minimo, ic_por_clube, pct, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")

# Constantes da saída por marcador. Data fixa, não relógio: o script é reprodutível (a única
# aleatoriedade é a reamostragem, semeada), e data dinâmica faria a saída mudar todo dia sem que
# número nenhum tivesse mudado.
GERADO_EM = "2026-09-20"
SEMENTE_IC = 2026          # a semente do IC por clube, como em A11_numeros_novos.json
REPS_IC = 10000
K_TERCO = 7                # 7 de cada lado POR TEMPORADA: 20 ÷ 3 arredondado, 28 clube-temporada
CORTE_COBERTURA = 0.75     # fis_minutos ÷ (J × 11 × 90), o mesmo corte do A07
ESPECIFICACAO = os.path.join(RAIZ, "_fonte", "prototipo", "ESPECIFICACAO.md")


# ==============================================================================================
# Os cálculos da saída por marcador. Nada aqui é usado pela análise acima — só pelo bloco final.
# Cada função leva, no comentário, a receita do campo `de_onde` de A11_numeros_novos.json.
# ==============================================================================================

def bruto(tec, l, coluna):
    """O valor bruto de uma coluna do clube-temporada, venha ela da base montada ou do CSV.

    Só a leitura: as colunas que a análise usa já estão em `base`; as outras (fis_minutos, J,
    tm_valor_total, fis_m_per_min) são lidas aqui, FORA do filtro que monta a base, para que
    acrescentar um cálculo não mude quantas linhas entram na análise."""
    if coluna in l:
        return float(l[coluna])
    return float(tec[(l["temporada"], l["clube"])][coluna])


def terco(base, ind, k=K_TERCO):
    """Os k primeiros e os k últimos de CADA temporada no posto do indicador.

    Por que não 80÷3 = 26 num bolo só: cada posto dentro da temporada aparece 4 vezes (4 anos ×
    20 times), então o corte em 26 parte um empate de 4 no meio e o grupo passa a depender da
    ordem das linhas do arquivo. Com 7 por temporada o grupo é único e qualquer pessoa refaz."""
    alto, baixo = [], []
    for ano in sorted({l["temporada"] for l in base}):
        g = sorted((l for l in base if l["temporada"] == ano), key=lambda l: l[ind])
        baixo += g[:k]
        alto += g[-k:]
    return alto, baixo


def media(g, coluna):
    return float(np.mean([l[coluna] for l in g]))


def cobertura(tec, l):
    """Quanto dos minutos do time está coberto por atleta com dado físico: a conta do A07."""
    t = tec[(l["temporada"], l["clube"])]
    return float(t["fis_minutos"]) / (float(t["J"]) * 11 * 90)


def rho_no_corte(linhas, x, y):
    """Spearman com o posto REFEITO dentro da temporada sobre o subconjunto — não o posto dos 80.

    Cópia rasa de cada linha: `percentil_no_ano` grava `<ind>::pct`, e reescrever isso na base
    original mudaria as correlações da análise."""
    sub = [dict(l) for l in linhas]
    percentil_no_ano(sub, [x, y])
    rho, p = stats.spearmanr([l[pct(x)] for l in sub], [l[pct(y)] for l in sub])
    return float(rho), float(p)


def ic_spearman_por_clube(base, x, y, semente=SEMENTE_IC, reps=REPS_IC):
    """IC95 do rho reamostrando CLUBES, não linhas: 80 linhas são 40 clubes (§6.6).

    Fisher supõe 80 observações independentes, e elas não são. Mesma ideia do
    `_metodo.ic_por_clube`, que é do d de Cohen; aqui o que se reamostra é a correlação."""
    por_clube = collections.defaultdict(list)
    for l in base:
        por_clube[l["clube"]].append(l)
    clubes = list(por_clube)
    rng = np.random.default_rng(semente)
    saida = []
    for _ in range(reps):
        am = [l for c in rng.choice(clubes, len(clubes), replace=True) for l in por_clube[c]]
        rho, _ = stats.spearmanr([l[pct(x)] for l in am], [l[pct(y)] for l in am])
        if not math.isnan(rho):
            saida.append(float(rho))
    return (round(float(np.percentile(saida, 2.5)), 2),
            round(float(np.percentile(saida, 97.5)), 2))


def pares_ano_a_ano(base):
    """Os clubes que repetem em temporadas seguidas: 2022→23, 23→24, 24→25. São 36 pares."""
    anos_ord = sorted({l["temporada"] for l in base})
    pares = []
    for a, b in zip(anos_ord, anos_ord[1:]):
        em_a = {l["clube"] for l in base if l["temporada"] == a}
        em_b = {l["clube"] for l in base if l["temporada"] == b}
        pares += [((a, c), (b, c)) for c in sorted(em_a & em_b)]
    return pares


def posto_no_ano(base, tec, coluna):
    """O posto de 1 a 20 dentro da temporada. É o posto que a §7.3 usa, não o valor bruto."""
    postos = {}
    for ano in sorted({l["temporada"] for l in base}):
        g = [l for l in base if l["temporada"] == ano]
        r = stats.rankdata([bruto(tec, l, coluna) for l in g])
        for l, rr in zip(g, r):
            postos[(l["temporada"], l["clube"])] = float(rr)
    return postos


def persistencia(base, tec, coluna):
    """Spearman t → t+1 no posto dentro do ano, nos 36 pares: a persistência da §7.3.

    Eram quatro constantes digitadas no `numeros` do A11.json (pers_fis, pers_valor, pers_xg,
    pers_ppda) — a auditoria de 19/09 as apontou como digitadas à mão. Agora saem daqui."""
    postos = posto_no_ano(base, tec, coluna)
    pares = pares_ano_a_ano(base)
    rho, _ = stats.spearmanr([postos[a] for a, b in pares], [postos[b] for a, b in pares])
    return float(rho)


def salto_de_posto(base, tec, coluna):
    """Média do |salto| de posto de um ano para o outro: a persistência dita em posições."""
    postos = posto_no_ano(base, tec, coluna)
    return float(np.mean([abs(postos[a] - postos[b]) for a, b in pares_ano_a_ano(base)]))


def rho_minimo_detectavel(n, alfa=0.05, poder=0.80):
    """Poder por desenho da correlação: o menor rho detectável, por z de Fisher."""
    z_a = stats.norm.ppf(1 - alfa / 2)
    z_b = stats.norm.ppf(poder)
    return float(math.tanh((z_a + z_b) / math.sqrt(n - 3)))


def conf_xg_citada():
    """A confiabilidade split-half do xG, LIDA da ESPECIFICACAO.md — A11 cita, não mede.

    O número é da Protótipo (Plano 1). Não dá para recalculá-lo aqui: `dados/prototipo.json`
    etapa_4 não tem linha para `xg` (o indicador não tem coluna de jogo mapeada no meta do
    gerador), e refazer o split-half dentro do A11 seria reimplementar o teste de outra parte —
    numa reprodução de teste o valor oscilou entre 0,30 e 0,31 conforme a detecção de empate
    entre duas médias iguais. Então lê-se a fonte, em vez de digitar o número: se a citação
    sumir da especificação, o script para, que é o certo."""
    txt = open(ESPECIFICACAO, encoding="utf-8").read()
    m = re.search(r"Confiabilidade \(split-half.*?xG (\d+),(\d+)", txt, re.S)
    if not m:
        raise SystemExit("A11: a ESPECIFICACAO.md não traz mais o split-half do xG "
                         "(parágrafo 'Confiabilidade (split-half, Spearman-Brown)')")
    return float(f"{m.group(1)}.{m.group(2)}")


def arred(v, casas):
    """Arredonda (nunca trunca) para a casa decimal em que a tela lê o número. casas=0 dá int."""
    return round(float(v), casas) if casas else int(round(float(v)))


def br(v, casas):
    """O número como o texto da parte o escreve: vírgula decimal."""
    return f"{v:.{casas}f}".replace(".", ",")


# ==============================================================================================
# A tabela de testes — resultados/A11_testes.csv            (acrescentado em 20/09)
# ==============================================================================================
# POR QUE ELA FALTAVA, E POR QUE ELA CABE AQUI. As regras 2 e 3 de `scripts/_portao.py` são de
# falha fechada: sem `<ID>_testes.csv` a parte é REPROVADA por ausência, porque não há como provar
# que os dois cortes de fronteira rodaram. A A11 não é parte de base nem de coleta — o `tipo` do
# A11.json é "analise", e as três conclusões se apoiam em teste com BH a 5% por família: a A11-1 e
# a A11-2 citam os q das correlações e a A11-3 cita os dez testes de A11_estratificado.csv. Logo a
# tabela tinha de ser GRAVADA, não dispensada.
#
# O QUE ENTRA. Os dois tipos de teste que esta parte roda, um do lado do outro:
#   * as 17 correlações declaradas (Spearman no posto dentro da temporada, BH por família), que
#     sustentam a A11-1 e a A11-2;
#   * as comparações Sobe × Meio dentro de cada faixa técnica, que sustentam a A11-3.
# Cada uma nos DOIS cortes de fronteira, que é o que a regra 3 emparelha.
#
# O CORTE `sem`. Para as correlações, o posto é REFEITO dentro da temporada sobre as 52 linhas
# (`rho_no_corte`), que é o método que o A11.json já publica em rho_sf_area_ent e companhia. Para
# a estratificação vale a convenção da casa — percentil nas 80 linhas, filtro depois —, que é a
# leitura de onde sai o marcador publicado `sf_alta` ("7 contra 9"). Nessa leitura a faixa técnica
# média cai para 1 × 11 e fica abaixo do piso de 4 promovidos, então ela NÃO tem linha no corte
# `sem`: cinco comparações do corte `com` ficam sem par, e a regra 3 vai dizer isso. É achado
# declarado, não defeito escondido — o próprio confianca_motivo da A11-3 já escrevia que "o corte
# sem os times de fronteira derruba a faixa média por falta de promovidos". A outra leitura que o
# texto cita (refazer as faixas técnicas dentro das 52 linhas, 6 × 12 na alta) não entra na tabela
# porque teria a mesma identidade de linha e destruiria o emparelhamento; ela continua no texto.
#
# AS COLUNAS, E AS DUAS QUE PRECISAM DE AVISO.
#   * `d` carrega o TAMANHO DO EFEITO, que não é o mesmo estatístico nas duas metades da tabela:
#     é o d de Cohen na estratificação e o rho de Spearman na correlação. Por isso existe a coluna
#     `medida_nome`, fora do cabeçalho canônico: sem ela a tabela afirmaria que os dois números são
#     a mesma coisa, que é exatamente a classe de erro que o portão existe para pegar.
#   * `cru_a` e `cru_b` são MÉDIAS, e não medianas como em A02 e A07. É de média que saem os
#     marcadores publicados (dist_sobe_alta e companhia, via `media()`); publicar mediana aqui
#     faria a tabela discordar do número que está na tela.
#   * `d_minimo_80` na correlação é o menor rho detectável com 80% de poder (`rho_minimo_
#     detectavel`), o análogo do d mínimo — é o número que o A11.json publica como rho_min_det.
#   * `placar_redescrito` é True na tabela inteira: a terceira ressalva declarada em
#     A11_indicadores.json vale para a parte toda ("correr muda com o placar, e a base não permite
#     o recorte"), e as três conclusões repetem isso no confianca_motivo.
#
# NADA AQUI CONSERTA NADA. Antes de gravar, o bloco confere linha a linha contra o que já está
# publicado — A11_correlacoes.csv, A11_estratificado.csv e os marcadores do A11.json — e PARA se
# divergir, sem sobrescrever nada. Divergência é achado para relatar, não número para corrigir.

CABECALHO_TESTES = ["fronteira", "familia", "comparacao", "indicador", "n_a", "n_b",
                    "cru_a", "cru_b", "d", "medida_nome", "ic95_d", "p", "d_minimo_80",
                    "q", "selo", "poder_suficiente", "nome", "placar_redescrito"]

# O nome de reunião de cada par. É por ele que a regra 2 do portão amarra a conclusão ao teste que
# a sustenta, então ele repete a forma que o texto da parte usa ("corridas para a área × entradas
# na área"), e não uma invenção nova.
NOME_DA_CORRELACAO = {
    ("fis_m_per_min_otip", "ppda"): "Metros por minuto sem posse × PPDA",
    ("fis_m_per_min_otip", "recuperacoes"): "Metros por minuto sem posse × recuperações",
    ("fis_m_per_min_otip", "xg_contra"): "Metros por minuto sem posse × xG sofrido",
    ("fis_sprint_distance_p30otip", "ppda"): "Sprint sem posse × PPDA",
    ("fis_sprint_distance_p30otip", "recuperacoes"): "Sprint sem posse × recuperações",
    ("fis_sprint_distance_p30otip", "xg_contra"): "Sprint sem posse × xG sofrido",
    ("fis_m_per_min_tip", "entradas_area"): "Metros por minuto com posse × entradas na área",
    ("fis_m_per_min_tip", "xg"): "Metros por minuto com posse × xG criado",
    ("fis_sprint_distance_p30tip", "entradas_area"): "Sprint com posse × entradas na área",
    ("fis_sprint_distance_p30tip", "xg"): "Sprint com posse × xG criado",
    ("fis_runs_penalty_area_p30tip", "entradas_area"): "Corridas para a área × entradas na área",
    ("fis_runs_penalty_area_p30tip", "xg"): "Corridas para a área × xG criado",
    ("fis_distance_p90", "dist_g4"): "Distância por 90 min × distância ao G4",
    ("fis_hi_distance_p90", "dist_g4"): "Distância em alta intensidade × distância ao G4",
    ("fis_sprint_distance_p90", "dist_g4"): "Sprint por 90 × distância ao G4",
    ("fis_m_per_min_otip", "dist_g4"): "Metros por minuto sem posse × distância ao G4",
    ("fis_m_per_min_tip", "dist_g4"): "Metros por minuto com posse × distância ao G4",
}
NOME_DO_FISICO = {
    "fis_distance_p90": "Distância por 90 min (m)",
    "fis_hi_distance_p90": "Distância em alta intensidade por 90 (m)",
    "fis_sprint_distance_p90": "Distância em sprint por 90 (m)",
    "fis_m_per_min_otip": "Metros por minuto SEM posse",
    "fis_m_per_min_tip": "Metros por minuto COM posse",
}
SUFIXO_DA_FAIXA = {"baixa": "baixa", "média": "media", "alta": "alta"}
PISO_DE_GRUPO = 4          # o mesmo piso de 4 que a estratificação de cima já usa


def testes_de_correlacao(linhas, usados, dec, rotulo):
    """As 17 correlações declaradas, no formato da tabela de testes, para UM corte.

    O posto é refeito dentro da temporada sobre o subconjunto (a mesma regra de `rho_no_corte`),
    e o BH roda por família DENTRO do corte — corte novo é tabela nova, não uma coluna a mais da
    tabela velha."""
    sub = [dict(l) for l in linhas]
    percentil_no_ano(sub, usados + ["dist_g4"])
    n = len(sub)
    rho_min = arred(rho_minimo_detectavel(n), 3)
    saida = []
    for fam in dec["familias"]:
        ps, itens = [], []
        for x, y in fam["pares"]:
            rho, p = stats.spearmanr([l[pct(x)] for l in sub], [l[pct(y)] for l in sub])
            z, se = 0.5 * math.log((1 + rho) / (1 - rho)), 1 / math.sqrt(n - 3)
            itens.append({
                "fronteira": rotulo, "familia": fam["id"], "comparacao": "esforco_x_efeito",
                "indicador": f"{x}×{y}", "n_a": n, "n_b": n,
                "cru_a": round(float(np.mean([l[x] for l in sub])), 3),
                "cru_b": round(float(np.mean([l[y] for l in sub])), 3),
                "d": round(float(rho), 3), "medida_nome": "rho de Spearman",
                "ic95_d": [round(math.tanh(z - 1.96 * se), 2),
                           round(math.tanh(z + 1.96 * se), 2)],
                "p": round(float(p), 5), "d_minimo_80": rho_min,
                "nome": NOME_DA_CORRELACAO[(x, y)], "placar_redescrito": True})
            ps.append(float(p))
        for it, q in zip(itens, bh(ps)):
            it["q"] = round(q, 5)
            it["selo"] = ("firme" if q < 0.05 else
                          ("pode ser sorte" if it["p"] < 0.05 else "sem relação clara"))
            it["poder_suficiente"] = abs(it["d"]) >= it["d_minimo_80"]
        saida += itens
    return saida


def testes_de_estratificacao(linhas, fis, rotulo, rng):
    """Sobe × Meio no físico dentro de cada faixa técnica, no formato da tabela, para UM corte.

    Mesma conta da estratificação de cima (percentil dentro da temporada nas 80 linhas, t de
    Welch, BH por faixa técnica, piso de 4 de cada lado); o que muda é só quais linhas entram e a
    coluna ic95_d, que aqui vem da reamostragem de CLUBE, como manda a §6.6."""
    saida = []
    for ft in ("baixa", "média", "alta"):
        g = [l for l in linhas if l["faixa_tecnica"] == ft]
        sobe = [l for l in g if l["faixa"] == "Sobe"]
        meio = [l for l in g if l["faixa"] == "Meio"]
        if len(sobe) < PISO_DE_GRUPO or len(meio) < PISO_DE_GRUPO:
            continue
        ps, itens = [], []
        for c in fis:
            a = [l[pct(c)] for l in sobe]
            b = [l[pct(c)] for l in meio]
            _, p = stats.ttest_ind(a, b, equal_var=False)
            lo, hi = ic_por_clube(g, pct(c), lambda l: l["faixa"] == "Sobe",
                                  lambda l: l["faixa"] == "Meio", 1, rng)
            itens.append({
                "fronteira": rotulo, "familia": f"tec_{SUFIXO_DA_FAIXA[ft]}",
                "comparacao": f"SM_tec_{SUFIXO_DA_FAIXA[ft]}", "indicador": c,
                "n_a": len(sobe), "n_b": len(meio),
                "cru_a": round(float(np.mean([l[c] for l in sobe])), 3),
                "cru_b": round(float(np.mean([l[c] for l in meio])), 3),
                "d": round(cohen_d(a, b), 3), "medida_nome": "d de Cohen",
                "ic95_d": [lo, hi], "p": round(float(p), 5),
                "d_minimo_80": d_minimo(len(sobe), len(meio)),
                "nome": NOME_DO_FISICO[c], "placar_redescrito": True})
            ps.append(float(p))
        for it, q in zip(itens, bh(ps)):
            it["q"] = round(q, 5)
            it["selo"] = ("firme" if q < 0.05 else
                          ("pode ser sorte" if it["p"] < 0.05 else "sem diferença clara"))
            it["poder_suficiente"] = abs(it["d"]) >= it["d_minimo_80"]
        saida += itens
    return saida


def conferir_a_tabela(tab_com_corr, tab_com_est, linhas, estrat, numeros, tab_sem_corr, tab_sem_est):
    """Devolve a lista de divergências entre a tabela nova e o que a parte JÁ publica.

    Nada é corrigido aqui: a tabela é a conferência, e número publicado que não bate é achado
    para relatar. Confere três fontes — A11_correlacoes.csv, A11_estratificado.csv e os
    marcadores do A11.json que falam dos cortes."""
    achados = []
    velhas = {(l["esforco"], l["efeito"]): l for l in linhas}
    for t in tab_com_corr:
        x, y = t["indicador"].split("×")
        v = velhas.get((x, y))
        if v is None:
            achados.append(f"{t['indicador']}: não existe em A11_correlacoes.csv")
            continue
        for campo, antigo in (("d", v["rho"]), ("p", v["p"]), ("q", v["q"]), ("selo", v["selo"])):
            if str(t[campo]) != str(antigo):
                achados.append(f"correlação {t['indicador']}, {campo}: A11_correlacoes.csv diz "
                               f"{antigo!r} e a tabela dá {t[campo]!r}")
    chave_est = {(e["faixa_tecnica"], e["indicador"]): e for e in estrat}
    for t in tab_com_est:
        ft = t["comparacao"].replace("SM_tec_", "")
        ft = {"media": "média"}.get(ft, ft)
        v = chave_est.get((ft, t["indicador"]))
        if v is None:
            achados.append(f"{ft}/{t['indicador']}: não existe em A11_estratificado.csv")
            continue
        for campo, antigo in (("n_a", v["n_sobe"]), ("n_b", v["n_meio"]), ("d", v["d"]),
                              ("p", v["p"]), ("q", v["q"]),
                              ("d_minimo_80", v["d_minimo_80"]), ("selo", v["selo"])):
            if str(t[campo]) != str(antigo):
                achados.append(f"estratificação {ft}/{t['indicador']}, {campo}: "
                               f"A11_estratificado.csv diz {antigo!r} e a tabela dá {t[campo]!r}")
    # os marcadores do corte sem fronteira que o A11.json publica em texto
    sem_corr = {t["indicador"]: t for t in tab_sem_corr}
    esperado = {
        "rho_sf_area_ent": "fis_runs_penalty_area_p30tip×entradas_area",
        "rho_sf_area_xg": "fis_runs_penalty_area_p30tip×xg",
        "rho_sf_spr_ppda": "fis_sprint_distance_p30otip×ppda",
        "rho_sf_mpm_ppda": "fis_m_per_min_otip×ppda",
    }
    for marcador, chave in esperado.items():
        if numeros.get(marcador) != sem_corr[chave]["d"]:
            achados.append(f"marcador {marcador}: o A11.json publica {numeros.get(marcador)!r} e "
                           f"a tabela dá {sem_corr[chave]['d']!r} no corte sem fronteira")
    mpm = sem_corr["fis_m_per_min_otip×recuperacoes"]
    spr = sem_corr["fis_sprint_distance_p30otip×recuperacoes"]
    frase = (f"{br(mpm['d'], 3)} (p = {br(mpm['p'], 5)}) e "
             f"{br(spr['d'], 3)} (p = {br(spr['p'], 5)})")
    if numeros.get("rec_sf_frase") != frase:
        achados.append(f"marcador rec_sf_frase: o A11.json publica "
                       f"{numeros.get('rec_sf_frase')!r} e a tabela dá {frase!r}")
    alta = [t for t in tab_sem_est if t["comparacao"] == "SM_tec_alta"]
    if alta:
        visto = f"{alta[0]['n_a']} contra {alta[0]['n_b']}"
        if numeros.get("sf_alta") != visto:
            achados.append(f"marcador sf_alta: o A11.json publica {numeros.get('sf_alta')!r} e a "
                           f"tabela dá {visto!r}")
    return achados


def main():
    dec = json.load(open(os.path.join(R, "A11_indicadores.json"), encoding="utf-8"))
    anos = {str(a) for a in dec["recorte"]["temporadas"]}
    sinais = {k: v for k, v in dec["sinais"].items() if isinstance(v, int)}
    usados = sorted({c for f in dec["familias"] for p in f["pares"] for c in p}
                    | set(dec["estratificacao"]["indice_tecnico"]))
    usados = [c for c in usados if c != "dist_g4"]

    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            tec[(r["ano"], r["clube"])] = r

    base = []
    for k, a in a01.items():
        if k[0] not in anos or k not in tec:
            continue
        t = tec[k]
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"],
             "trave": a["trave"] == "1", "fronteira": a["fronteira"] == "1",
             "dist_g4": int(a["dist_g4"])}
        ok = True
        for c in usados:
            v = t.get(c)
            try:
                l[c] = float(v) if v not in (None, "", "nan") else None
            except ValueError:
                l[c] = None
            ok = ok and l[c] is not None
        if ok:
            base.append(l)
    print(f"base: {len(base)} clube-temporadas · {len({l['clube'] for l in base})} clubes")

    percentil_no_ano(base, usados + ["dist_g4"])

    # ---------- as correlações declaradas ----------
    linhas = []
    for fam in dec["familias"]:
        ps, itens = [], []
        for x, y in fam["pares"]:
            a = [l[pct(x)] for l in base]
            b = [l[pct(y)] for l in base]
            rho, p = stats.spearmanr(a, b)
            s = sinais.get(y, 1)
            n = len(a)
            z, se = 0.5 * math.log((1 + rho) / (1 - rho)), 1 / math.sqrt(n - 3)
            itens.append({"familia": fam["id"], "esforco": x, "efeito": y,
                          "rho": round(float(rho), 3),
                          "rho_alinhado": round(float(rho) * s, 3),
                          "ic95": [round(math.tanh(z - 1.96 * se), 2),
                                   round(math.tanh(z + 1.96 * se), 2)],
                          "p": round(float(p), 5), "n": n,
                          "sinal_esperado": "negativo" if s == -1 else "positivo"})
            ps.append(float(p))
        for it, q in zip(itens, bh(ps)):
            it["q"] = round(q, 5)
            it["selo"] = ("firme" if q < 0.05 else
                          ("pode ser sorte" if it["p"] < 0.05 else "sem relação clara"))
            it["vai_no_sentido_esperado"] = it["rho_alinhado"] > 0
        linhas += itens

    with open(os.path.join(R, "A11_correlacoes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(linhas[0]))
        w.writeheader(); w.writerows(linhas)

    # ---------- o físico dentro de nível técnico parecido ----------
    inv = {"dist_remate", "xg_por_remate_contra"}
    for l in base:
        vs = [(100 - l[pct(c)]) if c in inv else l[pct(c)]
              for c in dec["estratificacao"]["indice_tecnico"]]
        l["indice_tecnico"] = sum(vs) / len(vs)
    ordenados = sorted(base, key=lambda l: l["indice_tecnico"])
    corte = len(ordenados) // 3
    for i, l in enumerate(ordenados):
        l["faixa_tecnica"] = "baixa" if i < corte else ("alta" if i >= 2 * corte else "média")

    fis = ["fis_distance_p90", "fis_hi_distance_p90", "fis_sprint_distance_p90",
           "fis_m_per_min_otip", "fis_m_per_min_tip"]
    estrat = []
    for ft in ("baixa", "média", "alta"):
        g = [l for l in base if l["faixa_tecnica"] == ft]
        sobe = [l for l in g if l["faixa"] == "Sobe"]
        meio = [l for l in g if l["faixa"] == "Meio"]
        ps, itens = [], []
        for c in fis:
            if len(sobe) < 4 or len(meio) < 4:
                continue
            a = [l[pct(c)] for l in sobe]; b = [l[pct(c)] for l in meio]
            _, p = stats.ttest_ind(a, b, equal_var=False)
            itens.append({"faixa_tecnica": ft, "indicador": c, "n_sobe": len(sobe),
                          "n_meio": len(meio), "d": round(cohen_d(a, b), 3),
                          "p": round(float(p), 5), "d_minimo_80": d_minimo(len(sobe), len(meio))})
            ps.append(float(p))
        for it, q in zip(itens, bh(ps) if ps else []):
            it["q"] = round(q, 5)
            it["selo"] = "firme" if q < 0.05 else ("pode ser sorte" if it["p"] < 0.05 else "sem diferença clara")
        estrat += itens
    if estrat:
        with open(os.path.join(R, "A11_estratificado.csv"), "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(estrat[0]))
            w.writeheader(); w.writerows(estrat)

    firmes = [l for l in linhas if l["selo"] == "firme"]
    json.dump({"n": len(base), "correlacoes": len(linhas), "firmes": len(firmes),
               "no_sentido_esperado": sum(1 for l in firmes if l["vai_no_sentido_esperado"]),
               "por_familia": {f["id"]: sum(1 for l in firmes if l["familia"] == f["id"])
                               for f in dec["familias"]},
               "estratificacao": {ft: {"n_sobe": next((e["n_sobe"] for e in estrat
                                                       if e["faixa_tecnica"] == ft), 0),
                                       "n_meio": next((e["n_meio"] for e in estrat
                                                       if e["faixa_tecnica"] == ft), 0),
                                       "firmes": sum(1 for e in estrat
                                                     if e["faixa_tecnica"] == ft and e["selo"] == "firme")}
                                 for ft in ("baixa", "média", "alta")},
               "persistencia_ja_medida_pela_prototipo": {
                   "fis_distance_p90": 0.722, "fis_m_per_min": 0.722, "tm_valor_total": 0.724,
                   "fis_psv99_top5": 0.377, "posse": 0.272, "xg_por_remate_contra": 0.214,
                   "xg": 0.144, "ppda": 0.129, "recuperacoes": 0.067,
                   "fonte": "ESPECIFICACAO.md §7.3, 36 pares ano a ano"}},
              open(os.path.join(R, "A11_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*94}\nA CORRIDA VIRA AÇÃO? (Spearman no posto dentro do ano, n={len(base)})\n{'='*94}")
    print(f"{'família':10s} {'esforço':30s} {'efeito':22s} {'rho':>6s} {'IC95':>14s} {'q':>8s}  selo")
    for l in linhas:
        print(f"{l['familia']:10s} {l['esforco'][:30]:30s} {l['efeito'][:22]:22s} {l['rho']:+6.2f} "
              f"[{l['ic95'][0]:+5.2f},{l['ic95'][1]:+5.2f}] {l['q']:8.4f}  {l['selo']}"
              + ("" if l["vai_no_sentido_esperado"] or l["selo"] == "sem relação clara"
                 else "  ⚠ SENTIDO CONTRÁRIO"))

    print(f"\n{'='*94}\nO FÍSICO DENTRO DE NÍVEL TÉCNICO PARECIDO\n{'='*94}")
    print(f"{'nível':7s} {'indicador':28s} {'n'"":>7s} {'d':>6s} {'q':>8s} {'dmin':>5s}  selo")
    for e in estrat:
        print(f"{e['faixa_tecnica']:7s} {e['indicador'][:28]:28s} {f'{e[chr(110)+chr(95)+chr(115)+chr(111)+chr(98)+chr(101)]}x{e['n_meio']}':>7s} "
              f"{e['d']:+6.2f} {e['q']:8.4f} {e['d_minimo_80']:5.2f}  {e['selo']}")

    # ==========================================================================================
    # A saída por marcador — resultados/A11_numeros.json        (acrescentado em 20/09)
    # ==========================================================================================
    # Daqui para baixo a análise não é refeita: `linhas`, `estrat` e `base` já estão prontos e só
    # se LEEM. O que se acrescenta são os cálculos que faltavam (camada 2), que rodam sobre a
    # MESMA base de 80 linhas, com cópias rasas onde precisam de posto próprio, e não mexem em
    # nenhuma variável usada acima. Os arquivos de 19/09 saem idênticos — é a trava.

    corr = {(l["esforco"], l["efeito"]): l for l in linhas}
    est = {}
    for e in estrat:
        est.setdefault(e["faixa_tecnica"], e)
    niveis_testados = sorted(est)

    def do_nivel(ft, faixa):
        return [l for l in base if l["faixa_tecnica"] == ft and l["faixa"] == faixa]

    # -- os terços: quem mais corre contra quem menos corre, no valor bruto ---------------------
    area_alto, area_baixo = terco(base, "fis_runs_penalty_area_p30tip")
    vol_alto, vol_baixo = terco(base, "fis_m_per_min_tip")
    spr_cima, spr_baixo = terco(base, "fis_sprint_distance_p30otip")
    spr90_alto, spr90_baixo = terco(base, "fis_sprint_distance_p90")

    def pontos_de(l):
        """Os pontos do clube na temporada, do A01_clube_temporada.csv (a régua da parte A01)."""
        return int(a01[(l["temporada"], l["clube"])]["pontos"])

    # -- os dois cortes de robustez: sem fronteira e sem cobertura física baixa -----------------
    sem_fronteira = [l for l in base if not l["fronteira"]]
    com_cobertura = [l for l in base if cobertura(tec, l) >= CORTE_COBERTURA]

    sf_area_ent = rho_no_corte(sem_fronteira, "fis_runs_penalty_area_p30tip", "entradas_area")
    sf_area_xg = rho_no_corte(sem_fronteira, "fis_runs_penalty_area_p30tip", "xg")
    cob_area_ent = rho_no_corte(com_cobertura, "fis_runs_penalty_area_p30tip", "entradas_area")
    cob_area_xg = rho_no_corte(com_cobertura, "fis_runs_penalty_area_p30tip", "xg")
    sf_spr_ppda = rho_no_corte(sem_fronteira, "fis_sprint_distance_p30otip", "ppda")
    sf_mpm_ppda = rho_no_corte(sem_fronteira, "fis_m_per_min_otip", "ppda")
    sf_mpm_rec = rho_no_corte(sem_fronteira, "fis_m_per_min_otip", "recuperacoes")
    sf_spr_rec = rho_no_corte(sem_fronteira, "fis_sprint_distance_p30otip", "recuperacoes")

    # -- o IC honesto: reamostragem de clube, no lugar do Fisher da coluna ic95 -----------------
    ic_ent = ic_spearman_por_clube(base, "fis_runs_penalty_area_p30tip", "entradas_area")
    ic_xg = ic_spearman_por_clube(base, "fis_runs_penalty_area_p30tip", "xg")

    # -- o físico dentro do nível técnico, em metros por jogo -----------------------------------
    d_sobe_alta = media(do_nivel("alta", "Sobe"), "fis_distance_p90")
    d_meio_alta = media(do_nivel("alta", "Meio"), "fis_distance_p90")
    d_sobe_media = media(do_nivel("média", "Sobe"), "fis_distance_p90")
    d_meio_media = media(do_nivel("média", "Meio"), "fis_distance_p90")

    numeros = {
        # -- CAMADA 1: o que o script já calculava, agora gravado ------------------------------
        "n": len(base),
        "n_corr": len(linhas),
        "n_firmes": sum(1 for l in linhas if l["selo"] == "firme"),
        # os dez rho que o texto cita, na casa de 3 que o A11_correlacoes.csv já usa
        "area_ent": corr[("fis_runs_penalty_area_p30tip", "entradas_area")]["rho"],
        "area_xg": corr[("fis_runs_penalty_area_p30tip", "xg")]["rho"],
        "mpm_ent": corr[("fis_m_per_min_tip", "entradas_area")]["rho"],
        "spr_ent": corr[("fis_sprint_distance_p30tip", "entradas_area")]["rho"],
        "mpm_xg": corr[("fis_m_per_min_tip", "xg")]["rho"],
        "spr_ppda": corr[("fis_sprint_distance_p30otip", "ppda")]["rho"],
        "mpm_ppda": corr[("fis_m_per_min_otip", "ppda")]["rho"],
        "spr_rec": corr[("fis_sprint_distance_p30otip", "recuperacoes")]["rho"],
        "mpm_rec": corr[("fis_m_per_min_otip", "recuperacoes")]["rho"],
        "mpm_xgc": corr[("fis_m_per_min_otip", "xg_contra")]["rho"],
        # o topo do IC de recuperações: o "nem no melhor caso" da conclusão 2
        "ic_rec_topo": corr[("fis_m_per_min_otip", "recuperacoes")]["ic95"][1],
        # a estratificação
        "estrat_firmes": sum(1 for e in estrat if e["selo"] == "firme"),
        "estrat_testes": len(estrat),
        "niveis": ", ".join(niveis_testados),
        "n_estrat": sum(est[ft]["n_sobe"] + est[ft]["n_meio"] for ft in niveis_testados),
        "n_sobe_media": est["média"]["n_sobe"],
        "n_meio_media": est["média"]["n_meio"],
        "n_sobe_alta": est["alta"]["n_sobe"],
        "n_meio_alta": est["alta"]["n_meio"],
        "d_min_alta": est["alta"]["d_minimo_80"],
        "d_min_media": est["média"]["d_minimo_80"],

        # -- CAMADA 2: o que só existia digitado, agora calculado ------------------------------
        # A corrida para a área vira entrada na área e vira xG (conclusão 1)
        "n_terco": len(area_alto),
        "corr_alto": arred(media(area_alto, "fis_runs_penalty_area_p30tip"), 1),
        "corr_baixo": arred(media(area_baixo, "fis_runs_penalty_area_p30tip"), 1),
        "ent_alto": arred(media(area_alto, "entradas_area"), 1),
        "ent_baixo": arred(media(area_baixo, "entradas_area"), 1),
        "xg_alto": arred(media(area_alto, "xg"), 3),
        "xg_baixo": arred(media(area_baixo, "xg"), 3),
        # quantos do terço que mais corre para a área estão na metade de cima em entradas
        "ent_metade_alto": sum(1 for l in area_alto if l[pct("entradas_area")] >= 50),
        "ent_metade_baixo": sum(1 for l in area_baixo if l[pct("entradas_area")] >= 50),
        # o contraste: correr MUITO com a bola (volume) não produz o mesmo
        "vol_ent_alto": arred(media(vol_alto, "entradas_area"), 1),
        "vol_ent_baixo": arred(media(vol_baixo, "entradas_area"), 1),
        "vol_xg_alto": arred(media(vol_alto, "xg"), 4),
        "vol_xg_baixo": arred(media(vol_baixo, "xg"), 4),
        # os dois cortes de robustez da conclusão 1
        "n_sf": len(sem_fronteira),
        "n_cob": len(com_cobertura),
        "n_cob_fora": len(base) - len(com_cobertura),
        "rho_sf_area_ent": arred(sf_area_ent[0], 3),
        "rho_sf_area_xg": arred(sf_area_xg[0], 3),
        "rho_cob_area_ent": arred(cob_area_ent[0], 3),
        "rho_cob_area_xg": arred(cob_area_xg[0], 3),
        "ic_area_ent": f"[{br(ic_ent[0], 2)}; {br(ic_ent[1], 2)}]",
        "ic_area_xg": f"[{br(ic_xg[0], 2)}; {br(ic_xg[1], 2)}]",
        "rho_min_det": arred(rho_minimo_detectavel(len(base)), 3),
        "conf_xg": conf_xg_citada(),
        # A corrida sem bola vira pressão, e só (conclusão 2)
        "spr_alto": arred(media(spr_cima, "fis_sprint_distance_p30otip"), 0),
        "spr_baixo": arred(media(spr_baixo, "fis_sprint_distance_p30otip"), 0),
        "ppda_alto": arred(media(spr_cima, "ppda"), 1),
        "ppda_baixo": arred(media(spr_baixo, "ppda"), 1),
        "rec_alto": arred(media(spr_cima, "recuperacoes"), 1),
        "rec_baixo": arred(media(spr_baixo, "recuperacoes"), 1),
        "xgc_alto": arred(media(spr_cima, "xg_contra"), 3),
        "xgc_baixo": arred(media(spr_baixo, "xg_contra"), 3),
        "rho_sf_spr_ppda": arred(sf_spr_ppda[0], 3),
        "rho_sf_mpm_ppda": arred(sf_mpm_ppda[0], 3),
        "rec_sf_frase": (f"{br(sf_mpm_rec[0], 3)} (p = {br(sf_mpm_rec[1], 5)}) e "
                         f"{br(sf_spr_rec[0], 3)} (p = {br(sf_spr_rec[1], 5)})"),
        # O físico não separa quem sobe dentro do mesmo nível técnico (conclusão 3)
        "dist_sobe_alta": arred(d_sobe_alta, 0),
        "dist_meio_alta": arred(d_meio_alta, 0),
        "dif_alta": arred(d_sobe_alta - d_meio_alta, 0),
        "dist_sobe_media": arred(d_sobe_media, 0),
        "dist_meio_media": arred(d_meio_media, 0),
        "dif_media": arred(d_sobe_media - d_meio_media, 0),
        "sf_alta": (f"{sum(1 for l in do_nivel('alta', 'Sobe') if not l['fronteira'])} contra "
                    f"{sum(1 for l in do_nivel('alta', 'Meio') if not l['fronteira'])}"),
        # o traço estável: quanto o posto anda de um ano para o outro, e a persistência da §7.3
        "pos_corrida": arred(salto_de_posto(base, tec, "fis_distance_p90"), 1),
        "pos_xg": arred(salto_de_posto(base, tec, "xg"), 1),
        "pos_ppda": arred(salto_de_posto(base, tec, "ppda"), 1),
        "pers_fis": arred(persistencia(base, tec, "fis_distance_p90"), 3),
        "pers_valor": arred(persistencia(base, tec, "tm_valor_total"), 3),
        "pers_xg": arred(persistencia(base, tec, "xg"), 3),
        "pers_ppda": arred(persistencia(base, tec, "ppda"), 3),

        # -- Os cinco números que o A11-3 traz CRAVADOS no texto, sem marcador ------------------
        # "o terço que mais sprinta somou 54,5 pontos contra 47,9", "os mesmos 5 times no G4" e
        # "9 rebaixados contra 2" estão digitados dentro da frase, e por isso o portão nem chega
        # a conferi-los (regra 1 para antes: número medido sem marcador não tem o que conferir).
        # Ficam calculados aqui, com nome de marcador, para que a correção do A11.json seja só
        # trocar o dígito pelo {marcador} — nenhum número novo precisará ser digitado.
        # O terço é o de fis_sprint_distance_p90, o único físico que anda com a tabela (rho 0,288
        # com dist_g4, a única linha firme da família "resultado").
        "pts_spr_alto": arred(np.mean([pontos_de(l) for l in spr90_alto]), 1),
        "pts_spr_baixo": arred(np.mean([pontos_de(l) for l in spr90_baixo]), 1),
        "g4_spr_alto": sum(1 for l in spr90_alto if l["faixa"] == "Sobe"),
        "g4_spr_baixo": sum(1 for l in spr90_baixo if l["faixa"] == "Sobe"),
        "cai_spr_alto": sum(1 for l in spr90_alto if l["faixa"] == "Cai"),
        "cai_spr_baixo": sum(1 for l in spr90_baixo if l["faixa"] == "Cai"),
    }

    json.dump({"parte": "A11", "gerado_por": "scripts/A11.py", "gerado_em": GERADO_EM,
               "semente": SEMENTE_IC,
               "nota": "Conferência dos números publicados em A11.json, não substituição. "
                       "Valores na casa decimal da tela, arredondados (nunca truncados). "
                       "conf_xg não é medido aqui: é a citação da ESPECIFICACAO.md, lida do "
                       "arquivo em vez de digitada.",
               "numeros": numeros},
              open(os.path.join(R, "A11_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n{'='*94}\nA11_numeros.json: {len(numeros)} marcadores gravados\n{'='*94}")

    # -- a conferência contra o publicado. Divergência é ACHADO; este script não conserta nada. --
    pub = json.load(open(os.path.join(R, "A11.json"), encoding="utf-8")).get("numeros", {})
    faltam = sorted(set(pub) - set(numeros))
    sobram = sorted(set(numeros) - set(pub))
    divergem = []
    for m in sorted(set(pub) & set(numeros)):
        a, b = numeros[m], pub[m]
        igual = (abs(float(a) - float(b)) <= 1e-9
                 if isinstance(a, (int, float)) and isinstance(b, (int, float))
                 else str(a).strip() == str(b).strip())
        if not igual:
            divergem.append((m, b, a))
    print(f"  publicados em A11.json: {len(pub)} · conferidos: {len(set(pub) & set(numeros))}")
    if faltam:
        print(f"  SEM CÁLCULO AQUI ({len(faltam)}): {', '.join(faltam)}")
    if sobram:
        print(f"  gravados e não publicados ({len(sobram)}): {', '.join(sobram)}")
    if divergem:
        for m, p, c in divergem:
            print(f"  DIVERGE  {m}: publicado {p!r} · o script dá {c!r}")
    else:
        print("  nenhuma divergência: todo marcador publicado sai deste script com o mesmo valor")

    # ==========================================================================================
    # A tabela de testes — resultados/A11_testes.csv          (acrescentado em 20/09)
    # ==========================================================================================
    # O bloco explicativo está acima de `testes_de_correlacao`. Aqui só se monta, confere e grava.
    rng = np.random.default_rng(SEMENTE_IC)
    com_corr = testes_de_correlacao(base, usados, dec, "com")
    sem_corr = testes_de_correlacao(sem_fronteira, usados, dec, "sem")
    com_est = testes_de_estratificacao(base, fis, "com", rng)
    sem_est = testes_de_estratificacao(sem_fronteira, fis, "sem", rng)

    achados = conferir_a_tabela(com_corr, com_est, linhas, estrat, pub, sem_corr, sem_est)
    if achados:
        print(f"\n{'='*94}\nA11_testes.csv NÃO FOI GRAVADO: a tabela diverge do que a parte "
              f"publica\n{'='*94}")
        for a in achados:
            print(f"  DIVERGE  {a}")
        raise SystemExit("A11: divergência entre a tabela de testes e o publicado. Divergência é "
                         "achado para relatar, não número para corrigir — nada foi sobrescrito.")

    tabela = com_corr + com_est + sem_corr + sem_est
    with open(os.path.join(R, "A11_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CABECALHO_TESTES)
        w.writeheader()
        w.writerows(tabela)

    sem_par = ({(t["familia"], t["comparacao"], t["indicador"]) for t in com_corr + com_est}
               ^ {(t["familia"], t["comparacao"], t["indicador"]) for t in sem_corr + sem_est})
    print(f"\n{'='*94}\nA11_testes.csv: {len(tabela)} linhas "
          f"({len(com_corr)} + {len(com_est)} no corte com fronteira, "
          f"{len(sem_corr)} + {len(sem_est)} no corte sem)\n{'='*94}")
    print("  conferida contra A11_correlacoes.csv, A11_estratificado.csv e os marcadores de "
          "corte do A11.json: nenhuma divergência")
    for chave in sorted(sem_par):
        print(f"  SEM PAR ENTRE OS CORTES  {chave[1]} · {chave[2]} — a faixa técnica média fica "
              "com 1 promovido sem os times de fronteira, abaixo do piso de "
              f"{PISO_DE_GRUPO}: o teste não roda, e a regra 3 do portão vai apontar isto")
    return numeros


if __name__ == "__main__":
    main()
