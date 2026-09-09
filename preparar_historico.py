#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Historico de tres temporadas por jogador: minutagem, gols e bola parada.

De onde vem: os MESMOS Excels do Wyscout que alimentam o ranking
(`Portal Ranking/dados/<periodo>/*.xlsx`, aba BASE, um arquivo por liga).

Por que nao o `multiseason_candidates.parquet` da Base Unificada, que ja e
multi-temporada: as colunas de bola parada chegam la embaralhadas (o H. Kane
aparece com "Penalties taken" 0,03 e "Corners per 90" 25,00). Minutagem e gols
batem nos dois; bola parada, so lendo o Excel e corrigindo o cabecalho.

O cabecalho torto NAO e defeito deste script: no template novo do Wyscout a
coluna duplicada de duelos aereos do goleiro perdeu o rotulo, e os sete rotulos
finais escorregam uma casa sobre os dados — "Corners per 90" passa a devolver
porcentagem (chega a 100), "Penalties taken" devolve escanteios. Quem conserta e
o `normalizar_schema_wyscout` do proprio ranking_engine, importado aqui em vez de
reescrito: se o Wyscout mudar o template de novo, conserta-se num lugar so.

Ligacao entre temporadas, em duas passadas — o `primary_key` embute o CLUBE, entao
muda quando o jogador se transfere e nao serve para atravessar os anos:

1. **Por id** (`player_uid` do `multiseason_candidates.parquet` da Base Unificada).
   E o unico jeito seguro. Cobre so parte da base, mas o que cobre esta certo.
2. **Por nome**, para o resto, e so quando o nome e UNICO na temporada de hoje e na
   de la, ainda conferindo pais de nascimento, altura e idade. Nome repetido nao casa
   de jeito nenhum: o "Pedro" do Flamengo recebeu a temporada de um Pedro do Guabira,
   na Bolivia, com pais, altura e idade todos dentro da tolerancia. Em nome comum
   brasileiro, ficar sem a temporada e melhor do que mostrar a de outra pessoa.

Cuidado documentado na skill dados-wyscout: a idade do Wyscout e a idade na hora da
EXTRACAO, entao num Excel de 2024 o jogador aparece dois anos mais novo do que hoje.

Saida: dados/historico.json
"""
import json
import os
import re
import sys
import unicodedata
from collections import defaultdict

import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE_RANKING = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/"
                "fut/BOTA/Analytics/Portal Ranking")
PARQUET = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/fut/BOTA/"
           "Analytics/Portal Base Unificada/dados/multiseason_candidates.parquet")

sys.path.insert(0, BASE_RANKING)
from ranking_engine import normalizar_schema_wyscout   # noqa: E402

# temporada -> pasta do periodo. A mais recente e a que casa com a base do app.
TEMPORADAS = [("2024", "2024"), ("2025", "2025"), ("2026", "ago26")]
ANO_ATUAL = 2026

# Excel -> chave curta no JSON. Absolutos onde o Wyscout entrega absoluto.
CAMPOS = [
    ("Minutes played",              "min",  0),
    ("Matches played",              "j",    0),
    ("Goals",                       "g",    0),
    ("Assists",                     "a",    0),
    ("Head goals",                  "gc",   0),   # gols de cabeca
    ("Penalties taken",             "pen",  0),
    ("Penalty conversion, %",       "pen%", 0),
    ("Corners per 90",              "esc",  2),   # escanteios cobrados por 90
    ("Free kicks per 90",           "fal",  2),   # faltas cobradas por 90
    ("Direct free kicks per 90",    "fd",   2),   # faltas diretas ao gol por 90
    ("Direct free kicks on target, %", "fd%", 0),
    ("xG per 90",                   "xg",   2),
]


def norm(t):
    """Nome comparavel: sem acento, sem o sufixo de homonimo, minusculo."""
    t = re.sub(r"\s*\((?:GOL|ZAG|LAT|VOL|MED|MEI|EXT|ATA)[^)]*\)\s*$", "", str(t or "").strip())
    t = unicodedata.normalize("NFD", t)
    return "".join(c for c in t if unicodedata.category(c) != "Mn").lower()


# particulas que nao contam como sobrenome ("Giorgian de Arrascaeta" -> arrascaeta)
PARTICULAS = {"de", "da", "do", "dos", "das", "del", "della", "van", "von", "di", "du", "le", "la"}


def sobrenome(nm):
    """Ultimo pedaco util do nome normalizado, para o casamento de reserva."""
    partes = [p for p in nm.split() if p and p not in PARTICULAS]
    return partes[-1] if partes else ""


def combina(atual, cand, temporada, unico):
    """Custo de casar `cand` (linha de uma temporada anterior) com `atual`, ou None
    quando os dois nao podem ser a mesma pessoa.

    Nome NAO basta, e o preco de errar e alto: o "Luiz Henrique" do Avai recebeu a
    temporada do "Luiz Henrique" do Botafogo (35 jogos e 7 gols na Serie A que nao
    eram dele) e o "Pedro" do Flamengo recebeu a de um Pedro do Guabira, na Bolivia.
    Altura e pais de nascimento nao mudam entre temporadas e sao o que separa
    homonimos; a idade tambem, lembrando que a do Wyscout e a da extracao daquele ano.

    Por isso a regra depende de o nome ser unico:

    - **nome unico dos dois lados** (um so jogador com aquele nome hoje e um so
      candidato na temporada anterior): casa, ainda conferindo pais, altura e idade
      quando existem.
    - **nome repetido**: NAO casa. Corroborar com pais, altura e idade nao basta —
      o Pedro do Flamengo recebeu a temporada de um Pedro do Guabira, na Bolivia,
      com pais, altura e idade todos dentro da tolerancia. Dois brasileiros de mesma
      idade e altura sao indistinguiveis por estes campos. Quem repoe a cobertura
      desses e o oGol (`preparar_ogol.py`), que resolve por id de jogador e nao por
      nome.
    """
    if not unico:
        return None

    custo = 0.0

    if atual["_pais"] and cand["_pais"] and atual["_pais"] != cand["_pais"]:
        return None

    if atual["_alt"] and cand["_alt"]:
        d = abs(atual["_alt"] - cand["_alt"])
        if d > 2:
            return None
        custo += d
    else:
        custo += 1.5              # um dos lados sem altura: casa, mas perde para quem tem

    if atual["_idade"] is not None and cand["_idade"] is not None:
        esperada = atual["_idade"] - (ANO_ATUAL - int(temporada))
        d = abs(cand["_idade"] - esperada)
        if d > 1:
            return None
        custo += d * 2            # idade pesa mais que altura
    else:
        custo += 1.5

    return custo


def mesma_pessoa(a, b):
    """Vale casar por sobrenome? Exige inicial do primeiro nome igual quando os
    dois tem mais de um pedaco — 'G. Silva' e 'Lucas Silva' nao sao a mesma
    pessoa, mas 'Arrascaeta' e 'Giorgian de Arrascaeta' sao."""
    pa = [p for p in a.split() if p not in PARTICULAS]
    pb = [p for p in b.split() if p not in PARTICULAS]
    if len(pa) < 2 or len(pb) < 2:
        return True                      # um dos lados so tem o sobrenome
    return pa[0][0] == pb[0][0]


def num(v, casas=0):
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    if pd.isna(f):
        return None
    return int(round(f)) if casas == 0 else round(f, casas)


def liga_do_arquivo(nome):
    """'08-01-2026_Brasil A.xlsx' -> 'Brasil A'."""
    base = os.path.splitext(os.path.basename(nome))[0]
    return re.sub(r"^\d{2}-\d{2}-\d{4}_", "", base).strip()


def ler_temporada(pasta):
    """Uma linha por jogador da temporada, ja com liga e chave normalizada."""
    dirp = os.path.join(BASE_RANKING, "dados", pasta)
    linhas, tortos = [], []
    for arq in sorted(os.listdir(dirp)):
        if not arq.endswith(".xlsx") or arq.startswith("~$"):
            continue
        liga = liga_do_arquivo(arq)
        try:
            df = pd.read_excel(os.path.join(dirp, arq), sheet_name="BASE")
        except Exception as e:                      # liga sem aba BASE ou arquivo torto
            print(f"    ! {arq}: {e}")
            continue
        df, deslocado = normalizar_schema_wyscout(df)
        if deslocado:
            tortos.append(arq)
        # o clube que vale e o do periodo analisado, nao o de hoje (ver dados-wyscout)
        col_time = ("Team within selected timeframe" if "Team within selected timeframe" in df.columns
                    else "Team")
        for _, r in df.iterrows():
            nome = r.get("Player")
            if not isinstance(nome, str) or not nome.strip():
                continue
            reg = {"n": nome.strip(), "tm": str(r.get(col_time) or "").strip(), "l": liga,
                   "_nm": norm(nome), "_idade": num(r.get("Age")),
                   "_alt": num(r.get("Height")), "_pais": str(r.get("Birth country") or "").strip()}
            for col, chave, casas in CAMPOS:
                v = num(r.get(col), casas) if col in df.columns else None
                if v is not None:
                    reg[chave] = v
            linhas.append(reg)
    return linhas, tortos


def ligacao_por_id():
    """uid -> {temporada: primary_key daquela temporada}, do parquet da Base Unificada.

    O parquet sufixa a pk historica com '@@<ano>'; aqui interessa a pk limpa, que e a
    mesma que o Excel daquela temporada produz.
    """
    if not os.path.exists(PARQUET):
        print("    ! parquet multi-temporada nao encontrado — so o casamento por nome")
        return {}
    ms = pd.read_parquet(PARQUET, columns=["season", "primary_key", "player_uid"])
    ms = ms.dropna(subset=["player_uid"])
    fora = defaultdict(dict)
    for temporada, _pasta in TEMPORADAS:
        sub = ms[ms["season"] == temporada]
        for uid, pk in zip(sub["player_uid"], sub["primary_key"]):
            fora[uid][temporada] = re.sub(r"@@\d{4}$", "", str(pk))
    return fora


def main():
    saida = {"temporadas": [t for t, _ in TEMPORADAS], "jogadores": {}}
    por_temporada = {}
    for temporada, pasta in TEMPORADAS:
        print(f"lendo {pasta} ...")
        linhas, tortos = ler_temporada(pasta)
        por_temporada[temporada] = linhas
        print(f"    {len(linhas)} jogadores em {len({l['l'] for l in linhas})} ligas"
              f" · {len(tortos)} arquivos com o cabecalho de bola parada corrigido")

    atual = por_temporada[TEMPORADAS[-1][0]]

    # indice das linhas de cada temporada pela pk daquela temporada
    por_pk = {}
    for temporada, _ in TEMPORADAS:
        por_pk[temporada] = {f"{l['n']} - {l['tm']} - {l['l']}": l
                             for l in por_temporada[temporada]}

    # indice das temporadas anteriores: por nome inteiro e por sobrenome
    indices, indices_sn = {}, {}
    for temporada, linhas in por_temporada.items():
        if temporada == TEMPORADAS[-1][0]:
            continue
        idx, idx_sn = defaultdict(list), defaultdict(list)
        for l in linhas:
            idx[l["_nm"]].append(l)
            sn = sobrenome(l["_nm"])
            if sn:
                idx_sn[sn].append(l)
        indices[temporada] = idx
        indices_sn[temporada] = idx_sn

    achados = defaultdict(int)
    por_sobrenome = defaultdict(int)
    ambiguos = defaultdict(int)

    """Atribuicao um-para-um, por nome e por temporada.

    Antes cada jogador da temporada corrente escolhia sozinho o seu candidato, e
    dois homonimos podiam levar a MESMA linha antiga — ou o errado levar a linha do
    outro, que era o caso do Luiz Henrique. Agora, para cada nome, os candidatos sao
    disputados: menor custo leva, e a linha sai do bolo.
    """
    # ---- passada 1: por id ----
    uid_temporadas = ligacao_por_id()
    corrente = TEMPORADAS[-1][0]
    pk_para_uid = {}
    for uid, temps in uid_temporadas.items():
        pk = temps.get(corrente)
        if pk:
            pk_para_uid[pk] = uid

    por_id = {}                        # (indice do atual, temporada) -> linha antiga
    achados_id = defaultdict(int)
    for n, a in enumerate(atual):
        uid = pk_para_uid.get(f"{a['n']} - {a['tm']} - {a['l']}")
        if not uid:
            continue
        for temporada, _ in TEMPORADAS[:-1]:
            pk = uid_temporadas[uid].get(temporada)
            linha = por_pk[temporada].get(pk) if pk else None
            if linha is not None:
                por_id[(n, temporada)] = linha
                achados_id[temporada] += 1
    for temporada, _ in TEMPORADAS[:-1]:
        print(f"    {temporada}: {achados_id[temporada]} casados por id")

    # ---- passada 2: por nome, so o que o id nao resolveu ----
    # quantos jogadores levam cada nome, hoje e em cada temporada anterior
    quantos_hoje = defaultdict(int)
    for a in atual:
        quantos_hoje[a["_nm"]] += 1

    escolha = {}                       # (indice do atual, temporada) -> linha antiga
    for temporada, _ in TEMPORADAS[:-1]:
        idx, idx_sn = indices[temporada], indices_sn[temporada]
        grupos = defaultdict(list)     # chave de busca -> indices dos atuais
        for n, a in enumerate(atual):
            grupos[a["_nm"]].append(n)

        tomadas = set(id(por_id[(n, temporada)]) for n in range(len(atual))
                      if (n, temporada) in por_id)
        for n in range(len(atual)):
            if (n, temporada) in por_id:
                escolha[(n, temporada)] = por_id[(n, temporada)]
        for chave, quais in grupos.items():
            pares = []
            candidatos = idx.get(chave, [])
            unico = quantos_hoje[chave] == 1 and len(candidatos) == 1
            for n in quais:
                for cand in candidatos:
                    c = combina(atual[n], cand, temporada, unico)
                    if c is not None:
                        pares.append((c, n, id(cand), cand, False))
            pares.sort(key=lambda x: (x[0], x[1]))
            for custo, n, cid, cand, _sn in pares:
                if (n, temporada) in escolha or cid in tomadas:
                    continue
                escolha[(n, temporada)] = cand
                tomadas.add(cid)
                achados[temporada] += 1

        # reserva pelo sobrenome, so para quem ficou sem nada
        grupos_sn = defaultdict(list)
        for n, a in enumerate(atual):
            if (n, temporada) in escolha:
                continue
            sn = sobrenome(a["_nm"])
            if sn:
                grupos_sn[sn].append(n)
        for sn, quais in grupos_sn.items():
            candidatos_sn = idx_sn.get(sn, [])
            unico_sn = len(quais) == 1 and len(candidatos_sn) == 1
            pares = []
            for n in quais:
                for cand in candidatos_sn:
                    if id(cand) in tomadas or not mesma_pessoa(atual[n]["_nm"], cand["_nm"]):
                        continue
                    c = combina(atual[n], cand, temporada, unico_sn)
                    if c is not None:
                        pares.append((c, n, id(cand), cand))
            pares.sort(key=lambda x: (x[0], x[1]))
            for custo, n, cid, cand in pares:
                if (n, temporada) in escolha or cid in tomadas:
                    continue
                escolha[(n, temporada)] = cand
                tomadas.add(cid)
                achados[temporada] += 1
                por_sobrenome[temporada] += 1

    for n, a in enumerate(atual):
        pk = f"{a['n']} - {a['tm']} - {a['l']}"
        registro = []
        for temporada, _ in TEMPORADAS:
            t = a if temporada == TEMPORADAS[-1][0] else escolha.get((n, temporada))
            if t is None:
                registro.append(None)
                continue
            item = {"t": temporada, "tm": t["tm"], "l": t["l"]}
            for _, chave, _c in CAMPOS:
                if t.get(chave) is not None:
                    item[chave] = t[chave]
            registro.append(item)
        if any(registro):
            saida["jogadores"][pk] = registro

    for temporada in indices:
        print(f"    {temporada}: {achados[temporada]} casados "
              f"({por_sobrenome[temporada]} pelo sobrenome)")

    destino = os.path.join(AQUI, "dados", "historico.json")
    with open(destino, "w", encoding="utf-8") as fh:
        json.dump(saida, fh, ensure_ascii=False, separators=(",", ":"))
    mb = os.path.getsize(destino) / 1024 / 1024
    tres = sum(1 for v in saida["jogadores"].values() if all(v))
    print(f"ok: {len(saida['jogadores'])} jogadores ({tres} com as tres temporadas) "
          f"-> {destino} ({mb:.1f} MB)")


if __name__ == "__main__":
    sys.exit(main())
