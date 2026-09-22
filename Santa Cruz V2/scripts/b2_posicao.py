"""Bloco 2, perguntas 2 e 3 — perfil técnico por posição (11 do campograma) e estabilidade.

Titulares: fatia >= 60% e >= 900 minutos, 2022-2025. Para cada posição e indicador:
  - correlação do posto do jogador (dentro de temporada × posição) com o rendimento do clube,
    IC por bootstrap de clube;
  - faixas P25/P50/P75 dos titulares dos times de referência (quartil de cima em rendimento)
    e dos demais titulares.
Estabilidade: o mesmo jogador (nome + idade+1) em duas temporadas seguidas na Série B — correlação
do indicador entre os dois anos, dentro da posição. Indicador que não repete não serve para prever.
Escreve resultados/b2/posicao_testes.csv, posicao_faixas.csv, estabilidade.csv, jogadores.csv
"""
import os
import numpy as np, pandas as pd
from _comum import *
from b1_time import boot_corr
from b1_perfis import POS11, ORDEM

IND = {  # coluna do Wyscout: nome curto
 "Golos/90": "Gols/90", "Golos esperados/90": "xG/90", "Assistências/90": "Assistências/90", "Assistências esperadas/90": "xA/90",
 "Remates/90": "Finalizações/90", "Remates à baliza, %": "Finalizações no alvo %", "Golos marcados, %": "Conversão %",
 "Toques na área/90": "Toques na área/90", "Corridas progressivas/90": "Corridas progressivas/90", "Acelerações/90": "Acelerações c/ bola/90",
 "Dribles/90": "Dribles/90", "Dribles com sucesso, %": "Dribles certos %", "Duelos ofensivos/90": "Duelos ofensivos/90", "Duelos ofensivos ganhos, %": "Duelos ofensivos ganhos %",
 "Passes/90": "Passes/90", "Passes certos, %": "Passes certos %", "Passes para a frente/90": "Passes p/ frente/90", "Passes para a frente certos, %": "Passes p/ frente certos %",
 "Passes longos/90": "Passes longos/90", "Passes longos certos, %": "Passes longos certos %", "Passes progressivos/90": "Passes progressivos/90", "Passes progressivos certos, %": "Passes progressivos certos %",
 "Passes para terço final/90": "Passes terço final/90", "Passes certos para terço final, %": "Passes terço final certos %", "Passes para a área de penálti/90": "Passes p/ área/90",
 "Passes inteligentes/90": "Passes inteligentes/90", "Passes chave/90": "Passes chave/90", "Passes em profundidade/90": "Passes em profundidade/90", "Assistências para remate/90": "Passes p/ finalização/90",
 "Cruzamentos/90": "Cruzamentos/90", "Cruzamentos certos, %": "Cruzamentos certos %", "Passes recebidos/90": "Passes recebidos/90", "Receção de passes em profundidade/90": "Recepções em profundidade/90",
 "Ações defensivas com êxito/90": "Ações defensivas c/ êxito/90", "Duelos defensivos/90": "Duelos defensivos/90", "Duelos defensivos ganhos, %": "Duelos defensivos ganhos %",
 "Duelos aérios/90": "Duelos aéreos/90", "Duelos aéreos ganhos, %": "Duelos aéreos ganhos %", "Cortes/90": "Desarmes/90", "Cortes de carrinho ajust. à posse": "Desarmes ajust. posse",
 "Interseções/90": "Interceptações/90", "Interceções ajust. à posse": "Interceptações ajust. posse", "Remates intercetados/90": "Bloqueios/90", "Faltas/90": "Faltas/90", "Cartões amarelos/90": "Amarelos/90",
 "Golos de cabeça/90": "Gols de cabeça/90", "Faltas sofridas/90": "Faltas sofridas/90",
}
GOL = {"Defesas, %": "Defesas %", "Golos sofridos/90": "Gols sofridos/90", "Golos sofridos esperados/90": "xG sofrido/90",
       "Golos expectáveis defendidos por 90´": "Gols evitados (xG − gols)/90", "Jogos sem sofrer golos": "Jogos sem sofrer gol", "Saídas/90": "Saídas/90",
       "Passes certos, %": "Passes certos %", "Passes longos/90": "Passes longos/90", "Passes longos certos, %": "Passes longos certos %", "Duelos aéreos ganhos, %": "Duelos aéreos ganhos %",
       "Lançamentos certos, %" : "Lançamentos certos %"}

def main():
    out = os.path.join(RES, "b2"); os.makedirs(out, exist_ok=True)
    t = tecnico(); ct = clube_temporada()
    t["pos11"] = t["posicao"].astype(str).str.split(",").str[0].str.strip().map(POS11).fillna("Outro")
    t = t.merge(ct[["ano", "clube", "pos", "pontos", "faixa", "rendimento", "posto_valor"]], on=["ano", "clube"])
    corte = ct[ct.ano <= 2025]["rendimento"].quantile(0.75); t["time_referencia"] = t.rendimento >= corte
    t["titular"] = (t.fatia >= 0.6) & (t.minutos >= 900)
    allind = {**IND, **{k: v for k, v in GOL.items() if k not in IND}}
    cols = [c for c in allind if c in t.columns]
    faltam = [c for c in allind if c not in t.columns]
    if faltam: print("colunas ausentes:", faltam)
    ok = t.minutos >= 900
    for c in cols:
        t.loc[ok, c + "_pct"] = t[ok].groupby(["ano", "pos11"])[c].rank(pct=True).mul(100).round(0)
    t["rank_minutos_no_clube"] = t.groupby(["ano", "clube"])["minutos"].rank(ascending=False, method="first").astype(int)
    front = ["ano", "clube", "pos", "pontos", "faixa", "posto_valor", "rendimento", "time_referencia", "jogador", "posicao", "pos11", "idade",
             "Contrato termina", "Valor de mercado", "País de nacionalidade", "Altura", "Pé", "jogos", "minutos", "fatia", "titular", "rank_minutos_no_clube"]
    t[front + cols + [c + "_pct" for c in cols]].to_csv(os.path.join(out, "jogadores.csv"), index=False)

    fech = t[(t.ano <= 2025) & t.titular & (t.pos11 != "Outro")]
    tests, faixas = [], []
    for p in ORDEM:
        g = fech[fech.pos11 == p]; use = GOL if p == "GOL" else IND
        for c, nome in use.items():
            if c not in g.columns: continue
            d = g.dropna(subset=[c]); d = d[d[c].notna()]
            if len(d) < 20 or d[c].std() == 0: continue
            x = d.groupby("ano")[c].rank(pct=True).values; y = d["rendimento"].values
            r = np.corrcoef(x, y)[0, 1]; ic, pb = boot_corr(x, y, d.clube.values, n=1500)
            rf, ou = d[d.time_referencia][c], d[~d.time_referencia][c]
            tests.append(dict(posicao=p, indicador=nome, n=len(d), n_ref=int(d.time_referencia.sum()), r=round(r, 3), ic_baixo=round(ic[0], 3), ic_alto=round(ic[1], 3), p_boot=round(pb, 4)))
            faixas.append(dict(posicao=p, indicador=nome, qtd_ref=len(rf), qtd_outros=len(ou), ref_p25=rf.quantile(.25), ref_p50=rf.median(), ref_p75=rf.quantile(.75),
                               outros_p50=ou.median(), dif_pct=round(100 * (rf.median() - ou.median()) / abs(ou.median()), 1) if ou.median() else np.nan))
    te = pd.DataFrame(tests); te.to_csv(os.path.join(out, "posicao_testes.csv"), index=False)
    fa = pd.DataFrame(faixas).round(2); fa.to_csv(os.path.join(out, "posicao_faixas.csv"), index=False)
    pd.set_option("display.width", 250)
    sig = te[(te.ic_baixo > 0) | (te.ic_alto < 0)]
    print(f"testes: {len(te)} | fora do zero: {len(sig)} (esperado ao acaso ~{len(te)*0.05:.0f})")
    print(sig.sort_values(["posicao", "r"], ascending=[True, False]).to_string(index=False))

    # estabilidade
    a = t[(t.minutos >= 900) & (t.pos11 != "Outro")].copy()
    b = a.copy(); b["ano"] -= 1; b["idade"] -= 1
    par = a.merge(b, on=["chave", "ano", "idade", "pos11"], suffixes=("", "_prox"))
    par = par[~par.duplicated(["chave", "ano"], keep=False)]
    rows = []
    for c, nome in allind.items():
        if c not in par.columns: continue
        d = par.dropna(subset=[c, c + "_prox"])
        if len(d) < 30: continue
        x = d.groupby(["ano", "pos11"])[c].rank(pct=True); y = d.groupby(["ano", "pos11"])[c + "_prox"].rank(pct=True)
        rows.append(dict(indicador=nome, n_pares=len(d), r_ano_seguinte=round(np.corrcoef(x, y)[0, 1], 3),
                         mesmo_clube=int((d.clube == d.clube_prox).sum())))
    es = pd.DataFrame(rows).sort_values("r_ano_seguinte", ascending=False); es.to_csv(os.path.join(out, "estabilidade.csv"), index=False)
    print("\n=== estabilidade ano a ano (pares =", len(par), ")"); print(es.to_string(index=False))

if __name__ == "__main__":
    main()
