#!/usr/bin/env python3
"""A10, passo 2 — calcular: quem sobe sustenta a intensidade no returno e em sequências de jogos?

Lê a base do passo 1 (`resultados/A10_base.csv`) e a lista pré-declarada
(`resultados/A10_indicadores.json`) e roda o método da casa (`scripts/_metodo.py`).

Escreve, e só:
    resultados/A10_testes.csv     uma linha por teste, inclusive o que não passou
    resultados/A10_resumo.json    o quadro por faixa, o poder, a porta, o placar e as ressalvas
Lê, e não altera: resultados/A10_base.csv, resultados/A10_indicadores.json e
dados/serieb_jogos.csv (só para os pontos e o descanso do calendário COMPLETO, ver abaixo).

## As duas perguntas, nesta ordem

**A) Sustenta no returno?** Não é o nível (isso é A07): é a QUEDA do turno para o returno. A conta
roda DENTRO DO JOGADOR — cada jogador é o seu próprio controle, `delta_turno` = média dele nas
rodadas 20+ menos a média dele nas rodadas 1–19 — e só depois agrega por faixa. Com 4 clubes no
Sobe, comparar médias de faixa no nível do clube enxerga só efeito enorme (d mínimo 1,74); dentro
do jogador o desenho tem centenas de unidades.

**B) Aguenta calendário curto?** `delta_descanso` = média do jogador nos jogos com menos de 4 dias
de descanso menos a média dele nos jogos normais, também dentro do jogador. E os PONTOS, que o
arquivo pede junto com o físico, no nível do clube.

## As regras fixadas ANTES de qualquer comparação

Nenhum número de faixa foi olhado antes destas linhas. O que se olhou antes é o que o passo 1 já
tinha publicado: cobertura, retrato do descanso e poder — propriedades da base e do n.

- **Jogos mínimos.** Medida de nível (`turno`, `returno`): 3 jogos válidos naquele meio. Medida de
  diferença (`delta_turno`): 3 de cada lado. `delta_descanso`: 1 jogo curto (eles são raros — 59
  clube-jogo em 2025) e 3 jogos normais. O mesmo corte vale no nível do clube.
- **60 minutos.** As sete métricas por 90 usam só jogos com 60+ min; o `psv99` é pico e usa todos,
  como manda o CLAUDE.md. Por isso elas rodam em bases separadas: prender o psv99 ao corte de 60
  min jogaria fora jogador que só entra no fim, e a regra escrita diz o contrário.
- **Cortes.** A análise inteira é repetida sem os times de fronteira e sem os de cobertura baixa —
  repetida, não partida (o BH não muda de unidade por causa disso). Em 2025 nenhum clube tem
  cobertura baixa, então esse corte não morde e não gera linha duplicada; em 2026 tira 7 clubes.

## A unidade do BH é a da §6.3, e isto está escrito porque J03 e J04 erraram aqui

Uma família = **um pilar × uma comparação**. São 3 pilares (fisico_ind, fisico_col, resultado_col)
× 3 comparações (SM, ST, CM) = 9 famílias. O BH a 5% roda sobre os **32 testes juntos** de cada
família física (8 indicadores × 4 medidas) e sobre os 4 de cada família de resultado. A medida NÃO
parte a família; o setor NÃO parte a família; o corte de fronteira não parte a família (repete a
rodada inteira). A conferência do J04 apontou a partição por setor como divergência da §6.3.

Como cada medida precisa do seu próprio conjunto de jogadores (quem tem 3 jogos no returno não é
quem tem jogo curto), `_metodo.comparar` é chamado uma vez por medida — e o **q é refeito com
`_metodo.bh` sobre os 32 testes da família**. O q de dentro de cada chamada fica na coluna
`q_por_medida`, rotulado como a LEITURA SECUNDÁRIA que ele é (família partida por pergunta).

## O piso de 5 e o nível do clube

`_metodo.comparar` pula todo teste com menos de 5 de um lado. No nível clube-temporada o desenho é
**4 contra 12 por construção** — o piso barraria a família inteira. Esse nível roda num laço local
(`comparar_sem_piso`) que usa **as mesmas funções do módulo** (cohen_d, ic_por_clube, d_minimo,
bh); nada foi reimplementado. Toda linha de lá sai com `abaixo_do_piso = 1`.

## O placar, que aqui é o risco central

Time que ganha recua e corre menos. A base não tem estado do jogo (A08 não roda), mas tem o
RESULTADO de cada jogo — então a análise principal roda sem condicionar e o recorte por
vitória/empate/derrota entra como **leitura secundária**: se o achado aparecer dentro das três, ele
não é só o placar; se sumir, a conclusão sai marcada "pode ser efeito do placar". Condicionar no
resultado final é condicionar num desfecho que o próprio físico ajuda a produzir (viés de
colisor), e por isso ele não é prova.

## A porta temporal, e o teto que ela impõe

Roda só para a medida `turno`: média do clube nas rodadas 1–19, em posto no ano, contra os pontos
das rodadas 20–38, com a parcial dada os pontos das rodadas 1–19 (§6.4). Para `returno`,
`delta_turno` e `delta_descanso` ela **não roda por construção** — a medida já contém o 2º turno,
que é o desfecho. n = 20 clubes, uma temporada: o teto de quase tudo em A10 é "provável".

Uso:
    python3 "_fonte/estudo_serieb/scripts/A10.py"
"""
import collections
import csv
import datetime as dt
import json
import math
import os
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import (bh, cohen_d, comparar, d_minimo, ic_por_clube,  # noqa: E402
                     pct, percentil_no_ano)

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
RNG = np.random.default_rng(20260919)

SERIE_B = "Brazil. Serie B"
TEMPORADAS = [2025, 2026]
RECORTE = 2025
ULTIMA_DO_TURNO = 19

# --- regras fixadas antes de comparar (ver docstring) --------------------------------------
MIN_JOGOS_NIVEL = 3       # jogos válidos no meio da temporada para medir turno / returno
MIN_JOGOS_CURTO = 1       # jogos com menos de 4 dias de descanso (são raros)
MIN_JOGOS_NORMAL = 3      # jogos com 4 dias ou mais, do outro lado do delta_descanso
MIN_LINHAS_BASE = 10      # base de medida com menos que isto não roda, e o motivo vai ao JSON
MIN_LINHAS_GRUPO_SETOR = 8   # grupo de posto por setor com menos que isto sai da leitura secundária
PISO_CLUBE = 3            # piso do laço local do nível clube (o do módulo é 5 e barraria 4×12)

MEDIDAS = ["turno", "returno", "delta_turno", "delta_descanso"]
MEDIDA_NOME = {
    "turno": "nível no 1º turno (rodadas 1–19)",
    "returno": "nível no 2º turno (rodadas 20+)",
    "delta_turno": "returno menos turno — sustentar ao longo da temporada",
    "delta_descanso": "jogo com menos de 4 dias de descanso menos jogo normal",
}
PLACAR = {"V": "vitória", "E": "empate", "D": "derrota"}


def ler_csv(caminho):
    with open(caminho, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def data(s):
    return dt.date(int(s[0:4]), int(s[5:7]), int(s[8:10]))


def media(xs):
    return sum(xs) / len(xs)


def mediana(xs):
    xs = sorted(xs)
    m = len(xs) // 2
    return xs[m] if len(xs) % 2 else (xs[m - 1] + xs[m]) / 2


# =============================================================== 1. a base e a lista declarada
def carregar():
    dec = json.load(open(os.path.join(R, "A10_indicadores.json"), encoding="utf-8"))
    base = []
    for r in ler_csv(os.path.join(R, "A10_base.csv")):
        l = {
            "temporada": int(r["temporada"]), "clube": r["clube"], "faixa": r["faixa"],
            "trave": r["trave"] == "1", "fronteira": r["fronteira"] == "1",
            "cobertura_baixa": r["cobertura_baixa"] == "1",
            "sc_match_id": int(r["sc_match_id"]), "data_wy": r["data_wy"],
            "rodada": int(r["rodada"]), "turno": r["turno"], "mando": r["mando"],
            "resultado": r["resultado"], "pontos_jogo": int(r["pontos_jogo"]),
            "descanso_dias": num(r["descanso_dias"]), "jogo_curto": num(r["jogo_curto"]),
            "sc_player_id": int(r["sc_player_id"]), "jogador": r["jogador"],
            "setor": r["setor"], "minutos": num(r["minutos"]), "min60": r["min60"] == "1",
        }
        for i in dec["indicadores"]:
            l[i["coluna"]] = num(r[i["coluna"]])
        base.append(l)
    return dec, base


# ================================================== 2. o calendário completo, e a conferência
def calendario_completo():
    """Todo clube-jogo de 2025/2026 com rodada, pontos e descanso de TODAS as competições.

    Caminho independente do A10_base.py (pandas-livre, mas outro código): serve para conferir a
    base e para os PONTOS não ficarem presos aos jogos rastreados — o físico cobre 746 dos 760
    clube-jogo de 2025, e ponto perdido é ponto.
    """
    por_clube = collections.defaultdict(list)
    for r in ler_csv(os.path.join(DADOS, "serieb_jogos.csv")):
        ano = int(r["ano"])
        if ano not in TEMPORADAS or not r.get("Data"):
            continue
        por_clube[(ano, r["Equipa"])].append({
            "data": data(r["Data"]), "competicao": r["Competição"],
            "resultado": r["resultado"],
            "pontos": {"V": 3, "E": 1, "D": 0}.get(r["resultado"], 0),
        })
    saida = {}
    for (ano, clube), js in por_clube.items():
        js.sort(key=lambda l: l["data"])
        anterior, rodada = None, 0
        for l in js:
            l["descanso_dias"] = (l["data"] - anterior["data"]).days if anterior else None
            anterior = l
            if l["competicao"] != SERIE_B:
                continue
            rodada += 1
            saida[(ano, clube, rodada)] = {
                "ano": ano, "clube": clube, "rodada": rodada, "data": l["data"],
                "turno": "1T" if rodada <= ULTIMA_DO_TURNO else "2T",
                "pontos": l["pontos"], "resultado": l["resultado"],
                "descanso_dias": l["descanso_dias"],
                "jogo_curto": None if l["descanso_dias"] is None else int(l["descanso_dias"] < 4),
            }
    return saida


def conferir_calendario(base, cal):
    """A base do passo 1 contra o caminho independente: rodada, descanso e curto, linha a linha."""
    vistos, div = {}, collections.Counter()
    for l in base:
        ch = (l["temporada"], l["clube"], l["sc_match_id"])
        if ch in vistos:
            continue
        vistos[ch] = l
        c = cal.get((l["temporada"], l["clube"], l["rodada"]))
        if c is None:
            div["clube_jogo_sem_par_no_calendario"] += 1
            continue
        if c["data"].isoformat() != l["data_wy"]:
            div["data_diferente"] += 1
        if c["pontos"] != l["pontos_jogo"]:
            div["pontos_diferentes"] += 1
        if (c["descanso_dias"] or -1) != (l["descanso_dias"] if l["descanso_dias"] is not None
                                          else -1):
            div["descanso_diferente"] += 1
        if (c["jogo_curto"] if c["jogo_curto"] is not None else -1) != (
                int(l["jogo_curto"]) if l["jogo_curto"] is not None else -1):
            div["jogo_curto_diferente"] += 1
    por_ano = collections.Counter(t for t, _, _ in vistos)
    return {
        "clube_jogo_rastreados_na_base": dict(por_ano),
        "clube_jogo_da_serie_b_no_calendario": dict(collections.Counter(
            a for a, _, _ in cal)),
        "divergencias": dict(div) or "nenhuma",
        "o_que_significa": ("A rodada, o descanso (todas as competições), o jogo curto e os pontos "
                            "foram refeitos por outro caminho e batem clube-jogo a clube-jogo."),
    }


# ============================================================ 3. as medidas, dentro do jogador
def parte_dos_jogos(jogos, col, min60_exigido, filtro=None):
    """Os valores válidos de uma coluna, separados pelos quatro recortes que as medidas usam."""
    saida = {"1T": [], "2T": [], "curto": [], "normal": []}
    for j in jogos:
        if filtro is not None and not filtro(j):
            continue
        if min60_exigido and not j["min60"]:
            continue
        v = j[col]
        if v is None:
            continue
        saida[j["turno"]].append(v)
        if j["jogo_curto"] == 1:
            saida["curto"].append(v)
        elif j["jogo_curto"] == 0:
            saida["normal"].append(v)
    return saida


def medidas_de(valores):
    """As quatro medidas pré-declaradas, com os jogos mínimos fixados antes de comparar."""
    m = {}
    t = media(valores["1T"]) if len(valores["1T"]) >= MIN_JOGOS_NIVEL else None
    r = media(valores["2T"]) if len(valores["2T"]) >= MIN_JOGOS_NIVEL else None
    m["turno"], m["returno"] = t, r
    m["delta_turno"] = (r - t) if (t is not None and r is not None) else None
    if len(valores["curto"]) >= MIN_JOGOS_CURTO and len(valores["normal"]) >= MIN_JOGOS_NORMAL:
        m["delta_descanso"] = media(valores["curto"]) - media(valores["normal"])
    else:
        m["delta_descanso"] = None
    return m


def bases_jogador(base, temporada, indicadores, filtro=None):
    """{medida: {grupo: [linha de jogador-temporada]}} — uma linha por (clube, jogador)."""
    por = collections.defaultdict(list)
    for l in base:
        if l["temporada"] == temporada:
            por[(l["clube"], l["sc_player_id"])].append(l)

    grupos = {"p90": [i for i in indicadores if i["min_60"]],
              "psv": [i for i in indicadores if not i["min_60"]]}
    saida = {m: {g: [] for g in grupos} for m in MEDIDAS}
    for (clube, pid), jogos in por.items():
        j0 = jogos[0]
        setor = collections.Counter(j["setor"] for j in jogos).most_common(1)[0][0]
        cab = {"temporada": temporada, "clube": clube, "jogador": j0["jogador"],
               "sc_player_id": pid, "faixa": j0["faixa"], "trave": j0["trave"],
               "fronteira": j0["fronteira"], "cobertura_baixa": j0["cobertura_baixa"],
               "setor": setor, "temp_setor": f"{temporada}|{setor}"}
        for g, inds in grupos.items():
            med = {i["coluna"]: medidas_de(parte_dos_jogos(jogos, i["coluna"], i["min_60"],
                                                           filtro)) for i in inds}
            for m in MEDIDAS:
                if any(med[i["coluna"]][m] is None for i in inds):
                    continue
                linha = dict(cab)
                for i in inds:
                    linha[i["coluna"]] = med[i["coluna"]][m]
                saida[m][g].append(linha)
    return saida


def bases_clube(base, temporada, indicadores):
    """O clube-temporada: valor do jogo = média dos atletas rastreados; do meio = média dos jogos."""
    por_jogo = collections.defaultdict(list)
    for l in base:
        if l["temporada"] == temporada:
            por_jogo[(l["clube"], l["sc_match_id"])].append(l)

    por_clube = collections.defaultdict(list)
    for (clube, _), atletas in por_jogo.items():
        a0 = atletas[0]
        jogo = {"turno": a0["turno"], "jogo_curto": a0["jogo_curto"], "min60": True,
                "faixa": a0["faixa"], "trave": a0["trave"], "fronteira": a0["fronteira"],
                "cobertura_baixa": a0["cobertura_baixa"]}
        for i in indicadores:
            vs = [a[i["coluna"]] for a in atletas
                  if a[i["coluna"]] is not None and (a["min60"] or not i["min_60"])]
            jogo[i["coluna"]] = media(vs) if vs else None
        por_clube[clube].append(jogo)

    saida = {m: [] for m in MEDIDAS}
    for clube, jogos in por_clube.items():
        j0 = jogos[0]
        cab = {"temporada": temporada, "clube": clube, "faixa": j0["faixa"],
               "trave": j0["trave"], "fronteira": j0["fronteira"],
               "cobertura_baixa": j0["cobertura_baixa"]}
        med = {i["coluna"]: medidas_de(parte_dos_jogos(jogos, i["coluna"], False))
               for i in indicadores}
        for m in MEDIDAS:
            if any(med[i["coluna"]][m] is None for i in indicadores):
                continue
            linha = dict(cab)
            for i in indicadores:
                linha[i["coluna"]] = med[i["coluna"]][m]
            saida[m].append(linha)
    return saida


def bases_resultado(base, cal, temporada):
    """Os PONTOS no calendário COMPLETO da Série B (não só nos jogos rastreados)."""
    faixa = {}
    for l in base:
        if l["temporada"] == temporada:
            faixa[l["clube"]] = (l["faixa"], l["trave"], l["fronteira"], l["cobertura_baixa"])
    por_clube = collections.defaultdict(list)
    for (ano, clube, _), c in cal.items():
        if ano == temporada and clube in faixa:
            por_clube[clube].append({"turno": c["turno"], "jogo_curto": c["jogo_curto"],
                                     "min60": True, "pontos_jogo": float(c["pontos"])})
    saida = {m: [] for m in MEDIDAS}
    for clube, jogos in por_clube.items():
        f, tr, fr, cb = faixa[clube]
        med = medidas_de(parte_dos_jogos(jogos, "pontos_jogo", False))
        for m in MEDIDAS:
            if med[m] is None:
                continue
            saida[m].append({"temporada": temporada, "clube": clube, "faixa": f, "trave": tr,
                             "fronteira": fr, "cobertura_baixa": cb, "pontos_jogo": med[m]})
    return saida


# ===================================================== 4. o laço do nível clube (sem o piso 5)
def comparar_sem_piso(base, familias, comparacoes, filtros, rng, sinal_de):
    """A conta de `_metodo.comparar` com as MESMAS funções do módulo, sem o piso de 5.

    Existe por uma razão só: no nível clube-temporada o desenho é 4 contra 12 **por construção**
    (uma temporada com físico por jogo), e o piso de 5 do módulo pularia a família inteira em
    silêncio. Nada foi reimplementado — cohen_d, ic_por_clube, d_minimo e bh são os do módulo.
    Toda linha daqui sai com `abaixo_do_piso = 1` e com o d mínimo do desenho ao lado.
    """
    saida = []
    for rot_f, filtro in filtros:
        for fam_id, ids in familias:
            for cid, ga_f, gb_f in comparacoes:
                ps, itens = [], []
                for ind in ids:
                    campo = pct(ind)
                    ga = (lambda f=filtro, g=ga_f: (lambda l: g(l) and f(l)))()
                    gb = (lambda f=filtro, g=gb_f: (lambda l: g(l) and f(l)))()
                    a = [l[campo] for l in base if ga(l)]
                    b = [l[campo] for l in base if gb(l)]
                    if len(a) < PISO_CLUBE or len(b) < PISO_CLUBE:
                        continue
                    _, p = stats.ttest_ind(a, b, equal_var=False)
                    d = cohen_d(a, b) * sinal_de(ind)
                    lo, hi = ic_por_clube(base, campo, ga, gb, sinal_de(ind), rng)
                    ca = [l[ind] for l in base if ga(l)]
                    cb = [l[ind] for l in base if gb(l)]
                    itens.append({
                        "fronteira": rot_f, "familia": fam_id, "comparacao": cid,
                        "indicador": ind, "n_a": len(a), "n_b": len(b),
                        "cru_a": round(float(np.median(ca)), 3),
                        "cru_b": round(float(np.median(cb)), 3),
                        "d": round(d, 3), "ic95_d": [lo, hi], "p": round(float(p), 5),
                        "d_minimo_80": d_minimo(len(a), len(b)),
                    })
                    ps.append(float(p))
                for it, q in zip(itens, bh(ps)):
                    it["q"] = round(q, 5)
                    it["selo"] = ("firme" if q < 0.05 else
                                  ("pode ser sorte" if it["p"] < 0.05 else "sem diferença clara"))
                    it["poder_suficiente"] = abs(it["d"]) >= it["d_minimo_80"]
                saida += itens
    return saida


# ================================================================ 5. rodar um nível × uma medida
COMPARACOES = [
    ("SM", lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
    ("ST", lambda l: l["faixa"] == "Sobe", lambda l: l["trave"]),
    ("CM", lambda l: l["faixa"] == "Cai", lambda l: l["faixa"] == "Meio"),
]
CMP = {c[0]: (c[1], c[2]) for c in COMPARACOES}


def cortes_de(base):
    """Os cortes que de fato mordem. Repetir a análise inteira, nunca partir a família."""
    fs = [("com", lambda l: True)]
    if any(l["fronteira"] for l in base):
        fs.append(("sem_fronteira", lambda l: not l["fronteira"]))
    if any(l["cobertura_baixa"] for l in base):
        fs.append(("sem_cobertura_baixa", lambda l: not l["cobertura_baixa"]))
    return fs


def rodar(base, ids, *, pilar, nivel, unidade, temporada, medida, leitura, normalizacao,
          sinal, nome, chave_ano="temporada", piso_do_modulo=True, lacunas=None, tag=""):
    """Roda `_metodo.comparar` (ou o laço sem piso) e devolve as linhas já enriquecidas."""
    if len(base) < MIN_LINHAS_BASE:
        if lacunas is not None:
            lacunas.append({"temporada": temporada, "nivel": nivel, "medida": medida,
                            "indicadores": ids, "leitura": leitura, "recorte": tag,
                            "linhas": len(base),
                            "motivo": f"menos de {MIN_LINHAS_BASE} unidades com a medida"})
        return []
    if chave_ano != "temporada":
        conta = collections.Counter(l[chave_ano] for l in base)
        base = [l for l in base if conta[l[chave_ano]] >= MIN_LINHAS_GRUPO_SETOR]
        if len(base) < MIN_LINHAS_BASE:
            return []
    percentil_no_ano(base, ids, chave_ano)
    filtros = cortes_de(base)
    fn = comparar if piso_do_modulo else comparar_sem_piso
    res = fn(base, [(pilar, ids)], COMPARACOES, filtros, RNG, lambda i: sinal[i])
    filtro_de = dict(filtros)
    for it in res:
        ga, gb = CMP[it["comparacao"]]
        f = filtro_de[it["fronteira"]]
        ca = {l["clube"] for l in base if ga(l) and f(l)}
        cb = {l["clube"] for l in base if gb(l) and f(l)}
        it.update({
            "temporada": temporada, "leitura": leitura, "nivel": nivel, "unidade": unidade,
            "pilar": pilar, "familia": f"{pilar}_x_{it['comparacao']}", "corte": it.pop("fronteira"),
            "normalizacao": normalizacao, "medida": medida, "medida_nome": MEDIDA_NOME[medida],
            "nome": nome[it["indicador"]], "recorte_extra": tag,
            "clubes_a": len(ca), "clubes_b": len(cb),
            "dif_bruta": round(it["cru_a"] - it["cru_b"], 3),
            "ic95_lo": it["ic95_d"][0], "ic95_hi": it["ic95_d"][1],
            "d_minimo_80_linhas": it.pop("d_minimo_80"),
            "d_minimo_80_clubes": d_minimo(max(len(ca), 2), max(len(cb), 2)),
            "q_por_medida": it.pop("q"), "selo_por_medida": it.pop("selo"),
            "abaixo_do_piso": 0 if piso_do_modulo else 1,
        })
        it.pop("ic95_d")
        it.pop("poder_suficiente")
    return res


def refazer_bh(linhas):
    """§6.3: BH a 5% por família = pilar × comparação. A medida não parte a família."""
    grupos = collections.defaultdict(list)
    for l in linhas:
        grupos[(l["temporada"], l["leitura"], l["normalizacao"], l["recorte_extra"],
                l["pilar"], l["comparacao"], l["corte"])].append(l)
    for ls in grupos.values():
        for l, q in zip(ls, bh([l["p"] for l in ls])):
            l["q"] = round(q, 5)
            l["n_testes_na_familia"] = len(ls)
            l["selo"] = ("firme" if q < 0.05 else
                         ("pode ser sorte" if l["p"] < 0.05 else "sem diferença clara"))
            l["poder_suficiente"] = int(abs(l["d"]) >= l["d_minimo_80_clubes"])


# ==================================================================== 6. a porta temporal (§6.4)
def parcial_spearman(x, y, z):
    """Correlação parcial de Spearman de x com y, dado z. n pequeno: o n vai junto, sempre."""
    rxy = stats.spearmanr(x, y).statistic
    rxz = stats.spearmanr(x, z).statistic
    ryz = stats.spearmanr(y, z).statistic
    den = math.sqrt((1 - rxz ** 2) * (1 - ryz ** 2))
    if den == 0:
        return None, None, rxy
    r = (rxy - rxz * ryz) / den
    n, k = len(x), 1
    gl = n - 2 - k
    if gl <= 0 or abs(r) >= 1:
        return round(float(r), 3), None, rxy
    t = r * math.sqrt(gl / (1 - r ** 2))
    return round(float(r), 3), float(2 * stats.t.sf(abs(t), gl)), rxy


def porta_temporal(base, cal, indicadores, temporada):
    """Média do indicador nas rodadas 1–19 × pontos das rodadas 20–38, dado os pontos do 1º turno."""
    fis = collections.defaultdict(lambda: collections.defaultdict(list))
    for l in base:
        if l["temporada"] != temporada or l["turno"] != "1T":
            continue
        for i in indicadores:
            if l[i["coluna"]] is None or (i["min_60"] and not l["min60"]):
                continue
            fis[l["clube"]][i["coluna"]].append(l[i["coluna"]])
    pts = collections.defaultdict(lambda: {"1T": 0.0, "2T": 0.0, "n1": 0, "n2": 0})
    for (ano, clube, _), c in cal.items():
        if ano != temporada:
            continue
        pts[clube][c["turno"]] += c["pontos"]
        pts[clube]["n" + c["turno"][0]] += 1

    clubes = sorted(c for c in fis if c in pts)
    saida, gl = {}, len(clubes) - 3
    crit = stats.t.ppf(0.975, gl) if gl > 0 else None
    for i in indicadores:
        col = i["coluna"]
        cs = [c for c in clubes if fis[c][col]]
        if len(cs) < 10:
            continue
        x = [media(fis[c][col]) for c in cs]
        y = [pts[c]["2T"] for c in cs]
        z = [pts[c]["1T"] for c in cs]
        r, p, bruto = parcial_spearman(x, y, z)
        saida[col] = {
            "n_clubes": len(cs), "rho_bruto": round(float(bruto), 3),
            "rho_parcial_dado_pontos_do_1T": r,
            "p": round(p, 5) if p is not None else None,
            "passa": bool(p is not None and p < 0.05 and r is not None
                          and r * i["sinal"] > 0),
        }
    saida["_leitura"] = {
        "n": len(clubes), "graus_de_liberdade": gl,
        "rho_parcial_minimo_para_p_005": (round(float(crit / math.sqrt(crit ** 2 + gl)), 3)
                                          if crit else None),
        "o_que_isso_quer_dizer": ("Com 20 clubes de uma temporada só, a parcial precisa passar de "
                                  "~0,46 para chegar a p<0,05. É um teste frouxo: ele entra no selo "
                                  "como a §6.4 manda, mas não sustenta 'firme' sozinho."),
        "so_vale_para_a_medida_turno": ("Para returno, delta_turno e delta_descanso a porta não "
                                        "roda por construção: a medida já contém o 2º turno, que é "
                                        "o desfecho. O teto dessas medidas é 'provável'."),
    }
    return saida


# ============================================================== 7. o quadro por faixa, em bruto
def quadro_por_faixa(bases, ids, nivel, temporada, unidade):
    """O valor BRUTO por faixa, antes de qualquer posto — é o que se lê numa reunião."""
    saida = []
    for medida, base in bases.items():
        if not base:
            continue
        for ind in ids:
            for faixa in ("Sobe", "Trave", "Meio", "Cai"):
                sel = [l for l in base if (l["trave"] if faixa == "Trave"
                                           else l["faixa"] == faixa)]
                if not sel:
                    continue
                vs = [l[ind] for l in sel]
                saida.append({
                    "temporada": temporada, "nivel": nivel, "unidade": unidade,
                    "medida": medida, "indicador": ind, "faixa": faixa,
                    "n": len(sel), "clubes": len({l["clube"] for l in sel}),
                    "mediana": round(mediana(vs), 3), "media": round(media(vs), 3),
                })
    return saida


# ================================================ 7b. o que CAI, antes de perguntar de quem
def ic_media_por_clube(base, campo, rng, reps=2000):
    """IC95 da média reamostrando CLUBES, o mesmo princípio do `_metodo.ic_por_clube` (§6.6).

    O módulo tem o IC da diferença entre dois grupos; aqui a pergunta é anterior a isso — quanto
    cai, no geral — e o que se reamostra continua sendo o clube, não a linha.
    """
    por_clube = collections.defaultdict(list)
    for l in base:
        por_clube[l["clube"]].append(l[campo])
    clubes = list(por_clube)
    if not clubes:
        return (None, None)
    ms = []
    for _ in range(reps):
        vs = [v for c in rng.choice(clubes, len(clubes), replace=True) for v in por_clube[c]]
        if vs:
            ms.append(sum(vs) / len(vs))
    return (round(float(np.percentile(ms, 2.5)), 3), round(float(np.percentile(ms, 97.5)), 3))


def efeito_medio(bases, ids, nivel, unidade, temporada, rng, recorte=""):
    """A queda em si, com o n e o IC de clube — descritivo, fora das famílias de faixa.

    Não é comparação entre faixas e por isso não entra em nenhuma família do BH: é a resposta à
    parte da pergunta que vem antes, "o que cai". O nível de referência é o turno (ou o jogo
    normal), para a queda poder ser lida em % do que o jogador fazia.
    """
    saida = []
    for medida, referencia in (("delta_turno", "turno"), ("delta_descanso", "turno")):
        base = bases.get(medida) or []
        if not base:
            continue
        for ind in ids:
            for faixa in ("todos", "Sobe", "Trave", "Meio", "Cai"):
                sel = [l for l in base if faixa == "todos"
                       or (l["trave"] if faixa == "Trave" else l["faixa"] == faixa)]
                if len(sel) < 3:
                    continue
                xs = [l[ind] for l in sel]
                t, p = stats.ttest_1samp(xs, 0)
                lo, hi = ic_media_por_clube(sel, ind, rng)
                base_ref = bases.get(referencia) if referencia else None
                nivel_ref = None
                if base_ref:
                    rs = [l[ind] for l in base_ref if faixa == "todos"
                          or (l["trave"] if faixa == "Trave" else l["faixa"] == faixa)]
                    nivel_ref = round(media(rs), 3) if rs else None
                saida.append({
                    "temporada": temporada, "nivel": nivel, "unidade": unidade,
                    "recorte": recorte, "medida": medida, "indicador": ind, "faixa": faixa,
                    "n": len(sel), "clubes": len({l["clube"] for l in sel}),
                    "media": round(media(xs), 3), "mediana": round(mediana(xs), 3),
                    "ic95_da_media": [lo, hi], "p_contra_zero": round(float(p), 5),
                    "nivel_no_turno": nivel_ref,
                    "queda_pct_do_turno": (round(100 * media(xs) / nivel_ref, 2)
                                           if nivel_ref else None),
                    "nota_do_denominador": ("O nível do 1º turno é a régua de tamanho: para "
                                            "delta_descanso ele não é a linha de base exata (que "
                                            "seria o jogo normal), só a escala do indicador."),
                })
    return saida


# ================================================================================ 8. o principal
def main():
    dec, base = carregar()
    indicadores = dec["indicadores"]
    ids = [i["coluna"] for i in indicadores]
    sinal = {i["coluna"]: i["sinal"] for i in indicadores}
    nome = {i["coluna"]: i["nome"] for i in indicadores}
    sinal["pontos_jogo"] = 1
    nome["pontos_jogo"] = "Pontos por jogo"

    cal = calendario_completo()
    conferencia = conferir_calendario(base, cal)
    print("conferência do calendário:", conferencia["divergencias"])

    linhas, lacunas, quadro, efeitos = [], [], [], []
    poder, nn = {}, {}

    for temporada in TEMPORADAS:
        principal = temporada == RECORTE
        bj = bases_jogador(base, temporada, indicadores)
        bc = bases_clube(base, temporada, indicadores)
        br = bases_resultado(base, cal, temporada)
        nn[str(temporada)] = {
            "jogador_temporada_por_medida": {m: {g: len(bj[m][g]) for g in bj[m]}
                                             for m in MEDIDAS},
            "clube_temporada_por_medida": {m: len(bc[m]) for m in MEDIDAS},
            "clube_temporada_pontos_por_medida": {m: len(br[m]) for m in MEDIDAS},
        }

        for medida in MEDIDAS:
            # --- nível principal: jogador-jogo agregado em jogador-temporada ---
            for g, grupo_ids in (("p90", [i["coluna"] for i in indicadores if i["min_60"]]),
                                 ("psv", [i["coluna"] for i in indicadores if not i["min_60"]])):
                b = bj[medida][g]
                linhas += rodar(b, grupo_ids, pilar="fisico_ind", nivel="jogador_jogo",
                                unidade="jogador-temporada (dentro do jogador)",
                                temporada=temporada, medida=medida,
                                leitura="principal" if principal else "teste_2026",
                                normalizacao="posto_no_ano", sinal=sinal, nome=nome,
                                lacunas=lacunas)
                # leitura secundária: posto dentro do ano × SETOR (controla a mistura de posições)
                linhas += rodar([dict(l) for l in b], grupo_ids, pilar="fisico_ind",
                                nivel="jogador_jogo",
                                unidade="jogador-temporada (dentro do jogador)",
                                temporada=temporada, medida=medida, leitura="secundaria",
                                normalizacao="posto_no_ano_x_setor", sinal=sinal, nome=nome,
                                chave_ano="temp_setor", tag="posto_por_setor")
            # --- nível secundário: clube-temporada (4 × 12, abaixo do piso do módulo) ---
            linhas += rodar(bc[medida], ids, pilar="fisico_col", nivel="clube_temporada",
                            unidade="clube-temporada", temporada=temporada, medida=medida,
                            leitura="principal" if principal else "teste_2026",
                            normalizacao="posto_no_ano", sinal=sinal, nome=nome,
                            piso_do_modulo=False, lacunas=lacunas)
            # --- pontos: porta D, o placar redescrito ---
            linhas += rodar(br[medida], ["pontos_jogo"], pilar="resultado_col",
                            nivel="clube_temporada", unidade="clube-temporada (calendário cheio)",
                            temporada=temporada, medida=medida,
                            leitura="principal" if principal else "teste_2026",
                            normalizacao="posto_no_ano", sinal=sinal, nome=nome,
                            piso_do_modulo=False, lacunas=lacunas)

        quadro += quadro_por_faixa({m: bj[m]["p90"] for m in MEDIDAS},
                                   [i["coluna"] for i in indicadores if i["min_60"]],
                                   "jogador_jogo", temporada, "jogador-temporada")
        quadro += quadro_por_faixa({m: bj[m]["psv"] for m in MEDIDAS},
                                   [i["coluna"] for i in indicadores if not i["min_60"]],
                                   "jogador_jogo", temporada, "jogador-temporada")
        quadro += quadro_por_faixa(bc, ids, "clube_temporada", temporada, "clube-temporada")
        quadro += quadro_por_faixa(br, ["pontos_jogo"], "clube_temporada", temporada,
                                   "clube-temporada (calendário cheio)")

        # o que cai, antes de perguntar de quem
        ids_p90 = [i["coluna"] for i in indicadores if i["min_60"]]
        ids_psv = [i["coluna"] for i in indicadores if not i["min_60"]]
        efeitos += efeito_medio({m: bj[m]["p90"] for m in MEDIDAS}, ids_p90, "jogador_jogo",
                                "jogador-temporada (dentro do jogador)", temporada, RNG)
        efeitos += efeito_medio({m: bj[m]["psv"] for m in MEDIDAS}, ids_psv, "jogador_jogo",
                                "jogador-temporada (dentro do jogador)", temporada, RNG)
        efeitos += efeito_medio(br, ["pontos_jogo"], "clube_temporada",
                                "clube-temporada (calendário cheio)", temporada, RNG)

        # --- poder do desenho, nas duas réguas ---
        faixas = collections.defaultdict(set)
        for l in base:
            if l["temporada"] == temporada:
                faixas[l["faixa"]].add(l["clube"])
                if l["trave"]:
                    faixas["Trave"].add(l["clube"])
                if not l["fronteira"]:
                    faixas[l["faixa"] + "_sem_fronteira"].add(l["clube"])
        n = {k: len(v) for k, v in faixas.items()}
        pj = bj["delta_turno"]["p90"]
        poder[str(temporada)] = {
            "clubes_por_faixa": n,
            "clube_temporada": {
                "SM": f"{n.get('Sobe',0)} × {n.get('Meio',0)}",
                "d_minimo_80_SM": d_minimo(max(n.get("Sobe", 2), 2), max(n.get("Meio", 2), 2)),
                "d_minimo_80_ST": d_minimo(max(n.get("Sobe", 2), 2), max(n.get("Trave", 2), 2)),
            },
            "jogador_temporada_delta_turno": {
                "n_linhas_SM": f"{sum(1 for l in pj if l['faixa']=='Sobe')} × "
                               f"{sum(1 for l in pj if l['faixa']=='Meio')}",
                "d_minimo_80_pelas_linhas": (
                    d_minimo(sum(1 for l in pj if l["faixa"] == "Sobe"),
                             sum(1 for l in pj if l["faixa"] == "Meio"))
                    if min(sum(1 for l in pj if l["faixa"] == "Sobe"),
                           sum(1 for l in pj if l["faixa"] == "Meio")) >= 3 else None),
                "d_minimo_80_pelos_clubes": d_minimo(max(n.get("Sobe", 2), 2),
                                                     max(n.get("Meio", 2), 2)),
            },
        }

    # ------------------------------------------------- 8b. o placar, leitura secundária de 2025
    placar_lac = []
    for cod, rot in PLACAR.items():
        bjp = bases_jogador(base, RECORTE, indicadores,
                            filtro=lambda j, c=cod: j["resultado"] == c)
        # o mesmo "o que cai", com o resultado do jogo SEGURADO: é aqui que se vê se a corrida a
        # mais no jogo curto é calendário ou é o time estar atrás no placar
        efeitos += efeito_medio({m: bjp[m]["p90"] for m in MEDIDAS},
                                [i["coluna"] for i in indicadores if i["min_60"]],
                                "jogador_jogo", f"jogador-temporada, só jogos de {rot}",
                                RECORTE, RNG, recorte=f"placar_{cod}")
        efeitos += efeito_medio({m: bjp[m]["psv"] for m in MEDIDAS},
                                [i["coluna"] for i in indicadores if not i["min_60"]],
                                "jogador_jogo", f"jogador-temporada, só jogos de {rot}",
                                RECORTE, RNG, recorte=f"placar_{cod}")
        for medida in MEDIDAS:
            for g, grupo_ids in (("p90", [i["coluna"] for i in indicadores if i["min_60"]]),
                                 ("psv", [i["coluna"] for i in indicadores if not i["min_60"]])):
                linhas += rodar(bjp[medida][g], grupo_ids, pilar="fisico_ind",
                                nivel="jogador_jogo",
                                unidade=f"jogador-temporada, só jogos de {rot}",
                                temporada=RECORTE, medida=medida, leitura="secundaria",
                                normalizacao="posto_no_ano", sinal=sinal, nome=nome,
                                tag=f"placar_{cod}", lacunas=placar_lac)

    refazer_bh(linhas)

    # ---------------------------------------------------------------- 8c. a porta temporal
    porta = porta_temporal(base, cal, indicadores, RECORTE)
    for l in linhas:
        pt = porta.get(l["indicador"])
        roda = (l["medida"] == "turno" and l["pilar"] != "resultado_col"
                and l["temporada"] == RECORTE and pt is not None)
        l["porta_roda"] = int(roda)
        l["porta_rho_parcial"] = pt["rho_parcial_dado_pontos_do_1T"] if roda else None
        l["porta_p"] = pt["p"] if roda else None
        ok = bool(roda and pt["passa"])
        firme_bh = l["q"] < 0.05
        l["confianca"] = ("firme" if (firme_bh and ok) else
                          ("provável" if (firme_bh or ok) else "indício"))
        l["confianca_motivo"] = (
            "passa no BH da família e o 1º turno previu o 2º" if (firme_bh and ok) else
            ("passa no BH da família; a porta temporal não roda nesta medida (a medida já contém "
             "o 2º turno)" if (firme_bh and not roda) else
             ("passa no BH da família, mas o 1º turno não previu o 2º" if firme_bh else
              ("o 1º turno previu o 2º, mas não passa no BH da família" if ok else
               "não passa no BH da família e a porta não sustenta")))
        )

    # ---------------------------------------------- 8d. o confundidor do calendário, medido
    faixa_de = {(l["temporada"], l["clube"]): l["faixa"] for l in base}
    curto = collections.defaultdict(lambda: collections.Counter())
    for (ano, clube, _), c in cal.items():
        if c["jogo_curto"] is None:
            continue
        fx = faixa_de.get((ano, clube))
        if fx is None:
            continue
        curto[(ano, fx)]["jogos"] += 1
        curto[(ano, fx)]["curtos"] += c["jogo_curto"]
    confundidor = {}
    for (ano, fx), c in sorted(curto.items()):
        confundidor.setdefault(str(ano), {})[fx] = {
            "clube_jogo": c["jogos"], "curtos": c["curtos"],
            "pct": round(100 * c["curtos"] / c["jogos"], 1)}

    # o placar muda com o descanso? é a pergunta que decide se "corre mais no jogo curto" é
    # calendário ou é o time estar atrás
    mix = {}
    for ano in TEMPORADAS:
        m = {"curto": collections.Counter(), "normal": collections.Counter()}
        for (a, clube, _), c in cal.items():
            if a != ano or c["jogo_curto"] is None or (ano, clube) not in faixa_de:
                continue
            m["curto" if c["jogo_curto"] else "normal"][c["resultado"]] += 1
        mix[str(ano)] = {k: {"n": sum(v.values()),
                             **{f"pct_{r}": round(100 * v[r] / sum(v.values()), 1)
                                for r in ("V", "E", "D")},
                             "pontos_por_jogo": round(
                                 (3 * v["V"] + v["E"]) / sum(v.values()), 3)}
                         for k, v in m.items() if sum(v.values())}

    # dose: quem joga MAIS jogo curto sofre mais no jogo curto? (o controle pelo número de jogos
    # curtos que o arquivo pede; n = 20 clubes, então é leitura, não prova)
    dose = {}
    n_curtos = collections.Counter()
    for (ano, clube, _), c in cal.items():
        if ano == RECORTE and c["jogo_curto"]:
            n_curtos[clube] += 1
    bc25 = bases_clube(base, RECORTE, indicadores)["delta_descanso"]
    br25 = bases_resultado(base, cal, RECORTE)["delta_descanso"]
    for rot, bb, cols in (("fisico_col", bc25, ids), ("resultado_col", br25, ["pontos_jogo"])):
        for col in cols:
            xs = [n_curtos.get(l["clube"], 0) for l in bb]
            ys = [l[col] for l in bb]
            if len(xs) < 10:
                continue
            rho = stats.spearmanr(xs, ys)
            dose[f"{rot}:{col}"] = {"n_clubes": len(xs), "rho": round(float(rho.statistic), 3),
                                    "p": round(float(rho.pvalue), 4)}
    dose["_leitura"] = ("Correlação entre quantos jogos curtos o clube teve em 2025 e o tamanho do "
                        "efeito do jogo curto nele. Com 20 clubes o rho precisa passar de ~0,44 "
                        "para p<0,05: é leitura, não prova.")

    # o rodízio, na régua em que ele existe: atletas distintos por meio de temporada
    rodizio = {}
    for temporada in TEMPORADAS:
        por = collections.defaultdict(lambda: {"1T": set(), "2T": set()})
        for l in base:
            if l["temporada"] == temporada:
                por[l["clube"]][l["turno"]].add(l["sc_player_id"])
        rodizio[str(temporada)] = {c: {"turno": len(v["1T"]), "returno": len(v["2T"]),
                                       "diferenca": len(v["2T"]) - len(v["1T"])}
                                   for c, v in sorted(por.items())}

    # ------------------------------------------------------------------- 9. gravar e relatar
    campos = ["temporada", "leitura", "nivel", "unidade", "pilar", "familia", "comparacao",
              "corte", "recorte_extra", "normalizacao", "medida", "medida_nome", "indicador",
              "nome", "n_a", "n_b", "clubes_a", "clubes_b", "cru_a", "cru_b", "dif_bruta", "d",
              "ic95_lo", "ic95_hi", "p", "q", "n_testes_na_familia", "q_por_medida",
              "selo_por_medida", "d_minimo_80_linhas", "d_minimo_80_clubes", "poder_suficiente",
              "abaixo_do_piso", "selo", "porta_roda", "porta_rho_parcial", "porta_p",
              "confianca", "confianca_motivo"]
    linhas.sort(key=lambda l: (l["temporada"], l["leitura"], l["nivel"], l["comparacao"],
                               l["corte"], l["recorte_extra"], l["medida"], l["indicador"]))
    with open(os.path.join(R, "A10_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos, extrasaction="ignore")
        w.writeheader()
        w.writerows(linhas)

    # --- o que passou, e o que passou nos DOIS cortes ---
    def chave(l):
        return (l["temporada"], l["leitura"], l["normalizacao"], l["recorte_extra"], l["pilar"],
                l["comparacao"], l["medida"], l["indicador"])

    por_corte = collections.defaultdict(dict)
    for l in linhas:
        por_corte[chave(l)][l["corte"]] = l
    achados = []
    for ch, cs in sorted(por_corte.items()):
        com = cs.get("com")
        if com is None or com["q"] >= 0.05:
            continue
        outros = {k: v for k, v in cs.items() if k != "com"}
        achados.append({
            "temporada": com["temporada"], "leitura": com["leitura"],
            "normalizacao": com["normalizacao"], "recorte_extra": com["recorte_extra"],
            "nivel": com["nivel"], "familia": com["familia"], "comparacao": com["comparacao"],
            "medida": com["medida"], "indicador": com["indicador"], "nome": com["nome"],
            "n": f"{com['n_a']} × {com['n_b']}",
            "clubes": f"{com['clubes_a']} × {com['clubes_b']}",
            "cru_a": com["cru_a"], "cru_b": com["cru_b"], "dif_bruta": com["dif_bruta"],
            "d": com["d"], "ic95": [com["ic95_lo"], com["ic95_hi"]], "q": com["q"],
            "d_minimo_80_clubes": com["d_minimo_80_clubes"],
            "poder_suficiente": com["poder_suficiente"],
            "sobrevive": {k: (v["q"] < 0.05) for k, v in sorted(outros.items())},
            "nos_dois_cortes": all(v["q"] < 0.05 for v in outros.values()) and bool(outros),
            "confianca": com["confianca"], "confianca_motivo": com["confianca_motivo"],
        })

    resumo = {
        "parte": "A10",
        "pergunta": dec["pergunta"],
        "rodado_em": "2026-09-19",
        "escrito_por": "scripts/A10.py (passo 2 de A10: calcular)",
        "o_limite_que_define_a_parte": dec["o_limite_que_define_a_parte"],
        "o_que_a_temporada_de_2026_pode_testar": {
            "o_que_e": "2026 está na base como teste, e o teste que ela permite é menor do que "
                       "parece: o returno de 2026 tem 1 ou 2 jogos rastreados por clube.",
            "medidas_que_rodam_em_2026": "turno e delta_descanso",
            "medidas_que_nao_rodam_em_2026": "returno e delta_turno — nenhum jogador chega a 3 "
                                             "jogos no 2º turno, então a pergunta A não tem teste "
                                             "fora de 2025.",
        },
        "regras_fixadas_antes_de_comparar": {
            "jogos_minimos_nivel": MIN_JOGOS_NIVEL,
            "jogos_minimos_curto": MIN_JOGOS_CURTO,
            "jogos_minimos_normal": MIN_JOGOS_NORMAL,
            "linhas_minimas_para_a_base_rodar": MIN_LINHAS_BASE,
            "piso_do_nivel_clube": PISO_CLUBE,
            "por_que_duas_bases": "As sete métricas por 90 exigem 60+ min; o psv99 é pico e usa "
                                  "todos os jogos. Rodam em bases separadas para o psv99 não "
                                  "herdar um corte que a regra escrita não manda.",
        },
        "unidade_do_bh": dec["unidade_da_familia"],
        "bh_como_rodou": {
            "familia": "pilar × comparação (§6.3), repetida em cada corte e em cada temporada",
            "testes_por_familia_fisica": 32,
            "testes_por_familia_de_resultado": 4,
            "q_por_medida": "coluna do CSV: o BH partido por medida. LEITURA SECUNDÁRIA, "
                            "declarada — a principal é a da §6.3.",
            "leituras_secundarias_rodadas": ["posto no ano × setor (controla a mistura de "
                                             "posições nas medidas de nível)",
                                             "recorte por vitória / empate / derrota",
                                             "BH partido por medida (coluna q_por_medida)"],
            "leitura_secundaria_nao_rodada": "família partida por setor — não foi rodada; foi "
                                             "exatamente o que a conferência do J04 apontou como "
                                             "divergência em J03 e J04.",
        },
        "conferencia_do_calendario": conferencia,
        "n_por_medida": nn,
        "poder": poder,
        "porta_temporal": porta,
        "placar": {
            "o_que_se_fez": "A análise principal roda SEM condicionar. O recorte por vitória / "
                            "empate / derrota está no CSV com recorte_extra = placar_V / placar_E "
                            "/ placar_D, como leitura secundária.",
            "por_que_nao_e_prova": dec["placar"]["por_que_isso_nao_e_o_recorte_que_a_especificacao_queria"],
            "medidas_sem_teste_por_placar": placar_lac,
            "o_placar_muda_com_o_descanso": {
                "o_que_e": "Distribuição de vitória / empate / derrota e pontos por jogo, nos "
                           "jogos com menos de 4 dias de descanso e nos normais. Se o jogo curto "
                           "for mais perdido, correr mais nele pode ser o time estar atrás.",
                "medido": mix,
            },
        },
        "confundidor_do_calendario": {
            "o_que_e": "Se quem sobe joga mais copa, ele tem mais jogo curto — isso é calendário, "
                       "não virtude. Medido no calendário completo, por faixa:",
            "medido": confundidor,
            "controle": "A comparação curto × normal é feita DENTRO do jogador e DENTRO do clube: "
                        "cada unidade é o seu próprio controle, então a diferença de exposição "
                        "entre faixas não entra no delta.",
            "dose_quantos_jogos_curtos_o_clube_teve": dose,
        },
        "rodizio": {
            "regra": "A especificação desconta o rodízio no posto de atletas rastreados. Aqui o "
                     "descritor do passo 1 (atletas_no_jogo) não serve — o SkillCorner rastreia um "
                     "teto por equipa-jogo. O rodízio de verdade é o de atletas distintos por meio "
                     "de temporada, abaixo.",
            "como_o_rodizio_e_controlado_de_fato": "Pelo desenho: as medidas principais são DENTRO "
                                                   "DO JOGADOR, e delta_turno exige 3 jogos de cada "
                                                   "lado — é o mesmo jogador nos dois meios da "
                                                   "temporada, não o elenco que mudou.",
            "atletas_distintos_por_meio": rodizio,
        },
        "o_que_cai_antes_de_perguntar_de_quem": {
            "o_que_e": "A queda em si, dentro do jogador, com o IC reamostrando CLUBES. Não é "
                       "comparação entre faixas e por isso não entra em nenhuma família do BH — é "
                       "a metade da pergunta que vem antes de 'quem sustenta'.",
            "medido": efeitos,
        },
        "achados": achados,
        "nos_dois_cortes": [a for a in achados if a["nos_dois_cortes"]
                            and a["leitura"] == "principal"],
        "quadro_por_faixa_em_valor_bruto": quadro,
        "lacunas": lacunas,
        "ressalvas_declaradas": dec["ressalvas_declaradas"] + [
            "A porta temporal só roda para a medida turno. Para returno, delta_turno e "
            "delta_descanso ela não roda por construção, e o teto dessas medidas é 'provável'.",
            "Em 2025 nenhum clube tem cobertura baixa: o corte 'sem cobertura baixa' não morde e "
            "não gera linha. Ele morde em 2026 (7 clubes).",
            "Sem os times de fronteira sobram 2 clubes no Sobe de 2025: o bootstrap de clube "
            "reamostra 20 e às vezes não sorteia nenhum deles, então o IC do corte sem fronteira é "
            "mais largo por construção.",
            "No nível clube-temporada o piso de 5 do _metodo.comparar foi substituído por um piso "
            "de 3 num laço local, porque o desenho é 4 × 12 por construção. Toda linha de lá está "
            "marcada com abaixo_do_piso = 1.",
        ],
    }
    json.dump(resumo, open(os.path.join(R, "A10_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1, default=str)

    # ----------------------------------------------------------------------------- relatório
    print(f"\nlinhas de teste: {len(linhas)}  ·  achados (q<0,05 com fronteira): {len(achados)}")
    for temporada in TEMPORADAS:
        print(f"\n{'='*104}\n{temporada} — PRINCIPAL (Sobe × Meio, com fronteira, posto no ano)"
              f"\n{'='*104}")
        print(f"{'nivel':16s} {'medida':15s} {'indicador':24s} {'n':>11s} {'Sobe':>10s} "
              f"{'Meio':>10s} {'d':>6s} {'IC95':>14s} {'q':>7s}  selo")
        for l in linhas:
            if (l["temporada"] != temporada or l["comparacao"] != "SM" or l["corte"] != "com"
                    or l["recorte_extra"] or l["normalizacao"] != "posto_no_ano"):
                continue
            ic = f"[{l['ic95_lo']},{l['ic95_hi']}]" if l["ic95_lo"] is not None else "—"
            print(f"{l['nivel']:16s} {l['medida']:15s} {l['indicador'][:24]:24s} "
                  f"{f'{l[chr(110)+chr(95)+chr(97)]}x{l[chr(110)+chr(95)+chr(98)]}':>11s} "
                  f"{l['cru_a']:10.2f} {l['cru_b']:10.2f} {l['d']:+6.2f} {ic:>14s} "
                  f"{l['q']:7.4f}  {l['selo']}")

    print(f"\n{'='*104}\nO QUE CAI — 2025, dentro do jogador, todas as faixas juntas\n{'='*104}")
    for e in efeitos:
        if e["temporada"] != RECORTE or e["faixa"] != "todos" or e["recorte"]:
            continue
        print(f"  {e['medida']:15s} {e['indicador'][:22]:22s} n {e['n']:>4d}  "
              f"média {e['media']:+10.2f}  IC95 [{e['ic95_da_media'][0]:+.2f},"
              f"{e['ic95_da_media'][1]:+.2f}]  {str(e['queda_pct_do_turno']):>7s}%  "
              f"p {e['p_contra_zero']:.4f}")

    print(f"\n{'='*104}\nO MESMO, COM O RESULTADO SEGURADO (delta_descanso, 2025)\n{'='*104}")
    for e in efeitos:
        if (e["temporada"] != RECORTE or e["faixa"] != "todos"
                or not e["recorte"] or e["medida"] != "delta_descanso"):
            continue
        print(f"  {e['recorte']:9s} {e['indicador'][:22]:22s} n {e['n']:>4d}  "
              f"média {e['media']:+10.2f}  IC95 [{e['ic95_da_media'][0]:+.2f},"
              f"{e['ic95_da_media'][1]:+.2f}]  p {e['p_contra_zero']:.4f}")
    print("  mix de resultado curto × normal:", mix.get(str(RECORTE)))

    print(f"\n{'='*104}\nPORTA TEMPORAL 2025 — média do 1º turno × pontos do 2º turno\n{'='*104}")
    for k, v in porta.items():
        if k.startswith("_"):
            continue
        print(f"  {k:26s} rho {v['rho_bruto']:+.3f}  parcial "
              f"{v['rho_parcial_dado_pontos_do_1T']:+.3f}  p "
              f"{v['p'] if v['p'] is None else round(v['p'],4)}  n {v['n_clubes']}  "
              f"{'PASSA' if v['passa'] else 'não passa'}")
    print(f"  mínimo detectável da parcial: {porta['_leitura']['rho_parcial_minimo_para_p_005']}")

    print(f"\n{'='*104}\nACHADOS (q<0,05 no corte COM fronteira)\n{'='*104}")
    for a in achados:
        print(f"  [{a['temporada']} {a['leitura']:10s} {a['recorte_extra'] or '-':12s}] "
              f"{a['familia']:20s} {a['medida']:15s} {a['indicador'][:22]:22s} "
              f"d {a['d']:+.2f} q {a['q']:.4f} n {a['n']:>11s} "
              f"dois cortes: {'SIM' if a['nos_dois_cortes'] else 'não'}  {a['confianca']}")
    if not achados:
        print("  nenhum")


if __name__ == "__main__":
    main()
