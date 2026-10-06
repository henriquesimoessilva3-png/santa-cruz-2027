/* Aba "Físico A" — todos os jogadores com letra A (o tipo físico de quem SOBE na posição), por posição, em quatro
   tabelas: Série B, Série A, campeonatos sul-americanos e brasileiros no exterior. Mesma régua da letra dos cards
   (tipoLetra do app.js: tipo do estudo, ou calculado pelo centróide do setor com 5 jogos rastreados ou mais).
   Sai em PDF pelo botão "Gerar PDF" (impressão do navegador). Arquivo próprio; observa o botão da aba. */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (x, d) => x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const POS = [['LD', 'Lateral direito'], ['ZD', 'Zagueiro direito'], ['ZE', 'Zagueiro esquerdo'], ['LE', 'Lateral esquerdo'], ['VOL', 'Volante'],
    ['MED', 'Médio'], ['MEI', 'Meia'], ['ED', 'Extremo direito'], ['EE', 'Extremo esquerdo'], ['CA', 'Centroavante']];
  const SA = ['Argentina A', 'Argentina B', 'Colombia A', 'Colombia B', 'Equador A', 'Equador B', 'Paraguai', 'Uruguai', 'Chile', 'Peru', 'Bolivia', 'Venezuela'];
  const GRUPOS = [['b', 'Série B'], ['sa', 'Campeonatos sul-americanos'], ['ext', 'Brasileiros no exterior'], ['a', 'Série A']];
  const LS = 'sc2027_tipoa';
  let E = { pos: '', livres: false, ord: 'psv' };
  try { Object.assign(E, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) {}
  let cache = null;

  const ok = () => typeof BASE !== 'undefined' && BASE.length && typeof tipoLetra === 'function' && window.CONSULTA;
  const brasileiro = j => j.nac === 'Brazil' || /Brazil/.test(j.psp || '');
  function grupo(j) {
    if (j.l === 'Brasil B') return 'b';
    if (j.l === 'Brasil A') return 'a';
    if (SA.includes(j.l)) return 'sa';
    if (brasileiro(j) && !/^Brasil/.test(j.l || '') && j.l !== 'Manual') return 'ext';
    return null;
  }
  function calcula() {
    const out = {}; POS.forEach(p => { out[p[0]] = { b: [], sa: [], ext: [], a: [] }; });
    BASE.forEach(b => {
      if (!out[b.p]) return;
      const g = grupo(b); if (!g) return;
      let j = b; try { if (typeof comFisicoDoEstudo === 'function') j = comFisicoDoEstudo(b) || b; } catch (e) {}
      let letra = null, tipo = null;
      try { letra = tipoLetra(j); if (letra === 'A') { const x = tipoResolvido(j); tipo = x && x.tipo; } } catch (e) {}
      if (letra !== 'A') return;
      try { const r = typeof csRegistro === 'function' ? csRegistro(b) : null; if (r && r.vet) return; } catch (e) {}
      out[b.p][g].push({ j, b, tipo });
    });
    return out;
  }
  const ct = j => j.ct ? j.ct.slice(5, 7) + '/' + j.ct.slice(2, 4) : '—';
  const livre = j => j.ct && j.ct.slice(0, 7) <= '2027-01';
  function tabela(tit, linhas) {
    if (E.livres) linhas = linhas.filter(x => livre(x.j));
    const k = E.ord;
    linhas = linhas.slice().sort((a, b) => k === 'nome' ? String(a.j.n).localeCompare(b.j.n) : k === 'idade' ? (a.j.id_ || 99) - (b.j.id_ || 99) : (b.j[k] || 0) - (a.j[k] || 0));
    let h = '<div class="ta-grupo"><h4>' + esc(tit) + ' <b>' + linhas.length + '</b></h4>';
    if (!linhas.length) return h + '<p class="ta-vazio">nenhum jogador A' + (E.livres ? ' livre para 2027' : '') + '</p></div>';
    h += '<table class="ta-tab"><thead><tr><th>#</th><th>Jogador</th><th>Clube</th><th>Liga</th><th class="n">Idade</th><th class="n">Contrato</th><th class="n">Valor (€)</th><th class="n">Min</th>' +
      '<th>Tipo físico</th><th class="n">PSV-99</th><th class="n">Sprints/90</th><th class="n">Arranc. expl.</th><th class="n">Alta int./90</th><th class="n">Dist./90</th><th class="n">Jogos</th><th>Subida</th></tr></thead><tbody>';
    linhas.forEach((x, i) => {
      const j = x.j; let selo = ''; try { selo = window.subidaSelo ? window.subidaSelo(j) : ''; } catch (e) {}
      h += '<tr><td class="n i">' + (i + 1) + '</td><td class="nm">' + esc(j.n) + (j.l !== 'Brasil A' && j.l !== 'Brasil B' && j.nac && j.nac !== 'Brazil' ? ' <small>' + esc(j.nac) + '</small>' : '') + '</td><td>' + esc(j.t) + '</td><td>' + esc(j.l) + '</td>' +
        '<td class="n">' + (j.id_ || '—') + '</td><td class="n' + (livre(j) ? ' lv' : '') + '">' + ct(j) + '</td><td class="n">' + (j.mv ? (j.mv >= 1e6 ? num(j.mv / 1e6, 1) + ' mi' : num(j.mv / 1e3, 0) + ' mil') : '—') + '</td><td class="n">' + (j.min || '—') + '</td>' +
        '<td>' + esc(x.tipo || '') + (j._estudo || j.fis_src ? ' <small title="físico de outra temporada (estudo)">*</small>' : '') + '</td><td class="n f">' + num(j.psv, 1) + '</td><td class="n f">' + num(j.spr_n, 1) + '</td><td class="n f">' + num(j.expl, 2) +
        '</td><td class="n f">' + num(j.hi_n, 0) + '</td><td class="n">' + num(j.dist, 0) + '</td><td class="n">' + (j.sc_n || '—') + '</td><td>' + selo + '</td></tr>';
    });
    return h + '</tbody></table></div>';
  }
  function render() {
    const R = document.getElementById('taCorpo'); if (!R) return;
    if (!ok()) { R.innerHTML = '<p class="ta-vazio">carregando a base…</p>'; setTimeout(render, 800); return; }
    if (!cache || cache.n !== BASE.length) cache = { n: BASE.length, d: calcula() };
    const D = cache.d, C = window.CONSULTA, pref = C.pref || {};
    const conta = p => GRUPOS.reduce((s, g) => s + (E.livres ? D[p][g[0]].filter(x => livre(x.j)).length : D[p][g[0]].length), 0);
    const lista = POS.filter(p => !E.pos || p[0] === E.pos);
    let h = '<div class="ta-topo"><h2>Jogadores A — o tipo físico de quem sobe</h2>' +
      '<p>Todos os jogadores da base com letra <b>A</b>: o tipo físico deles é o que os times que subiram na Série B 2022–2025 usam naquela posição. Só a parte física (SkillCorner, 5 jogos rastreados ou mais). ' +
      'Quatro tabelas por posição: Série B, campeonatos sul-americanos, brasileiros no exterior e Série A. Vetados ficam de fora.</p></div>' +
      '<div class="ta-ctrl"><div class="ta-chips"><button class="ta-chip' + (!E.pos ? ' on' : '') + '" data-pos="">Todas</button>' +
      POS.map(p => '<button class="ta-chip' + (E.pos === p[0] ? ' on' : '') + '" data-pos="' + p[0] + '">' + esc(p[1]) + ' <b>' + conta(p[0]) + '</b></button>').join('') + '</div>' +
      '<label class="ta-chk"><input type="checkbox" id="taLivres"' + (E.livres ? ' checked' : '') + '> só contrato até dez/2026</label>' +
      '<label class="ta-chk">ordenar por <select id="taOrd">' + [['psv', 'PSV-99'], ['spr_n', 'Sprints/90'], ['expl', 'Arrancadas explosivas'], ['hi_n', 'Alta intensidade'], ['idade', 'Idade'], ['nome', 'Nome']].map(o => '<option value="' + o[0] + '"' + (E.ord === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>' +
      '<button class="ta-bt" id="taPdf">Gerar PDF</button></div>';
    lista.forEach(p => {
      const tipos = pref[p[0]] || [];
      h += '<section class="ta-pos"><h3>' + esc(p[1]) + ' <span>' + (tipos.length ? 'A = ' + esc(tipos.join(' / ')) : 'sem tipo A') + '</span> <b>' + conta(p[0]) + '</b></h3>';
      if (!tipos.length) h += '<p class="ta-vazio">Nesta posição o tipo físico não separa quem sobe de quem cai: ninguém é A (todos ficam em B).</p>';
      else h += GRUPOS.map(g => tabela(g[1], D[p[0]][g[0]])).join('');
      h += '</section>';
    });
    h += '<div class="ta-nota">A letra é a mesma dos cards do campograma (Estudo V2, F2-4). * = físico de outra temporada, vindo da base do estudo. Brasileiros no exterior = fora do Brasil e fora dos campeonatos sul-americanos (quem joga na América do Sul está na tabela sul-americana). ' +
      'Coluna Subida: ▲ atende 60% ou mais dos indicadores principais da posição · ↔ 35% a 60% · ▼ menos de 35% · ? falta dado técnico. Contrato em verde = vence até jan/2027.</div>';
    R.innerHTML = h;
    try { localStorage.setItem(LS, JSON.stringify(E)); } catch (e) {}
  }
  function ligar() {
    const bt = document.querySelector('.aba[data-aba="tipoa"]'), pg = document.getElementById('pgTipoA'), R = document.getElementById('taCorpo');
    if (!bt || !pg || !R) return;
    R.addEventListener('click', ev => {
      const c = ev.target.closest('[data-pos]'); if (c) { E.pos = c.dataset.pos; return render(); }
      if (ev.target.id === 'taPdf') { document.body.classList.add('imp-tipoa'); const fim = () => { document.body.classList.remove('imp-tipoa'); window.removeEventListener('afterprint', fim); }; window.addEventListener('afterprint', fim); window.print(); }
    });
    R.addEventListener('change', ev => { if (ev.target.id === 'taLivres') { E.livres = ev.target.checked; render(); } else if (ev.target.id === 'taOrd') { E.ord = ev.target.value; render(); } });
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on) render(); };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
