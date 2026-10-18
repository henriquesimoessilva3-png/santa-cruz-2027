"""b22 (18/10/2026) — A SETA TÉCNICA POR CONTAGEM (visão nova), pedido do Henrique:
  - "centroavante só ficou com três": mais fundamentais — entra quem separa quem sobe de quem cai em 0,15 desvio ou mais
    (sem o filtro "a time igual"; o zagueiro mantém a defesa à força, decisão do clube de 09/10). Escolhido por ele entre
    0,30+0,20 · 0,20+0,10 · 0,20 · 0,15 depois do teste (b22_teste_cortes.py): a previsão quase não muda (AUC 0,63–0,65).
  - "contar os indicadores acima ou abaixo é melhor do que essa nota": cada fundamental vira uma cor contra a mediana do
    titular de quem SOBE na posição (Série B 2022–2025, ≥ 900 min): verde = no nível de quem sobe ou acima · amarelo = até
    10% abaixo · vermelho = mais de 10% abaixo (em faltas e cartões, "abaixo" = acima). Pontos = (verdes − vermelhos) ÷ medidos.
    ▲ = pontos a partir da mediana dos titulares de quem sobe · ▼ = até a mediana dos de quem cai · ↔ entre os dois.
  - Grupo único: os grupos ficam só como rótulo. A nota z do b21 continua calculada (só no detalhe).
Saídas: static/tecnico_grupos_dados.js (o app lê; mesmo formato do b21 + modo "conta") e resultados/b22/{indicadores,auc}.csv, B22.md."""
import os, json, datetime
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "b21_seta_tecnica.py"), encoding="utf-8").read()
exec(compile(src.split("# ---------- a regra final")[0], "b21", "exec"))
CORTE, CORTE_T, PERTO = 0.15, -99, 0.10
OUT2 = os.path.join(RES, "b22"); os.makedirs(OUT2, exist_ok=True)
RAW = T  # valores crus, mesmas linhas de Z
FORC = {"ZAG": set(CLUBE_DEF)}

def medianas(anos):
    m = {}
    for p in ORDEM:
        g = RAW[RAW.ano.isin(anos) & (RAW.pos11 == p)]
        for i in IND:
            s, c = g[g.faixa == "Sobe"][i["col"]].median(), g[g.faixa == "Cai"][i["col"]].median()
            if pd.isna(s) or pd.isna(c): continue
            if REGUA[p] == "ZAG" and i["rot"] in FORC["ZAG"]: s = min(s, c) if i["menor"] else max(s, c)
            m[(p, i["k"])] = (float(s), float(c))
    return m

def cor(v, s, menor):
    if pd.isna(v): return None
    if menor: return 1 if v <= s else (0 if v <= s * (1 + PERTO) else -1)
    return 1 if v >= s else (0 if v >= s * (1 - PERTO) else -1)

def pontos(df, esc, med):
    out = pd.Series(np.nan, index=df.index)
    for idx, r in df.iterrows():
        ks = esc[REGUA[r.pos11]]["entra"]; vs = []
        for e in ks:
            i = next(x for x in IND if x["k"] == e["k"]); mm = med.get((r.pos11, e["k"]))
            if not mm: continue
            c = cor(r[i["col"]], mm[0], i["menor"])
            if c is not None: vs.append(c)
        if len(vs) >= min(4, len(ks)): out[idx] = sum(vs) / len(vs)
    return out

# regra final (todos os anos)
FINAL = escolher(ANOS); MED = medianas(ANOS)
Tsc = RAW[RAW.faixa.isin(["Sobe", "Meio", "Cai"])]
P_ALL = pontos(Tsc, FINAL, MED)
for rg, nome, ps in REGUAS:
    m = Tsc.pos11.isin(ps); p = P_ALL[m]
    cv, cr = float(p[Tsc.faixa[m] == "Sobe"].median()), float(p[Tsc.faixa[m] == "Cai"].median())
    if cr >= cv: cr = cv - 0.01
    FINAL[rg]["cortes"] = {"v": round(cv, 3), "r": round(cr, 3)}
    FINAL[rg]["n"] = {f: int((Tsc.faixa[m] == f).sum()) for f in ("Sobe", "Meio", "Cai")}
    seta = lambda x: "v" if x >= cv else ("r" if x <= cr else "a")
    FINAL[rg]["dist"] = {f: {s: int(sum(seta(x) == s for x in p[Tsc.faixa[m] == f].dropna())) for s in "var"} for f in ("Sobe", "Meio", "Cai")}
    FINAL[rg]["dist"]["Todos"] = {s: int(sum(seta(x) == s for x in p.dropna())) for s in "var"}
    ref = T0[T0.ano.isin(REF_ANOS) & (T0.regua == rg)]; FINAL[rg]["ref_n"] = int(len(ref))
    for e in FINAL[rg]["entra"]:
        v = ref[COL_DE[e["rot"]]].dropna(); e["mu"] = round(float(v.mean()), 3); e["sd"] = round(float(v.std()), 3) or 0.001
        e["menor"] = bool(next(i for i in IND if i["rot"] == e["rot"])["menor"])
    FINAL[rg]["pesos"] = {g: round(sum(e["w"] for e in FINAL[rg]["entra"] if e["g"] == g), 2) for g in GRUPOS}

# prova: um ano de fora por vez
res = []; aucs = []; por = {rg: [] for rg, _, _ in REGUAS}
for ano in ANOS:
    tr = [a for a in ANOS if a != ano]; esc = escolher(tr); med = medianas(tr)
    te = RAW[(RAW.ano == ano) & RAW.faixa.isin(["Sobe", "Cai"])]; y = (te.faixa == "Sobe").astype(int); pr = pontos(te, esc, med); ok = pr.notna()
    aucs.append(roc_auc_score(y[ok], pr[ok]))
    for rg, _, ps in REGUAS:
        mm = ok & te.pos11.isin(ps)
        if mm.sum() >= 16 and y[mm].nunique() == 2: por[rg].append(roc_auc_score(y[mm], pr[mm]))
res.append({"regra": "Contagem (a seta nova) — corte 0,15, verde/amarelo 10%/vermelho", "auc": round(float(np.mean(aucs)), 3), **{rg: (round(float(np.mean(v)), 2) if v else None) for rg, v in por.items()}})
try:
    old = pd.read_csv(os.path.join(RES, "b21", "auc.csv")).to_dict("records")
    for r in old: r["regra"] = "b21 · " + r["regra"]; res.append({k: (None if isinstance(v, float) and pd.isna(v) else v) for k, v in r.items()})
except Exception: pass
pd.DataFrame(res).to_csv(os.path.join(OUT2, "auc.csv"), index=False)

rows = []
for rg, nome, _ in REGUAS:
    for e in FINAL[rg]["entra"]: rows.append({"regua": rg, "posicao": nome, "entra": 1, "grupo": e["g"], "indicador": e["rot"], "sep": e["sep"], "motivo": "clube" if e.get("clube") else ""})
    for f in FINAL[rg]["fora"]: rows.append({"regua": rg, "posicao": nome, "entra": 0, "grupo": f["g"], "indicador": f["rot"], "sep": f["sep"], "motivo": f["motivo"]})
pd.DataFrame(rows).to_csv(os.path.join(OUT2, "indicadores.csv"), index=False)

dados = {"gerado_em": datetime.date.today().isoformat(), "modo": "conta", "perto": PERTO, "anos": list(ANOS), "ref_anos": list(REF_ANOS), "min": MIN, "corte": CORTE, "corte_t": None, "zmax": ZMAX,
         "grupos": GRUPOS, "regua_de": REGUA, "ordem": [rg for rg, _, _ in REGUAS], "posicoes_da_regua": {rg: ps for rg, _, ps in REGUAS},
         "reguas": {rg: FINAL[rg] for rg, _, _ in REGUAS}, "auc": res}
with open(os.path.join(RAIZ, "static", "tecnico_grupos_dados.js"), "w", encoding="utf-8") as fh:
    fh.write("/* GERADO POR Santa Cruz V2/scripts/b22_seta_contagem.py - NAO EDITE A MAO. A seta técnica da visão nova: contagem dos fundamentais. */\n")
    fh.write("window.TECNICO_GRUPOS = " + json.dumps(dados, ensure_ascii=False, separators=(",", ":")) + ";\n")

md = ["# A seta técnica por contagem (b22)", "", f"*18/10/2026 · titulares da Série B 2022–2025 (≥ 900 min, Wyscout).*", "",
      "Fundamental = separa quem sobe de quem cai em **0,15** desvio ou mais (zagueiro: defesa à força). Cada um vira cor contra a mediana de quem sobe na posição: verde no nível ou acima · amarelo até **10%** abaixo · vermelho mais que isso. Pontos = (verdes − vermelhos) ÷ medidos; ▲ a partir da mediana de quem sobe, ▼ até a de quem cai.", "",
      "| Régua | fundamentais | corte ▲ | corte ▼ | titulares ▲ · ↔ · ▼ |", "|---|---|---|---|---|"]
for rg, nome, _ in REGUAS:
    F = FINAL[rg]; d = F["dist"]["Todos"]
    md.append(f"| {nome} | **{len(F['entra'])}** | {F['cortes']['v']:+.2f} | {F['cortes']['r']:+.2f} | {d['v']} · {d['a']} · {d['r']} |".replace(".", ","))
md += ["", "## Fundamentais por régua", ""]
for rg, nome, _ in REGUAS: md.append(f"- **{nome}** ({len(FINAL[rg]['entra'])}): " + " · ".join(e["rot"] for e in sorted(FINAL[rg]["entra"], key=lambda e: -(e["sep"] or 0))))
md += ["", "## Prova (um ano de fora por vez, AUC)", "", "| Regra | AUC | " + " | ".join(n for _, n, _ in REGUAS) + " |", "|---|---|" + "---|" * len(REGUAS)]
for r in res: md.append(f"| {r['regra']} | **{r['auc']}** | " + " | ".join("—" if r.get(rg) is None else str(r[rg]) for rg, _, _ in REGUAS) + " |")
open(os.path.join(OUT2, "B22.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
print("\n".join(md))
