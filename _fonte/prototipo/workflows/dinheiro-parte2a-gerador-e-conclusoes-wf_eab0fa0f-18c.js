export const meta = {
  name: 'dinheiro-parte2a-gerador-e-conclusoes',
  description: 'Rodada do dinheiro, parte 2A: declaracoes, ranking_gaps.py e gerar_prototipo.py sem dinheiro e sem ano seguinte (so rascunho do JSON), conferencia dos numeros, conserto, e conclusoes/spec/especificacao reescritas com a regua final',
  phases: [
    { title: 'Declarar', detail: 'declaracoes_novas.json e ordem_gerador_bloco2.json' },
    { title: 'Gerar', detail: 'ranking_gaps.py, depois gerar_prototipo.py, rascunho do JSON' },
    { title: 'Conferir numeros', detail: 'numeros refeitos por fora; compatibilidade e guardas' },
    { title: 'Consertar gerador', detail: 'uma rodada' },
    { title: 'Conclusoes', detail: 'conclusoes_spec.json, CONCLUSOES.md, ESPECIFICACAO.md' },
    { title: 'Conferir conclusoes', detail: 'regua aplicada a mao nas 57; uma rodada de conserto' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Ranking/1abbf5c7-a19a-4f3a-89c2-26d0445cdbba/scratchpad'
const W = S + '/dinheiro2'
const F = RAIZ + '/_fonte/prototipo'
const PLANO = F + '/sessao_14_09/dinheiro_parte1_resultado.json'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B, aba Prototipo: gerador \`gerar_prototipo.py\` -> \`dados/prototipo.json\`; \`ranking_gaps.py\` (importado pelo gerador E pelo \`gerar_pontos.py\`); conclusoes em \`${F}/CONCLUSOES.md\` e \`${F}/conclusoes_spec.json\`; especificacao \`${F}/ESPECIFICACAO.md\`; declaracoes e ordem do bloco 2 em \`${F}/sessao_14_09/declaracoes_novas.json\` e \`ordem_gerador_bloco2.json\`. LEIA ANTES: \`${F}/CONTINUAR.md\` (secao 3 item 3 e TODA a secao 5) e O PLANO APROVADO: \`${PLANO}\` — chave \`plano\` inteira (regua_final, portas_final, etapas_9_10_13_final, vocabulario_sorte_final, conclusoes, as_cinco_depois, plano_por_dono, diff_permitido_no_json, fica_para_o_item_6); \`mapas\` e \`propostas\` para o detalhe de arquivo e linha.

O QUE ESTA RODADA EXECUTA (decidido, nao reabrir):
1. "Descontado o dinheiro" SAI DE VEZ dos selos, portas, marcas, gates e textos (liquido, liq2 com valor, tm_valor_total como controle, referencia_dinheiro como regua, Controle 1 "o que nao bate o dinheiro nao serve"). O valor do elenco continua DESCRITO (etapa 1, regua H_dinheiro como descricao, DIN-*, cenarios da 14).
2. A repeticao "mesmo clube no ano seguinte" (rho_persist, persist, esmaecido da etapa 9, rho<0,15 da etapa 10, frases "nao se viu o mesmo clube repetir") SAI dos criterios. FICAM o 1o->2o turno e 2018-2021. etapa_6.rho continua como DADO. As conclusoes sobre repeticao do atleta (FIS-07, M1, M6, M7) e ELE-06 ficam com o selo.
3. A REGUA FINAL e a do plano ("contra a sorte"), com: "sem conferencia testavel = moderado, nunca forte"; no fisico, a pergunta a mais e descontado SO o rodizio (atletas rastreados), d_rod/p_rod.
4. Vocabulario unico de sorte gravado como CHAVE (firme q<0,05 | pode_ser_sorte p<0,05 e q>=0,05 | sem_diferenca p>=0,05); "por pouco" so atras de firme; "no limite" so no selo (zona 0,05-0,10); lista inteira: "tem/nao tem mais achados do que a sorte produz".
RESPOSTAS DO DONO (noite de 14/09) as 4 perguntas do plano:
 a. J17: MODERADO, pela REGRA GERAL "firme por pouco (q entre 0,025 e 0,05) com uma conferencia so = moderado" (vale para todas). As cinco, com o que estiver gravado, seguem a regra de escolha de sempre.
 b. Aba mais afirmativa: ACEITA. J19, ELE-03 e A2 (e as outras que sobem) com a ressalva escrita sem desconto e sem receita: "elenco valioso tende a ter isso; o estudo nao separa as duas coisas".
 c. Porta A: SO LEITURA, nome novo "firme e reaparece por outro caminho" (nada de "criterio de contratacao"/"entra no score"); a nota da etapa 13 NAO muda.
 d. M4: zaga e lateral ficam na M4 (fraco); o ATAQUE vira CONCLUSAO PROPRIA (moderado) — 57 conclusoes.
DECIDIDOS PELO COORDENADOR pela regra da casa: A1 fica na familia dos 2 eixos (fraco, registrado como "familia escolhida depois de olhar"); DIN-04 e DIN-05 lidas por jogador (sem sinal), com a fatia em euros descrita; etapa 13 so ganha a MARCA da lista por setor (zaga e lateral "a lista nao tem mais achados do que a sorte"), sem filtro; etapa 10 com a lista fixa resultado + consequencia do ranking_gaps (25 -> 22).

REGRAS DA CASA: nenhum numero digitado; ausencia com motivo; analise nova DECLARADA antes de medir; um dono por arquivo; set iterado vira sorted; sorteio com gerador proprio (etapa nova que sorteia antes desloca as seguintes); fora do main carregue G.DECL = G.carregar_declaracao() antes de montar_matriz; para rodar o main sem gravar troque G.SAIDA e use python3 -B; comentario em prosa do por que; portugues de reuniao de clube nos textos que vao ao JSON e as conclusoes; associacao nunca vira receita.
COMPATIBILIDADE OBRIGATORIA: \`gerar_pontos.py\` (NAO TOCAR — item 6) importa gerar_prototipo (P.etapa_2(..., persist), P.etapa_5, P.etapa_6, P.pares_consecutivos, bootstrap...) e ranking_gaps (RG.tabela_de_gaps com r_val, marcas, guardas). Nenhuma assinatura pode quebrar: parametro que sai vira opcional e ignorado, com comentario "mantido para o gerar_pontos ate o item 6". Provar chamando as funcoes com os argumentos que o gerar_pontos passa (ler o codigo dele), sem rodar o pipeline dele.
NESTA PARTE: NAO grave \`dados/prototipo.json\` nem \`static/prototipo.js\` (a gravacao e da parte 2B, depois das telas) — o dado novo vive em ${W}/prototipo_novo.json. NAO toque em \`static/\`. PROIBIDO qualquer git; publicar; tocar em gerar_pontos.py, dados/pontos.json, static/pontos.js. OUTRA SESSAO DO CLAUDE trabalha no mesmo repositorio (app.js, app.py, templates, bola_parada, premissas, cenarios, docs): nao toque. Nao use as portas 5090/5091. Rascunhos em ${W}.`

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
const RODAR = `Rode o main NO RASCUNHO (G.SAIDA = ${W}/prototipo_novo.json; python3 -B), com PYTHONHASHSEED 1 e 2 identicos. Diff caminho a caminho contra o dados/prototipo.json gravado (md5 2859ed76...), classificando cada diferenca contra o diff_permitido_no_json do plano (REMOVER / ACRESCENTAR / MUDAR VALOR / NAO PODE MUDAR); qualquer diferenca fora da lista ou mudanca no NAO PODE MUDAR e defeito seu.`

/* ---------------- 1. declarar ---------------- */
phase('Declarar')
const decl = await agent(`${CASA}\n\nSUA TAREFA: dono de \`${F}/sessao_14_09/declaracoes_novas.json\` e \`${F}/sessao_14_09/ordem_gerador_bloco2.json\` (e so deles; se o gerador le declaracao de outro arquivo via carregar_declaracao, diga qual e o que o dono do gerador precisa declarar la). Faca as tarefas do plano_por_dono "declaracoes": declare ANTES de qualquer medicao nova tudo o que o plano manda ACRESCENTAR (d_rod_*/p_rod_* so com o rodizio; chave de sorte sorte_SM/sorte_SC e nas etapas 5, 6, 7, 9 e ranking_gaps; excesso {bruto, rod} por familia e por setor; p/tamanho/sobrevivem descontado o elenco no ranking_gaps; q dos 28 testes da etapa 7; bloco DIN-04/05 por jogador; a regua final com as 4 respostas do dono e as 4 do coordenador; a porta A so leitura com o nome novo; etapa 10 pela lista fixa; marca da etapa 13). Revise a ordem do bloco 2: tire tudo que dependia de dinheiro ou ano seguinte e diga, campo a campo, o que muda. Data das declaracoes: 14/09/2026 (noite), antes de medir.`,
  { label: 'dono:declaracoes', phase: 'Declarar', schema: ESC, effort: 'high' })

/* ---------------- 2. gerar ---------------- */
phase('Gerar')
const rg = await agent(`${CASA}\n\nDeclaracoes feitas: ${J(decl, 10000)}\n\nSUA TAREFA: dono de \`ranking_gaps.py\` (e so dele). Faca as tarefas do plano_por_dono "gerador ranking_gaps.py": sai o desconto do dinheiro (p_descontado_dinheiro*, tamanho_descontado_dinheiro*, sobrevivem_q_e_dinheiro*, _so_dinheiro_sem_desconto_de_elenco e regra/motivo do dinheiro), entra o descontado so pelo elenco (rodizio) como declarado, a chave de sorte, e a lista fixa resultado + consequencia continua como fonte da etapa 10. Assinaturas compativeis com o gerar_pontos.py (parametro r_val etc. vira opcional e ignorado, com comentario). Teste: importe o modulo e chame as funcoes publicas com os argumentos do gerador e do gerar_pontos (dado real, sem gravar), e rode as guardas. NAO rode o main do gerador (o dono do gerador faz isso depois de voce).`,
  { label: 'dono:ranking_gaps', phase: 'Gerar', schema: ESC, effort: 'high' })

const ger = await agent(`${CASA}\n\nDeclaracoes: ${J(decl, 8000)}\nranking_gaps: ${J(rg, 10000)}\n\nSUA TAREFA: dono de \`gerar_prototipo.py\` (e so dele). Faca TODAS as tarefas do plano_por_dono "gerador gerar_prototipo.py" (etapa_2: colunas liquidas saem, liq2 vira d_rod/p_rod so com rodizio, rho_persist/n_persist saem da linha e persist vira parametro ignorado, portas A/B/-/D sem C com a regra e os motivos do plano e o nome novo da A, chave sorte_SM/sorte_SC; etapa_3 excesso bruto/rod; bootstrap sem ic_liq; etapa_5 sensibilidade sem liq e firmeza pela chave unica; etapa_6 sem referencia_dinheiro; etapa_7 q dos 28 e chave; etapa_8 sem residualizado/desconto_dinheiro_por_grupo/trocam_no_dinheiro; etapa_9 sem esmaecido e sem liquido, com chave; etapa_10 pela lista fixa, sem os blocos de persistencia; etapa_13 igual + marca da lista por setor; etapa_14 porta lida do catalogo e sem Controle 1; etapa_15 sem rho digitado; etapa_1 controle de atletas "so rodizio"; bloco DIN-04/05 por jogador; docstrings e textos que vao ao JSON). ${RODAR} Devolva em numeros_principais a tabela do plano refeita com o dado novo: portas (A/B/-/D), motivos da B, etapa 10 (linhas e quem entrou/saiu), etapa 9, chaves de sorte por etapa (firme/pode ser sorte/sem diferenca), fisico sobe x cai (cru / so rodizio), DIN-04/05 por jogador, etapa 7 com q, e a prova de que etapa_1, etapa_6.rho, p/d/q brutos, etapa_9 p/q/d, etapa_13 inteira e os cenarios da 14 nao mudaram.`,
  { label: 'dono:gerador', phase: 'Gerar', schema: ESC, effort: 'high' })
if (!ger) return { declaracoes: decl, ranking_gaps: rg, gerador: null, parou: 'gerador falhou' }

/* ---------------- 3. conferir numeros ---------------- */
phase('Conferir numeros')
const FEITO = `O que foi feito: ${J({ declaracoes: decl, ranking_gaps: rg, gerador: ger }, 40000)}`
const LENTES = [
  { k: 'numeros', t: `OS NUMEROS, refeitos por fora (sem importar o codigo novo para calcular; pode importar carregar_painel/montar_matriz para ter d80 e postos, com G.DECL = G.carregar_declaracao()): em ${W}/prototipo_novo.json, refaca para as 293 linhas a porta e o motivo pela regra do plano, as chaves de sorte (etapas 2, 5, 6, 7, 9 e ranking_gaps), d_rod/p_rod nas 160 fisicas (sobe x cai 41 cru / 34 so rodizio), o excesso por familia, a etapa 10 (22) e a etapa 9 (0 apagadas, 4 firmes), o bloco DIN-04/05 por jogador e o q dos 28 da etapa 7; compare com o plano (numeros_para_o_dono) e com o relato do gerador; toda diferenca precisa de motivo. Diff contra o gravado: REMOVER/ACRESCENTAR/MUDAR/NAO PODE MUDAR do plano. Determinismo.` },
  { k: 'compatibilidade', t: `COMPATIBILIDADE E RESTOS: (1) chame, sem rodar o pipeline, cada funcao do gerar_prototipo e do ranking_gaps que o gerar_pontos.py usa, com os argumentos que ele passa, e prove que nada quebra; (2) procure no gerar_prototipo.py, no ranking_gaps.py e no JSON novo QUALQUER criterio que ainda use dinheiro (liquido, tm_valor_total como controle, referencia_dinheiro, Controle 1) ou ano seguinte (rho_persist, persist, esmaecido, rho<0,15) — pelo nome e pelo efeito, inclusive por outro nome; separe o que e descricao legitima (etapa 1, H_dinheiro, DIN-*, etapa_6.rho como dado, cenarios); (3) as guardas do ranking_gaps no JSON novo (contagens e o que mudou); (4) etapa_13 inteira byte a byte igual; (5) textos que vao ao JSON sem jargao novo e sem "dificilmente e sorte"/"no limite" como rotulo de sorte.` },
]
const confs = (await parallel(LENTES.map(L => () => agent(`${CASA}\n\n${FEITO}\n\nVOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. SUA LENTE: ${L.t}`,
  { label: 'confere:' + L.k, phase: 'Conferir numeros', schema: CONF, effort: 'high' })))).filter(Boolean)
log(`conferencias dos numeros: ${confs.map(c => c.veredito).join(' · ')}`)

/* ---------------- 4. consertar gerador ---------------- */
let consertos = []
const probs = confs.flatMap(c => c.problemas).filter(p => p.gravidade !== 'detalhe' || true)
if (probs.length) {
  phase('Consertar gerador')
  const doRG = probs.filter(p => (p.arquivo || '').includes('ranking_gaps'))
  const doDecl = probs.filter(p => (p.arquivo || '').includes('declaracoes') || (p.arquivo || '').includes('ordem_gerador'))
  const doGer = probs.filter(p => !doRG.includes(p) && !doDecl.includes(p))
  if (doDecl.length) consertos.push(await agent(`${CASA}\n\nRODADA DE CONSERTO. Voce e dono de declaracoes_novas.json e ordem_gerador_bloco2.json. Problemas (confirme cada um; recuse com prova):\n${J(doDecl, 12000)}`, { label: 'conserta:declaracoes', phase: 'Consertar gerador', schema: ESC, effort: 'high' }))
  if (doRG.length) consertos.push(await agent(`${CASA}\n\nRODADA DE CONSERTO. Voce e dono de ranking_gaps.py. Problemas (confirme cada um; recuse com prova):\n${J(doRG, 15000)}\nTeste como antes (funcoes publicas com os argumentos do gerador e do gerar_pontos; guardas).`, { label: 'conserta:ranking_gaps', phase: 'Consertar gerador', schema: ESC, effort: 'high' }))
  if (doGer.length || doRG.length || doDecl.length) consertos.push(await agent(`${CASA}\n\nRODADA DE CONSERTO. Voce e dono de gerar_prototipo.py. Problemas (confirme cada um; recuse com prova):\n${J(doGer, 20000)}\n${doRG.length || doDecl.length ? 'O ranking_gaps e/ou as declaracoes foram consertados antes de voce: ' + J(consertos, 6000) : ''}\n${RODAR}`, { label: 'conserta:gerador', phase: 'Consertar gerador', schema: ESC, effort: 'high' }))
  consertos = consertos.filter(Boolean)
}

/* ---------------- 5. conclusoes ---------------- */
phase('Conclusoes')
const concl = await agent(`${CASA}\n\nRelatos: ${J({ declaracoes: decl, ranking_gaps: rg, gerador: ger, conferencias: confs, consertos }, 45000)}\n\nSUA TAREFA: dono de \`${F}/conclusoes_spec.json\`, \`${F}/CONCLUSOES.md\` e \`${F}/ESPECIFICACAO.md\` (e so deles). Com os numeros de ${W}/prototipo_novo.json (o dado novo, ainda nao gravado no projeto):
1. Reescreva a REGUA no topo do CONCLUSOES.md e na spec (criterios_do_selo, moldes, regra_maquina) pela regua final do plano com as respostas do dono e do coordenador, dizendo com todas as letras o que saiu (dinheiro, ano seguinte) e as clausulas "sem conferencia testavel = moderado" e "firme por pouco com uma conferencia so = moderado".
2. Refaca o selo de CADA conclusao pela regua escrita, com os campos gravados (sem numero de cabeca); aplique: J17 moderado; J19/ELE-03/A2 (e as que subirem) com a ressalva do elenco valioso; M4 = zaga e lateral (fraco) e uma conclusao NOVA para o ataque (moderado), id novo e declarado como partida da M4 depois de olhar; A1 fraco (familia dos 2 eixos, escolhida depois); DIN-04/05 por jogador (sem sinal, fatia em euros descrita); DIN-01 sem o controle da cobertura; FIS-04 com a conta so do rodizio; conserte as regra_maquina que quebram sem dinheiro (ORI-01, A4, ELE-03, J15, A1, DIN-04, DIN-05); tire de todas as frases "descontado o dinheiro", "entre elencos de valor parecido" como criterio e "nao se viu o mesmo clube repetir o numero"; FIS-07, M1, M6, M7, ELE-06 ficam com o selo; vocabulario unico de sorte.
3. As cinco mais firmes pela regra de escolha de sempre, com o que esta gravado no dado novo.
4. ESPECIFICACAO.md: secao das portas (6.5) e o que falava de dinheiro/persistencia como criterio, com a data e a decisao.
5. Contagem final dos selos (forte/moderado/fraco/sem sinal/nao da) e a tabela antes -> depois de cada conclusao que mudou, com o motivo.
Devolva em numeros_principais a contagem, as cinco e a tabela das mudancas.`,
  { label: 'dono:conclusoes', phase: 'Conclusoes', schema: ESC, effort: 'high' })

/* ---------------- 6. conferir conclusoes ---------------- */
phase('Conferir conclusoes')
const confC = concl ? await agent(`${CASA}\n\nO dono das conclusoes relatou: ${J(concl, 20000)}\n\nVOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. (1) Aplique A MAO a regua escrita (a do topo do CONCLUSOES.md nova) a TODAS as 57 conclusoes, com os campos de ${W}/prototipo_novo.json, e compare selo a selo; (2) cada decisao do dono e do coordenador aplicada como escrita; (3) nenhuma frase ou criterio de selo usa dinheiro ou ano seguinte, nem por outro nome; as ressalvas do elenco valioso estao onde a regua manda e nao viram desconto; (4) regra_maquina: rode cada uma contra o dado novo (se a spec tiver runner, use-o; senao, reproduza) e confira que devolve o selo escrito; (5) as cinco; (6) a conclusao nova do ataque esta declarada como partida depois de olhar; (7) CONCLUSOES.md, spec e ESPECIFICACAO.md dizem a mesma coisa.`,
  { label: 'confere:conclusoes', phase: 'Conferir conclusoes', schema: CONF, effort: 'high' }) : null

let consertoC = null
if (confC && confC.problemas.length) {
  consertoC = await agent(`${CASA}\n\nRODADA DE CONSERTO (a unica). Voce e dono de conclusoes_spec.json, CONCLUSOES.md e ESPECIFICACAO.md. Problemas (confirme cada um; recuse com prova):\n${J(confC.problemas, 20000)}\nDepois, refaca a contagem dos selos e as cinco.`,
    { label: 'conserta:conclusoes', phase: 'Conferir conclusoes', schema: ESC, effort: 'high' })
}

return { declaracoes: decl, ranking_gaps: rg, gerador: ger, conferencias: confs, consertos, conclusoes: concl, conferencia_conclusoes: confC, conserto_conclusoes: consertoC }
