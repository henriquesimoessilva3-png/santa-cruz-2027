export const meta = {
  name: 'mapear-rodada-serieb',
  description: 'Somente leitura: mede os apontamentos do critico das conclusoes e mapeia gerador, tela, filtros e glossario da proxima rodada, enquanto a base por pontos termina na outra sessao',
  phases: [
    { title: 'Conclusoes', detail: 'apontamentos do critico, medidos, em 3 grupos' },
    { title: 'Ceticos', detail: 'um cetico por grupo refaz as medidas' },
    { title: 'Mapear', detail: 'gerador, tela, filtros, glossario' },
    { title: 'Revisar', detail: 'o que falta no plano da rodada' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B.
- Aba Prototipo: \`dados/prototipo.json\` <- \`gerar_prototipo.py\`; tela em \`static/proto.js\`, \`static/proto_a.js\`, \`static/proto_b.js\`, \`static/proto_c.js\`, \`static/style.css\`; \`static/prototipo.js\` e a copia do JSON.
- Aba nova por faixa de aproveitamento de pontos: \`dados/pontos.json\` <- \`gerar_pontos.py\` (importa o gerador do Prototipo), \`ranking_gaps.py\`, \`static/pontos.js\`.
- Conclusoes: \`_fonte/prototipo/CONCLUSOES.md\` (41 conclusoes e a regua de selos), \`_fonte/prototipo/conclusoes_spec.json\`, e o retorno do critico de completude em \`_fonte/prototipo/conclusoes_critico.json\`.
LEIA ANTES DE TUDO, INTEIROS: \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\` e \`${RAIZ}/_fonte/prototipo/PENDENTE_RODADA.md\` (os numeros de item citados abaixo sao desse arquivo).

SITUACAO: OUTRA sessao do Claude esta, neste momento, terminando a base da aba por pontos e rodando tres conferencias sobre ela. Por isso esta rodada e SOMENTE LEITURA:
- PROIBIDO escrever qualquer arquivo dentro de ${RAIZ} (nada de Edit/Write la, nenhum script que grave la). Rascunhos, scripts e saidas SO em ${S}.
- PROIBIDO rodar o main de gerar_prototipo.py, gerar_pontos.py, gerar_prototipo_js.py ou gerar_pontos_js.py (gravam no repo). Importar como biblioteca para LER dado e permitido; fora do main, carregue \`G.DECL = G.carregar_declaracao()\` antes de \`montar_matriz\`.
- PROIBIDO qualquer git que escreva (commit, push, add, reset, checkout, stash, revert, tag). Git so leitura: status, log, diff, show.
- NAO suba servidor e NAO use as portas 5090 e 5091 (servidores do dono).
- ranking_gaps.py, gerar_pontos.py e dados/pontos.json podem mudar nas proximas horas (a conferencia da outra sessao pode pedir conserto): cite funcao e linha, e marque quando a sua conclusao depender deles.
REGRAS DA CASA: nenhum numero passado adiante sem medir; ausencia com motivo, nunca imputacao; associacao nunca vira receita de causa; "nunca" so com zero excecao; 2026 nunca entra em media; cada numero diz de que universo veio (tecnico coletivo 2018-2025; individual, fisico e valor de mercado so 2022-2025). Selo de forca pela regua declarada em CONCLUSOES.md (forte, moderado, fraco, sem sinal, nao da para afirmar), aplicada por regra e nao por impressao. Texto de tela em portugues de reuniao de clube (diretor, treinador), com o vocabulario ja escrito em static/proto.js (ptTamanho, ptAcaso, ptSorte, ptJunto, ptAcerto, ptTecnico); numero tecnico so ao lado, menor. Simplificar nunca e afirmar mais.
Use python3 com numpy/pandas/scipy/sklearn (statsmodels nao).`

const CONCL = { type: 'object', properties: {
  categoria: { type: 'string' },
  itens: { type: 'array', items: { type: 'object', properties: {
    trecho_do_critico: { type: 'string' },
    conclusao_afetada: { type: 'string' },
    fonte_de_dado: { type: 'string' },
    como_medi: { type: 'string' },
    numeros_medidos: { type: 'string' },
    selo_proposto: { type: 'string', enum: ['forte', 'moderado', 'fraco', 'sem sinal', 'nao da para afirmar', 'nao se aplica'] },
    frase_de_reuniao: { type: 'string' },
    o_que_nao_quer_dizer: { type: 'string' },
    vale_pela_faixa_de_pontos: { type: 'string' },
    decisao: { type: 'string', enum: ['entra', 'corrige', 'reescreve', 'fica_como_esta', 'precisa_do_dono'] },
    motivo: { type: 'string' },
  }, required: ['trecho_do_critico', 'conclusao_afetada', 'fonte_de_dado', 'como_medi', 'numeros_medidos', 'selo_proposto', 'frase_de_reuniao', 'o_que_nao_quer_dizer', 'vale_pela_faixa_de_pontos', 'decisao', 'motivo'] } },
  scripts_em_scratch: { type: 'array', items: { type: 'string' } },
}, required: ['categoria', 'itens', 'scripts_em_scratch'] }

const VERIF = { type: 'object', properties: {
  categoria: { type: 'string' },
  conferidos: { type: 'integer' },
  divergencias: { type: 'array', items: { type: 'object', properties: {
    item: { type: 'string' }, eles_disseram: { type: 'string' }, eu_medi: { type: 'string' },
    gravidade: { type: 'string', enum: ['muda_selo', 'muda_numero', 'muda_frase', 'muda_decisao', 'detalhe'] },
    conserto: { type: 'string' },
  }, required: ['item', 'eles_disseram', 'eu_medi', 'gravidade', 'conserto'] } },
  itens_aprovados: { type: 'array', items: { type: 'string' } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['categoria', 'conferidos', 'divergencias', 'itens_aprovados', 'veredito'] }

const MAPA = { type: 'object', properties: {
  area: { type: 'string' },
  itens: { type: 'array', items: { type: 'object', properties: {
    pedido: { type: 'string' },
    onde: { type: 'string' },
    o_que_ja_existe: { type: 'string' },
    o_que_falta: { type: 'string' },
    abordagem: { type: 'string' },
    le_ou_grava_chave: { type: 'string' },
    risco: { type: 'string' },
    depende_de: { type: 'string' },
  }, required: ['pedido', 'onde', 'o_que_ja_existe', 'o_que_falta', 'abordagem', 'le_ou_grava_chave', 'risco', 'depende_de'] } },
  riscos_transversais: { type: 'array', items: { type: 'string' } },
  dono_de_arquivo_proposto: { type: 'array', items: { type: 'string' } },
  arquivos_em_scratch: { type: 'array', items: { type: 'string' } },
}, required: ['area', 'itens', 'riscos_transversais', 'dono_de_arquivo_proposto', 'arquivos_em_scratch'] }

const CRIT = { type: 'object', properties: {
  pedidos_sem_cobertura: { type: 'array', items: { type: 'object', properties: {
    pedido: { type: 'string' }, o_que_falta: { type: 'string' }, como_resolver: { type: 'string' },
  }, required: ['pedido', 'o_que_falta', 'como_resolver'] } },
  conflitos_de_arquivo: { type: 'array', items: { type: 'string' } },
  dependencias_escondidas: { type: 'array', items: { type: 'string' } },
  ordem_recomendada: { type: 'array', items: { type: 'string' } },
  perguntas_para_o_dono: { type: 'array', items: { type: 'string' } },
}, required: ['pedidos_sem_cobertura', 'conflitos_de_arquivo', 'dependencias_escondidas', 'ordem_recomendada', 'perguntas_para_o_dono'] }

const GRUPOS = [
  { k: 'faltantes', p: 'as CONCLUSOES QUE O DOCUMENTO NAO ESCREVEU (o critico listou 9; exemplos citados: quem acabou de cair da Serie A subiu 11 vezes em 28; quem subiu manteve 44% do elenco do ano anterior, contra 31% no meio; quanto vale, em euros, um "elenco de ponta"). Para cada uma, decida se entra, com selo e frase.' },
  { k: 'selos', p: 'os SELOS QUE AINDA PARECEM ERRADOS (o critico listou 9). Para cada um, reaplique a regua com os numeros refeitos e diga o selo certo.' },
  { k: 'receitas', p: 'as FRASES QUE UM DIRETOR LERIA COMO RECEITA (o critico listou 8). Para cada uma, meca o que o dado de fato sustenta e reescreva trocando a promessa pelo motivo medido (ex.: "se repete de um ano para o outro e vem antes do resultado"), nunca por outra receita.' },
]

const conclP = pipeline(GRUPOS,
  g => agent(`${CASA}

TAREFA: o critico de completude das conclusoes deixou o retorno em \`${RAIZ}/_fonte/prototipo/conclusoes_critico.json\`. A SUA PARTE: ${g.p}
Leia CONCLUSOES.md inteiro (a regua de selos e as 41 conclusoes), conclusoes_spec.json e o critico inteiro; trate SO a sua parte.
Para CADA apontamento da sua parte:
1. Ache no dado onde esta a resposta (arquivo, coluna, filtro, universo) e MECA por caminho proprio, com script seu em ${S}. Nao aceite o numero do critico nem o do CONCLUSOES.md sem refazer.
2. Aplique a regua: o selo que ele merece, com os numeros que a regua pede (tamanho, p, desconto dos muitos testes, desconto do dinheiro, se repete em 2018-2021 quando da para testar). Diga tambem se vale pela faixa de pontos (dados/pontos.json ja existe; marque que pode mudar) ou "nao testado" com motivo.
3. Escreva a frase de reuniao no molde que o dono aprovou — o que se viu, o numero simples e a forca com todas as letras. Exemplo do dono: "Quem sobe poe uma parte maior do elenco na defesa: 34% do valor, contra 27% no meio da tabela. E um sinal fraco. Quando se testam os quatro setores, um desses pode sair por sorte." E o que ela NAO quer dizer.
4. Decida: entra (conclusao nova), corrige (numero ou selo errado), reescreve (frase que soa receita), fica_como_esta (o critico errou — prove), precisa_do_dono (juizo que nao e estatistico).
Nao edite CONCLUSOES.md: o que voce devolve vira a edicao depois.`,
    { label: 'conclusoes:' + g.k, phase: 'Conclusoes', schema: CONCL, effort: 'high' }),
  (r, g) => r ? agent(`${CASA}

Um colega tratou, no retorno do critico das conclusoes (\`${RAIZ}/_fonte/prototipo/conclusoes_critico.json\`), ${g.p}
O que ele devolveu:
${JSON.stringify(r, null, 1).slice(0, 60000)}

VOCE CONFERE, e a sua inclinacao e achar erro. Para CADA item: refaca a medida por caminho proprio (script SEU em ${S}; nao reaproveite os scripts dele), reaplique a regua de CONCLUSOES.md e procure: numero que nao bate; selo mais forte do que a regua permite (ou mais fraco sem motivo); frase que afirma mais que o dado ou vira receita; "fica_como_esta" sem prova; universo errado (2018-2021 misturado com 2022-2025, 2026 entrando em media, valor cru de indicador sensivel a mando juntado entre periodos); faixa de pontos afirmada sem medir.`,
    { label: 'cetico:' + g.k, phase: 'Ceticos', schema: VERIF, effort: 'high' }).then(v => ({ grupo: g.k, proposta: r, conferencia: v })) : null)

const MAPAS = [
  { k: 'gerador', p: `TAREFA: a ORDEM DE SERVICO da "metade gerador" da proxima rodada (CONTINUAR.md secao 3, passo 2), escrita para UM agente implementar depois sem reler tudo.
Leia gerar_prototipo.py inteiro, gerar_prototipo_js.py, ranking_gaps.py, conclusoes_spec.json e tudo o que gerar_pontos.py importa ou sobrescreve do gerador do Prototipo.
Para cada pedido, diga funcao e linha, o que ja existe, o que falta, abordagem, a chave do JSON que grava, e o risco:
- itens 2 e 9: faixa_sobe e faixa_{sobe,meio,cai}_bruto (codigo pronto e NUNCA rodado): confira lendo se esta certo (mesmo metodo das outras faixas? escala crua certa por indicador?) e, se der, chame a funcao isolada sem gravar nada no repo;
- item 5: bloco \`conclusoes\` pelo conclusoes_spec.json: de que chave do JSON cada conclusao tira o numero; alguma pede dado que o gerador nao grava hoje?
- item 6: ranking_gaps no Prototipo: assinatura de ranking_gaps.tabela_de_gaps (ou o nome real) contra o que o main do gerador tem na mao; onde entra no JSON; o que difere de como gerar_pontos.py chama;
- item 15: \`nac\` nos candidatos (etapa_13, 603) e na trilha do goleiro (126): onde o pool nasce de jogadores.json, o campo exato, e se a trilha do goleiro nasce do mesmo lugar;
- item 16: etapa_14 com gerador proprio default_rng([SEMENTE, 14]), mais replicas e "empate tecnico" quando o intervalo da fatia de replicas cruzar 50%: onde mexer, e a ordem de consumo do rng GLOBAL antes e depois da mudanca (o que mais se desloca?);
- determinismo: todo \`set\` ainda iterado de modo que decida ordem ou sorteio; como provar PYTHONHASHSEED=1 contra =2 SEM gravar no repo (o gerador aceita caminho de saida? como o gerar_pontos.py fez: GP.SAIDA);
- o diff contra o JSON anterior: que chaves vao mudar de proposito e quais NAO podem mudar.
E o cruzamento que ninguem mediu: quais dessas mudancas no gerador do Prototipo MUDAM NUMERO da aba por pontos (gerar_pontos.py importa o G) — funcao por funcao — e se a aba por pontos precisa ser regerada depois.` },
  { k: 'tela', p: `TAREFA: a ORDEM DE SERVICO da "metade tela" (CONTINUAR.md secao 3, passos 3 a 5), com UM DONO POR ARQUIVO.
Leia static/proto.js, proto_a.js, proto_b.js, proto_c.js, style.css, templates/index.html, e como static/app.js registra e abre a aba Prototipo e le a global do dado (PROTO ou o nome real).
Para cada pedido de tela do PENDENTE — 1 (tabela dos mais caros e os dois fora do top 9), 2 (linha da faixa de quem subiu e legenda de quartis), 4 (tudo aberto), 5 (conclusoes na tela), 6 (tabela de gaps com a linha da sorte e as tres marcas), 9 (botao percentil/cru, um por aba), 10 (grafico da etapa 6), 11 (legenda "posicao no ranking do ano"), 12 (grafico da etapa 7 se explica sozinho), 13 (nomes fisicos da etapa 13), 14 (largura e rolagem lateral), 16.3 (teste de volta ao lado dos nomes), 17 (sobras), 18 (aba de conclusoes) — diga arquivo:linha/funcao onde mora, o que ja existe, o que falta, abordagem, de qual chave do JSON le (e se a chave JA existe no prototipo.json de hoje ou so existira depois da metade gerador), risco.
Item 14: as larguras medidas estao no PENDENTE; ache no CSS e no JS cada regra que as causa.
Passo 4 (aba por pontos): o renderer do Prototipo consegue ler PONTOS no lugar do dado do Prototipo? Liste cada referencia direta a global, cada texto "subiu/caiu/sobe/meio/cai/acesso" montado na tela, e compare as chaves que a tela le em dados/prototipo.json contra dados/pontos.json etapa a etapa: o que quebra, o que precisa de rotulo de faixas.rotulos, o que precisa de "de que universo veio".
Proponha a divisao por dono de arquivo sem sobreposicao (inclui o arquivo novo static/proto_glossario.js e onde a aba de pontos e a de conclusoes se registram).` },
  { k: 'filtros', p: `TAREFA: item 15 do PENDENTE (filtros de liga, nacionalidade e idade nas listas de jogadores).
Leia templates/index.html (perto das linhas 594-597), static/app.js (perto de 5870, grupos de regiao; perto de 6234, como #fLiga e preenchido) e ache TUDO que implementa esses filtros hoje: funcoes, escopo (global? dentro de closure?), a regra de nacionalidade (dupla com o Brasil conta como brasileiro), os grupos de liga, e se o app ja tem filtro de idade (e como).
Diga se proto_c.js consegue CHAMAR essas funcoes (escopo, ordem de carregamento dos scripts no index.html) ou se precisa expor/extrair algo (onde, com o minimo de mudanca no app.js).
Confira no dado (dados/prototipo.json e dados/pontos.json, so leitura): campos de etapa_13.candidatos, da trilha do goleiro e das listas de nomes da etapa_14 (liga, idade, nac); os nomes de liga batem com os grupos do app? Meca quantos candidatos ficariam com liga fora de todos os grupos, e quantos casariam com jogadores.json pelo id (sem casar por nome).
Diga onde o texto "N candidatos, K valores distintos" e os empates sao montados e como recontar sobre o que ficou visivel.` },
  { k: 'glossario', p: `TAREFA: o RASCUNHO do glossario (itens 11, 13 e 17 do PENDENTE) — o conteudo que depois vira static/proto_glossario.js.
Levante TODOS os ids de indicador que as duas abas mostram: colunas do catalogo da etapa 2 (293), indicadores das matrizes da etapa 5 e as regras de juntar jogadores (ponderada, mediana, top5), os apelidos fisicos da etapa 13 (spn_s, obr_area, psv5, hi_s...), as colunas das etapas 6, 7 e 10, as da tabela de gaps, e as de dados/pontos.json (tecnico_2018_2025, ranking_gaps, ranking_gaps_tecnico_2018_2025).
Para cada id: nome simples (curto, cabe em cabecalho), o que mede em uma frase, unidade, fonte (Wyscout time · Wyscout jogador com 600+ min · SkillCorner · Transfermarkt · calculado no projeto), lado bom (ou "sem lado bom"), se e com bola / sem bola / jogo inteiro e se e por 90 ou por 30 min daquela fase (as de fase NAO se comparam com as de 90), e DE ONDE TIROU (arquivo:linha ou skill).
Fontes: analisar_serieb.py (do_tecnico), gerar_prototipo.py, gerar_raio_serieb.py (DE_PARA, DE_PARA_OBR, DE_PARA_JSON), preparar_serieb_tecnico.py, preparar_serieb_jogos*.py, e as skills dados-wyscout e dados-skillcorner (use a ferramenta Skill; se nao estiver disponivel, ache os SKILL.md em ~/.claude ou na pasta .claude de Analytics). Nunca invente: sem fonte, marque "nao_achei_fonte".
Grave o rascunho completo em ${S}/glossario_rascunho.json (lista de objetos, um por id). No schema devolva: itens = um por GRUPO de indicadores (pedido = o grupo), com a contagem, quantos sem fonte e quais; arquivos_em_scratch com o caminho.` },
]

const mapasP = parallel(MAPAS.map(m => () => agent(`${CASA}

${m.p}`, { label: 'mapa:' + m.k, phase: 'Mapear', schema: MAPA, effort: 'high' })))

const [concl, mapas] = await Promise.all([conclP, mapasP])
log(`conclusoes: ${concl.filter(Boolean).length}/3 grupos · mapas: ${mapas.filter(Boolean).length}/4`)

phase('Revisar')
const critico = await agent(`${CASA}

TAREFA: CRITICO DE COMPLETUDE do plano da proxima rodada. Voce recebe o que os mapas e os grupos das conclusoes devolveram (truncado). Leia de novo CONTINUAR.md e PENDENTE_RODADA.md.
MAPAS:
${JSON.stringify(mapas, null, 1).slice(0, 90000)}
CONCLUSOES (proposta + cetico por grupo):
${JSON.stringify(concl, null, 1).slice(0, 60000)}

Pergunte: dos 18 pedidos do PENDENTE, qual ficou sem mapa ou com mapa raso? Dois donos vao escrever no mesmo arquivo? Ha dependencia escondida na ordem (tela lendo chave que o gerador ainda nao grava; glossario usado por tres arquivos; mudanca no gerador que obriga regerar a aba por pontos; conclusao que precisa do bloco conclusoes do gerador)? O que das conclusoes ainda precisa de juizo do dono? Confira no codigo pelo menos tres afirmacoes dos mapas que o plano inteiro depende delas.`,
  { label: 'critico-do-plano', phase: 'Revisar', schema: CRIT, effort: 'high' })

return { conclusoes: concl, mapas, critico }
