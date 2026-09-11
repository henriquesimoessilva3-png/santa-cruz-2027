#!/usr/bin/env python3
"""Acrescenta ao dados/raio_ref.json duas referencias novas: QUEM SOBE e QUEM CAI.

A aba Fisico compara o atleta com duas medias de referencia por posicao — Brasil e Mundo.
Estas duas respondem outra pergunta, e e a pergunta do planejamento do Santa Cruz: **o
atleta esta no nivel fisico de quem sobe da Serie B, ou no de quem cai?**

As medias saem do SkillCorner, das quatro temporadas COMPLETAS (2022-2025), separando os
16 clube-temporada que terminaram entre 1o e 4o dos 16 que terminaram entre 17o e 20o.

## Este script RODA DEPOIS do _fonte/gerar_raio_ref.py

Ele nao gera o arquivo, ele ACRESCENTA. O `gerar_raio_ref.py` escreve o raio_ref.json com
as refs de Brasil e Mundo; este entra depois e poe `sobe` e `cai` ao lado. Rodar na ordem
inversa apaga o trabalho dele.

## A ponte de posicao

O SkillCorner nao diz posicao no agregado de temporada. A posicao vem do Wyscout, pelo
mesmo casamento de nome + idade que traz o clube (conferido em 98,2%), e a `posicao_1`
do Wyscout e traduzida para os dez codigos da aba. Duas escolhas que valem dizer:

- **`CB` (zagueiro sem lado) entra nos DOIS** — ZD e ZE. Ele joga dos dois lados e deixar
  de fora tiraria 36 atletas-temporada da conta de zaga; entrar so num dos lados seria
  escolher um lado no cara ou coroa.
- **`LAMF`/`RAMF` (meia ofensivo pelos lados) vao para ED/EE**, nao para MEI. No Wyscout
  eles sao a mesma funcao dos pontas, e o raio da aba trata ED/EE como extremo.

Goleiro fica de fora, como no resto do arquivo: o SkillCorner nao rastreia goleiro.

Uso:
    python3 gerar_raio_serieb.py
"""
import datetime as dt
import json
import os
import re
import sqlite3
import unicodedata

import numpy as np
import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIO = os.path.join(AQUI, "dados", "raio_ref.json")
SKILLCORNER = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/fut/BOTA/"
               "Analytics/Portal Skillcorner/dados/skillcorner.db")
SC_EDICOES = {335: 2022, 446: 2023, 773: 2024, 1061: 2025}   # so as temporadas completas

# chave da aba -> coluna do SkillCorner. As de tempo (t_*) moram no raw_json.
DE_PARA = {
    "psv5": "psv99_top5", "psv": "psv99",
    "spr_km": "sprint_distance_p90", "spr_n": "sprint_count_p90",
    "hsr": "hsr_distance_p90", "hsr_n": "hsr_count_p90",
    "hi": "hi_distance_p90", "hi_n": "hi_count_p90",
    "dist": "distance_p90", "mmin": "m_per_min", "run": "running_distance_p90",
    "acel_m": "medium_accel_p90", "desa_m": "medium_decel_p90",
    "expl": "expl_accel_sprint_p90", "acel": "high_accel_p90", "desa": "high_decel_p90",
    "cod": "cod_count_p90",
    # com a bola / sem a bola. NAO ha equivalente das "corridas sem bola" (Off Ball Runs)
    # aqui: a tabela `off_ball_runs` so tem Serie B de 2026, e 2026 esta fora destas
    # edicoes por ser temporada incompleta. Pedir seria trazer coluna vazia.
    "mm_c": "m_per_min_tip", "mm_s": "m_per_min_otip",
    "hi_c": "hi_distance_p30tip", "hi_s": "hi_distance_p30otip",
    "spn_c": "sprint_count_p30tip", "spn_s": "sprint_count_p30otip",
}
# As corridas sem bola moram em OUTRA TABELA (`off_ball_runs`), nao no `physical` — por
# isso entram por LEFT JOIN e num mapa proprio. Ate 11/09/2026 estas quatro edicoes tinham
# ZERO linha ali: era buraco de sincronizacao, nao limite da fonte (a API devolveu 800,
# 776, 765 e 800 quando finalmente foi perguntada).
DE_PARA_OBR = {
    "obr": "runs_p30tip", "obr_hsr": "runs_above_hsr_p30tip",
    "obr_area": "runs_penalty_area_p30tip", "obr_per": "runs_dangerous_p30tip",
    "obr_rec": "runs_received_p30tip", "obr_rem": "runs_shot_within_10s_p30tip",
}
DE_PARA_JSON = {
    "vmax3": "peak_velocity_top3", "vmax": "peak_velocity",
    "t_spr": "timetosprint_top3", "t_hsr": "timetohsr_top3",
    "t505_90": "timeto505around90_top3", "t505_180": "timeto505around180_top3",
    "t_spr_cod": "timetosprintpostcod_top3", "t_hsr_cod": "timetohsrpostcod_top3",
}

POSICOES = {
    "RCB": ["ZD"], "LCB": ["ZE"], "CB": ["ZD", "ZE"],
    "RB": ["LD"], "RWB": ["LD"], "LB": ["LE"], "LWB": ["LE"],
    "DMF": ["VOL"], "RDMF": ["VOL"], "LDMF": ["VOL"],
    "RCMF": ["MED"], "LCMF": ["MED"],
    "AMF": ["MEI"],
    "RW": ["ED"], "RWF": ["ED"], "RAMF": ["ED"],
    "LW": ["EE"], "LWF": ["EE"], "LAMF": ["EE"],
    "CF": ["CA"],
}

MIN_RASTREADOS = 300      # abaixo disso a media por 90 e ruido de quem entrou dez minutos
MIN_AMOSTRA = 8           # uma referencia com menos de 8 atletas nao e referencia


def chave_nome(s):
    s = unicodedata.normalize("NFD", str(s)).lower()
    s = "".join(x for x in s if unicodedata.category(x) != "Mn")
    return re.sub(r"[^a-z ]", "", s).strip()


def idade_em_setembro(nasc, ano):
    if not isinstance(nasc, str) or len(nasc) < 10:
        return None
    n = dt.date(int(nasc[:4]), int(nasc[5:7]), int(nasc[8:10]))
    r = dt.date(ano, 9, 11)
    return r.year - n.year - ((r.month, r.day) < (n.month, n.day))


def carregar():
    """Atletas do SkillCorner com clube, posicao e faixa da tabela."""
    con = sqlite3.connect(SKILLCORNER)
    cols = sorted(set(DE_PARA.values()))
    obr = sorted(set(DE_PARA_OBR.values()))
    # LEFT JOIN e nao JOIN: quem nao tem corrida sem bola continua entrando com o resto do
    # fisico. Um INNER aqui derrubaria a amostra inteira pelo indicador mais fraco.
    sc = pd.read_sql(
        "select p.sc_competition_edition_id ed, pl.short_name, pl.birthdate, "
        "p.minutes_played, p.matches, p.raw_json, " + ", ".join("p." + c for c in cols) +
        ", " + ", ".join("o." + c for c in obr) +
        " from physical p join players pl on pl.sc_player_id = p.sc_player_id"
        " left join off_ball_runs o on o.sc_player_id = p.sc_player_id"
        " and o.sc_competition_edition_id = p.sc_competition_edition_id"
        f" where p.sc_competition_edition_id in ({','.join(map(str, SC_EDICOES))})", con)
    sc["ano"] = sc.ed.map(SC_EDICOES)
    sc["min_tot"] = sc.minutes_played * sc.matches

    # o que so existe no raw_json (velocidade maxima e os tempos)
    def do_json(txt, chave):
        try:
            return json.loads(txt).get(chave)
        except Exception:
            return None
    for k, campo in DE_PARA_JSON.items():
        sc[k] = [do_json(t, campo) for t in sc.raw_json]

    T = pd.read_csv(os.path.join(AQUI, "dados", "serieb_tecnico.csv"))
    T["cl"] = T["Equipa dentro de um período de tempo seleccionado"]
    T["k"] = T.Jogador.map(chave_nome)
    ponte = {}
    for (a, k), g in T.groupby(["ano", "k"]):
        if g.cl.nunique() != 1 or g.posicao_1.nunique() != 1:
            continue          # nome repetido no ano, ou mesma pessoa lida em duas posicoes
        idades = g.idade_na_temporada.dropna()
        ponte[(a, k)] = (g.cl.iloc[0], g.posicao_1.iloc[0],
                         float(idades.iloc[0]) if len(idades) else None)

    clube, pos = [], []
    for ano, nome, nasc in zip(sc.ano, sc.short_name, sc.birthdate):
        v = ponte.get((ano, chave_nome(nome)))
        if not v:
            clube.append(None); pos.append(None); continue
        cl, pp, iw = v
        i = idade_em_setembro(nasc, ano)
        if i is not None and iw is not None and not (-2 <= i - iw <= 3):
            clube.append(None); pos.append(None); continue   # homonimo, nao a mesma pessoa
        clube.append(cl); pos.append(pp)
    sc["clube"], sc["pos_wy"] = clube, pos
    sc = sc[sc.clube.notna() & sc.pos_wy.notna() & (sc.min_tot >= MIN_RASTREADOS)]

    tab = pd.read_csv(os.path.join(AQUI, "dados", "serieb_clube_temporada.csv"))
    faixa = dict(zip(zip(tab.ano, tab.clube), tab.faixa))
    sc["faixa"] = [faixa.get((a, c)) for a, c in zip(sc.ano, sc.clube)]
    return sc[sc.faixa.notna()]


def main():
    if not os.path.exists(SKILLCORNER):
        raise SystemExit("skillcorner.db nao encontrado")
    raio = json.load(open(RAIO, encoding="utf-8"))
    sc = carregar()
    print(f"{len(sc)} atleta-temporada com clube, posição e 300+ minutos rastreados")

    chaves = list(DE_PARA) + list(DE_PARA_JSON) + list(DE_PARA_OBR)
    feitas = 0
    for codigo in list(raio["refs"]):
        wy = [w for w, cs in POSICOES.items() if codigo in cs]
        d = sc[sc.pos_wy.isin(wy)]
        for faixa, nome in [("sobe", "sobe"), ("cai", "cai")]:
            g = d[d.faixa == faixa]
            if len(g) < MIN_AMOSTRA:
                print(f"  {codigo:<4} {nome}: só {len(g)} atletas — fica de fora")
                continue
            valores = {}
            for k in chaves:
                col = DE_PARA.get(k) or DE_PARA_OBR.get(k) or k
                serie = pd.to_numeric(g[col], errors="coerce")
                ok = serie.notna()
                # cobertura baixa = indicador ausente, nao indicador zero. O vmax e o
                # vmax3 caem aqui: neste banco eles so existem de 2025 em diante.
                if ok.sum() < len(g) * 0.6:
                    continue
                valores[k] = round(float(np.average(serie[ok], weights=g.min_tot[ok])), 3)
            raio["refs"][codigo][nome] = {
                "n": int(len(g)),
                "nomes": [f"{len(g)} atletas dos clubes que "
                          f"{'subiram' if faixa == 'sobe' else 'caíram'} · Série B 2022-2025"],
                "valores": valores,
            }
            feitas += 1
            print(f"  {codigo:<4} {nome}: {len(g):>3} atletas · {len(valores)} indicadores")

    raio["_doc_serieb"] = (
        "As referencias 'sobe' e 'cai' sao medias do SkillCorner das quatro temporadas "
        "completas da Serie B (2022-2025), ponderadas por minuto rastreado: 'sobe' sao os "
        "clubes que terminaram entre 1o e 4o, 'cai' os que terminaram entre 17o e 20o. O "
        "clube e a posicao de cada atleta vem de uma ponte SkillCorner-Wyscout por nome + "
        "idade, conferida em 98,2%. 'vmax' e 'vmax3' faltam de proposito: neste banco eles "
        "so tem cobertura de 2025 em diante. Geradas por gerar_raio_serieb.py, que roda "
        "DEPOIS do _fonte/gerar_raio_ref.py.")
    with open(RAIO, "w", encoding="utf-8") as f:
        json.dump(raio, f, ensure_ascii=False)
    print(f"\n{feitas} referências gravadas em {os.path.relpath(RAIO, AQUI)} "
          f"({os.path.getsize(RAIO)/1024:.0f} KB)")


if __name__ == "__main__":
    main()
