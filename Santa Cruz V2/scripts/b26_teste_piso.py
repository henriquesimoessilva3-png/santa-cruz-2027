src=open("b23_seta_sobe.py",encoding="utf-8").read()
exec(compile(src.split("# prova:")[0],"b23","exec"))
def reg(anos,q):
    m={}
    for rg,_,ps in REGUAS:
        g=RAW[RAW.ano.isin(anos)&RAW.pos11.isin(ps)&(RAW.faixa=="Sobe")]
        for i in IND:
            v=g[i["col"]].dropna()
            if len(v)>=5:
                x=float(v.mean()) if q is None else float(v.quantile(1-q if i["menor"] else q))
                for p in ps: m[(p,i["k"])]=x
    return m
def conta(df,esc,med):
    out=[]
    for _,r in df.iterrows():
        v=n=0
        for e in esc[REGUA[r.pos11]]["entra"]:
            i=next(x for x in IND if x["k"]==e["k"]); mm=med.get((r.pos11,e["k"]))
            if mm is None or pd.isna(r[i["col"]]): continue
            n+=1; v+= (r[i["col"]]<=mm) if i["menor"] else (r[i["col"]]>=mm)
        out.append(v/n if n>=4 else np.nan)
    return pd.Series(out,index=df.index)
D=RAW[RAW.faixa.isin(["Sobe","Meio","Cai"])]
for nomeq,q in (("média de quem sobe",None),("piso p25 (75% de quem sobe atinge)",0.25),("piso p10 (90% atinge)",0.10)):
    med=reg(ANOS,q); p=conta(D,FINAL,med)
    linha=[]
    for rg,nome,ps in REGUAS:
        m=D.pos11.isin(ps)
        s=p[m&(D.faixa=="Sobe")]; c=p[m&(D.faixa=="Cai")]
        tod=int((s>=0.999).sum())
        linha.append(f"{nome}: sobe atinge em média {s.mean()*100:.0f}% dos indicadores · cai {c.mean()*100:.0f}% · sobe que bate TODOS {tod}/{len(s)} · sobe que bate 80%+ {int((s>=0.8).sum())}/{len(s)} · cai 80%+ {int((c>=0.8).sum())}/{len(c)}")
    # AUC ano de fora
    aucs=[]
    for ano in ANOS:
        tr=[a for a in ANOS if a!=ano]; esc=escolher(tr); med2=reg(tr,q)
        te=RAW[(RAW.ano==ano)&RAW.faixa.isin(["Sobe","Cai"])]; y=(te.faixa=="Sobe").astype(int); pr=conta(te,esc,med2); ok=pr.notna()
        aucs.append(roc_auc_score(y[ok],pr[ok]))
    print("==",nomeq,"AUC",round(float(np.mean(aucs)),3)); print("\n".join(linha),flush=True)
