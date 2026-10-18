/* Ponte das abas de lista (Tipo físico A e B, Bola parada · jogadores…) com a base do app (app.js):
   acha o jogador na BASE pelo nome e clube, dá a letra física dele (a mesma dos cards), abre a ficha
   e leva ao campograma — o MESMO gesto das abas Físico e Fim de contrato (menuLevar / abrirFicha).
   Arquivo próprio; só chama as funções globais do app.js na hora do clique ou da tela (18/10/2026). */
window.JB = (function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const semAc = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  let idx = null, idxSob = null, idxN = -1;
  function indice() {
    /* BASE é um `let` do app.js (não está em window): só pelo nome */
    if (typeof BASE === 'undefined' || !BASE || !BASE.length) return null;
    if (idx && idxN === BASE.length) return idx;
    idx = new Map(); idxSob = new Map(); idxN = BASE.length;
    BASE.forEach(b => { [b.n, b.nc].forEach(k => { const s = semAc(k); if (!s) return; let a = idx.get(s); if (!a) idx.set(s, a = []); if (!a.includes(b)) a.push(b);
      const ult = s.split(' ').pop(); let u = idxSob.get(ult); if (!u) idxSob.set(ult, u = []); if (!u.includes(b)) u.push(b); }); });
    return idx;
  }
  /* nome + clube(s) (+ posição) → registro da BASE; clube desempata, depois a posição, depois Série B e minutos.
     Sem o nome exato (Sofascore "Gabriel Boschilia" × Wyscout "G. Boschilia"): mesmo sobrenome + mesma inicial + mesmo clube. */
  function achar(nome, clubes, pos) {
    const ix = indice(); if (!ix) return null;
    const cl = [].concat(clubes || []).map(semAc).filter(Boolean);
    const bate = b => { const t = semAc(b.t); return cl.some(c => t === c || t.includes(c) || c.includes(t)); };
    let a = ix.get(semAc(nome));
    if (!a || !a.length) {
      const tk = semAc(nome).split(' ').filter(Boolean); if (tk.length < 2) return null;
      const u = (idxSob.get(tk[tk.length - 1]) || []).filter(b => bate(b) && semAc(b.n + ' ' + (b.nc || '')).split(' ').some(x => x[0] === tk[0][0]));
      if (u.length !== 1) return null;
      a = u;
    }
    let r = cl.length ? a.filter(bate) : [];
    if (!r.length) r = a;
    if (pos && r.length > 1) { const rp = r.filter(b => b.p === pos); if (rp.length) r = rp; }
    r = r.slice().sort((x, y) => ((x.l === 'Brasil B') ? 0 : 1) - ((y.l === 'Brasil B') ? 0 : 1) || (y.min || 0) - (x.min || 0));
    return r[0] || null;
  }
  function letra(b) {
    if (!b || typeof tipoLetra !== 'function') return null;
    let j = b; try { if (typeof comFisicoDoEstudo === 'function') j = comFisicoDoEstudo(b) || b; } catch (e) {}
    try {
      const l = tipoLetra(j); if (!l) return null;
      const mais = l === 'A' && typeof tipoMais === 'function' && tipoMais(j);
      return { l: mais ? 'A+' : l, t: typeof tipoNome === 'function' ? (tipoNome(j) || '') : '' };
    } catch (e) { return null; }
  }
  const letraHtml = b => { const x = letra(b); return x ? '<span class="tipo-abc tipo-' + (x.l === 'A+' ? 'Ap' : x.l) + '" title="' + esc(x.t) + '">' + x.l + '</span>' : '<span class="jb-vaz" title="sem físico rastreado">—</span>'; };
  const farolHtml = b => { if (!b || typeof farolDoJogador !== 'function' || !window.VISAO_NOVA) return ''; let j = b; try { if (typeof comFisicoDoEstudo === 'function') j = comFisicoDoEstudo(b) || b; } catch (e) {} const f = farolDoJogador(j); return f ? f.htmlNome : '<span class="jb-vaz" title="sem dado">—</span>'; };
  const nomeHtml = (b, nome) => b ? '<a href="#" class="jb-nome" data-jb-id="' + esc(b.id) + '" title="abrir a ficha dele no campograma">' + esc(nome || b.n) + '</a>' : esc(nome);
  const levarHtml = b => b && typeof primaryKey === 'function' ? '<button class="jb-levar" data-jb-pk="' + esc(primaryKey(b)) + '" title="levar ao campograma (escolhe a posição)">↗</button>' : '';
  function ligar(el) {
    if (!el || el.dataset.jb) return; el.dataset.jb = '1';
    el.addEventListener('click', ev => {
      const n = ev.target.closest('.jb-nome');
      if (n) { ev.preventDefault(); const id = n.dataset.jbId; if (typeof abrirFicha === 'function') { abrirFicha(/^\d+$/.test(id) ? +id : id); irParaAba('campo'); } return; }
      const l = ev.target.closest('.jb-levar');
      if (l) { ev.preventDefault(); if (typeof menuLevar === 'function') menuLevar(ev, l.dataset.jbPk, null, l); }
    });
  }
  return { achar, letra, letraHtml, farolHtml, nomeHtml, levarHtml, ligar, semAc };
})();
