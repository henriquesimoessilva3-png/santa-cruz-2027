export const meta = {
  name: 'etapa5-grupos-lado-a-lado',
  description: 'Etapa 5 redesenhada como a previa aprovada (numero na linha, subiu/meio/caiu nas colunas, valor tipico, diferenca contra o meio, firmeza) com a matriz por time embaixo como detalhe; restos da etapa 6; conferencia adversarial e gravacao do dado',
  phases: [
    { title: 'Gerar', detail: 'gerador no rascunho (chaves novas da etapa 5 + restos da etapa 6) e contraste do numero tecnico (style.css)' },
    { title: 'Tela', detail: 'proto_b.js: tabela nova por painel, matriz embaixo, restos da etapa 6' },
    { title: 'Conferir', detail: 'numeros refeitos por fora, tela no navegador, linguagem' },
    { title: 'Consertar', detail: 'uma rodada, por dono de arquivo' },
    { title: 'Gravar', detail: 'dados/prototipo.json + static/prototipo.js, diff e regressao' },
    { title: 'Conferir final', detail: 'app real com o dado gravado; conserto final so do que quebra ou mente' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Ranking/1abbf5c7-a19a-4f3a-89c2-26d0445cdbba/scratchpad'
const W = S + '/etapa5'
const PREVIA = RAIZ + '/_fonte/prototipo/sessao_14_09/etapa5_previa'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B, aba Prototipo: dado global PROTO (\`static/prototipo.js\`, copia de \`dados/prototipo.json\`, gerado por \`gerar_prototipo.py\`; copia por \`gerar_prototipo_js.py\`), telas \`static/proto.js\` (casca), \`proto_a.js\` (etapas 0-4), \`proto_b.js\` (5-8), \`proto_c.js\` (9-15), \`style.css\`, \`proto_glossario.js\` (gerado); contrato \`static/proto_contrato.md\`.
LEIA ANTES: \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\` (secoes 2.1, 2.4 itens 6 e 7, 3 item 2, 4 e 5) e o contrato.

PEDIDO DO DONO (14/09, noite, APROVADO, nao reabrir). Ele achou a etapa 5 (matriz por time com a POSICAO no ranking do ano, 0-100) "confusa, pouco visual e dificil de chegar a conclusao" e pediu: indicador na linha, os tres grupos (quem subiu, quem ficou no meio, quem caiu) nas colunas, o valor BRUTO tipico de cada grupo e a diferenca em %. Foi feita uma PREVIA com os numeros reais e ele aprovou: "gostei, pode seguir assim e a matriz fica embaixo como detalhe".
A PREVIA E A REFERENCIA VISUAL E DE REGRA: \`${PREVIA}/previa_etapa5.html\` (abra no navegador headless) e \`${PREVIA}/montar_previa.py\` (as regras escritas no topo). Numeros que a previa produziu com o dado de hoje: 11 paineis, 293 numeros, 586 comparacoes = 32 firmes, 73 que podem ser sorte, 481 sem diferenca clara; exemplo "% de duelos aereos ganhos (zaga)": posicao tipica 60 · 60 · 27,5 contra valor 61,563 · 61,274 · 58,804 (%), subiu +0,29 pts e caiu −2,47 pts contra o meio, subiu x caiu "pode ser sorte".
AS REGRAS (as da previa, agora do estudo):
- valor tipico = MEDIANA crua do grupo nas temporadas 2022-2025 (\`faixa_*_bruto[1]\`, que ja existem); media (catalogo da etapa 2, m_sobe/m_meio/m_cai) e a faixa do 1o ao 3o quarto (faixa_*_bruto[0] e [2]) e a posicao tipica (faixa_*[1]) vao na dica.
- diferenca de quem subiu e de quem caiu CONTRA O MEIO: em % do meio; quando o numero ja e porcentagem, em PONTOS PERCENTUAIS. O tipo sai da unidade DECLARADA do indicador na fonte do gerador (conferida contra o glossario; divergencia vira aviso no relato).
- firmeza de cada comparacao (subiu x meio e subiu x caiu), lida dos testes do catalogo da etapa 2 (p_bruto_SM/q_SM, p_bruto_SC/q_SC, feitos na posicao dentro do ano): q < 0,05 = firme; p < 0,05 sem passar no q = pode ser sorte; senao = sem diferenca clara.
- ordem das linhas: pela firmeza (menor q das duas comparacoes; empate pela ordem do estudo) ou a do estudo; NUNCA pelo tamanho da diferenca (unidades diferentes nao se ordenam entre si).
- "melhor/pior que o meio" so onde o estudo declarou lado (sinal +1/−1); tecnico por jogador e fisico ficam "sem lado bom declarado".
- a matriz por time CONTINUA, EMBAIXO de cada painel, aberta, como DETALHE (com as linhas das faixas, a ordem pela diferenca, as marcas de base de 3-4 jogadores e o que ja tem hoje), com um titulo que diga que ali o numero e a posicao no ranking do ano.
- a etapa abre com o exemplo nos dois formatos (o do print do dono: \`ti_zaga_duelos_aereos_ganhos\`, declarado como exemplo escolhido do print do dono; sem esse id no dado, o bloco sai com ausencia).
- aviso do setor com pouca gente (vazios_por_setor) no painel do setor.
- limites ditos: 16 temporadas em cada ponta; associacao no mesmo ano nao e causa (a etapa 7 separa); a firmeza vem do teste na posicao dentro do ano.
- cores dos grupos = as da etapa 6 (azul claro subiu, laranja caiu, cinza meio); cor de melhor/pior e outra (verde/vermelho discretos), para nao confundir com o grupo.

REGRAS DA CASA: nenhum numero digitado na tela; a tela NAO calcula diferenca, firmeza, ordem nem contagem — le do gerador; ausencia com motivo; regra declarada no bloco antes de medir; portugues de reuniao de clube com o vocabulario unico de proto.js (ptSorte, ptJunto, ptTecnico, ptFx/ptFxRot); associacao nunca vira receita; um dono por arquivo; set iterado vira sorted; comentario em prosa do por que; fora do main carregue \`G.DECL = G.carregar_declaracao()\` antes de montar_matriz; para rodar o main sem gravar troque G.SAIDA e use python3 -B; nas telas, dado so por ptDado(). Contraste de TODO texto (inclusive o numero tecnico pequeno) >= 4,5:1 nos temas claro e escuro.
ATENCAO — OUTRA SESSAO DO CLAUDE TRABALHA NO MESMO REPOSITORIO (abas Financeiro/Orcamento e Bola parada): ela escreve \`static/app.js\`, \`app.py\`, \`templates/index.html\`, \`static/bola_parada*\`, \`dados/premissas.json\`, \`dados/cenarios.json\`, \`docs/\` e faz commit e publicacao. VOCE NAO TOCA NESSES ARQUIVOS (SC_CENARIOS e SC_PREMISSAS sempre apontando para copias em ${W}).
PROIBIDO: qualquer git que escreva; publicar; tocar em \`gerar_pontos.py\`, \`dados/pontos.json\`, \`static/pontos.js\`, \`ranking_gaps.py\`, CONCLUSOES.md, conclusoes_spec.json; mexer em regua, selos, portas, catalogo ou desconto do dinheiro (rodada propria). NAO use nem derrube as portas 5090 e 5091. Teste headless com Playwright do Python numa porta PROPRIA (a da sua tarefa), servidor derrubado ao fim. Rascunhos em ${W}.`

const RESTOS6 = `RESTOS DA ETAPA 6 (rodada anterior, conferencia final "ajustar"; relato completo em ${RAIZ}/_fonte/prototipo/sessao_14_09/etapa6_mesmo_ano_resultado.json):
(g1, gerador) rho_mesmo_ano.share_11.motivo_consequencia = "time que ganha usa quase sempre o mesmo XI" mas etapa_6.mesmo_ano.marca_consequencia.share_11 = "time que ganha repete o XI": um texto so, o primeiro (a palavra "repete" nao deve aparecer na etapa 6).
(t1, proto_b) o gerador grava rho_mesmo_ano[id].mesmo_posto_que, grupos_mesmo_posto e lista_inteira.n_testes_distintos (70) / com_p_menor_005_distintos (40), mas a tela nao le: "distancia percorrida por 90 min" e "metros por minuto" (e as versoes com/sem a bola) aparecem lado a lado com os mesmos pontos, como se fossem achados independentes. A tela deve dizer, no quadradinho, que e o mesmo numero que X (mesma ordem dos times), e a lista inteira contar os distintos.
(c1, style.css) o numero tecnico pequeno (ptTecnico / .pt-tec e o rodape das miniaturas) sai em var(--tinta3): 3,38:1 no escuro e 2,77:1 no claro.`

const ESC = { type: 'object', properties: {
  arquivos_escritos: { type: 'array', items: { type: 'string' } },
  o_que_fiz: { type: 'array', items: { type: 'object', properties: { item: { type: 'string' }, onde: { type: 'string' }, como: { type: 'string' } }, required: ['item', 'onde', 'como'] } },
  chaves_do_json: { type: 'string' }, numeros_principais: { type: 'string' }, como_testei: { type: 'string' },
  riscos: { type: 'array', items: { type: 'string' } },
}, required: ['arquivos_escritos', 'o_que_fiz', 'chaves_do_json', 'numeros_principais', 'como_testei', 'riscos'] }

const CONF = { type: 'object', properties: {
  lente: { type: 'string' }, conferidos: { type: 'integer' }, medidas: { type: 'string' },
  problemas: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, onde: { type: 'string' }, o_que_vi: { type: 'string' }, por_que_importa: { type: 'string' }, conserto: { type: 'string' },
    gravidade: { type: 'string', enum: ['quebra', 'mente', 'falta', 'detalhe'] },
  }, required: ['arquivo', 'onde', 'o_que_vi', 'por_que_importa', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'conferidos', 'medidas', 'problemas', 'veredito'] }

const J = (x, n) => JSON.stringify(x, null, 1).slice(0, n)
const PERMITIDO = `SO podem mudar: gerado_em; chaves NOVAS dentro de cada etapa_5.paineis[*] e em etapa_5 (as desta rodada, declaradas); o texto de etapa_6.mesmo_ano.marca_consequencia.share_11. Qualquer outra diferenca (numero, ordem, sorteio de outra etapa) e defeito.`

/* ---------------- 1. gerar ---------------- */
phase('Gerar')
const P_GERADOR = `SUA TAREFA: dono de \`gerar_prototipo.py\` (e so dele).
1. Declare, no bloco da etapa 5 e antes do codigo que calcula, a regra do resumo por grupos (as REGRAS acima, com os cortes 0,05 e a origem dos testes).
2. Grave, em cada painel, alinhado a \`indicadores\` (nomes claros; sugestao, pode melhorar): \`resumo_grupos\` = {tipo_diferenca: ["pp"|"rel"], unidade: [...], diferenca_contra_meio: {sobe: [...], cai: [...]}, media_crua: {sobe, meio, cai} (do catalogo), firmeza: {sobe_meio: [{p, q, rotulo}], sobe_cai: [...]}, contagem: {firme, pode_ser_sorte, sem_diferenca, por_comparacao: {...}}, ordem_por_firmeza: [...], motivos: {...} quando faltar algo}; e em etapa_5: \`regra_do_resumo\` (declarada), \`exemplo\` ({id, escolhido_por: "print do dono, 14/09", e os numeros que a tela precisa: posicao tipica e valor tipico dos tres grupos, diferencas, firmeza} ou ausencia com motivo). Rotulos de firmeza como texto de tela ("firme", "pode ser sorte", "sem diferença clara"). A contagem geral tem de dar a da previa (32 · 73 · 481) — se nao der, explique a diferenca.
3. ${RESTOS6.split('\n')[1]}
4. Rode o main NO RASCUNHO (G.SAIDA = ${W}/prototipo_e5.json; python3 -B), PYTHONHASHSEED 1 e 2 identicos. Diff caminho a caminho contra o dados/prototipo.json gravado: ${PERMITIDO}
5. Confirme que gerar_pontos.py continua podendo chamar o que chama (se ele chamar a funcao da etapa 5, a chave nova sai com ausencia e motivo no d80 dele, sem erro; nao rode o pipeline dele).
6. NAO grave dados/prototipo.json.
Devolva em chaves_do_json as chaves exatas com exemplo curto de um painel; em numeros_principais: a contagem geral e por painel, o exemplo inteiro, 5 linhas do painel tecnico_ind_zaga (id, tipo, valores tipicos, diferencas, firmezas) e as divergencias de unidade contra o glossario.`

const P_CSS = `SUA TAREFA: dono de \`static/style.css\` (e so dele). ${RESTOS6.split('\n')[3]} Leve o texto tecnico pequeno da aba Prototipo (escopo #pgProto, e so ele — nao mexa em outras abas) a >= 4,5:1 nos dois temas (body.claro e o escuro padrao), sem aumentar a fonte e sem mudar --tinta3 global (outras abas usam). Meça antes e depois no navegador headless (app real, porta 5201; SC_CENARIOS/SC_PREMISSAS em ${W}) em 6 lugares da aba (miniatura da etapa 6, ptTecnico da etapa 2, 5, 7, 11, 14). Regressao: 16/16, zero erro, zero rolagem lateral a 1.785, nada cortado a 400; e uma olhada nas abas vizinhas (Fisico, Serie B) para provar que nada mudou nelas.`

const [ger, css] = await Promise.all([
  agent(`${CASA}\n\n${P_GERADOR}`, { label: 'dono:gerador', phase: 'Gerar', schema: ESC, effort: 'high' }),
  agent(`${CASA}\n\n${P_CSS}`, { label: 'dono:style.css', phase: 'Gerar', schema: ESC, effort: 'high' }),
])
log(`gerador: ${ger ? 'ok' : 'FALHOU'} · css: ${css ? 'ok' : 'FALHOU'}`)
if (!ger) return { gerador: null, css, parou: 'gerador falhou; nada de tela nem gravacao' }

/* ---------------- 2. tela ---------------- */
phase('Tela')
const ESPELHO = porta => `TESTE: pasta-espelho em ${W}/espelho_<seu_nome> com uma copia do static ATUAL e um prototipo.js montado de ${W}/prototipo_e5.json (mesma logica do gerar_prototipo_js.py, sem gravar no projeto), servida pelo app real apontado para o espelho ou por servidor proprio, porta ${porta}, a 1.785 e a 400 px, tema claro e escuro: 16/16 etapas, zero erro no console, zero undefined/NaN, zero rolagem lateral da PAGINA a 1.785, nada cortado a 400 (tabela larga rola dentro da propria caixa). E o app real com o dado GRAVADO de hoje (sem as chaves novas): a etapa 5 escreve a ausencia do resumo, discreta, e a matriz continua; sem erro.`
const P_PROTO_B = `SUA TAREFA: dono de \`static/proto_b.js\` (e so dele).
1. ETAPA 5 como a previa aprovada (abra ${PREVIA}/previa_etapa5.html no navegador e leia o JS dela: e o modelo de desenho e de texto; os NUMEROS agora vem das chaves do gerador, nunca calculados na tela):
   - abertura da etapa com o que cada coluna quer dizer e o exemplo nos dois formatos (etapa_5.exemplo);
   - controles da etapa: ordem (mais firme primeiro / a do estudo), busca por numero, "esconder o que nao mostra diferenca", e saltos para os 11 paineis;
   - em cada painel, ANTES da matriz: titulo, fonte, resumo (contagem do gerador), aviso de setor com pouca gente, e a tabela: Numero (nome simples via o vocabulario da casca, unidade, lado) | Subiu | Ficou no meio | Caiu (valor tipico; dica com media, faixa do 1o ao 3o quarto e posicao tipica) | Onde fica cada grupo (tres faixas finas do 1o ao 3o quarto com a bolinha do tipico, escala da propria linha) | Subiu contra o meio | Caiu contra o meio (com "melhor/pior que o meio" so onde ha lado) | A diferenca e firme? (dois selos: subiu x meio, subiu x caiu; p e q so na dica/ptTecnico) — e a marca "na posicao de cada ano, a ordem dos grupos e outra" onde ordem_das_medianas_difere_no_cru for verdadeira (sem os casos so por empate);
   - DEPOIS da tabela, a matriz por time que ja existe, inteira e aberta, sob um titulo do tipo "Detalhe por time: posicao no ranking do ano (0 a 100)", com tudo o que ela ja faz (linhas das faixas, ordem pela diferenca com o cabecalho, marcas de base, legendas);
   - cores dos grupos iguais as da etapa 6 (reuse PB6_CORES ou uma constante unica para as duas etapas); estilos inline (este arquivo nao escreve CSS); tabela larga rola na propria caixa; contraste >= 4,5:1.
   - PONTOS (aba por pontos) e dado sem as chaves: ptFaltaBloco discreto no lugar da tabela, matriz intacta.
2. ${RESTOS6.split('\n')[2]}
${ESPELHO(5202)} Confira em 3 paineis (tecnico_col, tecnico_ind_zaga, fisico_col_ataque) que cada linha da tabela bate com o JSON (valores tipicos, diferencas, selos, ordem) e que a matriz embaixo continua igual a de antes (compare contagem de celulas e cabecalhos com o app real de hoje). Na etapa 6: os pares de mesmo posto marcados e a contagem de distintos.
Relato do gerador: ${J(ger, 16000)}`

const tela = await agent(`${CASA}\n\n${P_PROTO_B}\n\nArquivos que VOCE pode escrever: static/proto_b.js. Nenhum outro.`,
  { label: 'dono:proto_b', phase: 'Tela', schema: ESC, effort: 'high' })
log(`tela: ${tela ? 'ok' : 'FALHOU'}`)

/* ---------------- 3. conferir ---------------- */
phase('Conferir')
const FEITO = `O que foi feito: ${J({ gerador: ger, css, tela }, 40000)}`
const LENTES = [
  { k: 'numeros', t: `OS NUMEROS, refeitos por fora (sem importar o codigo novo do gerador para calcular): a partir de etapa_5.paineis[*].faixa_*_bruto, das unidades declaradas e do catalogo da etapa 2 de ${W}/prototipo_e5.json, refaca para TODOS os 293 numeros: tipo da diferenca, diferencas contra o meio, firmezas (rotulos pelos cortes declarados), ordem_por_firmeza, contagens por painel e geral; compare tambem com a saida da previa (rode ${PREVIA}/montar_previa.py numa COPIA em ${W}/previa_copia apontando a saida para la) — tem de bater linha a linha, e cada diferenca precisa de motivo. O exemplo. A declaracao existe antes do calculo e diz o que o codigo faz. Determinismo. Diff contra o dados/prototipo.json gravado: ${PERMITIDO} O resto g1 da etapa 6.` },
  { k: 'tela', t: `A TELA no navegador headless, espelho com static atual + prototipo.js de ${W}/prototipo_e5.json (porta 5205; derrube ao fim; SC_CENARIOS/SC_PREMISSAS em ${W}), 1.785 e 400 px, tema claro e escuro: (1) etapa 5: nos 11 paineis a tabela nova vem ANTES da matriz; em 4 paineis sorteados, TODAS as linhas batem com o JSON (valor tipico com unidade, diferencas com "pts" ou "%", melhor/pior so onde ha lado, selos, ordem pelas duas opcoes, marca de ordem diferente); busca e "esconder" funcionam; faixas finas desenhadas na escala da linha (confira 3 linhas medindo as posicoes); o exemplo bate; (2) a matriz por time embaixo continua com as mesmas celulas, cabecalhos, linhas de faixa e marcas que no app real de hoje (compare as duas versoes); (3) etapa 6: pares de mesmo posto marcados, contagem de distintos, nada de "repete"; (4) contraste >= 4,5:1 medido em 10 textos pequenos, inclusive o tecnico, nos dois temas; (5) regressao: 16/16, zero erro, zero undefined/NaN, zero rolagem lateral da pagina a 1.785, nada cortado a 400; (6) app real com o dado gravado de hoje e a etapa 5 desenhada com PONTOS num alvo temporario: ausencia escrita, matriz intacta, sem erro; (7) abas fora do Prototipo sem mudanca visual pelo style.css.` },
  { k: 'linguagem', t: `A LINGUAGEM e a LEITURA, no navegador (espelho como acima, porta 5207, derrube ao fim), com os olhos do dono: a etapa 5 agora se le de relance como na previa aprovada (${PREVIA}/previa_etapa5.html)? Compare as duas lado a lado e aponte onde a tela do site ficou mais confusa que a previa. Portugues de reuniao de clube; jargao so no numero pequeno; nenhum numero digitado; nada que afirme mais que o dado ("firme" nao e causa; diferenca de grupo nao e receita; 16 temporadas por ponta dito); vocabulario unico de proto.js; a matriz embaixo claramente anunciada como detalhe e como posicao, nao valor.` },
]
const confs = (await parallel(LENTES.map(L => () => agent(`${CASA}\n\n${FEITO}\n\nVOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. SUA LENTE: ${L.t}`,
  { label: 'confere:' + L.k, phase: 'Conferir', schema: CONF, effort: 'high' })))).filter(Boolean)
log(`conferencias: ${confs.map(c => c.veredito).join(' · ')}`)

/* ---------------- 4. consertar ---------------- */
const DON = [
  { k: 'gerador', arq: 'gerar_prototipo.py', porta: null },
  { k: 'proto_b', arq: 'proto_b.js', porta: 5208 },
  { k: 'css', arq: 'style.css', porta: 5209 },
]
const donoDe = p => DON.find(x => (p.arquivo || '').includes(x.arq)) ||
  ((p.arquivo || '').match(/prototipo\.json|declara/) ? DON[0] : DON[1])
async function consertar(problemas, fase, rotulo, depoisDeGravado) {
  const por = {}
  for (const p of problemas) { const d = donoDe(p); (por[d.k] = por[d.k] || []).push(p) }
  return (await parallel(Object.entries(por).map(([k, ps]) => () => {
    const d = DON.find(x => x.k === k)
    const arqs = k === 'gerador' ? 'gerar_prototipo.py' : 'static/' + d.arq
    const extra = k === 'gerador'
      ? (depoisDeGravado
          ? `O dado ja esta GRAVADO: copie dados/prototipo.json para ${W}/prototipo_antes_conserto.json, conserte, rode python3 -B gerar_prototipo.py e python3 gerar_prototipo_js.py e mostre o diff (so o que o conserto explica).`
          : `Rode de novo no rascunho (G.SAIDA = ${W}/prototipo_e5.json), determinismo 1x2 e diff contra o gravado: ${PERMITIDO}`)
      : `Porta ${d.porta}. ${depoisDeGravado ? 'Teste no app real com o dado gravado.' : ESPELHO(d.porta)}`
    return agent(`${CASA}\n\nRODADA DE CONSERTO (${rotulo}). Voce e dono de ${arqs}; nenhum outro arquivo. ${extra}\nProblemas (confirme cada um; recuse com prova o que estiver errado):\n${J(ps, 20000)}\nDepois rode o teste de novo (16/16, zero erro, zero rolagem lateral a 1.785, nada cortado a 400).`,
      { label: 'conserta:' + k + (depoisDeGravado ? ':final' : ''), phase: fase, schema: ESC, effort: 'high' }).then(r => r ? { ...r, k } : null)
  }))).filter(Boolean)
}
const todos = confs.flatMap(c => c.problemas)
let consertos = []
if (todos.length) {
  phase('Consertar')
  consertos = await consertar(todos, 'Consertar', 'a unica antes de gravar', false)
}
const geradorMudou = consertos.some(c => c.k === 'gerador')

/* ---------------- 5. gravar ---------------- */
phase('Gravar')
const grav = await agent(`${CASA}\n\nSUA TAREFA: gravar o dado novo. Voce so RODA o gerador; nao edite codigo.
1. Copie dados/prototipo.json para ${W}/prototipo_antes.json e static/prototipo.js para ${W}/prototipo_js_antes.js.
2. Rode \`python3 -B gerar_prototipo.py\` e \`python3 gerar_prototipo_js.py\` na raiz do projeto.
3. Diff caminho a caminho contra a copia: ${PERMITIDO} Compare tambem com ${W}/prototipo_e5.json (rascunho${geradorMudou ? ', refeito no conserto' : ''}): so gerado_em pode diferir.
4. Regressao headless no app real (porta 5210; SC_CENARIOS/SC_PREMISSAS em ${W}), 1.785 e 400 px, claro e escuro: 16/16, zero erro, zero undefined/NaN, zero rolagem lateral da pagina a 1.785, nada cortado a 400; etapa 5 com a tabela nova antes da matriz nos 11 paineis; etapa 6 com os pares de mesmo posto marcados.
Se o diff trouxer qualquer mudanca fora das permitidas: RESTAURE as duas copias e diga o que apareceu.
Relatos: ${J({ gerador: ger, css, tela, consertos }, 30000)}`,
  { label: 'grava', phase: 'Gravar', schema: ESC, effort: 'high' })

/* ---------------- 6. conferir final ---------------- */
phase('Conferir final')
const fin = await agent(`${CASA}\n\nO que foi feito: ${J({ gerador: ger, css, tela, conferencias: confs, consertos, gravacao: grav }, 60000)}\n\nVOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. App REAL com o dado GRAVADO (porta 5211; derrube ao fim; SC_CENARIOS/SC_PREMISSAS em ${W}), 1.785 e 400 px, tema claro e escuro: (1) dados/prototipo.json e static/prototipo.js sincronizados e com as chaves novas; (2) etapa 5: 3 paineis sorteados com semente 5, todas as linhas batem com o JSON, tabela antes da matriz, matriz intacta, exemplo certo; (3) etapa 6: restos t1 e g1 resolvidos; (4) contraste >= 4,5:1 em 10 textos pequenos, nos dois temas; (5) cada problema das conferencias anteriores resolvido ou recusado com prova; (6) regressao: 16/16, zero erro, zero undefined, zero rolagem lateral da pagina a 1.785, nada cortado a 400; a etapa 5 com PONTOS num alvo temporario sem erro; (7) git status: nenhum arquivo da outra sessao nem arquivo proibido mexido por esta rodada (compare com o HEAD e com o que ja estava modificado antes: gerar_prototipo.py, proto*.js, contrato, glossario, prototipo.json/js e CONTINUAR.md vinham da rodada da etapa 6).`,
  { label: 'confere:final', phase: 'Conferir final', schema: CONF, effort: 'high' })

let consertosFinais = []
const gravesFinais = fin ? fin.problemas.filter(p => ['quebra', 'mente'].includes(p.gravidade)) : []
if (gravesFinais.length) consertosFinais = await consertar(gravesFinais, 'Conferir final', 'final, so o que quebra ou mente', true)

return { gerador: ger, css, tela, conferencias: confs, consertos, gravacao: grav, conferencia_final: fin, consertos_finais: consertosFinais }
