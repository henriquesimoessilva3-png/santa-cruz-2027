#!/usr/bin/env python3
"""Escreve static/sb_clubes.js — os 100 clube-temporada da Serie B que a aba do app le.

Por que um arquivo gerado e nao um calculo no navegador: as tres bases somam quase 10 MB
(5,8 do jogo a jogo, 1,9 do tecnico, 1,1 dos elencos). Mandar isso para o navegador de
alguem que so quer ver a aba seria absurdo. O que a aba precisa sao 100 linhas com ~30
numeros cada — uns 20 KB, que cabem no mesmo lugar onde ja mora a SB_TABELAS.

O que NAO muda com isso: continua valendo a regra da aba de que **o dado e a fonte e o
texto e consequencia**. Nenhuma media, nenhuma correlacao e nenhum percentual da tela sai
daqui pronto: o `sb_clubes.js` traz so o que foi MEDIDO em cada clube-temporada, e as
contas acontecem no `sbResumo()` como sempre aconteceram. Se uma partida for corrigida na
base, roda-se este script de novo e a tela inteira se corrige.

Rode depois de mexer em qualquer uma das tres bases:
    python3 gerar_sb_clubes.py
"""
import json
import os
import unicodedata

import numpy as np
import pandas as pd

from analisar_serieb import PERM_R, SETORES, TM, base, nfc

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "static", "sb_clubes.js")

# nome curto no JS -> coluna na tabela -> casas decimais.
# Os campos que ja existem na SB_TABELAS (pos, J, V, E, D, GP, GC) NAO entram: seriam
# duas fontes para o mesmo numero, e um dia elas discordariam.
CAMPOS = [
    ("rem", "remates", 2), ("remBal", "remates_baliza_pct", 1),
    ("remCon", "remates_contra", 2), ("xg", "xg", 3), ("xgCon", "xg_contra", 3),
    # --- a cadeia do chute, elo por elo (veja sbBlocoAposChute no app.js) ---
    # `remBal` acima e a media das PORCENTAGENS jogo a jogo; `alvo` e a contagem. So a
    # contagem multiplica de volta em gol, e por isso as duas precisam viajar.
    # `alvoCon` vem da linha do adversario; `alvoConProp`, da coluna "Remates contra no
    # alvo" da propria linha — as duas nao concordam, e a tela mostra o tamanho disso.
    ("alvo", "remates_baliza", 2), ("alvoCon", "remates_baliza_contra", 2),
    ("alvoConProp", "remates_contra_alvo", 2),
    # dispersao jogo a jogo: e o que permite separar sinal de sorteio de temporada
    ("dpRem", "dp_remates", 2), ("dpAlvo", "dp_remates_baliza", 2),
    ("dpRemCon", "dp_remates_contra", 2), ("dpAlvoCon", "dp_remates_baliza_contra", 2),
    ("dist", "dist_remate", 1), ("toques", "toques_area", 2),
    ("ppda", "ppda", 2), ("posse", "posse", 2), ("passePct", "passes_pct", 2),
    ("bp", "bolas_paradas", 2), ("bpRem", "bp_remates", 2), ("cantos", "cantos", 2),
    ("penCon", "penaltis_conv", 0), ("cabeca", "golos_cabeca", 0),
    ("cs", "clean_sheets", 0), ("branco", "brancos", 0),
    ("goleadaPro", "goleadas_pro", 0), ("goleadaCon", "goleadas_con", 0),
    ("ptsCasa", "pontos_casa", 0), ("ptsFora", "pontos_fora", 0),
    ("valor", "tm_valor_total", 0), ("valDef", "val_defesa", 0),
    ("valMeio", "val_meio", 0), ("valAtq", "val_ataque", 0), ("valGol", "val_goleiro", 0),
    ("usados", "atletas_usados", 0), ("nucleo300", "nucleo_300", 0),
    ("nucleo1000", "nucleo_1000", 0), ("share11", "share_11", 2),
    # A disponibilidade dos MESMOS onze, em partidas. `jogosBase` e o denominador dela: as
    # partidas que a base COBRE, que em 4 das 80 temporadas completas sao 37 e nao 38
    # (Londrina x Tombense 2022, Operario-PR x Chapecoense 2024 — as mesmas cinco partidas
    # que faltam e que a aba ja declara em "O que falta medir"). Os dois vao crus; a divisao
    # e a media acontecem no navegador, como manda a regra da aba.
    ("pj11", "pj_11", 2), ("jogosBase", "jogos_base", 0),
    ("idade", "idade_pond", 2), ("minEstr", "min_estrangeiros", 2),
    # o onze mais usado, em euros do Transfermarkt POR TEMPORADA (nao o snapshot do
    # Wyscout). `n11tm` e quantos dos 11 acharam ficha no Transfermarkt e `n11val`
    # quantos tem valor publicado: sao a ressalva de cobertura do `val11`, e a tela
    # calcula a media deles em vez de trazer o numero escrito a mao.
    ("val11", "valor_11", 0), ("n11tm", "valor_11_casados", 0),
    ("n11val", "valor_11_com", 0),
    ("plantel", "plantel", 0), ("comValor", "tm_com_valor", 0),
    ("aereos", "duelos_aereos_pct", 2),
    ("cruzPct", "cruz_certos_pct", 2), ("faltas", "faltas", 2),
    # --- estabilidade da escalacao e a base de lesoes ---
    # Nao saem do `base()`: sao juntadas em main(), de `estabilidade_e_lesao()`. `part11` e
    # `tit30` sustentam o bloco do mesmo nome na secao do elenco; `lesDias` e `lesFicha`
    # existem para a Secao 10 poder DEMONSTRAR por que a base de lesao fica fora, em vez de
    # afirmar isso com um numero digitado na prosa. `lesDias` nao e declarado aqui: quem o
    # declara e o item A-15, em outro ponto desta mesma lista. A coluna sai da mesma
    # `estabilidade_e_lesao()` abaixo, entao os dois itens leem o mesmo numero.
    ("part11", "est_part11", 2), ("tit30", "est_tit30", 0),
    ("lesFicha", "les_ficha", 0),
    # --- a segunda camada de perguntas (analisar_serieb.extras_profundos) ---
    ("aprovG6", "aprovG6", 2), ("aprovMeio", "aprovMeio", 2), ("aprovZ6", "aprovZ6", 2),
    # as mesmas tres faixas sem a armadilha de ninguem jogar contra si mesmo: os seis
    # melhores, os sete do meio e os seis piores ADVERSARIOS de cada clube
    ("aprovTop6", "aprovTop6", 2), ("aprovMio7", "aprovMio7", 2), ("aprovBot6", "aprovBot6", 2),
    # o recorte que tira o calendario do meio (bloco do adversario, static/app.js):
    # `jG6` e a contagem de jogos contra as POSICOES 1 a 6 da tabela — 10 para quem terminou
    # no G4 e 12 para quem caiu, porque ninguem joga contra si mesmo. `jogos56`, `pts56` e
    # `xgd56` sao os jogos contra o 5o e o 6o COLOCADOS, que sao 4 para todo clube das duas
    # faixas e contra os MESMOS dois adversarios: diferenca de calendario zero. Sao numeros
    # MEDIDOS partida a partida; a media, a diferenca e a regua acontecem no navegador.
    ("jG6", "jG6", 0), ("jogos56", "jogos56", 0), ("pts56", "pts56", 0),
    ("xgd56", "xgd56", 3),
    ("pts1t", "pts1t", 0), ("pts2t", "pts2t", 0),
    ("pts10ini", "pts10ini", 0), ("pts10fim", "pts10fim", 0),
    ("semVencer", "maxSemVencer", 0), ("vitSeguidas", "maxVitorias", 0),
    ("ptsAposD", "ptsAposDerrota", 2), ("ptsAposV", "ptsAposVitoria", 2),
    # --- o que o ACASO previa para cada clube, de analisar_serieb.permutacao_sequencias ---
    # A unica coisa da aba que nao roda no navegador: 100 clube-temporada x 3 nulos x PERM_R
    # permutacoes dos proprios resultados. Sufixo "M" = embaralhado dentro de mando; "MT" =
    # dentro de mando x terco de forca do adversario. Os `p` sao bicaudais e de permutacao.
    ("espSemVencer", "espSemVencer", 2), ("espSemVencerM", "espSemVencerM", 2),
    ("espSemVencerMT", "espSemVencerMT", 2),
    ("espVitSeguidas", "espVitSeguidas", 2), ("espVitSeguidasMT", "espVitSeguidasMT", 2),
    ("espAposD", "espAposD", 2), ("espAposDM", "espAposDM", 2), ("espAposDMT", "espAposDMT", 2),
    ("espAposV", "espAposV", 2), ("espAposVM", "espAposVM", 2),
    ("ptsAposDcasa", "ptsAposDcasa", 2), ("ptsAposDfora", "ptsAposDfora", 2),
    ("espAposDcasa", "espAposDcasa", 2), ("espAposDfora", "espAposDfora", 2),
    ("espAposDcasaM", "espAposDcasaM", 2), ("espAposDforaM", "espAposDforaM", 2),
    ("pSemVencer", "pSemVencer", 4), ("pVitSeguidas", "pVitSeguidas", 4),
    ("pAposD", "pAposD", 4), ("pAposDM", "pAposDM", 4), ("pAposDMT", "pAposDMT", 4),
    # jCasa E jFora vem os dois do MESMO jogo a jogo. Nao use `t.j` da SB_TABELAS contra o
    # jCasa daqui: quatro clube-temporada (Londrina-2022, Tombense-2022, Chapecoense-2024,
    # Operario-PR-2024) tem 37 jogos na base contra 38 na tabela, e a divisao erra.
    ("jCasa", "jCasa", 0), ("jFora", "jFora", 0),
    ("formacoes", "formacoes", 0), ("formPct", "formPrincipalPct", 1),
    ("pctArtilheiro", "pctArtilheiro", 1), ("marcadores", "marcadores", 0),
    ("pctTop3", "pctTop3", 1),
    ("gkDefesas", "gkDefesas", 2), ("gkEvitados", "gkEvitados", 3),
    ("pctFicou", "pctFicou", 1), ("novos", "novos", 0),
    # --- fisico, do SkillCorner (ponte de nome + idade, conferida em 98,2%) ---
    ("psv99", "fis_psv99", 2), ("psv99Top5", "fis_psv99_top5", 2),
    ("sprintDist", "fis_sprint_distance_p90", 1), ("sprintQtd", "fis_sprint_count_p90", 2),
    ("hsrDist", "fis_hsr_distance_p90", 1), ("hsrQtd", "fis_hsr_count_p90", 2),
    ("hiDist", "fis_hi_distance_p90", 1), ("hiQtd", "fis_hi_count_p90", 2),
    ("dist90", "fis_distance_p90", 0), ("mPorMin", "fis_m_per_min", 2),
    ("corrida90", "fis_running_distance_p90", 0),
    ("acel", "fis_high_accel_p90", 2), ("desacel", "fis_high_decel_p90", 2),
    ("acelMed", "fis_medium_accel_p90", 1), ("desacelMed", "fis_medium_decel_p90", 1),
    ("explSprint", "fis_expl_accel_sprint_p90", 2), ("explHsr", "fis_expl_accel_hsr_p90", 2),
    ("mudDirecao", "fis_cod_count_p90", 2),
    # com a bola / sem a bola — por 30 min de cada fase
    ("mpmCom", "fis_m_per_min_tip", 2), ("mpmSem", "fis_m_per_min_otip", 2),
    ("distCom", "fis_distance_p30tip", 0), ("distSem", "fis_distance_p30otip", 0),
    ("sprintCom", "fis_sprint_distance_p30tip", 1), ("sprintSem", "fis_sprint_distance_p30otip", 1),
    ("hsrCom", "fis_hsr_distance_p30tip", 1), ("hsrSem", "fis_hsr_distance_p30otip", 1),
    # corridas sem bola (Off Ball Runs). Medidas por 30 min COM o time em posse — o atleta
    # corre sem a bola enquanto o TIME a tem. Nao confundir com os `*Sem` acima, que sao o
    # time fora de posse. Cobertura de 97% a 99% depois do backfill de 11/09/2026.
    ("obrQtd", "fis_runs_p30tip", 2), ("obrHsr", "fis_runs_above_hsr_p30tip", 2),
    ("obrArea", "fis_runs_penalty_area_p30tip", 2), ("obrPerigo", "fis_runs_dangerous_p30tip", 2),
    ("obrRecebeu", "fis_runs_received_p30tip", 2), ("obrRemate", "fis_runs_shot_within_10s_p30tip", 2),
    ("fisAtletas", "fis_atletas", 0),
    # --- a base de lesoes, a unica que entra para ser RECUSADA ---
    # Nao entra em nenhuma media, correlacao ou quadro da aba — fora deste veredito, so na
    # ressalva de cobertura da §5. Os quatro campos existem para que o veredito
    # de `sbBlocoLesoes()` (static/app.js) seja conferido na tela em vez de ser uma frase de
    # autoridade escrita a mao. Ver a funcao `lesoes()` acima.
    ("lesDias", "les_dias", 0), ("lesCob", "les_cob", 0),
    ("lesRep", "les_rep", 0), ("lesRepDias", "les_rep_dias", 1),
]

# Campos de TEXTO (a formacao mais usada). Ficam a parte porque nao passam pelo
# arredondamento numerico.
CAMPOS_TXT = [("formPrin", "formPrincipal")]

# --- o mesmo fisico, agora dentro de cada grupo de posicao ---
# Derivado da parte fisica do CAMPOS acima em vez de escrito a mao: sao os mesmos 27
# indicadores com os mesmos arredondamentos, vezes quatro grupos = 108 campos. Digitar
# isso na mao e onde um `hsrSem` acaba no lugar de um `hsrCom` e ninguem descobre.
# Goleiro nao esta na lista porque o SkillCorner nao rastreia goleiro (ver
# `analisar_serieb.GRUPOS_FIS`).
GRUPOS_FIS = ["zaga", "lateral", "meio", "ataque"]
_FIS = [(js, col, casas) for js, col, casas in CAMPOS if col.startswith("fis_")]
CAMPOS += [(f"{g}_atletas" if js == "fisAtletas" else f"{g}_{js}",
            col.replace("fis_", f"fis_{g}_", 1), casas)
           for g in GRUPOS_FIS for js, col, casas in _FIS]

# --- distribuicao por idade ---
# As faixas sao fechadas a ESQUERDA: "20 a 23" e 20, 21 e 22. Sem essa convencao escrita,
# alguem um dia soma 23 nas duas faixas vizinhas e o total passa de 100%.
FAIXAS = [("ate20", 0, 20), ("f2023", 20, 23), ("f2327", 23, 27), ("f2730", 27, 30), ("f30", 30, 99)]
GRUPOS = ["goleiro", "defesa", "meio", "ataque"]


def por_idade():
    """Minutos e atletas de cada clube-temporada, por setor x faixa etaria.

    A idade e a `idade_na_temporada` do serieb_tecnico.csv, que e a idade do atleta em
    SETEMBRO daquele ano (os dez arquivos do Wyscout sairam em 11/09/2026, e a coluna
    original e a idade naquele dia). Conferida contra 3.181 datas de nascimento do
    Transfermarkt: bate exatamente em 90% dos casos e erra um ano em 9% — e parte desses 9%
    e homonimo casado errado, nao idade errada. Para faixas de tres e quatro anos isso e
    aceitavel; para qualquer conta no nivel do atleta, nao e.
    """
    T = pd.read_csv(os.path.join(AQUI, "dados", "serieb_tecnico.csv"))
    T["clube"] = T["Equipa dentro de um período de tempo seleccionado"].map(nfc)
    T["grupo"] = T["posicao_1"].map(lambda p: SETORES.get(str(p), "ataque"))

    def faixa(i):
        if pd.isna(i):
            return None
        for nome, a, b in FAIXAS:
            if a <= i < b:
                return nome
        return None

    T["faixa"] = T["idade_na_temporada"].map(faixa)
    T = T[T["faixa"].notna()]
    minutos, atletas = {}, {}
    for (ano, clube, g, f), d in T.groupby(["ano", "clube", "grupo", "faixa"]):
        minutos[(ano, clube, g, f)] = int(d["Minutos jogados:"].sum())
        atletas[(ano, clube, g, f)] = int(len(d))
    return minutos, atletas


def lesoes():
    """Dias de desfalque e COBERTURA da base de lesoes, por clube-temporada.

    Esta e a unica base que entra no sb_clubes.js para ser RECUSADA, e o motivo esta no
    segundo numero: `les_cob` conta quantos atletas do plantel tem FICHA de lesao no
    Transfermarkt, e ficha preenchida anda com o tamanho do clube. Sem esse denominador na
    tela, "a base de lesoes tem vies" e uma frase de autoridade; com ele, e uma conta.

        les_dias      dias de desfalque do plantel que caem na janela 01/04-30/11 do ano.
                      A coluna `dias_AAAA` do CSV ja e essa interseccao, conferida aqui:
                      bate nas 2.668 lesoes que tem as duas datas (as outras 56, nao).
        les_cob       atletas do plantel com alguma lesao registrada, em qualquer ano.
        les_rep       atletas do plantel que tambem estao em OUTRO clube no mesmo ano.
        les_rep_dias  a parte dos dias deles que e contagem repetida, dividida pelos
                      clubes em que o atleta aparece — a soma nos 100 da exatamente os
                      dias contados mais de uma vez, sem depender de o atleta ter passado
                      por dois clubes ou por tres.

    Quem nao tem ficha entra com zero dia, e zero ali nao quer dizer que o atleta jogou o
    ano inteiro: quer dizer que ninguem editou a pagina dele. E o vies inteiro.
    """
    L = pd.read_csv(os.path.join(AQUI, "dados", "serieb_lesoes.csv"))
    E = pd.read_csv(os.path.join(AQUI, "dados", "serieb_elencos.csv"))
    E["clube"] = E["clube"].map(lambda x: TM.get(nfc(x), nfc(x)))
    dias = L.groupby("id_jogador")[[c for c in L.columns if c.startswith("dias_")]].sum()
    ficha = set(L["id_jogador"])
    # quantos clubes cada atleta teve NAQUELE ano — o denominador da atribuicao dupla
    quantos = E.groupby(["ano", "id_jogador"])["clube"].nunique()
    linhas = []
    for (ano, clube), g in E.groupby(["ano", "clube"]):
        col = f"dias_{ano}"
        d = rep_dias = 0.0
        cob = rep = 0
        for j in g["id_jogador"]:
            x = float(dias[col].get(j, 0.0))
            d += x
            cob += j in ficha
            k = int(quantos[(ano, j)])
            if k > 1:
                rep += 1
                rep_dias += x * (k - 1) / k
        linhas.append(dict(ano=ano, clube=clube, les_dias=d, les_cob=cob,
                           les_rep=rep, les_rep_dias=rep_dias))
    return pd.DataFrame(linhas)


def uso_por_setor():
    """Quantos atletas cada clube usou em cada setor, e quantos de fato jogaram.

    Tres camadas por setor: quem passou de 1000 minutos (o time de verdade, uns onze jogos
    inteiros), quem passou de 300 (foi opcao, nao so entrou uma vez) e o total de usados.
    E o mesmo corte do bloco geral, agora aberto por posicao — que e onde se ve QUAL setor
    o clube passou o ano procurando.
    """
    T = pd.read_csv(os.path.join(AQUI, "dados", "serieb_tecnico.csv"))
    T["clube"] = T["Equipa dentro de um período de tempo seleccionado"].map(nfc)
    T["grupo"] = T["posicao_1"].map(lambda p: SETORES.get(str(p), "ataque"))
    fora = {}
    for (ano, clube, g), d in T.groupby(["ano", "clube", "grupo"]):
        m = d["Minutos jogados:"]
        fora[(ano, clube, g)] = (len(d), int((m >= 300).sum()), int((m >= 1000).sum()))
    return fora


# --- repetibilidade dentro da temporada ---
# O que a aba precisa para perguntar "com o MESMO elenco, no MESMO ano, este indicador se
# repete de uma metade da temporada para a outra?" — a pergunta que separa medida de ruido.
# Nao da para responder com a media da temporada; e preciso do jogo a jogo, e o jogo a jogo
# tem 5,8 MB. Entao o que viaja sao cinco numeros por clube-temporada e por indicador: a
# media, a variancia entre os jogos, quantos jogos entraram e as duas metades de turno. A
# confiabilidade, o intervalo, o teto e o "quantas partidas para chegar a 0,70" sao contados
# no navegador a partir daqui — nenhum deles sai pronto deste script.
#
# A VARIANCIA E CALCULADA DENTRO DE CADA MANDO: casa e fora separados, somas de quadrados
# somadas. Jogar em casa e jogar fora nao e ruido, e um vaivem que se cancela sozinho porque
# todo clube joga 19 e 19. Contado como erro, rebaixaria de graca todo indicador sensivel a
# mando — que e exatamente o defeito do corte par/impar, e por isso ele nao entra aqui.
#
# nome no JS -> coluna do jogo a jogo -> so os jogos deste mando -> casas decimais
REPETE = [
    ("ptsCasa", "pts_jogo", "casa", 3), ("ptsFora", "pts_jogo", "fora", 3),
    ("gcJogo", "golos_contra", None, 3), ("gpJogo", "golos_pro", None, 3),
    ("branco", "branco_jogo", None, 4), ("cs", "cs_jogo", None, 4),
    ("xgCon", "xg_adv", None, 3), ("dist", "Distância média do remate", None, 2),
    ("xg", "Golos esperados", None, 3), ("bpConv", "bp_conv_jogo", None, 2),
    ("toques", "Toques na área", None, 2), ("aereos", "Duelos aéreos ganhos, %", None, 2),
    ("remBal", "Remates à baliza, %", None, 2), ("ppda", "PPDA", None, 2),
    ("cruzPct", "Cruzamentos certos, %", None, 2), ("posse", "Posse, %", None, 2),
    ("faltas", "Faltas", None, 2), ("passePct", "Passes certos, %", None, 2),
    ("pts", "pts_jogo", None, 3), ("contra", "Contra-ataques", None, 3),
    ("finaliza", "finaliza_jogo", None, 3), ("defende", "defende_jogo", None, 3),
]


def repetibilidade():
    """Media, variancia entre jogos, n e as duas metades de turno, por clube-temporada.

    `bp_conv_jogo` e a taxa DE CADA JOGO (bola parada que virou remate), enquanto o resto da
    aba usa a razao das somas da temporada. Nao sao a mesma conta; a tela mede e publica o
    quanto se parecem (`sbRepBpConfere`, hoje 0,99) em vez de jurar que se parecem.
    """
    J = pd.read_csv(os.path.join(AQUI, "dados", "serieb_jogos.csv"))
    s = J[(J["Competição"] == "Brazil. Serie B") & J["resultado"].notna()].copy()
    s["clube"] = s["Equipa"].map(nfc)
    adv = s[["Data", "Jogo", "Equipa", "Golos esperados"]].rename(
        columns={"Equipa": "adv_nome", "Golos esperados": "xg_adv"})
    s = s.merge(adv, on=["Data", "Jogo"])
    s = s[s["Equipa"] != s["adv_nome"]]
    s["pts_jogo"] = s["resultado"].map({"V": 3, "E": 1, "D": 0})
    s["branco_jogo"] = (s["golos_pro"] == 0).astype(float)
    s["cs_jogo"] = (s["golos_contra"] == 0).astype(float)
    s["finaliza_jogo"] = s["golos_pro"] - s["Golos esperados"]
    s["defende_jogo"] = s["xg_adv"] - s["golos_contra"]
    s["bp_conv_jogo"] = np.where(s["Bolas paradas"] > 0,
                                 s["Bolas paradas com remates"] / s["Bolas paradas"] * 100, np.nan)
    s = s.sort_values(["ano", "clube", "Data"])
    fora = {}
    for (ano, clube), d in s.groupby(["ano", "clube"]):
        d = d.reset_index(drop=True)
        casa = (d["mando"] == "casa").to_numpy()
        rod = np.arange(len(d))
        # `casa_em_par` e o diagnostico do corte par/impar: o desequilibrio de mando dele e
        # |2*casa_em_par - jogos_em_casa|, e no pior clube-temporada ele chega a 19.
        linha = [len(d), int(casa.sum()), int((casa & (rod % 2 == 0)).sum())]
        for js, col, sub, casas in REPETE:
            m = np.ones(len(d), bool) if sub is None else (casa if sub == "casa" else ~casa)
            x = d[col].to_numpy(dtype=float)
            ok = m & ~np.isnan(x)
            xs, cs, rs = x[ok], casa[ok], rod[ok]
            t = rs < len(d) / 2
            if len(xs) < 4 or t.sum() < 2 or (~t).sum() < 2:
                linha += [None] * 5
                continue
            if sub is None:
                ss = gl = 0.0
                for g in (cs, ~cs):
                    if g.sum() > 1:
                        ss += float(((xs[g] - xs[g].mean()) ** 2).sum())
                        gl += int(g.sum()) - 1
                v = ss / gl
            else:
                v = float(xs.var(ddof=1))
            linha += [round(float(xs.mean()), casas + 1), round(v, casas + 2), int(len(xs)),
                      round(float(xs[t].mean()), casas + 1), round(float(xs[~t].mean()), casas + 1)]
        fora[(int(ano), clube)] = linha
    return fora


# --- game state: o mesmo clube, separado pelo desfecho da partida ---
# Isto NAO cabe no navegador. A media por resultado exige as 3.570 partidas (5,8 MB) e o
# que viaja para a tela sao 100 linhas. Aqui sai so o que foi MEDIDO: a media de cada
# indicador nos jogos que o clube venceu, empatou e perdeu, mais quantas partidas de cada
# desfecho a base tem. A reponderacao para o mix da liga, o efeito fixo, o intervalo de 95%
# e a correlacao antes/depois continuam sendo calculados no app.js — o dado e a fonte, o
# texto e consequencia.
GS_IND = [
    ("posse", "Posse, %", 2), ("passePct", "Passes certos, %", 2), ("ppda", "PPDA", 2),
    ("toques", "Toques na área", 2), ("xg", "Golos esperados", 3), ("xgCon", "xg_contra", 3),
    ("rem", "Remates", 2), ("remBal", "Remates à baliza, %", 1),
    ("dist", "Distância média do remate", 1), ("aereos", "Duelos aéreos ganhos, %", 2),
    ("cruzPct", "Cruzamentos certos, %", 2), ("faltas", "Faltas", 2),
    ("cruz", "Cruzamentos", 2), ("ca", "Contra-ataques", 2),
]


def game_state():
    """Media de cada indicador dentro do MESMO clube-temporada, separada por V, E e D.

    O merge com a linha do adversario e o mesmo de `analisar_serieb.do_jogo`: o xG sofrido
    nao e coluna da partida, e a linha do outro time no mesmo jogo.

    jV, jE, jD sao as partidas NA BASE, nao as da SB_TABELAS: cinco jogos faltam no
    Wyscout, e usar o V/E/D da tabela como peso daria peso a uma media que nao existe.
    """
    J = pd.read_csv(os.path.join(AQUI, "dados", "serieb_jogos.csv"))
    s = J[(J["Competição"] == "Brazil. Serie B") & J["resultado"].notna()].copy()
    s["clube"] = s["Equipa"].map(nfc)
    adv = s[["Data", "Jogo", "Equipa", "Golos esperados"]].rename(
        columns={"Equipa": "adv_nome", "Golos esperados": "xg_contra"})
    s = s.merge(adv, on=["Data", "Jogo"])
    s = s[s["Equipa"] != s["adv_nome"]]
    fora = {}
    for (ano, clube), g in s.groupby(["ano", "clube"]):
        v = [str(int((g["resultado"] == r).sum())) for r in "VED"]
        for _, col, casas in GS_IND:
            for r in "VED":
                x = g[g["resultado"] == r][col]
                v.append("null" if len(x) == 0 else repr(round(float(x.mean()), casas)))
        fora[(int(ano), clube)] = v
    return fora


def estabilidade_e_lesao():
    """Estabilidade da escalacao (por clube-temporada) e o minimo da base de lesoes.

    ESTABILIDADE — `est_part11` e a media de PARTIDAS JOGADAS dos onze mais usados em
    minutos, e `est_tit30` conta os atletas do elenco com 30 jogos ou mais. Nao chame isso
    de disponibilidade: a base diz quantas partidas o atleta jogou e nao diz por que ele
    nao jogou (lesao, escolha do treinador, suspensao, venda em julho). O nome honesto e
    estabilidade da escalacao, e e assim que aparece na tela.

    LESAO — `les_dias` soma os dias de desfalque do plantel na janela brasileira (o
    `coletar_serieb_lesoes.py` ja recorta 01/04 a 30/11 de cada ano), e `les_ficha` conta
    quantos atletas do plantel tem ao menos UM registro no Transfermarkt em qualquer
    temporada. O segundo e o mais importante dos dois: e ele que mostra que a base mede
    ficha preenchida, nao lesao. Quem nao tem ficha entra com zero dia — que e exatamente
    o problema, e por isso o par viaja junto.
    """
    T = pd.read_csv(os.path.join(AQUI, "dados", "serieb_tecnico.csv"))
    T["clube"] = T["Equipa dentro de um período de tempo seleccionado"].map(nfc)
    est = []
    for (ano, clube), d in T.groupby(["ano", "clube"]):
        # `kind="mergesort"` porque o padrao (quicksort) NAO e estavel: em Ceara 2023 dois
        # atletas empatam em 1.500 minutos exatamente na fronteira do 11o, e o desempate
        # mudaria de build para build. Ordenar tambem por partidas fixa o criterio no dado.
        onze = d.sort_values(["Minutos jogados:", "Partidas jogadas"],
                             ascending=False, kind="mergesort").head(11)
        est.append(dict(ano=ano, clube=clube,
                        est_part11=float(onze["Partidas jogadas"].mean()),
                        est_tit30=int((d["Partidas jogadas"] >= 30).sum())))
    est = pd.DataFrame(est)

    L = pd.read_csv(os.path.join(AQUI, "dados", "serieb_lesoes.csv"))
    E = pd.read_csv(os.path.join(AQUI, "dados", "serieb_elencos.csv"))
    E["clube"] = E["clube"].map(lambda x: TM.get(nfc(x), nfc(x)))
    anos = [c for c in L.columns if c.startswith("dias_")]
    dias = L.groupby("id_jogador")[anos].sum().stack().reset_index()
    dias.columns = ["id_jogador", "col", "dias"]
    dias["ano"] = dias["col"].str[-4:].astype(int)
    E = E.merge(dias[["id_jogador", "ano", "dias"]], on=["id_jogador", "ano"], how="left")
    E["ficha"] = E["id_jogador"].isin(set(L["id_jogador"]))
    E["dias"] = E["dias"].fillna(0)
    # `les_dias` NAO sai daqui: quem declara a coluna e a funcao `lesoes()` logo acima, que
    # e a dona do indicador de lesao. As duas somavam os mesmos dias de desfalque na mesma
    # janela; emitir nas duas fazia o merge renomear para les_dias_x/les_dias_y e o CAMPOS
    # nao achava mais a coluna. Aqui fica so `les_ficha`, que e desta funcao.
    les = E.groupby(["ano", "clube"]).agg(les_ficha=("ficha", "sum")).reset_index()
    return est.merge(les, on=["ano", "clube"], how="outer")


CABECALHO = '''/* GERADO POR gerar_sb_clubes.py — NAO EDITE A MAO.

   Os 100 clube-temporada da Serie B de 2022 a 2026, com o que as tres bases mediram em
   cada um. As bases inteiras somam quase 10 MB e nao tem por que viajar ate o navegador;
   isto aqui tem 100 linhas.

   Continua valendo a regra da aba: **o dado e a fonte, o texto e consequencia.** Aqui so
   entra o que foi MEDIDO. Toda media, correlacao e percentual da tela e calculado em
   `sbResumo()`, em static/app.js. Nenhum numero da tela vem pronto daqui.

   Nao ha pos, J, V, E, D, GP nem GC: esses ja estao na SB_TABELAS. Duas fontes para o
   mesmo numero e o jeito mais certo de um dia elas discordarem.

   Refazer:  python3 gerar_sb_clubes.py
*/
'''


t_base = None


def main():
    global t_base
    t = t_base = base().merge(lesoes(), on=["ano", "clube"], how="left").merge(estabilidade_e_lesao(), on=["ano", "clube"], how="left")
    campos = [c for c, _, _ in CAMPOS] + [c for c, _ in CAMPOS_TXT]
    linhas = []
    for _, r in t.sort_values(["ano", "pos"]).iterrows():
        v = []
        for _, col, casas in CAMPOS:
            x = r[col]
            # NaN vira null: 44 dos 100 clube-temporada nao tem ano anterior na Serie B, e
            # `pctFicou` deles nao e zero — e ausente. Zero ali seria mentira.
            if pd.isna(x):
                v.append("null")
            else:
                v.append(repr(int(round(x)) if casas == 0 else round(float(x), casas)))
        for _, col in CAMPOS_TXT:
            v.append(json.dumps("" if pd.isna(r[col]) else str(r[col]), ensure_ascii=False))
        linhas.append(f"  [{int(r.ano)},{json.dumps(r.clube, ensure_ascii=False)},"
                      + ",".join(v) + "],")

    with open(SAIDA, "w", encoding="utf-8") as f:
        f.write(CABECALHO)
        # O numero de replicas da permutacao viaja junto: a prosa da aba diz "10.000
        # permutacoes" em tres lugares, e numero escrito a mao na tela e bug. Se o PERM_R
        # do analisar_serieb.py mudar, a tela muda com ele.
        f.write(f"const SB_PERM_R = {PERM_R};\n\n")
        f.write("const SB_CAMPOS = " + json.dumps(campos) + ";\n\n")
        f.write("/* ano, clube, " + ", ".join(campos) + " */\n")
        f.write("const SB_CLUBES = [\n")
        f.write("\n".join(linhas))
        f.write("\n];\n\n")
        f.write("""/* Vira {ano, clube, rem, xg, ...} — e assim o resto do codigo nunca precisa
   saber a ordem das colunas. */
const SB_POR_CLUBE = SB_CLUBES.map(l => {
  const o = { ano: l[0], clube: l[1] };
  SB_CAMPOS.forEach((c, i) => { o[c] = l[i + 2]; });
  return o;
});

""")
        # --- distribuicao por idade ---
        minutos, atletas = por_idade()
        f.write("""/* Minutos e atletas por SETOR x FAIXA ETARIA. As faixas sao fechadas a esquerda:
   "20 a 23" e 20, 21 e 22 — sem isso alguem soma 23 nas duas faixas vizinhas.

   A idade e a do atleta em SETEMBRO daquele ano (a coluna do Wyscout e a idade no dia da
   exportacao, 11/09/2026). Conferida contra 3.181 datas de nascimento do Transfermarkt:
   exata em 90%, um ano de diferenca em 9% — e parte desses 9% e homonimo casado errado.
   Serve para faixas de tres e quatro anos; nao serve para conta no nivel do atleta. */
""")
        f.write("const SB_FAIXAS = " + json.dumps([n for n, _, _ in FAIXAS]) + ";\n")
        f.write("const SB_FAIXA_ROT = " + json.dumps(["até 20", "20 a 23", "23 a 27", "27 a 30", "30+"],
                                                     ensure_ascii=False) + ";\n")
        f.write("const SB_GRUPOS = " + json.dumps(GRUPOS, ensure_ascii=False) + ";\n\n")
        f.write("/* ano, clube, [minutos, atletas] por grupo x faixa, na ordem acima */\n")
        f.write("const SB_IDADE = [\n")
        for _, r in t_base.sort_values(["ano", "pos"]).iterrows():
            v = []
            for g in GRUPOS:
                for nome, _, _ in FAIXAS:
                    k = (int(r.ano), r.clube, g, nome)
                    v.append(minutos.get(k, 0))
                    v.append(atletas.get(k, 0))
            f.write(f"  [{int(r.ano)},{json.dumps(r.clube, ensure_ascii=False)}," + ",".join(map(str, v)) + "],\n")
        f.write("];\n\n")
        f.write("""/* Vira {ano, clube, grupo: {faixa: {min, n}}} — o resto do codigo nunca precisa
   saber a ordem em que os 40 numeros foram escritos. */
const SB_IDADE_POR_CLUBE = SB_IDADE.map(l => {
  const o = { ano: l[0], clube: l[1], g: {} };
  let i = 2;
  SB_GRUPOS.forEach(g => {
    o.g[g] = {};
    SB_FAIXAS.forEach(f => { o.g[g][f] = { min: l[i++], n: l[i++] }; });
  });
  return o;
});

""")
        # --- uso de elenco por setor ---
        uso = uso_por_setor()
        f.write("""/* Atletas usados por SETOR, em tres camadas: total, quem passou de 300 minutos e quem
   passou de 1000. Mesmos cortes do bloco geral, abertos por posicao — e onde se ve QUAL
   setor o clube passou o ano procurando. */
/* ano, clube, [usados, n300, n1000] por grupo, na ordem de SB_GRUPOS */
""")
        f.write("const SB_USO_SETOR = [\n")
        for _, r in t_base.sort_values(["ano", "pos"]).iterrows():
            v = []
            for g in GRUPOS:
                v.extend(uso.get((int(r.ano), r.clube, g), (0, 0, 0)))
            f.write(f"  [{int(r.ano)},{json.dumps(r.clube, ensure_ascii=False)}," + ",".join(map(str, v)) + "],\n")
        f.write("];\n\n")
        f.write("""const SB_USO_POR_CLUBE = SB_USO_SETOR.map(l => {
  const o = { ano: l[0], clube: l[1], g: {} };
  let i = 2;
  SB_GRUPOS.forEach(g => { o.g[g] = { usados: l[i++], n300: l[i++], n1000: l[i++] }; });
  return o;
});
""")
        # --- repetibilidade dentro da temporada ---
        rep = repetibilidade()
        f.write("""/* O jogo a jogo resumido para uma pergunta so: com o MESMO elenco, no MESMO ano, o
   indicador se repete de uma metade da temporada para a outra?

   Por clube-temporada: jogos, jogos em casa, jogos em casa que cairam em rodada de indice
   PAR (o diagnostico do corte par/impar), e depois, para cada indicador, cinco numeros —
   media por jogo, variancia entre os jogos, quantos jogos entraram, media do 1o turno e
   media do 2o turno.

   A VARIANCIA vem calculada dentro de cada mando (casa e fora separados). Jogar em casa e
   jogar fora nao e ruido: e um vaivem que se cancela sozinho, porque todo clube joga 19 e
   19. Contado como erro, rebaixaria de graca todo indicador sensivel a mando.

   Nada aqui e conclusao: confiabilidade, intervalo, teto e "partidas para chegar a 0,70"
   sao contados no navegador, em `sbBlocoRepetivel()`. */
""")
        f.write("const SB_REPETE_IND = " + json.dumps([js for js, _, _, _ in REPETE]) + ";\n\n")
        f.write("/* ano, clube, jogos, jogosCasa, casaEmPar, [media, vari, n, t1, t2] por indicador */\n")
        f.write("const SB_REPETE = [\n")
        for _, r in t_base.sort_values(["ano", "pos"]).iterrows():
            v = rep.get((int(r.ano), r.clube))
            if v is None:
                continue
            f.write(f"  [{int(r.ano)},{json.dumps(r.clube, ensure_ascii=False)},"
                    + ",".join("null" if x is None else repr(x) for x in v) + "],\n")
        f.write("];\n\n")
        f.write("""const SB_REPETE_POR_CLUBE = SB_REPETE.map(l => {
  const o = { ano: l[0], clube: l[1], jogos: l[2], jogosCasa: l[3], casaEmPar: l[4], m: {} };
  let i = 5;
  SB_REPETE_IND.forEach(k => {
    o.m[k] = { media: l[i], vari: l[i + 1], n: l[i + 2], t1: l[i + 3], t2: l[i + 4] };
    i += 5;
  });
  return o;
});

""")
        # --- game state: o mesmo clube, por desfecho da partida ---
        gs = game_state()
        f.write("""/* GAME STATE — o mesmo clube-temporada, separado pelo DESFECHO da partida.

   Por que isto vem do Python: a media por resultado exige as 3.570 partidas, e para o
   navegador viajam 100 linhas. Aqui esta so o que foi MEDIDO — a media de cada indicador
   nos jogos que o clube venceu, empatou e perdeu. A reponderacao para o mix da liga, o
   efeito fixo, o intervalo de 95% e a correlacao antes/depois sao calculados no app.js.

   jV, jE, jD sao as partidas NA BASE, nao as da SB_TABELAS: cinco jogos faltam no Wyscout
   (quatro clube-temporada completos jogam 37 aqui), e usar V/E/D da tabela como peso daria
   peso a uma media que nao existe. */
""")
        f.write("const SB_GS_IND = " + json.dumps([c for c, _, _ in GS_IND]) + ";\n\n")
        f.write("/* ano, clube, jV, jE, jD, [media em V, em E, em D] por indicador */\n")
        f.write("const SB_GAMESTATE = [\n")
        for _, r in t_base.sort_values(["ano", "pos"]).iterrows():
            v = gs.get((int(r.ano), r.clube))
            if v is None:
                continue
            f.write(f"  [{int(r.ano)},{json.dumps(r.clube, ensure_ascii=False)}," + ",".join(v) + "],\n")
        f.write("];\n\n")
        f.write("""const SB_GS_POR_CLUBE = SB_GAMESTATE.map(l => {
  const o = { ano: l[0], clube: l[1], j: { V: l[2], E: l[3], D: l[4] }, m: {} };
  let i = 5;
  SB_GS_IND.forEach(c => { o.m[c] = { V: l[i++], E: l[i++], D: l[i++] }; });
  return o;
});
""")
    kb = os.path.getsize(SAIDA) / 1024
    print(f"static/sb_clubes.js · {len(linhas)} linhas · {len(campos)} campos · {kb:.0f} KB")


if __name__ == "__main__":
    main()
