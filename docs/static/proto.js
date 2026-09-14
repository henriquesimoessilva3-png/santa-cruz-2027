/* ================= aba Protótipo — a casca =================

   Esta aba mostra a CONSTRUÇÃO, não só o fim: dezesseis etapas, da contagem da amostra
   até o elenco proposto, na ordem em que foram feitas. O dono pediu assim porque um número
   final sem o caminho não dá para auditar, e aqui quase tudo que foi testado não passou.

   A regra é a mesma da aba Série B: **o dado é a fonte, o texto é consequência.** Nada
   nesta aba é digitado: todo número sai do `PROTO`, que é cópia integral do
   `dados/prototipo.json`. Onde o dado não existe, a tela ESCREVE a ausência e o motivo —
   `ptFalta()` existe exatamente para isso, e um "—" pelado é considerado defeito.

   Este arquivo tem três responsabilidades e nenhuma a mais:
     1. montar o esqueleto (tarja de conferência, controles obrigatórios, sumário, os
        dezesseis lugares de etapa);
     2. chamar `ptEtapa0()`..`ptEtapa15()` — que moram em proto_a.js, proto_b.js e
        proto_c.js — e sobreviver quando alguma delas ainda não existir;
     3. oferecer os helpers compartilhados, para que três arquivos escritos por mãos
        diferentes não inventem três formatos de número diferentes.

   O contrato com esses três arquivos está em static/proto_contrato.md. Se algo aqui mudar
   de assinatura, muda lá junto — é o único documento que eles leem.

   Por que a tela não quebra quando falta uma etapa: os arquivos de etapa chegam depois
   desta casca e podem chegar quebrados. Uma aba que dá tela branca porque um dos quatro
   arquivos tem erro de sintaxe esconde o problema; esta aqui desenha o lugar da etapa
   que faltou, diz qual arquivo devia defini-la e lista as chaves do `PROTO` que estão
   esperando por ela. A ausência é informação, e vai para a tela como tal.

   DESDE 14/09: A CASCA DESENHA O DADO QUE RECEBE, NÃO O `PROTO`.
   A aba nova por faixa de aproveitamento (global `PONTOS`) reusa estas mesmas dezesseis etapas.
   Com as duas abas na mesma página, ler `PROTO` direto fazia a segunda aba desenhar os números
   da primeira sem erro nenhum, e os ids `ptEt-N` repetidos faziam o sumário de uma rolar a
   outra. Por isso: `ptRender(cfg)` recebe o dado, o alvo e o prefixo de id; cada aba tem o seu
   estado (dado, escala, etapas que usam a escala); e quem precisa do dado pergunta `ptDado()`.
   `ptRender()` sem argumento continua sendo a aba Protótipo, do jeito que o app.js já chama. */
'use strict';

/* ================= o dado ativo e o estado de cada aba =================

   Uma aba = um prefixo de id (`ptEt` na Protótipo). O estado mora em PT_ABAS[prefixo] e é
   refeito a cada ptRender daquela aba — nada de um render sobrar no outro.

   "Ativa" é a aba que está desenhando agora OU a última em que a pessoa clicou/focou. Os
   arquivos de etapa redesenham pedaços depois do render (filtro, troca de painel), e nessa
   hora não há ninguém passando o dado adiante: o gancho de pointerdown/focusin no documento
   ativa a aba certa ANTES do handler da etapa rodar, e `ptDado()` responde por ela. Quem tem
   um elemento na mão pode ser explícito: `ptDado(elemento)` sobe até a aba daquele elemento. */
const PT_ABAS = {};
let PT_ATIVA = null;
let PT_DADO_ANTERIOR = null;
const PT_AO_TROCAR = [];

function ptAbaDe(el) {
  let n = el && el.nodeType ? el : null;
  while (n && n !== document) {
    if (n.dataset && n.dataset.ptAba && PT_ABAS[n.dataset.ptAba]) return PT_ABAS[n.dataset.ptAba];
    n = n.parentNode;
  }
  return null;
}
function ptAba(el) {
  return (el && ptAbaDe(el)) || PT_ATIVA;
}
/* O dado da aba ativa (ou da aba do elemento). Sem aba nenhuma desenhada ainda, cai no PROTO —
   é o caso de um helper chamado antes do primeiro render, e a aba Protótipo sempre foi essa. */
function ptDado(el) {
  const a = ptAba(el);
  if (a) return a.dado;
  return typeof PROTO !== 'undefined' ? PROTO : null;
}
function ptPrefixo(el) {
  const a = ptAba(el);
  return a ? a.prefixo : 'ptEt';
}
/* Id único na página: `ptId('2-tab')` → `ptEt-2-tab` na Protótipo e `<prefixo>-2-tab` na outra. */
function ptId(sufixo, el) {
  return ptPrefixo(el) + '-' + sufixo;
}
/* Gancho para os caches de módulo dos arquivos de etapa (PB_NOMES, PC.catalogo, PC.clubes…):
   `fn(dadoNovo, dadoAnterior)` roda sempre que o dado ativo muda de objeto — no começo de cada
   render e quando a pessoa passa de uma aba para a outra. Cache que não se registra aqui mostra
   na aba de pontos os nomes calculados com o Protótipo, calado. */
function ptAoTrocarDado(fn) {
  if (typeof fn === 'function' && PT_AO_TROCAR.indexOf(fn) < 0) PT_AO_TROCAR.push(fn);
}
/* Redesenho FORA de evento de usuário (timer, requestAnimationFrame, IntersectionObserver): com duas
   abas na página, ptTabela, ptNomeIndicador, ptSorte e o registro da escala usariam a última aba
   ativa, não a do elemento. `ptComAba(alvo, fn)` ativa a aba do alvo, roda e devolve a anterior. */
function ptComAba(el, fn) {
  const a = ptAbaDe(el);
  const antes = PT_ATIVA;
  if (a && a !== PT_ATIVA) ptAtivarAba(a.prefixo);
  try { return fn(); } finally { if (antes && antes !== PT_ATIVA) ptAtivarAba(antes.prefixo); }
}
function ptAtivarAba(prefixo) {
  const a = PT_ABAS[prefixo];
  if (!a) return;
  PT_ATIVA = a;
  if (a.dado !== PT_DADO_ANTERIOR) {
    const antes = PT_DADO_ANTERIOR;
    PT_DADO_ANTERIOR = a.dado;
    PT_AO_TROCAR.forEach(fn => {
      try { fn(a.dado, antes); } catch (err) { console.error('[prototipo] ptAoTrocarDado falhou', err); }
    });
  }
}
/* Os ganchos de documento entram uma vez só, no primeiro render. Capture: a aba precisa estar
   ativa antes do onclick/oninput da etapa, que roda na fase de borbulha. */
let PT_GANCHOS = false;
function ptLigarGanchos() {
  if (PT_GANCHOS) return;
  PT_GANCHOS = true;
  const ativa = ev => { const a = ptAbaDe(ev.target); if (a) ptAtivarAba(a.prefixo); };
  document.addEventListener('pointerdown', ativa, true);
  document.addEventListener('focusin', ativa, true);
  document.addEventListener('keydown', ativa, true);
  /* links para etapa (conclusões, atalhos): funcionam de dentro da aba e de fora dela */
  document.addEventListener('click', ev => {
    const el = ev.target && ev.target.closest ? ev.target.closest('[data-pt-ir]') : null;
    if (!el) return;
    ev.preventDefault();
    ptIrParaEtapa(Number(el.dataset.ptIr), el.dataset.ptPrefixo || ptPrefixo(el));
  });
}

/* ---------------- o vocabulário de faixa ----------------

   A Protótipo separa os times por DESFECHO (sobe · meio · cai); a aba de pontos, por FAIXA DE
   APROVEITAMENTO (alta · media · baixa). As chaves do JSON mudam junto (`m_sobe` → `m_alta`,
   `d_bruto_SM` → `d_bruto_AM`), e o texto também. Sem um lugar só para isso, cada arquivo de
   etapa inventaria o seu, e a aba de pontos imprimiria "—" calada em ~200 leituras.

   A regra sai do dado: `faixas.chave_interna` diz qual faixa daqui é qual das três da
   Protótipo (alta ↔ sobe…); `faixas.rotulos` dá o texto. Dado sem bloco `faixas` é a Protótipo.
   Os códigos de comparação (SM, SC…) são as iniciais das faixas, em maiúscula: é a mesma troca
   que o gerador dos pontos faz (SM→AM, SC→AB, conferido em PONTOS.tela.mapa_de_caminhos). */
const PT_FX_PADRAO = {
  ordem: ['sobe', 'meio', 'cai'],
  rotulos: { sobe: 'quem subiu', meio: 'meio da tabela', cai: 'quem caiu' },
};
function ptFxMapa(dado) {
  const d = dado === undefined ? ptDado() : dado;
  const fx = d && d.faixas;
  const interna = fx && fx.chave_interna;
  const paraDado = { sobe: 'sobe', meio: 'meio', cai: 'cai' };
  const paraInterna = { sobe: 'sobe', meio: 'meio', cai: 'cai' };
  if (interna && typeof interna === 'object') {
    Object.keys(interna).forEach(k => {
      const v = interna[k];
      if (PT_FX_PADRAO.ordem.indexOf(v) >= 0) { paraDado[v] = k; paraInterna[k] = v; }
    });
  }
  return { paraDado, paraInterna, rotulos: (fx && fx.rotulos) || null, curtos: (fx && fx.rotulos_curtos) || null };
}
/* Nome da faixa no dado ativo. `ptFx('sobe')` → 'sobe' na Protótipo, 'alta' nos pontos.
   Aceita também o código de comparação: `ptFx('SM')` → 'SM' / 'AM'. Chave desconhecida volta
   como veio. */
function ptFx(chave, dado) {
  const m = ptFxMapa(dado);
  const k = String(chave);
  if (Object.prototype.hasOwnProperty.call(m.paraDado, k)) return m.paraDado[k];
  if (/^[SMC][SMCR]$/.test(k)) {
    const letra = c => c === 'R' ? 'R'
      : (m.paraDado[{ S: 'sobe', M: 'meio', C: 'cai' }[c]] || '').charAt(0).toUpperCase() || c;
    return letra(k[0]) + letra(k[1]);
  }
  return k;
}
/* Monta a chave do dado ativo: `ptK('m_', 'sobe')` → 'm_sobe' / 'm_alta';
   `ptK('eur_mediano_{sobe}_x_{cai}')` → troca cada {faixa} ou {SM}. */
function ptK(base, faixa, dado) {
  if (faixa !== undefined && faixa !== null && typeof faixa !== 'object') return String(base) + ptFx(faixa, dado);
  const d = faixa && typeof faixa === 'object' ? faixa : dado;
  return String(base).replace(/\{([A-Za-z]+)\}/g, (_, f) => ptFx(f, d));
}
/* O texto da faixa, em várias FORMAS, porque a frase pede formas diferentes: um cabeçalho quer
   o nome ("subiu"), uma frase quer o sujeito ("quem subiu") ou o verbo ("no ano seguinte, subiu").
   Uma forma só obrigava cada arquivo de etapa a remendar a sua, e a aba de pontos imprimia a
   DEFINIÇÃO da faixa (50 caracteres com o corte) no lugar do nome.

   Formas: 'padrao' (o que a Protótipo sempre disse) · 'quem' · 'verbo' · 'verbos' (plural) ·
   'times' · 'nome' (cabeçalho) · 'definicao'. Na Protótipo, as formas estão escritas aqui — são
   o desfecho real (subiu/caiu), que não muda. Num dado com `faixas`, o nome sai do dado, nesta
   ordem: `faixas.rotulos_formas[chave][forma]` → `faixas.rotulos_curtos[chave]` (usado como
   substantivo: "faixa alta") → a própria CHAVE que o gerador deu à faixa ('alta' → "faixa alta").
   A chave é nome gravado pelo gerador, não palavra inventada aqui; a definição com o número do
   corte (`faixas.rotulos`) só sai na forma 'definicao' — e vai no `title` de quem quiser. */
const PT_FX_FORMAS = {
  sobe: { padrao: 'quem subiu', quem: 'quem subiu', verbo: 'subiu', verbos: 'subiram',
          times: 'times que subiram', nome: 'subiu', definicao: 'quem subiu' },
  meio: { padrao: 'meio da tabela', quem: 'quem ficou no meio', verbo: 'ficou no meio da tabela',
          verbos: 'ficaram no meio da tabela', times: 'times do meio da tabela', nome: 'meio', definicao: 'meio da tabela' },
  cai:  { padrao: 'quem caiu', quem: 'quem caiu', verbo: 'caiu', verbos: 'caíram',
          times: 'times que caíram', nome: 'caiu', definicao: 'quem caiu' },
};
/* grafia da chave do gerador: 'media' é a palavra "média" sem acento, não outra palavra */
const PT_FX_GRAFIA = { media: 'média' };
function ptFxRot(faixa, opts, dado) {
  const o = opts || {};
  const forma = o.forma || (o.curto ? 'nome' : 'padrao');
  const m = ptFxMapa(dado);
  const k = String(faixa);
  const interna = m.paraInterna[k] || (PT_FX_PADRAO.ordem.indexOf(k) >= 0 ? k : null);
  if (!interna) return k;
  const d = dado === undefined ? ptDado() : dado;
  if (!(d && d.faixas)) return ptDesfechoRot(interna, forma);
  const noDado = m.paraDado[interna];
  const fx = d.faixas;
  const pronta = fx.rotulos_formas && fx.rotulos_formas[noDado] && fx.rotulos_formas[noDado][forma];
  if (pronta) return String(pronta);
  if (forma === 'definicao') {
    return m.rotulos && m.rotulos[noDado] ? String(m.rotulos[noDado]) : ptFxRot(faixa, { forma: 'nome' }, d);
  }
  const nome = m.curtos && m.curtos[noDado] ? String(m.curtos[noDado])
    : 'faixa ' + (PT_FX_GRAFIA[noDado] || String(noDado).replace(/_/g, ' '));
  return forma === 'quem' ? 'quem ficou na ' + nome
    : forma === 'verbo' ? 'ficou na ' + nome
    : forma === 'verbos' ? 'ficaram na ' + nome
    : forma === 'times' ? 'times da ' + nome
    : nome;
}
/* O DESFECHO REAL, que não é faixa. Na aba de pontos, `subiu_de_fato` e `faixa_posicao_t1` ainda
   falam de quem subiu e de quem caiu de verdade: passar isso por ptFxRot trocaria "subiu de fato"
   por "faixa alta", que é outra coisa. Esta função ignora `faixas` sempre. */
function ptDesfechoRot(faixa, forma) {
  const f = PT_FX_FORMAS[String(faixa)];
  if (!f) return String(faixa);
  return f[forma || 'padrao'] || f.padrao;
}
/* As três faixas na ordem de leitura (de cima para baixo), com o nome no dado e o texto
   (`rot` = forma padrão, `nome` = forma curta de cabeçalho, `definicao` = com o corte). */
function ptFxLista(dado) {
  return PT_FX_PADRAO.ordem.map(i => ({ interna: i, chave: ptFx(i, dado), rot: ptFxRot(i, null, dado),
    nome: ptFxRot(i, { forma: 'nome' }, dado), definicao: ptFxRot(i, { forma: 'definicao' }, dado) }));
}

/* ---------------- caminhos renomeados ----------------

   O gerador dos pontos renomeou chaves À MÃO (`top4_de_valor` → `top_k_de_valor`,
   `quartis[].subiram` → `quartis[].na_alta`) e guardou o mapa no próprio dado
   (`tela.mapa_de_caminhos.mapa`, uma entrada {prototipo, aqui, troca, nota} por caminho).
   A casca lê esse mapa num lugar só, para os donos das etapas não inventarem cada um a sua tradução.

   - `ptCaminho(c)`: o caminho no dado ativo. Tenta a entrada exata; senão o PREFIXO mais longo que
     casar, e anexa o resto (`etapa_1.top4_de_valor.por_ano` → `etapa_1.top_k_de_valor.por_ano`).
     Índice de lista vale: `quartis[2].subiram` casa com a entrada `quartis[].subiram`.
   - `ptLer(c)`: o valor, pelo caminho traduzido; entende `lista[3]`. Com `[]` sem número, undefined.
   - `ptCampo(lista, campo)`: o NOME do campo de item de lista (ou de objeto) no dado ativo —
     `ptCampo('etapa_1.quartis', 'subiram')` → 'subiram' / 'na_alta'. Com `lista` = '*' procura em
     qualquer caminho, e só devolve se todas as entradas concordarem.
   - `ptRemovida(c)`: se a chave foi REMOVIDA nesta aba (`aqui: null` no mapa), {motivo} para o
     ptFalta; senão null. Chave removida nunca vira ausência muda. */
const PT_MAPA_IDX = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
function ptMapaIdx(d) {
  const mapa = d && d.tela && d.tela.mapa_de_caminhos && d.tela.mapa_de_caminhos.mapa;
  if (!Array.isArray(mapa)) return null;
  if (PT_MAPA_IDX && PT_MAPA_IDX.has(d)) return PT_MAPA_IDX.get(d);
  const idx = {};
  mapa.forEach(x => { if (x && typeof x.prototipo === 'string' && !(x.prototipo in idx)) idx[x.prototipo] = x; });
  if (PT_MAPA_IDX) PT_MAPA_IDX.set(d, idx);
  return idx;
}
/* a entrada do mapa que responde por este caminho (exata ou pelo prefixo mais longo) */
function ptMapaEntrada(caminho, d) {
  const idx = ptMapaIdx(d);
  const cru = String(caminho);
  if (!idx) return null;
  const molde = cru.replace(/\[\d+\]/g, '[]');
  const partes = molde.split('.');
  for (let i = partes.length; i > 0; i--) {
    const pre = partes.slice(0, i).join('.');
    if (idx[pre]) return { e: idx[pre], resto: partes.slice(i).join('.'), molde: molde };
    /* 'quartis[]' e 'quartis' respondem pelo mesmo prefixo */
    const semLista = pre.replace(/\[\]$/, '');
    if (semLista !== pre && idx[semLista] && idx[semLista].aqui) {
      return { e: { aqui: idx[semLista].aqui + '[]', prototipo: pre }, resto: partes.slice(i).join('.'), molde: molde };
    }
  }
  return null;
}
function ptCaminho(caminho, dado) {
  const d = dado === undefined ? ptDado() : dado;
  const cru = String(caminho);
  const m = ptMapaEntrada(cru, d);
  if (!m || !m.e.aqui) return cru;
  let novo = m.e.aqui + (m.resto ? '.' + m.resto : '');
  /* devolve os índices que vieram no caminho, na ordem */
  const nums = cru.match(/\[\d+\]/g) || [];
  if (nums.length && (novo.match(/\[\]/g) || []).length === nums.length) {
    let i = 0;
    novo = novo.replace(/\[\]/g, () => nums[i++]);
  }
  return novo;
}
function ptRemovida(caminho, dado) {
  const d = dado === undefined ? ptDado() : dado;
  const m = ptMapaEntrada(String(caminho), d);
  if (!m || m.e.aqui) return null;
  const arq = ptArquivoDado();
  return { motivo: 'não existe no ' + arq + (m.e.nota ? ': ' + m.e.nota : m.e.motivo ? ': ' + m.e.motivo : ''),
    caminho: m.e.prototipo };
}
function ptLer(caminho, dado) {
  const d = dado === undefined ? ptDado() : dado;
  if (ptRemovida(caminho, d)) return undefined;
  return String(ptCaminho(caminho, d)).split('.').reduce((o, k) => {
    if (o === null || o === undefined) return undefined;
    const mm = /^(.*?)((?:\[\d*\])+)$/.exec(k);
    if (!mm) return o[k];
    let v = mm[1] ? o[mm[1]] : o;
    const ids = mm[2].match(/\[(\d*)\]/g);
    for (let i = 0; i < ids.length; i++) {
      const n = ids[i].slice(1, -1);
      if (n === '' || v === null || v === undefined) return undefined;
      v = v[Number(n)];
    }
    return v;
  }, d);
}
function ptCampo(lista, campo, dado) {
  const d = dado === undefined ? ptDado() : dado;
  const c = String(campo);
  const idx = ptMapaIdx(d);
  if (!idx) return c;
  const ultimo = s => String(s).split('.').pop().replace(/\[\]$/, '');
  if (lista === '*' || lista === null || lista === undefined) {
    const achados = Object.keys(idx).filter(k => ultimo(k) === c && idx[k].aqui).map(k => ultimo(idx[k].aqui));
    const unicos = achados.filter((v, i) => achados.indexOf(v) === i);
    return unicos.length === 1 ? unicos[0] : c;
  }
  for (const cand of [lista + '[].' + c, lista + '.' + c]) {
    const m = ptMapaEntrada(cand, d);
    if (m && m.e.aqui && !m.resto) return ultimo(m.e.aqui);
  }
  return c;
}

/* A ordem, o nome e o dono de cada etapa. É daqui que saem o sumário, os cabeçalhos e o
   aviso de etapa faltante — os três lendo a mesma lista, para que não exista sumário
   apontando para etapa que não existe. Os títulos vêm da seção 10 da ESPECIFICACAO.md;
   nenhum deles carrega número, porque número em título seria número escrito à mão. */
const PT_ETAPAS = [
  [0,  'O que está sendo medido',          'quantos times entram no estudo, e o que dá para concluir com esse tanto', 'proto_a.js'],
  [1,  'Quanto o dinheiro já explica',     'antes de olhar o jogo: o valor do elenco, sozinho, já separa quem sobe?', 'proto_a.js'],
  [2,  'Tudo o que foi medido',            'um indicador por linha — clique no nome da coluna para ordenar', 'proto_a.js'],
  [3,  'Quanto disso pode ser sorte',      'quando se testa muita coisa, alguma dá certo por acaso: quantas sobram descontada essa sorte', 'proto_a.js'],
  [4,  'Dá para confiar na medida?',       'a medida dá o mesmo resultado se for medida duas vezes no mesmo ano?', 'proto_a.js'],
  [5,  'Cada time, cada ano',              'a posição de cada time no ranking daquele ano — e o aviso escrito onde falta dado de jogador', 'proto_b.js'],
  [6,  'Isso se repete?',                  'a posição no ranking de um ano contra a posição no ano seguinte', 'proto_b.js'],
  [7,  'Veio antes ou veio depois?',       'foi o que o time fez, ou é o que acontece com quem já está subindo?', 'proto_b.js'],
  /* 8 e 10: título e subtítulo são texto fixo, que nenhum campo do dado controla — então só podem
     dizer do que a etapa trata, nunca o resultado dela. "Os padrões que não pararam de pé" e "não
     contrate para isto" afirmavam o resultado (e a etapa 10 tem também linhas que separam mas não se
     repetem, que não são "o resultado dito de outro jeito"). Quem diz o resultado é a própria etapa. */
  [8,  'Os padrões de jogo, testados',     'os times se separam em grupos de estilo? o que o teste mostrou, grupo por grupo', 'proto_b.js'],
  [9,  'As réguas',                        'as medidas que resumem o jogo, e cada item com a sua própria chance de ser sorte', 'proto_c.js'],
  [10, 'Causa ou consequência',            'o que separa os times, mas não passou em todas as provas — e o motivo de cada um', 'proto_c.js'],
  [11, 'O que o jogador leva na mala',     'o que o jogador leva quando muda de clube, e o que era do time anterior', 'proto_c.js'],
  [12, 'O funil dos jogadores livres',     'do arquivo inteiro até os jogadores que dá para avaliar, degrau por degrau', 'proto_c.js'],
  [13, 'A nota de encaixe',                'os três pedaços da nota, quanto dado físico cada jogador tem, e como a nota teria ido no passado', 'proto_c.js'],
  [14, 'O elenco como faixa',              'os nomes que mais aparecem quando a conta é refeita muitas vezes, e quanto o elenco custaria', 'proto_c.js'],
  [15, 'Treinador: o que não dá',          'por que não dá, o que se tentou medir no lugar e que coleta resolveria', 'proto_c.js'],
];

/* ---------------- helpers de número ----------------

   Todos os números da aba passam por aqui. Não é preciosismo: pt-BR usa vírgula decimal e
   ponto de milhar, e `toFixed` devolve o contrário dos dois. Uma tabela com metade dos
   números em cada convenção é uma tabela em que o leitor não confia.

   O sinal negativo é o MENOS tipográfico (U+2212), não o hífen: em fonte tabular o hífen
   fica curto demais e some na coluna de d de Cohen, que é justamente onde o sinal decide
   o que a linha diz. */
function ptNum(v, casas) {
  if (v === null || v === undefined || (typeof v === 'number' && !isFinite(v))) return '—';
  const n = Number(v);
  if (!isFinite(n)) return esc(String(v));
  const c = casas === undefined ? 2 : casas;
  /* "−0" e "−0,00" não são número nenhum: são um negativo pequeno que o arredondamento zerou, e o
     sinal que sobra diz ao leitor que algo caiu quando nada caiu. Arredondou para zero, sai sem sinal. */
  const txt = n.toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
  return (/^-0(,0*)?$/.test(txt) ? txt.slice(1) : txt).replace('-', '−');
}
function ptInt(v) { return ptNum(v, 0); }
function ptPct(v, casas) {
  if (v === null || v === undefined) return '—';
  return ptNum(v, casas === undefined ? 1 : casas) + '%';
}
/* Valor de mercado em euro. A base guarda o número cheio; a tela mostra a ordem de
   grandeza, porque nenhuma decisão muda entre € 29,74 mi e € 29,8 mi — e o número cheio
   ainda vai no `title`, para quem quiser conferir. */
function ptEur(v) {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  const txt = Math.abs(n) >= 1e6 ? '€ ' + ptNum(n / 1e6, 1) + ' mi'
    : Math.abs(n) >= 1e3 ? '€ ' + ptNum(n / 1e3, 0) + ' mil'
    : '€ ' + ptNum(n, 0);
  return '<span title="' + esc(n.toLocaleString('pt-BR')) + ' €">' + txt + '</span>';
}
/* p-valor COM o rótulo, porque o rótulo muda com o valor: abaixo do menor valor que as
   réplicas conseguem distinguir não existe "p = 0", existe "p < 0,001". Escrever "p =
   0,000" seria afirmar certeza que 2.000 réplicas não dão. `ptPv` é a mesma coisa sem o
   "p", para célula de tabela cuja coluna já se chama p. */
function ptP(p) { return p === null || p === undefined ? '—' : (p < 0.001 ? 'p < 0,001' : 'p = ' + ptNum(p, 3)); }
function ptPv(p) { return p === null || p === undefined ? '—' : (p < 0.001 ? '< 0,001' : ptNum(p, 3)); }
/* d de Cohen SEMPRE com sinal explícito, inclusive o positivo: aqui o sinal é metade da
   informação (quem sobe tem mais ou tem menos disto?) e um "+" na frente evita que o
   leitor precise lembrar qual é o lado de referência. */
function ptD(d) {
  if (d === null || d === undefined) return '—';
  const n = Number(d);
  return (n > 0 ? '+' : '') + ptNum(n, 3);
}
/* Ano NUNCA passa por ptInt: o separador de milhar transforma 2025 em "2.025", que não é
   ano nenhum. Vale para `ano`, `assert_ano_max`, `ano_t`, `ano_t1` e para qualquer coisa
   que seja identificador numérico em vez de quantidade. */
function ptAno(v) { return v === null || v === undefined ? '—' : String(v); }

/* ---------------- o vocabulário simples ----------------

   O dono pediu a aba em português de quem não estudou estatística. A tentação é trocar cada
   termo técnico por uma palavra bonita em cada etapa — e aí a etapa 2 diz "sólido" para o que a
   etapa 9 chama de "provável", e o leitor aprende que as palavras não querem dizer nada. Por
   isso a tradução mora AQUI, uma vez só, e toda etapa usa estas funções. Os cortes abaixo não
   são medida deste estudo: são convenção de leitura, declarada num lugar onde se pode discordar
   dela. O número técnico nunca some — vai ao lado, menor, em ptTecnico(), para quem quer conferir.

   E a regra que não se negocia: simplificar não é afirmar mais. "Pode ser sorte" continua
   aparecendo onde o dado diz que pode ser sorte. */

/* Tamanho da diferença (d de Cohen), nas faixas usuais 0,2 · 0,5 · 0,8. */
const PT_FAIXAS_D = [[0.8, 'grande'], [0.5, 'média'], [0.2, 'pequena'], [0, 'quase nenhuma']];
function ptTamanho(d) {
  if (d === null || d === undefined || isNaN(Number(d))) return 'sem medida';
  const a = Math.abs(Number(d));
  return PT_FAIXAS_D.find(f => a >= f[0])[1];
}

/* O p-valor dito do jeito certo. A versão popular errada é "3% de chance de ser sorte" — o p
   não é isso. O que ele diz é: se não houvesse diferença nenhuma, o acaso produziria uma
   diferença deste tamanho em tantas de cada cem tentativas. É mais comprido e é verdade. */
function ptAcaso(p) {
  if (p === null || p === undefined || isNaN(Number(p))) return 'sem medida de acaso';
  const v = Number(p);
  if (v < 0.001) return 'o acaso quase nunca produziria isso (menos de 1 vez em 1.000)';
  if (v < 0.01) return 'o acaso produziria isso em menos de 1 de cada 100 tentativas';
  return 'o acaso produziria isso em ' + ptInt(Math.round(v * 100)) + ' de cada 100 tentativas';
}

/* O veredito curto sobre sorte, amarrado ao alfa do próprio estudo (etapa 0) e não a um 0,05
   digitado. "No limite" existe porque o leitor leigo lê 0,049 e 0,051 como coisas opostas. */
/* O α mora em `etapa_0.poder.alfa` na Protótipo. Na aba de pontos o poder foi dividido por
   UNIVERSO (`poder.fisico_tecnico_individual_valor_2022_2025.alfa`, `poder.tecnico_coletivo_2018_2025.alfa`).
   `ptAlfa(universo?)`: com universo, o α dele; sem universo, o α único — e se os universos
   declararem α DIFERENTES, não escolhe um: devolve null, e `ptAlfaInfo().motivo` diz por quê.
   Não existe α de reserva digitado: sem α declarado, nada vira "dificilmente é sorte". */
function ptAlfaInfo(universo, dado) {
  const d = dado === undefined ? ptDado() : dado;
  const poder = d && d.etapa_0 && d.etapa_0.poder;
  const num = v => (v !== null && v !== undefined && v !== '' && isFinite(Number(v)) ? Number(v) : null);
  if (!poder || typeof poder !== 'object') {
    return { alfa: null, motivo: 'o arquivo de dados não declara o corte de sorte do estudo (etapa_0.poder)' };
  }
  if (universo) {
    const u = poder[universo];
    const a = u && num(u.alfa);
    return a !== null ? { alfa: a, universo: universo }
      : { alfa: null, motivo: 'o arquivo de dados não declara o corte de sorte do universo ' + universo };
  }
  if (num(poder.alfa) !== null) return { alfa: num(poder.alfa) };
  const us = Object.keys(poder).filter(k => poder[k] && typeof poder[k] === 'object' && num(poder[k].alfa) !== null);
  if (!us.length) return { alfa: null, motivo: 'o arquivo de dados não declara o corte de sorte do estudo' };
  const valores = us.map(k => num(poder[k].alfa)).filter((v, i, a) => a.indexOf(v) === i);
  if (valores.length === 1) return { alfa: valores[0], universos: us };
  return { alfa: null, universos: us,
    motivo: 'cada universo do estudo declara um corte de sorte diferente; a tela precisa saber de qual universo é o número' };
}
function ptAlfa(universo, dado) { return ptAlfaInfo(universo, dado).alfa; }
/* Devolve TEXTO simples (os arquivos de etapa passam por esc): sem α declarado, a frase diz isso.
   `el` (opcional, 3º argumento — ou 2º, no lugar do universo): o α sai do dado da aba daquele
   elemento, para redesenho fora de evento com duas abas na página. */
function ptSorte(p, universo, el) {
  if (p === null || p === undefined || isNaN(Number(p))) return 'sem medida';
  if (universo && universo.nodeType) { el = universo; universo = undefined; }
  const alfa = ptAlfa(universo, el ? ptDado(el) : undefined);
  if (alfa === null) return 'sem corte de sorte declarado no arquivo de dados';
  const v = Number(p);
  return v < alfa ? 'dificilmente é sorte' : v < 2 * alfa ? 'no limite' : 'pode ser sorte';
}

/* Correlação (ρ) em palavras, com o sentido junto: "quando um sobe, o outro cai" é metade da
   informação e o sinal sozinho ninguém lê. */
function ptJunto(rho) {
  if (rho === null || rho === undefined || isNaN(Number(rho))) return 'sem medida';
  const v = Number(rho), a = Math.abs(v);
  const forca = a >= 0.5 ? 'com força' : a >= 0.3 ? 'de forma moderada' : a >= 0.1 ? 'pouco' : 'quase nada';
  if (a < 0.1) return 'não andam juntos';
  return (v > 0 ? 'andam juntos ' : 'andam em sentido contrário ') + forca;
}

/* AUC como pares: pegue um time que subiu e um que não subiu, ao acaso — em quantos de cada
   cem pares a medida põe o que subiu na frente? 50 é moeda; 100 é acerto sempre. É a leitura
   exata do AUC, não uma aproximação. */
function ptAcerto(auc) {
  if (auc === null || auc === undefined || isNaN(Number(auc))) return 'sem medida';
  return 'acerta em ' + ptInt(Math.round(Number(auc) * 100)) + ' de cada 100 pares';
}

/* O número técnico continua na tela, menor e apagado, para quem quer conferir. Esconder de vez
   seria trocar auditável por bonito — e esta aba existe para ser auditável. */
function ptTecnico(html) {
  return html ? '<span class="pt-tec">' + html + '</span>' : '';
}

/* ---------------- o nome de cada medida, um só para a aba inteira ----------------

   A revisão de linguagem achou a mesma medida com três nomes: "velocidade máxima" na etapa 6,
   "psv99" na 9 e na 11, "hsr distance" na 11 — e uma terceira língua no meio ("corrida em alta
   velocidade distance"). Por isso o nome popular mora AQUI, e as etapas 5 a 15 passam por
   ptNomeMedida / ptNomeIndicador. A chave crua nunca some: quem chama põe no `title`.

   A tradução é por pedaço, e na ordem: primeiro a chave inteira que tem nome próprio
   (`pts2t`, `aprovG6`), depois as expressões compostas do rastreamento físico (`sprint count`
   antes de `sprint`), por último as grafias sem acento do arquivo técnico. Pedaço que o mapa
   não conhece continua como veio — feio na tela, mas presente. */
const PT_MEDIDA_CHAVE = {
  pts2t: 'pontos no 2º turno', pts1t: 'pontos no 1º turno', pontos_casa: 'pontos em casa',
  pontos_fora: 'pontos fora de casa', gp_jogo: 'gols marcados por jogo', gc_jogo: 'gols sofridos por jogo',
  /* aprovZ6 NÃO é "contra o Z4-Z6": a conta (analisar_serieb.py, extras_profundos) é
     aprov(posAdv >= 15), com posAdv = a posição FINAL do adversário na tabela daquele ano. */
  aprovG6: 'aproveitamento contra o G6', aprovZ6: 'aproveitamento contra quem terminou do 15º para baixo',
  maxSemVencer: 'maior sequência sem vencer', maxVitorias: 'maior sequência de vitórias',
  golos_tec: 'gols marcados', golos_sem_penalti: 'gols sem contar pênalti', brancos: 'jogos sem marcar gol',
  /* finalizacao NÃO é "aproveitamento das finalizações": a conta (analisar_serieb.py) é
     GP/J − xG, gols marcados por jogo menos os gols esperados — quanto o time fez acima do esperado. */
  xg_saldo: 'saldo de gols esperados (xG)', finalizacao: 'gols acima do esperado por jogo (gols menos xG)',
  goleadas_pro: 'goleadas a favor', clean_sheets: 'jogos sem sofrer gol', cs: 'jogos sem sofrer gol',
  /* defesa_vs_xg é do TIME, não do goleiro: a conta (analisar_serieb.py:257) é xg_contra − GC/J */
  defesa_vs_xg: 'gols sofridos abaixo do esperado (xG), por jogo', tm_valor_total: 'valor do elenco',
  tm_valor_mediana: 'valor do jogador típico do elenco', tm_altura: 'altura média',
  /* gk_def é a PORCENTAGEM de defesas (gk_save_rate_pct), não a contagem */
  gk_def: '% de defesas', gk_evi: 'gols evitados', gk_sai: 'saídas do gol', gk_pas: 'passe do goleiro',
  dist_remate: 'distância média do chute (m)', share_11: '% dos minutos no time-base mais usado',
  conc_hhi: 'concentração dos minutos em poucos jogadores',
  /* `nucleo_<N>`: o corte de minutos sai do nome da chave (ptNomeMedida), não é digitado aqui */
  /* PPDA do Wyscout é por AÇÃO DEFENSIVA, que é mais do que desarme */
  atletas_usados: 'jogadores usados no ano', ppda: 'pressão (passes do adversário por ação defensiva)',
  /* psv/psv99 NÃO é a maior velocidade registrada: é a média, entre os jogos, do pico de cada jogo
     (skill dados-skillcorner; correção de 28/08). O top5 é a média do pico nos 5 jogos mais rápidos. */
  psv: 'pico de velocidade (média dos jogos)', psv99: 'pico de velocidade (média dos jogos)',
  psv5: 'pico de velocidade (média dos 5 jogos mais rápidos)',
  psv99_top5: 'pico de velocidade (média dos 5 jogos mais rápidos)', hsr: 'distância em alta velocidade',
  hsr_n: 'corridas em alta velocidade', spr_n: 'número de piques', spr_km: 'distância em piques',
  dist: 'distância percorrida', mmin: 'metros por minuto', acel: 'acelerações fortes', desa: 'frenagens fortes',
  cod: 'mudanças de direção', hi: 'distância em alta intensidade', hi_n: 'ações de alta intensidade',
  expl: 'acelerações explosivas',
  sistemas_distintos: 'esquemas táticos diferentes usados', trocas: 'trocas de esquema tático',
  principal_pct: '% de jogos no esquema principal', linha3_pct: '% de jogos com três zagueiros',
  fidelidade_media: 'fidelidade ao esquema principal', linha3: 'jogos com três zagueiros',
  distintas: 'formações diferentes', formacoes: 'formações diferentes usadas',
};
const PT_MEDIDA_PEDACOS = [
  [/\bpsv99 top5\b/gi, 'pico de velocidade (média dos 5 jogos mais rápidos)'],
  [/\bpsv99\b/gi, 'pico de velocidade (média dos jogos)'],
  [/\bexpl accel sprint\b/gi, 'arrancadas explosivas até o pique'],
  [/\bexpl accel hsr\b/gi, 'arrancadas explosivas até alta velocidade'],
  [/\bruns above hsr\b/gi, 'desmarques em alta velocidade'],
  [/\bruns penalty area\b/gi, 'desmarques para a área'],
  [/\bruns dangerous\b/gi, 'desmarques perigosos'],
  [/\bruns received\b/gi, 'desmarques que receberam a bola'],
  [/\bruns shot within 10s\b/gi, 'desmarques que viraram chute em 10 s'],
  [/\bruns\b/gi, 'desmarques'],
  [/\bsprint distance\b/gi, 'distância em piques'],
  [/\bsprint count\b/gi, 'número de piques'],
  [/\bhsr distance\b/gi, 'distância em alta velocidade'],
  [/\bhsr count\b/gi, 'corridas em alta velocidade'],
  [/\bhi distance\b/gi, 'distância em alta intensidade'],
  [/\bhi count\b/gi, 'ações de alta intensidade'],
  [/\brunning distance\b/gi, 'distância correndo'],
  [/\bdistance\b/gi, 'distância percorrida'],
  [/\bm per min\b/gi, 'metros por minuto'],
  [/\bhigh accel\b/gi, 'acelerações fortes'],
  [/\bhigh decel\b/gi, 'frenagens fortes'],
  [/\bmedium accel\b/gi, 'acelerações médias'],
  [/\bmedium decel\b/gi, 'frenagens médias'],
  [/\bcod count\b/gi, 'mudanças de direção'],
  [/\bp(\d+)otip\b/gi, 'a cada $1 min sem a bola'],
  [/\bp(\d+)tip\b/gi, 'a cada $1 min com a bola'],
  [/\botip\b/gi, 'sem a bola'],
  [/\btip\b/gi, 'com a bola'],
  [/\btop(\d+)\b/gi, '(média das $1 maiores)'],
  [/\bp(\d+)\b/gi, 'por $1 min'],
  [/\bhsr\b/gi, 'alta velocidade'],
  [/\bpsv\b/gi, 'pico de velocidade (média dos jogos)'],
  [/\/(\d+)$/, ' por $1 min'],
  [/\s(\d+)$/, ' por $1 min'],
  /* só acentua: o catálogo diz "por ação defensiva", e é isso que o PPDA mede (não "por desarme") */
  [/\bPPDA \(passes do adversario por acao defensiva\)/g, 'Pressão (passes do adversário por ação defensiva)'],
  [/\bRemates a baliza\b/g, 'Chutes no gol'], [/\bRemates à baliza\b/g, 'Chutes no gol'],
  [/\bRemates\b/g, 'Chutes'], [/\bremates\b/g, 'chutes'], [/\bremate\b/g, 'chute'], [/\bRemate\b/g, 'Chute'],
  [/\bGolos\b/g, 'Gols'], [/\bgolos\b/g, 'gols'], [/\bexpectáveis\b/g, 'esperados'],
  [/\bDistancia\b/g, 'Distância'], [/\bmedia\b/g, 'média'], [/\bmedio\b/g, 'médio'], [/\bIdade media\b/g, 'Idade média'],
  [/\barea\b/g, 'área'], [/\bterco\b/g, 'terço'], [/\bRecuperacoes\b/g, 'Recuperações'], [/\bCartoes\b/g, 'Cartões'],
  [/\baereos\b/g, 'aéreos'], [/\bintercecoes\b/g, 'interceptações'], [/\bacoes\b/g, 'ações'], [/\bexito\b/g, 'êxito'],
  [/\baceleracoes\b/g, 'acelerações'], [/\bAceleracoes\b/g, 'Acelerações'], [/\bassistencias\b/g, 'assistências'],
  [/\bFormacoes\b/g, 'Formações'], [/\bformacao\b/g, 'formação'], [/\bConcentracao\b/g, 'Concentração'],
  [/\bajust a posse\b/g, 'ajustado à posse'], [/\bpasses chave\b/gi, 'passes-chave'],
  [/\bXI mais usado\b/g, 'time-base mais usado'],
  [/\bpor por\b/g, 'por'],
];
/* ---------------- o glossário: de onde vem o nome, a unidade e a definição ----------------

   Três fontes, NESTA ordem, campo a campo:
     1. o que o GERADOR gravou no indicador (`nome_simples`, `unidade`, `definicao`, `fonte`,
        `lado_bom`) — é ele quem calcula os derivados (share_11, conc_hhi, nucleo_*, ti_*), então
        só ele sabe a unidade de verdade;
     2. `ptGlossario(id)`, do arquivo static/proto_glossario.js (outro dono, carregado ANTES deste)
        — as colunas brutas de Wyscout, SkillCorner, Transfermarkt e os apelidos físicos;
     3. o nome que esta casca já dava (PT_MEDIDA_CHAVE e os pedaços).
   Se o glossário não existir, o passo 2 é pulado calado: é arquivo opcional, e a aba tem de
   continuar desenhando sem ele. Campo que nenhuma fonte tem volta `null` — quem mostra decide
   escrever a ausência (unidade desconhecida NÃO vira "%" por palpite). */
const PT_INDICE_GERADOR = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
function ptIndiceGerador(dado) {
  if (!dado || typeof dado !== 'object' || !PT_INDICE_GERADOR) return {};
  if (PT_INDICE_GERADOR.has(dado)) return PT_INDICE_GERADOR.get(dado);
  const idx = {};
  const junta = (id, obj) => {
    if (id === null || id === undefined || !obj || typeof obj !== 'object') return;
    idx[String(id)] = Object.assign({}, obj, idx[String(id)] || {});
  };
  const ind = dado.indicadores;
  if (Array.isArray(ind)) ind.forEach(x => x && junta(x.id || x.indicador, x));
  else if (ind && typeof ind === 'object') Object.keys(ind).forEach(k => junta(k, ind[k]));
  (((dado.etapa_2 || {}).linhas) || []).forEach(x => x && junta(x.indicador, x));
  const pn = (dado.etapa_5 || {}).paineis || {};
  Object.keys(pn).forEach(k => ((pn[k] || {}).indicadores || []).forEach(x => x && junta(x.id, x)));
  PT_INDICE_GERADOR.set(dado, idx);
  return idx;
}
function ptGlossarioDe(id) {
  if (typeof ptGlossario !== 'function') return null;
  try {
    const g = ptGlossario(id);
    return g && typeof g === 'object' ? g : null;
  } catch (err) { return null; }
}
/* `dado` pode ser o objeto de dados OU um elemento da tela (aí vale o dado da aba daquele elemento):
   é o que deixa um redesenho fora de evento, com duas abas na página, pedir o nome certo. */
function ptDadoOuEl(x) {
  if (x === undefined || x === null) return ptDado();
  return x.nodeType ? ptDado(x) : x;
}
/* Tudo o que se sabe de uma medida: {nome, curto, nome_longo, mede, unidade, fonte, lado, origem_nome}. */
function ptInfoMedida(id, dado) {
  const k = String(id === null || id === undefined ? '' : id);
  const ger = ptIndiceGerador(ptDadoOuEl(dado))[k] || {};
  const glo = ptGlossarioDe(k) || {};
  const pega = (...vals) => vals.find(v => v !== null && v !== undefined && v !== '');
  /* no glossário, `nome_longo` é o nome inteiro (com o setor e a fase) e `nome` é a forma curta
     de cabeçalho; nome de medida sem a fase ("número de piques" sem "a cada 30 min sem a bola")
     troca uma medida pela outra, então o nome da frase é sempre o longo */
  const nomeGer = pega(ger.nome_simples);
  let nomeGlo = pega(glo.nome_simples, glo.nome_longo, glo.nome);
  /* Nomes que afirmavam mais do que a conta ("velocidade máxima" para a média dos picos, "defesas"
     para a porcentagem, "pelo goleiro" para uma conta do time, "por desarme"). O glossário foi
     regravado em 14/09 com os nomes certos nos TRÊS campos. A casca continua de guarda, campo a
     campo — nome, forma curta e nome longo —, porque a correção de antes só trocava `nome` e o
     cabeçalho de matriz (ptNomeCurto) seguia dizendo "Velocidade máxima": se o glossário marcar
     `aviso_nome` ou voltar a trazer um nome da lista de errados, vale o nome corrigido da casca. */
  const corrigido = nomeGer ? null : ptNomeCorrigidoCasca(k);
  const vale = v => corrigido && (glo.aviso_nome || ptNomeErrado(v));
  let aviso = glo.aviso_nome || null;
  const trocouNome = vale(nomeGlo);
  if (trocouNome) { nomeGlo = corrigido; aviso = null; }
  const curtoGlo = vale(glo.nome) ? ptNomeCorrigidoCasca(k, 'curto') : glo.nome;
  const longoGlo = vale(glo.nome_longo) ? corrigido : glo.nome_longo;
  if (corrigido && (curtoGlo !== glo.nome || longoGlo !== glo.nome_longo)) aviso = null;
  return {
    id: k,
    nome: pega(nomeGer, nomeGlo) || null,
    origem_nome: nomeGer ? 'gerador' : trocouNome ? 'casca (nome corrigido)' : nomeGlo ? 'glossario' : 'casca',
    aviso_nome: nomeGer ? null : aviso,
    mede: pega(ger.definicao, glo.o_que_mede, glo.mede, glo.definicao) || null,
    unidade: pega(ger.unidade, glo.unidade) || null,
    fonte: pega(ger.fonte, glo.fonte) || null,
    lado: pega(ger.lado_bom, glo.lado_bom, glo.lado) || null,
    curto: pega(ger.nome_curto, curtoGlo, nomeGer, nomeGlo) || null,
    escala: pega(ger.escala, glo.escala, glo.por) || null,
    fase: pega(ger.fase, glo.fase) || null,
    nome_longo: pega(ger.nome_longo, longoGlo) || null,
    /* físico "por 30 min daquela fase" não se compara com "por 90": o glossário diz qual é qual */
    compara_com_por_90: ger.compara_com_por_90 !== undefined ? ger.compara_com_por_90
      : glo.compara_com_por_90 !== undefined ? glo.compara_com_por_90 : null,
  };
}
/* O texto do `title` de uma medida: o que mede · unidade · de onde vem · lado bom. Só o que existe. */
function ptDicaMedida(id, dado) {
  const i = ptInfoMedida(id, dado);   /* `dado` pode ser o objeto ou um elemento da aba */
  return [i.mede, i.unidade ? 'unidade: ' + i.unidade : '', i.escala && i.escala !== i.unidade ? i.escala : '',
    i.fase && i.fase !== 'não se aplica' ? 'fase: ' + i.fase : '',
    i.compara_com_por_90 === false && /30|fase/i.test(String(i.escala || '') + String(i.fase || ''))
      ? 'não compare com as medidas por 90 min' : '',
    i.fonte ? 'fonte: ' + i.fonte : '',
    i.lado ? 'lado bom: ' + i.lado : '',
    i.aviso_nome ? 'atenção ao nome: ' + i.aviso_nome : '', 'chave: ' + i.id].filter(Boolean).join(' · ');
}
/* As COLUNAS das tabelas (m_sobe, d_bruto_SM, rho_persist, porta…) moram em outro mapa do glossário
   (`ptGlossarioColuna`), porque a mesma chave pode ser indicador numa tabela e coluna em outra.
   ptInfoMedida não as enxerga — e por isso o catálogo escrevia os cabeçalhos à mão. Mesma forma de
   ptInfoMedida; campo sem fonte volta null. Sem o glossário carregado, tudo null (a tela diz a falta). */
function ptInfoColuna(k) {
  const c = String(k === null || k === undefined ? '' : k);
  let g = null;
  if (typeof ptGlossarioColuna === 'function') { try { g = ptGlossarioColuna(c); } catch (err) { g = null; } }
  const x = g && typeof g === 'object' ? g : {};
  const pega = (...vals) => vals.find(v => v !== null && v !== undefined && v !== '');
  return {
    id: c,
    nome: pega(x.nome_simples, x.nome_longo, x.nome) || null,
    curto: pega(x.nome, x.nome_simples) || null,
    nome_longo: pega(x.nome_longo) || null,
    mede: pega(x.mede, x.o_que_mede) || null,
    unidade: pega(x.unidade) || null,
    fonte: pega(x.fonte) || null,
    lado: pega(x.lado) || null,
    escala: pega(x.escala, x.por) || null,
    existe: !!g,
  };
}
function ptDicaColuna(k) {
  const i = ptInfoColuna(k);
  if (!i.existe) return 'o glossário não descreve a coluna ' + i.id;
  return [i.mede, i.unidade && i.unidade !== 'texto' ? 'unidade: ' + i.unidade : '',
    i.escala && i.escala !== 'não se aplica' ? i.escala : '', 'coluna: ' + i.id].filter(Boolean).join(' · ');
}
/* Os nomes que a casca CORRIGIU porque diziam mais do que a conta (conferido no código e na skill).
   Medida de setor (`fis_zaga_psv99`) herda a correção com o setor ao lado. */
const PT_NOME_CORRIGIDO = ['defesa_vs_xg', 'ppda', 'psv', 'psv5', 'psv99', 'psv99_top5', 'gk_def'];
/* a forma curta corrigida, para cabeçalho de matriz (até ~22 caracteres, como as do glossário) */
const PT_NOME_CORRIGIDO_CURTO = {
  defesa_vs_xg: 'Sofridos abaixo do xG', ppda: 'Pressão (PPDA)', gk_def: '% de defesas',
  psv: 'Pico de velocidade', psv99: 'Pico de velocidade', psv5: 'Pico veloc. 5 jogos', psv99_top5: 'Pico veloc. 5 jogos',
};
/* o que denuncia um nome errado vindo de fora da casca, em qualquer um dos três campos */
const PT_NOME_ERRADO = [/velocidade m[aá]x/i, /veloc\w*\.? m[aá]x/i, /por desarme/i, /pelo goleiro/i, /^\s*defesas\s*$/i];
function ptNomeErrado(v) {
  return v !== null && v !== undefined && PT_NOME_ERRADO.some(re => re.test(String(v)));
}
/* `forma`: sem forma, o nome inteiro (com o setor); 'curto', a forma de cabeçalho (sem o setor,
   como as formas curtas do glossário). */
function ptNomeCorrigidoCasca(id, forma) {
  const k = String(id);
  const m = /^(?:ti|fis)_(zaga|lateral|meio|ataque)_(.+)$/.exec(k);
  const base = (m ? m[2] : k).replace(/^(?:fis|ti)_/, '');
  if (PT_NOME_CORRIGIDO.indexOf(base) < 0) return null;
  if (forma === 'curto') return PT_NOME_CORRIGIDO_CURTO[base] || PT_MEDIDA_CHAVE[base];
  const nome = PT_MEDIDA_CHAVE[base];
  return m && PT_SETOR_NOME[m[1]] ? nome + ' (' + PT_SETOR_NOME[m[1]] + ')' : nome;
}
/* A forma CURTA, para cabeçalho de matriz (o `title` leva ptDicaMedida). Sem forma curta
   gravada, o nome inteiro. `el` (opcional): o nome sai do dado da aba daquele elemento. */
function ptNomeCurto(id, el) {
  const i = ptInfoMedida(id, el);
  return i.curto ? String(i.curto) : ptNomeIndicador(id, el);
}
/* O nome do arquivo de dados da aba ativa, para frases do tipo "o prototipo.json não traz…". */
function ptArquivoDado(el) {
  const a = ptAba(el);
  return (a && a.rotulos && a.rotulos.arquivo) || 'prototipo.json';
}
function ptNomeMedida(s, el) {
  if (s === null || s === undefined || s === '') return 'medida sem nome';
  const cru = String(s);
  const info = ptInfoMedida(cru, el);
  if (info.nome) return String(info.nome);
  if (Object.prototype.hasOwnProperty.call(PT_MEDIDA_CHAVE, cru)) return PT_MEDIDA_CHAVE[cru];
  let t = cru.replace(/\s*\((kpis|skillcorner)\.json\)\s*$/i, '').replace(/´/g, '')
    .replace(/^fis_/, '').replace(/^ti_/, '');
  if (Object.prototype.hasOwnProperty.call(PT_MEDIDA_CHAVE, t)) return PT_MEDIDA_CHAVE[t];
  const mNuc = /^nucleo_(\d+)$/.exec(t);
  if (mNuc) return 'jogadores com ' + ptInt(Number(mNuc[1])) + ' minutos ou mais';
  t = t.replace(/_+/g, ' ').trim();
  PT_MEDIDA_PEDACOS.forEach(par => { t = t.replace(par[0], par[1]); });
  return t;
}
/* O nome de um indicador pela chave: o nome do catálogo da etapa 2 quando existe, traduzido;
   senão a própria chave, traduzida. Indicador de um setor (`ti_meio_…`, `fis_zaga_…`) leva o
   setor junto — "passes-chave" do meio-campo e do ataque não são a mesma medida. */
const PT_SETOR_NOME = { zaga: 'zaga', lateral: 'laterais', meio: 'meio-campo', ataque: 'ataque' };
/* `el` (opcional): o nome sai do dado da aba daquele elemento — para redesenho fora de evento. */
function ptNomeIndicador(id, el) {
  const k = String(id === null || id === undefined ? '' : id);
  /* nome vindo do gerador ou do glossário pela chave INTEIRA já é o nome daquela medida — o
     glossário escreve o setor dentro dele; acrescentar "(zaga)" aqui duplicaria */
  const info = ptInfoMedida(k, el);
  const mSet = /^(?:ti|fis)_(zaga|lateral|meio|ataque)_/.exec(k);
  if (info.nome) {
    const nm = String(info.nome);
    /* garantia: medida de setor sem o setor no nome se confunde com a do outro setor */
    const rot = mSet && PT_SETOR_NOME[mSet[1]];
    return rot && nm.toLowerCase().indexOf(rot.split('-')[0]) < 0 && nm.toLowerCase().indexOf(mSet[1]) < 0
      ? nm + ' (' + rot + ')' : nm;
  }
  const dd = ptDado(el);
  const linhas = (dd && dd.etapa_2 && dd.etapa_2.linhas) || [];
  const l = linhas.find(x => x && x.indicador === k);
  const m = /^(?:ti|fis)_(zaga|lateral|meio|ataque)_(.+)$/.exec(k);
  const base = l && l.nome ? ptNomeMedida(l.nome, el) : ptNomeMedida(m ? m[2] : k, el);
  const setor = (l && l.setor) || (m ? m[1] : null);
  return setor && PT_SETOR_NOME[setor] ? base + ' (' + PT_SETOR_NOME[setor] + ')' : base;
}

/* As réguas da etapa 9 (e os olhares da etapa 8) chegam como chave sem acento: `F_solidez`.
   O nome em português mora aqui, uma vez; régua nova sem nome aparece pela chave legível. */
const PT_REGUAS = {
  posse_construcao: 'Posse e construção', pressao_ritmo: 'Pressão e ritmo', volume_fisico: 'Volume físico',
  explosao: 'Explosão', qualidade_chance: 'Qualidade da chance', solidez: 'Solidez defensiva',
  bola_aerea_parada: 'Bola aérea e bola parada', dinheiro: 'Dinheiro', estabilidade_11: 'Estabilidade do time-base',
};
function ptNomeRegua(k) {
  const s = String(k === null || k === undefined ? '' : k).replace(/^[A-Z]_/, '');
  return PT_REGUAS[s] || s.replace(/_+/g, ' ');
}

/* O selo de cada indicador da etapa 2 — e das portas da etapa 10 —, dito pelo que ele significa.
   Um só texto para as duas etapas. A porta A NÃO é "serve para contratar" (item 17a): isso é
   receita, e o estudo não mediu receita. O texto é o MOTIVO que o gerador grava na linha
   (`porta_motivo`: "sobrevive ao dinheiro, se repete e prevê o 2º turno"), dito em português de
   reunião — prever o 2º turno é o que mostra que o número vem ANTES do resultado. Se o motivo
   gravado mudar, este texto tem de mudar junto; a linha da etapa 2 continua mostrando o motivo dela. */
const PT_PORTAS_TXT = {
  A: 'resiste ao dinheiro, se repete de um ano para o outro e vem antes do resultado',
  /* B junta dois motivos no dado: "não se repete de um ano para o outro" e "sobrevive ao dinheiro
     mas não sobrevive à família" (se repete, mas não sobra depois de descontar a sorte de testar
     muitos parecidos). O resumo tem de valer para os dois — proto_b e proto_c mostram só ele. */
  B: 'separa, mas ou não se repete de um ano para o outro, ou pode ser sorte de testar muitos parecidos',
  C: 'era só o dinheiro',
  D: 'é o placar contado de outro jeito',
};
function ptPortaTxt(letra) {
  return PT_PORTAS_TXT[letra] || null;
}
/* O motivo de UMA linha, e não o resumo da letra. A letra B junta dois motivos diferentes, e onde a
   tela só tem a letra ela acaba dizendo "ou não se repete, ou pode ser sorte" de uma medida que o
   catálogo já sabe que não se repete (ρ medido). Por isso: primeiro o `porta_motivo` que o gerador
   gravou para aquele indicador em `etapa_2.linhas` do dado da aba; só sem ele, o resumo da letra.
   Devolve {texto, de: 'linha' | 'letra' | null, letra}. `letra` (opcional) é a porta que a tela já tem
   em mãos; `el` (opcional) escolhe o dado pela aba do elemento. */
function ptPortaMotivo(indicador, letra, el) {
  const dd = ptDado(el) || {};
  const linhas = ((dd.etapa_2 || {}).linhas) || [];
  const l = indicador === null || indicador === undefined ? null
    : linhas.find(x => x && x.indicador === String(indicador));
  const porta = letra || (l && l.porta) || null;
  if (l && l.porta_motivo && (!letra || !l.porta || l.porta === letra)) {
    return { texto: String(l.porta_motivo), de: 'linha', letra: l.porta || porta };
  }
  const resumo = porta ? ptPortaTxt(porta) : null;
  return { texto: resumo, de: resumo ? 'letra' : null, letra: porta };
}

/* A ressalva do tamanho da própria régua do dinheiro. Estava escrita de dois jeitos (no topo e
   na etapa 1), e nenhum dizia o que ela significa na prática. Uma redação, lida do dado. */
function ptPoucaBase(auc) {
  const a = auc || {};
  if (a.eventos_por_parametro === undefined || a.eventos_por_parametro === null ||
      a.regra_pratica === undefined || a.regra_pratica === null) return '';
  const ev = ptNum(a.eventos_por_parametro, Number.isInteger(Number(a.eventos_por_parametro)) ? 0 : 1);
  /* o "evento" é o time do grupo que a conta tenta separar: quem subiu na Protótipo, a faixa de
     cima na aba de pontos — por isso a palavra sai de ptFxRot e não de um "subidas" fixo */
  const casos = 'casos de ' + ptFxRot('sobe', { forma: 'quem' });
  return Number(a.eventos_por_parametro) < Number(a.regra_pratica)
    ? 'Até essa conta do dinheiro tem pouca base: o costume pede ' + ptInt(a.regra_pratica) + ' ' + casos +
      ' para cada coisa que a conta leva em conta, e aqui há ' + ev + '. O número pode mudar com mais anos.' +
      ptTecnico('eventos por parâmetro')
    : 'A conta do dinheiro tem a base que o costume pede: ' + ev + ' ' + casos + ' para cada coisa que ela leva em conta, ' +
      'contra ' + ptInt(a.regra_pratica) + ' pedidos.' + ptTecnico('eventos por parâmetro');
}
/* Concordância de número. "há 1 horas" é o tipo de erro que faz o leitor desconfiar do
   resto da tela, e ele nasce sempre do mesmo lugar: um rótulo fixo grudado num contador.
   O nome leva `Casca` de propósito — proto_a/b/c têm os seus próprios casos de plural e
   cada um resolve no seu arquivo; dois `function ptPlural` em scripts clássicos se
   sobrescrevem calados, e um helper de tela não pode depender da ordem dos <script>. */
function ptCascaConcorda(n, singular, plural) {
  if (n === null || n === undefined) return ptFalta('contagem ausente');
  return ptInt(n) + ' ' + (Math.abs(Number(n)) === 1 ? singular : plural);
}

/* O n nunca é enfeite: 16 clube-temporada e 603 candidatos aguentam frases diferentes.
   Por isso o rótulo carrega a UNIDADE junto — "n = 16" sozinho já enganou muita gente. */
function ptN(n, unidade) {
  if (n === null || n === undefined) return ptFalta('a quantidade não foi registrada no arquivo de dados');
  /* "clube-temporada" é jargão de planilha; na tela é "temporadas de clube". A troca mora aqui
     para que as três etapas que passam essa unidade digam a mesma coisa sem combinar entre si. */
  const u = unidade ? String(unidade)
    .replace(/^clube-temporada completos\b/, 'temporadas de clube completas')
    .replace(/^clube-temporada\b/, Math.abs(Number(n)) === 1 ? 'temporada de clube' : 'temporadas de clube') : '';
  return '<span class="pt-n" title="quantidade">' + ptInt(n) + (u ? ' ' + esc(u) : '') + '</span>';
}

/* ---------------- a ausência, escrita ----------------

   Buraco não vira zero e não vira traço mudo. `ptFalta` é inline (dentro de uma frase ou
   célula) e `ptFaltaBloco` ocupa o lugar de um bloco inteiro que não existe. Os dois
   exigem motivo: chamar sem motivo é erro de quem chamou, e a tela diz isso na cara. */
function ptFalta(motivo) {
  return '<span class="pt-falta" title="' + esc(motivo || '') + '">sem dado — ' +
    esc(motivo || 'MOTIVO NÃO INFORMADO POR QUEM CHAMOU ptFalta()') + '</span>';
}
function ptFaltaBloco(titulo, motivo) {
  return '<div class="pt-falta-bloco"><b>' + esc(titulo) + '</b><p>' +
    esc(motivo || 'MOTIVO NÃO INFORMADO POR QUEM CHAMOU ptFaltaBloco()') + '</p></div>';
}

/* ---------------- célula colorida por percentil ----------------

   A cor é o percentil DENTRO DO ANO, e o zero da escala é o percentil 50 — não o 0. Uma
   rampa que só cresce faz o meio da tabela parecer ruim; aqui o meio fica lavado e as duas
   pontas acendem em cores opostas, que é o que a matriz da etapa 5 precisa mostrar.

   `sinal` inverte o lado bom quando menos é melhor (PPDA, xG contra, tempo de 5-0-5). Sem
   isso a matriz pintaria de "alto" justamente quem pressiona menos. `sinal: 0` é o caso em
   que o próprio estudo não declarou direção — aí a cor continua sendo só percentil, e o
   `title` avisa que não há lado bom declarado. */
function ptCel(percentil, opts) {
  const o = opts || {};
  if (percentil === null || percentil === undefined) {
    const motivo = o.motivo || 'sem valor no JSON e sem motivo declarado';
    return '<td class="pt-cel pt-cel-vazio" title="' + esc(motivo) + '"><i>vazio</i><small>' +
      esc(motivo) + '</small></td>';
  }
  const p = Math.max(0, Math.min(100, Number(percentil)));
  const dist = Math.abs(p - 50) / 50;                       /* 0 no meio, 1 nas pontas */
  const alto = o.sinal === -1 ? p < 50 : p > 50;
  const forca = (dist * 0.62).toFixed(3);
  const dica = [
    o.bruto !== undefined && o.bruto !== null ? 'valor medido ' + ptNum(o.bruto, o.casas === undefined ? 3 : o.casas) : '',
    'posição no ranking daquele ano: ' + ptNum(p, 1) + ' (quanto maior, mais alto no ranking)',
    o.n !== undefined && o.n !== null ? 'base: ' + ptInt(o.n) + (o.unidade ? ' ' + o.unidade : '') : '',
    o.ano ? String(o.ano) : '',
    o.sinal === 0 ? 'o estudo não diz se ter mais disto é melhor ou pior' : '',
  ].filter(Boolean).join(' · ');
  return '<td class="pt-cel" title="' + esc(dica) + '"' +
    (o.dados ? ' data-pt="' + esc(o.dados) + '"' : '') + '>' +
    '<i class="pt-cel-fundo ' + (alto ? 'alto' : 'baixo') + '" style="opacity:' + forca + '"></i>' +
    '<span>' + (o.texto !== undefined ? o.texto : ptNum(p, 0)) + '</span></td>';
}

/* A legenda dos vazios de uma matriz. Numa matriz de 32 colunas não cabe o motivo dentro
   da célula — ele vai no `title` —, e `title` não é lido por quem só passa o olho. Então a
   matriz é obrigada a fechar com esta legenda: quantas células vazias, e por quê, cada
   motivo uma vez. É o que impede que um setor inteiro sem atleta rastreado passe por
   "sem novidade". */
function ptMotivos(motivos) {
  const conta = {};
  (motivos || []).forEach(m => { if (m) conta[m] = (conta[m] || 0) + 1; });
  const chaves = Object.keys(conta).sort((a, b) => conta[b] - conta[a]);
  if (!chaves.length) return '';
  return '<p class="pt-nota pt-motivos">' + chaves.map(m =>
    '<span><b>' + ptInt(conta[m]) + '</b> ' +
    (conta[m] === 1 ? 'célula vazia' : 'células vazias') + ' — ' + esc(m) + '</span>').join('') + '</p>';
}

/* ---------------- barra ----------------

   `max` vem de quem chama porque a escala é decisão de leitura, não do dado: na etapa 4 a
   barra vai de 0 a 1 (confiabilidade) e na etapa 11 de 0 a 1 também, mas por outro motivo.
   Deixar a barra se normalizar pelo maior valor da lista faria o pior indicador de uma
   lista curta parecer bom.

   `hachura` é o aviso visual de "abaixo do corte": na etapa 4, confiabilidade abaixo de
   0,40 significa que a medida mal concorda com ela mesma — e uma barra sólida ali mentiria
   por omissão. O corte é lido do JSON por quem chama; a hachura só desenha. */
function ptBarra(valor, max, opts) {
  const o = opts || {};
  if (valor === null || valor === undefined) {
    return '<div class="pt-barra-linha">' + (o.rot ? '<span class="pt-barra-rot">' + esc(o.rot) + '</span>' : '') +
      '<div class="pt-barra vazia">' + ptFalta(o.motivo || 'valor ausente') + '</div></div>';
  }
  const m = max || 1;
  const larg = Math.max(0, Math.min(100, Math.abs(Number(valor)) / m * 100));
  return '<div class="pt-barra-linha">' +
    (o.rot ? '<span class="pt-barra-rot" title="' + esc(o.dica || o.rot) + '">' + esc(o.rot) + '</span>' : '') +
    '<div class="pt-barra"><i class="' + (o.cor === 'baixo' ? 'baixo' : 'alto') +
      (o.hachura ? ' hachura' : '') + '" style="width:' + larg.toFixed(1) + '%"></i></div>' +
    '<b class="pt-barra-val">' + (o.texto !== undefined ? o.texto : ptNum(valor, 3)) + '</b>' +
    (o.extra ? '<span class="pt-barra-extra">' + o.extra + '</span>' : '') +
    '</div>';
}

/* ---------------- tabela ordenável ----------------

   Guardar as linhas num registro e redesenhar o `<tbody>` na hora do clique, em vez de
   remexer nos `<tr>` que já estão na tela: com 293 linhas na etapa 2, reordenar nós do DOM
   custa caro e, pior, perde qualquer célula que tenha sido montada por função (as de
   `fmt`). Redesenhar do dado é mais barato e não tem como divergir do dado.

   Nulo vai SEMPRE para o fim, nas duas direções. Ordenar por "d líquido" e receber no topo
   as linhas que não têm d líquido seria esconder as que têm. */
const PT_TABELAS = {};
/* O id da tabela ganha o prefixo da aba sozinho: os arquivos de etapa escrevem 'ptEt-2-tab' e,
   na aba de pontos, a tabela nasce 'poEt-2-tab'. Sem isso o registro (que é por id) de uma aba
   sobrescreveria o da outra e o clique de ordenar reordenaria a tabela errada. */
function ptTabId(id, el) {
  const s = String(id);
  const pre = ptPrefixo(el);
  return pre !== 'ptEt' && /^ptEt-/.test(s) ? pre + s.slice(4) : s;
}
/* `cfg.el` (opcional): o elemento da aba onde a tabela vai morar. Sem ele vale a aba ativa, que é o
   certo dentro de `ptEtapaN` e de evento de clique; fora disso (timer, observador) passe o `alvo`. */
function ptTabela(cfg) {
  const id = ptTabId(cfg.id, cfg.el);
  PT_TABELAS[id] = {
    colunas: cfg.colunas,
    linhas: cfg.linhas || [],
    ordem: cfg.ordem || null,
    ordemInicial: cfg.ordem ? { col: cfg.ordem.col, dir: cfg.ordem.dir } : null,
    vazio: cfg.vazio || 'nenhuma linha — a tabela está vazia porque o dado está vazio, não por erro da tela',
    separadorFora: cfg.separadorFora || 'a linha divisória desta tabela só vale na ordem original',
    /* `ordenavel:false` na tabela ou na coluna desliga o clique: na tabela de gaps em valor cru,
       a mediana mistura m/min, % e contagem, e unidades diferentes não se ordenam entre si */
    ordenavel: cfg.ordenavel !== false,
    motivoFixa: cfg.motivoFixa || null,
  };
  return '<div class="pt-tab-rola"><table class="pt-tab' + (cfg.classe ? ' ' + esc(cfg.classe) : '') +
    '" id="' + esc(id) + '">' + ptTabCabeca(id) + ptTabCorpo(id) + '</table></div>';
}
function ptTabCabeca(id) {
  const t = PT_TABELAS[id];
  return '<thead><tr>' + t.colunas.map(c => {
    const on = t.ordem && t.ordem.col === c.k;
    const ord = t.ordenavel !== false && c.ordenavel !== false;
    const dica = [c.dica, ord ? '' : (c.motivoFixa || t.motivoFixa || 'esta coluna não se reordena')]
      .filter(Boolean).join(' · ');
    return '<th' + (ord ? ' data-col="' + esc(c.k) + '"' : '') + (dica ? ' title="' + esc(dica) + '"' : '') +
      ' class="' + (c.tipo === 'texto' ? 'txt' : 'num') + (c.cabClasse ? ' ' + esc(c.cabClasse) : '') +
      (ord ? '' : ' pt-th-fixa') + (on ? ' on ' + t.ordem.dir : '') + '">' +
      esc(c.rot) + (on ? '<i>' + (t.ordem.dir === 'asc' ? '▲' : '▼') + '</i>' : '') + '</th>';
  }).join('') + '</tr></thead>';
}
function ptTabCorpo(id) {
  const t = PT_TABELAS[id];
  let linhas = t.linhas.slice();
  if (t.ordem) {
    const col = t.colunas.find(c => c.k === t.ordem.col) || { tipo: 'num' };
    const dir = t.ordem.dir === 'asc' ? 1 : -1;
    linhas.sort((a, b) => {
      const va = a[t.ordem.col], vb = b[t.ordem.col];
      const na = va === null || va === undefined || va === '';
      const nb = vb === null || vb === undefined || vb === '';
      if (na && nb) return 0;
      if (na) return 1;                 /* ausente sempre no fim, nas duas direções */
      if (nb) return -1;
      if (col.tipo === 'texto') return String(va).localeCompare(String(vb), 'pt-BR') * dir;
      return (Number(va) - Number(vb)) * dir;
    });
  }
  if (!linhas.length) {
    return '<tbody><tr><td class="pt-tab-vazio" colspan="' + t.colunas.length + '">' +
      esc(t.vazio) + '</td></tr></tbody>';
  }
  /* Separador (ex.: a LINHA DA SORTE da tabela de gaps): a linha com `_separadorAntes: 'html'`
     ganha, antes dela, uma faixa de largura inteira. Ela só faz sentido na ordem em que foi
     calculada — reordenada por outra coluna, a faixa ficaria no meio de linhas que ela não
     separa. Então fora da ordem original ela sai, e uma linha no topo diz isso e oferece voltar. */
  const naOrdemOriginal = JSON.stringify(t.ordem || null) === JSON.stringify(t.ordemInicial || null);
  const temSeparador = linhas.some(l => l && l._separadorAntes);
  const aviso = temSeparador && !naOrdemOriginal
    ? '<tr class="pt-linha-sorte-rot"><td colspan="' + t.colunas.length + '">' + esc(t.separadorFora) +
      ' <button class="bt mini" data-pt-ordem-original="1">voltar à ordem original</button></td></tr>'
    : '';
  return '<tbody>' + aviso + linhas.map(l => (naOrdemOriginal && l._separadorAntes
      ? '<tr class="pt-linha-sorte-rot"><td colspan="' + t.colunas.length + '">' + l._separadorAntes + '</td></tr>' : '') +
    '<tr' + ((l._classe || (naOrdemOriginal && l._separadorAntes))
      ? ' class="' + esc([l._classe, naOrdemOriginal && l._separadorAntes ? 'pt-linha-sorte' : ''].filter(Boolean).join(' ')) + '"' : '') +
    (l._dica ? ' title="' + esc(l._dica) + '"' : '') + '>' +
    t.colunas.map(c => {
      if (c.cel) return c.cel(l[c.k], l);            /* devolve o <td> inteiro (ex.: ptCel) */
      const v = l[c.k];
      const txt = c.fmt ? c.fmt(v, l)
        : (v === null || v === undefined) ? '—'
        : c.tipo === 'texto' ? esc(v) : ptNum(v, c.casas === undefined ? 2 : c.casas);
      const cls = (c.tipo === 'texto' ? 'txt' : 'num') + (c.classe ? ' ' + c.classe(v, l) : '');
      return '<td class="' + cls + '">' + txt + '</td>';
    }).join('') + '</tr>').join('') + '</tbody>';
}
/* Liga (ou religa) o clique de ordenação. Quem reescreve o próprio container — a etapa 6
   troca de indicador, a 5 troca de painel — chama isto de novo no fim, senão a tabela nova
   nasce muda. */
function ptLigarTabelas(raiz) {
  (raiz || document).querySelectorAll('table.pt-tab').forEach(tab => {
    const t = PT_TABELAS[tab.id];
    if (!t) return;
    tab.querySelectorAll('th[data-col]').forEach(th => {
      th.onclick = () => {
        const col = th.dataset.col;
        t.ordem = (t.ordem && t.ordem.col === col)
          ? { col: col, dir: t.ordem.dir === 'asc' ? 'desc' : 'asc' }
          : { col: col, dir: (t.colunas.find(c => c.k === col) || {}).tipo === 'texto' ? 'asc' : 'desc' };
        tab.innerHTML = ptTabCabeca(tab.id) + ptTabCorpo(tab.id);
        ptLigarTabelas(tab.parentElement);
      };
    });
    tab.querySelectorAll('[data-pt-ordem-original]').forEach(bt => {
      bt.onclick = () => {
        t.ordem = t.ordemInicial ? { col: t.ordemInicial.col, dir: t.ordemInicial.dir } : null;
        tab.innerHTML = ptTabCabeca(tab.id) + ptTabCorpo(tab.id);
        ptLigarTabelas(tab.parentElement);
      };
    });
  });
}

/* ---------------- card de etapa ----------------

   Um bloco dentro de uma etapa. O subtítulo não é enfeite: é onde mora a ressalva que
   costuma ser jogada no rodapé ("n=4", "não testável", "o físico do goleiro não existe").
   Aqui ela fica à altura dos olhos, junto do título do que está sendo afirmado. */
function ptCard(titulo, subtitulo, corpo, nota) {
  return '<section class="pt-card">' +
    '<div class="pt-card-cab"><h4>' + esc(titulo) + '</h4>' +
    (subtitulo ? '<span>' + subtitulo + '</span>' : '') + '</div>' +
    '<div class="pt-card-corpo">' + corpo + '</div>' +
    (nota ? '<p class="pt-nota">' + nota + '</p>' : '') + '</section>';
}

/* ================= os três controles obrigatórios (seção 11 da ESPECIFICACAO) =================

   Os três estão na tela, não no rodapé, e dois deles são componentes que as etapas chamam
   de dentro do próprio conteúdo. O motivo é o de sempre: nota de rodapé não é lida na hora
   da decisão, e a decisão aqui é "contrato ou não contrato". */

/* CONTROLE 1 — a baseline do dinheiro, ao lado de TODA proposta.

   `compara` é a proposta que está sendo defendida naquele ponto da tela. Quando ela não
   tem AUC fora da amostra — e uma proposta de elenco não tem —, o componente NÃO fica em
   branco: ele imprime o motivo. Uma proposta sem número comparável é uma informação sobre
   a proposta, não um espaço vazio no controle. */
function ptBaseline(compara) {
  /* Toda leitura passa por ptLer/ptCampo: na aba de pontos `top4_de_valor` virou `top_k_de_valor`,
     `acertos_top4` virou `acertos_top_k` e `loso_sobe_x_resto` virou `loso_alta_x_resto`. Ler o nome
     da Protótipo direto fazia a aba de pontos dizer que faltava um dado que existe. */
  const B = 'controles_obrigatorios.baseline_de_dinheiro';
  const b = ptLer(B) || {};
  const acertos = b[ptCampo(B, 'acertos_top4')];
  const auc = ptLer('etapa_1.auc_posto_de_valor') || {};
  const c = compara || {};
  /* Quantos elencos mais caros contam como "top": sai do tamanho da lista por ano que o próprio
     gerador gravou, não do 4 que está no nome da chave. Na aba de pontos o tamanho MUDA de ano para
     ano (é o tamanho da faixa de cima naquele ano): aí a frase diz de quanto a quanto. */
  const T4 = 'etapa_1.top4_de_valor';
  const t4 = ptLer(T4) || {};
  const campoTop = ptCampo(T4 + '.por_ano', 'top4');
  const tamanhos = (t4.por_ano || []).map(a => Array.isArray((a || {})[campoTop]) ? a[campoTop].length : null)
    .filter(v => v !== null);
  const kMin = tamanhos.length ? Math.min.apply(null, tamanhos) : null;
  const kMax = tamanhos.length ? Math.max.apply(null, tamanhos) : null;
  const kTop = kMin !== null && kMin === kMax ? kMin : null;
  const loso = auc[ptCampo('etapa_1.auc_posto_de_valor', 'loso_sobe_x_resto')];
  const temLoso = loso !== undefined && loso !== null;
  const quem = ptFxRot('sobe', { forma: 'times' });
  const verbo = ptFxRot('sobe', { forma: 'verbo' });
  const topFrase = kTop !== null ? 'entre os ' + ptInt(kTop) + ' elencos mais caros do seu ano'
    : kMin !== null ? 'entre os elencos mais caros do seu ano (a lista muda de tamanho de um ano para o outro: de ' +
      ptInt(kMin) + ' a ' + ptInt(kMax) + ' elencos)' + (t4.regra ? ptTecnico(esc(t4.regra)) : '')
    : null;
  const alvo = c.auc !== null && c.auc !== undefined
    ? '<span class="pt-baseline-quem">' + esc(c.rotulo || 'esta proposta') + '</span>' +
      '<b>' + ptAcerto(c.auc) + '</b>' +
      '<span>' + (c.acertos !== undefined && c.acertos !== null
        ? 'na prática, acertou ' + ptInt(c.acertos) + ' de ' + ptInt(c.de) + ' ' : '') +
        ptTecnico('AUC ' + ptNum(c.auc, 3)) + '</span>'
    : '<span class="pt-baseline-quem">' + esc(c.rotulo || 'o que esta etapa propõe') + '</span>' +
      '<b class="pt-sem">não dá para pôr lado a lado</b><span>' +
      esc(c.motivo || 'quem chamou ptBaseline() não disse se esta proposta tem AUC fora da amostra') +
      '</span>';
  return '<div class="pt-baseline">' +
    '<span class="pt-rot">Controle 1 · quanto o dinheiro sozinho já acerta</span>' +
    '<p class="pt-baseline-frase">' +
      (acertos !== undefined && acertos !== null && b.de !== undefined && topFrase
        ? 'Dos <b>' + ptInt(b.de) + '</b> ' + esc(quem) + ', <b>' + ptInt(acertos) + '</b> estavam ' + topFrase +
          (t4.esperado_por_acaso !== undefined && t4.esperado_por_acaso !== null
            ? ' — no chute, seriam uns ' + ptNum(t4.esperado_por_acaso, 1) : '') + '.'
        : 'Quantos ' + esc(quem) + ' estavam entre os elencos mais caros: ' +
          ptFalta('o ' + ptArquivoDado() + ' não traz a contagem por ano dos elencos mais caros')) +
    '</p>' +
    '<div class="pt-baseline-par">' +
      '<div class="pt-baseline-cel dinheiro">' +
        '<span class="pt-baseline-quem">só o valor do elenco</span>' +
        '<b>' + ptAcerto(b.auc) + '</b>' +
        '<span>Pegue ao acaso um time que ' + esc(verbo) + ' e um que não, e aposte no elenco mais caro: é assim ' +
          'que se lê o número acima (no chute puro, acertaria metade dos pares).' +
          (temLoso ? ' Testado em cada ano sem que a conta tivesse visto aquele ano, ' +
            ptAcerto(loso) + '.' : '') +
          ' ' + ptTecnico('AUC ' + ptNum(b.auc, 3) + (temLoso ? ' · fora da amostra (LOSO) ' +
            ptNum(loso, 3) : '')) + '</span></div>' +
      '<div class="pt-baseline-cel">' + alvo + '</div>' +
    '</div>' +
    '<p class="pt-nota">A regra desta aba: medida, nota ou elenco que não acerte mais do que o dinheiro sozinho, ' +
      'testado num ano que a conta não viu, <b>descreve o passado, mas não serve para recomendar</b>.' +
      (ptPoucaBase(auc) ? ' ' + ptPoucaBase(auc) : '') + '</p>' +
    '</div>';
}

/* CONTROLE 2 — a coluna líquida em toda linha de indicador.

   Bruto é "quem subiu tinha mais disto"; líquido é "quem subiu tinha mais disto DEPOIS de
   descontar o valor do elenco". A diferença entre os dois é o assunto inteiro desta aba, e
   por isso os dois viajam sempre juntos, na mesma linha, nunca em colunas distantes. */
/* O corte que acende o "vive" é o α do estudo, lido de `etapa_0.poder.alfa` — o mesmo que
   proto_a, proto_b e proto_c usam para CONTAR sobreviventes. Estava digitado 0,05 aqui, e
   digitado é o pior lugar para ele estar: hoje o JSON também diz 0,05 e a tela não muda,
   mas no dia em que o estudo apertar o corte para 0,01 as contagens das etapas 3, 7 e 9
   passariam a falar de 1% enquanto estas 293 linhas continuariam acendendo a 5%. A tela
   contradiria a si mesma sem nenhum erro no console — que é justamente o defeito que esta
   aba existe para não ter. Sem α declarado nada acende: verde sem corte conhecido é
   afirmação sem régua, e o title diz por que a linha ficou apagada. */
function ptLiquidaAlfa(universo) {
  return ptAlfa(universo);
}
function ptLiquida(x) {
  const info = ptAlfaInfo(x && x.universo);
  const alfa = info.alfa;
  const sobrevive = alfa !== null && x.p_liq !== null && x.p_liq !== undefined && x.p_liq < alfa;
  const dica = alfa === null
    ? 'Nenhuma linha é marcada como de pé depois do desconto: ' + info.motivo + '.'
    : 'Sem descontar: a comparação direta. Descontado o dinheiro: o que sobra quando se compara time de ' +
      'orçamento parecido. Em destaque: a diferença continua de pé depois do desconto e dificilmente é sorte.';
  /* tamanho + sentido + sorte, nesta ordem. O sentido vai junto porque "média" sozinha não diz
     se quem sobe tem mais ou menos disto — e é o sinal do d que decide a leitura da linha. */
  const lado = (d, p) => {
    const tam = ptTamanho(d);
    const sentido = d === null || d === undefined || isNaN(Number(d)) || tam === 'quase nenhuma' ? ''
      : Number(d) > 0 ? ', para mais' : ', para menos';
    return '<b>' + tam + sentido + '</b> <small>' + ptSorte(p, x.universo) + '</small>';
  };
  return '<span class="pt-liq' + (sobrevive ? ' vive' : '') + '" title="' + esc(dica) + '">' +
    '<span class="pt-liq-par"><i>sem descontar</i> ' + lado(x.d_bruto, x.p_bruto) + '</span>' +
    '<em>→</em>' +
    '<span class="pt-liq-par"><i>descontado o dinheiro</i> ' + lado(x.d_liq, x.p_liq) + '</span>' +
    ptTecnico('d ' + ptD(x.d_bruto) + ' (' + ptP(x.p_bruto) + ') → ' + ptD(x.d_liq) + ' (' + ptP(x.p_liq) + ')') +
    '</span>';
}

/* CONTROLE 3 — o contrafactual do dinheiro ao pé de cada proposta de elenco.

   Lê o bloco `contrafactual` de uma proposta da etapa 14 como ele está. O número que
   importa é o último: a taxa histórica de subida do quartil de valor em que a proposta
   cai. Sem ele, "montamos um elenco" esconde "e ele custa o que custa quem não sobe". */
/* O posto mora numa chave que carrega o ano no próprio nome: `posto_de_valor_em_2025`.
   Ler pelo nome fixo quebra calado no dia em que o estudo andar um ano — a linha viraria
   "sem posto no JSON" num bloco que tem posto. Aqui a chave é achada pela forma, e o ano
   sai dela, que é o único lugar do bloco onde ele está escrito. */
function ptCfPosto(cf) {
  const k = Object.keys(cf).find(c => /^posto_de_valor_em_\d{4}$/.test(c));
  return { valor: k ? cf[k] : undefined, ano: k ? k.slice(-4) : null };
}
/* O quartil de valor dito como faixa de orçamento. Qual quartil é o caro NÃO é suposto pelo número
   (1 poderia ser o mais caro ou o mais barato, conforme quem ordenou): a ordem sai do valor
   mediano de cada quartil em `etapa_1.quartis`. Sem esse dado a tela diz que não sabe a ordem. */
const PT_ORDINAL_FEM = ['', 'segunda', 'terceira', 'quarta', 'quinta', 'sexta', 'sétima', 'oitava', 'nona'];
function ptCascaFaixa(q) {
  const qs = ((((ptDado() || {}).etapa_1) || {}).quartis || [])
    .filter(x => x && x.valor_mediano_eur !== null && x.valor_mediano_eur !== undefined)
    .slice().sort((a, b) => b.valor_mediano_eur - a.valor_mediano_eur);
  const i = qs.findIndex(x => String(x.quartil) === String(q));
  if (i < 0) return 'faixa ' + ptInt(q) + ' ' + ptFalta('o arquivo de dados não diz qual faixa é a mais cara');
  if (i === 0) return 'a mais cara';
  if (i === qs.length - 1) return 'a mais barata';
  return 'a ' + (PT_ORDINAL_FEM[i] || ptInt(i + 1) + 'ª') + ' mais cara';
}
function ptContrafactual(cf) {
  if (!cf) return ptFaltaBloco('Quanto custa esta proposta',
    'esta proposta não trouxe no arquivo de dados a conta do dinheiro (bloco `contrafactual`)');
  const linha = (rot, valor, cls) => '<div class="pt-cf-l' + (cls ? ' ' + cls : '') +
    '"><span>' + rot + '</span><b>' + valor + '</b></div>';
  const po = ptCfPosto(cf);
  const temporada = 'Série B' + (po.ano ? ' ' + ptAno(po.ano) : '');
  const temDe = cf.de !== null && cf.de !== undefined;

  /* "21º de 20" é ordinal impossível, e era o que três das seis propostas imprimiam: o
     núcleo custa menos que o 20º colocado, e o gerador registra exatamente isso em
     `abaixo_de_todos`. Com a marca no dado, a tela escreve o que ela significa em vez de
     mostrar um posto que não existe na tabela. */
  let posto;
  if (cf.abaixo_de_todos === true) {
    posto = temDe
      ? 'mais barato que todos os ' + ptInt(cf.de) + ' elencos da ' + temporada
      : 'mais barato que todos os elencos da ' + temporada + ' — ' +
        ptFalta('o arquivo de dados não diz quantos elencos entram na comparação');
  } else if (po.valor === null || po.valor === undefined) {
    posto = ptFalta('a posição no ranking não está no arquivo de dados');
  } else {
    posto = ptInt(po.valor) + 'º mais caro de ' +
      (temDe ? ptInt(cf.de) : ptFalta('o total de elencos não está no arquivo de dados'));
  }

  /* A escala. "€ 1,6 mi" sozinho não diz se é muito ou pouco; ao lado do 1º, da mediana e
     do 20º da MESMA régua, diz. Os três já estavam no JSON e nunca chegavam à tela. O
     rótulo sai do nome da chave — `referencia_20o_eur` vira "20º" — para que nenhum
     ordinal seja digitado aqui, e para que referência nova apareça sozinha. */
  const refChaves = Object.keys(cf).filter(c => /^referencia_.+_eur$/.test(c));
  const refs = refChaves.length
    ? refChaves.map(c => {
        const cru = c.replace(/^referencia_/, '').replace(/_eur$/, '');
        /* "20º mais caro" é o mais barato dito do avesso: a ponta de baixo ganha o nome dela,
           reconhecida pelo total `de` do próprio bloco, não por um 20 escrito aqui */
        const ord = /^\d+o$/.test(cru) ? Number(cru.slice(0, -1)) : null;
        const rot = cru === 'mediana' ? 'o do meio'
          : ord === 1 ? 'o mais caro'
          : ord !== null && temDe && ord === Number(cf.de) ? 'o mais barato'
          : ord !== null ? 'o ' + ptInt(ord) + 'º' : cru.replace(/_/g, ' ');
        return '<span class="pt-cf-ref"><i>' + esc(rot) + '</i>' +
          (cf[c] === null || cf[c] === undefined ? ptFalta('valor ausente no arquivo de dados') : ptEur(cf[c])) +
          '</span>';
      }).join('')
    : ptFalta('o arquivo de dados não trouxe os elencos de referência — sem eles o valor do ' +
        'núcleo fica sem termo de comparação');
  /* a taxa do quartil tem outro nome na aba de pontos (`taxa_historica_de_alta_do_quartil_pct`);
     lá o gerador grava TAMBÉM a taxa de subida real, com rótulo distinto — e as duas vão à tela */
  const taxa = cf[ptCampo('*', 'taxa_historica_de_subida_do_quartil_pct')];
  const chaveReal = 'taxa_historica_de_subida_real_do_quartil_pct';
  const taxaReal = Object.prototype.hasOwnProperty.call(cf, chaveReal) ? cf[chaveReal] : undefined;

  return '<div class="pt-cf">' +
    '<span class="pt-rot">Controle 3 · quanto custa, e quanto sobe quem custa isso</span>' +
    '<div class="pt-cf-grade">' +
      linha('quanto vale, somado, o núcleo proposto', cf.nucleo_valor_eur === null || cf.nucleo_valor_eur === undefined
        ? ptFalta('a soma não está no arquivo de dados') : ptEur(cf.nucleo_valor_eur)) +
      linha('para comparar, na ' + temporada, refs, 'pt-cf-regua') +
      linha('posição no ranking de valor', posto) +
      linha('faixa de orçamento', cf.quartil === null || cf.quartil === undefined
        ? ptFalta('a faixa não está no arquivo de dados') : ptCascaFaixa(cf.quartil)) +
      linha('dos times dessa faixa de orçamento, quantos ' + esc(ptFxRot('sobe', { forma: 'verbos' })),
        taxa === null || taxa === undefined
          ? ptFalta('a taxa não está no arquivo de dados')
          : '<span class="pt-cf-taxa">' + ptPct(taxa) + '</span>') +
      (taxaReal !== undefined
        ? linha('dos times dessa faixa de orçamento, quantos ' + esc(ptDesfechoRot('sobe', 'verbos')) + ' de fato',
          taxaReal === null ? ptFalta('a taxa não está no arquivo de dados')
            : '<span class="pt-cf-taxa">' + ptPct(taxaReal) + '</span>')
        : '') +
    '</div>' +
    /* Até 14/09 esta nota abria com "A soma está por baixo" e fechava com "o total é um piso".
       O dono decidiu em 14/09 que jogador sem preço no Transfermarkt é, na prática, jogador de
       valor baixo ou sem mercado — não um preço que faltou. Então a soma não fica por baixo por
       causa deles: eles entram como zero, que é o que a soma já faz. A contagem continua na tela
       porque diz de quantos nomes a soma é feita. A faixa salarial é outra coisa: ali é dado que
       falta de verdade, e a nota diz isso separado. */
    ((cf.atletas_sem_valor_de_mercado || cf.sem_faixa_salarial)
      ? '<p class="pt-nota">' +
        (cf.atletas_sem_valor_de_mercado
          ? '<b>' + ptInt(cf.atletas_sem_valor_de_mercado) + '</b> dos <b>' + ptInt(cf.atletas_no_nucleo) +
            /* "na base", não "no Transfermarkt": o `mv` dos candidatos vem da coluna Market value do
               cadastro (preparar_base.py), montado do Transfermarkt e de outras fontes */
            '</b> jogadores do núcleo não têm preço de mercado na base. Jogador sem preço é, na prática, jogador ' +
            'de valor baixo ou sem mercado (leitura do clube, registrada como decisão do dono em 14/09): ' +
            (Number(cf.atletas_sem_valor_de_mercado) === 1 ? 'ele entra' : 'eles entram') +
            ' na soma com valor zero, e a soma não fica por baixo por causa ' +
            (Number(cf.atletas_sem_valor_de_mercado) === 1 ? 'dele' : 'deles') + '.'
          : '') +
        (cf.sem_faixa_salarial
          ? (cf.atletas_sem_valor_de_mercado ? ' ' : '') + '<b>' + ptInt(cf.sem_faixa_salarial) + '</b> ' +
            (Number(cf.sem_faixa_salarial) === 1 ? 'não tem' : 'não têm') + ' faixa salarial na base — isso sim é ' +
            'dado que falta, e a folha fica sem ' + (Number(cf.sem_faixa_salarial) === 1 ? 'esse nome' : 'esses nomes') + '.'
          : '') +
        '</p>'
      : '') +
    (cf.regua ? '<p class="pt-nota"><i>' + esc(cf.regua) + '</i></p>' : '') +
    '</div>';
}

/* ================= o esqueleto ================= */

/* A tarja de conferência. A conferência VOLTOU: o laudo está em
   `_fonte/prototipo/CONFERENCIA.md`. O recálculo por caminho independente bateu, e o que
   os céticos acharam foi bug de código, não número mal copiado — por isso a tarja continua
   no topo, mas dizendo outra coisa. O que ela diz sobre a conferência é prosa com a fonte
   citada (o laudo não é um campo do JSON); o que ela diz sobre o pipeline continua saindo
   do `gerado_em`, da semente e das réplicas, para ninguém ter de lembrar de atualizar
   texto quando o gerador rodar de novo. */
function ptTarja(estado) {
  const E = estado || PT_ATIVA || { conferida: true, rotulos: {} };
  const D = ptDado() || {};   /* o dado ATIVO — na Protótipo é o PROTO */
  const g = D.gerado_em;
  const d = new Date(String(g).replace(' ', 'T'));
  const valida = !isNaN(d.getTime());
  const quando = valida
    ? d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : esc(String(g));
  const horas = valida ? (Date.now() - d.getTime()) / 36e5 : null;
  /* singular tratado nos dois ramos: "há 1 horas" no alto da aba estraga a leitura de tudo
     o que vem depois, e o mesmo vale para o ramo dos dias */
  const desde = horas === null || horas < 0 ? ''
    : horas < 1 ? ' (há menos de uma hora)'
    : horas < 48 ? ' (há ' + ptCascaConcorda(Math.round(horas), 'hora', 'horas') + ')'
    : ' (há ' + ptCascaConcorda(Math.round(horas / 24), 'dia', 'dias') + ')';
  const r = D.replicas || {};
  const co = D.controles_obrigatorios || {};
  const reps = Object.keys(r).filter(k => typeof r[k] === 'number');
  /* O que esta tarja conta — a conferência e as correções — não é campo do JSON: não existe
     lugar no pipeline onde o resultado de uma auditoria se grave. Por isso é prosa, e por isso
     o caminho do laudo vai escrito dentro dela: para que cada afirmação daqui seja conferível
     em outro arquivo. O que é medida continua saindo do dado, no pé. */
  const cLiq2 = ptCampo('etapa_2.linhas', 'd_liq2_SM', D);
  const nFis = (((D.etapa_2 || {}).linhas) || [])
    .filter(l => l[cLiq2] !== null && l[cLiq2] !== undefined).length;
  const CNA = 'etapa_1.controle_n_atletas';
  const ctrl0 = ptLer(CNA, D) || null;
  /* os campos com faixa no nome (media_sobe, d_SC…) são lidos pelo nome do dado ativo */
  const ctrl = ctrl0 ? {
    media_sobe: ctrl0[ptCampo(CNA, 'media_sobe', D)], media_cai: ctrl0[ptCampo(CNA, 'media_cai', D)],
    d_SC: ctrl0[ptCampo(CNA, 'd_SC', D)], p_SC: ctrl0[ptCampo(CNA, 'p_SC', D)],
    rho_posto_atletas_x_posto_valor: ctrl0.rho_posto_atletas_x_posto_valor, p_atletas_x_valor: ctrl0.p_atletas_x_valor,
  } : null;
  const pe = '<p class="pt-tarja-pe">' +
      (co.assert_ano_max ? 'O programa para sozinho se alguma conta enxergar dado de depois de <b>' +
        ptAno(co.assert_ano_max) + '</b>' +
        (co.assert_filtro_competicao ? ', ou jogo que não seja da <b>' +
          esc(co.assert_filtro_competicao) + '</b>' : '') + '. ' : '') +
      ptTecnico('para refazer a conta e chegar no mesmo lugar: semente ' + ptInt(D.semente) +
        (reps.length ? ' · réplicas: ' + reps.map(k => esc(k) + ' ' + ptInt(r[k])).join(', ') : '')) + '</p>';
  /* O laudo de conferência cobre o arquivo da aba Protótipo e nenhum outro. Uma aba que reusa a
     casca com outro dado NÃO herda a frase "refeitos do zero por outras mãos": seria afirmar uma
     auditoria que não aconteceu. Ela diz que o arquivo dela não passou por essa conferência. */
  if (!E.conferida) {
    return '<div class="pt-tarja">' +
      '<b>Estes números ainda não foram refeitos por outras mãos.</b>' +
      '<p>O programa que faz a conta rodou em <b>' + quando + '</b>' + desde +
        ptTecnico(esc(D.gerado_por || (E.rotulos && E.rotulos.gerador) || 'gerador não informado')) +
        '. A conferência independente descrita no relatório da revisão cobre o arquivo da aba Protótipo, ' +
        'não o ' + esc((E.rotulos && E.rotulos.arquivo) || 'arquivo desta aba') + '. Até essa conferência ' +
        'acontecer, leia cada número daqui como resultado do programa, sem a segunda checagem.' +
        ptTecnico('_fonte/prototipo/CONFERENCIA.md') + '</p>' +
      pe + '</div>';
  }
  /* Antes (até 14/09) este ramo contava a CONCLUSÃO da revisão em texto fixo: "a lista bateu item a
     item, sem nenhuma diferença", "as etapas 1 e 3 bateram número a número", "a lista de antes estava
     errada", "o que está na tela já é o resultado corrigido". Nenhum campo do dado sustenta isso — não
     existe chave de revisão no JSON — e a última frase nem é verificável: depende de o gerador ter
     rodado depois do conserto. A tarja agora diz só DO QUE SE TRATA e aponta o laudo; a conclusão
     fica lá, onde pode ser conferida. */
  const num = v => (v !== null && v !== undefined && v !== '' && isFinite(Number(v)) ? Number(v) : null);
  const alfa = ptAlfa(undefined, D);
  let blocoCtrl = '';
  if (ctrl) {
    const ms = num(ctrl.media_sobe), mc = num(ctrl.media_cai), pSC = num(ctrl.p_SC);
    const rho = num(ctrl.rho_posto_atletas_x_posto_valor), pV = num(ctrl.p_atletas_x_valor);
    const firmeSC = alfa !== null && pSC !== null && pSC < alfa;
    /* o negrito só sai com o sinal do dado e com p abaixo do corte de sorte do estudo */
    const achado = ms === null || mc === null ? 'Falta uma das médias no arquivo de dados, então não dá para dizer quem usa mais jogadores.'
      : !firmeSC || ms === mc ? 'Não se viu, com segurança, se quem sobe usa mais ou menos jogadores do que quem cai.'
      : ms < mc ? '<b>Quem sobe usa menos jogadores.</b>' : '<b>Quem sobe usa mais jogadores.</b>';
    /* "não é o dinheiro disfarçado" só com ligação fraca E p acima do corte; ligação firme vira
       aviso; o resto é "não se viu" */
    const dinheiro = alfa === null || rho === null || pV === null
      ? 'Sem medida para dizer se isso tem a ver com o dinheiro.'
      : pV < alfa ? '<b>Parte disso pode ser o dinheiro</b>: os dois andam juntos com segurança.'
      /* "fraca" = as duas faixas de baixo do próprio ptJunto, sem corte digitado de novo aqui */
      : /^(não andam juntos|.* pouco)$/.test(ptJunto(rho)) ? 'Não se viu o dinheiro por trás disso.'
      : 'Não se viu, com segurança, se isso é ou não o dinheiro disfarçado.';
    blocoCtrl = '<p>A revisão apontou uma medida a descontar: quantos jogadores cada time usou. ' +
      'Em média, quem subiu teve ' + ptNum(ctrl.media_sobe, 2) + ' jogadores com dado físico na ' +
      'temporada; quem caiu, ' + ptNum(ctrl.media_cai, 2) + ' — diferença ' + ptTamanho(ctrl.d_SC) + ', e ' +
      ptSorte(ctrl.p_SC) + ' ' + ptTecnico('d ' + ptD(ctrl.d_SC) + ' · ' + ptP(ctrl.p_SC)) + '. ' + achado + ' ' +
      'Número de jogadores e valor do elenco ' + ptJunto(ctrl.rho_posto_atletas_x_posto_valor) + ', e ' +
      ptSorte(ctrl.p_atletas_x_valor) + ' ' +
      ptTecnico('ρ ' + ptNum(ctrl.rho_posto_atletas_x_posto_valor, 3) + ' · ' + ptP(ctrl.p_atletas_x_valor)) + '. ' +
      dinheiro +
      (nFis
        ? ' Como os números físicos são médias por jogador, a lista de indicadores traz uma segunda coluna — ' +
          '<b>descontado o dinheiro e o tamanho do elenco</b> — em ' + ptInt(nFis) + ' linhas, ao lado da que ' +
          'desconta só o dinheiro.'
        : '') + '</p>';
  }
  return '<div class="pt-tarja pt-tarja-ok">' +
    '<b>Estes números passaram por uma conferência independente.</b>' +
    '<p>O programa que faz a conta rodou em <b>' + quando + '</b>' + desde +
      ptTecnico(esc(D.gerado_por || 'gerar_prototipo.py')) +
      '. Houve uma revisão que refez as contas sem usar esse programa. O que ela concluiu — o que bateu, ' +
      'o que não bateu e o que foi mandado corrigir — está no relatório da revisão, e não aqui: o resultado ' +
      'da revisão não é gravado no arquivo de dados, então esta tela não tem como conferir se o que ela ' +
      'mostra já é a conta depois dos consertos.' +
      ptTecnico('_fonte/prototipo/CONFERENCIA.md') + '</p>' +
    blocoCtrl +
    pe +
    '</div>';
}

/* ---------------- a procedência ----------------

   `PROTO.bases` é uma das 24 chaves do topo do JSON e carrega de onde vem TUDO que a aba
   afirma: qual arquivo, com quantas linhas, e sob qual filtro ou corte. A aba passou o dia
   inteiro sem ler essa chave — afirmava 293 indicadores e 16 clube-temporada sem dizer de
   qual painel saíram. Um número sem procedência não é auditável, e esta aba existe para ser
   auditada.

   O bloco é montado ITERANDO as chaves, nunca listando-as: base nova acrescentada ao
   gerador aparece aqui sozinha, e base removida some sozinha. As chaves conhecidas ganham
   nome legível (revisão de linguagem de 13/09); chave nova sem tradução aparece CRUA, e a
   crua vai sempre no `title` — o nome bonito nunca é condição para a linha aparecer.

   A ordem dentro da linha é arquivo → contagens → filtro/corte, porque é a ordem em que se
   confere: abro o arquivo, conto as linhas, checo sob que recorte elas foram contadas. */
function ptBaseVal(chave, valor) {
  if (valor === null || valor === undefined) return ptFalta('vazio no arquivo de dados, sem motivo declarado');
  if (typeof valor === 'boolean') return valor ? 'sim' : 'não';
  if (typeof valor === 'number') {
    /* ano é identificador, não quantidade: ptInt faria "2.025" de 2025. Mas o nome da chave
       sozinho não basta como teste — `atleta_temporada` vale 1.780 e é contagem, não ano.
       Só vira ano quando a chave fala de ano E o valor tem cara de ano. */
    const pareceAno = Number.isInteger(valor) && valor >= 1900 && valor <= 2100;
    const ehAno = /(^|_)(ano|anos|year)(_|$)/.test(chave) ||
      (pareceAno && /(ano|year|temporada|periodo|season)/.test(chave));
    return ehAno ? ptAno(valor) : ptInt(valor);
  }
  return esc(String(valor));
}
/* Achata um nível de aninhamento com a chave pontuada, caso o gerador passe a descrever uma
   base em sub-blocos. Sem isso a linha imprimiria "[object Object]", que é pior que nada. */
function ptBaseCampos(obj, prefixo) {
  const saida = [];
  Object.keys(obj || {}).forEach(k => {
    const v = obj[k], nome = (prefixo ? prefixo + '.' : '') + k;
    if (v && typeof v === 'object' && !Array.isArray(v)) saida.push.apply(saida, ptBaseCampos(v, nome));
    else saida.push([nome, Array.isArray(v) ? v.join(', ') : v]);
  });
  return saida;
}
function ptBases() {
  const b = ((ptDado() || {}).bases) || null;
  if (!b || typeof b !== 'object' || !Object.keys(b).length) {
    return ptFaltaBloco('De onde vêm estes números',
      'o arquivo de dados não diz de onde vieram os números (chave `bases`). Sem isso a aba afirmaria ' +
      'sem dizer de qual planilha, com quantas linhas e com qual recorte — e a tela prefere dizer que não sabe.');
  }
  /* Nome legível para as chaves que existem hoje; chave nova, sem tradução, aparece crua — é o
     preço de a lista continuar se montando sozinha. A chave crua vai sempre no `title`. */
  const NOME_BASE = { painel: 'os times, temporada a temporada', jogos: 'os jogos', tecnico: 'os números técnicos',
    elencos: 'os elencos', skillcorner: 'o físico (SkillCorner)', mercado: 'o mercado de jogadores', kpis: 'os indicadores de jogador' };
  const NOME_CAMPO = { arquivo: 'arquivo', linhas: 'linhas', colunas: 'colunas', usadas: 'colunas usadas',
    filtro: 'recorte', corte: 'recorte', coluna_de_clube: 'coluna que diz o clube', periodo: 'período',
    jogadores: 'jogadores', kpis: 'indicadores', atleta_temporada: 'temporadas de jogador' };
  const nomeCampo = k => NOME_CAMPO[k] ||
    k.replace(/^linhas_serie_b_(\d{4})_(\d{4})$/, 'linhas da Série B, $1 a $2').replace(/_/g, ' ');
  const linhas = Object.keys(b).map(nome => {
    const campos = ptBaseCampos(b[nome]);
    const arq = campos.filter(c => /(^|\.)arquivo$/.test(c[0]));
    const contagens = campos.filter(c => arq.indexOf(c) < 0 && typeof c[1] === 'number');
    const resto = campos.filter(c => arq.indexOf(c) < 0 && contagens.indexOf(c) < 0);
    /* O rótulo e o valor iam colados ("linhas100"): o `<i>` tem margem só no CSS, e em cópia de
       texto a margem some. Os dois-pontos e o espaço vão no texto. Recorte no formato
       "min_tot >= 300" é dito em português; outro recorte vai como veio, em letra de código. */
    const valTxt = (c) => {
      const m = /^min_tot\s*>=\s*(\d+)$/.exec(String(c[1]));
      if (m) return 'jogadores com pelo menos ' + ptInt(Number(m[1])) + ' minutos' + ptTecnico(esc(c[1]));
      if (c[0] === 'coluna_de_clube') return ptTecnico(esc(c[1]));
      return ptBaseVal(c[0], c[1]);
    };
    const cel = (c, cls) => '<span' + (cls ? ' class="' + cls + '"' : '') + ' title="' + esc(c[0]) + '"><i>' +
      esc(nomeCampo(c[0])) + ':</i> ' + valTxt(c) + '</span>';
    return '<li><b title="' + esc(nome) + '">' + esc(NOME_BASE[nome] || nome.replace(/_/g, ' ')) + '</b>' +
      (arq.length
        ? arq.map(c => '<code>' + esc(String(c[1])) + '</code>').join('')
        : '<span class="txt"><i>arquivo:</i> ' + ptFalta('esta fonte não diz de qual arquivo veio') + '</span>') +
      contagens.map(c => cel(c)).join('') +
      resto.map(c => cel(c, 'txt')).join('') +
      '</li>';
  }).join('');
  /* Fechada por padrão: é o primeiro bloco depois da abertura, e quem vai decidir contratação
     travava aqui antes de chegar ao dinheiro. Quem vai conferir abre com um clique. */
  return '<details class="pt-bases">' +
    '<summary class="pt-rot" style="cursor:pointer">Para quem vai conferir: de onde vem cada número</summary>' +
    '<ul>' + linhas + '</ul>' +
    '<p class="pt-nota">Esta lista é lida direto do arquivo de dados, não escrita à mão: se uma fonte nova ' +
      'entrar no estudo, ela aparece aqui sozinha. Toda contagem da aba vem de uma destas linhas.</p>' +
    '</details>';
}

/* Os três controles no topo, antes de qualquer etapa. Aqui eles aparecem como declaração
   do método; dentro das etapas, `ptBaseline` e `ptContrafactual` reaparecem colados na
   afirmação que cada um controla. Repetir é de propósito. */
function ptControles() {
  const dd = ptDado() || {};
  const e1 = dd.etapa_1 || {};
  const cal = (e1.caliper || []).slice().sort((a, b) => b.caliper - a.caliper);
  const cob = e1.cobertura_do_valor || {};
  /* nomes do dado ativo: `subidas_com_controle` → `alta_com_controle`, `quartis[].subiram` → `na_alta`,
     `taxa_de_subida_por_quartil_pct` → `taxa_de_alta_por_quartil_pct` na aba de pontos */
  const cCal = ptCampo('etapa_1.caliper', 'subidas_com_controle');
  const cSub = ptCampo('etapa_1.quartis', 'subiram');
  const taxas = ptLer('etapa_14.taxa_de_subida_por_quartil_pct') || {};
  const taxasReais = ptCampo('*', 'taxa_de_subida_por_quartil_pct') !== 'taxa_de_subida_por_quartil_pct'
    ? ((dd.etapa_14 || {}).taxa_de_subida_real_por_quartil_pct || null) : null;
  const verbos = ptFxRot('sobe', { forma: 'verbos' });
  /* da faixa mais cara para a mais barata — a ordem em que um diretor pergunta */
  const qInfo = {};
  (e1.quartis || []).forEach(q => { qInfo[String(q.quartil)] = q; });
  const quartis = Object.keys(taxas).sort((a, b) =>
    ((qInfo[b] || {}).valor_mediano_eur || 0) - ((qInfo[a] || {}).valor_mediano_eur || 0));
  /* a margem mais apertada primeiro: é a comparação mais exigente, e a que se lê primeiro */
  const calAsc = cal.slice().reverse();
  return '<div class="pt-controles">' +
    ptBaseline({ rotulo: 'aqui no topo', motivo: 'a comparação com o dinheiro aparece dentro de cada etapa, ao lado de cada proposta' }) +

    '<div class="pt-controle">' +
      '<span class="pt-rot">Controle 2 · descontado o dinheiro</span>' +
      '<p class="pt-controle-frase">Time mais caro pode ter mais de quase tudo só por ser mais caro. Por isso nenhum indicador ' +
      'aparece nesta aba sozinho: ao lado dele vai sempre a mesma medida <b>descontado o dinheiro</b> — o que ' +
      'sobra quando se compara time de orçamento parecido. Se a diferença some no desconto, quem estava falando ' +
      'era o dinheiro.</p>' +
      (calAsc.length
        ? '<p class="pt-nota">Para conferir o desconto por outro caminho, cada time que ' + esc(ptFxRot('sobe', { forma: 'verbo' })) +
          ' foi colocado lado a lado com times do mesmo ano e de valor de elenco parecido. ' +
          calAsc.map((c, i) => (i === 0 ? 'Com a margem mais apertada' : i === calAsc.length - 1 ? 'com a mais folgada' : 'com uma margem maior') +
            ', <b>' + ptInt(c[cCal]) + ' dos ' + ptInt(c.de) + '</b> acharam com quem ser comparados (' +
            ptNum(c.controles_medios, 1) + ' times em média) ' + ptTecnico('caliper ±' + ptNum(c.caliper, 2) + ' de posto')).join('; ') +
          '. <b>Só o que continua de pé nessa comparação entre iguais merece ir para a reunião.</b></p>'
        : '<p class="pt-nota"><b>Só o que continua de pé depois do desconto merece ir para a reunião.</b></p>') +
      (cob.pct_do_plantel_mediana !== undefined
        /* Até 14/09 este parágrafo tratava o jogador sem preço como dado faltando ("um cuidado com o
           próprio desconto"). O dono decidiu em 14/09 que jogador sem preço no Transfermarkt é, na
           prática, jogador de valor baixo ou sem mercado. A medida continua na tela — a parte do
           plantel com preço, temporada a temporada, e se ela anda junto com o valor —, mas a
           leitura mudou: time barato ter mais jogador sem preço é o esperado, não um defeito da
           soma. A conclusão continua saindo só quando o dado a sustenta (p abaixo do corte de sorte
           do estudo), e o lado dela sai do sinal do ρ, nunca fixo. */
        ? '<p class="pt-nota">Sobre o valor de mercado: o Transfermarkt não dá preço a todo jogador. ' +
          'Ele dá preço a algo entre <b>' + ptPct(cob.pct_do_plantel_min) + '</b> e <b>' +
          ptPct(cob.pct_do_plantel_max) + '</b> do plantel, conforme a temporada (em metade das temporadas, mais de ' +
          ptPct(cob.pct_do_plantel_mediana) + ' — uns ' + ptInt(cob.tm_com_valor_mediana) + ' jogadores). ' +
          'Jogador sem preço lá é, na prática, jogador de valor baixo ou sem mercado (leitura do clube, registrada ' +
          'como decisão do dono em 14/09): ele conta como jogador do elenco, com valor zero, e a soma do elenco não ' +
          'fica por baixo por causa dele. ' +
          'A parte do plantel com preço e o valor do elenco ' + ptJunto(cob.rho_cobertura_x_valor) + ', e ' +
          ptSorte(cob.p_cobertura_x_valor) +
          ' ' + ptTecnico('ρ ' + ptNum(cob.rho_cobertura_x_valor, 3) + ' · ' + ptP(cob.p_cobertura_x_valor)) + '. ' +
          (ptAlfa() !== null && cob.p_cobertura_x_valor !== undefined && cob.p_cobertura_x_valor !== null &&
            cob.p_cobertura_x_valor < ptAlfa() && Number(cob.rho_cobertura_x_valor) !== 0
            ? (Number(cob.rho_cobertura_x_valor) > 0
                ? '<b>Quanto mais barato o elenco, mais jogador sem preço</b> — coerente com essa leitura: time ' +
                  'barato tem mais jogador de pouco mercado.</p>'
                : '<b>Quanto mais caro o elenco, mais jogador sem preço</b> — o contrário do que essa leitura ' +
                  'faria esperar.</p>')
            : 'Não se viu, com segurança, se elenco mais barato tem mais jogador sem preço.</p>')
        : '') +
    '</div>' +

    '<div class="pt-controle">' +
      '<span class="pt-rot">Controle 3 · quanto custa, e quanto sobe quem custa isso</span>' +
      '<p class="pt-controle-frase">Toda proposta de elenco vem com a conta do dinheiro ao pé: quanto valem os ' +
      'jogadores somados (e a folha, quando se sabe), em que <b>posição do ranking de valor da Série B</b> isso ' +
      'ficaria, e quantos times dessa faixa de orçamento ' + esc(verbos) + ' no passado.</p>' +
      (quartis.length
        ? '<ul class="pt-faixas">' + quartis.map(q => {
            const qi = qInfo[q];
            return '<li><span>' + ptCascaFaixa(q) + '</span><b>' + ptPct(taxas[q]) + '</b>' +
              (qi && qi[cSub] !== undefined && qi.n !== undefined
                ? '<small>' + esc(verbos) + ' ' + ptInt(qi[cSub]) + ' de ' + ptInt(qi.n) + '</small>' : '') +
              (qi && qi.subiram_de_fato !== undefined && cSub !== 'subiram'
                ? '<small>' + esc(ptDesfechoRot('sobe', 'verbos')) + ' de fato ' + ptInt(qi.subiram_de_fato) +
                  (taxasReais && taxasReais[q] !== undefined ? ' (' + ptPct(taxasReais[q]) + ')' : '') + '</small>' : '') +
              '</li>';
          }).join('') + '</ul>'
        : '<p class="pt-nota">' + ptFalta('o ' + ptArquivoDado() + ' não traz a taxa por faixa de orçamento') + '</p>') +
    '</div>' +
    '</div>';
}

/* Um bloco da casca que quebra não pode levar a aba junto: o erro aparece no lugar do bloco. */
function ptSeguro(fn, rotulo) {
  try { return fn(); } catch (err) {
    console.error('[prototipo] ' + rotulo + ' falhou', err);
    return '<div class="pt-erro"><b>' + esc(rotulo) + ' quebrou no meio do desenho.</b><p><code>' +
      esc(String(err && err.message || err)) + '</code></p></div>';
  }
}

/* ================= a escala das matrizes: posição no ranking ou valor medido =================

   O dono lê a matriz em percentil e quer ver também o valor cru, "para ter noção da
   elasticidade". Um botão só por aba troca TODAS as matrizes de uma vez — um botão por painel
   deixaria metade da tela numa escala e metade na outra.

   O botão só existe se alguma etapa disser que sabe desenhar nas duas escalas
   (`ptRegistrarEtapaComEscala(n)`, chamado DE DENTRO de `ptEtapaN` a cada desenho). Botão que
   não muda nada na tela ensina a desconfiar dos outros botões. Ao trocar, a casca redesenha
   inteiras as etapas registradas — e só elas —, e cada uma lê `ptEscala()` para decidir o texto
   da célula. A cor e a ordem continuam as do percentil nas duas escalas: é o que impede a
   leitura de "quem está na frente" de mudar ao apertar o botão. */
function ptEscala(el) {
  const a = ptAba(el);
  return a ? a.escala : 'percentil';
}
function ptRegistrarEtapaComEscala(n, el) {
  const a = (el && ptAbaDe(el)) || PT_ATIVA;
  if (!a || n === null || n === undefined || isNaN(Number(n))) return;
  a.etapasEscala.add(Number(n));
  ptAtualizarBotaoEscala(a);
}
/* Para o que mora FORA de uma etapa registrada e também muda com a escala. `chave` evita que o
   mesmo ouvinte se acumule quando quem registra é redesenhado. Os ouvintes morrem a cada render. */
function ptAoMudarEscala(fn, chave, el) {
  const a = (el && ptAbaDe(el)) || PT_ATIVA;
  if (!a || typeof fn !== 'function') return;
  const k = chave || fn;
  a.ouvintesEscala = a.ouvintesEscala.filter(o => o.k !== k);
  a.ouvintesEscala.push({ k: k, fn: fn });
}
function ptAtualizarBotaoEscala(a) {
  const caixa = a && document.getElementById(a.prefixo + '-escala');
  if (!caixa) return;
  const ets = Array.from(a.etapasEscala).sort((x, y) => x - y);
  /* No valor medido o botão NUNCA some: se a etapa que se registrou deixar de se registrar, a
     pessoa ficaria presa numa escala que mistura anos, sem controle para voltar. */
  const mostra = ets.length > 0 || a.escala === 'cru';
  caixa.hidden = !mostra;
  if (!mostra) { caixa.innerHTML = ''; return; }
  const bt = (v, rot, dica) => '<button type="button" data-pt-escala="' + v + '" aria-pressed="' +
    (a.escala === v ? 'true' : 'false') + '" class="' + (a.escala === v ? 'on' : '') + '" title="' + esc(dica) + '">' +
    esc(rot) + '</button>';
  const lista = ets.length === 1 ? String(ets[0])
    : ets.slice(0, -1).join(', ') + ' e ' + ets[ets.length - 1];
  caixa.innerHTML = '<span class="pt-rot">Números das matrizes</span>' +
    '<div class="pt-escala-bts" role="group">' +
      bt('percentil', 'posição no ano', 'o número da célula é a posição do time no ranking daquele ano, de 0 a 100') +
      bt('cru', 'valor medido', 'o número da célula é o valor medido, na unidade do indicador; a cor continua a da posição') +
    '</div>' +
    '<small>' + (ets.length ? 'troca ' + (ets.length === 1 ? 'a etapa ' : 'as etapas ') + lista
      : 'nenhuma etapa desenhou matriz nas duas escalas desta vez; use para voltar à posição') + '</small>';
}
function ptMudarEscala(valor, prefixo) {
  const a = PT_ABAS[prefixo || (PT_ATIVA || {}).prefixo];
  if (!a || (valor !== 'percentil' && valor !== 'cru') || a.escala === valor) return;
  ptAtivarAba(a.prefixo);
  a.escala = valor;
  /* O registro NÃO é apagado antes de redesenhar: a legenda desenhada no meio da etapa perguntaria
     "a aba tem botão?" e ouviria "não". A etapa se registra de novo (o Set não duplica). */
  Array.from(a.etapasEscala).forEach(n => {
    const e = a.etapas.find(x => x[0] === n);
    if (!e) return;
    ptPreencherEtapa(e, a);
    const corpo = document.getElementById(a.prefixo + '-' + n + '-corpo');
    if (corpo) ptLigarTabelas(corpo);
  });
  a.ouvintesEscala.forEach(o => {
    try { o.fn(valor); } catch (err) { console.error('[prototipo] ouvinte da escala falhou', err); }
  });
  ptAtualizarBotaoEscala(a);
}

/* A legenda de TODA matriz de posição. O dono leu o número da célula como valor; a legenda diz,
   com todas as letras, que é a posição no ranking do ano. No valor medido, ela avisa o que muda
   e o que não muda. `opts`: {escala, unidade, el}. */
function ptLegendaPosto(opts) {
  const o = opts || {};
  const escala = o.escala || ptEscala(o.el);
  const a = ptAba(o.el);
  /* `comBotao:true` dispensa depender da ordem das chamadas dentro da etapa */
  const temBotao = o.comBotao === true || (a && ((a.etapasEscala && a.etapasEscala.size > 0) || a.escala === 'cru'));
  const cores = 'A cor mostra a distância até o meio do ano: quanto mais forte, mais longe do meio; ' +
    'quando o estudo declara que ter menos é melhor, as duas cores trocam de lado.';
  if (escala === 'cru') {
    return '<p class="pt-nota pt-legenda-posto cru"><b>Valor medido.</b> O número de cada célula é o valor ' +
      'medido do indicador' + (o.unidade ? ', em ' + esc(o.unidade)
        : ', na unidade dele — que o arquivo de dados não declara para todas as colunas (passe o cursor no nome para ver quando declara)') + '. ' +
      '<b>Atenção: esse valor mistura anos diferentes</b> — o mesmo número pode ser alto num ano e comum ' +
      'em outro. Por isso <b>a cor e a ordem continuam as da posição no ranking do ano</b>, e não as deste número. ' +
      cores + (temBotao ? ' Para voltar à posição, use o botão «Números das matrizes» no sumário.' : '') + '</p>';
  }
  return '<p class="pt-nota pt-legenda-posto"><b>O número de cada célula não é o valor medido.</b> É a ' +
    '<b>posição do time no ranking daquele ano</b>, de 0 a 100: quanto maior, mais alto o time ficou entre os ' +
    'times daquele ano, e 50 é o do meio. ' + cores +
    (temBotao ? ' Para ver o valor medido, use o botão «Números das matrizes» no sumário.' : '') + '</p>';
}

/* ================= as conclusões: um componente só =================

   O dono pediu as conclusões no topo da aba, no começo de cada etapa e, depois, numa aba só
   delas. Se cada lugar montasse o seu bloco, o mesmo achado sairia com selo num canto e sem
   selo no outro. Por isso existe `ptConclusao(c)`, e os três lugares chamam ele.

   A tela NÃO calcula selo nem formata número: a régua é do estudo, e quem aplica é o gerador
   (`_fonte/prototipo/conclusoes_spec.json`). A tela lê o bloco `conclusoes` já montado — com os
   textos prontos ou com molde + lacunas já formatadas (contrato §8.6; a tela só troca a lacuna
   pelo texto gravado). O campo `forca_esperada_hoje` do spec é previsão, não selo — nunca é lido.

   O que o selo QUER DIZER sai da régua do próprio dado, nesta ordem: `regua.selos_simples[selo]`
   (frase de reunião) → `regua.selos[selo]` quando for objeto `{simples|frase, tecnico|regra}` →
   a reserva PT_SELOS abaixo. A regra técnica (`regua.selos[selo]` em texto, com q, p e BH) vai ao
   lado, no número pequeno e no `title` — nunca no lugar da frase. A reserva se declara no `title`. */
const PT_SELOS = {
  forte: ['forte', 'passa no desconto da sorte de testar muita coisa, continua de pé descontado o dinheiro e se repete onde deu para testar'],
  moderado: ['moderado', 'dificilmente é sorte e resiste ao dinheiro, mas não passa no desconto dos muitos testes, ou não deu para ver se se repete, ou não se repetiu — e só vale se a lista inteira de onde a medida saiu tem mais achados do que a sorte produziria'],
  fraco: ['fraco', 'aparece, mas some no desconto dos muitos testes ou no desconto do dinheiro, ou fica no limite da sorte'],
  sem_sinal: ['sem sinal', 'não apareceu diferença — uma diferença menor do que o estudo consegue enxergar pode existir'],
  nao_da_para_afirmar: ['não dá para afirmar', 'a comparação não foi medida de frente, o intervalo cruza o zero, ou duas contas discordam'],
};
function ptSeloChave(s) {
  return String(s === null || s === undefined ? '' : s).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/[\s-]+/g, '_');
}
function ptEtapaNum(v) {
  if (Array.isArray(v)) return v.length ? ptEtapaNum(v[0]) : null;
  if (typeof v === 'number' && isFinite(v)) return v;
  const m = /etapa[_ ]?(\d+)/i.exec(String(v === null || v === undefined ? '' : v));
  return m ? Number(m[1]) : null;
}
/* `ptConclusoesDo(dado)` — público: {itens, cinco, regua, temas, descartadas}. A aba de conclusões
   monta "por tema" e "o que parecia conclusão e não é" com `temas` e `descartadas`. */
function ptConclusoesDo(dado) {
  const c = dado && dado.conclusoes;
  if (!c || typeof c !== 'object') return null;
  const itens = Array.isArray(c) ? c : (c.itens || c.conclusoes || []);
  return { itens: Array.isArray(itens) ? itens : [], cinco: c.cinco || c.cinco_que_precisa_ler || [],
    regua: c.regua || null, temas: c.temas || null, descartadas: c.descartadas || null };
}
/* Os textos de uma conclusão, nos DOIS formatos que o gerador pode gravar (contrato §8.6):
   (1) pronto: `titulo`, `frase`, `numero`, `ressalva`, `tecnico`;
   (2) molde + lacunas: `molde.{titulo, frase, numero, ressalva, tecnico}` com `{nome}` e
       `lacunas.{nome}.formatado` já formatado pelo gerador. A tela só TROCA `{nome}` pelo texto
       gravado — não formata, não arredonda, não calcula. Lacuna com `formatado` null vira
       ptFalta(`motivo_se_null`); lacuna que o molde pede e o bloco não traz vira ptFalta com esse motivo.
   Devolve HTML (os textos passam por esc). */
function ptConclusaoTexto(x, campo) {
  const vazio = v => v === null || v === undefined || v === '';
  if (!vazio(x[campo])) return esc(String(x[campo]));
  const molde = x.molde && x.molde[campo];
  if (vazio(molde)) return null;
  const lac = x.lacunas || {};
  return String(molde).split(/(\{[A-Za-z0-9_]+\})/).map(p => {
    const m = /^\{([A-Za-z0-9_]+)\}$/.exec(p);
    if (!m) return esc(p);
    const l = lac[m[1]];
    if (!l || typeof l !== 'object') return ptFalta('o gerador não gravou o pedaço “' + m[1] + '” desta frase');
    if (!vazio(l.formatado)) return esc(String(l.formatado));
    return ptFalta(l.motivo_se_null || 'o pedaço “' + m[1] + '” veio vazio e sem motivo');
  }).join('');
}
function ptConclusao(c, opts) {
  const o = opts || {};
  const x = c || {};
  const bloco = ptConclusoesDo(o.dado === undefined ? ptDado() : o.dado) || {};
  const pre = o.prefixo || ptPrefixo();
  const vazio = v => v === null || v === undefined || v === '';
  /* o selo é o CALCULADO pela régua (`selo` ou `selo_calculado`); `forca_esperada_hoje` do spec
     nunca é lido, e `forca_do_documento` só aparece como divergência declarada */
  const seloCru = !vazio(x.selo) ? x.selo : x.selo_calculado;
  const chave = ptSeloChave(seloCru);
  const s = PT_SELOS[chave];
  const regua = bloco.regua || {};
  const doDado = regua.selos && regua.selos[chave];
  const objDado = doDado && typeof doDado === 'object' ? doDado : null;
  const simples = (regua.selos_simples && regua.selos_simples[chave]) ||
    (objDado && (objDado.simples || objDado.frase || objDado.texto)) || null;
  const regra = objDado ? (objDado.tecnico || objDado.regra || null) : (doDado || null);
  const criterios = Array.isArray(x.criterios_do_selo) ? x.criterios_do_selo.map(k =>
    (k && k.criterio ? k.criterio : '') + (k && k.numero !== undefined && k.numero !== null ? ' = ' + k.numero : '') +
    (k && k.passou !== undefined ? (k.passou ? ' (passou)' : ' (não passou)') : '')).filter(Boolean) : [];
  const dicaSelo = [regra ? 'régua: ' + regra : '', criterios.length ? 'critérios: ' + criterios.join('; ') : '']
    .filter(Boolean).join(' · ');
  /* o texto do selo vem da régua gravada pelo gerador (`regua.selos_simples`) quando existir;
     PT_SELOS é a reserva, e a reserva se declara no title */
  const expl = simples ? esc(simples) : s ? esc(s[1]) : '';
  /* o selo vem ANTES da frase, com todas as letras — inclusive "fraco" e "sem sinal" */
  const selo = vazio(seloCru)
    ? '<span class="pt-concl-selo sem">Força da conclusão: não calculada</span> ' +
      ptFalta('o arquivo de dados não traz o selo desta conclusão, e a tela não calcula selo')
    : s
      ? '<span class="pt-concl-selo ' + chave + '"' + (dicaSelo ? ' title="' + esc(dicaSelo) + '"' : '') +
        '>Força da conclusão: ' + esc(s[0]) + '</span><span class="pt-concl-selo-txt"' +
        (simples ? '' : ' title="explicação escrita na tela enquanto o arquivo de dados não grava a da régua em frase simples"') +
        '>' + expl + (regra ? ptTecnico('régua: ' + esc(regra)) : '') + '</span>'
      : '<span class="pt-concl-selo sem">Força da conclusão: ' + esc(seloCru) + '</span> ' +
        ptFalta('selo que a tela não conhece — aparece como veio do arquivo');
  const divergiu = !vazio(x.divergencia_com_o_documento) && x.divergencia_com_o_documento !== false
    ? '<p class="pt-concl-diverge">' + (typeof x.divergencia_com_o_documento === 'string'
        ? esc(x.divergencia_com_o_documento)
        : 'O documento de conclusões dava outra força' + (vazio(x.forca_do_documento) ? '' : ' (' + esc(x.forca_do_documento) + ')') +
          '; vale a que a régua calculou com o dado de hoje.') + '</p>'
    : '';
  const temaNome = vazio(x.tema) ? '' : ((bloco.temas && bloco.temas[x.tema]) || String(x.tema).replace(/_/g, ' '));
  const titulo = ptConclusaoTexto(x, 'titulo');
  const frase = ptConclusaoTexto(x, 'frase');
  const numero = ptConclusaoTexto(x, 'numero');
  const ressalva = ptConclusaoTexto(x, 'ressalva');
  const tecnico = ptConclusaoTexto(x, 'tecnico');
  const n = ptEtapaNum(!vazio(x.etapa) ? x.etapa : x.onde_esta_a_prova);
  const a = PT_ABAS[pre];
  const et = n !== null ? ((a && a.etapas) || PT_ETAPAS).find(e => e[0] === n) : null;
  const link = n === null
    ? ptFalta('a conclusão não diz em que etapa está a prova')
    : o.semLink ? ''
    : '<a href="#" class="pt-concl-link" data-pt-ir="' + n + '" data-pt-prefixo="' + esc(pre) + '">' +
      'ver a prova na etapa ' + n + (et ? ' · ' + esc(et[1]) : '') + ' →</a>';
  return '<article class="pt-concl"' + (vazio(x.id) ? '' : ' data-concl="' + esc(x.id) + '"') + '>' +
    '<div class="pt-concl-cab">' + selo + (temaNome ? '<span class="pt-concl-tema">' + esc(temaNome) + '</span>' : '') + '</div>' +
    divergiu +
    (titulo === null ? '' : '<h5>' + titulo + '</h5>') +
    '<p class="pt-concl-frase">' + (frase === null
      ? ptFalta('a frase desta conclusão ainda não foi montada pelo gerador') : frase) + '</p>' +
    (numero === null ? '' : '<p class="pt-concl-numero">' + numero + '</p>') +
    '<p class="pt-concl-ressalva"><b>O que isto não quer dizer:</b> ' + (ressalva === null
      ? ptFalta('o arquivo de dados não traz a ressalva desta conclusão') : ressalva) + '</p>' +
    '<div class="pt-concl-pe">' + (tecnico === null ? '' : ptTecnico(tecnico)) + link + '</div>' +
    '</article>';
}
/* Sem o bloco: UMA linha discreta no topo da aba, e nada nas etapas — dezessete avisos iguais
   ensinavam a pular aviso. Sem nome de chave nem crase: quem precisa saber qual chave falta
   lê o contrato, não a tela da reunião. */
const PT_CONCL_AUSENTE = 'ainda não gravadas pelo programa que faz a conta. Elas entram aqui, e no começo de cada ' +
  'etapa, com a força já calculada; a tela não escreve conclusão à mão';
function ptConclusoesTopo(dado, opts) {
  const d = dado === undefined ? ptDado() : dado;
  const c = ptConclusoesDo(d);
  if (!c) {
    return '<p class="pt-concl-ausente"><b>O que o estudo conclui:</b> ' + ptFalta(PT_CONCL_AUSENTE) + '</p>';
  }
  const porId = {};
  c.itens.forEach(i => { if (i && i.id !== undefined) porId[i.id] = i; });
  const cinco = Array.isArray(c.cinco) ? c.cinco : [];
  const lista = cinco.length
    ? cinco.map(id => porId[id]
      ? ptConclusao(porId[id], Object.assign({ dado: d }, opts))
      : '<article class="pt-concl">' + ptFalta('a conclusão ' + id + ' está na lista das que precisam ser lidas, mas não está no bloco') + '</article>')
    : c.itens.map(i => ptConclusao(i, Object.assign({ dado: d }, opts)));
  if (!lista.length) {
    return '<p class="pt-concl-ausente"><b>O que o estudo conclui:</b> ' +
      ptFalta('o bloco de conclusões existe no arquivo de dados, mas está vazio') + '</p>';
  }
  const resto = c.itens.length - (cinco.length ? cinco.filter(id => porId[id]).length : c.itens.length);
  return '<section class="pt-concls">' +
    '<span class="pt-rot">O que o estudo conclui</span>' +
    '<h3>' + (cinco.length ? 'As ' + ptInt(cinco.length) + ' que você precisa ler' : 'As conclusões do estudo') + '</h3>' +
    '<div class="pt-concls-lista">' + lista.join('') + '</div>' +
    (resto > 0 ? '<p class="pt-nota">Há mais ' + ptCascaConcorda(resto, 'conclusão', 'conclusões') +
      ' no arquivo de dados: cada uma aparece no começo da etapa onde está a prova.</p>' : '') +
    '</section>';
}
function ptConclusaoDaEtapa(dado, n, opts) {
  const d = dado === undefined ? ptDado() : dado;
  const c = ptConclusoesDo(d);
  /* sem o bloco inteiro, a ausência já está escrita uma vez no topo da aba */
  if (!c) return '';
  const daqui = c.itens.filter(i => i && ptEtapaNum(i.etapa !== undefined && i.etapa !== null && i.etapa !== ''
    ? i.etapa : i.onde_esta_a_prova) === Number(n));
  if (!daqui.length) {
    return '<p class="pt-concl-ausente">Conclusão desta etapa: nenhuma das conclusões do estudo tem a prova aqui.</p>';
  }
  /* a principal (se o gerador marcar) primeiro; as outras continuam, porque escondê-las seria
     escolher na tela o que o estudo não escolheu */
  const ordem = daqui.slice().sort((a, b) => (b.principal ? 1 : 0) - (a.principal ? 1 : 0));
  return '<div class="pt-concls pt-concls-etapa">' +
    ordem.map(i => ptConclusao(i, Object.assign({ dado: d, semLink: true }, opts))).join('') + '</div>';
}

/* ================= o esqueleto das etapas ================= */

function ptSumario(estado) {
  const a = estado || PT_ATIVA;
  const pre = a ? a.prefixo : 'ptEt';
  const ets = (a && a.etapas) || PT_ETAPAS;
  return '<nav class="pt-sumario" id="' + (pre === 'ptEt' ? 'ptSumario' : esc(pre) + '-sumario') + '">' +
    '<div class="pt-escala" id="' + esc(pre) + '-escala" hidden></div>' +
    '<span class="pt-rot">As etapas</span>' +
    ets.map(e =>
      '<button data-etapa="' + e[0] + '"><i>' + e[0] + '</i><span>' + esc(e[1]) + '</span></button>'
    ).join('') + '</nav>';
}

/* ---------------- de que universo vem cada número ----------------

   A aba de pontos grava, em cada etapa, `universo` ("24 clube-temporada da faixa alta…"),
   `estado_nesta_aba` ('adaptada' / 'completa') e `o_que_mudou`. Decisão do dono: cada número diz de
   que universo veio. Um lugar só desenha isso, no cabeçalho da etapa, ao lado da conclusão; na
   Protótipo as chaves não existem e nada aparece. `ptUniverso(texto)` é a marca curta para ir ao
   lado de um número dentro da etapa; `ptUniverso(dado, n)` é o SLOT inteiro da etapa n ("de onde
   vêm os números / o que mudou nesta aba") — o mesmo que a casca põe no cabeçalho, para quem
   precisar dele em outro lugar (a aba de conclusões, um card). Na Protótipo devolve ''. */
function ptTextoUniverso(t) {
  return esc(String(t))
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\bclube-temporada\b/g, 'temporadas de clube');
}
function ptUniverso(texto, n) {
  if (texto && typeof texto === 'object' && !texto.nodeType && n !== undefined && n !== null && !isNaN(Number(n))) {
    return ptUniversoEtapa(texto, Number(n));
  }
  if (texto === null || texto === undefined || texto === '' || typeof texto === 'object') return '';
  return '<span class="pt-universo" title="de que conjunto de times ou jogadores sai este número">de onde: ' +
    ptTextoUniverso(texto) + '</span>';
}
function ptUniversoEtapa(dado, n) {
  const e = (dado || {})['etapa_' + n];
  if (!e || typeof e !== 'object') return '';
  const tem = v => v !== null && v !== undefined && v !== '';
  if (!tem(e.universo) && !tem(e.estado_nesta_aba) && !tem(e.o_que_mudou)) return '';
  const ESTADO = { adaptada: 'adaptada a esta aba', completa: 'igual à da Protótipo' };
  return '<div class="pt-etapa-universo">' +
    (tem(e.universo) ? '<p><b>De onde vêm os números desta etapa:</b> ' + ptTextoUniverso(e.universo) + '</p>' : '') +
    (tem(e.estado_nesta_aba) || tem(e.o_que_mudou)
      ? '<p><b>Nesta aba:</b> ' + (tem(e.estado_nesta_aba) ? esc(ESTADO[e.estado_nesta_aba] || e.estado_nesta_aba) : '') +
        (tem(e.o_que_mudou) ? (tem(e.estado_nesta_aba) ? ' — ' : '') + 'o que mudou: ' + ptTextoUniverso(e.o_que_mudou) : '') + '</p>'
      : '') +
    '</div>';
}

/* O lugar de cada etapa nasce aqui, vazio e identificado. Quem preenche é a função dona —
   e se ela não existir, o lugar continua na tela com o aviso. O slot da conclusão fica FORA do
   corpo: a etapa escreve em `alvo.innerHTML` e apagaria a conclusão se ela morasse dentro. */
function ptEsqueletoEtapa(e, estado) {
  const a = estado || PT_ATIVA;
  const pre = a ? a.prefixo : 'ptEt';
  return '<section class="pt-etapa" id="' + esc(pre) + '-' + e[0] + '">' +
    '<div class="pt-etapa-cab">' +
      '<i class="pt-etapa-n">' + e[0] + '</i>' +
      '<div><h3>' + esc(e[1]) + '</h3><span>' + esc(e[2]) + '</span></div>' +
    '</div>' +
    ptSeguro(() => ptUniversoEtapa(a ? a.dado : ptDado(), e[0]), 'o universo da etapa ' + e[0]) +
    '<div class="pt-etapa-concl">' +
      ptSeguro(() => ptConclusaoDaEtapa(a ? a.dado : ptDado(), e[0], { prefixo: pre }), 'a conclusão da etapa ' + e[0]) +
    '</div>' +
    '<div class="pt-etapa-corpo" id="' + esc(pre) + '-' + e[0] + '-corpo"></div>' +
  '</section>';
}

/* Chama a função dona da etapa dentro de um try: um erro em proto_c.js não pode apagar as
   etapas de proto_a.js. O que aparece no lugar é o erro, com nome de arquivo e função —
   quem estiver escrevendo aquele arquivo precisa ver o que quebrou, não uma tela branca. */
function ptPreencherEtapa(e, estado) {
  const a = estado || PT_ATIVA;
  if (!a) return;
  if (PT_ATIVA !== a) ptAtivarAba(a.prefixo);
  const n = e[0], alvo = document.getElementById(a.prefixo + '-' + n + '-corpo');
  if (!alvo) return;
  const nome = 'ptEtapa' + n;
  const arquivo = a.rotulos.arquivo || 'arquivo de dados';
  const global = a.rotulos.global || 'dado';
  const dados = (a.dado || {})['etapa_' + n];
  if (dados === undefined) {
    alvo.innerHTML = ptFaltaBloco('Etapa ' + n + ' não existe no dado',
      'o ' + arquivo + ' não traz a chave `etapa_' + n + '`. A tela não inventa: se a etapa foi ' +
      'planejada e o dado não veio, o buraco é do pipeline, e aparece aqui.');
    return;
  }
  /* `function ptEtapaN()` no topo de um script clássico vira propriedade do window; um
     `const ptEtapaN = ...` NÃO vira — fica no registro léxico global. O contrato pede a
     forma `function`, mas a casca não pode dar tela em branco por causa disso: se o nome
     não estiver no window, procura-se também no escopo léxico antes de desistir. */
  let fn = window[nome];
  if (typeof fn !== 'function') {
    try { fn = eval(nome); } catch (err) { fn = null; }
  }
  if (typeof fn !== 'function') {
    const chaves = Object.keys(dados).filter(k => k !== 'titulo_chave');
    alvo.innerHTML = '<div class="pt-espera">' +
      '<b>Esta etapa ainda não chegou.</b>' +
      '<p>O arquivo <code>static/' + esc(e[3]) + '</code> precisa definir <code>' + nome +
        '(alvo, dados)</code>. Enquanto não definir, o lugar fica reservado: a tela não esconde a etapa ' +
        'nem preenche com outra coisa.</p>' +
      '<p>O dado já está aqui — <code>' + esc(global) + '.etapa_' + n + '</code> traz ' + ptInt(chaves.length) +
        ' chaves: <code>' + chaves.map(esc).join('</code>, <code>') + '</code>.</p>' +
      '</div>';
    return;
  }
  try {
    fn(alvo, dados);
  } catch (err) {
    alvo.innerHTML = '<div class="pt-erro">' +
      '<b>' + esc(nome) + '() quebrou no meio do desenho.</b>' +
      '<p>Em <code>static/' + esc(e[3]) + '</code>: <code>' + esc(String(err && err.message || err)) + '</code></p>' +
      '<p>O que está escrito acima desta linha pode estar pela metade. As outras etapas continuam de pé.</p>' +
      '</div>';
    /* o stack inteiro vai para o console: na tela cabe a mensagem, não o rastro */
    console.error('[prototipo] ' + nome + ' falhou', err);
  }
}

/* O sumário rola A CAIXA DA ABA, não a página — mesmo motivo do índice da aba Série B:
   `scrollIntoView` sobe todos os ancestrais roláveis, inclusive o documento, e leva embora
   a faixa do topo com o escudo e as abas, que não volta porque a roda está travada no
   body. Aqui a caixa que rola de verdade é encontrada e movida sozinha.
   `prefixo` diz de qual aba é a etapa; sem ele, a aba ativa. */
/* Quem mostra/esconde abas é o app.js. Um link de conclusão clicado DENTRO da aba de conclusões
   rolaria uma seção escondida e nada aconteceria; por isso, antes de rolar, a casca chama os ganchos
   `ptAoIrParaEtapa(fn(prefixo, n))` e dispara o evento `pt-ir` no documento ({detail:{prefixo, n}}).
   O app.js registra ali o `irParaAba` da aba daquele prefixo. */
const PT_AO_IR = [];
function ptAoIrParaEtapa(fn) {
  if (typeof fn === 'function' && PT_AO_IR.indexOf(fn) < 0) PT_AO_IR.push(fn);
}
function ptIrParaEtapa(n, prefixo) {
  const pre = prefixo || ptPrefixo();
  PT_AO_IR.forEach(fn => {
    try { fn(pre, Number(n)); } catch (err) { console.error('[prototipo] ptAoIrParaEtapa falhou', err); }
  });
  try { document.dispatchEvent(new CustomEvent('pt-ir', { detail: { prefixo: pre, n: Number(n) } })); } catch (err) { /* navegador sem CustomEvent: os ganchos acima já rodaram */ }
  const sec = document.getElementById(pre + '-' + n);
  if (!sec) return;
  let caixa = sec.parentElement;
  while (caixa && caixa !== document.body) {
    const ov = getComputedStyle(caixa).overflowY;
    if (/(auto|scroll)/.test(ov) && caixa.scrollHeight > caixa.clientHeight) break;
    caixa = caixa.parentElement;
  }
  if (!caixa || caixa === document.body) { sec.scrollIntoView({ block: 'start' }); return; }
  const destino = () => caixa.scrollTop + (sec.getBoundingClientRect().top - caixa.getBoundingClientRect().top) -
    12 - ptAlturaGrudada(sec, pre);
  caixa.scrollTo({ top: destino(), behavior: 'smooth' });
  ptReajustarSalto(caixa, destino);
}

/* O primeiro salto depois de abrir a aba caía no meio de outra etapa (título a ~800 px do topo),
   e só os seguintes acertavam. Motivo: a conta do destino é feita ANTES de a rolagem passar pelas
   etapas do caminho, e algumas delas só montam o conteúdo quando chegam perto da tela (as matrizes
   da etapa 2, por exemplo) — a página cresce acima da etapa durante a viagem e o destino já calculado
   fica velho. No segundo clique tudo já está montado, por isso acertava.
   Conserto: esperar a rolagem assentar, medir de novo e, se a etapa não está onde deveria, pular
   direto (sem animação) para a posição nova. Repete enquanto a montagem continuar mexendo na página,
   com teto de tentativas. Um salto novo cancela o anterior, e a pessoa mexendo na rolagem também —
   o reajuste não pode arrancar a tela da mão de quem já está lendo. */
let PT_SALTO_VEZ = 0;
function ptReajustarSalto(caixa, destino) {
  const vez = ++PT_SALTO_VEZ;
  let largou = false;
  const soltar = () => { largou = true; };
  const eventos = ['wheel', 'touchstart', 'keydown', 'mousedown'];
  eventos.forEach(ev => caixa.addEventListener(ev, soltar, { passive: true, once: true }));
  const fim = () => eventos.forEach(ev => caixa.removeEventListener(ev, soltar));
  let ultimo = -1, parado = 0, correcoes = 0;
  const inicio = Date.now();
  const passo = () => {
    if (vez !== PT_SALTO_VEZ || largou || Date.now() - inicio > 8000) { fim(); return; }
    const agora = caixa.scrollTop;
    parado = Math.abs(agora - ultimo) < 1 ? parado + 1 : 0;
    ultimo = agora;
    /* ~10 quadros sem mexer = a rolagem suave terminou (ou bateu no fim da caixa) */
    if (parado < 10) { requestAnimationFrame(passo); return; }
    const alvo = Math.max(0, Math.min(destino(), caixa.scrollHeight - caixa.clientHeight));
    if (Math.abs(alvo - agora) <= 2 || correcoes >= 6) { fim(); return; }
    correcoes++;
    caixa.scrollTo({ top: alvo, behavior: 'auto' });
    parado = 0;
    requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

/* Em tela estreita o sumário deixa de ser coluna ao lado e gruda EM CIMA das etapas; saltar só
   12 px acima da etapa deixava o título dela atrás dele. Mede-se o que de fato está grudado e
   sobreposto na horizontal (em tela larga ele fica ao lado e a conta dá zero), em vez de um número
   fixo que muda com a largura e com quantas linhas os botões ocupam. */
function ptAlturaGrudada(sec, pre) {
  const sum = document.getElementById(pre === 'ptEt' ? 'ptSumario' : pre + '-sumario');
  if (!sum || getComputedStyle(sum).position !== 'sticky') return 0;
  const rs = sum.getBoundingClientRect(), re = sec.getBoundingClientRect();
  const sobrepoe = rs.left < re.right && re.left < rs.right;
  return sobrepoe ? Math.ceil(rs.height) : 0;
}

function ptLigarSumario(alvo, estado) {
  const a = estado || PT_ATIVA;
  const pre = a ? a.prefixo : 'ptEt';
  const botoes = Array.from(alvo.querySelectorAll('.pt-sumario button[data-etapa]'));
  botoes.forEach(b => { b.onclick = () => ptIrParaEtapa(+b.dataset.etapa, pre); });
  const caixaEscala = alvo.querySelector('#' + pre + '-escala');
  if (caixaEscala) {
    caixaEscala.onclick = ev => {
      const b = ev.target && ev.target.closest ? ev.target.closest('[data-pt-escala]') : null;
      if (b) ptMudarEscala(b.dataset.ptEscala, pre);
    };
  }
  /* qual etapa está sendo lida agora: sem isso, dezesseis botões iguais não dizem onde a
     pessoa está no meio de uma rolagem longa */
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entradas => {
    entradas.forEach(en => {
      if (!en.isIntersecting) return;
      const n = en.target.id.slice(pre.length + 1);
      botoes.forEach(b => b.classList.toggle('on', b.dataset.etapa === n));
      /* no celular o sumário é uma linha que rola de lado: o botão aceso pode estar fora da vista.
         Move-se só a própria linha (scrollIntoView levaria junto a caixa da aba e o topo) */
      const on = botoes.find(b => b.dataset.etapa === n);
      const lin = on && on.parentElement;
      if (lin && lin.scrollWidth > lin.clientWidth + 1) {
        const dx = on.getBoundingClientRect().left - lin.getBoundingClientRect().left;
        if (dx < 0 || dx + on.offsetWidth > lin.clientWidth) lin.scrollLeft += dx - 24;
      }
    });
  }, { rootMargin: '-10% 0px -75% 0px', threshold: 0 });
  ((a && a.etapas) || PT_ETAPAS).forEach(e => {
    const sec = document.getElementById(pre + '-' + e[0]);
    if (sec) obs.observe(sec);
  });
  if (a) a.observador = obs;
}

/* "16 de quem subiu, 48 de quem ficou no meio e 16 de quem caiu" na Protótipo; com faixas no
   dado, cada contagem com o rótulo da faixa. As chaves de contagem saem de ptFx. */
function ptCascaContagemFaixas(dado) {
  const e0 = (dado || {}).etapa_0 || {};
  const pedacos = dado && dado.faixas
    ? ptFxLista(dado).map(f => (e0[f.chave] === undefined || e0[f.chave] === null
        ? ptFalta('a etapa 0 não traz a contagem desta faixa no topo')
        : ptInt(e0[f.chave])) + ' na <span title="' + esc(f.definicao) + '">' + esc(f.nome) + '</span>')
    : ['sobe', 'meio', 'cai'].map(k => ptInt(e0[k]) + ' ' +
        { sobe: 'de quem subiu', meio: 'de quem ficou no meio', cai: 'de quem caiu' }[k]);
  return pedacos.slice(0, -1).join(', ') + ' e ' + pedacos[pedacos.length - 1];
}

/* ================= o render =================

   `ptRender()` sem argumento é a aba Protótipo, exatamente como o app.js chama hoje.
   `ptRender(cfg)` desenha qualquer dado com a mesma forma:
     cfg.dado      — o objeto (ex.: PONTOS). Obrigatório fora do atalho.
     cfg.alvo      — elemento ou seletor do container (padrão '#ptCorpo').
     cfg.prefixo   — prefixo de TODO id da aba (padrão 'ptEt'; a de pontos, por ex. 'poEt').
     cfg.rotulos   — {aba, titulo, sub, arquivo, global, script, gerador, nomeAba}: os textos que
                     citam o arquivo de dados; os padrões são os da Protótipo.
     cfg.etapas    — outra lista no formato de PT_ETAPAS (títulos que falam de faixa de pontos).
     cfg.conferida — se o laudo de conferência cobre este dado. Padrão: só quando dado === PROTO.
     cfg.escala    — escala inicial ('percentil' | 'cru'); ao redesenhar a mesma aba, vale a
                     escolha que a pessoa já tinha feito. */
function ptRender(cfg) {
  const c = cfg || {};
  const prefixo = String(c.prefixo || 'ptEt');
  const alvo = c.alvo && c.alvo.nodeType ? c.alvo : $(c.alvo || '#ptCorpo');
  if (!alvo) return;
  const temProto = typeof PROTO !== 'undefined';
  const dado = Object.prototype.hasOwnProperty.call(c, 'dado') ? c.dado : (temProto ? PROTO : undefined);
  const rot = Object.assign({
    aba: 'Protótipo · o caminho até a conclusão',
    titulo: 'Passo a passo: o que foi testado, e o que não passou',
    arquivo: 'prototipo.json', global: 'PROTO', script: 'static/prototipo.js',
    gerador: 'gerar_prototipo_js.py', nomeAba: 'A aba Protótipo',
  }, c.rotulos || {});
  if (dado === undefined || dado === null) {
    alvo.innerHTML = ptFaltaBloco(rot.nomeAba + ' não tem dado',
      rot.script + ' não carregou. Rode `python3 ' + rot.gerador + '` e recarregue a página.');
    return;
  }

  /* o render anterior DESTA aba sai inteiro: observador, tabelas registradas e ouvintes */
  const velho = PT_ABAS[prefixo];
  if (velho && velho.observador) velho.observador.disconnect();
  Object.keys(PT_TABELAS).forEach(k => { if (k.indexOf(prefixo + '-') === 0) delete PT_TABELAS[k]; });
  const estado = {
    prefixo: prefixo, dado: dado, alvo: alvo, rotulos: rot,
    etapas: Array.isArray(c.etapas) && c.etapas.length ? c.etapas : PT_ETAPAS,
    conferida: c.conferida !== undefined ? !!c.conferida : (temProto && dado === PROTO),
    escala: velho ? velho.escala : (c.escala === 'cru' ? 'cru' : 'percentil'),
    etapasEscala: new Set(), ouvintesEscala: [], observador: null,
  };
  PT_ABAS[prefixo] = estado;
  alvo.dataset.ptAba = prefixo;
  ptLigarGanchos();
  ptAtivarAba(prefixo);
  const e0 = dado.etapa_0 || {};

  alvo.innerHTML =
    '<div class="pt-topo">' +
      '<span class="pt-rot">' + esc(rot.aba) + '</span>' +
      '<h2 class="pt-h1">' + esc(rot.titulo) + '</h2>' +
      '<p class="pt-sub">' + (rot.sub !== undefined ? rot.sub :
        (e0.linhas_completas !== undefined
          ? 'O estudo olha <b>' + ptInt(e0.linhas_completas) + '</b> temporadas completas de clubes da Série B — ' +
            ptCascaContagemFaixas(dado) + ' — e <b>' + ptInt(e0.indicadores_pre_declarados) + '</b> indicadores escolhidos ' +
            '<b>antes</b> do primeiro teste, para ninguém escolher depois só o que deu certo. '
          : '') +
        /* "A maior parte não passou" era fixo: nenhum campo decidia. O que é regra da aba (o que não
           passou fica na tela) continua; o quanto passou quem diz são as etapas, lidas do dado. */
        'O que não passou continua na tela, com o número que o reprovou ao lado. ' +
        'Os passos estão na ordem em que foram feitos, porque é assim que dá para conferir: cada um ' +
        'só usa o que o anterior deixou de pé.') + '</p>' +
    '</div>' +

    ptSeguro(() => ptTarja(estado), 'a tarja de conferência') +
    ptSeguro(ptBases, 'a procedência') +
    ptSeguro(() => ptConclusoesTopo(dado, { prefixo: prefixo }), 'o bloco de conclusões') +
    ptSeguro(ptControles, 'os controles obrigatórios') +

    '<div class="pt-quadro">' +
      ptSumario(estado) +
      '<div class="pt-trilha">' + estado.etapas.map(e => ptEsqueletoEtapa(e, estado)).join('') + '</div>' +
    '</div>';

  estado.etapas.forEach(e => ptPreencherEtapa(e, estado));
  ptLigarTabelas(alvo);
  ptLigarSumario(alvo, estado);
  ptAtualizarBotaoEscala(estado);
}
