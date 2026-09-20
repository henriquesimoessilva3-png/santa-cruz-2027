/* Gráficos da aba Estudo Série B.
 *
 * Por que existe: o CLAUDE.md do estudo manda "um gráfico por conclusão, o mais simples
 * que mostre o achado", e até 20/09 não havia nenhum — o material ficou denso e difícil,
 * exatamente o defeito que a seção Didática foi escrita para corrigir.
 *
 * Como funciona: NADA é desenhado à mão por conclusão. Cada conclusão declara um campo
 * `grafico` no seu <ID>.json dizendo a forma e QUAIS MARCADORES alimentam cada série; o
 * desenho sai daqui, lendo os valores de `numeros`. É a mesma regra do texto — número por
 * marcador — aplicada ao desenho, para o gráfico não virar mais um lugar onde se digita
 * número à mão.
 *
 * Paleta: slots 1-3 do sistema (azul/laranja/aqua), validados nos dois modos em all-pairs.
 * O aqua fica em 2,74:1 no claro, abaixo de 3:1 — por isso TODO valor vai com rótulo
 * direto visível, que é a regra de alívio. Há também tabela por gráfico, no <details>.
 */
(function () {
  'use strict';

  var COR = {
    claro: { sobe: '#2a78d6', meio: '#eb6834', cai: '#1baf7a', tinta: '#0b0b0b', suave: '#52514e', grade: '#e6e5e1' },
    escuro: { sobe: '#3987e5', meio: '#d95926', cai: '#199e70', tinta: '#ffffff', suave: '#c3c2b7', grade: '#333330' }
  };
  var NS = 'http://www.w3.org/2000/svg';

  /* Quem manda na paleta e o TEMA DO APP (o botao ☀/☾, que poe body.claro), nao o do
     sistema: o style.css nao usa prefers-color-scheme em lugar nenhum e o padrao do app e
     ESCURO. Sem isto, o caso mais comum — app no escuro, sistema no claro — pintava com a
     paleta clara, e a tinta dos rotulos (#0b0b0b) sumia no fundo escuro. Esses rotulos sao
     a regra de alivio do contraste do aqua: sem eles o desenho nao se le. O sistema so
     decide quando nao ha body (teste fora do navegador). */
  function escuro() {
    try {
      if (document.body && document.body.classList) {
        return !document.body.classList.contains('claro');
      }
    } catch (e) { /* cai para o do sistema */ }
    try { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }
    catch (e) { return false; }
  }
  function paleta() { return escuro() ? COR.escuro : COR.claro; }
  function corDe(nome, p) {
    var n = (nome || '').toLowerCase();
    if (n.indexOf('sobe') === 0 || n.indexOf('promov') === 0) return p.sobe;
    if (n.indexOf('cai') === 0 || n.indexOf('rebaix') === 0) return p.cai;
    if (n.indexOf('trave') === 0) return p.cai;
    return p.meio;
  }

  function el(t, a) {
    var e = document.createElementNS(NS, t);
    for (var k in a) if (a[k] != null) e.setAttribute(k, a[k]);
    return e;
  }
  function num(v) {
    if (typeof v === 'number') return v;
    if (v == null) return null;
    var s = String(v).trim().replace(/\s/g, '');
    if (/^-?\d{1,3}(\.\d{3})+,\d+$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^-?[\d]+,[\d]+$/.test(s)) s = s.replace(',', '.');
    var n = parseFloat(s);
    return isNaN(n) ? null : n;
  }
  function fmt(v, casas) {
    if (v == null) return '—';
    /* Contagem nao leva casa decimal: metade dos graficos deste estudo e contagem (casos,
       campanhas, times, nomes) e “8,00 casos” e ruido para quem le. So a medida, que vem
       com fracao, recebe casa. */
    var c = casas != null ? casas
          : (Number.isInteger(v) ? 0
             : (Math.abs(v) >= 100 ? 0 : (Math.abs(v) >= 10 ? 1 : 2)));
    return v.toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
  }

  /* turno e returno chegam como MARCADOR no <ID>.json e ja como VALOR depois que o
     gerar_estudo_serieb_js.py resolve — e a aba chama montar() com numeros vazio. Sem
     aceitar os dois, a forma `turno` devolvia null e o encaixe era removido: o grafico
     sumia da tela em silencio. As outras tres nao tinham o problema porque passam por
     serie(), que ja olha `valor` antes do marcador. */
  function valorDe(v, numeros) {
    if (v == null) return null;
    if (typeof v === 'number') return v;
    if (numeros && Object.prototype.hasOwnProperty.call(numeros, v)) return num(numeros[v]);
    return num(v);
  }

  /* resolve uma série: {nome, marcador} -> {nome, valor} lendo de numeros */
  function serie(s, numeros) {
    var v = s.valor != null ? num(s.valor) : num(numeros ? numeros[s.marcador] : null);
    return { nome: s.nome, valor: v, marcador: s.marcador };
  }

  /* A REGUA COMECA NO ZERO, e nao no menor valor do proprio grafico.

     Por que mudou (20/09): a versao anterior tomava o minimo e o maximo dos pontos e abria
     35% de folga de cada lado. Com isso a distancia entre 9.582 e 9.607 metros — 0,26%, que
     o estudo publica como “sem diferenca clara”, com quatro clubes de um lado — ocupava 40%
     da largura do desenho. O grafico afirmava o que a manchete acima dele negava, que e
     exatamente a classe de erro que o portao de entrega existe para pegar: alegacao sobre si
     mesma que nada confere. Ancorado no zero, empate parece empate.

     Quando ha valor negativo (saldo, sobra sobre o esperado, diferenca entre faixas), o zero
     fica dentro da regua e vira uma linha visivel: e dela que o sinal se le. */
  function escala(vs) {
    var mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs);
    var lo = Math.min(0, mn), hi = Math.max(0, mx);
    if (hi === lo) hi = lo + 1;                 // tudo zero: regua qualquer, so para dividir
    var folga = (hi - lo) * 0.12;
    if (lo < 0) lo -= folga;
    if (hi > 0) hi += folga;
    return { mn: lo, mx: hi, temNegativo: mn < 0 };
  }

  /* As pontas da regua escritas, para o leitor ver DE ONDE ATE ONDE o desenho vai. Sem isto
     o zero e invisivel e o desenho volta a poder ser lido como se fosse todo o intervalo. */
  function pontasDaRegua(svg, e, x, y, mn, mx, p) {
    [[mn, e.esq, 'start'], [mx, e.dir, 'end']].forEach(function (q) {
      var t = el('text', { x: q[1], y: y, fill: p.suave, 'font-size': 10, 'text-anchor': q[2] });
      t.textContent = fmt(q[0]); svg.appendChild(t);
    });
  }

  /* ---------- formas ---------- */

  /* grupos: pontos numa régua só. O caso padrão — Sobe contra Meio num indicador. */
  function desenhaGrupos(g, numeros, larg) {
    var p = paleta(), h = 48 + (g.series.length * 30), pad = { e: 96, d: 76, t: 26, b: 34 };
    var pts = g.series.map(function (s) { return serie(s, numeros); }).filter(function (s) { return s.valor != null; });
    if (!pts.length) return null;
    var e = escala(pts.map(function (s) { return s.valor; }));
    var mn = e.mn, mx = e.mx;
    var x = function (v) { return pad.e + ((v - mn) / (mx - mn)) * (larg - pad.e - pad.d); };
    var svg = el('svg', { viewBox: '0 0 ' + larg + ' ' + h, width: '100%', height: h, role: 'img' });
    var yBase = h - pad.b + 8;
    svg.appendChild(el('line', { x1: pad.e, x2: larg - pad.d, y1: yBase, y2: yBase, stroke: p.grade, 'stroke-width': 1 }));
    pontasDaRegua(svg, { esq: pad.e, dir: larg - pad.d }, x, yBase + 14, mn, mx, p);
    if (e.temNegativo) {
      svg.appendChild(el('line', { x1: x(0), x2: x(0), y1: pad.t - 14, y2: yBase, stroke: p.suave, 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
    }
    pts.forEach(function (s, i) {
      var y = pad.t + i * 30, c = corDe(s.nome, p);
      var rot = el('text', { x: pad.e - 10, y: y + 4, 'text-anchor': 'end', fill: p.suave, 'font-size': 12 });
      rot.textContent = s.nome; svg.appendChild(rot);
      svg.appendChild(el('line', { x1: x(Math.min(0, Math.max(mn, 0))), x2: x(s.valor), y1: y, y2: y, stroke: p.grade, 'stroke-width': 2 }));
      var cir = el('circle', { cx: x(s.valor), cy: y, r: 6, fill: c, stroke: escuro() ? '#1a1a19' : '#fcfcfb', 'stroke-width': 2 });
      cir.appendChild(el('title')).textContent = s.nome + ': ' + fmt(s.valor) + (g.unidade ? ' ' + g.unidade : '');
      svg.appendChild(cir);
      var val = el('text', { x: x(s.valor) + 12, y: y + 4, fill: p.tinta, 'font-size': 12, 'font-weight': 600 });
      val.textContent = fmt(s.valor); svg.appendChild(val);
    });
    return svg;
  }

  /* dois_cortes: a forma mais importante deste estudo.
   * Mostra a MESMA comparação nos dois cortes de fronteira, um sobre o outro. Quando o
   * achado só existe num corte, isso salta aos olhos — no texto ficava escondido. */
  function desenhaDoisCortes(g, numeros, larg) {
    var p = paleta(), pad = { e: 96, d: 76, t: 30, b: 26 };
    var blocos = (g.cortes || []).map(function (c) {
      return { rotulo: c.rotulo, pts: (c.series || []).map(function (s) { return serie(s, numeros); }).filter(function (s) { return s.valor != null; }) };
    }).filter(function (b) { return b.pts.length; });
    if (!blocos.length) return null;
    var todos = [];
    blocos.forEach(function (b) { b.pts.forEach(function (s) { todos.push(s.valor); }); });
    var e = escala(todos);
    var mn = e.mn, mx = e.mx;
    var alturaBloco = 30 + blocos[0].pts.length * 26;
    var h = pad.t + blocos.length * alturaBloco + pad.b;
    var x = function (v) { return pad.e + ((v - mn) / (mx - mn)) * (larg - pad.e - pad.d); };
    var svg = el('svg', { viewBox: '0 0 ' + larg + ' ' + h, width: '100%', height: h, role: 'img' });
    pontasDaRegua(svg, { esq: pad.e, dir: larg - pad.d }, x, h - 4, mn, mx, p);
    if (e.temNegativo) {
      svg.appendChild(el('line', { x1: x(0), x2: x(0), y1: pad.t - 14, y2: h - pad.b - 2, stroke: p.suave, 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
    }
    blocos.forEach(function (b, bi) {
      var y0 = pad.t + bi * alturaBloco;
      var cab = el('text', { x: 0, y: y0 - 8, fill: p.suave, 'font-size': 11, 'font-weight': 600 });
      cab.textContent = b.rotulo; svg.appendChild(cab);
      svg.appendChild(el('line', { x1: pad.e, x2: larg - pad.d, y1: y0 - 12, y2: y0 - 12, stroke: p.grade, 'stroke-width': 1 }));
      b.pts.forEach(function (s, i) {
        var y = y0 + 10 + i * 26, c = corDe(s.nome, p);
        var rot = el('text', { x: pad.e - 10, y: y + 4, 'text-anchor': 'end', fill: p.suave, 'font-size': 12 });
        rot.textContent = s.nome; svg.appendChild(rot);
        var cir = el('circle', { cx: x(s.valor), cy: y, r: 6, fill: c, stroke: escuro() ? '#1a1a19' : '#fcfcfb', 'stroke-width': 2 });
        cir.appendChild(el('title')).textContent = b.rotulo + ' · ' + s.nome + ': ' + fmt(s.valor);
        svg.appendChild(cir);
        var val = el('text', { x: x(s.valor) + 12, y: y + 4, fill: p.tinta, 'font-size': 12, 'font-weight': 600 });
        val.textContent = fmt(s.valor); svg.appendChild(val);
      });
    });
    return svg;
  }

  /* turno: inclinação do 1º para o 2º turno, uma linha por faixa. */
  function desenhaTurno(g, numeros, larg) {
    var p = paleta(), h = 190, pad = { e: 78, d: 92, t: 24, b: 34 };
    var ls = (g.linhas || []).map(function (l) {
      return { nome: l.nome, a: valorDe(l.turno, numeros), b: valorDe(l.returno, numeros) };
    }).filter(function (l) { return l.a != null && l.b != null; });
    if (!ls.length) return null;
    var vs = []; ls.forEach(function (l) { vs.push(l.a, l.b); });
    var mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs), folga = (mx - mn) || 1;
    mn -= folga * 0.2; mx += folga * 0.2;
    var y = function (v) { return pad.t + (1 - (v - mn) / (mx - mn)) * (h - pad.t - pad.b); };
    var xa = pad.e, xb = larg - pad.d;
    var svg = el('svg', { viewBox: '0 0 ' + larg + ' ' + h, width: '100%', height: h, role: 'img' });
    [[xa, '1º turno'], [xb, '2º turno']].forEach(function (c) {
      svg.appendChild(el('line', { x1: c[0], x2: c[0], y1: pad.t, y2: h - pad.b, stroke: p.grade, 'stroke-width': 1 }));
      var t = el('text', { x: c[0], y: h - pad.b + 18, 'text-anchor': 'middle', fill: p.suave, 'font-size': 11 });
      t.textContent = c[1]; svg.appendChild(t);
    });
    ls.forEach(function (l) {
      var c = corDe(l.nome, p);
      svg.appendChild(el('line', { x1: xa, y1: y(l.a), x2: xb, y2: y(l.b), stroke: c, 'stroke-width': 2 }));
      [[xa, l.a, 'end', -12], [xb, l.b, 'start', 12]].forEach(function (q) {
        var cir = el('circle', { cx: q[0], cy: y(q[1]), r: 5, fill: c, stroke: escuro() ? '#1a1a19' : '#fcfcfb', 'stroke-width': 2 });
        cir.appendChild(el('title')).textContent = l.nome + ': ' + fmt(q[1]);
        svg.appendChild(cir);
      });
      var rot = el('text', { x: xb + 12, y: y(l.b) + 4, fill: p.tinta, 'font-size': 12, 'font-weight': 600 });
      rot.textContent = l.nome + ' ' + fmt(l.b); svg.appendChild(rot);
      var ini = el('text', { x: xa - 12, y: y(l.a) + 4, 'text-anchor': 'end', fill: p.suave, 'font-size': 11 });
      ini.textContent = fmt(l.a); svg.appendChild(ini);
    });
    return svg;
  }

  /* barras: contagem por temporada ou por categoria. */
  function desenhaBarras(g, numeros, larg) {
    var p = paleta(), h = 170, pad = { e: 44, d: 16, t: 20, b: 34 };
    var bs = (g.barras || []).map(function (b) { return { nome: b.nome, valor: num(b.valor != null ? b.valor : numeros[b.marcador]) }; })
      .filter(function (b) { return b.valor != null; });
    if (!bs.length) return null;
    /* A linha de corte entra na ESCALA. Sem isto, corte acima da maior barra caia fora do
       viewBox e simplesmente nao era desenhado — o numero ficava publicado no JSON e nao
       chegava a leitor nenhum (A01-3: barras de 8 e 9 com corte em 16). */
    var corte = g.linha_de_corte != null ? valorDe(g.linha_de_corte, numeros) : null;
    var topo = Math.max.apply(null, bs.map(function (b) { return b.valor; }));
    if (corte != null) topo = Math.max(topo, corte);
    var mx = topo * 1.18;
    var lb = (larg - pad.e - pad.d) / bs.length, w = Math.min(46, lb - 10);
    var svg = el('svg', { viewBox: '0 0 ' + larg + ' ' + h, width: '100%', height: h, role: 'img' });
    svg.appendChild(el('line', { x1: pad.e - 8, x2: larg - pad.d, y1: h - pad.b, y2: h - pad.b, stroke: p.grade, 'stroke-width': 1 }));
    if (corte != null) {
      var yc = pad.t + (1 - corte / mx) * (h - pad.t - pad.b);
      svg.appendChild(el('line', { x1: pad.e - 8, x2: larg - pad.d, y1: yc, y2: yc, stroke: p.suave, 'stroke-width': 1, 'stroke-dasharray': '4 3' }));
    }
    bs.forEach(function (b, i) {
      var alt = (b.valor / mx) * (h - pad.t - pad.b), x0 = pad.e + i * lb + (lb - w) / 2;
      var r = el('rect', { x: x0, y: h - pad.b - alt, width: w, height: alt, rx: 4, fill: corDe(b.nome, p) });
      r.appendChild(el('title')).textContent = b.nome + ': ' + fmt(b.valor);
      svg.appendChild(r);
      var v = el('text', { x: x0 + w / 2, y: h - pad.b - alt - 6, 'text-anchor': 'middle', fill: p.tinta, 'font-size': 11, 'font-weight': 600 });
      v.textContent = fmt(b.valor); svg.appendChild(v);
      var n = el('text', { x: x0 + w / 2, y: h - pad.b + 16, 'text-anchor': 'middle', fill: p.suave, 'font-size': 11 });
      n.textContent = b.nome; svg.appendChild(n);
    });
    return svg;
  }

  var FORMAS = { grupos: desenhaGrupos, dois_cortes: desenhaDoisCortes, turno: desenhaTurno, barras: desenhaBarras };

  /* a tabela é obrigatória: é a regra de alívio do contraste, e serve leitor de tela */
  function tabela(g, numeros) {
    var linhas = [];
    if (g.series) g.series.forEach(function (s) { var r = serie(s, numeros); linhas.push([r.nome, fmt(r.valor)]); });
    if (g.cortes) g.cortes.forEach(function (c) {
      (c.series || []).forEach(function (s) { var r = serie(s, numeros); linhas.push([c.rotulo + ' · ' + r.nome, fmt(r.valor)]); });
    });
    if (g.linhas) g.linhas.forEach(function (l) {
      linhas.push([l.nome + ' · 1º turno', fmt(valorDe(l.turno, numeros))]);
      linhas.push([l.nome + ' · 2º turno', fmt(valorDe(l.returno, numeros))]);
    });
    if (g.barras) g.barras.forEach(function (b) { linhas.push([b.nome, fmt(num(b.valor != null ? b.valor : numeros[b.marcador]))]); });
    /* a linha de corte tambem e um numero publicado: quem le pela tabela tem de ve-la */
    if (g.linha_de_corte != null) linhas.push(['linha de corte', fmt(valorDe(g.linha_de_corte, numeros))]);
    if (!linhas.length) return null;
    var d = document.createElement('details'); d.className = 'esb-graf-tabela';
    var s = document.createElement('summary'); s.textContent = 'ver os números'; d.appendChild(s);
    var t = document.createElement('table');
    linhas.forEach(function (l) {
      var tr = document.createElement('tr');
      var a = document.createElement('th'); a.scope = 'row'; a.textContent = l[0];
      var b = document.createElement('td'); b.textContent = l[1] + (g.unidade ? ' ' + g.unidade : '');
      tr.appendChild(a); tr.appendChild(b); t.appendChild(tr);
    });
    d.appendChild(t); return d;
  }

  /* API: monta a figura de uma conclusão. Sem `grafico` no JSON, devolve null. */
  function montar(conclusao, numeros, larg) {
    var g = conclusao && conclusao.grafico;
    if (!g || !FORMAS[g.tipo]) return null;
    var svg;
    try { svg = FORMAS[g.tipo](g, numeros || {}, larg || 560); }
    catch (e) { return null; }
    if (!svg) return null;
    var fig = document.createElement('figure'); fig.className = 'esb-graf';
    if (g.titulo) {
      var cap = document.createElement('figcaption');
      cap.textContent = g.titulo + (g.unidade ? ' · ' + g.unidade : '');
      fig.appendChild(cap);
    }
    svg.setAttribute('aria-label', (g.titulo || 'gráfico') + '. Os números estão na tabela abaixo.');
    fig.appendChild(svg);
    var tb = tabela(g, numeros || {});
    if (tb) fig.appendChild(tb);
    return fig;
  }

  window.ESB_GRAFICO = { montar: montar, formas: Object.keys(FORMAS) };

  /* Quem redesenha ao trocar de tema e o estudo_serieb.js, que e dono dos encaixes:
     ele observa a classe do body e remonta as figuras. Aqui nao ha estado a guardar. */

})();
