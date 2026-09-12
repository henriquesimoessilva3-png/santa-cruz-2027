export const meta = {
  name: 'tipologia-16',
  description: 'Encontrar 3 a 5 grupos demarcados entre os 16 clube-temporada que subiram, em eixos taticos declarados, e validar cada tipologia em indicadores que nao a construiram',
  phases: [
    { title: 'Propor', detail: 'cinco tipologias por logicas taticas diferentes, cada uma com os 16 alocados' },
    { title: 'Validar', detail: 'cada tipologia testada em indicadores de fora, estabilidade e nulo' },
    { title: 'Decidir', detail: 'a tipologia final, com os limites e os times de fronteira nomeados' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const DADOS = RAIZ + '/dados'

const CONTEXTO = `TAREFA — o dono do projeto pediu, com estas palavras:

  "nao que eu queira um padrao somente do time que sobe, e sim quero encontrar similaridade
   entre as 16 equipes que temos dados e que subiram nesses anos, talvez 3 ou 4 (ou mais)
   grupos mais demarcados, que formem o modelo dos times que subiram (ex: grupo 1: time
   reativo, que compoe de 5 times (1 lugar de 2022, 3 lugar de 2023, 4 lugar de 2024, 2 lugar
   de 2025), etc...)"

Ou seja: uma TIPOLOGIA dos 16 clube-temporada que subiram na Serie B em 2022-2025 (4 por ano).
Nao e "o padrao de quem sobe" — e "estes 16 se parecem entre si de quantos jeitos diferentes".

O QUE JA FOI TESTADO E FALHOU (nao repita):
Agrupamento CEGO, k-means sobre 63 dimensoes. Sob o nulo correto (gaussiana multivariada de
MESMA COVARIANCIA, 200 replicas) a silhueta observada nao passa: k=2 nos 16 da p=0,555, k=3 da
p=0,955. O nulo de embaralhar coluna, que tres analises usaram, e INVALIDO — ele destroi a
correlacao entre indicadores, entao qualquer dado correlacionado o bate. Jaccard de bootstrap
deu 0,48 a 0,67 (Hennig pede 0,75; abaixo de 0,60 dissolve).

POR QUE ESTA TAREFA E DIFERENTE, E PODE DAR CERTO:
16 pontos em 63 dimensoes nao sustentam cluster nenhum. 16 pontos em 3 a 6 EIXOS TATICOS
DECLARADOS sustentam uma tipologia descritiva — e, ao contrario do cluster cego, ela e
FALSIFICAVEL: se voce constroi os grupos com um conjunto de indicadores, pode testar se eles
tambem se separam em indicadores que NAO entraram na construcao. Se separam, o grupo diz algo
sobre o time. Se nao separam, voce cortou uma reta ao meio e deu nome.

O DADO:
- ${DADOS}/serieb_clube_temporada.csv — 100 clube-temporada x 288 colunas. \`faixa\`=='sobe' e
  \`ano\`<=2025 da os 16. Tem o tecnico coletivo (~31 colunas: posse, ppda, passes_pct,
  passe_longo_pct, dist_remate, xg, toques_area, atq_posicional, contra_ataques, duelos_aereos_pct,
  cruzamentos, bolas_paradas, recuperacoes, intensidade...) e o fisico coletivo (~166 colunas
  \`fis_*\`, elenco e por setor).
- ${DADOS}/serieb_jogos.csv — 3.570 partidas de Serie B, 119 colunas por clube e jogo, com
  \`Sistema\` (a formacao daquele jogo). Da para medir formacao predominante e trocas.
- ${DADOS}/serieb_tecnico.csv — 3.866 jogador-temporada (118 colunas), para o tecnico individual.
- Dinheiro: \`tm_valor_total\` (Transfermarkt, POR TEMPORADA — o do Wyscout e snapshot e esta
  aposentado).

REGRAS QUE NAO SE NEGOCIAM:
1. POUCOS EIXOS, COM NOME DE FUTEBOL. "Cluster 2" nao e resposta; "time reativo de bola direta"
   e. Cada eixo tem de ser explicavel a um diretor em uma frase.
2. SEPARE O QUE CONSTROI DO QUE VALIDA. Declare explicitamente quais indicadores entraram nos
   eixos. Os que ficaram de fora sao o seu teste.
3. DINHEIRO. Diga, para cada grupo, o posto medio de \`tm_valor_total\` dentro do ano. Se os seus
   grupos forem "os caros" e "os baratos" com nome tatico, isso e o achado, e tem de ser dito.
4. OS 16 SAO 16. Nenhuma afirmacao sobre um grupo de 3 times pode ser escrita como lei. Escreva
   o n ao lado de cada grupo.
5. IDENTIFIQUE OS DE FRONTEIRA. Quais times mudariam de grupo com um corte ligeiramente
   diferente? Isso vai para a tela junto.
6. POSTO DENTRO DO ANO. O nivel da liga muda de ano para ano; compare por posto dentro da
   temporada, nao por valor bruto (o metodo da casa).

Responda em portugues do Brasil, COM acentuacao. Numeros conferidos no dado, nao lembrados.`

const TIPOLOGIA = { type: 'object', properties: {
  logica: { type: 'string' },
  eixos: { type: 'array', items: { type: 'object', properties: {
    nome: { type: 'string' }, colunas: { type: 'array', items: { type: 'string' } },
    frase: { type: 'string' },
  }, required: ['nome', 'colunas', 'frase'] } },
  indicadores_de_validacao: { type: 'array', items: { type: 'string' } },
  metodo_de_corte: { type: 'string' },
  grupos: { type: 'array', items: { type: 'object', properties: {
    nome: { type: 'string' },
    frase: { type: 'string' },
    times: { type: 'array', items: { type: 'object', properties: {
      clube: { type: 'string' }, ano: { type: 'integer' }, pos: { type: 'integer' },
      posto_valor: { type: 'string' },
    }, required: ['clube', 'ano', 'pos', 'posto_valor'] } },
    assinatura: { type: 'array', items: { type: 'string' } },
    formacao: { type: 'string' },
  }, required: ['nome', 'frase', 'times', 'assinatura', 'formacao'] } },
  fronteira: { type: 'array', items: { type: 'string' } },
  dinheiro: { type: 'string' },
  por_que_nao_e_so_dinheiro: { type: 'string' },
  numeros_que_conferi: { type: 'array', items: { type: 'string' } },
}, required: ['logica', 'eixos', 'indicadores_de_validacao', 'metodo_de_corte', 'grupos',
  'fronteira', 'dinheiro', 'por_que_nao_e_so_dinheiro', 'numeros_que_conferi'] }

const VALIDACAO = { type: 'object', properties: {
  logica: { type: 'string' },
  separa_fora_da_construcao: { type: 'boolean' },
  teste_de_fora: { type: 'string' },
  estabilidade: { type: 'string' },
  nulo_no_espaco_reduzido: { type: 'string' },
  e_so_dinheiro: { type: 'boolean' }, dinheiro_detalhe: { type: 'string' },
  grupos_que_sobrevivem: { type: 'array', items: { type: 'string' } },
  grupos_que_dissolvem: { type: 'array', items: { type: 'string' } },
  nota: { type: 'integer', minimum: 1, maximum: 10 },
  veredito: { type: 'string', enum: ['sustenta', 'sustenta_em_parte', 'nao_sustenta'] },
}, required: ['logica', 'separa_fora_da_construcao', 'teste_de_fora', 'estabilidade',
  'nulo_no_espaco_reduzido', 'e_so_dinheiro', 'dinheiro_detalhe', 'grupos_que_sobrevivem',
  'grupos_que_dissolvem', 'nota', 'veredito'] }

const LOGICAS = [
  { k: 'bola', p: `Eixo central: O QUE O TIME FAZ COM A BOLA. Posse contra bola direta, construcao curta contra longa, ataque posicional contra transicao. Use posse, passes_pct, passe_longo_pct, compr_passe, atq_posicional, contra_ataques.` },
  { k: 'sem_bola', p: `Eixo central: O QUE O TIME FAZ SEM A BOLA. Pressao alta contra bloco baixo, e o que ele concede. Use ppda, intensidade, recuperacoes, xg_contra, remates_contra, e o fisico de fase defensiva (fis_* de OTIP).` },
  { k: 'chance', p: `Eixo central: COMO O TIME CRIA E COMO SE DEFENDE DA CHANCE. A cadeia do gol: volume de remate, qualidade da chance (dist_remate, xg por remate, toques_area, entradas_area) e o espelho defensivo.` },
  { k: 'fisico', p: `Eixo central: O PERFIL FISICO COLETIVO. Volume contra explosao, e onde no campo. Use as colunas fis_* de elenco e por setor. Lembre: correr sem a bola e a face fisica de pressionar alto — trate a colinearidade com ppda explicitamente.` },
  { k: 'elenco', p: `Eixo central: COMO O ELENCO FOI MONTADO E USADO. Concentracao de minutos, tamanho do nucleo, idade, altura, continuidade, e a formacao predominante (\`Sistema\` em serieb_jogos.csv) com o numero de trocas no ano.` },
]

phase('Propor')
log(`Tipologia dos 16: ${LOGICAS.length} logicas taticas independentes`)

const tipos = (await parallel(LOGICAS.map(L => () => agent(`${CONTEXTO}

SUA LOGICA TATICA: ${L.p}

Construa a tipologia dos 16 A PARTIR DESSE EIXO CENTRAL, acrescentando um ou dois eixos
secundarios se precisar (no maximo 4 eixos no total — mais que isso e cluster cego outra vez).

ENTREGUE:
1. Os eixos, com as colunas exatas e uma frase de futebol para cada.
2. Os indicadores que voce DEIXOU DE FORA de proposito, para servirem de teste.
3. O metodo de corte (quantis? corte natural na distribuicao? k-means so nesses 3-4 eixos?).
4. DE 3 A 5 GRUPOS, cada um com NOME DE FUTEBOL, a frase que o descreve, e A LISTA DOS TIMES
   com clube, ano, posicao final e posto de valor dentro do ano. Todos os 16 tem de estar em
   algum grupo. Escreva a assinatura numerica de cada grupo (os valores que o definem).
5. A formacao predominante de cada grupo (\`Sistema\` em serieb_jogos.csv).
6. Os times de FRONTEIRA — quais mudariam de grupo com um corte pouco diferente.
7. O posto medio de valor de cada grupo, e por que a tipologia nao e so caro contra barato.

ABRA OS ARQUIVOS e calcule. Em "numeros_que_conferi" liste o que mediu, com valor.`,
  { label: 'tipo:' + L.k, phase: 'Propor', schema: TIPOLOGIA, effort: 'high' })))).filter(Boolean)

log(`${tipos.length} tipologias; validando cada uma contra o que nao a construiu`)

phase('Validar')
const vals = (await parallel(tipos.map(t => () => agent(`${CONTEXTO}

VOCE VALIDA, e a sua inclinacao e derrubar. Abaixo, uma tipologia dos 16 proposta por outro
analista. Ela declara quais indicadores a construiram e quais ficaram de fora.

FACA QUATRO TESTES, todos com numero:
1. TESTE DE FORA (o que mais importa): os grupos dela se separam nos indicadores que NAO
   entraram na construcao? Rode ANOVA/Kruskal por indicador de fora, com correcao para
   comparacoes multiplas. Quantos separam, de quantos testados? Se nenhum separar, a tipologia
   e uma reta cortada e batizada.
2. ESTABILIDADE: tire um indicador de cada vez dos eixos e refaca os grupos — quantos dos 16
   trocam de grupo? Tire um time de cada vez e veja se os grupos sobrevivem. De o numero.
3. NULO NO ESPACO REDUZIDO: nos 3-4 eixos dela (nao nas 63 dimensoes), a silhueta observada
   bate a de uma gaussiana de MESMA COVARIANCIA (200 replicas, semente fixa)? Este e o teste
   que o agrupamento cego reprovou; no espaco reduzido ele pode passar. De o p.
4. DINHEIRO: os grupos sao caro contra barato com nome tatico? Compare o posto de
   tm_valor_total entre grupos, e refaca a tipologia sobre os indicadores RESIDUALIZADOS em
   valor — os grupos sobrevivem?

Diga quais grupos SOBREVIVEM e quais DISSOLVEM, nominalmente.

TIPOLOGIA:
${JSON.stringify(t, null, 1).slice(0, 60000)}`,
  { label: 'valida:' + t.logica.slice(0, 18), phase: 'Validar', schema: VALIDACAO, effort: 'high' })))).filter(Boolean)

phase('Decidir')
const final = await agent(`${CONTEXTO}

VOCE DECIDE E ESCREVE A TIPOLOGIA FINAL — a que vai para a tela do app, no formato que o dono
pediu: grupos com nome, e a lista dos times de cada um com ano e posicao final.

Cinco tipologias e cinco validacoes abaixo. Nao e resumo: e ESCOLHA. Voce pode:
- adotar a que melhor sobreviveu;
- fundir eixos de duas, se a fusao tambem for validada (diga como voce a validou);
- ou concluir que nenhuma sobrevive — e entao dizer o que DA para afirmar sobre similaridade
  entre os 16 (pares parecidos? um eixo continuo com extremos nomeados?), porque o dono precisa
  de uma resposta util, nao de um "nao".

Escreva em markdown:

# A tipologia dos 16 que subiram
## O que foi testado, e o que cada teste disse
## Os grupos
   (para cada: NOME, a frase de futebol, a tabela dos times com clube/ano/posicao/posto de valor,
    a assinatura numerica, a formacao predominante, e o n)
## Os times de fronteira, nominalmente
## O que separa os grupos ALEM do que os construiu (o teste de fora, com numero)
## Os grupos sao dinheiro com nome tatico? (com o numero)
## O que esta tipologia NAO autoriza a dizer
## Como isto entra na aba Prototipo

Regras: n ao lado de cada grupo; time de fronteira nomeado; e se um grupo nao passou no teste
de fora, ele aparece marcado como DESCRITIVO, nao como modelo.

TIPOLOGIAS: ${JSON.stringify(tipos, null, 1).slice(0, 150000)}

VALIDACOES: ${JSON.stringify(vals, null, 1).slice(0, 80000)}`,
  { label: 'tipologia-final', phase: 'Decidir', effort: 'high' })

return { final, tipos, vals }
