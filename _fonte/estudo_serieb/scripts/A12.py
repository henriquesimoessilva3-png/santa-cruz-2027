#!/usr/bin/env python3
"""A12 — as réguas contínuas e o Cenário Barato.

NÃO refaz agrupamento: a §7.1 já decidiu que não há grupos, e o CLAUDE.md proíbe reabrir.

Faz três coisas:

1. **Posiciona cada clube-temporada nas nove réguas** (A a I de `prototipo_indicadores.json`):
   média dos percentis dentro da temporada dos itens da régua, com o sinal alinhado. Depois compara
   as faixas em cada régua, com o método da casa e a regra da fronteira corrigida.

2. **Testa o Cenário Barato.** A §7.2(b) descreve o perfil dos 4 que subiram fora do top-8 de valor
   — PPDA 10,0-13,2, posse 47-52%, passe longo 10-14% — e o rotula como escolha de projeto, com
   n=4 impresso. O que faltava era o outro lado da conta: **quantos clube-temporadas que NÃO subiram
   também cabem nessa faixa?** Um perfil que 40 times têm e só 4 usaram para subir não é perfil, é
   descrição da liga. Ampliar o Cenário Barato com mais casos dependia de 2018-2021, que está fora
   do recorte (decisão de 17/09); então o que dá para acrescentar é este teste.

3. **Posiciona 2026 nas mesmas réguas**, como o CLAUDE.md pede.

Uso:
    python3 _fonte/estudo_serieb/scripts/A12.py
"""
import collections
import csv
import json
import os
import sys
from decimal import ROUND_HALF_UP, Decimal

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import comparar, d_minimo, pct, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
RNG = np.random.default_rng(20260917)
FECHADAS = {"2022", "2023", "2024", "2025"}
TESTE = "2026"

# A faixa do perfil do Cenário Barato, como a §7.2(b) a descreve.
PERFIL_BARATO = {"ppda": (10.0, 13.2), "posse": (47.0, 52.0), "passe_longo_pct": (10.0, 14.0)}

# ----------------------------------------------------------------------------------------------
# A saída por marcador — regra 1 do portão (etapa 6 do PLANO.md)
# ----------------------------------------------------------------------------------------------
# Acrescentado em 20/09. NÃO muda a análise: grava, com o nome do marcador como chave, o que o
# script já calculava, e passa a calcular os marcadores que até aqui só existiam digitados no
# A12.json. Receita de cada um: resultados/A12_numeros_novos.json, campo `de_onde`.
SAIDA_NUMEROS = "A12_numeros.json"
GERADO_EM = "2026-09-20"

# ----------------------------------------------------------------------------------------------
# A tabela de testes — regras 2 e 3 do portão
# ----------------------------------------------------------------------------------------------
# Acrescentado em 20/09. A comparação das nove réguas nos DOIS cortes de fronteira já rodava desde
# sempre (o `comparar()` abaixo, com os filtros "com" e "sem"); o que faltava era gravá-la no nome
# canônico `A12_testes.csv`, que é onde o portão procura a prova de que os dois cortes rodaram.
# NÃO muda nenhum número: é a mesma lista de linhas que vai para `A12_reguas.csv`, acrescida das
# duas colunas que faltavam para o cabeçalho canônico (copiado de A07_testes.csv).
#
# `A12_reguas.csv` continua sendo gravado com as 15 colunas de sempre, byte a byte, porque três
# conclusões o citam como prova.
CAMPOS_DA_REGUA = ["fronteira", "familia", "comparacao", "indicador", "n_a", "n_b", "cru_a",
                   "cru_b", "d", "ic95_d", "p", "d_minimo_80", "q", "selo", "poder_suficiente"]
CAMPOS_DO_TESTE = CAMPOS_DA_REGUA + ["nome", "placar_redescrito"]
SAIDA_TESTES = "A12_testes.csv"

# `placar_redescrito` é a lista branca do RESULTADO redescrito ("isto é o placar, não é
# característica": gols, pontos, saldo), e não "indicador que muda com o placar". Nenhuma das nove
# réguas é o resultado contado de outro jeito — a mais próxima, E_qualidade_chance, mede de onde o
# time finaliza, não quanto marcou. Por isso a coluna sai False nas 54 linhas, como em A05 e A07.
PLACAR_REDESCRITO = set()

# Os nomes das réguas na linguagem da Didática, para as frases `separam`/`nao_separam`.
NOME_DA_REGUA = {
    "A_posse_construcao": "construção com bola", "B_pressao_ritmo": "pressão e ritmo",
    "C_volume_fisico": "volume físico", "D_explosao": "explosão",
    "E_qualidade_chance": "qualidade da chance", "F_solidez": "solidez",
    "G_bola_aerea_parada": "bola aérea e parada", "H_dinheiro": "valor do elenco",
    "I_estabilidade_11": "estabilidade do onze",
}


def br(v, casas):
    """Número no formato do texto: vírgula decimal, arredondando meio para CIMA.
    `round()` cru não serve — round(13.85, 1) devolve 13.8 por causa do float binário, e o
    valor do elenco do meio é exatamente esse caso."""
    d = Decimal(str(float(v))).quantize(Decimal(1).scaleb(-casas), rounding=ROUND_HALF_UP)
    return f"{d:.{casas}f}".replace(".", ",")


def inteiro(v):
    return int(Decimal(str(float(v))).quantize(Decimal(1), rounding=ROUND_HALF_UP))


def mediana(linhas, coluna):
    return float(np.median([l[coluna] for l in linhas]))


def juntar(itens):
    """Lista em frase. Quando o último item já tem um “e” dentro (“bola aérea e parada”), a
    ligação volta a ser vírgula: “explosão e bola aérea e parada” não é português."""
    itens = list(itens)
    if len(itens) < 2:
        return "".join(itens)
    if " e " in itens[-1]:
        return ", ".join(itens)
    return ", ".join(itens[:-1]) + " e " + itens[-1]


def posto_no_ano(por_ano, linha, coluna, menor_primeiro):
    """Lugar do clube na coluna dentro da própria temporada. 1 = melhor, pelo sentido pedido."""
    v = linha[coluna]
    iguais = por_ano[linha["temporada"]]
    melhores = [x for x in iguais if (x[coluna] < v if menor_primeiro else x[coluna] > v)]
    return len(melhores) + 1


def gravar_numeros(eixos, fechadas, por_ano, tec, por, no_perfil, subiu_no_perfil,
                   fora_top8, barato, perfil_fora_top8, teste, cabe):
    """Todo marcador que o A12.json publica, com o valor que ESTE script calcula."""
    sobe = [l for l in fechadas if l["faixa"] == "Sobe"]
    meio = [l for l in fechadas if l["faixa"] == "Meio"]
    cai = [l for l in fechadas if l["faixa"] == "Cai"]
    sem = lambda ls: [l for l in ls if not l["fronteira"]]

    # As nove réguas em Sobe × Meio, pelo selo em cada corte de fronteira (A12_reguas.csv).
    def selo(e, corte):
        return por[("SM", e)].get(corte, {}).get("selo")
    firmes = {e: [c for c in ("com", "sem") if selo(e, c) == "firme"] for e in eixos}
    separam = [NOME_DA_REGUA[e] for e in eixos if len(firmes[e]) == 2]
    depende = [NOME_DA_REGUA[e] for e in eixos if len(firmes[e]) == 1]
    nao_separam = [NOME_DA_REGUA[e] for e in eixos if not firmes[e]]
    firme_nos_dois = [e for e in eixos if len(firmes[e]) == 2]

    def med_regua(e, fx):
        alvo = [l for l in fechadas if (l["trave"] if fx == "Trave" else l["faixa"] == fx)]
        return round(float(np.median([l[e] for l in alvo])), 1)

    # O Cenário Barato.
    cairam = [l for l in no_perfil if l["faixa"] == "Cai"]
    ricos = sorted([l for l in subiu_no_perfil if l["posto_valor"] <= 8],
                   key=lambda l: (l["posto_valor"], l["temporada"]))
    ricos_frase = juntar([f"{l['clube']} {l['temporada']} ({l['posto_valor']}º em valor do ano)"
                          if i == 0 else f"{l['clube']} {l['temporada']} ({l['posto_valor']}º)"
                          for i, l in enumerate(ricos)])

    # Os quatro casos de origem, lidos dentro do próprio ano (A12-3).
    envelope = {c: (min(l[c] for l in barato), max(l[c] for l in barato))
                for c in ("ppda", "posse", "passe_longo_pct")}
    postos = {(c, menor): sorted(posto_no_ano(por_ano, l, c, menor) for l in barato)
              for c, menor in (("ppda", True), ("posse", False), ("passe_longo_pct", False))}
    pior_posse = max(barato, key=lambda l: l["posse"])
    pior_longo = max(barato, key=lambda l: l["passe_longo_pct"])

    # 2026, na rodada em que a base foi copiada.
    cabem26 = [l for l in teste if cabe(l)]
    baratos26 = [l for l in cabem26 if l["posto_valor"] > 8]
    melhor26 = min(baratos26, key=lambda l: l["pos"]) if baratos26 else None
    jogos = lambda ls: sorted({int(tec[(l["temporada"], l["clube"])]["J"]) for l in ls})

    n = {
        # ---- as nove réguas (A12-1) ----
        "n_reguas": len(eixos),
        "sm_n": len(firme_nos_dois),
        "sm_lista": ", ".join(firme_nos_dois),
        "separam": juntar(separam),
        "nao_separam": juntar(nao_separam),
        "depende_do_corte": juntar(depende),
        "E_sobe": med_regua("E_qualidade_chance", "Sobe"),
        "E_meio": med_regua("E_qualidade_chance", "Meio"),
        "F_sobe": med_regua("F_solidez", "Sobe"),
        "F_meio": med_regua("F_solidez", "Meio"),
        "H_sobe": med_regua("H_dinheiro", "Sobe"),
        "H_meio": med_regua("H_dinheiro", "Meio"),
        "H_cai": med_regua("H_dinheiro", "Cai"),
        "I_sobe": med_regua("I_estabilidade_11", "Sobe"),
        "I_meio": med_regua("I_estabilidade_11", "Meio"),
        "I_cai": med_regua("I_estabilidade_11", "Cai"),
        "A_sobe": med_regua("A_posse_construcao", "Sobe"),
        "A_trave": med_regua("A_posse_construcao", "Trave"),
        # ---- os indicadores crus por trás das réguas (mediana da faixa, como o cru_ do método) ----
        "dist_sobe": br(mediana(sobe, "dist_remate"), 1),
        "dist_meio": br(mediana(meio, "dist_remate"), 1),
        "xgr_sobe": br(mediana(sobe, "xg_por_remate_contra"), 3),
        "xgr_meio": br(mediana(meio, "xg_por_remate_contra"), 3),
        "val_sobe": br(mediana(sobe, "tm_valor_total") / 1e6, 1),
        "val_meio": br(mediana(meio, "tm_valor_total") / 1e6, 1),
        "sh_sobe": br(mediana(sobe, "share_11"), 1),
        "sh_meio": br(mediana(meio, "share_11"), 1),
        "posse_sobe_com": br(mediana(sobe, "posse"), 1),
        "posse_meio_com": br(mediana(meio, "posse"), 1),
        "posse_sobe_sem": br(mediana(sem(sobe), "posse"), 1),
        "posse_meio_sem": br(mediana(sem(meio), "posse"), 1),
        "sprint_cai": inteiro(mediana(cai, "fis_sprint_distance_p90")),
        "sprint_meio": inteiro(mediana(meio, "fis_sprint_distance_p90")),
        "n_sobe": len(sobe),
        "n_meio": len(meio),
        "n_sobe_sem": len(sem(sobe)),
        "n_meio_sem": len(sem(meio)),
        "n_cai_sem": len(sem(cai)),
        # ---- o Cenário Barato (A12-2) ----
        "cabem": len(no_perfil),
        "n_fech": len(fechadas),
        "subiram": len(subiu_no_perfil),
        "cairam": len(cairam),
        "sobe_liga": len(sobe),
        "cai_liga": len(cai),
        "taxa_env": br(100 * len(subiu_no_perfil) / len(no_perfil), 1),
        "taxa_queda_env": br(100 * len(cairam) / len(no_perfil), 1),
        "taxa_liga": br(100 * len(sobe) / len(fechadas), 1),
        "cabem8": len(perfil_fora_top8),
        "sub8": len([l for l in perfil_fora_top8 if l["faixa"] == "Sobe"]),
        "taxa8": br(100 * len([l for l in perfil_fora_top8 if l["faixa"] == "Sobe"])
                    / len(perfil_fora_top8), 1),
        "taxa_geral8": br(100 * len(barato) / len(fora_top8), 1),
        "n8": len(fora_top8),
        "n_barato": len(barato),
        "ricos_no_perfil": ricos_frase,
        "rodada": jogos(teste)[-1],
        "total_rodadas": jogos(fechadas)[-1],
        "n26": len(cabem26),
        "baratos26": ", ".join(l["clube"] for l in sorted(baratos26, key=lambda l: l["pos"])),
        "n_baratos26": len(baratos26),
        "g4_26": len([l for l in cabem26 if l["pos"] <= 4]),
        "pos_melhor26": melhor26["pos"],
        "pts_zona26": melhor26["pontos"],
        # ---- a faixa publicada contra os quatro casos (A12-3) ----
        "ppda_lo": br(PERFIL_BARATO["ppda"][0], 1),
        "ppda_hi": br(PERFIL_BARATO["ppda"][1], 1),
        "posse_lo": inteiro(PERFIL_BARATO["posse"][0]),
        "posse_hi": inteiro(PERFIL_BARATO["posse"][1]),
        "longo_lo": inteiro(PERFIL_BARATO["passe_longo_pct"][0]),
        "longo_hi": inteiro(PERFIL_BARATO["passe_longo_pct"][1]),
        "vit_posse": br(pior_posse["posse"], 4),
        "chape_longo": br(pior_longo["passe_longo_pct"], 4),
        "r_ppda_melhor": postos[("ppda", True)][0],
        "r_ppda_pior": postos[("ppda", True)][-1],
        "r_posse_melhor": postos[("posse", False)][0],
        "r_posse_pior": postos[("posse", False)][-1],
        "r_longo_melhor": postos[("passe_longo_pct", False)][0],
        "r_longo_pior": postos[("passe_longo_pct", False)][-1],
        "envelope_real": (f"PPDA {br(envelope['ppda'][0], 4)}-{br(envelope['ppda'][1], 4)} · "
                          f"posse {br(envelope['posse'][0], 4)}-{br(envelope['posse'][1], 4)}% · "
                          f"passe longo {br(envelope['passe_longo_pct'][0], 4)}-"
                          f"{br(envelope['passe_longo_pct'][1], 4)}%"),
    }
    caminho = os.path.join(R, SAIDA_NUMEROS)
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump({"gerado_por": "scripts/A12.py", "gerado_em": GERADO_EM, "numeros": n},
                  f, ensure_ascii=False, indent=1)
    print(f"\n{len(n)} marcadores gravados em resultados/{SAIDA_NUMEROS}")
    return n


def main():
    eixos = json.load(open(os.path.join(DADOS, "prototipo_indicadores.json"),
                           encoding="utf-8"))["eixos"]
    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            tec[(r["ano"], r["clube"])] = r

    itens = sorted({i for v in eixos.values() for i, _ in v}
                   | set(PERFIL_BARATO) | {"tm_valor_total"})
    base, sem = [], collections.Counter()
    for k, a in a01.items():
        if k not in tec:
            continue
        t = tec[k]
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"], "pos": int(a["pos"]),
             "pontos": int(a["pontos"]), "trave": a["trave"] == "1",
             "fronteira": a["fronteira"] == "1"}
        for c in itens:
            v = t.get(c)
            try:
                l[c] = float(v) if v not in (None, "", "nan") else None
            except ValueError:
                l[c] = None
            if l[c] is None:
                sem[c] += 1
        base.append(l)
    if sem:
        print(f"  colunas com buraco: {dict(sem)}")
    base = [l for l in base if all(l[c] is not None for c in itens)]
    print(f"base: {len(base)} clube-temporadas ({len([l for l in base if l['temporada'] in FECHADAS])} fechadas)")

    percentil_no_ano(base, itens)
    # posição em cada régua = média dos percentis dos itens, com o sinal alinhado
    for l in base:
        for eixo, its in eixos.items():
            vs = [(l[pct(i)] if s > 0 else 100 - l[pct(i)]) for i, s in its]
            l[eixo] = sum(vs) / len(vs)
    # posto de valor dentro do ano (1 = mais caro)
    por_ano = collections.defaultdict(list)
    for l in base:
        por_ano[l["temporada"]].append(l)
    for ls in por_ano.values():
        for i, l in enumerate(sorted(ls, key=lambda x: -x["tm_valor_total"]), 1):
            l["posto_valor"] = i

    fechadas = [l for l in base if l["temporada"] in FECHADAS]
    percentil_no_ano(fechadas, list(eixos))
    familias = [("reguas", list(eixos))]
    comparacoes = [("SM", lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
                   ("ST", lambda l: l["faixa"] == "Sobe", lambda l: l["trave"]),
                   ("CM", lambda l: l["faixa"] == "Cai", lambda l: l["faixa"] == "Meio")]
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    res = comparar(fechadas, familias, comparacoes, filtros, RNG, lambda i: 1)
    with open(os.path.join(R, "A12_reguas.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CAMPOS_DA_REGUA, extrasaction="ignore")
        w.writeheader(); w.writerows(res)
    # A mesma tabela, no nome e no cabeçalho canônicos. `nome` traz a régua na linguagem da
    # Didática, para o texto da conclusão poder ser amarrado à linha que o sustenta.
    for it in res:
        it["nome"] = NOME_DA_REGUA[it["indicador"]]
        it["placar_redescrito"] = it["indicador"] in PLACAR_REDESCRITO
    with open(os.path.join(R, SAIDA_TESTES), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CAMPOS_DO_TESTE)
        w.writeheader(); w.writerows(res)
    print(f"{len(res)} linhas de teste gravadas em resultados/{SAIDA_TESTES} "
          f"({len([r for r in res if r['fronteira'] == 'com'])} com fronteira, "
          f"{len([r for r in res if r['fronteira'] == 'sem'])} sem)")
    por = collections.defaultdict(dict)
    for r in res:
        por[(r["comparacao"], r["indicador"])][r["fronteira"]] = r
    dois = {cp: [i for (c, i), v in por.items() if c == cp
                 and v.get("com", {}).get("selo") == "firme"
                 and v.get("sem", {}).get("selo") == "firme"] for cp in ("SM", "ST", "CM")}

    # ---- o Cenário Barato: quem cabe no perfil, e quantos subiram ----
    def cabe(l):
        return all(lo <= l[c] <= hi for c, (lo, hi) in PERFIL_BARATO.items())
    no_perfil = [l for l in fechadas if cabe(l)]
    subiu_no_perfil = [l for l in no_perfil if l["faixa"] == "Sobe"]
    fora_top8 = [l for l in fechadas if l["posto_valor"] > 8]
    barato = [l for l in fora_top8 if l["faixa"] == "Sobe"]
    barato_no_perfil = [l for l in barato if cabe(l)]
    perfil_fora_top8 = [l for l in no_perfil if l["posto_valor"] > 8]

    # ---- 2026 nas réguas ----
    teste = sorted([l for l in base if l["temporada"] == TESTE], key=lambda l: l["pos"])

    json.dump({
        "reguas": list(eixos), "firme_nos_dois_cortes": dois,
        "mediana_por_faixa": {e: {fx: round(float(np.median([l[e] for l in fechadas
                                                            if (l["trave"] if fx == "Trave" else l["faixa"] == fx)])), 1)
                                  for fx in ("Sobe", "Trave", "Meio", "Cai")} for e in eixos},
        "cenario_barato": {
            "perfil_declarado_na_especificacao": PERFIL_BARATO,
            "promovidos_fora_do_top8_de_valor": [
                {"temporada": l["temporada"], "clube": l["clube"], "pos": l["pos"],
                 "pontos": l["pontos"], "posto_valor": l["posto_valor"],
                 "ppda": round(l["ppda"], 2), "posse": round(l["posse"], 1),
                 "passe_longo_pct": round(l["passe_longo_pct"], 1), "cabe_no_perfil": cabe(l)}
                for l in sorted(barato, key=lambda x: (x["temporada"], x["pos"]))],
            "quantos_cabem_no_perfil": len(no_perfil),
            "destes_quantos_subiram": len(subiu_no_perfil),
            "taxa_de_acesso_no_perfil": round(100 * len(subiu_no_perfil) / len(no_perfil), 1) if no_perfil else None,
            "taxa_de_acesso_geral": round(100 * 16 / len(fechadas), 1),
            "cabem_e_estao_fora_do_top8": len(perfil_fora_top8),
            "destes_quantos_subiram": len([l for l in perfil_fora_top8 if l["faixa"] == "Sobe"]),
            "taxa_fora_do_top8_geral": round(100 * len(barato) / len(fora_top8), 1),
            "n_promovidos_baratos": len(barato), "n_cabem_dos_baratos": len(barato_no_perfil),
        },
        "teste_2026": [{"pos": l["pos"], "clube": l["clube"], "posto_valor": l["posto_valor"],
                        **{e: round(l[e]) for e in eixos}} for l in teste],
        "n": {"fechadas": len(fechadas), "total": len(base)},
    }, open(os.path.join(R, "A12_resumo.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    print(f"\n{'='*86}\nAS NOVE RÉGUAS, mediana do percentil por faixa (2022-2025)\n{'='*86}")
    print(f"{'régua':24s} {'Sobe':>6s} {'Trave':>6s} {'Meio':>6s} {'Cai':>6s}   firme nos dois cortes?")
    med = json.load(open(os.path.join(R, "A12_resumo.json"), encoding="utf-8"))["mediana_por_faixa"]
    for e in eixos:
        m = med[e]
        onde = [cp for cp in ("SM", "ST", "CM") if e in dois[cp]]
        print(f"{e:24s} {m['Sobe']:6.1f} {m['Trave']:6.1f} {m['Meio']:6.1f} {m['Cai']:6.1f}   "
              f"{', '.join(onde) if onde else '—'}")

    print(f"\n{'='*86}\nO CENÁRIO BARATO: o perfil distingue?\n{'='*86}")
    print(f"  promovidos fora do top-8 de valor: {len(barato)}")
    for l in sorted(barato, key=lambda x: (x["temporada"], x["pos"])):
        print(f"     {l['temporada']} {l['clube'][:16]:16s} {l['pos']}º · valor {l['posto_valor']}º · "
              f"PPDA {l['ppda']:.2f} posse {l['posse']:.1f}% longo {l['passe_longo_pct']:.1f}%"
              f"{'  ✓ cabe no perfil' if cabe(l) else '  ✗ NÃO cabe'}")
    print(f"\n  clube-temporadas que CABEM no perfil (PPDA 10-13,2 · posse 47-52% · longo 10-14%): {len(no_perfil)}")
    print(f"     destes, subiram: {len(subiu_no_perfil)}  ->  taxa de acesso {100*len(subiu_no_perfil)/max(1,len(no_perfil)):.1f}%")
    print(f"     taxa de acesso da liga inteira: {100*16/len(fechadas):.1f}%")
    print(f"\n  cabem no perfil E estão fora do top-8 de valor: {len(perfil_fora_top8)}")
    print(f"     destes, subiram: {len([l for l in perfil_fora_top8 if l['faixa']=='Sobe'])}")
    print(f"     taxa de acesso de quem está fora do top-8, em geral: {100*len(barato)/len(fora_top8):.1f}%")

    gravar_numeros(eixos, fechadas, por_ano, tec, por, no_perfil, subiu_no_perfil,
                   fora_top8, barato, perfil_fora_top8, teste, cabe)


if __name__ == "__main__":
    main()
