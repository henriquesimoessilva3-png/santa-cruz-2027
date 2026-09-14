/* Aba "Bola parada por treinador".

   O DADO vem de static/bola_parada_dados.js (gerado por gerar_bola_parada_js.py): so contagens
   por trabalho (treinador + time + competicao). Tudo que e taxa — por jogo, acima da media da
   liga, xG por jogo — e calculado aqui, com as MESMAS contas do Excel do estudo, para o filtro
   de competicao poder somar so o que foi escolhido.

   Arquivo proprio de proposito, sem encostar no app.js: a troca de aba continua sendo a do
   irParaAba (ele liga/desliga a classe `on` de todos os botoes e esconde as paginas que conhece).
   Aqui um observador acompanha so o botao desta aba e mostra/esconde a pagina junto. */
(function () {
  'use strict';

  const D = (typeof BOLA_PARADA !== 'undefined') ? BOLA_PARADA : null;
  const TIPOS = [['esc', 'Escanteio'], ['fd', 'Falta direta'], ['fi', 'Falta indireta ou jogada ensaiada'], ['lat', 'Lateral']];
  const st = { serie: 'todas', ano: 'todas', min: 10, busca: '', vis: 'treinador', ord: 'saldo', dir: -1, sel: null,
               abertos: new Set(), destaque: new Set() };

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const semAcento = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const vazio = x => x == null || !isFinite(x);
  const num = (x, d) => vazio(x) ? '—' : x.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const n2 = x => num(x, 2);
  const sinal = x => vazio(x) ? '—' : (x >= 0.005 ? '+' : x <= -0.005 ? '−' : '') + num(Math.abs(x), 2);
  const pct = x => vazio(x) ? '—' : num(x * 100, 0) + '%';
  const pct1 = x => vazio(x) ? '—' : num(x * 100, 1) + '%';
  const dataBR = s => s ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : '';
  const compCurta = c => c.replace('Série ', '').replace(' 20', ' ');
  const somaBP = o => o.esc + o.fd + o.fi + o.lat;

  /* competicao = "Série A 2024": a serie e o comeco, o ano sao os 4 ultimos caracteres */
  const anoDe = comp => comp.slice(-4);
  function passa(t) {
    return (st.serie === 'todas' || t.comp.indexOf(st.serie + ' ') === 0) &&
           (st.ano === 'todas' || anoDe(t.comp) === st.ano);
  }

  /* Soma os trabalhos que passam no filtro e calcula as taxas. "Acima da media" usa a media da
     competicao de CADA trabalho (jogos x media), o que deixa comparar Serie A com Serie B. */
  function agregar() {
    const grupos = new Map();
    for (const t of D.trabalhos) {
      if (!passa(t)) continue;
      const k = st.vis === 'treinador' ? t.tec : t.tec + ' | ' + t.time + ' | ' + t.comp;
      let a = grupos.get(k);
      if (!a) {
        a = { k, nome: t.tec, trabs: [], jogos: 0, gp: 0, gc: 0, esp: 0, pen: 0, pen_sof: 0, gc_bp: 0,
              pro: { esc: 0, fd: 0, fi: 0, lat: 0 }, sof: { esc: 0, fd: 0, fi: 0, lat: 0 },
              esc_fav: 0, esc_contra: 0, xg_bp_pro: 0, xg_bp_sof: 0, xg_n: 0 };
        grupos.set(k, a);
      }
      a.trabs.push(t);
      a.jogos += t.jogos; a.gp += t.gp; a.gc += t.gc; a.esp += t.jogos * t.media_liga;
      a.pen += t.pen; a.pen_sof += t.pen_sof; a.gc_bp += t.gc_bp;
      for (const [c] of TIPOS) { a.pro[c] += t.pro[c]; a.sof[c] += t.sof[c]; }
      a.esc_fav += t.esc_fav; a.esc_contra += t.esc_contra;
      a.xg_bp_pro += t.xg_bp_pro; a.xg_bp_sof += t.xg_bp_sof; a.xg_n += t.xg_n;
    }
    const busca = semAcento(st.busca.trim());
    const out = [];
    for (const a of grupos.values()) {
      if (a.jogos < st.min) continue;
      if (busca && !(semAcento(a.nome).includes(busca) || a.trabs.some(t => semAcento(t.time).includes(busca)))) continue;
      a.bp = somaBP(a.pro); a.bs = somaBP(a.sof);
      a.bp_j = a.bp / a.jogos; a.bs_j = a.bs / a.jogos;
      a.acima = (a.bp - a.esp) / a.jogos;
      a.acima_s = (a.bs - a.esp) / a.jogos;
      a.saldo = (a.bp - a.bs) / a.jogos;
      a.pct_bp = a.gp ? a.bp / a.gp : null;
      a.g100 = a.esc_fav ? a.pro.esc / a.esc_fav * 100 : null;
      a.xgp = a.xg_n ? a.xg_bp_pro / a.xg_n : null;
      a.xgs = a.xg_n ? a.xg_bp_sof / a.xg_n : null;
      a.trabs.sort((x, y) => (x.primeiro < y.primeiro ? -1 : 1));
      a.rotulo = st.vis === 'treinador' ? a.nome : a.nome + ' · ' + a.trabs[0].time + ' · ' + a.trabs[0].comp;
      a.trabTxt = a.trabs.map(t => t.time + ' (' + compCurta(t.comp) + ') ' + t.jogos).join(', ');
      out.push(a);
    }
    const k = st.ord, d = st.dir;
    out.sort((x, y) => {
      if (k === 'nome') return d * x.rotulo.localeCompare(y.rotulo, 'pt-BR');
      if (vazio(x[k])) return 1;
      if (vazio(y[k])) return -1;
      return d * (x[k] - y[k]) || x.rotulo.localeCompare(y.rotulo, 'pt-BR');
    });
    /* destacados sobem para o topo, mantendo a ordem escolhida entre eles (o sort e estavel) */
    if (st.destaque.size) out.sort((x, y) => st.destaque.has(y.nome) - st.destaque.has(x.nome));
    return out;
  }

  /* ---------------- casca (montada uma vez) ---------------- */
  function casca() {
    const anos = [...new Set(D.competicoes.map(c => anoDe(c.comp)))].sort();
    const series = [...new Set(D.competicoes.map(c => c.comp.slice(0, -5)))].sort();
    const porComp = new Map(D.competicoes.map(c => [c.comp, c]));
    /* referencia de cada competicao (nao muda com os filtros): series nas linhas, anos nas colunas.
       Temporada com menos de 380 jogos esta em andamento e sai marcada. */
    const medias = '<table class="sb-tab bp-medias"><thead><tr><th>gols de bola parada por time, por jogo</th>' +
      anos.map(a => '<th>' + a + '</th>').join('') + '</tr></thead><tbody>' +
      series.map(s => '<tr><td>' + esc(s) + '</td>' + anos.map(a => {
        const c = porComp.get(s + ' ' + a);
        return c ? '<td><b>' + n2(c.media_bp) + '</b><small>' + pct(c.bp / c.gols) + ' dos gols · ' + c.jogos +
          ' jogos' + (c.jogos < 380 ? ' (em andamento)' : '') + '</small></td>' : '<td>—</td>';
      }).join('') + '</tr>').join('') + '</tbody></table>';
    const opt = (v, r) => '<option value="' + esc(v) + '">' + esc(r) + '</option>';
    const optSerie = opt('todas', 'Séries A e B') + series.map(s => opt(s, 'Só ' + s)).join('');
    const optAno = opt('todas', anos[0] + ' a ' + anos[anos.length - 1]) + anos.map(a => opt(a, 'Só ' + a)).join('');
    const nomesOpt = [...new Set(D.trabalhos.map(t => t.tec))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .map(n => '<option value="' + esc(n) + '">').join('');
    const minimos = [1, 10, 20, 38].map(n =>
      '<option value="' + n + '"' + (n === st.min ? ' selected' : '') + '>' + n + '</option>').join('');
    return '' +
      '<div><span class="sb-rot">Estudo · fonte ' + esc(D.fonte) + ' · atualizado em ' + esc(dataBR(D.gerado_em)) + '</span>' +
      '<h1 class="sb-h1">Bola parada por treinador</h1>' +
      '<p class="sb-sub">Gols de escanteio, falta e lateral nas Séries A e B de ' + anos[0] + ' a ' + anos[anos.length - 1] +
      ', contados para o treinador que comandava o time em cada jogo. Pênalti fica à parte. Como as médias mudam ' +
      'de uma série e de um ano para outro, cada treinador é comparado com a média da competição em que trabalhou.</p></div>' +
      '<div class="bp-tabwrap">' + medias + '</div>' +
      '<div class="bp-filtros">' +
        '<select id="bpSerie" title="Série">' + optSerie + '</select>' +
        '<select id="bpAno" title="Temporada">' + optAno + '</select>' +
        '<label class="bp-rot">mínimo de jogos <select id="bpMin">' + minimos + '</select></label>' +
        '<span class="bp-seg" id="bpVis"><button data-v="treinador" class="on">por treinador</button>' +
        '<button data-v="trabalho">por trabalho</button></span>' +
        '<input id="bpBusca" type="search" placeholder="Filtrar por treinador ou time…" ' +
        'title="Mostra só quem bate com o texto, no gráfico e na tabela">' +
        '<input id="bpDestaque" list="bpNomes" autocomplete="off" placeholder="★ Destacar treinador…" ' +
        'title="Escolha um nome: ele fica marcado no gráfico e no topo da tabela, sem esconder os outros">' +
        '<datalist id="bpNomes">' + nomesOpt + '</datalist>' +
        '<span class="bp-chips" id="bpChips"></span>' +
        '<span class="bp-cont" id="bpCont"></span>' +
      '</div>' +
      '<div class="sb-bloco"><span class="sb-rot">Quem faz e quem sofre gols de bola parada acima da média da liga</span>' +
        '<div class="sb-tela bp-tela" id="bpTela">' +
          '<svg class="sb-svg" id="bpSvg" viewBox="0 0 960 540" role="img" ' +
          'aria-label="Dispersão: gols de bola parada a favor e sofridos por jogo, em relação à média da liga"></svg>' +
          '<div class="bp-dica" id="bpDica" hidden></div>' +
        '</div>' +
        '<p class="sb-nota">Cada ponto é um ' + '<span id="bpUnid">treinador</span>. <b>Mais à direita</b>, mais gols de ' +
        'bola parada a favor por jogo que a média da liga; <b>mais acima</b>, menos gols sofridos. O cruzamento das ' +
        'duas linhas é a média. Ponto vazado na borda: o valor passa da escala do gráfico (o número real está na ' +
        'dica). Passe o mouse para ver os números; clique para abrir o detalhe na tabela.</p>' +
      '</div>' +
      '<div class="sb-bloco"><span class="sb-rot">Tabela</span><div class="bp-tabwrap" id="bpTab"></div>' +
        '<p class="sb-nota">Clique numa linha para ver como saíram os gols e cada trabalho. Clique no título de uma ' +
        'coluna para ordenar. Na coluna “vs média da liga”, azul é melhor que a média e laranja é pior.</p>' +
      '</div>' +
      notas();
  }

  /* competicoes sem xG na Sofascore (Serie B antes de 2025): o xG por jogo do treinador so usa os jogos que tem */
  function semXg() {
    const sem = D.competicoes.filter(c => !c.xg_n).map(c => c.comp);
    return sem.length ? ' A Sofascore não tem xG em ' + sem.join(', ') + ': nessas temporadas a coluna fica ' +
      'vazia, e o xG por jogo de quem trabalhou nelas usa só os jogos que têm.' : '';
  }

  function notas() {
    const gc = D.gols_contra || {}, conf = gc.conferencia || {}, orig = gc.por_origem || {}, p = D.piloto || {};
    const r = D.regras || {};
    return '<div class="sb-bloco"><span class="sb-rot">Regras e conferência</span>' +
      '<p class="sb-nota"><b>Bola parada</b> = escanteio + falta direta + falta indireta ou jogada ensaiada + ' +
      'lateral. Pênalti não entra na conta e aparece separado no detalhe.</p>' +
      '<p class="sb-nota"><b>Treinador do jogo.</b> A Sofascore registra quem estava no banco. Quando o titular ' +
      'está suspenso ou ausente e o auxiliar senta no lugar, o jogo conta para o titular — ' + D.reatribuidos +
      ' jogos foram tratados assim. Interino entre dois treinadores continua sendo do interino, e ausência de ' +
      (r.seq_longa || 3) + ' jogos seguidos ou mais só vai para o titular se ele tiver ' + (r.seq_longa || 3) +
      ' jogos antes e depois — para não engolir técnico de verdade que ficou pouco tempo.</p>' +
      '<p class="sb-nota"><b>Gol contra.</b> A Sofascore não diz de que lance ele nasceu; a narração lance a lance ' +
      'mostra o que veio até ' + (r.janela_gol_contra || 1) + ' minuto antes. Dos ' + (gc.total || 0) + ' gols contra, ' +
      (orig['Escanteio'] || 0) + ' saíram de escanteio e ' + (orig['Falta indireta / outra BP'] || 0) + ' de falta, ' +
      'e contam como bola parada' + (orig['Sem narração'] ? '; em ' + orig['Sem narração'] + ' o jogo não tem narração, ' +
      'e eles ficam fora da conta' : '') + '. Conferido contra a planilha manual da Série A 2026: bate em ' + (conf.bate || 0) +
      ' de ' + ((conf.bate || 0) + (conf.nao_bate || 0)) + ' casos.</p>' +
      (D.sem_classificacao ? '<p class="sb-nota"><b>Gol sem tipo.</b> ' + D.sem_classificacao + ' dos ' + D.gols +
        ' gols ficaram sem o tipo do lance, quase sempre porque a Sofascore não tem o mapa de chutes daquele jogo. ' +
        'Eles contam nos gols totais, mas não na bola parada.</p>' : '') +
      '<p class="sb-nota"><b>A fonte foi conferida.</b> Na Série A 2026, jogo a jogo contra a planilha manual do ' +
      'Portal Bolas Paradas (' + (p.jogos || 0) + ' jogos), os gols batem em <b>' + pct1(p.gols) + '</b> e o total de ' +
      'gols de bola parada de cada time por jogo em <b>' + pct1(p.bp) + '</b>. O que não bate é gol contra e ' +
      'critério de rebote e segunda bola.</p>' +
      '<p class="sb-nota"><b>Amostra.</b> Com poucos jogos, um gol a mais ou a menos muda muito a taxa; por isso o ' +
      'filtro começa em ' + (r.amostra_min || 10) + ' jogos. O <b>xG de bola parada</b> soma a chance de gol de todas ' +
      'as finalizações de bola parada, com ou sem gol: oscila menos que o gol e ajuda a separar padrão de acaso.' +
      semXg() + '</p>' +
      '</div>';
  }

  function ligarControles(alvo) {
    const q = s => alvo.querySelector(s);
    q('#bpSerie').onchange = e => { st.serie = e.target.value; render(); };
    q('#bpAno').onchange = e => { st.ano = e.target.value; render(); };
    q('#bpMin').onchange = e => { st.min = +e.target.value; render(); };
    q('#bpBusca').oninput = e => { st.busca = e.target.value; render(); };
    /* destaque: so aceita nome que existe na base (sem acento e sem caixa), vindo da lista de sugestoes,
       do Enter ou de sair do campo */
    const nomes = [...new Set(D.trabalhos.map(t => t.tec))];
    const acharNome = v => nomes.find(n => semAcento(n) === semAcento(String(v || '').trim()));
    const destacar = () => {
      const n = acharNome(q('#bpDestaque').value);
      if (!n) return;
      st.destaque.add(n);
      q('#bpDestaque').value = '';
      render();
    };
    q('#bpDestaque').onchange = destacar;
    q('#bpDestaque').oninput = e => { if (e.inputType === 'insertReplacementText' || e.inputType === undefined) destacar(); };
    q('#bpDestaque').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); destacar(); } };
    q('#bpChips').onclick = e => {
      const b = e.target.closest('button[data-n]');
      if (!b) return;
      if (b.dataset.n === '*') st.destaque.clear(); else st.destaque.delete(b.dataset.n);
      render();
    };
    q('#bpVis').onclick = e => {
      const b = e.target.closest('button');
      if (!b || b.dataset.v === st.vis) return;
      st.vis = b.dataset.v; st.sel = null; st.abertos.clear();
      q('#bpVis').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      q('#bpUnid').textContent = st.vis === 'treinador' ? 'treinador' : 'trabalho (treinador num time e numa competição)';
      render();
    };
  }

  /* ---------------- dispersao ---------------- */
  function desenharGrafico(linhas) {
    const svg = document.getElementById('bpSvg');
    const dica = document.getElementById('bpDica');
    const W = 960, H = 540, M = { e: 62, d: 22, t: 30, b: 50 };
    const pw = W - M.e - M.d, ph = H - M.t - M.b;
    dica.hidden = true;
    if (!linhas.length) {
      svg.innerHTML = '<text class="sb-lab" x="480" y="220" text-anchor="middle">Nenhum resultado com esses filtros.</text>';
      return;
    }
    /* Escala ROBUSTA: do 2% ao 98% de cada eixo (sempre com o zero dentro), e nao do maior valor absoluto.
       Com a escala antiga um treinador de amostra curta num canto (+0,47) espremia todo mundo no meio.
       Quem passa da escala fica cravado na borda com o ponto vazado, e a dica mostra o valor real. */
    const faixa = vals => {
      const s = vals.slice().sort((a, b) => a - b);
      const q = p => { const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
      const corte = s.length >= 20 ? 0.02 : 0;
      let lo = Math.min(0, q(corte)), hi = Math.max(0, q(1 - corte));
      const folga = Math.max(0.02, (hi - lo) * 0.08);
      lo -= folga; hi += folga;
      const passo = [0.02, 0.05, 0.1, 0.2, 0.5].find(p => (hi - lo) / p <= 10) || 1;
      return { lo: Math.floor(lo / passo) * passo, hi: Math.ceil(hi / passo) * passo, passo };
    };
    const FX = faixa(linhas.map(a => a.acima)), FY = faixa(linhas.map(a => a.acima_s));
    const trava = (v, f) => Math.min(f.hi, Math.max(f.lo, v));
    const px = v => M.e + (trava(v, FX) - FX.lo) / (FX.hi - FX.lo) * pw;
    const py = v => M.t + (trava(v, FY) - FY.lo) / (FY.hi - FY.lo) * ph;  /* sofrer MENOS fica em cima */
    const fora = a => a.acima < FX.lo || a.acima > FX.hi || a.acima_s < FY.lo || a.acima_s > FY.hi;
    let g = '';
    for (let i = Math.round(FX.lo / FX.passo); i <= Math.round(FX.hi / FX.passo); i++) {
      const v = i * FX.passo, x = px(v).toFixed(1);
      g += '<line x1="' + x + '" x2="' + x + '" y1="' + M.t + '" y2="' + (H - M.b) + '" stroke="' +
        (i === 0 ? 'var(--tracejado2)' : 'var(--linha1)') + '" stroke-width="1"/>' +
        '<text class="sb-eixo" x="' + x + '" y="' + (H - M.b + 16) + '" text-anchor="middle">' + sinal(v) + '</text>';
    }
    for (let i = Math.round(FY.lo / FY.passo); i <= Math.round(FY.hi / FY.passo); i++) {
      const v = i * FY.passo, y = py(v).toFixed(1);
      g += '<line x1="' + M.e + '" x2="' + (W - M.d) + '" y1="' + y + '" y2="' + y + '" stroke="' +
        (i === 0 ? 'var(--tracejado2)' : 'var(--linha1)') + '" stroke-width="1"/>' +
        '<text class="sb-eixo" x="' + (M.e - 8) + '" y="' + (+y + 3) + '" text-anchor="end">' + sinal(v) + '</text>';
    }
    g += '<text class="sb-lab menor" x="' + (M.e + pw / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' +
      'gols de bola parada A FAVOR por jogo, em relação à média da liga →</text>' +
      '<text class="sb-lab menor" transform="translate(14 ' + (M.t + ph / 2) + ') rotate(-90)" text-anchor="middle">' +
      'gols de bola parada SOFRIDOS por jogo, em relação à média (↑ sofre menos)</text>';
    const canto = (x, y, anc, txt) => '<text class="sb-lab menor" x="' + x + '" y="' + y + '" text-anchor="' + anc + '">' + txt + '</text>';
    g += canto(W - M.d - 6, M.t + 14, 'end', 'faz mais · sofre menos') + canto(M.e + 6, M.t + 14, 'start', 'faz menos · sofre menos') +
      canto(W - M.d - 6, H - M.b - 8, 'end', 'faz mais · sofre mais') + canto(M.e + 6, H - M.b - 8, 'start', 'faz menos · sofre mais');

    /* rotulo so nos extremos do saldo (e no selecionado): numero em todo ponto vira ruido */
    const porSaldo = linhas.slice().sort((a, b) => b.saldo - a.saldo);
    const destacado = a => a.k === st.sel || st.destaque.has(a.nome);
    const marcar = new Set(linhas.length > 8 ? porSaldo.slice(0, 3).concat(porSaldo.slice(-3)).map(a => a.k) : linhas.map(a => a.k));
    linhas.forEach(a => { a._fora = fora(a); if (destacado(a)) marcar.add(a.k); });
    const caixas = [];
    let pontos = '', rotulos = '';
    const ordem = linhas.map((a, i) => i).sort((i, j) => destacado(linhas[i]) - destacado(linhas[j]));
    for (const i of ordem) {
      const a = linhas[i], x = px(a.acima), y = py(a.acima_s), sel = destacado(a);
      const cor = sel ? 'var(--coral)' : 'var(--bp-ponto)';
      const xy = 'cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (sel ? 6 : 4.5) + '"';
      pontos += '<g class="bp-p" data-i="' + i + '" tabindex="0">' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="12" fill="transparent"/>' +
        (a._fora ? '<circle ' + xy + ' fill="var(--fundo2)" stroke="' + cor + '" stroke-width="2"/>'
                 : '<circle ' + xy + ' fill="' + cor + '" stroke="var(--fundo2)" stroke-width="2"/>') + '</g>';
      if (!marcar.has(a.k)) continue;
      const txt = st.vis === 'treinador' ? a.nome : a.nome + ' · ' + a.trabs[0].time;
      const w = txt.length * 6.1, dir = x > W - M.d - w - 20;
      const bx = dir ? x - 9 - w : x + 9, by = y - 6;
      if (!sel && caixas.some(c => bx < c.x + c.w && bx + w > c.x && by < c.y + 13 && by + 13 > c.y)) continue;
      caixas.push({ x: bx, y: by, w });
      rotulos += '<text class="sb-lab' + (sel ? ' forte' : '') + '" x="' + (dir ? x - 9 : x + 9).toFixed(1) + '" y="' +
        (y + 4).toFixed(1) + '" text-anchor="' + (dir ? 'end' : 'start') + '">' + esc(txt) + '</text>';
    }
    svg.innerHTML = g + pontos + rotulos;

    const achar = e => { const el = e.target.closest && e.target.closest('.bp-p'); return el ? linhas[+el.dataset.i] : null; };
    svg.onpointermove = e => { const a = achar(e); if (a) mostrarDica(a, e.clientX, e.clientY); else dica.hidden = true; };
    svg.onpointerleave = () => { dica.hidden = true; };
    svg.onfocusin = e => { const a = achar(e); if (a) { const r = e.target.getBoundingClientRect(); mostrarDica(a, r.right, r.bottom); } };
    svg.onfocusout = () => { dica.hidden = true; };
    const escolher = a => {
      st.sel = st.sel === a.k ? null : a.k;
      if (st.sel) st.abertos.add(a.k);
      render();
      if (st.sel) requestAnimationFrame(() => {
        const tr = document.querySelector('#bpTab tr[data-k="' + CSS.escape(a.k) + '"]');
        if (tr) tr.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    };
    svg.onclick = e => { const a = achar(e); if (a) escolher(a); };
    svg.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { const a = achar(e); if (a) { e.preventDefault(); escolher(a); } } };
  }

  /* dica montada com textContent: nome de treinador e time vem da fonte externa */
  function mostrarDica(a, cx, cy) {
    const dica = document.getElementById('bpDica'), tela = document.getElementById('bpTela');
    dica.textContent = '';
    const linha = (tag, txt) => { const el = document.createElement(tag); el.textContent = txt; dica.appendChild(el); };
    linha('b', a.rotulo);
    linha('span', a.jogos + ' jogos' + (st.vis === 'treinador' ? ' · ' + a.trabTxt : ''));
    linha('span', n2(a.bp_j) + ' gols de bola parada a favor por jogo (' + sinal(a.acima) + ' vs média)');
    linha('span', n2(a.bs_j) + ' sofridos por jogo (' + sinal(a.acima_s) + ' vs média)');
    if (a.xgp != null) linha('span', 'xG de bola parada: ' + n2(a.xgp) + ' a favor · ' + n2(a.xgs) + ' contra, por jogo');
    if (a._fora) linha('span', 'Passa da escala do gráfico: o ponto fica na borda, e estes números são os reais.');
    dica.hidden = false;
    const r = tela.getBoundingClientRect();
    let x = cx - r.left + tela.scrollLeft + 14, y = cy - r.top + 14;
    if (x + dica.offsetWidth > tela.scrollLeft + r.width - 8) x = cx - r.left + tela.scrollLeft - dica.offsetWidth - 14;
    if (y + dica.offsetHeight > r.height - 8) y = cy - r.top - dica.offsetHeight - 14;
    dica.style.left = Math.max(4, x) + 'px';
    dica.style.top = Math.max(4, y) + 'px';
  }

  /* ---------------- tabela ---------------- */
  const COLS = [
    { k: 'nome', r: 'Treinador', grupo: '' },
    { k: 'jogos', r: 'Jogos', grupo: '', f: v => v },
    { k: 'bp', r: 'total', grupo: 'a', f: v => v },
    { k: 'bp_j', r: 'por jogo', grupo: 'a', f: n2 },
    { k: 'acima', r: 'vs média da liga', grupo: 'a', div: 1 },
    { k: 'bs', r: 'total', grupo: 's', f: v => v },
    { k: 'bs_j', r: 'por jogo', grupo: 's', f: n2 },
    { k: 'acima_s', r: 'vs média da liga', grupo: 's', div: -1 },
    { k: 'saldo', r: 'Saldo por jogo', grupo: '', f: sinal },
    { k: 'pct_bp', r: '% dos gols a favor', grupo: '', f: pct },
    { k: 'g100', r: 'Gols a cada 100 escanteios', grupo: '', f: n2 },
    { k: 'xgp', r: 'a favor', grupo: 'x', f: n2 },
    { k: 'xgs', r: 'contra', grupo: 'x', f: n2 },
  ];
  const GRUPOS = { a: 'Gols de bola parada a favor', s: 'Gols de bola parada sofridos', x: 'xG de bola parada por jogo' };

  /* barra divergente a partir do zero (= media da liga); a cor diz se e bom, o numero fica em tinta */
  function divCel(v, bom, max) {
    const larg = Math.min(1, Math.abs(v) / max) * 50;
    const cor = Math.abs(v) < 0.005 ? 'transparent' : (v * bom > 0 ? 'var(--bp-bom)' : 'var(--bp-ruim)');
    return '<span class="bp-div"><i><s style="' + (v >= 0 ? 'left' : 'right') + ':50%;width:' + larg.toFixed(1) +
      '%;background:' + cor + '"></s></i>' + sinal(v) + '</span>';
  }

  function detalhe(a) {
    const tipos = TIPOS.map(([c, r]) => '<tr><td>' + r + '</td><td>' + a.pro[c] + '</td><td>' + a.sof[c] + '</td></tr>').join('') +
      '<tr class="tot"><td>Bola parada</td><td>' + a.bp + '</td><td>' + a.bs + '</td></tr>' +
      '<tr><td>Pênalti (fora da conta)</td><td>' + a.pen + '</td><td>' + a.pen_sof + '</td></tr>' +
      '<tr><td>Todos os gols</td><td>' + a.gp + '</td><td>' + a.gc + '</td></tr>';
    const trabs = a.trabs.map(t => {
      const bp = somaBP(t.pro), bs = somaBP(t.sof);
      return '<tr><td>' + esc(t.time) + '</td><td>' + esc(t.comp) + '</td><td>' + dataBR(t.primeiro) + ' a ' +
        dataBR(t.ultimo) + '</td><td>' + t.jogos + '</td><td>' + n2(bp / t.jogos) + '</td><td>' + n2(bs / t.jogos) +
        '</td><td>' + n2(t.media_liga) + '</td></tr>' +
        (t.banco_outros.length ? '<tr class="obs"><td colspan="7">Inclui jogo com ' + esc(t.banco_outros.join(', ')) +
          ' no banco, contado para o titular.</td></tr>' : '');
    }).join('');
    return '<div class="bp-det-grid"><div>' +
      '<table class="bp-mini"><thead><tr><th>Como saíram os gols</th><th>a favor</th><th>sofridos</th></tr></thead>' +
      '<tbody>' + tipos + '</tbody></table>' +
      (a.gc_bp ? '<p class="bp-obs">' + a.gc_bp + (a.gc_bp === 1 ? ' dos gols de bola parada a favor foi gol contra' :
        ' dos gols de bola parada a favor foram gol contra') + ' do adversário.</p>' : '') +
      '</div><div>' +
      '<table class="bp-mini"><thead><tr><th>Time</th><th>Competição</th><th>Período</th><th>Jogos</th>' +
      '<th>BP a favor por jogo</th><th>BP sofridos por jogo</th><th>Média da liga</th></tr></thead>' +
      '<tbody>' + trabs + '</tbody></table></div></div>';
  }

  function desenharTabela(linhas) {
    const box = document.getElementById('bpTab');
    document.getElementById('bpCont').textContent =
      linhas.length + (st.vis === 'treinador' ? (linhas.length === 1 ? ' treinador' : ' treinadores') : (linhas.length === 1 ? ' trabalho' : ' trabalhos'));
    const max = Math.max(0.05, ...linhas.map(a => Math.max(Math.abs(a.acima), Math.abs(a.acima_s))));
    let h1 = '';
    for (let i = 0; i < COLS.length;) {
      const g = COLS[i].grupo;
      let n = 1;
      while (g && i + n < COLS.length && COLS[i + n].grupo === g) n++;
      h1 += '<th' + (n > 1 ? ' colspan="' + n + '"' : '') + '>' + (g ? GRUPOS[g] : '') + '</th>';
      i += n;
    }
    const h2 = COLS.map(c => '<th data-k="' + c.k + '"' + (st.ord === c.k ? ' class="ord"' : '') + '>' +
      (c.k === 'nome' && st.vis === 'trabalho' ? 'Trabalho' : c.r) + (st.ord === c.k ? (st.dir < 0 ? ' ↓' : ' ↑') : '') + '</th>').join('');
    const corpo = linhas.map(a => {
      const tds = COLS.map(c => {
        if (c.k === 'nome') return '<td>' + esc(a.rotulo) +
          (st.vis === 'treinador' ? '<small class="bp-trab">' + esc(a.trabTxt) + '</small>' : '') + '</td>';
        if (c.div) return '<td>' + divCel(a[c.k], c.div, max) + '</td>';
        return '<td>' + c.f(a[c.k]) + '</td>';
      }).join('');
      return '<tr class="linha' + (st.sel === a.k || st.destaque.has(a.nome) ? ' bp-sel' : '') + '" data-k="' + esc(a.k) + '">' + tds + '</tr>' +
        (st.abertos.has(a.k) ? '<tr class="bp-det"><td colspan="' + COLS.length + '">' + detalhe(a) + '</td></tr>' : '');
    }).join('');
    box.innerHTML = '<table class="sb-tab bp-tab"><thead><tr class="grupo">' + h1 + '</tr><tr>' + h2 + '</tr></thead><tbody>' +
      (corpo || '<tr><td colspan="' + COLS.length + '">Nenhum resultado com esses filtros.</td></tr>') + '</tbody></table>';
    box.querySelector('thead').onclick = e => {
      const th = e.target.closest('th[data-k]');
      if (!th) return;
      if (st.ord === th.dataset.k) st.dir = -st.dir;
      else { st.ord = th.dataset.k; st.dir = th.dataset.k === 'nome' ? 1 : -1; }
      render();
    };
    box.querySelector('tbody').onclick = e => {
      const tr = e.target.closest('tr.linha');
      if (!tr) return;
      const k = tr.dataset.k;
      if (st.abertos.has(k)) st.abertos.delete(k); else st.abertos.add(k);
      st.sel = k;
      render();
    };
  }

  function render() {
    const alvo = document.getElementById('bpCorpo');
    if (!alvo) return;
    if (!D) {
      alvo.innerHTML = '<p class="sb-nota">Os dados do estudo não carregaram: falta o static/bola_parada_dados.js ' +
        '(rode o gerar_bola_parada_js.py).</p>';
      return;
    }
    if (!alvo.dataset.montado) {
      alvo.innerHTML = casca();
      ligarControles(alvo);
      alvo.dataset.montado = '1';
    }
    const linhas = agregar();
    desenharChips(linhas);
    desenharGrafico(linhas);
    desenharTabela(linhas);
  }

  /* etiquetas dos destacados; quem o filtro esconde fica avisado, em vez de sumir sem explicacao */
  function desenharChips(linhas) {
    const box = document.getElementById('bpChips');
    const presentes = new Set(linhas.map(a => a.nome));
    box.innerHTML = [...st.destaque].map(n => '<button data-n="' + esc(n) + '" title="Tirar o destaque">' + esc(n) +
      (presentes.has(n) ? '' : ' <i>fora do filtro</i>') + ' ×</button>').join('') +
      (st.destaque.size > 1 ? '<button data-n="*" class="limpar">limpar</button>' : '');
  }

  function ligar() {
    const bt = document.querySelector('.aba[data-aba="bolaparada"]');
    const pg = document.getElementById('pgBolaParada');
    if (!bt || !pg) return;
    const sync = () => {
      const on = bt.classList.contains('on');
      pg.classList.toggle('oculta', !on);
      if (on) render();
    };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  window.bpRender = render;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar);
  else ligar();
})();
