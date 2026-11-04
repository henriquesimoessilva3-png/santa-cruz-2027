/* 04/11/2026 — aba 6 "Listas": as cinco listas completas por campeonato (Série B, Série A, brasileiros no exterior,
   sul-americanos e segundas divisões) como tabela, com filtros e ordenação — os mesmos jogadores, a mesma ordem e as mesmas
   cores dos PDFs (sem a Nota TR). Dado: static/listas_dados.js. O nome abre a ficha do jogador no campograma.
   A letra física segue a regra atual do app: médio e meia que são A e também explosivos + volume viram A+ (04/11). */
(function () {
  'use strict';
  const D = window.LISTAS_CAMP; if (!D) return;
  const LS = 'sc2027_listas';
  const K = {}; D.campos.forEach((c, i) => { K[c] = i; });
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (x, d) => x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const POSN = { LD: 'LD', ZD: 'ZAG (D)', ZE: 'ZAG (E)', LE: 'LE', VOL: 'VOL', MED: 'MED', MEI: 'MEI', ED: 'EXT (D)', EE: 'EXT (E)', CA: 'CA' };
  const POSL = [['LD', 'Lateral direito'], ['ZD', 'Zagueiro direito'], ['ZE', 'Zagueiro esquerdo'], ['LE', 'Lateral esquerdo'], ['VOL', 'Volantes'], ['MED', 'Médios'], ['MEI', 'Meias'], ['ED', 'Extremo direito'], ['EE', 'Extremo esquerdo'], ['CA', 'Centroavantes']];
  const T2N = ['Elite', 'Mantém', 'Cai um pouco', 'Cai muito'], T2C = ['az', 'v', 'am', 'vm'];
  const LORD = { 'A+': 0, A: 1, B: 2, C: 3 };
  const ALTF = { ZD: [188, 183], ZE: [188, 183], CA: [188, 183], VOL: [183, 178], MED: [180, 174], MEI: [180, 174], LD: [178, 172], LE: [178, 172], ED: [178, 172], EE: [178, 172] };
  const altCor = r => { const a = r[K.alt], f = ALTF[r[K.pos]]; return !a || !f ? '' : a >= f[0] ? 'v' : a >= f[1] ? 'a' : 'r'; };
  const tecCor = r => { if (!r[K.com]) return ''; const p = r[K.verde] / r[K.com]; return p >= 0.6 ? 'v' : p >= 0.35 ? 'a' : 'r'; };
  const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const ma = s => s && s.length >= 7 ? MES[+s.slice(5, 7) - 1] + '/' + s.slice(0, 4) : '—';
  const br = s => s && s.length >= 10 ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : '';

  const F0 = { pos: '', busca: '', liga: '', letra: '', tec: '', imin: '', imax: '', ct: '', m26: '', t2: '' };
  let E = { lista: 'serieb', f: Object.assign({}, F0), ord: null, dir: 1 };
  try { const g = JSON.parse(localStorage.getItem(LS) || 'null'); if (g) { E = Object.assign(E, g); E.f = Object.assign({}, F0, g.f || {}); } } catch (e) {}
  const grava = () => { try { localStorage.setItem(LS, JSON.stringify(E)); } catch (e) {} };

  /* letra pela regra atual do app (A+ também no médio e no meia) — só onde a lista tem A em MED/MEI, guardado por jogador */
  const LETRA = new Map();
  function letraDe(r) {
    const L = r[K.letra] || '';
    if (L !== 'A' || !['MED', 'MEI'].includes(r[K.pos]) || typeof BASE === 'undefined' || !BASE.length || typeof tipoMais !== 'function') return L;
    const k = r[K.n] + '|' + r[K.t];
    if (LETRA.has(k)) return LETRA.get(k);
    let out = L;
    try {
      const b = BASE.find(x => x && x.n === r[K.n] && x.t === r[K.t]);
      if (b) { let o = b; try { const od = objDoRaio(primaryKey(b), null, b); if (od && od.obj) o = od.obj; } catch (e) {} let js = o; try { js = comPosCampo(o) || o; } catch (e) {} if (tipoMais(js)) out = 'A+'; }
    } catch (e) {}
    LETRA.set(k, out); return out;
  }

  const COLS = [
    ['#', 'idx', 'n'], ['Jogador', 'n', 's'], ['Clube · liga · valor', 't', 's'], ['Pos.', 'pos', 's'], ['Idade · nasc.', 'idade', 'n'], ['Alt.', 'alt', 'n'],
    ['Contrato', 'ct', 's'], ['Físico', 'letra', 'L'], ['Técnico', 'tecp', 'n'], ['2º tempo', 't2', 'n'], ['Minut. 3a', 'min', 'n'], ['Min. 2026 (todas)', 'm26', 'n'],
    ['PSV-99', 'psv', 'n'], ['Sprints /90', 'spr_n', 'n'], ['Dist. /90', 'dist', 'n'], ['BP cobr. · gols', 'cob', 'n']];
  const valor = (r, c, i) => c === 'idx' ? i : c === 'tecp' ? (r[K.com] ? r[K.verde] / r[K.com] : null) : c === 'letra' ? LORD[letraDe(r)] : c === 't2' ? (r[K.t2] >= 0 ? r[K.t2] : null) : r[K[c]];

  function filtra(L) {
    const f = E.f, q = f.busca.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return L.rows.map((r, i) => [r, i + 1]).filter(([r]) => {
      if (f.pos && r[K.pos] !== f.pos) return false;
      if (f.liga && r[K.l] !== f.liga) return false;
      if (f.letra) { const l = letraDe(r) || '-'; if (f.letra === 'AA' ? !(l === 'A+' || l === 'A') : l !== f.letra) return false; }
      if (f.tec) { const c = tecCor(r); if (f.tec === 'v' ? c !== 'v' : f.tec === 'va' ? !(c === 'v' || c === 'a') : false) return false; }
      if (f.t2 !== '' && f.t2 != null) { const t = r[K.t2]; if (f.t2 === 'ev' ? !(t === 0 || t === 1) : String(t) !== f.t2) return false; }
      if (f.imin !== '' && !(r[K.idade] >= +f.imin)) return false;
      if (f.imax !== '' && !(r[K.idade] <= +f.imax)) return false;
      if (f.ct) { const c = r[K.ct] || ''; if (!c || c > (f.ct === '26' ? '2026-12-31' : '2027-12-31')) return false; }
      if (f.m26 !== '' && !((r[K.m26] || 0) >= +f.m26)) return false;
      if (q) { const s = (r[K.n] + ' ' + r[K.t] + ' ' + (r[K.nac] || '')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); if (!s.includes(q)) return false; }
      return true;
    });
  }

  function linha([r, i]) {
    const ct = r[K.ct] || '', cc = ct && ct <= '2026-12-31' ? 'ct-l' : ct.slice(0, 4) === '2027' ? 'ct-27' : '';
    const L = letraDe(r), lc = { 'A+': 'ap', A: 'a', B: 'b', C: 'c' }[L];
    const t2 = r[K.t2] != null && r[K.t2] >= 0 ? '<span class="t2 ' + T2C[r[K.t2]] + '">' + T2N[r[K.t2]] + '</span>' : '—';
    const mi = r[K.min] == null ? '—' : '<b class="m' + (r[K.min] >= 60 ? 'v' : r[K.min] >= 30 ? 'a' : 'r') + '">' + r[K.min] + '%</b>';
    const mv = r[K.mv] ? ' · € ' + num(r[K.mv] / 1e6, 1) + ' mi' : '';
    const bp = r[K.cob] == null ? '—' : r[K.cob] + ' · ' + (r[K.gbp] || 0);
    const ac = altCor(r);
    return '<tr><td class="c">' + i + '</td><td><a class="lc-nome" data-n="' + esc(r[K.n]) + '" data-t="' + esc(r[K.t]) + '"><b>' + esc(r[K.n]) + '</b></a></td>' +
      '<td>' + esc(r[K.t]) + '<small>' + esc(r[K.l] || '') + mv + '</small></td><td class="c">' + (POSN[r[K.pos]] || r[K.pos]) + '</td>' +
      '<td class="c">' + (r[K.idade] || '—') + '<small>' + br(r[K.nasc]) + '</small></td><td class="c' + (ac ? ' al-' + ac : '') + '">' + (r[K.alt] || '—') + '</td>' +
      '<td class="c ' + cc + '">' + ma(ct) + '</td><td class="c">' + (L ? '<span class="lt ' + lc + '">' + L + '</span>' : '—') + '</td>' +
      '<td class="c">' + (r[K.com] ? '<span class="st ' + tecCor(r) + '">' + r[K.verde] + '/' + r[K.com] + '</span>' : '—') + '</td><td class="c">' + t2 + '</td>' +
      '<td class="c">' + mi + '</td><td class="c">' + num(r[K.m26], 0) + '</td><td class="c">' + num(r[K.psv], 1) + '</td><td class="c">' + num(r[K.spr_n], 1) + '</td>' +
      '<td class="c">' + num(r[K.dist], 0) + '</td><td class="c">' + bp + '</td></tr>';
  }

  function render() {
    const el = document.getElementById('lcCorpo'); if (!el) return;
    const L = D.listas.find(x => x.id === E.lista) || D.listas[0];
    const ligas = [...new Set(L.rows.map(r => r[K.l]).filter(Boolean))].sort();
    if (E.f.liga && !ligas.includes(E.f.liga)) E.f.liga = '';
    let rs = filtra(L);
    if (E.ord) { const c = E.ord; rs = rs.slice().sort((a, b) => { const x = valor(a[0], c, a[1]), y = valor(b[0], c, b[1]); if (x == null && y == null) return a[1] - b[1]; if (x == null) return 1; if (y == null) return -1; return (x < y ? -1 : x > y ? 1 : a[1] - b[1]) * E.dir; }); }
    const f = E.f, sel = (id, ops, v) => '<select id="' + id + '">' + ops.map(([k, t]) => '<option value="' + esc(k) + '"' + (String(v) === String(k) ? ' selected' : '') + '>' + esc(t) + '</option>').join('') + '</select>';
    const contaPos = p => L.rows.filter(r => r[K.pos] === p).length;
    let h = '<div class="lc-topo"><h2>Listas completas por campeonato</h2><p>Os mesmos jogadores, a mesma ordem e as mesmas cores dos PDFs: só quem tem <b>todos</b> os indicadores da posição apurados' +
      (L.semfis ? ' (nas segundas divisões o físico não é exigido — o SkillCorner quase não cobre essas ligas)' : ' (letra física + todos os fundamentais técnicos)') + ' e <b>600+ minutos em 2026</b>. ' +
      'Ordem: físico → técnico → altura → 2º tempo → contrato que vence antes. Clique no título da coluna para ordenar por ela (de novo inverte); clique no nome para abrir a ficha. Dados de ' + esc(D.gerado) + '.</p></div>' +
      '<div class="lc-chips">' + D.listas.map(x => '<button type="button" class="lc-chip' + (x.id === L.id ? ' on' : '') + '" data-l="' + x.id + '">' + esc(x.nome) + ' <b>' + x.rows.length.toLocaleString('pt-BR') + '</b></button>').join('') + '</div>' +
      '<div class="lc-chips lc-pos"><button type="button" class="lc-chip' + (!f.pos ? ' on' : '') + '" data-p="">Todas as posições</button>' +
      POSL.map(([p, t]) => '<button type="button" class="lc-chip' + (f.pos === p ? ' on' : '') + '" data-p="' + p + '">' + t + ' <b>' + contaPos(p) + '</b></button>').join('') + '</div>' +
      '<div class="lc-ctrl"><input id="lcBusca" type="search" placeholder="buscar jogador, clube ou nacionalidade" value="' + esc(f.busca) + '">' +
      (ligas.length > 1 ? '<label>Liga ' + sel('lcLiga', [['', 'todas']].concat(ligas.map(x => [x, x])), f.liga) + '</label>' : '') +
      '<label>Físico ' + sel('lcLetra', [['', 'todos'], ['A+', 'A+'], ['AA', 'A+ e A'], ['A', 'A'], ['B', 'B'], ['C', 'C'], ['-', 'sem letra']], f.letra) + '</label>' +
      '<label>Técnico ' + sel('lcTec', [['', 'todos'], ['v', 'verde (60%+)'], ['va', 'verde ou amarelo (35%+)']], f.tec) + '</label>' +
      '<label>2º tempo ' + sel('lcT2', [['', 'todos'], ['ev', 'Elite ou Mantém'], ['0', 'Elite'], ['1', 'Mantém'], ['2', 'Cai um pouco'], ['3', 'Cai muito']], f.t2) + '</label>' +
      '<label>Idade <input id="lcImin" class="lc-num" type="number" placeholder="de" value="' + esc(f.imin) + '"> a <input id="lcImax" class="lc-num" type="number" placeholder="até" value="' + esc(f.imax) + '"></label>' +
      '<label>Contrato ' + sel('lcCt', [['', 'todos'], ['26', 'termina até dez/2026'], ['27', 'termina até dez/2027']], f.ct) + '</label>' +
      '<label>Min. 2026 ≥ <input id="lcM26" class="lc-num" type="number" step="100" placeholder="600" value="' + esc(f.m26) + '"></label>' +
      '<button type="button" class="lc-limpa" id="lcLimpa">limpar filtros</button><span class="lc-n"><b>' + rs.length.toLocaleString('pt-BR') + '</b> de ' + L.rows.length.toLocaleString('pt-BR') + ' jogadores</span></div>' +
      '<div class="lc-tab-wrap"><table class="lc-tab"><thead><tr>' + COLS.map(([t, c]) => '<th data-c="' + c + '" class="' + (c === 'n' || c === 't' ? 'l' : '') + (E.ord === c ? ' ord' : '') + '">' + t + (E.ord === c ? (E.dir > 0 ? ' ▲' : ' ▼') : '') + '</th>').join('') + '</tr></thead><tbody>' +
      (rs.length ? rs.map(linha).join('') : '<tr><td colspan="' + COLS.length + '" class="lc-vazio">nenhum jogador com esses filtros</td></tr>') + '</tbody></table></div>' +
      '<div class="lc-leg"><b>Físico</b>: <span class="lt ap">A+</span> explosivo + volume <span class="lt a">A</span> explosivo <span class="lt b">B</span> volume/intermediário <span class="lt c">C</span> baixa intensidade · ' +
      '<b>Técnico</b>: fundamentais no nível de quem sobe — <span class="st v">60%+</span> <span class="st a">35–59%</span> <span class="st r">&lt;35%</span> · <b>2º tempo</b>: mantém o físico do 1º tempo · ' +
      '<b>Altura</b>: verde alto / amarelo médio / vermelho baixo para a posição · <b>Contrato</b>: <span class="ct-l">até dez/2026</span> <span class="ct-27">2027</span> · Minut. 3a = % dos minutos do time em 2024–2026 · BP = cobranças · gols de bola parada (3 anos).</div>';
    el.innerHTML = h;
  }

  function abrir(n, t) {
    if (typeof BASE === 'undefined' || typeof abrirFicha !== 'function') return;
    const b = BASE.find(x => x && x.n === n && x.t === t) || BASE.find(x => x && x.n === n);
    if (!b) { try { toast('Não achei esse jogador na base atual', 'ruim'); } catch (e) {} return; }
    try { if (typeof irParaAba === 'function') irParaAba('campo'); } catch (e) {}
    setTimeout(() => { try { abrirFicha(b.id != null ? b.id : b); } catch (e) {} }, 60);   /* a ficha acha o jogador pelo id da base */
  }

  function eventos(el) {
    let tm = null;
    el.addEventListener('click', ev => {
      const c = ev.target.closest('.lc-chip[data-l]'); if (c) { E.lista = c.dataset.l; E.f.liga = ''; grava(); render(); return; }
      const p = ev.target.closest('.lc-chip[data-p]'); if (p) { E.f.pos = p.dataset.p; grava(); render(); return; }
      const th = ev.target.closest('th[data-c]'); if (th) { const k = th.dataset.c; if (E.ord === k) { if (E.dir > 0) E.dir = -1; else { E.ord = null; E.dir = 1; } } else { E.ord = k; E.dir = ['n', 't', 'pos', 'ct', 'idx', 'letra', 't2', 'idade'].includes(k) ? 1 : -1; } grava(); render(); return; }
      if (ev.target.closest('#lcLimpa')) { E.f = Object.assign({}, F0); E.ord = null; E.dir = 1; grava(); render(); return; }
      const a = ev.target.closest('.lc-nome'); if (a) abrir(a.dataset.n, a.dataset.t);
    });
    const ler = () => {
      const v = id => { const x = document.getElementById(id); return x ? x.value : ''; };
      E.f.busca = v('lcBusca'); E.f.liga = v('lcLiga'); E.f.letra = v('lcLetra'); E.f.tec = v('lcTec'); E.f.t2 = v('lcT2');
      E.f.imin = v('lcImin'); E.f.imax = v('lcImax'); E.f.ct = v('lcCt'); E.f.m26 = v('lcM26');
    };
    el.addEventListener('change', ev => { if (ev.target.closest('.lc-ctrl')) { ler(); grava(); render(); } });
    el.addEventListener('input', ev => {
      if (ev.target.id !== 'lcBusca') return;
      clearTimeout(tm); tm = setTimeout(() => { ler(); grava(); const pos = ev.target.selectionStart; render(); const b = document.getElementById('lcBusca'); if (b) { b.focus(); try { b.setSelectionRange(pos, pos); } catch (e) {} } }, 250);
    });
  }

  function ligar() {
    const bt = document.querySelector('.aba[data-aba="listascamp"]'), pg = document.getElementById('pgListasCamp'), el = document.getElementById('lcCorpo');
    if (!bt || !pg || !el) return;
    eventos(el);
    let feito = false;
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on && !feito) { feito = true; render(); } };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('subida-kpis', () => { LETRA.clear(); if (bt.classList.contains('on')) render(); });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
