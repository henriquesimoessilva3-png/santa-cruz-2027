"""Decisão 2027 — treinador e elenco, juntando tudo o que o estudo mediu: nota técnica (aderência + nível), tipo
físico e piso de velocidade (B1/B8), bola parada (B3), gol de defesa (B7) e corrida para a área (B8), minutagem e
regularidade, patamar de Série A (B13), Sofascore 2026 (B14), scouts, mercado e contrato. Um documento só, gerado
de listas/IDEAL_2027.csv (a ordem) com as razões escritas critério a critério. Saída: listas/DECISAO_2027.md"""
import os, numpy as np, pandas as pd
from _comum import RAIZ, chave
LI = os.path.join(RAIZ, "listas"); RES = os.path.join(RAIZ, "resultados")
ORDEM = ["GOL", "LD", "ZD", "ZE", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]
NOMES = {"GOL": "Goleiro", "LD": "Lateral direito", "ZD": "Zagueiro pela direita", "ZE": "Zagueiro pela esquerda", "LE": "Lateral esquerdo", "VOL": "Volante (2)", "MED": "Médio", "MEI": "Meia", "ED": "Extremo pela direita", "EE": "Extremo pela esquerda", "CA": "Centroavante (2)"}
N_OP = {"VOL": 5, "CA": 4}

def tabela_treinadores():
    from b10_treinador_modelo import jogos
    from b12_treinador_sorte import xpts
    f = lambda v, c=2: "—" if pd.isna(v) else f"{v:+.{c}f}".replace(".", ",").replace("-", "−") if c == 2 and isinstance(v, float) and abs(v) < 5 else ("—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ","))
    g = lambda v, c=2: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")
    T = pd.read_csv(os.path.join(RES, "b4", "treinadores.csv"))
    X = pd.read_csv(os.path.join(RES, "b12", "treinadores_xpts.csv")).set_index("treinador")
    C = pd.read_csv(os.path.join(RES, "b10", "passagens_grandes_chances.csv")).groupby("treinador").bc_cedidas.mean()
    E = pd.read_csv(os.path.join(RES, "b10", "passagens_estilo.csv")).sort_values("jogos", ascending=False).drop_duplicates("treinador").set_index("treinador").sistema
    SIT = {"Léo Condé": "livre (saiu do Remo em 15/09)", "Thiago Carpini": "Remo (Série A)", "Eduardo Baptista": "Criciúma", "Guto Ferreira": "a confirmar", "Mozart": "Goiás", "Claudio Tencati": "Botafogo-SP", "Enderson Moreira": "Novorizontino", "Paulo Pezzolano": "a confirmar", "Jair Ventura": "a confirmar", "Adilson Batista": "a confirmar"}
    T = T[(T.passagens_com_valor >= 2) | (T.temporadas_inteiras >= 1)].sort_values("rendimento_medio", ascending=False).head(10)
    out = []
    for i, r in enumerate(T.itertuples(), 1):
        x = X.loc[r.treinador] if r.treinador in X.index else None
        leit = []
        if x is not None and x.sorte >= 0.2: leit.append("pontos acima do que o jogo sustenta")
        if x is not None and x.sorte <= -0.1: leit.append("jogo melhor que o placar")
        if r.rendimento_pior >= 0.2: leit.append("nunca rendeu abaixo do elenco")
        if r.posto_valor_medio <= 5: leit.append("elencos caros")
        if r.treinador in C.index and C[r.treinador] <= 1.25: leit.append("cede pouca chance clara")
        if r.treinador in C.index and C[r.treinador] >= 1.5: leit.append("cede muita chance clara")
        out.append(f"| {i} | **{r.treinador}** | {int(r.passagens)} ({int(r.clubes)}) | {int(r.jogos)} | {g(r.ppj)} | {f(r.rendimento_medio)} | {f(r.rendimento_pior)} | {int(r.clubes_com_rendimento_positivo)} | {int(round(r.posto_valor_medio))}º | {int(r.acessos)} | "
                   f"{g(x.xppj) if x is not None else '—'} | {f(x.sorte) if x is not None else '—'} | {g(C.get(r.treinador, np.nan))} | {E.get(r.treinador, '—')} | {'; '.join(leit) or '—'}; {SIT.get(r.treinador, 'a confirmar')} |")
    # Fábio Matias, pedido à parte (26/09): 17 jogos na B, abaixo do mínimo de 10 por passagem do B4
    gj = jogos(); gj["xpts"] = [xpts(a, b) for a, b in zip(gj.xg, gj.xg_sof)]
    t = pd.read_csv(os.path.join(RAIZ, "bases", "coletas", "T01_rodada_treinador.csv")); t["data"] = pd.to_datetime(t.data)
    m = t[t.treinador.str.contains("Matias", na=False)]
    linhas = []
    for (ano, clube), grp in m.groupby(["temporada", "clube_wyscout"]):
        x = gj[(gj.ano == ano) & (gj.clube == clube) & (gj.data.dt.date.isin(set(grp.data.dt.date)))]
        if len(x): linhas.append((ano, clube, len(x), x.pts.mean(), x.xpts.mean(), x.xg.mean(), x.xg_sof.mean()))
    if linhas:
        tot_j = sum(l[2] for l in linhas); ppj = sum(l[3] * l[2] for l in linhas) / tot_j; xp = sum(l[4] * l[2] for l in linhas) / tot_j
        det = "; ".join(f"{c} {a}: {n} jogos, {g(p)} pts/j, xPts {g(xx)}, xG {g(xg)} × {g(xs)} sofrido" for a, c, n, p, xx, xg, xs in linhas)
        out.append(f"| — | **Fábio Matias** (pedido) | {len(linhas)} ({len(linhas)}) | {tot_j} | {g(ppj)} | — | — | 0 | 2º | 0 | {g(xp)} | {f(ppj - xp)} | — | 4-4-2 / 4-2-3-1 | amostra curta, abaixo do mínimo do estudo (10 jogos por passagem); nas duas passagens ficou abaixo do que o elenco previa (Coritiba 2024 esperava 1,57, Atlético-GO 2025 esperava 1,54). {det} |")
    return out

def main():
    d = pd.read_csv(os.path.join(LI, "IDEAL_2027.csv"))
    pa = pd.read_csv(os.path.join(RES, "b13", "patamar_A_pool.csv")); pa["k"] = pa.jogador.map(chave) + "|" + pa.clube.map(chave); pa = pa[pa.liga == "Brasil B"].drop_duplicates("k").set_index("k")
    d["k"] = d.jogador.map(chave) + "|" + d.clube.map(chave); d["pat"] = d.k.map(pa.patamar_A)
    f = lambda v, c=0: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")
    dt = lambda c: (str(c)[8:10] + "/" + str(c)[5:7] + "/" + str(c)[2:4]) if isinstance(c, str) and len(c) >= 10 else "sem contrato"
    def razoes(r):
        ok, nao = [], []
        ok.append(f"nota {f(r.nota)} (aderência {f(r.aderencia_ajustada)}, nível {f(r.nivel_overall)})")
        if r.pos11 != "GOL":
            if pd.isna(r.psv): nao.append("sem rastreio físico")
            elif r.psv >= 27: ok.append(f"piso ok ({f(r.psv, 1)} km/h)")
            if isinstance(r.tipo, str): (ok if r.tipo_pref else nao).append(("tipo físico de quem sobe: " if r.tipo_pref else "tipo físico fora do de quem sobe: ") + r.tipo)
        if r.bp and r.bp >= 85: ok.append(f"especialista de bola parada ({f(r.bp)})")
        if r.gol_def: ok.append(f"gol de defesa (xG/90 {f(r.xg90, 2)})")
        if r.chega_area: ok.append(f"corre para a área ({f(r.area, 1)}/30 min)")
        if pd.notna(r.pat): ok.append(f"patamar de A {f(r.pat)}")
        if pd.notna(r.sofa_nota): ok.append(f"Sofascore {f(r.sofa_nota, 2)}")
        ok.append(f"{int(r.minutos)} min")
        if isinstance(r.scouts, str): ok.append("★ scouts: " + r.scouts)
        if r.mercado_l != "Série B": nao.append("de fora: vídeo obrigatório" + (" e vaga de estrangeiro" if r.mercado_l == "Sul-americanas" else ""))
        return "; ".join(ok) + ((" · **Atenção:** " + "; ".join(nao)) if nao else "")
    md = ["# Decisão 2027 — treinador e elenco", "",
          "*Gerado de `Os meus dez` (a ordem) com todos os critérios do estudo, 26/09/2026. Cada nome traz as razões, critério a critério: nota técnica (aderência ao modelo que rende na B + nível do ranking), piso de velocidade e tipo físico, bola parada, gol de defesa, corrida para a área, patamar de Série A, Sofascore 2026, minutagem, scouts, mercado e contrato.*", "",
          "## 1 · Treinador", "",
          "Os dez de melhor **rendimento acima do elenco** (pontos por jogo além do que o valor do elenco previa, 2022–2026, 2+ passagens ou 1 passagem inteira) com tudo o que os outros blocos medem de cada um: sorte (pontos − xPts), grandes chances cedidas por jogo (Sofascore), formação e situação. Depois, os pedidos à parte.", "",
          "| # | Treinador | Passagens (clubes) | Jogos | Pontos/j | Rend. médio | Pior | Clubes + | Elenco médio | Acessos | xPts/j | Sorte/j | G. chances cedidas/j | Formação | Leitura |", "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
    md += tabela_treinadores()
    md += ["",
          "**Ordem de preferência para o Santa Cruz:** 1. **Eduardo Baptista** — o modelo mais alinhado ao eixo (linha de 3, jogo direto, aéreo, intenso), o maior xPts entre os regulares, pior passagem +0,31, nunca trocou no meio do ano; no Criciúma, pede liberação. 2. **Léo Condé** — o único que rendeu acima do elenco em três clubes, 4-2-3-1, cede a menor quantidade de grandes chances (1,14/j); +0,21 de sorte por jogo e times que correm pouco; livre. 3. **Claudio Tencati** — elenco barato, jogo direto, sem sorte no placar; Botafogo-SP. 4. **Enderson Moreira** — o maior xPts da liga (1,62) com −0,18 de sorte: o jogo era melhor que o placar; Novorizontino. **Fora:** Guto Ferreira e Thiago Carpini (currículo de G4 com elencos top-5, +0,30 de sorte e 1,6–1,8 grandes chances cedidas), Mozart (posse com baixa intensidade, o oposto do elenco abaixo).", "",
          "**Regra que vale mais que o nome:** contratar para ficar o ano (0 trocas em quem sobe, 2 em quem cai — B5-1). Quem for escolhido define 2–3 peças: com Baptista, zaga e 9 fortes no alto e um volante *mais intenso*; com Condé, o elenco abaixo serve como está.", "",
          "## 2 · Elenco: titular e opções por posição", "",
          "Ordem de `Os meus dez` (nota + tipo físico + bola parada + gol de defesa + corrida para a área + scouts). (e) = contrato além de jun/27: empréstimo ou compra. **Regra de montagem (B5/B6/B14):** 28–30 nomes, 5 titulares mantidos de 2026, onze fixo (≥ 70% das titularidades nos 11), estrangeiros de meio para a frente com 1 ano e opção.", ""]
    for p in ORDEM:
        x = d[d.pos11 == p].head(N_OP.get(p, 3))
        md += [f"### {NOMES[p]}", "", "| # | Jogador | Clube · liga | Idade | Contrato | Pontos | Razões |", "|---|---|---|---|---|---|---|"]
        for r in x.itertuples():
            md.append(f"| {r.ordem} | **{r.jogador}**{'' if r.livre else ' (e)'} | {r.clube} · {r.liga} | {int(r.idade)} | {dt(r.contrato)} | **{f(r.score)}** | {razoes(r)} |")
        md.append("")
    md += ["## 3 · O que o dado não decide", "",
           "- Goleiro: a base não separa goleiro bom de defesa boa (B2-5) — vídeo.",
           "- Quem vem de fora: aderência convertida pela reta de liga (p90 na origem → 58 na B); só vídeo e minutagem confirmam.",
           "- Salário: o estudo não tem folha; as faixas são estimativa. Valor de mercado ≤ € 2 MM é o corte.",
           "- Os nomes que o clube já descartou estão em `Quem não contratar` (com os motivos) e em `EXCLUIDOS.csv`.", ""]
    open(os.path.join(LI, "DECISAO_2027.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    print("ok", len(d))

if __name__ == "__main__":
    main()
