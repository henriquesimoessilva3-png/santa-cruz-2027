export const meta = {
  name: 'aba-pontos-dados',
  description: 'Constroi o dado da aba nova por faixa de aproveitamento (ritmo do 6o e do 15o), espelhando as 16 etapas do Prototipo, com 2018-2021 no tecnico coletivo',
  phases: [
    { title: 'Auditar', detail: 'cada suposicao de sobe/meio/cai escondida no gerador' },
    { title: 'Construir', detail: 'gerar_pontos.py e ranking_gaps.py, rodados ate o JSON' },
    { title: 'Conferir', detail: 'tres ceticos: circularidade, numeros, espelho completo' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B.

O QUE EXISTE: a aba "Prototipo" le \`dados/prototipo.json\`, produzido por \`gerar_prototipo.py\`
(etapas 0 a 15), agrupando as 80 temporadas completas 2022-2025 pela POSICAO FINAL: sobe (1-4),
meio (5-16), cai (17-20).

O QUE O DONO DECIDIU (13/09/2026), com as palavras dele: "ao inves de pensar somente nos times
que subiram, ficaram no meio de tabela ou cairam, nao seria melhor pensar em faixa de pontos?
porque as vezes um time que subiu em um ano fez menos pontos que o quinto colocado em outro
ano". NAO jogar o Prototipo fora: uma ABA NOVA, que ESPELHA AS 16 ETAPAS com faixas de
APROVEITAMENTO DE PONTOS no lugar de sobe/meio/cai.

AS FAIXAS, JA DECIDIDAS E MEDIDAS:
- aproveitamento = pts / (3 * J)   (J, nao 38: Cuiaba e Figueirense 2019 e quatro de 2022-2025
  tem 37 jogos por buraco da fonte).
- ALTA  = aproveitamento >= media do aproveitamento do 6o colocado em 2022-2025 = 53,509%
- BAIXA = aproveitamento <  media do aproveitamento do 15o colocado em 2022-2025 = 38,377%
- MEDIA = o resto.
  Os cortes sao CALCULADOS no script e gravados no JSON com a regra — nunca digitados.
- 2022-2025: alta 24 (os 16 que subiram + Novorizontino 2024, Novorizontino 2023, Mirassol 2023,
  Sport 2023, Goias 2024, Vila Nova 2023, Criciuma 2025, Goias 2025) · media 35 · baixa 21 (os 16
  que cairam + Ituano 2023, Ponte Preta 2023, Chapecoense 2023, CRB 2024, Botafogo-SP 2025).
  Por ano (alta/media/baixa): 2022 4/12/4 · 2023 8/5/7 · 2024 6/9/5 · 2025 6/9/5.
- 2018-2021, mesma regua: alta 17 · media 45 · baixa 18. Goias 2018 subiu (4o, 60) e fica na
  media; CSA 2021 e America-MG 2019 nao subiram e ficam na alta; Figueirense e Oeste 2019 ficam
  na baixa sem cair. A regua e estavel: o 4o tipico fez 55,3% em 2022-25 e 54,2% em 2018-21.
- 2026 tem 27 de 38 rodadas: aparece so pelo RITMO de hoje (alta 5 · media 9 · baixa 6), com
  "provisorio" escrito, e NUNCA entra em media, corte ou teste.

OS DOIS UNIVERSOS (decisao antiga do projeto, e vale aqui): tecnico COLETIVO existe 2018-2025
(160 temporadas); tecnico INDIVIDUAL, fisico e valor de mercado so 2022-2025 (80). Cada numero
do JSON diz de que universo veio. Ranking dentro do ano neutraliza diferenca de nivel entre
periodos (a vantagem de mando mudou de um periodo para o outro: 59% contra 64% dos pontos em
casa), mas valor cru de indicador sensivel a mando nao se junta entre periodos.

FONTES: \`dados/serieb_clube_temporada.csv\` (2022-2026), \`dados/serieb_clube_temporada_2018_2021.csv\`,
\`dados/serieb_jogos.csv\` e \`dados/serieb_jogos_2018_2021.csv\` (jogo a jogo, para a porta temporal),
\`dados/serieb_tecnico.csv\` (individual, 2022-26), e o que o \`gerar_prototipo.py\` ja carrega.
Leia tambem \`_fonte/prototipo/ESPECIFICACAO.md\`, \`_fonte/prototipo/CONFERENCIA.md\` e
\`_fonte/prototipo/PENDENTE_RODADA.md\` (itens 6, 8 e 9 sao desta obra).

REGRAS DA CASA: semente fixa; nenhum numero ou frase digitada passando por medida; ausencia com
motivo, nunca imputacao; comentario em prosa explicando o POR QUE. numpy/pandas/scipy/sklearn sim,
statsmodels nao.

**PROIBIDO:** qualquer git que escreva (commit, push, add, reset, checkout de arquivo).
**NAO EDITE** \`gerar_prototipo.py\` (outra rodada vai mexer nele; ele tem edicoes nao commitadas
de hoje que voce DEVE usar: \`faixa_sobe\` e \`faixa_*_bruto\` na etapa 5), \`dados/prototipo.json\`,
\`static/prototipo.js\`, \`static/proto*.js\`, \`static/style.css\`, \`templates/index.html\`,
\`static/app.js\`. Achou bug no gerador do Prototipo? RELATE, nao conserte.
Arquivos que esta obra cria: \`gerar_pontos.py\`, \`ranking_gaps.py\`, \`gerar_pontos_js.py\`,
\`dados/pontos.json\`, \`static/pontos.js\`. Scripts de rascunho no /tmp.
Para usar o gerador do Prototipo como biblioteca: \`import gerar_prototipo as G\`; o \`main\` carrega
\`G.DECL = G.carregar_declaracao()\` — fora do main, carregue antes de chamar \`montar_matriz\`.`

const AUD = { type: 'object', properties: {
  suposicoes: { type: 'array', items: { type: 'object', properties: {
    etapa: { type: 'string' }, funcao: { type: 'string' }, linha: { type: 'string' },
    o_que_supoe: { type: 'string' },
    risco_com_faixas_de_pontos: { type: 'string' },
    como_tratar: { type: 'string' },
    gravidade: { type: 'string', enum: ['quebra', 'muda_numero_silencioso', 'so_rotulo'] },
  }, required: ['etapa', 'funcao', 'linha', 'o_que_supoe', 'risco_com_faixas_de_pontos', 'como_tratar', 'gravidade'] } },
  circularidade: { type: 'array', items: { type: 'object', properties: {
    indicador: { type: 'string' }, por_que_e_circular: { type: 'string' }, o_que_fazer: { type: 'string' },
  }, required: ['indicador', 'por_que_e_circular', 'o_que_fazer'] } },
  etapas_que_mudam_de_natureza: { type: 'array', items: { type: 'string' } },
  ordem_de_execucao_do_main: { type: 'array', items: { type: 'string' } },
}, required: ['suposicoes', 'circularidade', 'etapas_que_mudam_de_natureza', 'ordem_de_execucao_do_main'] }

const BUILD = { type: 'object', properties: {
  rodou: { type: 'boolean' },
  saida_do_terminal: { type: 'string' },
  arquivos: { type: 'array', items: { type: 'string' } },
  json_kb: { type: 'integer' },
  etapas: { type: 'array', items: { type: 'object', properties: {
    etapa: { type: 'string' }, universo: { type: 'string' }, estado: { type: 'string', enum: ['completa', 'adaptada', 'ausente_com_motivo'] },
    o_que_mudou_em_relacao_ao_prototipo: { type: 'string' },
  }, required: ['etapa', 'universo', 'estado', 'o_que_mudou_em_relacao_ao_prototipo'] } },
  tamanhos_das_faixas: { type: 'string' },
  top10_do_ranking_de_gaps: { type: 'array', items: { type: 'string' } },
  linha_da_sorte: { type: 'string' },
  suposicoes_tratadas: { type: 'integer' },
  suposicoes_nao_tratadas: { type: 'array', items: { type: 'string' } },
  bugs_do_gerador_do_prototipo_achados: { type: 'array', items: { type: 'string' } },
  o_que_nao_consegui: { type: 'string' },
}, required: ['rodou', 'saida_do_terminal', 'arquivos', 'json_kb', 'etapas', 'tamanhos_das_faixas',
  'top10_do_ranking_de_gaps', 'linha_da_sorte', 'suposicoes_tratadas', 'suposicoes_nao_tratadas',
  'bugs_do_gerador_do_prototipo_achados', 'o_que_nao_consegui'] }

const CONF = { type: 'object', properties: {
  lente: { type: 'string' },
  conferidos: { type: 'integer' },
  problemas: { type: 'array', items: { type: 'object', properties: {
    onde: { type: 'string' }, no_json: { type: 'string' }, eu_medi: { type: 'string' },
    por_que_importa: { type: 'string' }, conserto: { type: 'string' },
    gravidade: { type: 'string', enum: ['mente', 'quebra', 'falta', 'detalhe'] },
  }, required: ['onde', 'no_json', 'eu_medi', 'por_que_importa', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'conferidos', 'problemas', 'veredito'] }

phase('Auditar')

const aud = await agent(`${CASA}

TAREFA: AUDITAR \`${RAIZ}/gerar_prototipo.py\` INTEIRO (3.400+ linhas) antes de qualquer linha da
obra nova. O gerador foi escrito para sobe/meio/cai por posicao; trocar por faixas de pontos pode
quebrar alto ou — pior — mudar numero em silencio. Liste TODA suposicao ligada ao agrupamento:
- literais "sobe", "meio", "cai", "subiu"; \`pos <= 4\`, \`pos >= 17\`; \`faixa ==\`;
- tamanhos fixos: 16, 48, 16, 80, "4 por ano", "12 por ano" (ex.: nulos hipergeometricos que
  assumem 4 promovidos por ano; a etapa 0 que declara 16/48/16; poder estatistico com 16x48);
- a tipologia (etapa 8): eixos e cortes construidos NOS 16 QUE SUBIRAM, com medianas dos 16;
- os alvos fisicos e a nota de encaixe (etapas 12-14): perfis \`pct_sobe\`/\`pct_cai\`;
- o backtest e as "chegadas"; o elenco proposto e o contrafactual (quartil e taxa de SUBIDA);
- textos gravados no JSON que dizem "subiu", "subida", "acesso".
E a armadilha mais importante desta obra — CIRCULARIDADE: com as faixas definidas por PONTOS,
qualquer indicador que e pedaco dos pontos (vitorias, empates, derrotas, gols pro e contra,
saldo, pontos em casa e fora, pontos no 1o/2o turno, sequencias, aproveitamento contra G6, etc.)
separa as faixas POR CONSTRUCAO. A etapa 10 ja tem uma "lista branca de resultado"; confira se
ela cobre tudo que agora vira circular, e liste o que falta.
Diga tambem a ORDEM EXATA de execucao do \`main\` (o sorteio global depende da ordem).`,
  { label: 'audita-gerador', phase: 'Auditar', schema: AUD, effort: 'high' })

log(`Auditoria: ${aud ? aud.suposicoes.length : 0} suposicoes, ${aud ? aud.circularidade.length : 0} indicadores circulares`)

phase('Construir')

const build = await agent(`${CASA}

A AUDITORIA DO GERADOR (trate cada item):
${JSON.stringify(aud, null, 1).slice(0, 60000)}

TAREFA: construir e RODAR ate produzir \`dados/pontos.json\` e \`static/pontos.js\`.

1. \`${RAIZ}/ranking_gaps.py\` — modulo novo e COMPARTILHADO (o gerador do Prototipo vai
   importa-lo na proxima rodada; escreva pensando nos dois). Uma funcao que recebe o painel, a
   matriz de postos no ano, o valor cru, o rotulo de faixa por linha e a lista de indicadores, e
   devolve a TABELA DE TODAS AS DIFERENCAS, do maior gap para o menor (item 6 do PENDENTE):
   posicao media por faixa, gap = maior - menor, quem destoa e para que lado, tamanho, p do grupo
   que destoa contra o resto, q com desconto dos N testes, p descontado o dinheiro (e, nas linhas
   fisicas, dinheiro + tamanho do elenco rastreado), mediana CRUA de cada faixa, a marca
   "consequencia do resultado" (lista branca da etapa 10 + os circulares da auditoria), e a
   LINHA DA SORTE: sorteando os rotulos DENTRO do ano, mantendo os tamanhos por ano (1.000 vezes,
   gerador proprio \`np.random.default_rng([7, 23])\`), a distribuicao do maior gap e quantos
   gaps >= 20/25/30 o acaso produz. Na previa por posicao: maior gap do sorteio mediana 30,4,
   95% ate 37,6; medido 18 gaps >= 30 contra 1 do sorteio. Mais uma coluna "se repete no outro
   periodo?" quando o indicador existir nos dois.

2. \`${RAIZ}/gerar_pontos.py\` — importa o gerador do Prototipo como biblioteca e ESPELHA o \`main\`
   dele, na MESMA ORDEM, com as faixas de pontos. Caminho recomendado: marcar alta/media/baixa no
   campo que o gerador le (\`faixa\`) com os valores internos que as funcoes esperam, e gravar no
   JSON \`faixas.rotulos\` = {alta: "ritmo de briga pelo acesso", media: "meio", baixa: "ritmo de
   rebaixamento"} (a tela troca os textos). ONDE A AUDITORIA ACHOU SUPOSICAO, trate no gerador
   novo (funcao sua que substitui a do G) — nunca editando o G. Onde a etapa MUDA DE NATUREZA
   (tipologia construida nos 16; alvos de perfil; taxa de subida do contrafactual), decida e
   ESCREVA a decisao no JSON com o motivo. A tipologia, por exemplo: eixos e cortes CONGELADOS do
   Prototipo aplicados a faixa alta — nao reconstruidos — porque reconstruir nos 24 viraria outro
   estudo.
   Blocos a mais que so esta aba tem:
   - \`faixas\`: regra, cortes calculados, tamanhos por universo e por ano, a lista NOMINAL de quem
     muda de grupo em relacao a posicao (os 8 + 5 de 2022-25; os de 2018-21), e 2026 por ritmo;
   - \`tecnico_2018_2025\`: as partes do tecnico COLETIVO rodadas nas 160 (catalogo e sorteio da
     familia tecnica coletiva, pilar tecnico coletivo da etapa 5 com faixas nas duas escalas,
     persistencia t -> t+1, porta temporal 1o -> 2o turno com o jogo a jogo dos dois periodos),
     cada numero com o universo;
   - \`ranking_gaps\` (2022-2025, todos os indicadores) e \`ranking_gaps_tecnico_2018_2025\`;
   - \`circulares\`: os indicadores que viraram pedaco da definicao das faixas, fora de todo teste,
     com o motivo.
   Assert que nada de 2026 entra em media. Assert que nenhum indicador circular aparece como achado.

3. \`${RAIZ}/gerar_pontos_js.py\` — no molde do \`gerar_prototipo_js.py\`, escreve
   \`static/pontos.js\` com \`const PONTOS = {...};\`.

4. RODE os tres. Nao entregue o que nao viu rodar. Abra o JSON e confira chaves, tamanho, e que as
   16 etapas estao la (completas, adaptadas ou ausentes COM MOTIVO).`,
  { label: 'constroi', phase: 'Construir', schema: BUILD, effort: 'high' })

log(build && build.rodou ? `pontos.json com ${build.json_kb} KB; faixas ${build.tamanhos_das_faixas}` : 'NAO rodou')

phase('Conferir')

const LENTES = [
  { k: 'circularidade-e-faixas', p: `AS FAIXAS E A CIRCULARIDADE. Refaca as faixas do zero (cortes, tamanhos por universo e por ano, a lista nominal de quem muda de grupo). Depois cace a CIRCULARIDADE: todo indicador que e pedaco dos pontos separa as faixas por construcao. Varra o ranking de gaps, o catalogo, os pilares, as conclusoes gravadas, a tipologia e as notas: algum desses aparece como ACHADO? A etapa 10 e a lista de circulares cobrem tudo? E os nulos: algum ainda assume 4 por ano ou 16 por faixa?` },
  { k: 'numeros', p: `OS NUMEROS. Por caminho proprio, sem rodar os scripts da obra: (1) a linha de base do dinheiro com as faixas de pontos (taxa da faixa alta por quartil de valor, acerto do posto de valor); (2) o TOP 10 do ranking de gaps de 2022-2025 e a linha da sorte (maior gap do sorteio, gaps >= 30 medidos contra o sorteio); (3) tres celulas de cada pilar e as faixas crua e percentil de dois indicadores; (4) o bloco tecnico 2018-2025: tamanhos por universo, uma persistencia e uma porta temporal. Compare numero a numero.` },
  { k: 'espelho-completo', p: `O ESPELHO. Abra \`dados/prototipo.json\` e \`dados/pontos.json\` lado a lado e compare CHAVE A CHAVE, etapa a etapa. Toda etapa do Prototipo tem par na aba nova (completa, adaptada ou ausente COM MOTIVO)? Onde a etapa mudou de natureza (tipologia, alvos, contrafactual), a decisao esta escrita e e defensavel? Algum texto gravado ainda diz "subiu"/"acesso" onde a faixa e de pontos? A tela vai conseguir reusar o renderer do Prototipo (mesmas chaves, rotulos em \`faixas.rotulos\`)? Liste cada chave que difere e se isso quebra o reuso.` },
]

const confs = (await parallel(LENTES.map(l => () => agent(`${CASA}

A obra rodou. O que o construtor relatou:
${JSON.stringify(build, null, 1).slice(0, 40000)}

VOCE CONFERE, e a sua inclinacao e achar erro. SUA LENTE: ${l.p}`,
  { label: 'confere:' + l.k, phase: 'Conferir', schema: CONF, effort: 'high' })))).filter(Boolean)

return { auditoria: aud, construcao: build, conferencias: confs }
