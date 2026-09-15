export const meta = {
  name: 'etapa6-mesmo-ano',
  description: 'Etapa 6 no desempenho do MESMO ano (posicao no indicador x aproveitamento, cor pela faixa do ano, forca e sorte, ordem da mais forte), ajustes pequenos da etapa 5, conferencia adversarial e gravacao do dado',
  phases: [
    { title: 'Gerar e mapear', detail: 'gerador no rascunho (etapa_6.mesmo_ano + frase dos dois clubes) e mapa do que fica falso nas telas' },
    { title: 'Telas', detail: 'proto_b.js (etapa 6 nova + etapa 5) e donos dos outros arquivos apontados pelo mapa' },
    { title: 'Conferir', detail: 'numeros refeitos por fora, tela no navegador, linguagem' },
    { title: 'Consertar', detail: 'uma rodada, por dono de arquivo' },
    { title: 'Gravar', detail: 'dados/prototipo.json + static/prototipo.js, diff e regressao' },
    { title: 'Conferir final', detail: 'app real com o dado gravado; conserto final so do que quebra ou mente' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Ranking/1abbf5c7-a19a-4f3a-89c2-26d0445cdbba/scratchpad'
const W = S + '/etapa6'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B, aba Prototipo: dado global PROTO (\`static/prototipo.js\`, copia de \`dados/prototipo.json\`, gerado por \`gerar_prototipo.py\`; copia por \`gerar_prototipo_js.py\`), telas \`static/proto.js\` (casca), \`proto_a.js\` (etapas 0-4), \`proto_b.js\` (5-8), \`proto_c.js\` (9-15), \`style.css\`, \`proto_glossario.js\` (gerado); contrato \`static/proto_contrato.md\`.
LEIA ANTES: \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\` (secoes 2.1, 2.4 itens 1 e 6, 4 e 5) e o contrato. Historico do grafico: \`_fonte/prototipo/PENDENTE_RODADA.md\` item 10.

PEDIDO DO DONO (14/09, DECIDIDO, nao reabrir): a etapa 6 deixa de ser "isso se repete no ano seguinte?". O dono: "nao quero esse foco de construir; quero foco em subida para o ano; a construcao e sempre para o ano". Cada miniatura vira POSICAO DO TIME NO INDICADOR (horizontal) x APROVEITAMENTO DE PONTOS NO MESMO ANO (vertical), as 80 temporadas 2022-2025, AZUL CLARO quem subiu e LARANJA quem caiu NAQUELE ano (cinza o meio), com a FORCA DA RELACAO escrita (e se pode ser sorte), e as miniaturas ORDENADAS DA MAIS FORTE PARA A MAIS FRACA. SEM a pergunta "se repete no ano seguinte" na etapa 6 — nem como numero pequeno: sai da tela da etapa 6 a diagonal, o rho de um ano para o outro, a comparacao com o valor do elenco de um ano para o outro (referencia_dinheiro) e o card do truncamento dos pares. O gerador grava \`etapa_6.mesmo_ano\` declarado ANTES de medir; \`proto_b.js\` desenha.
DECISAO DO DONO SOBRE REPETICAO (14/09, noite): fora da etapa 6 a repeticao "mesmo clube no ano seguinte" tambem vai sair dos criterios (regua, porta A, frases), mas ISSO E OUTRA RODADA (item 3 do CONTINUAR §3). Nesta rodada NAO mexa em regua, selos, portas, catalogo, conclusoes nem desconto do dinheiro.

ESPECIFICACAO DO BLOCO \`etapa_6.mesmo_ano\` (regras da casa escolhidas pelo coordenador; declarar exatamente isto antes de medir):
- universo: as 80 temporadas clube-ano 2022-2025 do painel (d80). Uma lista \`temporadas\` com {ano, clube, faixa (a faixa interna do proprio ano: sobe/meio/cai), pts, jogos (V+E+D), aproveitamento_pct = 100*pts/(3*jogos)} na ordem (ano, clube).
- indicadores: os MESMOS que hoje tem dispersao na etapa 6 (familias tecnico_col, elenco, fisico_col_elenco — hoje 73). Para cada um: \`pontos[ind]\` = lista alinhada a \`temporadas\` com a posicao no ranking do ano (a mesma escala 0-100 das celulas da etapa 5, \`postos\`), null onde falta.
- forca: rho de Spearman entre posicao e aproveitamento_pct nas temporadas com valor; p bilateral; n. Menos de 20 temporadas com valor: rho null com motivo.
- conta dos muitos testes: q de Benjamini-Hochberg dentro dos indicadores desenhados; e a lista inteira: quantos tem p < 0,05 contra o sorteio (embaralhar o aproveitamento DENTRO de cada ano, 10.000 sorteios, gerador PROPRIO np.random.default_rng com semente fixa declarada, sem tocar no sorteio global — etapa nova que sorteia antes desloca as seguintes), com a mediana do sorteio e o p do excesso.
- ordem: \`ordem_por_forca\` = ids por |rho| decrescente, empate pelo id, null no fim; e \`regra_da_ordem\` escrita. A tela so le a ordem.
- \`regra\`/\`declaracao\`: o que se mede, a unidade, as cores pela faixa do MESMO ano, e os limites ditos: associacao no mesmo ano mistura causa e consequencia (time que esta ganhando joga diferente — quem separa e a etapa 7); o mesmo clube aparece em ate 4 temporadas (as 80 nao sao independentes); fisico cobre menos temporadas (n menor).
- NADA de ano seguinte dentro do bloco.
COMPATIBILIDADE OBRIGATORIA: \`gerar_pontos.py\` chama \`P.etapa_6(d80, postos, meta, pares)\` e \`ranking_gaps.py\`/\`proto_c.js\` (pcRhoDaEtapa6) e \`etapa_2\` (persist) leem \`etapa_6.rho\`. NAO mude a assinatura de etapa_6 e NAO remova rho/pares/dispersao/referencia_dinheiro/truncamento do JSON (so a TELA da etapa 6 deixa de mostra-los). Se o d80 de quem chama nao tiver pts/V/E/D, o bloco sai com ausencia e motivo, sem quebrar.

AJUSTES PEQUENOS (CONTINUAR §2.4 item 6): (a) etapa 5: contraste baixo do numero da diferenca no cabecalho das matrizes — medir e levar a >= 4,5:1 nos temas claro e escuro; (b) "−53 abaixo" repete sinal e palavra: com a palavra (acima/abaixo), sem sinal; (c) a frase dos jogadores em dois clubes conta jogador-ano como se fosse gente: sao 216 jogadores-ano e 204 pessoas distintas (medido em 14/09) — dizer os dois, CALCULADOS pelo gerador, nunca digitados.

REGRAS DA CASA: nenhum numero digitado na tela; ausencia com motivo; analise nova declarada no bloco antes de medir; portugues de reuniao de clube com o vocabulario unico de proto.js (ptJunto, ptSorte, ptTamanho, ptAcaso, ptAcerto, ptTecnico, ptFx/ptFxRot); associacao nunca vira receita; um dono por arquivo; set iterado vira sorted; comentario em prosa do por que; fora do main carregue \`G.DECL = G.carregar_declaracao()\` antes de montar_matriz; para rodar o main sem gravar no projeto troque G.SAIDA e use python3 -B; nenhuma leitura direta de PROTO nas telas (ptDado()).
ATENCAO — OUTRA SESSAO DO CLAUDE TRABALHA NO MESMO REPOSITORIO (abas Financeiro/Orcamento e Bola parada): ela escreve \`static/app.js\`, \`app.py\`, \`templates/index.html\`, \`static/bola_parada*\`, \`dados/premissas.json\`, \`dados/cenarios.json\`, \`docs/\` e faz commit e publicacao. VOCE NAO TOCA NESSES ARQUIVOS (nem para testar gravacao: SC_CENARIOS e SC_PREMISSAS sempre apontando para copias em ${W}).
PROIBIDO: qualquer git que escreva; publicar; tocar em \`gerar_pontos.py\`, \`dados/pontos.json\`, \`static/pontos.js\`, \`ranking_gaps.py\`. NAO use nem derrube as portas 5090 e 5091. Teste headless com Playwright do Python numa porta PROPRIA (a da sua tarefa), servidor derrubado ao fim. Rascunhos em ${W}.`

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

const MAPA = { type: 'object', properties: {
  textos_que_ficam_falsos: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, linha: { type: 'integer' }, texto_hoje: { type: 'string' }, por_que_fica_falso: { type: 'string' }, sugestao: { type: 'string' },
  }, required: ['arquivo', 'linha', 'texto_hoje', 'por_que_fica_falso', 'sugestao'] } },
  consumidores_do_dado: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, linha: { type: 'integer' }, chave: { type: 'string' }, efeito_se_mudar: { type: 'string' },
  }, required: ['arquivo', 'linha', 'chave', 'efeito_se_mudar'] } },
  frase_dois_clubes: { type: 'string' },
  cabecalho_etapa5: { type: 'string' },
  para_a_rodada_da_repeticao: { type: 'array', items: { type: 'string' } },
}, required: ['textos_que_ficam_falsos', 'consumidores_do_dado', 'frase_dois_clubes', 'cabecalho_etapa5', 'para_a_rodada_da_repeticao'] }

const J = (x, n) => JSON.stringify(x, null, 1).slice(0, n)

/* ---------------- 1. gerador no rascunho + mapa ---------------- */
phase('Gerar e mapear')
const P_GERADOR = `SUA TAREFA: dono de \`gerar_prototipo.py\` (e so dele; se a declaracao da casa mora em outro arquivo que o gerador le via carregar_declaracao, esse arquivo tambem e seu — diga qual).
1. DECLARE o bloco \`etapa_6.mesmo_ano\` pelo mecanismo de declaracao da casa ANTES de escrever o codigo que mede (exatamente a especificacao acima: universo, eixos, rho/p/n, minimo de 20, BH, sorteio dentro do ano com gerador proprio e semente, ordem, cores, limites).
2. Implemente dentro de etapa_6 sem mudar a assinatura, com as chaves: temporadas, pontos, rho_mesmo_ano (por indicador: rho, p, q, n, ou rho null + motivo), lista_inteira (n_testes, com_p_menor_005, mediana_sorteio, p_excesso, sorteios, semente), ordem_por_forca, regra_da_ordem, regra. Se d80 nao tiver pts/V/E/D, \`mesmo_ano\` = {ausente: true, motivo}.
3. A frase dos jogadores em dois clubes (regra do bloco ponderado_por_jogador da etapa 1, perto da linha 996, ou onde estiver): jogadores-ano E pessoas distintas, os dois calculados.
4. Rode o main NO RASCUNHO (G.SAIDA = ${W}/prototipo_e6.json; python3 -B), duas vezes com PYTHONHASHSEED 1 e 2: tem de dar identico. Diff caminho a caminho contra o dados/prototipo.json gravado: SO podem mudar etapa_6.mesmo_ano (novo) e a frase da etapa 1 (e a declaracao, se ela vai no JSON). Qualquer outra diferenca (principalmente numero de sorteio de etapa posterior) e defeito seu.
5. Compatibilidade com gerar_pontos.py SEM rodar o pipeline dele nem gravar nada: leia como ele monta o d80 e chame P.etapa_6 com um d80 no formato dele (ou o proprio, se for barato) num script em ${W}; diga se sai mesmo_ano ou ausencia, sem erro.
6. NAO grave dados/prototipo.json (a gravacao e de outra etapa, depois das telas).
Devolva em chaves_do_json as chaves exatas com um exemplo curto; em numeros_principais: as 10 mais fortes (id, rho, p, q, n), as 5 mais fracas, a lista inteira (quantos com p<0,05, mediana do sorteio, p do excesso) e os dois numeros da frase dos dois clubes.`

const P_MAPA = `SUA TAREFA (so leitura, nao edite nada): mapear o que esta rodada torna FALSO ou quebra.
(a) Todo texto de tela ou doc que apresenta a etapa 6 como "isso se repete?", "ano seguinte", "diagonal", "persistencia", ou que manda o leitor ver a repeticao na etapa 6: proto.js (titulos/PT_ETAPAS/sumario/casca), proto_a.js, proto_b.js (fora da funcao ptEtapa6, que sera reescrita inteira — ex.: o texto da etapa 7 perto da linha 1247, a etapa 8), proto_c.js (pcRhoDaEtapa6 e onde e usado na tela), proto_glossario.js, proto_contrato.md. Arquivo, linha, texto, por que fica falso e sugestao de texto novo em portugues de reuniao.
(b) Todo consumidor de chaves de etapa_6 no codigo (py e js), para o gerador nao quebrar ninguem.
(c) Onde mora a frase dos jogadores em dois clubes (gerador e tela) e como esta escrita hoje.
(d) Como o cabecalho da diferenca da etapa 5 e desenhado hoje (funcao, classe, cor, tamanho) e o contraste medido no navegador headless (porta 5180, derrube ao fim; SC_CENARIOS/SC_PREMISSAS em ${W}) nos dois temas.
(e) Para a PROXIMA rodada (nao conserte): onde CONCLUSOES.md, conclusoes_spec.json, o catalogo (porta A) e a regua usam a repeticao "mesmo clube no ano seguinte" como criterio.`

const [ger, mapa] = await Promise.all([
  agent(`${CASA}\n\n${P_GERADOR}`, { label: 'dono:gerador', phase: 'Gerar e mapear', schema: ESC, effort: 'high' }),
  agent(`${CASA}\n\n${P_MAPA}`, { label: 'mapa:referencias', phase: 'Gerar e mapear', schema: MAPA, effort: 'high' }),
])
log(`gerador: ${ger ? 'ok' : 'FALHOU'} · mapa: ${mapa ? mapa.textos_que_ficam_falsos.length + ' textos a corrigir' : 'FALHOU'}`)
if (!ger) return { gerador: null, mapa, parou: 'gerador falhou; nada de tela nem gravacao' }

/* ---------------- 2. telas ---------------- */
phase('Telas')
const textos = mapa ? mapa.textos_que_ficam_falsos : []
const deArq = nome => textos.filter(t => (t.arquivo || '').includes(nome))
const ESPELHO = porta => `TESTE: pasta-espelho em ${W}/espelho_<seu_nome> com uma copia do static ATUAL e um prototipo.js montado de ${W}/prototipo_e6.json (mesma logica do gerar_prototipo_js.py, sem gravar no projeto), servida pelo app real apontado para o espelho ou por servidor proprio, porta ${porta}, a 1.785 e a 400 px, tema claro e escuro: 16/16 etapas, zero erro no console, zero undefined/NaN, zero rolagem lateral a 1.785, nada cortado a 400. E o app real com o dado GRAVADO de hoje (sem mesmo_ano): a etapa 6 escreve a ausencia, discreta, sem erro.`

const P_PROTO_B = `SUA TAREFA: dono de \`static/proto_b.js\` (e so dele).
1. REESCREVA ptEtapa6 (e os pb6* que sobrarem) para o pedido do dono, lendo SO \`etapa_6.mesmo_ano\` pelas chaves do relato do gerador abaixo:
   - frase de abertura dita em voz alta: o que cada quadradinho mostra (na horizontal a posicao do time naquele numero no ranking do ano, 0 a 100; na vertical o aproveitamento de pontos NO MESMO ANO), e que a cor e o que o time fez naquele ano (azul claro subiu, laranja caiu, cinza meio — ptFxRot);
   - legenda de cores VISIVEL com quantas temporadas de cada cor, lidas do dado; pontos sobrepostos visiveis (contorno), cores legiveis nos dois temas (pode reusar PB6_CORES);
   - cada miniatura: nome simples (pbNome), a FORCA escrita (ptJunto(rho), com o sentido: mais do numero anda com mais ou com menos pontos) e se PODE SER SORTE pela conta dos muitos testes (q) — o numero tecnico (rho, p, q, n) so em ptTecnico; mesma escala em todas; ordem = ordem_por_forca gravada (a tela nao ordena);
   - a lista inteira dita uma vez: quantos de N passam de p<0,05 contra quantos o sorteio daria, e o que isso quer dizer;
   - o aviso que nao pode sumir: no mesmo ano, numero e pontos saem dos mesmos jogos, entao a relacao mistura causa e consequencia — quem separa e a etapa 7 (aponte pelo numero da etapa lido da casca); e as marcas da etapa 10 (consequencia do resultado) e os azuis da etapa 7 nos quadradinhos, como hoje (pb6Marca/pb6Azuis7);
   - uma tabela com TODOS os indicadores do bloco (nome, forca, sorte, temporadas), na ordem gravada;
   - SAI da tela da etapa 6: diagonal, rho de um ano para o outro, comparacao com o valor do elenco de um ano para o outro, card do truncamento dos pares, qualquer "se repete". Nada disso aparece nem como numero pequeno.
   - dado sem mesmo_ano (prototipo.js gravado hoje, PONTOS): ptFaltaBloco com motivo, sem quebrar a etapa.
2. ETAPA 5 (pb5DifTexto e o cabecalho das matrizes): sem sinal quando ha a palavra ("53 abaixo de quem caiu"); contraste do numero >= 4,5:1 nos dois temas (medido), sem mexer em style.css (estilo inline ou classe ja existente).
3. Textos falsos que o mapa achou em proto_b.js fora da etapa 6 (confirme cada um): ${J(deArq('proto_b'), 8000)}
${ESPELHO(5181)} Na etapa 6: conte no DOM, em 5 miniaturas, os pontos de cada cor e compare com as faixas de temporadas; confira que a ordem das miniaturas e a de ordem_por_forca; e que nenhum texto da etapa 6 fala em ano seguinte, diagonal ou repetir.
Relato do gerador: ${J(ger, 14000)}
Contraste medido pelo mapa: ${mapa ? mapa.cabecalho_etapa5.slice(0, 2000) : '(mapa falhou: meça voce)'}`

const donosTela = [{ k: 'proto_b', arq: ['static/proto_b.js'], p: P_PROTO_B }]
for (const [k, nome, porta] of [['proto_a', 'proto_a.js', 5183], ['proto_c', 'proto_c.js', 5184], ['casca', 'proto.js', 5182]]) {
  const ts = deArq(nome).concat(k === 'casca' ? deArq('proto_contrato').concat(deArq('proto_glossario')).concat(deArq('style.css')) : [])
  const fraseTela = k !== 'casca' && mapa && /static\//.test(mapa.frase_dois_clubes) && mapa.frase_dois_clubes.includes(nome)
  if (ts.length || fraseTela) donosTela.push({ k, arq: k === 'casca' ? ['static/proto.js', 'static/proto_contrato.md', 'static/proto_glossario.js'] : ['static/' + nome],
    p: `SUA TAREFA: dono de ${k === 'casca' ? 'static/proto.js, static/proto_contrato.md e static/proto_glossario.js' : 'static/' + nome} (e so disso). Corrija os textos que ficam falsos com a etapa 6 nova (confirme cada um contra o pedido; o mapa pode ter errado — diga por que ao recusar): ${J(ts, 10000)}${fraseTela ? `\nE a frase dos jogadores em dois clubes, se ela mora no seu arquivo: jogadores-ano e pessoas, lidos do dado (chaves do gerador abaixo). Onde o mapa achou: ${mapa.frase_dois_clubes.slice(0, 1500)}` : ''}\nNo contrato (se for seu): documente as chaves novas de etapa_6.mesmo_ano. Relato do gerador: ${J(ger, 6000)}\n${ESPELHO(porta)}` })
}
const telas = (await parallel(donosTela.map(d => () => agent(`${CASA}\n\n${d.p}\n\nArquivos que VOCE pode escrever: ${d.arq.join(', ')}. Nenhum outro.`,
  { label: 'dono:' + d.k, phase: 'Telas', schema: ESC, effort: 'high' }).then(r => r ? { ...r, k: d.k } : null)))).filter(Boolean)
log(`telas: ${telas.map(t => t.k).join(', ')} (${donosTela.length - telas.length} falharam)`)

/* ---------------- 3. conferir por tres lados ---------------- */
phase('Conferir')
const FEITO = `O que foi feito: ${J({ gerador: ger, telas }, 40000)}`
const LENTES = [
  { k: 'numeros', porta: null, t: `OS NUMEROS, refeitos por fora (sem importar o codigo novo do gerador para medir; pode importar carregar_painel/montar_matriz so para ter d80 e postos, com G.DECL = G.carregar_declaracao()): para TODOS os indicadores de ${W}/prototipo_e6.json etapa_6.mesmo_ano, refaca aproveitamento, rho, p, n, q BH e confira; refaca a lista inteira com o seu proprio sorteio dentro do ano (mesma quantidade, outra semente: tem de dar perto) e com a semente declarada (tem de dar igual); a ordem_por_forca; as faixas das 80 temporadas contra o painel; jogos = 38 em todas (ou diga as que nao); a declaracao existe e diz o que o codigo faz; determinismo; o diff contra o dados/prototipo.json gravado so traz as chaves permitidas; gerar_pontos continua podendo chamar etapa_6. E os dois numeros da frase dos dois clubes, refeitos da fonte.` },
  { k: 'tela', porta: 5185, t: `A TELA no navegador headless, espelho com static atual + prototipo.js de ${W}/prototipo_e6.json (porta 5185; derrube ao fim; SC_CENARIOS/SC_PREMISSAS em ${W}), 1.785 e 400 px, tema claro e escuro: (1) etapa 6: TODAS as miniaturas — contagem de pontos por cor bate com as faixas das temporadas com valor; ordem = ordem_por_forca; forca e sorte escritas batem com rho e q do JSON em 12 sorteadas; a legenda com numeros do dado; nada de ano seguinte/diagonal/repetir/valor do elenco de um ano para o outro/truncamento na etapa 6; o aviso de causa e consequencia e as marcas da etapa 10 presentes; (2) etapa 5: cabecalho sem sinal repetido e contraste >= 4,5:1 medido nos dois temas; (3) os textos que o mapa marcou estao corrigidos; (4) regressao: 16/16, zero erro, zero undefined/NaN, zero rolagem lateral a 1.785, nada cortado a 400; (5) app real com o dado gravado de hoje e a etapa desenhada com PONTOS num alvo temporario: ausencia escrita, sem erro. Mapa: ${J(mapa, 12000)}` },
  { k: 'linguagem', porta: 5187, t: `A LINGUAGEM, no navegador (espelho como acima, porta 5187, derrube ao fim) e no codigo das telas mexidas: portugues de reuniao de clube; jargao so no numero pequeno; nenhum numero digitado; nenhuma frase que afirma mais que o dado (associacao no mesmo ano nao e causa; "contrate X" nunca; "pode ser sorte" dito quando o q nao passa; amostra de 80 temporadas com clubes repetidos dita); vocabulario unico de proto.js; a pergunta nova da etapa dita no titulo e na abertura sem sobrar a antiga em lugar nenhum da aba (sumario, glossario, pontes de outras etapas).` },
]
const confs = (await parallel(LENTES.map(L => () => agent(`${CASA}\n\n${FEITO}\n\nVOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. SUA LENTE: ${L.t}`,
  { label: 'confere:' + L.k, phase: 'Conferir', schema: CONF, effort: 'high' })))).filter(Boolean)
log(`conferencias: ${confs.map(c => c.lente.slice(0, 20) + '=' + c.veredito).join(' · ')}`)

/* ---------------- 4. consertar ---------------- */
const DON = [
  { k: 'gerador', arq: 'gerar_prototipo.py', porta: null }, { k: 'proto_b', arq: 'proto_b.js', porta: 5192 },
  { k: 'proto_a', arq: 'proto_a.js', porta: 5193 }, { k: 'proto_c', arq: 'proto_c.js', porta: 5194 }, { k: 'casca', arq: 'proto.js', porta: 5195 },
]
const donoDe = p => DON.find(x => (p.arquivo || '').includes(x.arq)) ||
  ((p.arquivo || '').match(/proto_contrato|proto_glossario/) ? DON[4] : (p.arquivo || '').match(/prototipo\.json|declara/) ? DON[0] : DON[1])
async function consertar(problemas, fase, rotulo, depoisDeGravado) {
  const por = {}
  for (const p of problemas) { const d = donoDe(p); (por[d.k] = por[d.k] || []).push(p) }
  return (await parallel(Object.entries(por).map(([k, ps]) => () => {
    const d = DON.find(x => x.k === k)
    const arqs = k === 'casca' ? 'static/proto.js, static/proto_contrato.md e static/proto_glossario.js' : k === 'gerador' ? 'gerar_prototipo.py (e o arquivo de declaracao que ele le)' : 'static/' + d.arq
    const extra = k === 'gerador'
      ? (depoisDeGravado
          ? `O dado ja esta GRAVADO: copie dados/prototipo.json para ${W}/prototipo_antes_conserto.json, conserte, rode python3 -B gerar_prototipo.py e python3 gerar_prototipo_js.py e mostre o diff (so o que o conserto explica).`
          : `Rode de novo no rascunho (G.SAIDA = ${W}/prototipo_e6.json), determinismo 1x2 e diff contra o gravado (so chaves permitidas).`)
      : `Porta ${d.porta}. ${depoisDeGravado ? 'Teste no app real com o dado gravado.' : ESPELHO(d.porta)}`
    return agent(`${CASA}\n\nRODADA DE CONSERTO (${rotulo}). Voce e dono de ${arqs}; nenhum outro arquivo. ${extra}\nProblemas (confirme cada um; recuse com prova o que estiver errado):\n${J(ps, 20000)}\nDepois rode o teste de novo (16/16, zero erro, zero rolagem lateral a 1.785, nada cortado a 400).`,
      { label: 'conserta:' + k + (depoisDeGravado ? ':final' : ''), phase: fase, schema: ESC, effort: 'high' }).then(r => r ? { ...r, k } : null)
  }))).filter(Boolean)
}
const graves = confs.flatMap(c => c.problemas.filter(p => ['quebra', 'mente', 'falta'].includes(p.gravidade)))
const detalhes = confs.flatMap(c => c.problemas.filter(p => p.gravidade === 'detalhe'))
let consertos = []
if (graves.length || detalhes.length) {
  phase('Consertar')
  consertos = await consertar(graves.concat(detalhes), 'Consertar', 'a unica antes de gravar', false)
}
const geradorMudou = consertos.some(c => c.k === 'gerador')

/* ---------------- 5. gravar ---------------- */
phase('Gravar')
const grav = await agent(`${CASA}\n\nSUA TAREFA: gravar o dado novo. Voce so RODA o gerador; nao edite codigo.
1. Copie dados/prototipo.json para ${W}/prototipo_antes.json e static/prototipo.js para ${W}/prototipo_js_antes.js.
2. Rode \`python3 -B gerar_prototipo.py\` e \`python3 gerar_prototipo_js.py\` na raiz do projeto.
3. Diff caminho a caminho contra a copia: SO etapa_6.mesmo_ano (novo), a frase dos dois clubes da etapa 1 e a declaracao podem mudar. Compare tambem com ${W}/prototipo_e6.json (rascunho${geradorMudou ? ', refeito no conserto' : ''}): tem de ser identico.
4. Regressao headless no app real (porta 5196; SC_CENARIOS/SC_PREMISSAS em ${W}), 1.785 e 400 px, claro e escuro: 16/16, zero erro, zero undefined/NaN, zero rolagem lateral a 1.785, nada cortado a 400; etapa 6 desenhada com as miniaturas do mesmo ano na ordem gravada; etapa 5 com o cabecalho novo.
Se o diff trouxer qualquer mudanca fora das permitidas: RESTAURE as duas copias e diga o que apareceu.
Relatos: ${J({ gerador: ger, telas, consertos }, 30000)}`,
  { label: 'grava', phase: 'Gravar', schema: ESC, effort: 'high' })

/* ---------------- 6. conferir final ---------------- */
phase('Conferir final')
const fin = await agent(`${CASA}\n\nO que foi feito: ${J({ gerador: ger, telas, conferencias: confs, consertos, gravacao: grav }, 60000)}\n\nVOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. App REAL com o dado GRAVADO (porta 5197; derrube ao fim; SC_CENARIOS/SC_PREMISSAS em ${W}), 1.785 e 400 px, tema claro e escuro: (1) dados/prototipo.json e static/prototipo.js sincronizados e com mesmo_ano; (2) etapa 6: ordem, cores por faixa do mesmo ano, forca e sorte batem com o JSON em 10 miniaturas sorteadas, lista inteira dita, aviso de causa e consequencia, nada de repeticao/ano seguinte; (3) etapa 5: cabecalho sem sinal repetido, contraste >= 4,5:1 nos dois temas; frase dos dois clubes com jogadores-ano e pessoas; (4) cada problema das conferencias anteriores resolvido ou recusado com prova; (5) regressao: 16/16, zero erro, zero undefined, zero rolagem lateral a 1.785, nada cortado a 400; a etapa com PONTOS num alvo temporario sem erro; (6) git status: nenhum arquivo da outra sessao mexido por esta rodada (compare os arquivos proibidos com o HEAD).`,
  { label: 'confere:final', phase: 'Conferir final', schema: CONF, effort: 'high' })

let consertosFinais = []
const gravesFinais = fin ? fin.problemas.filter(p => ['quebra', 'mente'].includes(p.gravidade)) : []
if (gravesFinais.length) consertosFinais = await consertar(gravesFinais, 'Conferir final', 'final, so o que quebra ou mente', true)

return { gerador: ger, mapa, telas, conferencias: confs, consertos, gravacao: grav, conferencia_final: fin, consertos_finais: consertosFinais,
  pendente_para_rodada_da_repeticao: mapa ? mapa.para_a_rodada_da_repeticao : [] }
