#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""A ficha física V2 que a aba Físico e o raio ⚡ leem: dados/ficha_fisica_v2.json.

## De onde vem cada régua (estudo V2, Bloco 1)

- PISO de velocidade (27 km/h de PSV-99): `Santa Cruz V2/resultados/b1/B1.md`, conclusão 2 — a
  amplitude do onze anda contra o rendimento nas 5 temporadas; o quartil mais estreito (2,7 km/h)
  fez 55 pontos; quem cai tem 4,0–4,35 km/h; o mais lento do onze é quase sempre meia ou volante.
- INTENSIDADE (sprints e ações de alta intensidade acima da mediana): `B1.md` conclusão 1 e
  `B1_perfis.md` §3 — quem sobe no percentil 60–68, quem cai no 33–41; a dinheiro igual, 4–6 pontos.
- TRAÇO DA POSIÇÃO (arrancada explosiva e corrida para a área): `B1.md` conclusão 3 e
  `B1_perfis.md` §2; as faixas P25/P50/P75 dos titulares de referência vêm de
  `resultados/b1/posicao_faixas.csv` (gerado por `scripts/b1_posicao.py`).
- O que NÃO rende ponto (distância, acelerações, giro, returno): `B1.md` conclusões 1 e 5.

## A conferência de definição (pedida no PROMPT_ABA_FISICO.md)

A faixa do V2 só é usada direto quando a mediana do indicador nos jogadores de Série B do app
(`dados/jogadores.json`, ≥ 5 jogos rastreados) fica a ±10% da mediana do V2 na mesma temporada
(2026, `base_fisico.csv`). Medido em 23/09/2026:

  psv  +0,5% · spr_n −6,6% · expl +1,7%                       → faixa do V2 DIRETO
  obr_area −17,2% · obr_per −23,5% (mesma medida, outro nível) → PERCENTIL: a faixa vira a mesma
      posição relativa na distribuição de Série B do app (o P50 do V2 cai no percentil X da
      Série B do V2; a faixa do app é o percentil X da Série B do app)
  spn_c, spn_s, hi_c (o V2 mede metros de sprint/HSR; o app, contagem de sprint e metros de
      alta intensidade)                                         → RECALCULADA com a coluna
      equivalente do `base_fisico.csv` (sprint_count_p30tip −3,2%, sprint_count_p30otip 0,0%,
      hi_distance_p30tip −3,7%), mesmos titulares de referência do `b1_posicao.py`

A conferência é refeita toda vez que o script roda e vai gravada no JSON; se um indicador que
batia deixar de bater, o caminho muda sozinho e a saída avisa.

## A validação obrigatória

Em cada posição, a nota da ficha das colunas "Quem SOBE" e "Quem CAI" da matriz (médias do
`raio_ref.json`) tem de sair com quem sobe ACIMA. A tabela antes (índice geral de hoje) × depois
(nota da ficha) é impressa e gravada no JSON. Onde não passar, não se força: fica escrito.

Uso:
    python3 gerar_ficha_fisica.py
"""
import json
import os
import sys

import numpy as np
import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.join(AQUI, "Santa Cruz V2")
B1 = os.path.join(V2, "resultados", "b1")
SAIDA = os.path.join(AQUI, "dados", "ficha_fisica_v2.json")
sys.path.insert(0, os.path.join(V2, "scripts"))
from _comum import clube_temporada  # noqa: E402

PISO_PASSA, PISO_LIMITE = 27.0, 26.5         # B1.md, conclusão 2
MIN_JOGOS = 5                                 # o mesmo mínimo padrão da aba (#fsMin)
POS_SETOR = {"ZD": "Zaga", "ZE": "Zaga", "LD": "Lateral", "LE": "Lateral", "VOL": "Volante",
             "MED": "Meia", "MEI": "Meia", "ED": "Extremo", "EE": "Extremo", "CA": "Atacante"}

# O traço de cada posição, como o PROMPT_ABA_FISICO.md pede (tirado de B1_perfis.md §2).
# NÃO premiar sprint sem bola no extremo: aponta para baixo (r −0,39, B1.md conclusão 3).
TRACO = {
    "ZD": ["expl", "obr_area"], "ZE": ["expl", "obr_area"],
    "LD": ["spr_n", "spn_c"], "LE": ["obr_area", "hi_c"],
    "VOL": ["expl", "hi_c"], "MED": ["expl", "obr_area", "hi_c"],
    # MEI sem traço físico: em B1_perfis.md §2 o MEI (e o extremo) dos times que rendem corre
    # MENOS (sprint −10/−13%, arrancadas −10/−26%). Para ele o físico é só o piso; decide o técnico.
    # Revisão de 23/09 (Cowork), decidida pelo texto do B1, não pela validação.
    "MEI": [], "ED": ["obr_area"], "EE": ["obr_area"],
    "CA": ["spr_n", "spn_s", "obr_area", "obr_per"],
}
INTENSIDADE = ["spr_n", "hi_n"]
# Intensidade entra na nota só onde o B1 não diz o contrário: em MEI, ED e EE o titular dos times
# que rendem sprinta MENOS (B1_perfis.md §2). Lá a nota é só o traço (ED/EE) ou não há nota (MEI).
SEM_INTENSIDADE = {"MEI", "ED", "EE"}
# app -> coluna do V2 com a MESMA definição (para validar contra os titulares de referência)
V2_DO_APP = {"psv": "psv99", "spr_n": "sprint_count_p90", "hi_n": "hi_count_p90",
             "expl": "expl_accel_sprint_p90", "obr_area": "runs_penalty_area_p30tip",
             "obr_per": "runs_dangerous_p30tip", "spn_c": "sprint_count_p30tip",
             "spn_s": "sprint_count_p30otip", "hi_c": "hi_distance_p30tip"}
ROTULO = {
    "psv": "Velocidade de pico (PSV-99)", "spr_n": "Sprints por 90", "hi_n": "Ações de alta intensidade por 90",
    "expl": "Arrancadas explosivas por 90", "obr_area": "Corridas para a área (30 min com posse)",
    "obr_per": "Corridas perigosas (30 min com posse)", "spn_c": "Sprints com a bola (30 min)",
    "spn_s": "Sprints sem a bola (30 min)", "hi_c": "Alta intensidade com a bola (m, 30 min)",
}
# (campo do app, id da faixa no posicao_faixas.csv, coluna do V2 com a MESMA definição do app)
DEFINICAO = {
    "psv": ("psv", "psv99"), "spr_n": ("spr_n", "sprint_count_p90"), "expl": ("expl", "expl_accel_sprint_p90"),
    "obr_area": ("runs_area", "runs_penalty_area_p30tip"), "obr_per": ("runs_per", "runs_dangerous_p30tip"),
    "spn_c": ("spr_tip", "sprint_count_p30tip"), "spn_s": ("spr_otip", "sprint_count_p30otip"),
    "hi_c": ("hsr_tip", "hi_distance_p30tip"),
}
# a coluna que o V2 USOU na faixa (para a conferência de ±10%)
COL_DA_FAIXA = {"psv": "psv99", "spr_n": "sprint_count_p90", "expl": "expl_accel_sprint_p90",
                "obr_area": "runs_penalty_area_p30tip", "obr_per": "runs_dangerous_p30tip",
                "spn_c": "sprint_distance_p30tip", "spn_s": "sprint_distance_p30otip",
                "hi_c": "hsr_distance_p30tip"}

# Os grupos do índice geral de hoje (FS_GRUPOS de static/app.js, só os que entram no índice)
GRUPOS_HOJE = [
    [("vmax3", 0), ("vmax", 0), ("psv5", 0), ("psv", 0)],
    [("spr_km", 0), ("spr_n", 0), ("hsr", 0), ("hsr_n", 0), ("hi", 0), ("hi_n", 0)],
    [("dist", 0), ("mmin", 0), ("run", 0), ("acel_m", 0), ("desa_m", 0)],
    [("expl", 0), ("acel", 0), ("desa", 0), ("t_spr", 1), ("t_hsr", 1)],
    [("cod", 0), ("t505_90", 1), ("t505_180", 1), ("t_spr_cod", 1), ("t_hsr_cod", 1)],
]


def base_app():
    L = json.load(open(os.path.join(AQUI, "dados", "jogadores.json"), encoding="utf-8"))
    L = L if isinstance(L, list) else (L.get("jogadores") or list(L.values())[0])
    # quem ganhou físico de outra temporada pela base do V2 (fis_src) NÃO entra na régua
    return [x for x in L if x.get("psv") and not x.get("fis_src")]


def coorte(L, pos):
    """A régua da ficha: a posição na SÉRIE B, >= 5 jogos rastreados. O estudo mede contra a
    mediana da Série B (é a liga que o Santa Cruz vai jogar); revisão de 23/09 — antes era A + B."""
    return [x for x in L if x.get("p") == pos and x.get("l") == "Brasil B"
            and (x.get("sc_n") or 0) >= MIN_JOGOS]


def pct(ordenado, v, menor=False):
    """O mesmo fsPct() da aba: posição do valor na lista ordenada, 0–100."""
    if v is None or len(ordenado) < 2:
        return None
    lo = int(np.searchsorted(ordenado, v, side="left"))
    p = lo / (len(ordenado) - 1) * 100
    return round(max(0, min(100, 100 - p if menor else p)))


def faixas():
    """As faixas por setor, no caminho que a conferência escolher para cada indicador."""
    F = pd.read_csv(os.path.join(B1, "posicao_faixas.csv"))
    b = pd.read_csv(os.path.join(B1, "base_fisico.csv"))
    L = base_app()
    app_b = pd.DataFrame([x for x in L if x.get("l") == "Brasil B" and (x.get("sc_n") or 0) >= MIN_JOGOS
                          and x.get("p") != "GOL"])
    v26 = b[(b.ano == 2026) & (b.setor != "Goleiro")]

    # os mesmos titulares de referência do b1_posicao.py
    ct = clube_temporada()
    bb = b.merge(ct[["ano", "clube", "rendimento"]], on=["ano", "clube"])
    bb = bb[(bb.setor != "Goleiro") & (bb.ano <= 2025)]
    corte = ct[ct.ano <= 2025]["rendimento"].quantile(0.75)
    tit = bb[bb.fatia >= 0.6]
    ref = tit[tit.rendimento >= corte]

    conferencia, fora = {}, {}
    for campo, (fid, col_app) in DEFINICAO.items():
        m_app = float(app_b[campo].median())
        m_v2 = float(v26[COL_DA_FAIXA[campo]].median())
        dif = 100 * (m_app - m_v2) / m_v2
        if abs(dif) <= 10:
            caminho = "direto"
        elif col_app == COL_DA_FAIXA[campo]:
            caminho = "percentil"      # mesma medida, nível diferente
        else:
            caminho = "recalculada"    # medida diferente: refaz com a coluna equivalente
        conferencia[campo] = {"mediana_app": round(m_app, 2), "mediana_v2": round(m_v2, 2),
                              "coluna_v2": COL_DA_FAIXA[campo], "dif_pct": round(dif, 1),
                              "caminho": caminho,
                              "coluna_recalculo": col_app if caminho == "recalculada" else None}
        for setor in sorted(POS_SETOR.values()):
            if (setor, campo) in fora:
                continue
            linha = F[(F.setor == setor) & (F.id == fid)]
            if caminho == "direto":
                if linha.empty:
                    continue
                r = linha.iloc[0]
                fx = [r.ref_p25, r.ref_p50, r.ref_p75]
                n = int(r.n_ref)
            elif caminho == "recalculada":
                v = ref[ref.setor == setor][col_app].dropna()
                if len(v) < 5:
                    continue
                fx = [v.quantile(.25), v.median(), v.quantile(.75)]
                n = len(v)
            else:  # percentil: mesma posição relativa na Série B de cada lado
                if linha.empty:
                    continue
                r = linha.iloc[0]
                dv2 = np.sort(b[(b.setor == setor) & (b.ano <= 2025)][col_app].dropna().values)
                posicoes = [p for p, s in POS_SETOR.items() if s == setor]
                dapp = app_b[app_b.p.isin(posicoes)][campo].dropna().values
                if len(dv2) < 10 or len(dapp) < 10:
                    continue
                qs = [np.searchsorted(dv2, x) / len(dv2) for x in (r.ref_p25, r.ref_p50, r.ref_p75)]
                fx = [float(np.quantile(dapp, q)) for q in qs]
                n = int(r.n_ref)
            fora[(setor, campo)] = {"p25": round(float(fx[0]), 2), "p50": round(float(fx[1]), 2),
                                    "p75": round(float(fx[2]), 2), "n_ref": n, "caminho": caminho}
    return conferencia, fora


def nota_ficha(co, obj, pos):
    ords = {k: np.sort([x[k] for x in co if isinstance(x.get(k), (int, float))]) for k in
            set(INTENSIDADE + TRACO[pos])}
    ints = [] if pos in SEM_INTENSIDADE else [pct(ords[k], obj.get(k)) for k in INTENSIDADE]
    ints = [p for p in ints if p is not None]
    tr = [pct(ords[k], obj.get(k)) for k in TRACO[pos]]
    tr = [p for p in tr if p is not None]
    i = sum(ints) / len(ints) if ints else None
    t = sum(tr) / len(tr) if tr else None
    if i is None and t is None:
        return None, i, t
    if t is None:
        return round(i), i, t
    if i is None:
        return round(t), i, t
    return round(0.5 * t + 0.5 * i), i, t


def validar_referencia(L):
    """A validação que responde à MESMA pergunta das faixas: titulares dos times que renderam acima
    do dinheiro (time_referencia do B1) contra os demais titulares, 2022–2025, por posição.
    As colunas "Quem sobe/cai" do raio_ref.json separam por tabela SEM descontar o dinheiro —
    ficam como leitura secundária."""
    per = pd.read_csv(os.path.join(B1, "perfis", "jogadores.csv"))
    b = pd.read_csv(os.path.join(B1, "base_fisico.csv"))
    per = per[(per.titular == 1) | (per.titular == True)] if "titular" in per else per  # noqa: E712
    m = per[["ano", "clube", "jogador", "pos11", "time_referencia"]].merge(
        b, on=["ano", "clube", "jogador"], how="inner")
    m = m[m.ano <= 2025]
    out = []
    for pos in POS_SETOR:
        co = coorte(L, pos)
        sub = m[m.pos11 == pos]
        notas = {True: [], False: []}
        for _, r in sub.iterrows():
            obj = {k: (float(r[c]) if c in r and pd.notna(r[c]) else None) for k, c in V2_DO_APP.items()}
            n, _, _ = nota_ficha(co, obj, pos)
            if n is not None:
                notas[bool(r.time_referencia)].append(n)
        a, d = notas[True], notas[False]
        out.append({"pos": pos, "ref": round(float(np.mean(a))) if a else None, "n_ref": len(a),
                    "demais": round(float(np.mean(d))) if d else None, "n_demais": len(d),
                    "passa": bool(a and d and np.mean(a) > np.mean(d)),
                    "sem_nota": pos == "MEI"})
    return out


def indice_hoje(co, obj):
    gs = []
    for g in GRUPOS_HOJE:
        ps = []
        for k, menor in g:
            o = np.sort([x[k] for x in co if isinstance(x.get(k), (int, float))])
            p = pct(o, obj.get(k), bool(menor))
            if p is not None:
                ps.append(p)
        if ps:
            gs.append(round(sum(ps) / len(ps)))
    return round(sum(gs) / len(gs)) if len(gs) >= 3 else None


def main():
    conferencia, fx = faixas()
    L = base_app()
    R = json.load(open(os.path.join(AQUI, "dados", "raio_ref.json"), encoding="utf-8"))
    validacao = []
    for pos in POS_SETOR:
        co = coorte(L, pos)
        rp = R["refs"].get(pos) or {}
        s, c = (rp.get("sobe") or {}).get("valores"), (rp.get("cai") or {}).get("valores")
        if not s or not c:
            continue
        a_s, a_c = indice_hoje(co, s), indice_hoje(co, c)
        n_s, i_s, t_s = nota_ficha(co, s, pos)
        n_c, i_c, t_c = nota_ficha(co, c, pos)
        validacao.append({
            "pos": pos, "antes_sobe": a_s, "antes_cai": a_c, "depois_sobe": n_s, "depois_cai": n_c,
            "int_sobe": round(i_s) if i_s is not None else None, "int_cai": round(i_c) if i_c is not None else None,
            "traco_sobe": round(t_s) if t_s is not None else None, "traco_cai": round(t_c) if t_c is not None else None,
            "psv_sobe": round(s.get("psv"), 2), "psv_cai": round(c.get("psv"), 2),
            "passa": (n_s is not None and n_c is not None and n_s > n_c),
            "n_coorte": len(co),
        })

    validacao_ref = validar_referencia(L)
    por_pos = {}
    for pos, setor in POS_SETOR.items():
        por_pos[pos] = {"setor": setor, "intensidade": pos not in SEM_INTENSIDADE, "traco": [
            {"k": k, "rot": ROTULO[k], **(fx.get((setor, k)) or {"p25": None, "p50": None, "p75": None,
                                                                  "n_ref": 0, "caminho": "sem faixa"})}
            for k in TRACO[pos]]}

    saida = {
        "_doc": ("Ficha física V2 da aba Físico e do raio ⚡. Gerado por gerar_ficha_fisica.py a partir "
                 "do estudo em Santa Cruz V2/ (B1.md, B1_perfis.md, posicao_faixas.csv, base_fisico.csv). "
                 "Não editar à mão."),
        "piso": {"passa": PISO_PASSA, "limite": PISO_LIMITE, "campo": "psv",
                 "de": "B1.md, conclusão 2"},
        "intensidade": {"campos": INTENSIDADE, "rot": [ROTULO[k] for k in INTENSIDADE],
                        "de": "B1.md conclusão 1; B1_perfis.md §3"},
        "nota": "50% traço da posição + 50% intensidade, em percentil na Série B da posição "
                "(ED/EE: só traço; MEI: sem nota, só o piso). O piso não entra na nota: é selo à parte.",
        "min_jogos": MIN_JOGOS,
        "posicoes": por_pos,
        "conferencia_definicao": conferencia,
        "validacao_sobe_cai": validacao,
        "validacao_referencia": validacao_ref,
        "coorte": "Série B, >= 5 jogos rastreados, sem físico de outra temporada",
        "onze": {"lento_ref": 27.4, "de": "B1.md conclusão 2: no quartil que mais pontuou o mais lento do onze tinha 27,4 km/h"},
        "conclusoes": [
            "Piso de velocidade: nenhum titular de linha abaixo de ~27 km/h de PSV-99 — é o achado mais forte.",
            "Intensidade acima da mediana: quem sobe fica no percentil 60–68, quem cai no 33–41; vale 4–6 pontos a dinheiro igual.",
            "Traço da posição: o titular dos times que rendem se diferencia em arrancadas e corridas para a área.",
            "Distância, acelerações, giro e aguentar o returno não rendem ponto.",
        ],
        "amplitude": {"boa": 2.7, "cai": 4.0, "de": "B1.md, conclusão 2"},
        # faixa de INTENSIDADE do titular dos times de referência, por setor (posicao_faixas.csv) —
        # para a legenda dizer o número da posição, não o percentil do time
        "intensidade_faixas": {st: {r.id: {"p25": round(float(r.ref_p25), 2), "p50": round(float(r.ref_p50), 2),
                                           "p75": round(float(r.ref_p75), 2), "demais": round(float(r.outros_p50), 2)}
                                    for r in pd.read_csv(os.path.join(B1, "posicao_faixas.csv")).query("setor == @st and id in ['spr_n', 'hi_n']").itertuples()}
                               for st in sorted(set(POS_SETOR.values()))},
    }
    with open(SAIDA, "w", encoding="utf-8") as fh:
        json.dump(saida, fh, ensure_ascii=False, indent=1)

    print("conferência de definição:")
    for k, c in conferencia.items():
        print(f"  {k:9} app {c['mediana_app']:8} × V2 {c['mediana_v2']:8} ({c['coluna_v2']}) "
              f"{c['dif_pct']:+6.1f}% → {c['caminho']}")
    print("\nvalidação por posição (nota de quem sobe tem de ficar acima da de quem cai):")
    print(f"  {'pos':4} {'antes S':>8} {'antes C':>8} │ {'depois S':>9} {'depois C':>9}  │ int S/C   traço S/C  │ psv S/C")
    for v in validacao:
        print(f"  {v['pos']:4} {str(v['antes_sobe']):>8} {str(v['antes_cai']):>8} │ {str(v['depois_sobe']):>9} "
              f"{str(v['depois_cai']):>9}  │ {v['int_sobe']}/{str(v['int_cai']):<6} {v['traco_sobe']}/{str(v['traco_cai']):<6}  │ "
              f"{v['psv_sobe']}/{v['psv_cai']}  {'PASSA' if v['passa'] else 'NÃO PASSA'}")
    print("\nvalidação principal: titulares dos times de referência (acima do dinheiro) × demais, 2022–2025:")
    for v in validacao_ref:
        print(f"  {v['pos']:4} ref {str(v['ref']):>4} (n {v['n_ref']:3}) × demais {str(v['demais']):>4} (n {v['n_demais']:3})  "
              f"{'sem nota (MEI: só piso)' if v['sem_nota'] else ('PASSA' if v['passa'] else 'NÃO PASSA')}")
    print(f"\n{os.path.relpath(SAIDA, AQUI)} gravado")


if __name__ == "__main__":
    main()
