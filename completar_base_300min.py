#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""07/11/2026 — completa a base (dados/jogadores.json e dados/kpis/<POS>.json) com quem joga POUCO.

O ranking do Portal corta quem tem menos de 30% dos minutos da liga (~860 min na Série A), e por isso metade
da base ficava só com o cadastro (Overall, OF, DEF, FÍS e minutos vazios — caso Marcos Victor, do Bahia).
Pedido do Henrique: baixar o corte. Como é feito, SEM mexer no Ranking:
  1. os arquivos SEM filtro do OUT26 (Portal Ranking/dados/out26/_pre_filtro) com corte de 300 min
     rodam o ranking_engine numa pasta à parte (fora do Portal) → rankings_out26sc.json / kpis_detail_out26sc.json;
  2. este script preenche SÓ quem não tinha indicador (rk_ok = 0). Quem já tinha continua com os números de antes.
     Marca rk_src = "out26 ≥300 min" — o overall desses é contra a coorte do OUT26 com o corte de 300 min.
  3. físico (SkillCorner OUT26) para quem não tinha.
Uso: python3 completar_base_300min.py <rankings_out26sc.json> <kpis_detail_out26sc.json> <skillcorner_out26.json>"""
import json, os, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from preparar_kpis import ROTULO, GRUPO_PT, CATEGORIAS   # noqa: E402

FIS = (("psv", "psv99"), ("vmax", "peak_velocity"), ("vmax3", "top3_peak_velocity"), ("mmin", "m_min"),
       ("dist", "total_distance_p90"), ("hsr", "hsr_distance_p90"), ("spr_km", "sprint_distance_p90"), ("spr_n", "n_sprints_p90"),
       ("acel", "high_accel_p90"), ("desa", "high_decel_p90"), ("hi", "hi_distance_p90"), ("cod", "cod_count_p90"),
       ("psv5", "top5_psv99"), ("hsr_n", "hsr_count_p90"), ("hi_n", "hi_actions_p90"), ("expl", "explosive_accel_to_sprint"),
       ("run", "running_distance_p90"), ("acel_m", "med_accel_p90"), ("desa_m", "med_decel_p90"), ("t_spr", "top3_time_to_sprint"),
       ("t_hsr", "top3_time_to_hsr"), ("t_spr_cod", "top3_time_to_sprint_post_cod"), ("t_hsr_cod", "top3_time_to_hsr_post_cod"),
       ("t505_90", "top3_time_505_around_90"), ("t505_180", "top3_time_505_around_180"),
       ("mm_c", "m_min_tip"), ("mm_s", "m_min_otip"), ("hi_c", "hi_distance_p30tip"), ("hi_s", "hi_distance_p30otip"),
       ("spn_c", "sprint_count_p30tip"), ("spn_s", "sprint_count_p30otip"), ("obr_hsr", "runs_above_hsr_p30tip"),
       ("obr_area", "runs_penalty_area_p30tip"), ("obr_per", "runs_dangerous_p30tip"), ("obr_rec", "runs_received_p30tip"),
       ("obr_rem", "runs_shot_within_10s_p30tip"))


def num(v, casas=None):
    try:
        x = float(v)
    except (TypeError, ValueError):
        return None
    if x != x:
        return None
    return round(x, casas) if casas is not None else (int(x) if x.is_integer() else x)


def main(arq_rk, arq_kd, arq_sc):
    base_p = os.path.join(AQUI, "dados", "jogadores.json")
    base = json.load(open(base_p, encoding="utf-8"))
    J = base["jogadores"]
    rk = {r["primary_key"]: r for r in json.load(open(arq_rk, encoding="utf-8"))}
    sc = json.load(open(arq_sc, encoding="utf-8")) if arq_sc and os.path.exists(arq_sc) else {}
    novos, fis_novos = {}, 0
    for j in J:
        pk = f"{j['n']} - {j.get('t', '')} - {j.get('l', '')}"
        if not j.get("psv"):
            met = (sc.get(pk) or {}).get("metrics") or {}
            got = False
            for k, c in FIS:
                v = num(met.get(c), 2)
                if v is not None:
                    j[k] = v; got = True
            if got:
                s = sc.get(pk) or {}
                if s.get("minutes") is not None: j["sc_min"] = num(s["minutes"], 0)
                if s.get("n_perf_passed") is not None: j["sc_n"] = num(s["n_perf_passed"], 0)
                j["fis_src"] = j.get("fis_src") or "SkillCorner out26"
                fis_novos += 1
        if j.get("rk_ok"):
            continue
        r = rk.get(pk)
        if not r:
            continue
        upd = {"rk_ok": 1, "rk_src": "out26 ≥300 min", "pw": r.get("Position") or "", "jog": num(r.get("Matches played")),
               "peso": num(r.get("Weight")), "rk": num(r.get("rank")), "ov": num(r.get("overall"), 1),
               "ofe": num(r.get("overall_offensive"), 1), "def": num(r.get("overall_deffensive"), 1),
               "pas": num(r.get("overall_pass"), 1), "dgp": num(r.get("overall_dgp"), 1), "gk": num(r.get("overall_gk"), 1),
               "bp": num(r.get("overall_bola_parada"), 1), "fis": num(r.get("phy_score"), 1), "obr": num(r.get("obr_score"), 1),
               "drb": num(r.get("Successful dribbles per 90"), 2), "prog": num(r.get("Progressive runs per 90"), 2),
               "aer": num(r.get("Aerial duels won, %"), 1), "ddef": num(r.get("Defensive duels won, %"), 1),
               "pas%": num(r.get("Accurate passes, %"), 1), "cru%": num(r.get("Accurate crosses, %"), 1),
               "gols": num(r.get("Non-penalty goals per 90"), 2), "xa": num(r.get("xA per 90"), 2),
               "gk_sai": num(r.get("gk_exits_per_90"), 2), "gk_evi": num(r.get("gk_prevented_goals_per_90"), 2),
               "gk_def": num(r.get("gk_save_rate_pct"), 1), "gk_pas": num(r.get("gk_accurate_passes_pct"), 1),
               "cs": num(r.get("Clean sheets"))}
        if not j.get("min"): upd["min"] = num(r.get("Minutes played"))
        if not j.get("alt") and r.get("Height"): upd["alt"] = num(r.get("Height"))
        if not j.get("pe") and r.get("Foot"): upd["pe"] = r.get("Foot")
        j.update({k: v for k, v in upd.items() if v not in (None, "")})
        novos[pk] = j["p"]
    json.dump(base, open(base_p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"jogadores.json: {len(novos)} ganharam indicadores · {fis_novos} ganharam físico · total {len(J)}")

    # kpis da ficha, só para os novos
    import ijson   # o kpis_detail tem ~320 MB: lido em fluxo, guardando só os novos
    kd = {}
    with open(arq_kd, "rb") as fh:
        for pk, lista in ijson.kvitems(fh, "", use_float=True):
            if pk in novos: kd[pk] = lista
    por_pos = {}
    for pk, p in novos.items():
        if pk in kd: por_pos.setdefault(p, []).append(pk)
    for p, pks in por_pos.items():
        f = os.path.join(AQUI, "dados", "kpis", p + ".json")
        d = json.load(open(f, encoding="utf-8"))
        idx = {tuple(x): i for i, x in enumerate(d["kpis"])}
        for pk in pks:
            linhas = []
            for k in kd[pk]:
                cat = k.get("kpi_category")
                if cat not in CATEGORIAS: continue
                v = num(k.get("kpi_value"), 2)
                if v is None: continue
                chave = (GRUPO_PT[cat], ROTULO.get(k["kpi"], k["kpi"]))
                if chave not in idx:
                    idx[chave] = len(d["kpis"]); d["kpis"].append(list(chave))
                linhas.append([idx[chave], v, num(k.get("avg_kpi_value"), 2), num(k.get("max_kpi_value"), 2)])
            if linhas: d["jogadores"][pk] = linhas
        json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        print(f"  kpis/{p}.json: +{len(pks)}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
