export const meta = {
  name: 'fisico-arrastar-jogadores',
  description: 'Aba Fisico do app: arrastar os jogadores entre as colunas para reorganizar (mouse e toque), com a ordem valendo em todas as visoes e gravada como as outras mudancas da lista; teste headless e conserto',
  phases: [
    { title: 'Escrever', detail: 'static/app.js, trocado de uma vez no fim' },
    { title: 'Conferir', detail: 'arrastar de verdade no navegador headless, persistencia, visoes, regressao' },
    { title: 'Consertar', detail: 'uma rodada e reconferencia' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'
const W = S + '/arrastar'

const CASA = `PROJETO Santa Cruz (${RAIZ}): app "Montagem de Elenco" (Flask \`app.py\`, \`templates/index.html\`, \`static/app.js\`), publicado tambem como site estatico (\`publicar_site.py\` monta docs/, com \`window.__estatico = true\`; la o salvamento vai para o navegador ou para a nuvem Firebase quando logado).
PEDIDO DO DONO (14/09): na aba **Fisico**, na visao de comparacao em que cada JOGADOR e uma coluna (botoes de visao "Matriz · Mapa · Reguas · Tiras"; colunas de referencia "QUEM SOBE" e "QUEM CAI" a esquerda; depois os jogadores com nome, clube, contrato e os botoes pequenos; linhas agrupadas como "USO DA VELOCIDADE", "VOLUME", "ARRANQUE E FRENAGEM"...; ha listas gravadas com rotulo como "LW · 15 atletas · 13/09 22:27" e botoes "Regravar" e "Apagar"), o dono quer poder **ARRASTAR os jogadores entre as colunas, reorganizando a ordem**.
O QUE ENTREGAR:
1. Arrastar a coluna de um jogador (pegando pelo cabecalho dele) para outra posicao entre as colunas de jogadores, com marca visual de onde vai cair e o cursor certo. As colunas de referencia (quem sobe / quem cai) ficam fixas e nao aceitam soltura.
2. Funciona com MOUSE e com TOQUE (use Pointer Events; o drag-and-drop nativo do HTML nao funciona em toque). Um clique simples nos botoes do cabecalho (adicionar, abrir, remover) continua funcionando: so vira arrasto depois de mover alguns pixels. Rolagem da pagina/caixa durante o arrasto perto das bordas, se a lista for maior que a tela.
3. Alternativa sem arrastar, para acessibilidade: mover para a esquerda/direita pelo teclado quando o cabecalho estiver em foco (setas), sem atrapalhar atalhos existentes.
4. A NOVA ORDEM e a ordem da lista de jogadores do estado do app: vale nas quatro visoes (Matriz, Mapa, Reguas, Tiras) e onde mais essa lista for lida (exportar, PNG/PDF, contagem). Descubra COMO a lista e guardada hoje (estado em memoria, localStorage, cenario no servidor, nuvem Firebase no site) e faca a ordem ser gravada pelo MESMO caminho das outras mudancas da lista (se hoje a lista so vai para o arquivo quando se clica em "Regravar", a ordem tambem; se ha gravacao automatica, a ordem entra nela). Nao invente caminho novo de gravacao.
5. Funciona no app local (Flask) e no site estatico.
REGRAS: portugues simples em qualquer texto novo de tela (ex.: dica "arraste para mudar a ordem"); nada de biblioteca externa nova; codigo no estilo do app.js; comentario em prosa do por que.
COMO ESCREVER SEM ATRAPALHAR OUTROS FLUXOS: outros fluxos estao testando a aba Prototipo no navegador AGORA e carregam o app.js. Trabalhe numa COPIA em ${W}, rode \`node --check\`, teste por pasta-espelho, e so no FIM troque o \`static/app.js\` do projeto de uma vez, com \`cat copia > static/app.js\` (preserva o arquivo, que tem link fisico), conferindo antes com cmp que ninguem mais mexeu nele desde que voce copiou.
PROIBIDO: qualquer git que escreva. NAO EDITE nenhum outro arquivo do projeto (static/style.css, proto*.js, templates, gerar_*.py e dados estao com outros fluxos): estilo novo vai por classe criada em JS ou estilo inline curto. NAO use nem derrube as portas 5090/5091. Testes com Playwright do Python numa porta propria, com as variaveis SC_CENARIOS e SC_PREMISSAS apontando para arquivos em ${W} (NUNCA grave cenario no projeto), derrubando o servidor no fim.`

const ESC = { type: 'object', properties: {
  arquivos_escritos: { type: 'array', items: { type: 'string' } },
  onde_mora: { type: 'string' },
  como_a_lista_e_guardada: { type: 'string' },
  o_que_fiz: { type: 'array', items: { type: 'string' } },
  como_testei: { type: 'string' },
  riscos: { type: 'array', items: { type: 'string' } },
}, required: ['arquivos_escritos', 'onde_mora', 'como_a_lista_e_guardada', 'o_que_fiz', 'como_testei', 'riscos'] }
const CONF = { type: 'object', properties: {
  conferidos: { type: 'integer' }, medidas: { type: 'string' },
  problemas: { type: 'array', items: { type: 'object', properties: { onde: { type: 'string' }, o_que_vi: { type: 'string' }, conserto: { type: 'string' }, gravidade: { type: 'string', enum: ['quebra', 'mente', 'falta', 'detalhe'] } }, required: ['onde', 'o_que_vi', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['conferidos', 'medidas', 'problemas', 'veredito'] }

phase('Escrever')
const esc = await agent(`${CASA}\n\nSUA TAREFA: dono de \`static/app.js\` nesta rodada. Faca o pedido. Porta de teste: 5161. Teste: abrir a aba Fisico, montar uma comparacao com pelo menos 5 jogadores (use uma lista gravada existente se houver, ou adicione pela busca), arrastar com mouse (page.mouse down/move/up) e com toque (contexto com has_touch e touchscreen) e conferir a ordem no DOM nas quatro visoes; conferir que os botoes do cabecalho continuam respondendo ao clique; gravar pelo caminho normal (no espelho) e recarregar: a ordem volta; zero erro no console; a aba Prototipo continua abrindo sem erro.`,
  { label: 'dono:app.js', phase: 'Escrever', schema: ESC, effort: 'high' })

phase('Conferir')
const conf = await agent(`${CASA}\n\nO dono relatou:\n${JSON.stringify(esc, null, 1).slice(0, 20000)}\n\nVOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. Headless na porta 5162 (derrube ao fim), app servido com SC_CENARIOS/SC_PREMISSAS no rascunho, a 1.785 px e a 400 px: (1) arrastar pelo mouse e pelo toque, para o inicio, para o fim e para o meio, varias vezes seguidas: a ordem no DOM bate com o que foi solto, nas quatro visoes; (2) colunas de referencia fixas, nao aceitam soltura; (3) clique simples nos botoes do cabecalho continua fazendo o que fazia (adicionar, abrir, remover) e nao dispara arrasto; rolar a pagina no toque continua funcionando; (4) teclado move a coluna; (5) persistencia pelo mesmo caminho das outras mudancas (confira no codigo qual e) e recarregar mantem a ordem; mudar de lista gravada e voltar mantem a ordem certa de cada uma; (6) o site estatico: monte uma copia do docs/ no rascunho (rode o publicar_site.py numa copia do projeto em ${W}/site, sem --push e sem gravar no projeto) e repita o arrasto e a persistencia no modo estatico; (7) regressao: zero erro no console, a aba Prototipo abre, as outras abas abrem.`,
  { label: 'confere', phase: 'Conferir', schema: CONF, effort: 'high' })

let fix = null, reconf = null
const graves = conf ? conf.problemas.filter(p => p.gravidade !== 'detalhe') : []
if (graves.length) {
  phase('Consertar')
  fix = await agent(`${CASA}\n\nRODADA DE CONSERTO. Voce e dono de \`static/app.js\` (porta 5163). Problemas:\n${JSON.stringify(conf.problemas, null, 1).slice(0, 20000)}\nConfirme cada um, conserte na copia, teste de novo, e troque o arquivo do projeto de uma vez como antes.`,
    { label: 'conserta', phase: 'Consertar', schema: ESC, effort: 'high' })
  reconf = await agent(`${CASA}\n\nRECONFERENCIA (porta 5164; derrube ao fim). Problemas de antes:\n${JSON.stringify(graves, null, 1).slice(0, 15000)}\nConserto:\n${JSON.stringify(fix, null, 1).slice(0, 15000)}\nConfira cada problema de novo no app local (e o arrasto no site estatico montado no rascunho), e a regressao. Voce NAO escreve em arquivo do projeto.`,
    { label: 'reconfere', phase: 'Consertar', schema: CONF, effort: 'high' })
}
return { escrita: esc, conferencia: conf, conserto: fix, reconferencia: reconf }
