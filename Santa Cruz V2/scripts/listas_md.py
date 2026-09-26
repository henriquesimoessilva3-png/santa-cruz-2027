"""Gera listas/LISTAS.md a partir dos CSVs de listas.py (5 por posição por mercado)."""
import os, pandas as pd
from _comum import RAIZ, chave
TIPOS = None
def tipo_de(jog, clube):
    global TIPOS
    if TIPOS is None:
        t = pd.read_csv(os.path.join(RAIZ, "resultados", "b10", "tipos_todos.csv"))
        t["k"] = t.chave + "|" + t.clube.map(chave)
        TIPOS = t.drop_duplicates("k").set_index("k")
    k = chave(jog) + "|" + chave(clube)
    if k not in TIPOS.index: return "—"
    r = TIPOS.loc[k]; return str(r.tipo) + ("" if r.tipo_pref else " *")
ORDEM=["GOL","LD","ZD","ZE","LE","VOL","MED","MEI","ED","EE","CA"]
NOMES={"GOL":"Goleiro","LD":"Lateral direito","ZD":"Zagueiro pela direita","ZE":"Zagueiro pela esquerda","LE":"Lateral esquerdo","VOL":"Volante","MED":"Médio","MEI":"Meia","ED":"Extremo pela direita","EE":"Extremo pela esquerda","CA":"Centroavante"}
def fmt(v): return 'sim' if str(v)=='True' else ('não' if str(v)=='False' else v)
def main():
    out=os.path.join(RAIZ,"listas")
    md=["# Listas por posição — Série B 2027\n\n*Dado: Wyscout e contratos de ago/26; ranking do Portal ago/26; físico SkillCorner até set/26 · revisão 25/09/2026.*\n",
        "Duas notas por jogador. **Aderência**: percentil médio ponderado, dentro de liga × posição (≥ 900 min), nos indicadores da ficha da posição dos blocos 1–3 (aba `ficha_por_posicao`) — encaixe no modelo que rende na Série B; nos mercados de fora, convertida pela reta de conversão de liga do Bloco 12 (fora do Brasil: 31 + 0,30 × aderência, p90 → 58; Série A: 48 + 0,28 × aderência). **Nível**: o overall do Portal Ranking (ago/26), nível do jogador contra a referência mundial da posição, 0–100. **Nota** = média das duas; é o que ordena. Série A fora das recomendações (23/09) e nomes vetados pelo clube fora (`EXCLUIDOS.csv`). Filtros: idade ≤ 35 (goleiro ≤ 37 — idade não rende nem custa ponto, B5-3; fica como coluna), ≥ 3 critérios com dado; fora do Brasil, ligas alcançáveis ou valor ≤ € 2 mi (Série A ≤ 3 mi). `livre 2027` = contrato até jun/2027 ou sem contrato registrado. Série B: `psv ok` (piso 27 km/h), `rodou 2025` (≥ 900 min na B em 2025). Lista completa (8–15 por posição) no `listas_2027.xlsx`. **Nota com \\*** = só aderência, sem nível do ranking (parcial). **Contrato \\*** = já vencido no dado de ago/26: renovou ou está livre, confirmar. **Tipo** = tipo físico do Bloco 8 (\\* = não é o tipo preferido de quem sobe); fora da B, encaixe pelo perfil médio. Duelos ajustados à posse (B9) estão no `listas_2027.xlsx` (colunas PAdj, posse estimada pela fatia de passes do clube na liga).\n",
        "**Como ler:** encaixe alto + nível alto é o alvo; encaixe alto + nível baixo é barato e arriscado; nível alto + encaixe baixo é bom jogador para outro modelo. Minutagem elimina; as notas ordenam; vídeo decide.\n"]
    SIM = lambda v: "✓" if str(v) == "True" else ("—" if str(v) == "False" else ("✓" if str(v) == "sim" else "—"))
    def dt(c):
        c = str(c) if pd.notna(c) else ""
        return c[8:10] + "/" + c[5:7] + "/" + c[2:4] if len(c) >= 10 else "—"
    # Série A fora das recomendações (decisão do clube, 23/09): a planilha ainda a tem, a leitura não
    for arq,tit,extra in [("1_serie_B.csv","1. Série B (2026)",[("psv_ok","PSV ok"),("rodou_2025","Rodou 2025"),("livre_2027","Livre 2027")]),("2_sul_americanas.csv","2. Campeonatos sul-americanos",[("livre_2027","Livre 2027"),("ocupa_vaga_estrangeiro","Estrangeiro")]),("3_sulam_no_exterior.csv","3. Brasileiros e sul-americanos no exterior",[("livre_2027","Livre 2027"),("ocupa_vaga_estrangeiro","Estrangeiro")]),("4_outras_ligas.csv","4. Outras ligas",[("livre_2027","Livre 2027")])]:
        d=pd.read_csv(os.path.join(out,arq)); md.append(f"\n## {tit}\n")
        serieb = arq.startswith("1_")
        for p in ORDEM:
            g=d[d.pos11==p].head(5)
            if g.empty: continue
            cab = ["#", "Jogador", "Clube"] + ([] if serieb else ["Liga"]) + ["Idade", "Min", "Contrato", "Nota", "Aderência", "Nível", "Tipo", "N"] + [r for _, r in extra]
            md.append(f"\n### {NOMES[p]}\n\n| " + " | ".join(cab) + " |\n|" + "---|" * len(cab))
            for n,(_,r) in enumerate(g.iterrows(), 1):
                niv=f"{r.nivel_overall:.0f}" if pd.notna(r.nivel_overall) else "—"
                cel = [str(n), f"**{r.jogador}**", str(r.clube)] + ([] if serieb else [str(r.liga)]) + \
                      [str(int(r.idade)), f"{int(r.minutos):,}".replace(",", "."), dt(r.contrato) + (" *" if str(r.get("contrato_vencido")) == "True" else ""), f"{r.nota:.0f}" + ("" if str(r.get("nota_completa", True)) == "True" else " *"),
                       f"{r.aderencia_ajustada:.0f}", niv, tipo_de(r.jogador, r.clube), str(r.nivel).replace(" jovem", "")] + [SIM(r[k]) for k, _ in extra]
                md.append("| " + " | ".join(cel) + " |")
    open(os.path.join(out,"LISTAS.md"),"w").write("\n".join(md)); print("ok")
if __name__=="__main__": main()
