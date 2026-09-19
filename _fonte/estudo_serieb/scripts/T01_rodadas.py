#!/usr/bin/env python3
"""T01, passo 2 — quantas RODADAS de Serie B cada passagem de treinador comandou.

O `jogos_tm` que veio do Transfermarkt conta TODAS as competicoes (estadual, Copa do Brasil,
serie). Para o estudo, o que vale e a rodada de Serie B. Ela sai aqui: cruzando a janela de
datas de cada passagem com os jogos de `dados/serieb_jogos.csv` e `serieb_jogos_2018_2021.csv`,
filtrados por `Competição == "Brazil. Serie B"`.

## A ponte de nome de clube

O Transfermarkt escreve a razao social ("EC Juventude", "Grêmio FBPA") e o Wyscout escreve o
nome curto ("Juventude", "Grêmio"). Nao existia ponte de CLUBE no repositorio — a de
`_fonte/gerar_raio_ref.py` e de JOGADOR. Esta ponte e construida por regra e **conferida pelas
temporadas**: dois clubes so sao o mesmo se jogaram a Serie B nos mesmos anos. Os anos mandam
mais que o nome, e foi isso que separou os dois Botafogos:

    "Botafogo FC" (Ribeirao Preto) -> "Botafogo-SP"   6 dos 7 anos coincidem
    "Botafogo FR" (Rio de Janeiro) -> "Botafogo"      so 2021

Pelo nome sozinho os dois casariam com "Botafogo". Quem nao tiver decisao clara e LISTADO,
nunca adivinhado.

## Passagem sem data de saida

O Transfermarkt deixa a celula "Fim de periodo" VAZIA em mais casos do que so o treinador
atual: no Botafogo-SP aparecem Claudio Tencati (desde 24/11/2025) e Regis Angeli (desde
08/07/2025) os dois "em exercicio", e sem conserto os dois comandariam as 27 rodadas de 2026 —
a temporada contada em dobro. Duas regras resolvem, e as duas sao conferiveis:

  1. **Passagem com `Jogos` = 0 no Transfermarkt nao comanda rodada nenhuma.** Foi o caso do
     Regis Angeli: 436 dias no cargo e zero jogos. Fica na base, marcada, fora da conta.
  2. **O interino ANINHA dentro do efetivo; nao o sucede.** Foi o erro da primeira versao:
     fechar a passagem do efetivo na chegada do interino tirou 23 das 27 rodadas de Mauricio
     Barbieri no Juventude de 2026, porque Gerson Ramos assumiu por dois jogos no meio dela.
     Entao: passagem EFETIVA aberta fecha na abertura da proxima EFETIVA; passagem INTERINA
     aberta fecha na proxima passagem de qualquer tipo.
  3. **Cada jogo tem um dono so.** Em vez de somar janelas, cada jogo de Serie B e atribuido a
     UM treinador: o interino, se a data cair na janela dele; senao o efetivo. Assim nao existe
     jogo contado duas vezes, e o que sobra sem dono e buraco de verdade na fonte.

A prova das regras e a COBERTURA: somadas as rodadas das passagens de um clube-temporada, o
total tem de dar as rodadas daquele ano. Ver o que o script imprime no fim.

## Passagem que atravessa a virada do ano

Conta so as rodadas dentro da janela. Uma passagem que comeca em outubro e acaba em marco
comanda o fim de uma Serie B e o comeco de outra: ela vira DUAS linhas na base por temporada,
uma por ano, que e o que T02 precisa para falar de "rodadas no G4".
"""
import collections
import csv
import datetime as dt
import json
import os
import re
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
RESULTADOS = os.path.join(ESTUDO, "resultados")
DADOS = os.path.join(RAIZ, "dados")

PASSAGENS = os.path.join(RESULTADOS, "base_passagens.csv")
CLUBES = os.path.join(RESULTADOS, "T01_clubes.json")
PONTE = os.path.join(RESULTADOS, "T01_ponte_clubes.json")
SAIDA = os.path.join(RESULTADOS, "base_passagens_temporada.csv")
SAI_RODADA = os.path.join(RESULTADOS, "T01_rodada_treinador.csv")

LIXO = {"ec", "fc", "sc", "aa", "ad", "ca", "cr", "ge", "fbpa", "fec", "ac", "se", "esporte",
        "clube", "futebol", "associacao", "regatas", "do", "de", "da", "recreativo",
        "esportivo", "fr"}
UF = {"mineiro": "mg", "paranaense": "pr", "goianiense": "go", "paulista": "sp",
      "catarinense": "sc", "gaucho": "rs", "pernambucano": "pe", "cearense": "ce",
      "baiano": "ba", "carioca": "rj"}


def norm(t):
    t = unicodedata.normalize("NFD", str(t or ""))
    t = "".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9 ]", " ", t)


def chave(n):
    return " ".join(UF.get(t, t) for t in norm(n).split() if t and t not in LIXO)


def jogos_serieb():
    """(clube_wyscout, data) de cada jogo de Serie B, 2018 a 2026."""
    saida = collections.defaultdict(list)
    for arq in ("serieb_jogos.csv", "serieb_jogos_2018_2021.csv"):
        caminho = os.path.join(DADOS, arq)
        if not os.path.exists(caminho):
            continue
        with open(caminho, encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                if r.get("Competição") != "Brazil. Serie B":
                    continue
                m = re.search(r"(\d{4})-(\d{2})-(\d{2})", r.get("Data") or "")
                if not m:
                    m2 = re.search(r"(\d{1,2})/(\d{1,2})/(\d{4})", r.get("Data") or "")
                    if not m2:
                        continue
                    d = dt.date(int(m2.group(3)), int(m2.group(2)), int(m2.group(1)))
                else:
                    d = dt.date(*(int(x) for x in m.groups()))
                saida[r["Equipa"]].append(d)
    for k in saida:
        saida[k].sort()
    return saida


def construir_ponte(jogos, tm_anos):
    """Nome do Transfermarkt -> nome do Wyscout. Os ANOS decidem; o nome so filtra."""
    wy_anos = {c: {d.year for d in ds} for c, ds in jogos.items()}
    ponte, duvidas = {}, []
    for tmn, anos in sorted(tm_anos.items()):
        cands = []
        for wyn, wanos in wy_anos.items():
            if not (set(chave(tmn).split()) & set(chave(wyn).split())):
                continue
            jac = len(anos & wanos) / max(1, len(anos | wanos))
            cands.append((round(jac, 3), 1 if chave(wyn) == chave(tmn) else 0, wyn))
        # ANOS primeiro, nome depois: pelo nome, "Botafogo FC" casaria com "Botafogo" (RJ).
        cands.sort(reverse=True)
        if not cands or cands[0][0] < 0.5:
            duvidas.append((tmn, sorted(anos), cands[:3]))
            continue
        if len(cands) > 1 and cands[0][0] - cands[1][0] < 0.15:
            duvidas.append((tmn, sorted(anos), cands[:3]))
            continue
        ponte[tmn] = cands[0][2]
    return ponte, duvidas


def main():
    jogos = jogos_serieb()
    cl = json.load(open(CLUBES, encoding="utf-8"))
    tm_anos = collections.defaultdict(set)
    for ano, ids in cl["por_ano"].items():
        for vid in ids:
            tm_anos[cl["nomes"][vid]].add(int(ano))

    ponte, duvidas = construir_ponte(jogos, tm_anos)
    print(f"ponte de clube: {len(ponte)} de {len(tm_anos)}")
    if duvidas:
        print("  SEM DECISAO CLARA (nao adivinhados, ficam fora da conta):")
        for n, anos, c in duvidas:
            print(f"    {n} anos={anos} candidatos={c}")
    sobra = sorted(set(jogos) - set(ponte.values()))
    if sobra:
        print(f"  clubes do Wyscout sem par: {sobra}")
    json.dump(ponte, open(PONTE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    todas = [p for p in csv.DictReader(open(PASSAGENS, encoding="utf-8"))]

    # Regra 1: quem nao dirigiu jogo nenhum sai da conta (fica marcado no relatorio).
    sem_jogo = [p for p in todas if (p["jogos_tm"] or "0").strip() in ("", "0")]
    todas = [p for p in todas if p not in sem_jogo]

    # Regra 2: fechar as pontas soltas, efetivas com efetivas.
    por_clube = collections.defaultdict(list)
    for p in todas:
        por_clube[p["clube"]].append(p)
    fechadas = 0
    for clube, ps in por_clube.items():
        ps.sort(key=lambda r: r["inicio"])
        efetivas = [p for p in ps if p["interino"] != "1"]
        for grupo, seguintes in ((efetivas, efetivas), ([p for p in ps if p["interino"] == "1"], ps)):
            for p in grupo:
                if p["fim"]:
                    continue
                depois = [q["inicio"] for q in seguintes if q["inicio"] > p["inicio"]]
                if depois:
                    p["fim"] = min(depois)
                    p["fim_inferido"] = "1"
                    fechadas += 1
    print(f"  passagens sem saida fechadas pela seguinte: {fechadas}")
    print(f"  passagens com 0 jogos no Transfermarkt, fora da conta: {len(sem_jogo)}"
          + (f" (ex.: {', '.join(x['treinador'] for x in sem_jogo[:3])})" if sem_jogo else ""))

    # Regra 3: cada jogo tem um dono so — o interino manda na janela dele.
    sem_ponte = collections.Counter()
    dono = collections.defaultdict(dict)   # (clube_wy, data) -> passagem
    orfaos = collections.Counter()
    for clube, ps in por_clube.items():
        wyn = ponte.get(clube)
        if not wyn:
            sem_ponte[clube] += len(ps)
            continue
        for d in jogos[wyn]:
            cobre = [p for p in ps
                     if dt.date.fromisoformat(p["inicio"]) <= d
                     <= (dt.date.fromisoformat(p["fim"]) if p["fim"] else dt.date.today())]
            if not cobre:
                orfaos[(wyn, d.year)] += 1
                continue
            interinos = [p for p in cobre if p["interino"] == "1"]
            escolhido = (max(interinos, key=lambda p: p["inicio"]) if interinos
                         else max(cobre, key=lambda p: p["inicio"]))
            dono[wyn][d] = escolhido

    linhas = []
    for wyn, mapa in dono.items():
        por_passagem = collections.defaultdict(list)
        for d, p in mapa.items():
            por_passagem[(id(p), d.year)].append(d)
        vistos = {id(p): p for p in mapa.values()}
        for (pid, ano), ds in por_passagem.items():
            p = vistos[pid]
            ds.sort()
            no_ano = [d for d in jogos[wyn] if d.year == ano]
            linhas.append({
                "treinador": p["treinador"], "clube": p["clube"], "clube_wyscout": wyn,
                "id_clube": p["id_clube"], "temporada": ano,
                "interino": p["interino"], "em_curso": p["em_curso"],
                "inicio": p["inicio"], "fim": p["fim"],
                "rodadas": len(ds),
                "rodada_1a": no_ano.index(ds[0]) + 1,
                "rodada_ultima": no_ano.index(ds[-1]) + 1,
                "rodadas_no_ano": len(no_ano),
                "jogos_tm_todas_competicoes": p["jogos_tm"],
                "ppj_tm_todas_competicoes": p["ppj_tm"],
                "fim_inferido": p.get("fim_inferido", "0"),
            })
    # Uma linha por RODADA, com o dono dela: e o que o T02 consome, para a regra do interino
    # (que aninha dentro do efetivo) ficar num lugar so, aqui.
    por_rodada = []
    for wyn, mapa in dono.items():
        for d, p in sorted(mapa.items()):
            no_ano = [x for x in jogos[wyn] if x.year == d.year]
            por_rodada.append({
                "temporada": d.year, "clube_wyscout": wyn, "rodada": no_ano.index(d) + 1,
                "data": d.isoformat(), "treinador": p["treinador"], "clube_tm": p["clube"],
                "interino": p["interino"], "inicio": p["inicio"], "fim": p["fim"],
                "fim_inferido": p.get("fim_inferido", "0"),
            })
    por_rodada.sort(key=lambda r: (r["clube_wyscout"], r["temporada"], r["rodada"]))
    with open(SAI_RODADA, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(por_rodada[0]))
        w.writeheader(); w.writerows(por_rodada)
    print(f"  {os.path.basename(SAI_RODADA)}: {len(por_rodada)} rodadas com dono")

    linhas.sort(key=lambda r: (r["clube"], r["temporada"], r["rodada_1a"]))
    with open(SAIDA, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(linhas[0]))
        w.writeheader()
        w.writerows(linhas)

    dez = [l for l in linhas if l["rodadas"] >= 10]
    print(f"\n{SAIDA}")
    print(f"  {len(linhas)} passagens-temporada, "
          f"{len({l['treinador'] for l in linhas})} treinadores, "
          f"{len({l['clube'] for l in linhas})} clubes, "
          f"{len({l['temporada'] for l in linhas})} temporadas")
    print(f"  {len(dez)} com 10 rodadas ou mais (as que entram nos rankings de T02); "
          f"{len(linhas) - len(dez)} ficam sinalizadas")
    if sem_ponte:
        print(f"  passagens descartadas por falta de ponte: {dict(sem_ponte)}")

    # A prova das duas regras: a soma das rodadas tem de dar as rodadas do ano.
    cob = collections.defaultdict(lambda: [0, 0])
    for l in linhas:
        k = (l["clube_wyscout"], l["temporada"])
        cob[k][0] += l["rodadas"]
        cob[k][1] = l["rodadas_no_ano"]
    for k, n in orfaos.items():
        cob[k][0] += 0
    exato = [k for k, (a, b) in cob.items() if a == b]
    falta = sorted(((b - a, k) for k, (a, b) in cob.items() if a < b), reverse=True)
    sobra = sorted(((a - b, k) for k, (a, b) in cob.items() if a > b), reverse=True)
    print(f"\n  COBERTURA: {len(exato)} de {len(cob)} clube-temporadas com a conta exata; "
          f"{len(falta)} com buraco, {len(sobra)} com sobra")
    for rot, lista in (("buraco", falta), ("sobra", sobra)):
        for d, (c, a) in lista[:5]:
            print(f"    {rot}: {c} {a} -> {d} de {cob[(c, a)][1]} rodadas")
    json.dump({"sem_jogo_no_tm": sem_jogo,
               "buracos": [{"clube": c, "temporada": a, "rodadas_sem_treinador": d,
                            "rodadas_no_ano": cob[(c, a)][1]} for d, (c, a) in falta]},
              open(os.path.join(RESULTADOS, "T01_lacunas.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
