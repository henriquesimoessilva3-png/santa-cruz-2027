"""Bloco 15 — Sugestões pelo tipo físico de quem sobe.

Para cada setor, o tipo físico (Bloco 8) que mais aparece em quem SUBIU em relação a quem CAIU
(maior diferença Subiu − Caiu; um segundo tipo entra se a diferença dele for ≥ 10 pontos). Depois,
por posição, os jogadores desse tipo, ordenados pela nota do estudo (aderência ao modelo que rende +
nível do ranking), em três mercados: Série B 2026, ligas sul-americanas, e brasileiros/sul-americanos
no exterior em ligas mais fracas. Filtros: piso de 27 km/h, até 35 anos, sem vetados, valor ≤ € 2 MM.
Jogador de fora é classificado no tipo pelo centróide da Série B (mesmos indicadores, SkillCorner).
"""
import os, json
import numpy as np, pandas as pd
from _comum import *
from b8_fisico_tecnico import base, tipos, SETORES

OUT = os.path.join(RES, "b15"); os.makedirs(OUT, exist_ok=True)
CORE = ["psv99", "sprint_count_p90", "hi_count_p90", "expl_accel_sprint_p90", "distance_p90", "runs_p30tip"]
APP = {"psv": "psv99", "spr_n": "sprint_count_p90", "hi_n": "hi_count_p90", "expl": "expl_accel_sprint_p90",
       "dist": "distance_p90", "obr": "runs_p30tip", "obr_area": "runs_penalty_area_p30tip"}
SET = {"ZD": "Zaga", "ZE": "Zaga", "LD": "Lateral", "LE": "Lateral", "VOL": "Volante", "MED": "Meia", "MEI": "Meia",
       "ED": "Extremo", "EE": "Extremo", "CA": "Atacante"}
SUL = {"Argentina A", "Argentina B", "Uruguai", "Colombia A", "Colombia B", "Chile", "Paraguai", "Equador A", "Equador B",
       "Peru", "Bolivia", "Venezuela"}
FRACAS = {"Portugal B", "Portugal C", "Espanha C", "Italia C", "Bulgaria", "Romenia", "Polonia", "Eslovaquia", "Servia",
          "Hungria", "Croacia", "Grecia", "Israel", "Bahrain", "Emirados", "China", "Coreia B", "Japao B", "Turquia", "Catar"}
ORDEM = ["ZD", "ZE", "LD", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]


def preferidos(G):
    P = {}
    for s in SETORES:
        g = G[G.setor == s].assign(dif=lambda v: v.pct_sobe - v.pct_cai).sort_values("dif", ascending=False)
        P[s] = [g.iloc[0].tipo] + ([g.iloc[1].tipo] if g.iloc[1].dif >= 0.10 else [])
    return P


def main():
    d = base(); G, T = tipos(d)
    P = preferidos(G)
    # centróides em z (estatística do setor na Série B)
    est, cen = {}, {}
    for s in SETORES:
        a = T[T.setor == s]
        est[s] = (a[CORE].mean(), a[CORE].std())
        z = (a[CORE] - est[s][0]) / est[s][1]
        cen[s] = z.groupby(a.tipo).mean()
    fora = excluidos()

    # --- Série B 2026 (tipo já atribuído no Bloco 8) ---
    sb = pd.read_excel(os.path.join(RAIZ, "listas", "listas_2027.xlsx"), "base_serie_B_2026")
    sb["chave"] = sb.jogador.map(chave)
    t26 = T[T.ano == 2026][["chave", "clube", "pos11", "setor", "tipo"] + CORE]
    B = t26.merge(sb.drop(columns=["pos11"] + [c for c in CORE if c in sb]), on=["chave", "clube"], how="inner")
    B["mercado_l"] = "Série B"

    # --- fora: físico do app (SkillCorner do Portal), classificado pelo centróide ---
    J = json.load(open(os.path.join(os.path.dirname(RAIZ), "dados", "jogadores.json"), encoding="utf-8"))
    J = pd.DataFrame(J if isinstance(J, list) else J["jogadores"])
    J = J[J.p.isin(SET) & J.psv.notna() & (pd.to_numeric(J.sc_n, errors="coerce") >= 5) & J.fis_src.isna()] if "fis_src" in J else J
    J = J.rename(columns=APP)
    J["setor"] = J.p.map(SET)
    def classifica(r):
        s = r.setor; m, sd = est[s]
        z = ((r[CORE].astype(float) - m) / sd)
        ok = z.notna()
        dist = ((cen[s].loc[:, ok] - z[ok]) ** 2).sum(1)
        return dist.idxmin()
    J["tipo"] = J.apply(classifica, axis=1)
    J["chave"] = J.n.map(chave); J["kt"] = J.t.map(chave)
    bases = pd.concat([pd.read_csv(os.path.join(RAIZ, "listas", "base_sul_americanas.csv")),
                       pd.read_csv(os.path.join(RAIZ, "listas", "base_sulam_exterior.csv"))])
    bases["chave"] = bases.jogador.map(chave); bases["kt"] = bases.clube.map(chave)
    E = J[["chave", "kt", "p", "setor", "tipo", "mv", "runs_penalty_area_p30tip"] + CORE].merge(bases.drop(columns=["runs_penalty_area_p30tip"], errors="ignore"), on=["chave", "kt"], how="inner")
    E = E.rename(columns={"p": "pos_fis"})
    # valor: o do Wyscout, e quando ele vem 0/vazio, o do Transfermarkt que está no app (mv)
    v = pd.to_numeric(E.valor, errors="coerce").fillna(0); mv = pd.to_numeric(E.mv, errors="coerce").fillna(0)
    E["valor"] = np.where(v > 0, v, mv)
    E["mercado_l"] = np.where(E.liga.isin(SUL), "Sul-americanas", np.where(E.liga.isin(FRACAS), "Exterior (ligas mais fracas)", None))
    E = E[E.mercado_l.notna()]
    E["pos11"] = E.pos_fis

    A = pd.concat([B, E], ignore_index=True)
    A["livre_2027"] = A.livre_2027.astype(str) == "True"
    A = A.sort_values("nota", ascending=False).drop_duplicates(["chave", "clube"])
    # classificação de todos (Série B + fora) — alimenta a coluna "tipo físico" das listas e do Top 10
    A[["chave", "kt", "jogador", "clube", "liga", "pos11", "setor", "tipo", "psv99", "runs_penalty_area_p30tip"] + CORE].assign(
        tipo_pref=A.apply(lambda r: r.tipo in P.get(r.setor, []), axis=1)).to_csv(os.path.join(OUT, "tipos_todos.csv"), index=False)
    A["tipo_pref"] = A.apply(lambda r: r.tipo in P.get(r.setor, []), axis=1)
    A = A[(A.psv99 >= 27) & (A.idade <= 35)]
    A = A[[not fora(j, c) for j, c in zip(A.jogador, A.clube)]]
    A = A[~caro(A)]
    # tipo preferido primeiro; os demais tipos só completam a lista até 10, marcados
    A = A.sort_values(["tipo_pref", "nota"], ascending=[False, False])
    A[A.tipo_pref].to_csv(os.path.join(OUT, "sugestoes.csv"), index=False)

    f = lambda v, c=1: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")
    dt = lambda c: (str(c)[5:7] + "/" + str(c)[2:4]) if isinstance(c, str) and len(c) >= 7 else "—"
    NOMEP = {"ZD": "Zagueiro pela direita", "ZE": "Zagueiro pela esquerda", "LD": "Lateral direito", "LE": "Lateral esquerdo",
             "VOL": "Volante", "MED": "Médio", "MEI": "Meia", "ED": "Extremo pela direita", "EE": "Extremo pela esquerda", "CA": "Centroavante"}
    md = ["# Bloco 15 — Sugestões pelo tipo físico de quem sobe", "", "*Dado: Série B 2026 e ligas de fora (ago/26), físico do Portal · revisão 25/09/2026.*", "",
          "Para cada setor, o tipo físico (Bloco 8) que mais aparece nos times que **subiram** em relação aos que **caíram**; "
          "um segundo tipo entra quando a diferença dele também passa de 10 pontos. Os tipos são formados só pelo **físico** "
          "(velocidade, sprints, ações de alta intensidade, arrancadas, distância e corridas sem bola); o técnico entra na "
          "**ordem**: a nota do estudo = aderência ao modelo que rende na B + nível do ranking.",
          "", "Filtros: piso de 27 km/h, até 32 anos, sem os nomes vetados, valor ≤ € 2 MM, ≥ 900 min. Jogador de fora é "
          "encaixado no tipo pelo perfil médio de cada tipo na Série B (mesmos indicadores do SkillCorner); nas ligas "
          "sul-americanas a aderência já está convertida pela reta de liga (B11). (e) = contrato além de jun/27. "
          "**\\*** = não é do tipo preferido do setor: entra só para completar os 10 (ordem pela nota).", "",
          "| Setor | Tipo(s) de quem sobe | Subiu | Caiu |", "|---|---|---|---|"]
    for s in SETORES:
        for tp in P[s]:
            r = G[(G.setor == s) & (G.tipo == tp)].iloc[0]
            md.append(f"| {s} | **{tp}** | {f(100*r.pct_sobe,0)}% | {f(100*r.pct_cai,0)}% |")
    for pos in ORDEM:
        s = SET[pos]
        md.append(f"\n## {NOMEP[pos]} — {' ou '.join(P[s])}\n")
        for merc in ["Série B", "Sul-americanas", "Exterior (ligas mais fracas)"]:
            x = A[(A.pos11 == pos) & (A.mercado_l == merc)].head(10)
            x = x[x.tipo_pref | (x.tipo_pref.cumsum() < 10)]
            md.append(f"\n**{merc}**" + (" — nenhum jogador do tipo com dado" if x.empty else "") + "\n")
            if x.empty: continue
            cab = "| # | Jogador | Clube |" + (" Liga |" if merc != "Série B" else "") + " Idade | Contrato | Tipo | PSV-99 | Sprints/90 | Arrancadas/90 | Nota | Aderência | Nível |"
            md += [cab, "|" + "---|" * (cab.count("|") - 1)]
            for i, r in enumerate(x.itertuples(), 1):
                liga = f" {r.liga} |" if merc != "Série B" else ""
                ad = r.aderencia_ajustada if pd.notna(getattr(r, "aderencia_ajustada", np.nan)) else r.aderencia
                md.append(f"| {i} | **{r.jogador}**{'' if r.livre_2027 else ' (e)'} | {r.clube} |{liga} {int(r.idade)} | {dt(r.contrato)} | {r.tipo}{'' if r.tipo_pref else ' *'} | "
                          f"{f(r.psv99)} | {f(r.sprint_count_p90)} | {f(r.expl_accel_sprint_p90,2)} | **{f(r.nota,0)}** | {f(ad,0)} | {f(r.nivel_overall,0)} |")
    open(os.path.join(OUT, "B15.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    print(P); print(A.groupby(["pos11", "mercado_l"]).size().unstack())


if __name__ == "__main__":
    main()
