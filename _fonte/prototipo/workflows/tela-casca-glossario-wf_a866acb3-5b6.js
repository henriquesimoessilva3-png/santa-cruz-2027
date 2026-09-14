export const meta = {
  name: 'tela-casca-glossario',
  description: 'Metade tela, primeiro degrau: casca comum (proto.js + style.css), glossario (proto_glossario.js) e a extracao minima em app.js/index.html, com conferencia de regressao, largura e fonte do glossario',
  phases: [
    { title: 'Escrever', detail: 'tres donos de arquivo em paralelo' },
    { title: 'Conferir', detail: 'regressao e largura no navegador headless; glossario contra a fonte' },
    { title: 'Consertar', detail: 'uma rodada por dono com problema grave' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'
const MAPA = S + '/mapa_rodada.json'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B. App Flask (\`app.py\`, \`templates/index.html\`, \`static/app.js\`).
A aba "Prototipo" le a global PROTO (\`static/prototipo.js\`, copia de \`dados/prototipo.json\`) e desenha 16 etapas com \`static/proto.js\` (casca e vocabulario), \`static/proto_a.js\` (etapas 0-4), \`static/proto_b.js\` (5-8), \`static/proto_c.js\` (9-15), estilo em \`static/style.css\`. Existe tambem uma aba nova, por faixa de aproveitamento de pontos, cujo dado e a global PONTOS (\`static/pontos.js\`), ainda SEM tela.
LEIA ANTES, INTEIROS: \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\` e \`${RAIZ}/_fonte/prototipo/PENDENTE_RODADA.md\`. O mapa desta rodada esta em \`${MAPA}\` (JSON; leia as chaves "mapa:tela", "mapa:filtros", "mapa:glossario" e "critico-do-plano"). Ache e leia tambem o contrato das etapas (\`proto_contrato.md\`, procure no projeto).

DECISOES JA TOMADAS PARA ESTA RODADA (nao reabrir):
- Um dono por arquivo. Voce escreve SO nos arquivos da sua tarefa.
- A aba Prototipo continua existindo e tem de continuar funcionando igual, com zero erro no console.
- Texto de tela em portugues de reuniao de clube (diretor, treinador), com o vocabulario unico de proto.js (ptTamanho, ptAcaso, ptSorte, ptJunto, ptAcerto, ptTecnico); numero tecnico so ao lado, menor. Simplificar nunca e afirmar mais.
- NENHUM numero digitado na tela: tudo sai do dado. Ausencia sempre escrita com motivo (ptFalta ou equivalente), nunca some.
- Unidade e definicao dos indicadores DERIVADOS pelo gerador (share_11, conc_hhi, nucleo_*, ti_* agregados, eficiencias) vao ser gravadas pelo gerador na proxima rodada (indicadores[].unidade / .definicao). O glossario estatico cobre as colunas brutas de Wyscout, SkillCorner, Transfermarkt e os apelidos fisicos. A tela procura nesta ordem: campo do gerador -> glossario -> nome atual (ptNomeMedida).
- Filtros de liga/nacionalidade/idade (item 15, feitos depois por proto_c.js): o botao Europa aparece com 0 e o motivo; o padrao ao abrir e "Todas as ligas".
- As conclusoes aparecem com UM componente so, dono proto.js, usado pelos slots das etapas e, depois, pela aba de conclusoes.
PROIBIDO: qualquer git que escreva (commit, push, add, reset, checkout, stash, revert, tag). Git so leitura.
NAO EDITE: \`gerar_*.py\`, \`ranking_gaps.py\`, \`dados/*.json\`, \`static/prototipo.js\`, \`static/pontos.js\`, \`_fonte/prototipo/CONCLUSOES.md\`, \`_fonte/prototipo/conclusoes_spec.json\` (outra rodada esta consertando a base de pontos; depois vem o gerador e as conclusoes).
NAO use nem derrube as portas 5090 e 5091 (servidores do dono). Rascunhos so em ${S}.`

const ESCRITA = { type: 'object', properties: {
  arquivos_escritos: { type: 'array', items: { type: 'string' } },
  o_que_fiz: { type: 'array', items: { type: 'object', properties: {
    pedido: { type: 'string' }, onde: { type: 'string' }, como: { type: 'string' },
  }, required: ['pedido', 'onde', 'como'] } },
  api_publicada: { type: 'array', items: { type: 'string' } },
  o_que_ficou_para_outro_dono: { type: 'array', items: { type: 'string' } },
  como_testei: { type: 'string' },
  riscos: { type: 'array', items: { type: 'string' } },
}, required: ['arquivos_escritos', 'o_que_fiz', 'api_publicada', 'o_que_ficou_para_outro_dono', 'como_testei', 'riscos'] }

const CONF = { type: 'object', properties: {
  lente: { type: 'string' },
  conferidos: { type: 'integer' },
  medidas: { type: 'string' },
  problemas: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, onde: { type: 'string' }, o_que_vi: { type: 'string' },
    por_que_importa: { type: 'string' }, conserto: { type: 'string' },
    gravidade: { type: 'string', enum: ['quebra', 'mente', 'falta', 'detalhe'] },
  }, required: ['arquivo', 'onde', 'o_que_vi', 'por_que_importa', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'conferidos', 'medidas', 'problemas', 'veredito'] }

const DONOS = [
  { k: 'casca', arquivos: ['static/proto.js', 'static/style.css', 'proto_contrato.md'], p: `SUA TAREFA: DONO 1 — a casca comum, em \`static/proto.js\` e \`static/style.css\` (e o contrato \`proto_contrato.md\`, onde voce publica o que criou).
1. DADO ATIVO: a casca passa a desenhar a partir de um objeto de dado recebido (ex.: ptRender(cfg) com {dado, alvo, prefixo_de_id, rotulos}), e nao lendo PROTO direto. Mantenha um atalho que faz a aba Prototipo continuar chamando do mesmo jeito. Liste no contrato cada leitura direta de PROTO que ainda existir em proto_a/b/c.js (sao de outros donos: nao edite, so liste com arquivo:linha) e a funcao que eles devem usar (ex.: ptDado()).
2. ESTADO POR ABA e PREFIXO DE ID: duas abas podem existir na mesma pagina sem ids repetidos (ptEt-N) e sem cache de modulo misturando dados (liste os caches de proto_a/b/c que precisarao ser zerados e de o gancho: ptAoTrocarDado ou similar).
3. VOCABULARIO DE FAIXA centralizado (ex.: ptFx(chave) / ptFxRot(faixa)): a aba Prototipo continua dizendo "quem subiu / meio / quem caiu"; com dado que tenha \`faixas.rotulos\` (PONTOS), a mesma funcao devolve os rotulos de la. So o mecanismo e os nomes; o mapeamento das ~200 chaves vem depois, quando o pontos.json fechar.
4. LEGENDA DAS MATRIZES (item 11): ajudante ptLegendaPosto() que diz com todas as letras que o numero da celula e a POSICAO NO RANKING DO ANO (0 a 100), nao o valor.
5. ESCALA PERCENTIL / VALOR CRU (item 9): estado por aba, API (ex.: ptEscala(), ptAoMudarEscala(fn), ptRegistrarEtapaComEscala(n)) e UM botao por aba, que so aparece quando ao menos uma etapa registrada suporta a escala (botao que nao faz nada nao pode aparecer). No cru, a legenda avisa que o valor cru mistura anos e que a cor e a ordem continuam as do percentil.
6. CONCLUSOES (itens 5 e 18): o componente unico ptConclusao(c) (selo com todas as letras antes da frase, numero simples, "o que nao quer dizer", link para a etapa) e os slots ptConclusoesTopo(dado) e ptConclusaoDaEtapa(dado, n). Hoje o dado ainda nao tem o bloco \`conclusoes\`: os slots escrevem a ausencia com motivo de modo discreto (uma linha), sem quebrar nada. Leia \`_fonte/prototipo/conclusoes_spec.json\` (SO LEITURA) para o formato esperado.
7. GLOSSARIO: ptNomeMedida / ptNomeIndicador passam a consultar, nesta ordem, o campo do gerador (indicadores[].nome_simples/unidade/definicao, se existir), \`PT_GLOSSARIO\` via \`ptGlossario(id)\` (arquivo novo de outro dono, carregado ANTES do proto.js; pode nao existir — fallback silencioso) e o nome atual. Corrija no PT_MEDIDA_CHAVE as duas divergencias medidas no mapa do glossario (finalizacao nao e "aproveitamento das finalizacoes": a conta e gols por jogo menos xG; aprovZ6: confira a conta no codigo e escreva o que ela e).
8. LARGURA (item 14): a aba ocupa a largura disponivel (sem o teto de 1.240 px, com respiro lateral), sumario lateral estreito e fixo, cabecalho de tabela QUEBRA LINHA, numero (.num) continua sem quebrar, texto de celula quebra, prosa (.pt-sub, .pt-nota) com largura de leitura (~75 caracteres), classe de celula compacta para matrizes. Publique no contrato as classes novas que os donos das etapas devem usar (matriz compacta, miniaturas da etapa 6, barra de filtros, separador da linha da sorte, marca de empate tecnico, bloco de conclusao).
Teste: \`node --check\` nos arquivos; se possivel, um teste headless (Playwright do Python, pagina servida em porta livre >= 5095, derrubada ao fim) com zero erro de console e as 16 etapas do Prototipo desenhadas.` },
  { k: 'glossario', arquivos: ['static/proto_glossario.js'], p: `SUA TAREFA: DONO 2 — o arquivo NOVO \`static/proto_glossario.js\` (itens 11, 13 e 17).
Ha um rascunho medido em \`${S}/glossario_rascunho.json\` (564 entradas, com a origem de cada uma) e o script que o montou em \`${S}/montar_glossario.py\`. Transforme em \`const PT_GLOSSARIO = {...}\` + \`function ptGlossario(id)\` (devolve null quando nao ha entrada).
Cada entrada: nome (curto, cabe em cabecalho de tabela: ate ~22 caracteres), nome_longo, mede (uma frase de reuniao), unidade, fonte (Wyscout time · Wyscout jogador com 600+ min · SkillCorner · Transfermarkt · calculado no projeto), lado ("mais e melhor" / "menos e melhor" / "sem lado bom declarado" — NUNCA impor lado que a fonte nao declara), fase (jogo inteiro / com a bola do time / sem a bola), por (por jogo / por 90 / por 30 min daquela fase / por minuto / pico / %), compara_com_por_90 (bool) e origem (arquivo:linha ou skill).
Antes de copiar, REABRA a fonte de uma amostra grande (pelo menos 60 entradas, espalhadas por todos os grupos: tecnico coletivo, elenco, fisico do elenco, fisico por setor, tecnico individual, apelidos da etapa 13, goleiro, resultado da etapa 10, dinheiro/eixos/tipologia, colunas das tabelas) e confira; conserte o que nao bater. Entradas sem fonte ficam com o campo marcado "nao_achei_fonte" — nunca inventadas. As regras de juntar jogadores (ponderada, mediana, top5) entram com a frase tirada do codigo que agrega em gerar_prototipo.py (so leitura).
Nomes simples no vocabulario da casa (leia static/proto.js e o PT_MEDIDA_CHAVE: nao crie um segundo nome para o que ja tem nome na tela; se o nome da tela estiver errado, anote em o_que_ficou_para_outro_dono).
No topo do arquivo, comentario em prosa: de onde vem, que nada foi inventado, e que as de fase (por 30 min) nao se comparam com as de 90.
Teste: \`node --check\`, e um script que carrega o arquivo em node e confere que todo id usado nas matrizes, no catalogo da etapa 2, na etapa 13 e nas tabelas de gaps de \`dados/prototipo.json\` e \`dados/pontos.json\` (SO LEITURA) tem entrada ou um motivo — diga quantos ficaram sem.` },
  { k: 'app-index', arquivos: ['static/app.js', 'templates/index.html'], p: `SUA TAREFA: DONO 6, so a parte inicial — mudancas minimas, sem mudar comportamento de nada que ja existe:
1. \`static/app.js\`: tirar os rotulos dos grupos de liga de dentro de montarChips para uma constante global \`GRUPOS_LIGA_ROTULOS\` (mesma ordem e mesmos textos de hoje), e expor os modos de nacionalidade como \`NACAO_MODOS\` (os mesmos valores do select de hoje), para proto_c.js reusar depois sem copiar logica. Leia o mapa "mapa:filtros" (onde: templates/index.html ~583-605; app.js GRUPOS_LIGA ~65-76, passaNacao/ehEstrangeiroBase ~233, montarChips, filtrar). Se existir filtro de idade reutilizavel, exponha do mesmo jeito (ex.: passaIdade), sem mudar o que a janela de busca faz.
2. \`templates/index.html\`: acrescentar \`<script src="...proto_glossario.js">\` ANTES do proto.js, no mesmo padrao das outras tags (url_for ou caminho, igual as vizinhas). Nada mais.
Nao registre abas novas agora (isso e o ultimo degrau).
Teste: \`node --check static/app.js\`; teste headless (Playwright do Python, pagina servida em porta livre >= 5095, derrubada ao fim) abrindo a janela "Escolher jogador" e trocando os grupos de liga: mesmo numero de linhas antes e depois da sua mudanca (compare com a versao do git HEAD servida do mesmo jeito, copiando para ${S}).` },
]

phase('Escrever')
const escritas = await parallel(DONOS.map(d => () => agent(`${CASA}

${d.p}

Arquivos que VOCE pode escrever: ${d.arquivos.join(', ')}. Nenhum outro.`,
  { label: 'dono:' + d.k, phase: 'Escrever', schema: ESCRITA, effort: 'high' }).then(r => r ? { ...r, k: d.k } : null)))
const ok = escritas.filter(Boolean)
log('escritos: ' + ok.map(e => `${e.k} (${e.arquivos_escritos.length} arq.)`).join(' · '))

phase('Conferir')
const RELATO = JSON.stringify(ok, null, 1).slice(0, 70000)
const LENTES = [
  { k: 'regressao-e-largura', p: `REGRESSAO E LARGURA, no navegador headless. Sirva a pagina numa porta livre >= 5095 (Playwright do Python; derrube ao fim; nunca 5090/5091). (1) Aba Prototipo: zero erro de console, as 16 etapas desenhadas, e compare com a versao do git HEAD (copie o HEAD para ${S} com \`git show HEAD:caminho\` e sirva igual): contagem de tabelas, graficos e blocos por etapa igual, textos iguais fora do que a tarefa mandou mudar. (2) Janela "Escolher jogador": mesmos resultados com os grupos de liga e a nacionalidade. (3) Largura a 1.785 px: quantas caixas com rolagem horizontal, e quais estouram (antes eram 31 de 44 — ver PENDENTE item 14), a largura da aba, do sumario e da caixa de conteudo; a prosa ficou com largura de leitura? (4) A 400 px, nada da pagina rola de lado fora das tabelas. (5) Os slots de conclusao e o botao de escala: aparecem so quando devem, sem numero digitado.` },
  { k: 'glossario-contra-fonte', p: `O GLOSSARIO CONTRA A FONTE. Sorteie (gerador fixo, anote a semente) 50 entradas de static/proto_glossario.js, estratificadas pelos grupos, e para cada uma reabra a origem citada: nome, frase, unidade, fonte, lado, fase e "por" batem com o codigo e com as skills dados-wyscout e dados-skillcorner (use a ferramenta Skill)? Procure em especial: lado imposto sem declaracao; unidade errada (por jogo x por 90 x por 30 min da fase); frase que afirma mais que a definicao; nome que duplica um nome ja usado na tela para outra coisa. Confira tambem a cobertura: ids usados nas duas bases sem entrada e sem motivo.` },
  { k: 'contrato-e-api', p: `O CONTRATO E A API. Leia proto.js, style.css, proto_contrato.md e o relato dos donos. Os donos das etapas (proto_a/b/c.js) vao conseguir fazer TUDO o que os mapas pedem sem mexer em proto.js ou style.css? Liste o que falta na API. O dado ativo esta de fato isolado (nenhuma leitura de PROTO dentro da casca fora do atalho)? Os caches de modulo e ids repetidos estao listados com arquivo:linha? O componente de conclusao segue o conclusoes_spec.json (selo com as cinco palavras da regua, "o que nao quer dizer", link da etapa)? O vocabulario de faixa cobre os rotulos de PONTOS.faixas.rotulos? As divergencias de PT_MEDIDA_CHAVE (finalizacao, aprovZ6) ficaram certas pela conta do codigo?` },
]
let confs = (await parallel(LENTES.map(l => () => agent(`${CASA}

Os tres donos escreveram. O relato deles:
${RELATO}

VOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em nenhum arquivo do projeto. SUA LENTE: ${l.p}`,
  { label: 'confere:' + l.k, phase: 'Conferir', schema: CONF, effort: 'high' }).then(r => r ? { ...r, k: l.k } : null)))).filter(Boolean)
const graves = cs => cs.flatMap(c => c.problemas.filter(p => ['quebra', 'mente', 'falta'].includes(p.gravidade)).map(p => ({ ...p, lente: c.k })))
const probs = graves(confs)
log(`conferencias: ${confs.map(c => c.k + ' ' + c.veredito).join(' · ')} · graves: ${probs.length}`)

let consertos = []
if (probs.length) {
  phase('Consertar')
  const donoDe = arq => DONOS.find(d => d.arquivos.some(a => arq.includes(a.replace('static/', '').replace('templates/', ''))))
  const porDono = {}
  for (const p of probs) { const d = donoDe(p.arquivo || ''); const k = d ? d.k : 'casca'; (porDono[k] = porDono[k] || []).push(p) }
  const detalhes = confs.flatMap(c => c.problemas.filter(p => p.gravidade === 'detalhe').map(p => ({ ...p, lente: c.k })))
  consertos = (await parallel(Object.entries(porDono).map(([k, ps]) => () => {
    const d = DONOS.find(x => x.k === k)
    return agent(`${CASA}

${d.p}

Arquivos que VOCE pode escrever: ${d.arquivos.join(', ')}. Nenhum outro.

RODADA DE CONSERTO. Os conferentes acharam nos seus arquivos:
${JSON.stringify(ps, null, 1).slice(0, 40000)}
Detalhes (conserte se forem seus e baratos): ${JSON.stringify(detalhes.filter(p => { const dd = donoDe(p.arquivo || ''); return (dd ? dd.k : 'casca') === k }), null, 1).slice(0, 15000)}
Confirme cada problema antes (o conferente pode ter errado: se errou, diga por que). Depois de consertar, rode de novo o seu teste.`,
      { label: 'conserta:' + k, phase: 'Consertar', schema: ESCRITA, effort: 'high' }).then(r => r ? { ...r, k } : null)
  }))).filter(Boolean)
  const reconf = await agent(`${CASA}

RECONFERENCIA depois do conserto. Problemas graves apontados antes:
${JSON.stringify(probs, null, 1).slice(0, 40000)}
Relato dos consertos:
${JSON.stringify(consertos, null, 1).slice(0, 40000)}
Confira cada problema (resolvido de verdade?), rode de novo o teste headless de regressao da aba Prototipo e da janela de busca (porta livre >= 5095, derrubada ao fim) e procure o que o conserto quebrou. Voce NAO escreve em arquivo do projeto.`,
    { label: 'reconfere', phase: 'Consertar', schema: CONF, effort: 'high' })
  confs = confs.concat(reconf ? [{ ...reconf, k: 'reconferencia' }] : [])
}

return { escritas: ok, conferencias: confs, consertos }
