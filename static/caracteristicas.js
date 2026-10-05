/* Aba "Característica por posição" — o que separa o titular de quem sobe do de quem cai na Série B,
   posição a posição. Dado: static/caracteristicas_dados.js (gerar_caracteristicas_js.py).
   Arquivo próprio, sem encostar no app.js: um observador acompanha o botão da aba e mostra ou
   esconde a página, como nas abas Bola parada · jogadores e Estudo Série B V2. */
(function () {
  'use strict';
  const D = window.CARACTERISTICAS;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (x, d) => x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const SIG = { GOL: 'GK', LD: 'RB', ZD: 'RCB', ZE: 'LCB', LE: 'LB', VOL: 'DM', MED: 'CM', MEI: 'AM', ED: 'RW', EE: 'LW', CA: 'CF' };
  let pos = 'VOL';
  try { const p = localStorage.getItem('carPos'); if (p && D && D.posicoes[p]) pos = p; } catch (e) {}

  const val = (l, k) => l[k] == null ? '—' : num(l[k], l.casas) + (l.pct ? '%' : '');
  /* separação em desvios-padrão: ≥ 0,5 separa muito; 0,3–0,5 separa; < 0,3 é ruído provável com ~25 jogadores por faixa */
  const forca = d => d == null ? '' : Math.abs(d) >= 0.5 ? 'car-forte' : Math.abs(d) >= 0.3 ? 'car-media' : 'car-fraca';
  function barra(d) {
    if (d == null) return '<span class="car-sem">—</span>';
    const w = Math.min(100, Math.abs(d) / 1.0 * 100), lado = d >= 0 ? 'car-mais' : 'car-menos';
    return '<span class="car-bar ' + lado + ' ' + forca(d) + '"><i style="width:' + w.toFixed(0) + '%"></i></span>' +
      '<b class="car-d ' + forca(d) + '">' + (d > 0 ? '+' : '') + num(d, 2) + '</b>';
  }
  function tabela(b) {
    const ls = b.linhas.slice().sort((a, c) => (c.d == null ? -9 : c.d) - (a.d == null ? -9 : a.d));
    return '<div class="car-bloco"><h3>' + esc(b.tit) + ' <small>' + esc(b.fonte) +
      (b.n ? ' · ' + (b.n.Sobe || 0) + ' sobem, ' + (b.n.Meio || 0) + ' meio, ' + (b.n.Cai || 0) + ' caem' : '') + '</small></h3>' +
      '<table class="car-tab"><thead><tr><th>Indicador</th><th class="n">Sobe</th><th class="n">Meio</th><th class="n">Cai</th>' +
      '<th class="s" title="Média do z-score (dentro do ano) de quem sobe menos a de quem cai, em desvios-padrão. Positivo: quem sobe tem mais.">Separação (Sobe − Cai)</th></tr></thead><tbody>' +
      ls.map(l => '<tr class="' + forca(l.d) + '"><td>' + esc(l.rot) + (l.media ? ' *' : '') + '</td><td class="n car-sobe">' + val(l, 'sobe') + '</td><td class="n">' + val(l, 'meio') +
        '</td><td class="n">' + val(l, 'cai') + '</td><td class="s">' + barra(l.d) + '</td></tr>').join('') +
      '</tbody></table></div>';
  }
  function resumo(P) {
    const todas = []; P.blocos.forEach(b => b.linhas.forEach(l => { if (l.d != null) todas.push(Object.assign({ bloco: b.tit }, l)); }));
    const item = l => '<li><span>' + esc(l.rot) + '</span> <em>' + esc(l.bloco) + '</em><b>' + val(l, 'sobe') + '</b> contra <b>' + val(l, 'cai') +
      '</b> <i class="car-d ' + forca(l.d) + '">' + (l.d > 0 ? '+' : '') + num(l.d, 2) + '</i></li>';
    const mais = todas.filter(l => l.d >= 0.3).sort((a, b) => b.d - a.d).slice(0, 7);
    const menos = todas.filter(l => l.d <= -0.3).sort((a, b) => a.d - b.d).slice(0, 5);
    const nada = todas.filter(l => Math.abs(l.d) < 0.1).slice(0, 6);
    let h = '<div class="car-res"><div class="car-col"><h4>Quem sobe tem mais</h4>' +
      (mais.length ? '<ul>' + mais.map(item).join('') + '</ul>' : '<p class="car-vazio">Nenhum indicador separa com clareza (≥ 0,30).</p>') + '</div>' +
      '<div class="car-col"><h4>Quem sobe tem menos</h4>' +
      (menos.length ? '<ul>' + menos.map(item).join('') + '</ul>' : '<p class="car-vazio">Nada aparece claramente mais em quem cai (≤ −0,30).</p>') + '</div>' +
      '<div class="car-col"><h4>Não separa</h4>' +
      (nada.length ? '<ul class="car-nada">' + nada.map(l => '<li><span>' + esc(l.rot) + '</span><b>' + val(l, 'sobe') + '</b> contra <b>' + val(l, 'cai') + '</b></li>').join('') + '</ul>'
                   : '<p class="car-vazio">—</p>') + '</div></div>';
    return h;
  }
  function tipos(P) {
    const t = P.tipos; if (!t || !t.linhas.length) return '';
    const tot = k => t.linhas.reduce((s, l) => s + l[k], 0) || 1;
    const marca = tp => (t.clube === tp ? ' <span class="car-tag a">preferência do clube</span>' : t.pref.includes(tp) ? ' <span class="car-tag a">tipo de quem sobe (A)</span>' : t.cai.includes(tp) ? ' <span class="car-tag c">tipo de quem cai (C)</span>' : '');
    return '<div class="car-bloco"><h3>Tipo físico <small>SkillCorner · agrupamento do estudo (F2)</small></h3>' +
      '<table class="car-tab"><thead><tr><th>Tipo</th><th class="n">Sobe</th><th class="n">Meio</th><th class="n">Cai</th><th class="n">% dos que sobem</th><th class="n">% dos que caem</th><th class="n">Deste tipo, subiram</th></tr></thead><tbody>' +
      t.linhas.map(l => { const n = l.sobe + l.meio + l.cai || 1;
        return '<tr><td>' + esc(l.tipo) + marca(l.tipo) + '</td><td class="n car-sobe">' + l.sobe + '</td><td class="n">' + l.meio + '</td><td class="n">' + l.cai +
          '</td><td class="n"><b>' + num(l.sobe / tot('sobe') * 100, 0) + '%</b></td><td class="n"><b>' + num(l.cai / tot('cai') * 100, 0) + '%</b></td><td class="n"><b>' + num(l.sobe / n * 100, 0) + '%</b></td></tr>'; }).join('') +
      '</tbody></table></div>';
  }
  function render() {
    const alvo = document.getElementById('carCorpo'); if (!alvo) return;
    if (!D) { alvo.innerHTML = '<p class="car-vazio">Sem dado: rode gerar_caracteristicas_js.py.</p>'; return; }
    const P = D.posicoes[pos];
    const n = P.n || {};
    alvo.innerHTML =
      '<div class="car-topo"><h2>Característica por posição</h2>' +
      '<p>O que o titular de quem <b>sobe</b> faz diferente do de quem <b>cai</b> na Série B ' + D.anos[0] + '–' + D.anos[D.anos.length - 1] +
      ' (jogadores com ' + D.min + ' minutos ou mais). Os números são a mediana de cada faixa; nos indicadores raros (gols de volante, por exemplo), a média, marcada com *.</p></div>' +
      '<div class="car-chips">' + D.ordem.map(c => '<button class="car-chip' + (c === pos ? ' on' : '') + '" data-pos="' + c + '"><b>' + SIG[c] + '</b> ' + esc(D.posicoes[c].nome) + '</button>').join('') + '</div>' +
      '<div class="car-amostra"><span><b>' + (n.Sobe || 0) + '</b> em times que subiram</span><span><b>' + (n.Meio || 0) + '</b> no meio da tabela</span><span><b>' + (n.Cai || 0) + '</b> em times que caíram</span></div>' +
      resumo(P) + P.blocos.map(tabela).join('') + tipos(P) +
      '<div class="car-nota"><b>Como ler.</b> "Separação" é a diferença entre quem sobe e quem cai em desvios-padrão, calculada dentro de cada ano (o Wyscout mudou critérios no período). ' +
      'A partir de <b>0,50</b> a diferença é grande; entre <b>0,30</b> e <b>0,50</b> é moderada; abaixo de <b>0,30</b>, com cerca de 25 jogadores por faixa, é ruído provável. ' +
      'Parte da diferença em passe e ataque vem do time, e não do jogador: quem sobe tem mais a bola. Físico e idade dependem menos disso. ' +
      'Gerado em ' + esc(D.gerado_em) + '.</div>';
    alvo.querySelectorAll('.car-chip').forEach(b => { b.onclick = () => { pos = b.dataset.pos; try { localStorage.setItem('carPos', pos); } catch (e) {} render(); }; });
  }
  function ligar() {
    const bt = document.querySelector('.aba[data-aba="caracteristicas"]');
    const pg = document.getElementById('pgCaracteristicas');
    if (!bt || !pg) return;
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on) render(); };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
