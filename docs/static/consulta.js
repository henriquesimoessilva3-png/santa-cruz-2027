/* Aba "Consulta de jogador" — digita um nome e o app diz se ele adere ao modelo que rende na
   Série B (técnico + físico) e onde ele está nas listas do estudo V2.
   Dado: static/consulta_dados.js (gerar_consulta_js.py): 15 mil jogadores com ≥ 900 min nas 66
   ligas do Wyscout (ago/26) + Série B 2026, físico SkillCorner/Portal, tipo físico (B8/B15), bola
   parada (B3), patamar de A (B13), Sofascore 2026 (B14), "Os meus dez", vetados e teto de valor.
   Arquivo próprio, sem encostar no app.js: observa o botão da aba, como as outras abas do estudo. */
(function () {
  'use strict';
  const D = window.CONSULTA;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const semAc = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const num = (x, d) => x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const dt = c => c ? c.slice(8, 10) + '/' + c.slice(5, 7) + '/' + c.slice(2, 4) : '—';
  const SET = { GOL: 'Goleiro', LD: 'Lateral', LE: 'Lateral', ZD: 'Zaga', ZE: 'Zaga', VOL: 'Volante', MED: 'Meia', MEI: 'Meia', ED: 'Extremo', EE: 'Extremo', CA: 'Atacante' };
  const POS = { GOL: 'Goleiro', LD: 'Lateral direito', ZD: 'Zagueiro pela direita', ZE: 'Zagueiro pela esquerda', LE: 'Lateral esquerdo', VOL: 'Volante', MED: 'Médio', MEI: 'Meia', ED: 'Extremo pela direita', EE: 'Extremo pela esquerda', CA: 'Centroavante' };
  const PEDE = { GOL: 'vídeo decide: a base não distingue goleiro bom de defesa boa (B2-5)', LD: 'passe longo, cruzamento, xA, duelo defensivo (B2-4)', LE: 'chega ao gol (xG, toques na área) e cruza (B2-4)',
    ZD: 'cria (passes chave, longos) e ganha no alto (B2-4)', ZE: 'finaliza, sai jogando longo e progressivo, ganha no alto — o maior sinal do estudo (B2-4)', VOL: 'duelo aéreo, corrida progressiva, interceptação; arrancadas (B2-4, B1-3)',
    MED: 'criador (xA, passes chave, passes para a área) que ganha duelo (B2-4)', MEI: 'cria e chega à área; cobrador de bola parada (B2-4, B3-3)', ED: 'defende e cria — não o finalizador (B2-4)', EE: 'decide: xG, gols, toques na área, faltas sofridas (B2-4)', CA: 'toca menos, acelera mais, chega à área, cabeceia (B2-4, B1-3)' };
  const ORDEM = ['GOL', 'LD', 'ZD', 'ZE', 'LE', 'VOL', 'MED', 'MEI', 'ED', 'EE', 'CA'];
  const ler = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  /* 11 campos, um por posição: texto digitado, jogador escolhido (índice na base) e qual está aberto na ficha */
  const st = Object.assign({ busca: {}, sel: {}, aberto: null }, ler('csEstado') || {});
  const IDX = D.jogadores.map((j, i) => ({ i, k: semAc(j.n) + ' ' + semAc(j.c) }));

  function procurar(q, pos) {
    const t = semAc(q); if (t.length < 2) return [];
    const partes = t.split(' ');
    return IDX.filter(x => partes.every(p => x.k.includes(p))).map(x => D.jogadores[x.i])
      .sort((a, b) => (a.p === pos ? 0 : 1) - (b.p === pos ? 0 : 1) || (a.m === 'Série B' ? 0 : 1) - (b.m === 'Série B' ? 0 : 1) || (b.nota || 0) - (a.nota || 0)).slice(0, 12);
  }

  function veredito(j) {
    const R = D.regua, pref = D.pref[SET[j.p]] || [];
    const pontos = [], contra = [], vazios = [];
    if (j.vet) contra.push('vetado pelo clube (EXCLUIDOS)');
    if (j.caro) contra.push('valor de mercado acima de € 2 MM: inalcançável');
    const ad = j.adc;
    if (ad == null) vazios.push('sem aderência (ficha sem dado)');
    else if (ad >= R.ader_bom) pontos.push('aderência alta ao modelo que rende na B (' + ad + ')');
    else if (ad >= R.ader_ok) pontos.push('aderência mediana (' + ad + ')');
    else contra.push('aderência baixa ao modelo que rende na B (' + ad + ')');
    if (j.niv == null) vazios.push('sem nível do ranking'); else if (j.niv >= 70) pontos.push('nível alto no ranking mundial (' + j.niv + ')'); else if (j.niv < 50) contra.push('nível baixo no ranking (' + j.niv + ')');
    if (j.p !== 'GOL') {
      if (j.psv == null) vazios.push('sem rastreio físico: piso de velocidade não verificado');
      else if (j.psv < R.psv) contra.push('abaixo do piso de velocidade (' + num(j.psv, 1) + ' km/h < 27): só com vídeo');
      else pontos.push('passa o piso de velocidade (' + num(j.psv, 1) + ' km/h)');
      if (j.tipo) { if (j.tpref) pontos.push('tipo físico de quem sobe (' + j.tipo + ')'); else contra.push('tipo físico "' + j.tipo + '" — quem sobe usa ' + pref.join(' / ')); }
    }
    if (['LD', 'ZD', 'ZE', 'LE', 'VOL'].includes(j.p) && j.xg_p != null) { if (j.xg_p >= 90) pontos.push('gol de defesa: xG/90 ' + num(j.xg, 2) + ', decil de cima da posição (rende e não custa, B7-1)'); else if (j.xg_p >= 75) pontos.push('chega ao gol: xG/90 ' + num(j.xg, 2) + ', quartil de cima da posição'); }
    if (['LD', 'LE', 'VOL', 'MED', 'MEI', 'ED', 'EE'].includes(j.p) && j.area_p != null) { if (j.area_p >= 90) pontos.push('corre para a área: ' + num(j.area, 1) + ' corridas/30 min, decil de cima (o físico que mais anda com participação em gol, B8-2)'); else if (j.area_p <= 25) contra.push('corre pouco para a área (' + num(j.area, 1) + '/30 min, quartil de baixo da posição)'); }
    if (j.bp) { const b = []; if (j.bp.cobrador >= 85) b.push('cobrador ' + j.bp.cobrador); if (j.bp.finalizador >= 85) b.push('finalizador aéreo ' + j.bp.finalizador); if (b.length) pontos.push('especialista de bola parada (' + b.join(', ') + ')'); }
    if (j.m !== 'Série B') vazios.push('vem de fora: aderência convertida pela reta de liga (p90 na origem → 58 na B, B11); vídeo obrigatório');
    let nivel, cls;
    if (j.vet || j.caro) { nivel = 'Fora'; cls = 'fora'; }
    else if (j.dez && j.dez.ordem <= 3) { nivel = 'Ideal'; cls = 'ideal'; }
    else if (j.dez || (j.nota != null && j.nota >= R.nota_bom && (j.psv == null || j.psv >= R.psv))) { nivel = 'Aderente'; cls = 'bom'; }
    else if (j.nota != null && j.nota >= R.nota_ok && (j.psv == null || j.psv >= R.psv)) { nivel = 'Parcial'; cls = 'meio'; }
    else { nivel = 'Não aderente'; cls = 'ruim'; }
    return { nivel, cls, pontos, contra, vazios };
  }

  function barra(v) {
    if (v == null) return '<span class="cs-vazio">—</span>';
    const c = v >= 75 ? 'alto' : v >= 50 ? 'meio' : 'baixo';
    return '<span class="cs-barra"><i class="' + c + '" style="width:' + Math.max(2, Math.min(100, v)) + '%"></i></span><b>' + Math.round(v) + '</b>';
  }

  /* Similares: mesma posição, entre os aderentes (nota ≥ 55, sem vetados/caros, piso ok), pela distância
     do perfil — percentis da ficha técnica (peso da ficha) e, quando os dois têm rastreio, físico
     (PSV, sprints, alta intensidade, arrancadas, padronizados dentro da posição). */
  const FIS = ['psv', 'spr', 'hi', 'expl']; const fisStat = {};
  function stat(pos) {
    if (fisStat[pos]) return fisStat[pos];
    const o = {}; FIS.forEach(k => { const v = D.jogadores.filter(x => x.p === pos && x[k] != null).map(x => x[k]); const m = v.reduce((a, b) => a + b, 0) / (v.length || 1); const sd = Math.sqrt(v.reduce((a, b) => a + (b - m) * (b - m), 0) / (v.length || 1)) || 1; o[k] = [m, sd]; });
    return fisStat[pos] = o;
  }
  function similares(j, n) {
    const R = D.regua, st_ = stat(j.p), temFis = FIS.every(k => j[k] != null);
    const out = [];
    for (const x of D.jogadores) {
      if (x === j || x.p !== j.p || x.vet || x.caro || !x.alc || x.nota == null || x.nota < R.nota_ok) continue;
      if (x.psv != null && x.psv < R.psv && x.p !== 'GOL') continue;
      let s = 0, w = 0;
      for (let i = 0; i < j.ficha.length; i++) { const a = j.ficha[i][1], b = (x.ficha[i] || [])[1], pw = j.ficha[i][2]; if (a == null || b == null) continue; s += pw * (a - b) * (a - b); w += pw; }
      if (w < 3) continue;
      let dt = Math.sqrt(s / w) / 100, df = null;
      if (temFis && FIS.every(k => x[k] != null)) { let q = 0; FIS.forEach(k => { const z = (j[k] - x[k]) / st_[k][1]; q += z * z; }); df = Math.sqrt(q / FIS.length) / 3; }
      const d = df == null ? dt : 0.7 * dt + 0.3 * Math.min(1, df);
      out.push([x, Math.round(100 * (1 - Math.min(1, d)))]);
    }
    return out.sort((a, b) => b[1] - a[1] || (b[0].nota || 0) - (a[0].nota || 0)).slice(0, n || 8);
  }
  function blocoSimilares(j) {
    const sim = similares(j, 8); if (!sim.length) return '';
    return '<div class="cs-bloco cs-sim"><h4>Similares a ' + esc(j.n) + ' — entre os aderentes da posição</h4><table><tr><th>Jogador</th><th>Clube</th><th>Idade</th><th>Contrato</th><th>Nota</th><th>PSV</th><th>Tipo</th><th>Semelhança</th></tr>' +
      sim.map(([x, p]) => '<tr class="cs-sim-l" data-n="' + esc(x.n) + '" data-c="' + esc(x.c) + '"><td><b>' + esc(x.n) + '</b>' + (x.dez ? ' <small>' + x.dez.ordem + 'º dez</small>' : '') + '</td><td>' + esc(x.c) + ' <small>' + esc(x.l) + '</small></td><td>' + (x.i == null ? '—' : x.i) + '</td><td>' + dt(x.ct) + '</td><td><b>' + x.nota + '</b></td><td>' + (x.psv == null ? '—' : num(x.psv, 1)) + '</td><td>' + (x.tipo ? esc(x.tipo) + (x.tpref ? ' ✓' : '') : '—') + '</td><td class="b">' + barra(p) + '</td></tr>').join('') +
      '</table><p class="cs-nota">Semelhança = distância do perfil na ficha da posição (percentis, com os pesos) e no físico quando os dois têm rastreio; 100 = perfil igual. Só entram os mercados alcançáveis (Série B, ligas sul-americanas, brasileiros e sul-americanos em ligas de fora ao alcance), nota ≥ 55, sem vetados, sem valor acima de € 2 MM e com o piso de velocidade. Clique para abrir.</p></div>';
  }

  function ficha(j) {
    const v = veredito(j), pref = D.pref[SET[j.p]] || [];
    let h = '<div class="cs-cab"><div><h3>' + esc(j.n) + ' <span class="cs-sel ' + v.cls + '">' + v.nivel + '</span></h3>' +
      '<p>' + esc(j.c) + ' · ' + esc(j.l) + ' · ' + esc(POS[j.p] || j.p) + ' · ' + (j.i != null ? j.i + ' anos' : '') + ' · ' + num(j.min, 0) + ' min · contrato ' + dt(j.ct) +
      (j.val ? ' · € ' + num(j.val / 1e6, 1) + ' MM' : '') + '</p></div>' +
      '<div class="cs-notas"><div><small>Nota</small><b>' + (j.nota == null ? '—' : j.nota) + '</b></div><div><small>Aderência' + (j.m !== 'Série B' ? ' (convertida)' : '') + '</small><b>' + (j.adc == null ? '—' : j.adc) + '</b></div><div><small>Nível</small><b>' + (j.niv == null ? '—' : j.niv) + '</b></div>' +
      (j.dez ? '<div><small>Os meus dez</small><b>' + j.dez.ordem + 'º</b></div>' : '') + '</div></div>';
    h += '<div class="cs-cols"><div class="cs-bloco"><h4>Veredito</h4><ul>' +
      v.pontos.map(x => '<li class="ok">' + esc(x) + '</li>').join('') + v.contra.map(x => '<li class="nao">' + esc(x) + '</li>').join('') + v.vazios.map(x => '<li class="sem">' + esc(x) + '</li>').join('') + '</ul>' +
      '<p class="cs-nota">O que a posição pede: ' + esc(PEDE[j.p] || '') + '.</p></div>';
    h += '<div class="cs-bloco"><h4>Técnico — ficha da posição (percentil na liga)</h4><table>' + j.ficha.map(f => '<tr><td>' + esc(f[0]) + '<small> peso ' + f[2] + '</small></td><td class="b">' + barra(f[1]) + '</td></tr>').join('') + '</table>' +
      (j.m !== 'Série B' ? '<p class="cs-nota">Percentil na liga de origem (' + j.ad + '); na conta da B vale ' + j.adc + '.</p>' : '') + '</div>';
    h += '<div class="cs-bloco"><h4>Físico</h4>';
    if (j.p === 'GOL') h += '<p class="cs-nota">Goleiro não tem rastreio.</p>';
    else if (j.psv == null) h += '<p class="cs-nota">Sem rastreio SkillCorner' + (j.sofa && j.sofa.vmax ? '; velocidade máxima Sofascore 2026: ' + num(j.sofa.vmax, 1) + ' km/h (pico de um jogo, r 0,33 com o PSV — só abaixo de 32 é alerta).' : '.') + '</p>';
    else h += '<table><tr><td>PSV-99</td><td class="b"><b>' + num(j.psv, 1) + ' km/h</b> ' + (j.psv >= D.regua.psv ? '<span class="cs-ok">≥ 27 ✓</span>' : '<span class="cs-nao">abaixo do piso</span>') + '</td></tr>' +
      '<tr><td>Sprints/90</td><td class="b">' + num(j.spr, 1) + '</td></tr><tr><td>Alta intensidade/90</td><td class="b">' + num(j.hi, 1) + '</td></tr><tr><td>Arrancadas/90</td><td class="b">' + num(j.expl, 2) + '</td></tr>' +
      '<tr><td>Corridas para a área/30 min</td><td class="b">' + num(j.area, 1) + (j.area_p != null ? ' <small>P' + j.area_p + ' na posição</small>' : '') + '</td></tr>' +
      '<tr><td>Tipo físico</td><td class="b">' + (j.tipo ? '<b>' + esc(j.tipo) + '</b> ' + (j.tpref ? '<span class="cs-ok">de quem sobe ✓</span>' : '<span class="cs-nao">quem sobe usa ' + esc(pref.join(' / ')) + '</span>') : '—') + '</td></tr></table>';
    if (j.pa) h += '<p class="cs-nota">Patamar de Série A (B13): técnico ' + (j.pa.tec == null ? '—' : j.pa.tec) + ' · físico ' + (j.pa.fis == null ? '—' : j.pa.fis) + ' (percentil dentro da A).</p>';
    h += '</div>';
    if (j.bp || j.sofa) {
      h += '<div class="cs-bloco"><h4>Bola parada e Sofascore</h4><table>';
      if (j.bp) { if (j.bp.cobrador != null) h += '<tr><td>Índice de cobrador</td><td class="b">' + barra(j.bp.cobrador) + '</td></tr>'; if (j.bp.finalizador != null) h += '<tr><td>Índice de finalizador aéreo</td><td class="b">' + barra(j.bp.finalizador) + '</td></tr>'; }
      if (j.sofa) h += '<tr><td>Nota Sofascore 2026</td><td class="b"><b>' + num(j.sofa.nota, 2) + '</b> <small>' + j.sofa.tit + ' titularidades em ' + j.sofa.jogos + ' jogos</small></td></tr><tr><td>xG+xA/90 (Sofascore)</td><td class="b">' + num(j.sofa.xgxa, 2) + '</td></tr>';
      h += '</table><p class="cs-nota">A nota Sofascore não repete de um ano para o outro (r 0,36): descreve, não prevê.</p></div>';
    }
    h += '</div>';
    h += blocoSimilares(j);
    return h;
  }

  function cartao(pos) {
    const q = st.busca[pos] || '', idx = st.sel[pos], j = idx != null ? D.jogadores[idx] : null;
    let h = '<div class="cs-slot' + (st.aberto === pos ? ' on' : '') + '" data-pos="' + pos + '"><div class="cs-slot-t"><b>' + pos + '</b><span>' + esc(POS[pos]) + '</span>' +
      (j ? '<button class="cs-x" data-limpa="' + pos + '" title="limpar">×</button>' : '') + '</div>';
    if (j) {
      const v = veredito(j);
      h += '<button class="cs-slot-j" data-abre="' + pos + '"><b>' + esc(j.n) + '</b><span>' + esc(j.c) + ' · ' + esc(j.l) + (j.i != null ? ' · ' + j.i : '') + '</span>' +
        '<em class="' + v.cls + '">' + v.nivel + '</em>' +
        '<small>nota <b>' + (j.nota == null ? '—' : j.nota) + '</b> · ader. ' + (j.adc == null ? '—' : j.adc) + ' · nível ' + (j.niv == null ? '—' : j.niv) +
        (j.p !== 'GOL' ? ' · PSV ' + (j.psv == null ? '—' : num(j.psv, 1)) : '') + (j.tipo ? ' · ' + esc(j.tipo) + (j.tpref ? ' ✓' : '') : '') + '</small>' +
        (j.p !== pos ? '<small class="cs-aviso">registrado como ' + j.p + ': a ficha é de ' + j.p + '</small>' : '') + '</button>';
    }
    h += '<input class="cs-busca" data-pos="' + pos + '" placeholder="' + (j ? 'trocar…' : 'nome ou clube…') + '" value="' + esc(q) + '">';
    const res = q.length >= 2 ? procurar(q, pos) : [];
    if (q.length >= 2 && !res.length) h += '<p class="cs-nota">Ninguém com esse nome.</p>';
    if (res.length && (!j || semAc(q) !== semAc(j.n))) h += '<div class="cs-lista">' + res.map(r => { const v = veredito(r); return '<button class="cs-item" data-pos="' + pos + '" data-i="' + D.jogadores.indexOf(r) + '"><b>' + esc(r.n) + '</b><span>' + esc(r.c) + ' · ' + esc(r.l) + ' · ' + r.p + (r.i != null ? ' · ' + r.i : '') + '</span><em class="' + v.cls + '">' + v.nivel + '</em></button>'; }).join('') + '</div>';
    return h + '</div>';
  }

  function render(foco) {
    const alvo = document.getElementById('csCorpo'); if (!alvo) return;
    let h = '<div class="cs-topo"><h2>Consulta de jogador</h2><p>Um campo por posição: digite nome ou clube e escolha. O estudo diz se o jogador adere ao modelo que rende na Série B (técnico + físico), onde está nas listas e o que falta conferir. ' +
      D.n.toLocaleString('pt-BR') + ' jogadores com ≥ 900 min (Wyscout ago/26, 66 ligas + Série B 2026). Clique no nome para abrir a ficha completa.</p></div>';
    h += '<div class="cs-grade">' + ORDEM.map(cartao).join('') + '</div>';
    const ab = st.aberto != null && st.sel[st.aberto] != null ? D.jogadores[st.sel[st.aberto]] : null;
    if (ab) h += '<div class="cs-ficha">' + ficha(ab) + '</div>';
    else h += '<div class="cs-legenda"><h4>Como ler</h4><ul><li><b>Ideal</b>: entre os 3 primeiros de "Os meus dez" na posição.</li><li><b>Aderente</b>: nota ≥ 65 (aderência ao modelo que rende na B + nível do ranking) e piso de velocidade ok, ou já está em "Os meus dez".</li><li><b>Parcial</b>: nota 55–64.</li><li><b>Não aderente</b>: nota abaixo de 55 ou abaixo do piso de 27 km/h.</li><li><b>Fora</b>: vetado pelo clube ou acima de € 2 MM.</li></ul><p class="cs-nota">Tudo é por posição: ficha, percentis, tipo físico e ordem de "Os meus dez" são os da posição em que o jogador está registrado no Wyscout. Aderência de quem vem de fora já convertida pela reta de liga (B11); bola parada do B3; patamar de A do B13; Sofascore do B14. A nota ordena; minutagem elimina; vídeo decide.</p></div>';
    alvo.innerHTML = h;
    alvo.querySelectorAll('.cs-busca').forEach(bu => bu.oninput = () => {
      const pos = bu.dataset.pos; st.busca[pos] = bu.value; const p = bu.selectionStart;
      const r = procurar(bu.value, pos); if (r.length === 1) { st.sel[pos] = D.jogadores.indexOf(r[0]); st.aberto = pos; }
      gravar('csEstado', st); render(pos);
      const n = document.querySelector('#csCorpo .cs-busca[data-pos="' + pos + '"]'); if (n) { n.focus(); n.setSelectionRange(p, p); }
    });
    alvo.querySelectorAll('.cs-item').forEach(b => b.onclick = () => { const pos = b.dataset.pos; st.sel[pos] = +b.dataset.i; st.busca[pos] = D.jogadores[+b.dataset.i].n; st.aberto = pos; gravar('csEstado', st); render(); });
    alvo.querySelectorAll('[data-abre]').forEach(b => b.onclick = () => { st.aberto = b.dataset.abre; gravar('csEstado', st); render(); document.querySelector('#csCorpo .cs-ficha') && document.querySelector('#csCorpo .cs-ficha').scrollIntoView({ block: 'start', behavior: 'smooth' }); });
    alvo.querySelectorAll('.cs-sim-l').forEach(tr => tr.onclick = () => window.csJanela(tr.dataset.n, tr.dataset.c));
    alvo.querySelectorAll('[data-limpa]').forEach(b => b.onclick = () => { const pos = b.dataset.limpa; delete st.sel[pos]; st.busca[pos] = ''; if (st.aberto === pos) st.aberto = null; gravar('csEstado', st); render(); });
  }

  function ligar() {
    const bt = document.querySelector('.aba[data-aba="consulta"]');
    const pg = document.getElementById('pgConsulta');
    if (!bt || !pg) return;
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on) render(); };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  /* ficha em janela, para outras abas (Estudo V2): clique no nome de um jogador */
  const achar = (nome, clube) => {
    const n = semAc(nome), c = semAc(clube || '');
    let r = D.jogadores.filter(j => semAc(j.n) === n);
    if (c && r.length > 1) { const rc = r.filter(j => semAc(j.c) === c || semAc(j.c).includes(c) || c.includes(semAc(j.c))); if (rc.length) r = rc; }
    return r.sort((a, b) => (a.m === 'Série B' ? 0 : 1) - (b.m === 'Série B' ? 0 : 1) || (b.min || 0) - (a.min || 0))[0] || null;
  };
  window.csExiste = (nome, clube) => !!achar(nome, clube);
  window.csJanela = (nome, clube) => {
    const j = achar(nome, clube); if (!j) return false;
    let m = document.getElementById('csModal');
    if (!m) { m = document.createElement('div'); m.id = 'csModal'; m.className = 'cs-esc cs-modal'; document.body.appendChild(m); }
    m.innerHTML = '<div class="cs-modal-fundo"></div><div class="cs-modal-caixa"><button class="cs-modal-x" title="fechar">×</button>' +
      '<div class="cs-ficha">' + ficha(j) + '</div><p class="cs-nota">Abrir na aba <a href="#" class="cs-modal-ir">Consulta de jogador</a> para comparar com outros.</p></div>';
    const fechar = () => { m.remove(); document.removeEventListener('keydown', esc_); };
    const esc_ = e => { if (e.key === 'Escape') fechar(); };
    m.querySelector('.cs-modal-fundo').onclick = fechar; m.querySelector('.cs-modal-x').onclick = fechar; document.addEventListener('keydown', esc_);
    m.querySelectorAll('.cs-sim-l').forEach(tr => tr.onclick = () => window.csJanela(tr.dataset.n, tr.dataset.c));
    m.querySelector('.cs-modal-ir').onclick = e => { e.preventDefault(); fechar(); const p = j.p; st.busca[p] = j.n; st.sel[p] = D.jogadores.indexOf(j); st.aberto = p; gravar('csEstado', st); const bt = document.querySelector('.aba[data-aba="consulta"]'); if (bt) bt.click(); render(); };
    return true;
  };
  window.csConsultar = (nome, pos) => { const r = procurar(nome, pos || 'CA'); if (!r.length) return; const p = pos || r[0].p; st.busca[p] = nome; st.sel[p] = D.jogadores.indexOf(r[0]); st.aberto = p; render(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
