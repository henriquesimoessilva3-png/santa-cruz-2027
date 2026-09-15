export const meta = {
  name: 'gerador-bloco2',
  description: 'Bloco 2 do gerador: os 85 campos da ordem de servico em 5 modulos paralelos (um dono por arquivo), integracao no gerar_prototipo.py com o bloco conclusoes por ultimo, conferencia, conserto, gravacao e checagem da aba',
  phases: [
    { title: 'Modulos', detail: '5 arquivos novos em paralelo: bases e etapas avulsas, etapa 1, etapa 2, etapa 11, conclusoes' },
    { title: 'Integrar', detail: 'gerar_prototipo.py chama os modulos; rascunho, determinismo, diff, selos contra o spec' },
    { title: 'Conferir', detail: 'numeros por fora; aba com as conclusoes e regressao' },
    { title: 'Consertar', detail: 'uma rodada, por dono de arquivo' },
    { title: 'Gravar', detail: 'dado igual ao rascunho conferido + checagem da aba' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Ranking/1abbf5c7-a19a-4f3a-89c2-26d0445cdbba/scratchpad'
const W = S + '/bloco2'
const F = RAIZ + '/_fonte/prototipo'
const ORDEM = F + '/sessao_14_09/ordem_gerador_bloco2.json'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B, aba Prototipo: gerador \`gerar_prototipo.py\` -> \`dados/prototipo.json\` (copia em \`static/prototipo.js\` por \`gerar_prototipo_js.py\`); \`ranking_gaps.py\` importado pelo gerador; conclusoes em \`${F}/CONCLUSOES.md\` e \`${F}/conclusoes_spec.json\` (57 conclusoes, regua de 15/09 sem dinheiro e sem ano seguinte); declaracoes em \`${F}/sessao_14_09/declaracoes_novas.json\`; ORDEM DE SERVICO: \`${ORDEM}\` (104 campos; os 85 com rodada "bloco_2" sao desta rodada; os 19 "dinheiro_2A" ja estao gravados). A prova que confere os selos contra o dado: \`${F}/sessao_14_09/conclusoes_src_15_09/\` (sp6_*.py, sp6_maquina.py, sp7_prova.py — podem apontar para caminhos do rascunho antigo: ajuste numa COPIA em ${W}, nunca no original).
LEIA ANTES: \`${F}/CONTINUAR.md\` (secao 3 itens 3 e 4, e a secao 5), o \`_doc\` da ordem (convencoes de formato, arredondamento, universo/anos em todo bloco novo), os campos do seu grupo (caminho, formato, de_onde_sai, analise_nova_declarada, declaracao, conclusoes_que_usam, valores_permitidos, obs, revisao_14_09_noite), e as chaves bugs_do_gerador_relatados, sem_cobertura e cobertura_a_reconferir da ordem.
REGRAS DA CASA: nenhum numero digitado; ausencia com motivo; analise nova DECLARADA antes de medir (a declaracao do campo esta em declaracoes_novas.json — o texto vai junto no JSON); um dono por arquivo; set iterado vira sorted; sorteio SEMPRE com gerador proprio e a semente declarada (nunca o sorteio global: etapa nova que sorteia antes desloca as seguintes); fora do main carregue G.DECL = G.carregar_declaracao() antes de montar_matriz; sem dinheiro e sem ano seguinte como criterio (decisoes do dono, 14/09); chave de sorte (firme | pode_ser_sorte | sem_diferenca) onde a ordem pedir; comentario em prosa do por que.
CONTRATO DOS MODULOS (para rodar 5 donos em paralelo sem dois no mesmo arquivo): cada modulo e um arquivo NOVO na raiz do projeto, \`gerar_prototipo_b2_<nome>.py\`, que importa gerar_prototipo como biblioteca (import gerar_prototipo as G; NUNCA edita o gerador) e expoe:
  CAMPOS = [lista exata dos caminhos da ordem que ele grava]
  def aplicar(saida, ctx): acrescenta em \`saida\` (o dict que o main ja montou, antes do json.dump) SO os caminhos de CAMPOS, sem mudar nenhuma chave existente, e devolve a lista de caminhos gravados. ctx = dict(G=G, d100, d80, jog, tec, bruto, postos, meta, pares, linhas_cat, e o que mais o main ja tiver em variavel local — liste no relato o que voce usa, com o nome da variavel do main).
  def ctx_de_teste(): monta o ctx sem rodar o main inteiro (carregar_painel, montar_matriz etc.) e le a saida do dados/prototipo.json gravado, para o teste do proprio modulo.
  Teste de cada modulo: aplicar(saida_gravada, ctx_de_teste()) em ${W}/<nome>/; diff contra o gravado = SO os caminhos de CAMPOS; rodar duas vezes com PYTHONHASHSEED 1 e 2 = identico; numeros conferidos contra o de_onde_sai e contra as conclusoes_que_usam (o valor que o CONCLUSOES.md cita).
PROIBIDO: editar gerar_prototipo.py fora da fase Integrar; gravar dados/prototipo.json ou static/prototipo.js antes da fase Gravar; tocar em gerar_pontos.py, dados/pontos.json, static/pontos.js, CONCLUSOES.md, conclusoes_spec.json, declaracoes; qualquer git; publicar. OUTRA SESSAO DO CLAUDE trabalha no mesmo repositorio (app.js, app.py, templates, bola_parada*, premissas, cenarios, docs, "Scout jogos/"): nao toque; SC_CENARIOS/SC_PREMISSAS sempre em copias em ${W}. Nao use as portas 5090/5091. Rascunhos em ${W}.`

const ESC = { type: 'object', properties: {
  arquivos_escritos: { type: 'array', items: { type: 'string' } },
  campos_gravados: { type: 'array', items: { type: 'string' } },
  campos_nao_gravados: { type: 'array', items: { type: 'object', properties: { caminho: { type: 'string' }, motivo: { type: 'string' } }, required: ['caminho', 'motivo'] } },
  o_que_fiz: { type: 'string' }, ctx_usado: { type: 'string' }, numeros_principais: { type: 'string' }, como_testei: { type: 'string' },
  riscos: { type: 'array', items: { type: 'string' } },
}, required: ['arquivos_escritos', 'campos_gravados', 'campos_nao_gravados', 'o_que_fiz', 'ctx_usado', 'numeros_principais', 'como_testei', 'riscos'] }
const CONF = { type: 'object', properties: {
  lente: { type: 'string' }, conferidos: { type: 'integer' }, medidas: { type: 'string' },
  problemas: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, onde: { type: 'string' }, o_que_vi: { type: 'string' }, por_que_importa: { type: 'string' }, conserto: { type: 'string' },
    gravidade: { type: 'string', enum: ['quebra', 'mente', 'falta', 'detalhe'] },
  }, required: ['arquivo', 'onde', 'o_que_vi', 'por_que_importa', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'conferidos', 'medidas', 'problemas', 'veredito'] }
const J = (x, n) => JSON.stringify(x, null, 1).slice(0, n)

/* ---------------- 1. modulos em paralelo ---------------- */
phase('Modulos')
const GRUPOS = [
  { k: 'bases', t: `os campos da ordem com rodada bloco_2 cujo caminho comeca por bases., etapa_0., etapa_6., etapa_7., etapa_8., etapa_13. ou etapa_15. (cerca de 16).` },
  { k: 'etapa1', t: `os campos da ordem com rodada bloco_2 cujo caminho comeca por etapa_1. (cerca de 17).` },
  { k: 'etapa2', t: `os campos da ordem com rodada bloco_2 cujo caminho comeca por etapa_2. (cerca de 26).` },
  { k: 'etapa11', t: `os campos da ordem com rodada bloco_2 cujo caminho comeca por etapa_11. (cerca de 17).` },
  { k: 'conclusoes', t: `os campos da ordem com rodada bloco_2 cujo caminho comeca por conclusoes_base. (cerca de 8) E o BLOCO \`conclusoes\` inteiro (chave bloco_conclusoes da ordem: formato, itens com criterios_do_selo lidos por caminho, regra_maquina, campos_ausentes, lacunas, textos com a ressalva do elenco valioso, divergencia_com_o_documento, p_principal e p_principal_cru, e o desempate das cinco pelo p cru). O bloco conclusoes le o spec (conclusoes_spec.json) e o PROPRIO dado e roda POR ULTIMO: seu aplicar(saida, ctx) tem de funcionar sobre a saida ja com os campos dos outros 4 modulos. No seu teste, os campos dos outros ainda nao existem: confira que as conclusoes que dependem deles saem com campos_ausentes e motivo (sem erro), e que as que so dependem do que ja esta gravado saem com o selo igual ao do spec/CONCLUSOES.md (use a maquina do sp6_maquina.py / sp7_prova.py como referencia: o resultado tem de bater, sem copiar numero).` },
]
const mods = (await parallel(GRUPOS.map(g => () => agent(`${CASA}\n\nSUA TAREFA: dono do arquivo NOVO \`${RAIZ}/gerar_prototipo_b2_${g.k}.py\` (e so dele). Grave ${g.t} Siga o contrato dos modulos. Campo cujo de_onde_sai ja esta no codigo do bloco 1 e so falta regravar: leia do que o gerador ja calcula (via G ou do ctx), nao refaca a conta de outro jeito. Campo com analise_nova_declarada: a declaracao vai junto. Campo que nao der para gravar: campos_nao_gravados com o motivo (nunca numero inventado). Em numeros_principais: por campo, o valor (ou um resumo) e a conclusao que o usa com o numero que o CONCLUSOES.md cita, dizendo se bate.`,
  { label: 'dono:b2_' + g.k, phase: 'Modulos', schema: ESC, effort: 'high' }).then(r => r ? { ...r, k: g.k } : null)))).filter(Boolean)
log(`modulos: ${mods.map(m => m.k + '=' + m.campos_gravados.length + ' gravados/' + m.campos_nao_gravados.length + ' nao').join(' · ')}`)
if (mods.length < GRUPOS.length) log('ATENCAO: algum modulo falhou; a integracao segue com os que existem e lista o que faltou')

/* ---------------- 2. integrar ---------------- */
phase('Integrar')
const RODAR = `Rode o main NO RASCUNHO (G.SAIDA = ${W}/prototipo_b2.json; python3 -B) duas vezes com PYTHONHASHSEED 1 e 2: identico. Diff caminho a caminho contra o dados/prototipo.json gravado (md5 83e8aa2b...): SO podem aparecer gerado_em e os caminhos que os modulos declaram em CAMPOS; nenhuma chave existente muda de valor. Rode a prova das conclusoes (copia do sp7_prova.py em ${W}/prova apontando para o rascunho) e compare o bloco conclusoes.itens[].selo_calculado com o selo do spec/CONCLUSOES.md nas 57: liste toda divergencia com o motivo.`
const integ = await agent(`${CASA}\n\nOs modulos relataram: ${J(mods, 60000)}\n\nSUA TAREFA: dono de \`gerar_prototipo.py\` (e, nesta fase, so dele). (1) No main, depois de montar a saida e antes do json.dump, chame aplicar dos modulos na ordem bases, etapa1, etapa2, etapa11 e conclusoes POR ULTIMO, com o ctx montado das variaveis locais do main (o relato de cada modulo diz o que usa); import dos modulos DENTRO do main, para o gerar_pontos.py (que importa o gerador como biblioteca) nao carregar nada novo; se um modulo faltar, a chave dele sai com ausencia e motivo no JSON, sem quebrar a rodada. (2) Conserte os bugs de bugs_do_gerador_relatados da ordem que ainda valem (diga quais ja nao valem e por que). (3) ${RODAR} (4) Prove que o gerar_pontos.py ainda consegue chamar as funcoes que chama (sem rodar o pipeline dele). NAO grave dados/prototipo.json. Em numeros_principais: campos gravados por modulo, o diff resumido, as divergencias de selo e as cinco mais firmes que o bloco conclusoes calcula.`,
  { label: 'dono:gerador-integra', phase: 'Integrar', schema: ESC, effort: 'high' })
if (!integ) return { modulos: mods, integracao: null, parou: 'integracao falhou' }

/* ---------------- 3. conferir ---------------- */
phase('Conferir')
const FEITO = `O que foi feito: ${J({ modulos: mods, integracao: integ }, 60000)}`
const LENTES = [
  { k: 'numeros', t: `OS NUMEROS, refeitos por fora (sem importar os modulos novos para calcular; pode importar carregar_painel/montar_matriz para ter d80 e postos): sorteie 30 dos 85 campos (semente 85, pelo menos 4 de cada grupo) e refaca cada um pelo de_onde_sai e pela declaracao, contra ${W}/prototipo_b2.json; confira formato, arredondamento e universo/anos pelo _doc da ordem; e, no bloco conclusoes, refaca a mao o selo de 15 conclusoes sorteadas (incluindo J17, M8, DIN-01, DIN-04, FIS-07) e as cinco mais firmes pelo p cru. Diff contra o gravado: so os caminhos declarados. Determinismo.` },
  { k: 'aba', t: `A ABA com o dado novo, no espelho (copia do static atual do projeto + prototipo.js montado de ${W}/prototipo_b2.json pela logica do gerar_prototipo_js.py; app.py real ou servidor proprio; porta 5250; derrube ao fim), 1.785 e 400 px, claro e escuro: (1) regressao 16/16, zero erro de console, zero undefined/NaN/[object, zero rolagem lateral da pagina a 1.785, nada cortado a 400; (2) agora o dado tem o bloco conclusoes: onde a aba mostra as conclusoes (slots, cinco mais firmes, pontes "ver a prova"), confira que aparecem, com o selo calculado igual ao do CONCLUSOES.md, a J17 moderada, a M8, texto em portugues de reuniao, a ressalva do elenco valioso onde deve, nenhum numero digitado e nenhuma "ausencia" sobrando; (3) nada de "descontado o dinheiro"/"ano seguinte"/"dificilmente" como criterio voltou; (4) as etapas 1, 2, 8, 11 que ganharam campos continuam desenhando igual ou melhor (sem campo novo mostrado cru).` },
]
const confs = (await parallel(LENTES.map(L => () => agent(`${CASA}\n\n${FEITO}\n\nVOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. SUA LENTE: ${L.t}`,
  { label: 'confere:' + L.k, phase: 'Conferir', schema: CONF, effort: 'high' })))).filter(Boolean)
log(`conferencias: ${confs.map(c => c.veredito).join(' · ')}`)

/* ---------------- 4. consertar ---------------- */
const DON = [
  ...GRUPOS.map(g => ({ k: 'b2_' + g.k, arq: 'gerar_prototipo_b2_' + g.k, arqs: 'gerar_prototipo_b2_' + g.k + '.py' })),
  { k: 'gerador', arq: 'gerar_prototipo.py', arqs: 'gerar_prototipo.py' },
  { k: 'casca', arq: 'proto.js', arqs: 'static/proto.js' },
  { k: 'proto_a', arq: 'proto_a.js', arqs: 'static/proto_a.js' },
  { k: 'proto_b', arq: 'proto_b.js', arqs: 'static/proto_b.js' },
  { k: 'proto_c', arq: 'proto_c.js', arqs: 'static/proto_c.js' },
]
const graves = confs.flatMap(c => c.problemas).filter(p => p.gravidade !== 'detalhe')
let consertos = []
if (graves.length) {
  phase('Consertar')
  const por = {}, sem = []
  for (const p of graves) { const d = DON.find(x => (p.arquivo || '').includes(x.arq)); if (d) (por[d.k] = por[d.k] || []).push(p); else sem.push(p) }
  const dados = Object.keys(por).some(k => k.startsWith('b2_') || k === 'gerador')
  const telasK = Object.keys(por).filter(k => !k.startsWith('b2_') && k !== 'gerador')
  // modulos e telas em paralelo (arquivos distintos); o gerador depois, porque ele roda o main com os modulos consertados
  const primeiro = Object.entries(por).filter(([k]) => k !== 'gerador')
  const r1 = (await parallel(primeiro.map(([k, ps]) => () => {
    const d = DON.find(x => x.k === k)
    return agent(`${CASA}\n\nRODADA DE CONSERTO (a unica). Voce e dono de ${d.arqs}; nenhum outro arquivo. ${k.startsWith('b2_') ? 'Rode de novo o teste do seu modulo.' : 'Teste no espelho com o prototipo.js de ' + W + '/prototipo_b2.json (porta 52' + (60 + telasK.indexOf(k)) + '): 16/16, zero erro, zero rolagem lateral a 1.785, nada cortado a 400.'}\nProblemas (confirme cada um; recuse com prova o que estiver errado):\n${J(ps, 15000)}`,
      { label: 'conserta:' + k, phase: 'Consertar', schema: ESC, effort: 'high' }).then(r => r ? { ...r, k } : null)
  }))).filter(Boolean)
  consertos.push(...r1)
  if (dados) {
    const rg = await agent(`${CASA}\n\nRODADA DE CONSERTO (a unica). Voce e dono de gerar_prototipo.py. Problemas do gerador (confirme; recuse com prova): ${J(por.gerador || [], 12000)}\nModulos consertados antes de voce: ${J(r1.filter(x => x.k.startsWith('b2_')), 10000)}\n${RODAR}`,
      { label: 'conserta:gerador', phase: 'Consertar', schema: ESC, effort: 'high' })
    if (rg) consertos.push({ ...rg, k: 'gerador' })
  }
  if (sem.length) log(`problemas sem dono nesta rodada: ${sem.length}`)
}

/* ---------------- 5. gravar ---------------- */
phase('Gravar')
const grav = await agent(`${CASA}\n\nSUA TAREFA: gravar o dado novo e checar a aba. Voce so RODA; nao edite codigo.
1. Copie dados/prototipo.json para ${W}/prototipo_antes.json e static/prototipo.js para ${W}/prototipo_js_antes.js.
2. Rode \`python3 -B gerar_prototipo.py\` e \`python3 gerar_prototipo_js.py\` na raiz do projeto.
3. Compare o JSON gravado com ${W}/prototipo_b2.json (o rascunho conferido${consertos.some(c => c.k === 'gerador') ? ', refeito no conserto' : ''}): so gerado_em pode diferir. Se diferir em qualquer outra coisa, RESTAURE as duas copias e diga o que apareceu.
4. prototipo.js == prototipo.json.
5. App real do projeto (porta 5270; SC_CENARIOS/SC_PREMISSAS em ${W}), 1.785 e 400 px, claro e escuro: 16/16, zero erro, zero undefined/NaN, zero rolagem lateral da pagina a 1.785, nada cortado a 400; as conclusoes aparecendo com os selos do CONCLUSOES.md (J17 moderada, M8 presente, cinco mais firmes); e cada problema consertado sumiu.
6. git status: so os arquivos desta rodada (os 5 modulos novos, gerar_prototipo.py, telas se consertadas, dados/prototipo.json, static/prototipo.js) e nenhum da outra sessao.
Conferencias: ${J(confs, 20000)}
Consertos: ${J(consertos, 15000)}`,
  { label: 'grava-e-checa', phase: 'Gravar', schema: ESC, effort: 'high' })

return { modulos: mods, integracao: integ, conferencias: confs, consertos, gravacao: grav }
