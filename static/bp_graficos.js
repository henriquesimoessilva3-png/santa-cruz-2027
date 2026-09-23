/* Gráficos da aba "Bola parada · jogadores" (Série B, Sofascore + Wyscout). Três perguntas:
     1. Quem cobra muito E vira assistência? volume × assistências de bola parada, 2024–26
     2. Quem converte cobrança em assistência? assistências por 100 cobranças (≥ 150 cobranças)
     3. Quem finaliza bola parada acima do esperado? xG × gols de bola parada, 2025–26
   SVG à mão, uma cor só (a do clube) para o destaque e cinza para o resto; tooltip por ponto.
   Exporta window.bpGraficos(alvo) — chamado por bp_jogadores.js na visão "Gráficos". */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const semAc = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const n1 = x => Number(x).toLocaleString('pt-BR', { maximumFractionDigits: 1 });

  function passos(max, alvo) {
    const bruto = max / alvo, pot = Math.pow(10, Math.floor(Math.log10(bruto || 1)));
    const p = [1, 2, 2.5, 5, 10].map(m => m * pot).find(v => v >= bruto) || pot * 10;
    const out = []; for (let v = 0; v <= max + 1e-9; v += p) out.push(+v.toFixed(6)); return { p, ticks: out };
  }

  let tip;
  function tooltip() {
    if (tip) return tip;
    tip = document.createElement('div'); tip.className = 'bpg-tip'; document.body.appendChild(tip); return tip;
  }
  function mostrar(ev, html) { const t = tooltip(); t.innerHTML = html; t.style.display = 'block';
    const x = Math.min(ev.clientX + 14, window.innerWidth - t.offsetWidth - 8);
    t.style.left = x + 'px'; t.style.top = (ev.clientY + 14) + 'px'; }
  function esconder() { if (tip) tip.style.display = 'none'; }

  /* dispersão: pts = [{x, y, rot, dest, html}] */
  function dispersao(el, pts, o) {
    const W = Math.max(520, Math.min(el.clientWidth || 760, 980)), H = 400, m = { l: 52, r: 24, t: 16, b: 46 };
    const maxX = Math.max(...pts.map(p => p.x)) * 1.06, maxY = Math.max(...pts.map(p => p.y), 1) * 1.12;
    const tx = passos(maxX, 6), ty = passos(maxY, 5);
    const X = v => m.l + v / tx.ticks[tx.ticks.length - 1 ] * 0 + v / Math.max(maxX, tx.ticks[tx.ticks.length - 1]) * (W - m.l - m.r);
    const MX = Math.max(maxX, tx.ticks[tx.ticks.length - 1]), MY = Math.max(maxY, ty.ticks[ty.ticks.length - 1]);
    const x = v => m.l + v / MX * (W - m.l - m.r), y = v => H - m.b - v / MY * (H - m.t - m.b);
    let s = '<svg class="bpg-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.titulo) + '">';
    ty.ticks.forEach(v => { s += '<line class="g" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>' +
      '<text class="ax" x="' + (m.l - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + n1(v) + '</text>'; });
    tx.ticks.forEach(v => { s += '<text class="ax" x="' + x(v) + '" y="' + (H - m.b + 18) + '" text-anchor="middle">' + n1(v) + '</text>'; });
    s += '<line class="base" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y(0) + '" y2="' + y(0) + '"/>';
    if (o.linha) {                       /* referência: y = a·x */
      const xe = Math.min(MX, MY / o.linha.a);
      s += '<line class="ref" x1="' + x(0) + '" y1="' + y(0) + '" x2="' + x(xe) + '" y2="' + y(o.linha.a * xe) + '"/>' +
        '<text class="refl" x="' + (x(xe) - 4) + '" y="' + (y(o.linha.a * xe) - 6) + '" text-anchor="end">' + esc(o.linha.rot) + '</text>';
    }
    s += '<text class="axt" x="' + ((W + m.l) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + esc(o.eixoX) + '</text>' +
      '<text class="axt" transform="translate(14 ' + ((H - m.b + m.t) / 2) + ') rotate(-90)" text-anchor="middle">' + esc(o.eixoY) + '</text>';
    const ord = pts.slice().sort((a, b) => (a.dest ? 1 : 0) - (b.dest ? 1 : 0));
    ord.forEach((p, i) => { s += '<circle class="pt' + (p.dest ? ' dest' : '') + '" data-i="' + pts.indexOf(p) + '" cx="' + x(p.x) + '" cy="' + y(p.y) + '" r="' + (p.dest ? 6 : 4.5) + '"/>'; });
    /* rótulos só nos destacados. Cada rótulo tenta quatro cantos em volta do ponto e fica no
       primeiro que não encosta em outro rótulo nem em outro ponto destacado. */
    const caixas = [], pontos = pts.filter(p => p.dest).map(p => ({ x: x(p.x), y: y(p.y) }));
    const bate = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
    pts.filter(p => p.dest && p.rot).sort((a, b) => b.y - a.y || b.x - a.x).forEach(p => {
      const px = x(p.x), py = y(p.y), w = p.rot.length * 6.6 + 4, h = 13;
      const cand = [[8, -8, 'start'], [-8, -8, 'end'], [8, 16, 'start'], [-8, 16, 'end'], [8, -21, 'start'], [-8, -21, 'end'], [8, 29, 'start'], [-8, 29, 'end']];
      let esc_ = null;
      for (const [dx, dy, anc] of cand) {
        const x0 = anc === 'start' ? px + dx : px + dx - w, cx = { x0, x1: x0 + w, y0: py + dy - 11, y1: py + dy + 2 };
        if (cx.x0 < m.l || cx.x1 > W - 2) continue;
        if (caixas.some(c => bate(c, cx))) continue;
        if (pontos.some(q => (q.x !== px || q.y !== py) && q.x > cx.x0 - 5 && q.x < cx.x1 + 5 && q.y > cx.y0 - 5 && q.y < cx.y1 + 5)) continue;
        esc_ = { dx, dy, anc, cx }; break;
      }
      if (!esc_) { const x0 = px + 8; esc_ = { dx: 8, dy: -8, anc: 'start', cx: { x0, x1: x0 + w, y0: py - 19, y1: py - 6 } }; }
      caixas.push(esc_.cx);
      s += '<text class="lab" x="' + (px + esc_.dx) + '" y="' + (py + esc_.dy) + '" text-anchor="' + esc_.anc + '">' + esc(p.rot) + '</text>';
    });
    s += '</svg>';
    el.innerHTML = s;
    el.querySelectorAll('circle.pt').forEach(c => {
      const p = pts[+c.dataset.i];
      c.addEventListener('mousemove', ev => mostrar(ev, p.html));
      c.addEventListener('mouseleave', esconder);
    });
  }

  function barras(el, itens, o) {
    const W = Math.max(520, Math.min(el.clientWidth || 760, 980)), lin = 26, m = { l: 190, r: 70, t: 6, b: 26 };
    const H = m.t + m.b + itens.length * lin, max = Math.max(...itens.map(i => i.v)) * 1.05;
    const x = v => m.l + v / max * (W - m.l - m.r);
    let s = '<svg class="bpg-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.titulo) + '">';
    if (o.media != null) s += '<line class="ref" x1="' + x(o.media) + '" x2="' + x(o.media) + '" y1="' + m.t + '" y2="' + (H - m.b + 4) + '"/>' +
      '<text class="refl" x="' + (x(o.media) + 4) + '" y="' + (H - 6) + '">' + esc(o.mediaRot) + '</text>';
    itens.forEach((it, k) => {
      const yy = m.t + k * lin, w = Math.max(2, x(it.v) - m.l);
      s += '<text class="lab2" x="' + (m.l - 8) + '" y="' + (yy + 17) + '" text-anchor="end">' + esc(it.rot) + '</text>' +
        '<rect class="bar" data-k="' + k + '" x="' + m.l + '" y="' + (yy + 5) + '" width="' + w + '" height="16" rx="4"/>' +
        '<text class="val" x="' + (m.l + w + 6) + '" y="' + (yy + 17) + '">' + esc(it.txt) + '</text>';
    });
    s += '</svg>'; el.innerHTML = s;
    el.querySelectorAll('rect.bar').forEach(r => { const it = itens[+r.dataset.k];
      r.addEventListener('mousemove', ev => mostrar(ev, it.html)); r.addEventListener('mouseleave', esconder); });
  }

  window.bpGraficos = function (alvo) {
    const D = window.BP_JOGADORES; if (!D || !D.cobradores_24_26) { alvo.innerHTML = '<p class="bpj-nota">Sem dado para os gráficos.</p>'; return; }
    const ex = new Set((D.excluidos || []).map(e => semAc(e[0])));
    const C = D.cobradores_24_26.linhas.map(r => ({ j: r[0], c: r[1], pos: r[2], cob: r[3], a: r[4], ae: r[5], fd: r[6] }));
    const taxa = C.reduce((s, r) => s + r.a, 0) / C.reduce((s, r) => s + r.cob, 0);
    const destC = new Set(C.slice().sort((a, b) => b.a - a.a || b.cob - a.cob).slice(0, 9).map(r => r.j)
      .concat(C.slice().sort((a, b) => b.cob - a.cob).slice(0, 4).map(r => r.j)));
    /* finalizadores 2025–26 por pessoa (id do Sofascore) */
    const P = D.producao, ix = k => P.colunas.indexOf(k), por = new Map();
    P.linhas.forEach(l => { if (l[ix('ano')] < 2025) return; const k = l[ix('sid')];
      let o = por.get(k); if (!o) por.set(k, o = { j: l[ix('nome')], cl: new Set(), pos: '', g: 0, gc: 0, xg: 0, f: 0 });
      o.cl.add(l[ix('clube')]); if (l[ix('pos')]) o.pos = l[ix('pos')];
      o.g += l[ix('gols_bp')] || 0; o.gc += l[ix('gols_bp_cabeca')] || 0; o.xg += l[ix('xg_bp')] || 0; o.f += l[ix('finalizacoes_bp')] || 0; });
    const F = [...por.values()].filter(o => !ex.has(semAc(o.j)) && (o.xg >= 0.8 || o.g >= 2));
    const destF = new Set(F.slice().sort((a, b) => b.g - a.g || (b.g - b.xg) - (a.g - a.xg)).slice(0, 10).map(o => o.j));

    alvo.innerHTML =
      '<section class="bpg"><h3>Quem cobra muito e vira assistência</h3>' +
      '<p class="bpg-d">Cada ponto é um jogador da Série B (2024–26, ≥ 60 cobranças). À direita, quem mais cobra escanteio e falta; ' +
      'para cima, quem mais deu assistência em bola parada. A linha tracejada é a média da liga (' + n1(taxa * 100) +
      ' assistências a cada 100 cobranças): acima dela, a cobrança dele vira gol mais que a dos outros.</p><div class="bpg-c" id="bpgA"></div></section>' +
      '<section class="bpg"><h3>Acerto do cobrador: assistências a cada 100 cobranças</h3>' +
      '<p class="bpg-d">Só quem cobrou pelo menos 150 bolas paradas em 2024–26 — abaixo disso, uma assistência a mais muda tudo.</p>' +
      '<div class="bpg-c" id="bpgB"></div></section>' +
      '<section class="bpg"><h3>Quem finaliza bola parada acima do esperado</h3>' +
      '<p class="bpg-d">Série B 2025–26 (o Sofascore só tem xG de bola parada desde 2025). À direita, quem recebe as melhores chances ' +
      '(xG); para cima, quem faz os gols. Acima da diagonal, fez mais gols do que as chances valiam. Sem pênaltis e sem gols contra.</p>' +
      '<div class="bpg-c" id="bpgC"></div></section>';

    dispersao(alvo.querySelector('#bpgA'), C.map(r => ({ x: r.cob, y: r.a, dest: destC.has(r.j), rot: r.j,
      html: '<b>' + esc(r.j) + '</b> · ' + esc(r.pos || '') + ' · ' + esc(r.c) + '<br>' + r.cob + ' cobranças · <b>' + r.a +
        '</b> assistências de BP (' + r.ae + ' de escanteio)<br>' + n1(r.a / r.cob * 100) + ' por 100 cobranças · ' + r.fd + ' gols de falta direta' })),
      { titulo: 'Cobranças × assistências de bola parada', eixoX: 'Bolas paradas cobradas (escanteios + faltas), 2024–26',
        eixoY: 'Assistências de bola parada', linha: { a: taxa, rot: 'média da liga' } });

    const B = C.filter(r => r.cob >= 150).map(r => ({ ...r, t: r.a / r.cob * 100 })).sort((a, b) => b.t - a.t).slice(0, 14);
    barras(alvo.querySelector('#bpgB'), B.map(r => ({ v: r.t, rot: r.j + ' · ' + r.c, txt: n1(r.t) + ' (' + r.a + '/' + r.cob + ')',
      html: '<b>' + esc(r.j) + '</b> · ' + esc(r.c) + '<br>' + r.a + ' assistências em ' + r.cob + ' cobranças' })),
      { titulo: 'Assistências por 100 cobranças', media: taxa * 100, mediaRot: 'média ' + n1(taxa * 100) });

    dispersao(alvo.querySelector('#bpgC'), F.map(o => ({ x: o.xg, y: o.g, dest: destF.has(o.j), rot: o.j,
      html: '<b>' + esc(o.j) + '</b> · ' + esc(o.pos) + ' · ' + esc([...o.cl].join(', ')) + '<br><b>' + o.g + '</b> gols de BP (' + o.gc +
        ' de cabeça) · xG ' + n1(o.xg) + '<br>' + o.f + ' finalizações de bola parada' })),
      { titulo: 'xG × gols de bola parada', eixoX: 'xG de bola parada (qualidade das chances), 2025–26', eixoY: 'Gols de bola parada',
        linha: { a: 1, rot: 'gols = xG' } });
  };
})();
