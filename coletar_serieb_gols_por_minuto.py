#!/usr/bin/env python3
"""Baixa do oGol os gols marcados e sofridos por faixa de minuto, por clube e temporada.

## Por que esta coleta existe

A A09 do Estudo Serie B pergunta em que faixas de minutos cada faixa da tabela marca e sofre.
O `CLAUDE.md` do estudo registrou, em 17/09, que a parte **nao roda**: nenhuma das 119 colunas
de `dados/serieb_jogos.csv` traz minuto ou tempo, e so coleta resolveria. Decisao do dono em
20/09: coletar.

## Por que 8 paginas e nao 1.782

O caminho obvio era a pagina de cada jogo: 380 por temporada, 1.782 em 2022-2026, com o minuto
de cada gol no HTML. Sao umas duas horas no ritmo educado das outras coletas da casa.

O oGol ja publica a conta pronta, por EDICAO: `estatisticas-momento-jogo` traz, para cada um dos
20 clubes, quantos gols ele fez em [0-15], [15-30], [30-45], [45+], [45-60], [60-75], [75-90] e
[90+], mais os totais de cada tempo. O seletor `?tpstat=g` da os marcados e `?tpstat=ga` os
sofridos. Sao duas paginas por temporada — oito no recorte fechado, dez com 2026.

**O que se perde escolhendo o atalho, e fica registrado aqui:** a agregacao vem do oGol, nao dos
eventos. Nao da para recontar gol a gol, nao da para saber QUEM marcou, nao da para separar por
mando e nao da para saber qual time marcou primeiro em cada jogo. A metade da A09 que pergunta
"como reage ao placar" (aproveitamento quando marca primeiro e quando sofre primeiro) NAO sai
daqui: ela continua precisando da pagina de cada jogo. Quem for atras dela le a secao seguinte.

## Como pegar o primeiro gol, quando for a hora

Na pagina do jogo (`/jogo/<data>-<casa>-<fora>/<id>`) cada gol aparece na escalacao, preso ao
jogador que marcou:

    <span title="Gols" class="zz-icn zz-icn-fut-11" ...></span><div>90+7' (pen.)</div>

O lado (casa ou fora) sai da classe do bloco do jogador — `fl-l-cen` e o time da esquerda,
`fl-r-cen` o da direita. Os ids dos jogos de cada temporada saem do calendario da edicao, que e
paginado (`/calendario?...&page=N`, cerca de 119 jogos por pagina).

## O nome do clube

O oGol escreve o nome dele ("Athletico Paranaense", "Operario Ferroviario") e a base do app
escreve o dela. A ponte NAO e feita aqui: este arquivo grava o nome como o oGol o escreve, e
quem casa e o `scripts/A09.py` do estudo, pela mesma ponte de clubes que o T01 ja montou
(`T01_ponte_clubes.json`). Coletor coleta; quem decide identidade e a parte.

Uso:
    python3 coletar_serieb_gols_por_minuto.py            # continua de onde parou
    python3 coletar_serieb_gols_por_minuto.py --refazer  # do zero, ignorando o cache
"""
import argparse
import csv
import json
import os
import random
import sys
import time

import requests
from bs4 import BeautifulSoup

AQUI = os.path.dirname(os.path.abspath(__file__))
DADOS = os.path.join(AQUI, "dados")
SAIDA = os.path.join(DADOS, "serieb_gols_por_minuto.csv")
CACHE = os.path.join(DADOS, "_serieb_gols_html")

OGOL = "https://www.ogol.com.br"
CABECA = {"User-Agent": ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                         "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
          "Accept-Language": "pt-BR,pt;q=0.9", "Referer": OGOL + "/"}
PAUSA = (2.5, 4.0)

# As edicoes da Serie B no oGol, lidas do seletor de temporada da pagina da competicao
# (/competicao/brasileirao-serie-b?search=1) em 20/09/2026. Ficam escritas para a coleta ser
# reproduzivel: descobrir o id de novo a cada volta e uma requisicao a mais e um jeito a mais
# de a coleta mudar sozinha de alvo.
EDICOES = {
    "2018": 122165, "2019": 131668, "2020": 142502, "2021": 154316, "2022": 162063,
    "2023": 172531, "2024": 184705, "2025": 195259, "2026": 210278,
}
# 2022-2025 sao as temporadas fechadas do recorte; 2018-2021 servem para conferir, como o
# CLAUDE.md manda; 2026 esta em curso e entra so como teste.
TEMPORADAS = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"]

# As faixas, como o oGol as publica. [45+] e o acrescimo do 1o tempo e [90+] o do 2o: sao faixas
# de verdade, nao sobra de arredondamento, e por isso vao para o CSV separadas.
FAIXAS = ["0-15", "15-30", "30-45", "45+", "45-60", "60-75", "75-90", "90+"]
LADOS = {"g": "marcados", "ga": "sofridos"}


def esperar():
    time.sleep(random.uniform(*PAUSA))


def baixar(ses, ano, lado, refazer):
    """O HTML de uma edicao × lado, com cache em disco: consertar a LEITURA nao custa outra volta."""
    os.makedirs(CACHE, exist_ok=True)
    caminho = os.path.join(CACHE, f"{ano}_{lado}.html")
    if os.path.exists(caminho) and not refazer:
        with open(caminho, encoding="utf-8") as fh:
            return fh.read(), True
    ed = EDICOES[ano]
    url = (f"{OGOL}/edicao/brasileirao-serie-b-{ano}/{ed}/estatisticas-momento-jogo"
           f"?tpstat={lado}&id={ed}")
    r = ses.get(url, timeout=40)
    r.raise_for_status()
    with open(caminho, "w", encoding="utf-8") as fh:
        fh.write(r.text)
    esperar()
    return r.text, False


def ler(html, ano, lado):
    """A tabela de uma edicao × lado. Falha fechada: cabecalho diferente do esperado, para."""
    sopa = BeautifulSoup(html, "html.parser")
    tab = sopa.select_one("table")
    if tab is None:
        raise SystemExit(f"{ano}/{lado}: a pagina nao trouxe tabela nenhuma")
    cab = [th.get_text(" ", strip=True) for th in tab.select("thead th")]
    esperado = ["", "Jogos", "G", "G/J"] + [f"[{f}]" for f in FAIXAS] + \
               ["[1P]", "[2P]", "[1P%]", "[2P%]"]
    if cab != esperado:
        raise SystemExit(f"{ano}/{lado}: o cabecalho mudou.\n  esperado {esperado}\n  veio     {cab}")
    linhas = []
    for tr in tab.select("tbody tr"):
        td = [x.get_text(" ", strip=True) for x in tr.select("td")]
        if len(td) != len(esperado) or not td[0]:
            continue
        linha = {"temporada": ano, "clube_ogol": td[0], "lado": LADOS[lado],
                 "jogos": int(td[1]), "gols": int(td[2])}
        for i, f in enumerate(FAIXAS):
            linha[f"faixa_{f.replace('-', '_').replace('+', 'mais')}"] = int(td[4 + i])
        linha["primeiro_tempo"] = int(td[4 + len(FAIXAS)])
        linha["segundo_tempo"] = int(td[5 + len(FAIXAS)])
        # A soma das faixas TEM de bater com o total da linha — e a unica conferencia que a
        # propria pagina permite, e ela pega tanto erro de leitura quanto celula fora de lugar.
        soma = sum(linha[f"faixa_{f.replace('-', '_').replace('+', 'mais')}"] for f in FAIXAS)
        if soma != linha["gols"]:
            raise SystemExit(f"{ano}/{lado}/{td[0]}: as faixas somam {soma} e o total diz "
                             f"{linha['gols']} — nao gravo tabela que nao fecha")
        linhas.append(linha)
    if len(linhas) < 18:
        raise SystemExit(f"{ano}/{lado}: so {len(linhas)} clubes na tabela; a Serie B tem 20")
    return linhas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refazer", action="store_true", help="ignora o cache e baixa de novo")
    ap.add_argument("--anos", nargs="*", default=TEMPORADAS)
    args = ap.parse_args()

    ses = requests.Session()
    ses.headers.update(CABECA)

    tudo, do_cache, da_rede = [], 0, 0
    for ano in args.anos:
        if ano not in EDICOES:
            print(f"  ! {ano}: nao tenho o id da edicao", file=sys.stderr)
            continue
        for lado in LADOS:
            try:
                html, veio_do_cache = baixar(ses, ano, lado, args.refazer)
            except Exception as e:
                print(f"  ! {ano}/{lado}: {e}", file=sys.stderr)
                continue
            do_cache += veio_do_cache
            da_rede += not veio_do_cache
            linhas = ler(html, ano, lado)
            tudo += linhas
            print(f"  {ano} {LADOS[lado]:9} · {len(linhas)} clubes · "
                  f"{sum(l['gols'] for l in linhas)} gols"
                  + ("  (cache)" if veio_do_cache else ""))

    if not tudo:
        print("nada coletado", file=sys.stderr)
        return 1
    colunas = list(tudo[0])
    with open(SAIDA, "w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=colunas)
        w.writeheader()
        w.writerows(tudo)
    print(f"\n{os.path.relpath(SAIDA, AQUI)}: {len(tudo)} linhas "
          f"({da_rede} paginas da rede, {do_cache} do cache)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
