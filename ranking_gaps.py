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
As poucas ferramentas estatísticas de que ele precisa (d de Cohen, Welch, BH, resíduo)
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

Com três faixas ordenadas pela posição média, o grupo que destoa é o da ponta que está
MAIS LONGE do grupo do meio. É uma escolha feita DEPOIS de olhar o dado (qual das duas
pontas), e por isso o p dele contra o resto é otimista — o `q` com o desconto dos N testes
vai ao lado, e a linha da sorte, que não escolhe grupo nenhum (mede só o gap), é a régua
que não sofre desse viés.
"""
import re

import numpy as np
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
PLACAR_INDIVIDUAL = re.compile(r"^(Golos(?! esperados)|Assist[eê]ncias(?! esperadas)|Golos/90"
                               r"|Assist[eê]ncias/90)")


def motivo_resultado(col):
    """Motivo pelo qual `col` é pedaço do resultado, ou None se não for."""
    if col in RESULTADO:
        return RESULTADO[col]
    if col in DERIVADO_DE_GOLS:
        return DERIVADO_DE_GOLS[col]
    for padrao, motivo in PADROES_RESULTADO:
        if padrao.search(str(col)):
            return motivo
    if PLACAR_INDIVIDUAL.search(str(col)):
        return "placar individual"
    return None


def e_resultado(col):
    return motivo_resultado(col) is not None


def motivo_consequencia(col):
    return CONSEQUENCIA.get(col)


def listas_declaradas():
    """As listas como vão ao JSON: para que a tela mostre o que ficou de fora e por quê."""
    return dict(
        versao=VERSAO_DAS_LISTAS,
        resultado=[dict(coluna=c, motivo=m) for c, m in RESULTADO.items()],
        padroes_resultado=[dict(padrao=p.pattern, motivo=m) for p, m in PADROES_RESULTADO],
        derivado_de_gols=[dict(coluna=c, motivo=m) for c, m in DERIVADO_DE_GOLS.items()],
        consequencia=[dict(coluna=c, motivo=m) for c, m in CONSEQUENCIA.items()],
        placar_do_jogo_a_jogo=sorted(PLACAR_JOGO),
        placar_individual=PLACAR_INDIVIDUAL.pattern)


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
    """p por algarismo significativo: um p de 1e-8 em 4 casas vira 0, e p nunca é zero."""
    if x is None:
        return None
    v = float(x)
    if not np.isfinite(v):
        return None
    return 0.0 if v == 0 else float(f"{v:.{sig - 1}e}")


def _d_cohen(a, b):
    a, b = np.asarray(a, float), np.asarray(b, float)
    a, b = a[np.isfinite(a)], b[np.isfinite(b)]
    if len(a) < 2 or len(b) < 2:
        return np.nan
    s = np.sqrt(((len(a) - 1) * a.var(ddof=1) + (len(b) - 1) * b.var(ddof=1))
                / (len(a) + len(b) - 2))
    return np.nan if not s else (a.mean() - b.mean()) / s


def _welch(a, b):
    a, b = np.asarray(a, float), np.asarray(b, float)
    a, b = a[np.isfinite(a)], b[np.isfinite(b)]
    if len(a) < 2 or len(b) < 2:
        return np.nan
    return float(stats.ttest_ind(a, b, equal_var=False).pvalue)


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


def tabela_de_gaps(anos, postos, bruto, rotulos, indicadores, ordem, *,
                   r_val=None, controles=None, meta=None, outro=None,
                   rotulo_universo=None, n_sorteios=1000, semente=(7, 23),
                   limiares=(20, 25, 30), nomes_das_faixas=None):
    """A TABELA DE TODAS AS DIFERENÇAS, do maior gap para o menor.

    Parâmetros
    - `anos`: vetor do ano de cada linha (o sorteio e o posto são dentro do ano).
    - `postos`: DataFrame (linhas × indicadores) com o percentil 0-100 dentro do ano.
    - `bruto`: DataFrame com o valor cru, mesma forma (para a mediana crua de cada faixa).
    - `rotulos`: faixa de cada linha, com os nomes de `ordem`.
    - `indicadores`: lista de colunas. Coluna da lista de resultado QUEBRA a função.
    - `r_val`: posto de valor do elenco por linha, ou None (sem dinheiro no universo: a
      coluna descontada sai null com motivo).
    - `controles`: {indicador: (nome, vetor)} — controle extra ao lado do dinheiro (nº de
      atletas rastreados nas linhas físicas).
    - `meta`: {indicador: dict(nome, familia, pilar, setor)} opcional.
    - `outro`: dict(anos, postos, rotulos, rotulo) — o outro período, para a coluna "se
      repete?". Critério declarado aqui, antes de rodar: no outro período, o MESMO grupo
      que destoou neste, contra o resto, com o mesmo sinal e p < 0,05 → "sim"; indicador
      presente mas sem isso → "não"; indicador ausente → "não dá para testar".
    """
    circulares = [c for c in indicadores if e_resultado(c)]
    assert not circulares, ("indicador que é pedaço do resultado entrou na tabela de gaps",
                            circulares)
    ordem = tuple(ordem)
    nomes = nomes_das_faixas or {g: g for g in ordem}
    rotulos = np.asarray(rotulos, dtype=object)
    anos = np.asarray(anos)
    P = postos[indicadores].values.astype(float)
    B = bruto[indicadores].values.astype(float)
    sorte, gaps = linha_da_sorte(P, rotulos, anos, ordem, n_sorteios, semente, limiares)
    medias = _medias_por_grupo(P, rotulos, ordem)
    linha_sorte = sorte["linha"]

    linhas, ps = [], []
    for j, ind in enumerate(indicadores):
        v, vb = P[:, j], B[:, j]
        mt = (meta or {}).get(ind, {})
        g_ix, lado = _destoa(medias[:, j], ordem)
        L = dict(indicador=ind, nome=mt.get("nome", ind), familia=mt.get("familia"),
                 pilar=mt.get("pilar"), setor=mt.get("setor"),
                 n=int(np.isfinite(vb).sum()),
                 posicao_media={g: _r(medias[k, j], 1) for k, g in enumerate(ordem)},
                 mediana_crua={g: _r(np.nanmedian(vb[rotulos == g])
                                     if np.isfinite(vb[rotulos == g]).any() else np.nan, 3)
                               for g in ordem},
                 n_por_faixa={g: int(np.isfinite(v[rotulos == g]).sum()) for g in ordem},
                 gap=_r(gaps[j], 2))
        if g_ix is None:
            L.update(destoa=None, lado=None, tamanho=None, p=None,
                     motivo="faixa sem valor neste indicador: não há três médias para ordenar")
            ps.append(np.nan)
        else:
            alvo = rotulos == ordem[g_ix]
            L.update(destoa=ordem[g_ix], lado=lado,
                     destoa_texto=f"{nomes[ordem[g_ix]]} {lado}",
                     tamanho=_r(_d_cohen(v[alvo], v[~alvo]), 3))
            p = _welch(v[alvo], v[~alvo])
            L["p"] = _r_sig(p, 3)
            ps.append(p)
            if r_val is None:
                L["p_descontado_dinheiro"] = None
                L["motivo_descontado_dinheiro"] = "sem valor de mercado neste universo"
            else:
                res = _residuo(v, [r_val])
                L["tamanho_descontado_dinheiro"] = _r(_d_cohen(res[alvo], res[~alvo]), 3)
                L["p_descontado_dinheiro"] = _r_sig(_welch(res[alvo], res[~alvo]), 3)
            if controles and ind in controles:
                nome_c, vc = controles[ind]
                if r_val is None:
                    res2 = _residuo(v, [vc])
                    L["controle_extra"] = nome_c
                else:
                    res2 = _residuo(v, [r_val, vc])
                    L["controle_extra"] = f"posto de valor + {nome_c}"
                L["tamanho_descontado_dinheiro_e_elenco"] = _r(_d_cohen(res2[alvo], res2[~alvo]), 3)
                L["p_descontado_dinheiro_e_elenco"] = _r_sig(_welch(res2[alvo], res2[~alvo]), 3)
        mc = motivo_consequencia(mt.get("coluna_csv", ind))
        L["consequencia_do_resultado"] = bool(mc)
        if mc:
            L["motivo_consequencia"] = mc
        L["acima_da_linha_da_sorte"] = bool(np.isfinite(gaps[j]) and gaps[j] > linha_sorte)
        linhas.append(L)

    qs = _bh(ps)
    for L, q in zip(linhas, qs):
        L["q"] = _r_sig(q, 3)

    if outro is not None:
        Po = outro["postos"]
        ro = np.asarray(outro["rotulos"], dtype=object)
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
                pp = _welch(vo[alvo], vo[~alvo])
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
        passam_5pct=int(np.nansum(np.asarray(ps) < 0.05)),
        sobrevivem_q_5pct=int(np.nansum(qs < 0.05)),
        sobrevivem_q_e_dinheiro=(None if r_val is None else
                                 int(sum(1 for L in linhas if (L["q"] or 1) < 0.05
                                         and (L.get("p_descontado_dinheiro") or 1) < 0.05))),
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
        regra_de_quem_destoa=("a ponta (maior ou menor posição média) mais longe da faixa do "
                              "meio; o p é desse grupo contra o resto, Welch no posto do ano, "
                              "e é otimista porque a ponta foi escolhida depois de olhar"),
        regra_do_q=f"Benjamini-Hochberg nos {n_testes} testes desta tabela",
        regra_do_desconto=("resíduo do posto do indicador no posto de valor do elenco "
                           "(e no posto de atletas rastreados nas linhas físicas), mínimos "
                           "quadrados; o mesmo grupo contra o resto"),
        regra_se_repete=("no outro período, o mesmo grupo contra o resto com o mesmo sinal e "
                         "p < 0,05 = sim; presente sem isso = não; ausente = não dá para testar"),
        listas=dict(versao=VERSAO_DAS_LISTAS,
                    circulares_recusadas="a função quebra se receber coluna da lista de resultado"),
        linha_da_sorte=sorte, resumo=resumo, linhas=linhas)
