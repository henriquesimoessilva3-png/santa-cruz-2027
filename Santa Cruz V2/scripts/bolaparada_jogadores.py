"""Especialistas de bola parada, nos quatro mercados.

COBRADOR: escanteios/90, faltas/90 (laterais e indiretas), faltas diretas/90, faltas diretas no
alvo %, xA/90, cruzamento certo % — percentil dentro de liga (todas as posições juntas, ≥ 900 min),
com peso maior no volume (o que repete ano a ano: r 0,72–0,76). Escanteios e faltas por temporada
em número absoluto ao lado.
FINALIZADOR AÉREO: gols de cabeça/90, gols de cabeça (n), duelos aéreos/90, duelos aéreos ganhos %,
altura — percentil dentro de liga × posição, jogadores de linha.
Série B: 2026, com o mesmo índice em 2025 para ver repetição.
Escreve listas/bola_parada_especialistas.xlsx e listas/BOLA_PARADA.md
"""
import os, glob
import numpy as np, pandas as pd
from _comum import *
from listas import pos11, SULAM, PAIS_SA, ALCANCAVEIS, corrigir_shift

COB = [("Corners per 90", 3), ("Free kicks per 90", 3), ("Direct free kicks per 90", 1), ("Direct free kicks on target, %", 1), ("xA per 90", 1), ("Accurate crosses, %", 1)]
FIN = [("Head goals per 90", 3), ("Head goals", 2), ("Aerial duels won, %", 2), ("Aerial duels per 90", 2), ("Height", 1)]
PT = {"Corners per 90": "Cantos/90", "Free kicks per 90": "Livres/90", "Direct free kicks per 90": "Livres directos/90", "Direct free kicks on target, %": "Pontapés livres directos à baliza, %",
      "xA per 90": "Assistências esperadas/90", "Accurate crosses, %": "Cruzamentos certos, %", "Head goals per 90": "Golos de cabeça/90", "Head goals": "Golos de cabeça",
      "Aerial duels won, %": "Duelos aéreos ganhos, %", "Aerial duels per 90": "Duelos aéreos/90", "Height": "Altura"}

def indices(d, liga="liga"):
    d = d.copy(); d["minutos"] = pd.to_numeric(d.minutos, errors="coerce"); d["idade"] = pd.to_numeric(d.idade, errors="coerce"); d = d[d.minutos >= 900].copy()
    for en in set(e for e, _ in COB + FIN) | {"Head goals"}:
        if en in d: d[en] = pd.to_numeric(d[en], errors="coerce")
    for en, _ in COB:
        if en in d: d[en + "_pct"] = d.groupby(liga)[en].rank(pct=True).mul(100)
    lin = d.pos11 != "GOL"
    for en, _ in FIN:
        if en in d: d.loc[lin, en + "_pct"] = d[lin].groupby(liga)[en].rank(pct=True).mul(100)
    def idx(r, lst):
        v = [(r.get(e + "_pct"), w) for e, w in lst if pd.notna(r.get(e + "_pct"))]
        return sum(a * w for a, w in v) / sum(w for _, w in v) if len(v) >= 2 else np.nan
    d["indice_cobrador"] = [round(idx(r, COB), 1) for _, r in d.iterrows()]
    d["indice_finalizador"] = [round(idx(r, FIN), 1) if (r.pos11 != "GOL" and r["Aerial duels per 90"] >= 2.5) else np.nan for _, r in d.iterrows()]
    d["escanteios_temporada"] = (d["Corners per 90"] * d.minutos / 90).round(0)
    d["faltas_cobradas_temporada"] = (d["Free kicks per 90"] * d.minutos / 90).round(0)
    d["faltas_diretas_temporada"] = (d["Direct free kicks per 90"] * d.minutos / 90).round(0)
    return d

def n0(v):
    return '—' if pd.isna(v) else f'{v:.0f}'

def main():
    out = os.path.join(RAIZ, "listas")
    t = tecnico(); t["pos11"] = t.posicao.map(pos11); t = t.rename(columns={v: k for k, v in PT.items()})
    t["liga"] = "Série B"; t["contrato"] = t["Contrato termina"]; t["valor"] = t["Valor de mercado"]; t["passaporte"] = t["País de nacionalidade"]
    sb = indices(t[t.ano == 2026]); sb25 = indices(t[t.ano == 2025])[["chave", "idade", "indice_cobrador", "indice_finalizador", "escanteios_temporada", "Head goals"]]
    sb25["idade"] += 1; sb25 = sb25.rename(columns={"indice_cobrador": "cobrador_2025", "indice_finalizador": "finalizador_2025", "escanteios_temporada": "escanteios_2025", "Head goals": "gols_cabeca_2025"})
    sb = sb.merge(sb25.drop_duplicates(["chave", "idade"]), on=["chave", "idade"], how="left")
    rows = []
    for f in sorted(glob.glob(os.path.join(BASES, "wyscout_ligas", "xlsx_ago26", "*.xlsx"))):
        liga = os.path.basename(f).split("_", 1)[1].replace(".xlsx", "")
        if liga in ("Brasil B", "Brasil C", "Argentina RESERVAS"): continue
        d = corrigir_shift(pd.read_excel(f)); d["liga"] = liga; rows.append(d)
    lg = pd.concat(rows, ignore_index=True).rename(columns={"Player": "jogador", "Team within selected timeframe": "clube", "Age": "idade", "Minutes played": "minutos", "Contract expires": "contrato", "Market value": "valor", "Birth country": "nascido_em", "Passport country": "passaporte"})
    lg["clube"] = lg.clube.fillna(lg.Team); lg["pos11"] = lg.Position.map(pos11)
    lg["mercado"] = np.where(lg.liga == "Brasil A", "Série A", np.where(lg.liga.isin(SULAM), "Sul-americano", "Exterior"))
    lg["sul_americano"] = lg.nascido_em.isin(PAIS_SA) | lg.passaporte.fillna("").apply(lambda s: any(p in s for p in PAIS_SA))
    lg = indices(lg)
    cols = ["liga", "pos11", "jogador", "clube", "idade", "minutos", "contrato", "valor", "passaporte"]
    cobc = ["indice_cobrador", "escanteios_temporada", "faltas_cobradas_temporada", "faltas_diretas_temporada", "Direct free kicks on target, %", "xA per 90", "Accurate crosses, %"]
    finc = ["indice_finalizador", "Head goals", "Head goals per 90", "Aerial duels per 90", "Aerial duels won, %", "Height"]
    def topo(d, col, n, extra=[]):
        d = d[(d.idade <= 33)].sort_values(col, ascending=False)
        return d[cols + (cobc if col == "indice_cobrador" else finc) + extra].head(n)
    merc = {"1_serie_B": sb, "1b_serie_A": lg[lg.mercado == "Série A"], "2_sul_americanas": lg[lg.mercado == "Sul-americano"],
            "3_sulam_no_exterior": lg[(lg.mercado == "Exterior") & lg.sul_americano & lg.liga.isin(ALCANCAVEIS)]}
    md = ["# Especialistas de bola parada\n", "Índice do cobrador: percentil dentro da liga em escanteios/90 e faltas cobradas/90 (peso 3), faltas diretas/90, faltas diretas no alvo %, xA/90 e cruzamento certo % (peso 1). Índice do finalizador aéreo: percentil dentro da liga, entre jogadores de linha com ≥ 2,5 duelos aéreos/90, em gols de cabeça/90 (peso 3), gols de cabeça (2), duelos aéreos ganhos % (2), duelos aéreos/90 (2) e altura (1). ≥ 900 minutos, idade ≤ 33. Série B mostra o índice de 2025 ao lado, para ver quem repete. Nos mercados de fora, só ligas alcançáveis.\n"]
    with pd.ExcelWriter(os.path.join(out, "bola_parada_especialistas.xlsx")) as w:
        for nome, d in merc.items():
            ex = ["cobrador_2025", "escanteios_2025"] if nome == "1_serie_B" else []
            c = topo(d, "indice_cobrador", 25, ex); f_ = topo(d, "indice_finalizador", 25, ["finalizador_2025", "gols_cabeca_2025"] if nome == "1_serie_B" else [])
            # taxas por 90 com 2 casas: arredondar tudo a 1 casa deixava xA/90 e gols de cabeça/90
            # em 0,1 / 0,2 / 0,3 (o índice sempre usou o valor cheio; só a planilha perdia a casa)
            casas = {k: 2 for k in ("xA per 90", "Head goals per 90", "Aerial duels per 90")}
            arred = lambda t: t.round({k: casas.get(k, 1) for k in t.columns})
            arred(c).to_excel(w, nome[:18] + "_cobr", index=False)
            arred(f_).to_excel(w, nome[:18] + "_final", index=False)
            md.append(f"\n## {nome.replace('_', ' ')}\n\n**Cobradores**\n")
            for _, r in c.head(10).iterrows():
                rep = f" · 2025: {r.cobrador_2025:.0f}" if ex and pd.notna(r.get("cobrador_2025")) else ""
                md.append(f"- {r.jogador} ({r.pos11}) — {r.clube}, {r.liga}, {int(r.idade)} anos, {int(r.minutos)} min · índice {r.indice_cobrador:.0f}{rep} · {n0(r.escanteios_temporada)} escanteios, {n0(r.faltas_cobradas_temporada)} faltas ({n0(r.faltas_diretas_temporada)} diretas), xA/90 {r['xA per 90']:.2f} · contrato {r.contrato if pd.notna(r.contrato) else '—'}")
            md.append("\n**Finalizadores aéreos**\n")
            for _, r in f_.head(10).iterrows():
                rep = f" · 2025: {r.finalizador_2025:.0f} ({n0(r.gols_cabeca_2025)} de cabeça)" if nome == "1_serie_B" and pd.notna(r.get("finalizador_2025")) else ""
                md.append(f"- {r.jogador} ({r.pos11}) — {r.clube}, {r.liga}, {int(r.idade)} anos, {int(r.minutos)} min · índice {r.indice_finalizador:.0f}{rep} · {n0(r['Head goals'])} gols de cabeça, {n0(r['Aerial duels won, %'])}% aéreos ganhos em {r['Aerial duels per 90']:.1f}/90, {r.Height if pd.notna(r.Height) else '—'} cm · contrato {r.contrato if pd.notna(r.contrato) else '—'}")
    open(os.path.join(out, "BOLA_PARADA.md"), "w").write("\n".join(md))
    print("\n".join(md[:60]))

if __name__ == "__main__":
    main()
