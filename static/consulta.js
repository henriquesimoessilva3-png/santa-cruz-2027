/* Aba "Consulta de jogador" — digita um nome e o app diz se ele adere ao modelo que rende na
   Série B (técnico + físico) e onde ele está nas listas do estudo V2.
   Dado: static/consulta_dados.js (gerar_consulta_js.py): 15 mil jogadores com ≥ 900 min nas 66
   ligas do Wyscout (ago/26) + Série B 2026, físico SkillCorner/Portal, tipo físico (B8/B10), bola
   parada (B3), patamar de A (B14), Sofascore 2026 (B15), "Os meus dez", vetados e teto de valor.
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
  let busca = '', sel = null;
  const IDX = D.jogadores.map((j, i) => ({ i, k: semAc(j.n) + ' ' + semAc(j.c) }));

  function procurar(q) {
    const t = semAc(q); if (t.length < 2) return [];
    const partes = t.split(' ');
    return IDX.filter(x => partes.every(p => x.k.includes(p))).map(x => D.jogadores[x.i])
      .sort((a, b) => (a.m === 'Série B' ? 0 : 1) - (b.m === 'Série B' ? 0 : 1) || (b.nota || 0) - (a.nota || 0)).slice(0, 40);
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
    if (j.bp) { const b = []; if (j.bp.cobrador >= 85) b.push('cobrador ' + j.bp.cobrador); if (j.bp.finalizador >= 85) b.push('finalizador aéreo ' + j.bp.finalizador); if (b.length) pontos.push('especialista de bola parada (' + b.join(', ') + ')'); }
    if (j.m !== 'Série B') vazios.push('vem de fora: aderência convertida pela reta de liga (p90 na origem → 58 na B, B12); vídeo obrigatório');
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
      '<tr><td>Tipo físico</td><td class="b">' + (j.tipo ? '<b>' + esc(j.tipo) + '</b> ' + (j.tpref ? '<span class="cs-ok">de quem sobe ✓</span>' : '<span class="cs-nao">quem sobe usa ' + esc(pref.join(' / ')) + '</span>') : '—') + '</td></tr></table>';
    if (j.pa) h += '<p class="cs-nota">Patamar de Série A (B14): técnico ' + (j.pa.tec == null ? '—' : j.pa.tec) + ' · físico ' + (j.pa.fis == null ? '—' : j.pa.fis) + ' (percentil dentro da A).</p>';
    h += '</div>';
    if (j.bp || j.sofa) {
      h += '<div class="cs-bloco"><h4>Bola parada e Sofascore</h4><table>';
      if (j.bp) { if (j.bp.cobrador != null) h += '<tr><td>Índice de cobrador</td><td class="b">' + barra(j.bp.cobrador) + '</td></tr>'; if (j.bp.finalizador != null) h += '<tr><td>Índice de finalizador aéreo</td><td class="b">' + barra(j.bp.finalizador) + '</td></tr>'; }
      if (j.sofa) h += '<tr><td>Nota Sofascore 2026</td><td class="b"><b>' + num(j.sofa.nota, 2) + '</b> <small>' + j.sofa.tit + ' titularidades em ' + j.sofa.jogos + ' jogos</small></td></tr><tr><td>xG+xA/90 (Sofascore)</td><td class="b">' + num(j.sofa.xgxa, 2) + '</td></tr>';
      h += '</table><p class="cs-nota">A nota Sofascore não repete de um ano para o outro (r 0,36): descreve, não prevê.</p></div>';
    }
    h += '</div>';
    return h;
  }

  function render() {
    const alvo = document.getElementById('csCorpo'); if (!alvo) return;
    const res = procurar(busca);
    let h = '<div class="cs-topo"><h2>Consulta de jogador</h2><p>Digite o nome: o estudo diz se ele adere ao modelo que rende na Série B (técnico + físico), onde está nas listas e o que falta conferir. ' +
      D.n.toLocaleString('pt-BR') + ' jogadores com ≥ 900 min (Wyscout ago/26, 66 ligas + Série B 2026). Quem não aparece não tem minutagem ou não está nas ligas cobertas.</p>' +
      '<input class="cs-busca" placeholder="nome do jogador ou clube…" value="' + esc(busca) + '"></div>';
    if (busca.length >= 2 && !res.length) h += '<p class="cs-nota">Nenhum jogador com esse nome na base.</p>';
    if (res.length) {
      h += '<div class="cs-lista">' + res.map((j, i) => { const v = veredito(j); return '<button class="cs-item' + (sel === j ? ' on' : '') + '" data-i="' + i + '"><b>' + esc(j.n) + '</b> <span>' + esc(j.c) + ' · ' + esc(j.l) + ' · ' + j.p + (j.i != null ? ' · ' + j.i : '') + '</span><em class="' + v.cls + '">' + v.nivel + '</em></button>'; }).join('') + '</div>';
    }
    if (sel) h += '<div class="cs-ficha">' + ficha(sel) + '</div>';
    else h += '<div class="cs-legenda"><h4>Como ler</h4><ul><li><b>Ideal</b>: entre os 3 primeiros de "Os meus dez" na posição.</li><li><b>Aderente</b>: nota ≥ 65 (aderência ao modelo que rende na B + nível do ranking) e piso de velocidade ok, ou já está em "Os meus dez".</li><li><b>Parcial</b>: nota 55–64.</li><li><b>Não aderente</b>: nota abaixo de 55 ou abaixo do piso de 27 km/h.</li><li><b>Fora</b>: vetado pelo clube ou acima de € 2 MM.</li></ul><p class="cs-nota">Aderência de quem vem de fora já convertida pela reta de liga (B12). Tipo físico do B8/B10; bola parada do B3; patamar de A do B14; Sofascore do B15. A nota ordena; minutagem elimina; vídeo decide.</p></div>';
    alvo.innerHTML = h;
    const bu = alvo.querySelector('.cs-busca');
    bu.oninput = () => { busca = bu.value; const p = bu.selectionStart; const r = procurar(busca); sel = r.length === 1 ? r[0] : (r.includes(sel) ? sel : null); render(); const n = document.querySelector('#csCorpo .cs-busca'); if (n) { n.focus(); n.setSelectionRange(p, p); } };
    alvo.querySelectorAll('.cs-item').forEach(b => b.onclick = () => { sel = res[+b.dataset.i]; render(); });
  }

  function ligar() {
    const bt = document.querySelector('.aba[data-aba="consulta"]');
    const pg = document.getElementById('pgConsulta');
    if (!bt || !pg) return;
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on) { render(); const n = document.querySelector('#csCorpo .cs-busca'); if (n && !busca) n.focus(); } };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  window.csConsultar = nome => { busca = nome; const r = procurar(nome); sel = r[0] || null; render(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
