"""Alertas do dado — Série B 2026 (o mercado onde o clube mais olha): jogadores com ≥ 900 min que o estudo
reprova, com o motivo. Motivos: abaixo do piso de velocidade (F1-2); tipo físico de quem cai na posição (F2-4, por
posição: médio em tudo no LD, baixa intensidade no ZE/LE/CA, menos intenso no VOL, motor de volume no EE); nota baixa (< 50: aderência + nível);
corre pouco para a área quando a posição pede (F2-2, quartil de baixo, lateral/volante/meia/extremo). Entra na lista
quem tem o piso reprovado, ou nota < 60 com dois motivos, ou nota < 45. Ordem: minutos (quem mais aparece). Saída: listas/NAO_CONTRATAR.md"""
import os, numpy as np, pandas as pd
from _comum import RAIZ, chave, excluidos
LI = os.path.join(RAIZ, "listas")
ORDEM = ["GOL", "LD", "ZD", "ZE", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]
NOMES = {"GOL": "Goleiro", "LD": "Lateral direito", "ZD": "Zagueiro pela direita", "ZE": "Zagueiro pela esquerda", "LE": "Lateral esquerdo", "VOL": "Volante", "MED": "Médio", "MEI": "Meia", "ED": "Extremo pela direita", "EE": "Extremo pela esquerda", "CA": "Centroavante"}
_tp = pd.read_csv(os.path.join(RAIZ, "resultados", "b8", "tipos_preferidos_pos.csv"))
CAI = {r.pos11: [t for t in str(r.de_quem_cai).split(" / ") if t and t != "nan"] for r in _tp.itertuples()}  # tipos de quem cai, por posição (F2-4)
AREA = {"LD", "LE", "VOL", "MED", "MEI", "ED", "EE"}

def main():
    sb = pd.read_excel(os.path.join(LI, "listas_2027.xlsx"), "base_serie_B_2026")
    tt = pd.read_csv(os.path.join(RAIZ, "resultados", "b15", "tipos_todos.csv")); tt = tt.loc[:, ~tt.columns.duplicated()]
    tt["k"] = tt.chave + "|" + tt.clube.map(chave); tt = tt.drop_duplicates("k").set_index("k")
    sb["k"] = sb.jogador.map(chave) + "|" + sb.clube.map(chave); sb["tipo"] = sb.k.map(tt.tipo)
    sb["area_p"] = sb.groupby("pos11").runs_penalty_area_p30tip.rank(pct=True) * 100
    ex = pd.read_csv(os.path.join(LI, "EXCLUIDOS.csv"))
    rows = []
    for r in sb.itertuples():
        m = []
        if r.pos11 != "GOL" and pd.notna(r.psv99) and r.psv99 < 27: m.append(f"abaixo do piso de velocidade ({str(round(r.psv99, 1)).replace('.', ',')} km/h)")
        if isinstance(r.tipo, str) and r.tipo in CAI.get(r.pos11, []): m.append(f"tipo físico de quem cai ({r.tipo})")
        if pd.notna(r.nota) and r.nota < 50: m.append(f"nota baixa ({r.nota:.0f})")
        if r.pos11 in AREA and pd.notna(r.area_p) and r.area_p <= 25: m.append("corre pouco para a área (quartil de baixo)")
        piso = any(x.startswith("abaixo do piso") for x in m)
        # nota ≥ 60 só entra pelo piso: o técnico forte compensa o resto (é o que 'Os meus dez' faz)
        if piso or (len(m) >= 2 and (pd.isna(r.nota) or r.nota < 60)) or (pd.notna(r.nota) and r.nota < 45):
            rows.append(dict(pos11=r.pos11, jogador=r.jogador, clube=r.clube, idade=r.idade, minutos=r.minutos, contrato=r.contrato, nota=r.nota, psv=r.psv99, tipo=r.tipo, motivos="; ".join(m)))
    d = pd.DataFrame(rows).sort_values(["pos11", "minutos"], ascending=[True, False])
    # o que o dado tem A FAVOR: sinal dos scouts (TransferRoom), lugar no ranking físico, lugar em "Os meus dez"
    sc = pd.read_csv(os.path.join(RAIZ, "scout", "alvos_scouts.csv")); sc["k"] = sc.jogador.map(chave) + "|" + sc.clube.map(chave)
    sinal = sc.drop_duplicates("k").set_index("k").sinal_scouts
    rf = pd.read_csv(os.path.join(LI, "RANKING_FISICO.csv")); rf = rf[rf.mercado_l == "Série B"].copy(); rf["k"] = rf.jogador.map(chave) + "|" + rf.clube.map(chave)
    rf["rank_fis"] = rf.groupby("pos11").cumcount() + 1; rfi = rf.drop_duplicates("k").set_index("k")
    po = pd.read_csv(os.path.join(LI, "POOL_2027.csv")).set_index("k")
    d["k"] = d.jogador.map(chave) + "|" + d.clube.map(chave)
    d["scouts"] = d.k.map(sinal); d["rank_fis"] = d.k.map(rfi.rank_fis); d["fisico"] = d.k.map(rfi.fisico); d["geral"] = d.k.map(po.ordem_geral)
    d["favor"] = [", ".join(x for x in [("★ scouts: " + str(r.scouts)) if isinstance(r.scouts, str) else "", f"{int(r.rank_fis)}º físico da posição na B ({r.fisico:.0f})" if pd.notna(r.rank_fis) and r.rank_fis <= 10 else ""] if x) for r in d.itertuples()]
    d.to_csv(os.path.join(LI, "NAO_CONTRATAR.csv"), index=False)
    f = lambda v, c=0: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")
    dt = lambda c: (str(c)[8:10] + "/" + str(c)[5:7] + "/" + str(c)[2:4]) if isinstance(c, str) and len(c) >= 10 else "—"
    md = ["# Alertas do dado — Série B 2026", "", "*Dado: Wyscout ago/26, SkillCorner até set/26, tipos físicos do F2, scouts TransferRoom · 28/09/2026.*", "",
          "Não é uma lista de veto: é o **dado dizendo o que tem contra** cada nome que chega como sugestão — e, na última coluna, o que tem **a favor** (o sinal dos scouts e o lugar no ranking físico), para a conversa ser com os dois lados na mesa. Quem tem algo a favor está na seção 1; quem só tem contra, na 2. Jogadores da Série B 2026 com ≥ 900 min. Entra na lista quem está abaixo do piso de velocidade (F1-2), ou tem nota abaixo de 60 e dois motivos entre: tipo físico de quem cai na posição (F2-4, por posição: médio em tudo no lateral direito; baixa intensidade no zagueiro pela esquerda, lateral esquerdo e centroavante; menos intenso no volante; motor de volume no extremo pela esquerda — nas demais o físico não separa), nota baixa (< 50), corre pouco para a área quando a posição pede (F2-2); ou nota abaixo de 45. "
          "Ordem: minutos jogados — quem mais aparece na Série B e por isso mais chega ao clube como sugestão. **Geral** = lugar em `Os meus dez` (— = não entra). Clique no nome para abrir a ficha.", ""]
    for titulo, cond in [("## 1 · O dado alerta, mas há algo a favor — vídeo decide", d.favor != ""), ("## 2 · Só contra: o dado não vê o perfil que sobe", d.favor == "")]:
        md += [titulo, ""]
        for p in ORDEM:
            x = d[(d.pos11 == p) & cond]
            if x.empty: continue
            md += [f"### {NOMES[p]} ({len(x)})", "", "| Jogador | Clube | Idade | Min | Contrato | Nota | Geral | PSV | Tipo | Contra | A favor |", "|---|---|---|---|---|---|---|---|---|---|---|"]
            for r in x.itertuples():
                md.append(f"| **{r.jogador}** | {r.clube} | {int(r.idade)} | {int(r.minutos)} | {dt(r.contrato)} | {f(r.nota)} | {'—' if pd.isna(r.geral) else str(int(r.geral)) + 'º'} | {f(r.psv, 1)} | {r.tipo if isinstance(r.tipo, str) else '—'} | {r.motivos} | {r.favor or '—'} |")
            md.append("")
    md += ["## Vetados pelo clube (EXCLUIDOS.csv)", "", "| Jogador | Clube | Motivo | Data |", "|---|---|---|---|"]
    for r in ex.itertuples(): md.append(f"| {r.jogador} | {r.clube if isinstance(r.clube, str) else '—'} | {r.motivo} | {r.data} |")
    open(os.path.join(LI, "NAO_CONTRATAR.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    print(d.groupby("pos11").size().to_dict(), len(d))

if __name__ == "__main__":
    main()
