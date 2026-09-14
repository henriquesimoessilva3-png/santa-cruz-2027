export const meta = {
  name: 'conclusoes-do-estudo',
  description: 'Levanta as conclusoes do estudo Serie B em frase simples com forca calculada por regra, refuta cada uma por duas lentes e consolida em CONCLUSOES.md',
  phases: [
    { title: 'Levantar', detail: 'tres dominios: dinheiro e elenco, fisico, jogo e mercado' },
    { title: 'Refutar', detail: 'duas lentes por dominio: forca inflada, numero e frase' },
    { title: 'Consolidar', detail: 'CONCLUSOES.md e a especificacao para o gerador' },
    { title: 'Faltou', detail: 'um critico procura a conclusao importante que ninguem escreveu' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B: o que separa quem SOBE (1-4) de quem
fica no MEIO (5-16) e de quem CAI (17-20). 80 temporadas completas 2022-2025 (16/48/16), mais
80 de 2018-2021 so com dado tecnico (sem valor de mercado e sem fisico).

O PEDIDO DO DONO. Ele leu esta frase, escrita numa conversa, e disse "esse tipo de conclusao e
muito importante e precisa estar clara no estudo":

  "Quem sobe poe uma parte maior do elenco na defesa: 34% do valor, contra 27% no meio da
   tabela. E um sinal fraco. Quando se testam os quatro setores, um desses pode sair por sorte."

O que a frase tem e que ele quer em TODO o estudo: (1) o que se viu, dito como se diz numa
reuniao de clube; (2) o numero em forma simples; (3) o QUANTO SE PODE CONFIAR, dito com todas
as letras, inclusive quando a resposta e "pouco". Publico: diretor de futebol, treinador,
conselheiro — gente de futebol, nao de estatistica.

**PROIBIDO: qualquer comando git que escreva (commit, push, add, reset, checkout de arquivo).**
**NAO EDITE** \`static/proto*.js\`, \`static/style.css\`, \`templates/index.html\`,
\`gerar_prototipo.py\`, \`dados/prototipo.json\` nem \`static/prototipo.js\`: outro fluxo esta
reescrevendo a aba agora. Voce LE esses arquivos a vontade. Scripts seus vao no /tmp.

FONTES (leia o que precisar, nesta ordem de confianca):
- \`dados/prototipo.json\` — o produto conferido: etapas 0 a 15, com \`etapa_1.curva_top_k\` e
  \`etapa_1.valor_por_setor\` recem-acrescentados.
- \`dados/serieb_clube_temporada.csv\` — o painel 2022-2026 (use as 80 completas; 2026 so tem
  27 rodadas e nao entra em conta nenhuma).
- \`dados/serieb_clube_temporada_2018_2021.csv\` e \`_fonte/prototipo/teste_cego_2018_2021.json\`.
- \`_fonte/prototipo/CONFERENCIA.md\` — o laudo de tres ceticos e da correcao. Secoes 2 (fisico),
  3 (teste cego) e 5 (depois da correcao) tem conclusoes JA REFUTADAS uma vez: respeite o que
  caiu la.
- \`_fonte/prototipo/TIPOLOGIA.md\`, \`_fonte/prototipo/ESPECIFICACAO.md\`.
Para recalcular: \`import gerar_prototipo as G; G.carregar_painel()\` devolve o painel da etapa 1.
numpy, pandas, scipy, sklearn SIM; statsmodels NAO.`

const RUBRICA = `A REGUA DE FORCA — uma so, aplicada por regra, nunca por impressao. O dono vai ler o selo antes
da frase, entao o selo errado e a mentira mais cara que o estudo pode contar.

  FORTE — dificilmente e sorte MESMO depois de descontar a quantidade de coisas testadas (BH
    q < 0,05 dentro da familia declarada), E continua de pe comparando times de orcamento
    parecido (quando o dinheiro pode explicar), E, quando da para testar, se repete (de um ano
    para o outro, no 2o turno, ou em 2018-2021).
  MODERADO — dificilmente e sorte sozinho (p < 0,05) e sobrevive ao dinheiro, mas NAO passa no
    desconto dos muitos testes, OU nao tem como ser testado de novo.
  FRACO — so aparece no numero bruto: morre no desconto dos muitos testes OU no desconto do
    dinheiro (ou do tamanho do elenco, no fisico).
  SEM SINAL — nao ha diferenca que se distinga do acaso (p >= 0,10). E conclusao tambem, e
    importante: diga o tamanho de diferenca que o estudo CONSEGUIRIA ver com 16 times (com 16
    contra 48, abaixo de um "tamanho medio-grande" o estudo nao enxerga). "Nao se viu" nao e
    "nao existe".
  NAO DA PARA AFIRMAR — a comparacao que o leitor quer fazer (A e maior que B? mudou de um
    periodo para o outro?) tem intervalo que cruza zero, ou nunca foi testada diretamente.

Tres regras que valem sobre a regua:
  1. ASSOCIACAO NAO E CAUSA. "Quem sobe gasta mais na defesa" pode. "Gastar na defesa faz subir"
     nao pode — nada neste estudo e experimento. Se a frase soa como receita, reescreva.
  2. "NUNCA" E "SEMPRE" SO COM ZERO EXCECAO. Uma excecao vira "quase nunca" com o nome dela.
  3. SE A CONFERENCIA JA DERRUBOU, ESTA DERRUBADO. Nao ressuscite o PSV-99 do top-5, o "ROTA
     nao replica", o "TERRITORIO ficou mais forte" nem o "a tipologia caiu no teste cego".`

const CONCL = { type: 'object', properties: {
  dominio: { type: 'string' },
  conclusoes: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' },
    titulo_curto: { type: 'string' },
    frase_simples: { type: 'string' },
    numero_simples: { type: 'string' },
    forca: { type: 'string', enum: ['forte', 'moderado', 'fraco', 'sem_sinal', 'nao_da_para_afirmar'] },
    por_que_essa_forca: { type: 'string' },
    ressalva: { type: 'string' },
    numeros: { type: 'array', items: { type: 'object', properties: {
      nome: { type: 'string' }, valor: { type: 'string' }, fonte: { type: 'string' },
    }, required: ['nome', 'valor', 'fonte'] } },
    etapa_da_aba: { type: 'string' },
    campos_do_prototipo_json: { type: 'array', items: { type: 'string' } },
    precisa_de_campo_novo_no_gerador: { type: 'string' },
    importancia_para_montar_elenco: { type: 'integer' },
    recalculado_por_mim: { type: 'boolean' },
  }, required: ['id', 'titulo_curto', 'frase_simples', 'numero_simples', 'forca', 'por_que_essa_forca',
    'ressalva', 'numeros', 'etapa_da_aba', 'campos_do_prototipo_json', 'precisa_de_campo_novo_no_gerador',
    'importancia_para_montar_elenco', 'recalculado_por_mim'] } },
  candidatas_descartadas: { type: 'array', items: { type: 'object', properties: {
    frase: { type: 'string' }, por_que: { type: 'string' },
  }, required: ['frase', 'por_que'] } },
}, required: ['dominio', 'conclusoes', 'candidatas_descartadas'] }

const REFUTA = { type: 'object', properties: {
  lente: { type: 'string' },
  avaliacoes: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' },
    veredito: { type: 'string', enum: ['manter', 'rebaixar_forca', 'subir_forca', 'corrigir_numero', 'reescrever_frase', 'cortar'] },
    forca_certa: { type: 'string' },
    numero_certo: { type: 'string' },
    frase_certa: { type: 'string' },
    por_que: { type: 'string' },
  }, required: ['id', 'veredito', 'forca_certa', 'numero_certo', 'frase_certa', 'por_que'] } },
  faltou_neste_dominio: { type: 'array', items: { type: 'string' } },
}, required: ['lente', 'avaliacoes', 'faltou_neste_dominio'] }

const CONSOL = { type: 'object', properties: {
  arquivos_escritos: { type: 'array', items: { type: 'string' } },
  total_de_conclusoes: { type: 'integer' },
  fortes: { type: 'integer' }, moderadas: { type: 'integer' }, fracas: { type: 'integer' },
  sem_sinal: { type: 'integer' }, nao_da_para_afirmar: { type: 'integer' },
  cortadas_pelos_ceticos: { type: 'integer' },
  forca_mudada_pelos_ceticos: { type: 'integer' },
  divergencias_entre_ceticos_e_como_resolvi: { type: 'array', items: { type: 'string' } },
  as_cinco_que_o_diretor_precisa_ler: { type: 'array', items: { type: 'string' } },
  o_que_nao_consegui: { type: 'string' },
}, required: ['arquivos_escritos', 'total_de_conclusoes', 'fortes', 'moderadas', 'fracas', 'sem_sinal',
  'nao_da_para_afirmar', 'cortadas_pelos_ceticos', 'forca_mudada_pelos_ceticos',
  'divergencias_entre_ceticos_e_como_resolvi', 'as_cinco_que_o_diretor_precisa_ler', 'o_que_nao_consegui'] }

const CRITICO = { type: 'object', properties: {
  faltando: { type: 'array', items: { type: 'object', properties: {
    conclusao_que_falta: { type: 'string' }, por_que_importa: { type: 'string' },
    onde_medir: { type: 'string' }, forca_provavel: { type: 'string' },
  }, required: ['conclusao_que_falta', 'por_que_importa', 'onde_medir', 'forca_provavel'] } },
  selos_que_ainda_parecem_errados: { type: 'array', items: { type: 'string' } },
  frases_que_o_diretor_leria_como_receita: { type: 'array', items: { type: 'string' } },
  veredito: { type: 'string', enum: ['pronto', 'faltam_coisas_importantes'] },
}, required: ['faltando', 'selos_que_ainda_parecem_errados', 'frases_que_o_diretor_leria_como_receita', 'veredito'] }

const DOMINIOS = [
  { k: 'dinheiro-e-elenco', p: `DINHEIRO E ELENCO.
- O valor total do elenco: faixas de orcamento e a taxa de subida em cada uma; o posto de valor
  como previsor (quantos pares acerta), inclusive testado num ano que a conta nao viu (2026,
  provisorio) e deixando um ano de fora.
- "Quantos dos 16 estavam entre os mais caros": \`etapa_1.curva_top_k\`. O dono palpitou 14 ou
  mais entre os 8 mais caros. Nesta conversa foi dito: 10 no top 4, 12 no top 6 e no top 8, 14 no
  top 9; so Criciuma 2023 (12o) e Chapecoense 2025 (18o) vieram de longe; o degrau 8->9 sao dois
  times em quatro anos. RECALCULE.
- O valor POR SETOR: \`etapa_1.valor_por_setor\`. Dito na conversa: quem sobe gasta mais em todos
  os setores, mais na defesa (7,9 mi contra 3,9 no meio); o valor da defesa sozinho acerta 84 de
  cada 100 pares contra 83 do total — o bloco novo grava o intervalo dessa diferenca, e e ELE
  que decide o selo; % do elenco na defesa 34 contra 27 (p 0,036, um de quatro testes); goleiro
  caro nao separa sobe de meio. RECALCULE.
- Tamanho do elenco: quem sobe usa menos atletas (\`etapa_1.controle_n_atletas\`); a concentracao
  de minutos e o nucleo (familia "elenco" da etapa 2); estrangeiros (\`min_estrangeiros\`, porta C).
- O que a etapa 10 marca como "causa ou consequencia" dentro deste dominio.` },
  { k: 'fisico', p: `FISICO (SkillCorner, so 2022-2025).
- A resposta ja refutada duas vezes, na secao 2 do CONFERENCIA.md: quem sobe nao corre mais
  (distancia); a arrancada explosiva do meio-campo e a melhor hipotese viva; a zaga de quem sobe
  corre menos (hipotese); o ataque separa so de quem cai; o dinheiro come quase tudo; ha sinal
  coletivo sem nenhum indicador sobreviver sozinho a todos os testes; o PSV-99 do top-5 morreu.
  E a secao 5.3: com o segundo desconto (dinheiro + tamanho do elenco), o que sobra.
- A pergunta que o dono fez hoje: "os times que caem tem o fisico pior? talvez nem sempre quem
  sobe tem o melhor, mas o que cai nunca tem fisico bom". Medido nesta conversa com um indice de
  intensidade (media da posicao no ano em psv99, psv99_top5, sprint distancia e contagem, hsr
  distancia e contagem, hi distancia e contagem, arrancada ate sprint e ate hsr) e um de volume
  (distancia e corrida por 90): na INTENSIDADE, dos 16 que cairam so 1 no top 5 do ano (Londrina
  2023, 2o) e 8 nos 5 piores, posicao tipica 15a; dos que subiram 7 no top 5 e 2 nos piores
  (Vitoria 2023, Remo 2025). No VOLUME nao vale: CSA 2022 caiu e foi o que mais correu. Descontado
  o dinheiro, quem caiu segue atras (p 0,039); descontado dinheiro e tamanho do elenco, p 0,113.
  RECALCULE, e decida o selo pela regua — inclusive se "quase nunca tem intensidade boa" merece
  aparecer como conclusao e com que forca.
- Use \`d_liq_*\` e \`d_liq2_*\` da etapa 2 e o \`controle_n_atletas\` da etapa 1.` },
  { k: 'jogo-padroes-e-mercado', p: `JOGO, PADROES, OS ANOS ANTIGOS E O MERCADO.
- Tecnico coletivo e individual: as portas A/B/C da etapa 2 (a unica A e \`dist_remate\`: chutar
  de mais perto), o que se repete de um ano para o outro (etapa 6), o que o 1o turno diz do 2o
  (etapa 7).
- Os padroes: nao existem grupos de times descobertos as cegas (etapa 8, cemiterio); a tipologia
  em dois eixos declarados (TERRITORIO e ROTA) e os quatro grupos, com o que passou e o que nao
  passou (TIPOLOGIA.md e secao 5.1 do laudo: G1, G3, G4 passam; G2 e so descritivo).
- 2018-2021, o teste cego (secao 3 do laudo e \`teste_cego_2018_2021.json\`): TERRITORIO separa
  sobe de meio tambem la; 12 de 12 indicadores mantem o sinal; a ROTA nao e eixo estabelecido em
  nenhum dos dois periodos; NENHUMA diferenca ENTRE periodos foi medida; tudo la e bruto (sem
  valor de mercado).
- O mando: 2020 sem torcida nao apagou a vantagem de jogar em casa; a vantagem mudou de um
  periodo para o outro (59% contra 64% dos pontos em casa, p 0,017 com o ano como unidade).
- Etapa 10 (causa ou consequencia — "nao contrate para isto"), etapa 11 (o teste da mala: o que
  viaja com o jogador quando ele muda de clube), etapas 12-14 (livres, nota de encaixe e seu
  backtest que nao separa, os 213 de 586 empatados no teto, as restricoes nao implementadas) e 15
  (treinador: o que nao da).` },
]

phase('Levantar')

const porDominio = await pipeline(
  DOMINIOS,
  dom => agent(`${CASA}

${RUBRICA}

SEU DOMINIO: ${dom.p}

TAREFA: levantar as CONCLUSOES deste dominio que um diretor precisa conhecer para montar elenco —
entre 6 e 12, ordenadas por importancia. Para cada uma:
  - \`frase_simples\`: a frase de reuniao, no molde da frase que o dono marcou. Curta. Sem sigla.
  - \`numero_simples\`: o numero dito para leigo ("12 dos 16", "acerta em 83 de cada 100 pares",
    "o acaso produziria isso em 4 de cada 100 tentativas").
  - \`forca\` pela regua, e \`por_que_essa_forca\` citando QUAL criterio da regua decidiu.
  - \`ressalva\`: o que o leitor nao pode concluir a partir dela, em portugues simples.
  - \`numeros\`: cada numero com a fonte exata (arquivo + campo, ou "recalculado: <o que>").
  - \`campos_do_prototipo_json\`: os caminhos que ja sustentam a frase; e em
    \`precisa_de_campo_novo_no_gerador\` diga o que falta gravar para a tela montar a frase sem
    numero digitado ("nada" se nada falta).
**Recalcule cada numero por caminho proprio.** Numero citado nesta tarefa e hipotese, nao fonte.
Registre em \`candidatas_descartadas\` as frases tentadoras que a regua nao deixa afirmar.`,
    { label: 'levanta:' + dom.k, phase: 'Levantar', schema: CONCL, effort: 'high' }),
  (lev, dom) => lev ? parallel([
    { k: 'forca-inflada', p: `FORCA INFLADA. Tente REBAIXAR cada selo. A regua foi aplicada ao pe da letra? A familia de testes que o selo "forte" invoca e a certa, ou foi escolhida para caber? O desconto do dinheiro (e do tamanho do elenco, no fisico) foi feito? "Se repete" foi medido ou suposto? Com 16 times, o "sem sinal" diz o tamanho que o estudo nao consegue ver? Alguma frase soa como RECEITA ("gastar na defesa faz subir") quando o dado so mostra associacao? Algum "nunca" com excecao? Alguma conclusao que o laudo ja derrubou voltou? Default: na duvida entre dois selos, o mais fraco.` },
    { k: 'numero-e-frase', p: `NUMERO E FRASE. Recalcule CADA numero por caminho proprio a partir das fontes e marque o que nao bate. Depois leia cada frase_simples como o diretor leria: ela diz exatamente o que o numero diz — nem mais, nem menos? Um leigo entende sem ajuda? A ressalva esta em portugues de gente? O numero_simples e a traducao certa (o p NAO e "chance de ser sorte"; o certo e "o acaso produziria isso em X de cada 100 tentativas"; AUC e "acerta em X de cada 100 pares")?` },
  ].map(l => () => agent(`${CASA}

${RUBRICA}

VOCE REFUTA. Outro agente levantou as conclusoes do dominio "${dom.k}":
${JSON.stringify(lev, null, 1).slice(0, 45000)}

SUA LENTE: ${l.p}

Para cada id, um veredito. Diga tambem que conclusao importante deste dominio ficou de fora.`,
    { label: 'refuta:' + dom.k + ':' + l.k, phase: 'Refutar', schema: REFUTA, effort: 'high' })))
    .then(refs => ({ dominio: dom.k, levantamento: lev, refutacoes: refs.filter(Boolean) })) : null,
)

const validos = porDominio.filter(Boolean)
log(`Dominios levantados e refutados: ${validos.length} de ${DOMINIOS.length}; conclusoes candidatas: ${validos.reduce((n, v) => n + (v.levantamento ? v.levantamento.conclusoes.length : 0), 0)}`)

phase('Consolidar')

const consol = await agent(`${CASA}

${RUBRICA}

Tres dominios foram levantados e cada um passou por dois ceticos:
${JSON.stringify(validos, null, 1).slice(0, 150000)}

TAREFA: CONSOLIDAR. Voce e o unico que escreve arquivo nesta rodada, e so estes dois:

1. \`${RAIZ}/_fonte/prototipo/CONCLUSOES.md\` — o documento que o dono le.
   - Abre com a REGUA, em portugues de reuniao, em no maximo oito linhas: o que cada selo quer
     dizer e por que "fraco" e "sem sinal" tambem sao conclusao.
   - Depois, "AS CINCO QUE VOCE PRECISA LER": as cinco conclusoes mais importantes para montar
     elenco, qualquer que seja o selo delas.
   - Depois, as conclusoes por tema (Dinheiro e elenco · Fisico · Jogo e padroes · Os anos
     antigos · Mercado e contratacao). Cada uma no molde:
       **[SELO] Titulo curto.** Frase simples. Numero simples. *O que isso nao quer dizer:* ressalva.
       <sub>numeros tecnicos e fonte · onde ver na aba: etapa N</sub>
   - Por ultimo, "O QUE PARECIA CONCLUSAO E NAO E": as candidatas descartadas e as cortadas
     pelos ceticos, cada uma com o motivo em uma linha. O dono precisa ver o que foi recusado.

2. \`${RAIZ}/_fonte/prototipo/conclusoes_spec.json\` — a especificacao para a proxima rodada, em
   que o gerador vai gravar um bloco \`conclusoes\` e a tela vai montar as frases. Uma entrada por
   conclusao: id, tema, etapa, forca, a frase como MOLDE com lacunas nomeadas
   (ex.: "Dos {n_promovidos}, {top8} estavam entre os 8 elencos mais caros do ano"), cada lacuna
   apontando o caminho no prototipo.json ou o calculo que o gerador precisa fazer, a REGRA do
   selo em forma verificavel (quais campos, quais cortes), e a ressalva tambem como molde.
   **Nada de numero digitado no molde** — e a regra da casa.

COMO RESOLVER OS CETICOS: veredito "cortar" de qualquer um dos dois corta, a menos que voce
recalcule e mostre que ele errou (e registre). Entre "manter" e "rebaixar", fica o selo mais
fraco. Numero corrigido por um e nao contestado pelo outro: vale o corrigido, recalculado por voce.
Tudo que voce decidir contra um cetico vai em \`divergencias_entre_ceticos_e_como_resolvi\`.`,
  { label: 'consolida', phase: 'Consolidar', schema: CONSOL, effort: 'high' })

phase('Faltou')

const critico = await agent(`${CASA}

${RUBRICA}

Existe agora \`${RAIZ}/_fonte/prototipo/CONCLUSOES.md\` e \`conclusoes_spec.json\`. Leia os dois
inteiros, e depois o estudo (prototipo.json, CONFERENCIA.md, TIPOLOGIA.md).

VOCE E O CRITICO DE COMPLETUDE. Tres perguntas:
1. Que conclusao IMPORTANTE para quem monta elenco o estudo sustenta e o documento nao escreveu?
   (Pense no que um diretor perguntaria: "quanto tenho de gastar para ter chance?", "em que setor
   o dinheiro rende mais?", "fisico se compra?", "o que do jogador viaja com ele?", "a nota de
   encaixe serve?", "o que NAO adianta olhar?") Para cada uma, onde medir e o selo provavel.
2. Algum selo ainda parece errado depois dos ceticos?
3. Alguma frase um diretor leria como receita de causa e efeito?`,
  { label: 'critico', phase: 'Faltou', schema: CRITICO, effort: 'high' })

return { dominios: validos, consolidacao: consol, critico }
