export const meta = {
  name: 'gerador-degraus-1',
  description: 'Metade gerador, primeiro bloco: gerar_prototipo.py em degraus com diff proprio (faixas, nac/psp, corte de 2026 na etapa 11, tabela de gaps, etapa 14 por posicao, bugs relatados), saida so no scratch, com tres ceticos e uma rodada de conserto',
  phases: [
    { title: 'Degraus', detail: 'um dono: gerar_prototipo.py, saida no scratch' },
    { title: 'Conferir', detail: 'diff por degrau; etapa 14; bugs e determinismo' },
    { title: 'Consertar', detail: 'uma rodada e reconferencia' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'
const S = '/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Analise-de-Performance/3b480dcb-f5fd-4012-affc-42b2f39ecf7c/scratchpad'
const G_OUT = S + '/gerador'

const CASA = `PROJETO Santa Cruz (${RAIZ}). Estudo da Serie B. A aba Prototipo le \`dados/prototipo.json\`, produzido por \`gerar_prototipo.py\` (etapas 0 a 15, 80 temporadas 2022-2025, faixas por posicao final: sobe 1-4, meio 5-16, cai 17-20). \`gerar_prototipo_js.py\` copia o JSON para \`static/prototipo.js\`. A aba por pontos (\`gerar_pontos.py\`, JA FECHADA E APROVADA nesta sessao) importa o gerador como biblioteca, e \`ranking_gaps.py\` e o modulo compartilhado da tabela de todas as diferencas.
LEIA ANTES, INTEIROS: \`${RAIZ}/_fonte/prototipo/CONTINUAR.md\` (secoes 3 a 5 e "Decisoes do dono em 14/09"), \`${RAIZ}/_fonte/prototipo/PENDENTE_RODADA.md\` (itens 2, 6, 9, 15 e 16), e o mapa desta metade: \`${S}/mapa_rodada.json\`, chaves "mapa:gerador" e "critico-do-plano" (ordem recomendada e dependencias escondidas).
MATERIAL JA MEDIDO PARA VOCE:
- A chamada FINAL e testada de ranking_gaps.tabela_de_gaps para o main do Prototipo: \`${S}/api_final_gerador.txt\` (Series indexadas por (ano, clube); vetor solto e recusado).
- Bugs do gerador achados pela obra da aba por pontos (relatados, nunca consertados la): em \`${S}/pontos_journal.json\`, retorno de 'constroi' (campo bugs_do_gerador_do_prototipo_achados) e o ultimo item de nao_consertados de 'conserta-1': etapa_11 sem corte de 2026; o idioma \`(p or 1) < 0.05\` com p arredondado que vira 0 e conta como 1; p gravado 0 por arredondamento (p nunca e zero); d_minimo_detectavel com nct devolvendo NaN no alfa de Bonferroni; Bonferroni com 191 digitado (catalogo tem 293); "229 indicadores" e n=16 digitados; posto_val com rank medio truncado por int().
- As medidas do mapa: faixa_sobe e faixa_*_bruto prontos no codigo e nunca rodados (em 88 de 293 indicadores a ORDEM das medianas no cru difere da do percentil — grave isso junto das faixas cruas); etapa 14 conta por VAGA e divide o mesmo atleta entre vagas gemeas (ZD, ZE, VOL, MED, CA), rng GLOBAL na linha ~3173.
DECISOES DO DONO (valem, nao reabrir): etapa 14 conta por POSICAO (nao por vaga), 2.000 replicas, sorteio proprio POR PROPOSTA \`np.random.default_rng([SEMENTE, 14, i])\` com i declarado, e marca de EMPATE TECNICO quando o intervalo de 95% da fatia de replicas de um nome cruzar 50% ("recomendado" so claramente acima); os nomes vao mudar e o motivo fica gravado no JSON. Corte de 2026 na etapa 11: e bug, conserte e grave o efeito.
REGRAS DA CASA: semente fixa; nenhum numero ou frase digitada passando por medida; ausencia com motivo; comentario em prosa explicando o POR QUE; qualquer set iterado que decida ordem vira sorted/dict.fromkeys; etapa que sorteia tem gerador proprio; \`etapa_14.propostas[].vagas_detalhe[].recomendacao\` e uma LISTA; fora do main carregue \`G.DECL = G.carregar_declaracao()\` antes de montar_matriz.
PROIBIDO: qualquer git que escreva (commit, push, add, reset, checkout, stash, revert, tag).
NAO EDITE: \`gerar_pontos.py\`, \`ranking_gaps.py\` (fechados; achou bug? RELATE), \`dados/prototipo_indicadores.json\` e o bloco \`conclusoes\` (proximo bloco da rodada, depois que o CONCLUSOES.md fechar — outra rodada esta nele AGORA), \`_fonte/prototipo/CONCLUSOES.md\`, \`_fonte/prototipo/conclusoes_spec.json\`, \`static/*\`, \`templates/*\`, e NAO GRAVE \`dados/prototipo.json\` nem \`static/prototipo.js\` nesta rodada (a tela esta sendo conferida contra eles AGORA): toda saida do main vai para ${G_OUT}, trocando \`G.SAIDA\` antes de chamar, com \`python3 -B\`. NAO use nem derrube as portas 5090/5091.`

const BUILD = { type: 'object', properties: {
  degraus: { type: 'array', items: { type: 'object', properties: {
    degrau: { type: 'string' }, arquivo_de_saida: { type: 'string' }, o_que_mudou_no_codigo: { type: 'string' },
    chaves_que_mudaram: { type: 'string' }, chaves_que_nao_podiam_mudar_e_nao_mudaram: { type: 'string' }, numeros_antes_e_depois: { type: 'string' },
  }, required: ['degrau', 'arquivo_de_saida', 'o_que_mudou_no_codigo', 'chaves_que_mudaram', 'chaves_que_nao_podiam_mudar_e_nao_mudaram', 'numeros_antes_e_depois'] } },
  drift_b0: { type: 'string' },
  deterministico: { type: 'string' },
  etapa_14_nomes_antes_e_depois: { type: 'string' },
  tempo_do_main: { type: 'string' },
  bugs_consertados: { type: 'array', items: { type: 'string' } },
  achados_novos: { type: 'array', items: { type: 'string' } },
  o_que_ficou_para_o_bloco_2: { type: 'array', items: { type: 'string' } },
  o_que_nao_consegui: { type: 'string' },
}, required: ['degraus', 'drift_b0', 'deterministico', 'etapa_14_nomes_antes_e_depois', 'tempo_do_main', 'bugs_consertados', 'achados_novos', 'o_que_ficou_para_o_bloco_2', 'o_que_nao_consegui'] }

const CONF = { type: 'object', properties: {
  lente: { type: 'string' }, conferidos: { type: 'integer' },
  problemas: { type: 'array', items: { type: 'object', properties: {
    onde: { type: 'string' }, no_json: { type: 'string' }, eu_medi: { type: 'string' }, por_que_importa: { type: 'string' }, conserto: { type: 'string' },
    gravidade: { type: 'string', enum: ['mente', 'quebra', 'falta', 'detalhe'] },
  }, required: ['onde', 'no_json', 'eu_medi', 'por_que_importa', 'conserto', 'gravidade'] } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['lente', 'conferidos', 'problemas', 'veredito'] }

phase('Degraus')
const build = await agent(`${CASA}

TAREFA: voce e o UNICO dono de \`gerar_prototipo.py\` nesta rodada. Trabalhe em DEGRAUS, cada um com a saida do main no seu arquivo em ${G_OUT} e o diff contra o degrau anterior (caminho a caminho, fora \`gerado_em\`):
B0. O codigo da HEAD de hoje, SEM mudanca, rodado no scratch; diff contra \`dados/prototipo.json\` salvo (o JSON e de 21:25 e o gerador foi editado as 21:49 de 13/09): explique o drift antes de misturar mudanca nova. Prove determinismo aqui (PYTHONHASHSEED 1 x 2) e meca o tempo do main.
B1. Faixas: faixa_sobe e faixa_{sobe,meio,cai}_bruto (so rodar e conferir; grave junto, por painel, a marca dos indicadores em que a ordem das medianas no cru difere da ordem no percentil).
B2. nac E psp (de jogadores.json, no mesmo dict do atleta) em etapa_13.candidatos, na trilha do goleiro e em cada entrada de recomendacao/alternativas da etapa 14 (por indice do pool, nunca pelo texto "Nome (Clube)"); quando vier None, null e motivo. Liga e idade tambem nas entradas da etapa 14. Conte quantos tem psp com Brasil e nac diferente.
B3. Corte de 2026 na etapa 11 (tecnico; e no fisico, se a edicao de 2026 entrar): grave efeito_de_retirar_2026 como o gerar_pontos.py grava (pares antes e depois, rho mediano). Aqui a etapa 11 PODE mudar; em nenhum outro degrau.
B4. Tabela de gaps: \`import ranking_gaps as RG\` e a chamada de ${S}/api_final_gerador.txt, gravada em \`ranking_gaps\` no topo do JSON, com rotulos sobe/meio/cai, ano_maximo=2025, outro periodo 2018-2021, controles fisicos. A linha da sorte por posicao tem de dar a MESMA do \`dados/pontos.json\` em ranking_gaps.mesma_tabela_com_as_faixas_por_posicao (37,78 hoje): confira.
B5. Bugs relatados: o idioma \`(p or 1)\` (use o p cru), p nunca gravado 0 (algarismos significativos ou "< limite"), d_minimo com Bonferroni sem NaN (mesma formula nas duas colunas, gravada), Bonferroni com len(catalogo), os literais digitados (229, n=16) vindos do dado, posto_val sem truncar o rank medio. Para cada um: numero antes e depois.
B6. Etapa 14 pela decisao do dono: contagem por POSICAO, 2.000 replicas, gerador proprio por proposta [SEMENTE, 14, i], empate tecnico pelo intervalo de 95% da fatia de replicas, motivo da mudanca gravado; mantenha as chaves que a tela le (recomendacao lista, alternativas, freq_pct) e ACRESCENTE empate_tecnico, ic95_pct, contagem_por. Tabela dos nomes antes e depois por proposta e vaga. Prove que mudar a proposta i nao move a j, e diga o que o fim do rng global deslocou nas etapas seguintes (15 e o erro da margem da 13: confira que a 13 NAO muda neste degrau).
B7. Determinismo de novo (PYTHONHASHSEED 1 x 2, zero diferenca fora de gerado_em) e o diff total B0 -> B7.
Nao grave dados/prototipo.json nem static/prototipo.js. Relate cada degrau.`,
  { label: 'dono:gerador', phase: 'Degraus', schema: BUILD, effort: 'xhigh' })

phase('Conferir')
const LENTES = [
  { k: 'degraus-e-diff', p: `DEGRAUS E DIFF. Por caminho proprio: (1) o diff de cada degrau (os arquivos estao em ${G_OUT}) so mexe no que o degrau declara? Em especial a etapa 11 so no B3 e a etapa 13 nunca. (2) faixa_sobe e faixa_sobe_bruto de 3 paineis e 4 indicadores recalculados do CSV e da matriz; a marca de ordem trocada no cru confere em 5 casos. (3) nac/psp de 20 candidatos e 10 entradas da etapa 14 conferidos em jogadores.json pelo indice. (4) etapa 11 sem 2026: pares e rho batem com o que dados/pontos.json grava em etapa_11. (5) a tabela de gaps por posicao bate com a de pontos.json (mesma_tabela_com_as_faixas_por_posicao) linha a linha.` },
  { k: 'etapa-14', p: `A ETAPA 14 NOVA. Leia o codigo e refaca por fora: a contagem por posicao junta de fato as vagas gemeas? 2.000 replicas? o gerador de cada proposta e independente (troque a ordem das propostas ou tire uma e confira que as outras nao mudam)? o empate tecnico usa um intervalo de 95% correto para a fatia (diga qual: Wilson ou Clopper-Pearson) e marca quem cruza 50%? os campos que a tela le continuam (recomendacao LISTA, alternativas, freq_pct)? o motivo da mudanca dos nomes esta gravado? a tabela de nomes antes e depois do relato bate com os JSONs?` },
  { k: 'bugs-e-determinismo', p: `BUGS E DETERMINISMO. Cace no gerar_prototipo.py de agora: ainda existe \`(p or 1)\` ou comparacao com p arredondado? p gravado 0 em algum lugar do JSON final? d_minimo com NaN? Bonferroni ou contagem digitada? set iterado decidindo ordem? rank truncado? Rode o main duas vezes com PYTHONHASHSEED diferentes (saida em ${S}/conf_gerador, troque G.SAIDA, python3 -B) e compare. Confira tambem que gerar_pontos.py continua rodando com o gerador novo (rode no scratch trocando GP.SAIDA; so diga o que quebra ou muda, sem editar).` },
]
let confs = (await parallel(LENTES.map(l => () => agent(`${CASA}

O dono do gerador relatou:
${JSON.stringify(build, null, 1).slice(0, 60000)}

VOCE CONFERE, e a sua inclinacao e achar erro. Voce NAO escreve em arquivo do projeto. SUA LENTE: ${l.p}`,
  { label: 'confere:' + l.k, phase: 'Conferir', schema: CONF, effort: 'high' }).then(r => r ? { ...r, k: l.k } : null)))).filter(Boolean)
const graves = cs => cs.flatMap(c => c.problemas.filter(p => ['mente', 'quebra', 'falta'].includes(p.gravidade)).map(p => ({ ...p, lente: c.k })))
log('conferencias: ' + confs.map(c => `${c.k} ${c.veredito} (${graves([c]).length} graves)`).join(' · '))

let fix = null, reconf = null
if (graves(confs).length) {
  phase('Consertar')
  fix = await agent(`${CASA}

RODADA DE CONSERTO. Relato anterior:
${JSON.stringify(build, null, 1).slice(0, 25000)}
Conferencias (todos os problemas):
${JSON.stringify(confs.map(c => ({ lente: c.k, veredito: c.veredito, problemas: c.problemas })), null, 1).slice(0, 50000)}
Confirme cada problema medindo (o cetico pode ter errado: diga por que), conserte no gerar_prototipo.py, rode de novo o main no scratch (novo arquivo em ${G_OUT}), determinismo, e o diff contra o B7 anterior.`,
    { label: 'conserta:gerador', phase: 'Consertar', schema: BUILD, effort: 'xhigh' })
  reconf = await agent(`${CASA}

RECONFERENCIA. Problemas graves de antes:
${JSON.stringify(graves(confs), null, 1).slice(0, 35000)}
Relato do conserto:
${JSON.stringify(fix, null, 1).slice(0, 35000)}
Confira cada problema por conta propria, determinismo, e o que o conserto quebrou. Voce NAO escreve em arquivo do projeto.`,
    { label: 'reconfere', phase: 'Consertar', schema: CONF, effort: 'high' })
}
return { gerador: build, conferencias: confs, conserto: fix, reconferencia: reconf }
