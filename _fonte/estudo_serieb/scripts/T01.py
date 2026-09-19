#!/usr/bin/env python3
"""T01 — quem comandou cada time da Serie B, em quais datas, de 2018 a 2026.

Nenhuma base do repositorio tem nome de treinador (conferido em 17/09: `serieb_tecnico.csv`
e export do Wyscout de JOGADORES, com as colunas `Jogador`, `Equipa`, `Minutos jogados:`).
Por isso esta coleta existe. Molde: `coletar_serieb_lesoes.py` — uma conexao, pausa de 2,5 a
4 s, recuo progressivo quando o site fecha a porta, HTML em cache e retomavel.

Sao duas voltas no site:

  1. A pagina da competicao de cada temporada (2018 a 2026) da os 20 clubes com o id do
     Transfermarkt. A uniao das nove listas e o conjunto de clubes a visitar — um clube que
     subiu e desceu aparece uma vez so.
  2. Uma pagina de historico de treinadores por clube. Ela traz a carreira inteira do clube,
     entao nove temporadas custam UMA pagina por clube, nao nove.

Sao ~60 clubes: uns quatro minutos, nao as duas horas e meia da coleta de lesoes.

## O que a pagina entrega

    Nome | Funcao | Nomeado | Saida | Tempo no cargo | Jogos | V | E | D | Media

`Jogos` conta TODAS as competicoes (estadual, copas, serie), nao so a Serie B. Por isso ele
entra na base como `jogos_tm` e nao vale como "rodadas". As RODADAS da Serie B saem depois,
cruzando as datas da passagem com `dados/serieb_jogos.csv` — que e o passo 2 do T01, no
script `T01_rodadas.py`, e depende da classificacao por rodada do A01.

## Datas

O Transfermarkt escreve "14/07/2025". Passagem em curso vem com "-" na saida: fica `None`,
e a base marca `em_curso`. Interino: o site escreve a funcao ("Treinador interino" ou
"Treinador" ); guardamos a funcao crua em `funcao` e derivamos `interino`.

Uso:
    python3 _fonte/estudo_serieb/scripts/T01.py --teste   # 2 clubes, para conferir a leitura
    python3 _fonte/estudo_serieb/scripts/T01.py           # continua de onde parou
    python3 _fonte/estudo_serieb/scripts/T01.py --refazer # do zero
"""
import csv
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
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
RESULTADOS = os.path.join(ESTUDO, "resultados")
CACHE = os.path.join(ESTUDO, "_cache_T01")
PROGRESSO = os.path.join(CACHE, "_progresso.json")
SAIDA = os.path.join(RESULTADOS, "base_passagens.csv")
CLUBES_JSON = os.path.join(RESULTADOS, "T01_clubes.json")

# ATENCAO, conferido em 17/09: no Transfermarkt o `saison_id` das competicoes brasileiras
# e o ano civil MENOS UM — a pagina de `saison_id=2021` tem o titulo "Serie B 2022". Pedir
# 2018..2026 traz as temporadas 2019..2026 e PERDE a de 2018 (foi assim que o Boa Esporte,
# que so jogou 2018, ficou fora da primeira volta). Pedimos sid = ano - 1.
# A temporada em curso e um caso a parte: nao havendo `saison_id` 2026 (=2027), o site
# devolve a corrente, entao sid 2025 e sid 2026 dao a mesma pagina de 2026.
TEMPORADAS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
SID = {ano: ano - 1 for ano in TEMPORADAS}
COMPETICAO = ("https://www.transfermarkt.com.br/campeonato-brasileiro-serie-b"
              "/startseite/wettbewerb/BRA2/plus/?saison_id={sid}")
# A pagina crua e a COMISSAO TECNICA inteira desde os anos 1950 (291 linhas no Juventude):
# auxiliar, preparador, observador, coordenador. O filtro `personalie_id` e o que separa
# o treinador do resto — 1 e efetivo, 10 e interino. Sao duas paginas por clube.
HISTORICO = ("https://www.transfermarkt.com.br/x/mitarbeiterhistorie/verein/{clube}"
             "/personalie_id/{pid}")
FUNCOES = {"1": "Treinador", "10": "Treinador interino"}

PAUSA = (2.5, 4.0)
RECUOS = [45, 90, 180, 360, 600, 900, 900, 900]

SESSAO = requests.Session()
SESSAO.headers.update({
    "User-Agent": ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"),
    "Accept-Language": "pt-BR,pt;q=0.9",
})


def baixar(url, cache=None):
    """A pagina, recuando quando o site fecha a porta. HTML em cache para nao rebater."""
    if cache and os.path.exists(cache):
        with open(cache, encoding="utf-8") as f:
            return f.read()
    for i, espera in enumerate([0] + RECUOS):
        if espera:
            print(f"    bloqueado; esperando {espera}s", flush=True)
            time.sleep(espera)
        try:
            r = SESSAO.get(url, timeout=30)
        except requests.RequestException as e:
            print(f"    erro de rede ({e}); tentativa {i + 1}", flush=True)
            continue
        if r.status_code == 200:
            if cache:
                os.makedirs(os.path.dirname(cache), exist_ok=True)
                with open(cache, "w", encoding="utf-8") as f:
                    f.write(r.text)
            return r.text
        print(f"    HTTP {r.status_code}; tentativa {i + 1}", flush=True)
    return None


def limpar(txt):
    return re.sub(r"\s+", " ", (txt or "").replace("\xa0", " ")).strip()


def data(txt):
    """'14/07/2025' -> date. '-', '?' e vazio -> None."""
    m = re.search(r"(\d{1,2})/(\d{1,2})/(\d{4})", txt or "")
    if not m:
        return None
    d, mes, a = (int(x) for x in m.groups())
    try:
        return dt.date(a, mes, d)
    except ValueError:
        return None


def clubes_do_ano(sid):
    """Os clubes daquela temporada, com id do Transfermarkt."""
    html = baixar(COMPETICAO.format(sid=sid), os.path.join(CACHE, f"comp_{sid}.html"))
    if not html:
        return []
    m = re.search(r"<title>([^<]*)</title>", html)
    if m and not re.search(r"S[eé]rie B\s+%d" % (sid + 1), m.group(1)):
        print(f"    AVISO: saison_id {sid} devolveu '{limpar(m.group(1))}' "
              f"— esperava a temporada {sid + 1}")
    # NAO fixar o saison_id na busca: na temporada em curso (2026) o Transfermarkt escreve
    # os links dos clubes com o saison_id ANTERIOR, e a busca com o ano certo volta vazia.
    # A lista sai da tabela de classificacao da pagina, que so tem os clubes da competicao.
    sopa = BeautifulSoup(html, "html.parser")
    vistos = {}
    for tabela in sopa.select("table.items"):
        for a in tabela.find_all("a", href=True):
            m = re.match(r"/[^/]+/startseite/verein/(\d+)", a["href"])
            if not m:
                continue
            nome = limpar(a.get("title") or a.get_text())
            if nome and m.group(1) not in vistos:
                vistos[m.group(1)] = nome
    return [{"id_clube": vid, "clube": nome} for vid, nome in vistos.items()]


def ler_historico(html):
    """A tabela de treinadores, lida PELO CABECALHO (as colunas mudam entre clubes).

    Devolve uma lista de dicionarios crus; a filtragem por periodo e por funcao fica no main.
    """
    sopa = BeautifulSoup(html, "html.parser")
    linhas = []
    for tabela in sopa.select("table.items"):
        cabs = [limpar(th.get_text()) for th in tabela.select("thead th")]
        if not cabs:
            continue

        def idx(*nomes):
            for n in nomes:
                for i, c in enumerate(cabs):
                    if c.lower().startswith(n.lower()):
                        return i
            return None

        # Cabecalho real da pagina, conferido em 17/09:
        #   Nome/Data de nascimento | Nac. | Desde | Fim de periodo | Periodo | Jogos | PPJ
        i_nome = idx("Nome", "Treinador")
        i_de = idx("Desde", "Nomeado", "Designado")
        i_ate = idx("Fim de", "Saida", "Saída", "Demitido")
        i_jogos = idx("Jogos", "Partidas")
        i_ppj = idx("PPJ", "Média de pontos", "Pontos")
        if i_nome is None or i_de is None:
            continue
        for tr in tabela.select("tbody tr"):
            tds = tr.find_all("td", recursive=False)
            if len(tds) <= i_nome:
                continue
            cel = [limpar(td.get_text(" ")) for td in tds]

            def pega(i):
                return cel[i] if i is not None and i < len(cel) else ""

            nome = pega(i_nome)
            # A celula do nome traz nome + funcao/idade coladas; o link tem o nome limpo.
            a = tds[i_nome].find("a", title=True)
            if a and limpar(a.get("title")):
                nome = limpar(a["title"])
            elif a:
                nome = limpar(a.get_text())
            if not nome:
                continue
            linhas.append({
                "treinador": nome,
                "de": pega(i_de),
                "ate": pega(i_ate),
                "jogos_tm": pega(i_jogos),
                "ppj_tm": pega(i_ppj),
            })
    return linhas


def carregar(refazer):
    if refazer or not os.path.exists(PROGRESSO):
        return {"clubes_feitos": [], "passagens": []}
    with open(PROGRESSO, encoding="utf-8") as f:
        return json.load(f)


def gravar(obj, caminho):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    tmp = caminho + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
    os.replace(tmp, caminho)


def main():
    teste = "--teste" in sys.argv
    refazer = "--refazer" in sys.argv
    os.makedirs(CACHE, exist_ok=True)
    os.makedirs(RESULTADOS, exist_ok=True)

    print("1) clubes da Serie B, temporada a temporada")
    clubes, por_ano = {}, {}
    for ano in TEMPORADAS:
        lista = clubes_do_ano(SID[ano])
        por_ano[ano] = [c["id_clube"] for c in lista]
        for c in lista:
            clubes.setdefault(c["id_clube"], c["clube"])
        print(f"   {ano} (saison_id {SID[ano]}): {len(lista)} clubes")
        time.sleep(random.uniform(*PAUSA))
    gravar({"por_ano": {str(k): v for k, v in por_ano.items()},
            "nomes": clubes}, CLUBES_JSON)
    print(f"   {len(clubes)} clubes distintos em 2018-2026")

    alvos = sorted(clubes.items())
    if teste:
        alvos = alvos[:2]
        print(f"\n   MODO TESTE: so {len(alvos)} clubes")

    prog = carregar(refazer)
    feitos = set(prog["clubes_feitos"])
    passagens = prog["passagens"]

    print(f"\n2) historico de treinadores ({len(alvos) - len(feitos & set(clubes))} a baixar)")
    for n, (vid, nome) in enumerate(alvos, 1):
        conta = []
        for pid, rotulo in FUNCOES.items():
            chave = f"{vid}|{pid}"
            if chave in feitos:
                continue
            html = baixar(HISTORICO.format(clube=vid, pid=pid),
                          os.path.join(CACHE, f"hist_{vid}_{pid}.html"))
            if not html:
                print(f"   [{n}/{len(alvos)}] {nome} ({rotulo}): FALHOU, fica para a proxima")
                continue
            linhas = ler_historico(html)
            for l in linhas:
                l["id_clube"] = vid
                l["clube"] = nome
                l["funcao"] = rotulo
            passagens.extend(linhas)
            feitos.add(chave)
            conta.append(f"{len(linhas)} {rotulo.lower()}")
            gravar({"clubes_feitos": sorted(feitos), "passagens": passagens}, PROGRESSO)
            time.sleep(random.uniform(*PAUSA))
        if conta:
            print(f"   [{n}/{len(alvos)}] {nome}: " + ", ".join(conta))

    print("\n3) gravando a base")
    linhas = []
    for p in passagens:
        de, ate = data(p["de"]), data(p["ate"])
        if de is None:
            continue
        # So o que toca 2018-2026. Passagem em curso (ate=None) conta.
        if (ate or dt.date.today()).year < 2018 or de.year > 2026:
            continue
        func = p.get("funcao") or ""
        linhas.append({
            "treinador": p["treinador"],
            "clube": p["clube"],
            "id_clube": p["id_clube"],
            "funcao": func,
            "interino": int("interino" in func.lower() or "interina" in func.lower()),
            "inicio": de.isoformat(),
            "fim": ate.isoformat() if ate else "",
            "em_curso": int(ate is None),
            "dias": (ate - de).days if ate else "",
            "jogos_tm": re.sub(r"[^\d]", "", p.get("jogos_tm") or "") or "",
            "ppj_tm": (p.get("ppj_tm") or "").replace(",", ".").strip(),
        })
    linhas.sort(key=lambda r: (r["clube"], r["inicio"]))
    with open(SAIDA, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(linhas[0]) if linhas else
                           ["treinador", "clube", "id_clube", "funcao", "interino",
                            "inicio", "fim", "em_curso", "dias", "jogos_tm", "ppj_tm"])
        w.writeheader()
        w.writerows(linhas)
    print(f"   {SAIDA}: {len(linhas)} passagens, "
          f"{len({l['treinador'] for l in linhas})} treinadores distintos, "
          f"{len({l['clube'] for l in linhas})} clubes")
    print("\n   ATENCAO: `jogos_tm` conta todas as competicoes. As RODADAS da Serie B")
    print("   saem no passo 2 (T01_rodadas.py), cruzando as datas com serieb_jogos.csv.")


if __name__ == "__main__":
    main()
