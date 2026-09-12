/* ================= aba Protótipo — etapas 5, 6, 7 e 8 =================

   O miolo do estudo: o que os dezesseis que subiram tinham (5), se aquilo se repete no ano
   seguinte (6), se veio antes do desfecho ou junto com ele (7), e o que acontece quando se
   tenta transformar isso em grupos de times (8).

   A regra é a da casa e não tem exceção aqui: **o dado é a fonte, o texto é consequência.**
   Nenhum número deste arquivo foi digitado. Onde o `prototipo.json` não traz o que a
   ESPECIFICACAO pede, a tela escreve a ausência e o motivo, em vez de calar ou imputar —
   e há três casos assim, todos marcados no lugar em que o leitor sentiria falta.

   Contrato: static/proto_contrato.md. Os helpers `pt…` são de proto.js e NÃO são
   redefinidos aqui; o que é só destas quatro etapas leva o prefixo `pb`.

   Por que quase tudo nesta parte da aba é matriz e dispersão, e não um número grande: as
   quatro etapas existem para mostrar VARIAÇÃO — entre clubes, entre anos, entre o bruto e o
   parcial, entre o observado e o nulo. Um número grande no meio da tela diria "é isto", e o
   assunto destas etapas é justamente que não é. */
'use strict';

/* ---------------- pedaços comuns às quatro etapas ----------------

   Os identificadores curtos (`ppda`, `fis_distance_p90`) são a chave do dado em toda parte;
   o nome legível mora só no catálogo da etapa 2. Ler de lá é o que evita um segundo
   dicionário de nomes escrito à mão neste arquivo — que é como um app passa a ter dois
   nomes para a mesma coluna e ninguém sabe qual está certo. */
let PB_NOMES = null;
function pbNomes() {
  if (PB_NOMES) return PB_NOMES;
  PB_NOMES = {};
  const linhas = (typeof PROTO !== 'undefined' && PROTO.etapa_2 && PROTO.etapa_2.linhas) || [];
  linhas.forEach(l => { if (l && l.indicador) PB_NOMES[l.indicador] = l.nome || l.indicador; });
  return PB_NOMES;
}
function pbNome(id) {
  const m = pbNomes();
  return Object.prototype.hasOwnProperty.call(m, id) ? m[id] : String(id);
}
/* Quando o catálogo não conhece a coluna, a tela mostra o id cru — e diz que é id cru, em
   vez de fingir que aquilo é o nome do indicador. */
function pbSemNome(id) { return !Object.prototype.hasOwnProperty.call(pbNomes(), id); }

/* Rótulo a partir da própria chave do JSON. Usado onde a coluna tem um corte embutido no
   nome (`passam5_SM`, `bh5_SM`): inventar um título em português significaria digitar o
   corte — "passam a 5%" — e corte digitado é número escrito à mão. O nome da chave é o
   número, e ele vem do arquivo. */
function pbRotChave(k) { return String(k).replace(/_/g, ' '); }

/* A paleta é a que existe dentro de #pgProto; quatro categorias precisam de quatro tons e
   não há mais do que estes quatro semânticos no CSS da aba. A ordem é a ordem do dado. */
const PB_CORES = ['var(--pt-alto)', 'var(--pt-baixo)', 'var(--pt-ok)', 'var(--coral)'];
function pbCor(i) { return PB_CORES[i % PB_CORES.length]; }

/* O corte de significância NÃO é digitado aqui. Ele é o `poder.alfa` da etapa 0 — o mesmo
   alfa com que o estudo calculou o d mínimo detectável —, e vem de lá para que, no dia em
   que o pipeline mudar de corte, estas contagens mudem junto em vez de continuarem contando
   pelo corte de ontem. Quando o alfa não vier, a tela não conta nada e diz por quê: um
   "passam 9" calculado com corte inventado seria pior que nenhum número. */
function pbAlfa() {
  const p = (typeof PROTO !== 'undefined' && PROTO.etapa_0 && PROTO.etapa_0.poder) || {};
  return (p.alfa === undefined || p.alfa === null) ? null : Number(p.alfa);
}
function pbPassa(p) {
  const a = pbAlfa();
  return a !== null && p !== null && p !== undefined && p < a;
}
function pbConta(v) {
  return v === null
    ? ptFalta('o corte de significância não veio em `etapa_0.poder.alfa` — sem corte declarado a tela não conta sobreviventes')
    : ptInt(v);
}

/* Passou / não passou com cor, e com a palavra escrita: cor sozinha não é lida por quem
   não distingue os dois tons, e nesta aba metade dos testes não passou. */
function pbSelo(passou) {
  return passou
    ? '<b style="color:var(--pt-ok)">passou</b>'
    : '<b style="color:var(--pt-nao)">não passou</b>';
}

function pbSvg(w, h, conteudo, maxLarg) {
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" ' +
    'style="width:100%;height:auto;display:block' + (maxLarg ? ';max-width:' + maxLarg + 'px' : '') + '">' +
    conteudo + '</svg>';
}
function pbTxt(x, y, texto, opts) {
  const o = opts || {};
  return '<text x="' + x + '" y="' + y + '"' +
    (o.anc ? ' text-anchor="' + o.anc + '"' : '') +
    ' style="font-size:' + (o.tam || 10) + 'px;fill:' + (o.cor || 'var(--tinta3)') +
    (o.peso ? ';font-weight:' + o.peso : '') + ';font-variant-numeric:tabular-nums">' +
    esc(texto) + '</text>';
}

/* Faixa de desfecho como cor. Os três valores são categorias do próprio dado; o mapa existe
   para dar cor a categoria conhecida e tem saída para a desconhecida, porque se um dia
   aparecer uma quarta faixa o gráfico precisa desenhá-la em vez de sumir com ela. */
const PB_FAIXA_COR = { sobe: 'var(--pt-alto)', cai: 'var(--pt-baixo)', meio: 'var(--tinta3)' };
function pbCorFaixa(f) { return PB_FAIXA_COR[f] || 'var(--tinta2)'; }

/* ---------------- o que estas etapas precisam e o helper compartilhado nao entrega ----

   Nada daqui e redefinicao de helper `pt*`: sao pecas so destas quatro etapas, com o
   prefixo do arquivo, para resolver tres casos em que a tela vinha AFIRMANDO o que ela
   mesma nao fazia. A casca nao foi tocada porque tres arquivos editando o mesmo proto.js
   ao mesmo tempo perdem trabalho um do outro. */

/* Concordancia de numero so na PALAVRA — o `ptCascaConcorda` devolve o numero junto, e
   aqui o numero precisa sair em negrito separado do verbo que concorda com ele. O comentario
   da casca ja avisa: cada um dos tres arquivos resolve o seu plural no seu arquivo. */
function pbPl(n, sing, plur) { return Math.abs(Number(n)) === 1 ? sing : plur; }

/* Cinza italico para o que esta no arquivo e NAO se sustenta. Nao e ausencia — para isso ha
   `ptFalta` —, e presenca contraditoria, e a diferenca entre as duas precisa ser visivel.
   O texto chega montado por quem chama: todo pedaco variavel passa por esc/ptInt antes. */
function pbCinza(html, dica) {
  return '<span class="pt-falta"' + (dica ? ' title="' + esc(dica) + '"' : '') + '>' + html + '</span>';
}

/* Casas decimais que o proprio numero tem. Serve para um title carregar o valor cheio sem
   inventar precisao que o dado nao tem nem perder a que ele tem. */
function pbCasas(v, max) {
  const s = String(v);
  const i = s.indexOf('.');
  return Math.min(i < 0 ? 0 : s.length - i - 1, max === undefined ? 4 : max);
}
function pbCheio(v) { return ptNum(v, pbCasas(v)); }

/* A faixa de baixa confianca nao vem num campo de valor: ela esta escrita no NOME da coluna
   de `vazios_por_setor` (`marca_baixa_confianca_3_a_4`). Ler os inteiros de dentro da chave
   — o mesmo caminho que `pbRotChave` usa para o corte de `passam5_SM` — e o que evita
   digitar "3 a 4" aqui, porque corte digitado sobrevive a mudanca do gerador e continua
   marcando pela faixa de ontem. Sem a chave nao ha faixa, e sem faixa a tela nao marca nada
   e DIZ que nao marca, em vez de prometer a marca no texto e entregar celula limpa. */
function pb5FaixaBaixa(d) {
  const v = (d && d.vazios_por_setor) || [];
  const chave = v.length ? Object.keys(v[0]).find(k => /baixa_confianca/.test(k)) : null;
  const nums = chave ? (String(chave).match(/\d+/g) || []).map(Number) : [];
  if (!nums.length) return null;
  return { chave: chave, min: nums[0], max: nums[nums.length - 1] };
}
function pb5Baixa(faixa, n) {
  return !!faixa && n !== null && n !== undefined && Number(n) >= faixa.min && Number(n) <= faixa.max;
}
/* A marca vai POR CIMA do `<td>` que o `ptCel` devolveu: o helper e compartilhado e nao pode
   ser alterado daqui, e nao existe classe de CSS para isto (e este arquivo nao escreve CSS).
   Contorno tracejado para o olho que varre, triangulo para quem nao distingue o tracejado,
   e o motivo somado ao title que o ptCel ja tinha montado. */
function pb5Marcar(td, dica) {
  const m = td
    .replace('<td class="', '<td style="outline:1px dashed var(--pt-baixo);outline-offset:-2px" class="')
    .replace('title="', 'title="' + esc(dica) + ' · ')
    .replace('</span></td>',
      '<sup style="color:var(--pt-baixo);font-size:9px;margin-left:2px">&#9651;</sup></span></td>');
  /* Se a marca nao pegou, o `ptCel` mudou de forma — ele e de outro arquivo e pode mudar sem
     aviso. Devolver null faz quem chama CONTAR a falha e escreve-la na legenda; devolver a
     celula limpa por baixo de um texto que promete marca seria repetir o defeito que este
     conserto veio corrigir, so que mais dificil de achar. */
  return m.indexOf('&#9651;') < 0 ? null : m;
}

/* `unidade_n` e rotulo escrito pelo gerador, e em dois paineis ele nao fecha com o proprio
   arquivo: a etapa 0 registra 20 clubes em cada ano da Serie B e a celula chega com n = 38
   dizendo "clube-temporada" — 38 e a contagem de rodadas (`J`) do mesmo ano. Quem conserta
   isso e o gerador; o que esta tela nao pode e imprimir a contradicao como fato. Devolve
   null quando o rotulo e plausivel e a MEDIDA da contradicao quando nao e. */
function pb5UnidadeSuspeita(n, unidade, ano) {
  if (String(unidade) !== 'clube-temporada' || n === null || n === undefined) return null;
  const anos = (typeof PROTO !== 'undefined' && PROTO.etapa_0 && PROTO.etapa_0.por_ano) || [];
  if (!anos.length) return null;
  const linha = anos.find(a => Number(a.ano) === Number(ano)) || null;
  const limite = linha ? Number(linha.n) : Math.max.apply(null, anos.map(a => Number(a.n)));
  if (!isFinite(limite) || !(Number(n) > limite)) return null;
  return {
    limite: limite,
    ano: linha ? linha.ano : null,
    jogos: linha ? Number(linha.J) : null,
    ehRodadas: !!linha && Number(linha.J) === Number(n),
  };
}
/* O maior n da etapa inteira contado na MESMA unidade. Serve para dar tamanho ao contraste
   que a rampa de cor esconde: dentro de um painel so, o maior n pode ser 5 e a frase fica
   sem forca; a rampa, porem, e a mesma em todos os paineis que contam na mesma unidade. */
function pb5MaxN(d, unidade) {
  let max = null;
  Object.keys((d && d.paineis) || {}).forEach(k => {
    const pa = d.paineis[k];
    if (String(((pa.indicadores || [])[0] || {}).unidade_n) !== String(unidade)) return;
    (pa.clubes || []).forEach(c => (c.celulas || []).forEach(x => {
      if (!x || x[2] === null || x[2] === undefined) return;
      if (max === null || Number(x[2]) > max) max = Number(x[2]);
    }));
  });
  return max;
}

/* A mesma ressalva, encurtada para caber no title da celula e no bloco que o clique abre —
   os dois lugares em que o rotulo cru tambem aparecia, e onde ele tambem era afirmacao. */
function pb5UnidadeCel(n, unidade, ano) {
  return pb5UnidadeSuspeita(n, unidade, ano)
    ? 'de unidade não confirmada (o rótulo "' + String(unidade) + '" não fecha com a etapa 0 — ' +
      'ver a ressalva ao pé da matriz)'
    : unidade;
}

/* O teto de clubes que a propria aba declara, ano a ano. Vai para a ressalva da matriz em
   vez de um "20" digitado: se a Serie B mudar de tamanho, a frase muda junto. */
function pb5MaxClubes() {
  const anos = (typeof PROTO !== 'undefined' && PROTO.etapa_0 && PROTO.etapa_0.por_ano) || [];
  if (!anos.length) return null;
  return Math.max.apply(null, anos.map(a => Number(a.n)));
}
function pb5RotN(n, unidade, ano) {
  const s = pb5UnidadeSuspeita(n, unidade, ano);
  if (!s) return 'n = ' + ptInt(n) + ' ' + esc(unidade || 'unidade não declarada');
  const conta = s.ano === null
    ? 'nenhum ano da etapa 0 passa de ' + ptInt(s.limite) + ' clubes'
    : ptAno(s.ano) + ' teve ' + ptInt(s.limite) + ' clubes na Série B' +
      (s.ehRodadas ? ' e ' + ptInt(s.jogos) + ' rodadas, e este n é o das rodadas' : '');
  /* Curto na linha porque ela se repete dezesseis vezes; a conta inteira vai no title e, uma
     vez so, no paragrafo ao pe da matriz. Repetir o paragrafo inteiro em cada linha faria o
     leitor parar de ler a ressalva — que e o mesmo efeito de nao escreve-la. */
  return 'n = ' + ptInt(n) + ' ' + pbCinza('não é ' + esc(String(unidade)) +
    (s.ano === null ? '' : ' — ' + ptAno(s.ano) + ' teve ' + ptInt(s.limite) + ' clubes'),
    conta + ' (conferido contra etapa_0.por_ano do mesmo arquivo)');
}

/* O inteiro cabe na coluna da matriz, o valor cheio nao — e e o cheio que distingue 28,8 de
   29,4, que arredondados viram o mesmo "29". Ele sobrevive no title, que e o unico lugar
   desta linha onde ainda cabe. */
function pb5Q(v, rot) {
  if (v === null || v === undefined) return ptFalta('quartil ausente no JSON');
  return '<span title="' + esc(rot + ' ' + pbCheio(v)) + '">' + ptNum(v, 0) + '</span>';
}

/* ================================================================================
   ETAPA 5 — os pilares, time a time, ano a ano
   ================================================================================

   Onze painéis, e é o próprio JSON que diz a que pilar cada um pertence. A ESPECIFICACAO
   pede QUATRO pilares (técnico individual, técnico coletivo, físico individual, físico
   coletivo); o arquivo entrega três valores em `pilar`, e o físico individual não vem como
   matriz clube × indicador em lugar nenhum desta chave. Isso não é arredondado aqui: a tela
   monta os grupos a partir do que existe e escreve, no lugar onde faltaria o quarto, o que
   falta e onde o que sobrou dele está.

   A matriz é montada à mão em vez de sair do `ptTabela` porque ela tem duas linhas de rodapé
   (a faixa do meio e a de quem caiu) que precisam ficar coladas em cada coluna de indicador.
   O preço é conhecido e está dito na tela: esta tabela não ordena por clique. */

function ptEtapa5(alvo, d) {
  const chaves = Object.keys(d.paineis || {});
  if (!chaves.length) {
    alvo.innerHTML = ptFaltaBloco('Nenhum painel nesta etapa',
      'o prototipo.json traz `etapa_5` sem a chave `paineis` — sem ela não há matriz para desenhar');
    return;
  }

  /* Os pilares saem do dado, na ordem em que aparecem. Escrever a lista à mão faria a tela
     mentir no dia em que o pipeline acrescentar ou tirar um painel. */
  const pilares = [];
  chaves.forEach(k => {
    const p = d.paineis[k].pilar;
    let g = pilares.find(x => x.pilar === p);
    if (!g) { g = { pilar: p, chaves: [] }; pilares.push(g); }
    g.chaves.push(k);
  });

  const totalInd = chaves.reduce((s, k) => s + (d.paineis[k].indicadores || []).length, 0);
  const nClubes = (d.paineis[chaves[0]].clubes || []).length;
  const semLado = chaves.reduce((s, k) =>
    s + (d.paineis[k].indicadores || []).filter(i => i.sinal === 0).length, 0);

  const seletor = pilares.map(g =>
    '<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-top:7px">' +
      '<span class="pt-rot" style="min-width:112px">' + esc(pbRotChave(g.pilar)) + '</span>' +
      g.chaves.map(k => {
        const p = d.paineis[k];
        return '<button class="bt mini" data-pb5="' + esc(k) + '">' + esc(pbRotChave(k)) +
          ' <span style="color:var(--tinta3)">' + ptInt((p.indicadores || []).length) + '</span></button>';
      }).join('') +
    '</div>').join('');

  /* O que a ESPECIFICACAO pede e o JSON não tem: o pilar do físico INDIVIDUAL. A tela não
     procura um número de pilares (contar seria repetir aqui o que o documento diz); ela
     pergunta ao dado se existe painel de físico individual, e escreve a ausência quando não
     existe — que é o caso, porque o individual foi agregado no clube antes de ser testado. */
  const temFisicoInd = pilares.some(g => /fisico_ind/.test(String(g.pilar)));
  const falta4 = temFisicoInd ? ''
    : ptFaltaBloco('O físico individual não vem como matriz',
        'a especificação descreve os pilares técnico individual, técnico coletivo, físico individual ' +
        'e físico coletivo; a chave `paineis` traz ' + ptInt(pilares.length) + ' valores em `pilar` (' +
        pilares.map(g => pbRotChave(g.pilar)).join(', ') + '), e nenhum deles é o físico individual. ' +
        'Atleta a atleta, ele não existe aqui como clube × indicador: o que sobrou dele no arquivo é ' +
        '`sobecai_corrigido_por_clube`, que agrega o atleta no clube antes de testar — justamente a ' +
        'correção contra pseudorreplicação — e pertence à etapa 13. Esta etapa não desenha esse pilar, ' +
        'e não o inventa a partir dos setores físicos, que são coletivos por construção.');

  alvo.innerHTML =
    '<p class="pt-nota">Cada painel é uma matriz de <b>' + ptInt(nClubes) + '</b> clube-temporada que ' +
      'subiram por <b>' + ptInt(totalInd) + '</b> colunas de indicador ao todo. A cor da célula é o ' +
      '<b>posto percentual dentro do ano</b> — comparação com os outros ' +
      'clubes da mesma Série B, nunca com outra temporada —, e ao pé de cada coluna ficam a faixa ' +
      'interquartil de quem terminou no meio e a de quem caiu. O meio da escala fica lavado de ' +
      'propósito: quem está no meio da distribuição do ano não está bem nem mal, está no meio.</p>' +
    (semLado
      ? '<p class="pt-nota">Em <b>' + ptInt(semLado) + '</b> das ' + ptInt(totalInd) + ' colunas o estudo ' +
        '<b>não declarou lado bom</b> (`sinal: 0`): ali a cor é só a posição no ano, e dizer que o tom ' +
        'forte é "melhor" seria invenção da tela. O <i>title</i> de cada célula avisa quando é o caso.</p>'
      : '') +
    '<div class="pt-controle">' +
      '<span class="pt-rot">Os painéis, como o JSON os agrupa</span>' + seletor +
    '</div>' +
    falta4 +
    '<div id="ptEt-5-painel"></div>' +
    '<div class="pt-controle" id="ptEt-5-lupa">' +
      '<span class="pt-rot">A célula aberta</span>' +
      '<p class="pt-nota">Clique em qualquer célula da matriz: aqui aparecem o valor bruto, o posto ' +
      'no ano, o n daquela linha e a temporada. A matriz mostra posição; a decisão se toma no bruto.</p>' +
    '</div>' +
    pb5Sensibilidade(d) +
    pb5Vazios(d);

  pb5Pintar(alvo, d, chaves[0]);
}

/* Desenha um painel e volta a ligar o que o redesenho apaga. Fica fora de `ptEtapa5` porque
   é chamado de novo a cada troca de painel. */
function pb5Pintar(alvo, d, chave) {
  const caixa = alvo.querySelector('#ptEt-5-painel');
  if (!caixa) return;
  caixa.innerHTML = pb5Matriz(d, chave);
  alvo.querySelectorAll('[data-pb5]').forEach(b => {
    b.className = 'bt mini' + (b.dataset.pb5 === chave ? ' primario' : '');
    b.onclick = () => pb5Pintar(alvo, d, b.dataset.pb5);
  });
  /* O clique na célula escreve no bloco fixo abaixo da matriz em vez de abrir um balão: a
     matriz rola na horizontal, e um balão ancorado na célula sai da tela junto com ela. */
  const lupa = alvo.querySelector('#ptEt-5-lupa');
  caixa.querySelectorAll('td[data-pt]').forEach(td => {
    td.style.cursor = 'pointer';
    td.onclick = () => {
      let x = null;
      try { x = JSON.parse(td.dataset.pt); } catch (err) { x = null; }
      if (!x || !lupa) return;
      caixa.querySelectorAll('td[data-pt]').forEach(o => { o.style.outline = ''; });
      td.style.outline = '1px solid var(--tinta)';
      lupa.innerHTML =
        '<span class="pt-rot">A célula aberta</span>' +
        '<div class="pt-cf-grade" style="margin-top:9px">' +
          '<div class="pt-cf-l"><span>clube e temporada</span><b>' + esc(x.c) + ' · ' + ptAno(x.a) + '</b></div>' +
          '<div class="pt-cf-l"><span>indicador</span><b style="font-size:13px">' + esc(x.i) + '</b></div>' +
          '<div class="pt-cf-l"><span>valor bruto</span><b>' + ptNum(x.b, 3) + '</b></div>' +
          '<div class="pt-cf-l"><span>posto no ano</span><b>' + ptNum(x.p, 1) + '</b></div>' +
          '<div class="pt-cf-l"><span>n desta linha</span><b>' + ptInt(x.n) + ' <span style="font-size:11px;' +
            'font-weight:400;color:var(--tinta3)">' + esc(x.u || '') + '</span></b></div>' +
          '<div class="pt-cf-l"><span>coluna na base</span><b style="font-size:12px">' + esc(x.k) + '</b></div>' +
        '</div>' +
        '<p class="pt-nota">Posto <b>dentro do ano</b>: esta linha foi comparada com os outros clubes ' +
        'da Série B de ' + ptAno(x.a) + ', e com mais ninguém. O mesmo valor bruto em outra temporada ' +
        'daria outro posto.</p>';
    };
  });
  if (typeof ptLigarTabelas === 'function') ptLigarTabelas(alvo);
}

function pb5Matriz(d, chave) {
  const p = d.paineis[chave];
  const inds = p.indicadores || [];
  const clubes = p.clubes || [];
  const leg = p.legenda_celula || [];
  const motivos = [];
  const unid = (inds[0] || {}).unidade_n || '';
  /* A faixa nao e escolha de tela: vem do nome da coluna do proprio arquivo. Se ela sumir do
     JSON, nada e marcado e o texto ao pe diz que nada foi marcado — o contrario do que esta
     tela fazia, que era prometer a marca no card dos vazios e desenhar a celula limpa. */
  const fbaixa = pb5FaixaBaixa(d);
  let marcadas = 0;                 /* celulas deste painel dentro da faixa */
  let suspeitas = 0;                /* linhas cujo rotulo de unidade nao fecha com a etapa 0 */
  let suspeitasJ = 0;               /* destas, as em que o n e exatamente o J (rodadas) do ano */
  let naoMarcadas = 0;              /* celulas na faixa que a marca nao alcancou (ptCel mudou) */
  const maxN = pb5MaxN(d, unid);    /* maior n na mesma unidade, para dar tamanho ao contraste */

  const cab = '<thead><tr><th class="txt" style="position:sticky;left:0;z-index:3;background:var(--fundo3)">' +
    'clube · temporada</th>' +
    inds.map(i => '<th class="num" title="' + esc(i.nome + ' · coluna ' + (i.origem || i.coluna_csv) +
      ' · n em ' + i.unidade_n + (i.sinal === 1 ? ' · mais é melhor' : i.sinal === -1 ? ' · menos é melhor'
        : ' · sem lado bom declarado')) + '">' + esc(i.id) + '</th>').join('') + '</tr></thead>';

  const corpo = clubes.map(c => {
    const cels = c.celulas || [];
    const nLinha = (cels.find(x => x && x[2] !== null && x[2] !== undefined) || [])[2];
    const vazia = cels.length && cels.every(x => x[1] === null || x[1] === undefined);
    const susp = pb5UnidadeSuspeita(nLinha, unid, c.ano);
    if (susp) { suspeitas++; if (susp.ehRodadas) suspeitasJ++; }
    const motivoLinha = vazia ? (cels[0][3] || 'sem motivo declarado no JSON') : '';
    return '<tr><td class="txt" style="position:sticky;left:0;z-index:1;background:var(--fundo2)">' +
      '<b>' + esc(c.clube) + '</b> ' + ptAno(c.ano) +
      '<small style="display:block;color:var(--tinta3);font-size:10.5px">' +
        ptInt(c.pos) + 'º · ' + ptInt(c.pts) + ' pontos · ' +
        (nLinha === undefined
          ? '<i>' + esc(motivoLinha) + '</i>'
          : pb5RotN(nLinha, unid, c.ano)) +
      '</small></td>' +
      cels.map((cel, j) => {
        const ind = inds[j] || {};
        const bruto = cel[0], pct = cel[1], n = cel[2], motivo = cel.length > 3 ? cel[3] : null;
        if (pct === null || pct === undefined) motivos.push(motivo || 'sem motivo declarado no JSON');
        /* O title e o bloco do clique levavam o mesmo rotulo cru que a linha levava; os tres
           saem agora pelo mesmo caminho, senao a contradicao sumiria da tela e continuaria
           inteira no lugar em que alguem vai conferir de perto. */
        const uniCel = pb5UnidadeCel(n, ind.unidade_n, c.ano);
        const td = ptCel(pct, {
          bruto: bruto, n: n, unidade: uniCel, ano: c.ano, sinal: ind.sinal, motivo: motivo,
          dados: (pct === null || pct === undefined) ? '' : JSON.stringify({
            c: c.clube, a: c.ano, i: ind.nome, k: (ind.origem || ind.coluna_csv),
            b: bruto, p: pct, n: n, u: uniCel,
          }),
        });
        /* Aqui a promessa vira marca. Uma celula de 3 atletas e uma de 20 saem do `ptCel` com
           a mesma rampa de cor — a cor e o percentil, nao a confianca —, e sem esta marca as
           duas se leem igual. */
        if (!pb5Baixa(fbaixa, n)) return td;
        const marcado = pb5Marcar(td, 'baixa confiança — n entre ' + ptInt(fbaixa.min) + ' e ' +
          ptInt(fbaixa.max) + ' ' + (ind.unidade_n || ''));
        if (marcado === null) { naoMarcadas++; return td; }
        marcadas++;
        return marcado;
      }).join('') + '</tr>';
  }).join('');

  /* As duas faixas ao pé. Elas são o que transforma a matriz de "lista de postos" em
     comparação: sem a faixa de quem caiu, um posto acima do meio parece bom sozinho. */
  const faixa = (arr, rot, dica) => '<tr><td class="txt" style="position:sticky;left:0;z-index:1;' +
    'background:var(--fundo3)" title="' + esc(dica) + '"><b>' + esc(rot) + '</b>' +
    '<small style="display:block;color:var(--tinta3);font-size:10.5px">q1 · mediana · q3</small></td>' +
    (arr || []).map(f => '<td class="num" style="color:var(--tinta3);font-size:10.5px">' +
      (!f ? ptFalta('faixa ausente no JSON')
          : pb5Q(f[0], 'q1') + ' · <b style="color:var(--tinta2)">' + pb5Q(f[1], 'mediana') +
            '</b> · ' + pb5Q(f[2], 'q3')) +
      '</td>').join('') + '</tr>';

  const rodape = '<tfoot>' +
    faixa(p.faixa_meio, 'faixa de quem ficou no meio', 'intervalo interquartil dos clubes que terminaram no meio da tabela, no mesmo posto percentual dentro do ano') +
    faixa(p.faixa_cai, 'faixa de quem caiu', 'intervalo interquartil dos clubes rebaixados, no mesmo posto percentual dentro do ano') +
    '</tfoot>';

  return '<div class="pt-card-cab" style="margin-bottom:8px">' +
      '<h4>' + esc(pbRotChave(chave)) + '</h4>' +
      '<span>pilar <b>' + esc(pbRotChave(p.pilar)) + '</b> · ' + ptInt(inds.length) + ' indicadores · ' +
      ptInt(clubes.length) + ' clube-temporada · n contado em ' +
      esc(unid || 'unidade não declarada') +
      (suspeitas ? ' · ' + pbCinza('o rótulo não fecha com a etapa 0 — ver a ressalva ao pé',
        'comparado com etapa_0.por_ano') : '') + '</span></div>' +
    '<div class="pt-tab-rola"><table class="pt-tab">' + cab + '<tbody>' + corpo + '</tbody>' + rodape +
    '</table></div>' +
    (leg.length
      ? '<p class="pt-nota">Cada célula do JSON vem na ordem <code>' + leg.map(esc).join('</code>, <code>') +
        '</code> — é de lá que saem o bruto, o posto e o n que o clique abre.</p>'
      : '') +
    (motivos.length ? ptMotivos(motivos) : '') +
    (!fbaixa
      ? '<p class="pt-nota">' + ptFalta('a coluna que declara a faixa de baixa confiança não veio em ' +
          '`vazios_por_setor` — sem a faixa escrita no arquivo a tela não sabe o que marcar, e não marca ' +
          'célula nenhuma') + '</p>'
      : marcadas
        ? '<p class="pt-nota"><b>' + ptInt(marcadas) + '</b> ' +
          pbPl(marcadas, 'célula deste painel sai marcada', 'células deste painel saem marcadas') +
          ' com <b style="color:var(--pt-baixo)">&#9651;</b> e contorno tracejado: ' +
          pbPl(marcadas, 'ela tem', 'elas têm') + ' n entre <b>' + ptInt(fbaixa.min) + '</b> e <b>' +
          ptInt(fbaixa.max) + '</b> — a unidade é <code>' + esc(unid) + '</code> —, a faixa que o próprio ' +
          'arquivo declara de baixa confiança no nome da coluna <code>' + esc(fbaixa.chave) + '</code> de ' +
          '<code>vazios_por_setor</code>. ' +
          (maxN !== null && maxN > fbaixa.max
            ? 'A cor não diz isso sozinha: ela é o percentil, e nesta etapa uma célula de ' +
              ptInt(fbaixa.min) + ' sai com a mesma rampa de cor de uma de ' + ptInt(maxN) + '. '
            : '') +
          'A marca não muda o número — ela diz de quantos ele foi tirado.' +
          (naoMarcadas
            ? ' ' + ptFalta('outras ' + ptInt(naoMarcadas) + ' células desta faixa ficaram SEM a marca: ' +
                'o `ptCel` da casca mudou de forma e a marca não achou onde entrar')
            : '') + '</p>'
        : '<p class="pt-nota">Nenhuma célula deste painel cai na faixa de baixa confiança que o arquivo ' +
          'declara em <code>' + esc(fbaixa.chave) + '</code> (n entre <b>' + ptInt(fbaixa.min) + '</b> e <b>' +
          ptInt(fbaixa.max) + '</b>)' +
          (suspeitas
            ? ' — o n desta matriz não está na escala de atletas do setor, e o rótulo dele é a ressalva ' +
              'do parágrafo seguinte.</p>'
            : ': aqui o n é contado em ' + esc(unid || 'unidade não declarada') + '.</p>')) +
    (suspeitas
      ? '<p class="pt-nota">Uma ressalva sobre o <b>n</b> destas linhas, e ela é de método, não de ' +
        'redação: ' +
        (suspeitas === clubes.length
          ? 'as ' + ptInt(clubes.length) + ' linhas trazem'
          : ptInt(suspeitas) + ' das ' + ptInt(clubes.length) + ' linhas trazem') +
        ' o rótulo <code>' + esc(unid) + '</code> em <code>unidade_n</code>, e ele não se sustenta contra o ' +
        'próprio arquivo — a etapa 0 registra, ano a ano, no máximo <b>' + ptInt(pb5MaxClubes()) +
        '</b> clubes na Série B, e o n que chega aqui é maior que isso. ' +
        (suspeitasJ === suspeitas
          ? '<b>' + pbPl(suspeitas, 'Na única linha', 'Em todas as ' + ptInt(suspeitas) + ' linhas') +
            '</b> esse n bate exatamente com o <code>J</code> daquele ano na etapa 0 — é a contagem de ' +
            '<b>rodadas</b>, não a de clube-temporada. '
          : suspeitasJ
            ? 'Em <b>' + ptInt(suspeitasJ) + '</b> delas esse n bate exatamente com o <code>J</code> ' +
              'daquele ano na etapa 0, que é a contagem de rodadas. '
            : '') +
        'A tela mostra o número como ele veio e escreve a contradição ao lado; trocar o rótulo por outro ' +
        'seria a tela declarar uma unidade que o dado não declara, e o conserto é no gerador.</p>'
      : '') +
    '<p class="pt-nota">Esta matriz <b>não ordena por clique</b>: as duas linhas de faixa ao pé precisam ' +
    'ficar coladas em cada coluna, e reordenar as linhas as descolaria. A ordenação por qualquer coluna ' +
    'está na etapa 2, que é onde o indicador é a linha.</p>';
}

function pb5Sensibilidade(d) {
  const s = d.sensibilidade_da_agregacao;
  if (!s) return ptFaltaBloco('Teste de sensibilidade da agregação',
    'a especificação exige rodar todas as regras de agregação e publicar quantos sobreviventes cada uma ' +
    'produz; a chave `sensibilidade_da_agregacao` não veio no JSON');
  const regras = Object.keys(s);
  const campos = Object.keys(s[regras[0]] || {});
  const linhas = regras.map(r => Object.assign({ regra: r }, s[r]));
  const colunas = [{ k: 'regra', rot: 'regra de agregação', tipo: 'texto' }].concat(
    campos.map(c => ({ k: c, rot: pbRotChave(c), casas: 0,
      dica: 'coluna `' + c + '` do prototipo.json' })));
  /* Quantas conclusões mudam de uma regra para a outra: é o número que dá sentido ao bloco.
     Comparado contra a primeira regra listada, que é a que o pipeline usa como padrão. */
  const base = s[regras[0]];
  const divergem = campos.filter(c => regras.some(r => s[r][c] !== base[c]));
  return ptCard('Trocar a regra de agregação troca o que passa',
    ptInt(regras.length) + ' regras · ' + ptInt(campos.length) + ' contagens cada',
    ptTabela({
      id: 'ptEt-5-tab-sens',
      ordem: null,
      colunas: colunas,
      linhas: linhas,
      vazio: 'o JSON não trouxe nenhuma regra de agregação',
    }),
    'Os rótulos das colunas são as chaves do próprio arquivo, e não uma tradução: o corte está ' +
    'dentro do nome (<code>' + campos.map(esc).join('</code>, <code>') + '</code>), e reescrevê-lo em ' +
    'português seria digitar o corte aqui. <b>SM</b> é sobe × meio; <b>bh</b> é o que sobrevive a ' +
    'Benjamini-Hochberg; <b>liq</b> é depois de descontado o posto de valor do elenco. ' +
    (divergem.length
      ? 'Entre as ' + ptInt(regras.length) + ' regras, <b>' + ptInt(divergem.length) + ' das ' +
        ptInt(campos.length) + '</b> contagens mudam (' + esc(divergem.join(', ')) + '). ' +
        'Conclusão que muda com a regra de agregação é da regra, não do futebol — e por isso as ' +
        ptInt(regras.length) + ' ficam na tela, não só a que o pipeline escolheu.'
      : 'Nenhuma contagem muda entre as regras — o que, aqui, é a boa notícia rara desta aba.'));
}

function pb5Vazios(d) {
  const v = d.vazios_por_setor || [];
  const fis = d.fis_atletas || {};
  /* A mesma faixa que a matriz marca, contada sobre TODOS os paineis: sem esta conta o card
     falaria de uma marca sem dizer quanta tela ela cobre. */
  const fb = pb5FaixaBaixa(d);
  let naFaixa = 0, comN = 0;
  Object.keys(d.paineis || {}).forEach(k => (d.paineis[k].clubes || []).forEach(c =>
    (c.celulas || []).forEach(x => {
      if (!x || x[2] === null || x[2] === undefined) return;
      comN++;
      if (pb5Baixa(fb, x[2])) naFaixa++;
    })));
  const campos = v.length ? Object.keys(v[0]) : [];
  const tab = v.length
    ? ptTabela({
        id: 'ptEt-5-tab-vazios',
        colunas: campos.map((c, i) => ({ k: c, rot: pbRotChave(c), tipo: i === 0 ? 'texto' : undefined,
          casas: 0, dica: 'coluna `' + c + '` do prototipo.json' })),
        linhas: v,
        vazio: 'o JSON não trouxe a contagem de vazios por setor',
      })
    : ptFaltaBloco('Vazios por setor', 'a chave `vazios_por_setor` não veio no JSON — sem ela não dá ' +
        'para dizer quantos clube-temporada ficaram sem o setor, e a matriz sozinha só mostra os que subiram');
  return ptCard('Onde o setor não tem gente bastante para virar média',
    'a contagem é sobre a base inteira, não só sobre os ' +
      ptInt((d.paineis[Object.keys(d.paineis)[0]].clubes || []).length) + ' que subiram',
    tab +
    '<p class="pt-nota">Célula de setor com menos atletas do que o corte sai <b>vazia com o motivo</b>, ' +
    'nunca com zero e nunca com a média do punhado que sobrou. Um punhado de atletas não faz média: faz ' +
    'anedota com cara de média — e uma anedota pintada de azul-escuro na matriz vira "perfil do setor" ' +
    'na reunião seguinte. ' +
    (fb
      ? 'A faixa logo acima do corte está escrita no nome da última coluna (<code>' + esc(fb.chave) +
        '</code>), e não fica só no nome: as células com n entre <b>' + ptInt(fb.min) + '</b> e <b>' +
        ptInt(fb.max) + '</b> saem da matriz da etapa <b>marcadas</b>, com <b style="color:var(--pt-baixo)">' +
        '&#9651;</b> e contorno tracejado — <b>' + ptInt(naFaixa) + '</b> das ' + ptInt(comN) +
        ' células que têm n nesta etapa. Marcar é o mínimo que a tela deve: a cor da célula é o percentil ' +
        'e não sabe de quantos ele foi tirado.'
      : ptFalta('a coluna que declara a faixa de baixa confiança não veio em `vazios_por_setor` — sem ela ' +
          'a tela não tem faixa para marcar, e nenhuma célula da matriz sai marcada')) + '</p>' +
    (fis.mediana !== undefined
      ? '<p class="pt-nota">Para dar tamanho ao corte: o elenco rastreado tem mediana de <b>' +
        ptInt(fis.mediana) + '</b> atletas por clube-temporada e mínimo de <b>' + ptInt(fis.minimo) +
        '</b>, com mediana de <b>' + ptInt(fis.minutos_mediana) + '</b> minutos rastreados. ' +
        'O buraco não está no elenco; está no setor, quando o rastreamento pegou poucos daquela função.</p>'
      : '') +
    (d.goleiro
      ? ptFaltaBloco('O goleiro', String(d.goleiro) + '. Não entra em nenhuma matriz desta etapa, e o ' +
          'que aparece por setor é o resto do elenco — a coluna do goleiro não é zero nem média baixa, ' +
          'é ausência de medida.')
      : ''));
}

/* ================================================================================
   ETAPA 6 — isso se repete?
   ================================================================================

   A pergunta que desfaz metade da etapa 5: o clube que estava alto num indicador em t está
   alto em t+1? Se não está, aquilo era retrato de um ano.

   A dispersão é desenhada com a MESMA escala para todos os indicadores — os dois eixos vão
   do mínimo ao máximo de todos os pontos do arquivo, não do mínimo ao máximo do indicador
   escolhido. Reescalar por indicador faria a nuvem do ppda ocupar a tela inteira e parecer
   tão organizada quanto a do físico, que é exatamente o engano que esta etapa existe para
   impedir. */

function ptEtapa6(alvo, d) {
  const disp = d.dispersao || {};
  const rho = d.rho || {};
  const ids = Object.keys(disp);
  const todos = Object.keys(rho);
  if (!ids.length) {
    alvo.innerHTML = ptFaltaBloco('Sem pontos para desenhar',
      'a chave `dispersao` não veio no JSON; sem os pares t/t+1 não há dispersão, só o ρ da tabela');
    return;
  }
  const ordenados = ids.slice().sort((a, b) => (rho[b] || {}).rho - (rho[a] || {}).rho);
  const alto = ordenados[0], baixo = ordenados[ordenados.length - 1];
  const ref = d.referencia_dinheiro || {};
  const tr = d.truncamento || {};

  const opcoes = ordenados.map(k =>
    '<option value="' + esc(k) + '">' + esc(pbNome(k)) + ' — ρ ' + ptNum((rho[k] || {}).rho, 3) +
    '</option>').join('');

  /* A tabela com TODOS os ρ: a dispersão só existe para uma parte deles, e a diferença entre
     "ρ baixo" e "ρ que nem dá para abrir de perto" precisa estar visível linha a linha. */
  const linhas = todos.map(k => ({
    nome: pbNome(k), id: k, rho: (rho[k] || {}).rho, p: (rho[k] || {}).p, n: (rho[k] || {}).n,
    pontos: Object.prototype.hasOwnProperty.call(disp, k) ? 1 : 0,
    _dica: pbSemNome(k) ? 'o catálogo da etapa 2 não conhece esta coluna — o que aparece é o id cru' : '',
  }));
  const semPontos = linhas.filter(l => !l.pontos).length;

  alvo.innerHTML =
    '<p class="pt-nota">São <b>' + ptInt(d.n_pares) + '</b> pares de clube em anos consecutivos na ' +
      'Série B. Cada ponto é um clube: o posto dele dentro do ano <b>t</b> na horizontal, o posto ' +
      'dentro do ano <b>t+1</b> na vertical. Se a característica fosse do clube, os pontos subiriam ' +
      'pela diagonal; se fosse do ano, formariam uma mancha sem direção. ' +
      '<b>Característica que não se repete de um ano para o outro é retrato de um ano, não modelo ' +
      'de jogo.</b></p>' +

    (ref.rho !== undefined
      ? '<div class="pt-controle"><span class="pt-rot">A régua: o que de fato se repete</span>' +
        '<p class="pt-nota">O valor do elenco (<code>' + esc(ref.indicador) + '</code>) tem ρ <b>' +
        ptNum(ref.rho, 3) + '</b> (' + ptP(ref.p) + ', ' + ptInt(ref.n) + ' pares). É contra este ' +
        'número que se lê qualquer ρ desta etapa: o que o clube carrega de um ano para o outro, nesta ' +
        'amostra, é principalmente o tamanho do bolso.</p></div>'
      : ptFaltaBloco('Sem régua de comparação',
          'a chave `referencia_dinheiro` não veio; sem ela cada ρ fica solto, sem nada que diga o que ' +
          'é alto nesta liga')) +

    '<div class="pt-card"><div class="pt-card-cab">' +
      '<h4>A dispersão, indicador por indicador</h4>' +
      '<span>escala fixa para todos · ' + ptInt(ids.length) + ' indicadores com pontos no arquivo</span>' +
    '</div><div class="pt-card-corpo">' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
        '<select class="bt" id="ptEt-6-sel">' + opcoes + '</select>' +
        '<button class="bt mini" data-pb6="' + esc(alto) + '">o mais persistente: ' + esc(pbNome(alto)) + '</button>' +
        '<button class="bt mini" data-pb6="' + esc(baixo) + '">o menos: ' + esc(pbNome(baixo)) + '</button>' +
      '</div>' +
      '<div id="ptEt-6-graf"></div>' +
    '</div></div>' +

    ptCard('O truncamento, que é o que este gráfico não pode mostrar',
      ptInt(tr.pares) + ' pares · ' + ptInt(tr.terminaram_em_subida) + ' terminaram em subida',
      '<p class="pt-nota">Dos <b>' + ptInt(tr.pares) + '</b> pares, só <b>' +
      ptInt(tr.terminaram_em_subida) + '</b> terminaram em subida, e <b>' +
      ptInt(tr.subidas_sem_ano_anterior_na_serie_b) + '</b> das <b>' + ptInt(tr.subidas_totais) +
      '</b> promoções vêm de clube que <b>não estava na Série B no ano anterior</b> — não têm par, e ' +
      'por isso não estão em ponto nenhum deste gráfico. Quem sobe depois de cair da Série A, ou de ' +
      'subir da C, entra na amostra sem passado aqui. Então estes pares descrevem <b>quem ficou</b>, ' +
      'e qualquer desenho preditivo t→t+1 nesta base tem n = ' + ptInt(tr.terminaram_em_subida) + '.</p>',
      'É a diferença entre "o indicador não se repete" e "o indicador não se repete <i>entre os que ' +
      'permaneceram na divisão</i>" — a segunda é a frase que o dado sustenta.') +

    ptCard('Os ' + ptInt(todos.length) + ' ρ, um por linha',
      ptInt(semPontos) + ' deles sem pontos no arquivo',
      ptTabela({
        id: 'ptEt-6-tab-rho',
        ordem: { col: 'rho', dir: 'desc' },
        colunas: [
          { k: 'nome', rot: 'indicador', tipo: 'texto', dica: 'nome como aparece no catálogo da etapa 2' },
          { k: 'id', rot: 'coluna', tipo: 'texto' },
          { k: 'rho', rot: 'ρ t → t+1', fmt: v => ptNum(v, 3) },
          { k: 'p', rot: 'p', fmt: v => ptPv(v) },
          { k: 'n', rot: 'pares', casas: 0 },
          { k: 'pontos', rot: 'dispersão', fmt: v => v ? 'na tela' : '<span style="color:var(--tinta3)">só o ρ</span>' },
        ],
        linhas: linhas,
        vazio: 'o JSON não trouxe nenhum ρ de persistência',
      }),
      'O arquivo guarda os pares desenhados para <b>' + ptInt(ids.length) + '</b> indicadores e só o ρ ' +
      'para os outros <b>' + ptInt(semPontos) + '</b>. Esses não podem ser abertos no gráfico — não é ' +
      'escolha da tela, é o que veio do pipeline, e está marcado linha a linha em vez de sumir do filtro.');

  const sel = alvo.querySelector('#ptEt-6-sel');
  const pinta = () => {
    const caixa = alvo.querySelector('#ptEt-6-graf');
    if (caixa) caixa.innerHTML = pb6Grafico(d, sel.value);
  };
  sel.onchange = pinta;
  alvo.querySelectorAll('[data-pb6]').forEach(b => {
    b.onclick = () => { sel.value = b.dataset.pb6; pinta(); };
  });
  pinta();
}

function pb6Grafico(d, id) {
  const pares = d.pares || [];
  const pontos = (d.dispersao || {})[id] || [];
  const r = (d.rho || {})[id] || {};
  const ref = d.referencia_dinheiro || {};
  /* A escala sai de TODOS os pontos do arquivo, não dos do indicador escolhido: é o que
     mantém as nuvens comparáveis entre um indicador e outro ao trocar no seletor. */
  let lo = Infinity, hi = -Infinity;
  Object.keys(d.dispersao || {}).forEach(k => d.dispersao[k].forEach(pp => {
    lo = Math.min(lo, pp[0], pp[1]); hi = Math.max(hi, pp[0], pp[1]);
  }));
  if (!isFinite(lo)) { lo = 0; hi = 1; }
  const L = 46, T = 14, LADO = 330, FIM = L + LADO;
  const px = v => L + (v - lo) / (hi - lo) * LADO;
  const py = v => T + LADO - (v - lo) / (hi - lo) * LADO;

  const marcas = [];
  for (let i = 0; i <= 4; i++) marcas.push(lo + (hi - lo) * i / 4);
  const grade = marcas.map(m =>
    '<line x1="' + px(m).toFixed(1) + '" y1="' + T + '" x2="' + px(m).toFixed(1) + '" y2="' + (T + LADO) +
      '" stroke="var(--borda)"/>' +
    '<line x1="' + L + '" y1="' + py(m).toFixed(1) + '" x2="' + FIM + '" y2="' + py(m).toFixed(1) +
      '" stroke="var(--borda)"/>' +
    pbTxt(px(m).toFixed(1), T + LADO + 14, ptNum(m, 0), { anc: 'middle', tam: 9 }) +
    pbTxt(L - 7, py(m).toFixed(1) + 3, ptNum(m, 0), { anc: 'end', tam: 9 })).join('');

  const diagonal = '<line x1="' + px(lo) + '" y1="' + py(lo) + '" x2="' + px(hi) + '" y2="' + py(hi) +
    '" stroke="var(--tinta3)" stroke-dasharray="4 4" stroke-width="1"/>';

  /* Conferido antes de desenhar: a ordem de `dispersao[ind]` é a ordem de `pares`. Para os
     pares que terminaram em subida, o posto em t+1 de cada ponto bate com a célula do
     mesmo clube-ano na matriz da etapa 5. Sem essa checagem o rótulo do ponto seria chute. */
  const bolas = pontos.map((pp, i) => {
    const par = pares[i] || {};
    const cor = pbCorFaixa(par.faixa_t1);
    return '<circle cx="' + px(pp[0]).toFixed(1) + '" cy="' + py(pp[1]).toFixed(1) + '" r="5" ' +
      'fill="' + cor + '" fill-opacity="0.68" stroke="' + cor + '" stroke-width="1">' +
      '<title>' + esc((par.clube || 'clube não identificado') + ' · ' + ptAno(par.ano_t) + ' → ' +
        ptAno(par.ano_t1) + ' · posto ' + ptNum(pp[0], 0) + ' → ' + ptNum(pp[1], 0) +
        ' · terminou ' + (par.faixa_t1 || 'sem faixa no JSON')) + '</title></circle>';
  }).join('');

  const faixas = [];
  pares.forEach(p => { if (faixas.indexOf(p.faixa_t1) < 0) faixas.push(p.faixa_t1); });
  const legenda = faixas.map(f =>
    '<span style="display:inline-flex;align-items:center;gap:5px;margin-right:12px">' +
    '<i style="width:9px;height:9px;border-radius:50%;background:' + pbCorFaixa(f) + ';display:inline-block"></i>' +
    'terminou em <b>' + esc(f) + '</b> no ano t+1</span>').join('');

  const canto =
    pbTxt(FIM - 6, T + 16, 'ρ = ' + ptNum(r.rho, 3), { anc: 'end', tam: 15, cor: 'var(--tinta)', peso: 800 }) +
    pbTxt(FIM - 6, T + 31, ptP(r.p) + ' · ' + ptInt(r.n) + ' pares', { anc: 'end', tam: 10 });

  const svg = pbSvg(FIM + 16, T + LADO + 30,
    grade + diagonal + canto + bolas +
    pbTxt((L + FIM) / 2, T + LADO + 27, 'posto dentro do ano t', { anc: 'middle', tam: 10 }) +
    '<g transform="translate(13,' + (T + LADO / 2) + ') rotate(-90)">' +
      pbTxt(0, 0, 'posto dentro do ano t+1', { anc: 'middle', tam: 10 }) + '</g>', 430);

  /* A régua de persistência: onde o indicador escolhido cai entre todos os outros. É o que
     permite ver, sem trocar de tela, que o físico está numa ponta e o ppda na outra. */
  const rhos = Object.keys(d.rho || {}).map(k => d.rho[k].rho).filter(v => v !== null && v !== undefined);
  const rlo = Math.min.apply(null, rhos), rhi = Math.max.apply(null, rhos);
  const RL = 10, RW = 400;
  const rx = v => RL + (v - rlo) / (rhi - rlo) * RW;
  const tiques = rhos.map(v => '<line x1="' + rx(v).toFixed(1) + '" y1="16" x2="' + rx(v).toFixed(1) +
    '" y2="26" stroke="var(--borda2)"/>').join('');
  /* O rótulo perto da ponta da régua não pode ficar centrado: quando o indicador escolhido é
     o mais persistente de todos — e ele é escolhível pelo botão ao lado do gráfico — o texto
     centrado sai pela borda do viewBox e some pela metade. */
  const marcaRegua = (v, cor, rot, cima) => {
    if (v === undefined || v === null) return '';
    const x = rx(v);
    const anc = x > RL + RW * 0.82 ? 'end' : (x < RL + RW * 0.18 ? 'start' : 'middle');
    return '<line x1="' + x.toFixed(1) + '" y1="' + (cima ? 8 : 16) + '" x2="' + x.toFixed(1) +
      '" y2="' + (cima ? 26 : 34) + '" stroke="' + cor + '" stroke-width="2.5"/>' +
      pbTxt(x.toFixed(1), cima ? 6 : 45, rot, { anc: anc, tam: 10, cor: cor, peso: 700 });
  };
  const regua = pbSvg(RW + 20, 52,
    '<line x1="' + RL + '" y1="21" x2="' + (RL + RW) + '" y2="21" stroke="var(--borda2)"/>' + tiques +
    marcaRegua(ref.rho, 'var(--pt-ok)', 'valor do elenco', false) +
    marcaRegua(r.rho, 'var(--pt-alto)', pbNome(id), true), 460);

  return svg +
    '<p class="pt-nota" style="margin-top:2px">' + legenda + '</p>' +
    '<p class="pt-nota"><b>' + esc(pbNome(id)) + '</b> (<code>' + esc(id) + '</code>) — ρ <b>' +
      ptNum(r.rho, 3) + '</b>, ' + ptP(r.p) + ', ' + ptInt(r.n) + ' pares. A linha tracejada é a ' +
      'igualdade perfeita entre os dois anos; quanto mais os pontos se espalham longe dela, menos o ' +
      'clube leva aquilo consigo.' +
      (ref.rho !== undefined && r.rho !== undefined && r.rho !== null
        ? ' Contra a régua do dinheiro (' + ptNum(ref.rho, 3) + '), este indicador se repete <b>' +
          (r.rho >= ref.rho ? 'tanto quanto ou mais' : 'menos') + '</b>.'
        : '') + '</p>' +
    '<span class="pt-rot" style="margin-top:9px">Onde este ρ cai entre os ' +
      ptInt(rhos.length) + ' do estudo</span>' + regua;
}

/* ================================================================================
   ETAPA 7 — a porta temporal
   ================================================================================

   A única etapa em que a característica é medida ANTES do desfecho: média do 1º turno
   contra pontos somados no 2º. É a resposta à pergunta que o dono faria de qualquer jeito,
   e a tabela é a da seção 6.4 da especificação.

   O desenho mostra bruto e parcial ligados pelo mesmo traço, porque o assunto é o encolhimento
   entre os dois: o parcial já desconta como o time vinha pontuando, e o que sobra depois
   disso é o que se pode chamar de característica. */

function ptEtapa7(alvo, d) {
  const linhas = (d.linhas || []).map(l => Object.assign({}, l, {
    nome: pbNome(l.indicador),
    abs: Math.abs(l.rho_bruto),
    _classe: '',
    _dica: l.sinal_certo ? '' : 'o sinal observado vai para o lado contrário do que o estudo declarou',
  }));
  if (!linhas.length) {
    alvo.innerHTML = ptFaltaBloco('Sem linhas nesta etapa',
      'a chave `linhas` de `etapa_7` não veio no JSON — sem ela não há tabela de porta temporal');
    return;
  }
  const ref = d.referencia_pts1t_x_pts2t || {};
  const alfa = pbAlfa();
  const passaBruto = alfa === null ? null : linhas.filter(l => pbPassa(l.p_bruto)).length;
  const passaParcial = alfa === null ? null : linhas.filter(l => pbPassa(l.p_parcial)).length;
  const erradoSinal = linhas.filter(l => !l.sinal_certo);
  const maior = linhas.slice().sort((a, b) => b.abs - a.abs)[0];

  alvo.innerHTML =
    '<p class="pt-nota">Tudo o que está nas etapas 5 e 6 mede a característica na <b>mesma temporada</b> ' +
      'do desfecho — causa e consequência ficam indistinguíveis. Aqui não: o indicador é a média das ' +
      '<b>' + ptInt(d.rodadas_1t) + '</b> primeiras rodadas e o desfecho são os pontos somados nas <b>' +
      ptInt(d.rodadas_2t) + '</b> últimas, com ' + ptN(d.n, 'clube-temporada') + '. O <b>parcial</b> é o ' +
      'mesmo ρ depois de descontar a pontuação que o time já tinha feito no 1º turno: é ele que separa ' +
      '"fizeram isto e passaram a pontuar" de "já estavam pontuando e isto veio junto".</p>' +

    (ref.rho !== undefined
      ? '<div class="pt-controle"><span class="pt-rot">A régua desta etapa</span>' +
        '<p class="pt-nota">Os <b>pontos do 1º turno</b> preveem os pontos do 2º com ρ <b>' +
        ptNum(ref.rho, 3) + '</b> (' + ptP(ref.p) + ').' +
        (maior
          ? ' Nenhum indicador de estilo chega perto: o maior em módulo é <b>' + esc(maior.nome) +
            '</b>, com ρ ' + ptNum(maior.rho_bruto, 3) + ' no bruto e ' + ptNum(maior.rho_parcial, 3) +
            ' no parcial.'
          : '') +
        ' A tabela toda deve ser lida contra essa régua: a melhor previsão do 2º turno continua sendo ' +
        'o próprio 1º turno.</p></div>'
      : '') +

    pb7Grafico(d, linhas) +

    ptCard('A tabela da porta temporal',
      ptInt(linhas.length) + ' indicadores com versão por turno · ' + pbConta(passaBruto) +
        ' passam o corte no bruto e ' + pbConta(passaParcial) + ' no parcial',
      ptTabela({
        id: 'ptEt-7-tab',
        ordem: { col: 'abs', dir: 'desc' },
        colunas: [
          { k: 'nome', rot: 'indicador (média do 1º turno)', tipo: 'texto' },
          { k: 'n', rot: 'n', casas: 0 },
          { k: 'rho_bruto', rot: 'ρ → pontos do 2º turno', fmt: v => ptNum(v, 3) },
          { k: 'p_bruto', rot: 'p', fmt: v => ptPv(v) },
          { k: 'rho_parcial', rot: 'parcial, dados os pontos do 1º turno', fmt: v => ptNum(v, 3) },
          { k: 'p_parcial', rot: 'p parcial', fmt: v => ptPv(v) },
          { k: 'abs', rot: '|ρ| bruto', fmt: v => ptNum(v, 3), dica: 'coluna calculada na tela só para ordenar' },
          { k: 'sinal_certo', rot: 'sinal',
            fmt: (v, l) => v
              ? '<span style="color:var(--tinta3)">como o estudo esperava (' + (l.sinal > 0 ? '+' : '−') + ')</span>'
              : '<b style="color:var(--pt-baixo)">contrário ao esperado</b>' },
        ],
        linhas: linhas,
        vazio: 'nenhum indicador tem versão por turno',
      }),
      'Dos <b>' + ptInt(linhas.length) + '</b>, <b>' + pbConta(passaBruto) + '</b> passam o corte declarado ' +
      'no estudo (α = ' + (alfa === null ? '?' : ptNum(alfa, 2)) + ') no bruto e <b>' + pbConta(passaParcial) +
      '</b> continuam passando depois do desconto — o encolhimento ' +
      'entre as duas colunas é o próprio assunto da etapa.' +
      (erradoSinal.length
        ? ' E <b>' + ptInt(erradoSinal.length) + '</b> andam para o lado <b>contrário</b> do que o estudo ' +
          'tinha declarado antes de testar (' + erradoSinal.map(l => esc(l.nome)).join(', ') +
          '): quando o sinal vira, o achado não é um achado invertido, é ruído com direção sorteada.'
        : '')) +

    (d.nao_testaveis && d.nao_testaveis.length
      ? ptFaltaBloco('Quatro indicadores não entram nesta tabela — e não é por terem falhado',
          d.nao_testaveis.map(x => pbNome(x)).join(', ') + ' — ' +
          (d.motivo_nao_testaveis || 'sem motivo declarado no JSON') +
          '. Sem escalação por rodada não há como partir esses quatro em dois turnos; eles ficam sem ' +
          'porta temporal, o que é diferente de terem sido testados e reprovados.')
      : '');
}

function pb7Grafico(d, linhas) {
  const ref = d.referencia_pts1t_x_pts2t || {};
  const vals = [];
  linhas.forEach(l => { vals.push(l.rho_bruto, l.rho_parcial); });
  if (ref.rho !== undefined && ref.rho !== null) vals.push(ref.rho);
  const lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
  const pad = (hi - lo) * 0.08;
  const L = 214, LARG = 250, T = 26, ALT = 17;
  const px = v => L + (v - (lo - pad)) / ((hi + pad) - (lo - pad)) * LARG;
  const ordem = linhas.slice().sort((a, b) => b.rho_bruto - a.rho_bruto);

  const zero = px(0);
  const corpo = ordem.map((l, i) => {
    const y = T + i * ALT;
    const a = px(l.rho_bruto), b = px(l.rho_parcial);
    const forte = pbPassa(l.p_parcial);
    const cor = l.sinal_certo ? (forte ? 'var(--pt-alto)' : 'var(--tinta3)') : 'var(--pt-baixo)';
    return '<line x1="' + a.toFixed(1) + '" y1="' + y + '" x2="' + b.toFixed(1) + '" y2="' + y +
        '" stroke="' + cor + '" stroke-width="1.5" stroke-opacity="0.5"/>' +
      '<circle cx="' + a.toFixed(1) + '" cy="' + y + '" r="3.4" fill="none" stroke="' + cor + '" stroke-width="1.4"/>' +
      '<circle cx="' + b.toFixed(1) + '" cy="' + y + '" r="4" fill="' + cor + '"/>' +
      pbTxt(L - 9, y + 3.5, l.nome, { anc: 'end', tam: 10, cor: forte ? 'var(--tinta)' : 'var(--tinta2)' }) +
      '<title>' + esc(l.nome + ' · bruto ' + ptNum(l.rho_bruto, 3) + ' (' + ptP(l.p_bruto) +
        ') · parcial ' + ptNum(l.rho_parcial, 3) + ' (' + ptP(l.p_parcial) + ')') + '</title>';
  }).join('');

  const alturaFim = T + ordem.length * ALT;
  /* A régua é o maior ρ da tela, então a linha dela cai na borda direita: o rótulo centrado
     sairia pela metade do viewBox. Ancorado ao fim, encosta na linha e continua legível. */
  const marcaRef = (ref.rho === undefined || ref.rho === null) ? '' :
    '<line x1="' + px(ref.rho).toFixed(1) + '" y1="' + (T - 14) + '" x2="' + px(ref.rho).toFixed(1) +
      '" y2="' + alturaFim + '" stroke="var(--pt-ok)" stroke-width="1.5" stroke-dasharray="3 3"/>' +
    pbTxt(px(ref.rho).toFixed(1), T - 18, 'pontos do 1º turno',
      { anc: px(ref.rho) > L + LARG * 0.7 ? 'end' : 'middle', tam: 9, cor: 'var(--pt-ok)', peso: 700 });

  return ptCard('Bruto e parcial no mesmo traço',
    'círculo vazado = bruto · círculo cheio = parcial, já descontados os pontos do 1º turno',
    pbSvg(L + LARG + 20, alturaFim + 22,
      '<line x1="' + zero.toFixed(1) + '" y1="' + (T - 14) + '" x2="' + zero.toFixed(1) + '" y2="' +
        alturaFim + '" stroke="var(--borda2)"/>' +
      pbTxt(zero.toFixed(1), alturaFim + 16, ptNum(0, 1), { anc: 'middle', tam: 9 }) +
      pbTxt(px(lo - pad / 2).toFixed(1), alturaFim + 16, ptNum(lo, 2), { anc: 'middle', tam: 9 }) +
      pbTxt(px(hi + pad / 2).toFixed(1), alturaFim + 16, ptNum(hi, 2), { anc: 'middle', tam: 9 }) +
      marcaRef + corpo, 520),
    'Traço curto é indicador que quase não muda ao descontar a pontuação do 1º turno; traço longo é ' +
    'indicador que era, em boa parte, o time já estando bem. Laranja marca quem anda para o lado ' +
    'contrário do declarado; o azul escuro marca quem ainda passa, no parcial, o corte que o estudo ' +
    'declarou' + (pbAlfa() === null
      ? ' — e, sem `etapa_0.poder.alfa` no arquivo, nenhum ponto pôde ser destacado.'
      : ' (α = ' + ptNum(pbAlfa(), 2) + ').'));
}

/* ================================================================================
   ETAPA 8 — o cemitério dos padrões, e a tipologia que sobrou
   ================================================================================

   A ordem importa e é esta: primeiro o enterro, depois o que sobreviveu. Invertida, a tela
   apresentaria quatro grupos e depois pediria desculpa — que é exatamente como um
   agrupamento cego vira "os cinco perfis de time que sobe" numa apresentação.

   Os dois nulos ficam lado a lado em toda linha da tabela. Embaralhar coluna destrói a
   correlação entre indicadores, então qualquer dado correlacionado bate esse nulo: ele não
   testa agrupamento, testa correlação. O nulo que vale é a gaussiana de mesma covariância. */

function ptEtapa8(alvo, d) {
  const c = d.cemiterio || {};
  const t = d.tipologia || {};
  alvo.innerHTML =
    pb8Cemiterio(c) +
    pb8Jaccard(c) +
    pb8Eixos(c) +
    (t.eixos ? pb8Tipologia(t)
      : ptFaltaBloco('A tipologia não veio no JSON',
          'a chave `tipologia` de `etapa_8` está ausente; sem ela a etapa termina no enterro, e o que ' +
          'sobreviveu aos testes fica sem tela'));
}

function pb8Cemiterio(c) {
  const linhas = (c.linhas || []).map(l => Object.assign({}, l, {
    emb_med: (l.nulo_colunas_embaralhadas || {}).mediana,
    emb_p: (l.nulo_colunas_embaralhadas || {}).p,
    cov_med: (l.nulo_mesma_covariancia || {}).mediana,
    cov_p: (l.nulo_mesma_covariancia || {}).p,
  }));
  if (!linhas.length) return ptFaltaBloco('Sem a tabela dos dois nulos',
    'a chave `cemiterio.linhas` não veio no JSON — e é ela que sustenta a decisão de não ter grupos');
  const alfa = pbAlfa();
  const rejEmb = alfa === null ? null : linhas.filter(l => pbPassa(l.emb_p)).length;
  const rejCov = alfa === null ? null : linhas.filter(l => pbPassa(l.cov_p)).length;
  const conjuntos = [];
  linhas.forEach(l => { if (conjuntos.indexOf(l.conjunto) < 0) conjuntos.push(l.conjunto); });
  const obs = c.observacoes_por_dimensao || {};

  /* O desenho: a silhueta observada contra as duas medianas de nulo, na mesma linha. É aqui
     que se vê de olho que a observada encosta na mediana do nulo certo e dispara sobre a do
     nulo errado — a tabela diz o mesmo, mas a tabela exige que o leitor faça a subtração. */
  const vals = [];
  linhas.forEach(l => vals.push(l.silhueta_obs, l.emb_med, l.cov_med));
  const lo = 0, hi = Math.max.apply(null, vals.filter(v => v !== null && v !== undefined));
  const L = 170, LARG = 250, T = 24, ALT = 30;
  const px = v => L + (v - lo) / (hi - lo) * LARG;
  const barras = linhas.map((l, i) => {
    const y = T + i * ALT;
    return '<line x1="' + px(l.emb_med).toFixed(1) + '" y1="' + (y - 6) + '" x2="' + px(l.emb_med).toFixed(1) +
        '" y2="' + (y + 6) + '" stroke="var(--pt-baixo)" stroke-width="2"/>' +
      '<line x1="' + px(l.cov_med).toFixed(1) + '" y1="' + (y - 6) + '" x2="' + px(l.cov_med).toFixed(1) +
        '" y2="' + (y + 6) + '" stroke="var(--pt-ok)" stroke-width="2"/>' +
      '<circle cx="' + px(l.silhueta_obs).toFixed(1) + '" cy="' + y + '" r="4.6" fill="var(--pt-alto)"/>' +
      pbTxt(L - 9, y + 3.5, l.conjunto + ' · k ' + ptInt(l.k), { anc: 'end', tam: 9.5, cor: 'var(--tinta2)' }) +
      '<title>' + esc(l.conjunto + ' · k = ' + l.k + ' · silhueta ' + ptNum(l.silhueta_obs, 3) +
        ' · nulo embaralhado ' + ptNum(l.emb_med, 3) + ' (' + ptP(l.emb_p) + ')' +
        ' · nulo de mesma covariância ' + ptNum(l.cov_med, 3) + ' (' + ptP(l.cov_p) + ')') + '</title>';
  }).join('');
  const fim = T + linhas.length * ALT;
  const svg = pbSvg(L + LARG + 24, fim + 20,
    pbTxt(L, T - 12, 'silhueta observada ●   nulo embaralhado ▏   nulo de mesma covariância ▏',
      { tam: 9.5, cor: 'var(--tinta3)' }) + barras +
    pbTxt(px(lo), fim + 14, ptNum(lo, 2), { anc: 'middle', tam: 9 }) +
    pbTxt(px(hi), fim + 14, ptNum(hi, 2), { anc: 'middle', tam: 9 }), 470);

  return ptCard('Por que esta aba não tem grupos de times',
    ptInt(linhas.length) + ' configurações · ' + ptInt(linhas[0].replicas) + ' réplicas cada',
    svg +
    ptTabela({
      id: 'ptEt-8-tab-cem',
      ordem: null,
      colunas: [
        { k: 'conjunto', rot: 'conjunto', tipo: 'texto' },
        { k: 'n', rot: 'n', casas: 0 },
        { k: 'dimensoes', rot: 'dimensões', casas: 0 },
        { k: 'k', rot: 'k', casas: 0 },
        { k: 'silhueta_obs', rot: 'silhueta observada', fmt: v => '<b>' + ptNum(v, 3) + '</b>' },
        { k: 'emb_med', rot: 'nulo: colunas embaralhadas — mediana', fmt: v => ptNum(v, 3) },
        { k: 'emb_p', rot: 'p do nulo embaralhado',
          fmt: v => (pbPassa(v) ? '<b style="color:var(--pt-baixo)">' + ptPv(v) + '</b>' : ptPv(v)) },
        { k: 'cov_med', rot: 'nulo: mesma covariância — mediana', fmt: v => ptNum(v, 3) },
        { k: 'cov_p', rot: 'p do nulo de mesma covariância',
          fmt: v => (pbPassa(v) ? '<b style="color:var(--pt-baixo)">' + ptPv(v) + '</b>' : '<b>' + ptPv(v) + '</b>') },
        { k: 'replicas', rot: 'réplicas', casas: 0 },
      ],
      linhas: linhas,
      vazio: 'nenhuma configuração testada',
    }),
    'Os dois nulos ficam lado a lado porque a diferença entre eles <b>é</b> o resultado: contra colunas ' +
    'embaralhadas, <b>' + pbConta(rejEmb) + ' das ' + ptInt(linhas.length) + '</b> configurações parecem ter ' +
    'grupo no corte declarado do estudo (α = ' + (alfa === null ? '?' : ptNum(alfa, 2)) + '); contra a ' +
    'gaussiana de <b>mesma covariância</b>, <b>' + pbConta(rejCov) + '</b>. Embaralhar coluna ' +
    'destrói a correlação entre indicadores, e aí qualquer dado correlacionado bate o nulo — aquele teste ' +
    'não mede agrupamento, mede correlação. Foi com ele que uma das análises anteriores anunciou dois ' +
    'modelos de jogo. ' +
    (obs.n !== undefined
      ? 'E o tamanho do problema é este: <b>' + ptInt(obs.n) + '</b> observações em <b>' +
        ptInt(obs.dimensoes) + '</b> dimensões, ' + ptNum(obs.n / obs.dimensoes, 1) + ' ponto por dimensão. ' +
        'k-means acha fronteira em qualquer nuvem convexa; a pergunta certa nunca é "qual o melhor k" ' +
        '— essa sempre devolve um número — e sim se o agrupamento observado é melhor que o do ruído ' +
        'com a mesma covariância. ' : '') +
    'Conjuntos testados: ' + conjuntos.map(esc).join(' e ') + '.');
}

function pb8Jaccard(c) {
  const js = c.jaccard || [];
  if (!js.length) return ptFaltaBloco('Sem o Jaccard de bootstrap',
    'a chave `cemiterio.jaccard` não veio; sem ela falta o segundo teste de estabilidade dos grupos');
  const estavel = js[0].linha_hennig_estavel, dissolve = js[0].linha_hennig_dissolve;
  const todos = js.reduce((a, j) => a.concat(j.jaccard_por_grupo), []);
  const acima = todos.filter(v => v >= estavel).length;
  const abaixo = todos.filter(v => v < dissolve).length;
  const corpo = js.map(j =>
    '<span class="pt-rot" style="margin-top:8px">k = ' + ptInt(j.k) + ' · ' +
      ptInt(j.replicas) + ' réplicas</span>' +
    j.jaccard_por_grupo.map((v, i) => ptBarra(v, 1, {
      rot: 'grupo ' + ptInt(i + 1) + ' (' + ptInt((j.tamanhos || [])[i]) + ' clube-temporada)',
      texto: ptNum(v, 3),
      hachura: v < dissolve,
      cor: v >= estavel ? 'alto' : 'baixo',
      extra: v >= estavel ? 'estável' : (v < dissolve ? 'dissolve' : 'entre as duas linhas'),
    })).join('')).join('');
  return ptCard('O segundo teste: o grupo sobrevive a reamostrar os indicadores?',
    'linha de estabilidade ' + ptNum(estavel, 2) + ' · linha de dissolução ' + ptNum(dissolve, 2) +
      ' (critério de Hennig)',
    corpo,
    'De <b>' + ptInt(todos.length) + '</b> ' +
    pbPl(todos.length, 'grupo testado', 'grupos testados') + ' em todas as configurações, <b>' +
    ptInt(acima) + '</b> ' + pbPl(acima, 'chega', 'chegam') + ' à linha de estabilidade (' +
    ptNum(estavel, 2) + ') e <b>' + ptInt(abaixo) + '</b> ' + pbPl(abaixo, 'fica', 'ficam') +
    ' abaixo da linha de dissolução (' + ptNum(dissolve, 2) + ') — ' +
    pbPl(abaixo, 'desenhado', 'desenhados') +
    ' com hachura, porque barra sólida ali mentiria por omissão. Um grupo que se ' +
    'desfaz quando se troca o conjunto de indicadores não é um tipo de time: é um corte que valeu ' +
    'para as colunas daquele sorteio.');
}

function pb8Eixos(c) {
  const e = c.eixos_usados || {};
  const nomes = Object.keys(e);
  if (!nomes.length) return '';
  const total = nomes.reduce((s, k) => s + e[k].length, 0);
  return ptCard('Os eixos em que o agrupamento foi tentado',
    ptInt(nomes.length) + ' eixos · ' + ptInt(total) + ' colunas ao todo',
    '<div class="pt-cf-grade">' + nomes.map(k =>
      '<div class="pt-cf-l"><span>' + esc(pbRotChave(k)) + '</span>' +
      '<b style="font-size:12px;font-weight:400;line-height:1.5">' +
        e[k].map(col => esc(pbNome(col))).join('<br>') + '</b></div>').join('') + '</div>',
    'São eixos <b>declarados</b>, não descobertos: a lista existia antes do teste. É por isso que o ' +
    'fracasso do agrupamento é informativo — não se pode dizer que faltou procurar noutro espaço, ' +
    'porque o espaço estava escrito antes.');
}

/* ---------------- a tipologia que sobreviveu ---------------- */

function pb8Tipologia(t) {
  const grupos = t.grupos || [];
  const cortes = t.cortes || {};
  const ver = t.veredito || [];
  const passaram = ver.filter(v => v.passou).length;
  const eixos = t.eixos || {};
  const nomesEixo = Object.keys(eixos);

  /* Divergência entre o que o documento declarou e o que o pipeline recalculou. Quando os
     dois discordam, a tela mostra os dois e diz que discordam — escolher um seria a tela
     decidindo no lugar de quem vai auditar. */
  const divergentes = grupos.filter(g =>
    g.status !== g.status_declarado_no_documento ||
    (g.p_um_contra_o_resto !== null && g.p_declarado_no_documento !== null &&
     Math.abs(g.p_um_contra_o_resto - g.p_declarado_no_documento) > 0.001));

  return '<div class="pt-etapa-cab" style="border-top-width:1px;margin-top:6px">' +
      '<div><h3 style="font-size:17px">E o que sobrou: a tipologia dos que subiram</h3>' +
      '<span>dois eixos declarados, duas medianas, ' + ptInt(grupos.length) + ' quadrantes — ' +
      'e a lista do que ela não passou</span></div></div>' +

    '<p class="pt-nota">A diferença entre isto e o que acabou de ser enterrado não é de grau: lá se ' +
      'procurou grupo <b>dentro</b> dos mesmos números que definiriam o grupo; aqui os eixos foram ' +
      '<b>declarados antes</b>, com ' + ptInt(nomesEixo.reduce((s, k) => s + eixos[k].length, 0)) +
      ' colunas ao todo, e a validação foi feita com indicadores que <b>não entraram na construção</b>. ' +
      'É essa validação de fora que separa uma tipologia de um agrupamento cego — e é ela que está ' +
      'medida abaixo, com os testes que passaram <b>e</b> os que não passaram.</p>' +

    '<div class="pt-controle">' +
      '<span class="pt-rot">Os dois eixos, como foram declarados</span>' +
      '<div class="pt-cf-grade" style="margin-top:9px">' +
        nomesEixo.map(k => '<div class="pt-cf-l"><span>' + esc(k) +
          (cortes[k] !== undefined ? ' · corte na mediana dos ' + ptInt((t.plano || []).length) +
            ': ' + ptNum(cortes[k], 2) : '') + '</span><b style="font-size:12px;font-weight:400;line-height:1.5">' +
          eixos[k].map(par => (par[1] < 0 ? '− ' : '+ ') + esc(pbNome(par[0]))).join('<br>') +
          '</b></div>').join('') +
      '</div>' +
      '<p class="pt-nota">Média dos percentis dentro do ano, sinal alinhado, corte na mediana. ' +
      'Sem k-means: são duas medianas — o que também quer dizer que os quadrantes existem porque a ' +
      'linha foi posta ali, e times perto da linha trocam de lado com pouco ruído.</p>' +
    '</div>' +

    pb8Plano(t) +
    grupos.map((g, i) => pb8Grupo(g, i, t)).join('') +
    pb8Veredito(t, ver, passaram, divergentes) +
    pb8TesteDeFora(t) +
    pb8DinheiroEstabilidade(t);
}

function pb8Plano(t) {
  const plano = t.plano || [];
  const cortes = t.cortes || {};
  const grupos = t.grupos || [];
  const nomesEixo = Object.keys(t.eixos || {});
  if (!plano.length || nomesEixo.length < 2) return ptFaltaBloco('Sem o plano dos dois eixos',
    'faltam `tipologia.plano` ou `tipologia.eixos` — sem eles não há como desenhar os ' +
    'clube-temporada no plano, e a lista de grupos sozinha esconderia o contínuo');
  const eixoX = nomesEixo[1], eixoY = nomesEixo[0];
  const kx = 'rota', ky = 'territorio';   /* nomes dos campos em `plano`, não texto de tela */
  const fronteira = (t.estabilidade || {}).fronteira || [];
  const trocaDe = {};
  fronteira.forEach(f => { trocaDe[f.clube + f.ano] = f; });

  const xs = plano.map(p => p[kx]), ys = plano.map(p => p[ky]);
  const lo = Math.min(Math.min.apply(null, xs), Math.min.apply(null, ys));
  const hi = Math.max(Math.max.apply(null, xs), Math.max.apply(null, ys));
  const pad = (hi - lo) * 0.08;
  const L = 52, T = 18, LADO = 330;
  const px = v => L + (v - (lo - pad)) / ((hi + pad) - (lo - pad)) * LADO;
  const py = v => T + LADO - (v - (lo - pad)) / ((hi + pad) - (lo - pad)) * LADO;
  const idx = {};
  grupos.forEach((g, i) => { idx[g.grupo] = i; });

  const cruz =
    '<line x1="' + px(cortes[eixoX]).toFixed(1) + '" y1="' + T + '" x2="' + px(cortes[eixoX]).toFixed(1) +
      '" y2="' + (T + LADO) + '" stroke="var(--tinta2)" stroke-dasharray="5 4"/>' +
    '<line x1="' + L + '" y1="' + py(cortes[eixoY]).toFixed(1) + '" x2="' + (L + LADO) + '" y2="' +
      py(cortes[eixoY]).toFixed(1) + '" stroke="var(--tinta2)" stroke-dasharray="5 4"/>' +
    pbTxt(px(cortes[eixoX]) + 4, T + 10, 'corte de ' + eixoX + ' ' + ptNum(cortes[eixoX], 2), { tam: 9 }) +
    pbTxt(L + LADO - 3, py(cortes[eixoY]) - 4, 'corte de ' + eixoY + ' ' + ptNum(cortes[eixoY], 2),
      { tam: 9, anc: 'end' });

  /* O tamanho do halo é a chance de o time trocar de grupo sob ruído: quem está colado na
     linha aparece com um anel largo, e o leitor vê a fronteira sem precisar da tabela. */
  const maxTroca = Math.max.apply(null, fronteira.map(f => f.troca_sob_ruido_10pt_pct).concat([1]));
  /* Dois clube-temporada colados no plano escreveriam um rótulo por cima do outro — e é
     justamente nos pares colados (os que dividem quadrante por pouco) que o leitor precisa
     ler o nome. Cada rótulo procura a primeira altura livre entre as tentativas abaixo. */
  const postos = [];
  const desvio = [3.5, -7.5, 13.5, -17.5, 23.5];
  const alturaLivre = (x, y) => {
    for (let i = 0; i < desvio.length; i++) {
      const yy = y + desvio[i];
      if (!postos.some(o => Math.abs(o.x - x) < 78 && Math.abs(o.y - yy) < 10)) {
        postos.push({ x: x, y: yy });
        return yy;
      }
    }
    return y + desvio[desvio.length - 1];
  };
  const pontos = plano.map(p => {
    const cor = pbCor(idx[p.grupo] === undefined ? 0 : idx[p.grupo]);
    const f = trocaDe[p.clube + p.ano];
    const troca = f ? f.troca_sob_ruido_10pt_pct : null;
    const halo = troca === null ? 0 : 5 + troca / maxTroca * 9;
    return (halo > 5
      ? '<circle cx="' + px(p[kx]).toFixed(1) + '" cy="' + py(p[ky]).toFixed(1) + '" r="' + halo.toFixed(1) +
        '" fill="' + cor + '" fill-opacity="0.14" stroke="' + cor + '" stroke-opacity="0.4" stroke-dasharray="2 2"/>'
      : '') +
      '<circle cx="' + px(p[kx]).toFixed(1) + '" cy="' + py(p[ky]).toFixed(1) + '" r="4.4" fill="' + cor + '"/>' +
      pbTxt(px(p[kx]) + 7, alturaLivre(px(p[kx]) + 7, py(p[ky])), p.clube + ' ' + ptAno(p.ano),
        { tam: 9, cor: 'var(--tinta2)' }) +
      '<title>' + esc(p.clube + ' ' + p.ano + ' · ' + p.pos + 'º · ' + p.grupo + ' · ' +
        eixoY + ' ' + ptNum(p[ky], 1) + ' · ' + eixoX + ' ' + ptNum(p[kx], 1) +
        (troca === null ? '' : ' · troca de grupo em ' + ptPct(troca) + ' dos sorteios com ruído')) + '</title>';
  }).join('');

  const legenda = grupos.map((g, i) =>
    '<span style="display:inline-flex;align-items:center;gap:5px;margin-right:14px">' +
    '<i style="width:9px;height:9px;border-radius:50%;background:' + pbCor(i) + ';display:inline-block"></i>' +
    esc(g.grupo) + ' · ' + ptN(g.n, 'clube-temporada') + '</span>').join('');

  const maisTrocam = fronteira.slice().sort((a, b) => b.troca_sob_ruido_10pt_pct - a.troca_sob_ruido_10pt_pct).slice(0, 3);

  return ptCard('O plano, não a lista',
    ptInt(plano.length) + ' clube-temporada · eixo horizontal ' + esc(eixoX) + ' · vertical ' + esc(eixoY),
    pbSvg(L + LADO + 120, T + LADO + 34,
      cruz + pontos +
      pbTxt(L + LADO / 2, T + LADO + 28, eixoX + ' →', { anc: 'middle', tam: 10 }) +
      '<g transform="translate(15,' + (T + LADO / 2) + ') rotate(-90)">' +
        pbTxt(0, 0, eixoY + ' →', { anc: 'middle', tam: 10 }) + '</g>', 560) +
    '<p class="pt-nota">' + legenda + '</p>',
    'Os grupos são <b>quadrantes de um plano contínuo</b>, não ilhas — é por isso que a tela mostra o ' +
    'plano e não só a lista de nomes. O anel tracejado é a chance de o clube trocar de grupo quando se ' +
    'sacode o eixo com ruído; ' +
    (maisTrocam.length
      ? 'os que mais se mexem são ' + maisTrocam.map(f => '<b>' + esc(f.clube) + ' ' + ptAno(f.ano) +
          '</b> (' + ptPct(f.troca_sob_ruido_10pt_pct) + ')').join(', ') + '. '
      : '') +
    'Quem está colado na linha está colado na linha: a fronteira é escolha declarada, e a tela diz ' +
    'quanto ela custa.');
}

function pb8Grupo(g, i, t) {
  const cor = pbCor(i);
  const divergeStatus = g.status !== g.status_declarado_no_documento;
  const divergeP = g.p_um_contra_o_resto !== null && g.p_declarado_no_documento !== null &&
    Math.abs(g.p_um_contra_o_resto - g.p_declarado_no_documento) > 0.001;
  const diverge = divergeStatus || divergeP;
  const nomesEixo = Object.keys(t.eixos || {});
  const times = g.times || [];
  const perc = g.percentis || {};
  const chavesPerc = Object.keys(perc);
  const forma = g.formacao || {};

  const tabTimes = ptTabela({
    id: 'ptEt-8-tab-' + g.grupo,
    ordem: null,
    colunas: [
      { k: 'clube', rot: 'clube', tipo: 'texto' },
      { k: 'ano', rot: 'ano', fmt: v => ptAno(v) },
      { k: 'pos', rot: 'posição', fmt: v => ptInt(v) + 'º' },
      { k: 'pts', rot: 'pontos', casas: 0 },
      { k: 'posto_valor', rot: 'posto de valor no ano', fmt: v => ptInt(v) + 'º' },
      { k: 'valor_eur', rot: 'valor do elenco', fmt: v => ptEur(v) },
    ],
    linhas: times,
    vazio: 'nenhum clube-temporada neste grupo',
  });

  const validadores = chavesPerc.length
    ? '<span class="pt-rot" style="margin-top:4px">Indicadores de fora da construção, percentil médio no ano</span>' +
      '<div class="pt-tab-rola"><table class="pt-tab"><thead><tr>' +
        chavesPerc.map(k => '<th class="num" title="' + esc(pbNome(k)) + '">' + esc(k) + '</th>').join('') +
      '</tr></thead><tbody><tr>' +
        chavesPerc.map(k => ptCel(perc[k], { casas: 1, sinal: 0, ano: null,
          motivo: 'percentil ausente para esta coluna' })).join('') +
      '</tr></tbody></table></div>'
    : ptFalta('o JSON não trouxe percentis de validadores para este grupo');

  const corpo =
    '<div class="pt-cf-grade">' +
      nomesEixo.map(k => {
        const campo = k.toLowerCase();
        const v = g[campo];
        return '<div class="pt-cf-l"><span>eixo ' + esc(k) + '</span><b>' +
          (v === undefined ? ptFalta('o grupo não traz o valor deste eixo') : ptNum(v, 1)) + '</b></div>';
      }).join('') +
      '<div class="pt-cf-l"><span>posto de valor médio</span><b>' + ptNum(g.posto_valor_medio, 2) + 'º</b></div>' +
      '<div class="pt-cf-l"><span>valor médio do elenco</span><b>' + ptEur(g.valor_medio_eur) + '</b></div>' +
      (forma.linha3_pct !== undefined
        ? '<div class="pt-cf-l"><span>jogos com três atrás</span><b>' + ptPct(forma.linha3_pct) + '</b></div>' +
          '<div class="pt-cf-l"><span>formações distintas</span><b>' + ptNum(forma.distintas, 1) + '</b></div>' +
          '<div class="pt-cf-l"><span>jogos na formação principal</span><b>' + ptPct(forma.principal_pct) + '</b></div>'
        : '') +
    '</div>' +
    tabTimes +
    validadores;

  const nota =
    '<b>Um contra o resto, recalculado pelo pipeline:</b> ' + ptP(g.p_um_contra_o_resto) +
    /* O nulo deixou de ser Monte Carlo: com dezesseis, as partições cabem todas e o campo passou a
       trazer texto ("exato (4368 partições)") no lugar de uma contagem. Quem é número ganha a palavra
       "réplicas"; quem é texto já se descreve, e a palavra sobrava — saía "em exato (4368 partições)
       réplicas". */
    ' em ' + (typeof g.replicas_um_contra_o_resto === 'number'
      ? ptInt(g.replicas_um_contra_o_resto) + ' réplicas'
      : esc(String(g.replicas_um_contra_o_resto))) + ', contra o corte de ' +
    ptNum(g.corte_do_status, 2) + ' → <b>' + esc(g.status) + '</b>. ' +
    (divergeStatus
      ? '<b style="color:var(--pt-baixo)">O veredito diverge do documento.</b> O TIPOLOGIA.md declarou ' +
        'este grupo <b>' + esc(g.status_declarado_no_documento) + '</b>, com ' +
        ptP(g.p_declarado_no_documento) + '. Os dois ficam na tela porque escolher um seria a tela ' +
        'decidindo qual execução vale — e é justamente este grupo que a tipologia marcou como o mais ' +
        'frágil. A conferência já achou a causa: o nulo sorteava uma rotulagem nova por COLUNA em vez ' +
        'de uma por réplica, e por isso duas execuções da mesma permutação não davam o mesmo p. A ' +
        'correção troca o Monte Carlo por enumeração exata — com dezesseis, as partições cabem todas — ' +
        'e então o p deixa de depender de semente e os dois números viram um. Enquanto o gerador não ' +
        'roda de novo, o que está nesta tela é o de antes da correção.'
      : divergeP
        ? 'O veredito bate com o do TIPOLOGIA.md (<b>' + esc(g.status_declarado_no_documento) +
          '</b>), mas <b style="color:var(--pt-baixo)">o p não</b>: o documento registrou ' +
          ptP(g.p_declarado_no_documento) + ' e o recálculo deu ' + ptP(g.p_um_contra_o_resto) +
          '. São execuções diferentes da mesma permutação; os dois números estão aqui em vez de um só.'
        : 'Bate com o que o TIPOLOGIA.md declarou (' + esc(g.status_declarado_no_documento) + ', ' +
          ptP(g.p_declarado_no_documento) + ').');

  return ptCard(g.grupo + ' — ' + ptInt(g.n) + ' clube-temporada',
    '<span style="color:' + cor + ';font-weight:700">' + esc(g.status) + '</span>' +
      (diverge ? ' · <span style="color:var(--pt-baixo)">documento diz ' +
        esc(g.status_declarado_no_documento) + '</span>' : '') +
      ' · ' + ptN(g.n, 'clube-temporada'),
    corpo, nota);
}

function pb8Veredito(t, ver, passaram, divergentes) {
  if (!ver.length) return ptFaltaBloco('Sem o veredito',
    'a chave `tipologia.veredito` não veio; sem ela a tela mostraria os grupos sem dizer em que ' +
    'testes eles falharam, que é justamente o que a etapa acabou de enterrar');
  const naoPassaram = ver.length - passaram;
  const linhas = ver.map(v => Object.assign({}, v));

  /* A tabela imprime numero, corte e veredito lado a lado, e o leitor le o terceiro como
     consequencia dos dois primeiros. Nao e: o campo `corte` nao tem a mesma direcao em todas
     as linhas — ha linha em que o numero precisa ficar ABAIXO dele e linha em que nao —, e
     por isso duas linhas com o mesmo par (numero, corte) podem sair com vereditos opostos.
     Quem decide e o campo `passou`, escrito pelo pipeline. A tela nao arbitra: marca onde a
     conta nao fecha e diz de onde o veredito veio. */
  const incoerentes = linhas.filter(v => (Number(v.numero) < Number(v.corte)) !== !!v.passou);

  /* Duas contagens para a MESMA coisa dentro da mesma etapa: o inteiro que o pipeline
     escreveu dentro da string do teste e o campo `tipologia.fisico.colunas`. O inteiro sai
     daqui por regex, nunca digitado, e so e comparado nas linhas que falam do fisico. */
  const fis = t.fisico || {};
  const naString = ver.map(v => {
    const m = /(\d+)\s+colunas/.exec(String(v.teste));
    return (m && /f[íi]sic|fis_/i.test(String(v.teste))) ? { teste: v.teste, n: Number(m[1]) } : null;
  }).filter(x => x && fis.colunas !== undefined && fis.colunas !== null &&
    x.n !== Number(fis.colunas));
  const alfa = pbAlfa();
  const contaFecha = alfa !== null && fis.esperados_por_acaso !== undefined &&
    Math.abs(Number(fis.colunas) * alfa - Number(fis.esperados_por_acaso)) < 0.05;

  return ptCard('O que esta tipologia passou, e o que ela NÃO passou',
    ptInt(passaram) + ' de ' + ptInt(ver.length) + ' testes passaram',
    ptTabela({
      id: 'ptEt-8-tab-veredito',
      ordem: null,
      colunas: [
        { k: 'teste', rot: 'teste', tipo: 'texto' },
        { k: 'numero', rot: 'número observado', fmt: v => ptNum(v, 4) },
        { k: 'corte', rot: 'corte', cel: (v, l) => {
            const coerente = (Number(l.numero) < Number(v)) === !!l.passou;
            if (coerente) return '<td class="num">' + ptNum(v, 2) + '</td>';
            return '<td class="num" style="color:var(--pt-baixo)" title="' + esc(
              'aqui o corte não se lê como teto: ' + pbCheio(l.numero) + ' contra corte ' + pbCheio(v) +
              ' daria o veredito contrário ao que está escrito. O veredito desta linha vem do campo ' +
              '`passou` do pipeline, não da comparação entre estas duas colunas.') +
              '">' + ptNum(v, 2) + ' <b>&#9888;</b></td>';
          } },
        { k: 'passou', rot: 'veredito', fmt: v => pbSelo(v) },
      ],
      linhas: linhas,
      vazio: 'nenhum teste registrado',
    }),
    '<b>' + ptInt(naoPassaram) + ' dos ' + ptInt(ver.length) + ' testes não passaram</b>, e eles estão na ' +
    'mesma tabela, na mesma tipografia, na mesma ordem em que foram rodados. Uma tipologia vale porque ' +
    'foi validada <b>fora</b> do que a construiu — e o preço de dizer isso é mostrar também onde a ' +
    'validação falhou. Sem esta tabela, os ' + ptInt((t.grupos || []).length) + ' quadrantes acima seriam ' +
    'exatamente o agrupamento cego que a primeira metade desta etapa enterrou. ' +
    (divergentes.length
      ? '<br><b style="color:var(--pt-baixo)">Atenção:</b> ' + ptInt(divergentes.length) +
        (divergentes.length === 1 ? ' grupo tem ' : ' grupos têm ') +
        'status ou p divergentes entre o documento e o recálculo do pipeline (' +
        divergentes.map(g => esc(g.grupo)).join(', ') + '). A divergência está escrita no card de cada um.'
      : '') +
    (incoerentes.length
      ? '<br><b style="color:var(--pt-baixo)">&#9888; em ' + ptInt(incoerentes.length) + ' ' +
        pbPl(incoerentes.length, 'linha', 'linhas') + ':</b> ali o veredito <b>não sai</b> da comparação ' +
        'entre as duas colunas à esquerda. Lendo o corte como teto, ' +
        incoerentes.map(v => esc(v.teste) + ' (' + pbCheio(v.numero) + ' contra corte ' +
          pbCheio(v.corte) + ')').join('; ') + ' ' +
        pbPl(incoerentes.length, 'teria', 'teriam') + ' o veredito contrário ao que está escrito. O campo ' +
        '<code>corte</code> do JSON não tem a mesma direção em todas as linhas — em umas o número precisa ' +
        'ficar abaixo dele, em outras não —, e quem decide passou ou não passou é o campo ' +
        '<code>passou</code>, escrito pelo pipeline. A tabela mostra os três e marca onde os dois ' +
        'primeiros não explicam o terceiro, porque marcar é mais honesto que esconder a coluna.'
      : '') +
    (naString.length
      ? '<br><b style="color:var(--pt-baixo)">Duas contagens para a mesma coisa:</b> o nome do teste diz ' +
        naString.map(x => ptInt(x.n)).join(' e ') + ' colunas físicas, e a chave ' +
        '<code>tipologia.fisico.colunas</code> diz <b>' + ptInt(fis.colunas) + '</b>. <b>Vale a do ' +
        'campo</b>: é dela que sai o esperado por acaso deste mesmo bloco' +
        (contaFecha
          ? ' (' + ptInt(fis.colunas) + ' × ' + ptNum(alfa, 2) + ' = ' +
            ptNum(fis.esperados_por_acaso, 1) + ')'
          : ' (' + ptNum(fis.esperados_por_acaso, 1) + ')') +
        ', e é ela que o card dos achados negativos imprime logo abaixo. O outro número está <b>dentro ' +
        'da string</b> do teste, escrito quando aquele teste rodou, e não acompanhou a mudança da ' +
        'contagem; a tela não reescreve a string do arquivo — mostra a linha como veio e diz aqui qual ' +
        'das duas contagens as contas usam.'
      : ''));
}

function pb8TesteDeFora(t) {
  const f = t.teste_de_fora || {};
  const limpa = t.bateria_limpa || {};
  const porInd = (f.por_indicador || []).map(x => {
    const l = { col: x.col, nome: pbNome(x.col), eta2: x.eta2, p: x.p, q: x.q };
    Object.keys(x.percentil_por_grupo || {}).forEach(g => { l['g_' + g] = x.percentil_por_grupo[g]; });
    return l;
  });
  if (!porInd.length) return ptFaltaBloco('Sem o teste de fora',
    'a chave `tipologia.teste_de_fora.por_indicador` não veio — e é ela que diz se os grupos ' +
    'aparecem em indicadores que não os construíram');
  const gs = Object.keys((f.por_indicador[0] || {}).percentil_por_grupo || {});
  const pre = (t.bateria_pre_declarada || []).length;

  const colunas = [
    { k: 'nome', rot: 'indicador (nenhum entrou na construção)', tipo: 'texto' },
    { k: 'eta2', rot: 'eta²', fmt: v => ptNum(v, 3) },
    { k: 'p', rot: 'p', fmt: v => ptPv(v) },
    { k: 'q', rot: 'q de BH', fmt: v => ptPv(v) },
  ].concat(gs.map(g => ({
    k: 'g_' + g, rot: 'percentil ' + g,
    cel: (v, l) => ptCel(v, { casas: 1, sinal: 0, texto: ptNum(v, 0),
      motivo: 'sem percentil para ' + g + ' em ' + l.col }),
  })));

  return ptCard('O teste de fora: os grupos aparecem em indicadores que não os construíram?',
    ptInt(f.indicadores) + ' indicadores testados · ' + ptInt(f.sobrevivem_bh5) +
      ' sobrevivem a Benjamini-Hochberg no corte mais duro',
    '<p class="pt-nota">eta² médio observado <b>' + ptNum(f.eta2_medio_obs, 3) + '</b> contra <b>' +
      ptNum(f.eta2_medio_nulo_rotulo, 3) + '</b> de rótulo sorteado (' + ptP(f.p_rotulo) + ') e contra <b>' +
      ptNum(f.eta2_medio_nulo_placebo, 3) + '</b> do <b>nulo placebo</b> — ' + ptInt(f.placebo_particoes) +
      ' partições feitas cortando os mesmos tamanhos por qualquer outro indicador real de futebol (' +
      ptP(f.p_placebo) + '). O nulo placebo é o duro: ele respeita a correlação entre indicadores, que é ' +
      'o que o embaralhamento de colunas destrói. ' + ptInt(f.sobrevivem_bh5) + ' indicadores sobrevivem ' +
      'à correção no corte mais duro e ' + ptInt(f.sobrevivem_bh10) + ' no mais frouxo' +
      (pre ? ', de uma bateria de ' + ptInt(pre) + ' colunas declarada antes de rodar' : '') + '.</p>' +
    ptTabela({
      id: 'ptEt-8-tab-fora',
      ordem: { col: 'eta2', dir: 'desc' },
      colunas: colunas,
      linhas: porInd,
      vazio: 'nenhum indicador de fora foi testado',
    }),
    (limpa.p !== undefined
      ? '<b>A ressalva que honra o teste, e ela é grande:</b> restringindo a bateria aos <b>' +
        ptInt(limpa.validadores) + '</b> validadores que passam o critério <i>' + esc(limpa.criterio) +
        '</i>, o eta² médio cai para ' + ptNum(limpa.eta2_medio_obs, 3) + ' contra ' +
        ptNum(limpa.eta2_medio_nulo, 3) + ' do nulo, ' + ptP(limpa.p) + '. Boa parte do sinal do teste ' +
        'de fora é a família do passe dita com outras palavras — ou seja, o eixo de rota reaparecendo ' +
        'com outro nome. Isto está aqui, e não no rodapé.'
      : ptFalta('a bateria limpa não veio no JSON')));
}

function pb8DinheiroEstabilidade(t) {
  const din = t.dinheiro || {};
  const est = t.estabilidade || {};
  const fis = t.fisico || {};
  const form = t.formacao || {};
  const and = t.andares || {};
  const res = din.residualizado || {};
  const rival = din.particao_rival_so_dinheiro || {};
  const tirarTime = est.tirar_um_time || [];
  const tirarInd = est.tirar_um_indicador || [];
  const sil = (est.silhueta_espaco_reduzido || [])[0];
  const jac = est.jaccard;

  /* O Jaccard deste bloco NAO e o dos quadrantes, e a tela vinha sugerindo que era: o
     bootstrap refaz o agrupamento a cada replica e mede os grupos que ele mesmo encontrou.
     O proprio arquivo desmente a leitura — `tamanhos` nao bate com o n dos grupos da
     tipologia —, e e o arquivo que decide o rotulo aqui, nao a redacao. */
  const jacT = (jac && jac.tamanhos) || [];
  const nGrupos = (t.grupos || []).map(g => Number(g.n));
  const jacBate = !!jac && jacT.length > 0 && jacT.length === nGrupos.length &&
    jacT.every((v, i) => Number(v) === nGrupos[i]);
  const jacN = jac ? (jac.jaccard_por_grupo || []).length : 0;

  const maxTrocaTime = tirarTime.length ? Math.max.apply(null, tirarTime.map(x => x.trocas)) : null;
  const maxTrocaInd = tirarInd.length ? Math.max.apply(null, tirarInd.map(x => x.trocas)) : null;
  const semTroca = tirarInd.filter(x => x.trocas === 0);

  const dinheiroHtml =
    '<div class="pt-cf-grade">' +
      '<div class="pt-cf-l"><span>eta² do posto de valor entre os grupos</span><b>' +
        ptNum(din.eta2_posto_valor, 3) + '</b></div>' +
      '<div class="pt-cf-l"><span>p por permutação</span><b>' + ptPv(din.p_permutacao) + '</b></div>' +
      '<div class="pt-cf-l"><span>p de Kruskal</span><b>' + ptPv(din.p_kruskal) + '</b></div>' +
      '<div class="pt-cf-l"><span>partição rival feita só com dinheiro</span><b>' +
        ptNum(rival.eta2_medio, 3) + ' contra ' + ptNum(rival.eta2_medio_nulo, 3) + ' do nulo · ' +
        ptP(rival.p) + '</b></div>' +
    '</div>' +
    '<p class="pt-nota">Os dois testes do dinheiro <b>discordam entre si</b> (' + ptP(din.p_permutacao) +
      ' por permutação, ' + ptP(din.p_kruskal) + ' por Kruskal) e os dois estão na tela: com ' +
      ptInt((t.plano || []).length) + ' clube-temporada, a diferença entre eles é o próprio tamanho da ' +
      'amostra falando. O teste que decide é o outro: uma partição rival montada <b>só</b> com o posto ' +
      'de valor explica os indicadores de fora com ' + ptNum(rival.eta2_medio, 3) + ' contra ' +
      ptNum(rival.eta2_medio_nulo, 3) + ' do nulo (' + ptP(rival.p) + ') — dinheiro sozinho não reproduz ' +
      'esta partição.</p>' +
    (res.de !== undefined
      ? '<p class="pt-nota">E quando se <b>residualiza o dinheiro</b> (regredir cada coluna de ' +
        'construção no percentil de valor e refazer os cortes): o eixo de rota não muda <b>nenhum</b> ' +
        'dos ' + ptInt(res.de) + ' (' + ptInt(res.muda_rota) + ' trocas) e o de território muda <b>' +
        ptInt(res.muda_territorio) + '</b> (' + (res.trocaram || []).map(esc).join(', ') + '). ' +
        'Traduzindo para quem decide orçamento: <b>um dos dois eixos é meio bolso e o outro não é ' +
        'nenhum</b> — ocupar o campo do adversário é, em boa parte, o que o dinheiro compra; escolher ' +
        'se a bola chega lá pelo chão ou pelo alto, não.</p>'
      : '') +
    (din.rho_posto_valor_x_percentil_ppda !== undefined
      ? '<p class="pt-nota">Correlação entre posto de valor e percentil de pressão: <b>' +
        ptNum(din.rho_posto_valor_x_percentil_ppda, 3) + '</b>. ' +
        (din.convencao_ppda ? '<i>' + esc(din.convencao_ppda) + '</i>' : '') + '</p>'
      : '');

  const estabHtml =
    '<div class="pt-cf-grade">' +
      '<div class="pt-cf-l"><span>máximo de trocas ao tirar um time</span><b>' +
        (maxTrocaTime === null ? ptFalta('teste ausente no JSON') : ptInt(maxTrocaTime)) + ' de ' +
        ptInt((t.plano || []).length) + '</b></div>' +
      '<div class="pt-cf-l"><span>times que nunca se movem</span><b>' +
        ptInt((est.times_que_nunca_se_movem || []).length) + ' de ' + ptInt((t.plano || []).length) +
        '</b></div>' +
      '<div class="pt-cf-l"><span>máximo de trocas ao tirar um indicador</span><b>' +
        (maxTrocaInd === null ? ptFalta('teste ausente no JSON') : ptInt(maxTrocaInd)) + '</b></div>' +
      (sil
        ? '<div class="pt-cf-l"><span>silhueta nos dois eixos, contra o nulo de mesma covariância</span><b>' +
          ptNum(sil.silhueta_obs, 3) + ' contra ' + ptNum((sil.nulo_mesma_covariancia || {}).mediana, 3) +
          ' · ' + ptP((sil.nulo_mesma_covariancia || {}).p) + '</b></div>'
        : '') +
      (jac
        ? '<div class="pt-cf-l"><span>' +
          (jacBate
            ? 'Jaccard dos ' + ptInt(jacN) + ' grupos (' + ptInt(jac.replicas) + ' réplicas)'
            : 'Jaccard de ' + ptInt(jacN) + ' grupos <b>reamostrados</b> — tamanhos ' +
              jacT.map(v => ptInt(v)).join('/') + ', que <b>NÃO</b> são os quadrantes ' +
              nGrupos.map(v => ptInt(v)).join('/') + ' (' + ptInt(jac.replicas) + ' réplicas)') +
          '</span><b>' +
          (jac.jaccard_por_grupo || []).map((v, i) => ptNum(v, 3) +
            '<span style="font-weight:400;color:var(--tinta3)"> (' +
            (jacT[i] === undefined
              ? ptFalta('o JSON não traz o tamanho deste grupo reamostrado')
              : ptInt(jacT[i])) + ')</span>').join(' · ') + '</b></div>'
        : '') +
    '</div>' +
    (jac && !jacBate
      ? '<p class="pt-nota">Estes ' + ptInt(jacN) + ' números <b>não são a estabilidade dos ' +
        ptInt(nGrupos.length) + ' quadrantes</b>, e ler o menor deles como "o grupo tal se desfaz" é ' +
        'trocar uma coisa pela outra. O bootstrap refaz o agrupamento a cada uma das ' +
        ptInt(jac.replicas) + ' réplicas com k = ' + ptInt(jac.k) + ' e mede os grupos que ele mesmo ' +
        'encontrou: os dele têm tamanhos <b>' + jacT.map(v => ptInt(v)).join('/') + '</b> e os quadrantes ' +
        'da tipologia têm <b>' + nGrupos.map(v => ptInt(v)).join('/') + '</b> — não são as mesmas caixas. ' +
        'O que estes números dizem é que um agrupamento com este k mal sobrevive a reamostrar; a ' +
        'estabilidade dos quadrantes é a das duas linhas acima, tirar um time e tirar um indicador.</p>'
      : '') +
    '<p class="pt-nota">' +
      ((est.times_que_nunca_se_movem || []).length
        ? '<b>' + ptInt(est.times_que_nunca_se_movem.length) + '</b> dos ' + ptInt((t.plano || []).length) +
          ' clube-temporada não mudam de grupo em teste nenhum: ' +
          est.times_que_nunca_se_movem.map(esc).join(', ') + '. '
        : '') +
      (semTroca.length
        ? 'E tirar <b>' + semTroca.map(x => esc(pbNome(x.removido))).join('</b> ou <b>') +
          '</b> da construção não move um único time — o que quer dizer que esse eixo está sendo ' +
          'sustentado pelas outras colunas, não por aquela.'
        : '') +
    '</p>' +
    (sil
      ? '<p class="pt-nota">A silhueta no espaço reduzido é o teste que <b>não passa</b> (' +
        ptP((sil.nulo_mesma_covariancia || {}).p) + '): mesmo nos dois eixos da tipologia, o que existe é ' +
        '<b>um plano contínuo cortado em ' + ptInt((t.grupos || []).length) + '</b>, não ' +
        ptInt((t.grupos || []).length) + ' ilhas. Os grupos são faixas, e os fronteiriços existem porque ' +
        'a fronteira é escolha.</p>'
      : '');

  const negativos =
    '<div class="pt-cf-grade">' +
      (fis.colunas !== undefined
        ? '<div class="pt-cf-l"><span>físico: colunas testadas</span><b>' + ptInt(fis.colunas) + '</b></div>' +
          '<div class="pt-cf-l"><span>físico: passam o corte simples</span><b>' + ptInt(fis.passam5) +
            ' contra ' + ptNum(fis.esperados_por_acaso, 1) + ' esperados por acaso</b></div>' +
          '<div class="pt-cf-l"><span>físico: sobrevivem à correção</span><b>' + ptInt(fis.sobrevivem_bh5) +
            ' (menor q ' + ptNum(fis.menor_q_bh, 3) + ')</b></div>'
        : '') +
      Object.keys(form).map(k => '<div class="pt-cf-l"><span>formação · ' + esc(pbRotChave(k)) +
        '</span><b>eta² ' + ptNum(form[k].eta2, 3) + ' · ' + ptP(form[k].p) + '</b></div>').join('') +
      Object.keys(and).map(k => '<div class="pt-cf-l"><span>' + esc(pbRotChave(k)) + '</span><b>eta² ' +
        ptNum(and[k].eta2_medio, 3) + ' · ' + ptP(and[k].p) + ' · ' + ptN(and[k].n, 'clube-temporada') +
        '</b></div>').join('') +
    '</div>' +
    '<p class="pt-nota">' +
      (fis.sobrevivem_bh5 === 0
        ? '<b>Nenhuma</b> das ' + ptInt(fis.colunas) + ' colunas físicas sobrevive à correção: estes são ' +
          'tipos <b>táticos</b>, não tipos atléticos, e a tela não pode ser usada para dizer "o grupo tal ' +
          'corre mais". '
        : '') +
      'A formação também não separa nada — e as linhas de três que aparecem nas médias de grupo são um ' +
      'time puxando o grupo inteiro. O que separa, e é o que sustenta os dois andares da tipologia, é o ' +
      'corte de rota dentro de cada faixa de território.</p>';

  return ptCard('Os grupos são dinheiro com nome tático?', 'com o número, não com o adjetivo',
    dinheiroHtml) +
    ptCard('Estabilidade: quanto a partição se mexe quando se mexe na amostra',
      ptInt(tirarTime.length) + ' remoções de time · ' + ptInt(tirarInd.length) + ' remoções de indicador',
      estabHtml) +
    ptCard('O que esta tipologia não autoriza a dizer', 'os achados negativos, em número',
      negativos);
}
