/* Aba "Bola parada · jogadores" — quem cobra e quem finaliza, pelo estudo Santa Cruz V2.
   Dado: static/bp_jogadores_dados.js (gerar_bp_jogadores_js.py), com duas partes:
     - ESPECIALISTAS: os 25 melhores cobradores e finalizadores aéreos de cada mercado
       (Série B, Série A, ligas sul-americanas, sul-americanos no exterior), índice do Wyscout;
     - PRODUÇÃO: gols e assistências em lances de bola parada na Série B 2022–2026, jogador a
       jogador, pelo Sofascore (1.810 jogos).
   Arquivo próprio, sem encostar no app.js: um observador acompanha o botão da aba e mostra ou
   esconde a página, como nas abas Bola parada por treinador e Estudo Série B V2. */
(function () {
  'use strict';
  const D = window.BP_JOGADORES;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const semAc = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const num = (x, d) => x == null || x === '' || !isFinite(x) ? '—' : Number(x).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const ler = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  const st = Object.assign({ vis: 'esp', merc: 'Série B', tipo: 'cobr', pos: '', anos: 'u3', busca: '',
                             ordE: null, dirE: -1, ordP: 'assist_bp', dirP: -1 }, ler('bpjEstado') || {});

  /* rótulo, casas decimais e explicação de cada coluna das planilhas */
  const COL = {
    liga: ['Liga', null], pos11: ['Pos', null], jogador: ['Jogador', null], clube: ['Clube', null], idade: ['Idade', 0],
    minutos: ['Min', 0], contrato: ['Contrato', null], valor: ['Valor (€)', 0], passaporte: ['Passaporte', null],
    indice_cobrador: ['Índice', 0, 'Índice do cobrador: percentil na liga em escanteios/90 e faltas/90 (peso 3), faltas diretas/90, faltas diretas no alvo %, xA/90 e cruzamento certo % (peso 1)'],
    escanteios_temporada: ['Escanteios', 0, 'escanteios cobrados na temporada'],
    faltas_cobradas_temporada: ['Faltas', 0, 'faltas cobradas na temporada'],
    faltas_diretas_temporada: ['Faltas dir.', 0, 'faltas diretas na temporada'],
    'Direct free kicks on target, %': ['F. dir. no alvo %', 0], 'xA per 90': ['xA/90', 2], 'Accurate crosses, %': ['Cruz. certo %', 0],
    cobrador_2025: ['Índice 2025', 0, 'o mesmo índice em 2025: quem repete'], escanteios_2025: ['Esc. 2025', 0],
    assist_bp_2026: ['Assist. BP 26', 0, 'assistências em lances de bola parada na Série B 2026 (Sofascore)'],
    assist_bp_3t: ['Assist. BP 24–26', 0, 'assistências em bola parada, Série B 2024–2026 (Sofascore)'],
    assist_escanteio_3t: ['de escanteio', 0, 'das assistências de 2024–26, quantas de escanteio'],
    gols_falta_direta_3t: ['Gols falta dir. 24–26', 0, 'gols de falta direta, Série B 2024–2026 (Sofascore)'],
    indice_finalizador: ['Índice', 0, 'Índice do finalizador aéreo: percentil na liga, entre jogadores de linha com ≥ 2,5 duelos aéreos/90, em gols de cabeça/90 (3), gols de cabeça (2), duelos aéreos ganhos % (2), duelos aéreos/90 (2) e altura (1)'],
    'Head goals': ['Gols cabeça', 0], 'Head goals per 90': ['Gols cabeça/90', 2], 'Aerial duels per 90': ['Aéreos/90', 1],
    'Aerial duels won, %': ['Aéreos ganhos %', 0], Height: ['Altura', 0],
    finalizador_2025: ['Índice 2025', 0], gols_cabeca_2025: ['Cabeça 2025', 0],
    gols_bp_2026: ['Gols BP 26', 0, 'gols em lances de bola parada na Série B 2026, sem pênalti (Sofascore)'],
    gols_bp_3t: ['Gols BP 24–26', 0, 'gols de bola parada, Série B 2024–2026, sem pênalti (Sofascore)'],
    gols_bp_cabeca_3t: ['de cabeça', 0], xg_bp_3t: ['xG BP 25–26', 2, 'xG das finalizações de bola parada; o Sofascore só tem xG na Série B desde 2025'],
  };
  const OCULTAS = new Set(['liga']);

  function especialistas() {
    const bloco = D.especialistas.find(e => e.mercado === st.merc && e.tipo === st.tipo);
    if (!bloco) return '<p class="bpj-nota">Sem dado.</p>';
    let cols = bloco.colunas.map((c, i) => ({ c, i })).filter(x => !OCULTAS.has(x.c) || st.merc !== 'Série B');
    if (st.merc === 'Série B') cols = cols.filter(x => x.c !== 'liga');
    const iPos = bloco.colunas.indexOf('pos11');
    let linhas = bloco.linhas.filter(l => !st.pos || l[iPos] === st.pos);
    if (st.ordE != null && bloco.colunas[st.ordE] != null) {
      const k = st.ordE;
      linhas = linhas.slice().sort((a, b) => {
        const x = a[k], y = b[k];
        if (x == null) return 1; if (y == null) return -1;
        return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))) * st.dirE;
      });
    }
    const cab = cols.map(({ c, i }) => {
      const m = COL[c] || [c, 1];
      const sof = /_2026$|_3t$/.test(c);
      return '<th data-oe="' + i + '" class="' + (typeof bloco.linhas[0]?.[i] === 'number' ? 'n' : '') +
        (sof ? ' sof' : '') + (st.ordE === i ? ' ord' : '') + '" title="' + esc(m[2] || m[0]) + '">' + esc(m[0]) +
        (st.ordE === i ? (st.dirE < 0 ? ' ▾' : ' ▴') : '') + '</th>';
    }).join('');
    const corpo = linhas.map(l => '<tr>' + cols.map(({ c, i }) => {
      const m = COL[c] || [c, 1], v = l[i];
      if (c === 'jogador') return '<td class="nome">' + esc(v) + '</td>';
      if (c === 'contrato') return '<td>' + (v ? esc(String(v).slice(8, 10) + '/' + String(v).slice(5, 7) + '/' + String(v).slice(2, 4)) : '—') + '</td>';
      if (typeof v === 'number') return '<td class="n' + (/_2026$|_3t$/.test(c) ? ' sof' : '') + (c.startsWith('indice') ? ' idx' : '') + '">' + num(v, m[1] == null ? 1 : m[1]) + '</td>';
      return '<td>' + esc(v == null ? '—' : v) + '</td>';
    }).join('') + '</tr>').join('');
    return '<div class="bpj-tab"><table><thead><tr>' + cab + '</tr></thead><tbody>' + corpo + '</tbody></table></div>' +
      '<p class="bpj-nota">' + linhas.length + ' jogadores · ≥ 900 min, até 33 anos' +
      (st.merc === 'Série B' ? ' · colunas em azul: produção real em bola parada pelo Sofascore (Série B 2024–2026)' :
       ' · produção pelo Sofascore só existe para a Série B') + '. Clique no título da coluna para ordenar.</p>';
  }

  const PC = D ? D.producao.colunas : [];
  const ix = k => PC.indexOf(k);
  const ANOS = { u3: [2024, 2025, 2026], todos: [2022, 2023, 2024, 2025, 2026] };
  function producao() {
    const anos = ANOS[st.anos] || [Number(st.anos)];
    const por = new Map();
    D.producao.linhas.forEach(l => {
      if (!anos.includes(l[ix('ano')])) return;
      const k = l[ix('sid')];
      let o = por.get(k);
      if (!o) por.set(k, o = { nome: l[ix('nome')], clubes: new Set(), pos: null, anoPos: 0,
        finalizacoes_bp: 0, gols_bp: 0, gols_bp_cabeca: 0, gols_escanteio: 0, gols_falta_direta: 0, gols_penalti: 0,
        xg_bp: 0, xgN: 0, assist_bp: 0, assist_escanteio: 0, assist_falta: 0 });
      o.clubes.add(l[ix('clube')]);
      if (l[ix('pos')] && l[ix('ano')] >= o.anoPos) { o.pos = l[ix('pos')]; o.anoPos = l[ix('ano')]; }
      ['finalizacoes_bp', 'gols_bp', 'gols_bp_cabeca', 'gols_escanteio', 'gols_falta_direta', 'gols_penalti',
       'assist_bp', 'assist_escanteio', 'assist_falta'].forEach(c => { o[c] += l[ix(c)] || 0; });
      if (l[ix('xg_bp')] != null) { o.xg_bp += l[ix('xg_bp')]; o.xgN++; }
    });
    const b = semAc(st.busca);
    let L = [...por.values()].filter(o => (o.assist_bp + o.gols_bp + o.gols_penalti) > 0)
      .filter(o => !st.pos || o.pos === st.pos)
      .filter(o => !b || semAc(o.nome + ' ' + [...o.clubes].join(' ')).includes(b));
    L.forEach(o => { o.part = o.assist_bp + o.gols_bp; });
    const k = st.ordP;
    L.sort((a, c) => ((c[k] || 0) - (a[k] || 0)) * (st.dirP < 0 ? 1 : -1) || c.part - a.part);
    const C = [['assist_bp', 'Assist. BP', 'assistências em lances de bola parada (escanteio, falta, lateral ensaiado)'],
               ['assist_escanteio', 'de escanteio'], ['assist_falta', 'de falta'],
               ['gols_bp', 'Gols BP', 'gols em lances de bola parada, sem pênalti'], ['gols_bp_cabeca', 'de cabeça'],
               ['gols_escanteio', 'de escanteio'], ['gols_falta_direta', 'falta direta'],
               ['part', 'Participações', 'assistências + gols de bola parada'],
               ['finalizacoes_bp', 'Finalizações BP', 'finalizações em lances de bola parada'],
               ['xg_bp', 'xG BP', 'o Sofascore só tem xG na Série B desde 2025'], ['gols_penalti', 'Pênaltis', 'gols de pênalti']];
    const cab = '<th>Jogador</th><th>Pos</th><th>Clube(s)</th>' + C.map(([c, r, t]) =>
      '<th class="n' + (st.ordP === c ? ' ord' : '') + '" data-op="' + c + '" title="' + esc(t || r) + '">' + esc(r) +
      (st.ordP === c ? (st.dirP < 0 ? ' ▾' : ' ▴') : '') + '</th>').join('');
    const corpo = L.slice(0, 150).map(o => '<tr><td class="nome">' + esc(o.nome) + '</td><td>' + esc(o.pos || '—') +
      '</td><td class="clu">' + esc([...o.clubes].join(', ')) + '</td>' +
      C.map(([c]) => '<td class="n' + (['assist_bp', 'gols_bp', 'part'].includes(c) ? ' forte' : '') + '">' +
        (c === 'xg_bp' ? (o.xgN ? num(o.xg_bp, 1) : '—') : (o[c] ? num(o[c], 0) : '·')) + '</td>').join('') + '</tr>').join('');
    return '<div class="bpj-tab"><table><thead><tr>' + cab + '</tr></thead><tbody>' + corpo + '</tbody></table></div>' +
      '<p class="bpj-nota">' + L.length + ' jogadores com gol ou assistência de bola parada' + (L.length > 150 ? ' (mostrando 150)' : '') +
      ' · Série B, Sofascore, 1.810 jogos · somado por pessoa (id do Sofascore), mesmo quando mudou de clube · sem gols contra.</p>';
  }

  function chips(nome, ops, atual) {
    return '<div class="bpj-chips">' + ops.map(([v, r]) => '<button data-' + nome + '="' + esc(v) + '"' +
      (String(atual) === String(v) ? ' class="on"' : '') + '>' + esc(r) + '</button>').join('') + '</div>';
  }

  function render() {
    const alvo = document.getElementById('bpjCorpo');
    if (!alvo) return;
    if (!D) { alvo.innerHTML = '<p class="bpj-nota">Rode <code>python3 gerar_bp_jogadores_js.py</code>.</p>'; return; }
    const POS = [['', 'Todas'], ['ZD', 'ZD'], ['ZE', 'ZE'], ['LD', 'LD'], ['LE', 'LE'], ['VOL', 'VOL'], ['MED', 'MED'],
                 ['MEI', 'MEI'], ['ED', 'ED'], ['EE', 'EE'], ['CA', 'CA']];
    alvo.innerHTML =
      '<div class="bpj-topo"><h2>Bola parada · jogadores</h2>' +
      '<p>Quem cobra e quem finaliza. Um gol de saldo de bola parada vale 0,73 ponto na temporada, e o que repete ' +
      'de um ano para o outro são as pessoas: o cobrador e o finalizador aéreo (estudo V2, Bloco 3).</p>' +
      chips('vis', [['esp', 'Especialistas por mercado'], ['prod', 'Produção na Série B (Sofascore)']], st.vis) + '</div>' +
      '<div class="bpj-filtros">' +
      (st.vis === 'esp'
        ? chips('merc', D.especialistas.filter(e => e.tipo === 'cobr').map(e => [e.mercado, e.mercado]), st.merc) +
          chips('tipo', [['cobr', 'Cobradores'], ['final', 'Finalizadores aéreos']], st.tipo)
        : chips('anos', [['u3', '2024–26'], ['2026', '2026'], ['2025', '2025'], ['2024', '2024'], ['2023', '2023'], ['2022', '2022'], ['todos', '2022–26']], st.anos) +
          '<input class="bpj-busca" placeholder="Jogador ou clube…" value="' + esc(st.busca) + '">') +
      chips('pos', POS, st.pos) + '</div>' +
      (st.vis === 'esp' ? especialistas() : producao()) +
      '<p class="bpj-fonte">' + esc(D.fonte) + ' · gerado em ' + esc(D.gerado.split('-').reverse().join('/')) + '</p>';
    const muda = (k, v) => { st[k] = v; gravar('bpjEstado', st); render(); };
    alvo.querySelectorAll('[data-vis]').forEach(b => b.onclick = () => muda('vis', b.dataset.vis));
    alvo.querySelectorAll('[data-merc]').forEach(b => b.onclick = () => { st.ordE = null; muda('merc', b.dataset.merc); });
    alvo.querySelectorAll('[data-tipo]').forEach(b => b.onclick = () => { st.ordE = null; muda('tipo', b.dataset.tipo); });
    alvo.querySelectorAll('[data-pos]').forEach(b => b.onclick = () => muda('pos', b.dataset.pos));
    alvo.querySelectorAll('[data-anos]').forEach(b => b.onclick = () => muda('anos', b.dataset.anos));
    alvo.querySelectorAll('[data-oe]').forEach(th => th.onclick = () => {
      const i = Number(th.dataset.oe); st.dirE = st.ordE === i ? -st.dirE : -1; muda('ordE', i); });
    alvo.querySelectorAll('[data-op]').forEach(th => th.onclick = () => {
      const c = th.dataset.op; st.dirP = st.ordP === c ? -st.dirP : -1; muda('ordP', c); });
    const bu = alvo.querySelector('.bpj-busca');
    if (bu) bu.oninput = () => {
      st.busca = bu.value; gravar('bpjEstado', st);
      const pos = bu.selectionStart; render();
      const n = document.querySelector('#bpjCorpo .bpj-busca'); if (n) { n.focus(); n.setSelectionRange(pos, pos); }
    };
  }

  function ligar() {
    const bt = document.querySelector('.aba[data-aba="bpjogadores"]');
    const pg = document.getElementById('pgBpJogadores');
    if (!bt || !pg) return;
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on) render(); };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  window.bpjRender = render;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
