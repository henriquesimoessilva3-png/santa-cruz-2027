export const meta = {
  name: 'fecho-etapa5',
  description: 'Fecha a etapa 5: titulo e subtitulo da etapa em proto.js e conferencia independente do estado gravado (etapas 5 e 6) no app real',
  phases: [
    { title: 'Titulo', detail: 'proto.js: titulo e subtitulo da etapa 5' },
    { title: 'Conferir', detail: 'app real com o dado gravado das 20:24, independente' },
    { title: 'Consertar', detail: 'so o que quebra ou mente, por dono de arquivo' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Ranking/1abbf5c7-a19a-4f3a-89c2-26d0445cdbba/scratchpad'
const W = S + '/fecho5'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Aba Prototipo do estudo da Serie B: dado PROTO (\`static/prototipo.js\` = \`dados/prototipo.json\`, gerado por \`gerar_prototipo.py\`), telas \`static/proto.js\` (casca, onde mora PT_ETAPAS com titulo e subtitulo de cada etapa), \`proto_b.js\` (etapas 5-8), \`style.css\`; contrato \`static/proto_contrato.md\`. Leia \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\` (2.4 itens 1 e 7, 3 itens 2 e 7, 4 e 5).
ESTADO: nesta noite foram feitas e GRAVADAS (dados/prototipo.json md5 2859ed76..., gerado_em 2026-09-14 20:24) duas rodadas: (a) etapa 6 no desempenho do MESMO ano (miniaturas posicao x aproveitamento, cor pela faixa do ano, forca e sorte, ordem da mais forte, pares de mesmo posto marcados, sem nenhuma pergunta de "ano seguinte"/"repete"); (b) etapa 5 REDESENHADA a pedido do dono e aprovada por ele numa previa (\`${RAIZ}/_fonte/prototipo/sessao_14_09/etapa5_previa/previa_etapa5.html\`): em cada painel, ANTES da matriz, uma tabela com o numero na linha, quem subiu / ficou no meio / caiu nas colunas (valor tipico = mediana crua), a diferenca de quem subiu e de quem caiu contra o meio (% do meio ou p.p. quando o numero e %), "melhor/pior" so onde ha lado declarado, e dois selos de firmeza (subiu x meio, subiu x caiu: firme q<0,05; pode ser sorte p<0,05; sem diferenca clara); a matriz por time continua EMBAIXO como detalhe; exemplo nos dois formatos (% duelos aereos ganhos da zaga: posicao 60 · 60 · 27,5 contra valor 61,6% · 61,3% · 58,8%). Chaves no JSON: etapa_5.paineis[*].resumo_grupos, etapa_5.regra_do_resumo (contagem_geral 32 firmes · 73 pode ser sorte · 481 sem diferenca), etapa_5.exemplo; etapa_6.mesmo_ano. Relatos: \`${RAIZ}/_fonte/prototipo/sessao_14_09/etapa5_grupos_resultado.json\` e \`etapa6_mesmo_ano_resultado.json\`.
REGRAS: nenhum numero digitado na tela; portugues de reuniao de clube; um dono por arquivo; contraste >= 4,5:1.
OUTRA SESSAO DO CLAUDE TRABALHA NO MESMO REPOSITORIO (Financeiro/Orcamento e Bola parada): \`static/app.js\`, \`app.py\`, \`templates/index.html\`, \`static/bola_parada*\`, \`dados/premissas.json\`, \`dados/cenarios.json\`, \`docs/\` — NAO TOQUE (SC_CENARIOS/SC_PREMISSAS sempre em copias em ${W}).
PROIBIDO: git que escreva; publicar; tocar em gerar_pontos.py, dados/pontos.json, static/pontos.js, ranking_gaps.py, CONCLUSOES.md, conclusoes_spec.json. NAO use nem derrube as portas 5090 e 5091. Teste headless com Playwright do Python na porta da sua tarefa, servidor derrubado ao fim. Rascunhos em ${W}.`

const ESC = { type: 'object', properties: {
  arquivos_escritos: { type: 'array', items: { type: 'string' } },
  o_que_fiz: { type: 'string' }, como_testei: { type: 'string' }, riscos: { type: 'array', items: { type: 'string' } },
}, required: ['arquivos_escritos', 'o_que_fiz', 'como_testei', 'riscos'] }
const CONF = { type: 'object', properties: {
  conferidos: { type: 'integer' }, medidas: { type: 'string' },
  problemas: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, onde: { type: 'string' }, o_que_vi: { type: 'string' }, conserto: { type: 'string' },
    gravidade: { type: 'string', enum: ['quebra', 'mente', 'falta', 'detalhe'] },
  }, required: ['arquivo', 'onde', 'o_que_vi', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['conferidos', 'medidas', 'problemas', 'veredito'] }

phase('Titulo')
const tit = await agent(`${CASA}\n\nSUA TAREFA: dono de \`static/proto.js\` (e so dele). O titulo e o subtitulo da etapa 5 em PT_ETAPAS (perto da linha 348) ainda anunciam a matriz de posicao por time ("Cada time, cada ano"). Troque para o que a etapa mostra agora — sugestao do dono do proto_b.js: titulo "Quem subiu, quem ficou no meio, quem caiu" e subtitulo dizendo que e o valor tipico de cada grupo, a diferenca contra o meio e se ela e firme, com o detalhe por time embaixo. Confira tambem se o sumario, o glossario de etapas ou alguma ponte de outra etapa ainda chama a etapa 5 de "matriz"/"posicao de cada time" e ajuste SO o que estiver em proto.js (o resto, liste nos riscos). Teste no app real com o dado gravado, porta 5215: 16/16, zero erro, titulo novo no sumario e na etapa, a 1.785 e a 400 px.`,
  { label: 'dono:proto.js', phase: 'Titulo', schema: ESC, effort: 'high' })

phase('Conferir')
const conf = await agent(`${CASA}\n\nO dono do proto.js relatou: ${JSON.stringify(tit, null, 1).slice(0, 6000)}\n\nVOCE CONFERE O ESTADO GRAVADO, de forma independente, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. App REAL do projeto (static e dados do proprio projeto) na porta 5216, derrube ao fim; 1.785 e 400 px, tema claro e escuro.
(1) dados/prototipo.json e static/prototipo.js iguais; md5 do json; diff caminho a caminho contra ${S}/etapa5/prototipo_antes.json: so podem aparecer gerado_em, etapa_5.paineis[*].resumo_grupos, etapa_5.regra_do_resumo, etapa_5.exemplo, o texto de etapa_6.mesmo_ano.marca_consequencia.share_11 e a chave de registro ranking_gaps.guardas_no_json_inteiro.consequencia_sem_marca_depois_da_troca_do_texto (aceita pelo coordenador); qualquer outra diferenca e problema.
(2) etapa 5: titulo novo; nos 11 paineis a tabela vem antes da matriz; sorteie 3 paineis com semente 9 e confira TODAS as linhas contra o JSON (valor tipico com unidade, diferencas com % ou p.p., melhor/pior so com lado, os dois selos, ordem pela firmeza e pela lista do estudo); o exemplo bate; busca e "esconder" funcionam; a matriz embaixo tem as mesmas celulas e cabecalhos da versao do git HEAD do proto_b.js servida numa copia (porta 5217) com o mesmo dado.
(3) etapa 6: 73 miniaturas na ordem gravada, cores pela faixa do mesmo ano, pares de mesmo posto marcados, lista inteira com os distintos, share_11 com o texto novo, nenhuma ocorrencia de "repete", "ano seguinte" ou "diagonal".
(4) contraste >= 4,5:1 em 12 textos pequenos das etapas 5 e 6, nos dois temas.
(5) regressao: 16/16, zero erro de console, zero undefined/NaN, zero rolagem lateral da pagina a 1.785, nada cortado fora de caixa com rolagem a 400.
(6) leitura com os olhos do dono: a etapa 5 do site se le de relance como a previa aprovada? Aponte so o que ficou claramente pior que a previa.
(7) git status: os arquivos modificados sao so os esperados (CONTINUAR.md, dados/prototipo.json, static/prototipo.js, gerar_prototipo.py, static/proto.js, proto_b.js, proto_c.js, proto_contrato.md, proto_glossario.js, style.css) e nenhum da outra sessao.`,
  { label: 'confere:estado-gravado', phase: 'Conferir', schema: CONF, effort: 'high' })

let consertos = []
const graves = conf ? conf.problemas.filter(p => ['quebra', 'mente'].includes(p.gravidade)) : []
if (graves.length) {
  phase('Consertar')
  const DON = [{ k: 'proto_b', arq: 'proto_b.js', porta: 5218 }, { k: 'casca', arq: 'proto.js', porta: 5219 }, { k: 'css', arq: 'style.css', porta: 5220 }, { k: 'gerador', arq: 'gerar_prototipo.py', porta: 5221 }]
  const por = {}
  for (const p of graves) { const d = DON.find(x => (p.arquivo || '').includes(x.arq)) || ((p.arquivo || '').includes('prototipo.') ? DON[3] : DON[0]); (por[d.k] = por[d.k] || []).push(p) }
  consertos = (await parallel(Object.entries(por).map(([k, ps]) => () => {
    const d = DON.find(x => x.k === k)
    return agent(`${CASA}\n\nRODADA DE CONSERTO (a unica). Voce e dono de ${k === 'gerador' ? 'gerar_prototipo.py (se o conserto mudar o dado: copie dados/prototipo.json e static/prototipo.js para ' + W + ', rode python3 -B gerar_prototipo.py e python3 gerar_prototipo_js.py e mostre o diff)' : 'static/' + d.arq}; nenhum outro arquivo. Porta ${d.porta}. Problemas (confirme cada um; recuse com prova o que estiver errado):\n${JSON.stringify(ps, null, 1).slice(0, 15000)}\nDepois: 16/16, zero erro, zero rolagem lateral a 1.785, nada cortado a 400, no app real com o dado gravado.`,
      { label: 'conserta:' + k, phase: 'Consertar', schema: ESC, effort: 'high' }).then(r => r ? { ...r, k } : null)
  }))).filter(Boolean)
}
return { titulo: tit, conferencia: conf, consertos }
