#!/usr/bin/env python3
"""Baixa do Transfermarkt os elencos de TODOS os clubes da Série B, temporada a temporada.

Por que não reaproveitamos a base que já existe: o `Portal Transfermarkt` (:5062) guarda
80 mil jogadores, mas ela nasceu da lista "os jogadores mais valiosos do mundo", fatiada
por confederação × posição × ano de nascimento. Isso quer dizer duas coisas que a
inviabilizam aqui:

  1. É UM RETRATO SÓ, do dia da coleta. Não existe coluna de temporada, então não há como
     perguntar "quem era o elenco do Novorizontino em 2023".
  2. NÃO É ELENCO, é ranking. Na Série B ela tem 490 jogadores em 20 clubes — a Ponte
     Preta aparece com 13 e o Náutico com 17. Quem está embaixo do corte de valor da
     fatia simplesmente não entrou.

Aqui a fonte é outra: a página de ELENCO de cada clube, que traz o plantel inteiro com
data de nascimento, altura, pé, contrato e valor. São 20 clubes × 5 temporadas = 100
páginas, mais 5 páginas de competição para saber QUEM eram os 20 de cada ano.

## A armadilha do saison_id (confira sempre, não deduza)

O `saison_id` do Transfermarkt é o ano de INÍCIO da temporada europeia. Para o Brasil,
onde o campeonato é de ano civil, isso significa **saison_id = ano − 1**:

    saison_id=2021  ->  <title> Campeonato Brasileiro Série B 2022
    saison_id=2025  ->  <title> Campeonato Brasileiro Série B 2026

Foi conferido de dois jeitos antes de a coleta rodar: pelo `<title>` da própria página e
pelos 20 clubes, que batem exatamente com as tabelas transcritas em `SB_TABELAS`
(static/app.js). Se um dia parecer que os elencos vieram do ano errado, é aqui que se
olha primeiro — e o script já grava o título da página em `_titulo` para conferência.

## As colunas MUDAM entre a temporada em curso e as passadas

Não dá para ler a tabela por posição fixa. A página da temporada corrente traz

    # · Jogadores · Nasc./Idade · Nac. · Altura · Pé · No time desde · Anterior · Contrato · Valor

e a de uma temporada passada troca "Contrato" por "Clube atual", que ainda por cima entra
ANTES da altura:

    # · Jogadores · Nasc./Idade · Nac. · Clube atual · Altura · Pé · No time desde · Anterior · Valor

A primeira versão deste script lia por índice e o resultado passou despercebido porque não
quebrou nada: a altura ia para o campo do pé, o pé ia para "no clube desde", e os três
campos saíam preenchidos com a coisa errada. Por isso a leitura agora é pelo CABEÇALHO —
`achar()` procura o nome da coluna e devolve o índice dela naquela página.

## A idade da página é de outro ano — não use

Na página de temporada passada, a idade mostrada é a idade em **1º de janeiro do
saison_id**, ou seja um ano inteiro antes da temporada brasileira. Brenno, nascido em
01/04/1999, aparece com 21 na página do Grêmio de 2022 (tinha 23). Conferido em dez
jogadores da mesma página: bate com 01/01/2021 em todos.

Então `idade` aqui é CALCULADA da data de nascimento, em 1º de julho do ano brasileiro —
meio de temporada. A idade impressa no site fica guardada em `idade_site` só para quem
quiser conferir.

## Ritmo

Uma conexão só, 2,5 a 4 segundos entre páginas. O Transfermarkt bloqueia por IP e a
experiência das coletas anteriores (`Portal Comparativo Jogadores/transfermarkt`) é que
3 conexões com 1s de pausa derrubam tudo em ~16 páginas. 105 páginas em fila levam uns
7 minutos, o que é barato o bastante para não valer o risco.

Retomável: o progresso vai para `dados/_serieb_progresso.json` a cada clube. Parar no
meio e rodar de novo continua de onde estava.

Uso:
    python3 coletar_serieb_transfermarkt.py            # continua de onde parou
    python3 coletar_serieb_transfermarkt.py --refazer  # do zero
"""
import datetime as dt
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
SAIDA = os.path.join(DADOS, "serieb_elencos.json")
PROGRESSO = os.path.join(DADOS, "_serieb_progresso.json")
# O HTML cru fica guardado. Custa uns 60 MB e evita ter de bater no Transfermarkt de novo
# toda vez que a LEITURA da tabela precisar de conserto — que foi exatamente o que
# aconteceu na primeira versao. A pasta esta no .gitignore.
CACHE = os.path.join(DADOS, "_serieb_html")

ANOS = [2022, 2023, 2024, 2025, 2026]
COMPETICAO = ("https://www.transfermarkt.com.br/campeonato-brasileiro-serie-b"
              "/startseite/wettbewerb/BRA2/plus/?saison_id={sid}")
ELENCO = "https://www.transfermarkt.com.br/x/kader/verein/{clube}/saison_id/{sid}/plus/1"

PAUSA = (2.5, 4.0)
# Recuo progressivo e não fixo: o bloqueio às vezes solta em menos de um minuto, e
# esperar 15 min de cara joga fora janelas curtas de acesso.
RECUOS = [45, 90, 180, 360, 600, 900, 900, 900]

CABECALHO = {
    "User-Agent": ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"),
    "Accept-Language": "pt-BR,pt;q=0.9",
}

SESSAO = requests.Session()
SESSAO.headers.update(CABECALHO)


def baixar(url, cache=None):
    """Pega a página, recuando quando o site fecha a porta. Devolve o HTML ou None.

    Com `cache`, guarda e reaproveita o HTML em disco — consertar a leitura da tabela não
    pode custar mais uma volta inteira no Transfermarkt.
    """
    if cache and os.path.exists(cache):
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
            if cache:
                os.makedirs(os.path.dirname(cache), exist_ok=True)
                with open(cache, "w", encoding="utf-8") as f:
                    f.write(r.text)
            return r.text
        if r.status_code == 404:
            return None            # clube sem página naquela temporada: não adianta insistir
        print(f"    HTTP {r.status_code}", flush=True)
    return None


def limpar(txt):
    return re.sub(r"\s+", " ", (txt or "")).strip()


def valor_em_euros(txt):
    """'€ 3,00 mi.' e '€ 5.40 mi.' -> 3000000 e 5400000 · '€ 900 mil' -> 900000 · '-' -> None.

    O SEPARADOR DECIMAL MUDA DE PÁGINA PARA PÁGINA. A mesma versão em português do site
    escreve '€ 3,00 mi.' com vírgula num lugar e '€ 5.40 mi.' com ponto em outro. Tratar o
    ponto como separador de milhar — o reflexo natural em texto em português — transforma
    5,40 milhões em 540 milhões: foi assim que o Lincoln do Cruzeiro de 2022 apareceu
    valendo € 540 mi. e o elenco inteiro saiu mil vezes maior.

    A regra que resolve: quando existe sufixo de escala (mil/mi/bi), o número antes dele é
    sempre menor que 1000, então qualquer separador ali é DECIMAL. Só quando os dois
    aparecem juntos é que o último manda e o outro é milhar.
    """
    t = limpar(txt).replace("€", "").replace("\xa0", " ").strip()
    if not t or t in {"-", "?", "s.i."}:
        return None
    m = re.match(r"^([\d.,]+)\s*(mil|mi\.?|bi\.?)?", t)
    if not m:
        return None
    num, escala = m.group(1), (m.group(2) or "").rstrip(".")
    if "." in num and "," in num:
        decimal = max(num.rfind("."), num.rfind(","))
        num = num[:decimal].replace(".", "").replace(",", "") + "." + num[decimal + 1:]
    elif escala:
        num = num.replace(",", ".")                 # separador único + escala = decimal
    else:
        num = num.replace(".", "").replace(",", "")  # sem escala, é número inteiro
    try:
        v = float(num)
    except ValueError:
        return None
    return int(round(v * {"mil": 1e3, "mi": 1e6, "bi": 1e9}.get(escala, 1)))


def clubes_do_ano(sid):
    """Os 20 clubes daquela temporada, com id. Devolve (titulo_da_pagina, lista)."""
    html = baixar(COMPETICAO.format(sid=sid))
    if not html:
        return "", []
    titulo = limpar(re.search(r"<title>([^<]*)</title>", html).group(1)) if "<title>" in html else ""
    vistos = {}
    for vid, nome in re.findall(
            r'href="/[^"/]+/startseite/verein/(\d+)/saison_id/%d"[^>]*>([^<]*)<' % sid, html):
        nome = limpar(nome)
        if nome and vid not in vistos:
            vistos[vid] = nome
    return titulo, [{"id_clube": vid, "clube": nome} for vid, nome in vistos.items()]


def ler_elenco(html, ano):
    """Transforma a tabela de elenco em linhas, lendo pelo CABEÇALHO.

    Ler por índice fixo não funciona: as colunas mudam entre a temporada corrente e as
    passadas (veja o cabeçalho do arquivo). Os nomes de nacionalidade e de clube NÃO estão
    no texto — moram no `title` das imagens de bandeira e de escudo.
    """
    sp = BeautifulSoup(html, "html.parser")
    tabela = sp.select_one("div.responsive-table table.items")
    if not tabela:
        return []
    cabecalho = [limpar(th.get_text(" ", strip=True)) for th in tabela.select("thead th")]

    def achar(*nomes):
        for i, c in enumerate(cabecalho):
            for n in nomes:
                if c.lower().startswith(n.lower()):
                    return i
        return None

    i_num, i_nome = achar("#"), achar("Jogadores")
    i_nasc, i_nac = achar("Nasc"), achar("Nac")
    i_alt, i_pe = achar("Altura"), achar("Pé")
    i_desde, i_ant = achar("No time desde"), achar("Anterior")
    i_contrato, i_atual = achar("Contrato"), achar("Clube atual")
    i_valor = achar("Valor de mercado")
    if i_nome is None or i_valor is None:
        return []

    ref = dt.date(ano, 7, 1)          # meio da temporada brasileira
    fora = []
    for tr in tabela.select("tbody > tr.odd, tbody > tr.even"):
        td = tr.find_all("td", recursive=False)
        if len(td) < len(cabecalho):
            continue
        cel = lambda i: td[i] if (i is not None and i < len(td)) else None
        txt = lambda i: limpar(cel(i).get_text(" ", strip=True)) if cel(i) is not None else None
        def titulo(i):
            c = cel(i)
            im = c.select_one("img[title]") if c is not None else None
            return im["title"] if im else None

        link = td[i_nome].select_one('a[href*="/profil/spieler/"]')
        if not link:
            continue
        id_jog = re.search(r"/spieler/(\d+)", link["href"])
        interna = td[i_nome].select("table.inline-table tr")
        posicao = limpar(interna[1].get_text(" ", strip=True)) if len(interna) > 1 else ""

        m = re.match(r"^(\d{2}/\d{2}/\d{4})?\s*(?:\((\d+)\))?$", txt(i_nasc) or "")
        nasc = m.group(1) if m else None
        idade = None
        if nasc:
            n = dt.datetime.strptime(nasc, "%d/%m/%Y").date()
            idade = ref.year - n.year - ((ref.month, ref.day) < (n.month, n.day))

        fora.append({
            "numero": txt(i_num) or None,
            "id_jogador": id_jog.group(1) if id_jog else None,
            "jogador": limpar(link.get_text()),
            "url": "https://www.transfermarkt.com.br" + link["href"],
            "posicao": posicao,
            "nascimento": nasc,
            "idade": idade,                                  # calculada em 01/07 do ano
            "idade_site": int(m.group(2)) if (m and m.group(2)) else None,
            "nacionalidades": [i["title"] for i in (cel(i_nac).select("img[title]")
                                                    if cel(i_nac) is not None else [])],
            "altura": txt(i_alt) or None,
            "pe": txt(i_pe) or None,
            "no_clube_desde": txt(i_desde) or None,
            "clube_anterior": titulo(i_ant),
            "contrato_ate": txt(i_contrato) or None,         # só na temporada corrente
            "clube_atual": titulo(i_atual),                  # só nas temporadas passadas
            "valor_texto": txt(i_valor) or None,
            "valor_eur": valor_em_euros(txt(i_valor)),
        })
    return fora


def carregar_progresso(refazer):
    if refazer or not os.path.exists(PROGRESSO):
        return {"anos": {}, "elencos": {}}
    with open(PROGRESSO, encoding="utf-8") as f:
        return json.load(f)


def gravar(obj, caminho):
    tmp = caminho + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
    os.replace(tmp, caminho)


def main():
    refazer = "--refazer" in sys.argv
    prog = carregar_progresso(refazer)
    os.makedirs(DADOS, exist_ok=True)

    for ano in ANOS:
        sid = ano - 1
        chave_ano = str(ano)
        if chave_ano not in prog["anos"]:
            print(f"[{ano}] buscando os clubes (saison_id={sid})...", flush=True)
            titulo, clubes = clubes_do_ano(sid)
            if not clubes:
                print(f"[{ano}] NÃO consegui a lista de clubes — pulando o ano", flush=True)
                continue
            # o título da página é a prova de que o saison_id aponta para o ano certo
            if str(ano) not in titulo:
                print(f"[{ano}] ATENÇÃO: o título da página é {titulo!r}, e não fala em {ano}. "
                      f"O mapeamento saison_id=ano-1 pode ter mudado. Parando por segurança.")
                sys.exit(1)
            prog["anos"][chave_ano] = {"saison_id": sid, "_titulo": titulo, "clubes": clubes}
            gravar(prog, PROGRESSO)
            time.sleep(random.uniform(*PAUSA))
        clubes = prog["anos"][chave_ano]["clubes"]
        print(f"[{ano}] {len(clubes)} clubes · {prog['anos'][chave_ano]['_titulo']}", flush=True)

        for c in clubes:
            ch = f"{ano}|{c['id_clube']}"
            if ch in prog["elencos"]:
                continue
            html = baixar(ELENCO.format(clube=c["id_clube"], sid=sid),
                          cache=os.path.join(CACHE, f"{ano}_{c['id_clube']}.html"))
            linhas = ler_elenco(html, ano) if html else []
            prog["elencos"][ch] = linhas
            print(f"    {c['clube']:<26} {len(linhas):>3} atletas", flush=True)
            gravar(prog, PROGRESSO)
            time.sleep(random.uniform(*PAUSA))

    # ---- monta a saída final, uma linha por atleta-temporada ----
    linhas = []
    for ano in ANOS:
        info = prog["anos"].get(str(ano))
        if not info:
            continue
        for c in info["clubes"]:
            for j in prog["elencos"].get(f"{ano}|{c['id_clube']}", []):
                linhas.append({"ano": ano, "clube": c["clube"], "id_clube": c["id_clube"], **j})
    gravar({
        "_leia": ("Elencos da Série B por temporada, do Transfermarkt. saison_id = ano-1 "
                  "(conferido pelo título da página). Uma linha por atleta-temporada."),
        "atualizado": time.strftime("%Y-%m-%d %H:%M"),
        "temporadas": {str(a): prog["anos"][str(a)]["_titulo"]
                       for a in ANOS if str(a) in prog["anos"]},
        "atletas": linhas,
    }, SAIDA)

    print(f"\n{len(linhas):,} linhas de atleta-temporada em {os.path.relpath(SAIDA, AQUI)}")
    for ano in ANOS:
        do_ano = [x for x in linhas if x["ano"] == ano]
        clubes = len({x["clube"] for x in do_ano})
        print(f"  {ano}: {len(do_ano):>5} atletas em {clubes} clubes")


if __name__ == "__main__":
    main()
