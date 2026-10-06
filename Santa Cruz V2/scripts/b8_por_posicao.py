"""F2, por posição (28/09): os três tipos físicos continuam definidos no setor (zaga, lateral, volante, meia,
extremo, atacante — é onde há jogadores para formar tipos), mas a leitura passa a ser nas dez posições do
campograma: quanto cada tipo pesa em quem subiu / meio / caiu em cada lado, e onde está concentrado.
Escreve resultados/b8/tipos_fisicos_pos.csv e reescreve os itens 4 e 6 do B8.md."""
import os, numpy as np, pandas as pd
from _comum import RAIZ
RES = os.path.join(RAIZ, "resultados"); OUT = os.path.join(RES, "b8")
ORDEM = ["LD", "ZD", "ZE", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]
NOMES = {"LD": "Lateral direito", "ZD": "Zagueiro pela direita", "ZE": "Zagueiro pela esquerda", "LE": "Lateral esquerdo", "VOL": "Volante", "MED": "Médio", "MEI": "Meia", "ED": "Extremo pela direita", "EE": "Extremo pela esquerda", "CA": "Centroavante"}
SET = {"ZD": "Zaga", "ZE": "Zaga", "LD": "Lateral", "LE": "Lateral", "VOL": "Volante", "MED": "Meia", "MEI": "Meia", "ED": "Extremo", "EE": "Extremo", "CA": "Atacante"}
FIS = {"psv99": ("PSV-99", 1), "sprint_count_p90": ("Sprints/90", 1), "expl_accel_sprint_p90": ("Arrancadas/90", 2), "runs_p30tip": ("Corridas s/ bola", 1)}
TEC = {"Duelos/90": ("Duelos/90", 1), "Duelos aéreos ganhos, %": ("Aéreos %", 0), "Toques na área/90": ("Toques área/90", 2), "xgxa90": ("xG+xA/90", 2)}

def main():
    j = pd.read_csv(os.path.join(OUT, "jogadores_tipo.csv")); ct = pd.read_csv(os.path.join(RES, "b5", "clube_temporada.csv"))[["ano", "clube", "faixa"]]
    j = j[(j.ano <= 2025) & (j.minutos >= 900)].merge(ct, on=["ano", "clube"])
    rows = []
    for p in ORDEM:
        x = j[j.pos11 == p]; ntot = x.groupby("faixa").size()
        for t, g in x.groupby("tipo"):
            nf = g.groupby("faixa").size()
            r = dict(pos11=p, setor=SET[p], tipo=t, n=len(g), n_sobe=int(ntot.get("Sobe", 0)), n_meio=int(ntot.get("Meio", 0)), n_cai=int(ntot.get("Cai", 0)),
                     pct_sobe=nf.get("Sobe", 0) / max(1, ntot.get("Sobe", 0)), pct_meio=nf.get("Meio", 0) / max(1, ntot.get("Meio", 0)), pct_cai=nf.get("Cai", 0) / max(1, ntot.get("Cai", 0)),
                     conc_sobe=nf.get("Sobe", 0) / len(g) / 0.2, conc_cai=nf.get("Cai", 0) / len(g) / 0.2)
            r["dif"] = r["pct_sobe"] - r["pct_cai"]
            for c in list(FIS) + list(TEC): r[c] = g[c].median()
            rows.append(r)
    G = pd.DataFrame(rows).round(3); G.to_csv(os.path.join(OUT, "tipos_fisicos_pos.csv"), index=False)
    # tipos preferidos e de quem cai, por posição (diferença sobe − cai; ≥ 10 pontos entra, ≤ −15 é "de quem cai")
    pref = {p: G[(G.pos11 == p) & (G.dif >= 0.10)].sort_values("dif", ascending=False).tipo.tolist() for p in ORDEM}
    cai = {p: G[(G.pos11 == p) & (G.dif <= -0.15)].sort_values("dif").tipo.tolist() for p in ORDEM}
    # preferência do clube (listas/PREFERENCIAS_CLUBE.csv): entra como tipo A onde o dado não separa — decisão de modelo, não achado
    pc = os.path.join(RAIZ, "listas", "PREFERENCIAS_CLUBE.csv"); clube = {}
    if os.path.exists(pc):
        for r in pd.read_csv(pc).itertuples():
            if int(getattr(r, "substitui", 0) or 0): pref[r.pos11] = [r.tipo]      # o clube TROCA o tipo A (ZE, 06/10/26): o do dado vira B
            elif r.tipo not in pref[r.pos11]: pref[r.pos11] = pref[r.pos11] + [r.tipo]
            if r.tipo in cai[r.pos11]: cai[r.pos11].remove(r.tipo)
            if isinstance(getattr(r, "cai", None), str) and r.cai.strip(): cai[r.pos11] = [r.cai.strip()]   # o clube também fixa o tipo C (regra única, 06/10/26)
            clube[r.pos11] = r.tipo
    pd.DataFrame([dict(pos11=p, preferidos=" / ".join(pref[p]), de_quem_cai=" / ".join(cai[p])) for p in ORDEM]).to_csv(os.path.join(OUT, "tipos_preferidos_pos.csv"), index=False)
    f = lambda v, c=0: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")
    # ---- item 4 ----
    md = ["### 4. Tipos físicos por posição: qual tipo cada faixa da tabela usa", "",
          "Três tipos por **setor** (zaga, lateral, volante, meia, extremo, atacante), formados pelo próprio perfil físico dos jogadores com ≥ 900 min (2022–2025) — é no setor que há jogadores suficientes para formar tipos. A leitura, porém, é nas **dez posições do campograma**: o lateral direito e o esquerdo, o zagueiro de cada lado, o extremo de cada lado, o médio e o meia. "
          "As colunas Subiu / Meio / Caiu dizem, **de cada 100 jogadores da posição naquela faixa, quantos são de cada tipo** (cada coluna soma 100%). **Sobe − Cai** é a diferença que importa; **Concentra ×** lê a linha (de todos os jogadores do tipo na posição, a fatia em quem subiu dividida pelo esperado, 20%). "
          "Amostra: 14 a 32 jogadores por posição em cada faixa — diferença abaixo de ~15 pontos é ruído.", ""]
    for p in ORDEM:
        x = G[G.pos11 == p].sort_values("pct_sobe", ascending=False); r0 = x.iloc[0]
        md += [f"**{NOMES[p]}** ({SET[p]}) — {r0.n_sobe} nos times que subiram, {r0.n_meio} no meio, {r0.n_cai} nos que caíram" + (f" · **tipo de quem sobe: {' / '.join(pref[p])}**" + (" *(preferência do clube — o dado não separa)*" if p in clube else "") if pref[p] else " · **nenhum tipo separa: aqui decide o técnico**"), "",
               "| Tipo | Subiu | Meio | Caiu | Sobe − Cai | Concentra × | " + " | ".join(v[0] for v in FIS.values()) + " | " + " | ".join(v[0] for v in TEC.values()) + " |",
               "|---|" + "---|" * (5 + len(FIS) + len(TEC))]
        for _, r in x.iterrows():
            d = 100 * r.dif; dtxt = (f"**{d:+.0f}**" if abs(d) >= 15 else f"{d:+.0f}").replace("-", "−")
            md.append(f"| **{r.tipo}** | **{f(100*r.pct_sobe)}%** | {f(100*r.pct_meio)}% | {f(100*r.pct_cai)}% | {dtxt} | {f(r.conc_sobe, 1)} | " + " | ".join(f(r[c], v[1]) for c, v in FIS.items()) + " | " + " | ".join(f(r[c], v[1]) for c, v in TEC.items()) + " |")
        md.append("")
    md += ["Leitura, posição a posição:", ""]
    L = {"LD": "o lado direito é o mais físico da B: **76%** dos LD de quem subiu são explosivos (46% em quem caiu); o LD \"médio em tudo\" é de quem cai (8% × 38%).",
         "LE": "no esquerdo o sinal é menor mas na mesma direção: explosivo 45% × 24%; o LE de **baixa intensidade** é de quem cai (27% × 48%).",
         "ZD": "**nada separa fisicamente** o zagueiro pela direita (baixa intensidade 54% × 55%): é a posição em que o tipo físico não decide — o T1 diz que o ZD dos times que rendem cria (passes chave, longos).",
         "ZE": "o zagueiro pela esquerda é o contrário: **motor de volume 68% × 32%**, e baixa intensidade 21% × 52%. Fecha com o T1 e o T2 (o ZE que finaliza e sai jogando).",
         "VOL": "o volante **menos intenso** é o tipo de quem cai (12% × 48%); intermediário e mais intenso dividem quem sobe.",
         "MED": "o médio \"médio em tudo\" pesa mais em quem sobe (57% × 46%); baixa intensidade é de quem cai (21% × 32%). Sinal moderado.",
         "MEI": "o meia não separa por físico (médio em tudo 50% × 50%); amostra pequena (14 e 10). Decide o técnico e a bola parada.",
         "ED": "o extremo pela direita **não separa por físico** (baixa intensidade 44% × 40%); o T1 diz que o ED que rende é o que defende e cria.",
         "EE": "o extremo pela esquerda é o oposto: **explosivo 47% × 14%**, e motor de volume é de quem cai (16% × 43%). É onde o físico mais pesa entre os extremos — e é o lado que decide (T1).",
         "CA": "centroavante motor de volume 36% × 19%; baixa intensidade é de quem cai (29% × 44%)."}
    md += [f"- **{p}** — {L[p]}" for p in ORDEM] + [""]
    md += ["O que muda em relação à leitura por setor: **lateral** e **extremo** têm um lado onde o físico separa muito (LD, EE) e um lado onde separa pouco ou nada (LE, ED); na **zaga**, o motor de volume é traço do ZE, não do ZD. Por isso as listas passam a usar o tipo preferido **por posição** (`tipos_preferidos_pos.csv`), e nas posições em que nenhum tipo separa (ZD, MEI, ED) o físico não soma ponto — só o piso de velocidade vale.", ""]
    # ---- item 6 ----
    md6 = ["### 6. Onde estão os jogadores de cada tipo: concentração nos times que sobem, por posição", "",
           "Leitura por **linha**: de todos os jogadores de um tipo na posição (2022–2025, ≥ 900 min), que fatia estava nos 16 times que subiram e nos 16 que caíram, dividida pelo esperado (20% cada). 1,8 = 80% acima do esperado; 0,3 = quem sobe evita o tipo.", "",
           "| Posição | Tipo | Jogadores | Em quem subiu | × esperado | Em quem caiu | × esperado |", "|---|---|---|---|---|---|---|"]
    for p in ORDEM:
        for r in G[G.pos11 == p].sort_values("conc_sobe", ascending=False).itertuples():
            cs = f"**{f(r.conc_sobe,1)}**" if r.conc_sobe >= 1.3 or r.conc_sobe <= 0.7 else f(r.conc_sobe, 1)
            md6.append(f"| {p} | {r.tipo} | {int(r.n)} | {int(round(r.conc_sobe*0.2*r.n))} ({f(100*r.conc_sobe*0.2)}%) | {cs} | {int(round(r.conc_cai*0.2*r.n))} ({f(100*r.conc_cai*0.2)}%) | {f(r.conc_cai,1)} |")
    md6 += ["", "**Os concentrados em quem sobe:** LD explosivo (1,8×), VOL mais intenso (1,4×), CA motor de volume (1,4×), EE explosivo (1,4×), MEI médio em tudo (1,4×), VOL intermediário (1,4×), LE explosivo (1,3×). **Os que quem sobe evita:** LD médio em tudo (0,3×), VOL menos intenso (0,4×), ZE baixa intensidade (0,4×), ED explosivo (0,5×) e EE motor de volume (0,5×).", "",
           "Por ano, entre os laterais titulares de quem subiu, os explosivos foram: 2022, 8 de 11; 2023, 6 de 13; 2024, 10 de 11; 2025, 5 de 12. Os times com mais laterais explosivos: Bahia 2022, Ceará e Santos 2024, Athletico-PR 2025 (3 cada, todos subiram). Os nomes de cada tipo, por posição, estão na janela do tipo (clique no nome do tipo nas tabelas)."]
    s = open(os.path.join(OUT, "B8.md"), encoding="utf-8").read()
    i4 = s.index("### 4."); i5 = s.index("### 5."); s = s[:i4] + "\n".join(md) + "\n" + s[i5:]
    i6 = s.index("### 6."); ir = s.index("## Ressalvas"); s = s[:i6] + "\n".join(md6) + "\n\n" + s[ir:]
    open(os.path.join(OUT, "B8.md"), "w", encoding="utf-8").write(s)
    print(pref); print(cai)

if __name__ == "__main__":
    main()
