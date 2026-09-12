export const meta = {
  name: 'prototipo-gerador',
  description: 'Escrever e rodar gerar_prototipo.py, que produz dados/prototipo.json com os quatro pilares, a tipologia, os livres e os elencos',
  phases: [
    { title: 'Construir', detail: 'o script inteiro, rodado de verdade ate produzir o JSON' },
    { title: 'Conferir', detail: 'tres ceticos recalculam blocos diferentes por caminho proprio' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'

const CONTEXTO = `PROJETO Santa Cruz (${RAIZ}). Voce vai construir o dado da aba nova "Prototipo".

LEIA ANTES DE COMECAR, inteiros:
- ${RAIZ}/_fonte/prototipo/ESPECIFICACAO.md — a especificacao do metodo (52 KB, 13 secoes).
  Ela e o contrato. Foi escrita depois de cinco planos independentes e tres juizes, e cada
  numero marcado "(conferido)" foi recalculado nos arquivos deste repositorio.
- ${RAIZ}/_fonte/prototipo/TIPOLOGIA.md — a tipologia dos 16 que subiram: dois eixos
  declarados (TERRITORIO e ROTA), quatro grupos (5/3/3/5), com os testes que ela passou e os
  que ela NAO passou. Os grupos entram no JSON como estao.
- ${RAIZ}/_fonte/prototipo/LEVANTAMENTO.md — o levantamento do terreno.

AVISOS QUE VALEM MAIS QUE A ESPECIFICACAO (medidos depois dela, na Onda 2 de hoje):
1. \`analisar_serieb.py\` MUDOU hoje. O bug de nacionalidade foi corrigido (a conta era
   != "Brazil", entao "Brazil, Italy" e linha sem nacionalidade viravam estrangeiro: 215 de
   454 atleta-temporada). E \`valor_11\` agora sai do Transfermarkt por temporada, nao do
   snapshot do Wyscout. Use as funcoes de la, nao reimplemente.
2. \`dados/serieb_clube_temporada.csv\` agora tem 346 colunas (eram 288) e
   \`static/sb_clubes.js\` tem 272 campos (eram 226). Confira as colunas que existem HOJE.
3. \`statsmodels\`, \`pulp\` e \`ortools\` NAO estao instalados. numpy, pandas, scipy, sklearn e
   matplotlib estao. Residualizacao com np.linalg.lstsq; atribuicao de elenco com
   scipy.optimize.linear_sum_assignment.
4. A coluna de clube certa em serieb_tecnico.csv e "Equipa dentro de um periodo de tempo
   seleccionado". A coluna \`Equipa\` tem 530 valores distintos e esta ERRADA.
5. \`Sistema\` em serieb_jogos.csv vem como '4-2-3-1 (70.73%)'. Extraia com regex; sem isso
   nunique() devolve milhares.

REGRAS:
- Semente fixa em tudo que sorteia: rng = np.random.default_rng(7).
- NENHUMA frase escrita a mao no JSON. Cada afirmacao carrega n, p e rho. A tela monta o
  texto; o JSON so tem numero medido.
- 2026 tem 27 de 38 rodadas e NAO entra em media nenhuma. As medias sao das 80 completas.
- Onde o dado nao existir, grave a ausencia com o motivo — nunca impute.
- Reuse o que ja existe: analisar_serieb.py::media_pond, chave_nome; gerar_raio_serieb.py::
  POSICOES, chave_nome, carregar; e o bloco \`sobecai\` de dados/raio_ref.json.`

const RESULTADO = { type: 'object', properties: {
  rodou: { type: 'boolean' },
  saida_do_terminal: { type: 'string' },
  json_chaves: { type: 'array', items: { type: 'string' } },
  json_kb: { type: 'integer' },
  etapas_feitas: { type: 'array', items: { type: 'string' } },
  etapas_que_ficaram_de_fora: { type: 'array', items: { type: 'object', properties: {
    etapa: { type: 'string' }, por_que: { type: 'string' },
  }, required: ['etapa', 'por_que'] } },
  numeros_principais: { type: 'array', items: { type: 'object', properties: {
    nome: { type: 'string' }, valor: { type: 'string' }, onde_no_json: { type: 'string' },
  }, required: ['nome', 'valor', 'onde_no_json'] } },
  a_especificacao_errou: { type: 'string' },
  o_que_nao_consegui: { type: 'string' },
}, required: ['rodou', 'saida_do_terminal', 'json_chaves', 'json_kb', 'etapas_feitas',
  'etapas_que_ficaram_de_fora', 'numeros_principais', 'a_especificacao_errou', 'o_que_nao_consegui'] }

const CONF = { type: 'object', properties: {
  bloco: { type: 'string' },
  numeros_conferem: { type: 'boolean' },
  divergencias: { type: 'array', items: { type: 'object', properties: {
    campo: { type: 'string' }, no_json: { type: 'string' }, eu_medi: { type: 'string' },
    quem_esta_certo: { type: 'string' },
  }, required: ['campo', 'no_json', 'eu_medi', 'quem_esta_certo'] } },
  buracos: { type: 'array', items: { type: 'string' } },
  correcao_concreta: { type: 'string' },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['bloco', 'numeros_conferem', 'divergencias', 'buracos', 'correcao_concreta', 'veredito'] }

phase('Construir')
log('Escrevendo gerar_prototipo.py — as etapas 0 a 8 e 12 a 15 da especificacao')

const build = await agent(`${CONTEXTO}

TAREFA: escrever ${RAIZ}/gerar_prototipo.py e RODAR ate ele produzir ${RAIZ}/dados/prototipo.json.

ESCOPO — as etapas da secao 10 da especificacao, nesta prioridade:
  OBRIGATORIAS (o pedido do dono inteiro):
    0  o que esta sendo medido (100 clube-temporada, 80 completos, o funil)
    1  a linha de base do dinheiro, ANTES de qualquer pilar
    2  o catalogo dos indicadores, um por linha, com bruto e liquido de valor
    3  o aviso do sorteio, em numero (testes, esperados por acaso, BH, nulo do garimpo)
    4  confiabilidade de cada medida (split-half dentro da temporada)
    5  OS QUATRO PILARES, TIME A TIME, ANO A ANO, INDICADOR POR INDICADOR
       (tecnico individual, tecnico coletivo, fisico individual, fisico coletivo)
    6  isso se repete? (persistencia t -> t+1, 36 pares)
    7  a porta temporal (1o turno contra o 2o)
    8  o cemiterio dos padroes (os DOIS nulos lado a lado) + A TIPOLOGIA dos quatro grupos
       do TIPOLOGIA.md, com os times de cada um e os testes que ela passou e nao passou
   12  o funil dos livres em dez/26 (Serie B e sul-americanos, separados)
   13  a nota de encaixe, em tres pedacos, com o backtest
   14  os elencos propostos, como FAIXA (reamostragem), com o contrafactual do dinheiro
   15  treinador: o card do que NAO da, com os p do proxy de Sistema
  SE SOBRAR FOLEGO: 9, 10 e 11.

COMO TRABALHAR:
1. Leia a ESPECIFICACAO inteira primeiro. Ela tem a formula, o corte e o n de cada etapa.
2. Escreva o script com a documentacao da casa: comentario explicando POR QUE cada decisao,
   nao o que a linha faz. Leia analisar_serieb.py para pegar o tom.
3. RODE. Nao entregue script que voce nao viu rodar. Se uma etapa quebrar, conserte; se ela
   nao for possivel com o dado real, tire e explique em "etapas_que_ficaram_de_fora".
4. Confira o JSON: abra, veja as chaves, o tamanho, e os numeros principais.
5. Compare com o que a especificacao prometeu. Onde ela errou, diga em "a_especificacao_errou".

O JSON e lido por uma tela que vai mostrar a CONSTRUCAO, etapa por etapa — entao estruture-o
por etapa, e cada etapa com o que a tela precisa para desenhar sozinha.`,
  { label: 'gerador', phase: 'Construir', schema: RESULTADO, effort: 'high' })

log(`Gerador: rodou=${build && build.rodou}; JSON com ${build ? build.json_chaves.length : 0} chaves, ${build ? build.json_kb : 0} KB`)

phase('Conferir')
const BLOCOS = [
  { k: 'dinheiro-e-catalogo', p: `ETAPAS 1, 2 e 3: a linha de base do dinheiro, o catalogo de indicadores e o nulo do garimpo. Recalcule o AUC do posto de valor, a taxa de subida por quartil, os d de cada indicador (bruto e liquido) e a contagem de sobreviventes do BH — tudo por caminho proprio, sem usar o script dele.` },
  { k: 'pilares-e-tipologia', p: `ETAPAS 5 e 8: os quatro pilares time a time e a tipologia dos quatro grupos. Confira se os 16 clube-temporada estao nos grupos que o TIPOLOGIA.md diz, se as assinaturas batem, e se os pilares tem o n de atletas/jogos por celula. Recalcule tres celulas de cada pilar por conta propria.` },
  { k: 'livres-e-elencos', p: `ETAPAS 12, 13 e 14: o funil dos livres, a nota de encaixe e os elencos. Refaca o funil degrau a degrau e confira os totais. A nota de encaixe usa so indicadores que passam no portao de persistencia? O elenco proposto respeita posicao e a faixa de reamostragem? E o contrafactual do dinheiro esta la?` },
]
const confs = (await parallel(BLOCOS.map(b => () => agent(`${CONTEXTO}

VOCE CONFERE, e a sua inclinacao e achar erro. O script ${RAIZ}/gerar_prototipo.py foi escrito
por outro agente e produziu ${RAIZ}/dados/prototipo.json.

SEU BLOCO: ${b.p}

Recalcule por CAMINHO PROPRIO (nao rode o script dele; escreva o seu) e compare numero a
numero com o que esta no JSON. Onde divergir, diga quem esta certo e por que. Procure tambem
BURACOS: etapa que o JSON diz ter e nao tem, campo vazio, n que nao fecha, imputacao
escondida, numero que a tela nao conseguiria desenhar.

O que ele relatou: ${JSON.stringify(build, null, 1).slice(0, 40000)}`,
  { label: 'confere:' + b.k, phase: 'Conferir', schema: CONF, effort: 'high' })))).filter(Boolean)

return { build, confs }
