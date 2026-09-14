export const meta = {
  name: 'aba-prototipo',
  description: 'Constroi a aba Prototipo: o dado do prototipo.json virando tela, etapa 0 a 15, no padrao da casa',
  phases: [
    { title: 'Casca', detail: 'gerador do JS, aba no index.html, fiacao no app.js e o contrato dos helpers' },
    { title: 'Etapas', detail: 'tres arquivos, um dono cada: etapas 0-4, 5-8 e 9-15' },
    { title: 'Costura', detail: 'node --check, contrato batido, o que quebrou consertado' },
    { title: 'Revisao', detail: 'um confere numero por numero, outro confere o desenho' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Aplicacao Flask: \`app.py\`, \`templates/index.html\`,
\`static/app.js\` (11.156 linhas), \`static/style.css\` (3.095 linhas).

VOCE ESTA CONSTRUINDO A ABA "PROTOTIPO". O dono pediu ela explicitamente e ela NAO existe.

A REGRA QUE MANDA EM TUDO: **o dado e a fonte, o texto e consequencia.**
Nenhum numero escrito a mao no HTML ou no JS. Nenhuma frase com numero dentro que nao tenha
sido calculada do dado na hora. Se o JSON mudar, a tela muda sozinha. Essa e a regra da aba
Serie B e vale igual aqui. Onde o dado nao existir, a tela ESCREVE a ausencia e o motivo —
nunca esconde, nunca inventa, nunca deixa "—" pelado sem explicacao.

O DADO: ${RAIZ}/dados/prototipo.json — 1,08 MB, 24 chaves, \`etapa_0\` a \`etapa_15\`, mais
\`_doc\`, \`bases\`, \`semente\`, \`replicas\`, \`sobecai_corrigido_por_clube\` e
\`controles_obrigatorios\`. Abra e LEIA a estrutura antes de desenhar. Cada etapa tem
\`titulo_chave\` e os campos que a tela precisa.

O DESENHO, ETAPA POR ETAPA, esta na **secao 10 do ${RAIZ}/_fonte/prototipo/ESPECIFICACAO.md**
(linhas 396 a 433). Leia junto a **secao 11** (linhas 434 a 447), "Os controles obrigatorios":
sao tres, nenhum e opcional, e os tres tem que aparecer NA TELA, nao em rodape.
O ${RAIZ}/_fonte/prototipo/TIPOLOGIA.md tem os quatro grupos que a etapa 8 mostra.

O PADRAO DA CASA — leia antes de escrever uma linha:
- \`templates/index.html\` linha 123: \`<nav class="abas">\` com \`<button class="aba"
  data-aba="serieb">\`. As paginas sao \`<section class="pagina oculta" id="pgSerieB">\`.
- \`static/app.js\` linha ~5768: \`function irParaAba(nome)\` alterna \`.oculta\` e chama o
  renderer da aba (\`if (nome === 'serieb') sbRender();\`).
- O dado viaja como JS gerado: \`static/sb_clubes.js\` e escrito por \`gerar_sb_clubes.py\` e
  comeca com "GERADO POR ... — NAO EDITE A MAO". O \`index.html\` carrega com
  \`<script src="/static/sb_clubes.js?v={{ ver }}">\`.
- O renderer de referencia e \`sbRender()\` em \`static/app.js\` (linha 10800). LEIA ELE.
  E dali que sai o tom: SVG montado a mao, helpers \`$\`, \`$$\`, \`esc\`, prosa gerada do dado,
  e comentario em portugues explicando POR QUE a decisao — nunca o que a linha faz.
- Comentario da casa e prosa, nao etiqueta. Exemplo real do app.js:
  "Temporada em andamento nao cabe neste eixo em pontos absolutos: em 2026, na 27a rodada,
  o 6o tem 43 pontos e o 2o tem 49 — abaixo de onde comeca a faixa de qualquer ano completo."
  E assim que se escreve aqui. Escreva a armadilha, nao a obviedade.

CSS: use as variaveis que ja existem em \`static/style.css\`. Nao invente paleta. Se precisar
de classe nova, prefixo \`pt-\`, e acrescente no fim do style.css num bloco com cabecalho.

O AVISO QUE VAI NO TOPO DA ABA: os numeros do prototipo.json estao sendo conferidos por tres
ceticos NESTE MOMENTO, em outro workflow. Ate a conferencia voltar, a aba abre com uma tarja
dizendo, em portugues claro, que o dado ainda nao foi recalculado por caminho independente.
A tarja le a data de \`gerado_em\` do JSON — nao escreva data a mao.`

const CONTRATO_PATH = `${RAIZ}/static/proto_contrato.md`

const CASCA_OUT = { type: 'object', properties: {
  rodou: { type: 'boolean' },
  arquivos_criados: { type: 'array', items: { type: 'string' } },
  arquivos_tocados: { type: 'array', items: { type: 'string' } },
  kb_do_prototipo_js: { type: 'integer' },
  contrato: { type: 'string' },
  helpers: { type: 'array', items: { type: 'object', properties: {
    nome: { type: 'string' }, assinatura: { type: 'string' }, para_que: { type: 'string' },
  }, required: ['nome', 'assinatura', 'para_que'] } },
  pontos_de_montagem: { type: 'array', items: { type: 'object', properties: {
    etapa: { type: 'string' }, funcao_que_o_arquivo_deve_definir: { type: 'string' },
    id_do_container: { type: 'string' },
  }, required: ['etapa', 'funcao_que_o_arquivo_deve_definir', 'id_do_container'] } },
  o_que_nao_consegui: { type: 'string' },
}, required: ['rodou', 'arquivos_criados', 'arquivos_tocados', 'kb_do_prototipo_js',
  'contrato', 'helpers', 'pontos_de_montagem', 'o_que_nao_consegui'] }

const ETAPA_OUT = { type: 'object', properties: {
  arquivo: { type: 'string' },
  etapas_feitas: { type: 'array', items: { type: 'string' } },
  etapas_que_ficaram_de_fora: { type: 'array', items: { type: 'object', properties: {
    etapa: { type: 'string' }, por_que: { type: 'string' },
  }, required: ['etapa', 'por_que'] } },
  node_check_passou: { type: 'boolean' },
  linhas: { type: 'integer' },
  campos_do_json_que_usei: { type: 'array', items: { type: 'string' } },
  campos_que_a_especificacao_pede_e_o_json_nao_tem: { type: 'array', items: { type: 'string' } },
  numero_escrito_a_mao: { type: 'boolean' },
  o_que_nao_consegui: { type: 'string' },
}, required: ['arquivo', 'etapas_feitas', 'etapas_que_ficaram_de_fora', 'node_check_passou',
  'linhas', 'campos_do_json_que_usei', 'campos_que_a_especificacao_pede_e_o_json_nao_tem',
  'numero_escrito_a_mao', 'o_que_nao_consegui'] }

const COSTURA_OUT = { type: 'object', properties: {
  tudo_carrega: { type: 'boolean' },
  node_check: { type: 'string' },
  consertos: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, o_que_quebrava: { type: 'string' }, o_conserto: { type: 'string' },
  }, required: ['arquivo', 'o_que_quebrava', 'o_conserto'] } },
  funcoes_chamadas_mas_nao_definidas: { type: 'array', items: { type: 'string' } },
  campos_do_json_lidos_que_nao_existem: { type: 'array', items: { type: 'string' } },
  como_abrir: { type: 'string' },
  o_que_nao_consegui: { type: 'string' },
}, required: ['tudo_carrega', 'node_check', 'consertos', 'funcoes_chamadas_mas_nao_definidas',
  'campos_do_json_lidos_que_nao_existem', 'como_abrir', 'o_que_nao_consegui'] }

const REV_OUT = { type: 'object', properties: {
  lente: { type: 'string' },
  problemas: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, linha: { type: 'integer' },
    o_que_esta_errado: { type: 'string' }, o_conserto: { type: 'string' },
    gravidade: { type: 'string', enum: ['quebra', 'mente', 'feio'] },
  }, required: ['arquivo', 'o_que_esta_errado', 'o_conserto', 'gravidade'] } },
  numeros_conferidos: { type: 'integer' },
  numeros_que_nao_batem: { type: 'array', items: { type: 'string' } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'problemas', 'numeros_conferidos', 'numeros_que_nao_batem', 'veredito'] }

phase('Casca')
log('Casca: gerador do JS, aba no index.html, fiacao no app.js e o contrato')

const casca = await agent(`${CASA}

TAREFA: a CASCA da aba, e o CONTRATO que os outros tres agentes vao obedecer.
Voce e o UNICO que toca em \`templates/index.html\`, \`static/app.js\` e \`static/style.css\`.
Os outros tres so escrevem os arquivos deles. Se voce deixar o contrato ambiguo, eles erram.

O QUE VOCE ENTREGA:

1. \`${RAIZ}/gerar_prototipo_js.py\` — le \`dados/prototipo.json\` e escreve
   \`static/prototipo.js\` com \`const PROTO = {...};\`, cabecalho "GERADO POR
   gerar_prototipo_js.py — NAO EDITE A MAO" no tom do \`gerar_sb_clubes.py\`. RODE ele.

2. \`templates/index.html\`: o botao \`<button class="aba" data-aba="prototipo">Protótipo</button>\`
   depois de "Análise Série B", a \`<section class="pagina oculta" id="pgProto">\` com o
   container, e as tags \`<script>\` dos cinco arquivos novos, ANTES do app.js.

3. \`static/app.js\`: a linha do \`irParaAba()\` — o toggle do \`#pgProto\` e o
   \`if (nome === 'prototipo') ptRender();\`. SO ISSO no app.js. Nao mexa em mais nada la:
   sao 11 mil linhas que ja funcionam.

4. \`static/proto.js\` — A CASCA, e so ela:
   - \`ptRender()\`: monta o esqueleto da aba, a tarja de conferencia (lendo \`PROTO.gerado_em\`),
     a navegacao entre as 16 etapas, e chama \`ptEtapa0()\` ... \`ptEtapa15()\` se existirem.
     **Se uma funcao de etapa ainda nao existir, a tela mostra o lugar dela com o aviso** —
     nunca quebra. Isso importa: os tres arquivos vao chegar depois de voce.
   - A navegacao: 16 etapas e muito para rolagem cega. Faca sumario lateral ou faixa de
     passos clicavel, no estilo que a aba Serie B ja usa para os blocos dela.
   - Os HELPERS COMPARTILHADOS, que os outros tres vao usar e NAO redefinir:
     numero em pt-BR (virgula decimal), p-valor (com "< 0,001"), d de Cohen com sinal,
     celula colorida por percentil, barra, tabela ordenavel, card de etapa com titulo e
     subtitulo, e o rotulo de n. Nomes com prefixo \`pt\`.
   - **Os tres controles obrigatorios da secao 11 da ESPECIFICACAO**, como componente que os
     outros chamam: a baseline de dinheiro (AUC e acertos, lidos do JSON) tem que aparecer ao
     lado de TODA proposta, nao no rodape.

5. \`${CONTRATO_PATH}\` — o contrato, em markdown. Para cada etapa 0 a 15: o nome exato da
   funcao que o arquivo dono tem que definir, o id do container onde ela escreve, qual arquivo
   e o dono, e de qual chave do \`PROTO\` ela tira o dado. Mais a lista dos helpers com
   assinatura e um exemplo de uso de cada. **Este arquivo e a unica coisa que os outros tres
   leem de voce.** Escreva como quem sabe que nao vai poder responder pergunta depois.

   A DIVISAO, e ela e fixa:
     \`static/proto_a.js\` — etapas 0, 1, 2, 3, 4
     \`static/proto_b.js\` — etapas 5, 6, 7, 8
     \`static/proto_c.js\` — etapas 9, 10, 11, 12, 13, 14, 15

6. CSS das classes \`pt-\` no fim do \`static/style.css\`, num bloco com cabecalho explicando
   o que e a aba. Use as variaveis de cor que ja existem.

CONFIRA ANTES DE ENTREGAR: \`node --check\` em cada .js que voce escreveu, e
\`python3 -c "import json; json.load(open('dados/prototipo.json'))"\` para garantir que o
gerador leu o que devia.`,
  { label: 'casca', phase: 'Casca', schema: CASCA_OUT, effort: 'high' })

log(casca && casca.rodou
  ? `Casca de pe: ${casca.arquivos_criados.length} arquivos, prototipo.js com ${casca.kb_do_prototipo_js} KB`
  : 'Casca falhou — as etapas vao sair mancas')

phase('Etapas')

const GRUPOS = [
  { f: 'proto_a.js', n: '0 a 4', p: `ETAPAS 0, 1, 2, 3 e 4 — a fundacao da aba.

  0  O QUE ESTA SENDO MEDIDO. 100 clube-temporada, 80 completos (16 sobe / 48 meio / 16 cai),
     2026 em cinza com "27 de 38 rodadas — nao entra em media nenhuma". Ao lado: o que 16
     permite (comparar medias) e o que NAO permite (recortar subgrupo). Mais o funil.
  1  A LINHA DE BASE DO DINHEIRO, ANTES DE QUALQUER PILAR. Quartil de valor x taxa de subida,
     o top-4 de valor de cada ano contra as 16 subidas, e o AUC so com o posto de valor.
     Esta etapa e o primeiro paragrafo da aba de proposito: quem le encontra o dinheiro na
     entrada, nao no rodape. Desenhe ela como abertura, nao como nota de rodape.
  2  O CATALOGO DOS INDICADORES, UM POR LINHA. A tabela da secao 6.1 da ESPECIFICACAO,
     ORDENAVEL por qualquer coluna, com bruto e liquido de valor lado a lado, e a "porta"
     (A/B/C) de cada indicador. Sao 293 linhas: precisa de filtro por pilar/familia e de
     busca. E aqui que "indicador por indicador" fica auditavel.
  3  O AVISO DO SORTEIO, EM NUMERO. Bloco FIXO no topo da etapa 2: quantos testes, quantos
     sairiam por acaso a 5%, quantos sobrevivem ao Benjamini-Hochberg, e o nulo do garimpo.
     Sem esse bloco a etapa 2 vira garimpo com cara de achado.
  4  CONFIABILIDADE DE CADA MEDIDA. Barra por indicador com o split-half corrigido.
     Hachura abaixo de 0,40 — e a legenda diz o que a hachura quer dizer.` },

  { f: 'proto_b.js', n: '5 a 8', p: `ETAPAS 5, 6, 7 e 8 — o coracao do estudo.

  5  OS QUATRO PILARES, TIME A TIME, ANO A ANO, INDICADOR POR INDICADOR. Quatro paineis
     (tecnico individual, tecnico coletivo, fisico individual, fisico coletivo). Em cada um:
     matriz de 16 linhas (clube-ano que subiu) x N colunas (indicadores), celula colorida pelo
     percentil DENTRO DO ANO, com a faixa do meio e a de quem caiu ao pe. Clique na celula
     abre valor bruto, posto, n de atletas ou de jogos, e o ano.
     **Setor com menos de 3 atletas sai VAZIO com o motivo escrito na celula.** Isso e regra,
     nao detalhe: celula com tres atletas nao e media, e anedota com cara de media.
  6  ISSO SE REPETE? Dispersao do posto em t contra t+1, 36 pares, com o rho no canto e
     seletor por indicador. Tem que dar para ver na mesma escala que um indicador fisico fica
     alto e o ppda fica perto de zero. Legenda: "caracteristica que nao se repete de um ano
     para o outro e retrato de um ano, nao modelo de jogo".
  7  A PORTA TEMPORAL. A tabela da secao 6.4: indicador do 1o turno contra pontos do 2o turno,
     bruto e parcial. Titulo: "o que eles fizeram, ou o que aconteceu com quem estava subindo?"
  8  O CEMITERIO DOS PADROES. A tabela da secao 7.1 com os DOIS nulos LADO A LADO — o
     embaralhado dando p=0,000 e o de mesma covariancia dando p alto. Mais o Jaccard contra a
     linha de 0,75. Titulo: "por que esta aba nao tem grupos de times".
     **E a TIPOLOGIA** (${RAIZ}/_fonte/prototipo/TIPOLOGIA.md): os quatro grupos em eixos
     DECLARADOS, com os clube-ano de cada um, e — isto e obrigatorio — os testes que ela
     passou E os que ela NAO passou. A tipologia vale porque foi validada fora da construcao;
     a tela tem que dizer isso, senao vira o agrupamento cego que a etapa acabou de enterrar.` },

  { f: 'proto_c.js', n: '9 a 15', p: `ETAPAS 9 a 15 — as reguas, o mercado e o que nao da.

  9  AS NOVE REGUAS, mais os itens crus de cada eixo com os p deles.
 10  CAUSA OU CONSEQUENCIA. Lista curta do que separa forte e e o resultado redescrito.
     Rotulo grande: "NAO CONTRATE PARA ISTO". Esta etapa existe para impedir um erro caro.
 11  O TESTE DA MALA. Barras pareadas: o rho de cada indicador tecnico quando o atleta MUDA de
     clube contra quando FICA, e o fisico ao lado. A frase que a tela sustenta e "o que voce
     compra num jogador e o fisico e o duelo; o volume de passe dele era do time anterior" —
     mas ela so pode aparecer se os numeros do JSON a sustentarem. Confira antes de escrever.
 12  O FUNIL DOS LIVRES. Cascata CLICAVEL, com quem saiu e por que em cada degrau, e o aviso
     de que dez/26 e calendario, nao oportunidade.
 13  NOTA DE ENCAIXE EM TRES PEDACOS, com o peso de cada bloco e o \`sc_n\` ao lado do numero
     fisico. Liga sem cobertura fisica marcada como "sem base para pontuar".
     **O resultado do backtest vai no CABECALHO da tela**, nao escondido embaixo.
 14  ELENCO COMO FAIXA (reamostragem), com o contrafactual do dinheiro ao pe: a folha implicita
     e o valor somado, no posto de valor que ocupariam na Serie B, com a taxa historica de
     subida daquele quartil escrita em voz alta.
 15  TREINADOR: O QUE NAO DA. Card vazio, com o motivo, os p do proxy de \`Sistema\`, e a lista
     do que exigiria coletar. Card honesto vale mais que numero inventado.` },
]

const etapas = (await parallel(GRUPOS.map(g => () => agent(`${CASA}

A casca da aba ja esta de pe. **LEIA O CONTRATO PRIMEIRO: ${CONTRATO_PATH}.**
Ele diz o nome exato da funcao que voce define, o id do container onde ela escreve, e os
helpers que voce USA e NAO redefine. Obedeca ao contrato ao pe da letra — outros dois agentes
estao escrevendo os arquivos irmaos agora, contra o mesmo contrato.

VOCE E DONO DE UM ARQUIVO SO: \`${RAIZ}/static/${g.f}\`.
NAO toque em \`app.js\`, \`index.html\`, \`style.css\`, \`proto.js\` nem nos arquivos dos outros.
Se faltar um helper, escreva a sua versao DENTRO do seu arquivo, com prefixo proprio, e
registre isso em "o_que_nao_consegui" — nao edite a casca.

SUAS ETAPAS: ${g.p}

COMO TRABALHAR:
1. Abra o \`${RAIZ}/dados/prototipo.json\` e veja o que as SUAS chaves de etapa realmente tem.
   A especificacao e o contrato; o JSON e o que existe. Onde a especificacao pedir um campo
   que o JSON nao tem, desenhe a ausencia COM O MOTIVO e registre em
   "campos_que_a_especificacao_pede_e_o_json_nao_tem". Nao invente, nao impute, nao omita.
2. Leia a secao 10 da ESPECIFICACAO para as suas etapas, e a secao correspondente do corpo
   dela (a 6 para as etapas 2-4, a 7 para a 8, a 8 para as 12-13, a 9 para a 14).
3. NENHUM NUMERO A MAO. Todo numero e toda frase com numero sai do \`PROTO\` na hora. Se voce
   escrever "0,828" no codigo, esta errado mesmo que o valor esteja certo hoje.
4. \`node --check ${RAIZ}/static/${g.f}\` tem que passar. Rode.
5. Comentario em prosa, explicando POR QUE — leia o \`sbRender()\` do app.js para pegar o tom.`,
  { label: 'etapas:' + g.n, phase: 'Etapas', schema: ETAPA_OUT, effort: 'high' })))).filter(Boolean)

log(`Etapas escritas: ${etapas.map(e => e.arquivo).join(', ')}`)

phase('Costura')

const costura = await agent(`${CASA}

Quatro agentes escreveram a aba em paralelo, contra o contrato em ${CONTRATO_PATH}:
${JSON.stringify({ casca, etapas }, null, 1).slice(0, 40000)}

TAREFA: COSTURAR. Agora voce pode tocar em qualquer arquivo da aba — mas SO na aba.
Nao mexa no \`app.js\` alem da linha do \`irParaAba\`, e nao mexa em nada da aba Serie B.

O que conferir, nesta ordem:
1. \`node --check\` em \`static/proto.js\`, \`proto_a.js\`, \`proto_b.js\`, \`proto_c.js\` e
   \`prototipo.js\`. Conserte o que nao passar.
2. CONTRATO BATIDO: toda funcao que a casca chama esta definida? Todo container que uma etapa
   escreve existe no HTML? Todo helper usado esta definido uma vez so, sem colisao de nome
   entre os tres arquivos? Liste as colisoes e resolva.
3. CAMPOS DO JSON: extraia do codigo todo acesso a \`PROTO.*\` e confira, contra o
   \`dados/prototipo.json\` de verdade, que o caminho existe. Um \`PROTO.etapa_9.reguas\` que
   nao existe vira tela em branco silenciosa. Liste os que nao existem e conserte — ou
   desenhando a ausencia, ou corrigindo o caminho.
4. NUMERO A MAO: procure literal numerico dentro de string de interface nos quatro arquivos.
   Todo numero da tela tem que vir do PROTO. Onde achar, conserte.
5. Suba o app (\`python3 app.py\`, porta padrao) e confirme que ele sobe sem erro. Derrube
   depois. Se nao conseguir subir, diga por que em "o_que_nao_consegui".

Em "como_abrir", escreva o comando exato para o dono ver a aba.`,
  { label: 'costura', phase: 'Costura', schema: COSTURA_OUT, effort: 'high' })

phase('Revisao')

const LENTES = [
  { k: 'o-numero', p: `O NUMERO. Pegue VINTE numeros que a tela mostra, espalhados pelas 16
    etapas, e confira cada um contra o \`${RAIZ}/dados/prototipo.json\` — nao contra o que o
    codigo diz que faz, contra o JSON. Confira tambem o caminho inverso: campo importante do
    JSON que NENHUMA etapa mostra. E o teste que mais importa: existe algum numero na tela que
    nao existe no JSON? Formatacao em pt-BR (virgula decimal) esta certa? p-valor pequeno
    aparece como "< 0,001" ou como "0,00"? Arredondamento esconde diferenca?` },
  { k: 'a-honestidade', p: `A HONESTIDADE DA TELA. A regra da casa e "o dado e a fonte, o texto
    e consequencia". Procure a violacao: frase afirmativa que o dado nao sustenta, ausencia
    desenhada como "—" sem motivo escrito, celula de setor com menos de 3 atletas que virou
    media, achado da etapa 2 mostrado sem o bloco do sorteio da etapa 3 por perto, proposta de
    elenco sem a baseline de dinheiro ao lado (secao 11 da ESPECIFICACAO: os tres controles sao
    obrigatorios e vao NA TELA), tipologia mostrada sem os testes que ela NAO passou.
    Confira tambem a tarja de conferencia no topo, que o dono precisa ver antes de acreditar
    em qualquer numero. Cheque tambem o desenho: cabe na tela, rola sem estourar na horizontal,
    e as 16 etapas sao navegaveis sem rolagem cega?` },
]

const revisao = (await parallel(LENTES.map(l => () => agent(`${CASA}

A aba esta construida. Voce revisa, e a sua inclinacao e achar erro.

SUA LENTE: ${l.p}

Os arquivos: \`static/proto.js\`, \`static/proto_a.js\`, \`static/proto_b.js\`,
\`static/proto_c.js\`, \`static/prototipo.js\`, mais o que mudou em \`templates/index.html\`,
\`static/app.js\` e \`static/style.css\`.

O que a costura relatou:
${JSON.stringify(costura, null, 1).slice(0, 20000)}

Para cada problema, diga o arquivo, a linha, o que esta errado e QUAL E O CONSERTO — concreto,
nao "melhorar". Classifique: "quebra" (a tela nao funciona), "mente" (a tela afirma o que o
dado nao sustenta) ou "feio" (funciona e e honesto, mas esta mal desenhado).
Se estiver bom, diga que esta bom — aprovar sem problema e um resultado legitimo.`,
  { label: 'revisa:' + l.k, phase: 'Revisao', schema: REV_OUT, effort: 'high' })))).filter(Boolean)

return { casca, etapas, costura, revisao }
