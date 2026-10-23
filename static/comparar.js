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
      w.innerHTML = '<button type="button" class="bt mini" id="fiCmpBt"></button><button type="button" class="bt mini fi-cmp-x oculta" id="fiCmpX" title="Sair da comparação">✕</button>' +
        '<span class="fi-cmp-busca oculta"><input type="search" id="fiCmpQ" placeholder="nome ou clube do outro jogador" autocomplete="off"><span class="fi-cmp-res" id="fiCmpRes"></span></span>';
      ref.insertAdjacentElement('afterend', w);
      w.querySelector('#fiCmpBt').onclick = () => {
        /* 23/10: com a comparação aberta o botão é um "combo" — abre a busca para TROCAR o jogador; o ✕ ao lado sai */
        const b = w.querySelector('.fi-cmp-busca'); b.classList.toggle('oculta');
        if (!b.classList.contains('oculta')) { const q = w.querySelector('#fiCmpQ'); q.value = ''; resultados(''); q.focus(); }
      };
      w.querySelector('#fiCmpX').onclick = () => { CMP = null; w.querySelector('.fi-cmp-busca').classList.add('oculta'); botao(); window.renderFicha(); };
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
    const x = w.querySelector('#fiCmpX');
    if (ativo()) { bt.textContent = '⇆ vs. ' + (CMP.b.n || '') + ' (' + (CMP.b.t || '') + ') ▾'; bt.classList.add('on'); bt.title = 'Trocar o jogador da comparação'; x.classList.remove('oculta'); }
    else { bt.textContent = '⇆ comparar com jogador'; bt.classList.remove('on'); bt.title = 'Escolher outro jogador da base e ver os dois lado a lado (físico, técnico, letra, seta e minutagem)'; x.classList.add('oculta'); }
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
  /* 23/10 (3ª versão, Henrique: "tem que manter a ideia de quais são os principais indicadores… se os dois estão acima da
     média ou não… barras das cores normais"): a comparação é a PRÓPRIA ficha do jogador aberto, com a linha do outro
     jogador logo abaixo de cada indicador — mesma barra (verde = no nível da régua, amarelo = até 10% abaixo, vermelho =
     abaixo), mesmo traço da régua, mesmas colunas SOBE / MÉDIA / MELHOR, mesmo ● de fundamental. Quem leva no indicador
     fica com o número em destaque e a marca ▸. De saída só os principais (● e ◆); "ver todos" abre o resto. */
  const nkRot = t => semAc(String(t || '').replace(/[↓↑~◆●]/g, ''));
  const numPt = t => { const m = String(t || '').replace(/\./g, '').replace(',', '.').match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; };
  const ini = n => String(n || '').replace(/\(.*?\)/g, '').trim().split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase();
  async function render() {
    if (!ativo()) return;
    const A = fichaAtual, B = CMP.b;
    const corpo = document.getElementById('fiCorpo'); if (!corpo) return;
    const modo = (document.getElementById('fiBase') || {}).value || 'posliga';
    const fb = await montarFicha(B, modo);
    if (!ativo()) return;
    const ra = resumo(A), rb = resumo(B);
    const tmp = document.createElement('div'); tmp.innerHTML = fb.corpo || '';
    const tagA = '<i class="cmp-tag a" title="' + esc(A.n) + '">' + esc(ini(A.n)) + '</i>', tagB = '<i class="cmp-tag b" title="' + esc(B.n) + '">' + esc(ini(B.n)) + '</i>';
    /* resumo do topo de cada coluna (letra física / seta técnica): o do outro jogador logo abaixo */
    const resA = corpo.querySelectorAll('.fi-res'), resB = tmp.querySelectorAll('.fi-res');
    resA.forEach((r, i) => { r.insertAdjacentHTML('afterbegin', tagA); if (resB[i]) { const c = resB[i].cloneNode(true); c.classList.add('cmp-res-b'); c.insertAdjacentHTML('afterbegin', tagB); r.after(c); } });
    /* contagem de cada grupo (ex.: DEFENSIVO 1/4): a do outro ao lado */
    const gB = {}; tmp.querySelectorAll('h4.sf-gh').forEach(h => { gB[nkRot(h.childNodes[0] ? h.childNodes[0].textContent : h.textContent)] = h.querySelector('.sf-cont'); });
    corpo.querySelectorAll('h4.sf-gh').forEach(h => { const k = nkRot(h.childNodes[0] ? h.childNodes[0].textContent : h.textContent), c = h.querySelector('.sf-cont'), cb = gB[k];
      if (c) c.insertAdjacentHTML('afterbegin', '<span class="cmp-c a">' + esc(ini(A.n)) + '</span> ');
      if (cb) { const x = cb.cloneNode(true); x.classList.add('cmp-cont-b'); x.insertAdjacentHTML('afterbegin', '<span class="cmp-c b">' + esc(ini(B.n)) + '</span> '); (c || h).after(x); } });
    /* subgrupos do físico (Velocidade e explosão 0/4 · Volume 1/1) */
    const sB = {}; tmp.querySelectorAll('.sf-sub').forEach(x => { const sp = x.querySelector('span'), b = x.querySelector('b'); if (sp && b) sB[nkRot(sp.textContent)] = b.textContent; });
    corpo.querySelectorAll('.sf-sub').forEach(x => { const sp = x.querySelector('span'), b = x.querySelector('b'); if (!sp || !b) return; const vb = sB[nkRot(sp.textContent)];
      b.innerHTML = '<span class="cmp-c a">' + esc(ini(A.n)) + '</span> ' + esc(b.textContent) + (vb != null ? ' <span class="cmp-c b">' + esc(ini(B.n)) + '</span> ' + esc(vb) : ''); });
    /* linhas */
    const mapB = {}; tmp.querySelectorAll('.fi-linha:not(.cab)').forEach(r => { const k = nkRot((r.querySelector('.rot') || {}).textContent); if (k && !mapB[k]) mapB[k] = r; });
    let la = 0, lb = 0;
    corpo.querySelectorAll('.fi-linha:not(.cab)').forEach(r => {
      const rot = r.querySelector('.rot'); if (!rot) return;
      const k = nkRot(rot.textContent), rbx = mapB[k];
      r.classList.add('cmp-a'); rot.insertAdjacentHTML('afterbegin', tagA);
      let c;
      if (rbx) { c = rbx.cloneNode(true); }
      else { c = document.createElement('div'); c.className = 'fi-linha sf sf6 sem'; c.innerHTML = '<span class="rot"></span><span class="val">—</span><span class="fi-barra"></span><span class="sf-sobe"></span><span class="med"></span><span class="mx"></span>'; }
      c.classList.add('cmp-b'); c.classList.toggle('fund', r.classList.contains('fund'));
      const rc = c.querySelector('.rot'); if (rc) rc.innerHTML = tagB + '<span class="cmp-nm">' + esc(B.n) + '</span>';
      /* régua: se é a mesma do jogador de cima, não repete */
      ['.sf-sobe', '.med', '.mx'].forEach(sel => { const x = c.querySelector(sel), y = r.querySelector(sel); if (x && y && x.textContent.trim() === y.textContent.trim()) x.textContent = ''; });
      r.after(c);
      const va = numPt((r.querySelector('.val') || {}).textContent), vb = rbx ? numPt((c.querySelector('.val') || {}).textContent) : null;
      if (va != null && vb != null && va !== vb) {
        const menor = /↓/.test(rot.textContent) || (typeof menorMelhorInd === 'function' && menorMelhorInd(rot.textContent.replace(/[↓~◆●]/g, '').trim()));
        const ganhaA = menor ? va < vb : va > vb;
        (ganhaA ? r : c).classList.add('cmp-leva');
        if (CMP.todos || r.classList.contains('fund')) { if (ganhaA) la++; else lb++; }   /* o placar conta o que está na tela */
      }
      const principal = r.classList.contains('fund');
      if (!principal && !CMP.todos) { r.classList.add('cmp-oculta'); c.classList.add('cmp-oculta'); }
    });
    /* minutagem / bola parada embaixo: a do jogador da ficha; na comparação saem (o resumo do topo traz a minutagem dos dois) */
    corpo.querySelectorAll('.sf-extra').forEach(x => x.classList.add('cmp-oculta'));
    const chip = (rot, v, cls) => '<span class="cc' + (cls ? ' ' + cls : '') + '"><small>' + rot + '</small>' + v + '</span>';
    const lado = (j, r, tag, cls) => '<div class="cmp-lado ' + cls + '">' + tag + '<b class="cmp-n">' + esc(j.nc || j.n) + '</b><span class="cmp-s">' + esc([j.t, j.l, j.p, j.id_ ? j.id_ + ' anos' : ''].filter(Boolean).join(' · ')) + '</span>' +
      chip('Contrato', j.ct ? j.ct.slice(5, 7) + '/' + j.ct.slice(0, 4) : '—', j.ct && j.ct.slice(0, 7) <= '2027-01' ? 'livre' : '') + chip('Alt.', j.alt ? j.alt + ' cm' : '—') +
      chip('Min.', r.mp != null ? r.mp + '%' : '—', r.mc ? 'min-' + r.mc : '') + (r.bp != null ? chip('Cobrador', r.bp) : '') + (r.farolH ? '<span class="cc">' + r.farolH + '</span>' : '') + '</div>';
    const faixa = document.createElement('div'); faixa.className = 'cmp-faixa';
    faixa.innerHTML = lado(A, ra, tagA, 'a') + '<div class="cmp-pl"><b class="' + (la > lb ? 'lider' : '') + '">' + la + '</b><span>' + (CMP.todos ? 'indicadores' : 'principais') + '<br>em que leva</span><b class="' + (lb > la ? 'lider' : '') + '">' + lb + '</b></div>' + lado(B, rb, tagB, 'b') +
      '<button type="button" class="bt mini cmp-todos">' + (CMP.todos ? 'só os principais (● ◆)' : 'ver todos os indicadores') + '</button>';
    corpo.prepend(faixa);
    faixa.querySelector('.cmp-todos').onclick = () => { CMP.todos = !CMP.todos; window.renderFicha(); };
    corpo.classList.add('cmp-on');
    if (typeof caberFicha === 'function') caberFicha();
  }

  /* ---------- ligação com a ficha do app.js ---------- */
  function ligar() {
    if (typeof window.renderFicha !== 'function' || typeof window.botaoFichaComp !== 'function') return;
    const rf = window.renderFicha, bf = window.botaoFichaComp;
    window.renderFicha = async function () { const r = await rf.apply(this, arguments); const f = document.getElementById('ficha'); if (f) f.classList.toggle('modo-cmp', ativo()); const cp = document.getElementById('fiCorpo'); if (cp && !ativo()) cp.classList.remove('cmp-on'); if (ativo()) await render(); return r; };
    window.botaoFichaComp = function () { const r = bf.apply(this, arguments); botao(); return r; };
    /* ficha de outro jogador: a comparação é da ficha em que foi aberta; troca de jogador volta ao normal */
    const fe = window.fecharFicha; if (typeof fe === 'function') window.fecharFicha = function () { CMP = null; return fe.apply(this, arguments); };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
