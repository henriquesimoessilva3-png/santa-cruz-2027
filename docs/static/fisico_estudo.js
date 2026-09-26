/* Painel recolhível "Perfil físico por posição — estudo V2" no alto da aba Físico.
   Dado: static/fisico_estudo_dados.js (gerar_fisico_estudo_js.py, a partir de Santa Cruz V2/resultados b1 e b8).
   Cinco leituras por setor: sobe × meio × cai; titular dos times que rendem × demais; tipos físicos e o
   que cada um produz; ligações físico → técnico; destaques da Série B 2026. */
(function () {
  'use strict';
  const D = window.FISICO_ESTUDO;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v, d) => v == null || !isFinite(v) ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const ler = (k, p) => { try { const v = localStorage.getItem(k); return v == null ? p : v; } catch (e) { return p; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let setor = ler('fseSetor', 'Meia');

  function sobeCai(s) {
    const x = D.sobe[s]; if (!x) return '';
    const cel = (v, maior) => '<td class="n' + (maior ? ' fse-top' : '') + '">' + num(v, 0) + '</td>';
    return '<p class="fse-d">Percentil médio dos <b>titulares</b> de cada faixa da tabela (2022–2025), dentro da própria posição e temporada. ' +
      'Amostra pequena: ' + x.n.Cai + ' titulares de quem caiu, ' + x.n.Meio + ' do meio, ' + x.n.Sobe + ' de quem subiu — diferença abaixo de 10 pontos é ruído. ' +
      'Em destaque, a faixa mais alta quando ela passa as outras duas por 10 ou mais.</p>' +
      '<table class="fse-t"><thead><tr><th>Indicador</th><th class="n">Cai</th><th class="n">Meio</th><th class="n">Sobe</th><th class="n">Mediana (cai · meio · sobe)</th></tr></thead><tbody>' +
      x.linhas.map(l => {
        const v = [l[1], l[2], l[3]], mx = Math.max(...v.filter(a => a != null));
        const dest = v.map(a => a === mx && v.filter(b => b != null && b !== mx).every(b => mx - b >= 10));
        return '<tr><td>' + esc(l[0]) + '</td>' + cel(l[1], dest[0]) + cel(l[2], dest[1]) + cel(l[3], dest[2]) +
          '<td class="n fse-u">' + [l[4], l[5], l[6]].map(a => num(a, a > 100 ? 0 : 1)).join(' · ') + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  function referencia(s) {
    const f = D.faixas[s] || [];
    return '<p class="fse-d">Titulares dos times que renderam acima do dinheiro (quartil de cima) contra os demais titulares — ' +
      'é a régua da ficha física. P25–P75 é a faixa do titular de referência; a última coluna diz quanto a mediana dele difere da dos demais.</p>' +
      '<table class="fse-t"><thead><tr><th>Indicador</th><th class="n">Referência P25</th><th class="n">P50</th><th class="n">P75</th><th class="n">Demais (P50)</th><th class="n">Diferença</th></tr></thead><tbody>' +
      f.map(r => { const d = r[8]; const cls = d >= 20 ? ' fse-top' : d <= -15 ? ' fse-neg' : '';
        const cas = r[5] > 100 ? 0 : 2;
        return '<tr><td>' + esc(r[0]) + ' <span class="fse-u">' + esc(r[1]) + '</span></td><td class="n">' + num(r[4], cas) + '</td><td class="n"><b>' + num(r[5], cas) +
          '</b></td><td class="n">' + num(r[6], cas) + '</td><td class="n">' + num(r[7], cas) + '</td><td class="n' + cls + '">' + (d > 0 ? '+' : '') + num(d, 0) + '%</td></tr>'; }).join('') +
      '</tbody></table><p class="fse-nota">n de referência: ' + (f[0] ? f[0][2] : '—') + ' titulares; demais: ' + (f[0] ? f[0][3] : '—') + '.</p>';
  }

  function tipos(s) {
    const t = D.tipos[s]; if (!t) return '';
    const i = k => t.colunas.indexOf(k);
    const C = [['psv99', 'PSV-99', 1], ['sprint_count_p90', 'Sprints/90', 1], ['expl_accel_sprint_p90', 'Arrancadas/90', 2], ['distance_p90', 'Distância', 0],
      ['Duelos/90', 'Duelos/90', 1], ['Duelos defensivos ganhos, %', 'Duelos def. ganhos %', 0], ['Duelos aéreos ganhos, %', 'Aéreos ganhos %', 0],
      ['Dribles/90', 'Dribles/90', 2], ['Toques na área/90', 'Toques na área/90', 2], ['Acções atacantes com sucesso/90', 'Ações of. certas/90', 2], ['xgxa90', 'xG+xA/90', 2]];
    const L = t.linhas.slice().sort((a, b) => b[i('pct_sobe')] - a[i('pct_sobe')]);
    const r0 = L[0] || [];
    /* Subiu / Meio / Caiu = de cada 100 jogadores do setor naquela faixa, quantos sao do tipo (25/09).
       Destaque quando a faixa passa as outras duas por 15 pontos ou mais. */
    const faixa = (r, k) => { const v = ['pct_sobe', 'pct_meio', 'pct_cai'].map(x => r[i(x)]); const me = r[i(k)];
      const outros = v.filter(x => x !== me); const cls = outros.every(x => me - x >= 0.15) ? ' fse-top' : outros.every(x => x - me >= 0.15) ? ' fse-neg' : '';
      return '<td class="n' + cls + '">' + num(100 * me, 0) + '%</td>'; };
    return '<p class="fse-d">Os jogadores do setor (≥ 900 min, 2022–2025) separados em três tipos pelo perfil físico. <b>Subiu / Meio / Caiu</b>: de cada 100 jogadores ' +
      'do setor naquela faixa da tabela, quantos são de cada tipo (' + r0[i('n_sobe')] + ' em quem subiu, ' + r0[i('n_meio')] + ' no meio, ' + r0[i('n_cai')] +
      ' em quem caiu). <b>Referência</b>: parcela do tipo nos times que renderam acima do que o elenco custava (média ~27%). Diferença menor que ~15 pontos é ruído. <b>Concentra ×</b>: lê a linha — de todos os jogadores do tipo na liga, a fatia em quem subiu dividida pelo esperado (20%); 1,6 = 60% acima, 0,4 = quem sobe evita.</p>' +
      '<table class="fse-t"><thead><tr><th>Tipo</th><th class="n">Subiu</th><th class="n">Meio</th><th class="n">Caiu</th><th class="n">Referência</th><th class="n" title="de todos os jogadores do tipo na liga, a fatia que estava em quem subiu, dividida pelo esperado (20%): 1,6 = 60% acima">Concentra ×</th>' + C.map(c => '<th class="n">' + c[1] + '</th>').join('') + '</tr></thead><tbody>' +
      L.map(r => '<tr><td><b>' + esc(r[i('tipo')]) + '</b></td>' + faixa(r, 'pct_sobe') + faixa(r, 'pct_meio') + faixa(r, 'pct_cai') + '<td class="n">' +
        num(100 * r[i('referencia')], 0) + '%</td><td class="n">' + (r[i('conc_sobe')] >= 1.3 || r[i('conc_sobe')] <= 0.7 ? '<b>' + num(r[i('conc_sobe')], 1) + '</b>' : num(r[i('conc_sobe')], 1)) + '</td>' + C.map(c => '<td class="n">' + (c[0] === 'distance_p90' ? num(r[i(c[0])] / 1000, 1) + ' km' : num(r[i(c[0])], c[2])) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table>';
  }

  function ligacoes(s) {
    const L = D.ligacoes[s] || [];
    if (!L.length) return '<p class="fse-d">Nenhuma ligação forte no setor.</p>';
    return '<p class="fse-d">Correlação entre o indicador físico e o técnico no mesmo jogador (Série B 2022–2026, ≥ 900 min). ' +
      '0,3 já é ligação clara; 0,5 é forte. "A time igual" tira o efeito do clube (o que é do time sai) — se o número se mantém, é do jogador. ' +
      'Negativo: quem tem mais do físico tem menos do técnico.</p>' +
      '<table class="fse-t"><thead><tr><th>Físico</th><th>Técnico</th><th class="n">n</th><th>Ligação</th><th class="n">a time igual</th></tr></thead><tbody>' +
      L.map(r => { const w = Math.min(100, Math.abs(r[3]) * 125); return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td class="n">' + r[2] + '</td><td><span class="fse-bar' + (r[3] < 0 ? ' neg' : '') +
        '" style="width:' + w + 'px"></span> ' + num(r[3], 2) + '</td><td class="n">' + num(r[4], 2) + '</td></tr>'; }).join('') + '</tbody></table>';
  }

  function destaques(s) {
    const L = D.destaques[s] || []; if (!L.length) return '';
    const h = L[0];
    return '<p class="fse-d">Série B 2026 (≥ 900 min): quem está acima da média nos dois físicos que mais andam com produção no setor ' +
      '(<b>' + esc(h[5]) + '</b>, <b>' + esc(h[7]) + '</b>) <i>e</i> nas duas produções (<b>' + esc(h[9]) + '</b>, <b>' + esc(h[11]) + '</b>). Nomes vetados ficam fora.</p>' +
      '<table class="fse-t"><thead><tr><th>Jogador</th><th>Clube</th><th>Pos</th><th class="n">Idade</th><th class="n">Min</th><th class="n">' + esc(h[5]) + '</th><th class="n">' + esc(h[7]) +
      '</th><th class="n">' + esc(h[9]) + '</th><th class="n">' + esc(h[11]) + '</th></tr></thead><tbody>' +
      L.map(r => '<tr><td><b>' + esc(r[0]) + '</b></td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td><td class="n">' + r[3] + '</td><td class="n">' + r[4] + '</td>' +
        [r[6], r[8], r[10], r[12]].map(v => '<td class="n">' + num(v, v > 1000 ? 0 : v > 20 ? 1 : 2) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
  }

  const SEC = [['sobe', 'Quem sobe × quem cai, por posição', sobeCai], ['ref', 'O titular dos times que rendem × os demais', referencia],
    ['tipos', 'Tipos físicos e o que cada um produz', tipos], ['lig', 'O que o físico produz no técnico', ligacoes], ['dest', 'Destaques da Série B 2026', destaques]];

  function render() {
    const el = document.getElementById('fsPainelEstudo'); if (!el || !D) return;
    const aberto = ler('fseAberto', '0') === '1';
    const abertas = new Set(ler('fseSecoes', 'sobe').split(','));
    el.innerHTML = '<details class="fse"' + (aberto ? ' open' : '') + '><summary><b>Perfil físico por posição</b> — estudo V2 ' +
      '<span>sobe × cai, tipos físicos, o que o físico produz, destaques</span></summary><div class="fse-corpo">' +
      '<div class="fse-chips">' + D.setores.map(s => '<button data-s="' + s + '"' + (s === setor ? ' class="on"' : '') + '>' + s + '</button>').join('') + '</div>' +
      SEC.map(([k, t, f]) => '<details class="fse-sec" data-k="' + k + '"' + (abertas.has(k) ? ' open' : '') + '><summary>' + t + '</summary>' + f(setor) + '</details>').join('') +
      '<p class="fse-nota">Fonte: Santa Cruz V2, blocos 1 e 8 (SkillCorner + Wyscout, Série B 2022–2026). Gerado em ' + esc(D.gerado.split('-').reverse().join('/')) + '.</p></div></details>';
    const d = el.querySelector('details.fse');
    d.addEventListener('toggle', () => gravar('fseAberto', d.open ? '1' : '0'));
    el.querySelectorAll('.fse-chips button').forEach(b => b.onclick = () => { setor = b.dataset.s; gravar('fseSetor', setor); render(); });
    el.querySelectorAll('details.fse-sec').forEach(x => x.addEventListener('toggle', () => {
      const s = [...el.querySelectorAll('details.fse-sec')].filter(y => y.open).map(y => y.dataset.k); gravar('fseSecoes', s.join(','));
    }));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
