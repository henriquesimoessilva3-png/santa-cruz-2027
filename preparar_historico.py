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

Ligacao entre temporadas: o `primary_key` embute o CLUBE, entao muda quando o
jogador se transfere e nao serve para atravessar os anos. A chave usada e o
nome normalizado + a idade esperada. Cuidado documentado na skill dados-wyscout:
a idade do Wyscout e a idade na hora da EXTRACAO, entao num Excel de 2024 o
jogador aparece dois anos mais novo do que hoje. Nome ambiguo dentro de uma
temporada (homonimos) e descartado — melhor ficar sem o historico do que
mostrar a temporada de outra pessoa.

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
                   "_nm": norm(nome), "_idade": num(r.get("Age"))}
            for col, chave, casas in CAMPOS:
                v = num(r.get(col), casas) if col in df.columns else None
                if v is not None:
                    reg[chave] = v
            linhas.append(reg)
    return linhas, tortos


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
    for a in atual:
        pk = f"{a['n']} - {a['tm']} - {a['l']}"
        temps = []
        for temporada, _ in TEMPORADAS:
            if temporada == TEMPORADAS[-1][0]:
                temps.append(a)
                continue
            # a idade do Excel e a da extracao daquele ano, nao a de hoje
            esperada = (a["_idade"] - (ANO_ATUAL - int(temporada))
                        if a["_idade"] is not None else None)

            def compativel(cs):
                if esperada is None:
                    return cs
                return [c for c in cs
                        if c["_idade"] is None or abs(c["_idade"] - esperada) <= 1]

            cands = compativel(indices[temporada].get(a["_nm"], []))
            via_sn = False
            if not cands:
                # o Wyscout escreve o mesmo jogador de formas diferentes entre os
                # anos ("Arrascaeta" x "Giorgian de Arrascaeta"): tenta o sobrenome
                sn = sobrenome(a["_nm"])
                if sn:
                    cands = [c for c in compativel(indices_sn[temporada].get(sn, []))
                             if mesma_pessoa(a["_nm"], c["_nm"])]
                    via_sn = True

            if len(cands) == 1:
                temps.append(cands[0])
                achados[temporada] += 1
                if via_sn:
                    por_sobrenome[temporada] += 1
            elif len(cands) > 1:
                ambiguos[temporada] += 1
                temps.append(None)
            else:
                temps.append(None)

        registro = []
        for (temporada, _), t in zip(TEMPORADAS, temps):
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
              f"({por_sobrenome[temporada]} pelo sobrenome) · {ambiguos[temporada]} "
              f"descartados por homonimo")

    destino = os.path.join(AQUI, "dados", "historico.json")
    with open(destino, "w", encoding="utf-8") as fh:
        json.dump(saida, fh, ensure_ascii=False, separators=(",", ":"))
    mb = os.path.getsize(destino) / 1024 / 1024
    tres = sum(1 for v in saida["jogadores"].values() if all(v))
    print(f"ok: {len(saida['jogadores'])} jogadores ({tres} com as tres temporadas) "
          f"-> {destino} ({mb:.1f} MB)")


if __name__ == "__main__":
    sys.exit(main())
