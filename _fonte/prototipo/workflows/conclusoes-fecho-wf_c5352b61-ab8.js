export const meta = {
  name: 'conclusoes-fecho',
  description: 'Edicao final das conclusoes: aplica a reconferencia e as decisoes do dono (J5, as cinco mais firmes, FIS-07), grava a ordem de servico do segundo bloco do gerador, e confere uma vez',
  phases: [
    { title: 'Editar', detail: 'um dono: CONCLUSOES.md e conclusoes_spec.json' },
    { title: 'Conferir', detail: 'duas lentes' },
    { title: 'Consertar', detail: 'uma rodada, se houver grave' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'
const RECONF = '/Users/henriquesimoessilva/.claude/projects/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/subagents/workflows/wf_b3ce3ecf-009/journal.jsonl'
const ORDEM = S + '/ordem_gerador_bloco2.json'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B.
LEIA ANTES, INTEIROS: \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\` (secao "Decisoes do dono em 14/09", que agora tem TAMBEM: a regra da comparacao escolhida depois de ver os numeros; as cinco mais firmes; a FIS-07), \`${RAIZ}/_fonte/prototipo/CONCLUSOES.md\`, \`${RAIZ}/_fonte/prototipo/conclusoes_spec.json\`, \`${S}/declaracoes_novas.json\`. O historico da rodada anterior esta em \`${S}/conclusoes_journal.json\`.
A RECONFERENCIA que acabou de rodar (tres lentes, somente leitura) esta em \`${RECONF}\`: cada linha com type "result" traz {lente, conferidos, problemas[], aprovadas[], veredito}. Leia as tres inteiras.
DECISOES DO DONO QUE ESTA EDICAO APLICA (nao reabrir):
1. Comparacao escolhida DEPOIS de ver os numeros pode ser MODERADA so se a lista dela tiver mais achados que a sorte (p do excesso < 0,05) E se ela sobreviver ao desconto do dinheiro; senao, teto FRACO. Efeito ja medido: J5 (duelo aereo de quem cai) fica MODERADO NOS ULTIMOS QUATRO ANOS, com "nao se repetiu em 2018-2021" escrito com todas as letras; A4 e os zagueiros seguem FRACOS. Reaplique a regra a TODAS as conclusoes que usam comparacao escolhida depois e diga o efeito de cada uma.
2. "As cinco que voce precisa ler" = as cinco MAIS FIRMES, de qualquer tema (selo mais forte; desempate pelo numero mais firme, com a regra de desempate escrita). Fracas e sem sinal continuam no documento e na aba, por tema.
3. FIS-07 continua FORTE, apoiada no teste declarado de cada par de anos; o corte de 0,5 vira so descricao do tamanho.
REGUA (escrita): cinco selos; desempate MODERADO x FRACO pela lista inteira; "sem sinal" escreve "nao se viu"; associacao nunca vira receita; "nunca" so com zero excecao; 2026 fora de media; universo em todo numero; frase de reuniao no molde do dono; conta principal declarada antes decide quando duas contas da mesma pergunta discordam.
PROIBIDO: qualquer git que escreva. NAO EDITE: \`gerar_*.py\`, \`ranking_gaps.py\`, \`dados/*\` (inclusive dados/prototipo_indicadores.json: declaracoes vao para ${S}/declaracoes_novas.json), \`static/*\`, \`templates/*\` (o gerador e a tela estao sendo escritos AGORA). Nao chame o main do gerador. NAO use as portas 5090/5091. Scripts em ${S}.`

const EDIT = { type: 'object', properties: {
  arquivos_escritos: { type: 'array', items: { type: 'string' } },
  aplicados: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, problema: { type: 'string' }, o_que_mudou: { type: 'string' } }, required: ['id', 'problema', 'o_que_mudou'] } },
  recusados_com_motivo: { type: 'array', items: { type: 'string' } },
  efeito_da_regra_depois_de_ver: { type: 'array', items: { type: 'string' } },
  contagem_de_selos: { type: 'string' },
  as_cinco: { type: 'array', items: { type: 'string' } },
  ordem_de_servico_gerador: { type: 'string' },
}, required: ['arquivos_escritos', 'aplicados', 'recusados_com_motivo', 'efeito_da_regra_depois_de_ver', 'contagem_de_selos', 'as_cinco', 'ordem_de_servico_gerador'] }

const CONF = { type: 'object', properties: {
  lente: { type: 'string' }, conferidos: { type: 'integer' },
  problemas: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, o_que_esta_escrito: { type: 'string' }, eu_medi: { type: 'string' }, conserto: { type: 'string' }, gravidade: { type: 'string', enum: ['muda_selo', 'muda_numero', 'mente', 'receita', 'falta', 'detalhe'] } }, required: ['id', 'o_que_esta_escrito', 'eu_medi', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'conferidos', 'problemas', 'veredito'] }

phase('Editar')
const edit = await agent(`${CASA}

TAREFA: voce e o UNICO dono de \`_fonte/prototipo/CONCLUSOES.md\`, \`_fonte/prototipo/conclusoes_spec.json\` e \`${S}/declaracoes_novas.json\` (e de \`dados/serieb_origem_2018_2026.csv\` so se um problema for nela — confirme antes).
1. Aplique TODOS os problemas das tres lentes da reconferencia (confirme cada um medindo; se a lente errou, diga por que em recusados_com_motivo).
2. Aplique as tres decisoes do dono, reaplicando a regra 1 a todas as conclusoes e recalculando a contagem de selos e as cinco.
3. Documento e spec batem id a id (selo, titulo, frase, numero, o que nao quer dizer, universo, criterios do selo) — prove por script.
4. ORDEM DE SERVICO DO SEGUNDO BLOCO DO GERADOR: a lente "campos-para-o-gerador" devolveu a lista do que o gerador tem de gravar. Corrija com o que voce mudou e grave em \`${ORDEM}\` um JSON {campos: [{caminho, formato, de_onde_sai, conclusoes_que_usam, analise_nova_declarada: bool, declaracao}], declaracoes_para_prototipo_indicadores: {...}, bloco_conclusoes: {formato, regra_do_selo_calculado, regra_das_cinco, regua_selos_simples}, bugs_do_gerador_relatados: [...] }, completo e sem ambiguidade (e o que o gerador vai implementar sem reler o documento). Inclua o bug de etapa_11 (fisico ligado so pelo nome: 20 pares de homonimos) e o que mais as rodadas acharam.`,
  { label: 'editor', phase: 'Editar', schema: EDIT, effort: 'xhigh' })

phase('Conferir')
const LENTES = [
  { k: 'regua-decisoes-coerencia', p: 'A REGUA, AS DECISOES E A COERENCIA. As tres decisoes do dono foram aplicadas ao pe da letra (J5 moderado nos 4 anos com "nao se repetiu em 2018-2021"; a regra da comparacao depois de ver reaplicada a todas; as cinco mais firmes com o desempate escrito; FIS-07 pelo teste de cada par)? Cada problema da reconferencia foi resolvido ou recusado com prova? Documento e spec batem (refaca o script)? Algum selo nao sai da regua pelos numeros escritos? Receita, "nao separa", "nunca" com excecao, jargao na frase?' },
  { k: 'ordem-do-gerador', p: 'A ORDEM DE SERVICO DO GERADOR em ' + ORDEM + '. Para cada conclusao do spec, todo numero e todo criterio do selo tem caminho nessa ordem ou ja gravado no dados/prototipo.json? Os formatos sao inequivocos? Toda analise nova tem declaracao (colunas, parametros, semente) antes de medir? Algum caminho contradiz o que o gerador ja grava (leia dados/prototipo.json e, SO LEITURA, o gerar_prototipo.py)? O bloco conclusoes tem a regra do selo calculado e a das cinco escritas como algoritmo?' },
]
let confs = (await parallel(LENTES.map(l => () => agent(`${CASA}

O editor relatou:
${JSON.stringify(edit, null, 1).slice(0, 50000)}

VOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. SUA LENTE: ${l.p}`,
  { label: 'confere:' + l.k, phase: 'Conferir', schema: CONF, effort: 'high' }).then(r => r ? { ...r, k: l.k } : null)))).filter(Boolean)

const graves = confs.flatMap(c => c.problemas.filter(p => p.gravidade !== 'detalhe').map(p => ({ ...p, lente: c.k })))
let fix = null
if (graves.length) {
  phase('Consertar')
  fix = await agent(`${CASA}

Voce e o UNICO dono de \`_fonte/prototipo/CONCLUSOES.md\`, \`_fonte/prototipo/conclusoes_spec.json\`, \`${S}/declaracoes_novas.json\` e \`${ORDEM}\`. RODADA DE CONSERTO (a ultima). Problemas:
${JSON.stringify(graves, null, 1).slice(0, 40000)}
Detalhes: ${JSON.stringify(confs.flatMap(c => c.problemas.filter(p => p.gravidade === 'detalhe')), null, 1).slice(0, 12000)}
Confirme cada um medindo (se o cetico errou, diga por que), conserte, refaca a prova documento x spec e a contagem de selos.`,
    { label: 'conserta', phase: 'Consertar', schema: EDIT, effort: 'high' })
}
return { edicao: edit, conferencias: confs, conserto: fix }
