#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Escreve static/subida_dados.js — a aba "Subida".

A aba compara jogadores do mercado com o titular de quem SOBE e de quem CAI na Série B, nos mesmos
indicadores da aba "Característica por posição" (físico SkillCorner + técnico Wyscout), e filtra quem
cumpre os mínimos de cada perfil (Físico, Passe, Ataque, Defesa, Completo).
  - régua (sobe / cai / separação): static/caracteristicas_dados.js — rode gerar_caracteristicas_js.py antes;
  - jogadores: Série B 2026 + 59 ligas do Wyscout ago/26 (>= 900 min), as mesmas bases do estudo V2;
  - físico: Série B pelo SkillCorner do estudo; demais ligas pelo dados/jogadores.json (Portal).
Vetados (listas/EXCLUIDOS.csv) ficam de fora. Rodar de novo quando as bases mudarem.
"""
import datetime, json, math, os, sys, warnings
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")
AQUI = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.join(AQUI, "Santa Cruz V2")
sys.path.insert(0, os.path.join(V2, "scripts")); sys.path.insert(0, AQUI)
from _comum import chave, excluidos, RES   # noqa: E402
import listas as L                          # noqa: E402
import gerar_caracteristicas_js as C        # noqa: E402

SAIDA = os.path.join(AQUI, "static", "subida_dados.js")
EN = {"Passes/90": "Passes per 90", "Passes certos, %": "Accurate passes, %", "Passes para a frente/90": "Forward passes per 90",
      "Passes para a frente certos, %": "Accurate forward passes, %", "Passes progressivos/90": "Progressive passes per 90",
      "Passes progressivos certos, %": "Accurate progressive passes, %", "Passes para terço final/90": "Passes to final third per 90",
      "Passes certos para terço final, %": "Accurate passes to final third, %", "Passes longos/90": "Long passes per 90",
      "Passes longos certos, %": "Accurate long passes, %", "Passes recebidos/90": "Received passes per 90",
      "Corridas progressivas/90": "Progressive runs per 90", "Golos/90": "Goals per 90", "Golos esperados/90": "xG per 90",
      "Remates/90": "Shots per 90", "Remates à baliza, %": "Shots on target, %", "Toques na área/90": "Touches in box per 90",
      "Golos de cabeça/90": "Head goals per 90", "Assistências/90": "Assists per 90", "Assistências esperadas/90": "xA per 90",
      "Passes chave/90": "Key passes per 90", "Passes para a área de penálti/90": "Passes to penalty area per 90",
      "Cruzamentos/90": "Crosses per 90", "Cruzamentos certos, %": "Accurate crosses, %", "Dribles/90": "Dribbles per 90",
      "Dribles com sucesso, %": "Successful dribbles, %", "Duelos ofensivos ganhos, %": "Offensive duels won, %",
      "Faltas sofridas/90": "Fouls suffered per 90", "Duelos/90": "Duels per 90", "Duelos ganhos, %": "Duels won, %",
      "Duelos defensivos/90": "Defensive duels per 90", "Duelos defensivos ganhos, %": "Defensive duels won, %",
      "Duelos aéreos/90": "Aerial duels per 90", "Duelos aéreos ganhos, %": "Aerial duels won, %",
      "Ações defensivas com êxito/90": "Successful defensive actions per 90", "Interceções ajust. à posse": "PAdj Interceptions",
      "Cortes de carrinho ajust. à posse": "PAdj Sliding tackles", "Remates intercetados/90": "Shots blocked per 90",
      "Faltas/90": "Fouls per 90", "Cartões amarelos/90": "Yellow cards per 90"}
# físico: coluna do estudo (SkillCorner) -> chave no dados/jogadores.json (mesmas unidades, r >= 0,91 na Série B 2026)
PORTAL = {"psv99": "psv", "sprint_count_p90": "spr_n", "expl_accel_sprint_p90": "expl", "hi_count_p90": "hi_n",
          "high_accel_p90": "acel", "distance_p90": "dist", "runs_p30tip": "obr", "runs_penalty_area_p30tip": "obr_area"}
# Volume de duelo e de ação defensiva: o Wyscout mudou o critério no período (duelos/90 caiu de ~18 para ~13),
# então a mediana 2022-25 de quem sobe não serve de mínimo para o dado de 2026. Aparecem na matriz, sem virar filtro.
SEM_MINIMO = {"Duelos/90", "Duelos defensivos/90", "Duelos aéreos/90", "Ações defensivas com êxito/90"}
BLOCOS = [("fis", "Físico", C.FISICO), ("pas", "Passe e construção", C.PASSE), ("atq", "Ataque e criação", C.ATAQUE), ("def", "Defesa e duelos", C.DEFESA)]


def n(v, casas):
    try:
        v = float(v)
    except (TypeError, ValueError):
        return None
    return None if math.isnan(v) or math.isinf(v) else round(v, casas)


def main():
    with open(os.path.join(AQUI, "static", "caracteristicas_dados.js"), encoding="utf-8") as fh:
        s = fh.read()
    car = json.loads(s[s.index("{"):s.rindex("}") + 1])
    inds = []
    for cat, tit, defs in BLOCOS:
        for rot, col, casas, menor in defs:
            inds.append({"k": len(inds), "rot": rot, "cat": cat, "bloco": tit, "casas": casas, "menor": menor, "col": col})
            if col in SEM_MINIMO:
                inds[-1]["nm"] = 1

    with open(os.path.join(AQUI, "dados", "jogadores.json"), encoding="utf-8") as fh:
        jd = {}
        for j in json.load(fh)["jogadores"]:
            jd.setdefault(chave(j["n"]) + "|" + chave(j["t"]), j)
    F = pd.read_csv(os.path.join(RES, "b1", "perfis", "jogadores.csv")); F = F[F.ano == F.ano.max()].copy()
    F["k"] = F.jogador.map(chave) + "|" + F.clube.map(chave); F = F.sort_values("minutos", ascending=False).drop_duplicates("k").set_index("k")

    fora = excluidos()
    sb = L.serie_b().copy(); sb["liga"] = "Brasil B"; sb["_sb"] = True
    sb["sul_americano"] = sb.nascido_em.isin(L.PAIS_SA) | sb.passaporte.fillna("").apply(lambda t: any(p in t for p in L.PAIS_SA))
    lg = L.ligas().copy(); lg["_sb"] = False
    lg = lg[lg.minutos >= 900]
    ligas, posicoes, tot, comfis = set(), {}, 0, 0
    for cod, nome in C.POS:
        if cod == "GOL":
            continue
        P = car["posicoes"][cod]
        ref = {}
        for b in P["blocos"]:
            for l in b["linhas"]:
                ref[(b["tit"], l["rot"])] = l
        refs = []
        for i in inds:
            l = ref.get((i["bloco"], i["rot"]))
            refs.append([l["sobe"], l["cai"], l["d"], 1 if l.get("media") else 0] if l else None)
        jog, visto = [], set()
        for D in (sb, lg):
            for _, r in D[D.pos11 == cod].iterrows():
                if fora(r.jogador, r.clube):
                    continue
                k = chave(r.jogador) + "|" + chave(r.clube)
                if (k, r.liga) in visto:
                    continue
                visto.add((k, r.liga))
                j = jd.get(k, {})
                f = F.loc[k] if (r._sb and k in F.index) else None
                vals, temfis = [], False
                for i in inds:
                    col = i["col"]
                    if i["cat"] == "fis":
                        v = f[col] if f is not None and col in f.index else None
                        if n(v, 3) is None:
                            v = j.get(PORTAL[col])
                        v = n(v, i["casas"] + 1)
                        temfis = temfis or (v is not None and col == "psv99")
                    else:
                        v = r.get(col) if col in r.index else None
                        if n(v, 3) is None:
                            v = r.get(EN[col]) if EN[col] in r.index else None
                        v = n(v, i["casas"] + 1)
                    vals.append(v)
                ct = j.get("ct") or (r.contrato if isinstance(r.contrato, str) else None)
                nasc = str(r.nascido_em or ""); psp = str(r.passaporte or "")
                nac = "BR" if (nasc == "Brazil" or "Brazil" in psp) else ("SA" if bool(r.sul_americano) else "")
                valor = n(j.get("mv"), 0) or n(r.valor, 0) or None
                jog.append([r.jogador, j.get("nc") or "", r.clube, r.liga, n(r.idade, 0), (ct or "")[:7],
                            None if valor is None else round(valor / 1e6, 2), int(r.minutos), nac,
                            1 if j.get("emp") else 0, j.get("id", -1)] + vals)
                ligas.add(r.liga); tot += 1; comfis += temfis
        posicoes[cod] = {"nome": nome, "n": P.get("n", {}), "ref": refs, "jog": jog}
        print(f"  {cod}: {len(jog)} jogadores")
    for i in inds:
        del i["col"]
    dados = {"gerado_em": datetime.date.today().isoformat(), "anos": car["anos"], "min": 900,
             "campos": ["nome", "nome_completo", "clube", "liga", "idade", "contrato", "valor_mi", "minutos", "nac", "emprestado", "id"],
             "ordem": [c for c, _ in C.POS if c != "GOL"], "inds": inds, "ligas": sorted(ligas), "posicoes": posicoes}
    with open(SAIDA, "w", encoding="utf-8") as fh:
        fh.write("/* GERADO POR gerar_subida_js.py - NAO EDITE A MAO. */\n")
        fh.write("window.SUBIDA = " + json.dumps(dados, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print(f"{tot} jogadores, {comfis} com físico · {os.path.getsize(SAIDA) / 1e6:.1f} MB · {SAIDA}")


if __name__ == "__main__":
    main()
