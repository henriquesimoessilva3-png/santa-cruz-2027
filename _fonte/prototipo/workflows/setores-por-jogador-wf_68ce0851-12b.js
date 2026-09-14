export const meta = {
  name: 'setores-por-jogador',
  description: 'Etapa 1: valor por setor ponderado pela quantidade de jogadores (sem preco conta como valor baixo) e tabela aberta por time; Controle 2 corrigido; etapa 14 lendo o empate tecnico (trava 1); grava o dado do Prototipo e confere',
  phases: [
    { title: 'Gerador, etapa 14 e casca', detail: 'gerar_prototipo.py (rascunho), proto_c.js (trava 1) e proto.js (Controle 2) em paralelo' },
    { title: 'Etapa 1', detail: 'proto_a.js desenha o bloco novo' },
    { title: 'Gravar', detail: 'dados/prototipo.json + static/prototipo.js, regressao headless' },
    { title: 'Conferir', detail: 'numeros por jogador; tela e linguagem; efeito nas conclusoes' },
    { title: 'Consertar', detail: 'uma rodada por dono e reconferencia' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'
const G_OUT = S + '/gerador'
const W = S + '/setores'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B. App Flask (\`app.py\`, \`templates/index.html\`, \`static/app.js\`). A aba Prototipo desenha 16 etapas a partir da global PROTO (\`static/prototipo.js\`, copia de \`dados/prototipo.json\`, gerado por \`gerar_prototipo.py\`; copia por \`gerar_prototipo_js.py\`), com \`static/proto.js\` (casca), \`proto_a.js\` (etapas 0-4), \`proto_b.js\` (5-8), \`proto_c.js\` (9-15), \`style.css\`, \`proto_glossario.js\`. O contrato da tela: \`static/proto_contrato.md\`.
LEIA ANTES: \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\` (secoes 2, 2.1 — as travas — e as decisoes do dono de 14/09) e o contrato.
ESTADO: o \`gerar_prototipo.py\` ja tem o primeiro bloco do gerador (degraus B0-B8: faixa de quem subiu e faixas no valor cru na etapa 5; id/nac/psp nos candidatos; 2026 fora da etapa 11; ranking_gaps; etapa 14 por POSICAO com empate_tecnico e ic95_pct). O \`dados/prototipo.json\` gravado AINDA E O ANTIGO, porque a tela da etapa 14 nao le o empate tecnico (TRAVA 1 do CONTINUAR). A saida de teste do gerador atual esta em ${G_OUT} (procure o B8: b8_h1.json ou prototipo_teste_b8.js).
PEDIDOS E DECISOES DO DONO DE HOJE (nao reabrir):
1. Etapa 1, quadro "Onde esta o dinheiro: goleiro, defesa, meio-campo e ataque": mostrar os elencos das equipes, ABERTO, sem clicar — uma linha por temporada de clube (as 80 de 2022-2025: 16 que subiram, 48 do meio, 16 que cairam), com o valor, o NUMERO DE JOGADORES e o VALOR POR JOGADOR em cada setor, com filtro por grupo.
2. Ponderar pela quantidade de jogadores de cada setor: quantos jogadores cada setor tem, o valor medio por jogador do setor, e a FATIA DO VALOR ao lado da FATIA DE JOGADORES (ex.: "defesa: 34% do valor com 38% dos jogadores"). Os testes de "o que separa" sao refeitos tambem por jogador.
3. JOGADOR SEM PRECO NO TRANSFERMARKT = JOGADOR DE VALOR BAIXO OU NENHUM, nao dado faltando (conhecimento do dono). Consequencias: (a) na conta por jogador, ele CONTA como jogador do elenco, com valor zero; (b) a soma do elenco NAO fica "por baixo" por causa deles, e a tela nao pode dizer que o valor do time barato esta subestimado ou que "esta conta nao sabe dizer" a distancia entre rico e pobre por esse motivo.
4. O dono disse tambem que NAO quer desconto pelo dinheiro (valor do elenco) como criterio nos indicadores; a forma disso ainda esta sendo decidida com ele e NAO e desta rodada: nao mexa em regua, selos, portas nem conclusoes por causa disso, e nao acrescente nenhum "descontado o dinheiro" novo nos blocos desta rodada.
5. Publicar no site depois de pronto e conferido (o coordenador faz o git e a publicacao; voce NAO).
REGRAS DA CASA: nenhum numero digitado na tela nem no gerador (tudo do dado); ausencia com motivo; analise nova DECLARADA no proprio bloco (regra, colunas, universo) antes de medir; associacao nunca vira receita; texto de tela em portugues de reuniao de clube com o vocabulario de proto.js (ptTamanho, ptAcaso, ptSorte, ptJunto, ptAcerto, ptTecnico), numero tecnico so ao lado; um dono por arquivo; qualquer set iterado vira sorted; comentario em prosa do por que.
PROIBIDO: qualquer git que escreva (commit, push, add, reset, checkout, stash, revert, tag). NAO use nem derrube as portas 5090 e 5091. Teste headless com Playwright do Python numa porta PROPRIA (a sua esta na tarefa), por pasta-espelho em ${W} quando precisar trocar o dado sem gravar no projeto, derrubando o servidor ao fim. Rascunhos em ${W}.`

const ESC = { type: 'object', properties: {
  arquivos_escritos: { type: 'array', items: { type: 'string' } },
  o_que_fiz: { type: 'array', items: { type: 'object', properties: { item: { type: 'string' }, onde: { type: 'string' }, como: { type: 'string' } }, required: ['item', 'onde', 'como'] } },
  chaves_do_json: { type: 'string' },
  numeros_principais: { type: 'string' },
  como_testei: { type: 'string' },
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

const P_GERADOR = `SUA TAREFA: dono de \`gerar_prototipo.py\` (e so dele). Estender \`valor_por_setor(d)\` (etapa 1, ~linha 702).
1. De onde vem: \`val_goleiro/val_defesa/val_meio/val_ataque\` do \`dados/serieb_clube_temporada.csv\`. ACHE no codigo onde esses val_* sao montados (ha um de-para posicao -> setor em analisar_serieb.py ~linha 295) e use EXATAMENTE o mesmo conjunto de jogadores e o mesmo de-para, lendo \`dados/serieb_elencos.csv\` (jogador, posicao, valor_eur; 42,8% sem valor). CONFIRA por clube-temporada que a soma dos valor_eur por setor bate com val_* nas 80 temporadas 2022-2025 (grave a conferencia; se nao bater, pare e explique a diferenca). Confira tambem se "plantel" do CSV e o mesmo numero de jogadores listados. 2026 fora.
2. DECLARE no bloco, antes de medir (chave \`ponderado_por_jogador.regra\`): PELA DECISAO 3 DO DONO, contam TODOS os jogadores listados na temporada do Transfermarkt; o sem preco entra como jogador de valor baixo ou nenhum (valor zero na soma, que ja e como val_* soma). Valor por jogador = valor do setor / jogadores listados no setor; fatia de jogadores = jogadores do setor / jogadores do elenco; indice = fatia do valor / fatia de jogadores. Grave tambem, so como descricao, quantos tem preco e quantos nao tem por setor. Diga que e uma analise pedida pelo dono em 14/09 e declarada antes de medir. Setor sem jogador = null com motivo.
3. Por setor e por faixa (sobe/meio/cai), no mesmo formato das chaves existentes: n de jogadores (listados, com preco, sem preco) mediano, eur_por_jogador mediano, pct_dos_jogadores mediano, indice mediano. "O que separa por jogador": posto no ano do valor por jogador em cada setor (e do elenco inteiro), posicao media no ano por faixa, AUC sobe x resto/meio/cai, p Mann-Whitney sobe x meio e sobe x cai, BH nos 4 setores (familia declarada). Particao ponderada: posto no ano do indice, sobe x meio, BH nos 4. Nenhum desconto pelo valor do elenco nesse bloco (decisao 4). Nenhum sorteio novo.
4. Tabela por time, \`times\`: as 80 temporadas, cada uma com ano, clube, faixa, posicao final, valor do elenco, jogadores listados e com preco, e por setor {eur, n_listados, n_com_preco, eur_por_jogador, pct_do_valor, pct_dos_jogadores, indice}.
5. Rode o main NO RASCUNHO (troque G.SAIDA para ${W}/prototipo_setores.json, python3 -B), determinismo PYTHONHASHSEED 1 x 2, e o diff contra o B8 de ${G_OUT}: SO a etapa_1.valor_por_setor pode mudar. Rode tambem o gerar_pontos.py no rascunho (troque GP.SAIDA) so para confirmar que nao quebra (ele chama valor_por_setor); NAO grave pontos.json.
6. NAO grave dados/prototipo.json nem static/prototipo.js (outra etapa desta rodada grava depois da tela).
Devolva em chaves_do_json a lista EXATA das chaves novas, com um exemplo de valor de cada uma (o dono da tela vai desenhar a partir disso), e em numeros_principais a tabela por setor por faixa (valor, jogadores, valor por jogador, fatias) e o que separa por jogador.`

const P_ETAPA14 = `SUA TAREFA: dono de \`static/proto_c.js\` (e so dele). A TRAVA 1: a etapa 14 tem de ler o JSON novo do gerador sem mentir.
1. Hoje a condicao de "vaga sem nome" (~linha 2460; confira) trata a PRESENCA das chaves com \`alternativas\` vazio como vaga vazia; medido no B8: 7 posicoes completas apareceriam vazias. Troque para: recomendacao, empate_tecnico e alternativas vazios.
2. Mostre o EMPATE TECNICO por nome (classe pt-empate do contrato), com a fatia de replicas e o intervalo de 95% (ic95_pct) em numero pequeno, a regra ("recomendado so quando o intervalo fica todo acima de 50%"), a contagem por POSICAO (contagem_por) e o motivo gravado da mudanca dos nomes; \`vagas_sem_recomendacao\` e as chaves novas de filtro do cenario (\`filtro_do_cenario\`, com \`admite_sem_valor\` ao lado da regra — o dono ainda vai decidir se o cenario barato exige valor de mercado: mostre o que esta gravado, sem opinar).
3. O filtro de nacionalidade (ja existe, desligado sem dado) tem de ligar sozinho com nac/psp do JSON novo: confira que liga e que a regra da dupla com o Brasil vale.
4. Compatibilidade: com o prototipo.js ANTIGO (o de hoje) a etapa 14 continua desenhando igual, sem erro.
TESTE: pasta-espelho em ${W}/espelho_c com o app e o static, trocando SO o prototipo.js pelo do B8 (${G_OUT}), servida na porta 5131; e o app real (dado antigo) na mesma porta depois. Nas duas: 16/16 etapas, zero erro, zero rolagem lateral a 1.785, nada cortado a 400; na do B8, conte as posicoes com recomendado, com empate e sem nome e compare com o JSON.`

const P_CASCA = `SUA TAREFA: dono de \`static/proto.js\` e \`static/style.css\` (so deles; outros donos escrevem proto_c.js e gerar_prototipo.py AGORA: mudancas aditivas, nenhum nome publicado muda).
Pela DECISAO 3 DO DONO: o texto do "Controle 2" (ptControles, ~linha 1588; confira) diz hoje que nem todo jogador tem preco, que time barato tem mais jogador sem preco, que "o valor do time barato esta por baixo, e isso pode deixar a distancia entre rico e pobre maior ou menor do que e de verdade; esta conta nao sabe dizer". Reescreva: jogador sem preco no Transfermarkt e, na pratica, jogador de valor baixo ou sem mercado (leitura do clube, registrada como decisao do dono em 14/09); por isso a soma do elenco nao fica por baixo por causa deles, e o fato de time barato ter mais jogador sem preco e coerente com isso. Mantenha a medida (cobertura por temporada e a relacao com o valor, lidas do dado, numero tecnico ao lado) e so mostre a frase quando o dado sustenta, como hoje. Procure em proto.js, proto_a.js, proto_b.js, proto_c.js e no glossario (SO LEITURA fora dos seus arquivos) qualquer outra frase de tela que diga que o sem preco deixa o valor subestimado ou que a conta nao sabe dizer: conserte a sua; as de outros arquivos, liste em riscos com arquivo:linha.
TESTE: app real numa porta livre (5130; derrube ao fim), aba Prototipo: 16/16, zero erro, e a frase nova aparecendo onde a antiga aparecia.`

phase('Gerador, etapa 14 e casca')
const [ger, e14, casca] = await Promise.all([
  agent(`${CASA}\n\n${P_GERADOR}`, { label: 'dono:gerador', phase: 'Gerador, etapa 14 e casca', schema: ESC, effort: 'xhigh' }),
  agent(`${CASA}\n\n${P_ETAPA14}`, { label: 'dono:proto_c', phase: 'Gerador, etapa 14 e casca', schema: ESC, effort: 'high' }),
  agent(`${CASA}\n\n${P_CASCA}`, { label: 'dono:casca', phase: 'Gerador, etapa 14 e casca', schema: ESC, effort: 'high' }),
])
log(`gerador: ${ger ? 'ok' : 'FALHOU'} · etapa 14: ${e14 ? 'ok' : 'FALHOU'} · casca: ${casca ? 'ok' : 'FALHOU'}`)

phase('Etapa 1')
const P_ETAPA1 = `SUA TAREFA: dono de \`static/proto_a.js\` (e so dele). Desenhar os pedidos do dono no quadro "Onde esta o dinheiro" (paCardSetor, ~linha 800), lendo as chaves novas que o dono do gerador acabou de gravar no rascunho \`${W}/prototipo_setores.json\`. O relato dele (chaves exatas e numeros):
${JSON.stringify(ger, null, 1).slice(0, 30000)}
1. A tabela por setor ganha: jogadores do elenco (todos os listados; o sem preco conta como jogador de valor baixo, decisao 3) e valor por jogador, e a fatia do valor AO LADO da fatia de jogadores, por grupo (subiu · meio · caiu). A frase principal diz as duas coisas em portugues de reuniao (valor total do setor e valor por jogador), sem afirmar mais que o dado.
2. "O que separa" ganha a leitura por jogador (mesma forma da tabela atual, com o desconto dos 4 testes); a particao ganha a versao ponderada (fatia do valor / fatia de jogadores), com o desconto dos testes. Se a leitura por jogador contradisser a do valor total, a tela diz isso com todas as letras. Nenhum "descontado o dinheiro" novo (decisao 4).
3. A TABELA POR TIME, ABERTA: as 80 temporadas, filtro por grupo (todos / subiu / meio / caiu), ordenavel, colunas compactas por setor (valor · jogadores · valor por jogador), total do elenco, posicao final; sem rolagem lateral a 1.785 px (rolagem vertical propria se precisar, com cabecalho grudado — classes do contrato). Diga no cabecalho de onde vem (Transfermarkt por temporada) e a regra de quem conta como jogador (lida do bloco \`regra\`).
4. Com o prototipo.js ANTIGO (sem as chaves novas), o quadro continua desenhando como hoje, com a ausencia escrita discretamente.
TESTE: pasta-espelho em ${W}/espelho_a com o static e o prototipo.js gerado a partir de \`${W}/prototipo_setores.json\` (monte a copia com a mesma logica do gerar_prototipo_js.py, sem gravar no projeto), servida na porta 5132; e o app real (dado antigo). 16/16 etapas, zero erro, zero rolagem lateral a 1.785, nada cortado a 400, nenhum numero digitado.`
const e1 = ger ? await agent(`${CASA}\n\n${P_ETAPA1}`, { label: 'dono:proto_a', phase: 'Etapa 1', schema: ESC, effort: 'high' }) : null

phase('Gravar')
const P_GRAVAR = `SUA TAREFA: gravar o dado novo do Prototipo, agora que a tela da etapa 14 (proto_c.js) le o empate tecnico e a etapa 1 (proto_a.js) le o bloco por jogador. Voce so RODA o gerador: nao edite nenhum arquivo de codigo.
Relatos: gerador ${JSON.stringify(ger, null, 1).slice(0, 12000)}
etapa 14 ${JSON.stringify(e14, null, 1).slice(0, 8000)}
etapa 1 ${JSON.stringify(e1, null, 1).slice(0, 8000)}
casca ${JSON.stringify(casca, null, 1).slice(0, 5000)}
1. Copie o \`dados/prototipo.json\` atual para ${W}/prototipo_antes_da_gravacao.json.
2. Rode \`python3 gerar_prototipo.py\` (grava dados/prototipo.json) e \`python3 gerar_prototipo_js.py\` (grava static/prototipo.js).
3. Diff caminho a caminho contra a copia: liste por etapa o que mudou e confira que e o esperado (bloco 1 do gerador: faixa_sobe/faixas cruas e marca de ordem na etapa 5, id/nac/psp, etapa 11 sem 2026, ranking_gaps no topo, bugs de p e d minimo, etapa 14 por posicao; e o bloco por jogador da etapa 1). Nada fora disso.
4. Regressao headless no app real servido numa porta livre (5133; nunca 5090/5091), a 1.785 e a 400 px: 16/16 etapas, zero erro, zero undefined/NaN, zero rolagem lateral a 1.785, nada cortado a 400; e diga o que as OUTRAS etapas passaram a mostrar com o dado novo (etapa 5 com a linha da faixa de quem subiu? a legenda diz que sao quartis? etapa 11 com os numeros sem 2026?).`
const grav = (e14 && e1) ? await agent(`${CASA}\n\n${P_GRAVAR}`, { label: 'grava', phase: 'Gravar', schema: ESC, effort: 'high' }) : null

phase('Conferir')
const RELATO = JSON.stringify({ gerador: ger, etapa14: e14, casca, etapa1: e1, gravacao: grav }, null, 1).slice(0, 70000)
const LENTES = [
  { k: 'numeros-por-jogador', p: `OS NUMEROS POR JOGADOR, por caminho proprio (sem importar o gerador): a partir de dados/serieb_elencos.csv e dados/serieb_clube_temporada.csv, refaca para as 80 temporadas o de-para posicao -> setor, a soma por setor contra val_*, os jogadores listados e com preco, o valor por jogador (todos os listados contam, decisao 3), as fatias e o indice; as medianas por faixa; o posto no ano, AUC, p e BH por jogador e da particao ponderada; e 6 times sorteados da tabela por time. Compare com o dados/prototipo.json gravado, numero a numero.` },
  { k: 'tela-e-linguagem', p: `A TELA, no navegador headless do app real (porta 5134; derrube ao fim), a 1.785 e a 400 px. Etapa 1: os pedidos do dono estao feitos como ele pediu (tabela por time aberta com filtro, jogadores e valor por jogador por setor, fatia do valor ao lado da fatia de jogadores, testes por jogador)? Os numeros da tela batem com o JSON? O Controle 2 diz o que a decisao 3 manda, sem sobra da frase antiga em nenhum lugar da aba? Etapa 14: empate tecnico por nome, intervalo, contagem por posicao, nenhuma posicao completa aparecendo vazia, filtro de nacionalidade ligado. As outras etapas com o dado novo: algo que antes nao aparecia e agora aparece sem explicacao (linha da faixa de quem subiu sem legenda de quartis, botao de escala, etc.)? Linguagem: numero digitado, jargao fora do numero pequeno, frase que afirma mais que o dado, receita.` },
  { k: 'efeito-nas-conclusoes', p: `O EFEITO NAS CONCLUSOES, so leitura: leia _fonte/prototipo/CONCLUSOES.md e conclusoes_spec.json. (a) Quais conclusoes falam de valor por setor ou fatia do elenco (DIN-05 e outras)? A leitura por jogador, agora gravada, confirma, enfraquece ou contradiz cada uma? (b) Quais conclusoes ou ressalvas dizem que o jogador sem preco deixa o valor subestimado, contra a decisao 3? (c) Liste, conclusao a conclusao, onde o selo depende do desconto pelo valor do elenco (decisao 4, ainda sem forma definida) e qual selo sairia sem esse criterio, pela regua escrita. NAO edite nada; isso vira pendencia no CONTINUAR.` },
]
let confs = (await parallel(LENTES.map(l => () => agent(`${CASA}

O que foi feito nesta rodada:
${RELATO}

VOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. SUA LENTE: ${l.p}`,
  { label: 'confere:' + l.k, phase: 'Conferir', schema: CONF, effort: 'high' }).then(r => r ? { ...r, k: l.k } : null)))).filter(Boolean)

const graves = confs.filter(c => c.k !== 'efeito-nas-conclusoes').flatMap(c => c.problemas.filter(p => ['quebra', 'mente', 'falta'].includes(p.gravidade)).map(p => ({ ...p, lente: c.k })))
log('conferencias: ' + confs.map(c => `${c.k} ${c.veredito}`).join(' · ') + ` · graves: ${graves.length}`)

let consertos = [], reconf = null
if (graves.length) {
  phase('Consertar')
  const DONOS = [
    { k: 'gerador', arq: 'gerar_prototipo.py', p: P_GERADOR, porta: 5136 },
    { k: 'proto_a', arq: 'proto_a.js', p: P_ETAPA1, porta: 5137 },
    { k: 'proto_c', arq: 'proto_c.js', p: P_ETAPA14, porta: 5138 },
    { k: 'proto_b', arq: 'proto_b.js', p: 'SUA TAREFA: dono de `static/proto_b.js` (etapas 5-8), so para o que os conferentes apontaram nas etapas 5-8 com o dado novo (por exemplo a legenda de quartis na linha da faixa de quem subiu: "metade dos times do grupo fica entre o primeiro e o terceiro numero; o do meio e o time tipico").', porta: 5139 },
    { k: 'casca', arq: 'proto.js', p: P_CASCA, porta: 5140 },
  ]
  const por = {}
  for (const p of graves) { const d = DONOS.find(x => (p.arquivo || '').includes(x.arq) || (x.k === 'casca' && (p.arquivo || '').includes('style.css'))) || DONOS[1]; (por[d.k] = por[d.k] || []).push(p) }
  consertos = (await parallel(Object.entries(por).map(([k, ps]) => () => {
    const d = DONOS.find(x => x.k === k)
    return agent(`${CASA}

${d.p}

RODADA DE CONSERTO. Arquivo que VOCE pode escrever: ${d.arq}${d.k === 'casca' ? ' e static/style.css' : ''}. Nenhum outro. Porta de teste: ${d.porta}. ${d.k === 'gerador' ? 'Pode rodar o main gravando dados/prototipo.json e o gerar_prototipo_js.py de novo SE o conserto mudar o dado, e diga o diff.' : 'Teste contra o dados/prototipo.json ja gravado (o dado novo).'}
Problemas nos seus arquivos:
${JSON.stringify(ps, null, 1).slice(0, 30000)}
Confirme cada um antes (o conferente pode ter errado: diga por que), conserte, rode de novo o seu teste.`,
      { label: 'conserta:' + k, phase: 'Consertar', schema: ESC, effort: 'high' }).then(r => r ? { ...r, k } : null)
  }))).filter(Boolean)
  reconf = await agent(`${CASA}

RECONFERENCIA (porta 5141; derrube ao fim). Problemas graves de antes:
${JSON.stringify(graves, null, 1).slice(0, 30000)}
Consertos:
${JSON.stringify(consertos, null, 1).slice(0, 30000)}
Confira cada problema no app real com o dado gravado; rode a regressao da aba Prototipo (16/16, zero erro, zero undefined, zero rolagem lateral a 1.785, nada cortado a 400); confira que dados/prototipo.json e static/prototipo.js estao sincronizados. Voce NAO escreve em arquivo do projeto.`,
    { label: 'reconfere', phase: 'Consertar', schema: CONF, effort: 'high' })
}
return { gerador: ger, etapa14: e14, casca, etapa1: e1, gravacao: grav, conferencias: confs, consertos, reconferencia: reconf }
