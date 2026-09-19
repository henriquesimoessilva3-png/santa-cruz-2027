#!/usr/bin/env python3
"""J01 — quem tem minutagem alta e regular em cada posição, e quanto da minutagem baixa é lesão.

Parte da aba Minutagem Série B (`dados/minutagem_serieb.json`, 3.864 linhas de jogador + clube +
temporada) e acrescenta o que o CLAUDE.md pede: lesões, regularidade, a faixa do time, e a
**distribuição da minutagem por posição ANTES de fixar o corte** — o corte de 60% do md é declarado
como "a ajustar em J01", e é aqui que se ajusta, olhando a distribuição e não o resultado.

## A fatia de minutos

Vem pronta do gerador da aba: minutos do jogador ÷ tempo que o time jogou, e esse tempo é a soma dos
minutos do elenco ÷ 11 — não é jogos × 90, porque o Wyscout conta os acréscimos. Por isso há fatias
acima de 100% (um titular absoluto faz ~102 min por jogo).

## Lesão: a ponte entre as bases

`serieb_lesoes.csv` é do Transfermarkt e tem `id_jogador`; a minutagem é do Wyscout e tem só o nome.
A ponte passa por `serieb_elencos.csv`, que tem os dois lados (`id_jogador` e `jogador`), casando por
nome normalizado + clube + ano. Caso ambíguo é LISTADO, nunca adivinhado, como o CLAUDE.md manda.

## A ressalva que o md pede

Minutagem alta em time do Cai pode ser falta de opção, não qualidade. A faixa do time entra na base
para a leitura poder separar as duas coisas.

Uso:
    python3 _fonte/estudo_serieb/scripts/J01.py
"""
import collections
import csv
import json
import os
import re
import statistics as st
import unicodedata

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
ANOS = {"2022", "2023", "2024", "2025", "2026"}


def norm(t):
    t = unicodedata.normalize("NFD", str(t or ""))
    t = "".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9 ]", " ", t).strip()


def main():
    mn = json.load(open(os.path.join(DADOS, "minutagem_serieb.json"), encoding="utf-8"))
    C = {c: i for i, c in enumerate(mn["colunas"])}
    faixa = {(r["temporada"], r["clube"]): r["faixa"]
             for r in csv.DictReader(open(os.path.join(R, "A01_clube_temporada.csv"),
                                          encoding="utf-8"))}

    # ponte: nome+clube+ano -> id do Transfermarkt, via elencos
    elencos = collections.defaultdict(list)
    with open(os.path.join(DADOS, "serieb_elencos.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            elencos[(norm(r["jogador"]), r["ano"])].append(r["id_jogador"])
    # lesões por (id, ano)
    les = collections.defaultdict(lambda: {"dias": 0, "jogos": 0, "n": 0})
    with open(os.path.join(DADOS, "serieb_lesoes.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            for ano in ANOS:
                col = f"dias_{ano}"
                try:
                    d = float(r.get(col) or 0)
                except ValueError:
                    d = 0
                if d > 0:
                    k = (r["id_jogador"], ano)
                    les[k]["dias"] += d
                    les[k]["n"] += 1
                    try:
                        les[k]["jogos"] += float(r.get("jogos_perdidos") or 0)
                    except ValueError:
                        pass

    linhas, ambiguos, sem_id = [], [], 0
    for l in mn["linhas"]:
        ano = str(l[C["ano"]])
        if ano not in ANOS:
            continue
        nome, time = l[C["jogador"]], l[C["time"]]
        ids = set(elencos.get((norm(nome), ano), []))
        if len(ids) > 1:
            ambiguos.append({"jogador": nome, "ano": ano, "time": time, "ids": sorted(ids)})
            idj = None
        elif ids:
            idj = ids.pop()
        else:
            idj = None
            sem_id += 1
        d = les.get((idj, ano), {}) if idj else {}
        linhas.append({"ano": ano, "jogador": nome, "time": time,
                       "posicao": l[C["posicao"]], "grupo": l[C["grupo"]],
                       "idade": l[C["idade"]], "jogos": l[C["jogos"]],
                       "minutos": l[C["minutos"]], "fatia_pct": l[C["fatia_pct"]],
                       "time_hoje": l[C["time_hoje"]],
                       "faixa_do_time": faixa.get((ano, time)),
                       "id_tm": idj, "lesao_dias": d.get("dias"), "lesao_n": d.get("n"),
                       "lesao_jogos_perdidos": d.get("jogos")})
    print(f"base: {len(linhas)} jogador-temporadas · {len({l['jogador'] for l in linhas})} nomes")
    print(f"  sem id do Transfermarkt: {sem_id} · nomes ambíguos (2+ ids): {len(ambiguos)}")
    print(f"  com lesão registrada: {sum(1 for l in linhas if l['lesao_dias'])}")

    # regularidade: fatia alta em quantas das últimas 3 temporadas do jogador
    por_nome = collections.defaultdict(dict)
    for l in linhas:
        if l["fatia_pct"] is not None:
            por_nome[l["jogador"]][l["ano"]] = l["fatia_pct"]

    # ---- a DISTRIBUIÇÃO por posição, antes de fixar o corte ----
    dist = {}
    for g in sorted({l["grupo"] for l in linhas if l["grupo"]}):
        v = [l["fatia_pct"] for l in linhas if l["grupo"] == g and l["fatia_pct"] is not None]
        dist[g] = {"n": len(v),
                   **{f"p{p}": round(float(np.percentile(v, p)), 1)
                      for p in (10, 25, 50, 75, 90)},
                   "max": round(max(v), 1),
                   "acima_de_60": round(100 * sum(1 for x in v if x >= 60) / len(v), 1),
                   "acima_de_50": round(100 * sum(1 for x in v if x >= 50) / len(v), 1),
                   "acima_de_70": round(100 * sum(1 for x in v if x >= 70) / len(v), 1)}
    todos = [l["fatia_pct"] for l in linhas if l["fatia_pct"] is not None]

    # com o corte escolhido, quantos por posição e por temporada
    CORTE = 60
    for l in linhas:
        f = l["fatia_pct"]
        l["alta"] = int(f is not None and f >= CORTE)
        anos_alta = sum(1 for a, x in por_nome[l["jogador"]].items()
                        if int(a) in range(int(l["ano"]) - 2, int(l["ano"]) + 1) and x >= CORTE)
        anos_tem = sum(1 for a in por_nome[l["jogador"]]
                       if int(a) in range(int(l["ano"]) - 2, int(l["ano"]) + 1))
        l["temporadas_alta_ult3"] = anos_alta
        l["temporadas_com_dado_ult3"] = anos_tem
        l["regular"] = int(anos_alta >= 2 and anos_tem >= 2)

    # ---- quanto da minutagem baixa é lesão ----
    baixa = [l for l in linhas if l["fatia_pct"] is not None and l["fatia_pct"] < CORTE]
    baixa_com_id = [l for l in baixa if l["id_tm"]]
    com_lesao = [l for l in baixa_com_id if l["lesao_dias"]]
    alta_com_id = [l for l in linhas if l["alta"] and l["id_tm"]]
    alta_lesao = [l for l in alta_com_id if l["lesao_dias"]]

    # ---- minutagem alta em time do Cai: falta de opção? ----
    por_faixa = {}
    for fx in ("Sobe", "Meio", "Cai"):
        g = [l for l in linhas if l["faixa_do_time"] == fx and l["fatia_pct"] is not None]
        if g:
            por_faixa[fx] = {"n": len(g),
                             "altos_por_clube_temporada": round(
                                 sum(1 for l in g if l["alta"]) /
                                 len({(l["ano"], l["time"]) for l in g}), 1),
                             "fatia_mediana": round(st.median(l["fatia_pct"] for l in g), 1)}

    with open(os.path.join(R, "base_jogador_temporada.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(linhas[0]))
        w.writeheader(); w.writerows(linhas)
    json.dump({"corte_escolhido": CORTE,
               "distribuicao_por_posicao": dist,
               "geral": {"n": len(todos),
                         **{f"p{p}": round(float(np.percentile(todos, p)), 1)
                            for p in (10, 25, 50, 75, 90)}},
               "lesao": {"minutagem_baixa": len(baixa), "com_id": len(baixa_com_id),
                         "com_lesao": len(com_lesao),
                         "pct_da_baixa_com_lesao": round(100 * len(com_lesao) / len(baixa_com_id), 1),
                         "dias_medianos_quando_tem": round(st.median(l["lesao_dias"] for l in com_lesao), 0),
                         "alta_com_lesao_pct": round(100 * len(alta_lesao) / len(alta_com_id), 1),
                         "leitura": "a fatia de minutagem baixa que tem lesão registrada, contra a fatia da alta que também tem — a diferença é o quanto a lesão explica"},
               "por_faixa_do_time": por_faixa,
               "regulares": sum(1 for l in linhas if l["regular"]),
               "altos": sum(1 for l in linhas if l["alta"]),
               "ambiguos": ambiguos[:40], "n_ambiguos": len(ambiguos), "sem_id": sem_id},
              open(os.path.join(R, "J01_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{'='*92}\nA DISTRIBUIÇÃO DA FATIA DE MINUTOS, POR POSIÇÃO (antes de fixar o corte)\n{'='*92}")
    print(f"{'posição':12s} {'n':>5s} {'p10':>6s} {'p25':>6s} {'mediana':>8s} {'p75':>6s} {'p90':>6s} "
          f"{'máx':>6s} {'≥50%':>6s} {'≥60%':>6s} {'≥70%':>6s}")
    for g, d in dist.items():
        print(f"{g:12s} {d['n']:5d} {d['p10']:6.1f} {d['p25']:6.1f} {d['p50']:8.1f} {d['p75']:6.1f} "
              f"{d['p90']:6.1f} {d['max']:6.1f} {d['acima_de_50']:5.1f}% {d['acima_de_60']:5.1f}% "
              f"{d['acima_de_70']:5.1f}%")
    print(f"\n{'='*92}\nQUANTO DA MINUTAGEM BAIXA É LESÃO\n{'='*92}")
    j = json.load(open(os.path.join(R, "J01_resumo.json"), encoding="utf-8"))["lesao"]
    print(f"  minutagem baixa (< {CORTE}%): {j['minutagem_baixa']} · com id do Transfermarkt: {j['com_id']}")
    print(f"  destes, com lesão registrada: {j['com_lesao']} ({j['pct_da_baixa_com_lesao']}%), "
          f"mediana de {j['dias_medianos_quando_tem']:.0f} dias")
    print(f"  para comparar: dos de minutagem ALTA, {j['alta_com_lesao_pct']}% também tiveram lesão")
    print(f"\n{'='*92}\nMINUTAGEM ALTA POR FAIXA DO TIME (falta de opção?)\n{'='*92}")
    for fx, d in por_faixa.items():
        print(f"  {fx:5s} {d['altos_por_clube_temporada']:4.1f} jogadores de fatia alta por "
              f"clube-temporada · fatia mediana {d['fatia_mediana']}%")
    print(f"\n  regulares (fatia alta em 2+ das últimas 3 temporadas): "
          f"{sum(1 for l in linhas if l['regular'])} de {len(linhas)}")


if __name__ == "__main__":
    main()
