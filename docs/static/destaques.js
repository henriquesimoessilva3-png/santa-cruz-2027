/* 20/10/2026 — aba Destaques: as listas (shortlists) do TransferRoom Scout, campeonato a campeonato.
   Dado em static/destaques_dados.js (ferramentas/montar_destaques_tr.py; cópia em dados/transferroom/listas_tr.json).
   Mostra a página #pgDestaques quando o botão da aba liga (mesmo gesto da treinadores.js). */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = 'sc2027_destaques';
  /* nome de cada lista na tela e o grupo em que ela aparece */
  const NOME = {
    '2026_Brazil_D2': 'Série B 2026', '2026_Brazil_D1': 'Série A 2026', '2026_Brazil_D3': 'Série C 2026',
    '2026_Argentina_D1': 'Argentina', '2026_Argentina_D2': 'Argentina B', '2026_Uruguay_D1': 'Uruguai', '2026_Paraguay_D1': 'Paraguai',
    '2026_Chile_D1': 'Chile', '2026_Colombia_D1': 'Colômbia', '2026_Colombia_D2': 'Colômbia B', '2026_Ecuador_D1': 'Equador',
    '2026_Libertadores': 'Libertadores', '2026_Sudamericana': 'Sul-Americana',
    '2026_Mexico_D1': 'México', '2026_MLS': 'MLS', '2025/26_Portugal_D1': 'Portugal 25/26', '2026/27_Portugal_D1': 'Portugal 26/27',
    '2026/27_Russia_D1': 'Rússia', '2026/27_Europa': 'Europa', '2026/27_Ásia': 'Ásia', '2026/27_Oriente Médio': 'Oriente Médio',
    MAIN: 'Main', BACKUP: 'Backup', YOUTH: 'Youth', 'Indicados a monitorar': 'Indicados a monitorar', '2026/2027_Fim de Contrato': 'Fim de contrato 26/27'
  };
  const GRUPOS = [
    ['Brasil', ['2026_Brazil_D2', '2026_Brazil_D1', '2026_Brazil_D3']],
    ['América do Sul', ['2026_Argentina_D1', '2026_Argentina_D2', '2026_Uruguay_D1', '2026_Paraguay_D1', '2026_Colombia_D1', '2026_Colombia_D2', '2026_Ecuador_D1', '2026_Chile_D1']],
    ['Copas', ['2026_Libertadores', '2026_Sudamericana']],
    ['Outros mercados', ['2026_Mexico_D1', '2026_MLS', '2025/26_Portugal_D1', '2026/27_Portugal_D1', '2026/27_Russia_D1', '2026/27_Europa', '2026/27_Ásia', '2026/27_Oriente Médio']],
    ['Listas do clube', ['MAIN', 'BACKUP', 'YOUTH', 'Indicados a monitorar', '2026/2027_Fim de Contrato']]
  ];
  /* posição principal (a primeira do TransferRoom) → setor */
  const SETOR = [['GK', 'Goleiros'], ['CB', 'Zagueiros'], ['RB', 'Laterais direitos'], ['LB', 'Laterais esquerdos'], ['DM', 'Volantes'],
    ['CM', 'Meio-campistas'], ['AM', 'Meias'], ['W', 'Extremos'], ['F', 'Centroavantes']];
  const POS_PT = { GK: 'GOL', CB: 'ZAG', RB: 'LD', LB: 'LE', DM: 'VOL', CM: 'MC', AM: 'MEI', W: 'EXT', F: 'CA' };
  const posPt = p => String(p || '').split(',').map(x => POS_PT[x.trim()] || x.trim()).filter((x, i, a) => a.indexOf(x) === i).join(' · ');

  let E = { lista: '2026_Brazil_D2', busca: '', ord: 'nota', so: '' };
  try { Object.assign(E, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) {}
  const salvar = () => { try { localStorage.setItem(LS, JSON.stringify(E)); } catch (e) {} };

  function cartao(id, j, D) {
    const foto = j.f ? '<img class="dt-foto" loading="lazy" src="' + D.base + 'players/' + id + '.png" alt="" onerror="this.outerHTML=\'<span class=&quot;dt-foto dt-ini&quot;>' + esc(j.n.split(' ').map(x => x[0]).slice(0, 2).join('')) + '</span>\'">'
      : '<span class="dt-foto dt-ini">' + esc(j.n.split(' ').map(x => x[0]).slice(0, 2).join('')) + '</span>';
    const escudo = j.e ? '<img class="dt-esc" loading="lazy" src="' + D.base + 'clubs/' + esc(j.e) + '" alt="" onerror="this.style.visibility=\'hidden\'">' : '<span class="dt-esc dt-esc0"></span>';
    const livre = j.c === 'Free Agent';
    const outras = j.l.filter(k => k !== E.lista).map(k => '<span class="dt-tag' + (['MAIN', 'BACKUP', 'YOUTH', 'Indicados a monitorar'].includes(k) ? ' cl' : '') + '">' + esc(NOME[k] || k) + '</span>').join('');
    return '<div class="dt-card' + (livre ? ' livre' : '') + '">' + foto +
      '<div class="dt-meio"><div class="dt-nome">' + esc(j.n) + '</div>' +
      '<div class="dt-clube">' + escudo + '<span>' + (livre ? '<b class="dt-livre">Livre</b>' : esc(j.c)) + '</span></div>' +
      '<div class="dt-pos">' + esc(posPt(j.p)) + '</div>' + (outras ? '<div class="dt-tags">' + outras + '</div>' : '') + '</div>' +
      '<div class="dt-nota' + (j.r == null ? ' sem' : '') + '" title="Nota do TransferRoom">' + (j.r == null ? '—' : j.r.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })) + '</div></div>';
  }

  function render() {
    const el = document.getElementById('dtCorpo'), D = window.DESTAQUES_TR;
    if (!el || !D) return;
    if (!(E.lista in D.listas) && E.lista !== '*') E.lista = '2026_Brazil_D2';
    const ids = E.lista === '*' ? Object.keys(D.jogadores) : D.listas[E.lista].map(String);
    const q = E.busca.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    let rows = ids.map(id => [id, D.jogadores[id]]).filter(([, j]) => !q || (j.n + ' ' + j.c).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q));
    if (E.so) rows = rows.filter(([, j]) => String(j.p).split(',')[0].trim() === E.so);
    rows.sort((a, b) => E.ord === 'nome' ? a[1].n.localeCompare(b[1].n) : (b[1].r ?? -1) - (a[1].r ?? -1));

    let h = '<div class="dt-topo"><div><h2>Destaques dos campeonatos</h2><p>As listas do <b>TransferRoom Scout</b> (Scout Management), campeonato a campeonato: <b>' +
      Object.keys(D.jogadores).length + '</b> jogadores em <b>' + D.ordem.filter(k => D.listas[k].length).length + '</b> listas. Levantado em ' +
      D.extraido.split('-').reverse().join('/') + '. Número à direita = nota do TransferRoom. As etiquetas embaixo do nome dizem em que outras listas o jogador também está.</p></div></div>';
    h += '<div class="dt-grupos">' + GRUPOS.map(([g, ks]) => '<div class="dt-grupo"><span>' + g + '</span>' + ks.filter(k => k in D.listas).map(k =>
      '<button type="button" class="dt-chip' + (E.lista === k ? ' on' : '') + (D.listas[k].length ? '' : ' vazia') + '" data-l="' + esc(k) + '">' + esc(NOME[k] || k) + ' <b>' + D.listas[k].length + '</b></button>').join('') + '</div>').join('') +
      '<div class="dt-grupo"><span>Tudo</span><button type="button" class="dt-chip' + (E.lista === '*' ? ' on' : '') + '" data-l="*">Todas as listas <b>' + Object.keys(D.jogadores).length + '</b></button></div></div>';
    h += '<div class="dt-ctrl"><input type="search" id="dtBusca" placeholder="buscar nome ou clube" value="' + esc(E.busca) + '">' +
      '<label>Posição <select id="dtSo"><option value="">todas</option>' + SETOR.map(([k, n]) => '<option value="' + k + '"' + (E.so === k ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label>' +
      '<label>Ordem <select id="dtOrd"><option value="nota"' + (E.ord === 'nota' ? ' selected' : '') + '>nota TransferRoom</option><option value="nome"' + (E.ord === 'nome' ? ' selected' : '') + '>nome</option></select></label>' +
      '<span class="dt-cont"><b>' + rows.length + '</b> jogadores</span></div>';
    if (!rows.length) h += '<p class="dt-vazio">' + (ids.length ? 'Nenhum jogador com esse filtro.' : 'Esta lista está vazia no TransferRoom.') + '</p>';
    for (const [k, n] of SETOR) {
      const s = rows.filter(([, j]) => String(j.p).split(',')[0].trim() === k);
      if (!s.length) continue;
      h += '<section class="dt-setor"><h3>' + n + ' <b>' + s.length + '</b></h3><div class="dt-lista">' + s.map(([id, j]) => cartao(id, j, D)).join('') + '</div></section>';
    }
    el.innerHTML = h;
    el.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { E.lista = b.dataset.l; salvar(); render(); });
    const bu = el.querySelector('#dtBusca');
    bu.oninput = () => { E.busca = bu.value; salvar(); clearTimeout(bu._t); bu._t = setTimeout(() => { render(); const n = document.getElementById('dtBusca'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 200); };
    el.querySelector('#dtSo').onchange = e => { E.so = e.target.value; salvar(); render(); };
    el.querySelector('#dtOrd').onchange = e => { E.ord = e.target.value; salvar(); render(); };
  }

  function ligar() {
    const bt = document.querySelector('.aba[data-aba="destaques"]'), pg = document.getElementById('pgDestaques');
    if (!bt || !pg) return;
    let feito = false;
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on && !feito) { feito = true; render(); } };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
