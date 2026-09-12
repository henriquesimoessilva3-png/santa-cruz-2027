export const meta = {
  name: 'revisao-serieb',
  description: 'Revisao especialista da aba Analise Serie B: mapear, pesquisar referencias na web, revisar cada secao, propor analises mais profundas por painel, verificar viabilidade contra o dado real, sintetizar',
  phases: [
    { title: 'Mapear', detail: 'a aba renderizada, as bases de dados, o conhecimento acumulado e os metodos' },
    { title: 'Pesquisar', detail: 'oito temas na web: Sumpter, Liverpool, promocao, fisico, elenco, bola parada, metodo, pressao' },
    { title: 'Revisar', detail: 'um critico por secao, com o mapa e a literatura na mao' },
    { title: 'Propor', detail: 'seis analistas, um angulo cada, mais a reorganizacao da narrativa' },
    { title: 'Verificar', detail: 'cada proposta contra o dado real, a redundancia e o rigor' },
    { title: 'Sintetizar', detail: 'relatorio final em portugues' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const SCRATCH = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-Santa-Cruz/1a0469c8-3e66-4fcb-941d-fc1667ecc99a/scratchpad/revisao'
const TXT = SCRATCH + '/aba_serieb_renderizada.txt'
const CONTEXTO = RAIZ + '/_fonte/CONTEXTO.md'
const ANALISE = RAIZ + '/analisar_serieb.py'
const APPJS = RAIZ + '/static/app.js'
const DADOS = RAIZ + '/dados'

const CONTEXTO_GERAL = `CONTEXTO DO PROJETO (leia antes de agir):
Estudo "Analise Serie B" dentro do app "Santa Cruz — Montagem de Elenco" (Flask + JS, publicado em GitHub Pages).
Objetivo do estudo: entender O DIFERENCIAL DAS EQUIPES QUE SOBEM DE DIVISAO na Serie B do Brasil. Dados: TODAS as equipes que disputaram a Serie B de 2022 a 2026 (100 clube-temporada; 2026 em andamento, 27 de 38 rodadas). Foco em parte TECNICA e FISICA.
Bases (todas em ${DADOS}):
- serieb_elencos.csv (Transfermarkt): 5.098 atleta-temporada — quem estava no clube, valor de mercado, idade.
- serieb_tecnico.csv (Wyscout, por atleta): 3.866 jogador-temporada — o que cada um fez em campo (~120 colunas: passes, duelos, xG, remates, posicao...).
- serieb_jogos.csv (Wyscout, por clube e partida): 9.318 linhas, 3.570 de Serie B — como o time jogou partida a partida (xG, remates, posse, PPDA, bolas paradas, formacao...).
- serieb_lesoes.csv (Transfermarkt, NOVO, coletado hoje e AINDA NAO ANALISADO): 2.724 lesoes de 975 atletas, com dias por temporada (dias_2022..dias_2026). Atencao: 2024-2025 tem quase o dobro de lesoes de 2022-2023, quase certamente por o Transfermarkt registrar melhor o recente — comparacao entre anos precisa tratar isso.
- skillcorner.db (fora do repo; fisico por atleta x edicao; 26 metricas + 6 de corridas sem bola; NAO rastreia goleiro).
- serieb_clube_temporada.csv: 100 x 288 colunas — as anteriores cruzadas no nivel clube-temporada. E a base do que a aba mostra.
Metodo central da aba: "sobe" = top 4 da temporada, "cai" = 17o ou pior; correlacao = posto DENTRO do ano (empate vira media) x posto final, Pearson nos postos (Spearman por temporada). So temporadas COMPLETAS (2022-2025, n=80) entram nas medias. Regra nova de 2026: 1o e 2o sobem direto, 3o-6o playoff.
Principio da aba: "o dado e a fonte, o texto e consequencia" — nenhuma media/correlacao vem pronta; tudo e calculado no navegador a partir de sb_clubes.js.
Responda SEMPRE em portugues do Brasil. Seja concreto: numeros, colunas, metodos. Nao invente dados: se nao leu, diga que nao leu.`

// ---------------- schemas ----------------
const MAPA_ABA = { type: 'object', properties: {
  secoes: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, titulo: { type: 'string' },
    blocos: { type: 'array', items: { type: 'object', properties: {
      nome: { type: 'string' }, pergunta: { type: 'string' },
      dados_usados: { type: 'array', items: { type: 'string' } },
      metodo: { type: 'string' }, afirmacao_principal: { type: 'string' },
      numeros_chave: { type: 'array', items: { type: 'string' } },
      ressalvas_declaradas: { type: 'array', items: { type: 'string' } },
    }, required: ['nome', 'pergunta', 'metodo', 'afirmacao_principal'] } },
  }, required: ['id', 'titulo', 'blocos'] } },
  fio_narrativo: { type: 'string' },
  redundancias: { type: 'array', items: { type: 'string' } },
  contradicoes_internas: { type: 'array', items: { type: 'string' } },
  afirmacoes_sem_numero: { type: 'array', items: { type: 'string' } },
}, required: ['secoes', 'fio_narrativo', 'redundancias', 'contradicoes_internas'] }

const MAPA_DADOS = { type: 'object', properties: {
  bases: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, linhas: { type: 'integer' }, granularidade: { type: 'string' },
    colunas_principais: { type: 'array', items: { type: 'string' } },
    cobertura_notas: { type: 'string' },
    potencial_nao_explorado: { type: 'array', items: { type: 'string' } },
  }, required: ['arquivo', 'linhas', 'granularidade', 'colunas_principais', 'potencial_nao_explorado'] } },
  colunas_nao_usadas_promissoras: { type: 'array', items: { type: 'object', properties: {
    coluna: { type: 'string' }, base: { type: 'string' }, por_que: { type: 'string' },
  }, required: ['coluna', 'base', 'por_que'] } },
  lesoes_resumo: { type: 'string' },
  limitacoes_de_dado: { type: 'array', items: { type: 'string' } },
}, required: ['bases', 'colunas_nao_usadas_promissoras', 'lesoes_resumo', 'limitacoes_de_dado'] }

const CONHECIMENTO = { type: 'object', properties: {
  achados: { type: 'array', items: { type: 'object', properties: {
    tema: { type: 'string' }, afirmacao: { type: 'string' }, evidencia: { type: 'string' },
  }, required: ['tema', 'afirmacao'] } },
  armadilhas_de_dado_e_metodo: { type: 'array', items: { type: 'string' } },
  pendencias_declaradas: { type: 'array', items: { type: 'string' } },
  principios: { type: 'array', items: { type: 'string' } },
  metodos: { type: 'array', items: { type: 'object', properties: {
    nome: { type: 'string' }, descricao: { type: 'string' }, onde: { type: 'string' },
  }, required: ['nome', 'descricao'] } },
}, required: ['achados', 'armadilhas_de_dado_e_metodo', 'pendencias_declaradas', 'principios', 'metodos'] }

const PESQUISA = { type: 'object', properties: {
  tema: { type: 'string' },
  achados: { type: 'array', items: { type: 'object', properties: {
    afirmacao: { type: 'string' }, evidencia_ou_citacao: { type: 'string' },
    fonte_url: { type: 'string' }, aplicavel_ao_estudo: { type: 'boolean' },
    como_aplicar_aqui: { type: 'string' },
  }, required: ['afirmacao', 'evidencia_ou_citacao', 'aplicavel_ao_estudo', 'como_aplicar_aqui'] } },
  recomendacoes_de_analise: { type: 'array', items: { type: 'object', properties: {
    titulo: { type: 'string' }, descricao: { type: 'string' }, por_que_importa: { type: 'string' },
  }, required: ['titulo', 'descricao'] } },
  referencias: { type: 'array', items: { type: 'object', properties: {
    titulo: { type: 'string' }, url: { type: 'string' }, tipo: { type: 'string' },
  }, required: ['titulo', 'url'] } },
  nao_encontrado: { type: 'array', items: { type: 'string' } },
}, required: ['tema', 'achados', 'recomendacoes_de_analise', 'referencias'] }

const BRIEF = { type: 'object', properties: {
  brief_markdown: { type: 'string' },
  principios_da_literatura: { type: 'array', items: { type: 'string' } },
  alertas_metodologicos: { type: 'array', items: { type: 'string' } },
  ideias_de_analise: { type: 'array', items: { type: 'object', properties: {
    titulo: { type: 'string' }, descricao: { type: 'string' }, origem: { type: 'string' },
  }, required: ['titulo', 'descricao', 'origem'] } },
}, required: ['brief_markdown', 'principios_da_literatura', 'alertas_metodologicos', 'ideias_de_analise'] }

const REVISAO = { type: 'object', properties: {
  secao_id: { type: 'string' }, secao_titulo: { type: 'string' },
  nota_rigor: { type: 'integer', minimum: 1, maximum: 5 },
  nota_clareza: { type: 'integer', minimum: 1, maximum: 5 },
  nota_organizacao: { type: 'integer', minimum: 1, maximum: 5 },
  pontos_fortes: { type: 'array', items: { type: 'string' } },
  problemas: { type: 'array', items: { type: 'object', properties: {
    tipo: { type: 'string', enum: ['estatistico', 'causal', 'clareza', 'organizacao', 'dado', 'redundancia', 'contradicao'] },
    descricao: { type: 'string' },
    gravidade: { type: 'string', enum: ['alta', 'media', 'baixa'] },
    correcao_sugerida: { type: 'string' },
  }, required: ['tipo', 'descricao', 'gravidade', 'correcao_sugerida'] } },
  o_que_falta: { type: 'array', items: { type: 'string' } },
  confronto_com_literatura: { type: 'array', items: { type: 'string' } },
  veredito_uma_frase: { type: 'string' },
}, required: ['secao_id', 'secao_titulo', 'nota_rigor', 'nota_clareza', 'nota_organizacao', 'pontos_fortes', 'problemas', 'o_que_falta', 'confronto_com_literatura', 'veredito_uma_frase'] }

const PROPOSTAS = { type: 'object', properties: {
  angulo: { type: 'string' },
  diagnostico_do_angulo: { type: 'string' },
  propostas: { type: 'array', items: { type: 'object', properties: {
    titulo: { type: 'string' }, pergunta: { type: 'string' }, por_que_importa: { type: 'string' },
    hipotese: { type: 'string' },
    dados: { type: 'array', items: { type: 'object', properties: {
      base: { type: 'string' }, coluna_ou_derivacao: { type: 'string' },
      existe: { type: 'string', enum: ['sim', 'derivavel', 'nao'] },
    }, required: ['base', 'coluna_ou_derivacao', 'existe'] } },
    metodo: { type: 'string' },
    saida_na_tela: { type: 'string' },
    secao_destino: { type: 'string' },
    esforco: { type: 'string', enum: ['baixo', 'medio', 'alto'] },
    risco_metodologico: { type: 'string' },
    referencia_literatura: { type: 'string' },
  }, required: ['titulo', 'pergunta', 'por_que_importa', 'hipotese', 'dados', 'metodo', 'saida_na_tela', 'secao_destino', 'esforco', 'risco_metodologico'] } },
}, required: ['angulo', 'diagnostico_do_angulo', 'propostas'] }

const REORG = { type: 'object', properties: {
  diagnostico: { type: 'string' },
  estrutura_proposta: { type: 'array', items: { type: 'object', properties: {
    secao_nova: { type: 'string' }, pergunta_que_responde: { type: 'string' },
    blocos: { type: 'array', items: { type: 'string' } },
    vem_de: { type: 'array', items: { type: 'string' } },
    por_que_aqui: { type: 'string' },
  }, required: ['secao_nova', 'pergunta_que_responde', 'blocos', 'vem_de'] } },
  cortar: { type: 'array', items: { type: 'object', properties: { o_que: { type: 'string' }, por_que: { type: 'string' } }, required: ['o_que', 'por_que'] } },
  fundir: { type: 'array', items: { type: 'object', properties: { o_que: { type: 'string' }, com: { type: 'string' }, por_que: { type: 'string' } }, required: ['o_que', 'com', 'por_que'] } },
  a_historia_em_cinco_frases: { type: 'array', items: { type: 'string' } },
  o_que_um_diretor_ve_primeiro: { type: 'array', items: { type: 'string' } },
}, required: ['diagnostico', 'estrutura_proposta', 'cortar', 'fundir', 'a_historia_em_cinco_frases', 'o_que_um_diretor_ve_primeiro'] }

const VERDICT = { type: 'object', properties: {
  titulo: { type: 'string' },
  viavel: { type: 'boolean' }, viabilidade_motivo: { type: 'string' },
  colunas_conferidas: { type: 'array', items: { type: 'string' } },
  redundante_com: { type: 'string' },
  rigor_ok: { type: 'boolean' }, rigor_problemas: { type: 'array', items: { type: 'string' } },
  profundidade: { type: 'integer', minimum: 1, maximum: 5 },
  clareza_esperada: { type: 'integer', minimum: 1, maximum: 5 },
  ajuste_recomendado: { type: 'string' },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['titulo', 'viavel', 'viabilidade_motivo', 'colunas_conferidas', 'redundante_com', 'rigor_ok', 'rigor_problemas', 'profundidade', 'clareza_esperada', 'ajuste_recomendado', 'veredito'] }

// ---------------- fase 1 + 2 em paralelo ----------------
log('Mapeando a aba, os dados e o conhecimento; pesquisando as referencias em paralelo')

const SECOES = [
  ['linha', 'A linha do acesso'], ['vantagem', 'De onde vem a vantagem'], ['ataque', 'Ataque e defesa'],
  ['parada', 'Bola parada'], ['elenco', 'Elenco, dinheiro e idade'], ['fisico', 'Fisico'],
  ['jogo', 'O jogo'], ['quadro', 'O quadro geral'], ['ano', 'A temporada'], ['metodo', 'Metodo e ressalvas'],
]

const PESQUISAS = [
  { key: 'sumpter', tema: 'David Sumpter', prompt: 'David Sumpter (Soccermatics, "The Ten Equations That Rule the World", Football Hackers, colunas no Guardian/Nordic Bet, twelve.football). O que ele diz sobre: quais estatisticas de fato preveem resultado; xG e sua interpretacao; passing networks e "zonas de controle"; o papel do acaso no futebol; o que um clube deveria medir. Procure texto original dele (livros, artigos, blog, palestras), nao resenhas de terceiros quando puder.' },
  { key: 'liverpool', tema: 'Liverpool FC / Ian Graham', prompt: 'A ciencia de dados do Liverpool FC sob Ian Graham, William Spearman, Tim Waskett e Dafydd Steele: o livro "How to Win the Premier League" (Ian Graham, 2024), o modelo de possession value / goal probability added, pitch control (Spearman), como avaliavam jogadores e treinadores (a contratacao de Klopp, de Salah, de Robertson), o que eles consideram sinal e o que consideram ruido, e a relacao entre o modelo e a decisao. Tambem a passagem de Ian Graham por Tottenham e a consultoria Ludonautics.' },
  { key: 'promocao', tema: 'O que prediz promocao em segundas divisoes', prompt: 'Estudos, artigos e analises (academicos ou de praticantes: Opta/Stats Perform, StatsBomb, The Athletic, blogs analiticos, CIES) sobre o que distingue times promovidos em segundas divisoes: EFL Championship, 2. Bundesliga, Serie B da Italia, Segunda espanhola e a propria Serie B do Brasil. Pontos necessarios, xG, saldo, valor do elenco, estabilidade do elenco, troca de treinador, desempenho no segundo turno, casa/fora. Inclua o que se sabe da Serie B do Brasil especificamente (Espiao Estatistico, Footstats, GE, Chance de Gol, Infobola).' },
  { key: 'fisico', tema: 'Fisico e sucesso', prompt: 'Pesquisa sobre desempenho FISICO e resultado no futebol profissional: white papers e artigos do SkillCorner (physical benchmarks, off-ball runs, PSV-99, "physical output vs league success"), StatsBomb/Hudl physical data, estudos de Bundesliga/Premier League/La Liga sobre distancia total x alta intensidade x sprint e resultado, a ideia de que "correr mais nao ganha" e o que ganha, perfis fisicos por posicao, e diferencas entre primeira e segunda divisao. Inclua artigos cientificos (Journal of Sports Sciences, Int J Sports Physiol Perform, Sports Medicine) se achar.' },
  { key: 'elenco', tema: 'Elenco, idade, continuidade, valor, lesoes', prompt: 'O que a literatura diz sobre construcao de elenco e resultado: estabilidade/rotatividade do elenco (CIES Football Observatory: "squad stability" e pontos), curvas de idade por posicao (pico de desempenho), concentracao de minutos, relacao entre folha salarial/valor de mercado e posicao (Kuper & Szymanski, Soccernomics; Deloitte), e LESOES x disponibilidade x pontos (Premier Injuries, "injury cost", estudos de "availability is the best ability", UEFA Elite Club Injury Study). Foco em achados quantitativos aplicaveis a um estudo de 80 clube-temporada.' },
  { key: 'bolaparada', tema: 'Bola parada', prompt: 'Analytics de bola parada: que fatia dos gols vem de bola parada em ligas profissionais; o que prediz sucesso em bola parada (Ted Knutson/StatsBomb, Brentford, Arsenal com Nicolas Jover, Midtjylland, Set Piece Analytics); modelos de escanteio e falta; se bola parada e habilidade repetivel ano a ano; como medir sem ter o evento "gol de bola parada" marcado. Inclua a distincao entre volume de bolas paradas e eficiencia.' },
  { key: 'metodo', tema: 'Metodologia', prompt: 'Metodologia em analytics de futebol: correlacao x causacao; regressao a media; PERSISTENCIA da finalizacao acima/abaixo do xG entre temporadas (o que Opta, StatsBomb, Sumpter, Ben Torvaney, Danny Page e outros mostraram sobre "finishing skill" no nivel de time e de jogador); tamanho de amostra e significancia com ~80 observacoes e muitas correlacoes (multiple comparisons, falsos achados); shrinkage/Bayes; ajuste por game state; validacao fora da amostra entre temporadas; vies de sobrevivencia; causalidade reversa (time perdendo troca mais). Traga exemplos concretos e as regras praticas que os bons analistas seguem.' },
  { key: 'pressao', tema: 'Pressao e transicao', prompt: 'Analytics de pressao e transicao: o que o PPDA mede e onde falha; alternativas (high turnovers, pressures em zonas, "counterpressing" de Klopp/Rangnick estudado com dados; StatsBomb pressures; Opta "high turnovers"); valor de posse das transicoes; a relacao entre intensidade de pressao e resultado, e se ela vale igual em ligas de segundo nivel. Inclua se ha evidencia de que pressionar alto reduz a qualidade do chute concedido.' },
]

const mapeamento = parallel([
  () => agent(`${CONTEXTO_GERAL}

TAREFA: MAPEAR A ABA a partir do texto RENDERIZADO (o que o usuario le), em ${TXT}. Leia o arquivo inteiro.
Para CADA uma das dez secoes, liste cada bloco com: nome; a pergunta que ele responde; os dados que usa (deduza: xG, remates, valor de mercado, minutos, SkillCorner...); o metodo (media sobe x cai? correlacao com a posicao? contagem?); a afirmacao principal em uma frase; os numeros-chave citados; as ressalvas que o proprio texto declara.
Depois: descreva o FIO NARRATIVO da aba (que historia ela conta, na ordem em que conta); liste REDUNDANCIAS (o mesmo achado dito em mais de um lugar, ex.: concentracao de minutos aparece em Elenco E no Quadro geral); liste CONTRADICOES INTERNAS (ex.: uma secao diz que a defesa e igual entre sobe e 5o-8o, outra diz que a pior defesa cai sempre — sao compativeis? explique); liste afirmacoes que aparecem SEM numero que as sustente.
Seja exaustivo: este mapa e a base de todo o resto.`, { label: 'mapa:aba', phase: 'Mapear', schema: MAPA_ABA }),

  () => agent(`${CONTEXTO_GERAL}

TAREFA: MAPEAR OS DADOS de verdade, lendo os arquivos. Use Bash com python3/pandas (ou head/wc) sobre ${DADOS}:
- serieb_clube_temporada.csv (liste TODAS as 288 colunas agrupadas por tema, com cobertura de nulos das mais importantes),
- serieb_tecnico.csv (colunas por atleta — liste as ~120, agrupadas: passe, duelo, drible, remate, defesa, goleiro...),
- serieb_jogos.csv (colunas por clube-partida — liste todas; note que ha 9.318 linhas mas so 3.570 de Serie B — descubra o que sao as outras),
- serieb_elencos.csv,
- serieb_lesoes.csv (NOVO: descreva a estrutura, quantas lesoes por temporada, tipos de lesao mais comuns, dias por temporada, e como ela pode ser cruzada com serieb_elencos via id_jogador e com quem sobe/cai),
- static/sb_clubes.js em ${RAIZ}/static (os 221 campos que a aba carrega — leia o comentario de cabecalho e a lista SB_CAMPOS).
Depois responda: que colunas EXISTEM nas bases e NAO aparecem na aba renderizada (${TXT})? Quais delas sao promissoras para "o diferencial de quem sobe" e por que? Que limitacoes de dado (cobertura, granularidade, proxy) restringem o que da para afirmar?
Nao invente colunas: liste so o que leu.`, { label: 'mapa:dados', phase: 'Mapear', schema: MAPA_DADOS }),

  () => agent(`${CONTEXTO_GERAL}

TAREFA: EXTRAIR O CONHECIMENTO ACUMULADO do arquivo ${CONTEXTO} (e um documento longo, ~110 KB, escrito ao longo do projeto; leia INTEIRO, em pedacos se preciso). Extraia:
- ACHADOS ja estabelecidos sobre o diferencial de quem sobe (tema, afirmacao, evidencia/numero),
- ARMADILHAS de dado e metodo ja pagas (ex.: homonimos SkillCorner x Wyscout, xG do Wyscout calibrado para outro futebol, idade do Wyscout atrasada, empate em posto vira media, euro x porcentagem, regua p90 x p30tip, causalidade reversa...),
- PENDENCIAS declaradas (o que o autor sabe que falta: troca de treinador, gol de bola parada, peak velocity, lesoes ainda nao cruzadas...),
- PRINCIPIOS de trabalho (ex.: "o dado e a fonte, o texto e consequencia"; nao fabricar media de amostra fina; limiar de significancia sai da amostra),
- METODOS usados (como se define sobe/cai, como se calcula a correlacao, ponderacao por minuto, limiar de Fisher, faixas de idade fechadas a esquerda...), com onde estao no codigo se o arquivo disser.
Fidelidade ao texto: nao adicione o que nao esta la.`, { label: 'mapa:conhecimento', phase: 'Mapear', schema: CONHECIMENTO }),

  () => agent(`${CONTEXTO_GERAL}

TAREFA: MAPEAR OS METODOS NO CODIGO. Leia ${ANALISE} inteiro (e um script de ~700 linhas com docstrings longas e explicativas) e, em ${APPJS}, as funcoes da aba Serie B: procure com grep por "function sb" e leia sbRho, sbPostos, sbCorr, sbPorFaixa, sbComp, sbResumo, sbBlocoFisicoPosicao, sbFisDetalhe e o bloco "Como os indicadores conversam entre si" (procure por "alavancas" e "explica").
Descreva com precisao: (1) como sobe/meio/cai sao definidos; (2) como a correlacao com a posicao e calculada (postos dentro do ano? empates? Pearson ou Spearman?); (3) como as medias sao ponderadas; (4) como o "quarteto de alavancas" foi escolhido (busca exaustiva? stepwise? sobre R2?) e se ha validacao fora da amostra; (5) como o limiar de significancia e calculado; (6) como a ponte SkillCorner-Wyscout funciona e sua taxa de acerto; (7) qualquer decisao metodologica que voce, como estatistico, questionaria — e por que.
Retorne no mesmo esquema do conhecimento, preenchendo principalmente "metodos" e "armadilhas".`, { label: 'mapa:metodos', phase: 'Mapear', schema: CONHECIMENTO }),

  ...PESQUISAS.map(p => () => agent(`${CONTEXTO_GERAL}

VOCE E UM PESQUISADOR SENIOR DE ANALYTICS DE FUTEBOL. Carregue as ferramentas de web com ToolSearch (query "select:WebSearch,WebFetch") e PESQUISE NA WEB o tema abaixo. Faca varias buscas (em ingles e portugues), abra as fontes primarias (livros, papers, white papers, posts de autores) e leia de verdade — nao se contente com o snippet da busca.

TEMA: ${p.tema}
${p.prompt}

ENTREGUE: achados concretos (cada um com a evidencia/citacao e a URL), marcando se e aplicavel a ESTE estudo (80 clube-temporada da Serie B, dados Wyscout + Transfermarkt + SkillCorner, foco tecnico e fisico) e COMO aplicar aqui com os dados descritos no contexto; recomendacoes de analises novas que a literatura sugere e a aba ainda nao faz; a lista de referencias com URL; e o que voce procurou e NAO achou (para ninguem repetir a busca). Minimo de 8 achados substantivos. Prefira fonte primaria a resenha.`, { label: 'pesquisa:' + p.key, phase: 'Pesquisar', schema: PESQUISA, effort: 'high' })),
])

const [mapaAba, mapaDados, conhecimento, metodos, ...pesquisas] = await mapeamento
const pesquisasOk = pesquisas.filter(Boolean)
log(`Mapa: ${mapaAba ? mapaAba.secoes.length : 0} secoes, ${mapaDados ? mapaDados.bases.length : 0} bases, ${conhecimento ? conhecimento.achados.length : 0} achados; pesquisas: ${pesquisasOk.length}/${PESQUISAS.length}`)
if (pesquisas.length !== pesquisasOk.length) log(`ATENCAO: ${pesquisas.length - pesquisasOk.length} pesquisa(s) falharam e ficam de fora`)

// ---------------- brief da literatura (barreira legitima: os revisores precisam de TUDO) ----------------
phase('Pesquisar')
const brief = await agent(`${CONTEXTO_GERAL}

TAREFA: CONDENSAR a pesquisa de ${pesquisasOk.length} temas num BRIEF que os revisores e os proponentes vao usar. Abaixo, os resultados brutos (JSON). Escreva um brief em markdown de ate ~2.500 palavras, organizado por tema, que diga: o que a literatura ESTABELECE (com a fonte entre parenteses), o que e CONTROVERSO, e o que isso implica para um estudo de 80 clube-temporada da Serie B com dados tecnicos e fisicos. Depois liste separadamente: PRINCIPIOS da literatura (frases curtas e citaveis), ALERTAS METODOLOGICOS (o que costuma dar errado em estudos assim), e IDEIAS DE ANALISE que a literatura sugere e que os dados descritos no contexto permitem (com a origem de cada ideia).

PESQUISAS:
${JSON.stringify(pesquisasOk, null, 1).slice(0, 180000)}`, { label: 'brief:literatura', phase: 'Pesquisar', schema: BRIEF, effort: 'high' })

const briefTxt = brief ? brief.brief_markdown : '(brief indisponivel)'
const alertas = brief ? brief.alertas_metodologicos : []
const ideiasLit = brief ? brief.ideias_de_analise : []
log(`Brief: ${brief ? brief.ideias_de_analise.length : 0} ideias da literatura, ${alertas.length} alertas`)

// ---------------- fase 3: revisar cada secao (pipeline, sem barreira entre secoes) ----------------
phase('Revisar')
const mapaJson = JSON.stringify(mapaAba || {}, null, 1)
const conhecJson = JSON.stringify(conhecimento || {}, null, 1).slice(0, 40000)
const metodosJson = JSON.stringify(metodos || {}, null, 1).slice(0, 30000)
const dadosJson = JSON.stringify(mapaDados || {}, null, 1).slice(0, 40000)

const revisoes = await pipeline(SECOES,
  ([id, titulo]) => agent(`${CONTEXTO_GERAL}

VOCE E UM REVISOR SENIOR — analista de futebol E estatistico — revisando UMA secao da aba. Seja exigente como um referee de paper, mas pratico como um diretor de futebol: o objetivo e a aba ficar MAIS PROFUNDA, MAIS CLARA e MAIS ORGANIZADA.

SECAO A REVISAR: "${titulo}" (id ${id}). O texto renderizado dela esta em ${TXT} — leia o arquivo e localize a secao pelo titulo (leia tambem as vizinhas para julgar redundancia e contradicao).

MATERIAL DE APOIO:
1) O MAPA DA ABA (todas as secoes, para ver redundancia/contradicao):
${mapaJson.slice(0, 30000)}
2) O CONHECIMENTO ACUMULADO DO PROJETO (achados, armadilhas, pendencias):
${conhecJson.slice(0, 20000)}
3) OS METODOS NO CODIGO:
${metodosJson.slice(0, 15000)}
4) O BRIEF DA LITERATURA:
${briefTxt.slice(0, 20000)}
5) ALERTAS METODOLOGICOS DA LITERATURA: ${JSON.stringify(alertas)}

AVALIE: rigor estatistico (n=80; 16 sobe x 16 cai; correlacoes multiplas; causalidade reversa; proxies; o que e ruido), clareza (um diretor de futebol entende? o numero esta na direcao certa? a regua esta declarada?), organizacao (a ordem faz sentido? cabe aqui ou em outra secao?). Liste PONTOS FORTES (o que preservar), PROBLEMAS (cada um com tipo, gravidade e a correcao concreta), O QUE FALTA (a pergunta que um especialista faria e a secao nao responde), e o CONFRONTO COM A LITERATURA (onde a secao concorda, contradiz ou ignora o que se sabe). De notas de 1 a 5. Termine com um veredito de uma frase.
Seja especifico: cite o numero, a frase, o bloco. Nada de generico.`, { label: 'revisao:' + id, phase: 'Revisar', schema: REVISAO, effort: 'high' })
)
const revisoesOk = revisoes.filter(Boolean)
log(`Revisoes: ${revisoesOk.length}/${SECOES.length}; problemas de gravidade alta: ${revisoesOk.reduce((a, r) => a + r.problemas.filter(p => p.gravidade === 'alta').length, 0)}`)

// ---------------- fase 4: propor (painel por angulo + reorganizacao) ----------------
phase('Propor')
const revisoesJson = JSON.stringify(revisoesOk.map(r => ({ secao: r.secao_titulo, notas: [r.nota_rigor, r.nota_clareza, r.nota_organizacao], problemas: r.problemas, falta: r.o_que_falta, veredito: r.veredito_uma_frase })), null, 1)

const ANGULOS = [
  { key: 'tecnico', nome: 'Processo tecnico ofensivo e defensivo', foco: 'a cadeia do gol (volume -> qualidade -> conversao), repetibilidade entre temporadas, pressao e transicao, game state, o que separa criar de finalizar, o que a base de partidas (serieb_jogos, 3.570 clube-partida) permite que o nivel clube-temporada esconde (ex.: distribuicao de resultados, variancia, jogos decididos por 1 gol, desempenho contra cada faixa, como o time joga quando esta vencendo/perdendo).' },
  { key: 'fisico', nome: 'Fisico', foco: 'perfis fisicos por posicao e por fase (com/sem bola), corridas sem bola por tipo, teto de velocidade x volume, relacao entre fisico e o processo tecnico (um time que pressiona corre diferente?), o que muda entre 1o e 2o turno, carga x disponibilidade (cruzar com lesoes), o que a literatura do SkillCorner/Liverpool recomenda e a aba nao faz, e como apresentar o fisico para um diretor sem afogar em 32 indicadores.' },
  { key: 'elenco', nome: 'Elenco, economia, idade, continuidade e LESOES', foco: 'a base NOVA de lesoes (2.724 lesoes, 975 atletas, dias por temporada) ainda nao analisada: disponibilidade dos 11 mais usados, dias perdidos por setor, lesao x rotatividade x resultado, e a armadilha da cobertura melhor em anos recentes; alem disso rotatividade, concentracao de minutos, curvas de idade por posicao, valor x resultado, estrangeiros, continuidade ano a ano, e o que Soccernomics/CIES dizem.' },
  { key: 'jogo', nome: 'Dinamica do campeonato', foco: 'quando o acesso se decide (curva de pontos por rodada, probabilidade de subir dada a posicao na rodada k), sequencias, reacao a derrota, casa/fora, contra fortes/fracos, formacoes, o playoff da regra nova (3o-4o x 5o-6o), a lacuna da troca de treinador e como preenche-la ou contorna-la com o que ha (ex.: quebras de formacao, mudanca brusca de escalacao como proxy).' },
  { key: 'preditivo', nome: 'Modelagem e previsao', foco: 'um modelo de acesso honesto para n=80: quais variaveis, como validar FORA DA AMOSTRA entre temporadas (treinar em 3, testar na 4a), shrinkage, o quarteto de alavancas e robusto ou e garimpo?, probabilidade de subir na rodada 19/27 para 2026, como comunicar incerteza, e o que Sumpter/Graham fariam com este dado.' },
]

const proponentes = await parallel([
  ...ANGULOS.map(a => () => agent(`${CONTEXTO_GERAL}

VOCE E UM ANALISTA SENIOR DE FUTEBOL, referencia na area, convidado a propor ANALISES MAIS PROFUNDAS para este estudo sob UM angulo. Pense como quem trabalhou em Liverpool, Brentford ou Midtjylland e leu Sumpter: pergunte "o que decide de verdade" e "o que e ruido", e proponha o que um diretor de futebol da Serie B usaria para montar elenco.

SEU ANGULO: ${a.nome}
FOCO: ${a.foco}

O QUE JA EXISTE (nao repita; aprofunde, corrija ou substitua):
- Texto renderizado da aba: ${TXT} (leia).
- Mapa da aba: ${mapaJson.slice(0, 20000)}
- Revisoes por secao (problemas e o que falta): ${revisoesJson.slice(0, 25000)}
- Dados disponiveis (colunas reais — proponha SO com o que existe ou e derivavel disto): ${dadosJson.slice(0, 30000)}
- Conhecimento acumulado e armadilhas: ${conhecJson.slice(0, 15000)}
- Brief da literatura: ${briefTxt.slice(0, 18000)}
- Ideias que a literatura sugere: ${JSON.stringify(ideiasLit).slice(0, 8000)}

Proponha de 5 a 8 analises. Para CADA uma: titulo; a pergunta exata; por que importa para o diferencial de quem sobe; a hipotese (o que voce espera achar e por que); os DADOS (base + coluna ou derivacao, e se ja existe / e derivavel / nao existe — seja honesto, confira contra a lista de colunas); o METODO (passo a passo, com a regra de sobe/cai e a correlacao por posto do projeto, ou justifique outro); a SAIDA NA TELA (que grafico/tabela/frase o usuario veria); a secao de destino; esforco; o risco metodologico (n=80, causalidade reversa, cobertura); e a referencia da literatura que sustenta.
Antes das propostas, um DIAGNOSTICO do seu angulo na aba atual em ate 5 frases: o que esta bom, o que esta raso, o que esta errado.
Priorize profundidade e clareza sobre quantidade. Nada de proposta que precise de dado que nao existe sem dizer que nao existe.`, { label: 'propor:' + a.key, phase: 'Propor', schema: PROPOSTAS, effort: 'high' })),

  () => agent(`${CONTEXTO_GERAL}

VOCE E UM EDITOR-CHEFE DE ANALYTICS (pense em quem edita o The Athletic ou escreve para um conselho de clube). Sua tarefa e REORGANIZAR A NARRATIVA da aba: hoje sao 10 secoes que cresceram por acumulo; o objetivo e uma historia unica, mais clara e mais organizada, que um diretor de futebol leia de cima a baixo e saiba o que fazer.

Leia o texto renderizado: ${TXT}.
Mapa da aba (com fio narrativo, redundancias e contradicoes ja detectadas): ${mapaJson.slice(0, 30000)}
Revisoes por secao: ${revisoesJson.slice(0, 25000)}
Brief da literatura (para a hierarquia dos achados): ${briefTxt.slice(0, 12000)}

ENTREGUE: um diagnostico da organizacao atual; a ESTRUTURA PROPOSTA (secoes novas, cada uma com a pergunta que responde, os blocos que contem e de onde vem cada bloco na aba atual — pode fundir, dividir, reordenar); o que CORTAR (e por que: redundante, raso, ruido, nao acionavel); o que FUNDIR; A HISTORIA EM CINCO FRASES (o que a aba inteira diz, na ordem certa); e O QUE UM DIRETOR VE PRIMEIRO (os 5 numeros/afirmacoes que deveriam abrir a aba). Respeite os principios do projeto: o dado e a fonte; ressalvas explicitas; regua declarada.`, { label: 'propor:reorganizacao', phase: 'Propor', schema: REORG, effort: 'high' }),
])

const propostasPorAngulo = proponentes.slice(0, ANGULOS.length).filter(Boolean)
const reorg = proponentes[ANGULOS.length]
const todasPropostas = propostasPorAngulo.flatMap(p => p.propostas.map(x => ({ ...x, angulo: p.angulo })))
log(`Propostas: ${todasPropostas.length} de ${propostasPorAngulo.length} angulos; reorganizacao: ${reorg ? reorg.estrutura_proposta.length + ' secoes propostas' : 'indisponivel'}`)

// ---------------- fase 5: verificar cada proposta (pipeline; duas lentes; sem barreira) ----------------
phase('Verificar')
const existentes = mapaAba ? mapaAba.secoes.flatMap(s => s.blocos.map(b => s.titulo + ' > ' + b.nome + ': ' + b.afirmacao_principal)).join('\n') : ''

const verificadas = await pipeline(todasPropostas,
  (p) => parallel([
    () => agent(`${CONTEXTO_GERAL}

VOCE E UM VERIFICADOR CETICO — lente: VIABILIDADE E REDUNDANCIA. Tente DERRUBAR a proposta abaixo. Padrao: se nao conseguir confirmar que o dado existe, marque viavel=false.
1) VIABILIDADE: confira nos ARQUIVOS REAIS (use Bash/python sobre ${DADOS} e ${RAIZ}/static/sb_clubes.js) se cada coluna/derivacao citada existe, com que cobertura, e na granularidade certa. Liste as colunas que conferiu e o que achou.
2) REDUNDANCIA: compare com o que a aba JA mostra (lista abaixo). Se a proposta e o mesmo achado com outra roupa, diga com qual bloco.
3) De notas de profundidade (1-5: responde algo que a aba nao responde?) e clareza esperada.
4) Veredito: aprovar / ajustar (diga o ajuste concreto) / rejeitar.

PROPOSTA (angulo ${p.angulo}):
${JSON.stringify(p, null, 1)}

O QUE A ABA JA MOSTRA:
${existentes.slice(0, 12000)}`, { label: 'verif:dado:' + p.titulo.slice(0, 28), phase: 'Verificar', schema: VERDICT, effort: 'high' }),

    () => agent(`${CONTEXTO_GERAL}

VOCE E UM VERIFICADOR CETICO — lente: RIGOR ESTATISTICO E CAUSAL. Tente DERRUBAR a proposta abaixo. n=80 clube-temporada (16 sobe, 16 cai); muitas correlacoes ja feitas (risco de falso achado); causalidade reversa (time caindo troca mais, compra atacante, comete falta); proxies (xG do Wyscout calibrado para outro futebol; valor de mercado nao e folha; lesao do Transfermarkt cobre melhor o recente); SkillCorner rastreia ~15 jogos por atleta, nao 38.
Responda: o metodo proposto aguenta esse n? A conclusao que a proposta promete e defensavel ou vai virar "0,15 com cara de achado"? Ha um jeito mais honesto (shrinkage, validacao entre temporadas, limiar por Fisher, comparar com base aleatoria)? Que ressalva TEM de aparecer na tela? Profundidade e clareza esperadas (1-5). Veredito: aprovar / ajustar (com o ajuste) / rejeitar. Preencha "viavel" como true (a viabilidade do dado e julgada por outro verificador) e "colunas_conferidas" vazio.

ALERTAS DA LITERATURA: ${JSON.stringify(alertas).slice(0, 4000)}

PROPOSTA (angulo ${p.angulo}):
${JSON.stringify(p, null, 1)}`, { label: 'verif:rigor:' + p.titulo.slice(0, 28), phase: 'Verificar', schema: VERDICT, effort: 'high' }),
  ]).then(([dado, rigor]) => ({ proposta: p, dado, rigor })),
)
const verificadasOk = verificadas.filter(Boolean)
const aprovadas = verificadasOk.filter(v => v.dado && v.rigor && v.dado.veredito !== 'rejeitar' && v.rigor.veredito !== 'rejeitar')
const rejeitadas = verificadasOk.filter(v => !aprovadas.includes(v))
log(`Verificacao: ${aprovadas.length} propostas sobrevivem (aprovar/ajustar), ${rejeitadas.length} rejeitadas por pelo menos uma lente`)

// ---------------- fase 6: sintetizar ----------------
phase('Sintetizar')
const relatorio = await agent(`${CONTEXTO_GERAL}

VOCE E O AUTOR DO RELATORIO FINAL de uma revisao especialista. Escreva em portugues do Brasil, na voz do projeto (direta, concreta, com numero, sem jargao gratuito; ressalvas explicitas; "o dado e a fonte"). Publico: o dono do projeto, que e analista e vai IMPLEMENTAR o que for aprovado. O relatorio vai virar uma pagina; use markdown com titulos, tabelas e listas.

ESTRUTURA OBRIGATORIA:
# Revisao da aba Analise Serie B — o diferencial de quem sobe
## 1. Resumo executivo (10 a 15 linhas: o que esta forte, o que esta fraco, as 5 mudancas de maior impacto)
## 2. O que a literatura diz e o que isso muda aqui (sintese do brief: principios, com fontes; onde a aba concorda, contradiz ou ignora)
## 3. Revisao secao por secao (para cada uma das 10: notas rigor/clareza/organizacao; pontos fortes a preservar; problemas com gravidade e correcao concreta; o que falta) — use uma tabela-resumo no comeco e depois o detalhe
## 4. Contradicoes e redundancias internas (e como resolver cada uma)
## 5. Analises novas propostas — APROVADAS (para cada: pergunta, por que importa, hipotese, dados (colunas conferidas), metodo, saida na tela, secao de destino, esforco, ressalva obrigatoria, veredito dos verificadores e o ajuste que eles pediram). Ordene por impacto/esforco. Marque as que usam a base NOVA de lesoes.
## 6. Propostas rejeitadas e por que (curto, para nao serem repropostas)
## 7. Reorganizacao da narrativa (a estrutura nova, o que cortar, o que fundir, a historia em cinco frases, o que um diretor ve primeiro)
## 8. Roteiro de implementacao (ordem sugerida em 3 ondas, com dependencias de dado; o que precisa de exportacao nova do Wyscout ou de sync no SkillCorner)
## 9. Referencias (titulo + URL, agrupadas por tema)

MATERIAL (JSON):
MAPA DA ABA: ${mapaJson.slice(0, 25000)}
DADOS: ${dadosJson.slice(0, 20000)}
CONHECIMENTO: ${conhecJson.slice(0, 12000)}
METODOS: ${metodosJson.slice(0, 10000)}
BRIEF DA LITERATURA: ${briefTxt}
PRINCIPIOS: ${JSON.stringify(brief ? brief.principios_da_literatura : [])}
REVISOES: ${JSON.stringify(revisoesOk, null, 1).slice(0, 60000)}
PROPOSTAS APROVADAS (com os dois vereditos): ${JSON.stringify(aprovadas, null, 1).slice(0, 90000)}
PROPOSTAS REJEITADAS: ${JSON.stringify(rejeitadas.map(v => ({ titulo: v.proposta.titulo, angulo: v.proposta.angulo, dado: v.dado && v.dado.veredito + ': ' + v.dado.viabilidade_motivo, rigor: v.rigor && v.rigor.veredito + ': ' + v.rigor.rigor_problemas.join('; ') })), null, 1).slice(0, 20000)}
REORGANIZACAO: ${JSON.stringify(reorg, null, 1).slice(0, 25000)}
REFERENCIAS: ${JSON.stringify(pesquisasOk.flatMap(p => p.referencias.map(r => ({ tema: p.tema, ...r }))), null, 1).slice(0, 25000)}

Nao resuma demais: o relatorio deve permitir implementar sem voltar ao material bruto. Cite numeros. Onde dois verificadores discordarem, diga e decida com justificativa.`, { label: 'relatorio', phase: 'Sintetizar', effort: 'high' })

return {
  relatorio,
  resumo: {
    secoes_mapeadas: mapaAba ? mapaAba.secoes.length : 0,
    pesquisas_ok: pesquisasOk.length,
    revisoes_ok: revisoesOk.length,
    propostas_total: todasPropostas.length,
    propostas_aprovadas: aprovadas.length,
    propostas_rejeitadas: rejeitadas.length,
    reorganizacao: !!reorg,
  },
  brief: briefTxt,
  revisoes: revisoesOk,
  aprovadas,
  rejeitadas: rejeitadas.map(v => ({ titulo: v.proposta.titulo, angulo: v.proposta.angulo })),
  reorg,
  referencias: pesquisasOk.flatMap(p => p.referencias.map(r => ({ tema: p.tema, ...r }))),
}