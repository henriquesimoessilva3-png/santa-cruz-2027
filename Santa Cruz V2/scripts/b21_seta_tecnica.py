"""b21 (18/10/2026) — A SETA TÉCNICA NOVA, pronta para o app (visão nova): nota por grupo.

Aprovado pelo Henrique em 18/10 ("pode aplicar essa nova visão sim, mas aí deixa a explicação também"), depois do b20
e da conferência do volante: a participação em gols FICA, porque sobrevive a time igual.

O que a seta passa a ser (só técnico — o físico está na letra; os dois se juntam no farol):
  1. Os 36 indicadores técnicos que o app tem na ficha (os mesmos da aba Subida, sem os 4 em que o Wyscout mudou o
     critério), em QUATRO GRUPOS — os do ranking do Botafogo: Defensivo · Passe · Ofensivo · Participação em gols.
  2. Régua: titulares da Série B 2022–2025 (≥ 900 min). Posições gêmeas JUNTAS (decisão de 07/10: régua comum) —
     7 réguas: laterais, zagueiros, volante, médio, meia, extremos, centroavante. Cada indicador vira desvio (z) dentro
     do ano e da régua; "menor é melhor" (faltas, cartões) troca o sinal; o z é limitado a ±2,5 para o raro não mandar.
  3. A TIME IGUAL: de cada indicador tira-se a parte que o time explica (ataque, passe e participação contra o xG e a
     posse do time; defesa contra os duelos defensivos ganhos e o PPDA do time). ESCOLHA e PESO usam o que sobra.
  4. Entra na nota o indicador que separa quem sobe de quem cai em 0,30 desvio ou mais (a régua de sempre) E que ainda
     separa a time igual em 0,20 ou mais — o que sobra é do jogador; o peso dele é essa separação a time igual.
     Testado em 18/10 (um ano de fora por vez): com os 36 da ficha, exigir 0,30 a time igual deixa 1 a 3 indicadores no
     lateral, no extremo e no centroavante e a seta piora (AUC 0,61); 0,30 bruto + 0,20 a time igual dá 0,64, igual à
     seta de hoje (0,65) — a seta nova NÃO prevê melhor; ganha em leitura (quatro grupos, pesos do dado, a time igual).
     Zagueiro: decisão do clube (09/10) mantida — a defesa entra à força (duelos aéreos, duelos defensivos,
     interceptações, finalizações bloqueadas) e, do ataque, só passes para a área, xG e gols. Custa previsão (0,62 contra
     0,70 sem a regra), e o clube sabe.
  5. Nota = média dos z de cada grupo, pesada pela separação do grupo (soma das separações a time igual dos que entram).
     Grupo sem dado não entra (os pesos se redistribuem). ▲ = nota no nível do titular de quem sobe (acima da mediana
     deles) · ▼ = no nível de quem cai (abaixo da mediana deles) · ↔ = entre as duas · ? = menos de 60% dos indicadores medidos.
  6. No app, o z do jogador é contra a Série B 2025–2026 (≥ 900 min, por régua): a Série B de hoje, no critério atual.
  7. Prova: um ano de fora por vez (AUC), a nota por grupo contra a regra de hoje (3 por bloco, mínimo = mediana de quem sobe).

Saídas: static/tecnico_grupos_dados.js (o app lê), resultados/b21/{indicadores,grupos,auc}.csv e B21.md.
"""
import os, sys, json, datetime, warnings
import numpy as np, pandas as pd
warnings.filterwarnings("ignore")
from sklearn.metrics import roc_auc_score
A = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(A); RAIZ = os.path.dirname(R)
RES = os.path.join(R, "resultados"); OUT = os.path.join(RES, "b21"); os.makedirs(OUT, exist_ok=True)
sys.path.insert(0, A); sys.path.insert(0, RAIZ)
from _comum import tecnico
from listas import pos11
import gerar_caracteristicas_js as C

ORDEM = ["LD", "ZD", "ZE", "LE", "VOL", "MED", "MEI", "ED", "EE", "CA"]
NOME = {"LD": "Lateral direito", "ZD": "Zagueiro direito", "ZE": "Zagueiro esquerdo", "LE": "Lateral esquerdo", "VOL": "Volante",
        "MED": "Médio", "MEI": "Meia", "ED": "Extremo direito", "EE": "Extremo esquerdo", "CA": "Centroavante"}
REGUA = {"LD": "LAT", "LE": "LAT", "ZD": "ZAG", "ZE": "ZAG", "VOL": "VOL", "MED": "MED", "MEI": "MEI", "ED": "EXT", "EE": "EXT", "CA": "CA"}
REGUAS = [("LAT", "Laterais", ["LD", "LE"]), ("ZAG", "Zagueiros", ["ZD", "ZE"]), ("VOL", "Volante", ["VOL"]), ("MED", "Médio", ["MED"]),
          ("MEI", "Meia", ["MEI"]), ("EXT", "Extremos", ["ED", "EE"]), ("CA", "Centroavante", ["CA"])]
GRUPOS = ["Defensivo", "Passe", "Ofensivo", "Participação em gols"]
# grupo de cada indicador do app (rótulo da aba Subida / ficha) — os grupos do ranking do Botafogo
GRUPO_DE = {
    "Duelos ganhos %": "Defensivo", "Duelos defensivos ganhos %": "Defensivo", "Duelos aéreos ganhos %": "Defensivo",
    "Interceptações (ajustadas à posse)": "Defensivo", "Carrinhos (ajustados à posse)": "Defensivo", "Finalizações bloqueadas por 90": "Defensivo",
    "Faltas por 90": "Defensivo", "Cartões amarelos por 90": "Defensivo",
    "Duelos por 90": "Defensivo", "Duelos defensivos por 90": "Defensivo", "Duelos aéreos por 90": "Defensivo", "Ações defensivas certas por 90": "Defensivo",
    "Passes por 90": "Passe", "Passes certos %": "Passe", "Passes para frente por 90": "Passe", "Passes para frente certos %": "Passe",
    "Passes progressivos por 90": "Passe", "Passes progressivos certos %": "Passe", "Passes ao terço final por 90": "Passe", "Passes ao terço final certos %": "Passe",
    "Passes longos por 90": "Passe", "Passes longos certos %": "Passe", "Passes-chave por 90": "Passe", "Passes para a área por 90": "Passe",
    "Cruzamentos por 90": "Passe", "Cruzamentos certos %": "Passe",
    "Finalizações por 90": "Ofensivo", "Finalizações no gol %": "Ofensivo", "Toques na área por 90": "Ofensivo", "Dribles por 90": "Ofensivo",
    "Dribles certos %": "Ofensivo", "Duelos ofensivos ganhos %": "Ofensivo", "Conduções progressivas por 90": "Ofensivo", "Passes recebidos por 90": "Ofensivo",
    "Faltas sofridas por 90": "Ofensivo",
    "Gols por 90": "Participação em gols", "xG por 90": "Participação em gols", "Gols de cabeça por 90": "Participação em gols",
    "Assistências por 90": "Participação em gols", "xA por 90": "Participação em gols",
}
SEM_CONTA = {"Duelos por 90", "Duelos defensivos por 90", "Duelos aéreos por 90", "Ações defensivas certas por 90"}   # o Wyscout mudou o critério
# zagueiro (decisão do clube, 09/10): defesa à força; do bloco de ataque da ficha só estes três
CLUBE_DEF = ["Duelos aéreos ganhos %", "Duelos defensivos ganhos %", "Interceptações (ajustadas à posse)", "Finalizações bloqueadas por 90"]
CLUBE_ATQ = {"Passes para a área por 90", "xG por 90", "Gols por 90"}
CORTE, CORTE_T, ZMAX, MIN, ANOS, REF_ANOS = 0.30, 0.20, 2.5, 900, (2022, 2023, 2024, 2025), (2025, 2026)

# os indicadores do app, na ordem da aba Subida (k = índice em SUBIDA.inds; os 8 físicos vêm antes)
IND = []
k = 8
for cat, defs in (("pas", C.PASSE), ("atq", C.ATAQUE), ("def", C.DEFESA)):
    for rot, col, casas, menor in defs:
        IND.append({"k": k, "rot": rot, "col": col, "cat": cat, "casas": casas, "menor": bool(menor), "g": GRUPO_DE[rot], "nm": rot in SEM_CONTA}); k += 1
COLS = [i["col"] for i in IND]

# ---------- base ----------
TI = pd.read_csv(os.path.join(RES, "b2", "time_indicadores.csv"))
TI["xg_j"] = TI.xg / TI.jogos.replace(0, np.nan) if TI.xg.max() > 5 else TI.xg
for c in ["xg_j", "posse", "passes", "duel_def_pct", "ppda"]:
    TI["tz_" + c] = TI.groupby("ano")[c].transform(lambda x: (x - x.mean()) / x.std())
TIME = {"Defensivo": ["tz_duel_def_pct", "tz_ppda"], "Passe": ["tz_xg_j", "tz_posse", "tz_passes"], "Ofensivo": ["tz_xg_j", "tz_posse"], "Participação em gols": ["tz_xg_j", "tz_posse"]}
ti = TI[["ano", "clube", "faixa", "tz_xg_j", "tz_posse", "tz_passes", "tz_duel_def_pct", "tz_ppda"]]
T0 = tecnico(); T0["pos11"] = T0.posicao.map(pos11); T0 = T0[T0.pos11.isin(ORDEM) & (T0.minutos >= MIN)].copy(); T0["regua"] = T0.pos11.map(REGUA)
for c in COLS: T0[c] = pd.to_numeric(T0[c], errors="coerce")
T = T0[T0.ano.isin(ANOS)].merge(ti, on=["ano", "clube"], how="left"); T = T[T.faixa.notna()].reset_index(drop=True)

def zcol(df, col, menor, por):
    z = df[col].groupby(por).transform(lambda s: (s - s.mean()) / s.std())
    return (-z if menor else z).clip(-ZMAX, ZMAX)
Z = pd.DataFrame(index=T.index)
for i in IND: Z[i["col"]] = zcol(T, i["col"], i["menor"], [T.ano, T.regua])
Z["faixa"], Z["regua"], Z["ano"] = T.faixa, T.regua, T.ano
# a time igual
ZT = Z.copy()
for i in IND:
    tcols = TIME[i["g"]]
    for rg, _, _ in REGUAS:
        m = (Z.regua == rg) & Z[i["col"]].notna() & T[tcols].notna().all(axis=1)
        if m.sum() < 40: continue
        X = np.c_[np.ones(m.sum()), T.loc[m, tcols].values]; b, *_ = np.linalg.lstsq(X, Z.loc[m, i["col"]].values, rcond=None)
        ZT.loc[m, i["col"]] = (Z.loc[m, i["col"]].values - (X @ b - b[0])).clip(-ZMAX, ZMAX)

def sep(df, col):
    s, c = df[df.faixa == "Sobe"][col].dropna(), df[df.faixa == "Cai"][col].dropna()
    return np.nan if len(s) < 8 or len(c) < 8 else s.mean() - c.mean()

# ---------- escolha por régua (com um conjunto de anos: tudo, ou o treino do teste) ----------
def escolher(anos, clube=True):
    z, zt = Z[Z.ano.isin(anos)], ZT[ZT.ano.isin(anos)]
    out = {}
    for rg, nome, _ in REGUAS:
        g, gt = z[z.regua == rg], zt[zt.regua == rg]
        entra, fora = [], []
        for i in IND:
            d, dt = sep(g, i["col"]), sep(gt, i["col"])
            item = {"k": i["k"], "rot": i["rot"], "g": i["g"], "sep": None if pd.isna(d) else round(float(d), 2), "sepT": None if pd.isna(dt) else round(float(dt), 2)}
            if i["nm"]: fora.append(dict(item, motivo="critério mudou")); continue
            if clube and rg == "ZAG" and i["rot"] in CLUBE_DEF:
                entra.append(dict(item, w=round(max(CORTE, 0 if pd.isna(dt) else float(dt)), 2), clube=True)); continue
            if clube and rg == "ZAG" and i["cat"] == "atq" and i["rot"] not in CLUBE_ATQ: fora.append(dict(item, motivo="clube")); continue
            if pd.isna(d) or pd.isna(dt): fora.append(dict(item, motivo="sem dado")); continue
            if d <= -CORTE: fora.append(dict(item, motivo="estilo")); continue
            if d >= CORTE and dt >= CORTE_T: entra.append(dict(item, w=round(float(dt), 2)))
            elif d >= CORTE: fora.append(dict(item, motivo="do time"))
            else: fora.append(dict(item, motivo="não separa"))
        pesos = {gname: round(sum(e["w"] for e in entra if e["g"] == gname), 2) for gname in GRUPOS}
        out[rg] = {"nome": nome, "entra": entra, "fora": fora, "pesos": pesos}
    return out

def nota(df, regra):
    """média dos z de cada grupo, pesada pela separação do grupo; grupo sem dado fica fora (pesos redistribuídos)"""
    s = pd.Series(0.0, index=df.index); wt = pd.Series(0.0, index=df.index)
    for gname in GRUPOS:
        cols = [e["col"] for e in regra if e["g"] == gname]; w = sum(e["w"] for e in regra if e["g"] == gname)
        if not cols or w <= 0: continue
        m = df[cols].mean(axis=1)
        ok = m.notna(); s[ok] += m[ok] * w; wt[ok] += w
    return (s / wt.replace(0, np.nan))

COL_DE = {i["rot"]: i["col"] for i in IND}
def com_col(entra): return [dict(e, col=COL_DE[e["rot"]]) for e in entra]

# ---------- a regra final (todos os anos) ----------
FINAL = escolher(ANOS)
for rg, nome, _ in REGUAS:
    reg = com_col(FINAL[rg]["entra"]); g = Z[Z.regua == rg]
    n = nota(g, reg)
    cv, cr = float(n[g.faixa == "Sobe"].median()), float(n[g.faixa == "Cai"].median())
    FINAL[rg]["cortes"] = {"v": round(cv, 3), "r": round(cr, 3)}
    FINAL[rg]["n"] = {f: int((g.faixa == f).sum()) for f in ("Sobe", "Meio", "Cai")}
    def seta(x): return "v" if x >= cv else ("r" if x <= cr else "a")
    FINAL[rg]["dist"] = {f: {s: int(sum(seta(x) == s for x in n[g.faixa == f].dropna())) for s in "var"} for f in ("Sobe", "Meio", "Cai")}
    FINAL[rg]["dist"]["Todos"] = {s: int(sum(seta(x) == s for x in n.dropna())) for s in "var"}
    # referência do app: Série B 2025–2026, média e desvio por régua, no valor cru
    ref = T0[T0.ano.isin(REF_ANOS) & (T0.regua == rg)]
    FINAL[rg]["ref_n"] = int(len(ref))
    for e in FINAL[rg]["entra"]:
        v = ref[COL_DE[e["rot"]]].dropna(); e["mu"] = round(float(v.mean()), 3); e["sd"] = round(float(v.std()), 3) or 0.001
        e["menor"] = bool(next(i for i in IND if i["rot"] == e["rot"])["menor"])

# ---------- prova: um ano de fora por vez ----------
D = Z[Z.faixa.isin(["Sobe", "Cai"])].copy(); D["y"] = (D.faixa == "Sobe").astype(int)
BLOCO = {i["rot"]: i["cat"] for i in IND}
def regra_hoje(anos, rg):
    """a seta de hoje (só técnico): 3 por bloco (passe, ataque, defesa) pela separação BRUTA ≥ 0,30, mínimo = mediana de quem sobe (z)"""
    g = Z[Z.ano.isin(anos) & (Z.regua == rg)]; cand = []
    for i in IND:
        if i["nm"]: continue
        d = sep(g, i["col"])
        if pd.isna(d) or d < CORTE: continue
        cand.append((i["col"], d, i["cat"]))
    out = []
    for b in ("pas", "atq", "def"): out += sorted([c for c in cand if c[2] == b], key=lambda c: -c[1])[:3]
    med = g[g.faixa == "Sobe"]
    return [(c[0], float(med[c[0]].median())) for c in out]
def nota_hoje(df, regra):
    if not regra: return pd.Series(np.nan, index=df.index)
    ok = pd.DataFrame({c: (df[c] >= m).astype(float).where(df[c].notna()) for c, m in regra}); return ok.mean(axis=1)
res = []
for rot, modo in (("Seta de hoje — 3 por bloco, mínimo = mediana de quem sobe", "hoje"), ("Nota por grupo (a seta nova)", "grupo"), ("Nota por grupo, pesos iguais", "igual"), ("Nota por grupo sem a regra do clube (zagueiro)", "semclube")):
    aucs, por = [], {rg: [] for rg, _, _ in REGUAS}
    for ano in ANOS:
        tr = [a for a in ANOS if a != ano]; te = D[D.ano == ano]; pred = pd.Series(np.nan, index=te.index)
        esc = escolher(tr, modo != "semclube") if modo != "hoje" else None
        for rg, _, _ in REGUAS:
            m = te.regua == rg
            if not m.any(): continue
            if modo == "hoje": pred[m] = nota_hoje(te[m], regra_hoje(tr, rg))
            else:
                reg = com_col(esc[rg]["entra"])
                if modo == "igual": reg = [dict(e, w=1.0) for e in reg]
                pred[m] = nota(te[m], reg)
        ok = pred.notna()
        if te[ok].y.nunique() == 2: aucs.append(roc_auc_score(te[ok].y, pred[ok]))
        for rg, _, _ in REGUAS:
            mm = ok & (te.regua == rg)
            if mm.sum() >= 16 and te[mm].y.nunique() == 2: por[rg].append(roc_auc_score(te[mm].y, pred[mm]))
    res.append({"regra": rot, "auc": round(float(np.mean(aucs)), 3), **{rg: (round(float(np.mean(v)), 2) if v else None) for rg, v in por.items()}})
AUC = pd.DataFrame(res); AUC.to_csv(os.path.join(OUT, "auc.csv"), index=False)

# ---------- saídas ----------
rows = []
for rg, nome, _ in REGUAS:
    for e in FINAL[rg]["entra"]: rows.append({"regua": rg, "posicao": nome, "entra": 1, "grupo": e["g"], "indicador": e["rot"], "sep": e["sep"], "sep_time_igual": e["sepT"], "peso": e["w"], "motivo": "clube" if e.get("clube") else ""})
    for f in FINAL[rg]["fora"]: rows.append({"regua": rg, "posicao": nome, "entra": 0, "grupo": f["g"], "indicador": f["rot"], "sep": f["sep"], "sep_time_igual": f["sepT"], "peso": None, "motivo": f["motivo"]})
pd.DataFrame(rows).to_csv(os.path.join(OUT, "indicadores.csv"), index=False)
pd.DataFrame([{"regua": rg, "posicao": FINAL[rg]["nome"], **{g + "_n": sum(1 for e in FINAL[rg]["entra"] if e["g"] == g) for g in GRUPOS},
               **{g + "_peso": FINAL[rg]["pesos"][g] for g in GRUPOS}, **{"corte_v": FINAL[rg]["cortes"]["v"], "corte_r": FINAL[rg]["cortes"]["r"]}} for rg, _, _ in REGUAS]).to_csv(os.path.join(OUT, "grupos.csv"), index=False)

dados = {"gerado_em": datetime.date.today().isoformat(), "anos": list(ANOS), "ref_anos": list(REF_ANOS), "min": MIN, "corte": CORTE, "corte_t": CORTE_T, "zmax": ZMAX,
         "grupos": GRUPOS, "regua_de": REGUA, "ordem": [rg for rg, _, _ in REGUAS], "posicoes_da_regua": {rg: ps for rg, _, ps in REGUAS},
         "reguas": {rg: FINAL[rg] for rg, _, _ in REGUAS}, "auc": res}
with open(os.path.join(RAIZ, "static", "tecnico_grupos_dados.js"), "w", encoding="utf-8") as fh:
    fh.write("/* GERADO POR Santa Cruz V2/scripts/b21_seta_tecnica.py - NAO EDITE A MAO. A seta técnica nova (visão nova): nota por grupo. */\n")
    fh.write("window.TECNICO_GRUPOS = " + json.dumps(dados, ensure_ascii=False, separators=(",", ":")) + ";\n")

f2 = lambda v: "—" if v is None or (isinstance(v, float) and pd.isna(v)) else ("+" if v > 0 else "") + f"{v:.2f}".replace(".", ",")
md = ["# A seta técnica nova — nota por grupo (b21)", "",
      f"*18/10/2026 · titulares da Série B 2022–2025 (≥ 900 min, Wyscout), posições gêmeas juntas · só técnico · a referência do app é a Série B {REF_ANOS[0]}–{REF_ANOS[1]}.*", "",
      "## Como a seta é calculada", "",
      "1. Os **36** indicadores técnicos da ficha, em quatro grupos (os do ranking do Botafogo): Defensivo · Passe · Ofensivo · Participação em gols.",
      "2. Cada indicador vira desvio (z) dentro do ano e da régua; faltas e cartões trocam o sinal; z limitado a ±2,5.",
      "3. **A time igual**: tira-se de cada indicador a parte que o time explica. A escolha e os pesos usam o que sobra.",
      "4. Entra quem separa quem sobe de quem cai em **0,30** desvio ou mais E ainda separa a time igual em **0,20** ou mais; o peso é a separação a time igual. Zagueiro: defesa à força e só passes para a área, xG e gols do ataque (decisão do clube).",
      "5. Nota = média dos z de cada grupo, pesada pela soma das separações do grupo. ▲ acima da mediana de quem sobe · ▼ abaixo da mediana de quem cai · ↔ entre as duas.", "",
      "## Quanto cada grupo pesa, por régua", "", "| Régua | n (sobe · meio · cai) | " + " | ".join(GRUPOS) + " | corte ▲ | corte ▼ | titulares ▲ · ↔ · ▼ |", "|---|---|" + "---|" * (len(GRUPOS) + 3)]
for rg, nome, _ in REGUAS:
    F = FINAL[rg]; tot = sum(F["pesos"].values()) or 1
    cel = lambda g: f"**{sum(1 for e in F['entra'] if e['g'] == g)}** ind · **{round(100 * F['pesos'][g] / tot)}%**"
    dt = F["dist"]["Todos"]
    md.append(f"| {nome} | {F['n']['Sobe']} · {F['n']['Meio']} · {F['n']['Cai']} | " + " | ".join(cel(g) for g in GRUPOS) + f" | {f2(F['cortes']['v'])} | {f2(F['cortes']['r'])} | {dt['v']} · {dt['a']} · {dt['r']} |")
md += ["", "## O que entra e o que fica de fora, régua a régua", "", "Entre parênteses: separação a time igual (bruta). *do time* = separa 0,30 bruto, mas a time igual fica abaixo de 0,20 · *estilo* = quem sobe tem menos · *não separa* = abaixo de 0,30 · *critério mudou* = o Wyscout mudou a conta · *clube* = fora por decisão do clube (zagueiro).", ""]
for rg, nome, _ in REGUAS:
    F = FINAL[rg]; md.append(f"### {nome} — **{len(F['entra'])}** entram, **{len(F['fora'])}** ficam fora"); md.append("")
    for g in GRUPOS:
        e = [x for x in F["entra"] if x["g"] == g]
        md.append(f"- **{g}** ({len(e)}): " + (" · ".join(f"{x['rot']} **{f2(x['sepT'])}** ({f2(x['sep'])})" + (" *clube*" if x.get("clube") else "") for x in e) if e else "nenhum"))
    por = {}
    for x in F["fora"]: por.setdefault(x["motivo"], []).append(x)
    for mot in ("do time", "estilo", "não separa", "critério mudou", "clube", "sem dado"):
        if mot in por: md.append(f"- Fora, *{mot}* ({len(por[mot])}): " + " · ".join(f"{x['rot']} ({f2(x['sepT'])} / {f2(x['sep'])})" for x in por[mot]))
    md.append("")
md += ["## Prova: um ano de fora por vez (AUC — 0,50 é moeda)", "", "| Regra | AUC | " + " | ".join(n for _, n, _ in REGUAS) + " |", "|---|---|" + "---|" * len(REGUAS)]
for r in res: md.append(f"| {r['regra']} | **{str(r['auc']).replace('.', ',')}** | " + " | ".join("—" if r[rg] is None else str(r[rg]).replace(".", ",") for rg, _, _ in REGUAS) + " |")
open(os.path.join(OUT, "B21.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
print("\n".join(md[md.index("## Quanto cada grupo pesa, por régua"):md.index("## O que entra e o que fica de fora, régua a régua")]))
print("\n".join(md[md.index("## Prova: um ano de fora por vez (AUC — 0,50 é moeda)"):]))
for rg, nome, _ in REGUAS: print(nome, "entra:", [(e["rot"], e["w"]) for e in FINAL[rg]["entra"]])
