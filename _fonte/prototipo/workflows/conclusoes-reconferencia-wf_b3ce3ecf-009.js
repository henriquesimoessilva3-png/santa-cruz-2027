export const meta = {
  name: 'conclusoes-reconferencia',
  description: 'Reconferencia somente leitura das conclusoes depois do conserto: numeros das que nunca passaram por cetico, coerencia documento x spec x regua e linguagem, e se os campos pedidos ao gerador bastam',
  phases: [
    { title: 'Conferir', detail: 'tres lentes, sem escrever no projeto' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B.
LEIA ANTES, INTEIROS: \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\` (inclusive "Decisoes do dono em 14/09"), \`${RAIZ}/_fonte/prototipo/CONCLUSOES.md\` (54 conclusoes depois do conserto) e \`${RAIZ}/_fonte/prototipo/conclusoes_spec.json\`. O relato da rodada que os escreveu (origem, editor, duas conferencias e o conserto) esta em \`${S}/conclusoes_journal.json\` (lista [rotulo, retorno]); as declaracoes propostas ao gerador em \`${S}/declaracoes_novas.json\`.
Tres decisoes ainda estao com o dono e NAO sao objeto desta conferencia (nao julgue, so anote o efeito): (1) a regra "comparacao escolhida depois de olhar nao passa de FRACO" (mudou J5 e A4); (2) a regra das cinco com um item por tema na primeira passada; (3) o corte de 0,5 da repeticao na FIS-07.
REGRAS DA REGUA (escritas no documento): cinco selos; desempate MODERADO x FRACO pela lista inteira (p do excesso da familia < 0,05, 10.000 sorteios); "sem sinal" escreve "nao se viu"; associacao nunca vira receita; "nunca" so com zero excecao; 2026 nunca entra em media; cada numero diz o universo; frase de reuniao no molde do dono.
SOMENTE LEITURA: voce NAO escreve em nenhum arquivo do projeto. Scripts e medidas so em ${S}. PROIBIDO qualquer git que escreva. Outra rodada esta editando gerar_prototipo.py AGORA: pode importa-lo so para ler dado, sem chamar o main e sem confiar que ele esta estavel (prefira os CSVs e os JSON gravados). NAO use as portas 5090/5091.`

const CONF = { type: 'object', properties: {
  lente: { type: 'string' }, conferidos: { type: 'integer' },
  problemas: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, o_que_esta_escrito: { type: 'string' }, eu_medi: { type: 'string' }, conserto: { type: 'string' },
    gravidade: { type: 'string', enum: ['muda_selo', 'muda_numero', 'mente', 'receita', 'falta', 'detalhe'] },
    depende_da_decisao_do_dono: { type: 'boolean' },
  }, required: ['id', 'o_que_esta_escrito', 'eu_medi', 'conserto', 'gravidade', 'depende_da_decisao_do_dono'] } },
  aprovadas: { type: 'array', items: { type: 'string' } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'conferidos', 'problemas', 'aprovadas', 'veredito'] }

const LENTES = [
  { k: 'numeros-sem-cetico', p: 'OS NUMEROS DAS QUE NUNCA PASSARAM POR CETICO: J2, J4, J6, J9, J17, J18, ELE-06 (inclusive o desconto do dinheiro que ninguem fez), ORI-01, ORI-02, e as 25 mudancas do conserto (em conclusoes_journal.json, retorno "conserta", campo mudancas). Refaca cada numero por caminho proprio a partir dos CSVs e JSON gravados, aplique a regua e diga o selo que sai. Na J17, meca o desconto do dinheiro no proxy que o gerador usa (sistemas_distintos), nao so na coluna formacoes.' },
  { k: 'coerencia-e-linguagem', p: 'COERENCIA E LINGUAGEM, conclusao por conclusao (as 54). Documento e spec dizem a mesma coisa (id, selo, titulo, frase, numero, o que nao quer dizer, universo)? A contagem de selos do topo bate? Algum selo nao sai da regua pelos numeros escritos? Frase que afirma mais que o selo, receita, "nao separa" em sem sinal, "nunca" com excecao, universo misturado, jargao na frase de reuniao, numero da frase que nao esta no bloco numerico? A tabela de "o que parecia conclusao e nao e" esta coerente?' },
  { k: 'campos-para-o-gerador', p: 'OS CAMPOS PEDIDOS AO GERADOR. Para cada uma das 54 conclusoes, o spec diz de que caminho do JSON sai cada numero e cada criterio do selo? Os 16 grupos de campos pedidos (conserta.campos_que_o_gerador_precisa_gravar) e o declaracoes_novas.json bastam para o gerador gravar o bloco conclusoes sem numero digitado? Algum caminho do spec aponta para chave que nao existe e nao foi pedida? Alguma analise nova esta sem declaracao (colunas, parametros, semente) antes de medir? Devolva a lista exata e completa, sem ambiguidade, do que o gerador tem de gravar, com o formato de cada campo (isso vira a ordem de servico do segundo bloco do gerador).' },
]
const confs = (await parallel(LENTES.map(l => () => agent(`${CASA}

VOCE CONFERE, e a sua inclinacao e achar erro. SUA LENTE: ${l.p}`,
  { label: 'confere:' + l.k, phase: 'Conferir', schema: CONF, effort: 'high' }).then(r => r ? { ...r, k: l.k } : null)))).filter(Boolean)
return { conferencias: confs }
