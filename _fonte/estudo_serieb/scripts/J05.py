#!/usr/bin/env python3
"""J05 — o perfil ideal por posição.

Lista pré-declarada em `resultados/J05_indicadores.json`, fechada antes de rodar. Método da casa,
via `scripts/_metodo.py`: Welch no percentil, d de Cohen, IC95 por bootstrap de CLUBE, poder por
desenho e BH a 5% por **bloco × comparação × corte** (§6.3: uma família = um pilar × uma
comparação — sem partir por setor, que é a correção que a conferência de 19/09 pediu a J03 e J04).

## O chão em que esta parte pisa, e o que isso obriga

J03 não achou UM indicador técnico que separe o titular de quem sobe do titular do meio nos dois
cortes de fronteira. J04 não achou um físico: zero de 204 testes. A14 fechou uma régua de sete
indicadores e os sete são de CLUBE. T04 não escolheu treinador.

Então não existe nada que tenha "passado" para montar um perfil preditivo, e este script não tenta
montar um. Ele faz três coisas:

1. **Mede onde o perfil que já existe vive.** O perfil físico por setor do app
   (`prototipo.json` → `etapa_13.criterio_por_setor`, que nasce de `sobecai_corrigido_por_clube`)
   é uma comparação **sobe × cai**, e o critério de entrada dele é `p_clube < 0,05` — o p cru, não
   o q. Este script roda os MESMOS indicadores nas duas comparações (Sobe × Meio e Sobe × Cai) e
   nos dois cortes de fronteira, na base de jogador-temporada de J04, para mostrar em qual das
   duas o perfil existe.
2. **Descreve.** Para cada indicador e setor, o piso é a mediana do percentil do titular de quem
   subiu, arredondada para baixo em passos de 5 — e publicada em unidade de jogo. Quando essa
   mediana fica abaixo de 50, o indicador entra sem piso: quem subiu não estava acima da mediana
   da liga ali, e exigir seria inventar exigência.
3. **Exige o que dá para exigir.** Minutagem alta e regular pelo corte da POSIÇÃO (J01), que é
   requisito e não nota.

## As três notas nunca viram uma

§8.2: física, duelo/corpo e estilo técnico saem separadas. `J05_perfil.csv` tem uma linha por
indicador; não existe coluna de nota somada, e isso é de propósito.

## De onde vem o dado

- `resultados/J04_base.csv` — o físico por jogador-temporada, com a ponte de identidade já
  auditada por J04. Cinco colunas que J04 deixou fora entram aqui por emenda datada, porque o
  perfil do app as nomeia: `expl_accel_sprint_p90` e os quatro tempos do `raw_json`. Elas vêm do
  `dados_copiados/skillcorner_serieb.db`, casadas por `sc_player_id` × edição.
- `dados/serieb_tecnico.csv` — o técnico, remontado pela regra de J03 (coluna de clube
  `Equipa dentro de um período de tempo seleccionado`, nunca `Equipa`).
- `dados/minutagem_serieb.json` — a fatia de minutos, pela regra de J01.
- `dados/prototipo.json`, `dados/raio_ref.json`, `resultados/A14_resumo.json`,
  `resultados/A01_clube_temporada.csv`, `resultados/T01_ponte_clubes.json`.

## A saída dos números

`resultados/J05_numeros.json` guarda TODO marcador que `J05.json` publica, com o nome do marcador
como chave (regras 1 e 9 do portão). Nada no texto da parte é digitado à mão.

Uso:
    python3 _fonte/estudo_serieb/scripts/J05.py
"""
import collections
import csv
import json
import math
import os
import sqlite3
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
BANCO = os.path.join(ESTUDO, "dados_copiados", "skillcorner_serieb.db")

GERADO_EM = "2026-09-20"
GERADO_POR = "scripts/J05.py"
ANOS = ("2022", "2023", "2024", "2025")
EDICAO = {"2022": 335, "2023": 446, "2024": 773, "2025": 1061}
COL_CLUBE = "Equipa dentro de um período de tempo seleccionado"
MIN_MINUTOS = 900          # o corte do CLAUDE.md para entrar em percentil
MIN_RASTREADOS = 300       # min_tot = minutes_played × matches, como gerar_raio_serieb.py
QUANTOS = {"Goleiro": 1, "Zaga": 2, "Lateral": 2, "Volante": 2, "Meia": 2,
           "Extremo": 2, "Atacante": 2}
N_MIN_A, N_MIN_B = 8, 16   # piso de n por setor, declarado
SEMENTE = 7
REPS_IC = 2000

# O `raw_json` do SkillCorner: os quatro tempos que `etapa_13.criterio_por_setor` nomeia e que a
# tabela `physical` não tem em coluna própria.
DO_RAW = {"t_spr": "timetosprint_top3", "t505_90": "timeto505around90_top3",
          "t505_180": "timeto505around180_top3", "t_hsr_cod": "timetohsrpostcod_top3"}


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


def piso5(x):
    """O múltiplo de 5 imediatamente abaixo (ou igual)."""
    return int(math.floor(x / 5.0) * 5)


# ------------------------------------------------------------------------------------------------
# as bases
# ------------------------------------------------------------------------------------------------
def extras_do_banco():
    """(sc_player_id, ano) -> as cinco colunas que J04 deixou fora e o perfil do app pede."""
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


def base_fisica(inds_fis):
    """O titular físico, de J04_base.csv, mais as cinco colunas novas do banco."""
    extras = extras_do_banco()
    base, sem_extra = [], 0
    with open(os.path.join(R, "J04_base.csv"), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r["temporada"] not in ANOS or r["setor"] == "Goleiro":
                continue
            if r["tem_fisico"] != "1" or not r["sc_player_id"]:
                continue
            if (num(r["minutos_wy"]) or 0) < MIN_MINUTOS:
                continue
            if (num(r["sc_min_tot"]) or 0) < MIN_RASTREADOS:
                continue
            l = {"ano": r["temporada"], "clube": r["clube"], "jogador": r["jogador"],
                 "setor": r["setor"], "faixa": r["faixa"],
                 "fronteira": r["fronteira"] == "1", "titular": r["titular"] == "1",
                 "cobertura_baixa": r["cobertura_baixa"] == "1"}
            l["ano_setor"] = f"{l['ano']}|{l['setor']}"
            e = extras.get((r["sc_player_id"], r["temporada"]))
            if e is None:
                sem_extra += 1
                e = {}
            for i in inds_fis:
                col = i["coluna"]
                l[i["id"]] = e.get(i["id"]) if i["do_raw"] else num(r.get(col))
            base.append(l)
    return base, sem_extra


def base_tecnica(dec, inds_tec):
    """O titular técnico, remontado pela regra de J03 a partir de serieb_tecnico.csv."""
    setor_de = {p: s for s, ps in dec["setores"].items() for p in ps}
    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    ponte = json.load(open(os.path.join(R, "T01_ponte_clubes.json"), encoding="utf-8"))

    linhas = []
    with open(os.path.join(DADOS, "serieb_tecnico.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r["ano"] not in ANOS:
                continue
            mi = num(r["Minutos jogados:"])
            s = setor_de.get(r["posicao_1"])
            if mi is None or mi < MIN_MINUTOS or not s:
                continue
            clube = ponte.get(r[COL_CLUBE], r[COL_CLUBE])
            ct = a01.get((r["ano"], clube))
            l = {"ano": r["ano"], "clube": clube, "jogador": r["Jogador"], "setor": s,
                 "minutos": mi, "faixa": ct["faixa"] if ct else None,
                 "fronteira": bool(ct) and ct["fronteira"] == "1", "titular": False}
            l["ano_setor"] = f"{l['ano']}|{s}"
            for i in inds_tec:
                l[i["id"]] = num(r.get(i["id"]))
            linhas.append(l)

    # titular: os N de mais minutos por clube-temporada e setor, entre quem tem faixa
    por_ct = collections.defaultdict(list)
    for l in linhas:
        if l["faixa"]:
            por_ct[(l["ano"], l["clube"], l["setor"])].append(l)
    for (_, _, setor), g in por_ct.items():
        g.sort(key=lambda l: -l["minutos"])
        for l in g[:QUANTOS[setor]]:
            l["titular"] = True
    return linhas


def percentilar(base, inds):
    """Acrescenta <id>::pct dentro de (temporada × setor), só entre quem TEM o indicador.

    O pool é por indicador, e não o mesmo para todos: derrubar o jogador da régua do `psv99`
    porque falta o tempo de giro dele seria estreitar a régua sem motivo. O que se paga é um n
    diferente por linha da tabela, e ele vai publicado.
    """
    cobertura = {}
    for i in inds:
        com = [l for l in base if l[i["id"]] is not None]
        grupos = collections.Counter(l["ano_setor"] for l in com)
        com = [l for l in com if grupos[l["ano_setor"]] >= 2]
        if com:
            percentil_no_ano(com, [i["id"]], chave_ano="ano_setor")
        cobertura[i["id"]] = round(100 * len(com) / max(1, len(base)), 1)
    return cobertura


# ------------------------------------------------------------------------------------------------
# o teste
# ------------------------------------------------------------------------------------------------
def testar(base, bloco, itens_por_setor, comparacoes, rng, unidade):
    """Uma linha por indicador × setor × comparação × corte. BH por bloco × comparação × corte.

    Um teste só entra na tabela quando os DOIS cortes o sustentam. Se o corte sem fronteira ficar
    sem n num setor, o teste sai dos dois lados — assim a tabela compara a mesma coisa nos dois
    cortes, e o que saiu é contado e publicado, não escondido.
    """
    def grupo(setor, faixa, campo, sem_fronteira):
        return lambda l: (l["titular"] and l["setor"] == setor and l["faixa"] == faixa
                          and l.get(campo) is not None
                          and not (sem_fronteira and l["fronteira"]))

    saida, fora = [], []
    for comp in comparacoes:
        cid, fa, fb = comp["id"], comp["faixa_a"], comp["faixa_b"]
        por_corte = {}
        for corte, sem_f in (("com", False), ("sem", True)):
            ps, itens = [], []
            for setor, ids in itens_por_setor:
                for i in ids:
                    campo = pct(i["id"])
                    ga, gb = grupo(setor, fa, campo, sem_f), grupo(setor, fb, campo, sem_f)
                    a = [l[campo] for l in base if ga(l)]
                    b = [l[campo] for l in base if gb(l)]
                    if len(a) < N_MIN_A or len(b) < N_MIN_B:
                        fora.append({"comparacao": cid, "corte": corte, "setor": setor,
                                     "indicador": i["id"], "n_a": len(a), "n_b": len(b)})
                        continue
                    _, p = stats.ttest_ind(a, b, equal_var=False)
                    d = cohen_d(a, b) * i["sinal"]
                    lo, hi = ic_por_clube(base, campo, ga, gb, i["sinal"], rng, reps=REPS_IC)
                    ca = [l[i["id"]] for l in base if ga(l)]
                    cb = [l[i["id"]] for l in base if gb(l)]
                    itens.append({
                        "unidade": unidade, "fronteira": corte, "comparacao": cid,
                        "familia": bloco, "setor": setor, "indicador": i["id"],
                        "nome": i["nome"],
                        "n_a": len(a), "n_b": len(b),
                        "clubes_a": len({l["clube"] for l in base if ga(l)}),
                        "clubes_b": len({l["clube"] for l in base if gb(l)}),
                        "pct_a": round(float(np.median(a)), 1),
                        "pct_b": round(float(np.median(b)), 1),
                        "cru_a": round(float(np.median(ca)), 3),
                        "cru_b": round(float(np.median(cb)), 3),
                        "d": round(d, 3), "ic95_lo": lo, "ic95_hi": hi,
                        "p": round(float(p), 5),
                        "d_minimo_80": d_minimo(len(a), len(b)),
                    })
                    ps.append(float(p))
            for it, q in zip(itens, bh(ps)):
                it["q"] = round(q, 5)
                it["passou_bh"] = q < 0.05
                it["poder_suficiente"] = abs(it["d"]) >= it["d_minimo_80"]
                it["selo"] = ("firme" if q < 0.05 else
                              ("pode ser sorte" if it["p"] < 0.05 else
                               ("sem diferença clara" if it["poder_suficiente"]
                                else "não separa (poder insuficiente)")))
            por_corte[corte] = {(x["setor"], x["indicador"]): x for x in itens}

        nos_dois = set(por_corte["com"]) & set(por_corte["sem"])
        for corte in ("com", "sem"):
            for k, it in por_corte[corte].items():
                if k in nos_dois:
                    saida.append(it)
    return saida, fora


def dois_cortes(linhas):
    """Os (comparação, setor, indicador) que passam no BH nos DOIS cortes."""
    por = collections.defaultdict(dict)
    for l in linhas:
        por[(l["comparacao"], l["setor"], l["indicador"])][l["fronteira"]] = l
    return [k for k, v in por.items()
            if v.get("com", {}).get("passou_bh") and v.get("sem", {}).get("passou_bh")]


def discordancias(linhas):
    """Onde os dois cortes não dizem a mesma coisa: troca de selo ou troca de sinal."""
    por = collections.defaultdict(dict)
    for l in linhas:
        por[(l["comparacao"], l["setor"], l["indicador"])][l["fronteira"]] = l
    saida = []
    for (cid, setor, ind), v in sorted(por.items()):
        a, b = v.get("com"), v.get("sem")
        if not a or not b:
            continue
        troca_selo = a["passou_bh"] != b["passou_bh"]
        troca_sinal = a["d"] * b["d"] < 0
        if troca_selo or troca_sinal:
            saida.append({"comparacao": cid, "setor": setor, "indicador": ind,
                          "nome": a["nome"],
                          "motivo": "passa num corte e não no outro" if troca_selo
                                    else "troca de lado entre os cortes",
                          "d_com": a["d"], "d_sem": b["d"],
                          "q_com": a["q"], "q_sem": b["q"]})
    return saida


# ------------------------------------------------------------------------------------------------
# o piso e a ficha
# ------------------------------------------------------------------------------------------------
def piso_do_indicador(base, setor, i):
    """A mediana do percentil do titular de quem subiu, arredondada para baixo em passos de 5.

    Com o sentido de BOM: nos indicadores em que menor é melhor o percentil é invertido, para que
    o piso se leia sempre como "deste nível para cima".
    """
    campo = pct(i["id"])
    sobe = [l for l in base if l["titular"] and l["setor"] == setor
            and l["faixa"] == "Sobe" and l.get(campo) is not None]
    if len(sobe) < N_MIN_A:
        return None
    bons = [l[campo] if i["sinal"] > 0 else 100 - l[campo] for l in sobe]
    mediana = float(np.median(bons))
    p = piso5(mediana)
    pool = collections.defaultdict(list)
    for l in base:
        if l["setor"] == setor and l[i["id"]] is not None:
            pool[l["ano"]].append(l[i["id"]])
    corte_ano = [float(np.percentile(v, p if i["sinal"] > 0 else 100 - p))
                 for v in pool.values() if len(v) >= 2]
    return {"setor": setor, "bloco": i["bloco"], "indicador": i["id"], "nome": i["nome"],
            "n_sobe": len(sobe), "mediana_pct_sobe": round(mediana, 1),
            "piso_pct": p if mediana >= 50 else "",
            "sem_piso_porque": "" if mediana >= 50 else
                               "quem subiu não estava acima da mediana da liga neste número",
            "sentido": "maior é melhor" if i["sinal"] > 0 else "menor é melhor",
            "piso_em_unidade_de_jogo": round(float(np.median(corte_ano)), 2) if corte_ano and mediana >= 50 else "",
            "cobertura_pct": i.get("cobertura", "")}


# ------------------------------------------------------------------------------------------------
# a minutagem (requisito, não nota) — a regra de J01
# ------------------------------------------------------------------------------------------------
def minutagem():
    mn = json.load(open(os.path.join(DADOS, "minutagem_serieb.json"), encoding="utf-8"))
    C = {c: i for i, c in enumerate(mn["colunas"])}
    L = []
    for l in mn["linhas"]:
        ano = str(l[C["ano"]])
        if ano not in ANOS:
            continue
        L.append({"ano": ano, "jogador": l[C["jogador"]], "grupo": l[C["grupo"]],
                  "fatia": l[C["fatia_pct"]]})
    grupos = sorted({x["grupo"] for x in L if x["grupo"]})
    p75 = {g: float(np.percentile([x["fatia"] for x in L
                                   if x["grupo"] == g and x["fatia"] is not None], 75))
           for g in grupos}
    alta = collections.defaultdict(dict)
    for x in L:
        if x["fatia"] is not None and x["grupo"]:
            alta[x["jogador"]][x["ano"]] = x["fatia"] >= p75[x["grupo"]]
    regular = 0
    for x in L:
        janela = [alta[x["jogador"]].get(str(int(x["ano"]) - k)) for k in (0, 1, 2)]
        x["regular"] = sum(1 for v in janela if v) >= 2
        regular += x["regular"]
    por_grupo = collections.Counter(x["grupo"] for x in L if x["regular"])
    frase = " · ".join(f"{g} {br(p75[g])}%" for g in sorted(grupos, key=lambda g: -p75[g]))
    return {"n": len(L), "p75": {g: round(p75[g], 1) for g in grupos},
            "frase": frase, "regulares": regular,
            "regulares_por_grupo": dict(por_grupo)}


# ------------------------------------------------------------------------------------------------
def main():
    dec = json.load(open(os.path.join(R, "J05_indicadores.json"), encoding="utf-8"))
    proto = json.load(open(os.path.join(DADOS, "prototipo.json"), encoding="utf-8"))
    raio = json.load(open(os.path.join(DADOS, "raio_ref.json"), encoding="utf-8"))
    a14 = json.load(open(os.path.join(R, "A14_resumo.json"), encoding="utf-8"))
    rng = np.random.default_rng(SEMENTE)

    bloco_fis = next(b for b in dec["blocos"] if b["id"] == "fisico")
    de_para = bloco_fis["de_para_coluna"]
    rotulo = bloco_fis["nomes_em_unidade_de_jogo"]
    menor = set(bloco_fis["sinal"]["menor_e_melhor"])
    ponte_setor = {k: v for k, v in dec["ponte_setor_do_raio"].items() if isinstance(v, list)}

    # ---- os indicadores físicos, na ordem que o app publica -------------------------------------
    def ind_fis(chave):
        col = de_para[chave]
        # `expl` e os quatro tempos NÃO estão em J04_base.csv (J04 os deixou fora da lista dela):
        # vêm do banco, pelo `extras_do_banco`. Ler `expl` do CSV devolveria coluna inexistente —
        # ou seja, None em todas as linhas, e o indicador sumiria da tabela em silêncio.
        return {"id": chave, "coluna": col.replace("raw_json.", ""),
                "do_raw": col.startswith("raw_json.") or chave == "expl",
                "nome": rotulo[chave if chave in rotulo else col],
                "sinal": -1 if chave in menor else 1, "bloco": "fisico"}

    por_setor_fis = []
    for raio_setor, chaves in bloco_fis["por_setor_do_raio"].items():
        for setor in ponte_setor[raio_setor]:
            por_setor_fis.append((setor, [ind_fis(c) for c in chaves]))
    inds_fis = {i["id"]: i for _, ids in por_setor_fis for i in ids}.values()
    inds_fis = list(inds_fis)

    # ---- os indicadores técnicos ---------------------------------------------------------------
    inds_tec, por_setor_tec = [], []
    for b in dec["blocos"]:
        if b["id"] == "fisico":
            continue
        for i in b["indicadores"]:
            inds_tec.append({"id": i["id"], "nome": i["id"], "sinal": i["sinal"],
                             "bloco": b["id"]})
    setores_tec = list(dec["setores"])
    for b in ("duelo_corpo", "estilo_tecnico"):
        por_setor_tec.append((b, [(s, [i for i in inds_tec if i["bloco"] == b])
                                  for s in setores_tec]))

    comparacoes = [{"id": "SM", "faixa_a": "Sobe", "faixa_b": "Meio"},
                   {"id": "SC", "faixa_a": "Sobe", "faixa_b": "Cai"}]

    # ---- bases ---------------------------------------------------------------------------------
    print("montando a base física…")
    bf, sem_extra = base_fisica(inds_fis)
    cob_fis = percentilar(bf, inds_fis)
    for i in inds_fis:
        i["cobertura"] = cob_fis[i["id"]]
    tit_fis = [l for l in bf if l["titular"]]
    print(f"  {len(bf)} jogador-temporada com físico e 900+ min · {len(tit_fis)} titulares")
    print(f"  sem linha no banco para as cinco colunas novas: {sem_extra}")

    print("montando a base técnica…")
    bt = base_tecnica(dec, inds_tec)
    cob_tec = percentilar(bt, inds_tec)
    for i in inds_tec:
        i["cobertura"] = cob_tec[i["id"]]
    tit_tec = [l for l in bt if l["titular"]]
    print(f"  {len(bt)} jogador-temporada com 900+ min · {len(tit_tec)} titulares")

    # ---- testes --------------------------------------------------------------------------------
    print("rodando os testes (Welch no percentil, IC por clube, BH por bloco × comparação × corte)…")
    linhas, fora = testar(bf, "fisico", por_setor_fis, comparacoes, rng, "jogador-temporada")
    for b, itens in por_setor_tec:
        ls, fo = testar(bt, b, itens, comparacoes, rng, "jogador-temporada")
        linhas += ls
        fora += fo

    campos = ["unidade", "fronteira", "comparacao", "familia", "setor", "indicador", "nome",
              "n_a", "n_b", "clubes_a", "clubes_b", "pct_a", "pct_b", "cru_a", "cru_b",
              "d", "ic95_lo", "ic95_hi", "p", "q", "d_minimo_80", "poder_suficiente",
              "passou_bh", "selo"]
    with open(os.path.join(R, "J05_testes.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos)
        w.writeheader()
        w.writerows([{k: l[k] for k in campos} for l in linhas])

    def conta(comp, bloco=None, corte="com"):
        return [l for l in linhas if l["comparacao"] == comp and l["fronteira"] == corte
                and (bloco is None or l["familia"] == bloco)]

    dois = dois_cortes(linhas)
    disc = discordancias(linhas)

    # ---- a ficha por posição --------------------------------------------------------------------
    perfil = []
    curto_fis = {s: [i["id"] for i in ids[:2]] for s, ids in por_setor_fis}
    curto_tec = {b: [i["id"] for i in inds_tec if i["bloco"] == b][:2]
                 for b in ("duelo_corpo", "estilo_tecnico")}
    for setor, ids in por_setor_fis:
        for i in ids:
            p = piso_do_indicador(bf, setor, i)
            if p:
                p["no_perfil_curto"] = int(i["id"] in curto_fis[setor])
                perfil.append(p)
    for setor in setores_tec:
        for i in inds_tec:
            p = piso_do_indicador(bt, setor, i)
            if p:
                p["no_perfil_curto"] = int(i["id"] in curto_tec[i["bloco"]])
                perfil.append(p)
    campos_p = ["setor", "bloco", "indicador", "nome", "sentido", "n_sobe", "mediana_pct_sobe",
                "piso_pct", "piso_em_unidade_de_jogo", "sem_piso_porque", "cobertura_pct",
                "no_perfil_curto"]
    with open(os.path.join(R, "J05_perfil.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos_p)
        w.writeheader()
        w.writerows([{k: p.get(k, "") for k in campos_p} for p in perfil])

    curto = [p for p in perfil if p["no_perfil_curto"]]
    por_pos = collections.Counter(p["setor"] for p in curto)
    sem_piso = [p for p in curto if p["piso_pct"] == ""]

    # ---- o perfil do app: quantos indicadores, e por qual critério -------------------------------
    crit = proto["etapa_13"]["criterio_por_setor"]
    scc = proto["sobecai_corrigido_por_clube"]
    app_p5 = {s: len(crit[s]["indicadores"]) for s in crit}
    # Quantos dos indicadores que o app JÁ ESCOLHEU para o perfil passam no BH por clube. Conta
    # só os escolhidos, e não `bh5_clube`, que varre os 34-35 testados do setor (inclusive os
    # `obr_*` e os condicionados à posse, que a §8.2 expulsa da nota): comparar 18 escolhidos com
    # um BH contado sobre 138 testados seria comparar duas coisas diferentes.
    app_bh = {}
    app_q = {}
    for s, c in crit.items():
        itens = {i["k"]: i for i in scc[s]["itens"]}
        app_bh[s] = sum(1 for k in c["indicadores"] if itens.get(k, {}).get("bh_clube"))
        app_q[s] = {k: itens.get(k, {}).get("q_clube") for k in c["indicadores"]}
    app_testes = sum(scc[s]["testes"] for s in scc)
    raio_bh_atleta = sum(1 for s in raio["sobecai"]["setores"].values()
                         for i in s["itens"] if i.get("bh"))

    # ---- a ponte com A14 --------------------------------------------------------------------------
    mapa = dec["ponte_a14"]["mapa"]
    indice = a14["indice"]
    com_par = [k for k in indice if mapa.get(k)]

    # ---- minutagem ---------------------------------------------------------------------------------
    mi = minutagem()
    j01 = json.load(open(os.path.join(R, "J01_numeros.json"), encoding="utf-8"))
    j01n = j01.get("numeros", j01)
    confere = mi["frase"] == j01n.get("corte_por_posicao")

    # ==============================================================================================
    # A SAÍDA DOS NÚMEROS — resultados/J05_numeros.json
    # ==============================================================================================
    fis_sm = conta("SM", "fisico")
    fis_sc = conta("SC", "fisico")
    tec_sm = [l for l in linhas if l["comparacao"] == "SM" and l["fronteira"] == "com"
              and l["familia"] != "fisico"]
    tec_sc = [l for l in linhas if l["comparacao"] == "SC" and l["fronteira"] == "com"
              and l["familia"] != "fisico"]
    dois_sm = [k for k in dois if k[0] == "SM"]
    dois_sc = [k for k in dois if k[0] == "SC"]

    frase_disc = ("sem os times de fronteira mudam de lado ou de selo: "
                  + "; ".join(f"{d['nome']} no {d['setor']} ({d['comparacao']}, "
                              f"d {br(d['d_com'], 2)} contra {br(d['d_sem'], 2)})"
                              for d in disc)) if disc else \
                 "nenhum teste muda de lado nem de selo entre o corte com e o corte sem os times de fronteira"

    numeros = {
        # o chão
        "n_tit_fis": len(tit_fis),
        "n_tit_tec": len(tit_tec),
        "n_base_fis": len(bf),
        "n_base_tec": len(bt),
        # o perfil do app
        "app_ind_total": sum(app_p5.values()),
        "app_zaga": app_p5["zaga"], "app_lateral": app_p5["lateral"],
        "app_meio": app_p5["meio"], "app_ataque": app_p5["ataque"],
        "app_bh_zaga": app_bh["zaga"], "app_bh_lateral": app_bh["lateral"],
        "app_bh_meio": app_bh["meio"], "app_bh_ataque": app_bh["ataque"],
        "app_ind_bh": sum(app_bh.values()),
        "app_ind_sem_bh": sum(app_p5.values()) - sum(app_bh.values()),
        "app_zaga_lateral": app_p5["zaga"] + app_p5["lateral"],
        "app_testes": app_testes,
        "raio_bh_atleta": raio_bh_atleta,
        "app_setores_sem_bh": sum(1 for s in app_bh if app_bh[s] == 0),
        # os testes desta parte
        "testes_total": len(linhas),
        "testes_fis_sm": len(fis_sm), "testes_fis_sc": len(fis_sc),
        "testes_tec_sm": len(tec_sm), "testes_tec_sc": len(tec_sc),
        "bh_fis_sm": sum(1 for l in fis_sm if l["passou_bh"]),
        "bh_fis_sc": sum(1 for l in fis_sc if l["passou_bh"]),
        "bh_tec_sm": sum(1 for l in tec_sm if l["passou_bh"]),
        "bh_tec_sc": sum(1 for l in tec_sc if l["passou_bh"]),
        "dois_cortes_sm": len(dois_sm),
        "dois_cortes_sc": len(dois_sc),
        "testes_sm": len([l for l in linhas
                          if l["comparacao"] == "SM" and l["fronteira"] == "com"]),
        "testes_sc": len([l for l in linhas
                          if l["comparacao"] == "SC" and l["fronteira"] == "com"]),
        "fora_por_n": len({(x["comparacao"], x["setor"], x["indicador"]) for x in fora}),
        "poder_menor_d": min(l["d_minimo_80"] for l in linhas),
        "poder_maior_d": max(l["d_minimo_80"] for l in linhas),
        "maior_d_sm": round(max(abs(l["d"]) for l in linhas
                                if l["comparacao"] == "SM" and l["fronteira"] == "com"
                                and l["familia"] == "fisico"), 2),
        "maior_d_sc": round(max(abs(l["d"]) for l in linhas
                                if l["comparacao"] == "SC" and l["fronteira"] == "com"), 2),
        "discordancias": frase_disc,
        "n_discordancias": len(disc),
        # a ficha
        "perfil_posicoes": len(por_pos),
        "perfil_menor": min(por_pos.values()),
        "perfil_maior": max(por_pos.values()),
        "perfil_metricas": len(curto),
        "perfil_sem_piso": len(sem_piso),
        "ficha_linhas": len(perfil),
        # a ponte com A14
        "a14_total": len(indice),
        "a14_com_par": len(com_par),
        "a14_sem_par": len(indice) - len(com_par),
        "a14_indicadores_par": len({mapa[k] for k in com_par}),
        "perfil_com_piso": len(curto) - len(sem_piso),
        "gk_aereo_piso": next((p["piso_em_unidade_de_jogo"] for p in curto
                               if p["setor"] == "Goleiro"
                               and p["indicador"] == "Duelos aéreos ganhos, %"), ""),
        # minutagem
        "min_n": mi["n"], "min_regulares": mi["regulares"],
        "min_gk_br": br(mi["p75"]["Goleiro"]), "min_atk_br": br(mi["p75"]["Atacante"]),
        "min_corte_por_posicao": mi["frase"],
        "min_confere_j01": confere,
        "min_gk": mi["p75"]["Goleiro"], "min_atk": mi["p75"]["Atacante"],
        "gerado_em": GERADO_EM,
    }
    json.dump({"gerado_por": GERADO_POR, "gerado_em": GERADO_EM, "numeros": numeros},
              open(os.path.join(R, "J05_numeros.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    json.dump({"gerado_por": GERADO_POR, "gerado_em": GERADO_EM,
               "semente": SEMENTE, "reps_ic": REPS_IC,
               "familia_do_bh": "bloco × comparação × corte (§6.3), sem partir por setor",
               "perfil_do_app": {s: {"indicadores": crit[s]["indicadores"],
                                     "criterio": crit[s]["criterio"],
                                     "sobreviventes_p_clube": app_p5[s],
                                     "sobreviventes_bh_clube": app_bh[s],
                                     "q_clube_de_cada_um": app_q[s],
                                     "testes_do_setor": scc[s]["testes"]} for s in crit},
               "testes_fora_por_n": fora,
               "passa_nos_dois_cortes": [{"comparacao": c, "setor": s, "indicador": i}
                                         for c, s, i in dois],
               "discordancias_entre_os_cortes": disc,
               "cobertura_dos_indicadores": {**cob_fis, **cob_tec},
               "minutagem": mi,
               "minutagem_confere_com_J01": confere,
               "ponte_a14": {"indice": indice, "com_equivalente_de_jogador": com_par},
               "numeros": numeros},
              open(os.path.join(R, "J05_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # ---- relato ------------------------------------------------------------------------------------
    print(f"\n{'='*100}\nO PERFIL QUE O APP JÁ PUBLICA (etapa 13), e por qual critério\n{'='*100}")
    for s in crit:
        print(f"  {s:8s} {app_p5[s]:2d} escolhidos pelo p cru · {app_bh[s]:2d} deles passam no BH "
              f"· o setor tinha {scc[s]['testes']} testes")
    print(f"\n{'='*100}\nO MESMO PERFIL, TESTADO NA BASE DE JOGADOR (2022-2025)\n{'='*100}")
    print(f"  {'comparação':12s} {'bloco':16s} {'testes':>7s} {'BH (com)':>9s} {'nos dois cortes':>16s}")
    for comp in ("SM", "SC"):
        for b in ("fisico", "duelo_corpo", "estilo_tecnico"):
            ls = conta(comp, b)
            nd = sum(1 for k in dois if k[0] == comp
                     and any(l["familia"] == b and l["setor"] == k[1]
                             and l["indicador"] == k[2] for l in ls))
            print(f"  {comp:12s} {b:16s} {len(ls):7d} {sum(1 for l in ls if l['passou_bh']):9d} "
                  f"{nd:16d}")
    print(f"\n  testes que o corte sem fronteira não sustentou e saíram dos dois lados: {len(fora)}")
    print(f"  discordâncias entre os cortes: {len(disc)}")
    print(f"\n{'='*100}\nA FICHA CURTA, POSIÇÃO POR POSIÇÃO\n{'='*100}")
    for setor in dec["setores"]:
        ls = [p for p in curto if p["setor"] == setor]
        print(f"  {setor}:")
        for p in ls:
            alvo = (f"piso {p['piso_pct']} ({p['sentido']}) = {p['piso_em_unidade_de_jogo']}"
                    if p["piso_pct"] != "" else "SEM PISO — " + p["sem_piso_porque"])
            print(f"     [{p['bloco']:14s}] {p['nome'][:46]:46s} {alvo}")
        if setor == "Goleiro":
            print("     [fisico        ] NÃO VERIFICADO — o SkillCorner não rastreia goleiro")
    print(f"\n  minutagem, corte por posição: {mi['frase']}")
    print(f"  confere com o corte_por_posicao de J01: {confere}")
    print(f"\n  gravados: J05_testes.csv ({len(linhas)}), J05_perfil.csv ({len(perfil)}), "
          f"J05_resumo.json, J05_numeros.json ({len(numeros)} marcadores)")


if __name__ == "__main__":
    main()
