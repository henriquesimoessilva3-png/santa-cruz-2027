/* ================= aba Protótipo — etapas 9 a 15 =================

   As réguas, o mercado e o que não dá. É a metade da aba em que o estudo para de descrever
   quem subiu e começa a sugerir contratação — e por isso é a metade em que o controle do
   dinheiro e a palavra "ausência" precisam aparecer mais, não menos.

   Vale aqui a regra da aba inteira: **o dado é a fonte, o texto é consequência.** Nenhum
   número deste arquivo foi digitado. Quando uma frase tem número dentro, o número saiu do
   dado ativo (`ptDado()`, que é o prototipo.json na aba Protótipo e o arquivo da outra aba
   quando a casca desenhar outra) na hora em que a frase foi montada, e se o dado mudar a
   frase muda junto — inclusive quando a frase deixar de ser verdadeira. Duas frases deste
   arquivo são condicionais por isso: a da etapa 11 ("o que você compra é o físico e o
   duelo") e a do veredito do backtest nas etapas 13 e 14. Elas só são escritas se os
   números as sustentarem; se não sustentarem, a tela escreve o que os números dizem.

   O que NÃO existe neste arquivo, de propósito:
   - nenhum helper `pt…` redefinido (eles vêm de proto.js e são de todos; redefinir um aqui
     quebraria as etapas dos outros dois arquivos, porque o último script carregado ganha);
   - nenhuma classe de CSS nova — só as publicadas no contrato; o que precisou de geometria
     foi feito com `style=""` e com SVG montado à mão;
   - nenhum "—" pelado. Todo vazio deste arquivo carrega o motivo do vazio, e boa parte dos
     motivos é calculada: a etapa 10 não diz "sem líquido", ela PROCURA o indicador no
     catálogo da etapa 2 e diz que não achou.

   Os filtros das etapas 13 e 14 usam os grupos de liga, a regra de nacionalidade e a regra
   de idade do app.js (GRUPOS_LIGA, GRUPOS_LIGA_ROTULOS, NACAO_MODOS, passaNacao, passaIdade).
   O app.js carrega DEPOIS deste arquivo; as constantes dele só são lidas dentro de funções
   que o ptRender chama, quando o app.js já rodou. Se a ordem dos <script> mudar, a barra de
   filtros escreve a ausência em vez de quebrar a etapa (ver pcApp).

   Contrato: static/proto_contrato.md. Funções locais levam prefixo `pc`. */
'use strict';

/* Cache de leitura do dado e estado de filtro, num objeto só.
   As etapas 12, 13 e 14 abrem TUDO desde 14/09 (pedido do dono: "tudo aberto, sem clicar"),
   então o estado "qual degrau / qual setor / qual proposta está aberto" deixou de existir.
   Sobram dois tipos de coisa, com vidas diferentes:
   - cache do dado (catálogo, clubes que subiram): é do DADO, e zera quando o dado ativo troca
     de objeto — senão a aba de pontos mostraria os nomes calculados com o Protótipo, calada;
   - filtros: são da TELA de cada aba, chaveados pelo prefixo (`ptEt-13`, `poEt-13`), para que
     filtrar os candidatos numa aba não esconda linhas na outra. */
const PC = { catalogo: null, clubes: undefined, clubesMotivo: undefined, filtros: {} };
ptAoTrocarDado(function () {
  PC.catalogo = null;
  PC.clubes = undefined;
  PC.clubesMotivo = undefined;
});

/* ---------------- pontes com o dado que mora em outra etapa ----------------

   A etapa 10 precisa do líquido de valor, que só existe no catálogo da etapa 2; a etapa 9
   precisa dos nomes dos 16 que subiram, que só existem na matriz da etapa 5; a etapa 13
   precisa saber quais ligas ficaram sem cobertura física, que é dado da etapa 12; a 14 lê o
   teste da nota, que é da 13. Nenhuma dessas pontes pode ser escrita à mão: são consultas ao
   dado ativo, e quando a chave não existir a função devolve vazio e quem chamou escreve a
   ausência. */
function pcEtapa(n) {
  const d = ptDado();
  return (d && d['etapa_' + n]) || null;
}
function pcCatalogo() {
  if (PC.catalogo) return PC.catalogo;
  const m = {};
  const e2 = pcEtapa(2);
  (e2 && e2.linhas ? e2.linhas : []).forEach(l => { m[l.indicador] = l; });
  PC.catalogo = m;
  return m;
}
function pcRhoDaEtapa6() {
  const e6 = pcEtapa(6);
  return (e6 && e6.rho) || {};
}
function pcLigasSemFisico() {
  const e12 = pcEtapa(12);
  return (e12 && e12.ligas_sem_cobertura_fisica) || [];
}
/* Os 16 clube-temporada que subiram, na ordem em que o pipeline os guardou. O contrato diz
   que `etapa_9.reguas[*].sobe`, `etapa_5.paineis[*].clubes` e `etapa_8.tipologia.plano`
   estão na mesma ordem — e que isso foi conferido entre as duas últimas. Aqui a ordem é
   LIDA das outras etapas, nunca digitada; se a etapa 5 e a 8 discordarem entre si, a etapa
   9 mostra número em vez de nome e diz por quê, em vez de rotular o clube errado. */
function pcClubesQueSubiram() {
  if (PC.clubes !== undefined) return PC.clubes;
  const e5 = pcEtapa(5);
  const e8 = pcEtapa(8);
  let a = null, b = null;
  if (e5 && e5.paineis) {
    const p = Object.keys(e5.paineis).map(k => e5.paineis[k]).find(x => x && x.clubes && x.clubes.length);
    if (p) a = p.clubes.map(c => ({ clube: c.clube, ano: c.ano }));
  }
  if (e8 && e8.tipologia && e8.tipologia.plano) {
    b = e8.tipologia.plano.map(c => ({ clube: c.clube, ano: c.ano }));
  }
  let saida = null, motivo = '';
  if (a && b && a.length === b.length && a.every((x, i) => x.clube === b[i].clube && x.ano === b[i].ano)) {
    saida = a;
  } else if (a || b) {
    saida = a || b;
    motivo = 'a lista de clubes da etapa 5 e a da etapa 8 não batem uma com a outra';
  } else {
    motivo = 'nem a etapa 5 nem a etapa 8 trouxeram a lista dos clube-temporada que subiram';
  }
  PC.clubes = saida;
  PC.clubesMotivo = motivo;
  return saida;
}
/* O alfa é decisão do estudo, não deste arquivo: vem da casca (`ptAlfa`), que lê o corte
   declarado no dado ativo e devolve null quando ele não existe ou é ambíguo. Escrever 0,05
   aqui seria número digitado que continuaria na tela caso o pipeline mudasse de critério. */
function pcAlfa() {
  const a = ptAlfa();
  return a === null || a === undefined ? null : Number(a);
}
function pcPassa(p) { const a = pcAlfa(); return a !== null && p !== null && p !== undefined && p < a; }
/* O nome do eixo é a chave do JSON ("A_posse_construcao"). Ele aparece na tela como a chave
   que é — letra do eixo destacada e o resto em fonte de código —, porque inventar um título
   bonito criaria um nome que não existe em lugar nenhum do pipeline e que ninguém
   conseguiria procurar no arquivo. */
function pcNomeEixo(k) {
  /* O nome em português vem do mapa único da casca (ptNomeRegua); a chave exata continua ao lado,
     em ptTecnico, para quem for procurar no arquivo. */
  const s = String(k);
  const corte = s.indexOf('_');
  if (corte < 1) return esc(ptNomeRegua(s)) + ptTecnico(esc(s));
  return '<b>' + esc(s.slice(0, corte)) + '</b> ' + esc(ptNomeRegua(s)) + ptTecnico(esc(s));
}
function pcLista(arr) { return (arr || []).map(x => '<code>' + esc(x) + '</code>').join(' · '); }
function pcMin(a) { return a.reduce((x, y) => (y < x ? y : x), a[0]); }
function pcMax(a) { return a.reduce((x, y) => (y > x ? y : x), a[0]); }
/* Nenhuma mediana é recalculada neste arquivo de propósito: a etapa 11 já publica
   `rho_mediano`, `rho_mediano_mudou` e `rho_mediano_ficou`, e recalcular um número que o
   pipeline já divulgou é convidar os dois a divergirem sem ninguém perceber. */
/* Grade de blocos sem classe própria. O contrato proíbe inventar CSS (três arquivos mexendo
   no mesmo style.css ao mesmo tempo perdem trabalho um do outro), então o que precisa de
   duas colunas usa grid inline. É feio no código e correto na tela. */
function pcGrade(minimo, html) {
  return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(' + minimo +
    'px,1fr));gap:12px">' + html + '</div>';
}
function pcNumeroSolto(rot, valor, nota) {
  return '<div style="padding:9px 11px;background:var(--veu2);border-radius:7px">' +
    '<span class="pt-rot">' + esc(rot) + '</span>' +
    '<b style="display:block;font-size:18px;margin-top:3px;font-variant-numeric:tabular-nums">' + valor + '</b>' +
    (nota ? '<span style="font-size:11px;color:var(--tinta3);display:block;margin-top:2px">' + nota + '</span>' : '') +
    '</div>';
}

/* ---------------- a tradução, do jeito desta metade da aba ----------------

   O vocabulário é o de proto.js (ptTamanho, ptSorte, ptAcaso, ptJunto, ptTecnico) e nenhum
   outro. O que mora aqui é só a montagem repetida: a contagem com a unidade dita por extenso
   (no lugar do "n ="), o nome legível de um indicador (lido do catálogo, nunca de um
   dicionário escrito à mão), e o par "antes e depois de descontar o dinheiro" em frase. */
function pcDeMedidas(usadas, noBloco) {
  return ptInt(usadas) + ' de ' + ptInt(noBloco) + (Number(noBloco) === 1 ? ' medida' : ' medidas');
}
function pcQtd(n, unidade) {
  if (n === null || n === undefined) return ptFalta('o estudo não registrou quantos ' + (unidade || 'são'));
  return '<span class="pt-n">' + ptInt(n) + (unidade ? ' ' + esc(unidade) : '') + '</span>';
}
/* A chave do JSON com os sublinhados trocados por espaço. Não é um nome inventado: é a
   mesma chave, legível — e a chave exata vai ao lado, em ptTecnico, para quem for procurar. */
function pcNomeChave(k) { return esc(String(k).replace(/_+/g, ' ').trim()); }
/* O nome do indicador como o catálogo da etapa 2 o escreve. Fora do catálogo, a chave
   legível; em qualquer caso a chave exata fica disponível no `title`. */
function pcNomeInd(k) {
  /* Nome popular pelo dicionário único da casca: "psv99" na etapa 9 e "velocidade máxima" na 6
     eram a mesma medida com dois nomes. */
  return '<span title="' + esc(k) + '">' + esc(ptNomeIndicador(k)) + '</span>';
}
function pcListaNomes(arr) { return (arr || []).map(pcNomeInd).join(' · '); }
/* "Quem subiu tem mais/menos disto" — o sinal dito em palavra, porque o sinal é metade do
   que a linha afirma. Não diz "melhor": o lado bom depende do indicador. */
function pcLado(d, quem, outro) {
  if (d === null || d === undefined || Number(d) === 0) return '';
  return quem + ' tem ' + (Number(d) > 0 ? 'mais' : 'menos') + ' que ' + outro;
}
/* Diferença em uma célula: tamanho, veredito de sorte e o número técnico ao lado. */
function pcDif(d, p) {
  if (d === null || d === undefined) return ptFalta('sem diferença medida');
  return '<b>' + ptTamanho(d) + '</b>' + (p !== undefined ? ' · ' + ptSorte(p) : '') +
    ptTecnico('d ' + ptD(d) + (p !== undefined ? ' · ' + ptP(p) : ''));
}
/* O controle 2 (bruto → líquido) em frase. Continua ao lado de toda linha de indicador, e o
   destaque de "continua separando" usa o mesmo α do estudo que ptLiquida usa. */
function pcDinheiro(x) {
  const vive = pcPassa(x.p_liq);
  return '<span class="pt-liq' + (vive ? ' vive' : '') + '">' +
    '<i>sem desconto</i> ' + ptTamanho(x.d_bruto) + ', ' + ptSorte(x.p_bruto) +
    '<em>→</em>' +
    '<i>descontado o dinheiro</i> ' + ptTamanho(x.d_liq) + ', ' + ptSorte(x.p_liq) +
    '</span>' +
    ptTecnico('d ' + ptD(x.d_bruto) + ' (' + ptP(x.p_bruto) + ') → ' + ptD(x.d_liq) + ' (' + ptP(x.p_liq) + ')');
}
/* O nome de cada porta, dito pelo que ela significa. A letra continua ao lado, em ptTecnico.
   A frase de cada nome está nos comentários desta etapa desde a primeira versão ("a porta D é
   o placar redescrito; a porta B separa e não se repete") e na `porta_motivo` do catálogo.
   Porta sem nome aqui aparece pela letra — a tela não inventa significado para ela. */
/* O texto mora em proto.js (ptPortaTxt), o mesmo da etapa 2. O resumo da letra, porém, é só a
   reserva: a letra B junta dois motivos diferentes no dado ("não se repete" e "não sobra depois de
   descontar a sorte de testar muitos"), e o motivo GRAVADO na linha do catálogo diz qual dos dois
   vale para aquela medida. Quando ele existe e é da mesma letra, é ele que aparece. */
function pcPorta(letra, el, motivo, plural) {
  /* Linha sem porta (a aba de pontos não grava o campo) escrevia "porta undefined". */
  if (letra === undefined || letra === null || letra === '') {
    return ptFalta('o ' + ptArquivoDado(el) + (plural
      ? ' não traz a porta destas linhas: a tela não diz por que elas ficam de fora'
      : ' não traz a porta desta linha: a tela não diz por que ela fica de fora') +
      ' em vez de inventar um motivo');
  }
  const txt = motivo ? esc(motivo) : (ptPortaTxt(letra) ? esc(ptPortaTxt(letra)) : 'porta ' + esc(letra));
  return txt + ptTecnico('porta ' + esc(letra) + (motivo ? ' · motivo gravado no catálogo da etapa 2' : ''));
}
/* O motivo gravado no catálogo para UMA medida, só quando a letra do catálogo é a mesma da linha
   (letra diferente seria outra decisão, e o motivo dela não explicaria esta). */
function pcMotivoDaLinha(l, cat) {
  const c = cat[l.indicador];
  return c && c.porta_motivo && String(c.porta) === String(l.porta) ? String(c.porta_motivo) : '';
}
/* O motivo sem o número da medida ("não se repete de um ano para o outro (rho=0,097 em 36 pares)"
   vira "não se repete de um ano para o outro"): serve para AGRUPAR linhas pelo mesmo motivo. O
   número de cada uma continua na linha da tabela. */
function pcMotivoBase(m) {
  return String(m || '').replace(/\s*\([^()]*\)\s*$/, '').trim();
}
/* Para que lado fica quem subiu numa régua. As réguas vêm orientadas pelo `sinal` de cada medida
   (na régua de solidez, xG contra entra com sinal −1 e a régua sai positiva): por isso o lado se
   lê medida por medida, pelo sinal declarado no catálogo, e só é afirmado quando TODAS as medidas
   com lado declarado concordam. Sem lado declarado, ou com medidas discordando, a tela diz que o
   estudo não diz qual é o lado bom. */
function pcLadoItem(d, col) {
  const c = pcCatalogo()[col];
  const s = c && (c.sinal === 1 || c.sinal === -1) ? c.sinal : 0;
  if (d === null || d === undefined || Number(d) === 0 || !s) return 0;
  return Math.sign(Number(d) * s);
}
function pcLadoRegua(r) {
  const lados = (r.itens_crus || []).map(it => pcLadoItem(it.d_SM, it.col)).filter(x => x !== 0);
  if (!lados.length) return 0;
  if (lados.every(x => x === 1)) return 1;
  if (lados.every(x => x === -1)) return -1;
  return 0;
}
/* A frase de sentido só é escrita quando há diferença que se possa ver: com tamanho "quase
   nenhuma" ou com "pode ser sorte", dizer "quem subiu tem mais" é afirmar sentido de ruído. */
function pcSemLadoVisivel(d, p) {
  return ptTamanho(d) === 'quase nenhuma' || ptSorte(p) === 'pode ser sorte';
}
function pcFraseLado(d, p, lado, semLado) {
  if (d === null || d === undefined) return '';
  if (pcSemLadoVisivel(d, p)) return 'sem diferença que se possa afirmar';
  if (lado === 1) return 'quem subiu fica do lado bom';
  if (lado === -1) return 'quem subiu fica do lado ruim';
  return pcLado(d, 'quem subiu', 'o meio') + (semLado ? ' — ' + semLado : '');
}
/* O degrau do funil da etapa 12 dito como se fala. A data do contrato sai do nome da chave. */
const PC_DEGRAUS = { arquivo: 'base inteira', ligas_alvo: 'ligas que interessam',
  confianca_de_contrato: 'data de contrato confiável', pool_operacional: 'lista final' };
function pcDegrau(k) {
  const s = String(k === null || k === undefined ? '' : k);
  if (PC_DEGRAUS[s]) return PC_DEGRAUS[s];
  const m = /^contrato_([a-z]{3})(\d{2})_([a-z]{3})(\d{2})$/.exec(s);
  if (m) return 'contrato vencendo entre ' + m[1] + '/' + m[2] + ' e ' + m[3] + '/' + m[4];
  return s.replace(/_+/g, ' ');
}
/* O nome de cada proposta da etapa 14. A letra sai da chave; o que ela quer dizer, do mapa. */
const PC_CENARIOS = { A_caro: 'elenco caro', B_barato_transicao: 'elenco barato, de transição',
  C_anti_queda: 'elenco montado para não cair' };
const PC_ESCOPOS = { serie_b: 'buscando na Série B', sul_americano: 'buscando na América do Sul' };
function pcNomeCenario(cen) {
  const s = String(cen || '');
  const letra = /^([A-Z])_/.exec(s);
  return (letra ? 'Proposta ' + letra[1] + ': ' : 'Proposta: ') + (PC_CENARIOS[s] || s.replace(/^[A-Z]_/, '').replace(/_+/g, ' '));
}
function pcNomeEscopo(e) {
  return PC_ESCOPOS[e] || String(e || '').replace(/_+/g, ' ');
}
function pcNomeProposta(chave) {
  const partes = String(chave).split('__');
  return pcNomeCenario(partes[0]) + (partes[1] ? ', ' + pcNomeEscopo(partes[1]) : '');
}
/* Os rótulos de grupo que as chaves do JSON usam em mais de um bloco desta metade.
   `sobe`, `meio` e `cai` passam pelo vocabulário de faixa da casca: na aba de pontos viram
   faixa alta, média e baixa, e um mapa escrito aqui diria "quem subiu" onde o dado fala de
   faixa de aproveitamento. `caro` e `barato` são recortes DENTRO de quem subiu (ou da faixa de
   cima), e só por isso ganham nome aqui. Chave desconhecida aparece legível, como veio. */
function pcGrupo(k) {
  const s = String(k);
  if (s === 'caro' || s === 'barato') {
    const d = ptDado();
    if (d && d.faixas) return esc(ptFxRot('sobe') + ', elenco ' + s);
    return s === 'caro' ? 'promovidos caros' : 'promovidos baratos';
  }
  const f = ptFxRot(s);
  return f !== s ? esc(f) : pcNomeChave(s);
}

/* Célula de FRASE numa coluna que ordena por NÚMERO. `tipo:'texto'` faria a frase quebrar
   linha, mas também faria a coluna ordenar em ordem alfabética ("−0,02" antes de "0,15" por
   acaso de letra); sem tipo, a coluna ordena certo, mas a célula `num` não quebra e a tabela
   estoura para o lado — foi o que fez a etapa 9 rolar para o lado. O `cel` devolve o <td> inteiro
   com a classe de texto e deixa a ordenação numérica da coluna intacta. A largura mínima existe
   por causa do celular: sem ela, a 400 px a coluna encolhia até uma letra por linha. */
function pcTdTxt(html) { return '<td class="txt"><div style="min-width:9em">' + html + '</div></td>'; }

/* Tabela longa (centenas de candidatos) com rolagem VERTICAL própria. Com tudo aberto, as
   tabelas empilhadas somariam milhares de linhas na rolagem da aba, e o cabeçalho sumiria na
   segunda tela. A caixa `.pt-tab-rola` já é o contêiner do cabeçalho grudado; limitar a altura
   dela faz o cabeçalho acompanhar a rolagem. Nunca rolagem lateral: a largura não muda. */
function pcRolaVertical(htmlTabela) {
  return String(htmlTabela).replace('<div class="pt-tab-rola">',
    '<div class="pt-tab-rola" style="max-height:34em;overflow-y:auto">');
}

/* A ordem que a pessoa escolheu numa tabela sobrevive ao redesenho do filtro. O registro da
   casca (PT_TABELAS) é refeito a cada ptTabela; sem guardar a ordem antes, cada tecla no campo
   de idade devolveria a tabela à ordem padrão. */
function pcOrdemGuardada(id, padrao) {
  const t = (typeof PT_TABELAS !== 'undefined') ? PT_TABELAS[ptTabId(id)] : null;
  return t && t.ordem ? { col: t.ordem.col, dir: t.ordem.dir } : padrao;
}

/* Índice de salto dentro da etapa. Com tudo aberto, os botões que antes ESCOLHIAM o setor ou a
   proposta viraram atalhos que rolam até ela. A rolagem é da caixa que rola de verdade, pelo
   mesmo motivo que a casca dá no sumário: `scrollIntoView` levaria junto o topo do app. */
function pcSaltos(rot, itens) {
  if (!itens.length) return '';
  return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:4px 0 12px">' +
    '<span class="pt-rot">' + esc(rot) + '</span>' +
    '<span class="pt-filtro-grupo">' + itens.map(it =>
      '<button type="button" class="pt-chip" data-pc-ir="' + esc(it.id) + '">' + it.rot + '</button>').join('') +
    '</span></div>';
}
function pcLigarSaltos(raiz) {
  raiz.querySelectorAll('button[data-pc-ir]').forEach(b => {
    b.onclick = () => {
      const alvo = raiz.querySelector('#' + CSS.escape(b.dataset.pcIr));
      if (alvo) pcRolarAte(alvo);
    };
  });
}
function pcRolarAte(el) {
  let caixa = el.parentElement;
  while (caixa && caixa !== document.body) {
    const ov = getComputedStyle(caixa).overflowY;
    if (/(auto|scroll)/.test(ov) && caixa.scrollHeight > caixa.clientHeight) break;
    caixa = caixa.parentElement;
  }
  if (!caixa || caixa === document.body) { el.scrollIntoView({ block: 'start' }); return; }
  caixa.scrollTop += el.getBoundingClientRect().top - caixa.getBoundingClientRect().top;
}

/* ---------------- filtros de liga, idade e nacionalidade (etapas 13 e 14) ----------------

   As REGRAS são as do app.js, reusadas e não copiadas: os grupos de liga e os rótulos dos
   botões (GRUPOS_LIGA, GRUPOS_LIGA_ROTULOS), os modos de nacionalidade (NACAO_MODOS) e as duas
   funções que decidem (passaNacao — dupla nacionalidade com o Brasil conta como brasileiro — e
   passaIdade — quem não tem idade passa em qualquer faixa). Uma cópia aqui envelheceria calada
   quando o app mudar um grupo.

   O filtro SÓ ESCONDE LINHAS. Ele não refaz a nota (cada nota foi calculada contra a base
   inteira) nem a proposta (o sorteio foi feito com a lista inteira). A tela diz isso ao lado da
   contagem, e toda contagem que descreve a tabela é refeita sobre o que ficou visível.

   A barra fica FORA da área que se redesenha: se ela fosse redesenhada junto, o campo de idade
   perderia o foco a cada tecla. */
function pcApp() {
  try {
    if (typeof GRUPOS_LIGA === 'undefined' || typeof GRUPOS_LIGA_ROTULOS === 'undefined' ||
        typeof NACAO_MODOS === 'undefined' || typeof passaNacao !== 'function' ||
        typeof passaIdade !== 'function') return null;
    return { grupos: GRUPOS_LIGA, rotulos: GRUPOS_LIGA_ROTULOS, nacao: NACAO_MODOS,
             passaNacao: passaNacao, passaIdade: passaIdade };
  } catch (err) {
    return null;
  }
}
/* "Todas as ligas" é o padrão ao abrir (decisão de 14/09): o padrão da janela de busca do app é
   o grupo Brasil, e aqui ele esconderia de cara quase toda a lista, que é sul-americana. */
function pcFiltroPadrao() { return { grupo: 'todas', liga: '', nac: '', idMin: '', idMax: '' }; }
function pcFiltro(chave) {
  const k = ptPrefixo() + '-' + chave;
  if (!PC.filtros[k]) PC.filtros[k] = pcFiltroPadrao();
  return PC.filtros[k];
}
function pcFiltroAtivo(f) {
  return f.grupo !== 'todas' || !!f.liga || !!f.nac || f.idMin !== '' || f.idMax !== '';
}
/* A nacionalidade só filtra quando a lista traz OS DOIS campos que a regra do app lê: sem o
   passaporte (`psp`), quem tem dupla nacionalidade com o Brasil contaria como estrangeiro,
   calado. Enquanto faltar, o seletor fica desligado com o motivo; quando o gerador gravar os
   dois, ele liga sozinho. */
function pcTemNac(regs) {
  const r = regs || [];
  if (!r.length) return { ok: false, motivo: 'a lista está vazia', semNac: 0 };
  const comNac = r.filter(x => x && x.nac !== undefined).length;
  const comPsp = r.filter(x => x && x.psp !== undefined).length;
  if (!comNac) {
    return { ok: false, semNac: r.length,
      motivo: 'a nacionalidade entra na próxima geração do dado',
      tecnico: 'a lista não traz os campos nac e psp' };
  }
  if (comPsp < r.length) {
    return { ok: false, semNac: r.length - comNac,
      motivo: 'o dado traz a nacionalidade, mas não o passaporte de todos: sem ele, quem tem dupla ' +
        'nacionalidade com o Brasil contaria como estrangeiro',
      tecnico: ptInt(comPsp) + ' de ' + ptInt(r.length) + ' com o campo psp' };
  }
  return { ok: true, semNac: r.filter(x => !String(x.nac || '').trim()).length };
}
function pcPassaFiltro(reg, f, usaNac) {
  const app = pcApp();
  if (!app || !reg) return true;
  if (f.liga) {
    if (reg.liga !== f.liga) return false;
  } else if (f.grupo && f.grupo !== 'todas') {
    if ((app.grupos[f.grupo] || []).indexOf(reg.liga) < 0) return false;
  }
  if (!app.passaIdade(reg.idade, f.idMin, f.idMax)) return false;
  if (usaNac && f.nac && !app.passaNacao(reg, f.nac)) return false;
  return true;
}
/* `ctx` descreve o que a barra governa: {chave, titulo, listas: [{nome, regs, nac}], conta()}.
   A contagem dos botões é da PRIMEIRA lista (a principal); as outras vão no `title`. */
function pcLigasPresentes(ctx) {
  const m = {};
  ctx.listas.forEach(l => l.regs.forEach(r => { if (r && r.liga) m[r.liga] = (m[r.liga] || 0) + 1; }));
  return m;
}
function pcGruposVaziosSempre(ctx) {
  const app = pcApp();
  if (!app) return [];
  const livre = pcFiltroPadrao();
  return app.rotulos.filter(g => g.c !== 'todas' && ctx.listas.every(l =>
    !l.regs.some(r => pcPassaFiltro(r, Object.assign({}, livre, { grupo: g.c }), false))));
}
/* Ligas de UMA lista só: cada lista tem o seu funil (a do goleiro traz ligas que a de linha não tem). */
function pcLigasDaLista(l) {
  const m = {};
  l.regs.forEach(r => { if (r && r.liga) m[r.liga] = (m[r.liga] || 0) + 1; });
  return m;
}
function pcMotivoGrupoVazio(g, ctx) {
  const e12 = pcEtapa(12);
  const funil = e12 && (e12.degraus || []).some(x => /ligas/.test(String(x.degrau)));
  const onde = ctx.listas.length > 1
    ? 'nenhuma das ligas presentes (' + ctx.listas.map(l =>
        ptInt(Object.keys(pcLigasDaLista(l)).length) + ' nos ' + l.nome).join(', ') +
      '; ' + ptInt(Object.keys(pcLigasPresentes(ctx)).length) + ' juntando as listas) '
    : 'nenhuma das ' + ptInt(Object.keys(pcLigasPresentes(ctx)).length) + ' ligas presentes nesta lista ';
  return onde +
    'pertence ao grupo “' + g.r + '” do app' +
    (funil ? ': o funil da etapa 12 guardou só as ligas que interessam ao estudo, antes de qualquer filtro daqui' : '');
}
function pcChipsHtml(ctx) {
  const app = pcApp();
  const f = pcFiltro(ctx.chave);
  const vazios = pcGruposVaziosSempre(ctx).map(g => g.c);
  return app.rotulos.map(g => {
    const comEste = Object.assign({}, f, { grupo: g.c, liga: '' });
    const porLista = ctx.listas.map(l => l.regs.filter(r => pcPassaFiltro(r, comEste, l.nac.ok)).length);
    const vazioSempre = vazios.indexOf(g.c) >= 0;
    const dica = vazioSempre ? pcMotivoGrupoVazio(g, ctx)
      : ctx.listas.map((l, i) => ptInt(porLista[i]) + ' ' + l.nome).join(' · ') +
        (pcFiltroAtivo(Object.assign({}, f, { grupo: 'todas', liga: '' })) ? ', com a idade e a nacionalidade escolhidas' : '');
    const on = f.grupo === g.c && !f.liga;
    return '<button type="button" class="pt-chip' + (on ? ' on' : '') + (porLista[0] === 0 ? ' zero' : '') +
      '" data-pc-grupo="' + esc(g.c) + '"' + (vazioSempre ? ' disabled' : '') + ' title="' + esc(dica) + '">' +
      esc(g.r) + '<span class="pt-chip-n">' + ptInt(porLista[0]) + '</span></button>';
  }).join('');
}
function pcFiltrosHtml(ctx) {
  const app = pcApp();
  if (!app) {
    return '<div class="pt-filtros">' + ptFalta('os filtros de liga, idade e nacionalidade usam as regras do ' +
      'app.js, e elas não estão carregadas nesta página') + '</div>';
  }
  const id = s => ptId(ctx.chave + '-f-' + s);
  const ligas = pcLigasPresentes(ctx);
  const idades = [];
  ctx.listas.forEach(l => l.regs.forEach(r => { const n = Number(r && r.idade); if (n > 0) idades.push(n); }));
  const nacs = ctx.listas.map(l => l.nac);
  const algumaNac = nacs.some(x => x.ok);
  const semNacMotivo = (nacs.find(x => !x.ok) || {});
  return '<div class="pt-filtros" data-pc-barra="' + esc(ctx.chave) + '">' +
    '<span class="pt-rot">' + esc(ctx.titulo) + '</span>' +
    '<span class="pt-filtro-grupo" data-pc-chips>' + pcChipsHtml(ctx) + '</span>' +
    '<label>liga <select id="' + esc(id('liga')) + '" data-pc-f="liga">' +
      '<option value="">todas as ligas do grupo</option>' +
      /* Mesma contagem dos botões: o número é da primeira lista; as outras entram escritas
         na própria opção, com o nome da lista, para as duas contagens não se confundirem. */
      Object.keys(ligas).sort((a, b) => a.localeCompare(b, 'pt-BR')).map(lg => {
        const porLista = ctx.listas.map(l => pcLigasDaLista(l)[lg] || 0);
        const txt = ctx.listas.length > 1
          ? ctx.listas.map((l, i) => ptInt(porLista[i]) + ' ' + l.nome).join(' + ')
          : ptInt(porLista[0]);
        return '<option value="' + esc(lg) + '" title="' + esc(txt) + '">' + esc(lg) + ' · ' + esc(txt) + '</option>';
      }).join('') +
    '</select></label>' +
    '<label>idade de <input type="number" id="' + esc(id('idmin')) + '" data-pc-f="idMin"' +
      (idades.length ? ' placeholder="' + ptInt(pcMin(idades)) + '"' : '') + '> a ' +
      '<input type="number" id="' + esc(id('idmax')) + '" data-pc-f="idMax"' +
      (idades.length ? ' placeholder="' + ptInt(pcMax(idades)) + '"' : '') + '></label>' +
    '<label>nacionalidade <select id="' + esc(id('nac')) + '" data-pc-f="nac"' +
      (algumaNac ? '' : ' disabled title="' + esc(semNacMotivo.motivo || '') + '"') + '>' +
      app.nacao.map(m => '<option value="' + esc(m.v) + '">' + esc(m.r) + '</option>').join('') +
    '</select></label>' +
    (algumaNac ? '' : ptFalta(semNacMotivo.motivo) + ptTecnico(esc(semNacMotivo.tecnico || ''))) +
    '<button type="button" class="pt-chip" data-pc-limpar>limpar filtros</button>' +
    '<span class="pt-filtros-conta" data-pc-conta></span>' +
    '</div>';
}
function pcAtualizarBarra(barra, ctx) {
  if (!barra) return;
  const chips = barra.querySelector('[data-pc-chips]');
  if (chips && pcApp()) chips.innerHTML = pcChipsHtml(ctx);
  const conta = barra.querySelector('[data-pc-conta]');
  if (conta) conta.innerHTML = ctx.conta();
}
/* Liga a barra e desenha a área pela primeira vez. Todo redesenho passa por ptComAba: o de
   tecla sai de um temporizador (fora do evento), e sem isso, com duas abas na página, a tabela
   seria registrada com o prefixo da aba errada. */
function pcLigarFiltros(raiz, ctx, redesenhar) {
  const barra = raiz.querySelector('[data-pc-barra="' + ctx.chave + '"]');
  const f = pcFiltro(ctx.chave);
  const agora = () => ptComAba(raiz, () => { redesenhar(); pcAtualizarBarra(barra, ctx); });
  if (!barra) { agora(); return; }
  let espera = null;
  const logo = () => { clearTimeout(espera); espera = setTimeout(agora, 180); };
  barra.querySelectorAll('[data-pc-f]').forEach(el => { el.value = f[el.dataset.pcF] || ''; });
  const chips = barra.querySelector('[data-pc-chips]');
  if (chips) {
    chips.onclick = ev => {
      const b = ev.target && ev.target.closest ? ev.target.closest('button[data-pc-grupo]') : null;
      if (!b || b.disabled) return;
      f.grupo = b.dataset.pcGrupo;
      f.liga = '';
      const sel = barra.querySelector('[data-pc-f="liga"]');
      if (sel) sel.value = '';
      agora();
    };
  }
  barra.querySelectorAll('[data-pc-f]').forEach(el => {
    const campo = el.dataset.pcF;
    if (el.tagName === 'SELECT') el.onchange = () => { f[campo] = el.value; agora(); };
    else el.oninput = () => { f[campo] = String(el.value).trim(); logo(); };
  });
  const limpar = barra.querySelector('[data-pc-limpar]');
  if (limpar) {
    limpar.onclick = () => {
      Object.assign(f, pcFiltroPadrao());
      barra.querySelectorAll('[data-pc-f]').forEach(el => { el.value = ''; });
      agora();
    };
  }
  agora();
}
/* O que a contagem sempre diz, nas duas etapas, além dos números: o grupo que fica com zero em
   qualquer combinação (hoje, Europa) e por quê; a liga única que manda nos grupos; e o que falta
   para a nacionalidade. */
function pcContaExtras(ctx) {
  const f = pcFiltro(ctx.chave);
  const vazios = pcGruposVaziosSempre(ctx);
  const partes = [];
  if (f.liga) partes.push('Com uma liga escolhida, ela manda: os botões de grupo ficam sem efeito até voltar a “todas as ligas do grupo”.');
  vazios.forEach(g => partes.push('“' + esc(g.r) + '” fica com zero: ' + esc(pcMotivoGrupoVazio(g, ctx)) + '.'));
  ctx.listas.forEach(l => {
    if (l.nac.ok && l.nac.semNac) {
      partes.push(ptInt(l.nac.semNac) + ' ' + esc(l.nome) + ' sem nacionalidade no dado: pela regra do app, contam como não estrangeiros.');
    }
  });
  return partes.length ? ' ' + partes.join(' ') : '';
}

/* ================================================================================
   ETAPA 9 — AS RÉGUAS
   ================================================================================

   Nove eixos compostos, e o aviso que o próprio pipeline manda exibir: a unidade de teste é
   o indicador cru; o eixo é régua de tela. Esse aviso não é rodapé nem `title` — foi
   compondo eixo antes de testar que um dos planos anteriores concluiu "nenhum eixo separa
   depois do dinheiro" e perdeu o achado que estava dentro do eixo.

   Por isso cada régua vem com a tabela dos seus itens crus ao lado, e a tela MARCA, item a
   item, quando o item discorda do eixo: sinal contrário ao do eixo, ou item que sobrevive
   ao líquido dentro de um eixo que não sobrevive. A marcação é calculada, não catalogada. */
function ptEtapa9(alvo, dados) {
  const reguas = (dados.reguas || []).slice();
  const clubes = pcClubesQueSubiram();

  /* A baseline do dinheiro é obrigatória aqui (contrato, seção 3). Nenhuma das nove réguas
     traz AUC fora da amostra no JSON — e em vez de deixar o controle em branco, a tela
     confere isso e escreve o que a régua tem no lugar do que ela não tem. */
  const comAuc = reguas.filter(r => r.auc !== undefined && r.auc !== null);
  const baseline = comAuc.length
    ? ptBaseline({ rotulo: 'a melhor das réguas', auc: pcMax(comAuc.map(r => r.auc)) })
    : ptBaseline({
        rotulo: 'as réguas',
        auc: null,
        motivo: 'nenhuma das ' + ptInt(reguas.length) + ' réguas foi testada do jeito que o valor do elenco foi: ' +
          'não há taxa de acerto para elas. O que existe é a diferença entre quem subiu e o meio da tabela, ' +
          'com e sem o desconto do dinheiro, e se a régua se repete no ano seguinte — tudo medido nos mesmos ' +
          ptInt(reguas.length ? (reguas[0].sobe || []).length : 0) + ' times que subiram, sem nenhum ano guardado para testar',
      });

  /* Quantas réguas o pipeline mandou esmaecer, e quantas sobrevivem ao líquido de valor: os
     dois números que resumem a etapa saem de contagem, não de memória. */
  const esmaecidas = reguas.filter(r => r.esmaecido);
  const vivasNoLiquido = reguas.filter(r => pcPassa(r.p_liq_SM));
  const alfa = pcAlfa();

  const cards = reguas.map((r, i) => pcReguaCard(r, i, clubes)).join('');

  alvo.innerHTML =
    (dados.aviso_composicao
      ? '<div class="pt-controle"><span class="pt-rot">antes de ler as réguas</span>' +
        '<p class="pt-nota" style="font-size:14px;color:var(--tinta);margin-top:5px">Cada régua junta ' +
        'várias medidas numa nota só, para caber na tela. Mas o teste de verdade é feito medida por medida: ' +
        'uma média pode esconder justamente a medida que separa quem sobe.</p>' +
        '<p class="pt-nota">Por isso cada régua abaixo vem com as medidas que a compõem, cada uma com o seu ' +
        'próprio resultado, e a linha fica marcada quando a medida discorda da régua. O teste de verdade é ' +
        'feito medida por medida; a régua só resume para caber na tela.' +
        ptTecnico('nas palavras do estudo: “' + esc(dados.aviso_composicao) + '”') + '</p></div>'
      : ptFaltaBloco('O aviso sobre as réguas não veio no dado',
          'o estudo não trouxe a frase que manda mostrar nesta etapa (etapa_9.aviso_composicao). ' +
          'Sem ela a tela não inventa a frase: registra que ela falta.')) +

    baseline +

    '<p class="pt-nota" style="margin-top:14px">São <b>' + ptInt(reguas.length) + '</b> réguas. ' +
      '<b>' + ptInt(esmaecidas.length) + '</b> ' + (esmaecidas.length === 1 ? 'aparece apagada' : 'aparecem apagadas') +
      ' porque o próprio estudo as marcou assim (' +
      (esmaecidas.length ? esmaecidas.map(r => esc(ptNomeRegua(r.eixo)) + ': de um ano para o outro, ' +
        ptJunto(r.rho_persist) + ptTecnico('ρ ' + ptNum(r.rho_persist, 3))).join('; ') : 'nenhuma') + '). ' +
      'Descontado o dinheiro, <b>' + ptInt(vivasNoLiquido.length) + '</b> ' +
      (vivasNoLiquido.length === 1 ? 'continua' : 'continuam') + ' separando quem subiu do meio da tabela' +
      (alfa !== null ? ptTecnico('p abaixo de ' + ptNum(alfa, 2)) : '') + '. ' +
      'Régua apagada não é régua mal desenhada: é régua que não se repete de um ano para o outro, ' +
      'e por isso descreve um ano em vez de um jeito de jogar.</p>' +

    cards +

    ptFaltaBloco('O meio da tabela e quem caiu não aparecem nestas réguas',
      'o pedido era mostrar, atrás de cada régua, a faixa do meio da tabela e a de quem caiu, como na ' +
      'matriz da etapa 5. O dado desta etapa só traz os ' +
      ptInt(reguas.length ? (reguas[0].sobe || []).length : 0) + ' valores de quem subiu — não traz a faixa do ' +
      'meio nem a de quem caiu. Por isso cada régua mostra só onde ficaram os que subiram, e cada uma ' +
      'tem a sua própria escala.');

  ptLigarTabelas(alvo);
}

function pcReguaCard(r, i, clubes) {
  const itens = r.itens_crus || [];
  /* "Discorda do eixo" tem duas formas, e as duas importam por motivos opostos: o item com
     sinal contrário está sendo diluído dentro da média do eixo, e o item que sobrevive ao
     líquido num eixo que não sobrevive é justamente o achado que a composição apaga. */
  /* Três itens das nove réguas chegam com tudo nulo — e não é descuido de leitura: o JSON traz
     `col` e mais nada. Eles são justamente os que não estão no catálogo de indicadores da
     etapa 2, e a tela descobre isso procurando lá, em vez de afirmar um motivo de cabeça. */
  const cat = pcCatalogo();
  const linhas = itens.map(it => {
    const mudo = it.d_SM === null && it.p_SM === null && it.d_liq_SM === null && it.p_liq_SM === null;
    /* O sentido da medida é comparado ao da régua DEPOIS de aplicar o sinal declarado: a régua de
       solidez soma xG contra com sinal −1, e comparar o d cru marcava as três medidas dela como
       "sentido contrário" quando as três concordam com a régua. Sem sinal declarado, o d cru. */
    const cItem = cat[it.col];
    const sItem = cItem && (cItem.sinal === 1 || cItem.sinal === -1) ? cItem.sinal : 1;
    const dOrient = it.d_SM === null || it.d_SM === undefined ? null : Number(it.d_SM) * sItem;
    const sinalContrario = !mudo && dOrient !== null && r.d_SM !== null &&
      Math.sign(dOrient) !== 0 && Math.sign(r.d_SM) !== 0 && Math.sign(dOrient) !== Math.sign(r.d_SM);
    const vivoSozinho = pcPassa(it.p_liq_SM) && !pcPassa(r.p_liq_SM);
    const notas = [];
    if (vivoSozinho) notas.push('continua separando depois de descontar o dinheiro, e a régua inteira não');
    if (sinalContrario) notas.push('vai no sentido contrário da régua');
    return Object.assign({}, it, {
      _mudo: mudo,
      _motivo: mudo
        ? (cat[it.col]
            ? 'a medida está no catálogo da etapa 2, mas a régua não trouxe resultado nenhum para ela'
            : 'esta medida não está entre as ' + ptInt(Object.keys(cat).length) + ' do catálogo ' +
              'da etapa 2, e a régua não trouxe resultado nenhum para ela')
        : '',
      _nota: notas.join(' · '),
      _classe: notas.length ? 'destaque' : '',
      _dica: notas.length ? 'esta medida discorda da régua: ' + notas.join('; ') : '',
    });
  });
  const mudos = linhas.filter(l => l._mudo);

  const tab = ptTabela({
    id: ptId('9-crus-' + i),
    ordem: { col: 'p_SM', dir: 'asc' },
    vazio: 'esta régua não trouxe as medidas que a compõem — e uma régua sem medidas é uma régua que ninguém consegue conferir',
    colunas: [
      { k: 'col', rot: 'medida', tipo: 'texto', dica: 'passe o mouse no nome para ver a coluna como ela existe na base',
        fmt: v => pcNomeInd(v) },
      { k: 'd_SM', rot: 'quem subiu × meio da tabela', dica: 'ordena pelo tamanho da diferença',
        cel: (v, l) => pcTdTxt(l._mudo ? ptFalta(l._motivo)
          : '<b>diferença ' + ptTamanho(v) + '</b>' +
            (pcFraseLado(v, l.p_SM, pcLadoItem(v, l.col), 'o estudo não diz o lado bom')
              ? ' · ' + pcFraseLado(v, l.p_SM, pcLadoItem(v, l.col), 'o estudo não diz o lado bom') : '') +
            ptTecnico('d ' + ptD(v))) },
      { k: 'p_SM', rot: 'pode ser sorte?', dica: 'ordena pelo p: do menos para o mais provável de ser sorte',
        cel: (v, l) => pcTdTxt(l._mudo ? '' : ptSorte(v) + ptTecnico(ptP(v))) },
      { k: '_liq', rot: 'antes e depois de descontar o dinheiro', tipo: 'texto', ordenavel: false,
        motivoFixa: 'são dois resultados numa célula (sem e com o desconto do dinheiro): não há um número só para ordenar',
        fmt: (v, l) => l._mudo ? ptFalta(l._motivo)
          : pcDinheiro({ d_bruto: l.d_SM, p_bruto: l.p_SM, d_liq: l.d_liq_SM, p_liq: l.p_liq_SM }) },
      { k: 'rho_persist', rot: 'se repete no ano seguinte?', dica: 'ordena pelo ρ de um ano para o outro',
        cel: (v, l) => pcTdTxt(v === null || v === undefined
          ? ptFalta(l._mudo ? l._motivo : 'a etapa 6 não mediu esta medida em dois anos seguidos')
          : ptJunto(v) + ptTecnico('ρ ' + ptNum(v, 3))) },
      { k: '_nota', rot: 'discorda da régua?', tipo: 'texto',
        fmt: (v, l) => l._mudo
          ? ptFalta('sem resultado, não dá para dizer se esta medida concorda ou discorda da régua')
          : v ? '<b style="color:var(--coral)">' + esc(v) + '</b>'
              : '<span style="color:var(--tinta3)">não</span>' },
    ],
    linhas: linhas,
  });

  const fraseRegua = pcFraseLado(r.d_SM, r.p_SM, pcLadoRegua(r), 'o estudo não diz se mais é melhor aqui');
  const quatro = pcGrade(170,
    pcNumeroSolto('quem subiu × meio da tabela', 'diferença ' + ptTamanho(r.d_SM),
      (fraseRegua ? fraseRegua + ' · ' : '') + ptSorte(r.p_SM) +
      ptTecnico('d ' + ptD(r.d_SM) + ' · ' + ptP(r.p_SM))) +
    pcNumeroSolto('descontada a sorte de testar muita coisa', pcPassa(r.q_SM) ? 'ainda separa' : 'não sobra',
      (pcPassa(r.q_SM)
        ? 'continua de pé mesmo depois de descontar a sorte de testar muito'
        : 'quando se testa muita coisa, alguma dá certo por sorte; descontada essa sorte, esta régua não fica de pé') +
      ptTecnico('q de Benjamini-Hochberg ' + ptNum(r.q_SM, 3))) +
    pcNumeroSolto('descontado o dinheiro', 'diferença ' + ptTamanho(r.d_liq_SM),
      ptSorte(r.p_liq_SM) + ptTecnico('d ' + ptD(r.d_liq_SM) + ' · ' + ptP(r.p_liq_SM))) +
    pcNumeroSolto('se repete no ano seguinte?', '<span style="font-size:14px">' + ptJunto(r.rho_persist) + '</span>',
      (r.esmaecido ? 'o estudo mandou apagar esta régua' : 'o estudo não mandou apagar esta régua') +
      ptTecnico('ρ ' + ptNum(r.rho_persist, 3))));

  const corpo =
    '<p class="pt-nota" style="margin-top:0">Medidas somadas nesta régua: ' + pcListaNomes(r.itens) + '</p>' +
    quatro +
    '<div style="margin-top:12px">' +
      '<span class="pt-rot">onde ficou cada um dos que subiram, nesta régua</span>' +
      pcReguaSvg(r, clubes) +
    '</div>' +
    '<div style="margin-top:10px">' +
      '<span class="pt-rot">as medidas, uma a uma, cada uma com o seu resultado</span>' + tab +
    '</div>' +
    '<div style="margin-top:10px">' +
      '<span class="pt-rot">a régua inteira</span> ' +
      pcDinheiro({ d_bruto: r.d_SM, p_bruto: r.p_SM, d_liq: r.d_liq_SM, p_liq: r.p_liq_SM }) +
    '</div>';

  const card = ptCard(
    '', /* o título vai montado em HTML no subtítulo, porque ptCard escapa o título e o nome do eixo é código */
    pcNomeEixo(r.eixo) + ' · ' + ptInt((r.itens_crus || []).length) + ' medidas' +
      (r.esmaecido ? ' · <b style="color:var(--coral)">apagada: não se repete de um ano para o outro</b>' : ''),
    corpo,
    (r.esmaecido
      ? 'Esta régua aparece apagada porque o próprio estudo a marcou assim: de um ano para o outro, os ' +
        'números dela ' + ptJunto(r.rho_persist) + ptTecnico('ρ de persistência ' + ptNum(r.rho_persist, 3)) +
        '. Uma régua que não se repete descreve o ano que passou; contratar por ela é comprar a foto, não o ' +
        'jeito de jogar.'
      : 'De um ano para o outro, os números desta régua ' + ptJunto(r.rho_persist) +
        ptTecnico('ρ de persistência ' + ptNum(r.rho_persist, 3)) + '.') +
    (mudos.length
      ? ' <b>' + ptInt(mudos.length) + ' ' + (mudos.length === 1 ? 'medida desta régua entra sem resultado' : 'medidas desta régua entram sem resultado') +
        '</b> (' + pcListaNomes(mudos.map(l => l.col)) + '): a régua as soma, mas o estudo não publica o ' +
        'resultado delas. Ninguém consegue conferir essa média inteira.'
      : ''));

  /* O esmaecimento é visual e é exigência do contrato. Sem classe de CSS disponível, ele sai
     em opacidade e saturação reduzidas no bloco inteiro — o texto continua legível, que é o
     ponto: a régua não é escondida, é rebaixada. */
  return r.esmaecido
    ? '<div style="opacity:.68;filter:saturate(.55)">' + card + '</div>'
    : card;
}

/* A régua desenhada. A escala é a DA PRÓPRIA régua (mínimo e máximo dos 16 valores de
   `sobe`), e não uma escala comum às nove, porque as nove não estão na mesma unidade: uma
   vai de −75 a −8 e outra de 22 a 100. Encaixar as duas na mesma régua diria que uma é pior
   que a outra, o que este dado não sustenta.

   E a unidade fica sem nome de propósito: o contrato registra que não foi possível
   reconstruir a fórmula de `sobe` a partir dos percentis brutos (a média simples dos itens
   não reproduz o valor). Então a tela mostra a DISTRIBUIÇÃO e os extremos, e não afirma
   "percentil" nem "posto" — afirmar unidade não confirmada é o tipo de erro que ninguém
   descobre depois. */
function pcReguaSvg(r, clubes) {
  const v = (r.sobe || []).map(x => (x === null || x === undefined ? null : Number(x)));
  const validos = v.filter(x => x !== null);
  if (!validos.length) {
    return ptFalta('esta régua não trouxe os valores de quem subiu');
  }
  const min = pcMin(validos), max = pcMax(validos);
  const span = (max - min) || 1;
  const L = 22, R = 22, W = 760, eixoY = 34, H = 118;
  const x = val => L + (val - min) / span * (W - L - R);

  const pontos = v.map((val, i) => {
    const nome = clubes && clubes[i] ? clubes[i].clube + ' ' + clubes[i].ano : 'posição ' + (i + 1) + ' da lista';
    if (val === null) return '';
    const px = x(val);
    return '<g><title>' + esc(nome + ' · ' + ptNum(val, 1)) + '</title>' +
      '<line x1="' + px.toFixed(1) + '" y1="' + (eixoY - 7) + '" x2="' + px.toFixed(1) + '" y2="' + (eixoY + 7) +
        '" style="stroke:var(--pt-alto);stroke-width:1.4;opacity:.85"></line>' +
      '<circle cx="' + px.toFixed(1) + '" cy="' + eixoY + '" r="3.4" style="fill:var(--pt-alto);opacity:.9"></circle>' +
      '<text x="' + px.toFixed(1) + '" y="' + (eixoY + 13) + '" transform="rotate(-58 ' + px.toFixed(1) + ' ' +
        (eixoY + 13) + ')" style="font-size:9px;fill:var(--tinta3)" text-anchor="end">' + esc(nome) + '</text>' +
      '</g>';
  }).join('');

  const semValor = v.filter(x2 => x2 === null).length;

  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="display:block;overflow:visible">' +
    '<line x1="' + L + '" y1="' + eixoY + '" x2="' + (W - R) + '" y2="' + eixoY +
      '" style="stroke:var(--borda2);stroke-width:1"></line>' +
    '<text x="' + L + '" y="' + (eixoY - 14) + '" style="font-size:10px;fill:var(--tinta3)">' +
      esc(ptNum(min, 1)) + '</text>' +
    '<text x="' + (W - R) + '" y="' + (eixoY - 14) + '" text-anchor="end" style="font-size:10px;fill:var(--tinta3)">' +
      esc(ptNum(max, 1)) + '</text>' +
    pontos +
    '</svg>' +
    '<p class="pt-nota" style="font-size:11px;margin-top:2px">A régua vai do menor ao maior valor entre os ' +
      ptInt(v.length) + ' que subiram — cada régua tem a sua escala. O estudo não diz em que unidade ela está: ' +
      'o desenho mostra como os times se espalham, não uma medida com nome.' +
      (semValor ? ' ' + ptInt(semValor) + ' dos que subiram não têm valor nesta régua.' : '') +
      (PC.clubesMotivo ? ' Sobre os nomes: ' + esc(PC.clubesMotivo) + ' — os pontos estão numerados pela ordem da lista.' : '') +
      '</p>';
}

/* ================================================================================
   ETAPA 10 — CAUSA OU CONSEQUÊNCIA
   ================================================================================

   Esta etapa existe para impedir um erro caro, e o erro é específico: olhar a tabela de
   separação, ver que "pontos fora de casa" separa quem sobe de quem cai com o maior d da
   aba inteira, e sair para o mercado atrás de um jogador que faça pontos fora de casa.

   A porta D é o placar redescrito. A porta B separa e não se repete. Nenhuma das duas é
   critério de contratação, e por isso a etapa tem um rótulo em vez de uma conclusão. */
function ptEtapa10(alvo, dados) {
  const linhas = (dados.linhas || []).slice();
  const cat = pcCatalogo();
  const rho6 = pcRhoDaEtapa6();

  /* As portas não são explicadas no `etapa_10`: a legenda de cada porta mora no
     `porta_motivo` do catálogo da etapa 2. A tela vai buscar lá. Onde não achar — e a porta
     D não está no catálogo, porque essas colunas nem entraram nos indicadores — escreve a
     ausência com o motivo que a própria busca revelou. */
  /* Antes a legenda de cada porta era o motivo da PRIMEIRA linha do catálogo com aquela letra —
     com o número de outra medida dentro, e escolhendo um dos dois motivos da letra B para o grupo
     inteiro. Agora cada linha leva o próprio motivo, e o grupo diz quantas linhas têm cada um. */
  const motivosDoGrupo = ls => {
    const cont = {}, ordem = [];
    let sem = 0;
    ls.forEach(l => {
      const b = pcMotivoBase(pcMotivoDaLinha(l, cat));
      if (!b) { sem++; return; }
      if (!(b in cont)) { cont[b] = 0; ordem.push(b); }
      cont[b]++;
    });
    return { cont: cont, ordem: ordem, sem: sem };
  };

  const porPorta = {};
  const chavePorta = l => (l.porta === undefined || l.porta === null) ? '' : String(l.porta);
  linhas.forEach(l => { const k = chavePorta(l); (porPorta[k] = porPorta[k] || []).push(l); });
  const portas = Object.keys(porPorta).sort();

  const noCatalogo = linhas.filter(l => cat[l.indicador]).length;
  const forasNoCatalogo = linhas.length - noCatalogo;
  const semRho = linhas.filter(l => l.rho_persist === null || l.rho_persist === undefined);
  const semRhoEForaDaEtapa6 = semRho.filter(l => !(l.indicador in rho6)).length;

  /* O d mais forte da lista é a prova do ponto. Ele é encontrado, não decorado. */
  /* As chaves de comparação passam pelo vocabulário de faixa (na aba de pontos, d_bruto_AB). */
  const kSM = ptK('d_bruto_{SM}'), kSC = ptK('d_bruto_{SC}');
  const maisForte = linhas.slice().sort((a, b) =>
    Math.abs(b[kSC] || 0) - Math.abs(a[kSC] || 0))[0];

  /* Nove colunas com frase dentro estouravam para o lado (2.570 px). A tabela usa a classe
     compacta, as três médias vão numa célula só, e toda coluna de frase quebra linha sem perder
     a ordenação numérica (pcTdTxt). */
  const tab = ptTabela({
    id: ptId('10-tab'),
    classe: 'pt-matriz',
    ordem: { col: kSC, dir: 'desc' },
    vazio: 'a etapa 10 não trouxe linha nenhuma',
    colunas: [
      { k: 'indicador', rot: 'medida', tipo: 'texto', dica: 'passe o mouse no nome para ver a coluna como ela existe na base',
        fmt: v => pcNomeInd(v) },
      { k: 'porta', rot: 'por que fica de fora', tipo: 'texto', fmt: (v, l) => pcPorta(v, alvo, pcMotivoDaLinha(l, cat)) },
      { k: ptK('m_', 'sobe'), rot: 'média de cada grupo', dica: 'ordena pela média de ' + ptFxRot('sobe'),
        cel: (v, l) => pcTdTxt(['sobe', 'meio', 'cai'].map(g => {
          const val = l[ptK('m_', g)];
          return '<span style="display:block">' + esc(ptFxRot(g, { forma: 'nome' })) + ' ' +
            (val === null || val === undefined ? ptFalta('sem média deste grupo') : '<b>' + ptNum(val, 2) + '</b>') +
            '</span>';
        }).join('')) },
      { k: kSM, rot: ptFxRot('sobe') + ' × ' + ptFxRot('meio'), cel: v => pcTdTxt(pcDif(v)) },
      { k: kSC, rot: ptFxRot('sobe') + ' × ' + ptFxRot('cai'), cel: v => pcTdTxt(pcDif(v)) },
      { k: '_liq', rot: 'antes e depois de descontar o dinheiro', tipo: 'texto', ordenavel: false,
        motivoFixa: 'são dois resultados numa célula (sem e com o desconto do dinheiro): não há um número só para ordenar',
        fmt: (v, l) => {
          const c = cat[l.indicador];
          if (c) return pcDinheiro({ d_bruto: c.d_bruto_SM, p_bruto: c.p_bruto_SM, d_liq: c.d_liq_SM, p_liq: c.p_liq_SM });
          return ptFalta('esta medida não está no catálogo de ' + ptInt(Object.keys(cat).length) +
            ' indicadores da etapa 2: o estudo não fez o desconto do dinheiro para ela');
        } },
      { k: 'rho_persist', rot: 'se repete no ano seguinte?', dica: 'ordena pelo ρ de um ano para o outro',
        cel: (v, l) => pcTdTxt(v !== null && v !== undefined
          ? ptJunto(v) + ptTecnico('ρ ' + ptNum(v, 3))
          : ptFalta(l.indicador in rho6
            ? 'a etapa 6 mediu isto de um ano para o outro, mas esta etapa não trouxe o número'
            : 'não foi medido: esta medida não está entre as ' + ptInt(Object.keys(rho6).length) +
              ' que a etapa 6 acompanhou de um ano para o outro')) },
    ],
    linhas: linhas,
  });

  /* A abertura era uma frase fixa ("parte é o resultado, a outra não se repete no ano seguinte")
     que nenhum campo controlava: na aba de pontos, sem porta em linha nenhuma, ela afirmava a divisão
     logo acima do cartão que confessa não saber. Agora cada oração só existe se houver linha daquele
     tipo, e o motivo de cada parte é o gravado no catálogo. */
  const pedacos = portas.filter(p => p !== '').map(p => {
    const ls = porPorta[p], mg = motivosDoGrupo(ls);
    const n = '<b>' + ptInt(ls.length) + '</b> ' + (ls.length === 1 ? 'medida' : 'medidas');
    if (!mg.ordem.length) {
      return n + ': ' + (ptPortaTxt(p) ? esc(ptPortaTxt(p)) : 'porta ' + esc(p)) + ptTecnico('porta ' + esc(p));
    }
    return mg.ordem.map(b => '<b>' + ptInt(mg.cont[b]) + '</b> ' + (mg.cont[b] === 1 ? 'medida' : 'medidas') +
        ': ' + esc(b)).join('; ') +
      (mg.sem ? '; ' + '<b>' + ptInt(mg.sem) + '</b> sem motivo gravado no catálogo, ' +
        (ptPortaTxt(p) ? esc(ptPortaTxt(p)) : 'porta ' + esc(p)) : '') +
      ptTecnico('porta ' + esc(p));
  });
  const semPorta = porPorta[''] ? porPorta[''].length : 0;
  const maisForteTxt = maisForte && maisForte[kSC] !== null && maisForte[kSC] !== undefined
    ? ' A maior diferença entre ' + esc(ptFxRot('sobe')) + ' e ' + esc(ptFxRot('cai')) + ' na lista é a de ' +
      pcNomeInd(maisForte.indicador) + ': diferença ' + ptTamanho(maisForte[kSC]) + ptTecnico(esc(kSC) + ' ' + ptD(maisForte[kSC])) + '.'
    : '';
  const foraTodosPlacar = forasNoCatalogo > 0 &&
    linhas.filter(l => !cat[l.indicador]).every(l => String(l.porta) === 'D');

  alvo.innerHTML =
    '<div class="pt-controle" style="border-left:3px solid var(--coral)">' +
      '<b style="font-size:26px;letter-spacing:-.02em;display:block;line-height:1.1">SEPARA, E MESMO ASSIM FICA DE FORA</b>' +
      '<p class="pt-nota">Estas <b>' + ptInt(linhas.length) + '</b> medidas ficam fora dos critérios de escolha ' +
        'do estudo, e cada uma pelo motivo que o próprio estudo gravou.' + maisForteTxt + '</p>' +
      (pedacos.length
        ? '<p class="pt-nota">' + pedacos.join('. ') + '.</p>'
        : '') +
      (semPorta
        ? '<p class="pt-nota">' + '<b>' + ptInt(semPorta) + '</b> ' + (semPorta === 1 ? 'medida' : 'medidas') + ': ' +
          pcPorta('', alvo, '', semPorta !== 1) + '.</p>'
        : '') +
    '</div>' +

    pcGrade(230, portas.map(p => {
      const ls = porPorta[p], mg = motivosDoGrupo(ls);
      /* Grupo com um motivo só: o motivo é o título. Com mais de um (a letra B hoje pode juntar os
         dois), o título é o resumo da letra e os motivos vêm contados logo abaixo. */
      const titulo = p === '' ? pcPorta('', alvo, '', ls.length !== 1)
        : (mg.ordem.length === 1 && !mg.sem ? pcPorta(p, alvo, mg.ordem[0]) : pcPorta(p, alvo));
      return '<div class="pt-controle">' +
        '<span class="pt-rot">' + ptInt(ls.length) + (ls.length === 1 ? ' medida' : ' medidas') + '</span>' +
        '<p class="pt-nota" style="margin-top:5px"><b>' + titulo + '</b></p>' +
        (p === '' ? '' : mg.ordem.length
          ? '<p class="pt-nota" style="font-size:11px">' + ptTecnico('motivo gravado no catálogo do estudo: ' +
              mg.ordem.map(b => esc(b) + ' (' + ptInt(mg.cont[b]) + ' de ' + ptInt(ls.length) + ')').join(' · ') +
              (mg.sem ? ' · sem motivo no catálogo: ' + ptInt(mg.sem) : '')) + '</p>'
          : '<p class="pt-nota" style="font-size:11px">' +
            ptFalta('o catálogo da etapa 2 não explica este grupo: ' + (ls.length === 1
              ? 'esta medida nem entrou' : 'estas medidas nem entraram') + ' entre os ' +
              ptInt(Object.keys(cat).length) + ' indicadores') + '</p>') +
        '<p class="pt-nota" style="font-size:11.5px">' + pcListaNomes(ls.map(l => l.indicador)) + '</p>' +
      '</div>';
    }).join('')) +

    '<p class="pt-nota" style="margin-top:14px"><b>' + ptInt(forasNoCatalogo) + '</b> das ' +
      ptInt(linhas.length) + ' medidas desta etapa não estão no catálogo de indicadores da etapa 2, e ' +
      '<b>' + ptInt(semRhoEForaDaEtapa6) + '</b> não foram acompanhadas de um ano para o outro na ' +
      'etapa 6.' +
      (foraTodosPlacar
        ? ' As que estão fora do catálogo são todas do grupo "' + esc(ptPortaTxt('D') || 'porta D') + '": ' +
          'não foram escolhidas como indicador antes do primeiro teste, então não passaram pelo desconto do ' +
          'dinheiro nem pelo teste de repetição. Entram aqui só para serem mostradas e deixadas de fora.'
        : '') + '</p>' +

    tab;

  ptLigarTabelas(alvo);
}

/* ================================================================================
   ETAPA 11 — O TESTE DA MALA
   ================================================================================

   A pergunta é a única que importa antes de assinar um contrato: o que o atleta leva na
   mala quando muda de clube, e o que ficava no time anterior?

   A frase que a especificação quer nesta tela — "o que você compra num jogador é o físico e
   o duelo; o volume de passe dele era do time anterior" — NÃO é escrita por padrão. Ela é
   uma afirmação sobre três comparações, e as três são conferidas no dado antes: o físico
   tem de estar acima do técnico; os indicadores de duelo têm de sobreviver à mudança; e os
   de volume de passe têm de cair. Cada perna que não se sustentar é escrita como não
   sustentada, com o número que a derrubou. */
function ptEtapa11(alvo, dados) {
  const f = dados.fisico || null;
  const t = dados.tecnico || null;
  if (!f || !t) {
    alvo.innerHTML = ptFaltaBloco('O teste da mala não veio inteiro',
      'faltou ' + (!f ? '`fisico`' : '') + (!f && !t ? ' e ' : '') + (!t ? '`tecnico`' : '') +
      ' em `etapa_11`. Sem os dois lados não há comparação: a tela não desenha meia barra pareada.');
    return;
  }

  const mets = (t.metricas || []).slice().sort((a, b) =>
    (b.rho_mudou - b.rho_ficou) - (a.rho_mudou - a.rho_ficou));
  const viajam = mets.filter(m => m.rho_mudou >= m.rho_ficou);
  const caem = mets.filter(m => m.rho_mudou < m.rho_ficou)
    .slice().sort((a, b) => (b.rho_ficou - b.rho_mudou) - (a.rho_ficou - a.rho_mudou));

  /* As três pernas da frase, conferidas uma a uma. */
  const fisicoAcima = f.rho_mediano !== null && t.rho_mediano_mudou !== null &&
    f.rho_mediano > t.rho_mediano_mudou;
  const maiorQueda = caem.length ? caem[0] : null;
  const queda = maiorQueda ? maiorQueda.rho_ficou - maiorQueda.rho_mudou : null;
  const distanciaMediana = (t.rho_mediano_ficou !== null && t.rho_mediano_mudou !== null)
    ? t.rho_mediano_ficou - t.rho_mediano_mudou : null;

  /* Nome das medidas do SkillCorner e do Wyscout pelo dicionário único da casca. */
  const nomeMet = s => '<span title="' + esc(s) + '">' + esc(ptNomeMedida(s)) + '</span>';
  const nomeMetTxt = s => esc(ptNomeMedida(s));

  const frase =
    (fisicoAcima
      ? '<b>O físico vai junto com o atleta.</b> Medido em dois anos seguidos, o físico de um ano e o do ' +
        'ano seguinte ' + ptJunto(f.rho_mediano) + ' (' + pcQtd(f.pares, 'atletas acompanhados') + ')' +
        ptTecnico('ρ mediano ' + ptNum(f.rho_mediano, 3)) + '. No técnico de quem mudou de clube, os dois anos ' +
        ptJunto(t.rho_mediano_mudou) + ptTecnico('ρ mediano ' + ptNum(t.rho_mediano_mudou, 3)) + '. '
      : '<b>Neste dado, o físico não se repetiu mais que o técnico.</b> No físico, os dois anos ' +
        ptJunto(f.rho_mediano) + '; no técnico de quem mudou de clube, ' + ptJunto(t.rho_mediano_mudou) +
        ptTecnico('ρ mediano ' + ptNum(f.rho_mediano, 3) + ' contra ' + ptNum(t.rho_mediano_mudou, 3)) +
        ' — a primeira parte da frase do estudo não se sustenta aqui. ') +
    (viajam.length
      ? '<b>' + ptInt(viajam.length) + ' ' + (viajam.length === 1 ? 'medida técnica atravessa' : 'medidas técnicas atravessam') +
        ' a troca de clube sem perder nada</b> — em quem mudou, ' + (viajam.length === 1 ? 'ela se repete' : 'elas se repetem') +
        ' tanto ou mais do que em quem ficou: ' +
        viajam.map(m => nomeMet(m.metrica) + ptTecnico('ρ ' + ptNum(m.rho_mudou, 3) + ' contra ' +
          ptNum(m.rho_ficou, 3))).join('; ') + '. '
      : '<b>Neste dado, nenhuma medida técnica atravessa a troca de clube sem perder.</b> ') +
    (maiorQueda
      ? 'A que mais perde é ' + nomeMet(maiorQueda.metrica) + ': em quem ficou no clube, os dois anos ' +
        ptJunto(maiorQueda.rho_ficou) + '; em quem mudou, ' + ptJunto(maiorQueda.rho_mudou) +
        ptTecnico('ρ ' + ptNum(maiorQueda.rho_ficou, 3) + ' contra ' + ptNum(maiorQueda.rho_mudou, 3) +
          ', ' + ptNum(queda, 3) + ' de diferença') + '. '
      : '') +
    (distanciaMediana !== null
      ? (ptJunto(t.rho_mediano_mudou) === ptJunto(t.rho_mediano_ficou)
          ? 'Mas no jogador típico, mudar ou ficar de clube quase não muda o quanto o técnico se repete: nos ' +
            'dois casos, os dois anos ' + ptJunto(t.rho_mediano_mudou)
          : 'No jogador típico, em quem mudou de clube os dois anos ' + ptJunto(t.rho_mediano_mudou) +
            '; em quem ficou, ' + ptJunto(t.rho_mediano_ficou)) +
        ptTecnico('medianas ' + ptNum(t.rho_mediano_mudou, 3) + ' contra ' + ptNum(t.rho_mediano_ficou, 3) +
          ' · diferença ' + ptNum(distanciaMediana, 3)) +
        ' — o efeito aparece medida por medida. Quem for citar esta etapa deve citar as medidas, não o jogador típico.'
      : '');

  /* Barras pareadas, mesma escala para os dois lados e para o físico. A escala vai de 0 a 1
     porque é correlação, e normalizar pelo maior da lista faria o pior indicador desta lista
     curta parecer bom — que é justamente o erro que esta etapa existe para evitar. */
  /* dentro de <text> de SVG não cabe <span>: o desenho recebe o nome sem marcação */
  const svg = pcMalaSvg(mets, f.rho_mediano, t.rho_mediano_mudou, t.rho_mediano_ficou, nomeMetTxt);

  const barrasFisico = (f.metricas || []).map(m => ptBarra(m.rho, 1, {
    rot: ptNomeMedida(m.metrica),
    dica: m.metrica,
    texto: ptNum(m.rho, 2),
    extra: ptJunto(m.rho) + ptTecnico('ρ · ' + ptInt(m.n) + ' atletas'),
  })).join('');

  const menorFisico = (f.metricas || []).length ? pcMin(f.metricas.map(m => m.rho)) : null;

  alvo.innerHTML =
    '<div class="pt-controle">' +
      '<span class="pt-rot">o que a tela afirma — cada parte conferida no dado antes de ser escrita</span>' +
      '<p class="pt-nota" style="font-size:13.5px;color:var(--tinta);margin-top:6px">' + frase + '</p>' +
    '</div>' +

    ptCard('Técnico: quem mudou de clube contra quem ficou',
      pcQtd(t.pares_mudou, 'atletas mudaram de clube') + ' · ' + pcQtd(t.pares_ficou, 'ficaram no mesmo clube') +
        ' · cada um medido em dois anos seguidos' +
        (t.corte ? ptTecnico('corte: ' + esc(t.corte)) : ''),
      svg,
      'Barra colorida: quem mudou de clube. Barra cinza: quem ficou. Quanto mais longa a barra, mais o número ' +
      'do atleta num ano se repete no ano seguinte. ' +
      (ptJunto(t.rho_mediano_mudou) === ptJunto(t.rho_mediano_ficou)
        ? 'No jogador típico, os dois anos ' + ptJunto(t.rho_mediano_mudou) + ' tanto em quem mudou quanto em quem ficou'
        : 'No jogador típico, em quem mudou os dois anos ' + ptJunto(t.rho_mediano_mudou) + '; em quem ficou, ' +
          ptJunto(t.rho_mediano_ficou)) +
      ptTecnico('ρ mediano ' + ptNum(t.rho_mediano_mudou, 3) + ' contra ' + ptNum(t.rho_mediano_ficou, 3)) +
      '. A linha pontilhada é o físico, na mesma escala' + ptTecnico('ρ mediano ' + ptNum(f.rho_mediano, 3)) +
      ' — é ela que separa o que você compra no jogador do que vinha junto com o time.') +

    ptCard('Físico: o mesmo atleta, dois anos seguidos',
      pcQtd(f.pares, 'atletas acompanhados') + (f.corte ? ptTecnico('corte: ' + esc(f.corte)) : ''),
      barrasFisico,
      'Aqui não há "mudou contra ficou": o estudo traz um número só por medida física, sem separar quem ' +
      'trocou de clube de quem ficou. ' +
      /* O `ptFalta` sai como uma frase inteira ("sem dado — motivo"); emendado sem ponto no meio
         de um período, ele colava no que vinha depois e o texto lia-se como erro de montagem. */
      ptFalta('a divisão entre quem mudou e quem ficou não existe no dado físico — essa comparação só ' +
        'existe para o técnico') + '. ' +
      (menorFisico !== null && t.rho_mediano_ficou !== null && t.rho_mediano_ficou !== undefined
        ? (menorFisico > t.rho_mediano_ficou
            ? 'Mesmo sem essa divisão, o patamar é outro: a medida física que menos se repete ainda se repete ' +
              'mais que o técnico de quem ficou no mesmo clube'
            : 'Sem essa divisão, não dá para dizer que o físico inteiro está num patamar acima: a medida física ' +
              'que menos se repete não passa do técnico de quem ficou no mesmo clube') +
          ptTecnico('menor ρ físico ' + ptNum(menorFisico, 3) + ' · ρ mediano técnico de quem ficou ' +
            ptNum(t.rho_mediano_ficou, 3)) + '.'
        : '')) +

    (dados.uso
      ? '<div class="pt-controle" style="margin-top:12px"><span class="pt-rot">como estes números entram na nota de encaixe</span>' +
        '<p class="pt-nota" style="margin-top:5px;font-size:13px;color:var(--tinta)">Eles entram como faixa — ' +
        'peso alto, médio ou baixo — e nunca como multiplicador exato.' + ptTecnico('nas palavras do estudo: “' + esc(dados.uso) + '”') + '</p>' +
        '<p class="pt-nota">Faixa, e não número exato, porque o tamanho exato muda de um recorte para o outro. ' +
        'A etapa 13 usa essas faixas como peso de cada bloco da nota e nunca multiplica a nota por elas.</p></div>'
      : '');
}

function pcMalaSvg(mets, medFisico, medMudou, medFicou, nomeMet) {
  if (!mets.length) return ptFalta('as medidas técnicas chegaram vazias no dado');
  const nm = nomeMet || (s => esc(s));
  const L = 230, W = 780, alt = 30, topo = 26, H = topo + mets.length * alt + 16;
  const x = v => L + Math.max(0, Math.min(1, v)) * (W - L - 60);

  const linhas = mets.map((m, i) => {
    const y = topo + i * alt;
    const perdeu = m.rho_mudou < m.rho_ficou;
    return '<g><title>' + esc(m.metrica + ' · quem mudou: ' + ptNum(m.rho_mudou, 3) + ' (' + ptInt(m.n_mudou) +
        ' atletas) · quem ficou: ' + ptNum(m.rho_ficou, 3) + ' (' + ptInt(m.n_ficou) + ' atletas)') + '</title>' +
      '<text x="' + (L - 10) + '" y="' + (y + 13) + '" text-anchor="end" style="font-size:11px;fill:var(--tinta2)">' +
        nm(m.metrica) + '</text>' +
      '<rect x="' + L + '" y="' + (y + 1) + '" width="' + (x(m.rho_mudou) - L).toFixed(1) + '" height="9" rx="2" ' +
        'style="fill:var(--pt-alto)"></rect>' +
      '<rect x="' + L + '" y="' + (y + 12) + '" width="' + (x(m.rho_ficou) - L).toFixed(1) + '" height="9" rx="2" ' +
        'style="fill:var(--tinta3);opacity:.55"></rect>' +
      '<text x="' + (x(Math.max(m.rho_mudou, m.rho_ficou)) + 7).toFixed(1) + '" y="' + (y + 15) +
        '" style="font-size:10px;fill:' + (perdeu ? 'var(--pt-baixo)' : 'var(--pt-ok)') +
        ';font-variant-numeric:tabular-nums">' +
        esc(ptNum(m.rho_mudou, 3) + ' / ' + ptNum(m.rho_ficou, 3)) + '</text>' +
      '</g>';
  }).join('');

  const linhaRef = (valor, rot, tracejado) => valor === null || valor === undefined ? '' :
    '<g><line x1="' + x(valor).toFixed(1) + '" y1="' + (topo - 8) + '" x2="' + x(valor).toFixed(1) +
      '" y2="' + (topo + mets.length * alt) + '" style="stroke:var(--tinta3);stroke-width:1' +
      (tracejado ? ';stroke-dasharray:3 3' : '') + ';opacity:.7"></line>' +
    '<text x="' + (x(valor) + 4).toFixed(1) + '" y="' + (topo - 12) + '" style="font-size:9.5px;fill:var(--tinta3)">' +
      esc(rot) + '</text></g>';

  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="display:block;overflow:visible">' +
    '<text x="' + L + '" y="12" style="font-size:9.5px;fill:var(--pt-alto)">■ mudou de clube</text>' +
    '<text x="' + (L + 120) + '" y="12" style="font-size:9.5px;fill:var(--tinta3)">■ ficou no mesmo clube</text>' +
    linhaRef(medFisico, 'físico (jogador típico)', true) +
    linhas +
    '</svg>';
}

/* ================================================================================
   ETAPA 12 — O FUNIL DOS LIVRES
   ================================================================================

   Cada degrau apaga milhares de nomes, e um número que apaga milhares de nomes precisa estar
   aberto: desde 14/09 todos os degraus aparecem abertos, sem clique (pedido do dono), cada um
   com quanto saiu de cada bloco (Série B, sul-americanos, resto do Brasil) — a conta é feita
   aqui, subtraindo o degrau anterior, porque o JSON traz os restantes e não as perdas.

   O aviso central: a data de vencimento não seleciona ninguém — quase toda a janela cai no
   mesmo mês, porque é o calendário brasileiro que manda nela. A seletividade da lista vem da
   nota, não da data de vencimento do contrato. */
function ptEtapa12(alvo, d) {
  const deg = d.degraus || [];
  const n0 = deg.length ? deg[0].n : 0;
  const semFisico = d.ligas_sem_cobertura_fisica || [];
  const porLiga = d.por_liga || {};
  const cc = d.conferencia_cruzada || null;

  /* A cascata. A largura de cada degrau é a fração do arquivo inteiro que ele ainda tem —
     é a única forma de o último degrau parecer o que ele é ao lado do primeiro. */
  const cascata = deg.map((g, i) => {
    const frac = n0 ? (g.n / n0) * 100 : 0;
    return '<div style="border-left:3px solid var(--pt-alto);padding:7px 0 9px 10px;margin-bottom:6px">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap">' +
        '<span style="font-size:12px;color:var(--tinta2)" title="' + esc(g.degrau) + '">' + esc(pcDegrau(g.degrau)) + '</span>' +
        '<b style="font-size:15px;font-variant-numeric:tabular-nums">' + ptInt(g.n) + ' jogadores</b>' +
      '</div>' +
      '<div style="height:9px;background:var(--veu2);border-radius:5px;margin-top:4px;overflow:hidden">' +
        '<i style="display:block;height:100%;width:' + frac.toFixed(2) + '%;background:var(--pt-alto)"></i></div>' +
      (g.saiu ? '<span style="font-size:10.5px;color:var(--pt-baixo)">saíram ' + ptInt(g.saiu) +
        ' aqui · ' + ptPct(n0 ? (g.saiu / n0) * 100 : null) + ' da base inteira</span>' : '') +
      pcEt12Detalhe(deg, i, d) +
      '</div>';
  }).join('');

  const tabLigas = ptTabela({
    id: ptId('12-ligas'),
    ordem: { col: 'pool', dir: 'desc' },
    vazio: 'o estudo não trouxe a divisão por liga',
    colunas: [
      { k: 'liga', rot: 'liga', tipo: 'texto' },
      { k: 'n', rot: 'jogadores na base', casas: 0 },
      { k: 'com_psv', rot: 'com dado físico', casas: 0 },
      { k: '_cob', rot: 'parte com dado físico', fmt: (v, l) => l.n ? ptPct((l.com_psv / l.n) * 100) : ptFalta('liga sem nenhum jogador na base') },
      { k: 'pool', rot: 'na lista final', casas: 0 },
      { k: '_marca', rot: 'situação', tipo: 'texto', ordenavel: false,
        motivoFixa: 'a situação é uma marca, não um número: para ordenar, use as colunas de contagem',
        fmt: (v, l) => l._sem
          ? '<b style="color:var(--coral)">sem base para pontuar</b>'
          : '<span style="color:var(--tinta3)">entra na avaliação</span>' },
    ],
    linhas: Object.keys(porLiga).map(k => Object.assign({ liga: k, _sem: semFisico.indexOf(k) >= 0 }, porLiga[k])),
  });

  const pool = d.pool || {};
  const posicoes = pool.por_posicao || {};
  const menorPos = Object.keys(posicoes).sort((a, b) => posicoes[a] - posicoes[b])[0];

  alvo.innerHTML =
    '<div class="pt-controle" style="border-left:3px solid var(--coral)">' +
      '<span class="pt-rot">o aviso que vem antes da lista inteira</span>' +
      '<p class="pt-nota" style="font-size:13.5px;color:var(--tinta);margin-top:5px">' +
        pcAvisoContrato(d) + '</p>' +
    '</div>' +

    ptCard('Da base inteira à lista final, degrau por degrau',
      'todos os degraus abertos: quantos ficaram e quantos saíram de cada grupo' +
        (d.periodo_da_base ? ptTecnico('base ' + esc(d.periodo_da_base)) : ''),
      '<div>' + cascata + '</div>',
      'Para cada degrau, o estudo guarda só o nome e quantos sobraram; ' +
      ptFalta('a regra de cada corte (quais ligas, que datas de contrato, quantos minutos no mínimo) não vem ' +
        'no dado — só o nome do degrau e os totais') +
      '. Quem saiu de cada grupo, em cada degrau, é conta feita aqui na tela: o total do degrau anterior ' +
      'menos o deste. O dado guarda quem ficou, não quem saiu.') +

    ptCard('Quais ligas têm dado físico',
      ptInt(semFisico.length) + ' de ' + ptInt(Object.keys(porLiga).length) + ' ligas sem nenhum atleta com dado físico',
      tabLigas,
      'Liga sem dado físico não recebe nota baixa: não recebe nota. Sem o físico, a nota da etapa 13 ficaria ' +
      'só com o técnico' + pcTecnicoNaMala() + '. Por isso a tela não mostra nota só técnica com cara de nota ' +
      'completa. Ligas marcadas: ' + (semFisico.length ? esc(semFisico.join(' · ')) : 'nenhuma') + '.') +

    ptCard('Quem sobrou na lista final',
      pcQtd(pool.n, 'atletas') + ' · ' + ptInt(pool.serie_b) + ' da Série B e ' + ptInt(pool.sul_americanos) +
        ' sul-americanos',
      pcGrade(260,
        '<div><span class="pt-rot">por liga</span>' + pcBarrinhas(pool.por_liga) + '</div>' +
        '<div><span class="pt-rot">por posição</span>' + pcBarrinhas(posicoes) + '</div>'),
      (menorPos
        ? 'A posição com menos opções é <b>' + esc(menorPos) + '</b>, com ' + ptInt(posicoes[menorPos]) +
          ' na lista inteira. ' + pcEt12VagaNa14(menorPos, posicoes[menorPos])
        : '')) +

    (cc ? pcEt12Conferencia(cc, deg) : ptFaltaBloco('A conferência da data de contrato não veio',
      'o estudo não trouxe a comparação com outra fonte. Sem ela não há como dizer o quanto a data de ' +
      'contrato desta base bate com uma fonte independente — e confiar numa fonte só de contrato é ' +
      'exatamente onde um erro de data vira uma proposta errada.'));

  ptLigarTabelas(alvo);
}

/* O que a etapa 14 faz com a posição de menos opções da lista final. Antes a tela afirmava, fixo,
   que o número da lista inteira "é o número de candidatos que uma vaga dessa posição tem na etapa
   14" — e não é: cada proposta grava o seu próprio `denominador_por_vaga` (menor, porque cada uma
   busca num escopo e aplica os seus cortes), e a posição de menos opções pode nem ser montada lá
   (o goleiro não é). Agora a frase sai das propostas; sem elas, diz que não veio. */
function pcEt12VagaNa14(pos, naLista) {
  const e14 = (ptDado() || {}).etapa_14;
  const props = (e14 && e14.propostas) || {};
  const chaves = Object.keys(props);
  if (!chaves.length) {
    return ptFalta('as propostas da etapa 14 não vieram, então não há como dizer quantos candidatos essa vaga tem lá') + '.';
  }
  const porEscopo = {}, motivos = [];
  chaves.forEach(k => {
    const p = props[k] || {};
    const den = p.denominador_por_vaga || {};
    if (den[pos] !== null && den[pos] !== undefined) {
      const esc_ = p.escopo || String(k).split('__')[1] || '';
      (porEscopo[esc_] = porEscopo[esc_] || []).push(Number(den[pos]));
    }
    /* `sem_goleiro` é motivo só da vaga de goleiro: emprestar para outra posição seria afirmar mais. */
    if (pos === 'GOL' && p.sem_goleiro && motivos.indexOf(p.sem_goleiro) < 0) motivos.push(p.sem_goleiro);
  });
  const escopos = Object.keys(porEscopo);
  if (!escopos.length) {
    return 'A etapa 14 não monta vaga de <b>' + esc(pos) + '</b> em nenhuma das ' + ptInt(chaves.length) +
      ' propostas' + (motivos.length ? ' (' + esc(motivos.join('; ')) + ')' : ' — ' +
      ptFalta('as propostas não dizem por que')) + '.';
  }
  const partes = escopos.map(s => {
    const v = porEscopo[s], lo = Math.min.apply(null, v), hi = Math.max.apply(null, v);
    return (lo === hi ? ptInt(lo) : 'de ' + ptInt(lo) + ' a ' + ptInt(hi)) + ' ' + esc(pcNomeEscopo(s));
  });
  const todos = [].concat.apply([], escopos.map(s => porEscopo[s]));
  const igual = todos.every(x => x === Number(naLista));
  return 'Na etapa 14, cada proposta conta os seus próprios candidatos para essa vaga: ' + partes.join('; ') +
    (igual ? ' — o mesmo número da lista inteira.' : ' — não é o número da lista inteira, porque cada proposta ' +
      'busca num lugar só e aplica os seus próprios cortes.');
}

/* O aviso do contrato montado do dado. "A maior parte" só é escrito quando a fatia do mesmo mês passa
   da metade da janela (metade é a definição de "maior parte", não um corte do estudo). O mês sai do
   nome da chave, como o degrau do funil. */
function pcAvisoContrato(d) {
  const chave = Object.keys(d).find(k => /^vencem_exatamente_em_[a-z]{3}\d{2}$/.test(k));
  const chavePct = Object.keys(d).find(k => /^pct_da_janela_em_[a-z]{3}\d{2}$/.test(k));
  const mes = chave ? chave.replace(/^vencem_exatamente_em_([a-z]{3})(\d{2})$/, '$1/$2') : null;
  const n = chave ? d[chave] : null, pct = chavePct ? d[chavePct] : null;
  if (d.vencem_na_janela === undefined || d.vencem_na_janela === null || n === null || n === undefined) {
    return ptFalta('o estudo não trouxe quantos contratos da janela vencem no mesmo mês');
  }
  const maioria = pct !== null && pct !== undefined && Number(pct) > 50;
  return (maioria ? '<b>Dentro da janela, a data de fim de contrato quase não diferencia um nome do outro.</b> ' : '') +
    'Dos <b>' + ptInt(d.vencem_na_janela) + '</b> contratos que vencem na janela inteira, <b>' + ptInt(n) +
    '</b> — <b>' + ptPct(pct) + '</b> deles — vencem no mesmo mês' + ptTecnico(esc(chave) + (mes ? ' · ' + esc(mes) : '')) + '. ' +
    'O que ordena os nomes desta lista é a nota de encaixe da etapa 13, não a data do contrato.';
}
/* A frase sobre o técnico só repete o que a etapa 11 mediu: o físico se repetiu mais que o técnico
   de quem mudou de clube? Sem o dado, a frase não é escrita. */
function pcTecnicoNaMala() {
  const e11 = (ptDado() || {}).etapa_11 || {};
  const f = e11.fisico, t = e11.tecnico;
  if (!f || !t || f.rho_mediano === null || f.rho_mediano === undefined ||
      t.rho_mediano_mudou === null || t.rho_mediano_mudou === undefined) return '';
  return Number(f.rho_mediano) > Number(t.rho_mediano_mudou)
    ? ' — e na etapa 11 o técnico acompanhou o atleta na troca de clube menos do que o físico' +
      ptTecnico('ρ mediano ' + ptNum(t.rho_mediano_mudou, 3) + ' contra ' + ptNum(f.rho_mediano, 3))
    : '';
}
/* Por que não somar as três notas, dito com as faixas gravadas: só se as faixas de fato forem
   diferentes entre os blocos. */
function pcFraseNuncaSomar(pesos) {
  const ks = Object.keys(pesos || {}).filter(k => (pesos[k].rho_ao_trocar_de_clube || []).length === 2);
  if (ks.length < 2) return 'Somar as três num número só daria a mesma importância a notas cujo acompanhamento ' +
    'na troca de clube ' + ptFalta('o estudo não declarou para todos os blocos') + '.';
  const faixa = k => pesos[k].rho_ao_trocar_de_clube;
  const alto = ks.slice().sort((a, b) => faixa(b)[1] - faixa(a)[1])[0];
  const baixo = ks.slice().sort((a, b) => faixa(a)[1] - faixa(b)[1])[0];
  if (faixa(alto)[1] === faixa(baixo)[1] && faixa(alto)[0] === faixa(baixo)[0]) {
    return 'As faixas dos blocos são iguais no dado, e a regra de não somar vem do estudo, não de uma diferença medida aqui.';
  }
  const nome = k => ({ fisica: 'física', duelo: 'duelo', estilo: 'estilo' })[k] || k;
  return 'Somar as três num número só daria o mesmo peso a notas que acompanharam o atleta de jeitos ' +
    'diferentes: na nota de ' + esc(nome(alto)) + ', os números de antes e depois da troca ' + pcJuntoFaixa(faixa(alto)) +
    '; na de ' + esc(nome(baixo)) + ', ' + pcJuntoFaixa(faixa(baixo)) + '.';
}
/* Uma faixa de ρ dita em palavras: "andam juntos entre “pouco” e “de forma moderada”". */
function pcJuntoFaixa(faixa) {
  const a = ptJunto(faixa[0]), b = ptJunto(faixa[1]), pre = 'andam juntos ';
  return a === b ? a
    : (a.indexOf(pre) === 0 && b.indexOf(pre) === 0
        ? pre + 'entre “' + a.slice(pre.length) + '” e “' + b.slice(pre.length) + '”'
        : a + ' a ' + b);
}
function pcEt12Detalhe(deg, i, d) {
  const g = deg[i], ant = i > 0 ? deg[i - 1] : null;
  /* `nao_brasileiros` entrou quando se mediu que o rótulo antigo do primeiro degrau mentia: o
     primeiro degrau era o mundo inteiro menos o Brasil. Do segundo degrau em diante os dois
     convivem — depois do filtro de ligas o recorte sul-americano volta a querer dizer o que diz.
     O filtro por `!== undefined` logo abaixo faz cada degrau mostrar só o que ele tem. */
  const blocos = ['serie_b', 'nao_brasileiros', 'sul_americanos', 'brasil'];
  const rot = { serie_b: 'Série B', nao_brasileiros: 'de fora do Brasil',
                sul_americanos: 'sul-americanos', brasil: 'resto do Brasil' };
  const linhas = blocos.filter(b => g[b] !== undefined).map(b => {
    const saiu = ant && ant[b] !== undefined ? ant[b] - g[b] : null;
    return '<div style="display:flex;justify-content:space-between;gap:10px;padding:4px 0;flex-wrap:wrap;' +
      'border-bottom:1px solid var(--borda)">' +
      '<span style="font-size:12px;color:var(--tinta2)">' + rot[b] + '</span>' +
      '<span style="font-size:12px;font-variant-numeric:tabular-nums">' +
        '<b>' + ptInt(g[b]) + '</b> ficaram' +
        /* Zero não leva sinal: "−0" parecia uma perda arredondada, e é "ninguém saiu". */
        (saiu === null ? '' : saiu === 0
          ? ' · <span style="color:var(--tinta3)">nenhum saiu</span>'
          : ' · <span style="color:var(--pt-baixo)">' + (saiu > 0 ? '−' + ptInt(saiu) : '+' + ptInt(-saiu) + ' entraram') + '</span>') +
      '</span></div>';
  }).join('');

  return '<div style="margin-top:8px;padding:9px 12px;background:var(--veu2);border-radius:8px">' +
    '<p class="pt-nota" style="margin-top:0">' +
      (ant
        ? 'Entraram <b>' + ptInt(ant.n) + '</b>, saíram <b>' + ptInt(g.saiu) + '</b>, ficaram <b>' +
          ptInt(g.n) + '</b> — ' + ptPct(ant.n ? (g.n / ant.n) * 100 : null) + ' do degrau anterior.'
        : 'É a base inteira, antes de qualquer corte: <b>' + ptInt(g.n) + '</b> jogadores' +
          (d.periodo_da_base ? ptTecnico('base ' + esc(d.periodo_da_base)) : '') + '.') +
    '</p>' + linhas +
    '<p class="pt-nota" style="font-size:11px;margin-top:7px">' +
      ptFalta('a regra deste degrau não vem no dado: o nome "' + pcDegrau(g.degrau) + '" é tudo ' +
        'o que o estudo diz sobre por que estes nomes saíram') + '</p>' +
    '</div>';
}

function pcBarrinhas(mapa) {
  const chaves = Object.keys(mapa || {});
  if (!chaves.length) return ptFalta('este bloco não veio no dado');
  const max = pcMax(chaves.map(k => mapa[k]));
  return chaves.sort((a, b) => mapa[b] - mapa[a]).map(k =>
    ptBarra(mapa[k], max, { rot: k, texto: ptInt(mapa[k]) })).join('');
}

function pcEt12Conferencia(cc, deg) {
  const conf = cc.por_confianca || {};
  const tab = ptTabela({
    id: ptId('12-conf'),
    ordem: { col: 'pct', dir: 'desc' },
    vazio: 'o estudo não dividiu a conferência por confiança do contrato',
    colunas: [
      { k: 'faixa', rot: 'confiança do contrato', tipo: 'texto' },
      { k: 'bate', rot: 'datas que batem', casas: 0 },
      { k: 'de', rot: 'datas conferidas', casas: 0 },
      { k: 'pct', rot: 'parte que bate', fmt: v => ptPct(v) },
    ],
    linhas: Object.keys(conf).map(k => Object.assign({ faixa: k }, conf[k])),
  });
  const geral = cc.geral || {};
  const ponte = cc.por_ponte || {};
  /* A discordância é a conta que faltava na tela: o card imprimia a concordância lida do JSON
     e emendava uma conclusão escrita à mão sobre o que ela significava. O complemento e a
     contagem absoluta dizem a mesma coisa sem ninguém precisar acreditar na frase — e
     continuam dizendo se o número mudar. */
  const discPct = (geral.pct === null || geral.pct === undefined) ? null : 100 - Number(geral.pct);
  const discN = (geral.de === null || geral.de === undefined || geral.bate === null || geral.bate === undefined)
    ? null : Number(geral.de) - Number(geral.bate);
  /* Quantos nomes o degrau de confiança derruba: lido da cascata, pelo nome do degrau. */
  const degConf = (deg || []).find(g => /confianca/.test(String(g.degrau)));
  const ROT_PONTE = { tm: 'pelo código do Transfermarkt', nome: 'pelo nome do atleta' };
  return ptCard('A data de contrato bate com a outra fonte?',
    (cc.populacao_coberta ? 'conferido só para ' + esc(cc.populacao_coberta) : 'população conferida não declarada') +
      (cc.fonte ? ptTecnico('outra fonte: ' + esc(cc.fonte)) : ' · fonte não declarada no dado'),
    pcGrade(170,
      pcNumeroSolto('datas que batem, no geral', ptPct(geral.pct),
        ptInt(geral.bate) + ' de ' + ptInt(geral.de)) +
      Object.keys(ponte).map(k => pcNumeroSolto('cruzadas ' + (ROT_PONTE[k] || 'por ' + esc(k)), ptPct(ponte[k].pct),
        ptInt(ponte[k].bate) + ' de ' + ptInt(ponte[k].de))).join('') +
      pcNumeroSolto('jogadores com o mesmo nome, descartados', ptInt(cc.homonimos_descartados),
        'tirados antes de cruzar, para não inflar a conta') +
      pcNumeroSolto('contratos com data já vencida', ptInt(cc.contrato_ate_2022_2025),
        ptTecnico('contrato_ate_2022_2025'))) +
    '<div style="margin-top:11px">' + tab + '</div>',
    'Este é o número que decide se a lista inteira vale: as duas fontes dão a mesma data de fim de ' +
    'contrato em <b>' + ptPct(geral.pct) + '</b> dos casos' +
    (discPct !== null
      ? ' — e em <b>' + ptPct(discPct) + '</b>' +
        (discN !== null ? ' (' + ptInt(discN) + ' de ' + ptInt(geral.de) + ' datas conferidas)' : '') +
        ' dão datas diferentes.'
      : '. ' + ptFalta('o estudo não trouxe a taxa geral, então a discordância não pode ser calculada') +
        '.') +
    ' A divisão por confiança mostra onde a discordância mora — e é por isso que existe o degrau de ' +
    'confiança no funil' +
    (degConf && degConf.saiu ? ', mesmo derrubando ' + ptInt(degConf.saiu) + ' nomes' : '') + '.');
}

/* ================================================================================
   ETAPA 13 — A NOTA DE ENCAIXE, EM TRÊS PEDAÇOS
   ================================================================================

   Três regras desta etapa vêm do próprio dado e não podem ser negociadas na tela:

   1. `nunca_somar: true` — os três blocos aparecem separados. Somar esconde justamente a
      informação que custou mais caro: as coberturas são diferentes e o bloco que menos viaja
      com o atleta é o que mais tem dado.
   2. O `sc_n` anda colado em todo número físico. Um atleta com poucas partidas rastreadas e
      outro com muitas não podem sair na mesma tipografia.
   3. O backtest vai no CABEÇALHO, não no rodapé. É o único número da aba que testa a
      ordenação que o clube vai usar para assinar contrato — e o resultado dele é o que é.

   Desde 14/09 os quatro setores (alvos e candidatos) e a trilha do goleiro aparecem
   empilhados, sem clique, e as tabelas de candidatos têm filtro de liga, idade e
   nacionalidade. O filtro só esconde linhas; as contagens que descrevem cada tabela são
   refeitas sobre o que ficou visível, e as que descrevem a lista inteira dizem que são dela. */

/* O veredito do teste da nota, calculado — usado aqui e ao lado dos nomes da etapa 14, para as
   duas etapas dizerem a mesma coisa com o mesmo critério. Se um dia a nota passar a separar
   minutos, a frase muda sozinha; se continuar não separando, ela continua dizendo isso. */
function pcVereditoBacktest(bt) {
  if (!bt) return { separou: false, sepMinutos: false, sepPermanencia: false, html: '' };
  const alfa = pcAlfa();
  const sepMinutos = pcPassa(bt.p_minutos);
  const sepPermanencia = pcPassa(bt.p_permanencia);
  const html = (sepMinutos || sepPermanencia
    ? '<b>A nota separou.</b> ' +
      (sepMinutos ? 'Minutos no ano da chegada: diferença ' + ptTamanho(bt.d_minutos) + ', ' +
        ptSorte(bt.p_minutos) + ptTecnico('d ' + ptD(bt.d_minutos) + ' · ' + ptP(bt.p_minutos)) + '. ' : '') +
      (sepPermanencia ? 'Ficaram no clube no ano seguinte: ' + ptPct(bt.permanencia_recomendados_pct) +
        ' dos aprovados contra ' + ptPct(bt.permanencia_reprovados_pct) + ' dos reprovados, ' +
        ptSorte(bt.p_permanencia) + ptTecnico(ptP(bt.p_permanencia)) + '.' : '')
    : '<b>A nota não separou nada.</b> Testada com jogadores que já tinham chegado a clubes da Série B, ' +
      'a metade que a nota aprovaria jogou em média ' + ptNum(bt.min_medio_recomendados, 0) +
      ' minutos (' + pcQtd(bt.n_recomendados, 'chegadas') + '), e a metade que ela reprovaria jogou ' +
      ptNum(bt.min_medio_reprovados, 0) + ' (' + pcQtd(bt.n_reprovados, 'chegadas') + '). Diferença ' +
      ptTamanho(bt.d_minutos) + ': ' + ptAcaso(bt.p_minutos) + ' — ' + ptSorte(bt.p_minutos) +
      ptTecnico('d ' + ptD(bt.d_minutos) + ' · ' + ptP(bt.p_minutos)) + '. ' +
      'Ficaram no clube no ano seguinte ' + ptPct(bt.permanencia_recomendados_pct) + ' dos aprovados contra ' +
      ptPct(bt.permanencia_reprovados_pct) + ' dos reprovados — ' + ptSorte(bt.p_permanencia) +
      ptTecnico(ptP(bt.p_permanencia)) + '. E a nota e os minutos ' + ptJunto(bt.rho_nota_x_minutos) +
      ptTecnico('ρ ' + ptNum(bt.rho_nota_x_minutos, 3) + ' · ' + ptP(bt.p_rho)) + '.' +
      /* "fica abaixo do corte do estudo" era o p < alfa disfarçado. O veredito sai do MENOR dos
         dois p pelo mesmo ptSorte da aba: se um dia um deles ficar "no limite", a frase diz isso. */
      (alfa !== null ? ' Nos dois resultados (minutos jogados e ficar no clube), a nota não fez diferença: ' +
        ptSorte(Math.min(Number(bt.p_minutos), Number(bt.p_permanencia))) + '.' +
        ptTecnico('nenhum p abaixo de ' + ptNum(alfa, 2)) : ''));
  return { separou: !!(sepMinutos || sepPermanencia), sepMinutos: sepMinutos, sepPermanencia: sepPermanencia, html: html };
}

function ptEtapa13(alvo, d) {
  const bt = d.backtest || null;
  const setores = Object.keys(d.alvos_por_setor || {}).filter(k => k.charAt(0) !== '_');
  const nClube = (d.alvos_por_setor || {})._n_clube_por_cenario || null;
  const cands = d.candidatos || [];
  const gk = d.trilha_goleiro || null;
  const vb = pcVereditoBacktest(bt);

  const cabecalhoBacktest = bt
    ? '<div class="pt-controle" style="border-left:3px solid ' + (vb.separou ? 'var(--pt-ok)' : 'var(--coral)') + '">' +
        '<span class="pt-rot">a nota testada com quem já chegou — no topo, porque é o número que decide se o resto vale</span>' +
        '<p class="pt-nota" style="font-size:13.5px;color:var(--tinta);margin-top:6px">' + vb.html + '</p>' +
        pcGrade(160,
          pcNumeroSolto('chegadas que dava para avaliar', ptInt(bt.chegadas_pontuaveis),
            'de ' + ptInt(bt.chegadas_definicao_ampla) + ' chegadas' +
            (bt.rotulo_da_definicao_ampla ? ' em ' + esc(bt.rotulo_da_definicao_ampla) : '')) +
          /* a cobertura é a parte das avaliáveis que tem nota (sem físico não há nota), não a parte
             das que têm nota que tem físico. O rótulo dizia o contrário do dado. */
          pcNumeroSolto('chegadas com nota', ptInt(bt.chegadas_com_nota),
            ptPct(bt.cobertura_fisica_pct) + ' das ' + ptInt(bt.chegadas_pontuaveis) + ' avaliáveis; as outras não ' +
            'tinham dado físico') +
          pcNumeroSolto('ficou ou saiu no ano seguinte', ptInt(bt.permanencias), 'o segundo resultado medido') +
          pcNumeroSolto('linha entre aprovado e reprovado', 'metade de cima',
            'quem ficou acima da nota do meio' + ptTecnico('mediana da margem ' + ptNum(bt.corte_mediana, 4)))) +
        '<p class="pt-nota">' +
          (/f[íi]sica/i.test(String(bt.o_que_mede || ''))
            ? 'O teste pega <b>só a nota FÍSICA</b> do ano anterior à chegada — duelo e estilo não foram testados ' +
              'assim — e olha o que aconteceu depois.'
            : 'O teste pega a nota do ano anterior à chegada e olha o que aconteceu depois. ' +
              ptFalta('o estudo não diz quais pedaços da nota entraram no teste')) +
          (bt.o_que_mede ? ptTecnico('o que mede: ' + esc(bt.o_que_mede)) : '') +
          (bt.nota ? ptTecnico(esc(bt.nota)) : '') + '</p>' +
        '<p class="pt-nota">Este resultado fica no topo por decisão de método: uma lista ordenada que ninguém ' +
          'conferiu, cercada de estatística que fala de outra coisa, é exatamente o que esta aba existe para ' +
          'não entregar.</p>' +
      '</div>'
    : ptFaltaBloco('O teste da nota não veio no dado',
        'sem o teste, a tela publicaria uma lista ordenada que ninguém conferiu. A ausência fica aqui, no ' +
        'topo, no lugar exato onde o resultado deveria estar.');

  /* Controle 1. A nota não tem AUC comparável ao do dinheiro, e o motivo é de desenho: ela é
     testada contra permanência e minutos do atleta, não contra subida do clube. */
  const baseline = ptBaseline({
    rotulo: 'a nota de encaixe',
    auc: null,
    motivo: bt
      ? 'o teste desta nota mede minutos e permanência do JOGADOR depois de chegar, não a subida do CLUBE. ' +
        'Não há taxa de acerto comparável à do valor do elenco — o que existe está no bloco acima'
      : 'a nota não foi testada, portanto não há nada para comparar com o valor do elenco',
  });

  const pesos = d.pesos || {};
  const NOME_BLOCO = { fisica: 'física', duelo: 'duelo', estilo: 'estilo' };
  const PESO = { alto: 'alto', medio: 'médio', baixo: 'baixo' };
  const blocos = Object.keys(pesos).map(k => {
    const p = pesos[k];
    const faixa = p.rho_ao_trocar_de_clube || [];
    const junto = faixa.length === 2 ? pcJuntoFaixa(faixa) : '';
    return '<div style="padding:12px 13px;border:1px solid var(--borda);border-radius:8px">' +
      '<span class="pt-rot">nota</span>' +
      '<b style="display:block;font-size:16px;margin:3px 0 6px">' + esc(NOME_BLOCO[k] || k) + '</b>' +
      '<div style="font-size:12px;color:var(--tinta2)">antes e depois de trocar de clube, os números <b>' +
        (faixa.length === 2 ? junto + ptTecnico('ρ ' + ptNum(faixa[0], 2) + ' – ' + ptNum(faixa[1], 2))
          : ptFalta('o estudo não declarou a faixa deste bloco')) + '</b></div>' +
      '<div style="font-size:12px;color:var(--tinta2);margin-top:3px">peso na decisão: <b>' +
        esc(PESO[p.peso] || p.peso) + '</b></div>' +
      '</div>';
  }).join('');

  const cardPesos = ptCard('Três notas, e a regra de nunca somá-las',
    (d.nunca_somar ? '<b style="color:var(--coral)">o estudo proíbe juntar as três num número só</b>' +
      ptTecnico('nunca_somar') : 'o estudo não diz se as três notas podem ser somadas'),
    pcGrade(200, blocos),
    'O peso de cada nota é o quanto ela acompanhou o atleta na troca de clube, medido na etapa 11. ' +
    (d.nunca_somar ? pcFraseNuncaSomar(pesos) : ''));

  const setoresCand = [];
  cands.forEach(c => { if (c.setor && setoresCand.indexOf(c.setor) < 0) setoresCand.push(c.setor); });
  const gkCands = gk ? (gk.candidatos || []) : [];
  const listas = [{ nome: 'candidatos de linha', regs: cands.filter(c => c.setor), nac: pcTemNac(cands) }];
  if (gk) listas.push({ nome: 'goleiros da trilha técnica', regs: gkCands, nac: pcTemNac(gkCands) });
  const ctx = {
    chave: '13',
    titulo: 'filtrar os candidatos e os goleiros',
    listas: listas,
  };
  ctx.conta = () => {
    const f = pcFiltro('13');
    const vis = listas.map(l => l.regs.filter(r => pcPassaFiltro(r, f, l.nac.ok)).length);
    const esc0 = listas.map((l, i) => l.regs.length - vis[i]);
    return 'Visíveis com os filtros: ' + listas.map((l, i) => '<b>' + ptInt(vis[i]) + '</b> de ' +
        ptInt(l.regs.length) + ' ' + esc(l.nome)).join(' · ') +
      (esc0.some(n => n > 0)
        ? ' — escondidos: ' + listas.map((l, i) => ptInt(esc0[i]) + ' ' + esc(l.nome)).join(' e ') + '.'
        : ' — nenhum escondido.') +
      ' <b>O filtro só esconde linhas: não refaz a nota de ninguém.</b> Cada nota foi calculada contra a base ' +
      'inteira, na liga e na posição do atleta, e é a mesma com ou sem filtro; as contagens de empate de cada ' +
      'tabela é que são refeitas sobre o que ficou visível.' + pcContaExtras(ctx);
  };

  alvo.innerHTML =
    cabecalhoBacktest +
    baseline +
    cardPesos +
    pcEt13Alvos(d, setores, nClube) +
    pcEt13ListaInteira(d, cands, setoresCand, gk) +
    pcFiltrosHtml(ctx) +
    '<div data-pc-area="13"></div>';

  const area = alvo.querySelector('[data-pc-area="13"]');
  pcLigarFiltros(alvo, ctx, () => {
    const f = pcFiltro('13');
    area.innerHTML =
      setoresCand.map(s => '<div id="' + esc(ptId('13-cand-' + s)) + '">' +
        pcEt13Candidatos(d, cands, s, f, listas[0].nac.ok) + '</div>').join('') +
      '<div id="' + esc(ptId('13-goleiro')) + '">' +
        (gk ? pcEt13Goleiro(gk, d, f, listas[1].nac.ok)
          : ptFaltaBloco('A avaliação do goleiro não veio',
              'o estudo não trouxe a lista de goleiros, e o goleiro não pode simplesmente sumir da tela: ele ' +
              'está fora da nota principal por uma razão que precisa ficar escrita.')) +
      '</div>';
    ptLigarTabelas(area);
  });
  pcLigarSaltos(alvo);
  ptLigarTabelas(alvo);
}

/* O nome da medida física da etapa 13 (os apelidos `spn_s`, `obr_area`, `psv5`…): nome simples e
   a primeira frase do que ela mede, os dois do glossário (ptInfoMedida), com a dica inteira no
   `title`. A marca de fase existe porque "por 30 minutos daquela fase" e "por 90 minutos" parecem
   a mesma régua e não são: o glossário diz qual é qual (`compara_com_por_90`, `por`). */
function pcMedidaFrase(k) {
  const i = ptInfoMedida(k);
  const s = i.mede ? String(i.mede) : '';
  const m = /^(.*?\.)(\s|$)/.exec(s);
  const frase = s ? (m ? m[1] : s) : '';
  const deFase = i.compara_com_por_90 === false && /fase/i.test(String(i.escala || ''));
  return '<span title="' + esc(ptDicaMedida(k)) + '"><b>' + esc(ptNomeIndicador(k)) + '</b></span>' +
    (deFase ? ' <span class="pt-marca alerta">' + esc(i.escala) + ': não compare com as medidas do jogo inteiro</span>' : '') +
    '<small style="display:block;color:var(--tinta3);margin-top:2px">' +
      (frase ? esc(frase) : ptFalta('o glossário não descreve esta medida')) +
      (i.unidade ? ' · unidade: ' + esc(i.unidade) : '') +
    '</small>';
}

function pcEt13Alvos(d, setores, nClube) {
  if (!setores.length) {
    return ptFaltaBloco('O estudo não trouxe o alvo de cada setor',
      'sem alvo não há como dar nota: a nota mede a distância até um perfil, e o perfil é isto.');
  }
  const alvosTodos = d.alvos_por_setor || {};
  const kSobe = ptFx('sobe'), kCai = ptFx('cai');
  const grupos = ['sobe', 'caro', 'barato', 'cai'];
  const chaveGrupo = g => (g === 'caro' || g === 'barato') ? g : ptFx(g);

  /* O aviso de amostra: quantos clubes formam cada alvo, lido de `_n_clube_por_cenario`. O
     menor grupo é dito pelo nome e comparado ao maior — sem corte digitado do que é "pouco". */
  let aviso = '';
  const cens = nClube ? Object.keys(nClube) : [];
  if (cens.length) {
    const ord = cens.slice().sort((a, b) => nClube[a] - nClube[b]);
    const menor = ord[0], maior = ord[ord.length - 1];
    aviso = '<div class="pt-controle" style="border-left:3px solid var(--coral)">' +
      '<span class="pt-rot">antes de ler os alvos: quantos clubes formam cada um</span>' +
      '<p class="pt-nota" style="margin-top:5px;color:var(--tinta)">' +
        cens.map(k => pcGrupo(k) + ': <b>' + ptInt(nClube[k]) + '</b> ' + (nClube[k] === 1 ? 'clube' : 'clubes')).join(' · ') + '. ' +
        (nClube[menor] < nClube[maior]
          ? 'O alvo de <b>' + pcGrupo(menor) + '</b> sai da média de só <b>' + ptInt(nClube[menor]) + '</b> ' +
            (nClube[menor] === 1 ? 'clube' : 'clubes') + ', contra ' + ptInt(nClube[maior]) + ' de ' + pcGrupo(maior) +
            ': com tão poucos clubes, um clube a mais ou a menos move o alvo, e o número dessa coluna é referência frágil.'
          : 'Todos os alvos saem do mesmo número de clubes.') +
        ptTecnico('_n_clube_por_cenario: o maior número de clubes que cada grupo teve em alguma medida; ' +
          'cada célula da tabela traz o seu') +
      '</p></div>';
  } else {
    aviso = ptFaltaBloco('O estudo não trouxe quantos clubes formam cada alvo',
      'sem essa contagem não dá para dizer quais alvos saem de poucos clubes (etapa_13.alvos_por_setor._n_clube_por_cenario).');
  }

  /* Um exemplo lido do dado para a coluna "onde fica o clube típico": a primeira medida da
     primeira tabela. O número do exemplo é o da célula, não um número de explicação. */
  const s0 = setores[0];
  const k0 = Object.keys(alvosTodos[s0] || {})[0];
  const a0 = k0 ? alvosTodos[s0][k0] : null;
  const temTempo = setores.some(s => Object.keys(alvosTodos[s] || {}).some(k => alvosTodos[s][k].menor));

  const legenda = '<p class="pt-nota" style="margin-top:0">Como ler as colunas:</p>' +
    '<ul style="margin:4px 0 10px;padding-left:18px;font-size:12.5px;line-height:1.55;color:var(--tinta2);max-width:75ch">' +
      '<li><b>diferença, contando o clube uma vez</b>: o tamanho da diferença entre ' + esc(ptFxRot('sobe')) +
        ' e ' + esc(ptFxRot('cai')) + ' quando cada CLUBE conta como um caso, e não cada atleta; ao lado, se pode ser sorte.</li>' +
      '<li><b>passa contando atleta por atleta?</b>: o teste antigo, que tratava cada atleta como independente. ' +
        'Muitos atletas do mesmo clube fazem esse teste passar mais fácil; ele fica só como comparação.</li>' +
      '<li><b>onde fica o clube típico de cada grupo</b>: cada clube entra pela média dos seus atletas, pesada ' +
        'pelos minutos; a média desses clubes é comparada com todos os atletas daquele setor na Série B ' +
        'rastreada. O número é a parte desses atletas que fica abaixo dela' +
        (a0 && a0['pct_' + kSobe] !== null && a0['pct_' + kSobe] !== undefined
          ? ' — na primeira linha de ' + esc(PT_SETOR_NOME[s0] || s0) + ', ' + esc(ptNomeIndicador(k0)) +
            ', a média dos clubes de ' + esc(ptFxRot('sobe')) + ' fica acima de ' + ptPct(a0['pct_' + kSobe]) +
            ' dos ' + ptInt(a0.n_atletas_serie_b) + ' atletas'
          : '') + '. Não é a posição do time no ranking do ano.' +
        (temTempo ? ' Nos tempos (menos é melhor), número alto quer dizer mais lento que a maioria.' : '') +
        ptTecnico('pct = 100 × parte dos atletas do setor com valor abaixo da média dos clubes do grupo (gerar_prototipo.py, alvos_fisicos)') + '</li>' +
      '<li><b>marca de fase</b>: as medidas “por fase” contam só o tempo em que o time estava com ' +
        '(ou sem) a bola; não se comparam com as medidas do jogo inteiro.</li>' +
    '</ul>';

  const saltos = pcSaltos('ir para o setor:', setores.map(s => ({ id: ptId('13-alvo-' + s), rot: esc(PT_SETOR_NOME[s] || s) })));

  const secoes = setores.map(setor => {
    const alvos = alvosTodos[setor] || {};
    const chaves = Object.keys(alvos);
    const linhas = chaves.map(k => Object.assign({ k: k }, alvos[k]));
    const maxAtletas = linhas.length ? pcMax(linhas.map(l => l.n_atletas_serie_b || 0)) : 0;
    const sobrevivemBH = linhas.filter(l => l.bh_clube).length;
    const sobrevivemAtleta = linhas.filter(l => l.bh_atleta).length;
    const tab = ptTabela({
      id: ptId('13-alvos-' + setor),
      ordem: { col: 'p_clube', dir: 'asc' },
      vazio: 'este setor não tem medida nenhuma',
      colunas: [
        { k: 'k', rot: 'medida', tipo: 'texto', fmt: v => pcMedidaFrase(v) },
        { k: 'menor', rot: 'lado bom', tipo: 'texto',
          dica: 'o lado bom só existe onde o estudo o declarou; a nota mede proximidade ao perfil, não “quanto mais, melhor”',
          fmt: (v, l) => v ? 'menos é melhor' : esc(ptInfoMedida(l.k).lado || 'o estudo não declara lado bom') },
        { k: 'd_clube', rot: 'diferença, contando o clube uma vez',
          dica: 'tamanho da diferença entre ' + ptFxRot('sobe') + ' e ' + ptFxRot('cai') + ', com o CLUBE como caso',
          cel: (v, l) => pcTdTxt(pcDif(v, l.p_clube)) },
        { k: 'bh_clube', rot: 'sobra, descontada a sorte de testar muita coisa?', tipo: 'texto',
          dica: 'quando se testa muita coisa, alguma dá certo por sorte; esta coluna diz se a medida sobra depois de descontar essa sorte, comparando clubes inteiros',
          fmt: (v, l) => (v ? '<b style="color:var(--pt-ok)">sim</b>' : '<span style="color:var(--tinta3)">não</span>') +
            ptTecnico('q de BH ' + ptPv(l.q_clube)) },
        { k: 'bh_atleta', rot: 'passa contando atleta por atleta? (teste antigo)', tipo: 'texto',
          dica: 'conta cada atleta como independente e por isso passa mais fácil: até ' + ptInt(maxAtletas) +
            ' atletas dentro de poucos clubes — fica só como comparação',
          fmt: v => v ? 'sim' : 'não' },
        { k: 'pct_' + kSobe, rot: 'onde fica o clube típico de cada grupo',
          dica: 'ordena pelo número de ' + ptFxRot('sobe'),
          cel: (v, l) => pcTdTxt(grupos.map(g => {
            const kg = chaveGrupo(g);
            const val = l['pct_' + kg];
            const nc = l['n_clubes_' + kg];
            return '<span style="display:block">' + pcGrupo(g) + ' ' +
              (val === null || val === undefined
                ? ptFalta(l['motivo_' + kg] || 'sem alvo deste grupo nesta medida')
                : '<b>' + ptNum(val, 1) + '</b>') +
              (nc !== undefined && nc !== null ? ' <span class="pt-n">' + ptInt(nc) + ' ' + (nc === 1 ? 'clube' : 'clubes') + '</span>' : '') +
              '</span>';
          }).join('')) },
        { k: 'n_atletas_serie_b', rot: 'atletas na régua', casas: 0,
          dica: 'quantos atletas deste setor na Série B rastreada formam a régua da coluna ao lado' },
      ],
      linhas: linhas,
    });
    return '<div id="' + esc(ptId('13-alvo-' + setor)) + '" style="margin-top:14px">' +
      '<span class="pt-rot">' + esc(PT_SETOR_NOME[setor] || setor) + ' · ' + ptInt(chaves.length) + ' medidas</span>' +
      tab +
      '<p class="pt-nota">Descontada a sorte de testar muita coisa, sobram <b>' + ptInt(sobrevivemBH) + '</b> das ' +
        ptInt(chaves.length) + ' medidas deste setor quando se comparam clubes inteiros; contando atleta por ' +
        'atleta, sobram <b>' + ptInt(sobrevivemAtleta) + '</b>. A diferença entre os dois números é ilusão de ' +
        'quantidade: até ' + ptInt(maxAtletas) + ' atletas dentro de poucos clubes dão resultado com cara de forte ' +
        'sem trazer informação nova.</p>' +
      '</div>';
  }).join('');

  return ptCard('O alvo de cada setor, medido comparando clubes inteiros',
    ptInt(setores.length) + ' setores, todos abertos' +
      ptTecnico(esc(kSobe) + ' × ' + esc(kCai) + ' · etapa_13.alvos_por_setor'),
    aviso + legenda + saltos + secoes,
    'As colunas de cada grupo são os alvos: a nota mede a DISTÂNCIA até eles, e não "quanto mais, melhor" — ' +
    'quem está acima do alvo em tudo não encaixa melhor, encaixa diferente.');
}

/* O que descreve a LISTA INTEIRA fica num quadro só, antes dos filtros, e diz que é da lista
   inteira. Repetir isso embaixo de cada setor seria ruído; e deixar embaixo de uma tabela
   filtrada, sem rótulo, faria o número falar de uma tabela e a tela mostrar outra. */
function pcEt13ListaInteira(d, cands, setoresCand, gk) {
  const semFisicoLigas = pcLigasSemFisico();
  const ligasNoPool = {};
  cands.forEach(c => { ligasNoPool[c.liga] = (ligasNoPool[c.liga] || 0) + 1; });
  const ligasSemBase = Object.keys(ligasNoPool).filter(l => semFisicoLigas.indexOf(l) >= 0);
  const semSetor = cands.filter(c => !c.setor);
  const posSemSetor = [];
  semSetor.forEach(c => { if (c.pos && posSemSetor.indexOf(c.pos) < 0) posSemSetor.push(c.pos); });
  const gkNoPool = (gk || {}).no_pool_operacional;
  const batemComGk = gkNoPool !== null && gkNoPool !== undefined && Number(gkNoPool) === semSetor.length;

  const saltos = pcSaltos('ir para:', setoresCand.map(s => ({
    id: ptId('13-cand-' + s),
    rot: esc(PT_SETOR_NOME[s] || s) + '<span class="pt-chip-n">' + ptInt(cands.filter(c => c.setor === s).length) + '</span>',
  })).concat(gk ? [{ id: ptId('13-goleiro'), rot: 'goleiros<span class="pt-chip-n">' + ptInt((gk.candidatos || []).length) + '</span>' }] : []));

  return ptCard('Os candidatos, um por linha, com as três notas separadas',
    pcQtd(cands.length, 'na lista final') + ' · ' +
      setoresCand.map(s => esc(PT_SETOR_NOME[s] || s) + ' ' + ptInt(cands.filter(c => c.setor === s).length)).join(' · ') +
      (d.barrados_sc_n_menor_8 ? ' · ' + ptInt(d.barrados_sc_n_menor_8) + ' fora do ranking por terem poucas partidas com dado físico' : ''),
    saltos +
    '<p class="pt-nota" style="margin-top:0"><b>Os números deste quadro são da lista inteira</b>: os filtros ' +
      'logo abaixo não mexem neles. Cada setor vem aberto embaixo, com a sua tabela e as suas contagens ' +
      'refeitas sobre o que ficar visível.</p>',
    (ligasSemBase.length
      ? '<b style="color:var(--coral)">' + ptInt(ligasSemBase.length) + ' ligas da lista estão entre as sem ' +
        'dado físico</b> (' + esc(ligasSemBase.join(' · ')) + ') — os atletas delas aparecem marcados como sem ' +
        'base para pontuar. '
      : 'Nenhuma das <b>' + ptInt(Object.keys(ligasNoPool).length) + '</b> ligas presentes na lista dos candidatos de linha está entre ' +
        'as <b>' + ptInt(semFisicoLigas.length) + '</b> sem dado físico da etapa 12 (' +
        esc(semFisicoLigas.join(' · ')) + '): elas saíram ANTES, no funil, e por isso nenhum atleta ' +
        'delas chega aqui com nota só técnica disfarçada de nota completa. ') +
    /* A contagem era calculada e a identificação era digitada ("são os goleiros"). A posição
       está no próprio registro do atleta: a tela lê `pos` e escreve o que encontrou. */
    (semSetor.length
      ? '<b>' + ptInt(semSetor.length) + '</b> ' +
        (semSetor.length === 1 ? 'atleta da lista não tem' : 'atletas da lista não têm') +
        ' setor e por isso não ' + (semSetor.length === 1 ? 'aparece' : 'aparecem') +
        ' em nenhum dos setores. A posição ' + (semSetor.length === 1 ? 'dele' : 'deles') +
        ', lida do próprio registro: ' +
        (posSemSetor.length
          ? esc(posSemSetor.join(' · ')) + '. '
          : ptFalta('o dado também não traz a posição desses atletas') + '. ') +
        (batemComGk
          ? 'São exatamente quantos goleiros a avaliação do goleiro diz haver na lista final (' + ptInt(gkNoPool) +
            '), logo abaixo — a conferência é feita aqui, comparando as duas contagens. '
          : '')
      : '') +
    (d.casamento_kpis
      ? 'Ligação com a base de dados técnicos: ' + ptPct(d.casamento_kpis.pct) + ' (' +
        ptInt(d.casamento_kpis.sem_kpi) + ' de ' + ptInt(d.casamento_kpis.pool) + ' atletas sem dado técnico)' +
        ptTecnico('casamento com kpis') + '.'
      : ''));
}

function pcEt13Candidatos(d, cands, setor, f, usaNac) {
  const doSetor = cands.filter(c => c.setor === setor);
  const visiveis = doSetor.filter(c => pcPassaFiltro(c, f, usaNac));
  const escondidos = doSetor.length - visiveis.length;
  const semNotaFisica = visiveis.filter(c => !c.nota_fisica || c.nota_fisica.indicadores_usados === 0);
  const nomeSetor = PT_SETOR_NOME[setor] || setor;
  /* O critério da nota física não é um só: parte dos atletas é pontuada pelos indicadores que
     passaram no teste por clube, e parte cai para os sobreviventes do teste por atleta, que é
     pseudorreplicado. Quantos caíram para o critério fraco é contagem, e vai para a tela. */
  const criterios = {};
  const criterioEx = {};
  visiveis.forEach(c => {
    const k = (c.nota_fisica && c.nota_fisica.criterio) || 'sem critério declarado';
    criterios[k] = (criterios[k] || 0) + 1;
    if (!criterioEx[k]) criterioEx[k] = c.nota_fisica || {};
  });
  const criterioSimples = k => {
    const nf = criterioEx[k] || {};
    if (nf.pseudorreplicado === true) {
      /* "a única que passou" soava como validação. Ela passou no corte SIMPLES; quando se
         desconta a sorte de testar todas as medidas do setor, não sobra — e só de sorte, entre
         tantas, passariam algumas. Tudo lido do registro do setor. */
      const crit = ((d.backtest || {}).criterio_por_setor || {})[setor] || {};
      const alvosSet = (d.alvos_por_setor || {})[setor] || {};
      const nTest = Object.keys(alvosSet).length;
      const inds = crit.indicadores || [];
      const sobra = inds.some(i => alvosSet[i] && alvosSet[i].bh_clube === true);
      const alfa = pcAlfa();
      return 'a nota se apoia em ' + ptCascaConcorda(nf.sobreviventes_por_clube, 'medida só', 'medidas só') +
        (inds.length ? ' (' + esc(inds.map(ptNomeMedida).join(', ')) + ')' : '') +
        ', que passou no corte simples comparando clubes inteiros' +
        (inds.length && nTest && !sobra
          ? ', mas não sobra quando se desconta a sorte de testar ' + ptInt(nTest) + ' medidas' +
            (alfa !== null ? ' (só de sorte, passariam cerca de ' + ptNum(nTest * alfa, 1) + ')' : '')
          : '') +
        ptTecnico(esc(k));
    }
    if (nf.pseudorreplicado === false) {
      return 'medidas que passaram no teste comparando clubes inteiros' + ptTecnico(esc(k));
    }
    return esc(k);
  };

  /* As linhas saem antes da tabela porque a tela precisa MEDIR o que vai desenhar. A ordenação
     padrão é por margem, e num setor em que a margem sai de uma medida só o resultado é um
     punhado de valores repetidos dezenas de vezes: a tabela ordenada tem cara de ranking e não
     é — dentro do empate a ordem é a do arquivo. Com filtro, a medida é refeita sobre o que ficou
     visível, porque o aviso tem de falar da tabela que está na tela. */
  const linhasTab = visiveis.map(c => Object.assign({
    _margem: c.nota_fisica ? c.nota_fisica.margem : null,
    _duelo: c.nota_duelo ? c.nota_duelo.percentil_medio : null,
    _estilo: c.nota_estilo ? c.nota_estilo.percentil_medio : null,
    _classe: c.confianca && c.confianca.barrado_do_ranking ? 'fraco' : '',
    _dica: c.confianca && c.confianca.barrado_do_ranking
      ? 'fora do ranking: só ' + c.confianca.sc_n + ' partidas com dado físico (sc_n)'
      : '',
  }, c));

  const margens = linhasTab.map(l => l._margem).filter(v => v !== null && v !== undefined);
  const vezes = {};
  margens.forEach(v => { vezes[v] = (vezes[v] || 0) + 1; });
  const distintas = Object.keys(vezes);
  const maiorEmpate = distintas.sort((a, b) => vezes[b] - vezes[a])[0];
  const emEmpate = margens.filter(v => vezes[v] > 1).length;
  const indsNoBloco = [];
  visiveis.forEach(c => {
    const n = c.nota_fisica ? c.nota_fisica.indicadores_no_bloco : null;
    if (n !== null && n !== undefined && indsNoBloco.indexOf(n) < 0) indsNoBloco.push(n);
  });

  /* O tom do aviso é proporcional ao que foi medido: onde o empate é maioria, a ordenação é ruído
     com cara de ranking; onde não é, ela ainda tem trechos em que a posição não quer dizer nada. */
  const empateEhMaioria = emEmpate * 2 > margens.length;
  const avisoEmpate = (maiorEmpate !== undefined && vezes[maiorEmpate] > 1)
    ? '<p class="pt-nota" style="margin-top:0">' +
      (empateEhMaioria
        ? '<b style="color:var(--coral)">Esta tabela abre ordenada pela nota física, e a ordem engana: a maior ' +
          'parte das linhas está empatada.</b> '
        : '<b>Esta tabela abre ordenada pela nota física, e parte dessa ordem é empate.</b> ') +
      (escondidos ? 'Contando só as linhas visíveis com os filtros (' + ptInt(escondidos) + ' escondidas): ' : '') +
      ptInt(margens.length) + ' candidatos ' + (escondidos ? 'visíveis' : 'deste setor') + ' têm nota física, e entre eles há <b>' +
      ptInt(distintas.length) + '</b> ' +
      (distintas.length === 1 ? 'nota diferente' : 'notas diferentes') + ': <b>' + ptInt(emEmpate) +
      '</b> ' + (emEmpate === 1 ? 'tem' : 'têm') + ' uma nota repetida, e o maior empate sozinho ' +
      'junta <b>' + ptInt(vezes[maiorEmpate]) + '</b> atletas com exatamente a mesma nota' +
      ptTecnico('margem ' + ptNum(Number(maiorEmpate), 3)) + '. ' +
      (indsNoBloco.length === 1
        ? 'A nota física deste setor sai de <b>' + ptInt(indsNoBloco[0]) + '</b> ' +
          (indsNoBloco[0] === 1 ? 'medida' : 'medidas') + ', e é daí que vem o pouco que ela consegue ' +
          'diferenciar um atleta do outro. '
        : indsNoBloco.length
          ? 'A nota física deste setor sai de ' + esc(indsNoBloco.map(n => ptInt(n)).join(' ou ')) + ' medidas, ' +
            'dependendo do atleta, e é daí que vem o número de notas diferentes possíveis. '
          : ptFalta('o estudo não diz quantas medidas entram na nota física deste setor') + '. ') +
      'Dentro de um empate, a posição na tabela não quer dizer nada: não é critério de desempate, é a ordem ' +
      'em que os nomes chegaram no arquivo.</p>'
    : (visiveis.length && margens.length
        ? '<p class="pt-nota" style="margin-top:0">Entre as ' + ptInt(margens.length) + ' notas físicas ' +
          (escondidos ? 'visíveis' : 'deste setor') + ', nenhuma se repete.</p>'
        : '');

  const idTab = ptId('13-cand-tab-' + setor);
  const bloco = (campo, nomeBloco, l) => {
    const b = l[campo] || {};
    if (b.percentil_medio === null || b.percentil_medio === undefined) {
      return pcTdTxt(ptFalta('nenhuma das ' + ptInt(b.indicadores_no_bloco) + ' medidas de ' + nomeBloco + ' tinha dado'));
    }
    return pcTdTxt(ptNum(b.percentil_medio, 0) + '<small style="display:block;color:var(--tinta3)">' +
      pcDeMedidas(b.indicadores_usados, b.indicadores_no_bloco) + '</small>');
  };
  const tab = pcRolaVertical(ptTabela({
    id: idTab,
    ordem: pcOrdemGuardada(idTab, { col: '_margem', dir: 'desc' }),
    vazio: escondidos
      ? 'nenhum candidato deste setor passa nos filtros escolhidos — os ' + ptInt(escondidos) + ' estão escondidos'
      : 'nenhum candidato neste setor',
    colunas: [
      { k: 'nome', rot: 'atleta', tipo: 'texto',
        fmt: (v, l) => '<b>' + esc(v) + '</b><small style="display:block;color:var(--tinta3)">' +
          esc(l.clube) + ' · ' + esc(l.pos) + '</small>' },
      { k: 'liga', rot: 'liga', tipo: 'texto' },
      { k: 'idade', rot: 'idade', casas: 0 },
      { k: 'min', rot: 'minutos', casas: 0 },
      { k: '_margem', rot: 'nota física',
        dica: 'o quanto o atleta está mais perto do perfil físico de ' + ptFxRot('sobe') + ' do que do perfil de ' +
          ptFxRot('cai') + ', dentro do setor',
        cel: (v, l) => {
          const nf = l.nota_fisica || {};
          if (v === null || v === undefined) {
            return pcTdTxt(ptFalta(nf.criterio
              ? 'sem base para pontuar o físico: ' + nf.criterio
              : 'sem nota física e sem motivo declarado no dado'));
          }
          return pcTdTxt('<b>' + ptNum(v, 3) + '</b> <span class="pt-n">' + ptInt(l.sc_n) + ' partidas com dado físico</span>' +
            '<small style="display:block;color:var(--tinta3)">' + pcDeMedidas(nf.indicadores_usados, nf.indicadores_no_bloco) +
            '</small>');
        } },
      { k: '_duelo', rot: 'duelo (posição no ranking)', cel: (v, l) => bloco('nota_duelo', 'duelo', l) },
      { k: '_estilo', rot: 'estilo (posição no ranking)',
        dica: 'este número mede, em boa parte, o time anterior do atleta',
        cel: (v, l) => bloco('nota_estilo', 'estilo', l) },
      { k: 'ctc', rot: 'confiança na data do contrato', tipo: 'texto',
        fmt: (v, l) => esc(v) + ' <span class="pt-n">' + ptInt(l.ctf) + ' fontes</span>' },
      { k: 'mv', rot: 'valor de mercado e salário',
        dica: 'ordena pelo valor de mercado',
        cel: (v, l) => pcTdTxt((v ? ptEur(v) : ptFalta('sem valor de mercado na base')) +
          '<small style="display:block;color:var(--tinta3)">' +
          (l.sal ? 'salário ' + esc(l.sal) : ptFalta('sem faixa salarial na base')) + '</small>') },
    ],
    linhas: linhasTab,
  }));

  return ptCard('Candidatos · ' + nomeSetor,
    (escondidos
      ? '<b>' + ptInt(visiveis.length) + '</b> de ' + ptInt(doSetor.length) + ' candidatos deste setor visíveis · ' +
        ptInt(escondidos) + ' escondidos pelos filtros'
      : ptInt(doSetor.length) + ' candidatos neste setor · nenhum escondido pelos filtros'),
    avisoEmpate + tab,
    (semNotaFisica.length
      ? '<b>' + ptInt(semNotaFisica.length) + '</b> atletas ' + (escondidos ? 'visíveis ' : '') + 'deste setor ficam sem ' +
        'nota física mesmo estando na lista, e a coluna escreve o motivo de cada um. '
      : '') +
    (visiveis.length
      ? 'Como a nota física foi montada ' + (escondidos ? 'nos atletas visíveis' : 'neste setor') + ': ' +
        Object.keys(criterios).map(k => ptInt(criterios[k]) + ' atletas — ' + criterioSimples(k)).join('; ') + '.'
      : ''));
}

/* A trilha do goleiro é o bloco mais fácil de ler errado da aba inteira, e o motivo é que
   nela convivem DUAS listas com o mesmo nome de "goleiro": os que sobreviveram ao funil da
   etapa 12 e entraram no pool operacional, e os que a trilha técnica desenha na tabela. As
   duas contagens estão no JSON, nenhuma das duas é errada, e a tela precisa reconciliá-las
   antes de desenhar qualquer coisa.

   A reconciliação é MEDIDA sobre a tabela inteira (nome e clube dos goleiros contra os
   candidatos do pool da etapa 13). O filtro esconde linhas da tabela; as contagens que falam
   da tabela na tela são refeitas sobre o visível, e as que falam da lista inteira dizem isso. */
function pcEt13Goleiro(gk, d, f, usaNac) {
  const inds = gk.indicadores || [];
  const cands = gk.candidatos || [];
  const visiveis = cands.filter(c => pcPassaFiltro(c, f, usaNac));
  const escondidos = cands.length - visiveis.length;
  const cat = pcCatalogo();

  /* O lado bom de um indicador mora no `sinal` do catálogo da etapa 2. A tela procura lá em
     vez de declarar direção: em saídas do goleiro ou em jogos sem sofrer gol, "mais" pode ser
     virtude do goleiro ou sintoma do time que joga na frente dele. Sem sinal no catálogo vai 0,
     que é o valor com que `ptCel` escreve "sem lado bom declarado" no `title`. */
  const pcSinal = k => (cat[k] && cat[k].sinal !== null && cat[k].sinal !== undefined) ? cat[k].sinal : 0;
  const semSinal = inds.filter(k => pcSinal(k) === 0);

  const noPool = gk.no_pool_operacional;
  const poolGeral = (d && d.candidatos) || [];
  const chaveAtleta = c => String(c.nome) + ' · ' + String(c.clube);
  const dentroDoPool = {};
  poolGeral.forEach(c => { dentroDoPool[chaveAtleta(c)] = true; });
  const tambemNoPool = cands.filter(c => dentroDoPool[chaveAtleta(c)]);
  const foraDoPool = cands.length - tambemNoPool.length;

  const semFisicoLigas = pcLigasSemFisico();
  const porLigaSemBase = {};
  visiveis.forEach(c => {
    if (semFisicoLigas.indexOf(c.liga) >= 0) porLigaSemBase[c.liga] = (porLigaSemBase[c.liga] || 0) + 1;
  });
  const ligasSemBase = Object.keys(porLigaSemBase).sort((a, b) => porLigaSemBase[b] - porLigaSemBase[a]);
  const nSemBase = ligasSemBase.reduce((s, k) => s + porLigaSemBase[k], 0);
  const nSemBaseNoPool = poolGeral.filter(c => semFisicoLigas.indexOf(c.liga) >= 0).length;

  const linhas = visiveis.map(c => {
    const l = { nome: c.nome, clube: c.clube, liga: c.liga, idade: c.idade, min: c.min, ctc: c.ctc, mv: c.mv,
      _com: c.indicadores_com_dado };
    inds.forEach(k => {
      const p = (c.percentis || {})[k];
      l['pc_' + k] = p ? p.percentil : null;
      l['n_' + k] = p ? p.n_na_coorte : null;
    });
    return l;
  });
  const colunas = [
    { k: 'nome', rot: 'goleiro', tipo: 'texto',
      fmt: (v, l) => '<b>' + esc(v) + '</b><small style="display:block;color:var(--tinta3)">' + esc(l.clube) + '</small>' },
    { k: 'liga', rot: 'liga', tipo: 'texto' },
    { k: 'idade', rot: 'idade', casas: 0 },
    { k: 'min', rot: 'minutos', casas: 0 },
  ].concat(inds.map(k => ({
    k: 'pc_' + k, rot: ptNomeCurto(k), tipo: 'num', dica: ptNomeMedida(k) + ' · ' + ptDicaMedida(k),
    cel: (v, l) => ptCel(v, {
      n: l['n_' + k], unidade: 'goleiros na comparação', sinal: pcSinal(k),
      motivo: 'este goleiro não tem posição no ranking para ' + ptNomeMedida(k),
    }),
  }))).concat([
    { k: 'ctc', rot: 'confiança na data do contrato', tipo: 'texto' },
    { k: 'mv', rot: 'valor', fmt: v => v ? ptEur(v) : ptFalta('sem valor de mercado na base') },
  ]);

  const qtd = (v, motivo) => (v === null || v === undefined) ? ptFalta(motivo) : ptInt(v);
  const plural = (v, um, muitos) => (v === 1 ? um : muitos);
  const semNoPool = 'o estudo não trouxe quantos goleiros há na lista final';
  const semZD = 'o estudo não trouxe quantos zagueiros pela direita há na lista final';
  const idTab = ptId('13-gk');

  return ptCard('O goleiro sai da nota por regra, e a regra está escrita',
    (escondidos
      ? '<b>' + ptInt(visiveis.length) + '</b> de ' + ptInt(cands.length) + ' goleiros desta tabela visíveis · ' +
        ptInt(escondidos) + ' escondidos pelos filtros'
      : ptInt(cands.length) + ' goleiros nesta tabela') + ' · ' +
      qtd(noPool, semNoPool) + ' na lista final · ' +
      qtd(gk.referencia_ZD_no_pool, semZD) + ' zagueiros pela direita na mesma lista',
    '<p class="pt-nota" style="margin-top:0"><b>' + esc(gk.motivo_fora_da_esteira) + '</b></p>' +

    /* O parágrafo que reconcilia as duas contagens vem ANTES da tabela: depois dela já é tarde,
       a pessoa já contou as linhas e já concluiu que o subtítulo está errado. */
    '<p class="pt-nota"><b>Aqui convivem duas contagens, e não são a mesma lista.</b> ' +
      'A lista final — o que sobrou do funil da etapa 12 — tem ' +
      qtd(noPool, semNoPool) + ' ' + plural(noPool, 'goleiro', 'goleiros') +
      ', contra ' + qtd(gk.referencia_ZD_no_pool, semZD) +
      ' zagueiros pela direita. A tabela abaixo tem <b>' + ptInt(cands.length) + '</b> linhas na lista inteira, porque a ' +
      'avaliação técnica do goleiro usa uma lista própria. Cruzando nome e clube na tabela inteira, <b>' + ptInt(tambemNoPool.length) +
      '</b> ' + plural(tambemNoPool.length, 'goleiro dela está', 'goleiros dela estão') +
      ' entre os ' + ptInt(poolGeral.length) + ' candidatos da lista final; ' +
      (foraDoPool ? 'os outros <b>' + ptInt(foraDoPool) + '</b> não estão' : 'nenhum fica de fora') + '. ' +
      ptFalta('o estudo não diz que corte monta esta lista de goleiros: ele traz a lista pronta, ' +
        'sem a regra que a separa da lista final') + '. ' +
      'Lida sozinha, esta tabela parece um ranking de ' +
      ptInt(cands.length) + ' contratáveis, e a lista final diz que não é.' +
      (usaNac ? '' : ' ' + ptFalta('o filtro de nacionalidade não se aplica a esta tabela: a lista do goleiro não traz nacionalidade e passaporte')) +
      '</p>' +

    (nSemBase
      ? '<p class="pt-nota"><b style="color:var(--coral)">' + ptInt(nSemBase) + ' das ' + ptInt(visiveis.length) +
        ' linhas ' + (escondidos ? 'visíveis ' : '') + 'desta tabela vêm de ligas sem dado físico, segundo a etapa 12</b> (' +
        ligasSemBase.map(k => esc(k) + ' ' + ptInt(porLigaSemBase[k])).join(' · ') + '). ' +
        'Na lista final, ' + ptInt(nSemBaseNoPool) + ' dos ' + ptInt(poolGeral.length) +
        ' candidatos vêm dessas ligas' + (nSemBaseNoPool === 0 ? ', porque elas saíram antes, no funil' : '') +
        '. A lista do goleiro não passou por esse mesmo filtro, e como ela é só técnica a falta de dado ' +
        'físico não aparece como buraco em nenhuma célula — por isso ela é dita aqui, em número.</p>'
      : '<p class="pt-nota">Nenhuma das linhas ' + (escondidos ? 'visíveis ' : '') + 'desta tabela vem das ' +
        ptInt(semFisicoLigas.length) + ' ligas sem dado físico da etapa 12.</p>') +

    pcRolaVertical(ptTabela({
      id: idTab,
      ordem: pcOrdemGuardada(idTab, null),
      vazio: escondidos
        ? 'nenhum goleiro passa nos filtros escolhidos — os ' + ptInt(escondidos) + ' estão escondidos'
        : 'nenhum goleiro na trilha técnica',
      colunas: colunas,
      linhas: linhas,
    })) +

    '<p class="pt-nota" style="font-size:11.5px">' +
      (semSinal.length === inds.length
        ? 'O estudo não diz qual é o lado bom de nenhuma das ' + ptInt(inds.length) + ' medidas desta tabela: ' +
          'nenhuma delas está entre as ' + ptInt(Object.keys(cat).length) + ' do catálogo da etapa 2, que é ' +
          'onde isso fica registrado. A cor das células mostra só a posição no ranking, e passando o mouse cada ' +
          'uma avisa “sem lado bom declarado” — dizer aqui que “mais é melhor” seria a tela decidindo o que o ' +
          'estudo não decidiu.'
        : ptInt(semSinal.length) + ' das ' + ptInt(inds.length) + ' medidas desta tabela não têm lado bom ' +
          'registrado no catálogo da etapa 2 (' + esc(semSinal.map(ptNomeMedida).join(' · ')) + '): nessas colunas a cor é só a ' +
          'posição no ranking, e passando o mouse a célula diz “sem lado bom declarado”.') +
      '</p>',

    'Não é questão de gosto: a nota principal mede a distância até um perfil físico, e o perfil físico do ' +
    'goleiro não existe nesta base. O que sobra é a posição no ranking técnico dentro de um grupo pequeno de ' +
    'goleiros — passando o mouse, cada célula diz quantos goleiros entraram na comparação. Na lista final, com ' +
    qtd(noPool, semNoPool) + ' ' + plural(noPool, 'goleiro', 'goleiros') +
    ' contra ' + qtd(gk.referencia_ZD_no_pool, semZD) + ' zagueiros, ' +
    '“o melhor goleiro disponível” é o melhor de ' + qtd(noPool, semNoPool) +
    ' — e a tabela acima, com ' + ptInt(cands.length) + ' linhas, é outra lista, não a lista final.');
}

/* ================================================================================
   ETAPA 14 — ELENCO COMO FAIXA
   ================================================================================

   Faixa, nunca time. Um XI único calibrado em dezesseis clube-temporada seria precisão
   falsa, e por isso o que a tela entrega por vaga é frequência nas réplicas: recomendação
   quem aparece em mais da metade delas, alternativa quem aparece entre um décimo e a metade.

   Vaga sem recomendação acontece, e significa que nenhum nome passou da metade. A tela
   escreve isso — escolher o primeiro das alternativas seria inventar a decisão que o dado
   se recusou a tomar.

   Desde 14/09 as seis propostas aparecem empilhadas, sem clique; ao lado da tabela de vagas
   de cada uma vai o resultado do teste da nota (a nota não previu quem rendeu depois de
   chegar: lista para observar); e os nomes têm filtro de liga, idade e nacionalidade, que só
   esconde nomes e não refaz a proposta.

   Ao pé de cada proposta, os dois controles: o contrafactual do dinheiro (quanto custa o
   elenco proposto e que taxa histórica de subida tem o quartil onde ele cai) e a baseline. */

/* A ficha de um nome da proposta (liga, idade e, quando houver, nacionalidade) mora no
   candidato da etapa 13. A ligação é pelo código do atleta quando o gerador o gravar dos dois
   lados; enquanto não grava, é pelo texto "nome (clube)" da própria lista de candidatos do mesmo
   arquivo. Texto que não casa, ou que casa com mais de uma ficha, fica sem ficha: o filtro não se
   aplica a ele e a contagem diz quantos são — um nome não pode sumir por uma ligação duvidosa. */
function pcCtx14(d) {
  const e13 = pcEtapa(13) || {};
  const cands = e13.candidatos || [];
  const porId = {}, porTexto = {}, repetidos = {};
  cands.forEach(c => {
    if (c.id !== undefined && c.id !== null) porId[String(c.id)] = c;
    const t = String(c.nome) + ' (' + String(c.clube) + ')';
    if (porTexto[t]) repetidos[t] = true; else porTexto[t] = c;
  });
  const ficha = x => {
    if (!x) return null;
    const item = typeof x === 'string' ? { nome: x } : x;
    if (item.id !== undefined && item.id !== null && porId[String(item.id)]) return porId[String(item.id)];
    const t = String(item.nome);
    return repetidos[t] ? null : (porTexto[t] || null);
  };
  const distintos = {};
  const props = d.propostas || {};
  Object.keys(props).forEach(k => ((props[k] || {}).vagas_detalhe || []).forEach(v => {
    (v.recomendacao || []).concat(v.alternativas || []).forEach(x => { distintos[String(x.nome)] = x; });
    if (v.primeiro_colocado) distintos[String(v.primeiro_colocado)] = { nome: v.primeiro_colocado, id: v.primeiro_colocado_id };
  }));
  const nomes = Object.keys(distintos);
  const regs = [], semFicha = [], ambiguos = [];
  let viaId = 0;
  nomes.forEach(n => {
    const x = distintos[n];
    const c = ficha(x);
    if (c) {
      regs.push(c);
      if (x.id !== undefined && x.id !== null && porId[String(x.id)]) viaId += 1;
    } else if (repetidos[n]) ambiguos.push(n);
    else semFicha.push(n);
  });
  return { ficha: ficha, nomes: nomes, regs: regs, semFicha: semFicha, ambiguos: ambiguos, viaId: viaId,
           nac: pcTemNac(cands) };
}

function pcAvisoBacktest14() {
  const e13 = pcEtapa(13);
  const bt = e13 ? e13.backtest : null;
  const link = ' <a href="#" class="pt-concl-link" data-pt-ir="13" data-pt-prefixo="' + esc(ptPrefixo()) +
    '">ver o teste na etapa 13</a>';
  if (!bt) {
    return '<p class="pt-nota">' + ptFalta('a etapa 13 não trouxe o teste da nota com quem já chegou: não há ' +
      'como dizer se nomes escolhidos por esta nota renderam depois de chegar') + '</p>';
  }
  const v = pcVereditoBacktest(bt);
  const tec = ptTecnico('etapa_13.backtest (nota × minutos e permanência) — não é a conferência de volta do ' +
    'elenco, que mede o perfil · minutos ' + ptP(bt.p_minutos) + ' · ficar no clube ' + ptP(bt.p_permanencia));
  return '<div class="pt-controle" style="border-left:3px solid ' + (v.separou ? 'var(--pt-ok)' : 'var(--coral)') +
    ';margin:10px 0">' +
    '<span class="pt-rot">antes de ler os nomes</span>' +
    '<p class="pt-nota" style="margin-top:5px;color:var(--tinta)">' +
    (v.separou
      ? '<b>Lista para observar.</b> No teste com quem já tinha chegado a clubes da Série B, a nota separou ' +
        (v.sepMinutos ? 'os minutos jogados (' + ptSorte(bt.p_minutos) + ')' : '') +
        (v.sepMinutos && v.sepPermanencia ? ' e ' : '') +
        (v.sepPermanencia ? 'quem ficou no clube (' + ptSorte(bt.p_permanencia) + ')' : '') +
        '. Mas o teste mede o que aconteceu com o atleta, não se o clube subiu: nome aqui é ponto de partida ' +
        'para olhar, não contratação.'
      : '<b>Lista para observar, não recomendação.</b> Estes nomes saem da nota de encaixe, e a nota, testada ' +
        'com quem já tinha chegado a clubes da Série B, não separou quem rendeu depois de chegar: nos minutos ' +
        'jogados, ' + ptSorte(bt.p_minutos) + '; em ficar no clube no ano seguinte, ' + ptSorte(bt.p_permanencia) + '.') +
    tec + link + '</p></div>';
}

function ptEtapa14(alvo, d) {
  const props = d.propostas || {};
  const chaves = Object.keys(props);
  if (!chaves.length) {
    alvo.innerHTML = ptFaltaBloco('O estudo não trouxe nenhuma proposta de elenco',
      'as propostas chegaram vazias. Sem elas não há o que propor, e a tela não monta elenco por conta própria.');
    return;
  }

  const grade = d.grade || [];
  const taxa = d.taxa_de_subida_por_quartil_pct || {};
  const j = d.justificativa_no_dado || null;

  /* A grade soma um número e toda proposta entrega outro, e a subtração nunca esteve na tela.
     A conta é feita aqui e a caixa que sobra é marcada como não preenchível — e descobrir QUAL
     caixa sobra também é leitura: é a posição da grade que não aparece em `vagas_detalhe` de
     nenhuma proposta. O motivo, quando existe, é o `sem_goleiro` do JSON. */
  const somaGrade = grade.reduce((s, g) => s + g[1], 0);
  const posNasPropostas = {};
  chaves.forEach(k => {
    ((props[k] || {}).vagas_detalhe || []).forEach(v => { posNasPropostas[v.vaga] = true; });
  });
  const naoPreenchiveis = grade.filter(g => !posNasPropostas[g[0]]);
  const vagasDeclaradas = [];
  chaves.forEach(k => {
    const v = (props[k] || {}).vagas;
    if (v !== null && v !== undefined && vagasDeclaradas.indexOf(v) < 0) vagasDeclaradas.push(v);
  });
  const somaNaoPreenchivel = naoPreenchiveis.reduce((s, g) => s + g[1], 0);
  const motivosSemGoleiro = [];
  chaves.forEach(k => {
    const s = (props[k] || {}).sem_goleiro;
    if (s && motivosSemGoleiro.indexOf(s) < 0) motivosSemGoleiro.push(s);
  });
  const gradeDivergeDasPropostas = vagasDeclaradas.length === 1 && vagasDeclaradas[0] !== somaGrade;

  const cabeca = ptCard('A forma do elenco, e por que ela é uma aposta declarada',
    (d.forma ? esc(d.forma) : 'forma não declarada no dado') + ' · ' +
      ptInt(somaGrade) + ' vagas no desenho' +
      (gradeDivergeDasPropostas ? ' · ' + ptInt(vagasDeclaradas[0]) + ' preenchidas por proposta' : ''),
    pcGrade(140, grade.map(g => {
      const fora = !posNasPropostas[g[0]];
      return fora
        ? '<div style="opacity:.62">' +
            pcNumeroSolto(g[0], ptInt(g[1]),
              '<b style="color:var(--coral)">não dá para preencher</b> — nenhuma proposta traz esta vaga') +
          '</div>'
        : pcNumeroSolto(g[0], ptInt(g[1]), g[1] === 1 ? 'vaga' : 'vagas');
    }).join('')) +
    (naoPreenchiveis.length
      ? '<p class="pt-nota"><b>O desenho tem ' + ptInt(somaGrade) + ' vagas e cada proposta preenche ' +
        (vagasDeclaradas.length === 1
          ? ptInt(vagasDeclaradas[0])
          : vagasDeclaradas.length
            ? esc(vagasDeclaradas.map(v => ptInt(v)).join(' ou '))
            : ptFalta('nenhuma proposta diz quantas vagas preenche')) +
        '.</b> A diferença é ' + esc(naoPreenchiveis.map(g => g[0]).join(' · ')) + ': ' + ptInt(somaNaoPreenchivel) +
        (somaNaoPreenchivel === 1 ? ' vaga que nenhuma' : ' vagas que nenhuma') +
        ' das ' + ptInt(chaves.length) + ' propostas traz. ' +
        (motivosSemGoleiro.length
          ? 'O estudo dá o motivo em todas: ' +
            motivosSemGoleiro.map(s => '“' + esc(s) + '”').join('; ') + '. A avaliação dessa posição está na ' +
            'etapa 13, separada, e é só técnica.'
          : ptFalta('as propostas não dizem por que estas vagas ficam de fora') + '.') + '</p>'
      : '') +
    (j
      ? '<p class="pt-nota">Quem subiu usou em média <b>' + ptNum(j.atletas_usados_sobe, 1) + '</b> atletas na ' +
        'temporada, contra <b>' + ptNum(j.atletas_usados_cai, 1) + '</b> de quem caiu, e concentrou <b>' +
        ptPct(j.share_11_sobe) + '</b> dos minutos no time-base mais usado, contra <b>' + ptPct(j.share_11_cai) +
        '</b>. É daí que sai a ideia do núcleo enxuto — e a ressalva é do tamanho da ideia: essa medida ' +
        '<b>' + pcPorta(j.porta) + '</b>' +
        (j.aviso ? ', ou seja, <b>' + esc(j.aviso) + '</b>' : '') + '.</p>'
      : ptFalta('a justificativa da forma não veio no dado')),
    'Núcleo enxuto é decisão de projeto apoiada numa medida que não se repete de um ano para o outro. Fica ' +
    'na tela como aposta, com nome de aposta.');

  /* A faixa de orçamento pelo número do quartil, do maior (mais caro) para o menor — a ordem
     sai da chave, e o ordinal da posição na lista, sem nenhum rótulo digitado por faixa. */
  const quartis = Object.keys(taxa).sort((a, b) => Number(b) - Number(a));
  const nomeFaixa = i => i === 0 ? 'a faixa mais cara'
    : i === quartis.length - 1 ? 'a faixa mais barata'
    : 'a ' + ptInt(i + 1) + 'ª mais cara';
  const cardTaxa = ptCard('A régua do dinheiro, que todo elenco proposto vai ter de enfrentar',
    'quantos subiram, na história da Série B, em cada faixa de orçamento',
    pcGrade(130, quartis.map((q, i) =>
      pcNumeroSolto(nomeFaixa(i), ptPct(taxa[q]),
        'subiram' + ptTecnico(q + 'º quartil de valor do elenco'))).join('')),
    'Estes números são a comparação que toda proposta precisa enfrentar: montar um elenco que cai na faixa ' +
    'mais barata é aceitar a chance histórica de subida daquela faixa. A proposta pode ser boa mesmo assim ' +
    '— mas precisa saber contra o que está jogando.');

  const saltos = pcSaltos('ir para a proposta:', chaves.map(k => {
    const partes = k.split('__');
    return { id: ptId('14-prop-' + k), rot: '<b>' + esc(pcNomeCenario(partes[0])) + '</b> <span class="pt-chip-n">' +
      esc(pcNomeEscopo(partes[1] || '')) + '</span>' };
  }));

  const c14 = pcCtx14(d);
  const ctx = {
    chave: '14',
    titulo: 'filtrar os nomes das propostas',
    listas: [{ nome: 'nomes diferentes nas propostas', regs: c14.regs, nac: c14.nac }],
  };
  ctx.conta = () => {
    const f = pcFiltro('14');
    const vis = c14.regs.filter(r => pcPassaFiltro(r, f, c14.nac.ok)).length;
    const fora = c14.regs.length - vis;
    return 'Visíveis com os filtros: <b>' + ptInt(vis + c14.semFicha.length + c14.ambiguos.length) + '</b> de ' +
      ptInt(c14.nomes.length) + ' nomes diferentes que aparecem nas propostas' +
      (fora ? ' — ' + ptInt(fora) + ' escondidos.' : ' — nenhum escondido.') +
      ' <b>O filtro só esconde nomes: não refaz a proposta.</b> “Candidatos para a vaga” e “em quantas das vezes” ' +
      'continuam sendo os da conta feita com a lista inteira; para ver uma proposta montada só com outro recorte, é ' +
      'o gerador que tem de rodar com esse recorte. ' +
      'A liga e a idade de cada nome vêm da ficha dele na lista de candidatos da etapa 13, ' +
      (c14.viaId ? 'pelo código do atleta em ' + ptInt(c14.viaId) + ' nomes e ' : '') +
      'pelo texto “nome (clube)”' + (c14.viaId ? ' nos outros' : '') + ': ' + ptInt(c14.regs.length) + ' de ' +
      ptInt(c14.nomes.length) + ' casaram' +
      (c14.semFicha.length ? ', ' + ptInt(c14.semFicha.length) + ' sem ficha (aparecem sempre, o filtro não se aplica)' : '') +
      (c14.ambiguos.length ? ', ' + ptInt(c14.ambiguos.length) + ' com mais de uma ficha (aparecem sempre)' : '') + '.' +
      (c14.viaId < c14.regs.length ? ptTecnico('ligação por texto dentro do mesmo arquivo; quando o gerador gravar o código do atleta nos dois lados, ela passa a ser por ele') : '') +
      pcContaExtras(ctx);
  };

  alvo.innerHTML = cabeca + cardTaxa +
    '<div style="margin-top:16px"><span class="pt-rot">as ' + ptInt(chaves.length) +
      ' propostas, todas abertas — o cenário, e onde se procura</span>' + saltos + '</div>' +
    pcFiltrosHtml(ctx) +
    '<div data-pc-area="14"></div>';

  const area = alvo.querySelector('[data-pc-area="14"]');
  pcLigarFiltros(alvo, ctx, () => {
    const f = pcFiltro('14');
    area.innerHTML = chaves.map(k => '<div id="' + esc(ptId('14-prop-' + k)) + '">' +
      (props[k] ? pcEt14Proposta(props[k], k, f, c14) : ptFalta('a proposta ' + k + ' está vazia no dado')) +
      '</div>').join('');
    ptLigarTabelas(area);
  });
  pcLigarSaltos(alvo);
  ptLigarTabelas(alvo);
}

function pcEt14Proposta(p, chave, f, c14) {
  if (p.possivel === false) {
    return ptFaltaBloco('Esta proposta não foi possível',
      'o estudo marcou esta proposta (' + chave + ') como impossível. Ela continua na tela: é informação ' +
      'sobre o mercado, não sobre o método.');
  }
  const vagas = p.vagas_detalhe || [];
  const semRecomendacao = vagas.filter(v => !v.recomendacao || !v.recomendacao.length);
  const semNenhumNome = vagas.filter(v => (!v.recomendacao || !v.recomendacao.length) &&
    (!v.alternativas || !v.alternativas.length));
  const denomMin = vagas.length ? pcMin(vagas.map(v => v.denominador)) : null;
  const refeitas = p.replicas;

  /* O filtro age nome a nome. O que ele esconde é contado e escrito na célula — uma vaga que
     "perdeu" a recomendação por causa do filtro não pode parecer vaga sem recomendação. */
  const passa = x => { const c = c14.ficha(x); return !c || pcPassaFiltro(c, f, c14.nac.ok); };
  let nomesTotal = 0, nomesFora = 0;
  const separa = lista => {
    const vis = [], fora = [];
    (lista || []).forEach(x => { (passa(x) ? vis : fora).push(x); });
    nomesTotal += (lista || []).length;
    nomesFora += fora.length;
    return { vis: vis, fora: fora };
  };
  const nomes = lista => (lista || []).map(x =>
    '<span style="display:block">' + esc(x.nome) + ' <span class="pt-n">em ' + ptPct(x.freq_pct) +
    ' das vezes</span></span>').join('');
  const escondidosTxt = n => n ? '<small style="display:block;color:var(--tinta3)">' + ptInt(n) + ' ' +
    (n === 1 ? 'nome escondido' : 'nomes escondidos') + ' pelos filtros</small>' : '';

  const linhas = vagas.map(v => {
    const r = separa(v.recomendacao), a = separa(v.alternativas);
    const primeiroFora = v.primeiro_colocado ? !passa(v.primeiro_colocado) : false;
    return Object.assign({ _rec: r, _alt: a, _primeiroFora: primeiroFora }, v);
  });

  const idTab = ptId('14-vagas-' + chave);
  const tab = ptTabela({
    id: idTab,
    ordem: pcOrdemGuardada(idTab, null),
    vazio: 'esta proposta não trouxe o detalhe de cada vaga',
    colunas: [
      { k: 'vaga', rot: 'vaga', tipo: 'texto' },
      { k: 'denominador', rot: 'candidatos para a vaga', casas: 0,
        dica: 'quantos nomes disputavam esta vaga, na lista inteira — vaga com poucos candidatos produz recomendação que é quase sorteio' },
      { k: '_rec', rot: 'recomendação (aparece em mais da metade das vezes)', tipo: 'texto', ordenavel: false,
        motivoFixa: 'nomes não se ordenam por número',
        fmt: (v, l) => {
          if (!l.recomendacao || !l.recomendacao.length) {
            return ptFalta('nenhum nome apareceu em mais da metade das vezes nesta vaga — a escolha ficou dentro do ruído');
          }
          if (!v.vis.length) {
            return '<span style="color:var(--tinta3)">' + (v.fora.length === 1 ? 'o nome recomendado' : 'os nomes recomendados') +
              ' nesta vaga ' + (v.fora.length === 1 ? 'está escondido' : 'estão escondidos') + ' pelos filtros</span>';
          }
          return nomes(v.vis) + escondidosTxt(v.fora.length);
        } },
      { k: '_alt', rot: 'alternativas equivalentes', tipo: 'texto', ordenavel: false,
        motivoFixa: 'nomes não se ordenam por número',
        fmt: (v, l) => {
          if (l.alternativas && l.alternativas.length) {
            return v.vis.length ? nomes(v.vis) + escondidosTxt(v.fora.length)
              : '<span style="color:var(--tinta3)">' + ptInt(v.fora.length) + ' ' +
                (v.fora.length === 1 ? 'alternativa escondida' : 'alternativas escondidas') + ' pelos filtros</span>';
          }
          /* Vaga sem nome nenhum. O registro traz o espalhamento (quantos candidatos apareceram
             em alguma rodada e quem apareceu mais) — é isso que a célula escreve, e não "vazio". */
          if (l.candidatos_com_alguma_replica !== undefined || l.primeiro_colocado) {
            return '<b style="color:var(--coral)">vaga sem nome</b>: nenhum candidato chegou nem à faixa de ' +
              'alternativa' +
              (l.candidatos_com_alguma_replica !== undefined
                ? '; a escolha se espalhou entre ' + ptInt(l.candidatos_com_alguma_replica) + ' candidatos' : '') +
              (l.primeiro_colocado
                ? (l._primeiroFora
                    ? ', e o que mais apareceu está escondido pelos filtros (apareceu em ' + ptPct(l.freq_pct_do_primeiro) + ' das vezes)'
                    : ', e o que mais apareceu — ' + esc(l.primeiro_colocado) + ' — apareceu em ' +
                      ptPct(l.freq_pct_do_primeiro) + ' das vezes')
                : '') + '.' +
              (l.motivo ? ptTecnico(esc(l.motivo)) : '');
          }
          return ptFalta('nenhum nome chegou à faixa de alternativa nesta vaga');
        } },
    ],
    linhas: linhas,
  });

  const vv = p.validacao_de_volta || null;
  const prox = vv ? { sobe: vv.prox_sobe, caro: vv.prox_caro, barato: vv.prox_barato, cai: vv.prox_cai } : null;
  /* A validação de volta: qual vetor o elenco proposto ficou mais perto, comparado ao que o
     cenário pediu. É o PERFIL do elenco — não confundir com o teste da nota (backtest), que vai
     no aviso ao lado dos nomes. */
  const alvoChave = String(p.alvo || '').replace('margem_', '');
  let vereditoVolta = '';
  let ordenados = [];
  if (prox) {
    ordenados = Object.keys(prox).filter(k => prox[k] !== null && prox[k] !== undefined)
      .sort((a, b) => prox[b] - prox[a]);
    const topo = ordenados[0], ultimo = ordenados[ordenados.length - 1];
    vereditoVolta = topo
      ? (topo === alvoChave
          ? 'O elenco proposto se parece mais com ' + pcGrupo(topo) + ' (o alvo)'
          : 'O elenco proposto se parece mais com ' + pcGrupo(topo) + ' do que com o alvo do cenário (' +
            pcGrupo(alvoChave) + '): o alvo não foi alcançado')
        + (ultimo && ultimo !== topo ? ', e menos com ' + pcGrupo(ultimo) : '') + '.' +
        ptTecnico('proximidade de 0 (nada parecido) a 1 (igual): ' +
          ordenados.map(k => pcGrupo(k) + ' ' + ptNum(prox[k], 2)).join(' · '))
      : '';
  }

  const r = p.restricoes || {};
  const inf = r.infracoes_nas_replicas || {};
  const folha = r.folha || null;
  /* A restrição dos veteranos saiu de `restricoes` e foi para `nao_implementadas`: o método
     otimiza célula a célula e uma exigência de CONJUNTO não se impõe por penalidade. A tela lê
     onde o valor está e diz o que ele é: um pedido da especificação que o método não cumpre. */
  const naoImp = r.nao_implementadas || {};
  const vet = naoImp.minimo_de_veteranos_9v || null;
  const minVet = vet ? vet.valor_pedido_na_especificacao : r.minimo_com_1800_min;
  const violou = minVet !== undefined && minVet !== null &&
    r.com_1800_min_no_nucleo !== undefined && r.com_1800_min_no_nucleo < minVet;

  const quebradas = Object.keys(inf).filter(k => k !== 'replicas' && Number(inf[k]) > 0);
  const regraNome = k => String(k)
    .replace(/^idade_media_acima_do_teto$/, 'idade média acima do teto')
    .replace(/^liga_estrangeira_acima_de_(\d+)$/, 'mais de $1 jogadores da mesma liga estrangeira')
    .replace(/^menos_de_(\d+)_com_(\d+)_min$/, 'menos de $1 jogadores com $2 minutos ou mais')
    .replace(/_+/g, ' ');
  const frasesQuebra = quebradas.map(k => esc(regraNome(k)) + ' em ' + ptInt(inf[k]) + ' de ' + ptInt(inf.replicas));
  const formaTxt = !r.forma ? 'o estudo não diz como as regras entram na conta'
    : /penalidade/.test(String(r.forma)) && /não corte duro/.test(String(r.forma))
      ? 'as regras não barram um nome; tiram pontos de quem as quebra' + ptTecnico(esc(r.forma))
      : 'como as regras entram na conta: ' + esc(r.forma);
  const faixaSal = (n, u) => u === 'M' ? ptNum(Number(n), 1) + ' mi' : ptInt(Number(n)) + ' mil';
  const exFolha = folha && folha.motivo_banda ? /'([\d.]+)([MK])\s*-\s*([\d.]+)([MK])'/.exec(folha.motivo_banda) : null;
  const folhaTxt = !(folha && folha.motivo_banda) ? ''
    : /ponto médio/.test(folha.motivo_banda)
      ? 'o salário vem em faixa' + (exFolha ? ' (por exemplo, de ' + faixaSal(exFolha[1], exFolha[2]) + ' a ' +
          faixaSal(exFolha[3], exFolha[4]) + ')' : '') + '; a conta usa o meio da faixa, então é estimativa' +
        ptTecnico(esc(folha.motivo_banda))
      : esc(folha.motivo_banda);
  const tetoFolha = naoImp.teto_de_folha_9ii || null;
  const tetoMotivo = !tetoFolha ? ''
    : /não existe valor de teto declarado/.test(String(tetoFolha.motivo))
      ? 'não existe um teto de folha declarado no projeto, e o salário só vem em faixa para parte dos ' +
        'jogadores; qualquer teto aqui seria número inventado' + ptTecnico(esc(tetoFolha.motivo))
      : esc(tetoFolha.motivo);
  const tetoNoLugar = !tetoFolha ? ''
    : /ponto médio/.test(String(tetoFolha.o_que_existe))
      ? 'a soma do meio de cada faixa salarial, como estimativa' + ptTecnico(esc(tetoFolha.o_que_existe))
      : esc(tetoFolha.o_que_existe);

  const cardRestricoes = ptCard('As regras do elenco, e quantas vezes elas foram quebradas',
    formaTxt,
    pcGrade(160,
      pcNumeroSolto('idade média máxima', ptNum(r.teto_idade_media, 1),
        'o núcleo ficou em ' + ptNum(r.idade_media_do_nucleo, 1)) +
      pcNumeroSolto('máximo por liga estrangeira', ptInt(r.teto_por_liga_estrangeira), 'atletas da mesma liga') +
      pcNumeroSolto('mínimo de jogadores rodados',
        (minVet === undefined || minVet === null) ? ptFalta('sem mínimo declarado') : ptInt(minVet),
        (vet ? '<b>pedido pelo projeto, NÃO aplicado</b> · ' : '') +
          'o núcleo tem ' + ptInt(r.com_1800_min_no_nucleo) +
          (vet && vet.criterio ? ptTecnico(esc(vet.criterio)) : '')) +
      (folha
        ? pcNumeroSolto('folha estimada (pela faixa salarial)', ptEur(folha.soma_ponto_medio_eur),
            ptInt(folha.com_faixa_salarial) + ' de ' + ptInt(folha.de) + ' com faixa salarial')
        : '')) +
    '<div style="margin-top:11px"><span class="pt-rot">em quantas das ' + ptInt(inf.replicas) +
      ' vezes em que a conta foi refeita cada regra foi quebrada</span>' +
      Object.keys(inf).filter(k => k !== 'replicas').map(k =>
        ptBarra(inf[k], inf.replicas || 1, {
          rot: regraNome(k), dica: k, texto: ptInt(inf[k]) + ' de ' + ptInt(inf.replicas),
          cor: inf[k] > 0 ? 'baixo' : 'alto',
        })).join('') +
    '</div>',
    (violou
      ? '<b style="color:var(--coral)">O núcleo entregue fica abaixo do mínimo de jogadores rodados:</b> ' +
        ptInt(r.com_1800_min_no_nucleo) +
        (r.com_1800_min_no_nucleo === 1 ? ' atleta com muitos minutos contra ' : ' atletas com muitos minutos contra ') +
        (minVet === 1 ? 'o ' + ptInt(minVet) + ' pedido' : 'os ' + ptInt(minVet) + ' pedidos') +
        ', e ' + ptInt(inf.menos_de_5_com_1800_min) + ' das ' +
        ptInt(inf.replicas) + ' vezes em que a conta foi refeita também ficam abaixo. '
      : (r.com_1800_min_no_nucleo !== undefined && minVet !== undefined && minVet !== null
          ? 'O núcleo entregue cumpre o mínimo de jogadores rodados (' + ptInt(r.com_1800_min_no_nucleo) +
            ' contra ' + ptInt(minVet) + ' pedidos). '
          : '') +
        (quebradas.length
          ? '<b style="color:var(--coral)">Mas, nas vezes em que a conta foi refeita, regras foram quebradas:</b> ' +
            frasesQuebra.join('; ') + '. '
          : 'Nenhuma regra foi quebrada nas vezes em que a conta foi refeita. ')) +
    (vet
      ? 'A regra dos jogadores rodados está declarada como <b>NÃO aplicada</b>: o método escolhe um nome por ' +
        'vaga e não consegue impor uma exigência ao grupo inteiro. O que existe no lugar é uma penalidade na ' +
        'nota de quem tem poucos minutos' + ptTecnico(esc(vet.motivo) + ' · ' + esc(vet.efeito_no_custo)) + '. '
      : (violou ? 'A regra entra como penalidade na conta, não como proibição — então ela pode ser vencida ' +
          'pelo resto do problema, e foi. ' : '')) +
    (violou ? 'Elenco novo inteiro é risco de entrosamento que este dado não mede. ' : '') +
    (tetoFolha
      ? '<br>O teto de folha de salários também <b>não é aplicado</b>: ' + tetoMotivo + '. No lugar dele vai ' +
        tetoNoLugar + '.'
      : '') +
    (folhaTxt ? '<br>Sobre a folha: ' + folhaTxt + '.' : ''));

  const nomeProposta = pcNomeProposta(chave);

  const baseline = ptBaseline({
    rotulo: nomeProposta,
    auc: null,
    motivo: 'uma proposta de elenco não tem taxa de acerto para comparar com o dinheiro: ela é a melhor ' +
      'distribuição de nomes pelas vagas dentro das regras, refeita ' + ptInt(p.replicas) + ' vezes com as notas ' +
      'sorteadas de novo, e não uma previsão de quem sobe. O que a compara com o dinheiro é o quadro logo abaixo',
  });

  /* "top-N de valor" e "(n=N)" são jeito de planilha; o número continua saindo da frase do estudo. */
  const alvoTxt = s => String(s)
    .replace(/top-(\d+) de valor/g, 'entre os $1 elencos mais caros')
    .replace(/\s*\(n=\d+\)/g, '')
    .replace(/(\d+) contra (\d+)/g, '$1 times contra $2');

  return ptCard(nomeProposta,
    pcQtd(p.candidatos, 'candidatos') + ' · ' + ptInt(p.vagas) + ' vagas · conta refeita ' +
      ptInt(p.replicas) + ' vezes' +
      (nomesFora ? ' · <b>' + ptInt(nomesFora) + '</b> de ' + ptInt(nomesTotal) + ' nomes das vagas escondidos pelos filtros' : '') +
      ptTecnico(esc(p.cenario) + ' · ' + esc(p.escopo)),
    '<p class="pt-nota" style="margin-top:0">Alvo: ' +
      (p.alvo_significa ? esc(alvoTxt(p.alvo_significa)) : pcNomeChave(p.alvo)) +
      ptTecnico(esc(p.alvo) + (p.alvo_significa ? ' · ' + esc(p.alvo_significa) : '')) + '.</p>' +

    (p.sem_goleiro ? '<p class="pt-nota"><b>Sem goleiro:</b> ' + esc(p.sem_goleiro) + '</p>' : '') +

    pcAvisoBacktest14() +

    '<div style="margin-top:10px"><span class="pt-rot">por vaga: quem aparece em mais da metade das ' +
      ptInt(refeitas) + ' vezes em que a conta foi refeita</span>' + tab + '</div>' +

    '<p class="pt-nota">' +
      (semRecomendacao.length
        ? '<b>' + ptInt(semRecomendacao.length) + ' das ' + ptInt(vagas.length) + ' vagas ficaram sem ' +
          'recomendação</b> (' + esc(semRecomendacao.map(v => v.vaga).join(' · ')) + '): nenhum nome apareceu em ' +
          'mais da metade das vezes. A tela não escolhe o primeiro das alternativas — se a conta refeita ' +
          ptInt(refeitas) + ' vezes não decidiu, quem decide é o clube, sabendo que decide no escuro. '
        : 'Todas as ' + ptInt(vagas.length) + ' vagas tiveram ao menos um nome em mais da metade das vezes. ') +
      (semNenhumNome.length
        ? '<b>Em ' + ptInt(semNenhumNome.length) + ' ' + (semNenhumNome.length === 1 ? 'vaga' : 'vagas') +
          ' não sobrou nem alternativa</b> (' + esc(semNenhumNome.map(v => v.vaga).join(' · ')) +
          '): nenhum nome se destacou, e a tabela diz como a escolha se espalhou. '
        : '') +
      (denomMin !== null
        ? 'A vaga com menos opções tem <b>' + ptInt(denomMin) + '</b> candidatos — e com tão poucos a palavra ' +
          '"recomendação" vale menos do que parece. '
        : '') +
      'Estas contagens são da proposta inteira: o filtro não as muda.</p>' +

    (vv
      ? '<div style="margin-top:12px"><span class="pt-rot">conferência de volta: o perfil do elenco proposto, medido de novo ' +
          '(não é o teste da nota)</span>' +
        pcGrade(150,
          ordenados.map((k, i) => pcNumeroSolto('perfil de ' + pcGrupo(k),
            i === 0 ? 'o mais parecido' : i === ordenados.length - 1 ? 'o menos parecido' : ptInt(i + 1) + 'º mais parecido',
            (k === alvoChave ? 'é o alvo deste cenário' : '') + ptTecnico(ptNum(prox[k], 2)))).join('') +
          pcNumeroSolto('mais perto do alvo do que de quem caiu?',
            vv.margem_do_cenario === null || vv.margem_do_cenario === undefined
              ? ptFalta('sem margem no dado') : (Number(vv.margem_do_cenario) > 0 ? 'sim' : 'não'),
            ptTecnico('margem do cenário ' + ptNum(vv.margem_do_cenario, 2))) +
          pcNumeroSolto('medidas físicas por jogador', ptNum(vv.indicadores_medios_por_atleta, 1), 'média do elenco proposto') +
          pcNumeroSolto('jogadores com nota mais frágil', ptInt(vv.atletas_com_criterio_pseudorreplicado),
            'avaliados contando jogador por jogador, o que infla o resultado')) +
        '<p class="pt-nota">' + vereditoVolta + ' ' +
        ptFalta('a distância até o alvo medida por medida não vem no dado: a conferência traz só a proximidade ' +
          'geral a cada perfil, e não qual medida ficou de fora') + '</p></div>'
      : ptFaltaBloco('Esta proposta não foi conferida de volta',
          'sem essa conferência não dá para dizer se o elenco proposto reproduz o perfil que o cenário pediu.')) +

    cardRestricoes +
    baseline +
    ptContrafactual(p.contrafactual),
    '');
}

/* ================================================================================
   ETAPA 15 — TREINADOR: O QUE NÃO DÁ
   ================================================================================

   O card vazio é o conteúdo. Não existe nome de treinador em base nenhuma deste projeto, e
   por isso nenhuma pergunta sobre treinador foi respondida — nem a mais óbvia de todas, que
   é se a troca de comando explica alguma coisa.

   O que existe é um proxy: contar sistemas táticos, trocas e fidelidade ao desenho
   principal. Os p do proxy estão todos na tela, inclusive os dois que passam — e passam para
   o lado errado, o que é informação e não achado. */
function ptEtapa15(alvo, dados) {
  const bases = dados.bases_conferidas || {};
  const px = dados.proxy_sistema || {};
  const testes = px.testes || {};
  const coleta = dados.coleta_que_resolveria || null;
  const alfa = pcAlfa();

  const linhas = Object.keys(testes).map(k => Object.assign({ proxy: k }, testes[k]));
  const passamSM = linhas.filter(l => pcPassa(l.p_SM));
  const passamSC = linhas.filter(l => pcPassa(l.p_SC));

  const tab = ptTabela({
    id: ptId('15-proxy'),
    ordem: { col: 'p_SM', dir: 'asc' },
    vazio: 'o proxy de sistema não trouxe teste nenhum',
    colunas: [
      { k: 'proxy', rot: 'medida', tipo: 'texto', fmt: v => esc(ptNomeMedida(v)) + ptTecnico(esc(v)) },
      { k: 'm_sobe', rot: 'quem subiu', casas: 2 },
      { k: 'm_meio', rot: 'meio da tabela', casas: 2 },
      { k: 'm_cai', rot: 'quem caiu', casas: 2 },
      { k: 'd_SM', rot: 'quem subiu × meio', fmt: v => '<b>' + ptTamanho(v) + '</b>' + ptTecnico('d ' + ptD(v)) },
      { k: 'p_SM', rot: 'pode ser sorte? (× meio)', fmt: v => ptSorte(v) + ptTecnico(ptP(v)) },
      { k: 'd_SC', rot: 'quem subiu × quem caiu', fmt: v => '<b>' + ptTamanho(v) + '</b>' + ptTecnico('d ' + ptD(v)) },
      { k: 'p_SC', rot: 'pode ser sorte? (× quem caiu)', fmt: v => ptSorte(v) + ptTecnico(ptP(v)) },
    ],
    linhas: linhas,
  });

  /* O detalhe que muda o sentido dos dois p pequenos: eles apontam para baixo. Quem caiu usou
     MAIS sistemas distintos e teve MENOS fidelidade — isto é, o proxy está medindo o efeito
     de estar perdendo, que é a mesma armadilha da etapa 10 em outra roupa. */
  const paraOLadoErrado = passamSC.filter(l => l.d_SC < 0);
  const chaveTrocas = Object.keys(px).find(k => /^trocas_medianas_em_\d+_jogos$/.test(k)) || null;

  /* As perguntas que a coleta responderia chegam em texto de analista ("se ppda (rho=0,129) e posse
     (rho=0,272) passam a persistir quando se condiciona a permanência do técnico"). Na tela, a
     pergunta como se faz numa reunião; a situação de hoje sai da etapa 6, não da string; o texto
     do estudo fica ao lado, em letra miúda. Pergunta que o mapa não reconhece aparece como veio. */
  const rho6 = pcRhoDaEtapa6();
  const pergunta = q => {
    const s = String(q);
    if (/pontos por jogo antes\/depois da troca/.test(s)) {
      return 'Quantos pontos por jogo o time fazia antes e depois de trocar o treinador, contra adversários ' +
        'parecidos e com o mesmo mando.' + ptTecnico(esc(s));
    }
    if (/ppda.*posse.*persist/.test(s)) {
      const hoje = (k, rot) => rho6[k] && rho6[k].rho !== null && rho6[k].rho !== undefined
        ? 'os números de ' + rot + ' de um ano e do seguinte ' + ptJunto(rho6[k].rho)
        : ptFalta('a etapa 6 não mediu ' + rot + ' de um ano para o outro');
      return 'Se o time com o mesmo treinador repete a pressão e a posse no ano seguinte. Hoje, sem saber ' +
        'quem era o treinador, ' + hoje('ppda', 'pressão') + '; ' + hoje('posse', 'posse') + '.' + ptTecnico(esc(s));
    }
    if (/técnicos aparecem em mais de uma promoção/.test(s)) {
      return 'Quais treinadores aparecem em mais de uma subida.' + ptTecnico(esc(s));
    }
    return esc(s);
  };

  alvo.innerHTML =
    '<div class="pt-controle" style="border-left:3px solid var(--coral)">' +
      '<span class="pt-rot">o card vazio — e ele é o conteúdo</span>' +
      '<b style="display:block;font-size:20px;margin:5px 0 0;letter-spacing:-.01em">' +
        (dados.tem_nome_de_treinador === false
          ? 'Não existe nome de treinador em nenhuma base deste projeto.'
          : 'O estudo não declarou se existe nome de treinador nas bases.') + '</b>' +
      '<p class="pt-nota">Foram conferidas ' +
        ptInt(Object.keys(bases).filter(k => k !== 'procurado_em').reduce((s, k) => s + Number(bases[k] || 0), 0)) +
        ' colunas e campos, em ' + ptInt(Object.keys(bases).filter(k => k !== 'procurado_em').length) +
        ' arquivos' +
        ptTecnico((bases.procurado_em ? esc(bases.procurado_em) + ' · ' : '') +
          Object.keys(bases).filter(k => k !== 'procurado_em').map(k => esc(k) + ' ' + ptInt(bases[k])).join(' · ')) +
        '. Em nenhum deles há quem dirigiu o time.</p>' +
      '<p class="pt-nota">Isso deixa <b>sem resposta</b> as perguntas que mais se faz sobre subir: se ' +
        'trocar de treinador ajuda, se algum treinador aparece em mais de uma subida, se o jeito de jogar ' +
        'do time é do elenco ou de quem escala. Um card honesto vale mais que um número inventado, e aqui a ' +
        'única coisa honesta a fazer é dizer o tamanho do buraco.</p>' +
    '</div>' +

    ptCard('O que dá para medir sem o nome do treinador — e o que isso encontra',
      ptInt(px.sistemas_reais) + ' esquemas táticos diferentes na base · ' + ptInt(px.sistemas_sem_regex) +
        ' jeitos de escrevê-los antes da limpeza · ' +
        /* o número de jogos mora no NOME da chave (`trocas_medianas_em_38_jogos`): lido de lá */
        (chaveTrocas
          ? ptNum(px[chaveTrocas], 0) + ' trocas de esquema numa temporada, no time típico' +
            ptTecnico('mediana em ' + chaveTrocas.replace(/^trocas_medianas_em_(\d+)_jogos$/, '$1') + ' jogos')
          : ptFalta('o estudo não trouxe a contagem de trocas de esquema')),
      tab,
      (passamSM.length ? ptInt(passamSM.length) : 'Nenhuma') + ' das ' + ptInt(linhas.length) +
      ' medidas separa' + (passamSM.length === 1 || !passamSM.length ? '' : 'm') + ' quem subiu do meio da tabela; ' +
      (passamSC.length ? ptInt(passamSC.length) : 'nenhuma') + ' separa' +
      (passamSC.length === 1 || !passamSC.length ? '' : 'm') + ' quem subiu de quem caiu' +
      (alfa !== null ? ptTecnico('p abaixo de ' + ptNum(alfa, 2)) : '') + '. ' +
      (paraOLadoErrado.length
        ? '<b>E ' + ptInt(paraOLadoErrado.length) + ' ' + (paraOLadoErrado.length === 1 ? 'delas aponta' : 'delas apontam') +
          ' para o lado errado</b> (' +
          paraOLadoErrado.map(l => esc(ptNomeMedida(l.proxy)) + ': diferença ' + ptTamanho(l.d_SC) + ', ' + ptSorte(l.p_SC) +
            ptTecnico('d ' + ptD(l.d_SC) + ' · ' + ptP(l.p_SC))).join('; ') +
          '): ' + (paraOLadoErrado.length === 1 ? 'nessa medida' : 'nessas medidas') + ' quem caiu está ACIMA ' +
          'de quem subiu. Isso não é característica de quem sobe — é o efeito de estar perdendo medido de outro ' +
          'jeito, a mesma armadilha da etapa 10 com outra roupa. '
        : 'Nenhuma delas anda para o lado contrário do esperado. ') +
      'Nenhuma destas medidas diz qual treinador procurar, porque nenhuma delas sabe quem era o treinador.') +

    (coleta
      ? ptCard('O que seria preciso coletar para a pergunta ter resposta',
          'uma tabela nova' + (coleta.tabela ? ptTecnico(esc(coleta.tabela)) : '') +
            (coleta.fonte ? ' · fonte: ' + esc(coleta.fonte) : ''),
          pcGrade(160,
            pcNumeroSolto('temporadas de clube a cobrir', ptInt(coleta.clube_temporada), 'o painel inteiro') +
            (coleta.passagens_estimadas
              ? pcNumeroSolto('passagens de treinador estimadas',
                  ptInt(coleta.passagens_estimadas[0]) + ' a ' + ptInt(coleta.passagens_estimadas[1]),
                  'linhas a coletar')
              : '') +
            (coleta.raspador_existente
              ? pcNumeroSolto('já existe um coletor?', 'sim',
                  'não começa do zero' + ptTecnico(esc(coleta.raspador_existente)))
              : '')) +
          '<div style="margin-top:11px"><span class="pt-rot">o que passaria a ter resposta</span><ul ' +
            'style="margin:6px 0 0;padding-left:18px;font-size:12.5px;line-height:1.6;color:var(--tinta2)">' +
            (coleta.perguntas_que_passariam_a_ser_respondiveis || []).map(q =>
              '<li>' + pergunta(q) + '</li>').join('') + '</ul></div>',
          'O custo está escrito porque a decisão é do dono: ' +
          (coleta.passagens_estimadas
            ? 'entre ' + ptInt(coleta.passagens_estimadas[0]) + ' e ' + ptInt(coleta.passagens_estimadas[1]) +
              ' linhas de coleta'
            : 'uma coleta de tamanho que o estudo não estimou') +
          ' separam esta aba de responder se treinador explica subida. Enquanto isso não for coletado, o ' +
          'lugar da resposta fica vazio — e vazio escrito, que é a única forma de ele não ser preenchido ' +
          'por palpite.')
      : ptFaltaBloco('O estudo não descreveu a coleta que resolveria',
          'sem ela a tela diria apenas "não dá", sem dizer o que custaria fazer dar — que é a metade útil da ' +
          'má notícia.'));

  ptLigarTabelas(alvo);
}
