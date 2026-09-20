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

## Passo 3: a saida dos numeros (20/09)

No fim da coleta o script grava `resultados/T01_numeros.json` com os 47 marcadores que
`resultados/T01.json` publica, recalculados do dado — porque ate 19/09 eles eram DIGITADOS e o
`gerado_por` da parte alegava uma procedencia que nao existia (regras 1 e 9 de `_portao.py`).
Esse passo so LE as bases (inclusive a do passo 2) e grava um arquivo novo; ele nao muda a
coleta, nao recalcula nada do passo 2 e NAO escreve em `T01.json`. Ao fim ele imprime a
conferencia contra o publicado: o que nao bate e dito, e nao consertado.

Uso:
    python3 _fonte/estudo_serieb/scripts/T01.py --teste   # 2 clubes, para conferir a leitura
    python3 _fonte/estudo_serieb/scripts/T01.py           # continua de onde parou
    python3 _fonte/estudo_serieb/scripts/T01.py --refazer # do zero
    python3 _fonte/estudo_serieb/scripts/T01.py --numeros # so o passo 3, sem tocar no site
"""
import collections
import csv
import datetime as dt
import decimal
import json
import os
import random
import re
import statistics
import sys
import time
import unicodedata

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

# Passo 3, acrescentado em 20/09: a SAIDA DOS NUMEROS. Ver a secao no fim do arquivo.
NUMEROS_JSON = os.path.join(RESULTADOS, "T01_numeros.json")
RODADA_TREINADOR = os.path.join(RESULTADOS, "T01_rodada_treinador.csv")
DADOS = os.path.join(RAIZ, "dados")
BOLA_PARADA = os.path.join(DADOS, "bola_parada.json")
PROTOTIPO = os.path.join(DADOS, "prototipo.json")
# Data fixa, nao dinamica: o passo 3 e reproduzivel e rodar duas vezes tem de dar o MESMO
# arquivo, byte a byte. Quem mudar o calculo muda esta data na mao.
GERADO_EM = "2026-09-20"
# O criterio unico de "passagem que conta", declarado em T01_numeros_novos.json: 10 ou mais
# RODADAS de Serie B no mesmo clube-temporada, interino incluido.
MINIMO_RODADAS = 10

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


# ==============================================================================================
# PASSO 3 — A SAIDA DOS NUMEROS (acrescentado em 20/09)
# ==============================================================================================
# POR QUE EXISTE. A regra da casa e "nenhum numero digitado a mao". Ate 19/09 os 47 marcadores
# publicados em resultados/T01.json eram digitados: `grep` nao acha um so deles nos dois scripts
# da parte, e a auditoria (resultados/_robustez_19_09.json, partes.T01) mostrou que 5 estavam
# desatualizados. O portao (scripts/_portao.py, regras 1 e 9) cobra que TODO marcador publicado
# saia de resultados/T01_numeros.json, gravado pelo script que o `gerado_por` declara.
#
# O QUE MUDA E O QUE NAO MUDA. Nada da COLETA muda: base_passagens.csv e T01_clubes.json saem
# identicos ao que saiam antes. Este passo so LE — base_passagens.csv (passo 1, aqui),
# T01_rodada_treinador.csv (passo 2, T01_rodadas.py), os jogos de Serie B, o bola_parada.json e o
# prototipo.json — e grava um arquivo novo. Ele NAO escreve em T01.json: a saida daqui e a
# CONFERENCIA do que esta publicado, nao a substituicao.
#
# DE ONDE VEM CADA CONTA. Das receitas de resultados/T01_numeros_novos.json, campo `de_onde`,
# escritas em 19/09 e conferidas por dois caminhos. Nada foi reinventado aqui.
#
# A TEMPORADA NAO E O ANO DA DATA. A Serie B de 2020 comecou em agosto/2020 e terminou em
# janeiro/2021: pelo ano da data ela vira duas temporadas, 2021 aparece com 28 clubes e a
# passagem que atravessa a virada e contada duas vezes. A temporada sai dos BLOCOS de meses com
# jogo, cada bloco levando o ano do seu primeiro mes. E por isso que os numeros de contagem daqui
# (180 clube-temporadas, 492 passagens-temporada) nao sao os que o passo 2 imprime no terminal
# (188 e 506): o passo 2 agrupa por `d.year`, e ele nao foi tocado.


def blocos_de_temporada(datas):
    """A temporada de cada (ano, mes) com jogo. COPIA LITERAL de scripts/A01.py, mesma funcao.

    Copiada e nao importada de proposito: `import A01` amarraria a coleta do T01 a um script de
    outra parte (e mudaria, de lambugem, o que o portao diz na regra 5, que fala de metodo de
    teste e nao tem nada a ver com este agrupamento). Se A01 mudar a regra, esta copia muda junto.
    """
    meses = sorted({(d.year, d.month) for d in datas})
    blocos, atual = [], [meses[0]]
    for a, b in zip(meses, meses[1:]):
        seguinte = (a[0] + 1, 1) if a[1] == 12 else (a[0], a[1] + 1)
        if b == seguinte:
            atual.append(b)
        else:
            blocos.append(atual)
            atual = [b]
    blocos.append(atual)
    return {m: bl[0][0] for bl in blocos for m in bl}


def arredondar(x, casas=0):
    """Arredondado, nunca truncado, e meio para cima — a regra declarada em T01_numeros_novos.json.

    O `round` do Python arredonda o meio para o PAR (round(24.5) = 24), que nao e o que o texto
    do estudo promete. 24,375 -> 24; 41,875 -> 42; 2,31875 -> 2,32.
    """
    q = decimal.Decimal(1).scaleb(-casas)
    v = decimal.Decimal(repr(float(x))).quantize(q, rounding=decimal.ROUND_HALF_UP)
    return int(v) if casas == 0 else float(v)


def inteiro_se_der(x):
    """2.0 -> 2. A mediana de 160 inteiros sai float e sairia '2,0 treinadores' na tela."""
    return int(x) if float(x) == int(x) else x


def jogos_de_serieb():
    """(clube_wyscout, data) de cada jogo de Serie B de 2018 a 2026, um por clube e partida.

    Mesmo filtro do passo 2 (scripts/T01_rodadas.py:jogos_serieb): `Competição == "Brazil. Serie
    B"` em dados/serieb_jogos.csv e dados/serieb_jogos_2018_2021.csv, linha com data legivel.
    """
    saida = []
    for arq in ("serieb_jogos.csv", "serieb_jogos_2018_2021.csv"):
        caminho = os.path.join(DADOS, arq)
        if not os.path.exists(caminho):
            continue
        with open(caminho, encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                if r.get("Competição") != "Brazil. Serie B":
                    continue
                texto = r.get("Data") or ""
                m = re.search(r"(\d{4})-(\d{2})-(\d{2})", texto)
                if m:
                    d = dt.date(*(int(x) for x in m.groups()))
                else:
                    m2 = re.search(r"(\d{1,2})/(\d{1,2})/(\d{4})", texto)
                    if not m2:
                        continue
                    d = dt.date(int(m2.group(3)), int(m2.group(2)), int(m2.group(1)))
                saida.append((r["Equipa"], d))
    return saida


# -- a ponte de nome de clube entre o Sofascore e o Wyscout ------------------------------------
# Mesma regra do passo 2 para o Transfermarkt: token em comum depois de tirar as particulas de
# razao social, com as UFs escritas por extenso normalizadas ("goianiense" -> "go"). Os ANOS
# decidem — os anos de Serie B do clube no Sofascore tem de caber nos anos do clube no Wyscout —,
# e e o teste dos anos que separa "Grêmio Novorizontino" de "Grêmio".
LIXO_CLUBE = {"ec", "fc", "sc", "aa", "ad", "ca", "cr", "ge", "fbpa", "fec", "ac", "se",
              "esporte", "clube", "futebol", "associacao", "regatas", "do", "de", "da",
              "recreativo", "esportivo", "fr"}
UF_POR_EXTENSO = {"mineiro": "mg", "paranaense": "pr", "goianiense": "go", "paulista": "sp",
                  "catarinense": "sc", "gaucho": "rs", "pernambucano": "pe", "cearense": "ce",
                  "baiano": "ba", "carioca": "rj"}
# O unico par sem nenhum token em comum, declarado e conferido pelos anos (Serie B 2026 dos dois
# lados). Adivinhar aqui casaria com "Brasil de Pelotas", que e outro clube.
ALIAS_SOFA = {"Clube De Regatas Brasil": "CRB"}
# As particulas do NOME de pessoa. "Alexsandro de Souza" e "Alex" nao batem por aqui — e nao
# devem: sao o par de apelido que o texto da parte registra a mao.
LIXO_NOME = {"de", "da", "do", "dos", "das"}


def sem_acento(t):
    t = unicodedata.normalize("NFD", str(t or ""))
    return "".join(c for c in t if unicodedata.category(c) != "Mn").lower()


def tokens_de_clube(nome):
    return {UF_POR_EXTENSO.get(t, t)
            for t in re.sub(r"[^a-z0-9]+", " ", sem_acento(nome)).split()
            if t and t not in LIXO_CLUBE}


def tokens_de_nome(nome):
    return {t for t in re.sub(r"[^a-z0-9]+", " ", sem_acento(nome)).split()
            if t and t not in LIXO_NOME}


def mesmo_treinador(a, b):
    """Os tokens de um nome contidos nos do outro: 'Enderson Moreira' == 'Enderson'."""
    ta, tb = tokens_de_nome(a), tokens_de_nome(b)
    return bool(ta) and bool(tb) and (ta <= tb or tb <= ta)


def numeros_da_parte():
    """Os 47 marcadores que resultados/T01.json publica, recalculados do dado. Devolve (numeros,
    avisos) — ou (None, avisos) quando falta base, porque saida pela metade e pior que saida
    nenhuma: ela passaria por conferencia sem ser uma."""
    avisos = []
    if not os.path.exists(RODADA_TREINADOR):
        avisos.append(f"falta {os.path.basename(RODADA_TREINADOR)}: rode antes o passo 2, "
                      "python3 scripts/T01_rodadas.py")
        return None, avisos
    if not os.path.exists(SAIDA):
        avisos.append(f"falta {os.path.basename(SAIDA)}: rode antes o passo 1 (este script).")
        return None, avisos

    n = {}

    # ---- 1) o que o passo 1 ja contava: a base crua de passagens ----------------------------
    with open(SAIDA, encoding="utf-8-sig") as f:
        brutas = list(csv.DictReader(f))
    n["passagens_brutas"] = len(brutas)
    n["clubes"] = len({p["clube"] for p in brutas})
    # Regra 1 do passo 2: passagem com `Jogos` = 0 no Transfermarkt nao comanda rodada nenhuma.
    n["sem_jogo_no_tm"] = sum(1 for p in brutas
                              if (p.get("jogos_tm") or "0").strip() in ("", "0"))

    # ---- 2) os jogos de Serie B, e a temporada pelos blocos de meses ------------------------
    jogos = jogos_de_serieb()
    mapa = blocos_de_temporada([d for _, d in jogos])
    def temporada(d):
        return mapa[(d.year, d.month)]
    n["rodadas_jogadas"] = len(jogos)
    jogados_por_ct = collections.Counter((c, temporada(d)) for c, d in jogos)
    anos_do_clube = collections.defaultdict(set)
    for c, d in jogos:
        anos_do_clube[c].add(temporada(d))

    # ---- 3) a rodada com dono: a base do passo 2, reagrupada pela temporada certa ------------
    with open(RODADA_TREINADOR, encoding="utf-8-sig") as f:
        rodadas = list(csv.DictReader(f))
    for l in rodadas:
        l["_temporada"] = temporada(dt.date.fromisoformat(l["data"]))
        l["_interino"] = l["interino"] == "1"
    n["rodadas_com_dono"] = len(rodadas)
    n["rodadas_sem_dono"] = n["rodadas_jogadas"] - n["rodadas_com_dono"]
    n["rodadas_interino"] = sum(1 for l in rodadas if l["_interino"])
    n["pct_rodadas_interino"] = arredondar(
        100 * n["rodadas_interino"] / n["rodadas_com_dono"], 1)
    n["treinadores"] = len({l["treinador"] for l in rodadas})
    n["temporadas"] = len({l["_temporada"] for l in rodadas})
    # Segundo caminho para `clubes`: o passo 2 conta 51 clubes distintos na mesma base.
    clubes_na_rodada = len({l["clube_wyscout"] for l in rodadas})
    if clubes_na_rodada != n["clubes"]:
        avisos.append(f"clubes: base_passagens.csv da {n['clubes']} e "
                      f"T01_rodada_treinador.csv da {clubes_na_rodada}")

    # ---- 4) clube-temporada: quantas existem, e quanto delas tem dono ------------------------
    todas_ct = sorted(jogados_por_ct)
    fechadas = [k for k in todas_ct if k[1] <= 2025]
    n["clube_temporadas"] = len(todas_ct)
    n["clube_temporadas_fechadas"] = len(fechadas)
    com_dono_por_ct = collections.Counter((l["clube_wyscout"], l["_temporada"]) for l in rodadas)
    n["cobertura_exata"] = sum(1 for k, t in jogados_por_ct.items() if com_dono_por_ct.get(k, 0) == t)
    n["cobertura_buraco"] = sum(1 for k, t in jogados_por_ct.items() if com_dono_por_ct.get(k, 0) < t)
    n["cobertura_sobra"] = sum(1 for k, t in jogados_por_ct.items() if com_dono_por_ct.get(k, 0) > t)

    # ---- 5) treinadores efetivos por clube-temporada: a troca de treinador ------------------
    # O interino ANINHA dentro do efetivo (regra 2 do passo 2), entao quem conta a troca e o
    # efetivo: o interino de dois jogos nao e uma troca de comando.
    efetivos = {k: set() for k in todas_ct}
    for l in rodadas:
        if not l["_interino"]:
            efetivos.setdefault((l["clube_wyscout"], l["_temporada"]), set()).add(l["treinador"])
    quantos = {k: len(efetivos.get(k, ())) for k in todas_ct}
    nas_fechadas = [quantos[k] for k in fechadas]
    n["mediana_efetivos"] = inteiro_se_der(statistics.median(nas_fechadas))
    media = sum(nas_fechadas) / len(nas_fechadas)
    n["media_efetivos_fechadas"] = arredondar(media, 2)
    n["media_trocas_fechadas"] = arredondar(media - 1, 1)
    n["max_efetivos"] = max(quantos.values())
    n["um_efetivo_so"] = sum(1 for k in todas_ct if quantos[k] == 1)
    n["pct_um_efetivo_so"] = arredondar(100 * n["um_efetivo_so"] / len(todas_ct))
    n["um_efetivo_so_fechadas"] = sum(1 for v in nas_fechadas if v == 1)
    n["pct_um_efetivo_so_fechadas"] = arredondar(
        100 * n["um_efetivo_so_fechadas"] / len(nas_fechadas))
    n["tres_ou_mais_efetivos_fechadas"] = sum(1 for v in nas_fechadas if v >= 3)
    n["pct_tres_ou_mais_efetivos_fechadas"] = arredondar(
        100 * n["tres_ou_mais_efetivos_fechadas"] / len(nas_fechadas))
    em_2026 = [k for k in todas_ct if k[1] == 2026]
    n["um_efetivo_so_2026"] = sum(1 for k in em_2026 if quantos[k] == 1)
    pct_por_ano = {}
    for ano in sorted({k[1] for k in fechadas}):
        do_ano = [k for k in fechadas if k[1] == ano]
        pct_por_ano[ano] = arredondar(100 * sum(1 for k in do_ano if quantos[k] == 1) / len(do_ano))
    n["faixa_pct_um_efetivo_anos_fechados"] = (f"{min(pct_por_ano.values())}% a "
                                               f"{max(pct_por_ano.values())}%")

    # Terminar com quem comecou: o EFETIVO da primeira rodada com dono e o da ultima, no mesmo
    # ano. Interino ignorado nas duas pontas, porque ele aninha dentro do efetivo.
    pontas = collections.defaultdict(list)
    for l in rodadas:
        if not l["_interino"]:
            pontas[(l["clube_wyscout"], l["_temporada"])].append((l["data"], l["treinador"]))
    n["termina_com_quem_comecou"] = sum(
        1 for k in fechadas
        if pontas.get(k) and sorted(pontas[k])[0][1] == sorted(pontas[k])[-1][1])

    # ---- 6) passagem-temporada, e o corte de 10 rodadas -------------------------------------
    passagens = collections.Counter(
        (l["clube_wyscout"], l["treinador"], l["inicio"], l["fim"], l["_temporada"])
        for l in rodadas)
    n["passagens_temporada"] = len(passagens)
    n["passagens_2226"] = sum(1 for k in passagens if 2022 <= k[4] <= 2026)
    n["com_10_rodadas"] = sum(1 for v in passagens.values() if v >= MINIMO_RODADAS)
    n["treinadores_com_10"] = len({k[1] for k, v in passagens.items() if v >= MINIMO_RODADAS})

    def clubes_por_treinador(de, ate):
        m = collections.defaultdict(set)
        for k, v in passagens.items():
            if v >= MINIMO_RODADAS and de <= k[4] <= ate:
                m[k[1]].add(k[0])
        return m

    todos = clubes_por_treinador(2018, 2026)
    n["rodam_3_clubes"] = sum(1 for cs in todos.values() if len(cs) >= 3)
    n["rodam_3_clubes_2225"] = sum(1 for cs in clubes_por_treinador(2022, 2025).values()
                                   if len(cs) >= 3)
    n["rodam_3_clubes_2226"] = sum(1 for cs in clubes_por_treinador(2022, 2026).values()
                                   if len(cs) >= 3)
    # A lista do texto: quem tem SEIS clubes ou mais. Ordenada por clubes e depois pelo nome,
    # para a saida nao depender da ordem em que o dicionario foi montado.
    ranking = sorted(((len(cs), t) for t, cs in todos.items()), key=lambda x: (-x[0], x[1]))
    n["topo_clubes"] = [{"treinador": t, "clubes": q} for q, t in ranking if q >= 6]
    n["clubes_allan_aal"] = len(todos.get("Allan Aal", ()))
    # `clubes_sete` e `clubes_seis` sao os dois GRUPOS que o texto da parte nomeia ("Claudinei
    # Oliveira, Marcelo Cabo e Mozart em X cada", "Daniel Paulista e Guto Ferreira em Y"). Sao
    # medidos nos treinadores nomeados, como o clubes_allan_aal: se o grupo deixar de ser
    # uniforme, o marcador nao existe mais e o aviso diz isso em vez de esconder.
    for marcador, grupo in (("clubes_sete", ("Claudinei Oliveira", "Marcelo Cabo", "Mozart")),
                            ("clubes_seis", ("Daniel Paulista", "Guto Ferreira"))):
        contas = {t: len(todos.get(t, ())) for t in grupo}
        n[marcador] = max(contas.values())
        if len(set(contas.values())) > 1:
            avisos.append(f"{marcador}: o grupo do texto deixou de ser uniforme — {contas}")

    # ---- 7) o caso de apelido que o texto cita ----------------------------------------------
    n["marcinho_rodadas"] = sum(1 for l in rodadas if l["treinador"] == "Marcinho"
                                and l["clube_wyscout"] == "Ituano" and l["_temporada"] == 2023)

    # ---- 8) o cruzamento com o Sofascore (dados/bola_parada.json) ---------------------------
    bp = json.load(open(BOLA_PARADA, encoding="utf-8"))
    serieb = [t for t in bp.get("trabalhos", []) if str(t.get("comp", "")).startswith("Série B")]
    dez = [t for t in serieb if (t.get("jogos") or 0) >= MINIMO_RODADAS]
    n["sofa_10"] = len(dez)
    anos_sofa = collections.defaultdict(set)
    for t in serieb:
        anos_sofa[t["time"]].add(int(str(t["comp"]).split()[-1]))
    ponte, sem_par = {}, []
    for nome_sofa, anos in sorted(anos_sofa.items()):
        if nome_sofa in ALIAS_SOFA:
            ponte[nome_sofa] = ALIAS_SOFA[nome_sofa]
            continue
        cands = [w for w in anos_do_clube
                 if (tokens_de_clube(nome_sofa) & tokens_de_clube(w)) and anos <= anos_do_clube[w]]
        if len(cands) == 1:
            ponte[nome_sofa] = cands[0]
        else:
            sem_par.append(nome_sofa)
    if sem_par:
        avisos.append("ponte Sofascore->Wyscout sem decisao clara: " + ", ".join(sem_par))
    tecnicos_do_ct = collections.defaultdict(set)
    for l in rodadas:
        tecnicos_do_ct[(l["clube_wyscout"], l["_temporada"])].add(l["treinador"])
    batem = 0
    for t in dez:
        ano = int(str(t["comp"]).split()[-1])
        nossos = tecnicos_do_ct.get((ponte.get(t["time"]), ano), set())
        if any(mesmo_treinador(t.get("tec"), x) for x in nossos):
            batem += 1
    n["sofa_batem"] = batem
    n["sofa_nao_batem"] = n["sofa_10"] - batem

    # ---- 9) a estimativa da etapa 15 da Prototipo (dados/prototipo.json) --------------------
    etapa15 = (json.load(open(PROTOTIPO, encoding="utf-8"))
               .get("etapa_15", {}).get("coleta_que_resolveria", {}))
    faixa = list(etapa15.get("passagens_estimadas") or [])
    n["etapa15_estimativa"] = faixa
    n["etapa15_min"] = faixa[0] if faixa else None
    n["etapa15_max"] = faixa[1] if len(faixa) > 1 else None
    n["etapa15_clube_temporadas"] = etapa15.get("clube_temporada")
    # Segundo caminho do 100: a base do estudo tem mesmo 100 clube-temporadas de 2022 a 2026.
    nossas_2226 = sum(1 for k in todas_ct if 2022 <= k[1] <= 2026)
    if nossas_2226 != n["etapa15_clube_temporadas"]:
        avisos.append(f"etapa15_clube_temporadas: a Prototipo estima "
                      f"{n['etapa15_clube_temporadas']} e a base tem {nossas_2226}")
    return n, avisos


def gravar_numeros():
    """Grava resultados/T01_numeros.json e confere, marcador a marcador, contra o publicado."""
    numeros, avisos = numeros_da_parte()
    for a in avisos:
        print(f"   AVISO: {a}")
    if numeros is None:
        print("   T01_numeros.json NAO foi gravado (falta base). Nada foi apagado.")
        return None
    gravar({"parte": "T01",
            "gerado_por": "scripts/T01.py",
            "gerado_em": GERADO_EM,
            "o_que_e": ("Os marcadores que resultados/T01.json publica, recalculados do dado "
                        "pelo passo 3 deste script. E a CONFERENCIA do publicado, nao a "
                        "substituicao: quem discorda de T01.json fica registrado como achado."),
            "de_onde": ["resultados/base_passagens.csv (passo 1, scripts/T01.py)",
                        "resultados/T01_rodada_treinador.csv (passo 2, scripts/T01_rodadas.py)",
                        "dados/serieb_jogos.csv + dados/serieb_jogos_2018_2021.csv",
                        "dados/bola_parada.json (Sofascore)",
                        "dados/prototipo.json (etapa_15)"],
            "temporada": ("blocos de meses com jogo, a regra de scripts/A01.py:blocos_de_temporada "
                          "— nao o ano da data, que parte a Serie B de 2020 em duas"),
            "numeros": numeros}, NUMEROS_JSON)
    print(f"   {os.path.basename(NUMEROS_JSON)}: {len(numeros)} marcadores")
    conferir_contra_o_publicado(numeros)
    return numeros


def conferir_contra_o_publicado(numeros):
    """O que a parte publica contra o que o script acabou de calcular. So IMPRIME: T01.json nao e
    tocado. Divergencia e achado, nao conserto — as duas pontas ficam como estao."""
    caminho = os.path.join(RESULTADOS, "T01.json")
    if not os.path.exists(caminho):
        print("   (T01.json nao existe: nada a conferir)")
        return
    with open(caminho, encoding="utf-8") as f:
        publicado = json.load(f).get("numeros", {})
    faltam = sorted(set(publicado) - set(numeros))
    sobram = sorted(set(numeros) - set(publicado))
    difere = [(m, publicado[m], numeros[m]) for m in sorted(publicado)
              if m in numeros and publicado[m] != numeros[m]
              and not (isinstance(publicado[m], (int, float))
                       and isinstance(numeros[m], (int, float))
                       and float(publicado[m]) == float(numeros[m]))]
    print(f"   conferencia contra T01.json: {len(publicado)} marcadores publicados, "
          f"{len(publicado) - len(faltam) - len(difere)} batem")
    for m in faltam:
        print(f"     FALTA no script: {m} (publicado {publicado[m]!r})")
    for m, pub, cal in difere:
        print(f"     DIVERGE: {m} — publicado {pub!r}, o script da {cal!r}")
    if sobram:
        print(f"     (o script calcula {len(sobram)} que a parte nao publica: "
              f"{', '.join(sobram)})")


def main():
    teste = "--teste" in sys.argv
    refazer = "--refazer" in sys.argv
    os.makedirs(CACHE, exist_ok=True)
    os.makedirs(RESULTADOS, exist_ok=True)

    # So o passo 3, sobre as bases que ja estao no disco: nao toca no site nem reescreve a
    # coleta. E o modo de reconferir os numeros depois de mexer numa conta.
    if "--numeros" in sys.argv:
        print("3) numeros da parte (so o passo 3)")
        gravar_numeros()
        return

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

    if teste:
        print("\n   MODO TESTE: o passo 3 (numeros) nao roda sobre coleta parcial.")
        return
    print("\n4) numeros da parte")
    gravar_numeros()


if __name__ == "__main__":
    main()
