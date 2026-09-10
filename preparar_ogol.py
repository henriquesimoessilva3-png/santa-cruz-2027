#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Carreira por temporada no oGol, chegando ao jogador PELA PAGINA DA EQUIPE.

Por que existe: o export do Wyscout traz no maximo 500 linhas por liga, ordenadas
por minutagem. Na Serie C de 2024 o corte ficou em 207 minutos; na Serie B, em 392.
Quem estava abaixo disso nao esta no arquivo — nao e problema de casar nome, e dado
que nao existe. Dos 3.613 jogadores das ligas brasileiras na base, 3.361 nao tem a
temporada 2024, e so 89 deles tem id do Transfermarkt.

Por que pela equipe, e nao buscando o nome do jogador
-----------------------------------------------------
A primeira versao buscava jogador por jogador e rendia 2 em 25. Dois motivos, e o
segundo so apareceu medindo:

1. **Homonimo.** Buscar "A. Moreno" trouxe um A. Moreno do Oriente Petrolero para o
   A. Moreno do River Plate — 5 jogos e 6 gols que nao eram dele. Dentro do plantel
   de um clube o nome e praticamente unico, entao o caminho pela equipe elimina isso
   na origem.
2. **O zerozero.pt passou a devolver 403.** A busca do `buscar_ogol_links.py` aponta
   para la e engolia o erro como "sem resultado". O ogol.com.br responde normal, e e
   nele que este script bate.

Tres etapas, todas com cache em disco e retomaveis:
  1. achar a pagina de cada CLUBE  (dados/ogol_clubes.json)
  2. ler o plantel de cada clube   (dados/ogol_elencos.json)
  3. ler a carreira de cada jogador e conferir (dados/ogol_carreira.json)

A conferencia da etapa 3 continua: a tabela de carreira diz em que clube o jogador
esta na temporada corrente; se nao for o clube que a base diz, a pagina e de outra
pessoa e vai fora.

O oGol tem JOGOS por temporada, nao minutos. E o combinado: mostrar jogos onde nao
houver minutos, marcado na tela, sem estimar nada.

Uso:
  python3 preparar_ogol.py --etapa clubes      # so a etapa 1
  python3 preparar_ogol.py --limite 40         # experimenta as tres
  python3 preparar_ogol.py --so-brasil         # so Brasil A/B/C
  python3 preparar_ogol.py                     # ate o fim, retomando
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
PORTAL_BOTAFOGO = "/Users/henriquesimoessilva/projetos/Portal-Botafogo"
sys.path.insert(0, BASE_RANKING)
sys.path.insert(0, PORTAL_BOTAFOGO)
from buscar_ogol_links import team_matches          # noqa: E402
from elencos_ogol import extrair_plantel            # noqa: E402  (parser do plantel)

ARQ_CLUBES = os.path.join(AQUI, "dados", "ogol_clubes.json")
ARQ_ELENCOS = os.path.join(AQUI, "dados", "ogol_elencos.json")
ARQ_CARREIRA = os.path.join(AQUI, "dados", "ogol_carreira.json")

OGOL = "https://www.ogol.com.br"
CABECA = {"User-Agent": ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                         "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
          "Accept-Language": "pt-BR,pt;q=0.9", "Referer": OGOL + "/"}

LIGAS_BR = ["Brasil A", "Brasil B", "Brasil C"]
LIGAS_SA = ["Argentina A", "Argentina B", "Argentina RESERVAS", "Uruguai", "Paraguai",
            "Chile", "Bolivia", "Peru", "Equador A", "Equador B", "Colombia A",
            "Colombia B", "Venezuela"]

TEMPORADAS = {"2024", "2025", "2026"}
CORRENTE = "2026"          # a temporada que serve de prova de identidade

PARTICULAS = {"de", "da", "do", "dos", "das", "del", "van", "von", "di", "du", "la", "le"}


def norm(t):
    t = unicodedata.normalize("NFD", str(t or ""))
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return " ".join(t.lower().replace(".", " ").split())


def sobrenome(nm):
    partes = [p for p in norm(nm).split() if p not in PARTICULAS]
    return partes[-1] if partes else ""


def mesmo_jogador(a, b):
    """Dentro de um plantel, o sobrenome ja resolve quase tudo. A inicial do primeiro
    nome so e cobrada quando os dois lados tem mais de um pedaco — assim "S. Beltrán"
    casa com "Santiago Beltrán" e nao casa com "Lucas Beltrán"."""
    pa = [p for p in norm(a).split() if p not in PARTICULAS]
    pb = [p for p in norm(b).split() if p not in PARTICULAS]
    if not pa or not pb or pa[-1] != pb[-1]:
        return False
    if len(pa) < 2 or len(pb) < 2:
        return True
    return pa[0][0] == pb[0][0]


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
        def inteiro(x):
            try:
                return int(x or 0)
            except ValueError:
                return 0
        clube = limpo[2]
        atual = fora.setdefault(temporada, {"tm": clube, "j": 0, "g": 0, "a": 0, "_maior": 0})
        atual["j"] += jogos
        atual["g"] += inteiro(limpo[4])
        atual["a"] += inteiro(limpo[5])
        if jogos > atual["_maior"]:
            atual["_maior"] = jogos
            atual["tm"] = clube
    for v in fora.values():
        v.pop("_maior", None)
    return fora


def buscar_clube(ses, nome):
    """Pagina do clube no oGol: /equipe/<slug>/<id>. Escolhe o primeiro resultado
    cujo nome bate — a busca ja vem por relevancia."""
    r = ses.get(OGOL + "/search", params={"search_txt": nome, "content_type": "team"}, timeout=25)
    r.raise_for_status()
    achados = []
    for bloco in r.text.split("zz-search-item")[1:]:
        m = re.search(r"/equipe/([a-z0-9-]+)/(\d+)", bloco)
        if not m:
            continue
        rot = re.search(r'/equipe/[^"]*"[^>]*>\s*([^<]{2,60})', bloco)
        achados.append((m.group(0), (rot.group(1).strip() if rot else "")))
    for caminho, rot in achados:
        if team_matches(nome, rot):
            return OGOL + caminho, rot
    return (OGOL + achados[0][0], achados[0][1]) if achados else (None, None)


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


def esperar(args):
    time.sleep(args.espera + random.uniform(0, 0.6))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limite", type=int, default=0, help="quantos jogadores na etapa 3")
    ap.add_argument("--espera", type=float, default=1.5, help="segundos entre requisicoes")
    ap.add_argument("--so-brasil", action="store_true")
    ap.add_argument("--etapa", choices=["clubes", "elencos", "carreiras", "tudo"], default="tudo")
    args = ap.parse_args()

    lista = alvos(args.so_brasil)
    clubes_alvo = sorted({p["time"] for p in lista})
    print(f"{len(lista)} jogadores sem histórico completo em {len(clubes_alvo)} clubes")

    ses = requests.Session()
    ses.headers.update(CABECA)

    # ---- etapa 1: pagina de cada clube ----
    clubes = carregar(ARQ_CLUBES, {})
    if args.etapa in ("clubes", "tudo"):
        faltam = [c for c in clubes_alvo if c not in clubes]
        print(f"etapa 1 — clubes: {len(faltam)} a buscar")
        for i, nome in enumerate(faltam, 1):
            try:
                url, rot = buscar_clube(ses, nome)
                clubes[nome] = {"url": url, "ogol": rot}
                esperar(args)
            except Exception as e:
                print(f"    ! {nome}: {e}")
                clubes[nome] = {"url": None, "ogol": None, "erro": str(e)}
            if i % 20 == 0 or i == len(faltam):
                gravar(ARQ_CLUBES, clubes)
                achou = sum(1 for v in clubes.values() if v.get("url"))
                print(f"  {i}/{len(faltam)} · {achou} com página", flush=True)
        gravar(ARQ_CLUBES, clubes)

    # ---- etapa 2: plantel de cada clube ----
    elencos = carregar(ARQ_ELENCOS, {})
    if args.etapa in ("elencos", "tudo"):
        faltam = [c for c in clubes_alvo if c not in elencos and (clubes.get(c) or {}).get("url")]
        print(f"etapa 2 — plantéis: {len(faltam)} a baixar")
        for i, nome in enumerate(faltam, 1):
            try:
                r = ses.get(clubes[nome]["url"], timeout=30)
                r.raise_for_status()
                plantel = extrair_plantel(r.text, CORRENTE)
                elencos[nome] = [{"nome": p["nome"], "slug": p["ogol_slug"], "id": p["ogol_id"]}
                                 for p in plantel]
                esperar(args)
            except Exception as e:
                print(f"    ! {nome}: {e}")
                elencos[nome] = []
            if i % 15 == 0 or i == len(faltam):
                gravar(ARQ_ELENCOS, elencos)
                print(f"  {i}/{len(faltam)} · {sum(len(v) for v in elencos.values())} atletas",
                      flush=True)
        gravar(ARQ_ELENCOS, elencos)

    # ---- etapa 3: carreira de cada jogador ----
    carreira = carregar(ARQ_CARREIRA, {})
    if args.etapa in ("carreiras", "tudo"):
        pendentes = []
        semvaga = 0
        for p in lista:
            if p["pk"] in carreira:
                continue
            plantel = elencos.get(p["time"]) or []
            achado = [x for x in plantel if mesmo_jogador(p["nome"], x["nome"])]
            if len(achado) == 1:
                pendentes.append((p, achado[0]))
            else:
                semvaga += 1
        print(f"etapa 3 — carreiras: {len(pendentes)} achados no plantel · "
              f"{semvaga} sem achar (ou nome ambíguo dentro do clube)")
        if args.limite:
            pendentes = pendentes[:args.limite]

        ok = recusados = semtab = erros = 0
        for i, (p, atleta) in enumerate(pendentes, 1):
            url = f"{OGOL}/jogador/{atleta['slug']}/{atleta['id']}"
            try:
                r = ses.get(url, timeout=30)
                esperar(args)
                r.raise_for_status()
                temporadas = ler_carreira(r.text)
                agora = temporadas.get(CORRENTE)
                if not temporadas:
                    carreira[p["pk"]] = {"url": url, "temporadas": {}, "motivo": "sem tabela"}
                    semtab += 1
                elif not agora or not team_matches(p["time"], agora["tm"]):
                    carreira[p["pk"]] = {"url": url, "temporadas": {},
                                         "motivo": "clube não confere: página diz " +
                                                   ((agora or {}).get("tm") or "nada")}
                    recusados += 1
                else:
                    carreira[p["pk"]] = {"url": url, "temporadas": temporadas}
                    ok += 1
            except Exception as e:
                erros += 1
                print(f"    ! {p['nome']} ({p['time']}): {e}")
            if i % 25 == 0 or i == len(pendentes):
                gravar(ARQ_CARREIRA, carreira)
                print(f"  {i}/{len(pendentes)} · {ok} conferidos · {recusados} recusados · "
                      f"{semtab} sem tabela · {erros} erros", flush=True)
        gravar(ARQ_CARREIRA, carreira)
        print(f"ok: {ok} conferidos, {recusados} recusados, {semtab} sem tabela, {erros} erros")
        print("    agora rode: python3 preparar_historico.py")


if __name__ == "__main__":
    sys.exit(main())
