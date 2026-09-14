export const meta = {
  name: 'pontos-fecho',
  description: 'Fecho da base por pontos: os consertos estruturais que ainda importam (linha da sorte independente da ordem, guarda lendo o valor do indicador como le a chave, etapa 0 por universo), documentar os limites da guarda e uma reconferencia unica',
  phases: [
    { title: 'Consertar', detail: 'um dono: ranking_gaps.py e gerar_pontos.py' },
    { title: 'Conferir', detail: 'uma reconferencia, sem nova rodada' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'
const SCRIPT_BASE = '/Users/henriquesimoessilva/.claude/projects/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/workflows/scripts/fechar-base-pontos-wf_84378016-ca0.js'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Base da aba por faixa de aproveitamento de pontos: \`gerar_pontos.py\`, \`ranking_gaps.py\`, \`gerar_pontos_js.py\` -> \`dados/pontos.json\`, \`static/pontos.js\`.
CONTEXTO: constante CASA no topo de \`${SCRIPT_BASE}\` e \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\`.
HISTORIA: quatro rodadas de conserto nesta sessao. Os NUMEROS estao aprovados (lente de numeros). No JSON real, zero achado circular. As ultimas reconferencias estao em \`${S}/pontos_r3_journal.json\` (lista [rotulo, retorno]; leia 'conserta-4' e os tres 'confere-r4:*').
DECISAO DO COORDENADOR PARA ESTA RODADA (nao reabrir): a caca adversarial a guarda de circularidade virou uma escalada sem fim sobre heuristica de frase. A protecao PRINCIPAL e a lista de resultado aplicada ANTES de qualquer teste (as colunas circulares nem entram na matriz); a guarda e a rede de seguranca. Esta e a ULTIMA rodada: conserte so o que e ESTRUTURAL ou atinge o dado real e a proxima chamada do gerador do Prototipo, e ESCREVA na docstring do modulo, numa secao "Limites conhecidos da guarda", o que continua passando (frases com sinonimo fraco, contexto negado, grafias coladas), com os casos medidos.
REGRAS: semente fixa; nenhum numero digitado; ausencia com motivo; comentario em prosa do por que.
PROIBIDO: qualquer git que escreva. NAO EDITE: \`gerar_prototipo.py\`, \`gerar_prototipo_js.py\`, \`dados/prototipo.json\`, \`dados/prototipo_indicadores.json\`, \`static/*\` exceto \`static/pontos.js\` (gerado), \`templates/\`, \`_fonte/\` (outras rodadas estao escrevendo neles AGORA). NAO use nem derrube as portas 5090/5091. Rascunhos so em ${S}.`

const FIX = { type: 'object', properties: {
  consertados: { type: 'array', items: { type: 'object', properties: { problema: { type: 'string' }, o_que_fiz: { type: 'string' }, numero_antes_e_depois: { type: 'string' } }, required: ['problema', 'o_que_fiz', 'numero_antes_e_depois'] } },
  limites_documentados: { type: 'array', items: { type: 'string' } },
  api_final_para_o_gerador: { type: 'string' },
  diff_de_numeros: { type: 'string' },
  rodou: { type: 'boolean' }, deterministico: { type: 'string' },
}, required: ['consertados', 'limites_documentados', 'api_final_para_o_gerador', 'diff_de_numeros', 'rodou', 'deterministico'] }

const CONF = { type: 'object', properties: {
  conferidos: { type: 'integer' },
  problemas: { type: 'array', items: { type: 'object', properties: { onde: { type: 'string' }, eu_medi: { type: 'string' }, conserto: { type: 'string' }, gravidade: { type: 'string', enum: ['mente', 'quebra', 'falta', 'detalhe'] } }, required: ['onde', 'eu_medi', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
  pode_seguir_para_o_gerador: { type: 'boolean' },
}, required: ['conferidos', 'problemas', 'veredito', 'pode_seguir_para_o_gerador'] }

phase('Consertar')
const fix = await agent(`${CASA}

TAREFA (antes de mexer, copie dados/pontos.json para ${S}/pontos_antes_fecho.json):
1. LINHA DA SORTE INDEPENDENTE DA ORDEM DAS LINHAS (medido: 37,58 / 37,78 / 37,82 / 37,19 conforme a ordem): dentro de tabela_de_gaps/linha_da_sorte, ordene por (ano, clube) antes de sortear, para o Prototipo e a aba de pontos publicarem a mesma linha com a mesma semente, qualquer que seja a ordem de montagem. Prove com tres ordens diferentes: mesma linha, mesmos p. Diga quanto o numero publicado mudou.
2. GUARDA LENDO O VALOR COMO LE A CHAVE: o campo "indicador" (e similares) de uma linha passa pela mesma leitura por token e pelos nomes crus das colunas com espaco e barra ("Golos sofridos", "Golos sofridos/90", "golos pro", "Pts/J", "aproveitamento_1t", "V_casa"). Mesma coisa na guarda de consequencia ("share_11/90", "conc_hhi_minutos", linhas com indicador de consequencia sob marca num ancestral = achado, nao citacao). Sem falso positivo no JSON real (confira 0).
3. _referencia_valida: a referencia declarada so vale se NENHUM descendente partir por faixa (subchave, nome de campo ou valor com rotulo de faixa).
4. etapa_0: clubes_distintos e aparicoes_por_clube por universo (2022-2025: 40 clubes; 2018-2021: 36 — confira).
5. Docstring de tabela_de_gaps sem contradicao (Series indexadas por (ano, clube), nunca "vetor"); _medianas_para_a_tela sem ruido de ponto flutuante (arredonde a representacao).
6. Secao "Limites conhecidos da guarda" na docstring do modulo, com os casos medidos que continuam passando e o motivo.
7. O bloco \`tela\` do pontos.json descreve o renderer (proto*.js), que esta sendo reescrito AGORA por outra rodada: NAO persiga numeros de linha; grave nele que e uma foto e sera refeito quando a tela fechar.
8. Rode gerar_pontos.py completo + gerar_pontos_js.py; determinismo PYTHONHASHSEED 1 x 2 (saida em ${S}); diff contra ${S}/pontos_antes_fecho.json: diga exatamente o que mudou de numero.
9. Devolva a chamada FINAL que o gerador do Prototipo deve fazer (api_final_para_o_gerador), testada no scratch importando o G (troque G.SAIDA; python3 -B), sem gravar no repo.`,
  { label: 'fecho', phase: 'Consertar', schema: FIX, effort: 'high' })

phase('Conferir')
const conf = await agent(`${CASA}

RECONFERENCIA UNICA (nao havera outra rodada). Relato:
${JSON.stringify(fix, null, 1).slice(0, 40000)}

Confira os itens 1 a 9 por conta propria (scripts seus em ${S}): linha da sorte igual em tres ordens; os casos do item 2 e 3 acusados; zero no JSON real; etapa 0 por universo contada por voce nos CSVs; diff de numeros so onde o conserto disse; determinismo; a chamada do gerador roda. Nao cace frases novas para a guarda: os limites estao documentados por decisao do coordenador. Diga se a base PODE SEGUIR para o gerador do Prototipo. Voce NAO escreve em arquivo do projeto.`,
  { label: 'reconfere-fecho', phase: 'Conferir', schema: CONF, effort: 'high' })

return { fecho: fix, reconferencia: conf }
