#!/usr/bin/env python3
"""A07 — Físico: volume ou intensidade, com bola ou sem bola. O script da parte.

Até 20/09 a A07 não tinha script próprio: o `gerado_por` do A07.json aponta o
`scripts/_rodar.py`, que é o executor comum de A05, A07 e A11 e só escreve a tabela de
testes e o resumo — marcador nenhum. Os 43 marcadores que a parte publica não saíam de
script algum, e é isso que este arquivo fecha.

O QUE ELE NÃO FAZ
  - Não muda a análise. A tabela de testes continua saindo do `_rodar.py`, chamado aqui
    sem uma linha alterada: `A07_testes.csv` e `A07_resumo.json` têm de sair idênticos aos
    de antes (há cópia em `scripts/_backup_pre_numeros_20_09/` para comparar o executor).
  - Não escreve em `A07.json`. A saída é a CONFERÊNCIA do que está publicado, nunca a
    substituição: onde os dois discordarem, o certo é registrar a divergência, não
    consertar nenhum dos dois lados.

O QUE ELE ACRESCENTA
  1. Grava `resultados/A07_numeros.json` com os 43 marcadores da parte.
  2. Calcula os 19 que antes só existiam digitados no A07.json — o posto médio convertido
     em posições de tabela, o poder em posições, o desconto do rodízio, a cobertura
     absoluta e o corte por cobertura. A receita de cada um está no campo `de_onde` de
     `resultados/A07_numeros_novos.json` (escrita em 19/09 e conferida por dois caminhos);
     este script executa essa receita, não inventa outra.

DE ONDE VEM CADA MARCADOR
  Camada 1 — 24 marcadores que o `_rodar.py` já calculava e agora ficam gravados: as
  medianas `cru_a`/`cru_b` e os `n_a`/`n_b` da tabela de testes, o total de linhas e a
  contagem de clubes.
  Camada 2 — 19 marcadores novos neste script, todos a partir da mesma base de 80
  clube-temporada:
    · pos_dist, pos_otip   posto médio no ano ÷ 5,2632 (100/19, o passo de uma posição
                           numa tabela de 20 times)
    · pos_visivel          d mínimo detectável a 80% × desvio combinado dos postos ÷ 5,2632
    · n_ind                indicadores declarados fora da família descritor
    · q_rod_*              desconto do rodízio: resíduo de mínimos quadrados do posto de
                           cada indicador sobre o posto de `fis_atletas`, ajustado UMA vez
                           nas 80 linhas (mecânica de `residualiza()` em
                           gerar_prototipo.py:267), depois t de Welch e BH a 5% dentro de
                           família × comparação × corte, como no `_metodo.comparar`
    · cob_*, n_cob_baixa   cobertura absoluta = fis_minutos ÷ (J × 11 × 90)
    · n_*_cob              as faixas depois de tirar quem está abaixo de 0,75 de cobertura
    · jogos_por_atleta     mediana de fis_minutos ÷ fis_atletas ÷ 90

FORMA DOS VALORES
  O A07.json guarda uns marcadores como número e outros como texto pt-BR ("100,0",
  "0,096 (com fronteira) e 0,086 (sem)"), porque é o que a tela mostra. A tabela FORMA diz,
  marcador por marcador, quantas casas e que moldura usar — o NÚMERO sempre sai do cálculo,
  a tabela só escolhe a casa decimal e a vírgula. Os valores sem arredondar vão no bloco
  `crus` da saída, para quem quiser conferir sem passar pela tela.

Uso:
    python3 _fonte/estudo_serieb/scripts/A07.py
"""
import csv
import json
import math
import os
import sys

import numpy as np
from scipy import stats

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import _rodar  # noqa: E402  — o executor comum, usado sem alteração
from _metodo import bh as bh_do_metodo  # noqa: E402
from _metodo import cohen_d as d_do_metodo  # noqa: E402
from _metodo import d_minimo, pct, percentil_no_ano  # noqa: E402

PARTE = "A07"
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
SAIDA = os.path.join(R, f"{PARTE}_numeros.json")

# Data fixa: o script é reprodutível e a saída não pode mudar só porque o relógio andou.
GERADO_EM = "2026-09-20"

# O passo de uma posição numa tabela de 20 times, em pontos de percentil.
PASSO_DE_UMA_POSICAO = 100 / 19
# O corte de cobertura que o CLAUDE.md manda rodar com e sem.
COBERTURA_BAIXA = 0.75

# Como cada marcador vai para a tela. ("int"), ("num", casas) = número arredondado,
# ("br", casas) = texto pt-BR, ("par", casas) = "X (com fronteira) e Y (sem)".
FORMA = {
    "dist_s": ("int",), "dist_m": ("int",), "hi_s": ("int",), "hi_m": ("int",),
    "dist_s_sf": ("int",), "dist_m_sf": ("int",), "hi_s_sf": ("int",),
    "pos_dist": ("num", 1), "pos_visivel": ("num", 1), "pos_otip": ("num", 1),
    "n_ind": ("int",),
    "q_rod_min_sm": ("num", 2), "q_rod_min_st": ("num", 2),
    "otip_c": ("num", 1), "otip_m": ("br", 1), "otip_m_sf": ("num", 1),
    "tip_c": ("num", 1), "tip_m": ("num", 1),
    "at_c": ("num", 1), "at_m": ("num", 1),
    "jogos_por_atleta": ("int",),
    "q_rod_otip": ("br", 4), "q_rod_otip_sf": ("br", 3),
    "q_rod_sp90": ("par", 3), "q_rod_spcount": ("par", 3), "q_rod_psv": ("par", 3),
    "cob_min": ("int",), "cob_max": ("int",), "cob_mediana": ("int",),
    "n_cob_baixa": ("int",),
    "n_sobe": ("int",), "n_meio": ("int",), "n_cai": ("int",), "n_trave": ("int",),
    "n_sobe_sf": ("int",), "n_meio_sf": ("int",), "n_cai_sf": ("int",),
    "n_trave_sf": ("int",),
    "n_sobe_cob": ("int",), "n_cai_cob": ("int",), "n_meio_cob": ("int",),
    "n_total": ("int",), "clubes": ("int",),
}

CAMADA_1 = {"dist_s", "dist_m", "hi_s", "hi_m", "dist_s_sf", "dist_m_sf", "hi_s_sf",
            "otip_c", "otip_m", "otip_m_sf", "tip_c", "tip_m", "at_c", "at_m",
            "n_sobe", "n_meio", "n_cai", "n_trave", "n_sobe_sf", "n_meio_sf",
            "n_cai_sf", "n_trave_sf", "n_total", "clubes"}


def vestir(marcador, valor):
    """O valor calculado na forma em que a tela o mostra. Não inventa número: só arredonda."""
    forma = FORMA[marcador]
    if forma[0] == "int":
        return int(round(float(valor)))
    if forma[0] == "num":
        return round(float(valor), forma[1])
    if forma[0] == "br":
        return f"{round(float(valor), forma[1]):.{forma[1]}f}".replace(".", ",")
    com, sem = valor
    casas = forma[1]
    return (f"{round(float(com), casas):.{casas}f}".replace(".", ",") + " (com fronteira) e "
            + f"{round(float(sem), casas):.{casas}f}".replace(".", ",") + " (sem)")


def montar_base():
    """A mesma base do `_rodar.py`, mais as duas colunas de que só a camada 2 precisa
    (`fis_minutos` e `J`, para a cobertura). Não reimplementa método nenhum: é leitura."""
    dec = json.load(open(os.path.join(R, f"{PARTE}_indicadores.json"), encoding="utf-8"))
    anos = {str(a) for a in dec["recorte"]["temporadas"]}
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]

    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            tec[(r["ano"], r["clube"])] = r

    base = []
    for k, a in a01.items():
        if k[0] not in anos or k not in tec:
            continue
        t = tec[k]
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"], "pos": int(a["pos"]),
             "trave": a["trave"] == "1", "fronteira": a["fronteira"] == "1"}
        for i in inds:
            v = t.get(i["id"])
            try:
                l[i["id"]] = float(v) if v not in (None, "", "nan") else None
            except ValueError:
                l[i["id"]] = None
        l["minutos"] = float(t["fis_minutos"])
        l["jogos"] = float(t["J"])
        base.append(l)
    base = [l for l in base if all(l[i["id"]] is not None for i in inds)]
    percentil_no_ano(base, [i["id"] for i in inds])
    return dec, inds, base


def residuo_sobre(y, x):
    """Resíduo de y regredido em x por mínimos quadrados — a mecânica de `residualiza()`
    de gerar_prototipo.py:267, que é o desconto que a especificação descreve."""
    y, x = np.asarray(y, float), np.asarray(x, float)
    matriz = np.column_stack([np.ones(len(x)), x])
    beta, *_ = np.linalg.lstsq(matriz, y, rcond=None)
    return y - matriz @ beta


def tabela_do_rodizio(dec, inds, base):
    """O desconto do rodízio: o mesmo desenho do `_metodo.comparar` (Welch + BH a 5% dentro
    de família × comparação × corte), rodado sobre o posto já descontado de `fis_atletas`.
    Devolve {(corte, comparação, indicador): linha}."""
    posto_do_rodizio = [l[pct("fis_atletas")] for l in base]
    for i in inds:
        if i["id"] == "fis_atletas":
            continue
        resid = residuo_sobre([l[pct(i["id"])] for l in base], posto_do_rodizio)
        for l, r in zip(base, resid):
            l["rod::" + i["id"]] = float(r)

    comps = {"SM": (lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
             "ST": (lambda l: l["faixa"] == "Sobe", lambda l: l["trave"]),
             "CM": (lambda l: l["faixa"] == "Cai", lambda l: l["faixa"] == "Meio")}
    familias = [(f["id"], [i["id"] for i in f["indicadores"]])
                for f in dec["familias"] if f["id"] != "descritor"]
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    sinal = {i["id"]: i["sinal"] for i in inds}

    tabela = {}
    for rot, filtro in filtros:
        for fid, ids in familias:
            for cid in [c["id"] for c in dec["comparacoes"] if c["id"] in comps]:
                ga, gb = comps[cid]
                ps, itens = [], []
                for ind in ids:
                    a = [l["rod::" + ind] for l in base if ga(l) and filtro(l)]
                    b = [l["rod::" + ind] for l in base if gb(l) and filtro(l)]
                    if len(a) < 5 or len(b) < 5:
                        continue
                    _, p = stats.ttest_ind(a, b, equal_var=False)
                    itens.append({"fronteira": rot, "familia": fid, "comparacao": cid,
                                  "indicador": ind, "n_a": len(a), "n_b": len(b),
                                  "d_rod": round(float(d_do_metodo(a, b) * sinal[ind]), 3),
                                  "p_rod": round(float(p), 5)})
                    ps.append(float(p))
                for it, q in zip(itens, bh_do_metodo(ps)):
                    it["q_rod"] = round(q, 5)
                    tabela[(it["fronteira"], it["comparacao"], it["indicador"])] = it
    return tabela


def calcular():
    # ---- a análise, sem um fio mexido: o executor comum roda a parte ----------------------
    res, _ = _rodar.rodar(PARTE)
    linha = {(r["fronteira"], r["comparacao"], r["indicador"]): r for r in res}

    dec, inds, base = montar_base()

    # A base deste script tem de ser a MESMA que o `_rodar.py` usou. Se um dia deixar de ser,
    # o script para aqui em vez de publicar número de outra base.
    for r in res:
        k = (r["fronteira"], r["comparacao"], r["indicador"])
        if r["fronteira"] != "com":
            continue
        ga = {"SM": lambda l: l["faixa"] == "Sobe", "ST": lambda l: l["faixa"] == "Sobe",
              "CM": lambda l: l["faixa"] == "Cai"}[r["comparacao"]]
        gb = {"SM": lambda l: l["faixa"] == "Meio", "ST": lambda l: l["trave"],
              "CM": lambda l: l["faixa"] == "Meio"}[r["comparacao"]]
        for lado, grupo, col in (("a", ga, "cru_a"), ("b", gb, "cru_b")):
            meu = round(float(np.median([l[r["indicador"]] for l in base if grupo(l)])), 3)
            if abs(meu - r[col]) > 5e-4:
                raise SystemExit(f"{PARTE}: a base deste script não bate com a do _rodar.py "
                                 f"em {k} {col}: {meu} contra {r[col]}")

    crus, valores = {}, {}

    def guardar(marcador, cru):
        crus[marcador] = cru
        valores[marcador] = vestir(marcador, cru)

    # ---- CAMADA 1: o que o executor já calculava, agora gravado ---------------------------
    def de(corte, comparacao, indicador, coluna):
        return linha[(corte, comparacao, indicador)][coluna]

    guardar("dist_s", de("com", "SM", "fis_distance_p90", "cru_a"))
    guardar("dist_m", de("com", "SM", "fis_distance_p90", "cru_b"))
    guardar("hi_s", de("com", "SM", "fis_hi_distance_p90", "cru_a"))
    guardar("hi_m", de("com", "SM", "fis_hi_distance_p90", "cru_b"))
    guardar("dist_s_sf", de("sem", "SM", "fis_distance_p90", "cru_a"))
    guardar("dist_m_sf", de("sem", "SM", "fis_distance_p90", "cru_b"))
    guardar("hi_s_sf", de("sem", "SM", "fis_hi_distance_p90", "cru_a"))
    guardar("otip_c", de("com", "CM", "fis_sprint_distance_p30otip", "cru_a"))
    guardar("otip_m", de("com", "CM", "fis_sprint_distance_p30otip", "cru_b"))
    guardar("otip_m_sf", de("sem", "CM", "fis_sprint_distance_p30otip", "cru_b"))
    guardar("tip_c", de("com", "CM", "fis_sprint_distance_p30tip", "cru_a"))
    guardar("tip_m", de("com", "CM", "fis_sprint_distance_p30tip", "cru_b"))
    guardar("at_c", de("com", "CM", "fis_atletas", "cru_a"))
    guardar("at_m", de("com", "CM", "fis_atletas", "cru_b"))
    guardar("n_sobe", de("com", "SM", "fis_distance_p90", "n_a"))
    guardar("n_meio", de("com", "SM", "fis_distance_p90", "n_b"))
    guardar("n_cai", de("com", "CM", "fis_distance_p90", "n_a"))
    guardar("n_trave", de("com", "ST", "fis_distance_p90", "n_b"))
    guardar("n_sobe_sf", de("sem", "SM", "fis_distance_p90", "n_a"))
    guardar("n_meio_sf", de("sem", "SM", "fis_distance_p90", "n_b"))
    guardar("n_cai_sf", de("sem", "CM", "fis_distance_p90", "n_a"))
    guardar("n_trave_sf", de("sem", "ST", "fis_distance_p90", "n_b"))
    guardar("n_total", len(base))
    guardar("clubes", len({l["clube"] for l in base}))

    # ---- CAMADA 2: o que só existia digitado ----------------------------------------------
    guardar("n_ind", sum(len(f["indicadores"]) for f in dec["familias"]
                         if f["id"] != "descritor"))

    # Posto médio no ano, em posições de tabela: é assim que o poder e a distância viram
    # unidade de jogo sem usar percentil nem d no texto.
    def postos(indicador, e_da_faixa):
        return [l[pct(indicador)] for l in base if e_da_faixa(l)]

    sobe_dist = postos("fis_distance_p90", lambda l: l["faixa"] == "Sobe")
    meio_dist = postos("fis_distance_p90", lambda l: l["faixa"] == "Meio")
    guardar("pos_dist",
            (np.mean(sobe_dist) - np.mean(meio_dist)) / PASSO_DE_UMA_POSICAO)

    na, nb = len(sobe_dist), len(meio_dist)
    desvio_combinado = math.sqrt(((na - 1) * np.var(sobe_dist, ddof=1)
                                  + (nb - 1) * np.var(meio_dist, ddof=1)) / (na + nb - 2))
    guardar("pos_visivel",
            d_minimo(na, nb) * desvio_combinado / PASSO_DE_UMA_POSICAO)

    meio_otip = postos("fis_sprint_distance_p30otip", lambda l: l["faixa"] == "Meio")
    cai_otip = postos("fis_sprint_distance_p30otip", lambda l: l["faixa"] == "Cai")
    guardar("pos_otip",
            (np.mean(meio_otip) - np.mean(cai_otip)) / PASSO_DE_UMA_POSICAO)

    # O desconto do rodízio que o CLAUDE.md exige no físico.
    rod = tabela_do_rodizio(dec, inds, base)
    guardar("q_rod_min_sm", min(v["q_rod"] for k, v in rod.items() if k[1] == "SM"))
    guardar("q_rod_min_st", min(v["q_rod"] for k, v in rod.items() if k[1] == "ST"))
    guardar("q_rod_otip", rod[("com", "CM", "fis_sprint_distance_p30otip")]["q_rod"])
    guardar("q_rod_otip_sf", rod[("sem", "CM", "fis_sprint_distance_p30otip")]["q_rod"])
    for marcador, ind in (("q_rod_sp90", "fis_sprint_distance_p90"),
                          ("q_rod_spcount", "fis_sprint_count_p90"),
                          ("q_rod_psv", "fis_psv99_top5")):
        guardar(marcador, (rod[("com", "CM", ind)]["q_rod"],
                           rod[("sem", "CM", ind)]["q_rod"]))

    # Cobertura absoluta: minutos rastreados sobre o possível (jogos × 11 × 90).
    for l in base:
        l["cobertura"] = l["minutos"] / (l["jogos"] * 11 * 90)
    cobertura = [l["cobertura"] for l in base]
    guardar("cob_min", 100 * min(cobertura))
    guardar("cob_max", 100 * max(cobertura))
    guardar("cob_mediana", 100 * float(np.median(cobertura)))
    guardar("n_cob_baixa", sum(1 for c in cobertura if c < COBERTURA_BAIXA))

    bem_cobertos = [l for l in base if l["cobertura"] >= COBERTURA_BAIXA]
    guardar("n_sobe_cob", sum(1 for l in bem_cobertos if l["faixa"] == "Sobe"))
    guardar("n_meio_cob", sum(1 for l in bem_cobertos if l["faixa"] == "Meio"))
    guardar("n_cai_cob", sum(1 for l in bem_cobertos if l["faixa"] == "Cai"))

    guardar("jogos_por_atleta",
            float(np.median([l["minutos"] / l["fis_atletas"] / 90 for l in base])))

    faltam = sorted(set(FORMA) - set(valores))
    if faltam:
        raise SystemExit(f"{PARTE}: marcadores declarados em FORMA e não calculados: {faltam}")
    return valores, crus, rod, base


def gravar(valores, crus):
    saida = {
        "parte": PARTE,
        "gerado_por": f"scripts/{PARTE}.py",
        "gerado_em": GERADO_EM,
        "o_que_e": ("A conferência dos marcadores publicados em A07.json. Cada valor sai do "
                    "cálculo, nunca do teclado. Este arquivo NÃO substitui o A07.json: se os "
                    "dois discordarem, a divergência é achado, não conserto."),
        "camadas": {
            "ja_calculados_pelo_rodar_py": sorted(CAMADA_1),
            "novos_neste_script": sorted(set(FORMA) - CAMADA_1),
        },
        "numeros": {m: valores[m] for m in sorted(valores)},
        "crus": {m: (list(crus[m]) if isinstance(crus[m], tuple) else crus[m])
                 for m in sorted(crus)},
    }
    with open(SAIDA, "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
        f.write("\n")
    return saida


def conferir_contra_o_publicado(valores):
    """A saída ao lado do que a tela mostra. NÃO conserta nada — só diz onde discordam."""
    publicado = json.load(open(os.path.join(R, f"{PARTE}.json"), encoding="utf-8"))["numeros"]

    def como_numero(v):
        try:
            return float(v)
        except (TypeError, ValueError):
            return None

    divergem, ausentes = [], sorted(set(publicado) - set(valores))
    for m in sorted(publicado):
        if m not in valores:
            continue
        calculado, esta = valores[m], publicado[m]
        a, b = como_numero(calculado), como_numero(esta)
        if a is not None and b is not None:
            if abs(a - b) > 1e-9:
                divergem.append((m, esta, calculado))
        elif str(calculado).strip() != str(esta).strip():
            divergem.append((m, esta, calculado))
    return divergem, ausentes, sorted(set(valores) - set(publicado))


if __name__ == "__main__":
    valores, crus, rod, base = calcular()
    gravar(valores, crus)
    print(f"\n  {len(valores)} marcadores em {os.path.relpath(SAIDA, RAIZ)} "
          f"({len(CAMADA_1)} que o _rodar.py já calculava, "
          f"{len(set(FORMA) - CAMADA_1)} novos aqui)")

    divergem, ausentes, sobrando = conferir_contra_o_publicado(valores)
    print(f"\n  CONFERÊNCIA CONTRA {PARTE}.json (só relato, nada é consertado):")
    if ausentes:
        print(f"    marcadores publicados que este script não produz: {ausentes}")
    if sobrando:
        print(f"    marcadores que o script produz e a parte não publica: {sobrando}")
    if divergem:
        for m, esta, calculado in divergem:
            print(f"    DIVERGE  {m}: publicado {esta!r}, o script dá {calculado!r}")
    if not (divergem or ausentes or sobrando):
        print("    nenhuma divergência: os 43 marcadores publicados batem com o cálculo")
