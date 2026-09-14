export const meta = {
  name: 'fecho-etapas-1-5',
  description: 'Termina a rodada interrompida: duas conferencias que ficaram no meio, a linha de quem subiu e a ordem das colunas pela diferenca sobe x cai nas 11 matrizes da etapa 5, a regra dos jogadores em dois clubes, regrava o dado e confere no navegador',
  phases: [
    { title: 'Conferir e gerar', detail: 'tela e linguagem; efeito nas conclusoes; gerador (diferenca e ordem da etapa 5, regra dos repetidos)' },
    { title: 'Telas', detail: 'proto_b.js (linha de quem subiu + ordem) e consertos das outras telas' },
    { title: 'Gravar', detail: 'dados/prototipo.json + static/prototipo.js, regressao' },
    { title: 'Conferir final', detail: 'etapa 5, etapa 1, etapa 14 e linguagem' },
    { title: 'Consertar', detail: 'uma rodada' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'
const W = S + '/fecho15'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B, aba Prototipo: dado global PROTO (\`static/prototipo.js\`, copia de \`dados/prototipo.json\`, gerado por \`gerar_prototipo.py\`; copia por \`gerar_prototipo_js.py\`), telas \`static/proto.js\` (casca), \`proto_a.js\` (etapas 0-4), \`proto_b.js\` (5-8), \`proto_c.js\` (9-15), \`style.css\`, \`proto_glossario.js\`; contrato \`static/proto_contrato.md\`.
LEIA ANTES: \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\` (secoes 2, 2.1 e TODAS as decisoes do dono de 14/09) e o contrato.
O QUE JA FOI FEITO NESTA RODADA (relato completo em \`${S}/setores_journal.json\`, lista [rotulo, retorno]): etapa 1 ponderada por jogador (o sem preco conta como jogador de valor zero) e tabela aberta por time; frase do Controle 2 corrigida; etapa 14 lendo o empate tecnico; e o dado NOVO JA GRAVADO em dados/prototipo.json e static/prototipo.js (17:01). A conferencia dos numeros por jogador APROVOU, com uma falta: 216 jogadores aparecem em dois clubes na mesma temporada no Transfermarkt (433 linhas, € 175,3 mi contados nos dois elencos). Duas conferencias foram interrompidas por queda do processo e sao refeitas aqui.
PEDIDOS DO DONO QUE ESTA RODADA FECHA (decididos, nao reabrir):
A. Etapa 5: a LINHA DOS TIMES QUE SUBIRAM em TODAS as 11 matrizes, igual as duas que ja existem ("times do meio da tabela" e "times que cairam": 1o numero · tipico · 3o numero, que sao quartis). Medido: o dado novo ja tem faixa_sobe em todos os paineis, mas proto_b.js so desenha faixa_meio e faixa_cai. Ordem das linhas: subiram, meio, cairam.
B. Etapa 5: COLUNAS DAS 11 MATRIZES ORDENADAS PELA DIFERENCA entre o time tipico que subiu e o tipico que caiu, em posicao no ranking do ano (a escala das celulas), MAIOR DIFERENCA PRIMEIRO EM MODULO, com o sinal e o numero no cabecalho (quem subiu acima ou abaixo de quem caiu). O GERADOR grava a diferenca e a ordem por painel (a tela nao calcula); na aba por pontos (PONTOS), a mesma coisa com alta contra baixa quando o gerar_pontos.py for regerado (nao e desta rodada: com dado sem as chaves, a tela usa a ordem original e diz isso discretamente).
C. Os 216 jogadores em dois clubes na mesma temporada: manter a contagem consistente com o valor do elenco (val_*), que tambem os conta nos dois elencos — ele fez parte dos dois — e DECLARAR isso na regra do bloco ponderado_por_jogador com os numeros (linhas, jogadores, valor).
OUTRAS DECISOES QUE VALEM: jogador sem preco = valor baixo ou nenhum; "descontado o dinheiro" vai sair de vez numa rodada SEGUINTE (nao mexer agora na regua, selos, portas nem conclusoes; nao acrescentar desconto novo); publicar no fim (o coordenador faz git e publicacao).
REGRAS DA CASA: nenhum numero digitado na tela; ausencia com motivo; analise nova declarada no bloco antes de medir; portugues de reuniao de clube com o vocabulario de proto.js; um dono por arquivo; set iterado vira sorted; comentario em prosa do por que.
ATENCAO — OUTRA SESSAO DO CLAUDE ESTA TRABALHANDO NO MESMO PROJETO AGORA (aba Financeiro/Orcamento e Bola parada): ela escreve \`static/app.js\`, \`app.py\`, \`templates/index.html\`, \`dados/premissas.json\`, \`dados/cenarios.json\`, \`docs/\` e faz commit e publicacao. VOCE NAO TOCA NESSES ARQUIVOS, nem para testar gravacao (SC_CENARIOS e SC_PREMISSAS sempre apontando para copias em ${W}).
PROIBIDO: qualquer git que escreva. NAO use nem derrube as portas 5090 e 5091. Teste headless com Playwright do Python numa porta PROPRIA (a da sua tarefa), servidor derrubado ao fim. Rascunhos em ${W}.`

const ESC = { type: 'object', properties: {
  arquivos_escritos: { type: 'array', items: { type: 'string' } },
  o_que_fiz: { type: 'array', items: { type: 'object', properties: { item: { type: 'string' }, onde: { type: 'string' }, como: { type: 'string' } }, required: ['item', 'onde', 'como'] } },
  chaves_do_json: { type: 'string' }, numeros_principais: { type: 'string' }, como_testei: { type: 'string' },
  riscos: { type: 'array', items: { type: 'string' } },
}, required: ['arquivos_escritos', 'o_que_fiz', 'chaves_do_json', 'numeros_principais', 'como_testei', 'riscos'] }

const CONF = { type: 'object', properties: {
  lente: { type: 'string' }, conferidos: { type: 'integer' }, medidas: { type: 'string' },
  problemas: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, onde: { type: 'string' }, o_que_vi: { type: 'string' }, por_que_importa: { type: 'string' }, conserto: { type: 'string' },
    gravidade: { type: 'string', enum: ['quebra', 'mente', 'falta', 'detalhe'] },
  }, required: ['arquivo', 'onde', 'o_que_vi', 'por_que_importa', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'conferidos', 'medidas', 'problemas', 'veredito'] }

const P_GERADOR = `SUA TAREFA: dono de \`gerar_prototipo.py\` (e so dele).
1. Pedido B: na etapa 5, em cada painel, grave por indicador a diferenca entre o time tipico que subiu e o tipico que caiu na escala das celulas (a mediana da faixa_sobe menos a mediana da faixa_cai, em posicao no ranking do ano) e a ordem das colunas pela diferenca em modulo, maior primeiro, empate pela ordem original. Nomes claros (ex.: \`diferenca_sobe_cai\` alinhada aos indicadores e \`ordem_por_diferenca\` com os indices), e a regra declarada no painel ou na etapa (\`regra_da_ordem\`). Indicador sem as duas faixas: null e fica no fim, com motivo.
2. Pedido C: declare na \`ponderado_por_jogador.regra\` que jogador listado em dois clubes na mesma temporada conta nos dois elencos, como o val_* conta, com os numeros medidos (linhas, jogadores, valor contado duas vezes). Nao mude numero.
3. Rode o main NO RASCUNHO (troque G.SAIDA para ${W}/prototipo_fecho.json; python3 -B), determinismo PYTHONHASHSEED 1 x 2, diff contra o dados/prototipo.json gravado: so as chaves novas da etapa 5 e a regra da etapa 1 podem mudar. NAO grave dados/prototipo.json (outra etapa grava depois da tela).
Devolva em chaves_do_json as chaves exatas com exemplo, e em numeros_principais, para 2 paineis, as 5 primeiras colunas da ordem nova com a diferenca.`

const LENTE_TELA = `A TELA COM O DADO JA GRAVADO, no navegador headless do app real (porta 5171; derrube ao fim; SC_CENARIOS/SC_PREMISSAS em ${W}), a 1.785 e a 400 px. Etapa 1: tabela por time aberta com filtro, jogadores e valor por jogador por setor, fatia do valor ao lado da fatia de jogadores, testes por jogador — os numeros da tela batem com o JSON? O Controle 2 diz que o sem preco e valor baixo ou nenhum, sem sobra da frase antiga? Etapa 14: empate tecnico por nome, intervalo, contagem por posicao, nenhuma posicao completa aparecendo vazia, filtro de nacionalidade ligado. As outras etapas com o dado novo (etapa 0 "293 coisas", etapa 11 sem 2026, etapa 13 margens com o gerador proprio): algo aparece sem explicacao ou contradiz texto fixo? Linguagem: numero digitado, jargao fora do numero pequeno, frase que afirma mais que o dado, receita. JA SABIDO (nao reporte): a etapa 5 ainda nao desenha a linha de quem subiu nem a ordem nova — e o pedido desta rodada.`
const LENTE_CONCL = `O EFEITO NAS CONCLUSOES, so leitura: _fonte/prototipo/CONCLUSOES.md e conclusoes_spec.json contra o dados/prototipo.json gravado. (a) Conclusoes que falam de valor por setor ou fatia do elenco (DIN-05 e outras): a leitura por jogador confirma, enfraquece ou contradiz? (b) Conclusoes ou ressalvas que dizem que o jogador sem preco deixa o valor subestimado. (c) Conclusoes cujos numeros mudaram com o dado novo (etapa 11 sem 2026, etapa 14 por posicao, etapa 13 margens, bugs de p). (d) Conclusao a conclusao, onde o selo depende do desconto pelo valor do elenco e qual selo sairia sem esse criterio pela regua escrita (prepara a proxima rodada). NAO edite nada.`

phase('Conferir e gerar')
const [ger, confTela, confConcl] = await Promise.all([
  agent(`${CASA}\n\n${P_GERADOR}`, { label: 'dono:gerador', phase: 'Conferir e gerar', schema: ESC, effort: 'high' }),
  agent(`${CASA}\n\nVOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. SUA LENTE: ${LENTE_TELA}`, { label: 'confere:tela-e-linguagem', phase: 'Conferir e gerar', schema: CONF, effort: 'high' }),
  agent(`${CASA}\n\nVOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. SUA LENTE: ${LENTE_CONCL}`, { label: 'confere:efeito-nas-conclusoes', phase: 'Conferir e gerar', schema: CONF, effort: 'high' }),
])
log(`gerador: ${ger ? 'ok' : 'FALHOU'} · tela: ${confTela ? confTela.veredito : 'FALHOU'} · conclusoes: ${confConcl ? confConcl.veredito : 'FALHOU'}`)

phase('Telas')
const probsTela = confTela ? confTela.problemas.filter(p => p.gravidade !== 'detalhe' || true) : []
const deArq = nome => probsTela.filter(p => (p.arquivo || '').includes(nome))
const P_PROTO_B = `SUA TAREFA: dono de \`static/proto_b.js\` (e so dele). Etapa 5, nas 11 matrizes (pb5Matriz e o rodape das faixas):
1. Pedido A: a linha "times que subiram", no MESMO formato das outras duas (1o numero · tipico · 3o numero, quartis), lida de faixa_sobe pelo vocabulario de faixa (ptK/ptFx/ptFxRot), acima das linhas do meio e de quem caiu. Com dado sem faixa_sobe: a linha aparece com a ausencia escrita, discreta.
2. Pedido B: colunas na ordem que o gerador gravou (as chaves do relato abaixo), com a diferenca no cabecalho em numero pequeno e o lado dito em portugues (ex.: "subiu +45 acima de quem caiu"), e a regra da ordem numa linha acima da matriz ("colunas da maior para a menor diferenca entre o time tipico que subiu e o que caiu"). As celulas, as linhas de faixa e a dica de cada coluna acompanham a coluna. Com dado sem as chaves (PONTOS de hoje, prototipo.js antigo): ordem original e a ausencia escrita discreta.
3. Consertos que a conferencia da tela apontou em proto_b.js: ${JSON.stringify(deArq('proto_b'), null, 1).slice(0, 8000)}
TESTE: pasta-espelho em ${W}/espelho_b com o static e um prototipo.js montado de ${W}/prototipo_fecho.json (mesma logica do gerar_prototipo_js.py, sem gravar no projeto), porta 5172; confira em 3 matrizes que a ordem e as diferencas da tela batem com o JSON e que a linha de quem subiu bate com faixa_sobe; e o app real com o dado gravado de hoje (sem as chaves de ordem): 16/16, zero erro, zero rolagem lateral a 1.785, nada cortado a 400.
Relato do gerador: ${JSON.stringify(ger, null, 1).slice(0, 12000)}`
const donosTela = [
  { k: 'proto_b', arq: ['static/proto_b.js'], p: P_PROTO_B },
]
for (const [k, nome, porta] of [['proto_a', 'proto_a.js', 5173], ['proto_c', 'proto_c.js', 5177], ['casca', 'proto.js', 5178]]) {
  const ps = deArq(nome).concat(k === 'casca' ? deArq('style.css').concat(deArq('proto_glossario')) : [])
  if (ps.length) donosTela.push({ k, arq: k === 'casca' ? ['static/proto.js', 'static/style.css', 'static/proto_glossario.js'] : ['static/' + nome],
    p: `SUA TAREFA: dono de ${k === 'casca' ? 'static/proto.js, static/style.css e static/proto_glossario.js' : 'static/' + nome} (e so disso). Conserte o que a conferencia da tela apontou nos seus arquivos, confirmando cada problema antes (o conferente pode ter errado: diga por que): ${JSON.stringify(ps, null, 1).slice(0, 10000)}. Teste no app real com o dado gravado (porta ${porta}): 16/16, zero erro, zero rolagem lateral a 1.785, nada cortado a 400.` })
}
const telas = (await parallel(donosTela.map(d => () => agent(`${CASA}\n\n${d.p}\n\nArquivos que VOCE pode escrever: ${d.arq.join(', ')}. Nenhum outro.`,
  { label: 'dono:' + d.k, phase: 'Telas', schema: ESC, effort: 'high' }).then(r => r ? { ...r, k: d.k } : null)))).filter(Boolean)

phase('Gravar')
const grav = ger ? await agent(`${CASA}\n\nSUA TAREFA: gravar o dado novo. Voce so RODA o gerador; nao edite codigo.
1. Copie dados/prototipo.json para ${W}/prototipo_antes.json.
2. Rode \`python3 -B gerar_prototipo.py\` e \`python3 gerar_prototipo_js.py\`.
3. Diff caminho a caminho contra a copia: so as chaves novas da etapa 5 (diferenca e ordem) e a regra da etapa 1 podem mudar.
4. Regressao headless no app real (porta 5174; SC_CENARIOS/SC_PREMISSAS em ${W}), a 1.785 e a 400 px: 16/16, zero erro, zero undefined/NaN, zero rolagem lateral a 1.785, nada cortado a 400; e na etapa 5, em TODAS as 11 matrizes: a linha dos times que subiram aparece com os numeros de faixa_sobe, e as colunas estao na ordem gravada com a diferenca certa no cabecalho.
Relatos: gerador ${JSON.stringify(ger, null, 1).slice(0, 8000)} telas ${JSON.stringify(telas, null, 1).slice(0, 10000)}`,
  { label: 'grava', phase: 'Gravar', schema: ESC, effort: 'high' }) : null

phase('Conferir final')
const fin = await agent(`${CASA}\n\nO que foi feito: ${JSON.stringify({ gerador: ger, telas, gravacao: grav, conferencia_tela_antes: confTela }, null, 1).slice(0, 50000)}\n\nVOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. Headless no app real (porta 5175; derrube ao fim), 1.785 e 400 px, tema claro e escuro: (1) etapa 5, as 11 matrizes: linha de quem subiu no formato das outras, com os numeros do JSON; colunas na ordem gravada; diferenca e lado no cabecalho batem com o JSON em todas as colunas de 3 matrizes sorteadas; (2) cada problema da conferencia da tela anterior esta resolvido ou recusado com prova; (3) regressao geral: 16/16, zero erro, zero undefined, zero rolagem lateral a 1.785, nada cortado a 400; (4) dados/prototipo.json e static/prototipo.js sincronizados; (5) a mesma aba desenhada com PONTOS num alvo temporario continua sem erro (ordem original, ausencias escritas).`,
  { label: 'confere:final', phase: 'Conferir final', schema: CONF, effort: 'high' })

let consertos = []
const graves = fin ? fin.problemas.filter(p => ['quebra', 'mente', 'falta'].includes(p.gravidade)) : []
if (graves.length) {
  phase('Consertar')
  const DON = [
    { k: 'gerador', arq: 'gerar_prototipo.py', porta: 5176 }, { k: 'proto_b', arq: 'proto_b.js', porta: 5179 },
    { k: 'proto_a', arq: 'proto_a.js', porta: 5173 }, { k: 'proto_c', arq: 'proto_c.js', porta: 5177 }, { k: 'casca', arq: 'proto.js', porta: 5178 },
  ]
  const por = {}
  for (const p of graves) { const d = DON.find(x => (p.arquivo || '').includes(x.arq)) || DON[1]; (por[d.k] = por[d.k] || []).push(p) }
  consertos = (await parallel(Object.entries(por).map(([k, ps]) => () => {
    const d = DON.find(x => x.k === k)
    return agent(`${CASA}\n\nRODADA DE CONSERTO (a ultima). Voce e dono de ${d.arq}${k === 'casca' ? ' e static/style.css' : ''}; nenhum outro arquivo. Porta ${d.porta}. ${k === 'gerador' ? 'Se o conserto mudar o dado, rode de novo python3 -B gerar_prototipo.py e gerar_prototipo_js.py e diga o diff.' : ''}\nProblemas:\n${JSON.stringify(ps, null, 1).slice(0, 20000)}\nConfirme cada um, conserte, rode o teste de novo (16/16, zero erro, zero rolagem lateral a 1.785, nada cortado a 400).`,
      { label: 'conserta:' + k, phase: 'Consertar', schema: ESC, effort: 'high' }).then(r => r ? { ...r, k } : null)
  }))).filter(Boolean)
}
return { gerador: ger, conferencia_tela: confTela, conferencia_conclusoes: confConcl, telas, gravacao: grav, conferencia_final: fin, consertos }
