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
# 22/10/2026 — nascimento e nacionalidade (filtros de idade e nacionalidade da aba): pelo id do TransferRoom, da base
# completa da API (Portal Ranking/output/transferroom_ago26.json); quem não está lá, o nascimento das avaliações do Scout.
TRB = os.path.join(AQUI, '..', 'fut', 'BOTA', 'Analytics', 'Portal Ranking', 'output')
if not os.path.isdir(TRB):
    TRB = os.path.join(os.path.expanduser('~'), 'mnt', 'Analytics', 'Portal Ranking', 'output')
api = {}
try: api = json.load(open(os.path.join(TRB, 'transferroom_ago26.json'), encoding='utf-8'))['jogadores']
except Exception as e: print('sem a base da API do TransferRoom:', e)
nasc_av = {}
try:
    av = json.load(open(os.path.join(TRB, 'transferroom_scout_completa_20261007.json'), encoding='utf-8'))
    for mr in av.get('match_reports') or []:
        for pr in mr.get('playerRatings') or []:
            pl = pr.get('player') or {}
            if pl.get('id') and pl.get('birthDate'): nasc_av[int(pl['id'])] = pl['birthDate'][:10]
except Exception as e: print('sem as avaliações do Scout:', e)
for i, j in jog.items():
    a = api.get(str(i)) or {}
    nb = (a.get('BirthDate') or '')[:10] or nasc_av.get(i)
    if nb: j['nb'] = nb
    if a.get('Nationality1'): j['na'] = a['Nationality1']
    if a.get('Nationality2') and a.get('Nationality2') != a.get('Nationality1'): j['na2'] = a['Nationality2']
print('nascimento:', sum(1 for j in jog.values() if j.get('nb')), '· nacionalidade:', sum(1 for j in jog.values() if j.get('na')), 'de', len(jog))
# 22/10/2026 — o cadastro do app (pk "Nome - Clube - Liga" de dados/jogadores.json) de cada jogador, para a aba mostrar a letra
# física, a seta técnica e o farol e abrir a ficha. 1º pelo cruzamento confirmado do Portal Ranking (transferroom_slim_ago26.json,
# tr_id → pk); senão, nome igual (curto ou completo) + idade a ±1 + clube parecido, e só quando há UM candidato.
import unicodedata, re, datetime
def nz(t): return re.sub(r'[^a-z0-9]+', ' ', unicodedata.normalize('NFD', str(t or '').lower()).encode('ascii', 'ignore').decode()).strip()
BASEJ = json.load(open(os.path.join(AQUI, 'dados', 'jogadores.json'), encoding='utf-8'))['jogadores']
PKS = {b['n'] + ' - ' + b['t'] + ' - ' + b['l']: b for b in BASEJ}
slim = {}
try:
    for pk, v in json.load(open(os.path.join(TRB, 'transferroom_slim_ago26.json'), encoding='utf-8'))['jogadores'].items():
        if v.get('tr_id') and pk in PKS: slim.setdefault(int(v['tr_id']), []).append(pk)
except Exception as e: print('sem o cruzamento do Portal Ranking:', e)
POR_NOME = {}
for b in BASEJ:
    for nm in {nz(b.get('n')), nz(b.get('nc'))} - {''}: POR_NOME.setdefault(nm, []).append(b)
PAL_FORA = {'fc', 'ec', 'sc', 'cf', 'club', 'clube', 'de', 'do', 'da', 'atletico', 'ca', 'cd', 'u20', 'u19', 'u18', 'ii', 'b', 'sport', 'esporte', 'futebol', 'football'}
def clube_ok(a, b):
    x, y = set(nz(a).split()) - PAL_FORA, set(nz(b).split()) - PAL_FORA
    return bool(x & y)
hoje = datetime.date(2026, 10, 22)
n_slim = n_nome = 0
for i, j in jog.items():
    pks = slim.get(i) or []
    if len(pks) == 1: j['pk'] = pks[0]; n_slim += 1; continue
    a = api.get(str(i)) or {}
    idade = None
    if j.get('nb'):
        d = datetime.date.fromisoformat(j['nb']); idade = hoje.year - d.year - ((hoje.month, hoje.day) < (d.month, d.day))
    cand = {id(b): b for nm in {nz(j['n']), nz(a.get('Name'))} - {''} for b in POR_NOME.get(nm, [])}.values()
    cand = [b for b in cand if idade is not None and b.get('id_') is not None and abs(b['id_'] - idade) <= 1
            and (clube_ok(b['t'], j['c']) or clube_ok(b['t'], a.get('ParentTeam')))]
    if len(cand) == 1: j['pk'] = cand[0]['n'] + ' - ' + cand[0]['t'] + ' - ' + cand[0]['l']; n_nome += 1
print('cadastro do app:', n_slim, 'pelo Portal Ranking +', n_nome, 'por nome/idade/clube =', n_slim + n_nome, 'de', len(jog))
for i, j in jog.items():
    j['e'] = crest.get(j['c'], '')
    j['l'] = [k for k in ordem if i in listas[k]]
out = dict(fonte='TransferRoom Scout · Scout Management (shortlists)', extraido='2026-10-20', base=B, ordem=ordem, listas=listas, jogadores={str(k): v for k, v in sorted(jog.items())})
json.dump(out, open(os.path.join(D, 'listas_tr.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
with open(os.path.join(AQUI, 'static', 'destaques_dados.js'), 'w', encoding='utf-8') as fh:
    fh.write('/* gerado por ferramentas/montar_destaques_tr.py — listas do TransferRoom Scout, 20/10/2026 */\nwindow.DESTAQUES_TR = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(jog), 'jogadores;', {k: len(v) for k, v in listas.items()})
print('sem escudo:', sorted({j['c'] for j in jog.values() if not j['e']}))
