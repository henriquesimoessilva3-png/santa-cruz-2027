#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Escreve static/fisico_estudo_dados.js — o painel "Perfil físico por posição" da aba Físico.
Fontes (estudo V2): resultados/b1/perfis/jogadores.csv (sobe × meio × cai por setor),
resultados/b1/posicao_faixas.csv (titulares de referência × demais), resultados/b8/*.csv
(tipos físicos, ligações físico → técnico, destaques 2026). Rodar depois do b8_fisico_tecnico.py."""
import datetime, json, os
import pandas as pd

V2 = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Santa Cruz V2", "resultados")
SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "fisico_estudo_dados.js")
SET = {"ZD": "Zaga", "ZE": "Zaga", "LD": "Lateral", "LE": "Lateral", "VOL": "Volante", "MED": "Meia", "MEI": "Meia",
       "ED": "Extremo", "EE": "Extremo", "CA": "Atacante"}
ORD = ["Zaga", "Lateral", "Volante", "Meia", "Extremo", "Atacante"]
M = [("psv99", "Velocidade de pico (PSV-99)"), ("sprint_count_p90", "Sprints/90"), ("hsr_distance_p90", "Alta velocidade/90"),
     ("expl_accel_sprint_p90", "Arrancadas explosivas/90"), ("high_accel_p90", "Acelerações fortes/90"),
     ("cod_count_p90", "Mudanças de direção/90"), ("distance_p90", "Distância/90"),
     ("sprint_distance_p30tip", "Sprint com a bola (30')"), ("sprint_distance_p30otip", "Sprint sem a bola (30')"),
     ("runs_penalty_area_p30tip", "Corridas para a área (30')")]
N = {"psv99": "Velocidade de pico", "sprint_count_p90": "Sprints/90", "hi_count_p90": "Ações de alta intensidade/90",
     "expl_accel_sprint_p90": "Arrancadas explosivas/90", "distance_p90": "Distância/90", "high_accel_p90": "Acelerações fortes/90",
     "cod_count_p90": "Mudanças de direção/90", "runs_p30tip": "Corridas sem bola", "runs_penalty_area_p30tip": "Corridas para a área",
     "sprint_distance_p30tip": "Sprint com a bola", "sprint_distance_p30otip": "Sprint sem a bola"}
T = {"Duelos/90": "Duelos/90", "Duelos ganhos, %": "Duelos ganhos %", "Duelos defensivos/90": "Duelos defensivos/90",
     "Duelos defensivos ganhos, %": "Duelos def. ganhos %", "Duelos aéreos/90": "Duelos aéreos/90", "Duelos aéreos ganhos, %": "Aéreos ganhos %",
     "Duelos ofensivos/90": "Duelos ofensivos/90", "Duelos ofensivos ganhos, %": "Duelos of. ganhos %", "Interseções/90": "Interceptações/90",
     "Dribles/90": "Dribles/90", "Corridas progressivas/90": "Corridas progressivas/90", "Toques na área/90": "Toques na área/90",
     "Acções atacantes com sucesso/90": "Ações ofensivas certas/90", "Golos esperados/90": "xG/90", "Assistências esperadas/90": "xA/90",
     "ga90": "Gols + assist./90", "xgxa90": "xG + xA/90", "Passes progressivos/90": "Passes progressivos/90",
     "Faltas sofridas/90": "Faltas sofridas/90", "Passes chave/90": "Passes chave/90"}


def limpo(v):
    if isinstance(v, float) and v != v: return None
    return v.item() if hasattr(v, "item") else v


def main():
    p = pd.read_csv(os.path.join(V2, "b1", "perfis", "jogadores.csv"))
    p = p[(p.titular == True) & (p.ano <= 2025) & p.pos11.isin(SET)]  # noqa: E712
    p["setor"] = p.pos11.map(SET)
    sobe = {}
    for s in ORD:
        a = p[p.setor == s]
        n = {f: int((a.faixa == f).sum()) for f in ("Cai", "Meio", "Sobe")}
        linhas = []
        for c, r in M:
            g = a.groupby("faixa")[c + "_pct"].mean(); v = a.groupby("faixa")[c].median()
            linhas.append([r, *(limpo(round(g.get(f), 0)) if f in g else None for f in ("Cai", "Meio", "Sobe")),
                           *(limpo(round(v.get(f), 2)) if f in v else None for f in ("Cai", "Meio", "Sobe"))])
        sobe[s] = {"n": n, "linhas": linhas}
    fx = pd.read_csv(os.path.join(V2, "b1", "posicao_faixas.csv"))
    faixas = {s: [[r.nome, r.unidade, r.n_ref, r.n_outros, limpo(r.ref_p25), limpo(r.ref_p50), limpo(r.ref_p75), limpo(r.outros_p50), limpo(r.dif_mediana_pct)]
                  for r in fx[fx.setor == s].itertuples()] for s in ORD}
    tp = pd.read_csv(os.path.join(V2, "b8", "tipos_fisicos.csv"))
    tipos = {s: {"colunas": list(tp.columns[1:]), "linhas": [[limpo(v) for v in r[1:]] for r in tp[tp.setor == s].itertuples(index=False)]} for s in ORD}
    L = pd.read_csv(os.path.join(V2, "b8", "ligacoes.csv"))
    L = L[(L.r.abs() >= 0.25) & (L.r_time_igual.abs() >= 0.2)]
    lig = {s: [[N.get(r.fisico, r.fisico), T.get(r.tecnico, r.tecnico), int(r.n), r.r, r.r_time_igual]
                for r in L[L.setor == s].assign(a=lambda v: v.r.abs()).sort_values("a", ascending=False).head(12).itertuples()] for s in ORD}
    D = pd.read_csv(os.path.join(V2, "b8", "destaques_2026.csv"))
    dest = {s: [[r.jogador, r.clube, r.pos, int(r.idade), int(r.minutos), N.get(r.fis1), r.v_fis1, N.get(r.fis2), r.v_fis2,
                 T.get(r.tec1), r.v_tec1, T.get(r.tec2), r.v_tec2] for r in D[D.setor == s].itertuples()] for s in ORD}
    dados = {"gerado": datetime.date.today().isoformat(), "setores": ORD, "sobe": sobe, "faixas": faixas, "tipos": tipos,
             "ligacoes": lig, "destaques": dest}
    with open(SAIDA, "w", encoding="utf-8") as f:
        f.write("/* GERADO POR gerar_fisico_estudo_js.py - NAO EDITE A MAO. */\nwindow.FISICO_ESTUDO = " +
                json.dumps(dados, ensure_ascii=False) + ";\n")
    print(SAIDA)


if __name__ == "__main__":
    main()
