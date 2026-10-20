#!/usr/bin/env python3
"""Monta as listas de destaque do TransferRoom Scout (shortlists do Scout Management) para o app.
Entrada: dados/transferroom/raw_*.txt (extraídos da tela em 20/10/2026).
Saída: dados/transferroom/listas_tr.json (cópia guardada) e static/destaques_dados.js (lido pela aba)."""
import json, os, glob
AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(AQUI, 'dados', 'transferroom')
B = 'https://transferroom.blob.core.windows.net/'
listas, ordem, esperado, jog, crest = {}, [], {}, {}, {}
for nome in ['raw_part0.txt', 'raw_p1.txt', 'raw_p2.txt', 'raw_p3.txt']:
    for ln in open(os.path.join(D, nome), encoding='utf-8').read().splitlines():
        if not ln.strip(): continue
        f = ln.split('|')
        if f[0] == 'H': ordem.append(f[1]); esperado[f[1]] = int(f[2]); listas[f[1]] = []
        elif f[0] == 'I': listas[f[1]] += [int(x) for x in f[2].split(',')]
        elif f[0] == 'C': crest[f[1]] = f[2]
        elif f[0] == 'P':
            _, i, n, c, p, r, ph, cr = f
            jog[int(i)] = dict(n=n, c=c, p=p, r=float(r) if r else None, f=int(ph))
            if cr: crest.setdefault(c, cr)
        else:
            i, n, c, p, r, ph = f
            jog[int(i)] = dict(n=n, c=c, p=p, r=float(r) if r else None, f=int(ph))
for k in ordem: assert len(listas[k]) == esperado[k], (k, len(listas[k]), esperado[k])
faltam = {i for v in listas.values() for i in v} - set(jog)
assert not faltam, faltam
for i, j in jog.items():
    j['e'] = crest.get(j['c'], '')
    j['l'] = [k for k in ordem if i in listas[k]]
out = dict(fonte='TransferRoom Scout · Scout Management (shortlists)', extraido='2026-10-20', base=B, ordem=ordem, listas=listas, jogadores={str(k): v for k, v in sorted(jog.items())})
json.dump(out, open(os.path.join(D, 'listas_tr.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
with open(os.path.join(AQUI, 'static', 'destaques_dados.js'), 'w', encoding='utf-8') as fh:
    fh.write('/* gerado por ferramentas/montar_destaques_tr.py — listas do TransferRoom Scout, 20/10/2026 */\nwindow.DESTAQUES_TR = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(jog), 'jogadores;', {k: len(v) for k, v in listas.items()})
print('sem escudo:', sorted({j['c'] for j in jog.values() if not j['e']}))
