/* ================= aba Protótipo — a casca =================

   Esta aba mostra a CONSTRUÇÃO, não só o fim: dezesseis etapas, da contagem da amostra
   até o elenco proposto, na ordem em que foram feitas. O dono pediu assim porque um número
   final sem o caminho não dá para auditar, e aqui quase tudo que foi testado não passou.

   A regra é a mesma da aba Série B: **o dado é a fonte, o texto é consequência.** Nada
   nesta aba é digitado: todo número sai do `PROTO`, que é cópia integral do
   `dados/prototipo.json`. Onde o dado não existe, a tela ESCREVE a ausência e o motivo —
   `ptFalta()` existe exatamente para isso, e um "—" pelado é considerado defeito.

   Este arquivo tem três responsabilidades e nenhuma a mais:
     1. montar o esqueleto (tarja de conferência, controles obrigatórios, sumário, os
        dezesseis lugares de etapa);
     2. chamar `ptEtapa0()`..`ptEtapa15()` — que moram em proto_a.js, proto_b.js e
        proto_c.js — e sobreviver quando alguma delas ainda não existir;
     3. oferecer os helpers compartilhados, para que três arquivos escritos por mãos
        diferentes não inventem três formatos de número diferentes.

   O contrato com esses três arquivos está em static/proto_contrato.md. Se algo aqui mudar
   de assinatura, muda lá junto — é o único documento que eles leem.

   Por que a tela não quebra quando falta uma etapa: os arquivos de etapa chegam depois
   desta casca e podem chegar quebrados. Uma aba que dá tela branca porque um dos quatro
   arquivos tem erro de sintaxe esconde o problema; esta aqui desenha o lugar da etapa
   que faltou, diz qual arquivo devia defini-la e lista as chaves do `PROTO` que estão
   esperando por ela. A ausência é informação, e vai para a tela como tal. */
'use strict';

/* A ordem, o nome e o dono de cada etapa. É daqui que saem o sumário, os cabeçalhos e o
   aviso de etapa faltante — os três lendo a mesma lista, para que não exista sumário
   apontando para etapa que não existe. Os títulos vêm da seção 10 da ESPECIFICACAO.md;
   nenhum deles carrega número, porque número em título seria número escrito à mão. */
const PT_ETAPAS = [
  [0,  'O que está sendo medido',          'quantos times entram no estudo, e o que dá para concluir com esse tanto', 'proto_a.js'],
  [1,  'Quanto o dinheiro já explica',     'antes de olhar o jogo: o valor do elenco, sozinho, já separa quem sobe?', 'proto_a.js'],
  [2,  'Tudo o que foi medido',            'um indicador por linha — clique no nome da coluna para ordenar', 'proto_a.js'],
  [3,  'Quanto disso pode ser sorte',      'quando se testa muita coisa, alguma dá certo por acaso: quantas sobram descontada essa sorte', 'proto_a.js'],
  [4,  'Dá para confiar na medida?',       'a medida dá o mesmo resultado se for medida duas vezes no mesmo ano?', 'proto_a.js'],
  [5,  'Cada time, cada ano',              'a posição de cada time no ranking daquele ano — e o aviso escrito onde falta dado de jogador', 'proto_b.js'],
  [6,  'Isso se repete?',                  'a posição no ranking de um ano contra a posição no ano seguinte', 'proto_b.js'],
  [7,  'Veio antes ou veio depois?',       'foi o que o time fez, ou é o que acontece com quem já está subindo?', 'proto_b.js'],
  [8,  'Os padrões que não pararam de pé', 'por que esta aba não separa os times em grupos — e o pouco que sobrou', 'proto_b.js'],
  [9,  'As réguas',                        'as medidas que resumem o jogo, e cada item com a sua própria chance de ser sorte', 'proto_c.js'],
  [10, 'Causa ou consequência',            'o que separa muito, mas é o próprio resultado dito de outro jeito: não contrate para isto', 'proto_c.js'],
  [11, 'O que o jogador leva na mala',     'o que o jogador leva quando muda de clube, e o que era do time anterior', 'proto_c.js'],
  [12, 'O funil dos jogadores livres',     'do arquivo inteiro até os jogadores que dá para avaliar, degrau por degrau', 'proto_c.js'],
  [13, 'A nota de encaixe',                'os três pedaços da nota, quanto dado físico cada jogador tem, e como a nota teria ido no passado', 'proto_c.js'],
  [14, 'O elenco como faixa',              'os nomes que mais aparecem quando a conta é refeita muitas vezes, e quanto o elenco custaria', 'proto_c.js'],
  [15, 'Treinador: o que não dá',          'por que não dá, o que se tentou medir no lugar e que coleta resolveria', 'proto_c.js'],
];

/* ---------------- helpers de número ----------------

   Todos os números da aba passam por aqui. Não é preciosismo: pt-BR usa vírgula decimal e
   ponto de milhar, e `toFixed` devolve o contrário dos dois. Uma tabela com metade dos
   números em cada convenção é uma tabela em que o leitor não confia.

   O sinal negativo é o MENOS tipográfico (U+2212), não o hífen: em fonte tabular o hífen
   fica curto demais e some na coluna de d de Cohen, que é justamente onde o sinal decide
   o que a linha diz. */
function ptNum(v, casas) {
  if (v === null || v === undefined || (typeof v === 'number' && !isFinite(v))) return '—';
  const n = Number(v);
  if (!isFinite(n)) return esc(String(v));
  const c = casas === undefined ? 2 : casas;
  return n.toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c })
    .replace('-', '−');
}
function ptInt(v) { return ptNum(v, 0); }
function ptPct(v, casas) {
  if (v === null || v === undefined) return '—';
  return ptNum(v, casas === undefined ? 1 : casas) + '%';
}
/* Valor de mercado em euro. A base guarda o número cheio; a tela mostra a ordem de
   grandeza, porque nenhuma decisão muda entre € 29,74 mi e € 29,8 mi — e o número cheio
   ainda vai no `title`, para quem quiser conferir. */
function ptEur(v) {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  const txt = Math.abs(n) >= 1e6 ? '€ ' + ptNum(n / 1e6, 1) + ' mi'
    : Math.abs(n) >= 1e3 ? '€ ' + ptNum(n / 1e3, 0) + ' mil'
    : '€ ' + ptNum(n, 0);
  return '<span title="' + esc(n.toLocaleString('pt-BR')) + ' €">' + txt + '</span>';
}
/* p-valor COM o rótulo, porque o rótulo muda com o valor: abaixo do menor valor que as
   réplicas conseguem distinguir não existe "p = 0", existe "p < 0,001". Escrever "p =
   0,000" seria afirmar certeza que 2.000 réplicas não dão. `ptPv` é a mesma coisa sem o
   "p", para célula de tabela cuja coluna já se chama p. */
function ptP(p) { return p === null || p === undefined ? '—' : (p < 0.001 ? 'p < 0,001' : 'p = ' + ptNum(p, 3)); }
function ptPv(p) { return p === null || p === undefined ? '—' : (p < 0.001 ? '< 0,001' : ptNum(p, 3)); }
/* d de Cohen SEMPRE com sinal explícito, inclusive o positivo: aqui o sinal é metade da
   informação (quem sobe tem mais ou tem menos disto?) e um "+" na frente evita que o
   leitor precise lembrar qual é o lado de referência. */
function ptD(d) {
  if (d === null || d === undefined) return '—';
  const n = Number(d);
  return (n > 0 ? '+' : '') + ptNum(n, 3);
}
/* Ano NUNCA passa por ptInt: o separador de milhar transforma 2025 em "2.025", que não é
   ano nenhum. Vale para `ano`, `assert_ano_max`, `ano_t`, `ano_t1` e para qualquer coisa
   que seja identificador numérico em vez de quantidade. */
function ptAno(v) { return v === null || v === undefined ? '—' : String(v); }

/* ---------------- o vocabulário simples ----------------

   O dono pediu a aba em português de quem não estudou estatística. A tentação é trocar cada
   termo técnico por uma palavra bonita em cada etapa — e aí a etapa 2 diz "sólido" para o que a
   etapa 9 chama de "provável", e o leitor aprende que as palavras não querem dizer nada. Por
   isso a tradução mora AQUI, uma vez só, e toda etapa usa estas funções. Os cortes abaixo não
   são medida deste estudo: são convenção de leitura, declarada num lugar onde se pode discordar
   dela. O número técnico nunca some — vai ao lado, menor, em ptTecnico(), para quem quer conferir.

   E a regra que não se negocia: simplificar não é afirmar mais. "Pode ser sorte" continua
   aparecendo onde o dado diz que pode ser sorte. */

/* Tamanho da diferença (d de Cohen), nas faixas usuais 0,2 · 0,5 · 0,8. */
const PT_FAIXAS_D = [[0.8, 'grande'], [0.5, 'média'], [0.2, 'pequena'], [0, 'quase nenhuma']];
function ptTamanho(d) {
  if (d === null || d === undefined || isNaN(Number(d))) return 'sem medida';
  const a = Math.abs(Number(d));
  return PT_FAIXAS_D.find(f => a >= f[0])[1];
}

/* O p-valor dito do jeito certo. A versão popular errada é "3% de chance de ser sorte" — o p
   não é isso. O que ele diz é: se não houvesse diferença nenhuma, o acaso produziria uma
   diferença deste tamanho em tantas de cada cem tentativas. É mais comprido e é verdade. */
function ptAcaso(p) {
  if (p === null || p === undefined || isNaN(Number(p))) return 'sem medida de acaso';
  const v = Number(p);
  if (v < 0.001) return 'o acaso quase nunca produziria isso (menos de 1 vez em 1.000)';
  if (v < 0.01) return 'o acaso produziria isso em menos de 1 de cada 100 tentativas';
  return 'o acaso produziria isso em ' + ptInt(Math.round(v * 100)) + ' de cada 100 tentativas';
}

/* O veredito curto sobre sorte, amarrado ao alfa do próprio estudo (etapa 0) e não a um 0,05
   digitado. "No limite" existe porque o leitor leigo lê 0,049 e 0,051 como coisas opostas. */
function ptSorte(p) {
  if (p === null || p === undefined || isNaN(Number(p))) return 'sem medida';
  const alfa = (((PROTO || {}).etapa_0 || {}).poder || {}).alfa || 0.05;
  const v = Number(p);
  return v < alfa ? 'dificilmente é sorte' : v < 2 * alfa ? 'no limite' : 'pode ser sorte';
}

/* Correlação (ρ) em palavras, com o sentido junto: "quando um sobe, o outro cai" é metade da
   informação e o sinal sozinho ninguém lê. */
function ptJunto(rho) {
  if (rho === null || rho === undefined || isNaN(Number(rho))) return 'sem medida';
  const v = Number(rho), a = Math.abs(v);
  const forca = a >= 0.5 ? 'com força' : a >= 0.3 ? 'de forma moderada' : a >= 0.1 ? 'pouco' : 'quase nada';
  if (a < 0.1) return 'não andam juntos';
  return (v > 0 ? 'andam juntos ' : 'andam em sentido contrário ') + forca;
}

/* AUC como pares: pegue um time que subiu e um que não subiu, ao acaso — em quantos de cada
   cem pares a medida põe o que subiu na frente? 50 é moeda; 100 é acerto sempre. É a leitura
   exata do AUC, não uma aproximação. */
function ptAcerto(auc) {
  if (auc === null || auc === undefined || isNaN(Number(auc))) return 'sem medida';
  return 'acerta em ' + ptInt(Math.round(Number(auc) * 100)) + ' de cada 100 pares';
}

/* O número técnico continua na tela, menor e apagado, para quem quer conferir. Esconder de vez
   seria trocar auditável por bonito — e esta aba existe para ser auditável. */
function ptTecnico(html) {
  return html ? '<span class="pt-tec">' + html + '</span>' : '';
}

/* ---------------- o nome de cada medida, um só para a aba inteira ----------------

   A revisão de linguagem achou a mesma medida com três nomes: "velocidade máxima" na etapa 6,
   "psv99" na 9 e na 11, "hsr distance" na 11 — e uma terceira língua no meio ("corrida em alta
   velocidade distance"). Por isso o nome popular mora AQUI, e as etapas 5 a 15 passam por
   ptNomeMedida / ptNomeIndicador. A chave crua nunca some: quem chama põe no `title`.

   A tradução é por pedaço, e na ordem: primeiro a chave inteira que tem nome próprio
   (`pts2t`, `aprovG6`), depois as expressões compostas do rastreamento físico (`sprint count`
   antes de `sprint`), por último as grafias sem acento do arquivo técnico. Pedaço que o mapa
   não conhece continua como veio — feio na tela, mas presente. */
const PT_MEDIDA_CHAVE = {
  pts2t: 'pontos no 2º turno', pts1t: 'pontos no 1º turno', pontos_casa: 'pontos em casa',
  pontos_fora: 'pontos fora de casa', gp_jogo: 'gols marcados por jogo', gc_jogo: 'gols sofridos por jogo',
  aprovG6: 'aproveitamento contra o G6', aprovZ6: 'aproveitamento contra o Z4-Z6',
  maxSemVencer: 'maior sequência sem vencer', maxVitorias: 'maior sequência de vitórias',
  golos_tec: 'gols marcados', golos_sem_penalti: 'gols sem contar pênalti', brancos: 'jogos sem marcar gol',
  xg_saldo: 'saldo de gols esperados (xG)', finalizacao: 'aproveitamento das finalizações',
  goleadas_pro: 'goleadas a favor', clean_sheets: 'jogos sem sofrer gol', cs: 'jogos sem sofrer gol',
  defesa_vs_xg: 'gols evitados pelo goleiro (contra o xG)', tm_valor_total: 'valor do elenco',
  tm_valor_mediana: 'valor do jogador típico do elenco', tm_altura: 'altura média',
  gk_def: 'defesas', gk_evi: 'gols evitados', gk_sai: 'saídas do gol', gk_pas: 'passe do goleiro',
  dist_remate: 'distância média do chute (m)', share_11: '% dos minutos no time-base mais usado',
  conc_hhi: 'concentração dos minutos em poucos jogadores', nucleo_300: 'jogadores com 300 minutos ou mais',
  atletas_usados: 'jogadores usados no ano', ppda: 'pressão (passes do adversário por desarme)',
  psv: 'velocidade máxima', psv5: 'velocidade máxima (média das 5 maiores)', hsr: 'distância em alta velocidade',
  hsr_n: 'corridas em alta velocidade', spr_n: 'número de piques', spr_km: 'distância em piques',
  dist: 'distância percorrida', mmin: 'metros por minuto', acel: 'acelerações fortes', desa: 'frenagens fortes',
  cod: 'mudanças de direção', hi: 'distância em alta intensidade', hi_n: 'ações de alta intensidade',
  expl: 'acelerações explosivas',
  sistemas_distintos: 'esquemas táticos diferentes usados', trocas: 'trocas de esquema tático',
  principal_pct: '% de jogos no esquema principal', linha3_pct: '% de jogos com três zagueiros',
  fidelidade_media: 'fidelidade ao esquema principal', linha3: 'jogos com três zagueiros',
  distintas: 'formações diferentes', formacoes: 'formações diferentes usadas',
};
const PT_MEDIDA_PEDACOS = [
  [/\bpsv99 top5\b/gi, 'velocidade máxima (média das 5 maiores)'],
  [/\bpsv99\b/gi, 'velocidade máxima'],
  [/\bexpl accel sprint\b/gi, 'arrancadas explosivas até o pique'],
  [/\bexpl accel hsr\b/gi, 'arrancadas explosivas até alta velocidade'],
  [/\bruns above hsr\b/gi, 'desmarques em alta velocidade'],
  [/\bruns penalty area\b/gi, 'desmarques para a área'],
  [/\bruns dangerous\b/gi, 'desmarques perigosos'],
  [/\bruns received\b/gi, 'desmarques que receberam a bola'],
  [/\bruns shot within 10s\b/gi, 'desmarques que viraram chute em 10 s'],
  [/\bruns\b/gi, 'desmarques'],
  [/\bsprint distance\b/gi, 'distância em piques'],
  [/\bsprint count\b/gi, 'número de piques'],
  [/\bhsr distance\b/gi, 'distância em alta velocidade'],
  [/\bhsr count\b/gi, 'corridas em alta velocidade'],
  [/\bhi distance\b/gi, 'distância em alta intensidade'],
  [/\bhi count\b/gi, 'ações de alta intensidade'],
  [/\brunning distance\b/gi, 'distância correndo'],
  [/\bdistance\b/gi, 'distância percorrida'],
  [/\bm per min\b/gi, 'metros por minuto'],
  [/\bhigh accel\b/gi, 'acelerações fortes'],
  [/\bhigh decel\b/gi, 'frenagens fortes'],
  [/\bmedium accel\b/gi, 'acelerações médias'],
  [/\bmedium decel\b/gi, 'frenagens médias'],
  [/\bcod count\b/gi, 'mudanças de direção'],
  [/\bp(\d+)otip\b/gi, 'a cada $1 min sem a bola'],
  [/\bp(\d+)tip\b/gi, 'a cada $1 min com a bola'],
  [/\botip\b/gi, 'sem a bola'],
  [/\btip\b/gi, 'com a bola'],
  [/\btop(\d+)\b/gi, '(média das $1 maiores)'],
  [/\bp(\d+)\b/gi, 'por $1 min'],
  [/\bhsr\b/gi, 'alta velocidade'],
  [/\bpsv\b/gi, 'velocidade máxima'],
  [/\/(\d+)$/, ' por $1 min'],
  [/\s(\d+)$/, ' por $1 min'],
  [/\bPPDA \(passes do adversario por acao defensiva\)/g, 'Pressão (passes do adversário por desarme)'],
  [/\bRemates a baliza\b/g, 'Chutes no gol'], [/\bRemates à baliza\b/g, 'Chutes no gol'],
  [/\bRemates\b/g, 'Chutes'], [/\bremates\b/g, 'chutes'], [/\bremate\b/g, 'chute'], [/\bRemate\b/g, 'Chute'],
  [/\bGolos\b/g, 'Gols'], [/\bgolos\b/g, 'gols'], [/\bexpectáveis\b/g, 'esperados'],
  [/\bDistancia\b/g, 'Distância'], [/\bmedia\b/g, 'média'], [/\bmedio\b/g, 'médio'], [/\bIdade media\b/g, 'Idade média'],
  [/\barea\b/g, 'área'], [/\bterco\b/g, 'terço'], [/\bRecuperacoes\b/g, 'Recuperações'], [/\bCartoes\b/g, 'Cartões'],
  [/\baereos\b/g, 'aéreos'], [/\bintercecoes\b/g, 'interceptações'], [/\bacoes\b/g, 'ações'], [/\bexito\b/g, 'êxito'],
  [/\baceleracoes\b/g, 'acelerações'], [/\bAceleracoes\b/g, 'Acelerações'], [/\bassistencias\b/g, 'assistências'],
  [/\bFormacoes\b/g, 'Formações'], [/\bformacao\b/g, 'formação'], [/\bConcentracao\b/g, 'Concentração'],
  [/\bajust a posse\b/g, 'ajustado à posse'], [/\bpasses chave\b/gi, 'passes-chave'],
  [/\bXI mais usado\b/g, 'time-base mais usado'],
  [/\bpor por\b/g, 'por'],
];
function ptNomeMedida(s) {
  if (s === null || s === undefined || s === '') return 'medida sem nome';
  const cru = String(s);
  if (Object.prototype.hasOwnProperty.call(PT_MEDIDA_CHAVE, cru)) return PT_MEDIDA_CHAVE[cru];
  let t = cru.replace(/\s*\((kpis|skillcorner)\.json\)\s*$/i, '').replace(/´/g, '')
    .replace(/^fis_/, '').replace(/^ti_/, '');
  if (Object.prototype.hasOwnProperty.call(PT_MEDIDA_CHAVE, t)) return PT_MEDIDA_CHAVE[t];
  t = t.replace(/_+/g, ' ').trim();
  PT_MEDIDA_PEDACOS.forEach(par => { t = t.replace(par[0], par[1]); });
  return t;
}
/* O nome de um indicador pela chave: o nome do catálogo da etapa 2 quando existe, traduzido;
   senão a própria chave, traduzida. Indicador de um setor (`ti_meio_…`, `fis_zaga_…`) leva o
   setor junto — "passes-chave" do meio-campo e do ataque não são a mesma medida. */
const PT_SETOR_NOME = { zaga: 'zaga', lateral: 'laterais', meio: 'meio-campo', ataque: 'ataque' };
function ptNomeIndicador(id) {
  const k = String(id === null || id === undefined ? '' : id);
  const linhas = (typeof PROTO !== 'undefined' && PROTO.etapa_2 && PROTO.etapa_2.linhas) || [];
  const l = linhas.find(x => x && x.indicador === k);
  const m = /^(?:ti|fis)_(zaga|lateral|meio|ataque)_(.+)$/.exec(k);
  const base = l && l.nome ? ptNomeMedida(l.nome) : ptNomeMedida(m ? m[2] : k);
  const setor = (l && l.setor) || (m ? m[1] : null);
  return setor && PT_SETOR_NOME[setor] ? base + ' (' + PT_SETOR_NOME[setor] + ')' : base;
}

/* As réguas da etapa 9 (e os olhares da etapa 8) chegam como chave sem acento: `F_solidez`.
   O nome em português mora aqui, uma vez; régua nova sem nome aparece pela chave legível. */
const PT_REGUAS = {
  posse_construcao: 'Posse e construção', pressao_ritmo: 'Pressão e ritmo', volume_fisico: 'Volume físico',
  explosao: 'Explosão', qualidade_chance: 'Qualidade da chance', solidez: 'Solidez defensiva',
  bola_aerea_parada: 'Bola aérea e bola parada', dinheiro: 'Dinheiro', estabilidade_11: 'Estabilidade do time-base',
};
function ptNomeRegua(k) {
  const s = String(k === null || k === undefined ? '' : k).replace(/^[A-Z]_/, '');
  return PT_REGUAS[s] || s.replace(/_+/g, ' ');
}

/* O selo de cada indicador da etapa 2 — e das portas da etapa 10 —, dito pelo que ele significa.
   Um só texto para as duas etapas. A porta A NÃO é "serve para contratar": o motivo gravado
   pelo estudo é "sobrevive ao dinheiro, se repete e prevê o 2º turno", e o único indicador com
   esse selo não sobra quando se desconta a sorte de testar muita coisa. */
const PT_PORTAS_TXT = {
  A: 'resiste ao dinheiro e se repete, mas ainda não está aprovado',
  B: 'separa, mas não se repete no ano seguinte',
  C: 'era só o dinheiro',
  D: 'é o placar contado de outro jeito',
};
function ptPortaTxt(letra) {
  return PT_PORTAS_TXT[letra] || null;
}

/* A ressalva do tamanho da própria régua do dinheiro. Estava escrita de dois jeitos (no topo e
   na etapa 1), e nenhum dizia o que ela significa na prática. Uma redação, lida do dado. */
function ptPoucaBase(auc) {
  const a = auc || {};
  if (a.eventos_por_parametro === undefined || a.eventos_por_parametro === null ||
      a.regra_pratica === undefined || a.regra_pratica === null) return '';
  const ev = ptNum(a.eventos_por_parametro, Number.isInteger(Number(a.eventos_por_parametro)) ? 0 : 1);
  return Number(a.eventos_por_parametro) < Number(a.regra_pratica)
    ? 'Até essa conta do dinheiro tem pouca base: o costume pede ' + ptInt(a.regra_pratica) +
      ' subidas para cada coisa que a conta leva em conta, e aqui há ' + ev + '. O número pode mudar com mais anos.' +
      ptTecnico('eventos por parâmetro')
    : 'A conta do dinheiro tem a base que o costume pede: ' + ev + ' subidas para cada coisa que ela leva em conta, ' +
      'contra ' + ptInt(a.regra_pratica) + ' pedidas.' + ptTecnico('eventos por parâmetro');
}
/* Concordância de número. "há 1 horas" é o tipo de erro que faz o leitor desconfiar do
   resto da tela, e ele nasce sempre do mesmo lugar: um rótulo fixo grudado num contador.
   O nome leva `Casca` de propósito — proto_a/b/c têm os seus próprios casos de plural e
   cada um resolve no seu arquivo; dois `function ptPlural` em scripts clássicos se
   sobrescrevem calados, e um helper de tela não pode depender da ordem dos <script>. */
function ptCascaConcorda(n, singular, plural) {
  if (n === null || n === undefined) return ptFalta('contagem ausente');
  return ptInt(n) + ' ' + (Math.abs(Number(n)) === 1 ? singular : plural);
}

/* O n nunca é enfeite: 16 clube-temporada e 603 candidatos aguentam frases diferentes.
   Por isso o rótulo carrega a UNIDADE junto — "n = 16" sozinho já enganou muita gente. */
function ptN(n, unidade) {
  if (n === null || n === undefined) return ptFalta('a quantidade não foi registrada no arquivo de dados');
  /* "clube-temporada" é jargão de planilha; na tela é "temporadas de clube". A troca mora aqui
     para que as três etapas que passam essa unidade digam a mesma coisa sem combinar entre si. */
  const u = unidade ? String(unidade)
    .replace(/^clube-temporada completos\b/, 'temporadas de clube completas')
    .replace(/^clube-temporada\b/, Math.abs(Number(n)) === 1 ? 'temporada de clube' : 'temporadas de clube') : '';
  return '<span class="pt-n" title="quantidade">' + ptInt(n) + (u ? ' ' + esc(u) : '') + '</span>';
}

/* ---------------- a ausência, escrita ----------------

   Buraco não vira zero e não vira traço mudo. `ptFalta` é inline (dentro de uma frase ou
   célula) e `ptFaltaBloco` ocupa o lugar de um bloco inteiro que não existe. Os dois
   exigem motivo: chamar sem motivo é erro de quem chamou, e a tela diz isso na cara. */
function ptFalta(motivo) {
  return '<span class="pt-falta" title="' + esc(motivo || '') + '">sem dado — ' +
    esc(motivo || 'MOTIVO NÃO INFORMADO POR QUEM CHAMOU ptFalta()') + '</span>';
}
function ptFaltaBloco(titulo, motivo) {
  return '<div class="pt-falta-bloco"><b>' + esc(titulo) + '</b><p>' +
    esc(motivo || 'MOTIVO NÃO INFORMADO POR QUEM CHAMOU ptFaltaBloco()') + '</p></div>';
}

/* ---------------- célula colorida por percentil ----------------

   A cor é o percentil DENTRO DO ANO, e o zero da escala é o percentil 50 — não o 0. Uma
   rampa que só cresce faz o meio da tabela parecer ruim; aqui o meio fica lavado e as duas
   pontas acendem em cores opostas, que é o que a matriz da etapa 5 precisa mostrar.

   `sinal` inverte o lado bom quando menos é melhor (PPDA, xG contra, tempo de 5-0-5). Sem
   isso a matriz pintaria de "alto" justamente quem pressiona menos. `sinal: 0` é o caso em
   que o próprio estudo não declarou direção — aí a cor continua sendo só percentil, e o
   `title` avisa que não há lado bom declarado. */
function ptCel(percentil, opts) {
  const o = opts || {};
  if (percentil === null || percentil === undefined) {
    const motivo = o.motivo || 'sem valor no JSON e sem motivo declarado';
    return '<td class="pt-cel pt-cel-vazio" title="' + esc(motivo) + '"><i>vazio</i><small>' +
      esc(motivo) + '</small></td>';
  }
  const p = Math.max(0, Math.min(100, Number(percentil)));
  const dist = Math.abs(p - 50) / 50;                       /* 0 no meio, 1 nas pontas */
  const alto = o.sinal === -1 ? p < 50 : p > 50;
  const forca = (dist * 0.62).toFixed(3);
  const dica = [
    o.bruto !== undefined && o.bruto !== null ? 'valor medido ' + ptNum(o.bruto, o.casas === undefined ? 3 : o.casas) : '',
    'posição no ranking daquele ano: ' + ptNum(p, 1) + ' (quanto maior, mais alto no ranking)',
    o.n !== undefined && o.n !== null ? 'base: ' + ptInt(o.n) + (o.unidade ? ' ' + o.unidade : '') : '',
    o.ano ? String(o.ano) : '',
    o.sinal === 0 ? 'o estudo não diz se ter mais disto é melhor ou pior' : '',
  ].filter(Boolean).join(' · ');
  return '<td class="pt-cel" title="' + esc(dica) + '"' +
    (o.dados ? ' data-pt="' + esc(o.dados) + '"' : '') + '>' +
    '<i class="pt-cel-fundo ' + (alto ? 'alto' : 'baixo') + '" style="opacity:' + forca + '"></i>' +
    '<span>' + (o.texto !== undefined ? o.texto : ptNum(p, 0)) + '</span></td>';
}

/* A legenda dos vazios de uma matriz. Numa matriz de 32 colunas não cabe o motivo dentro
   da célula — ele vai no `title` —, e `title` não é lido por quem só passa o olho. Então a
   matriz é obrigada a fechar com esta legenda: quantas células vazias, e por quê, cada
   motivo uma vez. É o que impede que um setor inteiro sem atleta rastreado passe por
   "sem novidade". */
function ptMotivos(motivos) {
  const conta = {};
  (motivos || []).forEach(m => { if (m) conta[m] = (conta[m] || 0) + 1; });
  const chaves = Object.keys(conta).sort((a, b) => conta[b] - conta[a]);
  if (!chaves.length) return '';
  return '<p class="pt-nota pt-motivos">' + chaves.map(m =>
    '<span><b>' + ptInt(conta[m]) + '</b> ' +
    (conta[m] === 1 ? 'célula vazia' : 'células vazias') + ' — ' + esc(m) + '</span>').join('') + '</p>';
}

/* ---------------- barra ----------------

   `max` vem de quem chama porque a escala é decisão de leitura, não do dado: na etapa 4 a
   barra vai de 0 a 1 (confiabilidade) e na etapa 11 de 0 a 1 também, mas por outro motivo.
   Deixar a barra se normalizar pelo maior valor da lista faria o pior indicador de uma
   lista curta parecer bom.

   `hachura` é o aviso visual de "abaixo do corte": na etapa 4, confiabilidade abaixo de
   0,40 significa que a medida mal concorda com ela mesma — e uma barra sólida ali mentiria
   por omissão. O corte é lido do JSON por quem chama; a hachura só desenha. */
function ptBarra(valor, max, opts) {
  const o = opts || {};
  if (valor === null || valor === undefined) {
    return '<div class="pt-barra-linha">' + (o.rot ? '<span class="pt-barra-rot">' + esc(o.rot) + '</span>' : '') +
      '<div class="pt-barra vazia">' + ptFalta(o.motivo || 'valor ausente') + '</div></div>';
  }
  const m = max || 1;
  const larg = Math.max(0, Math.min(100, Math.abs(Number(valor)) / m * 100));
  return '<div class="pt-barra-linha">' +
    (o.rot ? '<span class="pt-barra-rot" title="' + esc(o.dica || o.rot) + '">' + esc(o.rot) + '</span>' : '') +
    '<div class="pt-barra"><i class="' + (o.cor === 'baixo' ? 'baixo' : 'alto') +
      (o.hachura ? ' hachura' : '') + '" style="width:' + larg.toFixed(1) + '%"></i></div>' +
    '<b class="pt-barra-val">' + (o.texto !== undefined ? o.texto : ptNum(valor, 3)) + '</b>' +
    (o.extra ? '<span class="pt-barra-extra">' + o.extra + '</span>' : '') +
    '</div>';
}

/* ---------------- tabela ordenável ----------------

   Guardar as linhas num registro e redesenhar o `<tbody>` na hora do clique, em vez de
   remexer nos `<tr>` que já estão na tela: com 293 linhas na etapa 2, reordenar nós do DOM
   custa caro e, pior, perde qualquer célula que tenha sido montada por função (as de
   `fmt`). Redesenhar do dado é mais barato e não tem como divergir do dado.

   Nulo vai SEMPRE para o fim, nas duas direções. Ordenar por "d líquido" e receber no topo
   as linhas que não têm d líquido seria esconder as que têm. */
const PT_TABELAS = {};
function ptTabela(cfg) {
  PT_TABELAS[cfg.id] = {
    colunas: cfg.colunas,
    linhas: cfg.linhas || [],
    ordem: cfg.ordem || null,
    vazio: cfg.vazio || 'nenhuma linha — a tabela está vazia porque o dado está vazio, não por erro da tela',
  };
  return '<div class="pt-tab-rola"><table class="pt-tab' + (cfg.classe ? ' ' + esc(cfg.classe) : '') +
    '" id="' + esc(cfg.id) + '">' + ptTabCabeca(cfg.id) + ptTabCorpo(cfg.id) + '</table></div>';
}
function ptTabCabeca(id) {
  const t = PT_TABELAS[id];
  return '<thead><tr>' + t.colunas.map(c => {
    const on = t.ordem && t.ordem.col === c.k;
    return '<th data-col="' + esc(c.k) + '"' + (c.dica ? ' title="' + esc(c.dica) + '"' : '') +
      ' class="' + (c.tipo === 'texto' ? 'txt' : 'num') + (on ? ' on ' + t.ordem.dir : '') + '">' +
      esc(c.rot) + (on ? '<i>' + (t.ordem.dir === 'asc' ? '▲' : '▼') + '</i>' : '') + '</th>';
  }).join('') + '</tr></thead>';
}
function ptTabCorpo(id) {
  const t = PT_TABELAS[id];
  let linhas = t.linhas.slice();
  if (t.ordem) {
    const col = t.colunas.find(c => c.k === t.ordem.col) || { tipo: 'num' };
    const dir = t.ordem.dir === 'asc' ? 1 : -1;
    linhas.sort((a, b) => {
      const va = a[t.ordem.col], vb = b[t.ordem.col];
      const na = va === null || va === undefined || va === '';
      const nb = vb === null || vb === undefined || vb === '';
      if (na && nb) return 0;
      if (na) return 1;                 /* ausente sempre no fim, nas duas direções */
      if (nb) return -1;
      if (col.tipo === 'texto') return String(va).localeCompare(String(vb), 'pt-BR') * dir;
      return (Number(va) - Number(vb)) * dir;
    });
  }
  if (!linhas.length) {
    return '<tbody><tr><td class="pt-tab-vazio" colspan="' + t.colunas.length + '">' +
      esc(t.vazio) + '</td></tr></tbody>';
  }
  return '<tbody>' + linhas.map(l => '<tr' + (l._classe ? ' class="' + esc(l._classe) + '"' : '') +
    (l._dica ? ' title="' + esc(l._dica) + '"' : '') + '>' +
    t.colunas.map(c => {
      if (c.cel) return c.cel(l[c.k], l);            /* devolve o <td> inteiro (ex.: ptCel) */
      const v = l[c.k];
      const txt = c.fmt ? c.fmt(v, l)
        : (v === null || v === undefined) ? '—'
        : c.tipo === 'texto' ? esc(v) : ptNum(v, c.casas === undefined ? 2 : c.casas);
      const cls = (c.tipo === 'texto' ? 'txt' : 'num') + (c.classe ? ' ' + c.classe(v, l) : '');
      return '<td class="' + cls + '">' + txt + '</td>';
    }).join('') + '</tr>').join('') + '</tbody>';
}
/* Liga (ou religa) o clique de ordenação. Quem reescreve o próprio container — a etapa 6
   troca de indicador, a 5 troca de painel — chama isto de novo no fim, senão a tabela nova
   nasce muda. */
function ptLigarTabelas(raiz) {
  (raiz || document).querySelectorAll('table.pt-tab').forEach(tab => {
    const t = PT_TABELAS[tab.id];
    if (!t) return;
    tab.querySelectorAll('th[data-col]').forEach(th => {
      th.onclick = () => {
        const col = th.dataset.col;
        t.ordem = (t.ordem && t.ordem.col === col)
          ? { col: col, dir: t.ordem.dir === 'asc' ? 'desc' : 'asc' }
          : { col: col, dir: (t.colunas.find(c => c.k === col) || {}).tipo === 'texto' ? 'asc' : 'desc' };
        tab.innerHTML = ptTabCabeca(tab.id) + ptTabCorpo(tab.id);
        ptLigarTabelas(tab.parentElement);
      };
    });
  });
}

/* ---------------- card de etapa ----------------

   Um bloco dentro de uma etapa. O subtítulo não é enfeite: é onde mora a ressalva que
   costuma ser jogada no rodapé ("n=4", "não testável", "o físico do goleiro não existe").
   Aqui ela fica à altura dos olhos, junto do título do que está sendo afirmado. */
function ptCard(titulo, subtitulo, corpo, nota) {
  return '<section class="pt-card">' +
    '<div class="pt-card-cab"><h4>' + esc(titulo) + '</h4>' +
    (subtitulo ? '<span>' + subtitulo + '</span>' : '') + '</div>' +
    '<div class="pt-card-corpo">' + corpo + '</div>' +
    (nota ? '<p class="pt-nota">' + nota + '</p>' : '') + '</section>';
}

/* ================= os três controles obrigatórios (seção 11 da ESPECIFICACAO) =================

   Os três estão na tela, não no rodapé, e dois deles são componentes que as etapas chamam
   de dentro do próprio conteúdo. O motivo é o de sempre: nota de rodapé não é lida na hora
   da decisão, e a decisão aqui é "contrato ou não contrato". */

/* CONTROLE 1 — a baseline do dinheiro, ao lado de TODA proposta.

   `compara` é a proposta que está sendo defendida naquele ponto da tela. Quando ela não
   tem AUC fora da amostra — e uma proposta de elenco não tem —, o componente NÃO fica em
   branco: ele imprime o motivo. Uma proposta sem número comparável é uma informação sobre
   a proposta, não um espaço vazio no controle. */
function ptBaseline(compara) {
  const b = PROTO.controles_obrigatorios.baseline_de_dinheiro;
  const e1 = PROTO.etapa_1 || {};
  const auc = e1.auc_posto_de_valor || {};
  const c = compara || {};
  /* Quantos elencos mais caros contam como "top": sai do tamanho da lista por ano que o próprio
     gerador gravou (`etapa_1.top4_de_valor.por_ano[].top4`), não do 4 que está no nome da chave. */
  const t4 = e1.top4_de_valor || {};
  const topK = ((t4.por_ano || [])[0] || {}).top4;
  const kTop = Array.isArray(topK) ? topK.length : null;
  const temLoso = auc.loso_sobe_x_resto !== undefined && auc.loso_sobe_x_resto !== null;
  const alvo = c.auc !== null && c.auc !== undefined
    ? '<span class="pt-baseline-quem">' + esc(c.rotulo || 'esta proposta') + '</span>' +
      '<b>' + ptAcerto(c.auc) + '</b>' +
      '<span>' + (c.acertos !== undefined && c.acertos !== null
        ? 'na prática, acertou ' + ptInt(c.acertos) + ' de ' + ptInt(c.de) + ' ' : '') +
        ptTecnico('AUC ' + ptNum(c.auc, 3)) + '</span>'
    : '<span class="pt-baseline-quem">' + esc(c.rotulo || 'o que esta etapa propõe') + '</span>' +
      '<b class="pt-sem">não dá para pôr lado a lado</b><span>' +
      esc(c.motivo || 'quem chamou ptBaseline() não disse se esta proposta tem AUC fora da amostra') +
      '</span>';
  return '<div class="pt-baseline">' +
    '<span class="pt-rot">Controle 1 · quanto o dinheiro sozinho já acerta</span>' +
    '<p class="pt-baseline-frase">' +
      (b.acertos_top4 !== undefined && b.de !== undefined && kTop
        ? 'Dos <b>' + ptInt(b.de) + '</b> times que subiram, <b>' + ptInt(b.acertos_top4) + '</b> estavam entre os ' +
          ptInt(kTop) + ' elencos mais caros do seu ano' +
          (t4.esperado_por_acaso !== undefined && t4.esperado_por_acaso !== null
            ? ' — no chute, seriam uns ' + ptNum(t4.esperado_por_acaso, 1) : '') + '.'
        : 'Quantos dos que subiram estavam entre os elencos mais caros: ' +
          ptFalta('o arquivo de dados não traz a contagem por ano dos elencos mais caros')) +
    '</p>' +
    '<div class="pt-baseline-par">' +
      '<div class="pt-baseline-cel dinheiro">' +
        '<span class="pt-baseline-quem">só o valor do elenco</span>' +
        '<b>' + ptAcerto(b.auc) + '</b>' +
        '<span>Pegue ao acaso um time que subiu e um que não subiu, e aposte no elenco mais caro: é assim ' +
          'que se lê o número acima (no chute puro, acertaria metade dos pares).' +
          (temLoso ? ' Testado em cada ano sem que a conta tivesse visto aquele ano, ' +
            ptAcerto(auc.loso_sobe_x_resto) + '.' : '') +
          ' ' + ptTecnico('AUC ' + ptNum(b.auc, 3) + (temLoso ? ' · fora da amostra (LOSO) ' +
            ptNum(auc.loso_sobe_x_resto, 3) : '')) + '</span></div>' +
      '<div class="pt-baseline-cel">' + alvo + '</div>' +
    '</div>' +
    '<p class="pt-nota">A regra desta aba: medida, nota ou elenco que não acerte mais do que o dinheiro sozinho, ' +
      'testado num ano que a conta não viu, <b>descreve o passado, mas não serve para recomendar</b>.' +
      (ptPoucaBase(auc) ? ' ' + ptPoucaBase(auc) : '') + '</p>' +
    '</div>';
}

/* CONTROLE 2 — a coluna líquida em toda linha de indicador.

   Bruto é "quem subiu tinha mais disto"; líquido é "quem subiu tinha mais disto DEPOIS de
   descontar o valor do elenco". A diferença entre os dois é o assunto inteiro desta aba, e
   por isso os dois viajam sempre juntos, na mesma linha, nunca em colunas distantes. */
/* O corte que acende o "vive" é o α do estudo, lido de `etapa_0.poder.alfa` — o mesmo que
   proto_a, proto_b e proto_c usam para CONTAR sobreviventes. Estava digitado 0,05 aqui, e
   digitado é o pior lugar para ele estar: hoje o JSON também diz 0,05 e a tela não muda,
   mas no dia em que o estudo apertar o corte para 0,01 as contagens das etapas 3, 7 e 9
   passariam a falar de 1% enquanto estas 293 linhas continuariam acendendo a 5%. A tela
   contradiria a si mesma sem nenhum erro no console — que é justamente o defeito que esta
   aba existe para não ter. Sem α declarado nada acende: verde sem corte conhecido é
   afirmação sem régua, e o title diz por que a linha ficou apagada. */
function ptLiquidaAlfa() {
  const p = (typeof PROTO !== 'undefined' && PROTO.etapa_0 && PROTO.etapa_0.poder) || null;
  return p && p.alfa !== undefined && p.alfa !== null ? Number(p.alfa) : null;
}
function ptLiquida(x) {
  const alfa = ptLiquidaAlfa();
  const sobrevive = alfa !== null && x.p_liq !== null && x.p_liq !== undefined && x.p_liq < alfa;
  const dica = alfa === null
    ? 'O corte de sorte do estudo não está declarado no arquivo de dados — sem ele, nenhuma linha é marcada como de pé depois do desconto.'
    : 'Sem descontar: a comparação direta. Descontado o dinheiro: o que sobra quando se compara time de ' +
      'orçamento parecido. Em destaque: a diferença continua de pé depois do desconto e dificilmente é sorte.';
  /* tamanho + sentido + sorte, nesta ordem. O sentido vai junto porque "média" sozinha não diz
     se quem sobe tem mais ou menos disto — e é o sinal do d que decide a leitura da linha. */
  const lado = (d, p) => {
    const tam = ptTamanho(d);
    const sentido = d === null || d === undefined || isNaN(Number(d)) || tam === 'quase nenhuma' ? ''
      : Number(d) > 0 ? ', para mais' : ', para menos';
    return '<b>' + tam + sentido + '</b> <small>' + ptSorte(p) + '</small>';
  };
  return '<span class="pt-liq' + (sobrevive ? ' vive' : '') + '" title="' + esc(dica) + '">' +
    '<span class="pt-liq-par"><i>sem descontar</i> ' + lado(x.d_bruto, x.p_bruto) + '</span>' +
    '<em>→</em>' +
    '<span class="pt-liq-par"><i>descontado o dinheiro</i> ' + lado(x.d_liq, x.p_liq) + '</span>' +
    ptTecnico('d ' + ptD(x.d_bruto) + ' (' + ptP(x.p_bruto) + ') → ' + ptD(x.d_liq) + ' (' + ptP(x.p_liq) + ')') +
    '</span>';
}

/* CONTROLE 3 — o contrafactual do dinheiro ao pé de cada proposta de elenco.

   Lê o bloco `contrafactual` de uma proposta da etapa 14 como ele está. O número que
   importa é o último: a taxa histórica de subida do quartil de valor em que a proposta
   cai. Sem ele, "montamos um elenco" esconde "e ele custa o que custa quem não sobe". */
/* O posto mora numa chave que carrega o ano no próprio nome: `posto_de_valor_em_2025`.
   Ler pelo nome fixo quebra calado no dia em que o estudo andar um ano — a linha viraria
   "sem posto no JSON" num bloco que tem posto. Aqui a chave é achada pela forma, e o ano
   sai dela, que é o único lugar do bloco onde ele está escrito. */
function ptCfPosto(cf) {
  const k = Object.keys(cf).find(c => /^posto_de_valor_em_\d{4}$/.test(c));
  return { valor: k ? cf[k] : undefined, ano: k ? k.slice(-4) : null };
}
/* O quartil de valor dito como faixa de orçamento. Qual quartil é o caro NÃO é suposto pelo número
   (1 poderia ser o mais caro ou o mais barato, conforme quem ordenou): a ordem sai do valor
   mediano de cada quartil em `etapa_1.quartis`. Sem esse dado a tela diz que não sabe a ordem. */
const PT_ORDINAL_FEM = ['', 'segunda', 'terceira', 'quarta', 'quinta', 'sexta', 'sétima', 'oitava', 'nona'];
function ptCascaFaixa(q) {
  const qs = (((typeof PROTO !== 'undefined' && PROTO.etapa_1) || {}).quartis || [])
    .filter(x => x && x.valor_mediano_eur !== null && x.valor_mediano_eur !== undefined)
    .slice().sort((a, b) => b.valor_mediano_eur - a.valor_mediano_eur);
  const i = qs.findIndex(x => String(x.quartil) === String(q));
  if (i < 0) return 'faixa ' + ptInt(q) + ' ' + ptFalta('o arquivo de dados não diz qual faixa é a mais cara');
  if (i === 0) return 'a mais cara';
  if (i === qs.length - 1) return 'a mais barata';
  return 'a ' + (PT_ORDINAL_FEM[i] || ptInt(i + 1) + 'ª') + ' mais cara';
}
function ptContrafactual(cf) {
  if (!cf) return ptFaltaBloco('Quanto custa esta proposta',
    'esta proposta não trouxe no arquivo de dados a conta do dinheiro (bloco `contrafactual`)');
  const linha = (rot, valor, cls) => '<div class="pt-cf-l' + (cls ? ' ' + cls : '') +
    '"><span>' + rot + '</span><b>' + valor + '</b></div>';
  const po = ptCfPosto(cf);
  const temporada = 'Série B' + (po.ano ? ' ' + ptAno(po.ano) : '');
  const temDe = cf.de !== null && cf.de !== undefined;

  /* "21º de 20" é ordinal impossível, e era o que três das seis propostas imprimiam: o
     núcleo custa menos que o 20º colocado, e o gerador registra exatamente isso em
     `abaixo_de_todos`. Com a marca no dado, a tela escreve o que ela significa em vez de
     mostrar um posto que não existe na tabela. */
  let posto;
  if (cf.abaixo_de_todos === true) {
    posto = temDe
      ? 'mais barato que todos os ' + ptInt(cf.de) + ' elencos da ' + temporada
      : 'mais barato que todos os elencos da ' + temporada + ' — ' +
        ptFalta('o arquivo de dados não diz quantos elencos entram na comparação');
  } else if (po.valor === null || po.valor === undefined) {
    posto = ptFalta('a posição no ranking não está no arquivo de dados');
  } else {
    posto = ptInt(po.valor) + 'º mais caro de ' +
      (temDe ? ptInt(cf.de) : ptFalta('o total de elencos não está no arquivo de dados'));
  }

  /* A escala. "€ 1,6 mi" sozinho não diz se é muito ou pouco; ao lado do 1º, da mediana e
     do 20º da MESMA régua, diz. Os três já estavam no JSON e nunca chegavam à tela. O
     rótulo sai do nome da chave — `referencia_20o_eur` vira "20º" — para que nenhum
     ordinal seja digitado aqui, e para que referência nova apareça sozinha. */
  const refChaves = Object.keys(cf).filter(c => /^referencia_.+_eur$/.test(c));
  const refs = refChaves.length
    ? refChaves.map(c => {
        const cru = c.replace(/^referencia_/, '').replace(/_eur$/, '');
        /* "20º mais caro" é o mais barato dito do avesso: a ponta de baixo ganha o nome dela,
           reconhecida pelo total `de` do próprio bloco, não por um 20 escrito aqui */
        const ord = /^\d+o$/.test(cru) ? Number(cru.slice(0, -1)) : null;
        const rot = cru === 'mediana' ? 'o do meio'
          : ord === 1 ? 'o mais caro'
          : ord !== null && temDe && ord === Number(cf.de) ? 'o mais barato'
          : ord !== null ? 'o ' + ptInt(ord) + 'º' : cru.replace(/_/g, ' ');
        return '<span class="pt-cf-ref"><i>' + esc(rot) + '</i>' +
          (cf[c] === null || cf[c] === undefined ? ptFalta('valor ausente no arquivo de dados') : ptEur(cf[c])) +
          '</span>';
      }).join('')
    : ptFalta('o arquivo de dados não trouxe os elencos de referência — sem eles o valor do ' +
        'núcleo fica sem termo de comparação');
  const taxa = cf.taxa_historica_de_subida_do_quartil_pct;

  return '<div class="pt-cf">' +
    '<span class="pt-rot">Controle 3 · quanto custa, e quanto sobe quem custa isso</span>' +
    '<div class="pt-cf-grade">' +
      linha('quanto vale, somado, o núcleo proposto', cf.nucleo_valor_eur === null || cf.nucleo_valor_eur === undefined
        ? ptFalta('a soma não está no arquivo de dados') : ptEur(cf.nucleo_valor_eur)) +
      linha('para comparar, na ' + temporada, refs, 'pt-cf-regua') +
      linha('posição no ranking de valor', posto) +
      linha('faixa de orçamento', cf.quartil === null || cf.quartil === undefined
        ? ptFalta('a faixa não está no arquivo de dados') : ptCascaFaixa(cf.quartil)) +
      linha('dos times dessa faixa, quantos subiram',
        taxa === null || taxa === undefined
          ? ptFalta('a taxa não está no arquivo de dados')
          : '<span class="pt-cf-taxa">' + ptPct(taxa) + '</span>') +
    '</div>' +
    ((cf.atletas_sem_valor_de_mercado || cf.sem_faixa_salarial)
      ? '<p class="pt-nota">A soma está por baixo: <b>' + ptInt(cf.atletas_sem_valor_de_mercado) +
        '</b> dos <b>' + ptInt(cf.atletas_no_nucleo) + '</b> jogadores do núcleo não têm valor de mercado na base' +
        (cf.sem_faixa_salarial ? ', e <b>' + ptInt(cf.sem_faixa_salarial) + '</b> não têm faixa salarial' : '') +
        '. Quem fica sem preço costuma ser jogador pouco conhecido — a falta não é por acaso, e puxa o total para baixo.</p>'
      : '') +
    (cf.regua ? '<p class="pt-nota"><i>' + esc(cf.regua) + '</i></p>' : '') +
    '</div>';
}

/* ================= o esqueleto ================= */

/* A tarja de conferência. A conferência VOLTOU: o laudo está em
   `_fonte/prototipo/CONFERENCIA.md`. O recálculo por caminho independente bateu, e o que
   os céticos acharam foi bug de código, não número mal copiado — por isso a tarja continua
   no topo, mas dizendo outra coisa. O que ela diz sobre a conferência é prosa com a fonte
   citada (o laudo não é um campo do JSON); o que ela diz sobre o pipeline continua saindo
   do `gerado_em`, da semente e das réplicas, para ninguém ter de lembrar de atualizar
   texto quando o gerador rodar de novo. */
function ptTarja() {
  const g = PROTO.gerado_em;
  const d = new Date(String(g).replace(' ', 'T'));
  const valida = !isNaN(d.getTime());
  const quando = valida
    ? d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : esc(String(g));
  const horas = valida ? (Date.now() - d.getTime()) / 36e5 : null;
  /* singular tratado nos dois ramos: "há 1 horas" no alto da aba estraga a leitura de tudo
     o que vem depois, e o mesmo vale para o ramo dos dias */
  const desde = horas === null || horas < 0 ? ''
    : horas < 1 ? ' (há menos de uma hora)'
    : horas < 48 ? ' (há ' + ptCascaConcorda(Math.round(horas), 'hora', 'horas') + ')'
    : ' (há ' + ptCascaConcorda(Math.round(horas / 24), 'dia', 'dias') + ')';
  const r = PROTO.replicas || {};
  const co = PROTO.controles_obrigatorios || {};
  const reps = Object.keys(r).filter(k => typeof r[k] === 'number');
  /* O que esta tarja conta — a conferência e as correções — não é campo do JSON: não existe
     lugar no pipeline onde o resultado de uma auditoria se grave. Por isso é prosa, e por isso
     o caminho do laudo vai escrito dentro dela: para que cada afirmação daqui seja conferível
     em outro arquivo. O que é medida continua saindo do PROTO, no pé. */
  const nFis = (((PROTO.etapa_2 || {}).linhas) || [])
    .filter(l => l.d_liq2_SM !== null && l.d_liq2_SM !== undefined).length;
  const ctrl = ((PROTO.etapa_1 || {}).controle_n_atletas) || null;
  /* Sem números digitados: o que era "422 das 586" e "três céticos" vem do laudo, não do JSON,
     e virou palavra; a contagem exata continua no laudo, cujo caminho a tarja cita. */
  return '<div class="pt-tarja pt-tarja-ok">' +
    '<b>Estes números foram refeitos do zero por outras mãos, e os erros encontrados já foram corrigidos.</b>' +
    '<p>O programa que faz a conta rodou em <b>' + quando + '</b>' + desde +
      ptTecnico(esc(PROTO.gerado_por || 'gerar_prototipo.py')) +
      '. Revisores refizeram tudo sem usar esse programa: a lista de indicadores bateu item a item, ' +
      'sem nenhuma diferença, e as etapas 1 e 3 bateram número a número. O que eles acharam foram ' +
      '<b>erros no programa, não números copiados errado</b>: um sinal trocado na nota de encaixe (<b>etapa 13</b>) ' +
      'e um defeito no sorteio de comparação da <b>etapa 8</b>. Os dois foram corrigidos e a conta rodou de ' +
      'novo — o que está na tela já é o resultado corrigido. Tudo isso está no relatório da revisão.' +
      ptTecnico('_fonte/prototipo/CONFERENCIA.md') + '</p>' +
    '<p>Isso muda duas coisas para quem lê. A nota de encaixe mudou para a maior parte dos jogadores ' +
      '(a contagem exata está no relatório), e com ela mudaram os nomes que a <b>etapa 14</b> sugere: ' +
      '<b>a lista de antes estava errada</b>. E na <b>etapa 8</b> o sorteio de comparação deixou de ser sorteio: ' +
      'com tão poucos times, dá para testar todas as divisões possíveis, então a chance de ser sorte ali é ' +
      'calculada exata e não depende mais da sorte do sorteio.</p>' +
    (ctrl
      ? '<p>Os revisores acharam ainda uma coisa que ninguém estava descontando: <b>quem sobe usa menos ' +
        'jogadores</b>. Em média, quem subiu teve ' + ptNum(ctrl.media_sobe, 2) + ' jogadores com dado físico na ' +
        'temporada; quem caiu, ' + ptNum(ctrl.media_cai, 2) + ' — diferença ' + ptTamanho(ctrl.d_SC) + ', e ' +
        ptSorte(ctrl.p_SC) + ' ' + ptTecnico('d ' + ptD(ctrl.d_SC) + ' · ' + ptP(ctrl.p_SC)) + '. ' +
        'E isso não é o dinheiro disfarçado: número de jogadores e valor do elenco ' +
        ptJunto(ctrl.rho_posto_atletas_x_posto_valor) + ' ' +
        ptTecnico('ρ ' + ptNum(ctrl.rho_posto_atletas_x_posto_valor, 3) + ' · ' + ptP(ctrl.p_atletas_x_valor)) + '. ' +
        'Como os números físicos são médias por jogador, a lista de indicadores ganhou uma segunda coluna — ' +
        '<b>descontado o dinheiro e o tamanho do elenco</b> — em ' + ptInt(nFis) + ' linhas. ' +
        'A primeira, descontado só o dinheiro, já tinha sido conferida e ficou como estava, ao lado.</p>'
      : '') +
    '<p class="pt-tarja-pe">' +
      (co.assert_ano_max ? 'O programa para sozinho se alguma conta enxergar dado de depois de <b>' +
        ptAno(co.assert_ano_max) + '</b>' +
        (co.assert_filtro_competicao ? ', ou jogo que não seja da <b>' +
          esc(co.assert_filtro_competicao) + '</b>' : '') + '. ' : '') +
      ptTecnico('para refazer a conta e chegar no mesmo lugar: semente ' + ptInt(PROTO.semente) +
        (reps.length ? ' · réplicas: ' + reps.map(k => esc(k) + ' ' + ptInt(r[k])).join(', ') : '')) + '</p>' +
    '</div>';
}

/* ---------------- a procedência ----------------

   `PROTO.bases` é uma das 24 chaves do topo do JSON e carrega de onde vem TUDO que a aba
   afirma: qual arquivo, com quantas linhas, e sob qual filtro ou corte. A aba passou o dia
   inteiro sem ler essa chave — afirmava 293 indicadores e 16 clube-temporada sem dizer de
   qual painel saíram. Um número sem procedência não é auditável, e esta aba existe para ser
   auditada.

   O bloco é montado ITERANDO as chaves, nunca listando-as: base nova acrescentada ao
   gerador aparece aqui sozinha, e base removida some sozinha. As chaves conhecidas ganham
   nome legível (revisão de linguagem de 13/09); chave nova sem tradução aparece CRUA, e a
   crua vai sempre no `title` — o nome bonito nunca é condição para a linha aparecer.

   A ordem dentro da linha é arquivo → contagens → filtro/corte, porque é a ordem em que se
   confere: abro o arquivo, conto as linhas, checo sob que recorte elas foram contadas. */
function ptBaseVal(chave, valor) {
  if (valor === null || valor === undefined) return ptFalta('vazio no arquivo de dados, sem motivo declarado');
  if (typeof valor === 'boolean') return valor ? 'sim' : 'não';
  if (typeof valor === 'number') {
    /* ano é identificador, não quantidade: ptInt faria "2.025" de 2025. Mas o nome da chave
       sozinho não basta como teste — `atleta_temporada` vale 1.780 e é contagem, não ano.
       Só vira ano quando a chave fala de ano E o valor tem cara de ano. */
    const pareceAno = Number.isInteger(valor) && valor >= 1900 && valor <= 2100;
    const ehAno = /(^|_)(ano|anos|year)(_|$)/.test(chave) ||
      (pareceAno && /(ano|year|temporada|periodo|season)/.test(chave));
    return ehAno ? ptAno(valor) : ptInt(valor);
  }
  return esc(String(valor));
}
/* Achata um nível de aninhamento com a chave pontuada, caso o gerador passe a descrever uma
   base em sub-blocos. Sem isso a linha imprimiria "[object Object]", que é pior que nada. */
function ptBaseCampos(obj, prefixo) {
  const saida = [];
  Object.keys(obj || {}).forEach(k => {
    const v = obj[k], nome = (prefixo ? prefixo + '.' : '') + k;
    if (v && typeof v === 'object' && !Array.isArray(v)) saida.push.apply(saida, ptBaseCampos(v, nome));
    else saida.push([nome, Array.isArray(v) ? v.join(', ') : v]);
  });
  return saida;
}
function ptBases() {
  const b = (typeof PROTO !== 'undefined' && PROTO.bases) || null;
  if (!b || typeof b !== 'object' || !Object.keys(b).length) {
    return ptFaltaBloco('De onde vêm estes números',
      'o arquivo de dados não diz de onde vieram os números (chave `bases`). Sem isso a aba afirmaria ' +
      'sem dizer de qual planilha, com quantas linhas e com qual recorte — e a tela prefere dizer que não sabe.');
  }
  /* Nome legível para as chaves que existem hoje; chave nova, sem tradução, aparece crua — é o
     preço de a lista continuar se montando sozinha. A chave crua vai sempre no `title`. */
  const NOME_BASE = { painel: 'os times, temporada a temporada', jogos: 'os jogos', tecnico: 'os números técnicos',
    elencos: 'os elencos', skillcorner: 'o físico (SkillCorner)', mercado: 'o mercado de jogadores', kpis: 'os indicadores de jogador' };
  const NOME_CAMPO = { arquivo: 'arquivo', linhas: 'linhas', colunas: 'colunas', usadas: 'colunas usadas',
    filtro: 'recorte', corte: 'recorte', coluna_de_clube: 'coluna que diz o clube', periodo: 'período',
    jogadores: 'jogadores', kpis: 'indicadores', atleta_temporada: 'temporadas de jogador' };
  const nomeCampo = k => NOME_CAMPO[k] ||
    k.replace(/^linhas_serie_b_(\d{4})_(\d{4})$/, 'linhas da Série B, $1 a $2').replace(/_/g, ' ');
  const linhas = Object.keys(b).map(nome => {
    const campos = ptBaseCampos(b[nome]);
    const arq = campos.filter(c => /(^|\.)arquivo$/.test(c[0]));
    const contagens = campos.filter(c => arq.indexOf(c) < 0 && typeof c[1] === 'number');
    const resto = campos.filter(c => arq.indexOf(c) < 0 && contagens.indexOf(c) < 0);
    /* O rótulo e o valor iam colados ("linhas100"): o `<i>` tem margem só no CSS, e em cópia de
       texto a margem some. Os dois-pontos e o espaço vão no texto. Recorte no formato
       "min_tot >= 300" é dito em português; outro recorte vai como veio, em letra de código. */
    const valTxt = (c) => {
      const m = /^min_tot\s*>=\s*(\d+)$/.exec(String(c[1]));
      if (m) return 'jogadores com pelo menos ' + ptInt(Number(m[1])) + ' minutos' + ptTecnico(esc(c[1]));
      if (c[0] === 'coluna_de_clube') return ptTecnico(esc(c[1]));
      return ptBaseVal(c[0], c[1]);
    };
    const cel = (c, cls) => '<span' + (cls ? ' class="' + cls + '"' : '') + ' title="' + esc(c[0]) + '"><i>' +
      esc(nomeCampo(c[0])) + ':</i> ' + valTxt(c) + '</span>';
    return '<li><b title="' + esc(nome) + '">' + esc(NOME_BASE[nome] || nome.replace(/_/g, ' ')) + '</b>' +
      (arq.length
        ? arq.map(c => '<code>' + esc(String(c[1])) + '</code>').join('')
        : '<span class="txt"><i>arquivo:</i> ' + ptFalta('esta fonte não diz de qual arquivo veio') + '</span>') +
      contagens.map(c => cel(c)).join('') +
      resto.map(c => cel(c, 'txt')).join('') +
      '</li>';
  }).join('');
  /* Fechada por padrão: é o primeiro bloco depois da abertura, e quem vai decidir contratação
     travava aqui antes de chegar ao dinheiro. Quem vai conferir abre com um clique. */
  return '<details class="pt-bases">' +
    '<summary class="pt-rot" style="cursor:pointer">Para quem vai conferir: de onde vem cada número</summary>' +
    '<ul>' + linhas + '</ul>' +
    '<p class="pt-nota">Esta lista é lida direto do arquivo de dados, não escrita à mão: se uma fonte nova ' +
      'entrar no estudo, ela aparece aqui sozinha. Toda contagem da aba vem de uma destas linhas.</p>' +
    '</details>';
}

/* Os três controles no topo, antes de qualquer etapa. Aqui eles aparecem como declaração
   do método; dentro das etapas, `ptBaseline` e `ptContrafactual` reaparecem colados na
   afirmação que cada um controla. Repetir é de propósito. */
function ptControles() {
  const e1 = PROTO.etapa_1 || {};
  const cal = (e1.caliper || []).slice().sort((a, b) => b.caliper - a.caliper);
  const cob = e1.cobertura_do_valor || {};
  const taxas = (PROTO.etapa_14 || {}).taxa_de_subida_por_quartil_pct || {};
  /* da faixa mais cara para a mais barata — a ordem em que um diretor pergunta */
  const qInfo = {};
  (e1.quartis || []).forEach(q => { qInfo[String(q.quartil)] = q; });
  const quartis = Object.keys(taxas).sort((a, b) =>
    ((qInfo[b] || {}).valor_mediano_eur || 0) - ((qInfo[a] || {}).valor_mediano_eur || 0));
  /* a margem mais apertada primeiro: é a comparação mais exigente, e a que se lê primeiro */
  const calAsc = cal.slice().reverse();
  return '<div class="pt-controles">' +
    ptBaseline({ rotulo: 'aqui no topo', motivo: 'a comparação com o dinheiro aparece dentro de cada etapa, ao lado de cada proposta' }) +

    '<div class="pt-controle">' +
      '<span class="pt-rot">Controle 2 · descontado o dinheiro</span>' +
      '<p class="pt-controle-frase">Time mais caro tende a ter mais de quase tudo. Por isso nenhum indicador ' +
      'aparece nesta aba sozinho: ao lado dele vai sempre a mesma medida <b>descontado o dinheiro</b> — o que ' +
      'sobra quando se compara time de orçamento parecido. Se a diferença some no desconto, quem estava falando ' +
      'era o dinheiro.</p>' +
      (calAsc.length
        ? '<p class="pt-nota">Para conferir o desconto por outro caminho, cada time que subiu foi colocado lado a lado ' +
          'com times do mesmo ano e de valor de elenco parecido. ' +
          calAsc.map((c, i) => (i === 0 ? 'Com a margem mais apertada' : i === calAsc.length - 1 ? 'com a mais folgada' : 'com uma margem maior') +
            ', <b>' + ptInt(c.subidas_com_controle) + ' dos ' + ptInt(c.de) + '</b> acharam com quem ser comparados (' +
            ptNum(c.controles_medios, 1) + ' times em média) ' + ptTecnico('caliper ±' + ptNum(c.caliper, 2) + ' de posto')).join('; ') +
          '. <b>Só o que continua de pé nessa comparação entre iguais merece ir para a reunião.</b></p>'
        : '<p class="pt-nota"><b>Só o que continua de pé depois do desconto merece ir para a reunião.</b></p>') +
      (cob.pct_do_plantel_mediana !== undefined
        ? '<p class="pt-nota">Um cuidado com o próprio desconto: o valor de mercado não existe para todo jogador. ' +
          'O Transfermarkt dá preço a algo entre <b>' + ptPct(cob.pct_do_plantel_min) + '</b> e <b>' +
          ptPct(cob.pct_do_plantel_max) + '</b> do plantel, conforme a temporada (em metade das temporadas, mais de ' +
          ptPct(cob.pct_do_plantel_mediana) + ' — uns ' + ptInt(cob.tm_com_valor_mediana) + ' jogadores). E quem ' +
          'fica sem preço é o jogador pouco conhecido: quanto mais barato o elenco, menos jogadores com preço — ' +
          'cobertura e valor do elenco ' + ptJunto(cob.rho_cobertura_x_valor) + ', e ' + ptSorte(cob.p_cobertura_x_valor) +
          ' ' + ptTecnico('ρ ' + ptNum(cob.rho_cobertura_x_valor, 3) + ' · ' + ptP(cob.p_cobertura_x_valor)) +
          '. <b>Time pobre tem mais jogador sem preço.</b></p>'
        : '') +
    '</div>' +

    '<div class="pt-controle">' +
      '<span class="pt-rot">Controle 3 · quanto custa, e quanto sobe quem custa isso</span>' +
      '<p class="pt-controle-frase">Toda proposta de elenco vem com a conta do dinheiro ao pé: quanto valem os ' +
      'jogadores somados (e a folha, quando se sabe), em que <b>posição do ranking de valor da Série B</b> isso ' +
      'ficaria, e quantos times dessa faixa de orçamento subiram no passado.</p>' +
      (quartis.length
        ? '<ul class="pt-faixas">' + quartis.map(q => {
            const qi = qInfo[q];
            return '<li><span>' + ptCascaFaixa(q) + '</span><b>' + ptPct(taxas[q]) + '</b>' +
              (qi && qi.subiram !== undefined && qi.n !== undefined
                ? '<small>subiram ' + ptInt(qi.subiram) + ' de ' + ptInt(qi.n) + '</small>' : '') +
              '</li>';
          }).join('') + '</ul>'
        : '<p class="pt-nota">' + ptFalta('o arquivo de dados não traz a taxa de subida por faixa de orçamento') + '</p>') +
    '</div>' +
    '</div>';
}

function ptSumario() {
  return '<nav class="pt-sumario" id="ptSumario">' +
    '<span class="pt-rot">As etapas</span>' +
    PT_ETAPAS.map(e =>
      '<button data-etapa="' + e[0] + '"><i>' + e[0] + '</i><span>' + esc(e[1]) + '</span></button>'
    ).join('') + '</nav>';
}

/* O lugar de cada etapa nasce aqui, vazio e identificado. Quem preenche é a função dona —
   e se ela não existir, o lugar continua na tela com o aviso. */
function ptEsqueletoEtapa(e) {
  return '<section class="pt-etapa" id="ptEt-' + e[0] + '">' +
    '<div class="pt-etapa-cab">' +
      '<i class="pt-etapa-n">' + e[0] + '</i>' +
      '<div><h3>' + esc(e[1]) + '</h3><span>' + esc(e[2]) + '</span></div>' +
    '</div>' +
    '<div class="pt-etapa-corpo" id="ptEt-' + e[0] + '-corpo"></div>' +
  '</section>';
}

/* Chama a função dona da etapa dentro de um try: um erro em proto_c.js não pode apagar as
   etapas de proto_a.js. O que aparece no lugar é o erro, com nome de arquivo e função —
   quem estiver escrevendo aquele arquivo precisa ver o que quebrou, não uma tela branca. */
function ptPreencherEtapa(e) {
  const n = e[0], alvo = document.getElementById('ptEt-' + n + '-corpo');
  if (!alvo) return;
  const nome = 'ptEtapa' + n;
  const dados = PROTO['etapa_' + n];
  if (dados === undefined) {
    alvo.innerHTML = ptFaltaBloco('Etapa ' + n + ' não existe no dado',
      'o prototipo.json não traz a chave `etapa_' + n + '`. A tela não inventa: se a etapa foi ' +
      'planejada e o dado não veio, o buraco é do pipeline, e aparece aqui.');
    return;
  }
  /* `function ptEtapaN()` no topo de um script clássico vira propriedade do window; um
     `const ptEtapaN = ...` NÃO vira — fica no registro léxico global. O contrato pede a
     forma `function`, mas a casca não pode dar tela em branco por causa disso: se o nome
     não estiver no window, procura-se também no escopo léxico antes de desistir. */
  let fn = window[nome];
  if (typeof fn !== 'function') {
    try { fn = eval(nome); } catch (err) { fn = null; }
  }
  if (typeof fn !== 'function') {
    const chaves = Object.keys(dados).filter(k => k !== 'titulo_chave');
    alvo.innerHTML = '<div class="pt-espera">' +
      '<b>Esta etapa ainda não chegou.</b>' +
      '<p>O arquivo <code>static/' + esc(e[3]) + '</code> precisa definir <code>' + nome +
        '(alvo, dados)</code>. Enquanto não definir, o lugar fica reservado: a tela não esconde a etapa ' +
        'nem preenche com outra coisa.</p>' +
      '<p>O dado já está aqui — <code>PROTO.etapa_' + n + '</code> traz ' + ptInt(chaves.length) +
        ' chaves: <code>' + chaves.map(esc).join('</code>, <code>') + '</code>.</p>' +
      '</div>';
    return;
  }
  try {
    fn(alvo, dados);
  } catch (err) {
    alvo.innerHTML = '<div class="pt-erro">' +
      '<b>' + esc(nome) + '() quebrou no meio do desenho.</b>' +
      '<p>Em <code>static/' + esc(e[3]) + '</code>: <code>' + esc(String(err && err.message || err)) + '</code></p>' +
      '<p>O que está escrito acima desta linha pode estar pela metade. As outras etapas continuam de pé.</p>' +
      '</div>';
    /* o stack inteiro vai para o console: na tela cabe a mensagem, não o rastro */
    console.error('[prototipo] ' + nome + ' falhou', err);
  }
}

/* O sumário rola A CAIXA DA ABA, não a página — mesmo motivo do índice da aba Série B:
   `scrollIntoView` sobe todos os ancestrais roláveis, inclusive o documento, e leva embora
   a faixa do topo com o escudo e as abas, que não volta porque a roda está travada no
   body. Aqui a caixa que rola de verdade é encontrada e movida sozinha. */
function ptIrParaEtapa(n) {
  const sec = document.getElementById('ptEt-' + n);
  if (!sec) return;
  let caixa = sec.parentElement;
  while (caixa && caixa !== document.body) {
    const ov = getComputedStyle(caixa).overflowY;
    if (/(auto|scroll)/.test(ov) && caixa.scrollHeight > caixa.clientHeight) break;
    caixa = caixa.parentElement;
  }
  if (!caixa || caixa === document.body) { sec.scrollIntoView({ block: 'start' }); return; }
  const topo = sec.getBoundingClientRect().top - caixa.getBoundingClientRect().top;
  caixa.scrollTo({ top: caixa.scrollTop + topo - 12, behavior: 'smooth' });
}

function ptLigarSumario(alvo) {
  const botoes = Array.from(alvo.querySelectorAll('.pt-sumario button'));
  botoes.forEach(b => { b.onclick = () => ptIrParaEtapa(+b.dataset.etapa); });
  /* qual etapa está sendo lida agora: sem isso, dezesseis botões iguais não dizem onde a
     pessoa está no meio de uma rolagem longa */
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entradas => {
    entradas.forEach(en => {
      if (!en.isIntersecting) return;
      const n = en.target.id.replace('ptEt-', '');
      botoes.forEach(b => b.classList.toggle('on', b.dataset.etapa === n));
    });
  }, { rootMargin: '-10% 0px -75% 0px', threshold: 0 });
  PT_ETAPAS.forEach(e => {
    const sec = document.getElementById('ptEt-' + e[0]);
    if (sec) obs.observe(sec);
  });
}

function ptRender() {
  const alvo = $('#ptCorpo');
  if (!alvo) return;
  if (typeof PROTO === 'undefined') {
    alvo.innerHTML = ptFaltaBloco('A aba Protótipo não tem dado',
      'static/prototipo.js não carregou. Rode `python3 gerar_prototipo_js.py` e recarregue a página.');
    return;
  }
  const e0 = PROTO.etapa_0 || {};

  alvo.innerHTML =
    '<div class="pt-topo">' +
      '<span class="pt-rot">Protótipo · o caminho até a conclusão</span>' +
      '<h2 class="pt-h1">Passo a passo: o que foi testado, e o que não passou</h2>' +
      '<p class="pt-sub">' +
        (e0.linhas_completas !== undefined
          ? 'O estudo olha <b>' + ptInt(e0.linhas_completas) + '</b> temporadas completas de clubes da Série B — ' +
            ptInt(e0.sobe) + ' de quem subiu, ' + ptInt(e0.meio) + ' de quem ficou no meio e ' + ptInt(e0.cai) +
            ' de quem caiu — e <b>' + ptInt(e0.indicadores_pre_declarados) + '</b> indicadores escolhidos ' +
            '<b>antes</b> do primeiro teste, para ninguém escolher depois só o que deu certo. '
          : '') +
        'A maior parte não passou — e continua na tela, com o número que a reprovou ao lado. ' +
        'Os passos estão na ordem em que foram feitos, porque é assim que dá para conferir: cada um ' +
        'só usa o que o anterior deixou de pé.</p>' +
    '</div>' +

    ptTarja() +
    ptBases() +
    ptControles() +

    '<div class="pt-quadro">' +
      ptSumario() +
      '<div class="pt-trilha">' + PT_ETAPAS.map(ptEsqueletoEtapa).join('') + '</div>' +
    '</div>';

  PT_ETAPAS.forEach(ptPreencherEtapa);
  ptLigarTabelas(alvo);
  ptLigarSumario(alvo);
}
