export const meta = {
  name: 'prototipo-dinheiro-e-linguagem',
  description: 'Poe a curva dos mais caros e o valor por setor na etapa 1, e reescreve a aba Prototipo inteira em portugues simples sem perder ressalva',
  phases: [
    { title: 'Dado', detail: 'curva top-k e valor por setor no gerador, re-rodado sem mexer no resto' },
    { title: 'Escrever', detail: 'quatro arquivos da aba, um dono cada, em linguagem simples' },
    { title: 'Ler', detail: 'um leitor leigo e um cetico de honestidade leem a aba pronta' },
    { title: 'Costurar', detail: 'aplica o que os dois acharam e confere na tela' },
  ],
}

const RAIZ = '/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz'

const PROIBIDO_GIT = `**PROIBIDO: git commit, git push, git add, git reset, git checkout de arquivo.** Nenhum
comando git que escreva. Um agente de uma rodada anterior commitou e empurrou para um
repositorio publico sem autorizacao; isso nao se repete. Ler com git (git show, git diff) pode.`

const CASA = `PROJETO Santa Cruz (${RAIZ}). App Flask; a aba "Prototipo" mostra o estudo da Serie B
(o que separa quem SOBE de quem fica no MEIO e de quem CAI) em 16 etapas, lendo
\`static/prototipo.js\` (const PROTO), que e gerado de \`dados/prototipo.json\` por
\`gerar_prototipo_js.py\`, que e gerado por \`gerar_prototipo.py\`.

Arquivos da aba: \`static/proto.js\` (casca, helpers pt*, tarja, controles, procedencia),
\`static/proto_a.js\` (etapas 0-4), \`static/proto_b.js\` (5-8), \`static/proto_c.js\` (9-15).
Contrato em \`static/proto_contrato.md\`.

REGRA QUE MANDA EM TUDO: o dado e a fonte, o texto e consequencia. Nenhum numero digitado em
string de tela. Onde o dado nao existe, a tela escreve a ausencia e o motivo.

${PROIBIDO_GIT}

NAO use as portas 5090 nem 5091 (servidores do dono). Suba o app com PORT=<porta livre>
python3 app.py quando precisar ver a tela, e derrube ao terminar.`

const ESTILO = `O PEDIDO DO DONO, literal: "achei a linguagem da aba prototipo muito tecnica. faca uma
revisao para deixa-la mais popular e simples".

PARA QUEM: diretor de futebol, treinador, conselheiro do clube. Gente que entende muito de
futebol e nada de estatistica. Nao e para o analista.

O ALVO E O TEXTO NA TELA — titulos, subtitulos, paragrafos, rotulos de coluna, legendas,
tooltips. Os COMENTARIOS do codigo continuam como estao (prosa da casa explicando o porque).

O VOCABULARIO JA ESTA PRONTO E E UM SO. Em \`static/proto.js\`, logo depois de \`ptAno\`, ha seis
funcoes escritas para esta revisao. **Use estas, nao invente outras palavras** — se a etapa 2
disser "solido" e a etapa 9 disser "provavel" para a mesma coisa, o leitor aprende que as
palavras nao querem dizer nada:
  - \`ptTamanho(d)\`  -> "grande" / "media" / "pequena" / "quase nenhuma"   (no lugar do d de Cohen)
  - \`ptAcaso(p)\`    -> "o acaso produziria isso em 3 de cada 100 tentativas" (no lugar do p)
  - \`ptSorte(p)\`    -> "dificilmente e sorte" / "no limite" / "pode ser sorte" (veredito curto)
  - \`ptJunto(rho)\`  -> "andam juntos com forca" / "andam em sentido contrario, pouco" ...
  - \`ptAcerto(auc)\` -> "acerta em 83 de cada 100 pares"                     (no lugar do AUC)
  - \`ptTecnico(html)\` -> o numero tecnico ao lado, menor e apagado, para quem quer conferir

A FORMA DE CADA BLOCO:
  1. Primeiro, a frase que uma pessoa diria em voz alta numa reuniao — montada do dado.
     Ex.: "Dos 16 que subiram, 12 estavam entre os 8 elencos mais caros do ano."
  2. Depois, o numero em forma simples (ptTamanho, ptAcaso, ptAcerto...).
  3. Por ultimo, o numero tecnico em \`ptTecnico(...)\` — ele NAO SOME, fica menor.

GLOSSARIO — troque na tela (em ptTecnico o termo tecnico pode ficar):
  d de Cohen -> "tamanho da diferenca" · p / p-valor -> ptAcaso ou ptSorte · AUC -> ptAcerto ·
  rho / correlacao -> ptJunto · posto / percentil dentro do ano -> "posicao no ranking daquele
  ano" · liquido de valor / residuo / residualizado -> "descontado o dinheiro" ou "comparando
  times de orcamento parecido" · segundo liquido -> "descontado o dinheiro e o tamanho do
  elenco" · Benjamini-Hochberg / BH / familia / correcao multipla -> "quando se testa muita
  coisa, alguma da certo por sorte; descontada essa sorte, sobram N" · nulo / permutacao /
  enumeracao / placebo / replicas -> "sorteio de comparacao" · split-half / confiabilidade ->
  "a medida da o mesmo resultado se medida duas vezes?" · LOSO / fora da amostra -> "testado
  num ano que a conta nao viu" · Jaccard / estabilidade -> "quantas vezes o grupo sai igual
  ao refazer a conta" · eta2 -> "quanto o grupo explica" · clube-temporada -> "temporada de um
  clube" · n -> "quantos times / jogos / atletas" · TIP / OTIP -> "com a bola / sem a bola" ·
  HSR -> "corrida em alta velocidade" · PSV-99 -> "velocidade maxima" · Porta A/B/C ->
  nomes que digam o que a porta significa · quartil -> "faixa de orcamento (a mais cara, a
  segunda...)".

TRES COISAS QUE NAO SE NEGOCIAM:
  1. **Simplificar nao e afirmar mais.** Onde o dado diz "pode ser sorte", a tela continua
     dizendo "pode ser sorte". Frase simples mais forte que o numero e mentira em portugues
     facil. Toda ressalva que existe hoje continua existindo — traduzida, nao cortada.
  2. **Nenhum numero digitado.** Toda frase com numero sai do PROTO na hora.
  3. **Frases curtas, voz ativa, sem sigla em titulo.** Titulo que ja e simples ("Isso se
     repete?") fica como esta.

Nao renomeie funcao nem mude o contrato. Nao remova as seis funcoes do vocabulario.`

const DADO = { type: 'object', properties: {
  rodou: { type: 'boolean' },
  campos_novos: { type: 'array', items: { type: 'string' } },
  outros_campos_que_mudaram: { type: 'array', items: { type: 'string' } },
  numeros_conferidos: { type: 'array', items: { type: 'string' } },
  prototipo_js_regerado: { type: 'boolean' },
  o_que_nao_consegui: { type: 'string' },
}, required: ['rodou', 'campos_novos', 'outros_campos_que_mudaram', 'numeros_conferidos',
  'prototipo_js_regerado', 'o_que_nao_consegui'] }

const ESCRITA = { type: 'object', properties: {
  arquivo: { type: 'string' },
  etapas_revisadas: { type: 'array', items: { type: 'string' } },
  antes_e_depois: { type: 'array', items: { type: 'object', properties: {
    antes: { type: 'string' }, depois: { type: 'string' },
  }, required: ['antes', 'depois'] } },
  ressalvas_mantidas: { type: 'integer' },
  jargao_que_ficou_e_por_que: { type: 'array', items: { type: 'string' } },
  node_check_passou: { type: 'boolean' },
  visto_na_tela: { type: 'boolean' },
  o_que_nao_consegui: { type: 'string' },
}, required: ['arquivo', 'etapas_revisadas', 'antes_e_depois', 'ressalvas_mantidas',
  'jargao_que_ficou_e_por_que', 'node_check_passou', 'visto_na_tela', 'o_que_nao_consegui'] }

const LEITURA = { type: 'object', properties: {
  lente: { type: 'string' },
  problemas: { type: 'array', items: { type: 'object', properties: {
    etapa: { type: 'string' }, arquivo: { type: 'string' },
    na_tela_hoje: { type: 'string' }, por_que_e_problema: { type: 'string' },
    como_deveria_ficar: { type: 'string' },
    gravidade: { type: 'string', enum: ['mente', 'ninguem_entende', 'da_para_melhorar'] },
  }, required: ['etapa', 'arquivo', 'na_tela_hoje', 'por_que_e_problema', 'como_deveria_ficar', 'gravidade'] } },
  contagem_de_jargao_na_tela: { type: 'integer' },
  veredito: { type: 'string', enum: ['aprovar', 'ajustar', 'refazer'] },
}, required: ['lente', 'problemas', 'contagem_de_jargao_na_tela', 'veredito'] }

const COSTURA = { type: 'object', properties: {
  aplicados: { type: 'integer' },
  nao_aplicados: { type: 'array', items: { type: 'string' } },
  node_check: { type: 'string' },
  etapas_desenham: { type: 'integer' },
  erros_de_console: { type: 'integer' },
  undefined_na_tela: { type: 'integer' },
  jargao_restante: { type: 'integer' },
  o_que_nao_consegui: { type: 'string' },
}, required: ['aplicados', 'nao_aplicados', 'node_check', 'etapas_desenham', 'erros_de_console',
  'undefined_na_tela', 'jargao_restante', 'o_que_nao_consegui'] }

const LISTA_JARGAO = `"p =", "p <", "d =", "Cohen", "ρ", "rho", "AUC", "BH", "Benjamini", "Hochberg", "nulo",
"percentil", "posto", "resíduo", "residual", "líquido", "split-half", "LOSO", "Jaccard", "eta²",
"quartil", "réplicas", "permutação", "enumeração", "placebo", "Mann-Whitney", "Welch",
"clube-temporada", "TIP", "OTIP", "HSR", "PSV-99", "Monte Carlo", "família de testes"`

// ------------------------------------------------------------------ o dado

phase('Dado')

const dado = await agent(`${CASA}

O dono olhou a etapa 1 (a linha de base do dinheiro) e pediu duas coisas:

  (a) "o que eu acharia interessante seria ver os times perto dos 4 mais caros, quantos
      subiram. meu palpite eh que dos 16, 14 ou mais estao entre os 8 mais caros"
  (b) "tem uma distribuicao do valor do elenco por posicao"

JA MEDI, por caminho proprio, com \`carregar_painel()\` do gerador e \`tm_valor_total\` (a mesma
coluna da etapa 1), nas 80 temporadas completas 2022-2025. **Reproduza, nao copie.**

(a) Posto de valor dentro do ano dos 16 que subiram:
    2022 Gremio 1 · Vasco 2 · Cruzeiro 3 · Bahia 4 | 2023 Atletico-GO 2 · Juventude 5 ·
    Vitoria 9 · Criciuma 12 | 2024 Santos 1 · Ceara 4 · Sport 6 · Mirassol 9 |
    2025 Athletico-PR 1 · Remo 3 · Coritiba 4 · Chapecoense 18.
    Acumulado no top-k: k=4 -> 10 · k=6 -> 12 · k=8 -> 12 · k=9 -> 14 · k=12 -> 15 · k=18 -> 16.
    **O palpite (14+ no top 8) nao se confirma: sao 12. Os 14 so aparecem no top 9.**
    Ao acaso o esperado no top 8 e 6,4; P(>=12) exata = 2,27e-03 (hipergeometrica por ano,
    4 promovidos em 20, convoluida nos 4 anos).

(b) As colunas \`val_goleiro\`, \`val_defesa\`, \`val_meio\`, \`val_ataque\` somam EXATAMENTE
    \`tm_valor_total\` (razao 1,000, rho 1,000) — sao Transfermarkt por temporada, a fonte
    certa. Nenhum NaN nas 80.
    Euro mediano (mi): sobe 0,92 / 7,88 / 5,82 / 7,22 · meio 0,55 / 3,86 / 4,65 / 4,75 ·
    cai 0,32 / 2,52 / 2,82 / 3,28  (gol / def / meio / ataque).
    % do elenco (mediana): sobe 4,8 / 33,9 / 28,6 / 30,6 · meio 4,0 / 27,4 / 31,3 / 34,8 ·
    cai 3,0 / 27,6 / 34,5 / 32,7.
    Posto no ano, AUC sobe x resto: goleiro 0,638 · DEFESA 0,844 · meio 0,748 · ataque 0,777 ·
    total 0,828. Mann-Whitney sobe x meio: goleiro 0,241 · defesa 0,0001 · meio 0,013 ·
    ataque 0,0034.
    A PARTICAO (% do elenco, com o total fixo), sobe x meio: % na defesa 66,9 x 49,2 de posto,
    p 0,036; goleiro 0,83; meio 0,41; ataque 0,14.

TAREFA: acrescentar a \`etapa_1\` do \`${RAIZ}/gerar_prototipo.py\` dois blocos, re-rodar, e
provar que NADA MAIS mudou.

1. \`etapa_1.curva_top_k\`: para k = 1..20, quantos dos 16 estavam no top-k (no k e
   acumulado), o esperado ao acaso, a taxa de subida dentro do top-k, e o P exato de >=
   aquele acumulado (hipergeometrica por ano convoluida). Mais \`promovidos\`: a lista dos 16
   com ano, clube, posto e valor. Mais \`palpite_do_dono\`: {k: 8, afirmado: ">= 14",
   medido, confirma: bool, menor_k_com_14} — gravado como pergunta que o dado responde.
   E um aviso MEDIDO de amostra: os postos 7 e 8 tem zero promovidos e o 9 tem dois — o
   degrau entre k=8 e k=9 e de 2 times em 4 anos, e a tela nao pode ler isso como fronteira.
   Grave quantos promovidos ha em cada posto para que isso fique visivel.

2. \`etapa_1.valor_por_setor\`: por setor (goleiro, defesa, meio, ataque) e total: euro
   mediano por faixa, % mediano do elenco por faixa, posicao media no ranking do ano por
   faixa, AUC sobe x resto, p sobe x meio e sobe x cai. E o bloco da PARTICAO (o % com total
   fixo) com os 4 p E o BH dos 4 — com 4 testes o p 0,036 da defesa nao se sustenta sozinho,
   e o bloco tem de dizer isso em numero.
   **E a comparacao que um leitor vai querer fazer e que NAO se pode afirmar de graca:** o
   AUC da defesa (0,844) e maior que o do total (0,828)? E o melhor de 4 setores escolhido
   depois de olhar. Grave a diferenca com intervalo por bootstrap pareado (reamostrando
   temporadas de clube dentro do ano) usando um gerador PROPRIO,
   \`np.random.default_rng([SEMENTE, 11])\`, para nao deslocar o sorteio das etapas
   seguintes. Se o intervalo cruza zero, o campo diz que nao da para afirmar.

3. Nenhuma das duas contas pode usar o gerador global de numeros aleatorios.

4. Guarde o JSON atual: \`cp dados/prototipo.json /tmp/prototipo_antes_setor.json\`. Rode
   \`python3 gerar_prototipo.py\`. Faca o DIFF campo a campo: **o unico que pode mudar e
   \`etapa_1\` ganhar as duas chaves novas** (e \`gerado_em\`). Se qualquer outro campo mudar,
   descubra por que e conserte antes de entregar.

5. Rode \`python3 gerar_prototipo_js.py\` para regerar \`static/prototipo.js\`.

Documente no codigo no tom da casa (comentario em prosa dizendo POR QUE, como o resto do arquivo).`,
  { label: 'dado:etapa-1', phase: 'Dado', schema: DADO, effort: 'high' })

log(dado && dado.rodou ? `Etapa 1 com curva e setores; ${dado.outros_campos_que_mudaram.length} outro(s) campo(s) mudaram` : 'O gerador NAO rodou — a etapa 1 vai sair sem os blocos novos')

// ------------------------------------------------------------------ escrever

const DONOS = [
  { f: 'proto.js', p: `A CASCA: a tarja do topo, o bloco da procedencia, os TRES CONTROLES (baseline do
dinheiro, coluna liquida, contrafactual), o sumario lateral, o cabecalho da aba ("Dezesseis
etapas, e o que cada uma reprovou") e os rotulos das 16 etapas no sumario.
Voce tambem e o dono de \`static/style.css\` nesta rodada: se algum dos outros tres precisar
de classe nova, eles usam estilo inline — voce nao recebe pedido deles.
Os controles aparecem em todas as etapas, entao sao o texto mais lido da aba: capriche. O
"Controle 2 — a coluna liquida" em particular precisa virar algo como "descontado o
dinheiro: o que sobra quando se compara time de orcamento parecido".` },
  { f: 'proto_b.js', p: `ETAPAS 5 a 8: os pilares time a time, "isso se repete?", a porta temporal, o
cemiterio dos padroes e a tipologia dos que subiram. A etapa 8 e a mais tecnica da aba (dois
sorteios de comparacao, Jaccard, eta2, enumeracao exata) — e tambem a que mais precisa da
ressalva intacta: a tipologia vale porque foi testada fora da construcao, e o G2 e so
descritivo. Diga isso em portugues de reuniao.` },
  { f: 'proto_c.js', p: `ETAPAS 9 a 15: as reguas, causa ou consequencia, o teste da mala, o funil dos
livres, a nota de encaixe, o elenco como faixa e o card do treinador. Aqui mora o que vira
DECISAO de contratacao — nota de encaixe e elenco proposto. E o lugar onde simplificar pode
fazer mais estrago: um "o melhor lateral disponivel" onde o dado diz "88 empatados no teto"
e mentira cara. O empate, o backtest que nao separa (p 0,6), as restricoes NAO implementadas
e as vagas sem nome continuam na tela — em linguagem simples.` },
]

const escritaBC = parallel(DONOS.map(o => () => agent(`${CASA}

${ESTILO}

VOCE E DONO DE \`${RAIZ}/static/${o.f}\`${o.f === 'proto.js' ? ' e de `static/style.css`' : ''} e so dele.
Tres outros agentes reescrevem os outros arquivos agora, em paralelo.

SEU ESCOPO: ${o.p}

Ao terminar: \`node --check\`, e abra a aba no navegador para ler o que voce escreveu como o
diretor leria. Em "antes_e_depois", de 8 a 12 exemplos reais do que mudou — os mais
representativos, nao os mais faceis.`,
  { label: 'escreve:' + o.f, phase: 'Escrever', schema: ESCRITA, effort: 'high' })))

const escritaA = agent(`${CASA}

${ESTILO}

VOCE E DONO DE \`${RAIZ}/static/proto_a.js\` e so dele — ETAPAS 0 a 4: o que esta sendo medido,
a linha de base do dinheiro, o catalogo dos indicadores, o aviso do sorteio e a confiabilidade.
Tres outros agentes reescrevem os outros arquivos agora, em paralelo.

**ALEM DA LINGUAGEM, VOCE PUXA PARA A TELA DOIS BLOCOS NOVOS DA ETAPA 1**, que o gerador
acabou de gravar. O que o agente do dado relatou:
${JSON.stringify(dado, null, 1).slice(0, 12000)}

(1) \`PROTO.etapa_1.curva_top_k\` — o dono perguntou "dos 16, quantos estavam entre os mais
    caros?" e deu um palpite: 14 ou mais entre os 8 mais caros. Desenhe a curva k = 1..20
    (acumulado de promovidos contra o esperado ao acaso), com o top 4 e o top 8 marcados, e a
    lista dos 16 com o posto de valor de cada um. **Responda o palpite em voz alta, montado do
    \`palpite_do_dono\`** — algo como "O palpite era 14 ou mais entre os 8 mais caros. Foram 12.
    Os 14 so aparecem entre os 9." — e escreva junto o aviso de amostra do degrau 8->9 (dois
    times em quatro anos nao sao fronteira). Nao desenhe o palpite como erro do dono: ele
    acertou a forma (o dinheiro concentra quase tudo) e errou por dois times.
(2) \`PROTO.etapa_1.valor_por_setor\` — "tem uma distribuicao do valor do elenco por posicao".
    Mostre, para sobe / meio / cai: quanto de euro vai em goleiro, defesa, meio e ataque, e
    que parte do elenco cada setor e. Depois, o que separa: o valor da DEFESA e o setor em que
    o dinheiro mais distingue quem sobe. **Mas a tela so pode dizer que a defesa bate o total
    se o intervalo gravado no JSON nao cruzar zero** — se cruzar, diga que as duas contas
    empatam dentro do que 80 temporadas deixam medir. E a particao (% do elenco na defesa)
    tem de vir com o desconto dos 4 testes que o bloco grava.

Se algum dos dois blocos nao existir no PROTO (o gerador pode ter falhado), desenhe a ausencia
com o motivo — nao quebre a etapa.

Ao terminar: \`node --check\`, e abra a aba para ler a etapa 1 como o diretor leria. Em
"antes_e_depois", de 8 a 12 exemplos reais.`,
  { label: 'escreve:proto_a.js', phase: 'Escrever', schema: ESCRITA, effort: 'high' })

const escritas = [await escritaA, ...(await escritaBC)].filter(Boolean)
log(`Escrita: ${escritas.map(e => e.arquivo.split('/').pop() + (e.node_check_passou ? '' : ' (node --check FALHOU)')).join(', ')}`)

// ------------------------------------------------------------------ ler

phase('Ler')

const LENTES = [
  { k: 'leitor-leigo', p: `VOCE E O DIRETOR DE FUTEBOL. Nunca estudou estatistica. Abra a aba e leia as 16
etapas de cima a baixo como quem vai decidir contratacao com isto. Liste cada lugar onde voce
travaria: palavra que nao entende, frase que precisa ler duas vezes, tabela cujo cabecalho nao
diz o que e, numero sem frase que diga o que ele quer dizer. Para cada um, escreva como deveria
ficar.
Depois, a CONTAGEM objetiva: no innerText da aba, FORA dos elementos \`.pt-tec\`, conte as
ocorrencias destes termos: ${LISTA_JARGAO}. O numero vai em "contagem_de_jargao_na_tela".` },
  { k: 'honestidade', p: `VOCE E O CETICO. Simplificar e onde uma aba honesta vira uma aba que mente em
portugues facil. Compare cada arquivo com a versao anterior (\`git show HEAD:static/proto.js\`,
e o mesmo para proto_a/b/c — pode ler com git, nao escrever) e cace:
  - RESSALVA QUE SUMIU: todo aviso que existia antes (pode ser sorte, amostra pequena, nao
    implementado, empatados, sem cobertura fisica, faixa provisoria, bruto sem desconto de
    dinheiro, G2 descritivo, 88 no teto...) tem de continuar na tela, traduzido.
  - FRASE MAIS FORTE QUE O NUMERO: "dificilmente e sorte" onde p >= alfa; "separa" onde o
    tamanho e "quase nenhuma"; "o melhor" dentro de empate; "a defesa decide" se o intervalo
    do AUC da defesa contra o total cruza zero; o palpite do dono tratado como confirmado.
  - NUMERO DIGITADO: literal numerico de medida em string de tela.
  - VOCABULARIO PARALELO: palavra inventada no lugar das seis funcoes (ptTamanho, ptAcaso,
    ptSorte, ptJunto, ptAcerto, ptTecnico).
Suba o app e confira na TELA, nao so no codigo. Gravidade "mente" para os tres primeiros.` },
]

const leituras = (await parallel(LENTES.map(l => () => agent(`${CASA}

${ESTILO}

A aba acabou de ser reescrita em linguagem simples por quatro agentes. O que eles relataram:
${JSON.stringify(escritas, null, 1).slice(0, 40000)}

SUA LENTE: ${l.p}`,
  { label: 'le:' + l.k, phase: 'Ler', schema: LEITURA, effort: 'high' })))).filter(Boolean)

// ------------------------------------------------------------------ costurar

phase('Costurar')

const costura = await agent(`${CASA}

${ESTILO}

A aba foi reescrita e lida por um leitor leigo e por um cetico. O que eles acharam:
${JSON.stringify(leituras, null, 1).slice(0, 60000)}

AGORA VOCE E DONO DOS QUATRO ARQUIVOS DA ABA E DO style.css — ninguem mais esta editando.

1. Aplique TODO problema de gravidade "mente" — sem excecao.
2. Aplique os "ninguem_entende".
3. Aplique os "da_para_melhorar" que forem baratos.
4. \`node --check\` nos quatro. Carregue os cinco (prototipo.js + os quatro) concatenados num
   script so e rode \`node --check\` de novo — redeclaracao entre arquivos so aparece assim.
5. Suba o app numa porta livre, abra a aba, clique as 16 etapas com um listener de erro, e
   conte: etapas que desenham, erros de console, "undefined"/"NaN"/"[object Object]" na tela,
   e jargao restante fora de \`.pt-tec\` (${LISTA_JARGAO}). Derrube o app ao terminar.`,
  { label: 'costura', phase: 'Costurar', schema: COSTURA, effort: 'high' })

return { dado, escritas, leituras, costura }
