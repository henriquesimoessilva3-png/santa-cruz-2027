export const meta = {
  name: 'dinheiro-e-repeticao-mapa-e-regua',
  description: 'Rodada do dinheiro, parte 1 (so leitura + medicao no rascunho): mapear onde o desconto do dinheiro e a repeticao "ano seguinte" sao criterio, desenhar a regua nova com 3 propostas medidas, julgar e sintetizar o plano de implementacao',
  phases: [
    { title: 'Mapear', detail: 'gerador e ranking_gaps; telas; conclusoes e spec' },
    { title: 'Desenhar', detail: '3 propostas independentes de regua, portas e selos, cada uma medida no rascunho' },
    { title: 'Julgar', detail: '2 juizes e a sintese com o plano por dono de arquivo' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Ranking/1abbf5c7-a19a-4f3a-89c2-26d0445cdbba/scratchpad'
const W = S + '/dinheiro'
const F = RAIZ + '/_fonte/prototipo'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B, aba Prototipo: gerador \`gerar_prototipo.py\` -> \`dados/prototipo.json\` (+ \`static/prototipo.js\`), \`ranking_gaps.py\` (tabela de gaps e guardas, importado pelo gerador), telas \`static/proto.js\` (casca, vocabulario unico: ptSorte, ptJunto, ptPortaTxt...), \`proto_a.js\` (0-4), \`proto_b.js\` (5-8), \`proto_c.js\` (9-15), \`proto_glossario.js\`, contrato \`static/proto_contrato.md\`; conclusoes em \`${F}/CONCLUSOES.md\` e \`${F}/conclusoes_spec.json\`; especificacao \`${F}/ESPECIFICACAO.md\` (secao 6.5 = portas). LEIA ANTES: \`${F}/CONTINUAR.md\` inteiro (principalmente 2.2, 2.3, 2.4 item 3, 3 item 3 e TODA a secao 5).

AS DUAS DECISOES DO DONO QUE ESTA RODADA EXECUTA (nao reabrir):
1. "Descontado o dinheiro" (desconto pelo valor do elenco, o "liquido": p_liq/d_liq/liq2, controle tm_valor_total, referencia_dinheiro como regua) SAI DE VEZ: dos selos, das portas, das marcas e da tela ("da para montar elenco valioso gastando pouco"). As conclusoes SOBRE o proprio valor do elenco (DIN-*) CONTINUAM.
2. A repeticao "o mesmo clube repete o numero no ano seguinte" (rho_persist, etapa_6.rho como criterio) SAI de todos os criterios: regua dos selos (o FORTE deixa de pedi-la e ela sai do desempate), porta A do catalogo (rho_persist >= 0,30), esmaecido da etapa 9 (rho < 0,30), entrada da etapa 10 (rho_persist < 0,15), score da etapa 13 (so porta A) e as frases "nao se viu o mesmo clube repetir o numero". FICAM: o 1o turno prevendo o 2o (mesmo ano) e a checagem em 2018-2021 (protege contra sorte). As conclusoes cujo ASSUNTO e a repeticao (FIS-07, M1, M6, M7, ELE-06) FICAM com o selo.
E UM ACERTO PEDIDO: "pode ser sorte" hoje tem dois sentidos (etapa 5: p < 0,05 sem passar no q; ptSorte da etapa 2: p ou q >= 2·alfa). A aba inteira precisa de UM vocabulario de sorte.
Tambem desta rodada (CONTINUAR 2.3): DIN-04 e DIN-05 relidas com a leitura por jogador; DIN-01 usa o controle da cobertura contra a decisao "sem preco = valor baixo"; nas fisicas o desconto junta dinheiro e rodizio de elenco — sem o dinheiro falta a conta so com o rodizio (decide FIS-04 e M4); regra_maquina que fazem coisa errada quando o dinheiro sai (ORI-01, A4, ELE-03, J15, A1, DIN-04, DIN-05); a lente rapida sobre o conserto final das conclusoes (retorno "conserta" em \`${F}/sessao_14_09/conclusoes_fecho_journal.json\`); e a ordem de servico do bloco 2 (\`${F}/sessao_14_09/ordem_gerador_bloco2.json\`, \`declaracoes_novas.json\`) revista.
Lista ja feita de onde a repeticao "ano seguinte" e criterio: \`${F}/sessao_14_09/pendente_rodada_repeticao.json\`.

ESTADO DO PROJETO: etapas 5 e 6 acabaram de ser refeitas e commitadas nesta noite (etapa 6 = mesmo ano; etapa 5 = tabela por grupos com firmeza por q<0,05 / p<0,05). Regras da casa: nenhum numero digitado na tela; ausencia com motivo; analise nova declarada antes de medir; portugues de reuniao de clube; associacao nunca vira receita; um dono por arquivo; set iterado vira sorted; sorteio com gerador proprio; fora do main carregue G.DECL = G.carregar_declaracao() antes de montar_matriz; para rodar o main sem gravar troque G.SAIDA e use python3 -B.
ESTA PARTE E SO LEITURA E MEDICAO: NAO edite nenhum arquivo do projeto. Tudo que escrever vai em ${W}. PROIBIDO qualquer git. OUTRA SESSAO DO CLAUDE trabalha no mesmo repositorio (app.js, app.py, templates, bola_parada, premissas, cenarios, docs): nao toque. Nao use as portas 5090/5091.`

const MAPA = { type: 'object', properties: {
  itens: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, linha: { type: 'string' }, o_que_decide: { type: 'string' },
    criterio: { type: 'string', enum: ['dinheiro', 'repeticao_ano_seguinte', 'sorte_vocabulario', 'outro_2_3'] },
    papel: { type: 'string', enum: ['criterio', 'descritivo_fica', 'texto_de_tela', 'conclusao'] },
    proposta: { type: 'string' },
  }, required: ['arquivo', 'linha', 'o_que_decide', 'criterio', 'papel', 'proposta'] } },
  resumo: { type: 'string' },
  medidas: { type: 'string' },
}, required: ['itens', 'resumo', 'medidas'] }

const PROPOSTA = { type: 'object', properties: {
  angulo: { type: 'string' },
  regua_selos: { type: 'string' },
  portas: { type: 'string' },
  etapas_9_10_13: { type: 'string' },
  vocabulario_sorte: { type: 'string' },
  fisicas_rodizio_e_din: { type: 'string' },
  impacto_medido: { type: 'string' },
  selos_antes_depois: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, antes: { type: 'string' }, depois: { type: 'string' }, por_que: { type: 'string' },
  }, required: ['id', 'antes', 'depois', 'por_que'] } },
  riscos: { type: 'array', items: { type: 'string' } },
  arquivos_de_medicao: { type: 'array', items: { type: 'string' } },
}, required: ['angulo', 'regua_selos', 'portas', 'etapas_9_10_13', 'vocabulario_sorte', 'fisicas_rodizio_e_din', 'impacto_medido', 'selos_antes_depois', 'riscos', 'arquivos_de_medicao'] }

const JUIZO = { type: 'object', properties: {
  notas: { type: 'array', items: { type: 'object', properties: {
    angulo: { type: 'string' }, fidelidade_ao_dono: { type: 'integer' }, protecao_contra_sorte: { type: 'integer' },
    leitura_do_dono: { type: 'integer' }, custo: { type: 'integer' }, erros_de_conta: { type: 'array', items: { type: 'string' } }, comentario: { type: 'string' },
  }, required: ['angulo', 'fidelidade_ao_dono', 'protecao_contra_sorte', 'leitura_do_dono', 'custo', 'erros_de_conta', 'comentario'] } },
  vencedora: { type: 'string' }, enxertos: { type: 'array', items: { type: 'string' } },
}, required: ['notas', 'vencedora', 'enxertos'] }

const PLANO = { type: 'object', properties: {
  regua_final: { type: 'string' },
  portas_final: { type: 'string' },
  etapas_9_10_13_final: { type: 'string' },
  vocabulario_sorte_final: { type: 'string' },
  conclusoes: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, selo_antes: { type: 'string' }, selo_depois: { type: 'string' }, o_que_muda_no_texto: { type: 'string' },
  }, required: ['id', 'selo_antes', 'selo_depois', 'o_que_muda_no_texto'] } },
  as_cinco_depois: { type: 'string' },
  plano_por_dono: { type: 'array', items: { type: 'object', properties: {
    dono: { type: 'string' }, arquivos: { type: 'array', items: { type: 'string' } }, tarefas: { type: 'array', items: { type: 'string' } }, depende_de: { type: 'array', items: { type: 'string' } },
  }, required: ['dono', 'arquivos', 'tarefas', 'depende_de'] } },
  diff_permitido_no_json: { type: 'string' },
  decisoes_do_dono: { type: 'array', items: { type: 'object', properties: {
    pergunta: { type: 'string' }, opcoes: { type: 'array', items: { type: 'string' } }, recomendacao: { type: 'string' }, por_que_e_do_dono: { type: 'string' },
  }, required: ['pergunta', 'opcoes', 'recomendacao', 'por_que_e_do_dono'] } },
  fica_para_o_item_6: { type: 'array', items: { type: 'string' } },
  numeros_para_o_dono: { type: 'string' },
}, required: ['regua_final', 'portas_final', 'etapas_9_10_13_final', 'vocabulario_sorte_final', 'conclusoes', 'as_cinco_depois', 'plano_por_dono', 'diff_permitido_no_json', 'decisoes_do_dono', 'fica_para_o_item_6', 'numeros_para_o_dono'] }

const J = (x, n) => JSON.stringify(x, null, 1).slice(0, n)

/* ---------------- 1. mapear ---------------- */
phase('Mapear')
const LENTES = [
  { k: 'gerador', t: `\`gerar_prototipo.py\` e \`ranking_gaps.py\` (e, so para listar, \`gerar_pontos.py\`, que fica para o item 6): todo lugar onde o dinheiro (liquido, liq2, tm_valor_total como controle, referencia_dinheiro, baseline de dinheiro) ou a repeticao no ano seguinte (rho_persist, etapa_6.rho, persist) DECIDE algo — porta A/B/C/D, esmaecido da etapa 9, entrada da etapa 10, score/notas da etapa 13 e 14, marcas e guardas do ranking_gaps, ordem, filtro — separado do que so DESCREVE e fica (etapa 1 sobre o valor, DIN-*, a tabela de ano para ano como dado). Para cada criterio, o que acontece se ele sair (o que o gate passa a deixar entrar) MEDIDO no dado gravado (${RAIZ}/dados/prototipo.json): quantos indicadores mudam de porta, quantos entram na etapa 10, quantos no score da etapa 13.` },
  { k: 'telas', t: `\`static/proto.js\`, \`proto_a.js\`, \`proto_b.js\`, \`proto_c.js\`, \`proto_glossario.js\`, \`proto_contrato.md\`: todo texto, coluna, filtro, selo ou marca que apresenta "descontado o dinheiro", "liquido", "resiste ao dinheiro", "baseline do dinheiro" como criterio, ou "se repete no ano seguinte"/"de um ano para o outro" como criterio (a checagem 2018-2021 e o 1o->2o turno ficam), e TODOS os usos de "pode ser sorte"/ptSorte/"no limite"/"dificilmente e sorte"/rotulos de firmeza, com o corte que cada um usa. Proponha UM vocabulario de sorte para a aba inteira que caiba nos dois usos (sinal isolado por p; sinal que passa na conta dos muitos testes por q; lista inteira contra o sorteio).` },
  { k: 'conclusoes', t: `\`${F}/CONCLUSOES.md\`, \`${F}/conclusoes_spec.json\` (criterios_do_selo, regra_maquina, moldes), \`${F}/sessao_14_09/ordem_gerador_bloco2.json\`, \`declaracoes_novas.json\` e o retorno "conserta" de \`conclusoes_fecho_journal.json\`: para CADA uma das 56 conclusoes e das "cinco", onde o selo depende do dinheiro ou da repeticao no ano seguinte, e qual selo sairia pela regua escrita SEM esses dois criterios (medido com os numeros ja gravados; diga quando precisa de conta nova). E os itens do CONTINUAR 2.3: DIN-04/DIN-05 com a leitura por jogador (etapa_1.valor_por_setor.ponderado_por_jogador), DIN-01 e o controle da cobertura, FIS-04 e M4 com a conta so com rodizio (atletas usados) — existe no dado? se nao, o que medir —, as regra_maquina que quebram sem dinheiro, e a lente rapida sobre o conserto final (o que ele consertou esta certo?).` },
]
const mapas = (await parallel(LENTES.map(L => () => agent(`${CASA}\n\nSUA LENTE: ${L.t}\nDevolva cada item com arquivo e linha, o que decide, qual criterio, o papel e a proposta; em medidas, os numeros que voce mediu e como.`,
  { label: 'mapa:' + L.k, phase: 'Mapear', schema: MAPA, effort: 'high' }).then(r => r ? { ...r, k: L.k } : null)))).filter(Boolean)
log(`mapas: ${mapas.map(m => m.k + '=' + m.itens.length).join(' · ')}`)

/* ---------------- 2. desenhar ---------------- */
phase('Desenhar')
const ANGULOS = [
  { k: 'minima', t: `MUDANCA MINIMA: tire os dois criterios e mude o menos possivel no resto (a regua, as portas, os gates e o vocabulario continuam como estao, so sem dinheiro e sem ano seguinte). Diga o que a regua perde de protecao e se isso deixa algum selo mais forte do que o dado sustenta.` },
  { k: 'contra_sorte', t: `PROTECAO CONTRA SORTE: o dinheiro e o ano seguinte eram, na pratica, duas barreiras. Sem elas, redesenhe a regua e as portas para que a protecao venha do que fica e e legitimo — conta dos muitos testes (q), lista inteira contra o sorteio dentro do ano, 1o->2o turno, reaparecer em 2018-2021, estabilidade por clube (bootstrap ja gravado) — sem inventar criterio que o dono nao pediu e sem reintroduzir dinheiro ou ano seguinte por outro nome.` },
  { k: 'leitura', t: `LEITURA DO DONO: a regua mais simples de explicar numa reuniao de clube, com o menor numero de criterios e um vocabulario de sorte unico, que ainda seja honesta (fraco e sem sinal continuam sendo ditos; nada de receita). Diga, conclusao a conclusao, o texto que o dono leria.` },
]
const MAPAS_TXT = J(mapas, 90000)
const propostas = (await parallel(ANGULOS.map(A => () => agent(`${CASA}\n\nOS MAPAS (retorno das 3 lentes):\n${MAPAS_TXT}\n\nSUA TAREFA: proponha a regua nova (selos forte/moderado/fraco/sem sinal/nao da para afirmar), as portas do catalogo, os gates das etapas 9, 10 e 13 (e o que a 14 herda), o vocabulario unico de sorte e o tratamento das fisicas (conta so com rodizio) e das DIN-*. ANGULO: ${A.t}\nMEÇA NO RASCUNHO (${W}/${A.k}/), com o dado gravado e/ou rodando pedaços do gerador sem gravar: portas antes/depois (contagem), indicadores na etapa 10 e no score da 13 antes/depois, e o selo de CADA uma das 56 conclusoes e das cinco antes/depois pela sua regua. Nenhum numero de cabeca.`,
  { label: 'propoe:' + A.k, phase: 'Desenhar', schema: PROPOSTA, effort: 'high' }).then(r => r ? { ...r, k: A.k } : null)))).filter(Boolean)
log(`propostas: ${propostas.map(p => p.k).join(', ')}`)

/* ---------------- 3. julgar e sintetizar ---------------- */
phase('Julgar')
const PROP_TXT = J(propostas, 120000)
const juizes = (await parallel(['rigor', 'dono'].map(lente => () => agent(`${CASA}\n\nAS PROPOSTAS:\n${PROP_TXT}\n\nVOCE JULGA, e a sua inclinacao e achar erro. ${lente === 'rigor'
  ? 'LENTE DO RIGOR: refaca por conta propria, no rascunho (' + W + '/juiz_rigor/), as contas de impacto de cada proposta (portas, etapa 10, score da 13, e o selo de pelo menos 15 conclusoes sorteadas) e aponte conta errada; julgue quanto cada uma deixa passar achado de sorte agora que dinheiro e ano seguinte sairam.'
  : 'LENTE DO DONO: fidelidade as duas decisoes (nada de dinheiro ou ano seguinte voltando por outro nome; DIN-* e as conclusoes sobre repeticao ficam), clareza para uma reuniao de clube, vocabulario de sorte unico, e custo de implementar sem quebrar as telas das etapas 5 e 6 recem-refeitas.'} Nota de 1 a 5 em cada eixo (custo: 5 = barato), a vencedora e os enxertos das outras.`,
  { label: 'julga:' + lente, phase: 'Julgar', schema: JUIZO, effort: 'high' })))).filter(Boolean)

const plano = await agent(`${CASA}\n\nMAPAS:\n${J(mapas, 50000)}\n\nPROPOSTAS:\n${J(propostas, 70000)}\n\nJUIZES:\n${J(juizes, 20000)}\n\nSUA TAREFA: sintetize a regua FINAL a partir da vencedora com os enxertos (corrija as contas que o juiz do rigor derrubou, refazendo-as em ${W}/sintese/), e escreva o PLANO DE IMPLEMENTACAO por dono de arquivo, na ordem de dependencia (gerador e ranking_gaps primeiro; spec e CONCLUSOES depois do dado; telas por arquivo; glossario/contrato; gravacao; conferencia), com o diff permitido no prototipo.json. Liste o selo de CADA conclusao antes/depois e as cinco mais firmes depois. Em decisoes_do_dono, SO o que genuinamente e escolha dele e nao se resolve pelas duas decisoes ja tomadas (ex.: se a regua nova deixar muitas conclusoes mais fortes, ou se "critério de contratação" da porta A precisa mudar de nome/sentido) — com recomendacao. Em fica_para_o_item_6, o que so vale para gerar_pontos.py. Em numeros_para_o_dono, 5-8 numeros simples do efeito (portas, selos, cinco).`,
  { label: 'sintese:plano', phase: 'Julgar', schema: PLANO, effort: 'high' })

return { mapas, propostas, juizes, plano }
