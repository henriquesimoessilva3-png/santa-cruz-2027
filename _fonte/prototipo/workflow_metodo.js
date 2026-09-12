export const meta = {
  name: 'prototipo-metodo',
  description: 'Projeta o metodo da aba Prototipo: 4 pilares time a time, padroes dos que subiram, e encaixe dos jogadores livres em dez/26',
  phases: [
    { title: 'Projetar', detail: 'cinco angulos independentes, cada um com o metodo inteiro' },
    { title: 'Julgar', detail: 'tres juizes pontuam os cinco em criterios diferentes' },
    { title: 'Sintetizar', detail: 'uma especificacao so, executavel, com o que foi enxertado de cada' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const DADOS = RAIZ + '/dados'

const CONTEXTO = `CONTEXTO — leia antes de projetar, e CONFIRA no dado antes de afirmar.

O PEDIDO DO DONO (literal): "uma nova analise profunda, acrescentando uma aba no app chamada
Prototipo. Analise dos times que subiram x demais, ano a ano, olhando indicadores individuais e
coletivos. Definindo caracteristica de cada time que subiu e depois analisando os jogadores da
serie B (e depois uma versao com os das ligas sul-americanas) que ficam livres em dez/26 que
seriam de melhor encaixe nos modelos dos times que subiram. Pode ser mais de um modelo de time
que subiu e mais de uma proposta de formacao de elenco. As caracteristicas: tecnicas
individuais, tecnicas coletivas, fisica individual e fisica coletiva (juntando as infos fisicas
dos jogadores da equipe naquele ano); com isso identificar padroes dos times que subiram, talvez
agrupar esses times em alguns padroes, e depois sugerir formacao dos elencos com os jogadores
livres que atendam esses padroes. Deixe bem explicita cada etapa de construcao, mostrando as
analises time a time, ano a ano, dentro dos 4 pilares, indicador por indicador. Talvez o melhor
metodo seja comparativo tanto em relacao a quem nao subiu quanto a quem caiu."

O DADO QUE EXISTE DE VERDADE (confira tudo em ${DADOS}):
- serieb_clube_temporada.csv — 100 clube-temporada x 288 colunas. Coluna \`faixa\`: sobe 20, meio
  60, cai 20. Coluna \`ano\`: 2022 a 2026. ATENCAO: 2026 esta em 27 de 38 rodadas e NAO entra em
  media nenhuma — as temporadas completas sao 2022-2025, ou seja 80 linhas: 16 sobe, 48 meio,
  16 cai. Todo "n=16" deste trabalho vem dai.
- serieb_jogos.csv — 3.570 partidas de Serie B, 145 colunas por clube e jogo, inclusive
  \`Sistema\` (a formacao daquele jogo) e \`Duracao\`.
- serieb_tecnico.csv — 3.866 jogador-temporada da Serie B, 118 colunas (Wyscout).
- serieb_elencos.csv — 5.098 atleta-temporada (Transfermarkt): posicao, idade, valor_eur POR
  TEMPORADA, e \`contrato_ate\` em texto dd/mm/aaaa.
- dados/jogadores.json — a base do app: 40.059 jogadores de todas as ligas, com \`l\` (liga),
  \`p\` (posicao), \`ct\` (fim de contrato ISO), \`ctc\` (confianca do contrato), \`ctf\` (fontes que
  concordam), \`mv\` (valor), \`min\` (minutos), \`sal\` (faixa salarial), e campos fisicos.
- dados/kpis.json — 82 KPIs tecnicos para 18.460 jogadores de todas as ligas (chave:
  "Nome - Clube - Liga").
- skillcorner.db (fora do repo, caminho em gerar_raio_serieb.py) — fisico por atleta x edicao.
  NAO rastreia goleiro e cobre ~15 partidas por atleta, nao 38.
- dados/raio_ref.json — ja tem \`sobecai\`: 137 testes fisicos sobe x cai por setor, com d de
  Cohen e Benjamini-Hochberg (16 sobrevivem). Leia: parte do pilar fisico ja esta feita.
- gerar_raio_serieb.py — ja faz a ponte SkillCorner->Wyscout por nome+idade (98,2% de acerto) e
  sabe separar sobe/cai. E o caminho pronto para o pilar fisico.

O QUE NAO EXISTE: TREINADOR. Nao ha nome de treinador em base nenhuma do projeto — conferido.
O dono pediu "quais treinadores mais sobem". Isso exige COLETA nova. O proxy que existe e a
troca de \`Sistema\` em serieb_jogos.csv. NAO invente treinador; diga o que da para fazer sem ele
e o que exigiria coletar.

METODO DA CASA (respeite): "sobe" = top 4; "cai" = 17o ou pior. Comparacao por POSTO DENTRO DO
ANO (empate vira media), porque o nivel da liga muda de ano para ano. So temporadas completas
entram em media. Principio: "o dado e a fonte, o texto e consequencia" — nada escrito a mao.

A REVISAO DESTA SEMANA JA DERRUBOU COISAS — nao repita os erros:
- 4 setores x ~34 indicadores = 137 testes; a 5%, ~7 passam por acaso. SEM correcao para
  comparacoes multiplas, qualquer lista de "indicadores que separam" e metade sorteio.
- "Correr sem a bola" e a face fisica de pressionar alto (anda +0,50 com o PPDA): e escolha do
  TIME, nao qualidade do atleta.
- Tres das quatro "alavancas" da aba nao se repetem de um ano para o outro (0,06 / 0,12 / 0,15).
  Caracteristica que nao persiste nao e modelo de jogo, e retrato de um ano.
- Valor de mercado do Wyscout e snapshot; o valor por temporada e o do Transfermarkt.

Responda SEMPRE em portugues do Brasil. Numeros conferidos no dado, nao lembrados.`

const PLANO = { type: 'object', properties: {
  angulo: { type: 'string' },
  resumo: { type: 'string' },
  pilares: { type: 'array', items: { type: 'object', properties: {
    pilar: { type: 'string', enum: ['tecnico_individual', 'tecnico_coletivo', 'fisico_individual', 'fisico_coletivo'] },
    indicadores: { type: 'array', items: { type: 'string' } },
    fonte: { type: 'string' },
    como_agrega: { type: 'string' },
    como_compara: { type: 'string' },
    armadilha: { type: 'string' },
  }, required: ['pilar', 'indicadores', 'fonte', 'como_agrega', 'como_compara', 'armadilha'] } },
  padroes: { type: 'object', properties: {
    metodo: { type: 'string' },
    quantos: { type: 'string' },
    por_que_aguenta_n16: { type: 'string' },
    teste_de_estabilidade: { type: 'string' },
    o_que_prova_que_o_padrao_e_real: { type: 'string' },
    e_se_nao_houver_padrao: { type: 'string' },
  }, required: ['metodo', 'quantos', 'por_que_aguenta_n16', 'teste_de_estabilidade', 'o_que_prova_que_o_padrao_e_real', 'e_se_nao_houver_padrao'] },
  encaixe: { type: 'object', properties: {
    como_pontua: { type: 'string' },
    universo_livres: { type: 'string' },
    por_posicao: { type: 'string' },
    ressalva: { type: 'string' },
  }, required: ['como_pontua', 'universo_livres', 'por_posicao', 'ressalva'] },
  elencos: { type: 'string' },
  treinador: { type: 'string' },
  etapas_na_tela: { type: 'array', items: { type: 'string' } },
  o_que_pode_dar_errado: { type: 'array', items: { type: 'string' } },
  numeros_que_conferi: { type: 'array', items: { type: 'string' } },
}, required: ['angulo', 'resumo', 'pilares', 'padroes', 'encaixe', 'elencos', 'treinador', 'etapas_na_tela', 'o_que_pode_dar_errado', 'numeros_que_conferi'] }

const NOTA = { type: 'object', properties: {
  criterio: { type: 'string' },
  notas: { type: 'array', items: { type: 'object', properties: {
    angulo: { type: 'string' }, nota: { type: 'integer', minimum: 1, maximum: 10 },
    o_melhor: { type: 'string' }, o_pior: { type: 'string' },
  }, required: ['angulo', 'nota', 'o_melhor', 'o_pior'] } },
  vencedor: { type: 'string' },
  enxertar_do_perdedor: { type: 'array', items: { type: 'string' } },
  erro_que_todos_cometeram: { type: 'string' },
}, required: ['criterio', 'notas', 'vencedor', 'enxertar_do_perdedor', 'erro_que_todos_cometeram'] }

const ANGULOS = [
  { k: 'estatistico', p: `Voce e ESTATISTICO. n=16 clube-temporada que subiram, contra 48 do meio e 16 que cairam, com dezenas de indicadores. Sua obsessao: o que e defensavel com esse n, e o que e garimpo com cara de achado. Agrupar 16 pontos em alta dimensao acha padrao ate em ruido — se a sua resposta honesta for "nao da para agrupar", diga, e proponha o que da (ex.: eixos continuos em vez de grupos). Trate reducao de dimensao, correcao para comparacoes multiplas, e um teste de estabilidade que qualquer um possa repetir.` },
  { k: 'futebol', p: `Voce e ANALISTA DE FUTEBOL, nao estatistico. Sua obsessao: o padrao tem de ter NOME e fazer sentido tatico — "time que pressiona alto e verticaliza" e um modelo; "cluster 2" nao e. Parta do jogo: quais familias de indicadores descrevem um jeito de jogar, e como um diretor reconheceria cada padrao numa frase. Diga como ligar padrao a formacao (\`Sistema\` em serieb_jogos.csv) e a perfil de posicao, porque o fim disto e montar elenco.` },
  { k: 'preditivo', p: `Voce e MODELADOR PREDITIVO. Sua obsessao: o padrao so vale se PREVER. Proponha o metodo em torno de validacao — treinar em tres temporadas e testar na quarta, leave-one-season-out, e uma linha de base burra (ex.: so valor de elenco) que qualquer padrao tem de bater para existir. Se os padroes nao baterem a linha de base, isso e o achado e tem de ir para a tela.` },
  { k: 'cetico', p: `Voce e o CETICO. Sua tarefa e projetar o metodo CONTRA si mesmo: liste tudo que vai fazer esta analise produzir bobagem convincente (sobrevivencia, causalidade reversa, o time que sobe ser so o mais caro, 2026 incompleto, cobertura do SkillCorner, jogador livre em dez/26 ser livre por ser ruim) e desenhe o metodo que resiste a cada uma. Inclua os CONTROLES obrigatorios: o que acontece com cada achado depois de descontar valor de elenco.` },
  { k: 'operacional', p: `Voce e ENGENHEIRO DE DADOS do projeto. Sua obsessao: o que DA PARA RODAR hoje, com estes arquivos, sem coleta nova. Abra os arquivos, confira colunas e cobertura de verdade, e escreva o metodo como um pipeline executavel: o que cada etapa le, o que escreve, quanto custa. Diga explicitamente o que NAO da (treinador) e o que exigiria coleta. Aponte o que ja esta pronto e pode ser reaproveitado (gerar_raio_serieb.py, raio_ref.json.sobecai).` },
]

phase('Projetar')
log(`Projetando o metodo da aba Prototipo por ${ANGULOS.length} angulos independentes`)

const planos = (await parallel(ANGULOS.map(a => () => agent(`${CONTEXTO}

${a.p}

ENTREGUE O METODO INTEIRO, das quatro fases:
1. OS QUATRO PILARES — para cada um: quais indicadores exatos (nome da coluna real), de qual
   arquivo, como se agrega ao nivel clube-temporada (o fisico coletivo exige juntar os atletas
   do clube naquele ano), como se compara (sobe x meio x cai, por posto dentro do ano), e a
   armadilha especifica daquele pilar.
2. OS PADROES — como agrupar os 16, quantos grupos, por que isso aguenta n=16, que teste prova
   que o grupo e real e nao ruido, e o que fazer se nao houver padrao nenhum.
3. O ENCAIXE — como pontuar um jogador livre em dez/26 contra um padrao, qual o universo de
   livres (confira \`ct\` e \`ctc\` em jogadores.json), e como tratar posicao.
4. OS ELENCOS — como sair de "padrao + jogadores" para uma proposta de elenco.
E o que da para dizer sobre TREINADOR sem o dado que nao existe.

ABRA OS ARQUIVOS. Rode python/pandas sobre ${DADOS} e confira cada coluna que citar, a
cobertura dela e o n que sobra. Em "numeros_que_conferi", liste o que voce mediu com o valor —
sem isso o plano e opiniao. Escreva pensando em quem vai IMPLEMENTAR: nomes de coluna, formulas,
cortes.`, { label: 'plano:' + a.k, phase: 'Projetar', schema: PLANO, effort: 'high' })))).filter(Boolean)

log(`${planos.length} planos completos; julgando`)

phase('Julgar')
const CRITERIOS = [
  { k: 'rigor', p: 'RIGOR: o que aguenta n=16 e 137+ testes? Quem esta garimpando? Quem tem teste de estabilidade de verdade?' },
  { k: 'utilidade', p: 'UTILIDADE PARA O CLUBE: no fim disto o Santa Cruz tem de saber que jogador livre contratar. Qual plano chega la, e qual para no meio do caminho com um relatorio bonito?' },
  { k: 'exequibilidade', p: 'EXEQUIBILIDADE: da para rodar HOJE com os arquivos que existem? Quem inventou dado que nao ha? Quem reaproveita o que ja esta pronto?' },
]
const notas = (await parallel(CRITERIOS.map(c => () => agent(`${CONTEXTO}

VOCE E JUIZ. Criterio unico: ${c.p}

Cinco planos independentes para a mesma tarefa, abaixo. Pontue cada um de 1 a 10 NO SEU
CRITERIO (nao no geral), diga o melhor e o pior de cada, escolha um vencedor, e liste o que
DEVE SER ENXERTADO dos perdedores no vencedor. Termine com o erro que TODOS cometeram — se
os cinco erraram no mesmo ponto, e ali que a implementacao vai quebrar.

PLANOS:
${JSON.stringify(planos, null, 1).slice(0, 220000)}`,
  { label: 'juiz:' + c.k, phase: 'Julgar', schema: NOTA, effort: 'high' })))).filter(Boolean)

phase('Sintetizar')
const spec = await agent(`${CONTEXTO}

VOCE ESCREVE A ESPECIFICACAO FINAL, a que vai ser implementada. Cinco planos e tres juizes
abaixo. Nao e resumo: e ESCOLHA, com o enxerto do que os juizes mandaram enxertar e a correcao
do erro que todos cometeram.

Escreva em markdown, para quem vai programar amanha. Estrutura obrigatoria:

# Especificacao — aba Prototipo
## 0. O que esta analise pode e o que NAO pode responder (inclusive treinador)
## 1. As bases, e o que sai de cada uma (arquivo, coluna, cobertura, n)
## 2. Pilar 1 — tecnico individual: indicadores, agregacao, comparacao, armadilha
## 3. Pilar 2 — tecnico coletivo: idem
## 4. Pilar 3 — fisico individual: idem
## 5. Pilar 4 — fisico coletivo: idem (como juntar os atletas do clube naquele ano)
## 6. A comparacao sobe x meio x cai, ano a ano, indicador por indicador
   (a forma exata da tabela que vai a tela, e a correcao para comparacoes multiplas)
## 7. Os padroes: metodo, quantos, o teste que prova que sao reais, e o plano B se nao forem
## 8. O encaixe dos livres em dez/26: universo, pontuacao, posicao, ressalvas
## 9. As propostas de elenco: como se monta, quantas, com que restricoes
## 10. O que vai na tela, etapa por etapa (o dono pediu a construcao explicita, nao so o fim)
## 11. Os controles obrigatorios (o que sobra depois de descontar valor de elenco)
## 12. O pipeline: que script le o que, escreve o que, nesta ordem
## 13. O que fica de fora, e por que

Seja concreto: nome de coluna real, formula, corte, n. Onde os planos discordarem, DECIDA e
diga por que. Onde o dado nao existir, diga que nao existe — nao invente caminho.

PLANOS: ${JSON.stringify(planos, null, 1).slice(0, 220000)}

JUIZES: ${JSON.stringify(notas, null, 1).slice(0, 90000)}`,
  { label: 'spec', phase: 'Sintetizar', effort: 'high' })

return { spec, planos, notas }
