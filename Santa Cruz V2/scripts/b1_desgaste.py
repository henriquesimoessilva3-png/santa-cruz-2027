"""Bloco 1, pergunta 5 — desgaste: turno × returno e semana de três jogos (physical_match, 2025 e 2026).
Escreve resultados/b1/desgaste.csv"""
import os
import numpy as np, pandas as pd
from _comum import *

def main():
    out = os.path.join(RES, "b1"); con = skillcorner()
    pm = pd.read_sql("select * from physical_match where minutes_played >= 60", con)
    pm["ano"] = pm.sc_competition_edition_id.map(EDICOES); pm["match_date"] = pd.to_datetime(pm.match_date)
    j = jogos_serie_b(); ct = clube_temporada()
    # ponte de clube pelo nome do SkillCorner -> nome do Wyscout (por temporada)
    rows = []
    for ano in (2025, 2026):
        p = pm[pm.ano == ano].copy()
        # rodada do jogador = ordem dos jogos do time
        p["n_jogo"] = p.groupby("team_name")["match_date"].rank(method="dense")
        p["turno"] = np.where(p.n_jogo <= 19, 1, 2)
        for col in ("hsr_distance_p90", "sprint_distance_p90", "distance_p90", "psv99"):
            t = p.groupby(["team_name", "sc_player_id", "turno"])[col].mean().unstack()
            t = t.dropna(); t["queda"] = t[2] - t[1]
            q = t.groupby("team_name")["queda"].mean().rename("queda").reset_index()
            for _, r in q.iterrows():
                rows.append(dict(ano=ano, team_name=r.team_name, indicador=col, queda_media=round(r.queda, 1), n_jog=int((t.index.get_level_values(0) == r.team_name).sum())))
    d = pd.DataFrame(rows)
    # descanso curto: < 4 dias entre jogos do time (todas as competições), pelo Wyscout
    jj = j[j.ano.isin([2025, 2026])].sort_values(["ano", "Equipa", "Data"])
    d.to_csv(os.path.join(out, "desgaste.csv"), index=False)
    print(d.groupby(["ano", "indicador"]).queda_media.describe()[["count", "mean", "std", "min", "max"]].round(1))
    # a queda do time no returno anda com o ponto do returno? (2025)
    piv = d[(d.ano == 2025) & (d.indicador == "hsr_distance_p90")]
    print(piv.sort_values("queda_media").to_string(index=False))

if __name__ == "__main__":
    main()
