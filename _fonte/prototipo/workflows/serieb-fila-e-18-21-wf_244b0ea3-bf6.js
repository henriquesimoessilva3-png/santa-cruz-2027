export const meta = {
  name: 'serieb-fila-e-18-21',
  description: 'Fecha a conferencia do prototipo.json, mede o perfil FISICO dos que subiram (2022-2025) contra meio e cai, e constroi + testa cego a base tecnica de 2018-2021',
  phases: [
    { title: 'Conferir', detail: 'tres ceticos recalculam blocos do prototipo.json por caminho proprio' },
    { title: 'Fisico', detail: 'perfil fisico dos que subiram contra meio e contra cai' },
    { title: 'Fisico-verifica', detail: 'dois ceticos tentam refutar os achados fisicos' },
    { title: 'Base18-21', detail: 'processador dos 80 clube-temporada tecnicos de 2018-2021' },
    { title: 'Base-confere', detail: 'dois conferentes batem a base nova contra as tabelas' },
    { title: 'Cego', detail: 'eixos e cortes congelados em 2022-2025, aplicados as cegas em 2018-2021' },
    { title: 'Cego-confere', detail: 'um cetico tenta derrubar o teste cego' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B: o que separa quem SOBE de quem
fica no MEIO e de quem CAI.

FERRAMENTAS: numpy, pandas, scipy, sklearn, matplotlib SIM. statsmodels, pulp, ortools NAO.
Residualizacao com np.linalg.lstsq.

REGRAS DA CASA (valem sobre qualquer outra coisa):
- Semente fixa em tudo que sorteia: rng = np.random.default_rng(7).
- NENHUMA frase escrita a mao passando por medida. Toda afirmacao carrega n, p e rho.
- Onde o dado nao existe, grave a ausencia COM O MOTIVO. Nunca impute.
- 2026 tem 27 de 38 rodadas e NAO entra em media nenhuma.
- Normalize Unicode (NFC) antes de comparar QUALQUER nome. O macOS grava nome de arquivo em
  NFD e os JSON estao em NFC: "Avai" com acento decomposto != "Avai" com acento composto, e
  12 clubes "somem" silenciosamente. Ja custou um diagnostico errado nesta semana.
- A coluna de clube certa em serieb_tecnico.csv e "Equipa dentro de um periodo de tempo
  seleccionado". A coluna \`Equipa\` tem 530 valores distintos e esta ERRADA.
- \`Sistema\` em serieb_jogos.csv vem como '4-2-3-1 (70.73%)'. Extraia com regex.

DECISOES JA TOMADAS QUE NAO SE REFAZEM (leia ${RAIZ}/_fonte/prototipo/CONTINUAR.md secao 5):
- Nao existe agrupamento cego. Sob o nulo de mesma covariancia, k=2 nos 16 da p=0,555. O nulo
  de embaralhar coluna e INVALIDO. Nao reabra.
- A tipologia e em eixos DECLARADOS (TERRITORIO e ROTA) e vale porque foi validada em 38
  indicadores que NAO a construiram (eta2 0,410 contra 0,238 do nulo placebo, p=0,0012).
- FISICO NAO EXISTE ANTES DE 2022. Confirmado na API SkillCorner, nao no banco local. Nao
  gaste um minuto procurando dado fisico de 2018-2021.

ARQUIVOS QUE IMPORTAM:
- ${RAIZ}/dados/prototipo.json — 1,08 MB, 24 chaves, etapas 0 a 15. O produto a conferir.
- ${RAIZ}/gerar_prototipo.py — o gerador que o produziu (135 KB).
- ${RAIZ}/_fonte/prototipo/ESPECIFICACAO.md — o metodo, 13 secoes. E o contrato.
- ${RAIZ}/_fonte/prototipo/TIPOLOGIA.md — os quatro grupos dos 16 que subiram.
- ${RAIZ}/dados/serieb_clube_temporada.csv — o painel 2022-2026, 100 linhas x 346 colunas,
  80 completas. Tem 166 colunas fisicas (prefixo fis_) e as tecnicas coletivas.
- ${RAIZ}/dados/serieb_jogos.csv — jogo a jogo 2022-2026, 9318 linhas x 119 colunas,
  3036 delas Serie B. Tem coluna \`ano\`.
- ${RAIZ}/dados/serieb_tecnico.csv — tecnico por jogador 2022-2026, 3866 linhas.
- ${RAIZ}/preparar_serieb_jogos.py — o processador dos Team Stats 2022-2026 (136 arquivos).
- ${RAIZ}/gerar_sb_clubes.py — quem monta o painel clube-temporada a partir do jogo a jogo.`

const LEVANTADO_18_21 = `O QUE JA FOI MEDIDO NESTA SESSAO SOBRE 2018-2021 (confirmado, nao repita):

Os arquivos estao EXTRAIDOS em ${RAIZ}/_fonte/serie_b_jogos_2018_2021/ — 80 arquivos .xlsx,
formato \`Team Stats <Clube> (N).xlsx\`, onde (N) e contador de download, NAO o ano.
Cada arquivo: uma linha por (partida, equipe), 109 colunas, com Data, Jogo, Competicao,
Duracao, Equipa, Sistema.

O manifesto conferido esta em ${RAIZ}/_fonte/prototipo/manifesto_2018_2021.json
(79 linhas: arquivo, clube, clube_raw, temporada, jogos, primeiro, ultimo, anos_civis).

QUATRO ACHADOS QUE MUDAM O PROCESSAMENTO:

1. **A TEMPORADA NAO SAI DO ANO DA DATA.** Os 20 clubes de 2020 TODOS atravessam o ano civil:
   a Serie B 2020 foi de 08/08/2020 a 30/01/2021 (covid). Quem usar \`Data.year\` racha a
   temporada 2020 inteira em dois. A temporada sai do ARQUIVO (ano do primeiro jogo de Serie B
   daquele arquivo), nunca da data da linha.

2. **Um arquivo saiu VAZIO: \`Team Stats Vila Nova (7).xlsx\`** tem 2 linhas de rotulo
   ("Vila Nova" / "Adversarios") e nenhuma partida. Era o Vila Nova 2019.
   ISSO NAO CUSTA NADA: cada partida aparece no arquivo dos DOIS clubes, entao os 38 jogos do
   Vila Nova 2019 estao inteiros nos arquivos dos outros 19. Reconstruindo pela uniao,
   fecha **80 de 80 clube-temporada**. Ja conferido.

3. **Filtrar \`Competicao == 'Brazil. Serie B'\`** — os arquivos trazem estadual, Copa do
   Brasil, Copa Verde e amistoso junto. Depois do filtro, dedup por
   (temporada, Data, Jogo, Equipa): **3038 linhas, 80 equipe-temporada**, contra 3036 do
   \`serieb_jogos.csv\` de 2022-2025. Partidas unicas: 380 em 2018, **379 em 2019**, 380 em
   2020, 380 em 2021.

4. **Uma unica partida falta no Wyscout inteiro: Cuiaba x Figueirense de 2019.** Por isso
   esses dois clubes tem 37 jogos em 2019, nao 38. Nao e defeito do processamento; e buraco
   da fonte. Registre, nao conserte.

DE-PARA DE NOMES (Wyscout -> tabelas do estudo), ja conferido nos arquivos:
  "America Mineiro"->America-MG, "Athletico Paranaense"->Athletico-PR, "Atletico GO"->Atletico-GO,
  "Botafogo SP"->Botafogo-SP, "Operario PR"->Operario-PR, "Sport Recife"->Sport,
  "Vasco da Gama"->Vasco, "Red Bull Bragantino"->Bragantino, "Athletic Club"->Athletic,
  "Gremio Novorizontino"->Novorizontino, "Sao Bernardo FC"->Sao Bernardo.
No Flashscore o Oeste aparece como "Osasco Sporting" e o Botafogo como "Botafogo RJ".
Nove clubes o projeto nunca viu: Boa, Botafogo, Bragantino, Brasil de Pelotas, Confianca,
Figueirense, Oeste, Parana, Sao Bento.

A classificacao final das quatro temporadas esta em
${RAIZ}/_fonte/prototipo/tabelas_2018_2021.json (20 clubes por ano, NA ORDEM da tabela).
O perfil por clube esta em ${RAIZ}/_fonte/prototipo/extrair_2018_2021.json
(36 clubes, 80 clube-temporada, 16 acessos, com posicao ano a ano e em quais anos subiu).`

const CONF = { type: 'object', properties: {
  bloco: { type: 'string' },
  numeros_conferem: { type: 'boolean' },
  divergencias: { type: 'array', items: { type: 'object', properties: {
    campo: { type: 'string' }, no_json: { type: 'string' }, eu_medi: { type: 'string' },
    quem_esta_certo: { type: 'string' },
  }, required: ['campo', 'no_json', 'eu_medi', 'quem_esta_certo'] } },
  buracos: { type: 'array', items: { type: 'string' } },
  correcao_concreta: { type: 'string' },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['bloco', 'numeros_conferem', 'divergencias', 'buracos', 'correcao_concreta', 'veredito'] }

const ACHADO_FIS = { type: 'object', properties: {
  recorte: { type: 'string' },
  n_sobe: { type: 'integer' }, n_meio: { type: 'integer' }, n_cai: { type: 'integer' },
  achados: { type: 'array', items: { type: 'object', properties: {
    metrica: { type: 'string' },
    o_que_e: { type: 'string' },
    m_sobe: { type: 'number' }, m_meio: { type: 'number' }, m_cai: { type: 'number' },
    d_sobe_meio: { type: 'number' }, p_sobe_meio: { type: 'number' }, q_sobe_meio: { type: 'number' },
    d_sobe_cai: { type: 'number' }, p_sobe_cai: { type: 'number' }, q_sobe_cai: { type: 'number' },
    d_liquido_de_dinheiro: { type: 'number' }, p_liquido: { type: 'number' },
    sobrevive_ao_dinheiro: { type: 'boolean' },
    leitura: { type: 'string' },
  }, required: ['metrica', 'o_que_e', 'm_sobe', 'm_meio', 'm_cai', 'd_sobe_meio', 'p_sobe_meio',
    'd_sobe_cai', 'p_sobe_cai', 'sobrevive_ao_dinheiro', 'leitura'] } },
  quantos_testes_fiz: { type: 'integer' },
  esperados_por_acaso: { type: 'number' },
  sobreviventes_bh: { type: 'integer' },
  a_frase_de_uma_linha: { type: 'string' },
  o_que_nao_da_para_afirmar: { type: 'string' },
}, required: ['recorte', 'n_sobe', 'n_meio', 'n_cai', 'achados', 'quantos_testes_fiz',
  'esperados_por_acaso', 'sobreviventes_bh', 'a_frase_de_uma_linha', 'o_que_nao_da_para_afirmar'] }

const REFUTA = { type: 'object', properties: {
  lente: { type: 'string' },
  afirmacoes_examinadas: { type: 'integer' },
  refutadas: { type: 'array', items: { type: 'object', properties: {
    afirmacao: { type: 'string' }, por_que_cai: { type: 'string' }, o_numero_certo: { type: 'string' },
  }, required: ['afirmacao', 'por_que_cai', 'o_numero_certo'] } },
  sobrevivem: { type: 'array', items: { type: 'string' } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'afirmacoes_examinadas', 'refutadas', 'sobrevivem', 'veredito'] }

const BASE_OUT = { type: 'object', properties: {
  rodou: { type: 'boolean' },
  script: { type: 'string' },
  saidas: { type: 'array', items: { type: 'object', properties: {
    arquivo: { type: 'string' }, linhas: { type: 'integer' }, colunas: { type: 'integer' },
  }, required: ['arquivo', 'linhas', 'colunas'] } },
  saida_do_terminal: { type: 'string' },
  clube_temporada: { type: 'integer' },
  partidas_unicas_por_ano: { type: 'string' },
  classificacao_bate: { type: 'boolean' },
  divergencias_de_tabela: { type: 'array', items: { type: 'string' } },
  colunas_tecnicas_em_comum_com_2022_2025: { type: 'integer' },
  colunas_que_nao_existem_em_2018_2021: { type: 'array', items: { type: 'string' } },
  buracos_da_fonte: { type: 'array', items: { type: 'string' } },
  o_que_nao_consegui: { type: 'string' },
}, required: ['rodou', 'script', 'saidas', 'saida_do_terminal', 'clube_temporada',
  'partidas_unicas_por_ano', 'classificacao_bate', 'divergencias_de_tabela',
  'colunas_tecnicas_em_comum_com_2022_2025', 'colunas_que_nao_existem_em_2018_2021',
  'buracos_da_fonte', 'o_que_nao_consegui'] }

const CEGO = { type: 'object', properties: {
  rodou: { type: 'boolean' },
  o_que_foi_congelado: { type: 'string' },
  n_18_21: { type: 'integer' }, acessos_18_21: { type: 'integer' },
  resultados: { type: 'array', items: { type: 'object', properties: {
    teste: { type: 'string' },
    valor_22_25: { type: 'string' }, valor_18_21: { type: 'string' },
    p: { type: 'number' }, passou: { type: 'boolean' }, leitura: { type: 'string' },
  }, required: ['teste', 'valor_22_25', 'valor_18_21', 'passou', 'leitura'] } },
  regime_mudou: { type: 'string' },
  o_que_replica: { type: 'string' },
  o_que_nao_replica: { type: 'string' },
  o_que_nao_deu_para_testar: { type: 'string' },
}, required: ['rodou', 'o_que_foi_congelado', 'n_18_21', 'acessos_18_21', 'resultados',
  'regime_mudou', 'o_que_replica', 'o_que_nao_replica', 'o_que_nao_deu_para_testar'] }

// ---------------------------------------------------------------- trilha 1: a fila

const BLOCOS = [
  { k: 'dinheiro-e-catalogo', p: `ETAPAS 1, 2 e 3: a linha de base do dinheiro, o catalogo de 293 indicadores e o nulo do garimpo. Recalcule o AUC do posto de valor, a taxa de subida por quartil, os d de cada indicador (bruto e liquido de valor) e a contagem de sobreviventes do Benjamini-Hochberg — por caminho proprio, sem rodar o script dele.` },
  { k: 'pilares-e-tipologia', p: `ETAPAS 5 e 8: os quatro pilares time a time e a tipologia dos quatro grupos. Confira se os 16 clube-temporada que subiram estao nos grupos que o TIPOLOGIA.md diz, se as assinaturas batem, e se cada celula dos pilares carrega o n de atletas/jogos. Recalcule tres celulas de cada pilar por conta propria.` },
  { k: 'livres-e-elencos', p: `ETAPAS 12, 13 e 14: o funil dos livres em dez/26, a nota de encaixe e os elencos propostos. Refaca o funil degrau a degrau e confira os totais. A nota de encaixe usa so indicadores que passam no portao de persistencia? O elenco proposto respeita posicao e a faixa de reamostragem? O contrafactual do dinheiro esta la?` },
]

// ---------------------------------------------------------------- trilha 2: o fisico

const FIS = [
  { k: 'volume-e-intensidade', p: `O VOLUME E A INTENSIDADE DO ELENCO INTEIRO.
Metricas de time (sem recorte de setor): fis_distance_p90, fis_m_per_min, fis_running_distance_p90,
fis_hsr_distance_p90, fis_hsr_count_p90, fis_hi_distance_p90, fis_hi_count_p90,
fis_sprint_distance_p90, fis_sprint_count_p90, fis_psv99, fis_psv99_top5,
fis_high_accel_p90, fis_high_decel_p90, fis_medium_accel_p90, fis_medium_decel_p90,
fis_expl_accel_sprint_p90, fis_expl_accel_hsr_p90, fis_cod_count_p90.
A pergunta do dono: quem sobe corre MAIS, corre MAIS RAPIDO, ou nenhum dos dois?` },
  { k: 'com-e-sem-bola', p: `COM A BOLA E SEM A BOLA — o recorte que o por-90 esconde.
As metricas TIP (team in possession) e OTIP (out of possession) normalizam por 30 minutos
DAQUELA fase, entao separam "corre porque tem a bola" de "corre porque nao tem":
fis_m_per_min_tip/otip, fis_distance_p30tip/p30otip, fis_sprint_distance_p30tip/p30otip,
fis_hsr_distance_p30tip/p30otip, e os Off Ball Runs fis_runs_p30tip, fis_runs_above_hsr_p30tip,
fis_runs_penalty_area_p30tip, fis_runs_dangerous_p30tip, fis_runs_received_p30tip,
fis_runs_shot_within_10s_p30tip.
A pergunta do dono: o esforco de quem sobe esta na fase com bola ou na fase sem bola?
Cruze com a posse (coluna \`posse\` do painel): se o time tem mais bola, o por-90 sobe sozinho.
Esse confundimento e o centro do seu trabalho.` },
  { k: 'por-setor', p: `POR SETOR — zaga, lateral, meio e ataque separados.
As 128 colunas fis_zaga_*, fis_lateral_*, fis_meio_*, fis_ataque_*.
A pergunta do dono: o fisico de quem sobe esta concentrado em algum setor? O lateral que
sprinta, o meio que cobre, a zaga que acelera? Cuide do n: fis_zaga_atletas e irmaos dizem
quantos atletas entraram em cada celula, e celula com poucos atletas nao vira media.
Diga tambem em QUAIS setores nao da para afirmar nada, e por que.` },
]

// ---------------------------------------------------------------- o roteiro

const [confs, fisTudo, baseECego] = await parallel([

  () => parallel(BLOCOS.map(b => () => agent(`${CASA}

VOCE CONFERE, e a sua inclinacao e achar erro. O ${RAIZ}/dados/prototipo.json foi produzido
pelo ${RAIZ}/gerar_prototipo.py, escrito por outro agente. NINGUEM recalculou esses numeros
ainda — a conferencia comecou e foi interrompida no meio. Voce esta terminando ela.

SEU BLOCO: ${b.p}

Recalcule por CAMINHO PROPRIO (escreva o seu script, nao rode o dele) e compare numero a
numero com o que esta no JSON. Onde divergir, diga quem esta certo e por que.
Procure tambem BURACOS: etapa que o JSON diz ter e nao tem, campo vazio, n que nao fecha,
imputacao escondida, numero que a tela nao conseguiria desenhar.
Se tudo bater, diga que bate — aprovar sem divergencia e um resultado legitimo.`,
    { label: 'confere:' + b.k, phase: 'Conferir', schema: CONF, effort: 'high' }))),

  () => parallel(FIS.map(f => () => agent(`${CASA}

PERGUNTA DO DONO, literal: "dentro do perfil dos times de 2022 a 2025 que subiram quero saber
a parte fisica tb em relacao aos demais e no que se destacam em relacao aos times que nao
subiram e que cairam".

Entao sao DUAS comparacoes, e as duas importam:
  SOBE x MEIO  (os que subiram contra os que ficaram no meio da tabela)
  SOBE x CAI   (os que subiram contra os rebaixados)
Um indicador pode separar de um jeito e nao do outro — e isso E o achado.

BASE: ${RAIZ}/dados/serieb_clube_temporada.csv, as 80 linhas COMPLETAS (2022-2025; 2026 fora,
tem so 27 rodadas). O rotulo sobe/meio/cai sai da posicao final: 1-4 sobe, 17-20 cai, resto meio.
Sao 16 sobe / 48 meio / 16 cai.

SEU RECORTE: ${f.p}

COMO TRABALHAR:
1. Trabalhe em POSTO DENTRO DO ANO (percentil 0-100 na propria temporada) alem da media bruta.
   O calendario e a arbitragem mudam de ano para ano; media crua de 2022 com 2025 mistura regime.
2. De o d de Cohen, o p (Mann-Whitney bicaudal) e o q do Benjamini-Hochberg. Diga quantos testes
   voce fez e quantos sairiam a 5% por puro acaso. Um indicador que passa sozinho num pente de
   trinta nao e achado, e sorteio.
3. **O CONTROLE DO DINHEIRO E OBRIGATORIO.** Time rico corre diferente porque tem outro elenco.
   Residualize contra o valor de mercado do elenco (o painel tem a coluna; veja como a etapa 2
   do ${RAIZ}/dados/prototipo.json faz — os campos d_liq_SM/p_liq_SM sao exatamente isso) e diga
   o d LIQUIDO. Indicador que morre no liquido nao e fisico: e dinheiro disfarcado de fisico.
4. CONFIRA CONTRA O QUE JA EXISTE: a etapa_2 do prototipo.json ja traz os 293 indicadores com
   m_sobe/m_meio/m_cai, d_bruto_SM, d_bruto_SC, q_SM, q_SC e a "porta" (A/B/C). Compare os seus
   numeros com os de la. Onde divergir, descubra por que — pode ser erro deles ou seu.
5. Nao invente significancia. Com n=16 contra n=48, o poder e baixo: diga o tamanho de efeito
   que voce CONSEGUIRIA detectar, para a ausencia de achado ter tamanho tambem.

ENTREGUE os achados ordenados por forca, com a leitura em portugues claro de cada um.
A "frase de uma linha" e o que o dono leria se so lesse uma coisa do seu recorte.`,
    { label: 'fis:' + f.k, phase: 'Fisico', schema: ACHADO_FIS, effort: 'high' })))
    .then(async (rs) => {
      const bons = rs.filter(Boolean)
      if (!bons.length) return { analises: [], refutacoes: [] }
      const LENTES = [
        { k: 'confundimento', p: `CONFUNDIMENTO. Toda metrica fisica por-90 sobe quando o time tem mais bola, joga mais aberto, ou vai atras do placar. Pegue cada afirmacao e pergunte: isso mede o time ou mede a situacao de jogo? Confira posse, saldo de gols, e se o efeito sobrevive ao controle do dinheiro. Confira TAMBEM o n de atletas por celula — media de setor com tres atletas nao e media.` },
        { k: 'multiplicidade-e-poder', p: `MULTIPLICIDADE E PODER. Sao 160 indicadores fisicos no catalogo. A 5%, oito saem por acaso. Refaca a conta de quantos testes cada analista fez, confira o BH, e verifique se algum achado sobrevive a correcao quando os TRES recortes sao contados juntos (nao so dentro de cada um). Depois o outro lado: com 16 contra 48, que tamanho de efeito seria detectavel? Um "nao ha diferenca" com poder baixo nao e evidencia de ausencia.` },
      ]
      const refs = await parallel(LENTES.map(l => () => agent(`${CASA}

VOCE REFUTA. Tres analistas mediram o perfil fisico dos que subiram na Serie B 2022-2025.
A sua inclinacao e derrubar cada afirmacao. Default: se ficar em duvida, a afirmacao CAI.

SUA LENTE: ${l.p}

O que eles afirmaram:
${JSON.stringify(bons, null, 1).slice(0, 60000)}

Recalcule o que precisar em ${RAIZ}/dados/serieb_clube_temporada.csv por caminho proprio.
Para cada afirmacao que cair, diga POR QUE e qual e o numero certo. Para as que sobreviverem,
diga que sobrevivem — matar tudo tambem seria um resultado errado.`,
        { label: 'refuta:' + l.k, phase: 'Fisico-verifica', schema: REFUTA, effort: 'high' })))
      return { analises: bons, refutacoes: refs.filter(Boolean) }
    }),

  () => agent(`${CASA}

${LEVANTADO_18_21}

TAREFA: escrever ${RAIZ}/preparar_serieb_jogos_2018_2021.py e RODAR ate produzir as bases.

DUAS SAIDAS:
  1. ${RAIZ}/dados/serieb_jogos_2018_2021.csv — jogo a jogo, UMA linha por (temporada, partida,
     equipe), com a coluna \`ano\` = temporada (nao o ano da data!). Mesmas colunas derivadas
     que o ${RAIZ}/preparar_serieb_jogos.py faz: adversario, mando, golos_pro, golos_contra,
     resultado, e os nomes de verdade nas colunas que o Wyscout deixa como "Unnamed".
     Esperado: 3038 linhas de Serie B.
  2. ${RAIZ}/dados/serieb_clube_temporada_2018_2021.csv — o painel clube-temporada, 80 linhas,
     com AS MESMAS COLUNAS TECNICAS do ${RAIZ}/dados/serieb_clube_temporada.csv. Sem nenhuma
     coluna fis_* — fisico nao existe antes de 2022, e coluna vazia mente por omissao.

COMO TRABALHAR:
1. Leia ${RAIZ}/preparar_serieb_jogos.py inteiro primeiro — ele e o modelo, resolve as colunas
   "Unnamed", o de-para de clubes e a dedup. Reuse, nao reinvente. Leia depois o
   ${RAIZ}/gerar_sb_clubes.py para saber como o painel clube-temporada e montado a partir do
   jogo a jogo, e monte o de 2018-2021 do MESMO jeito.
2. Os 109 campos de 2018-2021 contra os 119 de 2022-2026: monte o de-para explicito e DIGA
   quais colunas nao existem no periodo antigo. Isso decide o que o teste cego pode testar.
3. A CLASSIFICACAO E O SEU TESTE. Derive pts/V/E/D/GP/GC/SG dos proprios jogos e compare a
   ordem final com ${RAIZ}/_fonte/prototipo/tabelas_2018_2021.json, ano a ano. Se os 20 clubes
   sairem na ordem certa nos quatro anos, a base esta certa. Se um sair fora, ACHE O PORQUE —
   pode ser punicao de pontos (a Serie B teve casos), pode ser o seu processamento.
   Cuiaba e Figueirense 2019 tem 37 jogos por buraco da fonte: conte isso na hora de comparar.
4. RODE. Nao entregue script que voce nao viu rodar.
5. Documente como a casa documenta: comentario explicando POR QUE cada decisao, nao o que a
   linha faz. Leia o cabecalho do preparar_serieb_jogos.py para pegar o tom — ele explica as
   armadilhas em prosa, e e assim que se escreve aqui.`,
    { label: 'base:18-21', phase: 'Base18-21', schema: BASE_OUT, effort: 'high' })
    .then(async (b) => {
      if (!b || !b.rodou) return { base: b, confere: [], cego: null, cetico: null }

      const CONFERENTES = [
        { k: 'tabela-e-contagem', p: `A CLASSIFICACAO E AS CONTAGENS. Refaca, por caminho proprio, a tabela final dos quatro anos a partir dos .xlsx crus em ${RAIZ}/_fonte/serie_b_jogos_2018_2021/ e compare com ${RAIZ}/_fonte/prototipo/tabelas_2018_2021.json. Confira: 80 clube-temporada, 3038 linhas, 380/379/380/380 partidas, e que a temporada 2020 NAO foi rachada pelo ano civil. Confira que o Vila Nova 2019 foi reconstruido pelos adversarios e tem 38 jogos.` },
        { k: 'colunas-e-comparabilidade', p: `AS COLUNAS. O painel novo tem os mesmos nomes e as mesmas UNIDADES do ${RAIZ}/dados/serieb_clube_temporada.csv? Pegue cinco colunas tecnicas e recalcule a mao para um clube-temporada, dos .xlsx ate o painel. Depois o teste que importa: compare a DISTRIBUICAO de cada coluna tecnica comum entre 2018-2021 e 2022-2025. Coluna cuja media pula de um periodo para o outro ou e mudanca de futebol ou e mudanca de definicao do Wyscout — e so a segunda invalida o teste cego. Diga quais colunas voce NAO confiaria para comparar os dois periodos.` },
      ]

      const [confere, cegoPar] = await parallel([
        () => parallel(CONFERENTES.map(c => () => agent(`${CASA}

${LEVANTADO_18_21}

VOCE CONFERE, e a sua inclinacao e achar erro. Outro agente escreveu
${RAIZ}/preparar_serieb_jogos_2018_2021.py e produziu as bases de 2018-2021.

SEU BLOCO: ${c.p}

O que ele relatou:
${JSON.stringify(b, null, 1).slice(0, 30000)}

Recalcule por caminho proprio. Onde divergir, diga quem esta certo.`,
          { label: 'confere-base:' + c.k, phase: 'Base-confere', schema: CONF, effort: 'high' }))),

        () => agent(`${CASA}

${LEVANTADO_18_21}

A base tecnica de 2018-2021 acabou de ser construida:
${JSON.stringify(b.saidas, null, 1)}

TAREFA: O TESTE CEGO. Esta e a razao de esses quatro anos existirem no projeto.

A DECISAO JA TOMADA (CONTINUAR.md secao 5): "o melhor uso dos anos novos e TESTE, nao treino:
congelar os dois eixos e os dois cortes nos times de 2022-2025 e aplica-los CEGAMENTE em
2018-2021. Os dois eixos sao tecnicos coletivos, entao roda sem fisico."

SOMENTE TECNICO. Nao existe dado fisico antes de 2022 — nem procure.

COMO TRABALHAR:
1. CONGELE PRIMEIRO, OLHE DEPOIS. Leia ${RAIZ}/_fonte/prototipo/TIPOLOGIA.md e a etapa_8 do
   ${RAIZ}/dados/prototipo.json e escreva os eixos TERRITORIO e ROTA e os dois cortes como
   formula fechada, com os coeficientes e os limiares vindos SO de 2022-2025. Grave isso num
   arquivo ANTES de tocar em 2018-2021. Se voce ajustar qualquer limiar depois de ver o
   resultado antigo, o teste morreu e vira garimpo.
2. Aplique em 2018-2021 e responda:
   - os 16 que subiram em 2018-2021 caem nos mesmos quatro grupos, na mesma proporcao?
   - os indicadores que passaram a porta em 2022-2025 (etapa_2, campo "porta" A/B/C)
     separam sobe de meio e sobe de cai tambem em 2018-2021? Com que d, com que p?
   - o AUC do posto de valor de mercado replica? (Se nao houver valor de mercado de
     2018-2021, DIGA e siga sem — nao impute.)
3. **TESTE O REGIME ANTES DE JUNTAR.** Decisao ja tomada: 2020 foi sem torcida (e mando e um
   dos eixos) e as SAFs chegaram por volta de 2021-22. Meca a vantagem de mando ano a ano nos
   oito anos e diga se 2020 pode entrar na mesma conta. Se nao puder, rode com e sem 2020.
4. Diga o que REPLICA, o que NAO replica, e o que nao deu para testar por falta de coluna.
   Um eixo que nao replica e o achado mais valioso que este teste pode dar. Nao o esconda.`,
          { label: 'cego:18-21', phase: 'Cego', schema: CEGO, effort: 'high' }),
      ])

      const cego = cegoPar
      let cetico = null
      if (cego && cego.rodou) {
        cetico = await agent(`${CASA}

${LEVANTADO_18_21}

VOCE REFUTA. Outro agente congelou os eixos e os cortes em 2022-2025 e aplicou as cegas em
2018-2021. A sua inclinacao e derrubar o teste.

O que ele afirmou:
${JSON.stringify(cego, null, 1).slice(0, 50000)}

As perguntas que voce faz:
- O congelamento foi REAL? Ou ele olhou 2018-2021, viu o resultado e mexeu no limiar?
  Procure o arquivo que ele diz ter gravado antes. Se nao existir, o teste nao e cego.
- Com 16 acessos em 2018-2021, qual o intervalo de confianca de cada taxa que ele reporta?
  Uma proporcao de 16 tem barra de erro enorme; ele reportou isso?
- As colunas tecnicas de 2018-2021 sao mesmo comparaveis as de 2022-2025, ou alguma mudou de
  definicao no Wyscout? Confira as que sustentam os eixos.
- 2020 (sem torcida) e 2021 (transicao das SAFs) ficaram dentro ou fora? A conclusao muda se
  voce inverter essa escolha? Rode e veja.
- "Replica" esta sendo medido como ausencia de diferenca significativa? Com esse n, nao dar
  diferenca e o resultado default. Isso nao e replicacao.

Recalcule o que precisar. Para cada afirmacao que cair, diga por que e qual e o numero certo.`,
          { label: 'refuta:cego', phase: 'Cego-confere', schema: REFUTA, effort: 'high' })
      }

      return { base: b, confere: confere.filter(Boolean), cego, cetico }
    }),
])

return {
  fila_conferencia_prototipo: confs.filter(Boolean),
  fisico_2022_2025: fisTudo,
  base_e_cego_2018_2021: baseECego,
}
