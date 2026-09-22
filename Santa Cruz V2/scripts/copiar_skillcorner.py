"""Copia para o V2 a fatia de Serie B do skillcorner.db do Portal Skillcorner.

Regra do projeto: o Portal Skillcorner e outro projeto e outro repositorio — nada de la e
alterado, e o que for usado entra aqui como base COPIADA, com a data da copia registrada
no `bases/INVENTARIO.md`. A fonte e aberta em modo somente-leitura (mode=ro).

Por que uma fatia e nao o arquivo inteiro: a fonte passa de 350 MB e o repositorio publica
no GitHub Pages (limite de 100 MB por arquivo). O estudo usa so a Serie B 2022-2026.

Historico:
  - 19/09/2026: primeira copia (estudo antigo), `physical_match` so com 2025 e 2026.
  - 22/09/2026: o Portal Skillcorner coletou o fisico POR JOGO de 2022, 2023 e 2024
    (`sync_matches.py --edicao 335/446/773`); esta copia traz as 5 temporadas.

Uso:
    python3 scripts/copiar_skillcorner.py
Grava `bases/skillcorner/skillcorner_serieb.db` (apaga a copia anterior).
"""
import datetime
import os
import sqlite3

FONTE = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/fut/BOTA/"
         "Analytics/Portal Skillcorner/dados/skillcorner.db")
AQUI = os.path.dirname(os.path.abspath(__file__))
DESTINO = os.path.join(os.path.dirname(AQUI), "bases", "skillcorner", "skillcorner_serieb.db")
EDICOES = {335: "2022", 446: "2023", 773: "2024", 1061: "2025", 1399: "2026"}

# Tabelas que entram na fatia, todas filtradas pela edicao da Serie B.
TABELAS = ["competitions", "physical", "physical_match", "off_ball_runs", "passes", "possessions"]


def main():
    ids = ",".join(str(e) for e in EDICOES)
    os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
    if os.path.exists(DESTINO):
        os.remove(DESTINO)
    src = sqlite3.connect(f"file:{FONTE}?mode=ro", uri=True)
    dst = sqlite3.connect(DESTINO)

    resumo = {}
    for tab in TABELAS:
        ddl = src.execute(
            "select sql from sqlite_master where type='table' and name=?", (tab,)).fetchone()
        if not ddl or not ddl[0]:
            print(f"  {tab}: nao existe na fonte, pulado")
            continue
        dst.execute(ddl[0])
        cols = [r[1] for r in src.execute(f"pragma table_info({tab})")]
        linhas = src.execute(
            f'select * from "{tab}" where sc_competition_edition_id in ({ids})').fetchall()
        dst.executemany(f'insert into "{tab}" values ({",".join("?" * len(cols))})', linhas)
        resumo[tab] = len(linhas)
        print(f"  {tab}: {len(linhas)} linhas")

    # players: so quem aparece na fatia (agregado ou por jogo)
    ddl = src.execute(
        "select sql from sqlite_master where type='table' and name='players'").fetchone()[0]
    dst.execute(ddl)
    pids = {r[0] for r in src.execute(
        f"select distinct sc_player_id from physical where sc_competition_edition_id in ({ids})")}
    pids |= {r[0] for r in src.execute(
        f"select distinct sc_player_id from physical_match where sc_competition_edition_id in ({ids})")}
    ncols = len(list(src.execute("pragma table_info(players)")))
    pl = [r for r in src.execute("select * from players") if r[0] in pids]
    dst.executemany(f'insert into players values ({",".join("?" * ncols)})', pl)
    print(f"  players: {len(pl)} linhas (de {len(pids)} ids na fatia)")

    # Indices iguais aos da fonte, pra consulta por jogador/data ficar rapida
    dst.execute("create index if not exists ix_phymatch_player_data on physical_match (sc_player_id, match_date)")
    dst.execute("create index if not exists ix_phymatch_edicao on physical_match (sc_competition_edition_id)")
    dst.commit()

    print("\n  physical_match por temporada:")
    for eid, ano in EDICOES.items():
        n, nj, np_, d0, d1 = dst.execute(
            "select count(*), count(distinct sc_player_id), count(distinct sc_match_id), "
            "min(match_date), max(match_date) from physical_match where sc_competition_edition_id=?",
            (eid,)).fetchone()
        print(f"    {ano} (ed. {eid}): {n:>6} linhas, {nj} jogadores, {np_} partidas, {d0} a {d1}")

    dst.close()
    src.close()
    mb = os.path.getsize(DESTINO) / 1e6
    print(f"\ngravado: {os.path.relpath(DESTINO, os.path.dirname(AQUI))}  ({mb:.1f} MB)")
    print(f"data da copia: {datetime.date.today().isoformat()}")


if __name__ == "__main__":
    main()
