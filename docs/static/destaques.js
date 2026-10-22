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

  /* 22/10: idade e nacionalidade (nascimento e nacionalidade da base da API do TransferRoom, pelo id) */
  const PAIS = { Brazil: 'Brasil', Argentina: 'Argentina', Uruguay: 'Uruguai', Colombia: 'Colômbia', Paraguay: 'Paraguai', Chile: 'Chile', Ecuador: 'Equador',
    Peru: 'Peru', Bolivia: 'Bolívia', Venezuela: 'Venezuela', Mexico: 'México', Portugal: 'Portugal', Spain: 'Espanha', Russia: 'Rússia', 'United States': 'EUA',
    Nigeria: 'Nigéria', 'Cape Verde Islands': 'Cabo Verde', France: 'França', Italy: 'Itália', Germany: 'Alemanha', England: 'Inglaterra', Japan: 'Japão',
    'Korea, South': 'Coreia do Sul', Ghana: 'Gana', Angola: 'Angola', Senegal: 'Senegal', 'Ivory Coast': 'Costa do Marfim', Cameroon: 'Camarões', Netherlands: 'Holanda',
    Belgium: 'Bélgica', Croatia: 'Croácia', Serbia: 'Sérvia', Panama: 'Panamá', 'Costa Rica': 'Costa Rica', Honduras: 'Honduras', Canada: 'Canadá', Morocco: 'Marrocos' };
  const pais = n => PAIS[n] || n;
  const HOJE = new Date();
  const idade = j => { if (!j.nb) return null; const d = new Date(j.nb + 'T12:00:00'); let a = HOJE.getFullYear() - d.getFullYear();
    if (HOJE.getMonth() < d.getMonth() || (HOJE.getMonth() === d.getMonth() && HOJE.getDate() < d.getDate())) a--; return a; };
  const nascBr = j => j.nb ? j.nb.slice(8, 10) + '/' + j.nb.slice(5, 7) + '/' + j.nb.slice(0, 4) : '';
  let E = { lista: '2026_Brazil_D2', busca: '', ord: 'nota', so: '', imin: '', imax: '', nac: '', letra: '', seta: '' };
  /* 22/10 — físico e técnico do app em cada card: o cadastro (pk, cruzado em ferramentas/montar_destaques_tr.py) dá a letra física,
     a seta técnica (▲ ↔ ▼ e quantos fundamentais no nível de quem sobe), a minutagem e o farol — os mesmos dos cards do campograma.
     Guardado por jogador enquanto a versão dos dados (window.DADOS_VER) não muda. */
  const num = (x, d) => x == null || !isFinite(x) ? '—' : Number(x).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  let infoVer = -1; const INFO = new Map();
  function infoDe(id, j) {
    const v = window.DADOS_VER || 0; if (v !== infoVer) { infoVer = v; INFO.clear(); }
    if (INFO.has(id)) return INFO.get(id);
    let o = null;
    try {
      const b = j.pk && typeof fsJogadorPk === 'function' && typeof BASE !== 'undefined' && BASE.length ? fsJogadorPk(j.pk) : null;
      if (b) {
        let x = b; try { if (typeof comFisicoDoEstudo === 'function') x = comFisicoDoEstudo(b) || b; } catch (e) {}
        const JB = window.JB, L = JB ? JB.letra(b) : null;
        let s = null; try { s = window.subidaSeloInfo ? window.subidaSeloInfo(x, null) : null; } catch (e) {}
        let mi = null; try { mi = typeof minutagemDe === 'function' ? minutagemDe(x) : null; } catch (e) {}
        /* a seta é a do card (subidaSelo: base da aba, ficha da posição e colado); a contagem dos fundamentais, a da ficha (como na aba Tipo físico) */
        let h = ''; try { h = window.subidaSelo ? window.subidaSelo(x) : ''; } catch (e) {}
        const m = /sb-selo sb-([varn])/.exec(h || '');
        o = { b, L: L ? L.l : '-', letraH: JB ? JB.letraHtml(b) : '', seta: m ? m[1] : 'n', setaH: h, v: s ? (s.verde != null ? s.verde : s.ok) : null, com: s ? s.com : null,
              mp: mi ? Math.round(mi.pct * 100) : null, mc: mi ? mi.c : '', mt: mi ? mi.txt : '', farolH: JB ? JB.farolHtml(b) : '', psv: x.psv, spr: x.spr_n, alt: b.alt };
      }
    } catch (e) { o = null; }
    if (o || (typeof BASE !== 'undefined' && BASE.length)) INFO.set(id, o);
    return o;
  }
  const LETRAS = [['A+', 'A+'], ['A', 'A'], ['B', 'B'], ['C', 'C'], ['-', 'sem físico']];
  const SETAS = [['v', '▲ no nível de quem sobe'], ['va', '▲ ou ↔'], ['a', '↔ entre sobe e cai'], ['r', '▼ abaixo'], ['n', '? sem técnico']];
  try { Object.assign(E, JSON.parse(localStorage.getItem(LS) || '{}')); } catch (e) {}
  const salvar = () => { try { localStorage.setItem(LS, JSON.stringify(E)); } catch (e) {} };

  function cartao(id, j, D) {
    const foto = j.f ? '<img class="dt-foto" loading="lazy" src="' + D.base + 'players/' + id + '.png" alt="" onerror="this.outerHTML=\'<span class=&quot;dt-foto dt-ini&quot;>' + esc(j.n.split(' ').map(x => x[0]).slice(0, 2).join('')) + '</span>\'">'
      : '<span class="dt-foto dt-ini">' + esc(j.n.split(' ').map(x => x[0]).slice(0, 2).join('')) + '</span>';
    const escudo = j.e ? '<img class="dt-esc" loading="lazy" src="' + D.base + 'clubs/' + esc(j.e) + '" alt="" onerror="this.style.visibility=\'hidden\'">' : '<span class="dt-esc dt-esc0"></span>';
    const livre = j.c === 'Free Agent';
    const outras = j.l.filter(k => k !== E.lista).map(k => '<span class="dt-tag' + (['MAIN', 'BACKUP', 'YOUTH', 'Indicados a monitorar'].includes(k) ? ' cl' : '') + '">' + esc(NOME[k] || k) + '</span>').join('');
    const o = infoDe(id, j);
    const ind = !j.pk ? '<div class="dt-ind dt-ind0">sem cadastro no app (sem físico e técnico)</div>'
      : !o ? '<div class="dt-ind dt-ind0">carregando…</div>'
      : '<div class="dt-ind"><span title="Letra física (SkillCorner)">Fís. ' + o.letraH + '</span>' +
        '<span title="Seta técnica: fundamentais da posição no nível dos titulares de quem subiu">Téc. ' + (o.setaH || '<i class="jb-vaz">?</i>') + (o.com ? ' <b>' + o.v + '</b>/' + o.com : '') + '</span>' +
        '<span class="ta-mp ' + (o.mc || '') + '" title="' + esc(o.mt || 'Minutagem: sem histórico') + '">Min. ' + (o.mp != null ? o.mp + '%' : '—') + '</span>' +
        (o.psv ? '<span title="Velocidade máxima (PSV-99, km/h) · sprints por 90">PSV ' + num(o.psv, 1) + (o.spr ? ' · Spr ' + num(o.spr, 1) : '') + '</span>' : '') +
        (o.alt ? '<span>' + o.alt + ' cm</span>' : '') + (o.farolH ? '<span class="dt-farol">' + o.farolH + '</span>' : '') + '</div>';
    return '<div class="dt-card' + (livre ? ' livre' : '') + '">' + foto +
      '<div class="dt-meio"><div class="dt-nome">' + (o && window.JB ? JB.nomeHtml(o.b, j.n) + ' ' + JB.levarHtml(o.b) : esc(j.n)) + '</div>' +
      '<div class="dt-clube">' + escudo + '<span>' + (livre ? '<b class="dt-livre">Livre</b>' : esc(j.c)) + '</span></div>' +
      '<div class="dt-pos">' + esc(posPt(j.p)) + (idade(j) != null ? ' · <span title="nascido em ' + nascBr(j) + '">' + idade(j) + ' anos <small>(' + nascBr(j) + ')</small></span>' : '') +
        (j.na ? ' · <span class="dt-nac" title="' + esc(pais(j.na) + (j.na2 ? ' e ' + pais(j.na2) : '')) + '">' + esc(pais(j.na)) + (j.na2 ? ' / ' + esc(pais(j.na2)) : '') + '</span>' : '') + '</div>' + ind + (outras ? '<div class="dt-tags">' + outras + '</div>' : '') + '</div>' +
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
    /* nacionalidades da lista aberta (antes do filtro de nacionalidade, para o menu não esvaziar) */
    const nacs = {}; rows.forEach(([, j]) => { [j.na, j.na2].filter(Boolean).forEach(n => { nacs[n] = (nacs[n] || 0) + 1; }); });
    if (E.imin !== '') rows = rows.filter(([, j]) => idade(j) != null && idade(j) >= +E.imin);
    if (E.imax !== '') rows = rows.filter(([, j]) => idade(j) != null && idade(j) <= +E.imax);
    if (E.nac) rows = rows.filter(([, j]) => j.na === E.nac || j.na2 === E.nac);
    if (E.letra) rows = rows.filter(([id, j]) => { const o = infoDe(id, j); return (o ? o.L : '-') === E.letra; });
    if (E.seta) rows = rows.filter(([id, j]) => { const o = infoDe(id, j), c = o ? o.seta : 'n'; return E.seta === 'va' ? (c === 'v' || c === 'a') : c === E.seta; });
    rows.sort((a, b) => E.ord === 'nome' ? a[1].n.localeCompare(b[1].n) : E.ord === 'idade' ? (idade(a[1]) ?? 99) - (idade(b[1]) ?? 99) || (b[1].r ?? -1) - (a[1].r ?? -1) : (b[1].r ?? -1) - (a[1].r ?? -1));

    let h = '<div class="dt-topo"><div><h2>Destaques dos campeonatos</h2><p>As listas do <b>TransferRoom Scout</b> (Scout Management), campeonato a campeonato: <b>' +
      Object.keys(D.jogadores).length + '</b> jogadores em <b>' + D.ordem.filter(k => D.listas[k].length).length + '</b> listas. Levantado em ' +
      D.extraido.split('-').reverse().join('/') + '. Número à direita = nota do TransferRoom. As etiquetas embaixo do nome dizem em que outras listas o jogador também está.</p></div></div>';
    h += '<div class="dt-grupos">' + GRUPOS.map(([g, ks]) => '<div class="dt-grupo"><span>' + g + '</span><div class="dt-chips">' + ks.filter(k => k in D.listas).map(k =>
      '<button type="button" class="dt-chip' + (E.lista === k ? ' on' : '') + (D.listas[k].length ? '' : ' vazia') + '" data-l="' + esc(k) + '">' + esc(NOME[k] || k) + ' <b>' + D.listas[k].length + '</b></button>').join('') + '</div></div>').join('') + '</div>';
    /* "Todas as listas" abre a linha dos filtros (22/10: a caixa "Tudo" sozinha ocupava uma linha inteira) */
    h += '<div class="dt-ctrl"><button type="button" class="dt-chip dt-tudo' + (E.lista === '*' ? ' on' : '') + '" data-l="*">Todas as listas <b>' + Object.keys(D.jogadores).length + '</b></button><input type="search" id="dtBusca" placeholder="buscar nome ou clube" value="' + esc(E.busca) + '">' +
      '<label>Posição <select id="dtSo"><option value="">todas</option>' + SETOR.map(([k, n]) => '<option value="' + k + '"' + (E.so === k ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label>' +
      '<label>Idade <input type="number" id="dtImin" class="dt-num" min="15" max="45" placeholder="de" value="' + esc(E.imin) + '"> a <input type="number" id="dtImax" class="dt-num" min="15" max="45" placeholder="até" value="' + esc(E.imax) + '"></label>' +
      '<label>Nacionalidade <select id="dtNac"><option value="">todas</option>' + Object.keys(nacs).concat(E.nac && !nacs[E.nac] ? [E.nac] : [])
        .sort((a, b) => (b === 'Brazil') - (a === 'Brazil') || (nacs[b] || 0) - (nacs[a] || 0) || pais(a).localeCompare(pais(b)))
        .map(n => '<option value="' + esc(n) + '"' + (E.nac === n ? ' selected' : '') + '>' + esc(pais(n)) + ' (' + (nacs[n] || 0) + ')</option>').join('') + '</select></label>' +
      '<label>Físico <select id="dtLetra"><option value="">todas</option>' + LETRAS.map(o => '<option value="' + o[0] + '"' + (E.letra === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>' +
      '<label>Técnico <select id="dtSeta"><option value="">todas</option>' + SETAS.map(o => '<option value="' + o[0] + '"' + (E.seta === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></label>' +
      '<label>Ordem <select id="dtOrd"><option value="nota"' + (E.ord === 'nota' ? ' selected' : '') + '>nota TransferRoom</option><option value="idade"' + (E.ord === 'idade' ? ' selected' : '') + '>idade (mais novo)</option><option value="nome"' + (E.ord === 'nome' ? ' selected' : '') + '>nome</option></select></label>' +
      ((E.imin !== '' || E.imax !== '' || E.nac || E.so || E.busca || E.letra || E.seta) ? '<button type="button" class="dt-limpa" id="dtLimpa">limpar filtros</button>' : '') +
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
    el.querySelector('#dtNac').onchange = e => { E.nac = e.target.value; salvar(); render(); };
    el.querySelector('#dtLetra').onchange = e => { E.letra = e.target.value; salvar(); render(); };
    el.querySelector('#dtSeta').onchange = e => { E.seta = e.target.value; salvar(); render(); };
    ['Imin', 'Imax'].forEach(k => { const x = el.querySelector('#dt' + k); x.onchange = () => { E[k.toLowerCase()] = x.value; salvar(); render(); }; });
    const li = el.querySelector('#dtLimpa'); if (li) li.onclick = () => { Object.assign(E, { busca: '', so: '', imin: '', imax: '', nac: '', letra: '', seta: '' }); salvar(); render(); };
  }

  function ligar() {
    const bt = document.querySelector('.aba[data-aba="destaques"]'), pg = document.getElementById('pgDestaques');
    if (!bt || !pg) return;
    let feito = false;
    /* a base e os indicadores chegam depois: redesenha quando ficam prontos (e só se a aba está aberta) */
    let verFeita = -1;
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on); if (on && (!feito || verFeita !== (window.DADOS_VER || 0))) { feito = true; verFeita = window.DADOS_VER || 0; render(); } };
    window.addEventListener('subida-kpis', () => { if (bt.classList.contains('on')) { verFeita = window.DADOS_VER || 0; render(); } });
    const el = document.getElementById('dtCorpo'); if (el && window.JB) JB.ligar(el);
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
