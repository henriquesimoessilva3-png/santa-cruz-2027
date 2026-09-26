"""Bloco 13 — Patamar de Série A: físico e técnico por posição, Série B × Série A × cinco grandes ligas
× Argentina A. Onde a B está abaixo, quanto, e quem (nos três mercados) já joga no patamar da A.
Físico: SkillCorner do Portal (temporada atual, dados/jogadores.json). Técnico: Wyscout ago/26, os
indicadores da ficha de cada posição (listas.FICHA). Percentil "de A" = posição do jogador dentro da
distribuição da Série A na mesma posição. Saídas: resultados/b13/*.csv, B13.md"""
import os, json, numpy as np, pandas as pd
from _comum import RAIZ, chave, excluidos, caro
import listas as L
from top10 import FRACAS
OUT = os.path.join(RAIZ, "resultados", "b13"); os.makedirs(OUT, exist_ok=True)
BIG5 = {"Inglaterra A", "Espanha A", "Italia A", "Alemanha A", "França A"}
GRUPO = lambda l: "Série B" if l in ("Brasil B", "Série B") else ("Série A" if l == "Brasil A" else ("5 grandes" if l in BIG5 else ("Argentina A" if l == "Argentina A" else None)))
FIS = {"psv": "PSV-99 (km/h)", "spr_n": "Sprints/90", "hi_n": "Alta intensidade/90", "expl": "Arrancadas/90", "dist": "Distância/90 (m)", "hsr_n": "Corridas HSR/90"}
ORDEM = ["GOL", "LD", "ZD", "ZE", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]
f = lambda v, c=1: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")

def fisico():
    J = json.load(open(os.path.join(os.path.dirname(RAIZ), "dados", "jogadores.json"), encoding="utf-8"))
    J = pd.DataFrame(J if isinstance(J, list) else J["jogadores"])
    J = J[J.psv.notna() & (pd.to_numeric(J.sc_n, errors="coerce") >= 5) & (pd.to_numeric(J["min"], errors="coerce") >= 600) & (J.p != "GOL")].copy()
    J["grupo"] = J.l.map(GRUPO); J["chave"] = J.n.map(chave); J["kt"] = J.t.map(chave)
    return J

def main():
    J = fisico(); G = J[J.grupo.notna()]
    # 1. faixas físicas por grupo × posição
    med = G.groupby(["p", "grupo"])[list(FIS)].median().round(2); med.to_csv(os.path.join(OUT, "fisico_faixas.csv"))
    n = G.groupby(["p", "grupo"]).size()
    # 2. técnico: Série B 2026 + ligas
    sb = L.serie_b(); sb["liga"] = "Brasil B"; lg = L.ligas()
    T = pd.concat([sb, lg], ignore_index=True); T["grupo"] = T.liga.map(GRUPO)
    T = T[(T.minutos >= 900) & (T.pos11 != "Outro")]
    IND = sorted({en for v in L.FICHA.values() for en, _ in v})
    for c in IND: T[c] = pd.to_numeric(T[c], errors="coerce")
    TG = T[T.grupo.notna()]
    tmed = TG.groupby(["pos11", "grupo"])[IND].median().round(2); tmed.to_csv(os.path.join(OUT, "tecnico_faixas.csv"))
    # 3. percentil "de A": cada jogador contra a distribuição da Série A da posição
    A_f = G[G.grupo == "Série A"]; A_t = TG[TG.grupo == "Série A"]
    def pct_vs(ref, x):
        return np.nan if pd.isna(x) or len(ref) < 10 else float((ref < x).mean() * 100)
    for c in FIS:
        J[c + "_pA"] = [pct_vs(A_f[A_f.p == p][c].dropna(), v) for p, v in zip(J.p, J[c])]
    J["fis_A"] = J[[c + "_pA" for c in ["psv", "spr_n", "hi_n", "expl"]]].mean(axis=1).round(0)
    def ader_A(r):
        fi = L.FICHA.get(r.pos11, []); vals = []
        for en, w in fi:
            ref = A_t[A_t.pos11 == r.pos11][en].dropna()
            v = r.get(en)
            if pd.notna(v) and len(ref) >= 10: vals.append((pct_vs(ref, v), w))
        return round(sum(v * w for v, w in vals) / sum(w for _, w in vals), 0) if vals else np.nan
    T["tec_A"] = [ader_A(r) for _, r in T.iterrows()]
    # 4. o pool dos três mercados (mesmos filtros de "Os meus dez")
    fora = excluidos()
    P = T[(T.liga == "Brasil B") | (T.mercado == "Sul-americano") | ((T.mercado == "Exterior") & T.liga.isin(FRACAS) & T.sul_americano.fillna(False).astype(bool))].copy()
    P = P[((P.idade <= 35) | ((P.pos11 == "GOL") & (P.idade <= 37)))]
    P = P[[not fora(j, c) for j, c in zip(P.jogador, P.clube)]]; P = P[~caro(P)]
    P["k"] = P.jogador.map(chave) + "|" + P.clube.map(chave); J["k"] = J.chave + "|" + J.kt
    P = P.merge(J[["k", "fis_A", "psv"] + [c + "_pA" for c in FIS]].drop_duplicates("k"), on="k", how="left")
    # Série B: quando o nome do clube difere entre as fontes, casa só pelo nome do jogador dentro da B
    JB = J[J.l == "Brasil B"].drop_duplicates("chave").set_index("chave")
    m = (P.liga == "Brasil B") & P.fis_A.isna()
    for c in ["fis_A", "psv"] + [x + "_pA" for x in FIS]:
        P.loc[m, c] = P.loc[m, "jogador"].map(chave).map(JB[c])
    P["patamar_A"] = P[["tec_A", "fis_A"]].mean(axis=1).round(0)
    P = P[P.psv.isna() | (P.psv >= 27) | (P.pos11 == "GOL")]
    P["livre"] = P.livre_2027.astype(str) == "True" if "livre_2027" in P else (pd.to_datetime(P.contrato, errors="coerce").isna() | (pd.to_datetime(P.contrato, errors="coerce") <= "2027-06-30"))
    P.sort_values("patamar_A", ascending=False)[["pos11", "jogador", "clube", "liga", "mercado", "idade", "minutos", "contrato", "livre", "tec_A", "fis_A", "patamar_A", "psv", "aderencia"]].to_csv(os.path.join(OUT, "patamar_A_pool.csv"), index=False)
    # --- B13.md ---
    md = ["# Bloco 13 — Patamar de Série A: físico e técnico por posição", "",
          "*Dado: SkillCorner do Portal (temporada atual, ≥ 600 min, ≥ 5 jogos rastreados) e Wyscout ago/26 (≥ 900 min) · 25/09/2026.*", "",
          "Pergunta: o que é \"jogar no patamar da Série A\" em número, posição a posição — e quem, na Série B, nas ligas sul-americanas e no exterior alcançável, já joga nele. "
          "Ressalva do B1: na B, correr mais não rende ponto; o físico é piso e traço de posição. Este bloco serve para **calibrar a régua** e para **achar nomes**, não para virar meta de volume.", "",
          "## 1 · Físico: mediana por posição e grupo", ""]
    grupos = ["Série B", "Série A", "5 grandes", "Argentina A"]
    for c, nome in FIS.items():
        md += [f"**{nome}**", "", "| Pos | " + " | ".join(grupos) + " | B vs A |", "|---|" + "---|" * (len(grupos) + 1)]
        for p in ORDEM:
            if p == "GOL": continue
            vals = [med[c].get((p, g), np.nan) for g in grupos]
            gap = (vals[0] / vals[1] - 1) * 100 if pd.notna(vals[0]) and pd.notna(vals[1]) and vals[1] else np.nan
            md.append(f"| {p} | " + " | ".join(f(v, 1 if c != 'dist' else 0) for v in vals) + f" | {'+' if gap >= 0 else ''}{f(gap, 0)}% |")
        md.append("")
    nb = n.unstack().reindex(ORDEM).fillna(0).astype(int)
    md += ["Jogadores por grupo (posição × grupo):", "", "| Pos | " + " | ".join(grupos) + " |", "|---|" + "---|" * len(grupos)]
    for p in ORDEM:
        if p == "GOL": continue
        md.append(f"| {p} | " + " | ".join(str(nb.loc[p].get(g, 0)) for g in grupos) + " |")
    # leitura física automática
    gaps = {}
    for c in ["psv", "spr_n", "hi_n", "expl"]:
        for ref in ["Série A", "5 grandes", "Argentina A"]:
            g = []
            for p in ORDEM[1:]:
                a, b = med[c].get((p, "Série B"), np.nan), med[c].get((p, ref), np.nan)
                if pd.notna(a) and pd.notna(b) and b: g.append((a / b - 1) * 100)
            gaps[(c, ref)] = np.mean(g)
    pc = lambda c, ref: f"{gaps[(c, ref)]:+.0f}%"
    md += ["", "**Leitura.** Diferença mediana da Série B para cada grupo, nas posições de linha:", "",
           "| Série B contra… | PSV-99 | Sprints | Alta intensidade | Arrancadas |", "|---|---|---|---|---|",
           f"| Série A | {pc('psv','Série A')} | {pc('spr_n','Série A')} | {pc('hi_n','Série A')} | {pc('expl','Série A')} |",
           f"| 5 grandes ligas | {pc('psv','5 grandes')} | {pc('spr_n','5 grandes')} | {pc('hi_n','5 grandes')} | {pc('expl','5 grandes')} |",
           f"| Argentina A | {pc('psv','Argentina A')} | {pc('spr_n','Argentina A')} | {pc('hi_n','Argentina A')} | {pc('expl','Argentina A')} |", "",
           "**Fisicamente, a Série B já é a Série A**: mesma velocidade de pico, mesma repetição de sprints e de alta intensidade, arrancadas um pouco abaixo (zagueiros). A diferença de patamar físico está nas cinco grandes ligas (+15–20% de sprints e alta intensidade), e a Argentina A corre menos que a B. "
           "Conclusão que fecha com o B1: **o que separa a A da B não é físico, é técnico** (seção 2). Um \"time de A na B\" se monta pela qualidade da chance criada e cedida, com o físico como piso.", "",
           "## 2 · Técnico: a ficha de cada posição, mediana por grupo", ""]
    for p in ORDEM:
        fi = L.FICHA.get(p, [])
        if not fi: continue
        md += [f"**{p}**", "", "| Indicador | " + " | ".join(grupos) + " | B vs A |", "|---|" + "---|" * (len(grupos) + 1)]
        for en, w in fi:
            vals = [tmed[en].get((p, g), np.nan) for g in grupos]
            gap = (vals[0] / vals[1] - 1) * 100 if pd.notna(vals[0]) and pd.notna(vals[1]) and vals[1] else np.nan
            md.append(f"| {en} | " + " | ".join(f(v, 2) for v in vals) + f" | {'+' if gap >= 0 else ''}{f(gap, 0)}% |")
        md.append("")
    md += ["## 3 · Quem, na Série B 2026, já joga no patamar da A", "",
           "**tec A** = percentil do jogador dentro da Série A na ficha da posição (50 = mediana da A); **fís A** = idem no físico (PSV, sprints, alta intensidade, arrancadas); **patamar** = média dos dois. "
           "Só Série B: o número cru de outra liga não é comparável ao da A sem a conversão do B11 (um atacante da Argentina B apareceria acima de todos). Mesmos filtros de \"Os meus dez\" (≥ 900 min, ≤ 35 anos, piso 27 km/h, sem vetados, ≤ € 2 MM). Sem físico rastreado, o patamar é só o técnico. (e) = contrato além de jun/27.", ""]
    for p in ORDEM:
        x = P[(P.pos11 == p) & (P.liga == "Brasil B") & P.patamar_A.notna()].sort_values(["patamar_A", "tec_A"], ascending=False).head(10)
        if x.empty: continue
        md += [f"### {p}", "", "| # | Jogador | Clube | Liga | Idade | Contrato | tec A | fís A | Patamar | PSV |", "|---|---|---|---|---|---|---|---|---|---|"]
        for i, r in enumerate(x.itertuples(), 1):
            ct = (str(r.contrato)[8:10] + "/" + str(r.contrato)[5:7] + "/" + str(r.contrato)[2:4]) if isinstance(r.contrato, str) and len(str(r.contrato)) >= 10 else "—"
            md.append(f"| {i} | **{r.jogador}**{'' if r.livre else ' (e)'} | {r.clube} | {'Série B' if r.liga == 'Brasil B' else r.liga} | {int(r.idade)} | {ct} | {f(r.tec_A, 0)} | {f(r.fis_A, 0)} | **{f(r.patamar_A, 0)}** | {f(r.psv, 1)} |")
        md.append("")
    # quantos da B estão acima da mediana da A
    q = P[P.liga == "Brasil B"].groupby("pos11").apply(lambda x: pd.Series({"n": len(x), "tec≥50": int((x.tec_A >= 50).sum()), "fís≥50": int((x.fis_A >= 50).sum()), "ambos": int(((x.tec_A >= 50) & (x.fis_A >= 50)).sum())})).reindex(ORDEM).dropna()
    md += ["## 4 · Quantos jogadores da Série B 2026 já estão acima da mediana da A", "", "| Pos | n | técnico ≥ 50 | físico ≥ 50 | os dois |", "|---|---|---|---|---|"]
    for p, r in q.iterrows(): md.append(f"| {p} | {int(r.n)} | {int(r['tec≥50'])} | {int(r['fís≥50'])} | **{int(r.ambos)}** |")
    # os nomes: quem está acima da mediana da A nas duas coisas, por posição
    ideal = pd.read_csv(os.path.join(RAIZ, "listas", "IDEAL_2027.csv")); ideal["k"] = ideal.jogador.map(chave) + "|" + ideal.clube.map(chave)
    nos10 = set(ideal.k)
    md += ["", "Os nomes, por posição (ordem pelo patamar; **✓ dez** = também está em \"Os meus dez\"; (e) = contrato além de jun/27):", ""]
    amb = P[(P.liga == "Brasil B") & (P.tec_A >= 50) & (P.fis_A >= 50)].sort_values("patamar_A", ascending=False)
    for p in ORDEM:
        x = amb[amb.pos11 == p]
        if x.empty: continue
        md.append(f"- **{p}** ({len(x)}): " + "; ".join(f"{r.jogador}{'' if r.livre else ' (e)'} ({r.clube}, {int(r.idade)}, tec {r.tec_A:.0f}/fís {r.fis_A:.0f}){' ✓ dez' if r.k in nos10 else ''}" for r in x.itertuples()))
    amb[["pos11", "jogador", "clube", "idade", "contrato", "livre", "tec_A", "fis_A", "patamar_A", "psv"]].to_csv(os.path.join(OUT, "patamar_A_serie_b.csv"), index=False)
    md += ["", "## 5 · O que entra na montagem", "",
           "- A régua física do onze passa a ter dois níveis: **piso da B** (27 km/h, B1-2) e **patamar da A** (mediana da Série A por posição em sprints, alta intensidade e arrancadas) — o segundo como alvo para 6–7 titulares de linha, não para todos.",
           "- O técnico é onde a diferença de divisão está: o \"time de A na B\" é o que cria e cede chance como a A (B2-1), e os nomes da seção 3 são os que já produzem nesse nível na ficha da posição.",
           "- Cruzar com `Os meus dez`: quem aparece nas duas listas é alvo prioritário; quem está só aqui é aposta de patamar sem a aderência ao que rende na B.",
           "- Em aberto: físico das ligas de fora cobre parte dos nomes; times da Série A (xG, distância do remate) precisam do export de equipes."]
    open(os.path.join(OUT, "B13.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    print(nb); print(gaps); print(q)

if __name__ == "__main__":
    main()
