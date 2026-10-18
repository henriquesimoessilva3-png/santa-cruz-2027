/* Visão nova do app (18/10/2026) — em PARALELO com a barra de hoje, para o Henrique ver antes de decidir se sobe.
   Quatro abas em funil:
     1 Estudo (o que importa para subir: Técnico · Físico · Bola parada)
     2 Mercado (quem existe: Tipo físico A+, A e B · Banco de consulta)
     3 Jogador (um nome: Consulta de jogador)
     4 Elenco 2027 (o time: Campograma · Indicados · Empresários)
   Nada é apagado: as abas de hoje continuam no DOM e são elas que mostram as páginas (irParaAba do app.js e os
   observadores de cada módulo); esta barra só decide qual delas fica "on" e esconde as outras da vista.
   Liga/desliga pelo botão "Visão nova" da barra (localStorage sc_visao) ou por ?visao=nova / ?visao=atual na URL.
   A flag window.VISAO_NOVA é lida pelo banco_tm.js (que passa a ler static/mercado/) — por isso este arquivo
   entra ANTES dos módulos das abas no index.html. */
(function () {
  'use strict';
  const LS = 'sc_visao', LS_EST = 'sc_visao_estado';
  const ler = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let q = null;
  try { q = new URLSearchParams(location.search).get('visao'); } catch (e) {}
  if (q === 'nova' || q === 'atual') gravar(LS, q);
  const NOVA = ler(LS) === 'nova';
  window.VISAO_NOVA = NOVA;

  const ABAS = [
    { id: 'estudo', num: '1', rot: 'Estudo', dica: 'o que importa para subir', sub: [
      { id: 'tecnico', rot: 'Técnico', aba: 'caracteristicas', dica: 'os indicadores que separam o titular de quem sobe do de quem cai, posição a posição' },
      { id: 'fisico', rot: 'Físico', aba: 'vnfisico', dica: 'a letra A+, A, B e C de cada posição e o que o físico produz em campo' },
      { id: 'bp', rot: 'Bola parada', aba: 'bpjogadores', alt: [['bpjogadores', 'Jogadores'], ['bolaparada', 'Treinadores']], dica: 'quem cobra e quem finaliza; e o que cada treinador rende de bola parada' }],
      aux: { aba: 'estudo2', rot: 'estudo completo' } },
    { id: 'mercado', num: '2', rot: 'Mercado', dica: 'quem existe', sub: [
      { id: 'tipoa', rot: 'Tipo físico A+, A e B', aba: 'tipoa', dica: 'já filtrado pelo físico que interessa; o nome abre a ficha, o ↗ leva ao campograma' },
      { id: 'banco', rot: 'Banco de consulta', aba: 'bancotm', dica: 'todos os nomes, com contrato, valor, letra, seta de subida, bola parada e xT' }] },
    { id: 'jogador', num: '3', rot: 'Jogador', dica: 'um nome', sub: [
      { id: 'consulta', rot: 'Consulta de jogador', aba: 'consulta', dica: 'digita o nome: adere ao modelo que rende na Série B? e onde ele está nas listas' }] },
    { id: 'elenco', num: '4', rot: 'Elenco 2027', dica: 'o time', sub: [
      { id: 'campo', rot: 'Campograma', aba: 'campo' }, { id: 'indicados', rot: 'Indicados', aba: 'indicados' }, { id: 'empresarios', rot: 'Empresários', aba: 'empresarios' }] },
  ];
  /* aba original → [principal, sub] (as alternativas de um sub também apontam para ele) */
  const MAPA = {};
  ABAS.forEach(a => a.sub.forEach(s => { MAPA[s.aba] = [a.id, s.id]; (s.alt || []).forEach(x => { MAPA[x[0]] = [a.id, s.id]; }); }));
  const NOMES = { contrato: 'Fim de contrato', fisico: 'Físico (régua)', subida: 'Subida', analise: 'Análise do elenco', financeiro: 'Financeiro', serieb: 'Análise Série B', prototipo: 'Protótipo', estudo: 'Estudo Série B V1', minutagem: 'Minutagem Série B', estudo2: 'Estudo Série B V2 (completo)', novoriz: 'Modelo Novorizontino', ameaca: 'Ameaça (xT)' };

  let est = { main: 'estudo', sub: 'tecnico', alt: {} };
  try { Object.assign(est, JSON.parse(ler(LS_EST) || '{}')); } catch (e) {}
  if (!est.alt) est.alt = {};
  const salvar = () => gravar(LS_EST, JSON.stringify(est));

  const $ = s => document.querySelector(s);
  const abaOriginal = nome => document.querySelector('nav.abas .aba[data-aba="' + nome + '"]');
  function ir(nome) {
    const b = abaOriginal(nome);
    if (!b) return;
    if (typeof window.irParaAba === 'function') window.irParaAba(nome); else b.click();
  }

  /* ---------- barra ---------- */
  function montarBarra() {
    const nav = $('nav.abas'); if (!nav) return;
    const info = $('#abasInfo');
    const troca = document.createElement('button');
    troca.className = 'vn-troca'; troca.type = 'button';
    troca.textContent = NOVA ? '← Visão atual' : 'Visão nova';
    troca.title = NOVA ? 'Voltar para a barra de hoje (todas as abas)' : 'Ver a proposta de 18/10: 4 abas em funil — Estudo · Mercado · Jogador · Elenco 2027';
    troca.onclick = () => {
      gravar(LS, NOVA ? 'atual' : 'nova');
      try { const u = new URL(location.href); u.searchParams.delete('visao'); history.replaceState(null, '', u.toString()); } catch (e) {}
      location.reload();   /* recarrega: os módulos leem a flag no carregamento (o Banco escolhe a base por ela) */
    };
    if (!NOVA) { nav.insertBefore(troca, info); return; }
    document.body.classList.add('visao-nova');
    const frag = document.createDocumentFragment();
    ABAS.forEach(a => {
      const b = document.createElement('button');
      b.className = 'vn-aba'; b.type = 'button'; b.dataset.vn = a.id;
      b.innerHTML = '<b>' + a.num + '</b>' + esc(a.rot) + '<small>' + esc(a.dica) + '</small>';
      b.onclick = () => { const s = a.sub.find(x => x.id === (est.subs || {})[a.id]) || a.sub[0]; irSub(a, s); };
      frag.appendChild(b);
    });
    frag.appendChild(troca);
    nav.insertBefore(frag, info);
    const sub = document.createElement('nav'); sub.className = 'vn-sub'; sub.id = 'vnSub';
    nav.after(sub);
  }
  function irSub(a, s) {
    est.main = a.id; est.sub = s.id; est.subs = est.subs || {}; est.subs[a.id] = s.id;   /* lembra o último capítulo de cada aba */
    const alvo = s.alt && est.alt[s.id] && s.alt.some(x => x[0] === est.alt[s.id]) ? est.alt[s.id] : s.aba;
    salvar(); ir(alvo);
  }
  function montarSub(abaOn) {
    const el = $('#vnSub'); if (!el) return;
    const a = ABAS.find(x => x.id === est.main);
    if (!a) { el.innerHTML = ''; return; }
    const atual = a.sub.find(x => x.id === est.sub);
    let h = '';
    if (a.sub.length > 1) h += a.sub.map(s => '<button type="button" class="vn-sub-item' + (s.id === est.sub ? ' on' : '') + '" data-sub="' + s.id + '">' + esc(s.rot) + '</button>').join('');
    else h += '<span class="vn-sub-um">' + esc(a.sub[0].rot) + '</span>';
    if (atual && atual.alt) h += '<span class="vn-alt">' + atual.alt.map(x => '<button type="button" data-alt="' + x[0] + '" class="' + (abaOn === x[0] ? 'on' : '') + '">' + esc(x[1]) + '</button>').join('') + '</span>';
    const fora = abaOn && !MAPA[abaOn];
    if (fora) h += '<span class="vn-fora">aba auxiliar: <b>' + esc(NOMES[abaOn] || abaOn) + '</b></span>';
    else if (atual && atual.dica) h += '<span class="vn-dica">' + esc(atual.dica) + '</span>';
    if (a.aux) h += '<button type="button" class="vn-aux" data-aux="' + a.aux.aba + '">' + esc(a.aux.rot) + ' ↗</button>';
    el.innerHTML = h;
    el.querySelectorAll('[data-sub]').forEach(b => b.onclick = () => irSub(a, a.sub.find(s => s.id === b.dataset.sub)));
    el.querySelectorAll('[data-alt]').forEach(b => b.onclick = () => { est.alt[atual.id] = b.dataset.alt; salvar(); ir(b.dataset.alt); });
    el.querySelectorAll('[data-aux]').forEach(b => b.onclick = () => ir(b.dataset.aux));
  }
  /* a aba original que está "on" manda: quem chegou por um link interno (abrir ficha → campograma) também acende a barra certa */
  function sincronizar() {
    const on = document.querySelector('nav.abas .aba.on');
    const nome = on ? on.dataset.aba : null;
    const m = nome && MAPA[nome];
    if (m) { est.main = m[0]; est.sub = m[1]; est.subs = est.subs || {}; est.subs[m[0]] = m[1]; const s = ABAS.find(a => a.id === m[0]).sub.find(x => x.id === m[1]); if (s && s.alt) est.alt[s.id] = nome; salvar(); }
    document.querySelectorAll('.vn-aba').forEach(b => b.classList.toggle('on', b.dataset.vn === est.main));
    montarSub(nome);
  }

  /* ---------- Estudo › Físico: página composta (painel do estudo + tipos A, B e C + F2 completo) ---------- */
  let fisicoFeito = false;
  function montarFisico() {
    const pg = $('#pgVnFisico'); if (!pg || fisicoFeito) return;
    fisicoFeito = true;
    const docs = (window.ESTUDO_V2 && ESTUDO_V2.docs) || [];
    const doc = id => docs.find(d => d.id === id);
    const b15 = doc('b15'), b8 = doc('b8');
    const dataBR = iso => iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4) : '';
    pg.innerHTML = '<div class="esv-leitura vnf">' +
      '<h2 class="vnf-tit">Físico — o que importa para subir</h2>' +
      '<p class="vnf-intro">Cada jogador de linha recebe uma <b>letra</b> pelo perfil físico (SkillCorner), comparado com os jogadores da mesma posição na Série B. ' +
      'É a mesma letra dos cards do campograma, da lista Tipo físico A+, A e B e do Banco de consulta.</p>' +
      '<div class="vnf-regra"><div><span class="tipo-abc tipo-Ap">A+</span><span><b>Explosivo e motor de volume</b> — explosão <i>e</i> volume acima de +0,5 desvio da Série B do setor. Não existe no médio e no meia.</span></div>' +
      '<div><span class="tipo-abc tipo-A">A</span><span><b>O tipo mais forte da posição</b> — explosivo e rápido; no volante, o "mais intenso"; no médio, o <i>motor de volume</i> (volume acima de +0,5).</span></div>' +
      '<div><span class="tipo-abc tipo-B">B</span><span><b>O do meio</b> — motor de volume, médio em tudo ou intermediário. Também o "explosivo, pouco volume": seria C pelo volume, mas tem explosão acima de +0,25.</span></div>' +
      '<div><span class="tipo-abc tipo-C">C</span><span><b>Baixa intensidade</b> (no volante, "menos intenso") — fraco em explosão <i>e</i> em volume.</span></div>' +
      '<p>Como é calculado: seis indicadores (PSV-99, sprints/90, ações de alta intensidade/90, arrancadas explosivas/90, distância/90 e corridas por 30 min com posse) viram desvios em relação à Série B do setor; o jogador recebe o tipo físico mais próximo (centróide do estudo V2) e a letra vem da regra do clube para a posição. ' +
      'Físico colado na ficha vale sobre o do estudo, em todo o app. Em 18/10 foi testada uma letra por duas notas 0–100 (explosão e volume), com peso do físico por posição (b17); separava melhor quem sobe, mas mudava <b>446</b> letras já analisadas — decisão: <b>fica a regra atual</b>.</p></div>' +
      '<div id="vnfPainel"></div>' +
      (b15 ? '<article class="esv-doc"><div class="esv-doc-meta">' + esc(b15.grupo) + ' · ' + dataBR(b15.data) + '</div><h2>' + esc(b15.titulo) + '</h2>' + b15.html + '</article>' : '<p class="esv-vazio">O estudo V2 não carregou (static/estudo_v2_dados.js).</p>') +
      (b8 ? '<details class="vnf-mais"><summary>' + esc(b8.titulo) + ' — o documento completo</summary><article class="esv-doc"><div class="esv-doc-meta">' + esc(b8.grupo) + ' · ' + dataBR(b8.data) + '</div>' + b8.html + '</article></details>' : '') +
      '</div>';
    /* o painel "Perfil físico por posição" da aba Físico vem para cá (é o mesmo nó; volta quando a visão atual é religada) */
    const painel = $('#fsPainelEstudo'), alvo = $('#vnfPainel');
    if (painel && alvo) { alvo.appendChild(painel); const d = painel.querySelector('details.fse'); if (d) d.open = true; }
    /* nome em negrito dentro de tabela = jogador: clique abre a ficha da Consulta (mesmo caminho do estudo_v2.js) */
    if (window.csJanela) pg.querySelectorAll('.esv-doc table td > strong, .esv-doc table td > b').forEach(el => {
      const td = el.parentElement; const nome = el.textContent.trim(); if (nome.length < 3 || /^\d/.test(nome)) return;
      const prox = td.nextElementSibling ? td.nextElementSibling.textContent.trim() : '';
      if (!window.csExiste || !window.csExiste(nome, prox)) return;
      el.classList.add('esv-jog'); el.title = 'ver ficha'; el.onclick = () => window.csJanela(nome, prox);
    });
  }
  function ligarFisico() {
    const bt = abaOriginal('vnfisico'), pg = $('#pgVnFisico');
    if (!bt || !pg) return;
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on) montarFisico(); };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  function iniciar() {
    montarBarra();
    if (!NOVA) return;
    ligarFisico();
    const nav = $('nav.abas');
    if (nav) new MutationObserver(sincronizar).observe(nav, { attributes: true, attributeFilter: ['class'], subtree: true });
    /* abre onde parou (ou no começo do funil); o app.js nasce no campograma, então a troca vem depois dele carregar */
    const a = ABAS.find(x => x.id === est.main) || ABAS[0];
    const s = a.sub.find(x => x.id === est.sub) || a.sub[0];
    setTimeout(() => irSub(a, s), 0);
    sincronizar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
