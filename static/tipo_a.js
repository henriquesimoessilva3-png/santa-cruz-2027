/* Aba "Físico A" — todos os jogadores com letra A (o tipo físico mais forte da posição, pela regra do clube), por posição, em quatro
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
  const GRUPOS = [['b', 'Série B'], ['sa', 'Ligas sul-americanas'], ['ext', 'Sul-americanos no exterior']];
  const PAIS_SA = ['Brazil', 'Argentina', 'Uruguay', 'Colombia', 'Paraguay', 'Chile', 'Ecuador', 'Peru', 'Bolivia', 'Venezuela'];
  const SIGLA = { Brazil: 'BRA', Argentina: 'ARG', Uruguay: 'URU', Colombia: 'COL', Paraguay: 'PAR', Chile: 'CHI', Ecuador: 'EQU', Peru: 'PER', Bolivia: 'BOL', Venezuela: 'VEN' };
  const LS = 'sc2027_tipoa';
  let E = { pos: '', livres: false, ord: 'psv' };
  try { Object.assign(E, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) {}
  let cache = null;

  const ok = () => typeof BASE !== 'undefined' && BASE.length && typeof tipoLetra === 'function' && window.CONSULTA;
  const sulAmericano = j => PAIS_SA.includes(j.nac) || PAIS_SA.some(p => String(j.psp || '').includes(p));
  function grupo(j) {
    if (j.l === 'Brasil B') return 'b';
    if (SA.includes(j.l)) return 'sa';
    if (sulAmericano(j) && !/^Brasil/.test(j.l || '') && j.l !== 'Manual') return 'ext';
    return null;
  }
  function calcula() {
    const out = {}; POS.forEach(p => { out[p[0]] = { A: { b: [], sa: [], ext: [] }, B: { b: [], sa: [], ext: [] } }; });
    BASE.forEach(b => {
      if (!out[b.p]) return;
      const g = grupo(b); if (!g) return;
      let j = b; try { if (typeof comFisicoDoEstudo === 'function') j = comFisicoDoEstudo(b) || b; } catch (e) {}
      let letra = null, tipo = null;
      try { letra = tipoLetra(j); if (letra === 'A' || letra === 'B') { const x = tipoResolvido(j); tipo = x && x.tipo; } } catch (e) {}
      if (letra !== 'A' && letra !== 'B') return;
      try { const r = typeof csRegistro === 'function' ? csRegistro(b) : null; if (r && r.vet) return; } catch (e) {}
      out[b.p][letra][g].push({ j, b, tipo });
    });
    return out;
  }
  const ct = j => j.ct ? j.ct.slice(5, 7) + '/' + j.ct.slice(2, 4) : '—';
  const livre = j => j.ct && j.ct.slice(0, 7) <= '2027-01';
  const ordena = linhas => { const k = E.ord; return linhas.slice().sort((a, b) => k === 'nome' ? String(a.j.n).localeCompare(b.j.n) : k === 'idade' ? (a.j.id_ || 99) - (b.j.id_ || 99) : (b.j[k] || 0) - (a.j[k] || 0)); };
  const filtra = linhas => E.livres ? linhas.filter(x => livre(x.j)) : linhas;
  /* tabela compacta de uma letra num grupo: cabe ao lado da outra letra */
  function tabela(letra, linhas, g) {
    linhas = ordena(filtra(linhas));
    let h = '<div class="ta-lado ta-' + letra + '"><h5><i>' + letra + '</i> <b>' + linhas.length + '</b></h5>';
    if (!linhas.length) return h + '<p class="ta-vazio">ninguém</p></div>';
    h += '<table class="ta-tab"><thead><tr><th>#</th><th>Jogador</th><th>Clube' + (g === 'b' ? '' : ' · liga') + '</th><th class="n">Id.</th><th class="n">Contr.</th><th class="n">Valor</th>' +
      '<th class="n" title="PSV-99 (km/h)">PSV</th><th class="n" title="Sprints por 90">Spr</th><th class="n" title="Arrancadas explosivas por 90">Arr</th><th class="n" title="Ações de alta intensidade por 90">AI</th><th title="Selo de subida">Sub</th></tr></thead><tbody>';
    linhas.forEach((x, i) => {
      const j = x.j; let selo = ''; try { selo = window.subidaSelo ? window.subidaSelo(j) : ''; } catch (e) {}
      const nac = g !== 'b' && j.nac ? ' <small>' + esc(SIGLA[j.nac] || (PAIS_SA.find(p => String(j.psp || '').includes(p)) ? SIGLA[PAIS_SA.find(p => String(j.psp || '').includes(p))] : '')) + '</small>' : '';
      h += '<tr><td class="n i">' + (i + 1) + '</td><td class="nm">' + esc(j.n) + nac + '</td><td class="cl">' + esc(j.t) + (g === 'b' ? '' : ' <em>· ' + esc(j.l) + '</em>') + '</td>' +
        '<td class="n">' + (j.id_ || '—') + '</td><td class="n' + (livre(j) ? ' lv' : '') + '">' + ct(j) + '</td><td class="n">' + (j.mv ? (j.mv >= 1e6 ? num(j.mv / 1e6, 1) + ' mi' : num(j.mv / 1e3, 0) + ' mil') : '—') + '</td>' +
        '<td class="n f">' + num(j.psv, 1) + '</td><td class="n f">' + num(j.spr_n, 1) + '</td><td class="n f">' + num(j.expl, 2) + '</td><td class="n f">' + num(j.hi_n, 0) + '</td><td>' + selo + '</td></tr>';
    });
    return h + '</tbody></table></div>';
  }
  function render() {
    const R = document.getElementById('taCorpo'); if (!R) return;
    if (!ok()) { R.innerHTML = '<p class="ta-vazio">carregando a base…</p>'; setTimeout(render, 800); return; }
    if (!cache || cache.n !== BASE.length) cache = { n: BASE.length, d: calcula() };
    const D = cache.d, C = window.CONSULTA, pref = C.pref || {};
    const meio = p => { const doSetor = Object.keys(((C.cen || {})[typeof TIPO_SET !== 'undefined' ? TIPO_SET[p] : ''] || {}).tipos || {}); return doSetor.filter(tp => !(pref[p] || []).includes(tp) && !((C.cai || {})[p] || []).includes(tp)); };
    const conta = (p, L) => GRUPOS.reduce((s, g) => s + filtra(D[p][L][g[0]]).length, 0);
    const lista = POS.filter(p => !E.pos || p[0] === E.pos);
    let h = '<div class="ta-topo"><h2>Jogadores A e B por posição — tipo físico</h2>' +
      '<p>Letra pela regra do clube: <b>A</b> = o tipo mais forte fisicamente da posição (explosivo e rápido; no volante, mais intenso) · <b>B</b> = o tipo do meio (motor de volume, médio em tudo ou intermediário). O C (baixa intensidade) fica de fora. ' +
      'Só a parte física (SkillCorner, 5 jogos rastreados ou mais). Três grupos por posição: Série B, ligas sul-americanas e sul-americanos (com brasileiros) jogando fora da América do Sul. Vetados ficam de fora.</p></div>' +
      '<div class="ta-ctrl"><div class="ta-chips"><button class="ta-chip' + (!E.pos ? ' on' : '') + '" data-pos="">Todas</button>' +
      POS.map(p => '<button class="ta-chip' + (E.pos === p[0] ? ' on' : '') + '" data-pos="' + p[0] + '">' + esc(p[1]) + ' <b>' + conta(p[0], 'A') + '</b>+' + conta(p[0], 'B') + '</button>').join('') + '</div>' +
      '<label class="ta-chk"><input type="checkbox" id="taLivres"' + (E.livres ? ' checked' : '') + '> só contrato até dez/2026</label>' +
      '<label class="ta-chk">ordenar por <select id="taOrd">' + [['psv', 'PSV-99'], ['spr_n', 'Sprints/90'], ['expl', 'Arrancadas explosivas'], ['hi_n', 'Alta intensidade'], ['idade', 'Idade'], ['nome', 'Nome']].map(o => '<option value="' + o[0] + '"' + (E.ord === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>' +
      '<button class="ta-bt" id="taPdf">Gerar PDF</button></div>';
    lista.forEach(p => {
      const tA = pref[p[0]] || [], tB = meio(p[0]);
      h += '<section class="ta-pos" data-p="' + p[0] + '"><h3>' + esc(p[1]) + ' <span><i class="la">A</i> ' + esc(tA.join(' / ')) + ' <b>' + conta(p[0], 'A') + '</b> &nbsp; <i class="lb">B</i> ' + esc(tB.join(' / ')) + ' <b>' + conta(p[0], 'B') + '</b></span></h3>';
      GRUPOS.forEach(g => { h += '<div class="ta-grupo"><h4>' + esc(g[1]) + '</h4><div class="ta-par">' + tabela('A', D[p[0]].A[g[0]], g[0]) + tabela('B', D[p[0]].B[g[0]], g[0]) + '</div></div>'; });
      h += '</section>';
    });
    h += '<div class="ta-nota">A letra é a mesma dos cards do campograma (regra do clube de 06/10/2026 sobre os tipos físicos do Estudo V2). PSV = velocidade máxima (km/h) · Spr = sprints por 90 · Arr = arrancadas explosivas por 90 · AI = ações de alta intensidade por 90. ' +
      'Sub: ▲ atende 60% ou mais dos indicadores fundamentais da posição · ↔ 35% a 60% · ▼ menos de 35% · ? falta dado técnico. Contrato em verde = vence até jan/2027. As segundas divisões de Argentina, Colômbia e Equador não têm dado físico.</div>';
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
    window.addEventListener('subida-kpis', () => { if (bt.classList.contains('on')) render(); });
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
