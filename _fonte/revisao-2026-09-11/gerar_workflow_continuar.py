# -*- coding: utf-8 -*-
import json, io, os

PASTA = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz/_fonte/revisao-2026-09-11'
ORIG = os.path.join(PASTA, 'workflow_revisao_serieb.js')
SAIDA = os.path.join(PASTA, 'workflow_continuar.js')

linhas = io.open(ORIG, encoding='utf-8').read().split('\n')
contexto_geral = '\n'.join(linhas[21:34])
verdict = '\n'.join(linhas[154:167])
tail = '\n'.join(linhas[333:])
tail = '\n'.join(l for l in tail.split('\n') if not l.startswith('const existentes = mapaAba'))

_R = json.load(io.open(os.path.join(PASTA, 'resultados_agentes.json'), encoding='utf-8'))
R = {k: (v['result'] if isinstance(v, dict) and 'result' in v else v) for k, v in _R.items()}

mapa, dados, conhec, metodos = R['mapa:aba'], R['mapa:dados'], R['mapa:conhecimento'], R['mapa:metodos']
brief, reorg = R['brief:literatura'], R['propor:reorganizacao']

J = lambda x: json.dumps(x, ensure_ascii=False, indent=1)
S = lambda x: json.dumps(x, ensure_ascii=False)

existentes = '\n'.join(s['titulo'] + ' > ' + b['nome'] + ': ' + b['afirmacao_principal']
                       for s in mapa['secoes'] for b in s['blocos'])[:12000]

todas = [dict(p, angulo=R[k]['angulo'])
         for k in R if k.startswith('propor:') and k != 'propor:reorganizacao'
         for p in R[k]['propostas']]

revisoes = [R[k] for k in R if k.startswith('revisao:')]
refs = [dict(r, tema=R[k].get('tema', k)) for k in R if k.startswith('pesquisa:') for r in R[k].get('referencias', [])]
refsSlim = [{'tema': r.get('tema'), 'titulo': r.get('titulo'), 'url': r.get('url')} for r in refs]

cabecalho = (u'''export const meta = {
  name: 'revisao-serieb-continuar',
  description: 'Continuacao da revisao da aba Analise Serie B: verificar as 34 propostas contra o dado real e o rigor, sintetizar o relatorio final e cruzar com o relatorio ja publicado',
  phases: [
    { title: 'Verificar', detail: 'duas lentes por proposta (dado/redundancia e rigor estatistico) — 34 propostas, 68 agentes' },
    { title: 'Sintetizar', detail: 'relatorio final, com o cruzamento contra as 11 analises ja publicadas' },
  ],
}

// Continuacao do run wf_a4d4de27-3cf. Mapear/Pesquisar/Revisar/Propor NAO rodam de novo: os 30
// retornos concluidos estao colados abaixo (extraidos de resultados_agentes.json), ja recortados
// no tamanho que cada prompt consome. Nenhuma pesquisa na web e refeita.
const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const DADOS = RAIZ + '/dados'
const PASTA = RAIZ + '/_fonte/revisao-2026-09-11'

''' + contexto_geral + u'''

''' + verdict + u'''

// ---------------- material do run anterior ----------------
const todasPropostas = ''' + J(todas) + u'''
const existentes = ''' + S(existentes) + u'''
const alertas = ''' + J(brief['alertas_metodologicos']) + u'''
const principios = ''' + J(brief['principios_da_literatura']) + u'''
const briefTxt = ''' + S(brief['brief_markdown']) + u'''
const mapaJson = ''' + S(J(mapa)[:25000]) + u'''
const dadosJson = ''' + S(J(dados)[:20000]) + u'''
const conhecJson = ''' + S(J(conhec)[:12000]) + u'''
const metodosJson = ''' + S(J(metodos)[:10000]) + u'''
const revisoesTxt = ''' + S(J(revisoes)[:60000]) + u'''
const reorgTxt = ''' + S(J(reorg)[:25000]) + u'''
const referenciasTxt = ''' + S(J(refs)[:25000]) + u'''

log(`Retomando: ${todasPropostas.length} propostas, 10 revisoes e 280 referencias vem do run anterior`)

''')

sub = [
    ("JSON.stringify(brief ? brief.principios_da_literatura : [])", "JSON.stringify(principios)"),
    ("JSON.stringify(revisoesOk, null, 1).slice(0, 60000)", "revisoesTxt"),
    ("JSON.stringify(reorg, null, 1).slice(0, 25000)", "reorgTxt"),
    ("JSON.stringify(pesquisasOk.flatMap(p => p.referencias.map(r => ({ tema: p.tema, ...r }))), null, 1).slice(0, 25000)", "referenciasTxt"),
    ("secoes_mapeadas: mapaAba ? mapaAba.secoes.length : 0,", "secoes_mapeadas: %d," % len(mapa['secoes'])),
    ("pesquisas_ok: pesquisasOk.length,", "pesquisas_ok: %d," % len([k for k in R if k.startswith('pesquisa:')])),
    ("revisoes_ok: revisoesOk.length,", "revisoes_ok: %d," % len(revisoes)),
    ("reorganizacao: !!reorg,", "reorganizacao: true,"),
    ("  revisoes: revisoesOk,\n", ""),
    ("  reorg,\n", ""),
    ("referencias: pesquisasOk.flatMap(p => p.referencias.map(r => ({ tema: p.tema, ...r }))),", "referencias_ver: 'resultados_agentes.json > pesquisa:* > referencias (280)',"),
]
for a, b in sub:
    if a not in tail:
        raise SystemExit('ancora ausente: ' + a[:70])
    tail = tail.replace(a, b)

alvo = "## 9. Referencias (titulo + URL, agrupadas por tema)"
novo = (u"## 9. Cruzamento com o relatorio JA PUBLICADO (obrigatorio) — leia ${PASTA}/relatorio.html "
        u"antes de escrever esta secao. Ele ja propoe 11 analises novas, escritas FORA deste workflow. "
        u"Para CADA uma das 11: a verificacao deste run CONFIRMA, AJUSTA (diga o ajuste concreto) ou "
        u"DERRUBA (diga por que)? E quais das propostas aprovadas aqui sao NOVAS em relacao a ele? "
        u"Termine com a lista unica e final de analises a implementar, sem duplicata, na ordem de "
        u"implementacao.\n## 10. Referencias (titulo + URL, agrupadas por tema)")
if alvo not in tail:
    raise SystemExit('ancora da secao 9 ausente')
tail = tail.replace(alvo, novo)

io.open(SAIDA, 'w', encoding='utf-8').write(cabecalho + tail + '\n')
n = os.path.getsize(SAIDA)
print('escrito: %s\ntamanho: %d bytes (%.0f KB) — limite 524288 -> %s' % (SAIDA, n, n/1024.0, 'OK' if n < 524288 else 'AINDA GRANDE'))
print('propostas: %d | revisoes: %d | referencias: %d' % (len(todas), len(revisoes), len(refs)))
