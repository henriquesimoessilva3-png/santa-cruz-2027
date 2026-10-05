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
  const CATS = [['fis', 'Físico'], ['pas', 'Passe'], ['atq', 'Ataque'], ['def', 'Defesa'], ['all', 'Completo (todos)']];
  const SA = ['Argentina A', 'Argentina B', 'Colombia A', 'Colombia B', 'Equador A', 'Equador B', 'Paraguai', 'Uruguai', 'Chile', 'Peru', 'Bolivia', 'Venezuela'];
  const ALVO = ['Argentina A', 'Argentina B', 'Paraguai', 'Colombia A', 'Colombia B', 'Equador A', 'Equador B'];
  const GRUPOS = [['', 'Todas as ligas'], ['@b', 'Série B'], ['@ab', 'Brasil A + B'], ['@alvo', 'Argentina, Paraguai, Colômbia e Equador'],
    ['@balvo', 'Série B + Argentina, Paraguai, Colômbia e Equador'], ['@sa', 'América do Sul (sem Brasil)']];
  const noGrupo = (g, l) => !g ? true : g === '@b' ? l === 'Brasil B' : g === '@ab' ? (l === 'Brasil A' || l === 'Brasil B') : g === '@alvo' ? ALVO.includes(l)
    : g === '@balvo' ? (l === 'Brasil B' || ALVO.includes(l)) : g === '@sa' ? SA.includes(l) : l === g;

  const F0 = { liga: '', nac: '', idade: '', ate: '', valor: '', minutos: '', fis: false };
  let E = { pos: 'VOL', perfil: 'fis', mins: null, tol: 100, soPerfil: true, topN: 5, f: Object.assign({}, F0), sel: {}, perfis: [] };
  try { const g = JSON.parse(localStorage.getItem(LS) || 'null'); if (g) { E = Object.assign(E, g); E.f = Object.assign({}, F0, g.f || {}); } } catch (e) {}
  if (D && !D.posicoes[E.pos]) E.pos = 'VOL';
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
  function padrao(pos, cat) {
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
  function htmlMatriz() {
    const P = D.posicoes[E.pos], mins = minsAtuais(), ks = Object.keys(mins).map(Number);
    const mapa = {}; P.jog.forEach(j => { mapa[chave(j)] = j; });
    const js = selAtual().map(k => mapa[k]).filter(Boolean);
    let h = '<table class="sub-mat"><thead><tr><th class="rot">Indicador' +
      '<label class="sub-chk" style="margin-top:4px"><input type="checkbox" id="subSoPerfil"' + (E.soPerfil ? ' checked' : '') + '> só os do perfil</label></th>' +
      '<th class="sub-h sobe"><span class="nm">Quem sobe</span><span class="cl">' + (P.n.Sobe || 0) + ' titulares · mediana</span></th>' +
      '<th class="sub-h cai"><span class="nm">Quem cai</span><span class="cl">' + (P.n.Cai || 0) + ' titulares · mediana</span></th>' +
      js.map(j => { const a = aderencia(j, mins, ks);
        return '<th class="sub-h"><span class="x" data-rm="' + esc(chave(j)) + '" title="tirar da comparação">✕</span><span class="nm">' + esc(j[0]) + '</span>' +
          '<span class="cl">' + esc(j[2]) + ' · ' + esc(j[3]) + '</span><span class="cl">' + (j[4] != null ? j[4] + ' anos · ' : '') +
          '<span class="' + (livre(j[5]) ? 'sub-ct' : '') + '">contrato ' + mesAno(j[5]) + '</span></span>' +
          (ks.length ? '<span class="ad' + (a.ok === a.n ? ' cheio' : '') + '" title="mínimos do perfil que ele cumpre">' + a.ok + '/' + a.n + '</span>' : '') + '</th>'; }).join('') +
      '</tr></thead><tbody>';
    let bloco = '';
    D.inds.forEach(i => {
      const r = ref(E.pos, i.k); if (!r || r[0] == null) return;
      const lim = mins[i.k];
      if (E.soPerfil && ks.length && lim == null) return;
      if (i.bloco !== bloco) { bloco = i.bloco; h += '<tr class="bloco"><td colspan="' + (3 + js.length) + '">' + esc(bloco) + '</td></tr>'; }
      h += '<tr class="' + (lim != null ? 'no-perfil' : '') + '"><td class="rot">' + esc(i.rot) + (r[3] ? ' *' : '') +
        (lim != null ? '<span class="lim">' + (i.menor ? 'máx ' : 'mín ') + num(lim, i.casas) + '</span>' : '') + '</td>' +
        '<td>' + celula(i, r, r[0], null, 'ref') + '</td><td>' + celula(i, r, r[1], null, 'ref') + '</td>' +
        js.map(j => '<td>' + celula(i, r, j[NC + i.k], lim) + '</td>').join('') + '</tr>';
    });
    h += '</tbody></table>';
    if (!js.length) h += '<div class="sub-vazio">Clique num jogador da lista ao lado (ou em “comparar os primeiros”) para colocá-lo aqui, ao lado de quem sobe e de quem cai.</div>';
    h += '<div class="sub-leg"><span><i style="background:var(--verde)"></i>no nível de quem sobe</span><span><i style="background:var(--ambar)"></i>entre quem cai e quem sobe</span>' +
      '<span><i style="background:#64748b"></i>no nível de quem cai</span><span><b style="color:var(--txt-vermelho)">número vermelho</b> = não cumpre o mínimo do perfil</span>' +
      '<span>tamanho da barra = percentil na posição (' + P.jog.length + ' jogadores)</span></div>';
    return h;
  }
  function htmlLista(lista) {
    const sel = new Set(selAtual());
    if (!lista.length) return '<div class="sub-vazio">Ninguém cumpre os mínimos com estes filtros. Baixe o “cumpre pelo menos” para 80% ou 70%, desmarque um mínimo ou abra o filtro de liga.</div>';
    return lista.slice(0, 250).map(({ j, a }) => '<div class="sub-item' + (sel.has(chave(j)) ? ' on' : '') + '" data-k="' + esc(chave(j)) + '">' +
      '<span class="nm">' + esc(j[0]) + '</span><span class="ad' + (a.n && a.ok === a.n ? ' cheio' : '') + '">' + (a.n ? a.ok + '/' + a.n : '—') + '</span>' +
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
        '<button class="sub-bt" id="subLimpar">Limpar comparação</button></div>' +
        '<div class="sub-busca"><input type="text" id="subBusca" placeholder="Adicionar qualquer jogador da posição: nome ou clube…" autocomplete="off"><div class="sub-busca-lista" id="subBuscaLista" hidden></div></div></div>' +
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
    if (v[0] === '@') { const p = E.perfis.find(x => x.pos === E.pos && '@' + x.nome === v); if (p) { E.mins = Object.assign({}, p.mins); E.tol = p.tol || 100; E.f = Object.assign({}, F0, p.f || {}); } }
    render();
  }
  function ligarEventos(R) {
    R.addEventListener('click', ev => {
      const t = ev.target, q = s => t.closest(s);
      let e;
      if ((e = q('[data-pos]'))) { E.pos = e.dataset.pos; if (E.perfil[0] === '@') E.perfil = 'fis'; E.mins = null; return render(); }
      if ((e = q('[data-rm]'))) { const s = selAtual(), i = s.indexOf(e.dataset.rm); if (i >= 0) s.splice(i, 1); return atualiza(); }
      if ((e = q('.sub-item'))) { const s = selAtual(), k = e.dataset.k, i = s.indexOf(k); if (i >= 0) s.splice(i, 1); else s.push(k); return atualiza(); }
      if ((e = q('[data-add]'))) { const s = selAtual(); if (!s.includes(e.dataset.add)) s.push(e.dataset.add); R.querySelector('#subBusca').value = ''; R.querySelector('#subBuscaLista').hidden = true; return atualiza(); }
      if (t.id === 'subTop') { const s = selAtual(); ultima.slice(0, E.topN).forEach(x => { const k = chave(x.j); if (!s.includes(k)) s.push(k); }); return atualiza(); }
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
        const ac = D.posicoes[E.pos].jog.filter(j => sem(j[0]).includes(q) || sem(j[1]).includes(q) || sem(j[2]).includes(q)).slice(0, 14);
        cx.innerHTML = ac.length ? ac.map(j => '<div data-add="' + esc(chave(j)) + '">' + esc(j[0]) + '<small>' + esc(j[2]) + ' · ' + esc(j[3]) + (j[4] != null ? ' · ' + j[4] + 'a' : '') + '</small></div>').join('')
          : '<div>ninguém com esse nome em ' + esc(D.posicoes[E.pos].nome) + ' (900 min ou mais)</div>';
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
  window.subidaQuadro = function (j, dados) {
    try {
      if (!D || !j || !D.posicoes[j.p]) return '';
      const P = D.posicoes[j.p], tec = {};
      if (dados && dados.ok) dados.linhas.forEach(l => { const nm = dados.nomes[l[0]]; if (nm && typeof l[1] === 'number') tec[nm[1]] = l[1]; });
      /* o que a ficha não traz para a posição (o kpis muda de posição para posição) vem da base da aba Subida */
      const nk = sem(j.n) + '|' + sem(j.t);
      const base = P.jog.find(x => x[3] === j.l && sem(x[0]) + '|' + sem(x[2]) === nk) || P.jog.find(x => x[3] === j.l && sem(x[0]) === sem(j.n)) || null;
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
            (paraBaixo(l.i, l.r) ? ' · aqui quem sobe tem MENOS' : '') + '">' + (l.chave ? '★ ' : '') + esc(l.i.rot) + (l.i.nm ? ' ~' : '') + (paraBaixo(l.i, l.r) ? ' ↓' : '') + '</td>' +
            '<td class="sq-v ' + (l.c || 'sq-nd') + '">' + (l.v == null ? '—' : num(l.v, l.i.casas)) + '</td><td>' + num(l.r[0], l.i.casas) + '</td><td>' + num(l.r[1], l.i.casas) + '</td></tr>').join('') +
          '</tbody></table></div>';
      };
      const nomes = a => a.slice().sort((x, y) => Math.abs(y.d) - Math.abs(x.d)).slice(0, 7).map(l => esc(l.i.rot)).join(' · ');
      return '<div class="sq"><div class="sq-topo"><h4>Quem sobe × quem cai · ' + esc(P.nome) + '</h4>' +
        '<span class="sq-res">No nível de quem sobe em <b class="v">' + acima.length + '</b> de <b>' + com.length + '</b> indicadores fundamentais' +
        (abaixo.length ? ' · no nível de quem cai em <b class="r">' + abaixo.length + '</b>' : '') + '</span>' +
        '<span class="sq-leg"><i class="v"></i>bate quem sobe <i class="a"></i>entre os dois <i class="r"></i>nível de quem cai · ★ fundamental · ↓ quem sobe tem menos</span></div>' +
        (acima.length ? '<p class="sq-frase"><b class="v">Acima de quem sobe:</b> ' + nomes(acima) + '</p>' : '') +
        (abaixo.length ? '<p class="sq-frase"><b class="r">No nível de quem cai:</b> ' + nomes(abaixo) + '</p>' : '') +
        '<div class="sq-grid">' + blocos.map(tab).join('') + '</div>' +
        '<div class="sq-pe">Régua: mediana do titular dos clubes que subiram e dos que caíram na Série B ' + D.anos[0] + '–' + D.anos[D.anos.length - 1] + ', na posição. ' +
        '★ = indicador que separa quem sobe de quem cai (0,30 desvio ou mais); a conta do topo usa só esses. Os números dele são os da ficha acima. ~ = o Wyscout mudou o critério; fica fora da conta.</div></div>';
    } catch (e) { return ''; }
  };
})();
