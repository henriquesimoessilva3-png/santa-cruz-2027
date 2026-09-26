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
          "| Ordem | Nome | Por quê (B4, B10, B12, B14) | Custo |", "|---|---|---|---|",
          "| 1 | **Eduardo Baptista** | o modelo mais alinhado ao eixo (linha de 3, jogo direto, aéreo, intenso); o maior xPts por jogo entre os nomes em foco (1,59: rende pelo jogo, não pela sorte); cede 1,22 grande chance por jogo; pior passagem +0,31 acima do elenco; nunca trocou no meio do ano | no Criciúma: liberação |",
          "| 2 | **Léo Condé** | rendeu acima do elenco em três clubes (o único), 4-2-3-1, adapta o estilo ao elenco, cede 1,14 grande chance por jogo (o menor); mas +0,21 ponto por jogo de sorte, que não repete; times dele correm pouco | livre |",
          "| 3 | **Claudio Tencati** | elenco barato (15º), jogo direto, alinhado com Baptista (0,66); pontos e xPts iguais (sem sorte); 1,17 grande chance cedida | Botafogo-SP |",
          "| fora | Guto Ferreira, Thiago Carpini | currículo de G4 com elencos top-5, +0,30 de sorte por jogo e 1,6–1,8 grandes chances cedidas: o placar é do elenco | — |",
          "| fora | Mozart | modelo de posse com baixa intensidade: o oposto do elenco abaixo | — |", "",
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
