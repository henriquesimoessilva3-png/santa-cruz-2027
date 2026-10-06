/* Aba "Subida" — quem, no mercado, cumpre os mínimos do titular de quem SOBE na Série B, posição a posição,
   com físico (SkillCorner) e técnico (Wyscout) na mesma matriz: quem sobe, quem cai e os jogadores escolhidos.
   Também desenha, dentro da ficha do jogador (app.js → montarFicha), o quadro "Quem sobe × quem cai".
   Dado: static/subida_dados.js (gerar_subida_js.py). Arquivo próprio; um observador acompanha o botão da aba. */
(function () {
  'use strict';
  const D = window.SUBIDA;
  const LS = 'sc2027_subida';
  const NC = D ? D.campos.length : 11;                      // campos de cadastro antes dos indicadores
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (x, d) => x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const SIG = { LD: 'RB', ZD: 'RCB', ZE: 'LCB', LE: 'LB', VOL: 'DM', MED: 'CM', MEI: 'AM', ED: 'RW', EE: 'LW', CA: 'CF' };
  const CATS = [['pri', 'Principais (os que mais separam)'], ['nuc', 'Núcleo (o mínimo do mínimo)'], ['fis', 'Físico'], ['pas', 'Passe'], ['atq', 'Ataque'], ['def', 'Defesa'], ['all', 'Completo (todos)']];
  const SA = ['Argentina A', 'Argentina B', 'Colombia A', 'Colombia B', 'Equador A', 'Equador B', 'Paraguai', 'Uruguai', 'Chile', 'Peru', 'Bolivia', 'Venezuela'];
  const ALVO = ['Argentina A', 'Argentina B', 'Paraguai', 'Colombia A', 'Colombia B', 'Equador A', 'Equador B'];
  const GRUPOS = [['', 'Todas as ligas'], ['@b', 'Série B'], ['@ab', 'Brasil A + B'], ['@alvo', 'Argentina, Paraguai, Colômbia e Equador'],
    ['@balvo', 'Série B + Argentina, Paraguai, Colômbia e Equador'], ['@sa', 'América do Sul (sem Brasil)']];
  const noGrupo = (g, l) => !g ? true : g === '@b' ? l === 'Brasil B' : g === '@ab' ? (l === 'Brasil A' || l === 'Brasil B') : g === '@alvo' ? ALVO.includes(l)
    : g === '@balvo' ? (l === 'Brasil B' || ALVO.includes(l)) : g === '@sa' ? SA.includes(l) : l === g;

  const F0 = { liga: '', nac: '', idade: '', ate: '', valor: '', minutos: '', fis: false };
  let E = { pos: 'VOL', perfil: 'pri', mins: null, tol: 80, soPerfil: false, fech: {}, topN: 5, f: Object.assign({}, F0), sel: {}, perfis: [] };
  try { const g = JSON.parse(localStorage.getItem(LS) || 'null'); if (g) { E = Object.assign(E, g); E.f = Object.assign({}, F0, g.f || {}); } } catch (e) {}
  if (D && !D.posicoes[E.pos]) E.pos = 'VOL';
  /* a matriz passou a abrir com TODOS os indicadores (05/10): quem tinha o estado antigo gravado volta ao padrão novo uma vez */
  if (!E.v2) { E.soPerfil = false; E.fech = {}; E.v2 = 1; }
  E.fech = E.fech || {};
  const grava = () => { try { localStorage.setItem(LS, JSON.stringify(E)); } catch (e) {} };

  /* ---- régua ---- */
  const ref = (pos, k) => (D.posicoes[pos].ref[k] || null);
  /* lado de quem sobe: "menor é melhor" (faltas, cartões) ou indicador em que quem sobe tem menos */
  function paraBaixo(i, r) { return i.menor || (r && r[0] != null && r[1] != null && r[0] < r[1]); }
  /* v = no perfil de quem sobe · a = entre quem cai e quem sobe · r = do lado de quem cai */
  function cor(i, r, v) {
    if (v == null || !r || r[0] == null) return '';
    const s = r[0], c = r[1], bx = paraBaixo(i, r);
    if (bx ? v <= s : v >= s) return 'v';
    if (c == null) return 'r';
    return (bx ? v < c : v > c) ? 'a' : 'r';
  }
  /* mínimos de fábrica de um perfil: a mediana de quem sobe onde quem sobe tem mais; faltas e cartões viram máximo;
     o físico entra inteiro; volume de duelo fica fora (critério do Wyscout mudou) */
  /* "Principais": só os indicadores que mais separam quem sobe de quem cai (0,30 desvio ou mais, sem os raros),
     os 4 melhores do físico e os 3 melhores de passe, ataque e defesa — um perfil que dá para cumprir inteiro */
  const N_PRI = { fis: 4, pas: 3, atq: 3, def: 3 }, N_NUC = { fis: 2, pas: 1, atq: 1, def: 1 };
  function principais(pos, N) {
    const m = {}, por = {};
    D.inds.forEach(i => {
      const r = ref(pos, i.k); if (!r || i.nm || r[0] == null || r[1] == null || r[2] == null || r[3]) return;
      if (Math.abs(r[2]) < 0.3 || !(i.menor ? r[0] < r[1] : r[0] > r[1])) return;
      (por[i.cat] = por[i.cat] || []).push([i.k, r[0], Math.abs(r[2])]);
    });
    Object.keys(por).forEach(c => por[c].sort((a, b) => b[2] - a[2]).slice(0, N[c] || 1).forEach(x => { m[x[0]] = x[1]; }));
    return m;
  }
  function padrao(pos, cat) {
    if (cat === 'pri') return principais(pos, N_PRI);
    if (cat === 'nuc') return principais(pos, N_NUC);
    const m = {};
    D.inds.forEach(i => {
      const r = ref(pos, i.k); if (!r || i.nm || r[0] == null || r[1] == null) return;
      if (cat !== 'all' && i.cat !== cat) return;
      if (i.menor) { if (r[0] <= r[1]) m[i.k] = r[0]; } else if (r[0] > r[1] || i.cat === 'fis') m[i.k] = r[0];
    });
    return m;
  }
  const minsAtuais = () => E.mins || padrao(E.pos, E.perfil);
  const cumpre = (i, v, lim) => v != null && (i.menor ? v <= lim : v >= lim);

  /* percentil dentro da posição (tamanho da barra) */
  const cacheOrd = {};
  function pct(pos, k, v) {
    if (v == null) return 0;
    const ch = pos + '|' + k;
    let a = cacheOrd[ch];
    if (!a) { a = D.posicoes[pos].jog.map(j => j[NC + k]).filter(x => x != null).sort((x, y) => x - y); cacheOrd[ch] = a; }
    if (!a.length) return 0;
    let lo = 0, hi = a.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] <= v) lo = m + 1; else hi = m; }
    return Math.max(3, Math.round(lo / a.length * 100));
  }
  const chave = j => j[0] + '|' + j[2] + '|' + j[3];
  const sem = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function aderencia(j, mins, ks) {
    let ok = 0, sd = 0, soma = 0;
    ks.forEach(k => { const i = D.inds[k], v = j[NC + i.k]; if (v == null) { sd++; return; } if (cumpre(i, v, mins[k])) ok++; const p = pct(E.pos, i.k, v); soma += i.menor ? 100 - p : p; });
    return { ok, sd, n: ks.length, nota: ks.length ? soma / ks.length : 0 };
  }
  function passaFiltro(j) {
    const f = E.f;
    if (!noGrupo(f.liga, j[3])) return false;
    if (f.nac === 'BR' && j[8] !== 'BR') return false;
    if (f.nac === 'SA' && j[8] !== 'SA') return false;
    if (f.nac === 'BRSA' && !j[8]) return false;
    if (f.idade && (j[4] == null || j[4] > +f.idade)) return false;
    if (f.ate && (!j[5] || j[5] > f.ate)) return false;
    if (f.valor && j[6] != null && j[6] > +f.valor) return false;
    if (f.minutos && j[7] < +f.minutos) return false;
    if (f.fis && j[NC] == null) return false;
    return true;
  }
  function filtrados() {
    const mins = minsAtuais(), ks = Object.keys(mins).map(Number);
    const out = [];
    D.posicoes[E.pos].jog.forEach(j => {
      if (!passaFiltro(j)) return;
      const a = aderencia(j, mins, ks);
      if (ks.length && a.ok / ks.length * 100 < E.tol - 1e-9) return;
      out.push({ j, a });
    });
    out.sort((x, y) => (y.a.ok - x.a.ok) || (y.a.nota - x.a.nota));
    return out;
  }
  const selAtual = () => (E.sel[E.pos] = E.sel[E.pos] || []);

  /* ---- jogadores de fora da lista da posição ----
     A busca traz qualquer um: outra posição da base da aba (chave "P:POS|…") e qualquer jogador da base do app,
     inclusive com pouca minutagem, sem indicadores ou cadastrado à mão (chave "B:<pk>"). Os números desses vêm da
     ficha do app (kpis da posição dele + físico do cadastro), com o que foi COLADO em "físico/técnico" por cima. */
  const appOk = () => typeof BASE !== 'undefined' && Array.isArray(BASE) && BASE.length && typeof primaryKey === 'function';
  let idxBase = null, idsSub = null, porId = null, porNome = null;
  function indices() {
    if (!idsSub) { idsSub = new Set(); D.ordem.forEach(c => D.posicoes[c].jog.forEach(j => { if (j[10] != null && j[10] !== -1) idsSub.add(j[10]); })); }
    if (appOk() && (!idxBase || idxBase.n !== BASE.length)) {
      idxBase = { n: BASE.length, l: BASE.map(j => [sem(j.n) + ' ' + sem(j.nc) + ' ' + sem(j.t), j]) };
      porId = new Map(BASE.map(j => [j.id, j]));
      porNome = new Map(); BASE.forEach(j => { const k = sem(j.n) + '|' + j.l; (porNome.get(k) || porNome.set(k, []).get(k)).push(j); });
    }
  }
  const ext = {};            // pk -> linha montada a partir da base do app
  let pend = 0;
  async function linhaBase(bj) {
    let j = Object.assign({}, bj);
    const dc = (typeof dadosColados === 'function') ? dadosColados(primaryKey(bj), null) : null;
    if (dc && dc.fis) Object.keys(dc.fis).forEach(k => { if (dc.fis[k] != null && k !== 'min') j[k] = dc.fis[k]; });
    if (dc) j._dadosFicha = dc;
    try { if (typeof comFisicoDoEstudo === 'function') j = comFisicoDoEstudo(j) || j; } catch (e) {}
    let dados = null; try { if (typeof kpisDe === 'function') dados = await kpisDe(j, 'posliga'); } catch (e) {}
    const tec = {};
    if (dados && dados.ok) dados.linhas.forEach(l => { const nm = dados.nomes[l[0]]; if (nm && typeof l[1] === 'number') tec[nm[1]] = l[1]; });
    let nf = 0;
    const vals = D.inds.map(i => { const v = i.cat === 'fis' ? j[FIS_ORD[nf++]] : tec[KPI[i.rot]]; return typeof v === 'number' && isFinite(v) ? v : null; });
    const nac = j.nac === 'Brazil' ? 'BR' : '';
    const row = [j.n, j.nc || '', j.t, j.l, j.id_ || null, String(j.ct || '').slice(0, 7), j.mv ? Math.round(j.mv / 1e4) / 100 : null, j.min || 0, nac, j.emp ? 1 : 0, j.id].concat(vals);
    row.ext = { pos: bj.p, pk: primaryKey(bj), colado: !!dc, base: true };
    return row;
  }
  function pede(bj) {
    const pk = primaryKey(bj); if (ext[pk] !== undefined) return;
    ext[pk] = null; pend++;
    linhaBase(bj).then(r => { ext[pk] = r; }).catch(() => { ext[pk] = false; }).then(() => { if (--pend === 0) atualiza(); });
  }
  /* linha de uma chave da comparação; null enquanto a da base do app ainda carrega */
  function linhaDe(k) {
    if (k.slice(0, 2) === 'B:') {
      indices(); if (!appOk()) return null;
      const pk = k.slice(2), bj = BASE.find(x => primaryKey(x) === pk); if (!bj) return null;
      if (ext[pk] === undefined) pede(bj);
      return ext[pk] || null;
    }
    let r = null;
    if (k.slice(0, 2) === 'P:') { const c = k.slice(2, k.indexOf('|')), kk = k.slice(k.indexOf('|') + 1), P = D.posicoes[c]; r = P && P.jog.find(j => chave(j) === kk); if (r) { r = r.slice(); r.ext = { pos: c }; } }
    else r = D.posicoes[E.pos].jog.find(j => chave(j) === k) || null;
    if (!r) return null;
    /* tem cadastro no app e alguém colou físico/técnico nele: o colado entra por cima do que a base da aba tinha */
    indices();
    let bj = appOk() && r[10] != null && r[10] !== -1 ? porId.get(r[10]) : null;
    /* sem id (o clube está escrito de outro jeito no cadastro: "São Bernardo" x "São Bernardo FC"): mesmo nome na
       mesma liga, um só candidato com a idade batendo */
    if (!bj && appOk()) { const c = (porNome.get(sem(r[0]) + '|' + r[3]) || []).filter(x => r[4] == null || x.id_ == null || Math.abs(x.id_ - r[4]) <= 1); if (c.length === 1) bj = c[0]; }
    if (bj) {
      const pk = primaryKey(bj), dc = typeof dadosColados === 'function' ? dadosColados(pk, null) : null;
      r = r.slice(); r.ext = Object.assign({}, r.ext || {}, { pk });
      let falta = false; for (let x = NC; x < r.length; x++) if (r[x] == null) { falta = true; break; }
      /* o que foi colado entra por cima; sem nada colado, o cadastro do app só preenche o que a base da aba não tem */
      if (dc || falta) { if (ext[pk] === undefined) pede(bj); const o = ext[pk]; if (o) { for (let x = NC; x < o.length; x++) if (o[x] != null && (dc || r[x] == null)) r[x] = o[x]; if (dc) r.ext.colado = true; } }
    }
    return r;
  }
  /* traz para a comparação todos os jogadores que estão no campograma do grupo aberto, na posição escolhida */
  function doCampograma() {
    indices();
    if (!appOk() || typeof estado === 'undefined' || !estado || !estado.elenco || typeof acharNaBase !== 'function') return 'o campograma ainda não carregou';
    const cards = estado.elenco[E.pos] || [], s = selAtual();
    let novos = 0, fora = 0;
    cards.forEach(c => {
      const bj = acharNaBase(c); if (!bj) { fora++; return; }
      let k = null;
      const r = D.posicoes[E.pos].jog.find(j => j[10] === bj.id && j[3] === bj.l);
      if (r) k = chave(r);
      else for (const c2 of D.ordem) { const r2 = c2 !== E.pos && D.posicoes[c2].jog.find(j => j[10] === bj.id && j[3] === bj.l); if (r2) { k = 'P:' + c2 + '|' + chave(r2); break; } }
      if (!k) k = 'B:' + primaryKey(bj);
      if (!s.includes(k)) { s.push(k); novos++; }
    });
    return cards.length ? novos + ' de ' + cards.length + ' do campograma entraram' + (cards.length - novos - fora ? ' (' + (cards.length - novos - fora) + ' já estavam)' : '') + (fora ? ' · ' + fora + ' sem cadastro na base' : '')
      : 'o campograma deste grupo não tem ninguém em ' + D.posicoes[E.pos].nome;
  }
  function limpaExt() { Object.keys(ext).forEach(k => delete ext[k]); }
  const mesAno = c => c ? c.slice(5, 7) + '/' + c.slice(2, 4) : '—';
  const livre = c => c && c <= '2027-01';

  /* ---- desenho ---- */
  function nomePerfil() {
    const c = CATS.find(x => x[0] === E.perfil);
    return (c ? c[1] : E.perfil.replace(/^@/, '')) + (E.mins && c ? ' (editado)' : '');
  }
  function htmlMins() {
    const mins = minsAtuais();
    const blocos = {};
    D.inds.forEach(i => { const r = ref(E.pos, i.k); if (!r || r[0] == null) return; (blocos[i.bloco] = blocos[i.bloco] || []).push([i, r]); });
    return Object.keys(blocos).map(b => '<div><h4>' + esc(b) + '</h4>' + blocos[b].map(([i, r]) => {
      const on = mins[i.k] != null, v = on ? mins[i.k] : r[0];
      return '<label class="sub-min' + (on ? ' on' : '') + '"><input type="checkbox" data-mk="' + i.k + '"' + (on ? ' checked' : '') + '>' +
        '<span>' + esc(i.rot) + (i.menor ? ' <em>(máximo)</em>' : '') + (i.nm ? ' <em title="O Wyscout mudou o critério deste indicador no período: a régua 2022–25 não vale como mínimo para 2026">~</em>' : '') +
        '<small>sobe ' + num(r[0], i.casas) + ' · cai ' + num(r[1], i.casas) + (r[2] != null ? ' · separação ' + (r[2] > 0 ? '+' : '') + num(r[2], 2) : '') + '</small></span>' +
        '<input type="number" step="any" data-mv="' + i.k + '" value="' + v + '"></label>';
    }).join('') + '</div>').join('');
  }
  function celula(i, r, v, lim, classeExtra) {
    if (v == null) return '<span class="sub-sem">sem dado</span>';
    const falha = lim != null && !cumpre(i, v, lim);
    return '<div class="sub-c ' + (classeExtra || cor(i, r, v)) + (falha ? ' falha' : '') + '"><span class="bar"><i style="width:' + pct(E.pos, i.k, v) + '%"></i></span><b>' + num(v, i.casas) + '</b></div>';
  }
  /* placar do jogador contra a régua: ganha = no nível de quem sobe · perde = no nível de quem cai · o resto fica entre os dois.
     Conta os indicadores que estão na matriz (todos, ou só os do perfil), sem os marcados com ~ */
  function placar(j, mins, bloco) {
    const o = { v: 0, a: 0, r: 0, n: 0 }, so = E.soPerfil && Object.keys(mins).length;
    D.inds.forEach(i => {
      if (i.nm || (bloco && i.bloco !== bloco) || (so && mins[i.k] == null)) return;
      const r = ref(E.pos, i.k), v = j[NC + i.k]; if (!r || r[0] == null || v == null) return;
      const c = cor(i, r, v); if (c) { o[c]++; o.n++; }
    });
    return o;
  }
  const htmlPlacar = o => o.n ? '<span class="sub-pl" title="ganha = no nível de quem sobe · perde = no nível de quem cai · o resto fica entre os dois"><b class="g">' + o.v + '</b> ganha · <b class="p">' + o.r + '</b> perde <i>de ' + o.n + '</i></span>' : '<span class="sub-pl"><i>sem dado</i></span>';
  function htmlMatriz() {
    const P = D.posicoes[E.pos], mins = minsAtuais(), ks = Object.keys(mins).map(Number);
    const pares = selAtual().map(k => [k, linhaDe(k)]);
    const carregando = pares.filter(x => !x[1] && x[0].slice(0, 2) === 'B:' && ext[x[0].slice(2)] === null).length;
    const js = pares.filter(x => x[1]).map(x => { x[1].k = x[0]; return x[1]; });
    let h = '<table class="sub-mat"><thead><tr><th class="rot">Indicador' +
      '<label class="sub-chk" style="margin-top:4px"><input type="checkbox" id="subSoPerfil"' + (E.soPerfil ? ' checked' : '') + '> só os do perfil</label></th>' +
      '<th class="sub-h sobe fx2"><span class="nm">Quem sobe</span><span class="cl">' + (P.n.Sobe || 0) + ' titulares · mediana</span></th>' +
      '<th class="sub-h cai fx3"><span class="nm">Quem cai</span><span class="cl">' + (P.n.Cai || 0) + ' titulares · mediana</span></th>' +
      js.map(j => { const a = aderencia(j, mins, ks);
        const e = j.ext || {};
        return '<th class="sub-h"><span class="x" data-rm="' + esc(j.k) + '" title="tirar da comparação">✕</span><span class="nm">' + esc(j[0]) + seloLinha(j) + '</span>' +
          (e.pos && e.pos !== E.pos ? '<span class="cl sub-fora" title="Posição dele na base — aqui é medido contra a régua de ' + esc(P.nome) + '">joga de ' + esc(SIG[e.pos] || e.pos) + (e.base && j[7] ? ' · ' + j[7] + ' min' : '') + '</span>' : (e.base && j[7] < 900 ? '<span class="cl sub-fora">' + j[7] + ' min</span>' : '')) +
          '<span class="cl">' + esc(j[2]) + ' · ' + esc(j[3]) + '</span><span class="cl">' + (j[4] != null ? j[4] + ' anos · ' : '') +
          '<span class="' + (livre(j[5]) ? 'sub-ct' : '') + '">contrato ' + mesAno(j[5]) + '</span></span>' +
          (ks.length ? '<span class="ad' + (a.ok === a.n ? ' cheio' : '') + '" title="mínimos do perfil que ele cumpre">perfil ' + a.ok + '/' + a.n + '</span>' : '') +
          '<span class="cl sub-tot">' + (E.soPerfil && ks.length ? 'no perfil: ' : 'em todos: ') + htmlPlacar(placar(j, mins)) + '</span>' +
          (e.pk ? '<span class="sub-dados" data-dados="' + esc(e.pk) + '" title="Colar o físico (CSV do SkillCorner) e o técnico (export do Wyscout) deste jogador — o que for colado entra aqui, na ficha e no campograma">' + (e.colado ? '✎ dados colados' : '＋ incluir dados') + '</span>' : '') + '</th>'; }).join('') +
      '</tr></thead><tbody>';
    let bloco = '';
    D.inds.forEach(i => {
      const r = ref(E.pos, i.k); if (!r || r[0] == null) return;
      const lim = mins[i.k];
      if (E.soPerfil && ks.length && lim == null) return;
      if (i.bloco !== bloco) { bloco = i.bloco; h += '<tr class="bloco" data-bl="' + esc(bloco) + '" title="Clique para ' + (E.fech[bloco] ? 'abrir' : 'recolher') + ' este grupo"><td class="rot"><b class="pm">' + (E.fech[bloco] ? '＋' : '－') + '</b> ' + esc(bloco) + '</td><td class="fx2"></td><td class="fx3"></td>' + js.map(j => '<td class="blp">' + htmlPlacar(placar(j, mins, bloco)) + '</td>').join('') + '</tr>'; }
      if (E.fech[bloco]) return;
      h += '<tr class="' + (lim != null ? 'no-perfil' : '') + '"><td class="rot">' + esc(i.rot) + (r[3] ? ' *' : '') +
        (lim != null ? '<span class="lim">' + (i.menor ? 'máx ' : 'mín ') + num(lim, i.casas) + '</span>' : '') + '</td>' +
        '<td class="fx2">' + celula(i, r, r[0], null, 'ref') + '</td><td class="fx3">' + celula(i, r, r[1], null, 'ref') + '</td>' +
        js.map(j => '<td>' + celula(i, r, j[NC + i.k], lim) + '</td>').join('') + '</tr>';
    });
    h += '</tbody></table>';
    if (carregando) h += '<div class="sub-vazio">carregando ' + carregando + ' jogador(es) da base…</div>';
    if (!js.length && !carregando) h += '<div class="sub-vazio">Clique num jogador da lista ao lado (ou em “comparar os primeiros”) para colocá-lo aqui, ao lado de quem sobe e de quem cai.</div>';
    h += '<div class="sub-leg"><span><i style="background:var(--verde)"></i>no nível de quem sobe</span><span><i style="background:var(--ambar)"></i>entre quem cai e quem sobe</span>' +
      '<span><i style="background:#64748b"></i>no nível de quem cai</span><span><b style="color:var(--txt-vermelho)">número vermelho</b> = não cumpre o mínimo do perfil</span>' +
      '<span>tamanho da barra = percentil na posição (' + P.jog.length + ' jogadores)</span></div>';
    return h;
  }
  function htmlLista(lista) {
    const sel = new Set(selAtual());
    if (!lista.length) return '<div class="sub-vazio">Ninguém cumpre os mínimos com estes filtros. Baixe o “cumpre pelo menos” para 80% ou 70%, desmarque um mínimo ou abra o filtro de liga.</div>';
    return lista.slice(0, 250).map(({ j, a }) => '<div class="sub-item' + (sel.has(chave(j)) ? ' on' : '') + '" data-k="' + esc(chave(j)) + '">' +
      '<span class="nm">' + esc(j[0]) + seloLinha(j) + '</span><span class="ad' + (a.n && a.ok === a.n ? ' cheio' : '') + '">' + (a.n ? a.ok + '/' + a.n : '—') + '</span>' +
      '<span class="cl">' + esc(j[2]) + ' · ' + esc(j[3]) + (j[4] != null ? ' · ' + j[4] + 'a' : '') + ' · <span class="' + (livre(j[5]) ? 'sub-ct' : '') + '">' + mesAno(j[5]) + '</span>' +
      (j[6] != null ? ' · € ' + num(j[6], 1) + ' mi' : '') + (a.sd ? ' · ' + a.sd + ' sem dado' : '') + '</span></div>').join('') +
      (lista.length > 250 ? '<div class="sub-vazio">mostrando os 250 primeiros de ' + lista.length + '</div>' : '');
  }
/*@@PARTE2@@*/
  let ultima = [];
  function atualiza() {
    const R = document.getElementById('subCorpo'); if (!R || !R.querySelector('#subConta')) return;
    ultima = filtrados();
    const ks = Object.keys(minsAtuais());
    R.querySelector('#subConta').innerHTML = '<b>' + ultima.length + '</b> jogadores cumprem ' + (E.tol < 100 ? 'pelo menos ' + E.tol + '% dos ' : 'todos os ') + '<b style="font-size:15px">' + ks.length + '</b> mínimos';
    R.querySelector('#subItens').innerHTML = htmlLista(ultima);
    R.querySelector('#subMat').innerHTML = htmlMatriz();
    R.querySelector('#subMinsRes').innerHTML = '<b>' + ks.length + '</b> mínimos ativos · perfil ' + esc(nomePerfil()) + '<span>clique para ver, ligar, desligar ou mudar cada número</span>';
    grava();
  }
  function render() {
    const R = document.getElementById('subCorpo'); if (!R) return;
    if (!D) { R.innerHTML = '<p class="sub-vazio">Sem dado: rode gerar_subida_js.py.</p>'; return; }
    const P = D.posicoes[E.pos], f = E.f;
    const meus = E.perfis.filter(p => p.pos === E.pos);
    const aberto = R.querySelector('.sub-mins') && R.querySelector('.sub-mins').open;
    R.innerHTML =
      '<div class="sub-topo"><h2>Subida</h2><p>Quem, no mercado, tem os números do titular de quem <b>sobe</b> na Série B ' + D.anos[0] + '–' + D.anos[D.anos.length - 1] +
      '. Escolha a posição e um perfil: a lista fica só com quem cumpre os mínimos, e a matriz põe cada escolhido ao lado de quem sobe e de quem cai, no físico e no técnico.</p></div>' +
      '<div class="sub-filtros">' +
        '<div class="sub-campo">Posição<div class="sub-chips">' + D.ordem.map(c => '<button class="sub-chip' + (c === E.pos ? ' on' : '') + '" data-pos="' + c + '"><b>' + SIG[c] + '</b>' + esc(D.posicoes[c].nome) + '</button>').join('') + '</div></div>' +
        '<div class="sub-campo sub-larg">Perfil de quem sobe<select id="subPerfil">' +
          '<optgroup label="' + esc(P.nome) + ' · quem sobe">' + CATS.map(c => '<option value="' + c[0] + '"' + (E.perfil === c[0] ? ' selected' : '') + '>' + c[1] + ' (' + Object.keys(padrao(E.pos, c[0])).length + ' mínimos)</option>').join('') + '</optgroup>' +
          (meus.length ? '<optgroup label="Meus perfis">' + meus.map(p => '<option value="@' + esc(p.nome) + '"' + (E.perfil === '@' + p.nome ? ' selected' : '') + '>' + esc(p.nome) + '</option>').join('') + '</optgroup>' : '') +
        '</select></div>' +
        '<div class="sub-campo">Cumpre pelo menos<div class="sub-tol"><input type="range" id="subTol" min="30" max="100" step="10" value="' + E.tol + '"><b id="subTolRot">' + E.tol + '%</b></div></div>' +
        '<div class="sub-campo"><button class="sub-bt" id="subGravar" title="Grava a posição, os mínimos, a tolerância e os filtros de agora com um nome">Gravar perfil</button></div>' +
        (E.perfil[0] === '@' ? '<div class="sub-campo"><button class="sub-bt perigo" id="subApagar">Apagar perfil</button></div>' : '') +
        (E.mins && E.perfil[0] !== '@' ? '<div class="sub-campo"><button class="sub-bt" id="subRepor">Voltar aos mínimos de fábrica</button></div>' : '') +
        '<div style="flex-basis:100%;height:0"></div>' +
        '<div class="sub-campo sub-larg">Liga<select id="subLiga">' + GRUPOS.map(g => '<option value="' + g[0] + '"' + (f.liga === g[0] ? ' selected' : '') + '>' + g[1] + '</option>').join('') +
          '<optgroup label="Uma liga">' + D.ligas.map(l => '<option' + (f.liga === l ? ' selected' : '') + '>' + esc(l) + '</option>').join('') + '</optgroup></select></div>' +
        '<div class="sub-campo">Nacionalidade<select id="subNac">' + [['', 'Todas'], ['BR', 'Brasileiros'], ['SA', 'Sul-americanos (sem BR)'], ['BRSA', 'Brasileiros + sul-americanos']].map(o => '<option value="' + o[0] + '"' + (f.nac === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></div>' +
        '<div class="sub-campo">Idade até<input type="number" id="subIdade" min="16" max="45" value="' + esc(f.idade) + '" placeholder="—"></div>' +
        '<div class="sub-campo" title="Vazio = todos. Com uma data, ficam só os contratos que terminam até ela (dez/26 = livres para 2027).">Contrato até<input type="month" id="subAte" value="' + esc(f.ate) + '"></div>' +
        '<div class="sub-campo">Valor até (€ mi)<input type="number" id="subValor" min="0" step="0.1" value="' + esc(f.valor) + '" placeholder="—"></div>' +
        '<div class="sub-campo">Minutos ≥<input type="number" id="subMinutos" min="0" step="100" value="' + esc(f.minutos) + '" placeholder="900"></div>' +
        '<label class="sub-chk" title="Tira da lista quem não tem tracking do SkillCorner (segundas divisões da Argentina, Colômbia e Equador não têm)"><input type="checkbox" id="subFis"' + (f.fis ? ' checked' : '') + '> só com dado físico</label>' +
        '<button class="sub-bt" id="subLivres" title="Contrato até dez/2026">' + (f.ate === '2026-12' ? '✓ só livres para 2027' : 'Só livres para 2027') + '</button>' +
      '</div>' +
      '<details class="sub-mins"' + (aberto ? ' open' : '') + '><summary id="subMinsRes"></summary><div class="sub-mins-corpo" id="subMins">' + htmlMins() + '</div></details>' +
      '<div class="sub-corpo"><aside class="sub-lista"><div class="sub-lista-topo"><div class="sub-conta" id="subConta"></div>' +
        '<div class="sub-lista-acoes"><button class="sub-bt" id="subTop">Comparar os primeiros</button><input type="number" id="subTopN" min="1" max="15" value="' + E.topN + '">' +
        '<button class="sub-bt" id="subLimpar">Limpar comparação</button>' +
        '<button class="sub-bt" id="subCampo" title="Leva para a comparação todos os jogadores que estão no campograma do grupo aberto, nesta posição">＋ Trazer do campograma</button><span id="subCampoMsg" class="sub-msg"></span></div>' +
        '<div class="sub-busca"><input type="text" id="subBusca" placeholder="Adicionar qualquer jogador da base: nome ou clube…" autocomplete="off"><div class="sub-busca-lista" id="subBuscaLista" hidden></div></div></div>' +
        '<div class="sub-itens" id="subItens"></div></aside>' +
        '<div class="sub-mat-wrap" id="subMat"></div></div>' +
      '<div class="sub-nota"><b>Como ler.</b> A régua é a mediana do titular (900 minutos ou mais) dos clubes que subiram e dos que caíram na Série B ' + D.anos[0] + '–' + D.anos[D.anos.length - 1] +
      ' (* = média, nos indicadores raros). Mínimo de fábrica = mediana de quem sobe, só onde quem sobe tem mais do que quem cai; faltas e cartões entram como máximo; o físico entra inteiro. ' +
      'Indicadores marcados com <b>~</b> (volume de duelo e de ação defensiva) aparecem na matriz mas não viram mínimo: o Wyscout mudou o critério no período. ' +
      '<b>Atenção:</b> cumprir <i>todos</i> os mínimos é raro — metade dos próprios titulares de quem sobe fica abaixo de cada mediana. Use o “cumpre pelo menos” em 70–80% ou desligue mínimos para abrir a lista. ' +
      'Jogadores: Série B 2026 e ' + (D.ligas.length - 1) + ' ligas do Wyscout (ago/26), com ' + D.min + ' minutos ou mais; vetados ficam de fora. Físico: SkillCorner — sem cobertura nas segundas divisões da Argentina, Colômbia e Equador. ' +
      'Perfis gravados e a comparação ficam neste navegador. Gerado em ' + esc(D.gerado_em) + '.</div>';
    atualiza();
  }

  /* ---- eventos (delegados: a lista e a matriz são redesenhadas a cada filtro) ---- */
  function trocaPerfil(v) {
    E.perfil = v; E.mins = null;
    if (v === 'pri') E.tol = 80; else if (v === 'nuc') E.tol = 100;
    if (v[0] === '@') { const p = E.perfis.find(x => x.pos === E.pos && '@' + x.nome === v); if (p) { E.mins = Object.assign({}, p.mins); E.tol = p.tol || 100; E.f = Object.assign({}, F0, p.f || {}); } }
    render();
  }
  let sujo = false;          // abriu o "incluir dados": na volta do mouse para a aba, refaz as linhas vindas da base
  function ligarEventos(R) {
    R.addEventListener('mouseenter', () => { if (sujo) { sujo = false; limpaExt(); atualiza(); } });
    R.addEventListener('click', ev => {
      const t = ev.target, q = s => t.closest(s);
      let e;
      if ((e = q('[data-pos]'))) { E.pos = e.dataset.pos; if (E.perfil[0] === '@') E.perfil = 'fis'; E.mins = null; return render(); }
      if ((e = q('tr.bloco[data-bl]'))) { E.fech[e.dataset.bl] = !E.fech[e.dataset.bl]; return atualiza(); }
      if ((e = q('[data-dados]'))) { indices(); const bj = appOk() && BASE.find(x => primaryKey(x) === e.dataset.dados); if (bj && typeof abrirDadosBase === 'function') { sujo = true; abrirDadosBase(bj); } return; }
      if ((e = q('[data-rm]'))) { const s = selAtual(), i = s.indexOf(e.dataset.rm); if (i >= 0) s.splice(i, 1); return atualiza(); }
      if ((e = q('.sub-item'))) { const s = selAtual(), k = e.dataset.k, i = s.indexOf(k); if (i >= 0) s.splice(i, 1); else s.push(k); return atualiza(); }
      if ((e = q('[data-add]'))) { const s = selAtual(); if (!s.includes(e.dataset.add)) s.push(e.dataset.add); R.querySelector('#subBusca').value = ''; R.querySelector('#subBuscaLista').hidden = true; return atualiza(); }
      if (t.id === 'subTop') { const s = selAtual(); ultima.slice(0, E.topN).forEach(x => { const k = chave(x.j); if (!s.includes(k)) s.push(k); }); return atualiza(); }
      if (t.id === 'subCampo') { const m = doCampograma(); atualiza(); const el = R.querySelector('#subCampoMsg'); if (el) el.textContent = m; return; }
      if (t.id === 'subLimpar') { E.sel[E.pos] = []; return atualiza(); }
      if (t.id === 'subLivres') { E.f.ate = E.f.ate === '2026-12' ? '' : '2026-12'; return render(); }
      if (t.id === 'subRepor') { E.mins = null; return render(); }
      if (t.id === 'subGravar') {
        const nome = (prompt('Nome do perfil (fica gravado para ' + D.posicoes[E.pos].nome + '):', '') || '').trim(); if (!nome) return;
        const m = Object.assign({}, minsAtuais());
        E.perfis = E.perfis.filter(p => !(p.pos === E.pos && p.nome === nome));
        E.perfis.push({ nome, pos: E.pos, mins: m, tol: E.tol, f: Object.assign({}, E.f) });
        E.perfil = '@' + nome; E.mins = Object.assign({}, m); return render();
      }
      if (t.id === 'subApagar') { if (!confirm('Apagar o perfil "' + E.perfil.slice(1) + '"?')) return; E.perfis = E.perfis.filter(p => !(p.pos === E.pos && '@' + p.nome === E.perfil)); E.perfil = 'fis'; E.mins = null; return render(); }
    });
    R.addEventListener('change', ev => {
      const t = ev.target;
      if (t.id === 'subPerfil') return trocaPerfil(t.value);
      if (t.id === 'subSoPerfil') { E.soPerfil = t.checked; return atualiza(); }
      if (t.id === 'subLiga') E.f.liga = t.value; else if (t.id === 'subNac') E.f.nac = t.value; else if (t.id === 'subIdade') E.f.idade = t.value;
      else if (t.id === 'subAte') E.f.ate = t.value; else if (t.id === 'subValor') E.f.valor = t.value; else if (t.id === 'subMinutos') E.f.minutos = t.value;
      else if (t.id === 'subFis') E.f.fis = t.checked; else if (t.id === 'subTopN') { E.topN = Math.max(1, Math.min(15, +t.value || 5)); return grava(); }
      else if (t.dataset.mk != null || t.dataset.mv != null) {
        const k = +(t.dataset.mk != null ? t.dataset.mk : t.dataset.mv), linha = t.closest('.sub-min');
        const m = Object.assign({}, minsAtuais());
        const chk = linha.querySelector('[data-mk]'), inp = linha.querySelector('[data-mv]');
        if (t.dataset.mv != null) chk.checked = true;
        if (chk.checked && inp.value !== '' && isFinite(+inp.value)) m[k] = +inp.value; else delete m[k];
        linha.classList.toggle('on', chk.checked); E.mins = m;
      } else return;
      atualiza();
    });
    R.addEventListener('input', ev => {
      const t = ev.target;
      if (t.id === 'subTol') { E.tol = +t.value; R.querySelector('#subTolRot').textContent = E.tol + '%'; return atualiza(); }
      if (t.id === 'subBusca') {
        const q = sem(t.value.trim()), cx = R.querySelector('#subBuscaLista');
        if (q.length < 2) { cx.hidden = true; return; }
        indices();
        const bate = j => sem(j[0]).includes(q) || sem(j[1]).includes(q) || sem(j[2]).includes(q);
        const item = (k, j, extra) => '<div data-add="' + esc(k) + '">' + esc(j[0]) + '<small>' + esc(j[2]) + ' · ' + esc(j[3]) + (j[4] != null ? ' · ' + j[4] + 'a' : '') + (extra ? ' · <b>' + extra + '</b>' : '') + '</small></div>';
        const out = D.posicoes[E.pos].jog.filter(bate).slice(0, 10).map(j => item(chave(j), j, ''));
        D.ordem.forEach(c => { if (c === E.pos || out.length >= 22) return; D.posicoes[c].jog.filter(bate).slice(0, 6).forEach(j => { if (out.length < 22) out.push(item('P:' + c + '|' + chave(j), j, SIG[c])); }); });
        if (appOk()) { let n = 0; for (const par of idxBase.l) { if (n >= 14) break; const j = par[1]; if (!par[0].includes(q) || idsSub.has(j.id)) continue; n++;
          out.push(item('B:' + primaryKey(j), [j.n, j.nc, j.t, j.l, j.id_ || null], (SIG[j.p] || j.p || '?') + ' · ' + (j.min ? j.min + ' min' : 'sem minutagem') + (j.rk_ok ? '' : ' · sem indicadores'))); } }
        cx.innerHTML = out.length ? out.join('') : '<div>ninguém com esse nome na base</div>';
        cx.hidden = false;
      }
    });
  }
  function ligar() {
    const bt = document.querySelector('.aba[data-aba="subida"]');
    const pg = document.getElementById('pgSubida'), R = document.getElementById('subCorpo');
    if (!bt || !pg || !R) return;
    ligarEventos(R);
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on) render(); };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
/*@@PARTE3@@*/

  /* =================== quadro "Quem sobe × quem cai" dentro da ficha do jogador ===================
     Chamado pelo app.js (montarFicha) com o jogador já com o físico resolvido e os indicadores da ficha.
     O valor de cada indicador vem da própria ficha (rótulo do kpis → indicador do estudo) e do cadastro (físico). */
  const FIS_ORD = ['psv', 'spr_n', 'expl', 'hi_n', 'acel', 'dist', 'obr', 'obr_area'];   // mesma ordem do bloco Físico do estudo
  const KPI = { 'Passes por 90': 'Passes /90', 'Passes certos %': 'Passes certos %', 'Passes para frente por 90': 'Forward passes per 90',
    'Passes para frente certos %': 'Accurate forward passes, %', 'Passes progressivos por 90': 'Progressive passes per 90',
    'Passes progressivos certos %': 'Accurate progressive passes, %', 'Passes ao terço final por 90': 'Passes to final third per 90',
    'Passes ao terço final certos %': 'Accurate passes to final third, %', 'Passes longos por 90': 'Long passes per 90', 'Passes longos certos %': 'Passes longos %',
    'Passes recebidos por 90': 'Passes recebidos /90', 'Conduções progressivas por 90': 'Corridas prog. /90', 'Gols por 90': 'Gols /90', 'xG por 90': 'xG /90',
    'Finalizações por 90': 'Remates /90', 'Finalizações no gol %': 'Remates no alvo %', 'Toques na área por 90': 'Toques na área /90',
    'Gols de cabeça por 90': 'Head goals per 90', 'Assistências por 90': 'Assistências /90', 'xA por 90': 'xA /90', 'Passes-chave por 90': 'Key passes per 90',
    'Passes para a área por 90': 'Passes to penalty area per 90', 'Cruzamentos por 90': 'Crosses per 90', 'Cruzamentos certos %': 'Cruzamentos %',
    'Dribles por 90': 'Dribbles per 90', 'Dribles certos %': 'Dribles %', 'Duelos ofensivos ganhos %': 'Offensive duels won, %', 'Faltas sofridas por 90': 'Faltas sofridas /90',
    'Duelos por 90': 'Duelos /90', 'Duelos ganhos %': 'Duelos %', 'Duelos defensivos por 90': 'Defensive duels per 90', 'Duelos defensivos ganhos %': 'Duelos def. %',
    'Duelos aéreos ganhos %': 'Aéreos %', 'Ações defensivas certas por 90': 'Successful defensive actions per 90', 'Interceptações (ajustadas à posse)': 'Interceptações (PAdj)',
    'Carrinhos (ajustados à posse)': 'PAdj Sliding tackles', 'Finalizações bloqueadas por 90': 'Shots blocked per 90', 'Faltas por 90': 'Fouls per 90', 'Cartões amarelos por 90': 'Amarelos /90' };
  /* ============ selo de subida (▲ ↔ ▼): quanto o jogador atende dos indicadores PRINCIPAIS da posição ============
     Principais = os que mais separam quem sobe de quem cai (o mesmo perfil "Principais" da aba). Régua do selo:
     ▲ verde = atende 60% ou mais · ↔ amarelo = de 35% a 60% · ▼ vermelho = menos de 35% · ? = falta dado (menos de 60%
     dos principais medidos). O titular típico de quem sobe fica perto de 50%, porque cada mínimo é a mediana deles;
     na base inteira, cerca de 1 em 4 jogadores chega ao verde e 4 em 10 ficam no vermelho. */
  const SELO_V = 0.6, SELO_R = 0.35, SELO_DADO = 0.6;
  function seloVals(pos, get) {
    const m = principais(pos, N_PRI), ks = Object.keys(m).map(Number);
    if (!ks.length) return null;
    let ok = 0, com = 0; const falta = [], sem_ = [];
    ks.forEach(k => { const i = D.inds[k], v = get(i); if (v == null) { sem_.push(i.rot); return; } com++; if (cumpre(i, v, m[k])) ok++; else falta.push(i.rot); });
    const o = { ok, com, n: ks.length, falta, sem: sem_ };
    /* com 4 principais medidos já sai seta; abaixo de 60% dos principais medidos ela sai marcada como PARCIAL */
    o.c = com < Math.min(4, ks.length) ? 'n' : ok / com >= SELO_V ? 'v' : ok / com >= SELO_R ? 'a' : 'r';
    o.parcial = o.c !== 'n' && com < SELO_DADO * ks.length;
    return o;
  }
  function seloHtml(pos, o) {
    if (!o) return '';
    const nome = D.posicoes[pos].nome, sinal = { v: '▲', a: '↔', r: '▼', n: '?' }[o.c];
    const t = o.c === 'n'
      ? 'Selo de subida: faltam dados — só ' + o.com + ' dos ' + o.n + ' indicadores principais de ' + nome + ' estão medidos. Sem dado: ' + o.sem.join(', ') + '.'
      : 'Selo de subida (' + nome + ')' + (o.parcial ? ' — PARCIAL, só ' + o.com + ' dos ' + o.n + ' principais medidos' : '') + ': atende ' + o.ok + ' de ' + o.com + ' indicadores principais (' + Math.round(o.ok / o.com * 100) + '%) no nível de quem sobe. ' +
        (o.falta.length ? 'Abaixo em: ' + o.falta.join(', ') + '. ' : '') + (o.sem.length ? 'Sem dado: ' + o.sem.join(', ') + '. ' : '') + '▲ 60% ou mais · ↔ 35% a 60% · ▼ menos de 35%.';
    return '<span class="sb-selo sb-' + o.c + (o.parcial ? ' sb-p' : '') + '" title="' + esc(t) + '">' + sinal + '</span>';
  }
  let mapaSub = null;
  function linhaSub(j) {
    if (!mapaSub) { mapaSub = { id: new Map(), nome: new Map() }; D.ordem.forEach(c => D.posicoes[c].jog.forEach(r => { if (r[10] != null && r[10] !== -1) mapaSub.id.set(r[10] + '|' + r[3], r); const k = sem(r[0]) + '|' + r[3]; (mapaSub.nome.get(k) || mapaSub.nome.set(k, []).get(k)).push(r); })); }
    let r = mapaSub.id.get(j.id + '|' + j.l);
    if (!r) { const c = (mapaSub.nome.get(sem(j.n) + '|' + j.l) || []).filter(x => x[4] == null || j.id_ == null || Math.abs(x[4] - j.id_) <= 1); if (c.length === 1) r = c[0]; }
    return r || null;
  }
  /* selo de um jogador da base do app (cards do campograma, busca, listas): síncrono, sem buscar arquivo —
     técnico da base da aba (900 min ou mais) ou do export do Wyscout colado; físico do cadastro, do estudo ou colado */
  /* indicadores da ficha (dados/kpis/<POS>.json): valem para qualquer minutagem, não só para quem tem 900 min.
     O arquivo é buscado uma vez por posição; quando chega, o campograma é redesenhado e o "?" vira seta. */
  const kpiPronto = {}; let kpiPend = 0;
  function kpisDaPosicao(pos) {
    if (kpiPronto[pos] !== undefined) return kpiPronto[pos] || null;
    kpiPronto[pos] = null;
    if (typeof cachePosKpis === 'undefined') { kpiPronto[pos] = false; return null; }
    if (!cachePosKpis[pos]) cachePosKpis[pos] = fetch('dados/kpis/' + pos + '.json' + (window.__verDados ? '?v=' + window.__verDados : '')).then(r => (r.ok ? r.json() : null)).catch(() => null);
    kpiPend++;
    Promise.resolve(cachePosKpis[pos]).then(b => { kpiPronto[pos] = b || false; }, () => { kpiPronto[pos] = false; }).then(() => {
      if (--kpiPend > 0) return;
      try { if (typeof render === 'function') render(); else if (typeof renderCampo === 'function') renderCampo(); } catch (e) {}
      try { window.dispatchEvent(new Event('subida-kpis')); } catch (e) {}
    });
    return null;
  }
  /* nome da coluna no export do Wyscout em português (para o técnico colado em PT) */
  const KPI_PT = { 'Passes por 90': 'Passes/90', 'Passes certos %': 'Passes certos, %', 'Passes para frente por 90': 'Passes para a frente/90', 'Passes para frente certos %': 'Passes para a frente certos, %',
    'Passes progressivos por 90': 'Passes progressivos/90', 'Passes progressivos certos %': 'Passes progressivos certos, %', 'Passes ao terço final por 90': 'Passes para terço final/90',
    'Passes ao terço final certos %': 'Passes certos para terço final, %', 'Passes longos por 90': 'Passes longos/90', 'Passes longos certos %': 'Passes longos certos, %', 'Passes recebidos por 90': 'Passes recebidos/90',
    'Conduções progressivas por 90': 'Corridas progressivas/90', 'Gols por 90': 'Golos/90', 'xG por 90': 'Golos esperados/90', 'Finalizações por 90': 'Remates/90', 'Finalizações no gol %': 'Remates à baliza, %',
    'Toques na área por 90': 'Toques na área/90', 'Gols de cabeça por 90': 'Golos de cabeça/90', 'Assistências por 90': 'Assistências/90', 'xA por 90': 'Assistências esperadas/90', 'Passes-chave por 90': 'Passes chave/90',
    'Passes para a área por 90': 'Passes para a área de penálti/90', 'Cruzamentos por 90': 'Cruzamentos/90', 'Cruzamentos certos %': 'Cruzamentos certos, %', 'Dribles por 90': 'Dribles/90', 'Dribles certos %': 'Dribles com sucesso, %',
    'Duelos ofensivos ganhos %': 'Duelos ofensivos ganhos, %', 'Faltas sofridas por 90': 'Faltas sofridas/90', 'Duelos ganhos %': 'Duelos ganhos, %', 'Duelos defensivos ganhos %': 'Duelos defensivos ganhos, %',
    'Duelos aéreos ganhos %': 'Duelos aéreos ganhos, %', 'Interceptações (ajustadas à posse)': 'Interceções ajust. à posse', 'Carrinhos (ajustados à posse)': 'Cortes de carrinho ajust. à posse',
    'Finalizações bloqueadas por 90': 'Remates intercetados/90', 'Faltas por 90': 'Faltas/90', 'Cartões amarelos por 90': 'Cartões amarelos/90' };
  window.subidaSelo = function (j0) {
    try {
      if (!D || !j0 || !D.posicoes[j0.p]) return '';
      let j = j0;
      const dc = j0._dados || j0._dadosFicha || (typeof dadosColados === 'function' && typeof primaryKey === 'function' ? dadosColados(primaryKey(j0), null) : null);
      if (dc && dc.fis) { j = Object.assign({}, j0); Object.keys(dc.fis).forEach(k => { if (dc.fis[k] != null && k !== 'min') j[k] = dc.fis[k]; }); }
      try { if (typeof comFisicoDoEstudo === 'function') j = comFisicoDoEstudo(j) || j; } catch (e) {}
      const r = linhaSub(j0), raw = dc && dc.tec_raw, en = typeof KPI_EN !== 'undefined' ? KPI_EN : {};
      /* técnico da ficha: o arquivo é o da posição do CADASTRO (é lá que o jogador está), mesmo medido em outra */
      const tec = {}; let comFicha = false;
      const usaFicha = () => { if (comFicha) return; comFicha = true; const b = kpisDaPosicao(j0._posBase || j0.p), ls = b && typeof primaryKey === 'function' ? b.jogadores[primaryKey(j0)] : null;
        if (ls) ls.forEach(l => { const nm = b.kpis[l[0]]; if (nm && typeof l[1] === 'number') tec[nm[1]] = l[1]; }); };
      const fisK = {}; let nf = 0; D.inds.forEach(i => { if (i.cat === 'fis') fisK[i.k] = FIS_ORD[nf++]; });
      const numero = v => { if (typeof v === 'string') v = parseFloat(v.replace(',', '.')); return typeof v === 'number' && isFinite(v) ? v : null; };
      return seloHtml(j0.p, seloVals(j0.p, i => {
        let v = null;
        if (i.cat === 'fis') v = numero(j[fisK[i.k]]);
        else if (raw) { if (KPI[i.rot] && en[KPI[i.rot]] != null) v = numero(raw[en[KPI[i.rot]]]); if (v == null && KPI_PT[i.rot]) v = numero(raw[KPI_PT[i.rot]]); }
        if (v == null && r) v = r[NC + i.k];
        if (v == null && i.cat !== 'fis' && KPI[i.rot]) { usaFicha(); v = numero(tec[KPI[i.rot]]); }
        return v == null ? null : v;
      }));
    } catch (e) { return ''; }
  };
  const seloLinha = j => seloHtml(E.pos, seloVals(E.pos, i => j[NC + i.k]));
  window.subidaQuadro = function (j, dados) {
    try {
      if (!D || !j || !D.posicoes[j.p]) return '';
      const P = D.posicoes[j.p], tec = {};
      if (dados && dados.ok) dados.linhas.forEach(l => { const nm = dados.nomes[l[0]]; if (nm && typeof l[1] === 'number') tec[nm[1]] = l[1]; });
      /* o que a ficha não traz para a posição (o kpis muda de posição para posição) vem da base da aba Subida */
      const base = linhaSub(j);
      let nf = 0;
      const linhas = [];
      D.inds.forEach(i => {
        let v = null;
        if (i.cat === 'fis') v = j[FIS_ORD[nf++]]; else if (KPI[i.rot] != null) v = tec[KPI[i.rot]];
        const r = P.ref[i.k]; if (!r || r[0] == null || r[1] == null) return;
        if (typeof v !== 'number' || !isFinite(v)) v = (base && !(j._dadosFicha) && typeof base[NC + i.k] === 'number') ? base[NC + i.k] : null;
        linhas.push({ i, r, v, d: r[2], c: cor(i, r, v), chave: !i.nm && r[2] != null && Math.abs(r[2]) >= 0.3 });
      });
      if (!linhas.some(l => l.v != null)) return '';
      /* os PRINCIPAIS (os do selo ▲ ↔ ▼ do card) são um recorte dos fundamentais: só onde quem sobe tem MAIS, sem os
         raros, os 4 mais fortes do físico e os 3 de passe, ataque e defesa. O quadro mostra os dois números. */
      const mp = principais(j.p, N_PRI), porK = {}; linhas.forEach(l => { porK[l.i.k] = l; l.pri = mp[l.i.k] != null; });
      const selo = seloVals(j.p, i => (porK[i.k] ? porK[i.k].v : null));
      const com = linhas.filter(l => l.v != null && l.chave);
      const acima = com.filter(l => l.c === 'v'), abaixo = com.filter(l => l.c === 'r');
      const blocos = [];
      D.inds.forEach(i => { if (!blocos.includes(i.bloco)) blocos.push(i.bloco); });
      const tab = b => {
        const ls = linhas.filter(l => l.i.bloco === b).sort((a, c) => Math.abs(c.d == null ? 0 : c.d) - Math.abs(a.d == null ? 0 : a.d));
        if (!ls.length) return '';
        const cb = ls.filter(l => l.chave && l.v != null);
        return '<div class="sq-bloco"><h5>' + esc(b) + (cb.length ? ' <b>' + cb.filter(l => l.c === 'v').length + '/' + cb.length + '</b>' : '') + '</h5>' +
          '<table><thead><tr><th>Indicador</th><th>Ele</th><th>Sobe</th><th>Cai</th></tr></thead><tbody>' +
          ls.map(l => '<tr class="' + (l.chave ? 'sq-chave' : 'sq-fraco') + '"><td title="' + (l.d != null ? 'separação sobe − cai: ' + (l.d > 0 ? '+' : '') + num(l.d, 2) + ' desvios' : '') +
            (paraBaixo(l.i, l.r) ? ' · aqui quem sobe tem MENOS' : '') + '">' + (l.pri ? '<i class="sq-pri" title="Indicador principal: entra no selo ▲ ↔ ▼ do card">●</i> ' : '') + (l.chave ? '★ ' : '') + esc(l.i.rot) + (l.i.nm ? ' ~' : '') + (paraBaixo(l.i, l.r) ? ' ↓' : '') + '</td>' +
            '<td class="sq-v ' + (l.c || 'sq-nd') + '">' + (l.v == null ? '—' : num(l.v, l.i.casas)) + '</td><td>' + num(l.r[0], l.i.casas) + '</td><td>' + num(l.r[1], l.i.casas) + '</td></tr>').join('') +
          '</tbody></table></div>';
      };
      const nomes = a => a.slice().sort((x, y) => Math.abs(y.d) - Math.abs(x.d)).slice(0, 7).map(l => esc(l.i.rot)).join(' · ');
      return '<div class="sq"><div class="sq-topo"><h4>Quem sobe × quem cai · ' + esc(P.nome) + '</h4>' +
        (j._posBase && D.posicoes[j._posBase] ? '<span class="sq-troca" title="No campograma ele está nesta posição; o quadro, a letra e o selo usam a régua dela">medido como ' + esc(P.nome) + ' (posição no campograma) — no cadastro é ' + esc(D.posicoes[j._posBase].nome) + '</span>' : '') +
        '<span class="sq-res">No nível de quem sobe em <b class="v">' + acima.length + '</b> de <b>' + com.length + '</b> indicadores fundamentais' +
        (abaixo.length ? ' · no nível de quem cai em <b class="r">' + abaixo.length + '</b>' : '') + '</span>' +
        (selo ? '<span class="sq-res sq-selo">' + seloHtml(j.p, selo) + ' Selo do card: atende <b>' + selo.ok + '</b> de <b>' + selo.com + '</b> principais' + (selo.com < selo.n ? ' (' + (selo.n - selo.com) + ' sem dado)' : '') + '</span>' : '') +
        '<span class="sq-leg"><i class="v"></i>bate quem sobe <i class="a"></i>entre os dois <i class="r"></i>nível de quem cai · ★ fundamental · ↓ quem sobe tem menos</span></div>' +
        (acima.length ? '<p class="sq-frase"><b class="v">Acima de quem sobe:</b> ' + nomes(acima) + '</p>' : '') +
        (abaixo.length ? '<p class="sq-frase"><b class="r">No nível de quem cai:</b> ' + nomes(abaixo) + '</p>' : '') +
        '<div class="sq-grid">' + blocos.map(tab).join('') + '</div>' +
        '<div class="sq-pe">Régua: mediana do titular dos clubes que subiram e dos que caíram na Série B ' + D.anos[0] + '–' + D.anos[D.anos.length - 1] + ', na posição. ' +
        '★ = indicador que separa quem sobe de quem cai (0,30 desvio ou mais), para mais ou para menos (↓); a primeira conta do topo usa todos esses. ● = principal: o recorte que o selo ▲ ↔ ▼ do card usa (só onde quem sobe tem MAIS, sem os raros; 4 do físico e 3 de passe, ataque e defesa). Os números dele são os da ficha acima. ~ = o Wyscout mudou o critério; fica fora da conta.</div></div>';
    } catch (e) { return ''; }
  };
})();
