/* Aba "Ameaça (xT)" — índice de ameaça por jogador, APROXIMAÇÃO de xT com os totais por 90 do Wyscout
   (gerar_ameaca_js.py explica os pesos). O dado (3 MB) só é baixado quando a aba abre. Arquivo próprio; observa o botão. */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (x, d) => x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const sem = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const POS = [['LD', 'Lateral direito'], ['ZD', 'Zagueiro direito'], ['ZE', 'Zagueiro esquerdo'], ['LE', 'Lateral esquerdo'], ['VOL', 'Volante'], ['MED', 'Médio'], ['MEI', 'Meia'], ['ED', 'Extremo direito'], ['EE', 'Extremo esquerdo'], ['CA', 'Centroavante']];
  const MERC = [['b', 'Série B'], ['sa', 'Ligas sul-americanas'], ['ext', 'Sul-americanos no exterior'], ['a', 'Série A'], ['todas', 'Todas as ligas']];
  const CORES = ['#4a90d9', '#e07b39', '#2e9e55', '#b05bd6'];
  const ORDS = [['xt', 'xT estimado'], ['k0', 'Progressão por passe'], ['k1', 'Entrega na área'], ['k2', 'Condução'], ['k3', 'Criação de finalização'], ['perig', 'Passes perigosos (SkillCorner)']];
  const LS = 'sc2027_ameaca';
  let E = { pos: 'MEI', merc: 'b', ord: 'xt', imin: '', imax: '', busca: '', teto: false, abre: null };
  try { Object.assign(E, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) {}
  let A = null, carregando = false;

  function carregar(cb) {
    if (window.AMEACA) { A = window.AMEACA; return cb(); }
    if (carregando) return; carregando = true;
    const s = document.createElement('script'); s.src = (window.__estatico ? '' : '/') + 'static/ameaca_dados.js?v=' + (window.__verDados || Date.now());
    s.onload = () => { A = window.AMEACA; cb(); }; s.onerror = () => { const R = document.getElementById('amCorpo'); if (R) R.innerHTML = '<p class="am-vz">não consegui carregar os dados.</p>'; };
    document.head.appendChild(s);
  }
  /* letra física e selo pela base do app (mesma regra dos cards) */
  let porNome = null; const memo = new Map();
  function sinais(j) {
    if (memo.has(j)) return memo.get(j);
    let o = '';
    try {
      if (typeof BASE !== 'undefined' && BASE.length) {
        if (!porNome || porNome.n !== BASE.length) { porNome = new Map(); BASE.forEach(b => { const k = sem(b.n) + '|' + b.l; (porNome.get(k) || porNome.set(k, []).get(k)).push(b); }); porNome.n = BASE.length; }
        const c = porNome.get(sem(j.n) + '|' + j.l) || []; const bj = c.find(b => sem(b.t) === sem(j.c)) || (c.length === 1 ? c[0] : null);
        if (bj) {
          let x = Object.assign({}, bj, { p: j.p }); try { if (typeof comFisicoDoEstudo === 'function') x = comFisicoDoEstudo(x) || x; } catch (e) {}
          const l = typeof tipoLetra === 'function' ? tipoLetra(x) : null;
          o = (l ? '<i class="nz-l nz-l' + l + '">' + l + '</i>' : '') + (window.subidaSelo ? window.subidaSelo(Object.assign({}, bj, { p: j.p })) : '');
        }
      }
    } catch (e) {}
    memo.set(j, o); return o;
  }
  function filtrados() {
    const q = sem(E.busca);
    return A.jog.filter(j => j.p === E.pos && (E.merc === 'todas' || j.m === E.merc) &&
      (E.imin === '' || (j.i != null && j.i >= +E.imin)) && (E.imax === '' || (j.i != null && j.i <= +E.imax)) &&
      (!E.teto || j.v == null || j.v <= 2) && (!q || sem(j.n + ' ' + j.c + ' ' + j.l).includes(q)));
  }
  const valOrd = j => E.ord === 'xt' ? j.xt : E.ord === 'perig' ? (j.sc && j.sc.perig) : j.k[+E.ord.slice(1)];
  function barra(j, mx) {
    return '<span class="am-bar" title="' + A.comp.map((c, i) => c.rot + ': ' + num(j.k[i], 3)).join(' · ') + '">' +
      j.k.map((v, i) => v ? '<i style="width:' + Math.max(0, 100 * v / mx).toFixed(1) + '%;background:' + CORES[i] + '"></i>' : '').join('') + '</span>';
  }
  function detalhe(j) {
    let n = 0;
    return '<tr class="am-det"><td colspan="20"><div>' + A.comp.map((c, i) => '<span><b style="color:' + CORES[i] + '">' + esc(c.rot) + ' ' + num(j.k[i], 3) + '</b> = ' +
      c.acoes.map(a => { const v = j.d[n++]; return esc(a[0]) + ' ' + num(v, 2) + '/90 × ' + num(a[1], 3); }).join(' + ') + '</span>').join('') +
      (j.sc ? '<span><b>SkillCorner (por 30 min com a bola)</b>: passes perigosos ' + num(j.sc.perig, 2) + ' · passes que viram finalização em 10 s ' + num(j.sc.pfin, 2) + ' · que viram gol ' + num(j.sc.pgol, 2) + ' · posses que viram finalização em 10 s ' + num(j.sc.posfin, 2) + '</span>' : '') + '</div></td></tr>';
  }
  function render() {
    const R = document.getElementById('amCorpo'); if (!R) return;
    if (!A) { R.innerHTML = '<p class="am-vz">carregando o índice de ameaça…</p>'; carregar(render); return; }
    const L = filtrados().filter(j => valOrd(j) != null).sort((a, b) => valOrd(b) - valOrd(a));
    const mostra = L.slice(0, 80), mx = Math.max(...mostra.map(j => j.xt), 0.01), comSC = E.merc === 'b' || mostra.some(j => j.sc);
    const pos = POS.find(p => p[0] === E.pos)[1];
    let h = '<div class="am-topo"><div><h2>Ameaça (xT estimado)</h2><p>Quanto cada jogador leva a bola para zona de perigo, por 90 min: cada ação certa que progride (passe progressivo, passe ao terço final, passe para a área, passe em profundidade, cruzamento, condução, drible, aceleração) vezes o ganho típico de xT daquela ação, mais o xA. ' +
      '<b>É uma aproximação</b>: o xT de verdade precisa de cada lance com ponto de saída e de chegada, que a base não tem. Serve para ordenar e comparar dentro da posição. Na Série B 2026 entram também os passes perigosos do SkillCorner.</p></div><button class="ta-bt" id="amPdf">Gerar PDF</button></div>' +
      '<div class="am-ctrl"><div class="ta-chips">' + POS.map(p => '<button class="ta-chip' + (E.pos === p[0] ? ' on' : '') + '" data-pos="' + p[0] + '">' + esc(p[1]) + '</button>').join('') + '</div>' +
      '<div class="ta-chips">' + MERC.map(m => '<button class="ta-chip' + (E.merc === m[0] ? ' on' : '') + '" data-merc="' + m[0] + '">' + esc(m[1]) + ' <b>' + A.jog.filter(j => j.p === E.pos && (m[0] === 'todas' || j.m === m[0])).length + '</b></button>').join('') + '</div>' +
      '<label class="ta-chk">idade <input type="number" id="amImin" placeholder="de" value="' + esc(E.imin) + '"> a <input type="number" id="amImax" placeholder="até" value="' + esc(E.imax) + '"></label>' +
      '<label class="ta-chk"><input type="checkbox" id="amTeto"' + (E.teto ? ' checked' : '') + '> até € 2 MM</label>' +
      '<label class="ta-chk">ordenar por <select id="amOrd">' + ORDS.map(o => '<option value="' + o[0] + '"' + (E.ord === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>' +
      '<input class="am-busca" id="amBusca" placeholder="buscar jogador, clube ou liga" value="' + esc(E.busca) + '"></div>' +
      '<div class="am-leg">' + A.comp.map((c, i) => '<span><i style="background:' + CORES[i] + '"></i>' + esc(c.rot) + '</span>').join('') + '<span class="am-n"><b>' + L.length + '</b> ' + esc(pos.toLowerCase()) + 's · mostrando os ' + mostra.length + ' primeiros · clique na linha para ver a conta</span></div>';
    h += '<table class="am-tab"><thead><tr><th>#</th><th>Jogador</th><th>Clube · liga</th><th class="n">Id.</th><th class="n">Min</th><th class="n">Valor</th><th class="n">xT est./90</th><th class="n" title="percentil na posição dentro da liga dele">P liga</th><th class="n" title="percentil na posição entre todas as ligas">P geral</th><th>Composição</th>' +
      (comSC ? '<th class="n" title="passes perigosos por 30 min com a bola (SkillCorner, Série B 2026)">Perig./30</th><th class="n" title="passes que viram finalização em 10 s, por 30 min com a bola">Fin.10s/30</th>' : '') + '</tr></thead><tbody>';
    mostra.forEach((j, i) => {
      const id = j.n + '|' + j.c + '|' + j.l;
      h += '<tr class="am-l' + (E.abre === id ? ' on' : '') + '" data-id="' + esc(id) + '"><td class="n i">' + (i + 1) + '</td><td class="nm">' + esc(j.n) + ' ' + sinais(j) + '</td><td class="cl">' + esc(j.c) + ' <em>· ' + esc(j.l) + '</em></td>' +
        '<td class="n">' + (j.i || '—') + '</td><td class="n">' + num(j.min, 0) + '</td><td class="n">' + (j.v ? '€ ' + num(j.v, 1) : '—') + '</td>' +
        '<td class="n x"><b>' + num(j.xt, 3) + '</b></td><td class="n p">' + j.pl + '</td><td class="n p">' + j.pp + '</td><td class="cp">' + barra(j, mx) + '</td>' +
        (comSC ? '<td class="n">' + (j.sc ? num(j.sc.perig, 2) : '—') + '</td><td class="n">' + (j.sc ? num(j.sc.pfin, 2) : '—') + '</td>' : '') + '</tr>';
      if (E.abre === id) h += detalhe(j);
    });
    h += '</tbody></table><p class="am-nota">Pesos (ganho típico de xT por ação certa, modelo de grade do xT): passe progressivo 0,012 · passe ao terço final 0,008 · passe para a área 0,045 · passe em profundidade 0,030 · cruzamento 0,008 · condução progressiva 0,015 · drible 0,010 · aceleração 0,005 · xA × 0,35. ' +
      'Ação certa = volume por 90 × % de acerto. Percentil "liga" = na posição, dentro da liga do jogador; "geral" = na posição, entre todas as 60 ligas (liga mais fraca tende a inflar). 900 min ou mais; vetados ficam de fora. Letra A/B/C e selo ▲ ↔ ▼ como nos cards.</p>';
    R.innerHTML = h;
    try { localStorage.setItem(LS, JSON.stringify(Object.assign({}, E, { busca: '' }))); } catch (e) {}
  }
  function ligar() {
    const bt = document.querySelector('.aba[data-aba="ameaca"]'), pg = document.getElementById('pgAmeaca'), R = document.getElementById('amCorpo');
    if (!bt || !pg || !R) return;
    R.addEventListener('click', ev => {
      const t = ev.target;
      if (t.closest('[data-pos]')) { E.pos = t.closest('[data-pos]').dataset.pos; E.abre = null; return render(); }
      if (t.closest('[data-merc]')) { E.merc = t.closest('[data-merc]').dataset.merc; E.abre = null; return render(); }
      if (t.id === 'amPdf') { document.body.classList.add('imp-ameaca'); const fim = () => { document.body.classList.remove('imp-ameaca'); window.removeEventListener('afterprint', fim); }; window.addEventListener('afterprint', fim); window.print(); return; }
      const l = t.closest('tr.am-l'); if (l) { E.abre = E.abre === l.dataset.id ? null : l.dataset.id; render(); }
    });
    R.addEventListener('change', ev => { const t = ev.target;
      if (t.id === 'amOrd') E.ord = t.value; else if (t.id === 'amImin') E.imin = t.value; else if (t.id === 'amImax') E.imax = t.value; else if (t.id === 'amTeto') E.teto = t.checked; else return; render(); });
    let tm = null;
    R.addEventListener('input', ev => { if (ev.target.id !== 'amBusca') return; E.busca = ev.target.value; clearTimeout(tm); tm = setTimeout(() => { const p = ev.target.selectionStart; render(); const b = document.getElementById('amBusca'); if (b) { b.focus(); b.setSelectionRange(p, p); } }, 250); });
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on) render(); };
    window.addEventListener('subida-kpis', () => { memo.clear(); if (bt.classList.contains('on') && A) render(); });
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
