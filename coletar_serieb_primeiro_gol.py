#!/usr/bin/env python3
"""Baixa do oGol o minuto e o lado de CADA gol da Serie B, jogo a jogo.

## Por que existe, se ja ha o gol por faixa de minuto

O `coletar_serieb_gols_por_minuto.py` resolveu metade da A09 com 18 paginas, porque o oGol ja
publica a soma por faixa. A outra metade — "como cada faixa reage ao placar", o aproveitamento de
quem marca primeiro e de quem sofre primeiro — precisa de uma coisa que soma nenhuma da:
**qual time marcou o primeiro gol de cada jogo**. Isso so existe na pagina do jogo.

Sao cerca de 1.780 jogos em 2022-2026, uma pagina cada, no ritmo educado das outras coletas da
casa (uma conexao, 2,5 a 4 segundos): umas duas horas. Retomavel, com o HTML em cache — consertar
a LEITURA nao custa outra volta no site.

## Quatro armadilhas, achadas medindo e nao lendo

Todas apareceram porque cada jogo e conferido contra o proprio placar antes de ser aceito. Sem
essa trava, as quatro passariam caladas e envenenariam a analise inteira.

1. **`fl-l-cen` / `fl-r-cen` nao marcam lado.** Era a hipotese obvia, e esta errada: numa pagina
   de exemplo havia ZERO `fl-l-cen` e 46 `fl-r-cen`. Quem separa os times sao as duas colunas
   `div.zz-tpl-col.is-6` de cada `div.zz-tpl-row.game_report` — a primeira e a casa.

1b. **E as linhas `game_report` sao VARIAS, nao uma.** Titulares numa, reservas noutra (a segunda
   vem com a classe `mt` a mais). Ler so a primeira perdia todo gol de quem entrou do banco: de
   12 jogos de teste, 5 nao fechavam com o proprio placar. Este defeito e o melhor argumento a
   favor da trava — ele passaria calado em qualquer leitura por amostragem visual.

2. **Links de outras competicoes na pagina do calendario.** Pegar todo `href` com `/jogo/` trouxe
   Fulham x Manchester United e Montreal x Columbus. Os jogos saem da TABELA do calendario
   (`table.zztable.stats`), linha a linha, e nao de qualquer link da pagina.

3. **Dois gols do mesmo jogador vem num `<div>` so**, como `13' 48'`. Um `<span title="Gols">`
   pode valer mais de um gol.

4. **Gol contra conta para o OUTRO lado.** A coluna diz de que time e o JOGADOR, nao para quem o
   gol valeu. O oGol marca com `(g.c.)`, e sem inverter o placar nao fecha.

## A trava

Um jogo so entra na saida se os gols lidos baterem com o placar da tabela do calendario, lado a
lado. Jogo que nao bate NAO e gravado como se estivesse certo: vai para o relatorio, contado e
nomeado, e fica de fora. Jogo sem escalacao publicada tambem existe — e o oGol nao tem a ficha de
todos — e sai contado a parte.

Uso:
    python3 coletar_serieb_primeiro_gol.py                # continua de onde parou
    python3 coletar_serieb_primeiro_gol.py --anos 2025    # so uma temporada
    python3 coletar_serieb_primeiro_gol.py --limite 30    # experimenta
"""
import argparse
import csv
import json
import os
import random
import re
import sys
import time

import requests
from bs4 import BeautifulSoup

AQUI = os.path.dirname(os.path.abspath(__file__))
DADOS = os.path.join(AQUI, "dados")
SAIDA_GOLS = os.path.join(DADOS, "serieb_gols_evento.csv")
SAIDA_JOGOS = os.path.join(DADOS, "serieb_jogos_primeiro_gol.csv")
RELATORIO = os.path.join(DADOS, "_serieb_primeiro_gol_relatorio.json")
CACHE = os.path.join(DADOS, "_serieb_jogos_html")

OGOL = "https://www.ogol.com.br"
CABECA = {"User-Agent": ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                         "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
          "Accept-Language": "pt-BR,pt;q=0.9", "Referer": OGOL + "/"}
PAUSA = (2.5, 4.0)

# As mesmas edicoes do coletar_serieb_gols_por_minuto.py. Ficam repetidas de proposito: um
# coletor nao importa do outro, para que apagar um nao quebre o outro.
EDICOES = {"2018": 122165, "2019": 131668, "2020": 142502, "2021": 154316, "2022": 162063,
           "2023": 172531, "2024": 184705, "2025": 195259, "2026": 210278}
TEMPORADAS = ["2022", "2023", "2024", "2025", "2026"]

RE_MINUTO = re.compile(r"(\d{1,3})(?:\+(\d{1,2}))?'")
RE_PLACAR = re.compile(r"^(\d+)\s*-\s*(\d+)$")


def esperar():
    time.sleep(random.uniform(*PAUSA))


def buscar(ses, url, caminho_cache, refazer=False):
    if caminho_cache and os.path.exists(caminho_cache) and not refazer:
        with open(caminho_cache, encoding="utf-8") as fh:
            return fh.read(), True
    r = ses.get(url, timeout=40)
    r.raise_for_status()
    if caminho_cache:
        os.makedirs(os.path.dirname(caminho_cache), exist_ok=True)
        with open(caminho_cache, "w", encoding="utf-8") as fh:
            fh.write(r.text)
    esperar()
    return r.text, False


def calendario(ses, ano):
    """Os jogos da edicao, da TABELA do calendario — nunca de todo link /jogo/ da pagina."""
    ed = EDICOES[ano]
    jogos, pagina, vistos = [], 1, set()
    while True:
        url = (f"{OGOL}/edicao/brasileirao-serie-b-{ano}/{ed}/calendario"
               f"?fase_in=0&equipa=0&estado=&filtro=&op=calendario&page={pagina}")
        html, _ = buscar(ses, url, os.path.join(CACHE, f"cal_{ano}_{pagina}.html"))
        sopa = BeautifulSoup(html, "html.parser")
        tab = sopa.select_one("table.zztable.stats")
        novas = 0
        for tr in (tab.select("tbody tr") if tab else []):
            a = tr.select_one('a[href*="/jogo/"]')
            td = [x.get_text(" ", strip=True) for x in tr.select("td")]
            if not a or len(td) < 8:
                continue
            jid = a["href"].rstrip("/").split("/")[-1]
            if jid in vistos:
                continue
            m = RE_PLACAR.match(td[5])
            if not m:
                continue          # jogo sem placar (adiado, ou ainda por jogar)
            vistos.add(jid)
            novas += 1
            jogos.append({"temporada": ano, "jogo_id": jid, "url": a["href"],
                          "data": td[1], "casa": td[3], "fora": td[7],
                          "gols_casa": int(m.group(1)), "gols_fora": int(m.group(2)),
                          "rodada": td[8] if len(td) > 8 else ""})
        if not novas:
            break
        pagina += 1
        if pagina > 20:
            break
    return jogos


def minutos_de(texto):
    """“13' 48'” vira [13, 48]; “90+7' (pen.)” vira [97], com a observacao a parte."""
    fora = []
    for m in RE_MINUTO.finditer(texto or ""):
        base = int(m.group(1))
        extra = int(m.group(2) or 0)
        fora.append((base + extra, base, extra))
    return fora


def gols_da_pagina(html):
    """Os gols das duas colunas da escalacao. Devolve (eventos, motivo_se_nao_deu)."""
    sopa = BeautifulSoup(html, "html.parser")
    # São VÁRIAS linhas `game_report`, não uma: titulares numa, reservas noutra (essa vem com a
    # classe `mt` a mais). Ler só a primeira perdia todo gol de quem entrou do banco — e o placar
    # não fechava. Cada linha tem duas colunas: a primeira é a casa.
    linhas = sopa.select("div.zz-tpl-row.game_report")
    pares = []
    for linha in linhas:
        cols = [c for c in linha.find_all("div", recursive=False)
                if "zz-tpl-col" in (c.get("class") or []) and "is-6" in (c.get("class") or [])]
        if len(cols) == 2:
            pares.append(cols)
    if not pares:
        return None, "sem as duas colunas de escalacao"
    eventos = []
    for col, de_quem in [(c, "casa" if i == 0 else "fora") for cols in pares
                         for i, c in enumerate(cols)]:
        for sp in col.select('span[title="Gols"]'):
            irmao = sp.find_next_sibling("div")
            bruto = irmao.get_text(" ", strip=True) if irmao else ""
            achados = minutos_de(bruto)
            if not achados:
                return None, f"gol sem minuto legivel: “{bruto[:40]}”"
            contra = "g.c." in bruto.lower() or "g.p." in bruto.lower()
            penalti = "pen." in bruto.lower()
            for total, base, extra in achados:
                eventos.append({
                    "minuto": total, "minuto_base": base, "acrescimo": extra,
                    # A COLUNA diz de que time e o JOGADOR. Gol contra vale para o outro lado, e
                    # e por isso que o placar so fecha depois desta inversao.
                    "jogador_de": de_quem,
                    "gol_para": ("fora" if de_quem == "casa" else "casa") if contra else de_quem,
                    "gol_contra": int(contra), "penalti": int(penalti), "bruto": bruto})
    return eventos, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--anos", nargs="*", default=TEMPORADAS)
    ap.add_argument("--limite", type=int, default=0, help="so os N primeiros jogos (experimento)")
    ap.add_argument("--refazer", action="store_true")
    args = ap.parse_args()

    ses = requests.Session()
    ses.headers.update(CABECA)

    todos = []
    for ano in args.anos:
        js = calendario(ses, ano)
        print(f"  {ano}: {len(js)} jogos com placar no calendario")
        todos += js
    if args.limite:
        todos = todos[:args.limite]

    eventos, jogos_ok, recusados, sem_ficha = [], [], [], []
    for i, j in enumerate(todos, 1):
        caminho = os.path.join(CACHE, j["temporada"], f"{j['jogo_id']}.html")
        try:
            html, do_cache = buscar(ses, OGOL + j["url"], caminho, args.refazer)
        except Exception as e:
            recusados.append({**j, "motivo": f"nao baixou: {e}"})
            continue
        ev, motivo = gols_da_pagina(html)
        if ev is None:
            sem_ficha.append({**j, "motivo": motivo})
        else:
            casa = sum(1 for e in ev if e["gol_para"] == "casa")
            fora = sum(1 for e in ev if e["gol_para"] == "fora")
            if (casa, fora) != (j["gols_casa"], j["gols_fora"]):
                # A TRAVA. Jogo que nao fecha nao e gravado como se estivesse certo.
                recusados.append({**j, "motivo": f"lidos {casa}-{fora}, placar diz "
                                                 f"{j['gols_casa']}-{j['gols_fora']}"})
            else:
                ev.sort(key=lambda e: e["minuto"])
                primeiro = ev[0] if ev else None
                jogos_ok.append({
                    "temporada": j["temporada"], "jogo_id": j["jogo_id"], "data": j["data"],
                    "rodada": j["rodada"], "casa": j["casa"], "fora": j["fora"],
                    "gols_casa": j["gols_casa"], "gols_fora": j["gols_fora"],
                    "primeiro_gol_de": primeiro["gol_para"] if primeiro else "",
                    "primeiro_gol_min": primeiro["minuto"] if primeiro else "",
                    "sem_gol": int(not ev)})
                for e in ev:
                    eventos.append({"temporada": j["temporada"], "jogo_id": j["jogo_id"],
                                    "data": j["data"], "casa": j["casa"], "fora": j["fora"],
                                    **{k: e[k] for k in ("minuto", "minuto_base", "acrescimo",
                                                         "gol_para", "gol_contra", "penalti")}})
        if i % 50 == 0 or i == len(todos):
            print(f"  {i}/{len(todos)} · {len(jogos_ok)} fecham · {len(recusados)} nao fecham · "
                  f"{len(sem_ficha)} sem ficha")
            if jogos_ok:
                gravar(eventos, jogos_ok, recusados, sem_ficha)

    gravar(eventos, jogos_ok, recusados, sem_ficha)
    print(f"\n{len(jogos_ok)} jogos conferidos contra o proprio placar · {len(eventos)} gols")
    print(f"{len(recusados)} nao fecharam · {len(sem_ficha)} sem escalacao publicada")
    for r in recusados[:5]:
        print(f"    ! {r['temporada']} {r['casa']} x {r['fora']}: {r['motivo']}")
    return 0


def gravar(eventos, jogos, recusados, sem_ficha):
    if eventos:
        with open(SAIDA_GOLS, "w", encoding="utf-8", newline="") as fh:
            w = csv.DictWriter(fh, fieldnames=list(eventos[0]))
            w.writeheader()
            w.writerows(eventos)
    if jogos:
        with open(SAIDA_JOGOS, "w", encoding="utf-8", newline="") as fh:
            w = csv.DictWriter(fh, fieldnames=list(jogos[0]))
            w.writeheader()
            w.writerows(jogos)
    json.dump({"_doc": ("O que NAO entrou, e por que. Jogo que nao fecha com o proprio placar "
                        "fica de fora e e contado aqui — nunca gravado como se estivesse certo."),
               "jogos_aceitos": len(jogos), "gols": len(eventos),
               "nao_fecharam": recusados, "sem_escalacao": sem_ficha},
              open(RELATORIO, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    sys.exit(main())
