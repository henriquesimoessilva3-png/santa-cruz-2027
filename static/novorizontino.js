/* Aba "Modelo Novorizontino" — o Novorizontino da Série B 2026 como referência de time que sobe.
   Coletivo: static/novorizontino_dados.js (gerar_novorizontino_js.py) — Wyscout por jogo e SkillCorner somado por jogo, com o
   ranking entre os 20. Individual: as linhas da aba Subida (window.SUBIDA, 48 indicadores, 900 min ou mais) — percentil de cada
   indicador entre os jogadores da MESMA posição na Série B 2026, letra física (regra do clube) e selo de subida.
   Parecidos: para cada titular, os perfis técnico + físico mais próximos (distância padronizada dentro da posição) em três
   mercados — Série B, ligas sul-americanas e sul-americanos no exterior —, até € 2 MM, sem vetados (a base da Subida já tira).
   Arquivo próprio; observa o botão da aba. */
(function () {
  'use strict';
  const N = window.NOVORIZ, S = window.SUBIDA;
  if (!N || !S) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (x, d) => x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const sem = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const NC = S.campos.length;
  const POSN = { GOL: 'Goleiro', LD: 'Lateral direito', ZD: 'Zagueiro direito', ZE: 'Zagueiro esquerdo', LE: 'Lateral esquerdo', VOL: 'Volante', MED: 'Médio', MEI: 'Meia', ED: 'Extremo direito', EE: 'Extremo esquerdo', CA: 'Centroavante' };
  const ORD = ['LD', 'ZD', 'ZE', 'LE', 'VOL', 'MED', 'MEI', 'ED', 'EE', 'CA'];
  const SA = ['Argentina A', 'Argentina B', 'Colombia A', 'Colombia B', 'Equador A', 'Equador B', 'Paraguai', 'Uruguai', 'Chile', 'Peru', 'Bolivia', 'Venezuela'];
  const MERC = [['b', 'Série B'], ['sa', 'Ligas sul-americanas'], ['ext', 'Sul-americanos no exterior']];
  const TETO = 2.0;   /* € MM: acima disso é inalcançável para o Santa Cruz (regra da Consulta) */
  /* exterior: só as ligas ao alcance do Santa Cruz (listas.ALCANCAVEIS do estudo V2) e sem os grandes delas (ideal10.GRANDES) */
  const ALC = new Set(['Portugal B', 'Portugal C', 'Espanha B', 'Espanha C', 'Italia B', 'Italia C', 'Alemanha B', 'Inglaterra B', 'França B', 'Belgica B', 'Coreia B', 'Japao B',
    'Bulgaria', 'Romenia', 'Polonia', 'Eslovaquia', 'Servia', 'Hungria', 'Tcheca', 'Bahrain', 'Israel', 'Grecia', 'Suecia', 'Noruega', 'Dinamarca', 'Croacia', 'Escocia', 'Austria', 'Suiça', 'China', 'Marrocos', 'EUA', 'Mexico']);
  const GRANDES = new Set(['Olympiacos Piraeus', 'Olympiacos', 'Panathinaikos', 'AEK Athens', 'PAOK', 'Aris', 'Maccabi Tel Aviv', 'Maccabi Haifa', 'Ludogorets', 'Ludogorets Razgrad', 'Legia Warszawa', 'Lech Poznań', 'Lech Poznan',
    'Red Star Belgrade', 'Crvena Zvezda', 'Partizan', 'Dinamo Zagreb', 'Hajduk Split', 'Ferencváros', 'Ferencvaros', 'Al Sadd', 'Al Duhail', 'Al Ain', 'Al Wahda', 'Shabab Al Ahli', 'Al Jazira', 'Sharjah', 'Al Nasr',
    'Shanghai Port', 'Shanghai Shenhua', 'Chengdu Rongcheng', 'Beijing Guoan', 'Shandong Taishan', 'Sporting CP II', 'Benfica B', 'Porto B', 'Braga B']);
  const mercado = r => r[3] === 'Brasil B' ? 'b' : SA.includes(r[3]) ? 'sa' : ((r[8] === 'BR' || r[8] === 'SA') && ALC.has(r[3]) && !GRANDES.has(r[2])) ? 'ext' : null;
  const INDS = S.inds.filter(i => !i.nm);

  /* ---------- estatística por posição ---------- */
  const est = {};
  function estat(pos) {
    if (est[pos]) return est[pos];
    const jog = S.posicoes[pos].jog, o = { m: {}, sd: {}, b: {} };
    INDS.forEach(i => {
      const v = jog.map(r => r[NC + i.k]).filter(x => typeof x === 'number' && isFinite(x));
      const m = v.reduce((a, b) => a + b, 0) / (v.length || 1);
      o.m[i.k] = m; o.sd[i.k] = Math.sqrt(v.reduce((a, b) => a + (b - m) * (b - m), 0) / (v.length || 1)) || 1;
      o.b[i.k] = jog.filter(r => r[3] === 'Brasil B').map(r => r[NC + i.k]).filter(x => typeof x === 'number' && isFinite(x)).sort((a, b) => a - b);
    });
    return est[pos] = o;
  }
  /* percentil entre os jogadores da posição na Série B 2026 (já virado: 100 = melhor, mesmo em faltas/cartões) */
  function pct(pos, i, v) {
    if (typeof v !== 'number' || !isFinite(v)) return null;
    const b = estat(pos).b[i.k]; if (!b.length) return null;
    let lo = 0; while (lo < b.length && b[lo] < v) lo++;
    let hi = lo; while (hi < b.length && b[hi] === v) hi++;
    const p = Math.round(100 * ((lo + hi) / 2) / b.length);
    return i.menor ? 100 - p : p;
  }

  /* ---------- titulares do Novorizontino (as linhas da Subida) ---------- */
  function titulares() {
    const out = [];
    ORD.forEach(pos => S.posicoes[pos].jog.forEach(r => { if (r[2] === N.clube && r[3] === 'Brasil B') out.push({ pos, r }); }));
    Object.keys(N.extra || {}).forEach(pos => N.extra[pos].forEach(r => out.push({ pos, r, vetado: true })));
    const minW = n => { const e = N.elenco.find(x => sem(x.n) === sem(n) || sem(x.n).endsWith(sem(n).split(' ').pop())); return e ? e.min : null; };
    out.forEach(t => { t.minW = minW(t.r[0]) || t.r[7]; });
    /* físico que faltou na linha da Subida (ex.: Patrick): vem do cadastro do app (SkillCorner do Portal ou do estudo) */
    const FIS_ORD = ['psv', 'spr_n', 'expl', 'hi_n', 'acel', 'dist', 'obr', 'obr_area'];
    out.forEach(t => {
      const fisI = S.inds.filter(i => i.cat === 'fis'); if (fisI.every(i => typeof t.r[NC + i.k] === 'number')) return;
      let bj = baseDe(t.r, t.pos); if (!bj) return;
      try { if (typeof comFisicoDoEstudo === 'function') bj = comFisicoDoEstudo(Object.assign({}, bj)) || bj; } catch (e) {}
      const r = t.r.slice(); let mud = false;
      fisI.forEach((i, n) => { const v = bj[FIS_ORD[n]]; if (typeof r[NC + i.k] !== 'number' && typeof v === 'number' && isFinite(v)) { r[NC + i.k] = v; mud = true; } });
      if (mud) { t.r = r; t.fisBase = true; }
    });
    return out.sort((a, b) => ORD.indexOf(a.pos) - ORD.indexOf(b.pos) || b.minW - a.minW);
  }

  /* ---------- base do app: letra física e selo ---------- */
  let porId = null;
  function baseDe(r, pos) {
    if (typeof BASE === 'undefined' || !BASE.length) return null;
    if (!porId || porId.n !== BASE.length) { porId = new Map(BASE.map(j => [j.id, j])); porId.n = BASE.length; }
    if (r[10] != null && r[10] !== -1 && porId.get(r[10])) return porId.get(r[10]);
    const n = sem(r[0]), c = BASE.filter(j => j.l === r[3] && (sem(j.n) === n || sem(j.nc) === n));
    if (c.length > 1) { const p = c.filter(j => j.p === pos); if (p.length) return p[0]; }
    return c[0] || null;
  }
  const memo = new Map();
  function sinais(r, pos) {
    if (memo.has(r)) return memo.get(r);
    const bj = baseDe(r, pos); let letra = null, selo = '', tipo = null;
    if (bj) {
      let j = Object.assign({}, bj, { p: pos });
      try { if (typeof comFisicoDoEstudo === 'function') j = comFisicoDoEstudo(j) || j; } catch (e) {}
      try { letra = typeof tipoLetra === 'function' ? tipoLetra(j) : null; const x = typeof tipoResolvido === 'function' ? tipoResolvido(j) : null; tipo = x && x.tipo; } catch (e) {}
      try { selo = window.subidaSelo ? window.subidaSelo(Object.assign({}, bj, { p: pos })) : ''; } catch (e) {}
    }
    const o = { letra, tipo, selo }; memo.set(r, o); return o;
  }
  const letraHtml = l => l ? '<i class="nz-l nz-l' + l + '" title="tipo físico ' + l + ' (regra do clube)">' + l + '</i>' : '<i class="nz-l nz-l0" title="sem rastreio físico suficiente">–</i>';

  /* ---------- parecidos ---------- */
  function parecidos(t) {
    const pos = t.pos, E = estat(pos), alvo = t.r;
    const fis = INDS.filter(i => i.cat === 'fis' && typeof alvo[NC + i.k] === 'number'), tec = INDS.filter(i => i.cat !== 'fis' && typeof alvo[NC + i.k] === 'number');
    const res = { b: [], sa: [], ext: [] };
    S.posicoes[pos].jog.forEach(r => {
      if (r === alvo || r[2] === N.clube) return;
      const m = mercado(r); if (!m) return;
      if (r[6] != null && r[6] > TETO) return;
      const dz = lista => { let q = 0, n = 0; lista.forEach(i => { const v = r[NC + i.k]; if (typeof v !== 'number' || !isFinite(v)) return; const z = (alvo[NC + i.k] - v) / E.sd[i.k]; q += Math.min(9, z * z); n++; }); return n ? { d: Math.sqrt(q / n), n } : null; };
      const a = dz(tec); if (!a || a.n < tec.length * 0.7) return;
      const b = fis.length ? dz(fis) : null, comFis = b && b.n >= Math.max(3, fis.length * 0.6);
      const d = comFis ? 0.6 * a.d + 0.4 * b.d : a.d;
      res[m].push({ r, sim: Math.max(0, Math.round(100 - 45 * d)), comFis });
    });
    Object.keys(res).forEach(k => res[k] = res[k].sort((x, y) => (y.comFis - x.comFis) * 0 + y.sim - x.sim || y.r[7] - x.r[7]).slice(0, 6));
    return res;
  }

  /* ---------- características ---------- */
  function caracter(t) {
    const out = INDS.map(i => ({ i, v: t.r[NC + i.k], p: pct(t.pos, i, t.r[NC + i.k]) })).filter(x => x.p != null);
    const fortes = out.filter(x => x.p >= 80).sort((a, b) => b.p - a.p).slice(0, 7);
    const fracos = out.filter(x => x.p <= 20).sort((a, b) => a.p - b.p).slice(0, 5);
    return { fortes, fracos, todos: out };
  }

  /* ---------- tela ---------- */
  const corRank = (rank, n) => rank <= 4 ? 'top' : rank <= 8 ? 'bom' : rank <= n - 4 ? 'meio' : 'ruim';
  function barraRank(c) {
    return '<tr><td class="nz-rot">' + esc(c.rot) + '</td><td class="nz-v"><b>' + num(c.v, Math.abs(c.v) >= 100 ? 0 : c.v >= 10 ? 1 : 2) + '</b></td><td class="nz-m">' + num(c.media, Math.abs(c.media) >= 100 ? 0 : c.media >= 10 ? 1 : 2) + '</td>' +
      '<td class="nz-rk"><span class="nz-rkb"><i class="' + corRank(c.rank, c.n) + '" style="width:' + Math.round(100 * (c.n - c.rank + 1) / c.n) + '%"></i></span><b class="' + corRank(c.rank, c.n) + '">' + c.rank + 'º</b></td></tr>';
  }
  function blocoColetivo() {
    const C = N.campanha, T = N.treinador;
    const bl = {}; N.coletivo.forEach(c => (bl[c.bloco] = bl[c.bloco] || []).push(c));
    const top = N.coletivo.concat(N.fisico).filter(c => c.rank <= 3).map(c => c.rot.replace(/ \(.*\)| por jogo/g, ''));
    const baixo = N.coletivo.concat(N.fisico).filter(c => c.rank >= c.n - 6).map(c => c.rot.replace(/ \(.*\)| por jogo/g, '') + ' (' + c.rank + 'º)');
    let h = '<section class="nz-sec"><div class="nz-camp"><div><small>posição</small><b>' + C.pos + 'º</b></div><div><small>pontos</small><b>' + C.pts + '</b><em>em ' + C.J + ' jogos</em></div>' +
      '<div><small>V · E · D</small><b>' + C.V + ' · ' + C.E + ' · ' + C.D + '</b></div><div><small>gols</small><b>' + C.GP + ' : ' + C.GC + '</b><em>saldo +' + (C.GP - C.GC) + '</em></div>' +
      (T ? '<div><small>treinador</small><b class="nz-tr">' + esc(T.nome) + '</b><em>desde ' + esc(T.desde.slice(8) + '/' + T.desde.slice(5, 7) + '/' + T.desde.slice(0, 4)) + '</em></div>' : '') + '</div>' +
      '<div class="nz-ident"><h4>Identidade do time</h4><p><b class="v">Entre os 3 melhores da Série B:</b> ' + esc(top.join(' · ')) + '.</p>' +
      '<p><b class="r">Na metade de baixo:</b> ' + esc(baixo.join(' · ')) + '.</p>' +
      '<p class="nz-leitura">Leitura: time vertical e intenso. Tem menos a bola que a média e erra mais passe, mas joga longo para frente (passe mais comprido da liga), chega muito à área e finaliza; corre mais que quase todos (1º em distância correndo e em ações de alta intensidade) e é o mais rápido da liga. Defende bem sem a bola (2º menor xG sofrido) e ganha duelos.</p></div>';
    h += '<div class="nz-col2">';
    Object.keys(bl).forEach(b => { h += '<div class="nz-tabc"><h4>' + esc(b) + '</h4><table><tr><th>Indicador</th><th>Novorizontino</th><th>Média B</th><th>Ranking (de 20)</th></tr>' + bl[b].map(barraRank).join('') + '</table></div>'; });
    h += '<div class="nz-tabc"><h4>Físico do time (SkillCorner, ' + N.jogos_fis + ' jogos até ' + esc(N.ult_fis.slice(8) + '/' + N.ult_fis.slice(5, 7)) + ')</h4><table><tr><th>Indicador</th><th>Novorizontino</th><th>Média B</th><th>Ranking (de 20)</th></tr>' + N.fisico.map(barraRank).join('') + '</table></div>';
    return h + '</div></section>';
  }
  function cartao(t) {
    const r = t.r, s = sinais(r, t.pos), c = caracter(t), P = parecidos(t);
    const chip = (x, cl) => '<span class="nz-chip ' + cl + '" title="percentil ' + x.p + ' entre os ' + POSN[t.pos].toLowerCase() + 's da Série B 2026 · valor ' + num(x.v, x.i.casas) + '">' + esc((x.i.menor ? (cl === 'f' ? 'Poucas ' : 'Muitas ') + x.i.rot.charAt(0).toLowerCase() + x.i.rot.slice(1) : x.i.rot).replace('Poucas cartões', 'Poucos cartões').replace('Muitas cartões', 'Muitos cartões').replace(' por 90', '/90').replace(' por 30 min de posse', '/30 posse')) + ' <b>' + x.p + '</b></span>';
    const fisK = ['Velocidade máxima (PSV-99, km/h)', 'Sprints por 90', 'Arrancadas explosivas por 90', 'Ações de alta intensidade por 90'];
    const fisv = fisK.map(k => { const i = INDS.find(x => x.rot === k); const v = i ? r[NC + i.k] : null; return '<div><small>' + esc(k.replace(' por 90', '/90').replace('Velocidade máxima (PSV-99, km/h)', 'PSV-99 km/h')) + '</small><b>' + num(v, i ? i.casas : 1) + '</b>' + (i && v != null ? '<em>P' + pct(t.pos, i, v) + '</em>' : '') + '</div>'; }).join('');
    let h = '<article class="nz-card"><header><span class="nz-pos">' + t.pos + '</span><h3>' + esc(r[0]) + '</h3>' + letraHtml(s.letra) + s.selo +
      '<span class="nz-meta">' + (r[4] ? r[4] + ' anos · ' : '') + '<b>' + num(t.minW, 0) + '</b> min · contrato ' + esc(r[5] || '—') + (r[6] ? ' · € ' + num(r[6], 1) + ' MM' : '') + (s.tipo ? ' · ' + esc(s.tipo) : '') + '</span></header>' +
      '<div class="nz-fis">' + fisv + '</div>' +
      '<div class="nz-car"><div><h5>Fortes <small>(percentil ≥ 80 na posição, Série B 2026)</small></h5>' + (c.fortes.length ? c.fortes.map(x => chip(x, 'f')).join('') : '<span class="nz-vz">nenhum indicador no topo</span>') + '</div>' +
      '<div><h5>Fracos <small>(percentil ≤ 20)</small></h5>' + (c.fracos.length ? c.fracos.map(x => chip(x, 'r')).join('') : '<span class="nz-vz">nenhum indicador no fundo</span>') + '</div></div>' +
      '<div class="nz-par"><h5>Parecidos com ' + esc(r[0]) + ' <small>até € 2 MM · semelhança técnica + física na posição</small></h5><div class="nz-merc">';
    MERC.forEach(([k, nome]) => {
      h += '<div class="nz-m"><h6>' + esc(nome) + '</h6>' + (P[k].length ? '<table>' + P[k].map(x => { const q = x.r, sx = sinais(q, t.pos);
        return '<tr><td class="s"><b>' + x.sim + '</b></td><td class="n"><b>' + esc(q[0]) + '</b> ' + letraHtml(sx.letra) + sx.selo + '<br><small>' + esc(q[2]) + (k !== 'b' ? ' · ' + esc(q[3]) : '') + ' · ' + (q[4] || '—') + ' a · ' + num(q[7], 0) + ' min' + (q[6] ? ' · € ' + num(q[6], 1) + ' MM' : '') + (q[5] ? ' · ct ' + esc(q[5]) : '') + (x.comFis ? '' : ' · <i>sem físico</i>') + '</small></td></tr>'; }).join('') + '</table>' : '<p class="nz-vz">ninguém com dados suficientes</p>') + '</div>';
    });
    return h + '</div></div></article>';
  }
  function goleiros() {
    const g = N.elenco.filter(e => e.gk && e.min >= 90);
    if (!g.length) return '';
    return '<section class="nz-sec"><h3 class="nz-h">Goleiros</h3><table class="nz-el"><tr><th>Goleiro</th><th>Idade</th><th>Minutos</th><th>Gols sofridos/90</th><th>Defesas %</th><th>xG sofrido/90</th><th>Gols evitados/90</th><th>Saídas/90</th></tr>' +
      g.map(e => '<tr><td><b>' + esc(e.n) + '</b></td><td>' + (e.idade || '—') + '</td><td><b>' + num(e.min, 0) + '</b></td><td>' + num(e.gk.gs90, 2) + '</td><td>' + num(e.gk.def_pct, 1) + '</td><td>' + num(e.gk.xgs90, 2) + '</td><td><b>' + num(e.gk.evit90, 2) + '</b></td><td>' + num(e.gk.saidas90, 2) + '</td></tr>').join('') +
      '</table><p class="nz-nota">Goleiro não entra na base da Subida (sem rastreio físico e sem a régua de quem sobe), por isso não tem lista de parecidos.</p></section>';
  }
  function elenco(ts) {
    const tit = new Set(ts.map(t => sem(t.r[0])));
    return '<section class="nz-sec"><h3 class="nz-h">Elenco 2026 por minutos <small>(Wyscout, até a ' + esc(N.treinador ? N.treinador.rodada : '') + 'ª rodada)</small></h3><table class="nz-el"><tr><th>Jogador</th><th>Posição</th><th>Idade</th><th>Jogos</th><th>Minutos</th><th>Gols</th><th>Assist.</th><th>Contrato</th></tr>' +
      N.elenco.filter(e => e.min >= 200).map(e => '<tr' + (tit.has(sem(e.n)) ? ' class="t"' : '') + '><td><b>' + esc(e.n) + '</b>' + '' + '</td><td>' + esc(e.posicoes || e.pos) + '</td><td>' + (e.idade || '—') + '</td><td>' + e.jogos + '</td><td><b>' + num(e.min, 0) + '</b></td><td>' + e.gols + '</td><td>' + e.assist + '</td><td>' + esc(e.contrato || '—') + '</td></tr>').join('') +
      '</table><p class="nz-nota">Em destaque, os que têm 900 min ou mais e entram no estudo individual abaixo.</p></section>';
  }
  function render() {
    const R = document.getElementById('nzCorpo'); if (!R) return;
    if (typeof BASE === 'undefined' || !BASE.length) { R.innerHTML = '<p class="nz-vz">carregando a base…</p>'; setTimeout(render, 800); return; }
    const ts = titulares();
    let h = '<div class="nz-topo"><div><h2>Modelo Novorizontino — Série B 2026</h2><p>O time que mais faz gol e o 2º colocado da Série B, como referência para o Santa Cruz: o coletivo (técnico e físico, com o ranking entre os 20), as características de cada jogador da base do time e, para cada um, os jogadores mais parecidos que cabem no orçamento — na Série B, nas ligas sul-americanas e sul-americanos no exterior.</p></div><button class="ta-bt" id="nzPdf">Gerar PDF</button></div>';
    h += blocoColetivo();
    h += elenco(ts);
    h += '<section class="nz-sec"><h3 class="nz-h">Os jogadores, um a um <small>(' + ts.length + ' com 900 min ou mais na Série B 2026)</small></h3>' + ts.map(cartao).join('') + '</section>';
    h += goleiros();
    h += '<div class="nz-nota nz-met"><b>Como ler.</b> Ranking coletivo: 1º = melhor da Série B 2026 naquele indicador (no PPDA, gols sofridos, xG sofrido, finalizações sofridas e faltas, o menor é o melhor). Físico do time = soma dos jogadores por jogo no SkillCorner. ' +
      'Percentil do jogador: posição dele entre os jogadores da mesma posição na Série B 2026 com 900 min ou mais (100 = melhor; em faltas e cartões, quem faz menos). Letra A/B/C: tipo físico pela regra do clube. Selo ▲ ↔ ▼: indicadores fundamentais de quem sobe. ' +
      'Semelhança (0–100, acima de 60 = perfil muito próximo; 50–60 = próximo): distância padronizada dentro da posição em todos os indicadores técnicos e físicos que os dois têm — 60% técnico, 40% físico; sem físico, só o técnico (marcado "sem físico"). Os números de quem joga fora estão na liga de origem: um mesmo perfil numa liga mais fraca tende a ter números maiores — o vídeo decide. Teto de € 2 MM de valor de mercado; vetados ficam de fora; no exterior, só as ligas ao alcance do Santa Cruz (as do estudo V2: segundas divisões europeias, Leste Europeu, Grécia, Israel, EUA, México, China…) e sem os grandes delas. Foto e escudo não estão na base do app.</div>';
    R.innerHTML = h;
  }
  function ligar() {
    const bt = document.querySelector('.aba[data-aba="novoriz"]'), pg = document.getElementById('pgNovoriz'), R = document.getElementById('nzCorpo');
    if (!bt || !pg || !R) return;
    R.addEventListener('click', ev => { if (ev.target.id === 'nzPdf') { document.body.classList.add('imp-novoriz'); const fim = () => { document.body.classList.remove('imp-novoriz'); window.removeEventListener('afterprint', fim); }; window.addEventListener('afterprint', fim); window.print(); } });
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on) render(); };
    window.addEventListener('subida-kpis', () => { memo.clear(); if (bt.classList.contains('on')) render(); });
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  window.nzRender = render;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
