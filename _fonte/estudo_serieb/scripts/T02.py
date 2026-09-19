#!/usr/bin/env python3
"""T02 — quais treinadores mantêm seus times mais rodadas no G4.

Junta as duas partes que já existem:
  - `T01_rodada_treinador.csv` (A quem pertence cada rodada; a regra do interino que aninha
    dentro do efetivo mora no T01, não aqui.)
  - `classificacao_rodada.csv` (Em que posição o time estava no fim de cada rodada — A01.)

Recorte: **2022 a 2026**, como o A01 (decisão do dono em 17/09).

## O que é "rodada no G4"

A posição do time no fim de uma rodada que aquele treinador comandou. Conta-se de dois jeitos,
como o CLAUDE.md pede: **todas as rodadas** e **só da 10ª em diante** — antes disso a tabela
oscila demais para significar alguma coisa.

## Mínimo de 10 rodadas

Passagem com menos de 10 rodadas fica fora do ranking, mas continua na base, marcada. Sem isso o
topo vira um interino que pegou três jogos bons.

## Pontos por jogo e xG

Os pontos saem da diferença da tabela entre rodadas consecutivas (A01), não de uma conta nova.
O xG sofrido não existe como coluna em `serieb_jogos.csv` — mas o mesmo jogo aparece uma vez por
time, então o **xG do adversário é o xG sofrido**. As duas linhas são pareadas por data e por
adversário.

## O contexto obrigatório

Todo resultado vem com a posição do time quando o treinador assumiu e quando saiu, e com o valor
do elenco (`tm_valor_total`, do Transfermarkt) como descrição ao lado — nunca como desconto.

Uso:
    python3 _fonte/estudo_serieb/scripts/T02.py
"""
import collections
import csv
import json
import os
import re
import statistics as st

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")

TEMPORADAS = {2022, 2023, 2024, 2025, 2026}
EM_CURSO = 2026
MIN_RODADAS = 10          # o mínimo do CLAUDE.md
DEPOIS_DA = 10            # "só a partir da 10ª rodada"


def ler_xg():
    """(temporada, clube, data) -> (xg_pro, xg_contra). O xG contra é o xG do adversário."""
    linhas = []
    for arq in ("serieb_jogos.csv", "serieb_jogos_2018_2021.csv"):
        caminho = os.path.join(DADOS, arq)
        if not os.path.exists(caminho):
            continue
        with open(caminho, encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                if r.get("Competição") != "Brazil. Serie B":
                    continue
                m = re.match(r"(\d{4})-\d{2}-\d{2}", r["Data"] or "")
                if not m or int(m.group(1)) not in TEMPORADAS:
                    continue
                try:
                    xg = float(r["Golos esperados"])
                except (TypeError, ValueError):
                    xg = None
                linhas.append({"data": r["Data"][:10], "clube": r["Equipa"],
                               "adv": r["adversario"], "xg": xg})
    por = {}
    indice = {(l["data"], l["clube"]): l for l in linhas}
    for l in linhas:
        outro = indice.get((l["data"], l["adv"]))
        por[(l["data"], l["clube"])] = (l["xg"], outro["xg"] if outro else None)
    return por


def main():
    # --- entradas ---
    donos = [r for r in csv.DictReader(open(os.path.join(R, "T01_rodada_treinador.csv"),
                                            encoding="utf-8"))
             if int(r["temporada"]) in TEMPORADAS]
    tabela = {}
    for r in csv.DictReader(open(os.path.join(R, "classificacao_rodada.csv"), encoding="utf-8")):
        tabela[(int(r["temporada"]), r["clube"], int(r["rodada"]))] = r
    xg = ler_xg()
    valor = {}
    with open(os.path.join(DADOS, "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            ano = next((r[k] for k in ("ano", "temporada", "season") if k in r), None)
            clube = next((r[k] for k in ("clube", "time", "Equipa") if k in r), None)
            if ano and clube:
                try:
                    valor[(int(float(ano)), clube)] = float(r.get("tm_valor_total") or 0) or None
                except ValueError:
                    pass

    # --- uma linha por rodada, com posição e pontos ---
    por_passagem = collections.defaultdict(list)
    sem_tabela = 0
    for d in donos:
        ano, clube, rod = int(d["temporada"]), d["clube_wyscout"], int(d["rodada"])
        t = tabela.get((ano, clube, rod))
        if not t:
            sem_tabela += 1
            continue
        ant = tabela.get((ano, clube, rod - 1))
        pts = int(t["pontos"]) - (int(ant["pontos"]) if ant else 0)
        xp, xc = xg.get((d["data"], clube), (None, None))
        por_passagem[(d["treinador"], clube, ano, d["inicio"])].append({
            "rodada": rod, "pos": int(t["pos"]), "dist_g4": int(t["dist_g4"]),
            "pontos": pts, "xg_pro": xp, "xg_contra": xc,
            "interino": d["interino"], "incompleta": t["base_incompleta"],
        })
    if sem_tabela:
        print(f"  {sem_tabela} rodadas sem linha na tabela do A01 (fora do recorte)")

    # --- a passagem agregada ---
    linhas = []
    for (tec, clube, ano, ini), rs in por_passagem.items():
        rs.sort(key=lambda x: x["rodada"])
        tarde = [x for x in rs if x["rodada"] >= DEPOIS_DA]
        xgs = [(x["xg_pro"], x["xg_contra"]) for x in rs
               if x["xg_pro"] is not None and x["xg_contra"] is not None]
        linhas.append({
            "treinador": tec, "clube": clube, "temporada": ano, "inicio": ini,
            "interino": rs[0]["interino"],
            "rodadas": len(rs), "rodada_1a": rs[0]["rodada"], "rodada_ultima": rs[-1]["rodada"],
            "no_g4": sum(1 for x in rs if x["pos"] <= 4),
            "pct_g4": round(100 * sum(1 for x in rs if x["pos"] <= 4) / len(rs), 1),
            "rodadas_apos_10": len(tarde),
            "no_g4_apos_10": sum(1 for x in tarde if x["pos"] <= 4),
            "pct_g4_apos_10": (round(100 * sum(1 for x in tarde if x["pos"] <= 4) / len(tarde), 1)
                               if tarde else None),
            "pontos": sum(x["pontos"] for x in rs),
            "ppj": round(sum(x["pontos"] for x in rs) / len(rs), 2),
            "pos_ao_assumir": rs[0]["pos"], "pos_ao_sair": rs[-1]["pos"],
            "dist_g4_ao_assumir": rs[0]["dist_g4"], "dist_g4_ao_sair": rs[-1]["dist_g4"],
            "xg_saldo_pj": (round(sum(a - b for a, b in xgs) / len(xgs), 2) if xgs else None),
            "xg_jogos": len(xgs),
            "valor_elenco_eur": valor.get((ano, clube)),
            "base_incompleta": max(int(x["incompleta"]) for x in rs),
            "em_curso": int(ano == EM_CURSO),
            "no_ranking": int(len(rs) >= MIN_RODADAS and rs[0]["interino"] != "1"),
        })
    linhas.sort(key=lambda r: (-r["pct_g4"], -r["rodadas"]))

    # --- o mesmo time, com outros treinadores, no mesmo ano ---
    por_ct = collections.defaultdict(list)
    for l in linhas:
        por_ct[(l["clube"], l["temporada"])].append(l)
    for l in linhas:
        outros = [o for o in por_ct[(l["clube"], l["temporada"])] if o is not l]
        rod = sum(o["rodadas"] for o in outros)
        l["ppj_outros_mesmo_time"] = (round(sum(o["pontos"] for o in outros) / rod, 2)
                                      if rod else None)
        l["rodadas_outros"] = rod

    def grava(nome, ls, campos=None):
        with open(os.path.join(R, nome), "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=campos or list(ls[0]))
            w.writeheader(); w.writerows(ls)
        print(f"  {nome}: {len(ls)} linhas")

    print("gravando")
    grava("T02_passagem.csv", linhas)

    # --- o treinador, somando as passagens que entram no ranking ---
    porte = collections.defaultdict(list)
    for l in linhas:
        if l["no_ranking"]:
            porte[l["treinador"]].append(l)
    tec = []
    for nome, ls in porte.items():
        rod = sum(l["rodadas"] for l in ls)
        g4 = sum(l["no_g4"] for l in ls)
        tarde = sum(l["rodadas_apos_10"] for l in ls)
        g4t = sum(l["no_g4_apos_10"] for l in ls)
        xgs = [l for l in ls if l["xg_saldo_pj"] is not None]
        tec.append({
            "treinador": nome, "passagens": len(ls),
            "clubes": len({l["clube"] for l in ls}),
            "temporadas": " ".join(str(x) for x in sorted({l["temporada"] for l in ls})),
            "rodadas": rod, "no_g4": g4, "pct_g4": round(100 * g4 / rod, 1),
            "rodadas_apos_10": tarde,
            "pct_g4_apos_10": round(100 * g4t / tarde, 1) if tarde else None,
            "ppj": round(sum(l["pontos"] for l in ls) / rod, 2),
            "xg_saldo_pj": (round(sum(l["xg_saldo_pj"] * l["xg_jogos"] for l in xgs)
                                  / sum(l["xg_jogos"] for l in xgs), 2) if xgs else None),
            "valor_elenco_mediano_eur": (st.median([l["valor_elenco_eur"] for l in ls
                                                    if l["valor_elenco_eur"]])
                                         if any(l["valor_elenco_eur"] for l in ls) else None),
        })
    tec.sort(key=lambda t: (-t["pct_g4"], -t["rodadas"]))
    grava("T02_treinador.csv", tec)

    fora = [l for l in linhas if not l["no_ranking"]]
    com_g4 = [t for t in tec if t["no_g4"] > 0]
    repete = [t for t in tec if t["clubes"] >= 2 and t["no_g4"] > 0]
    resumo = {
        "temporadas": sorted(TEMPORADAS), "min_rodadas": MIN_RODADAS,
        "passagens": len(linhas), "no_ranking": len(linhas) - len(fora),
        "fora_do_ranking": len(fora),
        "treinadores_no_ranking": len(tec), "com_alguma_rodada_no_g4": len(com_g4),
        "repetem_g4_em_clubes_diferentes": len(repete),
        "top": tec[:12],
        "repete": [{"treinador": t["treinador"], "clubes": t["clubes"], "pct_g4": t["pct_g4"]}
                   for t in sorted(repete, key=lambda t: -t["pct_g4"])[:10]],
    }
    json.dump(resumo, open(os.path.join(R, "T02_resumo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"\n{len(linhas)} passagens-temporada · {len(linhas) - len(fora)} no ranking "
          f"(10+ rodadas, sem interino) · {len(fora)} sinalizadas")
    print(f"{len(tec)} treinadores no ranking · {len(com_g4)} com alguma rodada no G4 · "
          f"{len(repete)} com G4 em mais de um clube\n")
    print(f"{'treinador':22s} {'cl':>2s} {'rod':>4s} {'G4':>4s} {'%G4':>6s} {'%G4≥10':>7s} "
          f"{'ppj':>5s} {'xG/j':>6s}")
    for t in tec[:12]:
        print(f"{t['treinador'][:22]:22s} {t['clubes']:2d} {t['rodadas']:4d} {t['no_g4']:4d} "
              f"{t['pct_g4']:6.1f} {(t['pct_g4_apos_10'] or 0):7.1f} {t['ppj']:5.2f} "
              f"{(t['xg_saldo_pj'] if t['xg_saldo_pj'] is not None else 0):6.2f}")


if __name__ == "__main__":
    main()
