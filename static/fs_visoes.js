/* ---------------- Físico: outras formas de ver ----------------
   Tres layouts que ABANDONAM a matriz de indicadores x jogadores. Nasceram como propostas
   (ver _fonte/propostas-marcacao/logicas.html) e entram aqui como estao: cada um e uma
   funcao (D, el) que desenha tudo dentro de `el`. `D` e o pacote que fsPacote() monta a
   partir do estado da aba — coorte, comparados, medias e as duas referencias. O CSS de
   cada um vive no fim deste arquivo e e injetado uma vez, escopado por classe.
   Os tokens de cor que eles usam (--ink, --sup, --bonina...) sao apelidos definidos em
   .fs-palco no style.css, apontando para os tokens do app — trocam com o tema. */
window.FS_VISOES = {};

/* ---- Mapa de quadrantes ---- */
FS_VISOES.mapa = function (D, el) {
var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
var num = function (v) { return (v > 0 ? '+' : '') + v; };
var ind = D.indicadores || [];
var grupos = D.grupos || [];
var J = D.jogadores || [];
var vazio = { v: {}, idx: { grupos: [0, 0, 0, 0, 0], geral: 0 }, nomes: [] };
var refBR = D.refBR || vazio, refMU = D.refMU || vazio;
var vBR = refBR.v || {}, vMU = refMU.v || {};
var iBR = (refBR.idx && refBR.idx.grupos) || [], iMU = (refMU.idx && refMU.idx.grupos) || [];
/* quem esta na comparacao: pela CHAVE (pk), nunca pelo nome — ha homonimos na mesma
   posicao (dois Juninho, dois Vitinho...). O nome e so rotulo. */
var destOrd = D.destaquePks || [];
var dest = {}; destOrd.forEach(function (pk) { dest[pk] = 1; });
/* populacao = coorte (D.n) + comparados de outra liga (D.nFora), que entram em J */
var nFora = D.nFora || 0, nCo = D.n || (J.length - nFora);
var foraTxt = function (n) { return n ? ' + ' + n + ' de fora' : ''; };
var popRot = nCo + foraTxt(nFora);

function melhor(a, b, menor) { return menor ? (a < b) : (a > b); }
function cmp(v, ref, lista) {
  var up = 0, dn = 0, eq = 0, n = 0, i, k, a, b;
  for (i = 0; i < lista.length; i++) {
    k = lista[i].k; a = v[k]; b = ref[k];
    if (a == null || b == null || isNaN(a) || isNaN(b)) continue;
    n++;
    if (melhor(a, b, lista[i].menor)) up++; else if (melhor(b, a, lista[i].menor)) dn++; else eq++;
  }
  return { up: up, dn: dn, eq: eq, n: n, saldo: up - dn };
}
var QN = ['Abaixo das duas', 'Só acima do Brasil', 'Só acima do mundo', 'Acima das duas'];
var P = J.map(function (j, i) {
  var v = j.v || {};
  var br = cmp(v, vBR, ind), mu = cmp(v, vMU, ind);
  return {
    i: i, j: j, br: br, mu: mu,
    gb: grupos.map(function (g) { return cmp(v, vBR, g.m || []); }),
    gm: grupos.map(function (g) { return cmp(v, vMU, g.m || []); }),
    q: (br.saldo > 0 ? 1 : 0) + (mu.saldo > 0 ? 2 : 0),
    dest: !!dest[j.pk]
  };
});
var refMUvsBR = cmp(vMU, vBR, ind).saldo, refBRvsMU = cmp(vBR, vMU, ind).saldo;
var total = ind.length || 25;

/* ---- geometria ---- */
var W = 780, H = 600, ml = 58, mr = 40, mt = 30, mb = 56, pw = W - ml - mr, ph = H - mt - mb;
var xmin = -(total + 2), xmax = total + 2, ymin = -(total + 2), ymax = 10;
P.forEach(function (p) { if (p.mu.saldo + 3 > ymax) ymax = p.mu.saldo + 3; });
var sx = pw / (xmax - xmin), sy = ph / (ymax - ymin);
var X = function (v) { return ml + (v - xmin) * sx; };
var Y = function (v) { return mt + (ymax - v) * sy; };

/* anti-colisão de pontos com a mesma coordenada */
var ocup = {};
P.forEach(function (p) {
  var ch = p.br.saldo + ',' + p.mu.saldo, n = ocup[ch] || 0; ocup[ch] = n + 1;
  var dx = n === 0 ? 0 : (n % 2 ? 1 : -1) * Math.ceil(n / 2) * 6;
  p.px = X(p.br.saldo) + dx; p.py = Y(p.mu.saldo);
});

var glifo = function (p) {
  return '<span class="qm-gl"><span class="br">' + (p.br.saldo > 0 ? '●' : '○') + '</span><span class="mu">' + (p.mu.saldo > 0 ? '●' : '○') + '</span></span>';
};
var glifoQ = function (q) {
  return '<span class="qm-gl"><span class="br">' + (q & 1 ? '●' : '○') + '</span><span class="mu">' + (q & 2 ? '●' : '○') + '</span></span>';
};

/* ---- SVG ---- */
var s = '';
var NARROW = 'font-family:\'Archivo Narrow\',Archivo,sans-serif;text-transform:uppercase;letter-spacing:.05em;';
var MONO = 'font-family:\'IBM Plex Mono\',monospace;';
s += '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" xmlns="http://www.w3.org/2000/svg">';
s += '<rect x="' + ml + '" y="' + mt + '" width="' + pw + '" height="' + ph + '" style="fill:var(--sup);stroke:var(--linha)"/>';
s += '<rect x="' + X(0) + '" y="' + mt + '" width="' + (X(xmax) - X(0)) + '" height="' + ph + '" style="fill:var(--bonina)" fill-opacity="0.07"/>';
s += '<rect x="' + ml + '" y="' + mt + '" width="' + pw + '" height="' + (Y(0) - mt) + '" style="fill:var(--roxo)" fill-opacity="0.10"/>';
var t;
for (t = Math.ceil(xmin / 5) * 5; t <= xmax; t += 5) {
  s += '<line x1="' + X(t) + '" y1="' + mt + '" x2="' + X(t) + '" y2="' + (mt + ph) + '" style="stroke:var(--linha)" stroke-opacity="0.6"/>';
  s += '<text x="' + X(t) + '" y="' + (mt + ph + 16) + '" text-anchor="middle" font-size="10" style="' + MONO + 'fill:var(--ink3)">' + num(t) + '</text>';
}
for (t = Math.ceil(ymin / 5) * 5; t <= ymax; t += 5) {
  s += '<line x1="' + ml + '" y1="' + Y(t) + '" x2="' + (ml + pw) + '" y2="' + Y(t) + '" style="stroke:var(--linha)" stroke-opacity="0.6"/>';
  s += '<text x="' + (ml - 8) + '" y="' + (Y(t) + 3.5) + '" text-anchor="end" font-size="10" style="' + MONO + 'fill:var(--ink3)">' + num(t) + '</text>';
}
/* eixos no zero */
s += '<line x1="' + X(0) + '" y1="' + mt + '" x2="' + X(0) + '" y2="' + (mt + ph) + '" style="stroke:var(--ink3)" stroke-width="1.2"/>';
s += '<line x1="' + ml + '" y1="' + Y(0) + '" x2="' + (ml + pw) + '" y2="' + Y(0) + '" style="stroke:var(--ink3)" stroke-width="1.2"/>';
/* onde cai a outra referência em cada eixo */
s += '<line x1="' + X(refMUvsBR) + '" y1="' + mt + '" x2="' + X(refMUvsBR) + '" y2="' + (mt + ph) + '" style="stroke:var(--roxo)" stroke-width="1" stroke-dasharray="3 4" stroke-opacity="0.8"/>';
s += '<text x="' + X(refMUvsBR) + '" y="' + (mt - 8) + '" text-anchor="middle" font-size="10.5" style="' + NARROW + 'fill:var(--roxo)">ref. mundo vs Brasil: ' + num(refMUvsBR) + '</text>';
s += '<line x1="' + ml + '" y1="' + Y(refBRvsMU) + '" x2="' + (ml + pw) + '" y2="' + Y(refBRvsMU) + '" style="stroke:var(--bonina)" stroke-width="1" stroke-dasharray="3 4" stroke-opacity="0.8"/>';
s += '<text x="' + (ml + 8) + '" y="' + (Y(refBRvsMU) - 5) + '" font-size="10.5" style="' + NARROW + 'fill:var(--bonina)">ref. Brasil vs mundo: ' + num(refBRvsMU) + '</text>';
/* nomes dos quadrantes + contagens */
var cont = [0, 0, 0, 0], contD = [0, 0, 0, 0];
P.forEach(function (p) { cont[p.q]++; if (p.dest) contD[p.q]++; });
var rotQ = function (q) { return QN[q] + ' · ' + cont[q] + ' de ' + popRot + (contD[q] ? ' · ' + contD[q] + ' dos ' + destOrd.length : ''); };
var QS = NARROW + 'fill:var(--ink2)';
s += '<text x="' + (X(xmax) - 8) + '" y="' + (mt + 16) + '" text-anchor="end" font-size="11" style="' + QS + '">' + esc(rotQ(3)) + '</text>';
s += '<text x="' + (ml + 8) + '" y="' + (mt + 16) + '" font-size="11" style="' + QS + '">' + esc(rotQ(2)) + '</text>';
s += '<text x="' + (X(xmax) - 8) + '" y="' + (mt + ph - 9) + '" text-anchor="end" font-size="11" style="' + QS + '">' + esc(rotQ(1)) + '</text>';
s += '<text x="' + (ml + 8) + '" y="' + (mt + ph - 9) + '" font-size="11" style="' + QS + '">' + esc(rotQ(0)) + '</text>';
/* títulos dos eixos */
s += '<text x="' + (ml + pw / 2) + '" y="' + (H - 12) + '" text-anchor="middle" font-size="11" style="' + NARROW + 'fill:var(--bonina)">saldo vs referência do Brasil · indicadores acima menos abaixo, de ' + total + '</text>';
s += '<text transform="translate(14 ' + (mt + ph / 2) + ') rotate(-90)" text-anchor="middle" font-size="11" style="' + NARROW + 'fill:var(--roxo)">saldo vs referência do mundo</text>';
/* população */
P.forEach(function (p) {
  if (p.dest) return;
  s += '<circle class="qm-hit" data-i="' + p.i + '" data-pk="' + esc(p.j.pk) + '" cx="' + p.px + '" cy="' + p.py + '" r="9" fill="transparent"/>';
  s += '<circle class="qm-pt" cx="' + p.px + '" cy="' + p.py + '" r="4" style="fill:var(--ink3)" fill-opacity="0.85" pointer-events="none"/>';
});
/* anel do selecionado + rótulo de hover */
s += '<circle class="qm-anel" cx="-50" cy="-50" r="11" fill="none" style="stroke:var(--ambar)" stroke-width="1.5"/>';
/* destacados com rótulo sem sobreposição */
var caixas = [], DP = P.filter(function (p) { return p.dest; });
DP.forEach(function (p) { caixas.push({ x: p.px - 8, y: p.py - 8, w: 16, h: 16 }); });
var colide = function (b) {
  if (b.x < ml + 2 || b.x + b.w > W - 2 || b.y < mt + 20 || b.y + b.h > mt + ph - 18) return true;
  for (var i = 0; i < caixas.length; i++) { var c = caixas[i]; if (b.x < c.x + c.w && b.x + b.w > c.x && b.y < c.y + c.h && b.y + b.h > c.y) return true; }
  return false;
};
DP.forEach(function (p) {
  var w = p.j.n.length * 6.4 + 4, h = 13;
  var cand = [
    { x: p.px + 10, y: p.py - 6, a: 'start' }, { x: p.px - 10 - w, y: p.py - 6, a: 'end' },
    { x: p.px - w / 2, y: p.py - 22, a: 'middle' }, { x: p.px - w / 2, y: p.py + 10, a: 'middle' },
    { x: p.px + 10, y: p.py - 18, a: 'start' }, { x: p.px + 10, y: p.py + 5, a: 'start' },
    { x: p.px - 10 - w, y: p.py - 18, a: 'end' }, { x: p.px - 10 - w, y: p.py + 5, a: 'end' }
  ], esc_ = null, i;
  /* perto da borda direita, tenta primeiro os candidatos ancorados à esquerda do ponto */
  if (p.px > ml + pw * 0.7) cand.sort(function (a, b) { return (a.a === 'end' ? 0 : 1) - (b.a === 'end' ? 0 : 1); });
  for (i = 0; i < cand.length; i++) { var b = { x: cand[i].x, y: cand[i].y, w: w, h: h }; if (!colide(b)) { esc_ = cand[i]; caixas.push(b); break; } }
  if (!esc_) {
    /* nenhum livre: aceita sobreposição, mas nunca sai do SVG */
    for (i = 0; i < cand.length; i++) { if (cand[i].x >= 2 && cand[i].x + w <= W - 2) { esc_ = cand[i]; break; } }
    esc_ = esc_ || cand[0]; caixas.push({ x: esc_.x, y: esc_.y, w: w, h: h });
  }
  var tx = esc_.a === 'start' ? esc_.x : (esc_.a === 'end' ? esc_.x + w : esc_.x + w / 2);
  s += '<circle class="qm-hit" data-i="' + p.i + '" data-pk="' + esc(p.j.pk) + '" cx="' + p.px + '" cy="' + p.py + '" r="11" fill="transparent"/>';
  s += '<circle class="qm-pt" cx="' + p.px + '" cy="' + p.py + '" r="6.5" style="fill:var(--ink);stroke:var(--sup)" stroke-width="1.5" pointer-events="none"/>';
  s += '<text x="' + tx + '" y="' + (esc_.y + 10) + '" text-anchor="' + esc_.a + '" font-size="11" font-weight="600" style="fill:var(--ink);stroke:var(--sup);paint-order:stroke" stroke-width="3" pointer-events="none">' + esc(p.j.n) + '</text>';
});
s += '<text class="qm-hov" x="-50" y="-50" font-size="11" style="fill:var(--ink);stroke:var(--sup);paint-order:stroke" stroke-width="3" pointer-events="none"></text>';
s += '</svg>';

/* ---- HTML ---- */
var chips = '';
[3, 1, 2, 0].forEach(function (q) {
  chips += '<div class="qm-chip"><div class="qm-chip-n">' + glifoQ(q) + esc(QN[q]) + '</div><div class="qm-chip-v">' + cont[q] + ' <small>de ' + esc(popRot) + '</small> · ' + contD[q] + ' <small>dos ' + destOrd.length + '</small></div></div>';
});
var h = '';
h += '<div class="qm-cab"><div><h3 class="qm-tit">Mapa de quadrantes · ' + esc(D.pos) + '</h3><p class="qm-sub">Cada ponto é um jogador (' + esc(nCo + ' da coorte' + foraTxt(nFora)) + '). Direita = acima da referência do Brasil; em cima = acima da do mundo. Quanto mais longe do centro, em mais indicadores (de ' + total + ') ele está acima.</p></div><div class="qm-chips">' + chips + '</div></div>';
h += '<div class="qm-corpo"><div class="qm-mapa">' + s + '</div><div class="qm-painel"><div class="qm-det"></div><div class="qm-lista"></div></div></div>';
el.innerHTML = h;

var det = el.querySelector('.qm-det'), lista = el.querySelector('.qm-lista');
var anel = el.querySelector('.qm-anel'), hov = el.querySelector('.qm-hov');

function fmtN(v) { return v == null || isNaN(v) ? '-' : Math.round(v); }
/* valor do indicador com as casas do proprio indicador e virgula decimal */
function fmtV(v, c) { return v == null || isNaN(v) ? '–' : Number(v).toFixed(c == null ? 1 : c).replace('.', ','); }
function acima(v, r, menor) { return v != null && r != null && !isNaN(v) && !isNaN(r) && (menor ? v < r : v > r); }
function render(p) {
  var j = p.j, ig = (j.idx && j.idx.grupos) || [], x = '';
  x += '<div class="qm-det-q">' + glifo(p) + esc(QN[p.q]) + (p.dest ? ' · destacado' : ' · população') + '</div>';
  x += '<div class="qm-det-n">' + esc(j.n) + '</div>';
  x += '<div class="qm-det-m">' + esc(j.t) + ' · ' + esc(j.l) + ' · ' + esc(j.idade) + ' anos · índice geral <b>' + fmtN(j.idx && j.idx.geral) + '</b> (Brasil ' + fmtN(refBR.idx && refBR.idx.geral) + ' · mundo ' + fmtN(refMU.idx && refMU.idx.geral) + ')</div>';
  x += '<div class="qm-saldos">';
  x += '<div class="qm-saldo br"><div class="qm-saldo-t">vs referência do Brasil</div><div class="qm-saldo-v">' + num(p.br.saldo) + '</div><div class="qm-saldo-d">' + p.br.up + ' acima · ' + p.br.dn + ' abaixo' + (p.br.eq ? ' · ' + p.br.eq + ' igual' : '') + ' · de ' + p.br.n + '</div></div>';
  x += '<div class="qm-saldo mu"><div class="qm-saldo-t">vs referência do mundo</div><div class="qm-saldo-v">' + num(p.mu.saldo) + '</div><div class="qm-saldo-d">' + p.mu.up + ' acima · ' + p.mu.dn + ' abaixo' + (p.mu.eq ? ' · ' + p.mu.eq + ' igual' : '') + ' · de ' + p.mu.n + '</div></div>';
  x += '</div><div class="qm-grupos">';
  grupos.forEach(function (g, gi) {
    var vj = ig[gi], vb = iBR[gi], vm = iMU[gi];
    var cl = function (v) { return Math.max(0, Math.min(100, v == null || isNaN(v) ? 0 : v)); };
    x += '<div class="qm-g"><div class="qm-gt"><span>' + esc(g.t) + '</span><span class="qm-gc">acima <b class="br">' + p.gb[gi].up + '/' + p.gb[gi].n + '</b> · <b class="mu">' + p.gm[gi].up + '/' + p.gm[gi].n + '</b></span></div>';
    x += '<div class="qm-trk"><i class="qm-mbr" style="left:' + cl(vb) + '%"></i><i class="qm-mmu" style="left:' + cl(vm) + '%"></i><i class="qm-mj" style="left:' + cl(vj) + '%"></i></div>';
    x += '<div class="qm-gv"><span>jogador <b>' + fmtN(vj) + '</b></span><span class="br">Brasil <b>' + fmtN(vb) + '</b></span><span class="mu">mundo <b>' + fmtN(vm) + '</b></span></div>';
    /* os indicadores do grupo: valor do jogador, percentil na coorte e se passa cada referencia */
    x += '<div class="qm-ind">';
    (g.m || []).forEach(function (m) {
      var v = j.v ? j.v[m.k] : null, pc = j.p ? j.p[m.k] : null;
      var aB = acima(v, vBR[m.k], m.menor), aM = acima(v, vMU[m.k], m.menor);
      x += '<div class="qm-i' + (aM ? ' mu' : (aB ? ' br' : '')) + '" title="' + esc(m.rot + ' (' + m.un + ')' +
          ' · ref. Brasil ' + fmtV(vBR[m.k], m.casas) + ' · ref. mundo ' + fmtV(vMU[m.k], m.casas) +
          (pc != null ? ' · percentil ' + Math.round(pc) + ' na coorte' : '') + (m.menor ? ' · menor é melhor' : '')) + '">' +
        '<span class="qm-i-r">' + esc(m.rot) + '</span>' +
        '<span class="qm-i-v">' + fmtV(v, m.casas) + ' <small>' + esc(String(m.un || '').split(' · ')[0]) + (m.menor ? ' <span class="qm-i-menor" title="menor é melhor">&#8595;</span>' : '') + '</small></span>' +
        '<span class="qm-i-p">' + (pc == null ? '' : 'p' + Math.round(pc)) + '</span>' +
        '<span class="qm-i-m"><i class="br' + (aB ? ' on' : '') + '"></i><i class="mu' + (aM ? ' on' : '') + '"></i></span></div>';
    });
    x += '</div></div>';
  });
  x += '</div>';
  if (p.br.n < total || p.mu.n < total) x += '<div class="qm-nota">Faltam dados em ' + (total - Math.min(p.br.n, p.mu.n)) + ' indicador(es); o saldo usa só os comparáveis.</div>';
  det.innerHTML = x;
}
var pinned = DP.filter(function (q) { return q.j.pk === destOrd[0]; })[0] || DP[0] || P[0] || null;

function pintaLista() {
  var x = '<div class="qm-lista-t"><span>os ' + DP.length + ' em comparação' + (nFora ? ' (' + nFora + ' de fora)' : '') + '</span><span>Brasil · mundo · geral</span></div>';
  destOrd.forEach(function (pk) {
    var p = DP.filter(function (q) { return q.j.pk === pk; })[0]; if (!p) return;
    x += '<div class="qm-row' + (pinned === p ? ' sel' : '') + '" data-i="' + p.i + '" data-pk="' + esc(p.j.pk) + '"><span class="qm-row-n">' + esc(p.j.n) + '</span>' + glifo(p) + '<span class="qm-row-v br">' + num(p.br.saldo) + '</span><span class="qm-row-v mu">' + num(p.mu.saldo) + '</span><span class="qm-row-v">' + fmtN(p.j.idx && p.j.idx.geral) + '</span>' + '<b class="fs-tirar" data-tirar="' + esc(p.j.pk) + '" title="Tirar da comparação">×</b>' + '</div>';
  });
  lista.innerHTML = x;
  Array.prototype.forEach.call(lista.querySelectorAll('.qm-row'), function (r) {
    r.addEventListener('click', function () { pinned = P[+r.getAttribute('data-i')]; mostra(pinned); pintaLista(); });
    r.addEventListener('mouseenter', function () { render(P[+r.getAttribute('data-i')]); });
    r.addEventListener('mouseleave', function () { render(pinned); });
  });
}
function mostra(p) {
  render(p);
  anel.setAttribute('cx', p.px); anel.setAttribute('cy', p.py);
}
function hover(p) {
  render(p);
  if (p.dest) { hov.textContent = ''; return; }
  var dir = p.px > ml + pw * 0.7;
  hov.setAttribute('x', dir ? p.px - 9 : p.px + 9); hov.setAttribute('y', p.py + 4);
  hov.setAttribute('text-anchor', dir ? 'end' : 'start');
  hov.textContent = p.j.n;
}
Array.prototype.forEach.call(el.querySelectorAll('.qm-hit'), function (c) {
  c.addEventListener('mouseenter', function () { hover(P[+c.getAttribute('data-i')]); });
  c.addEventListener('mouseleave', function () { hov.textContent = ''; render(pinned); });
  c.addEventListener('click', function () { pinned = P[+c.getAttribute('data-i')]; mostra(pinned); pintaLista(); });
});
if (pinned) { mostra(pinned); pintaLista(); }
};

/* ---- Réguas por grupo ---- */
FS_VISOES.reguas = function (D, el) {
var esc=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};
var num=function(v,c){if(v==null||isNaN(v))return '-';return Number(v).toFixed(c==null?1:c).replace('.',',');};
/* destaque casado pela CHAVE (pk) — o nome e rotulo e tem homonimos na mesma posicao */
var G=D.grupos||[],J=D.jogadores||[],dest={};(D.destaquePks||[]).forEach(function(pk){dest[pk]=true;});
var nFora=D.nFora||0,nCo=D.n||(J.length-nFora);
var br=D.refBR||{},mu=D.refMU||{};
var refIdx=function(ref,g){var a=(ref.idx&&ref.idx.grupos)?ref.idx.grupos[g]:null;return(a==null||isNaN(a))?null:+a;};
var jIdx=function(j,g){var a=(j.idx&&j.idx.grupos)?j.idx.grupos[g]:null;return(a==null||isNaN(a))?null:+a;};
var W=1180,L=250,R=1150,RW=R-L,MAXL=8,LH=15,TOP=36,BASE=104;
var gx=function(v){return L+RW*Math.max(0,Math.min(100,v))/100;};
var COL=['var(--coral)','var(--ambar)','var(--verde)'];
var st=function(idx,g){if(idx==null)return 0;var b=refIdx(br,g),m=refIdx(mu,g);return((b!=null&&idx>b)?1:0)+((m!=null&&idx>m)?1:0);};
var wrap=function(t,n){var w=String(t||'').split(' '),ls=[],cur='';w.forEach(function(x){if(cur&&(cur+' '+x).length>n){ls.push(cur);cur=x;}else cur=cur?cur+' '+x:x;});if(cur)ls.push(cur);return ls;};
var cmp=function(v,r,ind){if(v==null||r==null||isNaN(v)||isNaN(r))return '<span class="nd">-</span>';var d=ind.menor?(r-v):(v-r);var c=ind.casas==null?1:ind.casas;if(Math.abs(d)<Math.pow(10,-c)/2)return '<span class="igual">= '+num(0,c)+'</span>';var up=d>0;return '<span class="'+(up?'cima':'baixo')+'">'+(up?'&#9650; +':'&#9660; -')+num(Math.abs(d),c)+'</span>';};
var tip=function(j,g){var gr=G[g]||{m:[]};var b=refIdx(br,g),m=refIdx(mu,g),v=jIdx(j,g);
 var h='<h4>'+esc(j.n)+'</h4><div class="sub">'+esc(j.t)+(j.l?' · '+esc(j.l):'')+(j.idade?' · '+esc(j.idade)+' anos':'')+(j.idx&&j.idx.geral!=null?' · índice geral <b>'+esc(j.idx.geral)+'</b>':'')+'</div>';
 h+='<div class="idx"><span>Índice de '+esc(gr.t)+' <b>'+(v==null?'-':v)+'</b></span><span class="br">Brasil <b>'+(b==null?'-':b)+'</b></span><span class="mu">Mundo <b>'+(m==null?'-':m)+'</b></span></div>';
 h+='<table><tr><th class="e">indicador</th><th>jogador</th><th class="br">vs Brasil</th><th class="mu">vs Mundo</th></tr>';
 (gr.m||[]).forEach(function(ind){var pv=j.v?j.v[ind.k]:null,vb=br.v?br.v[ind.k]:null,vm=mu.v?mu.v[ind.k]:null;
  h+='<tr><td>'+esc(ind.rot)+' <span class="un">'+esc(ind.un)+'</span></td><td class="v">'+num(pv,ind.casas)+'</td><td class="v">'+cmp(pv,vb,ind)+'</td><td class="v">'+cmp(pv,vm,ind)+'</td></tr>';});
 return h+'</table><div class="nota">&#9650; = melhor que a referência, na unidade do indicador (nos tempos, menor é melhor).</div>';};
var pos={};J.forEach(function(j,i){pos[i]=[];});
var rows=[],H=TOP;
G.forEach(function(gr,g){var hs=[];J.forEach(function(j,i){if(!dest[j.pk])return;var v=jIdx(j,g);if(v==null)return;hs.push({i:i,j:j,x:gx(v),v:v});});
 hs.sort(function(a,c){return a.x-c.x;});var ends=[],k,used=0;
 hs.forEach(function(h){var w=h.j.n.length*6.6+String(h.v).length*6.6+14;var left=h.x+5,anc='start',tx=h.x+5;if(left+w>W-8){anc='end';tx=h.x-5;left=h.x-5-w;}
  var lane=-1;for(k=0;k<ends.length;k++){if(left>ends[k]+10){lane=k;break;}}
  if(lane<0){if(ends.length<MAXL){lane=ends.length;ends.push(-1e9);}else{lane=0;for(k=1;k<ends.length;k++)if(ends[k]<ends[lane])lane=k;}}
  ends[lane]=left+w;h.lane=lane;h.anc=anc;h.tx=tx;if(lane+1>used)used=lane+1;});
 var lanes=Math.max(3,used),rt=H,rh=BASE+lanes*LH;rows.push({rt:rt,y0:rt+lanes*LH+30,hs:hs});H+=rh;});
H+=6;
var s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="display:block;overflow:visible">';
[0,25,50,75,100].forEach(function(t){var x=gx(t);s+='<line x1="'+x+'" y1="'+(TOP-6)+'" x2="'+x+'" y2="'+(H-6)+'" style="stroke:var(--linha);stroke-dasharray:2 5"/>';s+='<text x="'+x+'" y="'+(TOP-14)+'" text-anchor="middle" class="rg-esc">'+t+'</text>';});
s+='<text x="16" y="'+(TOP-14)+'" class="rg-esc">ÍNDICE DO GRUPO, 0 A 100 ('+esc(nCo+' '+(D.sig||''))+(nFora?' + '+nFora+' DE FORA':'')+')</text>';
G.forEach(function(gr,g){
 var rt=rows[g].rt,y0=rows[g].y0,hs=rows[g].hs;
 var b=refIdx(br,g),m=refIdx(mu,g);
 var lo=(b!=null&&m!=null)?Math.min(b,m):(b!=null?b:m),hi=(b!=null&&m!=null)?Math.max(b,m):(b!=null?b:m);
 if(g>0)s+='<line x1="0" y1="'+(rt-2)+'" x2="'+W+'" y2="'+(rt-2)+'" style="stroke:var(--linha)"/>';
 s+='<text x="16" y="'+(rt+24)+'" class="rg-tit">'+esc(gr.t)+'</text>';
 wrap(gr.d,38).slice(0,2).forEach(function(ln,k){s+='<text x="16" y="'+(rt+40+k*13)+'" class="rg-des">'+esc(ln)+'</text>';});
 var dMU=0,dBR=0,dN=0,pMU=0,pBR=0,pN=0;
 J.forEach(function(j){var v=jIdx(j,g);if(v==null)return;var aB=(b!=null&&v>b),aM=(m!=null&&v>m);if(dest[j.pk]){dN++;if(aM)dMU++;if(aB)dBR++;}else{pN++;if(aM)pMU++;if(aB)pBR++;}});
 s+='<circle cx="21" cy="'+(rt+78)+'" r="4" style="fill:var(--roxo)"/><text x="31" y="'+(rt+82)+'" class="rg-chip"><tspan class="n">'+dMU+'/'+dN+'</tspan> acima do Mundo</text>';
 s+='<circle cx="21" cy="'+(rt+97)+'" r="4" style="fill:var(--bonina)"/><text x="31" y="'+(rt+101)+'" class="rg-chip"><tspan class="n">'+dBR+'/'+dN+'</tspan> acima do Brasil</text>';
 s+='<text x="16" y="'+(rt+120)+'" class="rg-pop">demais da coorte: '+pMU+' e '+pBR+' de '+pN+'</text>';
 s+='<rect x="'+L+'" y="'+(y0-3)+'" width="'+RW+'" height="6" rx="3" style="fill:var(--trilho)"/>';
 if(lo!=null&&hi!=null){s+='<rect x="'+gx(lo)+'" y="'+(y0-3)+'" width="'+Math.max(0,gx(hi)-gx(lo))+'" height="6" style="fill:var(--sup2)"/>';s+='<rect x="'+gx(hi)+'" y="'+(y0-3)+'" width="'+Math.max(0,R-gx(hi))+'" height="6" rx="3" style="fill:var(--verde-v)"/>';}
 J.forEach(function(j,i){var v=jIdx(j,g);if(v==null)return;var x=gx(v);pos[i].push([x,y0]);
  if(!dest[j.pk])s+='<rect class="rg-tick pop" data-j="'+i+'" data-g="'+g+'" data-pk="'+esc(j.pk)+'" x="'+(x-0.75)+'" y="'+(y0-8)+'" width="1.5" height="16" style="fill:var(--ink3)"/>';});
 hs.forEach(function(h){var c=COL[st(h.v,g)],ly=y0-26-h.lane*LH;
  s+='<line class="rg-fio" data-pk="'+esc(h.j.pk)+'" x1="'+h.x+'" y1="'+(y0-16)+'" x2="'+h.x+'" y2="'+(ly+3)+'" style="stroke:'+c+';stroke-width:1;opacity:.55"/>';
  s+='<rect class="rg-tick hi" data-j="'+h.i+'" data-g="'+g+'" data-pk="'+esc(h.j.pk)+'" x="'+(h.x-1.5)+'" y="'+(y0-15)+'" width="3" height="30" rx="1" style="fill:'+c+'"/>';
  s+='<text class="rg-nome" data-j="'+h.i+'" data-g="'+g+'" data-pk="'+esc(h.j.pk)+'" x="'+h.tx+'" y="'+ly+'" text-anchor="'+h.anc+'" style="fill:'+c+'">'+esc(h.j.n)+' <tspan class="n">'+h.v+'</tspan></text>';});
 var refs=[];if(b!=null)refs.push({x:gx(b),v:b,c:'var(--bonina)',t:'Brasil',n:br.nomes||[]});if(m!=null)refs.push({x:gx(m),v:m,c:'var(--roxo)',t:'Mundo',n:mu.nomes||[]});
 refs.sort(function(a,c){return a.x-c.x;});
 refs.forEach(function(r,q){var lane=(q===1&&refs[1].x-refs[0].x<120)?1:0;var lx=Math.max(L+34,Math.min(R-34,r.x));
  s+='<rect x="'+(r.x-3)+'" y="'+(y0-21)+'" width="6" height="42" rx="2" style="fill:'+r.c+'"><title>'+esc(r.t+': '+r.n.join(', '))+'</title></rect>';
  s+='<text x="'+lx+'" y="'+(y0+38+lane*13)+'" text-anchor="middle" class="rg-ref" style="fill:'+r.c+'">'+esc(r.t)+' <tspan class="n">'+r.v+'</tspan></text>';});
});
s+='<polyline class="rg-trace" points="" style="display:none"/></svg>';
var head='<div class="rg-cab"><h3>Cinco réguas, uma por grupo físico</h3><div class="rg-refs"><b class="br">Brasil</b> = '+esc((br.nomes||[]).join(', '))+'&nbsp;&nbsp; <b class="mu">Mundo</b> = '+esc((mu.nomes||[]).join(', '))+'</div></div>';
var pl='<div class="rg-placar"><div class="rg-pl-t">Placar dos destacados, por grupo</div>';
J.forEach(function(j,i){if(!dest[j.pk])return;var cm=0,cb=0,sq='';G.forEach(function(gr,g){var v=jIdx(j,g);var b=refIdx(br,g),m=refIdx(mu,g);if(v!=null&&m!=null&&v>m)cm++;if(v!=null&&b!=null&&v>b)cb++;sq+='<i title="'+esc(gr.t)+': '+(v==null?'-':v)+'" style="background:'+COL[st(v,g)]+'"></i>';});
 pl+='<div class="rg-pc" data-j="'+i+'" data-pk="'+esc(j.pk)+'"><span class="rg-pn">'+esc(j.n)+'</span><span class="rg-sq">'+sq+'</span><span class="rg-pt"><span class="mu">Mundo <b>'+cm+'</b>/'+G.length+'</span> · <span class="br">Brasil <b>'+cb+'</b>/'+G.length+'</span></span>'+'<b class="fs-tirar" data-tirar="' + esc(j.pk) + '" title="Tirar da comparação">×</b>'+'</div>';});
pl+='</div>';
el.style.position='relative';
el.innerHTML=head+s+pl+'<div class="rg-tip"></div>';
var tipEl=el.querySelector('.rg-tip'),tr=el.querySelector('.rg-trace');
var ativa=function(i,on){var ns=el.querySelectorAll('[data-j="'+i+'"]');for(var k=0;k<ns.length;k++){if(on)ns[k].classList.add('ativo');else ns[k].classList.remove('ativo');}
 if(on&&pos[i]&&pos[i].length>1){var pts=[];pos[i].forEach(function(p){pts.push(p[0]+','+p[1]);});tr.setAttribute('points',pts.join(' '));tr.style.display='block';}else tr.style.display='none';};
var alvo=function(e){var t=e.target;while(t&&t!==el){if(t.getAttribute&&t.getAttribute('data-j')!=null)return t;t=t.parentNode;}return null;};
el.addEventListener('mouseover',function(e){var t=alvo(e);if(!t)return;var i=+t.getAttribute('data-j'),g=t.getAttribute('data-g');ativa(i,true);
 if(g!=null&&g!==''&&J[i]){tipEl.innerHTML=tip(J[i],+g);tipEl.style.display='block';}});
el.addEventListener('mousemove',function(e){if(tipEl.style.display!=='block')return;var rc=el.getBoundingClientRect();var x=e.clientX-rc.left+16,y=e.clientY-rc.top+16;var tw=tipEl.offsetWidth||420,th=tipEl.offsetHeight||220;if(x+tw>el.clientWidth-4)x=Math.max(4,e.clientX-rc.left-tw-16);if(y+th>el.clientHeight-4)y=Math.max(4,e.clientY-rc.top-th-16);tipEl.style.left=x+'px';tipEl.style.top=y+'px';});
el.addEventListener('mouseout',function(e){var t=alvo(e);if(!t)return;ativa(+t.getAttribute('data-j'),false);tipEl.style.display='none';});
};

/* ---- Tiras de população ---- */
FS_VISOES.tiras = function (D, el) {
var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
var num = function (v) { return (typeof v === 'number' && isFinite(v)) ? v : null; };
var fmt = function (v, casas) {
  if (num(v) === null) return '—';
  var s = Math.abs(v).toFixed(casas);
  var parts = s.split('.');
  var int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (v < 0 ? '-' : '') + int + (parts[1] ? ',' + parts[1] : '');
};
var hash = function (i, j) { var x = (i + 1) * 2654435761 + (j + 1) * 40503; x = (x ^ (x >>> 13)) >>> 0; return (x % 1000) / 1000; };

var J = D.jogadores || [];
var IND = D.indicadores || [];
var GR = D.grupos || [];
var refBR = (D.refBR && D.refBR.v) || {};
var refMU = (D.refMU && D.refMU.v) || {};
var destPks = D.destaquePks || [];
var nFora = D.nFora || 0, nCo = D.n || (J.length - nFora);
var CORES = ['#5cc8f2', '#f2b544', '#7bd88f', '#f27d6a', '#e9e36b', '#4fd1c5', '#c9a27e'];

// índice dos destacados (na ordem de D.destaquePks) e cor de cada um — casado pela
// CHAVE, nunca pelo nome: há homônimos na mesma posição
var destIdx = [];
var corDe = {};
var di, dj;
for (di = 0; di < destPks.length; di++) {
  for (dj = 0; dj < J.length; dj++) {
    if (J[dj].pk === destPks[di]) { destIdx.push(dj); corDe[dj] = CORES[di % CORES.length]; break; }
  }
}
var ehDest = {};
for (di = 0; di < destIdx.length; di++) ehDest[destIdx[di]] = true;

// acima da referência: maior é melhor, salvo quando menor=true
var acima = function (v, ref, menor) {
  if (num(v) === null || num(ref) === null) return null;
  return menor ? v < ref : v > ref;
};
// vantagem com sinal (positivo = melhor que a referência), em unidades do indicador
var delta = function (v, ref, menor) {
  if (num(v) === null || num(ref) === null) return null;
  return menor ? ref - v : v - ref;
};

// escala de cada indicador (melhor sempre à direita)
var W = 680, H = 34, PAD = 10;
var escalas = {};
var ii, jj;
for (ii = 0; ii < IND.length; ii++) {
  var m = IND[ii], lo = Infinity, hi = -Infinity;
  for (jj = 0; jj < J.length; jj++) { var vv = num(J[jj].v && J[jj].v[m.k]); if (vv !== null) { if (vv < lo) lo = vv; if (vv > hi) hi = vv; } }
  var rb = num(refBR[m.k]), rm = num(refMU[m.k]);
  if (rb !== null) { if (rb < lo) lo = rb; if (rb > hi) hi = rb; }
  if (rm !== null) { if (rm < lo) lo = rm; if (rm > hi) hi = rm; }
  if (!isFinite(lo) || !isFinite(hi)) { lo = 0; hi = 1; }
  if (hi === lo) { hi = lo + 1; }
  escalas[m.k] = { lo: lo, hi: hi };
}
var xDe = function (v, k, menor) {
  var s = escalas[k]; var t = (v - s.lo) / (s.hi - s.lo); if (menor) t = 1 - t;
  return PAD + t * (W - 2 * PAD);
};

// contagem por destacado: em quantos indicadores está acima do BR / do MU
var totais = {};
for (di = 0; di < destIdx.length; di++) {
  var ji = destIdx[di], cBR = 0, cMU = 0, nOk = 0;
  for (ii = 0; ii < IND.length; ii++) {
    var mk = IND[ii]; var val = num(J[ji].v && J[ji].v[mk.k]);
    if (val === null) continue;
    nOk++;
    if (acima(val, refBR[mk.k], mk.menor)) cBR++;
    if (acima(val, refMU[mk.k], mk.menor)) cMU++;
  }
  totais[ji] = { br: cBR, mu: cMU, n: nOk };
}

// ---------- cabeçalho: chips dos 7 destacados ----------
var h = '';
h += '<div class="fs-vis-tiras-topo">';
h += '<div class="fs-vis-tiras-titulo"><span class="fs-vis-tiras-pos">' + esc(D.pos) + '</span><span class="fs-vis-tiras-sub">' + esc(nCo) + ' jogadores das Séries A e B' + (nFora ? ' + ' + nFora + (nFora === 1 ? ' comparado de fora' : ' comparados de fora') : '') + ' · cada tira é um indicador, cada ponto um jogador, melhor sempre à direita</span></div>';
h += '<div class="fs-vis-tiras-chips">';
for (di = 0; di < destIdx.length; di++) {
  var jd = J[destIdx[di]], tt = totais[destIdx[di]];
  h += '<button type="button" class="fs-vis-tiras-chip" data-j="' + destIdx[di] + '" data-pk="' + esc(jd.pk) + '" style="--c:' + corDe[destIdx[di]] + '">';
  h += '<span class="fs-vis-tiras-chip-pt"></span>';
  h += '<span class="fs-vis-tiras-chip-nome">' + esc(jd.n) + '<small>' + esc(jd.t) + '</small></span>';
  h += '<span class="fs-vis-tiras-chip-ct"><b class="fs-vis-tiras-br">' + tt.br + '</b><b class="fs-vis-tiras-mu">' + tt.mu + '</b><i>de ' + tt.n + '</i></span>';
  h += '<b class="fs-tirar" data-tirar="' + esc(jd.pk) + '" title="Tirar da comparação">×</b>';
  h += '</button>';
}
h += '</div>';
h += '<div class="fs-vis-tiras-refs">';
h += '<span class="fs-vis-tiras-ref fs-vis-tiras-ref-br"><i></i>Referência Brasil <small>' + esc((D.refBR && D.refBR.nomes || []).join(' · ')) + '</small></span>';
h += '<span class="fs-vis-tiras-ref fs-vis-tiras-ref-mu"><i></i>Referência mundo <small>' + esc((D.refMU && D.refMU.nomes || []).join(' · ')) + '</small></span>';
h += '</div>';
h += '</div>';

// ---------- cabeçalho das colunas ----------
h += '<div class="fs-vis-tiras-cab"><span>Indicador</span><span class="fs-vis-tiras-cab-pior">pior</span><span class="fs-vis-tiras-cab-eixo">população inteira · melhor à direita</span><span class="fs-vis-tiras-cab-melhor">melhor</span><span class="fs-vis-tiras-cab-placar" title="Quantos dos destacados estão acima de cada referência"><b class="fs-vis-tiras-br">▲ BR</b><b class="fs-vis-tiras-mu">▲ MU</b></span></div>';

// ---------- tiras ----------
var gi, mi;
for (gi = 0; gi < GR.length; gi++) {
  var g = GR[gi];
  h += '<div class="fs-vis-tiras-grupo"><h4>' + esc(g.t) + '</h4><p>' + esc(g.d) + '</p></div>';
  for (mi = 0; mi < (g.m || []).length; mi++) {
    var md = g.m[mi], k = md.k, sc = escalas[k];
    var rb2 = num(refBR[k]), rm2 = num(refMU[k]);
    var xb = rb2 === null ? null : xDe(rb2, k, md.menor);
    var xm = rm2 === null ? null : xDe(rm2, k, md.menor);
    // placar padrão: destacados acima de cada referência
    var nBR = 0, nMU = 0, nD = 0;
    for (di = 0; di < destIdx.length; di++) {
      var vd = num(J[destIdx[di]].v && J[destIdx[di]].v[k]);
      if (vd === null) continue; nD++;
      if (acima(vd, rb2, md.menor)) nBR++;
      if (acima(vd, rm2, md.menor)) nMU++;
    }
    var esqV = md.menor ? sc.hi : sc.lo, dirV = md.menor ? sc.lo : sc.hi;

    h += '<div class="fs-vis-tiras-linha" data-k="' + esc(k) + '">';
    h += '<div class="fs-vis-tiras-rot"><span class="fs-vis-tiras-rot-n">' + esc(md.rot) + '</span><span class="fs-vis-tiras-rot-u">' + esc(md.un) + '</span></div>';
    h += '<div class="fs-vis-tiras-ext fs-vis-tiras-ext-e">' + fmt(esqV, md.casas) + '</div>';
    h += '<div class="fs-vis-tiras-tira">';
    h += '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" preserveAspectRatio="xMidYMid meet" class="fs-vis-tiras-svg">';
    h += '<defs><linearGradient id="fs-vis-tiras-g-' + esc(k) + '" x1="0" x2="1" y1="0" y2="0">';
    if (xb !== null && xm !== null && xb <= xm) {
      h += '<stop offset="0" style="stop-color:var(--bonina)"/><stop offset="1" style="stop-color:var(--roxo)"/>';
    } else {
      h += '<stop offset="0" style="stop-color:var(--roxo)"/><stop offset="1" style="stop-color:var(--bonina)"/>';
    }
    h += '</linearGradient></defs>';
    h += '<line x1="' + PAD + '" x2="' + (W - PAD) + '" y1="' + (H / 2) + '" y2="' + (H / 2) + '" style="stroke:var(--linha);stroke-width:1" vector-effect="non-scaling-stroke"/>';
    if (xb !== null && xm !== null) {
      var cx0 = Math.min(xb, xm), cx1 = Math.max(xb, xm);
      h += '<rect x="' + cx0.toFixed(1) + '" y="3" width="' + Math.max(0.5, cx1 - cx0).toFixed(1) + '" height="' + (H - 6) + '" fill="url(#fs-vis-tiras-g-' + esc(k) + ')" opacity="0.14"/>';
    }
    if (xb !== null) h += '<line class="fs-vis-tiras-lref" x1="' + xb.toFixed(1) + '" x2="' + xb.toFixed(1) + '" y1="1" y2="' + (H - 1) + '" style="stroke:var(--bonina);stroke-width:2" vector-effect="non-scaling-stroke"/>';
    if (xm !== null) h += '<line class="fs-vis-tiras-lref" x1="' + xm.toFixed(1) + '" x2="' + xm.toFixed(1) + '" y1="1" y2="' + (H - 1) + '" style="stroke:var(--roxo);stroke-width:2" vector-effect="non-scaling-stroke"/>';
    // população (35) — pontos pequenos com jitter determinístico
    var pontosDest = '';
    for (jj = 0; jj < J.length; jj++) {
      var pv = num(J[jj].v && J[jj].v[k]);
      if (pv === null) continue;
      var px = xDe(pv, k, md.menor);
      var py = H / 2 + (hash(jj, gi * 7 + mi) - 0.5) * 16;
      if (ehDest[jj]) {
        pontosDest += '<circle class="fs-vis-tiras-pt fs-vis-tiras-dest" data-j="' + jj + '" data-k="' + esc(k) + '" data-pk="' + esc(J[jj].pk) + '" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="5.5" style="fill:' + corDe[jj] + ';stroke:var(--halo);stroke-width:1.5"/>';
      } else {
        h += '<circle class="fs-vis-tiras-pt fs-vis-tiras-pop" data-j="' + jj + '" data-k="' + esc(k) + '" data-pk="' + esc(J[jj].pk) + '" cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="2.6" style="fill:var(--ink3);opacity:.65"/>';
      }
    }
    h += pontosDest;
    h += '</svg>';
    h += '</div>';
    h += '<div class="fs-vis-tiras-ext fs-vis-tiras-ext-d">' + fmt(dirV, md.casas) + '</div>';
    h += '<div class="fs-vis-tiras-placar" data-k="' + esc(k) + '">';
    h += '<span class="fs-vis-tiras-placar-padrao"><b class="fs-vis-tiras-br">' + nBR + '<i>/' + nD + '</i></b><b class="fs-vis-tiras-mu">' + nMU + '<i>/' + nD + '</i></b></span>';
    h += '<span class="fs-vis-tiras-placar-foco"></span>';
    h += '</div>';
    h += '</div>';
  }
}
h += '<div class="fs-vis-tiras-tip" hidden></div>';
el.innerHTML = h;
el.classList.add('fs-vis-tiras');

// ---------- interação ----------
var tip = el.querySelector('.fs-vis-tiras-tip');
var indPorK = {};
for (ii = 0; ii < IND.length; ii++) indPorK[IND[ii].k] = IND[ii];

var mostraTip = function (alvo, jIdx, k) {
  var jg = J[jIdx], md2 = indPorK[k]; if (!jg || !md2) return;
  var v = num(jg.v && jg.v[k]); var p = num(jg.p && jg.p[k]);
  var dB = delta(v, refBR[k], md2.menor), dM = delta(v, refMU[k], md2.menor);
  var t = '';
  t += '<div class="fs-vis-tiras-tip-n"><i style="background:' + (corDe[jIdx] || 'var(--ink3)') + '"></i>' + esc(jg.n) + '<small>' + esc(jg.t) + ' · ' + esc(jg.l) + (jg.idade ? ' · ' + esc(jg.idade) + ' anos' : '') + '</small></div>';
  t += '<div class="fs-vis-tiras-tip-v"><b>' + fmt(v, md2.casas) + '</b> <span>' + esc(md2.un) + '</span>' + (p !== null ? '<em>P' + Math.round(p) + ' na coorte</em>' : '') + '</div>';
  t += '<div class="fs-vis-tiras-tip-d">';
  t += '<span class="fs-vis-tiras-br">' + (dB === null ? '—' : (dB >= 0 ? '▲ ' : '▼ ') + fmt(Math.abs(dB), md2.casas)) + ' <small>vs Brasil</small></span>';
  t += '<span class="fs-vis-tiras-mu">' + (dM === null ? '—' : (dM >= 0 ? '▲ ' : '▼ ') + fmt(Math.abs(dM), md2.casas)) + ' <small>vs mundo</small></span>';
  t += '</div>';
  tip.innerHTML = t;
  tip.hidden = false;
  var rb3 = alvo.getBoundingClientRect(), re = el.getBoundingClientRect();
  var left = rb3.left - re.left + rb3.width / 2, top = rb3.top - re.top;
  var tw = tip.offsetWidth || 220;
  left = Math.max(8, Math.min(el.clientWidth - tw - 8, left - tw / 2));
  tip.style.left = left + 'px';
  tip.style.top = (top - tip.offsetHeight - 8) + 'px';
};
var escondeTip = function () { tip.hidden = true; };

var focoAtual = null, fixo = null;
var aplicaFoco = function (jIdx) {
  focoAtual = jIdx;
  var pts = el.querySelectorAll('.fs-vis-tiras-pt'), i;
  for (i = 0; i < pts.length; i++) {
    pts[i].classList.toggle('fs-vis-tiras-foco', jIdx !== null && +pts[i].getAttribute('data-j') === jIdx);
  }
  el.classList.toggle('fs-vis-tiras-com-foco', jIdx !== null);
  var chips = el.querySelectorAll('.fs-vis-tiras-chip');
  for (i = 0; i < chips.length; i++) chips[i].classList.toggle('fs-vis-tiras-chip-on', jIdx !== null && +chips[i].getAttribute('data-j') === jIdx);
  // placar por indicador: vantagem do jogador focado sobre cada referência
  var placares = el.querySelectorAll('.fs-vis-tiras-placar');
  for (i = 0; i < placares.length; i++) {
    var span = placares[i].querySelector('.fs-vis-tiras-placar-foco');
    if (jIdx === null) { span.innerHTML = ''; continue; }
    var k2 = placares[i].getAttribute('data-k'), md3 = indPorK[k2];
    var v2 = num(J[jIdx].v && J[jIdx].v[k2]);
    var dB2 = delta(v2, refBR[k2], md3.menor), dM2 = delta(v2, refMU[k2], md3.menor);
    var celula = function (d, cls) {
      if (d === null) return '<b class="' + cls + ' fs-vis-tiras-nd">sem dado</b>';
      return '<b class="' + cls + (d >= 0 ? ' fs-vis-tiras-up' : ' fs-vis-tiras-dn') + '">' + (d >= 0 ? '▲' : '▼') + fmt(Math.abs(d), md3.casas) + '</b>';
    };
    span.innerHTML = celula(dB2, 'fs-vis-tiras-br') + celula(dM2, 'fs-vis-tiras-mu');
  }
};

el.addEventListener('mouseover', function (ev) {
  var t = ev.target;
  if (t && t.classList && t.classList.contains('fs-vis-tiras-pt')) {
    mostraTip(t, +t.getAttribute('data-j'), t.getAttribute('data-k'));
    return;
  }
  var chip = t && t.closest ? t.closest('.fs-vis-tiras-chip') : null;
  if (chip && fixo === null) aplicaFoco(+chip.getAttribute('data-j'));
});
el.addEventListener('mouseout', function (ev) {
  var t = ev.target;
  if (t && t.classList && t.classList.contains('fs-vis-tiras-pt')) escondeTip();
  var chip = t && t.closest ? t.closest('.fs-vis-tiras-chip') : null;
  if (chip && fixo === null && !(ev.relatedTarget && chip.contains(ev.relatedTarget))) aplicaFoco(null);
});
el.addEventListener('click', function (ev) {
  var t = ev.target;
  var chip = t && t.closest ? t.closest('.fs-vis-tiras-chip') : null;
  if (chip) {
    var j = +chip.getAttribute('data-j');
    fixo = (fixo === j) ? null : j;
    aplicaFoco(fixo === null ? null : fixo);
    return;
  }
  if (t && t.classList && t.classList.contains('fs-vis-tiras-pt') && t.classList.contains('fs-vis-tiras-dest')) {
    var j2 = +t.getAttribute('data-j');
    fixo = (fixo === j2) ? null : j2;
    aplicaFoco(fixo === null ? null : fixo);
  }
});
};


/* CSS dos tres, injetado uma vez */
(function () {
  var st = document.createElement('style');
  st.id = 'fsVisoesCss';
  st.textContent = "/* Mapa de quadrantes */\n.fs-vis-mapa { font-family: Archivo, system-ui, sans-serif; color: var(--ink); }\n.fs-vis-mapa .qm-cab { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin:0 0 12px; flex-wrap:wrap; }\n.fs-vis-mapa .qm-tit { font-size:15px; font-weight:600; color:var(--ink); margin:0; }\n.fs-vis-mapa .qm-sub { font-size:12px; color:var(--ink2); margin:3px 0 0; }\n.fs-vis-mapa .qm-chips { display:flex; gap:8px; flex-wrap:wrap; }\n.fs-vis-mapa .qm-chip { display:flex; flex-direction:column; gap:2px; padding:7px 10px; border:1px solid var(--linha); border-radius:6px; background:var(--sup); min-width:132px; }\n.fs-vis-mapa .qm-chip-n { font-family:\"Archivo Narrow\", Archivo, sans-serif; text-transform:uppercase; letter-spacing:.04em; font-size:11px; color:var(--ink2); display:flex; align-items:center; gap:6px; }\n.fs-vis-mapa .qm-chip-v { font-family:\"IBM Plex Mono\", monospace; font-size:12px; color:var(--ink); }\n.fs-vis-mapa .qm-chip-v small { color:var(--ink3); font-size:11px; }\n.fs-vis-mapa .qm-gl { font-size:11px; letter-spacing:1px; white-space:nowrap; }\n.fs-vis-mapa .qm-gl .br { color:var(--bonina); }\n.fs-vis-mapa .qm-gl .mu { color:var(--roxo); }\n.fs-vis-mapa .qm-corpo { display:flex; gap:18px; align-items:flex-start; }\n.fs-vis-mapa .qm-mapa { flex:0 0 780px; max-width:780px; }\n.fs-vis-mapa .qm-mapa svg { display:block; width:100%; height:auto; }\n.fs-vis-mapa .qm-hit { cursor:pointer; }\n.fs-vis-mapa .qm-pt { transition:r .12s; }\n.fs-vis-mapa .qm-hit:hover + .qm-pt { r:7.5; }\n.fs-vis-mapa .qm-painel { flex:1 1 auto; min-width:320px; border:1px solid var(--linha); border-radius:8px; background:var(--sup); padding:14px 16px; }\n.fs-vis-mapa .qm-det-q { font-family:\"Archivo Narrow\", Archivo, sans-serif; text-transform:uppercase; letter-spacing:.05em; font-size:11px; color:var(--ink2); display:flex; align-items:center; gap:8px; }\n.fs-vis-mapa .qm-det-n { font-size:18px; font-weight:600; margin:4px 0 0; color:var(--ink); }\n.fs-vis-mapa .qm-det-m { font-size:12px; color:var(--ink2); margin:2px 0 12px; }\n.fs-vis-mapa .qm-det-m b { font-family:\"IBM Plex Mono\", monospace; font-weight:500; color:var(--ink); }\n.fs-vis-mapa .qm-saldos { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }\n.fs-vis-mapa .qm-saldo { border-top:2px solid var(--linha2); padding-top:6px; }\n.fs-vis-mapa .qm-saldo.br { border-top-color:var(--bonina); }\n.fs-vis-mapa .qm-saldo.mu { border-top-color:var(--roxo); }\n.fs-vis-mapa .qm-saldo-t { font-family:\"Archivo Narrow\", Archivo, sans-serif; text-transform:uppercase; letter-spacing:.05em; font-size:11px; color:var(--ink2); }\n.fs-vis-mapa .qm-saldo-v { font-family:\"IBM Plex Mono\", monospace; font-size:26px; line-height:1.1; font-weight:500; }\n.fs-vis-mapa .qm-saldo.br .qm-saldo-v { color:var(--bonina); }\n.fs-vis-mapa .qm-saldo.mu .qm-saldo-v { color:var(--roxo); }\n.fs-vis-mapa .qm-saldo-d { font-size:11px; color:var(--ink3); margin-top:2px; }\n.fs-vis-mapa .qm-grupos { display:flex; flex-direction:column; gap:9px; }\n.fs-vis-mapa .qm-g { display:block; }\n.fs-vis-mapa .qm-gt { display:flex; justify-content:space-between; align-items:baseline; font-family:\"Archivo Narrow\", Archivo, sans-serif; text-transform:uppercase; letter-spacing:.05em; font-size:11px; color:var(--ink2); }\n.fs-vis-mapa .qm-gc { font-family:\"IBM Plex Mono\", monospace; text-transform:none; letter-spacing:0; font-size:11px; color:var(--ink3); }\n.fs-vis-mapa .qm-gc b { font-weight:500; }\n.fs-vis-mapa .qm-gc b.br { color:var(--bonina); }\n.fs-vis-mapa .qm-gc b.mu { color:var(--roxo); }\n.fs-vis-mapa .qm-trk { position:relative; height:16px; margin:4px 0 2px; background:var(--trilho); border-radius:3px; }\n.fs-vis-mapa .qm-trk i { position:absolute; top:0; display:block; }\n.fs-vis-mapa .qm-mbr { width:2px; height:16px; margin-left:-1px; background:var(--bonina); }\n.fs-vis-mapa .qm-mmu { width:2px; height:16px; margin-left:-1px; background:var(--roxo); }\n.fs-vis-mapa .qm-mj { width:10px; height:10px; top:3px !important; margin-left:-5px; border-radius:50%; background:var(--ink); box-shadow:0 0 0 2px var(--sup); }\n.fs-vis-mapa .qm-gv { display:flex; gap:12px; font-size:11px; color:var(--ink3); }\n.fs-vis-mapa .qm-gv b { font-family:\"IBM Plex Mono\", monospace; font-weight:500; color:var(--ink); }\n.fs-vis-mapa .qm-gv .br b { color:var(--bonina); }\n.fs-vis-mapa .qm-gv .mu b { color:var(--roxo); }\n.fs-vis-mapa .qm-lista { margin-top:14px; border-top:1px solid var(--linha); padding-top:8px; }\n.fs-vis-mapa .qm-lista-t { font-family:\"Archivo Narrow\", Archivo, sans-serif; text-transform:uppercase; letter-spacing:.05em; font-size:11px; color:var(--ink3); margin-bottom:4px; display:flex; justify-content:space-between; }\n.fs-vis-mapa .qm-row { display:grid; grid-template-columns:1fr auto 40px 40px 34px; gap:8px; align-items:center; padding:4px 6px; margin:0 -6px; border-radius:4px; cursor:pointer; font-size:12px; }\n.fs-vis-mapa .qm-row:hover { background:var(--sup2); }\n.fs-vis-mapa .qm-row.sel { background:var(--sup2); box-shadow:inset 2px 0 0 var(--ambar); }\n.fs-vis-mapa .qm-row-n { color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }\n.fs-vis-mapa .qm-row-v { font-family:\"IBM Plex Mono\", monospace; font-size:12px; text-align:right; }\n.fs-vis-mapa .qm-row-v.br { color:var(--bonina); }\n.fs-vis-mapa .qm-row-v.mu { color:var(--roxo); }\n.fs-vis-mapa .qm-row-v:not(.br):not(.mu) { color:var(--ink3); }\n.fs-vis-mapa .qm-nota { font-size:11px; color:var(--ink3); margin-top:10px; line-height:1.4; }\n.fs-vis-mapa .qm-ind { display:grid; grid-template-columns:repeat(auto-fit, minmax(230px, 1fr)); gap:1px 14px; margin-top:5px; }\n.fs-vis-mapa .qm-i { display:grid; grid-template-columns:minmax(0,1fr) auto 30px 22px; align-items:center; gap:6px; min-width:0; font-size:10.5px; line-height:1.55; padding:0 5px; border-radius:3px; }\n.fs-vis-mapa .qm-i.br { background:var(--bonina-v); }\n.fs-vis-mapa .qm-i.mu { background:var(--roxo-v); }\n.fs-vis-mapa .qm-i-r { color:var(--ink2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }\n.fs-vis-mapa .qm-i-v { font-family:\"IBM Plex Mono\", monospace; color:var(--ink); white-space:nowrap; }\n.fs-vis-mapa .qm-i-v small { font-size:10px; color:var(--ink3); }\n.fs-vis-mapa .qm-i-menor { color:var(--ink3); font-size:10px; }\n.fs-vis-mapa .qm-i-p { font-family:\"IBM Plex Mono\", monospace; font-size:10px; color:var(--ink3); text-align:right; }\n.fs-vis-mapa .qm-i-m { display:flex; gap:3px; justify-content:flex-end; }\n.fs-vis-mapa .qm-i-m i { display:block; width:8px; height:8px; border-radius:50%; border:1px solid var(--linha2); box-sizing:border-box; }\n.fs-vis-mapa .qm-i-m i.br.on { background:var(--bonina); border-color:var(--bonina); }\n.fs-vis-mapa .qm-i-m i.mu.on { background:var(--roxo); border-color:var(--roxo); }\n/* jogador em foco (classe posta pelo app em todo elemento com o data-pk dele) */\n.fs-vis-mapa .qm-hit.foco { stroke:var(--coral); stroke-width:3px; }\n.fs-vis-mapa .qm-row.foco { box-shadow:inset 0 0 0 1.5px var(--coral); }\n/* Réguas por grupo */\n.fs-vis-reguas{position:relative;font-family:Archivo,system-ui,sans-serif;color:var(--ink);background:var(--fundo)}\n.fs-vis-reguas .rg-cab{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:4px 16px 10px;flex-wrap:wrap}\n.fs-vis-reguas .rg-cab h3{margin:0;font-size:15px;font-weight:600;letter-spacing:-.01em}\n.fs-vis-reguas .rg-refs{font-size:11.5px;color:var(--ink3)}\n.fs-vis-reguas .rg-refs b,.fs-vis-reguas .rg-pt b{font-weight:600}\n.fs-vis-reguas .br{color:var(--bonina)}\n.fs-vis-reguas .mu{color:var(--roxo)}\n.fs-vis-reguas svg text{font-family:Archivo,system-ui,sans-serif;fill:var(--ink);font-size:11px}\n.fs-vis-reguas .rg-esc{font-family:\"IBM Plex Mono\",monospace;font-size:10px;fill:var(--ink3);letter-spacing:.04em}\n.fs-vis-reguas .rg-tit{font-family:\"Archivo Narrow\",Archivo,sans-serif;font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;fill:var(--ink)}\n.fs-vis-reguas .rg-des{font-size:11px;fill:var(--ink3)}\n.fs-vis-reguas .rg-chip{font-size:11px;fill:var(--ink2)}\n.fs-vis-reguas .rg-chip .n{font-family:\"IBM Plex Mono\",monospace;font-weight:600;font-size:11.5px;fill:var(--ink)}\n.fs-vis-reguas .rg-pop{font-size:10.5px;fill:var(--ink3)}\n.fs-vis-reguas .rg-nome{font-size:11.5px;font-weight:600;cursor:default;paint-order:stroke;stroke:var(--fundo);stroke-width:3px;stroke-linejoin:round}\n.fs-vis-reguas .rg-nome .n{font-family:\"IBM Plex Mono\",monospace;font-weight:500;font-size:10.5px;fill:var(--ink3)}\n.fs-vis-reguas .rg-ref{font-family:\"Archivo Narrow\",Archivo,sans-serif;font-size:10.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase}\n.fs-vis-reguas .rg-ref .n{font-family:\"IBM Plex Mono\",monospace;font-size:11px;letter-spacing:0}\n.fs-vis-reguas .rg-tick{cursor:default}\n.fs-vis-reguas .rg-tick.pop{opacity:.7}\n.fs-vis-reguas .rg-tick.pop.ativo{opacity:1;fill:var(--ink)!important}\n.fs-vis-reguas .rg-tick.hi.ativo{stroke:var(--ink);stroke-width:2px}\n.fs-vis-reguas text.rg-nome.ativo{text-decoration:underline;text-underline-offset:2px}\n.fs-palco.fs-vis-reguas svg text.rg-nome.foco{stroke:var(--fundo)!important;stroke-width:3px!important;fill:var(--coral)!important;text-decoration:underline;text-underline-offset:2px}\n.fs-palco.fs-vis-reguas svg .rg-tick.foco{stroke:var(--coral)!important;stroke-width:3px!important}\n.fs-palco.fs-vis-reguas svg .rg-fio.foco{stroke:var(--coral)!important;stroke-width:2px!important;opacity:1}\n.fs-vis-reguas .rg-pc.foco{border-color:var(--coral);box-shadow:inset 0 0 0 1px var(--coral)}\n.fs-vis-reguas .rg-trace{fill:none;stroke:var(--ink);stroke-width:1.2;stroke-dasharray:3 3;opacity:.7;pointer-events:none}\n.fs-vis-reguas .rg-placar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:12px 16px 6px;margin-top:8px;border-top:1px solid var(--linha)}\n.fs-vis-reguas .rg-pl-t{flex:0 0 100%;font-family:\"Archivo Narrow\",Archivo,sans-serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);margin-bottom:2px}\n.fs-vis-reguas .rg-pc{display:flex;align-items:center;gap:9px;padding:6px 10px;border:1px solid var(--linha);border-radius:6px;background:var(--sup);cursor:default}\n.fs-vis-reguas .rg-pc.ativo{border-color:var(--ink3);background:var(--sup2)}\n.fs-vis-reguas .rg-pn{font-size:11.5px;font-weight:600}\n.fs-vis-reguas .rg-sq{display:flex;gap:3px}\n.fs-vis-reguas .rg-sq i{display:block;width:10px;height:10px;border-radius:2px}\n.fs-vis-reguas .rg-pt{font-family:\"IBM Plex Mono\",monospace;font-size:10.5px;color:var(--ink3)}\n.fs-vis-reguas .rg-tip{position:absolute;z-index:9;display:none;pointer-events:none;min-width:380px;max-width:480px;padding:10px 12px 8px;background:var(--sup);border:1px solid var(--linha2);border-radius:8px;box-shadow:0 10px 28px rgba(0,0,0,.5);font-size:11.5px;color:var(--ink)}\n.fs-vis-reguas .rg-tip h4{margin:0 0 2px;font-size:13px;font-weight:600}\n.fs-vis-reguas .rg-tip .sub{color:var(--ink3);font-size:11px}\n.fs-vis-reguas .rg-tip .sub b{color:var(--ink);font-weight:600}\n.fs-vis-reguas .rg-tip .idx{display:flex;gap:14px;margin:6px 0 8px;font-size:11px;color:var(--ink2)}\n.fs-vis-reguas .rg-tip .idx b{font-family:\"IBM Plex Mono\",monospace;font-size:12px;font-weight:600}\n.fs-vis-reguas .rg-tip table{border-collapse:collapse;width:100%}\n.fs-vis-reguas .rg-tip th{font-family:\"Archivo Narrow\",Archivo,sans-serif;font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3);text-align:right;padding:0 0 4px 10px;border-bottom:1px solid var(--linha)}\n.fs-vis-reguas .rg-tip th.e{text-align:left;padding-left:0}\n.fs-vis-reguas .rg-tip td{padding:3px 0 3px 10px;border-bottom:1px solid var(--linha);vertical-align:baseline}\n.fs-vis-reguas .rg-tip td:first-child{padding-left:0}\n.fs-vis-reguas .rg-tip td.v{font-family:\"IBM Plex Mono\",monospace;text-align:right;white-space:nowrap}\n.fs-vis-reguas .rg-tip .un{color:var(--ink3);font-size:10px}\n.fs-vis-reguas .rg-tip .cima{color:var(--verde)}\n.fs-vis-reguas .rg-tip .baixo{color:var(--coral)}\n.fs-vis-reguas .rg-tip .igual,.fs-vis-reguas .rg-tip .nd{color:var(--ink3)}\n.fs-vis-reguas .rg-tip .nota{margin-top:6px;font-size:10px;color:var(--ink3)}\n/* Tiras de população */\n.fs-vis-tiras { position: relative; font-family: Archivo, system-ui, sans-serif; color: var(--ink); background: var(--fundo); }\n.fs-vis-tiras * { box-sizing: border-box; }\n\n/* topo */\n.fs-vis-tiras .fs-vis-tiras-topo { padding: 4px 0 14px; border-bottom: 1px solid var(--linha); margin-bottom: 8px; }\n.fs-vis-tiras .fs-vis-tiras-titulo { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }\n.fs-vis-tiras .fs-vis-tiras-pos { font-family: \"Archivo Narrow\", Archivo, sans-serif; text-transform: uppercase; letter-spacing: .08em; font-size: 12px; color: var(--ink2); }\n.fs-vis-tiras .fs-vis-tiras-sub { font-size: 12px; color: var(--ink3); }\n.fs-vis-tiras .fs-vis-tiras-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }\n.fs-vis-tiras .fs-vis-tiras-chip { display: flex; align-items: center; gap: 8px; padding: 6px 10px 6px 8px; border: 1px solid var(--linha); border-radius: 8px; background: var(--sup); color: var(--ink); cursor: pointer; font: inherit; text-align: left; transition: border-color .12s, background .12s; }\n.fs-vis-tiras .fs-vis-tiras-chip:hover, .fs-vis-tiras .fs-vis-tiras-chip.fs-vis-tiras-chip-on { border-color: var(--c); background: var(--sup2); }\n.fs-vis-tiras .fs-vis-tiras-chip.fs-vis-tiras-chip-on { box-shadow: inset 0 0 0 1px var(--c); }\n.fs-vis-tiras .fs-vis-tiras-chip-pt { width: 11px; height: 11px; border-radius: 50%; background: var(--c); flex: none; box-shadow: 0 0 0 1.5px var(--halo); }\n.fs-vis-tiras .fs-vis-tiras-chip-nome { display: flex; flex-direction: column; line-height: 1.15; font-size: 12px; font-weight: 600; }\n.fs-vis-tiras .fs-vis-tiras-chip-nome small { font-weight: 400; font-size: 10px; color: var(--ink3); }\n.fs-vis-tiras .fs-vis-tiras-chip-ct { display: flex; align-items: baseline; gap: 5px; margin-left: 4px; padding-left: 8px; border-left: 1px solid var(--linha); font-family: \"IBM Plex Mono\", monospace; font-size: 12px; }\n.fs-vis-tiras .fs-vis-tiras-chip-ct b { font-weight: 600; }\n.fs-vis-tiras .fs-vis-tiras-chip-ct i { font-style: normal; font-size: 10px; color: var(--ink3); }\n.fs-vis-tiras .fs-vis-tiras-br { color: var(--bonina); }\n.fs-vis-tiras .fs-vis-tiras-mu { color: var(--roxo); }\n.fs-vis-tiras .fs-vis-tiras-refs { display: flex; gap: 22px; flex-wrap: wrap; font-size: 11px; color: var(--ink2); }\n.fs-vis-tiras .fs-vis-tiras-ref { display: inline-flex; align-items: center; gap: 7px; }\n.fs-vis-tiras .fs-vis-tiras-ref i { width: 2px; height: 14px; border-radius: 1px; display: inline-block; }\n.fs-vis-tiras .fs-vis-tiras-ref-br i { background: var(--bonina); }\n.fs-vis-tiras .fs-vis-tiras-ref-mu i { background: var(--roxo); }\n.fs-vis-tiras .fs-vis-tiras-ref small { color: var(--ink3); font-size: 10px; }\n\n/* grade das tiras */\n.fs-vis-tiras .fs-vis-tiras-cab, .fs-vis-tiras .fs-vis-tiras-linha { display: grid; grid-template-columns: 230px 56px minmax(0, 1fr) 56px 120px; gap: 0 10px; align-items: center; }\n.fs-vis-tiras .fs-vis-tiras-cab { font-family: \"Archivo Narrow\", Archivo, sans-serif; text-transform: uppercase; letter-spacing: .08em; font-size: 10px; color: var(--ink3); padding: 4px 0 6px; position: sticky; top: 0; background: var(--fundo); z-index: 2; border-bottom: 1px solid var(--linha); }\n.fs-vis-tiras .fs-vis-tiras-cab-pior { text-align: right; }\n.fs-vis-tiras .fs-vis-tiras-cab-eixo { text-align: center; }\n.fs-vis-tiras .fs-vis-tiras-cab-melhor { color: var(--ink2); }\n.fs-vis-tiras .fs-vis-tiras-cab-placar { display: flex; gap: 10px; justify-content: flex-end; }\n.fs-vis-tiras .fs-vis-tiras-cab-placar b { font-weight: 600; }\n.fs-vis-tiras .fs-vis-tiras-grupo { display: flex; align-items: baseline; gap: 10px; padding: 16px 0 4px; }\n.fs-vis-tiras .fs-vis-tiras-grupo h4 { margin: 0; font-family: \"Archivo Narrow\", Archivo, sans-serif; text-transform: uppercase; letter-spacing: .1em; font-size: 12px; color: var(--ink); font-weight: 600; }\n.fs-vis-tiras .fs-vis-tiras-grupo p { margin: 0; font-size: 11px; color: var(--ink3); }\n.fs-vis-tiras .fs-vis-tiras-linha { border-top: 1px solid var(--linha2); }\n.fs-vis-tiras .fs-vis-tiras-linha:hover { background: var(--sup); }\n.fs-vis-tiras .fs-vis-tiras-rot { display: flex; flex-direction: column; line-height: 1.15; padding: 2px 0; }\n.fs-vis-tiras .fs-vis-tiras-rot-n { font-size: 12px; color: var(--ink); }\n.fs-vis-tiras .fs-vis-tiras-rot-u { font-family: \"Archivo Narrow\", Archivo, sans-serif; text-transform: uppercase; letter-spacing: .06em; font-size: 10px; color: var(--ink3); }\n.fs-vis-tiras .fs-vis-tiras-ext { font-family: \"IBM Plex Mono\", monospace; font-size: 10px; color: var(--ink3); white-space: nowrap; }\n.fs-vis-tiras .fs-vis-tiras-ext-e { text-align: right; }\n.fs-vis-tiras .fs-vis-tiras-tira { min-width: 0; }\n.fs-vis-tiras .fs-vis-tiras-svg { display: block; width: 100%; height: auto; overflow: visible; }\n.fs-vis-tiras .fs-vis-tiras-pt { cursor: pointer; transition: opacity .12s; }\n.fs-palco.fs-vis-tiras svg .fs-vis-tiras-pt.foco { stroke: var(--coral) !important; stroke-width: 3px !important; opacity: 1 !important; }\n.fs-vis-tiras .fs-vis-tiras-chip.foco { outline: 2px solid var(--coral); outline-offset: 1px; }\n.fs-vis-tiras .fs-vis-tiras-pop:hover { opacity: 1 !important; }\n.fs-vis-tiras .fs-vis-tiras-dest:hover { stroke-width: 2.5 !important; }\n.fs-vis-tiras.fs-vis-tiras-com-foco .fs-vis-tiras-dest { opacity: .22; }\n.fs-vis-tiras.fs-vis-tiras-com-foco .fs-vis-tiras-dest.fs-vis-tiras-foco { opacity: 1; r: 7; stroke-width: 2.5 !important; }\n.fs-vis-tiras.fs-vis-tiras-com-foco .fs-vis-tiras-pop { opacity: .35 !important; }\n.fs-vis-tiras .fs-vis-tiras-placar { display: flex; justify-content: flex-end; font-family: \"IBM Plex Mono\", monospace; font-size: 12px; }\n.fs-vis-tiras .fs-vis-tiras-placar span { display: flex; gap: 10px; justify-content: flex-end; }\n.fs-vis-tiras .fs-vis-tiras-placar b { font-weight: 600; min-width: 42px; text-align: right; white-space: nowrap; }\n.fs-vis-tiras .fs-vis-tiras-placar b i { font-style: normal; font-size: 10px; color: var(--ink3); }\n.fs-vis-tiras .fs-vis-tiras-placar-foco { display: none; }\n.fs-vis-tiras.fs-vis-tiras-com-foco .fs-vis-tiras-placar-padrao { display: none; }\n.fs-vis-tiras.fs-vis-tiras-com-foco .fs-vis-tiras-placar-foco { display: flex; }\n.fs-vis-tiras .fs-vis-tiras-placar b.fs-vis-tiras-dn { opacity: .55; }\n.fs-vis-tiras .fs-vis-tiras-placar b.fs-vis-tiras-nd { font-size: 10px; color: var(--ink3); opacity: .7; }\n\n/* tooltip */\n.fs-vis-tiras .fs-vis-tiras-tip { position: absolute; z-index: 5; pointer-events: none; min-width: 200px; max-width: 280px; padding: 8px 10px; background: var(--sup2); border: 1px solid var(--linha2); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.45); font-size: 12px; color: var(--ink); }\n.fs-vis-tiras .fs-vis-tiras-tip-n { display: flex; align-items: center; gap: 7px; font-weight: 600; flex-wrap: wrap; }\n.fs-vis-tiras .fs-vis-tiras-tip-n i { width: 9px; height: 9px; border-radius: 50%; flex: none; }\n.fs-vis-tiras .fs-vis-tiras-tip-n small { width: 100%; font-weight: 400; font-size: 10px; color: var(--ink3); padding-left: 16px; }\n.fs-vis-tiras .fs-vis-tiras-tip-v { margin-top: 6px; font-family: \"IBM Plex Mono\", monospace; display: flex; align-items: baseline; gap: 5px; flex-wrap: wrap; }\n.fs-vis-tiras .fs-vis-tiras-tip-v b { font-size: 15px; font-weight: 600; }\n.fs-vis-tiras .fs-vis-tiras-tip-v span { font-size: 10px; color: var(--ink3); }\n.fs-vis-tiras .fs-vis-tiras-tip-v em { font-style: normal; font-size: 10px; color: var(--ink2); margin-left: auto; }\n.fs-vis-tiras .fs-vis-tiras-tip-d { margin-top: 6px; display: flex; gap: 12px; font-family: \"IBM Plex Mono\", monospace; font-size: 12px; }\n.fs-vis-tiras .fs-vis-tiras-tip-d small { font-family: Archivo, sans-serif; font-size: 10px; color: var(--ink3); }";
  document.head.appendChild(st);
})();
