"""Bloco 1, passo 0 — base jogador-temporada com físico (SkillCorner) + clube, posição e minutos (Wyscout).

Ponte: nome normalizado + idade (nascimento do SkillCorner contra idade na temporada do Wyscout,
janela -2..+3). (ano, nome) ambíguo em qualquer lado é descartado, nunca adivinhado.
Escreve resultados/b1/base_fisico.csv e resultados/b1/ponte.json
"""
import os, json, datetime as dt
import pandas as pd
from _comum import *

def main():
    out = os.path.join(RES, "b1"); os.makedirs(out, exist_ok=True)
    t = tecnico()
    t = t[t["ano"].between(2022, 2026)]
    # ambíguos no Wyscout: mesmo (ano, chave) com 2 clubes ou 2 setores
    amb_w = t.groupby(["ano", "chave"]).agg(nc=("clube", "nunique"), ns=("setor", "nunique"))
    amb_w = amb_w[(amb_w.nc > 1) | (amb_w.ns > 1)].index
    t = t.set_index(["ano", "chave"]).drop(amb_w, errors="ignore").reset_index()

    con = skillcorner()
    pl = pd.read_sql("select sc_player_id, nome, short_name, birthdate from players", con)
    ph = pd.read_sql("select * from physical", con).drop(columns=["raw_json", "updated_at"])
    obr = pd.read_sql("select * from off_ball_runs", con).drop(columns=["raw_json", "updated_at", "minutes", "minutes_tip", "matches"])
    ph["ano"] = ph["sc_competition_edition_id"].map(EDICOES)
    obr["ano"] = obr["sc_competition_edition_id"].map(EDICOES)
    ph = ph.merge(pl, on="sc_player_id", how="left")
    ph["nasc"] = pd.to_datetime(ph["birthdate"], errors="coerce")
    ph["idade_sc"] = ph["ano"] - ph["nasc"].dt.year
    ph["chave"] = ph["nome"].map(chave)
    ph["chave_curta"] = ph["short_name"].map(chave)

    # casar: tenta nome completo, depois nome curto; exige idade compatível
    w = t[["ano", "chave", "jogador", "clube", "posicao", "setor", "idade", "minutos", "jogos", "fatia"]]
    def casar(col):
        m = ph.merge(w, left_on=["ano", col], right_on=["ano", "chave"], suffixes=("", "_w"))
        d = m["idade_w"] - m["idade_sc"] if "idade_w" in m else m["idade"] - m["idade_sc"]
        m = m[(d >= -2) & (d <= 3) | d.isna()]
        return m
    m1 = casar("chave")
    resto = ph[~ph.set_index(["sc_player_id", "ano"]).index.isin(m1.set_index(["sc_player_id", "ano"]).index)]
    m2 = resto.merge(w, left_on=["ano", "chave_curta"], right_on=["ano", "chave"], suffixes=("", "_w"))
    d = m2["idade"] - m2["idade_sc"]; m2 = m2[((d >= -2) & (d <= 3)) | d.isna()]
    m = pd.concat([m1, m2])
    # ambíguos: um sc_player_id-ano com 2 linhas Wyscout, ou uma linha Wyscout com 2 sc_player_id
    m = m[~m.duplicated(["sc_player_id", "ano"], keep=False)]
    m = m[~m.duplicated(["ano", "clube", "jogador"], keep=False)]
    base = m.merge(obr.drop(columns=["sc_competition_edition_id"]), on=["sc_player_id", "ano"], how="left")
    base["minutos_sc"] = base["minutes_played"] * base["matches"]
    cols = ["ano", "clube", "jogador", "posicao", "setor", "idade", "minutos", "jogos", "fatia",
            "sc_player_id", "matches", "minutes_played", "minutos_sc"] + \
           [c for c in ph.columns if c not in ("sc_player_id","sc_competition_edition_id","ano","nome","short_name","birthdate","nasc","idade_sc","chave","chave_curta","minutes_played","matches")] + \
           [c for c in obr.columns if c.startswith("runs")]
    base = base[cols].sort_values(["ano", "clube", "setor", "jogador"])
    base.to_csv(os.path.join(out, "base_fisico.csv"), index=False)
    cob = {"gerado_em": str(dt.date.today()),
           "skillcorner_linhas": int(len(ph)), "casadas": int(len(base)),
           "por_ano": {int(a): {"skillcorner": int((ph.ano == a).sum()), "casadas": int((base.ano == a).sum()),
                                "wyscout": int((t.ano == a).sum())} for a in sorted(ph.ano.unique())},
           "ambiguos_wyscout_descartados": int(len(amb_w)),
           "titulares_60pct_com_fisico": int((base.fatia >= 0.6).sum()),
           "por_setor_titulares": base[base.fatia >= 0.6].groupby("setor").size().to_dict()}
    json.dump(cob, open(os.path.join(out, "ponte.json"), "w"), ensure_ascii=False, indent=1)
    print(json.dumps(cob, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main()
