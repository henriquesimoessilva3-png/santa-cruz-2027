export const meta = {
  name: 'fechar-base-pontos',
  description: 'Termina, roda e confere a base da aba por faixa de pontos (gerar_pontos.py, ranking_gaps.py, pontos.json), com quatro lentes ceticas e ate duas rodadas de conserto',
  phases: [
    { title: 'Construir', detail: 'le o rascunho interrompido, trata a auditoria, roda ate o JSON' },
    { title: 'Conferir', detail: 'quatro ceticos: faixas e circularidade, numeros, espelho, modulo de gaps' },
    { title: 'Consertar', detail: 'ate duas rodadas: conserta o que mente, quebra ou falta, e reconfere' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'
const AUD = S + '/auditoria_pontos.json'
const TRANSCRICAO_ANTIGA = '/Users/henriquesimoessilva/.claude/projects/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-Santa-Cruz/86429f10-6359-4758-b9ee-f9cba02f2bf9/subagents/workflows/wf_15b47fcf-686/agent-af1dd0df55b7015ae.jsonl'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B.

O QUE EXISTE: a aba "Prototipo" le \`dados/prototipo.json\`, produzido por \`gerar_prototipo.py\` (etapas 0 a
15), agrupando as 80 temporadas completas 2022-2025 pela POSICAO FINAL: sobe (1-4), meio (5-16), cai (17-20).

O QUE O DONO DECIDIU (13/09/2026): "ao inves de pensar somente nos times que subiram, ficaram no meio de
tabela ou cairam, nao seria melhor pensar em faixa de pontos? porque as vezes um time que subiu em um ano
fez menos pontos que o quinto colocado em outro ano". NAO jogar o Prototipo fora: uma ABA NOVA, que ESPELHA
AS 16 ETAPAS com faixas de APROVEITAMENTO DE PONTOS no lugar de sobe/meio/cai.

AS FAIXAS, JA DECIDIDAS E MEDIDAS:
- aproveitamento = pts / (3 * J)  (J, nao 38: Cuiaba e Figueirense 2019 e quatro de 2022-2025 tem 37 jogos por buraco da fonte).
- ALTA  = aproveitamento >= media do aproveitamento do 6o colocado em 2022-2025 = 53,509%
- BAIXA = aproveitamento <  media do aproveitamento do 15o colocado em 2022-2025 = 38,377%
- MEDIA = o resto. Os cortes sao CALCULADOS no script e gravados com a regra — nunca digitados.
- 2022-2025: alta 24 (os 16 que subiram + Novorizontino 2024, Novorizontino 2023, Mirassol 2023, Sport 2023,
  Goias 2024, Vila Nova 2023, Criciuma 2025, Goias 2025) · media 35 · baixa 21 (os 16 que cairam + Ituano 2023,
  Ponte Preta 2023, Chapecoense 2023, CRB 2024, Botafogo-SP 2025). Por ano (alta/media/baixa): 2022 4/12/4 ·
  2023 8/5/7 · 2024 6/9/5 · 2025 6/9/5.
- 2018-2021, mesma regua: alta 17 · media 45 · baixa 18. Goias 2018 subiu (4o, 60) e fica na media; CSA 2021 e
  America-MG 2019 nao subiram e ficam na alta; Figueirense e Oeste 2019 ficam na baixa sem cair.
- 2026 tem 27 de 38 rodadas: aparece so pelo RITMO de hoje, com "provisorio" escrito, e NUNCA entra em media, corte ou teste.

OS DOIS UNIVERSOS: tecnico COLETIVO existe 2018-2025 (160 temporadas); tecnico INDIVIDUAL, fisico e valor de
mercado so 2022-2025 (80). Cada numero do JSON diz de que universo veio. Ranking dentro do ano neutraliza
diferenca de nivel entre periodos (mando: 59% contra 64% dos pontos em casa), mas valor cru de indicador
sensivel a mando nao se junta entre periodos.

FONTES: \`dados/serieb_clube_temporada.csv\` (2022-2026), \`dados/serieb_clube_temporada_2018_2021.csv\`,
\`dados/serieb_jogos.csv\` e \`dados/serieb_jogos_2018_2021.csv\`, \`dados/serieb_tecnico.csv\` (individual 2022-26),
e o que o \`gerar_prototipo.py\` ja carrega. Documentos: \`_fonte/prototipo/CONTINUAR.md\`,
\`_fonte/prototipo/PENDENTE_RODADA.md\` (itens 6, 8 e 9 sao desta obra), \`_fonte/prototipo/ESPECIFICACAO.md\`,
\`_fonte/prototipo/CONFERENCIA.md\`.

HISTORIA DESTA OBRA: um construtor anterior escreveu \`gerar_pontos.py\`, \`ranking_gaps.py\` e \`gerar_pontos_js.py\`
e foi INTERROMPIDO de proposito antes de devolver relatorio; as conferencias nunca rodaram. O que ficou no
disco esta commitado como RASCUNHO NAO CONFERIDO (commit 893158c). Nas ultimas acoes ele: (a) rodou o
gerador inteiro (saida 0, 84 s) e o gerar_pontos_js.py; (b) comparou PYTHONHASHSEED=1 e =2 no modo --rapido
com zero diferenca; (c) para passar no assert "indicador circular aparece como achado", RENOMEOU a chave
\`col\` para \`coluna_retirada\` nas listas de colunas retiradas da tipologia — isso contorna o assert pelo
nome da chave, e precisa ser julgado: o assert tem de ser semantico (distinguir "listado como retirado por
ser resultado" de "apresentado como achado"), nao depender de nome de chave; (d) tirou da listagem de
"resultado redescrito" a propria regua (pts, pos, subiu, caiu, faixa, aproveitamento); (e) fez
\`sobrevivem_q_e_dinheiro\` virar None quando nao ha valor de mercado.
A AUDITORIA do gerador do Prototipo feita antes da obra (38 suposicoes, 16 grupos de indicadores circulares,
as etapas que mudam de natureza e a ordem exata do main e do sorteio global) esta em \`${AUD}\`.
A transcricao do construtor anterior, se precisar do por que de alguma decisao: \`${TRANSCRICAO_ANTIGA}\`.

REGRAS DA CASA: semente fixa; nenhum numero ou frase digitada passando por medida; ausencia com motivo, nunca
imputacao; comentario em prosa explicando o POR QUE. numpy/pandas/scipy/sklearn sim, statsmodels nao.
Qualquer \`set\` iterado que decida ordem ou sorteio vira \`sorted\` ou \`dict.fromkeys\`. Etapa que sorteia tem
gerador proprio \`np.random.default_rng([7, n])\`, gravado no JSON.

**PROIBIDO:** qualquer git que escreva (commit, push, add, reset, checkout, stash, revert, tag). Git so leitura.
**NAO EDITE** \`gerar_prototipo.py\`, \`gerar_prototipo_js.py\`, \`dados/prototipo.json\`, \`static/prototipo.js\`,
\`static/proto*.js\`, \`static/style.css\`, \`templates/index.html\`, \`static/app.js\`, \`_fonte/prototipo/CONCLUSOES.md\`,
\`_fonte/prototipo/conclusoes_spec.json\` (a proxima rodada mexe neles). Achou bug no gerador do Prototipo?
RELATE, nao conserte. NAO suba servidor e NAO use as portas 5090 e 5091.
Arquivos que ESTA obra pode escrever: \`gerar_pontos.py\`, \`ranking_gaps.py\`, \`gerar_pontos_js.py\`,
\`dados/pontos.json\`, \`static/pontos.js\`. Rascunhos e JSON de teste SO em ${S}.
Para usar o gerador do Prototipo como biblioteca: \`import gerar_prototipo as G\`; fora do main, carregue
\`G.DECL = G.carregar_declaracao()\` antes de \`montar_matriz\`.`

const BUILD = { type: 'object', properties: {
  rodou: { type: 'boolean' },
  saida_do_terminal: { type: 'string' },
  arquivos: { type: 'array', items: { type: 'string' } },
  json_kb: { type: 'integer' },
  deterministico: { type: 'string' },
  etapas: { type: 'array', items: { type: 'object', properties: {
    etapa: { type: 'string' }, universo: { type: 'string' },
    estado: { type: 'string', enum: ['completa', 'adaptada', 'ausente_com_motivo'] },
    o_que_mudou_em_relacao_ao_prototipo: { type: 'string' },
  }, required: ['etapa', 'universo', 'estado', 'o_que_mudou_em_relacao_ao_prototipo'] } },
  auditoria_item_a_item: { type: 'array', items: { type: 'object', properties: {
    suposicao: { type: 'string' }, tratada: { type: 'boolean' }, onde: { type: 'string' }, como: { type: 'string' },
  }, required: ['suposicao', 'tratada', 'onde', 'como'] } },
  tamanhos_das_faixas: { type: 'string' },
  top10_do_ranking_de_gaps: { type: 'array', items: { type: 'string' } },
  linha_da_sorte: { type: 'string' },
  o_que_mudei_no_rascunho: { type: 'array', items: { type: 'string' } },
  bugs_do_gerador_do_prototipo_achados: { type: 'array', items: { type: 'string' } },
  o_que_nao_consegui: { type: 'string' },
}, required: ['rodou', 'saida_do_terminal', 'arquivos', 'json_kb', 'deterministico', 'etapas', 'auditoria_item_a_item',
  'tamanhos_das_faixas', 'top10_do_ranking_de_gaps', 'linha_da_sorte', 'o_que_mudei_no_rascunho',
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

const FIX = { type: 'object', properties: {
  consertados: { type: 'array', items: { type: 'object', properties: {
    problema: { type: 'string' }, o_que_fiz: { type: 'string' }, arquivo_linha: { type: 'string' }, numero_antes_e_depois: { type: 'string' },
  }, required: ['problema', 'o_que_fiz', 'arquivo_linha', 'numero_antes_e_depois'] } },
  nao_consertados: { type: 'array', items: { type: 'object', properties: {
    problema: { type: 'string' }, motivo: { type: 'string' },
  }, required: ['problema', 'motivo'] } },
  rodou: { type: 'boolean' },
  saida_do_terminal: { type: 'string' },
  deterministico: { type: 'string' },
}, required: ['consertados', 'nao_consertados', 'rodou', 'saida_do_terminal', 'deterministico'] }

phase('Construir')

const build = await agent(`${CASA}

TAREFA: TERMINAR, RODAR e RELATAR a base da aba por pontos.
1. Leia INTEIROS \`${RAIZ}/gerar_pontos.py\`, \`${RAIZ}/ranking_gaps.py\` e \`${RAIZ}/gerar_pontos_js.py\`, e a auditoria em \`${AUD}\`.
2. Para CADA uma das suposicoes e CADA grupo circular da auditoria, confira no codigo se foi tratada (onde e como). O que faltar, trate — em funcao sua no gerar_pontos.py, nunca editando o G. Onde a etapa muda de natureza (tipologia congelada nos 16, alvos de perfil, taxa do contrafactual), confirme que a decisao esta ESCRITA no JSON com o motivo.
3. Julgue a renomeacao \`col\` -> \`coluna_retirada\` (item c da historia): se o assert so passou pelo nome da chave, refaca o assert para ser semantico e volte a um nome de chave coerente com o resto do JSON (a tela vai ler).
4. ranking_gaps.py e modulo COMPARTILHADO (o gerador do Prototipo vai chama-lo na proxima rodada): confira que a funcao publica recebe o que o main do Prototipo tem na mao e devolve a tabela do item 6 do PENDENTE (posicao media por faixa, gap, quem destoa e para que lado, tamanho, p do grupo que destoa contra o resto, q com desconto dos N testes, p descontado o dinheiro — e dinheiro + tamanho do elenco rastreado nas linhas fisicas —, mediana CRUA por faixa, marca "consequencia do resultado", "se repete no outro periodo", e a LINHA DA SORTE com sorteio dos rotulos DENTRO do ano mantendo os tamanhos por ano, 1.000 vezes, \`default_rng([7, 23])\`). Com as faixas POR POSICAO, a linha da sorte tem de reproduzir a previa: maior gap do sorteio mediana ~30,4 e p95 ~37,6; 18 gaps >= 30 medidos contra 1 do sorteio.
5. RODE \`python3 gerar_pontos.py\` COMPLETO (nao --rapido) e depois \`python3 gerar_pontos_js.py\`. Prove determinismo: duas execucoes com PYTHONHASHSEED=1 e =2, saida em ${S} (como GP.SAIDA), zero diferenca fora de \`gerado_em\` — pelo menos no --rapido; se couber no tempo, no completo.
6. Asserts obrigatorios que tem de estar no codigo e passar: nada de 2026 em media, corte ou teste; nenhum indicador circular apresentado como achado (em ranking de gaps, catalogo, pilares, tipologia, conclusoes gravadas, notas).
7. Abra o JSON e confira chaves, tamanho e as 16 etapas (completa, adaptada ou ausente COM motivo).
Nao entregue o que nao viu rodar.`,
  { label: 'constroi', phase: 'Construir', schema: BUILD, effort: 'high' })

log(build && build.rodou ? `pontos.json ${build.json_kb} KB · faixas ${build.tamanhos_das_faixas} · determinismo: ${build.deterministico}` : 'construtor NAO rodou')

phase('Conferir')

const LENTES = [
  { k: 'faixas-e-circularidade', p: `AS FAIXAS E A CIRCULARIDADE. Refaca as faixas do zero, com codigo seu (cortes, tamanhos por universo e por ano, a lista nominal de quem muda de grupo, 2026 por ritmo). Depois cace a CIRCULARIDADE: todo indicador que e pedaco dos pontos separa as faixas por construcao. Varra no JSON o ranking de gaps (os dois), o catalogo, os pilares, a tipologia, a porta temporal, as notas e textos gravados: algum desses aparece como ACHADO? A lista de circulares cobre os 16 grupos da auditoria em ${AUD}? O assert de circularidade e semantico ou depende de nome de chave? E os nulos: algum ainda assume 4 por ano ou 16 por faixa?` },
  { k: 'numeros', p: `OS NUMEROS. Por caminho proprio, SEM rodar nem importar gerar_pontos.py ou ranking_gaps.py: (1) a linha de base do dinheiro com as faixas de pontos (taxa da faixa alta por quartil de valor, acerto do posto de valor com k da alta por ano); (2) o TOP 10 do ranking de gaps de 2022-2025, a linha da sorte (maior gap do sorteio, contagens >= 20/25/30 medidas contra o sorteio) e o q de tres linhas; (3) tres celulas de cada pilar da etapa 5 e as faixas crua e percentil de dois indicadores; (4) o bloco tecnico 2018-2025: tamanhos por universo, uma persistencia e uma porta temporal. Compare numero a numero e diga a tolerancia que usou.` },
  { k: 'espelho-completo', p: `O ESPELHO. Abra \`dados/prototipo.json\` e \`dados/pontos.json\` lado a lado e compare CHAVE A CHAVE, etapa a etapa. Toda etapa do Prototipo tem par na aba nova (completa, adaptada ou ausente COM MOTIVO)? Onde a etapa mudou de natureza (tipologia, alvos, contrafactual, nomes da etapa 14), a decisao esta escrita e e defensavel? Algum texto gravado ainda diz "subiu"/"acesso"/"rebaixado" onde a faixa e de pontos? A tela vai conseguir reusar o renderer do Prototipo (static/proto*.js, SO LEITURA) lendo este JSON: liste cada chave que a tela le e que difere ou falta, e se isso quebra o reuso.` },
  { k: 'modulo-de-gaps', p: `O MODULO COMPARTILHADO ranking_gaps.py. Leia-o inteiro e teste-o por fora (script seu em ${S}, importando o modulo e dados sinteticos + dados reais): (1) com rotulos POR POSICAO em 2022-2025, reproduz a previa (maior gap do sorteio mediana ~30,4, p95 ~37,6; 18 gaps >= 30 contra 1)? (2) o sorteio da linha da sorte e DENTRO do ano e mantem os tamanhos por ano? (3) o q desconta o numero certo de testes, sem contar os circulares? (4) o desconto do dinheiro (e do tamanho do elenco nas fisicas) esta certo e com o universo certo? (5) mediana crua por faixa na unidade do indicador; (6) lado de "quem destoa" coerente com indicador em que menor e melhor? (7) a assinatura serve para o gerador do Prototipo chamar na proxima rodada (o que o main dele tem na mao: ver gerar_prototipo.py, SO LEITURA)? (8) deterministico com PYTHONHASHSEED diferente?` },
]

const conferir = (l, extra) => agent(`${CASA}

A obra rodou. O que o construtor relatou:
${JSON.stringify(build, null, 1).slice(0, 45000)}
${extra || ''}
VOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em nenhum arquivo do projeto. SUA LENTE: ${l.p}`,
  { label: 'confere:' + l.k, phase: 'Conferir', schema: CONF, effort: 'high' }).then(r => r ? { ...r, k: l.k } : null)

let confs = (await parallel(LENTES.map(l => () => conferir(l)))).filter(Boolean)
const graves = c => c.problemas.filter(p => ['mente', 'quebra', 'falta'].includes(p.gravidade))
log('conferencias: ' + confs.map(c => `${c.k} ${c.veredito} (${graves(c).length} graves, ${c.problemas.length} total)`).join(' · '))

const rodadas = []
let pendentes = confs.filter(c => graves(c).length > 0)
let n = 0
while (pendentes.length && n < 2) {
  n++
  phase('Consertar')
  const todos = confs.map(c => ({ lente: c.k, veredito: c.veredito, problemas: c.problemas }))
  const fix = await agent(`${CASA}

RODADA DE CONSERTO ${n}. O construtor relatou:
${JSON.stringify(build, null, 1).slice(0, 20000)}

AS CONFERENCIAS (todas as lentes, com todos os problemas):
${JSON.stringify(todos, null, 1).slice(0, 60000)}

TAREFA: conserte TODO problema de gravidade mente, quebra ou falta; os de gravidade detalhe, conserte se for barato e nao arriscar numero. Antes de consertar, CONFIRME o problema medindo (o cetico pode ter errado — se errou, diga por que em nao_consertados, com a medida). Depois rode \`python3 gerar_pontos.py\` completo e \`python3 gerar_pontos_js.py\`, e prove determinismo (PYTHONHASHSEED 1 x 2, saida em ${S}). Para cada conserto, o numero antes e depois.`,
    { label: 'conserta-' + n, phase: 'Consertar', schema: FIX, effort: 'high' })
  const lentesPend = pendentes.map(c => LENTES.find(l => l.k === c.k)).filter(Boolean)
  const extra = `
RODADA DE RECONFERENCIA ${n}. Os problemas que a SUA lente tinha apontado antes e o relatorio do conserto:
PROBLEMAS ANTERIORES: ${JSON.stringify(pendentes.map(c => ({ lente: c.k, problemas: c.problemas })), null, 1).slice(0, 25000)}
CONSERTO: ${JSON.stringify(fix, null, 1).slice(0, 25000)}
Confira cada problema anterior (resolvido de verdade? o motivo de nao consertar se sustenta?) e procure o que o conserto quebrou.`
  const reconf = (await parallel(lentesPend.map(l => () => conferir(l, extra)))).filter(Boolean)
  rodadas.push({ rodada: n, conserto: fix, reconferencia: reconf })
  confs = confs.map(c => reconf.find(r => r.k === c.k) || c)
  pendentes = reconf.filter(c => graves(c).length > 0)
  log(`rodada ${n}: ` + reconf.map(c => `${c.k} ${c.veredito} (${graves(c).length} graves)`).join(' · '))
}
if (pendentes.length) log(`ATENCAO: sobraram problemas graves em ${pendentes.map(c => c.k).join(', ')} depois de ${n} rodadas`)

return { construcao: build, conferencias_finais: confs, rodadas, pendentes_graves: pendentes.map(c => ({ lente: c.k, problemas: graves(c) })) }
