#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Carreira por temporada no oGol, para tapar os buracos do Wyscout.

Por que existe: o export do Wyscout traz no maximo 500 linhas por liga, ordenadas
por minutagem. Na Serie C de 2024 o corte ficou em 207 minutos; na Serie B, em 392.
Quem estava abaixo disso nao esta no arquivo — nao e problema de casar nome, e dado
que nao existe. Dos 3.613 jogadores das ligas brasileiras na base, 3.361 nao tem a
temporada 2024, e so 89 deles tem id do Transfermarkt.

O oGol tem a carreira completa, inclusive divisoes de acesso, numa tabela
`TEMPORADA | EQUIPE | J | G | ASS`. **Nao tem minutos** — tem jogos. E o combinado:
mostrar jogos onde nao houver minutos, marcado na tela, sem estimar nada.

Duas etapas, as duas com cache em disco e retomaveis:
  1. achar o link do jogador (busca no zerozero.pt, mesmos ids do oGol)
  2. baixar a pagina e ler a tabela de carreira

A busca reusa `buscar_ogol_links.py` do Portal Ranking em vez de reescrever a
heuristica de casar nome e clube — que ja e delicada e ja foi ajustada la.

Uso:
  python3 preparar_ogol.py --limite 50        # experimenta
  python3 preparar_ogol.py                    # ate o fim, retomando de onde parou
  python3 preparar_ogol.py --so-brasil        # so Brasil A/B/C
"""
import argparse
import json
import os
import random
import re
import sys
import time
import unicodedata

import requests

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE_RANKING = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/"
                "fut/BOTA/Analytics/Portal Ranking")
sys.path.insert(0, BASE_RANKING)
from buscar_ogol_links import search_zerozero, slug_matches_name   # noqa: E402

ARQ_LINKS = os.path.join(AQUI, "dados", "ogol_links.json")
ARQ_CARREIRA = os.path.join(AQUI, "dados", "ogol_carreira.json")
IDS_PRONTOS = os.path.join(BASE_RANKING, "config", "ogol_ids.json")

LIGAS_BR = ["Brasil A", "Brasil B", "Brasil C"]
LIGAS_SA = ["Argentina A", "Argentina B", "Argentina RESERVAS", "Uruguai", "Paraguai",
            "Chile", "Bolivia", "Peru", "Equador A", "Equador B", "Colombia A",
            "Colombia B", "Venezuela"]

TEMPORADAS = {"2024", "2025", "2026"}
CABECA = {"User-Agent": ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                         "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")}


def norm(t):
    t = unicodedata.normalize("NFD", str(t or ""))
    return "".join(c for c in t if unicodedata.category(c) != "Mn").lower().strip()


def carregar(caminho, padrao):
    if os.path.exists(caminho):
        with open(caminho, encoding="utf-8") as fh:
            return json.load(fh)
    return padrao


def gravar(caminho, dados):
    tmp = caminho + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(dados, fh, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, caminho)          # troca atomica: matar no meio nao corrompe


def rotulo_temporada(txt):
    """'2025/26' -> '2026' (ano em que a temporada europeia termina); '2024' -> '2024'."""
    txt = (txt or "").strip()
    m = re.fullmatch(r"(\d{4})/(\d{2})", txt)
    if m:
        return str(int(m.group(1)) + 1)
    m = re.fullmatch(r"(\d{4})", txt)
    return m.group(1) if m else None


def ler_carreira(html):
    """Tabela TEMPORADA | EQUIPE | J | G | ASS -> {temporada: {tm, j, g, a}}.

    Um jogador pode ter mais de uma linha na mesma temporada (mudou de clube no
    meio): soma jogos e gols e fica com o clube onde jogou mais.
    """
    fora = {}
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", html, re.S):
        tds = re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)
        if len(tds) < 6:
            continue
        limpo = [re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", td)).strip() for td in tds]
        temporada = rotulo_temporada(limpo[1])
        if temporada not in TEMPORADAS:
            continue
        try:
            jogos = int(limpo[3] or 0)
        except ValueError:
            continue
        try:
            gols = int(limpo[4] or 0)
        except ValueError:
            gols = 0
        try:
            assist = int(limpo[5] or 0)
        except ValueError:
            assist = 0
        clube = limpo[2]
        atual = fora.setdefault(temporada, {"tm": clube, "j": 0, "g": 0, "a": 0, "_maior": 0})
        atual["j"] += jogos
        atual["g"] += gols
        atual["a"] += assist
        if jogos > atual["_maior"]:
            atual["_maior"] = jogos
            atual["tm"] = clube
    for v in fora.values():
        v.pop("_maior", None)
    return fora


def alvos(so_brasil):
    """Quem precisa: das ligas escolhidas e sem pelo menos uma das tres temporadas."""
    base = json.load(open(os.path.join(AQUI, "dados", "jogadores.json"), encoding="utf-8"))
    hist = carregar(os.path.join(AQUI, "dados", "historico.json"), {"jogadores": {}})["jogadores"]
    ligas = set(LIGAS_BR if so_brasil else LIGAS_BR + LIGAS_SA)
    fora = []
    for j in base["jogadores"]:
        if j["l"] not in ligas:
            continue
        pk = f"{j['n']} - {j['t']} - {j['l']}"
        h = hist.get(pk)
        if h and all(h):                      # ja tem as tres pelo Wyscout
            continue
        fora.append({"pk": pk, "nome": j["n"], "time": j["t"], "liga": j["l"]})
    return fora


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limite", type=int, default=0, help="quantos jogadores nesta rodada")
    ap.add_argument("--espera", type=float, default=1.4, help="segundos entre requisicoes")
    ap.add_argument("--so-brasil", action="store_true")
    args = ap.parse_args()

    links = carregar(ARQ_LINKS, {})
    if not links:
        # aproveita o que o Portal Ranking ja resolveu ("Nome|Clube" -> url)
        for chave, url in carregar(IDS_PRONTOS, {}).items():
            if url and "|" in chave:
                links[chave] = url
        print(f"herdados {len(links)} links de config/ogol_ids.json")

    carreira = carregar(ARQ_CARREIRA, {})
    lista = alvos(args.so_brasil)
    pendentes = [p for p in lista if p["pk"] not in carreira]
    print(f"{len(lista)} jogadores sem historico completo · {len(pendentes)} ainda nao buscados")
    if args.limite:
        pendentes = pendentes[:args.limite]

    ses = requests.Session()
    ses.headers.update(CABECA)
    achados = semlink = semtab = erros = 0

    for i, p in enumerate(pendentes, 1):
        chave = f"{p['nome']}|{p['time']}"
        url = links.get(chave)
        try:
            if not url:
                url, _motivo = search_zerozero(ses, p["nome"], p["time"])
                time.sleep(args.espera + random.uniform(0, 0.6))
                links[chave] = url or ""
            if not url:
                semlink += 1
                carreira[p["pk"]] = {"url": None, "temporadas": {}}
            else:
                r = ses.get(url, timeout=25)
                time.sleep(args.espera + random.uniform(0, 0.6))
                r.raise_for_status()
                temporadas = ler_carreira(r.text)
                carreira[p["pk"]] = {"url": url, "temporadas": temporadas}
                if temporadas:
                    achados += 1
                else:
                    semtab += 1
        except Exception as e:                       # rede caiu, 403, pagina torta
            erros += 1
            print(f"    ! {p['nome']} ({p['time']}): {e}")

        if i % 25 == 0 or i == len(pendentes):
            gravar(ARQ_LINKS, links)
            gravar(ARQ_CARREIRA, carreira)
            print(f"  {i}/{len(pendentes)} · {achados} com carreira · {semlink} sem link · "
                  f"{semtab} sem tabela · {erros} erros", flush=True)

    gravar(ARQ_LINKS, links)
    gravar(ARQ_CARREIRA, carreira)
    print(f"ok: {achados} com carreira, {semlink} sem link, {semtab} sem tabela, {erros} erros")
    print(f"    {ARQ_CARREIRA} tem {len(carreira)} jogadores")
    print("    agora rode: python3 preparar_historico.py  (ele mistura o oGol no historico)")


if __name__ == "__main__":
    sys.exit(main())
