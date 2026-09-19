#!/usr/bin/env python3
"""J08, passo 1 — a base da conversão de ligas.

Monta a base de transferências que a parte J08 vai testar, e mais nada: aqui não se estima
fator de liga nenhum. A lista de indicadores já está fechada em `resultados/J08_indicadores.json`,
declarada ANTES de qualquer conta (regra da casa).

Escreve, e só:
    resultados/J08_base.csv        uma linha por transferência para o futebol brasileiro
Lê, e não altera:
    _fonte/estudo_serieb/dados_copiados/wyscout/_temporal_movers.json
    _fonte/estudo_serieb/dados_copiados/wyscout/_temporal_photos.json
    _fonte/estudo_serieb/dados_copiados/wyscout/_temporal_aging.json
    dados/prototipo.json (só a chave etapa_11, para provar que a lista veio de lá)
    os Excels do Wyscout por (período, liga) — ver "De onde vêm os Excels"

## O que esta base responde, e o que ela deliberadamente não faz

Uma linha = um jogador que saiu de uma liga de origem numa temporada e apareceu em Brasil A,
Brasil B ou Brasil C numa temporada seguinte, com o ANTES e o DEPOIS lado a lado. O fator por
liga, o agrupamento por nível e o `fatores_liga.csv` são do passo seguinte.

## Por que o destino são as três divisões, e não só a Série B

Com destino só Série B, nenhuma liga estrangeira chega ao piso de 10 casos que o próprio J08
exige (a maior é Portugal A, com 8) — está medido e registrado no `_registro.md` de 19/09. O
J08 do CLAUDE.md autoriza os três destinos ("Série B e, se houver base, Série A" e "O mesmo
método vale para a Série C"). Com os três, sete ligas estrangeiras passam do piso. O destino
fica como COLUNA, nunca dissolvido: chegar à Série A não é chegar à Série B, e a escada
brasileira já medida (A→B e C→B) é a âncora que converte um no outro no passo seguinte.

## Quem não chegou a 900 minutos no destino ENTRA

É a ordem do J08 ("Incluir quem não chegou a 900 minutos no destino, reportado à parte, para
não olhar só os casos que deram certo") e é o erro mais caro que esta parte pode cometer. Eles
entram, marcados em `menos_900_no_destino`, e a régua de percentil continua sendo a dos 900+:
o jogador de 400 minutos é POSICIONADO na régua dos titulares, não admitido nela.

## As duas armadilhas de idade, e por que a segunda não estava registrada

O `_registro.md` avisa que a idade do Wyscout é a da extração, não a da temporada, e dá a
fórmula `real = idade − (ano_extração − ano_temporada)`. Conferido aqui, o ano de extração
NÃO é o ano do nome da pasta, e não é o mesmo para todas as ligas de um mesmo período:

    período 2018–2021  defasagem 0  (export histórico, feito em 2026)
    período 2022       defasagem 0 em Brasil A, ~4 nas seis ligas sul-americanas
    períodos 2023/2024 defasagem 2 a 3, com ligas de 2024 em 0 (backfill)
    período 2025       defasagem 0
    período jun26      defasagem 0 (é a referência)

Aplicar a fórmula com o ano da pasta punha um jogador de 21 anos no bin etário de 29. Por isso
a defasagem é MEDIDA aqui, por (período, liga), comparando a idade do período com a idade em
jun26 dos jogadores comuns (mínimo de 20 pares). Daí sai `ano_extração = 2026 − defasagem` e a
idade da temporada. As colunas cruas e a defasagem usada ficam na base, para conferência.

## A idade corrigida denuncia homônimo no painel de origem

A guarda de homônimo do `temporal.py` compara idades de EXTRAÇÃO com tolerância de 2 anos, e
com idade de extração ela quase não filtra nada. Com a idade da temporada dá para conferir o
que ela deixou passar: numa transferência de verdade, a idade tem de avançar tantos anos
quantos separam as duas temporadas. A base traz `dif_idade_vs_anos` e marca `idade_incoerente`
quando a diferença é de 2 anos ou mais. Não são apagados — vão marcados, e o passo do fator
roda com e sem eles.

## O envelhecimento, e por que a base traz DUAS contas

Quem troca de liga também envelhece, e o `dqz` mistura as duas coisas. O desconto é
`esperado = cumulativa(idade no destino) − cumulativa(idade na origem)` pela curva da
posição-raiz, interpolada entre os bins de 2 anos.

A curva do `_temporal_aging.json` foi construída com a idade NÃO corrigida (o `temporal.py` do
Portal Ranking usa `mid = média das idades dos dois lados`, e essas idades são de extração): o
eixo etário dela está deslocado. Então a base traz o desconto pelas duas — a curva do arquivo e
uma recalculada aqui com idade corrigida, pelo mesmo método (Δqz/ano intra-liga, bins de 2 anos,
peso = média harmônica de minutos, mínimo de 20 pares por bin). A distância entre as duas é a
medida do estrago, e ela vai no relatório do console.

O desconto vale para o COMPOSTO `qz`. Não existe curva de envelhecimento por indicador, então o
Δpercentil de cada indicador continua misturando liga e idade — por isso a base carrega a idade
corrigida dos dois lados e o Δidade, para que no passo do fator a idade entre como covariável,
não como desconto prévio. Está declarado em J08_indicadores.json.

## O Excel do período é MUTÁVEL — a armadilha que faltava no registro

`filtrar_minutos.py`, do Portal Ranking, SOBRESCREVE o xlsx do período com uma versão sem os
jogadores abaixo de `max(jogos) × 90 × pct%` e guarda o original em `<periodo>/_pre_filtro/`.
Hoje só o período `jun26` está filtrado (64 das 65 ligas têm backup): o Brasil A de jun26 tem
292 linhas no arquivo e 500 no `_pre_filtro`. Num período de temporada cheia o limiar passaria
de 1.000 minutos e comeria a própria régua dos 900+. Por isso este script lê `_pre_filtro/`
sempre que ele existir, e só cai no arquivo do período quando não existir. É também o que faz a
base ser reproduzível: `_pre_filtro/` é o export cru e é idempotente.

## Dois controles, e eles NÃO se somam

A base traz duas contas do mesmo confundimento, e elas são alternativas:

  `dqz_ajustado_idade`  = dqz menos o envelhecimento esperado pela curva da posição.
  `dqz_liquido`         = qz no destino menos o qz que um jogador do MESMO nível teria se
                          tivesse FICADO na liga de origem (reta de quem ficou).

A segunda já absorve o envelhecimento, porque quem fica também envelhece, e absorve ainda a
regressão à média — que é a ressalva mais séria desta parte. Aplicar as duas em cima da outra
desconta a idade duas vezes. O passo do fator escolhe uma e diz qual.

## De onde vêm os Excels

Cada lado da transferência precisa do Excel do Wyscout da liga naquele período. São 112 pares
(período, liga). Deste repositório só foi copiado o período `ago26`, que NÃO serve: o painel
temporal que gerou os movers vai até `jun26`, e `ago26` é uma extração posterior da mesma
temporada. O script resolve a fonte nesta ordem:

    1) _fonte/estudo_serieb/dados_copiados/wyscout/xlsx_<periodo>/   (quando existir)
    2) <Portal Ranking>/dados/<periodo>/                              (somente leitura)

e imprime, por período, qual usou. Nada é copiado por este script. Os períodos lidos fora do
repositório estão declarados para cópia pelo fluxo principal; enquanto não forem copiados, a
base é reproduzível só nesta máquina.

Uso:
    python3 "_fonte/estudo_serieb/scripts/J08_base.py"
"""
import bisect
import collections
import csv
import datetime as dt
import json
import os
import re
import statistics
import unicodedata

import openpyxl

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
COP = os.path.join(ESTUDO, "dados_copiados", "wyscout")

# Fonte externa, SOMENTE LEITURA, para os períodos que ainda não foram copiados.
PORTAL = os.path.join(os.path.dirname(RAIZ),
                      "fut", "BOTA", "Analytics", "Portal Ranking", "dados")

# O painel temporal do Portal Ranking (ranking_v2/temporal.py::SEASONS e YEAR).
PERIODO_ANO = {"2018": 2018, "2019": 2019, "2020": 2020, "2021": 2021, "2022": 2022,
               "2023": 2023, "2024": 2024, "2025": 2025, "jun26": 2026}
ANO_PERIODO = {v: k for k, v in PERIODO_ANO.items()}
PREFIXO = {"2018": "01-01-2018", "2019": "01-01-2019", "2020": "01-01-2020",
           "2021": "01-01-2021", "2022": "01-01-2022", "2023": "01-01-2023",
           "2024": "01-01-2024", "2025": "01-01-2025", "jun26": "06-01-2026"}
PERIODO_REF = "jun26"          # âncora da idade: extração de 2026
ANO_REF = 2026

DESTINOS = ["Brasil A", "Brasil B", "Brasil C"]
MIN_REGUA = 900                # CLAUDE.md: percentil só para quem tem 900+ minutos
FRACAO_REGUA = 900 / (38 * 90)  # 0,263 — os mesmos 900 min ditos como fatia da temporada
MIN_REGUA_PISO = 240            # abaixo disto a régua não é régua; a liga-período fica sem
MIN_PARES_DEFASAGEM = 20       # pares comuns exigidos para medir a defasagem de idade
REGUA_CURTA = 10               # abaixo disso o percentil é frágil e vai marcado
AGE_BIN = 2                    # temporal.py::AGE_BIN
MIN_PARES_BIN = 20             # temporal.py::MIN_PARES_BIN
AGE_TOL = 1.0                  # com idade corrigida a guarda de homônimo pode ser apertada
DIF_IDADE_SUSPEITA = 2         # |Δidade − anos entre as temporadas| daqui p/ cima: outra pessoa
MIN_PARES_FICOU = 200          # pares mínimos p/ ajustar a reta de quem ficou, por posição

# ---------------------------------------------------------------------------
# A lista pré-declarada. Vem de resultados/J08_indicadores.json e nada é escolhido aqui.
# ---------------------------------------------------------------------------
IND = os.path.join(R, "J08_indicadores.json")


def carregar_indicadores():
    d = json.load(open(IND, encoding="utf-8"))
    fams = []
    for f in d["familias"]:
        if not f.get("montavel"):
            continue
        fams.append((f["id"], [(i["id"], i["coluna"]) for i in f["indicadores"]]))
    return d, fams


def nkey(s):
    """Normalização de nome. Tira o sufixo de homônimo do Wyscout ('Nome (ZAG)'),
    como manda o _registro.md, antes de cruzar."""
    s = unicodedata.normalize("NFKD", str(s))
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"\s*\([^)]*\)\s*$", "", s)
    s = re.sub(r"[^a-z0-9 ]", " ", s.lower())
    return re.sub(r"\s+", " ", s).strip()


def num(v):
    if v is None or v == "":
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return f if f == f else None          # NaN fora


# ---------------------------------------------------------------------------
# 1. Os Excels, por (período, liga)
# ---------------------------------------------------------------------------
COL_CLUBE = "Team within selected timeframe"   # _registro.md: NUNCA "Team"


def caminho_xlsx(periodo, liga):
    """(caminho, de_onde). Copiado primeiro; Portal Ranking, só leitura, depois. Dentro de
    cada lugar, `_pre_filtro/` PRIMEIRO — ver "O Excel do período é mutável"."""
    nome = f"{PREFIXO[periodo]}_{liga}.xlsx"
    for raiz, rotulo in ((os.path.join(COP, f"xlsx_{periodo}"), "copiado"),
                         (os.path.join(PORTAL, periodo), "portal_ranking")):
        pf = os.path.join(raiz, "_pre_filtro", nome)
        if os.path.exists(pf):
            return pf, rotulo + "/_pre_filtro"
        p = os.path.join(raiz, nome)
        if os.path.exists(p):
            return p, rotulo
    return None, "ausente"


_cache_xlsx = {}
_cache_limiar = {}


def limiar_regua(periodo, liga, colunas):
    """Quantos minutos entram na régua daquela liga-período.

    A regra declarada é 900. Ela supõe temporada cheia, e há duas em que isso é falso: a
    Série C tem calendário curto e o período `jun26` é temporada EM CURSO (no Brasil C de
    jun26 o jogador de mais minutos tem 909, e a régua dos 900+ teria UM jogador). Então o
    corte é a mesma fatia de temporada que 900 representa num campeonato de 38 rodadas
    (0,263 do máximo possível), com teto nos 900 declarados: em temporada cheia e longa dá
    exatamente 900, e só afrouxa onde a temporada é curta ou está pela metade."""
    ch = (periodo, liga)
    if ch in _cache_limiar:
        return _cache_limiar[ch]
    tab, _ = ler_xlsx(periodo, liga, colunas)
    jogos = [r["_jogos"] for lst in tab.values() for r in lst if r["_jogos"]]
    if not jogos:
        _cache_limiar[ch] = MIN_REGUA
        return MIN_REGUA
    _cache_limiar[ch] = int(min(MIN_REGUA, round(FRACAO_REGUA * max(jogos) * 90)))
    return _cache_limiar[ch]


def ler_xlsx(periodo, liga, colunas):
    """{(nkey, clube): {coluna: valor}} da aba BASE, só com as colunas da lista."""
    ch = (periodo, liga)
    if ch in _cache_xlsx:
        return _cache_xlsx[ch]
    caminho, de_onde = caminho_xlsx(periodo, liga)
    if caminho is None:
        _cache_xlsx[ch] = ({}, "ausente")
        return _cache_xlsx[ch]
    wb = openpyxl.load_workbook(caminho, read_only=True, data_only=True)
    ws = wb["BASE"]
    it = ws.iter_rows(values_only=True)
    hdr = list(next(it))
    faltando = [c for c in colunas if c not in hdr]
    if faltando:
        raise SystemExit(f"[PARA] {periodo}/{liga}: faltam colunas {faltando}")
    pos = {c: hdr.index(c) for c in list(colunas) + ["Player", COL_CLUBE, "Minutes played",
                                                     "Matches played", "Age", "Position"]}
    out = collections.defaultdict(list)
    for row in it:
        if row[pos["Player"]] is None:
            continue
        reg = {c: num(row[pos[c]]) for c in colunas}
        reg["_clube"] = str(row[pos[COL_CLUBE]] or "")
        reg["_min"] = num(row[pos["Minutes played"]])
        reg["_jogos"] = num(row[pos["Matches played"]])
        reg["_idade_arquivo"] = num(row[pos["Age"]])
        reg["_posicao"] = str(row[pos["Position"]] or "")
        reg["_player"] = str(row[pos["Player"]])
        out[nkey(row[pos["Player"]])].append(reg)
    wb.close()
    _cache_xlsx[ch] = (dict(out), de_onde)
    return _cache_xlsx[ch]


def linha_xlsx(periodo, liga, colunas, nome, clube, minutos):
    """A linha do jogador. Homônimo no mesmo Excel é resolvido pelo clube e, se
    ainda empatar, pelos minutos — nunca adivinhado."""
    tab, de_onde = ler_xlsx(periodo, liga, colunas)
    c = tab.get(nkey(nome), [])
    if len(c) == 1:
        return c[0], "único"
    if not c:
        return None, "sem linha no Excel"
    m = [r for r in c if r["_clube"] == clube]
    if len(m) == 1:
        return m[0], "homônimo resolvido pelo clube"
    base = m or c
    m2 = [r for r in base if r["_min"] == minutos]
    if len(m2) == 1:
        return m2[0], "homônimo resolvido pelos minutos"
    return None, f"homônimo não resolvido ({len(c)} linhas)"


# ---------------------------------------------------------------------------
# 2. A defasagem de idade, medida por (período, liga)
# ---------------------------------------------------------------------------
def medir_defasagem(fotos):
    """defasagem(período, liga) = mediana de (idade em jun26 − idade no período) entre os
    jogadores comuns. ano_extração = 2026 − defasagem. Com menos de 20 pares cai para a
    mediana do período; sem isso, para 0 (= extraído em 2026), e o motivo vai na base."""
    por = collections.defaultdict(dict)
    for per, linhas in fotos.items():
        for f in linhas:
            if f["age"] is not None:
                por[(per, f["league"])][(f["nkey"], f["root"])] = f["age"]
    ref = {liga: d for (per, liga), d in por.items() if per == PERIODO_REF}
    defas, origem = {}, {}
    for (per, liga), d in por.items():
        if per == PERIODO_REF:
            defas[(per, liga)], origem[(per, liga)] = 0.0, "referência"
            continue
        a = ref.get(liga, {})
        difs = [a[k] - d[k] for k in set(d) & set(a)]
        if len(difs) >= MIN_PARES_DEFASAGEM:
            defas[(per, liga)] = float(round(statistics.median(difs)))
            origem[(per, liga)] = f"medida ({len(difs)} pares)"
    por_periodo = collections.defaultdict(list)
    for (per, liga), v in defas.items():
        por_periodo[per].append(v)
    for (per, liga) in por:
        if (per, liga) in defas:
            continue
        if por_periodo.get(per):
            defas[(per, liga)] = float(round(statistics.median(por_periodo[per])))
            origem[(per, liga)] = "mediana do período (poucos pares na liga)"
        else:
            defas[(per, liga)] = 0.0
            origem[(per, liga)] = "sem medida: assumido 2026"
    return defas, origem


def idade_na_temporada(idade_arquivo, periodo, liga, defas):
    if idade_arquivo is None:
        return None
    ano_extracao = ANO_REF - defas.get((periodo, liga), 0.0)
    return round(idade_arquivo - (ano_extracao - PERIODO_ANO[periodo]), 1)


# ---------------------------------------------------------------------------
# 3. A curva de envelhecimento, recalculada com idade corrigida
# ---------------------------------------------------------------------------
def curva_corrigida(fotos, defas):
    """Mesmo método de ranking_v2/temporal.py::aging_curves, com a idade da temporada
    no lugar da idade de extração. Devolve {root: {"per_bin": ..., "cumulative": ...}}."""
    tracks = collections.defaultdict(list)
    for per, linhas in fotos.items():
        for f in linhas:
            tracks[(f["nkey"], f["root"])].append({
                "year": PERIODO_ANO[per], "league": f["league"], "qz": f["qz"],
                "minutes": f["minutes"],
                "idade": idade_na_temporada(f["age"], per, f["league"], defas),
            })
    deltas = collections.defaultdict(list)
    for (nk_, root), ph in tracks.items():
        ph.sort(key=lambda x: x["year"])
        for a, b in zip(ph, ph[1:]):
            dyr = b["year"] - a["year"]
            if dyr < 1 or dyr > 2 or a["league"] != b["league"]:
                continue
            if a["idade"] is None or b["idade"] is None:
                continue
            # guarda de homônimo: com idade corrigida ela avança com o ano
            if abs((b["idade"] - a["idade"]) - dyr) > AGE_TOL:
                continue
            m1, m2 = a["minutes"], b["minutes"]
            w = 2.0 * m1 * m2 / (m1 + m2) if (m1 + m2) > 0 else 0.0
            deltas[root].append((0.5 * (a["idade"] + b["idade"]), (b["qz"] - a["qz"]) / dyr, w))
    curvas = {}
    for root, arr in deltas.items():
        por_bin = collections.defaultdict(list)
        for mid, dq, w in arr:
            por_bin[int(mid // AGE_BIN) * AGE_BIN].append((dq, w))
        pb = {}
        for bn, v in por_bin.items():
            if len(v) < MIN_PARES_BIN:
                continue
            ws = sum(w for _, w in v)
            if ws <= 0:
                continue
            pb[bn] = (round(sum(dq * w for dq, w in v) / ws, 4), round(ws, 1), len(v))
        cum, run = {}, 0.0
        for bn in sorted(pb):
            run += pb[bn][0] * AGE_BIN
            cum[bn] = round(run, 4)
        curvas[root] = {"per_bin": pb, "cumulative": cum, "n_pares": len(arr)}
    return curvas


def cum_interp(curva, idade):
    """Cumulativa na idade, interpolada entre bins. Fora da faixa, o extremo (sem extrapolar)."""
    if idade is None or not curva or not curva.get("cumulative"):
        return None
    cum = {int(k): v for k, v in curva["cumulative"].items()}
    bins = sorted(cum)
    if not bins:
        return None
    x = [b + AGE_BIN / 2.0 for b in bins]          # o bin representa o seu meio
    y = [cum[b] for b in bins]
    if idade <= x[0]:
        return y[0]
    if idade >= x[-1]:
        return y[-1]
    i = bisect.bisect_right(x, idade) - 1
    t = (idade - x[i]) / (x[i + 1] - x[i])
    return y[i] + t * (y[i + 1] - y[i])


def esperado_por_idade(curvas, root, i_antes, i_depois):
    c = curvas.get(root)
    a, b = cum_interp(c, i_antes), cum_interp(c, i_depois)
    if a is None or b is None:
        return None
    return round(b - a, 4)


# ---------------------------------------------------------------------------
# 3b. O contrafactual de quem FICOU — o controle da seleção na origem
# ---------------------------------------------------------------------------
def reta_de_quem_ficou(fotos):
    """Por posição-raiz, a reta qz(t+1) = a + b·qz(t) de quem FICOU na mesma liga em
    temporadas seguidas.

    É o controle da ressalva mais séria desta parte: quem é comprado é quem foi bem, e
    parte da queda que J08 vai medir é regressão à média, não nível de liga. O grupo
    'ficou' é o mesmo contraste que a etapa_11 usa (176 que mudaram × 144 que ficaram),
    um degrau acima. Sem ele, a conta ingênua diz que o Uruguai é mais fraco que a Série C
    e que a Inglaterra é duas vezes a Série A — que é o retrato da seleção, não das ligas."""
    pares = collections.defaultdict(lambda: ([], []))
    tracks = collections.defaultdict(list)
    for per, linhas in fotos.items():
        for f in linhas:
            tracks[(f["nkey"], f["root"])].append({"year": PERIODO_ANO[per],
                                                   "league": f["league"], "qz": f["qz"]})
    for (_nk, root), ph in tracks.items():
        ph.sort(key=lambda x: x["year"])
        for a, b in zip(ph, ph[1:]):
            if b["year"] - a["year"] != 1 or a["league"] != b["league"]:
                continue
            pares[root][0].append(a["qz"])
            pares[root][1].append(b["qz"])
    todos_x = [v for x, _ in pares.values() for v in x]
    todos_y = [v for _, y in pares.values() for v in y]
    def ajustar(x, y):
        n = len(x)
        mx, my = sum(x) / n, sum(y) / n
        sxx = sum((v - mx) ** 2 for v in x)
        sxy = sum((u - mx) * (v - my) for u, v in zip(x, y))
        b = sxy / sxx if sxx else 0.0
        return round(my - b * mx, 4), round(b, 4), n
    geral = ajustar(todos_x, todos_y)
    retas = {}
    for root, (x, y) in pares.items():
        retas[root] = ajustar(x, y) if len(x) >= MIN_PARES_FICOU else geral
    return retas, geral


def qz_esperado_ficou(reta, qz_antes, anos):
    """Aplica a reta `anos` vezes: quem ficou parado, do mesmo nível, estaria onde?"""
    if reta is None or qz_antes is None or anos is None or anos < 1:
        return None
    a, b, _n = reta
    v = qz_antes
    for _ in range(int(anos)):
        v = a + b * v
    return round(v, 4)


# ---------------------------------------------------------------------------
# 4. As réguas de percentil, por (período, liga, root), só com 900+ minutos
# ---------------------------------------------------------------------------
def montar_regua(periodo, liga, fotos, colunas):
    """{root: {coluna: [valores ordenados]}} dos jogadores acima do limiar da liga-período."""
    tab, _ = ler_xlsx(periodo, liga, colunas)
    if not tab:
        return {}, {}
    lim = limiar_regua(periodo, liga, colunas)
    vals = collections.defaultdict(lambda: collections.defaultdict(list))
    n = collections.Counter()
    for f in fotos:
        if f["league"] != liga or f["minutes"] < lim:
            continue
        r, _ = linha_xlsx(periodo, liga, colunas, f["player"], f["team"], f["minutes"])
        if r is None:
            continue
        n[f["root"]] += 1
        for c in colunas:
            if r[c] is not None:
                vals[f["root"]][c].append(r[c])
    return ({root: {c: sorted(v) for c, v in d.items()} for root, d in vals.items()}, dict(n))


def posicao_na_regua(v, regua):
    """Onde o valor cai na régua dos 900+, de 0 a 100. Serve também para quem NÃO está
    na régua (o de poucos minutos): ele é posicionado, não admitido."""
    if v is None or not regua:
        return None
    n = len(regua)
    menores = bisect.bisect_left(regua, v)
    iguais = bisect.bisect_right(regua, v) - menores
    return round(100.0 * (menores + 0.5 * iguais) / n, 2)


# ---------------------------------------------------------------------------
# 5. O programa
# ---------------------------------------------------------------------------
def main():
    decl, familias = carregar_indicadores()
    colunas = [c for _, ids in familias for _, c in ids]
    id_de_coluna = {c: i for _, ids in familias for i, c in ids}
    fam_de_id = {i: fam for fam, ids in familias for i, _ in ids}

    movers = json.load(open(os.path.join(COP, "_temporal_movers.json"), encoding="utf-8"))
    fotos = json.load(open(os.path.join(COP, "_temporal_photos.json"), encoding="utf-8"))
    aging = json.load(open(os.path.join(COP, "_temporal_aging.json"), encoding="utf-8"))
    proto = json.load(open(os.path.join(DADOS, "prototipo.json"), encoding="utf-8"))
    e11 = proto["etapa_11"]

    print("=" * 78)
    print("J08 passo 1 — a base da conversão de ligas")
    print("=" * 78)
    print(f"etapa_11 aproveitada: {len(e11['tecnico']['metricas'])} métricas técnicas, "
          f"rho mediano de quem MUDOU de clube {e11['tecnico']['rho_mediano_mudou']} "
          f"(quem ficou, {e11['tecnico']['rho_mediano_ficou']}); físico {e11['fisico']['rho_mediano']}.")
    print(f"lista pré-declarada: {sum(len(i) for _, i in familias)} indicadores em "
          f"{len(familias)} famílias montáveis; a família física está declarada e NÃO é montável.")

    # -- idade ---------------------------------------------------------------
    defas, origem_def = medir_defasagem(fotos)
    print("\ndefasagem de idade medida (mediana por período, em anos):")
    porper = collections.defaultdict(list)
    for (per, liga), v in defas.items():
        porper[per].append(v)
    for per in PERIODO_ANO:
        if per in porper:
            c = collections.Counter(porper[per])
            print(f"  {per:6s} ligas={len(porper[per]):3d}  {dict(sorted(c.items()))}")

    retas, reta_geral = reta_de_quem_ficou(fotos)
    print(f"\nreta de quem FICOU na mesma liga (qz do ano seguinte a partir do qz de hoje) — "
          f"geral: {reta_geral[0]:+.3f} {reta_geral[1]:+.3f}·qz, n={reta_geral[2]}")
    for root in sorted(retas):
        a, b, n = retas[root]
        print(f"  {root:4s} a={a:+.4f}  b={b:.4f}  n={n}")

    curvas = curva_corrigida(fotos, defas)
    print("\ncurva de envelhecimento — pico do bin, arquivo × recalculada com idade corrigida:")
    for root in sorted(set(list(aging["curves"]) + list(curvas))):
        ca = aging["curves"].get(root, {}).get("cumulative", {})
        cb = curvas.get(root, {}).get("cumulative", {})
        pa = max(ca, key=ca.get) if ca else None
        pb = max(cb, key=cb.get) if cb else None
        print(f"  {root:4s} arquivo pico={pa}  recalculada pico={pb}  "
              f"bins {len(ca)}→{len(cb)}")

    # -- índice das fotos ----------------------------------------------------
    idx = collections.defaultdict(list)
    for per, linhas in fotos.items():
        for f in linhas:
            idx[(per, f["league"], f["nkey"], f["root"])].append(f)
            f["_per"] = per

    def achar_foto(per, liga, player, root, qz, mins):
        c = idx.get((per, liga, nkey(player), root), [])
        if len(c) == 1:
            return c[0], "única"
        exato = [f for f in c if abs(f["qz"] - qz) < 1e-6 and f["minutes"] == mins]
        if len(exato) == 1:
            return exato[0], "homônimo resolvido por qz+minutos"
        solta = [f for lst in
                 (idx.get((per, liga, nkey(player), r), []) for r in
                  ("ZAG", "LAT", "VOL", "MED", "MEI", "EXT", "ATA")) for f in lst]
        exato = [f for f in solta if abs(f["qz"] - qz) < 1e-6 and f["minutes"] == mins]
        if len(exato) == 1:
            return exato[0], "posição mudou: resolvido por qz+minutos"
        return None, f"sem foto ({len(c)} candidatos)"

    casos = [m for m in movers if m["to_league"] in DESTINOS]
    print(f"\ntransferências para o futebol brasileiro: {len(casos)} "
          f"(de {len(movers)} trocas de liga no painel)")

    # -- réguas: só os (período, liga) necessários ---------------------------
    precisa = set()
    for m in casos:
        precisa.add((ANO_PERIODO[m["from_year"]], m["from_league"]))
        precisa.add((ANO_PERIODO[m["to_year"]], m["to_league"]))
    print(f"pares (período, liga) a ler: {len(precisa)}")
    fotos_por = collections.defaultdict(list)
    for per, linhas in fotos.items():
        for f in linhas:
            fotos_por[per].append(f)

    ausentes = [(p_, l_) for p_, l_ in sorted(precisa) if caminho_xlsx(p_, l_)[0] is None]
    if ausentes:
        print("\n[PARA] Excel ausente nos dois lugares (copiado e Portal Ranking):")
        for p_, l_ in ausentes:
            print(f"  {p_}/{PREFIXO[p_]}_{l_}.xlsx")
        raise SystemExit(1)
    reguas, n_regua, fontes = {}, {}, collections.Counter()
    for per, liga in sorted(precisa):
        _, de_onde = caminho_xlsx(per, liga)
        fontes[(per, de_onde)] += 1
        reguas[(per, liga)], n_regua[(per, liga)] = montar_regua(per, liga, fotos_por[per],
                                                                 colunas)
    print("\nde onde vieram os Excels:")
    for (per, de_onde), n in sorted(fontes.items()):
        print(f"  {per:6s} {de_onde:15s} {n:3d} ligas")

    # -- as linhas -----------------------------------------------------------
    linhas, diag = [], collections.Counter()
    for k, m in enumerate(casos, 1):
        pa, pb = ANO_PERIODO[m["from_year"]], ANO_PERIODO[m["to_year"]]
        la, lb = m["from_league"], m["to_league"]
        fa, ra = achar_foto(pa, la, m["player"], m["root"], m["qz_from"], m["min_from"])
        fb, rb = achar_foto(pb, lb, m["player"], m["root"], m["qz_to"], m["min_to"])
        diag["foto antes: " + ra] += 1
        diag["foto depois: " + rb] += 1
        root_a = fa["root"] if fa else m["root"]
        root_b = fb["root"] if fb else m["root"]
        clube_a = fa["team"] if fa else ""
        clube_b = fb["team"] if fb else ""

        xa, mot_a = (linha_xlsx(pa, la, colunas, m["player"], clube_a, m["min_from"])
                     if fa else (None, "sem foto"))
        xb, mot_b = (linha_xlsx(pb, lb, colunas, m["player"], clube_b, m["min_to"])
                     if fb else (None, "sem foto"))
        diag["Excel antes: " + mot_a] += 1
        diag["Excel depois: " + mot_b] += 1

        i_arq_a = xa["_idade_arquivo"] if xa else (fa["age"] if fa else None)
        i_arq_b = xb["_idade_arquivo"] if xb else (fb["age"] if fb else None)
        i_a = idade_na_temporada(i_arq_a, pa, la, defas)
        i_b = idade_na_temporada(i_arq_b, pb, lb, defas)

        esp_novo = esperado_por_idade(curvas, root_b, i_a, i_b)
        esp_arq = esperado_por_idade(
            {r: {"cumulative": c["cumulative"]} for r, c in aging["curves"].items()},
            root_b, i_arq_a, i_arq_b)

        l = {
            "caso_id": f"J08-{k:04d}",
            "jogador": m["player"],
            "nkey": nkey(m["player"]),
            "root_antes": root_a,
            "root_depois": root_b,
            "mudou_posicao": int(root_a != root_b),
            "posicao_antes": fa["position"] if fa else "",
            "posicao_depois": fb["position"] if fb else "",
            "liga_origem": la,
            "liga_destino": lb,
            "divisao_destino": lb.split()[-1],
            "origem_brasileira": int(la in DESTINOS),
            "periodo_antes": pa, "ano_antes": m["from_year"],
            "periodo_depois": pb, "ano_depois": m["to_year"],
            "anos_entre": m["to_year"] - m["from_year"],
            "coorte_chegada": m["to_year"],
            "clube_antes": clube_a, "clube_depois": clube_b,
            "primary_key_antes": f"{m['player']} - {clube_a} - {la}" if clube_a else "",
            "primary_key_depois": f"{m['player']} - {clube_b} - {lb}" if clube_b else "",
            "min_antes": m["min_from"], "min_depois": m["min_to"],
            "jogos_antes": xa["_jogos"] if xa else None,
            "jogos_depois": xb["_jogos"] if xb else None,
            "menos_900_no_destino": int(m["min_to"] < MIN_REGUA),
            "menos_900_na_origem": int(m["min_from"] < MIN_REGUA),
            "limiar_regua_antes": limiar_regua(pa, la, colunas),
            "limiar_regua_depois": limiar_regua(pb, lb, colunas),
            "abaixo_do_limiar_no_destino": int(m["min_to"] < limiar_regua(pb, lb, colunas)),
            "abaixo_do_limiar_na_origem": int(m["min_from"] < limiar_regua(pa, la, colunas)),
            "temporada_destino_em_curso": int(pb == "jun26"),
            "temporada_origem_em_curso": int(pa == "jun26"),
            "qz_antes": m["qz_from"], "qz_depois": m["qz_to"], "dqz": m["dqz"],
            "qpct_antes": fa["q_pct"] if fa else None,
            "qpct_depois": fb["q_pct"] if fb else None,
            "idade_arquivo_antes": i_arq_a, "idade_arquivo_depois": i_arq_b,
            "defasagem_antes": defas.get((pa, la)), "defasagem_depois": defas.get((pb, lb)),
            "origem_defasagem_antes": origem_def.get((pa, la), ""),
            "origem_defasagem_depois": origem_def.get((pb, lb), ""),
            "idade_antes": i_a, "idade_depois": i_b,
            "delta_idade": None if (i_a is None or i_b is None) else round(i_b - i_a, 1),
            "dif_idade_vs_anos": None if (i_a is None or i_b is None) else
                                 round((i_b - i_a) - (m["to_year"] - m["from_year"])),
            "idade_incoerente": 0 if (i_a is None or i_b is None) else
                                int(abs((i_b - i_a) - (m["to_year"] - m["from_year"]))
                                    >= DIF_IDADE_SUSPEITA),
            "dqz_esperado_idade": esp_novo,
            "dqz_esperado_idade_curva_do_arquivo": esp_arq,
            "dqz_ajustado_idade": None if esp_novo is None else round(m["dqz"] - esp_novo, 4),
            "qz_esperado_ficou": None, "dqz_liquido": None,          # preenchidos abaixo
            "motivo_antes": f"{ra}; {mot_a}",
            "motivo_depois": f"{rb}; {mot_b}",
        }

        ef = qz_esperado_ficou(retas.get(root_a), m["qz_from"], m["to_year"] - m["from_year"])
        l["qz_esperado_ficou"] = ef
        l["dqz_liquido"] = None if ef is None else round(m["qz_to"] - ef, 4)

        reg_a = reguas.get((pa, la), {}).get(root_a, {})
        reg_b = reguas.get((pb, lb), {}).get(root_b, {})
        na = n_regua.get((pa, la), {}).get(root_a, 0)
        nb = n_regua.get((pb, lb), {}).get(root_b, 0)
        l["n_regua_antes"], l["n_regua_depois"] = na, nb
        l["regua_curta"] = int(na < REGUA_CURTA or nb < REGUA_CURTA)

        completo = 0
        for col in colunas:
            i = id_de_coluna[col]
            va = xa[col] if xa else None
            vb = xb[col] if xb else None
            pa_ = posicao_na_regua(va, reg_a.get(col, []))
            pb_ = posicao_na_regua(vb, reg_b.get(col, []))
            l[f"{i}_antes"] = va
            l[f"{i}_depois"] = vb
            l[f"{i}_pct_antes"] = pa_
            l[f"{i}_pct_depois"] = pb_
            l[f"{i}_dpct"] = None if (pa_ is None or pb_ is None) else round(pb_ - pa_, 2)
            if l[f"{i}_dpct"] is not None:
                completo += 1
        l["n_indicadores_com_delta"] = completo
        l["caso_completo"] = int(completo == len(colunas) and not l["regua_curta"]
                                 and not l["idade_incoerente"])
        linhas.append(l)

    # -- gravar --------------------------------------------------------------
    campos = list(linhas[0].keys())
    saida = os.path.join(R, "J08_base.csv")
    with open(saida, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=campos)
        w.writeheader()
        w.writerows(linhas)

    # -- relatório -----------------------------------------------------------
    print("\ncruzamento (armadilha do homônimo):")
    for k_, v in sorted(diag.items()):
        print(f"  {k_}: {v}")

    print("\ncobertura do Δpercentil por indicador (vazio = o jogador não teve a ação):")
    for fam, ids in familias:
        for i, _c in ids:
            n = sum(1 for l in linhas if l[f"{i}_dpct"] is not None)
            print(f"  {fam:10s} {i:30s} {n:4d}/{len(linhas)}")
    print(f"\nrégua curta (menos de {REGUA_CURTA} jogadores acima do limiar na "
          f"liga-período-posição): {sum(l['regua_curta'] for l in linhas)}")
    lim = sorted({(l["periodo_depois"], l["liga_destino"], l["limiar_regua_depois"])
                  for l in linhas})
    print("limiar da régua no destino (900 = temporada cheia e longa):")
    for per, liga, v in lim:
        if v < MIN_REGUA:
            print(f"  {per:6s} {liga:10s} {v:4d} min")
    print(f"chegaram numa temporada EM CURSO (jun26): "
          f"{sum(l['temporada_destino_em_curso'] for l in linhas)}")
    dist = collections.Counter(l["dif_idade_vs_anos"] for l in linhas)
    print("\nΔidade menos anos entre as temporadas (0 = a mesma pessoa envelheceu certo):")
    print(f"  {dict(sorted((k, v) for k, v in dist.items() if k is not None))}")
    inc = [l for l in linhas if l["idade_incoerente"]]
    print(f"  incoerentes (|dif| >= {DIF_IDADE_SUSPEITA}): {len(inc)} — são HOMÔNIMOS que o "
          f"painel de origem juntou num jogador só, e vão marcados, não apagados")
    for l in inc[:8]:
        print(f"    {l['jogador']:20s} {l['liga_origem']:12s}{l['periodo_antes']:6s}-> "
              f"{l['liga_destino']:10s}{l['periodo_depois']:6s} idade {l['idade_antes']}"
              f"->{l['idade_depois']} em {l['anos_entre']} ano(s)")
    print(f"\nlinhas gravadas: {len(linhas)}  colunas: {len(campos)}  -> {saida}")
    n900 = sum(l["menos_900_no_destino"] for l in linhas)
    print(f"NÃO chegaram a 900 min no destino: {n900} de {len(linhas)} "
          f"({100*n900/len(linhas):.0f}%) — entram marcados, é o viés do sobrevivente")
    print(f"casos completos (todos os indicadores e régua com {REGUA_CURTA}+): "
          f"{sum(l['caso_completo'] for l in linhas)}")

    por_destino = collections.Counter(l["liga_destino"] for l in linhas)
    print("\npor destino:", dict(sorted(por_destino.items())))

    est = collections.Counter(l["liga_origem"] for l in linhas if not l["origem_brasileira"])
    acima = {k: v for k, v in est.items() if v >= 10}
    print(f"\nligas de origem estrangeiras: {len(est)}; com 10+ casos: {len(acima)}")
    for k_, v in sorted(acima.items(), key=lambda kv: -kv[1]):
        print(f"  {k_:16s} {v:3d}")
    brs = collections.Counter(l["liga_origem"] for l in linhas if l["origem_brasileira"])
    print("origens brasileiras:", dict(sorted(brs.items(), key=lambda kv: -kv[1])))

    so_b = collections.Counter(l["liga_origem"] for l in linhas
                               if l["liga_destino"] == "Brasil B" and not l["origem_brasileira"])
    print(f"\nconferência do que o dono já contou (destino SÓ Série B): "
          f"{sum(so_b.values())} estrangeiros, maior origem "
          f"{so_b.most_common(1)[0] if so_b else '—'}; com 10+: "
          f"{[k for k, v in so_b.items() if v >= 10] or 'nenhuma'}")

    print("\nefeito de corrigir a idade (média |Δ| entre os dois descontos de envelhecimento):")
    dif = [abs(l["dqz_esperado_idade"] - l["dqz_esperado_idade_curva_do_arquivo"])
           for l in linhas
           if l["dqz_esperado_idade"] is not None
           and l["dqz_esperado_idade_curva_do_arquivo"] is not None]
    if dif:
        print(f"  n={len(dif)}  média={statistics.mean(dif):.3f}  "
              f"mediana={statistics.median(dif):.3f}  máx={max(dif):.3f} (em unidades de qz)")
    print(f"\ngerado em {dt.datetime.now():%Y-%m-%d %H:%M}")


if __name__ == "__main__":
    main()
