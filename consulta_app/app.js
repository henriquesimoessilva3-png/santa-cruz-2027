/* Consulta de Jogadores — app do celular (02/11/2026, pedido do Henrique: "acessar pelo celular"). Lê da nuvem os cartões
   calculados pelo app completo (botão "📱 Atualizar app do celular" na Consulta rápida): cenarios/_cel_meta + _cel_0..N.
   Guarda no celular (IndexedDB) e só baixa de novo quando há versão nova. Mesmo login (Google) e mesma lista de e-mails. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const POSN = { GOL: 'Goleiro', LD: 'Lateral direito', LE: 'Lateral esquerdo', ZD: 'Zagueiro (dir.)', ZE: 'Zagueiro (esq.)', VOL: 'Volante', MED: 'Médio', MEI: 'Meia', ED: 'Extremo direito', EE: 'Extremo esquerdo', CA: 'Centroavante' };
  const CORACAO = { 'A+': '💙', A: '💚', B: '💛', C: '❤️' }, LETRA_TXT = { 'A+': 'explosivo + volume', A: 'explosivo e rápido', B: 'volume / intermediário', C: 'baixa intensidade' };
  const SETA = { v: '✅', a: '⚠️', r: '❌', n: '❔' }, T2 = ['💎', '🔋', '🔸', '🪫'], T2N = ['Elite', 'Mantém', 'Cai um pouco', 'Cai muito'], T2C = ['c-az', 'c-v', 'c-a', 'c-r'];
  const I = { n: 0, t: 1, l: 2, pos: 3, id: 4, nasc: 5, ct: 6, letra: 7, seta: 8, verde: 9, com: 10, t2: 11, t2m: 12, t2j: 13, min: 14, cob: 15, abp: 16, gbp: 17, cobIdx: 18, alt: 19, nc: 20 };
  let J = [], IDX = [], meta = null;
  const toast = t => { const e = $('#toast'); e.textContent = t; e.classList.add('on'); setTimeout(() => e.classList.remove('on'), 2200); };
  const dataBR = iso => iso && /^\d{4}-\d\d-\d\d/.test(iso) ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4) : (iso || '');
  const mesAno = iso => iso && /^\d{4}-\d\d/.test(iso) ? ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][+iso.slice(5, 7) - 1] + '/' + iso.slice(0, 4) : '';

  /* ---- IndexedDB (os dados ficam no celular) ---- */
  const idb = () => new Promise((res, rej) => { const r = indexedDB.open('sc_consulta', 1); r.onupgradeneeded = () => r.result.createObjectStore('k'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const idbGet = async k => { try { const d = await idb(); return await new Promise(res => { const q = d.transaction('k').objectStore('k').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(null); }); } catch (e) { return null; } };
  const idbSet = async (k, v) => { try { const d = await idb(); await new Promise(res => { const t = d.transaction('k', 'readwrite'); t.objectStore('k').put(v, k); t.oncomplete = res; t.onerror = res; }); } catch (e) {} };

  function usar(dados, m) {
    J = dados; meta = m;
    IDX = J.map(r => norm(r[I.n] + ' ' + (r[I.nc] || '') + ' ' + r[I.t]));
    $('#ver').textContent = (J.length).toLocaleString('pt-BR') + ' jogadores · dados de ' + dataBR((m && m.gerado) || '');
    $('#q').disabled = false;
    if (!$('#q').value) $('#m').innerHTML = '<div class="vaz">Digite o nome do jogador.<br>Ex.: <i>Patrick Novorizontino</i></div>' + legenda();
    else buscar();
  }
  const legenda = () => '<div class="leg">Físico: 💙A+ 💚A 💛B ❤️C · Técnico: ✅ atende ⚠️ médio ❌ abaixo · 2º tempo: 💎 elite 🔋 mantém 🔸 cai um pouco 🪫 cai muito · ⏱️ minutagem · ⚑ bola parada</div>';

  async function carregar(db) {
    const local = await idbGet('dados'), lm = await idbGet('meta');
    if (local && lm) usar(local, lm);
    try {
      const ms = await db.collection('cenarios').doc('_cel_meta').get();
      if (!ms.exists) { if (!local) $('#m').innerHTML = '<div class="vaz">Ainda não há dados. No app completo (computador), abra 🔎 Consulta e toque em <b>📱 Atualizar app do celular</b>.</div>'; return; }
      const m = ms.data();
      if (lm && lm.gerado === m.gerado && local) return;
      if (!local) $('#m').innerHTML = '<div class="vaz">baixando os dados (só na primeira vez)…</div>';
      const partes = await Promise.all(Array.from({ length: m.partes }, (_, k) => db.collection('cenarios').doc('_cel_' + k).get()));
      const dados = JSON.parse(partes.map(p => (p.data() || {}).t || '').join(''));
      await idbSet('dados', dados); await idbSet('meta', m);
      usar(dados, m); if (local) toast('Dados atualizados');
    } catch (e) {
      if (!local) $('#m').innerHTML = '<div class="vaz">Não deu para ler os dados: ' + esc(e.message || e) + '<br>Seu e-mail precisa estar na lista do app.</div>';
    }
  }

  function buscar() {
    const ws = norm($('#q').value).split(' ').filter(Boolean);
    if (!ws.length) { $('#m').innerHTML = legenda(); return; }
    const ach = [];
    for (let i = 0; i < J.length; i++) if (ws.every(w => IDX[i].includes(w))) { ach.push(J[i]); if (ach.length > 300) break; }
    const peso = r => (r[I.l] === 'Brasil B' ? 0 : /^Brasil/.test(r[I.l]) ? 1 : 2) - (r[I.letra] ? 0.5 : 0) - (r[I.com] ? 0.3 : 0);
    ach.sort((a, b) => peso(a) - peso(b));
    if (ach.length === 1) return cartao(ach[0]);
    $('#m').innerHTML = ach.length ? ach.slice(0, 25).map((r, i) => '<div class="item" data-i="' + i + '"><b>' + esc(r[I.n]) + '</b> ' + (r[I.letra] ? CORACAO[r[I.letra]] : '') + (r[I.com] ? ' ' + SETA[r[I.seta]] : '') +
      '<span>' + esc(r[I.t]) + ' · ' + esc(r[I.l]) + ' · ' + esc(POSN[r[I.pos]] || r[I.pos]) + (r[I.id] ? ' · ' + r[I.id] + ' anos' : '') + '</span></div>').join('') +
      (ach.length > 25 ? '<div class="vaz">+ ' + (ach.length - 25) + ' — escreva também o clube</div>' : '') : '<div class="vaz">nenhum jogador com esse nome</div>';
    document.querySelectorAll('.item').forEach(el => el.onclick = () => cartao(ach[+el.dataset.i]));
  }
  function linha(r) {
    const p = [r[I.n] + ' (' + r[I.t] + (r[I.id] ? ', ' + r[I.id] + 'a' : '') + ')'];
    p.push(r[I.pos] === 'GOL' ? 'goleiro' : r[I.letra] ? CORACAO[r[I.letra]] + r[I.letra] : '🤍 sem físico');
    if (r[I.pos] !== 'GOL') p.push(SETA[r[I.seta] || 'n'] + (r[I.com] ? r[I.verde] + '/' + r[I.com] : ''));
    if (r[I.t2] >= 0) p.push('2T ' + T2[r[I.t2]]);
    if (r[I.min] != null) p.push('⏱️' + r[I.min] + '%');
    if (r[I.cob] || r[I.gbp]) p.push('⚑' + (r[I.cob] || 0) + ' cobr.' + (r[I.gbp] ? ' · ⚽' + r[I.gbp] + ' gols BP' : ''));
    return p.join(' · ');
  }
  function cartao(r) {
    const bl = (rot, val, sub, c) => '<div class="bl ' + (c || '') + '"><small>' + rot + '</small><b>' + val + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>';
    const L = r[I.letra], gk = r[I.pos] === 'GOL';
    const fis = gk ? bl('Físico', 'goleiro', '') : L ? bl('Físico', CORACAO[L] + ' ' + L, LETRA_TXT[L], { 'A+': 'c-az', A: 'c-v', B: 'c-a', C: 'c-r' }[L]) : bl('Físico', '🤍 —', 'sem rastreio suficiente');
    const sc = r[I.seta] || 'n';
    const tec = gk ? bl('Técnico', '—', '') : r[I.com] ? bl('Técnico', SETA[sc] + ' ' + r[I.verde] + '/' + r[I.com], 'fundamentais no nível de quem sobe', { v: 'c-v', a: 'c-a', r: 'c-r' }[sc]) : bl('Técnico', '❔ —', 'sem técnico no app');
    const t2 = r[I.t2] >= 0 ? bl('2º tempo', T2[r[I.t2]] + ' ' + T2N[r[I.t2]], 'mantém ' + r[I.t2m] + '% · ' + r[I.t2j] + ' jogos completos', T2C[r[I.t2]]) : bl('2º tempo', '➖', 'menos de 5 jogos completos');
    const mi = r[I.min] != null ? bl('Minutagem', r[I.min] + '%', 'dos minutos do time (3 anos)', r[I.min] >= 60 ? 'c-v' : r[I.min] >= 30 ? 'c-a' : 'c-r') : bl('Minutagem', '—', 'sem histórico');
    const bp = (r[I.cob] != null) ? bl('Bola parada', '⚑ ' + r[I.cob] + ' · ⚽ ' + (r[I.gbp] || 0), r[I.cob] + ' cobranças · ' + (r[I.abp] || 0) + ' assist. · ' + (r[I.gbp] || 0) + ' gols de BP (3 anos)', (r[I.gbp] >= 3 || r[I.abp] >= 6) ? 'c-v' : '')
      : r[I.cobIdx] != null ? bl('Bola parada', '⚑ ' + r[I.cobIdx] + '%', 'cobrador melhor que ' + r[I.cobIdx] + '% da liga', r[I.cobIdx] >= 80 ? 'c-v' : r[I.cobIdx] >= 65 ? 'c-a' : '') : bl('Bola parada', '—', 'sem dado');
    $('#m').innerHTML = '<div class="nome">' + esc(r[I.n]) + '</div>' +
      '<div class="sub">' + esc(r[I.t]) + ' · ' + esc(r[I.l]) + ' · ' + esc(POSN[r[I.pos]] || r[I.pos]) + '</div>' +
      '<div class="sub"><b>' + (r[I.id] || '—') + ' anos</b>' + (r[I.nasc] ? ' · nasc. ' + esc(dataBR(r[I.nasc])) : '') + (r[I.ct] ? ' · contrato até ' + esc(mesAno(r[I.ct])) : '') + (r[I.alt] ? ' · ' + r[I.alt] + ' cm' : '') + '</div>' +
      '<div class="grade">' + fis + tec + t2 + mi + bp + '</div>' +
      '<div class="whats"><small>WhatsApp</small>' + esc(linha(r)) + '</div>' +
      '<div class="bts"><button class="ok" id="cp">📋 Copiar</button><button id="vt">← voltar</button></div>' + legenda();
    $('#cp').onclick = async () => { const t = linha(r); try { await navigator.clipboard.writeText(t); } catch (e) { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); } toast('Copiado — cole no WhatsApp'); };
    $('#vt').onclick = () => { buscar(); };
    window.scrollTo(0, 0);
  }

  let t = null; $('#q').addEventListener('input', () => { clearTimeout(t); t = setTimeout(buscar, 120); });

  async function iniciar() {
    let cfg = null; try { cfg = await fetch('../dados/firebase.json').then(r => r.json()); } catch (e) {}
    const local = await idbGet('dados'), lm = await idbGet('meta'); if (local && lm) usar(local, lm);
    if (!cfg || !cfg.projectId || typeof firebase === 'undefined') { if (!local) $('#m').innerHTML = '<div class="vaz">Sem conexão com a nuvem agora.</div>'; return; }
    firebase.initializeApp(cfg); const auth = firebase.auth(), db = firebase.firestore();
    try { await auth.getRedirectResult(); } catch (e) {}
    auth.onAuthStateChanged(u => {
      if (u) return carregar(db);
      if (local) return;
      $('#m').innerHTML = '<div class="vaz">Entre com o mesmo e-mail Google do app do Santa Cruz.</div><button class="entrar" id="ent">Entrar com Google</button>';
      $('#ent').onclick = async () => { const p = new firebase.auth.GoogleAuthProvider(); try { await auth.signInWithPopup(p); } catch (e) { try { await auth.signInWithRedirect(p); } catch (e2) { toast('Não deu para entrar'); } } };
    });
  }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  iniciar();
})();
