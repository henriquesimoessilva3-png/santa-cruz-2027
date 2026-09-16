#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Escreve dados/minutagem_serieb.json e static/minutagem_serieb_dados.js — a aba "Minutagem Série B".

FONTE: `bases wyscout - serie B/dados tecnicos - serie B 2022 a 2026.zip`, dez planilhas do
Advanced Search do Wyscout (exportação limitada a 500 linhas, então cada temporada vem em DUAS
planilhas que se sobrepõem — em 2026, 297 das 500 linhas aparecem nas duas, idênticas).

Como cada planilha vira uma temporada: o arquivo não traz coluna de ano. O casamento é pelo
CONJUNTO DE CLUBES: os 20 da planilha contra os 20 de cada temporada em dados/serieb_clube_temporada.csv
(com o de-para de nomes abaixo, porque o Wyscout escreve "Sport Recife" e "Grêmio Novorizontino").
Se a melhor temporada não bater em pelo menos 18 dos 20 clubes, ou se duas planilhas caírem na mesma
temporada, o script para: é sinal de que o zip mudou e o mapeamento precisa ser refeito na mão.

A LINHA é jogador + clube + temporada, como o Wyscout exporta. Quem trocou de clube no meio do ano
aparece uma vez por clube — e é isso que uma tela de minutagem tem de mostrar. Dois jogadores com o
mesmo nome na mesma temporada NÃO são juntados (Carlinhos zagueiro de 31 no Novorizontino e
Carlinhos centroavante de 29 no Athletic são pessoas diferentes).

A FATIA DE MINUTOS é `minutos do jogador ÷ tempo que o time jogou`, e o tempo do time é medido da
própria base: a soma dos minutos do elenco dividida por 11 (os 11 em campo). O divisor NÃO é
jogos × 90 porque o Wyscout CONTA OS ACRÉSCIMOS — medido: o tempo real dos clubes fica de 0,99 a
1,16 vezes jogos × 90 (mediana 1,12), e com o divisor de 90 minutos 78 linhas passavam de 100%
(Muriel, 2.749 minutos em 27 jogos do Náutico em 2026, dava 113%).

O que esse divisor exige: a base tem de trazer o elenco quase inteiro de cada clube. Onde a soma do
elenco fica ABAIXO de jogos × 90 (sinal de que o corte de 500 linhas comeu jogadores), o clube entra
na lista de avisos e a fatia dele sai assim mesmo, com o aviso ao lado no JSON.

Rodar:  python3 gerar_minutagem_serieb.py
"""
import collections
import csv
import datetime
import json
import os
import re
import sys
import unicodedata
import zipfile

import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
ZIP = os.path.join(AQUI, "bases wyscout - serie B", "dados tecnicos - serie B 2022 a 2026.zip")
PAINEL = os.path.join(AQUI, "dados", "serieb_clube_temporada.csv")
SAIDA_JSON = os.path.join(AQUI, "dados", "minutagem_serieb.json")
SAIDA_JS = os.path.join(AQUI, "static", "minutagem_serieb_dados.js")

COL_TIME = "Equipa dentro de um período de tempo seleccionado"
COL_MIN = "Minutos jogados:"
MIN_CLUBES_QUE_BATEM = 18
EM_CAMPO = 11

# O Wyscout escreve alguns clubes de outro jeito que o painel. Só os que não casam sozinhos.
DE_PARA = {
    "america mineiro": "América-MG", "athletic club": "Athletic", "atletico go": "Atlético-GO",
    "atletico paranaense": "Athletico-PR", "botafogo sp": "Botafogo-SP",
    "gremio novorizontino": "Novorizontino", "operario pr": "Operário-PR",
    "sport recife": "Sport", "sao bernardo fc": "São Bernardo", "vasco da gama": "Vasco",
}

# Posição principal do Wyscout -> grupo, na convenção da casa.
GRUPO = {
    "GK": "Goleiro",
    "CB": "Zaga", "LCB": "Zaga", "RCB": "Zaga",
    "LB": "Lateral", "RB": "Lateral", "LWB": "Lateral", "RWB": "Lateral",
    "DMF": "Volante", "LDMF": "Volante", "RDMF": "Volante",
    "LCMF": "Meia", "RCMF": "Meia", "AMF": "Meia",
    "LW": "Extremo", "RW": "Extremo", "LWF": "Extremo", "RWF": "Extremo",
    "LAMF": "Extremo", "RAMF": "Extremo",
    "CF": "Atacante",
}


def sem_acento(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", s.replace("-", " ").replace(".", "")).strip()


def clube_do_painel(nome, clubes_do_ano):
    """O nome como o painel escreve, ou o do Wyscout quando não há par."""
    n = sem_acento(nome)
    if n in DE_PARA:
        return DE_PARA[n]
    for c in clubes_do_ano:
        if sem_acento(c) == n:
            return c
    return str(nome)


def carregar_painel():
    por_ano = collections.defaultdict(dict)
    with open(PAINEL, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            por_ano[int(r["ano"])][r["clube"]] = int(r["J"])
    return por_ano


def temporada_da_planilha(df, por_ano):
    """A temporada é a que mais casa clube a clube; empate ou casamento fraco param o script."""
    times = {sem_acento(x) for x in df[COL_TIME].dropna()}
    placar = []
    for ano, clubes in por_ano.items():
        alvo = {sem_acento(DE_PARA.get(sem_acento(c), c)) for c in clubes} | {sem_acento(c) for c in clubes}
        vistos = {sem_acento(clube_do_painel(t, clubes)) for t in times}
        placar.append((len(vistos & alvo), ano))
    placar.sort(reverse=True)
    if placar[0][0] < MIN_CLUBES_QUE_BATEM:
        raise SystemExit(f"planilha não casa com nenhuma temporada (melhor: {placar[0][1]} com "
                         f"{placar[0][0]} de 20 clubes) — o zip mudou, refaça o de-para")
    if placar[0][0] == placar[1][0]:
        raise SystemExit(f"planilha empata entre {placar[0][1]} e {placar[1][1]} — mapeie na mão")
    return placar[0][1]


def main():
    por_ano = carregar_painel()
    if not os.path.exists(ZIP):
        raise SystemExit(f"não achei o zip: {ZIP}")

    with zipfile.ZipFile(ZIP) as z:
        nomes = sorted(n for n in z.namelist() if n.endswith(".xlsx") and not n.startswith("__MACOSX"))
        por_temporada = collections.defaultdict(list)
        for nome in nomes:
            with z.open(nome) as fh:
                df = pd.read_excel(fh)
            por_temporada[temporada_da_planilha(df, por_ano)].append((nome, df))

    linhas, avisos, vistos = [], [], set()
    for ano in sorted(por_temporada):
        clubes = por_ano[ano]
        df = pd.concat([d for _, d in por_temporada[ano]], ignore_index=True)
        antes = len(df)
        df = df.drop_duplicates(subset=["Jogador", COL_TIME, "Posição", "Idade", "Partidas jogadas", COL_MIN])
        for _, r in df.iterrows():
            if pd.isna(r[COL_TIME]):
                avisos.append(f"{ano}: {r['Jogador']} sem clube na temporada — linha fora")
                continue
            time = clube_do_painel(r[COL_TIME], clubes)
            pos = str(r["Posição"]).split(",")[0].strip() if pd.notna(r["Posição"]) else ""
            minutos = int(r[COL_MIN]) if pd.notna(r[COL_MIN]) else None
            chave = (ano, str(r["Jogador"]), time, pos, minutos)
            if chave in vistos:
                continue
            vistos.add(chave)
            linhas.append([
                ano, str(r["Jogador"]), time, pos, GRUPO.get(pos, "Outro"),
                int(r["Idade"]) if pd.notna(r["Idade"]) else None,
                int(r["Partidas jogadas"]) if pd.notna(r["Partidas jogadas"]) else None,
                minutos, None,  # a fatia entra depois, quando o tempo do time estiver somado
                str(r["Equipa"]) if pd.notna(r["Equipa"]) else None,
            ])
        print(f"{ano}: {len(por_temporada[ano])} planilhas · {antes} linhas · "
              f"{len(df)} sem repetição · {len(clubes)} clubes no painel")

    # tempo de cada clube = soma dos minutos do elenco ÷ 11, e a fatia de cada jogador sobre ele
    soma = collections.Counter()
    elenco = collections.Counter()
    for l in linhas:
        soma[(l[0], l[2])] += l[7] or 0
        elenco[(l[0], l[2])] += 1
    tempo_time = {}
    for (ano, time), s in soma.items():
        tempo = s / EM_CAMPO
        jogos = por_ano[ano].get(time)
        tempo_time[(ano, time)] = dict(
            minutos=round(tempo), jogadores=elenco[(ano, time)], jogos=jogos,
            razao_sobre_90=round(tempo / (jogos * 90), 3) if jogos else None)
        if jogos and tempo < jogos * 90:
            avisos.append(f"{ano}: o elenco do {time} soma {round(tempo)} min, menos que os "
                          f"{jogos * 90} de jogos × 90 — pode faltar jogador no corte de 500 linhas "
                          f"do Wyscout, e a fatia dos que estão sai um pouco alta")
        if not jogos:
            avisos.append(f"{ano}: {time} não está no painel da Série B — sem jogos para comparar")
    for l in linhas:
        tempo = tempo_time[(l[0], l[2])]["minutos"]
        if l[7] is not None and tempo:
            l[8] = round(l[7] / tempo * 100, 1)

    dados = {
        "gerado_em": datetime.date.today().isoformat(),
        "fonte": os.path.basename(ZIP),
        "colunas": ["ano", "jogador", "time", "posicao", "grupo", "idade", "jogos", "minutos",
                    "fatia_pct", "time_hoje"],
        "regra": ("Linha = jogador + clube + temporada, como o Wyscout exporta; quem trocou de clube "
                  "no ano aparece uma vez por clube, e dois jogadores com o mesmo nome não são "
                  "juntados. A fatia é os minutos do jogador sobre o tempo que o time jogou, e esse "
                  "tempo é a soma dos minutos do elenco dividida por 11 — não é jogos × 90, porque o "
                  "Wyscout conta os acréscimos."),
        "tempo_por_time": {f"{ano}|{time}": v for (ano, time), v in sorted(tempo_time.items())},
        "linhas": sorted(linhas, key=lambda l: (-l[0], -(l[7] or 0))),
        "avisos": sorted(set(avisos)),
    }

    with open(SAIDA_JSON, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False)
    cab = ("/* GERADO POR gerar_minutagem_serieb.py — NAO EDITE A MAO.\n\n"
           "   Copia integral de dados/minutagem_serieb.json (aba Minutagem Serie B). A tela em\n"
           "   static/minutagem_serieb.js so filtra e ordena; a unica conta feita la e minutos/jogos. */\n")
    with open(SAIDA_JS, "w", encoding="utf-8") as f:
        f.write(cab + "const MINUTAGEM_SERIEB = " + json.dumps(dados, ensure_ascii=False) + ";\n")

    fatias = [l[8] for l in linhas if l[8] is not None]
    kb = os.path.getsize(SAIDA_JS) / 1024
    print(f"\n{len(dados['linhas'])} linhas · fatia máxima {max(fatias):.1f}% · "
          f"{sum(1 for f_ in fatias if f_ > 100)} acima de 100% · {len(dados['avisos'])} avisos · "
          f"{kb:.0f} KB em {os.path.relpath(SAIDA_JS, AQUI)}")
    for a in dados["avisos"][:8]:
        print("  aviso:", a)


if __name__ == "__main__":
    sys.exit(main())
