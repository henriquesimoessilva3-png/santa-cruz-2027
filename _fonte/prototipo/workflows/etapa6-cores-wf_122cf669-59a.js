export const meta = {
  name: 'etapa6-cores',
  description: 'Etapa 6: pintar nas 73 miniaturas quem subiu (azul claro) e quem caiu (laranja) no ano seguinte, com a legenda e a frase ajustadas, e conferir no navegador',
  phases: [
    { title: 'Escrever', detail: 'proto_b.js' },
    { title: 'Conferir', detail: 'headless: cores contra o dado, legenda, frase, regressao' },
    { title: 'Consertar', detail: 'uma rodada' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'
const W = S + '/etapa6'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Aba Prototipo: \`static/proto_b.js\` desenha as etapas 5 a 8; a casca e \`static/proto.js\` (contrato em \`static/proto_contrato.md\`); dado na global PROTO (\`static/prototipo.js\`) e, na aba por pontos, PONTOS.
PEDIDO DO DONO (14/09, decidido): na etapa 6 ("O time que estava alto num ano continua alto no outro?"), as 73 miniaturas de dispersao hoje tem pontos sem cor. O dono quer MARCAR os times que subiram (AZUL CLARO) e os que cairam (LARANJA); os do meio ficam neutros (cinza). Isso substitui a decisao anterior de cor neutra (PENDENTE_RODADA.md item 10).
FATO QUE DECIDE A COR (confira no dado): cada ponto e um par de anos seguidos em que o clube esteve na Serie B nos dois; quem subiu ou caiu no PRIMEIRO ano nao tem par (no ano seguinte estava na A ou na C). Por isso a cor e o desfecho do ANO SEGUINTE — o ano do eixo vertical (no dado, o campo do par que diz a faixa do ano t+1; na aba por pontos, a faixa de pontos do ano seguinte, lida pelo vocabulario de faixa da casca: ptFx/ptFxRot).
O QUE A TELA TEM DE DIZER, com todas as letras e sem afirmar mais: a legenda de cores visivel (nao so em dica), com quantos pontos de cada cor em cada miniatura ou no total, lidos do dado; e a frase de abertura da etapa reescrita: a pergunta continua sendo a DIAGONAL (o time que estava alto continua alto?); a cor mostra outra coisa — o que o time fez no ano seguinte; pontos de uma cor em cima e de outra embaixo querem dizer que o numero daquele ano anda junto com o resultado daquele MESMO ano, e nao que o numero se repete. Mantenha o aviso de consequencia do resultado onde ja existe.
REGRAS: um dono por arquivo; nenhum numero digitado na tela; portugues de reuniao de clube com o vocabulario de proto.js; cores que se leiam no tema claro e no escuro (use as variaveis de cor da casca/style.css se existirem; se precisar de cor nova, declare em comentario e use a mesma no ponto e na legenda); pontos sobrepostos continuam visiveis (contorno ou transparencia). Nenhuma leitura direta de PROTO (use ptDado).
PROIBIDO: qualquer git que escreva. NAO EDITE nada alem de \`static/proto_b.js\`: outro fluxo esta escrevendo gerar_prototipo.py, proto_a.js, proto_c.js, proto.js e o dado AGORA — por isso termine rapido e nao mexa em outra etapa. NAO use nem derrube as portas 5090/5091. Teste headless com Playwright do Python na SUA porta, derrubada ao fim. Rascunhos em ${W}.`

const ESC = { type: 'object', properties: {
  arquivos_escritos: { type: 'array', items: { type: 'string' } },
  o_que_fiz: { type: 'string' }, contagens: { type: 'string' }, como_testei: { type: 'string' }, riscos: { type: 'array', items: { type: 'string' } },
}, required: ['arquivos_escritos', 'o_que_fiz', 'contagens', 'como_testei', 'riscos'] }
const CONF = { type: 'object', properties: {
  conferidos: { type: 'integer' }, medidas: { type: 'string' },
  problemas: { type: 'array', items: { type: 'object', properties: { onde: { type: 'string' }, o_que_vi: { type: 'string' }, conserto: { type: 'string' }, gravidade: { type: 'string', enum: ['quebra', 'mente', 'falta', 'detalhe'] } }, required: ['onde', 'o_que_vi', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['conferidos', 'medidas', 'problemas', 'veredito'] }

phase('Escrever')
const esc = await agent(`${CASA}\n\nSUA TAREFA: dono de \`static/proto_b.js\`. Faca o pedido do dono na etapa 6. Porta de teste: 5151 (app real, dado atual). Teste: 16/16 etapas, zero erro no console, zero rolagem lateral a 1.785 px, nada cortado a 400 px; e na etapa 6, para 3 miniaturas, conte no DOM os pontos de cada cor e compare com o dado.`,
  { label: 'dono:proto_b', phase: 'Escrever', schema: ESC, effort: 'high' })

phase('Conferir')
const conf = await agent(`${CASA}\n\nO dono relatou:\n${JSON.stringify(esc, null, 1).slice(0, 15000)}\n\nVOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. Headless na porta 5152 (derrube ao fim), a 1.785 e a 400 px, tema claro e escuro: (1) em TODAS as 73 miniaturas, a cor de cada ponto bate com o desfecho do ano seguinte do par no dado (conte por cor e compare); (2) nenhum ponto some ou muda de lugar em relacao a antes (compare as coordenadas com a versao do git HEAD servida numa copia em ${W}/head, porta 5153); (3) a legenda esta visivel e com numeros do dado; (4) a frase diz o que o pedido manda, sem afirmar que a cor mostra repeticao; (5) regressao: 16/16, zero erro, nada cortado; (6) a mesma etapa desenhada com PONTOS num alvo temporario usa as faixas de pontos, sem erro.`,
  { label: 'confere', phase: 'Conferir', schema: CONF, effort: 'high' })

let fix = null
const graves = conf ? conf.problemas.filter(p => p.gravidade !== 'detalhe') : []
if (graves.length) {
  phase('Consertar')
  fix = await agent(`${CASA}\n\nRODADA DE CONSERTO. Voce e dono de \`static/proto_b.js\` (porta 5154). Problemas:\n${JSON.stringify(conf.problemas, null, 1).slice(0, 15000)}\nConfirme cada um, conserte, rode o teste de novo (inclusive a contagem de cores contra o dado nas 73).`,
    { label: 'conserta', phase: 'Consertar', schema: ESC, effort: 'high' })
}
return { escrita: esc, conferencia: conf, conserto: fix }
