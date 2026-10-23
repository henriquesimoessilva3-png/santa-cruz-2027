/* 23/10/2026 — carreira do oGol na minutagem (pedido do Henrique: "o oGol é mais dedicado que o Wyscout, ano a ano").
   O levantamento (Chrome, jogadores dos campogramas: busca no oGol, confere pela data de nascimento ou pelo clube + idade,
   lê a tabela "Histórico") fica na nuvem em cenarios/_ogol. Aqui ele entra no histórico do app (HIST) por cima de dois
   buracos do Wyscout, sem mexer no resto:
     1. ano sem registro no Wyscout → jogos, gols e assistências do oGol (sem minutos; marcado "oGol" na tabela);
     2. ano em que o time tem menos de 8 jogos no Wyscout (cobertura curta, ex.: Coreia B 2024 com 1 jogo) → o oGol.
   Onde o Wyscout tem o ano completo, ele continua mandando (tem minutos; o oGol só tem jogos). */
(function () {
  'use strict';
  const DOC = '_ogol', LOCAL = 'sc_ogol_v1';
  let OG = null; try { const l = JSON.parse(localStorage.getItem(LOCAL) || 'null'); if (l && l.jog) OG = l; } catch (e) {}
  let lido = false, aplicado = null;
  async function carregar() {
    if (lido) return;
    try {
      if (typeof FB === 'undefined' || !FB.pronto || !FB.usuario || !FB.db) return;
      lido = true;
      const s = await FB.db.collection('cenarios').doc(DOC).get();
      if (s.exists && s.data().jog) { OG = s.data(); try { localStorage.setItem(LOCAL, JSON.stringify(OG)); } catch (e) {} }
    } catch (e) { lido = false; console.warn('oGol: nuvem indisponível', e); }
  }
  function aplicar() {
    if (!OG || !OG.jog || typeof HIST === 'undefined' || !HIST || !HIST.jogadores) return false;
    if (aplicado === OG) return true;
    const T = HIST.temporadas || ['2024', '2025', '2026'];
    let n = 0;
    Object.entries(OG.jog).forEach(([pk, r]) => {
      const temps = r && r.temporadas; if (!temps) return;
      const h = HIST.jogadores[pk] ? HIST.jogadores[pk].slice() : T.map(() => null);
      let mudou = false;
      T.forEach((t, i) => {
        const o = temps[t]; if (!o || !(o.j > 0)) return;
        const e = h[i];
        const vazio = !e || !(e.min || e.j);
        const curto = e && e.fonte !== 'ogol' && e.tj && e.tj < 8;
        if (!vazio && !curto) return;
        h[i] = { t, tm: o.tm || '', l: '', j: o.j, g: o.g || 0, a: o.a || 0, fonte: 'ogol', src: 'oGol', wy: curto ? { j: e.j, min: e.min, tj: e.tj } : undefined };
        mudou = true; n++;
      });
      if (mudou) HIST.jogadores[pk] = h;
    });
    aplicado = OG;
    if (n) { try { if (typeof dadosMudaram === 'function') dadosMudaram(); if (typeof render === 'function') render(); } catch (e) {} }
    console.log('oGol: ' + n + ' temporadas entraram no histórico');
    return true;
  }
  const t0 = Date.now();
  const iv = setInterval(() => { carregar(); const ok = aplicar(); if ((lido && ok) || Date.now() - t0 > 180000) clearInterval(iv); }, 1500);
  window.ogolRegistro = j => { try { return OG && OG.jog && OG.jog[j.pk || primaryKey(j)] || null; } catch (e) { return null; } };
})();
