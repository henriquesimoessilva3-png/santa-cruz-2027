// Etapa 0 do PLANO.md, versao curta: so a lente da CASCATA (1 agente, ~0,3M).
// Disparar com: Workflow({scriptPath: "<caminho deste arquivo>"})
// As outras tres lentes (contradicao, completude, espelhos) estao na versao de 4 agentes,
// descrita na secao 14 de _fonte/CONTEXTO_sessao_17_09.md.

export const meta = {
  name: 'cruzar-cascata-serieb',
  description: 'A lente da cascata: o que a sintese do Estudo Serie B vira depois dos 350 achados da auditoria',
  phases: [{ title: 'Cascata', detail: 'A14, A12, T04 e a resposta de topo ainda tem pe?' }],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const FRONTEIRA = 'A02-1, A02-2, A02-3, A03-2, A03-3, A04-1, A04-3, A06-1, A07-1, A07-2, A11-3, A13-1, A14-2, J01-3, J03-1, J03-2, J03-3, J07-1'
const CONFIANCA = 'A03-1, A04-2, A05-2, A06-3, A07-1, A11-1, A11-3, A12-1, A13-1, A13-3, A14-2, J01-3, J02-2, J03-1, J03-2, J07-3, T01-1, T02-1, T02-2, T02-3, T03-1, T04-1, T04-2'

const CRUZ = {
  type: 'object',
  properties: {
    lente: { type: 'string' },
    achados: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titulo: { type: 'string', description: 'uma frase, dita como numa reuniao de clube' },
          ids: { type: 'array', items: { type: 'string' } },
          o_que: { type: 'string' },
          evidencia: { type: 'string', description: 'arquivo, campo e valor. Sem isso o achado nao vale.' },
          o_que_fazer: { type: 'string' },
          gravidade: { type: 'string', enum: ['texto', 'confianca', 'conclusao'] },
        },
        required: ['titulo', 'ids', 'o_que', 'evidencia', 'o_que_fazer', 'gravidade'],
      },
    },
    veredito_sintese: { type: 'string', description: 'em ate 5 linhas: a resposta de topo do estudo sobrevive, muda ou cai?' },
    nota: { type: 'string' },
  },
  required: ['lente', 'achados', 'veredito_sintese'],
}

const P = [
  'Repositorio: "' + RAIZ + '" (o caminho tem espacos: sempre entre aspas no shell).',
  '',
  'TRABALHO SOMENTE DE LEITURA. Nao edite, crie nem apague NENHUM arquivo do repositorio.',
  'Pode rodar python3/grep a vontade. Arquivo temporario so em /tmp.',
  '',
  'O CONTEXTO. O Estudo Serie B respondeu 19 das 27 perguntas, com 53 conclusoes em',
  '_fonte/estudo_serieb/resultados/<ID>.json (A01-A07, A11-A14, J01-J03, J07, T01-T04).',
  'Todas sao RASCUNHO. Em 18/09 as 53 passaram por auditoria adversarial: um refutador atacou cada',
  'frase e tres ceticos independentes julgaram cada achado (maioria de 2 em 3 confirma).',
  'Resultado: 350 achados confirmados, 128 derrubados. Esta em:',
  '  _fonte/estudo_serieb/resultados/_auditoria_18_09.md    o legivel',
  '  _fonte/estudo_serieb/resultados/_auditoria_18_09.json  o cru, com o parecer de cada cetico',
  '',
  'ATENCAO: o campo "gravidade_do_refutador" esta INFLADO (47 das 53 na gravidade maxima) — ignore-o.',
  'Vale o achado com status "confirmado". E o parecer do cetico as vezes corrige o proprio achado:',
  'em T01-3 o refutador propos 497 e a lente do numero mostrou que era 492. Leia "pareceres" antes',
  'de tomar qualquer "correcao" como verdade.',
  '',
  'OS DOIS PADROES SISTEMICOS:',
  '  fronteira (a conclusao so vale em um dos dois cortes) confirmada em 18: ' + FRONTEIRA,
  '  confianca alta demais confirmada em 23: ' + CONFIANCA,
  '',
  'Regras da casa em _fonte/estudo_serieb/CLAUDE.md e _fonte/prototipo/ESPECIFICACAO.md.',
  'Fronteira: teste de robustez, nao recorte melhor — "firme" exige valer NOS DOIS cortes.',
  'Confianca: firme = BH a 5% por familia E porta temporal; provavel = so um; indicio = nenhum.',
  '',
  '=========================================================',
  'VARREDURA TRANSVERSAL — lente: CASCATA',
  'Voce olha o estudo INTEIRO. As 53 ja foram auditadas uma a uma; nao repita o que a auditoria',
  'por conclusao ja achou. Seu trabalho e o que SO aparece olhando o conjunto.',
  '=========================================================',
  '',
  'As dependencias declaradas: A14 sintetiza A02-A13; A12 depende das reguas e de A05-A07;',
  'T04 depende de A14, T02 e T03; T03 depende de A14; J03 depende de J01; A03 depende de A01 e A06.',
  'Confira a dependencia REAL nos scripts e nos .md, nao a declarada no _registro.md.',
  '',
  'A pergunta: 18 conclusoes cairam na armadilha da fronteira e 23 estao com confianca alta demais.',
  'Se essas correcoes forem aceitas, O QUE ACONTECE COM A SINTESE? Responda (a) a (d) como achados,',
  'com a conta na mao — este e o produto principal:',
  '',
  '  (a) A14-1 diz que oito indicadores resumem o Bloco A e a ordem das faixas sai limpa. Quantos',
  '      desses oito vem de conclusoes que a auditoria derrubou ou rebaixou? O indice sobrevive?',
  '  (b) A12-1 diz que das nove reguas so quatro separam quem sobe. Essas quatro resistem?',
  '  (c) T04 (o treinador ideal) repousa em A14, T02 e T03 — e o bloco T inteiro caiu em confianca',
  '      alta demais. T04 ainda tem pe?',
  '  (d) A "resposta do estudo em tres linhas" (secao 3 de _fonte/CONTEXTO_sessao_17_09.md):',
  '      qualidade da chance cedida, duelo defensivo, distancia da finalizacao, estabilidade do onze,',
  '      valor do elenco. Cada uma das cinco ainda se sustenta? E os cinco "nao separa" (estilo,',
  '      pressao, bola parada, fisico, mando)?',
  '',
  'Preencha tambem "veredito_sintese": em ate 5 linhas, a resposta de topo do estudo sobrevive,',
  'muda ou cai? Escreva como numa reuniao de clube, sem jargao.',
  '',
  'Todo achado precisa de evidencia conferivel: arquivo, campo, valor. Do mais grave para o menos.',
  'Se nao achar nada, devolva achados vazio e diga na nota o que procurou — nao invente.',
].join('\n')

const r = await agent(P, { label: 'cruzar:cascata', phase: 'Cascata', schema: CRUZ })
return { cascata: r }
