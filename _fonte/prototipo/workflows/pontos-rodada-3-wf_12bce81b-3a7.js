export const meta = {
  name: 'pontos-rodada-3',
  description: 'Terceira rodada da base por pontos: fecha as guardas de circularidade, o resumo sem consequencia e a etapa 0 por universo, e prepara ranking_gaps.py para o gerador do Prototipo',
  phases: [
    { title: 'Consertar', detail: 'um dono: gerar_pontos.py e ranking_gaps.py' },
    { title: 'Conferir', detail: 'tres lentes reconferem' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'
const SCRIPT_ANTERIOR = '/Users/henriquesimoessilva/.claude/projects/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/workflows/scripts/fechar-base-pontos-wf_84378016-ca0.js'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Base da aba por faixa de aproveitamento de pontos: \`gerar_pontos.py\`, \`ranking_gaps.py\`, \`gerar_pontos_js.py\` -> \`dados/pontos.json\`, \`static/pontos.js\`.
CONTEXTO COMPLETO DA OBRA: leia a constante CASA no topo de \`${SCRIPT_ANTERIOR}\` (faixas, universos, fontes, regras da casa) e \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\`.
HISTORIA: a base foi construida e passou por DUAS rodadas de conserto nesta sessao. O relato de tudo (construtor, 4 lentes, 2 consertos, 3 reconferencias) esta em \`${S}/pontos_journal.json\` (lista [rotulo, retorno]). Os numeros foram APROVADOS pela lente de numeros; nenhum achado circular no JSON real. Ficaram abertos os problemas das tres ultimas reconferencias ('confere:faixas-e-circularidade', 'confere:modulo-de-gaps', 'confere:espelho-completo', as ULTIMAS ocorrencias de cada uma no arquivo).
REGRAS: semente fixa; nenhum numero digitado; ausencia com motivo; comentario em prosa explicando o por que; qualquer set iterado vira sorted/dict.fromkeys.
PROIBIDO: qualquer git que escreva (commit, push, add, reset, checkout, stash, revert, tag).
NAO EDITE: \`gerar_prototipo.py\`, \`gerar_prototipo_js.py\`, \`dados/prototipo.json\`, \`dados/prototipo_indicadores.json\`, \`static/*.js\` exceto \`static/pontos.js\` (gerado), \`static/style.css\`, \`templates/\`, \`_fonte/prototipo/CONCLUSOES.md\`, \`_fonte/prototipo/conclusoes_spec.json\` (outras rodadas estao escrevendo neles AGORA). NAO use nem derrube as portas 5090/5091. Rascunhos so em ${S}.
Arquivos desta obra: \`gerar_pontos.py\`, \`ranking_gaps.py\`, \`gerar_pontos_js.py\`, \`dados/pontos.json\`, \`static/pontos.js\`.`

const FIX = { type: 'object', properties: {
  consertados: { type: 'array', items: { type: 'object', properties: {
    problema: { type: 'string' }, o_que_fiz: { type: 'string' }, arquivo_linha: { type: 'string' }, numero_antes_e_depois: { type: 'string' },
  }, required: ['problema', 'o_que_fiz', 'arquivo_linha', 'numero_antes_e_depois'] } },
  nao_consertados: { type: 'array', items: { type: 'object', properties: { problema: { type: 'string' }, motivo: { type: 'string' } }, required: ['problema', 'motivo'] } },
  api_para_o_gerador_do_prototipo: { type: 'string' },
  rodou: { type: 'boolean' }, saida_do_terminal: { type: 'string' }, deterministico: { type: 'string' },
}, required: ['consertados', 'nao_consertados', 'api_para_o_gerador_do_prototipo', 'rodou', 'saida_do_terminal', 'deterministico'] }

const CONF = { type: 'object', properties: {
  lente: { type: 'string' }, conferidos: { type: 'integer' },
  problemas: { type: 'array', items: { type: 'object', properties: {
    onde: { type: 'string' }, no_json: { type: 'string' }, eu_medi: { type: 'string' }, por_que_importa: { type: 'string' }, conserto: { type: 'string' },
    gravidade: { type: 'string', enum: ['mente', 'quebra', 'falta', 'detalhe'] },
  }, required: ['onde', 'no_json', 'eu_medi', 'por_que_importa', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'conferidos', 'problemas', 'veredito'] }

const LENTES = [
  { k: 'faixas-e-circularidade', p: 'A GUARDA DE CIRCULARIDADE E DE CONSEQUENCIA. Monte casos adversariais NOVOS (nao reuse os do autoteste nem os das rodadas anteriores): chaves compostas por token (SG_gap, delta_SG, diff_GP_alta_baixa, rho_SG_faixa), referencia declarada usada como salvo-conduto (resultado contra a regua), texto livre, PLACAR_JOGO (golos_pro, resultado), consequencia em chave composta. Algum vazamento passa? E a guarda ficou tao larga que acusa falso positivo no JSON real (ids legitimos com tokens como "sg" dentro de outra palavra)?' },
  { k: 'modulo-de-gaps', p: 'O MODULO ranking_gaps.py COMO API. (1) resumo com e sem as linhas de consequencia, contagens pelos valores crus; (2) mediana crua por algarismos significativos; (3) r_val e controles aceitos como Series e reindexados pela chave (ano, clube) do postos — teste com os dados reais do G (G.posto_ano devolve RangeIndex) e com ordem embaralhada: o p descontado nao pode mudar; (4) a assinatura publica e a doc bastam para o gerador do Prototipo chamar com rotulos sobe/meio/cai, ano_maximo=2025 e o outro periodo 2018-2021? Escreva a chamada e rode no scratch, sem gravar no repo (troque G.SAIDA se chamar o main, e use python3 -B).' },
  { k: 'espelho-completo', p: 'O ESPELHO E A ETAPA 0. Topo da etapa 0 separado por universo (80 de 2022-2025 com alta/media/baixa; 80 de 2018-2021 com as dele) e a conta fechando; os impedimentos do renderer listados com arquivo:linha completos (etapa 0: proto_a.js 253, 268, 283, 291; tipologia: proto_b.js 1291, 1463, 1520, 1541); aviso_de_amostra no mapa de caminhos; nada novo sem par. Confira tambem que nenhum numero APROVADO pela lente de numeros mudou (diff do pontos.json contra a versao anterior, salva pelo consertador em ' + S + '/pontos_antes_r3.json).' },
]

phase('Consertar')
let fix = await agent(`${CASA}

TAREFA: RODADA DE CONSERTO 3.
0. ANTES DE MEXER, copie \`dados/pontos.json\` para \`${S}/pontos_antes_r3.json\`.
1. Leia em \`${S}/pontos_journal.json\` as ULTIMAS reconferencias das tres lentes e conserte TODO problema de gravidade mente/quebra/falta, e os detalhes baratos. Em especial: (a) guarda de circularidade por TOKENIZACAO da chave (partir em '_' e juntar vizinhos), sem lista fixa de afixos, e sem falso positivo em ids legitimos; (b) _referencia_declarada recusa par com coluna da REGUA; registro com marca de retirada nao pode ter descendente com campo de teste; (c) motivo_resultado consulta PLACAR_JOGO; (d) resumo com sobrevivem_q_5pct_sem_consequencia e sobrevivem_q_e_dinheiro_sem_consequencia, contados pelos valores crus; (e) mediana crua por algarismos significativos; (f) r_val e controles como Series reindexados pela chave (ano, clube) do postos, com assert de indice; (g) guarda de consequencia com o mesmo reconhecimento por token; (h) etapa_0 com topo separado por universo; (i) impedimentos do renderer completos (linhas citadas nas lentes).
2. Confirme cada problema medindo antes; se a lente errou, diga por que com a medida.
3. Deixe na docstring de \`ranking_gaps.tabela_de_gaps\` a CHAMADA que o gerador do Prototipo deve fazer (rotulos sobe/meio/cai, ano_maximo=2025, outro periodo 2018-2021, controles fisicos por \`controles_de_atletas_rastreados\`) e devolva-a em api_para_o_gerador_do_prototipo.
4. Rode \`python3 gerar_pontos.py\` COMPLETO e \`python3 gerar_pontos_js.py\`; prove determinismo (PYTHONHASHSEED 1 x 2, saida em ${S}); faca o diff contra \`${S}/pontos_antes_r3.json\` e diga o que mudou de numero (so pode mudar o que o conserto pediu).`,
  { label: 'conserta-3', phase: 'Consertar', schema: FIX, effort: 'high' })

const rodadas = []
for (let n = 0; n < 2; n++) {
  phase('Conferir')
  const confs = (await parallel(LENTES.map(l => () => agent(`${CASA}

RECONFERENCIA depois da rodada de conserto. Relato do conserto:
${JSON.stringify(fix, null, 1).slice(0, 40000)}

VOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. SUA LENTE: ${l.p}`,
    { label: `confere-r${3 + n}:` + l.k, phase: 'Conferir', schema: CONF, effort: 'high' }).then(r => r ? { ...r, k: l.k } : null)))).filter(Boolean)
  const graves = confs.flatMap(c => c.problemas.filter(p => ['mente', 'quebra', 'falta'].includes(p.gravidade)).map(p => ({ ...p, lente: c.k })))
  rodadas.push({ conserto: fix, conferencias: confs })
  log(`reconferencia ${n + 1}: ` + confs.map(c => `${c.k} ${c.veredito}`).join(' · ') + ` · graves ${graves.length}`)
  if (!graves.length || n === 1) break
  phase('Consertar')
  fix = await agent(`${CASA}

RODADA DE CONSERTO ${4 + n}. Problemas graves que ainda restam:
${JSON.stringify(graves, null, 1).slice(0, 40000)}
Detalhes: ${JSON.stringify(confs.flatMap(c => c.problemas.filter(p => p.gravidade === 'detalhe')), null, 1).slice(0, 15000)}
Mesmo protocolo: confirme medindo, conserte, rode completo + js, determinismo, diff contra ${S}/pontos_antes_r3.json.`,
    { label: `conserta-${4 + n}`, phase: 'Consertar', schema: FIX, effort: 'high' })
}
return { rodadas }
