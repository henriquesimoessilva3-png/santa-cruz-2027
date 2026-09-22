#!/usr/bin/env python3
"""J09 — Alvos no exterior.

Pergunta: quais estrangeiros atendem o perfil de J05, com minutagem alta e regular na liga de
origem, depois do ajuste de J08?

O chão em que esta parte pisa está escrito, antes de rodar, em `resultados/J09_indicadores.json`.
Em uma linha: a ficha de J05 é descritiva, o backtest de J06 REPROVOU, J08 mediu e não existe
fator de conversão por liga estrangeira, e não existe dado físico em liga de origem nenhuma.
Por isso o teto de confiança desta parte é `indício`, declarado antes e não depois.

Este script escreve só arquivos J09*. Ele não roda o gerador da tela e não toca no _registro.md.
"""
import collections
import csv
import json
import math
import os
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

import numpy as np
import openpyxl
from scipy import stats

sys.path.insert(0, str(Path(__file__).resolve().parent))
import _metodo  # noqa: E402  o método da casa: cohen_d, bh, ic_por_clube, d_minimo
# A CHAVE DA FOTO. O `nkey` do painel temporal e' gerado pelo J08_base.nkey, que TIRA pontuacao:
# "I. Russo" vira "i russo". O nm() daqui embaixo mantem o ponto ("i. russo"), e por isso o
# cruzamento com a foto so' funcionava para quem tem o nome escrito por extenso — o brasileiro.
# Nas ligas de lingua espanhola, onde o Wyscout abrevia o primeiro nome, ele falhava quase
# sempre. Usar a MESMA funcao dos dois lados e' a unica forma de a chave nao divergir de novo.
from J08_base import nkey as nkey_foto  # noqa: E402

SCRIPTS = Path(__file__).resolve().parent
ESTUDO = SCRIPTS.parent
RES = ESTUDO / "resultados"
COPIA = ESTUDO / "dados_copiados"
XLSX = COPIA / "wyscout" / "xlsx_ago26"

HOJE = "2026-09-20"
ANO_DO_ARQUIVO = 2026
RNG = np.random.default_rng(20260920)

N = {}          # todo número publicado passa por aqui (regra 1 do portão)
AVISOS = []


def nm(t):
    t = unicodedata.normalize("NFD", str(t or ""))
    return "".join(c for c in t if unicodedata.category(c) != "Mn").lower().strip()


def f(v):
    try:
        x = float(v)
        return None if math.isnan(x) else x
    except (TypeError, ValueError):
        return None


# ==================================================================================================
# 0. A lista pré-declarada. O script PARA se ela não existir ou não disser que veio antes.
# ==================================================================================================
DECL = json.load(open(RES / "J09_indicadores.json", encoding="utf-8"))
assert DECL["declarado_antes_de_calcular"] is True, "a lista não se declara anterior ao cálculo"
assert DECL["parte"] == "J09"

CORTE_MIN = DECL["requisito_de_minutagem"]["corte_por_posicao"]
SETORES = {k: v for k, v in DECL["setores"].items() if isinstance(v, list)}
POS2SETOR = {p: s for s, ps in SETORES.items() for p in ps}
PRIORIZADAS = DECL["posicoes_priorizadas"]["lista"]
CONTA = DECL["ajuste_de_j08"]["por_familia"]
LIGA_MIN_JOGOS = 15
REGUA_MIN = 10          # jogadores de 900+ por (liga, setor) para a régua existir
# Brasil A SAIU desta lista em 21/09. Ela e' a Serie A: o mercado com o fator de conversao mais
# FORTE da tabela inteira (156 casos, forca forte, eficiencia com selo firme — contra 28 da
# Argentina A e 22 do Uruguai), e estava excluida por construcao porque esta parte nasceu
# perguntando por ESTRANGEIRO. A pergunta da casa e' outra: quem contratar. As CONCLUSOES desta
# parte continuam medidas so' no estrangeiro (a lista FORA, abaixo) — o que muda e' a base
# publicada, que a lista por posicao le.
LIGAS_FORA = {"Brasil B", "Brasil C", "Argentina RESERVAS"}

# O mercado de cada liga, na ordem de foco que o dono declarou em 21/09: Serie B primeiro (que
# nao esta aqui — e' a base de dentro), Serie A, sul-americanos, e o resto do exterior.
SULAMERICANAS = {"Argentina A", "Argentina B", "Uruguai", "Colombia A", "Colombia B", "Chile",
                 "Paraguai", "Peru", "Equador A", "Equador B", "Bolivia", "Venezuela"}


def mercado_da_liga(liga):
    if liga == "Brasil A":
        return "Série A"
    return "Sul-americano" if liga in SULAMERICANAS else "Exterior"


def EH_FORA(l):
    """O recorte das CONCLUSOES desta parte: estrangeiro, como sempre foi. A Serie A entra na
    base publicada e fica FORA de todo numero que uma conclusao cita."""
    return l["mercado"] != "Série A"


# Os dois indicadores do eixo da qualidade da chance (J06_ordenacao.json). Eles NAO entram na
# ficha de J05 e nao tocam conclusao nenhuma desta parte: existem para a LISTA por posicao poder
# ordenar quem vem de fora pela mesma regua de quem esta na Serie B. Ate 21/09 a tela afirmava
# que `Toques na area/90` nao existia em liga de origem — nao e' verdade, a coluna esta nas 115
# de todos os arquivos; o que nao existia era a extracao dela aqui. Familia `volume` no ajuste de
# J08, que e' a familia das duas.
EIXO = {"eixo_toques_area": "Touches in box per 90",
        "eixo_passes_progressivos": "Progressive passes per 90"}

IND = {}                # id -> {coluna, nome, bloco, familia_j08}
for bloco in ("bloco_duelo_corpo", "bloco_estilo_tecnico"):
    for it in DECL["a_ficha_que_sobra"][bloco]["indicadores"]:
        IND[it["id"]] = dict(it, bloco=bloco.replace("bloco_", ""))

# ==================================================================================================
# 1. Os pisos vêm de J05_perfil.csv. NÃO são reescolhidos aqui.
# ==================================================================================================
NOME2ID = {"Duelos defensivos ganhos, %": "duelos_def_ganhos_pct",
           "Duelos aéreos ganhos, %": "duelos_aereos_ganhos_pct",
           "Passes certos, %": "passes_certos_pct",
           "Passes progressivos/90": "passes_progressivos_90"}

MENOR_MELHOR = {"t_spr", "t505_90", "t505_180", "t_hsr_cod"}   # tempos: menor é melhor

PISO = collections.defaultdict(dict)      # setor -> id -> piso_pct (None = sem piso)
UNID = collections.defaultdict(dict)      # setor -> id -> piso em unidade de jogo (Série B)
FISICO_DA_POSICAO = collections.defaultdict(list)
for l in csv.DictReader(open(RES / "J05_perfil.csv", encoding="utf-8")):
    if l["no_perfil_curto"] != "1":
        continue
    if l["bloco"] == "fisico":
        # emenda 4: o bloco físico É montável. O id curto de J05 é o mesmo campo de
        # dados/jogadores.json, e o piso não é reaberto aqui.
        FISICO_DA_POSICAO[l["setor"]].append(l["nome"])
        IND[l["indicador"]] = {"id": l["indicador"], "coluna": l["indicador"],
                               "nome": l["nome"], "bloco": "fisico", "familia_j08": None}
        PISO[l["setor"]][l["indicador"]] = f(l["piso_pct"])
        UNID[l["setor"]][l["indicador"]] = f(l["piso_em_unidade_de_jogo"])
        continue
    iid = NOME2ID.get(l["indicador"])
    if iid:
        PISO[l["setor"]][iid] = f(l["piso_pct"])
        UNID[l["setor"]][iid] = f(l["piso_em_unidade_de_jogo"])

# O goleiro, pela ressalva já declarada: o duelo aéreo dele foi descartado por J03-3.
GK_AEREO_DESCARTADO = PISO["Goleiro"].pop("duelos_aereos_ganhos_pct", None) is not None
UNID["Goleiro"].pop("duelos_aereos_ganhos_pct", None)

EXIGENCIAS = {s: [i for i, p in PISO[s].items() if p is not None] for s in SETORES}
N["gk_exigencias"] = len(EXIGENCIAS["Goleiro"])
N["gk_exigencias_sao_so_passe"] = all(IND[i]["bloco"] == "estilo_tecnico"
                                      for i in EXIGENCIAS["Goleiro"])

# ==================================================================================================
# 2. O fator de liga de J08 (destino Brasil B) e a curva de idade que o próprio J08 recalculou.
# ==================================================================================================
FATOR, FORCA, CASOS = {}, {}, {}
for l in csv.DictReader(open(RES / "fatores_liga.csv", encoding="utf-8")):
    if l["destino"] != "Brasil B":
        continue
    FATOR[(l["liga"], l["familia"])] = f(l["fator"])
    FORCA[l["liga"]] = l["forca"]
    CASOS[l["liga"]] = f(l["casos"])
N["ligas_com_fator"] = len({k[0] for k in FATOR})
N["ligas_forca_forte"] = sum(1 for lg, fo in FORCA.items() if fo == "forte")

_bins = collections.defaultdict(list)
for l in csv.DictReader(open(RES / "J08_base.csv", encoding="utf-8")):
    a, d = f(l.get("idade_antes")), f(l.get("dqz_esperado_idade"))
    if a is not None and d is not None:
        _bins[int(a // 2) * 2].append(d)
CURVA_IDADE = {k: float(np.mean(v)) for k, v in _bins.items()}
N["curva_idade_bins"] = len(CURVA_IDADE)


def envelhecimento_pp(idade, pct_origem):
    """100 · φ(qz) · dqz_esperado_idade — a forma que J08 publicou em a_conta_para_o_J09."""
    if idade is None or pct_origem is None:
        return 0.0
    b = int(idade // 2) * 2
    dq = CURVA_IDADE.get(b)
    if dq is None and CURVA_IDADE:
        dq = CURVA_IDADE[min(CURVA_IDADE, key=lambda k: abs(k - b))]
    qz = stats.norm.ppf(min(max(pct_origem, 0.5), 99.5) / 100.0)
    return 100.0 * float(stats.norm.pdf(qz)) * float(dq or 0.0)


def ajustar(pct_origem, liga, familia, idade):
    """A conta INTEIRA de J08. Não é multiplicador."""
    if pct_origem is None:
        return None, None
    c = CONTA[familia]
    fator = FATOR.get((liga, familia))
    if fator is None:
        return None, None
    delta = (c["intercepto"] + c["b"] * pct_origem
             + c["coef_idade"] * envelhecimento_pp(idade, pct_origem) + fator)
    return max(0.0, min(100.0, pct_origem + delta)), round(delta, 2)


# ==================================================================================================
# 3. A base: os Excels das ligas de fora.
# ==================================================================================================
COLS = ["Player", "Team within selected timeframe", "Position", "Age", "Contract expires",
        "Matches played", "Minutes played", "Birth country", "Passport country",
        "Market value", "Foot", "Height"]
COLS += list(EIXO.values())
for it in IND.values():
    if it["familia_j08"]:
        COLS.append(it["coluna"])

base, diag_liga = [], []
for caminho in sorted(XLSX.glob("*.xlsx")):
    liga = caminho.name.split("_", 1)[1].replace(".xlsx", "")
    if liga in LIGAS_FORA:
        continue
    wb = openpyxl.load_workbook(caminho, read_only=True, data_only=True)
    ws = wb["BASE"]
    it = ws.iter_rows(values_only=True)
    hdr = list(next(it))
    ix = {c: hdr.index(c) for c in COLS if c in hdr}
    linhas = []
    for r in it:
        if not r or not r[0]:
            continue
        linhas.append({c: r[i] for c, i in ix.items()})
    wb.close()
    if not linhas:
        diag_liga.append({"liga": liga, "mercado": mercado_da_liga(liga), "linhas": 0,
                          "veredito": "arquivo vazio"})
        continue

    por_time = collections.defaultdict(list)
    for l in linhas:
        por_time[l.get("Team within selected timeframe")].append(l)
    jogos_max = max((f(l.get("Matches played")) or 0) for l in linhas)
    a = [sum(f(x.get("Minutes played")) or 0 for x in v) / 11 for v in por_time.values()]
    b = [max((f(x.get("Matches played")) or 0) for x in v) * 90 for v in por_time.values()]
    razao = (float(np.median(a)) / float(np.median(b))) if np.median(b) else 0.0

    veredito = "entra"
    if jogos_max < LIGA_MIN_JOGOS:
        veredito = f"temporada curta demais ({jogos_max:.0f} jogos)"
    elif not 0.90 <= razao <= 1.10:
        veredito = f"elenco cortado no export (razão {razao:.2f})"
    elif liga not in FORCA or FORCA[liga] == "sem fator":
        veredito = "liga sem fator de J08"
    diag_liga.append({"liga": liga, "mercado": mercado_da_liga(liga),
                      "linhas": len(linhas), "times": len(por_time),
                      "jogos_max": round(jogos_max), "razao_denominador": round(razao, 3),
                      "forca_do_fator": FORCA.get(liga, "sem fator"),
                      "casos_j08": CASOS.get(liga, 0), "veredito": veredito})
    if veredito != "entra":
        continue

    for time, v in por_time.items():
        # emenda 3: o maior dos dois denominadores. Quando o export traz o elenco inteiro isto é
        # a fórmula de J01; quando ele cortou gente, o segundo termo segura a fatia.
        soma11 = sum(f(x.get("Minutes played")) or 0 for x in v) / 11
        jogos90 = max((f(x.get("Matches played")) or 0) for x in v) * 90
        tempo = max(soma11, jogos90)
        cortado = bool(jogos90) and (soma11 / jogos90) < 0.95
        for l in v:
            pos = (str(l.get("Position") or "").split(",")[0] or "").strip()
            setor = POS2SETOR.get(pos)
            if not setor:
                continue
            mins = f(l.get("Minutes played")) or 0
            base.append({
                "jogador": l.get("Player"), "liga": liga, "time": time,
                "posicao": pos, "setor": setor,
                "idade": f(l.get("Age")), "minutos": mins,
                "jogos": f(l.get("Matches played")) or 0,
                "fatia_pct": round(100 * mins / tempo, 1) if tempo else None,
                "elenco_cortado": cortado, "elenco_no_export": len(v),
                "contrato": str(l.get("Contract expires") or "")[:10],
                "nascido_em": l.get("Birth country"),
                "passaporte": l.get("Passport country"),
                "mercado": mercado_da_liga(liga),
                "valor_mercado": f(l.get("Market value")),
                "pe": l.get("Foot"), "altura": f(l.get("Height")),
                **{i: f(l.get(IND[i]["coluna"])) for i in IND if IND[i]["familia_j08"]},
                **{k: f(l.get(c)) for k, c in EIXO.items()},
            })

N["ligas_lidas"] = sum(1 for d in diag_liga if d["mercado"] != "Série A")
N["ligas_que_entram"] = sum(1 for d in diag_liga if d["mercado"] != "Série A" and d["veredito"] == "entra")
N["ligas_fora_por_temporada_curta"] = sum(1 for d in diag_liga if d["mercado"] != "Série A" and "curta" in d["veredito"])
N["ligas_fora_por_export"] = sum(1 for d in diag_liga if d["mercado"] != "Série A" and "cortado" in d["veredito"])
N["ligas_fora_sem_fator"] = sum(1 for d in diag_liga if d["mercado"] != "Série A" and "sem fator" in d["veredito"])
N["base_linhas"] = sum(1 for l in base if EH_FORA(l))
N["times_com_elenco_cortado"] = len({(l["liga"], l["time"]) for l in base
                                     if l["elenco_cortado"] and EH_FORA(l)})
N["times_na_base"] = len({(l["liga"], l["time"]) for l in base if EH_FORA(l)})
N["base_linhas_serie_a"] = sum(1 for l in base if not EH_FORA(l))

# ==================================================================================================
# 3b. A ponte com dados/jogadores.json (emenda 4): físico, faixa salarial e valor de mercado.
#     A chave é (nome curto, time, liga) — as três partes da primary_key do Wyscout.
#     dados/ é LIDO, nunca alterado.
# ==================================================================================================
APP = json.load(open(ESTUDO.parent.parent / "dados" / "jogadores.json", encoding="utf-8"))
APP = APP if isinstance(APP, list) else (APP.get("jogadores") or list(APP.values())[0])
IDX = collections.defaultdict(list)
for x in APP:
    IDX[(nm(x.get("n")), nm(x.get("t")), nm(x.get("l")))].append(x)

FIS_IDS = sorted({i for s_ in SETORES for i in PISO[s_] if IND[i]["familia_j08"] is None})
casou = ambiguo = com_fis = com_sal = 0
for l in base:
    v = IDX.get((nm(l["jogador"]), nm(l["time"]), nm(l["liga"])), [])
    l["na_base_do_app"] = len(v) == 1
    l["ponte_ambigua"] = len(v) > 1
    ambiguo += (len(v) > 1) and EH_FORA(l)
    if len(v) != 1:
        l["fisico_rastreado"] = False
        continue
    casou += EH_FORA(l)
    x = v[0]
    # §4.1: o físico exige minutos rastreados. min_tot = minutos por jogo × jogos rastreados.
    mt = (f(x.get("sc_min")) or 0) * (f(x.get("sc_n")) or 0)
    l["sc_min_tot"] = round(mt)
    l["fisico_rastreado"] = bool(x.get("psv5")) and mt >= 300
    l["faixa_salarial"] = x.get("sal") or ""
    l["valor_tr"] = x.get("mv")
    com_sal += bool(x.get("sal")) and EH_FORA(l)
    if l["fisico_rastreado"]:
        com_fis += EH_FORA(l)
        for i in FIS_IDS:
            l[i] = f(x.get(i))
N["ponte_app_casou"] = casou
N["ponte_app_ambigua"] = ambiguo
N["ponte_app_pct"] = round(100 * casou / max(sum(1 for l in base if EH_FORA(l)), 1), 1)
N["com_fisico_rastreado"] = com_fis
N["com_faixa_salarial"] = com_sal

# ==================================================================================================
# 4. Percentil dentro de (liga, setor), entre os de 900+ minutos. Nunca imputar.
# ==================================================================================================
reguas = collections.defaultdict(list)
for l in base:
    if l["minutos"] >= 900:
        reguas[(l["liga"], l["setor"])].append(l)

for (liga, setor), grupo in reguas.items():
    if len(grupo) < REGUA_MIN:
        continue
    for i in IND:
        # o físico só entra entre quem tem linha rastreada; o técnico, entre todos os 900+
        vals = [(g[i], g) for g in grupo if g.get(i) is not None
                and (IND[i]["familia_j08"] is not None or g.get("fisico_rastreado"))]
        if len(vals) < REGUA_MIN:
            continue
        sinal = -1 if i in MENOR_MELHOR else 1        # tempo: menor é melhor
        ordem = stats.rankdata([sinal * v for v, _ in vals])
        for (v, g), r in zip(vals, ordem):
            g[f"{i}__pct"] = round(100 * (r - 1) / (len(vals) - 1), 1)

# O EIXO, no mesmo percentil por (liga, setor) dos 900+ e depois na escala da Serie B pelo fator
# de J08 (familia `volume`, que e' a das duas medidas). Ele nao entra na ficha e nao toca
# conclusao nenhuma: serve para a lista por posicao ordenar todos os mercados pela MESMA regua,
# que e' o que "mesmo plano" quer dizer. Sem isto, quem vem de fora era ordenado por metade do
# eixo e quem esta na Serie B pelo eixo inteiro — comparacao que a tela fazia sem dizer.
for (liga, setor), grupo in reguas.items():
    if len(grupo) < REGUA_MIN:
        continue
    for k in EIXO:
        vals = [(g[k], g) for g in grupo if g.get(k) is not None]
        if len(vals) < REGUA_MIN:
            continue
        ordem = stats.rankdata([v for v, _ in vals])
        for (v, g), r in zip(vals, ordem):
            g[f"{k}__pct"] = round(100 * (r - 1) / (len(vals) - 1), 1)

for l in base:
    for k in EIXO:
        adj, delta = ajustar(l.get(f"{k}__pct"), l["liga"], "volume", l["idade"])
        l[f"{k}__adj"] = None if adj is None else round(adj, 1)
        l[f"{k}__delta"] = delta

N["eixo_com_toques_area"] = sum(1 for l in base if l.get("eixo_toques_area__pct") is not None)
N["eixo_com_passes_progressivos"] = sum(
    1 for l in base if l.get("eixo_passes_progressivos__pct") is not None)
N["eixo_com_os_dois"] = sum(1 for l in base if l.get("eixo_toques_area__pct") is not None
                            and l.get("eixo_passes_progressivos__pct") is not None)

N["reguas"] = sum(1 for (lg, _s) in reguas if mercado_da_liga(lg) != "Série A")
N["reguas_curtas"] = sum(1 for (lg, _s), g in reguas.items()
                         if len(g) < REGUA_MIN and mercado_da_liga(lg) != "Série A")

# ==================================================================================================
# 5. Minutagem alta e REGULAR, pelas fotos por temporada.
# ==================================================================================================
fotos = json.load(open(COPIA / "wyscout" / "_temporal_photos.json", encoding="utf-8"))
alta_por_temporada = collections.defaultdict(dict)     # (liga, nkey) -> {temporada: bool}
ambiguos = set()
for temp in DECL["recorte"]["temporadas_da_regularidade"]:
    por_time = collections.defaultdict(list)
    vistos = collections.defaultdict(set)
    for r in fotos.get(temp, []):
        por_time[(r["league"], r["team"])].append(r)
        vistos[(r["league"], r["nkey"])].add(r["team"])
    for (liga, _t), v in por_time.items():
        tempo = max(sum(r["minutes"] for r in v) / 11, max(r["minutes"] for r in v))
        if not tempo:
            continue
        for r in v:
            setor = POS2SETOR.get(str(r.get("position") or ""))
            corte = CORTE_MIN.get(setor) if setor else None
            if corte is None:
                # a foto guarda a posição-raiz, não a sigla: cai no corte da raiz
                corte = {"ZAG": 56.8, "LAT": 46.8, "VOL": 51.0, "MED": 51.0,
                         "MEI": 42.5, "EXT": 32.4, "ATA": 34.2}.get(r.get("root"))
            if corte is None:
                continue
            alta_por_temporada[(liga, r["nkey"])][temp] = (100 * r["minutes"] / tempo) >= corte
    for k, times in vistos.items():
        if len(times) > 1:
            ambiguos.add(k)

N["fotos_homonimos_descartados"] = len(ambiguos)

# A fatia de minutos de cada jogador em cada temporada da foto, pela MESMA fórmula de J01.
# É o que conserta o denominador do backtest (emenda 2) e o que dá a regularidade na origem.
FATIA_FOTO = {}          # (liga, temporada, nkey) -> fatia em %
for _temp, _linhas in fotos.items():
    _pt = collections.defaultdict(list)
    _vistos = collections.defaultdict(set)
    for r in _linhas:
        _pt[(r["league"], r["team"])].append(r)
        _vistos[(r["league"], r["nkey"])].add(r["team"])
    for (_liga, _t), v in _pt.items():
        # a foto não traz jogos; o piso do denominador é o maior minuto do time, que é o teto
        # que um jogador daquele elenco atingiu (emenda 3, mesma direção conservadora).
        tempo = max(sum(r["minutes"] for r in v) / 11, max(r["minutes"] for r in v))
        if not tempo:
            continue
        for r in v:
            k = (_liga, r["nkey"])
            if len(_vistos[k]) > 1:
                continue
            FATIA_FOTO[(_liga, _temp, r["nkey"])] = 100 * r["minutes"] / tempo

for l in base:
    k = (l["liga"], nkey_foto(l["jogador"]))
    hist = {} if k in ambiguos else alta_por_temporada.get(k, {})
    l["temporadas_com_dado"] = len(hist)
    l["temporadas_altas"] = sum(1 for v in hist.values() if v)
    l["homonimo_na_foto"] = k in ambiguos
    corte = CORTE_MIN[l["setor"]]
    l["minutagem_alta"] = (l["fatia_pct"] or 0) >= corte
    l["minutagem_regular"] = (l["temporadas_com_dado"] >= 2 and l["temporadas_altas"] >= 2)
    # O painel temporal do Wyscout não tem uma única linha de goleiro (J08). Para o goleiro a
    # regularidade é INVERIFICÁVEL — o que é diferente de ser baixa.
    l["regularidade_verificavel"] = (l["setor"] != "Goleiro")
    l["corte_da_posicao"] = corte

N["gk_na_base"] = sum(1 for l in base if l["setor"] == "Goleiro" and EH_FORA(l))
N["gk_com_minutagem_alta"] = sum(1 for l in base if l["setor"] == "Goleiro"
                                 and l["minutagem_alta"] and EH_FORA(l))
N["gk_regularidade_verificavel"] = sum(1 for l in base if l["setor"] == "Goleiro"
                                       and l["regularidade_verificavel"] and EH_FORA(l))
N["fotos_sem_goleiro"] = sum(1 for temp in fotos for r in fotos[temp] if r.get("root") == "GK") == 0
N["com_minutagem_alta"] = sum(1 for l in base if l["minutagem_alta"] and EH_FORA(l))
N["com_minutagem_alta_e_regular"] = sum(1 for l in base if l["minutagem_alta"]
                                        and l["minutagem_regular"] and EH_FORA(l))

# ==================================================================================================
# 6. O ajuste de J08 e as duas leituras do piso (emenda declarada antes de rodar).
# ==================================================================================================
for l in base:
    viola_orig, viola_adj, com_dado = [], [], 0
    for i, piso in PISO[l["setor"]].items():
        po = l.get(f"{i}__pct")
        if po is None:
            continue
        com_dado += 1
        if IND[i]["familia_j08"] is None:
            # J08 não tem família física: não existe conversão para o físico. O percentil do
            # estrangeiro é o lugar dele na régua da PRÓPRIA liga, sem tradução.
            adj, delta = po, 0.0
        else:
            adj, delta = ajustar(po, l["liga"], IND[i]["familia_j08"], l["idade"])
        l[f"{i}__adj"] = adj
        l[f"{i}__delta"] = delta
        if piso is None:
            continue
        if po < piso:
            viola_orig.append(i)
        if adj is None or adj < piso:
            viola_adj.append(i)
    l["indicadores_com_dado"] = com_dado
    l["exigencias_da_posicao"] = len(EXIGENCIAS[l["setor"]])
    l["viola_na_origem"] = ";".join(viola_orig)
    l["viola_no_ajustado"] = ";".join(viola_adj)
    l["passa_ficha_origem"] = (com_dado >= 2 and not viola_orig and len(EXIGENCIAS[l["setor"]]) > 0)
    l["passa_ficha_ajustado"] = (com_dado >= 2 and not viola_adj and len(EXIGENCIAS[l["setor"]]) > 0)
    for bloco in ("fisico", "duelo_corpo", "estilo_tecnico"):
        ids = [i for i in PISO[l["setor"]] if IND[i]["bloco"] == bloco and PISO[l["setor"]][i]]
        ok = [i for i in ids if l.get(f"{i}__pct") is not None]
        l[f"nota_{bloco}"] = ("sem dado" if not ok else
                              ("atende" if all(i not in viola_orig for i in ok) else "não atende"))
    if not l.get("fisico_rastreado"):
        l["nota_fisico"] = "NÃO VERIFICADO"
    l["fisico_da_posicao"] = "; ".join(FISICO_DA_POSICAO.get(l["setor"], [])) or "não há métrica física nesta posição"
    l["fisico_sem_conversao"] = True
    l["ocupa_vaga_de_estrangeiro"] = (nm(l["nascido_em"]) != "brazil")
    l["forca_do_fator"] = FORCA.get(l["liga"], "sem fator")
    l["casos_do_fator"] = CASOS.get(l["liga"], 0)

# Quantos chegam ao piso em CADA leitura — a emenda manda publicar as duas contagens.
# O ELEGIVEL das conclusoes e' so' estrangeiro, como sempre foi: a Serie A entrou na base para a
# LISTA por posicao, nao para mudar numero que uma conclusao ja publicada cita.
elegivel = [l for l in base if l["minutagem_alta"] and l["minutagem_regular"]
            and l["indicadores_com_dado"] >= 2 and EH_FORA(l)]
N["elegiveis_com_dado"] = len(elegivel)
N["passa_piso_na_origem"] = sum(1 for l in elegivel if l["passa_ficha_origem"])
N["passa_piso_no_ajustado"] = sum(1 for l in elegivel if l["passa_ficha_ajustado"])

# O teto aritmético do ajuste, por família: o que a reta de J08 permite, no melhor caso.
TETO = {}
for fam, c in CONTA.items():
    melhor = max((100 + c["intercepto"] + c["b"] * 100 + fv)
                 for (lg, fm), fv in FATOR.items() if fm == fam and fv is not None)
    TETO[fam] = round(melhor, 1)
N["teto_eficiencia"] = TETO["eficiencia"]
N["teto_volume"] = TETO["volume"]

# A reta de J08 tem um ponto fixo: abaixo dele ela PROMOVE, acima dela ela REBAIXA. É o que o
# encolhimento significa aplicado a um jogador em vez de a uma média.
for fam, c in CONTA.items():
    N[f"ponto_fixo_{fam}"] = round(c["intercepto"] / -c["b"], 1)
sobe = desce = 0
for l in elegivel:
    for i in PISO[l["setor"]]:
        if IND[i]["familia_j08"] is None:
            continue
        po, adj = l.get(f"{i}__pct"), l.get(f"{i}__adj")
        if po is None or adj is None:
            continue
        sobe += adj > po
        desce += adj < po
N["ajuste_promove"] = sobe
N["ajuste_rebaixa"] = desce
N["ajuste_medidas"] = sobe + desce

pisos_inalcancaveis = []
for s in SETORES:
    for i, piso in PISO[s].items():
        fam = IND[i]["familia_j08"]
        if piso is None or fam is None:
            continue            # o físico não passa pela reta de J08: não tem teto aritmético
        if piso > TETO[fam]:
            pisos_inalcancaveis.append(f"{s}: {IND[i]['nome']} (piso {piso:.0f})")
N["pisos_inalcancaveis"] = len(pisos_inalcancaveis)
N["pisos_com_exigencia"] = sum(1 for s in SETORES for i, p in PISO[s].items()
                               if p is not None and IND[i]["familia_j08"] is not None)
N["pisos_fisicos_com_exigencia"] = sum(1 for s in SETORES for i, p in PISO[s].items()
                                       if p is not None and IND[i]["familia_j08"] is None)
N["pisos_inalcancaveis_lista"] = " · ".join(pisos_inalcancaveis) or "nenhum"

# ==================================================================================================
# 7. O backtest próprio do J09: o filtro testado no movimento que ele descreve.
# ==================================================================================================
PONTE = {"América Mineiro": "América-MG", "Athletic Club": "Athletic",
         "Athletico Paranaense": "Athletico-PR", "Atlético GO": "Atlético-GO",
         "Botafogo SP": "Botafogo-SP", "Operário PR": "Operário-PR",
         "Sport Recife": "Sport", "São Bernardo FC": "São Bernardo"}
fronteira = {}
for l in csv.DictReader(open(RES / "A01_clube_temporada.csv", encoding="utf-8")):
    fronteira[(l["temporada"], l["clube"])] = l["fronteira"] == "1"

COL_PCT = {"duelos_def_ganhos_pct": "duelos_def_ganhos_pct_pct_antes",
           "duelos_aereos_ganhos_pct": "duelos_aereos_ganhos_pct_pct_antes",
           "passes_certos_pct": "passes_certos_pct_pct_antes",
           "passes_progressivos_90": "passes_progressivos_90_pct_antes"}
ROOT2SETOR = {"ZAG": "Zaga", "LAT": "Lateral", "VOL": "Volante", "MED": "Volante",
              "MEI": "Meia", "EXT": "Extremo", "ATA": "Atacante"}

# O corte de minutagem na origem é o mesmo de J05, sobre a fatia medida na FOTO da liga de origem
# (emenda 2): minutos / (soma do elenco do time / 11). Nunca sobre o maior min_antes das chegadas.
j08 = [l for l in csv.DictReader(open(RES / "J08_base.csv", encoding="utf-8"))
       if l["liga_destino"] == "Brasil B"
       and l["liga_origem"] not in {"Brasil A", "Brasil B", "Brasil C"}]


def fatia_na_origem(liga, ano, jogador):
    """A fatia do ano de origem. `jun26` é a foto de 2026 no painel temporal."""
    chave = "jun26" if str(ano) == "2026" else str(ano)
    return FATIA_FOTO.get((liga, chave, nkey_foto(jogador)))


def regular_na_origem(liga, ano, jogador, setor):
    """Alta em pelo menos 2 das temporadas com dado, com pelo menos 2 temporadas com dado."""
    corte = CORTE_MIN[setor]
    com, altas = 0, 0
    for k in range(3):
        a = int(ano) - k
        v = fatia_na_origem(liga, a, jogador)
        if v is None:
            continue
        com += 1
        altas += (v >= corte)
    return (com >= 2 and altas >= 2), com

bt = []
for l in j08:
    setor = ROOT2SETOR.get(l["root_antes"])
    if not setor:
        continue
    fatia = fatia_na_origem(l["liga_origem"], l["ano_antes"], l["jogador"])
    if fatia is None:
        continue
    alta = fatia >= CORTE_MIN[setor]
    regular, temps = regular_na_origem(l["liga_origem"], l["ano_antes"], l["jogador"], setor)
    viola = []
    com_dado = 0
    for i, piso in PISO[setor].items():
        if i not in COL_PCT:
            # O backtest testa só a parte TÉCNICA do filtro: J08_base.csv não tem físico, e o
            # físico que existe hoje (dados/jogadores.json) é a foto de ago26 — é o dado do ano
            # errado para uma chegada de 2024. Declarado como limite, não varrido.
            continue
        po = f(l.get(COL_PCT[i]))
        if po is None:
            continue
        com_dado += 1
        if piso is None:
            continue
        adj, _ = ajustar(po, l["liga_origem"], IND[i]["familia_j08"], f(l["idade_antes"]))
        if adj is None or adj < piso:
            viola.append(i)
    clube = PONTE.get(l["clube_depois"], l["clube_depois"])
    bt.append({
        "jogador": l["jogador"], "setor": setor, "liga_origem": l["liga_origem"],
        "ano": l["ano_depois"], "clube": clube,
        "na_fronteira": fronteira.get((l["ano_depois"], clube), False),
        "clube_sem_ponte": (l["ano_depois"], clube) not in fronteira,
        "minutagem_alta": alta, "fatia_origem": round(fatia, 1),
        "minutagem_alta_e_regular": alta and regular, "temporadas_com_dado": temps,
        "indicadores_com_dado": com_dado,
        "duelo_corpo": com_dado > 0 and not [v for v in viola if IND[v]["bloco"] == "duelo_corpo"],
        "estilo_tecnico": com_dado > 0 and not [v for v in viola if IND[v]["bloco"] == "estilo_tecnico"],
        "filtro_j09": alta and regular and com_dado >= 2 and not viola,
        "so_a_parte_tecnica": True,
        "minutos": f(l["min_depois"]) or 0,
        "jogou_900": 1.0 if (f(l["min_depois"]) or 0) >= 900 else 0.0,
    })

N["bt_so_parte_tecnica"] = True
N["bt_pisos_testados"] = len(COL_PCT)
N["bt_pisos_fora_por_falta_de_fisico"] = N["pisos_fisicos_com_exigencia"]
N["bt_chegadas_na_base_j08"] = len(j08)
N["bt_chegadas"] = len(bt)
N["bt_sem_foto_na_origem"] = len(j08) - len(bt) - sum(
    1 for l in j08 if ROOT2SETOR.get(l["root_antes"]) is None)
N["bt_sem_setor"] = sum(1 for l in j08 if ROOT2SETOR.get(l["root_antes"]) is None)
N["bt_alta"] = sum(1 for r in bt if r["minutagem_alta"])
N["bt_alta_e_regular"] = sum(1 for r in bt if r["minutagem_alta_e_regular"])
N["bt_sem_ponte_de_clube"] = sum(1 for r in bt if r["clube_sem_ponte"])
N["bt_na_fronteira"] = sum(1 for r in bt if r["na_fronteira"])

# posto do desfecho dentro de (setor, ano) — a régua da casa, nunca o bruto entre anos
for chave in ("minutos", "jogou_900"):
    if chave == "jogou_900":
        for r in bt:
            r["jogou_900::pct"] = r["jogou_900"]
        continue
    por = collections.defaultdict(list)
    for r in bt:
        por[(r["setor"], r["ano"])].append(r)
    for grupo in por.values():
        if len(grupo) < 2:
            for r in grupo:
                r["minutos::pct"] = 50.0
            continue
        ordem = stats.rankdata([r["minutos"] for r in grupo])
        for r, o in zip(grupo, ordem):
            r["minutos::pct"] = 100 * (o - 1) / (len(grupo) - 1)

GRUPOS = ["filtro_j09", "minutagem_alta", "minutagem_alta_e_regular",
          "duelo_corpo", "estilo_tecnico"]
DESFECHOS = ["minutos", "jogou_900"]
CORTES = [("com", lambda r: True), ("sem", lambda r: not r["na_fronteira"])]
PISO_LADO = DECL["backtest_proprio_do_j09"]["n_minimo_por_lado"]

testes = []
for grupo in GRUPOS:
    for desfecho in DESFECHOS:
        for rot, filtro in CORTES:
            linhas = [r for r in bt if filtro(r)]
            ps, itens = [], []
            for setor in ["Todos"] + sorted({r["setor"] for r in linhas}):
                sel = linhas if setor == "Todos" else [r for r in linhas if r["setor"] == setor]
                a = [r[f"{desfecho}::pct"] for r in sel if r[grupo]]
                b = [r[f"{desfecho}::pct"] for r in sel if not r[grupo]]
                if len(a) < PISO_LADO or len(b) < PISO_LADO:
                    continue
                _, p = stats.ttest_ind(a, b, equal_var=False)
                if math.isnan(p):
                    continue
                d = _metodo.cohen_d(a, b)
                base_ic = [dict(r, **{"clube": r["clube"]}) for r in sel]
                lo, hi = _metodo.ic_por_clube(
                    base_ic, f"{desfecho}::pct",
                    (lambda g=grupo: (lambda r: r[g]))(),
                    (lambda g=grupo: (lambda r: not r[g]))(), 1, RNG, reps=800)
                ca = [r[desfecho] for r in sel if r[grupo]]
                cb = [r[desfecho] for r in sel if not r[grupo]]
                itens.append({"grupo": grupo, "desfecho": desfecho, "fronteira": rot,
                              "setor": setor, "n_a": len(a), "n_b": len(b),
                              "cru_a": round(float(np.mean(ca)), 1),
                              "cru_b": round(float(np.mean(cb)), 1),
                              "d": round(d, 3), "ic95_lo": lo, "ic95_hi": hi,
                              "p": round(float(p), 5),
                              "d_minimo_80": _metodo.d_minimo(len(a), len(b))})
                ps.append(float(p))
            for it, q in zip(itens, _metodo.bh(ps)):
                it["q"] = round(q, 5)
                it["selo"] = ("firme" if q < 0.05 else
                              ("pode ser sorte" if it["p"] < 0.05 else "sem diferença clara"))
                it["poder_suficiente"] = abs(it["d"]) >= it["d_minimo_80"]
            testes.extend(itens)

N["bt_testes"] = len(testes)
N["bt_familias"] = len(GRUPOS) * len(DESFECHOS) * len(CORTES)
N["bt_fora_por_n"] = (len(GRUPOS) * len(DESFECHOS) * len(CORTES)
                      * (1 + len({r["setor"] for r in bt})) - len(testes))


def achar(grupo, desfecho, setor, rot):
    for t in testes:
        if (t["grupo"], t["desfecho"], t["setor"], t["fronteira"]) == (grupo, desfecho, setor, rot):
            return t
    return None


# A regra do nível A, exatamente como declarada.
pri_com, pri_sem = achar("filtro_j09", "minutos", "Todos", "com"), achar("filtro_j09", "minutos", "Todos", "sem")
N["bt_aprovados"] = sum(1 for r in bt if r["filtro_j09"])
N["bt_aprovados_sem_fronteira"] = sum(1 for r in bt if r["filtro_j09"] and not r["na_fronteira"])
N["bt_piso_do_lado"] = PISO_LADO
if pri_com is None or pri_sem is None:
    NIVEL_A = False
    N["bt_por_que"] = ("o teste primário não entrou na tabela: o filtro aprova "
                       f"{N['bt_aprovados']} das {N['bt_chegadas']} chegadas, abaixo do piso "
                       f"de {PISO_LADO} por lado")
    for k in ("bt_d_com", "bt_q_com", "bt_d_sem", "bt_q_sem", "bt_min_a", "bt_min_b",
              "bt_n_a", "bt_n_b", "bt_dmin"):
        N[k] = None
else:
    NIVEL_A = (pri_com["d"] > 0 and pri_com["q"] < 0.05
               and pri_sem["d"] > 0 and pri_sem["q"] < 0.05)
    N.update(bt_d_com=pri_com["d"], bt_q_com=pri_com["q"], bt_d_sem=pri_sem["d"],
             bt_q_sem=pri_sem["q"], bt_min_a=pri_com["cru_a"], bt_min_b=pri_com["cru_b"],
             bt_n_a=pri_com["n_a"], bt_n_b=pri_com["n_b"], bt_dmin=pri_com["d_minimo_80"])
    N["bt_por_que"] = "passou" if NIVEL_A else "o primário não bate os dois cortes"
N["bt_nivel_A_passou"] = NIVEL_A
N["rotulo_dos_nomes"] = "alvo" if NIVEL_A else "rastrear"

# Diagnóstico à parte, fora do BH: a média bruta dos aprovados contra os reprovados.
apr = [r["minutos"] for r in bt if r["filtro_j09"]]
rep = [r["minutos"] for r in bt if not r["filtro_j09"]]
N["bt_diag_na"], N["bt_diag_nb"] = len(apr), len(rep)
N["bt_diag_min_a"] = round(float(np.mean(apr)), 1) if apr else None
N["bt_diag_min_b"] = round(float(np.mean(rep)), 1) if rep else None
N["bt_diag_min_a_int"] = round(float(np.mean(apr))) if apr else None
N["bt_diag_min_b_int"] = round(float(np.mean(rep))) if rep else None
if len(apr) >= 3 and len(rep) >= 3:
    N["bt_diag_d"] = round(_metodo.cohen_d([r["minutos::pct"] for r in bt if r["filtro_j09"]],
                                           [r["minutos::pct"] for r in bt if not r["filtro_j09"]]), 3)
    N["bt_diag_p"] = round(float(stats.ttest_ind(
        [r["minutos::pct"] for r in bt if r["filtro_j09"]],
        [r["minutos::pct"] for r in bt if not r["filtro_j09"]], equal_var=False)[1]), 5)
else:
    N["bt_diag_d"] = N["bt_diag_p"] = None

# O sinal que J06 achou, rodado aqui em quem vem de FORA — é a pergunta que J06 não pôde fazer.
mo_com = achar("minutagem_alta_e_regular", "minutos", "Todos", "com")
mo_sem = achar("minutagem_alta_e_regular", "minutos", "Todos", "sem")
ma_com = achar("minutagem_alta", "minutos", "Todos", "com")
ma_sem = achar("minutagem_alta", "minutos", "Todos", "sem")
for rot, t in (("com", ma_com), ("sem", ma_sem)):
    N[f"ma_d_{rot}"] = t["d"] if t else None
    N[f"ma_q_{rot}"] = t["q"] if t else None
    N[f"ma_dmin_{rot}"] = t["d_minimo_80"] if t else None
    N[f"ma_ic_{rot}"] = f"[{t['ic95_lo']}; {t['ic95_hi']}]" if t else None
    N[f"ma_n_a_{rot}"] = t["n_a"] if t else None
    N[f"ma_n_b_{rot}"] = t["n_b"] if t else None
    N[f"ma_min_a_{rot}"] = round(t["cru_a"]) if t else None
    N[f"ma_min_b_{rot}"] = round(t["cru_b"]) if t else None
if ma_com:
    N["ma_dif_int"] = round(ma_com["cru_a"] - ma_com["cru_b"])
    N["ma_dif_jogos"] = str(round((ma_com["cru_a"] - ma_com["cru_b"]) / 90, 1)).replace(".", ",")
    N["ma_poder_ok"] = bool(abs(ma_com["d"]) >= ma_com["d_minimo_80"]
                            and abs(ma_sem["d"]) >= ma_sem["d_minimo_80"])
j9_com = achar("minutagem_alta", "jogou_900", "Todos", "com")
j9_sem = achar("minutagem_alta", "jogou_900", "Todos", "sem")
for rot, t in (("com", j9_com), ("sem", j9_sem)):
    N[f"ma900_d_{rot}"] = t["d"] if t else None
    N[f"ma900_q_{rot}"] = t["q"] if t else None
    N[f"ma900_a_{rot}"] = round(100 * t["cru_a"]) if t else None
    N[f"ma900_b_{rot}"] = round(100 * t["cru_b"]) if t else None
# O FILTRO CHEIO no desfecho de 900 minutos. Ele nao tinha marcador ate 22/09, e por isso a
# discordancia entre os dois cortes de fronteira nao tinha como ser CITADA no texto sem digitar
# numero a mao — que a regra da casa proibe. A regra 3 do portao pede a citacao; publicar o
# numero e' o que torna a citacao possivel.
f9_com = achar("minutagem_alta_e_regular", "jogou_900", "Todos", "com")
f9_sem = achar("minutagem_alta_e_regular", "jogou_900", "Todos", "sem")
for rot, t in (("com", f9_com), ("sem", f9_sem)):
    N[f"filtro900_d_{rot}"] = t["d"] if t else None
    N[f"filtro900_q_{rot}"] = t["q"] if t else None
    N[f"filtro900_a_{rot}"] = round(100 * t["cru_a"]) if t else None
    N[f"filtro900_b_{rot}"] = round(100 * t["cru_b"]) if t else None
    N[f"filtro900_n_a_{rot}"] = t["n_a"] if t else None
    N[f"filtro900_n_b_{rot}"] = t["n_b"] if t else None

for rot, t in (("com", mo_com), ("sem", mo_sem)):
    N[f"mo_d_{rot}"] = t["d"] if t else None
    N[f"mo_q_{rot}"] = t["q"] if t else None
    N[f"mo_dmin_{rot}"] = t["d_minimo_80"] if t else None
if mo_com:
    N.update(mo_min_a=mo_com["cru_a"], mo_min_b=mo_com["cru_b"],
             mo_min_a_int=round(mo_com["cru_a"]), mo_min_b_int=round(mo_com["cru_b"]),
             mo_n_a=mo_com["n_a"], mo_n_b=mo_com["n_b"],
             mo_ic=f"[{mo_com['ic95_lo']}; {mo_com['ic95_hi']}]",
             mo_dif=round(mo_com["cru_a"] - mo_com["cru_b"]),
             mo_dif_jogos=str(round((mo_com["cru_a"] - mo_com["cru_b"]) / 90, 1)).replace(".", ","))
N["bt_no_bh"] = sum(1 for t in testes if t["q"] < 0.05)
N["bt_no_bh_dois_cortes"] = sum(
    1 for t in testes if t["fronteira"] == "com" and t["q"] < 0.05
    and (achar(t["grupo"], t["desfecho"], t["setor"], "sem") or {}).get("q", 1) < 0.05
    and np.sign(t["d"]) == np.sign((achar(t["grupo"], t["desfecho"], t["setor"], "sem") or {}).get("d", 0)))

# ==================================================================================================
# 8. A lista, posição por posição. Nível C onde a ficha não pode escolher.
# ==================================================================================================
JANELA = re.search(r"\d{4}-\d{2}-\d{2}", DECL["contrato"]["janela_de_interesse"]).group(0)
assert JANELA == "2027-06-30", JANELA


def na_janela(l):
    """Contrato vencendo até a janela. DESCRIÇÃO e ordenação, nunca filtro (declarado)."""
    c = (l.get("contrato") or "").strip()
    return bool(c) and c <= JANELA


def media_ajustada(l):
    vals = [l.get(f"{i}__adj") for i in PISO[l["setor"]] if l.get(f"{i}__adj") is not None]
    return float(np.mean(vals)) if vals else -1.0


def ordenar(l):
    """Contrato na janela primeiro (o análogo de 'livres primeiro' do J06); dentro disso, a
    ordenação que J08-3 autoriza: entre estrangeiros, quem sobra mais depois do encolhimento."""
    return (na_janela(l), media_ajustada(l), l["fatia_pct"] or 0)


alvos, rastreio, por_posicao = [], [], {}
for setor in SETORES:
    cand = [l for l in elegivel if l["setor"] == setor]
    if setor == "Goleiro":
        cand = [l for l in base if l["setor"] == "Goleiro" and l["minutagem_alta"]
                and l["indicadores_com_dado"] >= 2 and EH_FORA(l)]
    com_fator = [l for l in cand if l["forca_do_fator"] != "sem fator"]
    passa = [l for l in com_fator if l["passa_ficha_origem"]]
    passa_adj = [l for l in com_fator if l["passa_ficha_ajustado"]]
    nivel = "B"
    motivo = ""
    if not EXIGENCIAS[setor]:
        nivel, motivo = "C", "a ficha desta posição não tem uma única exigência que possa reprovar alguém"
    elif setor == "Goleiro":
        nivel, motivo = "C", ("três buracos ao mesmo tempo: o que sobra da ficha são dois números de "
                              "passe (o físico não existe, o duelo defensivo não tem piso e o aéreo foi "
                              "descartado em J03), o painel temporal não tem uma linha de goleiro e por "
                              "isso a regularidade é inverificável, e J08 não tem fator para goleiro")
    elif not passa:
        nivel, motivo = "C", "ninguém atravessa o funil com dado nos dois blocos montáveis"
    escolhidos = [] if nivel == "C" else sorted(passa, key=ordenar, reverse=True)[:5]
    for l in cand:
        l["contrato_na_janela"] = na_janela(l)
        l["media_ajustada"] = round(media_ajustada(l), 1)
    # Quanto cada bloco aprova sozinho, e os dois juntos: é o diagnóstico da conjunção que J06
    # apontou como a causa do mercado vazio.
    so_fisico = [l for l in com_fator if l["nota_fisico"] == "atende"]
    so_duelo = [l for l in com_fator if l["nota_duelo_corpo"] == "atende"]
    so_estilo = [l for l in com_fator if l["nota_estilo_tecnico"] == "atende"]
    com_fis = [l for l in com_fator if l.get("fisico_rastreado")]
    por_posicao[setor] = {
        "priorizada": setor in PRIORIZADAS,
        "candidatos_com_minutagem": len(cand),
        "com_fator_de_liga": len(com_fator),
        "passa_piso_na_origem": len(passa),
        "passa_piso_no_ajustado": len(passa_adj),
        "exigencias": len(EXIGENCIAS[setor]),
        "nivel": nivel, "motivo": motivo, "publicados": len(escolhidos),
        "so_o_bloco_fisico": len(so_fisico), "com_linha_fisica": len(com_fis),
        "so_o_bloco_duelo_corpo": len(so_duelo), "so_o_bloco_estilo_tecnico": len(so_estilo),
        "os_dois_blocos_juntos": len(passa),
        "com_contrato_na_janela": sum(1 for l in com_fator if na_janela(l)),
        "passa_e_contrato_na_janela": sum(1 for l in passa if na_janela(l)),
        "publicados_com_contrato_na_janela": sum(1 for l in escolhidos if na_janela(l)),
    }
    if setor in PRIORIZADAS:
        alvos.extend(escolhidos)
    if nivel != "C":
        # O que existe e é alcançável: passa o piso na origem E o contrato vence na janela.
        # Continua sendo contagem e ordenação — nenhuma promessa de desempenho.
        rastreio.extend(sorted([l for l in passa if na_janela(l)], key=ordenar, reverse=True))

N["alvos_publicados"] = len(alvos)
N["rastreio_alcancavel"] = len(rastreio)
N["rastreio_posicoes"] = len({l["setor"] for l in rastreio})
N["pri_alcancaveis"] = sum(1 for l in rastreio if l["setor"] in PRIORIZADAS)
for s in ("Goleiro", "Volante", "Extremo"):
    k = s.lower()[:3]
    N[f"pri_{k}_cand"] = por_posicao[s]["candidatos_com_minutagem"]
    N[f"pri_{k}_fator"] = por_posicao[s]["com_fator_de_liga"]
    N[f"pri_{k}_origem"] = por_posicao[s]["passa_piso_na_origem"]
    N[f"pri_{k}_ajustado"] = por_posicao[s]["passa_piso_no_ajustado"]
    N[f"pri_{k}_publicados"] = por_posicao[s]["publicados"]
    N[f"pri_{k}_so_fisico"] = por_posicao[s]["so_o_bloco_fisico"]
    N[f"pri_{k}_com_fisico"] = por_posicao[s]["com_linha_fisica"]
    N[f"pri_{k}_exig"] = por_posicao[s]["exigencias"]
    N[f"pri_{k}_so_duelo"] = por_posicao[s]["so_o_bloco_duelo_corpo"]
    N[f"pri_{k}_so_estilo"] = por_posicao[s]["so_o_bloco_estilo_tecnico"]
    N[f"pri_{k}_janela"] = por_posicao[s]["passa_e_contrato_na_janela"]
    N[f"pri_{k}_nivel"] = por_posicao[s]["nivel"]
N["pri_total_publicados"] = sum(por_posicao[s]["publicados"] for s in PRIORIZADAS)
N["pri_posicoes_sem_nome"] = sum(1 for s in PRIORIZADAS if por_posicao[s]["publicados"] == 0)
N["pri_posicoes_nivel_C"] = sum(1 for s in PRIORIZADAS if por_posicao[s]["nivel"] == "C")
N["pri_posicoes_sem_nome_alcancavel"] = sum(
    1 for s in PRIORIZADAS if por_posicao[s]["passa_e_contrato_na_janela"] == 0
    or por_posicao[s]["nivel"] == "C")
N["pri_posicoes"] = len(PRIORIZADAS)
N["brasileiros_entre_elegiveis"] = sum(1 for l in elegivel if not l["ocupa_vaga_de_estrangeiro"])
N["brasileiros_entre_publicados"] = sum(1 for l in alvos if not l["ocupa_vaga_de_estrangeiro"])
N["publicados_forca_forte"] = sum(1 for l in alvos if l["forca_do_fator"] == "forte")
N["publicados_com_contrato_na_janela"] = sum(1 for l in alvos if na_janela(l))
N["janela_de_contrato"] = JANELA
# A conjunção: quantos passariam com um bloco só, contra os dois juntos, no total.
N["conj_so_fisico"] = sum(por_posicao[s]["so_o_bloco_fisico"] for s in SETORES)
N["conj_so_duelo"] = sum(por_posicao[s]["so_o_bloco_duelo_corpo"] for s in SETORES)
N["conj_so_estilo"] = sum(por_posicao[s]["so_o_bloco_estilo_tecnico"] for s in SETORES)
N["conj_os_dois"] = sum(por_posicao[s]["os_dois_blocos_juntos"] for s in SETORES)
N["publicados_fisico_verificado"] = 0
N["ajustado_zera_em"] = sum(1 for s in SETORES if por_posicao[s]["passa_piso_no_ajustado"] == 0)
N["origem_passa_em"] = sum(1 for s in SETORES if por_posicao[s]["passa_piso_na_origem"] > 0)
N["setores"] = len(SETORES)

# ==================================================================================================
# 9. Gravar
# ==================================================================================================
def py(o):
    """numpy vira python: np.bool_ e np.float64 não são JSON."""
    if isinstance(o, (np.bool_,)):
        return bool(o)
    if isinstance(o, (np.integer,)):
        return int(o)
    if isinstance(o, (np.floating,)):
        return float(o)
    raise TypeError(type(o))


def gravar_csv(caminho, linhas, campos=None):
    campos = campos or (list(linhas[0].keys()) if linhas else ["vazio"])
    with open(caminho, "w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=campos, extrasaction="ignore")
        w.writeheader()
        w.writerows(linhas)


gravar_csv(RES / "J09_ligas.csv", diag_liga,
           ["liga", "mercado", "linhas", "times", "jogos_max", "razao_denominador", "forca_do_fator",
            "casos_j08", "veredito"])
campos_base = ["jogador", "liga", "time", "posicao", "setor", "idade", "minutos", "jogos",
               "fatia_pct", "corte_da_posicao", "minutagem_alta", "minutagem_regular",
               "temporadas_com_dado", "temporadas_altas", "regularidade_verificavel",
               "homonimo_na_foto", "contrato",
               "nascido_em", "passaporte", "mercado", "ocupa_vaga_de_estrangeiro",
               "valor_mercado", "pe", "altura",
               "contrato_na_janela", "media_ajustada", "elenco_cortado", "elenco_no_export",
               "forca_do_fator", "casos_do_fator", "indicadores_com_dado", "exigencias_da_posicao",
               "viola_na_origem", "viola_no_ajustado", "passa_ficha_origem", "passa_ficha_ajustado",
               "na_base_do_app", "fisico_rastreado", "sc_min_tot", "faixa_salarial", "valor_tr",
               "nota_fisico", "nota_duelo_corpo", "nota_estilo_tecnico", "fisico_da_posicao"]
for i in IND:
    campos_base += [i, f"{i}__pct", f"{i}__adj", f"{i}__delta"]
for k in EIXO:
    campos_base += [k, f"{k}__pct", f"{k}__adj", f"{k}__delta"]
gravar_csv(RES / "J09_base.csv", sorted(base, key=lambda l: (l["setor"], -(l["fatia_pct"] or 0))),
           campos_base)
gravar_csv(RES / "J09_testes.csv", testes,
           ["grupo", "desfecho", "fronteira", "setor", "n_a", "n_b", "cru_a", "cru_b", "d",
            "ic95_lo", "ic95_hi", "p", "q", "selo", "d_minimo_80", "poder_suficiente"])
gravar_csv(RES / "J09_backtest.csv", bt,
           ["jogador", "setor", "liga_origem", "ano", "clube", "na_fronteira", "clube_sem_ponte",
            "fatia_origem", "temporadas_com_dado", "minutagem_alta", "minutagem_alta_e_regular",
            "indicadores_com_dado", "duelo_corpo", "estilo_tecnico", "filtro_j09",
            "minutos", "jogou_900"])
if alvos:
    gravar_csv(RES / "J09_alvos.csv", alvos, campos_base)
elif (RES / "J09_alvos.csv").exists():
    os.remove(RES / "J09_alvos.csv")
if rastreio:
    gravar_csv(RES / "J09_rastreio.csv", rastreio, campos_base)
elif (RES / "J09_rastreio.csv").exists():
    os.remove(RES / "J09_rastreio.csv")

json.dump({
    "parte": "J09", "rodado_em": HOJE, "gerado_por": "scripts/J09.py",
    "veredito_do_nivel_A": NIVEL_A, "rotulo_dos_nomes": N["rotulo_dos_nomes"],
    "desenho_do_backtest": DECL["backtest_proprio_do_j09"],
    "ligas": diag_liga,
    "por_posicao": por_posicao,
    "teto_aritmetico_do_ajuste": TETO,
    "pisos_inalcancaveis_pelo_ajuste": pisos_inalcancaveis,
    "curva_de_idade_relida_de_J08": {str(k): round(v, 4) for k, v in sorted(CURVA_IDADE.items())},
    "cortes_sem_par": {
        "o_que_e": ("As linhas que rodaram num corte de fronteira e não no outro. A regra 3 do "
                    "portão as marca como REVISAR, e a resposta tem de estar escrita."),
        "quais": [f"{t['grupo']} × {t['desfecho']} ({t['setor']})" for t in testes
                  if t["fronteira"] == "com"
                  and not achar(t["grupo"], t["desfecho"], t["setor"], "sem")],
        "por_que": ("Sem os clubes de fronteira o grupo fica com menos de "
                    f"{PISO_LADO} de um lado, que é o piso por lado declarado em "
                    "J09_indicadores.json antes de rodar. Não é tabela meia-rodada nem escolha de "
                    "texto: é o piso disparando."),
        "as_que_emparelharam_discordam": N["bt_no_bh_dois_cortes"] is not None and sum(
            1 for t in testes if t["fronteira"] == "com"
            and achar(t["grupo"], t["desfecho"], t["setor"], "sem")
            and np.sign(t["d"]) != np.sign(achar(t["grupo"], t["desfecho"], t["setor"], "sem")["d"])),
    },
    "avisos": AVISOS,
}, open(RES / "J09_resumo.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1, default=py)

# Números de J06 que as conclusões desta parte citam. LIDOS da saída publicada de J06, nunca
# digitados: a regra 1 do portão exige que todo marcador saia do script que publica a conclusão.
_j06 = json_ou_nada_j06 = json.load(open(RES / "J06_numeros.json", encoding="utf-8"))["numeros"]
N["j06_due_d"] = _j06["bt_due_d"]
N["j06_tres_juntos"] = _j06["bloco_tres_juntos_2026"]
N["j06_base_2026"] = _j06["bloco_base_2026"]
N["j06_oferta_gol"] = _j06["oferta_gol"]
N["j06_min_d"] = _j06["bt_min_d"]

N["gerado_em"] = HOJE
json.dump({"gerado_por": "scripts/J09.py", "gerado_em": HOJE, "numeros": N},
          open(RES / "J09_numeros.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1,
          default=py)

print(f"ligas: {N['ligas_que_entram']} de {N['ligas_lidas']} | base {N['base_linhas']}")
print(f"minutagem alta e regular: {N['com_minutagem_alta_e_regular']}")
print(f"piso na origem {N['passa_piso_na_origem']} | no ajustado {N['passa_piso_no_ajustado']}")
print(f"teto do ajuste: eficiência {TETO['eficiencia']} · volume {TETO['volume']}")
print(f"pisos inalcançáveis: {N['pisos_inalcancaveis']} de {N['pisos_com_exigencia']}")
print(f"backtest: {N['bt_chegadas']} chegadas, nível A = {NIVEL_A} ({N['bt_por_que']})")
for s in SETORES:
    print("  ", s, por_posicao[s])
