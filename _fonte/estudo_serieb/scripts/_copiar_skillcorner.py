"""Copia para o estudo a fatia de Serie B do skillcorner.db do Portal Skillcorner.

Regra do CLAUDE.md: "e outro projeto e outro repositorio: nada de la e alterado, e o que
for usado entra aqui como base copiada, com a data da copia registrada no _registro.md".

Por que uma fatia e nao o arquivo inteiro:
  - a fonte tem 329 MB e o GitHub recusa arquivo acima de 100 MB; este repositorio publica
    em docs/ pelo GitHub Pages, entao o banco inteiro quebraria o push;
  - o estudo usa so Serie B 2022-2026: 4% do physical_match e 6% do physical.
A fonte e aberta em modo somente-leitura (mode=ro). Nada la e tocado.

NAO copia o config.py do Portal: ele tem as credenciais da API em texto.
"""
import sqlite3, os, datetime

FONTE = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/fut/BOTA/"
         "Analytics/Portal Skillcorner/dados/skillcorner.db")
DESTINO = os.path.join(os.path.dirname(__file__), "..", "dados_copiados", "skillcorner_serieb.db")
EDICOES = {335: "2022", 446: "2023", 773: "2024", 1061: "2025", 1399: "2026"}

def main():
    ids = ",".join(str(e) for e in EDICOES)
    if os.path.exists(DESTINO):
        os.remove(DESTINO)
    src = sqlite3.connect(f"file:{FONTE}?mode=ro", uri=True)
    dst = sqlite3.connect(DESTINO)

    for tab, onde in [
        ("competitions",   f"sc_competition_edition_id in ({ids})"),
        ("physical",       f"sc_competition_edition_id in ({ids})"),
        ("physical_match", f"sc_competition_edition_id in ({ids})"),
        ("off_ball_runs",  f"sc_competition_edition_id in ({ids})"),
        ("passes",         f"sc_competition_edition_id in ({ids})"),
        ("possessions",    f"sc_competition_edition_id in ({ids})"),
    ]:
        ddl = src.execute(
            "select sql from sqlite_master where type='table' and name=?", (tab,)
        ).fetchone()
        if not ddl or not ddl[0]:
            print(f"  {tab}: nao existe na fonte, pulado")
            continue
        dst.execute(ddl[0])
        cols = [r[1] for r in src.execute(f"pragma table_info({tab})")]
        linhas = src.execute(f'select * from "{tab}" where {onde}').fetchall()
        dst.executemany(
            f'insert into "{tab}" values ({",".join("?" * len(cols))})', linhas
        )
        print(f"  {tab}: {len(linhas)} linhas")

    # players: so quem aparece na fatia
    ddl = src.execute(
        "select sql from sqlite_master where type='table' and name='players'"
    ).fetchone()[0]
    dst.execute(ddl)
    pids = {r[0] for r in src.execute(
        f"select distinct sc_player_id from physical where sc_competition_edition_id in ({ids})")}
    pids |= {r[0] for r in src.execute(
        f"select distinct sc_player_id from physical_match where sc_competition_edition_id in ({ids})")}
    ncols = len([r for r in src.execute("pragma table_info(players)")])
    pl = [r for r in src.execute("select * from players") if r[0] in pids]
    dst.executemany(f'insert into players values ({",".join("?" * ncols)})', pl)
    print(f"  players: {len(pl)} linhas (de {len(pids)} ids na fatia)")

    dst.commit()
    dst.close()
    src.close()
    mb = os.path.getsize(DESTINO) / 1e6
    print(f"\ngravado: {os.path.relpath(DESTINO)}  ({mb:.1f} MB)")
    print(f"data da copia: {datetime.date.today().isoformat()}")

if __name__ == "__main__":
    main()
