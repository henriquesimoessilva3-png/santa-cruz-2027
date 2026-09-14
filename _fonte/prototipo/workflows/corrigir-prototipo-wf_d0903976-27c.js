export const meta = {
  name: 'corrigir-prototipo',
  description: 'Aplica as 23 correcoes que a conferencia achou em gerar_prototipo.py, re-roda os dois geradores e confere o JSON novo',
  phases: [
    { title: 'Corrigir', detail: 'tres blocos disjuntos do arquivo, aplicados em ordem' },
    { title: 'Rodar', detail: 'gerar_prototipo.py e depois gerar_prototipo_js.py' },
    { title: 'Conferir', detail: 'tres ceticos batem o JSON novo contra a lista de correcoes' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'

const CASA = `PROJETO Santa Cruz (${RAIZ}).

CONTEXTO: o \`dados/prototipo.json\` foi produzido por \`gerar_prototipo.py\` (135 KB) e acaba de
passar por uma conferencia de tres ceticos independentes. O laudo esta em
**${RAIZ}/_fonte/prototipo/CONFERENCIA.md — leia inteiro antes de tocar no codigo.**

O VEREDITO DA CONFERENCIA, em uma linha: **a aritmetica do gerador e fiel — 5.567 comparacoes
campo a campo no catalogo, zero divergencias — mas ha dois bugs de CODIGO e um punhado de
problemas de METODO e de auditabilidade.**

ISSO MANDA NO SEU TRABALHO: **nao mexa em numero que ja foi conferido.** Se a sua correcao
muda um numero, ela tem que mudar por uma razao escrita. Uma correcao que altera silenciosamente
uma etapa que nao era sua e regressao, nao conserto.

FERRAMENTAS: numpy, pandas, scipy, sklearn, matplotlib SIM. statsmodels, pulp, ortools NAO.
Semente fixa: rng = np.random.default_rng(7).

REGRAS DA CASA:
- NENHUMA frase escrita a mao passando por medida. Toda afirmacao carrega n, p e rho.
- Onde o dado nao existe, grave a ausencia COM O MOTIVO. Nunca impute.
- 2026 tem 27 de 38 rodadas e nao entra em media nenhuma.
- Comentario e prosa explicando POR QUE, nunca o que a linha faz.

A ABA JA EXISTE e le este JSON: \`static/proto.js\`, \`proto_a.js\`, \`proto_b.js\`, \`proto_c.js\`,
alimentados por \`static/prototipo.js\` (gerado de \`dados/prototipo.json\` por
\`gerar_prototipo_js.py\`). **Se voce ACRESCENTAR campo, a aba ignora e nada quebra. Se voce
RENOMEAR ou REMOVER campo, a aba quebra.** Entao: prefira acrescentar. Quando precisar mesmo
renomear ou remover, registre em "campos_que_mudaram_de_nome_ou_sumiram" — eu conserto a aba.`

const OUT = { type: 'object', properties: {
  bloco: { type: 'string' },
  aplicadas: { type: 'array', items: { type: 'object', properties: {
    correcao: { type: 'string' }, linha: { type: 'string' }, o_que_mudou: { type: 'string' },
  }, required: ['correcao', 'linha', 'o_que_mudou'] } },
  nao_aplicadas: { type: 'array', items: { type: 'object', properties: {
    correcao: { type: 'string' }, por_que: { type: 'string' },
  }, required: ['correcao', 'por_que'] } },
  campos_novos_no_json: { type: 'array', items: { type: 'string' } },
  campos_que_mudaram_de_nome_ou_sumiram: { type: 'array', items: { type: 'string' } },
  numeros_que_vao_mudar: { type: 'array', items: { type: 'string' } },
  compila: { type: 'boolean' },
  o_que_nao_consegui: { type: 'string' },
}, required: ['bloco', 'aplicadas', 'nao_aplicadas', 'campos_novos_no_json',
  'campos_que_mudaram_de_nome_ou_sumiram', 'numeros_que_vao_mudar', 'compila', 'o_que_nao_consegui'] }

const RUN = { type: 'object', properties: {
  rodou: { type: 'boolean' },
  saida_do_terminal: { type: 'string' },
  json_kb: { type: 'integer' },
  json_chaves: { type: 'array', items: { type: 'string' } },
  prototipo_js_kb: { type: 'integer' },
  diff_contra_o_json_antigo: { type: 'array', items: { type: 'object', properties: {
    campo: { type: 'string' }, antes: { type: 'string' }, depois: { type: 'string' },
    esperado_pela_correcao: { type: 'boolean' },
  }, required: ['campo', 'antes', 'depois', 'esperado_pela_correcao'] } },
  mudancas_inesperadas: { type: 'array', items: { type: 'string' } },
  aba_ainda_carrega: { type: 'boolean' },
  o_que_nao_consegui: { type: 'string' },
}, required: ['rodou', 'saida_do_terminal', 'json_kb', 'json_chaves', 'prototipo_js_kb',
  'diff_contra_o_json_antigo', 'mudancas_inesperadas', 'aba_ainda_carrega', 'o_que_nao_consegui'] }

const CONF = { type: 'object', properties: {
  bloco: { type: 'string' },
  correcoes_conferidas: { type: 'integer' },
  correcoes_que_nao_pegaram: { type: 'array', items: { type: 'string' } },
  regressoes: { type: 'array', items: { type: 'object', properties: {
    campo: { type: 'string' }, antes: { type: 'string' }, agora: { type: 'string' },
    por_que_e_regressao: { type: 'string' },
  }, required: ['campo', 'antes', 'agora', 'por_que_e_regressao'] } },
  numeros_novos_que_importam: { type: 'array', items: { type: 'string' } },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'rejeitar'] },
}, required: ['bloco', 'correcoes_conferidas', 'correcoes_que_nao_pegaram', 'regressoes',
  'numeros_novos_que_importam', 'veredito'] }

phase('Corrigir')

const BLOCOS = [
  { k: 'dinheiro-catalogo-garimpo', p: `SEU BLOCO: etapas 1, 2 e 3 — a linha de base do dinheiro,
o catalogo de 293 indicadores e o nulo do garimpo. Mexa SO nessa regiao do arquivo
(aproximadamente linhas 80 a 900). As correcoes, na ordem:

1. **O selo de porta mente em 5 linhas** (~linha 735). Hoje o ramo do selo B escolhe entre duas
   frases olhando so \`rho >= 0.30\`, e esquece que a linha pode ter morrido no \`q\`.
   \`fis_zaga_distance_p90\`, \`fis_zaga_m_per_min\`, \`fis_zaga_m_per_min_tip\`,
   \`fis_zaga_distance_p30tip\` e \`fis_lateral_runs_dangerous_p30tip\` recebem "falha na porta
   temporal" e os cinco tem \`rho_1T_2T = null\`: nunca passaram por porta temporal nenhuma.
   Troque por tres casos MEDIDOS: se rho < 0,30 -> "nao se repete de um ano para o outro
   (rho=X)"; senao se q_SM >= 0,10 -> "sobrevive ao dinheiro mas nao sobrevive a familia
   (q=X em N testes)"; senao, e SO se o indicador for de jogo -> "falha na porta temporal".

2. **A Porta A e vacuosa para 265 dos 293** (~linha 732). \`ok_temporal\` e verdadeiro por
   omissao quando o indicador nao tem \`rho_1T_2T\`. Hoje a unica Porta A e \`dist_remate\`, que
   passou de verdade — mas \`fis_zaga_distance_p90\` chegou a p_liq 0,021 e so nao virou A porque
   o q segurou. Se virasse, sairia na tela com o selo "PREVE O 2o TURNO" sem nunca ter sido
   testado. Vede a Porta A para indicador sem porta temporal, e escreva o motivo no
   \`porta_motivo\`.

3. **p zero literal** (~linha 489): \`p_cobertura_x_valor\` sai 0.0 porque \`r(p, 4)\` arredonda
   5,17e-08. Notacao cientifica ou o rotulo "<0,0001". Numero que nao existe nao vai a tela.

4. **N_GARIMPO de 400 para 5.000** (linha 87). Custa segundos. Publique \`p_do_melhor\` com 3
   casas mais o intervalo de Monte Carlo. E alinhe a string do metodo ao codigo: o codigo
   permuta as LINHAS dentro do ano (maxT, preserva a correlacao entre indicadores), que e o
   nulo CERTO para precificar busca em colunas correlacionadas — so esta mal descrito. Corrija
   a string, nao o codigo.

5. **O cabecalho anuncia 293 e o garimpo precifica 229**. Acrescente
   \`indicadores_no_catalogo: 293\` ao lado de \`indicadores: 229\` dentro de
   \`nulo_do_garimpo\`, e registre que os 64 de fora sao os fis_zaga_* e fis_lateral_* por
   cobertura (0,891 e 0,875).

6. **fora_da_amostra_2026** — acrescente o bloco a etapa_1. O conferente ja rodou: ajustando em
   2022-2025 e prevendo 2026, o posto de valor da AUC 0,812 sobe x resto, e o top-4 de valor
   acerta 2 dos 4 do G4 atual. Com J=27 e "faixa provisoria" impressos ao lado, porque 2026 nao
   fecha temporada. **Recalcule por conta propria, nao copie o numero dele.**

7. **O CONTROLE QUE FALTAVA — \`fis_atletas\`.** A refutacao do fisico achou um confundidor que
   ninguem controlava: quem sobe usa MENOS gente. \`fis_atletas\` vai de 20,50 (sobe) a 21,90
   (meio) a 25,25 (cai), d=-1,442 p=0,00084, rho=+0,486 com a posicao final. Toda media fisica
   por atleta esta contaminada. Sem isso, o PSV-99 do top-5 parece sobreviver ao dinheiro
   (d=+0,86 p=0,026) e na verdade nao sobrevive (d=+0,47 p=0,158).
   **ACRESCENTE, nao substitua:** um segundo nivel de residualizacao (dinheiro + nº de atletas)
   como campos NOVOS \`d_liq2_SM\`, \`p_liq2_SM\`, \`d_liq2_SC\`, \`p_liq2_SC\` nas 160 linhas
   fisicas, mantendo os \`d_liq\` atuais intactos. So as linhas fisicas — o tecnico coletivo nao
   e media por atleta. E documente por que o controle existe.

8. **A ESPECIFICACAO esta velha em tres pontos.** Corrija em
   \`${RAIZ}/_fonte/prototipo/ESPECIFICACAO.md\`: a linha de \`min_estrangeiros\` da tabela 6.5
   (o certo e +0,899 / 0,0083 / +0,565 / 0,0765 / rho 0,279 — e a unica das 17 que nao bate);
   o "40 passam contra quem caiu" da ETAPA 2 da secao 10 (sao **24** em 293); e o
   "2,7 controles em media" do caliper 0,15 da secao 11 (sao **3,25**).` },

  { k: 'pilares-tipologia', p: `SEU BLOCO: etapas 5 e 8 — os quatro pilares e a tipologia.
Mexa SO nessa regiao (aproximadamente linhas 1100 a 1400). As correcoes:

1. **O BUG DA PERMUTACAO — duas linhas, mesmo erro.** Linhas 1265-1266 e 1301-1302:
   \`rng.permutation(bin_)\` esta DENTRO da compreensao interna, entao sorteia uma rotulagem
   nova por COLUNA em vez de uma por REPLICA. O padrao certo ja existe no proprio arquivo, em
   \`nulo_rot\` (~1136) e \`nulo_lim\` (~1170): uma rotulagem por replica, fixa para as 38
   colunas. Corrija os dois.

2. **MELHOR QUE CORRIGIR: enumerar.** Com n=16 nao ha razao para Monte Carlo. C(16,5)=4.368,
   C(16,3)=560, C(8,3)=56 — roda em segundos. Troque o um-contra-o-resto e os dois andares por
   ENUMERACAO EXATA e grave \`replicas: "exato (4368 particoes)"\`. O selo para de depender de
   semente. Os valores que o conferente obteve: G1 0,00206 · G2 0,15000 · G3 0,02143 ·
   G4 0,00114; andar de cima 0,0536; andar de baixo 0,0179. **Confira por conta propria.**

3. **Devolver o G2 a descritivo.** Com p=0,150 o status calculado volta a coincidir com o
   STATUS_DECLARADO. Mantenha os dois campos lado a lado — e um bom desenho — mas agora eles
   concordam.

4. **Separar o que e k-means do que e tipologia.** \`silhueta_espaco_reduzido\` e \`jaccard\`
   estao dentro de \`tipologia.estabilidade\` e NAO sao a particao declarada: sao k-means k=4 no
   plano dos dois eixos, tamanhos 4/7/3/2. Mova para o cemiterio com etiqueta explicita. No
   lugar, grave a silhueta dos ROTULOS DECLARADOS (o conferente mediu 0,331, contra a gaussiana
   de mesma covariancia p=0,879) e reescreva as duas linhas do veredito com o numero certo.

5. **Julgar a bateria limpa pelo nulo duro.** Acrescente \`p_placebo\` ao bloco
   \`bateria_limpa\` (=0,066 nas mesmas particoes placebo ja geradas) e troque o veredito para
   \`passou: False\`, com os DOIS p visiveis. A ressalva central do documento nao pode ser a
   unica avaliada pelo nulo fraco.
   **E grave junto a leitura que o teste cego obrigou:** a bateria limpa ja era
   NAO-SIGNIFICATIVA na origem (p=0,0627 em 2022-2025). Um resultado que nunca passou nao pode
   "deixar de replicar" — sao dois nao-resultados, nao uma refutacao.

6. **Subir as replicas da bateria de fora de 200 para 10.000** (custa segundos). Corrige
   \`p_rotulo\` de 0,005 (que e o piso de 200 replicas) para ~0,0001 e devolve
   \`sobrevivem_bh5\` de 13 para 11 — os 11 que o TIPOLOGIA.md ja diz.

7. **Fechar os n que faltam.** Grave \`n_clubes\` e \`menor_grupo\` por coluna no bloco fisico, e
   use ESSE n em \`esperados_por_acaso\`, nao 160. Grave \`jogos=608\` no bloco formacao. Troque
   o n das celulas de elenco de J para o numero de atletas do plantel (ou null com o motivo
   "indicador de elenco: n nao e jogo"). Corrija o veredito do fisico de 166 para **160** e
   registre quais 6 colunas fis_* ficaram de fora. Renomeie \`coluna_csv\` para \`origem\` nos
   indicadores \`ti_*\` — **e avise no campo de saida, porque a aba le esse nome.**

8. **Sincronizar o TIPOLOGIA.md com o JSON** (\`${RAIZ}/_fonte/prototipo/TIPOLOGIA.md\`). As
   quatro assinaturas de eixo estao erradas: o documento diz 92/88, 85/37, 53/93, 39/44 e os
   valores medidos sao 87,3/87,0 · 81,7/37,5 · 57,8/88,3 · 45,0/38,0. As % de troca sob ruido
   de Santos e Athletico-PR estao erradas (5% e 6% escritos contra 23% e 38% reais — e o
   marcador "leve" precisa mudar de lado). E "R$" deve virar **euro** em todas as tabelas de
   dinheiro. **Confira cada um contra o JSON antes de escrever.**` },

  { k: 'livres-encaixe-elencos', p: `SEU BLOCO: etapas 12, 13 e 14 — o funil dos livres, a nota
de encaixe e os elencos propostos. Mexa SO nessa regiao (aproximadamente linhas 1800 a 2200).

**A SUA PRIMEIRA CORRECAO E A MAIS CARA DE TODAS. Faca com cuidado.**

1. **BUG DE SINAL na etapa 13** (linha 1907). Em \`pct()\`:
   \`return (100 - p if campo in menor else p), len(vs)\` — o alvo \`pct_{cen}\` de
   \`alvos_fisicos\` JA esta em escala bruta, entao as duas pontas de
   \`1 - abs(p - alvo)/100\` vivem em escalas diferentes. Troque por \`return p, len(vs)\`.
   (Alternativa equivalente: manter a inversao no candidato e inverter TAMBEM o alvo. Escolha
   UMA, nunca as duas.) **422 das 586 notas mudam e a lista publicada de 15 nomes por proposta
   nao sobrevive.** Isso e esperado: a lista de hoje esta errada.

2. **BACKTEST — aplicar a MESMA regra da etapa 13, nao uma parecida.**
   \`usa = [k for k,a in alvo.items() if k in DECL["blocos_encaixe"]["fisica"] and (a["p_clube"] or 1) < 0.05]\`
   e fallback quando \`len(usa) < 3\`, nao quando a lista e vazia. Isso expulsa obr, obr_rec,
   obr_hsr, obr_area, spn_s, hi_s, hi, hi_n, hsr_n, como manda a secao 8.2 da ESPECIFICACAO.
   E filtre o ano: \`t = tec[tec.ano <= 2025]\` no inicio, com \`assert t.ano.max() <= 2025\`, e
   conte a chegada ampla so de 2023 em diante (publique 2241 com o rotulo "2023-2025", ao lado
   de 2916). So depois disso o d=-0,044 / p=0,607 significa alguma coisa sobre o ranking.

3. **A frase do fallback so pode ser escrita quando descreve o que houve.** Dois criterios
   distintos: se \`len(usa) == 0\` -> "nenhum indicador do bloco sobreviveu ao teste por CLUBE;
   caiu-se para BH no teste por ATLETA (pseudorreplicado)"; se \`0 < len(usa) < 3\` -> "so N
   indicador(es) do bloco sobreviveu(ram) ao teste por clube (p_clube<0,05); a nota do setor
   descansa sobre N indicador(es)". Na zaga o certo e o segundo, com N=1 e psv5 p=0,00738.

4. **Conferencia cruzada (etapa 12).** Restrinja a ponte de nome a \`j["l"] == "Brasil B"\` —
   \`serieb_elencos\` 2026 so cobre a Serie B, e casamento fora dela e homonimo por construcao.
   Publique os dois numeros lado a lado: 56,2% (315/560) na Brasil B, que e a populacao
   coberta, e 10,7% (38/355) fora dela, que sao homonimos. A linha de \`ctc=='alta'\` sobe de
   72,7% para 91,5%. Marque tambem que a ponte por \`tm\` cobre so 31 dos 1.136 da Brasil B.

5. **Rotulo do degrau 1 (etapa 12).** \`sul_americanos\` esta errado: 36.446 e o mundo inteiro
   menos o Brasil. Troque por \`nao_brasileiros\`, ou nao emita o campo antes do degrau
   \`ligas_alvo\`.

6. **Etapa 14 — tres correcoes sem as quais a tela sai vazia ou mentindo:**
   (a) **erro-padrao inventado.** O 0,30 esta digitado. Ou meca (bootstrap sobre os \`usa\` do
       setor, ou o desvio da margem do proprio atleta reamostrando os indicadores presentes) e
       grave por atleta, ou grave
       \`erro_padrao_origem: "constante arbitraria 0,30/sqrt(sc_n) — nao medida"\` para o leitor
       saber por que 15 vagas vieram em branco. Prefira medir.
   (b) **14 vagas em branco silenciosas** nas tres propostas sul-americanas. Quando
       \`recomendacao\` e \`alternativas\` saem as duas vazias, grave
       \`motivo: "nenhum nome passou de 10% das 200 replicas; a massa ficou espalhada entre N
       candidatos"\`, com o N e a frequencia do primeiro colocado.
   (c) **restricoes que nao existem.** Nao da para listar \`minimo_com_1800_min: 5\` ao lado de
       \`com_1800_min_no_nucleo: 1\`. Ou implemente o teto de folha da secao 9(ii) como banda e
       a regra dos 5 veteranos como restricao de conjunto (reservando k vagas para
       \`min>=1800\` antes do Hungaro), ou declare as duas como NAO IMPLEMENTADAS em
       \`restricoes\`, com o motivo.

7. **Contrafactual.** \`sum(c["mv"] or 0)\` soma zero para quem nao tem valor. Some so os que
   tem, publicando \`atletas_com_valor: 8 de 15\`, e na mesma base da regua (top-8, nao top-15).
   O quartil nao muda (continua 1, 5,0%) — a correcao e de honestidade do numero.

8. **Cabecalho.** \`forma: "nucleo de 16 (XI + 5)"\` com \`vagas: 15\`: troque para "nucleo de 15
   de campo (XI + 4); o goleiro sai por regra — SkillCorner nao rastreia goleiro", e deixe a
   grade de 16 so como referencia tatica.

9. **Ranking entre setores.** \`linhas.sort\` por margem global mistura zaga (1 indicador, teto
   0,185) com ataque (8 indicadores). Ordene dentro de setor, ou publique a margem normalizada
   pelo teto do setor com o teto impresso ao lado.

O QUE **NAO** PRECISA MEXER, porque o conferente refez e bate numero a numero: o funil inteiro
(40.059 -> 10.984 -> 4.333 -> 2.728 -> 603), dez/26 3.950 de 4.333 = 91,2%, a cobertura nas 15
ligas, as 6 ligas sem fisico, o pool por liga e por posicao, os 27 homonimos descartados, TODOS
os alvos por setor recalculados do skillcorner.db, as 603 notas fisicas (zero divergencia), o
casamento com kpis.json 599/603, as contagens do backtest e a regua de valor de 2025.` },
]

let anterior = null
const correcoes = []
for (const b of BLOCOS) {
  const r = await agent(`${CASA}

VOCE CORRIGE UM BLOCO de \`${RAIZ}/gerar_prototipo.py\`. Os outros blocos sao de outros agentes,
que ja passaram ou vao passar — por isso voce mexe SO na sua regiao do arquivo.
${anterior ? `\nO bloco anterior ja foi aplicado. O que ele mudou:\n${JSON.stringify(anterior, null, 1).slice(0, 12000)}\n` : ''}
${b.p}

COMO TRABALHAR:
1. Leia o \`_fonte/prototipo/CONFERENCIA.md\` inteiro, depois a sua regiao do
   \`gerar_prototipo.py\`, depois a secao correspondente da ESPECIFICACAO.
2. Aplique as correcoes. **Confira com \`python3 -m py_compile gerar_prototipo.py\` ao fim.**
   NAO RODE o gerador inteiro — outro agente faz isso depois de todos os blocos.
3. Para toda correcao que voce NAO conseguir aplicar, diga por que em "nao_aplicadas". Deixar
   de fora com motivo escrito e melhor que aplicar mal.
4. Liste em "numeros_que_vao_mudar" o que voce espera que mude no JSON, e por que. O conferente
   final vai usar essa lista: numero que mudou e nao esta nela vira regressao.`,
    { label: 'corrige:' + b.k, phase: 'Corrigir', schema: OUT, effort: 'high' })
  if (r) { correcoes.push(r); anterior = r }
}

log(`Correcoes aplicadas: ${correcoes.reduce((a, c) => a + c.aplicadas.length, 0)}; nao aplicadas: ${correcoes.reduce((a, c) => a + c.nao_aplicadas.length, 0)}`)

phase('Rodar')

const rodada = await agent(`${CASA}

Os tres blocos de correcao ja foram aplicados ao \`gerar_prototipo.py\`:
${JSON.stringify(correcoes, null, 1).slice(0, 50000)}

TAREFA: rodar e conferir que nada quebrou fora do esperado.

1. **Guarde o JSON velho primeiro:**
   \`cp dados/prototipo.json /tmp/prototipo_antes.json\` (o de antes das correcoes).
2. \`python3 gerar_prototipo.py\` — ate o fim. Se quebrar, CONSERTE e rode de novo; um bloco
   pode ter deixado ponta solta que so aparece na execucao.
3. \`python3 gerar_prototipo_js.py\` — regenera \`static/prototipo.js\`.
4. **DIFF campo a campo** entre \`/tmp/prototipo_antes.json\` e o novo. Para cada campo que
   mudou, diga se a mudanca estava prevista na lista "numeros_que_vao_mudar" dos tres blocos.
   **Campo que mudou e nao estava previsto vai em "mudancas_inesperadas" — e e o achado mais
   importante do seu trabalho.**
5. **A ABA.** Ela le este JSON por \`static/prototipo.js\`. Confira que nenhum campo que a aba
   usa sumiu ou mudou de nome: extraia todo acesso \`PROTO.*\` de \`static/proto.js\`,
   \`proto_a.js\`, \`proto_b.js\` e \`proto_c.js\` e confira contra o JSON novo. Se algum sumiu,
   DIGA — nao conserte a aba, ela e de outro dono.
6. Suba o app numa porta livre (NAO use a 5090, tem servidor do dono vivo la), abra a aba
   Prototipo, e confirme que as 16 etapas ainda desenham sem erro de console. Derrube depois.`,
  { label: 'rodar', phase: 'Rodar', schema: RUN, effort: 'high' })

log(rodada && rodada.rodou
  ? `Gerador rodou: JSON ${rodada.json_kb} KB, ${rodada.mudancas_inesperadas.length} mudanca(s) inesperada(s), aba carrega=${rodada.aba_ainda_carrega}`
  : 'O gerador NAO rodou')

phase('Conferir')

const FINAIS = [
  { k: 'as-correcoes-pegaram', p: `AS CORRECOES PEGARAM? Percorra a lista das 23 correcoes do CONFERENCIA.md, uma a uma, e confira NO JSON NOVO que cada uma esta la. Os cinco porta_motivo pararam de mentir? A Porta A esta vedada para indicador sem porta temporal? O p_cobertura deixou de ser zero? O nulo da tipologia virou enumeracao exata e os p batem (G1 0,00206 · G2 0,15000 · G3 0,02143 · G4 0,00114)? A bateria limpa tem p_placebo e passou a False? Os campos d_liq2_* existem nas 160 linhas fisicas e o PSV-99 do top-5 agora NAO sobrevive (d~0,47 p~0,16)?` },
  { k: 'o-bug-de-sinal', p: `O BUG DE SINAL, e so ele — e a correcao que muda o produto. Recalcule a nota de encaixe das 586 por CAMINHO PROPRIO e confira contra o JSON novo. Quantas notas mudaram de fato? A lista de nomes por proposta mudou? Os que entraram agora fazem sentido contra os alvos por setor, ou a correcao inverteu o problema em vez de resolve-lo? Confira tambem que o backtest passou a usar a MESMA regra da etapa 13, e o que o d e o p do backtest viraram depois disso.` },
  { k: 'nao-houve-regressao', p: `NAO HOUVE REGRESSAO? Esta e a pergunta mais importante. A conferencia anterior bateu 5.567 comparacoes campo a campo na etapa_2 com ZERO divergencias, e conferiu a etapa_1 inteira, a etapa_3 e o funil da etapa_12 numero a numero. **Refaca essa conferencia no JSON NOVO** e ache o que mudou sem ter razao para mudar. Um numero que era certo e deixou de ser e pior que os 23 defeitos juntos.` },
]

const finais = (await parallel(FINAIS.map(f => () => agent(`${CASA}

As correcoes foram aplicadas e o gerador rodou de novo:
${JSON.stringify({ correcoes, rodada }, null, 1).slice(0, 60000)}

O JSON de ANTES das correcoes esta em \`/tmp/prototipo_antes.json\`, e o novo em
\`${RAIZ}/dados/prototipo.json\`. Voce tem os dois — use.

SEU BLOCO: ${f.p}

Recalcule por caminho proprio. Onde algo nao pegou ou regrediu, diga o campo, o valor de antes,
o de agora, e por que e regressao. Se estiver tudo certo, diga que esta — aprovar e legitimo.`,
  { label: 'confere-final:' + f.k, phase: 'Conferir', schema: CONF, effort: 'high' })))).filter(Boolean)

return { correcoes, rodada, finais }
