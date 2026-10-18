/* Visão nova do app (18/10/2026) — em PARALELO com a barra de hoje, para o Henrique ver antes de decidir se sobe.
   Quatro abas (o campograma primeiro, pedido de 18/10; as outras três são o funil):
     1 Elenco 2027 (o time: Campograma · Indicados · Empresários)
     2 Estudo (o que importa para subir: Físico · Técnico · Bola parada)
     3 Mercado (quem existe: Tipo físico A+, A e B · Banco de consulta)
     4 Jogador (um nome: Consulta de jogador)
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
    { id: 'elenco', num: '1', rot: 'Elenco 2027', dica: 'o time', sub: [
      { id: 'campo', rot: 'Campograma', aba: 'campo' }, { id: 'indicados', rot: 'Indicados', aba: 'indicados' }, { id: 'empresarios', rot: 'Empresários', aba: 'empresarios' }] },
    { id: 'estudo', num: '2', rot: 'Estudo', dica: 'o que importa para subir', sub: [
      { id: 'fisico', rot: 'Físico', aba: 'vnfisico', dica: 'a letra A+, A, B e C de cada posição e o que o físico produz em campo' },
      { id: 'tecnico', rot: 'Técnico', aba: 'caracteristicas', dica: 'os indicadores que separam o titular de quem sobe do de quem cai, posição a posição' },
      { id: 'bp', rot: 'Bola parada', aba: 'bpjogadores', alt: [['bpjogadores', 'Jogadores'], ['bolaparada', 'Treinadores']], dica: 'quem cobra e quem finaliza; e o que cada treinador rende de bola parada' }],
      aux: { aba: 'estudo2', rot: 'estudo completo' } },
    { id: 'mercado', num: '3', rot: 'Mercado', dica: 'quem existe', sub: [
      { id: 'tipoa', rot: 'Tipo físico A+, A e B', aba: 'tipoa', dica: 'já filtrado pelo físico que interessa; o nome abre a ficha, o ↗ leva ao campograma' },
      { id: 'banco', rot: 'Banco de consulta', aba: 'bancotm', dica: 'todos os nomes, com contrato, valor, letra, seta de subida, bola parada e xT' }] },
    { id: 'jogador', num: '4', rot: 'Jogador', dica: 'um nome', sub: [
      { id: 'consulta', rot: 'Consulta de jogador', aba: 'consulta', dica: 'digita o nome: adere ao modelo que rende na Série B? e onde ele está nas listas' }] },
  ];
  /* aba original → [principal, sub] (as alternativas de um sub também apontam para ele) */
  const MAPA = {};
  ABAS.forEach(a => a.sub.forEach(s => { MAPA[s.aba] = [a.id, s.id]; (s.alt || []).forEach(x => { MAPA[x[0]] = [a.id, s.id]; }); }));
  const NOMES = { contrato: 'Fim de contrato', fisico: 'Físico (régua)', subida: 'Subida', analise: 'Análise do elenco', financeiro: 'Financeiro', serieb: 'Análise Série B', prototipo: 'Protótipo', estudo: 'Estudo Série B V1', minutagem: 'Minutagem Série B', estudo2: 'Estudo Série B V2 (completo)', novoriz: 'Modelo Novorizontino', ameaca: 'Ameaça (xT)' };

  let est = { main: 'elenco', sub: 'campo', alt: {} };
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
      '<div class="vnf-escopo"><b>De onde vem o estudo.</b> ' +
      '<span><b>Físico:</b> SkillCorner, rastreio de todos os jogos da Série B de <b>2022 a 2026</b> (goleiro não é rastreado).</span> ' +
      '<span><b>Técnico:</b> Wyscout, as mesmas temporadas.</span> ' +
      '<span><b>Régua dos tipos e das letras:</b> os <b>1.327</b> titulares da Série B 2022–2025 com <b>900 minutos</b> ou mais e físico rastreado; cada temporada tem <b>4</b> times que subiram, <b>12</b> que ficaram e <b>4</b> que caíram.</span> ' +
      '<span><b>Quem recebe letra hoje:</b> qualquer jogador da base do app com <b>5 jogos</b> rastreados ou mais — por isso a Série B 2026 tem, por exemplo, 53 laterais direitos com letra: são todos os que passaram de 5 jogos, titulares ou não.</span> ' +
      '<span><b>Mercados:</b> Série B 2026, ligas sul-americanas e sul-americanos no exterior (base Wyscout de ago/26); as segundas divisões de Argentina, Colômbia e Equador não têm rastreio.</span></div>' +
      '<div class="vnf-duas"><div class="vnf-regra"><div><span class="tipo-abc tipo-Ap">A+</span><span><b>Explosivo e motor de volume</b> — explosão <i>e</i> volume acima de +0,5 desvio da Série B do setor. Não existe no médio e no meia.</span></div>' +
      '<div><span class="tipo-abc tipo-A">A</span><span><b>O tipo mais forte da posição</b> — explosivo e rápido; no volante, o "mais intenso"; no médio, o <i>motor de volume</i> (volume acima de +0,5).</span></div>' +
      '<div><span class="tipo-abc tipo-B">B</span><span><b>O do meio</b> — motor de volume, médio em tudo ou intermediário. Também o "explosivo, pouco volume": seria C pelo volume, mas tem explosão acima de +0,25.</span></div>' +
      '<div><span class="tipo-abc tipo-C">C</span><span><b>Baixa intensidade</b> (no volante, "menos intenso") — fraco em explosão <i>e</i> em volume.</span></div>' +
      '<p>Como é calculado: seis indicadores (PSV-99, sprints/90, ações de alta intensidade/90, arrancadas explosivas/90, distância/90 e corridas por 30 min com posse) viram desvios em relação à Série B do setor; o jogador recebe o tipo físico mais próximo (centróide do estudo V2) e a letra vem da regra do clube para a posição. ' +
      'Físico colado na ficha vale sobre o do estudo, em todo o app. Em 18/10 foi testada uma letra por duas notas 0–100 (explosão e volume), com peso do físico por posição (b17); separava melhor quem sobe, mas mudava <b>446</b> letras já analisadas — decisão: <b>fica a regra atual</b>.</p></div>' +
      /* 18/10 — os dois grupos de indicadores, ao lado da regra: quais são, quantos e o que cada um compõe */
      '<div class="vnf-eixos"><h4>Os <b>6</b> indicadores, em dois grupos</h4>' +
      '<table><colgroup><col class="c1"><col class="c2"><col class="c3"></colgroup><thead><tr><th>Grupo</th><th>Indicadores (SkillCorner, por 90 min)</th><th>Compõe</th></tr></thead><tbody>' +
      '<tr><th>Explosão e rapidez<small><b>4</b> indicadores</small></th><td><ul><li>Velocidade máxima (PSV-99)</li><li>Sprints</li><li>Ações de alta intensidade</li><li>Arrancadas explosivas</li></ul></td>' +
      '<td>A média dos 4 desvios é a <b>explosão</b>: define o tipo <i>Explosivo e rápido</i> (A); acima de <b>+0,5</b> entra no A+; acima de <b>+0,25</b> tira do C ("explosivo, pouco volume").</td></tr>' +
      '<tr><th>Volume<small><b>2</b> indicadores</small></th><td><ul><li>Distância percorrida</li><li>Corridas sem bola (por 30 min com posse)</li></ul></td>' +
      '<td>A média dos 2 desvios é o <b>volume</b>: define o <i>Motor de volume</i>; acima de <b>+0,5</b> dá o A+ (com explosão) e o A do médio.</td></tr>' +
      '</tbody></table><p>Cada indicador vira um desvio em relação à Série B do setor; o tipo é o centróide mais próximo nos 6.</p>' +
      '<details class="vnf-outros"><summary>Os outros <b>15</b> indicadores do SkillCorner — por que ficaram de fora</summary>' +
      '<p>Cada um deles repete um dos seis (correlação nos <b>1.328</b> titulares da Série B 2022–25, dentro do setor). Entrar com eles seria contar a mesma coisa duas vezes: o sprint, por exemplo, entraria por cinco nomes. O que menos se repete (frear e mudar de direção) foi testado como terceiro eixo em 18/10 e não separa quem sobe de quem cai.</p>' +
      '<table><thead><tr><th>Indicador</th><th>Repete</th><th>r</th></tr></thead><tbody>' +
      [['Metros por minuto', 'Distância', '1,00'], ['Corridas HSR (20–25 km/h), contagem', 'Ações de alta intensidade', '1,00'], ['Distância em sprint (> 25 km/h)', 'Sprints', '0,95'], ['Velocidade de pico', 'PSV-99', '0,95'],
       ['Distância em alta intensidade (> 20 km/h)', 'Ações de alta intensidade', '0,95'], ['Distância em corrida (15–20 km/h)', 'Distância', '0,89'], ['PSV-99, média dos 5 melhores', 'PSV-99', '0,88'], ['Distância HSR', 'Ações de alta intensidade', '0,84'],
       ['Arrancadas explosivas até HSR', 'Arrancadas explosivas', '0,78'], ['Mudanças de direção', 'Ações de alta intensidade', '0,69'], ['Desacelerações fortes (< −3 m/s²)', 'Ações de alta intensidade', '0,69'], ['Acelerações fortes (> +3 m/s²)', 'Arrancadas explosivas', '0,68'],
       ['Acelerações médias (1,5 a 3 m/s²)', 'Ações de alta intensidade', '0,56'], ['Corridas para a área (por 30 min com posse)', 'Corridas sem bola', '0,54'], ['Desacelerações médias', 'Distância', '0,52']].map(x => '<tr><td>' + x[0] + '</td><td>' + x[1] + '</td><td class="n">' + x[2] + '</td></tr>').join('') +
      '</tbody></table></details></div></div>' +
      '<div id="vnfMatriz"></div>' +
      '<div id="vnfPainel"></div>' +
      (b15 ? '<article class="esv-doc"><div class="esv-doc-meta">' + esc(b15.grupo) + ' · ' + dataBR(b15.data) + '</div><h2>' + esc(b15.titulo) + '</h2>' + b15.html + '</article>' : '<p class="esv-vazio">O estudo V2 não carregou (static/estudo_v2_dados.js).</p>') +
      (b8 ? '<details class="vnf-mais"><summary>' + esc(b8.titulo) + ' — o documento completo</summary><article class="esv-doc"><div class="esv-doc-meta">' + esc(b8.grupo) + ' · ' + dataBR(b8.data) + '</div>' + b8.html + '</article></details>' : '') +
      '</div>';
    vnfMatriz();
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
  /* ---------- matriz por posição: o que é A+, A, B e C em cada uma, e quantos jogadores há em cada letra ---------- */
  const POS10 = [['LD', 'Lateral direito'], ['ZD', 'Zagueiro direito'], ['ZE', 'Zagueiro esquerdo'], ['LE', 'Lateral esquerdo'], ['VOL', 'Volante'],
    ['MED', 'Médio'], ['MEI', 'Meia'], ['ED', 'Extremo direito'], ['EE', 'Extremo esquerdo'], ['CA', 'Centroavante']];
  const SA_LIGAS = ['Argentina A', 'Argentina B', 'Colombia A', 'Colombia B', 'Equador A', 'Equador B', 'Paraguai', 'Uruguai', 'Chile', 'Peru', 'Bolivia', 'Venezuela'];
  const SA_PAISES = ['Brazil', 'Argentina', 'Uruguay', 'Colombia', 'Paraguay', 'Chile', 'Ecuador', 'Peru', 'Bolivia', 'Venezuela'];
  const MERCADOS = [['b', 'Série B'], ['sa', 'Ligas sul-americanas'], ['ext', 'Sul-americanos no exterior'], ['tres', 'Os três mercados']];
  let contagem = null, contagemN = -1, mercado = ler('vnfMercado') || 'b';
  function grupoDe(j) {
    if (j.l === 'Brasil B') return 'b';
    if (SA_LIGAS.includes(j.l)) return 'sa';
    const sul = SA_PAISES.includes(j.nac) || SA_PAISES.some(p => String(j.psp || '').includes(p));
    if (sul && !/^Brasil/.test(j.l || '') && j.l !== 'Manual') return 'ext';
    return null;
  }
  function contar() {
    if (typeof BASE === 'undefined' || !BASE.length || typeof tipoLetra !== 'function' || !window.CONSULTA) return null;
    if (contagem && contagemN === BASE.length) return contagem;
    const c = {}; POS10.forEach(p => { c[p[0]] = {}; ['b', 'sa', 'ext'].forEach(g => { c[p[0]][g] = { 'A+': 0, A: 0, B: 0, C: 0 }; }); });
    BASE.forEach(b => {
      if (!c[b.p]) return;
      const g = grupoDe(b); if (!g) return;
      let j = b; try { if (typeof comFisicoDoEstudo === 'function') j = comFisicoDoEstudo(b) || b; } catch (e) {}
      let l = null; try { l = tipoLetra(j); if (l === 'A' && typeof tipoMais === 'function' && tipoMais(j)) l = 'A+'; } catch (e) {}
      if (!l) return;
      try { const r = typeof csRegistro === 'function' ? csRegistro(b) : null; if (r && r.vet) return; } catch (e) {}
      c[b.p][g][l]++;
    });
    contagem = c; contagemN = BASE.length; return c;
  }
  /* o que cada letra quer dizer na posição: vem dos tipos do estudo (CONSULTA.pref / cai / cen) e das regras do app.js */
  function significado(pos) {
    const C = window.CONSULTA, setor = (typeof TIPO_SET !== 'undefined' ? TIPO_SET[pos] : '');
    const tipos = Object.keys(((C.cen || {})[setor] || {}).tipos || {});
    const pref = (C.pref || {})[pos] || [], cai = (C.cai || {})[pos] || [];
    const meio = tipos.filter(t => !pref.includes(t) && !cai.includes(t));
    if (pos === 'MED') return { 'A+': '—', A: 'Motor de volume (volume acima de +0,5, seja qual for o tipo)', B: tipos.filter(t => !cai.includes(t)).join(' · ') + ' · Explosivo, pouco volume', C: cai.join(' · ') };
    if (pos === 'MEI') return { 'A+': '—', A: pref.join(' · '), B: meio.join(' · ') + ' · Explosivo, pouco volume', C: cai.join(' · ') };
    return { 'A+': pref.join(' · ') + ' + volume (explosão e volume acima de +0,5)', A: pref.join(' · '), B: meio.join(' · ') + ' · Explosivo, pouco volume', C: cai.join(' · ') };
  }
  function vnfMatriz() {
    const el = $('#vnfMatriz'); if (!el || !window.CONSULTA) return;
    const c = contar();
    const L = ['A+', 'A', 'B', 'C'];
    const chip = l => '<span class="tipo-abc tipo-' + (l === 'A+' ? 'Ap' : l) + '">' + l + '</span>';
    const tot = { 'A+': 0, A: 0, B: 0, C: 0 };
    const linha = p => {
      const sig = significado(p[0]);
      const n = {}; L.forEach(l => { n[l] = c ? (mercado === 'tres' ? ['b', 'sa', 'ext'].reduce((s, g) => s + c[p[0]][g][l], 0) : c[p[0]][mercado][l]) : null; tot[l] += n[l] || 0; });
      const soma = L.reduce((s, l) => s + (n[l] || 0), 0);
      return '<tr><th>' + esc(p[1]) + '<small>' + (c ? soma + ' com letra' : 'carregando…') + '</small></th>' + L.map(l => '<td class="' + (sig[l] === '—' ? 'vnf-nao' : '') + '">' +
        (sig[l] === '—' ? '<span class="vnf-vaz">não existe</span>' : '<span class="vnf-sig">' + esc(sig[l]) + '</span>' +
        (c ? '<span class="vnf-n"><b>' + n[l] + '</b> <em>' + (soma ? Math.round(100 * n[l] / soma) : 0) + '%</em></span>' : '')) + '</td>').join('') + '</tr>';
    };
    const corpo = POS10.map(linha).join('');
    const somaT = L.reduce((s, l) => s + tot[l], 0);
    el.innerHTML = '<div class="vnf-mat"><h3>O que é cada letra, posição a posição — e quantos jogadores há em cada uma</h3>' +
      '<div class="vnf-chips">' + MERCADOS.map(m => '<button type="button" data-m="' + m[0] + '"' + (m[0] === mercado ? ' class="on"' : '') + '>' + esc(m[1]) + '</button>').join('') + '</div>' +
      '<table class="vnf-tab"><thead><tr><th>Posição</th>' + L.map(l => '<th>' + chip(l) + '</th>').join('') + '</tr></thead><tbody>' + corpo +
      (c ? '<tr class="vnf-tot"><th>Todas as posições<small>' + somaT + ' com letra</small></th>' + L.map(l => '<td><span class="vnf-n"><b>' + tot[l] + '</b> <em>' + (somaT ? Math.round(100 * tot[l] / somaT) : 0) + '%</em></span></td>').join('') + '</tr>' : '') +
      '</tbody></table>' +
      '<p class="vnf-nota">Contagem pela letra do app (a mesma dos cards), só quem tem físico rastreado (5 jogos ou mais) e não está vetado; o percentual é dentro da posição, no mercado escolhido. ' +
      'As segundas divisões de Argentina, Colômbia e Equador não têm dado físico. A lista nominal está em Mercado › Tipo físico A+, A e B.</p></div>';
    el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { mercado = b.dataset.m; gravar('vnfMercado', mercado); vnfMatriz(); });
    if (!c) setTimeout(vnfMatriz, 1000);   /* a BASE ainda está chegando: tenta de novo */
  }

  function ligarFisico() {
    const bt = abaOriginal('vnfisico'), pg = $('#pgVnFisico');
    if (!bt || !pg) return;
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on) montarFisico(); };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  /* ---------- Estudo › Técnico: os dois quadros da seta técnica (18/10, pedido do Henrique: "o quadro das setinhas e o quadro
     do que entra e do que não entra em cada um, e o porquê"), antes da página "Característica por posição".
     Dado: static/tecnico_grupos_dados.js (Santa Cruz V2/scripts/b21_seta_tecnica.py). ---------- */
  const NOME_POS = {}; POS10.forEach(p => { NOME_POS[p[0]] = p[1]; });
  const sinal = v => v == null ? '—' : (v > 0 ? '+' : '') + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = v => Math.round(100 * v) + '%';
  let tecnicoFeito = false;
  function montarTecnico() {
    const pg = $('#pgCaracteristicas'), rol = pg && pg.querySelector('.emp-rolagem'), corpo = $('#carCorpo');
    if (!rol || !corpo || tecnicoFeito) return;
    const TG = window.TECNICO_GRUPOS; if (!TG) return;
    tecnicoFeito = true;
    const G = TG.grupos, R = TG.reguas, ordem = TG.ordem;
    const refAnos = TG.ref_anos[0] + '–' + String(TG.ref_anos[1]).slice(2), anos = TG.anos[0] + '–' + TG.anos[TG.anos.length - 1];
    /* os indicadores de cada grupo (os 40 da ficha; 4 deles fora da conta porque o Wyscout mudou o critério) */
    const porGrupo = {}; G.forEach(g => { porGrupo[g] = []; });
    const vol = R.VOL || R[ordem[0]];
    [].concat(vol.entra, vol.fora).forEach(x => { if (porGrupo[x.g] && !porGrupo[x.g].some(y => y.rot === x.rot)) porGrupo[x.g].push({ rot: x.rot, nm: x.motivo === 'critério mudou' }); });
    const auc = TG.auc || [], aucDe = n => { const r = auc.find(x => x.regra.indexOf(n) === 0); return r ? r.auc : null; };
    const fAuc = v => v == null ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const tot = rg => G.reduce((s, g) => s + (R[rg].pesos[g] || 0), 0) || 1;
    const MOTIVO = { 'do time': 'do time — separa quem sobe de quem cai, mas a time igual não (a diferença vem do time)', 'não separa': 'não separa — abaixo de 0,30 desvio', estilo: 'estilo — quem sobe tem MENOS (retrato do time, não qualidade)', 'critério mudou': 'critério mudou — o Wyscout mudou a conta no período', clube: 'clube — fora por decisão do clube (zagueiro: no ataque só passes para a área, xG e gols)', 'sem dado': 'sem dado suficiente' };
    const ORD_MOT = ['do time', 'não separa', 'estilo', 'critério mudou', 'clube', 'sem dado'];
    const linha = rg => {
      const P = R[rg], t = tot(rg), d = P.dist.Todos, nT = d.v + d.a + d.r;
      const cel = g => { const e = P.entra.filter(x => x.g === g); const w = P.pesos[g] || 0;
        return '<td class="vnt-g">' + (e.length ? '<span class="vnf-n"><b>' + e.length + '</b> <em>' + pct(w / t) + '</em></span><ul>' +
          e.slice().sort((a, b) => b.w - a.w).map(x => '<li>' + esc(x.rot) + ' <i title="separação a time igual (bruta ' + sinal(x.sep) + ')">' + sinal(x.sepT) + '</i>' + (x.clube ? '<em class="clube" title="entra por decisão do clube (09/10)">clube</em>' : '') + '</li>').join('') + '</ul>'
          : '<span class="vnf-vaz">nenhum entra</span>') + '</td>'; };
      const por = {}; P.fora.forEach(f => { (por[f.motivo] = por[f.motivo] || []).push(f); });
      const mots = ORD_MOT.filter(m => por[m]);
      const fora = '<td class="vnt-fora"><b>' + P.fora.length + '</b> ficam fora — ' + mots.map(m => m + ' <b>' + por[m].length + '</b>').join(' · ') +
        '<details><summary>ver quais e por quê</summary><dl>' + mots.map(m => '<dt>' + esc(MOTIVO[m] || m) + ' (' + por[m].length + ')</dt><dd>' +
          por[m].slice().sort((a, b) => (b.sep || 0) - (a.sep || 0)).map(f => esc(f.rot) + (f.sepT != null ? ' (' + sinal(f.sepT) + ' / ' + sinal(f.sep) + ')' : '')).join(' · ') + '</dd>').join('') + '</dl></details></td>';
      return '<tr><th>' + esc(P.nome) + '<small>' + (TG.posicoes_da_regua[rg] || []).map(p => NOME_POS[p] || p).join(' + ') + '</small><small>' + P.n.Sobe + ' sobem · ' + P.n.Meio + ' meio · ' + P.n.Cai + ' caem</small>' +
        '<span class="vnt-dist" title="como a nota distribui os ' + nT + ' titulares da Série B ' + anos + ' desta régua">▲ <b class="v">' + d.v + '</b> · ↔ <b class="a">' + d.a + '</b> · ▼ <b class="r">' + d.r + '</b></span></th>' + G.map(cel).join('') + fora + '</tr>';
    };
    const el = document.createElement('div'); el.id = 'vntQuadros'; el.className = 'vnf';
    if (TG.modo === 'conta') {
      /* 18/10 (b22): seta por CONTAGEM dos fundamentais, grupo único */
      const pc = Math.round((TG.perto || 0.1) * 100), cf = v => (v > 0 ? '+' : '') + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const linhaC = rg => {
        const P = R[rg], d = P.dist.Todos;
        const por = {}; P.fora.forEach(f => { (por[f.motivo] = por[f.motivo] || []).push(f); });
        return '<tr><th>' + esc(P.nome) + '<small>' + (TG.posicoes_da_regua[rg] || []).map(p => NOME_POS[p] || p).join(' + ') + '</small><small>' + P.n.Sobe + ' sobem · ' + P.n.Meio + ' meio · ' + P.n.Cai + ' caem</small>' +
          '<span class="vnt-dist">▲ <b class="v">' + d.v + '</b> · ↔ <b class="a">' + d.a + '</b> · ▼ <b class="r">' + d.r + '</b></span></th>' +
          '<td class="vnt-g"><span class="vnf-n"><b>' + P.entra.length + '</b> fundamentais</span><ul>' + P.entra.slice().sort((a, b) => (b.sep || 0) - (a.sep || 0)).map(x => '<li>' + esc(x.rot) + ' <i title="separação entre o titular de quem sobe e o de quem cai, em desvios">' + sinal(x.sep) + '</i>' + (x.clube ? '<em class="clube" title="entra por decisão do clube (09/10)">clube</em>' : '') + '</li>').join('') + '</ul></td>' +
          '<td class="vnt-g">▲ a partir de <b>' + cf(P.cortes.v) + '</b><br>▼ até <b>' + cf(P.cortes.r) + '</b></td>' +
          '<td class="vnt-fora"><b>' + P.fora.length + '</b> ficam fora — ' + Object.keys(por).map(m => m + ' <b>' + por[m].length + '</b>').join(' · ') + '<details><summary>ver quais</summary><dl>' +
          Object.keys(por).map(m => '<dt>' + esc(m) + '</dt><dd>' + por[m].map(f => esc(f.rot) + (f.sep != null ? ' (' + sinal(f.sep) + ')' : '')).join(' · ') + '</dd>').join('') + '</dl></details></td></tr>';
      };
      el.innerHTML = '<h2 class="vnf-tit">Técnico — a seta ▲ ↔ ▼ e o que entra nela</h2>' +
        '<p class="vnf-intro">Cada jogador de linha recebe uma <b>seta</b> pelo técnico (Wyscout): a mesma dos cards do campograma, da lista Tipo físico e do Banco de consulta. Junto com a letra do físico, ela forma o <b>farol</b>.</p>' +
        '<div class="vnf-duas"><div class="vnf-regra">' +
        '<p><b>Fundamentais.</b> Em cada posição, entra o indicador que separa o titular de quem sobe do de quem cai em <b>0,15</b> desvio ou mais (Série B ' + anos + ', 900 minutos ou mais; gêmeas juntas). Zagueiro: a defesa entra por decisão do clube.</p>' +
        '<p><b>A cor de cada um</b>, contra a <b>média da Série B</b> na posição: <span class="sf-n v">verde</span> na média ou acima · <span class="sf-n a">amarelo</span> até <b>' + pc + '%</b> abaixo · <span class="sf-n r">vermelho</span> abaixo · azul = o melhor da Série B. Em faltas e cartões, menos é melhor. (No histórico, a média da Série B de cada ano.)</p>' +
        '<p><b>A seta</b> conta as cores: pontos = (verdes − vermelhos) ÷ medidos.</p>' +
        '<div><span class="vnt-seta v">▲</span><span>pontos a partir de onde fica o titular mediano de quem sobe</span></div>' +
        '<div><span class="vnt-seta a">↔</span><span>entre as duas medianas</span></div>' +
        '<div><span class="vnt-seta r">▼</span><span>pontos até onde fica o titular mediano de quem cai</span></div>' +
        '<div><span class="vnt-seta n">?</span><span>menos de 4 fundamentais medidos</span></div>' +
        '<div class="vnt-prova"><b>Prova</b> (um ano de fora por vez; AUC — 0,50 é moeda): a contagem empata com as regras anteriores e põe muito mais indicador na conta (o centroavante foi de 3 para ' + R.CA.entra.length + ').' +
        '<table><thead><tr><th>Regra</th><th>AUC</th></tr></thead><tbody>' + auc.map(r => '<tr><td>' + esc(r.regra) + '</td><td class="n">' + fAuc(r.auc) + '</td></tr>').join('') + '</tbody></table></div></div></div>' +
        '<div class="vnf-mat"><h3>Os fundamentais, posição a posição</h3><table class="vnf-tab vnt-tab"><thead><tr><th>Régua</th><th>Fundamentais (separação)</th><th>Cortes da seta</th><th>Fica de fora</th></tr></thead><tbody>' + ordem.map(linhaC).join('') + '</tbody></table>' +
        '<p class="vnf-nota">Gerado em ' + esc(TG.gerado_em) + ' (b22). Abaixo, a página de sempre: indicador a indicador, sobe × meio × cai.</p></div>';
      rol.insertBefore(el, corpo); return;
    }
    el.innerHTML =
      '<h2 class="vnf-tit">Técnico — a seta ▲ ↔ ▼ e o que entra nela</h2>' +
      '<p class="vnf-intro">Cada jogador de linha recebe uma <b>seta</b> pelo técnico (Wyscout), comparado com os titulares da Série B da sua posição. É a mesma seta dos cards do campograma, da lista Tipo físico A+, A e B e do Banco de consulta; ' +
      'junto com a letra do físico ela forma o <b>farol</b>. A seta é só técnica — o físico já está na letra.</p>' +
      '<div class="vnf-duas"><div class="vnf-regra">' +
      '<div><span class="vnt-seta v">▲</span><span><b>No nível do titular de quem sobe</b> — nota técnica a partir da mediana dos titulares dos times que subiram, na régua da posição.</span></div>' +
      '<div><span class="vnt-seta a">↔</span><span><b>Entre quem sobe e quem cai</b> — nota entre as duas medianas.</span></div>' +
      '<div><span class="vnt-seta r">▼</span><span><b>No nível de quem cai</b> — nota até a mediana dos titulares dos times que caíram.</span></div>' +
      '<div><span class="vnt-seta n">?</span><span><b>Faltam dados</b> — menos de 4 dos indicadores que entram na nota estão medidos.</span></div>' +
      '<p><b>Como a nota é calculada.</b> Os indicadores da ficha estão em <b>4</b> grupos, os mesmos do ranking do Botafogo: Defensivo, Passe, Ofensivo e Participação em gols. ' +
      'Em cada régua (posição; as gêmeas juntas: os dois laterais, os dois zagueiros, os dois extremos) entra o indicador que separa o titular de quem sobe do de quem cai em <b>0,30</b> desvio ou mais <i>e</i> que ainda separa <b>a time igual</b> em <b>0,20</b> ou mais. ' +
      'O valor do jogador vira desvio contra a Série B <b>' + refAnos + '</b> da régua (faltas e cartões com o sinal trocado; limitado a ±2,5). A nota é a média dos desvios de cada grupo, pesada pela separação do grupo a time igual — o peso de cada grupo, posição a posição, está na tabela abaixo. Régua: os <b>' +
      ordem.reduce((s, rg) => s + R[rg].n.Sobe + R[rg].n.Meio + R[rg].n.Cai, 0).toLocaleString('pt-BR') + '</b> titulares da Série B ' + anos + ' com 900 minutos ou mais.</p>' +
      '<p><b>A time igual.</b> Dúvida levantada em 18/10: participação em gols não é do time? Para responder, de cada indicador foi tirada a parte que o time explica (ataque, passe e participação contra o xG e a posse do time na temporada; defesa contra os duelos defensivos ganhos e o PPDA do time). O que sobra é do jogador — é com isso que se escolhe e se pesa. ' +
      'No volante, a participação em gols <b>continua</b> separando a time igual (quem sobe participa mais de gols mesmo em times com o mesmo ataque); o volume de passe caiu — parte era do time. O indicador que separava só por causa do time aparece como <i>do time</i> e fica de fora.</p>' +
      '<div class="vnt-prova"><b>Prova</b> (um ano de fora por vez, ' + anos + '; AUC — 0,50 é moeda, 1,00 é acerto total): a seta nova <b>não prevê melhor</b> que a seta de hoje — empata. O ganho é de leitura: quatro grupos, pesos vindos do dado, posição a posição, e só o que é do jogador.' +
      '<table><thead><tr><th>Regra</th><th>AUC</th></tr></thead><tbody>' + auc.map(r => '<tr><td>' + esc(r.regra) + '</td><td class="n">' + fAuc(r.auc) + '</td></tr>').join('') + '</tbody></table>' +
      'Zagueiro: a defesa entra por decisão do clube (09/10) e custa previsão (' + fAuc(aucDe('Nota por grupo (')) + ' contra ' + fAuc(aucDe('Nota por grupo sem')) + ' sem a regra); o clube prefere o zagueiro julgado pela defesa.</div></div>' +
      '<div class="vnf-eixos"><h4>Os <b>' + Object.values(porGrupo).reduce((s, a) => s + a.filter(x => !x.nm).length, 0) + '</b> indicadores, em quatro grupos</h4>' +
      '<div class="vnt-grupos">' + G.map(g => '<div><b>' + esc(g) + '<i>' + porGrupo[g].filter(x => !x.nm).length + (porGrupo[g].some(x => x.nm) ? ' + ' + porGrupo[g].filter(x => x.nm).length + ' fora' : '') + '</i></b>' +
        porGrupo[g].map(x => esc(x.rot) + (x.nm ? ' <s title="fora da conta: o Wyscout mudou o critério no período">~</s>' : '')).join(' · ') + '</div>').join('') + '</div>' +
      '<p>Os mesmos grupos do ranking do Botafogo (glossário do Portal Ranking), no que a ficha tem. ~ = volume de duelo e de ação defensiva: o Wyscout mudou o critério no período, fica fora da conta. Em cada posição entra só o que separa quem sobe de quem cai a time igual — a tabela abaixo diz quais, com a separação ao lado (quanto maior, mais pesa).</p></div></div>' +
      '<div class="vnf-mat"><h3>O que entra na nota e o que fica de fora, posição a posição — e quanto pesa cada grupo</h3>' +
      '<table class="vnf-tab vnt-tab"><thead><tr><th>Régua</th>' + G.map(g => '<th>' + esc(g) + '</th>').join('') + '<th>Fica de fora</th></tr></thead><tbody>' + ordem.map(linha).join('') + '</tbody></table>' +
      '<p class="vnf-nota">Em cada grupo: <b>quantos</b> indicadores entram e o <b>peso</b> do grupo na nota (soma das separações a time igual dos que entram, dividida pelo total da régua). Ao lado de cada indicador, a separação a time igual (passe o mouse para ver a bruta). ' +
      'Na primeira coluna, quantos titulares da Série B ' + anos + ' a nota põe em cada seta: ▲ a partir da mediana de quem sobe, ▼ até a mediana de quem cai. Gerado em ' + esc(TG.gerado_em) + ' (b21). Abaixo, a página de sempre: indicador a indicador, sobe × meio × cai.</p></div>';
    rol.insertBefore(el, corpo);
  }
  function ligarTecnico() {
    const bt = abaOriginal('caracteristicas');
    if (!bt) return;
    const sync = () => { if (bt.classList.contains('on')) montarTecnico(); };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  function iniciar() {
    montarBarra();
    if (!NOVA) return;
    ligarFisico(); ligarTecnico();
    const nav = $('nav.abas');
    if (nav) new MutationObserver(sincronizar).observe(nav, { attributes: true, attributeFilter: ['class'], subtree: true });
    /* abre sempre no campograma, como a barra de hoje (18/10); os capítulos lembrados valem a partir do primeiro clique */
    setTimeout(() => irSub(ABAS[0], ABAS[0].sub[0]), 0);
    sincronizar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();

/* 18/10 — Estudo › Físico (B16): clicar num número da tabela de letras mostra quem são os titulares (static/b16_listas.js) */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NOME = { LD: 'Lateral direito', ZD: 'Zagueiro pela direita', ZE: 'Zagueiro pela esquerda', LE: 'Lateral esquerdo', VOL: 'Volante', MED: 'Médio', MEI: 'Meia', ED: 'Extremo pela direita', EE: 'Extremo pela esquerda', CA: 'Centroavante' };
  const FX = { Todos: 'todos', Sobe: 'em quem subiu', Meio: 'no meio', Cai: 'em quem caiu' };
  document.addEventListener('click', ev => {
    const el = ev.target.closest && ev.target.closest('.b16c'); if (!el) return;
    const L = window.B16_LISTAS && window.B16_LISTAS[el.dataset.k]; if (!L) return;
    ev.preventDefault();
    const [pos, letra, fx] = el.dataset.k.split('~');
    const aberto = el.closest('tr').nextElementSibling;
    if (aberto && aberto.classList.contains('b16-lista')) { const mesmo = aberto.dataset.k === el.dataset.k; aberto.remove(); if (mesmo) return; }
    const tr = document.createElement('tr'); tr.className = 'b16-lista'; tr.dataset.k = el.dataset.k;
    const cor = { subiu: 'v', meio: 'a', caiu: 'r' };
    tr.innerHTML = '<td colspan="6"><div class="b16-box"><b>' + esc(NOME[pos] || pos) + ' · letra ' + esc(letra) + ' · ' + FX[fx] + ' — ' + L.length + ' titulares</b> <small>(clique de novo no número para fechar)</small><div class="b16-grid">' +
      L.map(r => '<span><i class="b16-' + (cor[r[3]] || 'a') + '">' + esc(r[3]) + '</i> <b>' + esc(r[0]) + '</b> · ' + esc(r[1]) + ' · ' + r[2] + ' <em>' + esc(r[4]) + '</em></span>').join('') + '</div></div></td>';
    el.closest('tr').after(tr);
  });
})();
