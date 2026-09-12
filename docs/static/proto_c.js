/* ================= aba Protótipo — etapas 9 a 15 =================

   As réguas, o mercado e o que não dá. É a metade da aba em que o estudo para de descrever
   quem subiu e começa a sugerir contratação — e por isso é a metade em que o controle do
   dinheiro e a palavra "ausência" precisam aparecer mais, não menos.

   Vale aqui a regra da aba inteira: **o dado é a fonte, o texto é consequência.** Nenhum
   número deste arquivo foi digitado. Quando uma frase tem número dentro, o número saiu do
   `PROTO` na hora em que a frase foi montada, e se o `prototipo.json` mudar a frase muda
   junto — inclusive quando a frase deixar de ser verdadeira. Duas frases deste arquivo são
   condicionais por isso: a da etapa 11 ("o que você compra é o físico e o duelo") e a do
   veredito do backtest na etapa 13. Elas só são escritas se os números as sustentarem; se
   não sustentarem, a tela escreve o que os números dizem no lugar.

   O que NÃO existe neste arquivo, de propósito:
   - nenhum helper `pt…` redefinido (eles vêm de proto.js e são de todos; redefinir um aqui
     quebraria as etapas dos outros dois arquivos, porque o último script carregado ganha);
   - nenhuma classe de CSS nova — o que precisou de geometria foi feito com `style=""` e com
     SVG montado à mão, que é como o resto do app desenha;
   - nenhum "—" pelado. Todo vazio deste arquivo carrega o motivo do vazio, e boa parte dos
     motivos é calculada: a etapa 10 não diz "sem líquido", ela PROCURA o indicador no
     catálogo da etapa 2 e diz que não achou.

   Contrato: static/proto_contrato.md. Funções locais levam prefixo `pc`. */
'use strict';

/* Estado das etapas que se reescrevem sozinhas (cascata da 12, setor da 13, proposta da 14).
   Fica num objeto só, e não em variáveis soltas, porque três etapas interativas no mesmo
   arquivo com nomes parecidos é o jeito mais rápido de uma apagar a outra. */
const PC = { et12: null, et13: null, et14: null };

/* ---------------- pontes com o dado que mora em outra etapa ----------------

   A etapa 10 precisa do líquido de valor, que só existe no catálogo da etapa 2; a etapa 9
   precisa dos nomes dos 16 que subiram, que só existem na matriz da etapa 5; a etapa 13
   precisa saber quais ligas ficaram sem cobertura física, que é dado da etapa 12. Nenhuma
   dessas pontes pode ser escrita à mão: são consultas ao `PROTO`, e quando a chave não
   existir a função devolve vazio e quem chamou escreve a ausência. */
function pcCatalogo() {
  if (PC.catalogo) return PC.catalogo;
  const m = {};
  const e2 = (typeof PROTO !== 'undefined' && PROTO.etapa_2) || null;
  (e2 && e2.linhas ? e2.linhas : []).forEach(l => { m[l.indicador] = l; });
  PC.catalogo = m;
  return m;
}
function pcRhoDaEtapa6() {
  const e6 = (typeof PROTO !== 'undefined' && PROTO.etapa_6) || null;
  return (e6 && e6.rho) || {};
}
/* Os 16 clube-temporada que subiram, na ordem em que o pipeline os guardou. O contrato diz
   que `etapa_9.reguas[*].sobe`, `etapa_5.paineis[*].clubes` e `etapa_8.tipologia.plano`
   estão na mesma ordem — e que isso foi conferido entre as duas últimas. Aqui a ordem é
   LIDA das outras etapas, nunca digitada; se a etapa 5 e a 8 discordarem entre si, a etapa
   9 mostra número em vez de nome e diz por quê, em vez de rotular o clube errado. */
function pcClubesQueSubiram() {
  if (PC.clubes !== undefined) return PC.clubes;
  const e5 = (typeof PROTO !== 'undefined' && PROTO.etapa_5) || null;
  const e8 = (typeof PROTO !== 'undefined' && PROTO.etapa_8) || null;
  let a = null, b = null;
  if (e5 && e5.paineis) {
    const p = Object.keys(e5.paineis).map(k => e5.paineis[k]).find(x => x && x.clubes && x.clubes.length);
    if (p) a = p.clubes.map(c => ({ clube: c.clube, ano: c.ano }));
  }
  if (e8 && e8.tipologia && e8.tipologia.plano) {
    b = e8.tipologia.plano.map(c => ({ clube: c.clube, ano: c.ano }));
  }
  let saida = null, motivo = '';
  if (a && b && a.length === b.length && a.every((x, i) => x.clube === b[i].clube && x.ano === b[i].ano)) {
    saida = a;
  } else if (a || b) {
    saida = a || b;
    motivo = 'a lista de clubes da etapa 5 e a da etapa 8 não batem uma com a outra';
  } else {
    motivo = 'nem a etapa 5 nem a etapa 8 trouxeram a lista dos clube-temporada que subiram';
  }
  PC.clubes = saida;
  PC.clubesMotivo = motivo;
  return saida;
}
/* O alfa é decisão do estudo, não deste arquivo: ele vem de `etapa_0.poder.alfa`. Escrever
   0,05 aqui seria número digitado, e pior, seria número digitado que continuaria na tela
   caso o pipeline mudasse de critério. */
function pcAlfa() {
  const p = (typeof PROTO !== 'undefined' && PROTO.etapa_0 && PROTO.etapa_0.poder) || null;
  return p && p.alfa !== undefined && p.alfa !== null ? Number(p.alfa) : null;
}
function pcPassa(p) { const a = pcAlfa(); return a !== null && p !== null && p !== undefined && p < a; }
/* O nome do eixo é a chave do JSON ("A_posse_construcao"). Ele aparece na tela como a chave
   que é — letra do eixo destacada e o resto em fonte de código —, porque inventar um título
   bonito criaria um nome que não existe em lugar nenhum do pipeline e que ninguém
   conseguiria procurar no arquivo. */
function pcNomeEixo(k) {
  const s = String(k);
  const corte = s.indexOf('_');
  if (corte < 1) return '<code>' + esc(s) + '</code>';
  return '<b>' + esc(s.slice(0, corte)) + '</b> <code>' + esc(s.slice(corte + 1)) + '</code>';
}
function pcLista(arr) { return (arr || []).map(x => '<code>' + esc(x) + '</code>').join(' · '); }
function pcMin(a) { return a.reduce((x, y) => (y < x ? y : x), a[0]); }
function pcMax(a) { return a.reduce((x, y) => (y > x ? y : x), a[0]); }
/* Nenhuma mediana é recalculada neste arquivo de propósito: a etapa 11 já publica
   `rho_mediano`, `rho_mediano_mudou` e `rho_mediano_ficou`, e recalcular um número que o
   pipeline já divulgou é convidar os dois a divergirem sem ninguém perceber. */
/* Grade de blocos sem classe própria. O contrato proíbe inventar CSS (três arquivos mexendo
   no mesmo style.css ao mesmo tempo perdem trabalho um do outro), então o que precisa de
   duas colunas usa grid inline. É feio no código e correto na tela. */
function pcGrade(minimo, html) {
  return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(' + minimo +
    'px,1fr));gap:12px">' + html + '</div>';
}
function pcNumeroSolto(rot, valor, nota) {
  return '<div style="padding:9px 11px;background:var(--veu2);border-radius:7px">' +
    '<span class="pt-rot">' + esc(rot) + '</span>' +
    '<b style="display:block;font-size:18px;margin-top:3px;font-variant-numeric:tabular-nums">' + valor + '</b>' +
    (nota ? '<span style="font-size:11px;color:var(--tinta3);display:block;margin-top:2px">' + nota + '</span>' : '') +
    '</div>';
}
/* Botões de troca de painel. Não há classe de CSS para eles no style.css, e criar uma seria
   editar arquivo de outro; então saem com estilo inline e o estado ligado/desligado marcado
   por cor de borda, que é o mínimo para a pessoa saber onde está. */
function pcBotoes(nome, itens, ativo) {
  return '<div style="display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 12px">' + itens.map(it =>
    '<button type="button" data-pc="' + esc(nome) + '" data-v="' + esc(it.v) + '" style="' +
    'font:inherit;font-size:11.5px;padding:5px 11px;border-radius:6px;cursor:pointer;' +
    'border:1px solid ' + (it.v === ativo ? 'var(--pt-alto)' : 'var(--borda)') + ';' +
    'background:' + (it.v === ativo ? 'var(--veu2)' : 'transparent') + ';' +
    'color:' + (it.v === ativo ? 'var(--tinta)' : 'var(--tinta2)') + '">' +
    it.rot + '</button>').join('') + '</div>';
}
function pcLigarBotoes(alvo, nome, acao) {
  alvo.querySelectorAll('button[data-pc="' + nome + '"]').forEach(b => {
    b.onclick = () => acao(b.dataset.v);
  });
}

/* ================================================================================
   ETAPA 9 — AS RÉGUAS
   ================================================================================

   Nove eixos compostos, e o aviso que o próprio pipeline manda exibir: a unidade de teste é
   o indicador cru; o eixo é régua de tela. Esse aviso não é rodapé nem `title` — foi
   compondo eixo antes de testar que um dos planos anteriores concluiu "nenhum eixo separa
   depois do dinheiro" e perdeu o achado que estava dentro do eixo.

   Por isso cada régua vem com a tabela dos seus itens crus ao lado, e a tela MARCA, item a
   item, quando o item discorda do eixo: sinal contrário ao do eixo, ou item que sobrevive
   ao líquido dentro de um eixo que não sobrevive. A marcação é calculada, não catalogada. */
function ptEtapa9(alvo, dados) {
  const reguas = (dados.reguas || []).slice();
  const clubes = pcClubesQueSubiram();

  /* A baseline do dinheiro é obrigatória aqui (contrato, seção 3). Nenhuma das nove réguas
     traz AUC fora da amostra no JSON — e em vez de deixar o controle em branco, a tela
     confere isso e escreve o que a régua tem no lugar do que ela não tem. */
  const comAuc = reguas.filter(r => r.auc !== undefined && r.auc !== null);
  const baseline = comAuc.length
    ? ptBaseline({ rotulo: 'a melhor das réguas', auc: pcMax(comAuc.map(r => r.auc)) })
    : ptBaseline({
        rotulo: 'as réguas',
        auc: null,
        motivo: 'nenhuma das ' + ptInt(reguas.length) + ' réguas traz AUC no JSON: o que existe é ' +
          'd, q de BH, líquido de valor e ρ de persistência, todos DENTRO da amostra de ' +
          ptInt(reguas.length ? reguas[0].sobe.length : 0) + ' clube-temporada que subiram',
      });

  /* Quantas réguas o pipeline mandou esmaecer, e quantas sobrevivem ao líquido de valor: os
     dois números que resumem a etapa saem de contagem, não de memória. */
  const esmaecidas = reguas.filter(r => r.esmaecido);
  const vivasNoLiquido = reguas.filter(r => pcPassa(r.p_liq_SM));
  const alfa = pcAlfa();

  const cards = reguas.map((r, i) => pcReguaCard(r, i, clubes)).join('');

  alvo.innerHTML =
    (dados.aviso_composicao
      ? '<div class="pt-controle"><span class="pt-rot">o aviso que o pipeline manda exibir</span>' +
        '<p class="pt-nota" style="font-size:14px;color:var(--tinta);margin-top:5px">“' +
        esc(dados.aviso_composicao) + '”</p>' +
        '<p class="pt-nota">Por isso cada régua abaixo vem com os itens crus que a compõem, cada um com o ' +
        'seu próprio p. Onde o item discorda do eixo, a linha do item é marcada — foi exatamente ' +
        'compondo antes de testar que se perde um achado dentro da média.</p></div>'
      : ptFaltaBloco('O aviso de composição não veio no dado',
          'o JSON não trouxe `etapa_9.aviso_composicao`, que é a frase que o pipeline manda colar ' +
          'nesta etapa. Sem ela a tela não inventa a frase: registra que ela falta.')) +

    baseline +

    '<p class="pt-nota" style="margin-top:14px">São <b>' + ptInt(reguas.length) + '</b> réguas. ' +
      '<b>' + ptInt(esmaecidas.length) + '</b> chegam esmaecidas pelo próprio pipeline (' +
      (esmaecidas.length ? esmaecidas.map(r => '<code>' + esc(r.eixo) + '</code>, ρ ' +
        ptNum(r.rho_persist, 3)).join('; ') : 'nenhuma') + '), e ' +
      '<b>' + ptInt(vivasNoLiquido.length) + '</b> ' + (vivasNoLiquido.length === 1 ? 'sobrevive' : 'sobrevivem') +
      ' ao desconto do valor do elenco' +
      (alfa !== null ? ' com p abaixo de ' + ptNum(alfa, 2) : '') + '. ' +
      'Régua esmaecida não é régua ruim de desenho: é eixo que não se repete de um ano para o outro, ' +
      'e portanto descreve um ano em vez de um modo de jogar.</p>' +

    cards +

    ptFaltaBloco('A faixa do meio e a de quem caiu não entram nestas réguas',
      'a especificação pede a régua com a faixa interquartil do meio e de quem caiu ao fundo, como ' +
      'na matriz da etapa 5. O `etapa_9.reguas[*]` traz só os ' +
      ptInt(reguas.length ? reguas[0].sobe.length : 0) + ' valores de quem subiu (`sobe`) — não há ' +
      'q1, mediana nem q3 do meio ou de quem caiu nesta chave. Cada régua abaixo mostra só a ' +
      'distribuição de quem subiu, e a escala de cada uma é a dela mesma.');

  ptLigarTabelas(alvo);
}

function pcReguaCard(r, i, clubes) {
  const itens = r.itens_crus || [];
  /* "Discorda do eixo" tem duas formas, e as duas importam por motivos opostos: o item com
     sinal contrário está sendo diluído dentro da média do eixo, e o item que sobrevive ao
     líquido num eixo que não sobrevive é justamente o achado que a composição apaga. */
  /* Três itens das nove réguas chegam com tudo nulo — e não é descuido de leitura: o JSON traz
     `col` e mais nada. Eles são justamente os que não estão no catálogo de indicadores da
     etapa 2, e a tela descobre isso procurando lá, em vez de afirmar um motivo de cabeça. */
  const cat = pcCatalogo();
  const linhas = itens.map(it => {
    const mudo = it.d_SM === null && it.p_SM === null && it.d_liq_SM === null && it.p_liq_SM === null;
    const sinalContrario = !mudo && it.d_SM !== null && r.d_SM !== null &&
      Math.sign(it.d_SM) !== 0 && Math.sign(r.d_SM) !== 0 && Math.sign(it.d_SM) !== Math.sign(r.d_SM);
    const vivoSozinho = pcPassa(it.p_liq_SM) && !pcPassa(r.p_liq_SM);
    const notas = [];
    if (vivoSozinho) notas.push('sobrevive ao líquido de valor, e o eixo inteiro não');
    if (sinalContrario) notas.push('anda para o lado contrário do eixo');
    return Object.assign({}, it, {
      _mudo: mudo,
      _motivo: mudo
        ? (cat[it.col]
            ? 'o item está no catálogo da etapa 2, mas a régua não trouxe d, p nem ρ para ele'
            : 'este item não está entre os ' + ptInt(Object.keys(cat).length) + ' indicadores do catálogo ' +
              'da etapa 2, e a régua não trouxe d, p nem ρ para ele')
        : '',
      _nota: notas.join(' · '),
      _classe: notas.length ? 'destaque' : '',
      _dica: notas.length ? 'este item discorda do eixo: ' + notas.join('; ') : '',
    });
  });
  const mudos = linhas.filter(l => l._mudo);

  const tab = ptTabela({
    id: 'ptEt-9-crus-' + i,
    ordem: { col: 'p_SM', dir: 'asc' },
    vazio: 'este eixo não trouxe itens crus no JSON — e um eixo sem itens é um eixo que não dá para auditar',
    colunas: [
      { k: 'col', rot: 'item cru', tipo: 'texto', dica: 'nome da coluna como ela existe na base' },
      { k: 'd_SM', rot: 'd sobe×meio', fmt: (v, l) => l._mudo ? ptFalta(l._motivo) : ptD(v) },
      { k: 'p_SM', rot: 'p', fmt: (v, l) => l._mudo ? '' : ptPv(v) },
      { k: '_liq', rot: 'bruto → líquido de valor',
        fmt: (v, l) => l._mudo ? ptFalta(l._motivo)
          : ptLiquida({ d_bruto: l.d_SM, p_bruto: l.p_SM, d_liq: l.d_liq_SM, p_liq: l.p_liq_SM }) },
      { k: 'rho_persist', rot: 'ρ t/t+1', casas: 3,
        fmt: (v, l) => v === null || v === undefined
          ? ptFalta(l._mudo ? l._motivo : 'este item não tem par ano/ano seguinte medido na etapa 6')
          : ptNum(v, 3) },
      { k: '_nota', rot: 'discorda do eixo?', tipo: 'texto',
        fmt: (v, l) => l._mudo
          ? ptFalta('sem d e sem p, não dá para dizer se este item concorda ou discorda do eixo')
          : v ? '<b style="color:var(--coral)">' + esc(v) + '</b>'
              : '<span style="color:var(--tinta3)">não</span>' },
    ],
    linhas: linhas,
  });

  const quatro = pcGrade(150,
    pcNumeroSolto('d sobe×meio', ptD(r.d_SM), ptP(r.p_SM)) +
    pcNumeroSolto('q de Benjamini-Hochberg', ptNum(r.q_SM, 3),
      pcPassa(r.q_SM) ? 'sobrevive à correção' : 'não sobrevive à correção') +
    pcNumeroSolto('d líquido de valor', ptD(r.d_liq_SM), ptP(r.p_liq_SM)) +
    pcNumeroSolto('ρ de persistência', ptNum(r.rho_persist, 3),
      r.esmaecido ? 'o pipeline mandou esmaecer' : 'o pipeline não mandou esmaecer'));

  const corpo =
    '<p class="pt-nota" style="margin-top:0">Itens: ' + pcLista(r.itens) + '</p>' +
    quatro +
    '<div style="margin-top:12px">' +
      '<span class="pt-rot">onde caiu cada um dos que subiram, nesta régua</span>' +
      pcReguaSvg(r, clubes) +
    '</div>' +
    '<div style="margin-top:10px">' +
      '<span class="pt-rot">os itens crus, com os p deles</span>' + tab +
    '</div>' +
    '<div style="margin-top:10px">' +
      ptLiquida({ d_bruto: r.d_SM, p_bruto: r.p_SM, d_liq: r.d_liq_SM, p_liq: r.p_liq_SM }) +
    '</div>';

  const card = ptCard(
    '', /* o título vai montado em HTML no subtítulo, porque ptCard escapa o título e o nome do eixo é código */
    pcNomeEixo(r.eixo) + ' · ' + ptInt((r.itens_crus || []).length) + ' itens crus' +
      (r.esmaecido ? ' · <b style="color:var(--coral)">esmaecida: não se repete de um ano para o outro</b>' : ''),
    corpo,
    (r.esmaecido
      ? 'Esta régua está esmaecida porque o próprio pipeline a marcou assim, com ρ de persistência ' +
        ptNum(r.rho_persist, 3) + '. Um eixo que não se repete descreve o ano que passou; contratar por ele ' +
        'é comprar o retrato, não o modelo.'
      : 'Persistência ρ ' + ptNum(r.rho_persist, 3) + ' — o eixo tende a se repetir de um ano para o outro.') +
    (mudos.length
      ? ' <b>' + ptInt(mudos.length) + ' ' + (mudos.length === 1 ? 'item deste eixo entra mudo' : 'itens deste eixo entram mudos') +
        '</b> (' + pcLista(mudos.map(l => l.col)) + '): o eixo os soma, e o JSON não publica d, p nem ρ ' +
        'para eles. Um eixo com item mudo dentro é um eixo cuja média ninguém consegue auditar inteira.'
      : ''));

  /* O esmaecimento é visual e é exigência do contrato. Sem classe de CSS disponível, ele sai
     em opacidade e saturação reduzidas no bloco inteiro — o texto continua legível, que é o
     ponto: a régua não é escondida, é rebaixada. */
  return r.esmaecido
    ? '<div style="opacity:.68;filter:saturate(.55)">' + card + '</div>'
    : card;
}

/* A régua desenhada. A escala é a DA PRÓPRIA régua (mínimo e máximo dos 16 valores de
   `sobe`), e não uma escala comum às nove, porque as nove não estão na mesma unidade: uma
   vai de −75 a −8 e outra de 22 a 100. Encaixar as duas na mesma régua diria que uma é pior
   que a outra, o que este dado não sustenta.

   E a unidade fica sem nome de propósito: o contrato registra que não foi possível
   reconstruir a fórmula de `sobe` a partir dos percentis brutos (a média simples dos itens
   não reproduz o valor). Então a tela mostra a DISTRIBUIÇÃO e os extremos, e não afirma
   "percentil" nem "posto" — afirmar unidade não confirmada é o tipo de erro que ninguém
   descobre depois. */
function pcReguaSvg(r, clubes) {
  const v = (r.sobe || []).map(x => (x === null || x === undefined ? null : Number(x)));
  const validos = v.filter(x => x !== null);
  if (!validos.length) {
    return ptFalta('esta régua não trouxe os valores de quem subiu (`sobe` vazio no JSON)');
  }
  const min = pcMin(validos), max = pcMax(validos);
  const span = (max - min) || 1;
  const L = 22, R = 22, W = 760, eixoY = 34, H = 118;
  const x = val => L + (val - min) / span * (W - L - R);

  const pontos = v.map((val, i) => {
    const nome = clubes && clubes[i] ? clubes[i].clube + ' ' + clubes[i].ano : 'posição ' + (i + 1) + ' da lista';
    if (val === null) return '';
    const px = x(val);
    return '<g><title>' + esc(nome + ' · ' + ptNum(val, 1)) + '</title>' +
      '<line x1="' + px.toFixed(1) + '" y1="' + (eixoY - 7) + '" x2="' + px.toFixed(1) + '" y2="' + (eixoY + 7) +
        '" style="stroke:var(--pt-alto);stroke-width:1.4;opacity:.85"></line>' +
      '<circle cx="' + px.toFixed(1) + '" cy="' + eixoY + '" r="3.4" style="fill:var(--pt-alto);opacity:.9"></circle>' +
      '<text x="' + px.toFixed(1) + '" y="' + (eixoY + 13) + '" transform="rotate(-58 ' + px.toFixed(1) + ' ' +
        (eixoY + 13) + ')" style="font-size:9px;fill:var(--tinta3)" text-anchor="end">' + esc(nome) + '</text>' +
      '</g>';
  }).join('');

  const semValor = v.filter(x2 => x2 === null).length;

  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="display:block;overflow:visible">' +
    '<line x1="' + L + '" y1="' + eixoY + '" x2="' + (W - R) + '" y2="' + eixoY +
      '" style="stroke:var(--borda2);stroke-width:1"></line>' +
    '<text x="' + L + '" y="' + (eixoY - 14) + '" style="font-size:10px;fill:var(--tinta3)">' +
      esc(ptNum(min, 1)) + '</text>' +
    '<text x="' + (W - R) + '" y="' + (eixoY - 14) + '" text-anchor="end" style="font-size:10px;fill:var(--tinta3)">' +
      esc(ptNum(max, 1)) + '</text>' +
    pontos +
    '</svg>' +
    '<p class="pt-nota" style="font-size:11px;margin-top:2px">Escala própria desta régua, do menor ao maior ' +
      'valor entre os ' + ptInt(v.length) + ' que subiram. A unidade do eixo não é declarada no JSON — o que a ' +
      'tela mostra é a dispersão, não uma medida com nome.' +
      (semValor ? ' ' + ptInt(semValor) + ' dos que subiram não têm valor nesta régua.' : '') +
      (PC.clubesMotivo ? ' Os nomes: ' + esc(PC.clubesMotivo) + ' — os pontos estão numerados pela ordem da lista.' : '') +
      '</p>';
}

/* ================================================================================
   ETAPA 10 — CAUSA OU CONSEQUÊNCIA
   ================================================================================

   Esta etapa existe para impedir um erro caro, e o erro é específico: olhar a tabela de
   separação, ver que "pontos fora de casa" separa quem sobe de quem cai com o maior d da
   aba inteira, e sair para o mercado atrás de um jogador que faça pontos fora de casa.

   A porta D é o placar redescrito. A porta B separa e não se repete. Nenhuma das duas é
   critério de contratação, e por isso a etapa tem um rótulo em vez de uma conclusão. */
function ptEtapa10(alvo, dados) {
  const linhas = (dados.linhas || []).slice();
  const cat = pcCatalogo();
  const rho6 = pcRhoDaEtapa6();

  /* As portas não são explicadas no `etapa_10`: a legenda de cada porta mora no
     `porta_motivo` do catálogo da etapa 2. A tela vai buscar lá. Onde não achar — e a porta
     D não está no catálogo, porque essas colunas nem entraram nos indicadores — escreve a
     ausência com o motivo que a própria busca revelou. */
  const legenda = {};
  Object.keys(cat).forEach(k => { const l = cat[k]; if (l.porta && !legenda[l.porta]) legenda[l.porta] = l.porta_motivo; });

  const porPorta = {};
  linhas.forEach(l => { (porPorta[l.porta] = porPorta[l.porta] || []).push(l); });
  const portas = Object.keys(porPorta).sort();

  const noCatalogo = linhas.filter(l => cat[l.indicador]).length;
  const forasNoCatalogo = linhas.length - noCatalogo;
  const semRho = linhas.filter(l => l.rho_persist === null || l.rho_persist === undefined);
  const semRhoEForaDaEtapa6 = semRho.filter(l => !(l.indicador in rho6)).length;

  /* O d mais forte da lista é a prova do ponto. Ele é encontrado, não decorado. */
  const maisForte = linhas.slice().sort((a, b) =>
    Math.abs(b.d_bruto_SC || 0) - Math.abs(a.d_bruto_SC || 0))[0];

  const tab = ptTabela({
    id: 'ptEt-10-tab',
    ordem: { col: 'd_bruto_SC', dir: 'desc' },
    vazio: 'a etapa 10 não trouxe linha nenhuma',
    colunas: [
      { k: 'nome', rot: 'coluna', tipo: 'texto', dica: 'nome como ela aparece na base' },
      { k: 'porta', rot: 'porta', tipo: 'texto',
        fmt: v => '<b>' + esc(v) + '</b>', classe: () => 'txt' },
      { k: 'm_sobe', rot: 'média de quem subiu', casas: 2 },
      { k: 'm_meio', rot: 'meio', casas: 2 },
      { k: 'm_cai', rot: 'quem caiu', casas: 2 },
      { k: 'd_bruto_SM', rot: 'd sobe×meio', fmt: v => ptD(v) },
      { k: 'd_bruto_SC', rot: 'd sobe×cai', fmt: v => ptD(v) },
      { k: '_liq', rot: 'bruto → líquido de valor', tipo: 'texto',
        fmt: (v, l) => {
          const c = cat[l.indicador];
          if (c) return ptLiquida({ d_bruto: c.d_bruto_SM, p_bruto: c.p_bruto_SM, d_liq: c.d_liq_SM, p_liq: c.p_liq_SM });
          return ptFalta('esta coluna não está no catálogo de ' + ptInt(Object.keys(cat).length) +
            ' indicadores da etapa 2: o pipeline não calculou líquido de valor para ela');
        } },
      { k: 'rho_persist', rot: 'ρ t/t+1', casas: 3,
        fmt: (v, l) => {
          if (v !== null && v !== undefined) return ptNum(v, 3);
          return ptFalta(l.indicador in rho6
            ? 'a etapa 6 tem ρ para esta coluna, mas a etapa 10 não o trouxe'
            : 'não há ρ medido: esta coluna não está entre as ' + ptInt(Object.keys(rho6).length) +
              ' do mapa de persistência da etapa 6');
        } },
    ],
    linhas: linhas,
  });

  alvo.innerHTML =
    '<div class="pt-controle" style="border-left:3px solid var(--coral)">' +
      '<b style="font-size:26px;letter-spacing:-.02em;display:block;line-height:1.1">NÃO CONTRATE PARA ISTO</b>' +
      '<p class="pt-nota">São <b>' + ptInt(linhas.length) + '</b> colunas que separam quem subiu de quem caiu — ' +
        'algumas com a maior distância da aba inteira' +
        (maisForte ? ' (<code>' + esc(maisForte.indicador) + '</code>, d sobe×cai ' + ptD(maisForte.d_bruto_SC) + ')' : '') +
        ' — e que mesmo assim não servem de critério de contratação. Uma parte é o resultado ' +
        'redescrito: quem subiu fez mais pontos fora de casa porque subiu, não subiu porque fez. ' +
        'A outra parte separa de verdade e não se repete no ano seguinte.</p>' +
    '</div>' +

    pcGrade(230, portas.map(p =>
      '<div class="pt-controle">' +
        '<span class="pt-rot">porta ' + esc(p) + ' · ' + ptInt(porPorta[p].length) +
          (porPorta[p].length === 1 ? ' coluna' : ' colunas') + '</span>' +
        '<p class="pt-nota" style="margin-top:5px">' +
          (legenda[p]
            ? '<b>' + esc(legenda[p]) + '</b>'
            : ptFalta('nenhuma linha do catálogo da etapa 2 tem porta ' + esc(p) +
                ', então a legenda desta porta não existe no JSON — estas colunas ficaram fora dos ' +
                ptInt(Object.keys(cat).length) + ' indicadores')) +
        '</p>' +
        '<p class="pt-nota" style="font-size:11.5px">' + pcLista(porPorta[p].map(l => l.indicador)) + '</p>' +
      '</div>').join('')) +

    '<p class="pt-nota" style="margin-top:14px"><b>' + ptInt(forasNoCatalogo) + '</b> das ' +
      ptInt(linhas.length) + ' colunas desta etapa não estão no catálogo de indicadores da etapa 2, e ' +
      '<b>' + ptInt(semRhoEForaDaEtapa6) + '</b> não têm ρ de persistência medido por não estarem no mapa ' +
      'da etapa 6. Isso não é falha da tela: é o desenho do estudo. Coluna de placar não foi declarada ' +
      'como indicador antes do primeiro teste, então não recebeu nem líquido de valor nem persistência — ' +
      'ela entra aqui para ser mostrada e desqualificada, que é o serviço desta etapa.</p>' +

    tab;

  ptLigarTabelas(alvo);
}

/* ================================================================================
   ETAPA 11 — O TESTE DA MALA
   ================================================================================

   A pergunta é a única que importa antes de assinar um contrato: o que o atleta leva na
   mala quando muda de clube, e o que ficava no time anterior?

   A frase que a especificação quer nesta tela — "o que você compra num jogador é o físico e
   o duelo; o volume de passe dele era do time anterior" — NÃO é escrita por padrão. Ela é
   uma afirmação sobre três comparações, e as três são conferidas no dado antes: o físico
   tem de estar acima do técnico; os indicadores de duelo têm de sobreviver à mudança; e os
   de volume de passe têm de cair. Cada perna que não se sustentar é escrita como não
   sustentada, com o número que a derrubou. */
function ptEtapa11(alvo, dados) {
  const f = dados.fisico || null;
  const t = dados.tecnico || null;
  if (!f || !t) {
    alvo.innerHTML = ptFaltaBloco('O teste da mala não veio inteiro',
      'faltou ' + (!f ? '`fisico`' : '') + (!f && !t ? ' e ' : '') + (!t ? '`tecnico`' : '') +
      ' em `etapa_11`. Sem os dois lados não há comparação: a tela não desenha meia barra pareada.');
    return;
  }

  const mets = (t.metricas || []).slice().sort((a, b) =>
    (b.rho_mudou - b.rho_ficou) - (a.rho_mudou - a.rho_ficou));
  const viajam = mets.filter(m => m.rho_mudou >= m.rho_ficou);
  const caem = mets.filter(m => m.rho_mudou < m.rho_ficou)
    .slice().sort((a, b) => (b.rho_ficou - b.rho_mudou) - (a.rho_ficou - a.rho_mudou));

  /* As três pernas da frase, conferidas uma a uma. */
  const fisicoAcima = f.rho_mediano !== null && t.rho_mediano_mudou !== null &&
    f.rho_mediano > t.rho_mediano_mudou;
  const maiorQueda = caem.length ? caem[0] : null;
  const queda = maiorQueda ? maiorQueda.rho_ficou - maiorQueda.rho_mudou : null;
  const distanciaMediana = (t.rho_mediano_ficou !== null && t.rho_mediano_mudou !== null)
    ? t.rho_mediano_ficou - t.rho_mediano_mudou : null;

  const frase =
    (fisicoAcima
      ? '<b>O físico viaja.</b> A mediana do ρ físico entre dois anos do mesmo atleta é ' +
        ptNum(f.rho_mediano, 3) + ' (' + ptInt(f.pares) + ' pares), contra ' +
        ptNum(t.rho_mediano_mudou, 3) + ' da mediana técnica de quem mudou de clube. '
      : '<b>O físico não ficou acima do técnico neste dado.</b> A mediana física é ' +
        ptNum(f.rho_mediano, 3) + ' e a técnica de quem mudou é ' + ptNum(t.rho_mediano_mudou, 3) +
        ' — a primeira perna da frase da especificação não se sustenta aqui. ') +
    (viajam.length
      ? '<b>' + ptInt(viajam.length) + ' ' + (viajam.length === 1 ? 'indicador técnico atravessa' : 'indicadores técnicos atravessam') +
        ' a mudança sem perder nada</b> (ρ de quem mudou igual ou maior que o de quem ficou): ' +
        viajam.map(m => '<code>' + esc(m.metrica) + '</code> ' + ptNum(m.rho_mudou, 3) + ' contra ' +
          ptNum(m.rho_ficou, 3)).join('; ') + '. '
      : '<b>Nenhum indicador técnico atravessa a mudança sem perda neste dado.</b> ') +
    (maiorQueda
      ? 'A maior perda é <code>' + esc(maiorQueda.metrica) + '</code>: ' + ptNum(maiorQueda.rho_ficou, 3) +
        ' em quem ficou contra ' + ptNum(maiorQueda.rho_mudou, 3) + ' em quem mudou, ' +
        ptNum(queda, 3) + ' de diferença. '
      : '') +
    (distanciaMediana !== null
      ? 'Na mediana, porém, a diferença entre ficar e mudar é de apenas ' + ptNum(distanciaMediana, 3) +
        ' — o efeito existe indicador a indicador e some quando se olha só a mediana. Quem for citar ' +
        'esta etapa deve citar os indicadores, não a mediana.'
      : '');

  /* Barras pareadas, mesma escala para os dois lados e para o físico. A escala vai de 0 a 1
     porque é correlação, e normalizar pelo maior da lista faria o pior indicador desta lista
     curta parecer bom — que é justamente o erro que esta etapa existe para evitar. */
  const svg = pcMalaSvg(mets, f.rho_mediano, t.rho_mediano_mudou, t.rho_mediano_ficou);

  const barrasFisico = (f.metricas || []).map(m => ptBarra(m.rho, 1, {
    rot: m.metrica,
    texto: ptNum(m.rho, 3),
    extra: ptN(m.n, 'pares'),
  })).join('');

  alvo.innerHTML =
    '<div class="pt-controle">' +
      '<span class="pt-rot">o que a tela sustenta, conferido linha a linha antes de ser escrito</span>' +
      '<p class="pt-nota" style="font-size:13.5px;color:var(--tinta);margin-top:6px">' + frase + '</p>' +
    '</div>' +

    ptCard('Técnico: quem mudou de clube contra quem ficou',
      ptN(t.pares_mudou, 'pares mudaram') + ' · ' + ptN(t.pares_ficou, 'pares ficaram') +
        (t.corte ? ' · ' + esc(t.corte) : ''),
      svg,
      'Mediana de quem mudou ' + ptNum(t.rho_mediano_mudou, 3) + ' contra ' + ptNum(t.rho_mediano_ficou, 3) +
      ' de quem ficou. A linha pontilhada é a mediana do físico (' + ptNum(f.rho_mediano, 3) + '), na mesma ' +
      'escala — é ela que separa o que se compra do que se aluga junto com o time.') +

    ptCard('Físico: o mesmo atleta, dois anos seguidos',
      ptN(f.pares, 'pares') + (f.corte ? ' · ' + esc(f.corte) : ''),
      barrasFisico,
      'Aqui não há "mudou contra ficou": o JSON traz um ρ só por métrica física, sem separar quem trocou ' +
      'de clube de quem permaneceu. ' +
      /* O `ptFalta` sai como uma frase inteira ("sem dado — motivo"); emendado sem ponto no meio
         de um período, ele colava no que vinha depois e o texto lia-se como erro de montagem. */
      ptFalta('o corte mudou/ficou não existe no bloco `fisico` do JSON — a comparação pareada só está ' +
        'disponível para o técnico') + '. Mesmo sem esse corte, a ordem de grandeza é outra: a menor ' +
      'correlação física da lista (' + ptNum(pcMin((f.metricas || []).map(m => m.rho)), 3) + ') está acima da ' +
      'mediana técnica de quem ficou no mesmo clube (' + ptNum(t.rho_mediano_ficou, 3) + ').') +

    (dados.uso
      ? '<div class="pt-controle" style="margin-top:12px"><span class="pt-rot">como estes ρ entram na nota</span>' +
        '<p class="pt-nota" style="margin-top:5px;font-size:13px;color:var(--tinta)">“' + esc(dados.uso) + '”</p>' +
        '<p class="pt-nota">Faixa e não coeficiente porque a magnitude não replica entre recortes. A etapa 13 ' +
        'usa esses ρ como peso de bloco — alto, médio, baixo — e nunca multiplica nota por ρ.</p></div>'
      : '');
}

function pcMalaSvg(mets, medFisico, medMudou, medFicou) {
  if (!mets.length) return ptFalta('o bloco `tecnico.metricas` chegou vazio');
  const L = 230, W = 780, alt = 30, topo = 26, H = topo + mets.length * alt + 16;
  const x = v => L + Math.max(0, Math.min(1, v)) * (W - L - 60);

  const linhas = mets.map((m, i) => {
    const y = topo + i * alt;
    const perdeu = m.rho_mudou < m.rho_ficou;
    return '<g><title>' + esc(m.metrica + ' · mudou ' + ptNum(m.rho_mudou, 3) + ' (n ' + m.n_mudou +
        ') · ficou ' + ptNum(m.rho_ficou, 3) + ' (n ' + m.n_ficou + ')') + '</title>' +
      '<text x="' + (L - 10) + '" y="' + (y + 13) + '" text-anchor="end" style="font-size:11px;fill:var(--tinta2)">' +
        esc(m.metrica) + '</text>' +
      '<rect x="' + L + '" y="' + (y + 1) + '" width="' + (x(m.rho_mudou) - L).toFixed(1) + '" height="9" rx="2" ' +
        'style="fill:var(--pt-alto)"></rect>' +
      '<rect x="' + L + '" y="' + (y + 12) + '" width="' + (x(m.rho_ficou) - L).toFixed(1) + '" height="9" rx="2" ' +
        'style="fill:var(--tinta3);opacity:.55"></rect>' +
      '<text x="' + (x(Math.max(m.rho_mudou, m.rho_ficou)) + 7).toFixed(1) + '" y="' + (y + 15) +
        '" style="font-size:10px;fill:' + (perdeu ? 'var(--pt-baixo)' : 'var(--pt-ok)') +
        ';font-variant-numeric:tabular-nums">' +
        esc(ptNum(m.rho_mudou, 3) + ' / ' + ptNum(m.rho_ficou, 3)) + '</text>' +
      '</g>';
  }).join('');

  const linhaRef = (valor, rot, tracejado) => valor === null || valor === undefined ? '' :
    '<g><line x1="' + x(valor).toFixed(1) + '" y1="' + (topo - 8) + '" x2="' + x(valor).toFixed(1) +
      '" y2="' + (topo + mets.length * alt) + '" style="stroke:var(--tinta3);stroke-width:1' +
      (tracejado ? ';stroke-dasharray:3 3' : '') + ';opacity:.7"></line>' +
    '<text x="' + (x(valor) + 4).toFixed(1) + '" y="' + (topo - 12) + '" style="font-size:9.5px;fill:var(--tinta3)">' +
      esc(rot) + '</text></g>';

  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="display:block;overflow:visible">' +
    '<text x="' + L + '" y="12" style="font-size:9.5px;fill:var(--pt-alto)">■ mudou de clube</text>' +
    '<text x="' + (L + 120) + '" y="12" style="font-size:9.5px;fill:var(--tinta3)">■ ficou no mesmo clube</text>' +
    linhaRef(medFisico, 'mediana do físico', true) +
    linhas +
    '</svg>';
}

/* ================================================================================
   ETAPA 12 — O FUNIL DOS LIVRES
   ================================================================================

   A cascata é clicável porque cada degrau apaga milhares de nomes, e um número que apaga
   milhares de nomes precisa poder ser aberto. Cada degrau mostra quem saiu, e quanto saiu de
   cada bloco (Série B, sul-americanos, resto do Brasil) — a conta é feita aqui, subtraindo
   o degrau anterior, porque o JSON traz os restantes e não as perdas.

   O aviso central: a data de vencimento não seleciona ninguém — quase toda a janela cai no
   mesmo mês, porque é o calendário brasileiro que manda nela. A
   seletividade da lista vem da nota, não da data de vencimento do contrato. */
function ptEtapa12(alvo, dados) {
  PC.et12 = PC.et12 === null ? -1 : PC.et12;
  pcEt12Desenhar(alvo, dados);
}

function pcEt12Desenhar(alvo, d) {
  const deg = d.degraus || [];
  const n0 = deg.length ? deg[0].n : 0;
  const semFisico = d.ligas_sem_cobertura_fisica || [];
  const porLiga = d.por_liga || {};
  const cc = d.conferencia_cruzada || null;

  /* A cascata. A largura de cada degrau é a fração do arquivo inteiro que ele ainda tem —
     é a única forma de o 603 do último degrau parecer o que ele é ao lado do 40.059. */
  const cascata = deg.map((g, i) => {
    const frac = n0 ? (g.n / n0) * 100 : 0;
    const aberto = PC.et12 === i;
    return '<button type="button" data-pc="et12" data-v="' + i + '" style="' +
      'display:block;width:100%;text-align:left;font:inherit;cursor:pointer;background:transparent;' +
      'border:0;border-left:3px solid ' + (aberto ? 'var(--pt-alto)' : 'transparent') + ';padding:7px 0 7px 10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px">' +
        '<span style="font-size:12px;color:var(--tinta2)"><code>' + esc(g.degrau) + '</code>' +
          (aberto ? ' ▾' : ' ▸') + '</span>' +
        '<b style="font-size:15px;font-variant-numeric:tabular-nums">' + ptInt(g.n) + '</b>' +
      '</div>' +
      '<div style="height:9px;background:var(--veu2);border-radius:5px;margin-top:4px;overflow:hidden">' +
        '<i style="display:block;height:100%;width:' + frac.toFixed(2) + '%;background:var(--pt-alto);' +
        'opacity:' + (aberto ? '1' : '.62') + '"></i></div>' +
      (g.saiu ? '<span style="font-size:10.5px;color:var(--pt-baixo)">−' + ptInt(g.saiu) +
        ' neste degrau · ' + ptPct(n0 ? (g.saiu / n0) * 100 : null) + ' do arquivo</span>' : '') +
      '</button>';
  }).join('');

  const detalhe = PC.et12 >= 0 && deg[PC.et12] ? pcEt12Detalhe(deg, PC.et12, d) : '';

  const tabLigas = ptTabela({
    id: 'ptEt-12-ligas',
    ordem: { col: 'pool', dir: 'desc' },
    vazio: 'o JSON não trouxe `por_liga`',
    colunas: [
      { k: 'liga', rot: 'liga', tipo: 'texto' },
      { k: 'n', rot: 'no arquivo', casas: 0 },
      { k: 'com_psv', rot: 'com dado físico', casas: 0 },
      { k: '_cob', rot: 'cobertura física', fmt: (v, l) => l.n ? ptPct((l.com_psv / l.n) * 100) : ptFalta('liga sem linha no arquivo') },
      { k: 'pool', rot: 'no pool operacional', casas: 0 },
      { k: '_marca', rot: 'situação', tipo: 'texto',
        fmt: (v, l) => l._sem
          ? '<b style="color:var(--coral)">sem base para pontuar</b>'
          : '<span style="color:var(--tinta3)">entra na esteira</span>' },
    ],
    linhas: Object.keys(porLiga).map(k => Object.assign({ liga: k, _sem: semFisico.indexOf(k) >= 0 }, porLiga[k])),
  });

  const pool = d.pool || {};
  const posicoes = pool.por_posicao || {};
  const menorPos = Object.keys(posicoes).sort((a, b) => posicoes[a] - posicoes[b])[0];

  alvo.innerHTML =
    '<div class="pt-controle" style="border-left:3px solid var(--coral)">' +
      '<span class="pt-rot">a ressalva que precede a lista inteira</span>' +
      '<p class="pt-nota" style="font-size:13.5px;color:var(--tinta);margin-top:5px">' +
        '<b>A data de vencimento do contrato não seleciona ninguém.</b> Dos <b>' +
        ptInt(d.vencem_na_janela) + '</b> contratos que vencem na janela inteira, <b>' +
        ptInt(d.vencem_exatamente_em_dez26) + '</b> — <b>' + ptPct(d.pct_da_janela_em_dez26) +
        '</b> deles — caem todos no mesmo mês, o que dá nome à chave ' +
        '<code>vencem_exatamente_em_dez26</code>. É o calendário brasileiro, não uma janela de ' +
        'oportunidade, e um filtro que mantém essa fatia da janela não filtrou nada. ' +
        'A seletividade desta lista vem da nota da etapa 13, não do contrato.</p>' +
    '</div>' +

    ptCard('A cascata, degrau por degrau',
      'clique em um degrau para ver quem saiu' + (d.periodo_da_base ? ' · base <code>' + esc(d.periodo_da_base) + '</code>' : ''),
      '<div>' + cascata + '</div>' + detalhe,
      'O JSON traz o nome da chave de cada degrau e as contagens que sobraram; ' +
      ptFalta('o critério de corte de cada degrau (quais ligas, qual intervalo de contrato, qual mínimo de ' +
        'minutos) não viaja no `etapa_12.degraus` — só o nome da chave e os totais') +
      '. As perdas por bloco que aparecem ao abrir um degrau são calculadas na tela, subtraindo o degrau ' +
      'anterior: o dado guarda quem ficou, não quem saiu.') +

    ptCard('Cobertura física por liga',
      ptInt(semFisico.length) + ' de ' + ptInt(Object.keys(porLiga).length) + ' ligas sem um único atleta rastreado',
      tabLigas,
      'Liga sem cobertura física não recebe nota fraca: não recebe nota. A nota da etapa 13 cairia inteira ' +
      'no bloco técnico, que é justamente o que a etapa 11 mostrou não viajar com o atleta. Emitir nota só ' +
      'técnica com cara de nota completa seria o erro mais caro possível nesta aba. Ligas marcadas: ' +
      pcLista(semFisico) + '.') +

    ptCard('O que sobrou no pool operacional',
      ptN(pool.n, 'atletas') + ' · ' + ptInt(pool.serie_b) + ' da Série B e ' + ptInt(pool.sul_americanos) +
        ' sul-americanos',
      pcGrade(260,
        '<div><span class="pt-rot">por liga</span>' + pcBarrinhas(pool.por_liga) + '</div>' +
        '<div><span class="pt-rot">por posição</span>' + pcBarrinhas(posicoes) + '</div>'),
      (menorPos
        ? 'A posição mais escassa é <code>' + esc(menorPos) + '</code>, com ' + ptInt(posicoes[menorPos]) +
          ' no pool inteiro. Isso não é detalhe de listagem: é o denominador de uma vaga da etapa 14, e uma ' +
          'vaga com denominador pequeno produz "recomendação" que é quase sorteio.'
        : '')) +

    (cc ? pcEt12Conferencia(cc) : ptFaltaBloco('A conferência cruzada de contrato não veio',
      'o JSON não trouxe `etapa_12.conferencia_cruzada`. Sem ela não há como dizer o quanto a data de ' +
      'contrato desta base bate com uma fonte independente — e aceitar fonte única de contrato é exatamente ' +
      'onde um erro de data vira uma proposta errada.'));

  pcLigarBotoes(alvo, 'et12', v => {
    const i = Number(v);
    PC.et12 = PC.et12 === i ? -1 : i;
    pcEt12Desenhar(alvo, d);
  });
  ptLigarTabelas(alvo);
}

function pcEt12Detalhe(deg, i, d) {
  const g = deg[i], ant = i > 0 ? deg[i - 1] : null;
  /* `nao_brasileiros` entrou quando se mediu que o rótulo antigo do primeiro degrau mentia: os
     36.446 eram o mundo inteiro menos o Brasil. Do segundo degrau em diante os dois convivem —
     depois do filtro de ligas o recorte sul-americano volta a querer dizer o que diz. O filtro
     por `!== undefined` logo abaixo faz cada degrau mostrar só o que ele tem. */
  const blocos = ['serie_b', 'nao_brasileiros', 'sul_americanos', 'brasil'];
  const rot = { serie_b: 'Série B', nao_brasileiros: 'não brasileiros',
                sul_americanos: 'sul-americanos', brasil: 'resto do Brasil' };
  const linhas = blocos.filter(b => g[b] !== undefined).map(b => {
    const saiu = ant && ant[b] !== undefined ? ant[b] - g[b] : null;
    return '<div style="display:flex;justify-content:space-between;gap:10px;padding:4px 0;' +
      'border-bottom:1px solid var(--borda)">' +
      '<span style="font-size:12px;color:var(--tinta2)">' + rot[b] + '</span>' +
      '<span style="font-size:12px;font-variant-numeric:tabular-nums">' +
        '<b>' + ptInt(g[b]) + '</b> ficaram' +
        (saiu === null ? '' : ' · <span style="color:var(--pt-baixo)">−' + ptInt(saiu) + '</span>') +
      '</span></div>';
  }).join('');

  return '<div style="margin-top:10px;padding:11px 13px;background:var(--veu2);border-radius:8px">' +
    '<span class="pt-rot">degrau <code>' + esc(g.degrau) + '</code></span>' +
    '<p class="pt-nota" style="margin-top:5px">' +
      (ant
        ? 'Entraram <b>' + ptInt(ant.n) + '</b>, saíram <b>' + ptInt(g.saiu) + '</b>, ficaram <b>' +
          ptInt(g.n) + '</b> — ' + ptPct(ant.n ? (g.n / ant.n) * 100 : null) + ' do degrau anterior.'
        : 'É o arquivo inteiro, antes de qualquer corte: <b>' + ptInt(g.n) + '</b> jogadores' +
          (d.periodo_da_base ? ' na base <code>' + esc(d.periodo_da_base) + '</code>' : '') + '.') +
    '</p>' + linhas +
    '<p class="pt-nota" style="font-size:11px;margin-top:7px">' +
      ptFalta('o critério deste degrau não está no JSON: a chave <code>' + esc(g.degrau) + '</code> é tudo ' +
        'o que o dado diz sobre por que estes nomes saíram') + '</p>' +
    '</div>';
}

function pcBarrinhas(mapa) {
  const chaves = Object.keys(mapa || {});
  if (!chaves.length) return ptFalta('este bloco não veio no JSON');
  const max = pcMax(chaves.map(k => mapa[k]));
  return chaves.sort((a, b) => mapa[b] - mapa[a]).map(k =>
    ptBarra(mapa[k], max, { rot: k, texto: ptInt(mapa[k]) })).join('');
}

function pcEt12Conferencia(cc) {
  const conf = cc.por_confianca || {};
  const tab = ptTabela({
    id: 'ptEt-12-conf',
    ordem: { col: 'pct', dir: 'desc' },
    vazio: 'sem quebra por confiança no JSON',
    colunas: [
      { k: 'faixa', rot: 'confiança do contrato', tipo: 'texto' },
      { k: 'bate', rot: 'datas que batem', casas: 0 },
      { k: 'de', rot: 'conferidos', casas: 0 },
      { k: 'pct', rot: 'concordância', fmt: v => ptPct(v) },
    ],
    linhas: Object.keys(conf).map(k => Object.assign({ faixa: k }, conf[k])),
  });
  const geral = cc.geral || {};
  const ponte = cc.por_ponte || {};
  /* A discordância é a conta que faltava na tela: o card imprimia a concordância lida do JSON
     e emendava uma conclusão escrita à mão sobre o que ela significava ("na maior parte dos
     nomes as duas fontes discordam"). O complemento e a contagem absoluta dizem a mesma
     coisa sem ninguém precisar acreditar na frase — e continuam dizendo se o número mudar. */
  const discPct = (geral.pct === null || geral.pct === undefined) ? null : 100 - Number(geral.pct);
  const discN = (geral.de === null || geral.de === undefined || geral.bate === null || geral.bate === undefined)
    ? null : Number(geral.de) - Number(geral.bate);
  return ptCard('A data de contrato bate com a outra fonte?',
    (cc.fonte ? esc(cc.fonte) : 'fonte não declarada no JSON'),
    pcGrade(170,
      pcNumeroSolto('concordância geral', ptPct(geral.pct),
        ptInt(geral.bate) + ' de ' + ptInt(geral.de)) +
      Object.keys(ponte).map(k => pcNumeroSolto('ponte por ' + esc(k), ptPct(ponte[k].pct),
        ptInt(ponte[k].bate) + ' de ' + ptInt(ponte[k].de))).join('') +
      pcNumeroSolto('homônimos descartados', ptInt(cc.homonimos_descartados),
        'antes de cruzar, para o merge não inflar') +
      pcNumeroSolto('contratos com data já vencida', ptInt(cc.contrato_ate_2022_2025),
        'a chave <code>contrato_ate_2022_2025</code> do JSON')) +
    '<div style="margin-top:11px">' + tab + '</div>',
    'Este é o número que decide se a lista inteira vale: <b>' + ptPct(geral.pct) + '</b> de concordância ' +
    'geral' +
    (discPct !== null
      ? ' — e o complemento, <b>' + ptPct(discPct) + '</b>' +
        (discN !== null ? ' (' + ptInt(discN) + ' de ' + ptInt(geral.de) + ' datas conferidas)' : '') +
        ', é a fatia em que as duas fontes não dizem a mesma data de fim de contrato.'
      : '. ' + ptFalta('o JSON não trouxe a concordância geral, então a discordância não pode ser calculada') +
        '.') +
    ' A quebra por confiança mostra onde a discordância mora — e é por isso que o degrau de confiança do ' +
    'funil existe, mesmo derrubando milhares de nomes.');
}

/* ================================================================================
   ETAPA 13 — A NOTA DE ENCAIXE, EM TRÊS PEDAÇOS
   ================================================================================

   Três regras desta etapa vêm do próprio dado e não podem ser negociadas na tela:

   1. `nunca_somar: true` — os três blocos aparecem separados. Somar esconde justamente a
      informação que custou mais caro: as coberturas são diferentes e o bloco que menos viaja
      com o atleta é o que mais tem dado.
   2. O `sc_n` anda colado em todo número físico. Um atleta com nove partidas rastreadas e
      outro com trinta não podem sair na mesma tipografia.
   3. O backtest vai no CABEÇALHO, não no rodapé. É o único número da aba que testa a
      ordenação que o clube vai usar para assinar contrato — e o resultado dele é o que é. */
function ptEtapa13(alvo, dados) {
  PC.et13 = PC.et13 || { setor: null };
  if (PC.et13.setor === null) {
    const setores = Object.keys(dados.alvos_por_setor || {}).filter(k => k.charAt(0) !== '_');
    PC.et13.setor = setores.length ? setores[0] : null;
  }
  pcEt13Desenhar(alvo, dados);
}

function pcEt13Desenhar(alvo, d) {
  const bt = d.backtest || null;
  const alfa = pcAlfa();
  const setores = Object.keys(d.alvos_por_setor || {}).filter(k => k.charAt(0) !== '_');
  const nClube = (d.alvos_por_setor || {})._n_clube_por_cenario || null;
  const cands = d.candidatos || [];

  /* O veredito do backtest é calculado. Se um dia a nota passar a separar minutos, a frase
     muda sozinha — e se continuar não separando, ela continua dizendo isso na cara. */
  const sepMinutos = bt && pcPassa(bt.p_minutos);
  const sepPermanencia = bt && pcPassa(bt.p_permanencia);
  const veredito = !bt ? '' :
    (sepMinutos || sepPermanencia
      ? '<b>A nota separou.</b> ' +
        (sepMinutos ? 'Minutos no ano da chegada: ' + ptD(bt.d_minutos) + ', ' + ptP(bt.p_minutos) + '. ' : '') +
        (sepPermanencia ? 'Permanência no ano seguinte: ' + ptPct(bt.permanencia_recomendados_pct) +
          ' contra ' + ptPct(bt.permanencia_reprovados_pct) + ', ' + ptP(bt.p_permanencia) + '.' : '')
      : '<b>A nota não separou nada.</b> Os recomendados jogaram ' + ptNum(bt.min_medio_recomendados, 0) +
        ' minutos em média (' + ptN(bt.n_recomendados, 'chegadas') + ') contra ' +
        ptNum(bt.min_medio_reprovados, 0) + ' dos reprovados (' + ptN(bt.n_reprovados, 'chegadas') +
        '): d ' + ptD(bt.d_minutos) + ', ' + ptP(bt.p_minutos) + '. Na permanência do ano seguinte, ' +
        ptPct(bt.permanencia_recomendados_pct) + ' contra ' + ptPct(bt.permanencia_reprovados_pct) + ', ' +
        ptP(bt.p_permanencia) + '. E a correlação entre a nota e os minutos é ' +
        ptNum(bt.rho_nota_x_minutos, 3) + ' (' + ptP(bt.p_rho) + ').' +
        /* "passa de X" em português é ULTRAPASSAR X, e os dois p ultrapassam o alfa com folga:
           escrito assim, o fecho do backtest dizia o contrário dos números que ele acabara de
           imprimir. O que os p sustentam é que nenhum dos dois FICA ABAIXO do alfa. */
        (alfa !== null ? ' Nenhum dos dois desfechos fica abaixo de ' + ptNum(alfa, 2) + '.' : ''));

  const cabecalhoBacktest = bt
    ? '<div class="pt-controle" style="border-left:3px solid ' +
        (sepMinutos || sepPermanencia ? 'var(--pt-ok)' : 'var(--coral)') + '">' +
        '<span class="pt-rot">o backtest da nota — no cabeçalho, porque é o número que decide se o resto vale</span>' +
        '<p class="pt-nota" style="font-size:13.5px;color:var(--tinta);margin-top:6px">' + veredito + '</p>' +
        pcGrade(160,
          pcNumeroSolto('chegadas pontuáveis', ptInt(bt.chegadas_pontuaveis),
            'de ' + ptInt(bt.chegadas_definicao_ampla) + ' na definição ampla') +
          pcNumeroSolto('chegadas com nota', ptInt(bt.chegadas_com_nota),
            'cobertura física ' + ptPct(bt.cobertura_fisica_pct)) +
          pcNumeroSolto('permanências', ptInt(bt.permanencias), 'o segundo desfecho medido') +
          pcNumeroSolto('corte da recomendação', ptNum(bt.corte_mediana, 4), 'a mediana da margem')) +
        '<p class="pt-nota">' + (bt.o_que_mede ? '<b>O que o backtest mede:</b> ' + esc(bt.o_que_mede) + '. ' : '') +
          (bt.nota ? esc(bt.nota) + '.' : '') + '</p>' +
        '<p class="pt-nota">Este resultado fica no topo da etapa por decisão de método: um ranking cuja ' +
          'ordenação nunca foi conferida, protegido por uma parede de estatística que é toda sobre outra ' +
          'coisa, é exatamente o produto que esta aba existe para não entregar.</p>' +
      '</div>'
    : ptFaltaBloco('O backtest da nota não veio no JSON',
        'sem `etapa_13.backtest` a tela publicaria um ranking cuja ordenação ninguém testou. A ausência ' +
        'fica aqui, no cabeçalho, no lugar exato onde o resultado deveria estar.');

  /* Controle 1. A nota não tem AUC comparável ao do dinheiro, e o motivo é de desenho: ela é
     testada contra permanência e minutos do atleta, não contra subida do clube. */
  const baseline = ptBaseline({
    rotulo: 'a nota de encaixe',
    auc: null,
    motivo: bt
      ? 'o backtest desta nota mede ' + esc(bt.o_que_mede || 'outro desfecho') + ' — minutos e permanência do ' +
        'ATLETA, não subida do CLUBE. Não existe AUC comparável ao do posto de valor, e o que existe está ' +
        'no bloco acima'
      : 'não há backtest no JSON, portanto não há nada para comparar com o AUC do posto de valor',
  });

  const pesos = d.pesos || {};
  const blocos = Object.keys(pesos).map(k => {
    const p = pesos[k];
    const faixa = p.rho_ao_trocar_de_clube || [];
    return '<div style="padding:12px 13px;border:1px solid var(--borda);border-radius:8px">' +
      '<span class="pt-rot">bloco</span>' +
      '<b style="display:block;font-size:16px;margin:3px 0 6px">' + esc(k) + '</b>' +
      '<div style="font-size:12px;color:var(--tinta2)">ρ ao trocar de clube: <b>' +
        (faixa.length === 2 ? ptNum(faixa[0], 2) + ' – ' + ptNum(faixa[1], 2)
          : ptFalta('faixa de ρ não declarada para este bloco')) + '</b></div>' +
      '<div style="font-size:12px;color:var(--tinta2);margin-top:3px">peso: <b>' + esc(p.peso) + '</b></div>' +
      '</div>';
  }).join('');

  const cardPesos = ptCard('Três notas, e a regra de nunca somá-las',
    (d.nunca_somar ? '<b style="color:var(--coral)">nunca_somar: o JSON proíbe o número único</b>' :
      'o JSON não traz a regra `nunca_somar`'),
    pcGrade(200, blocos),
    'O peso de cada bloco é o quanto ele comprovadamente acompanha o atleta quando ele troca de clube — ' +
    'a medida está na etapa 11. ' +
    (d.nunca_somar
      ? 'Somar os três num número só esconde que as coberturas são diferentes: o bloco que menos viaja com ' +
        'o atleta é justamente o que tem mais dado disponível, e a soma daria a ele o peso do volume.'
      : ''));

  const setor = PC.et13.setor;
  const alvos = setor && d.alvos_por_setor ? d.alvos_por_setor[setor] : null;
  const cardAlvos = pcEt13Alvos(setor, alvos, setores, nClube);

  const cardCands = pcEt13Candidatos(d, cands, setor);

  const gk = d.trilha_goleiro || null;

  alvo.innerHTML =
    cabecalhoBacktest +
    baseline +
    cardPesos +
    cardAlvos +
    cardCands +
    (gk ? pcEt13Goleiro(gk, d) : ptFaltaBloco('A trilha do goleiro não veio',
      'o JSON não trouxe `etapa_13.trilha_goleiro`, e o goleiro não pode simplesmente sumir da tela: ele ' +
      'está fora da esteira principal por uma razão que precisa ficar escrita.'));

  pcLigarBotoes(alvo, 'et13setor', v => { PC.et13.setor = v; pcEt13Desenhar(alvo, d); });
  ptLigarTabelas(alvo);
}

function pcEt13Alvos(setor, alvos, setores, nClube) {
  if (!setores.length) {
    return ptFaltaBloco('Não há alvos por setor no JSON',
      'sem `alvos_por_setor` não existe alvo para o qual pontuar: a nota mede distância a um perfil, e o ' +
      'perfil é isto.');
  }
  const botoes = pcBotoes('et13setor', setores.map(s => ({ v: s, rot: esc(s) })), setor);
  if (!alvos) {
    return ptCard('O alvo de cada setor', 'setor sem bloco no JSON', botoes +
      ptFalta('o setor selecionado não tem indicadores no `alvos_por_setor`'));
  }
  const chaves = Object.keys(alvos);
  const linhas = chaves.map(k => Object.assign({ k: k }, alvos[k]));
  const maxAtletas = pcMax(linhas.map(l => l.n_atletas_serie_b || 0));
  const sobrevivemBH = linhas.filter(l => l.bh_clube).length;
  const sobrevivemAtleta = linhas.filter(l => l.bh_atleta).length;

  const tab = ptTabela({
    id: 'ptEt-13-alvos',
    ordem: { col: 'p_clube', dir: 'asc' },
    vazio: 'este setor não tem indicador nenhum',
    colunas: [
      { k: 'k', rot: 'indicador', tipo: 'texto' },
      { k: 'menor', rot: 'lado bom', tipo: 'texto',
        fmt: v => v ? 'menos é melhor' : 'mais é melhor' },
      { k: 'd_clube', rot: 'd por clube', fmt: v => ptD(v),
        dica: 'teste com o CLUBE como unidade' + (nClube && nClube.sobe && nClube.cai
          ? ' — ' + ptInt(nClube.sobe) + ' que subiram contra ' + ptInt(nClube.cai) + ' que caíram' : '') +
          ', que é o que não pseudorreplica' },
      { k: 'p_clube', rot: 'p por clube', fmt: v => ptPv(v) },
      { k: 'q_clube', rot: 'q de BH', fmt: v => ptPv(v) },
      { k: 'bh_clube', rot: 'passa BH por clube', tipo: 'texto',
        fmt: v => v ? '<b style="color:var(--pt-ok)">sim</b>' : '<span style="color:var(--tinta3)">não</span>' },
      { k: 'bh_atleta', rot: 'passa BH por atleta', tipo: 'texto',
        fmt: v => v ? 'sim' : 'não',
        dica: 'o teste por atleta pseudorreplica: até ' + ptInt(maxAtletas) + ' atletas dentro de' +
          (nClube && nClube.sobe ? ' ' + ptInt(nClube.sobe) : ' poucos') + ' clube-temporada' },
      { k: 'pct_sobe', rot: 'quem subiu', fmt: v => ptPct(v) },
      { k: 'pct_cai', rot: 'quem caiu', fmt: v => ptPct(v) },
      { k: 'pct_caro', rot: 'promovidos caros', fmt: v => ptPct(v) },
      { k: 'pct_barato', rot: 'promovidos baratos', fmt: v => ptPct(v) },
      { k: 'n_atletas_serie_b', rot: 'atletas na Série B', casas: 0 },
    ],
    linhas: linhas,
  });

  return ptCard('O alvo de cada setor, medido com o clube como unidade',
    ptInt(chaves.length) + ' indicadores no setor <code>' + esc(setor) + '</code>' +
      (nClube ? ' · ' + Object.keys(nClube).map(k => esc(k) + ' ' + ptInt(nClube[k])).join(' · ') : ''),
    botoes + tab,
    '<b>' + ptInt(sobrevivemBH) + '</b> dos ' + ptInt(chaves.length) + ' indicadores deste setor sobrevivem à ' +
    'correção de Benjamini-Hochberg quando a unidade é o CLUBE; <b>' + ptInt(sobrevivemAtleta) + '</b> ' +
    'sobrevivem quando a unidade é o atleta. A diferença entre os dois números é o tamanho da ' +
    'pseudorreplicação: centenas de atletas dentro de ' +
    (nClube && nClube.sobe ? ptInt(nClube.sobe) + ' clubes que subiram' : 'poucos clubes') +
    ' produzem p pequeno sem que exista informação nova. ' +
    'Os percentuais de quem subiu, de quem caiu e dos promovidos caros e baratos são os alvos: a nota mede ' +
    'DISTÂNCIA a eles, e não "quanto mais melhor" — quem está acima do alvo em tudo não encaixa melhor, ' +
    'encaixa diferente.');
}

function pcEt13Candidatos(d, cands, setor) {
  const semFisicoLigas = ((typeof PROTO !== 'undefined' && PROTO.etapa_12 &&
    PROTO.etapa_12.ligas_sem_cobertura_fisica) || []);
  const ligasNoPool = {};
  cands.forEach(c => { ligasNoPool[c.liga] = (ligasNoPool[c.liga] || 0) + 1; });
  const ligasSemBase = Object.keys(ligasNoPool).filter(l => semFisicoLigas.indexOf(l) >= 0);

  const doSetor = cands.filter(c => c.setor === setor);
  const semSetor = cands.filter(c => !c.setor);
  const posSemSetor = [];
  semSetor.forEach(c => { if (c.pos && posSemSetor.indexOf(c.pos) < 0) posSemSetor.push(c.pos); });
  const gkNoPool = (d.trilha_goleiro || {}).no_pool_operacional;
  const batemComGk = gkNoPool !== null && gkNoPool !== undefined && Number(gkNoPool) === semSetor.length;
  const semNotaFisica = doSetor.filter(c => !c.nota_fisica || c.nota_fisica.indicadores_usados === 0);
  /* O critério da nota física não é um só: parte dos atletas é pontuada pelos indicadores que
     passaram no teste por clube, e parte cai para os sobreviventes do teste por atleta, que é
     pseudorreplicado. Quantos caíram para o critério fraco é contagem, e vai para a tela. */
  const criterios = {};
  doSetor.forEach(c => {
    const k = (c.nota_fisica && c.nota_fisica.criterio) || 'sem critério declarado';
    criterios[k] = (criterios[k] || 0) + 1;
  });

  /* As linhas da tabela saem antes da tabela porque a tela precisa MEDIR o que vai desenhar.
     A ordenação padrão é por margem, e no setor da zaga a margem é calculada sobre um único
     indicador: o resultado é um punhado de valores possíveis repetidos dezenas de vezes. A
     tabela, ordenada, tem toda a cara de um ranking — e não é: dentro do empate a ordem é a
     que o array trouxe. Quem confia nessa ordem escolhe um atleta em vez de outro por nada. */
  const linhasTab = doSetor.map(c => Object.assign({
    _margem: c.nota_fisica ? c.nota_fisica.margem : null,
    _duelo: c.nota_duelo ? c.nota_duelo.percentil_medio : null,
    _estilo: c.nota_estilo ? c.nota_estilo.percentil_medio : null,
    _classe: c.confianca && c.confianca.barrado_do_ranking ? 'fraco' : '',
    _dica: c.confianca && c.confianca.barrado_do_ranking
      ? 'barrado do ranking pela nota de confiança: sc_n = ' + c.confianca.sc_n
      : '',
  }, c));

  const margens = linhasTab.map(l => l._margem).filter(v => v !== null && v !== undefined);
  const vezes = {};
  margens.forEach(v => { vezes[v] = (vezes[v] || 0) + 1; });
  const distintas = Object.keys(vezes);
  const maiorEmpate = distintas.sort((a, b) => vezes[b] - vezes[a])[0];
  const emEmpate = margens.filter(v => vezes[v] > 1).length;
  /* Quantos indicadores o bloco físico deste setor tem é o que explica o empate, e está no
     próprio registro do atleta (`nota_fisica.indicadores_no_bloco`) — não é constante do
     arquivo, é leitura. */
  const indsNoBloco = [];
  doSetor.forEach(c => {
    const n = c.nota_fisica ? c.nota_fisica.indicadores_no_bloco : null;
    if (n !== null && n !== undefined && indsNoBloco.indexOf(n) < 0) indsNoBloco.push(n);
  });

  /* O tom do aviso é proporcional ao que foi medido, e o critério é uma relação entre dois
     números da própria tela (a maioria das linhas está empatada, ou não), não um corte
     escolhido a dedo: onde o empate é maioria a ordenação é ruído com cara de ranking; onde
     não é, ela ainda tem trechos em que a posição não quer dizer nada. */
  const empateEhMaioria = emEmpate * 2 > margens.length;
  const avisoEmpate = (maiorEmpate !== undefined && vezes[maiorEmpate] > 1)
    ? '<p class="pt-nota" style="margin-top:0">' +
      (empateEhMaioria
        ? '<b style="color:var(--coral)">Esta tabela abre ordenada por margem, e a ordem engana: a maior ' +
          'parte das linhas está empatada.</b> '
        : '<b>Esta tabela abre ordenada por margem, e parte dessa ordem é empate.</b> ') +
      ptInt(margens.length) + ' candidatos deste setor têm margem, e entre eles há <b>' +
      ptInt(distintas.length) + '</b> ' +
      (distintas.length === 1 ? 'valor distinto' : 'valores distintos') + ': <b>' + ptInt(emEmpate) +
      '</b> ' + (emEmpate === 1 ? 'cai' : 'caem') + ' sobre um valor que se repete, e o maior empate sozinho ' +
      'reúne <b>' + ptInt(vezes[maiorEmpate]) + '</b> atletas na mesma margem ' + ptNum(Number(maiorEmpate), 3) +
      '. ' +
      (indsNoBloco.length === 1
        ? 'A nota física deste setor sai de <b>' + ptInt(indsNoBloco[0]) + '</b> ' +
          (indsNoBloco[0] === 1 ? 'indicador' : 'indicadores') + ', e é desse número que vem a quantidade ' +
          'de margens diferentes que o setor consegue produzir. '
        : indsNoBloco.length
          ? 'A nota física deste setor sai de ' + pcLista(indsNoBloco.map(n => ptInt(n))) + ' indicadores, ' +
            'dependendo do atleta, e é desse número que vem a quantidade de margens diferentes possíveis. '
          : ptFalta('o JSON não diz quantos indicadores entram no bloco físico deste setor') + '. ') +
      'Dentro de um empate a posição na tabela não significa nada: não é desempate, é a ordem em que os ' +
      'nomes chegaram no array.</p>'
    : '';

  const tab = ptTabela({
    id: 'ptEt-13-cand',
    ordem: { col: '_margem', dir: 'desc' },
    vazio: 'nenhum candidato neste setor',
    colunas: [
      { k: 'nome', rot: 'atleta', tipo: 'texto' },
      { k: 'clube', rot: 'clube', tipo: 'texto' },
      { k: 'liga', rot: 'liga', tipo: 'texto' },
      { k: 'pos', rot: 'posição', tipo: 'texto' },
      { k: 'idade', rot: 'idade', casas: 0 },
      { k: 'min', rot: 'minutos', casas: 0 },
      { k: '_margem', rot: 'nota física (margem)', tipo: 'texto',
        dica: 'proximidade ao vetor de quem sobe menos proximidade ao vetor de quem cai, dentro do setor',
        fmt: (v, l) => {
          const nf = l.nota_fisica || {};
          if (v === null || v === undefined) {
            return ptFalta(nf.criterio
              ? 'sem base para pontuar o físico: ' + nf.criterio
              : 'sem nota física e sem critério declarado no JSON');
          }
          return '<b>' + ptNum(v, 3) + '</b> <span class="pt-n">sc_n = ' + ptInt(l.sc_n) + '</span>' +
            '<small style="display:block;color:var(--tinta3)">' + ptInt(nf.indicadores_usados) + ' de ' +
            ptInt(nf.indicadores_no_bloco) + ' indicadores</small>';
        } },
      { k: '_duelo', rot: 'duelo (percentil)', tipo: 'texto',
        fmt: (v, l) => {
          const b = l.nota_duelo || {};
          if (b.percentil_medio === null || b.percentil_medio === undefined) {
            return ptFalta('nenhum dos ' + ptInt(b.indicadores_no_bloco) + ' indicadores de duelo tinha dado');
          }
          return ptNum(b.percentil_medio, 0) + '<small style="display:block;color:var(--tinta3)">' +
            ptInt(b.indicadores_usados) + ' de ' + ptInt(b.indicadores_no_bloco) + '</small>';
        } },
      { k: '_estilo', rot: 'estilo (percentil)', tipo: 'texto',
        dica: 'este número mede em boa parte o time anterior do atleta',
        fmt: (v, l) => {
          const b = l.nota_estilo || {};
          if (b.percentil_medio === null || b.percentil_medio === undefined) {
            return ptFalta('nenhum dos ' + ptInt(b.indicadores_no_bloco) + ' indicadores de estilo tinha dado');
          }
          return ptNum(b.percentil_medio, 0) + '<small style="display:block;color:var(--tinta3)">' +
            ptInt(b.indicadores_usados) + ' de ' + ptInt(b.indicadores_no_bloco) + '</small>';
        } },
      { k: 'ctc', rot: 'confiança do contrato', tipo: 'texto',
        fmt: (v, l) => esc(v) + ' <span class="pt-n">' + ptInt(l.ctf) + ' fontes</span>' },
      { k: 'mv', rot: 'valor de mercado', fmt: v => v ? ptEur(v) : ptFalta('sem valor de mercado na base') },
      { k: 'sal', rot: 'faixa salarial', tipo: 'texto',
        fmt: v => v ? esc(v) : ptFalta('sem faixa salarial na base') },
    ],
    linhas: linhasTab,
  });

  const setores = [];
  cands.forEach(c => { if (c.setor && setores.indexOf(c.setor) < 0) setores.push(c.setor); });
  const botoes = pcBotoes('et13setor', setores.map(s => ({
    v: s, rot: esc(s) + ' <span class="pt-n">' + ptInt(cands.filter(c => c.setor === s).length) + '</span>',
  })), setor);

  return ptCard('Os candidatos, um por linha, com os três blocos separados',
    ptN(cands.length, 'no pool') + ' · ' + ptInt(doSetor.length) + ' no setor <code>' + esc(setor) + '</code>' +
      (d.barrados_sc_n_menor_8 ? ' · ' + ptInt(d.barrados_sc_n_menor_8) + ' barrados por poucas partidas rastreadas' : ''),
    botoes + avisoEmpate + tab,
    (ligasSemBase.length
      ? '<b style="color:var(--coral)">' + ptInt(ligasSemBase.length) + ' ligas do pool estão na lista de sem ' +
        'cobertura física</b> (' + pcLista(ligasSemBase) + ') — seus atletas aparecem marcados como sem base ' +
        'para pontuar. '
      : 'Nenhuma das <b>' + ptInt(Object.keys(ligasNoPool).length) + '</b> ligas representadas no pool está na ' +
        'lista das <b>' + ptInt(semFisicoLigas.length) + '</b> sem cobertura física da etapa 12 (' +
        pcLista(semFisicoLigas) + '): elas foram eliminadas ANTES, no funil, e é por isso que nenhum atleta ' +
        'delas chega aqui com nota só técnica disfarçada de nota completa. ') +
    (semNotaFisica.length
      ? '<b>' + ptInt(semNotaFisica.length) + '</b> atletas deste setor ficam sem nota física mesmo estando no ' +
        'pool, e a coluna escreve o motivo de cada um. '
      : '') +
    'Critérios da nota física em uso neste setor: ' +
    Object.keys(criterios).map(k => ptInt(criterios[k]) + ' atletas — <i>' + esc(k) + '</i>').join('; ') + '. ' +
    /* A contagem era calculada e a identificação era digitada ("são os goleiros"). A posição
       está no próprio registro do atleta: a tela lê `pos` e escreve o que encontrou, que é
       mais forte do que a afirmação — se um dia entrar sem setor alguém que não é goleiro, a
       frase muda sozinha em vez de continuar mentindo com ar de certeza. */
    (semSetor.length
      ? '<b>' + ptInt(semSetor.length) + '</b> ' +
        (semSetor.length === 1 ? 'atleta do pool não tem' : 'atletas do pool não têm') +
        ' setor e por isso não ' + (semSetor.length === 1 ? 'aparece' : 'aparecem') +
        ' em nenhum destes painéis. A posição ' + (semSetor.length === 1 ? 'dele' : 'deles') +
        ', lida do próprio registro: ' +
        (posSemSetor.length
          ? pcLista(posSemSetor) + '. '
          : ptFalta('o JSON também não traz `pos` para esses atletas') + '. ') +
        (batemComGk
          ? 'São exatamente quantos a trilha do goleiro declara no pool operacional (' + ptInt(gkNoPool) +
            '), logo abaixo — a conferência é feita aqui, comparando as duas contagens. '
          : '')
      : '') +
    (d.casamento_kpis
      ? 'Casamento com a base de KPIs: ' + ptPct(d.casamento_kpis.pct) + ' (' +
        ptInt(d.casamento_kpis.sem_kpi) + ' de ' + ptInt(d.casamento_kpis.pool) + ' sem KPI).'
      : ''));
}

/* A trilha do goleiro é o bloco mais fácil de ler errado da aba inteira, e o motivo é que
   nela convivem DUAS listas com o mesmo nome de "goleiro": os que sobreviveram ao funil da
   etapa 12 e entraram no pool operacional, e os que a trilha técnica desenha na tabela. As
   duas contagens estão no JSON, nenhuma das duas é errada, e a tela precisa reconciliá-las
   antes de desenhar qualquer coisa — senão o subtítulo fala de dois enquanto a tabela mostra
   mais de cem, e quem lê conclui que um dos dois números é mentira.

   A reconciliação é MEDIDA: a tela cruza nome e clube dos candidatos da trilha com os
   candidatos do pool da etapa 13 e diz quantos estão nos dois lugares. E cruza a liga de
   cada um com as ligas que a etapa 12 declarou sem cobertura física, porque a mesma
   ressalva que vale para a esteira principal vale aqui — só que aqui ela ATINGE gente, e a
   tela tem de dizer quanta. */
function pcEt13Goleiro(gk, d) {
  const inds = gk.indicadores || [];
  const cands = gk.candidatos || [];
  const cat = pcCatalogo();

  /* O lado bom de um indicador mora no `sinal` do catálogo da etapa 2. A tela procura lá em
     vez de declarar direção: em `gk_sai` (saídas) ou em `cs` (jogos sem sofrer gol), "mais"
     pode ser virtude do goleiro ou sintoma do time que joga na frente dele, e escolher um
     dos dois seria a tela decidindo o que o estudo não decidiu. Sem sinal no catálogo vai 0,
     que é o valor com que `ptCel` escreve "sem lado bom declarado" no `title`. */
  const pcSinal = k => (cat[k] && cat[k].sinal !== null && cat[k].sinal !== undefined) ? cat[k].sinal : 0;
  const semSinal = inds.filter(k => pcSinal(k) === 0);

  /* As duas contagens, e a interseção medida entre elas. */
  const noPool = gk.no_pool_operacional;
  const poolGeral = (d && d.candidatos) || [];
  const chaveAtleta = c => String(c.nome) + ' · ' + String(c.clube);
  const dentroDoPool = {};
  poolGeral.forEach(c => { dentroDoPool[chaveAtleta(c)] = true; });
  const tambemNoPool = cands.filter(c => dentroDoPool[chaveAtleta(c)]);
  const foraDoPool = cands.length - tambemNoPool.length;

  /* As ligas sem cobertura física, contadas na hora nos dois lados: nesta tabela e no pool
     de linha. É a contagem do pool que sustenta a frase do card de candidatos ("elas foram
     eliminadas ANTES, no funil") — e é a desta tabela que mostra que a trilha do goleiro não
     passou pelo mesmo filtro. */
  const semFisicoLigas = ((typeof PROTO !== 'undefined' && PROTO.etapa_12 &&
    PROTO.etapa_12.ligas_sem_cobertura_fisica) || []);
  const porLigaSemBase = {};
  cands.forEach(c => {
    if (semFisicoLigas.indexOf(c.liga) >= 0) porLigaSemBase[c.liga] = (porLigaSemBase[c.liga] || 0) + 1;
  });
  const ligasSemBase = Object.keys(porLigaSemBase).sort((a, b) => porLigaSemBase[b] - porLigaSemBase[a]);
  const nSemBase = ligasSemBase.reduce((s, k) => s + porLigaSemBase[k], 0);
  const nSemBaseNoPool = poolGeral.filter(c => semFisicoLigas.indexOf(c.liga) >= 0).length;

  const linhas = cands.map(c => {
    const l = { nome: c.nome, clube: c.clube, liga: c.liga, idade: c.idade, min: c.min, ctc: c.ctc, mv: c.mv,
      _com: c.indicadores_com_dado };
    inds.forEach(k => {
      const p = (c.percentis || {})[k];
      l['pc_' + k] = p ? p.percentil : null;
      l['n_' + k] = p ? p.n_na_coorte : null;
    });
    return l;
  });
  const colunas = [
    { k: 'nome', rot: 'goleiro', tipo: 'texto' },
    { k: 'clube', rot: 'clube', tipo: 'texto' },
    { k: 'idade', rot: 'idade', casas: 0 },
    { k: 'min', rot: 'minutos', casas: 0 },
  ].concat(inds.map(k => ({
    k: 'pc_' + k, rot: k, tipo: 'num',
    cel: (v, l) => ptCel(v, {
      n: l['n_' + k], unidade: 'goleiros na coorte', sinal: pcSinal(k),
      motivo: 'este goleiro não tem percentil para ' + k + ' no JSON',
    }),
  }))).concat([
    { k: 'ctc', rot: 'confiança do contrato', tipo: 'texto' },
    { k: 'mv', rot: 'valor', fmt: v => v ? ptEur(v) : ptFalta('sem valor de mercado na base') },
  ]);

  const qtd = (v, motivo) => (v === null || v === undefined) ? ptFalta(motivo) : ptInt(v);
  const plural = (v, um, muitos) => (v === 1 ? um : muitos);

  return ptCard('O goleiro sai da esteira por regra, e a regra está escrita',
    ptInt(cands.length) + ' goleiros nesta tabela · ' +
      qtd(noPool, 'o JSON não trouxe `no_pool_operacional`') + ' no pool operacional · ' +
      qtd(gk.referencia_ZD_no_pool, 'o JSON não trouxe `referencia_ZD_no_pool`') +
      ' zagueiros pelo direito no mesmo pool',
    '<p class="pt-nota" style="margin-top:0"><b>' + esc(gk.motivo_fora_da_esteira) + '</b></p>' +

    /* O parágrafo que reconcilia as duas contagens. Ele vem ANTES da tabela de propósito:
       depois dela já é tarde, porque a pessoa já contou as linhas e já concluiu que o
       subtítulo está errado. */
    '<p class="pt-nota"><b>Duas contagens diferentes convivem aqui, e não são a mesma lista.</b> ' +
      'O pool operacional — o que sobrou do funil da etapa 12 — tem ' +
      qtd(noPool, 'o JSON não trouxe `no_pool_operacional`') + ' ' + plural(noPool, 'goleiro', 'goleiros') +
      ', contra ' + qtd(gk.referencia_ZD_no_pool, 'o JSON não trouxe `referencia_ZD_no_pool`') +
      ' zagueiros pelo direito. A tabela abaixo tem <b>' + ptInt(cands.length) + '</b> linhas, porque a ' +
      'trilha técnica do goleiro é uma lista própria. Cruzando nome e clube, <b>' + ptInt(tambemNoPool.length) +
      '</b> ' + plural(tambemNoPool.length, 'goleiro desta tabela está', 'goleiros desta tabela estão') +
      ' entre os ' + ptInt(poolGeral.length) + ' candidatos do pool; ' +
      (foraDoPool ? 'os outros <b>' + ptInt(foraDoPool) + '</b> não estão' : 'nenhum fica de fora') + '. ' +
      ptFalta('o JSON não declara qual corte monta `trilha_goleiro.candidatos`: ele traz a lista pronta, ' +
        'e não o critério que a separa do pool') + '. ' +
      'Enquanto os dois números não forem lidos juntos, esta tabela parece um ranking de ' +
      ptInt(cands.length) + ' contratáveis, e o pool diz que não é.</p>' +

    /* A ressalva que faltava: 49 das 126 linhas vêm de liga que a etapa 12 declarou sem um
       único atleta rastreado. Isso não invalida a tabela — ela é técnica —, mas invalida
       qualquer leitura dela como se fosse a mesma lista filtrada do pool. */
    (nSemBase
      ? '<p class="pt-nota"><b style="color:var(--coral)">' + ptInt(nSemBase) + ' das ' + ptInt(cands.length) +
        ' linhas desta tabela vêm de ligas que a etapa 12 declarou sem cobertura física</b> (' +
        ligasSemBase.map(k => esc(k) + ' ' + ptInt(porLigaSemBase[k])).join(' · ') + '). ' +
        'No pool de linha isso não acontece: ' + ptInt(nSemBaseNoPool) + ' dos ' + ptInt(poolGeral.length) +
        ' candidatos vêm dessas ligas, porque elas caíram antes, no funil. A trilha do goleiro não passou ' +
        'por esse mesmo filtro, e como ela é só técnica a ausência de dado físico não aparece como buraco ' +
        'em nenhuma célula — é preciso dizê-la aqui, em número.</p>'
      : '<p class="pt-nota">Nenhuma das linhas desta tabela vem das ' + ptInt(semFisicoLigas.length) +
        ' ligas que a etapa 12 declarou sem cobertura física.</p>') +

    ptTabela({
      id: 'ptEt-13-gk',
      vazio: 'nenhum goleiro na trilha técnica',
      colunas: colunas,
      linhas: linhas,
    }) +

    /* O lado bom dos indicadores: procurado no catálogo, não declarado aqui. */
    '<p class="pt-nota" style="font-size:11.5px">' +
      (semSinal.length === inds.length
        ? 'O JSON não declara lado bom para nenhum dos ' + ptInt(inds.length) + ' indicadores desta tabela: ' +
          'nenhum deles está entre os ' + ptInt(Object.keys(cat).length) + ' do catálogo da etapa 2, que é ' +
          'onde o `sinal` mora. As células saem coloridas só pelo percentil, e o `title` de cada uma avisa ' +
          '“sem lado bom declarado” — dizer aqui que “mais é melhor” seria a tela decidindo o que o estudo ' +
          'não decidiu.'
        : ptInt(semSinal.length) + ' dos ' + ptInt(inds.length) + ' indicadores desta tabela não têm lado bom ' +
          'declarado no catálogo da etapa 2 (' + pcLista(semSinal) + '): nessas colunas a cor é só percentil, ' +
          'e o `title` diz “sem lado bom declarado”.') +
      '</p>',

    'Não é escolha de gosto: a esteira principal pontua distância a um perfil físico, e o perfil físico do ' +
    'goleiro não existe nesta base. O que sobra é percentil técnico dentro de uma coorte pequena — as ' +
    'células trazem o n da coorte no `title`. Dentro do pool operacional, com ' +
    qtd(noPool, 'o JSON não trouxe `no_pool_operacional`') + ' ' + plural(noPool, 'goleiro', 'goleiros') +
    ' contra ' + qtd(gk.referencia_ZD_no_pool, 'o JSON não trouxe `referencia_ZD_no_pool`') + ' zagueiros, ' +
    '“o melhor goleiro disponível” é o melhor de ' + qtd(noPool, 'um número que o JSON não trouxe') +
    ' — e a tabela acima, com ' + ptInt(cands.length) + ' linhas, é outra lista, não o pool.');
}

/* ================================================================================
   ETAPA 14 — ELENCO COMO FAIXA
   ================================================================================

   Faixa, nunca time. Um XI único calibrado em dezesseis clube-temporada seria precisão
   falsa, e por isso o que a tela entrega por vaga é frequência nas réplicas: recomendação
   quem aparece em mais da metade delas, alternativa quem aparece entre um décimo e a metade.

   Vaga sem recomendação acontece, e significa que nenhum nome passou da metade. A tela
   escreve isso — escolher o primeiro das alternativas seria inventar a decisão que o dado
   se recusou a tomar.

   Ao pé de cada proposta, os dois controles: o contrafactual do dinheiro (quanto custa o
   elenco proposto e que taxa histórica de subida tem o quartil onde ele cai) e a baseline. */
function ptEtapa14(alvo, dados) {
  const chaves = Object.keys(dados.propostas || {});
  PC.et14 = PC.et14 || { chave: chaves.length ? chaves[0] : null };
  if (chaves.indexOf(PC.et14.chave) < 0) PC.et14.chave = chaves.length ? chaves[0] : null;
  pcEt14Desenhar(alvo, dados);
}

function pcEt14Desenhar(alvo, d) {
  const props = d.propostas || {};
  const chaves = Object.keys(props);
  if (!chaves.length) {
    alvo.innerHTML = ptFaltaBloco('Não há proposta de elenco no JSON',
      'a chave `etapa_14.propostas` chegou vazia. Sem ela não há o que propor, e a tela não monta elenco ' +
      'por conta própria.');
    return;
  }
  const atual = PC.et14.chave;
  const p = props[atual];

  const grade = d.grade || [];
  const taxa = d.taxa_de_subida_por_quartil_pct || {};
  const j = d.justificativa_no_dado || null;

  /* A grade soma 16 e toda proposta entrega 15, e a subtração 16 − 1 nunca esteve na tela:
     ficava para o leitor, que via "16 vagas na grade" em cima e "15 vagas" seis vezes logo
     abaixo. A conta é feita aqui e a caixa que sobra é marcada como não preenchível — e
     descobrir QUAL caixa sobra também é leitura: é a posição da grade que não aparece em
     `vagas_detalhe` de nenhuma proposta. O motivo, quando existe, é o `sem_goleiro` do JSON. */
  const somaGrade = grade.reduce((s, g) => s + g[1], 0);
  const posNasPropostas = {};
  chaves.forEach(k => {
    ((props[k] || {}).vagas_detalhe || []).forEach(v => { posNasPropostas[v.vaga] = true; });
  });
  const naoPreenchiveis = grade.filter(g => !posNasPropostas[g[0]]);
  const vagasDeclaradas = [];
  chaves.forEach(k => {
    const v = (props[k] || {}).vagas;
    if (v !== null && v !== undefined && vagasDeclaradas.indexOf(v) < 0) vagasDeclaradas.push(v);
  });
  const somaNaoPreenchivel = naoPreenchiveis.reduce((s, g) => s + g[1], 0);
  const motivosSemGoleiro = [];
  chaves.forEach(k => {
    const s = (props[k] || {}).sem_goleiro;
    if (s && motivosSemGoleiro.indexOf(s) < 0) motivosSemGoleiro.push(s);
  });
  const gradeDivergeDasPropostas = vagasDeclaradas.length === 1 && vagasDeclaradas[0] !== somaGrade;

  const cabeca = ptCard('A forma do elenco, e por que ela é uma aposta declarada',
    (d.forma ? esc(d.forma) : 'forma não declarada no JSON') + ' · ' +
      ptInt(somaGrade) + ' vagas na grade' +
      (gradeDivergeDasPropostas ? ' · ' + ptInt(vagasDeclaradas[0]) + ' preenchidas por proposta' : ''),
    pcGrade(140, grade.map(g => {
      const fora = !posNasPropostas[g[0]];
      return fora
        ? '<div style="opacity:.62">' +
            pcNumeroSolto(g[0], ptInt(g[1]),
              '<b style="color:var(--coral)">não preenchível</b> — nenhuma proposta traz esta vaga') +
          '</div>'
        : pcNumeroSolto(g[0], ptInt(g[1]), g[1] === 1 ? 'vaga' : 'vagas');
    }).join('')) +
    (naoPreenchiveis.length
      ? '<p class="pt-nota"><b>A grade soma ' + ptInt(somaGrade) + ' vagas e cada proposta preenche ' +
        (vagasDeclaradas.length === 1
          ? ptInt(vagasDeclaradas[0])
          : vagasDeclaradas.length
            ? pcLista(vagasDeclaradas.map(v => ptInt(v)))
            : ptFalta('nenhuma proposta declara `vagas`')) +
        '.</b> A diferença é ' + pcLista(naoPreenchiveis.map(g => g[0])) + ', ' + ptInt(somaNaoPreenchivel) +
        (somaNaoPreenchivel === 1 ? ' vaga que nenhuma' : ' vagas que nenhuma') +
        ' das ' + ptInt(chaves.length) + ' propostas traz em `vagas_detalhe`. ' +
        (motivosSemGoleiro.length
          ? 'O JSON escreve o motivo em toda proposta: ' +
            motivosSemGoleiro.map(s => '“' + esc(s) + '”').join('; ') + '. A trilha dessa posição está na ' +
            'etapa 13, separada, e é técnica.'
          : ptFalta('as propostas não trazem `sem_goleiro`, então o JSON não diz por que estas vagas ficam ' +
              'fora') + '.') + '</p>'
      : '') +
    (j
      ? '<p class="pt-nota">Quem subiu usou <b>' + ptNum(j.atletas_usados_sobe, 1) + '</b> atletas na temporada ' +
        'contra <b>' + ptNum(j.atletas_usados_cai, 1) + '</b> de quem caiu, e concentrou <b>' +
        ptPct(j.share_11_sobe) + '</b> dos minutos no XI mais usado contra <b>' + ptPct(j.share_11_cai) +
        '</b>. É daí que sai o núcleo enxuto — e o porém é do tamanho do achado: isso é porta <b>' +
        esc(j.porta) + '</b>' +
        (j.aviso ? ', ou seja, <b>' + esc(j.aviso) + '</b>' : '') + '.</p>'
      : ptFalta('a justificativa da forma não veio no JSON')),
    'Núcleo enxuto é decisão de projeto sustentada por um indicador que não se repete de um ano para o ' +
    'outro. Fica na tela como aposta, com o nome de aposta.');

  const quartis = Object.keys(taxa).sort();
  const cardTaxa = ptCard('A régua do dinheiro, que todo elenco proposto vai ter de enfrentar',
    'taxa histórica de subida por quartil de valor do elenco',
    pcGrade(130, quartis.map(q =>
      pcNumeroSolto(q + 'º quartil', ptPct(taxa[q]),
        Number(taxa[q]) === pcMax(quartis.map(k => Number(taxa[k]))) ? 'o quartil mais caro' : '')).join('')),
    'Estes quatro números são o contrafactual de qualquer proposta: montar um elenco que cai no quartil ' +
    'mais barato é aceitar a taxa histórica daquele quartil. A proposta pode ser boa mesmo assim — mas ' +
    'ela precisa saber contra o que está jogando.');

  const botoes = pcBotoes('et14', chaves.map(k => {
    const partes = k.split('__');
    return { v: k, rot: '<b>' + esc(partes[0]) + '</b> <span class="pt-n">' + esc(partes[1] || '') + '</span>' };
  }), atual);

  alvo.innerHTML = cabeca + cardTaxa +
    '<div style="margin-top:16px"><span class="pt-rot">as ' + ptInt(chaves.length) +
      ' propostas — cenário e escopo de mercado</span>' + botoes + '</div>' +
    (p ? pcEt14Proposta(p, atual) : ptFalta('a proposta selecionada não existe no JSON'));

  pcLigarBotoes(alvo, 'et14', v => { PC.et14.chave = v; pcEt14Desenhar(alvo, d); });
  ptLigarTabelas(alvo);
}

function pcEt14Proposta(p, chave) {
  if (p.possivel === false) {
    return ptFaltaBloco('Esta proposta não foi possível',
      'o JSON marcou `possivel: false` para <code>' + chave + '</code>. Uma proposta impossível continua na ' +
      'tela: é informação sobre o mercado, não sobre o método.');
  }
  const vagas = p.vagas_detalhe || [];
  const semRecomendacao = vagas.filter(v => !v.recomendacao || !v.recomendacao.length);
  const denomMin = vagas.length ? pcMin(vagas.map(v => v.denominador)) : null;

  const nomes = lista => (lista || []).map(x =>
    '<span style="white-space:nowrap">' + esc(x.nome) + ' <span class="pt-n">' + ptPct(x.freq_pct) + '</span></span>')
    .join('<br>');

  const tab = ptTabela({
    id: 'ptEt-14-vagas',
    vazio: 'esta proposta não trouxe detalhe por vaga',
    colunas: [
      { k: 'vaga', rot: 'vaga', tipo: 'texto' },
      { k: 'denominador', rot: 'candidatos para a vaga', casas: 0,
        dica: 'quantos nomes disputavam esta vaga — vaga com denominador pequeno produz recomendação que é quase sorteio' },
      { k: '_rec', rot: 'recomendação (mais da metade das réplicas)', tipo: 'texto',
        fmt: (v, l) => l.recomendacao && l.recomendacao.length
          ? nomes(l.recomendacao)
          : ptFalta('nenhum nome passou de metade das réplicas nesta vaga — a escolha ficou dentro do ruído') },
      { k: '_alt', rot: 'alternativas equivalentes', tipo: 'texto',
        fmt: (v, l) => l.alternativas && l.alternativas.length
          ? nomes(l.alternativas)
          : ptFalta('nenhum nome chegou à faixa de alternativa nesta vaga') },
    ],
    linhas: vagas,
  });

  const vv = p.validacao_de_volta || null;
  const prox = vv ? { sobe: vv.prox_sobe, caro: vv.prox_caro, barato: vv.prox_barato, cai: vv.prox_cai } : null;
  /* A validação de volta: qual vetor o elenco proposto ficou mais perto, comparado ao que o
     cenário pediu. Se o alvo do cenário não é o mais próximo, a tela diz qual é — sem
     inventar "qual eixo ficou de fora", que o JSON não traz eixo a eixo. */
  const alvoChave = String(p.alvo || '').replace('margem_', '');
  let vereditoVolta = '';
  if (prox) {
    const ordenados = Object.keys(prox).filter(k => prox[k] !== null && prox[k] !== undefined)
      .sort((a, b) => prox[b] - prox[a]);
    const topo = ordenados[0];
    vereditoVolta = topo
      ? (topo === alvoChave
          ? 'O elenco proposto ficou mais próximo do vetor que o cenário pediu (<code>' + esc(alvoChave) +
            '</code>, ' + ptNum(prox[topo], 4) + '), o que é o mínimo que se espera da própria otimização.'
          : 'O elenco proposto ficou mais próximo de <code>' + esc(topo) + '</code> (' + ptNum(prox[topo], 4) +
            ') do que do vetor que o cenário pediu (<code>' + esc(alvoChave) + '</code>, ' +
            ptNum(prox[alvoChave], 4) + '). O alvo não foi alcançado, e o problema é o mercado disponível, ' +
            'não o método.')
      : '';
  }

  const r = p.restricoes || {};
  const inf = r.infracoes_nas_replicas || {};
  const folha = r.folha || null;
  /* A restrição dos veteranos saiu de `restricoes` e foi para `nao_implementadas`: o Húngaro otimiza
     célula a célula e uma exigência de CONJUNTO não se impõe por penalidade. Enquanto o mínimo morava
     na raiz, esta linha media o núcleo contra ele; com a chave fora, `violou` virava false calado e o
     card escrevia "nenhuma infração relevante" logo abaixo de uma barra mostrando 143 de 200. Agora a
     tela lê onde o valor está e diz o que ele é: um pedido da especificação que o método não cumpre. */
  const naoImp = r.nao_implementadas || {};
  const vet = naoImp.minimo_de_veteranos_9v || null;
  const minVet = vet ? vet.valor_pedido_na_especificacao : r.minimo_com_1800_min;
  const violou = minVet !== undefined && minVet !== null &&
    r.com_1800_min_no_nucleo !== undefined && r.com_1800_min_no_nucleo < minVet;

  const cardRestricoes = ptCard('As restrições, e quantas réplicas as violaram',
    (r.forma ? esc(r.forma) : 'forma das restrições não declarada'),
    pcGrade(160,
      pcNumeroSolto('teto de idade média', ptNum(r.teto_idade_media, 1),
        'o núcleo ficou em ' + ptNum(r.idade_media_do_nucleo, 1)) +
      pcNumeroSolto('teto por liga estrangeira', ptInt(r.teto_por_liga_estrangeira), 'atletas da mesma liga') +
      pcNumeroSolto('mínimo com muitos minutos',
        (minVet === undefined || minVet === null) ? ptFalta('sem mínimo declarado') : ptInt(minVet),
        (vet ? 'pedido pela especificação, NÃO aplicado · ' : '') +
          'o núcleo tem ' + ptInt(r.com_1800_min_no_nucleo)) +
      (folha
        ? pcNumeroSolto('folha implícita (banda)', ptEur(folha.soma_ponto_medio_eur),
            ptInt(folha.com_faixa_salarial) + ' de ' + ptInt(folha.de) + ' com faixa salarial')
        : '')) +
    '<div style="margin-top:11px"><span class="pt-rot">infrações nas réplicas</span>' +
      Object.keys(inf).filter(k => k !== 'replicas').map(k =>
        ptBarra(inf[k], inf.replicas || 1, {
          rot: k, texto: ptInt(inf[k]) + ' de ' + ptInt(inf.replicas),
          cor: inf[k] > 0 ? 'baixo' : 'alto',
        })).join('') +
    '</div>',
    (violou
      ? '<b style="color:var(--coral)">O núcleo entregue viola a própria restrição de minutos:</b> ' +
        ptInt(r.com_1800_min_no_nucleo) +
        (r.com_1800_min_no_nucleo === 1 ? ' atleta com muitos minutos contra ' : ' atletas com muitos minutos contra ') +
        (minVet === 1 ? 'o ' + ptInt(minVet) + ' pedido' : 'os ' + ptInt(minVet) + ' pedidos') +
        ', e ' + ptInt(inf.menos_de_5_com_1800_min) + ' das ' +
        ptInt(inf.replicas) + ' réplicas também ficam abaixo dele. ' +
        (vet
          ? 'E isso era esperado: a restrição está declarada como NÃO implementada — ' + esc(vet.motivo) +
            '. O que existe no lugar é ' + esc(vet.efeito_no_custo) + '. '
          : 'A restrição entra como penalidade na matriz de custo, não como corte duro — então ela pode ' +
            'ser vencida pelo resto do problema, e foi. ') +
        'Elenco novo inteiro é risco de integração que este dado não mede. '
      : 'Nenhuma infração relevante nas réplicas. ') +
    (naoImp.teto_de_folha_9ii
      ? '<br>O teto de folha da seção 9(ii) também <b>não é aplicado</b>: ' +
        esc(naoImp.teto_de_folha_9ii.motivo) + '. No lugar dele vai ' +
        esc(naoImp.teto_de_folha_9ii.o_que_existe) + '.'
      : '') +
    (folha && folha.motivo_banda ? '<br>Sobre a folha: ' + esc(folha.motivo_banda) + '.' : ''));

  const baseline = ptBaseline({
    rotulo: 'a proposta ' + chave.replace('__', ' · '),
    auc: null,
    motivo: 'uma proposta de elenco não tem AUC fora da amostra: ela é uma alocação ótima sob restrições, ' +
      'calibrada em ' + ptInt(p.replicas) + ' réplicas de reamostragem das notas, e não um classificador ' +
      'de subida. O número que a compara com o dinheiro é o contrafactual logo abaixo',
  });

  return ptCard('Proposta ' + chave.replace('__', ' · '),
    '<code>' + esc(p.cenario) + '</code> · escopo <code>' + esc(p.escopo) + '</code> · ' +
      ptN(p.candidatos, 'candidatos') + ' · ' + ptInt(p.vagas) + ' vagas · ' + ptInt(p.replicas) + ' réplicas',
    '<p class="pt-nota" style="margin-top:0">Alvo: <code>' + esc(p.alvo) + '</code>' +
      (p.alvo_significa ? ' — ' + esc(p.alvo_significa) : '') + '.</p>' +

    (p.sem_goleiro ? '<p class="pt-nota"><b>Sem goleiro:</b> ' + esc(p.sem_goleiro) + '</p>' : '') +

    '<div style="margin-top:10px"><span class="pt-rot">por vaga: quem aparece em mais da metade das réplicas</span>' +
      tab + '</div>' +

    '<p class="pt-nota">' +
      (semRecomendacao.length
        ? '<b>' + ptInt(semRecomendacao.length) + ' das ' + ptInt(vagas.length) + ' vagas ficaram sem ' +
          'recomendação</b> (' + pcLista(semRecomendacao.map(v => v.vaga)) + '): nenhum nome apareceu em mais ' +
          'da metade das réplicas. A tela não escolhe o primeiro das alternativas — se a reamostragem não ' +
          'decidiu, quem decide é o clube, sabendo que decide no escuro. '
        : 'Todas as ' + ptInt(vagas.length) + ' vagas tiveram ao menos um nome acima da metade das réplicas. ') +
      (denomMin !== null
        ? 'O menor denominador é <b>' + ptInt(denomMin) + '</b> candidatos numa vaga — e com denominador ' +
          'assim a palavra "recomendação" carrega menos do que parece.'
        : '') + '</p>' +

    (vv
      ? '<div style="margin-top:12px"><span class="pt-rot">validação de volta: o elenco proposto, remedido</span>' +
        pcGrade(150,
          Object.keys(prox).map(k => pcNumeroSolto('proximidade ao vetor ' + k, ptNum(prox[k], 4),
            k === alvoChave ? 'é o alvo deste cenário' : '')).join('') +
          pcNumeroSolto('margem do cenário', ptNum(vv.margem_do_cenario, 4), 'sobe menos cai') +
          pcNumeroSolto('indicadores por atleta', ptNum(vv.indicadores_medios_por_atleta, 1), 'média do núcleo') +
          pcNumeroSolto('critério pseudorreplicado', ptInt(vv.atletas_com_criterio_pseudorreplicado),
            'atletas pontuados pelo teste por atleta')) +
        '<p class="pt-nota">' + vereditoVolta + ' ' +
        ptFalta('a distância ao alvo eixo a eixo não vem no JSON: `validacao_de_volta` traz as quatro ' +
          'proximidades agregadas, e não qual eixo ficou de fora') + '</p></div>'
      : ptFaltaBloco('Esta proposta não foi revalidada',
          'falta `validacao_de_volta`: sem ela não dá para dizer se o elenco proposto reproduz o perfil que o ' +
          'cenário pediu.')) +

    cardRestricoes +
    baseline +
    ptContrafactual(p.contrafactual),
    '');
}

/* ================================================================================
   ETAPA 15 — TREINADOR: O QUE NÃO DÁ
   ================================================================================

   O card vazio é o conteúdo. Não existe nome de treinador em base nenhuma deste projeto, e
   por isso nenhuma pergunta sobre treinador foi respondida — nem a mais óbvia de todas, que
   é se a troca de comando explica alguma coisa.

   O que existe é um proxy: contar sistemas táticos, trocas e fidelidade ao desenho
   principal. Os p do proxy estão todos na tela, inclusive os dois que passam — e passam para
   o lado errado, o que é informação e não achado. */
function ptEtapa15(alvo, dados) {
  const bases = dados.bases_conferidas || {};
  const px = dados.proxy_sistema || {};
  const testes = px.testes || {};
  const coleta = dados.coleta_que_resolveria || null;
  const alfa = pcAlfa();

  const linhas = Object.keys(testes).map(k => Object.assign({ proxy: k }, testes[k]));
  const passamSM = linhas.filter(l => pcPassa(l.p_SM));
  const passamSC = linhas.filter(l => pcPassa(l.p_SC));

  const tab = ptTabela({
    id: 'ptEt-15-proxy',
    ordem: { col: 'p_SM', dir: 'asc' },
    vazio: 'o proxy de sistema não trouxe teste nenhum',
    colunas: [
      { k: 'proxy', rot: 'proxy', tipo: 'texto' },
      { k: 'm_sobe', rot: 'quem subiu', casas: 2 },
      { k: 'm_meio', rot: 'meio', casas: 2 },
      { k: 'm_cai', rot: 'quem caiu', casas: 2 },
      { k: 'd_SM', rot: 'd sobe×meio', fmt: v => ptD(v) },
      { k: 'p_SM', rot: 'p sobe×meio', fmt: v => ptPv(v) },
      { k: 'd_SC', rot: 'd sobe×cai', fmt: v => ptD(v) },
      { k: 'p_SC', rot: 'p sobe×cai', fmt: v => ptPv(v) },
    ],
    linhas: linhas,
  });

  /* O detalhe que muda o sentido dos dois p pequenos: eles apontam para baixo. Quem caiu usou
     MAIS sistemas distintos e teve MENOS fidelidade — isto é, o proxy está medindo o efeito
     de estar perdendo, que é a mesma armadilha da etapa 10 em outra roupa. */
  const paraOLadoErrado = passamSC.filter(l => l.d_SC < 0);

  alvo.innerHTML =
    '<div class="pt-controle" style="border-left:3px solid var(--coral)">' +
      '<span class="pt-rot">o card vazio — e ele é o conteúdo</span>' +
      '<b style="display:block;font-size:20px;margin:5px 0 0;letter-spacing:-.01em">' +
        (dados.tem_nome_de_treinador === false
          ? 'Não existe nome de treinador em nenhuma base deste projeto.'
          : 'O JSON não declarou se existe nome de treinador nas bases.') + '</b>' +
      '<p class="pt-nota">Foi procurado em ' + (bases.procurado_em ? '<code>' + esc(bases.procurado_em) + '</code>' : 'todas as bases') +
        '. As colunas conferidas: ' +
        Object.keys(bases).filter(k => k !== 'procurado_em').map(k =>
          '<code>' + esc(k) + '</code> ' + ptInt(bases[k])).join(' · ') +
        '. Em nenhuma delas há quem dirigiu o time.</p>' +
      '<p class="pt-nota">Isso torna <b>não respondíveis</b> as perguntas que mais se faz sobre subir: se ' +
        'trocar de treinador ajuda, se algum treinador aparece em mais de uma promoção, se o estilo do ' +
        'time é do elenco ou de quem escala. Um card honesto vale mais que um número inventado, e aqui a ' +
        'única coisa honesta a fazer é dizer o tamanho do buraco.</p>' +
    '</div>' +

    ptCard('O proxy que dá para rodar — e o que ele encontra',
      ptInt(px.sistemas_reais) + ' sistemas reais na base · ' + ptInt(px.sistemas_sem_regex) +
        ' variações de texto antes da limpeza · mediana de ' + ptNum(px.trocas_medianas_em_38_jogos, 1) +
        ' trocas de escalação em uma temporada',
      tab,
      (passamSM.length ? ptInt(passamSM.length) : 'Nenhum') + ' dos ' + ptInt(linhas.length) +
      ' proxies separa' + (passamSM.length === 1 || !passamSM.length ? '' : 'm') + ' quem subiu do meio' +
      (alfa !== null ? ' com p abaixo de ' + ptNum(alfa, 2) : '') + '; ' +
      (passamSC.length ? ptInt(passamSC.length) : 'nenhum') + ' separa' +
      (passamSC.length === 1 || !passamSC.length ? '' : 'm') + ' quem subiu de quem caiu. ' +
      (paraOLadoErrado.length
        ? '<b>E ' + ptInt(paraOLadoErrado.length) + ' ' + (paraOLadoErrado.length === 1 ? 'deles aponta' : 'deles apontam') +
          ' para o lado errado</b> (' +
          paraOLadoErrado.map(l => '<code>' + esc(l.proxy) + '</code>, d ' + ptD(l.d_SC) + ', ' + ptP(l.p_SC)).join('; ') +
          '): nesses proxies quem caiu está ACIMA de quem subiu. Isso não é característica de quem sobe — ' +
          'é o efeito de estar perdendo medido de outro jeito, a mesma armadilha da etapa 10 com outra ' +
          'roupa. Nenhum destes proxies é critério de ' +
          'contratação de treinador, porque nenhum deles sabe quem era o treinador.'
        : 'Nenhum deles anda para o lado contrário do esperado.')) +

    (coleta
      ? ptCard('O que exigiria coletar para a pergunta virar respondível',
          'uma tabela ' + (coleta.tabela ? '<code>' + esc(coleta.tabela) + '</code>' : '') +
            (coleta.fonte ? ' · fonte <code>' + esc(coleta.fonte) + '</code>' : ''),
          pcGrade(160,
            pcNumeroSolto('clube-temporada a cobrir', ptInt(coleta.clube_temporada), 'o painel inteiro') +
            (coleta.passagens_estimadas
              ? pcNumeroSolto('passagens estimadas',
                  ptInt(coleta.passagens_estimadas[0]) + ' a ' + ptInt(coleta.passagens_estimadas[1]),
                  'linhas a coletar')
              : '') +
            (coleta.raspador_existente
              ? pcNumeroSolto('raspador que já existe', '<span style="font-size:12px">' +
                  esc(coleta.raspador_existente) + '</span>', 'não seria do zero')
              : '')) +
          '<div style="margin-top:11px"><span class="pt-rot">o que passaria a ser respondível</span><ul ' +
            'style="margin:6px 0 0;padding-left:18px;font-size:12.5px;line-height:1.6;color:var(--tinta2)">' +
            (coleta.perguntas_que_passariam_a_ser_respondiveis || []).map(q =>
              '<li>' + esc(q) + '</li>').join('') + '</ul></div>',
          'O custo está escrito porque a decisão é do dono: ' +
          (coleta.passagens_estimadas
            ? 'entre ' + ptInt(coleta.passagens_estimadas[0]) + ' e ' + ptInt(coleta.passagens_estimadas[1]) +
              ' linhas de coleta'
            : 'uma coleta de tamanho não estimado no JSON') +
          ' separam esta aba de responder se treinador explica subida. Enquanto isso não for coletado, o ' +
          'lugar da resposta fica vazio — e vazio escrito, que é a única forma de ele não ser preenchido ' +
          'por palpite.')
      : ptFaltaBloco('A coleta que resolveria não está descrita no JSON',
          'sem `coleta_que_resolveria` a tela diria apenas "não dá", sem dizer o que custaria fazer dar — ' +
          'que é a metade útil da má notícia.'));

  ptLigarTabelas(alvo);
}
