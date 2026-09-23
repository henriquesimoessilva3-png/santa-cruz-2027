"""Bola parada POR JOGADOR nas ligas sul-americanas, pelo Sofascore (2025 e 2026): mesma leitura
do b3_bp_jogadores_sofascore.py (Série B), para as listas sul-americanas terem gols e
assistências de bola parada, não só os índices do Wyscout.

Entrada: bases/coletas/bola_parada_sulam_sofascore.json (coletado no navegador).
Saída:   bases/coletas/bp_sulam_jogador_temporada.csv — jogador × liga × temporada × time (nome do
         Sofascore; o casamento com o Wyscout é feito no bolaparada_jogadores.py, por liga, clube e
         nome, porque o Wyscout abrevia — "J. Pérez").
"""
import json, os
import pandas as pd
from _comum import BASES

ENT = os.path.join(BASES, "coletas", "bola_parada_sulam_sofascore.json")
SAI = os.path.join(BASES, "coletas", "bp_sulam_jogador_temporada.csv")


def agrega(s):
    s = s[s.tipo_gol != "own"]
    fin = s[~s.sit.str.startswith("sem-shotmap")].copy()
    fin["sp"] = fin.sit != "penalty"
    chave = ["liga", "ano", "time", "sid", "nome"]
    g = fin.groupby(chave).apply(lambda d: pd.Series({
        "finalizacoes_bp": int(d.sp.sum()), "xg_bp": round(d.loc[d.sp, "xg"].sum(), 2),
        "gols_bp": int((d.sp & (d.gol == 1)).sum()),
        "gols_bp_cabeca": int((d.sp & (d.gol == 1) & (d.corpo == "head")).sum()),
        "gols_escanteio": int(((d.sit == "corner") & (d.gol == 1)).sum()),
        "gols_falta_direta": int(((d.sit == "free-kick") & (d.gol == 1)).sum()),
        "gols_penalti": int(((d.sit == "penalty") & (d.gol == 1)).sum())}), include_groups=False).reset_index()
    ast = fin[(fin.gol == 1) & fin.aid.notna() & fin.sp]
    a = ast.groupby(["liga", "ano", "time", "aid", "anome"]).apply(lambda d: pd.Series({
        "assist_bp": len(d), "assist_escanteio": int((d.sit == "corner").sum()),
        "assist_falta": int(d.sit.isin(["set-piece", "free-kick"]).sum())}), include_groups=False).reset_index()
    a = a.rename(columns={"aid": "sid", "anome": "nome"}); a["sid"] = a.sid.astype(int)
    r = g.merge(a, on=chave, how="outer").fillna(0)
    for c in r.columns:
        if c not in chave + ["xg_bp"]: r[c] = r[c].astype(int)
    return r


def main():
    D = json.load(open(ENT, encoding="utf-8"))
    cols = ["liga", "ano", "evento", "time", "sid", "nome", "pos", "sit", "corpo", "xg", "gol", "tipo_gol", "aid", "anome"]
    s = pd.DataFrame(D["shots"], columns=cols).drop_duplicates()   # a Argentina 2025 veio em duas temporadas do Sofascore
    r = agrega(s)
    r.to_csv(SAI, index=False)
    print(len(s), "finalizações de BP ·", len(r), "jogador-temporadas ·", r.groupby("liga").gols_bp.sum().to_dict())


if __name__ == "__main__":
    main()
