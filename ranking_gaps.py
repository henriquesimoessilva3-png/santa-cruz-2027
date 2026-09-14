#!/usr/bin/env python3
"""A tabela de TODAS as diferenças, do maior gap para o menor — e as listas que dizem o que
nunca pode entrar nela.

## Por que este módulo existe separado

O dono pediu (PENDENTE_RODADA.md, item 6) "uma tabela compilada de todos os indicadores,
do maior gap para o menor, entre as 3 faixas". Ela vai existir em DUAS abas: a de posição
(`gerar_prototipo.py`, faixas sobe/meio/cai) e a de pontos (`gerar_pontos.py`, faixas
alta/média/baixa). Se cada gerador tivesse a sua cópia, um dia as duas discordariam sobre
o que é um gap, sobre quem "destoa" ou sobre o que conta como resultado redescrito — e a
tela mostraria duas verdades lado a lado. Por isso a regra mora aqui, uma vez, e os dois
geradores importam.

Consequência de desenho: **este módulo não importa nenhum dos dois geradores.** O
`gerar_prototipo.py` vai importá-lo na próxima rodada, e um import de volta faria um ciclo.
As poucas ferramentas estatísticas de que ele precisa (d de Cohen, Mann-Whitney, BH, resíduo)
estão copiadas abaixo com a mesma mecânica das do gerador, e a cópia é pequena de
propósito.

## A ordenação engana de três jeitos já medidos, e cada um tem a sua coluna

1. **Ordenar 293 indicadores junta no topo os vencedores do acaso.** Por isso a tabela sai
   com a LINHA DA SORTE: os rótulos são sorteados DENTRO do ano, mantendo quantos times de
   cada faixa havia em cada ano, mil vezes, e mede-se o maior gap que o puro sorteio
   produz olhando todos os indicadores de uma vez. Acima dessa linha, o gap dificilmente é
   sorte mesmo depois de ter olhado tudo; abaixo, só vale com o desconto dos N testes.
   Gerador próprio `np.random.default_rng([7, 23])`: a linha não pode depender do que
   outra etapa sorteou antes.
2. **Parte do que separa as faixas é o próprio placar dito com outras palavras** (gols,
   saldo, sequências, pontos por recorte). Isso não é achado, é a definição da faixa. A
   LISTA DE RESULTADO abaixo tira essas colunas de TODA tabela, e a função quebra se uma
   delas for passada como indicador.
3. **Parte do que separa é consequência de ganhar** (quem ganha repete o time: `share_11`,
   `conc_hhi`...). Não é pedaço de pontos, mas não é receita: a linha fica, com a marca
   "consequência do resultado", que NÃO depende de porta nenhuma — se dependesse, a
   membresia mudaria sozinha a cada troca de faixa.

E duas colunas de desconto, porque "separa" e "separa depois do dinheiro" são perguntas
diferentes: o p descontado o posto de valor do elenco e, nas linhas físicas (média por
atleta rastreado), descontado o valor E o número de atletas rastreados.

## Sobre "quem destoa"

Com três faixas ordenadas pela posição média NAQUELE indicador, o grupo que destoa é o da
ponta que está MAIS LONGE do grupo de posição média intermediária — que pode ser qualquer
faixa, inclusive a faixa do meio da régua (então quem destoa pode ser a própria média). É uma escolha feita DEPOIS de olhar o dado (qual das duas
pontas), e por isso o p dele contra o resto é otimista — o `q` com o desconto dos N testes
vai ao lado, e a linha da sorte, que não escolhe grupo nenhum (mede só o gap), é a régua
que não sofre desse viés. (A prévia de 13/09 escolhia "o grupo mais longe da média dos
outros dois"; com três números as duas regras escolhem sempre o mesmo grupo — a ponta de
cima ganha exatamente quando a distância dela ao do meio é maior que a da ponta de baixo.)

## Sobre o teste: Mann-Whitney, não Welch

O que se compara é o PERCENTIL dentro do ano, que é ordinal — a distância entre o 60 e o 70
não é "10 unidades" de nada. O teste de postos (Mann-Whitney bilateral) é o que não finge
escala intervalar, e é o teste da prévia que o dono leu no PENDENTE_RODADA.md (item 6: 24
sobrevivem ao desconto dos testes, 20 também ao dinheiro; item 7: duelo defensivo do meio
q 0,048 e p 0,016 descontado o dinheiro). Com Welch esses números mudariam sem ninguém ter
mudado de ideia sobre nada. O tamanho continua sendo o d de Cohen no percentil (a régua de
tamanho do resto do estudo), dito como tal.

## A guarda contra indicador circular é SEMÂNTICA

`referencias_circulares` percorre o JSON inteiro e acusa toda referência a coluna da lista
de resultado — como valor em qualquer campo ou lista, como chave de dicionário, e como
palavra dentro de texto livre. O que decide não é o nome da chave, é o PAPEL do registro:

- **listado como retirado**: o registro nomeia a coluna no próprio campo de identidade
  (`col`, `coluna`, `indicador`...) e traz `retirada_por_ser_resultado` com o motivo que ESTA
  lista dá para ELA. A declaração vale só para essa coluna, nesse campo — uma lista
  pendurada no registro, ou outro campo citando outra coluna com o mesmo motivo, não herda.
- **apresentado como achado**: o registro traz qualquer campo de teste (gap, p, q, d,
  tamanho, porta, acima da linha da sorte, destoa...). Com marca ou sem marca, isso é achado
  — a única exceção é um bloco de EXPOSIÇÃO declarado por quem chama (a etapa 10, "não
  contrate para isto"), e só para linhas cujo `tipo` é "resultado".
- **dicionário**: qualquer chave que seja coluna de resultado é acusada, sem mínimo de
  chaves; só passam os rótulos da régua (pts, pos...) em registro de linha (com clube/ano) ou
  dentro de uma zona da régua declarada por quem chama.

`autoteste_da_guarda` roda a cada rodada com os vazamentos que a conferência de 13/09 montou
contra a versão anterior (todos passavam) e com os falsos positivos que ela apontou.

Irmã dela, `referencias_de_consequencia_sem_marca` acusa coluna de CONSEQUÊNCIA (quem ganha
repete o XI) que aparece sem a marca — em qualquer lugar do JSON.

## Limites conhecidos da guarda (fechamento, 14/09/2026)

A proteção PRINCIPAL não é esta guarda: é a LISTA DE RESULTADO aplicada ANTES de qualquer teste.
As colunas circulares nem entram na matriz, e `tabela_de_gaps` quebra se receber uma. A guarda
varre o JSON pronto e é a rede de segurança para um nome que escape por outro caminho (uma porta
temporal, uma tabela montada à mão, um texto de leitura). Quatro rodadas de conferência
adversarial mostraram que, contra a LEITURA DE FRASE, sempre existe mais uma forma de escrever; a
decisão foi parar de escalar a heurística e declarar aqui o que continua passando. Cada caso
abaixo foi medido nesta versão e dá 0 achados (os casos estão em `scratchpad/fecho/limites.py`):

1. **Sinônimo fraco com verbo fora da lista, ou sem verbo.** "os gols marcados decidem a faixa",
   "o saldo ordena as faixas", "a vitória em casa separa as faixas" (vitória no singular não é
   sinônimo), "gols marcados: alta 58,2 x baixa 39,1." (o
   resumo típico de tela, sem verbo), "a concentração de minutos separa as faixas", "o share 11
   separa as faixas" e "SHARE-11 separa as faixas" (em texto a consequência só é lida com o nome
   escrito como na lista). Motivo: sinônimo fraco (régua, gols, pontos, saldo) só conta como SUJEITO
   de verbo de achado da lista `_VERBO_DE_ACHADO`; ampliar a lista de verbos ou contar faixa colada a
   número em qualquer frase acusaria o texto de régua ("a faixa alta começa em 53,5%").
2. **Contexto de retirada NEGADO lido como retirada.** "O GP que nunca foi circular separa as
   faixas", "O SG longe de ser pedaço mecânico separa as faixas", "golos_pro que nao e circular
   separa as faixas" (em campo de regra), "os gols sem nada de circular separam as faixas", "os novos
   sem consequência nenhuma separam as faixas"; e a negação que não nega: "Os gols marcados não
   apenas separam a alta da baixa: são o melhor sinal." Motivo: a leitura é por palavra, não por
   escopo de negação.
3. **Grafias coladas, com ponto ou por extenso em CHAVE.** `SG.gap` (o ponto não parte, para os
   endereços de caminho do mapa da tela), `SGgap`, `gapSG`, `GPxGC_rho` (sem separador entre dois
   nomes), `saldo_gols_gap`, `gols_pro_gap` (grafia brasileira: a lista usa `golos_pro`),
   `vitorias_alta`/`vitorias_baixa`, `mean_V: {alta, baixa}` (V como pedaço sem estatística nem faixa
   ao lado); e "o S.G. separa as faixas" em texto. Motivo: a chave é partida em `_ espaço - / ( ) %`;
   camelCase e sinônimo por extenso são lidos só em frase.
4. **Nome de coluna com espaço fora de campo de identidade ou de lista, ou com mais de três
   palavras.** `{"nome": "Golos sofridos", "gap": 30}` (`nome` é rótulo, não identidade) e
   `{"indicador": "Golos sofridos por jogo em casa", "gap": 30}` são lidos só como frase. Motivo: ler
   todo texto curto como nome acusava o próprio motivo da lista ("pedaço de GP") em 13 lugares do JSON
   real.

E um falso positivo conhecido, que quebra em voz alta (não abre porta): `{"indicador": "xg",
"rho_pts": -0.5}` acusa `pts`, embora seja a régua como desfecho (igual a `rho_com_aproveitamento`,
só que sem a palavra de relação).

A consequência segue a mesma divisão: marca num ancestral isenta a CITAÇÃO; linha ou chave com
estatística só é isenta pela marca no próprio registro ou no registro que a contém diretamente.
"""
import re

import numpy as np
import pandas as pd
from scipy import stats

VERSAO_DAS_LISTAS = "2026-09-13"

# ══════════════════════════════════════════════════════════════════════════════
#  As listas, versionadas ANTES de rodar
# ══════════════════════════════════════════════════════════════════════════════
#
# Escritas a partir da auditoria do gerador (13/09/2026), coluna a coluna, com o motivo.
# Escolher esta lista depois de ver quais indicadores separam seria construir a proteção em
# cima da resposta; por isso cada entrada diz POR QUE é circular, e não "porque separou".

# Colunas que SÃO a faixa ou a definem: pedaço mecânico dos pontos.
RESULTADO = {
    # a própria régua
    "pts": "é a régua da faixa", "pos": "posição final: quase monótona em pts",
    "subiu": "é o desfecho por posição", "caiu": "é o desfecho por posição",
    "faixa": "é a faixa por posição", "faixa_pts": "é a faixa por pontos",
    "aproveitamento": "é a régua da faixa", "punicao_pts": "ajuste da régua",
    "jogos_faltando": "ajuste do denominador da régua", "pts_oficial": "é a régua da faixa",
    # colunas que as abas CRIAM para carregar a régua (a conferência de 13/09 mostrou que, fora
    # da lista, uma delas passaria como indicador sem a guarda acusar)
    "subiu_de_fato": "é o desfecho por posição", "faixa_posicao": "é a faixa por posição",
    "aproveitamento_pct": "é a régua da faixa (em %)", "y": "é o rótulo da faixa no ajuste",
    "penaltis": ("zona cinzenta: pênaltis a favor, coluna da fonte sem definição conferida "
                 "(penaltis_conv às vezes passa de penaltis_marcados); fora por cautela"),
    # pts = 3V + E, exatamente (medido: diferença 0 nas 80)
    "V": "pts = 3V + E", "E": "pts = 3V + E", "D": "complemento de V e E em J jogos",
    # gols decidem resultado; saldo explica quase toda a variância de pontos
    "GP": "gols decidem o resultado", "GC": "gols decidem o resultado",
    "SG": "saldo de gols explica quase toda a variância de pontos",
    "gp_jogo": "gols por jogo", "gc_jogo": "gols sofridos por jogo",
    "golos_sem_penalti": "pedaço de GP", "golos_tec": "pedaço de GP",
    "penaltis_marcados": "pedaço de GP", "penaltis_conv": "conversão = gols de pênalti",
    "bp_conv": "conversão de bola parada = gols", "golos_cabeca": "pedaço de GP",
    # contêm gols sofridos ou marcados
    "defesa_vs_xg": "correlação 1,000 com xg_contra - GC/J: contém gols sofridos",
    "gkEvitados": "xG contra menos gols sofridos",
    "finalizacao": "gols menos xG: contém GP",
    "xg_saldo": "zona cinzenta (processo, não pedaço mecânico), mantida por cautela",
    # somam pontos
    "pontos_casa": "soma com pontos_fora = pts", "pontos_fora": "soma com pontos_casa = pts",
    "pts1t": "soma com pts2t = pts", "pts2t": "soma com pts1t = pts",
    "ap1t": "aproveitamento do 1º turno: pedaço do aproveitamento",
    "ap2t": "aproveitamento do 2º turno: pedaço do aproveitamento",
    "pts10ini": "pontos das 10 primeiras rodadas", "pts10fim": "pontos das 10 últimas",
    "pts56": "pontos num recorte de jogos", "jogos56": "recorte definido pela tabela",
    "xgd56": "zona cinzenta: recorte definido pela tabela",
    # pontos condicionados ao resultado anterior
    "ptsAposDerrota": "pontos condicionados ao resultado anterior",
    "ptsAposVitoria": "pontos condicionados ao resultado anterior",
    "ptsAposD": "pontos condicionados ao resultado anterior",
    "ptsAposDcasa": "pontos condicionados ao resultado anterior",
    "ptsAposDfora": "pontos condicionados ao resultado anterior",
    "ptsAposV": "pontos condicionados ao resultado anterior",
    # sequências
    "maxVitorias": "sequência de resultados", "maxSemVencer": "sequência de resultados",
    "semVencer": "sequência de resultados", "vitSeguidas": "sequência de resultados",
    # aproveitamento contra grupos definidos pela POSIÇÃO FINAL
    "aprovG6": "aproveitamento contra grupo da tabela final",
    "aprovZ6": "aproveitamento contra grupo da tabela final",
    "aprovMeio": "aproveitamento contra grupo da tabela final",
    "aprovTop6": "aproveitamento contra grupo da tabela final",
    "aprovMio7": "aproveitamento contra grupo da tabela final",
    "aprovBot6": "aproveitamento contra grupo da tabela final",
    "jG6": "jogos contra o G6 dependem da própria posição",
    # placar
    "clean_sheets": "contagem de placar", "brancos": "contagem de placar",
    "goleadas_pro": "contagem de placar", "goleadas_con": "contagem de placar",
}

# Os esperados e os p de sequência (`espSemVencer`, `pAposDcasa`, ..., sufixos M e MT) são
# calculados das taxas de V/E/D do próprio clube: são 27 colunas e a lista nominal envelhece
# a cada coluna nova. O padrão de nome pega todas, e o `assert` de quem usa garante que nada
# escapou. `^p[A-Z]` não pega `passes` nem `pts` (minúscula depois do p).
PADROES_RESULTADO = (
    (re.compile(r"^esp[A-Z]"), "esperado de sequência calculado das taxas de V/E/D do clube"),
    (re.compile(r"^p[A-Z]"), "p de sequência calculado das taxas de V/E/D do clube"),
)

# Reescalas de gols: não somam pontos, mas o denominador é GP. Zona cinzenta declarada, e
# fora de teste de faixa pelo mesmo motivo das de cima.
DERIVADO_DE_GOLS = {
    "pctArtilheiro": "denominador é GP (reescala de gols)",
    "marcadores": "conta quem marcou gol (reescala de gols)",
    "pctTop3": "denominador é GP (reescala de gols)",
}

# Consequência de ganhar: fica na tabela, com a marca. Lista FIXA, independente da porta.
CONSEQUENCIA = {
    "share_11": "time que ganha repete o XI",
    "conc_hhi": "time que ganha concentra os minutos",
    "atletas_usados": "time que perde roda o elenco",
    "nucleo_300": "time que perde roda o elenco",
    "nucleo_1000": "time que ganha concentra os minutos",
    "pctFicou": "permanência de elenco depende de como foi o ano",
    "novos": "renovação de elenco depende de como foi o ano",
}

# Colunas do jogo a jogo que são o placar (se uma porta temporal puxar coluna daqui).
PLACAR_JOGO = {"resultado", "Golos", "Golos sofridos", "golos_pro", "golos_contra",
               "golos_casa", "golos_visitante", "pts"}

# Técnico individual: nada de gol no catálogo hoje, mas uma varredura ampliada puxaria.
# `Golos esperados` e `Golos expectáveis` (xG) são processo, não placar; `Golos expectáveis
# defendidos` (KPI de goleiro) é xG contra MENOS gols sofridos, o mesmo caso de `gkEvitados`, e
# fica no placar. O rótulo cru e o id (abaixo) dizem a mesma coisa sobre o mesmo conceito.
# O separador depois de `Golos` pode ser espaço (rótulo cru) ou `_` (a mesma coisa escrita como chave):
# até a rodada 4 o lookahead só aceitava espaço, e `Golos_esperados_gap` era lido como placar.
PLACAR_INDIVIDUAL = re.compile(r"^(Golos(?![ _]esperad|[ _]expect[aá]veis(?![ _]defendid))"
                               r"|Assist[eê]ncias(?![ _]esperad|[ _]expect[aá]veis)|Golos/90|Assist[eê]ncias/90)")
# O mesmo placar depois que o catálogo transforma o rótulo cru em id: `Golos/90` do setor
# ataque vira `ti_ataque_golos_90`. Casar só o rótulo cru deixava o id passar calado.
PLACAR_INDIVIDUAL_ID = re.compile(r"^ti_[a-z]+_(golos|assist[eê]ncias)(?!_esperad|_expect(?!aveis_defendidos))(_|$)")

# Colunas da régua: são rótulo de LINHA (clube, ano, pts, pos) e aparecem em toda tabela por
# clube. Nunca podem ser indicador, mas como rótulo de linha não são achado. E as de uma letra
# (V, E, D) colidem com texto comum ("porta D", "lado E"): como valor solto só contam quando
# estão no campo de identidade do registro ou num registro com estatística.
REGUA = frozenset({"pts", "pos", "subiu", "caiu", "faixa", "faixa_pts", "faixa_posicao", "aproveitamento",
                   "aproveitamento_pct", "pts_oficial", "punicao_pts", "jogos_faltando", "subiu_de_fato", "y"})
# `resultado` é coluna do jogo a jogo e palavra comum ("tipo": "resultado", `consequencia_do_resultado`):
# ambígua do mesmo jeito que V/E/D — só conta no campo de identidade ou como nome de registro com número.
PALAVRAS_COMUNS = frozenset({"resultado"})
AMBIGUAS = REGUA | {"V", "E", "D"} | PALAVRAS_COMUNS
MOTIVO_PLACAR_JOGO = "placar do jogo a jogo"


def motivo_resultado(col):
    """Motivo pelo qual `col` é pedaço do resultado, ou None se não for."""
    if not isinstance(col, str):
        return None
    if col in RESULTADO:
        return RESULTADO[col]
    if col in DERIVADO_DE_GOLS:
        return DERIVADO_DE_GOLS[col]
    for padrao, motivo in PADROES_RESULTADO:
        if padrao.search(col):
            return motivo
    if PLACAR_INDIVIDUAL.search(col) or PLACAR_INDIVIDUAL_ID.search(col):
        return "placar individual"
    # Depois do individual de propósito: `Golos` e `Golos sofridos` já eram "placar individual" e
    # continuam; o que muda é que `golos_pro`, `golos_contra`, `golos_casa`, `golos_visitante` e
    # `resultado` deixam de ser invisíveis para a varredura do JSON (antes só o assert da porta
    # temporal as protegia).
    if col in PLACAR_JOGO:
        return MOTIVO_PLACAR_JOGO
    return None


def e_resultado(col):
    return motivo_resultado(col) is not None


def motivo_consequencia(col):
    return CONSEQUENCIA.get(col)


IDENTIDADE = {"ano", "clube", "J", "bloco", "Equipa", "Jogador"}
MARCA_RETIRADA = "retirada_por_ser_resultado"
MARCA_SEM_TESTE = "resultado_fora_de_teste_de_faixa"


def retirada(col, **extra):
    """O registro de uma coluna RETIRADA por ser resultado, com a marca que a guarda confere."""
    mot = motivo_resultado(col)
    assert mot is not None, f"{col} não está na lista de resultado: não pode ser declarada retirada"
    return dict(col=col, motivo=mot, **{MARCA_RETIRADA: mot}, **extra)


def listas_declaradas():
    """As listas como vão ao JSON: para que a tela mostre o que ficou de fora e por quê."""
    def placar(c):
        mot = motivo_resultado(c)
        assert mot, f"{c} está em PLACAR_JOGO e motivo_resultado não o reconhece"
        return dict(coluna=c, motivo=mot, **{MARCA_RETIRADA: mot})
    return dict(
        versao=VERSAO_DAS_LISTAS,
        resultado=[dict(coluna=c, motivo=m, **{MARCA_RETIRADA: m}) for c, m in RESULTADO.items()],
        padroes_resultado=[dict(padrao=p.pattern, motivo=m) for p, m in PADROES_RESULTADO],
        derivado_de_gols=[dict(coluna=c, motivo=m, **{MARCA_RETIRADA: m})
                          for c, m in DERIVADO_DE_GOLS.items()],
        consequencia=[dict(coluna=c, motivo=m) for c, m in CONSEQUENCIA.items()],
        placar_do_jogo_a_jogo=[placar(c) for c in sorted(PLACAR_JOGO)],
        placar_individual=PLACAR_INDIVIDUAL.pattern)


# ══════════════════════════════════════════════════════════════════════════════
#  A guarda: nenhum indicador circular apresentado como achado
# ══════════════════════════════════════════════════════════════════════════════

MARCA_CONSEQUENCIA = "marca_consequencia"
# Estatística ENTRE duas colunas de resultado (ex.: o aproveitamento do 1º turno contra o do 2º):
# não é achado sobre faixa nenhuma, é a referência que o ρ parcial desconta. Precisa dizer isso
# no próprio registro, coluna por coluna, com o motivo da lista e o porquê. A RÉGUA (pts, faixa,
# aproveitamento...) nunca entra num par desses: "o SG correlaciona 0,9 com a faixa" é exatamente
# o achado circular, e uma marca bem-feita não pode transformá-lo em referência.
MARCA_REFERENCIA = "referencia_de_resultado_contra_resultado"

# Campos que dizem QUAL coluna o registro descreve.
CAMPOS_DE_IDENTIDADE = ("col", "coluna", "indicador", "coluna_csv", "id", "k")
# Campos que dão NOME a uma linha; "nome": "V" num registro com estatística ou com número é o V
# como achado.
CAMPOS_DE_ROTULO = CAMPOS_DE_IDENTIDADE + ("nome",)
# Campos que fazem de um registro uma APRESENTAÇÃO estatística (achado). A lista não é o que
# protege sozinha: num registro com a marca de retirada, QUALQUER número fora do campo de
# identidade — inclusive escrito como texto, "44,3" — conta como apresentação, com o nome que o
# campo tiver (ver `_registro_apresenta`).
CAMPOS_DE_TESTE = frozenset({"gap", "p", "q", "d", "tamanho", "porta", "acima_da_linha_da_sorte", "destoa",
                             "eta2", "rho", "auc", "se_repete", "status", "posicao_media", "mediana_crua",
                             "n_por_faixa", "ordem", "separa"})
PREFIXOS_DE_TESTE = ("p_", "q_", "d_", "rho_", "eta2_", "auc_", "tamanho_", "gap_", "m_", "r_", "media_",
                     "mediana_", "posicao_media")
# Texto que EXPLICA a regra. Por nome EXATO (uma versão usava prefixo, e `entradas_area` — um
# indicador — passava por `entra`, `teste_conclusao` por `teste`, `como_ler` por `como`). Só três
# prefixos continuam valendo, porque o nome inteiro diz o papel: `motivo_*`, `regra_*`,
# `por_que_*`. Campo de regra não é salvo-conduto: coluna forte citada ali conta, a não ser que a
# frase diga que ela foi retirada (ver `_conta_na_frase`).
CAMPOS_DE_REGRA = frozenset({"motivo", "regra", "por_que", "o_que_e", "o_que_mudou", "decisao", "_doc", "como",
                             "metodo", "criterio", "formula", "modelo_do_acaso", "teste", "padrao", "listas",
                             "aplicado_em", "circulares_recusadas", "rotulo_do_rho", "entra", "nao_entra",
                             "painel_2022_2026"})
PREFIXOS_DE_REGRA = ("motivo_", "regra_", "por_que_")
_SUFIXOS_FAIXA = ("alta", "media", "baixa", "sobe", "meio", "cai")

# ── Leitura de CHAVE por token ────────────────────────────────────────────────
# A chave é partida em `_` e procura-se, nos pedaços e nos pedaços vizinhos juntos, uma coluna da
# lista (`golos_cabeca` são dois pedaços). Não há lista de prefixos nem de sufixos: `delta_SG`,
# `SG_gap`, `diff_GP_alta_baixa`, `SG_q90` e `rho_SG_faixa` são lidos pelo que CONTÊM. As listas que
# sobram não são de afixo, são de papel:
# - palavra que é coluna e também palavra comum (`resultado`, coluna do jogo a jogo, está em
#   `consequencia_do_resultado` 666 vezes no JSON real): só conta como chave inteira ou valor de
#   identidade, nunca como pedaço;
# - coluna AMBÍGUA (a régua — pts, faixa, aproveitamento... — e V/E/D, que são rótulo de eixo
#   `D_explosao`, `porta_D`): como pedaço só conta se a chave tiver um pedaço ESTATÍSTICO fora da
#   coluna (d, p, rho, gap, delta...) e a régua não vier depois de uma palavra de relação (`com`,
#   `contra`, `x`). `faixa_posicao_t`, `pts_a_mais_para_subir_de_faixa`, `linhas_por_faixa` são a
#   régua descrita; `d_aproveitamento_1t` é a régua partida e testada; `rho_com_aproveitamento` é a
#   régua como DESFECHO de uma medida, que é o próprio estudo.
# Pedaço estatístico = palavra de CONTA (não de selo: `porta_D` é a porta D do catálogo, não um teste
# do D). Faixa (alta, media...) nunca é pedaço estatístico: `faixa_media` é a régua descrita.
_TOKENS_ESTATISTICOS = frozenset({"gap", "p", "q", "d", "tamanho", "eta2", "rho", "auc", "m", "r", "mediana",
                                  "delta", "diff", "dif", "diferenca", "corr"})
_TOKENS_DE_RELACAO = frozenset({"com", "contra", "x", "vs", "versus"})
_NUMERO_DECIMAL = re.compile(r"\d+[.,]\d+")
# Rodada 4 (14/09): a chave é partida também em espaço, hífen, barra, parênteses e %, porque "SG (gap)",
# "SG-gap", "GP/J" e "SG alta" são rótulos naturais de tela e de catálogo e passavam inteiros. O ponto
# NÃO parte: os caminhos do mapa da tela ("etapa_2.linhas[].SG") citam a coluna como segmento de
# caminho, e isso é endereço, não achado.
_SEPARADORES = re.compile(r"[_\s\-/()%]+")
# Nome de faixa como pedaço: "V_alta", "valor_na_baixa", "referencia_..._por_faixa".
_TOKENS_DE_FAIXA = frozenset({"faixa", "faixas", "alta", "media", "média", "baixa", "sobe", "meio", "cai"})
# V, E e D são também o nome de estatísticas (V de Cramér, D de Kolmogorov-Smirnov) e a letra de um eixo
# da tipologia (`D_explosao`, `E_qualidade_chance`). Ao lado desses pedaços, a letra é a estatística ou o
# eixo, não a coluna de vitórias/empates/derrotas. Lista explícita de propósito: um eixo novo com essas
# letras quebra a geração em voz alta (falso positivo), em vez de abrir uma porta calada.
_VIZINHOS_QUE_NAO_SAO_VED = frozenset({"cramer", "cramér", "ks", "kolmogorov", "smirnov", "kuiper",
                                       "explosao", "explosão", "qualidade"})

# ── Leitura de FRASE ──────────────────────────────────────────────────────────
_VERBO_DE_ACHADO = re.compile(r"separa|prediz|preditor|preditiv|prev[êe]|distingu|diferencia|destoa|discrimina|"
                              r"\bexplica|acima da linha|sobreviv|associad|correlacion|significativ|afasta|lidera|"
                              r"maior gap|melhor indicador", re.I)
# Contexto de retirada só vale AMARRADO à coluna: sem vírgula, ponto e vírgula ou travessão entre os
# dois. "Sem risco circular aqui, o GP separa alta de baixa" é um achado do GP com uma palavra de regra
# solta no começo; "retiradas por serem pedaço: o SG separa por definição" é a retirada do SG.
_QUEBRA_DE_ORACAO = re.compile(r"[,;—–]")
# Sujeito DEPOIS do verbo, a forma natural de uma conclusão em português: "o que mais separa as faixas
# são os gols marcados", "quem separa a alta da baixa é o aproveitamento do 1º turno". O verbo precisa
# estar numa oração relativa (que/quem) e a coluna vir depois de um verbo de ligação.
_RELATIVA_ANTES_DO_VERBO = re.compile(r"\b(?:que|quem)\s+(?:(?:mais|melhor|menos|realmente)\s+)?$", re.I)
_LIGACAO = re.compile(r"(?<!\w)(?:é|e|são|sao|foi|foram|seria|seriam|será|serão|sera|serao)(?!\w)", re.I)
_NEGACAO_ANTES = re.compile(r"(?:n[ãa]o|nunca|nem)\s+(?:\w+\s+)?$", re.I)
_CONTEXTO_DE_RETIRADA = re.compile(r"n[ãa]o (separa|prediz|distingu|entra|[ée] achado|conta)|retirad|"
                                   r"fora d[eoa]s? (teste|tabela|lista|m[ée]dia)|circular|lista de resultado|"
                                   r"peda[çc]o|redescri|exclu[íi]d|defini[çc][ãa]o da faixa", re.I)
_CONTEXTO_DE_CONSEQUENCIA = re.compile(r"consequ[êe]ncia", re.I)
# Régua e sinônimos por extenso: FRACOS — só contam como SUJEITO de um verbo de achado (antes dele).
# "o 1º turno prevê os pontos" usa os pontos como desfecho; "os pontos do 1º turno separam a alta"
# apresenta os pontos como achado.
# Rodada 4: gol/golo no singular, "clean sheets", "saldo" sozinho e V/E/D maiúsculos soltos. Os pontos e o
# aproveitamento ao lado de "corte" ("os pontos de corte", "o corte de aproveitamento de 53,5%") são a
# régua explicada, não um achado, e não entram. V/E/D só contam numa enumeração ("V e E", "V, E") ou logo
# antes de um verbo de achado: "E o xG separa" começa a frase com a conjunção, e a porta D do catálogo
# ("a porta D separa...") é um rótulo.
_VED_SOLTO = r"(?<![\w])(?<!porta )(?<!lado )(?<!eixo )(?<!grupo )(?<!tipo )%s(?![\w])" \
             r"(?=\s*(?:[,/+]|e\s|x\s|$)|\s+(?:separ|predi|prev|distingu|diferenc|destoa|explica|discrimin))"
_SINONIMOS = ((re.compile(r"(?<!\w)saldo de gols(?!\w)", re.I), "SG"),
              (re.compile(r"(?<!\w)(?:gols?|golos?) marcados?(?!\w)", re.I), "GP"),
              (re.compile(r"(?<!\w)(?:gols?|golos?) sofridos?(?!\w)", re.I), "GC"),
              (re.compile(r"(?<!\w)(?:gols?|golos?)(?! (?:esperad|expect|sofrid))(?!\w)", re.I), "GP"),
              (re.compile(r"(?<!\w)clean[ _-]?sheets?(?!\w)", re.I), "clean_sheets"),
              (re.compile(r"(?<!\w)saldo(?!\w)", re.I), "SG"),
              (re.compile(r"(?<!\w)vit[óo]rias(?!\w)", re.I), "V"),
              (re.compile(r"(?<!\w)derrotas(?!\w)", re.I), "D"),
              (re.compile(r"(?<!\w)empates(?!\w)", re.I), "E"),
              (re.compile(_VED_SOLTO % "V"), "V"),
              (re.compile(_VED_SOLTO % "E"), "E"),
              (re.compile(_VED_SOLTO % "D"), "D"),
              (re.compile(r"(?<!\w)pts(?!\w)", re.I), "pts"),
              (re.compile(r"(?<!\w)(?<!corte de )pontos(?! de corte)(?!\w)", re.I), "pts"),
              (re.compile(r"(?<!\w)(?<!corte de )aproveitamento(?! de corte)(?!\w)", re.I), "aproveitamento"))
# Sinônimos por extenso das colunas de CONSEQUÊNCIA: fracos, como os de cima.
_SINONIMOS_CONSEQUENCIA = ((re.compile(r"(?<!\w)atletas usados(?!\w)", re.I), "atletas_usados"),)


def _e_campo_de_teste(k):
    return isinstance(k, str) and (k in CAMPOS_DE_TESTE or k.startswith(PREFIXOS_DE_TESTE))


def _tem_estatistica(registro):
    return isinstance(registro, dict) and any(_e_campo_de_teste(k) for k in registro)


def _contem_estatistica(x):
    """Campo de teste no registro OU em qualquer descendente (`resultado_do_teste: {gap, q}`)."""
    if isinstance(x, dict):
        return _tem_estatistica(x) or any(_contem_estatistica(v) for v in x.values())
    if isinstance(x, list):
        return any(_contem_estatistica(v) for v in x)
    return False


def _e_campo_de_regra(k):
    return isinstance(k, str) and (k in CAMPOS_DE_REGRA or k.startswith(PREFIXOS_DE_REGRA))


def _tem_numero(v, texto=False):
    """Número (ou booleano) em qualquer profundidade; com `texto`, também número decimal escrito."""
    if isinstance(v, bool) or isinstance(v, (int, float)):
        return True
    if texto and isinstance(v, str):
        return bool(_NUMERO_DECIMAL.search(v))
    if isinstance(v, dict):
        return any(_tem_numero(x, texto) for x in v.values())
    if isinstance(v, list):
        return any(_tem_numero(x, texto) for x in v)
    return False


def _numero_fora_da_identidade(reg):
    return isinstance(reg, dict) and any(_tem_numero(v) for k, v in reg.items() if k not in CAMPOS_DE_ROTULO)


def _textos(x):
    """Todas as strings de um registro, em qualquer profundidade (as marcas não entram)."""
    if isinstance(x, str):
        yield x
    elif isinstance(x, dict):
        for k, v in x.items():
            if k not in (MARCA_RETIRADA, MARCA_SEM_TESTE, MARCA_CONSEQUENCIA, MARCA_REFERENCIA):
                yield from _textos(v)
    elif isinstance(x, list):
        for v in x:
            yield from _textos(v)


def _coluna_do_registro(reg):
    """A coluna de resultado que o registro nomeia no campo de identidade, ou None."""
    return next((reg[c] for c in CAMPOS_DE_IDENTIDADE if isinstance(reg.get(c), str) and motivo_resultado(reg[c])),
                None)


def _registro_apresenta(reg):
    """O registro apresenta estatística: campo de teste em qualquer profundidade, ou — se traz a
    marca de retirada — qualquer número (ou decimal escrito como texto) fora do rótulo, ou uma frase
    de achado em qualquer texto dele. A marca não pode servir de capa para número nenhum, com o nome
    que o campo tiver.

    Rodada 4: até aqui o `motivo` e as strings de rótulo (`nome`, `col`...) ficavam de fora sem
    condição, então `nome="gap 44,3 · q 0,001"` passava; e uma nota "é o que mais separa alta de baixa"
    não era acusada porque não repete o nome da coluna — e não precisa, o registro já é dela. Agora:
    (a) o `motivo` só é pulado se for EXATAMENTE o motivo da lista para a coluna do registro; senão os
    decimais dele contam; (b) string de rótulo com decimal conta, salvo a própria coluna; (c) frase
    de achado em qualquer texto do registro conta, fora os textos de motivo da própria lista (três
    registros reais repetem "saldo de gols explica quase toda a variância de pontos", que é a lista)."""
    if not isinstance(reg, dict):
        return False
    if _contem_estatistica(reg):
        return True
    if MARCA_RETIRADA in reg:
        col = _coluna_do_registro(reg)
        for k, v in reg.items():
            if k in (MARCA_RETIRADA, MARCA_SEM_TESTE, MARCA_CONSEQUENCIA) or v is None:
                continue
            if k == "motivo" and col is not None and v == motivo_resultado(col):
                continue
            if k in CAMPOS_DE_ROTULO and isinstance(v, str) and motivo_resultado(v):
                continue
            if _tem_numero(v, texto=True):
                return True
        motivos = _motivos_da_lista()
        if any(_frase_de_achado(f) for s in _textos(reg) if s not in motivos for f in _frases(s)):
            return True
    return False


def _numero_por_faixa(x, col):
    """Num registro "sem teste de faixa": algum número rotulado por faixa, em qualquer profundidade.

    Rodada 4: a marca "sem teste" isentava um registro que trouxesse `valor_na_alta=3.1,
    valor_na_baixa=1.2`, `{golos_cabeca: {alta: 3.1, baixa: 1.2}}` ou "alta 3,1 x baixa 1,2" — que É o
    teste de faixa, só sem o p. Conta: número sob chave com pedaço de faixa; dicionário ou lista com
    número sob a chave da própria coluna; texto com nome de faixa colado a um número. Não conta
    qualquer número (a regra ampla acusaria os dois registros reais, que trazem contagens de partição
    e percentis de candidatos dentro da própria liga, sem faixa nenhuma)."""
    if isinstance(x, dict):
        for k, v in x.items():
            if k in (MARCA_RETIRADA, MARCA_SEM_TESTE, MARCA_CONSEQUENCIA, MARCA_REFERENCIA):
                continue
            toks = {t.casefold() for t in _SEPARADORES.split(k) if t} if isinstance(k, str) else set()
            if toks & _TOKENS_DE_FAIXA and _tem_numero(v, texto=True):
                return True
            if (k == col or col in _coluna_da_chave(k)) and isinstance(v, (dict, list)) and _tem_numero(v, texto=True):
                return True
            if _numero_por_faixa(v, col):
                return True
        return False
    if isinstance(x, list):
        return any(_numero_por_faixa(v, col) for v in x)
    if isinstance(x, str):
        return bool(_FAIXA_COM_NUMERO.search(x))
    return False


_FAIXA_COM_NUMERO = re.compile(r"(?<!\w)(?:alta|m[ée]dia|baixa|sobe|meio|cai)(?!\w)\W{0,3}\d|"
                               r"\d(?:[.,]\d+)?\s+(?:n?[ao]s?\s+)?(?:alta|m[ée]dia|baixa|sobe|meio|cai)(?!\w)", re.I)


def _nomes_de_coluna(motivo):
    """Colunas que podem aparecer como PEDAÇO de chave. `resultado` entra desde a rodada 4, como ambígua
    (só conta com estatística na chave ou no valor): `resultado_gap` e `d_resultado` passavam."""
    if motivo is motivo_consequencia:
        return frozenset(CONSEQUENCIA)
    return frozenset(RESULTADO) | frozenset(DERIVADO_DE_GOLS) | frozenset(PLACAR_JOGO)


def _normaliza_nome(c):
    return c.replace(" ", "_").casefold()


def _indices_de_nome(nomes):
    """(exato, sem maiúsculas, sem separador) para achar a coluna num pedaço de chave.

    Sem diferença de maiúsculas só para nomes com 2 letras ou mais: `sg_gap` é o SG, mas `d` é o
    pedaço estatístico e `D` a coluna. `Golos` fica só exato: `golos` minúsculo é o começo de
    `golos_esperados` e de `ti_ataque_golos_esperados_90`. Sem separador (`share11` = `share_11`)
    pelo mesmo motivo de caixa: é como um script escreveria a chave."""
    exato = set(nomes)
    ci = {_normaliza_nome(c): c for c in sorted(nomes) if len(c) >= 2 and c != "Golos"}
    sem_sep = {_normaliza_nome(c).replace("_", ""): c for c in sorted(nomes) if len(c) >= 3 and c != "Golos"}
    return exato, ci, sem_sep


def _coluna_da_chave(k, motivo=None, valor=None, registro=None):
    """As colunas que uma CHAVE nomeia, lidas por token (ver o bloco acima).

    Chave inteira que é coluna → ela. Senão, parte-se em `_`, espaço, hífen, barra, parênteses e % e
    procura-se, da esquerda para a direita, o maior trecho de pedaços vizinhos que seja coluna da lista
    (exata, sem diferença de maiúsculas para nomes de 2+ letras, ou sem o separador), ou um pedaço que
    case os padrões `esp[A-Z]`/`p[A-Z]`.

    Coluna AMBÍGUA como pedaço (a régua, V/E/D, `resultado`, `novos`) só conta com ESTATÍSTICA — um
    pedaço estatístico na chave, fora das colunas achadas, OU campo de teste no VALOR (`valor`).
    Rodada 4: até aqui só a chave decidia, e `{"V_x_faixa": {"rho": 0.95, "p": 1e-9}}` e
    `{"aproveitamento_1t": {"gap": 30, "q": 0.001}}` passavam — bastava pôr o teste no valor. Além disso:
    - a exceção da palavra de relação (`rho_com_aproveitamento`: a régua como DESFECHO de uma medida,
      que é o próprio estudo) vale só para a RÉGUA; `gap_x_V` e `gap_x_novos` contam;
    - V/E/D ao lado de um nome de faixa com número no valor contam (`V_alta: 20`): é a coluna por faixa;
    - V/E/D ao lado do nome de uma estatística ou de um eixo (`p_cramer_V`, `rho_D_explosao`) não contam.

    `registro` (fechamento, 14/09): quando `k` não é chave, é o VALOR de um campo de identidade
    (`"indicador": "aproveitamento_1t"`), `registro` é a linha que o contém. A estatística dessa linha
    decide a ambígua — mas só quando a ambígua é o PRIMEIRO pedaço, que é o que o nome descreve.
    `"indicador": "atq_pos_remates"` numa linha com p e q é a posse (o `pos` no meio de um id real),
    e continua não contando; `"V_casa"`, `"Pts/J"`, `"resultado_final"` com gap passam a contar.
    """
    consequencia = motivo is motivo_consequencia
    motivo = motivo or motivo_resultado
    if not isinstance(k, str):
        return []
    if motivo(k):
        # palavra comum como chave inteira (`"resultado": false` no catálogo, a lista `resultado` das
        # listas declaradas) só é a coluna quando quem chama olha o valor — ver `referencias_circulares`
        return [k]
    toks = [t for t in _SEPARADORES.split(k) if t]
    if not toks:
        return []
    exato, ci, sem_sep = _indices_de_nome(_nomes_de_coluna(motivo))
    achadas, dentro, i = [], set(), 0
    while i < len(toks):
        fim, nome = None, None
        for j in range(len(toks), i, -1):
            s = "_".join(toks[i:j])
            if s == k:
                continue
            if s in exato:
                nome = s
            elif s.casefold() in ci:
                nome = ci[s.casefold()]
            elif j == i + 1 and s.casefold() in sem_sep:
                nome = sem_sep[s.casefold()]
            elif not consequencia and j == i + 1 and any(p.search(s) for p, _ in PADROES_RESULTADO):
                nome = s
            if nome is not None:
                fim = j
                break
        if fim is None:
            i += 1
            continue
        # `Golos` seguido de `esperados`/`expectáveis` é xG (processo), não o placar individual
        if nome == "Golos" and fim < len(toks):
            seg = toks[fim].casefold()
            defendidos = fim + 1 < len(toks) and toks[fim + 1].casefold().startswith("defendid")
            if seg.startswith("esperad") or (seg.startswith("expect") and not defendidos):
                i = fim
                continue
        achadas.append((i, fim, nome))
        dentro.update(range(i, fim))
        i = fim
    if not achadas:
        return []
    fora = [t for n, t in enumerate(toks) if n not in dentro]
    estatistico_na_chave = any(t in _TOKENS_ESTATISTICOS or (len(t) > 1 and t.casefold() in _TOKENS_ESTATISTICOS)
                               for t in fora)
    # o valor só é olhado se houver coluna ambígua para decidir (o JSON inteiro passa por aqui)
    ambiguas = _CONSEQUENCIA_PALAVRA if consequencia else AMBIGUAS
    memo = {}

    def estatistica_no_valor():
        if "v" not in memo:
            memo["v"] = _contem_estatistica(valor)
        return memo["v"]

    out = []
    for i, fim, s in achadas:
        if s in ambiguas:
            antes = toks[i - 1].casefold() if i > 0 else None
            depois = toks[fim].casefold() if fim < len(toks) else None
            # a linha que carrega o valor só decide a ambígua do começo do nome (ver a docstring)
            do_registro = i == 0 and registro is not None and _contem_estatistica(registro)
            estatistico = estatistico_na_chave or do_registro or estatistica_no_valor()
            if s in REGUA:
                if not estatistico or antes in _TOKENS_DE_RELACAO:
                    continue
            elif s in ("V", "E", "D"):
                if antes in _VIZINHOS_QUE_NAO_SAO_VED or depois in _VIZINHOS_QUE_NAO_SAO_VED:
                    continue
                por_faixa = (antes in _TOKENS_DE_FAIXA or depois in _TOKENS_DE_FAIXA) and _tem_numero(valor)
                if not (estatistico or por_faixa):
                    continue
            elif s in PALAVRAS_COMUNS:
                # `resultado` só com pedaço estatístico NA CHAVE (`resultado_gap`, `d_resultado`): no valor
                # não basta, porque `resultado_do_teste: {gap, q}` é a palavra comum ("o resultado do teste")
                if not (estatistico_na_chave or do_registro):
                    continue
            elif not estatistico:
                continue
        out.append(s)
    return list(dict.fromkeys(out))


def _frases(s):
    """Frases por pontuação final. Rodada 4: o travessão NÃO corta mais — "Gols marcados — o indicador
    que mais separa as faixas" é uma frase só, com o sujeito antes do travessão. Ele continua quebrando
    o laço entre contexto de retirada e coluna (`_QUEBRA_DE_ORACAO`)."""
    return [f for f in re.split(r"(?<=[.;!?])\s+", s) if f]


def _verbos(f):
    """Posições dos verbos de achado que NÃO estão negados ("não separam" não é achado)."""
    return [m.start() for m in _VERBO_DE_ACHADO.finditer(f) if not _NEGACAO_ANTES.search(f[:m.start()])]


def _amarrado(f, a, b):
    """Nada que quebre a oração entre as posições a e b."""
    return not _QUEBRA_DE_ORACAO.search(f[min(a, b):max(a, b)])


def _contexto_amarrado(f, pos, ctx, vs):
    """Um contexto de retirada preso à coluna em `pos`: antes dela na mesma oração, ou entre ela e o
    verbo seguinte na mesma oração ("o SG foi retirado porque separa por definição")."""
    seguinte = min((v for v in vs if v > pos), default=len(f))
    return any((m.end() <= pos and _amarrado(f, m.end(), pos))
               or (pos < m.start() < seguinte and _amarrado(f, pos, m.start())) for m in ctx)


def _frase_de_achado(f):
    """Frase com verbo de achado cujo verbo não está preso a um contexto de retirada."""
    vs = _verbos(f)
    if not vs:
        return False
    ctx = list(_CONTEXTO_DE_RETIRADA.finditer(f))
    return not any(m.end() <= v and _amarrado(f, m.end(), v) for m in ctx for v in vs[:1])


def _sujeito_posposto(f, pos, vs):
    """A coluna em `pos` é o sujeito depois do verbo: "o que mais separa as faixas são os gols"."""
    for v in vs:
        if v < pos and _RELATIVA_ANTES_DO_VERBO.search(f[:v]) and _LIGACAO.search(f, v, pos):
            return True
    return False


def _conta_na_frase(f, pos, forte, regra, contexto=_CONTEXTO_DE_RETIRADA):
    """(conta, de_achado) para uma coluna citada na posição `pos` da frase `f`.

    - FORTE fora de campo de regra: conta sempre.
    - FORTE em campo de regra: com verbo de achado, conta se não houver contexto de retirada PRESO à
      coluna ("o SG, pedaço do placar, separa" conta; "retiradas por serem pedaço: o SG separa por
      definição" não; "Sem risco circular aqui, o GP separa" conta — rodada 4: antes, qualquer palavra
      de regra em qualquer ponto antes da coluna desligava a guarda); sem verbo, conta se a frase não
      disser em lugar nenhum que ela foi retirada ("o GP é o indicador que mais afasta" conta;
      "golos_cabeca e clean_sheets retirados" não).
    - FRACA (régua, sinônimo, sg/gp/gc minúsculos): como sujeito de verbo de achado — antes do verbo,
      ou depois dele numa relativa com verbo de ligação ("o que mais separa ... são os gols") — sem
      contexto de retirada preso.
    `de_achado` diz se a contagem veio de uma frase de achado: é o que o registro "sem teste" e a marca
    de consequência num ancestral não isentam.
    """
    vs = _verbos(f)
    ctx = list(contexto.finditer(f))
    preso = _contexto_amarrado(f, pos, ctx, vs)
    achado = bool(vs) and not preso
    if forte:
        if not regra:
            return True, achado
        if vs:
            return achado, achado
        return not ctx, False
    ok = (any(v > pos for v in vs) or _sujeito_posposto(f, pos, vs)) and not preso
    return ok, ok


_TOKEN_TEXTO = None
_TOKEN_TEXTO_CI = None
_MOTIVOS_DA_LISTA = None


def _motivos_da_lista():
    global _MOTIVOS_DA_LISTA
    if _MOTIVOS_DA_LISTA is None:
        _MOTIVOS_DA_LISTA = frozenset(set(RESULTADO.values()) | set(DERIVADO_DE_GOLS.values())
                                      | {m for _, m in PADROES_RESULTADO} | {"placar individual", MOTIVO_PLACAR_JOGO})
    return _MOTIVOS_DA_LISTA


def _mencoes_em_texto(s, campo_de_regra):
    """Colunas de resultado citadas num texto, como lista de (coluna, de_achado), sem repetir por frase.

    Forte = a coluna escrita como na lista, ou sem diferença de maiúsculas se tiver mais de 2 letras.
    Fraca = `sg`/`gp`/`gc` minúsculos, a régua e os sinônimos por extenso (gols, golos, pontos,
    saldo de gols...). A regra de cada uma está em `_conta_na_frase`. O próprio texto de motivo da
    lista nunca conta: ele É a lista.
    """
    global _TOKEN_TEXTO, _TOKEN_TEXTO_CI
    if _TOKEN_TEXTO is None:
        nomes = sorted((c for c in list(RESULTADO) + list(DERIVADO_DE_GOLS) + sorted(PLACAR_JOGO)
                        if c not in AMBIGUAS and " " not in c and c != "Golos"), key=len, reverse=True)
        nomes = list(dict.fromkeys(nomes))
        _TOKEN_TEXTO = re.compile(r"(?<![\w])(" + "|".join(re.escape(c) for c in nomes) + r")(?![\w])")
        _TOKEN_TEXTO_CI = re.compile(r"(?<![\w])(" + "|".join(re.escape(c) for c in nomes) + r")(?![\w])", re.I)
    if s in _motivos_da_lista():
        return []
    canon = {c.casefold(): c for c in list(RESULTADO) + list(DERIVADO_DE_GOLS) + sorted(PLACAR_JOGO)}
    achados = []
    for f in _frases(s):
        mencoes = {}                                   # coluna -> (posição, forte)
        for m in _TOKEN_TEXTO.finditer(f):
            mencoes.setdefault(m.group(1), (m.start(), True))
        for m in re.finditer(r"(?<![\w])((?:esp|p)[A-Z]\w*)", f):
            if motivo_resultado(m.group(1)):
                mencoes.setdefault(m.group(1), (m.start(), True))
        for m in _TOKEN_TEXTO_CI.finditer(f):
            c = canon[m.group(1).casefold()]
            mencoes.setdefault(c, (m.start(), len(c) > 2))
        cobertos = []                                  # "saldo de gols" não é também "gols"
        for padrao, c in _SINONIMOS:
            for m in padrao.finditer(f):
                if any(a <= m.start() < b for a, b in cobertos):
                    continue
                cobertos.append(m.span())
                mencoes.setdefault(c, (m.start(), False))
        for c in sorted(mencoes):
            pos, forte = mencoes[c]
            conta, de_achado = _conta_na_frase(f, pos, forte, campo_de_regra)
            if conta:
                achados.append((c, de_achado))
    return achados


def _retirada_declarada(registro, col, chave):
    """`col` está no campo de identidade `chave` do registro, com a marca e o motivo DELA."""
    return (isinstance(registro, dict) and chave in CAMPOS_DE_IDENTIDADE and registro.get(chave) == col
            and registro.get(MARCA_RETIRADA) == motivo_resultado(col))


def _sem_teste_declarado(registro, col):
    sem = registro.get(MARCA_SEM_TESTE) if isinstance(registro, dict) else None
    return (isinstance(sem, dict) and isinstance(sem.get(col), dict)
            and sem[col].get("motivo") == motivo_resultado(col) and bool(sem[col].get("por_que")))


def _referencia_declarada(valor, cols):
    """O valor de uma chave `<col>_x_<col>` declara, coluna por coluna, que é referência entre
    resultados. Par com coluna da RÉGUA (ou ambígua) é recusado: resultado contra régua é o achado
    circular, nunca referência."""
    ref = valor.get(MARCA_REFERENCIA) if isinstance(valor, dict) else None
    return (isinstance(ref, dict) and bool(ref.get("por_que")) and len(cols) >= 2
            and not any(c in AMBIGUAS for c in cols)
            and isinstance(ref.get("colunas"), dict) and not any(c in AMBIGUAS for c in ref["colunas"])
            and all(ref["colunas"].get(c) == motivo_resultado(c) for c in cols)
            and set(ref["colunas"]) == set(cols))


def _escalar(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def _referencia_valida(chave, valor, cols):
    """A isenção de referência entre resultados, com as recusas da rodada 4.

    A marca foi feita para UMA estatística ENTRE colunas de resultado. Se o registro reparte essa
    estatística por faixa (`referencia_SG_x_GP_por_faixa` com `rho: {alta, media, baixa}`) ou esconde
    teste dentro de `n` (`n: {gap, q}`), ele deixa de ser referência e vira achado sobre a faixa. Por isso:
    chave com pedaço de faixa → recusa; `rho` ou `p` que não sejam escalares → recusa; `n` que não seja
    inteiro → recusa; e a checagem de estatística só tira do registro os rho/p/n ESCALARES.
    """
    if len(cols) < 2 or not _referencia_declarada(valor, cols):
        return False
    toks = {t.casefold() for t in _SEPARADORES.split(chave) if t}
    if toks & _TOKENS_DE_FAIXA:
        return False
    if any(c in valor and not _escalar(valor[c]) for c in ("rho", "p")):
        return False
    if "n" in valor and not (isinstance(valor["n"], int) and not isinstance(valor["n"], bool)):
        return False
    resto = {kk: vv for kk, vv in valor.items() if not (kk in ("rho", "p", "n") and _escalar(vv))}
    if _contem_estatistica(resto):
        return False
    # Fechamento (14/09): a chave era a única coisa conferida por pedaço de faixa, e o resto só por nome de
    # campo de teste. `por_clube={alta: 0.9, baixa: 0.1}`, `correlacao_alta=0.95`, `diferenca_entre_faixas=44`
    # e `desfecho="faixa"` passavam com a marca certa. Agora nenhum DESCENDENTE pode partir por faixa.
    return not _parte_por_faixa(resto)


def _parte_por_faixa(x):
    """Algum descendente parte por faixa: subchave ou nome de campo com pedaço de faixa, valor que é
    rótulo de faixa (`"faixa"`, `"alta"`, `"media_x"`), ou texto com nome de faixa colado a número.
    A marca de referência não é olhada: o `por_que` dela é prosa e pode dizer "faixa" para negar."""
    if isinstance(x, dict):
        for k, v in x.items():
            if k in (MARCA_RETIRADA, MARCA_SEM_TESTE, MARCA_CONSEQUENCIA, MARCA_REFERENCIA):
                continue
            if isinstance(k, str) and {t.casefold() for t in _SEPARADORES.split(k) if t} & _TOKENS_DE_FAIXA:
                return True
            if _parte_por_faixa(v):
                return True
        return False
    if isinstance(x, list):
        return any(_parte_por_faixa(v) for v in x)
    if isinstance(x, str):
        if " " not in x:
            return bool({t.casefold() for t in _SEPARADORES.split(x) if t} & _TOKENS_DE_FAIXA)
        return bool(_FAIXA_COM_NUMERO.search(x))
    return False


_PONTUACAO_DE_FRASE = re.compile(r"[.;:!?,]")


def _e_nome(x):
    """Um NOME de coluna, não uma frase: sem espaço, ou até três palavras sem pontuação de frase
    ("Golos sofridos", "Golos sofridos/90", "GP por jogo"). Nome mais longo ("Golos sofridos por jogo
    em casa") só é lido como frase — é um dos limites declarados no cabeçalho."""
    return " " not in x or (len(x.split()) <= 3 and not _PONTUACAO_DE_FRASE.search(x))


def referencias_circulares(obj, colunas_conhecidas=(), blocos_de_exposicao=(), zonas_da_regua=()):
    """Toda referência a coluna de resultado apresentada como achado, como (caminho, coluna).

    - `blocos_de_exposicao`: regex de caminho (ex.: `^\\.etapa_10\\.linhas\\[\\d+\\]$`) de
      registros que PODEM trazer estatística de coluna de resultado porque a função deles é
      avisar; passam só se o registro tiver a marca amarrada à coluna e `tipo == "resultado"`.
    - `zonas_da_regua`: regex de caminho onde colunas da RÉGUA (pts, pos, faixa...) podem ser
      chave de dicionário, porque ali se define a régua (o bloco `faixas`).
    `colunas_conhecidas` fica na assinatura por compatibilidade; a regra não depende dela.
    """
    expo = [re.compile(p) for p in blocos_de_exposicao]
    zonas = [re.compile(p) for p in zonas_da_regua]
    achados = []

    def estatistica_proibida(reg, cam):
        if not _registro_apresenta(reg):
            return False
        return not (any(p.search(cam) for p in expo) and reg.get("tipo") == "resultado")

    def visita(x, cam, pai, chave_no_pai, cam_pai):
        if isinstance(x, dict):
            linha = any(k in x for k in ("clube", "ano", "Equipa", "Jogador"))
            for k, v in x.items():
                if k in (MARCA_RETIRADA, MARCA_SEM_TESTE, MARCA_CONSEQUENCIA, MARCA_REFERENCIA):
                    continue
                cols = _coluna_da_chave(k, valor=v)
                if k in PALAVRAS_COMUNS and not _contem_estatistica(v):
                    cols = []
                if cols and not _referencia_valida(k, v, cols):
                    for c in cols:
                        direta = c == k
                        # régua como rótulo: numa LINHA (clube/ano) só se a linha não traz
                        # estatística em profundidade nenhuma; numa ZONA da régua (o bloco que
                        # a define) só se o próprio registro não traz campo de teste
                        ok = (direta and c in REGUA
                              and ((linha and not _contem_estatistica(x))
                                   or (any(p.search(cam) for p in zonas) and not _tem_estatistica(x)))) \
                            or (direta and _sem_teste_declarado(x, c) and not _tem_estatistica(x)
                                and not _contem_estatistica(v) and not _numero_por_faixa(x, c))
                        if not ok:
                            achados.append((f"{cam}.{k} (chave)", c))
                visita(v, f"{cam}.{k}", x, k, cam)
        elif isinstance(x, list):
            for i, y in enumerate(x):
                visita(y, f"{cam}[{i}]", pai, chave_no_pai, cam_pai)
        elif isinstance(x, str):
            direto = isinstance(pai, dict) and pai.get(chave_no_pai) is x
            identidade = direto and chave_no_pai in CAMPOS_DE_IDENTIDADE
            em_lista = isinstance(pai, dict) and not direto and isinstance(pai.get(chave_no_pai), list)
            # Fechamento (14/09): o VALOR é lido como a CHAVE. Até aqui toda string com espaço ia direto para a
            # leitura de frase, onde nome com espaço não é buscado: `"indicador": "Golos sofridos"` com gap — o
            # nome exato de uma coluna de PLACAR_JOGO — dava 0, e `"Golos sofridos/90"` e `"golos pro"` também.
            # Agora um NOME curto (ver `_e_nome`) passa pela lista inteira e pela leitura por pedaço. O nome com
            # espaço só é lido assim onde um nome de coluna mora — campo de identidade ou item de lista —, e nunca
            # o texto de motivo da própria lista: lido em qualquer campo, "pedaço de GP" (três palavras, motivo de
            # golos_cabeca) virava 13 achados falsos no JSON real. Fora disso a frase continua lida como frase.
            if " " not in x or ((identidade or em_lista) and _e_nome(x) and x not in _motivos_da_lista()):
                col = x if motivo_resultado(x) else next(
                    (c for c in list(RESULTADO) + list(DERIVADO_DE_GOLS)
                     if len(c) > 1 and c not in AMBIGUAS and c.casefold() == x.casefold()), None)
                # Rodada 4: valor composto ("SG/J", "GP-GC", "golos_pro/90") é lido pelos mesmos pedaços da
                # chave; um pedaço que seja coluna conta como se a coluna estivesse no campo. As ambíguas
                # como pedaço seguem a regra da chave, com a estatística procurada no registro.
                # Duas exceções medidas no JSON real: (1) string com ponto é ENDEREÇO de caminho
                # (`etapa_7.referencia_ap1t_x_ap2t` no mapa da tela), não indicador; (2) a estatística que
                # decide a ambígua é a da PRÓPRIA string, não a do registro — uma linha de indicador sempre
                # tem p e q, e `atq_pos_remates` (posse) viraria a régua `pos`.
                # (3) no campo de identidade, a linha que carrega o valor decide a ambígua do começo do nome
                # (`"indicador": "aproveitamento_1t"` com gap); o `pos` de `atq_pos_remates` segue fora
                cols = [col] if col is not None else (
                    [] if "." in x else _coluna_da_chave(x, registro=pai if identidade else None))
                for col in cols:
                    inteiro = col == x or col.casefold() == x.casefold()
                    # "porta": "D", "campo": "pos", "tipo": "resultado" — rótulo solto, não coluna.
                    # Numa LISTA (de indicadores, de achados), no campo de identidade, ou como NOME de
                    # um registro que traz estatística ou número, a mesma palavra é coluna e conta.
                    if inteiro and col in AMBIGUAS and direto and chave_no_pai not in CAMPOS_DE_IDENTIDADE and not (
                            chave_no_pai in CAMPOS_DE_ROTULO
                            and (_contem_estatistica(pai) or _numero_fora_da_identidade(pai))):
                        continue
                    if (isinstance(pai, dict) and _sem_teste_declarado(pai, col) and not estatistica_proibida(pai, cam_pai)
                            and not _numero_por_faixa(pai, col)):
                        continue
                    if direto and _retirada_declarada(pai, col, chave_no_pai) and not estatistica_proibida(pai, cam_pai):
                        continue
                    achados.append((cam_pai, col, cam))
            if " " in x:
                for col, de_achado in _mencoes_em_texto(x, _e_campo_de_regra(chave_no_pai)):
                    # "sem teste" declarado isenta a CITAÇÃO, nunca a frase de achado
                    if not (isinstance(pai, dict) and _sem_teste_declarado(pai, col) and not de_achado
                            and not _numero_por_faixa(pai, col)):
                        achados.append((cam_pai, col, f"{cam} (texto)"))

    visita(obj, "", None, None, "")
    # Um achado por (registro, coluna): o mesmo registro citando a mesma coluna em dois campos
    # (`col` e `indicador`) é UMA apresentação, não duas.
    unicos = {}
    for a in achados:
        if len(a) == 2:
            unicos.setdefault((a[0], a[1]), a)
        else:
            unicos.setdefault((a[0], a[1]), (a[2], a[1]))
    return list(unicos.values())


def referencia_de_resultado(colunas, por_que):
    """{MARCA_REFERENCIA: ...} para um registro de estatística ENTRE colunas de resultado."""
    cols = {c: motivo_resultado(c) for c in colunas}
    assert all(cols.values()) and len(cols) >= 2, ("referência entre resultados com coluna fora da lista", cols)
    assert not any(c in AMBIGUAS for c in cols), ("coluna da régua não entra em referência entre resultados", cols)
    return {MARCA_REFERENCIA: dict(colunas=cols, por_que=por_que)}


def _consequencia_declarada(reg, col, chave):
    mc = motivo_consequencia(col)
    if not isinstance(reg, dict):
        return False
    if chave in CAMPOS_DE_IDENTIDADE and reg.get(chave) == col and (
            (reg.get("consequencia_do_resultado") is True and reg.get("motivo_consequencia") == mc)
            or reg.get("motivo") == mc):
        return True
    return False


def _marcada_em(ancestrais, col):
    mc = motivo_consequencia(col)
    return any(isinstance(a, dict) and isinstance(a.get(MARCA_CONSEQUENCIA), dict)
               and a[MARCA_CONSEQUENCIA].get(col) == mc for a in ancestrais)


def marca_consequencia(cols):
    """{MARCA_CONSEQUENCIA: {coluna: motivo}} para as colunas de consequência em `cols`."""
    m = {c: motivo_consequencia(c) for c in dict.fromkeys(cols) if motivo_consequencia(c)}
    return {MARCA_CONSEQUENCIA: m} if m else {}


# Consequência que é também palavra comum em português: em chave só com pedaço estatístico, em
# texto só como sujeito de verbo de achado.
_CONSEQUENCIA_PALAVRA = frozenset({"novos"})
_TOKEN_CONSEQUENCIA = re.compile(r"(?<![\w])(" + "|".join(re.escape(c) for c in sorted(CONSEQUENCIA, key=len,
                                                                                       reverse=True))
                                 + r")(?![\w])", re.I)
_CONTEXTO_CONSEQUENCIA_OU_RETIRADA = re.compile(_CONTEXTO_DE_RETIRADA.pattern + "|" + _CONTEXTO_DE_CONSEQUENCIA.pattern,
                                                re.I)


def referencias_de_consequencia_sem_marca(obj):
    """Toda coluna de CONSEQUÊNCIA que aparece sem a marca, como (caminho, coluna).

    Aparece = valor igual à coluna; chave igual à coluna ou que a contém como token
    (`share_11_alta`, `share_11_gap`, `d_nucleo_300` — a mesma leitura por token da guarda de
    resultado); ou a coluna citada em texto, com a mesma regra de frase (`_conta_na_frase`), em que
    "consequência" também conta como contexto que explica. Marcada = o registro nomeia a coluna no
    campo de identidade com o motivo dela; ou o valor de uma chave-coluna é um registro com
    `consequencia_do_resultado` e o motivo; ou um registro ACIMA traz `marca_consequencia` nomeando
    a coluna com o motivo.
    """
    achados = []
    canon = {c.casefold(): c for c in CONSEQUENCIA}

    # Fechamento (14/09): a marca num ANCESTRAL isentava chave e valor com estatística — `share_11_gap` e a linha
    # `{indicador: share_11, gap}` postas sob a marca da raiz passavam. Regra agora, a mesma divisão do texto:
    # - sem estatística (citação, lista de ids, dispersão crua): marca em qualquer ancestral isenta;
    # - com estatística: a marca tem de estar no PRÓPRIO registro ou no registro que o contém diretamente (o
    #   DONO da lista ou do dicionário: `etapa_9.reguas[8]` marca as linhas de `itens_crus`, `etapa_6` marca
    #   `rho.share_11`). Dois níveis acima já não é declaração daquela linha;
    # - chave COMPOSTA com pedaço estatístico (`share_11_gap`, `q_share_11`): só a marca do próprio registro.
    def chave_estatistica(k):
        return isinstance(k, str) and (k.startswith(PREFIXOS_DE_TESTE) or any(
            t.casefold() in _TOKENS_ESTATISTICOS for t in _SEPARADORES.split(k) if t))

    def isenta(anc_ate_o_registro, c, com_estatistica, so_proprio=False):
        if so_proprio:
            return _marcada_em(anc_ate_o_registro[-1:], c)
        return _marcada_em(anc_ate_o_registro[-2:] if com_estatistica else anc_ate_o_registro, c)

    def visita(x, cam, ancestrais, chave_no_pai):
        pai = ancestrais[-1] if ancestrais else None
        if isinstance(x, dict):
            anc = ancestrais + [x]
            for k, v in x.items():
                if k == MARCA_CONSEQUENCIA:
                    continue
                for c in _coluna_da_chave(k, motivo=motivo_consequencia, valor=v):
                    declarada = (isinstance(v, dict) and v.get("consequencia_do_resultado") is True
                                 and v.get("motivo_consequencia") == motivo_consequencia(c))
                    composta = k != c
                    ok = declarada or isenta(anc, c, _contem_estatistica(v) or _tem_estatistica(x),
                                             so_proprio=composta and chave_estatistica(k))
                    if not ok:
                        achados.append((f"{cam}.{k} (chave)", c))
                visita(v, f"{cam}.{k}", anc, k)
            return
        if isinstance(x, list):
            for i, y in enumerate(x):
                visita(y, f"{cam}[{i}]", ancestrais, chave_no_pai)
            return
        if not isinstance(x, str):
            return
        # o VALOR lido como a chave: `share_11/90`, `conc_hhi_minutos`, `share 11` (nome curto), não só a coluna exata
        if motivo_consequencia(x):
            nomeadas = [x]
        elif "." not in x and (" " not in x or (
                _e_nome(x) and isinstance(pai, dict) and (chave_no_pai in CAMPOS_DE_IDENTIDADE
                                                          or isinstance(pai.get(chave_no_pai), list))
                and x not in set(CONSEQUENCIA.values()))):
            # nome com espaço só onde mora um nome de coluna (identidade ou item de lista), como na guarda de resultado
            nomeadas = _coluna_da_chave(x, motivo=motivo_consequencia)
        else:
            nomeadas = []
        for c in nomeadas:
            if not ((x == c and _consequencia_declarada(pai, c, chave_no_pai))
                    or isenta(ancestrais, c, _contem_estatistica(pai))):
                achados.append((cam, c))
        if nomeadas:
            return
        if " " in x and x not in set(CONSEQUENCIA.values()):
            regra = _e_campo_de_regra(chave_no_pai)
            for f in _frases(x):
                vistos = {}                                   # coluna -> (posição, forte)
                for m in _TOKEN_CONSEQUENCIA.finditer(f):
                    c = canon[m.group(1).casefold()]
                    vistos.setdefault(c, (m.start(), c not in _CONSEQUENCIA_PALAVRA))
                for padrao, c in _SINONIMOS_CONSEQUENCIA:
                    for m in padrao.finditer(f):
                        vistos.setdefault(c, (m.start(), False))
                for c in sorted(vistos):
                    pos, forte = vistos[c]
                    conta, de_achado = _conta_na_frase(f, pos, forte, regra, contexto=_CONTEXTO_CONSEQUENCIA_OU_RETIRADA)
                    # Rodada 4: a marca no PRÓPRIO registro do texto isenta tudo (o registro declara as colunas
                    # dele); a marca num registro ACIMA isenta a citação, nunca a frase de achado. Antes, uma
                    # marca na raiz calava "share_11 é o melhor preditor da faixa: repita o XI" em qualquer etapa.
                    proprio = _marcada_em(ancestrais[-1:], c)
                    acima = _marcada_em(ancestrais[:-1], c)
                    if conta and not (proprio or (acima and not de_achado)):
                        achados.append((f"{cam} (texto)", c))

    visita(obj, "", [], None)
    return list(dict.fromkeys(achados))


def autoteste_da_guarda():
    """Prova que a guarda acusa pelo PAPEL do registro e não pelo nome da chave. Quebra se não.

    Os casos 11-24 são os vazamentos que a conferência de 13/09/2026 montou contra a versão
    anterior da guarda (todos davam 0 achados) e os falsos positivos que ela apontou; os casos
    marcados "r2" são os 22 da segunda conferência (chave composta, número com nome livre,
    estatística em sub-registro, campo de regra por prefixo, minúsculas, régua e sinônimo em
    frase de achado, linha de clube com estatística), todos 0 antes do conserto; os "r3" são os
    da terceira (chave lida por token sem lista de afixos, marca de referência cobrindo a régua,
    frase de achado sob "sem teste", número escrito como texto, placar do jogo a jogo, campo de
    regra sem verbo, gols/golos/pontos), mais os falsos positivos que a leitura por token criaria
    no pontos.json real se não tratasse palavra comum, rótulo de eixo e régua como desfecho.
    """
    gc = motivo_resultado("golos_cabeca")
    R = retirada
    expo = (r"^\.etapa_10\.linhas\[\d+\]$",)
    casos = [
        ("achado com a chave de sempre", {"linhas": [{"indicador": "SG", "gap": 30.0}]}, 1),
        ("achado com a chave RENOMEADA", {"x": [{"coluna_com_nome_inventado": "golos_cabeca"}]}, 1),
        ("retirada declarada com o motivo da lista", {"x": [retirada("golos_cabeca")]}, 0),
        ("marca com motivo que não é o da lista",
         {"x": [{"col": "golos_cabeca", MARCA_RETIRADA: "porque sim"}]}, 1),
        ("dicionário indexado por indicador", {"brutos": {"SG": 1.0, "xg": 2.0, "posse": 3.0}}, 1),
        ("rótulo de linha (pts/pos ao lado de clube e ano)",
         {"clubes": [{"clube": "X", "ano": 2023, "pts": 61, "pos": 5}]}, 0),
        ("rótulo de linha com J (identidade não conta como indicador)",
         {"sextos": [{"ano": 2023, "clube": "X", "pts": 61, "J": 38, "aproveitamento_pct": 53.5}]}, 0),
        ("uso sem teste de faixa, declarado com motivo e porquê",
         {"t": {"indicadores": ["xg", "golos_cabeca"],
                MARCA_SEM_TESTE: {"golos_cabeca": dict(motivo=gc, por_que="exemplo")}}}, 0),
        ("uso sem teste de faixa sem o porquê",
         {"t": {"indicadores": ["golos_cabeca"], MARCA_SEM_TESTE: {"golos_cabeca": dict(motivo=gc)}}}, 1),
        ("eixo em lista aninhada", {"eixos": {"t": [["SG", 1], ["xg", 1]]}}, 1),
        ("dicionário de 2 chaves", {"melhores": {"SG": 44, "xg": 10}}, 1),
        ("dicionário de 1 chave", {"top": {"GP": 44}}, 1),
        ("dicionário com chaves desconhecidas ao lado", {"b": {"SG": 1, "xg": 2, "foo": 3, "bar": 4, "posse": 5}}, 1),
        ("texto livre", {"leitura": "o SG separa as faixas"}, 1),
        ("linha de ranking com a marca certa colada", {"linhas": [dict(retirada("golos_cabeca"), indicador="golos_cabeca",
                                                                        gap=44, q=0.001, acima_da_linha_da_sorte=True)]}, 1),
        ("marca de GP com achado GC (mesmo motivo)", {"x": [dict(retirada("GP"), achado_principal="GC")]}, 1),
        ("marca de pts com lista pendurada", {"x": [dict(retirada("pts"), achados=["aproveitamento", "pts_oficial"])]}, 2),
        ("retirada de maxVitorias com outro=semVencer", {"x": [dict(retirada("maxVitorias"), outro="semVencer")]}, 1),
        ("minúsculas", {"x": [{"coluna_qualquer": "sg"}]}, 1),
        ("id técnico individual de gol", {"linhas": [{"indicador": "ti_ataque_golos_90", "gap": 20}]}, 1),
        ("subiu_de_fato como indicador", {"linhas": [{"indicador": "subiu_de_fato", "gap": 20}]}, 1),
        ("falsos positivos: porta D, lado E, campo pos", {"x": [{"lado_texto": "E", "porta": "D", "campo": "pos"}]}, 0),
        ("exposição declarada (etapa 10) com estatística",
         {"etapa_10": {"linhas": [dict(indicador="SG", tipo="resultado", **{MARCA_RETIRADA: motivo_resultado("SG")},
                                       d_bruto_AM=3.1)]}}, 0),
        ("exposição fora do bloco declarado",
         {"etapa_9": {"linhas": [dict(indicador="SG", tipo="resultado", **{MARCA_RETIRADA: motivo_resultado("SG")},
                                      d_bruto_AM=3.1)]}}, 1),
        # r2 — segunda conferência de 13/09/2026
        ("r2 chave composta SG_alta/SG_baixa", {"medias": {"SG_alta": 30, "SG_baixa": 10}}, 2),
        ("r2 chave composta d_SG", {"x": {"d_SG": 1.2}}, 1),
        ("r2 retirada com media_alta, posicao_no_ranking, separa",
         {"x": [dict(R("SG"), media_alta=1, media_baixa=0, posicao_no_ranking=3, separa=True)]}, 1),
        ("r2 texto em entradas_leitura", {"entradas_leitura": "o GP separa alta de baixa"}, 1),
        ("r2 texto em teste_conclusao", {"teste_conclusao": "o GP separa alta de baixa"}, 1),
        ("r2 texto em como_ler", {"como_ler": "o GP separa alta de baixa"}, 1),
        ("r2 frase de achado em decisao (campo de regra)", {"decisao": "o GP separa alta de baixa"}, 1),
        ("r2 régua em frase de achado", {"leitura": "pts separa as faixas"}, 1),
        ("r2 aproveitamento em frase de achado", {"leitura": "o aproveitamento do 1o turno prediz a faixa"}, 1),
        ("r2 sinônimo por extenso", {"leitura": "o saldo de gols separa"}, 1),
        ("r2 sg minúsculo em frase de achado", {"leitura": "o sg separa"}, 1),
        ("r2 linha de clube com régua e estatística", {"l": [{"clube": "X", "ano": 2023, "pts": 61, "gap": 40, "q": 0.001}]}, 1),
        ("r2 referencia_pts1t_x_pts2t sem marca", {"e": {"referencia_pts1t_x_pts2t": {"rho": 0.5, "p": 0.001}}}, 2),
        ("r2 referencia entre resultados declarada",
         {"e": {"referencia_pts1t_x_pts2t": dict(rho=0.5, p=0.001, **referencia_de_resultado(
             ["pts1t", "pts2t"], "exemplo"))}}, 0),
        ("r2 marca sem teste ao lado de estatística",
         {"t": {"golos_cabeca": {"gap": 40}, MARCA_SEM_TESTE: {"golos_cabeca": dict(motivo=gc, por_que="x")}}}, 1),
        ("r2 estatística em sub-registro da retirada", {"x": [dict(R("SG"), resultado_do_teste={"gap": 44, "q": 0.001})]}, 1),
        ("r2 posicao_media e ordem com a marca",
         {"x": [dict(R("SG"), indicador="SG", posicao_media={"alta": 80, "media": 50, "baixa": 20}, ordem=1)]}, 1),
        ("r2 número com nome livre", {"x": [dict(R("SG"), diferenca=44, significancia=0.001, separa=True)]}, 1),
        ("r2 texto em teste_cego_leitura", {"teste_cego_leitura": "o SG separa as faixas"}, 1),
        ("r2 texto em como_ler (SG)", {"como_ler": "o SG separa as faixas"}, 1),
        ("r2 nome V com gap", {"l": [{"nome": "V", "gap": 40}]}, 1),
        ("r2 falso positivo: motivo da lista citando saldo de gols",
         {"x": [R("SG")]}, 0),
        ("r2 falso positivo: régua descrita sem verbo de achado",
         {"leitura": "aproveitamento = pts / (3 × J); a faixa alta começa em 53,5%"}, 0),
        ("r2 falso positivo: frase de retirada em campo de regra",
         {"o_que_mudou": "golos_cabeca e clean_sheets retirados: não separam nada que não seja o placar"}, 0),
        ("r2 falso positivo: faixa_alta e aproveitamento_pct (régua descrita)",
         {"l": [{"clube": "X", "ano": 2023, "faixa_alta": 3, "aproveitamento_pct": 55.0}]}, 0),
        # r3 — terceira conferência de 14/09/2026 (todos davam 0 antes do conserto)
        ("r3 marca de referência cobrindo a régua (SG x faixa)",
         {"e": {"referencia_SG_x_faixa": {"rho": 0.9, "p": 1e-9, MARCA_REFERENCIA: dict(
             colunas={"SG": motivo_resultado("SG"), "faixa": motivo_resultado("faixa")}, por_que="x")}}}, 1),
        ("r3 frase de achado no registro sem teste",
         {"t": {"indicadores": ["golos_cabeca"], "leitura": "golos_cabeca separa as faixas",
                MARCA_SEM_TESTE: {"golos_cabeca": dict(motivo=gc, por_que="x")}}}, 1),
        ("r3 retirada com teste num descendente fundo",
         {"x": [dict(R("SG"), detalhe={"nivel": {"q": 0.01}})]}, 1),
        ("r3 decimal escrito como texto na retirada", {"x": [dict(R("SG"), diferenca="44,3")]}, 1),
        ("r3 resumo em texto com números na retirada", {"x": [dict(R("SG"), resumo_num="gap 44,3 q 0,001")]}, 1),
        ("r3 número em campo que a retirada aceitava (vira, troca)", {"x": [dict(R("SG"), vira=44.2, troca=0.001)]}, 1),
        ("r3 chave SG_gap", {"x": {"SG_gap": 40}}, 1),
        ("r3 chave SG_medio", {"x": {"SG_medio": 1.2}}, 1),
        ("r3 chave delta_SG", {"x": {"delta_SG": 1.2}}, 1),
        ("r3 chave diff_GP_alta_baixa", {"x": {"diff_GP_alta_baixa": 1.2}}, 1),
        ("r3 chave SG_q90", {"x": {"SG_q90": 3}}, 1),
        ("r3 chave rho_SG_faixa", {"e": {"rho_SG_faixa": 0.9}}, 2),
        ("r3 chave d_aproveitamento_1t", {"x": {"d_aproveitamento_1t": 0.9}}, 1),
        ("r3 nome V com valor", {"ranking": [{"nome": "V", "valor": 40}]}, 1),
        ("r3 regra sem verbo da lista", {"decisao": "o GP é o indicador que mais afasta a alta da baixa"}, 1),
        ("r3 regra 'lidera o ranking'", {"o_que_mudou": "o SG lidera o ranking de gaps"}, 1),
        ("r3 sinônimo gols", {"leitura": "quem faz mais gols separa as faixas"}, 1),
        ("r3 sinônimo golos marcados", {"leitura": "golos marcados separam as faixas"}, 1),
        ("r3 sinônimo pontos", {"leitura": "os pontos do 1o turno separam a alta"}, 1),
        ("r3 'pedaço' depois da coluna não anula", {"decisao": "o SG, pedaço do placar, separa as faixas"}, 1),
        ("r3 golos_pro do jogo a jogo como indicador", {"linhas": [{"indicador": "golos_pro", "gap": 30}]}, 1),
        ("r3 resultado do jogo a jogo como indicador", {"linhas": [{"indicador": "resultado", "gap": 30}]}, 1),
        ("r3 golos_pro retirada declarada", {"x": [retirada("golos_pro")]}, 0),
        # r3 falsos positivos medidos no pontos.json real
        ("r3 falso positivo: régua como desfecho (rho_com_aproveitamento)",
         {"c": {"rho_com_aproveitamento": -0.5, "p_com_aproveitamento": 1e-6}}, 0),
        ("r3 falso positivo: rótulos de eixo D_explosao e porta_D",
         {"e": {"D_explosao": ["fis_psv99_top5"], "E_qualidade_chance": ["xg_por_remate"], "porta_D": {"linhas": 0}}}, 0),
        ("r3 falso positivo: régua descrita em chave composta",
         {"l": [{"clube": "X", "ano": 2023, "faixa_posicao_t": "sobe", "pts_a_mais_para_subir_de_faixa": 3,
                 "linhas_por_faixa": {"alta": 3}}]}, 0),
        ("r3 falso positivo: resultado como palavra (tipo, consequencia_do_resultado, flag)",
         {"linhas": [{"indicador": "share_11", "tipo": "resultado", "consequencia_do_resultado": True, "resultado": False}]}, 0),
        ("r3 falso positivo: id de xG individual", {"x": {"ti_ataque_golos_esperados_90": {"alta": 0.1}}}, 0),
        ("r3 falso positivo: gols esperados e pontos como desfecho",
         {"leitura": "os golos esperados sobem e o 1º turno prevê os pontos do 2º"}, 0),
        ("r3 falso positivo: negação em campo de regra",
         {"motivo_x": "share_11 e golos_cabeca não separam nada que não seja o placar"}, 0),
        # r4 — quarta conferência de 14/09/2026 (todos davam 0 antes do conserto; os falsos positivos davam 1)
        ("r4 V_x_faixa com rho no valor", {"e": {"V_x_faixa": {"rho": 0.95, "p": 1e-9}}}, 1),
        ("r4 aproveitamento_1t com gap no valor", {"e": {"aproveitamento_1t": {"gap": 30, "q": 0.001}}}, 1),
        ("r4 D_por_faixa com gap no valor (D e faixa)", {"e": {"D_por_faixa": {"gap": 12, "q": 0.001}}}, 2),
        ("r4 V_alta/V_baixa", {"e": {"V_alta": 20, "V_baixa": 8}}, 2),
        ("r4 gap_x_V (relação só isenta a régua)", {"e": {"gap_x_V": 12}}, 1),
        ("r4 referência partida por faixa (SG, GP e faixa)",
         {"e": {"referencia_SG_x_GP_por_faixa": dict(rho={"alta": 0.9, "media": 0.5, "baixa": 0.1}, p=1e-6,
                                                     **referencia_de_resultado(["SG", "GP"], "x"))}}, 3),
        ("r4 referência com teste dentro de n",
         {"e": {"SG_x_GP": dict(rho=0.9, p=1e-6, n={"gap": 40, "q": 0.001}, **referencia_de_resultado(["SG", "GP"], "x"))}}, 2),
        ("r4 sem teste com valor_na_alta",
         {"t": dict(indicadores=["golos_cabeca"], valor_na_alta=3.1, valor_na_baixa=1.2,
                    **{MARCA_SEM_TESTE: {"golos_cabeca": dict(motivo=gc, por_que="x")}})}, 1),
        ("r4 sem teste com a coluna por faixa (chave e lista)",
         {"t": dict(indicadores=["golos_cabeca"], golos_cabeca={"alta": 3.1, "baixa": 1.2},
                    **{MARCA_SEM_TESTE: {"golos_cabeca": dict(motivo=gc, por_que="x")}})}, 2),
        ("r4 sem teste com faixa e número em texto",
         {"t": dict(indicadores=["golos_cabeca"], resumo_txt="alta 3,1 x baixa 1,2",
                    **{MARCA_SEM_TESTE: {"golos_cabeca": dict(motivo=gc, por_que="x")}})}, 1),
        ("r4 retirada com nome numérico", {"x": [R("SG", nome="gap 44,3 · q 0,001")]}, 1),
        ("r4 retirada com motivo que não é o da lista",
         {"x": [{"col": "SG", "motivo": "saldo; gap 44,3 q 0,001", MARCA_RETIRADA: motivo_resultado("SG")}]}, 1),
        ("r4 retirada com nota de achado sem o nome da coluna", {"x": [R("SG", nota="é o que mais separa alta de baixa")]}, 1),
        ("r4 chave sg_gap", {"x": {"sg_gap": 40}}, 1),
        ("r4 chaves gp_alta/gp_baixa", {"x": {"gp_alta": 3, "gp_baixa": 1}}, 2),
        ("r4 chave 'SG alta'", {"x": {"SG alta": 3}}, 1),
        ("r4 chave 'SG (gap)'", {"x": {"SG (gap)": 3}}, 1),
        ("r4 chave 'SG-gap'", {"x": {"SG-gap": 3}}, 1),
        ("r4 valor SG/J", {"l": [{"indicador": "SG/J", "gap": 40}]}, 1),
        ("r4 valor GP-GC", {"l": [{"indicador": "GP-GC", "gap": 40}]}, 2),
        ("r4 valor golos_pro/90", {"l": [{"indicador": "golos_pro/90", "gap": 40}]}, 1),
        ("r4 contexto solto: circular", {"decisao": "Sem risco circular aqui, o GP separa alta de baixa."}, 1),
        ("r4 contexto solto: não entra", {"teste": "A regua nao entra no teste cego, e o SG separa as faixas."}, 1),
        ("r4 sujeito depois do verbo", {"leitura": "O que mais separa as faixas sao os gols marcados."}, 1),
        ("r4 sujeito depois: aproveitamento", {"leitura": "quem separa a alta da baixa e o aproveitamento do 1o turno"}, 1),
        ("r4 travessão", {"leitura": "Gols marcados — o indicador que mais separa as faixas"}, 1),
        ("r4 V e E soltos", {"leitura": "V e E separam as faixas"}, 2),
        ("r4 gol no singular", {"leitura": "quem sofre menos gol separa"}, 1),
        ("r4 clean sheets", {"leitura": "clean sheets separam"}, 1),
        ("r4 saldo sozinho", {"leitura": "o saldo separa as faixas"}, 1),
        ("r4 chave resultado_gap", {"x": {"resultado_gap": 30}}, 1),
        ("r4 chave d_resultado", {"x": {"d_resultado": 1.4}}, 1),
        ("r4 falso positivo: V de Cramér", {"x": {"p_cramer_V": 0.01}}, 0),
        ("r4 falso positivo: D de KS", {"x": {"p_ks_D": 0.01}}, 0),
        ("r4 falso positivo: gap por eixo E", {"x": {"E_qualidade_chance_gap": 12}}, 0),
        ("r4 falso positivo: rho por eixo D", {"x": {"rho_D_explosao": 0.3}}, 0),
        ("r4 falso positivo: pontos de corte", {"leitura": "Os pontos de corte separam a alta da media."}, 0),
        ("r4 falso positivo: corte de aproveitamento",
         {"leitura": "o corte de aproveitamento de 53,5% separa a alta da media"}, 0),
        ("r4 falso positivo: Golos_esperados_gap", {"x": {"Golos_esperados_gap": 3}}, 0),
        ("r4 falso positivo: resultado_do_teste acusa só o SG, não 'resultado'",
         {"x": [dict(R("SG"), resultado_do_teste={"gap": 44})]}, 1),
        ("r4 falso positivo: caminho no mapa da tela", {"m": [{"prototipo": "etapa_7.referencia_pts1t_x_pts2t"}]}, 0),
        ("r4 falso positivo: posse como pedaço de indicador", {"l": [{"col": "atq_pos_remates", "p": 0.01}]}, 0),
        # fechamento — 14/09/2026: o valor lido como a chave, e a referência que parte por faixa em descendente
        # (todos davam 0 antes do conserto)
        ("fecho indicador 'Golos sofridos' (nome com espaço)",
         {"linhas": [{"indicador": "Golos sofridos", "gap": 30, "q": 0.001}]}, 1),
        ("fecho indicador 'Golos sofridos/90'", {"linhas": [{"indicador": "Golos sofridos/90", "gap": 30}]}, 1),
        ("fecho indicador 'golos pro'", {"linhas": [{"indicador": "golos pro", "gap": 30}]}, 1),
        ("fecho nome com espaço numa lista de achados", {"achados": ["xg", "Golos sofridos"]}, 1),
        ("fecho indicador aproveitamento_1t com gap na linha",
         {"linhas": [{"indicador": "aproveitamento_1t", "gap": 30, "q": 0.001}]}, 1),
        ("fecho indicador V_casa com gap na linha", {"linhas": [{"indicador": "V_casa", "gap": 30}]}, 1),
        ("fecho indicador Pts/J com gap na linha", {"linhas": [{"indicador": "Pts/J", "gap": 30}]}, 1),
        ("fecho indicador resultado_final com gap na linha", {"linhas": [{"indicador": "resultado_final", "gap": 30}]}, 1),
        ("fecho referência com subchave por faixa (SG e GP)",
         {"e": {"referencia_SG_x_GP": dict(rho=0.9, p=1e-6, por_clube={"alta": 0.9, "baixa": 0.1},
                                           **referencia_de_resultado(["SG", "GP"], "x"))}}, 2),
        ("fecho referência com campo correlacao_alta",
         {"e": {"referencia_SG_x_GP": dict(rho=0.9, p=1e-6, correlacao_alta=0.95,
                                           **referencia_de_resultado(["SG", "GP"], "x"))}}, 2),
        ("fecho referência com desfecho='faixa'",
         {"e": {"referencia_SG_x_GP": dict(rho=0.9, p=1e-6, desfecho="faixa",
                                           **referencia_de_resultado(["SG", "GP"], "x"))}}, 2),
        ("fecho referência com diferenca_entre_faixas",
         {"e": {"referencia_SG_x_GP": dict(rho=0.9, p=1e-6, diferenca_entre_faixas=44.0,
                                           **referencia_de_resultado(["SG", "GP"], "x"))}}, 2),
        ("fecho falso positivo: motivo da lista ('pedaço de GP') como item de lista", {"m": ["pedaço de GP"]}, 0),
        ("fecho falso positivo: rótulo de faixa com espaço fora da identidade", {"x": {"nome": "meio da tabela"}}, 0),
    ]
    for rotulo, obj, esperado in casos:
        n = len(referencias_circulares(obj, blocos_de_exposicao=expo))
        assert n == esperado, ("a guarda de circularidade falhou no autoteste", rotulo, n, esperado,
                               referencias_circulares(obj, blocos_de_exposicao=expo))
    mc = motivo_consequencia("share_11")
    casos_c = [
        ("consequência sem marca", {"j": {"share_11_alta": 67.2, "share_11_baixa": 58.9}}, 2),
        ("consequência com marca no registro", {"j": dict(share_11_alta=67.2, **marca_consequencia(["share_11"]))}, 0),
        ("linha com consequencia_do_resultado", {"l": [dict(indicador="share_11", consequencia_do_resultado=True,
                                                            motivo_consequencia=mc, gap=3)]}, 0),
        ("eixo feito de consequência sem marca", {"eixos_usados": {"I": ["share_11", "conc_hhi"]}}, 2),
        ("r2 texto livre com consequência", {"leitura": "conc_hhi separa as faixas"}, 1),
        ("r2 chave share_11_pct", {"x": {"share_11_pct": 60}}, 1),
        ("r2 chave d_nucleo_300", {"x": {"d_nucleo_300": 0.4}}, 1),
        ("r2 texto com consequência sob a marca", {"x": dict(leitura="conc_hhi separa as faixas",
                                                            **marca_consequencia(["conc_hhi"]))}, 0),
        ("r3 chave share_11_gap", {"x": {"share_11_gap": 3}}, 1),
        ("r3 consequência em campo de regra sem verbo", {"decisao": "conc_hhi é o maior gap da tabela"}, 1),
        ("r3 consequência como valor em lista de achados", {"achados": ["share_11"]}, 1),
        ("r3 marca de outra coluna não cobre", {"x": dict(leitura="nucleo_300 separa", **marca_consequencia(["share_11"]))}, 1),
        ("r3 falso positivo: consequência explicada em regra",
         {"regra_x": "share_11 é consequência do resultado, não receita"}, 0),
        ("r3 falso positivo: 'novos' fora do sujeito", {"leitura": "a régua separa as faixas com os cortes novos"}, 0),
        ("r4 marca na raiz não isenta frase de achado",
         dict(etapa_9={"leitura": "share_11 e o melhor preditor da faixa: repita o XI"},
              **marca_consequencia(["share_11"])), 1),
        ("r4 marca na raiz isenta a citação", dict(etapa_9={"leitura": "share_11 medido por temporada"},
                                                   **marca_consequencia(["share_11"])), 0),
        ("r4 chave share11_gap", {"x": {"share11_gap": 3}}, 1),
        ("r4 atletas usados por extenso", {"leitura": "atletas usados separam as faixas"}, 1),
        ("r4 contexto solto", {"decisao": "Sem ser circular, share_11 separa as faixas."}, 1),
        ("r4 chave gap_x_novos", {"x": {"gap_x_novos": 3}}, 1),
        ("r4 novos depois do verbo", {"leitura": "o que separa as faixas sao os novos"}, 1),
        # fechamento — 14/09/2026 (todos davam 0 antes; os falsos positivos são as formas reais do pontos.json)
        ("fecho valor share_11/90 com gap", {"linhas": [{"indicador": "share_11/90", "gap": 3, "q": 0.01}]}, 1),
        ("fecho valor conc_hhi_minutos", {"linhas": [{"indicador": "conc_hhi_minutos", "gap": 3}]}, 1),
        ("fecho chaves com estatística sob marca na raiz",
         dict(etapa_9={"share_11_gap": 3, "q_share_11": 0.001}, **marca_consequencia(["share_11"])), 2),
        ("fecho linha com gap sob marca na raiz",
         dict(etapa_9={"linhas": [{"indicador": "share_11", "gap": 3}]}, **marca_consequencia(["share_11"])), 1),
        ("fecho falso positivo: linhas marcadas pelo dono da lista (etapa_9.reguas[].itens_crus)",
         {"r": [dict(itens_crus=[{"col": "share_11", "d_AM": 1.0, "p_AM": 0.01}], **marca_consequencia(["share_11"]))]}, 0),
        ("fecho falso positivo: rho.share_11 marcado pela etapa (etapa_6)",
         {"etapa_6": dict(rho={"share_11": {"rho": 0.05, "p": 0.7, "n": 36}}, **marca_consequencia(["share_11"]))}, 0),
        ("fecho falso positivo: citação sem estatística dois níveis abaixo da marca",
         dict(etapa_8={"eixos_usados": {"I": ["share_11"]}}, **marca_consequencia(["share_11"])), 0),
    ]
    for rotulo, obj, esperado in casos_c:
        n = len(referencias_de_consequencia_sem_marca(obj))
        assert n == esperado, ("a guarda de consequência falhou no autoteste", rotulo, n, esperado,
                               referencias_de_consequencia_sem_marca(obj))
    return [c[0] for c in casos + casos_c]


# ══════════════════════════════════════════════════════════════════════════════
#  Ferramentas (mesma mecânica das do gerar_prototipo.py — ver o cabeçalho)
# ══════════════════════════════════════════════════════════════════════════════

def _r(x, casas=4):
    if x is None:
        return None
    try:
        v = float(x)
    except (TypeError, ValueError):
        return None
    return None if not np.isfinite(v) else round(v, casas)


def _r_sig(x, sig=3):
    """Arredonda por algarismo significativo. Serve ao p (um p de 1e-8 em 4 casas vira 0, e p nunca é
    zero) e é a base da mediana crua (`_medianas_para_a_tela`)."""
    if x is None:
        return None
    v = float(x)
    if not np.isfinite(v):
        return None
    return 0.0 if v == 0 else float(f"{v:.{sig - 1}e}")


def _medianas_para_a_tela(crus, indicador):
    """As medianas cruas de cada faixa, arredondadas sem apagar a diferença entre elas.

    Três casas decimais apagavam a diferença nos por-90 pequenos (xA/90 da zaga 0,00726 / 0,00659 /
    0,00708 saía 0,007 nas três); 4 algarismos significativos, o conserto da rodada 3, apagou do outro
    lado da escala: duelos ofensivos do lateral 46,554 / 46,772 / 46,552 viraram 46,55 na alta e na baixa,
    e a distância do meio 10191,186 virou 10190. Regra da rodada 4: para cada valor, o mais preciso entre
    4 significativos e 3 casas decimais; se ainda assim duas medianas cruas diferentes saírem iguais,
    sobem os significativos até separarem — e o assert garante que nenhuma diferença some.
    """
    def arred(v, sig):
        if v is None or not np.isfinite(v):
            return None
        a, b = _r_sig(v, sig), round(float(v), 3)
        return b if abs(b - v) < abs(a - v) else a

    # Fechamento (14/09): ruído de ponto flutuante não é diferença. {0.1+0.2, 0.3} contava como duas medianas
    # distintas, o laço subia até 17 significativos e publicava 0.30000000000000004. A representação é
    # arredondada a 12 significativos ANTES de contar e de arredondar — acima disso nenhum dado desta base tem
    # dígito medido — e o laço para em 12.
    def limpo(v):
        return float(f"{float(v):.12g}")

    crus = {g: (limpo(v) if v is not None and np.isfinite(v) else v) for g, v in crus.items()}
    finitos = {g: v for g, v in crus.items() if v is not None and np.isfinite(v)}
    distintos = len(set(finitos.values()))
    for sig in range(4, 13):
        out = {g: arred(v, sig) for g, v in crus.items()}
        if len({out[g] for g in finitos}) == distintos:
            return out
    raise AssertionError(("mediana crua: o arredondamento apaga a diferença entre faixas", indicador, crus))


def _d_cohen(a, b):
    a, b = np.asarray(a, float), np.asarray(b, float)
    a, b = a[np.isfinite(a)], b[np.isfinite(b)]
    if len(a) < 2 or len(b) < 2:
        return np.nan
    s = np.sqrt(((len(a) - 1) * a.var(ddof=1) + (len(b) - 1) * b.var(ddof=1))
                / (len(a) + len(b) - 2))
    return np.nan if not s else (a.mean() - b.mean()) / s


def _mw(a, b):
    """Mann-Whitney bilateral (ver o cabeçalho: o percentil é ordinal). Menos de 4 de um lado: NaN."""
    a, b = np.asarray(a, float), np.asarray(b, float)
    a, b = a[np.isfinite(a)], b[np.isfinite(b)]
    if len(a) < 4 or len(b) < 4:
        return np.nan
    return float(stats.mannwhitneyu(a, b, alternative="two-sided").pvalue)


def abaixo(x, limite):
    """`x < limite` que trata None/NaN como 'não passou' — e 0,0 como passou.

    O idioma `(p or 1) < 0,05` troca um p arredondado para 0,0 por 1: o teste mais forte da
    tabela sumiria da contagem sem aviso. Aconteceu no gerador do Protótipo (ver o relatório
    desta obra); aqui não passa.
    """
    if x is None:
        return False
    try:
        v = float(x)
    except (TypeError, ValueError):
        return False
    return bool(np.isfinite(v) and v < limite)


def _bh(ps):
    p = np.asarray(ps, float)
    ok = np.isfinite(p)
    q = np.full(len(p), np.nan)
    if not ok.sum():
        return q
    idx = np.where(ok)[0][np.argsort(p[ok])]
    m = ok.sum()
    anterior = 1.0
    for pos in range(m - 1, -1, -1):
        i = idx[pos]
        anterior = min(anterior, p[i] * m / (pos + 1))
        q[i] = anterior
    return q


def _residuo(y, xs):
    """Resíduo de y em um ou mais controles, mínimos quadrados (sem statsmodels)."""
    y = np.asarray(y, float)
    M = np.column_stack([np.asarray(v, float) for v in xs])
    ok = np.isfinite(y) & np.isfinite(M).all(axis=1)
    out = np.full(len(y), np.nan)
    if ok.sum() < M.shape[1] + 3:
        return out
    X = np.column_stack([np.ones(int(ok.sum())), M[ok]])
    beta, *_ = np.linalg.lstsq(X, y[ok], rcond=None)
    out[ok] = y[ok] - X @ beta
    return out


def controles_de_atletas_rastreados(meta, painel, ano="ano", chave=("ano", "clube")):
    """{indicador: (nome, Series)} com o posto no ano do nº de atletas RASTREADOS, nas linhas físicas.

    O físico do clube é a média dos atletas que o SkillCorner rastreou; clube que roda mais
    gente tem mais atletas na média, e os oito físicos do ataque do topo da prévia caíram
    exatamente por isso na refutação. O controle é o do próprio setor (`fis_<setor>_atletas`)
    ou o do elenco (`fis_atletas`). Recebe o `meta` do `montar_matriz` e o painel.

    Devolve Series indexada pela `chave` (ano, clube) das próprias linhas do painel, e não vetor:
    até 14/09 era ndarray, e um painel em outra ordem que a dos postos passava calado (a
    conferência de índice de `tabela_de_gaps` nunca rodava). Agora a ordem do painel não importa —
    `tabela_de_gaps` realinha pela chave e quebra se a chave não bater.
    """
    idx = pd.MultiIndex.from_frame(painel[list(chave)])

    def posto(col):
        # groupby().rank devolve na ordem das linhas do painel: os valores casam com `idx` por construção
        return pd.Series((painel.groupby(ano)[col].rank(pct=True) * 100).to_numpy(dtype=float), index=idx)

    out = {}
    for ind, m in meta.items():
        if m.get("familia") == "fisico_col_elenco" and "fis_atletas" in painel.columns:
            out[ind] = ("posto de fis_atletas", posto("fis_atletas"))
        elif m.get("familia") == "fisico_col_setor":
            col = f"fis_{m.get('setor')}_atletas"
            if col in painel.columns:
                out[ind] = (f"posto de {col}", posto(col))
    return out


# ══════════════════════════════════════════════════════════════════════════════
#  O gap
# ══════════════════════════════════════════════════════════════════════════════

def _medias_por_grupo(P, rotulos, ordem):
    """Posição média de cada faixa em cada indicador, vetorizada (buraco fica fora da conta).

    Devolve (k × p). Faixa sem nenhum valor finito num indicador vira NaN nele.
    """
    F = np.isfinite(P)
    X = np.where(F, P, 0.0)
    out = np.full((len(ordem), P.shape[1]), np.nan)
    for g, nome in enumerate(ordem):
        m = rotulos == nome
        cnt = F[m].sum(axis=0)
        with np.errstate(invalid="ignore", divide="ignore"):
            out[g] = np.where(cnt > 0, X[m].sum(axis=0) / np.maximum(cnt, 1), np.nan)
    return out


def _gaps(P, rotulos, ordem):
    M = _medias_por_grupo(P, rotulos, ordem)
    with np.errstate(invalid="ignore"):
        completo = np.isfinite(M).all(axis=0)
        return np.where(completo, np.nanmax(M, axis=0) - np.nanmin(M, axis=0), np.nan), M


def linha_da_sorte(P, rotulos, anos, ordem, n_sorteios=1000, semente=(7, 23),
                   limiares=(20, 25, 30)):
    """Quanto gap o puro sorteio produz olhando TODOS os indicadores de uma vez.

    O sorteio embaralha os rótulos DENTRO de cada ano, e só eles: cada ano continua com o
    mesmo número de times em cada faixa, e cada clube-temporada leva todos os seus
    indicadores juntos — a correlação entre indicadores fica intacta, e só o vínculo com a
    faixa é quebrado. Embaralhar coluna por coluna inventaria uma independência que o
    painel não tem e devolveria uma linha baixa demais.

    `semente` é a tupla do gerador próprio; ela vai ao JSON junto com o resultado.
    """
    P = np.asarray(P, float)
    rotulos = np.asarray(rotulos, dtype=object)
    anos = np.asarray(anos)
    real, _ = _gaps(P, rotulos, ordem)
    gen = np.random.default_rng(list(semente))
    blocos = [np.where(anos == a)[0] for a in np.unique(anos)]
    maiores = np.empty(n_sorteios)
    contagens = {lim: np.empty(n_sorteios, int) for lim in limiares}
    for it in range(n_sorteios):
        rr = rotulos.copy()
        for b in blocos:
            rr[b] = rotulos[b][gen.permutation(len(b))]
        g, _ = _gaps(P, rr, ordem)
        maiores[it] = np.nanmax(g)
        for lim in limiares:
            contagens[lim][it] = int(np.nansum(g >= lim))
    return dict(
        sorteios=n_sorteios, gerador=f"np.random.default_rng({list(semente)})",
        como=("rótulos sorteados dentro do ano, mantendo os tamanhos de cada faixa por ano; "
              "cada clube-temporada leva todos os indicadores juntos"),
        indicadores=int(P.shape[1]),
        maior_gap_medido=_r(np.nanmax(real), 2),
        maior_gap_do_sorteio=dict(mediana=_r(np.median(maiores), 2),
                                  p95=_r(np.percentile(maiores, 95), 2),
                                  maximo=_r(maiores.max(), 2)),
        linha=_r(np.percentile(maiores, 95), 2),
        # a contagem de acima usa o p95 SEM arredondar, e a marca de cada linha também
        # (`tabela_de_gaps` lê esta chave): dois números com o mesmo nome não podem discordar
        linha_sem_arredondar=float(np.percentile(maiores, 95)),
        linha_significa=("95% dos sorteios não produzem NENHUM gap acima desta linha, "
                         "mesmo olhando todos os indicadores de uma vez"),
        acima_da_linha=int(np.nansum(real > np.percentile(maiores, 95))),
        contagem_por_limiar=[
            dict(limiar=lim, medido=int(np.nansum(real >= lim)),
                 sorteio_mediana=_r(np.median(contagens[lim]), 1),
                 sorteio_p95=_r(np.percentile(contagens[lim], 95), 1),
                 p=_r((1 + int((contagens[lim] >= np.nansum(real >= lim)).sum()))
                      / (n_sorteios + 1), 4))
            for lim in limiares]), real


def _destoa(medias, ordem):
    """(índice do grupo que destoa, lado) — a ponta mais longe do grupo do meio."""
    ok = np.isfinite(medias)
    if ok.sum() < len(ordem):
        return None, None
    ix = np.argsort(medias)
    lo, mid, hi = ix[0], ix[1], ix[-1]
    if medias[hi] - medias[mid] >= medias[mid] - medias[lo]:
        return int(hi), "acima"
    return int(lo), "abaixo"


def _conferir_entrada(anos, postos, rotulos, ordem, ano_maximo, rotulo):
    """As guardas que a conferência de 13/09 mostrou faltarem: sem elas a tabela saía vazia
    ou com o 'resto' contaminado, sem erro nenhum."""
    assert ano_maximo is not None, f"{rotulo}: ano_maximo é obrigatório (2026 não entra em teste)"
    assert int(np.max(anos)) <= ano_maximo, f"{rotulo}: linha de {int(np.max(anos))} entrou na tabela de gaps"
    assert len(ordem) == 3, f"{rotulo}: o módulo assume três faixas ordenadas, recebeu {len(ordem)}"
    presentes = set(np.asarray(rotulos, dtype=object).tolist())
    assert presentes == set(ordem), (f"{rotulo}: rótulos {sorted(map(str, presentes))} não são as faixas "
                                     f"{list(ordem)}")
    for g in ordem:
        assert int((np.asarray(rotulos, dtype=object) == g).sum()) >= 4, f"{rotulo}: faixa {g} com menos de 4 linhas"
    assert len(anos) == len(rotulos) == len(postos), f"{rotulo}: anos, rótulos e postos desalinhados"
    V = np.asarray(postos, float)
    assert np.nanmin(V) >= 0 and np.nanmax(V) <= 100 and np.nanmax(V) > 1, \
        f"{rotulo}: postos fora da escala 0-100 (os limiares 20/25/30 estão nessa escala)"


def pela_chave(painel, coluna, chave=("ano", "clube")):
    """A coluna do painel como Series indexada pela chave (ano, clube) — o formato que `tabela_de_gaps`
    exige para anos, rótulos, r_val e controles."""
    return pd.Series(painel[coluna].to_numpy(), index=pd.MultiIndex.from_frame(painel[list(chave)]), name=coluna)


def _chave_dos_postos(quadro, nome):
    nomes = list(getattr(getattr(quadro, "index", None), "names", None) or [])
    assert "ano" in nomes and "clube" in nomes, (
        f"{nome}: precisa de índice com ano e clube (DataFrame.set_index(['ano', 'clube'])) para o alinhamento "
        f"por chave; tem {nomes}")
    assert quadro.index.is_unique, f"{nome}: chave (ano, clube) repetida"
    return nomes


def _alinhar_pela_chave(vetor, indice, nome, dtype):
    """O vetor reindexado pela chave dos postos. Vetor sem índice (ndarray, `.values`, lista) é recusado."""
    assert isinstance(vetor, pd.Series), (
        f"{nome}: precisa ser Series indexada por (ano, clube) — use `pela_chave(painel, coluna)`; vetor sem "
        "índice (ndarray, .values) não deixa conferir a ordem das linhas e é recusado")
    assert list(vetor.index.names) == list(indice.names), (
        f"{nome}: índice {list(vetor.index.names)} diferente do dos postos {list(indice.names)}")
    assert vetor.index.is_unique, f"{nome}: chave (ano, clube) repetida"
    assert set(vetor.index) == set(indice), f"{nome}: as linhas não são as mesmas dos postos"
    alinhado = vetor.reindex(indice)
    assert alinhado.index.equals(indice)
    return alinhado.to_numpy(dtype=dtype)


def tabela_de_gaps(anos, postos, bruto, rotulos, indicadores, ordem, *,
                   r_val=None, controles=None, meta=None, outro=None,
                   rotulo_universo=None, n_sorteios=1000, semente=(7, 23),
                   limiares=(20, 25, 30), nomes_das_faixas=None, ano_maximo=None):
    """A TABELA DE TODAS AS DIFERENÇAS, do maior gap para o menor.

    - `ano_maximo`: OBRIGATÓRIO (a função quebra sem ele) e a função QUEBRA se alguma linha,
      deste período ou do `outro`, for de ano posterior. É a guarda da casa: temporada
      incompleta (2026, 27 de 38 rodadas) não entra em média, corte nem teste — e esta tabela
      é as três coisas.

    Parâmetros (toda "Series (ano, clube)" abaixo é uma pandas Series indexada pela chave (ano, clube),
    em qualquer ordem — ver ALINHAMENTO; ndarray, lista ou `.values` são RECUSADOS)
    - `anos`: Series (ano, clube) com o ano de cada linha (o sorteio e o posto são dentro do ano).
    - `postos`: DataFrame (linhas × indicadores) com índice (ano, clube) e o percentil 0-100 dentro do ano.
    - `bruto`: DataFrame com o valor cru, mesma forma e MESMO índice, na mesma ordem dos `postos`.
    - `rotulos`: Series (ano, clube) com a faixa de cada linha, nos nomes de `ordem`.
    - `indicadores`: lista de colunas. Coluna da lista de resultado QUEBRA a função.
    - `r_val`: Series (ano, clube) com o posto de valor do elenco, ou None (sem dinheiro no universo: a
      coluna descontada sai null com motivo).
    - `controles`: {indicador: (nome, Series (ano, clube))} — controle extra ao lado do dinheiro (nº de
      atletas rastreados nas linhas físicas; `controles_de_atletas_rastreados` monta).
    - `meta`: {indicador: dict(nome, familia, pilar, setor)} opcional.
    - `outro`: dict(anos=Series (ano, clube), postos=DataFrame com índice (ano, clube),
      rotulos=Series (ano, clube), rotulo=texto) — o outro período, para a coluna "se
      repete?". Critério declarado aqui, antes de rodar: no outro período, o MESMO grupo
      que destoou neste, contra o resto, com o mesmo sinal e p < 0,05 → "sim"; indicador
      presente mas sem isso → "não"; indicador ausente → "não dá para testar".

    ALINHAMENTO (rodada 4): `postos` e `bruto` com índice (ano, clube) — o do `montar_matriz` — e
    TODO vetor por linha (`anos`, `rotulos`, `r_val`, cada controle; e `postos`, `rotulos`, `anos` do
    `outro`) como Series com o MESMO índice (ano, clube), em qualquer ordem: são reindexados pela chave
    dos postos. Vetor sem índice (`.values`, ndarray, lista) é recusado, porque não deixa conferir a
    ordem. `pela_chave(painel, coluna)` monta a Series. `autoteste_do_alinhamento` prova a recusa.

    A CHAMADA QUE O GERADOR DO PROTÓTIPO DEVE FAZER (faixas por posição, no `main`, depois do
    `montar_matriz`; `d80` é o painel 2022-2025 com `faixa` = sobe/meio/cai). Dentro do
    `gerar_prototipo.py` a semente é `SEMENTE` e a raiz é `RAIZ`, nomes do próprio módulo; chamada de
    fora (como o `gerar_pontos.py` faz), `G.SEMENTE` e `G.RAIZ`:

        import ranking_gaps as RG
        dv = pd.read_csv(os.path.join(RAIZ, "dados", "serieb_clube_temporada_2018_2021.csv"))
        dv = dv[dv.ano <= 2025].reset_index(drop=True)           # a coluna `faixa` (posição) já vem no CSV
        cols_outro = [c for c in postos.columns if meta[c]["coluna_csv"] in dv.columns]
        dvp = pd.DataFrame({c: dv.groupby("ano")[meta[c]["coluna_csv"]].rank(pct=True).values * 100
                            for c in cols_outro}, index=pd.MultiIndex.from_frame(dv[["ano", "clube"]]))
        r_val = d80.set_index(["ano", "clube"]).groupby(level="ano")["tm_valor_total"].rank(pct=True) * 100
        ranking_gaps = RG.tabela_de_gaps(
            RG.pela_chave(d80, "ano"), postos, bruto, RG.pela_chave(d80, "faixa"), list(postos.columns),
            ("sobe", "meio", "cai"),
            r_val=r_val,
            controles=RG.controles_de_atletas_rastreados(meta, d80),
            meta=meta,
            outro=dict(postos=dvp, rotulos=RG.pela_chave(dv, "faixa"), anos=RG.pela_chave(dv, "ano"),
                       rotulo="2018-2021"),
            rotulo_universo="80 clube-temporada de 2022-2025, faixas por POSIÇÃO",
            nomes_das_faixas={"sobe": "quem subiu", "meio": "meio da tabela", "cai": "quem caiu"},
            semente=(SEMENTE, 23), ano_maximo=2025)

    Com `n_sorteios=1000` (padrão) ela reproduz o bloco `ranking_gaps.mesma_tabela_com_as_faixas_por_posicao`
    do `pontos.json` (que roda a mesma chamada sem `outro`). Antes de gravar, o gerador passa o
    JSON inteiro por `referencias_circulares` e `referencias_de_consequencia_sem_marca`.
    """
    def coluna_de(c):
        return (meta or {}).get(c, {}).get("coluna_csv", c)
    # o id E a coluna do CSV: um id novo para uma coluna de resultado não pode passar
    circulares = [c for c in indicadores if e_resultado(c) or e_resultado(coluna_de(c))]
    assert not circulares, ("indicador que é pedaço do resultado entrou na tabela de gaps",
                            circulares)
    ordem = tuple(ordem)
    nomes = nomes_das_faixas or {g: g for g in ordem}
    # Alinhamento por CHAVE, não por posição — para TODO vetor por linha. Até 14/09 (rodada 3) só r_val e
    # os controles eram reindexados; os rótulos e os anos continuavam vetores na ordem das linhas, e a
    # única conferência era a dos anos contra o nível `ano` do índice. Um `postos.sort_index()` com
    # `d80.faixa.values` passava calado (os anos ficam juntos no sort, e o r_val era reindexado para a
    # ordem NOVA): dinheiro e postos concordavam entre si, as faixas ficavam trocadas, e
    # sobrevivem_q_5pct ia de 24 para 0 sem erro. Agora anos, rótulos, r_val e controles TÊM de ser Series
    # indexadas por (ano, clube) e são reindexados pela chave dos postos; vetor sem índice é recusado.
    _chave_dos_postos(postos, "postos")
    _chave_dos_postos(bruto, "bruto")
    assert postos.index.equals(bruto.index), "postos e bruto com linhas em ordem diferente"
    anos = _alinhar_pela_chave(anos, postos.index, "anos", object)
    rotulos = _alinhar_pela_chave(rotulos, postos.index, "rotulos", object)
    assert np.array_equal(anos.astype(int), postos.index.get_level_values("ano").to_numpy().astype(int)), \
        "anos diferentes do nível `ano` do índice dos postos"
    _conferir_entrada(anos, postos[indicadores], rotulos, ordem, ano_maximo, rotulo_universo or "tabela")
    r_val = None if r_val is None else _alinhar_pela_chave(r_val, postos.index, "r_val", float)
    controles = {k: (n, _alinhar_pela_chave(v, postos.index, f"controle {n}", float))
                 for k, (n, v) in (controles or {}).items()}
    P = postos[indicadores].values.astype(float)
    B = bruto[indicadores].values.astype(float)
    # O sorteio anda sobre POSIÇÕES de linha (`np.where(anos == a)` e `gen.permutation` na ordem em que as
    # linhas chegam). Com a mesma semente, a mesma chamada com as linhas em outra ordem publicava outra linha
    # da sorte — medido no dado real, faixas por posição: 37,58 na ordem do `montar_matriz`, 37,78 com
    # sort_index, 37,82 e 37,19 em duas permutações. Semente fixa só é fixa com a ordem fixa: o sorteio roda
    # sempre sobre a ordem (ano, clube), qualquer que seja a ordem de montagem, para que o Protótipo e esta aba
    # publiquem a mesma linha. Os gaps medidos não dependem da ordem das linhas (são médias por faixa).
    clubes_idx = postos.index.get_level_values("clube").astype(str).to_numpy()
    canonica = np.lexsort((clubes_idx, anos.astype(int)))
    sorte, gaps = linha_da_sorte(P[canonica], rotulos[canonica], anos[canonica], ordem, n_sorteios, semente, limiares)
    medias = _medias_por_grupo(P, rotulos, ordem)
    linha_sorte = sorte.pop("linha_sem_arredondar")

    linhas, ps, crus = [], [], []
    for j, ind in enumerate(indicadores):
        v, vb = P[:, j], B[:, j]
        # os p descontados SEM arredondar: o resumo conta com eles (ver `resumo`)
        cru = dict(p_dinheiro=np.nan, p_elenco=None)
        mt = (meta or {}).get(ind, {})
        g_ix, lado = _destoa(medias[:, j], ordem)
        L = dict(indicador=ind, coluna_csv=coluna_de(ind), nome=mt.get("nome", ind), familia=mt.get("familia"),
                 pilar=mt.get("pilar"), setor=mt.get("setor"),
                 n=int(np.isfinite(vb).sum()),
                 posicao_media={g: _r(medias[k, j], 1) for k, g in enumerate(ordem)},
                 mediana_crua=_medianas_para_a_tela(
                     {g: (np.nanmedian(vb[rotulos == g]) if np.isfinite(vb[rotulos == g]).any() else np.nan)
                      for g in ordem}, ind),
                 n_por_faixa={g: int(np.isfinite(v[rotulos == g]).sum()) for g in ordem},
                 gap=_r(gaps[j], 2))
        if g_ix is None:
            L.update(destoa=None, lado=None, tamanho=None, p=None,
                     motivo="faixa sem valor neste indicador: não há três médias para ordenar")
            ps.append(np.nan)
        else:
            alvo = rotulos == ordem[g_ix]
            # `lado` é a posição no ranking do valor CRU (posto alto = valor alto). Se isso é
            # bom ou ruim depende do sinal do indicador: em distância de remate, valor mais
            # baixo é MELHOR. O texto diz "valor mais alto/baixo" e o `lado_bom` diz o juízo.
            sinal = mt.get("sinal")
            # sinal vazio de CSV/pandas chega NaN: `not NaN` é falso e `NaN > 0` também, e a
            # linha afirmaria "pior" sem base. Não finito = sem lado declarado.
            if sinal is not None and not np.isfinite(float(sinal)):
                sinal = None
            assert sinal in (None, -1, 0, 1), f"{ind}: sinal {sinal} fora de -1/0/1"
            valor = "valor mais alto" if lado == "acima" else "valor mais baixo"
            if not sinal:
                lado_bom = "sem lado bom declarado"
            else:
                lado_bom = "melhor" if (lado == "acima") == (sinal > 0) else "pior"
            L.update(destoa=ordem[g_ix], lado=lado, lado_bom=lado_bom, sinal=sinal,
                     destoa_texto=(f"{nomes[ordem[g_ix]]}: {valor}"
                                   + ("" if not sinal else f" ({lado_bom})")),
                     tamanho=_r(_d_cohen(v[alvo], v[~alvo]), 3))
            p = _mw(v[alvo], v[~alvo])
            L["p"] = _r_sig(p, 3)
            ps.append(p)
            if r_val is None:
                L["p_descontado_dinheiro"] = None
                L["motivo_descontado_dinheiro"] = "sem valor de mercado neste universo"
            else:
                res = _residuo(v, [r_val])
                L["tamanho_descontado_dinheiro"] = _r(_d_cohen(res[alvo], res[~alvo]), 3)
                # o resíduo só existe onde indicador e valor existem: o n do desconto vai junto
                L["n_descontado_dinheiro"] = int(np.isfinite(res).sum())
                cru["p_dinheiro"] = _mw(res[alvo], res[~alvo])
                L["p_descontado_dinheiro"] = _r_sig(cru["p_dinheiro"], 3)
            if controles and ind in controles:
                nome_c, vc = controles[ind]
                if r_val is None:
                    res2 = _residuo(v, [vc])
                    L["controle_extra"] = nome_c
                else:
                    res2 = _residuo(v, [r_val, vc])
                    L["controle_extra"] = f"posto de valor + {nome_c}"
                L["tamanho_descontado_dinheiro_e_elenco"] = _r(_d_cohen(res2[alvo], res2[~alvo]), 3)
                L["n_descontado_dinheiro_e_elenco"] = int(np.isfinite(res2).sum())
                cru["p_elenco"] = _mw(res2[alvo], res2[~alvo])
                L["p_descontado_dinheiro_e_elenco"] = _r_sig(cru["p_elenco"], 3)
        mc = motivo_consequencia(mt.get("coluna_csv", ind))
        L["consequencia_do_resultado"] = bool(mc)
        if mc:
            L["motivo_consequencia"] = mc
        L["acima_da_linha_da_sorte"] = bool(np.isfinite(gaps[j]) and gaps[j] > linha_sorte)
        linhas.append(L)
        crus.append(cru)

    qs = _bh(ps)
    for L, q in zip(linhas, qs):
        L["q"] = _r_sig(q, 3)
    # Contagens do resumo com os valores CRUS, todas: `_r_sig(0,049996, 3)` = 0,05 e `abaixo(0,05, 0,05)`
    # é falso, então uma contagem com q cru e outra com q arredondado discordariam na borda.
    passa_q = [abaixo(q, 0.05) for q in qs]
    passa_din = [pq and abaixo(c["p_dinheiro"], 0.05) for pq, c in zip(passa_q, crus)]
    passa_forte = [pd_ and (c["p_elenco"] is None or abaixo(c["p_elenco"], 0.05)) for pd_, c in zip(passa_din, crus)]
    e_cons = [L["consequencia_do_resultado"] for L in linhas]

    if outro is not None:
        Po = outro["postos"]
        assert "anos" in outro, "o outro período precisa trazer `anos` para a guarda de 2026"
        # mesma regra do período principal: é a coluna "se repete?", a que dá credibilidade a um achado
        rot_o = f"outro período {outro.get('rotulo')}"
        _chave_dos_postos(Po, rot_o)
        ro = _alinhar_pela_chave(outro["rotulos"], Po.index, f"{rot_o}: rotulos", object)
        ao = _alinhar_pela_chave(outro["anos"], Po.index, f"{rot_o}: anos", object)
        assert np.array_equal(ao.astype(int), Po.index.get_level_values("ano").to_numpy().astype(int)), \
            f"{rot_o}: anos diferentes do nível `ano` do índice"
        _conferir_entrada(ao, Po, ro, ordem, ano_maximo, rot_o)
        comuns = [c for c in indicadores if c in Po.columns]
        if comuns:
            go, _ = _gaps(Po[comuns].values.astype(float), ro, ordem)
            mo = _medias_por_grupo(Po[comuns].values.astype(float), ro, ordem)
        pos_c = {c: k for k, c in enumerate(comuns)}
        for L in linhas:
            ind = L["indicador"]
            if ind not in pos_c:
                L["se_repete"] = "não dá para testar"
                L["outro_periodo"] = dict(rotulo=outro["rotulo"],
                                          motivo="o indicador não existe no outro período")
                continue
            k = pos_c[ind]
            vo = Po[ind].values.astype(float)
            info = dict(rotulo=outro["rotulo"], gap=_r(go[k], 2),
                        posicao_media={g: _r(mo[i, k], 1) for i, g in enumerate(ordem)})
            gi, ladoo = _destoa(mo[:, k], ordem)
            info["destoa"] = ordem[gi] if gi is not None else None
            info["lado"] = ladoo
            if L.get("destoa") is None:
                L["se_repete"] = "não dá para testar"
                info["motivo"] = "neste período nenhum grupo destoou"
            else:
                alvo = ro == L["destoa"]
                dd = _d_cohen(vo[alvo], vo[~alvo])
                pp = _mw(vo[alvo], vo[~alvo])
                info["mesmo_grupo_contra_o_resto"] = dict(grupo=L["destoa"], tamanho=_r(dd, 3),
                                                          p=_r_sig(pp, 3))
                mesmo_sinal = (np.isfinite(dd) and L["tamanho"] is not None
                               and np.sign(dd) == np.sign(L["tamanho"]))
                L["se_repete"] = "sim" if (mesmo_sinal and np.isfinite(pp) and pp < 0.05) else "não"
            L["outro_periodo"] = info

    linhas.sort(key=lambda L: -(L["gap"] if L["gap"] is not None else -1))
    for i, L in enumerate(linhas, 1):
        L["ordem"] = i
    n_testes = int(np.isfinite(ps).sum())
    resumo = dict(
        indicadores=len(indicadores), testes=n_testes,
        esperados_por_acaso_5pct=_r(0.05 * n_testes, 1),
        passam_5pct=int(sum(abaixo(p, 0.05) for p in ps)),
        sobrevivem_q_5pct=int(sum(passa_q)),
        # "sobrevivem" é o número de cabeçalho que se lê como "coisas que separam as faixas"; as linhas
        # marcadas "consequência do resultado" (quem ganha repete o XI) estão dentro dele e não são
        # receita. As duas contagens sem elas vão ao lado; as de cima ficam para conferir contra a prévia.
        sobrevivem_q_5pct_sem_consequencia=int(sum(1 for a, c in zip(passa_q, e_cons) if a and not c)),
        # O sobrevivente conta só depois do desconto MAIS FORTE que existe para a linha: nas
        # físicas (média por atleta rastreado), dinheiro E número de atletas — é o desconto que
        # derrubou os físicos do topo da prévia. A contagem só com dinheiro vai ao lado, com
        # outro nome, para conferir contra a prévia do PENDENTE (item 6).
        sobrevivem_q_e_dinheiro=(None if r_val is None else int(sum(passa_forte))),
        sobrevivem_q_e_dinheiro_sem_consequencia=(
            None if r_val is None else int(sum(1 for a, c in zip(passa_forte, e_cons) if a and not c))),
        regra_das_contagens=("todas com os valores crus (q, p e p descontados antes do arredondamento); "
                             "`_sem_consequencia` tira as linhas com consequencia_do_resultado"),
        regra_sobrevivem_q_e_dinheiro=("q < 0,05 e p < 0,05 no desconto mais forte da linha: dinheiro; nas "
                                       "linhas físicas, dinheiro e nº de atletas rastreados"),
        sobrevivem_q_e_so_dinheiro_sem_desconto_de_elenco=(
            None if r_val is None else
            int(sum(passa_din))),
        motivo_sobrevivem_q_e_dinheiro=(None if r_val is not None else
                                        "sem valor de mercado neste universo: não há desconto de dinheiro"),
        consequencia_do_resultado=int(sum(1 for L in linhas if L["consequencia_do_resultado"])),
        acima_da_linha_da_sorte=int(sum(1 for L in linhas if L["acima_da_linha_da_sorte"])))
    if outro is not None:
        resumo["se_repete"] = {k: int(sum(1 for L in linhas if L.get("se_repete") == k))
                               for k in ("sim", "não", "não dá para testar")}
    return dict(
        universo=rotulo_universo, faixas=list(ordem), nomes_das_faixas=nomes,
        linhas_por_faixa={g: int((rotulos == g).sum()) for g in ordem},
        regra_do_gap=("posição média no ranking do ano (0 a 100) de cada faixa; gap = maior "
                      "menos menor"),
        regra_de_quem_destoa=("das três faixas ordenadas pela posição média no indicador, a ponta mais "
                              "longe da faixa de posição média INTERMEDIÁRIA — que pode ser qualquer "
                              "faixa, então quem destoa pode ser a faixa média da régua; o p é desse "
                              "grupo contra o resto, Mann-Whitney bilateral no posto do ano, e é "
                              "otimista porque a ponta foi escolhida depois de olhar"),
        regra_do_lado=("lado = posição no ranking do valor cru (acima = valor mais alto); lado_bom lê o "
                       "sinal do indicador (sinal -1: valor mais baixo é melhor; sinal 0: sem lado bom)"),
        teste="Mann-Whitney bilateral no percentil dentro do ano (ordinal); tamanho = d de Cohen no percentil",
        regra_do_q=f"Benjamini-Hochberg nos {n_testes} testes desta tabela",
        regra_do_desconto=("resíduo do posto do indicador no posto de valor do elenco "
                           "(e no posto de atletas rastreados nas linhas físicas), mínimos "
                           "quadrados; o mesmo grupo contra o resto"),
        regra_se_repete=("no outro período, o mesmo grupo contra o resto com o mesmo sinal e "
                         "p < 0,05 = sim; presente sem isso = não; ausente = não dá para testar"),
        listas=dict(versao=VERSAO_DAS_LISTAS,
                    circulares_recusadas="a função quebra se receber coluna da lista de resultado"),
        linha_da_sorte=sorte, resumo=resumo, linhas=linhas)


def autoteste_do_alinhamento(n_sorteios=20):
    """Prova que `tabela_de_gaps` alinha pela CHAVE e recusa vetor sem índice. Quebra se não.

    Painel sintético (4 anos × 12 clubes), com um indicador que separa as faixas de propósito. O caso da
    conferência de 14/09: `postos.sort_index()` com os rótulos em `.values` (na ordem ANTIGA das linhas)
    tem de ser RECUSADO — na versão anterior passava calado e zerava a contagem de sobreviventes. E a mesma
    chamada com Series, com os postos em qualquer ordem, tem de dar as mesmas linhas.
    """
    gen = np.random.default_rng([7, 23, 4])
    anos = np.repeat([2022, 2023, 2024, 2025], 12)
    clubes = np.tile([f"c{i:02d}" for i in range(12)], 4)
    faixa = np.tile(["alta"] * 4 + ["media"] * 4 + ["baixa"] * 4, 4)
    painel = pd.DataFrame(dict(ano=anos, clube=clubes, faixa=faixa,
                               # a média fica mais perto da baixa: com as três equidistantes, quem destoa
                               # seria um empate decidido pelo arredondamento da soma, não pelo dado
                               forte=np.where(faixa == "alta", 3.0, np.where(faixa == "media", 0.6, 0.0))
                               + gen.normal(0, 0.3, len(anos)),
                               ruido=gen.normal(0, 1, len(anos))))
    painel = painel.sample(frac=1, random_state=3).reset_index(drop=True)   # a ordem das linhas não é (ano, clube)
    idx = pd.MultiIndex.from_frame(painel[["ano", "clube"]])
    bruto = pd.DataFrame(painel[["forte", "ruido"]].to_numpy(), columns=["forte", "ruido"], index=idx)
    postos = bruto.groupby(level="ano").rank(pct=True) * 100
    kw = dict(indicadores=["forte", "ruido"], ordem=("alta", "media", "baixa"), n_sorteios=n_sorteios, ano_maximo=2025)

    def chamar(p, b, anos_, rot_):
        return tabela_de_gaps(anos_, p, b, rot_, **kw)

    base = chamar(postos, bruto, pela_chave(painel, "ano"), pela_chave(painel, "faixa"))
    ordenado = chamar(postos.sort_index(), bruto.sort_index(), pela_chave(painel, "ano"), pela_chave(painel, "faixa"))
    campos = ("indicador", "gap", "p", "q", "destoa", "tamanho", "mediana_crua")
    assert [tuple(L[c] for c in campos) for L in base["linhas"]] == \
        [tuple(L[c] for c in campos) for L in ordenado["linhas"]], "a ordem das linhas mudou o resultado"
    # Fechamento (14/09): a linha da sorte e as marcas acima dela também não podem depender da ordem. A versão
    # anterior deste autoteste não comparava esse bloco, e por isso não pegou que ele mudava (37,58 / 37,78 /
    # 37,82 / 37,19 no dado real). Três ordens: a embaralhada, a (ano, clube) e a invertida.
    invertido = chamar(postos.iloc[::-1], bruto.iloc[::-1], pela_chave(painel, "ano"), pela_chave(painel, "faixa"))
    for outra, nome in ((ordenado, "sort_index"), (invertido, "invertida")):
        assert outra["linha_da_sorte"] == base["linha_da_sorte"], ("a ordem das linhas mudou a linha da sorte", nome)
        assert [(L["indicador"], L["acima_da_linha_da_sorte"]) for L in outra["linhas"]] == \
            [(L["indicador"], L["acima_da_linha_da_sorte"]) for L in base["linhas"]], ("marca acima da sorte mudou", nome)
    assert base["resumo"]["sobrevivem_q_5pct"] >= 1, "o indicador plantado não separou: o teste não prova nada"
    recusas = (("postos.sort_index() com rótulos .values",
                lambda: chamar(postos.sort_index(), bruto.sort_index(), pela_chave(painel, "ano"),
                               painel.faixa.values)),
               ("rótulos .values na ordem certa", lambda: chamar(postos, bruto, pela_chave(painel, "ano"),
                                                                 painel.faixa.values)),
               ("anos .values", lambda: chamar(postos, bruto, painel.ano.values, pela_chave(painel, "faixa"))),
               ("postos sem chave", lambda: chamar(postos.reset_index(drop=True), bruto.reset_index(drop=True),
                                                   pela_chave(painel, "ano"), pela_chave(painel, "faixa"))),
               ("outro período com rótulos .values",
                lambda: tabela_de_gaps(pela_chave(painel, "ano"), postos, bruto, pela_chave(painel, "faixa"),
                                       outro=dict(postos=postos.sort_index(), rotulos=painel.faixa.values,
                                                  anos=pela_chave(painel, "ano"), rotulo="x"), **kw)))
    for rotulo, f in recusas:
        try:
            f()
        except AssertionError:
            continue
        raise AssertionError(("o alinhamento aceitou um vetor sem chave", rotulo))
    return [r for r, _ in recusas]
