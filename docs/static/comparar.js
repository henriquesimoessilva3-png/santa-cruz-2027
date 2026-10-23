/* 23/10/2026 — "comparar com jogador" na ficha (pedido do Henrique: um lugar para comparar jogadores, ao lado do botão
   "comparar com a liga dele"). Escolhe outro jogador da base pela busca e a ficha vira um lado a lado: cabeçalho dos dois
   (foto, clube, idade com nascimento, contrato), letra física, seta técnica, farol e minutagem; depois o físico (os grupos da
   ficha) e o técnico (os indicadores do ranking da posição), cada linha com os dois valores, a média da coorte da ficha e
   quem leva. Só usa as funções do app.js (montarFicha, kpisDe, FIS_GRUPOS, subidaSelo, minutagemDe…), na hora do clique. */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const semAc = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const fmt = v => v == null || !isFinite(v) ? '—' : Number(v).toLocaleString('pt-BR', { maximumFractionDigits: Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2, minimumFractionDigits: Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2 });
  let CMP = null;   /* { a: pk da ficha, b: registro da BASE } */
  const pkDe = j => (typeof primaryKey === 'function' && j ? primaryKey(j) : null);
  const ativo = () => !!(CMP && typeof fichaAtual !== 'undefined' && fichaAtual && pkDe(fichaAtual) === CMP.a);

  /* ---------- botão + busca ---------- */
  function botao() {
    const ref = document.getElementById('fiComp') || document.getElementById('fiDados') || document.getElementById('fiBase');
    if (!ref || typeof fichaAtual === 'undefined' || !fichaAtual) return;
    let w = document.getElementById('fiCmpBox');
    if (!w) {
      w = document.createElement('span'); w.id = 'fiCmpBox'; w.className = 'fi-cmp-box';
      w.innerHTML = '<button type="button" class="bt mini" id="fiCmpBt"></button>' +
        '<span class="fi-cmp-busca oculta"><input type="search" id="fiCmpQ" placeholder="nome ou clube do outro jogador" autocomplete="off"><span class="fi-cmp-res" id="fiCmpRes"></span></span>';
      ref.insertAdjacentElement('afterend', w);
      w.querySelector('#fiCmpBt').onclick = () => {
        if (ativo()) { CMP = null; botao(); window.renderFicha(); return; }
        const b = w.querySelector('.fi-cmp-busca'); b.classList.toggle('oculta');
        if (!b.classList.contains('oculta')) { const q = w.querySelector('#fiCmpQ'); q.value = ''; resultados(''); q.focus(); }
      };
      const q = w.querySelector('#fiCmpQ');
      q.oninput = () => { clearTimeout(q._t); q._t = setTimeout(() => resultados(q.value), 120); };
      q.onkeydown = e => { if (e.key === 'Escape') { w.querySelector('.fi-cmp-busca').classList.add('oculta'); } if (e.key === 'Enter') { const p = w.querySelector('.fi-cmp-op'); if (p) p.click(); } };
      w.querySelector('#fiCmpRes').addEventListener('click', e => {
        const op = e.target.closest('.fi-cmp-op'); if (!op) return;
        const b = (BASE || []).find(x => String(x.id) === op.dataset.id); if (!b) return;
        CMP = { a: pkDe(fichaAtual), b };
        w.querySelector('.fi-cmp-busca').classList.add('oculta');
        botao(); window.renderFicha();
      });
    }
    const bt = w.querySelector('#fiCmpBt');
    if (ativo()) { bt.textContent = '✕ sair da comparação (vs. ' + (CMP.b.n || '') + ')'; bt.classList.add('on'); bt.title = 'Voltar à ficha normal'; }
    else { bt.textContent = '⇆ comparar com jogador'; bt.classList.remove('on'); bt.title = 'Escolher outro jogador da base e ver os dois lado a lado (físico, técnico, letra, seta e minutagem)'; }
  }
  function resultados(txt) {
    const el = document.getElementById('fiCmpRes'); if (!el) return;
    const q = semAc(txt), a = fichaAtual;
    if (q.length < 2) { el.innerHTML = '<span class="fi-cmp-dica">digite 2 letras ou mais</span>'; return; }
    const pal = q.split(' ');
    const r = [];
    for (const b of BASE) {
      if (b === a) continue;
      const t = semAc((b.n || '') + ' ' + (b.nc || '') + ' ' + (b.t || ''));
      if (!pal.every(p => t.includes(p))) continue;
      r.push(b); if (r.length > 400) break;
    }
    /* mesma posição primeiro, depois quem tem mais minutos */
    r.sort((x, y) => ((x.p === a.p) ? 0 : 1) - ((y.p === a.p) ? 0 : 1) || (y.min || 0) - (x.min || 0));
    el.innerHTML = r.length ? r.slice(0, 12).map(b => '<button type="button" class="fi-cmp-op" data-id="' + esc(b.id) + '"><b>' + esc(b.n) + '</b> <span>' + esc(b.p) + ' · ' + esc(b.t) + ' · ' + esc(b.l) +
      (b.id_ ? ' · ' + b.id_ + ' anos' : '') + (b.min ? ' · ' + b.min + ' min' : '') + '</span></button>').join('') : '<span class="fi-cmp-dica">ninguém com esse nome</span>';
  }

  /* ---------- a comparação ---------- */
  function resumo(j0) {
    const o = {};
    try {
      const j = comFisicoDoEstudo(registroComDados(j0)) || j0;
      const L = window.JB ? JB.letra(j0) : null; o.letra = L ? L.l : null; o.tipo = L ? L.t : '';
      o.letraH = window.JB ? JB.letraHtml(j0) : '';
      o.setaH = window.subidaSelo ? window.subidaSelo(j) : '';
      const s = window.subidaSeloInfo ? window.subidaSeloInfo(j, null) : null; if (s) { o.v = s.verde != null ? s.verde : s.ok; o.com = s.com; }
      const mi = typeof minutagemDe === 'function' ? minutagemDe(j) : null; if (mi) { o.mp = Math.round(mi.pct * 100); o.mc = mi.c; o.mt = mi.txt; }
      const f = typeof farolDoJogador === 'function' ? farolDoJogador(j) : null; o.farolH = f ? f.htmlNome : '';
      const bp = typeof bolaParadaDe === 'function' ? bolaParadaDe(j) : null; if (bp) o.bp = bp.cob;
      o.j = j;
    } catch (e) {}
    return o;
  }
  function barra(v, mx, cls) { const w = v != null && mx ? Math.max(2, Math.min(100, 100 * Math.abs(v) / mx)) : 0; return '<span class="cmp-bar ' + cls + '"><i style="width:' + w.toFixed(0) + '%"></i></span>'; }
  function linha(rot, va, vb, med, menor, mx) {
    const tem = va != null && vb != null && isFinite(va) && isFinite(vb) && va !== vb;
    const ga = tem && (menor ? va < vb : va > vb), gb = tem && !ga;
    const m = mx || Math.max(Math.abs(va || 0), Math.abs(vb || 0), Math.abs(med || 0)) || 1;
    return { ga, gb, h: '<tr><td class="cmp-rot">' + esc(rot) + (menor ? ' <small title="menos é melhor">↓</small>' : '') + '</td>' +
      '<td class="cmp-v' + (ga ? ' ganha' : '') + '">' + fmt(va) + '</td><td class="cmp-b">' + barra(va, m, 'a') + barra(vb, m, 'b') + '</td>' +
      '<td class="cmp-v' + (gb ? ' ganha' : '') + '">' + fmt(vb) + '</td><td class="cmp-med">' + fmt(med) + '</td></tr>' };
  }
  function bloco(tit, linhas, na, nb) {
    let ga = 0, gb = 0, h = '';
    linhas.forEach(l => { if (l.ga) ga++; if (l.gb) gb++; h += l.h; });
    return '<section class="cmp-bloco"><h4>' + esc(tit) + ' <span class="cmp-placar"><b class="a">' + ga + '</b> × <b class="b">' + gb + '</b></span></h4>' +
      '<table class="cmp-tab"><thead><tr><th>Indicador</th><th class="a">' + esc(na) + '</th><th></th><th class="b">' + esc(nb) + '</th><th title="Média da coorte escolhida na ficha (posição do jogador da ficha)">média</th></tr></thead><tbody>' + h + '</tbody></table></section>';
  }
  async function render() {
    if (!ativo()) return;
    const A = fichaAtual, B = CMP.b;
    const corpo = document.getElementById('fiCorpo'); if (!corpo) return;
    const modo = (document.getElementById('fiBase') || {}).value || 'posliga';
    corpo.innerHTML = '<div class="fi-sem" style="padding:14px">comparando…</div>';
    const [fa, fb, ka, kb] = await Promise.all([montarFicha(A, modo), montarFicha(B, modo), kpisDe(comPosCampo(registroComDados(A)), modo), kpisDe(registroComDados(B), modo)]);
    if (!ativo()) return;
    const ra = resumo(A), rb = resumo(B), na = A.n, nb = B.n;
    const card = (f, r, cls) => '<div class="cmp-card ' + cls + '">' + (f.perfil || '<b>' + f.titulo + '</b>') + '<div class="cmp-sub">' + esc(f.sub || '') + '</div>' +
      '<div class="cmp-cab">' + (f.cabeca || '') + '</div>' +
      '<div class="cmp-sinais"><span>Físico ' + (r.letraH || '—') + (r.tipo ? ' <small>' + esc(r.tipo) + '</small>' : '') + '</span>' +
      '<span>Técnico ' + (r.setaH || '<i class="jb-vaz">?</i>') + (r.com ? ' <b>' + r.v + '</b>/' + r.com : '') + '</span>' +
      '<span class="ta-mp ' + (r.mc || '') + '" title="' + esc(r.mt || '') + '">Minutagem <b>' + (r.mp != null ? r.mp + '%' : '—') + '</b></span>' +
      (r.bp != null ? '<span title="Índice de cobrador na liga">Cobrador <b>' + r.bp + '</b></span>' : '') + (r.farolH ? '<span>' + r.farolH + '</span>' : '') + '</div></div>';
    let h = '<div class="cmp"><div class="cmp-topo">' + card(fa, ra, 'a') + '<div class="cmp-vs">×</div>' + card(fb, rb, 'b') + '</div>';
    /* físico: os grupos da ficha; média = a da Série B na posição do jogador da ficha quando houver base */
    const ja = ra.j || A, jb = rb.j || B;
    const medFis = {};
    try { const ps = (typeof FIS_GEMEAS !== 'undefined' && FIS_GEMEAS[A.p]) || [A.p]; const c = BASE.filter(x => x.l === 'Brasil B' && ps.includes(x.p) && typeof x.psv === 'number');
      if (c.length >= 10) FIS_GRUPOS.forEach(([, rows]) => rows.forEach(([k]) => { const v = c.map(x => x[k]).filter(v => typeof v === 'number' && isFinite(v)); if (v.length) medFis[k] = v.reduce((s, x) => s + x, 0) / v.length; })); } catch (e) {}
    const temFis = typeof ja.psv === 'number' || typeof jb.psv === 'number';
    if (temFis && typeof FIS_GRUPOS !== 'undefined') {
      h += '<div class="cmp-col"><h3>Físico <small>SkillCorner · média = Série B na posição de ' + esc(na) + '</small></h3>';
      FIS_GRUPOS.forEach(([g, rows]) => {
        const ls = rows.filter(([k]) => typeof ja[k] === 'number' || typeof jb[k] === 'number').map(([k, rot]) => linha(rot, ja[k], jb[k], medFis[k], false));
        if (ls.length) h += bloco(g, ls, na, nb);
      });
      h += '</div>';
    } else h += '<div class="cmp-col"><h3>Físico</h3><p class="fi-sem">nenhum dos dois tem físico do SkillCorner</p></div>';
    /* técnico: indicadores do ranking (arquivo da posição); casa pelo nome do indicador, porque as posições podem diferir */
    h += '<div class="cmp-col"><h3>Técnico <small>Wyscout · ' + esc((ka && ka.periodo) || (kb && kb.periodo) || '') + ' · média = coorte da ficha de ' + esc(na) + '</small></h3>';
    if ((ka && ka.ok) || (kb && kb.ok)) {
      const mapa = k => { const m = {}; if (k && k.ok) k.linhas.forEach(([id, v, med, mx]) => { const nm = k.nomes[id]; if (nm) m[nm[1]] = { g: nm[0], v, med, mx }; }); return m; };
      const ma = mapa(ka), mb = mapa(kb);
      const ordem = (ka && ka.ok ? ka : kb).nomes.map(x => x[1]).filter(n => ma[n] || mb[n]);
      const grupos = {};
      ordem.forEach(n => { const x = ma[n] || mb[n]; (grupos[x.g] = grupos[x.g] || []).push(n); });
      const menor = typeof menorMelhorInd === 'function' ? menorMelhorInd : (() => false);
      Object.entries(grupos).forEach(([g, ns]) => {
        h += bloco(g, ns.map(n => linha(n, ma[n] ? ma[n].v : null, mb[n] ? mb[n].v : null, ma[n] ? ma[n].med : null, menor(n), Math.max(ma[n] && ma[n].mx || 0, mb[n] && mb[n].mx || 0) || null)), na, nb);
      });
      if (!(ka && ka.ok)) h += '<p class="fi-sem">' + esc(na) + ' sem indicadores no ranking da posição</p>';
      if (!(kb && kb.ok)) h += '<p class="fi-sem">' + esc(nb) + ' sem indicadores no ranking da posição (posição ' + esc(B.p) + ')</p>';
    } else h += '<p class="fi-sem">nenhum dos dois tem os indicadores técnicos do ranking</p>';
    h += '</div>';
    if (A.p !== B.p) h += '<p class="cmp-aviso">Posições diferentes (' + esc(A.p) + ' × ' + esc(B.p) + '): o técnico mostra os indicadores que os dois arquivos têm em comum; a média é a da posição de ' + esc(na) + '.</p>';
    h += '</div>';
    corpo.innerHTML = h;
    if (typeof caberFicha === 'function') caberFicha();
  }

  /* ---------- ligação com a ficha do app.js ---------- */
  function ligar() {
    if (typeof window.renderFicha !== 'function' || typeof window.botaoFichaComp !== 'function') return;
    const rf = window.renderFicha, bf = window.botaoFichaComp;
    window.renderFicha = async function () { const r = await rf.apply(this, arguments); if (ativo()) await render(); return r; };
    window.botaoFichaComp = function () { const r = bf.apply(this, arguments); botao(); return r; };
    /* ficha de outro jogador: a comparação é da ficha em que foi aberta; troca de jogador volta ao normal */
    const fe = window.fecharFicha; if (typeof fe === 'function') window.fecharFicha = function () { CMP = null; return fe.apply(this, arguments); };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
