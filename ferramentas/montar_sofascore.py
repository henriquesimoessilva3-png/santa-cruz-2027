"""05/11/2026 — SofaScore no app Santa Cruz 2027 (grupo "SofaScore" no + indicador da janela Escolher jogador).
Entrada: sofascore_bruto.json (estatísticas da temporada, liga a liga, coletadas no SofaScore pelo Chrome) + docs/dados/jogadores.json.
Casamento conservador, liga a liga: nome compatível (nome completo ou inicial + sobrenome) E clube com palavra em comum;
candidato único. Sem certeza = sem dado. Saída: docs/static/sofascore_dados.js (por 90 min; % e nota como vêm)."""
import json, re, sys, unicodedata, collections
BRUTO, BASEF, SAIDA = sys.argv[1], sys.argv[2], sys.argv[3]
MIN_MIN = 450
nz = lambda s: re.sub(r'[^a-z0-9 ]', ' ', unicodedata.normalize('NFD', str(s or '')).encode('ascii', 'ignore').decode().lower()).split()
GEN = {'fc','ec','sc','cf','cd','club','clube','esporte','futebol','de','do','da','del','la','el','ac','ca','sd','ud','fk','sk','nk','if','bk','afc','cfc','ss','us','asd','calcio','sport','sporting','atletico','athletic','united','city','real','deportivo','esportivo','sociedade','associacao','club','the','al','res','reserves','ii','b','u23','u21'}
def ct(s): return {w for w in nz(s) if w not in GEN and len(w) >= 3}
def compat(sofa_nome, b):
    a = [w for w in nz(sofa_nome) if len(w) > 1]
    if not a: return False
    for nm in (b.get('nc'), b.get('n')):
        if not nm: continue
        t = nz(nm); ini = t[0] if t and len(t[0]) == 1 else None; bb = [w for w in t if len(w) > 1]
        if not bb: continue
        if ' '.join(a) == ' '.join(bb): return True
        sa = set(a)
        if ini:   # base "R. Tavares": sobrenome(s) no nome do SofaScore e a inicial bate
            if all(w in sa for w in bb) and any(w[0] == ini for w in a if w not in bb): return True
        elif len(bb) == 1:   # apelido de uma palavra
            if bb[0] in sa or (len(a) == 1 and a[0] == bb[0]): return True
        elif all(w in sa for w in bb): return True
        elif len(a) >= 2 and all(w in set(bb) for w in a): return True
    return False
CONTA = ['bigChancesCreated','successfulDribbles','keyPasses','expectedGoals','expectedAssists','goals','assists','bigChancesMissed','tackles','interceptions','clearances','possessionLost','aerialDuelsWon','accurateLongBalls','accurateCrosses','totalShots','shotsOnTarget','wasFouled','fouls','ballRecovery','dribbledPast','groundDuelsWon','accurateFinalThirdPasses','saves']
PCT = ['rating','successfulDribblesPercentage','totalDuelsWonPercentage','accuratePassesPercentage']
MOSTRAR = [  # campo, rótulo, grupo
 ('rating','Nota média SofaScore','Geral'), ('minutesPlayed','Minutos na temporada','Geral'),
 ('bigChancesCreated','Chances claras criadas /90','Criação'), ('keyPasses','Passes decisivos /90','Criação'), ('expectedAssists','xA /90','Criação'),
 ('assists','Assistências /90','Criação'), ('accurateCrosses','Cruzamentos certos /90','Criação'), ('accurateFinalThirdPasses','Passes certos no terço final /90','Criação'),
 ('successfulDribbles','Dribles certos /90','Drible e posse'), ('successfulDribblesPercentage','Dribles certos %','Drible e posse'), ('wasFouled','Faltas sofridas /90','Drible e posse'),
 ('possessionLost','Perdas de posse /90 ↓','Drible e posse'), ('accuratePassesPercentage','Passes certos %','Drible e posse'), ('accurateLongBalls','Lançamentos certos /90','Drible e posse'),
 ('goals','Gols /90','Finalização'), ('expectedGoals','xG /90','Finalização'), ('totalShots','Finalizações /90','Finalização'), ('shotsOnTarget','Finalizações no alvo /90','Finalização'), ('bigChancesMissed','Chances claras perdidas /90 ↓','Finalização'),
 ('tackles','Desarmes /90','Defesa'), ('interceptions','Interceptações /90','Defesa'), ('clearances','Cortes /90','Defesa'), ('ballRecovery','Recuperações /90','Defesa'),
 ('groundDuelsWon','Duelos no chão ganhos /90','Defesa'), ('aerialDuelsWon','Duelos aéreos ganhos /90','Defesa'), ('totalDuelsWonPercentage','Duelos ganhos %','Defesa'),
 ('dribbledPast','Dribles sofridos /90 ↓','Defesa'), ('fouls','Faltas cometidas /90 ↓','Defesa'), ('saves','Defesas /90 (goleiro)','Goleiro'),
]
CAMPOS = [m[0] for m in MOSTRAR]
bruto = json.load(open(BRUTO)); base = json.load(open(BASEF))['jogadores']
porLiga = collections.defaultdict(list)
for b in base: porLiga[b.get('l')].append(b)
# um jogador do SofaScore pode aparecer em 2 linhas (dois clubes ou duas fases): soma por (liga, pid)
agg = {}
for liga, rows in bruto['dados'].items():
    for r in rows:
        k = (liga, r.get('pid'))
        a = agg.setdefault(k, {'liga': liga, 'n': r.get('n'), 'times': [], 'min': 0, 'c': collections.Counter(), 'p': collections.defaultdict(float), 'pw': collections.defaultdict(float)})
        m = r.get('minutesPlayed') or 0
        a['times'].append(r.get('t')); a['min'] += m
        for c in CONTA:
            if r.get(c) is not None: a['c'][c] += r[c]
        for c in PCT:
            if r.get(c) is not None and m: a['p'][c] += r[c] * m; a['pw'][c] += m
jog = {}; est = collections.Counter(); amb = 0
for (liga, pid), a in agg.items():
    if a['min'] < MIN_MIN: est['pouco_minuto'] += 1; continue
    cands = [b for b in porLiga.get(liga, []) if compat(a['n'], b)]
    tt = set().union(*[ct(t) for t in a['times']])
    c2 = [b for b in cands if ct(b.get('t')) & tt]
    if len(c2) != 1:
        est['ambiguo' if len(c2) > 1 else ('sem_clube' if cands else 'sem_nome')] += 1; continue
    b = c2[0]; pk = b['n'] + ' - ' + b['t'] + ' - ' + b['l']
    if pk in jog: est['repetido'] += 1; continue
    v = []
    for c in CAMPOS:
        if c == 'minutesPlayed': v.append(a['min'])
        elif c in PCT: v.append(round(a['p'][c] / a['pw'][c], 2) if a['pw'].get(c) else None)
        else: v.append(round(a['c'][c] / a['min'] * 90, 3) if c in a['c'] else None)
    jog[pk] = v; est['ok'] += 1
temporadas = sorted({f"{lg}: {rows[0].get('se')}" for lg, rows in bruto['dados'].items() if rows})
out = {'gerado': bruto.get('gerado', ''), 'min_minutos': MIN_MIN, 'campos': CAMPOS, 'mostrar': [list(m) for m in MOSTRAR if m[0] != 'minutesPlayed'] + [['minutesPlayed', 'Minutos na temporada', 'Geral']],
       'temporadas': temporadas, 'jog': jog}
open(SAIDA, 'w').write('/* 05/11/2026 — SofaScore (fonte diferente do Wyscout, só de referência): estatísticas da temporada por liga, por 90 min,\n   mínimo de ' + str(MIN_MIN) + ' minutos. Gerado por montar_sofascore.py. */\nwindow.SOFA=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(dict(est), len(jog))
