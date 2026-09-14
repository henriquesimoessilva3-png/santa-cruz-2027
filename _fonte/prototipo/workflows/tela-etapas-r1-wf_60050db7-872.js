export const meta = {
  name: 'tela-etapas-r1',
  description: 'Metade tela, segundo degrau: proto_a/b/c.js migram para a casca nova e fazem os pedidos que nao dependem do gerador; casca e glossario fecham os restos; conferencia headless e de linguagem',
  phases: [
    { title: 'Escrever', detail: 'quatro donos de arquivo em paralelo' },
    { title: 'Conferir', detail: 'regressao e largura; pedido a pedido; linguagem e numero digitado' },
    { title: 'Consertar', detail: 'uma rodada por dono com problema grave, e reconferencia' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'
const MAPA = S + '/mapa_rodada.json'
const TELA1 = S + '/tela1_journal.json'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B. App Flask (\`app.py\`, \`templates/index.html\`, \`static/app.js\`).
A aba "Prototipo" desenha 16 etapas: \`static/proto.js\` (casca comum), \`static/proto_a.js\` (etapas 0-4), \`static/proto_b.js\` (5-8), \`static/proto_c.js\` (9-15), \`static/style.css\`, glossario \`static/proto_glossario.js\`. Dados: global PROTO (\`static/prototipo.js\`) e, para a aba nova por faixa de pontos, PONTOS (\`static/pontos.js\`).
LEIA ANTES, INTEIROS: \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\` (inclusive "Decisoes do dono em 14/09"), \`${RAIZ}/_fonte/prototipo/PENDENTE_RODADA.md\`, e o CONTRATO \`${RAIZ}/static/proto_contrato.md\` (reescrito hoje: a API da casca, §8 e §9 com as leituras de PROTO, ids fixos e caches por arquivo:linha, §10 com as classes CSS novas e as 5 caixas que ainda rolam de lado). O primeiro degrau da tela ja rodou: relato em \`${TELA1}\` (lista [rotulo, retorno]; leia o 'dono:casca', o 'conserta:casca' e o 'reconfere'). O mapa da rodada: \`${MAPA}\` (chaves "mapa:tela", "mapa:filtros", "mapa:glossario", "critico-do-plano").

O QUE ESTE DEGRAU FAZ: so o que NAO depende do gerador do Prototipo. O gerador ainda vai gravar: etapa_5 faixa_sobe e faixa_*_bruto, ranking_gaps, conclusoes, nac/psp nos candidatos, etapa_14 contada por posicao com empate tecnico, etapa_6.mesmo_ano, curva_top_k.ks_da_tabela, indicadores[].unidade/definicao. NAO desenhe esses blocos agora (nem com ausencia): ficam para o proximo degrau. Excecao combinada: a barra de filtros da etapa 13/14 ja entra com liga e idade, e o filtro de nacionalidade aparece desabilitado com o motivo ("a nacionalidade entra na proxima geracao do dado") e passa a funcionar sozinho quando os campos existirem.

REGRAS (valem sempre):
- UM DONO POR ARQUIVO. Voce escreve SO nos seus. Precisa de algo na casca que nao existe? Use o que ha e anote em o_que_ficou_para_outro_dono; NAO edite proto.js/style.css se nao for o dono deles.
- A aba Prototipo continua funcionando, com zero erro no console. Toda leitura de PROTO passa por ptDado(); todo id fixo passa por ptId(); cache de modulo zera em ptAoTrocarDado.
- Texto de tela em portugues de reuniao de clube, vocabulario de proto.js (ptTamanho, ptAcaso, ptSorte, ptJunto, ptAcerto, ptTecnico); numero tecnico so ao lado, menor. Simplificar nunca e afirmar mais; "pode ser sorte", amostra pequena e empate continuam na tela.
- NENHUM numero digitado na tela: tudo sai do dado. Ausencia sempre escrita com motivo.
- "Tudo aberto, sem clicar" (item 4) nas etapas pedidas; sem rolagem lateral a 1.785 px; a 400 px nada cortado.
- Teste headless com Playwright do Python, servindo o app numa porta PROPRIA (a sua esta no fim da tarefa), por pasta-espelho no ${S} se precisar, e derrube ao fim. \`node --check\` nos seus arquivos.
PROIBIDO: qualquer git que escreva (commit, push, add, reset, checkout, stash, revert, tag). Git so leitura.
NAO EDITE: \`gerar_*.py\`, \`ranking_gaps.py\`, \`dados/*\`, \`static/prototipo.js\`, \`static/pontos.js\`, \`_fonte/prototipo/CONCLUSOES.md\`, \`_fonte/prototipo/conclusoes_spec.json\`, \`templates/index.html\`, \`static/app.js\` (outras rodadas estao nesses arquivos AGORA). NAO use nem derrube as portas 5090 e 5091.`

const ESCRITA = { type: 'object', properties: {
  arquivos_escritos: { type: 'array', items: { type: 'string' } },
  o_que_fiz: { type: 'array', items: { type: 'object', properties: { pedido: { type: 'string' }, onde: { type: 'string' }, como: { type: 'string' } }, required: ['pedido', 'onde', 'como'] } },
  o_que_ficou_para_o_proximo_degrau: { type: 'array', items: { type: 'string' } },
  o_que_ficou_para_outro_dono: { type: 'array', items: { type: 'string' } },
  como_testei: { type: 'string' },
  riscos: { type: 'array', items: { type: 'string' } },
}, required: ['arquivos_escritos', 'o_que_fiz', 'o_que_ficou_para_o_proximo_degrau', 'o_que_ficou_para_outro_dono', 'como_testei', 'riscos'] }

const CONF = { type: 'object', properties: {
  lente: { type: 'string' }, conferidos: { type: 'integer' }, medidas: { type: 'string' },
  problemas: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, onde: { type: 'string' }, o_que_vi: { type: 'string' }, por_que_importa: { type: 'string' }, conserto: { type: 'string' },
    gravidade: { type: 'string', enum: ['quebra', 'mente', 'falta', 'detalhe'] },
  }, required: ['arquivo', 'onde', 'o_que_vi', 'por_que_importa', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'conferidos', 'medidas', 'problemas', 'veredito'] }

const DONOS = [
  { k: 'proto_a', arquivos: ['static/proto_a.js'], porta: 5101, p: `SUA TAREFA: dono de \`static/proto_a.js\` (etapas 0 a 4).
1. Migracao para a casca (contrato §9): as leituras de PROTO (l.164, 218, 338, 929, 1277, 1528 na versao de hoje — confira) por ptDado(); as frases que citam "PROTO" por ptArquivoDado(); os ids fixos (ptEt-2-busca, pilar, familia, setor, porta, limpar, caixa, inclusive o <style> inline) por ptId(); PA_ET2 zerado em ptAoTrocarDado; chaves com sobe/meio/cai/SM/SC por ptK/ptFx/ptCaminho onde a casca oferece.
2. Tirar o \`max-width:none\` das tres .pt-nota da etapa 1 (a prosa volta a largura de leitura).
3. Item 14, etapa 2: o catalogo tem 31 colunas e 5.586 px numa caixa de ~1.509. Compacte para ~12 colunas: pares numa celula (bruto -> descontado; sobe · meio · cai), o tecnico no numero pequeno (ptTecnico) ou na dica, cabecalho curto do glossario (ptNomeCurto), classes do contrato §10. Sem rolagem lateral a 1.785 px. Nenhuma informacao some: o que sai da coluna vai para a dica ou para o numero pequeno.
4. Item 17a: "serve para contratar" no filtro e na celula do selo (paPorta, paMotivoSelo): trocar pelo MOTIVO medido ("se repete de um ano para o outro e vem antes do resultado"), nunca por receita. (O texto PT_PORTAS_TXT mora em proto.js, que e de outro dono: so ajuste o que e seu e anote.)
5. Item 4 nas suas etapas, se houver algo fechado em <details> ou atras de clique que o PENDENTE mande abrir.
NAO faca agora (proximo degrau, depende do gerador): tabela 4·6·8·9 do item 1 e a tabela de gaps do item 6.
Sua porta de teste: 5101.` },
  { k: 'proto_b', arquivos: ['static/proto_b.js'], porta: 5102, p: `SUA TAREFA: dono de \`static/proto_b.js\` (etapas 5 a 8).
1. Migracao para a casca (contrato §9): PROTO (l.31, 62, 275, 315) por ptDado(); PB_NOMES zerado em ptAoTrocarDado; ids ptEt-5-painel/lupa e ptEt-6-sel/graf por ptId(); PB_FAIXA_COR/PB_FAIXA_TXT e textos "quem subiu/caiu" pelo vocabulario de faixa (ptFx/ptFxRot/ptK).
2. Etapa 5: as 11 matrizes EMPILHADAS e abertas (item 4), com a classe pt-matriz, cabecalho curto do glossario (ptNomeCurto, vertical ou em 2-3 linhas), celula compacta e a legenda ptLegendaPosto() em toda matriz (item 11: o numero e a POSICAO NO RANKING DO ANO, 0 a 100). Alvo: sem rolagem lateral a 1.785 px (hoje 2.673 px). As regras de juntar jogadores ("ponderada", "mediana", "top5") com o nome e a frase tirados do codigo que agrega em gerar_prototipo.py (so leitura) ou do glossario (item 17c). O botao percentil/cru e a linha da faixa de quem subiu ficam para o proximo degrau (dependem do gerador).
3. Etapa 6 (itens 4 e 10, a parte que nao depende do gerador): as 73 dispersoes em miniatura, abertas, numa grade (pt-minis), com a mesma escala global; COR NEUTRA (a cor de desfecho do ano seguinte engana) e titulo-pergunta dizendo com todas as letras que a pergunta e a DIAGONAL — o time que estava alto num ano continua alto no outro — e que a cor nao responde isso; o rho de persistencia de cada uma, do dado. Para os indicadores que a etapa 10 marca como consequencia do resultado (lidos do dado, nao digitados), o aviso no proprio grafico. A relacao do mesmo ano ao lado fica para o proximo degrau (o gerador grava etapa_6.mesmo_ano).
4. Etapa 7 (item 12): o proprio grafico carrega as quatro respostas, montadas do dado: por que dividir o turno (unica etapa em que o numero vem ANTES dos pontos com que se compara; rodadas lidas do dado); os dois circulos (vazado = numero do 1o turno com os pontos do 2o; cheio = so entre times com pontos parecidos no 1o turno; o traco = quanto era so "time bom continua bom"); a linha verde (os proprios pontos do 1o turno — nenhum numero chega nela, calculado); as cores (azul, cinza, laranja) e quantos passariam por sorte entre os testados contra quantos passaram (calculado do dado, nunca "4 de 28" digitado).
5. Etapa 8: tirar a leitura por p_um_contra_o_resto < corte quando o dado disser outra coisa? So se o seu codigo recalcula firmeza que o dado ja grava — use o status gravado.
Sua porta de teste: 5102.` },
  { k: 'proto_c', arquivos: ['static/proto_c.js'], porta: 5103, p: `SUA TAREFA: dono de \`static/proto_c.js\` (etapas 9 a 15).
1. Migracao para a casca (contrato §9): PROTO (l.42, 48, 58-59, 85, 1235-1236, 1485-1486) por ptDado(); PC.catalogo, PC.clubes, PC.clubesMotivo, PC.et12/13/14 zerados em ptAoTrocarDado; PC_GRUPOS pelo vocabulario de faixa; ids fixos por ptId().
2. Item 14, etapa 9: as tabelas ptEt-9-crus-3/-6/-7 (1.530, 2.347, 2.221 px) sao TEXTO sem quebra: coluna de texto quebra linha, classes do contrato §10. Sem rolagem lateral a 1.785 px. Etapas 10 e 13: cabecalho que quebra, padding menor, colunas tecnicas no numero pequeno.
3. Item 4: etapas 12 (degraus abertos), 13 (setores empilhados, alvos e candidatos) e 14 (as seis propostas empilhadas) abertas, sem clicar. Cuide do peso: 603 candidatos — mantenha a tabela com rolagem vertical propria se preciso, nunca lateral.
4. Item 13: na tabela "O alvo de cada setor", os apelidos fisicos (spn_s, obr_area, psv5, hi_s...) viram nome simples e frase pelo glossario (ptNomeCurto/ptDicaMedida), com a marca de fase ("por 30 min daquela fase: nao compare com os de 90 min"); as colunas explicadas em portugues ("d por clube" = tamanho da diferenca contando o CLUBE como um caso; "passa por atleta" = teste antigo que conta cada atleta e passa mais facil, fica so como comparacao; a coluna do atleta tipico: CONFIRA em gerar_prototipo.py alvos_fisicos o que pct_sobe e — posicao media ou percentil — antes de escrever a frase); o aviso de amostra montado de _n_clube_por_cenario (quantos clubes por cenario, do dado).
5. Item 15: barra de filtros (pt-filtros/pt-chip do contrato §10) nas tabelas de candidatos da etapa 13 (quatro setores e trilha do goleiro) e nas listas de nomes da etapa 14, FORA da area que e redesenhada (senao o campo perde o foco), com ids proprios por ptId: grupos de liga reusando GRUPOS_LIGA / GRUPOS_LIGA_ROTULOS / ligasDoGrupo do app.js (carregado antes? confira a ordem dos <script> no index.html; se nao estiver, anote); idade minima e maxima; nacionalidade com NACAO_MODOS/passaNacao do app.js, DESABILITADA com motivo enquanto os candidatos nao tiverem nac (e psp), ativando sozinha quando tiverem. Padrao ao abrir: "Todas as ligas". O botao Europa aparece com 0 e o motivo. Os empates e a contagem do cabecalho ("N candidatos, K valores distintos") recontados sobre o que ficou visivel, dizendo quanto foi escondido. Escreva na tela que o filtro so esconde linhas: nao refaz a proposta.
6. Item 16.3 (a parte que nao depende do gerador): ao lado das tabelas de vagas da etapa 14, o aviso montado de etapa_13.backtest com o mesmo veredito calculado de pcEt13Desenhar — "lista para observar, nao recomendacao; a nota nao separou quem rendeu depois de chegar". Nao confunda validacao_de_volta (perfil do elenco) com backtest (nota x minutos). A marca de empate tecnico e a contagem por posicao vem no proximo degrau.
Sua porta de teste: 5103.` },
  { k: 'casca_glossario', arquivos: ['static/proto.js', 'static/style.css', 'static/proto_contrato.md', 'static/proto_glossario.js'], porta: 5104, p: `SUA TAREFA: dono de \`static/proto.js\`, \`static/style.css\`, \`static/proto_contrato.md\` e \`static/proto_glossario.js\` nesta rodada. OUTROS TRES DONOS estao escrevendo proto_a/b/c.js AGORA usando a API publicada no contrato: so mudancas ADITIVAS na API, nenhum nome publicado muda ou some.
1. O grave que sobrou no reconfere do degrau anterior: a correcao de nome so trocou \`nome\`; \`curto\` e \`nome_longo\` continuam errados. Medido: ptNomeCurto('fis_zaga_psv99') devolve "Velocidade maxima" e ptNomeCurto('gk_def') "Defesas". O psv99 do SkillCorner NAO e a maior velocidade: e o pico MEDIO por jogo (skill dados-skillcorner; correcao de fato registrada no CLAUDE.md de Analytics em 28/08). Conserte em TODAS as entradas e nos tres campos (nome, curto, nome_longo, mede), e confira a coerencia dos tres campos em todas as 616 entradas por script.
2. Item 17a: "serve para contratar" em PT_PORTAS_TXT (proto.js) vira o MOTIVO medido ("se repete de um ano para o outro e vem antes do resultado"), nunca receita.
3. Os detalhes que ficaram do degrau anterior (em ${TELA1}, 'confere:*' e 'reconfere'): PT_CONCL_AUSENTE sem crases nem nome de chave na tela e discreto (uma vez no topo; nas etapas, nada ou uma marca curta); .pt-escala escondida de verdade quando hidden; ptMudarEscala nao pode deixar a aba em "cru" sem botao; opcao \`ordenavel:false\` por coluna e por tabela em ptTabela (a tabela de gaps precisa); ptConclusoesDo devolvendo tambem temas e descartadas; ptTabela/ptNomeIndicador/ptSorte aceitando elemento opcional; PT_SELOS preferindo a explicacao da regua do dado quando existir; um slot ptUniverso(dado, n) para "de que universo veio / o que mudou nesta aba" (PONTOS grava etapa_N.universo, estado_nesta_aba, o_que_mudou), que na aba Prototipo nao mostra nada. NAO mexa em ptCascaContagemFaixas para PONTOS agora: a etapa 0 do pontos.json esta sendo reestruturada neste momento.
4. Atualize o contrato com o que for acrescentado.
Sua porta de teste: 5104.` },
]

phase('Escrever')
const escritas = (await parallel(DONOS.map(d => () => agent(`${CASA}

${d.p}

Arquivos que VOCE pode escrever: ${d.arquivos.join(', ')}. Nenhum outro.`,
  { label: 'dono:' + d.k, phase: 'Escrever', schema: ESCRITA, effort: 'high' }).then(r => r ? { ...r, k: d.k } : null)))).filter(Boolean)
log('escritos: ' + escritas.map(e => e.k).join(', ') + (escritas.length < DONOS.length ? ` · FALTOU: ${DONOS.filter(d => !escritas.find(e => e.k === d.k)).map(d => d.k).join(', ')}` : ''))

phase('Conferir')
const RELATO = JSON.stringify(escritas, null, 1).slice(0, 80000)
const LENTES = [
  { k: 'regressao-e-largura', porta: 5105, p: `REGRESSAO E LARGURA no navegador headless (sua porta: 5105; derrube ao fim). Compare com a versao do git HEAD (copie para ${S} com git show e sirva igual, porta 5106). (1) Aba Prototipo: zero erro de console, 16 etapas, e etapa a etapa o que mudou (tabelas, graficos, linhas, textos): so pode mudar o que os pedidos mandaram; nenhum numero pode ter sumido ou mudado. (2) A 1.785 px: quantas caixas rolam de lado (eram 5 de 44), largura da aba e da prosa. (3) A 400 px: nada cortado fora de caixa com rolagem. (4) Tempo de desenho da aba e peso do DOM antes e depois (tudo aberto pesa: diga se ficou lento). (5) Janela "Escolher jogador" do app intacta. (6) Troca de dado: ative uma aba com PONTOS pela API da casca (ptRender com outro prefixo e alvo, num div criado no teste) e verifique que nenhuma etapa le PROTO por baixo (numeros diferentes onde o dado difere; ids sem colisao).` },
  { k: 'pedido-a-pedido', porta: 5107, p: `PEDIDO A PEDIDO (sua porta: 5107; derrube ao fim). Para cada pedido que os donos dizem ter feito (itens 4, 10 parte 1, 11, 12, 13, 14, 15 parte 1, 16.3 parte 1, 17a, 17c e a migracao), abra a etapa no navegador headless e confira contra o texto do PENDENTE_RODADA.md: esta feito de verdade, como o dono pediu? Filtros da etapa 13/14: aplique combinacoes (liga, idade), conte linhas, confira a recontagem do cabecalho e dos empates contra uma conta sua sobre o dado; o campo nao perde o foco ao digitar; Europa com 0 e motivo; nacionalidade desabilitada com motivo. Etapa 7: as quatro respostas estao no grafico e os numeros batem com o dado. Etapa 13: pct_sobe descrito como o que o gerador realmente calcula (leia alvos_fisicos).` },
  { k: 'linguagem-e-numero', porta: 0, p: `LINGUAGEM E NUMERO DIGITADO, lendo o codigo dos quatro donos (sem servidor). (1) Todo numero que aparece em texto de tela sai do dado? Cace literais numericos em strings de tela (ex.: "4 de 28", "16 que", "63,8%", "73", "11 matrizes", "1.785"). (2) Jargao fora do numero pequeno: p, d, rho, q, BH, AUC, percentil solto, "liquido". (3) Frase que afirma mais que o dado, receita ("serve para contratar", "contrate"), "nunca" sem zero excecao, "nao separa" onde e "nao se viu". (4) Nomes duplicados: a mesma coisa com dois nomes entre etapas, ou dois indicadores com o mesmo nome (use o glossario). (5) psv99 descrito como velocidade maxima em qualquer lugar. Liste arquivo:linha.` },
]
let confs = (await parallel(LENTES.map(l => () => agent(`${CASA}

Os quatro donos escreveram. O relato:
${RELATO}

VOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em nenhum arquivo do projeto. SUA LENTE: ${l.p}`,
  { label: 'confere:' + l.k, phase: 'Conferir', schema: CONF, effort: 'high' }).then(r => r ? { ...r, k: l.k } : null)))).filter(Boolean)
const graves = cs => cs.flatMap(c => c.problemas.filter(p => ['quebra', 'mente', 'falta'].includes(p.gravidade)).map(p => ({ ...p, lente: c.k })))
const probs = graves(confs)
log(`conferencias: ${confs.map(c => c.k + ' ' + c.veredito).join(' · ')} · graves: ${probs.length}`)

let consertos = [], reconf = null
if (probs.length) {
  phase('Consertar')
  const donoDe = arq => { const a = (arq || '').toLowerCase(); return DONOS.find(d => d.arquivos.some(x => a.includes(x.split('/').pop().toLowerCase()))) }
  const porDono = {}
  for (const p of probs) { const d = donoDe(p.arquivo); const k = d ? d.k : 'casca_glossario'; (porDono[k] = porDono[k] || []).push(p) }
  const detalhes = confs.flatMap(c => c.problemas.filter(p => p.gravidade === 'detalhe'))
  const portas = { proto_a: 5111, proto_b: 5112, proto_c: 5113, casca_glossario: 5114 }
  consertos = (await parallel(Object.entries(porDono).map(([k, ps]) => () => {
    const d = DONOS.find(x => x.k === k)
    return agent(`${CASA}

${d.p}

Arquivos que VOCE pode escrever: ${d.arquivos.join(', ')}. Nenhum outro. Sua porta de teste nesta rodada: ${portas[k]}.

RODADA DE CONSERTO. Os conferentes acharam nos seus arquivos:
${JSON.stringify(ps, null, 1).slice(0, 40000)}
Detalhes (conserte os seus, se baratos): ${JSON.stringify(detalhes.filter(p => { const dd = donoDe(p.arquivo); return (dd ? dd.k : 'casca_glossario') === k }), null, 1).slice(0, 12000)}
Confirme cada problema antes (o conferente pode ter errado: diga por que). Depois rode de novo o seu teste.`,
      { label: 'conserta:' + k, phase: 'Consertar', schema: ESCRITA, effort: 'high' }).then(r => r ? { ...r, k } : null)
  }))).filter(Boolean)
  reconf = await agent(`${CASA}

RECONFERENCIA depois do conserto (sua porta: 5115; derrube ao fim). Problemas graves apontados antes:
${JSON.stringify(probs, null, 1).slice(0, 40000)}
Relato dos consertos:
${JSON.stringify(consertos, null, 1).slice(0, 40000)}
Confira cada problema (resolvido de verdade?), rode de novo a regressao headless da aba Prototipo (16 etapas, zero erro, caixas que rolam a 1.785 px, nada cortado a 400 px) e procure o que o conserto quebrou. Voce NAO escreve em arquivo do projeto.`,
    { label: 'reconfere', phase: 'Consertar', schema: CONF, effort: 'high' })
}
return { escritas, conferencias: confs, consertos, reconferencia: reconf }
