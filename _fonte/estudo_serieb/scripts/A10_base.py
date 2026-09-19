#!/usr/bin/env python3
"""A10, passo 1 — a base do físico ao longo da temporada.

Monta a base JOGADOR-JOGO que a parte A10 vai testar, e mais nada: aqui não se compara Sobe com
Meio. A lista de indicadores e as famílias fecham neste mesmo passo, ANTES de qualquer teste de
faixa, e vão para `resultados/A10_indicadores.json`.

Escreve, e só:
    resultados/A10_base.csv           uma linha por jogador-jogo (SkillCorner, Série B 2025 e 2026)
    resultados/A10_indicadores.json   a lista pré-declarada, as famílias da §6.3 e o d mínimo
Lê, e não altera: o banco copiado do SkillCorner, dados/serieb_jogos.csv,
resultados/A01_clube_temporada.csv, resultados/classificacao_rodada.csv,
resultados/J04_ponte_clubes.json e resultados/A07_indicadores.json.

## O limite que define a parte, e que não se contorna

O físico POR JOGO da Série B só existe em 2025 (374 jogos, 11.027 linhas) e em 2026 parcial
(207 jogos, 6.048). Em 2022, 2023 e 2024 o `physical_match` tem ZERO linhas — na fonte também
(conferido em 19/09, `_registro.md`). Então A10 responde para UMA temporada fechada, 2025, com
2026 só como teste.

A consequência de poder é dura e está declarada no JSON: no nível CLUBE-TEMPORADA são **4 contra
12** numa temporada só, e o menor d detectável a 80% é **1,74** — desenho que só enxerga efeito
enorme. Por isso o nível principal é o de JOGADOR-JOGO, com milhares de linhas, agregado por
faixa e com o IC vindo do bootstrap de CLUBE (§6.6), que é onde a independência realmente mora.

## O que NÃO existe no `physical_match`, e por isso sai da lista

A07 tinha uma família "com bola ou sem bola" (`m_per_min_tip`, `m_per_min_otip`,
`sprint_distance_p30tip`, `sprint_distance_p30otip`). O `physical_match` **não tem nenhuma coluna
tip/otip** — só as 17 colunas por 90 min mais o `psv99` (conferido no schema). A família inteira
cai em A10, e isso está escrito no JSON como lacuna de dado, não como escolha.

## O corte de turno é por RODADA do clube, não por data

Times têm calendário diferente: em agosto de 2025 um clube estava na 21ª rodada e outro na 19ª.
A rodada de um clube é o seu N-ésimo jogo da Série B na temporada, por data — a mesma definição
do A01. Turno = rodadas 1 a 19; returno = 20 em diante. Em 2025 são 19 contra 19, fechado; em
2026 o returno é parcial (rodadas 20 a 27) e a temporada inteira já está fora do recorte.

A definição é conferida contra `classificacao_rodada.csv` clube a clube: o número de jogos tem de
bater com o `J` da última rodada de lá, e o jogo N do clube não pode ser posterior à data de
fechamento da rodada N. As divergências vão para o JSON, não para debaixo do tapete.

## O descanso conta TODAS as competições, que é o ponto do arquivo

`serieb_jogos.csv` traz estaduais e copas, e é isso que encurta o calendário. Para cada jogo da
Série B com físico, `descanso_dias` = dias desde o jogo ANTERIOR do mesmo clube em QUALQUER
competição do arquivo, no mesmo ano. Jogo com menos de 4 dias fica marcado.

**A armadilha da data, medida e declarada.** O `Data` do Wyscout é data UTC: jogo das 21h30 em
Brasília cai no dia seguinte. O SkillCorner guarda a data local. Nos 1.156 clube-jogo que as duas
bases têm em comum, 505 diferem em exatamente um dia — é o jogo noturno. Como só o Wyscout tem as
outras competições, o descanso é calculado inteiro na convenção do Wyscout (uma convenção só), e
o JSON reporta quantos jogos ficam na borda (descanso de 3 ou 4 dias), que é onde essa incerteza
de um dia pode virar o flag.

## A ponte de clube, e por que aqui não há armadilha de homônimo

O clube vem do `physical_match.team_name` (a `players.team_name` está VAZIA nas 2.105 linhas —
achado do J04), traduzido pela ponte já feita em `J04_ponte_clubes.json`. **A10 não cruza base por
nome de pessoa**: faixa, rodada, descanso e resultado entram pelo CLUBE e pela DATA. A armadilha
do homônimo que o `_registro.md` registra não se aplica a esta parte.

Uso:
    python3 "_fonte/estudo_serieb/scripts/A10_base.py"
"""
import collections
import csv
import datetime as dt
import json
import os
import sqlite3
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
RESULTADOS = os.path.join(ESTUDO, "resultados")
BANCO = os.path.join(ESTUDO, "dados_copiados", "skillcorner_serieb.db")

sys.path.insert(0, AQUI)
from _metodo import d_minimo  # noqa: E402

HOJE = "2026-09-19"
EDICOES = {1061: 2025, 1399: 2026}
TEMPORADAS = [2025, 2026]
RECORTE = 2025                    # a única temporada fechada com físico por jogo
SERIE_B = "Brazil. Serie B"
ULTIMA_RODADA_DO_TURNO = 19
DESCANSO_CURTO = 4                # "menos de 4 dias": descanso_dias < 4 (o corte do arquivo)
DESCANSO_CURTO_SENSIVEL = 5       # corte de sensibilidade, declarado junto: descanso_dias < 5
MIN_P90 = 60.0                    # métricas por 90 só com 60+ min; psv99 usa todos

# --- regras de cobertura, fixadas ANTES de medir -------------------------------------------
# O CLAUDE.md manda informar a cobertura por temporada e por time antes de usar dado físico, não
# imputar, e rodar com e sem quem tiver cobertura baixa. Os dois cortes abaixo estão escritos
# aqui, no código, antes de qualquer número: nenhum deles foi ajustado depois de ver o resultado.
COB_MIN_JOGOS = 0.75              # menos de 75% dos jogos da Série B rastreados = cobertura baixa
COB_MIN_ATLETAS = 0.70            # mediana de atletas por jogo < 70% da mediana do ano = idem

# --- os indicadores, partindo de A07_indicadores.json --------------------------------------
# Cada item é (id em A07, coluna do physical_match, nome, sinal). Sinal 1 = mais é "mais físico";
# nenhuma destas é métrica de desempenho com lado bom declarado — o lado é o da pergunta
# (sustentar = cair menos), e isso está escrito no JSON.
INDICADORES = [
    ("volume", "fis_distance_p90", "distance_p90", "Distância por 90 min (m)", 1),
    ("volume", "fis_running_distance_p90", "running_distance_p90",
     "Distância em corrida por 90 (m)", 1),
    ("volume", "fis_m_per_min", "m_per_min", "Metros por minuto", 1),
    ("intensidade", "fis_hi_distance_p90", "hi_distance_p90",
     "Distância em alta intensidade por 90 (m)", 1),
    ("intensidade", "fis_sprint_distance_p90", "sprint_distance_p90",
     "Distância em sprint por 90 (m)", 1),
    ("intensidade", "fis_sprint_count_p90", "sprint_count_p90", "Número de sprints por 90", 1),
    ("intensidade", "fis_high_accel_p90", "high_accel_p90", "Acelerações fortes por 90", 1),
    ("intensidade", "fis_psv99_top5", "psv99", "PSV-99 do jogador no jogo (km/h)", 1),
]
COLS_FIS = [c for _, _, c, _, _ in INDICADORES]

# As quatro medidas que cada indicador produz, declaradas antes de rodar. Vêm da pergunta do
# arquivo: "as métricas de A07 no turno e no returno" (M1, M2, M3) e "pontos e métricas físicas
# em jogos com menos de 4 dias de descanso" (M4).
MEDIDAS = [
    {"id": "turno", "nome": "nível no 1º turno (rodadas 1–19)"},
    {"id": "returno", "nome": "nível no 2º turno (rodadas 20+)"},
    {"id": "delta_turno", "nome": "returno menos turno — sustentar ao longo da temporada"},
    {"id": "delta_descanso",
     "nome": "jogo com menos de 4 dias de descanso menos jogo normal — sustentar em sequência"},
]


def ler_csv(caminho):
    with open(caminho, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def data(s):
    return dt.date(int(s[0:4]), int(s[5:7]), int(s[8:10]))


def mediana(xs):
    xs = sorted(xs)
    if not xs:
        return None
    m = len(xs) // 2
    return xs[m] if len(xs) % 2 else (xs[m - 1] + xs[m]) / 2


# ------------------------------------------------------------------ 1. a régua e o calendário
def carregar_a01():
    """(temporada, clube) -> faixa, trave, fronteira, dist_g4. A régua do estudo, de A01."""
    saida = {}
    for r in ler_csv(os.path.join(RESULTADOS, "A01_clube_temporada.csv")):
        t = int(r["temporada"])
        if t in TEMPORADAS:
            saida[(t, r["clube"])] = {
                "faixa": r["faixa"], "trave": int(r["trave"]),
                "fronteira": int(r["fronteira"]), "dist_g4": int(r["dist_g4"]),
                "pos_final": int(r["pos"]),
            }
    return saida


def carregar_calendario():
    """Todo jogo de todo clube, em TODAS as competições — é daqui que sai o descanso.

    Devolve (calendario, serie_b):
      calendario[(ano, clube)] = [ {data, competicao, adversario, ...} ] ordenado por data
      serie_b[(ano, clube, data)] = a linha do jogo da Série B, já com a rodada do clube
    """
    linhas = collections.defaultdict(list)
    for r in ler_csv(os.path.join(DADOS, "serieb_jogos.csv")):
        ano = int(r["ano"])
        if ano not in TEMPORADAS or not r.get("Data"):
            continue
        linhas[(ano, r["Equipa"])].append({
            "data": data(r["Data"]), "competicao": r["Competição"],
            "adversario": r["adversario"], "mando": r["mando"],
            "resultado": r["resultado"],
            "golos_pro": int(float(r["golos_pro"] or 0)),
            "golos_contra": int(float(r["golos_contra"] or 0)),
        })
    serie_b = {}
    for chave, js in linhas.items():
        js.sort(key=lambda l: l["data"])
        anterior = None
        rodada = 0
        for l in js:
            l["descanso_dias"] = (l["data"] - anterior["data"]).days if anterior else None
            l["comp_anterior"] = anterior["competicao"] if anterior else ""
            anterior = l
            if l["competicao"] == SERIE_B:
                rodada += 1
                l["rodada"] = rodada
                serie_b[(chave[0], chave[1], l["data"])] = l
    return linhas, serie_b


def conferir_rodada(serie_b):
    """A rodada deste script contra `classificacao_rodada.csv`, clube a clube.

    Duas conferências: (a) o número de jogos do clube na base tem de bater com o `J` da última
    rodada de lá; (b) o jogo N do clube não pode ser posterior à data de fechamento da rodada N
    (lá `data` é a MAIOR data da rodada, não a data do jogo do clube).
    """
    cr = [r for r in ler_csv(os.path.join(RESULTADOS, "classificacao_rodada.csv"))
          if int(r["temporada"]) in TEMPORADAS]
    fecha, jogos_la = {}, {}
    for r in cr:
        t, rod = int(r["temporada"]), int(r["rodada"])
        fecha[(t, rod)] = max(fecha.get((t, rod), ""), r["data"])
        jogos_la[(t, r["clube"])] = max(jogos_la.get((t, r["clube"]), 0), int(r["J"]))
    meus = collections.Counter()
    for (t, c, _), l in serie_b.items():
        meus[(t, c)] += 1
    divergencias = []
    for chave, n in sorted(meus.items()):
        if jogos_la.get(chave) != n:
            divergencias.append({"temporada": chave[0], "clube": chave[1],
                                 "jogos_aqui": n, "J_na_classificacao": jogos_la.get(chave)})
    fora_da_janela = []
    for (t, c, d), l in serie_b.items():
        limite = fecha.get((t, l["rodada"]))
        if limite and d.isoformat() > limite:
            fora_da_janela.append({"temporada": t, "clube": c, "rodada": l["rodada"],
                                   "data_do_jogo": d.isoformat(), "fecha_a_rodada": limite})
    return {"clubes_conferidos": len(meus),
            "divergencia_no_numero_de_jogos": divergencias,
            "jogo_depois_do_fecho_da_rodada": sorted(
                fora_da_janela, key=lambda x: (x["temporada"], x["clube"]))[:20],
            "n_jogo_depois_do_fecho": len(fora_da_janela)}


# ---------------------------------------------------------------------- 2. o físico por jogo
def carregar_fisico():
    con = sqlite3.connect("file:" + BANCO + "?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    cols = ", ".join(COLS_FIS)
    linhas = [dict(r) for r in con.execute(
        "SELECT sc_player_id, sc_match_id, sc_competition_edition_id, match_date, match_name, "
        "team_id, team_name, position, position_group, minutes_played, " + cols +
        " FROM physical_match WHERE sc_competition_edition_id IN (?, ?)", tuple(EDICOES))]
    nomes = {r[0]: (r[1], r[2]) for r in con.execute(
        "SELECT sc_player_id, nome, short_name FROM players")}
    con.close()
    return linhas, nomes


def casar_data(temporada, clube, d_sc, serie_b):
    """O jogo do SkillCorner contra o jogo do Wyscout: mesma data local ou um dia depois.

    O Wyscout guarda data UTC; jogo noturno em Brasília cai no dia seguinte. Só estas duas
    janelas são aceitas, e sempre a mais próxima — nunca um 'mais ou menos dois dias'.
    """
    for delta in (0, 1):
        alvo = serie_b.get((temporada, clube, d_sc + dt.timedelta(days=delta)))
        if alvo:
            return alvo, delta
    return None, None


# ------------------------------------------------------------------------------------ 3. main
def main():
    a01 = carregar_a01()
    calendario, serie_b = carregar_calendario()
    conf_rodada = conferir_rodada(serie_b)
    fisico, nomes = carregar_fisico()
    ponte = json.load(open(os.path.join(RESULTADOS, "J04_ponte_clubes.json"),
                           encoding="utf-8"))["mapa"]
    a07 = json.load(open(os.path.join(RESULTADOS, "A07_indicadores.json"), encoding="utf-8"))

    # atletas rastreados por clube-jogo: o descritor de rodízio de A07, na régua do jogo
    rastreados = collections.Counter()
    for r in fisico:
        rastreados[(r["sc_match_id"], r["team_name"])] += 1

    sem_ponte, sem_par = collections.Counter(), []
    linhas = []
    for r in fisico:
        temporada = EDICOES[r["sc_competition_edition_id"]]
        clube = ponte.get(r["team_name"])
        if not clube:
            sem_ponte[r["team_name"]] += 1
            continue
        d_sc = data(r["match_date"])
        jogo, delta = casar_data(temporada, clube, d_sc, serie_b)
        if jogo is None:
            sem_par.append({"temporada": temporada, "clube": clube,
                            "data_sc": d_sc.isoformat(), "jogo": r["match_name"]})
            continue
        reg = a01.get((temporada, clube), {})
        pontos = {"V": 3, "E": 1, "D": 0}.get(jogo["resultado"])
        desc = jogo["descanso_dias"]
        nome, short = nomes.get(r["sc_player_id"], ("", ""))
        linha = {
            "temporada": temporada,
            "no_recorte": 1 if temporada == RECORTE else 0,
            "clube": clube,
            "faixa": reg.get("faixa", ""),
            "trave": reg.get("trave", ""),
            "fronteira": reg.get("fronteira", ""),
            "dist_g4": reg.get("dist_g4", ""),
            "pos_final": reg.get("pos_final", ""),
            "sc_match_id": r["sc_match_id"],
            "data_sc": d_sc.isoformat(),
            "data_wy": jogo["data"].isoformat(),
            "data_desloc": delta,
            "rodada": jogo["rodada"],
            "turno": "1T" if jogo["rodada"] <= ULTIMA_RODADA_DO_TURNO else "2T",
            "adversario": jogo["adversario"],
            "mando": jogo["mando"],
            "resultado": jogo["resultado"],
            "pontos_jogo": pontos,
            "golos_pro": jogo["golos_pro"],
            "golos_contra": jogo["golos_contra"],
            "descanso_dias": "" if desc is None else desc,
            "jogo_curto": "" if desc is None else int(desc < DESCANSO_CURTO),
            "jogo_curto_ate4": "" if desc is None else int(desc < DESCANSO_CURTO_SENSIVEL),
            "descanso_na_borda": "" if desc is None else int(desc in (3, 4)),
            "comp_anterior": jogo["comp_anterior"],
            "sc_player_id": r["sc_player_id"],
            "jogador": short or nome,
            "posicao": r["position"] or "",
            "setor": r["position_group"] or "",
            "minutos": r["minutes_played"],
            "min60": int((r["minutes_played"] or 0) >= MIN_P90),
            "atletas_no_jogo": rastreados[(r["sc_match_id"], r["team_name"])],
        }
        for c in COLS_FIS:
            linha[c] = r[c]
        linhas.append(linha)

    # ---------------------------------------------------------------- 4. cobertura, sem imputar
    jogos_sb = collections.Counter()
    for (t, c, _) in serie_b:
        jogos_sb[(t, c)] += 1
    rastreados_clube = collections.defaultdict(set)
    atletas_por_jogo = collections.defaultdict(list)
    for l in linhas:
        rastreados_clube[(l["temporada"], l["clube"])].add(l["sc_match_id"])
    for l in linhas:
        atletas_por_jogo[(l["temporada"], l["clube"], l["sc_match_id"])] = l["atletas_no_jogo"]
    med_ano = {}
    for t in TEMPORADAS:
        vals = [v for (tt, _, _), v in atletas_por_jogo.items() if tt == t]
        med_ano[t] = mediana(vals)
    cobertura = {}
    for (t, c), n_sb in sorted(jogos_sb.items()):
        rast = len(rastreados_clube.get((t, c), ()))
        ats = [v for (tt, cc, _), v in atletas_por_jogo.items() if tt == t and cc == c]
        med_c = mediana(ats)
        pct = rast / n_sb if n_sb else 0.0
        baixa = int(pct < COB_MIN_JOGOS or
                    (med_c is not None and med_ano[t] and
                     med_c < COB_MIN_ATLETAS * med_ano[t]))
        cobertura[(t, c)] = {"jogos_serie_b": n_sb, "jogos_rastreados": rast,
                             "cobertura_pct": round(100 * pct, 1),
                             "atletas_por_jogo_mediana": med_c,
                             "cobertura_baixa": baixa}
    for l in linhas:
        cob = cobertura[(l["temporada"], l["clube"])]
        l["cobertura_pct"] = cob["cobertura_pct"]
        l["cobertura_baixa"] = cob["cobertura_baixa"]

    linhas.sort(key=lambda l: (l["temporada"], l["clube"], l["rodada"], l["sc_player_id"]))

    # ---------------------------------------------------------- 5. o retrato do descanso
    por_clube_jogo = {}
    for l in linhas:
        por_clube_jogo[(l["temporada"], l["clube"], l["sc_match_id"])] = l
    def retrato_descanso(temporada):
        js = [l for l in por_clube_jogo.values() if l["temporada"] == temporada]
        curtos = [l for l in js if l["jogo_curto"] == 1]
        por_faixa = {}
        for f in ("Sobe", "Meio", "Cai"):
            da_faixa = [l for l in js if l["faixa"] == f]
            c = [l for l in da_faixa if l["jogo_curto"] == 1]
            por_faixa[f] = {
                "clube_jogo_rastreado": len(da_faixa), "com_menos_de_4_dias": len(c),
                "pct": round(100 * len(c) / len(da_faixa), 1) if da_faixa else None,
                "clubes": len({l["clube"] for l in da_faixa}),
            }
        dias = [l["descanso_dias"] for l in js if l["descanso_dias"] != ""]
        dist = collections.Counter(dias)
        # de onde veio o jogo anterior dos jogos curtos: é aqui que se vê copa e estadual
        origem = collections.Counter(l["comp_anterior"] for l in curtos)
        return {
            "clube_jogo_rastreado": len(js),
            "com_menos_de_4_dias": len(curtos),
            "pct_do_total": round(100 * len(curtos) / len(js), 1) if js else None,
            "com_menos_de_5_dias_sensibilidade": sum(1 for l in js
                                                     if l["jogo_curto_ate4"] == 1),
            "sem_descanso_por_ser_o_1o_jogo_do_ano": sum(1 for l in js
                                                         if l["descanso_dias"] == ""),
            "na_borda_3_ou_4_dias": sum(1 for l in js if l["descanso_na_borda"] == 1),
            "se_todo_jogo_deslocasse_1_dia_para_cima": sum(1 for d in dias if d < 3),
            "se_todo_jogo_deslocasse_1_dia_para_baixo": sum(1 for d in dias if d < 5),
            "distribuicao_dias": {str(k): v for k, v in sorted(dist.items())},
            "por_faixa": por_faixa,
            "competicao_do_jogo_anterior_nos_curtos": dict(origem.most_common()),
        }
    descanso = {str(t): retrato_descanso(t) for t in TEMPORADAS}

    # o rodízio de verdade: quantas pessoas diferentes o clube rastreou, e em cada turno.
    # No nível do JOGO o SkillCorner rastreia um teto de ~15 por equipa, então "atletas no jogo"
    # quase não varia e não serve de descritor de rodízio; quem varia é o elenco da temporada.
    rodizio = {}
    for t in TEMPORADAS:
        por_clube = {}
        for l in linhas:
            if l["temporada"] != t:
                continue
            d = por_clube.setdefault(l["clube"], {"temporada": set(), "1T": set(), "2T": set()})
            d["temporada"].add(l["sc_player_id"])
            d[l["turno"]].add(l["sc_player_id"])
        rodizio[str(t)] = {c: {"atletas_na_temporada": len(v["temporada"]),
                               "atletas_no_turno": len(v["1T"]),
                               "atletas_no_returno": len(v["2T"]),
                               "so_no_returno": len(v["2T"] - v["1T"])}
                           for c, v in sorted(por_clube.items())}
    teto_por_jogo = collections.Counter(l["atletas_no_jogo"] for l in linhas)

    # ------------------------------------------------------------------ 6. o poder, nos 2 níveis
    n_clube = collections.Counter()
    for (t, c) in cobertura:
        if t == RECORTE:
            n_clube[a01[(t, c)]["faixa"]] += 1
    n_trave = sum(1 for (t, c) in cobertura if t == RECORTE and a01[(t, c)]["trave"] == 1)
    sem_f = collections.Counter()
    for (t, c) in cobertura:
        if t == RECORTE and a01[(t, c)]["fronteira"] == 0:
            sem_f[a01[(t, c)]["faixa"]] += 1
    rec = [l for l in linhas if l["no_recorte"] == 1]
    rec60 = [l for l in rec if l["min60"] == 1]
    n_lin = collections.Counter(l["faixa"] for l in rec60)
    n_jog = {f: len({l["sc_player_id"] for l in rec60 if l["faixa"] == f})
             for f in ("Sobe", "Meio", "Cai")}
    poder = {
        "clube_temporada_2025": {
            "n": dict(n_clube), "n_trave": n_trave,
            "d_minimo_80_SM": d_minimo(n_clube["Sobe"], n_clube["Meio"]),
            "d_minimo_80_ST": d_minimo(n_clube["Sobe"], n_trave),
            "d_minimo_80_CM": d_minimo(n_clube["Cai"], n_clube["Meio"]),
            "sem_fronteira": dict(sem_f),
            "sem_fronteira_roda": (sem_f["Sobe"] >= 5 and sem_f["Meio"] >= 5),
            "leitura": "4 contra 12 numa temporada só. O menor efeito que este desenho enxerga "
                       "a 80% é enorme; e sem os times de fronteira sobram 2 do Sobe, abaixo do "
                       "piso de 5 do _metodo.comparar — o corte sem fronteira NÃO roda neste "
                       "nível. É por isso que o nível principal é o de jogador-jogo.",
        },
        "jogador_jogo_2025_min60": {
            "n_linhas": dict(n_lin),
            "d_minimo_80_SM_pelo_n_de_linhas": d_minimo(n_lin["Sobe"], n_lin["Meio"]),
            "n_jogadores": n_jog,
            "d_minimo_80_SM_pelo_n_de_jogadores": d_minimo(n_jog["Sobe"], n_jog["Meio"]),
            "n_clubes": dict(n_clube),
            "d_minimo_80_SM_pelo_n_de_clubes": d_minimo(n_clube["Sobe"], n_clube["Meio"]),
            "leitura": "Os três d mínimos são o mesmo desenho contado em três unidades. O de "
                       "linhas é otimista (linha não é independente: 4 clubes, §6.6), o de "
                       "clubes é o pessimista honesto. Quem decide o intervalo é o bootstrap de "
                       "CLUBE do _metodo.ic_por_clube, e é ele que vai ao lado de cada d.",
        },
    }

    # ---------------------------------------------------------------------- 7. a base em disco
    campos = ["temporada", "no_recorte", "clube", "faixa", "trave", "fronteira", "dist_g4",
              "pos_final", "cobertura_pct", "cobertura_baixa", "sc_match_id", "data_sc",
              "data_wy", "data_desloc", "rodada", "turno", "adversario", "mando", "resultado",
              "pontos_jogo", "golos_pro", "golos_contra", "descanso_dias", "jogo_curto",
              "jogo_curto_ate4", "descanso_na_borda", "comp_anterior", "atletas_no_jogo",
              "sc_player_id",
              "jogador", "posicao", "setor", "minutos", "min60"] + COLS_FIS
    with open(os.path.join(RESULTADOS, "A10_base.csv"), "w", newline="",
              encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=campos)
        w.writeheader()
        w.writerows(linhas)

    # --------------------------------------------------------- 8. a lista pré-declarada (§6.3)
    comparacoes = [
        {"id": "SM", "nome": "Sobe × Meio", "papel": "padrão",
         "nota": "A comparação que define característica (§6.2)."},
        {"id": "ST", "nome": "Sobe × Trave (5º–8º)", "papel": "secundária",
         "nota": "Recorte próprio do estudo. Em 2025 são 4 contra 4 clubes: declarada para não "
                 "ser escolhida depois, e lida com o d mínimo ao lado."},
        {"id": "CM", "nome": "Cai × Meio", "papel": "secundária",
         "nota": "Declarada em A07 e mantida: se o sinal físico estiver do lado de quem cai, a "
                 "leitura muda de lado."},
    ]
    familias = []
    for pilar, nome_pilar, ids in (
        ("fisico_ind", "Físico individual, na régua do jogador-jogo (nível principal)",
         [c for _, _, c, _, _ in INDICADORES]),
        ("fisico_col", "Físico coletivo, na régua do clube-temporada",
         [c for _, _, c, _, _ in INDICADORES]),
        ("resultado_col", "Resultado do clube no jogo (porta D: é o placar redescrito)",
         ["pontos_jogo"]),
    ):
        for comp in comparacoes:
            familias.append({
                "id": pilar + "_x_" + comp["id"],
                "pilar": pilar, "pilar_nome": nome_pilar, "comparacao": comp["id"],
                "indicadores": ids, "medidas": [m["id"] for m in MEDIDAS],
                "n_testes": len(ids) * len(MEDIDAS),
                "bh": "Benjamini-Hochberg a 5% sobre os " + str(len(ids) * len(MEDIDAS)) +
                      " testes desta família, todos juntos.",
            })

    decl = {
        "parte": "A10",
        "pergunta": "Quem sobe sustenta a intensidade no returno e em sequências de jogos?",
        "declarado_em": HOJE,
        "declarado_antes_de_calcular": True,
        "declarado_antes_de_calcular_o_que":
            "Nenhuma comparação entre faixas foi rodada antes desta lista. O que foi medido "
            "antes dela é só o que o CLAUDE.md manda medir antes de usar dado físico — "
            "cobertura por temporada e por time — mais o retrato do descanso e o poder do "
            "desenho, que são propriedades da base e do n, não resultado de comparação.",
        "escrito_por": "scripts/A10_base.py (passo 1 de A10: a base, e só a base)",

        "o_limite_que_define_a_parte": {
            "o_que_e": "O físico POR JOGO da Série B só existe em 2025 e em 2026 parcial. Em "
                       "2022, 2023 e 2024 o physical_match tem ZERO linhas — na fonte também, "
                       "conferido em 19/09 (_registro.md).",
            "consequencia": "A10 responde para UMA temporada fechada (2025). 2026 entra "
                            "marcado como teste (no_recorte = 0) e nunca no recorte principal.",
            "linhas": {"2025": sum(1 for l in linhas if l["temporada"] == 2025),
                       "2026": sum(1 for l in linhas if l["temporada"] == 2026)},
            "clube_jogo": {str(t): sum(1 for k in por_clube_jogo if k[0] == t)
                           for t in TEMPORADAS},
        },

        "recorte": {
            "temporadas_na_base": TEMPORADAS,
            "temporada_das_conclusoes": RECORTE,
            "unidade_principal": "jogador-jogo",
            "unidade_secundaria": "clube-temporada (4 contra 12: ver poder)",
            "goleiro": "Fora, e não por escolha: o SkillCorner não rastreia goleiro. O "
                       "physical_match não tem nenhum position_group de goleiro.",
        },

        "fonte_do_dado": {
            "fisico_por_jogo": "_fonte/estudo_serieb/dados_copiados/skillcorner_serieb.db, "
                               "tabela physical_match, edições 1061 = Série B 2025 e "
                               "1399 = Série B 2026. Só leitura.",
            "clube": "physical_match.team_name traduzido por resultados/J04_ponte_clubes.json "
                     "(players.team_name está VAZIA nas 2.105 linhas — achado do J04).",
            "faixa_trave_fronteira": "resultados/A01_clube_temporada.csv.",
            "rodada": "o N-ésimo jogo do clube na Série B por data, mesma definição do A01, "
                      "conferida contra resultados/classificacao_rodada.csv.",
            "calendario_e_descanso": "dados/serieb_jogos.csv, TODAS as competições "
                                     "(coluna Competição), não só a Série B.",
            "lista_de_partida": "resultados/A07_indicadores.json, declarada em " +
                                a07["declarado_em"] + ".",
        },

        "corte_turno_returno": {
            "regra": "Por RODADA do clube, não por data: turno = rodadas 1 a " +
                     str(ULTIMA_RODADA_DO_TURNO) + "; returno = rodada " +
                     str(ULTIMA_RODADA_DO_TURNO + 1) + " em diante.",
            "por_que_nao_pela_data": "Times têm calendário diferente — com jogo adiado, a mesma "
                                     "data é a 19ª rodada de um clube e a 21ª de outro.",
            "2025": "38 rodadas: 19 contra 19, fechado.",
            "2026": "27 rodadas na base: o returno é parcial (20 a 27) e a temporada inteira "
                    "está fora do recorte principal.",
            "conferencia_contra_classificacao_rodada": conf_rodada,
            "jogos_que_faltam_na_base": "A01 registra 5 jogos ausentes de serieb_jogos.csv, 3 "
                                        "deles em 2026. Nos 6 clube-temporada de 2026 afetados "
                                        "a rodada deste script fica deslocada em 1; 2025 está "
                                        "completa e é ela que responde.",
        },

        "descanso": {
            "regra": "Para cada jogo da Série B com físico, descanso_dias = dias desde o jogo "
                     "ANTERIOR do mesmo clube em QUALQUER competição de serieb_jogos.csv, no "
                     "mesmo ano. jogo_curto = 1 quando descanso_dias < " + str(DESCANSO_CURTO) +
                     ".",
            "corte_de_sensibilidade_declarado_junto":
                "jogo_curto_ate4 = 1 quando descanso_dias < " + str(DESCANSO_CURTO_SENSIVEL) +
                ". Declarado AGORA, junto com o corte do arquivo, e não depois: existe porque a "
                "data tem grão de um dia (ver armadilha_da_data) e porque com o corte do "
                "arquivo o grupo curto é pequeno. O corte que responde a pergunta continua "
                "sendo o de menos de 4 dias; o de menos de 5 é robustez.",
            "por_que_todas_as_competicoes": "É o ponto do arquivo: a base traz estaduais e "
                                            "copas, e é isso que encurta o calendário.",
            "confundidor_declarado": "Se quem sobe joga mais copa, ele tem mais jogo curto — "
                                     "isso é confundidor, não resultado. Por isso a "
                                     "distribuição por faixa entra aqui, antes do teste, e a "
                                     "comparação jogo curto × jogo normal é feita DENTRO do "
                                     "clube, para o clube ser o seu próprio controle.",
            "armadilha_da_data": {
                "o_que_e": "Data do Wyscout é UTC: jogo das 21h30 em Brasília cai no dia "
                           "seguinte. O SkillCorner guarda a data local.",
                "medida": "Nos clube-jogo que as duas bases têm em comum, o deslocamento é 0 "
                          "ou exatamente 1 dia; a contagem por deslocamento está em "
                          "conferencia_do_casamento_de_jogo.",
                "o_que_se_faz": "O descanso usa UMA convenção só, a do Wyscout, porque só ela "
                                "tem as outras competições. A incerteza de um dia só morde na "
                                "borda, e a borda (descanso de 3 ou 4 dias) está contada.",
            },
            "medido": descanso,
        },

        "cobertura": {
            "exigida_pelo_claude_md": "Antes de usar, informe a cobertura por temporada e por "
                                      "time. Não impute valores; time-temporada com cobertura "
                                      "baixa é sinalizado e rodado com e sem.",
            "regra_fixada_antes_de_medir": {
                "jogos": "cobertura baixa quando o clube-temporada tem menos de " +
                         str(int(COB_MIN_JOGOS * 100)) + "% dos seus jogos da Série B "
                         "rastreados.",
                "atletas": "ou quando a mediana de atletas rastreados por jogo fica abaixo de " +
                           str(int(COB_MIN_ATLETAS * 100)) + "% da mediana do próprio ano.",
                "nao_imputar": "Jogo sem físico não vira média de nada: fica de fora, contado.",
                "denominador": "jogos_serie_b é o que serieb_jogos.csv tem do clube naquela "
                               "temporada; jogos_rastreados é o que entrou nesta base. O jogo "
                               "de 2026 que o SkillCorner tem e o Wyscout não (Criciúma × Vila "
                               "Nova) fica fora dos dois lados: aparece no audit, não na conta.",
            },
            "mediana_de_atletas_por_jogo_no_ano": {str(t): med_ano[t] for t in TEMPORADAS},
            "por_clube_temporada": {
                str(t): {c: cobertura[(tt, c)] for (tt, c) in sorted(cobertura) if tt == t}
                for t in TEMPORADAS},
            "clubes_com_cobertura_baixa": {
                str(t): sorted(c for (tt, c) in cobertura
                               if tt == t and cobertura[(tt, c)]["cobertura_baixa"])
                for t in TEMPORADAS},
            "o_que_a_regra_produziu":
                "Em 2025, a temporada que responde, a cobertura vai de 92,1% a 100% e NENHUM "
                "clube fica marcado — o corte com e sem cobertura baixa é, em 2025, a mesma "
                "conta duas vezes. Em 2026 a faixa inteira é estreita (73,1% a 80,8%: é a "
                "temporada em curso, todo mundo igual) e a linha dos 75% parte um grupo "
                "homogêneo; ali a marca é efeito do limiar, não diferença real, e 2026 já está "
                "fora do recorte de qualquer jeito. A regra fica como foi declarada.",
        },

        "comparacoes": comparacoes,
        "medidas": MEDIDAS,
        "familias": familias,
        "unidade_da_familia": {
            "regra": "§6.3 da ESPECIFICACAO.md: uma família = um pilar × uma comparação. O BH a "
                     "5% roda sobre TODOS os testes da família juntos.",
            "por_que_esta_escrito_aqui": "J03 e J04 partiram a família também por SETOR, e a "
                                         "conferência do J04 apontou isso como divergência da "
                                         "especificação. A10 não parte por setor.",
            "o_corte_de_fronteira_nao_parte_a_familia": "Rodar sem os times de fronteira é "
                                                        "REPETIR a análise inteira, não dividir "
                                                        "a família: são duas rodadas do mesmo "
                                                        "conjunto de testes, e firme é firme nas "
                                                        "duas (_metodo_fronteira.md).",
            "leitura_secundaria": "A versão partida por setor (zaga, lateral, meio, ataque) e a "
                                  "versão partida por pergunta (turno × descanso) podem ser "
                                  "rodadas, e se forem entram rotuladas como SECUNDÁRIAS. A "
                                  "principal é a da §6.3.",
        },

        "indicadores": [
            {"familia_em_A07": fam, "id_em_A07": a07id, "coluna": col, "nome": nome,
             "sinal": sinal,
             "min_60": col != "psv99",
             "nota": "Métrica de pico: usa todos os jogos, como manda o CLAUDE.md."
                     if col == "psv99" else
                     "Por 90 min: só jogos com pelo menos 60 minutos em campo."}
            for fam, a07id, col, nome, sinal in INDICADORES
        ],
        "descritor_fora_das_conclusoes": [
            {"coluna": "atletas_no_jogo",
             "nome": "Atletas rastreados do clube naquele jogo",
             "papel": "Não entra em família nem em BH. E, medido, NÃO serve de descritor de "
                      "rodízio: o SkillCorner rastreia um teto por equipa-jogo e a coluna quase "
                      "não varia.",
             "distribuicao": {str(k): v for k, v in sorted(teto_por_jogo.items())}},
            {"coluna": "(derivado) atletas distintos por clube-temporada e por turno",
             "nome": "O rodízio de verdade, na régua em que ele existe",
             "papel": "É este o descritor de rodízio de A10, no lugar do fis_atletas de A07. "
                      "Fora das conclusões: serve para checar se a queda do returno é o mesmo "
                      "time cansado ou outro time em campo.",
             "medido": rodizio,
             "rodizio_em_A07": a07["rodizio"]["situacao"]},
        ],

        "o_que_nao_roda_por_falta_de_dado": [
            {"o_que": "A família 'com bola ou sem bola' de A07 (m_per_min_tip, m_per_min_otip, "
                      "sprint_distance_p30tip, sprint_distance_p30otip).",
             "por_que": "O physical_match não tem NENHUMA coluna tip/otip — só as por 90 min e "
                        "o psv99 (conferido no schema da tabela). O agregado por temporada tem; "
                        "o por jogo, não.",
             "consequencia": "A10 responde volume e intensidade, e não responde 'com bola ou "
                             "sem bola' ao longo da temporada. Nenhuma cópia resolve."},
            {"o_que": "1º tempo × 2º tempo e faixas de 15 min.",
             "por_que": "O SkillCorner guarda um período só, full_all (A08 não roda).",
             "consequencia": "'Sustentar dentro do jogo' é A08 e continua fora."},
            {"o_que": "Recorte por estado do jogo (vencendo/perdendo no minuto).",
             "por_que": "Não existe em base nenhuma do repositório.",
             "consequencia": "Ver 'placar' abaixo: o que dá para fazer é separar pelo "
                             "RESULTADO FINAL, que não é a mesma coisa."},
            {"o_que": "Sobe × Meio no nível clube-temporada SEM os times de fronteira.",
             "por_que": "Em 2025 sobram 2 clubes no Sobe, abaixo do piso de 5 do método.",
             "consequencia": "O corte de fronteira só roda de verdade no nível jogador-jogo, e "
                             "mesmo lá com 2 clubes do lado do Sobe — o bootstrap de clube diz "
                             "o tamanho disso."},
        ],

        "poder": poder,

        "porta_temporal": {
            "situacao": "Aqui ela RODA, e é a primeira parte física em que roda: com físico por "
                        "jogo em 2025 dá para medir o indicador no 1º turno e os pontos "
                        "somados do 2º turno, no molde da §6.4.",
            "como": "Média do indicador nas rodadas 1–19 do clube, em posto dentro do ano, "
                    "contra os pontos das rodadas 20–38, com a correlação parcial dada a "
                    "pontuação do 1º turno.",
            "limite": "n = 20 clubes, uma temporada. A parcial com n=20 é frouxa; o número vai "
                      "com o n ao lado e não sustenta 'firme' sozinho.",
            "efeito_no_selo": "Confiança, três níveis e só três: firme = BH E porta temporal; "
                              "provável = só um; indício = nenhum, e a frase diz por quê.",
        },

        "placar": {
            "o_que_o_claude_md_pede": a07["ressalvas_declaradas"][1],
            "o_que_da_para_fazer_aqui": "A base tem jogo a jogo com data, então cada linha "
                                        "carrega resultado (V/E/D), mando e o placar do jogo. "
                                        "Dá para separar vitória, empate e derrota.",
            "por_que_isso_nao_e_o_recorte_que_a_especificacao_queria":
                "Estado do jogo é o placar NO MINUTO; resultado final é o placar DEPOIS. "
                "Condicionar no resultado final é condicionar num desfecho que o próprio físico "
                "ajuda a produzir — abre viés de colisor. Por isso a análise principal roda SEM "
                "condicionar, e o recorte por V/E/D entra declarado como leitura de "
                "sensibilidade: se o achado sobreviver dentro das três, ele não é só o placar; "
                "se sumir, a conclusão sai marcada 'pode ser efeito do placar'.",
            "colunas_na_base": ["resultado", "mando", "golos_pro", "golos_contra",
                                "pontos_jogo"],
        },

        "fronteira": {
            "regra": "Toda comparação entre faixas roda também sem os times de fronteira. "
                     "Conclusão que só aparece COM eles é ruído (_metodo_fronteira.md).",
            "em_2025": {"fronteira": sum(1 for (t, c) in cobertura
                                         if t == RECORTE and a01[(t, c)]["fronteira"] == 1),
                        "sobram_por_faixa": dict(sem_f)},
        },

        "metodo": {
            "referencia": "§6 da _fonte/prototipo/ESPECIFICACAO.md e scripts/_metodo.py.",
            "posto": "Posto dentro da temporada (percentil_no_ano), nunca valor bruto entre "
                     "anos. Como o recorte é de uma temporada só, o posto é dentro de 2025.",
            "teste": "Welch bilateral + d de Cohen no percentil, com o sinal declarado.",
            "ic": "Bootstrap de CLUBE, 2.000 réplicas (_metodo.ic_por_clube) — linha de "
                  "jogador-jogo não é unidade independente (§6.6).",
            "bh": "5% dentro de cada família (§6.3), como listado em familias.",
            "garimpo": "A lista é fechada e pequena e não há escolha do melhor entre muitos; se "
                       "em algum momento A10 escolher o melhor de um conjunto, o nulo do "
                       "garimpo entra.",
            "sufixos": "Só há _p90 nesta base (mais o psv99, que é pico). Não há _p30tip nem "
                       "_p30otip por jogo, então a proibição de comparar réguas diferentes não "
                       "chega a morder aqui.",
        },

        "ressalvas_declaradas": [
            "UMA temporada fechada. Tudo que A10 concluir vale para 2025, e a frase tem de "
            "dizer isso — não é 'quem sobe', é 'quem subiu em 2025'.",
            "No nível clube-temporada são 4 contra 12: 'não separa' aqui significa 'este "
            "desenho não conseguiria ver' (§6.7). O n de 4 vai em toda linha.",
            "Correr muda com o placar. O recorte possível é por resultado final, não por estado "
            "do jogo, e ele é sensibilidade, não prova.",
            "Jogo curto pode ser consequência de jogar copa, e jogar copa anda com ser time bom. "
            "A comparação curto × normal é feita dentro do clube por causa disso.",
            "O psv99 é pico do jogador no jogo: usa todos os jogos, inclusive os de poucos "
            "minutos. As métricas por 90 usam só jogos com 60+ minutos.",
        ],

        "conferencia_do_casamento_de_jogo": {
            "regra": "O jogo do SkillCorner casa com o do Wyscout por clube e por data local, "
                     "aceitando 0 ou +1 dia (a data UTC do Wyscout).",
            "linhas_lidas_do_physical_match": len(fisico),
            "linhas_na_base": len(linhas),
            "deslocamento_0_dia": sum(1 for l in linhas if l["data_desloc"] == 0),
            "deslocamento_1_dia": sum(1 for l in linhas if l["data_desloc"] == 1),
            "clube_jogo_com_deslocamento_1_dia": sum(
                1 for l in por_clube_jogo.values() if l["data_desloc"] == 1),
            "team_name_sem_ponte": dict(sem_ponte),
            "jogos_do_skillcorner_sem_par_no_wyscout": sorted(
                {(x["temporada"], x["clube"], x["data_sc"], x["jogo"]) for x in sem_par}),
            "nota_sobre_o_sem_par": "O único jogo sem par é o Criciúma × Vila Nova de 2026, que "
                                    "é exatamente um dos 5 jogos que A01 já tinha identificado "
                                    "como ausentes de serieb_jogos.csv. A base do SkillCorner "
                                    "confirma o achado do A01 por um caminho independente.",
        },
    }
    with open(os.path.join(RESULTADOS, "A10_indicadores.json"), "w", encoding="utf-8") as f:
        json.dump(decl, f, ensure_ascii=False, indent=1)

    print("A10_base.csv  ", len(linhas), "linhas jogador-jogo;",
          len(por_clube_jogo), "clube-jogo")
    print("A10_indicadores.json  famílias:", len(familias),
          "| d mínimo clube-temporada SM:", poder["clube_temporada_2025"]["d_minimo_80_SM"])
    for t in TEMPORADAS:
        d = descanso[str(t)]
        print(" ", t, "clube-jogo", d["clube_jogo_rastreado"],
              "| menos de 4 dias:", d["com_menos_de_4_dias"],
              "| na borda 3-4 dias:", d["na_borda_3_ou_4_dias"])


if __name__ == "__main__":
    main()
