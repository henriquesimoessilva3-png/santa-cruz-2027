"""Série A — quem pode servir à Série B: (a) não aproveitados em 2026 (200 a 1.100 min) e (b) fim de contrato
(até jun/27) com 30+ anos. Aderência calculada entre os CA/posição da A com ≥ 200 min (o corte de 900 tiraria
justamente quem joga pouco), convertida pela reta do B11 (Série A: 48 + 0,28·p); nível do ranking; físico do Portal.
Filtros: sem vetados, valor ≤ € 2 MM, PSV ≥ 27 quando há rastreio, idade ≤ 36. Saídas: listas/SERIE_A_OPORTUNIDADES.md/.csv"""
import os, glob, json, numpy as np, pandas as pd
from _comum import RAIZ, chave, excluidos, caro
import listas as L
from listas_md import tipo_de
L_ = os.path.join(RAIZ, "listas")
ORDEM = ["GOL", "LD", "ZD", "ZE", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]
NOMES = {"GOL": "Goleiro", "LD": "Lateral direito", "ZD": "Zagueiro pela direita", "ZE": "Zagueiro pela esquerda", "LE": "Lateral esquerdo", "VOL": "Volante", "MED": "Médio", "MEI": "Meia", "ED": "Extremo pela direita", "EE": "Extremo pela esquerda", "CA": "Centroavante"}
DEST = {"GOL": ["Save rate, %", "Prevented goals per 90"], "LD": ["Crosses per 90", "xA per 90"], "LE": ["xG per 90", "Touches in box per 90"], "ZD": ["Key passes per 90", "Aerial duels won, %"], "ZE": ["xG per 90", "Aerial duels won, %"],
        "VOL": ["Aerial duels won, %", "Progressive runs per 90"], "MED": ["xA per 90", "Key passes per 90"], "MEI": ["xA per 90", "Touches in box per 90"], "ED": ["Defensive duels won, %", "Key passes per 90"], "EE": ["xG per 90", "Touches in box per 90"], "CA": ["xG per 90", "Aerial duels won, %"]}
ROT = {"Save rate, %": "defesas %", "Prevented goals per 90": "gols evitados/90", "Crosses per 90": "cruz./90", "xA per 90": "xA/90", "xG per 90": "xG/90", "Touches in box per 90": "toques área/90", "Key passes per 90": "passes chave/90", "Aerial duels won, %": "aéreos %", "Progressive runs per 90": "corridas prog./90", "Defensive duels won, %": "duelos def. %"}

def main():
    fora = excluidos()
    f = glob.glob(os.path.join(L.BASES, "wyscout_ligas", "xlsx_ago26", "*Brasil A.xlsx"))[0]
    d = L.corrigir_shift(pd.read_excel(f))
    d = d.rename(columns={"Player": "jogador", "Team within selected timeframe": "clube", "Age": "idade", "Minutes played": "minutos", "Contract expires": "contrato", "Market value": "valor", "Birth country": "nascido_em", "Passport country": "passaporte"})
    d["clube"] = d.clube.fillna(d.Team); d["pos11"] = d.Position.map(L.pos11); d["liga"] = "Brasil A"; d["mercado"] = "Série A"
    for c in ["minutos", "idade", "valor"]: d[c] = pd.to_numeric(d[c], errors="coerce")
    d = d[(d.pos11 != "Outro") & (d.minutos >= 200)].copy()
    d["min_orig"] = d.minutos; d["minutos"] = 900; d = L.aderir(d); d["minutos"] = d.min_orig
    d["adc"] = [L.converter("Série A", a) for a in d.aderencia]
    rk = L.ranking(); d["chave"] = d.jogador.map(chave)
    d = d.merge(rk[["chave", "liga", "pos11", "idade", "nivel_overall"]], on=["chave", "liga", "pos11", "idade"], how="left")
    med = d.groupby("pos11").nivel_overall.transform("median")
    d["nota"] = ((d.adc + d.nivel_overall.fillna(med)) / 2).round(0); d["nota_completa"] = d.nivel_overall.notna()
    ct = pd.to_datetime(d.contrato, errors="coerce"); d["livre"] = ct.isna() | (ct <= "2027-06-30")
    d["grupo"] = np.where(d.minutos <= 1100, "não aproveitado", np.where(d.livre & (d.idade >= 30), "fim de contrato, 30+", ""))
    d = d[d.grupo != ""]
    d = d[[not fora(j, c) for j, c in zip(d.jogador, d.clube)]]; d = d[d.idade <= 36]
    # físico, valor de mercado (Transfermarkt) e faixa salarial (Capology) do Portal
    J = json.load(open(os.path.join(os.path.dirname(RAIZ), "dados", "jogadores.json"), encoding="utf-8")); J = pd.DataFrame(J if isinstance(J, list) else J["jogadores"])
    J = J[J.l == "Brasil A"].copy(); J["chave"] = J.n.map(chave); J["kt"] = J.t.map(chave)
    # casa por nome + clube (dois Bruno Henrique na A); sem clube igual, pelo nome com mais minutos
    Jk = J.assign(k=J.chave + "|" + J.kt).drop_duplicates("k").set_index("k"); Jn = J.sort_values("min", ascending=False).drop_duplicates("chave").set_index("chave")
    d["k"] = d.chave + "|" + d.clube.map(chave)
    def pega(col):
        v = d.k.map(Jk[col]); return v.where(v.notna(), d.chave.map(Jn[col]))
    d["psv"] = pega("psv"); d["spr"] = pega("spr_n"); d["expl"] = pega("expl"); d["sal"] = pega("sal")
    mv = pd.to_numeric(pega("mv"), errors="coerce"); d["valor"] = np.where(d.valor.fillna(0) > 0, d.valor, mv)
    d = d[~caro(d)]
    # salário (Capology, R$/mês): teto da faixa até R$ 600 mil — acima disso nem com divisão de salário
    def sal_max(v):
        if not isinstance(v, str) or "-" not in v: return np.nan
        t = v.split("-")[-1].strip().upper().replace(",", ".")
        return float(t[:-1]) * (1e6 if t.endswith("M") else 1e3) if t[-1] in "KM" else np.nan
    d["sal_max"] = d.sal.map(sal_max)
    d = d[d.sal_max.isna() | (d.sal_max <= 800_000)]
    d = d[d.psv.isna() | (d.psv >= 27) | (d.pos11 == "GOL")]
    d["tipo"] = [tipo_de(j, c) for j, c in zip(d.jogador, d.clube)]
    d = d.sort_values(["pos11", "nota"], ascending=[True, False])
    f_ = lambda v, c=0: "—" if pd.isna(v) else f"{v:.{c}f}".replace(".", ",")
    dt = lambda c: (str(c)[8:10] + "/" + str(c)[5:7] + "/" + str(c)[2:4]) if isinstance(c, str) and len(c) >= 10 else "—"
    md = ["# Série A — não aproveitados e fim de contrato que servem à Série B", "",
          "*Dado: Wyscout ago/26 (Série A 2026, ≥ 200 min), ranking do Portal, físico do Portal · 26/09/2026. A Série A está fora das recomendações por decisão do clube (23/09); esta é a lista de exceção, para as posições em que a B e os mercados de fora não fecham.*", "",
          "Dois grupos: **não aproveitado** (200 a 1.100 min em 2026 — reserva ou saiu do time: empréstimo em janeiro) e **fim de contrato, 30+** (contrato até jun/27 e 30 anos ou mais — chega livre). "
          "Aderência calculada entre os jogadores da A da posição com ≥ 200 min e convertida pela reta do B11 (quem vem da A chega acima da mediana da B: p50 → 62); nota = média com o nível do ranking (\\* = nível imputado). "
          "Filtros: sem vetados, valor ≤ € 2 MM, faixa salarial (Capology) com teto até R$ 800 mil/mês (empréstimo com divisão de salário; a faixa aparece na tabela para o clube decidir), PSV-99 ≥ 27 quando há rastreio, até 36 anos. **O que o B2-6 manda lembrar:** gols e conversão do passado não repetem; volume (toques na área, aéreos, passes chave) repete — as duas colunas de destaque são de volume.", ""]
    for p in ORDEM:
        x = d[d.pos11 == p].head(10)
        if x.empty: continue
        de = DEST[p]
        md += [f"### {NOMES[p]}", "", f"| # | Jogador | Clube | Idade | Min 2026 | Contrato | Grupo | Nota | Ader. (A → B) | Nível | PSV | Tipo | Valor | Salário (Capology) | {ROT[de[0]]} | {ROT[de[1]]} |", "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
        for i, r in enumerate(x.itertuples(), 1):
            md.append(f"| {i} | **{r.jogador}** | {r.clube} | {int(r.idade)} | {int(r.minutos)} | {dt(r.contrato)} | {r.grupo} | **{f_(r.nota)}**{'' if r.nota_completa else ' *'} | {f_(r.aderencia)} → {f_(r.adc)} | {f_(r.nivel_overall)} | {f_(r.psv, 1)} | {r.tipo} | {('€ ' + f_(r.valor / 1e6, 1) + ' MM') if pd.notna(r.valor) and r.valor > 0 else '—'} | {r.sal if isinstance(r.sal, str) else '—'} | {f_(getattr(r, '_' + str(list(x.columns).index(de[0]) + 1)), 2)} | {f_(getattr(r, '_' + str(list(x.columns).index(de[1]) + 1)), 2)} |")
        md.append("")
    open(os.path.join(L_, "SERIE_A_OPORTUNIDADES.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    d[["pos11", "jogador", "clube", "idade", "minutos", "contrato", "livre", "grupo", "valor", "aderencia", "adc", "nivel_overall", "nota", "psv", "tipo", "sal"]].to_csv(os.path.join(L_, "SERIE_A_OPORTUNIDADES.csv"), index=False)
    print(d.groupby(["pos11", "grupo"]).size().unstack().fillna(0).astype(int))
    print(d.groupby("pos11").head(3)[["pos11", "jogador", "clube", "idade", "minutos", "contrato", "grupo", "nota", "adc", "nivel_overall", "psv"]].to_string(index=False))

if __name__ == "__main__":
    main()
