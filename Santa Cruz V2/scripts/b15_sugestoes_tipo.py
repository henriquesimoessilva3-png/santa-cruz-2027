"""F2 — Sugestões pelo tipo físico de quem sobe.

Para cada setor, o tipo físico (F2) que mais aparece em quem SUBIU em relação a quem CAIU
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
    """Tipos de quem sobe, POR POSIÇÃO (28/09): diferença sobe − cai ≥ 10 pontos (tipos_preferidos_pos.csv, F2-4).
    Posição sem tipo que separe (ZD, MEI, ED) fica sem preferido: o físico não soma ponto ali."""
    T = pd.read_csv(os.path.join(RES, "b8", "tipos_preferidos_pos.csv"))
    return {r.pos11: ([t.strip() for t in r.preferidos.split("/")] if isinstance(r.preferidos, str) and r.preferidos else []) for r in T.itertuples()}


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

    # --- Série B 2026 (tipo já atribuído no F2) ---
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
        tipo_pref=A.apply(lambda r: r.tipo in P.get(r.pos11, []), axis=1)).to_csv(os.path.join(OUT, "tipos_todos.csv"), index=False)
    A["tipo_pref"] = A.apply(lambda r: r.tipo in P.get(r.pos11, []), axis=1)
    # mesma base e mesma pontuação de "Os meus dez" (POOL_2027.csv): filtros iguais, ordem igual
    PO = pd.read_csv(os.path.join(RAIZ, "listas", "POOL_2027.csv")).set_index("k")
    A["k"] = A.chave + "|" + A.kt
    A = A[A.k.isin(PO.index)]
    A["score"] = A.k.map(PO.score); A["ordem_geral"] = A.k.map(PO.ordem_geral)
    # tipo preferido primeiro; os demais tipos só completam a lista até 10, marcados
    A = A.sort_values(["tipo_pref", "score"], ascending=[False, False])
    A[A.tipo_pref].to_csv(os.path.join(OUT, "sugestoes.csv"), index=False)

    f = lambda v, c=1: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")
    dt = lambda c: (str(c)[5:7] + "/" + str(c)[2:4]) if isinstance(c, str) and len(c) >= 7 else "—"
    NOMEP = {"ZD": "Zagueiro pela direita", "ZE": "Zagueiro pela esquerda", "LD": "Lateral direito", "LE": "Lateral esquerdo",
             "VOL": "Volante", "MED": "Médio", "MEI": "Meia", "ED": "Extremo pela direita", "EE": "Extremo pela esquerda", "CA": "Centroavante"}
    md = ["# Os tipos de quem sobe: quem está neles", "", "*Dado: Série B 2026 e ligas de fora (ago/26), físico do Portal · revisão 25/09/2026.*", "",
          "Para cada **posição**, o tipo físico (F2) que mais aparece nos times que **subiram** em relação aos que **caíram** — entra quando a diferença passa de 10 pontos; "
          "posição em que nenhum tipo separa (ZD, MEI, ED) segue só pela nota. Os tipos são formados só pelo **físico** "
          "(velocidade, sprints, ações de alta intensidade, arrancadas, distância e corridas sem bola); o técnico entra na "
          "**ordem**: os pontos de `Os meus dez` (nota do estudo + bônus).",
          "", "Filtros e pontuação são os de `Os meus dez por posição` (≥ 900 min, até 35 anos, piso de 27 km/h, sem vetados, valor ≤ € 2 MM); **Geral** = lugar na ordem de `Os meus dez`. Jogador de fora é "
          "encaixado no tipo pelo perfil médio de cada tipo na Série B (mesmos indicadores do SkillCorner); nas ligas "
          "sul-americanas a aderência já está convertida pela reta de liga (T4). (e) = contrato além de jun/27. "
          "**\\*** = não é do tipo preferido da posição: entra só para completar os 10 (ordem pelos pontos).", "",
          "| Posição | Tipo(s) de quem sobe | Subiu | Caiu |", "|---|---|---|---|"]
    GP = pd.read_csv(os.path.join(RES, "b8", "tipos_fisicos_pos.csv"))
    for pos in ORDEM:
        if not P.get(pos): md.append(f"| {pos} | nenhum tipo separa — ordem só pela nota | — | — |"); continue
        for tp in P[pos]:
            r = GP[(GP.pos11 == pos) & (GP.tipo == tp)].iloc[0]
            md.append(f"| {pos} | **{tp}** | {f(100*r.pct_sobe,0)}% | {f(100*r.pct_cai,0)}% |")
    for pos in ORDEM:
        md.append(f"\n## {NOMEP[pos]} — {' ou '.join(P[pos]) if P.get(pos) else 'nenhum tipo separa (ordem pela nota)'}\n")
        for merc in ["Série B", "Sul-americanas", "Exterior (ligas mais fracas)"]:
            x = A[(A.pos11 == pos) & (A.mercado_l == merc)].head(10)
            x = x[x.tipo_pref | (x.tipo_pref.cumsum() < 10)]
            md.append(f"\n**{merc}**" + (" — nenhum jogador do tipo com dado" if x.empty else "") + "\n")
            if x.empty: continue
            cab = "| # | Geral | Jogador | Clube |" + (" Liga |" if merc != "Série B" else "") + " Idade | Contrato | Tipo | PSV-99 | Sprints/90 | Arrancadas/90 | Pontos | Nota | Aderência | Nível |"
            md += [cab, "|" + "---|" * (cab.count("|") - 1)]
            for i, r in enumerate(x.itertuples(), 1):
                liga = f" {r.liga} |" if merc != "Série B" else ""
                ad = r.aderencia_ajustada if pd.notna(getattr(r, "aderencia_ajustada", np.nan)) else r.aderencia
                md.append(f"| {i} | {int(r.ordem_geral)}º | **{r.jogador}**{'' if r.livre_2027 else ' (e)'} | {r.clube} |{liga} {int(r.idade)} | {dt(r.contrato)} | {r.tipo}{'' if r.tipo_pref else ' *'} | "
                          f"{f(r.psv99)} | {f(r.sprint_count_p90)} | {f(r.expl_accel_sprint_p90,2)} | **{f(r.score,0)}** | {f(r.nota,0)} | {f(ad,0)} | {f(r.nivel_overall,0)} |")
    open(os.path.join(OUT, "B15.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    print(P); print(A.groupby(["pos11", "mercado_l"]).size().unstack())


if __name__ == "__main__":
    main()
