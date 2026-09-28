"""Quem não contratar — Série B 2026 (o mercado onde o clube mais olha): jogadores com ≥ 900 min que o estudo
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
    d.to_csv(os.path.join(LI, "NAO_CONTRATAR.csv"), index=False)
    f = lambda v, c=0: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")
    dt = lambda c: (str(c)[8:10] + "/" + str(c)[5:7] + "/" + str(c)[2:4]) if isinstance(c, str) and len(c) >= 10 else "—"
    md = ["# Quem não contratar — Série B 2026", "", "*Dado: Wyscout ago/26, SkillCorner até set/26, tipos físicos do F2 · 26/09/2026.*", "",
          "Jogadores da Série B 2026 com ≥ 900 min que o estudo **reprova**, com o motivo. Entra na lista quem está abaixo do piso de velocidade (F1-2), ou tem nota abaixo de 60 e dois motivos entre: tipo físico de quem cai na posição (F2-4, por posição: médio em tudo no lateral direito; baixa intensidade no zagueiro pela esquerda, lateral esquerdo e centroavante; menos intenso no volante; motor de volume no extremo pela esquerda — nas demais o físico não separa), nota baixa (< 50), corre pouco para a área quando a posição pede (F2-2); ou nota abaixo de 45. "
          "Ordem: minutos jogados — quem mais aparece na Série B e por isso mais chega ao clube como sugestão. Um nome aqui não é veredito de vídeo: é o dado dizendo que ele não é o perfil que sobe. Clique no nome para abrir a ficha.", ""]
    for p in ORDEM:
        x = d[d.pos11 == p]
        if x.empty: continue
        md += [f"### {NOMES[p]} ({len(x)})", "", "| Jogador | Clube | Idade | Min | Contrato | Nota | PSV | Tipo | Por quê |", "|---|---|---|---|---|---|---|---|---|"]
        for r in x.itertuples():
            md.append(f"| **{r.jogador}** | {r.clube} | {int(r.idade)} | {int(r.minutos)} | {dt(r.contrato)} | {f(r.nota)} | {f(r.psv, 1)} | {r.tipo if isinstance(r.tipo, str) else '—'} | {r.motivos} |")
        md.append("")
    md += ["## Vetados pelo clube (EXCLUIDOS.csv)", "", "| Jogador | Clube | Motivo | Data |", "|---|---|---|---|"]
    for r in ex.itertuples(): md.append(f"| {r.jogador} | {r.clube if isinstance(r.clube, str) else '—'} | {r.motivo} | {r.data} |")
    open(os.path.join(LI, "NAO_CONTRATAR.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    print(d.groupby("pos11").size().to_dict(), len(d))

if __name__ == "__main__":
    main()
