import json, sys
sys.path.insert(0, '.')
COMO={'c':'clube+idade','j':'jogos no clube+idade','i':'só idade (livre)','m':'conferido pelo Henrique no Wyscout'}
p='dados/minutagem_wyscout.json'; J=json.load(open(p,encoding='utf-8')); W=J['jogadores']
for ln in open(sys.argv[1],encoding='utf-8').read().strip().split('\n'):
    pk,wy,como,anos=ln.split('|',3); A={}
    for blk in anos.split('#'):
        if not blk: continue
        y,cs=blk.split(':',1); A['20'+y]=[[c.split(',')[0]]+[int(v) for v in c.split(',')[1:5]] for c in cs.split('+')]
    W[pk]={"wy":int(wy),"conferido":COMO[como],"anos":A}
json.dump(J,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=0)
import preparar_minutagem_v4 as m
hp='dados/historico.json'; H=json.load(open(hp,encoding='utf-8'))
n=m.aplicar_wyscout(H); H['minutagem']['wyscout_todas']=n
json.dump(H,open(hp,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(len(W))
