#!/usr/bin/env python3
"""J04, passo 3 — calcular. O titular de quem sobe, no físico.

Pergunta: em que posições os titulares de quem sobe se diferenciam fisicamente, e em quê —
volume, alta intensidade, sprints ou velocidade máxima?

Escreve, e só:
    resultados/J04_testes.csv    uma linha por indicador × setor × comparação × corte × subamostra
    resultados/J04_resumo.json   poder, conferência contra J03, porta temporal e o que passou
Lê, e não altera: `resultados/J04_base.csv` e `resultados/J04_indicadores.json` (passos 1 e 2),
`resultados/J03_resumo.json` e o banco copiado do SkillCorner (só leitura, só para a porta).

## O que este passo NÃO faz

Não monta base, não casa nome, não acrescenta indicador. A lista está fechada em
`J04_indicadores.json`, declarada antes de qualquer teste: 17 indicadores em quatro famílias,
que são as quatro que a pergunta nomeia. Nada entra depois de ver resultado.

## O método é o da casa, via `scripts/_metodo.py`

Welch no PERCENTIL dentro de setor × temporada (nunca no bruto entre anos), d de Cohen,
IC95 por bootstrap de CLUBE — a linha é um jogador, mas jogadores vêm em elencos — e BH a 5%
dentro de cada **família × setor × comparação × corte de fronteira**. Nunca no bolo dos 17.

## A régua de cada indicador é dele

`_p90` é por 90 min de jogo, `_p30tip` por 30 min COM a bola, `_p30otip` por 30 min SEM a bola.
Cada indicador é percentilado na sua própria régua e comparado só com ele mesmo do outro grupo.
Comparar `_p30tip` com `_p90` inverteria conclusão, e aqui isso não acontece por construção:
o teste nunca cruza indicadores.

## Titular é o mesmo de J03, e o script prova

A regra (QUANTOS e MIN_MINUTOS de `scripts/J03.py`) é recalculada aqui a partir da base e
conferida contra `J03_resumo.json`: 907 titulares em 2022–2025 e a contagem por setor e faixa
uma a uma (`conferencia_contra_j03.bate`). Duas decisões que fazem as duas partes falarem dos
MESMOS titulares: o titular é escolhido no lado Wyscout, por linha, antes de olhar se ele tem
físico; e titular sem físico não é substituído pelo próximo da fila — fica contado à parte.
O Goleiro entra na contagem (para o total bater com J03) e sai de todo teste: o SkillCorner não
rastreia goleiro — zero GK entre os 2.982 casados.

## A porta temporal, e por que o teto é "provável"

A porta do estudo é o 1º turno prevendo o 2º, e ela exige dado por turno. O `physical_match` da
Série B só existe em 2025 e 2026 — zero linha em 2022, 2023 e 2024, e o buraco é do SkillCorner,
não desta cópia. Este script TENTA e relata: roda a repetição turno a turno em 2025, no jogador,
e diz o n. O que não roda é a porta como a especificação a define — o 1º turno prevendo o
DESFECHO — porque com uma temporada fechada só sobram 20 clube-temporadas e 4 que sobem, e
porque sete dos 17 indicadores não existem jogo a jogo. Por isso o teto desta parte é
**provável**, declarado em `J04_indicadores.json` antes de qualquer resultado: nenhuma conclusão
de J04 pode ser firme, mesmo passando no BH nos dois cortes.

Uso:
    python3 "_fonte/estudo_serieb/scripts/J04.py"
"""
import collections
import csv
import datetime as dt
import json
import math
import os
import sqlite3
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import comparar, d_minimo, pct  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
R = os.path.join(ESTUDO, "resultados")
DB = os.path.join(ESTUDO, "dados_copiados", "skillcorner_serieb.db")

RNG = np.random.default_rng(20260919)
MIN_MINUTOS = 900                                    # J03.py
QUANTOS = {"Goleiro": 1, "Zaga": 2, "Lateral": 2, "Volante": 2, "Meia": 2,
           "Extremo": 2, "Atacante": 2}              # J03.py
N_MIN_A, N_MIN_B = 8, 16                             # J04_indicadores.json, n_minimo_por_setor
ED_2025 = 1061
RODADAS_TURNO = 19                                   # Série B: 38 rodadas, turno = as 19 primeiras
MIN_JOGOS_TURNO = 5                                  # para o jogador entrar na porta


# ------------------------------------------------------------------------------ ler a base
def ler_base(inds, cols_m60):
    """A base do passo 1, com os indicadores em número. Não altera nada em disco."""
    linhas = []
    with open(os.path.join(R, "J04_base.csv"), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            l = dict(r)
            for c in ("minutos_wy", "jogos_wy", "sc_min_tot", "dist_g4"):
                l[c] = float(r[c]) if r[c] not in ("", "nan") else None
            for c in ("no_recorte", "tem_fisico", "elegivel", "titular"):
                l[c] = int(r[c]) if r[c] != "" else 0
            for c in ("trave", "fronteira", "cobertura_baixa"):
                l[c] = r[c] == "1"
            for c in inds + [x + "_m60" for x in cols_m60]:
                l[c] = float(r[c]) if r[c] not in ("", "nan") else None
            linhas.append(l)
    return linhas


# --------------------------------------------------- a regra de titular, recalculada e conferida
def conferir_j03(base, anos_recorte):
    """Recalcula a regra de titular de J03 sobre esta base e compara, uma a uma, com J03."""
    j03 = json.load(open(os.path.join(R, "J03_resumo.json"), encoding="utf-8"))
    cand = [l for l in base if l["minutos_wy"] and l["minutos_wy"] >= MIN_MINUTOS and l["faixa"]
            and l["temporada"] in anos_recorte]
    por_ct = collections.defaultdict(list)
    for l in cand:
        por_ct[(l["temporada"], l["clube"], l["setor"])].append(l)
    recalc = []
    for (_, _, setor), g in por_ct.items():
        g.sort(key=lambda l: (-l["minutos_wy"], l["jogador"]))
        recalc += g[:QUANTOS[setor]]

    chave = lambda l: (l["temporada"], l["jogador"], l["clube"], l["posicao"])  # noqa: E731
    da_base = [l for l in base if l["titular"] and l["no_recorte"]]
    cont = collections.Counter((l["setor"], l["faixa"]) for l in recalc)
    por_setor, bate = {}, True
    for s, d in j03["por_setor"].items():
        linha = {"n_sobe_j03": d["n_sobe"], "n_sobe_recalculado": cont.get((s, "Sobe"), 0),
                 "n_meio_j03": d["n_meio"], "n_meio_recalculado": cont.get((s, "Meio"), 0),
                 "n_cai_recalculado": cont.get((s, "Cai"), 0)}
        linha["bate"] = (linha["n_sobe_j03"] == linha["n_sobe_recalculado"]
                         and linha["n_meio_j03"] == linha["n_meio_recalculado"])
        bate = bate and linha["bate"]
        por_setor[s] = linha
    mesma_gente = {chave(l) for l in recalc} == {chave(l) for l in da_base}
    return {
        "regra": ("A MESMA de J03 (scripts/J03.py, constantes QUANTOS e MIN_MINUTOS): por "
                  "clube-temporada e por SETOR, os jogadores de mais minutos — 1 no gol, 2 na "
                  "zaga, 2 no lateral, 2 no volante, 2 na meia, 2 no extremo e 2 no ataque — "
                  f"com pelo menos {MIN_MINUTOS} minutos no Wyscout."),
        "escolhido_no_lado_wyscout": ("O titular é escolhido por LINHA (ano + nome + clube + "
                                      "posição) antes de olhar se ele tem dado físico. J03 não "
                                      "descarta nome ambíguo porque não busca nada em outra "
                                      "base; descartar aqui mudaria quem é titular."),
        "titular_sem_fisico_nao_e_substituido": ("Fica marcado e contado à parte. Substituir "
                                                 "pelo próximo da fila seria imputar titular."),
        "total_recalculado_2022_2025": len(recalc),
        "total_em_j03": j03["n_titulares"],
        "mesmas_pessoas_da_coluna_titular_da_base": mesma_gente,
        "bate": bool(bate and len(recalc) == j03["n_titulares"] and mesma_gente),
        "por_setor": por_setor,
        "goleiro": ("entra na contagem para o total bater com J03 e sai de todo teste: o "
                    "SkillCorner não rastreia goleiro (zero GK entre os 2.982 casados)."),
    }


# ---------------------------------------------------------------- porta temporal (tentativa)
def porta_temporal(inds):
    """Tenta a porta em 2025, no jogador: o 1º turno repete no 2º? Relata o n, não força."""
    if not os.path.exists(DB):
        return {"rodou": False, "motivo": "banco copiado não encontrado"}
    con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    cols = [c[1] for c in con.execute("PRAGMA table_info(physical_match)")]
    mensuraveis = [i for i in inds if i in cols]
    fora = [i for i in inds if i not in cols]
    linhas = [dict(r) for r in con.execute(
        "select * from physical_match where sc_competition_edition_id = ?", (ED_2025,))]
    con.close()

    jogos = collections.defaultdict(set)
    for r in linhas:
        jogos[r["team_name"]].add((r["match_date"], r["sc_match_id"]))
    turno = {}
    for t, js in jogos.items():
        for i, (_, m) in enumerate(sorted(js), 1):
            turno[(t, m)] = 1 if i <= RODADAS_TURNO else 2

    acc = collections.defaultdict(lambda: collections.defaultdict(list))
    for r in linhas:
        if (r["minutes_played"] or 0) < 60:        # a regra dos 60 minutos, onde ela é aplicável
            continue
        k = (r["sc_player_id"], turno[(r["team_name"], r["sc_match_id"])])
        for i in mensuraveis:
            if r[i] is not None:
                acc[k][i].append((r["minutes_played"], r[i]))

    def agregar(d, i):
        pares = d.get(i) or []
        peso = sum(m for m, _ in pares)
        if not peso:
            return None
        # psv99 é pico: o valor do período é o maior do jogo, não a média ponderada (J04_base.py)
        return (max(v for _, v in pares) if i == "psv99"
                else sum(m * v for m, v in pares) / peso)

    jogadores = {p for p, _ in acc}
    dupla = [p for p in jogadores
             if len(acc[(p, 1)].get(mensuraveis[0], [])) >= MIN_JOGOS_TURNO
             and len(acc[(p, 2)].get(mensuraveis[0], [])) >= MIN_JOGOS_TURNO]

    por_indicador = {}
    for i in mensuraveis:
        A = [agregar(acc[(p, 1)], i) for p in dupla]
        B = [agregar(acc[(p, 2)], i) for p in dupla]
        par = [(a, b) for a, b in zip(A, B) if a is not None and b is not None]
        if len(par) < 20:
            continue
        rho, p = stats.spearmanr([a for a, _ in par], [b for _, b in par])
        n = len(par)
        z, se = 0.5 * math.log((1 + rho) / (1 - rho)), 1 / math.sqrt(n - 3)
        por_indicador[i] = {"rho": round(float(rho), 3), "p": round(float(p), 6), "n": n,
                            "ic95": [round(math.tanh(z - 1.96 * se), 2),
                                     round(math.tanh(z + 1.96 * se), 2)],
                            "se_repete": bool(p < 0.05 and rho > 0.3)}
    return {
        "rodou": "em parte",
        "o_que_rodou": ("a repetição turno a turno em 2025, no JOGADOR: o 1º turno (19 primeiras "
                        "rodadas de cada clube) contra o 2º, só com jogos de 60+ minutos."),
        "n_jogadores": len(dupla),
        "n_minimo_de_jogos_por_turno": MIN_JOGOS_TURNO,
        "temporadas_possiveis": ["2025"],
        "indicadores_mensuraveis": mensuraveis,
        "indicadores_sem_dado_por_jogo": fora,
        "por_indicador": por_indicador,
        "o_que_NAO_roda": {
            "a_porta_da_especificacao": ("1º turno prevendo o DESFECHO. Exige o físico por turno "
                                         "em mais de uma temporada e o desfecho do ano. O "
                                         "physical_match tem zero linha em 2022, 2023 e 2024 — na "
                                         "fonte também."),
            "n_se_fosse_tentada": {"temporadas_fechadas_com_dado": 1, "clube_temporadas": 20,
                                   "clubes_que_sobem": 4},
            "indicadores_fora": (f"{len(fora)} dos {len(inds)} não existem jogo a jogo em "
                                 "temporada nenhuma: todos os _p30tip / _p30otip e o psv99_top5."),
        },
        "teto_de_confianca": "provável",
        "por_que_o_teto": ("Repetir-se de um turno para o outro mostra que a medida é estável, "
                           "não que ela vem ANTES do resultado. Sem o físico por turno em "
                           "2022–2024 não há como separar causa plausível de consequência, e o "
                           "teto foi declarado em J04_indicadores.json antes de qualquer "
                           "resultado: nenhuma conclusão de J04 é firme."),
    }


# ------------------------------------------------- sensibilidade: a regra dos 60 minutos (2025)
def sensibilidade_m60(base, cols_m60):
    """O posto muda quando só entram jogos de 60+ min? Só dá para medir em 2025."""
    linhas = [l for l in base if l["elegivel"] and l["temporada"] == "2025"
              and all(l[c + "_m60"] is not None for c in cols_m60)]
    por = collections.defaultdict(list)
    for l in linhas:
        por[l["setor"]].append(l)
    out = {}
    for c in cols_m60:
        rhos, n = [], 0
        for g in por.values():
            if len(g) < 8:
                continue
            rho, _ = stats.spearmanr([l[c] for l in g], [l[c + "_m60"] for l in g])
            rhos.append(float(rho)); n += len(g)
        if rhos:
            out[c] = {"rho_min": round(min(rhos), 3), "rho_mediano": round(float(np.median(rhos)), 3),
                      "n": n}
    return {"o_que_e": ("O CLAUDE.md manda usar só jogos de 60+ minutos nas métricas por 90. O "
                        "agregado `physical` não separa jogo a jogo, e o `physical_match` só "
                        "existe em 2025 e 2026 — a regra é impossível de aplicar em três das "
                        "quatro temporadas do recorte. Aqui se mede o que ela mudaria no POSTO, "
                        "que é o que o teste usa, na única temporada fechada em que dá."),
            "temporada": "2025", "spearman_por_setor": out,
            "leitura": ("rho alto = a regra dos 60 minutos não reordena os jogadores, e o teste "
                        "roda no posto. Onde ela pode ser aplicada, muda pouco.")}


# ------------------------------------------------------------------------------------- main
def main():
    dec = json.load(open(os.path.join(R, "J04_indicadores.json"), encoding="utf-8"))
    anos = {str(a) for a in dec["recorte"]["temporadas"]}
    familias_dec = dec["familias"]
    inds = [i["id"] for fam in familias_dec for i in fam["indicadores"]]
    sinal = {i["id"]: i["sinal"] for fam in familias_dec for i in fam["indicadores"]}
    nome = {i["id"]: i["nome"] for fam in familias_dec for i in fam["indicadores"]}
    fam_de = {i["id"]: fam["id"] for fam in familias_dec for i in fam["indicadores"]}
    cols_m60 = dec["regra_dos_60_minutos"]["colunas_m60_possiveis"]
    setores = [s for s in QUANTOS if s != "Goleiro"]

    base = ler_base(inds, cols_m60)
    print(f"base: {len(base)} linhas · {sum(1 for l in base if l['elegivel'])} elegíveis para "
          f"percentil · {sum(1 for l in base if l['titular'] and l['no_recorte'])} titulares "
          f"em {'–'.join(sorted(anos)[::len(anos)-1])}")

    conf = conferir_j03(base, anos)
    print(f"conferência contra J03: {conf['total_recalculado_2022_2025']} titulares "
          f"(J03 diz {conf['total_em_j03']}) · bate = {conf['bate']}")
    if not conf["bate"]:
        print("  ATENÇÃO: a regra de titular NÃO reproduz J03. Os números abaixo não são "
              "comparáveis com os de J03.")

    # ---- percentil: dentro de SETOR × TEMPORADA, entre todos os 900+ min com físico
    elegiveis = [l for l in base if l["elegivel"]]
    por_pool = collections.defaultdict(list)
    for l in elegiveis:
        por_pool[(l["temporada"], l["setor"])].append(l)
    for g in por_pool.values():
        for i in inds:
            r = stats.rankdata([l[i] for l in g])
            for l, rr in zip(g, r):
                l[pct(i)] = 100 * (rr - 1) / max(1, len(g) - 1)
    print(f"percentil: {len(por_pool)} pools setor × temporada, "
          f"de {min(len(g) for g in por_pool.values())} a {max(len(g) for g in por_pool.values())} "
          f"jogadores cada")

    titulares = [l for l in elegiveis if l["titular"] and l["no_recorte"]]

    # ---- o desenho: comparações, cortes de fronteira e subamostras
    familias = [(f["id"], [i["id"] for i in f["indicadores"]]) for f in familias_dec]
    GRUPO = {"SM": (("Sobe", lambda l: l["faixa"] == "Sobe"), ("Meio", lambda l: l["faixa"] == "Meio")),
             "CM": (("Cai", lambda l: l["faixa"] == "Cai"), ("Meio", lambda l: l["faixa"] == "Meio")),
             "ST": (("Sobe", lambda l: l["faixa"] == "Sobe"), ("Trave", lambda l: l["trave"]))}
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    SUB = {"todos": (lambda l: True, ["SM", "CM", "ST"]),
           "sem_cobertura_baixa": (lambda l: not l["cobertura_baixa"], ["SM"]),
           "sem_identidade_marcada": (lambda l: l["identidade"] == "", ["SM"])}

    res, n_por_setor, fora_por_n = [], {}, []
    for sub_id, (sub_f, quais) in SUB.items():
        for setor in setores:
            bs = [l for l in titulares if l["setor"] == setor and sub_f(l)]
            # o corte de fronteira roda separado, para o piso de n ser conferido DENTRO do corte
            for rot, filtro in filtros:
                bsf = [l for l in bs if filtro(l)]
                comps = []
                for cid in quais:
                    (_, ga), (_, gb) = GRUPO[cid]
                    na = sum(1 for l in bsf if ga(l))
                    nb = sum(1 for l in bsf if gb(l))
                    if na < N_MIN_A or nb < N_MIN_B:
                        fora_por_n.append({"subamostra": sub_id, "setor": setor,
                                           "comparacao": cid, "fronteira": rot,
                                           "n_a": na, "n_b": nb,
                                           "minimo": f"{N_MIN_A} de um lado, {N_MIN_B} do outro"})
                        continue
                    comps.append((cid, ga, gb))
                if not comps:
                    continue
                r = comparar(bs, familias, comps, [(rot, filtro)], RNG, lambda i: sinal[i])
                for it in r:
                    it["setor"] = setor
                    it["subamostra"] = sub_id
                res += r
            if sub_id == "todos":
                n_por_setor[setor] = {}
                for rot, filtro in filtros:
                    g = [l for l in bs if filtro(l)]
                    d = {"n_sobe": sum(1 for l in g if l["faixa"] == "Sobe"),
                         "n_meio": sum(1 for l in g if l["faixa"] == "Meio"),
                         "n_cai": sum(1 for l in g if l["faixa"] == "Cai"),
                         "n_trave": sum(1 for l in g if l["trave"]),
                         "clubes": len({l["clube"] for l in g})}
                    d["d_minimo_80_sobe_x_meio"] = (d_minimo(d["n_sobe"], d["n_meio"])
                                                    if d["n_sobe"] > 1 and d["n_meio"] > 1 else None)
                    d["d_minimo_80_cai_x_meio"] = (d_minimo(d["n_cai"], d["n_meio"])
                                                   if d["n_cai"] > 1 and d["n_meio"] > 1 else None)
                    d["d_minimo_80_sobe_x_trave"] = (d_minimo(d["n_sobe"], d["n_trave"])
                                                     if d["n_sobe"] > 1 and d["n_trave"] > 1 else None)
                    n_por_setor[setor][rot] = d

    # ---- enriquecer: nome, família, percentil mediano, clubes, e a confiança dos dois cortes
    for it in res:
        it["nome"] = nome[it["indicador"]]
        sub_f = SUB[it["subamostra"]][0]
        filtro = dict(filtros)[it["fronteira"]]
        (_, ga), (_, gb) = GRUPO[it["comparacao"]]
        bs = [l for l in titulares if l["setor"] == it["setor"] and sub_f(l) and filtro(l)]
        a = [l for l in bs if ga(l)]
        b = [l for l in bs if gb(l)]
        it["pct_a"] = round(float(np.median([l[pct(it["indicador"])] for l in a])), 1)
        it["pct_b"] = round(float(np.median([l[pct(it["indicador"])] for l in b])), 1)
        it["clubes_a"] = len({l["clube"] for l in a})
        it["clubes_b"] = len({l["clube"] for l in b})
        it["ic95_lo"], it["ic95_hi"] = it.pop("ic95_d")
        it["passou_bh"] = bool(it["q"] < 0.05)

    q_de = {(it["subamostra"], it["setor"], it["comparacao"], it["indicador"], it["fronteira"]):
            it["q"] for it in res}
    for it in res:
        k = (it["subamostra"], it["setor"], it["comparacao"], it["indicador"])
        com, sem = q_de.get(k + ("com",)), q_de.get(k + ("sem",))
        dois = com is not None and sem is not None and com < 0.05 and sem < 0.05
        um = (com is not None and com < 0.05) or (sem is not None and sem < 0.05)
        it["passou_bh_nos_dois_cortes"] = bool(dois)
        # Três níveis, e só três. Firme exige BH E porta temporal; a porta não roda nesta parte.
        # O rótulo é do ACHADO (setor × comparação × indicador × subamostra), então ele é o mesmo
        # nas duas linhas de corte — é o achado que tem confiança, não a linha.
        it["confianca_do_achado"] = ("provável" if dois else
                                     ("indício" if um else
                                      ("não separa (poder suficiente)" if it["poder_suficiente"]
                                       else "não separa (poder insuficiente)")))

    for it in res:                     # numpy não é JSON: tudo vira tipo do Python
        for k, v in list(it.items()):
            if isinstance(v, np.bool_):
                it[k] = bool(v)
            elif isinstance(v, np.integer):
                it[k] = int(v)
            elif isinstance(v, np.floating):
                it[k] = float(v)

    campos = ["subamostra", "setor", "comparacao", "fronteira", "familia", "indicador", "nome",
              "n_a", "n_b", "clubes_a", "clubes_b", "pct_a", "pct_b", "cru_a", "cru_b",
              "d", "ic95_lo", "ic95_hi", "p", "q", "d_minimo_80", "poder_suficiente",
              "selo", "passou_bh", "passou_bh_nos_dois_cortes", "confianca_do_achado"]
    with open(os.path.join(R, "J04_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos, extrasaction="ignore")
        w.writeheader(); w.writerows(res)
    print(f"testes: {len(res)} linhas em J04_testes.csv "
          f"({sum(1 for r in res if r['passou_bh'])} passaram no BH)")

    porta = porta_temporal(inds)
    m60 = sensibilidade_m60(base, cols_m60)

    sm = [it for it in res if it["comparacao"] == "SM" and it["subamostra"] == "todos"]
    passaram = sorted([it for it in sm if it["passou_bh"]],
                      key=lambda x: (x["setor"], x["familia"], -abs(x["d"])))
    dois_cortes = sorted({(it["setor"], it["indicador"]) for it in sm
                          if it["passou_bh_nos_dois_cortes"]})

    # ---- cada achado de Sobe × Meio, com os dois cortes e as duas subamostras lado a lado
    achados = []
    for setor, ind in sorted({(it["setor"], it["indicador"]) for it in sm if it["passou_bh"]}):
        linha = {"setor": setor, "indicador": ind, "nome": nome[ind], "familia": fam_de[ind],
                 "confianca": None, "onde_aparece": [], "onde_nao_aparece": []}
        for sub_id in SUB:
            for rot, _ in filtros:
                it = next((x for x in res if x["subamostra"] == sub_id and x["setor"] == setor
                           and x["comparacao"] == "SM" and x["indicador"] == ind
                           and x["fronteira"] == rot), None)
                k = f"{sub_id}|{rot}_fronteira"
                if it is None:
                    linha[k] = "não rodou: n abaixo do piso"
                    continue
                linha[k] = {"n": f"{it['n_a']}x{it['n_b']}", "cru_sobe": it["cru_a"],
                            "cru_meio": it["cru_b"], "pct_sobe": it["pct_a"],
                            "pct_meio": it["pct_b"], "d": it["d"],
                            "ic95": [it["ic95_lo"], it["ic95_hi"]], "q": it["q"],
                            "d_minimo_80": it["d_minimo_80"],
                            "poder_suficiente": it["poder_suficiente"],
                            "passou_bh": it["passou_bh"]}
                (linha["onde_aparece"] if it["passou_bh"] else linha["onde_nao_aparece"]).append(k)
                if sub_id == "todos":
                    linha["confianca"] = it["confianca_do_achado"]
        achados.append(linha)

    sem_poder = [it for it in sm if not it["passou_bh"] and not it["poder_suficiente"]]
    nao_existe = {
        "regra": ("A especificação proíbe transformar 'não separa' em 'não existe'. O que o "
                  "desenho enxerga é o d mínimo detectável a 80% de poder, por posição e por "
                  "corte — abaixo dele o efeito é invisível, não é ausente."),
        "d_minimo_sobe_x_meio_por_posicao": {
            s: {"com_fronteira": n_por_setor[s]["com"]["d_minimo_80_sobe_x_meio"],
                "sem_fronteira": n_por_setor[s]["sem"]["d_minimo_80_sobe_x_meio"]}
            for s in setores},
        "testes_sobe_x_meio": len(sm),
        "testes_que_nao_passaram": sum(1 for it in sm if not it["passou_bh"]),
        "destes_com_efeito_menor_que_o_d_minimo": len(sem_poder),
        "leitura": ("Nenhum dos testes que não passaram mediu um efeito do tamanho que este "
                    "desenho conseguiria detectar. 'Não separa' aqui quer dizer 'não separa por "
                    "mais do que o desenho enxerga', e não 'é igual'."),
    }

    resumo = {
        "parte": "J04",
        "passo": 3,
        "gerado_em": dt.datetime.now().isoformat(timespec="seconds"),
        "pergunta": dec["pergunta"],
        "o_que_e": ("O cálculo de J04: Sobe × Meio posição a posição, nos dois cortes de "
                    "fronteira, no posto dentro de setor × temporada, com BH por família e "
                    "poder por desenho. Nenhuma conclusão é escrita aqui."),
        "entradas": {
            "base": "resultados/J04_base.csv (passo 1, auditada em identidade no passo 2)",
            "lista_pre_declarada": "resultados/J04_indicadores.json",
            "regra_de_titular": "scripts/J03.py, conferida contra resultados/J03_resumo.json",
            "metodo": "scripts/_metodo.py",
            "porta": "dados_copiados/skillcorner_serieb.db, physical_match (só leitura)",
        },
        "comparacao_padrao": {"id": "SM", "nome": "titular de quem sobe × titular do meio",
                              "nota": ("A aba Física do app usa Sobe × Cai; aqui não. CM e ST "
                                       "são secundárias, declaradas na lista, e estão no CSV.")},
        "conferencia_contra_j03": conf,
        "desenho": {
            "unidade": "jogador-temporada",
            "recorte": sorted(anos),
            "percentil": ("dentro de SETOR × TEMPORADA, entre todos os 900+ minutos com físico "
                          "(não só titulares), cada indicador na sua própria régua"),
            "familia_e_a_unidade_do_bh": "BH a 5% por família × setor × comparação × corte",
            "n_minimo_por_setor": f"{N_MIN_A} de um lado e {N_MIN_B} do outro",
            "setores_testados": setores,
            "goleiro": conf["goleiro"],
            "n_indicadores": len(inds),
            "familias": {f["id"]: [i["id"] for i in f["indicadores"]] for f in familias_dec},
            "n_testes": len(res),
            "coluna_confianca_do_achado": ("é do ACHADO (setor × comparação × indicador × "
                                           "subamostra), não da linha: as duas linhas de corte "
                                           "trazem o mesmo rótulo. provável = BH nos dois "
                                           "cortes; indício = BH em um só; abaixo disso, não "
                                           "separa. Firme é impossível nesta parte."),
            "sinal": dec["sinal"],
        },
        "n_e_poder": n_por_setor,
        "comparacoes_fora_por_n": fora_por_n,
        "passaram_no_bh": passaram,
        "passaram_nos_dois_cortes": [{"setor": s, "indicador": i} for s, i in dois_cortes],
        "achados_sobe_x_meio": achados,
        "nao_separa_nao_e_nao_existe": nao_existe,
        "quantos_passaram": {
            "sobe_x_meio_com_fronteira": sum(1 for it in sm if it["fronteira"] == "com"
                                             and it["passou_bh"]),
            "sobe_x_meio_sem_fronteira": sum(1 for it in sm if it["fronteira"] == "sem"
                                             and it["passou_bh"]),
            "sobe_x_meio_nos_dois": len(dois_cortes),
            "cai_x_meio": sum(1 for it in res if it["comparacao"] == "CM"
                              and it["subamostra"] == "todos" and it["passou_bh"]),
            "sobe_x_trave": sum(1 for it in res if it["comparacao"] == "ST"
                                and it["subamostra"] == "todos" and it["passou_bh"]),
        },
        "robustez": {
            "fronteira": ("Toda comparação roda nos dois cortes. A regra escrita: conclusão que "
                          "só aparece COM os times de fronteira é ruído. O corte sem fronteira é "
                          "teste de robustez, não recorte melhor — ele é enviesado por "
                          "construção (_metodo_fronteira.md)."),
            "subamostras": {
                s: {"o_que_tira": t,
                    "passaram_sobe_x_meio": sum(1 for it in res if it["subamostra"] == s
                                                and it["comparacao"] == "SM" and it["passou_bh"])}
                for s, t in [("todos", "nada"),
                             ("sem_cobertura_baixa",
                              "clube-temporada com menos de 80% dos seus 900+ min cobertos"),
                             ("sem_identidade_marcada",
                              "linha com nome que colide, clube misturado ou clube divergente")]},
        },
        "porta_temporal": porta,
        "sensibilidade_60_minutos": m60,
        "teto_de_confianca": {
            "teto": "provável",
            "declarado_antes_de_calcular": True,
            "onde": "J04_indicadores.json, chave porta_temporal",
            "frase": ("Nenhuma conclusão de J04 é firme: não há físico por jogo em 2022–2024, "
                      "então não dá para conferir se o físico vem antes do resultado ou é "
                      "consequência dele."),
        },
        "ressalvas": dec["ressalvas_declaradas"],
    }
    json.dump(resumo, open(os.path.join(R, "J04_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # ------------------------------------------------------------------------------ na tela
    print(f"\n{'='*104}\nO TITULAR DE QUEM SOBE × O TITULAR DO MEIO — n e poder por posição"
          f"\n{'='*104}")
    print("{:10s} {:>16s} {:>9s}  {:>16s} {:>9s}".format(
        "posição", "com fronteira", "d mínimo", "sem fronteira", "d mínimo"))
    for s in setores:
        c, v = n_por_setor[s]["com"], n_por_setor[s]["sem"]
        par_c = "{} x {}".format(c["n_sobe"], c["n_meio"])
        par_v = "{} x {}".format(v["n_sobe"], v["n_meio"])
        print("{:10s} {:>16s} {:9.2f}  {:>16s} {:9.2f}".format(
            s, par_c, c["d_minimo_80_sobe_x_meio"], par_v, v["d_minimo_80_sobe_x_meio"]))

    for rot in ("com", "sem"):
        print(f"\n{'='*104}\nSOBE × MEIO, {rot.upper()} os times de fronteira — "
              f"tudo, inclusive o que não passou\n{'='*104}")
        print("{:10s} {:17s} {:22s} {:>8s} {:>9s} {:>9s} {:>6s} {:>14s} {:>7s} {:>5s}".format(
            "posição", "família", "indicador", "n", "Sobe", "Meio", "d", "IC95", "q", "dmin"))
        for it in sorted(sm, key=lambda x: (x["setor"], x["familia"], -abs(x["d"]))):
            if it["fronteira"] != rot:
                continue
            ic = ("[{:+.2f},{:+.2f}]".format(it["ic95_lo"], it["ic95_hi"])
                  if it["ic95_lo"] is not None else "—")
            marca = " <<<" if it["passou_bh"] else ""
            print("{:10s} {:17s} {:22s} {:>8s} {:9.2f} {:9.2f} {:+6.2f} {:>14s} "
                  "{:7.4f} {:5.2f}{}".format(
                      it["setor"], it["familia"], it["indicador"][:22],
                      "{}x{}".format(it["n_a"], it["n_b"]), it["cru_a"], it["cru_b"],
                      it["d"], ic, it["q"], it["d_minimo_80"], marca))

    print(f"\n{'='*104}\nO QUE PASSOU NO BH — e em que corte\n{'='*104}")
    if not passaram:
        print("  nenhum indicador passou em nenhuma posição, em nenhum dos dois cortes.")
    for it in passaram:
        print(f"  {it['setor']:10s} {it['indicador'][:26]:26s} {it['fronteira']:3s} fronteira · "
              f"{it['cru_a']:8.2f} vs {it['cru_b']:8.2f} · d {it['d']:+5.2f} · q {it['q']:.4f} · "
              f"{it['confianca_do_achado']}")
    print(f"  nos DOIS cortes: {[f'{s}/{i}' for s, i in dois_cortes] or 'nenhum'}")

    print(f"\n{'='*104}\nCADA ACHADO DE SOBE × MEIO, NOS DOIS CORTES E NAS DUAS SUBAMOSTRAS"
          f"\n{'='*104}")
    for a in achados:
        print(f"  {a['setor']} · {a['indicador']} ({a['familia']}) — {a['confianca']}")
        for sub_id in SUB:
            for rot, _ in filtros:
                k = f"{sub_id}|{rot}_fronteira"
                v = a[k]
                if isinstance(v, str):
                    print(f"      {k:40s} {v}")
                else:
                    print(f"      {k:40s} n {v['n']:>7s}  d {v['d']:+5.2f}  q {v['q']:.4f}"
                          f"  {'PASSA' if v['passou_bh'] else '—'}")
    print(f"\n  d mínimo detectável a 80% (Sobe × Meio), por posição:")
    for s in setores:
        d = nao_existe["d_minimo_sobe_x_meio_por_posicao"][s]
        print(f"      {s:10s} com fronteira {d['com_fronteira']:.2f} · "
              f"sem fronteira {d['sem_fronteira']:.2f}")
    print(f"  {nao_existe['destes_com_efeito_menor_que_o_d_minimo']} dos "
          f"{nao_existe['testes_que_nao_passaram']} testes que não passaram mediram um efeito "
          f"menor do que esse mínimo.")

    print(f"\n{'='*104}\nPORTA TEMPORAL — tentada, e o que ela é\n{'='*104}")
    print(f"  o que rodou: {porta['o_que_rodou']}")
    print(f"  n = {porta['n_jogadores']} jogadores, {len(porta['indicadores_mensuraveis'])} "
          f"dos {len(inds)} indicadores, 1 temporada (2025)")
    for i, v in porta["por_indicador"].items():
        print(f"    {i:24s} rho {v['rho']:+.3f} IC95 [{v['ic95'][0]:+.2f},{v['ic95'][1]:+.2f}] "
              f"n {v['n']}  {'SE REPETE' if v['se_repete'] else 'não se repete'}")
    print(f"  NÃO roda: {porta['o_que_NAO_roda']['a_porta_da_especificacao']}")
    print(f"  teto de confiança desta parte: {porta['teto_de_confianca']}")


if __name__ == "__main__":
    main()
