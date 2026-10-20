/* Bola parada do card pelo WYSCOUT (20/10/2026, pedido do Henrique: "total de bolas paradas que o cara cobrou, o total de
   assistências e os gols, bem direto").

   O Wyscout tem, jogo a jogo, por jogador (match_stats): escanteios cobrados (corner), faltas cruzadas (free_kick_cross),
   faltas diretas (direct_free_kick), laterais (throw_in), pênaltis (penalty), assistência de bola parada
   (assist_from_set_piece) e gols depois de escanteio / falta / lateral (goal_after_corner, goal_after_free_kick,
   goal_after_throw_in), de falta direta (free_kick_goal), de pênalti (penalty_goal) e de cabeça (head_goal); e finalizações depois de bola parada
   (shot_after_corner / _free_kick / _throw_in). Coletado no Chrome com o Wyscout logado, por temporada do clube, todas as
   competições oficiais (sem amistoso, seleção e base), para os jogadores dos campogramas. Fica na nuvem: cenarios/_bpwy.

   Quando o jogador tem esse dado, o quadro de bola parada da ficha usa ele; sem, fica o quadro antigo (Sofascore). */
(function () {
  'use strict';
  const DOC = '_bpwy', LOCAL = 'sc_bpwy_v1';
  window.BP_WY = window.BP_WY || null;
  try { const l = JSON.parse(localStorage.getItem(LOCAL) || 'null'); if (l && l.jog) window.BP_WY = l; } catch (e) {}
  let lido = false;
  async function carregar() {
    if (lido) return;
    try {
      if (typeof FB === 'undefined' || !FB.pronto || !FB.usuario || !FB.db) return;
      lido = true;
      const s = await FB.db.collection('cenarios').doc(DOC).get();
      if (s.exists && s.data().jog) { window.BP_WY = s.data(); try { localStorage.setItem(LOCAL, JSON.stringify(window.BP_WY)); } catch (e) {} }
    } catch (e) { lido = false; console.warn('bola parada Wyscout: nuvem indisponível', e); }
  }
  const t0 = Date.now(); const iv = setInterval(() => { carregar(); if (lido || Date.now() - t0 > 120000) clearInterval(iv); }, 1500);

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const R = v => (typeof v === 'number' ? Math.round(v).toLocaleString('pt-BR') : '—');
  function registro(j) {
    const B = window.BP_WY && window.BP_WY.jog; if (!B || !j) return null;
    let pk = j.pk; try { pk = pk || primaryKey(j); } catch (e) {}
    return B[pk] || (j.nc && B[j.nc + ' - ' + (j.t || '') + ' - Manual']) || B[(j.n || '') + ' - ' + (j.t || '') + ' - Manual'] || null;
  }
  window.bpWyRegistro = registro;

  function painel(j, r) {
    const T = (typeof HIST !== 'undefined' && HIST && HIST.temporadas) || ['2024', '2025', '2026'];
    let x = null; try { x = csRegistro(j); } catch (e) {}
    const z = t => (r.a && r.a[t]) || null;
    const S = (o, ks) => ks.reduce((s, k) => s + ((o && o[k]) || 0), 0);
    const tot = {}; const somaTot = (k, v) => { tot[k] = (tot[k] || 0) + v; };
    const linhas = T.map(t => {
      const o = z(t); if (!o) return { t, vazio: true };
      const L = { t, c: o.c || 0, fc: o.fc || 0, fd: o.fd || 0, ti: o.ti || 0, pe: o.pe || 0, abp: o.abp || 0,
        ge: o.ge || 0, gf: o.gf || 0, gd: o.gd || 0, gl: o.gl || 0, cs: (o.cs || 0) + (o.fs || 0), gp: o.gp || 0, gh: o.gh || 0, fin: S(o, ['sc', 'sf', 'st']), j: o.j || 0 };
      L.cob = L.c + L.fc + L.fd + L.pe; L.gbp = L.ge + L.gf + L.gd + L.gl;
      ['c', 'fc', 'fd', 'ti', 'pe', 'cob', 'abp', 'cs', 'ge', 'gf', 'gd', 'gl', 'gp', 'gh', 'gbp', 'fin', 'j'].forEach(k => somaTot(k, L[k]));
      return L;
    });
    const td = (v, forte, tit) => '<td class="n"' + (tit ? ' title="' + esc(tit) + '"' : '') + '>' + (forte ? '<b>' + R(v) + '</b>' : R(v)) + '</td>';
    const vaz = n => '<td colspan="' + n + '" class="vazio">sem jogo no Wyscout</td>';
    const corP = v => (v == null ? 'n' : v >= 80 ? 'v' : v >= 65 ? 'a' : 'n');
    const cob = x && x.cob;
    const notaC = 'Wyscout, jogo a jogo, todas as competições oficiais da temporada do clube (sem amistoso, seleção e base). Cobranças = escanteios + faltas cruzadas na área + faltas diretas (chute ao gol) + pênaltis. Laterais ficam à parte e não entram no total (o Wyscout conta todo lateral, não só o lateral longo). Assistência de bola parada = a assistência que o Wyscout marca como de bola parada.' + (cob != null ? ' Percentil de cobrador na liga dele: ' + cob + '.' : '');
    const cardC = '<div class="fi-res" title="' + esc(notaC) + '"><span class="fi-res-l sel-' + (tot.abp >= 6 ? 'v' : tot.abp >= 2 ? 'a' : corP(cob)) + ' sf-res-pct">' + R(tot.cob || 0) + '</span>' +
      '<div><b>Cobrador: ' + R(tot.cob || 0) + ' cobranças · ' + R(tot.abp || 0) + (tot.abp === 1 ? ' assistência' : ' assistências') + ' de bola parada</b><small>3 anos · ' +
      R(tot.c || 0) + ' escanteios · ' + R((tot.fc || 0) + (tot.fd || 0)) + ' faltas · ' + R(tot.pe || 0) + ' pênaltis · ' + R(tot.cs || 0) + ' cobranças que viraram finalização' + (cob != null ? ' · melhor que ' + cob + '% da liga' : '') + '</small></div></div>';
    const tabC = '<table class="sf-tab"><thead><tr><th>Ano</th><th class="n">Escant.</th><th class="n" title="falta lateral cobrada com cruzamento na área">Falta cruzada</th><th class="n">Falta direta</th><th class="n">Pênalti</th><th class="n" title="laterais cobrados (não entram no total)">Laterais</th><th class="n">Total</th><th class="n">Assist. BP</th></tr></thead><tbody>' +
      linhas.map(L => '<tr' + (L.vazio ? ' class="vazio"' : '') + '><td>' + L.t + '</td>' + (L.vazio ? vaz(7) : td(L.c) + td(L.fc) + td(L.fd) + td(L.pe) + td(L.ti) + td(L.cob, true) + td(L.abp, true)) + '</tr>').join('') + '</tbody>' +
      '<tfoot><tr><td>Total</td>' + ['c', 'fc', 'fd', 'pe', 'ti', 'cob', 'abp'].map(k => '<td class="n">' + (k === 'cob' || k === 'abp' ? '<b>' + R(tot[k] || 0) + '</b>' : R(tot[k] || 0)) + '</td>').join('') + '</tr></tfoot></table>';
    const aer = x && x.aer;
    const notaF = 'Gols de bola parada = gols depois de escanteio, de falta cruzada, de falta direta ou de lateral, pelo Wyscout; pênalti à parte. Finalizações = chutes depois de escanteio, falta ou lateral.' + (aer != null ? ' Jogo aéreo no ataque: melhor que ' + aer + '% da liga.' : '');
    const cardF = '<div class="fi-res" title="' + esc(notaF) + '"><span class="fi-res-l sel-' + (tot.gbp >= 3 ? 'v' : tot.gbp >= 1 ? 'a' : 'n') + ' sf-res-pct">' + R(tot.gbp || 0) + '</span>' +
      '<div><b>Finalizador: ' + R(tot.gbp || 0) + (tot.gbp === 1 ? ' gol' : ' gols') + ' de bola parada</b><small>3 anos · ' + R(tot.fin || 0) + ' finalizações depois de bola parada · ' + R(tot.gh || 0) + ' gols de cabeça · ' + R(tot.gp || 0) + ' de pênalti' +
      (aer != null ? ' · jogo aéreo melhor que ' + aer + '% da liga' : '') + '</small></div></div>';
    const tabF = '<table class="sf-tab"><thead><tr><th>Ano</th><th class="n">Escant.</th><th class="n" title="depois de falta cruzada/lateral">Falta</th><th class="n">Falta direta</th><th class="n">Lateral</th><th class="n">Total BP</th><th class="n" title="finalizações depois de escanteio, falta ou lateral">Finaliz.</th><th class="n">Pênalti</th></tr></thead><tbody>' +
      linhas.map(L => '<tr' + (L.vazio ? ' class="vazio"' : '') + '><td>' + L.t + '</td>' + (L.vazio ? vaz(7) : td(L.ge) + td(L.gf) + td(L.gd) + td(L.gl) + td(L.gbp, true) + td(L.fin) + td(L.gp)) + '</tr>').join('') + '</tbody>' +
      '<tfoot><tr><td>Total</td>' + ['ge', 'gf', 'gd', 'gl', 'gbp', 'fin', 'gp'].map(k => '<td class="n">' + (k === 'gbp' ? '<b>' + R(tot[k] || 0) + '</b>' : R(tot[k] || 0)) + '</td>').join('') + '</tr></tfoot></table>';
    return '<div class="sf-painel bp-2"><div class="bp-g">' + cardC + tabC + '</div><div class="bp-g">' + cardF + tabF + '</div></div>';
  }
  const antigo = window.painelBolaParada;
  if (typeof antigo === 'function') {
    window.painelBolaParada = function (j) {
      try { const r = registro(j); if (r && r.a && Object.keys(r.a).length) return painel(j, r); } catch (e) { console.warn('bola parada Wyscout', e); }
      return antigo.apply(this, arguments);
    };
  }
})();
