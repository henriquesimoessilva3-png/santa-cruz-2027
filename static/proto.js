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
  [0,  'O que está sendo medido',          'o tamanho da amostra, e o que esse tamanho permite', 'proto_a.js'],
  [1,  'A linha de base do dinheiro',      'antes de qualquer pilar: o quanto o valor do elenco já explica', 'proto_a.js'],
  [2,  'O catálogo dos indicadores',       'um por linha, ordenável por qualquer coluna', 'proto_a.js'],
  [3,  'O aviso do sorteio, em número',    'quantos testes, quantos por acaso, quantos sobrevivem à correção', 'proto_a.js'],
  [4,  'Confiabilidade de cada medida',    'o que a própria medida repete dentro do mesmo ano', 'proto_a.js'],
  [5,  'Os pilares, time a time, ano a ano', 'matriz de percentis — e o vazio escrito onde falta atleta', 'proto_b.js'],
  [6,  'Isso se repete?',                  'o posto de um ano contra o posto do ano seguinte', 'proto_b.js'],
  [7,  'A porta temporal',                 'o que eles fizeram, ou o que aconteceu com quem estava subindo?', 'proto_b.js'],
  [8,  'O cemitério dos padrões',          'por que esta aba não tem grupos de times — e o que sobrou de tipologia', 'proto_b.js'],
  [9,  'As réguas',                        'os eixos de tela, e os itens crus com os seus próprios p', 'proto_c.js'],
  [10, 'Causa ou consequência',            'o que separa forte e é o resultado redescrito: não contrate para isto', 'proto_c.js'],
  [11, 'O teste da mala',                  'o que o atleta leva quando muda de clube, e o que era do time anterior', 'proto_c.js'],
  [12, 'O funil dos livres',               'do arquivo inteiro ao pool que dá para pontuar, degrau por degrau', 'proto_c.js'],
  [13, 'Nota de encaixe em três pedaços',  'os pesos, o sc_n ao lado do físico, e o backtest no cabeçalho', 'proto_c.js'],
  [14, 'Elenco como faixa',                'nomes por frequência nas réplicas, com o contrafactual do dinheiro ao pé', 'proto_c.js'],
  [15, 'Treinador: o que não dá',          'o motivo, os p do proxy de sistema e a coleta que resolveria', 'proto_c.js'],
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
  if (n === null || n === undefined) return ptFalta('n não registrado no JSON');
  return '<span class="pt-n">n = ' + ptInt(n) + (unidade ? ' ' + esc(unidade) : '') + '</span>';
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
    o.bruto !== undefined && o.bruto !== null ? 'bruto ' + ptNum(o.bruto, o.casas === undefined ? 3 : o.casas) : '',
    'percentil ' + ptNum(p, 1),
    o.n !== undefined && o.n !== null ? 'n = ' + ptInt(o.n) + (o.unidade ? ' ' + o.unidade : '') : '',
    o.ano ? String(o.ano) : '',
    o.sinal === 0 ? 'sem lado bom declarado' : '',
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
    vazio: cfg.vazio || 'nenhuma linha — e isto é o dado, não um erro de tela',
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
  const alvo = c.auc !== null && c.auc !== undefined
    ? '<b>' + ptNum(c.auc, 3) + '</b><span>AUC de ' + esc(c.rotulo || 'esta proposta') +
      (c.acertos !== undefined && c.acertos !== null
        ? ' · acerta ' + ptInt(c.acertos) + ' de ' + ptInt(c.de) : '') + '</span>'
    : '<b class="pt-sem">—</b><span>' +
      esc(c.motivo || 'quem chamou ptBaseline() não disse se esta proposta tem AUC fora da amostra') +
      '</span>';
  return '<div class="pt-baseline">' +
    '<span class="pt-rot">Controle 1 · a baseline do dinheiro</span>' +
    '<div class="pt-baseline-par">' +
      '<div class="pt-baseline-cel dinheiro"><b>' + ptNum(b.auc, 3) + '</b>' +
        '<span>AUC usando <b>só o posto de valor do elenco</b> · o top-4 de valor acerta ' +
        ptInt(b.acertos_top4) + ' de ' + ptInt(b.de) +
        ((auc.loso_sobe_x_resto !== undefined && auc.loso_sobe_x_resto !== null)
          ? ' · deixando um ano de fora, ' + ptNum(auc.loso_sobe_x_resto, 3) : '') + '</span></div>' +
      '<div class="pt-baseline-cel">' + alvo + '</div>' +
    '</div>' +
    '<p class="pt-nota">Qualquer eixo, índice ou elenco que não bata isso fora da amostra é ' +
      '<b>descrição, não recomendação</b>.' +
      ((auc.eventos_por_parametro !== undefined && auc.regra_pratica !== undefined)
        ? ' E a própria baseline é frágil: ' + ptNum(auc.eventos_por_parametro, 1) +
          ' eventos por parâmetro, contra os ' + ptInt(auc.regra_pratica) + ' da regra prática.'
        : '') + '</p>' +
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
    ? ' title="α não declarado em etapa_0.poder.alfa — sem corte do estudo nenhuma linha é marcada como sobrevivente"'
    : '';
  return '<span class="pt-liq' + (sobrevive ? ' vive' : '') + '"' + dica + '>' +
    '<i>bruto</i> ' + ptD(x.d_bruto) + ' <small>(' + ptP(x.p_bruto) + ')</small>' +
    '<em>→</em>' +
    '<i>líquido</i> ' + ptD(x.d_liq) + ' <small>(' + ptP(x.p_liq) + ')</small>' +
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
function ptContrafactual(cf) {
  if (!cf) return ptFaltaBloco('Contrafactual do dinheiro',
    'esta proposta não trouxe o bloco `contrafactual` no JSON');
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
      ? 'abaixo de todos os ' + ptInt(cf.de) + ' elencos da ' + temporada
      : 'abaixo de todos os elencos da ' + temporada + ' — ' +
        ptFalta('o JSON não diz quantos elencos entram na régua (chave `de`)');
  } else if (po.valor === null || po.valor === undefined) {
    posto = ptFalta('sem posto no JSON');
  } else {
    posto = ptInt(po.valor) + 'º de ' +
      (temDe ? ptInt(cf.de) : ptFalta('sem o total de elencos no JSON'));
  }

  /* A escala. "€ 1,6 mi" sozinho não diz se é muito ou pouco; ao lado do 1º, da mediana e
     do 20º da MESMA régua, diz. Os três já estavam no JSON e nunca chegavam à tela. O
     rótulo sai do nome da chave — `referencia_20o_eur` vira "20º" — para que nenhum
     ordinal seja digitado aqui, e para que referência nova apareça sozinha. */
  const refChaves = Object.keys(cf).filter(c => /^referencia_.+_eur$/.test(c));
  const refs = refChaves.length
    ? refChaves.map(c => {
        const rot = c.replace(/^referencia_/, '').replace(/_eur$/, '').replace(/^(\d+)o$/, '$1º');
        return '<span class="pt-cf-ref"><i>' + esc(rot) + '</i>' +
          (cf[c] === null || cf[c] === undefined ? ptFalta('sem valor no JSON') : ptEur(cf[c])) +
          '</span>';
      }).join('')
    : ptFalta('o JSON não trouxe nenhuma chave `referencia_*_eur` — sem elas o valor do ' +
        'núcleo fica sem escala nenhuma');

  return '<div class="pt-cf">' +
    '<span class="pt-rot">Controle 3 · o contrafactual do dinheiro</span>' +
    '<div class="pt-cf-grade">' +
      linha('valor somado do núcleo', cf.nucleo_valor_eur === null || cf.nucleo_valor_eur === undefined
        ? ptFalta('sem valor somado no JSON') : ptEur(cf.nucleo_valor_eur)) +
      linha('a mesma régua, na ' + temporada, refs, 'pt-cf-regua') +
      linha('posto de valor que ocuparia', posto) +
      linha('quartil em que cai', cf.quartil === null || cf.quartil === undefined
        ? ptFalta('sem quartil no JSON') : ptInt(cf.quartil) + 'º') +
      linha('taxa histórica de subida desse quartil',
        cf.taxa_historica_de_subida_do_quartil_pct === null || cf.taxa_historica_de_subida_do_quartil_pct === undefined
          ? ptFalta('sem taxa no JSON')
          : '<span class="pt-cf-taxa">' + ptPct(cf.taxa_historica_de_subida_do_quartil_pct) + '</span>') +
    '</div>' +
    ((cf.atletas_sem_valor_de_mercado || cf.sem_faixa_salarial)
      ? '<p class="pt-nota">A soma é por baixo: <b>' + ptInt(cf.atletas_sem_valor_de_mercado) +
        '</b> dos <b>' + ptInt(cf.atletas_no_nucleo) + '</b> atletas do núcleo não têm valor de mercado na base' +
        (cf.sem_faixa_salarial ? ' e <b>' + ptInt(cf.sem_faixa_salarial) + '</b> não têm faixa salarial' : '') +
        '. Quem não tem valor é jogador obscuro — a falta não é ao acaso, e empurra o total para baixo.</p>'
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
  return '<div class="pt-tarja pt-tarja-ok">' +
    '<b>Os números desta aba foram recalculados por caminho independente, e as correções já entraram.</b>' +
    '<p>Saíram de <code>' + esc(PROTO.gerado_por || 'gerar_prototipo.py') + '</code> em <b>' + quando + '</b>' + desde +
      '. Três céticos refizeram a conta sem usar o gerador: o catálogo bateu campo a campo, ' +
      'com zero divergências, e as etapas 1 e 3 fecharam número a número. O que eles acharam foi ' +
      '<b>bug de código, não número trocado</b> — um erro de sinal na nota de encaixe da <b>etapa 13</b> ' +
      'e um erro de permutação no nulo da <b>etapa 8</b>. Os dois foram corrigidos e o gerador rodou de ' +
      'novo: o que está na tela é o depois. O laudo está em ' +
      '<code>_fonte/prototipo/CONFERENCIA.md</code>.</p>' +
    '<p>Duas consequências que mudam o que se lê aqui. A nota de encaixe mudou em 422 das 586, e com ' +
      'ela os nomes que a <b>etapa 14</b> propõe — a lista de antes estava errada. E o nulo da ' +
      '<b>etapa 8</b> deixou de ser sorteio: com dezesseis, as partições cabem todas, então os p da ' +
      'tipologia são exatos e não dependem mais de semente.</p>' +
    (ctrl
      ? '<p>A refutação do físico achou um confundidor que ninguém controlava: <b>quem sobe usa menos ' +
        'gente</b>. A média de atletas rastreados vai de ' + ptNum(ctrl.media_sobe, 2) + ' em quem subiu a ' +
        ptNum(ctrl.media_cai, 2) + ' em quem caiu (' + ptP(ctrl.p_SC) + '), e ela não é dinheiro ' +
        'disfarçado — contra o valor do elenco o ρ dos postos é ' + ptNum(ctrl.rho_posto_atletas_x_posto_valor, 3) +
        ' (' + ptP(ctrl.p_atletas_x_valor) + '). Como toda média física é por atleta, o catálogo ganhou um ' +
        '<b>segundo líquido</b> — de valor <i>e</i> de número de atletas — em ' + ptInt(nFis) + ' linhas. ' +
        'O primeiro líquido, já conferido, ficou como estava, ao lado.</p>'
      : '') +
    '<p class="pt-tarja-pe">Semente <b>' + ptInt(PROTO.semente) + '</b>' +
      (reps.length ? ' · réplicas: ' + reps.map(k => esc(k) + ' ' + ptInt(r[k])).join(', ') : '') +
      (co.assert_ano_max ? ' · o pipeline quebra se alguma função enxergar ano acima de <b>' +
        ptAno(co.assert_ano_max) + '</b>' : '') +
      (co.assert_filtro_competicao ? ' ou se o jogo a jogo não estiver filtrado por <b>' +
        esc(co.assert_filtro_competicao) + '</b>' : '') + '.</p>' +
    '</div>';
}

/* ---------------- a procedência ----------------

   `PROTO.bases` é uma das 24 chaves do topo do JSON e carrega de onde vem TUDO que a aba
   afirma: qual arquivo, com quantas linhas, e sob qual filtro ou corte. A aba passou o dia
   inteiro sem ler essa chave — afirmava 293 indicadores e 16 clube-temporada sem dizer de
   qual painel saíram. Um número sem procedência não é auditável, e esta aba existe para ser
   auditada.

   O bloco é montado ITERANDO as chaves, nunca listando-as: base nova acrescentada ao
   gerador aparece aqui sozinha, e base removida some sozinha. É por isso que o rótulo de
   cada campo é a chave CRUA do JSON (`linhas_serie_b_2022_2025`, e não um nome bonito):
   nome bonito teria de ser escrito à mão, campo a campo, e no dia seguinte estaria velho.

   A ordem dentro da linha é arquivo → contagens → filtro/corte, porque é a ordem em que se
   confere: abro o arquivo, conto as linhas, checo sob que recorte elas foram contadas. */
function ptBaseVal(chave, valor) {
  if (valor === null || valor === undefined) return ptFalta('nulo no JSON, sem motivo declarado');
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
      'o prototipo.json não trouxe a chave `bases`. Sem ela a aba afirma sem dizer de qual ' +
      'arquivo, com quantas linhas e sob qual filtro — e a tela prefere dizer que não sabe.');
  }
  const linhas = Object.keys(b).map(nome => {
    const campos = ptBaseCampos(b[nome]);
    const arq = campos.filter(c => /(^|\.)arquivo$/.test(c[0]));
    const contagens = campos.filter(c => arq.indexOf(c) < 0 && typeof c[1] === 'number');
    const resto = campos.filter(c => arq.indexOf(c) < 0 && contagens.indexOf(c) < 0);
    const cel = (c, cls) => '<span' + (cls ? ' class="' + cls + '"' : '') + '><i>' + esc(c[0]) + '</i>' +
      ptBaseVal(c[0], c[1]) + '</span>';
    return '<li><b>' + esc(nome) + '</b>' +
      (arq.length
        ? arq.map(c => '<code>' + esc(String(c[1])) + '</code>').join('')
        : '<span class="txt"><i>arquivo</i>' + ptFalta('esta base não declara arquivo no JSON') + '</span>') +
      contagens.map(c => cel(c)).join('') +
      resto.map(c => cel(c, 'txt')).join('') +
      '</li>';
  }).join('');
  return '<div class="pt-bases">' +
    '<span class="pt-rot">A procedência · de onde vem cada número desta aba</span>' +
    '<ul>' + linhas + '</ul>' +
    '<p class="pt-nota">Lido de <code>PROTO.bases</code> chave a chave, não escrito aqui: base nova ' +
      'no gerador aparece nesta lista sozinha, com o nome de campo que o gerador deu a ela. ' +
      'Toda contagem da aba se refere a uma destas linhas.</p>' +
    '</div>';
}

/* Os três controles no topo, antes de qualquer etapa. Aqui eles aparecem como declaração
   do método; dentro das etapas, `ptBaseline` e `ptContrafactual` reaparecem colados na
   afirmação que cada um controla. Repetir é de propósito. */
function ptControles() {
  const e1 = PROTO.etapa_1 || {};
  const cal = (e1.caliper || []).slice().sort((a, b) => b.caliper - a.caliper);
  const cob = e1.cobertura_do_valor || {};
  const taxas = (PROTO.etapa_14 || {}).taxa_de_subida_por_quartil_pct || {};
  const quartis = Object.keys(taxas).sort();
  return '<div class="pt-controles">' +
    ptBaseline({ motivo: 'a comparação com o dinheiro é feita etapa a etapa, ao lado de cada afirmação' }) +

    '<div class="pt-controle">' +
      '<span class="pt-rot">Controle 2 · a coluna líquida, em toda linha</span>' +
      '<p class="pt-nota">Nenhum indicador aparece nesta aba só no bruto: ao lado vai sempre o mesmo ' +
      'indicador depois de descontado o posto de valor do elenco. ' +
      (cal.length
        ? 'E, porque descontar por regressão impõe linearidade, a checagem paralela é o pareamento por ' +
          'caliper: ' + cal.map(c => 'com ±' + ptNum(c.caliper, 2) + ' de posto, <b>' +
            ptInt(c.subidas_com_controle) + ' de ' + ptInt(c.de) + '</b> subidas acham controle do mesmo ano (' +
            ptNum(c.controles_medios, 1) + ' em média)').join('; ') + '. '
        : '') +
      '<b>O achado que sobrevive ao pareamento é o que se leva ao dono.</b></p>' +
      (cob.pct_do_plantel_mediana !== undefined
        ? '<p class="pt-nota">A cobertura do valor não é total nem sorteada: o Transfermarkt precifica de <b>' +
          ptPct(cob.pct_do_plantel_min) + '</b> a <b>' + ptPct(cob.pct_do_plantel_max) + '</b> do plantel conforme a ' +
          'temporada (mediana ' + ptPct(cob.pct_do_plantel_mediana) + ', ' + ptInt(cob.tm_com_valor_mediana) +
          ' atletas), e quem fica de fora é jogador obscuro — ' +
          'a correlação entre cobertura e valor do elenco é <b>' + ptNum(cob.rho_cobertura_x_valor, 3) + '</b> (' +
          ptP(cob.p_cobertura_x_valor) + '). Time pobre tem mais atleta sem preço.</p>'
        : '') +
    '</div>' +

    '<div class="pt-controle">' +
      '<span class="pt-rot">Controle 3 · o contrafactual de cada proposta</span>' +
      '<p class="pt-nota">Toda proposta de elenco chega com a folha implícita e o valor somado colocados no ' +
      '<b>posto de valor que ocupariam na Série B</b>, e com a taxa histórica de subida daquele quartil dita em ' +
      'voz alta' +
      (quartis.length
        ? ': ' + quartis.map(q => ptInt(q) + 'º quartil <b>' + ptPct(taxas[q]) + '</b>').join(' · ')
        : '') + '.</p>' +
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
      '<span class="pt-rot">Protótipo · como isto foi construído</span>' +
      '<h2 class="pt-h1">Dezesseis etapas, e o que cada uma reprovou</h2>' +
      '<p class="pt-sub">' +
        (e0.linhas_completas !== undefined
          ? 'O estudo parte de <b>' + ptInt(e0.linhas_completas) + '</b> clube-temporada completos (' +
            ptInt(e0.sobe) + ' que subiram, ' + ptInt(e0.meio) + ' do meio, ' + ptInt(e0.cai) +
            ' que caíram) e de <b>' + ptInt(e0.indicadores_pre_declarados) + '</b> indicadores declarados ' +
            'ANTES do primeiro teste. '
          : '') +
        'A maior parte deles não passou — e continua na tela, com o número que a reprovou ao lado. ' +
        'As etapas estão na ordem em que foram feitas, porque é a ordem que permite auditar: cada uma ' +
        'só pode usar o que a anterior deixou de pé.</p>' +
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
