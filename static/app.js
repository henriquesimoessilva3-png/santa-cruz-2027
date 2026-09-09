/* Santa Cruz 2027 - Montagem de Elenco */
'use strict';

/* ---------------- configuracao das posicoes ---------------- */
const VAGAS_PADRAO = 3;
const POSICOES = [
  { c:'GOL', nome:'Goleiro',           setor:'gol',    faixa:'gol' },
  { c:'LE',  nome:'Lateral Esquerdo',  setor:'defesa', faixa:'defesa' },
  { c:'ZE',  nome:'Zagueiro Esquerdo', setor:'defesa', faixa:'defesa' },
  { c:'ZD',  nome:'Zagueiro Direito',  setor:'defesa', faixa:'defesa' },
  { c:'LD',  nome:'Lateral Direito',   setor:'defesa', faixa:'defesa' },
  { c:'VOL', nome:'Volante',           setor:'meio',   faixa:'meio' },
  { c:'MED', nome:'Médio',             setor:'meio',   faixa:'meio' },
  { c:'MEI', nome:'Meia',              setor:'meio',   faixa:'meia' },
  { c:'EE',  nome:'Extremo Esquerdo',  setor:'ataque', faixa:'ataque' },
  { c:'CA',  nome:'Atacante',          setor:'ataque', faixa:'ataque' },
  { c:'ED',  nome:'Extremo Direito',   setor:'ataque', faixa:'ataque' },
];
/* Layout do campograma. No campo deitado cada coluna empilha as suas posicoes e o
   conjunto fica centrado na vertical; no campo em pe cada linha distribui as posicoes
   na horizontal. As alturas saem dos cards de verdade — nao sobra vao nem falta espaco. */
const LAYOUT = {
  /* Campo deitado: os laterais ficam a frente dos zagueiros e abertos nas pontas
     (espalhar), e os extremos a frente do meia, tambem abertos. */
  horizontal: [
    /* as colunas centradas ficam igualmente espacadas de 10% a 90%: sao elas que
       disputam a faixa do meio, e esse vao define o tamanho do card. As abertas
       entram no meio do caminho, sem brigar por espaco (ficam no topo e na base). */
    { x: 8,  pos: ['GOL'] },
    { x: 29, pos: ['ZE', 'ZD'] },
    { x: 40, pos: ['LE', 'LD'], espalhar: true },
    { x: 50, pos: ['VOL', 'MED'] },
    { x: 71, pos: ['MEI'] },
    { x: 81, pos: ['EE', 'ED'], espalhar: true },
    { x: 92, pos: ['CA'] },
  ],
  vertical: [
    { pos: ['EE', 'CA', 'ED'], xs: [14, 50, 86] },
    { pos: ['MEI'], xs: [50] },
    { pos: ['VOL', 'MED'], xs: [30, 70] },
    { pos: ['LE', 'LD'], xs: [8, 92] },
    { pos: ['ZE', 'ZD'], xs: [34, 66] },
    { pos: ['GOL'], xs: [50] },
  ],
};
const GAP_CARD = 18;      /* respiro entre cards empilhados */
const MARGEM_CAMPO = 12;  /* respiro para as linhas do gramado */
const SETORES = [
  { c:'gol',    nome:'Goleiros', cor:'#f5a524' },
  { c:'defesa', nome:'Defesa',   cor:'#3b82f6' },
  { c:'meio',   nome:'Meio',     cor:'#a855f7' },
  { c:'ataque', nome:'Ataque',   cor:'#22c55e' },
];
const STATUS = ['alvo','negociando','fechado','elenco'];
const STATUS_ROT = { alvo:'Alvo', negociando:'Negociando', fechado:'Fechado', elenco:'Elenco atual' };

const GRUPOS_LIGA = {
  brasil:    ['Brasil A','Brasil B','Brasil C'],
  brasilbc:  ['Brasil B','Brasil C'],
  sulamerica:['Argentina A','Argentina B','Argentina RESERVAS','Uruguai','Paraguai','Chile',
              'Bolivia','Peru','Equador A','Equador B','Colombia A','Colombia B','Venezuela'],
  europa:    ['Portugal A','Portugal B','Portugal C','Espanha A','Espanha B','Espanha C',
              'Italia A','Italia B','Italia C','Inglaterra A','Inglaterra B','Alemanha A','Alemanha B',
              'França A','França B','Holanda','Belgica A','Belgica B','Suiça','Austria','Grecia',
              'Polonia','Tcheca','Croacia','Servia','Romenia','Bulgaria','Hungria','Eslovaquia',
              'Dinamarca','Noruega','Suecia','Escocia','Turquia','Ucrania','Russia'],
};

/* nome do pais -> sigla curta para o selo no card */
const SIGLA_PAIS = {
  Argentina:'ARG', Uruguay:'URU', Colombia:'COL', Chile:'CHI', Paraguay:'PAR',
  Peru:'PER', Ecuador:'EQU', Bolivia:'BOL', Venezuela:'VEN', Portugal:'POR',
  Spain:'ESP', Italy:'ITA', France:'FRA', Germany:'ALE', England:'ING',
  Netherlands:'HOL', Belgium:'BEL', Nigeria:'NGA', Ghana:'GAN', Japan:'JAP',
  'Korea Republic':'COR', Mexico:'MEX', 'United States':'EUA', Angola:'ANG',
  'Cape Verde':'CPV', Senegal:'SEN', Morocco:'MAR', Ukraine:'UCR', Russia:'RUS',
  Serbia:'SER', Croatia:'CRO', Poland:'POL', Romania:'ROM', Sweden:'SUE',
  Norway:'NOR', Denmark:'DIN', Switzerland:'SUI', Austria:'AUT', Greece:'GRE',
  Turkey:'TUR', Israel:'ISR', Australia:'AUS', Canada:'CAN', Guinea:'GUI',
  'Ivory Coast':'CIV', Cameroon:'CAM', Mali:'MAL', Algeria:'ARG.', Tunisia:'TUN',
};

/* ---------------- estado ---------------- */
const CHAVE_LOCAL = 'sc2027_estado';
const VERSAO = 4;  /* v2: campo deitado · v3: compacto · v4: limite de 9 estrangeiros */
let BASE = [];
/* Historico de tres temporadas (dados/historico.json, gerado por preparar_historico.py),
   indexado pela primary_key da temporada corrente. Vem em arquivo separado porque so
   ~18 mil dos 40 mil jogadores da base tem passagem pelo Wyscout. */
let HIST = { temporadas: [], jogadores: {} };
const MIN_TEMPORADA = 3400;   /* ~38 jogos x 90: a referencia de "temporada inteira" */
/* Quantos gols numa temporada ja a tornam "goleadora" para a conta de recorrencia.
   Fica aqui em cima, e nao junto de RANGES_FC, porque FC_COLUNAS le esta constante
   ao ser montada — `const` mais abaixo no arquivo daria erro de TDZ e derrubaria a
   tela inteira (ja aconteceu com a VERSAO). */
const GOLS_TEMPORADA = 5;

/* As tres temporadas do jogador, sempre com o mesmo tamanho da lista de temporadas
   (posicoes sem dado vem nulas), ou null quando ele nao tem historico nenhum. */
function hist(pk) {
  return (pk && HIST.jogadores[pk]) || null;
}
function histDoElenco(j) {
  return hist(j && j.pk);
}
/* Somas e recorrencia. `golsMin` e o que conta como "temporada goleadora". */
function histResumo(pk, golsMin) {
  const h = hist(pk);
  if (!h) return null;
  const soma = k => h.reduce((s, x) => s + ((x && x[k]) || 0), 0);
  const atual = h[h.length - 1] || null;
  return {
    temporadas: h.filter(Boolean).length,
    min: soma('min'), jogos: soma('j'), gols: soma('g'), assist: soma('a'), cabeca: soma('gc'),
    /* em quantas temporadas ele fez pelo menos `golsMin` gols */
    goleadoras: h.filter(x => x && (x.g || 0) >= (golsMin || 5)).length,
    /* cobrancas por 90 na temporada corrente: escanteio + falta, mesma escala */
    cobrancas: atual ? Math.round(((atual.esc || 0) + (atual.fal || 0)) * 100) / 100 : null,
    penaltis: soma('pen'),
  };
}
let estado = novoEstado();
let posAtual = null;
let ordem = { campo:'ov', desc:true };
let filtroGrupo = 'brasil';
let resultado = [];

function novoEstado() {
  const el = {};
  POSICOES.forEach(p => { el[p.c] = []; });
  return {
    id: null, nome: 'Grupo 1',
    teto: 2800000,      // custo total mensal maximo (ja com encargos e comissao)
    comissao: 300000,   // custo mensal da comissao tecnica
    fator: 1.25,        // custo do clube = salario do jogador x fator
    limiteEstrangeiros: 9,
    cotacaoEuro: 6.3,
    ct: { detalhar: false, encargos: true, itens: [] },
    orientacao: 'horizontal', denso: true, tema: 'escuro', ajustar: true, v: VERSAO,
    metas: { gol:8, defesa:27, meio:30, ataque:35 },
    alvoAtletas: {}, elenco: el,
  };
}

/* ---------------- utilidades ---------------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function brl(n, curto) {
  n = Number(n) || 0;
  if (curto && Math.abs(n) >= 1000) {
    return 'R$ ' + (n / 1000).toFixed(Math.abs(n) >= 100000 ? 0 : 1).replace('.', ',') + 'k';
  }
  return 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}
function milhar(n) { return (Number(n) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 }); }

function paraDecimal(txt) {
  const n = parseFloat(String(txt == null ? '' : txt).replace(',', '.').replace(/[^\d.]/g, ''));
  return isNaN(n) ? 0 : n;
}
function paraNumero(txt) {
  if (txt === null || txt === undefined) return 0;
  let s = String(txt).toLowerCase().trim().replace(/r\$/g, '').replace(/\s/g, '');
  let mult = 1;
  if (/mil$/.test(s)) { mult = 1000; s = s.replace(/mil$/, ''); }
  else if (/k$/.test(s)) { mult = 1000; s = s.replace(/k$/, ''); }
  else if (/(mm|mi|milhao|milhões|milhoes)$/.test(s)) { mult = 1e6; s = s.replace(/(mm|mi|milhao|milhões|milhoes)$/, ''); }
  s = s.replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
  const n = parseFloat(s.replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : Math.round(n * mult);
}
function uid() { return Math.random().toString(36).slice(2, 10); }

/* Quantos caracteres cabem no nome. Medido em pixels: o que nao e nome (salario,
   botoes e respiro) ocupa ~118px, e a estrela de titular e o selo de estrangeiro
   comem 9 e 29px. Antes a conta era por caractere e superestimava. */
let larguraCardPx = 190, larguraCardAberto = 190;
const NAO_NOME = 137, PX_ESTRELA = 9, PX_SELO = 29, PX_CHAR = 5.4;

function limiteNome(j, cod) {
  const fz = parseFloat(($('#campo') && $('#campo').style.getPropertyValue('--fz')) || 1) || 1;
  const larg = COLUNA_ABERTA.has(cod) ? larguraCardAberto : larguraCardPx;
  const util = larg - NAO_NOME * fz -
               (j && j.titular ? PX_ESTRELA : 0) - (j && j.estrangeiro ? PX_SELO : 0);
  return Math.max(6, Math.floor(util / (PX_CHAR * fz)));
}

/* Nome curto para o card: abrevia o primeiro nome quando o inteiro nao cabe numa
   linha — "Matheus Trindade" vira "M. Trindade", como na sumula. */
function nomeCurto(nome, limite) {
  const n = String(nome || '').trim();
  if (n.length <= (limite || 14)) return n;
  const partes = n.split(/\s+/);
  if (partes.length < 2) return n;
  const resto = partes.slice(1).join(' ');
  const abrev = partes[0][0].toUpperCase() + '. ' + resto;
  if (abrev.length <= (limite || 14)) return abrev;
  /* ainda longo: mantem o primeiro e o ultimo sobrenome */
  return partes[0][0].toUpperCase() + '. ' + partes[partes.length - 1];
}

let tToast;
function toast(msg, tipo) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast on' + (tipo ? ' ' + tipo : '');
  clearTimeout(tToast);
  tToast = setTimeout(() => { t.className = 'toast' + (tipo ? ' ' + tipo : ''); }, 2600);
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

/* ---------------- estrangeiros ---------------- */
/* estrangeiro = nao nasceu no Brasil e nao tem passaporte brasileiro.
   quem tem passaporte BR nao ocupa vaga de estrangeiro na inscricao. */
function ehEstrangeiroBase(j) {
  const nac = (j.nac || '').trim();
  const psp = (j.psp || '');
  if (!nac) return false;
  if (nac === 'Brazil') return false;
  if (/Brazil/i.test(psp)) return false;
  return true;
}
function sigla(pais) {
  if (!pais) return 'EX';
  return SIGLA_PAIS[pais] || pais.slice(0, 3).toUpperCase();
}
function contaEstrangeiros() { return todosJogadores().filter(j => j.estrangeiro).length; }

/* ---------------- calculos de orcamento ---------------- */
/* teto = custo total do clube com futebol (jogadores + comissao, ja com encargos)
   dispSalarios = quanto sobra para pagar de salario liquido aos jogadores    */
/* ---------------- comissao tecnica ---------------- */
const CT_PADRAO = [
  ['Técnico', 120000], ['Auxiliar técnico', 25000], ['Preparador físico', 22000],
  ['Auxiliar de preparação física', 9000], ['Preparador de goleiros', 12000],
  ['Analista de desempenho', 11000], ['Auxiliar de análise', 6000],
  ['Médico', 18000], ['Fisioterapeuta', 11000], ['Fisioterapeuta 2', 8000],
  ['Massagista', 5000], ['Nutricionista', 6000], ['Roupeiro', 4000],
];
function ctItens() {
  if (!estado.ct) estado.ct = { detalhar: false, encargos: true, itens: [] };
  if (!Array.isArray(estado.ct.itens)) estado.ct.itens = [];
  return estado.ct.itens;
}
function ctSalarios() { return ctItens().reduce((s, i) => s + (Number(i.salario) || 0), 0); }
function ctCusto() {
  return ctSalarios() * (estado.ct && estado.ct.encargos ? (estado.fator || 1) : 1);
}
function aplicarCT() {
  if (estado.ct && estado.ct.detalhar) estado.comissao = Math.round(ctCusto());
}

function dispSalarios() {
  const f = estado.fator || 1;
  return Math.max(0, ((estado.teto || 0) - (estado.comissao || 0)) / f);
}
function totalPos(cod) {
  return (estado.elenco[cod] || []).reduce((s, j) => s + (Number(j.salario) || 0), 0);
}
function totalSetor(setor) {
  return POSICOES.filter(p => p.setor === setor).reduce((s, p) => s + totalPos(p.c), 0);
}
function totalGeral() { return POSICOES.reduce((s, p) => s + totalPos(p.c), 0); }
function custoElenco() { return totalGeral() * (estado.fator || 1); }
function custoTotal() { return custoElenco() + (estado.comissao || 0); }

function todosJogadores() {
  const out = [];
  POSICOES.forEach(p => (estado.elenco[p.c] || []).forEach(j => out.push({ ...j, pos: p.c, posNome: p.nome })));
  return out;
}
function metaPos(cod) {
  const v = estado.alvoAtletas[cod];
  return v === undefined || v === null ? VAGAS_PADRAO : v;
}

/* ---------------- render: campo ---------------- */
function renderCampo() {
  const campo = $('#campo');
  campo.className = 'campo ' + estado.orientacao + (estado.denso ? ' denso' : '');
  campo.innerHTML = '<div class="marcacoes">' +
    '<span class="linha-meio"></span><span class="circulo"></span><span class="ponto"></span>' +
    '<span class="area a1"></span><span class="area a2"></span>' +
    '<span class="peq p1"></span><span class="peq p2"></span></div>';
  POSICOES.forEach(p => campo.appendChild(cardPos(p.c)));
  ajustarCampo();
}

const ESCALA_MIN = 0.72;   /* abaixo disso nao encolhe mais: passa a rolar */
const FONTE_MAX = 1.18;    /* teto do aumento compensatorio de fonte */

/* Altura util da area do campograma (descontando o respiro). */
function alturaDisponivel() {
  const area = $('.campo-area');
  /* 28px cobrem o padding da area mais uma folga: sem ela, o campo passa por
     um ou dois pixels e o navegador desenha a barra de rolagem a toa */
  return area ? Math.max(0, area.clientHeight - 28) : 0;
}

/* Posiciona todos os cards e devolve a altura que o campo precisa ter. */
const FOLGA_COLUNA = 16;   /* espaco livre garantido entre duas colunas vizinhas */
/* Laterais e extremos ficam no topo e na base da coluna, enquanto as colunas
   vizinhas ficam centradas — entao esses cards podem ser mais largos sem encostar. */
const COLUNA_ABERTA = new Set(['LE', 'LD', 'EE', 'ED']);

/* Alturas das caixas de posicao: as reais e as de REFERENCIA. A referencia e cada
   posicao com exatamente as vagas previstas (metaPos), com o card medio do campo.
   E dela que sai a largura do card — por isso a largura nao muda quando entram mais
   jogadores do que as vagas: o pedido foi "mantenha sempre o tamanho do card". */
function medirAlturas(campo) {
  const reais = {}, ref = {}, cromos = [];
  let somaJog = 0, nJog = 0, gap = 4;
  POSICOES.forEach(p => {
    const el = campo.querySelector('.pos[data-pos="' + p.c + '"]');
    reais[p.c] = el ? el.offsetHeight : 0;
    if (!el) return;
    const jogs = el.querySelectorAll('.jog');
    let soma = 0;
    jogs.forEach(j => { soma += j.offsetHeight; });
    somaJog += soma; nJog += jogs.length;
    if (jogs.length >= 2) gap = Math.max(0, jogs[1].offsetTop - jogs[0].offsetTop - jogs[0].offsetHeight);
    if (jogs.length) cromos.push(reais[p.c] - soma - (jogs.length - 1) * gap);
  });
  const hJog = nJog ? somaJog / nJog : 44;
  const cromoMedio = cromos.length ? cromos.reduce((a, v) => a + v, 0) / cromos.length : 0;
  POSICOES.forEach(p => {
    const el = campo.querySelector('.pos[data-pos="' + p.c + '"]');
    if (!el) { ref[p.c] = 0; return; }
    const n = el.querySelectorAll('.jog').length;
    const cromo = n ? reais[p.c] - [...el.querySelectorAll('.jog')].reduce((a, j) => a + j.offsetHeight, 0) - (n - 1) * gap
                    : (cromos.length ? cromoMedio : reais[p.c]);
    const meta = Math.max(1, metaPos(p.c));
    ref[p.c] = Math.round(cromo + meta * hJog + (meta - 1) * gap);
  });
  return { reais, ref };
}

/* Simula o desenho "entrelacado" (colunas nas posicoes fixas do LAYOUT, laterais e
   extremos abertos nas pontas) com uma largura w e devolve se nenhum par de cards
   se encosta e a altura que o campo precisa. A altura de cada card nao depende da
   largura (o nome cabe sempre numa linha), entao da para simular sem desenhar. */
function simulaEntrelacado(w, alturas, larg) {
  const cols = LAYOUT.horizontal.map(c => {
    const els = c.pos.filter(k => alturas[k]);
    const soma = els.reduce((s, k) => s + alturas[k], 0);
    const gap = c.espalhar ? 46 : GAP_CARD;
    return { x: c.x, els, soma, h: soma + gap * (els.length - 1), espalhar: !!c.espalhar };
  });
  let paraPontas = 0;
  cols.forEach(c => {
    if (!c.espalhar || c.els.length < 2) return;
    const topo = alturas[c.els[0]] || 0;
    const base = alturas[c.els[c.els.length - 1]] || 0;
    const vizinha = Math.max.apply(null, cols
      .filter(o => !o.espalhar && Math.abs(o.x - c.x) <= 12)
      .map(o => o.h).concat([0]));
    paraPontas = Math.max(paraPontas, topo + base + vizinha + MARGEM_CAMPO * 2 + GAP_CARD * 2);
  });
  const alt = Math.max(
    Math.max.apply(null, cols.map(c => c.h)) + MARGEM_CAMPO * 2,
    paraPontas, alturaDisponivel());

  const caixas = [];
  cols.forEach(c => {
    const meia = w / 2 + 10;
    const cx = Math.min(larg - meia, Math.max(meia, c.x / 100 * larg));
    let y;
    if (c.espalhar && c.els.length > 1) {
      const passo = (alt - MARGEM_CAMPO * 2 - c.soma) / (c.els.length - 1);
      y = MARGEM_CAMPO;
      c.els.forEach(k => { caixas.push([cx - w / 2, cx + w / 2, y, y + alturas[k]]);
                           y += alturas[k] + passo; });
    } else {
      y = (alt - c.h) / 2;
      c.els.forEach(k => { caixas.push([cx - w / 2, cx + w / 2, y, y + alturas[k]]);
                           y += alturas[k] + GAP_CARD; });
    }
  });
  for (let i = 0; i < caixas.length; i++) {
    for (let j = i + 1; j < caixas.length; j++) {
      const a = caixas[i], b = caixas[j];
      /* Na horizontal exige FOLGA_COLUNA de respiro entre dois cards, nao apenas
         que nao se toquem. Na vertical continua 2px porque o empilhamento dentro
         da coluna ja soma GAP_CARD ao posicionar. */
      if (a[0] < b[1] + FOLGA_COLUNA && a[1] + FOLGA_COLUNA > b[0] &&
          a[2] < b[3] - 2 && a[3] - 2 > b[2]) return { cabe: false, alt };
    }
  }
  return { cabe: true, alt };
}

/* Desenho "reto": as sete colunas lado a lado, espalhadas pela largura toda, sem
   nenhuma sobreposicao horizontal. Entra quando o elenco cresce alem das vagas e o
   entrelacado so caberia encolhendo tudo — assim o card fica do mesmo tamanho e o
   que cresce e a coluna. */
function simulaReto(w, alturas, larg) {
  const cols = LAYOUT.horizontal.map(c => {
    const els = c.pos.filter(k => alturas[k]);
    return { h: els.reduce((s, k) => s + alturas[k], 0) + GAP_CARD * (els.length - 1) };
  });
  const alt = Math.max(Math.max.apply(null, cols.map(c => c.h)) + MARGEM_CAMPO * 2, alturaDisponivel());
  const n = cols.length;
  const vao = Math.max(FOLGA_COLUNA, (larg - MARGEM_CAMPO * 2 - n * w) / (n - 1));
  const cx = cols.map((c, i) => MARGEM_CAMPO + w / 2 + i * (w + vao));
  return { alt, cx };
}

/* Maior largura em que a REFERENCIA (vagas previstas em cada posicao) cabe no
   desenho entrelacado. Teto generoso; a simulacao e quem decide. */
function larguraReferencia(larg, alturasRef) {
  const teto = Math.min(460, Math.floor(larg / 3.9));
  for (let w = teto; w >= 150; w -= 6) if (simulaEntrelacado(w, alturasRef, larg).cabe) return w;
  return 150;
}

/* Escolhe largura e desenho. A largura e sempre a da referencia. O desenho e o
   entrelacado (o de sempre) enquanto ele couber sem encolher mais do que o reto
   precisaria; senao, o reto — com a mesma largura quando a tela permite e, em tela
   estreita, com a maior que couber lado a lado. O criterio e o tamanho VISUAL do
   card (largura x escala), que e o que o usuario enxerga. */
function planejarHorizontal(campo, larg) {
  const { reais, ref } = medirAlturas(campo);
  const w = larguraReferencia(larg, ref);
  const disp = alturaDisponivel();
  const escala = alt => (estado.ajustar && disp > 0 ? Math.min(1, disp / alt) : 1);
  const A = simulaEntrelacado(w, reais, larg);
  const wB = Math.max(150, Math.min(w, Math.floor((larg - MARGEM_CAMPO * 2 - FOLGA_COLUNA * 6) / 7)));
  const B = simulaReto(wB, reais, larg);
  const visualA = A.cabe ? w * escala(A.alt) : 0;
  const visualB = wB * escala(B.alt);
  if (A.cabe && visualA >= visualB - 4) return { w, reto: false };
  return { w: wB, reto: true, cx: B.cx };
}

function distribuir() {
  const campo = $('#campo');
  const larg = campo.clientWidth || 1;
  const carta = {};
  POSICOES.forEach(p => { carta[p.c] = campo.querySelector('.pos[data-pos="' + p.c + '"]'); });

  /* Largura unica para todos, escolhida por conta e nao por tentativa: a altura de
     cada card ja e conhecida, entao da para simular as posicoes e ver qual e a maior
     largura em que nenhum par se encosta — na referencia de vagas por posicao. */
  let plano = null;
  if (estado.orientacao === 'horizontal') {
    plano = planejarHorizontal(campo, larg);
    campo.style.setProperty('--pos-max', plano.w + 'px');
    campo.style.setProperty('--pos-max-aberto', plano.w + 'px');
    campo.classList.toggle('reto', plano.reto);
    const um = campo.querySelector('.pos');
    if (um) { larguraCardPx = um.offsetWidth; larguraCardAberto = larguraCardPx; }
    /* Os nomes NAO sao refeitos daqui. distribuir() roda mais de uma vez por ajuste
       (fonte 1, depois fonte compensada), com alturas diferentes e larguras diferentes
       — 294 e 265 no rastro do tremor. Refazer os cards a cada diferenca reabria o
       ciclo. Quem abrevia os nomes e atualizarNomes(), depois que o layout assentou,
       mexendo so no texto: nada de reconstruir card, nada de mudar altura. */
  } else {
    campo.classList.remove('reto');
    campo.style.setProperty('--pos-max', Math.max(140, Math.floor(larg * 0.22)) + 'px');
  }

  const posX = (el, x) => {
    const meia = 100 * (el.offsetWidth / 2 + 10) / larg;
    el.style.left = Math.min(100 - meia, Math.max(meia, x)) + '%';
  };

  if (estado.orientacao === 'horizontal') {
    const VAO_ABERTO = 46;   /* respiro entre os cards abertos nas pontas */
    const alturas = {};
    POSICOES.forEach(p => {
      const el = carta[p.c];
      alturas[p.c] = el ? el.offsetHeight : 0;
    });
    const cols = LAYOUT.horizontal.map((c, i) => {
      const codigos = c.pos.filter(k => carta[k]);
      const els = codigos.map(k => carta[k]);
      const soma = els.reduce((s, e) => s + e.offsetHeight, 0);
      const h = soma + (c.espalhar ? VAO_ABERTO : GAP_CARD) * (els.length - 1);
      const x = plano.reto ? plano.cx[i] / larg * 100 : c.x;
      return { x, codigos, els, h, soma, espalhar: !!c.espalhar };
    });
    const necessaria = Math.max.apply(null, cols.map(c => c.h)) + MARGEM_CAMPO * 2;
    /* No entrelacado, uma coluna aberta precisa caber acima e abaixo da coluna
       centrada vizinha, senao elas se cruzam. No reto nao ha vizinha sobreposta. */
    let paraPontas = 0;
    if (!plano.reto) cols.forEach(c => {
      if (!c.espalhar || c.codigos.length < 2) return;
      const topo = alturas[c.codigos[0]] || 0;
      const base = alturas[c.codigos[c.codigos.length - 1]] || 0;
      const vizinha = Math.max.apply(null, cols
        .filter(o => !o.espalhar && Math.abs(o.x - c.x) <= 12)
        .map(o => o.h).concat([0]));
      paraPontas = Math.max(paraPontas, topo + base + vizinha + MARGEM_CAMPO * 2 + GAP_CARD * 2);
    });
    const alt = Math.max(necessaria, paraPontas, alturaDisponivel());
    cols.forEach(c => {
      if (c.espalhar && c.els.length > 1) {
        /* abre nas pontas: o primeiro encosta em cima, o ultimo embaixo */
        const passo = (alt - MARGEM_CAMPO * 2 - c.soma) / (c.els.length - 1);
        let y = MARGEM_CAMPO;
        c.els.forEach(el => {
          el.style.top = (y / alt * 100).toFixed(3) + '%';
          posX(el, c.x);
          y += el.offsetHeight + passo;
        });
        return;
      }
      let y = (alt - c.h) / 2;                    /* as demais ficam centradas */
      c.els.forEach(el => {
        el.style.top = (y / alt * 100).toFixed(3) + '%';
        posX(el, c.x);
        y += el.offsetHeight + GAP_CARD;
      });
    });
    return Math.ceil(alt);
  }

  const linhas = LAYOUT.vertical.map(l => {
    const els = l.pos.map(k => carta[k]).filter(Boolean);
    return { xs: l.xs, els, h: Math.max.apply(null, els.map(e => e.offsetHeight)) };
  });
  const soma = linhas.reduce((s, l) => s + l.h, 0);
  const necessaria = soma + GAP_CARD * (linhas.length - 1) + MARGEM_CAMPO * 2;
  const alt = Math.max(necessaria, alturaDisponivel());
  /* sobrando altura, o vao entre as linhas cresce junto em vez de sobrar espaco no fim */
  const vao = (alt - MARGEM_CAMPO * 2 - soma) / Math.max(1, linhas.length - 1);
  let y = MARGEM_CAMPO;
  linhas.forEach(l => {
    l.els.forEach((el, i) => {
      el.style.top = (y / alt * 100).toFixed(3) + '%';
      posX(el, l.xs[i]);
    });
    y += l.h + vao;
  });
  return Math.ceil(alt);
}

/* O transform:scale nao encolhe a caixa no fluxo — sem descontar as margens, sobra
   espaco embaixo/à direita e aparece barra de rolagem à toa. */
function compensarEscala(campo, k, alt) {
  if (!k || k >= 1) {
    campo.style.marginBottom = '';
    campo.style.marginRight = '';
    return;
  }
  campo.style.marginBottom = -Math.round(alt * (1 - k)) + 'px';
  campo.style.marginRight = -Math.round(campo.offsetWidth * (1 - k)) + 'px';
}

/* Cadeado: enquanto o ajuste corre, os OBSERVADORES de tamanho ficam calados
   (quem le a flag e o `talvezAjustar`). E o proprio ajuste que mexe na largura e
   na altura do campo, entao sem isso eles se realimentavam e a tela tremia.

   O ajustarCampo NAO se recusa a rodar por causa do cadeado: quem chama direto
   — renderCampo, troca de aba, entrar/sair jogador — tem de ser sempre atendido.
   Ja custou o campograma inteiro embolado num canto: o distribuir() reagenda um
   renderCampo() no frame seguinte quando a largura do card muda mais de 12px, e
   esse frame caia dentro do cadeado; o ajuste era engolido e os cards ficavam
   sem posicao. */
let ajustando = false;

/* Grava cada ajuste com as medidas do momento. Passando de 8 num intervalo de 2s,
   manda o rastro para o servidor (dados/diagnostico.log) — e assim da para ver o
   ciclo acontecendo na maquina de quem usa, sem depender de reproduzir aqui. */
const diagHist = [];
let diagEnviado = 0;
function diagRegistrar(campo, area) {
  const agora = Date.now();
  const card = campo.querySelector('.pos');
  diagHist.push({
    t: agora,
    areaW: area.clientWidth, areaH: area.clientHeight,
    campoH: campo.offsetHeight, campoW: campo.offsetWidth,
    card: card ? card.offsetWidth : 0,
    escala: campo.style.transform || '',
    fz: campo.style.getPropertyValue('--fz') || '',
    modo: estado.ajustar ? 'caber' : 'real',
    atletas: todosJogadores().length,
  });
  if (diagHist.length > 40) diagHist.shift();

  const recentes = diagHist.filter(d => agora - d.t < 2000);
  if (recentes.length > 8 && agora - diagEnviado > 20000) {
    diagEnviado = agora;
    console.warn('campograma tremendo — rastro enviado para dados/diagnostico.log');
    try {
      fetch('api/diagnostico', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tela: window.innerWidth + 'x' + window.innerHeight,
          dpr: window.devicePixelRatio,
          zoom: Math.round((window.outerWidth / window.innerWidth) * 100) / 100,
          ua: navigator.userAgent.slice(0, 120),
          eventos: recentes,
        }),
      });
    } catch (e) {}
  }
}
let soltarCadeado = 0;

/* Abrevia (ou desabrevia) os nomes para a largura final do card, trocando apenas o
   texto do <span>. Nao reconstroi nada, entao a altura nao muda e nenhum observador
   e acordado. Chamada uma vez, ao fim do ajuste. */
function atualizarNomes() {
  $$('.jog').forEach(el => {
    const nm = el.querySelector('.nm');
    if (!nm || !el.dataset.nome) return;
    const ref = { titular: el.classList.contains('titular'),
                  estrangeiro: el.classList.contains('estrangeiro') };
    const novo = nomeCurto(el.dataset.nome, limiteNome(ref, el.dataset.pos));
    if (nm.textContent !== novo) nm.textContent = novo;
  });
}

function ajustarCampo() {
  const campo = $('#campo'), area = $('.campo-area');
  if (!campo || !area) return;
  const info = $('#abasInfo');
  area.classList.toggle('ajustado', !!estado.ajustar);

  /* Area sem altura util: a aba esta escondida, a janela colapsada ou o layout
     ainda nao assentou. Medir aqui daria k=0 e o campo sumiria em scale(0) —
     melhor nao mexer e esperar o proximo gatilho. */
  const disp = alturaDisponivel();
  if (!(disp > 0)) return;

  /* --- rastro do tremor: so observa, nao muda nada --- */
  diagRegistrar(campo, area);

  ajustando = true;
  /* Rede de seguranca do cadeado: em aba escondida o requestAnimationFrame nao
     roda, e sem isto o cadeado ficaria preso para sempre — o campo congelaria na
     ultima escala e nenhum resize voltaria a ajusta-lo. */
  clearTimeout(soltarCadeado);
  soltarCadeado = setTimeout(() => { ajustando = false; }, 400);

  /* Os dois modos cabem na tela; a diferenca e so a fonte. Em "caber na tela" ela
     sobe para compensar a reducao; em "tamanho real" fica como esta. */
  const fzMax = estado.ajustar ? FONTE_MAX : 1;

  campo.style.setProperty('--fz', 1);
  campo.style.transform = '';
  campo.style.width = '';
  compensarEscala(campo, 1, 0);
  campo.style.minHeight = '0px';

  let alt = distribuir();
  let k = Math.min(1, disp / alt);

  if (fzMax > 1) {
    const fz = Math.min(fzMax, 1 / Math.max(k, ESCALA_MIN));
    if (fz > 1.02) {
      campo.style.setProperty('--fz', fz.toFixed(3));
      alt = distribuir();
      k = Math.min(1, disp / alt);
    }
  }

  /* sem piso aqui: o campo tem de caber, e no modo "caber na tela" a fonte ja
     compensou a reducao. O piso vale so para decidir o quanto a fonte sobe. */
  const aplicar = (altura, escala) => {
    campo.style.minHeight = altura + 'px';
    campo.style.width = escala < 1 ? (100 / escala).toFixed(3) + '%' : '';
    campo.style.transform = escala < 1 ? 'scale(' + escala.toFixed(4) + ')' : '';
    compensarEscala(campo, escala, altura);
  };
  aplicar(alt, k);

  /* a largura util muda com a escala: remede e reaplica, agora com o valor certo */
  requestAnimationFrame(() => {
    const alt2 = distribuir();
    const k2 = Math.min(1, disp / alt2);
    aplicar(alt2, k2);
    atualizarNomes();
    if (info) {
      const cabe = alt2 * k2 <= disp + 2;
      info.textContent = k2 < 1
        ? 'campo em ' + Math.round(k2 * 100) + '%' + (cabe ? ' — cabe tudo na tela' : '')
        : '';
    }
    /* Solta o cadeado so depois que o layout assentou, e ja registra a medida
       resultante como base. Sem isso o proprio ajuste acorda os observadores
       (mudou largura/altura do campo -> mudou a area) e o ciclo nao para. */
    requestAnimationFrame(() => {
      clearTimeout(soltarCadeado);
      ultimaArea = area.clientWidth + 'x' + area.clientHeight;
      ajustando = false;
    });
  });
}

function cardPos(cod) {
  const p = POSICOES.find(x => x.c === cod);
  const lista = estado.elenco[cod] || [];
  const tot = totalPos(cod);
  const meta = metaPos(cod);
  const disp = dispSalarios();
  const pct = disp ? (tot / disp * 100) : 0;
  const nEstr = lista.filter(j => j.estrangeiro).length;

  const el = document.createElement('div');
  el.className = 'pos' + (lista.length === 0 ? ' vazia' : '') +
                 (COLUNA_ABERTA.has(cod) ? ' aberto' : '');
  el.dataset.pos = cod;

  const falta = lista.length < meta;
  el.innerHTML =
    '<div class="pos-topo">' +
      '<span class="sigla">' + cod + '</span>' +
      '<span class="pos-nome">' + esc(p.nome) + '</span>' +
      (nEstr ? '<span class="pos-estr" title="' + nEstr + ' estrangeiro(s) nesta posição">' + nEstr + '⚑</span>' : '') +
      '<span class="pos-qtd' + (falta ? ' falta' : '') + '" title="atletas / vagas (clique para mudar)">' +
        '<b>' + lista.length + '</b>/' + meta + '</span>' +
      '<button class="add-mini" title="Adicionar jogador">+</button>' +
    '</div>' +
    '<div class="jogs"></div>' +
    '<button class="pos-add">+ adicionar</button>' +
    '<div class="pos-pe"><span class="pct">' + pct.toFixed(1).replace('.', ',') + '% da massa</span>' +
      '<span class="tot">' + brl(tot) + '</span></div>';

  const jogs = el.querySelector('.jogs');
  lista.forEach(j => jogs.appendChild(cardJog(cod, j)));



  el.querySelector('.pos-add').onclick = () => abrirBusca(cod);
  el.querySelector('.add-mini').onclick = () => abrirBusca(cod);
  el.querySelector('.pos-qtd').onclick = () => {
    const v = prompt('Quantas vagas em ' + p.nome + '?', meta);
    if (v !== null) { estado.alvoAtletas[cod] = Math.max(0, parseInt(v) || 0); salvarLocal(); render(); }
  };
  return el;
}

/* Tres barrinhas com a minutagem das ultimas temporadas, do tamanho de um texto.
   Altura proporcional a uma temporada inteira; temporada sem dado fica vazia. Cabe
   na linha de metadados do card sem mudar a altura dele — o que mudaria a altura
   reabriria a conta de largura do campograma. */
function barraMinutos(h) {
  if (!h || !h.some(Boolean)) return '';
  const txt = h.map((x, i) => (HIST.temporadas[i] || '?') + ': ' +
    (x ? milhar(x.min || 0) + ' min em ' + (x.j || 0) + ' jogos · ' + x.l : 'sem dado')).join(' · ');
  /* trilho + preenchimento: sozinha, a barra so compara as tres entre si; com o
     trilho da para ver quanto de uma temporada inteira cada ano representa */
  return '<span class="m-min" title="Minutos por temporada — ' + esc(txt) + '">' +
    h.map(x => {
      const pct = x ? Math.max(6, Math.min(100, (x.min || 0) / MIN_TEMPORADA * 100)) : 0;
      return '<i' + (x ? '' : ' class="sem"') + '><b style="height:' + pct.toFixed(0) + '%"></b></i>';
    }).join('') + '</span>';
}

function cardJog(cod, j) {
  const el = document.createElement('div');
  el.className = 'jog st-' + (j.status || 'alvo') + (j.titular ? ' titular' : '') +
                 (j.estrangeiro ? ' estrangeiro' : '');
  el.dataset.uid = j.uid;
  el.dataset.pos = cod;
  el.dataset.nome = j.nome;
  el.title = STATUS_ROT[j.status || 'alvo'] +
             (j.estrangeiro ? ' · ESTRANGEIRO (' + (j.nac || '?') + ')' : '') +
             ' · arraste para reordenar · ⋯ abre as ações · × tira do elenco';

  const ano = (j.contrato || '').slice(0, 4);
  const meta =
    (j.idade ? '<span class="m-idade" title="idade">' + j.idade + 'a</span>' : '') +
    (j.clube ? '<span class="m-clube">' + esc(j.clube) + '</span>' : '') +
    (ano ? '<span class="m-ct" title="contrato até ' + esc(j.contrato) + '">até <b>' + ano + '</b></span>'
         : '<span class="m-ct sem" title="contrato não informado">sem contrato</span>') +
    (j.ov ? '<span class="m-ovr">OVR ' + j.ov + '</span>' : '') +
    barraMinutos(histDoElenco(j)) +
    (j.posOrig && j.posOrig !== cod ? '<span class="m-pos">' + j.posOrig + '</span>' : '');

  el.innerHTML =
    '<div class="jog-nome' + (j.jid != null ? ' clicavel' : '') + '" title="' +
      esc(j.nomeCompleto || j.nome) + (j.jid != null ? ' — clique para ver a ficha' : '') + '">' +
      (j.titular ? '<span class="estrela">★</span>' : '') +
      (j.estrangeiro ? '<span class="selo-ex" title="Estrangeiro — ' + esc(j.nac || '') + '">' + esc(sigla(j.nac)) + '</span>' : '') +
      /* a estrela de titular e o selo de estrangeiro comem espaco: o limite cai junto */
      '<span class="nm">' + esc(nomeCurto(j.nome, limiteNome(j, cod))) + '</span>' + '</div>' +
    '<div class="jog-meta">' + meta + '</div>' +
    '<div class="jog-sal">' +
      '<input value="' + milhar(j.salario) + '" class="' + (!j.salario ? 'zero' : (j.sugerido ? 'sugerido' : '')) +
        '" inputmode="numeric" title="Salário mensal do jogador (sem encargos)' +
        (j.sugerido ? ' — sugerido pelo TransferRoom' : '') + '">' +
    '</div>' +
    (j.jid != null ? '<button class="jog-mais" title="Ver os detalhes do jogador">+</button>'
                   : '<span class="jog-mais vazio"></span>') +
    '<button class="jog-menu" title="Ações do jogador">⋯</button>' +
    '<button class="jog-x" title="Tirar ' + esc(j.nome) + ' do elenco">×</button>';

  el.querySelector('.jog-x').onclick = e => {
    e.stopPropagation();
    estado.elenco[cod] = estado.elenco[cod].filter(x => x.uid !== j.uid);
    salvarLocal(); render();
    toast(j.nome + ' saiu de ' + cod);
  };

  const nomeEl = el.querySelector('.jog-nome');
  if (j.jid != null) nomeEl.onclick = e => { if (!e.defaultPrevented) abrirFicha(j); };

  const inp = el.querySelector('input');
  inp.draggable = false;
  inp.onfocus = () => inp.select();
  const aplicar = () => {
    const v = paraNumero(inp.value);
    if (v === j.salario) { inp.value = milhar(v); return; }
    j.salario = v; j.sugerido = 0; salvarLocal(); render();
  };
  inp.onblur = aplicar;
  inp.onchange = aplicar;
  inp.onkeydown = e => {
    if (e.key === 'Enter') { e.preventDefault(); aplicar(); }
    else if (e.key === 'Escape') { inp.value = milhar(j.salario); inp.blur(); }
  };

  el.querySelector('.jog-menu').onclick = e => {
    e.stopPropagation();
    abrirMenuJogador(e.currentTarget, cod, j);
  };
  const bMais = el.querySelector('button.jog-mais');
  if (bMais) bMais.onclick = e => { e.stopPropagation(); abrirFicha(j); };

  /* arrastar: ver iniciarArrasto(). Nao usamos o drag nativo porque o campo tem
     transform:scale e o HTML5 drag se perde dentro dele. */
  el.addEventListener('pointerdown', e => iniciarArrasto(e, el, cod, j));

  return el;
}

/* ---------------- arrastar e soltar (por ponteiro) ---------------- */
let arrastando = null;

function iniciarArrasto(ev, el, cod, j) {
  if (ev.button !== 0) return;
  if (ev.target.closest('input,.jog-menu')) return;   /* salário e menu seguem normais */

  const x0 = ev.clientX, y0 = ev.clientY;
  let ativo = false, fantasma = null, ultimo = null;

  const limpar = () => {
    $$('.jog.alvo-cima,.jog.alvo-baixo').forEach(x => x.classList.remove('alvo-cima', 'alvo-baixo'));
    $$('.pos.alvo').forEach(x => x.classList.remove('alvo'));
  };

  const mover = e => {
    if (!ativo) {
      if (Math.abs(e.clientX - x0) + Math.abs(e.clientY - y0) < 5) return;
      ativo = true;
      arrastando = { pos: cod, uid: j.uid };
      el.classList.add('arrastando');
      document.body.classList.add('arrastando-jogador');
      fantasma = el.cloneNode(true);
      fantasma.className = 'jog fantasma';
      fantasma.style.width = el.offsetWidth + 'px';
      document.body.appendChild(fantasma);
    }
    fantasma.style.left = (e.clientX + 12) + 'px';
    fantasma.style.top = (e.clientY - 10) + 'px';

    limpar();
    if (fantasma) fantasma.style.display = 'none';
    const sob = document.elementFromPoint(e.clientX, e.clientY);
    if (fantasma) fantasma.style.display = '';
    ultimo = null;
    if (!sob) return;

    const alvoJog = sob.closest('.jog');
    const alvoPos = sob.closest('.pos');
    if (alvoJog && alvoJog !== el && !alvoJog.classList.contains('fantasma')) {
      const r = alvoJog.getBoundingClientRect();
      const antes = (e.clientY - r.top) < r.height / 2;
      alvoJog.classList.add(antes ? 'alvo-cima' : 'alvo-baixo');
      ultimo = { pos: alvoJog.dataset.pos, uid: alvoJog.dataset.uid, antes };
    } else if (alvoPos) {
      alvoPos.classList.add('alvo');
      ultimo = { pos: alvoPos.dataset.pos, uid: null, antes: false };
    }
  };

  const soltar = () => {
    document.removeEventListener('pointermove', mover);
    document.removeEventListener('pointerup', soltar);
    document.body.classList.remove('arrastando-jogador');
    el.classList.remove('arrastando');
    if (fantasma) fantasma.remove();
    limpar();
    if (ativo && ultimo && arrastando) {
      moverJogador(arrastando, ultimo.pos, ultimo.uid, ultimo.antes);
    }
    arrastando = null;
  };

  document.addEventListener('pointermove', mover);
  document.addEventListener('pointerup', soltar);
}

function moverJogador(origem, posDestino, uidAlvo, antes) {
  const lo = estado.elenco[origem.pos];
  const i = lo.findIndex(x => x.uid === origem.uid);
  if (i < 0) return;
  const [j] = lo.splice(i, 1);

  const ld = estado.elenco[posDestino];
  let k = ld.length;
  if (uidAlvo) {
    const p = ld.findIndex(x => x.uid === uidAlvo);
    if (p >= 0) k = antes ? p : p + 1;
  }
  ld.splice(k, 0, j);

  /* mudou de posição: a origem perde o titular se era ele, e o destino ganha um se faltava */
  if (origem.pos !== posDestino) {
    if (j.titular) j.titular = false;
    if (lo.length && !lo.some(x => x.titular)) lo[0].titular = true;
    if (!ld.some(x => x.titular)) ld[0].titular = true;
    toast(j.nome + ' movido para ' + posDestino);
  }
  salvarLocal(); render();
}

/* ---------------- menu de ações do jogador ---------------- */
function abrirMenuJogador(botao, cod, j) {
  $$('.menu-jog').forEach(m => m.remove());
  const m = document.createElement('div');
  m.className = 'menu menu-jog aberto';
  m.innerHTML =
    (j.jid != null ? '<button data-a="ficha">Ver ficha do jogador</button>' : '') +
    '<button data-a="titular">' + (j.titular ? 'Deixar de ser titular' : 'Marcar como titular') + '</button>' +
    '<button data-a="estrangeiro">' + (j.estrangeiro ? 'Marcar como brasileiro' : 'Marcar como estrangeiro') + '</button>' +
    '<div class="menu-sep">Status</div>' +
    STATUS.map(st => '<button data-a="st:' + st + '"' +
      ((j.status || 'alvo') === st ? ' class="atual"' : '') + '>' + STATUS_ROT[st] + '</button>').join('') +
    '<div class="menu-sep">Mover para</div>' +
    '<div class="menu-pos">' + POSICOES.filter(p => p.c !== cod).map(p =>
      '<button data-a="mv:' + p.c + '" title="' + esc(p.nome) + '">' + p.c + '</button>').join('') + '</div>' +
    '<button data-a="remover" class="perigo">Tirar do elenco</button>';

  document.body.appendChild(m);
  const r = botao.getBoundingClientRect();
  m.style.position = 'fixed';
  m.style.top = Math.min(window.innerHeight - m.offsetHeight - 8, r.bottom + 4) + 'px';
  m.style.left = Math.min(window.innerWidth - m.offsetWidth - 8, r.left - 120) + 'px';

  m.onclick = e => {
    const bt = e.target.closest('button');
    if (!bt) return;
    const a = bt.dataset.a;
    m.remove();
    if (a === 'ficha') return abrirFicha(j);
    if (a === 'titular') {
      const era = j.titular;
      estado.elenco[cod].forEach(x => { x.titular = false; });
      j.titular = !era;
    } else if (a === 'estrangeiro') {
      j.estrangeiro = !j.estrangeiro;
      if (j.estrangeiro && !j.nac) {
        const pais = prompt('País de origem de ' + j.nome, '');
        if (pais) j.nac = pais.trim();
      }
    } else if (a && a.startsWith('st:')) {
      j.status = a.slice(3);
    } else if (a && a.startsWith('mv:')) {
      return moverJogador({ pos: cod, uid: j.uid }, a.slice(3), null, false);
    } else if (a === 'remover') {
      estado.elenco[cod] = estado.elenco[cod].filter(x => x.uid !== j.uid);
    }
    salvarLocal(); render();
  };
  setTimeout(() => document.addEventListener('click', function fecha() {
    m.remove(); document.removeEventListener('click', fecha);
  }, { once: true }), 0);
}

/* ---------------- render: orcamento ---------------- */
function renderOrc() {
  const disp = dispSalarios(), tot = totalGeral();
  const n = todosJogadores().length;
  const foco = document.activeElement;

  if ($('#inTeto') && foco !== $('#inTeto')) $('#inTeto').value = milhar(estado.teto);
  if ($('#inComissao') && foco !== $('#inComissao')) $('#inComissao').value = milhar(estado.comissao);
  if ($('#inFator') && foco !== $('#inFator')) $('#inFator').value = String(estado.fator).replace('.', ',');
  if ($('#inEuro') && foco !== $('#inEuro')) $('#inEuro').value = String(estado.cotacaoEuro).replace('.', ',');

  $('#kDisp').textContent = brl(disp);
  $('#kAlocado').textContent = brl(tot);

  const saldo = disp - tot;
  const kS = $('#kSaldo');
  kS.textContent = brl(saldo);
  kS.className = 'v ' + (saldo < 0 ? 'estouro' : saldo < disp * 0.05 ? 'alerta' : 'ok');

  const ct = custoTotal();
  const kCT = $('#kCustoTotal');
  kCT.textContent = brl(ct);
  kCT.className = 'v ' + (ct > estado.teto ? 'estouro' : 'ok');
  $('#kTeto').textContent = 'de ' + brl(estado.teto, true);
  $('#kAtletas').textContent = n;

  const nE = contaEstrangeiros(), lim = estado.limiteEstrangeiros || 0;
  const kE = $('#kEstr');
  kE.textContent = nE;
  kE.className = 'v ' + (lim && nE > lim ? 'estouro' : lim && nE === lim ? 'alerta' : '');
  kE.title = lim ? nE + ' de ' + lim + ' vagas de estrangeiro usadas' : nE + ' estrangeiros';
  $('#kEstrLim').textContent = lim ? 'de ' + lim : '';
  $('#kMedia').textContent = brl(n ? tot / n : 0, true);
  if (document.activeElement !== $('#marcaSub')) $('#marcaSub').value = estado.nome;

  const barra = $('#barra');
  barra.innerHTML = '';
  const escala = Math.max(tot, disp) || 1;
  SETORES.forEach(sx => {
    const v = totalSetor(sx.c);
    if (!v) return;
    const i = document.createElement('i');
    i.style.width = (v / escala * 100) + '%';
    i.style.background = sx.cor;
    i.title = sx.nome + ': ' + brl(v);
    barra.appendChild(i);
  });
  if (tot > disp && disp) {
    const m = document.createElement('span');
    m.className = 'marca-teto';
    m.style.left = (disp / escala * 100) + '%';
    m.title = 'Massa salarial disponível: ' + brl(disp);
    barra.appendChild(m);
  }
  $('#barraInfo').textContent = SETORES.map(sx =>
    sx.nome.slice(0, 3) + ' ' + (tot ? Math.round(totalSetor(sx.c) / tot * 100) : 0) + '%').join(' · ');

  const conta = $('#orcConta');
  if (conta) {
    conta.innerHTML =
      '<div class="l"><span>custo total máximo</span><b>' + brl(estado.teto) + '</b></div>' +
      '<div class="l"><span>− comissão técnica</span><b>' + brl(estado.comissao) + '</b></div>' +
      '<div class="l"><span>÷ encargos ×' + String(estado.fator).replace('.', ',') + '</span><b></b></div>' +
      '<div class="l tot"><span>massa salarial para os jogadores</span><b>' + brl(disp) + '</b></div>';
  }
}

/* ---------------- render: painel ---------------- */
function renderPainel() {
  const tot = totalGeral(), disp = dispSalarios();

  $('#setores').innerHTML = SETORES.map(s => {
    const v = totalSetor(s.c);
    const pct = tot ? v / tot * 100 : 0;
    const meta = estado.metas[s.c] || 0;
    const dif = pct - meta;
    const qtd = POSICOES.filter(p => p.setor === s.c)
      .reduce((a, p) => a + (estado.elenco[p.c] || []).length, 0);
    return '<div class="setor" data-setor="' + s.c + '">' +
      '<div class="setor-l1"><span class="nome" style="color:' + s.cor + '">' + s.nome + '</span>' +
        '<span style="font-size:10px;color:var(--tinta3)">' + qtd + ' atl.</span>' +
        '<span class="v">' + brl(v, true) + '</span>' +
        '<span class="p">' + pct.toFixed(0) + '%</span></div>' +
      '<div class="setor-barra"><i style="width:' + Math.min(100, pct) + '%;background:' + s.cor + '"></i>' +
        '<span class="meta" style="left:' + meta + '%"></span></div>' +
      '<div class="setor-obs"><span>meta <b class="meta-ed" style="cursor:pointer;text-decoration:underline dotted">' + meta + '%</b>' +
        ' · ' + brl(disp * meta / 100, true) + '</span>' +
        '<span class="' + (Math.abs(dif) < 2 ? '' : dif > 0 ? 'acima' : 'abaixo') + '">' +
          (tot ? (dif > 0 ? '+' : '') + dif.toFixed(0) + ' p.p.' : '—') + '</span></div>' +
    '</div>';
  }).join('');

  $$('#setores .meta-ed').forEach(b => {
    b.onclick = () => {
      const s = b.closest('.setor').dataset.setor;
      const v = prompt('Meta de % da massa salarial para ' + SETORES.find(x => x.c === s).nome, estado.metas[s]);
      if (v !== null) { estado.metas[s] = Math.max(0, paraDecimal(v)); salvarLocal(); render(); }
    };
  });

  /* ---- estrangeiros ---- */
  const estrangeiros = todosJogadores().filter(j => j.estrangeiro);
  const lim = estado.limiteEstrangeiros || 0;
  const nE = estrangeiros.length;
  const jg = todosJogadores();
  $('#estrangeiros').innerHTML =
    '<div class="estr-topo">' +
      '<span class="estr-num' + (lim && nE > lim ? ' estouro' : '') + '">' + nE + '</span>' +
      '<span class="estr-txt">estrangeiro' + (nE === 1 ? '' : 's') + ' no elenco<br>' +
        '<b>' + (jg.length - nE) + '</b> brasileiro' + (jg.length - nE === 1 ? '' : 's') + ' · limite ' +
        '<b class="lim-ed" style="cursor:pointer;text-decoration:underline dotted">' + lim + '</b></span>' +
    '</div>' +
    (nE ? '<div class="estr-lista">' + estrangeiros
        .sort((a, b) => (b.salario || 0) - (a.salario || 0))
        .map(j => '<div class="estr-item"><span class="pos-tag">' + j.pos + '</span>' +
          '<span class="selo-ex">' + esc(sigla(j.nac)) + '</span>' +
          '<span class="nm">' + esc(nomeCurto(j.nome, estado.denso ? 14 : 17)) + '</span>' +
          '<span class="vl">' + brl(j.salario, true) + '</span></div>').join('') + '</div>'
      : '<div style="font-size:11px;color:var(--tinta3)">Nenhum estrangeiro entre as escolhas.</div>') +
    (nE ? '<div class="estr-pe">Folha dos estrangeiros: <b>' +
        brl(estrangeiros.reduce((s, j) => s + (j.salario || 0), 0)) + '</b>' +
        (tot ? ' · ' + (estrangeiros.reduce((s, j) => s + (j.salario || 0), 0) / tot * 100).toFixed(0) + '% da massa' : '') +
        '</div>' : '');

  const le = $('#estrangeiros .lim-ed');
  if (le) le.onclick = () => {
    const v = prompt('Limite de estrangeiros inscritos', lim);
    if (v !== null) { estado.limiteEstrangeiros = Math.max(0, parseInt(v) || 0); salvarLocal(); render(); }
  };

  /* ---- alertas ---- */
  const al = [];
  const ct = custoTotal();
  if (ct > estado.teto) {
    al.push({ t:'erro', ic:'!', txt:'Custo total <b>' + brl(ct) + '</b> passa o máximo em <b>' +
      brl(ct - estado.teto) + '</b>.' });
  } else if (disp && tot > disp * 0.95) {
    al.push({ t:'', ic:'▲', txt:'Restam <b>' + brl(disp - tot) + '</b> de massa salarial.' });
  }
  if (lim && nE > lim) {
    al.push({ t:'erro', ic:'⬤', txt:'<b>' + nE + '</b> estrangeiros — ' + (nE - lim) + ' acima do limite de ' + lim + '.' });
  }
  const nAtl = jg.length;
  if (nAtl && (nAtl < 26 || nAtl > 30)) {
    al.push({ t:'', ic:'#', txt:'Elenco com <b>' + nAtl + '</b> atletas (alvo: 26 a 30).' });
  }
  const vazias = POSICOES.filter(p => (estado.elenco[p.c] || []).length === 0);
  if (vazias.length) al.push({ t:'', ic:'○', txt:'Sem ninguém em: <b>' + vazias.map(p => p.c).join(', ') + '</b>' });
  const faltando = POSICOES.filter(p => (estado.elenco[p.c] || []).length > 0 && (estado.elenco[p.c] || []).length < metaPos(p.c));
  if (faltando.length) al.push({ t:'', ic:'↑', txt:'Vagas em aberto: <b>' + faltando.map(p => p.c).join(', ') + '</b>' });
  const semSal = jg.filter(j => !j.salario);
  if (semSal.length) al.push({ t:'', ic:'$', txt:'<b>' + semSal.length + '</b> atleta(s) sem salário definido.' });
  const semTit = POSICOES.filter(p => (estado.elenco[p.c] || []).length > 0 && !(estado.elenco[p.c] || []).some(j => j.titular));
  if (semTit.length) al.push({ t:'', ic:'★', txt:'Sem titular marcado: <b>' + semTit.map(p => p.c).join(', ') + '</b>' });
  if (!al.length) al.push({ t:'ok', ic:'✓', txt:'Elenco completo e dentro do custo máximo.' });

  $('#alertas').innerHTML = al.map(a =>
    '<div class="alerta ' + a.t + '"><span class="ic">' + a.ic + '</span><span>' + a.txt + '</span></div>').join('');

  /* ---- maiores salarios ---- */
  const top = jg.filter(j => j.salario).sort((a, b) => b.salario - a.salario).slice(0, 8);
  $('#topSal').innerHTML = top.length ? top.map(j =>
    '<div class="top-sal"><span class="pos-tag">' + j.pos + '</span>' +
    (j.estrangeiro ? '<span class="selo-ex">' + esc(sigla(j.nac)) + '</span>' : '') +
    '<span class="nm">' + esc(j.nome) + '</span>' +
    '<span class="vl">' + brl(j.salario, true) + '</span></div>').join('')
    : '<div style="font-size:11px;color:var(--tinta3)">Nenhum salário lançado ainda.</div>';

  /* ---- resumo ---- */
  const comIdade = jg.filter(j => j.idade);
  const idadeMed = comIdade.length ? comIdade.reduce((s, j) => s + Number(j.idade), 0) / comIdade.length : 0;
  const titulares = jg.filter(j => j.titular);
  const folhaTit = titulares.reduce((s, j) => s + (j.salario || 0), 0);
  const porStatus = STATUS.map(s => ({ s, n: jg.filter(j => (j.status || 'alvo') === s).length })).filter(x => x.n);
  const maior = jg.length ? Math.max(...jg.map(j => j.salario || 0)) : 0;
  const vagas = POSICOES.reduce((s, p) => s + metaPos(p.c), 0);

  $('#resumo').innerHTML =
    linhaKpi('Atletas / vagas', jg.length + ' / ' + vagas) +
    linhaKpi('Idade média', idadeMed ? idadeMed.toFixed(1).replace('.', ',') + ' anos' : '—') +
    linhaKpi('Folha dos 11 titulares', brl(folhaTit)) +
    linhaKpi('Custo dos titulares', brl(folhaTit * (estado.fator || 1))) +
    linhaKpi('Titulares definidos', titulares.length + '/11') +
    linhaKpi('Maior salário', brl(maior)) +
    linhaKpi('Peso do maior salário', tot ? (maior / tot * 100).toFixed(1).replace('.', ',') + '%' : '—') +
    linhaKpi('Custo anual (13 meses)', brl(custoTotal() * 13)) +
    porStatus.map(x => linhaKpi(STATUS_ROT[x.s], x.n)).join('');
}
function linhaKpi(r, v) {
  return '<div class="linha-kpi"><span>' + r + '</span><span class="v">' + v + '</span></div>';
}

function render() {
  /* guarda a rolagem: sem isso a tela pula toda vez que um card muda de tamanho */
  const fichaDe = fichaAtual && !$('#ficha').classList.contains('oculta') ? fichaAtual.id : null;
  const area = $('.campo-area');
  const top = area ? area.scrollTop : 0, left = area ? area.scrollLeft : 0;
  renderCampo(); renderOrc(); renderPainel();
  if (fichaDe != null) marcarFichaAberta(fichaDe);
  if (area) { area.scrollTop = top; area.scrollLeft = left; }
}

/* ---------------- modal da comissao tecnica ---------------- */
function abrirCT() {
  if (!ctItens().length) {
    estado.ct.itens = CT_PADRAO.map(([cargo, salario]) => ({ uid: uid(), cargo, salario }));
  }
  $('#ctDetalhar').checked = !!estado.ct.detalhar;
  $('#ctEncargos').checked = !!estado.ct.encargos;
  renderCT();
  $('#modalCT').classList.add('aberto');
}

function renderCT() {
  const det = !!estado.ct.detalhar;
  $('#ctLista').innerHTML = ctItens().map(i =>
    '<div class="ct-item" data-uid="' + i.uid + '">' +
      '<input class="ct-cargo" value="' + esc(i.cargo) + '" placeholder="cargo">' +
      '<input class="ct-sal" value="' + milhar(i.salario) + '" inputmode="numeric">' +
      '<button class="ct-rm" title="Remover">✕</button>' +
    '</div>').join('');

  $$('#ctLista .ct-item').forEach(el => {
    const it = ctItens().find(x => x.uid === el.dataset.uid);
    const cargo = el.querySelector('.ct-cargo'), sal = el.querySelector('.ct-sal');
    cargo.onchange = () => { it.cargo = cargo.value; salvarLocal(); };
    const aplicar = () => {
      const v = paraNumero(sal.value);
      if (v === it.salario) { sal.value = milhar(v); return; }
      it.salario = v; aplicarCT(); salvarLocal(); renderCT(); renderOrc(); renderPainel();
    };
    sal.onfocus = () => sal.select();
    sal.onblur = aplicar; sal.onchange = aplicar;
    sal.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); aplicar(); } };
    el.querySelector('.ct-rm').onclick = () => {
      estado.ct.itens = ctItens().filter(x => x.uid !== it.uid);
      aplicarCT(); salvarLocal(); renderCT(); renderOrc(); renderPainel();
    };
  });

  const sal = ctSalarios(), custo = ctCusto();
  $('#ctResumo').innerHTML =
    '<div class="ct-linha"><span>' + ctItens().length + ' profissionais · salários</span>' +
      '<b>' + brl(sal) + '</b></div>' +
    (estado.ct.encargos
      ? '<div class="ct-linha"><span>encargos ×' + String(estado.fator).replace('.', ',') + '</span>' +
        '<b>' + brl(custo - sal) + '</b></div>' : '') +
    '<div class="ct-linha total"><span>custo mensal da comissão</span><b>' + brl(custo) + '</b></div>' +
    (det ? '<div class="ct-obs">Este valor está sendo usado no custo total. Sobra para os jogadores: <b>' +
        brl(dispSalarios()) + '</b> de massa salarial.</div>'
         : '<div class="ct-obs">Ligue "montar cargo a cargo" para usar este total no lugar do valor digitado (' +
        brl(estado.comissao) + ').</div>');
}

/* ---------------- busca na base ---------------- */
function abrirBusca(cod) {
  posAtual = cod;
  const p = POSICOES.find(x => x.c === cod);
  $('#mbTitulo').textContent = 'Escolher jogador · ' + p.nome;
  $('#mbSub').textContent = '(' + (estado.elenco[cod] || []).length + ' de ' + metaPos(cod) + ' vagas preenchidas)';
  $('#fPos').value = cod;
  $('#modalBusca').classList.add('aberto');
  renderTabela();
  setTimeout(() => $('#fTexto').focus(), 60);
}

function ligasDoGrupo() {
  if (filtroGrupo === 'todas') return null;
  return new Set(GRUPOS_LIGA[filtroGrupo] || []);
}

function filtrar() {
  const txt = $('#fTexto').value.trim().toLowerCase();
  const pos = $('#fPos').value;
  const idMin = parseFloat($('#fIdadeMin').value) || 0;
  const idMax = parseFloat($('#fIdadeMax').value) || 99;
  const ovMin = parseFloat($('#fOvMin').value) || 0;
  const minMin = parseFloat($('#fMinMin').value) || 0;
  const ctAte = $('#fContrato').value;   /* formato AAAA-MM */
  const nacao = $('#fNacao').value;
  const ligaUnica = $('#fLiga').value;
  const ligas = ligaUnica ? null : ligasDoGrupo();

  return BASE.filter(j => {
    if (pos && j.p !== pos) return false;
    if (ligaUnica) { if (j.l !== ligaUnica) return false; }
    else if (ligas && !ligas.has(j.l)) return false;
    if (nacao && !passaNacao(j, nacao)) return false;
    if (txt && !(j.n.toLowerCase().includes(txt) || (j.t || '').toLowerCase().includes(txt))) return false;
    const id = Number(j.id_) || 0;
    if (id && (id < idMin || id > idMax)) return false;
    if (ovMin && (Number(j.ov) || 0) < ovMin) return false;
    if (minMin && (Number(j.min) || 0) < minMin) return false;
    if (ctAte) {
      if (!j.ct || j.ct.slice(0, 7) > ctAte) return false;
    }
    return true;
  });
}

const PAISES_SUL = new Set(['Brazil','Argentina','Uruguay','Paraguay','Chile','Bolivia',
  'Peru','Ecuador','Colombia','Venezuela','Guyana','Suriname','French Guiana']);
function ehSulAmericano(j) {
  const nac = (j.nac || '').trim();
  if (PAISES_SUL.has(nac)) return true;
  return (j.psp || '').split(',').some(p => PAISES_SUL.has(p.trim()));
}
function passaNacao(j, modo) {
  const ex = ehEstrangeiroBase(j);
  if (modo === 'br') return !ex;
  if (modo === 'ex') return ex;
  if (modo === 'sul') return ehSulAmericano(j);
  if (modo === 'sulex') return ex && ehSulAmericano(j);
  return true;
}

/* As colunas da busca ficam num lugar so: cabecalho, larguras e celulas saem daqui.
   Antes o <thead> vivia no HTML e as <td> no JS, e bastava uma coluna nova para
   tudo desalinhar. */
const COLUNAS = [
  { c: 'n',   r: 'Jogador',  w: 23,  cel: j => '<b>' + esc(j.n) + '</b>' +
      (ehEstrangeiroBase(j) ? ' <span class="selo-ex">' + esc(sigla(j.nac)) + '</span>' : '') +
      (j.rk_ok ? '' : ' <span class="sem-ind" title="sem indicadores: minutagem baixa">·</span>') +
      ' <button class="ver-ficha" title="Ver o detalhe do jogador">+</button>' },
  { c: 't',   r: 'Clube',    w: 14,  cel: j => esc(j.t) },
  { c: 'l',   r: 'Liga',     w: 11,  cel: j => '<span class="fraco">' + esc(j.l) + '</span>' },
  { c: 'p',   r: 'Pos.',     w: 5,   cel: j => j.p, tit: j => 'Wyscout: ' + (j.pw || '—') },
  { c: 'id_', r: 'Idade',    w: 5.5, num: 1, cel: j => j.id_ ?? '—' },
  { c: 'ov',  r: 'Overall',  w: 7.5, num: 1, cel: j => {
      const cl = !j.ov ? 'x' : j.ov >= 65 ? 'a' : j.ov >= 55 ? 'b' : j.ov >= 45 ? 'c' : 'd';
      return '<span class="ov ' + cl + '">' + (j.ov ?? '—') + '</span>'; } },
  { c: 'sal', r: 'Salário',  w: 8.5, num: 1, cel: j => {
      const f = faixaSalarioTR(j);
      return f ? brl(f.min, true) : '<span class="fraco">—</span>'; },
    tit: j => { const f = faixaSalarioTR(j);
      return f ? 'TransferRoom: ' + f.txt + '/ano · ' + brl(f.min) + ' a ' + brl(f.max) + ' por mês'
               : 'sem estimativa de salário'; } },
  { c: 'ofe', r: 'Of.',      w: 5,   num: 1, cel: j => '<span class="fraco">' + (j.ofe ?? '—') + '</span>' },
  { c: 'def', r: 'Def.',     w: 5,   num: 1, cel: j => '<span class="fraco">' + (j.def ?? '—') + '</span>' },
  { c: 'fis', r: 'Fís.',     w: 5,   num: 1, cel: j => '<span class="fraco">' + (j.fis ?? '—') + '</span>' },
  { c: 'min', r: 'Min.',     w: 5.5, num: 1, cel: j => '<span class="fraco">' + (j.min ? milhar(j.min) : '—') + '</span>' },
  { c: 'ct',  r: 'Contrato', w: 10,  cel: j => mesAno(j.ct) || '<span class="fraco">—</span>',
    tit: j => j.ct ? 'até ' + j.ct + (j.ctc ? ' · ' + j.ctc : '') : 'contrato não informado' },
];

function renderCabecalho() {
  const th = $('#thead');
  if (!th || th.dataset.pronto) return;
  th.innerHTML = '<tr>' + COLUNAS.map(col =>
    '<th data-ord="' + col.c + '"' + (col.num ? ' class="num-c"' : '') +
    ' style="width:' + col.w + '%">' + col.r + '</th>').join('') + '</tr>';
  th.dataset.pronto = '1';
  th.querySelectorAll('th').forEach(el => {
    el.onclick = () => {
      const c = el.dataset.ord;
      if (ordem.campo === c) ordem.desc = !ordem.desc;
      else { ordem.campo = c; ordem.desc = !['n', 't', 'l', 'ct', 'p'].includes(c); }
      th.querySelectorAll('.set').forEach(x => x.remove());
      el.insertAdjacentHTML('beforeend', '<span class="set">' + (ordem.desc ? '▼' : '▲') + '</span>');
      renderTabela();
    };
  });
}

function renderTabela() {
  resultado = filtrar();
  const camp = ordem.campo, desc = ordem.desc;
  const valorOrd = (j, c) => {
    if (c !== 'sal') return j[c];
    const f = faixaSalarioTR(j);
    return f ? f.min : null;
  };
  resultado.sort((a, b) => {
    let x = valorOrd(a, camp), y = valorOrd(b, camp);
    if (typeof x === 'string' || typeof y === 'string') {
      x = String(x || ''); y = String(y || '');
      return desc ? y.localeCompare(x) : x.localeCompare(y);
    }
    x = Number(x) || 0; y = Number(y) || 0;
    return desc ? y - x : x - y;
  });

  const LIM = 400;
  const jaNaPos = new Set((estado.elenco[posAtual] || []).map(j => j.jid).filter(v => v != null));
  const linhas = resultado.slice(0, LIM);

  renderCabecalho();
  $('#tbody').innerHTML = linhas.map(j =>
    '<tr data-id="' + j.id + '"' + (jaNaPos.has(j.id) ? ' class="ja"' : '') + '>' +
    COLUNAS.map(col => '<td' + (col.num ? ' class="num-c"' : '') +
      (col.tit ? ' title="' + esc(col.tit(j)) + '"' : '') + '>' + col.cel(j) + '</td>').join('') +
    '</tr>').join('');

  $('#semResultado').style.display = linhas.length ? 'none' : 'block';
  const nEx = resultado.filter(ehEstrangeiroBase).length;
  $('#mbContagem').innerHTML = '<b>' + milhar(resultado.length) + '</b> jogadores' +
    (nEx ? ' · <b>' + nEx + '</b> estrangeiros' : '') +
    (resultado.length > LIM ? ' · exibindo os ' + LIM + ' primeiros' : '') +
    ' · clique para adicionar em <b>' + posAtual + '</b>';

  $$('#tbody tr[data-id]').forEach(tr => {
    tr.onclick = () => adicionarDaBase(parseInt(tr.dataset.id));
    tr.querySelector('.ver-ficha').onclick = e => {
      e.stopPropagation();
      alternarDetalhe(tr, parseInt(tr.dataset.id));
    };
  });
}

function adicionarDaBase(id) {
  const j = BASE.find(x => x.id === id);
  if (!j) return;
  const lista = estado.elenco[posAtual];
  if (lista.some(x => x.jid === id)) { toast('Esse jogador já está em ' + posAtual, 'ruim'); return; }
  /* Sem salario sugerido: o jogador entra com 0 (ambar) e o usuario define. A faixa
     do TransferRoom continua visivel na ficha e na aba Fim de contrato, so nao
     preenche o card — foi pedido explicito. */
  lista.push({
    uid: uid(), jid: j.id, pk: primaryKey(j), nome: j.n, nomeCompleto: j.nc || '',
    clube: j.t, liga: j.l, idade: j.id_,
    ov: j.ov, contrato: j.ct, posOrig: j.p,
    salario: 0,
    sugerido: 0,
    nac: j.nac || '', psp: j.psp || '', estrangeiro: ehEstrangeiroBase(j),
    status: 'alvo', titular: lista.length === 0,
  });
  salvarLocal(); render();
  $('#mbSub').textContent = '(' + lista.length + ' de ' + metaPos(posAtual) + ' vagas preenchidas)';
  renderTabela();
  toast(j.n + ' adicionado em ' + posAtual + ' — defina o salário', 'bom');
}

/* ---------------- cenarios ---------------- */
function salvarLocal() {
  try { localStorage.setItem(CHAVE_LOCAL, JSON.stringify(estado)); } catch (e) {}
}
function migrar() {
  if ((estado.v || 1) < 2) { estado.orientacao = 'horizontal'; }
  if ((estado.v || 1) < 3) { estado.denso = true; estado.ajustar = true; }
  /* o limite de estrangeiros nasceu 5 e passou a 9: corrige quem ficou com o antigo */
  if ((estado.v || 1) < 4 && estado.limiteEstrangeiros === 5) estado.limiteEstrangeiros = 9;
  if ((estado.v || 1) < 4) estado.ajustar = true;
  estado.v = VERSAO;
}

/* Os jogadores gravados antes da base ampliada guardaram so o id, que mudou.
   Reancora cada um pela primary_key assim que a base carrega. */
function reancorar() {
  let ajustados = 0, perdidos = 0;
  POSICOES.forEach(p => (estado.elenco[p.c] || []).forEach(j => {
    if (j.jid == null) return;
    if (j.pk && BASE.some(x => primaryKey(x) === j.pk)) return;
    const achado = BASE.find(x => x.n === j.nome && x.t === j.clube) ||
                   BASE.find(x => x.n === j.nome && x.p === (j.posOrig || p.c));
    if (achado) { j.jid = achado.id; j.pk = primaryKey(achado); ajustados++; }
    else { j.jid = null; j.pk = null; perdidos++; }
  }));
  if (ajustados || perdidos) {
    salvarLocal(); render();
    console.log('reancorados:', ajustados, '| sem correspondência:', perdidos);
  }
}

function carregarLocal() {
  try {
    const s = localStorage.getItem(CHAVE_LOCAL);
    if (s) {
      estado = Object.assign(novoEstado(), JSON.parse(s));
      POSICOES.forEach(p => { if (!Array.isArray(estado.elenco[p.c])) estado.elenco[p.c] = []; });
    }
  } catch (e) {}
  migrar();
}

async function listarCenarios() {
  try {
    const r = await fetch('api/cenarios');
    const lista = await r.json();
    const sel = $('#selCenario');
    sel.innerHTML = '<option value="">— grupo não salvo —</option>' + lista.map(c =>
      '<option value="' + c.id + '">' + esc(c.nome) + ' · ' + brl(c.total, true) + ' · ' + c.atletas + ' atl.</option>'
    ).join('');
    if (estado.id) sel.value = estado.id;
  } catch (e) {}
}

async function salvarCenario() {
  estado.total = totalGeral();
  estado.atletas = todosJogadores().length;
  const r = await fetch('api/cenarios', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(estado),
  });
  const j = await r.json();
  estado.id = j.id;
  salvarLocal();
  await listarCenarios();
  $('#selCenario').value = j.id;
  toast('Grupo "' + estado.nome + '" salvo', 'bom');
}

function aplicarTema() {
  const claro = estado.tema === 'claro';
  document.body.classList.toggle('claro', claro);
  const b = $('#btTema');
  if (b) b.innerHTML = 'Tema: <b>' + (claro ? 'claro' : 'escuro') + '</b>';
}

function sincronizarBotoes() {
  aplicarTema();
  const bA = $('#btAjustar');
  if (bA) bA.innerHTML = 'Escala: <b>' + (estado.ajustar ? 'caber na tela' : 'tamanho real') + '</b>';
  const det = !!(estado.ct && estado.ct.detalhar);
  $('#inComissao').readOnly = det;
  $('#inComissao').classList.toggle('travado', det);
  $('#btOrient').innerHTML = 'Campo: <b>' + (estado.orientacao === 'vertical' ? 'em pé' : 'deitado') + '</b>';
  $('#btDenso').innerHTML = 'Cards: <b>' + (estado.denso ? 'compactos' : 'completos') + '</b>';
}

async function abrirCenario(id) {
  if (!id) return;
  const r = await fetch('api/cenario/' + id);
  if (!r.ok) { toast('Grupo não encontrado', 'ruim'); return; }
  estado = Object.assign(novoEstado(), await r.json());
  POSICOES.forEach(p => { if (!Array.isArray(estado.elenco[p.c])) estado.elenco[p.c] = []; });
  migrar();
  salvarLocal(); render(); sincronizarBotoes();
  toast('Grupo "' + estado.nome + '" carregado');
}

/* ---------------- comparar grupos ---------------- */
async function abrirComparativo() {
  const r = await fetch('api/comparativo');
  const gs = await r.json();
  $('#compSub').textContent = gs.length + (gs.length === 1 ? ' grupo salvo' : ' grupos salvos');

  if (!gs.length) {
    $('#compCorpo').innerHTML = '<div class="vazio">Nenhum grupo salvo ainda. ' +
      'Monte as opções e clique em <b>Salvar</b>.</div>';
    $('#modalComp').classList.add('aberto');
    return;
  }

  const linhas = [
    ['Atletas',                g => g.atletas,                    g => g.atletas],
    ['Estrangeiros',           g => g.estrangeiros,               g => g.estrangeiros],
    ['Folha salarial',         g => brl(g.folha),                 g => g.folha],
    ['Custo do elenco',        g => brl(g.custoElenco),           g => g.custoElenco],
    ['Comissão técnica',       g => brl(g.comissao),              g => g.comissao],
    ['Custo total',            g => brl(g.custoTotal),            g => g.custoTotal],
    ['Sobra sobre o máximo',   g => brl(g.sobra),                 g => g.sobra],
    ['Salário médio',          g => brl(g.media),                 g => g.media],
    ['Maior salário',          g => brl(g.maior),                 g => g.maior],
    ['Idade média',            g => g.idadeMedia ? g.idadeMedia.toFixed(1).replace('.', ',') : '—', g => g.idadeMedia],
    ['Goleiros',               g => brl(g.setores.gol, true),     g => g.setores.gol],
    ['Defesa',                 g => brl(g.setores.defesa, true),  g => g.setores.defesa],
    ['Meio',                   g => brl(g.setores.meio, true),    g => g.setores.meio],
    ['Ataque',                 g => brl(g.setores.ataque, true),  g => g.setores.ataque],
    ['Sem salário definido',   g => g.semSalario || '—',          g => g.semSalario],
  ];

  let html = '<table class="comp"><thead><tr><th>Indicador</th>' +
    gs.map(g => '<th class="num-c grupo-col" data-id="' + g.id + '">' + esc(g.nome) +
      '<span class="quando">' + esc(g.atualizado) + '</span></th>').join('') +
    '</tr></thead><tbody>';

  linhas.forEach(([rot, fmt, val]) => {
    const vals = gs.map(val);
    const max = Math.max(...vals), min = Math.min(...vals);
    html += '<tr><td class="ind">' + rot + '</td>' + gs.map((g, i) => {
      let cl = '';
      if (max !== min && vals[i] !== null) {
        if (vals[i] === max) cl = ' alto';
        else if (vals[i] === min) cl = ' baixo';
      }
      if (rot === 'Sobra sobre o máximo' && vals[i] < 0) cl = ' ruim';
      return '<td class="num-c' + cl + '">' + fmt(g) + '</td>';
    }).join('') + '</tr>';
  });
  html += '</tbody></table>';
  $('#compCorpo').innerHTML = html;

  $$('#compCorpo .grupo-col').forEach(th => {
    th.onclick = async () => {
      $('#modalComp').classList.remove('aberto');
      await abrirCenario(th.dataset.id);
      $('#selCenario').value = th.dataset.id;
    };
  });
  $('#modalComp').classList.add('aberto');
}

/* ---------------- exportar ---------------- */
async function exportarExcel() {
  const f = estado.fator || 1;
  const linhas = todosJogadores().map(j => ({
    posicao: j.pos + ' · ' + j.posNome, nome: j.nome, clube: j.clube, liga: j.liga,
    idade: j.idade, overall: j.ov, contrato: j.contrato,
    nacionalidade: j.nac || (j.estrangeiro ? 'estrangeiro' : 'Brazil'),
    estrangeiro: j.estrangeiro ? 'SIM' : 'não',
    status: STATUS_ROT[j.status || 'alvo'] + (j.titular ? ' (titular)' : ''),
    salario: j.salario || 0, custo: (j.salario || 0) * f,
  }));
  if (!linhas.length) { toast('Elenco vazio', 'ruim'); return; }
  const r = await fetch('api/exportar', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: estado.nome, teto: estado.teto, comissao: estado.comissao,
      fator: f, disponivel: dispSalarios(), linhas,
    }),
  });
  const blob = await r.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = estado.nome.replace(/[^\w\s-]/g, '') + '.xlsx';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Planilha exportada', 'bom');
}

async function exportarPng() {
  if (window.__semPng || typeof html2canvas === 'undefined') {
    toast('Gerador de imagem indisponível — use o botão PDF', 'ruim'); return;
  }
  toast('Gerando imagem…');
  const cv = await html2canvas($('#campo'), { backgroundColor: '#0d0f13', scale: 2, logging: false });
  const a = document.createElement('a');
  a.href = cv.toDataURL('image/png');
  a.download = 'campograma-' + estado.nome.replace(/[^\w\s-]/g, '') + '.png';
  a.click();
  toast('Imagem salva', 'bom');
}

/* ---------------- ficha do jogador (mesma leitura do Ranking) ---------------- */
const GRUPOS_FICHA = ['Defesa', 'Ataque', 'Passe', 'Decisão (DGP)'];

/* Fisico do SkillCorner: [campo, rotulo, casas] — a media e o melhor saem da coorte */
const FISICO = [
  ['psv',    'PSV-99',            1],
  ['vmax',   'Vel. máxima',       1],
  ['vmax3',  'Vel. máx. TOP3',    1],
  ['mmin',   'M/min',             1],
  ['dist',   'Distância /90',     0],
  ['hi',     'Alta intens. /90',  0],
  ['hsr',    'KM 15–20 /90',      0],
  ['spr_km', 'KM +20 (sprint)',   0],
  ['spr_n',  'Sprints /90',       1],
  ['acel',   'Acel. fortes /90',  1],
  ['desa',   'Desac. fortes /90', 1],
  ['cod',    'Mudanças dir. /90', 1],
];
let fichaAtual = null;

function primaryKey(j) { return j.n + ' - ' + j.t + ' - ' + j.l; }

/* O TransferRoom da a faixa salarial ANUAL em euros, tipo "25K - 38K".
   Converte para uma faixa mensal em reais, com a cotacao que estiver no orçamento. */
function faixaSalarioTR(j) {
  if (!j.sal) return null;
  const partes = String(j.sal).split('-').map(t => t.trim());
  const val = t => {
    const m = String(t).match(/([\d.,]+)\s*([KkMm]?)/);
    if (!m) return null;
    let v = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
    if (/[Kk]/.test(m[2])) v *= 1e3;
    else if (/[Mm]/.test(m[2])) v *= 1e6;
    return v;
  };
  const a = val(partes[0]), b = val(partes[1] || partes[0]);
  if (!a) return null;
  const cot = estado.cotacaoEuro || 6.3;
  return { txt: j.sal, min: a / 12 * cot, max: (b || a) / 12 * cot };
}

function mesAno(iso) {
  if (!iso || iso.length < 7) return '';
  const M = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return M[parseInt(iso.slice(5, 7), 10) - 1] + '/' + iso.slice(0, 4);
}

/* Acha o jogador na base. O id muda quando a base e regerada, entao a primary_key
   (nome - time - liga) manda; o id fica so como atalho. */
function acharNaBase(ref) {
  if (!ref) return null;
  if (typeof ref === 'number') return BASE.find(x => x.id === ref) || null;
  if (ref.pk) {
    const porPk = BASE.find(x => primaryKey(x) === ref.pk);
    if (porPk) return porPk;
  }
  if (ref.nome) {
    const porNome = BASE.find(x => x.n === ref.nome && x.t === ref.clube);
    if (porNome) return porNome;
  }
  if (ref.jid != null) {
    const porId = BASE.find(x => x.id === ref.jid);
    /* so aceita o id se o nome bater: senao e resto de uma base antiga */
    if (porId && porId.n === ref.nome) return porId;
  }
  return null;
}

async function abrirFicha(ref) {
  const j = acharNaBase(ref);
  const jid = j ? j.id : null;
  if (!j) { toast('Não achei esse jogador na base atual', 'ruim'); return; }
  if (fichaAtual && fichaAtual.id === jid && !$('#ficha').classList.contains('oculta')) {
    return fecharFicha();                 /* clicar de novo no mesmo + fecha */
  }
  fichaAtual = j;
  marcarFichaAberta(jid);
  $('#ficha').classList.remove('oculta');
  $('#fiCorpo').innerHTML = '<div class="fi-sem" style="padding:14px">carregando indicadores…</div>';
  await renderFicha();
  ajustarCampo();
  $('#ficha').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function fecharFicha() {
  $('#ficha').classList.add('oculta');
  fichaAtual = null;
  marcarFichaAberta(null);
  ajustarCampo();
}

function marcarFichaAberta(jid) {
  $$('.jog').forEach(el => el.classList.remove('com-ficha'));
  if (jid == null) return;
  const alvo = BASE.find(x => x.id === jid);
  const pkAlvo = alvo ? primaryKey(alvo) : null;
  POSICOES.forEach(p => (estado.elenco[p.c] || []).forEach(j => {
    if ((j.pk && j.pk === pkAlvo) || (!j.pk && j.jid === jid)) {
      const el = document.querySelector('.jog[data-uid="' + j.uid + '"]');
      if (el) el.classList.add('com-ficha');
    }
  }));
}

/* Os indicadores vivem num arquivo por posicao (0,1 a 2,6 MB). Busca so o da
   posicao aberta e guarda em memoria — no servidor nao fica nada carregado. */
const cachePosKpis = {};
async function kpisDe(j) {
  if (!j || !j.p) return null;
  if (!cachePosKpis[j.p]) {
    cachePosKpis[j.p] = fetch('dados/kpis/' + j.p + '.json' + (window.__verDados ? '?v=' + window.__verDados : ''))
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  const base = await cachePosKpis[j.p];
  if (!base) return null;
  const linhas = base.jogadores[primaryKey(j)];
  if (!linhas) return null;
  return { ok: true, periodo: base.periodo, nomes: base.kpis, linhas };
}

/* coorte para os indicadores que nao vem do kpis (notas e fisico) */
const cacheCoorte = {};
function coorte(j, modo) {
  const ch = modo + '|' + j.p + '|' + (modo === 'posliga' ? j.l : '');
  if (cacheCoorte[ch]) return cacheCoorte[ch];
  let lista = BASE.filter(x => x.p === j.p);
  if (modo === 'posbr') lista = lista.filter(x => x.l.startsWith('Brasil'));
  else if (modo === 'posliga') lista = lista.filter(x => x.l === j.l);
  cacheCoorte[ch] = lista;
  return lista;
}
function estat(lista, campo) {
  const vs = lista.map(x => x[campo]).filter(v => typeof v === 'number' && !isNaN(v));
  if (!vs.length) return null;
  const soma = vs.reduce((s, v) => s + v, 0);
  return { media: soma / vs.length, max: Math.max.apply(null, vs) };
}

/* Uma linha da ficha, na mesma leitura do Ranking:
   rotulo · valor · barra de 0 ao melhor da coorte · media · melhor.
   Verde acima da media, vermelho abaixo, azul quando o jogador e o lider. */
function linhaInd(rot, valor, media, melhor, casas) {
  if (typeof valor !== 'number' || isNaN(valor)) return '';
  const alvo = Math.max(melhor || 0, valor, 0.0001);
  const pct = Math.max(0, Math.min(100, valor / alvo * 100));
  const pctMed = Math.max(0, Math.min(100, (media || 0) / alvo * 100));
  const lider = melhor != null && melhor > 0 && valor >= melhor - 1e-9;
  const classe = lider ? 'lider' : (media == null || valor >= media) ? 'acima' : 'abaixo';
  const f = n => (typeof n === 'number' ? n.toFixed(casas).replace('.', ',') : '—');
  return '<div class="fi-linha ' + classe + '" title="' + esc(rot) + ': ' + f(valor) +
      ' · média ' + f(media) + ' · melhor ' + f(melhor) + '">' +
    '<span class="rot">' + esc(rot) + '</span>' +
    '<span class="val">' + f(valor) + '</span>' +
    '<span class="fi-barra"><i style="width:' + pct.toFixed(1) + '%"></i>' +
      (media != null ? '<span class="marca" style="left:' + pctMed.toFixed(1) + '%"></span>' : '') +
    '</span>' +
    '<span class="med">' + f(media) + '</span>' +
    '<span class="mx">' + f(melhor) + '</span>' +
  '</div>';
}

/* Monta as tres partes da ficha (cabecalho, indicadores, rodape) para quem quiser
   exibir: o painel abaixo do campo ou a linha expandida dentro da busca. */
async function montarFicha(j, modo) {
  const lista = coorte(j, modo);
  const ex = ehEstrangeiroBase(j);
  const fx = faixaSalarioTR(j);
  const CONF = { alta: 'confirmado', baixa: 'fonte única', conflito: 'fontes divergem',
                 contestada: 'contestado', sem_fonte: 'sem fonte', manual: 'manual' };

  const titulo = esc(j.nc || j.n) +
    (j.nc && j.nc !== j.n ? ' <span class="apelido">' + esc(j.n) + '</span>' : '') +
    (ex ? ' <span class="selo-ex">' + esc(sigla(j.nac)) + '</span>' : '') +
    (j.emp ? ' <span class="selo-emp" title="emprestado">emprestado</span>' : '');
  const sub = j.t + ' · ' + j.l + ' · ' + j.p + (j.pw ? ' (' + j.pw + ')' : '') +
    (j.rk ? ' · #' + j.rk + ' da liga na posição' : '') +
    (j.rk_ok ? '' : ' · sem indicadores (minutagem baixa)');

  const cabeca = [
    ['Idade', j.id_ ? j.id_ + ' anos' : '—', ''],
    ['Contrato', mesAno(j.ct) || '—', j.ctc ? (CONF[j.ctc] || j.ctc) +
      (j.ctf && j.ctf.length ? ' · ' + j.ctf.join(', ') : '') : ''],
    ['Salário estimado', fx ? brl(fx.min, true) + '–' + brl(fx.max, true) : '—',
      fx ? 'TransferRoom: ' + fx.txt + '/ano' : ''],
    ['Altura · peso', (j.alt ? j.alt + ' cm' : '—') + (j.peso ? ' · ' + j.peso + ' kg' : ''), ''],
    ['Pé', j.pe || '—', ''],
    ['Nacionalidade', j.nac || '—', ''],
    ['Jogos · minutos', (j.jog || 0) + ' · ' + milhar(j.min), ''],
    ['Valor de mercado', j.mv ? brl(j.mv, true) : '—', j.xtv ? 'xTV ' + brl(j.xtv, true) : ''],
  ].map(([r, v, obs]) => '<div class="fi-dado"><div class="r">' + r + '</div>' +
    '<div class="v' + (String(v).length > 9 ? ' pq' : '') + '">' + esc(v) + '</div>' +
    (obs ? '<div class="o">' + esc(obs) + '</div>' : '') + '</div>').join('');

  const dados = await kpisDe(j);
  let colunas = '';
  if (dados && dados.ok) {
    const porGrupo = {};
    dados.linhas.forEach(([id, v, med, mx]) => {
      const [grupo, rot] = dados.nomes[id];
      (porGrupo[grupo] = porGrupo[grupo] || []).push([rot, v, med, mx]);
    });
    GRUPOS_FICHA.forEach(g => {
      const linhas = porGrupo[g];
      if (!linhas || !linhas.length) return;
      const casas = g === 'Decisão (DGP)' ? 2 : 1;
      colunas += '<div class="fi-grupo"><h4>' + g + '</h4>' +
        linhas.map(([rot, v, med, mx]) => linhaInd(rot, v, med, mx, casas)).join('') + '</div>';
    });
  } else {
    colunas += '<div class="fi-grupo"><h4>Indicadores</h4>' +
      '<div class="fi-sem">este jogador não tem indicadores no ranking — o cadastro vem ' +
      'do levantamento de fim de contrato (Transfermarkt)</div></div>';
  }

  /* 5a coluna: fisico do SkillCorner, comparado com a mesma coorte */
  let colFis = '';
  FISICO.forEach(([campo, rot, casas]) => {
    if (typeof j[campo] !== 'number') return;
    const e = estat(lista, campo);
    if (e) colFis += linhaInd(rot, j[campo], e.media, e.max, casas);
  });
  colunas += '<div class="fi-grupo"><h4>Físico (SkillCorner)</h4>' +
    (colFis || '<div class="fi-sem">sem tracking para este jogador</div>') + '</div>';

  const corpo = '<div class="fi-grid">' + colunas + '</div>' +
    '<div class="fi-leg">' +
      '<span><i class="v"></i>acima da média</span>' +
      '<span><i class="r"></i>abaixo</span>' +
      '<span><i class="a"></i>líder da coorte</span>' +
      '<span><i class="m"></i>média da coorte</span>' +
      '<span class="num-leg">média</span>' +
      '<span class="num-leg forte">melhor</span>' +
    '</div>';

  const rodape = 'Comparado com ' + milhar(lista.length) + ' jogadores de ' + j.p +
    (modo === 'posbr' ? ' nas ligas brasileiras' : modo === 'posliga' ? ' da ' + j.l : ' de todas as ligas') +
    ' · período ' + (dados && dados.periodo ? dados.periodo : 'ago26');

  return { titulo, sub, cabeca, corpo, rodape };
}

async function renderFicha() {
  const j = fichaAtual;
  if (!j) return;
  const modo = $('#fiBase').value || 'posliga';
  const f = await montarFicha(j, modo);
  $('#fiNome').innerHTML = f.titulo;
  $('#fiSub').textContent = f.sub;
  $('#fiCabeca').innerHTML = f.cabeca;
  $('#fiCorpo').innerHTML = f.corpo;
  $('#fiRodape').textContent = f.rodape;
}

/* ---- detalhe aberto dentro da lista de busca, na própria linha ---- */
async function alternarDetalhe(tr, jid) {
  const aberto = tr.nextElementSibling && tr.nextElementSibling.classList.contains('detalhe');
  $$('#tbody tr.detalhe').forEach(x => x.remove());
  $$('#tbody .ver-ficha').forEach(b => b.textContent = '+');
  if (aberto) return;

  const j = BASE.find(x => x.id === jid);
  if (!j) return;
  const linha = document.createElement('tr');
  linha.className = 'detalhe';
  linha.innerHTML = '<td colspan="' + COLUNAS.length + '">' +
    '<div class="det-carregando">carregando indicadores…</div></td>';
  tr.after(linha);
  tr.querySelector('.ver-ficha').textContent = '−';

  const f = await montarFicha(j, ($('#fiBase') && $('#fiBase').value) || 'posliga');
  linha.querySelector('td').innerHTML =
    '<div class="det"><div class="det-topo"><b>' + f.titulo + '</b>' +
      '<span class="sub">' + esc(f.sub) + '</span>' +
      '<button class="bt mini det-add">+ adicionar em ' + posAtual + '</button></div>' +
      '<div class="det-cabeca">' + f.cabeca + '</div>' + f.corpo +
      '<div class="det-pe">' + esc(f.rodape) + '</div></div>';
  const add = linha.querySelector('.det-add');
  if (add) add.onclick = e => { e.stopPropagation(); adicionarDaBase(jid); };
}

/* ---------------- aba: fim de contrato ---------------- */
/* Mesma leitura da Base de Fontes do portal de fim de contrato: uma coluna por
   fonte, celula = a data que aquela fonte informa. Verde = igual ao consenso,
   ambar = diverge, vazia = a fonte nao tem o jogador. */
const FC_FONTES = [
  ['wyscout', 'Wyscout'], ['transfermarkt', 'TMarkt'], ['transferroom', 'TRoom'],
  ['sofascore', 'SofaScore'], ['capology', 'Capology'], ['fotmob', 'FotMob'],
];
const FC_CONF = { alta: ['ok', 'confirmado por mais de uma fonte'],
                  baixa: ['duvida', 'fonte única'],
                  conflito: ['erro', 'fontes divergem'],
                  contestada: ['erro', 'contestado'],
                  sem_fonte: ['nulo', 'sem fonte'],
                  manual: ['ok', 'ajustado à mão'] };

function fcData(iso) {
  if (!iso || iso.length < 10) return '';
  return iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(2, 4);
}

const FC_COLUNAS = [
  { c: 'n', r: 'Jogador', w: 15, cel: j =>
      '<div class="fc-nome"><b>' + esc(j.n) + '</b>' +
      (ehEstrangeiroBase(j) ? ' <span class="selo-ex">' + esc(sigla(j.nac)) + '</span>' : '') +
      (j.ov ? ' <span class="fc-ovr">' + j.ov + '</span>' : '') +
      '<span class="fc-clube">' + esc(j.t) + ' · ' + esc(j.l) + '</span></div>' },
  { c: 'p',   r: 'Pos.',  w: 4,  cel: j => j.p },
  { c: 'id_', r: 'Idade', w: 4,  num: 1, cel: j => j.id_ ?? '—' },
  { c: 'min3', r: 'Minutos · 3 temp.', w: 9,
    t: 'Minutos das últimas três temporadas (Wyscout). Cada barra é um ano, cheia quando ' +
       'ele jogou uma temporada inteira; o número é a soma das três.',
    num: 1, cel: j => {
      const pk = primaryKey(j), r = histResumo(pk);
      if (!r) return '<span class="fc-vazia">–</span>';
      return '<div class="fc-carr">' + barraMinutos(hist(pk)) +
        '<b class="fc-min">' + milhar(r.min) + '</b></div>'; } },
  { c: 'g3', r: 'Gols · 3 temp.', w: 7,
    t: 'Gols nas últimas três temporadas. O selo mostra em quantas delas fez ' +
       GOLS_TEMPORADA + ' gols ou mais.',
    num: 1, cel: j => {
      const pk = primaryKey(j), r = histResumo(pk, GOLS_TEMPORADA);
      if (!r) return '<span class="fc-vazia">–</span>';
      return '<div class="fc-carr">' +
        '<b class="fc-gols' + (r.gols ? '' : ' zero') + '">' + r.gols + '</b>' +
        (r.goleadoras >= 2 ? '<span class="fc-rec" title="' + r.goleadoras + ' temporadas com ' +
          GOLS_TEMPORADA + '+ gols">' + r.goleadoras + '/3</span>' : '') + '</div>'; } },
  { c: 'cob', r: 'Bola parada', w: 7,
    t: 'Cobranças por 90 na temporada atual (escanteios + faltas) e gols de cabeça nas três ' +
       'temporadas. O Wyscout não marca a origem do gol: são os dois lados possíveis da ' +
       'bola parada — quem cobra e quem cabeceia.',
    num: 1, cel: j => {
      const pk = primaryKey(j), r = histResumo(pk);
      if (!r || (!r.cobrancas && !r.cabeca)) return '<span class="fc-vazia">–</span>';
      return '<div class="fc-bp">' +
        (r.cobrancas ? '<b title="escanteios + faltas por 90">' + fsFmt(r.cobrancas, 2) + '</b>' : '') +
        (r.cabeca ? '<span class="fc-cab" title="' + r.cabeca + ' gols de cabeça nas três temporadas">' +
          r.cabeca + ' cab.</span>' : '') +
        (r.penaltis ? '<span class="fc-pen" title="pênaltis cobrados nas três temporadas">' +
          r.penaltis + ' pên.</span>' : '') + '</div>'; } },
];
FC_FONTES.forEach(([k, rot]) => {
  FC_COLUNAS.push({ c: 'src_' + k, r: rot, w: 7, num: 1, fonte: k, cel: j => {
    const v = (j.src || {})[k];
    if (!v) return '<span class="fc-vazia">–</span>';
    const igual = j.ct && v.slice(0, 10) === j.ct.slice(0, 10);
    return '<span class="fc-fonte ' + (igual ? 'igual' : 'diverge') + '">' + fcData(v) + '</span>';
  } });
});
FC_COLUNAS.push(
  { c: 'ct', r: 'Consenso', w: 9, num: 1, cel: j => {
      const [cl, tit] = FC_CONF[j.ctc] || ['nulo', 'sem fonte'];
      return '<b class="fc-consenso">' + (fcData(j.ct) || '—') + '</b>' +
             '<span class="fc-luz ' + cl + '" title="' + tit +
             (j.ctf && j.ctf.length ? ': ' + j.ctf.join(', ') : '') + '"></span>'; } },
  { c: 'sal', r: 'Salário', w: 8, num: 1, cel: j => {
      const f = faixaSalarioTR(j);
      return f ? '<span title="TransferRoom: ' + esc(f.txt) + '/ano">' + brl(f.min, true) +
                 '<span class="fc-ast">*</span></span>'
               : '<span class="fc-vazia">–</span>'; } },
  { c: '_', r: '', w: 11, cel: j => '<button class="fc-add">levar p/ ' + j.p + '</button>' +
      '<button class="ver-ficha" title="Ver detalhe">+</button>' },
);

let fcOrdem = { campo: 'ct', desc: false };   /* vencendo primeiro */

/* ---------------- painel de filtros no formato do Ranking ----------------
   Campinho clicavel para a posicao, combos de multi-selecao com abas de regiao,
   botoes "no exterior" e sliders duplos — o mesmo desenho do Ranking do hub.
   O "Contrato ate" fica como esta (seletor de mes): e o Ranking que vai migrar
   para esse modelo, nao o contrario. */
const MSELS = {};
function mselInit(id, itens, op) {
  const el = $('#' + id);
  if (!el) return;
  const rotuloTodos = op.rotuloTodos || 'Todas';
  MSELS[id] = { itens, rotuloTodos, masc: !!op.masc, aoMudar: op.aoMudar || (() => {}) };
  const busca = itens.length > 25;
  el.innerHTML =
    '<div class="msel-bt" title="Clique escolhe só um · Cmd/Ctrl/Shift+clique combina vários"></div>' +
    '<div class="msel-drop">' +
      (busca ? '<div class="msel-busca"><input type="text" placeholder="Filtrar…" autocomplete="off"></div>' : '') +
      '<div class="msel-dica">clique = só este · Cmd/Ctrl/Shift = combina</div>' +
      '<div class="msel-item todos"><input type="checkbox" tabindex="-1"> ' + esc(rotuloTodos) + '</div>' +
      itens.map(it => '<div class="msel-item" data-v="' + esc(it) + '"><input type="checkbox" value="' +
        esc(it) + '" checked tabindex="-1"> ' + esc(it) + '</div>').join('') +
    '</div>';
  el.querySelector('.msel-bt').onclick = e => { e.stopPropagation(); mselAbrir(id); };
  el.querySelector('.msel-drop').onclick = e => e.stopPropagation();
  el.querySelector('.msel-item.todos').onclick = () => mselMarcar(id, null);
  el.querySelectorAll('.msel-item[data-v]').forEach(it => {
    it.onclick = e => {
      const v = it.dataset.v;
      const cbs = [...el.querySelectorAll('.msel-drop input[value]')];
      if (e.shiftKey || e.metaKey || e.ctrlKey) {
        /* com todos marcados, o primeiro Cmd+clique comeca uma selecao nova */
        if (cbs.every(c => c.checked)) cbs.forEach(c => { c.checked = c.value === v; });
        else {
          const cb = cbs.find(c => c.value === v);
          cb.checked = !cb.checked;
          if (!cbs.some(c => c.checked)) cbs.forEach(c => { c.checked = true; });
        }
      } else {
        const marcados = cbs.filter(c => c.checked);
        const soEste = marcados.length === 1 && marcados[0].value === v;
        cbs.forEach(c => { c.checked = soEste ? true : c.value === v; });
      }
      mselAtualizar(id);
      MSELS[id].aoMudar();
    };
  });
  if (busca) {
    const inp = el.querySelector('.msel-busca input');
    inp.oninput = () => {
      const t = fsNorm(inp.value);
      el.querySelectorAll('.msel-item[data-v]').forEach(it => {
        it.style.display = !t || fsNorm(it.dataset.v).includes(t) ? '' : 'none';
      });
    };
    inp.onclick = e => e.stopPropagation();
  }
  mselAtualizar(id);
}
function mselAbrir(id) {
  const drop = $('#' + id + ' .msel-drop');
  if (!drop) return;
  const aberto = drop.classList.contains('aberto');
  $$('.msel-drop.aberto').forEach(d => d.classList.remove('aberto'));
  if (aberto) return;
  drop.classList.add('aberto');
  const b = drop.querySelector('.msel-busca input');
  if (b) { b.value = ''; b.oninput(); b.focus(); }
}
document.addEventListener('click', () => $$('.msel-drop.aberto').forEach(d => d.classList.remove('aberto')));
/* marca um conjunto (null = todos). `quieto` nao dispara o aoMudar. */
function mselMarcar(id, conjunto, quieto) {
  const el = $('#' + id);
  if (!el) return;
  const cbs = [...el.querySelectorAll('.msel-drop input[value]')];
  cbs.forEach(c => { c.checked = !conjunto || conjunto.has(c.value); });
  if (!cbs.some(c => c.checked)) cbs.forEach(c => { c.checked = true; });
  mselAtualizar(id);
  if (!quieto) MSELS[id].aoMudar();
}
function mselAtualizar(id) {
  const el = $('#' + id), m = MSELS[id];
  if (!el || !m) return;
  const cbs = [...el.querySelectorAll('.msel-drop input[value]')];
  const sel = cbs.filter(c => c.checked);
  const todos = el.querySelector('.msel-item.todos input');
  if (todos) todos.checked = sel.length === cbs.length;
  const bt = el.querySelector('.msel-bt');
  const parcial = sel.length && sel.length !== cbs.length;
  bt.textContent = !parcial ? m.rotuloTodos
                 : sel.length <= 3 ? sel.map(c => c.value).join(', ')
                 : sel.length + (m.masc ? ' selecionados' : ' selecionadas');
  bt.title = parcial ? sel.map(c => c.value).join(', ') : 'Clique escolhe só um · Cmd/Ctrl/Shift+clique combina vários';
  bt.classList.toggle('ativo', !!parcial);
}
/* null = todos marcados (sem filtro) */
function mselSelecionados(id) {
  const el = $('#' + id);
  if (!el) return null;
  const cbs = [...el.querySelectorAll('.msel-drop input[value]')];
  const sel = cbs.filter(c => c.checked).map(c => c.value);
  return (!sel.length || sel.length === cbs.length) ? null : new Set(sel);
}

/* campinho: zonas em % da caixa, mesmo desenho do Ranking (esquerda em cima) */
const ZONAS_CAMPO = [
  { c: 'GOL', x: 0,  y: 32, w: 8,  h: 36 },
  { c: 'ZE',  x: 8,  y: 18, w: 14, h: 28 }, { c: 'ZD',  x: 8,  y: 54, w: 14, h: 28 },
  { c: 'LE',  x: 20, y: 2,  w: 12, h: 22 }, { c: 'LD',  x: 20, y: 76, w: 12, h: 22 },
  { c: 'VOL', x: 34, y: 28, w: 12, h: 44 },
  { c: 'MED', x: 48, y: 20, w: 12, h: 26 }, { c: 'MEI', x: 48, y: 54, w: 12, h: 26 },
  { c: 'EE',  x: 64, y: 2,  w: 14, h: 22 }, { c: 'ED',  x: 64, y: 76, w: 14, h: 22 },
  { c: 'CA',  x: 80, y: 26, w: 16, h: 48 },
];
function nomePos(c) { const p = POSICOES.find(x => x.c === c); return p ? p.nome : c; }
function campinhoInit(idCampo, aoMudar, unica) {
  const campo = $('#' + idCampo);
  if (!campo) return;
  campo.innerHTML = '<div class="rk-area-esq"></div><div class="rk-area-dir"></div>' +
    ZONAS_CAMPO.map(z => '<div class="rk-zona" data-pos="' + z.c + '" style="left:' + z.x + '%;top:' + z.y +
      '%;width:' + z.w + '%;height:' + z.h + '%" title="' + esc(nomePos(z.c)) + '">' + z.c + '</div>').join('') +
    '<span class="rk-pos-nome"></span>';
  campo.querySelectorAll('.rk-zona').forEach(z => {
    z.onclick = e => {
      const ativas = [...campo.querySelectorAll('.rk-zona.on')];
      if (!unica && (e.metaKey || e.ctrlKey || e.shiftKey)) z.classList.toggle('on');
      else {
        const eraUnica = ativas.length === 1 && ativas[0] === z;
        ativas.forEach(a => a.classList.remove('on'));
        if (!eraUnica || unica) z.classList.add('on');
      }
      campinhoRotulo(campo);
      aoMudar();
    };
  });
  campinhoRotulo(campo);
}
function campinhoRotulo(campo) {
  const on = [...campo.querySelectorAll('.rk-zona.on')];
  campo.querySelector('.rk-pos-nome').textContent =
    !on.length ? 'Todas' : on.length === 1 ? nomePos(on[0].dataset.pos) : on.map(z => z.dataset.pos).join(' + ');
}
function campinhoSelecao(idCampo) {
  return new Set($$('#' + idCampo + ' .rk-zona.on').map(z => z.dataset.pos));
}
function campinhoDefinir(idCampo, lista) {
  const s = new Set(lista || []);
  $$('#' + idCampo + ' .rk-zona').forEach(z => z.classList.toggle('on', s.has(z.dataset.pos)));
  campinhoRotulo($('#' + idCampo));
}

/* sliders duplos: dois <input type=range> sobrepostos, com a faixa pintada entre eles */
function rangesInit(idCont, defs, aoMudar) {
  const cont = $('#' + idCont);
  if (!cont) return;
  cont.innerHTML = defs.map(d =>
    '<div class="rk-range" data-k="' + d.k + '" data-min="' + d.min + '" data-max="' + d.max + '">' +
      '<label>' + d.r + '</label>' +
      '<div class="vals"><span class="lo"></span><span class="hi"></span></div>' +
      '<div class="rk-range-wrap"><div class="rk-trilho"></div><div class="rk-cheio"></div>' +
        '<input type="range" class="lo" min="' + d.min + '" max="' + d.max + '" step="' + d.passo + '" value="' + d.min + '">' +
        '<input type="range" class="hi" min="' + d.min + '" max="' + d.max + '" step="' + d.passo + '" value="' + d.max + '">' +
      '</div></div>').join('');
  defs.forEach(d => {
    const f = cont.querySelector('.rk-range[data-k="' + d.k + '"]');
    const lo = f.querySelector('input.lo'), hi = f.querySelector('input.hi');
    const fmt = d.fmt || (v => String(v));
    const atualizar = (disparar) => {
      if (+lo.value > +hi.value) { const t = lo.value; lo.value = hi.value; hi.value = t; }
      f.querySelector('.vals .lo').textContent = fmt(+lo.value);
      f.querySelector('.vals .hi').textContent = fmt(+hi.value);
      const pLo = (lo.value - d.min) / (d.max - d.min) * 100, pHi = (hi.value - d.min) / (d.max - d.min) * 100;
      const cheio = f.querySelector('.rk-cheio');
      cheio.style.left = pLo + '%'; cheio.style.width = (pHi - pLo) + '%';
      f.classList.toggle('ativo', +lo.value > d.min || +hi.value < d.max);
      if (disparar) aoMudar();
    };
    lo.oninput = hi.oninput = () => atualizar(true);
    f._reset = () => { lo.value = d.min; hi.value = d.max; atualizar(false); };
    atualizar(false);
  });
}
/* null quando o slider esta aberto de ponta a ponta (sem filtro) */
function rangeValor(idCont, k) {
  const f = $('#' + idCont + ' .rk-range[data-k="' + k + '"]');
  if (!f) return null;
  const lo = +f.querySelector('input.lo').value, hi = +f.querySelector('input.hi').value;
  return (lo <= +f.dataset.min && hi >= +f.dataset.max) ? null : { lo, hi };
}
/* Move as pontas de um slider por codigo (atalhos). null = deixa a ponta onde esta. */
function rangeDefinir(idCont, k, lo, hi) {
  const f = $('#' + idCont + ' .rk-range[data-k="' + k + '"]');
  if (!f) return;
  const eLo = f.querySelector('input.lo'), eHi = f.querySelector('input.hi');
  if (lo != null) eLo.value = lo;
  if (hi != null) eHi.value = hi;
  eLo.dispatchEvent(new Event('input'));
}

function rangesReset(idCont) { $$('#' + idCont + ' .rk-range').forEach(f => f._reset && f._reset()); }

function fmtMilhoes(v) {
  return v >= 1e6 ? (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'M'
       : v >= 1e3 ? Math.round(v / 1e3) + 'K' : String(v);
}
/* `val` le do historico de tres temporadas; sem `val`, le direto o campo da base.
   Quem nao tem o dado sai da lista quando a faixa e mexida — e o que se espera de
   um filtro por gols: sem numero, nao passa. */
const RANGES_FC = [
  { k: 'alt', r: 'Altura (cm)',   min: 150, max: 210,       passo: 1 },
  { k: 'id_', r: 'Idade',         min: 15,  max: 45,        passo: 1 },
  { k: 'mv',  r: 'Valor mercado', min: 0,   max: 120000000, passo: 500000, fmt: fmtMilhoes },
  { k: 'ov',  r: 'Overall',       min: 0,   max: 100,       passo: 1 },
  { k: 'min', r: 'Minutos',       min: 0,   max: 5000,      passo: 50 },
  { k: 'g3',  r: 'Gols · 3 temp.', min: 0, max: 60, passo: 1,
    val: j => { const r = histResumo(primaryKey(j)); return r ? r.gols : null; } },
  { k: 'cob', r: 'Bola parada /90', min: 0, max: 8, passo: 0.25,
    val: j => { const r = histResumo(primaryKey(j)); return r ? r.cobrancas : null; } },
];
const PES = ['Direito', 'Esquerdo', 'Ambos', 'Desconhecido'];
function rotuloPe(v) {
  return v === 'direito' ? 'Direito' : v === 'esquerdo' ? 'Esquerdo' : v === 'ambos' ? 'Ambos' : 'Desconhecido';
}
function classLiga(l) {
  if (!l) return 'demais';
  if (l.startsWith('Brasil')) return 'brasil';
  if (GRUPOS_LIGA.sulamerica.includes(l)) return 'sulamerica';
  if (GRUPOS_LIGA.europa.includes(l)) return 'europa';
  return 'demais';
}
function classPais(nac) {
  if (nac === 'Brazil') return 'br';
  if (PAISES_SUL.has(nac)) return 'sa';
  return 'demais';
}

function fcFiltrar() {
  const ate = $('#fcAte').value;
  const soConf = $('#fcSoConf').checked;
  const txt = fsNorm($('#fcTexto').value.trim());
  const poss = campinhoSelecao('fcCampo');
  const ligas = mselSelecionados('fcLigaSel');
  const paises = mselSelecionados('fcPaisSel');
  const times = mselSelecionados('fcTimeSel');
  const pes = mselSelecionados('fcPeSel');
  const faixas = RANGES_FC.map(d => [d, rangeValor('fcRanges', d.k)]).filter(x => x[1]);
  const recorrente = $('#fcRecorrente').checked;

  return BASE.filter(j => {
    if (!j.ct) return false;
    if (ate && j.ct.slice(0, 7) > ate) return false;
    if (soConf && j.ctc !== 'alta') return false;
    if (poss.size && !poss.has(j.p)) return false;
    if (ligas && !ligas.has(j.l)) return false;
    if (paises && !paises.has(j.nac || '')) return false;
    if (times && !times.has(j.t)) return false;
    if (pes && !pes.has(rotuloPe(j.pe))) return false;
    for (const [d, f] of faixas) {
      const v = d.val ? d.val(j) : j[d.k];
      if (typeof v !== 'number' || isNaN(v) || v < f.lo || v > f.hi) return false;
    }
    if (recorrente) {
      const r = histResumo(primaryKey(j), GOLS_TEMPORADA);
      if (!r || r.goleadoras < 2) return false;
    }
    if (txt && !fsNorm(j.n + ' ' + j.t).includes(txt)) return false;
    return true;
  });
}

function fcRender() {
  if (!BASE.length) return;
  const th = $('#fcThead');
  if (!th.dataset.pronto) {
    th.innerHTML = '<tr>' + FC_COLUNAS.map(c =>
      '<th data-ord="' + c.c + '"' + (c.num ? ' class="num-c"' : '') +
      ' style="width:' + c.w + '%">' + c.r + '</th>').join('') + '</tr>';
    th.dataset.pronto = '1';
    th.querySelectorAll('th').forEach(el => {
      el.onclick = () => {
        const c = el.dataset.ord;
        if (c === '_') return;
        if (fcOrdem.campo === c) fcOrdem.desc = !fcOrdem.desc;
        else {
          fcOrdem.campo = c;
          fcOrdem.desc = !(c === 'n' || c === 'p' || c === 'ct' || c.startsWith('src_'));
        }
        th.querySelectorAll('.set').forEach(x => x.remove());
        el.insertAdjacentHTML('beforeend', '<span class="set">' + (fcOrdem.desc ? '▼' : '▲') + '</span>');
        fcRender();
      };
    });
  }

  const lista = fcFiltrar();
  const camp = fcOrdem.campo, desc = fcOrdem.desc;
  const valor = (j) => camp === 'sal' ? (faixaSalarioTR(j) || {}).min
                     : camp.startsWith('src_') ? ((j.src || {})[camp.slice(4)] || '')
                     : camp === 'min3' ? ((histResumo(primaryKey(j)) || {}).min)
                     : camp === 'g3' ? ((histResumo(primaryKey(j), GOLS_TEMPORADA) || {}).gols)
                     : camp === 'cob' ? ((histResumo(primaryKey(j)) || {}).cobrancas)
                     : j[camp];
  lista.sort((a, b) => {
    let x = valor(a), y = valor(b);
    if (typeof x === 'string' || typeof y === 'string') {
      x = String(x || ''); y = String(y || '');
      return desc ? y.localeCompare(x) : x.localeCompare(y);
    }
    x = Number(x) || 0; y = Number(y) || 0;
    return desc ? y - x : x - y;
  });

  const LIM = 300;
  const jaNoElenco = new Set(todosJogadores().map(j => j.pk).filter(Boolean));
  const linhas = lista.slice(0, LIM);
  $('#fcTbody').innerHTML = linhas.map(j =>
    '<tr data-id="' + j.id + '"' + (jaNoElenco.has(primaryKey(j)) ? ' class="ja"' : '') + '>' +
    FC_COLUNAS.map(c => '<td' + (c.num ? ' class="num-c"' : '') + '>' + c.cel(j) + '</td>').join('') +
    '</tr>').join('');
  $('#fcVazio').style.display = linhas.length ? 'none' : 'block';
  $('#fcContagem').innerHTML = '<b>' + milhar(lista.length) + '</b> jogadores com contrato ' +
    'até ' + (mesAno($('#fcAte').value + '-01') || '—') +
    (lista.length > LIM ? ' · exibindo os ' + LIM + ' primeiros' : '') +
    ' · clique na linha para levar ao campograma';

  $$('#fcTbody tr').forEach(tr => {
    const id = parseInt(tr.dataset.id);
    const levar = () => {
      const j = BASE.find(x => x.id === id);
      if (!j) return;
      posAtual = j.p;
      adicionarDaBase(id);
      fcRender();
    };
    tr.onclick = levar;
    tr.querySelector('.fc-add').onclick = e => { e.stopPropagation(); levar(); };
    tr.querySelector('.ver-ficha').onclick = e => { e.stopPropagation(); abrirFicha(id); irParaAba('campo'); };
  });
}

function fcAbasMarcar(idAbas, r) {
  $$('#' + idAbas + ' button').forEach(b => b.classList.toggle('on', b.dataset.r === r));
}
function fcExtMarcar(tipo) {
  $$('#fcExt button').forEach(b => b.classList.toggle('on', b.dataset.e === tipo));
}
function fcSetLiga(r, quieto) {
  mselMarcar('fcLigaSel', r === 'todos' ? null : new Set(GRUPOS_LIGA[r] || []), true);
  fcAbasMarcar('fcLigaAbas', r);
  fcExtMarcar(null);
  if (!quieto) fcRender();
}
function fcSetPais(r) {
  const todos = MSELS.fcPaisSel ? MSELS.fcPaisSel.itens : [];
  mselMarcar('fcPaisSel', r === 'todos' ? null : new Set(todos.filter(n => classPais(n) === r)), true);
  fcAbasMarcar('fcPaisAbas', r);
  fcExtMarcar(null);
  fcRender();
}
/* "No exterior": brasileiros = pais Brasil + ligas nao brasileiras;
   sul-americanos = paises SA (sem Brasil) + ligas fora da America do Sul */
function fcSetExterior(tipo) {
  const paises = MSELS.fcPaisSel ? MSELS.fcPaisSel.itens : [];
  const ligas = MSELS.fcLigaSel ? MSELS.fcLigaSel.itens : [];
  if (!tipo) {
    mselMarcar('fcPaisSel', null, true); mselMarcar('fcLigaSel', null, true);
    fcAbasMarcar('fcPaisAbas', 'todos'); fcAbasMarcar('fcLigaAbas', 'todos');
  } else if (tipo === 'br_ext') {
    mselMarcar('fcPaisSel', new Set(['Brazil']), true);
    mselMarcar('fcLigaSel', new Set(ligas.filter(l => classLiga(l) !== 'brasil')), true);
    fcAbasMarcar('fcPaisAbas', null); fcAbasMarcar('fcLigaAbas', null);
  } else {
    mselMarcar('fcPaisSel', new Set(paises.filter(n => classPais(n) === 'sa')), true);
    mselMarcar('fcLigaSel', new Set(ligas.filter(l => classLiga(l) !== 'brasil' && classLiga(l) !== 'sulamerica')), true);
    fcAbasMarcar('fcPaisAbas', null); fcAbasMarcar('fcLigaAbas', null);
  }
  fcExtMarcar(tipo);
  fcRender();
}
/* Atalhos para os dois perfis que o usuario pediu por nome. Cada um so mexe no que
   lhe diz respeito — o resto dos filtros fica como estava. */
function fcAtalho(qual) {
  if (qual === 'artilheiros') {
    campinhoDefinir('fcCampo', ['EE', 'ED', 'CA']);
    rangeDefinir('fcRanges', 'g3', 12, null);
    $('#fcRecorrente').checked = true;
    fcOrdem = { campo: 'g3', desc: true };
  } else if (qual === 'bolaparada') {
    rangeDefinir('fcRanges', 'cob', 2, null);
    $('#fcRecorrente').checked = false;
    fcOrdem = { campo: 'cob', desc: true };
  }
  fcRender();
}

function fcLimpar() {
  campinhoDefinir('fcCampo', []);
  $('#fcRecorrente').checked = false;
  fcOrdem = { campo: 'ct', desc: false };
  fcSetLiga('brasil', true);
  mselMarcar('fcPaisSel', null, true); fcAbasMarcar('fcPaisAbas', 'todos');
  mselMarcar('fcTimeSel', null, true); mselMarcar('fcPeSel', null, true);
  rangesReset('fcRanges');
  $('#fcAte').value = '2026-12'; $('#fcSoConf').checked = true; $('#fcTexto').value = '';
  fcRender();
}

function fcMontarFiltros() {
  const comCt = BASE.filter(j => j.ct);
  const distintos = f => {
    const c = {};
    comCt.forEach(j => { const v = f(j); if (v) c[v] = 1; });
    return Object.keys(c).sort((a, b) => a.localeCompare(b));
  };
  campinhoInit('fcCampo', fcRender);
  mselInit('fcLigaSel', distintos(j => j.l), { rotuloTodos: 'Todas as ligas',
    aoMudar: () => { fcAbasMarcar('fcLigaAbas', null); fcExtMarcar(null); fcRender(); } });
  mselInit('fcPaisSel', distintos(j => j.nac), { rotuloTodos: 'Todos os países', masc: true,
    aoMudar: () => { fcAbasMarcar('fcPaisAbas', null); fcExtMarcar(null); fcRender(); } });
  mselInit('fcTimeSel', distintos(j => j.t), { rotuloTodos: 'Todos os times', masc: true, aoMudar: fcRender });
  mselInit('fcPeSel', PES, { rotuloTodos: 'Todos os pés', masc: true, aoMudar: fcRender });
  rangesInit('fcRanges', RANGES_FC, debounce(fcRender, 150));
  $$('#fcLigaAbas button').forEach(b => { b.onclick = () => fcSetLiga(b.dataset.r); });
  $$('#fcPaisAbas button').forEach(b => { b.onclick = () => fcSetPais(b.dataset.r); });
  $$('#fcExt button').forEach(b => { b.onclick = () => fcSetExterior(b.classList.contains('on') ? null : b.dataset.e); });
  ['#fcAte', '#fcSoConf', '#fcRecorrente'].forEach(sel => { $(sel).onchange = fcRender; });
  $$('#fcAtalhos button').forEach(b => { b.onclick = () => fcAtalho(b.dataset.a); });
  $('#fcTexto').oninput = debounce(fcRender, 200);
  $('#fcLimpar').onclick = fcLimpar;
  fcSetLiga('brasil', true);
}

/* ---------------- aba Físico (SkillCorner), na leitura do estudo Montoro ----------------
   Uma matriz: linhas sao os indicadores, separados em cinco grupos (velocidade, uso da
   velocidade, arranque e frenagem, giro e volume); colunas sao jogadores. A regua de
   tudo e a coorte da posicao escolhida nas Series A e B: cada celula traz a barrinha
   do percentil do jogador nessa coorte (verde no topo, vermelho no fim) e o valor.
   Por padrao entram os 5 melhores de cada serie pelo indice fisico geral, mais as
   medias da Serie A e da Serie B. Quem quiser compara qualquer um da base (ou do
   campograma) contra essa regua. */
const FS_GRUPOS = [
  { t: 'Velocidade', d: 'O teto: quão rápido chega.', m: [
    ['vmax3', 'Top 3 Peak Velocity',          'km/h',  2],
    ['psv5',  'PSV-99, 5 melhores partidas',  'km/h',  2],
    ['vmax',  'Peak Velocity',                'km/h',  2],
    ['psv',   'PSV-99 por partida',           'km/h',  2] ] },
  { t: 'Uso da velocidade', d: 'Quanto vai buscar essa faixa por 90 minutos.', m: [
    ['spr_km', 'Metros em sprint',            'm/90',  0],
    ['spr_n',  'Número de sprints',           'por 90', 1],
    ['hsr',    'Metros em corrida rápida',    'm/90',  0],
    ['hsr_n',  'Corridas rápidas',            'por 90', 1],
    ['hi',     'Metros em alta intensidade',  'm/90',  0],
    ['hi_n',   'Ações de alta intensidade',   'por 90', 1] ] },
  { t: 'Arranque e frenagem', d: 'Explosão do parado e capacidade de frear.', m: [
    ['expl',  'Arranques até o sprint',       'por 90', 2],
    ['acel',  'Acelerações fortes',           'por 90', 1],
    ['desa',  'Frenagens fortes',             'por 90', 1],
    ['t_spr', 'Tempo até o sprint',           's · menor é melhor', 2, true],
    ['t_hsr', 'Tempo até a corrida rápida',   's · menor é melhor', 2, true] ] },
  { t: 'Giro e mudança de direção', d: 'Quanto muda de direção e quanto tempo perde nisso.', m: [
    ['cod',       'Mudanças de direção',              'por 90', 1],
    ['t505_90',   'Giro de 90° (teste 505)',          's · menor é melhor', 2, true],
    ['t505_180',  'Giro de 180° (teste 505)',         's · menor é melhor', 2, true],
    ['t_spr_cod', 'Tempo até o sprint após girar',    's · menor é melhor', 2, true],
    ['t_hsr_cod', 'Tempo até a corrida rápida após girar', 's · menor é melhor', 2, true] ] },
  { t: 'Volume', d: 'Quanto terreno cobre numa partida inteira.', m: [
    ['dist',   'Distância percorrida',        'm/90',  0],
    ['mmin',   'Metros por minuto',           'm/min', 1],
    ['run',    'Distância em corrida',        'm/90',  0],
    ['acel_m', 'Acelerações médias',          'por 90', 1],
    ['desa_m', 'Desacelerações médias',       'por 90', 1] ] },
];
const FS_TODAS = FS_GRUPOS.flatMap(g => g.m);
const FS_CORES = ['#2f7fe0', '#e5562a', '#22a558', '#c9971a', '#8d5be0', '#d63e7c', '#1aa3a3', '#e07a1a', '#6aa628', '#5a6ce0',
                  '#b8412f', '#2f9c8a'];
let fsPos = 'MEI';
let fsExtras = [];             /* pks acrescentados a mao */
let fsOcultos = new Set();     /* pks tirados das listas automaticas */
let fsBaseCache = null;
let fsMapaPk = null;

function fsBase() {
  if (!fsBaseCache) {
    fsBaseCache = BASE.filter(j => FISICO.some(([c]) => typeof j[c] === 'number'));
    fsMapaPk = new Map(fsBaseCache.map(j => [primaryKey(j), j]));
  }
  return fsBaseCache;
}
function fsNorm(t) {
  return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function fsFmt(v, casas) {
  return typeof v === 'number' ? v.toFixed(casas).replace('.', ',') : '—';
}
function fsMinJogos() { return parseInt($('#fsMin').value) || 0; }

/* coorte da posicao nas Series A e B: a regua de todos os percentis */
function fsCoorteAB() {
  const min = fsMinJogos();
  const lista = fsBase().filter(j => j.p === fsPos && (j.l === 'Brasil A' || j.l === 'Brasil B') &&
                                     (Number(j.sc_n) || 0) >= min);
  const ord = {};
  FS_TODAS.forEach(([k]) => {
    ord[k] = lista.map(j => j[k]).filter(v => typeof v === 'number' && !isNaN(v)).sort((a, b) => a - b);
  });
  const media = liga => {
    const sub = lista.filter(j => j.l === liga);
    const m = {};
    FS_TODAS.forEach(([k]) => {
      const vs = sub.map(j => j[k]).filter(v => typeof v === 'number' && !isNaN(v));
      m[k] = vs.length ? vs.reduce((a, v) => a + v, 0) / vs.length : null;
    });
    return { n: sub.length, m };
  };
  return { lista, ord, A: media('Brasil A'), B: media('Brasil B') };
}
/* percentil (0-100) do valor na coorte; nos tempos, menor e melhor */
function fsPct(co, k, v, menor) {
  const o = co.ord[k];
  if (!o || o.length < 2 || typeof v !== 'number' || isNaN(v)) return null;
  let lo = 0, hi = o.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (o[m] < v) lo = m + 1; else hi = m; }
  const p = lo / (o.length - 1) * 100;
  return Math.round(Math.max(0, Math.min(100, menor ? 100 - p : p)));
}
/* indice por grupo = media dos percentis do grupo; geral = media dos grupos */
function fsIndices(co, j) {
  const grupos = FS_GRUPOS.map(g => {
    const ps = g.m.map(([k, , , , menor]) => fsPct(co, k, j[k], menor)).filter(p => p != null);
    return ps.length ? Math.round(ps.reduce((a, v) => a + v, 0) / ps.length) : null;
  });
  const ok = grupos.filter(v => v != null);
  return { grupos, geral: ok.length >= 3 ? Math.round(ok.reduce((a, v) => a + v, 0) / ok.length) : null };
}
function fsFaixa(p) { return p >= 75 ? 'alto' : p <= 25 ? 'baixo' : 'medio'; }

function fsCelula(co, k, v, casas, menor, lider, tit) {
  if (typeof v !== 'number' || isNaN(v)) return '<td class="fs-c vazio"><span class="v">–</span></td>';
  const p = fsPct(co, k, v, menor);
  const cls = p == null ? 'medio' : fsFaixa(p);
  return '<td class="fs-c ' + cls + (lider ? ' lider' : '') + '" title="' + esc(tit) +
    (p != null ? ' · percentil ' + p : '') + '">' +
    '<i class="fs-bar"><b style="height:' + (p == null ? 0 : p) + '%"></b></i>' +
    '<span class="v">' + fsFmt(v, casas) + '</span></td>';
}

function fsCabecalho(c) {
  const j = c.j;
  const tag = c.tipo === 'A' ? '<span class="fs-tag a">Top Série A</span>'
            : c.tipo === 'B' ? '<span class="fs-tag b">Top Série B</span>' : '';
  /* Clube, liga e amostra saem do cabecalho e vao para o balao: com dez colunas,
     quatro linhas de texto por coluna empurravam a matriz inteira para fora da tela. */
  const ficha = [j.t, j.l + (j.p !== fsPos ? ' · ' + j.p : ''),
                 j.sc_n ? j.sc_n + ' jogos rastreados · ' + fsFmt(j.sc_min, 0) + ' min por jogo' : '']
                .filter(Boolean).join(' · ');
  return '<th class="fs-col" style="--cor:' + c.cor + '" data-pk="' + esc(primaryKey(j)) + '" data-id="' + j.id + '"' +
    ' title="' + esc(j.n + ' — ' + ficha) + '">' +
    '<div class="fs-nome"><b>' + esc(j.n) + '</b>' +
      (ehEstrangeiroBase(j) ? ' <span class="selo-ex">' + esc(sigla(j.nac)) + '</span>' : '') + '</div>' +
    '<div class="fs-hd-bts">' +
      (c.idx.geral != null ? '<span class="fs-idx ' + (c.idx.geral >= 67 ? 'a' : c.idx.geral >= 40 ? 'm' : 'b') +
        '" title="Índice físico geral: média dos cinco grupos">' + c.idx.geral + '</span>' : '') +
      tag +
      '<button class="fs-ficha" title="Ver a ficha">+</button>' +
      '<button class="fs-levar" title="Levar para o campograma (' + esc(j.p) + ')">↗</button>' +
      '<button class="fs-x" title="Tirar da comparação">×</button>' +
    '</div></th>';
}

/* Linhas do bloco "Temporadas": minutagem, gols e bola parada das ultimas tres
   temporadas (dados/historico.json). Nao sao percentis do SkillCorner — a leitura
   aqui e contra a MEDIA da coorte (mesma posicao nas Series A e B), que e a mesma
   regua do resto da matriz. `ref` e a escala da barrinha quando existe um teto
   natural (uma temporada inteira = 3.400 min). */
function fsLinhasTemporada() {
  const T = HIST.temporadas || [];
  const soma = k => h => (h ? h.reduce((s, x) => s + ((x && x[k]) || 0), 0) : null);
  const linhas = [];
  T.forEach((ano, i) => linhas.push({
    id: 'min' + i, rot: 'Minutos ' + ano, un: 'minutos', casas: 0, ref: MIN_TEMPORADA,
    val: h => (h && h[i] ? (h[i].min || 0) : null),
    nota: h => (h && h[i] ? (h[i].j || 0) + ' jogos · ' + h[i].tm + ' · ' + h[i].l : 'sem dado'),
  }));
  linhas.push({ id: 'min3', rot: 'Minutos nas três', un: 'soma', casas: 0, forte: 1,
                ref: MIN_TEMPORADA * 3, val: soma('min') });
  T.forEach((ano, i) => linhas.push({
    id: 'g' + i, rot: 'Gols ' + ano, un: 'gols', casas: 0,
    val: h => (h && h[i] ? (h[i].g || 0) : null),
    nota: h => (h && h[i] ? (h[i].a || 0) + ' assistências · ' + h[i].l : 'sem dado'),
  }));
  linhas.push({ id: 'g3', rot: 'Gols nas três', un: 'soma', casas: 0, forte: 1, val: soma('g') });
  linhas.push({ id: 'gc3', rot: 'Gols de cabeça nas três', un: 'soma', casas: 0, val: soma('gc') });
  linhas.push({
    id: 'cob', rot: 'Cobranças de bola parada', un: 'escanteio + falta /90', casas: 2,
    val: h => {
      const a = h && h[h.length - 1];
      return a ? Math.round((((a.esc || 0) + (a.fal || 0)) * 100)) / 100 : null;
    },
  });
  return linhas;
}

/* Media de cada linha de temporada na coorte — geral (a regua da cor) e por serie. */
function fsMediasTemporada(co, linhas) {
  const hs = co.lista.map(j => hist(primaryKey(j)));
  const media = (sel, fn) => {
    const v = [];
    co.lista.forEach((j, i) => {
      if (!sel(j)) return;
      const x = fn(hs[i]);
      if (typeof x === 'number' && !isNaN(x)) v.push(x);
    });
    return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
  };
  const r = { todos: {}, A: {}, B: {} };
  linhas.forEach(l => {
    r.todos[l.id] = media(() => true, l.val);
    r.A[l.id] = media(j => j.l === 'Brasil A', l.val);
    r.B[l.id] = media(j => j.l === 'Brasil B', l.val);
  });
  return r;
}

function fsRender() {
  if (!BASE.length || !$('#fsMatriz')) return;
  const co = fsCoorteAB();
  const extras = fsExtras.map(pk => fsMapaPk.get(pk)).filter(Boolean);
  const extraSet = new Set(fsExtras);
  const top = liga => co.lista
    .filter(j => j.l === liga && !fsOcultos.has(primaryKey(j)) && !extraSet.has(primaryKey(j)))
    .map(j => ({ j, idx: fsIndices(co, j) })).filter(x => x.idx.geral != null)
    .sort((a, b) => b.idx.geral - a.idx.geral).slice(0, 5);

  const colunas = extras.map(j => ({ j, tipo: 'extra' }));
  if ($('#fsTopA').checked) top('Brasil A').forEach(x => colunas.push({ j: x.j, tipo: 'A' }));
  if ($('#fsTopB').checked) top('Brasil B').forEach(x => colunas.push({ j: x.j, tipo: 'B' }));
  colunas.forEach((c, i) => { c.idx = fsIndices(co, c.j); c.cor = FS_CORES[i % FS_CORES.length];
                              c.h = hist(primaryKey(c.j)); });
  const medias = $('#fsMedias').checked
    ? [{ rot: 'Média Série A', d: co.A }, { rot: 'Média Série B', d: co.B }] : [];

  let h = '<thead><tr><th class="fs-canto"><span>' + esc(nomePos(fsPos)) + '</span>' +
    '<small>' + co.lista.length + ' com tracking na Série A + B' +
    (fsMinJogos() ? ' (≥ ' + fsMinJogos() + ' jogos)' : '') + '</small></th>' +
    colunas.map(fsCabecalho).join('') +
    medias.map(m => '<th class="fs-media"><b>' + m.rot + '</b><small>' + m.d.n + ' ' + esc(fsPos) +
      (m.d.n === 1 ? '' : 's') + ' · média da régua</small></th>').join('') + '</tr></thead>';

  let b = '<tbody>';

  /* bloco das temporadas: vem antes do fisico porque e o retrato de carreira —
     quanto jogou e quanto produziu — que contextualiza todo o resto */
  const linhasT = fsLinhasTemporada();
  if (linhasT.length && Object.keys(HIST.jogadores).length) {
    const mt = fsMediasTemporada(co, linhasT);
    const comHist = colunas.filter(c => c.h).length;
    b += '<tr class="fs-grupo"><td><b>Temporadas</b><span>Minutagem, gols e bola parada — ' +
      'Wyscout, ' + (HIST.temporadas || []).join('/') + '</span></td>' +
      colunas.map(c => '<td>' + (c.h ? '' : '<span class="fs-sem">sem histórico</span>') + '</td>').join('') +
      medias.map(() => '<td></td>').join('') + '</tr>';
    linhasT.forEach(l => {
      const vals = colunas.map(c => l.val(c.h));
      const validos = vals.filter(v => v != null);
      const melhor = validos.length ? Math.max.apply(null, validos) : null;
      const alvo = Math.max(l.ref || 0, melhor || 0, 0.0001);
      const med = mt.todos[l.id];
      b += '<tr' + (l.forte ? ' class="fs-soma"' : '') + '><td class="fs-rot">' + esc(l.rot) +
        '<small>' + esc(l.un) + '</small></td>' +
        colunas.map((c, i) => {
          const v = vals[i];
          if (v == null) return '<td class="fs-c vazio"><span class="v">–</span></td>';
          const cls = med == null ? 'medio' : v >= med ? 'alto' : 'baixo';
          const lider = melhor != null && v === melhor && validos.length > 1 && v > 0;
          const tit = l.rot + ': ' + fsFmt(v, l.casas) +
            (med != null ? ' · média da coorte ' + fsFmt(med, l.casas) : '') +
            (l.nota ? ' · ' + l.nota(c.h) : '');
          return '<td class="fs-c ' + cls + (lider ? ' lider' : '') + '" title="' + esc(tit) + '">' +
            '<i class="fs-bar"><b style="height:' +
              Math.max(0, Math.min(100, v / alvo * 100)).toFixed(0) + '%"></b></i>' +
            '<span class="v">' + (l.casas ? fsFmt(v, l.casas) : milhar(v)) + '</span></td>';
        }).join('') +
        medias.map(m => {
          const v = (m.rot.endsWith('A') ? mt.A : mt.B)[l.id];
          return '<td class="fs-c media"><span class="v">' +
            (v == null ? '–' : l.casas ? fsFmt(v, l.casas) : milhar(Math.round(v))) + '</span></td>';
        }).join('') + '</tr>';
    });
    if (comHist < colunas.length) {
      b += '<tr class="fs-aviso"><td colspan="' + (1 + colunas.length + medias.length) + '">' +
        (colunas.length - comHist) + ' de ' + colunas.length + ' sem histórico do Wyscout: ' +
        'o cruzamento entre temporadas é por nome e idade, e nomes ambíguos ficam de fora ' +
        'em vez de mostrar a temporada de outra pessoa.</td></tr>';
    }
  }

  FS_GRUPOS.forEach((g, gi) => {
    b += '<tr class="fs-grupo"><td><b>' + esc(g.t) + '</b><span>' + esc(g.d) + '</span></td>' +
      colunas.map(c => {
        const v = c.idx.grupos[gi];
        return '<td>' + (v == null ? '' : '<span class="fs-idx ' + (v >= 67 ? 'a' : v >= 40 ? 'm' : 'b') +
          '" title="Índice do grupo: média dos percentis">' + v + '</span>') + '</td>';
      }).join('') + medias.map(() => '<td></td>').join('') + '</tr>';
    g.m.forEach(([k, rot, un, casas, menor]) => {
      const vals = colunas.map(c => (typeof c.j[k] === 'number' ? c.j[k] : null));
      const validos = vals.filter(v => v != null);
      const melhor = validos.length ? (menor ? Math.min.apply(null, validos) : Math.max.apply(null, validos)) : null;
      b += '<tr><td class="fs-rot">' + esc(rot) + '<small>' + esc(un) + '</small></td>' +
        colunas.map((c, i) => fsCelula(co, k, vals[i], casas, menor,
          melhor != null && vals[i] === melhor && validos.length > 1,
          rot + ': ' + fsFmt(vals[i], casas) + ' · média A ' + fsFmt(co.A.m[k], casas) +
          ' · média B ' + fsFmt(co.B.m[k], casas))).join('') +
        medias.map(m => '<td class="fs-c media"><span class="v">' + fsFmt(m.d.m[k], casas) + '</span></td>').join('') +
        '</tr>';
    });
  });
  b += '</tbody>';
  $('#fsMatriz').innerHTML = h + b;
  $('#fsVazio').style.display = colunas.length || medias.length ? 'none' : 'block';

  $('#fsContagem').innerHTML = '<b>' + colunas.length + '</b> jogador' + (colunas.length === 1 ? '' : 'es') +
    ' na comparação · ' + co.A.n + ' na Série A e ' + co.B.n + ' na Série B com ' + esc(fsPos) +
    ' · jogadores de outras ligas entram na mesma régua';

  $$('#fsMatriz th.fs-col').forEach(th => {
    const id = parseInt(th.dataset.id), pk = th.dataset.pk;
    th.querySelector('.fs-ficha').onclick = () => { abrirFicha(id); irParaAba('campo'); };
    th.querySelector('.fs-levar').onclick = () => {
      const j = BASE.find(x => x.id === id);
      if (!j) return;
      posAtual = j.p;
      adicionarDaBase(id);
    };
    th.querySelector('.fs-x').onclick = () => {
      if (extraSet.has(pk)) fsExtras = fsExtras.filter(x => x !== pk);
      else fsOcultos.add(pk);
      fsRender();
    };
  });
  fsMontarElenco();
}

/* busca de qualquer jogador com tracking, em qualquer liga */
function fsBuscar() {
  const t = fsNorm($('#fsBusca').value.trim());
  const lista = $('#fsBuscaLista');
  if (t.length < 2) { lista.classList.remove('aberto'); return; }
  const achados = fsBase().filter(j => fsNorm(j.n + ' ' + j.t).includes(t))
    .sort((a, b) => (a.p === fsPos ? 0 : 1) - (b.p === fsPos ? 0 : 1) || a.n.localeCompare(b.n)).slice(0, 14);
  lista.innerHTML = achados.length
    ? achados.map(j => '<div class="msel-item" data-pk="' + esc(primaryKey(j)) + '"><b>' + esc(j.n) + '</b>' +
        '<span class="fs-b-meta">' + esc(j.p) + ' · ' + esc(j.t) + ' · ' + esc(j.l) + '</span></div>').join('')
    : '<div class="msel-dica">ninguém com tracking com esse nome</div>';
  lista.classList.add('aberto');
  lista.querySelectorAll('.msel-item').forEach(it => {
    it.onclick = e => {
      e.stopPropagation();
      fsAdicionar(it.dataset.pk);
      $('#fsBusca').value = '';
      lista.classList.remove('aberto');
    };
  });
}
function fsAdicionar(pk) {
  if (!pk || !fsMapaPk.get(pk)) { toast('Esse jogador não tem tracking do SkillCorner', 'ruim'); return; }
  if (!fsExtras.includes(pk)) fsExtras.push(pk);
  fsOcultos.delete(pk);
  fsRender();
}
/* jogadores do campograma que tem tracking, a posicao escolhida primeiro */
function fsMontarElenco() {
  const sel = $('#fsElenco');
  if (!sel) return;
  fsBase();
  const itens = todosJogadores().map(j => ({ j, b: j.pk ? fsMapaPk.get(j.pk) : null })).filter(x => x.b)
    .sort((a, b) => (a.b.p === fsPos ? 0 : 1) - (b.b.p === fsPos ? 0 : 1) || a.b.p.localeCompare(b.b.p));
  sel.innerHTML = '<option value="">＋ jogador do campograma…</option>' +
    itens.map(x => '<option value="' + esc(x.b ? primaryKey(x.b) : '') + '"' +
      (fsExtras.includes(primaryKey(x.b)) ? ' disabled' : '') + '>' +
      esc(x.b.p) + ' · ' + esc(x.b.n) + ' (' + esc(x.b.t) + ')</option>').join('');
}

function fsMontarFiltros() {
  campinhoInit('fsCampo', () => {
    const s = campinhoSelecao('fsCampo');
    if (s.size) fsPos = [...s][0];
    campinhoDefinir('fsCampo', [fsPos]);
    fsRender();
  }, true);
  campinhoDefinir('fsCampo', [fsPos]);
  $('#fsBusca').oninput = debounce(fsBuscar, 150);
  $('#fsBusca').onclick = e => { e.stopPropagation(); if ($('#fsBusca').value.trim().length >= 2) fsBuscar(); };
  $('#fsElenco').onchange = () => { fsAdicionar($('#fsElenco').value); $('#fsElenco').value = ''; };
  $('#fsMin').oninput = debounce(fsRender, 200);
  ['#fsTopA', '#fsTopB', '#fsMedias'].forEach(id => { $(id).onchange = fsRender; });
  $('#fsLimpar').onclick = () => { fsExtras = []; fsOcultos = new Set(); $('#fsMin').value = 5; fsRender(); };
}

function irParaAba(nome) {
  $$('.aba').forEach(b => b.classList.toggle('on', b.dataset.aba === nome));
  $('#pgCampo').classList.toggle('oculta', nome !== 'campo');
  $('#pgContrato').classList.toggle('oculta', nome !== 'contrato');
  $('#pgFisico').classList.toggle('oculta', nome !== 'fisico');
  $('#pgAnalise').classList.toggle('oculta', nome !== 'analise');
  if (nome === 'campo') requestAnimationFrame(ajustarCampo);
  if (nome === 'contrato') fcRender();
  if (nome === 'fisico') fsRender();
}

/* ---------------- impressao / PDF ---------------- */
function montarImpressao() {
  const hoje = new Date().toLocaleDateString('pt-BR');
  const jg = todosJogadores();
  const tot = totalGeral(), disp = dispSalarios(), ct = custoTotal();
  const nEstr = jg.filter(j => j.estrangeiro).length;

  $('#impTitulo').textContent = 'Santa Cruz · Montagem de Elenco — ' + estado.nome;
  $('#impSub').textContent = jg.length + ' atletas · ' + nEstr + ' estrangeiro' +
    (nEstr === 1 ? '' : 's') + ' · ' + POSICOES.reduce((a, p) => a + metaPos(p.c), 0) +
    ' vagas · gerado em ' + hoje;

  $('#impOrc').innerHTML =
    '<div>massa salarial<b>' + brl(tot) + '</b></div>' +
    '<div>custo do elenco<b>' + brl(custoElenco()) + '</b></div>' +
    '<div>comissão técnica<b>' + brl(estado.comissao) + '</b></div>' +
    '<div' + (ct > estado.teto ? ' class="estouro"' : '') + '>custo total (máx. ' +
      brl(estado.teto) + ')<b>' + brl(ct) + '</b></div>';

  /* escala o campograma para caber na folha A4 deitada (margem de 8mm) */
  const campo = $('#campo'), area = $('.campo-area');
  if (campo && area) {
    const LARG_FOLHA = 1050, ALT_UTIL = 640;   /* px uteis descontando cabecalho */
    const w = campo.offsetWidth || 1, h = campo.offsetHeight || 1;
    const k = Math.min(1, LARG_FOLHA / w, ALT_UTIL / h);
    campo.style.setProperty('--k-print', k.toFixed(4));
    area.style.setProperty('--h-print', Math.ceil(h * k));
  }

  let html = '<h2>Elenco por posição</h2><table class="imp"><thead><tr>' +
    '<th>Posição</th><th>Jogador</th><th>Clube</th><th>Liga</th>' +
    '<th class="num">Idade</th><th class="num">Overall</th><th>Contrato</th>' +
    '<th>Nacionalidade</th><th>Status</th>' +
    '<th class="num">Salário</th><th class="num">Custo c/ encargos</th>' +
    '</tr></thead><tbody>';

  POSICOES.forEach(p => {
    const lista = estado.elenco[p.c] || [];
    if (!lista.length) return;
    html += '<tr class="grupo"><td colspan="9">' + p.c + ' · ' + esc(p.nome) +
      ' (' + lista.length + ')</td><td class="num">' + brl(totalPos(p.c)) +
      '</td><td class="num">' + brl(totalPos(p.c) * (estado.fator || 1)) + '</td></tr>';
    lista.forEach(j => {
      html += '<tr>' +
        '<td>' + p.c + '</td>' +
        '<td>' + (j.titular ? '★ ' : '') + esc(j.nome) + '</td>' +
        '<td>' + esc(j.clube || '') + '</td>' +
        '<td>' + esc(j.liga || '') + '</td>' +
        '<td class="num">' + (j.idade || '') + '</td>' +
        '<td class="num">' + (j.ov || '') + '</td>' +
        '<td>' + esc(j.contrato || '') + '</td>' +
        '<td>' + esc(j.estrangeiro ? (j.nac || 'estrangeiro') : 'Brasil') + '</td>' +
        '<td>' + STATUS_ROT[j.status || 'alvo'] + '</td>' +
        '<td class="num">' + brl(j.salario) + '</td>' +
        '<td class="num">' + brl((j.salario || 0) * (estado.fator || 1)) + '</td>' +
      '</tr>';
    });
  });

  html += '<tr class="total"><td colspan="9">TOTAL · ' + jg.length + ' atletas' +
    ' · sobra de ' + brl(disp - tot) + ' na massa salarial</td>' +
    '<td class="num">' + brl(tot) + '</td>' +
    '<td class="num">' + brl(custoElenco()) + '</td></tr>';
  html += '</tbody></table>';
  $('#impTabela').innerHTML = html;
}

function gerarPdf() {
  const temaAntes = estado.tema;
  if (temaAntes !== 'claro') { estado.tema = 'claro'; aplicarTema(); }
  montarImpressao();
  setTimeout(() => {
    window.print();
    if (temaAntes !== 'claro') { estado.tema = temaAntes; aplicarTema(); }
  }, 120);
}

/* ---------------- ligacoes de tela ---------------- */
function montarChips() {
  const defs = [
    { c:'brasil', r:'Brasil A/B/C' }, { c:'brasilbc', r:'Brasil B+C' },
    { c:'sulamerica', r:'América do Sul' }, { c:'europa', r:'Europa' },
    { c:'todas', r:'Todas as ligas' },
  ];
  $('#chipsLiga').innerHTML = defs.map(d =>
    '<button class="chip' + (d.c === filtroGrupo ? ' on' : '') + '" data-g="' + d.c + '">' + d.r + '</button>').join('');
  $$('#chipsLiga .chip').forEach(b => {
    b.onclick = () => {
      filtroGrupo = b.dataset.g;
      $$('#chipsLiga .chip').forEach(x => x.classList.toggle('on', x.dataset.g === filtroGrupo));
      renderTabela();
    };
  });
}

function focarSalarioPendente() {
  if (!posAtual) return;
  const card = document.querySelector('.pos[data-pos="' + posAtual + '"]');
  if (!card) return;
  const alvo = Array.from(card.querySelectorAll('.jog-sal input')).find(i => paraNumero(i.value) === 0);
  if (alvo) { alvo.focus({ preventScroll: true }); alvo.select(); }
}

function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function ligar() {
  $('#fPos').innerHTML = '<option value="">Todas as posições</option>' +
    POSICOES.map(p => '<option value="' + p.c + '">' + p.c + ' · ' + p.nome + '</option>').join('');

  ['#fTexto','#fIdadeMin','#fIdadeMax','#fOvMin','#fMinMin','#fContrato'].forEach(s => {
    $(s).oninput = debounce(renderTabela, 180);
  });
  $('#fPos').onchange = renderTabela;
  $('#fNacao').onchange = renderTabela;
  $('#fLiga').onchange = () => {
    /* liga específica manda: os atalhos de grupo ficam apagados */
    $$('#chipsLiga .chip').forEach(x => x.classList.toggle('apagado', !!$('#fLiga').value));
    renderTabela();
  };
  $('#fLimpar').onclick = () => {
    ['#fTexto','#fIdadeMin','#fIdadeMax','#fOvMin','#fMinMin','#fContrato'].forEach(s => { $(s).value = ''; });
    $('#fNacao').value = '';
    $('#fLiga').value = '';
    $('#fPos').value = posAtual || '';
    renderTabela();
  };

  $$('[data-fechar]').forEach(b => {
    b.onclick = () => { b.closest('.modal').classList.remove('aberto'); focarSalarioPendente(); };
  });
  $$('.modal').forEach(m => {
    m.onclick = e => { if (e.target === m) m.classList.remove('aberto'); };
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const tinha = $$('.modal.aberto').length;
      $$('.modal').forEach(m => m.classList.remove('aberto'));
      if (tinha) focarSalarioPendente();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); salvarCenario(); }
  });

  const campoOrc = (sel, chave, decimal) => {
    $(sel).oninput = () => {
      if (chave === 'comissao' && estado.ct && estado.ct.detalhar) return;
      estado[chave] = decimal ? paraDecimal($(sel).value) : paraNumero($(sel).value);
      if (chave === 'fator') aplicarCT();
      renderOrc(); renderPainel(); salvarLocal();
    };
    $(sel).onblur = () => {
      $(sel).value = decimal ? String(estado[chave]).replace('.', ',') : milhar(estado[chave]);
      render();
    };
  };
  campoOrc('#inTeto', 'teto', false);
  campoOrc('#inComissao', 'comissao', false);
  campoOrc('#inFator', 'fator', true);
  campoOrc('#inEuro', 'cotacaoEuro', true);

  $('#btDetalharCT').onclick = abrirCT;
  $('#ctDetalhar').onchange = () => {
    estado.ct.detalhar = $('#ctDetalhar').checked;
    aplicarCT(); salvarLocal(); renderCT(); renderOrc(); renderPainel();
    $('#inComissao').readOnly = estado.ct.detalhar;
    $('#inComissao').classList.toggle('travado', estado.ct.detalhar);
  };
  $('#ctEncargos').onchange = () => {
    estado.ct.encargos = $('#ctEncargos').checked;
    aplicarCT(); salvarLocal(); renderCT(); renderOrc(); renderPainel();
  };
  $('#ctAdd').onclick = () => {
    ctItens().push({ uid: uid(), cargo: 'Novo cargo', salario: 0 });
    aplicarCT(); salvarLocal(); renderCT();
  };

  $('#btOrient').onclick = () => {
    estado.orientacao = estado.orientacao === 'vertical' ? 'horizontal' : 'vertical';
    sincronizarBotoes(); salvarLocal(); renderCampo();
  };
  $('#btDenso').onclick = () => {
    estado.denso = !estado.denso;
    sincronizarBotoes(); salvarLocal(); renderCampo();
  };
  $$('.aba').forEach(b => { b.onclick = () => irParaAba(b.dataset.aba); });

  const menu = (btId, menuId) => {
    const bt = $(btId), mn = $(menuId);
    bt.onclick = e => {
      e.stopPropagation();
      const abrir = !mn.classList.contains('aberto');
      $$('.menu').forEach(m => m.classList.remove('aberto'));
      mn.classList.toggle('aberto', abrir);
    };
    mn.onclick = () => setTimeout(() => mn.classList.remove('aberto'), 0);
  };
  menu('#btMenuGrupo', '#menuGrupo');
  menu('#btMenuExp', '#menuExp');
  menu('#btMenuVis', '#menuVis');
  /* o menu Visual fica aberto para trocar várias opções seguidas */
  $('#menuVis').onclick = e => e.stopPropagation();
  document.addEventListener('click', () => $$('.menu').forEach(m => m.classList.remove('aberto')));

  $('#btOrcamento').onclick = () => { renderOrc(); $('#modalOrc').classList.add('aberto'); };

  /* nome do grupo: edita no proprio cabecalho */
  const campoNome = $('#marcaSub');
  campoNome.onfocus = () => campoNome.select();
  const gravarNome = async () => {
    const n = campoNome.value.trim();
    if (!n) { campoNome.value = estado.nome; return; }
    if (n === estado.nome) return;
    estado.nome = n;
    salvarLocal();
    if (estado.id) { await salvarCenario(); }        /* já salvo: renomeia lá também */
    else { renderOrc(); toast('Nome do grupo: ' + n); }
  };
  campoNome.onblur = gravarNome;
  campoNome.onkeydown = e => {
    if (e.key === 'Enter') { e.preventDefault(); campoNome.blur(); }
    else if (e.key === 'Escape') { campoNome.value = estado.nome; campoNome.blur(); }
  };

  $('#btTema').onclick = () => {
    estado.tema = estado.tema === 'claro' ? 'escuro' : 'claro';
    aplicarTema(); salvarLocal();
  };

  $('#btAjustar').onclick = () => {
    estado.ajustar = !estado.ajustar;
    sincronizarBotoes(); salvarLocal(); ajustarCampo();
  };
  $('#btSalvar').onclick = salvarCenario;
  $('#btExcel').onclick = exportarExcel;
  $('#btPng').onclick = exportarPng;
  $('#btPdf').onclick = gerarPdf;
  window.onbeforeprint = montarImpressao;
  $('#selCenario').onchange = e => abrirCenario(e.target.value);
  $('#btComparar').onclick = abrirComparativo;
  $('#fiBase').onchange = renderFicha;
  $('#fiFechar').onclick = fecharFicha;

  $('#btNovo').onclick = () => {
    if (todosJogadores().length && !confirm('Começar um grupo novo em branco? O grupo atual continua salvo se você já clicou em Salvar.')) return;
    const nome = prompt('Nome do novo grupo de opções', 'Grupo ' + new Date().toLocaleDateString('pt-BR'));
    if (nome === null) return;
    estado = novoEstado();
    estado.nome = nome || 'Sem nome';
    salvarLocal(); render(); sincronizarBotoes(); listarCenarios();
    $('#selCenario').value = '';
  };
  $('#btDuplicar').onclick = async () => {
    const n = prompt('Nome do novo grupo (cópia deste)', estado.nome + ' (variação)');
    if (n === null) return;
    estado.id = null;
    estado.nome = n || estado.nome + ' (variação)';
    await salvarCenario();
  };
  $('#btRenomear').onclick = () => {
    const c = $('#marcaSub');
    c.focus(); c.select();
    toast('Digite o novo nome e tecle Enter');
  };
  $('#btExcluir').onclick = async () => {
    if (!estado.id) { toast('Este grupo ainda não foi salvo', 'ruim'); return; }
    if (!confirm('Excluir o grupo "' + estado.nome + '"? Não dá para desfazer.')) return;
    await fetch('api/cenario/' + estado.id, { method: 'DELETE' });
    estado.id = null; salvarLocal(); listarCenarios();
    toast('Grupo excluído');
  };

  $('#btManual').onclick = () => {
    ['#mnNome','#mnClube','#mnIdade','#mnSalario','#mnPais'].forEach(s => { $(s).value = ''; });
    $('#mnEstrangeiro').checked = false;
    $('#modalManual').classList.add('aberto');
    setTimeout(() => $('#mnNome').focus(), 60);
  };
  $('#btManualOk').onclick = () => {
    const nome = $('#mnNome').value.trim();
    if (!nome) { toast('Informe o nome', 'ruim'); return; }
    const lista = estado.elenco[posAtual];
    const ex = $('#mnEstrangeiro').checked;
    lista.push({
      uid: uid(), jid: null, nome, clube: $('#mnClube').value.trim() || 'sem clube',
      liga: '', idade: parseInt($('#mnIdade').value) || null, ov: null, contrato: '',
      posOrig: posAtual, salario: paraNumero($('#mnSalario').value),
      nac: ex ? ($('#mnPais').value.trim() || '') : 'Brazil', psp: '', estrangeiro: ex,
      status: 'alvo', titular: lista.length === 0,
    });
    $('#modalManual').classList.remove('aberto');
    salvarLocal(); render();
    toast(nome + ' adicionado em ' + posAtual, 'bom');
  };
}

/* ---------------- inicio ---------------- */
async function iniciar() {
  carregarLocal();
  ligar();
  montarChips();
  render();
  sincronizarBotoes();
  observarArea();
  listarCenarios();
  try {
    const v = window.__verDados ? '?v=' + window.__verDados : '';
    /* os dois em paralelo: o historico e opcional e nao pode atrasar a base */
    const [r, rh] = await Promise.all([
      fetch('dados/jogadores.json' + v),
      fetch('dados/historico.json' + v).catch(() => null),
    ]);
    const d = await r.json();
    BASE = d.jogadores || [];
    if (rh && rh.ok) {
      try {
        HIST = await rh.json();
        console.log('histórico:', Object.keys(HIST.jogadores).length, 'jogadores ·',
                    (HIST.temporadas || []).join(', '));
      } catch (e) { console.warn('histórico indisponível', e); }
    }
    console.log('base carregada:', BASE.length, 'jogadores · período', d.periodo);
    reancorar();
    /* o primeiro render() acontece antes deste fetch — sem redesenhar, os cards
       ficariam sem a minutagem ate a proxima mexida no elenco */
    render();
    const cont = {};
    BASE.forEach(j => { cont[j.l] = (cont[j.l] || 0) + 1; });
    fcMontarFiltros();
    fsMontarFiltros();
    $('#fLiga').innerHTML = '<option value="">Todas as ligas do grupo</option>' +
      Object.keys(cont).sort((a, b) => a.localeCompare(b)).map(l =>
        '<option value="' + esc(l) + '">' + esc(l) + ' (' + cont[l] + ')</option>').join('');
  } catch (e) {
    toast('Falha ao carregar a base de jogadores', 'ruim');
  }
}
/* Observa a area do campo em vez do evento de resize da janela: pega tambem
   abrir/fechar a ficha, trocar de aba e mudanca de zoom.

   Os TRES gatilhos (observador, resize da janela e a rede de seguranca) passam
   pelo mesmo `talvezAjustar`, com uma unica medida de referencia e tolerancia de
   2px. Antes cada um tinha a sua: o observador guardava `ultimo`, a rede guardava
   `ultimaArea`, e como o ajustarCampo() reescreve o campo, a largura da area
   alternava entre dois valores. Guarda de "e diferente do anterior" nao pega
   alternancia A-B-A-B — so pega repeticao — entao os tres se realimentavam e a
   tela tremia. */
let ultimaArea = '';
function areaMudou(area) {
  const [w, h] = (ultimaArea || 'x').split('x').map(Number);
  return !(Math.abs(area.clientWidth - w) <= 2 && Math.abs(area.clientHeight - h) <= 2);
}
function talvezAjustar() {
  const area = $('.campo-area');
  if (!area || ajustando || !document.querySelector('.pos')) return;
  if (!areaMudou(area)) return;
  ultimaArea = area.clientWidth + 'x' + area.clientHeight;
  ajustarCampo();
}

let observandoArea = false;
function observarArea() {
  const area = $('.campo-area');
  if (!area || observandoArea || typeof ResizeObserver === 'undefined') return;
  observandoArea = true;
  new ResizeObserver(debounce(talvezAjustar, 120)).observe(area);
}
window.addEventListener('resize', debounce(talvezAjustar, 120));

/* Rede de seguranca: alguns navegadores nao disparam resize/ResizeObserver quando
   a janela muda por fora (zoom, tela dividida). Uma conferida leve resolve. */
setInterval(talvezAjustar, 700);

iniciar();
