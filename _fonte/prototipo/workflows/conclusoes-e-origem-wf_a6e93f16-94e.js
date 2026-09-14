export const meta = {
  name: 'conclusoes-e-origem',
  description: 'Monta a base de origem (rebaixados da A e promovidos da C, com fonte), aplica o critico e as decisoes do dono no CONCLUSOES.md e no conclusoes_spec.json, e confere com dois ceticos',
  phases: [
    { title: 'Origem', detail: 'lista publica com fonte, conferida contra o jogo a jogo' },
    { title: 'Editar', detail: 'CONCLUSOES.md e conclusoes_spec.json, um dono' },
    { title: 'Conferir', detail: 'numeros e decisoes; regua e linguagem' },
    { title: 'Consertar', detail: 'uma rodada' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'
const MAPA = S + '/mapa_rodada.json'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B.
LEIA ANTES, INTEIROS: \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\` (inclusive "Decisoes do dono em 14/09"), \`${RAIZ}/_fonte/prototipo/PENDENTE_RODADA.md\`, \`${RAIZ}/_fonte/prototipo/CONCLUSOES.md\` (41 conclusoes e a regua), \`${RAIZ}/_fonte/prototipo/conclusoes_spec.json\` e \`${RAIZ}/_fonte/prototipo/conclusoes_critico.json\`.
O TRATAMENTO MEDIDO DO CRITICO ja existe, com cetico: \`${MAPA}\`, chaves "conclusoes:faltantes", "conclusoes:selos", "conclusoes:receitas" (propostas) e "cetico:faltantes", "cetico:selos", "cetico:receitas" (conferencias, todas com veredito "ajustar" e divergencias com conserto), e "critico-do-plano" (itens 3 e 7 do PENDENTE sem cobertura; etapa 11 sem corte de 2026).
DECISOES DO DONO EM 14/09 (valem, nao reabrir):
1. Regua, desempate MODERADO x FRACO = "olhar a lista inteira": uma medida so e MODERADA se a familia declarada de onde saiu tem mais achados do que a sorte (p do excesso < 0,05, rotulos sorteados dentro do ano, semente fixa, 10.000 sorteios). Efeito medido: J4 moderado; J7, FIS-06, FIS-08, FIS-11 fracos. O elenco esta na fronteira (0,045 a 0,052): meca com 10.000 e diga.
2. J10 = SEM SINAL pela regua escrita, frase "nao se viu", G1 "dono do jogo" nomeado (5 entre os 3 mais caros), numero gravado (Kruskal 0,0325, nao "1 em 100").
3. Etapa 14 passa a contar por POSICAO, 2.000 replicas, sorteio proprio por proposta, empate tecnico: as frases que dependem dos nomes da etapa 14 (M3, "as sul-americanas nunca passaram de metade") ficam condicionadas ao gerador novo — escreva a regra, nao o numero velho.
4. Origem: so entra com a base gravada e conferida (fase Origem desta rodada).
Regras da regua ja escritas continuam: toda conclusao com selo (forte, moderado, fraco, sem sinal, nao da para afirmar — nunca um sexto rotulo; a "tabela dos euros" vira descricao da conclusao FORTE do dinheiro); "sem sinal" escreve "nao se viu", nunca "nao separa"; associacao nunca vira receita; "nunca" so com zero excecao; 2026 nunca entra em media; cada numero diz o universo; frase de reuniao no molde do dono ("Quem sobe poe uma parte maior do elenco na defesa: 34% do valor, contra 27% no meio da tabela. E um sinal fraco. Quando se testam os quatro setores, um desses pode sair por sorte.").
PROIBIDO: qualquer git que escreva. NAO EDITE: \`gerar_*.py\`, \`ranking_gaps.py\`, \`dados/prototipo.json\`, \`dados/pontos.json\`, \`dados/prototipo_indicadores.json\` (a base de pontos esta rodando AGORA e le esse arquivo; declaracoes novas vao para proposta em ${S}), \`static/\`, \`templates/\`. NAO use nem derrube as portas 5090/5091. Scripts e rascunhos em ${S}.`

const ORIG = { type: 'object', properties: {
  arquivo: { type: 'string' },
  anos: { type: 'string' },
  fontes: { type: 'array', items: { type: 'string' } },
  conferencia_contra_jogo_a_jogo: { type: 'string' },
  divergencias_da_lista_de_memoria: { type: 'array', items: { type: 'string' } },
  numeros_medidos: { type: 'string' },
  selo_e_frase: { type: 'string' },
  o_que_nao_consegui: { type: 'string' },
}, required: ['arquivo', 'anos', 'fontes', 'conferencia_contra_jogo_a_jogo', 'divergencias_da_lista_de_memoria', 'numeros_medidos', 'selo_e_frase', 'o_que_nao_consegui'] }

const EDIT = { type: 'object', properties: {
  arquivos_escritos: { type: 'array', items: { type: 'string' } },
  mudancas: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, antes: { type: 'string' }, depois: { type: 'string' }, por_que: { type: 'string' },
  }, required: ['id', 'antes', 'depois', 'por_que'] } },
  contagem_de_selos: { type: 'string' },
  as_cinco: { type: 'array', items: { type: 'string' } },
  declaracoes_propostas_para_o_gerador: { type: 'string' },
  campos_que_o_gerador_precisa_gravar: { type: 'array', items: { type: 'string' } },
  pendencias: { type: 'array', items: { type: 'string' } },
}, required: ['arquivos_escritos', 'mudancas', 'contagem_de_selos', 'as_cinco', 'declaracoes_propostas_para_o_gerador', 'campos_que_o_gerador_precisa_gravar', 'pendencias'] }

const CONF = { type: 'object', properties: {
  lente: { type: 'string' }, conferidos: { type: 'integer' },
  problemas: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, o_que_esta_escrito: { type: 'string' }, eu_medi: { type: 'string' }, conserto: { type: 'string' },
    gravidade: { type: 'string', enum: ['muda_selo', 'muda_numero', 'mente', 'receita', 'falta', 'detalhe'] },
  }, required: ['id', 'o_que_esta_escrito', 'eu_medi', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'conferidos', 'problemas', 'veredito'] }

phase('Origem')
const origem = await agent(`${CASA}

TAREFA: a BASE DE ORIGEM, que a conclusao nova "quem acabou de cair da Serie A subiu 11 vezes em 28" exige.
1. Para cada temporada de 2018 a 2026, os 20 clubes da Serie B (tirados das bases do projeto: \`dados/serieb_clube_temporada.csv\`, \`dados/serieb_clube_temporada_2018_2021.csv\`) e a ORIGEM de cada um: "A" (rebaixado da Serie A no ano anterior), "C" (promovido da Serie C no ano anterior) ou "B" (ja estava na B).
2. Fonte PUBLICA por ano, com o link: as paginas das temporadas da Serie A e da Serie C (Wikipedia em portugues ou ingles, ou ogol/zerozero). Use WebSearch e WebFetch (carregue com ToolSearch). Pelo menos duas fontes independentes por ano; se discordarem, diga.
3. Confira contra o dado do projeto: (a) quem estava na B no ano anterior segundo os proprios CSVs; (b) \`dados/serieb_jogos.csv\` (partidas de "Brazil. Serie A" e "Brazil. Serie C" do clube no ano anterior, onde houver). Cada caso que o jogo a jogo resolve tem de bater.
4. Grave \`${RAIZ}/dados/serieb_origem_2018_2026.csv\` com colunas ano, clube (grafia EXATA das bases do projeto), origem, fonte_1, fonte_2, conferido_jogo_a_jogo (sim/nao/sem dado), nota. E um comentario de uma linha no topo? NAO (csv puro); o metodo vai no seu relato.
5. Compare com a lista de memoria usada pelo agente anterior (em ${MAPA}, "conclusoes:faltantes", item 1, e o script dele citado la) e liste cada divergencia.
6. REMECA a conclusao com a base gravada (script em ${S}): subiu/caiu por origem 2019-2025, por periodo, Fisher, desconto do dinheiro em 2022-2025 (esperado pelo posto de valor), poder; faixa de pontos pelo corte do dono. Proponha selo pela regua e a frase de reuniao, separando os universos (2019-2025 x 2022-2025 com valor).`,
  { label: 'origem', phase: 'Origem', schema: ORIG, effort: 'high' })

phase('Editar')
const edit = await agent(`${CASA}

A BASE DE ORIGEM ficou assim:
${JSON.stringify(origem, null, 1).slice(0, 15000)}

TAREFA: voce e o UNICO dono de \`_fonte/prototipo/CONCLUSOES.md\` e \`_fonte/prototipo/conclusoes_spec.json\`. Aplique:
(a) as 9 conclusoes novas do grupo "faltantes", com os consertos do cetico (frases, numeros, selos: a dos euros vira descricao da DIN forte; os 4 fora do top 8 x tipologia vira FRACO; a origem com os numeros da base gravada acima, ou marcada "aguardando base" se a origem falhou);
(b) os selos corrigidos do grupo "selos" com os consertos do cetico e as DECISOES 1 e 2 (regua nova escrita por extenso no CONCLUSOES.md e em regua.selos do spec, com a regra operacional do p do excesso por familia; J10 sem sinal; M1 = NAO DA PARA AFIRMAR para quem trocou de clube ate existir a comparacao com a mesma regua nos dois lados, sem 2026; FIS-07 com os numeros refeitos pela regua do gerador);
(c) as frases do grupo "receitas", com os consertos do cetico;
(d) as conclusoes dos itens 3 e 7 do PENDENTE (duelo aereo de quem cai; duelo defensivo do meio), REMEDIDAS por voce (script em ${S}) com caiu x resto, 2018-2021, desconto do dinheiro e a regua nova — o item 7 pede "medir de novo na rodada";
(e) o efeito do corte de 2026 na etapa 11 (o \`dados/pontos.json\` etapa_11 ja roda sem 2026 e grava efeito_de_retirar_2026; so leitura) em M1, FIS-07 e na conclusao nova sobre o que se perde ao mudar de clube;
(f) consertos do spec apontados pelo mapa do gerador em ${MAPA} ("mapa:gerador", item 5): caminho de DIN-02 (o gerador grava menor_k_com_14), A3 e A4 com a ausencia e o motivo, fontes que o gerador nao le;
(g) "As cinco que voce precisa ler" escolhidas POR REGRA escrita no documento (as de selo mais forte, desempate pela diversidade de tema), e cada conclusao com "vale tambem pela faixa de pontos?" quando medido, marcado como provisorio ate a base de pontos fechar;
(h) a contagem de selos no topo recalculada.
Declaracoes novas (comparacoes caiu x resto dos itens 3 e 7, etapa_6.mesmo_ano do item 10, origem, p do excesso por familia com 10.000 sorteios, e o que mais o spec pedir): NAO edite dados/prototipo_indicadores.json — grave a proposta, no formato daquele arquivo, em \`${S}/declaracoes_novas.json\`.
Liste os campos que o gerador tera de gravar para o bloco \`conclusoes\` montar cada frase sem numero digitado.`,
  { label: 'editor', phase: 'Editar', schema: EDIT, effort: 'xhigh' })

phase('Conferir')
const LENTES = [
  { k: 'numeros-e-decisoes', p: 'NUMEROS E DECISOES. Para uma amostra de pelo menos 15 conclusoes alteradas ou novas (todas as dos itens 3 e 7, a origem, J4, J7, J10, M1, FIS-06/07/08/11 e mais quatro sorteadas), refaca o numero por caminho proprio e confira que as quatro decisoes do dono foram aplicadas ao pe da letra. O p do excesso por familia com 10.000 sorteios: refaca com outra semente e diga se algum selo fica na fronteira. A base de origem: sorteie 12 clube-temporada e confira na fonte citada.' },
  { k: 'regua-e-linguagem', p: 'REGUA E LINGUAGEM. Aplique a regua NOVA a TODAS as conclusoes, uma a uma, pelos numeros escritos no proprio documento: algum selo nao bate com a regra? Alguma frase afirma mais que o selo, vira receita ("contrate", "defenda longe", "serve para"), usa "nao separa" em sem sinal, "nunca" com excecao, mistura universos, ou tem jargao na frase de reuniao (p, d, rho, q, BH fora do numero pequeno)? O spec e o documento dizem a mesma coisa (mesmos ids, selos, frases)? As cinco seguem a regra escrita?' },
]
let confs = (await parallel(LENTES.map(l => () => agent(`${CASA}

O editor relatou:
${JSON.stringify(edit, null, 1).slice(0, 50000)}
A base de origem:
${JSON.stringify(origem, null, 1).slice(0, 10000)}

VOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. SUA LENTE: ${l.p}`,
  { label: 'confere:' + l.k, phase: 'Conferir', schema: CONF, effort: 'high' }).then(r => r ? { ...r, k: l.k } : null)))).filter(Boolean)

const graves = confs.flatMap(c => c.problemas.filter(p => p.gravidade !== 'detalhe').map(p => ({ ...p, lente: c.k })))
let conserto = null
if (graves.length) {
  phase('Consertar')
  conserto = await agent(`${CASA}

Voce e o UNICO dono de \`_fonte/prototipo/CONCLUSOES.md\` e \`_fonte/prototipo/conclusoes_spec.json\` (e de \`${RAIZ}/dados/serieb_origem_2018_2026.csv\`, se o problema for nela). RODADA DE CONSERTO. Problemas:
${JSON.stringify(graves, null, 1).slice(0, 50000)}
Detalhes: ${JSON.stringify(confs.flatMap(c => c.problemas.filter(p => p.gravidade === 'detalhe')), null, 1).slice(0, 15000)}
Confirme cada um medindo (o cetico pode ter errado: diga por que). Conserte, recalcule a contagem de selos e atualize \`${S}/declaracoes_novas.json\` se preciso.`,
    { label: 'conserta', phase: 'Consertar', schema: EDIT, effort: 'high' })
}
return { origem, edicao: edit, conferencias: confs, conserto }
