"""Dez alvos por posição — 2027. Regerado em 23/09 com o recorte que o clube pediu:
  - SEM Série A (inalcançável para a B) e sem os nomes de listas/EXCLUIDOS.csv;
  - foco: Série B e sul-americanos; do exterior só brasileiros/sul-americanos de LIGAS MAIS
    FRACAS (FRACAS abaixo), no máximo 3 por posição;
  - ordem: livres primeiro (contrato até jun/27 ou sem contrato); dentro deles a nota do estudo
    (aderência + nível) + bônus dos scouts; Equador B, Bolívia e Argentina B com −5 (só entram
    quando não há melhor).
Entradas: listas/1_serie_B.csv, 2_sul_americanas.csv, 3_sulam_no_exterior.csv, scout/alvos_scouts.csv
Saídas:   listas/TOP10_por_posicao.csv e listas/TOP10_POR_POSICAO.md
"""
import os
import numpy as np, pandas as pd
from _comum import RAIZ, chave, excluidos, caro

L = os.path.join(RAIZ, "listas")
FRACAS = {"Portugal B", "Portugal C", "Espanha C", "Italia C", "Bulgaria", "Romenia", "Polonia", "Eslovaquia",
          "Servia", "Hungria", "Croacia", "Grecia", "Israel", "Bahrain", "Emirados", "China", "Coreia B", "Japao B"}
CRIVO = {"Equador B": -5, "Bolivia": -5, "Argentina B": -5}
BONUS = {"urgência": 4, "contratar": 4, "média ≥7": 3, "média ≥6,5": 2}
POS = [("GOL", "Goleiro", "vídeo decide; ordem pelas duas notas"), ("LD", "Lateral direito", ""),
       ("ZD", "Zagueiro pela direita", ""), ("ZE", "Zagueiro pela esquerda", ""), ("LE", "Lateral esquerdo", ""),
       ("VOL", "Volante", ""), ("MED", "Médio", ""), ("MEI", "Meia", ""), ("ED", "Extremo pela direita", ""),
       ("EE", "Extremo pela esquerda", ""), ("CA", "Centroavante", "")]
PAIS = {"Argentina": "ARG", "Uruguai": "URU", "Paraguai": "PAR", "Chile": "CHI", "Colombia": "COL", "Equador": "ECU",
        "Peru": "PER", "Bolivia": "BOL", "Venezuela": "VEN", "Portugal": "POR", "Espanha": "ESP", "Italia": "ITA",
        "Bulgaria": "BUL", "Romenia": "ROM", "Polonia": "POL", "Eslovaquia": "SVK", "Servia": "SRB", "Hungria": "HUN",
        "Croacia": "CRO", "Grecia": "GRE", "Israel": "ISR", "Bahrain": "BHR", "Emirados": "EAU", "China": "CHN",
        "Coreia": "COR", "Japao": "JAP"}


def main():
    fora = excluidos()
    b = pd.read_csv(os.path.join(L, "1_serie_B.csv"))
    s = pd.read_csv(os.path.join(L, "2_sul_americanas.csv"))
    e = pd.read_csv(os.path.join(L, "3_sulam_no_exterior.csv"))
    e = e[e.liga.isin(FRACAS)]
    d = pd.concat([b, s, e], ignore_index=True)
    d = d[[not fora(j, c) for j, c in zip(d.jogador, d.clube)]]
    d = d[~caro(d)]   # valor de mercado acima de € 2 MM: inalcançável para a B
    sc = pd.read_csv(os.path.join(RAIZ, "scout", "alvos_scouts.csv"))
    sc["k"] = sc.jogador.map(chave) + "|" + sc.clube.map(chave)
    sinal = sc.drop_duplicates("k").set_index("k")[["sinal_scouts", "avaliacoes", "nota_media"]]
    d["k"] = d.jogador.map(chave) + "|" + d.clube.map(chave)
    d = d.join(sinal, on="k")
    d["livre"] = d.livre_2027.astype(str) == "True"
    d["nota_final"] = (d.nota + d.sinal_scouts.map(BONUS).fillna(0) + d.liga.map(CRIVO).fillna(0)).round(1)
    out, md = [], ["# Dez alvos por posição — 2027, prioridade a livres\n",
        "Critério (23/09): **sem Série A** e sem os nomes tirados pelo clube (`EXCLUIDOS.csv`); foco na **Série B** "
        "e nos **sul-americanos**; do exterior, só brasileiros e sul-americanos de **ligas mais fracas** (Portugal B/C, "
        "Leste Europeu, Oriente Médio, Ásia B), no máximo três por posição. Livres (contrato até jun/27 ou sem contrato) "
        "primeiro; valor de mercado até € 2 MM (acima disso é inalcançável); dentro deles, a nota do estudo (aderência + nível) com bônus dos scouts. Equador B, Bolívia e "
        "Argentina B só entram quando não há melhor. ★ = visto e aprovado pelos scouts. (e) = não é livre: "
        "empréstimo ou compra. Base: `TOP10_por_posicao.csv`, gerado por `scripts/top10.py`.\n"]
    for p, nome, sub in POS:
        x = d[d.pos11 == p].sort_values(["livre", "nota_final"], ascending=[False, False])
        x = pd.concat([x[x.mercado != "Exterior"], x[x.mercado == "Exterior"].head(3)]).sort_values(
            ["livre", "nota_final"], ascending=[False, False]).head(10)
        x = x.assign(ordem=range(1, len(x) + 1))
        out.append(x)
        itens = []
        for r in x.itertuples():
            pais = "" if r.mercado == "Série B" else " (" + PAIS.get(str(r.liga).split(" ")[0], str(r.liga)) + \
                   (" B" if str(r.liga).endswith(" B") and r.mercado != "Série B" else "") + ")"
            est = f" ★ {r.sinal_scouts}" if isinstance(r.sinal_scouts, str) else ""
            itens.append(f"{r.ordem}. {r.jogador} — {r.clube}{pais}, {int(r.idade)}{'' if r.livre else ' (e)'} · "
                         f"nota {r.nota_final:.0f}{est}")
        md.append(f"\n**{nome}**" + (f" ({sub})" if sub else "") + "\n" + " · ".join(itens))
    t = pd.concat(out)
    cols = ["ordem", "mercado", "liga", "pos11", "jogador", "clube", "idade", "minutos", "contrato", "valor", "nota",
            "sinal_scouts", "avaliacoes", "nota_media", "nota_final", "livre"]
    t[[c for c in cols if c in t]].to_csv(os.path.join(L, "TOP10_por_posicao.csv"), index=False)
    open(os.path.join(L, "TOP10_POR_POSICAO.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    print(t.mercado.value_counts().to_dict(), "| livres:", int(t.livre.sum()), "de", len(t))
    print("\n".join(md[1:]))


if __name__ == "__main__":
    main()
