/* Santa Cruz 2027 - Montagem de Elenco */
'use strict';

/* ---------------- configuracao das posicoes ---------------- */
const VAGAS_PADRAO = 3;
/* As siglas na TELA sao as internacionais (GK, RCB, LB, DM, CM, AM, LW, CF...).
   O codigo interno segue o portugues (GOL, ZD, LE...) porque e a chave da base, dos
   KPIs em dados/kpis/<POS>.json e dos cenarios ja gravados — trocar a chave exigiria
   migrar tudo isso. `sig` e so a etiqueta; `c` continua sendo a chave. */
const POSICOES = [
  { c:'GOL', sig:'GK',  nome:'Goleiro',           setor:'gol',    faixa:'gol' },
  { c:'LE',  sig:'LB',  nome:'Lateral Esquerdo',  setor:'defesa', faixa:'defesa' },
  { c:'ZE',  sig:'LCB', nome:'Zagueiro Esquerdo', setor:'defesa', faixa:'defesa' },
  { c:'ZD',  sig:'RCB', nome:'Zagueiro Direito',  setor:'defesa', faixa:'defesa' },
  { c:'LD',  sig:'RB',  nome:'Lateral Direito',   setor:'defesa', faixa:'defesa' },
  { c:'VOL', sig:'DM',  nome:'Volante',           setor:'meio',   faixa:'meio' },
  { c:'MED', sig:'CM',  nome:'Médio',             setor:'meio',   faixa:'meio' },
  { c:'MEI', sig:'AM',  nome:'Meia',              setor:'meio',   faixa:'meia' },
  { c:'EE',  sig:'LW',  nome:'Extremo Esquerdo',  setor:'ataque', faixa:'ataque' },
  { c:'CA',  sig:'CF',  nome:'Atacante',          setor:'ataque', faixa:'ataque' },
  { c:'ED',  sig:'RW',  nome:'Extremo Direito',   setor:'ataque', faixa:'ataque' },
];
/* codigo interno -> etiqueta de tela */
const SIGLA_POS = {};
POSICOES.forEach(p => { SIGLA_POS[p.c] = p.sig; });
function sig(cod) { return SIGLA_POS[cod] || cod; }
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
const VERSAO = 5;  /* v2: campo deitado · v3: compacto · v4: limite de 9 estrangeiros
                      · v5: Main = titular, nível gravado para quem já era titular */
let BASE = [];
/* Historico de tres temporadas (dados/historico.json, gerado por preparar_historico.py),
   indexado pela primary_key da temporada corrente. Vem em arquivo separado porque so
   ~18 mil dos 40 mil jogadores da base tem passagem pelo Wyscout. */
let HIST = { temporadas: [], jogadores: {} };
const MIN_TEMPORADA = 3400;   /* ~38 jogos x 90: a referencia de "temporada inteira" */
const JOGOS_TEMPORADA = 38;   /* a mesma referencia, quando so ha jogos (oGol) */
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
    /* minutos so do Wyscout; jogos das duas fontes */
    min: soma('min'), jogos: soma('j'), gols: soma('g'), assist: soma('a'), cabeca: soma('gc'),
    soOgol: h.some(x => x && x.fonte === 'ogol'),
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
    orientacao: 'horizontal', denso: true, tema: 'escuro', ajustar: true, zoom: 'caber', v: VERSAO,
    metas: { gol:8, defesa:27, meio:30, ataque:35 },
    alvoAtletas: {}, elenco: el,
    emp: {}, empExtra: [],   /* aba Empresários: dados por jogador e nomes de fora */
    indicados: [],           /* aba Indicados: a fila do que chega de fora */
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
const NAO_NOME = 137, PX_SELO = 29, PX_CHAR = 5.4;

function limiteNome(j, cod) {
  const fz = parseFloat(($('#campo') && $('#campo').style.getPropertyValue('--fz')) || 1) || 1;
  const larg = COLUNA_ABERTA.has(cod) ? larguraCardAberto : larguraCardPx;
  const util = larg - NAO_NOME * fz -
               (j && j.estrangeiro ? PX_SELO : 0);   /* a estrela saiu: o nome ganhou a folga */
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

/* Zoom de uma posicao: a coluna sai do campo e vem para o meio da tela, grande. O DOM
   e o MESMO — nada e clonado —, entao arrastar, editar salario, ⋯, ×, + e a ficha
   continuam funcionando exatamente como no campo. O campograma inteiro cabe na tela ao
   custo de cards minusculos; isto devolve o tamanho quando se quer trabalhar numa
   posicao so. Clique na barra do topo abre e fecha; Esc e o fundo tambem fecham. */
/* NAO e um flutuante por cima do campo. A primeira tentativa foi assim e nao podia dar
   certo: o #campo leva `transform:scale()` para caber na tela, e dentro de elemento
   transformado o `position:fixed` se ancora NELE, nao na janela — a coluna saiu na
   escala do campo, recortada pelo `overflow:hidden` e por baixo do veu.
   Agora e mais simples e nao tem armadilha: as outras colunas somem, o campo para de
   escalar e a escolhida fica sozinha no meio, em tamanho normal. Mesmo elemento, mesmo
   lugar no DOM — arrastar, editar, ⋯, × e a ficha seguem funcionando. */
let POS_ZOOM = null;
function posZoom(cod) {
  POS_ZOOM = POS_ZOOM === cod ? null : cod;
  document.body.classList.toggle('com-zoom', !!POS_ZOOM);
  renderCampo();
  /* rolagem de lado que tenha sobrado do campo deixaria o card fora da vista */
  const area = $('.campo-area');
  if (area) { area.scrollLeft = 0; area.scrollTop = 0; }
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && POS_ZOOM) posZoom(POS_ZOOM);
});
/* clicar no gramado vazio ao lado da coluna tambem fecha */
document.addEventListener('click', e => {
  if (POS_ZOOM && (e.target.id === 'campo' || e.target.classList.contains('marcacoes'))) {
    posZoom(POS_ZOOM);
  }
});

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
      if (ESTATICO) return;
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

/* ---------------- escala do campo: tres modos numa volta só ----------------
   Os dois modos antigos CABIAM na tela por definição — `k = Math.min(1, disp/alt)` nunca
   deixa passar de 1, então o campo só encolhia. Com 118 atletas, cada card virava um
   carimbo ilegível. O terceiro modo inverte a regra: o campo fica MAIOR que a tela e
   quem rola é a área, nos dois sentidos.

   Por que `transform: scale` e não aumentar a largura do card: `--fz` mexe só nas fontes
   (a largura de `.pos` é fixa em 224px), e `distribuir()` calcula as posições a partir
   das medidas reais. Escalar por transform mantém a conta de layout intacta — é o mesmo
   caminho já usado para encolher, só que para o outro lado. */
/* Os DOIS PRIMEIROS sao os modos ORIGINAIS e ficam como sempre foram: os dois CABEM na
   tela, e a diferenca entre eles e so a fonte. Ver o elenco inteiro num campo so e a
   leitura principal do app — nao se troca isso por outra coisa. Os de baixo foram
   ACRESCENTADOS, para quando a queixa e o tamanho do card e nao faz mal rolar.
   (Houve uma versao em que "tamanho real" virou 100% com rolagem. Era troca, nao
   acrescimo, e quebrou a visao que o usuario usava. Fica o registro: modo que ja existe
   nao muda de comportamento porque um novo chegou.) */
const ESCALAS = [
  { z: 'caber', rot: 'caber na tela' },   /* original: cabe, fonte compensada */
  { z: 'real',  rot: 'tamanho real' },    /* original: cabe, fonte normal */
  { z: 1.25,    rot: 'ampliado 125%' },
  { z: 1.5,     rot: 'ampliado 150%' },
  { z: 2,       rot: 'ampliado 200%' },
];
function escalaAtual() {
  /* grupos salvos antes disto só têm `ajustar`: booleano vira o modo equivalente */
  if (estado.zoom == null) return estado.ajustar ? 'caber' : 'real';
  if (estado.zoom === 1) return 'real';   /* veio da versão que trocou o significado */
  return estado.zoom;
}
function rotuloEscala() {
  const z = escalaAtual();
  const e = ESCALAS.find(x => x.z === z);
  return e ? e.rot : 'ampliado ' + Math.round(Number(z) * 100) + '%';
}
function escalaProxima() {
  const z = escalaAtual();
  const i = ESCALAS.findIndex(x => x.z === z);
  const prox = ESCALAS[(i + 1) % ESCALAS.length];
  estado.zoom = prox.z;
  estado.ajustar = prox.z === 'caber';   /* mantido: o PDF e a impressão ainda leem */
}

function escreverInfo(info, k, alt, disp, zFator) {
  if (!info) return;
  const z = zFator || 1;
  if (z > 1) {
    info.textContent = 'ampliado ' + Math.round(z * 100) + '% — role para ver o resto';
    return;
  }
  const cabe = alt * k <= disp + 2;
  info.textContent = k < 1
    ? 'campo em ' + Math.round(k * 100) + '%' + (cabe ? ' — cabe tudo na tela' : '')
    : '';
}

function ajustarCampo() {
  const campo = $('#campo'), area = $('.campo-area');
  if (!campo || !area) return;
  /* com uma posicao ampliada nao ha o que distribuir nem o que escalar: as outras
     colunas estao escondidas e a escolhida fica no fluxo, centralizada pelo CSS */
  if (POS_ZOOM) { campo.style.transform = ''; campo.style.width = ''; return; }
  const info = $('#abasInfo');
  const zoom = escalaAtual();

  /* AMPLIAR = pegar a visão boa e magnificar, NÃO replanejar o campo.
     A primeira tentativa refazia o layout do zero com a escala fixa, e o resultado foi o
     oposto do pedido: o planejador, sem a largura compensada que o modo normal usa, caía
     nos cards de 194px em vez de 343px, e 61 nomes passavam a aparecer abreviados contra
     12. Ampliar comia o conteúdo do card.

     Agora a ampliação é um FATOR aplicado por cima da mesma conta de sempre: o layout é
     idêntico ao de "tamanho real" — mesma largura de card, mesmos nomes inteiros — e só
     a escala final é multiplicada. Quem não couber na tela rola. */
  const zFator = (zoom !== 'caber' && zoom !== 'real') ? (Number(zoom) || 1) : 1;
  const ampliado = zFator > 1;
  area.classList.toggle('ampliado', ampliado);
  /* ORIGEM NO CANTO, SEMPRE. O CSS só punha `transform-origin:top left` em
     `.campo-area.ajustado`, isto é, no modo "caber na tela" — "tamanho real" escalava a
     partir do CENTRO. E a compensação (`compensarEscala`) usa margem negativa à direita
     e embaixo, que só fecha a conta se o encolhimento andar para o canto superior
     esquerdo. Com origem central o campo encolhe para dentro e sobra folga de todos os
     lados: medi 250px à esquerda e 136px acima, com o campo jogado para baixo e para a
     direita. O defeito era antigo e discreto; aumentar a fonte do card deixou `k` menor
     e a folga grande o bastante para saltar aos olhos. */
  campo.style.transformOrigin = 'top left';
  /* `ajustado` esconde a rolagem; ampliado precisa dela, então nunca os dois juntos */
  area.classList.toggle('ajustado', zoom === 'caber' && !ampliado);

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

  /* Os dois modos originais cabem na tela; a diferenca e so a fonte. Em "caber na tela"
     ela sobe para compensar a reducao; em "tamanho real" fica como esta. */
  const fzMax = zoom === 'caber' ? FONTE_MAX : 1;

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
    const efetiva = escala * zFator;
    campo.style.minHeight = altura + 'px';
    /* a LARGURA continua saindo da escala de caber: é ela que dá ao layout o espaço para
       o card largo. A ampliação entra só no transform, e o excedente vira rolagem. */
    campo.style.width = escala < 1 ? (100 / escala).toFixed(3) + '%' : '';
    campo.style.transform = efetiva !== 1 ? 'scale(' + efetiva.toFixed(4) + ')' : '';
    /* no ampliado não se compensa nada: a margem negativa existe para o campo encolhido
       não deixar buraco, e aqui o transbordo é justamente o que se quer */
    compensarEscala(campo, ampliado ? 1 : escala, altura);
  };
  aplicar(alt, k);
  /* Texto do rodape JA, sem esperar o rAF. Ele so era escrito la dentro, e quando o rAF
     nao roda (aba escondida, ou um rAF de outro modo chegou antes e o guarda barrou) o
     rodape ficava com a frase do modo ANTERIOR: dizia "campo em 200%" com o campo em 72%.
     O rAF continua refinando com a medida assentada; aqui so garante que nunca minta. */
  escreverInfo(info, k, alt, disp, zFator);

  /* A largura util muda com a escala: remede e reaplica, agora com o valor certo.
     O `escalaAtual() !== zoom` nao e zelo: este rAF ficou agendado no modo "caber", e se
     a pessoa trocar para 150% antes de ele rodar, ele reaplica o scale(0,77) por cima do
     scale(1,5) que acabou de ser posto — o campo volta ao tamanho antigo e o rotulo do
     botao diz 150%, uma discordancia que so aparece se alguem medir. Cada rAF confere
     se o modo ainda e o dele antes de tocar em qualquer coisa. */
  requestAnimationFrame(() => {
    if (escalaAtual() !== zoom) return;
    const alt2 = distribuir();
    const k2 = Math.min(1, disp / alt2);
    aplicar(alt2, k2);
    atualizarNomes();
    escreverInfo(info, k2, alt2, disp, zFator);
    /* Solta o cadeado so depois que o layout assentou, e ja registra a medida
       resultante como base. Sem isso o proprio ajuste acorda os observadores
       (mudou largura/altura do campo -> mudou a area) e o ciclo nao para. */
    requestAnimationFrame(() => {
      if (escalaAtual() !== zoom) return;
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
                 (COLUNA_ABERTA.has(cod) ? ' aberto' : '') +
                 (POS_ZOOM === cod ? ' zoom' : '');
  el.dataset.pos = cod;

  const falta = lista.length < meta;
  el.innerHTML =
    '<div class="pos-topo">' +
      '<span class="sigla" title="' + esc(p.nome) + '">' + sig(cod) + '</span>' +
      '<span class="pos-nome">' + esc(p.nome) + '</span>' +
      (nEstr ? '<span class="pos-estr" title="' + nEstr + ' estrangeiro(s) nesta posição">' + nEstr + '⚑</span>' : '') +
      '<span class="pos-qtd' + (falta ? ' falta' : '') + '" title="atletas / vagas (clique para mudar)">' +
        '<b>' + lista.length + '</b>/' + meta + '</span>' +
      '<button class="pos-lupa" title="' + (POS_ZOOM === cod ? 'Voltar ao campo (Esc)' : 'Ampliar esta posição') +
        '">' + (POS_ZOOM === cod ? '⤡' : '⤢') + '</button>' +
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
  /* a barra inteira amplia, menos os controles que ja tem dono */
  el.querySelector('.pos-topo').onclick = e => {
    if (e.target.closest('.pos-qtd, .add-mini')) return;
    posZoom(cod);
  };
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
  /* Duas fontes na mesma barra: o Wyscout da MINUTOS, o oGol da JOGOS. Nao se converte
     um no outro — seria inventar minutagem. A barra do oGol e vazada e o balao diz de
     onde veio cada temporada. */
  const txt = h.map((x, i) => (HIST.temporadas[i] || '?') + ': ' +
    (!x ? 'sem dado'
     : x.fonte === 'ogol' ? (x.j || 0) + ' jogos (oGol, sem minutos) · ' + (x.tm || '')
     : milhar(x.min || 0) + ' min em ' + (x.j || 0) + ' jogos · ' + x.l)).join(' · ');
  /* trilho + preenchimento: sozinha, a barra so compara as tres entre si; com o
     trilho da para ver quanto de uma temporada inteira cada ano representa */
  return '<span class="m-min" title="Minutagem por temporada — ' + esc(txt) + '">' +
    h.map(x => {
      if (!x) return '<i class="sem"></i>';
      const pct = x.fonte === 'ogol'
        ? Math.max(6, Math.min(100, (x.j || 0) / JOGOS_TEMPORADA * 100))
        : Math.max(6, Math.min(100, (x.min || 0) / MIN_TEMPORADA * 100));
      return '<i' + (x.fonte === 'ogol' ? ' class="ogol"' : '') +
        '><b style="height:' + pct.toFixed(0) + '%"></b></i>';
    }).join('') + '</span>';
}

/* uid do card sendo editado; null quando o modal esta criando um novo */
let manualEditando = null;

/* O mesmo modal cria e edita. Jogador de fora da base nao tem ficha para abrir —
   editar e o que faz sentido no lugar dela. */
function abrirManual(j) {
  manualEditando = j ? j.uid : null;
  $('#mnTitulo').textContent = j ? 'Editar ' + j.nome : 'Jogador fora da base';
  $('#btManualOk').textContent = j ? 'Salvar' : 'Adicionar';
  $('#mnNome').value = j ? j.nome : '';
  $('#mnClube').value = j ? (j.clube === 'sem clube' ? '' : j.clube) : '';
  $('#mnIdade').value = j && j.idade ? j.idade : '';
  $('#mnSalario').value = j && j.salario ? milhar(j.salario) : '';
  $('#mnContrato').value = j && j.contrato ? j.contrato.slice(0, 7) : '';
  $('#mnEstrangeiro').checked = !!(j && j.estrangeiro);
  $('#mnPais').value = j && j.estrangeiro ? (j.nac || '') : '';
  $('#modalManual').classList.add('aberto');
  setTimeout(() => $('#mnNome').focus(), 60);
}

function cardJog(cod, j) {
  const el = document.createElement('div');
  /* O NÍVEL pinta o card: verde o Main, amarelo o Squad, azul claro o Youth. Era a
     etiqueta SQUAD/YOUTH na linha do meta, e o usuário preferiu a cor — num campo com
     cem cards a cor se lê de longe e a etiqueta exige parar e ler.
     A classe `estrangeiro` NÃO pinta mais nada: o selo do país já diz isso, e duas cores
     de fundo disputando o mesmo card faziam o nível sumir no estrangeiro. */
  const nivel = empDados(empChave(j)).status;
  el.className = 'jog st-' + (j.status || 'alvo') +
                 (j.titular ? ' titular' : '') +
                 (nivel ? ' niv-' + nivel.toLowerCase() : '') +
                 (j.estrangeiro ? ' estrangeiro' : '');
  el.dataset.uid = j.uid;
  el.dataset.pos = cod;
  el.dataset.nome = j.nome;
  el.title = STATUS_ROT[j.status || 'alvo'] +
             (j.estrangeiro ? ' · ESTRANGEIRO (' + (j.nac || '?') + ')' : '') +
             ' · arraste para reordenar · ⋯ abre as ações · × tira do elenco';

  /* O contrato deixou de ser texto ("até 2026") e virou card, como nas listas de
     escolha: ambar cheio para quem vence a tempo da temporada 2027, discreto para o
     resto. Num campo com cem cards, quem esta acabando tem de saltar sem ser procurado. */
  const ct = (j.contrato || '').slice(0, 7);
  const meta =
    (j.idade ? '<span class="m-idade" title="idade">' + j.idade + 'a</span>' : '') +
    (j.clube ? '<span class="m-clube">' + esc(j.clube) + '</span>' : '') +
    (ct ? '<span class="m-ct' + (ct <= FS_LIVRE_ATE ? ' livre' : '') + '" title="contrato até ' +
            esc(j.contrato) + (ct <= FS_LIVRE_ATE ? ' — vence a tempo da temporada 2027' : '') +
            '">' + esc(mesAnoCurto(j.contrato)) + '</span>'
         : '<span class="m-ct sem" title="contrato não informado">sem contrato</span>') +
    (j.ov ? '<span class="m-ovr">OVR ' + j.ov + '</span>' : '') +
    barraMinutos(histDoElenco(j)) +
    (j.posOrig && j.posOrig !== cod ? '<span class="m-pos" title="posição de origem">' +
      sig(j.posOrig) + '</span>' : '');

  el.innerHTML =
    '<div class="jog-nome' + (j.jid != null ? ' clicavel' : '') + '" title="' +
      esc(j.nomeCompleto || j.nome) + (j.jid != null ? ' — clique para ver a ficha' : '') + '">' +
      /* A estrela saiu. Ela dizia "este é o Main", e desde que o NÍVEL passou a pintar o
         card inteiro isso virou repetição — a mesma informação em dois lugares, gastando
         espaço do nome no card mais disputado da tela. Quem define o nível é o menu ⋯,
         em Status. */
      raioIcone(j.pk) +
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
     : j.manual ? '<button class="jog-mais editar" title="Editar este jogador">✎</button>'
     : '<span class="jog-mais vazio"></span>') +
    (() => {
      /* Atalho para a linha do jogador na aba Empresários. O botao muda de cor quando
         ja ha empresario anotado: e a diferenca entre "ainda tenho de descobrir quem
         cuida dele" e "ja sei", visivel no proprio campograma, sem trocar de aba. */
      const d = (estado.emp || {})[empChave(j)] || {};
      const tem = !!d.empresario;
      return '<button class="jog-emp' + (tem ? ' tem' : '') + '" title="' +
        (tem ? esc('Empresário: ' + d.empresario + (d.empresa ? ' · ' + d.empresa : '')) +
               ' — abrir na aba Empresários'
             : 'Sem empresário anotado — abrir na aba Empresários') + '">☎</button>';
    })() +
    '<button class="jog-menu" title="Ações do jogador">⋯</button>' +
    '<button class="jog-x" title="Tirar ' + esc(j.nome) + ' do elenco">×</button>';

  el.querySelector('.jog-emp').onclick = e => {
    e.stopPropagation();
    empFicha(empChave(j), j.nome,
      [j.clube, j.idade ? j.idade + ' anos' : '', j.contrato ? 'até ' + mesAnoCurto(j.contrato) : '']
        .filter(Boolean).join(' · '));
  };

  el.querySelector('.jog-x').onclick = e => {
    e.stopPropagation();
    estado.elenco[cod] = estado.elenco[cod].filter(x => x.uid !== j.uid);
    salvarLocal(); render();
    toast(j.nome + ' saiu de ' + cod);
  };

  const nomeEl = el.querySelector('.jog-nome');
  if (j.jid != null) nomeEl.onclick = e => { if (!e.defaultPrevented) abrirFicha(j); };
  else if (j.manual) {
    nomeEl.classList.add('clicavel');
    nomeEl.title = j.nome + ' — jogador fora da base; clique para editar';
    nomeEl.onclick = e => { if (!e.defaultPrevented) abrirManual(j); };
  }

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
  const bEditar = el.querySelector('button.jog-mais.editar');
  if (bEditar) bEditar.onclick = e => { e.stopPropagation(); abrirManual(j); };
  const bMais = el.querySelector('button.jog-mais:not(.editar)');
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
    (j.manual ? '<button data-a="editar">Editar dados do jogador</button>' : '') +
    '<button data-a="empresario">Empresário e contato</button>' +
    '<button data-a="estrangeiro">' + (j.estrangeiro ? 'Marcar como brasileiro' : 'Marcar como estrangeiro') + '</button>' +
    /* DOIS status, e os nomes precisam separa-los: "Status" e o nivel do atleta no elenco
       (Main/Squad/Youth) e "Status negociacao" e onde a conversa esta (Alvo, Negociando…).
       Sao perguntas diferentes e um jogador tem as duas ao mesmo tempo. O nivel e o MESMO
       campo da aba Empresarios — mesma pergunta nao pode ter duas respostas guardadas em
       lugares diferentes. */
    '<div class="menu-sep">Status</div>' +
    EMP_STATUS.filter(Boolean).map(st => '<button data-a="niv:' + st + '"' +
      (empDados(empChave(j)).status === st ? ' class="atual"' : '') + '>' + st +
      '<i class="menu-nota">' + EMP_STATUS_NOTA[st] + '</i></button>').join('') +
    (empDados(empChave(j)).status
      ? '<button data-a="niv:" class="apagar">tirar o status</button>' : '') +
    '<div class="menu-sep">Status negociação</div>' +
    STATUS.map(st => '<button data-a="st:' + st + '"' +
      ((j.status || 'alvo') === st ? ' class="atual"' : '') + '>' + STATUS_ROT[st] + '</button>').join('') +
    '<div class="menu-sep">Mover para</div>' +
    '<div class="menu-pos">' + POSICOES.filter(p => p.c !== cod).map(p =>
      '<button data-a="mv:' + p.c + '" title="' + esc(p.nome) + '">' + p.sig + '</button>').join('') + '</div>' +
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
    if (a === 'empresario') return empIrPara(empChave(j));
    if (a && a.startsWith('niv:')) {
      definirNivel(cod, j, a.slice(4));
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
    } else if (a === 'editar') {
      m.remove(); abrirManual(j); return;
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
  /* Salario medio e a media de QUEM TEM SALARIO, nao da folha dividida pelo elenco.
     Dividir por todos mistura zeros de quem ainda nao foi precificado: com 97 de 118 sem
     valor lancado, o tile dizia R$ 16,2k quando a media de quem tem era R$ 91,2k — 5,6
     vezes menor, e e um numero que alguem repete numa reuniao. O rotulo mostra a base
     ("de 21") quando nem todos tem salario, no mesmo molde do "de 9" dos estrangeiros. */
  const comSal = todosJogadores().filter(j => j.salario).length;
  $('#kMedia').textContent = brl(comSal ? tot / comSal : 0, true);
  const kmb = $('#kMediaBase');
  if (kmb) {
    kmb.textContent = comSal && comSal < n ? 'de ' + comSal : '';
    kmb.parentElement.parentElement.title = comSal
      ? 'Média dos ' + comSal + ' com salário lançado' +
        (comSal < n ? ' — os outros ' + (n - comSal) + ' ainda não entram na conta' : '')
      : 'Nenhum salário lançado ainda';
  }
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
        .map(j => '<div class="estr-item jog-mv" data-pos="' + j.pos + '" data-uid="' + j.uid + '"' +
          ' title="' + esc(j.nome + ' · ' + nomePos(j.pos) + ' — clique para mover de posição') + '">' +
          '<span class="pos-tag">' + j.pos + '</span>' +
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
    '<div class="top-sal jog-mv" data-pos="' + j.pos + '" data-uid="' + j.uid + '"' +
    ' title="' + esc(j.nome + ' · ' + nomePos(j.pos) + ' — clique para mover de posição') + '">' +
    '<span class="pos-tag">' + j.pos + '</span>' +
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
  { c: 'p',   r: 'Pos.',     w: 5,   cel: j => sig(j.p), tit: j => 'Wyscout: ' + (j.pw || '—') },
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
    ' · clique para adicionar em <b>' + sig(posAtual) + '</b>';

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
  if (lista.some(x => x.jid === id)) { toast('Esse jogador já está em ' + sig(posAtual), 'ruim'); return; }
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
  toast(j.n + ' adicionado em ' + sig(posAtual) + ' — defina o salário', 'bom');
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
  /* Main passou a SER o titular. Quem já era titular antes disso tem a estrela mas
     nenhum nível gravado — a tela mostraria estrela de Main com o Status em branco, que
     é a contradição que a unificação veio evitar. Marca os existentes como Main. */
  if ((estado.v || 1) < 5) {
    POSICOES.forEach(p => (estado.elenco[p.c] || []).forEach(j => {
      if (!j.titular) return;
      const ch = empChave(j);
      if (!empDados(ch).status) empGravar(ch).status = 'Main';
    }));
  }
  estado.v = VERSAO;
}

/* Os jogadores gravados antes da base ampliada guardaram so o id, que mudou.
   Reancora cada um pela primary_key assim que a base carrega. */
/* Religa cada card do elenco ao registro da base. O `id` muda a cada regeração; a
   `pk` ("Nome - Time - Liga") sobrevive, mas tambem quebra quando o jogador troca de
   clube e a base e refeita.

   Quem perdeu a ancora e reavaliado A CADA carregamento. Antes havia um
   `if (j.jid == null) return;` logo na entrada: bastava uma regeração em que o
   casamento falhasse para o jogador ficar sem `jid` PARA SEMPRE — sem o "+" da ficha,
   sem historico, sem fisico, mesmo depois de a base voltar a te-lo. Foi o que
   aconteceu com o Maurício e o Maykon. So os cards criados a mão (`manual`) ficam
   de fora, porque esses nunca tiveram registro na base. */
function reancorar() {
  let ajustados = 0, perdidos = 0, recuperados = 0;
  const chave = t => norma(t);
  /* nome normalizado -> registros, para o ultimo recurso */
  const porNome = {};
  BASE.forEach(x => { (porNome[chave(x.n)] = porNome[chave(x.n)] || []).push(x); });

  POSICOES.forEach(p => (estado.elenco[p.c] || []).forEach(j => {
    if (j.manual) return;
    const tinha = j.jid != null;
    if (j.pk && BASE.some(x => primaryKey(x) === j.pk)) return;

    const mesmos = porNome[chave(j.nome)] || [];
    const achado =
      mesmos.find(x => chave(x.t) === chave(j.clube)) ||
      mesmos.find(x => x.p === (j.posOrig || p.c)) ||
      (mesmos.length === 1 ? mesmos[0] : null);

    if (achado) {
      j.jid = achado.id;
      j.pk = primaryKey(achado);
      if (tinha) ajustados++; else recuperados++;
    } else if (tinha) {
      j.jid = null; j.pk = null; perdidos++;
    }
  }));
  if (ajustados || perdidos || recuperados) {
    salvarLocal(); render();
    console.log('reancorados:', ajustados, '| recuperados:', recuperados,
                '| sem correspondência:', perdidos);
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

/* Sem servidor, esconde o que dependia dele e avisa — melhor do que o usuario
   descobrir que clicou em Salvar e nada foi guardado. */
function prepararEstatico() {
  /* So o EXCEL sai de cena agora: e o servidor que monta o xlsx (openpyxl). O comparativo
     voltou, porque a conta dele e pura e os grupos ja estao no navegador — ver
     `comparativoLocal()`. Salvar, trocar, renomear e excluir tambem funcionam aqui.

     ATENCAO ao mexer nesta lista: ela esconde por ID, e ID errado nao da erro nenhum.
     Aqui havia '#btComparativo', que NUNCA existiu — o botao real e '#btComparar', e
     mora dentro do menu Grupo. Resultado: durante todo o tempo em que o comparativo
     "estava fora" do site, o botao continuou la, visivel e clicavel, so que buscando um
     `api/comparativo` que no Pages e 404 — clicar nao fazia absolutamente nada, sem aviso.
     Se acrescentar um seletor aqui, confira que ele casa com algo. */
  ['#btExcel'].forEach(sel => { const e = $(sel); if (e) e.style.display = 'none'; });
  const info = $('#abasInfo');
  if (info) info.insertAdjacentHTML('beforebegin',
    '<span class="fb-conta" id="fbConta"></span>' +
    '<span class="aviso-estatico" id="avisoEstatico"></span>');
  fbBotao();
}

/* O botao e o aviso dizem a MESMA coisa por caminhos diferentes: onde o Salvar vai
   parar. Foi justamente isso que faltou — o usuario salvou na web esperando que todos
   vissem, e o texto de antes ("salva no seu navegador") estava no balao, escondido.
   Agora o estado fica na barra, escrito, sem precisar passar o mouse. */
function fbBotao() {
  const el = $('#fbConta'), av = $('#avisoEstatico');
  if (!el) return;
  const base = 'Esta é a versão publicada. A exportação em Excel sai de cena (é o servidor ' +
               'que monta o arquivo); PNG, PDF e o comparativo entre grupos continuam.';
  if (FB.usuario) {
    const email = FB.usuario.email || 'você';
    /* SEM ACESSO e "salvando para todos" nao podem aparecer juntos — apareceram, numa
       tela real, e as duas frases se contradizem: entrou, mas o e-mail nao esta nas
       regras, entao nada vai para a nuvem. Dizer que esta salvando para todos nesse
       estado e prometer o que nao acontece, e o pior tipo de erro de interface: o
       usuario so descobre quando o outro nao ve o grupo. */
    const semAcesso = !!FB.erro;
    el.innerHTML = '<b class="fb-on' + (semAcesso ? ' bloq' : '') + '" title="' + esc(email) +
      (semAcesso ? ' — entrou, mas este e-mail não está liberado nas regras do Firestore'
                 : ' — o que você salvar fica visível para todos') + '">✓ ' + esc(email) + '</b>' +
      '<button class="fb-bt" id="fbSair">sair</button>';
    $('#fbSair').onclick = fbSair;
    if (av) {
      av.textContent = semAcesso ? 'sem acesso — salva só neste navegador' : 'salvando para todos';
      av.title = semAcesso
        ? 'Seu e-mail não está na lista das regras do Firestore, então os grupos ' +
          'compartilhados não carregam e o Salvar fica só neste navegador. ' + base
        : base;
    }
  } else if (FB.pronto) {
    el.innerHTML = '<button class="fb-bt entrar" id="fbEntrar" title="Entrar com o Google. ' +
      'Sem entrar, o que você salvar fica só neste navegador; entrando, fica visível para ' +
      'todos que têm acesso.">Entrar para compartilhar</button>';
    $('#fbEntrar').onclick = fbEntrar;
    if (av) { av.textContent = 'salva só neste navegador'; av.title = base; }
  } else {
    /* nuvem desligada (config vazia) ou biblioteca fora do ar: e o site de sempre, e o
       aviso tem de continuar dizendo a verdade antiga, nao prometer compartilhamento */
    el.innerHTML = FB.erro
      ? '<b class="fb-off" title="' + esc(FB.erro) + '">nuvem fora do ar</b>' : '';
    if (av) { av.textContent = 'salva só neste navegador'; av.title = base; }
  }
  if (FB.erro && FB.usuario) {
    el.insertAdjacentHTML('beforeend',
      '<b class="fb-off" title="' + esc(FB.erro) +
      ' — peça para incluírem seu e-mail nas regras do Firestore">⚠ sem acesso</b>');
  }
}

/* ---------------- cenarios sem servidor ----------------
   No site publicado nao ha api/cenarios. Dois lugares fazem o papel dela:
     - dados/cenarios_publicados.json: os grupos gravados no app na hora de publicar. Sao
       so LEITURA — modelos de partida, iguais para todo mundo que abre o site.
     - localStorage (CHAVE_CEN_LOCAL): o que a pessoa salva no navegador dela. Vence o
       publicado quando tem o mesmo id (editou um modelo e salvou por cima).
   Quem chama listar/salvar/abrir/excluir nao precisa saber qual dos dois respondeu. */
const CHAVE_CEN_LOCAL = 'sc2027_cenarios';
let CEN_PUBLICADOS = null;

/* ---------------- terceiro backend: a NUVEM (Firestore) ----------------
   O localStorage resolve "guardar", nao resolve "compartilhar": o que a pessoa salva no
   site fica no aparelho dela e mais ninguem ve. Para um grupo salvo na web valer para
   TODOS e preciso um lugar fora do navegador, e o GitHub Pages nao tem servidor. O
   Firestore entra exatamente nesse buraco — o navegador fala direto com ele.

   Projeto PROPRIO do Santa Cruz, separado do `ranking-botafogo`: sao clubes diferentes,
   e o do Botafogo grava sem login nenhum (regras abertas), o que aqui seria inaceitavel.
   O motivo do login nao e cerimonia: este site e PUBLICO e os grupos carregam a folha
   salarial. Sem login, quem achasse o endereco leria os salarios e reescreveria o
   planejamento. Quem autoriza sao as regras do servidor (`firestore.rules`), nunca o
   codigo daqui — a config e publica por desenho e so identifica o projeto.

   Quatro estados, e a tela diz em qual esta:
     - sem config preenchida -> a nuvem nem carrega; o site e o de hoje;
     - com config, sem SDK ou sem rede -> idem, e o botao avisa;
     - com SDK e sem login -> navegador + publicados, com o botao "Entrar";
     - com login -> aparece o bloco "Compartilhados", e Salvar grava la. */
const FB_COLECAO = 'cenarios';
let FB = { cfg: null, pronto: false, db: null, auth: null, usuario: null, erro: '' };

async function fbConfig() {
  if (FB.cfg !== null) return FB.cfg;
  try {
    const v = window.__verDados ? '?v=' + window.__verDados : '';
    const r = await fetch('dados/firebase.json' + v);
    const c = r.ok ? await r.json() : null;
    /* `projectId` vazio = nuvem desligada de proposito. E o estado em que o arquivo
       nasce, para o site nunca depender de algo que ainda nao existe. */
    FB.cfg = (c && c.projectId) ? c : false;
  } catch (e) { FB.cfg = false; }
  return FB.cfg;
}

async function fbIniciar() {
  if (!ESTATICO || FB.pronto) return false;
  const cfg = await fbConfig();
  if (!cfg) return false;
  if (typeof firebase === 'undefined' || !firebase.initializeApp) {
    FB.erro = 'a biblioteca do Firebase não carregou';
    return false;
  }
  try {
    if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(cfg);
    FB.db = firebase.firestore();
    FB.auth = firebase.auth();
    FB.pronto = true;
    /* dispara tambem na volta de um login antigo: e o que faz a pessoa continuar
       logada ao reabrir o site, sem precisar clicar em Entrar de novo */
    FB.auth.onAuthStateChanged(u => {
      FB.usuario = u || null;
      FB.erro = '';
      fbBotao();
      listarCenarios();
    });
    return true;
  } catch (e) { FB.erro = String((e && e.message) || e); return false; }
}

async function fbEntrar() {
  if (!FB.pronto) { toast('A nuvem não está ligada neste site', 'ruim'); return; }
  try {
    await FB.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  } catch (e) {
    /* fechar a janelinha do Google e desistencia, nao erro: nao merece toast vermelho */
    const c = (e && e.code) || '';
    if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request') return;
    /* `unauthorized-domain` e o tropeco numero 1 de quem liga o Firebase num site que nao
       e do proprio Firebase: por padrao so `localhost` e os dominios `*.firebaseapp.com` /
       `*.web.app` valem, e o github.io NAO esta na lista. A mensagem crua nao diz onde
       resolver, entao ela e trocada pela instrucao. */
    if (c === 'auth/unauthorized-domain') {
      toast('Falta autorizar o domínio ' + location.hostname + ' no Firebase ' +
            '(Authentication → Settings → Authorized domains)', 'ruim');
      return;
    }
    if (c === 'auth/operation-not-allowed') {
      toast('O login com Google não está ligado no Firebase ' +
            '(Authentication → Sign-in method → Google)', 'ruim');
      return;
    }
    toast('Não deu para entrar: ' + ((e && e.message) || c), 'ruim');
  }
}

async function fbSair() {
  if (!FB.pronto) return;
  await FB.auth.signOut();
  toast('Saiu — os grupos compartilhados saíram da lista');
}

/* Estes tres sao os unicos que tocam o Firestore. Todos devolvem "vazio" quando nao ha
   login, para quem chama nao ter de perguntar antes. */
async function cenNuvemLer() {
  if (!FB.pronto || !FB.usuario) return [];
  try {
    const q = await FB.db.collection(FB_COLECAO).get();
    return q.docs.map(d => Object.assign({}, d.data(), { id: d.id }));
  } catch (e) {
    /* `permission-denied` aqui quer dizer "entrou, mas o e-mail nao esta na lista das
       regras" — o erro mais provavel de todos, e o que mais confunde se ficar mudo */
    FB.erro = ((e && e.code) === 'permission-denied')
      ? 'seu e-mail não está liberado nas regras' : String((e && e.message) || e);
    fbBotao();
    return [];
  }
}

async function cenNuvemGravar(cen) {
  if (!FB.pronto || !FB.usuario) return false;
  try {
    const doc = JSON.parse(JSON.stringify(cen));
    delete doc.origem;
    doc.id = cen.id;
    doc.porEmail = (FB.usuario && FB.usuario.email) || '';
    await FB.db.collection(FB_COLECAO).doc(cen.id).set(doc);
    return true;
  } catch (e) {
    toast(((e && e.code) === 'permission-denied')
      ? 'Seu e-mail não está liberado para gravar — veja firestore.rules'
      : 'Não deu para gravar na nuvem: ' + ((e && e.message) || e), 'ruim');
    return false;
  }
}

async function cenNuvemApagar(id) {
  if (!FB.pronto || !FB.usuario) return false;
  try { await FB.db.collection(FB_COLECAO).doc(id).delete(); return true; }
  catch (e) { toast('Não deu para excluir na nuvem: ' + ((e && e.message) || e), 'ruim'); return false; }
}

function cenLocalLer() {
  try { const l = JSON.parse(localStorage.getItem(CHAVE_CEN_LOCAL)); return Array.isArray(l) ? l : []; }
  catch (e) { return []; }
}
function cenLocalGravar(lista) {
  try { localStorage.setItem(CHAVE_CEN_LOCAL, JSON.stringify(lista)); return true; }
  catch (e) { toast('O navegador não deixou gravar (espaço cheio ou modo privado)', 'ruim'); return false; }
}
async function cenPublicados() {
  if (CEN_PUBLICADOS) return CEN_PUBLICADOS;
  try {
    const v = window.__verDados ? '?v=' + window.__verDados : '';
    const r = await fetch('dados/cenarios_publicados.json' + v);
    CEN_PUBLICADOS = r.ok ? await r.json() : [];
  } catch (e) { CEN_PUBLICADOS = []; }
  return CEN_PUBLICADOS;
}
/* Lista unida das tres origens, e a ORDEM DE PRECEDENCIA importa:
     nuvem > navegador > publicado.
   A nuvem vem primeiro porque e a unica compartilhada — se um grupo existe la, e ele que
   todo mundo tem que ver, senao duas pessoas olhariam numeros diferentes com o mesmo
   nome na tela. O navegador vence o publicado pelo mesmo motivo de sempre (editou um
   modelo e salvou por cima). Um id so aparece uma vez, na origem de maior precedencia. */
async function cenTodos() {
  const nuvem = await cenNuvemLer();
  const vistos = new Set(nuvem.map(c => c.id));
  const locais = cenLocalLer().filter(c => !vistos.has(c.id));
  locais.forEach(c => vistos.add(c.id));
  const pub = (await cenPublicados()).filter(c => !vistos.has(c.id));
  return nuvem.map(c => Object.assign({ origem: 'nuvem' }, c))
    .concat(locais.map(c => Object.assign({ origem: 'navegador' }, c)))
    .concat(pub.map(c => Object.assign({ origem: 'publicado' }, c)));
}

async function listarCenarios() {
  try {
    let lista;
    if (ESTATICO) lista = await cenTodos();
    else { const r = await fetch('api/cenarios'); lista = await r.json(); }
    const sel = $('#selCenario');
    const opt = c => '<option value="' + esc(c.id) + '">' + esc(c.nome) + ' · ' + brl(c.total, true) +
      ' · ' + c.atletas + ' atl.' + (c.origem === 'publicado' ? ' · publicado' : '') + '</option>';
    if (ESTATICO) {
      const nuv = lista.filter(c => c.origem === 'nuvem');
      const meus = lista.filter(c => c.origem === 'navegador');
      const pub = lista.filter(c => c.origem === 'publicado');
      sel.innerHTML = '<option value="">— grupo não salvo —</option>' +
        (nuv.length ? '<optgroup label="Compartilhados (todos veem)">' + nuv.map(opt).join('') + '</optgroup>' : '') +
        (meus.length ? '<optgroup label="Salvos só neste navegador">' + meus.map(opt).join('') + '</optgroup>' : '') +
        (pub.length ? '<optgroup label="Publicados (ponto de partida)">' + pub.map(opt).join('') + '</optgroup>' : '');
    } else {
      sel.innerHTML = '<option value="">— grupo não salvo —</option>' + lista.map(opt).join('');
    }
    if (estado.id) sel.value = estado.id;
  } catch (e) {}
}

/* SALVAR GRAVA POR CIMA. Se o grupo já existe (tem `id`), o Salvar sobrescreve ele e
   pronto — sem perguntar nada. Para criar outro existe o "Salvar como novo grupo".

   Quando NÃO havia id o Salvar criava um grupo novo em silêncio, e isso mordia num caso
   comum: o elenco de partida do site publicado entra com `id: null` de propósito (para
   ninguém sobrescrever o modelo sem querer), então o primeiro Salvar de quem abria o site
   criava um grupo novo em vez de atualizar o que estava na tela. Agora, sem id, o app
   PERGUNTA o nome — fica explícito que está nascendo um grupo, em vez de aparecer um
   duplicado na lista. */
async function salvarCenario(comoNovo) {
  if (comoNovo || !estado.id) {
    const sugerido = comoNovo ? (estado.nome || 'Grupo') + ' (cópia)' : (estado.nome || 'Grupo 1');
    const nome = prompt(comoNovo ? 'Nome do novo grupo:' : 'Este grupo ainda não foi salvo. Nome:', sugerido);
    if (nome === null) return;                 /* cancelou: não salva nada */
    if (nome.trim()) estado.nome = nome.trim();
    estado.id = null;                          /* força id novo abaixo */
  }
  return gravarCenario();
}

/* A gravação em si, sem perguntar nada. Separada porque o "Duplicar grupo" já pediu o
   nome antes de chamar — sem isto, ele perguntaria duas vezes seguidas. */
async function gravarCenario() {
  estado.total = totalGeral();
  estado.atletas = todosJogadores().length;
  let id, ondeFoi = '';
  if (ESTATICO) {
    id = estado.id || ((FB.usuario ? 'nuv-' : 'nav-') + Date.now().toString(36));
    estado.id = id;
    estado.atualizado = new Date().toISOString();
    /* COM LOGIN a nuvem manda: e o unico jeito de "salvou, todos veem". Se a gravacao
       falhar (regra, rede), NAO cai calado para o localStorage — isso seria o pior dos
       mundos, a pessoa acreditando que compartilhou quando so guardou no proprio
       aparelho. O cenNuvemGravar ja explicou o motivo num toast; aqui so paramos. */
    if (FB.usuario && !FB.erro) {
      if (!await cenNuvemGravar(estado)) return;
      ondeFoi = ' — todos veem';
    } else {
      /* sem login: como sempre foi, no navegador de quem salvou. Grava por cima se ja
         tem id (inclusive de um publicado: a copia local passa a valer para essa pessoa) */
      const lista = cenLocalLer().filter(c => c.id !== id);
      lista.unshift(JSON.parse(JSON.stringify(estado)));
      if (!cenLocalGravar(lista)) return;
      ondeFoi = ' neste navegador';
    }
  } else {
    const r = await fetch('api/cenarios', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(estado),
    });
    const j = await r.json();
    id = j.id;
    estado.id = id;
  }
  salvarLocal();
  await listarCenarios();
  $('#selCenario').value = id;
  sincronizarBotoes();
  toast('Grupo "' + estado.nome + '" salvo' + (ESTATICO ? ondeFoi : ''), 'bom');
}

function aplicarTema() {
  const claro = estado.tema === 'claro';
  document.body.classList.toggle('claro', claro);
  const b = $('#btTema');
  if (b) b.innerHTML = 'Tema: <b>' + (claro ? 'claro' : 'escuro') + '</b>';
  /* o mesmo controle, a um clique na barra: o menu Visual escondia demais */
  const bt = $('#btTemaTopo');
  if (bt) {
    bt.textContent = claro ? '☾' : '☀';
    bt.title = claro ? 'Passar para o modo escuro' : 'Passar para o modo claro';
  }
}

function sincronizarBotoes() {
  aplicarTema();
  /* O botão tem de dizer o que vai acontecer ANTES do clique: gravar por cima de um grupo
     e criar um grupo novo são coisas diferentes, e a diferença não pode estar só no
     resultado. */
  const bS = $('#btSalvar');
  if (bS) bS.title = estado.id
    ? 'Grava por cima de "' + (estado.nome || 'este grupo') + '" (Ctrl+S)'
    : 'Este grupo ainda não foi salvo — vai pedir um nome (Ctrl+S)';
  const bA = $('#btAjustar');
  if (bA) bA.innerHTML = 'Escala: <b>' + rotuloEscala() + '</b>';
  const det = !!(estado.ct && estado.ct.detalhar);
  $('#inComissao').readOnly = det;
  $('#inComissao').classList.toggle('travado', det);
  $('#btOrient').innerHTML = 'Campo: <b>' + (estado.orientacao === 'vertical' ? 'em pé' : 'deitado') + '</b>';
  $('#btDenso').innerHTML = 'Cards: <b>' + (estado.denso ? 'compactos' : 'completos') + '</b>';
}

async function abrirCenario(id) {
  if (!id) return;
  let dados;
  if (ESTATICO) {
    dados = (await cenTodos()).find(c => c.id === id);
    if (!dados) { toast('Grupo não encontrado', 'ruim'); return; }
    dados = JSON.parse(JSON.stringify(dados)); delete dados.origem;
  } else {
    const r = await fetch('api/cenario/' + id);
    if (!r.ok) { toast('Grupo não encontrado', 'ruim'); return; }
    dados = await r.json();
  }
  estado = Object.assign(novoEstado(), dados);
  POSICOES.forEach(p => { if (!Array.isArray(estado.elenco[p.c])) estado.elenco[p.c] = []; });
  migrar();
  salvarLocal(); render(); sincronizarBotoes();
  toast('Grupo "' + estado.nome + '" carregado');
}

/* ---------------- comparar grupos ----------------
   O resumo de cada grupo era conta do servidor (`api/comparativo`) e por isso a tela
   ficava de fora do site publicado. Mas a conta e pura — soma salario, aplica o fator,
   junta por setor — e no site os grupos JA estao no navegador (publicados + localStorage).
   Entao a mesma conta roda dos dois lados: o Flask continua respondendo para o app local,
   e `comparativoLocal()` responde no site. Tem que dar o MESMO resultado, entao os campos
   e a ordem sao os do endpoint, um a um; mexer num lado sem o outro e o jeito de fazer
   dois numeros diferentes para a mesma pergunta. */
const COMP_SETOR = { gol: ['GOL'], defesa: ['LD', 'LE', 'ZD', 'ZE'],
                     meio: ['VOL', 'MED', 'MEI'], ataque: ['EE', 'ED', 'CA'] };
async function comparativoLocal() {
  const num = v => Number(v) || 0;
  const saida = (await cenTodos()).map(c => {
    const elenco = c.elenco || {};
    const atletas = Object.values(elenco).flat();
    const folha = atletas.reduce((t, j) => t + num(j.salario), 0);
    const fator = num(c.fator) || 1;
    const comissao = num(c.comissao), teto = num(c.teto);
    const idades = atletas.map(j => Number(j.idade)).filter(x => x);
    const setores = {};
    Object.entries(COMP_SETOR).forEach(([se, poss]) => {
      setores[se] = poss.reduce((t, p) =>
        t + (elenco[p] || []).reduce((u, j) => u + num(j.salario), 0), 0);
    });
    return {
      id: c.id, nome: c.nome || 'sem nome', atualizado: c.atualizado || '',
      origem: c.origem,
      atletas: atletas.length,
      estrangeiros: atletas.filter(j => j.estrangeiro).length,
      folha, fator, comissao, teto,
      custoElenco: folha * fator,
      custoTotal: folha * fator + comissao,
      sobra: teto - (folha * fator + comissao),
      /* mesma definicao do tile do cabecalho: media de quem TEM salario */
      media: atletas.filter(j => j.salario).length
        ? folha / atletas.filter(j => j.salario).length : 0,
      maior: atletas.length ? Math.max(...atletas.map(j => num(j.salario))) : 0,
      idadeMedia: idades.length ? idades.reduce((t, x) => t + x, 0) / idades.length : 0,
      semSalario: atletas.filter(j => !j.salario).length,
      setores,
    };
  });
  saida.sort((a, b) => String(b.atualizado).localeCompare(String(a.atualizado)));
  return saida;
}

async function abrirComparativo() {
  let gs;
  if (ESTATICO) gs = await comparativoLocal();
  else { const r = await fetch('api/comparativo'); gs = await r.json(); }
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
      '<span class="quando">' + esc(g.atualizado) +
      (g.origem === 'publicado' ? ' · publicado' : '') + '</span></th>').join('') +
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
    posicao: sig(j.pos) + ' · ' + j.posNome, nome: j.nome, clube: j.clube, liga: j.liga,
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

/* ---------------- PNG: pelo motor do navegador, não pelo html2canvas ----------------
   O html2canvas redesenha o HTML por conta própria e **não implementa CSS Grid**. O card
   do jogador É uma grade (`grid-template-columns: 1fr auto 20px…`), então a coluna do
   nome colapsava: a imagem saía com os cards deslocados, só a parte da direita desenhada
   e NENHUM nome — foi exatamente a queixa.

   Aqui o desenho é feito pelo próprio navegador: o campo vai inteiro para dentro de um
   `<foreignObject>` de SVG, com o CSS do app embutido, e o SVG é rasterizado. Grade,
   flex, variáveis e tudo o mais saem idênticos ao que está na tela, porque é o mesmo
   motor que desenha as duas coisas.

   Três detalhes que o clone exige:
     - a ESCALA da tela sai antes (o `transform` reduz o campo; a imagem tem de sair no
       tamanho natural), e volta depois;
     - `<input>` não leva o texto digitado no clone do HTML — o salário sumiria. O valor
       é copiado para o atributo, um a um;
     - o CSS precisa ser escapado para XML, senão um `&` ou um `<` dentro de uma regra
       quebra o documento inteiro e a imagem não carrega. */
async function campoComoCanvas(escala) {
  const campo = $('#campo');
  const guarda = {
    transform: campo.style.transform,
    marginBottom: campo.style.marginBottom,
    marginRight: campo.style.marginRight,
  };
  /* Duas coisas saem antes de capturar, e as duas por motivos diferentes:
       1. A ESCALA. O html2canvas desenha a caixa de layout e não entende `transform`;
          com o campo reduzido, a imagem saía cortada e fora de lugar.
       2. A GRADE. O card é `display:grid`, e o html2canvas NÃO implementa CSS Grid — a
          coluna `1fr` do nome colapsava e a imagem saía sem nenhum nome, que foi a
          queixa. A classe `exportando` troca o card para bloco com o salário posicionado
          à direita: mesmo resultado visual, com caixas que ele sabe desenhar.
     (Tentei antes desenhar via `<foreignObject>` de SVG, que usaria o próprio motor do
      navegador e sairia idêntico. O Chrome "suja" o canvas nesse caso e proíbe exportar —
      `Tainted canvases may not be exported` —, então não serve para gerar arquivo.) */
  campo.classList.add('exportando');
  campo.style.transform = '';
  campo.style.marginBottom = '';
  campo.style.marginRight = '';
  /* Dois quadros para o layout assentar, MAS com saída por tempo: `requestAnimationFrame`
     não dispara em aba escondida, e quem exportasse e trocasse de aba ficaria esperando
     para sempre — a exportação travava sem erro e sem imagem. */
  await new Promise(r => {
    let feito = false;
    const pronto = () => { if (!feito) { feito = true; r(); } };
    requestAnimationFrame(() => requestAnimationFrame(pronto));
    setTimeout(pronto, 150);
  });
  const larg = campo.offsetWidth, alt = campo.offsetHeight;
  try {
    return await html2canvas(campo, {
      backgroundColor: '#0d0f13', scale: escala || 2, logging: false,
      width: larg, height: alt, windowWidth: larg, windowHeight: alt,
      scrollX: 0, scrollY: 0,
    });
  } finally {
    campo.classList.remove('exportando');
    Object.assign(campo.style, guarda);
    ajustarCampo();
  }
}


async function exportarPng() {
  if (window.__semPng || typeof html2canvas === 'undefined') {
    toast('Gerador de imagem indisponível — use o botão PDF', 'ruim'); return;
  }
  toast('Gerando imagem…');
  try {
    const cv = await campoComoCanvas(2);
    const a = document.createElement('a');
    a.href = cv.toDataURL('image/png');      /* lança se o canvas tiver sido "sujo" */
    a.download = 'campograma-' + (estado.nome || 'grupo').replace(/[^\w\s-]/g, '') + '.png';
    a.click();
    toast('Imagem salva', 'bom');
  } catch (e) {
    toast('Não deu para gerar a imagem: ' + ((e && e.message) || e) + ' — use o botão PDF', 'ruim');
  }
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

/* texto comparavel: sem acento, sem caixa, sem espaco sobrando */
function norma(t) {
  return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, ' ');
}

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

/* 'dez/26' — a forma curta, para os cards apertados */
function mesAnoCurto(iso) {
  if (!iso || iso.length < 7) return '';
  const M = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return M[parseInt(iso.slice(5, 7), 10) - 1] + '/' + iso.slice(2, 4);
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
  /* Enquanto a ficha esta aberta ela fica com a tela inteira: presa aos 56vh de
     antes, sobrava metade da altura para o campo e a ficha rolava. O campo volta
     ao fechar. */
  $('#pgCampo').classList.add('com-ficha');
  $('#fiCorpo').innerHTML = '<div class="fi-sem" style="padding:14px">carregando indicadores…</div>';
  await renderFicha();
  ajustarCampo();
  $('#ficha').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function fecharFicha() {
  $('#ficha').classList.add('oculta');
  $('#pgCampo').classList.remove('com-ficha');
  requestAnimationFrame(ajustarCampo);
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
/* ---------------- radar da ficha, na leitura do Ranking ----------------
   Um eixo por grupo de indicadores. O valor do eixo e a media, dentro do grupo, da
   posicao de cada indicador entre 0 e o melhor da coorte — a mesma conta que a
   barrinha de `linhaInd` ja desenha, so que resumida. Dois poligonos: o jogador e a
   media da coorte, como no radar do Ranking. */
const RADAR_EIXOS = ['Defesa', 'Ataque', 'Passe', 'Decisão (DGP)', 'Físico'];
const RADAR_ROT = { 'Decisão (DGP)': 'DGP', 'Físico': 'Físico' };

function radarSVG(eixos, tam) {
  /* a caixa e mais larga que alta de proposito: os rotulos laterais ("Físico",
     "Passe") saem para fora do circulo e, num viewBox quadrado, o da esquerda
     aparecia cortado como "ísico" */
  const larg = tam + 76;
  const cx = larg / 2, cy = tam / 2, R = tam / 2 - 26, N = eixos.length;
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / N;
  const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
  const pol = (f, extra) => '<polygon points="' + eixos.map((_, i) =>
    pt(i, R * f).map(v => v.toFixed(1)).join(',')).join(' ') + '" ' + extra + '/>';

  let g = '';
  [0.25, 0.5, 0.75, 1].forEach(f => { g += pol(f, 'fill="none" class="rd-grade"'); });
  eixos.forEach((e, i) => {
    const [x, y] = pt(i, R);
    g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' +
         y.toFixed(1) + '" class="rd-grade"/>';
    const [lx, ly] = pt(i, R + 15);
    const anc = Math.abs(lx - cx) < 6 ? 'middle' : (lx < cx ? 'end' : 'start');
    g += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="' + anc +
         '" dominant-baseline="middle" class="rd-rot">' + esc(e.rot) + '</text>';
  });
  const area = (chave, cls) => '<polygon points="' + eixos.map((e, i) =>
    pt(i, R * Math.max(0, Math.min(100, e[chave] || 0)) / 100).map(v => v.toFixed(1)).join(',')
    ).join(' ') + '" class="' + cls + '"/>';
  return '<svg viewBox="0 0 ' + larg + ' ' + tam + '" class="rd-svg">' + g +
    area('med', 'rd-coorte') + area('val', 'rd-jog') + '</svg>';
}

/* porGrupo: grupo -> [[rotulo, valor, media, melhor], ...] */
function radarDaFicha(porGrupo, nomeJog) {
  const eixos = [];
  RADAR_EIXOS.forEach(g => {
    const linhas = porGrupo[g];
    if (!linhas || !linhas.length) return;
    const rel = (k) => {
      const vs = linhas.map(l => {
        const mx = l[3];
        if (typeof l[k] !== 'number' || typeof mx !== 'number' || mx <= 0) return null;
        return Math.max(0, Math.min(100, l[k] / mx * 100));
      }).filter(v => v != null);
      return vs.length ? vs.reduce((a, v) => a + v, 0) / vs.length : null;
    };
    const val = rel(1), med = rel(2);
    if (val == null) return;
    eixos.push({ rot: RADAR_ROT[g] || g, val, med: med == null ? 0 : med, n: linhas.length });
  });
  if (eixos.length < 3) return '';
  const tabela = eixos.map(e =>
    '<div class="rd-linha"><span class="r">' + esc(e.rot) + '</span>' +
    '<span class="a">' + Math.round(e.val) + '</span>' +
    '<span class="b">' + Math.round(e.med) + '</span>' +
    '<span class="d ' + (e.val >= e.med ? 'mais' : 'menos') + '">' +
      (e.val >= e.med ? '+' : '') + Math.round(e.val - e.med) + '</span></div>').join('');
  return '<div class="fi-grupo fi-radar"><h4>Radar</h4>' +
    radarSVG(eixos, 172) +
    '<div class="rd-leg">' +
      '<span><i class="jog"></i>' + esc(nomeJog) + '</span>' +
      '<span><i class="coorte"></i>média da coorte</span></div>' +
    '<div class="rd-tab"><div class="rd-linha cab"><span class="r">eixo</span>' +
      '<span class="a">ele</span><span class="b">média</span><span class="d">dif.</span></div>' +
      tabela + '</div>' +
    '<div class="rd-nota">Cada eixo é a média do grupo entre 0 e o melhor da coorte — ' +
      'a mesma escala das barras ao lado.</div></div>';
}

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
  const sub = j.t + ' · ' + j.l + ' · ' + sig(j.p) + (j.pw ? ' (' + j.pw + ')' : '') +
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
  const porGrupo = {};
  if (dados && dados.ok) {
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
    if (!e) return;
    colFis += linhaInd(rot, j[campo], e.media, e.max, casas);
    (porGrupo['Físico'] = porGrupo['Físico'] || []).push([rot, j[campo], e.media, e.max]);
  });
  colunas += '<div class="fi-grupo"><h4>Físico (SkillCorner)</h4>' +
    (colFis || '<div class="fi-sem">sem tracking para este jogador</div>') + '</div>';

  /* o radar entra na frente das colunas: e o resumo delas */
  const radar = radarDaFicha(porGrupo, j.n);

  const corpo = '<div class="fi-grid">' + radar + colunas + '</div>' +
    '<div class="fi-leg">' +
      '<span><i class="v"></i>acima da média</span>' +
      '<span><i class="r"></i>abaixo</span>' +
      '<span><i class="a"></i>líder da coorte</span>' +
      '<span><i class="m"></i>média da coorte</span>' +
      '<span class="num-leg">média</span>' +
      '<span class="num-leg forte">melhor</span>' +
    '</div>';

  const rodape = 'Comparado com ' + milhar(lista.length) + ' jogadores de ' + sig(j.p) +
    (modo === 'posbr' ? ' nas ligas brasileiras' : modo === 'posliga' ? ' da ' + j.l : ' de todas as ligas') +
    ' · período ' + (dados && dados.periodo ? dados.periodo : 'ago26');

  /* AMOSTRA CURTA. A ficha inteira — barra, média, melhor, radar — e lida contra a coorte
     da posicao na liga do jogador. Em liga pequena essa coorte encolhe: das 724 combinacoes
     liga×posicao da base, 39 tem 20 jogadores ou menos e uma tem 4. Ai "acima da media" quer
     dizer "acima de outros seis", e um unico nome puxa o "melhor" da regua para onde quiser.
     O numero sempre esteve no rodape, mas em letra miuda, no pe, depois de toda a leitura —
     tarde demais para mudar a conclusao de quem ja leu. O aviso sobe para o topo, junto do
     seletor de com-quem-comparar, que e justamente o que resolve: trocar para Brasil A/B/C
     ou para todas as ligas devolve uma regua com gente suficiente. */
  const nCo = lista.length;
  const aviso = nCo >= 30 ? '' :
    '<span class="fi-amostra ' + (nCo < 12 ? 'grave' : '') + '"' +
    ' title="' + esc('Toda a leitura desta ficha (barra, média, melhor e radar) sai desta coorte. ' +
      'Com ' + nCo + ' jogador' + (nCo === 1 ? '' : 'es') + ', um nome sozinho move a média e o melhor. ' +
      'Troque o comparativo acima para Brasil A/B/C ou para todas as ligas.') + '">' +
    (nCo < 12 ? '⚠ amostra de ' + nCo : 'amostra curta · ' + nCo) + '</span>';

  return { titulo, sub, cabeca, corpo, rodape, aviso };
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
  const av = $('#fiAviso'); if (av) av.innerHTML = f.aviso;
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
      '<span class="sub">' + esc(f.sub) + '</span>' + f.aviso +
      '<button class="bt mini det-add">+ adicionar em ' + sig(posAtual) + '</button></div>' +
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
  { c: 'p',   r: 'Pos.',  w: 4,  cel: j => sig(j.p) },
  { c: 'id_', r: 'Idade', w: 4,  num: 1, cel: j => j.id_ ?? '—' },
  { c: 'min3', r: 'Minutos · 3 temp.', w: 9,
    t: 'Minutos das últimas três temporadas (Wyscout). Cada barra é um ano, cheia quando ' +
       'ele jogou uma temporada inteira; o número é a soma das três.',
    num: 1, cel: j => {
      const pk = primaryKey(j), r = histResumo(pk);
      if (!r) return '<span class="fc-vazia">–</span>';
      /* sem minutos do Wyscout, o que ha sao os jogos do oGol — dito com todas as
         letras, para ninguem ler o numero como minutagem */
      const numero = r.min
        ? '<b class="fc-min">' + milhar(r.min) + '</b>'
        : '<b class="fc-min jogos" title="sem minutos; o oGol dá jogos">' +
          milhar(r.jogos) + '<i>j</i></b>';
      return '<div class="fc-carr">' + barraMinutos(hist(pk)) + numero + '</div>'; } },
  { c: 'g3', r: 'Gols · assist.', w: 8,
    t: 'Gols e assistências nas últimas três temporadas. O selo mostra em quantas delas ' +
       'fez ' + GOLS_TEMPORADA + ' gols ou mais.',
    num: 1, cel: j => {
      const pk = primaryKey(j), r = histResumo(pk, GOLS_TEMPORADA);
      if (!r) return '<span class="fc-vazia">–</span>';
      return '<div class="fc-carr">' +
        '<b class="fc-gols' + (r.gols ? '' : ' zero') + '" title="gols">' + r.gols + '</b>' +
        '<span class="fc-ass' + (r.assist ? '' : ' zero') + '" title="assistências">' +
          r.assist + 'a</span>' +
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
  { c: '_', r: '', w: 11, cel: j => '<button class="fc-add" title="Escolher a posição — a dele é ' +
      esc(sig(j.p)) + '">levar p/ ' + sig(j.p) + ' ▾</button>' +
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
      '%;width:' + z.w + '%;height:' + z.h + '%" title="' + esc(nomePos(z.c)) + '">' + sig(z.c) + '</div>').join('') +
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
    !on.length ? 'Todas' : on.length === 1 ? nomePos(on[0].dataset.pos) : on.map(z => sig(z.dataset.pos)).join(' + ');
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
    ' · clique na linha para levar ao campograma, escolhendo a posição';

  $$('#fcTbody tr').forEach(tr => {
    const id = parseInt(tr.dataset.id);
    /* Mesmo menu da aba Fisico: a posicao do jogador vem marcada, mas da para mandar
       para outra sem ter que mover o card depois. Ancorado no que foi clicado — a
       linha inteira ou o botao. `fcRender` depois, para a linha ganhar a marca de
       "ja esta no elenco". */
    const levar = (e, ancora) => {
      const j = BASE.find(x => x.id === id);
      if (!j) return;
      menuLevar(e, primaryKey(j), fcRender, ancora);
    };
    /* a linha inteira abre o menu, ancorado na celula clicada (fica perto do ponteiro,
       em vez de na ponta esquerda de uma linha que ocupa a tela toda) */
    tr.onclick = e => levar(e, e.target.closest('td') || tr);
    tr.querySelector('.fc-add').onclick = e => levar(e);
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
   velocidade, volume, arranque e frenagem, giro); colunas sao jogadores. A regua de
   tudo e a coorte da posicao escolhida nas Series A e B: cada celula traz a barrinha
   do percentil do jogador nessa coorte (verde no topo, vermelho no fim) e o valor.
   Por padrao entram os 5 melhores de cada serie pelo indice fisico geral, mais as
   medias da Serie A e da Serie B. Quem quiser compara qualquer um da base (ou do
   campograma) contra essa regua. */
const FS_GRUPOS = [
  /* os dois picos primeiro, depois as duas medias de pico: pico de 3 jogos, pico de
     1 jogo, PSV-99 dos 5 melhores, PSV-99 por partida */
  { t: 'Velocidade', d: 'O teto: quão rápido chega.', m: [
    ['vmax3', 'Top 3 Peak Velocity',          'km/h',  2],
    ['vmax',  'Peak Velocity',                'km/h',  2],
    ['psv5',  'PSV-99, 5 melhores partidas',  'km/h',  2],
    ['psv',   'PSV-99 por partida',           'km/h',  2] ] },
  { t: 'Uso da velocidade', d: 'Quanto vai buscar essa faixa por 90 minutos.', m: [
    ['spr_km', 'Metros em sprint',            'm/90',  0],
    ['spr_n',  'Número de sprints',           'por 90', 1],
    ['hsr',    'Metros em corrida rápida',    'm/90',  0],
    ['hsr_n',  'Corridas rápidas',            'por 90', 1],
    ['hi',     'Metros em alta intensidade',  'm/90',  0],
    ['hi_n',   'Ações de alta intensidade',   'por 90', 1] ] },
  { t: 'Volume', d: 'Quanto terreno cobre numa partida inteira.', m: [
    ['dist',   'Distância percorrida',        'm/90',  0],
    ['mmin',   'Metros por minuto',           'm/min', 1],
    ['run',    'Distância em corrida',        'm/90',  0],
    ['acel_m', 'Acelerações médias',          'por 90', 1],
    ['desa_m', 'Desacelerações médias',       'por 90', 1] ] },
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
];
const FS_TODAS = FS_GRUPOS.flatMap(g => g.m);
const FS_CORES = ['#2f7fe0', '#e5562a', '#22a558', '#c9971a', '#8d5be0', '#d63e7c', '#1aa3a3', '#e07a1a', '#6aa628', '#5a6ce0',
                  '#b8412f', '#2f9c8a'];
/* Nao ha colunas vazias de reserva. Tinha duas, com um "+" cada, mas o clique nao
   podia preencher AQUELA coluna: a ordem das colunas e calculada (extras, depois os
   tops, depois o filtro), entao o jogador escolhido aparecia no comeco e a vaga
   continuava vazia — parecia quebrado. Um botao so, no canto, que leva ao campo de
   busca; a coluna entra na frente. */
const FS_VAGAS = 0;
const FS_ROTULO = 188;    /* largura da coluna dos rotulos das linhas */
const FS_COL_MIN = 92;    /* largura confortavel: o nome do jogador cabe inteiro */
/* Piso de verdade. Com dez jogadores mais as duas medias e as duas referencias, em tela
   de 1440px nao cabe todo mundo a 92px e o navegador desenhava a barra de rolagem
   horizontal. Espremer ate 70 e melhor do que rolar de lado: o nome corta com
   reticencias (esta inteiro no balao) e a matriz continua sendo lida de uma vez. */
const FS_COL_ABS = 70;
let fsPos = 'MEI';
let fsLigaLista = '';     /* campeonato escolhido para a lista por liga */
const TODOS_CAMP = '*';   /* opcao "todos os campeonatos" dessa mesma lista */

/* ---------------- resumo primeiro, detalhe ao clicar ----------------
   Vinte e cinco indicadores por quinze colunas sao quase quatrocentas celulas, quase
   todas marcadas — e quando tudo se destaca nada se destaca. A matriz abre com SEIS
   linhas: o indice geral e o de cada grupo. Clicar num grupo abre os indicadores dele.
   Nada se perdeu; o que mudou e quem decide o que aparece. O estado fica no navegador,
   entao a tela volta como voce deixou. */
/* ---------------- forma de ver ----------------
   'matriz' e a tabela de sempre. As outras tres vem de static/fs_visoes.js e recebem o
   pacote de fsPacote(). A escolha fica no navegador. */
let FS_VISAO = 'matriz';
try { FS_VISAO = localStorage.getItem('sc2027_fs_visao') || 'matriz'; } catch (e) {}
const FS_VISAO_ROT = { matriz: 'Matriz', mapa: 'Mapa', reguas: 'Réguas', tiras: 'Tiras' };
function fsTrocarVisao(v) {
  FS_VISAO = FS_VISAO_ROT[v] ? v : 'matriz';
  try { localStorage.setItem('sc2027_fs_visao', FS_VISAO); } catch (e) {}
  $$('#fsVisao button').forEach(b => b.classList.toggle('on', b.dataset.v === FS_VISAO));
  fsRender();
}

/* O pacote que os layouts alternativos leem. Mesmo formato do arquivo de propostas
   (dados-meia.json), so que montado ao vivo a partir da aba: a coorte da posicao nas
   Series A e B, os comparados (que podem vir de qualquer liga), as medias e as duas
   referencias, tudo com percentil e indice na regua de sempre. */
function fsPacote(co, colunas) {
  const grupos = FS_GRUPOS.map(g => ({ t: g.t, d: g.d,
    m: g.m.map(([k, rot, un, casas, menor]) => ({ k, rot, un, casas, menor: !!menor })) }));
  const ind = grupos.flatMap(g => g.m);
  const jogo = j => ({
    pk: primaryKey(j),
    n: j.n, t: j.t, l: j.l, idade: j.id_, nac: j.nac, ct: j.ct, sc_n: j.sc_n,
    idx: fsIndices(co, j),
    v: Object.fromEntries(ind.map(i => [i.k, typeof j[i.k] === 'number' ? j[i.k] : null])),
    p: Object.fromEntries(ind.map(i => [i.k, fsPct(co, i.k, j[i.k], i.menor)])),
  });
  /* populacao = coorte + comparados de fora dela, sem repetir */
  const vistos = new Set();
  const jogadores = [];
  co.lista.concat(colunas.map(c => c.j)).forEach(j => {
    const pk = primaryKey(j);
    if (vistos.has(pk)) return;
    vistos.add(pk);
    const x = jogo(j);
    if (x.idx.geral != null) jogadores.push(x);
  });
  jogadores.sort((a, b) => b.idx.geral - a.idx.geral);
  const refs = (RAIO && RAIO.refs && RAIO.refs[fsPos]) || {};
  const ref = g => (g && g.valores) ? {
    nomes: g.nomes, v: g.valores, idx: fsIndices(co, g.valores),
    p: Object.fromEntries(ind.map(i => [i.k, fsPct(co, i.k, g.valores[i.k], i.menor)])),
  } : null;
  const naCoorte = new Set(co.lista.map(primaryKey));
  return {
    pos: nomePos(fsPos), sig: sig(fsPos), n: co.lista.length,
    /* comparados de fora da coorte (outra liga): entram em `jogadores` mas nao sao
       populacao — os layouts contam "42 + 1 de fora", nao "43" */
    nFora: jogadores.filter(j => !naCoorte.has(j.pk)).length,
    grupos, indicadores: ind, jogadores,
    /* NOMES sao rotulo; a identidade e a chave. Casar destaque por nome destacava o
       homonimo errado (dois Vitinho, dois Juninho na mesma posicao). */
    destaque: colunas.map(c => c.j.n),
    destaquePks: colunas.map(c => primaryKey(c.j)),
    mediaA: co.A.m, mediaB: co.B.m,
    refBR: ref(refs.brasil), refMU: ref(refs.mundo),
  };
}

/* Tirar alguem nao pode chamar o proximo da fila. "Top 5 da Serie A" e uma receita que
   devolve 5 sempre: excluido um, o sexto entrava no lugar e a coluna parecia so ter
   trocado de nome. No primeiro x a lista da tela vira escolha explicita e as receitas
   se desligam; dai em diante tirar e tirar. Devolve se congelou, para o aviso. */
function fsTirar(pk) {
  const congelou = fsCongelar();
  fsExtras = fsExtras.filter(x => x !== pk);
  fsOcultos.add(pk);
  fsRender();
  return congelou;
}

/* O pacote da ultima forma desenhada: o balao e o clique nos pontos leem daqui. */
let FS_D = null;

/* Chips dos comparados, acima do palco. Nas formas alternativas o cabecalho da matriz
   (onde ficava o x de cada um) esta escondido — sem isto nao havia como tirar alguem. */
function fsChips(colunas) {
  const el = $('#fsChips');
  if (!el) return;
  el.innerHTML = colunas.length
    ? '<span class="fs-chips-rot">Na comparação</span>' + colunas.map(c => {
        const pk = primaryKey(c.j);
        return '<span class="fs-chip" data-pk="' + esc(pk) + '" title="' + esc(c.j.t + ' · ' + c.j.l) +
          '">' + raioIcone(pk) + esc(c.j.n) +
          '<b class="fs-chip-levar" title="Levar para o campograma — escolha a posição (dele: ' + esc(sig(c.j.p)) + ')">↗</b>' +
          '<b class="fs-chip-x" title="Tirar da comparação">×</b></span>';
      }).join('') + '<span class="fs-chips-dica">↗ leva para o campograma · clique num ponto cinza para trazer alguém</span>'
    : '<span class="fs-chips-dica">Ninguém na comparação — clique num ponto cinza ou use "Adicionar jogador".</span>';
  el.querySelectorAll('.fs-chip-x').forEach(x => {
    x.onclick = e => {
      e.stopPropagation();
      const congelou = fsTirar(x.parentElement.dataset.pk);
      if (congelou) toast('Comparação fixada nos que estavam na tela — agora tirar não chama o próximo da fila');
    };
  });
  el.querySelectorAll('.fs-chip-levar').forEach(b => {
    b.onclick = e => menuLevar(e, b.parentElement.dataset.pk);
  });
}

/* ---------------- foco: um jogador aberto no topo ----------------
   Clicar num jogador no grafico (qualquer das tres formas) faz tres coisas: traz para a
   comparacao se ainda nao esta, destaca o ponto dele no desenho e abre este painel
   ACIMA do grafico com a analise miuda — os cinco grupos contra as duas referencias e
   os 25 indicadores com valor, percentil e de quem ele passa. Fica aberto ate fechar
   ou clicar em outro; muda de posicao, fecha. */
let FS_FOCO_PK = null;
function fsFocar(pk) {
  FS_FOCO_PK = pk || null;
  fsFocoRender();
  fsMarcarFoco();
}
function fsMarcarFoco() {
  const palco = $('#fsPalco');
  if (!palco) return;
  palco.querySelectorAll('[data-pk].foco').forEach(e => e.classList.remove('foco'));
  if (FS_FOCO_PK) palco.querySelectorAll('[data-pk="' + CSS.escape(FS_FOCO_PK) + '"]')
    .forEach(e => e.classList.add('foco'));
}
function fsFocoRender() {
  const el = $('#fsFoco');
  if (!el) return;
  const j = FS_FOCO_PK && FS_D ? FS_D.jogadores.find(x => x.pk === FS_FOCO_PK) : null;
  if (!j) { el.hidden = true; el.innerHTML = ''; return; }
  const D = FS_D, BR = D.refBR, MU = D.refMU;
  const fmt = (v, c) => typeof v === 'number' ? v.toFixed(c).replace('.', ',') : '–';
  const acima = (v, r, menor) => typeof v === 'number' && typeof r === 'number' && (menor ? v < r : v > r);
  /* contagens gerais */
  let nBR = 0, nMU = 0, nTot = 0;
  D.indicadores.forEach(i => {
    const v = j.v[i.k]; if (typeof v !== 'number') return;
    nTot++;
    if (BR && acima(v, BR.v[i.k], i.menor)) nBR++;
    if (MU && acima(v, MU.v[i.k], i.menor)) nMU++;
  });
  /* grupos: indice do jogador e das referencias numa regua 0-100 */
  const grupos = D.grupos.map((g, gi) => {
    const ij = j.idx.grupos[gi], ib = BR ? BR.idx.grupos[gi] : null, im = MU ? MU.idx.grupos[gi] : null;
    let aB = 0, aM = 0, n = 0;
    g.m.forEach(i => { const v = j.v[i.k]; if (typeof v !== 'number') return; n++;
      if (BR && acima(v, BR.v[i.k], i.menor)) aB++; if (MU && acima(v, MU.v[i.k], i.menor)) aM++; });
    const marca = (x, cls, tit) => x == null ? '' : '<i class="' + cls + '" style="left:' + x + '%" title="' + esc(tit + ' ' + x) + '"></i>';
    return '<div class="fs-foco-g"><div class="fs-foco-g-cab"><b>' + esc(g.t) + '</b>' +
      '<span class="fs-foco-g-idx">' + (ij == null ? '–' : ij) + '</span>' +
      '<span class="fs-foco-g-cont"><em class="br">' + aB + '/' + n + '</em><em class="mu">' + aM + '/' + n + '</em></span></div>' +
      '<div class="fs-foco-regua">' + marca(ib, 'br', 'ref. Brasil') + marca(im, 'mu', 'ref. mundo') +
      (ij == null ? '' : '<b style="left:' + ij + '%"></b>') + '</div>' +
      '<div class="fs-foco-ind">' + g.m.map(i => {
        const v = j.v[i.k], p = j.p[i.k];
        const b = BR ? acima(v, BR.v[i.k], i.menor) : false, m = MU ? acima(v, MU.v[i.k], i.menor) : false;
        return '<div class="fs-foco-i' + (m ? ' mu' : b ? ' br' : '') + '" title="' + esc(i.rot + ' · ' + i.un +
            (BR ? ' · ref. Brasil ' + fmt(BR.v[i.k], i.casas) : '') + (MU ? ' · ref. mundo ' + fmt(MU.v[i.k], i.casas) : '') +
            (p != null ? ' · percentil ' + p : '')) + '">' +
          '<span class="r">' + esc(i.rot) + '</span><span class="v">' + fmt(v, i.casas) + '</span>' +
          '<span class="p">' + (p == null ? '' : 'p' + p) + '</span>' +
          '<span class="t"><i class="' + (m ? 'on' : '') + ' mu"></i><i class="' + (b ? 'on' : '') + ' br"></i></span></div>';
      }).join('') + '</div></div>';
  }).join('');
  const naComp = D.destaquePk.has(j.pk);
  el.innerHTML =
    '<div class="fs-foco-topo">' + raioIcone(j.pk) + '<b class="fs-foco-nome">' + esc(j.n) + '</b>' +
      '<span class="fs-foco-sub">' + esc(j.t) + ' · ' + esc(j.l) + (j.idade ? ' · ' + j.idade + 'a' : '') +
      (j.ct ? ' · até ' + esc(mesAnoCurto(j.ct)) : '') + (j.sc_n ? ' · ' + j.sc_n + ' jogos rastreados' : '') + '</span>' +
      '<span class="fs-foco-geral">índice <b>' + (j.idx.geral == null ? '–' : j.idx.geral) + '</b></span>' +
      '<span class="fs-foco-placar"><em class="br" title="indicadores acima da referência do Brasil">Brasil <b>' + nBR + '</b>/' + nTot + '</em>' +
      '<em class="mu" title="indicadores acima da referência do mundo">mundo <b>' + nMU + '</b>/' + nTot + '</em></span>' +
      (naComp ? '' : '<button class="fs-foco-bt" id="fsFocoAdd">+ comparar</button>') +
      '<button class="fs-foco-bt levar" id="fsFocoLevar" title="Levar para o campograma — escolha a posição">↗ campograma</button>' +
      '<button class="fs-foco-x" id="fsFocoX" title="Fechar">×</button></div>' +
    '<div class="fs-foco-grupos">' + grupos + '</div>';
  el.hidden = false;
  $('#fsFocoX').onclick = () => fsFocar(null);
  const add = $('#fsFocoAdd'); if (add) add.onclick = () => fsAdicionar(j.pk);
  $('#fsFocoLevar').onclick = e => menuLevar(e, j.pk);
}

/* Balao e clique, iguais nas tres formas. Os renderizadores marcam cada jogador com
   data-pk; daqui a gente resolve quem e, mostra o balao e, no clique, traz para a
   comparacao. Delegado no palco, entao vale para o que cada forma desenhar. */
function fsLigarPalco() {
  const palco = $('#fsPalco'), dica = $('#fsDica');
  if (!palco || !dica || palco.dataset.ligado) return;
  palco.dataset.ligado = '1';
  const acha = t => { const e = t && t.closest ? t.closest('[data-pk]') : null; return e && e.dataset.pk ? e : null; };
  const jog = pk => (FS_D && FS_D.jogadores.find(j => j.pk === pk)) || null;
  /* Dois baloes para o mesmo ponto e ruido: se o layout ja abriu o dele (as reguas e
     as tiras tem balao proprio, com o valor no ponto e a diferenca contra cada
     referencia), o generico fica quieto. O do layout abre antes — ele escuta no
     proprio elemento, este escuta no palco, e o evento sobe. */
  const balaoProprio = () => [...palco.querySelectorAll('[class*="-tip"], [class*="-dica"]')]
    .some(t => t.offsetParent !== null && getComputedStyle(t).display !== 'none' &&
               getComputedStyle(t).visibility !== 'hidden' && t.textContent.trim());
  /* O generico cede ao balao do layout SEMPRE que ele existir — nao importa quem abre
     primeiro. Desligar por forma nao servia: nas reguas so os nomes tem balao proprio,
     e os tracos da populacao ficavam mudos. Um observador no palco ve o balao do layout
     aparecer (no mousemove, depois deste mouseover) e esconde o generico na hora. */
  new MutationObserver(() => { if (!dica.hidden && balaoProprio()) dica.hidden = true; })
    .observe(palco, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class'] });
  /* fase de CAPTURA: as reguas chamam stopPropagation no hover do traco, e o listener
     de borbulha no palco nunca chegava a rodar — a populacao ficava muda */
  palco.addEventListener('mouseover', e => {
    const el = acha(e.target); if (!el) return;
    if (el.closest('[data-tirar]') || el.matches('.fs-chip')) return;   /* chips: sem balao */
    const j = jog(el.dataset.pk); if (!j) return;
    if (balaoProprio()) { dica.hidden = true; return; }
    const naComp = FS_D.destaquePk.has(j.pk);
    const gr = FS_D.grupos.map((g, i) => '<span>' + esc(g.t.split(' ')[0]) + ' <b>' +
      (j.idx.grupos[i] == null ? '–' : j.idx.grupos[i]) + '</b></span>').join('');
    dica.innerHTML = '<div class="fs-dica-nome">' + raioIcone(j.pk) + '<b>' + esc(j.n) + '</b>' +
      (naComp ? '' : '<i class="fs-dica-add">clique para comparar</i>') + '</div>' +
      '<div class="fs-dica-sub">' + esc(j.t) + ' · ' + esc(j.l) + (j.idade ? ' · ' + j.idade + 'a' : '') +
      (j.sc_n ? ' · ' + j.sc_n + ' jogos' : '') + '</div>' +
      '<div class="fs-dica-idx"><span>Índice <b>' + (j.idx.geral == null ? '–' : j.idx.geral) + '</b></span>' + gr + '</div>';
    dica.hidden = false;
  }, true);
  palco.addEventListener('mousemove', e => {
    if (dica.hidden) return;
    if (balaoProprio()) { dica.hidden = true; return; }   /* o do layout chegou depois: cede */
    const r = dica.offsetParent ? dica.offsetParent.getBoundingClientRect() : palco.getBoundingClientRect();
    let x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
    if (x + dica.offsetWidth > r.width - 8) x = e.clientX - r.left - dica.offsetWidth - 14;
    dica.style.left = Math.max(0, x) + 'px'; dica.style.top = y + 'px';
  });
  palco.addEventListener('mouseout', e => { if (!acha(e.relatedTarget)) dica.hidden = true; }, true);
  palco.addEventListener('click', e => {
    /* x para tirar da comparacao: os layouts emitem <b data-tirar="pk">×</b> nos chips
       dos comparados; o app resolve aqui, igual ao x da matriz */
    const x = e.target.closest ? e.target.closest('[data-tirar]') : null;
    if (x) {
      e.stopPropagation(); e.preventDefault();
      dica.hidden = true;
      if (FS_FOCO_PK === x.dataset.tirar) FS_FOCO_PK = null;
      const congelou = fsTirar(x.dataset.tirar);
      if (congelou) toast('Comparação fixada nos que estavam na tela — agora tirar não chama o próximo da fila');
      return;
    }
    const el = acha(e.target); if (!el) return;
    const pk = el.dataset.pk;
    dica.hidden = true;
    FS_FOCO_PK = pk;
    if (FS_D && FS_D.destaquePk.has(pk)) { fsFocar(pk); return; }   /* ja comparado: so abre */
    fsAdicionar(pk);                                                 /* redesenha e o foco vem junto */
  }, true);
}

/* Desenha a forma escolhida. A matriz ja foi montada (e o que alimenta a contagem do
   rodape e os botoes das colunas); aqui so se decide o que fica visivel. */
function fsDesenharVisao(co, colunas) {
  const tab = $('#fsMatriz'), palco = $('#fsPalco'), chips = $('#fsChips');
  if (!palco) return;
  const alt = FS_VISAO !== 'matriz' && window.FS_VISOES && FS_VISOES[FS_VISAO];
  tab.style.display = alt ? 'none' : '';
  palco.hidden = !alt;
  if (chips) chips.hidden = !alt;
  palco.className = 'fs-palco' + (alt ? ' fs-vis-' + FS_VISAO : '');
  const dica = $('#fsDica'); if (dica) dica.hidden = true;
  const foco = $('#fsFoco'); if (foco) foco.hidden = true;
  if (!alt) return;
  fsChips(colunas);
  fsLigarPalco();
  if (!RAIO) {
    /* o raio_ref.json chega logo depois da base; sem ele nao ha referencia. A mensagem
       de "goleiro" aqui seria mentira — e o aviso some sozinho: iniciar() redesenha a
       aba quando o arquivo chega. */
    palco.innerHTML = '<div class="fs-palco-aviso">' + (RAIO_FALHOU
      ? 'As referências físicas (dados/raio_ref.json) não carregaram — sem elas esta forma de ver não existe. Use a Matriz.'
      : 'Carregando as referências físicas…') + '</div>';
    return;
  }
  const D = fsPacote(co, colunas);
  D.destaquePk = new Set(D.destaquePks);
  FS_D = D;
  if (!D.refBR || !D.refMU) {
    palco.innerHTML = '<div class="fs-palco-aviso">Sem referência física para ' +
      esc(nomePos(fsPos).toLowerCase()) + ' — a régua do raio é de jogador de linha. ' +
      'Esta forma de ver precisa das duas referências; use a Matriz.</div>';
    return;
  }
  try { FS_VISOES[FS_VISAO](D, palco); fsMarcarFoco(); fsFocoRender(); }
  catch (e) {
    console.error('visão ' + FS_VISAO + ' quebrou:', e);
    palco.innerHTML = '<div class="fs-palco-aviso">Esta forma de ver quebrou ao desenhar: ' +
      esc(String(e)) + '</div>';
  }
}

let FS_ABERTOS = new Set();
const CHAVE_FS_ABERTOS = 'sc2027_fs_abertos';
try {
  const g = JSON.parse(localStorage.getItem(CHAVE_FS_ABERTOS));
  if (Array.isArray(g)) FS_ABERTOS = new Set(g);
} catch (e) {}
function fsAlternarGrupo(id) {
  if (FS_ABERTOS.has(id)) FS_ABERTOS.delete(id); else FS_ABERTOS.add(id);
  try { localStorage.setItem(CHAVE_FS_ABERTOS, JSON.stringify([...FS_ABERTOS])); } catch (e) {}
  fsRender();
}
function fsChip(v, tit) {
  if (v == null) return '<td></td>';
  return '<td><span class="fs-idx ' + (v >= 67 ? 'a' : v >= 40 ? 'm' : 'b') +
    '" title="' + esc(tit || 'Índice: média dos percentis na posição') + '">' + v + '</span></td>';
}

/* Bandeira por campeonato: a liga vem como "Argentina A", "Brasil B", "Espanha C" —
   o pais e o prefixo. Serve so para o olho achar o campeonato mais rapido numa lista
   de cinquenta. */
const BANDEIRA = {
  Brasil:'🇧🇷', Argentina:'🇦🇷', Uruguai:'🇺🇾', Paraguai:'🇵🇾', Chile:'🇨🇱', Bolivia:'🇧🇴',
  Peru:'🇵🇪', Equador:'🇪🇨', Colombia:'🇨🇴', Venezuela:'🇻🇪',
  Portugal:'🇵🇹', Espanha:'🇪🇸', Italia:'🇮🇹', Inglaterra:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', Alemanha:'🇩🇪', França:'🇫🇷',
  Holanda:'🇳🇱', Belgica:'🇧🇪', Suiça:'🇨🇭', Austria:'🇦🇹', Grecia:'🇬🇷', Polonia:'🇵🇱',
  Tcheca:'🇨🇿', Croacia:'🇭🇷', Servia:'🇷🇸', Romenia:'🇷🇴', Bulgaria:'🇧🇬', Hungria:'🇭🇺',
  Eslovaquia:'🇸🇰', Dinamarca:'🇩🇰', Noruega:'🇳🇴', Suecia:'🇸🇪', Escocia:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', Turquia:'🇹🇷',
  Ucrania:'🇺🇦', Russia:'🇷🇺', EUA:'🇺🇸', Mexico:'🇲🇽', Japao:'🇯🇵', Coreia:'🇰🇷', China:'🇨🇳',
  Israel:'🇮🇱', Marrocos:'🇲🇦', Catar:'🇶🇦', Emirados:'🇦🇪', Bahrain:'🇧🇭',
  'Arabia Saudita':'🇸🇦',
};
function bandeira(liga) {
  const nome = String(liga || '');
  const chave = Object.keys(BANDEIRA).find(k => nome.startsWith(k));
  return chave ? BANDEIRA[chave] + ' ' : '';
}
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
/* A COR do preenchimento e a MESMA pergunta do contorno: em que nivel o jogador joga
   contra as medias das duas series. Antes era a faixa de percentil, e a celula dizia
   duas coisas ao mesmo tempo — o Bruninho batia as duas medias (contorno azul) com a
   barra cinza, porque estava no percentil 73 e o verde comecava em 75. O COMPRIMENTO da
   barra continua sendo o percentil: quanto ele vale dentro da posicao. */
/* O PREENCHIMENTO da barra do jogador volta a ser verde/ambar contra as medias da liga:
   bonina e roxo sao as cores das COLUNAS de referencia, e usa-las tambem no miolo das
   celulas dos jogadores fazia a matriz inteira parecer bonina e roxa — nao dava para
   achar as colunas de referencia no meio. O CONTORNO segue com os quatro niveis. */
function fsCorBarra(v, mA, mB, menor) {
  if (typeof v !== 'number' || isNaN(v) ||
      typeof mA !== 'number' || typeof mB !== 'number') return '';
  const forte = menor ? Math.min(mA, mB) : Math.max(mA, mB);
  const fraca = menor ? Math.max(mA, mB) : Math.min(mA, mB);
  if (melhorQue(v, forte, menor)) return ' cor-duas';
  if (melhorQue(v, fraca, menor)) return ' cor-uma';
  return '';
}

/* Melhor e maior, MENOS nos tempos (`menor`), onde melhor e menor. Toda comparacao
   com media tem de passar por aqui — foi errando isso que o estudo quase disse que a
   serie mais lenta era a melhor. */
function melhorQue(v, m, menor) { return menor ? v < m : v > m; }

/* Contorno da celula: verde quando o jogador bate as DUAS medias (Serie A e B), ambar
   quando bate so a mais fraca das duas. E a pergunta que se faz montando elenco —
   "ele joga em que nivel?" — respondida sem precisar comparar numero a numero. */
/* Nivel contra as MEDIAS da liga — decide a cor do preenchimento da barra. */
function fsGanho(v, mA, mB, menor) {
  if (typeof v !== 'number' || isNaN(v) || typeof mA !== 'number' || typeof mB !== 'number') return '';
  const forte = menor ? Math.min(mA, mB) : Math.max(mA, mB);
  const fraca = menor ? Math.max(mA, mB) : Math.min(mA, mB);
  if (melhorQue(v, forte, menor)) return ' bate-duas';
  if (melhorQue(v, fraca, menor)) return ' bate-uma';
  return '';
}

/* Contra as REFERENCIAS: duas perguntas INDEPENDENTES, nao uma escada.
   A versao anterior contornava a celula inteira com a cor do nivel mais alto — e como
   quase todo mundo bate alguma coisa, quase toda celula ficava com moldura e nada
   sobressaia. Pior: quem batia o mundo mostrava so roxo, e nao dava para ver que
   tambem tinha batido o Brasil.
   Agora e uma tarja fina na BORDA ESQUERDA da celula, partida ao meio: metade de cima
   roxa quando esta acima da referencia do mundo, metade de baixo bonina quando esta
   acima da referencia do Brasil. As duas acendem juntas quando as duas foram batidas, a
   celula que nao bate nada fica limpa, e o custo de espaco e zero. */
function fsMarcaRef(v, menor, rBR, rMU) {
  if (typeof v !== 'number' || isNaN(v)) return { cls: '', nota: '' };
  const br = typeof rBR === 'number' && melhorQue(v, rBR, menor);
  const mu = typeof rMU === 'number' && melhorQue(v, rMU, menor);
  return {
    cls: (br ? ' acima-br' : '') + (mu ? ' acima-mu' : ''),
    nota: br && mu ? ' · ACIMA das duas referências (Brasil e mundo)'
        : mu ? ' · acima da referência do mundo'
        : br ? ' · acima da referência do Brasil' : '',
  };
}

/* ---------- a barra: uma escala so para a linha inteira ----------
   Duas tentativas antes desta, as duas ruins por motivos opostos:
   1) PERCENTIL na coorte — satura. Qualquer valor acima do melhor brasileiro virava
      100%, e a Ref. Mundo (quase sempre fora da faixa daqui) ficava do tamanho de um
      jogador bom qualquer.
   2) PROPORCIONAL AO MAIOR (v ÷ máx) — nao discrimina. Velocidade de pico vai de 31 a
      33 km/h: todas as barras davam 95%, porque a escala comecava no zero e o zero nao
      diz nada aqui.
   A que vale: a linha define o seu proprio intervalo (do pior ao melhor entre TUDO que
   ela desenha — medias, referencias e jogadores) e a barra e a posicao dentro dele. Nos
   tempos (`menor`) a leitura inverte. Um piso de 8% garante que o ultimo ainda apareca.
   O percentil na coorte nao se perdeu: segue no balao de cada celula. */
let FS_ESCALA = null;   /* { max, min } da linha que esta sendo desenhada */
function fsLarg(v, menor) {
  const e = FS_ESCALA;
  if (!e || typeof v !== 'number' || isNaN(v)) return 8;
  const faixa = e.max - e.min;
  if (!(faixa > 0)) return 100;
  const r = menor ? (e.max - v) / faixa : (v - e.min) / faixa;
  return 8 + Math.max(0, Math.min(1, r)) * 92;
}

function fsCelula(co, k, v, casas, menor, lider, tit, mA, mB, rBR, rMU) {
  if (typeof v !== 'number' || isNaN(v)) return '<td class="fs-c vazio"><div class="fs-cl"><span class="v">–</span></div></td>';
  const p = fsPct(co, k, v, menor);
  const cor = fsCorBarra(v, mA, mB, menor);
  const mk = fsMarcaRef(v, menor, rBR, rMU);
  const nota = (cor === ' cor-duas' ? ' · acima das médias da Série A e da B'
              : cor === ' cor-uma' ? ' · acima da média mais fraca das duas'
              : ' · abaixo das duas médias') + mk.nota;
  return '<td class="fs-c' + cor + mk.cls +
    (lider ? ' lider' : '') + '" title="' + esc(tit) +
    (p != null ? ' · percentil ' + p : '') + nota + '"><div class="fs-cl">' +
    '<i class="fs-bar"><b style="width:' + fsLarg(v, menor).toFixed(1) + '%"></b></i>' +
    '<span class="v">' + fsFmt(v, casas) + '</span></div></td>';
}


/* Celula de media, agora na frente da matriz. `venc` marca qual das duas ganha. */
function fsCelulaMedia(co, k, v, casas, menor, venc) {
  if (typeof v !== 'number' || isNaN(v))
    return '<td class="fs-c media vazio"><div class="fs-cl"><span class="v">–</span></div></td>';
  const p = fsPct(co, k, v, menor);
  return '<td class="fs-c media' + (venc ? ' venceu' : '') + '" title="' +
    esc(fsFmt(v, casas) + (p != null ? ' · percentil ' + p + ' na posição' : '')) +
    '"><div class="fs-cl">' +
    '<i class="fs-bar"><b style="width:' + fsLarg(v, menor).toFixed(1) + '%"></b></i>' +
    '<span class="v">' + fsFmt(v, casas) + '</span></div></td>';
}
function fsQuemGanha(mA, mB, menor) {
  if (typeof mA !== 'number' || typeof mB !== 'number' || mA === mB)
    return '<td class="fs-ganha"><span class="e">=</span></td>';
  const a = melhorQue(mA, mB, menor);
  return '<td class="fs-ganha"><span class="' + (a ? 'a' : 'b') + '" title="Série ' +
    (a ? 'A' : 'B') + ' leva vantagem neste indicador">' + (a ? 'A' : 'B') + '</span></td>';
}

/* Fim de contrato na coluna, com bolinha para quem vence ate dezembro de 2026 —
   sao esses que dao para levar sem pagar clube nenhum, e e a primeira coisa que se
   procura ao montar elenco. */
/* Janeiro de 2027 e nao dezembro de 2026: a Serie B de 2027 comeca em abril, entao
   quem vence em janeiro esta tao livre quanto quem vence em dezembro. Uma data so,
   valendo para a bolinha da coluna e para o selo das listas. */
const FS_LIVRE_ATE = '2027-01';
function fsLivre(j) { return !!j.ct && j.ct.slice(0, 7) <= FS_LIVRE_ATE; }
/* `curto` e a versao de UMA linha, para o cabecalho da matriz: vira <span>, mes/ano
   abreviado e sem a bolinha — o verde cheio ja e a marca. */
function fsContrato(j, curto) {
  if (!j.ct) {
    return curto ? '<span class="fs-ct sem" title="contrato não informado">sem</span>'
                 : '<div class="fs-ct sem" title="contrato não informado">sem contrato</div>';
  }
  const livre = fsLivre(j);
  const tit = 'contrato até ' + j.ct + (livre ? ' — vence a tempo da temporada 2027' : '');
  if (curto) {
    return '<span class="fs-ct' + (livre ? ' livre' : '') + '" title="' + esc(tit) + '">' +
      esc(mesAnoCurto(j.ct)) + '</span>';
  }
  return '<div class="fs-ct' + (livre ? ' livre' : '') + '" title="' + esc(tit) + '">' +
    (livre ? '<i></i>' : '') + esc(mesAno(j.ct) || '—') + '</div>';
}

function fsCabecalho(c) {
  const j = c.j;
  /* De que serie ele e: e a informacao que o olho precisa achar primeiro numa matriz
     com dez colunas misturadas. Vai em dois lugares — o selo ao lado do indice e a
     tarja no topo da coluna, que atravessa a largura toda. */
  const serie = j.l === 'Brasil A' ? 'a' : j.l === 'Brasil B' ? 'b' : 'x';
  const rotSerie = j.l === 'Brasil A' ? 'Série A' : j.l === 'Brasil B' ? 'Série B' : j.l;
  const tag = '<span class="fs-serie ' + serie + '" title="' + esc(j.l) +
    (c.tipo === 'A' || c.tipo === 'B'
      ? ' · um dos 5 melhores da série pelo índice físico'
      : c.tipo === 'filtro' ? ' · veio do filtro' : '') + '">' +
    (c.tipo === 'A' || c.tipo === 'B' ? '★ ' : '') + esc(rotSerie) + '</span>';
  /* Clube, liga e amostra saem do cabecalho e vao para o balao: com dez colunas,
     quatro linhas de texto por coluna empurravam a matriz inteira para fora da tela. */
  const ficha = [j.t, j.l + (j.p !== fsPos ? ' · ' + sig(j.p) : ''),
                 j.sc_n ? j.sc_n + ' jogos rastreados · ' + fsFmt(j.sc_min, 0) + ' min por jogo' : '']
                .filter(Boolean).join(' · ');
  return '<th class="fs-col serie-' + serie + '" style="--cor:' + c.cor + '" data-pk="' +
    esc(primaryKey(j)) + '" data-id="' + j.id + '"' +
    ' title="' + esc(j.n + ' — ' + ficha) + '">' +
    '<div class="fs-nome">' + raioIcone(primaryKey(j)) + '<b>' + esc(j.n) + '</b>' +
      (ehEstrangeiroBase(j) ? ' <span class="selo-ex">' + esc(sigla(j.nac)) + '</span>' : '') + '</div>' +
    /* clube, idade e contrato numa LINHA so: em coluna de 130px cada um tomava uma
       linha propria e o cabecalho comia meia tela. O clube corta com reticencias (o
       nome inteiro esta no balao do <th>); idade e contrato nunca cortam. */
    '<div class="fs-meta"><span class="fs-clube">' + esc(j.t) + '</span>' +
      (j.id_ ? '<b class="fs-idade">' + j.id_ + 'a</b>' : '') +
      fsContrato(j, true) + '</div>' +
    '<div class="fs-idx-linha">' +
      (c.idx.geral != null ? '<span class="fs-idx ' + (c.idx.geral >= 67 ? 'a' : c.idx.geral >= 40 ? 'm' : 'b') +
        '" title="Índice físico geral: média dos cinco grupos">' + c.idx.geral + '</span>' : '') +
      tag + '</div>' +
    '<div class="fs-hd-bts">' +
      '<button class="fs-ficha" title="Ver a ficha">+</button>' +
      '<button class="fs-levar" title="Levar para o campograma — escolha a posição (dele: ' + esc(sig(j.p)) + ')">↗</button>' +
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
    val: h => (h && h[i] && h[i].fonte !== 'ogol' ? (h[i].min || 0) : null),
    nota: h => (!h || !h[i] ? 'sem dado'
                : h[i].fonte === 'ogol'
                  ? (h[i].j || 0) + ' jogos pelo oGol, que não tem minutos · ' + (h[i].tm || '')
                  : (h[i].j || 0) + ' jogos · ' + h[i].tm + ' · ' + h[i].l),
  }));
  linhas.push({ id: 'min3', rot: 'Minutos nas três', un: 'soma', casas: 0, forte: 1,
                ref: MIN_TEMPORADA * 3, val: soma('min') });
  T.forEach((ano, i) => linhas.push({
    id: 'g' + i, rot: 'Gols ' + ano, un: 'gols', casas: 0,
    val: h => (h && h[i] ? (h[i].g || 0) : null),
    nota: h => (h && h[i] ? (h[i].a || 0) + ' assistências · ' + h[i].l : 'sem dado'),
  }));
  linhas.push({ id: 'g3', rot: 'Gols nas três', un: 'soma', casas: 0, forte: 1, val: soma('g') });
  T.forEach((ano, i) => linhas.push({
    id: 'a' + i, rot: 'Assistências ' + ano, un: 'assistências', casas: 0,
    val: h => (h && h[i] ? (h[i].a || 0) : null),
  }));
  linhas.push({ id: 'a3', rot: 'Assistências nas três', un: 'soma', casas: 0, forte: 1, val: soma('a') });
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

/* Materializa quem esta na tela como escolha explicita e desliga o que traria gente
   nova. Devolve true se realmente havia alguma receita ligada. */
function fsCongelar() {
  const automatico = $('#fsTopA').checked || $('#fsTopB').checked ||
                     (parseInt($('#fsTopFiltro').value) || 0) > 0;
  if (!automatico) return false;
  fsExtras = $$('#fsMatriz th.fs-col').map(th => th.dataset.pk);
  $('#fsTopA').checked = false;
  $('#fsTopB').checked = false;
  $('#fsTopFiltro').value = 0;
  return true;
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
  /* os melhores do que o filtro deixou passar — e por aqui que entram jogadores de
     qualquer liga, lidos na mesma regua das Series A e B */
  const quantosFiltro = parseInt($('#fsTopFiltro').value) || 0;
  const pool = fsPool();
  if (quantosFiltro) {
    const jaTem = new Set(colunas.map(c => primaryKey(c.j)));
    pool.filter(j => !jaTem.has(primaryKey(j)) && !fsOcultos.has(primaryKey(j)))
      .map(j => ({ j, idx: fsIndices(co, j) }))
      .filter(x => x.idx.geral != null)
      .sort((a, b) => b.idx.geral - a.idx.geral)
      .slice(0, quantosFiltro)
      .forEach(x => colunas.push({ j: x.j, tipo: 'filtro' }));
  }
  colunas.forEach((c, i) => { c.idx = fsIndices(co, c.j); c.cor = FS_CORES[i % FS_CORES.length];
                              c.h = hist(primaryKey(c.j)); });
  const medias = $('#fsMedias').checked
    ? [{ rot: 'Média Série A', d: co.A }, { rot: 'Média Série B', d: co.B }] : [];
  /* As duas MEDIAS DE REFERENCIA da posicao: Brasil (lista curada) e Mundo (elite
     mundial). Sao a barra — e e contra a do BRASIL que o raio julga. Media de grupo, e
     nao um jogador so: com um unico nome a regua virava refem do outlier. */
  const refPos = (RAIO && RAIO.refs && RAIO.refs[fsPos]) || {};
  const refCols = ($('#fsRefs') && $('#fsRefs').checked ? [
    { k: 'brasil', rot: 'Ref. Brasil', cls: 'ref-br', d: refPos.brasil },
    { k: 'mundo',  rot: 'Ref. Mundo',  cls: 'ref-mu', d: refPos.mundo },
  ] : []).filter(r => r.d && r.d.valores);
  const refVazio = '<td class="fs-c media ref vazio"><div class="fs-cl"><span class="v">–</span></div></td>';
  const refTdVazio = refCols.map(() => refVazio).join('');
  const refTd = (k, casas, menor) => refCols.map(r => {
    const v = r.d.valores[k];
    if (typeof v !== 'number') return refVazio;
    const p = fsPct(co, k, v, menor);
    return '<td class="fs-c media ref ' + r.cls + '" title="' + esc(r.rot + ': ' +
      fsFmt(v, casas) + (p != null ? ' · percentil ' + p + ' na posição' : '') +
      ' — média de ' + r.d.n + ': ' + r.d.nomes.join(', ')) +
      '"><div class="fs-cl"><i class="fs-bar"><b style="width:' +
      fsLarg(v, menor).toFixed(1) + '%"></b></i>' +
      '<span class="v">' + fsFmt(v, casas) + '</span></div></td>';
  }).join('');
  /* colunas vazias no fim: dao onde encaixar mais um jogador sem ter que caçar o
     campo de busca la em cima */
  const vagas = Array.from({ length: FS_VAGAS });
  const tdVagas = vagas.map(() => '<td class="fs-vaga-c"></td>').join('');

  let h = '<thead><tr><th class="fs-canto"><span>' + esc(nomePos(fsPos)) + '</span>' +
    '<small>' + co.lista.length + ' com tracking na Série A + B' +
    (fsMinJogos() ? ' (≥ ' + fsMinJogos() + ' jogos)' : '') + '</small>' +
    '<button class="fs-add-bt" title="Escolher um jogador para entrar na comparação">' +
      '+ adicionar jogador</button></th>' +
    /* "Média A" em vez de "Média Série A": em coluna de 90px o nome inteiro, em caixa
       alta e com letter-spacing, cortava no "SÉRIE" e a serie sumia — justamente a
       informacao. A serie vai para a linha de baixo, junto da amostra. */
    medias.map(m => {
      const serie = m.rot.replace('Média ', '');          /* 'Série A' */
      return '<th class="fs-media ' + (serie.endsWith('A') ? 'sa' : 'sb') +
        '" title="Média dos ' + m.d.n + ' ' + esc(nomePos(fsPos)) +
        (m.d.n === 1 ? '' : 's') + ' da ' + esc(serie) + ' que entram na régua">' +
        '<b>Média ' + esc(serie.slice(-1)) + '</b><small>' + esc(serie) + '<br>' + m.d.n + ' na régua</small></th>';
    }).join('') +
    (medias.length === 2 ? '<th class="fs-ganha-cab" title="Qual das duas séries leva ' +
      'vantagem no indicador">ganha</th>' : '') +
    refCols.map(r => '<th class="fs-media ' + r.cls + '" title="' + esc(r.rot +
      ' — média de ' + r.d.n + ' jogadores referência: ' + r.d.nomes.join(', ')) +
      '"><b>' + esc(r.rot) + '</b><small>' + r.d.n + (r.d.n === 1 ? ' jogador' : ' jogadores') +
      '</small></th>').join('') +
    colunas.map(fsCabecalho).join('') +
    vagas.map(() => '<th class="fs-vaga" title="Clique para escolher um jogador">' +
      '<button class="fs-vaga-bt">+</button><small>adicionar</small></th>').join('') +
    '</tr></thead>';

  let b = '<tbody>';

  /* bloco das temporadas: vem antes do fisico porque e o retrato de carreira —
     quanto jogou e quanto produziu — que contextualiza todo o resto */
  const linhasT = fsLinhasTemporada();
  if (linhasT.length && Object.keys(HIST.jogadores).length) {
    const mt = fsMediasTemporada(co, linhasT);
    const comHist = colunas.filter(c => c.h).length;
    /* fechado, o bloco mostra o numero que resume os tres anos: minutos somados. E o
       que se procura primeiro num jogador — quanto ele joga — e evita uma linha de
       resumo vazia so por causa do triangulo. */
    const lMin3 = linhasT.find(l => l.id === 'min3');
    const abertoT = FS_ABERTOS.has('t');
    const resumoT = c => {
      if (!c.h) return '<td><span class="fs-sem">sem histórico</span></td>';
      const v = lMin3 ? lMin3.val(c.h) : null;
      return '<td>' + (v == null ? '' : '<span class="fs-min3" title="minutos somados nas ' +
        'três temporadas">' + milhar(v) + '</span>') + '</td>';
    };
    b += '<tr class="fs-grupo abrivel' + (abertoT ? ' aberto' : '') + '" data-g="t"' +
      ' title="Minutagem, gols e bola parada do Wyscout nas temporadas ' +
      (HIST.temporadas || []).join(', ') + '"><td><i class="fs-seta">▸</i>' +
      '<b>Temporadas</b><span>' + (abertoT ? 'Wyscout · ' + (HIST.temporadas[0] || '') + '–' +
      (HIST.temporadas[HIST.temporadas.length - 1] || '') : 'minutos nas três') + '</span></td>' +
      medias.map(m => '<td>' + (lMin3 && mt.todos ? '' : '') + '</td>').join('') +
      (medias.length === 2 ? '<td></td>' : '') +
      refCols.map(() => '<td></td>').join('') +
      colunas.map(resumoT).join('') + tdVagas + '</tr>';
    if (abertoT) linhasT.forEach(l => {
      const vals = colunas.map(c => l.val(c.h));
      const validos = vals.filter(v => v != null);
      const melhor = validos.length ? Math.max.apply(null, validos) : null;
      const alvo = Math.max(l.ref || 0, melhor || 0, 0.0001);
      const med = mt.todos[l.id];
      const mA = mt.A[l.id], mB = mt.B[l.id];
      const medTd = medias.map(m => {
        const v = (m.rot.endsWith('A') ? mt.A : mt.B)[l.id];
        if (v == null) return '<td class="fs-c media vazio"><div class="fs-cl"><span class="v">–</span></div></td>';
        const venc = medias.length === 2 && mA != null && mB != null && mA !== mB &&
                     ((m.rot.endsWith('A')) === (mA > mB));
        return '<td class="fs-c media' + (venc ? ' venceu' : '') + '"><div class="fs-cl">' +
          '<i class="fs-bar"><b style="width:' +
            Math.max(2, Math.min(100, v / alvo * 100)).toFixed(0) + '%"></b></i>' +
          '<span class="v">' +
          (l.casas ? fsFmt(v, l.casas) : milhar(Math.round(v))) + '</span></div></td>';
      }).join('') + (medias.length === 2 ? fsQuemGanha(mA, mB, false) : '') + refTdVazio;

      b += '<tr' + (l.forte ? ' class="fs-soma"' : '') + '><td class="fs-rot" title="' +
        esc(l.rot + ' · ' + l.un) + '">' + esc(l.rot) +
        '<small>' + esc(l.un) + '</small></td>' + medTd +
        colunas.map((c, i) => {
          const v = vals[i];
          if (v == null) return '<td class="fs-c vazio"><div class="fs-cl"><span class="v">–</span></div></td>';
          const lider = melhor != null && v === melhor && validos.length > 1 && v > 0;
          const ganho = '';   /* temporadas nao tem referencia: so a cor da barra */
          const tit = l.rot + ': ' + fsFmt(v, l.casas) +
            (med != null ? ' · média da coorte ' + fsFmt(med, l.casas) : '') +
            (l.nota ? ' · ' + l.nota(c.h) : '');
          return '<td class="fs-c' + ganho + fsCorBarra(v, mA, mB, false) +
            (lider ? ' lider' : '') + '" title="' + esc(tit) +
            '"><div class="fs-cl">' +
            '<i class="fs-bar"><b style="width:' +
              Math.max(2, Math.min(100, v / alvo * 100)).toFixed(0) + '%"></b></i>' +
            '<span class="v">' + (l.casas ? fsFmt(v, l.casas) : milhar(v)) + '</span></div></td>';
        }).join('') + tdVagas + '</tr>';
    });
    if (abertoT && comHist < colunas.length) {
      b += '<tr class="fs-aviso"><td colspan="' + (2 + colunas.length + vagas.length + medias.length + refCols.length) + '">' +
        (colunas.length - comHist) + ' de ' + colunas.length + ' sem histórico do Wyscout: ' +
        'o cruzamento entre temporadas é por nome e idade, e nomes ambíguos ficam de fora ' +
        'em vez de mostrar a temporada de outra pessoa.</td></tr>';
    }
  }

  /* Medias e referencias tambem tem indice: sao mapas indicador->valor, que e
     exatamente o que fsIndices() le. Sem isso a linha de resumo falaria so dos jogadores
     e nao daria contra o que comparar. */
  const idxDe = obj => (obj ? fsIndices(co, obj) : null);
  const idxMedias = medias.map(m => idxDe(m.d.m));
  const idxRefs = refCols.map(r => idxDe(r.d.valores));
  const linhaResumo = (rot, sub, pegar, id, nota) => {
    const aberto = id != null && FS_ABERTOS.has(id);
    const tit = (obj, base) => rot + ': ' + (base == null ? '—' : base) +
      ' (média dos percentis na posição)' + (nota ? nota(obj) : '');
    return '<tr class="fs-grupo' + (id != null ? ' abrivel' : ' geral') +
      (aberto ? ' aberto' : '') + '"' + (id != null ? ' data-g="' + esc(id) + '"' : '') +
      '><td title="' + esc(rot + (sub ? ' — ' + sub : '') +
        (id != null ? ' · clique para abrir os indicadores' : '')) + '">' +
      (id != null ? '<i class="fs-seta">▸</i>' : '') +
      '<b>' + esc(rot) + '</b>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</td>' +
      idxMedias.map((x, i) => fsChip(pegar(x), tit(medias[i].d.m, pegar(x)))).join('') +
      (medias.length === 2 ? '<td></td>' : '') +
      idxRefs.map((x, i) => fsChip(pegar(x), tit(refCols[i].d.valores, pegar(x)))).join('') +
      colunas.map(c => fsChip(pegar(c.idx), tit(c.j, pegar(c.idx)))).join('') +
      tdVagas + '</tr>';
  };

  /* Em quantos indicadores do grupo o jogador passa de cada referencia. E a mesma
     pergunta da tarja, respondida no nivel do grupo — sem abrir, ja da para ver quem
     bate a referencia em quatro de seis e quem bate em um. */
  const contaRef = (obj, ms) => {
    if (!obj) return null;
    let br = 0, mu = 0, n = 0;
    ms.forEach(([k, , , , menor]) => {
      const v = obj[k];
      if (typeof v !== 'number' || isNaN(v)) return;
      n++;
      const rb = refPos.brasil && refPos.brasil.valores[k];
      const rm = refPos.mundo && refPos.mundo.valores[k];
      if (typeof rb === 'number' && melhorQue(v, rb, menor)) br++;
      if (typeof rm === 'number' && melhorQue(v, rm, menor)) mu++;
    });
    return n ? { br, mu, n } : null;
  };
  const notaRef = c => {
    if (!c) return '';
    return ' · passa da ref. Brasil em ' + c.br + ' de ' + c.n +
           ' e da ref. mundo em ' + c.mu + ' de ' + c.n;
  };

  b += linhaResumo('Índice físico geral', 'média dos cinco grupos', x => x && x.geral, null,
                   o => notaRef(contaRef(o, FS_TODAS)));

  FS_GRUPOS.forEach((g, gi) => {
    b += linhaResumo(g.t, g.d, x => x && x.grupos[gi], 'g' + gi,
                     o => notaRef(contaRef(o, g.m)));
    if (!FS_ABERTOS.has('g' + gi)) return;
    g.m.forEach(([k, rot, un, casas, menor]) => {
      const vals = colunas.map(c => (typeof c.j[k] === 'number' ? c.j[k] : null));
      const validos = vals.filter(v => v != null);
      const melhor = validos.length ? (menor ? Math.min.apply(null, validos) : Math.max.apply(null, validos)) : null;
      const mA = co.A.m[k], mB = co.B.m[k];
      const rBR = refPos.brasil && refPos.brasil.valores[k];
      const rMU = refPos.mundo && refPos.mundo.valores[k];
      /* a escala da linha inclui TUDO o que sera desenhado nela — medias, referencias e
         jogadores —, senao cada bloco teria a sua regua e a comparacao visual mentiria */
      const naLinha = validos.concat([mA, mB, rBR, rMU]
        .filter(x => typeof x === 'number' && !isNaN(x)));
      FS_ESCALA = naLinha.length
        ? { max: Math.max.apply(null, naLinha), min: Math.min.apply(null, naLinha) } : null;
      const medTd = medias.map(m => {
        const venc = medias.length === 2 && typeof mA === 'number' && typeof mB === 'number' &&
                     mA !== mB && ((m.rot.endsWith('A')) === melhorQue(mA, mB, menor));
        return fsCelulaMedia(co, k, m.d.m[k], casas, menor, venc);
      }).join('') + (medias.length === 2 ? fsQuemGanha(mA, mB, menor) : '') +
        refTd(k, casas, menor);

      b += '<tr><td class="fs-rot" title="' + esc(rot + ' · ' + un) + '">' + esc(rot) +
        '<small>' + esc(un) + '</small></td>' + medTd +
        colunas.map((c, i) => fsCelula(co, k, vals[i], casas, menor,
          melhor != null && vals[i] === melhor && validos.length > 1,
          rot + ': ' + fsFmt(vals[i], casas) + ' · média A ' + fsFmt(mA, casas) +
          ' · média B ' + fsFmt(mB, casas) +
          (typeof rBR === 'number' ? ' · ref. Brasil ' + fsFmt(rBR, casas) : '') +
          (typeof rMU === 'number' ? ' · ref. Mundo ' + fsFmt(rMU, casas) : ''),
          mA, mB, rBR, rMU)).join('') +
        tdVagas + '</tr>';
    });
  });
  b += '</tbody>';
  const tab = $('#fsMatriz');
  tab.innerHTML = h + b;
  /* Todas as colunas com a MESMA largura: divide o espaco que sobra depois da coluna
     dos rotulos. Com um minimo, para que muitas colunas encolham ate certo ponto e so
     entao a matriz role para o lado. */
  /* as colunas de referencia entram na conta: sem elas a largura sobrava por duas
     colunas e o navegador desenhava a barra de rolagem horizontal */
  const nCols = colunas.length + medias.length + refCols.length + vagas.length;
  if (nCols) {
    /* Folga: cada coluna tem um fio de 1px a esquerda, e com `border-collapse:separate`
       esses fios SOMAM na largura. Sem descontar um pixel por coluna (mais uma folga
       de 8), a soma passava a area por poucos pixels e o navegador desenhava a barra
       de rolagem horizontal a toa. */
    const wrap = $('.fs-matriz-wrap');
    /* a coluna "ganha" tem largura propria e tambem come espaco */
    const ganha = medias.length === 2 ? 38 : 0;
    const disp = (wrap.clientWidth || 1200) - FS_ROTULO - ganha - nCols - 8;
    const cabe = Math.floor(disp / nCols);
    let w = Math.max(FS_COL_ABS, Math.min(FS_COL_MIN, cabe));
    if (cabe > FS_COL_MIN) w = cabe;
    tab.style.setProperty('--fs-col', w + 'px');
    /* Uma correcao, nao um laco: a conta acima erra por poucos pixels (fios, sticky,
       arredondamento do table-layout). Em vez de adivinhar a formula exata, mede o que
       sobrou e desconta de uma vez. Passada unica de proposito — foi um laco desses
       que fez o campograma tremer. */
    /* mede a ROLAGEM, nao a largura da tabela: com width:100% a tabela relata a
       largura da area mesmo quando o conteudo passa dela */
    const sobra = wrap.scrollWidth - wrap.clientWidth;
    if (sobra > 0 && w > FS_COL_ABS) {
      w = Math.max(FS_COL_ABS, w - Math.ceil(sobra / nCols));
      tab.style.setProperty('--fs-col', w + 'px');
    }
  }
  $('#fsVazio').style.display = colunas.length || medias.length ? 'none' : 'block';
  fsDesenharVisao(co, colunas);
  if (FS_VISAO !== 'matriz') $('#fsVazio').style.display = 'none';

  $('#fsContagem').innerHTML = '<b>' + colunas.length + '</b> jogador' + (colunas.length === 1 ? '' : 'es') +
    ' na comparação · <b>' + milhar(pool.length) + '</b> passam no filtro · régua: ' +
    co.lista.length + ' ' + esc(sig(fsPos)) + ' das Séries A e B (' + co.A.n + ' e ' + co.B.n + ')' +
    ' · jogadores de outras ligas entram na mesma régua';

  $$('#fsMatriz tr.fs-grupo.abrivel').forEach(tr => {
    tr.onclick = () => fsAlternarGrupo(tr.dataset.g);
  });

  const btAdd = $('#fsMatriz .fs-add-bt');
  if (btAdd) btAdd.onclick = () => { const c = $('#fsBusca'); c.focus(); c.select(); };
  $$('#fsMatriz th.fs-col').forEach(th => {
    const id = parseInt(th.dataset.id), pk = th.dataset.pk;
    th.querySelector('.fs-ficha').onclick = () => { abrirFicha(id); irParaAba('campo'); };
    th.querySelector('.fs-levar').onclick = e => menuLevar(e, pk);
    th.querySelector('.fs-x').onclick = () => {
      const congelou = fsTirar(pk);
      if (congelou) toast('Comparação fixada nos que estavam na tela — ' +
                          'agora tirar não chama o próximo da fila');
    };
  });
  fsMontarElenco();
  fsMontarSeries(co, colunas);
}

/* ---------------- listas de escolha, desenhadas a mao ----------------
   Eram <select> nativos, e num <option> nao entra HTML: o fim de contrato so cabia como
   texto solto atras do nome (⏳ dez/26) e se perdia no meio da linha. Aqui cada item e
   um div — colocacao, indice, nome, clube e o CARD da data — e as datas caem todas na
   MESMA coluna, encostadas a direita. E o alinhamento que deixa varrer a lista de cima
   a baixo atras de quem vence, sem ler nome nenhum. */
function fspData(j) {
  const ct = (j && (j.ct || j.contrato)) || '';
  if (!ct) return '<span class="fsp-ct sem" title="contrato não informado">—</span>';
  const livre = ct.slice(0, 7) <= FS_LIVRE_ATE;
  return '<span class="fsp-ct' + (livre ? ' livre' : '') + '" title="contrato até ' + esc(ct) +
    (livre ? ' — vence a tempo da temporada 2027' : '') + '">' + mesAnoCurto(ct) + '</span>';
}
/* `itens`: { pk, j, idx, band, ja, motivo }. `pk` vazio = linha desabilitada. */
function fspPreencher(el, rotulo, itens, aoEscolher) {
  if (!el) return;
  const busca = itens.length > 18;
  el.innerHTML =
    '<div class="fsp-bt" tabindex="0">' + rotulo + ' · ' + itens.length + '</div>' +
    '<div class="msel-drop fsp-drop">' +
      (busca ? '<div class="msel-busca"><input type="text" placeholder="Filtrar…" autocomplete="off"></div>' : '') +
      (itens.length ? itens.map((x, i) =>
        '<div class="msel-item fsp-item' + (x.pk && !x.ja ? '' : ' off') + '"' +
          (x.pk && !x.ja ? ' data-pk="' + esc(x.pk) + '"' : '') +
          ' data-b="' + esc(fsNorm(x.j.n + ' ' + x.j.t)) + '">' +
        '<span class="fsp-p">' + (x.pos ? esc(x.pos) : (i + 1) + 'º') + '</span>' +
        (x.idx == null ? '' : '<span class="fsp-i ' +
          (x.idx >= 67 ? 'a' : x.idx >= 40 ? 'm' : 'b') +
          '" title="índice físico geral">' + x.idx + '</span>') +
        raioIcone(x.pkRaio || x.pk) +
        '<b class="fsp-nome">' + (x.band || '') + esc(x.j.n) + '</b>' +
        '<span class="fsp-time">' + esc(x.j.t || '') + '</span>' +
        (x.motivo ? '<span class="fsp-ja">' + esc(x.motivo) + '</span>' : '') +
        fspData(x.j) + '</div>').join('')
        : '<div class="msel-dica">ninguém nesta lista</div>') +
    '</div>';
  const bt = el.querySelector('.fsp-bt');
  const drop = el.querySelector('.fsp-drop');
  bt.onclick = e => { e.stopPropagation(); fspAbrir(el); };
  bt.onkeydown = e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fspAbrir(el); }
    if (e.key === 'Escape') drop.classList.remove('aberto');
  };
  drop.onclick = e => e.stopPropagation();
  drop.querySelectorAll('.fsp-item[data-pk]').forEach(it => {
    it.onclick = () => { drop.classList.remove('aberto'); aoEscolher(it.dataset.pk); };
  });
  if (busca) {
    const inp = drop.querySelector('.msel-busca input');
    inp.oninput = () => {
      const t = fsNorm(inp.value);
      drop.querySelectorAll('.fsp-item').forEach(it => {
        it.style.display = !t || it.dataset.b.includes(t) ? '' : 'none';
      });
    };
    inp.onclick = e => e.stopPropagation();
  }
}
function fspAbrir(el) {
  const drop = el.querySelector('.fsp-drop');
  if (!drop) return;
  const aberto = drop.classList.contains('aberto');
  $$('.msel-drop.aberto').forEach(d => d.classList.remove('aberto'));
  if (aberto) return;
  drop.classList.add('aberto');
  const b = drop.querySelector('.msel-busca input');
  if (b) { b.value = ''; b.oninput(); b.focus(); }
}

/* Uma lista por serie, na posicao escolhida, do melhor indice fisico para o pior.
   Sai da MESMA coorte que a matriz usa como regua — entao a ordem aqui e a mesma
   que decide os "top 5" — e quem ja esta na comparacao aparece marcado, para nao
   escolher duas vezes o mesmo. A regua e sempre a coorte das Series A e B, mesmo para
   jogador de fora: e o que permite comparar campeonatos diferentes com o mesmo metro. */
function fsOpcoesLista(el, lista, rotulo, co, jaTem, comBandeira) {
  if (!el) return;
  const ord = lista.map(j => ({ j, idx: fsIndices(co, j).geral }))
    .filter(x => x.idx != null).sort((a, b) => b.idx - a.idx)
    .map(x => {
      const pk = primaryKey(x.j);
      return { pk, j: x.j, idx: x.idx, band: comBandeira ? bandeira(x.j.l) : '',
               ja: jaTem.has(pk), motivo: jaTem.has(pk) ? 'já está' : '' };
    });
  fspPreencher(el, rotulo, ord, fsAdicionar);
}

function fsMontarSeries(co, colunas) {
  const jaTem = new Set(colunas.map(c => primaryKey(c.j)));
  fsOpcoesLista($('#fsSerieA'), co.lista.filter(j => j.l === 'Brasil A'), '🇧🇷 Série A', co, jaTem);
  fsOpcoesLista($('#fsSerieB'), co.lista.filter(j => j.l === 'Brasil B'), '🇧🇷 Série B', co, jaTem);
  /* rotulos curtos de proposito: o combo tem ~160px e o nome longo virava reticencias */

  /* Sul-americanos no exterior: nascidos na America do Sul (sem Brasil) jogando fora
     dela. Mesma definicao do botao "No exterior" dos filtros — uma regra so. */
  const minJ = fsMinJogos();
  const fora = fsBase().filter(j => j.p === fsPos && (Number(j.sc_n) || 0) >= minJ &&
    classPais(j.nac || '') === 'sa' && classLiga(j.l) !== 'sulamerica' && classLiga(j.l) !== 'brasil');
  fsOpcoesLista($('#fsSulExt'), fora, '🌎 SA no exterior', co, jaTem, true);

  /* Terceira lista: qualquer campeonato com tracking na posicao escolhida. Sul-americanos
     primeiro porque e de onde o Santa Cruz contrata. */
  const doPosto = fsBase().filter(j => j.p === fsPos && (Number(j.sc_n) || 0) >= minJ);
  const cont = {};
  doPosto.forEach(j => { cont[j.l] = (cont[j.l] || 0) + 1; });
  const ordem = l => GRUPOS_LIGA.sulamerica.includes(l) ? 0
                   : l.startsWith('Brasil') ? 1
                   : GRUPOS_LIGA.europa.includes(l) ? 2 : 3;
  const ligas = Object.keys(cont).sort((a, b) => ordem(a) - ordem(b) || a.localeCompare(b));
  const selL = $('#fsLigaEscolha');
  if (selL) {
    /* '*' = todos os campeonatos com tracking na posicao, numa lista so, ordenada pelo
       indice fisico. E a pergunta "quem sao os melhores do mundo nesta posicao?", que
       campeonato a campeonato nao da para responder. */
    if (fsLigaLista !== TODOS_CAMP && !ligas.includes(fsLigaLista)) {
      fsLigaLista = ligas.find(l => ordem(l) === 0) || ligas[0] || '';
    }
    selL.innerHTML = '<option value="">escolher campeonato…</option>' +
      '<option value="' + TODOS_CAMP + '"' + (fsLigaLista === TODOS_CAMP ? ' selected' : '') +
        '>🌐 todos os campeonatos (' + doPosto.length + ')</option>' +
      ligas.map(l =>
        '<option value="' + esc(l) + '"' + (l === fsLigaLista ? ' selected' : '') + '>' +
        bandeira(l) + esc(l) + ' (' + cont[l] + ')</option>').join('');
  }
  const todos = fsLigaLista === TODOS_CAMP;
  fsOpcoesLista($('#fsListaLiga'), todos ? doPosto : doPosto.filter(j => j.l === fsLigaLista),
                todos ? '＋ 🌐 todos os campeonatos'
                      : '＋ ' + bandeira(fsLigaLista) + (fsLigaLista || 'campeonato'),
                co, jaTem, true);
}

/* busca de qualquer jogador com tracking, em qualquer liga */
function fsBuscar() {
  const t = fsNorm($('#fsBusca').value.trim());
  const lista = $('#fsBuscaLista');
  if (t.length < 2) { lista.classList.remove('aberto'); return; }
  const achados = fsBase().filter(j => fsNorm(j.n + ' ' + j.t).includes(t))
    .sort((a, b) => (a.p === fsPos ? 0 : 1) - (b.p === fsPos ? 0 : 1) || a.n.localeCompare(b.n)).slice(0, 14);
  lista.innerHTML = achados.length
    ? achados.map(j => '<div class="msel-item fsp-item" data-pk="' + esc(primaryKey(j)) + '">' +
        '<span class="fsp-p">' + esc(sig(j.p)) + '</span>' + raioIcone(primaryKey(j)) +
        '<b class="fsp-nome">' + esc(j.n) + '</b>' +
        '<span class="fsp-time">' + esc(j.t) + ' · ' + esc(j.l) + '</span>' +
        fspData(j) + '</div>').join('')
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

/* Levar para o campograma — o MESMO gesto em tres lugares: o ↗ do cabecalho da matriz,
   o ↗ de cada chip da comparacao e o do painel de foco. Estava so no cabecalho da
   matriz, que Mapa, Reguas e Tiras escondem: nessas tres formas nao havia como subir
   alguem sem voltar para a matriz. Casa por CHAVE, nao por nome — homonimo na mesma
   posicao subiria o jogador errado, que e o jeito mais silencioso de errar.
   A posicao entra pela do jogador na base (as 11 da base sao as 11 do campograma) e o
   adicionarDaBase() e quem recusa repetido e avisa. */
/* ---------------- levar ao campograma, de qualquer aba ----------------
   Servem a aba Fisico (chip, cabecalho da matriz, painel de foco) E a Fim de contrato
   (a linha e o botao "levar p/"). Nao sao mais "fs": o prefixo errado e o comeco de
   alguem duplicar a funcao na outra aba. */
function basePorPk(pk) {
  /* fsMapaPk so tem os ~9 mil COM tracking, e a Fim de contrato lista a base inteira
     (contrato nao depende de tracking): a varredura na BASE nao e enfeite, e o unico
     caminho para a maioria dos jogadores daquela aba. */
  return pk ? ((fsMapaPk && fsMapaPk.get(pk)) || BASE.find(x => primaryKey(x) === pk)) : null;
}

/* Leva DIRETO para uma posicao escolhida. `cod` vazio = a posicao do jogador na base. */
function levarAoCampograma(pk, cod) {
  const j = basePorPk(pk);
  if (!j) { toast('Esse jogador não está na base', 'ruim'); return; }
  posAtual = cod || j.p;
  adicionarDaBase(j.id);
}

/* Menu de posicao, aberto pelo ↗. Antes o ↗ jogava direto na posicao que o jogador tem
   na base — e um CF que voce quer experimentar de EE ia para o lugar errado e so dava
   para arrumar depois, no menu do card. Aqui a escolha e na hora: a posicao dele vem
   marcada com ✓, e cada uma das outras dez diz quantas vagas ja estao tomadas. Mesmo
   desenho do "Mover para" do card, para nao inventar um segundo jeito de fazer a
   mesma coisa. */
/* A grade em si. Dois usos, porque as abas fazem coisas diferentes com ela:
     - LEVAR (Físico, Fim de contrato): o jogador esta na base e entra no campograma;
     - MOVER (Análise do elenco): o jogador JA esta no elenco e troca de posicao.
   O desenho e um so de proposito — quem aprende a grade numa aba a usa nas outras.
   `cfg`: { verbo, nome, pos, bloqueada(cod), escolher(cod), ancora, depois }. */
function menuPosicao(ev, cfg) {
  /* Recebe o EVENTO, nao o botao, de proposito: existe um fechador global de menus no
     clique do documento (linha `$$('.menu').forEach(m => m.classList.remove('aberto'))`).
     Quem abrisse sem barrar a propagacao veria o proprio clique apagar o `aberto` do
     menu recem-criado — ele nasce montado, com os 11 botoes, e INVISIVEL. Ja aconteceu
     em tres dos quatro pontos de entrada; barrar aqui dentro e o que impede o quinto. */
  if (ev && ev.stopPropagation) ev.stopPropagation();
  const botao = cfg.ancora || (ev && ev.currentTarget) || document.body;
  $$('.menu-jog').forEach(m => m.remove());
  const m = document.createElement('div');
  m.className = 'menu menu-jog menu-levar aberto';
  m.innerHTML =
    '<div class="menu-sep">' + esc(cfg.verbo + ' ' + cfg.nome) + ' para</div>' +
    '<div class="menu-pos">' + POSICOES.map(p => {
      /* quantos JA estao na posicao, nao "n de m vagas": o alvo por posicao costuma
         estar vazio (cai no padrao 3) e num grupo de 118 sairia "19 de 3 vagas". */
      const n = (estado.elenco[p.c] || []).length;
      const bloq = cfg.bloqueada ? cfg.bloqueada(p.c) : '';
      return '<button data-p="' + p.c + '"' +
        (p.c === cfg.pos ? ' class="atual"' : '') + (bloq ? ' disabled' : '') +
        /* o motivo do bloqueio manda no texto: senao a posicao atual, no modo Mover,
           saia com "é a posição dele · já é a posição dele" */
        ' title="' + esc(p.nome + ' · ' + n + ' no campograma' +
          (bloq ? ' · ' + bloq : p.c === cfg.pos ? ' · é a posição dele' : '')) + '">' +
        p.sig + '</button>';
    }).join('') + '</div>';
  document.body.appendChild(m);
  const r = botao.getBoundingClientRect();
  m.style.position = 'fixed';
  m.style.top = Math.min(window.innerHeight - m.offsetHeight - 8, r.bottom + 4) + 'px';
  m.style.left = Math.max(8, Math.min(window.innerWidth - m.offsetWidth - 8, r.left - 60)) + 'px';
  m.onclick = e => {
    const bt = e.target.closest('button[data-p]');
    if (!bt || bt.disabled) return;
    m.remove();
    cfg.escolher(bt.dataset.p);
    if (cfg.depois) cfg.depois();
  };
  setTimeout(() => document.addEventListener('click', function fecha() {
    m.remove(); document.removeEventListener('click', fecha);
  }, { once: true }), 0);
}

/* LEVAR: da base para o campograma (aba Física e aba Fim de contrato). */
function menuLevar(ev, pk, depois, ancora) {
  const j = basePorPk(pk);
  if (!j) { toast('Esse jogador não está na base', 'ruim'); return; }
  const pkJ = primaryKey(j);
  menuPosicao(ev, {
    verbo: 'Levar', nome: j.n, pos: j.p, ancora, depois,
    bloqueada: c => (estado.elenco[c] || []).some(x => (x.pk ? x.pk === pkJ : x.jid === j.id))
      ? 'ele já está aqui' : '',
    escolher: cod => levarAoCampograma(pk, cod),
  });
}

/* MOVER: troca de posicao quem JA esta no elenco (aba Análise do elenco). A posicao
   atual fica apagada — mover para onde ja esta e um clique que nao faz nada. */
function menuMover(ev, pos, uid, ancora, depois) {
  const j = (estado.elenco[pos] || []).find(x => x.uid === uid);
  if (!j) { toast('Esse jogador saiu do elenco', 'ruim'); return; }
  menuPosicao(ev, {
    verbo: 'Mover', nome: j.nome, pos, ancora, depois,
    bloqueada: c => c === pos ? 'já é a posição dele' : '',
    escolher: cod => moverJogador({ pos, uid }, cod, null, false),
  });
}
/* jogadores do campograma que tem tracking, a posicao escolhida primeiro */
function fsMontarElenco() {
  const sel = $('#fsElenco');
  if (!sel) return;
  fsBase();
  /* Todos entram na lista, inclusive quem NAO tem tracking — antes eles sumiam sem
     explicacao e parecia defeito ("por que o Gustavo Medina esta no campograma e nao
     aqui?"). Quem nao tem fica desabilitado, dizendo o motivo. */
  const itens = todosJogadores().map(j => ({ j, b: j.pk ? fsMapaPk.get(j.pk) : null }))
    .sort((a, b) => {
      const pa = (a.b || a.j).p || a.j.posOrig || '', pb = (b.b || b.j).p || b.j.posOrig || '';
      return (!!b.b) - (!!a.b) || (pa === fsPos ? 0 : 1) - (pb === fsPos ? 0 : 1) ||
             String(pa).localeCompare(String(pb));
    });
  /* aqui a colocacao seria enganosa (o elenco nao esta ordenado por indice), entao o
     lugar do numero fica com a posicao do jogador */
  fspPreencher(sel, '＋ do campograma', itens.map(x => {
    const pk = x.b ? primaryKey(x.b) : '';
    const ja = !!pk && fsExtras.includes(pk);
    return {
      pk: ja ? '' : pk,
      pkRaio: pk,
      idx: null,
      pos: sig((x.b || {}).p || x.j.posOrig || ''),
      j: { n: (x.b || {}).n || x.j.nome,
           t: (x.b || {}).t || x.j.clube || '',
           ct: (x.b || {}).ct || x.j.contrato || '' },
      ja,
      motivo: !x.b ? 'sem tracking' : ja ? 'já está' : '',
    };
  }), fsAdicionar);
}

/* Faixas do Fisico: as mesmas do Fim de contrato, sem as que nao fazem sentido aqui. */
const RANGES_FS = [
  { k: 'alt', r: 'Altura (cm)',   min: 150, max: 210,       passo: 1 },
  { k: 'id_', r: 'Idade',         min: 15,  max: 45,        passo: 1 },
  { k: 'mv',  r: 'Valor mercado', min: 0,   max: 120000000, passo: 500000, fmt: fmtMilhoes },
  { k: 'ov',  r: 'Overall',       min: 0,   max: 100,       passo: 1 },
  { k: 'min', r: 'Minutos',       min: 0,   max: 5000,      passo: 50 },
  { k: 'sc_n', r: 'Jogos c/ tracking', min: 0, max: 60,     passo: 1 },
];

/* Quem o filtro deixa passar, dentro da posicao escolhida. E de onde saem os "melhores
   do filtro" — a regua continua sendo a posicao nas Series A e B, sempre. */
function fsPool() {
  const ligas = mselSelecionados('fsLigaSel');
  const paises = mselSelecionados('fsPaisSel');
  const times = mselSelecionados('fsTimeSel');
  const pes = mselSelecionados('fsPeSel');
  const faixas = RANGES_FS.map(d => [d, rangeValor('fsRanges', d.k)]).filter(x => x[1]);
  const min = fsMinJogos();
  return fsBase().filter(j => {
    if (j.p !== fsPos) return false;
    if ((Number(j.sc_n) || 0) < min) return false;
    if (ligas && !ligas.has(j.l)) return false;
    if (paises && !paises.has(j.nac || '')) return false;
    if (times && !times.has(j.t)) return false;
    if (pes && !pes.has(rotuloPe(j.pe))) return false;
    for (const [d, f] of faixas) {
      const v = j[d.k];
      if (typeof v !== 'number' || isNaN(v) || v < f.lo || v > f.hi) return false;
    }
    return true;
  });
}

function fsAbasMarcar(idAbas, r) {
  $$('#' + idAbas + ' button').forEach(b => b.classList.toggle('on', b.dataset.r === r));
}
function fsSetLiga(r, quieto) {
  mselMarcar('fsLigaSel', r === 'todos' ? null : new Set(GRUPOS_LIGA[r] || []), true);
  fsAbasMarcar('fsLigaAbas', r);
  $$('#fsExt button').forEach(b => b.classList.remove('on'));
  if (!quieto) fsRender();
}
function fsSetPais(r) {
  const todos = MSELS.fsPaisSel ? MSELS.fsPaisSel.itens : [];
  mselMarcar('fsPaisSel', r === 'todos' ? null : new Set(todos.filter(n => classPais(n) === r)), true);
  fsAbasMarcar('fsPaisAbas', r);
  $$('#fsExt button').forEach(b => b.classList.remove('on'));
  fsRender();
}
function fsSetExterior(tipo) {
  const paises = MSELS.fsPaisSel ? MSELS.fsPaisSel.itens : [];
  const ligas = MSELS.fsLigaSel ? MSELS.fsLigaSel.itens : [];
  if (!tipo) {
    mselMarcar('fsPaisSel', null, true); mselMarcar('fsLigaSel', null, true);
    fsAbasMarcar('fsPaisAbas', 'todos'); fsAbasMarcar('fsLigaAbas', 'todos');
  } else if (tipo === 'br_ext') {
    mselMarcar('fsPaisSel', new Set(['Brazil']), true);
    mselMarcar('fsLigaSel', new Set(ligas.filter(l => classLiga(l) !== 'brasil')), true);
    fsAbasMarcar('fsPaisAbas', null); fsAbasMarcar('fsLigaAbas', null);
  } else {
    mselMarcar('fsPaisSel', new Set(paises.filter(n => classPais(n) === 'sa')), true);
    mselMarcar('fsLigaSel', new Set(ligas.filter(l => classLiga(l) !== 'brasil' && classLiga(l) !== 'sulamerica')), true);
    fsAbasMarcar('fsPaisAbas', null); fsAbasMarcar('fsLigaAbas', null);
  }
  $$('#fsExt button').forEach(b => b.classList.toggle('on', b.dataset.e === tipo));
  fsRender();
}

/* ---------------- estudo: Serie A x Serie B, indicador por indicador ----------------
   Para cada posicao e cada indicador do SkillCorner, a media dos jogadores com tracking
   de cada serie, a diferenca e quem lidera. Nos tempos (`menor`), liderar e ter o
   numero MENOR — sem essa inversao o estudo diria que a serie mais lenta e a melhor. */
function estudoAB(minJogos) {
  const base = fsBase().filter(j => (Number(j.sc_n) || 0) >= (minJogos || 0));
  return POSICOES.map(p => {
    const A = base.filter(j => j.p === p.c && j.l === 'Brasil A');
    const B = base.filter(j => j.p === p.c && j.l === 'Brasil B');
    const media = (lista, k) => {
      const v = lista.map(j => j[k]).filter(x => typeof x === 'number' && !isNaN(x));
      return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
    };
    const linhas = FS_TODAS.map(([k, rot, un, casas, menor]) => {
      const a = media(A, k), b = media(B, k);
      if (a == null || b == null) return null;
      const dif = a - b;
      const pct = b !== 0 ? dif / Math.abs(b) * 100 : 0;
      /* quem esta melhor: nos tempos, o menor */
      const lider = Math.abs(pct) < 0.5 ? '=' : ((dif > 0) !== !!menor ? 'A' : 'B');
      return { k, rot, un, casas, menor, a, b, dif, pct, lider };
    }).filter(Boolean);
    return { pos: p, nA: A.length, nB: B.length, linhas };
  }).filter(x => x.linhas.length && x.nA >= 3 && x.nB >= 3);
}

let estudoSel = null;      /* posicao aberta no estudo; null = todas */

function estudoRender() {
  const min = fsMinJogos();
  const dados = estudoAB(min);
  const fmt = (v, c) => fsFmt(v, c);

  /* resumo: em quantos indicadores cada serie lidera, por posicao */
  const resumo = '<table class="es-resumo"><thead><tr>' +
    '<th class="c-pos">Posição</th>' +
    '<th title="Jogadores da Série A com tracking nessa posição">Jogadores A</th>' +
    '<th title="Jogadores da Série B com tracking nessa posição">Jogadores B</th>' +
    '<th title="Em quantos indicadores a Série A leva vantagem">A lidera</th>' +
    '<th title="Em quantos indicadores a Série B leva vantagem">B lidera</th>' +
    '<th class="c-dif">Maior diferença</th></tr></thead><tbody>' +
    dados.map(d => {
      const a = d.linhas.filter(l => l.lider === 'A').length;
      const b = d.linhas.filter(l => l.lider === 'B').length;
      const maior = d.linhas.slice().sort((x, y) => Math.abs(y.pct) - Math.abs(x.pct))[0];
      return '<tr class="es-linha' + (estudoSel === d.pos.c ? ' on' : '') + '" data-pos="' +
        d.pos.c + '" title="Ver os indicadores de ' + esc(d.pos.nome) + '">' +
        '<td class="es-pos"><b>' + p_sig(d.pos) + '</b> ' + esc(d.pos.nome) + '</td>' +
        '<td>' + d.nA + '</td><td>' + d.nB + '</td>' +
        '<td><span class="es-conta a">' + a + '</span></td>' +
        '<td><span class="es-conta b">' + b + '</span></td>' +
        '<td class="c-dif">' + esc(maior.rot) + ' <span class="es-dif ' +
          (maior.lider === 'A' ? 'a' : 'b') + '">' +
          (maior.pct > 0 ? '+' : '') + fmt(maior.pct, 1) + '%</span></td></tr>';
    }).join('') + '</tbody></table>';

  const blocos = dados.filter(d => !estudoSel || d.pos.c === estudoSel).map(d => {
    let corpo = '';
    FS_GRUPOS.forEach(g => {
      const chaves = new Set(g.m.map(m => m[0]));
      const linhas = d.linhas.filter(l => chaves.has(l.k));
      if (!linhas.length) return;
      corpo += '<tr class="es-grupo"><td colspan="6"><b>' + esc(g.t) + '</b>' +
        '<span>' + esc(g.d) + '</span></td></tr>';
      corpo += linhas.map(l => {
        const larg = Math.min(100, Math.abs(l.pct) * 4);
        /* quem ganha fica dito com todas as letras, e nao so pela cor: nos tempos o
           vencedor e o numero MENOR, e ler isso pelo sinal da diferenca engana */
        const ganha = l.lider === '=' ? '<span class="es-ganha e">=</span>'
          : '<span class="es-ganha ' + l.lider.toLowerCase() + '">' + l.lider + '</span>';
        return '<tr><td class="es-rot" title="' + esc(l.rot + ' · ' + l.un) + '">' +
          esc(l.rot) + '<small>' + esc(l.un) + '</small></td>' +
          '<td class="num-c' + (l.lider === 'A' ? ' forte' : '') + '">' + fmt(l.a, l.casas) + '</td>' +
          '<td class="num-c' + (l.lider === 'B' ? ' forte' : '') + '">' + fmt(l.b, l.casas) + '</td>' +
          '<td class="num-c es-pct ' + (l.lider === 'A' ? 'a' : l.lider === 'B' ? 'b' : '') + '">' +
            (l.pct > 0 ? '+' : '') + fmt(l.pct, 1) + '%</td>' +
          '<td class="es-barra"><i class="' + (l.lider === 'A' ? 'a' : l.lider === 'B' ? 'b' : '') +
            '" style="width:' + larg.toFixed(0) + '%"></i></td>' +
          '<td class="es-ganha-c">' + ganha + '</td></tr>';
      }).join('');
    });
    return '<section class="es-bloco"><h3>' + p_sig(d.pos) + ' · ' + esc(d.pos.nome) +
      '<span>' + d.nA + ' na Série A · ' + d.nB + ' na Série B</span></h3>' +
      '<table class="es-tab"><thead><tr><th>Indicador</th><th class="num-c">Série A</th>' +
      '<th class="num-c">Série B</th><th class="num-c">Dif.</th><th></th>' +
      '<th class="es-ganha-c">Ganha</th></tr></thead>' +
      '<tbody>' + corpo + '</tbody></table></section>';
  }).join('');

  const voltar = estudoSel
    ? '<button class="bt mini" id="esTodas">← todas as posições</button>' : '';
  $('#esCorpo').innerHTML =
    '<p class="es-intro">Média de cada indicador do SkillCorner entre os jogadores com ' +
    'tracking de cada série, posição por posição. Só entram posições com pelo menos três ' +
    'de cada lado' + (min ? ', e só quem tem ' + min + ' jogos rastreados ou mais' : '') +
    '. A diferença é sobre a Série B: <b class="c-a">positiva</b> quando a Série A tem o ' +
    'número maior. Nos tempos, quem lidera é quem tem o número <b>menor</b> — por isso a ' +
    'cor não segue o sinal. <b>Clique numa posição</b> para ver só os indicadores dela.</p>' +
    resumo + '<div class="es-acoes">' + voltar + '</div>' +
    '<div class="es-blocos' + (estudoSel ? ' uma' : '') + '">' + blocos + '</div>';

  $$('#esCorpo .es-linha').forEach(tr => {
    tr.onclick = () => {
      estudoSel = estudoSel === tr.dataset.pos ? null : tr.dataset.pos;
      estudoRender();
      const bloco = $('#esCorpo .es-bloco');
      if (estudoSel && bloco) bloco.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
  });
  const bt = $('#esTodas');
  if (bt) bt.onclick = () => { estudoSel = null; estudoRender(); };
}
function p_sig(p) { return p.sig || p.c; }

/* ---------------- comparativos gravados, por posicao ----------------
   O que se grava e a LISTA RESOLVIDA de quem estava na tela, nao a receita que a
   produziu. Guardar "top 5 da Serie A + filtro X" faria o comparativo mudar sozinho
   quando a base fosse regerada — e a graca de gravar e justamente poder voltar ao
   mesmo quadro depois. Os excluidos vao junto porque tirar alguem da comparacao e
   uma decisao tao deliberada quanto incluir. */
const CHAVE_COMP = 'sc2027_comparativos';

function compCarregar() {
  try { return JSON.parse(localStorage.getItem(CHAVE_COMP)) || []; } catch (e) { return []; }
}
function compGravarTodos(lista) {
  try { localStorage.setItem(CHAVE_COMP, JSON.stringify(lista)); } catch (e) {}
}

function compMontarLista() {
  const sel = $('#fsComp');
  if (!sel) return;
  const todos = compCarregar();
  const daPos = todos.filter(c => c.pos === fsPos);
  const outros = todos.filter(c => c.pos !== fsPos);
  sel.innerHTML = '<option value="">— comparativo gravado —</option>' +
    (daPos.length ? '<optgroup label="' + esc(nomePos(fsPos)) + '">' + daPos.map(c =>
      '<option value="' + esc(c.id) + '">' + esc(c.nome) + ' · ' + c.incluidos.length +
      ' atletas</option>').join('') + '</optgroup>' : '') +
    (outros.length ? '<optgroup label="outras posições">' + outros.map(c =>
      '<option value="' + esc(c.id) + '">' + esc(sig(c.pos)) + ' · ' + esc(c.nome) + ' · ' +
      c.incluidos.length + ' atletas</option>').join('') + '</optgroup>' : '');
  $('#fsCompApagar').style.display = sel.value ? '' : 'none';
}

function compGravar() {
  const nome = prompt('Nome do comparativo:', nomePos(fsPos) + ' — ' +
    new Date().toLocaleDateString('pt-BR'));
  if (!nome) return;
  const incluidos = $$('#fsMatriz th.fs-col').map(th => th.dataset.pk);
  if (!incluidos.length) { toast('Não há ninguém na comparação', 'ruim'); return; }
  const lista = compCarregar();
  lista.unshift({ id: 'c' + Date.now(), nome: nome.trim(), pos: fsPos,
                  incluidos, ocultos: [...fsOcultos] });
  compGravarTodos(lista);
  compMontarLista();
  $('#fsComp').value = lista[0].id;
  $('#fsCompApagar').style.display = '';
  toast('Comparativo "' + nome.trim() + '" gravado', 'bom');
}

function compAbrir(id) {
  const c = compCarregar().find(x => x.id === id);
  if (!c) return;
  fsPos = c.pos;
  campinhoDefinir('fsCampo', [fsPos]);
  fsExtras = c.incluidos.slice();
  fsOcultos = new Set(c.ocultos || []);
  /* desliga o que traria gente de fora: o comparativo gravado e exatamente aquele */
  $('#fsTopA').checked = false;
  $('#fsTopB').checked = false;
  $('#fsTopFiltro').value = 0;
  fsRender();
  toast('Comparativo "' + c.nome + '" aberto', 'bom');
}

function compApagar() {
  const id = $('#fsComp').value;
  const c = compCarregar().find(x => x.id === id);
  if (!c || !confirm('Apagar o comparativo "' + c.nome + '"?')) return;
  compGravarTodos(compCarregar().filter(x => x.id !== id));
  compMontarLista();
  toast('Comparativo apagado');
}

function fsMontarFiltros() {
  campinhoInit('fsCampo', () => {
    const s = campinhoSelecao('fsCampo');
    const antes = fsPos;
    if (s.size) fsPos = [...s][0];
    campinhoDefinir('fsCampo', [fsPos]);
    /* Trocar de posicao recomeca a comparacao. Os escolhidos a mao (fsExtras) e os
       tirados (fsOcultos) sao de OUTRA posicao — carrega-los adiante mostrava volantes
       na regua de medio. E o `fsCongelar()`, que desliga os Top 5 quando se tira alguem
       da tela, deixava a lista travada nos antigos: sem religar, a nova posicao abria
       vazia ou com os de antes. */
    if (fsPos !== antes) {
      FS_FOCO_PK = null;
      fsExtras = [];
      fsOcultos = new Set();
      ['#fsTopA', '#fsTopB'].forEach(id => { if ($(id)) $(id).checked = true; });
      if ($('#fsTopFiltro')) $('#fsTopFiltro').value = 0;
    }
    compMontarLista();
    fsRender();
  }, true);
  campinhoDefinir('fsCampo', [fsPos]);
  const comTracking = fsBase();
  const distintos = f => {
    const c = {};
    comTracking.forEach(j => { const v = f(j); if (v) c[v] = 1; });
    return Object.keys(c).sort((a, b) => a.localeCompare(b));
  };
  mselInit('fsLigaSel', distintos(j => j.l), { rotuloTodos: 'Todas as ligas',
    aoMudar: () => { fsAbasMarcar('fsLigaAbas', null); fsRender(); } });
  mselInit('fsPaisSel', distintos(j => j.nac), { rotuloTodos: 'Todos os países', masc: true,
    aoMudar: () => { fsAbasMarcar('fsPaisAbas', null); fsRender(); } });
  mselInit('fsTimeSel', distintos(j => j.t), { rotuloTodos: 'Todos os times', masc: true, aoMudar: fsRender });
  mselInit('fsPeSel', PES, { rotuloTodos: 'Todos os pés', masc: true, aoMudar: fsRender });
  rangesInit('fsRanges', RANGES_FS, debounce(fsRender, 150));
  $$('#fsLigaAbas button').forEach(b => { b.onclick = () => fsSetLiga(b.dataset.r); });
  $$('#fsPaisAbas button').forEach(b => { b.onclick = () => fsSetPais(b.dataset.r); });
  $$('#fsExt button').forEach(b => {
    b.onclick = () => fsSetExterior(b.classList.contains('on') ? null : b.dataset.e);
  });
  $('#fsTopFiltro').oninput = debounce(fsRender, 200);
  $('#fsEstudo').onclick = () => { estudoRender(); $('#modalEstudo').classList.add('aberto'); };
  $('#fsCompGravar').onclick = compGravar;
  $('#fsCompApagar').onclick = compApagar;
  $('#fsComp').onchange = () => {
    $('#fsCompApagar').style.display = $('#fsComp').value ? '' : 'none';
    if ($('#fsComp').value) compAbrir($('#fsComp').value);
  };
  compMontarLista();
  fsAbasMarcar('fsLigaAbas', 'todos');

  $('#fsBusca').oninput = debounce(fsBuscar, 150);
  $('#fsBusca').onclick = e => { e.stopPropagation(); if ($('#fsBusca').value.trim().length >= 2) fsBuscar(); };
  /* as listas de jogador sao fspPreencher(): ja saem com o clique ligado */
  $('#fsLigaEscolha').onchange = () => { fsLigaLista = $('#fsLigaEscolha').value; fsRender(); };
  $('#fsMin').oninput = debounce(fsRender, 200);
  ['#fsTopA', '#fsTopB', '#fsMedias', '#fsRefs'].forEach(id => { $(id).onchange = fsRender; });
  $$('#fsVisao button').forEach(b => {
    b.classList.toggle('on', b.dataset.v === FS_VISAO);
    b.onclick = () => fsTrocarVisao(b.dataset.v);
  });
  $('#fsLimpar').onclick = () => {
    fsExtras = []; fsOcultos = new Set();
    $('#fsMin').value = 5; $('#fsTopFiltro').value = 0; $('#fsBusca').value = '';
    mselMarcar('fsLigaSel', null, true); mselMarcar('fsPaisSel', null, true);
    mselMarcar('fsTimeSel', null, true); mselMarcar('fsPeSel', null, true);
    fsAbasMarcar('fsLigaAbas', 'todos'); fsAbasMarcar('fsPaisAbas', 'todos');
    $$('#fsExt button').forEach(b => b.classList.remove('on'));
    rangesReset('fsRanges');
    fsRender();
  };
}

/* ---------------- aba Financeiro: estrutura salarial ----------------
   O campograma responde "quem"; esta aba responde "quanto custa de verdade, e quanto o
   atleta leva para casa". Sao numeros diferentes e e ai que mora a confusao de todo
   planejamento de elenco: o clube fala em CUSTO EFETIVO, o empresario fala em LIQUIDO.

   A conta, por faixa salarial do campograma:
     custo efetivo  = o que esta no card (o que o clube gasta por mes com o atleta)
     pacote bruto   = custo efetivo ÷ (1 + encargos)      — encargos sobre a carteira
     carteira/imagem= divisao do pacote bruto (padrao 60/40)
     liquido no mes = carteira × (1 − IR/INSS) + imagem × (1 − alíquota da PJ)
     custo no periodo = custo efetivo × 13 (12 meses + 13º), proporcional se o contrato
                        comecar no meio do ano
     liquido total  = liquido × meses + 13º e 1/3 de ferias sobre a parcela em carteira

   As DUAS aliquotas sao editaveis e ficam gravadas com o cenario. Sao elas que decidem
   as colunas de liquido, e nao ha uma resposta unica: depende do enquadramento da PJ e
   da faixa de IR do atleta. Os padroes (28% e 15%) sao ponto de partida, nao verdade. */
const FIN_PADRAO = { encargos: 6.95, carteira: 60, irCarteira: 28, aliqImagem: 15, meses: 12 };
function fin() {
  estado.fin = Object.assign({}, FIN_PADRAO, estado.fin || {});
  return estado.fin;
}
function finPeriodos(meses) { return meses * 13 / 12; }   /* 12 meses = 13 periodos */

function finFaixas() {
  const f = fin(), mapa = new Map();
  todosJogadores().forEach(j => {
    const sal = Number(j.salario) || 0;
    const k = String(sal);
    if (!mapa.has(k)) mapa.set(k, { sal, n: 0, nomes: [] });
    const g = mapa.get(k);
    g.n++; g.nomes.push(j.nome);
  });
  return [...mapa.values()].sort((a, b) => b.sal - a.sal).map(g => {
    const bruto = g.sal / (1 + f.encargos / 100);
    const carteira = bruto * f.carteira / 100;
    const imagem = bruto - carteira;
    const liqMes = carteira * (1 - f.irCarteira / 100) + imagem * (1 - f.aliqImagem / 100);
    const custoPer = g.sal * finPeriodos(f.meses);
    /* 13º e 1/3 de ferias incidem so na parcela em carteira */
    const extras = carteira * (1 - f.irCarteira / 100) * (1 + 1 / 3) * (f.meses / 12);
    const liqTotal = liqMes * f.meses + extras;
    return Object.assign(g, { bruto, carteira, imagem, liqMes, custoPer, liqTotal,
                              liqMedia: f.meses ? liqTotal / f.meses : 0 });
  });
}

function finRender() {
  const alvo = $('#finTabela');
  if (!alvo) return;
  const f = fin();
  const faixas = finFaixas();
  const comSal = faixas.filter(g => g.sal > 0);
  const semSal = faixas.find(g => g.sal === 0);
  const atletas = comSal.reduce((a, g) => a + g.n, 0);
  /* custoPer e POR ATLETA — o projetado tem de multiplicar pela quantidade da faixa */
  const custoAno = comSal.reduce((a, g) => a + g.custoPer * g.n, 0) +
                   (estado.comissao || 0) * finPeriodos(f.meses);
  const tetoAno = (estado.teto || 0) * finPeriodos(f.meses);

  $('#finKpis').innerHTML =
    finKpi('Orçamento anual', brl(tetoAno), 'teto de ' + brl(estado.teto) + ' × ' +
           finPeriodos(f.meses).toFixed(2).replace('.', ',') + ' períodos') +
    finKpi('Custo projetado', brl(custoAno),
           (custoAno > tetoAno ? 'acima do teto em ' + brl(custoAno - tetoAno)
                               : 'sobra ' + brl(tetoAno - custoAno)) +
           ' · comissão inclusa', custoAno > tetoAno ? 'ruim' : 'bom') +
    finKpi('Elenco com salário', atletas + (atletas === 1 ? ' atleta' : ' atletas'),
           semSal ? semSal.n + ' ainda sem salário definido' : 'todos definidos');

  const linha = (g, semSalario) =>
    '<tr' + (semSalario ? ' class="fin-sem"' : '') + ' title="' +
      esc(g.nomes.slice(0, 12).join(', ') + (g.nomes.length > 12 ? '…' : '')) + '">' +
    '<td class="fin-faixa">' + (semSalario ? 'Sem salário' : brl(g.sal)) + '</td>' +
    '<td class="fin-n">' + g.n + '</td>' +
    '<td class="fin-per">' + f.meses + ' meses</td>' +
    (semSalario
      ? '<td colspan="6" class="fin-vazio">atletas no campograma sem valor definido — ' +
        'não entram na conta</td>'
      : '<td><b>' + brl(g.bruto) + '</b></td>' +
        '<td class="fin-split">' + brl(g.carteira) + '<span>+ ' + brl(g.imagem) + '</span></td>' +
        '<td>' + brl(g.liqMes) + '</td>' +
        '<td>' + brl(g.custoPer) + '</td>' +
        '<td>' + brl(g.liqTotal) + '</td>' +
        '<td class="fin-media">' + brl(g.liqMedia) + '</td>') +
    '</tr>';

  const total = comSal.reduce((a, g) => ({
    n: a.n + g.n, bruto: a.bruto + g.bruto * g.n, custo: a.custo + g.custoPer * g.n,
    liq: a.liq + g.liqTotal * g.n,
  }), { n: 0, bruto: 0, custo: 0, liq: 0 });

  alvo.innerHTML =
    '<thead><tr>' +
      '<th>Custo<br>efetivo</th><th>Nº</th><th>Período</th>' +
      '<th>Pacote bruto<br>mensal</th><th>Carteira ' + f.carteira + '%<br>+ imagem ' +
        (100 - f.carteira) + '%</th><th>Líquido no<br>mês normal</th>' +
      '<th>Custo do clube<br>por atleta</th><th>Líquido total<br>por atleta</th>' +
      '<th>Média líquida<br>mensal</th>' +
    '</tr></thead><tbody>' +
    comSal.map(g => linha(g, false)).join('') +
    (semSal ? linha(semSal, true) : '') +
    '</tbody><tfoot><tr>' +
      '<td class="fin-faixa">Total</td><td class="fin-n">' + total.n + '</td><td></td>' +
      '<td><b>' + brl(total.bruto) + '</b></td><td></td><td></td>' +
      '<td>' + brl(total.custo) + '</td><td>' + brl(total.liq) + '</td><td></td>' +
    '</tr></tfoot>';

  ['encargos', 'carteira', 'irCarteira', 'aliqImagem', 'meses'].forEach(k => {
    const el = $('#fin_' + k);
    if (el && document.activeElement !== el) el.value = String(f[k]).replace('.', ',');
  });
}
function finKpi(rot, val, obs, cls) {
  return '<div class="fin-kpi' + (cls ? ' ' + cls : '') + '"><span>' + esc(rot) + '</span>' +
    '<b>' + val + '</b><i>' + esc(obs || '') + '</i></div>';
}
function finLigar() {
  ['encargos', 'carteira', 'irCarteira', 'aliqImagem', 'meses'].forEach(k => {
    const el = $('#fin_' + k);
    if (!el) return;
    el.oninput = () => {
      const v = parseFloat(String(el.value).replace(',', '.'));
      if (!isNaN(v)) { fin()[k] = v; salvarLocal(); finRender(); }
    };
  });
}

/* ---------------- correções de posição ----------------
   A posicao vem do Wyscout pela PRIMEIRA sigla do campo Position, e as vezes ela nao e
   a que o jogador realmente faz — o F. Nicola do Atletico Tucuman entrava como Medio
   sendo centroavante. Em vez de corrigir na mao a cada vez que a base e regerada, a
   decisao fica escrita em dados/posicao_overrides.json, com a fonte.
   ATENCAO: a chave e a primary_key ('Nome - Clube - Liga'), entao ela muda quando o
   jogador troca de clube — e a correcao para de casar. O log avisa quando isso
   acontece, em vez de falhar em silencio. */
async function aplicarOverridesPosicao() {
  let mapa;
  try {
    const v = window.__verDados ? '?v=' + window.__verDados : '';
    const r = await fetch('dados/posicao_overrides.json' + v);
    mapa = (await r.json()).overrides || {};
  } catch (e) { return; }
  const chaves = Object.keys(mapa);
  if (!chaves.length) return;
  const porPk = new Map(BASE.map(j => [primaryKey(j), j]));
  let ok = 0;
  const perdidos = [];
  chaves.forEach(pk => {
    const j = porPk.get(pk);
    if (!j) { perdidos.push(pk); return; }
    j.p = mapa[pk].p;
    j.posOverride = true;
    ok++;
  });
  fsBaseCache = null;
  console.log('posições corrigidas:', ok, 'de', chaves.length,
              perdidos.length ? '· sem match (jogador mudou de clube?): ' + perdidos.join(' | ') : '');
}

/* ---------------- raio físico ⚡, a mesma régua do Ranking (:5053) ----------------
   O raio responde uma pergunta so: contra o JOGADOR-REFERENCIA da posicao, esse atleta
   e superior (verde), parecido (amarelo) ou abaixo (vermelho)? As referencias e os
   parametros sao os mesmos do Ranking (config/fisico_ref_posicao.json de la, copiados
   para dados/raio_ref.json), entao um jogador lido nos dois lugares conta a mesma
   historia — o que muda e a populacao que da o desvio-padrao, que aqui e a desta base.

   Conta: z de cada um dos 5 KPIs = (jogador - referencia) / desvio da posicao. Cada z e
   limitado a ±1 ANTES da media (um KPI extremo nao decide sozinho). Media >= +0,75 e
   verde, <= -0,75 e vermelho, o meio e amarelo. Fora disso ha dois atalhos, iguais aos
   de la: DOMINANCIA (mediana dos z >= 0,5, no maximo 2 eixos perdidos com folga e
   maioria dos eixos ganhos) puxa para verde mesmo com a media segurada pelo limite, e o
   espelho negativo puxa para vermelho. Goleiro fica de fora — o raio e de jogador de
   linha. */
let RAIO = null;          /* dados/raio_ref.json */
let RAIO_MAPA = null;     /* primary_key -> classificacao */

let RAIO_FALHOU = false;
async function raioCarregar() {
  try {
    const v = window.__verDados ? '?v=' + window.__verDados : '';
    const r = await fetch('dados/raio_ref.json' + v);
    if (!r.ok) throw new Error(r.status);
    RAIO = await r.json();
  } catch (e) { RAIO = null; RAIO_FALHOU = true; console.warn('raio_ref.json indisponível', e); }
  RAIO_MAPA = null;
}

let RAIO_PCTL = {};        /* posicao -> percentil medio da referencia na populacao */
function raioMapa() {
  if (RAIO_MAPA) return RAIO_MAPA;
  RAIO_MAPA = new Map();
  RAIO_PCTL = {};
  if (!RAIO || !BASE.length) return RAIO_MAPA;
  const P = RAIO.params, KP = RAIO.kpis;
  Object.keys(RAIO.refs).forEach(pos => {
    /* A barra e a MEDIA DOS JOGADORES REFERENCIA DO BRASIL — decisao do usuario. Um
       jogador so deixava a regua refem do outlier: o Medina estava no percentil 91 dos
       medios e so 2,9% ficavam verdes; o Alex Telles, no 25 dos laterais, deixava 65%.
       Media de grupo achata isso. Cai para a media MUNDO quando nao ha lista Brasil. */
    const grupo = RAIO.refs[pos].brasil || RAIO.refs[pos].mundo;
    if (!grupo || !grupo.valores) return;
    const rv = grupo.valores;
    if (!KP.every(k => typeof rv[k] === 'number')) return;
    /* populacao da posicao: quem tem os 5 KPIs e jogos fisicos suficientes */
    const pop = BASE.filter(j => j.p === pos && (Number(j.sc_n) || 0) >= P.min_perf &&
      KP.every(k => typeof j[k] === 'number' && !isNaN(j[k])));
    if (pop.length < 20) return;
    const sd = {};
    KP.forEach(k => {
      const m = pop.reduce((a, j) => a + j[k], 0) / pop.length;
      sd[k] = Math.sqrt(pop.reduce((a, j) => a + (j[k] - m) * (j[k] - m), 0) / pop.length) || 1;
    });
    pop.forEach(j => {
      const zs = KP.map(k => (j[k] - rv[k]) / sd[k]);
      const n = zs.length;
      const mz = zs.reduce((a, z) => a + Math.max(-P.zcap, Math.min(P.zcap, z)), 0) / n;
      const ord = zs.slice().sort((a, b) => a - b);
      const med = n % 2 ? ord[(n - 1) / 2] : (ord[n / 2 - 1] + ord[n / 2]) / 2;
      const perdas = zs.filter(z => z <= -0.5).length;
      const ganhos = zs.filter(z => z > 0).length;
      const npp = Number(j.sc_n) || 0;
      let dom = med >= P.med_verde && perdas <= P.dom_max_perdas &&
                ganhos > n / 2 && npp >= P.dom_min_npp;
      if (!dom && P.dom_elite_z != null) {
        dom = Math.max.apply(null, zs) >= P.dom_elite_z && med > 0 &&
              perdas <= P.dom_max_perdas && ganhos > n / 2 && npp >= P.dom_min_npp;
      }
      const domneg = med <= P.med_vermelho && ganhos <= P.dom_max_ganhos && npp >= P.dom_min_npp;
      const c = (mz >= P.banda || dom) ? 'sup' : (mz <= -P.banda || domneg) ? 'bax' : 'sim';
      RAIO_MAPA.set(primaryKey(j), { c, z: mz, med, w: ganhos, na: n, n: npp, dom, domneg, pos });
    });
    /* Quao alta e a barra: o percentil medio da REFERENCIA na propria posicao. Importa
       muito e nao e parelho entre posicoes — o Medina (medios) esta no percentil 91 e
       so 3% ficam verdes; o Alex Telles (lateral esquerdo) esta no 25 e 65% ficam. Sem
       isto no balao, o mesmo verde parece querer dizer a mesma coisa nas onze posicoes,
       e nao quer. */
    const ps = KP.map(k => {
      const col = pop.map(j => j[k]).sort((a, b) => a - b);
      return col.filter(v => v < rv[k]).length / col.length * 100;
    });
    RAIO_PCTL[pos] = Math.round(ps.reduce((a, v) => a + v, 0) / ps.length);
  });
  return RAIO_MAPA;
}

const RAIO_ROT = { sup: 'SUPERIOR', sim: 'SIMILAR', bax: 'ABAIXO' };
/* `pk` e a primary_key; devolve '' quando nao ha classificacao (goleiro, sem tracking,
   posicao sem referencia ou populacao pequena demais para um desvio confiavel). */
function raioIcone(pk) {
  const o = raioMapa().get(pk);
  if (!o) return '';
  const g = (RAIO.refs[o.pos] || {}).brasil || (RAIO.refs[o.pos] || {}).mundo || {};
  const ref = 'média de ' + (g.n || '?') + ' referências' +
              ((RAIO.refs[o.pos] || {}).brasil ? ' do Brasil' : ' do mundo') +
              (g.nomes ? ': ' + g.nomes.join(', ') : '');
  const sinal = o.z > 0 ? '+' : '';
  const curto = o.n < RAIO.params.dom_min_npp;
  let t = 'Físico ' + RAIO_ROT[o.c] + ' à referência da posição (' + ref + ')' +
          ' — Δz méd ' + sinal + o.z.toFixed(2) +
          ' · mediana ' + (o.med > 0 ? '+' : '') + o.med.toFixed(2) +
          ' · ganha em ' + o.w + ' de ' + o.na + ' eixos';
  if (o.dom) t += ' · verde por DOMINÂNCIA (maioria dos eixos com margem)';
  if (o.domneg) t += ' · vermelho por DOMINÂNCIA NEGATIVA';
  if (curto) t += ' · AMOSTRA CURTA: só ' + o.n + ' jogos rastreados';
  if (RAIO_PCTL[o.pos] != null) {
    t += ' — a referência está no percentil ' + RAIO_PCTL[o.pos] + ' da posição' +
         (RAIO_PCTL[o.pos] >= 75 ? ': barra alta, verde é raro aqui'
          : RAIO_PCTL[o.pos] <= 35 ? ': barra baixa, verde é comum aqui' : '');
  }
  return '<span class="raio raio-' + o.c + (curto ? ' raio-curto' : '') + '" title="' + esc(t) +
    '"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg></span>';
}

/* ---------------- premissas ----------------
   Ficam no servidor (dados/premissas.json, via /api/premissas) e nao no navegador:
   sao o combinado do trabalho, nao preferencia de tela — precisam sobreviver a troca
   de maquina e acompanhar o projeto. */
let PREMISSAS = [];

/* Na versao publicada (GitHub Pages) nao ha servidor: grupos e premissas passam a
   viver no navegador de quem abre. Cada visitante tem os seus. */
const ESTATICO = !!window.__estatico;
const CHAVE_PREM_LOCAL = 'sc2027_premissas';

async function prLer() {
  if (ESTATICO) {
    try {
      const guardadas = JSON.parse(localStorage.getItem(CHAVE_PREM_LOCAL));
      if (Array.isArray(guardadas) && guardadas.length) return guardadas;
    } catch (e) {}
  }
  try {
    const r = await fetch(ESTATICO ? 'dados/premissas.json' : 'api/premissas');
    return await r.json();
  } catch (e) { return []; }
}

function prEstado(txt, apagarEm) {
  const el = $('#anEstado');
  if (!el) return;
  el.textContent = txt;
  if (apagarEm) setTimeout(() => { if (el.textContent === txt) el.textContent = ''; }, apagarEm);
}
async function prGravar() {
  if (ESTATICO) {
    try { localStorage.setItem(CHAVE_PREM_LOCAL, JSON.stringify(PREMISSAS)); } catch (e) {}
    prEstado('guardado neste navegador', 2500);
    return;
  }
  prEstado('gravando…');
  try {
    const r = await fetch('api/premissas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(PREMISSAS),
    });
    if (!r.ok) throw new Error(r.status);
    prEstado('gravado', 2000);
  } catch (e) {
    prEstado('falhou ao gravar');
    toast('Não consegui gravar as premissas', 'ruim');
  }
}

function prEditar(id) {
  const p = PREMISSAS.find(x => x.id === id);
  if (!p) return;
  const titulo = prompt('Título da premissa:', p.titulo);
  if (titulo === null) return;
  const texto = prompt('O que isso quer dizer na prática:', p.texto);
  if (texto === null) return;
  Object.assign(p, { titulo: titulo.trim(), texto: texto.trim() });
  anPremissasRender(); prGravar();
}

/* As premissas da MONTAGEM ficam no topo da Analise do elenco: e la que se decide onde
   gastar, e a decisao tem de estar ao lado do norte que a orienta. Havia tambem uma aba
   Premissas listando TODOS os grupos (montagem, orcamento, elenco, dados); ela saiu, por
   pedido — os grupos tecnicos continuam gravados em dados/premissas.json e valendo, so
   nao tem mais tela. */
const GRUPO_MONTAGEM = 'Montagem do elenco';

function anPremissasRender() {
  const alvo = $('#anPrLista');
  if (!alvo) return;
  const itens = PREMISSAS.filter(p => p.grupo === GRUPO_MONTAGEM);
  alvo.innerHTML = itens.length ? itens.map((p, i) =>
    '<article class="an-pr-item" data-id="' + esc(p.id) + '">' +
      '<span class="an-pr-n">' + (i + 1) + '</span>' +
      '<div><b>' + esc(p.titulo) + '</b><p>' + esc(p.texto) + '</p></div>' +
      '<button class="an-pr-ed" title="Editar">✎</button>' +
      '<button class="an-pr-x" title="Tirar esta premissa">×</button>' +
    '</article>').join('')
    : '<div class="dica">Nenhuma premissa de montagem ainda — use o ＋ acrescentar.</div>';

  $$('#anPrLista .an-pr-ed').forEach(b => {
    b.onclick = () => prEditar(b.closest('.an-pr-item').dataset.id);
  });
  $$('#anPrLista .an-pr-x').forEach(b => {
    b.onclick = () => {
      const id = b.closest('.an-pr-item').dataset.id;
      const p = PREMISSAS.find(x => x.id === id);
      if (!p || !confirm('Tirar a premissa "' + p.titulo + '"?')) return;
      PREMISSAS = PREMISSAS.filter(x => x.id !== id);
      anPremissasRender(); prGravar();
    };
  });
}

async function anPremissasCarregar() {
  if (!PREMISSAS.length) PREMISSAS = await prLer();
  anPremissasRender();
}

function anNovaPremissa() {
  const titulo = prompt('Premissa da montagem (ex.: "Time físico"):');
  if (!titulo || !titulo.trim()) return;
  const texto = prompt('O que isso quer dizer na prática:') || '';
  PREMISSAS.unshift({ id: 'u' + Date.now(), grupo: GRUPO_MONTAGEM,
                      titulo: titulo.trim(), texto: texto.trim(), fonte: 'usuario' });
  anPremissasRender();
  prGravar();
  toast('Premissa acrescentada');
}

function irParaAba(nome) {
  $$('.aba').forEach(b => b.classList.toggle('on', b.dataset.aba === nome));
  $('#pgCampo').classList.toggle('oculta', nome !== 'campo');
  $('#pgContrato').classList.toggle('oculta', nome !== 'contrato');
  $('#pgFisico').classList.toggle('oculta', nome !== 'fisico');
  $('#pgAnalise').classList.toggle('oculta', nome !== 'analise');
  $('#pgFinanceiro').classList.toggle('oculta', nome !== 'financeiro');
  $('#pgEmpresarios').classList.toggle('oculta', nome !== 'empresarios');
  $('#pgIndicados').classList.toggle('oculta', nome !== 'indicados');
  $('#pgSerieB').classList.toggle('oculta', nome !== 'serieb');
  if (nome === 'campo') requestAnimationFrame(ajustarCampo);
  if (nome === 'contrato') fcRender();
  if (nome === 'fisico') fsRender();
  if (nome === 'analise') anPremissasCarregar();
  if (nome === 'financeiro') finRender();
  if (nome === 'empresarios') empRender();
  if (nome === 'indicados') indRender();
  if (nome === 'serieb') sbRender();
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
    html += '<tr class="grupo"><td colspan="9">' + p.sig + ' · ' + esc(p.nome) +
      ' (' + lista.length + ')</td><td class="num">' + brl(totalPos(p.c)) +
      '</td><td class="num">' + brl(totalPos(p.c) * (estado.fator || 1)) + '</td></tr>';
    lista.forEach(j => {
      html += '<tr>' +
        '<td>' + p.sig + '</td>' +
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
    POSICOES.map(p => '<option value="' + p.c + '">' + p.sig + ' · ' + p.nome + '</option>').join('');

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
  $('#anNova').onclick = anNovaPremissa;
  finLigar();

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

  /* Análise do elenco: as duas listas de jogadores (Maiores salários e Estrangeiros)
     abrem a mesma grade de posições das outras abas. Aqui o jogador JA esta no elenco,
     entao a acao e MOVER, nao levar. Delegado no `#pgAnalise` porque os dois blocos se
     redesenham a cada render — handler preso ao elemento morreria no primeiro redesenho.
     `render()` no fim para as listas (e o campograma) refletirem a troca. */
  $('#pgAnalise').addEventListener('click', e => {
    const el = e.target.closest('.jog-mv');
    if (!el) return;
    menuMover(e, el.dataset.pos, el.dataset.uid, el, render);
  });

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

  const trocarTema = () => {
    estado.tema = estado.tema === 'claro' ? 'escuro' : 'claro';
    aplicarTema(); salvarLocal();
  };
  $('#btTema').onclick = trocarTema;
  $('#btTemaTopo').onclick = trocarTema;

  const bq = $('#empBusca');
  if (bq) bq.oninput = () => { empFiltro = bq.value; empRender(); };
  const bf = $('#empSoFalta');
  if (bf) bf.onclick = () => {
    empSoFalta = !empSoFalta;
    bf.classList.toggle('on', empSoFalta);
    empRender();
  };
  const bn = $('#empNovo');
  if (bn) bn.onclick = () => {
    empExtras().unshift({ uid: uid(), nome: '', clube: '', idade: '', contrato: '', pos: 'CA' });
    salvarLocal(); empRender();
    /* foco no nome do que acabou de nascer: a linha vazia sem foco parece que nao criou */
    const p = $('#empCorpo .emp-nome-ed');
    if (p) { p.focus(); p.scrollIntoView({ block: 'center' }); }
  };
  const bc = $('#empCsv');
  if (bc) bc.onclick = empCsv;

  const ib = $('#indBusca');
  if (ib) ib.oninput = () => { indBusca = ib.value; indRender(); };
  const ia = $('#indFiltroAval');
  if (ia) ia.onchange = () => { indFiltroAval = ia.value; indRender(); };
  const iN = $('#indNovo'); if (iN) iN.onclick = indNovo;
  const iC = $('#indCsv');  if (iC) iC.onclick = indCsv;

  $('#btAjustar').onclick = () => {
    escalaProxima();
    sincronizarBotoes(); salvarLocal(); ajustarCampo();
  };
  $('#btSalvar').onclick = () => salvarCenario(false);
  const bSC = $('#btSalvarComo');
  if (bSC) bSC.onclick = () => salvarCenario(true);
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
    await gravarCenario();
  };
  $('#btRenomear').onclick = () => {
    const c = $('#marcaSub');
    c.focus(); c.select();
    toast('Digite o novo nome e tecle Enter');
  };
  $('#btExcluir').onclick = async () => {
    if (!estado.id) { toast('Este grupo ainda não foi salvo', 'ruim'); return; }
    if (ESTATICO && FB.usuario) {
      /* Aviso diferente de proposito: excluir um grupo compartilhado tira ele de TODO
         MUNDO, nao so da tela de quem clicou. A pergunta tem que dizer isso antes, nao
         depois. So chega aqui o que esta mesmo na nuvem — um grupo local, mesmo com a
         pessoa logada, cai no fluxo de baixo. */
      const naNuvem = (await cenNuvemLer()).some(c => c.id === estado.id);
      if (naNuvem) {
        if (!confirm('Excluir "' + estado.nome + '" para TODOS?\n\nEste grupo é compartilhado: ' +
                     'ele some para todo mundo que abre o site. Não dá para desfazer.')) return;
        if (!await cenNuvemApagar(estado.id)) return;
        estado.id = null; salvarLocal(); listarCenarios();
        toast('Grupo excluído para todos');
        return;
      }
    }
    if (!confirm('Excluir o grupo "' + estado.nome + '"? Não dá para desfazer.')) return;
    if (ESTATICO) {
      const antes = cenLocalLer();
      const depois = antes.filter(c => c.id !== estado.id);
      const eraPublicado = (await cenPublicados()).some(c => c.id === estado.id);
      cenLocalGravar(depois);
      estado.id = null; salvarLocal(); listarCenarios();
      toast(antes.length === depois.length && eraPublicado
        ? 'Esse grupo é publicado: não dá para excluí-lo, só a sua cópia — e você não tinha uma'
        : eraPublicado ? 'Sua cópia foi excluída; o publicado continua na lista' : 'Grupo excluído deste navegador');
      return;
    }
    await fetch('api/cenario/' + estado.id, { method: 'DELETE' });
    estado.id = null; salvarLocal(); listarCenarios();
    toast('Grupo excluído');
  };

  $('#btManual').onclick = () => abrirManual(null);
  $('#btManualOk').onclick = () => {
    const nome = $('#mnNome').value.trim();
    if (!nome) { toast('Informe o nome', 'ruim'); return; }
    const ex = $('#mnEstrangeiro').checked;
    const mes = $('#mnContrato').value;                 // 'aaaa-mm' -> ultimo dia util do mes
    const campos = {
      nome, clube: $('#mnClube').value.trim() || 'sem clube',
      idade: parseInt($('#mnIdade').value) || null,
      contrato: mes ? mes + '-28' : '',
      salario: paraNumero($('#mnSalario').value),
      nac: ex ? ($('#mnPais').value.trim() || '') : 'Brazil', estrangeiro: ex,
    };
    if (manualEditando) {
      /* tem de ser o objeto do estado. `todosJogadores()` devolve copias com a posicao
         anexada — mexer nelas nao muda nada e o card volta igual. */
      let j = null;
      POSICOES.forEach(p => (estado.elenco[p.c] || []).forEach(x => {
        if (x.uid === manualEditando) j = x;
      }));
      if (j) Object.assign(j, campos);
      $('#modalManual').classList.remove('aberto');
      manualEditando = null;
      salvarLocal(); render();
      toast(nome + ' atualizado', 'bom');
      return;
    }
    const lista = estado.elenco[posAtual];
    lista.push(Object.assign({
      uid: uid(), jid: null, manual: 1, liga: '', ov: null, posOrig: posAtual,
      psp: '', status: 'alvo', titular: lista.length === 0,
    }, campos));
    $('#modalManual').classList.remove('aberto');
    salvarLocal(); render();
    toast(nome + ' adicionado em ' + sig(posAtual), 'bom');
  };
}

/* ---------------- inicio ---------------- */

/* No site publicado, quem chega pela primeira vez veria o campo vazio. Carrega o
   elenco que foi junto na publicacao — mas SO se o visitante ainda nao mexeu em
   nada: quem ja montou o seu nao pode perde-lo por causa disto. */
async function elencoDePartida() {
  if (!ESTATICO) return;
  if (localStorage.getItem(CHAVE_LOCAL)) return;
  try {
    const r = await fetch('dados/elenco_inicial.json');
    if (!r.ok) return;
    const c = await r.json();
    if (!c || !c.elenco) return;
    estado = Object.assign(novoEstado(), c, { id: null });
    POSICOES.forEach(p => { if (!Array.isArray(estado.elenco[p.c])) estado.elenco[p.c] = []; });
    estado.nome = c.nome || estado.nome;
    migrar();
    salvarLocal();
    console.log('elenco de partida:', c.nome, todosJogadores().length, 'atletas');
  } catch (e) {}
}
async function iniciar() {
  carregarLocal();
  await elencoDePartida();
  if (ESTATICO) prepararEstatico();
  /* sem `await`: a nuvem nao pode segurar a abertura da tela. Quando ela responder, o
     onAuthStateChanged chama fbBotao() e listarCenarios() de novo — se houver login
     guardado, os compartilhados entram na lista alguns instantes depois. */
  if (ESTATICO) fbIniciar().then(ok => { if (!ok) fbBotao(); });
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
    await aplicarOverridesPosicao();
    await raioCarregar();
    /* se a aba Fisico ja estava aberta numa forma alternativa, ela estava esperando
       as referencias — redesenha agora, em vez de esperar o usuario mexer */
    if ($('#pgFisico') && !$('#pgFisico').classList.contains('oculta')) fsRender();
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

/* ================= aba Empresários =================
   Quem negocia nao e o jogador, e quem cuida dele. Toda essa informacao vivia em
   conversa de WhatsApp e caderno: telefone do empresario, quanto ele ganha hoje, quanto
   esta pedindo. Aqui ela fica ao lado do elenco, na mesma tela, e acompanha o grupo —
   e gravada dentro do cenario, entao viaja junto no Salvar e no comparativo.

   CHAVE: `pk` (nome-clube-liga) quando existe, `uid:` + uid como reserva. A escolha
   importa — pk e estavel entre grupos, entao anotar o empresario do Fulano no Cenario 1
   aproveita no Cenario 2; uid e por linha do elenco e morreria na primeira troca. */
const EMP_STATUS = ['', 'Main', 'Squad', 'Youth'];
/* O que cada nível quer dizer, nas palavras do usuário. Vale escrever: "Squad" e "Youth"
   não se explicam sozinhos para quem abre a tela pela primeira vez, e a decisão de que
   Main É o titular só existe aqui. */
const EMP_STATUS_NOTA = { Main: 'titular da posição', Squad: 'reserva', Youth: 'jovem' };
const EMP_CAMPOS = [
  /* Status vem PRIMEIRO: e a leitura que se faz varrendo a coluna de cima a baixo
     ("quem e Main nesta posicao?"), e nao um detalhe do contato. Fica colorido para
     dar para ler sem ler — verde Main, ambar Squad, azul Youth. */
  { k: 'status',     r: 'Status',          w: 84,  opcoes: EMP_STATUS },
  { k: 'empresario', r: 'Empresário',      w: 130 },
  { k: 'empresa',    r: 'Empresa',         w: 120 },
  { k: 'igEmpresa',  r: 'IG da empresa',   w: 110, ig: 1 },
  { k: 'igJogador',  r: 'IG do jogador',   w: 110, ig: 1 },
  /* DOIS telefones, e o rótulo tem de dizer de quem é cada um: falar com o jogador
     direto e falar com quem o representa são conversas diferentes, e trocar um pelo
     outro numa negociação é o tipo de erro que custa caro. */
  { k: 'tel',        r: 'Telefone empresário', w: 122 },
  { k: 'telJogador', r: 'Telefone jogador',    w: 118 },
  { k: 'salAtual',   r: 'Salário atual',   w: 92,  num: 1 },
  { k: 'pedida',     r: 'Pedida',          w: 92,  num: 1 },
  { k: 'faixa',      r: 'Faixa p/ clube',  w: 92,  num: 1 },
  /* Texto livre, por último e largo: é onde cabe o que não cabe em campo nenhum — "pai
     empresário", "só sai por empréstimo", "falei em jan e pediu 200". Na ficha do ☎ vira
     caixa de várias linhas, porque ali há espaço e é onde se escreve de verdade. */
  { k: 'obs',        r: 'Descrição',       w: 260, livre: 1 },
];
let empSoFalta = false;
let empFiltro = '';

function empChave(j) { return j.pk ? 'pk:' + j.pk : 'uid:' + j.uid; }

/* MAIN É O TITULAR. Os dois conceitos existiam separados — `j.titular` (a estrela, um por
   posição) e o status Main/Squad/Youth da aba Empresários — e o usuário disse que são a
   mesma coisa. Manter dois campos dizendo o mesmo é como garantir que um dia eles se
   contradigam, então esta função é o ÚNICO lugar que muda qualquer um dos dois.

   Consequências, todas escolhidas:
     - só um Main por posição, porque titular é um por posição;
     - quem era Main e perdeu o posto vira Squad, que é o que ele passou a ser — deixar
       em branco perderia a informação de que o jogador está no elenco principal;
     - tirar o Main tira a estrela, e vice-versa. */
function definirNivel(cod, j, nivel) {
  const lista = estado.elenco[cod] || [];
  if (nivel === 'Main') {
    lista.forEach(x => {
      if (x.uid === j.uid) return;
      if (x.titular) {
        x.titular = false;
        const c = empChave(x);
        if (empDados(c).status === 'Main') { empGravar(c).status = 'Squad'; }
      }
    });
    j.titular = true;
    empGravar(empChave(j)).status = 'Main';
  } else {
    j.titular = false;
    const ch = empChave(j);
    if (nivel) { empGravar(ch).status = nivel; }
    else if (estado.emp && estado.emp[ch]) { delete estado.emp[ch].status; }
    empLimpar(ch);
  }
  salvarLocal();
}
/* LER nao cria. A versao anterior fazia `estado.emp[ch] = {}` aqui, e como a tela chama
   isto uma vez por jogador para desenhar, so ABRIR a aba enchia o cenario com 118
   objetos vazios — que iam para o Salvar, para a nuvem e para o cenarios.json, sem
   nada dentro. Quem grava e `empGravar()`, e so quando ha o que gravar. */
/* Devolve um objeto NOVO em vez de uma constante compartilhada, e o motivo é uma
   armadilha real: `const` não sobe como função sobe. A `migrar()` roda na carga, ANTES de
   o fim do arquivo ser avaliado, e chamava `empDados()` — que lia uma `const EMP_VAZIO`
   ainda na zona morta temporal. Resultado: `Cannot access 'EMP_VAZIO' before
   initialization` dentro de uma promise, a carga inteira abortava e o site abria com o
   campo VAZIO e tudo zerado. Não deu erro nos meus testes porque eu chamava `abrirCenario`
   à mão, depois de o arquivo já ter sido todo avaliado; só quebrava no caminho de
   inicialização com algo já gravado no navegador — o caminho do usuário. */
function empDados(ch) { return (estado.emp && estado.emp[ch]) || {}; }
function empGravar(ch) {
  if (!estado.emp) estado.emp = {};
  if (!estado.emp[ch]) estado.emp[ch] = {};
  return estado.emp[ch];
}
/* some com o registro que ficou sem nada: senao, digitar e apagar deixaria o entulho */
function empLimpar(ch) {
  const d = estado.emp && estado.emp[ch];
  if (d && !Object.values(d).some(v => v)) delete estado.emp[ch];
}
function empVazio(d) { return !EMP_CAMPOS.some(c => d[c.k]); }

/* Jogadores de FORA do campograma. Entram aqui porque a conversa com um empresario
   quase sempre traz nomes que ainda nao estao no elenco — e perder isso obrigaria a
   anotar num outro lugar, que e exatamente o que esta aba veio resolver. */
function empExtras() {
  if (!Array.isArray(estado.empExtra)) estado.empExtra = [];
  return estado.empExtra;
}

/* `@fulano` -> link do Instagram. Guarda-se o texto como a pessoa digitou; o link e so
   leitura, para dar um clique em vez de copiar e colar no navegador. */
function empIgUrl(v) {
  const t = String(v || '').trim().replace(/^@/, '');
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return 'https://instagram.com/' + t.replace(/^instagram\.com\//i, '').replace(/\/+$/, '');
}

function empLinhas() {
  const linhas = [];
  POSICOES.forEach(p => {
    (estado.elenco[p.c] || []).forEach(j => linhas.push({
      pos: p.c, posNome: p.nome, ch: empChave(j),
      nome: j.nome, idade: j.idade, clube: j.clube, contrato: j.contrato,
      estrangeiro: j.estrangeiro, nac: j.nac, jid: j.jid, deFora: false,
    }));
  });
  empExtras().forEach(e => linhas.push({
    pos: e.pos || 'CA', posNome: nomePos(e.pos || 'CA'), ch: 'ext:' + e.uid,
    nome: e.nome, idade: e.idade, clube: e.clube, contrato: e.contrato,
    deFora: true, uid: e.uid,
  }));
  return linhas;
}

function empRender() {
  const alvo = $('#empCorpo');
  if (!alvo) return;
  const todas = empLinhas();
  const termo = empFiltro.trim().toLowerCase();
  const passa = l => {
    const d = empDados(l.ch);
    if (empSoFalta && !empVazio(d)) return false;
    if (!termo) return true;
    return [l.nome, l.clube, d.empresario, d.empresa].some(
      v => String(v || '').toLowerCase().includes(termo));
  };
  const lista = todas.filter(passa);

  $('#empSub').innerHTML = empResumoHtml(todas, lista.length);

  if (!lista.length) {
    alvo.innerHTML = '<div class="emp-vazio">' +
      (todas.length ? 'Nada com esse filtro.' :
       'Nenhum jogador no campograma ainda. Monte o elenco, ou use "＋ jogador de fora".') +
      '</div>';
    return;
  }

  /* agrupado pela posicao do campograma, na ordem do campo: e como o usuario pensa o
     elenco, e evita procurar o zagueiro no meio dos atacantes */
  const porPos = {};
  lista.forEach(l => { (porPos[l.pos] = porPos[l.pos] || []).push(l); });
  const ordem = POSICOES.map(p => p.c).filter(c => porPos[c]);

  const cab = '<div class="emp-cab">' +
    '<span class="emp-c-jog">Jogador</span>' +
    '<span class="emp-c-ct">Fim de contrato</span>' +
    /* `flex: peso 1 0` em vez de `width: Npx`: somadas, as larguras fixas passavam de
       1700px e a aba só cabia rolando de lado. Agora as colunas DIVIDEM o que há, com o
       peso mantendo a proporção de antes. */
    /* `title` no cabeçalho porque agora ele CORTA: com as colunas dividindo a largura,
       "Telefone empresário" vira "Telefone empre…" e sem o balão não há como saber de
       quem é o telefone — que é justamente a distinção que os dois campos existem para
       fazer. */
    EMP_CAMPOS.map(c => '<span title="' + esc(c.r) + '" style="flex:' + c.w +
      ' 1 0;min-width:0">' + esc(c.r) + '</span>').join('') +
    '<span class="emp-c-x"></span></div>';

  alvo.innerHTML = cab + ordem.map(cod => {
    const p = POSICOES.find(x => x.c === cod);
    return '<div class="emp-grupo"><div class="emp-grupo-cab">' +
      '<b>' + esc(p.sig) + '</b><span>' + esc(p.nome) + '</span>' +
      '<i>' + porPos[cod].length + '</i></div>' +
      porPos[cod].map(l => empLinhaHtml(l)).join('') + '</div>';
  }).join('');

  alvo.querySelectorAll('input[data-ch]').forEach(inp => {
    inp.oninput = () => {
      const c = EMP_CAMPOS.find(x => x.k === inp.dataset.k);
      const d = empGravar(inp.dataset.ch);
      d[inp.dataset.k] = c && c.num ? paraNumero(inp.value) : inp.value;
      empLimpar(inp.dataset.ch);
      salvarLocal();
      /* o link do IG acompanha o que foi digitado, sem refazer a tela: reconstruir a
         linha a cada tecla tiraria o foco do campo no meio da digitacao */
      const a = inp.parentElement.querySelector('a.emp-ig');
      if (a) {
        const u = empIgUrl(inp.value);
        a.href = u; a.style.visibility = u ? 'visible' : 'hidden';
      }
      /* a tarja ambar de "ainda nao preenchi" tem de apagar na hora: ela e a fila de
         trabalho, e fila que nao anda enquanto se digita deixa de ser util */
      const linha = inp.closest('.emp-linha');
      if (linha) linha.classList.toggle('falta', empVazio(d));
      empAtualizarResumo();
    };
    if (EMP_CAMPOS.find(x => x.k === inp.dataset.k && x.num)) {
      inp.onblur = () => { inp.value = milhar(empDados(inp.dataset.ch)[inp.dataset.k] || 0); };
    }
  });
  alvo.querySelectorAll('select.emp-st').forEach(sel => {
    sel.onchange = () => {
      const d = empGravar(sel.dataset.ch);
      d[sel.dataset.k] = sel.value;
      empLimpar(sel.dataset.ch);
      sel.className = 'emp-st st-' + String(sel.value || 'sem').toLowerCase();
      const linha = sel.closest('.emp-linha');
      if (linha) linha.classList.toggle('falta', empVazio(d));
      salvarLocal();
      empAtualizarResumo();
    };
  });
  alvo.querySelectorAll('input[data-ext]').forEach(inp => {
    inp.oninput = () => {
      const e = empExtras().find(x => x.uid === inp.dataset.ext);
      if (!e) return;
      e[inp.dataset.campo] = inp.value;
      salvarLocal();
    };
  });
  alvo.querySelectorAll('select[data-ext]').forEach(sel => {
    sel.onchange = () => {
      const e = empExtras().find(x => x.uid === sel.dataset.ext);
      if (!e) return;
      e.pos = sel.value; salvarLocal(); empRender();
    };
  });
  alvo.querySelectorAll('.emp-x').forEach(b => {
    b.onclick = () => {
      const e = empExtras().find(x => x.uid === b.dataset.ext);
      if (!e) return;
      if (!confirm('Tirar "' + (e.nome || 'sem nome') + '" da lista?')) return;
      estado.empExtra = empExtras().filter(x => x.uid !== b.dataset.ext);
      delete (estado.emp || {})['ext:' + b.dataset.ext];
      salvarLocal(); empRender();
    };
  });
  alvo.querySelectorAll('.emp-ficha').forEach(b => {
    b.onclick = () => { abrirFicha(parseInt(b.dataset.jid)); irParaAba('campo'); };
  });
}

/* só o cabeçalho, sem refazer a tabela — chamado a cada tecla */
function empResumoHtml(todas, mostrando) {
  const comEmp = todas.filter(l => empDados(l.ch).empresario).length;
  const cont = st => todas.filter(l => empDados(l.ch).status === st).length;
  const chips = ['Main', 'Squad', 'Youth']
    .map(st => ({ st, n: cont(st) })).filter(x => x.n)
    .map(x => '<i class="emp-chip st-' + x.st.toLowerCase() + '">' + x.st + ' ' + x.n + '</i>').join('');
  return '<b>' + todas.length + '</b> jogador' + (todas.length === 1 ? '' : 'es') +
    ' · <b>' + comEmp + '</b> com empresário anotado' +
    (todas.length > comEmp ? ' · faltam <b>' + (todas.length - comEmp) + '</b>' : '') +
    (chips ? ' ' + chips : '') +
    (mostrando != null && mostrando !== todas.length ? ' · mostrando ' + mostrando : '');
}
function empAtualizarResumo() {
  const el = $('#empSub');
  if (el) el.innerHTML = empResumoHtml(empLinhas(), null);
}

function empLinhaHtml(l) {
  const d = empDados(l.ch);
  const campo = c => {
    const v = d[c.k];
    if (c.opcoes) {
      return '<span class="emp-campo" style="flex:' + c.w + ' 1 0;min-width:0">' +
        '<select class="emp-st st-' + esc(String(v || 'sem').toLowerCase()) + '"' +
        ' data-ch="' + esc(l.ch) + '" data-k="' + c.k + '">' +
        c.opcoes.map(o => '<option value="' + esc(o) + '"' +
          (String(v || '') === o ? ' selected' : '') + '>' + (o || '—') + '</option>').join('') +
        '</select></span>';
    }
    const val = c.num ? (v ? milhar(v) : '') : (v || '');
    return '<span class="emp-campo" style="flex:' + c.w + ' 1 0;min-width:0">' +
      '<input data-ch="' + esc(l.ch) + '" data-k="' + c.k + '" value="' + esc(val) + '"' +
      (c.num ? ' inputmode="numeric" class="num"' : '') +
      ' placeholder="' + (c.ig ? '@perfil' : c.num ? '0' : '') + '">' +
      (c.ig ? '<a class="emp-ig" target="_blank" rel="noopener" title="Abrir no Instagram"' +
              ' href="' + esc(empIgUrl(v)) + '"' +
              (empIgUrl(v) ? '' : ' style="visibility:hidden"') + '>↗</a>' : '') +
      '</span>';
  };
  const jog = l.deFora
    ? '<span class="emp-c-jog de-fora">' +
        '<input data-ext="' + l.uid + '" data-campo="nome" value="' + esc(l.nome || '') + '" placeholder="nome do jogador" class="emp-nome-ed">' +
        '<span class="emp-meta">' +
          '<input data-ext="' + l.uid + '" data-campo="clube" value="' + esc(l.clube || '') + '" placeholder="clube" class="emp-min">' +
          '<input data-ext="' + l.uid + '" data-campo="idade" value="' + esc(l.idade || '') + '" placeholder="idade" class="emp-min idade">' +
          '<select data-ext="' + l.uid + '">' + POSICOES.map(p =>
            '<option value="' + p.c + '"' + (p.c === l.pos ? ' selected' : '') + '>' + p.sig + '</option>').join('') +
          '</select>' +
        '</span></span>'
    : '<span class="emp-c-jog">' +
        '<span class="emp-nome-l">' +
          '<b title="' + esc(l.nome) + '">' + esc(l.nome) + '</b>' +
          (l.estrangeiro ? '<span class="selo-ex">' + esc(sigla(l.nac)) + '</span>' : '') +
          (l.jid != null ? '<button class="emp-ficha" data-jid="' + l.jid + '" title="Ver a ficha">+</button>' : '') +
        '</span>' +
        '<span class="emp-meta">' + esc(l.clube || '—') +
          (l.idade ? ' · ' + l.idade + 'a' : '') + '</span></span>';
  const ct = l.deFora
    ? '<span class="emp-c-ct"><input data-ext="' + l.uid + '" data-campo="contrato" value="' +
      esc(l.contrato || '') + '" placeholder="aaaa-mm" class="emp-min"></span>'
    : '<span class="emp-c-ct">' + (l.contrato ? fcData(l.contrato) : '—') + '</span>';
  return '<div class="emp-linha' + (empVazio(d) ? ' falta' : '') + '">' + jog + ct +
    EMP_CAMPOS.map(campo).join('') +
    '<span class="emp-c-x">' + (l.deFora
      ? '<button class="emp-x" data-ext="' + l.uid + '" title="Tirar da lista">×</button>' : '') +
    '</span></div>';
}

/* Ficha de UM jogador, aberta pelo ☎ do card. Mandar para a aba com 118 linhas para
   preencher um contato era desproporcional: a aba serve para varrer a lista, a ficha
   serve para preencher um. O botao "ver todos na aba" fica no rodape, para quem quiser
   o outro caminho. Grava no mesmo lugar — e a mesma informacao, so outra porta. */
function empFicha(ch, rotulo, sub) {
  const alvo = $('#meCampos');
  if (!alvo) return;
  $('#meTitulo').textContent = rotulo || 'Empresário';
  $('#meSub').textContent = sub || '';
  const d = empDados(ch);
  alvo.innerHTML = EMP_CAMPOS.map(c => {
    const v = d[c.k] || '';
    if (c.opcoes) {
      return '<label class="me-l"><span>' + esc(c.r) + '</span>' +
        '<select class="emp-st st-' + esc(String(v || 'sem').toLowerCase()) + '" data-k="' + c.k + '">' +
        c.opcoes.map(o => '<option value="' + esc(o) + '"' + (v === o ? ' selected' : '') +
          '>' + (o || '—') + '</option>').join('') + '</select></label>';
    }
    if (c.livre) {
      return '<label class="me-l me-largo"><span>' + esc(c.r) + '</span>' +
        '<textarea data-k="' + c.k + '" rows="3" placeholder="anotações livres sobre o ' +
        'jogador ou a negociação">' + esc(v) + '</textarea></label>';
    }
    return '<label class="me-l"><span>' + esc(c.r) + '</span>' +
      '<input data-k="' + c.k + '" value="' + esc(c.num ? (v ? milhar(v) : '') : v) + '"' +
      (c.num ? ' inputmode="numeric" class="num"' : '') +
      ' placeholder="' + (c.ig ? '@perfil' : c.num ? '0' : '') + '"></label>';
  }).join('');
  alvo.querySelectorAll('input[data-k],select[data-k],textarea[data-k]').forEach(el => {
    const ev = el.tagName === 'SELECT' ? 'onchange' : 'oninput';
    el[ev] = () => {
      const c = EMP_CAMPOS.find(x => x.k === el.dataset.k);
      const reg = empGravar(ch);
      reg[el.dataset.k] = c && c.num ? paraNumero(el.value) : el.value;
      if (el.tagName === 'SELECT') el.className = 'emp-st st-' + String(el.value || 'sem').toLowerCase();
      empLimpar(ch);
      salvarLocal();
      /* o ☎ do card acende na hora, sem fechar a ficha: o retorno tem de ser imediato */
      render();
    };
  });
  $('#meVerTudo').onclick = () => { $('#modalEmp').classList.remove('aberto'); empIrPara(ch); };
  $('#modalEmp').classList.add('aberto');
  const p = alvo.querySelector('input[data-k="empresario"]');
  if (p) p.focus();
}

/* Leva para a aba e DEIXA O JOGADOR NA MAO: limpa os filtros (senao a linha pode estar
   escondida por um filtro esquecido de antes), rola ate ela, acende por um instante e
   poe o cursor no campo do empresario — que e o que se vai digitar em 9 de 10 vezes. */
function empIrPara(ch) {
  empFiltro = '';
  empSoFalta = false;
  const bq = $('#empBusca'); if (bq) bq.value = '';
  const bf = $('#empSoFalta'); if (bf) bf.classList.remove('on');
  irParaAba('empresarios');
  requestAnimationFrame(() => {
    /* Nada de montar seletor com a chave dentro: ela e "pk:Paulo Vitor - Atletico GO -
       Brasil B", com acento, espaco e hifen. `CSS.escape` serve para IDENT, nao para o
       miolo de um valor entre aspas — escapando ali, o seletor deixa de casar e o foco
       simplesmente nao acontece, sem erro nenhum. Comparar o dataset e exato e imune. */
    const inp = $$('#empCorpo input[data-k="empresario"]').find(i => i.dataset.ch === ch);
    if (!inp) { toast('Esse jogador não está na lista', 'ruim'); return; }
    const linha = inp.closest('.emp-linha');
    if (linha) {
      linha.scrollIntoView({ block: 'center', behavior: 'smooth' });
      linha.classList.add('acende');
      setTimeout(() => linha.classList.remove('acende'), 1600);
    }
    inp.focus();
  });
}

function empCsv() {
  const linhas = empLinhas();
  if (!linhas.length) { toast('Nada para baixar', 'ruim'); return; }
  const cab = ['Posição', 'Jogador', 'Idade', 'Clube', 'Fim de contrato']
    .concat(EMP_CAMPOS.map(c => c.r));
  /* ; e BOM: e o que faz o Excel em portugues abrir o arquivo em colunas e nao
     embaralhar os acentos */
  const escapa = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const corpo = linhas.map(l => {
    const d = empDados(l.ch);
    return [sig(l.pos), l.nome, l.idade, l.clube, l.contrato]
      .concat(EMP_CAMPOS.map(c => d[c.k] || '')).map(escapa).join(';');
  });
  const txt = '﻿' + cab.map(escapa).join(';') + '\n' + corpo.join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
  a.download = 'empresarios-' + String(estado.nome || 'grupo').replace(/[^\w\s-]/g, '') + '.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast(linhas.length + ' linhas baixadas', 'bom');
}

/* ================= aba Indicados =================
   Mesma ideia do Indicados do Scout System: a fila do que chega de fora — empresario
   liga, manda nome, e aquilo precisa de um lugar antes de virar (ou nao virar) alvo.
   Sem isso a indicacao mora no WhatsApp e some.

   E uma LISTA PROPRIA, nao uma visao do elenco: o indicado normalmente nao esta no
   campograma — e justamente o candidato a entrar. Por isso cada linha e um registro
   solto, com uid, e nao uma chave de jogador como na aba Empresarios. */
const IND_AVALIACOES = [
  '', 'Aprovado Main', 'Aprovado Squad', 'Aprovado Youth', 'Aprovado sub20',
  'Em avaliação', 'Monitorar', 'Descartado',
];
/* classe CSS por avaliacao: verde para os aprovados, ambar para o que segue em aberto,
   coral para o descartado — a coluna tem de se ler de relance */
const IND_CLASSE = {
  'Aprovado Main': 'ok forte', 'Aprovado Squad': 'ok', 'Aprovado Youth': 'ok',
  'Aprovado sub20': 'ok', 'Em avaliação': 'meio', 'Monitorar': 'meio',
  'Descartado': 'nao',
};
const IND_COLUNAS = [
  { k: 'atleta',      r: 'Atleta',      w: 170, forte: 1 },
  { k: 'pos',         r: 'Posição',     w: 74,  opcoes: () => [''].concat(POSICOES.map(p => p.c)),
    rotulo: v => (v ? sig(v) : '—') },
  { k: 'geracao',     r: 'Geração',     w: 64,  ph: '2004' },
  { k: 'pais',        r: 'País',        w: 96,  ph: 'Brasil' },
  { k: 'clube',       r: 'Clube',       w: 140, ph: 'Flamengo' },
  { k: 'data',        r: 'Data',        w: 96,  tipo: 'date' },
  { k: 'responsavel', r: 'Responsável', w: 110, ph: 'quem avalia' },
  { k: 'recepcao',    r: 'Recepção',    w: 120, ph: 'quem recebeu' },
  { k: 'indicacao',   r: 'Indicação',   w: 130, ph: 'quem indicou' },
  { k: 'avaliacao',   r: 'Avaliação',   w: 132, opcoes: () => IND_AVALIACOES },
];
let indBusca = '', indFiltroAval = '';

function indLista() {
  if (!Array.isArray(estado.indicados)) estado.indicados = [];
  return estado.indicados;
}

function indRender() {
  const alvo = $('#indCorpo');
  if (!alvo) return;
  const todos = indLista();
  const termo = indBusca.trim().toLowerCase();
  const lista = todos.filter(i => {
    if (indFiltroAval && (i.avaliacao || '') !== indFiltroAval) return false;
    if (!termo) return true;
    return ['atleta', 'clube', 'indicacao', 'pais', 'responsavel', 'recepcao']
      .some(k => String(i[k] || '').toLowerCase().includes(termo));
  });

  /* o seletor de avaliação mostra a contagem de cada uma: é o resumo da fila */
  const sel = $('#indFiltroAval');
  if (sel) {
    const cont = v => todos.filter(i => (i.avaliacao || '') === v).length;
    sel.innerHTML = '<option value="">Todas as avaliações (' + todos.length + ')</option>' +
      IND_AVALIACOES.filter(v => v).map(v =>
        '<option value="' + esc(v) + '"' + (indFiltroAval === v ? ' selected' : '') + '>' +
        esc(v) + ' (' + cont(v) + ')</option>').join('') +
      (cont('') ? '<option value="__sem"' + (indFiltroAval === '__sem' ? ' selected' : '') +
        '>sem avaliação (' + cont('') + ')</option>' : '');
    sel.value = indFiltroAval;
  }

  const resumo = $('#indSub');
  if (resumo) {
    const aprov = todos.filter(i => /^Aprovado/.test(i.avaliacao || '')).length;
    resumo.innerHTML = todos.length
      ? '<b>' + todos.length + '</b> indicado' + (todos.length === 1 ? '' : 's') +
        (aprov ? ' · <b>' + aprov + '</b> aprovado' + (aprov === 1 ? '' : 's') : '') +
        (lista.length !== todos.length ? ' · mostrando ' + lista.length : '')
      : 'Jogadores indicados por empresários';
  }

  if (!lista.length) {
    alvo.innerHTML = '<div class="emp-vazio">' + (todos.length
      ? 'Nada com esse filtro.'
      : 'Nenhum indicado ainda. Use "＋ novo indicado" para começar a fila.') + '</div>';
    return;
  }

  const cab = '<div class="emp-cab ind-cab">' +
    IND_COLUNAS.map(c => '<span style="width:' + c.w + 'px">' + esc(c.r) + '</span>').join('') +
    '<span class="emp-c-x"></span></div>';

  alvo.innerHTML = cab + lista.map(i => {
    const cel = c => {
      const v = i[c.k] || '';
      if (c.opcoes) {
        const cl = c.k === 'avaliacao' ? ' ind-aval ' + (IND_CLASSE[v] || 'sem') : '';
        return '<span class="emp-campo" style="flex:' + c.w + ' 1 0;min-width:0">' +
          '<select class="ind-sel' + cl + '" data-uid="' + i.uid + '" data-k="' + c.k + '">' +
          c.opcoes().map(o => '<option value="' + esc(o) + '"' + (v === o ? ' selected' : '') +
            '>' + esc(c.rotulo ? c.rotulo(o) : (o || '—')) + '</option>').join('') +
          '</select></span>';
      }
      return '<span class="emp-campo" style="flex:' + c.w + ' 1 0;min-width:0">' +
        '<input data-uid="' + i.uid + '" data-k="' + c.k + '" value="' + esc(v) + '"' +
        (c.tipo === 'date' ? ' type="date"' : '') +
        (c.forte ? ' class="ind-forte"' : '') +
        ' placeholder="' + esc(c.ph || '') + '"></span>';
    };
    return '<div class="emp-linha ind-linha" data-uid="' + i.uid + '">' +
      IND_COLUNAS.map(cel).join('') +
      '<span class="emp-c-x"><button class="emp-x" data-uid="' + i.uid + '" title="Tirar da lista">×</button></span>' +
      '</div>';
  }).join('');

  alvo.querySelectorAll('input[data-uid],select[data-uid]').forEach(el => {
    const ev = el.tagName === 'SELECT' ? 'onchange' : 'oninput';
    el[ev] = () => {
      const r = indLista().find(x => x.uid === el.dataset.uid);
      if (!r) return;
      r[el.dataset.k] = el.value;
      if (el.dataset.k === 'avaliacao') {
        el.className = 'ind-sel ind-aval ' + (IND_CLASSE[el.value] || 'sem');
        indRender();   /* a contagem do filtro muda: vale refazer */
        return;
      }
      salvarLocal();
    };
    if (el.tagName === 'SELECT') {
      const antes = el.onchange;
      el.onchange = () => { antes(); salvarLocal(); };
    }
  });
  alvo.querySelectorAll('.emp-x[data-uid]').forEach(b => {
    b.onclick = () => {
      const r = indLista().find(x => x.uid === b.dataset.uid);
      if (!confirm('Tirar "' + ((r && r.atleta) || 'sem nome') + '" da lista de indicados?')) return;
      estado.indicados = indLista().filter(x => x.uid !== b.dataset.uid);
      salvarLocal(); indRender();
    };
  });
}

function indNovo() {
  /* data de hoje ja preenchida: indicacao quase sempre se cadastra no dia em que chega,
     e digitar a data e o tipo de atrito que faz a pessoa deixar para depois */
  const hoje = new Date();
  const iso = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') +
              '-' + String(hoje.getDate()).padStart(2, '0');
  indLista().unshift({ uid: uid(), atleta: '', pos: '', geracao: '', pais: '', clube: '',
                       data: iso, responsavel: '', recepcao: '', indicacao: '', avaliacao: '' });
  indBusca = ''; indFiltroAval = '';
  const b = $('#indBusca'); if (b) b.value = '';
  salvarLocal(); indRender();
  const p = $('#indCorpo .ind-forte');
  if (p) { p.focus(); p.scrollIntoView({ block: 'center' }); }
}

function indCsv() {
  const lista = indLista();
  if (!lista.length) { toast('Nenhum indicado para baixar', 'ruim'); return; }
  const escapa = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const txt = '﻿' + IND_COLUNAS.map(c => escapa(c.r)).join(';') + '\n' +
    lista.map(i => IND_COLUNAS.map(c =>
      escapa(c.k === 'pos' ? (i.pos ? sig(i.pos) : '') : (i[c.k] || ''))).join(';')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
  a.download = 'indicados-' + String(estado.nome || 'grupo').replace(/[^\w\s-]/g, '') + '.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast(lista.length + ' indicados baixados', 'bom');
}

/* ================= aba Análise Série B =================
   O estudo do acesso morando dentro do app, ao lado do campograma. A razão de ficar aqui
   e nao num documento a parte: a pergunta "quantos pontos precisamos" e a pergunta "que
   elenco montamos" sao a mesma conversa, e trocar de janela no meio dela e o jeito mais
   rapido de uma das duas ser esquecida.

   As TABELAS sao dado bruto transcrito das classificacoes finais, e ficam aqui em cima,
   onde da para conferir. Tudo o que o estudo afirma sai delas por conta, nada e numero
   digitado a mao no meio do texto — se uma tabela for corrigida, o estudo se corrige. */
const SB_TABELAS = {
  2022: [[1,'Cruzeiro',38,23,9,6,57,26],[2,'Grêmio',38,17,14,7,50,26],[3,'Bahia',38,17,11,10,43,29],
    [4,'Vasco',38,17,11,10,48,36],[5,'Sampaio Corrêa',38,16,10,12,48,42],[6,'Ituano',38,15,12,11,42,34],
    [7,'Sport',38,15,12,11,37,31],[8,'Criciúma',38,14,14,10,43,31],[9,'Londrina',38,14,11,13,36,37],
    [10,'Guarani',38,13,12,13,33,36],[11,'CRB',38,13,11,14,35,43],[12,'Ponte Preta',38,12,13,13,34,36],
    [13,'Vila Nova',38,9,20,9,28,31],[14,'Chapecoense',38,11,12,15,37,39],[15,'Tombense',38,10,15,13,38,47],
    [16,'Novorizontino',38,11,11,16,44,49],[17,'CSA',38,9,15,14,29,37],[18,'Brusque',38,8,10,20,21,38],
    [19,'Operário-PR',38,7,13,18,31,53],[20,'Náutico',38,8,6,24,32,65]],
  2023: [[1,'Vitória',38,22,6,10,50,31],[2,'Juventude',38,18,11,9,42,31],[3,'Criciúma',38,19,7,12,45,33],
    [4,'Atlético-GO',38,17,13,8,56,45],[5,'Novorizontino',38,19,6,13,48,30],[6,'Mirassol',38,18,9,11,42,31],
    [7,'Sport',38,17,12,9,59,40],[8,'Vila Nova',38,17,10,11,49,30],[9,'CRB',38,16,9,13,45,39],
    [10,'Guarani',38,15,12,11,42,33],[11,'Ceará',38,13,11,14,40,45],[12,'Botafogo-SP',38,12,11,15,25,42],
    [13,'Avaí',38,10,14,14,31,48],[14,'Ituano',38,9,15,14,33,38],[15,'Ponte Preta',38,9,15,14,24,35],
    [16,'Chapecoense',38,9,13,16,38,43],[17,'Sampaio Corrêa',38,8,15,15,31,43],[18,'Tombense',38,9,10,19,37,50],
    [19,'Londrina',38,7,10,21,31,58],[20,'ABC',38,5,13,20,28,51]],
  2024: [[1,'Santos',38,20,8,10,57,32],[2,'Mirassol',38,19,10,9,42,26],[3,'Sport',38,19,9,10,57,37],
    [4,'Ceará',38,19,7,12,59,41],[5,'Novorizontino',38,18,10,10,43,31],[6,'Goiás',38,18,9,11,56,32],
    [7,'Operário-PR',38,16,10,12,34,32],[8,'América-MG',38,15,13,10,50,35],[9,'Vila Nova',38,16,7,15,42,54],
    [10,'Avaí',38,14,11,13,34,32],[11,'Amazonas',38,14,10,14,31,37],[12,'Coritiba',38,14,8,16,41,44],
    [13,'Paysandu',38,12,14,12,41,43],[14,'Botafogo-SP',38,11,12,15,36,51],[15,'Chapecoense',38,11,11,16,34,45],
    [16,'CRB',38,11,10,17,38,45],[17,'Ponte Preta',38,10,8,20,37,55],[18,'Ituano',38,11,4,23,43,63],
    [19,'Brusque',38,8,12,18,24,44],[20,'Guarani',38,8,9,21,33,53]],
  2025: [[1,'Coritiba',38,19,11,8,39,23],[2,'Athletico-PR',38,19,8,11,53,43],[3,'Chapecoense',38,18,8,12,52,35],
    [4,'Remo',38,16,14,8,51,39],[5,'Criciúma',38,17,10,11,47,33],[6,'Goiás',38,17,10,11,42,37],
    [7,'Novorizontino',38,15,15,8,43,32],[8,'CRB',38,16,8,14,45,40],[9,'Avaí',38,14,14,10,50,40],
    [10,'Cuiabá',38,14,12,12,43,44],[11,'Atlético-GO',38,13,13,12,39,38],[12,'Operário-PR',38,12,12,14,40,44],
    [13,'Vila Nova',38,11,14,13,40,44],[14,'América-MG',38,12,10,16,41,44],[15,'Athletic',38,12,8,18,43,53],
    [16,'Botafogo-SP',38,10,12,16,32,52],[17,'Ferroviária',38,8,16,14,43,52],[18,'Amazonas',38,8,12,18,38,55],
    [19,'Volta Redonda',38,8,12,18,26,43],[20,'Paysandu',38,5,13,20,36,52]],
  2026: [[1,'Juventude',27,14,8,5,30,15],[2,'Novorizontino',27,14,7,6,47,24],[3,'Vila Nova',27,14,5,8,39,30],
    [4,'Fortaleza',27,13,8,6,30,22],[5,'Criciúma',27,13,8,6,28,21],[6,'Operário-PR',27,12,7,8,36,33],
    [7,'Atlético-GO',27,11,10,6,32,26],[8,'CRB',27,12,6,9,40,39],[9,'Sport',27,10,11,6,36,26],
    [10,'Cuiabá',27,9,12,6,26,21],[11,'Náutico',27,10,7,10,32,30],[12,'Athletic',27,9,10,8,31,30],
    [13,'Goiás',27,10,6,11,25,33],[14,'São Bernardo',27,9,8,10,37,31],[15,'Botafogo-SP',27,8,7,12,30,32],
    [16,'Ceará',27,8,7,12,28,35],[17,'Avaí',27,8,5,14,28,35],[18,'Londrina',27,6,7,14,32,39],
    [19,'América-MG',27,4,5,18,21,46],[20,'Ponte Preta',27,2,4,21,16,56]],
};
const SB_COMPLETAS = [2022, 2023, 2024, 2025];   /* 2026 está em andamento: fica fora das médias */
let sbAno = 2026;

/* pos, clube, J, V, E, D, GP, GC  ->  objeto com pontos e saldo calculados */
function sbLinha(r) {
  const [pos, clube, j, v, e, d, gp, gc] = r;
  return { pos, clube, j, v, e, d, gp, gc, sg: gp - gc, pts: v * 3 + e };
}
function sbAnoDados(ano) { return SB_TABELAS[ano].map(sbLinha); }
const sbMedia = xs => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);

/* Correlação de Pearson. Existe aqui para responder "empate ajuda ou atrapalha?" com um
   número, em vez de com opinião. */
function sbCorr(xs, ys) {
  const mx = sbMedia(xs), my = sbMedia(ys);
  let num = 0, dx = 0, dy = 0;
  xs.forEach((x, i) => { const a = x - mx, b = ys[i] - my; num += a * b; dx += a * a; dy += b * b; });
  return (dx && dy) ? num / Math.sqrt(dx * dy) : 0;
}

function sbResumo() {
  const linha = [], quinto = [], sobem = [], quase = [], todos = [];
  SB_COMPLETAS.forEach(ano => {
    const t = sbAnoDados(ano);
    linha.push(t[3].pts); quinto.push(t[4].pts);
    sobem.push(...t.slice(0, 4)); quase.push(...t.slice(4, 8)); todos.push(...t);
  });
  const perfil = g => ({
    pts: sbMedia(g.map(x => x.pts)), v: sbMedia(g.map(x => x.v)), e: sbMedia(g.map(x => x.e)),
    d: sbMedia(g.map(x => x.d)), gp: sbMedia(g.map(x => x.gp)), gc: sbMedia(g.map(x => x.gc)),
    sg: sbMedia(g.map(x => x.sg)),
  });
  const pts = todos.map(x => x.pts);
  return {
    linha, quinto, folgas: linha.map((x, i) => x - quinto[i]),
    mediaLinha: sbMedia(linha), mediaFolga: sbMedia(linha.map((x, i) => x - quinto[i])),
    sobe: perfil(sobem), quase: perfil(quase),
    maxDerrotas: Math.max(...sobem.map(x => x.d)),
    corr: {
      v: sbCorr(todos.map(x => x.v), pts), e: sbCorr(todos.map(x => x.e), pts),
      d: sbCorr(todos.map(x => x.d), pts), gp: sbCorr(todos.map(x => x.gp), pts),
      gc: sbCorr(todos.map(x => x.gc), pts),
    },
  };
}

function sbRender() {
  const alvo = $('#sbCorpo');
  if (!alvo) return;
  const R = sbResumo();
  const n1 = x => x.toFixed(1).replace('.', ',');
  const tab = sbAnoDados(sbAno);
  const emAndamento = sbAno === 2026;
  const RESTAM = 38 - tab[0].j, EM_JOGO = RESTAM * 3, META = Math.round(R.mediaLinha);

  const kpi = (rot, val, txt) =>
    '<div class="sb-kpi"><span class="sb-rot">' + rot + '</span><b>' + val + '</b><p>' + txt + '</p></div>';

  /* --- gráfico: 4º contra 5º, ano a ano --- */
  /* A escala começa em 54, e não no mínimo dos dados: o rótulo do 5º colocado é escrito à
     ESQUERDA do ponto, e com a escala apertada ele encostava no ano. Um pouco de folga no
     começo do eixo é mais barato que abreviar nome de clube. */
  const X0 = 54, X1 = 67, ESQ = 46, LARG = 430;
  const px = p => ESQ + (p - X0) / (X1 - X0) * LARG;
  const linhas = SB_COMPLETAS.map((ano, i) => {
    const t = sbAnoDados(ano), q = t[3], c = t[4], y = 30 + i * 42;
    const igual = q.pts === c.pts;
    return '<line x1="' + px(c.pts).toFixed(1) + '" y1="' + y + '" x2="' + px(q.pts).toFixed(1) + '" y2="' + y +
        '" stroke="var(--borda2)" stroke-width="2"/>' +
      (igual
        ? '<circle cx="' + px(q.pts).toFixed(1) + '" cy="' + y + '" r="8" fill="var(--sb-sobe)"/>' +
          '<circle cx="' + px(q.pts).toFixed(1) + '" cy="' + y + '" r="5.5" fill="none" stroke="var(--fundo2)" stroke-width="2"/>' +
          '<circle cx="' + px(q.pts).toFixed(1) + '" cy="' + y + '" r="4" fill="var(--sb-fica)"/>'
        : '<circle cx="' + px(c.pts).toFixed(1) + '" cy="' + y + '" r="6" fill="var(--sb-fica)"/>' +
          '<circle cx="' + px(q.pts).toFixed(1) + '" cy="' + y + '" r="6" fill="var(--sb-sobe)"/>') +
      '<text x="32" y="' + (y + 4) + '" text-anchor="end" class="sb-ano">' + ano + '</text>' +
      '<text x="' + (px(q.pts) + 12).toFixed(1) + '" y="' + (y + 4) + '" class="sb-lab forte">' +
        esc(q.clube) + ' · ' + q.pts + '</text>' +
      (igual ? '<text x="' + (px(q.pts) - 14).toFixed(1) + '" y="' + (y + 4) +
                 '" text-anchor="end" class="sb-lab menor">empatado com ' + esc(c.clube) + '</text>'
             : '<text x="' + (px(c.pts) - 12).toFixed(1) + '" y="' + (y + 4) +
                 '" text-anchor="end" class="sb-lab">' + c.pts + ' · ' + esc(c.clube) + '</text>');
  }).join('');
  const eixo = [56, 58, 60, 62, 64, 66].map(p =>
    '<line x1="' + px(p).toFixed(1) + '" y1="14" x2="' + px(p).toFixed(1) + '" y2="186" stroke="var(--borda)"/>' +
    '<text x="' + px(p).toFixed(1) + '" y="202" text-anchor="middle" class="sb-eixo">' + p + '</text>').join('');

  /* --- gráfico: a temporada escolhida --- */
  const maxPts = Math.max(...tab.map(x => x.pts));
  const BARRA = 460, ROT = 108;
  const bw = p => (p / maxPts * BARRA);
  const metaX = emAndamento ? ROT + bw(META * tab[0].j / 38) : ROT + bw(META);
  const barras = tab.map((x, i) => {
    const y = 8 + i * 21, dentro = x.pos <= 4;
    return '<rect x="' + ROT + '" y="' + y + '" width="' + bw(x.pts).toFixed(1) + '" height="14" rx="4" fill="var(--' +
        (dentro ? 'sb-sobe' : x.pos <= 8 ? 'sb-fica' : 'sb-neutro') + ')"/>' +
      '<text x="' + (ROT - 8) + '" y="' + (y + 11) + '" text-anchor="end" class="sb-clube' + (dentro ? ' forte' : '') + '">' +
        x.pos + '. ' + esc(x.clube) + '</text>' +
      '<text x="' + (ROT + bw(x.pts) - 7).toFixed(1) + '" y="' + (y + 11) + '" text-anchor="end" class="sb-valor">' +
        x.pts + '</text>';
  }).join('');

  alvo.innerHTML =
    '<div class="sb-topo">' +
      '<div><span class="sb-rot">Série B · estudo de acesso</span>' +
      '<h2 class="sb-h1">A linha do acesso</h2>' +
      '<p class="sb-sub">Quantos pontos levam ao G4, que campanha os produz, e a margem entre subir e ficar. ' +
      'Tabelas finais de 2022 a 2025 e a parcial de 2026.</p></div>' +
    '</div>' +

    '<div class="sb-kpis">' +
      kpi('A linha, em média', META, 'pontos do 4º colocado. Variou pouco: <b>' + R.linha.join(', ') + '</b>.') +
      kpi('A folga', n1(R.mediaFolga), 'ponto separando quem subiu de quem ficou em 5º: <b>' + R.folgas.join(', ') + '</b>.') +
      kpi('Aproveitamento', Math.round(R.mediaLinha / 114 * 100) + '%', 'dos pontos disputados, ou <b>' +
        (R.mediaLinha / 38).toFixed(2).replace('.', ',') + ' por jogo</b>.') +
    '</div>' +

    '<div class="sb-bloco">' +
      '<span class="sb-rot">4º contra 5º, ano a ano</span>' +
      '<div class="sb-tela"><svg viewBox="0 0 640 212" class="sb-svg">' + eixo + linhas +
        '<text x="' + (ESQ + LARG / 2) + '" y="212" text-anchor="middle" class="sb-eixo">PONTOS EM 38 JOGOS</text>' +
      '</svg></div>' +
      '<div class="sb-leg"><span><i style="background:var(--sb-sobe)"></i>4º — subiu</span>' +
      '<span><i style="background:var(--sb-fica)"></i>5º — ficou</span></div>' +
      '<p class="sb-nota">Em 2024 os dois terminaram com 64. O acesso saiu no primeiro critério de desempate, ' +
      'o número de vitórias: 19 do Ceará contra 18 do Novorizontino.</p>' +
    '</div>' +

    '<div class="sb-bloco">' +
      '<span class="sb-rot">Vitória vale, empate quase não</span>' +
      '<div class="sb-corr">' +
        [['Vitórias', R.corr.v], ['Gols pró', R.corr.gp], ['Empates', R.corr.e],
         ['Gols contra', R.corr.gc], ['Derrotas', R.corr.d]].map(([rot, c]) =>
          '<div class="sb-c"><span>' + rot + '</span>' +
          '<div class="sb-c-reg"><i class="' + (c >= 0 ? 'pos' : 'neg') + '" style="width:' +
            (Math.abs(c) * 50).toFixed(1) + '%"></i></div>' +
          '<b class="' + (c >= 0 ? 'pos' : 'neg') + '">' + (c >= 0 ? '+' : '−') +
            Math.abs(c).toFixed(2).replace('.', ',') + '</b></div>').join('') +
      '</div>' +
      '<p class="sb-nota">Correlação de cada item com a pontuação final, nos 80 clubes das quatro temporadas ' +
      'completas. Vitória explica quase tudo; empate anda para o lado errado. Nenhum dos 16 que subiram ' +
      'perdeu mais de <b>' + R.maxDerrotas + '</b> jogos em 38.</p>' +
    '</div>' +

    '<div class="sb-bloco">' +
      '<span class="sb-rot">Quem sobe contra quem fica no 5º ao 8º</span>' +
      '<div class="sb-perfil">' +
        ['pts:Pontos', 'v:Vitórias', 'e:Empates', 'd:Derrotas', 'gp:Gols pró', 'gc:Gols contra', 'sg:Saldo']
        .map(par => { const [k, rot] = par.split(':');
          const a = R.sobe[k], b = R.quase[k], dif = a - b;
          return '<div class="sb-p"><span class="sb-p-rot">' + rot + '</span>' +
            '<b class="sb-p-a">' + n1(a) + '</b><span class="sb-p-b">' + n1(b) + '</span>' +
            '<span class="sb-p-d ' + (Math.abs(dif) < 1 ? 'nulo' : dif > 0 ? 'pos' : 'neg') + '">' +
              (dif > 0 ? '+' : '−') + n1(Math.abs(dif)) + '</span></div>'; }).join('') +
      '</div>' +
      '<p class="sb-nota">Médias dos 16 clubes de cada faixa. A coluna cheia é quem sobe, a apagada é quem fica. ' +
      '<b>A defesa é igual</b> — meio gol de diferença em 38 jogos. A separação inteira está no ataque, ' +
      'quase cinco gols. Numa liga em que todos defendem parecido, é o ataque que compra vitória.</p>' +
    '</div>' +

    '<div class="sb-bloco">' +
      '<div class="sb-cab-ano"><span class="sb-rot">A temporada de ' + sbAno +
        (emAndamento ? ' · ' + tab[0].j + ' de 38 rodadas' : '') + '</span>' +
        '<div class="sb-anos">' + Object.keys(SB_TABELAS).sort().reverse().map(a =>
          '<button class="sb-bt' + (+a === sbAno ? ' on' : '') + '" data-ano="' + a + '">' + a + '</button>').join('') +
        '</div></div>' +
      '<div class="sb-tela"><svg viewBox="0 0 640 ' + (8 + tab.length * 21 + 22) + '" class="sb-svg">' +
        '<line x1="' + metaX.toFixed(1) + '" y1="2" x2="' + metaX.toFixed(1) + '" y2="' + (8 + tab.length * 21) +
          '" stroke="var(--coral)" stroke-width="2" stroke-dasharray="5 4"/>' +
        '<text x="' + (metaX + 6).toFixed(1) + '" y="' + (8 + tab.length * 21 + 14) + '" class="sb-meta">' +
          (emAndamento ? 'ritmo do acesso' : 'linha do acesso · ' + META) + '</text>' +
        barras +
      '</svg></div>' +
      (emAndamento
        ? '<p class="sb-nota">Faltam <b>' + RESTAM + ' rodadas</b>, ' + EM_JOGO + ' pontos em jogo. Para chegar aos ' +
          META + ' da média histórica, o 4º precisa de <b>' + (META - tab[3].pts) + '</b> deles e o 8º de <b>' +
          (META - tab[7].pts) + '</b>. O ritmo atual do 4º projeta <b>' +
          Math.round(tab[3].pts / tab[0].j * 38) + ' pontos</b> em 38 jogos.</p>'
        : '<p class="sb-nota">Linha tracejada: os ' + META + ' pontos da média histórica do 4º colocado.</p>') +
    '</div>' +

    '<div class="sb-bloco sb-falta">' +
      '<h3>O que este estudo ainda não responde</h3>' +
      '<p>Tabela mostra resultado, não causa. Para ligar isto ao planejamento do elenco faltam três dados, ' +
      'em ordem de importância:</p>' +
      '<ol><li><b>Folha salarial dos clubes que subiram.</b> Sem custo, toda conclusão vira “contrate melhor”.</li>' +
      '<li><b>Quantos jogadores cada um usou</b>, e como os minutos se concentraram.</li>' +
      '<li><b>Trocas de treinador</b> durante a temporada.</li></ol>' +
      '<p>E a ressalva do tamanho: quatro temporadas são 16 clubes que subiram. Basta para afirmar que a linha ' +
      'fica entre ' + Math.min(...R.linha) + ' e ' + Math.max(...R.linha) + ' e que empate custa caro, porque os ' +
      'dois padrões se repetem todo ano. Não basta para virar meta de contratação. É direção, não receita.</p>' +
    '</div>';

  alvo.querySelectorAll('.sb-bt').forEach(b => {
    b.onclick = () => { sbAno = +b.dataset.ano; sbRender(); };
  });
}
