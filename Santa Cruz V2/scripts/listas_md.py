"""Gera listas/LISTAS.md a partir dos CSVs de listas.py (5 por posição por mercado)."""
import os, pandas as pd
from _comum import RAIZ
ORDEM=["GOL","LD","ZD","ZE","LE","VOL","MED","MEI","ED","EE","CA"]
NOMES={"GOL":"Goleiro","LD":"Lateral direito","ZD":"Zagueiro pela direita","ZE":"Zagueiro pela esquerda","LE":"Lateral esquerdo","VOL":"Volante","MED":"Médio","MEI":"Meia","ED":"Extremo pela direita","EE":"Extremo pela esquerda","CA":"Centroavante"}
def fmt(v): return 'sim' if str(v)=='True' else ('não' if str(v)=='False' else v)
def main():
    out=os.path.join(RAIZ,"listas")
    md=["# Listas por posição — Série B 2027\n",
        "Duas notas por jogador. **Aderência**: percentil médio ponderado, dentro de liga × posição (≥ 900 min), nos indicadores da ficha da posição dos blocos 1–3 (aba `ficha_por_posicao`) — encaixe no modelo que rende na Série B; nos mercados de fora, ajustada pelo desconto de conversão do Bloco 6 (−15; Série A +16). **Nível**: o overall do Portal Ranking (ago/26), nível do jogador contra a referência mundial da posição, 0–100. **Nota** = média das duas; é o que ordena. Filtros: idade ≤ 33 (goleiro ≤ 37), ≥ 3 critérios com dado; fora do Brasil, ligas alcançáveis ou valor ≤ € 2 mi (Série A ≤ 3 mi). `livre 2027` = contrato até jun/2027 ou sem contrato registrado. Série B: `psv ok` (piso 27 km/h), `rodou 2025` (≥ 900 min na B em 2025). Lista completa (8–15 por posição) no `listas_2027.xlsx`.\n",
        "**Como ler:** encaixe alto + nível alto é o alvo; encaixe alto + nível baixo é barato e arriscado; nível alto + encaixe baixo é bom jogador para outro modelo. Minutagem elimina; as notas ordenam; vídeo decide.\n"]
    for arq,tit,extra in [("1_serie_B.csv","1. Série B (2026)",["psv_ok","rodou_2025","livre_2027"]),("1b_serie_A.csv","1b. Série A (2026)",["livre_2027","ocupa_vaga_estrangeiro"]),("2_sul_americanas.csv","2. Campeonatos sul-americanos",["livre_2027","ocupa_vaga_estrangeiro"]),("3_sulam_no_exterior.csv","3. Brasileiros e sul-americanos no exterior",["livre_2027","ocupa_vaga_estrangeiro"]),("4_outras_ligas.csv","4. Outras ligas",["livre_2027"])]:
        d=pd.read_csv(os.path.join(out,arq)); md.append(f"\n## {tit}\n")
        for p in ORDEM:
            g=d[d.pos11==p].head(5)
            if g.empty: continue
            md.append(f"\n**{NOMES[p]}**\n")
            for _,r in g.iterrows():
                ex=" · ".join(f"{k.replace('_',' ')}: {fmt(r[k])}" for k in extra)
                liga=f" ({r.liga})" if r.liga!="Série B" else ""
                niv=f"{r.nivel_overall:.0f}" if pd.notna(r.nivel_overall) else "—"
                md.append(f"- {r.jogador} — {r.clube}{liga}, {int(r.idade)} anos, {int(r.minutos)} min, contrato {r.contrato if pd.notna(r.contrato) else '—'} · nota {r.nota:.0f} (aderência {r.aderencia_ajustada:.0f}, nível {niv}) · {r.nivel} · {ex}")
    open(os.path.join(out,"LISTAS.md"),"w").write("\n".join(md)); print("ok")
if __name__=="__main__": main()
