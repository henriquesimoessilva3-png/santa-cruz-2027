/* 24/10/2026 — corridas sem bola /30 e para a área /30 onde a base do ranking veio vazia (pedido do Henrique:
   "muitos jogadores não têm corrida sem bola /30 e corridas para a área /30 — não dá para buscar na API do SkillCorner?").
   A base só tinha o Game Intelligence das ligas sul-americanas (2.451 de 40 mil). O levantamento (Chrome, SkillCorner logado,
   off-ball runs por edição 2025 e 2025/26, por 30 min com a bola) fica na nuvem em cenarios/_obr, pela id do SkillCorner;
   static/sc_ids.json liga a chave do app (nome - time - liga) à id do SkillCorner (o mesmo casamento do ranking de ago/26).
   Só preenche quem está vazio: onde a base já tem o número, ele continua. */
(function () {
  'use strict';
  const DOC = '_obr', LOCAL = 'sc_obr_v1';
  const CAMPOS = ['obr', 'obr_area', 'obr_hsr', 'obr_per', 'obr_rec', 'obr_rem'];
  let OB = null; try { const l = JSON.parse(localStorage.getItem(LOCAL) || 'null'); if (l && l.sc) OB = l; } catch (e) {}
  let IDS = null, lido = false, aplicado = null, nBase = -1;
  fetch('static/sc_ids.json' + (window.__verDados ? '?v=' + window.__verDados : '')).then(r => (r.ok ? r.json() : null)).then(m => { IDS = m || {}; }).catch(() => { IDS = {}; });
  async function carregar() {
    if (lido) return;
    try {
      if (typeof FB === 'undefined' || !FB.pronto || !FB.usuario || !FB.db) return;
      lido = true;
      const s = await FB.db.collection('cenarios').doc(DOC).get();
      if (s.exists && s.data().sc) { OB = s.data(); try { localStorage.setItem(LOCAL, JSON.stringify(OB)); } catch (e) {} }
    } catch (e) { lido = false; console.warn('corridas sem bola: nuvem indisponível', e); }
  }
  function aplicar() {
    if (!OB || !OB.sc || !IDS || typeof BASE === 'undefined' || !BASE || !BASE.length) return false;
    if (aplicado === OB && nBase === BASE.length) return true;
    const eds = OB.eds || {};
    let n = 0;
    BASE.forEach(j => {
      if (j.obr != null && !j.obr_gi) return;
      const id = IDS[primaryKey(j)]; if (!id) return;
      const r = OB.sc[id]; if (!r) return;
      CAMPOS.forEach((k, i) => { if (typeof r[i] === 'number') j[k] = r[i]; });
      j.obr_gi = { ed: eds[r[8]] || String(r[8] || ''), j: r[6], min: r[7] };
      n++;
    });
    aplicado = OB; nBase = BASE.length;
    if (n) { try { if (typeof dadosMudaram === 'function') dadosMudaram(); if (typeof render === 'function') render(); } catch (e) {} }
    console.log('corridas sem bola (SkillCorner GI): ' + n + ' jogadores preenchidos');
    return true;
  }
  const t0 = Date.now();
  const iv = setInterval(() => { carregar(); const ok = aplicar(); if ((lido && ok && Date.now() - t0 > 20000) || Date.now() - t0 > 180000) clearInterval(iv); }, 1500);
  window.obrRegistro = j => (j && j.obr_gi) || null;
})();
