"""b27 (19/10): tira fundamentais parecidos entre si (correlação alta entre jogadores da posição) — fica o que mais separa;
teto 15. Testa AUC com ano de fora."""
src=open("b23_seta_sobe.py",encoding="utf-8").read()
exec(compile(src.split("# regra final")[0],"b23","exec"))
_e0=_escolher0
COLK={i["k"]:i["col"] for i in IND}
def enxuto(corr_max,teto):
    def f(anos):
        E=_e0(anos)
        for rg,_,ps in REGUAS:
            d=RAW[RAW.ano.isin(anos)&RAW.pos11.isin(ps)]
            en=sorted(E[rg]["entra"],key=lambda e:-(e["sep"] or 0)); fica=[]; sai=[]
            for e in en:
                par=None
                for g in fica:
                    c=d[[COLK[e["k"]],COLK[g["k"]]]].corr().iloc[0,1]
                    if abs(c)>=corr_max: par=(g["rot"],round(float(c),2)); break
                if par or (teto and len(fica)>=teto): sai.append(dict({k:e[k] for k in ("k","rot","g","sep","sepT")},motivo=("parecido com "+par[0]+f" (r={par[1]})") if par else "além do teto"))
                else: fica.append(e)
            E[rg]["entra"]=sorted(fica,key=lambda e:e["k"]); E[rg]["fora"]+=sai
        return E
    return f
if __name__=="__main__":
    for cm,t in ((0.6,15),(0.7,15),(0.5,15),(0.6,None)):
        ef=enxuto(cm,t); aucs=[]; por={rg:[] for rg,_,_ in REGUAS}
        for ano in ANOS:
            tr=[a for a in ANOS if a!=ano]; esc=ef(tr); med=medianas(tr)
            te=RAW[(RAW.ano==ano)&RAW.faixa.isin(["Sobe","Cai"])]; y=(te.faixa=="Sobe").astype(int); pr=pontos(te,esc,med); ok=pr.notna()
            aucs.append(roc_auc_score(y[ok],pr[ok]))
            for rg,_,ps in REGUAS:
                mm=ok&te.pos11.isin(ps)
                if mm.sum()>=16 and y[mm].nunique()==2: por[rg].append(roc_auc_score(y[mm],pr[mm]))
        F=ef(ANOS)
        print("corr",cm,"teto",t,"AUC",round(float(np.mean(aucs)),3),{rg:(round(float(np.mean(v)),2) if v else None) for rg,v in por.items()},{rg:len(F[rg]["entra"]) for rg in F},flush=True)
