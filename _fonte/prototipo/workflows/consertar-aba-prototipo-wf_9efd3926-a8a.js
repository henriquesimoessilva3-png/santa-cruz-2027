export const meta = {
  name: 'consertar-aba-prototipo',
  description: 'Aplica as 21 correcoes que os dois revisores acharam na aba Prototipo — um dono por arquivo',
  phases: [
    { title: 'Consertar', detail: 'quatro arquivos, um agente cada, em paralelo' },
    { title: 'Conferir', detail: 'um cetico abre a aba e confere cada conserto na tela' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'

const CASA = `PROJETO Santa Cruz (${RAIZ}). A aba "Prototipo" foi construida hoje e passou por
dois revisores: um conferiu numero por numero contra o \`dados/prototipo.json\`, outro cacou
desonestidade de tela. Voce esta aplicando os consertos.

**A REGRA QUE MANDA: o dado e a fonte, o texto e consequencia.** Nenhum numero digitado.
Nenhuma frase afirmativa que o dado nao sustente. Onde o dado nao existir, a tela ESCREVE a
ausencia e o motivo. Quase todo defeito desta lista e uma violacao dessa regra — a tela
afirmando o que ela mesma nao faz, ou colando uma conclusao digitada em cima de um numero lido.

OS ARQUIVOS DA ABA e quem e dono de que:
- \`static/proto.js\` — a casca: \`ptRender\`, a tarja, a navegacao, e os helpers \`pt*\`
  (ptNum, ptInt, ptPct, ptEur, ptP, ptPv, ptD, ptAno, ptN, ptFalta, ptFaltaBloco, ptCel,
  ptMotivos, ptBarra, ptTabela, ptLigarTabelas, ptCard, ptBaseline, ptLiquida,
  ptContrafactual, ptIrParaEtapa).
- \`static/proto_a.js\` — etapas 0 a 4.   - \`static/proto_b.js\` — etapas 5 a 8.
- \`static/proto_c.js\` — etapas 9 a 15.
- \`static/prototipo.js\` — o dado (\`const PROTO\`), GERADO. Nao edite.
- O contrato esta em \`static/proto_contrato.md\`: assinatura \`function ptEtapaN(alvo, dados)\`,
  escreve em \`alvo.innerHTML\`, nao redefine helper \`pt*\`.

**VOCE MEXE SO NO SEU ARQUIVO.** Os outros tres estao sendo editados agora, em paralelo, por
outros agentes. Se o seu conserto precisar de um helper novo na casca, NAO edite a casca:
escreva a sua versao dentro do seu arquivo com prefixo proprio e registre isso na saida.
NAO edite \`templates/index.html\`, \`static/app.js\` nem \`static/style.css\` — exceto o dono do
\`proto.js\`, que pode acrescentar classe \`pt-\` ao fim do \`style.css\` se precisar.

**ATENCAO — o \`prototipo.json\` esta sendo REGERADO agora**, em outro fluxo, com 23 correcoes
do gerador. Campos vao ser ACRESCENTADOS (por exemplo \`d_liq2_SM\`, \`p_liq2_SM\`,
\`indicadores_no_catalogo\`, \`fora_da_amostra_2026\`, \`p_placebo\`) e alguns numeros vao mudar
(o nulo da tipologia vira enumeracao exata; a nota de encaixe muda em 422 de 586 por causa de
um bug de sinal). Por isso: **leia tudo do JSON, nunca digite. Trate campo ausente com
\`ptFalta\`/\`ptFaltaBloco\`, nunca com \`undefined\` na tela.** Conserto que depende de um valor
especifico de hoje vai quebrar amanha.

VERIFIQUE O SEU TRABALHO: \`node --check\` no seu arquivo. E abra a aba de verdade — suba o app
numa porta livre (**NAO a 5090, tem servidor do dono vivo la**), clique ate a sua etapa, e
confirme na tela. Derrube o servidor ao terminar.`

const OUT = { type: 'object', properties: {
  arquivo: { type: 'string' },
  consertos: { type: 'array', items: { type: 'object', properties: {
    defeito: { type: 'string' }, linha: { type: 'string' },
    o_que_fiz: { type: 'string' },
    conferido_na_tela: { type: 'boolean' },
  }, required: ['defeito', 'linha', 'o_que_fiz', 'conferido_na_tela'] } },
  nao_consertados: { type: 'array', items: { type: 'object', properties: {
    defeito: { type: 'string' }, por_que: { type: 'string' },
  }, required: ['defeito', 'por_que'] } },
  helpers_que_precisei_criar: { type: 'array', items: { type: 'string' } },
  campos_do_json_que_passei_a_ler: { type: 'array', items: { type: 'string' } },
  node_check_passou: { type: 'boolean' },
  o_que_nao_consegui: { type: 'string' },
}, required: ['arquivo', 'consertos', 'nao_consertados', 'helpers_que_precisei_criar',
  'campos_do_json_que_passei_a_ler', 'node_check_passou', 'o_que_nao_consegui'] }

const CONF = { type: 'object', properties: {
  consertos_conferidos: { type: 'integer' },
  nao_pegaram: { type: 'array', items: { type: 'string' } },
  quebrou_alguma_coisa: { type: 'array', items: { type: 'string' } },
  numeros_a_mao_que_sobraram: { type: 'array', items: { type: 'string' } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
  o_que_ainda_incomoda: { type: 'string' },
}, required: ['consertos_conferidos', 'nao_pegaram', 'quebrou_alguma_coisa',
  'numeros_a_mao_que_sobraram', 'veredito', 'o_que_ainda_incomoda'] }

phase('Consertar')

const ARQUIVOS = [
  { f: 'proto.js', p: `TRES CONSERTOS, e o primeiro e o mais grave da aba inteira.

1. **[MENTE] \`ptContrafactual\`, ~linha 383 — "21o de 20".** O Controle 3 e o ultimo numero que
   o dono le antes de decidir contratacao, e em TRES das seis propostas
   (A_caro_sul_americano, B_barato_sul_americano, C_anti_queda_sul_americano) ele imprime
   "posto de valor que ocuparia: 21o de 20" — um ordinal impossivel. O JSON traz o campo que
   explica e a tela nunca o le: \`contrafactual.abaixo_de_todos = true\`, isto e, o nucleo e
   mais barato que o 20o colocado.
   Conserto: quando \`cf.abaixo_de_todos\` for true, escrever "abaixo de todos os N elencos da
   Serie B 2025" em vez do ordinal. **E acrescente a linha de referencia** com os tres valores
   que ja estao no JSON e nunca vao a tela — \`referencia_1o_eur\`, \`referencia_mediana_eur\`,
   \`referencia_20o_eur\` — porque sao exatamente o que da escala ao valor do nucleo: sem eles,
   "€ 1,6 mi" nao quer dizer nada para quem le.

2. **[FEIO] A chave \`bases\` nunca e lida.** Grep de \`PROTO.bases\` nos quatro arquivos: zero.
   E uma das 24 chaves do topo do JSON e carrega a PROCEDENCIA de tudo que a aba afirma —
   painel 100 linhas / 346 colunas / 80 usadas; jogos 3.036 de Serie B com o filtro
   "Brazil. Serie B"; tecnico 3.866; elencos 5.098; SkillCorner 1.780 atleta-temporada com
   corte min_tot >= 300; mercado 40.059 no periodo ago26; 82 KPIs em 18.460 jogadores.
   Conserto: um bloco na tarja (ou card ao pe da etapa 0) montado de \`PROTO.bases\`, **iterando
   as chaves** em vez de lista-las a mao, para que base nova apareca sozinha. Uma linha por
   base, com o arquivo, as contagens e o corte/filtro quando existir.

3. **[FEIO] "ha 1 horas", ~linha 418.** Singular nao tratado na tarja. Conserte tambem o ramo
   dos dias. (Os outros dois casos de concordancia, em proto_b.js e proto_c.js, sao dos donos
   daqueles arquivos — nao mexa.)

**E UMA COISA A MAIS, que e sua porque a tarja e sua:** a tarja diz hoje "Estes numeros ainda
nao foram recalculados por caminho independente... estao sendo conferidos NESTE MOMENTO".
**A conferencia JA VOLTOU** — o laudo esta em \`${RAIZ}/_fonte/prototipo/CONFERENCIA.md\`.
Reescreva a tarja para dizer a verdade de agora: os numeros foram recalculados por tres
ceticos independentes, o catalogo bateu em 5.567 comparacoes campo a campo com zero
divergencias, e as correcoes de metodo que eles acharam estao sendo aplicadas ao gerador.
Leia o CONFERENCIA.md e escreva a tarja no tom da casa — curta, sem adjetivo, dizendo o que o
leitor precisa saber antes de acreditar em qualquer numero. A data continua saindo de
\`PROTO.gerado_em\`.` },

  { f: 'proto_a.js', p: `QUATRO CONSERTOS, nas etapas 0 a 4.

1. **[FEIO] \`auc_SM\` existe nas 293 linhas e nao aparece em lugar nenhum** (~linha 517, em
   \`paEt2Tabela\`). Vai de 0,188 a 0,816 e e a UNICA medida por indicador diretamente
   comparavel ao Controle 1 — a baseline do dinheiro e um AUC (0,828), e a aba repete que
   "qualquer eixo, indice ou elenco que nao bata isso e descricao, nao recomendacao". Sem essa
   coluna, o leitor nao consegue fazer a comparacao que a propria aba manda fazer.
   Conserto: acrescente \`auc_SM\` as colunas da tabela do catalogo (do mesmo jeito que
   \`liq_ordem\` e \`porta_motivo\` ja sao acrescentadas), rotulo "AUC sobe×meio",
   \`fmt: v => ptNum(v, 3)\`, e uma classe que acenda quando o valor passar do AUC da baseline
   **lido de \`PROTO.controles_obrigatorios\`** — nunca digitado.

2. **[FEIO] O filtro de setor apaga 73 linhas** (~linha 555, no construtor \`unicos\`). Ele
   descarta todo valor null, entao as opcoes de setor somam 55+55+55+55 = **220** sob um
   "todos (293)" logo acima — a soma que nao fecha esta visivel na propria barra de filtros, e
   nao ha como isolar os 73 indicadores sem setor. Note que o filtro de porta mostra "- (244)"
   porque ali o vazio e a string '-'; e so o null que some.
   Conserto: contar tambem o vazio (acumular em \`v['null']\`), imprimir como "sem setor (73)".
   O filtro em \`paEt2Linhas\` ja funciona sem mudanca, porque compara \`String(l.setor)\`.

3. **[FEIO] O alfa e o "esperado por acaso" podem se descasar** (linhas ~580, 661, 684 e 758).
   Quatro pontos escrevem "a <alfa lido>, cerca de X passariam por acaso" usando
   \`esperados_por_acaso_5pct\` — um campo cujo NOME fixa 5%. Hoje o alfa do JSON tambem e 0,05
   e nada aparece errado; no dia em que mudar, a tela cola um rotulo num numero que carrega
   outro corte. E o mesmo tipo de armadilha que a costura ja consertou no \`ptLiquida\`.
   Conserto: um helper \`paEsperados(d)\` que devolve \`esperados_por_acaso_5pct\` quando o alfa
   for 0,05, e \`testes * alfa\` recalculado quando nao for — com um title dizendo "recalculado
   na tela: o JSON so traz o esperado a 5%". Use nos quatro pontos.

4. **Enquanto estiver na etapa 2:** o \`prototipo.json\` esta sendo regerado agora e vai ganhar
   \`d_liq2_SM\`, \`p_liq2_SM\`, \`d_liq2_SC\`, \`p_liq2_SC\` nas **160 linhas fisicas** — um
   segundo nivel de residualizacao (dinheiro **+ numero de atletas rastreados**), porque a
   refutacao descobriu que quem sobe usa MENOS gente (\`fis_atletas\` de 20,5 nos que subiram a
   25,3 nos rebaixados, d=−1,44, p=0,0008) e isso contamina toda media fisica por atleta.
   Faca a tabela do catalogo **mostrar essas colunas quando elas existirem** e ignora-las
   quando nao existirem (o JSON pode chegar antes ou depois de voce). Com um cabecalho de
   coluna que diga o que o segundo liquido controla.` },

  { f: 'proto_b.js', p: `OITO CONSERTOS, nas etapas 5 a 8. Quatro sao "a tela mente".

1. **[MENTE] A etapa 5 promete marcar e nao marca** (~linha 362, e o conserto em \`pb5Matriz\`
   ~256-270). O card de vazios escreve: "o nome da ultima coluna carrega a faixa em que o
   numero vai a tela MARCADO COMO DE BAIXA CONFIANCA" — e **1.394 celulas** na faixa de 3 a 4
   atletas saem sem marca nenhuma, com a mesma rampa de cor de uma celula de 20 atletas
   (256 de 512 so no painel fisico_col_zaga). Conserto: ler a faixa da chave do JSON **sem
   digitar o corte** (no estilo que \`pbRotChave\` ja usa) e marcar de verdade as celulas dessa
   faixa. Se a marca exigir CSS novo, resolva com estilo inline no seu arquivo — nao edite o
   style.css.

2. **[MENTE] "n = 38 clube-temporada"** (~linha 256), impresso nas 16 linhas dos paineis
   \`tecnico_col\` e \`elenco\`. Nao existem 38 clube-temporada em ano nenhum — a etapa 0 da
   MESMA aba diz que cada ano tem 20. O 38 e de jogos; a unidade vem de \`unidade_n\` no JSON e
   esta errada. O conserto de fundo e no gerador (outro fluxo cuida disso), mas **a tela nao
   pode imprimir a contradicao como fato**: quando \`unidade_n\` for 'clube-temporada' e o n for
   maior que o n daquele ano em \`PROTO.etapa_0.por_ano\`, escreva a ressalva medida em vez do
   rotulo cru.

3. **[MENTE] Dois numeros para a mesma coisa, na mesma etapa** (~linha 1295). A tabela do
   veredito le "fisico (166 colunas fis_*)" — o 166 vem de dentro da string
   \`veredito[5].teste\` — e trinta linhas abaixo o card dos achados negativos diz "fisico:
   colunas testadas 160". O JSON arbitra: \`fisico.colunas = 160\` e
   \`esperados_por_acaso = 8,0 = 160 × 0,05\`. Conserto: extrair o inteiro da string do teste
   (\`/(\\d+)\\s+colunas/\`), comparar com \`t.fisico.colunas\`, e quando diferirem acrescentar a
   nota ao pe da tabela dizendo qual e a contagem que vale e por que — no padrao do \`paCinza\`
   da etapa 0.

4. **[MENTE] A tabela do veredito finge que o veredito e derivavel** (~linha 1126). Ela imprime
   numero, corte e veredito como se o terceiro saisse dos dois primeiros — e nao sai: **duas
   linhas identicas na tela (2,0000 · corte 0,00) recebem vereditos opostos**, e uma linha com
   0,0000 contra corte 1,00 aparece como "nao passou". O campo \`corte\` nao tem a mesma direcao
   em todas as linhas. Conserto: calcular
   \`coerente = (Number(v.numero) < Number(v.corte)) === !!v.passou\` e, onde for falso, marcar
   a celula do corte com sinal visivel e title dizendo que ali o corte nao se le como teto e
   que o veredito vem do campo \`passou\` do pipeline.

5. **[MENTE] O Jaccard nao e dos quadrantes** (~linha 1267). A tela escreve "Jaccard dos 4
   grupos (900 replicas) 0,599 · 0,720 · 0,377 · 0,664" dentro do bloco que acabou de falar de
   G1..G4, e o leitor le como a estabilidade de cada quadrante. O proprio JSON desmente:
   \`estabilidade.jaccard.tamanhos = [4, 7, 3, 2]\` contra quadrantes de **[5, 3, 3, 5]**.
   Conserto: imprimir o tamanho ao lado de cada Jaccard e comparar \`jac.tamanhos\` com
   \`(t.grupos||[]).map(g => g.n)\`; quando nao baterem, trocar o rotulo por "Jaccard de 4
   grupos reamostrados — tamanhos 4/7/3/2, que NAO sao os quadrantes 5/3/3/5" e dizer o que
   isso significa. (O outro fluxo vai mover esse bloco para o cemiterio no gerador; ate la, a
   tela nao pode apresentar como se fosse.)

6. **[FEIO] Marcacao crua vazando** (linha 329): \`esc(campos.join('</code>, <code>'))\` escapa a
   string inteira, tags incluidas, e a nota do card de sensibilidade aparece literalmente com
   \`</code>, <code>\` no meio. Troque por \`campos.map(esc).join('</code>, <code>')\`. Confira
   tambem a 334.

7. **[FEIO] A faixa perde precisao sem recurso** (~linha 278): q1/mediana/q3 saem com
   \`ptNum(f[i], 0)\` e sem title — 28,8 e 29,4 viram os dois "29". E a unica parte da aba onde
   um numero perde precisao e o valor cheio nao sobrevive em lugar nenhum. Ponha o valor cheio
   no title.

8. **[FEIO] "1 chegam a linha de estabilidade"** (~linha 865): singular nao tratado.` },

  { f: 'proto_c.js', p: `DEZ CONSERTOS, nas etapas 9 a 15. **O card do goleiro concentra quatro
deles e e o pior bloco da aba** — comece por ele.

1. **[MENTE] O card do goleiro diz 2 sobre uma tabela de 126** (~linha 1142). O subtitulo
   escreve "2 no pool operacional contra 87 zagueiros pelo direito" e fecha com "qualquer
   'melhor goleiro disponivel' seria o melhor de dois" — e logo abaixo desenha uma tabela de
   **126 goleiros**. Os dois numeros existem no JSON (\`no_pool_operacional\` = 2,
   \`candidatos\` = 126) e a tela nao reconcilia nenhum. Conserto: o subtitulo le as duas
   contagens, e um paragrafo antes da tabela explica o que separa uma da outra.

2. **[MENTE] \`sinal: 1\` digitado no goleiro** (~linha 1133). A tela declara "mais e melhor"
   para os seis indicadores de goleiro (\`gk_def\`, \`gk_evi\`, \`gk_sai\`, \`gk_pas\`, \`cs\` e
   "Golos expectaveis defendidos por 90'") e **o JSON nao declara direcao nenhuma para eles**.
   Conserto: \`sinal: 0\`, para o title voltar a dizer "sem lado bom declarado", e uma frase
   calculada dizendo que o JSON nao declara o lado bom desses indicadores.

3. **[MENTE] 49 dos 126 goleiros vem de ligas que a etapa 12 declarou SEM cobertura fisica**
   (Argentina B 28, Venezuela 8, Equador B 6, Colombia B 4, Brasil C 2, Bolivia 1) — e nada na
   tela diz isso, enquanto o card de candidatos, duas telas acima, se apoia em que essas ligas
   "foram eliminadas ANTES, no funil". Conserto: contar na hora, cruzando a liga de cada
   candidato com a lista de ligas sem cobertura que a etapa 12 ja traz, e escrever a contagem
   medida. **Nao digite a lista nem os numeros** — derive dos dois blocos do JSON.

4. **[MENTE] "Nenhum dos dois desfechos passa de 0,05"** (~linha 855), ao lado de p = 0,607 e
   p = 0,701 — que passam de 0,05, e muito. Em portugues "passar de X" e ULTRAPASSAR X: a
   frase afirma o contrario do que os numeros dizem, no cabecalho do backtest, que e por
   decisao de metodo o numero mais importante da etapa. Troque por "fica abaixo de" (com o
   alfa lido do JSON, nao digitado).

5. **[MENTE] Conclusao digitada em cima de numero lido** (~linha 803, conferencia cruzada). A
   nota monta a porcentagem de concordancia lida do JSON e depois emenda uma conclusao escrita
   a mao sobre o que ela significa. Derive a frase: calcule a discordancia
   (\`100 − geral.pct\`) e escreva o que os dois numeros sustentam, nada alem.

6. **[FEIO] "2 atletas do pool nao tem setor... SAO OS GOLEIROS"** (~linha 1198): a contagem e
   calculada e a identificacao e digitada. Derive a posicao do proprio dado
   (\`[...new Set(semSetor.map(c => c.pos))]\`) em vez de afirmar.

7. **[FEIO] A grade diz 16 e as propostas dizem 15** (~linha 1197). A etapa 14 abre com
   "nucleo de 16 (XI + 5) · 16 vagas na grade" e desenha GOL com 1 vaga; as seis propostas
   logo abaixo dizem todas "15 vagas" e o Controle 3 fala em "15 atletas do nucleo". A conta
   16 − 1 = 15 esta no dado (\`sem_goleiro\` em toda proposta) e em nenhum lugar da tela.
   Conserto: comparar a soma da grade com \`vagas\`; quando diferirem, marcar a caixa do GOL
   como nao preenchivel e escrever a frase montada com o \`sem_goleiro\` do JSON.

8. **[FEIO] A margem empatada da zaga** (~linha 1029). A tabela de candidatos e ordenada por
   \`_margem\` e, no setor zaga, mostra **0,185 repetido linha apos linha**. Nao e
   arredondamento: a zaga usa 1 indicador so, e dos 151 candidatos **124 tem margem
   exatamente ±0,185** (73 em −0,185 e 51 em +0,185; 25 valores distintos no setor inteiro).
   Quem le acha que esta vendo um ranking e esta vendo um empate macico com ordem arbitraria.
   Conserto: contar os distintos do que esta na tela (\`new Set(linhas.map(l => l._margem))\`) e,
   quando forem poucos para o n, escrever a frase montada dizendo quantos empatam, por que
   (quantos indicadores o bloco fisico daquele setor tem) e que dentro do empate a ordem nao
   significa nada.

9. **[FEIO] "1 atletas com muitos minutos"** (~linha 1317): singular nao tratado.

10. **[FEIO] \`ptFalta\` colado no meio de periodo, sem pontuacao** (~linha 1447 e um caso na
    etapa 12). Sai "...so esta disponivel para o tecnico Mesmo sem esse corte, a ordem de
    grandeza e outra:" — le-se como erro de montagem. Feche o \`ptFalta\` com ". " antes de
    continuar, ou tire-o de dentro do periodo. Procure \`ptFalta(\` seguido de concatenacao com
    letra maiuscula; sao os dois unicos casos.` },
]

const consertos = (await parallel(ARQUIVOS.map(a => () => agent(`${CASA}

VOCE E DONO DE \`${RAIZ}/static/${a.f}\` e so dele.

${a.p}

Ao terminar: \`node --check ${RAIZ}/static/${a.f}\`, e abra a aba no navegador para ver cada
conserto na tela com os proprios olhos. Marque \`conferido_na_tela\` honestamente — false e uma
resposta legitima, mentir nao e.`,
  { label: 'conserta:' + a.f, phase: 'Consertar', schema: OUT, effort: 'high' })))).filter(Boolean)

log(`Consertos: ${consertos.reduce((n, c) => n + c.consertos.length, 0)} aplicados, ${consertos.reduce((n, c) => n + c.nao_consertados.length, 0)} nao aplicados`)

phase('Conferir')

const conf = await agent(`${CASA}

Os quatro arquivos foram consertados em paralelo. O que cada dono relatou:
${JSON.stringify(consertos, null, 1).slice(0, 60000)}

TAREFA: CONFERIR NA TELA, nao no codigo. Suba o app numa porta livre (NAO a 5090), abra a aba
Prototipo e percorra as 16 etapas.

1. **Cada conserto pegou?** Percorra a lista dos 21 e confirme NA TELA. O "21o de 20" sumiu das
   tres propostas? As celulas de 3-4 atletas estao marcadas? O card do goleiro reconcilia 2 com
   126? O "passa de 0,05" virou "fica abaixo de"?
2. **Alguem quebrou alguma coisa?** Os quatro editaram em paralelo. Console limpo? Nenhum bloco
   \`pt-erro\` ou \`pt-espera\`? Nenhum "undefined", "NaN" ou "[object Object]" no texto? Nenhuma
   colisao de nome de funcao entre os quatro arquivos (o \`node --check\` arquivo a arquivo NAO
   pega redeclaracao entre arquivos — carregue os cinco juntos num script so para testar)?
3. **Sobrou numero a mao?** Faca o grep que os revisores fizeram: literal numerico dentro de
   string de interface nos quatro arquivos. Todo numero da tela tem que vir do \`PROTO\`.
4. **A tarja diz a verdade?** Ela devia ter sido reescrita para dizer que a conferencia ja
   voltou (o laudo esta em \`${RAIZ}/_fonte/prototipo/CONFERENCIA.md\`).

Se o \`prototipo.json\` tiver sido regerado pelo outro fluxo enquanto voce trabalhava, a aba
tem que continuar funcionando — confirme que sim, e diga o que mudou na tela se mudou.`,
  { label: 'confere-aba', phase: 'Conferir', schema: CONF, effort: 'high' })

return { consertos, conf }
