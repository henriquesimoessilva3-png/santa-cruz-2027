/* 02/11/2026 — Consulta rápida (Henrique: "pesquisar o nome do jogador e você me informar os dados: físico, técnico,
   segundo tempo, bola parada... uma pesquisa rápida que solte essas informações"). Botão 🔎 no topo (ou Ctrl/⌘+K, ou
   ?q=nome no endereço): digita o nome, escolhe o jogador e sai um cartão com letra física, seta técnica (a mesma conta da
   ficha), 2º tempo, minutagem, bola parada, contrato e idade — e um botão que copia tudo no formato do WhatsApp
   (💙A+ 💚A 💛B ❤️C · ✅ ⚠️ ❌ · 💎 🔋 🔸 🪫). Usa as funções do app: mesmos números da ficha. */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const POSN = { GOL: 'Goleiro', LD: 'Lateral direito', LE: 'Lateral esquerdo', ZD: 'Zagueiro (dir.)', ZE: 'Zagueiro (esq.)', VOL: 'Volante', MED: 'Médio', MEI: 'Meia', ED: 'Extremo direito', EE: 'Extremo esquerdo', CA: 'Centroavante' };
  const CORACAO = { 'A+': '💙', A: '💚', B: '💛', C: '❤️' };
  const SETA = { v: '✅', a: '⚠️', r: '❌', n: '❔' };
  const T2 = { azul: '💎', verde: '🔋', amarelo: '🔸', vermelho: '🪫' };
  const LETRA_TXT = { 'A+': 'explosivo + volume', A: 'explosivo e rápido', B: 'volume / intermediário', C: 'baixa intensidade' };
  const br = iso => { try { return typeof dataNascBR === 'function' ? dataNascBR(iso) : iso; } catch (e) { return iso; } };
  const mesAno = iso => iso ? ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][+String(iso).slice(5, 7) - 1] + '/' + String(iso).slice(0, 4) : '';
  let painel = null, ultimo = null;

  function montar() {
    if (painel) return painel;
    painel = document.createElement('div'); painel.id = 'crPainel'; painel.className = 'cr-painel oculta';
    painel.innerHTML = '<div class="cr-caixa"><div class="cr-topo"><b>🔎 Consulta rápida</b><span><button class="cr-cel" title="recalcula todos os jogadores e manda para o app do celular (Santa Cruz Consulta)">📱 Atualizar app do celular</button> <button class="cr-x" title="fechar (Esc)">✕</button></span></div>' +
      '<input id="crBusca" type="search" autocomplete="off" placeholder="nome do jogador (ex.: Patrick Novorizontino)">' +
      '<div id="crLista" class="cr-lista"></div><div id="crCard"></div></div>';
    document.body.appendChild(painel);
    painel.addEventListener('click', e => { if (e.target === painel || e.target.closest('.cr-x')) fechar(); else if (e.target.closest('.cr-cel')) gerarCelular(e.target.closest('.cr-cel')); });
    const inp = painel.querySelector('#crBusca'); let t = null;
    inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => listar(inp.value), 150); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const p = painel.querySelector('.cr-item'); if (p) p.click(); } });
    return painel;
  }
  function abrir(q) {
    montar(); painel.classList.remove('oculta');
    const inp = painel.querySelector('#crBusca'); if (q != null) { inp.value = q; listar(q); }
    setTimeout(() => inp.focus(), 30);
  }
  function fechar() { if (painel) painel.classList.add('oculta'); }
  window.consultaRapida = abrir;

  function listar(q) {
    const lista = painel.querySelector('#crLista'); painel.querySelector('#crCard').innerHTML = '';
    const ws = norm(q).split(' ').filter(Boolean);
    if (!ws.length || typeof BASE === 'undefined' || !BASE.length) { lista.innerHTML = ws.length ? '<div class="cr-vaz">a base ainda está carregando…</div>' : ''; return; }
    const achados = [];
    for (const x of BASE) {
      const alvo = norm((x.n || '') + ' ' + (x.nc || '') + ' ' + (x.t || ''));
      if (ws.every(w => alvo.includes(w))) { achados.push(x); if (achados.length > 400) break; }
    }
    const peso = x => (x.l === 'Brasil B' ? 0 : /^Brasil/.test(x.l) ? 1 : 2) - (typeof x.psv === 'number' ? 0.5 : 0) - Math.min(1, (x.min || 0) / 3000) * 0.4;
    achados.sort((a, b) => peso(a) - peso(b));
    lista.innerHTML = achados.length ? achados.slice(0, 15).map((x, i) => '<div class="cr-item" data-i="' + i + '"><b>' + esc(x.n) + '</b> <span>' + esc(x.t) + ' · ' + esc(x.l) + ' · ' + esc(POSN[x.p] || x.p || '') + (x.id_ ? ' · ' + x.id_ + ' anos' : '') + '</span></div>').join('') +
      (achados.length > 15 ? '<div class="cr-vaz">+ ' + (achados.length - 15) + ' — escreva também o clube</div>' : '') : '<div class="cr-vaz">nenhum jogador com esse nome na base</div>';
    lista.querySelectorAll('.cr-item').forEach(el => el.onclick = () => { lista.innerHTML = ''; cartao(achados[+el.dataset.i]); });
    if (achados.length === 1) { lista.innerHTML = ''; cartao(achados[0]); }
  }

  /* os dados colados (físico/técnico da busca automática) e a bola parada do Wyscout chegam da nuvem alguns segundos
     depois da base: sem esperar, a consulta aberta logo no início saía com o número antigo */
  async function esperarNuvem() {
    const logado = () => typeof FB !== 'undefined' && FB.pronto && FB.usuario;
    const pronto = () => (typeof DADOSJOG !== 'undefined' && Object.keys(DADOSJOG).length > 0) && (!logado() || (window.BP_WY && window.BP_WY.jog));
    const t0 = Date.now();
    while (!pronto() && Date.now() - t0 < 15000) await new Promise(r => setTimeout(r, 300));
  }
  async function dadosDe(b, rapido) {
    if (!rapido) await esperarNuvem();
    const pk = primaryKey(b);
    let o = b; try { const od = objDoRaio(pk, null, b); if (od && od.obj) o = od.obj; } catch (e) {}
    let js = o; try { js = comPosCampo(o) || o; } catch (e) {}
    const r = { b, pk, o, js, pos: js.p };
    try { const L = tipoLetra(js); r.letra = L ? (L === 'A' && tipoMais(js) ? 'A+' : L) : null; } catch (e) {}
    try { const dados = js.p !== 'GOL' && typeof kpisDe === 'function' ? await kpisDe(js) : null; r.selo = window.subidaSeloInfo ? window.subidaSeloInfo(js, dados) : null; } catch (e) {}
    try { r.t2 = window.segTempoDe ? (window.segTempoDe(o) || window.segTempoDe(b)) : null; } catch (e) {}
    try { r.min = minutagemDe(b); } catch (e) {}
    try { r.cobIdx = bolaParadaDe(b); } catch (e) {}
    try {
      const reg = window.bpWyRegistro ? window.bpWyRegistro(b) : null;
      if (reg && reg.a) { const t = { cob: 0, abp: 0, gbp: 0, gp: 0 }; r.bpa = reg.a; Object.values(reg.a).forEach(y => { if (!y) return; t.cob += (y.c || 0) + (y.fc || 0) + (y.fd || 0) + (y.pe || 0); t.abp += y.abp || 0; t.gbp += (y.ge || 0) + (y.gf || 0) + (y.gd || 0) + (y.gl || 0); t.gp += y.gp || 0; }); r.bp = t; }
    } catch (e) {}
    try { r.pf = await perfilExtraDe(b); } catch (e) {}
    try { r.foto = (window.fotoExtra && window.fotoExtra(pk)) || null; } catch (e) {}
    return r;
  }

  /* ===== app do celular (docs/consulta/, "Santa Cruz Consulta") =====
     O celular não roda o app inteiro: aqui o app completo calcula, com as MESMAS funções da ficha, o cartão de todos os
     jogadores da base e grava na nuvem (cenarios/_cel_meta + _cel_0.._cel_N, texto em pedaços: o Firestore limita 1 MB por
     documento). Só quem está na lista de e-mails das regras lê — o mesmo login do app. */
  const CEL_T2 = ['azul', 'verde', 'amarelo', 'vermelho'];
  function registroCel(r) {
    const b = r.b, s = r.selo, pf = r.pf || {};
    return [b.n || '', b.t || '', b.l || '', r.pos || b.p || '', b.id_ || null, pf.nasc || '', b.ct || pf.contrato || '', r.letra || '',
      r.pos === 'GOL' ? '' : (s ? s.c || 'n' : 'n'), s && s.com ? s.verde : null, s && s.com ? s.com : null,
      r.t2 ? CEL_T2.indexOf(r.t2.c) : -1, r.t2 ? Math.round(r.t2.manut * 100) : null, r.t2 ? r.t2.n : null,
      r.min ? Math.round(r.min.pct * 100) : null, r.bp ? r.bp.cob : null, r.bp ? r.bp.abp : null, r.bp ? r.bp.gbp : null,
      r.cobIdx ? r.cobIdx.cob : null, b.alt || pf.alt || null, b.nc && b.nc !== b.n ? b.nc : '', b.p || '', detalheCel(r)];
  }
  /* 02/11: o detalhe que abre ao tocar em cada bloco do cartão no celular */
  const FISK = ['psv', 'spr_n', 'hi_n', 'expl', 'dist', 'obr', 'hi', 'acel'];
  const r1 = v => (typeof v === 'number' && isFinite(v)) ? Math.round(v * 100) / 100 : null;
  function detalheCel(r) {
    const j = r.js || r.b, d = {};
    const f = FISK.map(k => r1(j[k])); if (f.some(v => v != null)) d.f = f;
    const s = r.selo; if (s && s.inds && s.inds.length) d.t = s.inds.map(x => [x.rot, r1(x.v), x.c || '', r1(x.ref), x.menor ? 1 : 0]);
    if (r.t2) d.s = [r1(r.t2.hi), r1(r.t2.dist), r1(r.t2.h2), r.t2.grupo || ''];
    if (r.min && r.min.anos) d.m = r.min.anos.map(a => [a.t, a.p == null ? null : Math.round(a.p * 100), a.tm || '', (a.txt || '').slice(0, 70)]);
    if (r.bpa) d.b = Object.keys(r.bpa).sort().map(a => { const y = r.bpa[a] || {}; return [a, (y.c || 0) + (y.fc || 0) + (y.fd || 0) + (y.pe || 0), y.abp || 0, (y.ge || 0) + (y.gf || 0) + (y.gd || 0) + (y.gl || 0), y.gh || 0, y.c || 0, (y.fc || 0) + (y.fd || 0), y.pe || 0]; });
    return Object.keys(d).length ? d : 0;
  }
  const GEMEAS = { LD: ['LD', 'LE'], LE: ['LD', 'LE'], ZD: ['ZD', 'ZE'], ZE: ['ZD', 'ZE'], ED: ['ED', 'EE'], EE: ['ED', 'EE'] };
  function mediasSerieB() {
    const out = {};
    ['LD', 'LE', 'ZD', 'ZE', 'VOL', 'MED', 'MEI', 'ED', 'EE', 'CA'].forEach(p => {
      const ps = GEMEAS[p] || [p], l = BASE.filter(x => x.l === 'Brasil B' && ps.includes(x.p));
      out[p] = FISK.map(k => { const v = l.map(x => x[k]).filter(v => typeof v === 'number' && isFinite(v)); return v.length >= 5 ? r1(v.reduce((a, b) => a + b, 0) / v.length) : null; });
    });
    return out;
  }
  let gerando = false;
  async function gerarCelular(bt) {
    if (gerando) return;
    if (!(typeof FB !== 'undefined' && FB.pronto && FB.usuario && FB.db)) { try { toast('Entre com o login para atualizar o app do celular', 'ruim'); } catch (e) {} return; }
    gerando = true; const rot = bt ? bt.textContent : '';
    try {
      await esperarNuvem();
      const lista = BASE.filter(x => x && x.n), out = []; const t0 = Date.now();
      for (let i = 0; i < lista.length; i++) {
        try { out.push(registroCel(await dadosDe(lista[i], true))); } catch (e) {}
        if (i % 250 === 0) { if (bt) bt.textContent = '📱 ' + Math.round(i / lista.length * 100) + '%…'; await new Promise(r => setTimeout(r, 0)); }
      }
      const txt = JSON.stringify(out), TAM = 600000, partes = Math.ceil(txt.length / TAM), col = FB.db.collection(typeof FB_COLECAO !== 'undefined' ? FB_COLECAO : 'cenarios');
      if (bt) bt.textContent = '📱 gravando…';
      for (let k = 0; k < partes; k++) await col.doc('_cel_' + k).set({ t: txt.slice(k * TAM, (k + 1) * TAM) });
      const gerado = new Date().toISOString();
      await col.doc('_cel_meta').set({ partes, n: out.length, gerado, medias: mediasSerieB(), fisk: FISK, porEmail: FB.usuario.email || '', campos: 'n,t,l,pos,idade,nasc,ct,letra,seta,verde,com,t2,t2manut,t2jogos,min,cob,abp,gbp,cobIdx,alt,nc,pcad,det' });
      try { await col.doc('_cel_extra').set({ j: {} }); } catch (e) {}   /* a base nova já tem o que estava no avulso */
      try { toast('App do celular atualizado: ' + out.length.toLocaleString('pt-BR') + ' jogadores (' + Math.round((Date.now() - t0) / 1000) + ' s)', 'bom'); } catch (e) {}
    } catch (e) { try { toast('Não deu para atualizar o app do celular: ' + ((e && e.message) || e), 'ruim'); } catch (e2) {} }
    finally { gerando = false; if (bt) bt.textContent = rot; }
  }
  window.gerarAppCelular = gerarCelular;

  /* ===== pedidos de atualização vindos do celular (cenarios/_cel_pedidos) =====
     Com o app aberto neste Chrome (login + extensão BFR Busca Jogador), cada pedido pendente roda a busca automática
     (window.buscaAutoPedido, só segue quando o jogador é inequívoco) e o cartão novo vai para cenarios/_cel_extra, que o
     celular lê na hora. Um de cada vez, sem atrapalhar quem está usando: espera a janela de dados estar fechada. */
  const chavePk = s => String(s).replace(/[.~*/\[\]]/g, '_');
  let filaRodando = false, filaPend = [];
  async function processarFila() {
    if (filaRodando || !filaPend.length || typeof window.buscaAutoPedido !== 'function') return;
    filaRodando = true; const col = FB.db.collection(typeof FB_COLECAO !== 'undefined' ? FB_COLECAO : 'cenarios');
    try {
      while (filaPend.length) {
        const md = document.getElementById('modalDados'); if (md && md.classList.contains('aberto')) { await new Promise(r => setTimeout(r, 5000)); continue; }
        const [k, p] = filaPend.shift();
        await col.doc('_cel_pedidos').set({ p: { [k]: Object.assign({}, p, { estado: 'buscando', em_busca: new Date().toISOString() }) } }, { merge: true });
        const b = fsJogadorPk(p.pk) || BASE.find(x => x.n === p.n && x.t === p.t);
        let res = b ? await window.buscaAutoPedido(b) : { estado: 'erro', msg: 'jogador não está na base do app' };
        if (b && (res.estado === 'ok' || res.estado === 'parcial')) {
          await new Promise(r => setTimeout(r, 1500));
          try { const reg = registroCel(await dadosDe(b, true)); await col.doc('_cel_extra').set({ j: { [k]: reg } }, { merge: true }); } catch (e) { res.msg += ' (cartão não gravado: ' + e.message + ')'; }
        }
        await col.doc('_cel_pedidos').set({ p: { [k]: Object.assign({}, p, { estado: res.estado, msg: res.msg || '', wy: res.wy || '', feito: new Date().toISOString() }) } }, { merge: true });
        try { toast('Pedido do celular: ' + p.n + ' — ' + (res.msg || res.estado), res.estado === 'ok' ? 'bom' : res.estado === 'erro' ? 'ruim' : ''); } catch (e) {}
      }
    } finally { filaRodando = false; }
  }
  function ligarFila() {
    if (!(typeof FB !== 'undefined' && FB.pronto && FB.usuario && FB.db)) return false;
    FB.db.collection(typeof FB_COLECAO !== 'undefined' ? FB_COLECAO : 'cenarios').doc('_cel_pedidos').onSnapshot(s => {
      const P = (s.exists && s.data().p) || {};
      Object.entries(P).forEach(([k, p]) => { if (p && p.estado === 'pendente' && !filaPend.some(x => x[0] === k)) filaPend.push([k, p]); });
      if (filaPend.length) esperarNuvem().then(processarFila);
    }, () => {});
    return true;
  }
  { const t0 = Date.now(); const iv = setInterval(() => { if (typeof BASE !== 'undefined' && BASE.length > 1000 && ligarFila()) clearInterval(iv); else if (Date.now() - t0 > 120000) clearInterval(iv); }, 2000); }

  function linhaWhats(r) {
    const b = r.b, idade = r.b.id_ ? ', ' + r.b.id_ + 'a' : '';
    const s = r.selo, sc = s ? (s.c || 'n') : 'n';
    const partes = [b.n + ' (' + b.t + idade + ')'];
    partes.push(r.pos === 'GOL' ? 'goleiro' : r.letra ? CORACAO[r.letra] + r.letra : '🤍 sem físico');
    if (r.pos !== 'GOL') partes.push(SETA[sc] + (s && s.com ? s.verde + '/' + s.com : ''));
    if (r.t2) partes.push('2T ' + T2[r.t2.c]);
    if (r.min) partes.push('⏱️' + Math.round(r.min.pct * 100) + '%');
    if (r.bp && (r.bp.cob || r.bp.gbp)) partes.push('⚑' + r.bp.cob + ' cobr.' + (r.bp.gbp ? ' · ⚽' + r.bp.gbp + ' gols BP' : ''));
    return partes.join(' · ');
  }
  async function cartao(b) {
    const card = painel.querySelector('#crCard');
    card.innerHTML = '<div class="cr-vaz">calculando…</div>';
    const r = await dadosDe(b); ultimo = r;
    const s = r.selo, sc = s ? (s.c || 'n') : 'n';
    const nasc = (r.pf && r.pf.nasc) || '';
    const ct = b.ct || (r.pf && r.pf.contrato) || '';   /* mesma ordem da ficha: cadastro, depois Transfermarkt */
    const alt = b.alt || (r.pf && r.pf.alt) || '';
    const bloco = (rot, val, sub, cls) => '<div class="cr-b ' + (cls || '') + '"><small>' + rot + '</small><b>' + val + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>';
    const fis = r.pos === 'GOL' ? bloco('Físico', 'goleiro', '', 'n')
      : r.letra ? bloco('Físico', CORACAO[r.letra] + ' ' + r.letra, LETRA_TXT[r.letra], 'l-' + (r.letra === 'A+' ? 'ap' : r.letra.toLowerCase())) : bloco('Físico', '🤍 sem dado', 'sem rastreio suficiente', 'n');
    const tec = r.pos === 'GOL' ? bloco('Técnico', '—', '', 'n')
      : s && s.com ? bloco('Técnico', SETA[sc] + ' ' + s.verde + '/' + s.com, 'fundamentais no nível de quem sobe', 's-' + sc) : bloco('Técnico', '❔ sem dado', 'sem técnico no app', 'n');
    const t2 = r.t2 ? bloco('2º tempo', T2[r.t2.c] + ' ' + r.t2.nome, 'mantém ' + Math.round(r.t2.manut * 100) + '% · ' + r.t2.n + ' jogos completos', 't-' + r.t2.c) : bloco('2º tempo', '➖ sem nota', 'menos de 5 jogos completos rastreados', 'n');
    const mi = r.min ? bloco('Minutagem', Math.round(r.min.pct * 100) + '%', 'dos minutos do time (3 anos)', 'm-' + r.min.c) : bloco('Minutagem', '—', 'sem histórico', 'n');
    const bp = r.bp ? bloco('Bola parada', '⚑ ' + r.bp.cob + ' · ⚽ ' + r.bp.gbp, r.bp.cob + ' cobranças · ' + r.bp.abp + ' assist. · ' + r.bp.gbp + ' gols de BP (3 anos)' + (r.cobIdx ? ' · cobrador melhor que ' + r.cobIdx.cob + '% da liga' : ''), r.bp.gbp >= 3 || r.bp.abp >= 6 ? 'm-v' : 'n')
      : r.cobIdx ? bloco('Bola parada', '⚑ ' + r.cobIdx.cob + '%', 'cobrador melhor que ' + r.cobIdx.cob + '% da liga', r.cobIdx.c ? 'm-' + r.cobIdx.c : 'n') : bloco('Bola parada', '—', 'sem dado', 'n');
    const posTxt = POSN[r.pos] || r.pos || '';
    card.innerHTML = '<div class="cr-card">' +
      '<div class="cr-cab">' + (r.foto ? '<img src="' + esc(r.foto) + '" alt="" referrerpolicy="no-referrer">' : '') +
      '<div><div class="cr-nome">' + esc(b.n) + '</div><div class="cr-sub">' + esc(b.t) + ' · ' + esc(b.l) + ' · ' + esc(posTxt) + (r.pos !== b.p && b.p ? ' (cadastro: ' + esc(POSN[b.p] || b.p) + ')' : '') + '</div>' +
      '<div class="cr-sub"><b>' + (b.id_ || '—') + ' anos</b>' + (nasc ? ' · nasc. ' + esc(br(nasc)) : '') + (ct ? ' · contrato até ' + esc(mesAno(ct)) : '') + (alt ? ' · ' + esc(alt) + ' cm' : '') + (r.pf && r.pf.pe ? ' · pé ' + esc(r.pf.pe) : '') + '</div></div></div>' +
      '<div class="cr-grade">' + fis + tec + t2 + mi + bp + '</div>' +
      '<div class="cr-whats"><small>WhatsApp</small><div id="crLinha">' + esc(linhaWhats(r)) + '</div></div>' +
      '<div class="cr-bts"><button id="crCopiar">📋 Copiar para o WhatsApp</button><button id="crFicha">abrir a ficha completa</button><button id="crOutro">nova busca</button></div></div>';
    card.querySelector('#crCopiar').onclick = async () => {
      const txt = linhaWhats(r);
      try { await navigator.clipboard.writeText(txt); try { toast('Copiado — é só colar no WhatsApp', 'bom'); } catch (e) {} }
      catch (e) { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    };
    card.querySelector('#crFicha').onclick = () => { fechar(); try { abrirFicha(b.id); } catch (e) {} };
    card.querySelector('#crOutro').onclick = () => { const i = painel.querySelector('#crBusca'); i.value = ''; card.innerHTML = ''; i.focus(); };
  }

  function botao() {
    if (document.getElementById('btConsultaRapida')) return;
    const b = document.createElement('button'); b.id = 'btConsultaRapida'; b.type = 'button'; b.textContent = '🔎 Consulta';
    b.title = 'Consulta rápida: digite o nome e veja físico, técnico, 2º tempo, minutagem e bola parada (Ctrl/⌘+K)';
    b.onclick = () => abrir(); document.body.appendChild(b);
  }
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); abrir(); }
    else if (e.key === 'Escape' && painel && !painel.classList.contains('oculta')) fechar();
  });
  function iniciar() {
    botao();
    let q = null; try { q = new URLSearchParams(location.search).get('q'); } catch (e) {}
    if (q) { const t0 = Date.now(); const iv = setInterval(() => { if (typeof BASE !== 'undefined' && BASE.length > 1000) { clearInterval(iv); abrir(q); } else if (Date.now() - t0 > 60000) clearInterval(iv); }, 500); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
