#!/usr/bin/env python3
"""Baixa do Transfermarkt o historico de lesao de cada atleta que passou pela Serie B.

Sao 2.850 atletas distintos nos 100 elencos de 2022 a 2026. Uma pagina por atleta, no mesmo
ritmo educado das outras coletas (uma conexao, 2,5 a 4 segundos): cerca de duas horas e
meia. Retomavel — parar no meio e rodar de novo continua de onde estava — e o HTML fica em
cache, entao consertar a LEITURA da tabela nao custa outra volta no site.

A pagina entrega exatamente o que interessa:

    Temporada | Lesao | de | ate | Dias | Jogos perdidos
    25/26     | Fratura de um dedo | 14/07/2025 | 19/09/2025 | 68 dias | 11

## Por que a temporada NAO sai da coluna "Temporada"

Ela vem no formato europeu ("25/26"), que nao existe no calendario brasileiro. Duas lesoes
do mesmo ano civil podem cair em temporadas europeias diferentes, e uma lesao de janeiro a
marco de 2024 aparece como 23/24 — que para nos e 2024.

Aqui a temporada sai das DATAS: uma lesao conta para o ano brasileiro em que ela se
sobrepoe ao campeonato. A Serie B vai de abril a novembro, entao a janela usada e
**01/04 a 30/11** de cada ano, e o que se mede e quantos DIAS da lesao caem dentro dela.
Assim uma lesao que comeca em fevereiro e acaba em maio conta so o pedaco que atrapalhou
de fato.

"Jogos perdidos" o site da por lesao inteira, sem separar competicao — entao ele fica na
base como esta, mas nao pode ser somado por temporada brasileira sem essa ressalva.

Uso:
    python3 coletar_serieb_lesoes.py            # continua de onde parou
    python3 coletar_serieb_lesoes.py --refazer  # do zero
"""
import csv
import datetime as dt
import json
import os
import random
import re
import sys
import time

import pandas as pd
import requests
from bs4 import BeautifulSoup

AQUI = os.path.dirname(os.path.abspath(__file__))
DADOS = os.path.join(AQUI, "dados")
ELENCOS = os.path.join(DADOS, "serieb_elencos.csv")
SAIDA = os.path.join(DADOS, "serieb_lesoes.csv")
PROGRESSO = os.path.join(DADOS, "_serieb_lesoes_progresso.json")
CACHE = os.path.join(DADOS, "_serieb_lesoes_html")

URL = "https://www.transfermarkt.com.br/x/verletzungen/spieler/{}"
PAUSA = (2.5, 4.0)
RECUOS = [45, 90, 180, 360, 600, 900, 900, 900]

SESSAO = requests.Session()
SESSAO.headers.update({
    "User-Agent": ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"),
    "Accept-Language": "pt-BR,pt;q=0.9",
})

# A janela do campeonato. Uma lesao so conta para o ano em que atrapalhou de fato.
JANELA = (4, 1), (11, 30)


def baixar(url, cache):
    if os.path.exists(cache):
        with open(cache, encoding="utf-8") as f:
            return f.read()
    for i, espera in enumerate([0] + RECUOS):
        if espera:
            print(f"    bloqueado; esperando {espera}s (tentativa {i})", flush=True)
            time.sleep(espera)
        try:
            r = SESSAO.get(url, timeout=30)
        except requests.RequestException as e:
            print(f"    erro de rede: {e}", flush=True)
            continue
        if r.status_code == 200:
            os.makedirs(os.path.dirname(cache), exist_ok=True)
            with open(cache, "w", encoding="utf-8") as f:
                f.write(r.text)
            return r.text
        if r.status_code == 404:
            return ""
        print(f"    HTTP {r.status_code}", flush=True)
    return None


def data(txt):
    m = re.match(r"^(\d{2})/(\d{2})/(\d{4})$", (txt or "").strip())
    return dt.date(int(m.group(3)), int(m.group(2)), int(m.group(1))) if m else None


def ler(html):
    """Uma linha por lesao. Sem tabela = atleta sem lesao registrada, que tambem e dado."""
    sp = BeautifulSoup(html, "html.parser")
    tabela = sp.select_one("div.responsive-table table.items")
    if not tabela:
        return []
    fora = []
    for tr in tabela.select("tbody tr"):
        td = [c.get_text(" ", strip=True) for c in tr.find_all("td")]
        if len(td) < 6:
            continue
        fora.append({
            "temporada_tm": td[0], "lesao": td[1],
            "de": data(td[2]), "ate": data(td[3]),
            "dias": int(re.sub(r"\D", "", td[4]) or 0),
            "jogos_perdidos": int(re.sub(r"\D", "", td[5]) or 0) if td[5].strip("-") else 0,
        })
    return fora


def dias_na_temporada(de, ate, ano):
    """Quantos dias daquela lesao caem dentro do campeonato brasileiro daquele ano."""
    if not de:
        return 0
    fim = ate or de
    ini_j = dt.date(ano, *JANELA[0])
    fim_j = dt.date(ano, *JANELA[1])
    a, b = max(de, ini_j), min(fim, fim_j)
    return (b - a).days + 1 if b >= a else 0


def main():
    refazer = "--refazer" in sys.argv
    E = pd.read_csv(ELENCOS)
    ids = E[["id_jogador", "jogador"]].dropna(subset=["id_jogador"]).drop_duplicates("id_jogador")
    ids["id_jogador"] = ids["id_jogador"].astype(int).astype(str)
    print(f"{len(ids)} atletas distintos nos 100 elencos")

    prog = {} if refazer or not os.path.exists(PROGRESSO) else json.load(open(PROGRESSO, encoding="utf-8"))
    feitos = 0
    for i, (pid, nome) in enumerate(zip(ids["id_jogador"], ids["jogador"]), 1):
        if pid in prog:
            continue
        html = baixar(URL.format(pid), os.path.join(CACHE, f"{pid}.html"))
        prog[pid] = ler(html) if html else []
        feitos += 1
        if feitos % 25 == 0 or i == len(ids):
            with open(PROGRESSO, "w", encoding="utf-8") as f:
                json.dump(prog, f, ensure_ascii=False, default=str)
            print(f"  {i}/{len(ids)} · {nome[:24]:<24} {len(prog[pid])} lesões", flush=True)
        time.sleep(random.uniform(*PAUSA))

    with open(PROGRESSO, "w", encoding="utf-8") as f:
        json.dump(prog, f, ensure_ascii=False, default=str)

    nomes = dict(zip(ids["id_jogador"], ids["jogador"]))
    linhas = []
    for pid, lesoes in prog.items():
        for l in lesoes:
            de, ate = data(l["de"]) if isinstance(l["de"], str) else l["de"], \
                      data(l["ate"]) if isinstance(l["ate"], str) else l["ate"]
            linha = {"id_jogador": pid, "jogador": nomes.get(pid, ""), **l, "de": de, "ate": ate}
            for ano in (2022, 2023, 2024, 2025, 2026):
                linha[f"dias_{ano}"] = dias_na_temporada(de, ate, ano)
            linhas.append(linha)
    d = pd.DataFrame(linhas)
    d.to_csv(SAIDA, index=False, encoding="utf-8-sig")
    print(f"\n{len(d):,} lesões de {d.id_jogador.nunique():,} atletas em {os.path.relpath(SAIDA, AQUI)}")
    print(f"  atletas sem nenhuma lesão registrada: {sum(1 for v in prog.values() if not v):,}")
    for ano in (2022, 2023, 2024, 2025, 2026):
        c = d[d[f"dias_{ano}"] > 0]
        print(f"  {ano}: {len(c):>5} lesões tocando o campeonato · {int(c[f'dias_{ano}'].sum()):>7} dias")


if __name__ == "__main__":
    main()
