#!/usr/bin/env python3
"""A05 — Estilo com bola: cada marcador publicado, calculado e gravado.

A A05 nunca teve script próprio. O `gerado_por` do `A05.json` aponta `scripts/_rodar.py A05`, o
executor genérico que também serve A07 e A11: ele grava `A05_testes.csv` e `A05_resumo.json`, e
nada mais. Os 25 marcadores que a parte publica em `numeros` não saíam de arquivo nenhum — é o que
a regra 1 do portão cobra e o que a auditoria de 19/09 registrou em `_robustez_19_09.json`.

O que este script faz, nesta ordem:

 1. **Reproduz** o caminho do `_rodar.py A05` — mesma base, mesmo `_metodo.py`, mesma semente —
    **sem reescrever** `A05_testes.csv` nem `A05_resumo.json`, que continuam sendo dele.
 2. **Confere** o que reproduziu contra esses dois arquivos, linha a linha e célula a célula.
    Essa é a trava: se a reprodução divergir do que está no disco, o script avisa e não finge.
 3. **Calcula** os marcadores que o `_rodar.py` não emitia — contagens, mínimos e máximos de
    recorte, o limiar da fronteira e as rodadas do turno — seguindo o campo `de_onde` de
    `A05_numeros_novos.json`, que é a receita escrita em 19/09.
 4. **Grava** `resultados/A05_numeros.json`: um valor por marcador, com o nome do marcador na
    chave, já na casa decimal da tela (arredondado, nunca truncado).

Este script NÃO toca no `A05.json`. A saída daqui é a CONFERÊNCIA do que está publicado, não a
substituição: divergência entre a saída e o publicado é achado, e sai impressa no fim.

Uso:
    python3 _fonte/estudo_serieb/scripts/A05.py
"""
import collections
import csv
import json
import os
import sys
from decimal import Decimal, ROUND_HALF_UP

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from _metodo import comparar, d_minimo, pct, percentil_no_ano  # noqa: E402

ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")

PID = "A05"
SEMENTE = 20260917                 # a mesma de _rodar.py: sem ela o bootstrap não se reproduz
NUMEROS_JSON = os.path.join(R, f"{PID}_numeros.json")
GERADO_EM = "2026-09-20"           # constante: o script é reprodutível, data dinâmica não seria


# ----------------------------------------------------------------------------------------------
# Arredondamento
# ----------------------------------------------------------------------------------------------
def arred(x, casas=0):
    """Arredonda meio para cima, como a casa manda (truncar 61,557 em 61,5 foi defeito apontado
    na auditoria). O `round` do Python arredonda meio para o par, que não é a mesma coisa."""
    v = Decimal(repr(float(x))).quantize(Decimal(1).scaleb(-casas), rounding=ROUND_HALF_UP)
    return int(v) if casas == 0 else float(v)


# ----------------------------------------------------------------------------------------------
# A base: o mesmo caminho do _rodar.py A05, sem escrever nada
# ----------------------------------------------------------------------------------------------
def montar_base():
    dec = json.load(open(os.path.join(R, f"{PID}_indicadores.json"), encoding="utf-8"))
    anos = {str(a) for a in dec["recorte"]["temporadas"]}
    inds = [i for fam in dec["familias"] for i in fam["indicadores"]]

    a01 = {(r["temporada"], r["clube"]): r
           for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                        encoding="utf-8"))}
    tec, cols = {}, None
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            cols = cols or set(r)
            tec[(r["ano"], r["clube"])] = r
    faltam = [i["id"] for i in inds if i["id"] not in cols]
    if faltam:
        raise SystemExit(f"{PID}: estas colunas não existem em serieb_clube_temporada.csv: {faltam}")

    base = []
    for k, a in a01.items():
        if k[0] not in anos or k not in tec:
            continue
        t = tec[k]
        l = {"temporada": k[0], "clube": k[1], "faixa": a["faixa"], "pos": int(a["pos"]),
             "pontos": int(a["pontos"]),
             "trave": a["trave"] == "1", "fronteira": a["fronteira"] == "1"}
        for i in inds:
            v = t.get(i["id"])
            try:
                l[i["id"]] = float(v) if v not in (None, "", "nan") else None
            except ValueError:
                l[i["id"]] = None
        base.append(l)
    base = [l for l in base if all(l[i["id"]] is not None for i in inds)]
    percentil_no_ano(base, [i["id"] for i in inds])
    return dec, inds, anos, a01, base


def rodar_o_metodo(dec, inds, base):
    """As 60 linhas de teste, exatamente como o _rodar.py as produz."""
    rng = np.random.default_rng(SEMENTE)
    sinal = {i["id"]: i["sinal"] for i in inds}
    nome = {i["id"]: i["nome"] for i in inds}
    placar = set(dec.get("lista_branca", {}).get("afetados", []))
    familias = [(f["id"], [i["id"] for i in f["indicadores"]]) for f in dec["familias"]]
    comps = {"SM": (lambda l: l["faixa"] == "Sobe", lambda l: l["faixa"] == "Meio"),
             "ST": (lambda l: l["faixa"] == "Sobe", lambda l: l["trave"]),
             "CM": (lambda l: l["faixa"] == "Cai", lambda l: l["faixa"] == "Meio")}
    comparacoes = [(c["id"], *comps[c["id"]]) for c in dec["comparacoes"] if c["id"] in comps]
    filtros = [("com", lambda l: True), ("sem", lambda l: not l["fronteira"])]
    res = comparar(base, familias, comparacoes, filtros, rng, lambda i: sinal[i])
    for it in res:
        it["nome"] = nome[it["indicador"]]
        it["placar_redescrito"] = it["indicador"] in placar
    return res


def resumo_do_rodar(dec, inds, base, res):
    """O mesmo `A05_resumo.json`, recalculado em memória — para conferir, não para gravar."""
    por = collections.defaultdict(dict)
    for r in res:
        por[(r["comparacao"], r["indicador"])][r["fronteira"]] = r
    dois = {c["id"]: [i for (cp, i), v in por.items() if cp == c["id"]
                      and v.get("com", {}).get("selo") == "firme"
                      and v.get("sem", {}).get("selo") == "firme"]
            for c in dec["comparacoes"] if c["id"] in ("SM", "ST", "CM")}
    faixas = {"Sobe": lambda l: l["faixa"] == "Sobe", "Trave": lambda l: l["trave"],
              "Meio": lambda l: l["faixa"] == "Meio", "Cai": lambda l: l["faixa"] == "Cai"}
    disp = {}
    for i in inds:
        disp[i["id"]] = {}
        for fx, f in faixas.items():
            v = [l[i["id"]] for l in base if f(l)]
            disp[i["id"]][fx] = {"min": round(min(v), 3), "mediana": round(float(np.median(v)), 3),
                                 "max": round(max(v), 3), "amplitude": round(max(v) - min(v), 3)}
    promovidos = [{"temporada": l["temporada"], "clube": l["clube"], "pos": l["pos"],
                   **{i["id"]: round(l[pct(i["id"])]) for i in inds}}
                  for l in sorted(base, key=lambda l: (l["temporada"], l["pos"]))
                  if l["faixa"] == "Sobe"]
    return {"parte": PID, "dispersao_por_faixa": disp, "promovidos": promovidos,
            "firme_nos_dois_cortes": dois,
            "poder_por_desenho": {"16x48": d_minimo(16, 48), "8x32": d_minimo(8, 32),
                                  "16x16": d_minimo(16, 16), "8x7": d_minimo(8, 7)},
            "n": {"total": len(base),
                  "sobe_sf": sum(1 for l in base if l["faixa"] == "Sobe" and not l["fronteira"]),
                  "meio_sf": sum(1 for l in base if l["faixa"] == "Meio" and not l["fronteira"]),
                  "cai_sf": sum(1 for l in base if l["faixa"] == "Cai" and not l["fronteira"])}}


# ----------------------------------------------------------------------------------------------
# A trava: o que este script reproduz tem de ser igual ao que o _rodar.py já tinha deixado no disco
# ----------------------------------------------------------------------------------------------
CAMPOS_DO_TESTE = ["fronteira", "familia", "comparacao", "indicador", "n_a", "n_b", "cru_a",
                   "cru_b", "d", "ic95_d", "p", "d_minimo_80", "q", "selo", "poder_suficiente",
                   "nome", "placar_redescrito"]


def conferir_contra_o_disco(res, resumo):
    """Compara a reprodução com `A05_testes.csv` e `A05_resumo.json`, que o `_rodar.py` gravou
    antes deste script existir. Devolve a lista de diferenças — vazia é o que se espera."""
    difs = []
    caminho = os.path.join(R, f"{PID}_testes.csv")
    if not os.path.exists(caminho):
        difs.append(f"{PID}_testes.csv não existe: não há contra o que conferir")
    else:
        disco = list(csv.DictReader(open(caminho, encoding="utf-8")))
        if len(disco) != len(res):
            difs.append(f"{PID}_testes.csv tem {len(disco)} linhas e a reprodução tem {len(res)}")
        for i, (d, n) in enumerate(zip(disco, res)):
            for c in CAMPOS_DO_TESTE:
                if str(n.get(c)) != (d.get(c) or ""):
                    difs.append(f"{PID}_testes.csv linha {i + 2}, {c}: disco {d.get(c)!r} "
                                f"· reprodução {n.get(c)!r}")
    caminho = os.path.join(R, f"{PID}_resumo.json")
    if not os.path.exists(caminho):
        difs.append(f"{PID}_resumo.json não existe: não há contra o que conferir")
    else:
        disco = json.load(open(caminho, encoding="utf-8"))
        # o ida-e-volta por JSON iguala tipos (int/float, tuplas) antes de comparar
        novo = json.loads(json.dumps(resumo, ensure_ascii=False))
        for chave in sorted(set(disco) | set(novo)):
            if disco.get(chave) != novo.get(chave):
                difs.append(f"{PID}_resumo.json, campo {chave}: reprodução diferente do disco")
    return difs


# ----------------------------------------------------------------------------------------------
# Camada 2: o que o _rodar.py nunca emitiu
# ----------------------------------------------------------------------------------------------
def distancias_da_linha(a01, anos):
    """Para cada clube-temporada, a distância em pontos até a linha mais próxima — a do G4 (o 5º
    colocado, visto de cima ou de baixo) e a do Z4 (o 17º). É a conta do `A01.py`, refeita aqui a
    partir do próprio `A01_clube_temporada.csv`."""
    por_ano = collections.defaultdict(list)
    for (ano, clube), r in a01.items():
        if ano in anos:
            por_ano[ano].append(r)
    dist = {}
    for ano, ls in por_ano.items():
        n = len(ls)
        pts = {int(l["pos"]): int(l["pontos"]) for l in ls}
        p4, p5, p16, p17 = pts[4], pts[5], pts[n - 4], pts[n - 3]
        for l in ls:
            pos, p = int(l["pos"]), int(l["pontos"])
            dg4 = p - p5 if pos <= 4 else p4 - p
            dz4 = p - p17 if pos <= n - 4 else p16 - p
            dist[(ano, l["clube"])] = {"g4": dg4, "z4": dz4, "linha": min(dg4, dz4)}
    return dist


def limiar_da_fronteira(a01, anos, dist):
    """`pts_raspando` é o limiar da definição de Fronteira (G4 ou Z4 a até N pontos da linha).
    Nenhuma saída do `_rodar.py` o escreve, mas a coluna `fronteira` do A01 o codifica, e ele se
    recupera dela: o maior N ainda marcado como fronteira, desde que o menor N de fora seja
    exatamente N+1. Se os dois lados não se encostarem, o limiar é ambíguo e a função devolve
    None — chutar seria digitar o número à mão com outro nome."""
    dentro = [dist[k]["linha"] for k, r in a01.items() if k[0] in anos and r["fronteira"] == "1"]
    fora = [dist[k]["linha"] for k, r in a01.items() if k[0] in anos and r["fronteira"] == "0"]
    if not dentro or not fora:
        return None
    return max(dentro) if min(fora) == max(dentro) + 1 else None


def rodadas_do_turno(anos):
    """`classificacao_rodada.csv`: as temporadas do recorte têm 38 rodadas, o 1º turno são as 19
    primeiras e o 2º as 19 seguintes."""
    por_ano = collections.defaultdict(set)
    with open(os.path.join(R, "classificacao_rodada.csv"), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r["temporada"] in anos:
                por_ano[r["temporada"]].add(int(r["rodada"]))
    totais = {len(s) for s in por_ano.values()} | {max(s) for s in por_ano.values()}
    if len(totais) != 1:
        raise SystemExit(f"{PID}: as temporadas do recorte não têm o mesmo número de rodadas: "
                         f"{ {a: len(s) for a, s in sorted(por_ano.items())} }")
    total = totais.pop()
    return total // 2, total - total // 2


# ----------------------------------------------------------------------------------------------
# Os marcadores
# ----------------------------------------------------------------------------------------------
def marcadores(dec, inds, anos, a01, base, res, resumo):
    dist = distancias_da_linha(a01, anos)
    mediana = lambda v: float(np.median(v))

    sobe = [l for l in base if l["faixa"] == "Sobe"]
    meio = [l for l in base if l["faixa"] == "Meio"]
    cai = [l for l in base if l["faixa"] == "Cai"]
    sobe_sf = [l for l in sobe if not l["fronteira"]]
    meio_sf = [l for l in meio if not l["fronteira"]]
    pouca = [l for l in sobe if l["posse"] < 50]

    r1, r2 = rodadas_do_turno(anos)
    limiar = limiar_da_fronteira(a01, anos, dist)

    n = {
        # -- o recorte e o desenho
        "n_ind": len(inds),
        "n_testes": len(res),
        "n_total": len(base),
        "n_sobe": len(sobe),
        "n_meio": len(meio),
        "n_cai": len(cai),
        # -- posse e passes por faixa, na base inteira
        "posse_sobe_med": arred(mediana([l["posse"] for l in sobe]), 1),
        "posse_meio_med": arred(mediana([l["posse"] for l in meio]), 1),
        "posse_cai_med": arred(mediana([l["posse"] for l in cai]), 1),
        "passes_dif": arred(mediana([l["passes"] for l in sobe])
                            - mediana([l["passes"] for l in meio]), 0),
        # -- o corte sem os times de fronteira
        "posse_sobe_sf": arred(mediana([l["posse"] for l in sobe_sf]), 1),
        "posse_meio_sf": arred(mediana([l["posse"] for l in meio_sf]), 1),
        "sobe_folga": len(sobe_sf),
        "posse_folga_min": arred(min(l["posse"] for l in sobe_sf), 1),
        "posse_folga_max": arred(max(l["posse"] for l in sobe_sf), 1),
        # -- a contagem crua de quem teve mais da metade da bola
        "sobe_mais_bola": sum(1 for l in sobe if l["posse"] > 50),
        "cai_mais_bola": sum(1 for l in cai if l["posse"] > 50),
        "n_pouca_bola": len(pouca),
        "posse_min": arred(min(l["posse"] for l in sobe), 1),
        # -- a linha do acesso, em pontos
        "pts_raspando": limiar,
        "pts_raspando_real": max(dist[(l["temporada"], l["clube"])]["g4"] for l in pouca),
        # -- o turno
        "rodadas_1t": r1,
        "rodadas_2t": r2,
        # -- o poder por desenho
        "d_min_com": d_minimo(len(sobe), len(meio)),
        "d_min_sem": d_minimo(len(sobe_sf), len(meio_sf)),
    }
    nao_calculaveis = [k for k, v in n.items() if v is None]
    for k in nao_calculaveis:
        del n[k]
    return n, nao_calculaveis, pouca, dist


# ----------------------------------------------------------------------------------------------
def main():
    print(f"=== {PID} — os números da parte, calculados e gravados ===")
    dec, inds, anos, a01, base = montar_base()
    print(f"  base: {len(base)} clube-temporadas · {len({l['clube'] for l in base})} clubes "
          f"· temporadas {sorted(anos)}")
    res = rodar_o_metodo(dec, inds, base)
    resumo = resumo_do_rodar(dec, inds, base, res)

    print(f"\n  TRAVA — reprodução do que o _rodar.py A05 já tinha deixado no disco:")
    difs = conferir_contra_o_disco(res, resumo)
    if difs:
        print(f"    {len(difs)} DIFERENÇA(S) — a reprodução NÃO bate com o disco:")
        for d in difs[:20]:
            print(f"      {d}")
        raise SystemExit(f"{PID}: a reprodução divergiu do que já estava no disco. Nada gravado.")
    print(f"    {len(res)} linhas de {PID}_testes.csv e {PID}_resumo.json inteiro: idênticos.")

    n, nao_calculaveis, pouca, dist = marcadores(dec, inds, anos, a01, base, res, resumo)

    json.dump({"parte": PID, "gerado_por": f"scripts/{PID}.py", "gerado_em": GERADO_EM,
               "semente": SEMENTE,
               "nota": "Conferência dos números publicados em A05.json, não substituição. "
                       "Valores na casa decimal da tela, arredondados (nunca truncados).",
               "numeros": n},
              open(NUMEROS_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"\n  {os.path.basename(NUMEROS_JSON)}: {len(n)} marcadores gravados")

    if nao_calculaveis:
        print(f"    NÃO CALCULÁVEIS ({len(nao_calculaveis)}): {', '.join(nao_calculaveis)}")

    # -- a conferência contra o publicado. Divergência é achado; este script não conserta nada.
    pub = json.load(open(os.path.join(R, f"{PID}.json"), encoding="utf-8")).get("numeros", {})
    divergem = [(m, pub[m], n[m]) for m in sorted(set(pub) & set(n))
                if abs(float(n[m]) - float(pub[m])) > 1e-9]
    print(f"\n  CONTRA O PUBLICADO em {PID}.json ({len(pub)} marcadores):")
    print(f"    {len(set(pub) & set(n))} conferidos · {len(sorted(set(pub) - set(n)))} sem cálculo "
          f"aqui: {', '.join(sorted(set(pub) - set(n))) or 'nenhum'}")
    if divergem:
        for m, p, c in divergem:
            print(f"    DIVERGE  {m}: publicado {p} · o script dá {c}")
    else:
        print("    nenhuma divergência")

    print(f"\n  os {len(pouca)} promovidos com menos da metade da bola, com a distância ao 5º:")
    for l in sorted(pouca, key=lambda l: (l["temporada"], l["pos"])):
        print(f"    {l['temporada']} {l['clube']:16s} posse {l['posse']:6.3f} "
              f"· {dist[(l['temporada'], l['clube'])]['g4']} ponto(s) do 5º")
    return n


if __name__ == "__main__":
    main()
