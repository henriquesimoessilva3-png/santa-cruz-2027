export const meta = {
  name: 'dinheiro-parte2b-curta',
  description: 'Rodada do dinheiro, parte 2B pelo caminho curto (pedido do dono): reaproveita casca e telas da execucao anterior, uma conferencia, conserto do que quebra ou mente, gravacao e checagem',
  phases: [
    { title: 'Casca', detail: 'do cache' },
    { title: 'Telas', detail: 'do cache' },
    { title: 'Conferir', detail: 'uma conferencia so' },
    { title: 'Consertar', detail: 'so quebra ou mente' },
    { title: 'Gravar', detail: 'dado + checagem final' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Ranking/1abbf5c7-a19a-4f3a-89c2-26d0445cdbba/scratchpad'
const W = S + '/dinheiro2b'
const NOVO = S + '/dinheiro2/prototipo_novo.json'
const F = RAIZ + '/_fonte/prototipo'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B, aba Prototipo: dado PROTO (\`static/prototipo.js\` = \`dados/prototipo.json\`, gerado por \`gerar_prototipo.py\`; copia por \`gerar_prototipo_js.py\`), telas \`static/proto.js\` (casca: PT_ETAPAS, vocabulario unico ptSorte/ptJunto/ptTecnico/ptPortaTxt/ptPortaMotivo, conclusoes nos slots se houver), \`proto_a.js\` (etapas 0-4), \`proto_b.js\` (5-8), \`proto_c.js\` (9-15), \`proto_glossario.js\` (gerado), \`style.css\`; contrato \`static/proto_contrato.md\`.
LEIA ANTES: \`${F}/CONTINUAR.md\` (secao 3 item 3 inteira, com a parte 2A, e TODA a secao 5); o plano aprovado \`${F}/sessao_14_09/dinheiro_parte1_resultado.json\` (chave plano: regua_final, portas_final, etapas_9_10_13_final, vocabulario_sorte_final, plano_por_dono das TELAS, e mapas[k=telas] com arquivo e linha de cada texto); o relato da 2A \`${F}/sessao_14_09/dinheiro_parte2a_resultado.json\` (chaves novas do JSON e riscos para a tela); as declaracoes \`${F}/sessao_14_09/declaracoes_novas.json\` (vocabulario_sorte, portas, regua_final).
O DADO NOVO JA CONFERIDO (ainda nao gravado): \`${NOVO}\`. Nele: sai o desconto do dinheiro (d_liq/p_liq/q_liq/ic_liq/liq2, referencia_dinheiro, residualizado, desconto_dinheiro_por_grupo, Controle 1) e a repeticao no ano seguinte como criterio (rho_persist/n_persist, esmaecido, porta_B_sem_persistencia_medida); entram d_rod/p_rod (so rodizio, fisico), a CHAVE de sorte (firme | pode_ser_sorte | sem_diferenca) nas etapas 2, 5, 6, 7, 9 e ranking_gaps, excesso {bruto, rod} com a chave de lista (tem/nao tem mais achados do que a sorte produz), portas A/B/-/D sem C (A = "firme e reaparece por outro caminho", SO LEITURA), etapa 10 com 22 linhas pela lista fixa, marca da lista por setor na etapa 13, etapa_14.justificativa_no_dado.porta como DICIONARIO (share_11 B, atletas_usados -), etapa 15 sem rho digitado, q dos 28 na etapa 7.
DECISOES QUE A TELA TEM DE REFLETIR: (1) "descontado o dinheiro" some da tela como criterio, coluna, filtro, selo ou frase — o valor do elenco continua DESCRITO (etapa 1, regua H_dinheiro, cenarios da 14 com o titulo "Quanto subiu, na historia, cada faixa de orcamento"); (2) "se repete no ano seguinte"/"de um ano para o outro" some como criterio (fica a checagem 2018-2021 e o 1o->2o turno; etapa_6.rho pode continuar como dado onde ja nao aparecia como criterio); (3) UM vocabulario de sorte na aba inteira, sempre pela CHAVE gravada: "firme" (e "firme por pouco" so atras de firme), "pode ser sorte", "sem diferenca clara" (para rho "sem relacao clara"); lista: "a lista tem / nao tem mais achados do que a sorte produz"; SAEM "dificilmente e sorte" e "no limite" como rotulo de sorte ("no limite" so no selo da zona 0,05-0,10); "acima da linha da sorte" do ranking_gaps fica; o "firme" da etapa 8 (estabilidade de grupo) vira "estavel"/"se desfaz"; testes de rotulo comparam a CHAVE, nunca o texto (ex. pcSemLadoVisivel); (4) porta A com o nome novo e sem prometer uso em contratacao; porta C sumiu; (5) a ressalva do elenco valioso ("elenco valioso tende a ter isso; o estudo nao separa as duas coisas") onde a tela mostra as conclusoes que a levam; (6) M8 = ataque por clube (57 conclusoes), J17 moderada.
REGRAS DA CASA: nenhum numero digitado na tela; a tela nao calcula o que o gerador grava; ausencia com motivo; portugues de reuniao de clube; um dono por arquivo; nas telas, dado so por ptDado(); contraste >= 4,5:1; tabela larga rola na propria caixa; nada de rolagem lateral da pagina a 1.785 px e nada cortado a 400 px. As etapas 5 e 6 foram refeitas ontem (tabela por grupos; mesmo ano): nao desfaca o desenho delas.
OUTRA SESSAO DO CLAUDE TRABALHA NO MESMO REPOSITORIO (app.js, app.py, templates/index.html, bola_parada*, premissas, cenarios, docs): NAO TOQUE (SC_CENARIOS/SC_PREMISSAS sempre em copias em ${W}).
PROIBIDO: git que escreva; publicar; tocar em gerar_prototipo.py, ranking_gaps.py, gerar_pontos.py, dados/pontos.json, static/pontos.js, CONCLUSOES.md, conclusoes_spec.json, declaracoes (se achar erro neles, relate). NAO use nem derrube as portas 5090 e 5091. Teste headless com Playwright do Python na porta da sua tarefa, servidor derrubado ao fim. Rascunhos em ${W}.
ESPELHO DE TESTE: pasta ${W}/espelho_<seu_nome> com uma copia do static ATUAL do projeto (com os seus arquivos novos) e um prototipo.js montado de ${NOVO} (mesma logica do gerar_prototipo_js.py, sem gravar no projeto), servido pelo app.py real apontado para o espelho ou por servidor proprio. Teste padrao: 16/16 etapas, zero erro de console, zero undefined/NaN/[object, zero rolagem lateral da pagina a 1.785, nada cortado a 400, temas claro e escuro; e, na sua parte, os numeros da tela contra o JSON.`

const ESC = { type: 'object', properties: {
  arquivos_escritos: { type: 'array', items: { type: 'string' } },
  o_que_fiz: { type: 'array', items: { type: 'object', properties: { item: { type: 'string' }, onde: { type: 'string' }, como: { type: 'string' } }, required: ['item', 'onde', 'como'] } },
  api_para_os_outros: { type: 'string' }, como_testei: { type: 'string' },
  riscos: { type: 'array', items: { type: 'string' } },
}, required: ['arquivos_escritos', 'o_que_fiz', 'api_para_os_outros', 'como_testei', 'riscos'] }
const CONF = { type: 'object', properties: {
  lente: { type: 'string' }, conferidos: { type: 'integer' }, medidas: { type: 'string' },
  problemas: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, onde: { type: 'string' }, o_que_vi: { type: 'string' }, por_que_importa: { type: 'string' }, conserto: { type: 'string' },
    gravidade: { type: 'string', enum: ['quebra', 'mente', 'falta', 'detalhe'] },
  }, required: ['arquivo', 'onde', 'o_que_vi', 'por_que_importa', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'conferidos', 'medidas', 'problemas', 'veredito'] }
const J = (x, n) => JSON.stringify(x, null, 1).slice(0, n)

/* ---------------- 1. casca ---------------- */
phase('Casca')
const casca = await agent(`${CASA}\n\nSUA TAREFA: dono de \`static/proto.js\` (e so dele). Faca as tarefas do plano para a casca: vocabulario unico de sorte lido da CHAVE (uma funcao da casca que recebe a chave e devolve a frase; ptSorte deixa de decidir por corte proprio onde houver chave gravada, e onde nao houver, usa exatamente os mesmos cortes e palavras da chave, com a nota tecnica "sem a conta dos N testes" quando faltar q); "dificilmente e sorte" e "no limite" deixam de ser rotulo de sorte; PT_PORTA_TXT sem a C, com a A = "firme e reaparece por outro caminho" (sem "criterio de contratacao"/"entra no score") e a B como no plano; ptPortaMotivo sem dinheiro e sem ano seguinte; PT_ETAPAS e sumario sem dinheiro/ano seguinte como criterio; conclusoes nos slots (se a casca as mostra) coerentes com as 57 e as cinco; e todo texto da casca que o mapa[telas] do plano listou. Documente em api_para_os_outros as funcoes que proto_a/b/c devem usar (nome, argumentos, exemplos de saida). Porta 5230. Teste padrao no espelho.`,
  { label: 'dono:proto.js', phase: 'Casca', schema: ESC, effort: 'high' })
if (!casca) return { casca: null, parou: 'casca falhou' }

/* ---------------- 2. telas ---------------- */
phase('Telas')
const TELAS = [
  { k: 'proto_a', arq: 'static/proto_a.js', porta: 5231, t: `etapas 0 a 4: catalogo da etapa 2 (colunas liquidas, rho_persist, "se repete?", porta C, filtros e legendas, traducao do porta_motivo, coluna d_rod/p_rod no fisico, chave sorte_SM/sorte_SC), etapa 3 (passam5_liq/bh5_liq saem; excesso bruto/rod com a chave de lista), etapa 1 (Controle 1 como criterio sai; o valor fica descrito; controle de atletas "so rodizio"), e o que o mapa listou nesses arquivos.` },
  { k: 'proto_b', arq: 'static/proto_b.js', porta: 5232, t: `etapas 5 a 8: etapa 5 (sensibilidade da agregacao sem liq; rotulos da firmeza pela chave unica da casca — os numeros 32/73/481 nao mudam), etapa 6 (sem referencia_dinheiro; forca/sorte pela chave gravada em mesmo_ano; lista pela chave de lista), etapa 7 (q dos 28 e chave; hoje as 4 com p<0,05 saem "pode ser sorte"), etapa 8 (tipologia sem residualizado/desconto_dinheiro_por_grupo/trocam_no_dinheiro; "firme" de estabilidade vira "estavel"/"se desfaz"), e o que o mapa listou.` },
  { k: 'proto_c', arq: 'static/proto_c.js', porta: 5233, t: `etapas 9 a 15: etapa 9 (sem esmaecido nem "regua apagada"/"nao se repete", sem coluna liquida e "vivas no liquido", chave de sorte por regua, H_dinheiro como descricao), etapa 10 (lista fixa com 22 linhas, sem os blocos de persistencia; motivos), etapa 11 (pontes que liam etapa_6.rho como criterio — pcRhoDaEtapa6 — so como dado ou fora), etapa 13 (nota igual; MARCA da lista por setor: zaga e lateral "a lista nao tem mais achados do que a sorte", meio e ataque "tem"), etapa 14 (porta lida do dicionario: share_11 e atletas_usados cada um com a sua; Controle 1 sai; titulo do card de cenarios "Quanto subiu, na historia, cada faixa de orcamento"), etapa 15 (sem o rho digitado), testes de rotulo pela chave (pcSemLadoVisivel), e o que o mapa listou.` },
]
const telas = (await parallel(TELAS.map(T => () => agent(`${CASA}\n\nA casca ja foi feita. API da casca: ${J(casca, 12000)}\n\nSUA TAREFA: dono de \`${T.arq}\` (e so dele). ${T.t} Porta ${T.porta}. Teste padrao no espelho e, nas suas etapas, confira os numeros e rotulos da tela contra ${NOVO} (sorteie pelo menos 20 linhas por etapa com tabela) e procure na tela das suas etapas: "descontado", "liquido", "valor parecido", "resiste ao dinheiro", "se repete", "ano seguinte", "de um ano para o outro", "dificilmente", "no limite", "porta C", "criterio de contratacao" — cada ocorrencia que sobrar tem de ser descricao legitima, com o motivo no relato.`,
  { label: 'dono:' + T.k, phase: 'Telas', schema: ESC, effort: 'high' }).then(r => r ? { ...r, k: T.k } : null)))).filter(Boolean)
log(`telas: ${telas.map(t => t.k).join(', ')} (${TELAS.length - telas.length} falharam)`)

/* ---------------- 3. conferir (CAMINHO CURTO, 15/09: o dono pediu para encurtar a rodada) ----------------
   A casca e as tres telas vem do cache da execucao wf_cc8b841b-608. O glossario e o contrato ficam para
   depois: a conferencia so lista o que ficou falso neles. */
phase('Conferir')
const conf = await agent(`${CASA}\n\nO que foi feito: ${J({ casca, telas }, 50000)}\n\nCAMINHO CURTO (o dono pediu para encurtar a rodada): esta e a UNICA conferencia antes de gravar, e o glossario e o contrato ficam para depois. VOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. No espelho com o static atual do projeto e o prototipo.js de ${NOVO} (porta 5235; derrube ao fim), 1.785 e 400 px, claro e escuro:
(1) regressao: 16/16 etapas, zero erro de console, zero undefined/NaN/[object, zero rolagem lateral da pagina a 1.785, nada cortado a 400;
(2) varredura do texto visivel da aba inteira por "descontado", "liquido", "valor parecido", "resiste ao dinheiro", "se repete", "ano seguinte", "de um ano para o outro", "dificilmente", "no limite", "porta C", "critério de contratação", "entra no score" — cada ocorrencia com a etapa e se e descricao legitima ou criterio que sobrou;
(3) numeros e rotulos: nas etapas 2, 7, 9, 10, 13 e 14, 10 linhas sorteadas (semente 21) contra o JSON e a CHAVE gravada; portas A 2 · B 27 · - 264; etapa 10 com 22; etapa 9 sem reguas apagadas; marca da 13 por setor; porta da 14 por indicador; o mesmo rotulo de sorte com o mesmo sentido em todas as etapas;
(4) etapas 5 e 6 com o desenho de ontem intacto;
(5) o que a aba mostra das conclusoes bate com o CONCLUSOES.md novo (57; 3·17·17·15·5; cinco DIN-02, J1, J2, ELE-01, J6);
(6) app real com o dado GRAVADO de hoje (o antigo) e os static novos: nenhuma etapa quebra (ausencias escritas);
(7) SO LISTE, com gravidade detalhe (nao e defeito desta rodada): as entradas do proto_glossario.js e do proto_contrato.md que ficaram falsas.
Gravidade quebra ou mente so para o que o dono veria errado ou quebrado na tela.`,
  { label: 'confere:caminho-curto', phase: 'Conferir', schema: CONF, effort: 'high' })

/* ---------------- 4. consertar so o que quebra ou mente ---------------- */
const DON = [
  { k: 'casca', arq: 'proto.js', arqs: 'static/proto.js', porta: 5240 },
  { k: 'proto_a', arq: 'proto_a.js', arqs: 'static/proto_a.js', porta: 5241 },
  { k: 'proto_b', arq: 'proto_b.js', arqs: 'static/proto_b.js', porta: 5242 },
  { k: 'proto_c', arq: 'proto_c.js', arqs: 'static/proto_c.js', porta: 5243 },
]
const donoDe = p => DON.find(x => (p.arquivo || '').includes(x.arq)) || null
let consertos = [], sem_dono = []
const graves = conf ? conf.problemas.filter(p => ['quebra', 'mente'].includes(p.gravidade) && !/glossario|contrato/.test(p.arquivo || '')) : []
if (graves.length) {
  phase('Consertar')
  const por = {}
  for (const p of graves) { const d = donoDe(p); if (d) (por[d.k] = por[d.k] || []).push(p); else sem_dono.push(p) }
  consertos = (await parallel(Object.entries(por).map(([k, ps]) => () => {
    const d = DON.find(x => x.k === k)
    return agent(`${CASA}\n\nRODADA DE CONSERTO (a unica; caminho curto). Voce e dono de ${d.arqs}; nenhum outro arquivo. Porta ${d.porta}. Teste padrao no espelho, so nas etapas afetadas e a regressao 16/16.\nProblemas (confirme cada um; recuse com prova o que estiver errado):\n${J(ps, 20000)}`,
      { label: 'conserta:' + k, phase: 'Consertar', schema: ESC, effort: 'high' }).then(r => r ? { ...r, k } : null)
  }))).filter(Boolean)
}

/* ---------------- 5. gravar e checar ---------------- */
phase('Gravar')
const grav = await agent(`${CASA}\n\nSUA TAREFA: gravar o dado novo e fazer a checagem final (caminho curto). Voce so RODA o gerador; nao edite codigo.
1. Copie dados/prototipo.json para ${W}/prototipo_antes.json e static/prototipo.js para ${W}/prototipo_js_antes.js.
2. Rode \`python3 -B gerar_prototipo.py\` e \`python3 gerar_prototipo_js.py\` na raiz do projeto.
3. Compare o JSON gravado com ${NOVO} (o rascunho conferido na 2A): so gerado_em pode diferir. Se diferir em qualquer outra coisa, RESTAURE as duas copias e diga o que apareceu.
4. Confirme prototipo.js == prototipo.json.
5. Regressao headless no app real do projeto (porta 5245; SC_CENARIOS/SC_PREMISSAS em ${W}), 1.785 e 400 px, claro e escuro: 16/16, zero erro, zero undefined/NaN, zero rolagem lateral da pagina a 1.785, nada cortado a 400; portas A 2 · B 27, etapa 10 com 22, etapa 9 sem apagadas, e nenhum "descontado o dinheiro" como criterio.
6. Confirme na tela gravada que cada problema consertado sumiu, e diga quais problemas ficaram sem conserto.
7. git status: so os arquivos esperados da 2A e da 2B e nenhum da outra sessao.
Conferencia: ${J(conf, 20000)}
Consertos: ${J(consertos, 20000)}`,
  { label: 'grava-e-checa', phase: 'Gravar', schema: ESC, effort: 'high' })

return { casca, telas, conferencia: conf, consertos, sem_dono, gravacao: grav,
  pendente_glossario_contrato: conf ? conf.problemas.filter(p => /glossario|contrato/.test(p.arquivo || '')) : [] }
