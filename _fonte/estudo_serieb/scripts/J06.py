#!/usr/bin/env python3
"""J06 — os alvos na Série B, e o backtest que decide se eles podem ser publicados.

Lista pré-declarada em `resultados/J06_indicadores.json`, fechada ANTES desta primeira execução.
Método da casa por `scripts/_metodo.py`: Welch no posto, d de Cohen, IC95 por bootstrap de CLUBE,
poder por desenho e BH a 5% por família (§6.3: um pilar × uma comparação, sem partir por setor).

## A ordem importa, e ela não é a ordem natural

A pergunta do dono é "quais jogadores". A resposta honesta começa em outro lugar: **a §8.6 proíbe
publicar ranking de jogador sem backtest**, e o único número que o clube usaria para assinar
contrato é justamente o que ninguém testou. Então este script:

1. monta o funil da Série B (o molde da `etapa_12`, refeito para cá) e mede a oferta;
2. **roda o backtest da §8.6 sobre o FILTRO QUE J06 USARIA** — a ficha de J05 mais o requisito de
   minutagem, e não outro score, porque "um backtest de outro score não diz nada sobre o ranking
   publicado, seja qual for o p";
3. só então, e só se o backtest passar pela régua declarada antes de rodar, escreve os nomes.

Se o backtest não passar, `J06_alvos.csv` **não é escrito** e a parte entrega a contagem da oferta
— que é contagem, não promessa de desempenho — e o que faria falta.

## O que é chegada, e por que 2022 e 2026 ficam de fora

§8.6: jogador presente no clube X no ano t e ausente de X em t−1, em `serieb_tecnico.csv`, com a
regra de descarte de homônimo da §1.1 (nome com dois clubes ou duas posições no mesmo ano sai, e é
contado). 2022 é o primeiro ano do arquivo — sem 2021 todo atleta de 2022 vira chegada. 2026 tem 27
de 38 rodadas e o desfecho ainda não terminou de acontecer.

## De onde vem o dado

- `dados/serieb_tecnico.csv` — o técnico, pela regra de J03 (clube na coluna
  `Equipa dentro de um período de tempo seleccionado`, nunca `Equipa`).
- `resultados/J04_base.csv` — o físico por jogador-temporada, com a identidade já auditada por J04.
- `dados_copiados/skillcorner_serieb.db` — as cinco colunas que J04 deixou fora e o perfil pede
  (`expl_accel_sprint_p90` e os quatro tempos do `raw_json`), do mesmo jeito que J05 as leu.
- `dados/minutagem_serieb.json` — a fatia de minutos, pela regra de J01.
- `dados/serieb_elencos.csv` — contrato (Transfermarkt) e nacionalidade.
- `dados/serieb_lesoes.csv` — dias e jogos perdidos por ano.
- `resultados/J05_perfil.csv` — a ficha, herdada e **não** reescolhida aqui.
- `resultados/A01_clube_temporada.csv` — faixa e fronteira do clube de destino.
- `dados/prototipo.json` — `etapa_11` (o que o jogador leva na mala), `etapa_12` (o funil dos
  livres) e `etapa_13.backtest` (o backtest da nota do app, que entra como contraprova).

Uso:
    python3 _fonte/estudo_serieb/scripts/J06.py
"""
import collections
import csv
import datetime
import json
import math
import os
import re
import sqlite3
import sys
import unicodedata

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import bh, cohen_d, d_minimo, ic_por_clube, pct, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
BANCO = os.path.join(ESTUDO, "dados_copiados", "skillcorner_serieb.db")

GERADO_EM = "2026-09-20"
GERADO_POR = "scripts/J06.py"
ANOS = ("2022", "2023", "2024", "2025", "2026")
ANOS_CHEGADA = ("2023", "2024", "2025")
ANO_ALVO = "2026"
EDICAO = {"2022": 335, "2023": 446, "2024": 773, "2025": 1061, "2026": 1399}
COL_CLUBE = "Equipa dentro de um período de tempo seleccionado"
MIN_MINUTOS = 900
MIN_RASTREADOS = 300
N_MIN_LADO = 8
SEMENTE = 7
REPS_IC = 2000
BH5 = 0.05
JANELA_CT = (datetime.date(2026, 11, 1), datetime.date(2027, 1, 31))

DO_RAW = {"t_spr": "timetosprint_top3", "t505_90": "timeto505around90_top3",
          "t505_180": "timeto505around180_top3", "t_hsr_cod": "timetohsrpostcod_top3"}
# Como cada id do perfil se chama na base física de J04 (o resto vem do `raw_json` ou do `expl`).
COL_FIS = {"psv5": "psv99_top5", "spr_n": "sprint_count_p90"}
GRUPOS_DO_PERFIL = ("fisico", "duelo_corpo", "estilo_tecnico")
# A ressalva que J05 deixou escrita e que a declaração desta parte repete: o duelo aéreo do goleiro
# é porcentagem sobre um punhado de duelos e o piso dela sai em 100%, o teto da escala. J03-3 já o
# descartou. Ele CONTINUA na ficha como descrição — mas não pode eliminar ninguém.
NAO_UTILIZAVEL = {("Goleiro", "Duelos aéreos ganhos, %")}


# ------------------------------------------------------------------------------------------------
# utilidades pequenas
# ------------------------------------------------------------------------------------------------
def num(v):
    try:
        x = float(v)
    except (TypeError, ValueError):
        return None
    return None if math.isnan(x) else x


def br(x, casas=1):
    return f"{x:.{casas}f}".replace(".", ",")


def sem_acento(t):
    t = unicodedata.normalize("NFD", str(t or ""))
    return "".join(c for c in t if unicodedata.category(c) != "Mn").lower().strip()


def data_br(t):
    """'30/11/2026' → date. O Transfermarkt escreve assim; '-' e vazio viram None."""
    t = (t or "").strip()
    m = re.match(r"^(\d{2})/(\d{2})/(\d{4})$", t)
    if m:
        return datetime.date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})$", t)
    if m:
        return datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
    return None


def na_janela(d):
    return d is not None and JANELA_CT[0] <= d <= JANELA_CT[1]


# ------------------------------------------------------------------------------------------------
# as bases
# ------------------------------------------------------------------------------------------------
def extras_do_banco():
    """(sc_player_id, ano) -> `expl` e os quatro tempos, como J05 os lê."""
    if not os.path.exists(BANCO):
        raise SystemExit(f"não achei {BANCO}")
    ano_da = {e: a for a, e in EDICAO.items()}
    saida = {}
    con = sqlite3.connect(f"file:{BANCO}?mode=ro", uri=True)
    sql = ("select sc_player_id, sc_competition_edition_id, expl_accel_sprint_p90, raw_json "
           "from physical where sc_competition_edition_id in (%s)"
           % ",".join(str(e) for e in EDICAO.values()))
    for pid, ed, expl, raw in con.execute(sql):
        d = {"expl": num(expl)}
        cru = json.loads(raw) if raw else {}
        for k, campo in DO_RAW.items():
            d[k] = num(cru.get(campo))
        saida[(str(pid), ano_da[ed])] = d
    con.close()
    return saida


def base_do_jogador(ids_fis, ids_tec, setores):
    """Uma linha por jogador-temporada da Série B, 2022-2026, com técnico e físico juntos.

    A chave entre os dois lados é (ano, jogador) depois da regra de descarte de homônimo da §1.1:
    nome que aparece com dois clubes ou duas posições no mesmo ano é DESCARTADO e contado, nunca
    adivinhado. É a mesma regra que o `carregar()` do `gerar_raio_serieb.py` já aplica.
    """
    setor_de = {p: s for s, ps in setores.items() for p in ps}
    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    ponte = json.load(open(os.path.join(R, "T01_ponte_clubes.json"), encoding="utf-8"))

    cru = [r for r in csv.DictReader(open(os.path.join(DADOS, "serieb_tecnico.csv"),
                                          encoding="utf-8-sig")) if r["ano"] in ANOS]
    clubes, posicoes = collections.defaultdict(set), collections.defaultdict(set)
    for r in cru:
        clubes[(r["ano"], r["Jogador"])].add(r[COL_CLUBE])
        posicoes[(r["ano"], r["Jogador"])].add(r["posicao_1"])
    ambiguos = {k for k in clubes if len(clubes[k]) > 1 or len(posicoes[k]) > 1}

    extras = extras_do_banco()
    fis = {}
    for r in csv.DictReader(open(os.path.join(R, "J04_base.csv"), encoding="utf-8")):
        if r["temporada"] in ANOS:
            fis[(r["temporada"], r["jogador"])] = r

    base, sem_setor, sem_fisico = [], 0, 0
    for r in cru:
        chave = (r["ano"], r["Jogador"])
        if chave in ambiguos:
            continue
        s = setor_de.get(r["posicao_1"])
        if not s:
            sem_setor += 1
            continue
        clube = ponte.get(r[COL_CLUBE], r[COL_CLUBE])
        ct = a01.get((r["ano"], clube))
        l = {"ano": r["ano"], "clube": clube, "jogador": r["Jogador"], "setor": s,
             "posicao": r["posicao_1"],
             "minutos": num(r["Minutos jogados:"]) or 0.0,
             "jogos": num(r["Partidas jogadas"]) or 0.0,
             "idade_na_temporada": num(r.get("idade_na_temporada")),
             "nascido_em": (r.get("Naturalidade") or "").strip(),
             "nacionalidades_wy": (r.get("País de nacionalidade") or "").strip(),
             "emprestado": (r.get("Emprestado") or "").strip(),
             "ct_wyscout": (r.get("Contrato termina") or "").strip(),
             "faixa": ct["faixa"] if ct else None,
             "fronteira": bool(ct) and ct["fronteira"] == "1",
             "ano_setor": f"{r['ano']}|{s}"}
        for i in ids_tec:
            l[i["id"]] = num(r.get(i["id"]))

        f = fis.get(chave)
        e = extras.get((f["sc_player_id"], r["ano"])) if f and f["sc_player_id"] else None
        tem_fis = bool(f) and f["tem_fisico"] == "1" and (num(f["sc_min_tot"]) or 0) >= MIN_RASTREADOS
        l["tem_fisico"] = tem_fis
        l["sc_matches"] = num(f["sc_matches"]) if f else None
        l["cobertura_baixa"] = bool(f) and f["cobertura_baixa"] == "1"
        for i in ids_fis:
            v = None
            if tem_fis:
                if i["id"] in DO_RAW or i["id"] == "expl":
                    v = (e or {}).get(i["id"])
                else:
                    v = num(f.get(COL_FIS[i["id"]]))
            l[i["id"]] = v
        if not tem_fis:
            sem_fisico += 1
        base.append(l)
    return base, {"linhas_cruas": len(cru), "ambiguos_descartados": len(ambiguos),
                  "sem_setor": sem_setor, "sem_fisico": sem_fisico, "linhas": len(base)}


def percentilar(base, ids):
    """<id>::pct dentro de (temporada × setor), só entre quem tem 900+ minutos e tem o indicador.

    O pool é por indicador, como em J05: tirar o jogador da régua do `psv5` porque falta o tempo de
    giro dele estreitaria a régua sem motivo. O que se paga é um n diferente por indicador, e ele
    vai publicado.
    """
    cobertura = {}
    for i in ids:
        com = [l for l in base if l["minutos"] >= MIN_MINUTOS and l[i["id"]] is not None]
        grupos = collections.Counter(l["ano_setor"] for l in com)
        com = [l for l in com if grupos[l["ano_setor"]] >= 2]
        if com:
            percentil_no_ano(com, [i["id"]], chave_ano="ano_setor")
        elegiveis = [l for l in base if l["minutos"] >= MIN_MINUTOS]
        cobertura[i["id"]] = round(100 * len(com) / max(1, len(elegiveis)), 1)
    return cobertura


# ------------------------------------------------------------------------------------------------
# minutagem — requisito, não nota (a regra de J01, parametrizada pela janela)
# ------------------------------------------------------------------------------------------------
def minutagem(anos_do_corte, anos_da_janela=None):
    """O p75 da fatia dentro do grupo de posição, e quem é alto e regular.

    `anos_do_corte` é a janela que define o CORTE (o p75). `anos_da_janela` é onde se decide quem é
    regular. Separar os dois é o que permite aplicar em 2026 o corte que J05 fixou em 2022-2025 sem
    deixar o dado novo mexer na régua.
    """
    mn = json.load(open(os.path.join(DADOS, "minutagem_serieb.json"), encoding="utf-8"))
    C = {c: i for i, c in enumerate(mn["colunas"])}
    L = [{"ano": str(l[C["ano"]]), "jogador": l[C["jogador"]], "time": l[C["time"]],
          "grupo": l[C["grupo"]], "fatia": l[C["fatia_pct"]], "idade": l[C["idade"]],
          "jogos": l[C["jogos"]], "minutos": l[C["minutos"]]} for l in mn["linhas"]]
    do_corte = [x for x in L if x["ano"] in anos_do_corte]
    grupos = sorted({x["grupo"] for x in do_corte if x["grupo"]})
    p75 = {g: float(np.percentile([x["fatia"] for x in do_corte
                                   if x["grupo"] == g and x["fatia"] is not None], 75))
           for g in grupos}
    alta = collections.defaultdict(dict)
    for x in L:
        if x["fatia"] is not None and x["grupo"] in p75:
            alta[x["jogador"]][x["ano"]] = x["fatia"] >= p75[x["grupo"]]
    janela = anos_da_janela or anos_do_corte
    for x in L:
        jan = [alta[x["jogador"]].get(str(int(x["ano"]) - k)) for k in (0, 1, 2)]
        x["alta"] = bool(alta[x["jogador"]].get(x["ano"]))
        x["temporadas_com_dado"] = sum(1 for v in jan if v is not None)
        x["regular"] = sum(1 for v in jan if v) >= 2
    frase = " · ".join(f"{g} {br(p75[g])}%" for g in sorted(grupos, key=lambda g: -p75[g]))
    do_janela = [x for x in L if x["ano"] in janela]
    return {"p75": {g: round(p75[g], 1) for g in grupos}, "frase": frase,
            "linhas": L, "n": len(do_janela),
            "regulares": sum(1 for x in do_janela if x["regular"]),
            "por_jogador_ano": {(x["ano"], x["jogador"]): x for x in L}}


# ------------------------------------------------------------------------------------------------
# a ficha de J05, aplicada
# ------------------------------------------------------------------------------------------------
def julgar(linha, ficha_do_setor, setor):
    """Como a ficha de J05 lê UM jogador-temporada. Devolve o veredito por bloco e o geral.

    Regras que vêm de fora e não se discutem aqui: piso ausente não vira exigência (§ da ficha de
    J05: quem subiu não estava acima da mediana da liga ali); indicador sem dado sai da conta e o
    denominador é publicado (§8.2, nunca imputar); as três notas nunca viram uma (§8.2).
    """
    por_bloco, detalhe = {}, []
    for b in GRUPOS_DO_PERFIL:
        itens = [i for i in ficha_do_setor if i["bloco"] == b]
        com_dado = viola = 0
        for i in itens:
            p = linha.get(pct(i["indicador"]))
            if p is None:
                continue
            com_dado += 1
            bom = p if i["sentido"] == "maior é melhor" else 100 - p
            usavel = (setor, i["indicador"]) not in NAO_UTILIZAVEL
            if usavel and i["piso_pct"] is not None and bom < i["piso_pct"]:
                viola += 1
            detalhe.append({"indicador": i["indicador"], "nome": i["nome"], "bloco": b,
                            "percentil": round(bom, 1), "piso_pct": i["piso_pct"],
                            "valor": linha.get(i["indicador"]), "utilizavel": usavel,
                            "atende": None if (i["piso_pct"] is None or not usavel)
                                      else bool(bom >= i["piso_pct"])})
        por_bloco[b] = {"com_dado": com_dado, "no_bloco": len(itens), "violados": viola,
                        "atende": None if com_dado == 0 else viola == 0}
    com_dado = sum(v["com_dado"] for v in por_bloco.values())
    violados = sum(v["violados"] for v in por_bloco.values())
    geral = None if com_dado < 2 else violados == 0
    return {"por_bloco": por_bloco, "detalhe": detalhe, "indicadores_com_dado": com_dado,
            "violados": violados, "atende": geral}


# ------------------------------------------------------------------------------------------------
# o backtest da §8.6
# ------------------------------------------------------------------------------------------------
def chegadas(base):
    """Quem chegou a cada clube em cada ano: presente em X no ano t e ausente de X em t−1."""
    onde = collections.defaultdict(set)
    for l in base:
        onde[(l["ano"], l["jogador"])].add(l["clube"])
    saida = []
    for l in base:
        if l["ano"] not in ANOS_CHEGADA:
            continue
        antes = onde.get((str(int(l["ano"]) - 1), l["jogador"]), set())
        if l["clube"] not in antes:
            saida.append(l)
    return saida


def montar_backtest(base, ficha, mi):
    """Uma linha por chegada pontuável: o veredito com o dado de t−1 e o desfecho em t."""
    por = {(l["ano"], l["jogador"]): l for l in base}
    onde = collections.defaultdict(set)
    for l in base:
        onde[(l["ano"], l["jogador"])].add(l["clube"])
    linhas, sem_antes, sem_minutos, sem_dado = [], 0, 0, 0
    for c in chegadas(base):
        ano_antes = str(int(c["ano"]) - 1)
        antes = por.get((ano_antes, c["jogador"]))
        if antes is None:
            sem_antes += 1
            continue
        if antes["minutos"] < MIN_MINUTOS:
            sem_minutos += 1
            continue
        v = julgar(antes, ficha.get(antes["setor"], []), antes["setor"])
        if v["atende"] is None:
            sem_dado += 1
            continue
        m = mi["por_jogador_ano"].get((ano_antes, c["jogador"]))
        ficou = c["clube"] in onde.get((str(int(c["ano"]) + 1), c["jogador"]), set())
        linhas.append({
            "ano_chegada": c["ano"], "clube": c["clube"], "jogador": c["jogador"],
            "setor": c["setor"], "ano_setor": c["ano_setor"],
            "faixa_do_clube": c["faixa"], "fronteira": c["fronteira"],
            "setor_antes": antes["setor"], "clube_antes": antes["clube"],
            "minutos_antes": antes["minutos"],
            "minutos": c["minutos"], "jogos": c["jogos"],
            "permanencia": 100.0 if ficou else 0.0,
            "aprovado_perfil_completo": v["atende"],
            "aprovado_fisico": v["por_bloco"]["fisico"]["atende"],
            "aprovado_duelo_corpo": v["por_bloco"]["duelo_corpo"]["atende"],
            "aprovado_estilo_tecnico": v["por_bloco"]["estilo_tecnico"]["atende"],
            "aprovado_minutagem": bool(m and m["regular"]),
            "indicadores_com_dado": v["indicadores_com_dado"],
        })
    # O posto do desfecho "minutos" dentro de (setor, temporada) da CHEGADA, a régua da casa.
    percentil_no_ano(linhas, ["minutos"], chave_ano="ano_setor")
    for l in linhas:
        l["minutos::escala"] = l[pct("minutos")]
        l["permanencia::escala"] = l["permanencia"]
    return linhas, {"sem_ano_anterior": sem_antes, "sem_900_min_antes": sem_minutos,
                    "sem_dado_do_perfil": sem_dado}


def testar(linhas, grupos, desfechos, setores, rng):
    """Aprovado × reprovado, por família = grupo × desfecho × corte. Os dois cortes, sempre.

    Um teste só entra na tabela quando os DOIS cortes o sustentam: se o corte sem fronteira ficar
    sem n, ele sai dos dois lados, para que a tabela compare a mesma coisa. O que saiu é contado.
    """
    saida, fora = [], []
    for g in grupos:
        for d in desfechos:
            por_corte = {}
            for corte, sem_f in (("com", False), ("sem", True)):
                ps, itens = [], []
                for setor in ["Todos"] + setores:
                    pool = [l for l in linhas
                            if (setor == "Todos" or l["setor"] == setor)
                            and not (sem_f and l["fronteira"])]
                    campo = f"{d['id']}::escala"
                    ga = (lambda x, g=g: x[f"aprovado_{g}"] is True)
                    gb = (lambda x, g=g: x[f"aprovado_{g}"] is False)
                    a = [l[campo] for l in pool if ga(l)]
                    b = [l[campo] for l in pool if gb(l)]
                    if len(a) < N_MIN_LADO or len(b) < N_MIN_LADO:
                        fora.append({"grupo": g, "desfecho": d["id"], "corte": corte,
                                     "setor": setor, "n_a": len(a), "n_b": len(b)})
                        continue
                    _, p = stats.ttest_ind(a, b, equal_var=False)
                    dd = cohen_d(a, b)
                    filtro = (lambda x, s=setor, sf=sem_f:
                              (s == "Todos" or x["setor"] == s) and not (sf and x["fronteira"]))
                    lo, hi = ic_por_clube(linhas, campo,
                                          (lambda x, f=filtro, q=ga: f(x) and q(x)),
                                          (lambda x, f=filtro, q=gb: f(x) and q(x)),
                                          1, rng, reps=REPS_IC)
                    ca = [l[d["cru"]] for l in pool if ga(l)]
                    cb = [l[d["cru"]] for l in pool if gb(l)]
                    itens.append({
                        "unidade": "chegada-jogador", "fronteira": corte,
                        "comparacao": "aprovado x reprovado",
                        "familia": f"{g}|{d['id']}", "setor": setor,
                        "indicador": f"{g} -> {d['id']}",
                        "nome": f"{d['nome']} de quem o filtro aprovaria, contra quem reprovaria "
                                f"({g.replace('_', ' ')})",
                        "n_a": len(a), "n_b": len(b),
                        "clubes_a": len({l["clube"] for l in pool if ga(l)}),
                        "clubes_b": len({l["clube"] for l in pool if gb(l)}),
                        "pct_a": round(float(np.median(a)), 1),
                        "pct_b": round(float(np.median(b)), 1),
                        "cru_a": round(float(np.mean(ca)), 1),
                        "cru_b": round(float(np.mean(cb)), 1),
                        "d": round(dd, 3), "ic95_lo": lo, "ic95_hi": hi,
                        "p": round(float(p), 5),
                        "d_minimo_80": d_minimo(len(a), len(b)),
                    })
                    ps.append(float(p))
                for it, q in zip(itens, bh(ps)):
                    it["q"] = round(q, 5)
                    it["passou_bh"] = q < BH5
                    it["poder_suficiente"] = abs(it["d"]) >= it["d_minimo_80"]
                    it["selo"] = ("firme" if q < BH5 else
                                  ("pode ser sorte" if it["p"] < 0.05 else
                                   ("sem diferença clara" if it["poder_suficiente"]
                                    else "não separa (poder insuficiente)")))
                por_corte[corte] = {(x["setor"], x["indicador"]): x for x in itens}
            nos_dois = set(por_corte.get("com", {})) & set(por_corte.get("sem", {}))
            for corte in ("com", "sem"):
                for k, it in por_corte.get(corte, {}).items():
                    if k in nos_dois:
                        saida.append(it)
    return saida, fora


def discordancias(linhas):
    por = collections.defaultdict(dict)
    for l in linhas:
        por[(l["familia"], l["setor"])][l["fronteira"]] = l
    saida = []
    for (fam, setor), v in sorted(por.items()):
        a, b = v.get("com"), v.get("sem")
        if not a or not b:
            continue
        if a["passou_bh"] != b["passou_bh"] or a["d"] * b["d"] < 0:
            saida.append({"familia": fam, "setor": setor, "nome": a["nome"],
                          "motivo": ("passa num corte e não no outro"
                                     if a["passou_bh"] != b["passou_bh"]
                                     else "troca de lado entre os cortes"),
                          "d_com": a["d"], "d_sem": b["d"],
                          "q_com": a["q"], "q_sem": b["q"]})
    return saida


def veredito_do_backtest(linhas, dec):
    """A régua declarada em J06_indicadores.json, aplicada sem margem de interpretação."""
    regra = dec["regra_que_autoriza_publicar_nomes"]
    fam, setor = regra["familia_primaria"].replace(" × ", "|"), "Todos"
    par = {l["fronteira"]: l for l in linhas if l["familia"] == fam and l["setor"] == setor}
    com, sem = par.get("com"), par.get("sem")
    if not com or not sem:
        return {"passou": False, "por_que": "o teste primário não rodou nos dois cortes",
                "familia": fam, "com": com, "sem": sem}
    ok = (com["d"] > 0 and sem["d"] > 0 and com["passou_bh"] and sem["passou_bh"])
    if ok:
        por_que = ("quem o filtro aprovaria jogou mais, e o resultado cruza a correção a 5% nos "
                   "dois cortes de fronteira")
    elif com["d"] <= 0 or sem["d"] <= 0:
        por_que = "quem o filtro aprovaria NÃO jogou mais que quem ele reprovaria"
    else:
        por_que = "a diferença existe no sinal certo, mas não cruza a correção a 5% nos dois cortes"
    return {"passou": bool(ok), "por_que": por_que, "familia": fam,
            "d_com": com["d"], "d_sem": sem["d"], "q_com": com["q"], "q_sem": sem["q"],
            "p_com": com["p"], "p_sem": sem["p"],
            "n_a": com["n_a"], "n_b": com["n_b"],
            "cru_a": com["cru_a"], "cru_b": com["cru_b"],
            "d_minimo_80": com["d_minimo_80"],
            "poder_suficiente": com["poder_suficiente"], "com": com, "sem": sem}


# ------------------------------------------------------------------------------------------------
# o funil da Série B e a oferta
# ------------------------------------------------------------------------------------------------
def contratos_e_lesoes():
    elencos = collections.defaultdict(list)
    for r in csv.DictReader(open(os.path.join(DADOS, "serieb_elencos.csv"), encoding="utf-8-sig")):
        if r["ano"] == ANO_ALVO:
            elencos[sem_acento(r["jogador"])].append(r)
    lesoes = collections.defaultdict(lambda: {"dias": 0.0, "jogos": 0.0, "n": 0})
    for r in csv.DictReader(open(os.path.join(DADOS, "serieb_lesoes.csv"), encoding="utf-8-sig")):
        d = num(r.get(f"dias_{ANO_ALVO}"))
        if d:
            k = sem_acento(r["jogador"])
            lesoes[k]["dias"] += d
            lesoes[k]["jogos"] += num(r.get("jogos_perdidos")) or 0
            lesoes[k]["n"] += 1
    return elencos, lesoes


def casar_elenco(nome, elencos):
    """A ponte com o Transfermarkt é por nome, e por isso é declarada, nunca silenciosa."""
    cand = elencos.get(sem_acento(nome), [])
    return cand[0] if len(cand) == 1 else None


def main():
    dec = json.load(open(os.path.join(R, "J06_indicadores.json"), encoding="utf-8"))
    proto = json.load(open(os.path.join(DADOS, "prototipo.json"), encoding="utf-8"))
    j05n = json.load(open(os.path.join(R, "J05_numeros.json"), encoding="utf-8"))["numeros"]
    rng = np.random.default_rng(SEMENTE)

    ficha = {s: v for s, v in dec["perfil_herdado_de_J05"]["por_setor"].items()}
    setores = dec["setores"]
    ids_fis = [{"id": i} for i in sorted({x["indicador"] for v in ficha.values() for x in v
                                          if x["bloco"] == "fisico"})]
    ids_tec = [{"id": i} for i in sorted({x["indicador"] for v in ficha.values() for x in v
                                          if x["bloco"] != "fisico"})]

    print("montando a base de jogador-temporada (2022-2026)…")
    base, cont = base_do_jogador(ids_fis, ids_tec, setores)
    cob = percentilar(base, ids_fis + ids_tec)
    print(f"  {cont['linhas']} linhas · {cont['ambiguos_descartados']} nomes ambíguos descartados "
          f"(§1.1) · {cont['sem_setor']} sem setor")

    # ---- minutagem: o corte de J05 (2022-2025), aplicado sem deixar 2026 mexer na régua ---------
    mi = minutagem(("2022", "2023", "2024", "2025"))
    confere_j05 = mi["frase"] == j05n.get("min_corte_por_posicao")
    if not confere_j05:
        raise SystemExit(f"o corte por posição não bate com J05:\n  aqui: {mi['frase']}\n"
                         f"  J05 : {j05n.get('min_corte_por_posicao')}")
    print(f"  corte por posição confere com J05: {mi['frase']}")

    # ==============================================================================================
    # 1. O BACKTEST DA §8.6 — antes de qualquer nome
    # ==============================================================================================
    print("\nrodando o backtest da §8.6 (chegadas 2023-2025, pontuadas com o dado de t−1)…")
    bt, perdas = montar_backtest(base, ficha, mi)
    grupos = [g["id"] for g in dec["backtest_8_6"]["grupos"]]
    desfechos = [{"id": "minutos", "nome": "Minutos no ano da chegada", "cru": "minutos"},
                 {"id": "permanencia", "nome": "Permanência no clube no ano seguinte",
                  "cru": "permanencia"}]
    lista_setores = [s for s in setores if s != "Goleiro"] + ["Goleiro"]
    testes, fora = testar(bt, grupos, desfechos, lista_setores, rng)
    # O teste primário saiu da tabela porque o corte sem fronteira não o sustenta. Rodá-lo à parte,
    # SÓ no corte com, é diagnóstico — o número que o leitor vai perguntar. Ele não entra na tabela,
    # não entra no BH e não entra no veredito: a régua declarada exige os dois cortes.
    diag, _ = testar([l for l in bt], ["perfil_completo"],
                     [d for d in desfechos if d["id"] == "minutos"], [], rng)
    so_com = [l for l in bt]
    ap = [l[pct("minutos")] for l in so_com if l["aprovado_perfil_completo"] is True]
    rep = [l[pct("minutos")] for l in so_com if l["aprovado_perfil_completo"] is False]
    _, p_diag = stats.ttest_ind(ap, rep, equal_var=False)
    diagnostico = {
        "o_que_e": ("o teste primário rodado só no corte COM os clubes de fronteira; não entra na "
                    "tabela, no BH nem no veredito, porque a régua declarada exige os dois cortes"),
        "n_aprovado": len(ap), "n_reprovado": len(rep),
        "d": round(cohen_d(ap, rep), 3), "p": round(float(p_diag), 5),
        "d_minimo_80": d_minimo(len(ap), len(rep)),
        "minutos_aprovado": round(float(np.mean([l["minutos"] for l in so_com
                                                 if l["aprovado_perfil_completo"] is True])), 1),
        "minutos_reprovado": round(float(np.mean([l["minutos"] for l in so_com
                                                  if l["aprovado_perfil_completo"] is False])), 1),
    }
    disc = discordancias(testes)
    veredito = veredito_do_backtest(testes, dec)

    campos = ["unidade", "fronteira", "comparacao", "familia", "setor", "indicador", "nome",
              "n_a", "n_b", "clubes_a", "clubes_b", "pct_a", "pct_b", "cru_a", "cru_b",
              "d", "ic95_lo", "ic95_hi", "p", "q", "d_minimo_80", "poder_suficiente",
              "passou_bh", "selo"]
    with open(os.path.join(R, "J06_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos)
        w.writeheader()
        w.writerows([{k: l[k] for k in campos} for l in testes])

    campos_bt = ["ano_chegada", "clube", "jogador", "setor", "faixa_do_clube", "fronteira",
                 "clube_antes", "minutos_antes", "minutos", "jogos", "permanencia",
                 "aprovado_perfil_completo", "aprovado_fisico", "aprovado_duelo_corpo",
                 "aprovado_estilo_tecnico", "aprovado_minutagem", "indicadores_com_dado"]
    with open(os.path.join(R, "J06_backtest.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos_bt)
        w.writeheader()
        w.writerows([{k: l[k] for k in campos_bt} for l in bt])

    print(f"  {len(bt)} chegadas pontuáveis · {len(testes)} linhas de teste nos dois cortes")
    print(f"  VEREDITO: {'PASSOU' if veredito['passou'] else 'NÃO PASSOU'} — {veredito['por_que']}")

    # ==============================================================================================
    # 2. O FUNIL DA SÉRIE B, e a oferta por posição
    # ==============================================================================================
    print("\nmontando o funil da Série B 2026…")
    elencos, lesoes = contratos_e_lesoes()
    alvo = [l for l in base if l["ano"] == ANO_ALVO]
    fichas_mi = mi["por_jogador_ano"]

    linhas_alvo = []
    sem_ponte = 0
    for l in alvo:
        e = casar_elenco(l["jogador"], elencos)
        if e is None:
            sem_ponte += 1
        ct_tm = data_br(e["contrato_ate"]) if e else None
        ct_wy = data_br(l["ct_wyscout"])
        m = fichas_mi.get((ANO_ALVO, l["jogador"]))
        v = julgar(l, ficha.get(l["setor"], []), l["setor"])
        les = lesoes.get(sem_acento(l["jogador"]), {"dias": 0, "jogos": 0, "n": 0})
        linhas_alvo.append({
            "jogador": l["jogador"], "clube": l["clube"], "setor": l["setor"],
            "posicao": l["posicao"], "idade": l["idade_na_temporada"],
            "minutos": l["minutos"], "jogos": l["jogos"],
            "fatia_pct": m["fatia"] if m else None,
            "minutagem_alta": bool(m and m["alta"]),
            "minutagem_regular": bool(m and m["regular"]),
            "temporadas_com_dado": m["temporadas_com_dado"] if m else 0,
            "contrato_tm": e["contrato_ate"] if e else "",
            "contrato_wy": l["ct_wyscout"],
            "livre_tm": na_janela(ct_tm), "livre_wy": na_janela(ct_wy),
            "fontes_concordam": bool(ct_tm and ct_wy and ct_tm.strftime("%Y-%m") == ct_wy.strftime("%Y-%m")),
            "emprestado": l["emprestado"],
            "nascido_em": l["nascido_em"],
            "estrangeiro": bool(l["nascido_em"]) and l["nascido_em"] != "Brazil",
            "dupla_nacionalidade": "," in l["nacionalidades_wy"],
            "tem_fisico": l["tem_fisico"], "sc_matches": l["sc_matches"],
            "lesao_dias": les["dias"], "lesao_jogos": les["jogos"], "lesao_n": les["n"],
            "indicadores_com_dado": v["indicadores_com_dado"],
            "violados": v["violados"],
            "atende_perfil": v["atende"],
            "atende_fisico": v["por_bloco"]["fisico"]["atende"],
            "atende_duelo_corpo": v["por_bloco"]["duelo_corpo"]["atende"],
            "atende_estilo_tecnico": v["por_bloco"]["estilo_tecnico"]["atende"],
            "detalhe": v["detalhe"],
        })

    def livre(x):
        return x["livre_tm"] or x["livre_wy"]

    # A §8.1 manda publicar a concordância das duas fontes, e publicá-la só onde a fonte cobre:
    # o denominador é quem tem DATA DOS DOIS LADOS, nunca o universo inteiro.
    com_duas = [x for x in linhas_alvo if x["contrato_tm"] and x["contrato_wy"]]
    concordam = sum(1 for x in com_duas if x["fontes_concordam"])
    conc_pct = round(100 * concordam / max(1, len(com_duas)), 1)

    degraus = []
    passo = list(linhas_alvo)
    degraus.append({"degrau": "serie_b_2026", "n": len(passo), "saiu": 0,
                    "estrangeiros": sum(1 for x in passo if x["estrangeiro"]),
                    "excluidos_por_dado_ausente": sem_ponte})
    antes = len(passo)
    passo = [x for x in passo if livre(x)]
    degraus.append({"degrau": "livres_na_janela", "n": len(passo), "saiu": antes - len(passo),
                    "estrangeiros": sum(1 for x in passo if x["estrangeiro"]),
                    "excluidos_por_dado_ausente": sum(1 for x in linhas_alvo
                                                      if not x["contrato_tm"] and not x["contrato_wy"])})
    antes = len(passo)
    passo = [x for x in passo if x["fontes_concordam"]]
    degraus.append({"degrau": "confianca_de_contrato", "n": len(passo), "saiu": antes - len(passo),
                    "estrangeiros": sum(1 for x in passo if x["estrangeiro"]),
                    "excluidos_por_dado_ausente": sum(1 for x in linhas_alvo
                                                      if livre(x) and not (x["contrato_tm"] and x["contrato_wy"]))})
    antes = len(passo)
    passo = [x for x in passo if x["minutagem_regular"]]
    degraus.append({"degrau": "minutagem_alta_e_regular", "n": len(passo), "saiu": antes - len(passo),
                    "estrangeiros": sum(1 for x in passo if x["estrangeiro"]),
                    "excluidos_por_dado_ausente": sum(1 for x in linhas_alvo
                                                      if x["temporadas_com_dado"] == 0)})
    antes = len(passo)
    passo = [x for x in passo if x["indicadores_com_dado"] >= 2]
    degraus.append({"degrau": "com_dado_do_perfil", "n": len(passo), "saiu": antes - len(passo),
                    "estrangeiros": sum(1 for x in passo if x["estrangeiro"]),
                    "excluidos_por_dado_ausente": antes - len(passo)})
    antes = len(passo)
    passo = [x for x in passo if x["atende_perfil"]]
    degraus.append({"degrau": "atende_o_perfil", "n": len(passo), "saiu": antes - len(passo),
                    "estrangeiros": sum(1 for x in passo if x["estrangeiro"]),
                    "excluidos_por_dado_ausente": 0})
    final = passo

    # A oferta: quem atende o requisito que J05 sustenta, com e sem o filtro do perfil.
    regulares = [x for x in linhas_alvo if x["minutagem_regular"]]
    livres_reg = [x for x in regulares if livre(x)]
    oferta = {}
    for s in setores:
        oferta[s] = {
            "na_serie_b": sum(1 for x in linhas_alvo if x["setor"] == s),
            "regulares": sum(1 for x in regulares if x["setor"] == s),
            "livres_regulares": sum(1 for x in livres_reg if x["setor"] == s),
            "livres_regulares_com_perfil": sum(1 for x in final if x["setor"] == s),
            "estrangeiros_livres_regulares": sum(1 for x in livres_reg
                                                 if x["setor"] == s and x["estrangeiro"]),
            "livres_regulares_com_confianca": sum(1 for x in livres_reg
                                                  if x["setor"] == s and x["fontes_concordam"]),
        }
    escassas = sorted([s for s in setores if oferta[s]["livres_regulares"] < 5],
                      key=lambda s: oferta[s]["livres_regulares"])
    # A ordem em que J09 deve procurar fora: a oferta da Série B, da mais curta para a mais larga.
    # O CLAUDE.md pede 5 a 10 nomes por posição, então quem não chega a 5 é escassez declarada e o
    # que fica na metade de baixo da faixa é aperto — os dois interessam a J09, com rótulos
    # diferentes, e nenhum deles depende do perfil que o backtest não sustentou.
    ordem_j09 = [{"posicao": s, "livres_regulares": oferta[s]["livres_regulares"],
                  "rotulo": ("escassez" if oferta[s]["livres_regulares"] < 5 else
                             ("aperto" if oferta[s]["livres_regulares"] <= 7 else "dá para escolher"))}
                 for s in sorted(setores, key=lambda s: oferta[s]["livres_regulares"])]

    # Onde a conjunção mata: quantos dos regulares e livres passam em CADA bloco sozinho. É a
    # leitura que a §8.2 pede (três notas, nunca uma) aplicada ao funil.
    base_da_conjuncao = [x for x in livres_reg if x["indicadores_com_dado"] >= 2]
    por_bloco_2026 = {b: sum(1 for x in base_da_conjuncao if x[f"atende_{b}"] is True)
                      for b in GRUPOS_DO_PERFIL}
    por_bloco_2026["os_tres_juntos"] = sum(1 for x in base_da_conjuncao if x["atende_perfil"])
    por_bloco_2026["base"] = len(base_da_conjuncao)

    campos_f = ["jogador", "clube", "setor", "posicao", "idade", "minutos", "jogos", "fatia_pct",
                "minutagem_alta", "minutagem_regular", "temporadas_com_dado", "contrato_tm",
                "contrato_wy", "livre_tm", "livre_wy", "fontes_concordam", "emprestado",
                "nascido_em", "estrangeiro", "dupla_nacionalidade", "tem_fisico", "sc_matches",
                "lesao_dias", "lesao_jogos", "lesao_n", "indicadores_com_dado", "violados",
                "atende_perfil", "atende_fisico", "atende_duelo_corpo", "atende_estilo_tecnico"]
    with open(os.path.join(R, "J06_funil.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos_f)
        w.writeheader()
        w.writerows([{k: x[k] for k in campos_f} for x in linhas_alvo])

    # ---- a lista de nomes: só se o backtest autorizar -------------------------------------------
    caminho_alvos = os.path.join(R, "J06_alvos.csv")
    if veredito["passou"]:
        with open(caminho_alvos, "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=campos_f)
            w.writeheader()
            w.writerows([{k: x[k] for k in campos_f} for x in final])
        alvos_publicados = len(final)
    else:
        if os.path.exists(caminho_alvos):
            os.remove(caminho_alvos)
        alvos_publicados = 0

    # ---- a contraprova: o backtest da nota do app ------------------------------------------------
    app = proto["etapa_13"]["backtest"]
    e11 = proto["etapa_11"]
    e12 = proto["etapa_12"]

    # ==============================================================================================
    # A SAÍDA DOS NÚMEROS — resultados/J06_numeros.json
    # ==============================================================================================
    def linha_de(familia, corte="com", setor="Todos"):
        achadas = [l for l in testes if l["familia"] == familia and l["setor"] == setor
                   and l["fronteira"] == corte]
        return achadas[0] if achadas else None

    prim = veredito["com"]
    fam_min = linha_de("minutagem|minutos")
    fam_min_sem = linha_de("minutagem|minutos", "sem")
    fam_minperm = linha_de("minutagem|permanencia")
    fam_fis = linha_de("fisico|minutos")
    fam_due = linha_de("duelo_corpo|minutos")
    fam_est = linha_de("estilo_tecnico|minutos")
    bh_todos = [l for l in testes if l["fronteira"] == "com" and l["passou_bh"]]
    passa_nos_dois = []
    por_par = collections.defaultdict(dict)
    for l in testes:
        por_par[(l["familia"], l["setor"])][l["fronteira"]] = l
    for k, v in por_par.items():
        if v.get("com", {}).get("passou_bh") and v.get("sem", {}).get("passou_bh"):
            passa_nos_dois.append(k)

    frase_pares = "; ".join(
        f"{d['familia']} em {d['setor']}: d {d['d_com']} no corte com e {d['d_sem']} no corte sem "
        f"(q {d['q_com']} e {d['q_sem']})" for d in disc) or "nenhum par discorda"
    frase_disc = ("sem os clubes de fronteira mudam de lado ou de selo: "
                  + "; ".join(f"{d['familia']} no {d['setor']} "
                              f"(d {br(d['d_com'], 2)} contra {br(d['d_sem'], 2)})" for d in disc)
                  ) if disc else ("nenhum teste muda de lado nem de selo entre o corte com e o "
                                  "corte sem os clubes de fronteira")

    numeros = {
        # o backtest
        "bt_chegadas": len(bt),
        "bt_sem_ano_anterior": perdas["sem_ano_anterior"],
        "bt_sem_900": perdas["sem_900_min_antes"],
        "bt_sem_dado": perdas["sem_dado_do_perfil"],
        "bt_aprovados": sum(1 for l in bt if l["aprovado_perfil_completo"]),
        "bt_reprovados": sum(1 for l in bt if l["aprovado_perfil_completo"] is False),
        "bt_aprovados_sem_fronteira": sum(1 for l in bt if l["aprovado_perfil_completo"]
                                          and not l["fronteira"]),
        "bt_piso_do_lado": N_MIN_LADO,
        "bt_passou": veredito["passou"],
        "bt_por_que": veredito["por_que"],
        "bt_d_com": prim["d"] if prim else None,
        "bt_d_sem": veredito["sem"]["d"] if veredito.get("sem") else None,
        "bt_q_com": prim["q"] if prim else None,
        "bt_q_sem": veredito["sem"]["q"] if veredito.get("sem") else None,
        "bt_p_com": prim["p"] if prim else None,
        "bt_min_aprovado": prim["cru_a"] if prim else None,
        "bt_min_reprovado": prim["cru_b"] if prim else None,
        "bt_n_aprovado": prim["n_a"] if prim else None,
        "bt_n_reprovado": prim["n_b"] if prim else None,
        "bt_d_minimo": prim["d_minimo_80"] if prim else None,
        # os blocos, que rodaram: cada um é a ficha de J05 lida bloco a bloco (§8.2, nunca somar)
        "bt_fis_d": fam_fis["d"] if fam_fis else None,
        "bt_fis_q": fam_fis["q"] if fam_fis else None,
        "bt_fis_a": fam_fis["cru_a"] if fam_fis else None,
        "bt_fis_b": fam_fis["cru_b"] if fam_fis else None,
        "bt_fis_na": fam_fis["n_a"] if fam_fis else None,
        "bt_fis_nb": fam_fis["n_b"] if fam_fis else None,
        "bt_due_d": fam_due["d"] if fam_due else None,
        "bt_due_q": fam_due["q"] if fam_due else None,
        "bt_due_a": fam_due["cru_a"] if fam_due else None,
        "bt_due_b": fam_due["cru_b"] if fam_due else None,
        "bt_est_d": fam_est["d"] if fam_est else None,
        "bt_est_q": fam_est["q"] if fam_est else None,
        "bt_est_a": fam_est["cru_a"] if fam_est else None,
        "bt_est_b": fam_est["cru_b"] if fam_est else None,
        "bt_testes": len(testes),
        "bt_testes_com": len([l for l in testes if l["fronteira"] == "com"]),
        "bt_bh": len(bh_todos),
        "bt_bh_dois_cortes": len(passa_nos_dois),
        "bt_fora_por_n": len({(x["grupo"], x["desfecho"], x["setor"]) for x in fora}),
        "bt_discordancias": frase_disc,
        "bt_n_discordancias": len(disc),
        "bt_pares_discordantes": frase_pares,
        "bt_diag_d": diagnostico["d"], "bt_diag_p": diagnostico["p"],
        "bt_diag_na": diagnostico["n_aprovado"], "bt_diag_nb": diagnostico["n_reprovado"],
        "bt_diag_min_a": diagnostico["minutos_aprovado"],
        "bt_diag_min_b": diagnostico["minutos_reprovado"],
        "bt_diag_dmin": diagnostico["d_minimo_80"],
        # os mesmos minutos em unidade de jogo, inteiros, que é como o texto de reunião os diz
        "bt_diag_min_a_int": int(round(diagnostico["minutos_aprovado"])),
        "bt_diag_min_b_int": int(round(diagnostico["minutos_reprovado"])),
        "bt_familias": len({l["familia"] for l in testes}),
        # a minutagem dentro do backtest
        "bt_min_d": fam_min["d"] if fam_min else None,
        "bt_min_q": fam_min["q"] if fam_min else None,
        "bt_min_a": fam_min["cru_a"] if fam_min else None,
        "bt_min_b": fam_min["cru_b"] if fam_min else None,
        "bt_min_na": fam_min["n_a"] if fam_min else None,
        "bt_min_nb": fam_min["n_b"] if fam_min else None,
        "bt_min_a_int": int(round(fam_min["cru_a"])) if fam_min else None,
        "bt_min_b_int": int(round(fam_min["cru_b"])) if fam_min else None,
        "bt_min_dif_int": int(round(fam_min["cru_a"] - fam_min["cru_b"])) if fam_min else None,
        "bt_min_dif_jogos": br((fam_min["cru_a"] - fam_min["cru_b"]) / 90.0) if fam_min else None,
        "bt_min_d_sem": fam_min_sem["d"] if fam_min_sem else None,
        "bt_min_q_sem": fam_min_sem["q"] if fam_min_sem else None,
        "bt_min_dmin": fam_min["d_minimo_80"] if fam_min else None,
        "bt_min_dmin_sem": fam_min_sem["d_minimo_80"] if fam_min_sem else None,
        "bt_min_ic": f"[{fam_min['ic95_lo']}; {fam_min['ic95_hi']}]" if fam_min else None,
        "bt_min_ic_sem": (f"[{fam_min_sem['ic95_lo']}; {fam_min_sem['ic95_hi']}]"
                          if fam_min_sem else None),
        "bt_minperm_a": fam_minperm["cru_a"] if fam_minperm else None,
        "bt_minperm_b": fam_minperm["cru_b"] if fam_minperm else None,
        # a contraprova do app
        "app_bt_recomendados": app["n_recomendados"],
        "app_bt_reprovados": app["n_reprovados"],
        "app_bt_min_rec": app["min_medio_recomendados"],
        "app_bt_min_rep": app["min_medio_reprovados"],
        "app_bt_d": app["d_minutos"], "app_bt_p": app["p_minutos"],
        "app_bt_perm_rec": app["permanencia_recomendados_pct"],
        "app_bt_perm_rep": app["permanencia_reprovados_pct"],
        # o funil
        "funil_serie_b": degraus[0]["n"],
        "funil_livres": degraus[1]["n"],
        "funil_confianca": degraus[2]["n"],
        "funil_minutagem": degraus[3]["n"],
        "funil_com_dado": degraus[4]["n"],
        "funil_atende": degraus[5]["n"],
        "funil_sem_ponte": sem_ponte,
        "ct_com_duas_fontes": len(com_duas),
        "ct_concordam": concordam,
        "ct_concordam_pct": conc_pct,
        "bloco_fisico_2026": por_bloco_2026["fisico"],
        "bloco_duelo_2026": por_bloco_2026["duelo_corpo"],
        "bloco_estilo_2026": por_bloco_2026["estilo_tecnico"],
        "bloco_tres_juntos_2026": por_bloco_2026["os_tres_juntos"],
        "bloco_base_2026": por_bloco_2026["base"],
        "funil_estrangeiros": degraus[0]["estrangeiros"],
        "funil_estrangeiros_livres": degraus[1]["estrangeiros"],
        # a oferta
        "oferta_regulares": len(regulares),
        "oferta_livres_regulares": len(livres_reg),
        "oferta_posicoes_escassas": len(escassas),
        "oferta_escassas_frase": " · ".join(
            f"{s} {oferta[s]['livres_regulares']}" for s in escassas) or "nenhuma",
        "oferta_frase": " · ".join(f"{s} {oferta[s]['livres_regulares']}"
                                   for s in sorted(setores,
                                                   key=lambda s: -oferta[s]["livres_regulares"])),
        "oferta_menor": min(oferta[s]["livres_regulares"] for s in setores),
        "oferta_maior": max(oferta[s]["livres_regulares"] for s in setores),
        "oferta_gol": oferta["Goleiro"]["livres_regulares"],
        "oferta_meia": oferta["Meia"]["livres_regulares"],
        "oferta_volante": oferta["Volante"]["livres_regulares"],
        "oferta_extremo": oferta["Extremo"]["livres_regulares"],
        "oferta_zerou": sum(1 for s in setores if oferta[s]["livres_regulares_com_perfil"] == 0),
        "oferta_posicoes": len(setores),
        "oferta_ordem_j09": " · ".join(f"{x['posicao']} {x['livres_regulares']} ({x['rotulo']})"
                                       for x in ordem_j09),
        "oferta_escassez_ou_aperto": " · ".join(
            x["posicao"] for x in ordem_j09 if x["rotulo"] != "dá para escolher"),
        "oferta_abaixo_de_cinco": " · ".join(
            f"{s} {oferta[s]['livres_regulares']}" for s in setores
            if oferta[s]["livres_regulares"] < 5) or "nenhuma",
        "alvos_publicados": alvos_publicados,
        # a base
        "base_linhas": cont["linhas"],
        "base_ambiguos": cont["ambiguos_descartados"],
        "base_2026": len(alvo),
        "base_2026_com_fisico": sum(1 for x in alvo if x["tem_fisico"]),
        "perfil_metricas": sum(len(v) for v in ficha.values()),
        "perfil_posicoes": len(ficha),
        "perfil_menor": min(len(v) for v in ficha.values()),
        "perfil_maior": max(len(v) for v in ficha.values()),
        # a mala (etapa 11)
        "mala_fisico": e11["fisico"]["rho_mediano"],
        "mala_tecnico_mudou": e11["tecnico"]["rho_mediano_mudou"],
        "mala_pares_fisico": e11["fisico"]["pares"],
        "gk_sem_fisico": sum(1 for x in alvo if x["setor"] == "Goleiro" and not x["tem_fisico"]),
        "gk_total": sum(1 for x in alvo if x["setor"] == "Goleiro"),
        "gerado_em": GERADO_EM,
    }
    json.dump({"gerado_por": GERADO_POR, "gerado_em": GERADO_EM, "numeros": numeros},
              open(os.path.join(R, "J06_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    json.dump({"gerado_por": GERADO_POR, "gerado_em": GERADO_EM,
               "semente": SEMENTE, "reps_ic": REPS_IC,
               "familia_do_bh": "grupo × desfecho × corte (§6.3), sem partir por setor",
               "veredito_do_backtest": {k: v for k, v in veredito.items()
                                        if k not in ("com", "sem")},
               "regra_que_autorizava": dec["regra_que_autoriza_publicar_nomes"],
               "porta_temporal": {
                   "passa": False,
                   "parcial_nao_rodou": None,
                   "motivo": ("a porta da §6.4 é o 1º turno prevendo os pontos do 2º, e ela não "
                              "existe nesta unidade: o técnico do Wyscout é agregado por temporada "
                              "e o físico por jogo tem zero linha em 2022-2024. É o mesmo motivo de "
                              "J03, J04 e J05, e por isso o teto declarado antes de rodar era indício."),
                   "o_que_esta_parte_tem_no_lugar": (
                       "o backtest da §8.6 é temporal por construção — pontua com o dado de t−1 e "
                       "mede o desfecho em t —, mas é OUTRO desenho, e esta parte não o chama de "
                       "porta da §6.4 nem carimba confiança com ele.")},
               "diagnostico_do_teste_primario": diagnostico,
               "backtest_perdas": perdas,
               "backtest_por_grupo": {
                   g: {"aprovados": sum(1 for l in bt if l[f"aprovado_{g}"] is True),
                       "reprovados": sum(1 for l in bt if l[f"aprovado_{g}"] is False),
                       "sem_dado": sum(1 for l in bt if l[f"aprovado_{g}"] is None)}
                   for g in grupos},
               "testes_fora_por_n": fora,
               "passa_nos_dois_cortes": [{"familia": f, "setor": s} for f, s in passa_nos_dois],
               "discordancias_entre_os_cortes": disc,
               "cobertura_dos_indicadores": cob,
               "contraprova_backtest_do_app": app,
               "funil": {"degraus": degraus, "molde": e12["degraus"]},
               "oferta_por_posicao": oferta,
               "onde_a_conjuncao_mata": por_bloco_2026,
               "concordancia_de_contrato": {"com_as_duas_fontes": len(com_duas),
                                            "concordam_no_mes": concordam, "pct": conc_pct},
               "posicoes_escassas": escassas,
               "ordem_para_o_J09": ordem_j09,
               "minutagem": {"corte_por_posicao": mi["frase"], "p75": mi["p75"],
                             "confere_com_J05": confere_j05},
               "o_que_o_jogador_leva_na_mala": {"fisico": e11["fisico"], "tecnico": e11["tecnico"],
                                                "uso": e11["uso"]},
               "numeros": numeros},
              open(os.path.join(R, "J06_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # ---- relato ----------------------------------------------------------------------------------
    print(f"\n{'=' * 100}\nO BACKTEST DA §8.6 — a régua estava declarada antes de rodar\n{'=' * 100}")
    print(f"  família primária: {veredito['familia']} · recorte: todos os setores juntos")
    for l in sorted([x for x in testes if x["setor"] == "Todos"],
                    key=lambda x: (x["familia"], x["fronteira"])):
        print(f"  {l['familia']:28s} {l['fronteira']:4s} n {l['n_a']:4d} x {l['n_b']:4d} "
              f"· {l['cru_a']:8.1f} contra {l['cru_b']:8.1f} · d {l['d']:+.3f} "
              f"· q {l['q']:.4f} · {l['selo']}")
    print(f"\n  VEREDITO: {'PASSOU' if veredito['passou'] else 'NÃO PASSOU'} — {veredito['por_que']}")
    print(f"  o perfil inteiro aprova {numeros['bt_aprovados']} das {len(bt)} chegadas "
          f"({numeros['bt_aprovados_sem_fronteira']} sem os clubes de fronteira, abaixo do piso "
          f"declarado de {N_MIN_LADO} por lado)")
    print(f"  contraprova, o backtest da nota do app (etapa 13): recomendados "
          f"{app['min_medio_recomendados']} min contra {app['min_medio_reprovados']} dos reprovados, "
          f"d {app['d_minutos']}, p {app['p_minutos']}")

    print(f"\n{'=' * 100}\nO FUNIL DA SÉRIE B {ANO_ALVO}\n{'=' * 100}")
    for d in degraus:
        print(f"  {d['degrau']:26s} {d['n']:5d}  (saiu {d['saiu']:4d} · "
              f"estrangeiros {d['estrangeiros']:3d} · sem dado {d['excluidos_por_dado_ausente']})")

    print(f"\n{'=' * 100}\nA OFERTA POR POSIÇÃO (o que orienta J09)\n{'=' * 100}")
    print(f"  {'posição':10s} {'na Série B':>11s} {'regulares':>10s} {'livres+reg':>11s} "
          f"{'+perfil':>8s} {'estrang.':>9s}")
    for s in sorted(setores, key=lambda s: -oferta[s]["livres_regulares"]):
        o = oferta[s]
        print(f"  {s:10s} {o['na_serie_b']:11d} {o['regulares']:10d} {o['livres_regulares']:11d} "
              f"{o['livres_regulares_com_perfil']:8d} {o['estrangeiros_livres_regulares']:9d}")
    print(f"\n  posições de oferta escassa (menos de 5 livres com minutagem regular): "
          f"{', '.join(escassas) or 'nenhuma'}")
    print(f"\n  nomes publicados em J06_alvos.csv: {alvos_publicados}"
          + ("" if veredito["passou"] else "  — o backtest não autorizou"))
    print(f"\n  gravados: J06_testes.csv ({len(testes)}), J06_backtest.csv ({len(bt)}), "
          f"J06_funil.csv ({len(linhas_alvo)}), J06_resumo.json, "
          f"J06_numeros.json ({len(numeros)} marcadores)")


if __name__ == "__main__":
    main()
