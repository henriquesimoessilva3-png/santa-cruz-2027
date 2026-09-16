/* Aba "Minutagem Série B".

   O DADO vem de static/minutagem_serieb_dados.js (gerado por gerar_minutagem_serieb.py): uma linha
   por jogador + clube + temporada, com jogos, minutos e a fatia dos minutos do clube. Aqui só se
   filtra e se ordena. A única conta feita na tela é minutos ÷ jogos (a média por jogo), porque ela
   muda com o filtro; tudo o mais vem pronto do gerador.

   Arquivo próprio, sem encostar no app.js: a troca de aba continua sendo a do irParaAba, e um
   observador acompanha só o botão desta aba para mostrar e esconder a página junto (mesmo caminho
   do static/bola_parada.js). */
(function () {
  'use strict';

  const D = (typeof MINUTAGEM_SERIEB !== 'undefined') ? MINUTAGEM_SERIEB : null;
  const C = { ano: 0, jogador: 1, time: 2, posicao: 3, grupo: 4, idade: 5, jogos: 6, minutos: 7, fatia: 8, hoje: 9 };
  const GRUPOS = ['Goleiro', 'Zaga', 'Lateral', 'Volante', 'Meia', 'Extremo', 'Atacante'];
  const PAGINA = 300;

  const st = { ano: 'todas', time: 'todos', grupo: 'todos', idadeMin: '', idadeMax: '',
               busca: '', ord: { col: C.minutos, dir: -1 }, mostrar: PAGINA };

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const semAcento = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const nInt = x => (x == null ? '—' : Math.round(x).toLocaleString('pt-BR'));
  const n1 = x => (x == null ? '—' : x.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

  /* ---------------- filtro e ordem ---------------- */
  function anos() { return [...new Set(D.linhas.map(l => l[C.ano]))].sort((a, b) => b - a); }
  function times() {
    const f = D.linhas.filter(l => st.ano === 'todas' || l[C.ano] === +st.ano);
    return [...new Set(f.map(l => l[C.time]))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }
  function passa(l) {
    if (st.ano !== 'todas' && l[C.ano] !== +st.ano) return false;
    if (st.time !== 'todos' && l[C.time] !== st.time) return false;
    if (st.grupo !== 'todos' && l[C.grupo] !== st.grupo) return false;
    const id = l[C.idade];
    if (st.idadeMin !== '' && (id == null || id < +st.idadeMin)) return false;
    if (st.idadeMax !== '' && (id == null || id > +st.idadeMax)) return false;
    if (st.busca) {
      const b = semAcento(st.busca);
      if (!semAcento(l[C.jogador]).includes(b) && !semAcento(l[C.time]).includes(b) &&
          !semAcento(l[C.hoje]).includes(b)) return false;
    }
    return true;
  }
  const mediaPorJogo = l => (l[C.jogos] ? l[C.minutos] / l[C.jogos] : null);
  function valor(l, col) {
    if (col === 'mj') return mediaPorJogo(l);
    if (col === C.jogador || col === C.time || col === C.grupo || col === C.posicao) return semAcento(l[col]);
    return l[col];
  }
  function ordenar(linhas) {
    const { col, dir } = st.ord;
    return linhas.sort((a, b) => {
      const va = valor(a, col), vb = valor(b, col);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;            /* sem dado sempre no fim */
      if (vb == null) return -1;
      if (va < vb) return -dir;
      if (va > vb) return dir;
      return (b[C.minutos] || 0) - (a[C.minutos] || 0);
    });
  }

  /* ---------------- desenho ---------------- */
  const COLUNAS = [
    { k: C.jogador, rot: 'Jogador', cls: 'mn-jogc' },
    { k: C.time, rot: 'Time' },
    { k: C.ano, rot: 'Temporada', num: true },
    { k: C.grupo, rot: 'Posição' },
    { k: C.idade, rot: 'Idade', num: true },
    { k: C.jogos, rot: 'Jogos', num: true },
    { k: C.minutos, rot: 'Minutos', num: true },
    { k: 'mj', rot: 'Min. por jogo', num: true },
    { k: C.fatia, rot: 'Fatia dos minutos', num: true },
  ];

  function casca() {
    return '' +
      '<div class="mn-topo"><h3>Minutagem na Série B</h3>' +
      '<span class="mn-sub">quanto cada jogador jogou em cada temporada, de 2022 a 2026</span></div>' +

      '<div class="mn-filtros">' +
      '  <div class="mn-campo"><label for="mnAno">Temporada</label><select id="mnAno"></select></div>' +
      '  <div class="mn-campo"><label for="mnTime">Time</label><select id="mnTime"></select></div>' +
      '  <div class="mn-campo"><label for="mnGrupo">Posição</label><select id="mnGrupo"></select></div>' +
      '  <div class="mn-campo"><label for="mnIdadeMin">Idade</label><div class="mn-idade">' +
      '    <input type="number" id="mnIdadeMin" min="14" max="45" placeholder="de"><span>a</span>' +
      '    <input type="number" id="mnIdadeMax" min="14" max="45" placeholder="até"></div></div>' +
      '  <div class="mn-campo"><label for="mnBusca">Buscar</label>' +
      '    <input type="search" id="mnBusca" placeholder="jogador ou clube" autocomplete="off"></div>' +
      '  <button type="button" class="mn-bt" id="mnLimpar">Limpar filtros</button>' +
      '</div>' +

      '<div class="mn-resumo" id="mnResumo"></div>' +
      '<div class="mn-rolagem"><table><thead><tr id="mnCab"></tr></thead><tbody id="mnCorpo"></tbody></table></div>' +
      '<div class="mn-mais" id="mnMais"></div>' +
      '<p class="mn-nota" id="mnNota"></p>';
  }

  function opcoes(sel, lista, valorAtual, rotuloTodos) {
    sel.innerHTML = '<option value="' + (rotuloTodos[0]) + '">' + rotuloTodos[1] + '</option>' +
      lista.map(v => '<option value="' + esc(v) + '">' + esc(v) + '</option>').join('');
    sel.value = valorAtual;
    if (sel.value !== valorAtual) sel.value = rotuloTodos[0];   /* o time sumiu ao trocar de ano */
  }

  function cabecalho() {
    return COLUNAS.map(c => {
      const ativo = st.ord.col === c.k;
      const seta = ativo ? (st.ord.dir === 1 ? '▲' : '▼') : '';
      return '<th class="' + (c.num ? 'mn-num ' : '') + (c.cls || '') + '"' +
        (ativo ? ' aria-sort="' + (st.ord.dir === 1 ? 'ascending' : 'descending') + '"' : '') +
        '><button type="button" data-col="' + c.k + '">' + esc(c.rot) +
        '<span class="mn-seta">' + seta + '</span></button></th>';
    }).join('');
  }

  function linhaHtml(l) {
    const mj = mediaPorJogo(l);
    const fatia = l[C.fatia];
    const barra = fatia == null ? '' :
      '<span class="mn-barra" aria-hidden="true"><i style="width:' + Math.max(2, Math.min(100, fatia)) + '%"></i></span>';
    const hoje = l[C.hoje] && l[C.hoje] !== l[C.time] ? '<span class="mn-meta">hoje: ' + esc(l[C.hoje]) + '</span>' : '';
    return '<tr>' +
      '<td><span class="mn-jog">' + esc(l[C.jogador]) + '</span>' + hoje + '</td>' +
      '<td>' + esc(l[C.time]) + '</td>' +
      '<td class="mn-num">' + l[C.ano] + '</td>' +
      '<td>' + esc(l[C.grupo]) + '<span class="mn-meta">' + esc(l[C.posicao]) + '</span></td>' +
      '<td class="mn-num">' + (l[C.idade] == null ? '—' : l[C.idade]) + '</td>' +
      '<td class="mn-num">' + nInt(l[C.jogos]) + '</td>' +
      '<td class="mn-num">' + nInt(l[C.minutos]) + '</td>' +
      '<td class="mn-num">' + (mj == null ? '—' : n1(mj)) + '</td>' +
      '<td class="mn-num">' + (fatia == null ? '—' : n1(fatia) + '%') + barra + '</td>' +
      '</tr>';
  }

  function desenhar() {
    const linhas = ordenar(D.linhas.filter(passa));
    const visiveis = linhas.slice(0, st.mostrar);

    const jogadores = new Set(linhas.map(l => l[C.jogador] + '|' + l[C.time] + '|' + l[C.ano]));
    const minutos = linhas.reduce((s, l) => s + (l[C.minutos] || 0), 0);
    document.getElementById('mnResumo').innerHTML =
      '<span><b>' + nInt(linhas.length) + '</b> linhas</span>' +
      '<span><b>' + nInt(new Set(linhas.map(l => l[C.jogador])).size) + '</b> nomes diferentes</span>' +
      '<span><b>' + nInt(new Set(linhas.map(l => l[C.time])).size) + '</b> clubes</span>' +
      '<span><b>' + nInt(minutos) + '</b> minutos somados</span>' +
      (jogadores.size !== linhas.length ? '' : '');

    document.getElementById('mnCab').innerHTML = cabecalho();
    document.getElementById('mnCorpo').innerHTML = visiveis.length
      ? visiveis.map(linhaHtml).join('')
      : '<tr><td class="mn-vazio" colspan="' + COLUNAS.length + '">Nenhum jogador com esses filtros.</td></tr>';
    document.getElementById('mnMais').innerHTML = linhas.length > visiveis.length
      ? '<button type="button" class="mn-bt" id="mnMaisBt">mostrar mais ' +
        nInt(Math.min(PAGINA, linhas.length - visiveis.length)) + ' (de ' + nInt(linhas.length) + ')</button>'
      : '';
    const bt = document.getElementById('mnMaisBt');
    if (bt) bt.onclick = () => { st.mostrar += PAGINA; desenhar(); };
    document.getElementById('mnNota').textContent = D.regra + ' Fonte: ' + D.fonte + '.';
  }

  function ligarControles(alvo) {
    const selAno = alvo.querySelector('#mnAno'), selTime = alvo.querySelector('#mnTime'),
          selGrupo = alvo.querySelector('#mnGrupo');
    opcoes(selAno, anos(), st.ano, ['todas', 'todas']);
    opcoes(selTime, times(), st.time, ['todos', 'todos os times']);
    opcoes(selGrupo, GRUPOS, st.grupo, ['todos', 'todas as posições']);

    selAno.onchange = e => {
      st.ano = e.target.value; st.mostrar = PAGINA;
      opcoes(selTime, times(), st.time, ['todos', 'todos os times']);
      st.time = selTime.value; desenhar();
    };
    selTime.onchange = e => { st.time = e.target.value; st.mostrar = PAGINA; desenhar(); };
    selGrupo.onchange = e => { st.grupo = e.target.value; st.mostrar = PAGINA; desenhar(); };
    alvo.querySelector('#mnIdadeMin').oninput = e => { st.idadeMin = e.target.value; st.mostrar = PAGINA; desenhar(); };
    alvo.querySelector('#mnIdadeMax').oninput = e => { st.idadeMax = e.target.value; st.mostrar = PAGINA; desenhar(); };
    alvo.querySelector('#mnBusca').oninput = e => { st.busca = e.target.value; st.mostrar = PAGINA; desenhar(); };
    alvo.querySelector('#mnLimpar').onclick = () => {
      st.ano = 'todas'; st.time = 'todos'; st.grupo = 'todos'; st.idadeMin = ''; st.idadeMax = '';
      st.busca = ''; st.ord = { col: C.minutos, dir: -1 }; st.mostrar = PAGINA;
      alvo.querySelector('#mnIdadeMin').value = ''; alvo.querySelector('#mnIdadeMax').value = '';
      alvo.querySelector('#mnBusca').value = '';
      opcoes(selAno, anos(), st.ano, ['todas', 'todas']);
      opcoes(selTime, times(), st.time, ['todos', 'todos os times']);
      opcoes(selGrupo, GRUPOS, st.grupo, ['todos', 'todas as posições']);
      desenhar();
    };
    /* ordenar: texto começa em A-Z, número começa do maior */
    alvo.querySelector('#mnCab').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const col = isNaN(+b.dataset.col) ? b.dataset.col : +b.dataset.col;
      const texto = [C.jogador, C.time, C.grupo, C.posicao].includes(col);
      if (st.ord.col === col) st.ord.dir *= -1;
      else st.ord = { col, dir: texto ? 1 : -1 };
      st.mostrar = PAGINA; desenhar();
    });
  }

  function render() {
    const alvo = document.getElementById('mnCorpoPagina');
    if (!alvo) return;
    if (!D) {
      alvo.innerHTML = '<p class="mn-nota">O dado da minutagem não carregou: falta o ' +
        'static/minutagem_serieb_dados.js (rode o gerar_minutagem_serieb.py).</p>';
      return;
    }
    if (!alvo.dataset.montado) {
      alvo.innerHTML = casca();
      ligarControles(alvo);
      alvo.dataset.montado = '1';
    }
    desenhar();
  }

  function ligar() {
    const bt = document.querySelector('.aba[data-aba="minutagem"]');
    const pg = document.getElementById('pgMinutagem');
    if (!bt || !pg) return;
    const sync = () => {
      const on = bt.classList.contains('on');
      pg.classList.toggle('oculta', !on);
      if (on) render();
    };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  window.mnRender = render;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar);
  else ligar();
})();
