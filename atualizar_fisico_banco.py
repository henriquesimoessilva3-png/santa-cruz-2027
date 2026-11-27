#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""27/11/2026 — letra com físico VELHO quando o banco do SkillCorner já tem temporada mais nova (decisão do Henrique: só mexer em quem tem
jogo novo). Complementa o atualizar_fisico_nov26.py, que só enxerga quem o Ranking casou pela chave do recorte.

Entrada: a lista montada por Santa Cruz V2/auditoria_app/c1_fisico_velho.py (chave do app, id do SkillCorner, edição mais nova com 5+ jogos)
e o físico por edição do banco (ref_sc_physical.csv.gz, tirado do Portal SkillCorner/dados/skillcorner.db, só leitura).
Regra: físico da base de 2024 ou antes → troca pela edição mais nova com 5 jogos ou mais; físico de 2025 → só se a edição nova tiver tantos
jogos ou mais. Europa 25/26 e 2026 não entram (não são letra velha). Ligações vetadas e idade incompatível ficam de fora (feito no c1).
Uso: python3 atualizar_fisico_banco.py <c1_fisico_velho.csv> <ref_sc_physical.csv.gz>"""
import json, os, re, sys
import pandas as pd
AQUI = os.path.dirname(os.path.abspath(__file__))
MAPA = {"psv": "psv99", "psv5": "psv99_top5", "dist": "distance_p90", "mmin": "m_per_min", "run": "running_distance_p90", "hsr": "hsr_distance_p90", "hsr_n": "hsr_count_p90",
        "spr_km": "sprint_distance_p90", "spr_n": "sprint_count_p90", "hi": "hi_distance_p90", "hi_n": "hi_count_p90", "acel": "high_accel_p90", "desa": "high_decel_p90",
        "acel_m": "medium_accel_p90", "desa_m": "medium_decel_p90", "expl": "expl_accel_sprint_p90", "cod": "cod_count_p90", "vmax": "peak_velocity", "vmax3": "peak_velocity_top3",
        "mm_c": "m_per_min_tip", "mm_s": "m_per_min_otip", "hi_c": "hi_distance_p30tip", "hi_s": "hi_distance_p30otip", "spn_c": "sprint_count_p30tip", "spn_s": "sprint_count_p30otip"}
SO_ANTIGO = ("t_spr", "t_hsr", "t_spr_cod", "t_hsr_cod", "t505_90", "t505_180")   # o banco por edição não traz: saem para não misturar temporada


def main(arq_lista, arq_fis):
    L = pd.read_csv(arq_lista); F = pd.read_csv(arq_fis, low_memory=False).rename(columns={"sc_competition_edition_id": "ed"}).set_index(["sc_player_id", "ed"])
    ano = L.base.str.extract(r"(\d{4})")[0].astype(int); cruz = L.base.str.contains("/")
    L = L[(~cruz) & ((ano <= 2024) | ((ano == 2025) & (L.novo_n >= L.base_n)))]
    alvo = {r.pk: r for r in L.itertuples()}
    p = os.path.join(AQUI, "dados", "jogadores.json"); base = json.load(open(p, encoding="utf-8")); n = 0; ex = []
    for j in base["jogadores"]:
        pk = f"{j['n']} - {j.get('t', '')} - {j.get('l', '')}"; a = alvo.get(pk)
        if not a or j.get("fis_rec") or (a.sid, a.ed) not in F.index: continue
        f = F.loc[(a.sid, a.ed)]
        if pd.isna(f["psv99"]): continue
        for k, c in MAPA.items():
            v = f.get(c)
            if v is not None and v == v: j[k] = round(float(v), 2)
            elif k in j: del j[k]
        for k in SO_ANTIGO: j.pop(k, None)
        j["sc_n"] = int(f["matches"]); j["sc_min"] = round(float(f["minutes_played"]) / max(1, int(f["matches"])), 0) if f["minutes_played"] > 200 else round(float(f["minutes_played"]), 0)
        j["fis_src_antes"] = j.pop("fis_src", None) or a.base
        j["fis_rec"] = "banco SkillCorner 25/11 · " + re.sub(r"^[A-Z]{3,8} - ", "", a.novo); n += 1
        if len(ex) < 8: ex.append(f"{pk}: {a.base} ({a.base_n} j) -> {a.novo} ({a.novo_n} j)")
    json.dump(base, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("físico velho trocado por temporada mais nova:", n, "de", len(L)); print("\n".join(ex))


if __name__ == "__main__":
    main(*sys.argv[1:3])
