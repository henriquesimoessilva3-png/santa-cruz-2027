/* 25/10/2026 — foto da ficha quando o Transfermarkt não tem (pedido do Henrique: "em vários jogadores não está saindo a foto").
   O banco do Transfermarkt vem sem foto em ~40% dos jogadores (8,3 mil de 20,5 mil): o próprio site não tem a foto deles
   (ex.: Dani Borges, Santa Clara). O Wyscout costuma ter. Ordem: 1) foto da busca automática salva no jogador;
   2) foto já achada antes (nuvem: cenarios/_fotos); 3) com a extensão BFR Busca Jogador, procura no Wyscout pelo nome e
   aceita só quem tem o mesmo nascimento (ou, sem nascimento, o único do mesmo clube) — e guarda na nuvem para todos. */
(function () {
  'use strict';
  const DOC = '_fotos', LOCAL = 'sc_fotos_v1', EXT = 'fcononaeoamnokalfgbedngkbddmiljj';
  let F = {}; try { F = JSON.parse(localStorage.getItem(LOCAL) || '{}') || {}; } catch (e) {}
  let lido = false; const tentado = new Set();
  async function carregar() {
    if (lido) return;
    try {
      if (typeof FB === 'undefined' || !FB.pronto || !FB.usuario || !FB.db) return;
      lido = true;
      const s = await FB.db.collection('cenarios').doc(DOC).get();
      if (s.exists && s.data().f) { F = Object.assign({}, s.data().f, F); try { localStorage.setItem(LOCAL, JSON.stringify(F)); } catch (e) {} }
    } catch (e) { lido = false; }
  }
  function guardar(pk, url) {
    F[pk] = url; try { localStorage.setItem(LOCAL, JSON.stringify(F)); } catch (e) {}
    try { if (FB && FB.db && FB.usuario) FB.db.collection('cenarios').doc(DOC).set({ f: { [pk]: url } }, { merge: true }); } catch (e) {}
  }
  const ext = msg => new Promise(res => {
    if (!(window.chrome && chrome.runtime && chrome.runtime.sendMessage)) return res(null);
    try { chrome.runtime.sendMessage(EXT, msg, r => { if (chrome.runtime.lastError || !r) res(null); else res(r); }); } catch (e) { res(null); }
  });
  function pinta(el, url) {
    if (!el || !url || !el.isConnected) return;
    const img = document.createElement('img'); img.className = 'fi-foto'; img.alt = ''; img.referrerPolicy = 'no-referrer'; img.title = 'foto: Wyscout';
    img.onload = () => { if (el.isConnected) el.replaceWith(img); };
    img.src = url;
  }
  async function resolver() {
    const el = document.querySelector('#ficha .fi-foto.vazia:not(#fiCmpB .fi-foto)');
    if (!el || typeof fichaAtual === 'undefined' || !fichaAtual) return;
    const j = fichaAtual; let pk = j.pk; try { pk = pk || primaryKey(j); } catch (e) {}
    if (!pk || el.dataset.fotoPk === pk) return; el.dataset.fotoPk = pk;
    let dc = null; try { dc = j.dados && j.dados.auto ? j.dados : (typeof dadosColados === 'function' ? dadosColados(pk, null) : null); } catch (e) {}
    const au = dc && dc.auto;
    if (au && au.foto) return pinta(el, au.foto);
    await carregar();
    if (F[pk]) return pinta(el, F[pk]);
    if (tentado.has(pk)) return; tentado.add(pk);
    let pf = null; try { pf = await perfilExtraDe(j); } catch (e) {}
    const nasc = (pf && pf.nasc) || (au && au.nasc) || '';
    const nomes = [j.nc, j.n].map(x => String(x || '').replace(/\s*\(.*?\)\s*/g, ' ').trim()).filter((x, i, a) => x && a.indexOf(x) === i);
    for (const nome of nomes) {
      const r = await ext({ tipo: 'wy_foto', nome, nasc, clube: /^(livre|sem clube)$/i.test(j.t || '') ? '' : (j.t || ''), idade: j.id_ || 0 });
      if (r && r.foto) { guardar(pk, r.foto); return pinta(document.querySelector('#ficha .fi-foto.vazia:not(#fiCmpB .fi-foto)') || el, r.foto); }
      if (!r) return;   /* sem extensão: fica a inicial */
    }
  }
  let t = null;
  const obs = new MutationObserver(() => { clearTimeout(t); t = setTimeout(resolver, 250); });
  function ligar() { const f = document.getElementById('ficha'); if (f) obs.observe(f, { childList: true, subtree: true }); else setTimeout(ligar, 1000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
  const t0 = Date.now(); const iv = setInterval(() => { carregar(); if (lido || Date.now() - t0 > 120000) clearInterval(iv); }, 2000);
  window.fotoExtra = pk => F[pk] || null;
})();
