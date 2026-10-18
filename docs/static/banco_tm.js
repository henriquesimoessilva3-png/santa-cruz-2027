/* Aba "Banco Transfermarkt" — todos os jogadores de uma confederação no formato do Transfermarkt
   (nome, posição, idade, clube, valor, CONTRATO) com os selos do clube (letra física, seta de subida,
   bola parada) e o "+ Mais": técnico e físico comparados com o mundo, o grupo de ligas e a Série B
   (padrão) ou a Série A.
   Dado: static/banco_tm/ (gerado no Portal Transfermarkt, Analytics/Portal Transfermarkt/exportar_santacruz.py).
   Arquivo próprio, sem encostar no app.js: observa o botão da aba, como as outras abas do estudo. */
(function () {
  'use strict';
  /* 18/10/2026 — na visão nova (static/visao_nova.js) a aba vira o "Banco de consulta" e lê static/mercado/
     (gerar_mercado.py): o mesmo Banco, mais a coluna xT e as linhas "só Wyscout" dos mercados que interessam.
     Os + Mais continuam vindo de static/banco_tm/ (não são copiados). */
  const NOVA = !!window.VISAO_NOVA;
  const BASE_URL = NOVA ? 'static/mercado/' : 'static/banco_tm/';
  const MAIS_URL = 'static/banco_tm/';
  const FOTO = 'https://img.a.transfermarkt.technology/portrait/';
  const TM = 'https://www.transfermarkt.com.br';
  const POR_PAG = 100;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const semAc = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const num = (x, d) => x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const casas = v => Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2;
  const ORDEM_POS = ['Goleiro', 'Zagueiro', 'Lateral Dir.', 'Lateral Esq.', 'Volante', 'Meia Central', 'Meia Direita', 'Meia Esquerda',
    'Meia Ofensivo', 'Ponta Direita', 'Ponta Esquerda', 'Seg. Atacante', 'Centroavante'];
  const LS = 'sc_banco_tm';

  let J = null, META = null, carregando = null;
  const MAIS = {};
  const F0 = { busca: '', pos: [], pais: '', idmin: '', idmax: '', vmin: '', vmax: '', ctr: '', letra: [], seta: [], bp: [], dados: false, ordem: 'valor' };
  let E = { serie: 'B', pag: 1, xt: false, f: Object.assign({}, F0) };
  try { const g = JSON.parse(localStorage.getItem(LS) || 'null'); if (g) { E = Object.assign(E, g); E.f = Object.assign({}, F0, g.f || {}); E.pag = 1; } } catch (e) {}
  const grava = () => { try { localStorage.setItem(LS, JSON.stringify({ serie: E.serie, xt: E.xt, f: E.f })); } catch (e) {} };
  const temXt = () => !!(J && J.some(j => j.xt != null));   /* a coluna xT só existe no dado da visão nova (gerar_mercado.py) */

  function carregar() {
    if (carregando) return carregando;
    carregando = Promise.all([fetch(BASE_URL + 'lista.json').then(r => r.json()), fetch(BASE_URL + 'meta.json').then(r => r.json())])
      .then(([l, m]) => {
        const c = l.campos;
        J = l.linhas.map(a => { const o = {}; c.forEach((k, i) => { o[k] = a[i]; }); o._b = semAc(o.nome + ' ' + (o.clube || '')); o._p1 = String(o.nacs || '').split('/')[0].trim(); return o; });
        META = m;
      });
    return carregando;
  }

  /* ---------- filtros ---------- */
  function mesesDaqui(n) { const d = new Date(); d.setMonth(d.getMonth() + n); return d.toISOString().slice(0, 10); }
  function filtrar() {
    const f = E.f, t = semAc(f.busca).split(/\s+/).filter(Boolean);
    const lim = f.ctr === '6m' ? mesesDaqui(6) : f.ctr === '12m' ? mesesDaqui(12) : f.ctr === '18m' ? mesesDaqui(18) : f.ctr.startsWith('ate') ? f.ctr.slice(3) + '-12-31' : null;
    const sk = E.serie === 'A' ? 'sA' : 'sB';
    let r = J.filter(j => {
      if (t.length && !t.every(p => j._b.includes(p))) return false;
      if (f.pos.length && !f.pos.includes(j.pos)) return false;
      if (f.pais && j._p1 !== f.pais) return false;
      if (f.idmin && !(j.idade >= +f.idmin)) return false;
      if (f.idmax && !(j.idade <= +f.idmax)) return false;
      if (f.vmin && !(j.valor >= f.vmin * 1e6)) return false;
      if (f.vmax && !(j.valor != null && j.valor <= f.vmax * 1e6)) return false;
      if (f.ctr === 'livre' && j.clube !== 'Sem clube') return false;
      if (f.ctr === 'sem' && (j.contrato || j.clube === 'Sem clube')) return false;
      if (lim && !(j.contrato && j.contrato <= lim)) return false;
      if (f.letra.length && !f.letra.includes(j.letra)) return false;
      if (f.seta.length && !f.seta.includes(j[sk])) return false;
      if (f.bp.length && !f.bp.every(b => j[b])) return false;
      if (f.dados && !j.pw) return false;
      return true;
    });
    const o = f.ordem;
    const cmp = o === 'valor_asc' ? (a, b) => (a.valor ?? 9e15) - (b.valor ?? 9e15)
      : o === 'idade' ? (a, b) => (a.idade ?? 99) - (b.idade ?? 99) || (b.valor || 0) - (a.valor || 0)
      : o === 'contrato' ? (a, b) => (a.contrato || '9999') < (b.contrato || '9999') ? -1 : (a.contrato || '9999') > (b.contrato || '9999') ? 1 : (b.valor || 0) - (a.valor || 0)
      : o === 'nome' ? (a, b) => a.nome.localeCompare(b.nome)
      : o === 'xt' ? (a, b) => (b.xt ?? -1) - (a.xt ?? -1) || (b.valor || 0) - (a.valor || 0)
      : (a, b) => (b.valor ?? -1) - (a.valor ?? -1);
    return r.sort(cmp);
  }

  /* ---------- pedaços ---------- */
  function moeda(v) {
    if (v == null) return '<span class="btm-vaz">—</span>';
    if (v >= 1e6) return '€ ' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: v >= 1e7 ? 0 : 1 }) + ' mi';
    return '€ ' + Math.round(v / 1e3) + ' mil';
  }
  const dataBR = iso => iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4) : '';
  function contrato(j) {
    if (j.clube === 'Sem clube') return '<span class="btm-ctr livre">LIVRE</span>';
    if (!j.contrato) return '<span class="btm-ctr sem">sem data</span>';
    const dias = (new Date(j.contrato) - new Date()) / 864e5;
    const c = dias <= 183 ? 'vence' : dias <= 365 ? 'breve' : 'ok';
    const f = j.ctf === 'w' ? '<small>via Wyscout</small>' : j.ctf === 'r' ? '<small>via Ranking</small>' : '';
    return '<span class="btm-ctr ' + c + '">' + dataBR(j.contrato) + '</span>' + f;
  }
  const letraH = (l, t) => l ? '<span class="tipo-abc tipo-' + (l === 'A+' ? 'Ap' : l) + '" title="' + esc(t || '') + '">' + l + '</span>' : '<span class="btm-vaz">—</span>';
  function setaH(s, ok, n, tem) {
    if (!s) return tem ? '<span class="btm-seta n" title="menos de 4 indicadores principais medidos">?</span>' : '<span class="btm-vaz">—</span>';
    const c = s === '▲' ? 'v' : s === '↔' ? 'a' : 'r';
    return '<span class="btm-seta ' + c + '" title="cumpre ' + ok + ' de ' + n + ' indicadores principais medidos — ▲ 60% ou mais · ↔ 35% a 60% · ▼ menos de 35%">' + s + '<small>' + ok + '/' + n + '</small></span>';
  }
  function bpH(j) {
    const b = [];
    if (j.cob) b.push('<span class="cob" title="Cobrador de bola parada: índice ≥ 80 na liga">⚑ Cobrador</span>');
    if (j.aerof) b.push('<span class="aerof" title="Finalizador aéreo: índice ≥ 80 na liga">▲ Aérea of.</span>');
    if (j.aer) b.push('<span class="aer" title="Duelo aéreo: % ganho ≥ P80 na liga (2,5+ duelos/90)">△ Aérea</span>');
    if (j.pen) b.push('<span class="pen" title="Bateu 2+ pênaltis">Pênalti</span>');
    return b.length ? '<div class="btm-bp">' + b.join('') + '</div>' : '<span class="btm-vaz">—</span>';
  }
  const POS11 = { 'Lateral Dir.': 'LD', 'Lateral Esq.': 'LE', 'Zagueiro': 'ZD', 'Volante': 'VOL', 'Meia Central': 'MED', 'Meia Ofensivo': 'MEI', 'Ponta Direita': 'ED', 'Ponta Esquerda': 'EE', 'Centroavante': 'CA', 'Seg. Atacante': 'CA', 'Meia Direita': 'ED', 'Meia Esquerda': 'EE' };
  function farolLinha(j, sk) {
    if (typeof farolDe !== 'function') return '';
    const seta = sk === 'A' ? j.sA : j.sB, selo = seta === '▲' ? 'v' : seta === '↔' ? 'a' : seta === '▼' ? 'r' : 'n';
    const pos = j.p11 || POS11[j.pos] || null; if (!pos) return '<span class="btm-vaz">—</span>';
    const c = farolDe(j.letra || null, selo, pos);
    return c ? farolHtml(c, pos, j.letra, selo, true) : '<span class="btm-vaz">—</span>';
  }
  const xtH = j => j.xt == null ? '<span class="btm-vaz">—</span>' : '<span class="btm-xt" title="índice de ameaça (aproximação de xT) por 90, da aba Ameaça · P = percentil na posição">' + num(j.xt, 2) + (j.xtp != null ? '<small>P' + j.xtp + '</small>' : '') + '</span>';
  const chips = (k, vals, rot) => vals.map((v, i) => '<button class="btm-chip' + (E.f[k].includes(v) ? ' on' : '') + '" data-k="' + k + '" data-v="' + esc(v) + '">' + esc(rot ? rot[i] : v) + '</button>').join('');

  /* ---------- tela ---------- */
  function topo() {
    const f = E.f;
    const paises = [...new Set(J.map(j => j._p1))].filter(Boolean);
    const cont = {}; J.forEach(j => { cont[j._p1] = (cont[j._p1] || 0) + 1; });
    paises.sort((a, b) => cont[b] - cont[a]);
    const poss = ORDEM_POS.concat([...new Set(J.map(j => j.pos))].filter(p => p && !ORDEM_POS.includes(p)).sort());
    const comCtr = J.filter(j => j.contrato).length, comMais = J.filter(j => j.pw).length, soW = J.filter(j => j.fonte === 'w').length;
    return '<div class="btm-topo"><div><h2>' + (NOVA ? 'Banco de consulta' : 'Banco Transfermarkt · ' + esc(META.confs.join(', '))) + '</h2>' +
      '<p>Jogadores dos países da CONMEBOL (onde quer que joguem), coletados país por país e posição por posição no Transfermarkt. ' +
      '<b class="btm-n">' + (J.length - soW).toLocaleString('pt-BR') + '</b> jogadores · <b class="btm-n">' + comCtr.toLocaleString('pt-BR') + '</b> com data de contrato · ' +
      '<b class="btm-n">' + comMais.toLocaleString('pt-BR') + '</b> com técnico/físico (Wyscout ' + esc(META.periodo) + ' + SkillCorner)' +
      (soW ? ' · <b class="btm-n">+ ' + soW.toLocaleString('pt-BR') + '</b> só do Wyscout (Série B, Série A, ligas sul-americanas e sul-americanos fora: sem ficha do Transfermarkt, marcados na lista)' : '') + '. ' +
      'Letra, seta e bola parada seguem as mesmas regras das outras abas do app.</p></div>' +
      '<div class="btm-serie"><span>Comparar com</span><button data-serie="B" class="' + (E.serie === 'B' ? 'on' : '') + '">Série B</button><button data-serie="A" class="' + (E.serie === 'A' ? 'on' : '') + '">Série A</button></div></div>' +
      '<div class="btm-filtros">' +
      '<div class="btm-linha"><label>Posição</label><div class="btm-chips">' + chips('pos', poss) + '</div></div>' +
      '<div class="btm-linha"><label>Tipo físico</label><div class="btm-chips">' + chips('letra', ['A+', 'A', 'B', 'C']) + '</div>' +
      '<label>Subida (Série ' + E.serie + ')</label><div class="btm-chips">' + chips('seta', ['▲', '↔', '▼'], ['▲ cumpre', '↔ metade', '▼ abaixo']) + '</div>' +
      '<label>Bola parada</label><div class="btm-chips">' + chips('bp', ['cob', 'aerof', 'aer', 'pen'], ['⚑ Cobrador', '▲ Aérea ofensiva', '△ Aérea', 'Pênalti']) + '</div>' +
      '<label class="btm-ck"><input type="checkbox" id="btmDados"' + (f.dados ? ' checked' : '') + '> só com técnico/físico</label>' +
      (temXt() ? '<label class="btm-ck"><input type="checkbox" id="btmXt"' + (E.xt ? ' checked' : '') + '> coluna xT</label>' : '') + '</div>' +
      '<div class="btm-linha">' +
      '<input class="btm-in btm-busca" id="btmBusca" placeholder="Jogador ou clube" value="' + esc(f.busca) + '">' +
      '<select class="btm-in" id="btmPais"><option value="">Todos os países</option>' + paises.map(p => '<option' + (p === f.pais ? ' selected' : '') + '>' + esc(p) + '</option>').join('') + '</select>' +
      '<span class="btm-faixa">Idade <input class="btm-in n" id="btmIdmin" type="number" placeholder="de" value="' + esc(f.idmin) + '"><input class="btm-in n" id="btmIdmax" type="number" placeholder="até" value="' + esc(f.idmax) + '"></span>' +
      '<span class="btm-faixa">Valor € mi <input class="btm-in n" id="btmVmin" type="number" step="0.1" placeholder="de" value="' + esc(f.vmin) + '"><input class="btm-in n" id="btmVmax" type="number" step="0.1" placeholder="até" value="' + esc(f.vmax) + '"></span>' +
      '<select class="btm-in" id="btmCtr">' + [['', 'Contrato: todos'], ['livre', 'Livres (sem clube)'], ['6m', 'Termina em até 6 meses'], ['12m', 'Termina em até 12 meses'], ['18m', 'Termina em até 18 meses'], ['ate2026', 'Termina até dez/2026'], ['ate2027', 'Termina até dez/2027'], ['sem', 'Sem data de contrato']].map(o => '<option value="' + o[0] + '"' + (o[0] === f.ctr ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select>' +
      '<select class="btm-in" id="btmOrdem">' + [['valor', 'Valor — maior'], ['valor_asc', 'Valor — menor'], ['contrato', 'Contrato — termina antes'], ['idade', 'Idade — mais novo'], ['nome', 'Nome (A-Z)']].concat(temXt() ? [['xt', 'xT — maior']] : []).map(o => '<option value="' + o[0] + '"' + (o[0] === f.ordem ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select>' +
      '<button class="btm-bt" id="btmLimpar">Limpar</button></div></div>';
  }

  function tabela() {
    const r = filtrar(), pags = Math.max(1, Math.ceil(r.length / POR_PAG));
    if (E.pag > pags) E.pag = pags;
    const ini = (E.pag - 1) * POR_PAG, pg = r.slice(ini, ini + POR_PAG), sk = E.serie;
    let h = '<div class="btm-barra"><span><b class="btm-n">' + r.length.toLocaleString('pt-BR') + '</b> jogadores no filtro</span>' +
      '<span class="btm-leg">Letra: <b class="l-ap">A+</b> explosivo e motor de volume · <b class="l-a">A</b> o tipo mais forte da posição · <b class="l-b">B</b> o do meio · <b class="l-c">C</b> baixa intensidade &nbsp;|&nbsp; Seta: indicadores principais de quem sobe que ele cumpre</span></div>';
    if (!r.length) return h + '<p class="btm-vazio">Nenhum jogador com esses filtros.</p>';
    const xt = E.xt && temXt();
    h += '<div class="btm-rol"><table class="btm-tab"><thead><tr><th>#</th><th>Jogador</th><th class="c">Idade</th><th>Nacionalidade</th><th>Clube</th><th class="d">Valor</th><th>Contrato até</th><th class="c">Físico</th><th>Série ' + sk + '</th><th>Bola parada</th>' + (NOVA ? '<th title="Farol: letra + seta pela regra da posição (a seta do Banco ainda inclui físico — vem do Portal)">Farol</th>' : '') + (xt ? '<th class="d" title="índice de ameaça (aproximação de xT) por 90 — aba Ameaça">xT</th>' : '') + '<th></th></tr></thead><tbody>';
    pg.forEach((j, i) => {
      const soW = j.fonte === 'w';
      h += '<tr class="btm-l' + (soW ? ' btm-w' : '') + '" data-id="' + esc(j.id) + '"><td class="btm-i">' + (ini + i + 1) + '</td>' +
        '<td><div class="btm-jog">' + (j.foto ? '<img loading="lazy" src="' + FOTO + esc(j.foto) + '" alt="">' : '<span class="btm-semfoto"></span>') +
        '<div>' + (j.url ? '<a href="' + TM + esc(j.url) + '" target="_blank" rel="noopener">' + esc(j.nome) + '</a>' : '<b>' + esc(j.nome) + '</b>') + '<small>' + esc(j.pos || '') + (j.pe ? ' · ' + esc(j.pe) : '') + (j.altura ? ' · ' + num(j.altura, 2) + ' m' : '') + (soW ? ' · <em class="btm-fonte" title="Jogador que não está no Banco Transfermarkt: linha montada com o Wyscout (≥ 900 min) — sem foto, sem ficha do TM e sem o + Mais">só Wyscout</em>' : '') + '</small></div></div></td>' +
        '<td class="c btm-idade">' + (j.idade ?? '—') + '</td><td>' + esc(String(j.nacs || '').replace(/\s*\/\s*/g, ' / ')) + '</td>' +
        '<td>' + esc(j.clube || '—') + (j.liga ? '<small class="btm-liga">' + esc(j.liga) + '</small>' : '') + '</td>' +
        '<td class="d btm-valor">' + moeda(j.valor) + '</td><td>' + contrato(j) + '</td>' +
        '<td class="c">' + letraH(j.letra, j.letra_t) + '</td>' +
        '<td>' + (sk === 'A' ? setaH(j.sA, j.okA, j.nA, !!j.pw) : setaH(j.sB, j.okB, j.nB, !!j.pw)) + '</td>' +
        '<td>' + bpH(j) + '</td>' + (NOVA ? '<td>' + farolLinha(j, sk) + '</td>' : '') + (xt ? '<td class="d">' + xtH(j) + '</td>' : '') +
        '<td><button class="btm-mais"' + (j.pw ? '' : ' disabled title="' + (soW ? 'Linha só do Wyscout: o + Mais (percentis contra o mundo e a Série B) só o Portal Transfermarkt gera' : 'Sem dado do Wyscout/SkillCorner neste período') + '"') + '>+ Mais</button></td></tr>';
    });
    h += '</tbody></table></div><div class="btm-pag"><button class="btm-bt" data-pag="-1"' + (E.pag <= 1 ? ' disabled' : '') + '>←</button><span>página ' + E.pag + ' de ' + pags + '</span><button class="btm-bt" data-pag="1"' + (E.pag >= pags ? ' disabled' : '') + '>→</button></div>';
    return h;
  }

  /* ---------- + Mais ---------- */
  const FIS = new Set(['psv99', 'n_sprints_p90', 'explosive_accel_to_sprint', 'high_accel_p90', 'hi_actions_p90', 'total_distance_p90', 'hsr_distance_p90', 'running_distance_p90', 'runs_p30tip', 'runs_penalty_area_p30tip']);
  const BPK = new Set(['escanteios_p90', 'faltas_cobradas_p90', 'faltas_diretas_p90', 'penaltis', 'aereos_p90', 'aereos_pct', 'aereos_ganhos_p90w', 'golos_cabeca']);
  const cor = p => p == null ? 'var(--borda2)' : p >= 75 ? '#1f8f4e' : p >= 50 ? '#b8860b' : p >= 25 ? '#c46a1b' : '#8a3a3a';
  const barra = (p, ex) => p == null ? '<span class="btm-vaz">—</span>' :
    '<div class="btm-pb"><i><b style="width:' + Math.max(2, p) + '%;background:' + cor(p) + '"></b></i><em>' + p + '</em>' + (ex ? '<small>' + ex + '</small>' : '') + '</div>';

  function painel(j, d) {
    const R = META.rotulos, ref = META.ref[d.pos] || {}, S = E.serie, iS = S === 'A' ? 4 : 3, selo = META.selo[d.pos] || [];
    const L = d.letra, sB = S === 'A' ? d.setaA : d.setaB, bp = d.bp;
    let h = '<div class="btm-cab">';
    h += '<div class="btm-cx"><h4>Fonte dos dados</h4><b class="btm-g">' + esc(d.liga) + '</b><p><b class="btm-n">' + num(d.min, 0) + '</b> min no Wyscout (' + esc(META.periodo) + ')<br>grupo de ligas: ' + esc(d.grupo) + '<br>posição no Wyscout: ' + esc(d.pos) + (d.fis ? '' : '<br>sem rastreio SkillCorner') + '</p></div>';
    h += '<div class="btm-cx"><h4>Tipo físico</h4>' + (L ? letraH(L.l, L.t) + ' <b class="btm-g">' + esc(L.t) + '</b><p>explosão <b class="btm-n">' + (L.ze > 0 ? '+' : '') + num(L.ze, 2) + '</b> · volume <b class="btm-n">' + (L.zv > 0 ? '+' : '') + num(L.zv, 2) + '</b> desvio<br>(contra a Série B do setor)</p>' : '<p>sem rastreio físico</p>') + '</div>';
    if (sB) {
      h += '<div class="btm-cx"><h4>' + (S === 'A' ? 'Série A — mediana da posição' : 'Série B — mínimo de quem sobe') + '</h4>' + setaH(sB.s, sB.ok, sB.n, true) +
        ' <small class="btm-m">indicadores principais' + (sB.tot && sB.n < sB.tot ? ' (' + (sB.tot - sB.n) + ' sem dado' + (sB.parcial ? ', parcial' : '') + ')' : '') + '</small><ul>' +
        sB.det.map(x => '<li class="' + (x[3] == null ? 'sem' : x[3] ? 'ok' : 'nao') + '">' + (x[3] == null ? '·' : x[3] ? '✓' : '✗') + ' ' + esc(R[x[0]] || x[0]) + ': <b>' + (x[1] == null ? '—' : num(x[1], casas(x[1]))) + '</b> <small>(' + (S === 'A' ? 'mediana' : 'mín.') + ' ' + (x[2] == null ? '—' : num(x[2], casas(x[2]))) + ')</small></li>').join('') + '</ul></div>';
    }
    if (bp) {
      const li = (f, t) => '<li class="' + (f ? 'ok' : 'sem') + '">' + (f ? '✓' : '·') + ' ' + t + '</li>';
      h += '<div class="btm-cx"><h4>Bola parada <small>(índice na liga, selo ≥ 80)</small></h4><ul>' +
        li(bp.cob, '⚑ Cobrador: índice <b>' + (bp.cob_i ?? '—') + '</b> · <b>' + num(bp.esc, 2) + '</b> escanteios e <b>' + num(bp.fal, 2) + '</b> faltas /90') +
        li(bp.aerof, '▲ Aérea ofensiva: índice <b>' + (bp.aerof_i ?? '—') + '</b> · <b>' + (bp.cab ?? 0) + '</b> gols de cabeça') +
        li(bp.aer, '△ Aérea (duelo): P<b>' + (bp.aer_i ?? '—') + '</b> · <b>' + num(bp.aer_pct, 1) + '%</b> ganhos em <b>' + num(bp.aer_n, 1) + '</b>/90') +
        li(bp.pen, 'Pênaltis batidos: <b>' + (bp.pen_v ?? 0) + '</b>') + '</ul>' +
        ((bp.aer_n ?? 0) < 2.5 ? '<p>aéreo só conta para quem disputa 2,5+ duelos aéreos/90</p>' : '') + '</div>';
    }
    h += '</div>';
    const g = { selo: [], fis: [], tec: [], bp: [] };
    Object.entries(d.ind).forEach(([k, a]) => {
      const gr = selo.includes(k) ? 'selo' : FIS.has(k) ? 'fis' : BPK.has(k) ? 'bp' : 'tec', rf = ref[k] || {};
      g[gr].push('<tr><td>' + esc(R[k] || k) + (META.menor.includes(k) ? ' <small>(menos é melhor)</small>' : '') + '</td><td class="v">' + num(a[0], casas(a[0])) + '</td>' +
        '<td>' + barra(a[1], 'med ' + (rf.M == null ? '—' : num(rf.M, casas(rf.M)))) + '</td><td>' + barra(a[2]) + '</td>' +
        '<td>' + barra(a[iS], 'med ' + (rf[S] == null ? '—' : num(rf[S], casas(rf[S])))) + '</td></tr>');
    });
    const NOME = { selo: 'Indicadores principais da posição (os do selo)', fis: 'Tipo físico (SkillCorner)', tec: 'Técnico (Wyscout)', bp: 'Bola parada' };
    h += '<table class="btm-ind"><thead><tr><th>Indicador</th><th class="d">Valor</th><th>Mundo (percentil na posição)</th><th>Grupo: ' + esc(d.grupo) + '</th><th>Liga destino: Série ' + S + '</th></tr></thead><tbody>';
    ['selo', 'fis', 'tec', 'bp'].forEach(k => { if (g[k].length) h += '<tr class="sec"><td colspan="5">' + NOME[k] + '</td></tr>' + g[k].join(''); });
    h += '</tbody></table><p class="btm-nota">Percentil 0–100 dentro da mesma posição (lados direito e esquerdo juntos). Mundo = 65 ligas do Ranking; grupo = só o grupo de ligas dele; liga destino (Série ' + S +
      ') = onde o número dele cairia entre os jogadores da posição na Série ' + S + '. Número da liga de origem, sem ajuste de força de liga.' + (d.ct ? ' Contrato no Wyscout: ' + dataBR(d.ct) + '.' : '') + '</p>';
    return h;
  }

  async function abrirMais(tr) {
    const aberto = tr.nextElementSibling && tr.nextElementSibling.classList.contains('btm-det');
    document.querySelectorAll('.btm-det').forEach(x => x.remove());
    document.querySelectorAll('.btm-mais.on').forEach(x => x.classList.remove('on'));
    if (aberto) return;
    const j = J.find(x => x.id === tr.dataset.id); if (!j || !j.pw) return;
    tr.querySelector('.btm-mais').classList.add('on');
    const det = document.createElement('tr'); det.className = 'btm-det';
    det.innerHTML = '<td colspan="' + (11 + (E.xt && temXt() ? 1 : 0) + (NOVA ? 1 : 0)) + '"><p class="btm-vazio">carregando...</p></td>'; tr.after(det);
    if (!MAIS[j.pw]) MAIS[j.pw] = fetch(MAIS_URL + 'mais_' + j.pw + '.json').then(r => r.json()).catch(() => ({}));
    const d = (await MAIS[j.pw])[j.id];
    det.firstChild.innerHTML = d ? painel(j, d) : '<p class="btm-vazio">Sem dado do Wyscout/SkillCorner para este jogador.</p>';
  }

  /* ---------- montagem e eventos ---------- */
  const corpo = () => document.getElementById('btmCorpo');
  function render() {
    const c = corpo(); if (!c) return;
    if (!J) { c.innerHTML = '<p class="btm-vazio">carregando o banco...</p>'; carregar().then(render).catch(() => { c.innerHTML = '<p class="btm-vazio">Não consegui carregar static/banco_tm/.</p>'; }); return; }
    c.innerHTML = topo() + '<div id="btmTabela">' + tabela() + '</div>';
  }
  const refazTabela = () => { const t = document.getElementById('btmTabela'); if (t) t.innerHTML = tabela(); grava(); };
  let timer;
  function ligarEventos() {
    const c = corpo(); if (!c || c.dataset.ok) return; c.dataset.ok = '1';
    c.addEventListener('click', e => {
      const ch = e.target.closest('.btm-chip');
      if (ch) { const k = ch.dataset.k, v = ch.dataset.v, a = E.f[k]; const i = a.indexOf(v); i >= 0 ? a.splice(i, 1) : a.push(v); ch.classList.toggle('on'); E.pag = 1; refazTabela(); return; }
      const se = e.target.closest('[data-serie]');
      if (se) { E.serie = se.dataset.serie; grava(); render(); return; }
      const pg = e.target.closest('[data-pag]');
      if (pg) { E.pag += +pg.dataset.pag; refazTabela(); c.scrollIntoView({ block: 'start' }); return; }
      if (e.target.id === 'btmLimpar') { E.f = JSON.parse(JSON.stringify(F0)); E.pag = 1; grava(); render(); return; }
      const m = e.target.closest('.btm-mais');
      if (m && !m.disabled) abrirMais(m.closest('tr'));
    });
    const campo = { btmBusca: 'busca', btmPais: 'pais', btmIdmin: 'idmin', btmIdmax: 'idmax', btmVmin: 'vmin', btmVmax: 'vmax', btmCtr: 'ctr', btmOrdem: 'ordem' };
    c.addEventListener('input', e => {
      const k = campo[e.target.id];
      if (k) { E.f[k] = e.target.value; E.pag = 1; clearTimeout(timer); timer = setTimeout(refazTabela, e.target.tagName === 'SELECT' ? 0 : 250); }
      if (e.target.id === 'btmDados') { E.f.dados = e.target.checked; E.pag = 1; refazTabela(); }
      if (e.target.id === 'btmXt') { E.xt = e.target.checked; grava(); render(); }
    });
  }
  function ligar() {
    const bt = document.querySelector('.aba[data-aba="bancotm"]'), pg = document.getElementById('pgBancoTM');
    if (!bt || !pg) return;
    ligarEventos();
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on && !corpo().dataset.feito) { corpo().dataset.feito = '1'; render(); } };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
