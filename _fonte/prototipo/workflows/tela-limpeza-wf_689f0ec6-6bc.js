export const meta = {
  name: 'tela-limpeza',
  description: 'Metade tela, limpeza que nao depende do gerador: frases fixas que o dado nao controla, numeros digitados, imperativos, nomes curtos do glossario e cabecalhos cortados, com conferencia headless e de linguagem',
  phases: [
    { title: 'Escrever', detail: 'quatro donos de arquivo' },
    { title: 'Conferir', detail: 'regressao headless; linguagem e numero digitado' },
    { title: 'Consertar', detail: 'uma rodada' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'
const TELA2 = S + '/tela2_journal.json'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Aba Prototipo: \`static/proto.js\` (casca), \`static/proto_a.js\` (etapas 0-4), \`static/proto_b.js\` (5-8), \`static/proto_c.js\` (9-15), \`static/style.css\`, \`static/proto_glossario.js\`; contrato \`static/proto_contrato.md\`. Dados PROTO (\`static/prototipo.js\`) e PONTOS (\`static/pontos.js\`).
LEIA ANTES: \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\`, \`${RAIZ}/_fonte/prototipo/PENDENTE_RODADA.md\` (itens 4, 11, 13, 14, 17), o contrato, e o relato do degrau anterior da tela em \`${TELA2}\` (lista [rotulo, retorno]): em cada retorno de dono e de conserto, o campo o_que_ficou_para_outro_dono; em cada 'confere:*' e no 'reconfere', os problemas. A SUA lista de trabalho sao TODOS os itens desses campos que apontam para os SEUS arquivos e NAO dependem do gerador.
O QUE NAO FAZER AGORA: nada que dependa de chave que o gerador ainda vai gravar (faixa_sobe, faixa_*_bruto, ranking_gaps, conclusoes, nac/psp, empate tecnico, etapa_6.mesmo_ano, ks_da_tabela, unidade/definicao, porta e consequencia_do_resultado em etapa_10 do PROTO) e nada da aba por pontos alem de nao quebrar (as frases proprias dela vem num degrau proprio).
EXEMPLOS DO QUE ENTRA (confira no codigo antes; os numeros de linha podem ter mudado): frases fixas que nenhum campo do dado controla e que afirmam algo (proto_b.js ~2047-2054 "A formacao tambem nao separa nada..."; proto_c.js ~902 abertura da etapa 10; proto_c.js ~1420 "O peso de cada nota e o quanto ela comprovadamente acompanha o atleta") — ou passam a ser montadas do dado, ou dizem so o que o dado sustenta; imperativo de receita ("nao contrate para isto" em proto.js ~353; coluna "por que nao serve" em proto_c.js ~840 -> "por que fica de fora"); numeros digitados em texto ("ruido de 10 pontos de percentil" proto_b.js ~1596; "300 minutos" proto.js ~538) lidos do dado ou do nome da chave; ptTecnico('secao 9(ii)') citando documento que a tela nao mostra (proto_c.js ~2422); o texto de pb6Motivo10 com a frase do selo B que junta dois motivos (use o motivo gravado da linha); PT_PORTAS_TXT coerente com os motivos gravados; cabecalho vertical cortando nome comprido (style.css .pt-th-vertical nowrap/max-height); os 75 nomes curtos acima de 22 caracteres no glossario (encurte sem perder fase, setor e sem criar nome duplicado); ptNomeCurto usado nos cabecalhos de goleiro agora que gk_def esta certo; "−0" na etapa 12.
REGRAS: um dono por arquivo (so os seus); portugues de reuniao de clube com o vocabulario de proto.js; nenhum numero digitado na tela; ausencia com motivo; simplificar nunca e afirmar mais; zero erro no console; nada de rolagem lateral a 1.785 px; nada cortado a 400 px. Teste headless com Playwright do Python na SUA porta, derrubada ao fim; node --check.
PROIBIDO: qualquer git que escreva. NAO EDITE: \`gerar_*.py\`, \`ranking_gaps.py\`, \`dados/*\`, \`static/prototipo.js\`, \`static/pontos.js\`, \`templates/*\`, \`static/app.js\`, \`_fonte/*\` (o gerador e as conclusoes estao rodando AGORA). NAO use nem derrube as portas 5090/5091.`

const ESCRITA = { type: 'object', properties: {
  arquivos_escritos: { type: 'array', items: { type: 'string' } },
  itens: { type: 'array', items: { type: 'object', properties: { item: { type: 'string' }, onde: { type: 'string' }, antes: { type: 'string' }, depois: { type: 'string' } }, required: ['item', 'onde', 'antes', 'depois'] } },
  deixados_com_motivo: { type: 'array', items: { type: 'string' } },
  como_testei: { type: 'string' },
}, required: ['arquivos_escritos', 'itens', 'deixados_com_motivo', 'como_testei'] }

const CONF = { type: 'object', properties: {
  lente: { type: 'string' }, conferidos: { type: 'integer' }, medidas: { type: 'string' },
  problemas: { type: 'array', items: { type: 'object', properties: { arquivo: { type: 'string' }, onde: { type: 'string' }, o_que_vi: { type: 'string' }, conserto: { type: 'string' }, gravidade: { type: 'string', enum: ['quebra', 'mente', 'falta', 'detalhe'] } }, required: ['arquivo', 'onde', 'o_que_vi', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'conferidos', 'medidas', 'problemas', 'veredito'] }

const DONOS = [
  { k: 'casca_glossario', arquivos: ['static/proto.js', 'static/style.css', 'static/proto_contrato.md', 'static/proto_glossario.js'], porta: 5121 },
  { k: 'proto_a', arquivos: ['static/proto_a.js'], porta: 5122 },
  { k: 'proto_b', arquivos: ['static/proto_b.js'], porta: 5123 },
  { k: 'proto_c', arquivos: ['static/proto_c.js'], porta: 5124 },
]

phase('Escrever')
const escritas = (await parallel(DONOS.map(d => () => agent(`${CASA}

SUA TAREFA: dono de ${d.arquivos.join(', ')} nesta limpeza. ${d.k === 'casca_glossario' ? 'Outros tres donos estao escrevendo proto_a/b/c.js AGORA: so mudancas aditivas na API da casca, nenhum nome publicado muda.' : 'Nao mude a API da casca; use o que esta no contrato.'}
Arquivos que VOCE pode escrever: ${d.arquivos.join(', ')}. Nenhum outro. Sua porta de teste: ${d.porta}.
Para cada item: antes e depois. O que decidir nao fazer, diga o motivo.`,
  { label: 'dono:' + d.k, phase: 'Escrever', schema: ESCRITA, effort: 'high' }).then(r => r ? { ...r, k: d.k } : null)))).filter(Boolean)

phase('Conferir')
const RELATO = JSON.stringify(escritas, null, 1).slice(0, 70000)
const LENTES = [
  { k: 'regressao', p: `REGRESSAO headless (porta 5125; derrube ao fim). Aba Prototipo a 1.785 e a 400 px: 16/16 etapas, zero erro, zero caixa rolando de lado a 1.785, zero elemento cortado a 400, zero undefined/NaN, nenhum id repetido; e a mesma aba desenhada com PONTOS num alvo temporario (16/16, zero erro, zero undefined). Compare os NUMEROS de cada etapa com a versao anterior (a do inicio desta rodada: pegue de ${S}/rc15 se existir, ou reconstrua pelos donos): nenhum numero pode ter sumido ou mudado.` },
  { k: 'linguagem-e-numero', p: `LINGUAGEM E NUMERO DIGITADO, lendo o codigo dos quatro arquivos inteiros. Cada item que os donos dizem ter feito esta feito? Sobrou frase fixa que afirma algo sem o dado controlar, imperativo de receita, numero digitado em texto de tela, jargao fora do numero pequeno (p, d, rho, q, BH, AUC, liquido, percentil solto), "nao separa" onde e "nao se viu", "nunca" sem zero excecao, nome duplicado, psv99 como velocidade maxima? Liste arquivo:linha.` },
]
const confs = (await parallel(LENTES.map(l => () => agent(`${CASA}

Os donos relataram:
${RELATO}

VOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. SUA LENTE: ${l.p}`,
  { label: 'confere:' + l.k, phase: 'Conferir', schema: CONF, effort: 'high' }).then(r => r ? { ...r, k: l.k } : null)))).filter(Boolean)

const graves = confs.flatMap(c => c.problemas.filter(p => p.gravidade !== 'detalhe').map(p => ({ ...p, lente: c.k })))
let consertos = []
if (graves.length) {
  phase('Consertar')
  const donoDe = a => DONOS.find(d => d.arquivos.some(x => (a || '').toLowerCase().includes(x.split('/').pop().toLowerCase()))) || DONOS[0]
  const por = {}
  for (const p of graves) { const d = donoDe(p.arquivo); (por[d.k] = por[d.k] || []).push(p) }
  const portas = { casca_glossario: 5126, proto_a: 5127, proto_b: 5128, proto_c: 5129 }
  consertos = (await parallel(Object.entries(por).map(([k, ps]) => () => {
    const d = DONOS.find(x => x.k === k)
    return agent(`${CASA}

RODADA DE CONSERTO. Voce e dono de ${d.arquivos.join(', ')} (nenhum outro arquivo). Porta de teste: ${portas[k]}. Problemas nos seus arquivos:
${JSON.stringify(ps, null, 1).slice(0, 30000)}
Confirme cada um antes (o conferente pode ter errado: diga por que), conserte, rode de novo o teste headless (16/16, zero erro, zero rolagem lateral a 1.785, nada cortado a 400).`,
      { label: 'conserta:' + k, phase: 'Consertar', schema: ESCRITA, effort: 'high' }).then(r => r ? { ...r, k } : null)
  }))).filter(Boolean)
}
return { escritas, conferencias: confs, consertos }
