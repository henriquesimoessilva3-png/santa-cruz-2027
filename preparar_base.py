#!/usr/bin/env python3
"""Gera a base de jogadores do app Santa Cruz 2027.

Une duas fontes do Botafogo Analytics:

  1. fim_contrato_<periodo>.json  — cadastro largo, vindo do Transfermarkt e amigos.
     Enxerga o elenco inteiro dos clubes (40 mil jogadores), traz nome completo,
     contrato com consenso de varias fontes e a faixa salarial do TransferRoom.
  2. rankings_<periodo>.json      — os indicadores tecnicos e as notas do ranking,
     que so existem para quem tem minutagem suficiente (18 mil jogadores).

O cadastro vem da fonte 1; a fonte 2 acrescenta as notas a quem estiver nela.
"""
import json
import os
import sys

BASE_RANKING = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/"
                "fut/BOTA/Analytics/Portal Ranking/output")
AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "dados", "jogadores.json")

GRUPO_PARA_POS = {
    "Goleiro": "GOL", "Lateral Direito": "LD", "Lateral Esquerdo": "LE",
    "Zagueiro - Direita": "ZD", "Zagueiro - Esquerda": "ZE", "Volante": "VOL",
    "Medio": "MED", "Meia": "MEI", "Extremo - Esquerda": "EE",
    "Extremo - Direita": "ED", "Atacante": "CA",
}


def num(v, casas=None):
    if v is None or v == "":
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    if casas is not None:
        f = round(f, casas)
    return int(f) if f == int(f) else f


def main(periodo="ago26"):
    arq_fc = os.path.join(BASE_RANKING, f"fim_contrato_{periodo}.json")
    arq_rk = os.path.join(BASE_RANKING, f"rankings_{periodo}.json")
    for a in (arq_fc, arq_rk):
        if not os.path.exists(a):
            sys.exit(f"nao achei {a}")

    print("lendo o ranking (indicadores) ...")
    with open(arq_rk, encoding="utf-8") as fh:
        ranking = {j.get("primary_key"): j for j in json.load(fh)}

    print("lendo o fisico do SkillCorner ...")
    arq_sc = os.path.join(BASE_RANKING, f"skillcorner_{periodo}.json")
    fisico = {}
    if os.path.exists(arq_sc):
        with open(arq_sc, encoding="utf-8") as fh:
            fisico = json.load(fh)

    print("lendo o fim de contrato (cadastro largo) ...")
    with open(arq_fc, encoding="utf-8") as fh:
        registros = json.load(fh)["registros"]

    saida, sem_pos, i = [], 0, 0
    vistos = set()
    for f in registros:
        pos = GRUPO_PARA_POS.get(f.get("position_group_pt"))
        nome = f.get("Player")
        if not pos or not nome:
            sem_pos += 1
            continue
        time = f.get("Team within selected timeframe") or f.get("Team") or ""
        pk = f.get("primary_key")
        # quem nao tem minutagem vem sem primary_key: monta uma para nao virar duplicata
        chave = pk or f"{nome} - {time} - {f.get('league') or ''}"
        if chave in vistos:
            continue
        vistos.add(chave)

        r = ranking.get(pk) or {} if pk else {}
        tr = f.get("transferroom") or {}

        j = {
            "id": i,
            "n": nome,
            "nc": f.get("tm_nome") or "",                 # nome completo (Transfermarkt)
            "t": time,
            "l": f.get("league") or "",
            "p": pos,
            "id_": num(f.get("Age")),
            "ct": (f.get("contrato_consenso_data") or f.get("Contract expires") or "")[:10],
            "ctc": (f.get("contrato_confianca") or "")[:12],   # alta / baixa / conflito / sem_fonte
            "ctf": f.get("contrato_fontes") or [],
            # data que cada fonte informa — e o que a aba de fim de contrato mostra
            "src": {k: (f.get("src_" + k) or "")[:10] for k in
                    ("wyscout", "transfermarkt", "transferroom", "sofascore",
                     "capology", "fotmob", "footlink", "tff")
                    if f.get("src_" + k)},
            "tm": f.get("tm_id") or "",
            "mv": num(f.get("Market value")),
            "min": num(f.get("Minutes played")),
            "pe": f.get("Foot") or "",
            "alt": num(f.get("Height")),
            "nac": f.get("Birth country") or "",
            "psp": f.get("Passport country") or r.get("Passport country") or "",
            "emp": 1 if f.get("On loan") else 0,
        }
        if tr.get("salario"):
            j["sal"] = tr["salario"]                      # faixa anual do TransferRoom
        if tr.get("xtv"):
            j["xtv"] = num(tr["xtv"])

        # fisico do SkillCorner (existe para as ligas cobertas por tracking)
        met = ((fisico.get(pk) or {}).get("metrics") or {}) if pk else {}
        for chave, campo in (("psv", "psv99"), ("vmax", "peak_velocity"),
                             ("vmax3", "top3_peak_velocity"), ("mmin", "m_min"),
                             ("dist", "total_distance_p90"), ("hsr", "hsr_distance_p90"),
                             ("spr_km", "sprint_distance_p90"), ("spr_n", "n_sprints_p90"),
                             ("acel", "high_accel_p90"), ("desa", "high_decel_p90"),
                             ("hi", "hi_distance_p90"), ("cod", "cod_count_p90")):
            v = num(met.get(campo), 2)
            if v is not None:
                j[chave] = v
        # tamanho da amostra do tracking: minutos e jogos que passaram no controle
        sc = (fisico.get(pk) or {}) if pk else {}
        if sc.get("minutes") is not None:
            j["sc_min"] = num(sc.get("minutes"), 0)
        if sc.get("n_perf_passed") is not None:
            j["sc_n"] = num(sc.get("n_perf_passed"), 0)

        if r:   # tem indicadores no ranking
            j.update({
                "rk_ok": 1,
                "pw": r.get("Position") or "",
                "jog": num(r.get("Matches played")),
                "peso": num(r.get("Weight")),
                "rk": num(r.get("rank")),
                "ov": num(r.get("overall"), 1),
                "ofe": num(r.get("overall_offensive"), 1),
                "def": num(r.get("overall_deffensive"), 1),
                "pas": num(r.get("overall_pass"), 1),
                "dgp": num(r.get("overall_dgp"), 1),
                "gk": num(r.get("overall_gk"), 1),
                "bp": num(r.get("overall_bola_parada"), 1),
                "fis": num(r.get("phy_score"), 1),
                "obr": num(r.get("obr_score"), 1),
                "drb": num(r.get("Successful dribbles per 90"), 2),
                "prog": num(r.get("Progressive runs per 90"), 2),
                "aer": num(r.get("Aerial duels won, %"), 1),
                "ddef": num(r.get("Defensive duels won, %"), 1),
                "pas%": num(r.get("Accurate passes, %"), 1),
                "cru%": num(r.get("Accurate crosses, %"), 1),
                "gols": num(r.get("Non-penalty goals per 90"), 2),
                "xa": num(r.get("xA per 90"), 2),
                "gk_sai": num(r.get("gk_exits_per_90"), 2),
                "gk_evi": num(r.get("gk_prevented_goals_per_90"), 2),
                "gk_def": num(r.get("gk_save_rate_pct"), 1),
                "gk_pas": num(r.get("gk_accurate_passes_pct"), 1),
                "cs": num(r.get("Clean sheets")),
            })
        else:
            j["rk_ok"] = 0

        saida.append({k: v for k, v in j.items() if v not in (None, "", [])} | {"id": i, "n": nome})
        i += 1

    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, "w", encoding="utf-8") as fh:
        json.dump({"periodo": periodo, "jogadores": saida}, fh,
                  ensure_ascii=False, separators=(",", ":"))

    mb = os.path.getsize(SAIDA) / 1024 / 1024
    com_rk = sum(1 for j in saida if j.get("rk_ok"))
    com_sal = sum(1 for j in saida if j.get("sal"))
    print(f"ok: {len(saida)} jogadores ({sem_pos} sem posicao) -> {SAIDA} ({mb:.1f} MB)")
    print(f"    {com_rk} com indicadores do ranking · {len(saida)-com_rk} so cadastro")
    print(f"    {com_sal} com faixa salarial do TransferRoom")
    print(f"    {sum(1 for j in saida if j.get('psv'))} com dados físicos do SkillCorner")
    for liga in ("Brasil A", "Brasil B", "Brasil C"):
        n = sum(1 for j in saida if j.get("l") == liga)
        nr = sum(1 for j in saida if j.get("l") == liga and j.get("rk_ok"))
        print(f"    {liga}: {n} jogadores ({nr} com indicadores)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "ago26")
