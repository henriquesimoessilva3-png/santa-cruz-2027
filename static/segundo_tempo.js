/* 30/10/2026 — Estudo › 2º tempo: quem mantém o físico do 1º tempo no 2º (pedido do Henrique: "um perfil elite,
   o cara que consegue manter no segundo tempo"). Dado: static/segundo_tempo_dados.js, gerado por
   Santa Cruz V2/scripts/b28_segundo_tempo.py (SkillCorner, 1º × 2º tempo, só jogos completos).
   - window.segTempoDe(j): a nota do jogador (azul/verde/amarelo/vermelho) pela id do SkillCorner (static/sc_ids.json)
   - window.segTempoQuadrado(j): o 5º quadradinho do painel do card do campograma
   - window.segTempoHtml(j): o bloco da ficha, logo abaixo do físico
   - a página Estudo › 2º tempo (aba auxiliar "vnsegundo", seção #pgVnSegundo) */
(function () {
  'use strict';
  const D = window.SEGUNDO_TEMPO; if (!D) return;
  const NOTAS = ['azul', 'verde', 'amarelo', 'vermelho'];
  const NOME = { azul: 'Elite', verde: 'Mantém', amarelo: 'Cai um pouco', vermelho: 'Cai muito' };
  const DESC = {
    azul: 'mantém a intensidade do 1º tempo no 2º entre os 25% melhores da posição e, no 2º tempo, ainda corre em alta intensidade acima da mediana da posição',
    verde: 'mantém melhor que a metade dos jogadores da posição',
    amarelo: 'cai mais que a metade da posição, mas não está entre os 25% que mais caem',
    vermelho: 'está entre os 25% da posição que mais perdem intensidade no 2º tempo' };
  let IDS = null;
  fetch('static/sc_ids.json' + (window.__verDados ? '?v=' + window.__verDados : '')).then(r => (r.ok ? r.json() : null)).then(m => { IDS = m || {}; }).catch(() => { IDS = {}; });
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pc = v => (v == null ? '—' : Math.round(v * 100) + '%');
  const n1 = v => (v == null ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

  function segTempoDe(j) {
    if (!j || j.p === 'GOL') return null;
    let id = j.sc_id || null;
    if (!id && IDS && typeof primaryKey === 'function') id = IDS[primaryKey(j)];
    if (!id && D.chave && typeof primaryKey === 'function') id = D.chave[primaryKey(j)];
    const r = id != null ? D.jog[id] : null; if (!r) return null;
    const c = NOTAS[r[0]];
    return { c, nome: NOME[c], manut: r[1], hi: r[2], dist: r[3], n: r[4], vol: r[5], grupo: D.grupos[r[6]], h2: r[7],
      txt: '2º tempo: ' + NOME[c] + ' — mantém ' + pc(r[1]) + ' da intensidade do 1º tempo (alta intensidade ' + pc(r[2]) + ', distância ' + pc(r[3]) + ') em ' + r[4] + ' jogos completos. ' +
        'Nota dentro de ' + D.grupos[r[6]] + ': ' + DESC[c] + '. Fonte: SkillCorner 1º × 2º tempo, desde 01/01/2025.' };
  }
  window.segTempoDe = segTempoDe;
  window.segTempoQuadrado = function (j) {
    const s = segTempoDe(j);
    return '<span class="jq jq-2t' + (s ? ' t2-' + s.c : '') + '" title="' + esc(s ? s.txt : '2º tempo: sem jogos completos rastreados (mínimo ' + D.min_jogos + ')') + '">' + (s ? '2T' : '<i class="jq-vaz"></i>') + '</span>';
  };
  window.segTempoHtml = function (j) {
    const s = segTempoDe(j); if (!s) return '';
    const R = D.regua[s.grupo] || {};
    const barra = (v, marca) => '<span class="t2-barra"><i style="width:' + Math.max(0, Math.min(100, (v - 0.7) / 0.45 * 100)).toFixed(1) + '%"></i>' +
      (marca != null ? '<span class="t2-marca" style="left:' + Math.max(0, Math.min(100, (marca - 0.7) / 0.45 * 100)).toFixed(1) + '%"></span>' : '') + '</span>';
    return '<div class="fi-grupo t2-ficha"><h4 class="sf-gh g-fis">2º tempo <span class="t2-chip t2-' + s.c + '">' + s.nome + '</span></h4>' +
      '<div class="t2-l"><span>Manutenção</span><b>' + pc(s.manut) + '</b>' + '<small>mediana de ' + esc(s.grupo) + ' ' + pc(R.p50) + '</small></div>' +
      '<div class="t2-l"><span>Alta intensidade</span><b>' + pc(s.hi) + '</b>' + '<small>2º ÷ 1º tempo, por minuto</small></div>' +
      '<div class="t2-l"><span>Distância</span><b>' + pc(s.dist) + '</b>' + '<small>' + s.n + ' jogos completos</small></div>' +
      '<div class="fi-src">' + esc(DESC[s.c][0].toUpperCase() + DESC[s.c].slice(1)) + '. Alta intensidade no 2º tempo: <b>' + n1(s.h2) + '</b> m/min (mediana da posição ' + n1(R.vol_med) + ').</div></div>';
  };

  /* ---------- página do estudo ---------- */
  let feito = false, filtro = 'todos';
  function montar() {
    const pg = document.getElementById('pgVnSegundo'); if (!pg || feito) return; feito = true;
    const E = D.estudo;
    const chip = c => '<span class="t2-chip t2-' + c + '">' + NOME[c] + '</span>';
    const tPos = '<table class="t2-tab"><thead><tr><th>Posição</th><th>Jogadores</th><th>Mantém (mediana)</th><th>Queda alta int.</th><th>Queda distância</th><th>Queda sprints</th>' +
      NOTAS.map(c => '<th>' + chip(c) + '</th>').join('') + '</tr></thead><tbody>' +
      E.pos.map(p => '<tr><th>' + esc(p.grupo) + '</th><td class="n"><b>' + p.jogadores.toLocaleString('pt-BR') + '</b></td><td class="n"><b>' + pc(p.manut_mediana) + '</b><small> P25 ' + pc(p.p25) + ' · P75 ' + pc(p.p75) + '</small></td>' +
        '<td class="n">−' + pc(p.queda_hi) + '</td><td class="n">−' + pc(p.queda_dist) + '</td><td class="n">−' + pc(p.queda_spr) + '</td>' +
        NOTAS.map(c => '<td class="n"><b>' + p[c] + '</b></td>').join('') + '</tr>').join('') + '</tbody></table>';
    const fx = E.faixas || [];
    const tFx = fx.length ? '<table class="t2-tab t2-fx"><thead><tr><th>Série B ' + esc(E.serieb_anos) + '</th><th>Times</th><th>Manutenção do time</th><th>Alta intensidade</th><th>Distância</th></tr></thead><tbody>' +
      fx.map(f => '<tr><th>' + esc(f.faixa) + '</th><td class="n">' + f.times + '</td><td class="n"><b>' + pc(f.manut) + '</b></td><td class="n">' + pc(f.ret_hi) + '</td><td class="n">' + pc(f.ret_dist) + '</td></tr>').join('') + '</tbody></table>' : '';
    const tLig = '<table class="t2-tab t2-lig"><thead><tr><th>Liga (edição)</th><th>Jogadores</th><th>Mantém</th><th>Alta int./min</th></tr></thead><tbody>' +
      E.ligas.map(l => '<tr><td>' + esc(l.edn) + '</td><td class="n">' + l.jog + '</td><td class="n"><b>' + pc(l.manut) + '</b></td><td class="n">' + n1(l.vol) + '</td></tr>').join('') + '</tbody></table>';
    pg.innerHTML = '<div class="esv-leitura t2">' +
      '<h2 class="vnf-tit">2º tempo — quem mantém o físico</h2>' +
      '<div class="vnf-explica"><p><b>A pergunta.</b> Na Europa trabalham com atletas de VO2 70 ou mais. O SkillCorner não mede VO2 — isso só vem da fisiologia —, mas mede o que o jogador faz em campo no <b>1º</b> e no <b>2º tempo</b>. ' +
      'Quem consegue repetir no 2º tempo a intensidade do 1º é o sinal de campo que acompanha a capacidade aeróbica alta.</p>' +
      '<p><b>Como medimos.</b> Só entram os jogos em que o jogador fez <b>os dois tempos inteiros</b> (40 minutos ou mais em cada um) — quem entra ou sai no meio deixa a conta torta. ' +
      'Para cada tempo, o ritmo por minuto de <b>alta intensidade</b> (acima de 20 km/h) e de <b>distância</b>. A <b>manutenção</b> é o ritmo do 2º tempo dividido pelo do 1º (100% = manteve igual), média dos dois indicadores, somando todos os jogos completos. ' +
      'Mínimo de <b>' + D.min_jogos + '</b> jogos completos. A nota é dada dentro da posição, contra todos os jogadores da base.</p></div>' +
      '<div class="vnf-duas"><div class="vnf-regra">' + NOTAS.map(c => '<div>' + chip(c) + '<span>' + DESC[c][0].toUpperCase() + DESC[c].slice(1) + '.</span></div>').join('') +
      '<p>Dica: o jogo influencia (quem está ganhando recua e corre menos no 2º tempo); por isso a nota usa a soma de todos os jogos completos e pede o mínimo de jogos.</p></div>' +
      '<div class="vnf-escopo"><b>De onde vem.</b> <span>SkillCorner, 1º × 2º tempo (o mesmo corte da ferramenta), <b>' + E.eds + '</b> competições liberadas no nosso acesso, jogos desde <b>01/01/2025</b>' + (E.serieb_anos ? ' (Série B também de ' + esc(E.serieb_anos) + ')' : '') + '.</span> ' +
      '<span><b>' + E.jogos.toLocaleString('pt-BR') + '</b> jogos completos (jogador × jogo) de <b>' + E.jogadores.toLocaleString('pt-BR') + '</b> jogadores com nota.</span> ' +
      '<span>A API não divide de 15 em 15 minutos — só em 1º e 2º tempo.</span> <span>Gerado em ' + esc(E.gerado) + '.</span></div></div>' +
      '<h3>Quanto cada posição cai do 1º para o 2º tempo</h3>' + tPos +
      (tFx ? '<h3>Quem sobe mantém mais? Série B por faixa da tabela</h3>' + tFx + '<p class="vnf-nota">' + esc(E.faixas_txt || '') + '</p>' : '') +
      ((E.titulares || []).length ? '<table class="t2-tab t2-fx"><thead><tr><th>Titulares da Série B ' + esc(E.serieb_anos) + '<small> (10+ jogos completos)</small></th><th>Jogadores</th><th>Mantém</th><th>Alta int./min 1º tempo</th><th>Alta int./min 2º tempo</th></tr></thead><tbody>' +
        E.titulares.map(f => '<tr><th>' + esc(f.faixa) + '</th><td class="n">' + f.jogadores + '</td><td class="n">' + pc(f.manut) + '</td><td class="n">' + n1(f.h1) + '</td><td class="n"><b>' + n1(f.h2) + '</b></td></tr>').join('') + '</tbody></table>' +
        '<div class="vnf-explica"><p><b>O que isso diz.</b> Na Série B, quem sobe <b>não</b> cai menos em porcentagem — cai até um pouco mais (o time que ganha administra o placar). O que separa é o <b>número do 2º tempo</b>: os titulares dos times que subiram fazem <b>' + n1((E.titulares.find(f => f.faixa === 'Subiram') || {}).h2) + '</b> m/min de alta intensidade no 2º tempo, contra <b>' + n1((E.titulares.find(f => f.faixa === 'Caíram') || {}).h2) + '</b> de quem caiu. Por isso a nota azul pede as duas coisas: manter <i>e</i> ter intensidade alta no 2º tempo.</p></div>' : '') +
      '<h3>Elite do 2º tempo, posição a posição</h3><div class="vnf-chips" id="t2Chips">' +
      [['todos', 'Todos'], ['b', 'Série B'], ['sa', 'América do Sul'], ['br', 'Brasil (A e B)']].map(m => '<button type="button" data-f="' + m[0] + '"' + (m[0] === filtro ? ' class="on"' : '') + '>' + m[1] + '</button>').join('') +
      '</div><div id="t2Elite"></div>' +
      '<details class="vnf-mais"><summary>Manutenção por liga</summary>' + tLig + '</details></div>';
    elite();
    pg.querySelectorAll('#t2Chips [data-f]').forEach(b => b.onclick = () => { filtro = b.dataset.f; pg.querySelectorAll('#t2Chips button').forEach(x => x.classList.toggle('on', x === b)); elite(); });
  }
  function noFiltro(l) {
    if (filtro === 'todos') return true;
    if (filtro === 'b') return /Serie B|Série B/.test(l) && /BRA/.test(l);
    if (filtro === 'br') return /^BRA/.test(l);
    return /^(BRA|ARG|COL|URU|CHI|ECU|PAR|PER|BOL|VEN)|Libertadores|Sudamericana/.test(l);
  }
  function elite() {
    const el = document.getElementById('t2Elite'); if (!el) return;
    el.innerHTML = '<div class="t2-grade">' + D.grupos.map(g => {
      const ls = (D.estudo.elite[g] || []).filter(r => noFiltro(r[2])).slice(0, 15);
      return '<div class="t2-bloco"><h4>' + esc(g) + '</h4>' + (ls.length ? '<table><thead><tr><th>Jogador</th><th>Time · liga</th><th>Mantém</th><th>Jogos</th></tr></thead><tbody>' +
        ls.map(r => '<tr><td><b>' + esc(r[0]) + '</b></td><td><small>' + esc(r[1]) + ' · ' + esc(r[2]) + '</small></td><td class="n"><b>' + pc(r[3]) + '</b></td><td class="n">' + r[5] + '</td></tr>').join('') + '</tbody></table>' : '<p class="vnf-nota">ninguém nesse recorte</p>') + '</div>';
    }).join('') + '</div><p class="vnf-nota">Só a nota azul (elite), ordenada pela manutenção; até 15 por posição. Time e liga do jogo completo mais recente.</p>';
  }
  function ligar() {
    const bt = document.querySelector('nav.abas .aba[data-aba="vnsegundo"]'), pg = document.getElementById('pgVnSegundo');
    if (!bt || !pg) return;
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on) montar(); };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
