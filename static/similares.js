/* 27/10/2026 — "jogadores similares" na ficha (pedido do Henrique: "escolher um jogador e procurar um similar, na parte física
   e técnica, com as marcações: quantos indicadores ele passa, se é A+, A, B ou C, e a similaridade nos indicadores que ele tem,
   principalmente os positivos, os acima da média").

   Como mede (tudo contra a Série B da posição, a mesma régua da ficha):
   - cada indicador vira desvio (z) contra a média e o desvio-padrão da Série B na posição; faltas e cartões com o sinal trocado;
   - POSITIVOS do alvo = os indicadores em que ele está acima da média da Série B;
   - "passa" = o candidato também está acima da média naquele positivo do alvo (contado no físico e no técnico);
   - proximidade = o quanto os desvios dos dois se parecem em todos os indicadores que os dois têm;
   - similaridade = 60% os positivos que ele repete + 40% a proximidade, com físico e técnico pesando metade cada.
   Físico: SkillCorner da base (com o colado/busca automática por cima). Técnico: o arquivo de indicadores da posição (Wyscout). */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = s => document.querySelector(s);
  const GEMEAS = { ED: ['ED', 'EE'], EE: ['EE', 'ED'], ZD: ['ZD', 'ZE'], ZE: ['ZE', 'ZD'] };
  const NOME = { LD: 'Lateral-direito', LE: 'Lateral-esquerdo', ZD: 'Zagueiro', ZE: 'Zagueiro', VOL: 'Volante', MED: 'Médio', MEI: 'Meia', ED: 'Ponta-direita', EE: 'Ponta-esquerda', CA: 'Centroavante' };
  const menor = n => (typeof menorMelhorInd === 'function' ? menorMelhorInd(n) : /falta|foul|amarel|yellow|cart/i.test(n));
  const FIS = () => (typeof FIS_GRUPOS !== 'undefined' ? FIS_GRUPOS : []).flatMap(([, rows]) => rows.map(([k, rot]) => ({ k, rot }))).filter(x => !/^(min|sc_n)$/.test(x.k));

  function comDados(j) {
    try { if (typeof objDoRaio === 'function') { const o = objDoRaio(primaryKey(j), null, j).obj; if (o) return o; } } catch (e) {}
    try { const r = typeof registroComDados === 'function' ? registroComDados(j) : j; return (typeof comFisicoDoEstudo === 'function' ? comFisicoDoEstudo(r) : r) || r; } catch (e) { return j; }
  }
  function kpisArq(pos) {
    if (!cachePosKpis[pos]) cachePosKpis[pos] = fetch('dados/kpis/' + pos + '.json' + (window.__verDados ? '?v=' + window.__verDados : '')).then(r => (r.ok ? r.json() : null)).catch(() => null);
    return Promise.resolve(cachePosKpis[pos]);
  }
  const tecMemo = {};
  async function tecDe(pos) {
    if (tecMemo[pos]) return tecMemo[pos];
    const b = await kpisArq(pos); if (!b) return (tecMemo[pos] = { porPk: new Map(), nomes: [] });
    const porPk = new Map();
    for (const pk in b.jogadores) { const o = {}; b.jogadores[pk].forEach(([id, v]) => { const nm = b.kpis[id]; if (nm && typeof v === 'number' && isFinite(v)) o[nm[1]] = v; }); porPk.set(pk, o); }
    return (tecMemo[pos] = { porPk, nomes: b.kpis.map(x => x[1]) });
  }
  function regua(vals) {   /* média e desvio-padrão */
    const v = vals.filter(x => typeof x === 'number' && isFinite(x)); if (v.length < 8) return null;
    const m = v.reduce((s, x) => s + x, 0) / v.length; const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) * (x - m), 0) / v.length);
    return sd > 0 ? { m, sd } : null;
  }

  async function calcular(alvo, opts) {
    const posAlvo = alvo.p, posBusca = opts.pos || posAlvo;
    const poss = opts.lados && GEMEAS[posBusca] ? GEMEAS[posBusca] : [posBusca];
    const A = comDados(alvo), pkA = primaryKey(alvo);
    /* técnico do alvo: o arquivo da posição dele */
    const TA = await tecDe(posAlvo); let tecA = TA.porPk.get(pkA) || {};
    /* técnico colado / da busca automática (jogador fora do arquivo da posição ou com o export mais novo) vale por cima */
    try {
      const dc = typeof dadosColados === 'function' ? dadosColados(pkA, null) : null;
      if (dc && dc.tec_raw && typeof kpisColados === 'function') { const r = await kpisColados(alvo, dc, 'liga');
        if (r && r.ok && r.linhas) { const o = {}; r.linhas.forEach(([id, v]) => { const nm = r.nomes[id]; if (nm && typeof v === 'number' && isFinite(v)) o[nm[1]] = v; }); if (Object.keys(o).length) tecA = o; } }
    } catch (e) {}
    const TB = {}; for (const p of poss) TB[p] = await tecDe(p);
    /* réguas da Série B da posição buscada */
    const cands = BASE.filter(j => poss.includes(j.p) && primaryKey(j) !== pkA);
    const serieB = cands.filter(j => j.l === 'Brasil B');
    const fis = FIS().map(f => ({ ...f, tipo: 'fis', r: regua(serieB.map(j => j[f.k])) })).filter(f => f.r);
    const nomesTec = new Set(); poss.forEach(p => TB[p].nomes.forEach(n => nomesTec.add(n)));
    const tec = [...nomesTec].map(n => { const vs = []; poss.forEach(p => TB[p].porPk.forEach((o, pk) => { if (pk.endsWith(' - Brasil B') && o[n] != null) vs.push(o[n]); })); return { k: n, rot: n, tipo: 'tec', r: regua(vs) }; }).filter(f => f.r);
    const z = (f, v) => (typeof v !== 'number' || !isFinite(v)) ? null : ((v - f.r.m) / f.r.sd) * (menor(f.k) ? -1 : 1);
    const vA = f => (f.tipo === 'fis' ? A[f.k] : tecA[f.k]);
    const inds = fis.concat(tec).map(f => ({ ...f, zA: z(f, vA(f)) })).filter(f => f.zA != null);
    const pos = inds.filter(f => f.zA > 0);
    const nota = (j0, j) => {
      const tecC = (TB[j0.p] && TB[j0.p].porPk.get(primaryKey(j0))) || {};
      const vC = f => (f.tipo === 'fis' ? j[f.k] : tecC[f.k]);
      let passaF = 0, totF = 0, passaT = 0, totT = 0, comDadoPos = 0;
      const px = { fis: [0, 0], tec: [0, 0] };
      for (const f of inds) { const zc = z(f, vC(f)); if (zc == null) continue; px[f.tipo][0] += Math.max(0, 1 - Math.abs(zc - f.zA) / 2); px[f.tipo][1]++; }
      const nProx = px.fis[1] + px.tec[1];
      for (const f of pos) {
        const zc = z(f, vC(f)); if (f.tipo === 'fis') totF++; else totT++;
        if (zc == null) continue; comDadoPos++;
        if (zc > 0) { if (f.tipo === 'fis') passaF++; else passaT++; }
      }
      if (!pos.length || comDadoPos < pos.length * 0.5 || nProx < 6) return null;
      /* físico e técnico pesam igual (o técnico tem três vezes mais indicadores e engolia o físico) */
      const media = arr => { const v = arr.filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; };
      const cob = media([totF ? passaF / totF : null, totT ? passaT / totT : null]);
      const prox = media([px.fis[1] ? px.fis[0] / px.fis[1] : null, px.tec[1] ? px.tec[0] / px.tec[1] : null]);
      return { j: j0, sim: Math.round(100 * (0.6 * cob + 0.4 * prox)), passaF, totF, passaT, totT, prox };
    };
    let res = [];
    for (const j0 of cands) {
      if (opts.br && typeof ehEstrangeiroBase === 'function' && ehEstrangeiroBase(j0)) continue;
      if (opts.idMax && j0.id_ && j0.id_ > opts.idMax) continue;
      if (opts.liga === 'br' && !/^Brasil/.test(j0.l || '')) continue;
      if (opts.liga === 'fora' && /^Brasil/.test(j0.l || '')) continue;
      if (opts.minMin && (Number(j0.min) || 0) < opts.minMin) continue;
      const x = nota(j0, j0); if (x) res.push(x);
    }
    /* os 200 primeiros são refeitos com o físico atualizado (colado, busca automática, estudo) — o mesmo da ficha */
    res.sort((a, b) => b.sim - a.sim);
    res = res.slice(0, 200).map(x => nota(x.j, comDados(x.j)) || x).concat(res.slice(200));
    res.sort((a, b) => b.sim - a.sim);
    return { res, pos, inds, posBusca, poss };
  }

  /* ---------- tela ---------- */
  let ESTADO = { pos: '', lados: true, br: false, idMax: 0, liga: '', letra: '', minMin: 600 };
  function painel() {
    let p = $('#simPainel'); if (p) return p;
    p = document.createElement('div'); p.id = 'simPainel'; p.className = 'sim-painel oculta';
    p.innerHTML = '<div class="sim-caixa"><div class="sim-topo"><b id="simTit">Jogadores similares</b><button class="bt mini" id="simX">✕</button></div>' +
      '<div class="sim-filtros"><select id="simPos"></select><label><input type="checkbox" id="simLados"> os dois lados</label>' +
      '<select id="simLetra"><option value="">Letra: todas</option><option value="A">A ou A+</option><option value="Ap">só A+</option><option value="B">B ou melhor</option></select>' +
      '<select id="simLiga"><option value="">Todas as ligas</option><option value="br">Só Brasil</option><option value="fora">Fora do Brasil</option></select>' +
      '<label><input type="checkbox" id="simBr"> só brasileiros</label><label>idade até <input type="number" id="simId" min="16" max="45" placeholder="—"></label>' +
      '<label>min. ≥ <input type="number" id="simMin" min="0" step="100"></label></div>' +
      '<div id="simAlvo" class="sim-alvo"></div><div id="simLista" class="sim-lista"></div></div>';
    document.body.appendChild(p);
    p.querySelector('#simX').onclick = () => p.classList.add('oculta');
    p.addEventListener('click', e => { if (e.target === p) p.classList.add('oculta'); });
    const sel = p.querySelector('#simPos');
    sel.innerHTML = Object.keys(NOME).map(k => '<option value="' + k + '">' + (typeof sig === 'function' ? sig(k) : k) + ' · ' + NOME[k] + '</option>').join('');
    const muda = () => { ESTADO = { pos: sel.value, lados: p.querySelector('#simLados').checked, br: p.querySelector('#simBr').checked, idMax: +p.querySelector('#simId').value || 0,
      liga: p.querySelector('#simLiga').value, letra: p.querySelector('#simLetra').value, minMin: +p.querySelector('#simMin').value || 0 }; rodar(); };
    p.querySelectorAll('select,input').forEach(el => { el.addEventListener('change', muda); });
    p.querySelector('#simLista').addEventListener('click', e => {
      const b = e.target.closest('[data-sim-cmp]'); if (b) { const j = BASE.find(x => String(x.id) === b.dataset.simCmp); if (j && window.compararCom) { p.classList.add('oculta'); window.compararCom(j); } return; }
      const a = e.target.closest('[data-sim-ficha]'); if (a) { e.preventDefault(); const id = a.dataset.simFicha; p.classList.add('oculta'); if (typeof abrirFicha === 'function') abrirFicha(/^\d+$/.test(id) ? +id : id); }
    });
    return p;
  }
  const letraOk = (l, f) => !f || (f === 'Ap' ? l === 'A+' : f === 'A' ? (l === 'A' || l === 'A+') : f === 'B' ? (l && l !== 'C') : true);
  const fmtZ = z => (z >= 0 ? '+' : '') + z.toFixed(1).replace('.', ',');
  let corrida = 0;
  async function rodar() {
    const alvo = typeof fichaAtual !== 'undefined' ? fichaAtual : null; const p = painel(); if (!alvo) return;
    const meu = ++corrida;
    p.querySelector('#simLista').innerHTML = '<div class="sim-dica">⏳ comparando com os jogadores da posição…</div>';
    await new Promise(r => setTimeout(r, 30));
    const R = await calcular(alvo, ESTADO); if (meu !== corrida) return;
    const posF = R.pos.filter(f => f.tipo === 'fis'), posT = R.pos.filter(f => f.tipo === 'tec');
    const chip = f => '<span class="sim-chip ' + f.tipo + '" title="' + esc(fmtZ(f.zA)) + ' desvio sobre a média da Série B">' + esc(f.rot) + '</span>';
    p.querySelector('#simTit').textContent = 'Jogadores similares a ' + (alvo.n || '') + ' · ' + (NOME[R.posBusca] || R.posBusca);
    p.querySelector('#simAlvo').innerHTML = '<div><b>' + R.pos.length + '</b> indicadores positivos dele (acima da média da Série B): <b>' + posF.length + '</b> físicos e <b>' + posT.length + '</b> técnicos — é o que o similar precisa repetir.</div>' +
      '<div class="sim-chips">' + posF.sort((a, b) => b.zA - a.zA).map(chip).join('') + posT.sort((a, b) => b.zA - a.zA).slice(0, 18).map(chip).join('') + (posT.length > 18 ? '<span class="sim-mais">+' + (posT.length - 18) + '</span>' : '') + '</div>';
    if (!R.pos.length) { p.querySelector('#simLista').innerHTML = '<div class="sim-dica">Sem indicadores dele nas bases para comparar.</div>'; return; }
    /* letra e seta só para os primeiros (é o que pesa) */
    const linhas = [];
    let vistos = 0;
    for (const x of R.res) {
      if (linhas.length >= 40 || ++vistos > 500) break;
      let L = null; try { L = window.JB ? JB.letra(comDados(x.j)) : null; } catch (e) {}
      if (!letraOk(L && L.l, ESTADO.letra)) continue;
      x.L = L; linhas.push(x);
    }
    const letraH = L => L ? '<span class="tipo-abc tipo-' + (L.l === 'A+' ? 'Ap' : L.l) + '" title="' + esc(L.t || '') + '">' + L.l + '</span>' : '<span class="sim-vaz" title="sem físico rastreado">—</span>';
    const seta = j => { try { return window.subidaSelo ? window.subidaSelo(j) : ''; } catch (e) { return ''; } };
    const pc = (a, b) => b ? '<b>' + a + '</b>/' + b : '—';
    p.querySelector('#simLista').innerHTML = !linhas.length ? '<div class="sim-dica">Nenhum jogador com esses filtros.</div>' :
      '<table class="sim-tab"><thead><tr><th>Jogador</th><th>Clube · liga</th><th class="n">Idade</th><th title="tipo físico">Letra</th><th title="seta técnica">Seta</th>' +
      '<th class="n" title="positivos físicos do alvo em que ele também está acima da média">Físico</th><th class="n" title="positivos técnicos do alvo em que ele também está acima da média">Técnico</th>' +
      '<th class="n" title="60% os positivos que ele repete + 40% a proximidade dos desvios em todos os indicadores">Similaridade</th><th></th></tr></thead><tbody>' +
      linhas.map(x => { const j = x.j, c = x.sim >= 70 ? 'v' : x.sim >= 55 ? 'a' : 'n';
        return '<tr><td><a href="#" data-sim-ficha="' + esc(j.id) + '"><b>' + esc(j.n) + '</b></a></td><td>' + esc(j.t || '') + ' <span class="sim-liga">· ' + esc(j.l || '') + '</span></td>' +
          '<td class="n">' + (j.id_ || '—') + '</td><td>' + letraH(x.L) + '</td><td>' + seta(j) + '</td><td class="n">' + pc(x.passaF, x.totF) + '</td><td class="n">' + pc(x.passaT, x.totT) + '</td>' +
          '<td class="n"><span class="sim-pct sim-' + c + '">' + x.sim + '%</span></td><td><button class="bt mini" data-sim-cmp="' + esc(j.id) + '" title="abrir a comparação lado a lado na ficha">⇆ comparar</button></td></tr>'; }).join('') + '</tbody></table>' +
      '<div class="sim-nota">Régua: média e desvio da Série B na posição. Positivos = acima da média (faltas e cartões: abaixo). Físico: SkillCorner · técnico: Wyscout (arquivo da posição). ' + R.res.length + ' jogadores comparados.</div>';
  }
  function abrir() {
    const alvo = typeof fichaAtual !== 'undefined' ? fichaAtual : null; if (!alvo) return;
    const p = painel(); const sel = p.querySelector('#simPos');
    let pos = alvo.p; try { const c = comPosCampo(alvo); if (c && c.p && NOME[c.p]) pos = c.p; } catch (e) {}
    if (!NOME[pos]) pos = 'VOL';
    sel.value = pos; ESTADO.pos = pos; p.querySelector('#simLados').checked = ESTADO.lados; p.querySelector('#simMin').value = ESTADO.minMin || '';
    p.classList.remove('oculta'); rodar();
  }
  /* botão na ficha, ao lado do "comparar com jogador" */
  function botao() {
    if (typeof fichaAtual === 'undefined' || !fichaAtual || fichaAtual.p === 'GOL') return;
    if (document.getElementById('fiSimBt')) return;
    const ref = document.getElementById('fiCmpBox') || document.getElementById('fiComp') || document.getElementById('fiDados'); if (!ref) return;
    const b = document.createElement('button'); b.id = 'fiSimBt'; b.className = 'bt mini'; b.textContent = '≈ similares';
    b.title = 'Procura jogadores parecidos com este no físico e no técnico (os indicadores em que ele está acima da média da Série B)';
    b.onclick = abrir; ref.insertAdjacentElement('afterend', b);
  }
  let t = null; const obs = new MutationObserver(() => { clearTimeout(t); t = setTimeout(botao, 200); });
  function ligar() { const f = document.getElementById('ficha'); if (f) obs.observe(f, { childList: true, subtree: true }); else setTimeout(ligar, 1000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
  window.simCalcular = calcular;
})();
