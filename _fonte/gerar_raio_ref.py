#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Monta dados/raio_ref.json: as duas MEDIAS de referencia por posicao.

Referencias Mundo  = elite mundial por posicao (config/fisico_refs.json do Portal Ranking,
                     as mesmas do Scanner/Carreira TOP/Comparativo).
Referencias Brasil = lista curada de mar/25 (config/refs_brasil.json do mesmo projeto).

De cada grupo sai a MEDIA de cada um dos 25 indicadores fisicos, com os valores desta
base. Media de grupo, e nao um jogador so: um outlier deixa de decidir sozinho a regua,
que era o problema da versao anterior (Medina no percentil 91 dos medios fazia so 2,9%
ficarem verdes; Alex Telles no 25 dos laterais fazia 65%).

Os nomes das listas sao de periodos diferentes e nem todos casam com esta base — quem
nao tem SkillCorner aqui fica de fora, e o arquivo registra quem entrou e quem faltou.
"""
import json, unicodedata, collections, os, sys

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RK = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/"
      "fut/BOTA/Analytics/Portal Ranking/config")

IND = ['vmax3','vmax','psv5','psv','spr_km','spr_n','hsr','hsr_n','hi','hi_n',
       'dist','mmin','run','acel_m','desa_m','expl','acel','desa','t_spr','t_hsr',
       'cod','t505_90','t505_180','t_spr_cod','t_hsr_cod']
KP = ['psv','spr_km','spr_n','hi','hi_n']          # os 5 que decidem o raio

MUNDO_POS = {'Zagueiro - Direita':'ZD','Zagueiro - Esquerda':'ZE','Lateral Direito':'LD',
             'Lateral Esquerdo':'LE','Volante':'VOL','Medio':'MED','Meia':'MEI',
             'Extremo - Direita':'ED','Extremo - Esquerda':'EE','Atacante':'CA'}
BR_POS = {'ZAG':['ZD','ZE'],'LD':['LD'],'LE':['LE'],'VOL':['VOL'],'MED':['MED'],
          'MEI':['MEI'],'EXT':['ED','EE'],'ATA':['CA']}

# nomes que mudaram de grafia ou de clube entre a lista curada e esta base
APELIDOS = {
    'a. barboza': 'Alexander Barboza', 'bernabei': 'Alexandro Bernabei',
    'arana': 'Guilherme Arana', 'richard rios': 'R. Ríos',
    'savarino': 'Jefferson Savarino', 'arias': 'J. Arias',
    'pulgar': 'Erick Pulgar', 'garro': 'R. Garro', 'jean lucas': 'Jean Lucas',
}
# quando o nome existe mais de uma vez, o clube decide
CLUBE = {'J. Arias':'Palmeiras', 'Jean Lucas':'Bahia', 'R. Garro':'Corinthians',
         'R. Ríos':'Benfica'}


def norm(t):
    t = unicodedata.normalize('NFD', str(t or ''))
    return ''.join(c for c in t if unicodedata.category(c) != 'Mn').lower().strip()


def main():
    with open(os.path.join(AQUI, 'dados/jogadores.json'), encoding='utf-8') as fh:
        base = json.load(fh)
    base = base['jogadores'] if isinstance(base, dict) and 'jogadores' in base else base
    tem_fis = lambda j: all(isinstance(j.get(k), (int, float)) for k in KP)
    por_pk = {'%s - %s - %s' % (j['n'], j['t'], j['l']): j for j in base}
    por_nome = collections.defaultdict(list)
    for j in base:
        por_nome[norm(j['n'])].append(j)

    def achar(chave, so_br=False):
        j = por_pk.get(chave)
        if j and tem_fis(j):
            return j
        nome = chave.split(' - ')[0] if ' - ' in chave else chave
        nome = APELIDOS.get(norm(nome), nome)
        cands = [c for c in por_nome.get(norm(nome), []) if tem_fis(c)]
        if len(cands) > 1 and nome in CLUBE:
            cands = [c for c in cands if CLUBE[nome] in c['t']] or cands
        if len(cands) > 1 and so_br:
            cands = [c for c in cands if str(c.get('l', '')).startswith('Brasil')] or cands
        return cands[0] if len(cands) == 1 else None

    with open(os.path.join(RK, 'fisico_refs.json'), encoding='utf-8') as fh:
        mundo_cfg = json.load(fh)
    with open(os.path.join(RK, 'refs_brasil.json'), encoding='utf-8') as fh:
        br_cfg = json.load(fh)

    br_nomes = collections.defaultdict(list)
    for r in br_cfg['refs']:
        br_nomes[r['pos']].append(r['nome'])

    def media(js):
        m = {}
        for k in IND:
            vs = [j[k] for j in js if isinstance(j.get(k), (int, float))]
            if vs:
                m[k] = round(sum(vs) / len(vs), 3)
        return m

    refs = {}
    faltas = {}
    for grupo, cod in MUNDO_POS.items():
        refs.setdefault(cod, {})
        achados, fora = [], []
        for pk in mundo_cfg.get(grupo, {}).get('mundial', []):
            j = achar(pk)
            (achados.append(j) if j else fora.append(pk.split(' - ')[0]))
        if achados:
            refs[cod]['mundo'] = {'n': len(achados),
                                  'nomes': ['%s (%s)' % (j['n'], j['t']) for j in achados],
                                  'valores': media(achados)}
        if fora:
            faltas.setdefault(cod, {})['mundo'] = fora

    for pos, nomes in br_nomes.items():
        for cod in BR_POS.get(pos, []):
            refs.setdefault(cod, {})
            achados, fora = [], []
            for n in nomes:
                j = achar(n, so_br=True)
                (achados.append(j) if j else fora.append(n))
            if achados:
                refs[cod]['brasil'] = {'n': len(achados),
                                       'nomes': ['%s (%s)' % (j['n'], j['t']) for j in achados],
                                       'valores': media(achados)}
            if fora:
                faltas.setdefault(cod, {})['brasil'] = fora

    saida = {
        '_doc': ('Duas MEDIAS de referencia por posicao — Brasil (lista curada de mar/25) e '
                 'Mundo (elite mundial) —, com os valores desta base. O raio compara o '
                 'jogador com a media BRASIL: abaixo = vermelho, similar = laranja, '
                 'acima = verde. Goleiro fica de fora. Gerado por _fonte/gerar_raio_ref.py.'),
        'kpis': KP,
        'indicadores': IND,
        'params': {'min_perf': 4, 'banda': 0.75, 'zcap': 1.0, 'med_verde': 0.5,
                   'med_vermelho': -0.5, 'dom_max_perdas': 2, 'dom_max_ganhos': 1,
                   'dom_min_npp': 5, 'dom_elite_z': 2.8},
        'refs': refs,
        '_sem_match': faltas,
    }
    destino = os.path.join(AQUI, 'dados/raio_ref.json')
    with open(destino, 'w', encoding='utf-8') as fh:
        json.dump(saida, fh, ensure_ascii=False, indent=1)

    print('%-4s %-32s %-32s' % ('pos', 'Brasil', 'Mundo'))
    for cod in ['ZD','ZE','LD','LE','VOL','MED','MEI','ED','EE','CA']:
        r = refs.get(cod, {})
        b = r.get('brasil'); m = r.get('mundo')
        print('%-4s %-32s %-32s' % (cod,
              '%d: %s' % (b['n'], ', '.join(n.split(' (')[0] for n in b['nomes'])) if b else '— NENHUM',
              '%d refs' % m['n'] if m else '—'))
    print('\nsem match:', json.dumps(faltas, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main())
