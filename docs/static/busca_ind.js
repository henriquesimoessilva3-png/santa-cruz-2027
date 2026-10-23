/* 23/10/2026 — filtro por indicador na janela "Escolher jogador" (pedido do Henrique: "inclua no filtro os indicadores
   técnicos e físicos e suas faixas, com a bolinha que arrasta para frente e para trás, igual ao ranking").
   "+ indicador" abre a lista (físico = os da ficha, SkillCorner; técnico = os do ranking da posição, Wyscout); cada
   indicador escolhido vira uma régua com duas bolinhas (mínimo e máximo), da menor à maior marca da posição.
   Quem não tem o dado do indicador sai da lista enquanto o filtro estiver ligado. Só usa funções do app.js. */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = v => v == null || !isFinite(v) ? '—' : Number(v).toLocaleString('pt-BR', { maximumFractionDigits: Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2 });
  const $ = s => document.querySelector(s);
  let FIL = [];   /* { tipo: 'fis'|'tec', k (campo ou nome do indicador), rot, lo, hi, min, max } */
  const fisMemo = new WeakMap();
  const posFiltro = () => ($('#fPos') && $('#fPos').value) || (typeof posAtual !== 'undefined' ? posAtual : '') || '';
  const kpis = {};   /* pos → { nomes, porPk: Map(pk → {nome: valor}) } */
  function carregarKpis(pos) {
    if (!pos) return Promise.resolve(null);
    if (kpis[pos]) return Promise.resolve(kpis[pos]);
    if (!cachePosKpis[pos]) cachePosKpis[pos] = fetch('dados/kpis/' + pos + '.json' + (window.__verDados ? '?v=' + window.__verDados : '')).then(r => (r.ok ? r.json() : null)).catch(() => null);
    return Promise.resolve(cachePosKpis[pos]).then(b => {
      if (!b) return null;
      const porPk = new Map();
      for (const pk in b.jogadores) { const o = {}; b.jogadores[pk].forEach(([id, v]) => { const nm = b.kpis[id]; if (nm && typeof v === 'number') o[nm[1]] = v; }); porPk.set(pk, o); }
      return (kpis[pos] = { nomes: b.kpis, porPk });
    });
  }
  function fisDe(j) {
    let x = fisMemo.get(j);
    if (!x) { x = j; if (typeof j.psv !== 'number') { try { x = comFisicoDoEstudo(j) || j; } catch (e) {} } fisMemo.set(j, x); }
    return x;
  }
  function valor(j, f) {
    if (f.tipo === 'fis') { const v = fisDe(j)[f.k]; return typeof v === 'number' && isFinite(v) ? v : null; }
    const K = kpis[f.pos]; if (!K) return null;
    const o = K.porPk.get(primaryKey(j)); const v = o ? o[f.k] : null; return typeof v === 'number' ? v : null;
  }
  function passa(j) {
    for (const f of FIL) {
      if (f.lo <= f.min && f.hi >= f.max) continue;   /* régua inteira = sem filtro */
      const v = valor(j, f);
      if (v == null || v < f.lo || v > f.hi) return false;
    }
    return true;
  }
  /* faixa da régua: menor e maior valor entre os jogadores da posição (na base inteira) */
  function faixa(f) {
    let mn = Infinity, mx = -Infinity;
    if (f.tipo === 'fis') { const pos = f.pos; BASE.forEach(j => { if (pos && j.p !== pos) return; const v = valor(j, f); if (v == null) return; if (v < mn) mn = v; if (v > mx) mx = v; }); }
    else { const K = kpis[f.pos]; if (K) K.porPk.forEach(o => { const v = o[f.k]; if (typeof v !== 'number') return; if (v < mn) mn = v; if (v > mx) mx = v; }); }
    if (!isFinite(mn)) { mn = 0; mx = 1; }
    if (mn === mx) mx = mn + 1;
    return [mn, mx];
  }
  let tRender = null;
  const refaz = () => { clearTimeout(tRender); tRender = setTimeout(() => { if (typeof renderTabela === 'function') renderTabela(); }, 140); };

  /* ---------- tela ---------- */
  function caixa() {
    let box = $('#fIndBox');
    if (!box) {
      const lim = $('#fLimpar'); if (!lim) return null;
      const bt = document.createElement('button'); bt.className = 'bt mini fi-ind-add'; bt.id = 'fIndAdd'; bt.type = 'button'; bt.textContent = '+ indicador';
      bt.title = 'Filtrar por um indicador físico ou técnico, com a faixa (mínimo e máximo) na régua';
      lim.before(bt);
      box = document.createElement('div'); box.id = 'fIndBox'; box.className = 'fi-ind-box';
      lim.parentElement.after(box);
      bt.onclick = e => { e.stopPropagation(); abrirLista(bt); };
      lim.addEventListener('click', () => { FIL = []; desenhar(); });
      box.addEventListener('input', e => {
        const el = e.target.closest('input[type=range]'); if (!el) return;
        const i = +el.dataset.i, f = FIL[i]; if (!f) return;
        const v = f.min + (f.max - f.min) * (+el.value) / 1000;
        if (el.dataset.l === 'lo') f.lo = Math.min(v, f.hi); else f.hi = Math.max(v, f.lo);
        atualizarRotulos(i); refaz();
      });
      box.addEventListener('click', e => { const x = e.target.closest('[data-x]'); if (!x) return; FIL.splice(+x.dataset.x, 1); desenhar(); refaz(); });
    }
    return box;
  }
  function atualizarRotulos(i) {
    const f = FIL[i], el = document.querySelector('.fi-ind[data-i="' + i + '"]'); if (!el) return;
    el.querySelector('.lo').textContent = fmt(f.lo); el.querySelector('.hi').textContent = fmt(f.hi);
    const a = 100 * (f.lo - f.min) / (f.max - f.min), b = 100 * (f.hi - f.min) / (f.max - f.min);
    el.querySelector('.fi-ind-trilho i').style.cssText = 'left:' + a + '%;width:' + Math.max(0, b - a) + '%';
    const r = el.querySelectorAll('input[type=range]'); if (r[0]) r[0].value = Math.round(10 * a); if (r[1]) r[1].value = Math.round(10 * b);
  }
  function desenhar() {
    const box = caixa(); if (!box) return;
    box.innerHTML = FIL.map((f, i) => '<div class="fi-ind" data-i="' + i + '"><div class="fi-ind-cab"><b>' + esc(f.rot) + '</b><small>' + (f.tipo === 'fis' ? 'físico' : 'técnico · ' + esc(f.pos)) + '</small><button type="button" data-x="' + i + '" title="tirar o filtro">✕</button></div>' +
      '<div class="fi-ind-regua"><span class="lo"></span><div class="fi-ind-trilho"><i></i><input type="range" min="0" max="1000" step="1" data-i="' + i + '" data-l="lo"><input type="range" min="0" max="1000" step="1" data-i="' + i + '" data-l="hi"></div><span class="hi"></span></div>' +
      '<div class="fi-ind-pe"><span>' + fmt(f.min) + '</span><span>' + fmt(f.max) + '</span></div></div>').join('');
    FIL.forEach((f, i) => atualizarRotulos(i));
    box.style.display = FIL.length ? '' : 'none';
  }
  async function abrirLista(bt) {
    let pop = $('#fIndPop');
    if (pop) { pop.remove(); return; }
    pop = document.createElement('div'); pop.id = 'fIndPop'; pop.className = 'fi-ind-pop';
    const pos = posFiltro();
    pop.innerHTML = '<input type="search" placeholder="buscar indicador…" id="fIndQ"><div class="fi-ind-lista">carregando…</div>';
    document.body.appendChild(pop);
    const rc = bt.getBoundingClientRect(); pop.style.top = (rc.bottom + 4) + 'px'; pop.style.left = Math.min(rc.left, window.innerWidth - 340) + 'px';
    const K = await carregarKpis(pos);
    const fis = []; (typeof FIS_GRUPOS !== 'undefined' ? FIS_GRUPOS : []).forEach(([g, rows]) => rows.forEach(([k, rot]) => fis.push({ tipo: 'fis', k, rot, g })));
    const tec = K ? K.nomes.map(([g, nm]) => ({ tipo: 'tec', k: nm, rot: nm, g })) : [];
    const todos = fis.concat(tec);
    const lista = pop.querySelector('.fi-ind-lista');
    const pinta = q => {
      const n = String(q || '').toLowerCase();
      let h = '', gAnt = '';
      todos.forEach((x, i) => {
        if (n && !x.rot.toLowerCase().includes(n)) return;
        const g = (x.tipo === 'fis' ? 'Físico · ' : 'Técnico · ') + x.g;
        if (g !== gAnt) { h += '<div class="fi-ind-g">' + esc(g) + '</div>'; gAnt = g; }
        h += '<button type="button" data-n="' + i + '">' + esc(x.rot) + '</button>';
      });
      lista.innerHTML = h || '<div class="fi-ind-g">nenhum</div>';
      if (!K) lista.insertAdjacentHTML('beforeend', '<div class="fi-ind-g">técnico: escolha a posição no filtro para ver os indicadores do ranking</div>');
    };
    pinta('');
    const q = pop.querySelector('#fIndQ'); q.oninput = () => pinta(q.value); q.focus();
    lista.onclick = e => {
      const b = e.target.closest('[data-n]'); if (!b) return;
      const x = todos[+b.dataset.n]; const f = { tipo: x.tipo, k: x.k, rot: x.rot, pos };
      const [mn, mx] = faixa(f); f.min = mn; f.max = mx; f.lo = mn; f.hi = mx;
      FIL.push(f); pop.remove(); desenhar();
    };
    setTimeout(() => document.addEventListener('click', function fora(ev) { if (!pop.contains(ev.target) && ev.target !== bt) { pop.remove(); document.removeEventListener('click', fora); } }), 0);
  }

  function ligar() {
    if (typeof window.filtrar !== 'function') return;
    const f0 = window.filtrar;
    window.filtrar = function () { const r = f0.apply(this, arguments); return FIL.length ? r.filter(passa) : r; };
    const ab = window.abrirBusca;
    if (typeof ab === 'function') window.abrirBusca = function () {
      const r = ab.apply(this, arguments);
      /* a posição da vaga mudou: o técnico usa o arquivo de outra posição — os filtros técnicos de outra posição saem */
      const p = posFiltro(); const antes = FIL.length; FIL = FIL.filter(f => f.tipo === 'fis' || f.pos === p);
      FIL.forEach(f => { if (f.tipo === 'fis' && f.pos !== p) { f.pos = p; const [mn, mx] = faixa(f); f.min = mn; f.max = mx; f.lo = Math.max(f.lo, mn); f.hi = Math.min(f.hi, mx); } });
      desenhar(); if (FIL.length || antes) refaz();
      return r;
    };
    caixa(); desenhar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
