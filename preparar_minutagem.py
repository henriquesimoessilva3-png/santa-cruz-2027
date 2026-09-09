#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Minutagem das ultimas temporadas, por jogador.

O ranking de cada temporada mora em "Portal Ranking/output/rankings_<ano>.json",
mas o `primary_key` embute o time daquele ano — quem trocou de clube vira outra
chave. O cache multi-temporada do Portal Base Unificada
("dados/multiseason_candidates.parquet") ja resolve essa amarracao: cada linha tem
`player_uid` (wyscout) alem do `primary_key` da temporada.

Saida: dados/minutagem.json — {temporadas: [...], por_pk: {pk_atual: [[min, jogos, liga, time], ...]}}
A chave e o primary_key da temporada mais recente, que e o mesmo que a base do app usa.

Rodar:  python3 preparar_minutagem.py            (3 ultimas temporadas)
        python3 preparar_minutagem.py 4          (4 temporadas)
"""
import json
import os
import sys
import unicodedata

import pandas as pd

BASE_UNIF = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/"
             "fut/BOTA/Analytics/Portal Base Unificada/dados/multiseason_candidates.parquet")
AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "dados", "minutagem.json")
COLUNAS = ["season", "primary_key", "player_uid", "Player", "Team", "league",
           "Minutes played", "Matches played"]


def norm(t):
    t = unicodedata.normalize("NFD", str(t or "")).encode("ascii", "ignore").decode()
    return " ".join(t.lower().split())


def main(quantas=3):
    if not os.path.exists(BASE_UNIF):
        print(f"! nao achei {BASE_UNIF}")
        return
    df = pd.read_parquet(BASE_UNIF, columns=COLUNAS)
    temporadas = sorted(df["season"].dropna().unique())[-quantas:]
    df = df[df["season"].isin(temporadas)]
    atual = temporadas[-1]
    print(f"temporadas: {', '.join(temporadas)} · {len(df)} linhas")

    # identidade do jogador: player_uid quando existe; senao nome normalizado
    uid = df["player_uid"].astype("string").fillna("")
    df = df.assign(_id=[u if u else "n:" + norm(n) for u, n in zip(uid, df["Player"])])

    # chave de saida: o primary_key da temporada mais recente em que o jogador aparece
    chave = {}
    for temp in temporadas:                       # da mais antiga para a mais nova
        for i, pk in zip(df.loc[df["season"] == temp, "_id"],
                         df.loc[df["season"] == temp, "primary_key"].astype("string").fillna("")):
            if pk:
                chave[i] = str(pk)

    por_pk, sem_chave = {}, 0
    for temp in temporadas:
        sub = df[df["season"] == temp]
        for ident, mins, jogos, liga, time in zip(
                sub["_id"], sub["Minutes played"], sub["Matches played"],
                sub["league"].astype("string").fillna(""), sub["Team"].astype("string").fillna("")):
            pk = chave.get(ident)
            if not pk:
                sem_chave += 1
                continue
            por_pk.setdefault(pk, {})[temp] = [
                int(mins) if pd.notna(mins) else None,
                int(jogos) if pd.notna(jogos) else None,
                str(liga), str(time)]

    saida = {"temporadas": list(temporadas), "atual": atual,
             "por_pk": {pk: [v.get(t) for t in temporadas] for pk, v in por_pk.items()}}
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, "w", encoding="utf-8") as fh:
        json.dump(saida, fh, ensure_ascii=False, separators=(",", ":"))
    tres = sum(1 for v in saida["por_pk"].values() if all(x for x in v))
    print(f"ok: {len(saida['por_pk'])} jogadores -> {SAIDA} "
          f"({os.path.getsize(SAIDA)/1e6:.1f} MB) · {tres} com as {len(temporadas)} temporadas"
          + (f" · {sem_chave} linhas sem chave" if sem_chave else ""))


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 3)
