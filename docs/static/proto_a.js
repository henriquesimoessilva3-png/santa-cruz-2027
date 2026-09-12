/* Aba Protótipo — etapas 0, 1, 2, 3 e 4: a fundação da aba.

   As cinco etapas daqui respondem, nesta ordem, às perguntas que precisam estar respondidas
   ANTES de qualquer pilar aparecer na tela:

     0  quantas linhas existem, e o que esse tamanho permite afirmar;
     1  o quanto o VALOR DO ELENCO já explica sozinho — o dinheiro vem no primeiro parágrafo,
        não no rodapé, porque quem lê no rodapé lê depois de já ter acreditado no resto;
     2  os 293 indicadores, um por linha, auditáveis;
     3  quantos deles passariam por puro sorteio;
     4  o quanto cada medida concorda com ela mesma.

   Regra da casa, que manda em tudo: **o dado é a fonte, o texto é consequência.** Nenhum
   número está digitado aqui. Nem os cortes (o α vem de `etapa_0.poder.alfa`, o corte da
   hachura vem de `etapa_4.corte_hachura`), nem os rótulos que contêm quantidade ("16 contra
   16" é escrito como `d.sobe + ' contra ' + d.cai`, porque no dia em que a amostra crescer
   o rótulo tem que crescer junto). Onde o JSON traz `null`, a tela escreve o motivo do nulo
   — um travessão mudo esconderia que a medida nem existe para aquele indicador.

   Contrato: static/proto_contrato.md. Helpers compartilhados: static/proto.js — nenhum deles
   é redefinido aqui. O que é só deste arquivo leva o prefixo `pa`. */
'use strict';

/* ================= utilidades só deste arquivo =================

   Prefixo `pa` porque três arquivos irmãos carregam depois deste no mesmo escopo global: um
   `paRot` colide com nada, um `ptRot` apagaria o helper de outra pessoa. */

/* Nome de família/pilar como o pipeline escreve contra como se lê em voz alta. O que não
   estiver no mapa cai no genérico (troca `_` por espaço) em vez de sumir: chave nova no
   JSON precisa aparecer feia na tela, não desaparecer dela. */
const PA_ROTULOS = {
  tecnico_col: 'técnico coletivo',
  tecnico_ind: 'técnico individual',
  fisico_col: 'físico coletivo',
  fisico_ind: 'físico individual',
  fisico_col_elenco: 'físico coletivo · elenco inteiro',
  fisico_col_setor: 'físico coletivo · por setor',
  elenco: 'elenco (mercado, minutos e uso)',
};
function paRot(chave) {
  if (chave === null || chave === undefined || chave === '') return 'sem família declarada';
  return PA_ROTULOS[chave] || String(chave).replace(/_/g, ' ');
}

/* Cinza itálico para o que existe mas NÃO entra na conta (o ano em andamento, o selo que o
   pipeline não deu). Não é ausência de dado — `ptFalta` é para isso —, é dado presente e
   deliberadamente fora, e a diferença entre as duas coisas tem que ser visível. */
function paCinza(texto, dica) {
  return '<span class="pt-falta"' + (dica ? ' title="' + esc(dica) + '"' : '') + '>' + esc(texto) + '</span>';
}

/* Grade que se quebra sozinha. Não existe classe de layout no CSS da aba e este arquivo não
   pode criar uma (três arquivos editando o mesmo style.css ao mesmo tempo perdem trabalho um
   do outro), então a geometria vai inline — e só a geometria. */
function paGrade(min, html) {
  return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(' + min +
    'px,1fr));gap:12px;align-items:start">' + html + '</div>';
}

/* Atalho para outra etapa. O rótulo sai de `PT_ETAPAS`, a lista que a casca usa para montar
   o sumário: assim o botão não pode apontar para um título que mudou de nome. */
function paIr(n) {
  const e = (typeof PT_ETAPAS !== 'undefined') ? PT_ETAPAS.find(x => x[0] === n) : null;
  if (!e) return '';
  return '<button class="bt mini" onclick="ptIrParaEtapa(' + n + ')">' + esc(e[1]) + ' →</button>';
}

/* O α não é 5% porque "todo mundo usa 5%": é o que o JSON declara em `etapa_0.poder.alfa`.
   Se a rodada mudar o α, toda frase desta aba que diz "a 5%" muda junto. */
function paAlfa() {
  const p = ((typeof PROTO !== 'undefined' && PROTO.etapa_0) || {}).poder || {};
  return (p.alfa === undefined || p.alfa === null) ? null : p.alfa;
}
function paAlfaTxt() {
  const a = paAlfa();
  return a === null ? ptFalta('o JSON não declara o α em etapa_0.poder') : ptPct(a * 100, 0);
}

/* "Cerca de X passariam por acaso" precisa carregar o MESMO α da frase que o anuncia. O JSON
   traz um campo só: `esperados_por_acaso_5pct` — e o nome do campo fixa 5%. Hoje o α também
   é 0,05 e nada aparece errado; no dia em que a rodada mudar o α, esse campo continuaria
   trazendo o corte antigo debaixo do rótulo novo, que é exatamente a armadilha que o
   `ptLiquida` já resolveu na costura. Então: quando o α for 5%, vale o campo do JSON; quando
   não for, o número é recalculado aqui (testes × α) e a tela diz que foi recalculado.
   Serve tanto ao bloco inteiro da etapa 3 (`testes_por_comparacao`) quanto a uma linha de
   família (`testes`), porque o mesmo rótulo aparece nos dois lugares. */
function paEsperadosTestes(o) {
  if (!o) return null;
  const t = (o.testes_por_comparacao === undefined || o.testes_por_comparacao === null)
    ? o.testes : o.testes_por_comparacao;
  return (t === undefined || t === null) ? null : Number(t);
}
function paEsperadosVal(o) {
  if (!o) return null;
  const a = paAlfa();
  if (a === null || a === 0.05) {
    const v = o.esperados_por_acaso_5pct;
    return (v === undefined || v === null) ? null : Number(v);
  }
  const t = paEsperadosTestes(o);
  return t === null ? null : t * a;
}
function paEsperados(o, casas) {
  const v = paEsperadosVal(o);
  if (v === null) {
    return ptFalta('o JSON não traz o esperado por acaso nem os testes para recalculá-lo');
  }
  const a = paAlfa();
  const txt = ptNum(v, casas === undefined ? 1 : casas);
  if (a === null) {
    return '<span title="o α não está declarado em etapa_0.poder: este é o esperado a 5% que o JSON traz">' +
      txt + '</span>';
  }
  if (a !== 0.05) {
    return '<span title="recalculado na tela: o JSON só traz o esperado a 5%">' + txt + '</span>';
  }
  return txt;
}

/* A régua de AUC não é 0,828 digitado: é o que `controles_obrigatorios` declara. Toda
   comparação de AUC deste arquivo passa por aqui, porque no dia em que a baseline mudar de
   valor o corte que acende a coluna tem que mudar junto — e, se o bloco sumir do JSON,
   nenhuma linha acende e a tela escreve que ficou sem régua. */
function paAucBaseline() {
  const c = (typeof PROTO !== 'undefined' && PROTO.controles_obrigatorios) || {};
  const b = c.baseline_de_dinheiro || {};
  return (b.auc === undefined || b.auc === null) ? null : Number(b.auc);
}

/* Um número grande com legenda embaixo. Reaproveita `pt-controle` (caixa com fundo e borda,
   que já existe) em vez de pedir classe nova. */
function paBloco(valor, legenda, cor) {
  return '<div class="pt-controle" style="padding:12px 14px">' +
    '<b style="font-size:25px;font-weight:800;letter-spacing:-.03em;line-height:1;' +
      'font-variant-numeric:tabular-nums;display:block' + (cor ? ';color:var(--' + cor + ')' : '') + '">' +
      valor + '</b>' +
    '<p class="pt-nota" style="margin-top:6px">' + legenda + '</p></div>';
}

/* ================= ETAPA 0 — o que está sendo medido ================= */

function ptEtapa0(alvo, d) {
  const anos = d.por_ano || [];
  const fora = anos.filter(a => !a.entra_nas_medias);
  const dentro = anos.filter(a => a.entra_nas_medias);
  const nFora = fora.reduce((s, a) => s + a.n, 0);
  const naoEntram = d.linhas_no_arquivo - d.linhas_completas;

  /* A frase de abertura é montada, não escrita: quantas linhas saíram das médias, quais anos
     são esses e em que rodada eles pararam. No dia em que 2026 fechar, o ano sai daqui
     sozinho e a frase deixa de existir — que é exatamente o que tem que acontecer. */
  const abertura =
    '<p class="pt-nota">O arquivo tem <b>' + ptInt(d.linhas_no_arquivo) + '</b> clube-temporada. ' +
    'Entram nas médias <b>' + ptInt(d.linhas_completas) + '</b>: ' + ptInt(d.sobe) + ' que subiram, ' +
    ptInt(d.meio) + ' do meio e ' + ptInt(d.cai) + ' que caíram — as subidas são ' +
    ptPct(d.sobe / d.linhas_completas * 100) + ' do que se compara. ' +
    (naoEntram > 0
      ? 'As outras <b>' + ptInt(naoEntram) + '</b> linhas são ' +
        (fora.length ? 'o ano de ' + fora.map(a => ptAno(a.ano)).join(' e ') + ', que parou na ' +
          ptInt(fora[0].J) + 'ª rodada de ' + ptInt(d.rodadas_completa) +
          ' — temporada em andamento não entra em média nenhuma, porque a média dela seria de outro ' +
          'campeonato, mais curto.'
          : ptFalta('o JSON não diz quais linhas ficaram de fora das médias')) +
        (nFora !== naoEntram
          ? ' ' + paCinza('atenção: a soma dos anos fora das médias (' + ptInt(nFora) +
              ') não fecha com a diferença entre as duas contagens') : '')
      : '') + '</p>';

  /* O ano em andamento em cinza, com as rodadas escritas ao lado — pedido explícito da
     seção 10. Cinza aqui não é decoração: é o aviso de que aquela linha existe no arquivo e
     não existe em nenhum número desta aba. */
  const tabAnos = ptTabela({
    id: 'ptEt-0-anos',
    ordem: { col: 'ano', dir: 'asc' },
    colunas: [
      { k: 'ano', rot: 'ano', fmt: (v, l) => l.entra_nas_medias ? ptAno(v) : paCinza(ptAno(v), 'fora das médias') },
      { k: 'n', rot: 'clubes', casas: 0 },
      { k: 'J', rot: 'rodadas', fmt: (v, l) => l.entra_nas_medias ? ptInt(v)
          : paCinza(ptInt(v) + ' de ' + ptInt(d.rodadas_completa), 'temporada em andamento') },
      { k: 'sobe', rot: 'subiram', casas: 0 },
      { k: 'meio', rot: 'meio', casas: 0 },
      { k: 'cai', rot: 'caíram', casas: 0 },
      { k: 'entra_nas_medias', rot: 'entra nas médias', tipo: 'texto',
        fmt: (v, l) => v ? 'sim' : paCinza('não — ' + ptInt(l.J) + ' de ' + ptInt(d.rodadas_completa) +
          ' rodadas', 'não entra em média nenhuma') },
    ],
    linhas: anos,
  });

  /* Poder: o menor efeito que este desenho conseguiria ver. A barra é lida ao contrário do
     habitual — quanto MENOR, melhor —, e por isso a lista vem em ordem crescente e o texto
     diz o que a barra significa antes de o olho concluir sozinho que barra curta é ruim. */
  const pod = d.poder || {};
  /* O rótulo da barra tem 190px e corta com reticências: o que vai nele é curto de
     propósito, e o que não cabe vai para o `extra`, que não corta. Quem manda no texto é o
     dado — "contra os 48 do meio" é `d.meio`, não um 48 digitado. */
  const recortes = [
    ['d_minimo_16x16', 'contra os ' + ptInt(d.cai) + ' que caíram', ''],
    ['d_minimo_16x48', 'contra os ' + ptInt(d.meio) + ' do meio', ''],
    ['d_minimo_16x64', 'contra os outros ' + ptInt(d.meio + d.cai), 'o meio e quem caiu, juntos'],
    ['d_minimo_16x16_bonferroni', 'contra os ' + ptInt(d.cai) + ', sob Bonferroni',
      ptInt(pod.testes_na_correcao_bonferroni) + ' testes na correção'],
  ].filter(r => pod[r[0]] !== undefined && pod[r[0]] !== null)
   .sort((a, b) => pod[a[0]] - pod[b[0]]);
  const maxD = recortes.length ? Math.max.apply(null, recortes.map(r => pod[r[0]])) : 1;
  const barrasPoder = recortes.map(r => ptBarra(pod[r[0]], maxD, {
    rot: r[1], texto: ptNum(pod[r[0]], 2), cor: 'baixo', extra: esc(r[2]),
  })).join('');

  /* O n dos subgrupos não é uma opinião: quando a tipologia da etapa 8 já estiver no PROTO,
     o menor grupo é lido de lá. Se ela ainda não estiver, a tela diz que não está — e não
     inventa um número de exemplo. */
  const tip = ((PROTO.etapa_8 || {}).tipologia || {});
  const grupos = tip.grupos || null;
  const menorGrupo = grupos && grupos.length ? Math.min.apply(null, grupos.map(g => g.n)) : null;

  const cardPoder = ptCard('O que este tamanho permite, e o que não permite',
    ptN(d.linhas_completas, 'clube-temporada completos'),
    '<p class="pt-nota">O que ele <b>permite</b>: comparar médias de grupo — sempre as <b>' +
      ptInt(d.sobe) + '</b> que subiram contra algum outro conjunto. A ' +
      (pod.poder === undefined || pod.poder === null
        ? ptFalta('o JSON não declara o poder usado na conta') : ptPct(pod.poder * 100, 0)) +
      ' de poder e α de ' + paAlfaTxt() + ', o menor <i>d</i> de Cohen que cada recorte conseguiria ' +
      'enxergar é este — abaixo da barra, o efeito pode existir e este desenho não veria:</p>' +
    barrasPoder +
    '<p class="pt-nota"><b>"Não separa" significa "este desenho não conseguiria ver".</b> ' +
      'É frase fixa da especificação e vale para cada linha reprovada das etapas seguintes.</p>' +
    '<p class="pt-nota">O que ele <b>não permite</b>: recortar subgrupo. ' +
      (menorGrupo !== null
        ? 'Partir as ' + ptInt(d.sobe) + ' subidas nos ' + ptInt(grupos.length) +
          ' grupos da tipologia deixa o menor deles com ' + ptInt(menorGrupo) +
          ' clube-temporada, e o JSON não calcula linha de poder para esse tamanho: as três barras ' +
          'acima são os únicos recortes com <i>d</i> mínimo declarado.'
        : ptFalta('a tipologia da etapa 8 ainda não está no PROTO — sem ela não dá para dizer quantos ' +
          'sobram no menor subgrupo')) + '</p>');

  /* A independência que não existe (seção 6.6). Este bloco não é curiosidade: todo p de
     Welch e todo Benjamini-Hochberg das etapas 2 e 3 assume linhas independentes, e 80
     linhas de 40 clubes não são. A conferência da soma vai junto porque um mapa
     "vezes → quantos clubes" que não fecha com o total é erro de pipeline, e apareceria
     aqui antes de aparecer em qualquer outro lugar. */
  const ap = d.aparicoes_por_clube || {};
  const vezes = Object.keys(ap).sort((a, b) => Number(a) - Number(b));
  const somaClubes = vezes.reduce((s, k) => s + ap[k], 0);
  const somaLinhas = vezes.reduce((s, k) => s + ap[k] * Number(k), 0);
  const cardClubes = ptCard('As linhas não são independentes',
    ptInt(d.clubes_distintos) + ' clubes distintos',
    '<p class="pt-nota">' +
      (vezes.length
        ? 'As <b>' + ptInt(somaLinhas) + '</b> linhas completas são <b>' + ptInt(somaClubes) +
          '</b> clubes: ' + vezes.map(k => '<b>' + ptInt(ap[k]) + '</b> aparecem ' +
            (Number(k) === 1 ? 'uma vez' : ptInt(k) + ' vezes')).join(', ') + '. '
        : ptFalta('o JSON não traz o mapa de aparições por clube') + ' ') +
      (somaLinhas !== d.linhas_completas
        ? paCinza('a soma das aparições (' + ptInt(somaLinhas) + ') não bate com as linhas completas (' +
            ptInt(d.linhas_completas) + ')') + ' '
        : '') +
      'O mesmo clube entra várias vezes com o mesmo estádio, a mesma diretoria e boa parte do mesmo ' +
      'elenco. Todo <i>p</i> das etapas seguintes assume independência que não existe aqui — por isso ' +
      'cada <i>d</i> vem com intervalo de bootstrap <b>por clube</b> (reamostrando clubes, não linhas), ' +
      'e é esse intervalo, não o <i>p</i>, que aguenta peso.</p>');

  /* Os indicadores declarados antes do primeiro teste. A soma das famílias é conferida
     contra o total declarado porque é essa pré-declaração que torna os p exibidos não
     decorativos: lista escolhida depois de ver o resultado transforma todos eles em enfeite. */
  const fam = d.indicadores_por_familia || {};
  const chavesFam = Object.keys(fam).sort((a, b) => fam[b] - fam[a]);
  const somaFam = chavesFam.reduce((s, k) => s + fam[k], 0);
  const maxFam = chavesFam.length ? Math.max.apply(null, chavesFam.map(k => fam[k])) : 1;
  const cardInd = ptCard('Os indicadores, declarados antes do primeiro teste',
    ptInt(d.indicadores_pre_declarados) + ' indicadores · ' + ptInt(chavesFam.length) + ' famílias',
    chavesFam.map(k => ptBarra(fam[k], maxFam, { rot: paRot(k), texto: ptInt(fam[k]) })).join('') +
    '<p class="pt-nota">A lista foi versionada no repositório <b>antes</b> da primeira rodada de testes. ' +
      'É o que separa ' + ptInt(d.indicadores_pre_declarados) + ' testes de uma varredura: escolher a ' +
      'lista depois de ver o resultado faria de todo <i>p</i> desta aba um enfeite. ' +
      (somaFam !== d.indicadores_pre_declarados
        ? paCinza('a soma das famílias dá ' + ptInt(somaFam) + ' e o total declarado é ' +
            ptInt(d.indicadores_pre_declarados))
        : 'A soma das famílias fecha com o total declarado.') + '</p>');

  /* O funil, em SVG à mão — não há biblioteca de gráfico no projeto e não se deve adicionar
     uma. Aqui ele é resumo: cada degrau mostra quanto sobrou e quanto saiu, e o detalhe de
     POR QUE saiu é a etapa 12. A largura é proporcional ao primeiro degrau, então a queda do
     arquivo inteiro para o pool aparece como queda, e não como cinco barras parecidas. */
  const f = d.funil_candidatos || [];
  const n0 = f.length ? f[0].n : 0;
  const L = 400, ESQ = 150, ALT = 48;
  const funilSvg = !f.length ? ptFalta('o JSON não traz o funil de candidatos') :
    '<svg viewBox="0 0 700 ' + (f.length * ALT + 10) + '" style="width:100%;height:auto" role="img">' +
    f.map((g, i) => {
      const y = i * ALT + 8;
      const w = n0 ? Math.max(2, g.n / n0 * L) : 2;
      /* O que sobrou fica colado no fim da barra e o recorte (Série B, sul-americanos) desce
         para baixo dela: escrito tudo na mesma linha, o primeiro degrau passava da borda do
         viewBox e o número era cortado ao meio — um funil que corta o próprio número é pior
         que nenhum funil. */
      return '<rect x="' + ESQ + '" y="' + y + '" width="' + w.toFixed(1) + '" height="19" rx="4" ' +
          'fill="var(--pt-alto)" opacity="' + (1 - i * 0.13).toFixed(2) + '"/>' +
        '<text x="' + (ESQ - 10) + '" y="' + (y + 14) + '" text-anchor="end" ' +
          'style="fill:var(--tinta2);font-size:11.5px">' + esc(paRot(g.degrau)) + '</text>' +
        (g.saiu ? '<text x="' + (ESQ - 10) + '" y="' + (y + 27) + '" text-anchor="end" ' +
          'style="fill:var(--tinta3);font-size:10px">saíram ' + ptInt(g.saiu) + '</text>' : '') +
        '<text x="' + (ESQ + w + 9).toFixed(1) + '" y="' + (y + 14) + '" ' +
          'style="fill:var(--tinta);font-size:13px;font-weight:700">' + ptInt(g.n) + '</text>' +
        '<text x="' + ESQ + '" y="' + (y + 33) + '" ' +
          'style="fill:var(--tinta3);font-size:10px">' + ptInt(g.serie_b) + ' na Série B · ' +
          /* O degrau do arquivo trocou `sul_americanos` por `nao_brasileiros` quando se mediu
             que aquele número era o mundo inteiro menos o Brasil, e não a América do Sul. Os
             degraus seguintes trazem os dois. Ler o que existir, com o rótulo saindo da chave,
             impede que a tela imprima um traço mudo quando o gerador renomeia. */
          (g.sul_americanos !== undefined && g.sul_americanos !== null
            ? ptInt(g.sul_americanos) + ' sul-americanos · '
            : g.nao_brasileiros !== undefined && g.nao_brasileiros !== null
              ? ptInt(g.nao_brasileiros) + ' não brasileiros · ' : '') +
          ptInt(g.brasil) + ' no Brasil</text>';
    }).join('') + '</svg>';
  const cardFunil = ptCard('O funil dos candidatos, em resumo',
    f.length ? ptInt(f[0].n) + ' → ' + ptInt(f[f.length - 1].n) : '',
    funilSvg +
    /* A data da janela de contratos não é escrita aqui: ela é dado da etapa 12 e quem a
       imprime é quem tem a chave na mão. Este card diz o tamanho do degrau e manda para lá. */
    '<p class="pt-nota">Aqui é só o tamanho de cada degrau. <b>Quem saiu e por quê</b> — e por que o mês ' +
      'de vencimento dos contratos é calendário, não oportunidade — está na etapa do funil. ' +
      paIr(12) + '</p>');

  /* O funil sai da grade de duas colunas e vai a largura inteira: o desenho dele é uma
     queda de cinco degraus com rótulo dos dois lados, e espremido em meia tela o rótulo
     encolhe até virar enfeite ilegível. */
  alvo.innerHTML =
    abertura +
    tabAnos +
    paGrade(330, cardPoder + cardClubes) +
    cardInd +
    cardFunil;
}

/* ================= ETAPA 1 — a linha de base do dinheiro =================

   Esta etapa é a abertura do estudo, não uma nota de rodapé. A ordem é deliberada: quem lê
   encontra o valor do elenco ANTES de ver qualquer indicador de jogo, porque depois de ler
   trinta gráficos de estilo é tarde para descobrir que o dinheiro já explicava. */

function ptEtapa1(alvo, d) {
  const q = (d.quartis || []).slice().sort((a, b) => b.quartil - a.quartil);
  const maxTaxa = q.length ? Math.max.apply(null, q.map(x => x.taxa_pct)) : 1;
  const caro = q.length ? q[0] : null;
  const barato = q.length ? q[q.length - 1] : null;

  /* A barra do quartil vai até a MAIOR taxa observada, não até 100%: a leitura aqui é a
     razão entre os quartis, e uma barra de 55% contra um eixo de 100% pareceria modesta
     justamente onde está o assunto inteiro da aba. O `extra` carrega o valor mediano, para
     que "mais caro" tenha preço ao lado e não seja só um rótulo ordinal. */
  const barras = q.map(x => ptBarra(x.taxa_pct, maxTaxa, {
    rot: ptInt(x.quartil) + 'º quartil de valor',
    texto: ptPct(x.taxa_pct),
    extra: '<b>' + ptInt(x.subiram) + '</b> de ' + ptInt(x.n) + ' · mediana ' + ptEur(x.valor_mediano_eur),
  })).join('');

  const abertura =
    '<p class="pt-nota">Antes de qualquer indicador de jogo: o <b>valor do elenco</b>. Dividindo as ' +
    ptN(d.n, 'clube-temporada') + ' em quartis de valor, ' +
    (caro && barato
      ? 'o quartil mais caro sobe <b>' + ptPct(caro.taxa_pct) + '</b> das vezes e o mais barato, <b>' +
        ptPct(barato.taxa_pct) + '</b> — ' +
        (barato.taxa_pct > 0
          ? '<b>' + ptNum(caro.taxa_pct / barato.taxa_pct, 1) + '×</b> mais. '
          : 'o mais barato não subiu nenhuma vez. ')
      : ptFalta('o JSON não traz os quartis de valor') + ' ') +
    'Nenhum indicador desta aba precisa ser lido sem esta régua ao lado.</p>';

  /* Top-4 de valor: a regra mais burra possível ("aposte nos quatro elencos mais caros do
     ano") contra o acaso. O acerto por ano vai junto porque a média esconde que em um dos
     anos a regra acertou os quatro e em outro acertou um — e um modelo que acerta 4 e depois
     1 não é o mesmo que um que acerta 2,5 todo ano. */
  const t4 = d.top4_de_valor || {};
  const anosT4 = t4.por_ano || [];
  const tabTop4 = anosT4.length ? ptTabela({
    id: 'ptEt-1-top4',
    ordem: { col: 'ano', dir: 'asc' },
    colunas: [
      { k: 'ano', rot: 'ano', fmt: v => ptAno(v) },
      { k: 'acertos', rot: 'acertos entre os 4 mais caros', casas: 0 },
      { k: 'top4', rot: 'os quatro elencos mais caros do ano', tipo: 'texto',
        fmt: v => (v || []).map(esc).join(' · ') },
    ],
    linhas: anosT4,
  }) : ptFalta('o JSON não traz o acerto do top-4 ano a ano');

  const cardTop4 = ptCard('A regra mais burra possível: os quatro elencos mais caros',
    (t4.acertos !== undefined ? ptInt(t4.acertos) + ' de ' + ptInt(t4.de) + ' subidas' : ''),
    paGrade(150,
      paBloco(ptInt(t4.acertos) + ' de ' + ptInt(t4.de), 'subidas capturadas pelo top-4 de valor', 'pt-alto') +
      paBloco(ptNum(t4.esperado_por_acaso, 1), 'o que o acaso entregaria no mesmo desenho') +
      paBloco((t4.esperado_por_acaso ? ptNum(t4.acertos / t4.esperado_por_acaso, 1) + '×' : ptFalta('sem esperado por acaso no JSON')),
        'o quanto a régua do dinheiro bate o acaso')) +
    tabTop4,
    'O top-4 é medido nos <b>' + ptInt(anosT4.length) + '</b> anos completos; o ano em andamento não entra, ' +
    'porque a classificação final dele ainda não existe.');

  /* AUC do posto de valor. A escala vai de 0 a 1 e por isso o MEIO da barra é a moeda: um
     classificador que não sabe nada fica exatamente ali. Sem essa frase, uma barra de 0,828
     parece "boa" sem referência, e o leitor não tem como saber que o piso não é zero. */
  const a = d.auc_posto_de_valor || {};
  const aucs = [
    ['sobe_x_resto', 'contra todo o resto', ''],
    ['sobe_x_meio', 'contra o meio da tabela', 'a comparação que define característica'],
    ['sobe_x_cai', 'contra quem caiu', 'quase tautológica: time bom contra time ruim'],
    ['loso_sobe_x_resto', 'contra o resto, fora do ano', 'reajustado sem o ano que julga'],
  ].filter(x => a[x[0]] !== undefined && a[x[0]] !== null);
  const barrasAuc = aucs.map(x => ptBarra(a[x[0]], 1, {
    rot: x[1], texto: ptNum(a[x[0]], 3), extra: esc(x[2]),
    hachura: x[0].indexOf('loso') === 0,
  })).join('');
  const queda = (a.sobe_x_resto !== undefined && a.loso_sobe_x_resto !== undefined)
    ? a.sobe_x_resto - a.loso_sobe_x_resto : null;

  const cardAuc = ptCard('O AUC usando só o posto de valor do elenco',
    'nenhum indicador de jogo entra nesta conta',
    barrasAuc +
    '<p class="pt-nota"><b>O meio da barra é a moeda:</b> um classificador que não sabe nada cai ali. ' +
      'A barra hachurada é a versão honesta — reajustada deixando um ano inteiro de fora ' +
      (queda !== null
        ? 'e perdendo <b>' + ptNum(queda, 3) + '</b> no caminho, o que é o preço de ter sido ajustada nos ' +
          'mesmos dados que julga.'
        : ptFalta('o JSON não traz a versão deixando um ano de fora')) + '</p>' +
    '<p class="pt-nota">E a própria régua do dinheiro é frágil: ' +
      ((a.eventos_por_parametro !== undefined && a.regra_pratica !== undefined)
        ? '<b>' + ptNum(a.eventos_por_parametro, 1) + '</b> eventos por parâmetro contra os <b>' +
          ptInt(a.regra_pratica) + '</b> da regra prática. ' +
          (a.eventos_por_parametro < a.regra_pratica
            ? 'Está abaixo — é o número que qualquer proposta desta aba precisa bater, e ele mesmo não ' +
              'tem folga.'
            : 'Está dentro da regra prática.')
        : ptFalta('o JSON não traz eventos por parâmetro')) + '</p>');

  /* Caliper: a checagem que não impõe forma. Residualizar no posto de valor (a coluna
     líquida que aparece em toda linha da etapa 2) assume que a relação é linear; parear cada
     subida com clubes do MESMO ano dentro de uma distância de posto não assume nada disso. As
     duas concordarem é o que dá sossego; o achado que sobrevive às duas é o que se leva ao
     dono. */
  const cal = (d.caliper || []).slice().sort((x, y) => x.caliper - y.caliper);
  const tabCal = cal.length ? ptTabela({
    id: 'ptEt-1-caliper',
    colunas: [
      { k: 'caliper', rot: 'distância máxima de posto', fmt: v => '±' + ptNum(v, 2) },
      { k: 'subidas_com_controle', rot: 'subidas com controle do mesmo ano',
        fmt: (v, l) => ptInt(v) + ' de ' + ptInt(l.de) },
      { k: 'controles_medios', rot: 'controles por subida', casas: 2 },
    ],
    linhas: cal,
  }) : ptFalta('o JSON não traz o pareamento por caliper');

  const cob = d.cobertura_do_valor || {};
  const cardCal = ptCard('O pareamento, porque descontar por regressão impõe linearidade',
    'controles do mesmo ano, dentro de uma distância de posto de valor',
    tabCal +
    '<p class="pt-nota">Quanto mais apertado o caliper, mais parecido o controle e menos subidas acham ' +
      'par. <b>O achado que sobrevive ao pareamento é o que se leva ao dono.</b></p>' +
    (cob.rho_cobertura_x_valor !== undefined
      ? '<p class="pt-nota">E a cobertura do preço não é sorteada: o Transfermarkt precifica de <b>' +
        ptPct(cob.pct_do_plantel_min) + '</b> a <b>' + ptPct(cob.pct_do_plantel_max) +
        '</b> do plantel conforme a temporada (mediana ' + ptPct(cob.pct_do_plantel_mediana) + ', ' +
        ptInt(cob.tm_com_valor_mediana) + ' atletas por clube-temporada). A correlação entre cobertura e ' +
        'valor do elenco é <b>' + ptNum(cob.rho_cobertura_x_valor, 3) + '</b> (' + ptP(cob.p_cobertura_x_valor) +
        '): <b>time pobre tem mais atleta sem preço</b>, então o valor somado de quem é pobre está ' +
        'subestimado — e o efeito do dinheiro medido aqui é, se algo, por baixo.</p>'
      : ptFaltaBloco('Cobertura do valor', 'o JSON não traz o bloco `cobertura_do_valor`')));

  alvo.innerHTML =
    abertura +
    ptCard('Taxa de subida por quartil de valor do elenco', ptN(d.n, 'clube-temporada'),
      barras,
      'Os quartis são do valor somado do elenco na própria temporada. A subida é o desfecho daquele ano.') +
    cardTop4 +
    cardAuc +
    cardCal +
    '<p class="pt-nota">Estes números são a origem do <b>Controle 1</b> que reaparece no topo da aba e ao ' +
      'lado de cada proposta: é contra o AUC do posto de valor que todo eixo, índice e elenco desta aba ' +
      'precisa se comparar <b>fora da amostra</b>.</p>';
}

/* ================= ETAPA 2 — o catálogo dos indicadores =================

   293 linhas auditáveis. O estado do filtro vive fora da função porque a etapa se redesenha a
   cada clique e não pode esquecer onde o leitor estava. */

const PA_ET2 = { pilar: '', familia: '', setor: '', porta: '', busca: '' };

/* As colunas vêm de `d.colunas` — a ordem e o conjunto são decisão do pipeline, não desta
   tela. O mapa abaixo só diz COMO cada uma se imprime; coluna nova no JSON aparece na tabela
   sozinha, com o nome cru e formato numérico, em vez de desaparecer. */
function paEt2ColAuc() {
  const baseAuc = paAucBaseline();
  return {
    rot: 'AUC sobe×meio',
    dica: baseAuc === null
      ? 'Controle 1 — o JSON não declara o AUC da baseline em controles_obrigatorios.baseline_de_dinheiro, então nenhuma linha tem régua para acender'
      : 'Controle 1 · separa quem subiu de quem ficou no meio; a régua é o AUC do posto de valor do elenco (' +
        ptNum(baseAuc, 3) + ') e acende quem passa dela · no meio da escala do AUC está o acaso, e abaixo dele o indicador separa ao contrário',
    fmt: v => (v === null || v === undefined)
      ? ptFalta('sem AUC para este indicador') : ptNum(v, 3),
    classe: v => (baseAuc !== null && v !== null && v !== undefined && v > baseAuc) ? 'pa-bate' : '',
  };
}

function paEt2Coluna(k, d) {
  const M = {
    auc_SM: paEt2ColAuc(),
    indicador: { rot: 'id', tipo: 'texto', dica: 'a chave do indicador dentro do pipeline' },
    nome: { rot: 'indicador', tipo: 'texto', dica: 'o nome como aparece na base de origem' },
    coluna_csv: { rot: 'coluna na base', tipo: 'texto', dica: 'para auditar linha por linha no CSV' },
    pilar: { rot: 'pilar', tipo: 'texto', fmt: v => esc(paRot(v)) },
    familia: { rot: 'família', tipo: 'texto', fmt: v => esc(paRot(v)),
      dica: 'a família é a unidade da correção de Benjamini-Hochberg' },
    n: { rot: 'n', casas: 0, dica: 'clube-temporada com valor neste indicador' },
    conf: { rot: 'confiab.', dica: 'teto split-half corrigido; só existe para indicador com versão por jogo',
      fmt: v => v === null || v === undefined
        ? ptFalta('sem versão por jogo') : ptNum(v, 2) },
    m_sobe: { rot: 'média sobe', casas: 3, dica: 'valor bruto, na unidade do indicador' },
    m_meio: { rot: 'média meio', casas: 3 },
    m_cai: { rot: 'média cai', casas: 3 },
    r_sobe: { rot: 'posto sobe', casas: 1, dica: 'média do posto dentro do ano' },
    r_meio: { rot: 'posto meio', casas: 1 },
    r_cai: { rot: 'posto cai', casas: 1 },
    d_bruto_SM: { rot: 'd bruto S×M', fmt: v => ptD(v) },
    p_bruto_SM: { rot: 'p bruto S×M', fmt: v => ptPv(v) },
    q_SM: { rot: 'q S×M', fmt: v => ptPv(v), dica: 'Benjamini-Hochberg dentro da família' },
    d_liq_SM: { rot: 'd líquido S×M', fmt: v => ptD(v),
      dica: 'o mesmo d depois de descontado o posto de valor do elenco' },
    p_liq_SM: { rot: 'p líquido S×M', fmt: v => ptPv(v) },
    q_liq_SM: { rot: 'q líquido S×M', fmt: v => ptPv(v) },
    d_bruto_SC: { rot: 'd bruto S×C', fmt: v => ptD(v), dica: 'sobe × cai, a comparação secundária' },
    q_SC: { rot: 'q S×C', fmt: v => ptPv(v) },
    rho_persist: { rot: 'ρ t→t+1', casas: 3, dica: 'o mesmo clube no ano seguinte' },
    rho_1T_2T: { rot: 'ρ 1º→2º turno', casas: 3,
      dica: 'parcial dado os pontos do 1º turno; só existe para indicador jogo a jogo',
      fmt: v => v === null || v === undefined
        ? ptFalta('não é medido jogo a jogo') : ptNum(v, 3) },
    porta: { rot: 'porta', tipo: 'texto',
      dica: 'A contratação · B descritivo · C dinheiro · D placar',
      fmt: (v, l) => (v && v !== '-') ? '<b>' + esc(v) + '</b>' : paCinza('sem selo', l.porta_motivo || '') },
  };
  const base = M[k] || { rot: String(k).replace(/_/g, ' '), casas: 3 };
  /* O intervalo do bootstrap é um par de números e um par não ordena. Em vez de deixar uma
     coluna morta, a ordenação usa o limite INFERIOR — que é o número que decide se o efeito
     ainda existe na pior reamostragem — e a dica diz isso em voz alta. */
  if (k === 'ic_bruto' || k === 'ic_liq') {
    return Object.assign({}, base, {
      k: k + '_lo',
      rot: k === 'ic_bruto' ? 'intervalo do d bruto' : 'intervalo do d líquido',
      dica: 'bootstrap reamostrando CLUBES' +
        (d && d.linhas && d.linhas.length && d.linhas[0].replicas
          ? ' · ' + ptInt(d.linhas[0].replicas) + ' réplicas' : '') +
        ' — ordena pelo limite inferior; o JSON não declara o nível do intervalo',
      fmt: (v, l) => {
        const ic = l[k];
        return (ic && ic.length === 2) ? ptNum(ic[0], 2) + ' a ' + ptNum(ic[1], 2)
          : ptFalta('sem intervalo no JSON');
      },
    });
  }
  return Object.assign({ k: k }, base);
}

function paEt2Linhas(d) {
  const s = PA_ET2.busca.trim().toLowerCase();
  return (d.linhas || []).filter(l => {
    /* `String(...)` nos quatro: é o que faz a opção do vazio (chave 'null') casar com a
       linha sem valor. Para os campos que hoje nunca vêm nulos não muda nada. */
    if (PA_ET2.pilar && String(l.pilar) !== PA_ET2.pilar) return false;
    if (PA_ET2.familia && String(l.familia) !== PA_ET2.familia) return false;
    if (PA_ET2.setor && String(l.setor) !== PA_ET2.setor) return false;
    if (PA_ET2.porta && String(l.porta) !== PA_ET2.porta) return false;
    if (!s) return true;
    return [l.nome, l.indicador, l.coluna_csv, l.porta_motivo]
      .some(x => x && String(x).toLowerCase().indexOf(s) >= 0);
  }).map(l => Object.assign({}, l, {
    /* chaves derivadas só para a ordenação: a linha original continua intacta */
    ic_bruto_lo: (l.ic_bruto || [])[0],
    ic_liq_lo: (l.ic_liq || [])[0],
    liq_ordem: l.p_liq_SM,
    /* o 2º líquido pode nem existir nesta rodada do JSON: `undefined` aqui é de propósito,
       e a ordenação do `ptTabela` já manda ausente para o fim nas duas direções */
    liq2_ordem: l.p_liq2_SM,
    liq2_ordem_SC: l.p_liq2_SC,
    _dica: l.coluna_csv + ' · ' + paRot(l.familia) +
      (l.setor ? ' · setor ' + l.setor : '') + ' · ' + (l.porta_motivo || ''),
  }));
}

function paEt2Tabela(d) {
  const linhas = paEt2Linhas(d);
  const colunas = (d.colunas || []).map(k => paEt2Coluna(k, d));
  const baseAuc = paAucBaseline();
  /* O `auc_SM` existe nas 293 linhas e é a ÚNICA medida por indicador diretamente comparável
     ao Controle 1 — a baseline do dinheiro é um AUC. A aba repete que o que não bate esse
     AUC é descrição e não recomendação; sem esta coluna o leitor não tem como fazer a
     comparação que a própria aba manda fazer. O corte que acende vem de
     `controles_obrigatorios`, nunca digitado. Se a rodada nova do JSON passar a listar
     `auc_SM` em `colunas`, ela já entra pelo mapa lá de cima e não é acrescentada duas vezes. */
  if ((d.colunas || []).indexOf('auc_SM') < 0) {
    colunas.push(Object.assign({ k: 'auc_SM' }, paEt2ColAuc()));
  }
  /* A coluna do Controle 2 fica ao lado da porta e não no fim: bruto e líquido juntos, na
     mesma linha, é o assunto inteiro da aba — separá-los em duas pontas da tabela deixaria
     "passa a 5%" visível e "morre depois do dinheiro" fora do campo de visão. */
  colunas.push({
    k: 'liq_ordem', rot: 'bruto → líquido (sobe × meio)', tipo: 'texto',
    dica: 'Controle 2 · ordena pelo p do líquido',
    fmt: (v, l) => ptLiquida({ d_bruto: l.d_bruto_SM, p_bruto: l.p_bruto_SM, d_liq: l.d_liq_SM, p_liq: l.p_liq_SM }),
  });
  /* Segundo nível de residualização: além do valor do elenco, o número de atletas
     rastreados. Ele existe porque quem sobe usa MENOS gente, e toda média física POR ATLETA
     carrega esse tamanho de elenco dentro. O JSON pode chegar antes ou depois desta tela:
     enquanto não vier, a coluna não é desenhada (coluna vazia em 293 linhas é ruído) e a
     nota ao pé da tabela escreve a ausência. */
  const liq2 = [
    { k: 'liq2_ordem', d: 'd_liq2_SM', p: 'p_liq2_SM',
      rot: '2º líquido S×M (desconta valor do elenco + nº de atletas rastreados)' },
    { k: 'liq2_ordem_SC', d: 'd_liq2_SC', p: 'p_liq2_SC',
      rot: '2º líquido S×C (desconta valor do elenco + nº de atletas rastreados)' },
  ].filter(c => (d.linhas || []).some(l => l[c.d] !== undefined && l[c.d] !== null));
  liq2.forEach(c => colunas.push({
    k: c.k, rot: c.rot, tipo: 'texto',
    dica: 'd e p depois de descontar o posto de valor do elenco E o número de atletas rastreados · ordena pelo p',
    fmt: (v, l) => (l[c.d] === undefined || l[c.d] === null)
      ? ptFalta('segundo líquido não calculado para este indicador')
      : '<span class="pt-liq' + (paAlfa() !== null && l[c.p] !== null && l[c.p] !== undefined &&
          l[c.p] < paAlfa() ? ' vive' : '') + '"><i>2º líq.</i> ' + ptD(l[c.d]) +
        ' <small>(' + ptP(l[c.p]) + ')</small></span>',
  }));
  colunas.push({
    k: 'porta_motivo', rot: 'por que esta porta', tipo: 'texto',
    dica: 'prosa escrita pelo pipeline, não por esta tela',
  });
  const total = (d.linhas || []).length;
  const comAuc = (d.linhas || []).filter(l => l.auc_SM !== null && l.auc_SM !== undefined);
  const batem = baseAuc === null ? null : comAuc.filter(l => l.auc_SM > baseAuc).length;
  const notaAuc = baseAuc === null
    ? ' · ' + ptFalta('sem o AUC da baseline no JSON, a coluna de AUC fica sem régua de comparação')
    : ' · ' + (batem === 0
        ? '<b>nenhuma</b> das ' + ptInt(comAuc.length) + ' linhas com AUC alcança o <b>' +
          ptNum(baseAuc, 3) + '</b> do posto de valor do elenco'
        : '<b>' + ptInt(batem) + '</b> de ' + ptInt(comAuc.length) + ' linhas passam do <b>' +
          ptNum(baseAuc, 3) + '</b> do posto de valor do elenco') +
      ', que é a comparação que a coluna <i>AUC sobe×meio</i> serve para fazer linha a linha.';
  const notaLiq2 = liq2.length ? '' :
    '<p class="pt-nota" style="margin-top:8px">' +
    ptFalta('esta rodada do JSON não traz o segundo líquido (d_liq2/p_liq2, que desconta também o ' +
            'número de atletas rastreados) — quando esses campos chegarem, as colunas aparecem aqui sozinhas') +
    '</p>';
  /* A caixa da tabela ganha altura máxima. Não é para esconder linha nenhuma — a contagem
     acima diz quantas existem e todas continuam a uma rolagem de distância —, é porque 293
     linhas soltas empurram as outras treze etapas para tão longe do olho que a aba deixa de
     ser lida como sequência. A altura entra inline na própria `.pt-tab-rola` porque é ela o
     contêiner que rola: pendurar a altura num pai faria o cabeçalho grudento perder a
     referência e sumir na primeira rolagem. */
  const tabela = ptTabela({
    id: 'ptEt-2-tab',
    ordem: { col: 'p_liq_SM', dir: 'asc' },
    vazio: 'nenhum indicador passa neste filtro — e isto é o dado, não erro de tela',
    colunas: colunas,
    linhas: linhas,
  }).replace('<div class="pt-tab-rola">', '<div class="pt-tab-rola" style="max-height:66vh">');
  return '<p class="pt-nota" style="margin-top:0">Mostrando <b>' + ptInt(linhas.length) + '</b> de ' +
      ptInt(total) + ' indicadores' + (linhas.length < total ? ' · o filtro está ligado' : '') +
      ' · a caixa rola nos dois sentidos, e nenhuma linha fica de fora dela.' + notaAuc + '</p>' +
      tabela + notaLiq2;
}

function paEt2Redesenhar(alvo, d) {
  const caixa = alvo.querySelector('#ptEt-2-caixa');
  if (!caixa) return;
  caixa.innerHTML = paEt2Tabela(d);
  ptLigarTabelas(alvo);          /* tabela redesenhada nasce muda se isto não for chamado */
}

function ptEtapa2(alvo, d) {
  const L = d.linhas || [];
  /* O vazio é uma opção, não um descarte. Enquanto o `null` era jogado fora, as quatro
     opções de setor somavam 220 debaixo de um "todos (293)" impresso logo acima — a soma que
     não fecha estava visível na própria barra de filtros — e os 73 indicadores sem setor (os
     que são do elenco inteiro, não de uma linha do campo) não tinham como ser isolados. O
     vazio vira a chave `'null'`, que é exatamente o que `String(l.setor)` devolve no filtro,
     e vai para o fim da lista porque ausência não é mais uma categoria em ordem alfabética. */
  const unicos = campo => {
    const v = {};
    L.forEach(l => {
      const b = l[campo];
      const k = (b === null || b === undefined || b === '') ? 'null' : String(b);
      v[k] = (v[k] || 0) + 1;
    });
    return Object.keys(v).sort((a, b) => a === 'null' ? 1 : b === 'null' ? -1 : a.localeCompare(b, 'pt-BR'))
      .map(k => [k, v[k]]);
  };
  const sel = (id, rotulo, campo, formata, vazioRot) => {
    const op = unicos(campo);
    return '<label>' + esc(rotulo) +
      '<select class="bt mini" id="' + id + '"><option value="">todos (' + ptInt(L.length) + ')</option>' +
      op.map(o => '<option value="' + esc(o[0]) + '">' +
        esc(o[0] === 'null' ? (vazioRot || 'sem valor declarado') : (formata ? formata(o[0]) : o[0])) +
        ' (' + ptInt(o[1]) + ')</option>').join('') +
      '</select></label>';
  };

  /* O resumo do sorteio repetido no topo da tabela, curto. A etapa 3 é o lugar dele; aqui
     ele existe porque a tabela abaixo tem 293 linhas e quem rola até ela precisa saber,
     ANTES de achar a primeira linha com p pequeno, quantas linhas com p pequeno o acaso
     entregaria de graça. */
  const e3 = PROTO.etapa_3 || null;
  const aviso = !e3
    ? ptFaltaBloco('O aviso do sorteio não está no PROTO',
        'sem `etapa_3` esta tabela vira garimpo com cara de achado — o bloco existe para impedir isso')
    : '<div class="pt-controle">' +
        '<span class="pt-rot">Antes de ler a tabela</span>' +
        '<p class="pt-nota">Foram feitos <b>' + ptInt(e3.testes_por_comparacao) + '</b> testes por comparação. ' +
          'A ' + paAlfaTxt() + ', cerca de <b>' + paEsperados(e3) +
          '</b> passariam por puro acaso. Passam de fato <b>' + ptInt(e3.passam5_SM) +
          '</b> contra o meio; sobrevivem a Benjamini-Hochberg <b>' + ptInt(e3.bh5_SM) + '</b>. ' +
          'Depois de descontado o valor do elenco, sobram <b>' + ptInt(e3.bh5_liq_SM) + '</b>. ' +
          paIr(3) + '</p></div>';

  const primaria = d.comparacao_primaria
    ? '<b>' + esc(d.comparacao_primaria) + '</b>'
    : ptFalta('o JSON não declara qual é a comparação primária');
  const passam = L.filter(l => l.resultado === true).length;

  /* A classe que acende a coluna de AUC mora aqui e não no `style.css`: três arquivos irmãos
     estão sendo editados ao mesmo tempo e quem escreve esta etapa não é dono daquele arquivo.
     A regra vive dentro do próprio `alvo`, presa ao id do contêiner, e por isso não alcança
     nenhuma outra etapa. */
  alvo.innerHTML =
    '<style>#ptEt-2-caixa .pt-tab td.pa-bate{color:var(--pt-ok);font-weight:800}</style>' +
    aviso +
    '<p class="pt-nota">Um indicador por linha, ordenável por qualquer coluna — é aqui que ' +
      '"indicador por indicador" fica auditável. A comparação primária é ' + primaria + ', não sobe × cai: ' +
      'sobe × cai é quase tautológica, porque mede time bom contra time ruim, e é o meio da tabela que ' +
      'define característica. ' +
      (passam === 0
        ? 'Nenhuma das <b>' + ptInt(L.length) + '</b> linhas chega ao fim com o selo de aprovada — o campo ' +
          '<code>resultado</code> é falso em todas, e o motivo de cada uma está escrito na última coluna.'
        : '<b>' + ptInt(passam) + '</b> de ' + ptInt(L.length) + ' linhas chegam ao fim aprovadas.') + '</p>' +
    '<div class="filtros" style="border:1px solid var(--borda);border-radius:8px;background:var(--fundo2)">' +
      '<input type="text" id="ptEt-2-busca" placeholder="buscar indicador, coluna ou motivo">' +
      sel('ptEt-2-pilar', 'pilar', 'pilar', paRot) +
      sel('ptEt-2-familia', 'família', 'familia', paRot) +
      sel('ptEt-2-setor', 'setor', 'setor', null, 'sem setor') +
      sel('ptEt-2-porta', 'porta', 'porta') +
      '<button class="bt mini" id="ptEt-2-limpar">limpar</button>' +
    '</div>' +
    '<div id="ptEt-2-caixa">' + paEt2Tabela(d) + '</div>';

  const liga = (id, campo) => {
    const el = alvo.querySelector('#' + id);
    if (!el) return;
    el.value = PA_ET2[campo];
    el.oninput = () => { PA_ET2[campo] = el.value; paEt2Redesenhar(alvo, d); };
  };
  liga('ptEt-2-busca', 'busca');
  liga('ptEt-2-pilar', 'pilar');
  liga('ptEt-2-familia', 'familia');
  liga('ptEt-2-setor', 'setor');
  liga('ptEt-2-porta', 'porta');
  const limpar = alvo.querySelector('#ptEt-2-limpar');
  if (limpar) limpar.onclick = () => {
    Object.keys(PA_ET2).forEach(k => { PA_ET2[k] = ''; });
    ptEtapa2(alvo, d);
  };
}

/* ================= ETAPA 3 — o aviso do sorteio, em número =================

   Sem este bloco a etapa 2 vira garimpo com cara de achado. Ele não conta o que passou:
   conta quanto passaria sem nada acontecer. */

function ptEtapa3(alvo, d) {
  const fam = d.por_familia || {};
  const chaves = Object.keys(fam);
  const somaTestes = chaves.reduce((s, k) => s + fam[k].testes, 0);

  /* As três comparações na mesma tabela, na ordem em que a leitura tem que acontecer: a
     primária, a tautológica e a líquida. Ler a líquida por último é o ponto — é ela que
     responde "e depois de descontar o dinheiro?". */
  const comparacoes = [
    { comp: 'sobe × meio, bruto', passam: d.passam5_SM, bh: d.bh5_SM, ordem: 1 },
    { comp: 'sobe × cai, bruto', passam: d.passam5_SC, bh: d.bh5_SC, ordem: 2 },
    { comp: 'sobe × meio, líquido de valor', passam: d.passam5_liq_SM, bh: d.bh5_liq_SM, ordem: 3 },
  ].filter(c => c.passam !== undefined);

  const tabComp = ptTabela({
    id: 'ptEt-3-comp',
    ordem: { col: 'ordem', dir: 'asc' },
    colunas: [
      { k: 'comp', rot: 'comparação', tipo: 'texto' },
      { k: 'passam', rot: 'passam a ' + (paAlfa() !== null ? ptPct(paAlfa() * 100, 0) : 'α'), casas: 0 },
      { k: 'bh', rot: 'sobrevivem a Benjamini-Hochberg', casas: 0 },
    ],
    linhas: comparacoes,
  });

  const cabecalho = paGrade(150,
    paBloco(ptInt(d.testes_por_comparacao), 'testes por comparação') +
    paBloco(paEsperados(d), 'passariam por puro acaso a ' + paAlfaTxt(), 'pt-baixo') +
    paBloco(ptInt(d.passam5_SM), 'passam de fato contra o meio, no bruto') +
    paBloco(ptInt(d.bh5_liq_SM), 'sobrevivem a BH depois de descontado o valor do elenco',
      d.bh5_liq_SM === 0 ? 'coral-cl' : 'pt-ok'));

  /* A frase é obrigatória por especificação e vem inteira do dado. O caso `bh5_liq_SM = 0`
     não pode ficar escondido numa célula: é o número mais duro da aba, e ele muda o que a
     tela inteira tem direito de afirmar. */
  const duro = d.bh5_liq_SM === 0
    ? '<p class="pt-nota"><b>Nenhum</b> dos ' + ptInt(d.testes_por_comparacao) + ' indicadores sobrevive à ' +
      'correção de Benjamini-Hochberg depois de descontado o valor do elenco. Não é que a aba não ache ' +
      'nada: é que o que ela acha no bruto não se distingue do dinheiro, e o que sobra do dinheiro não se ' +
      'distingue do acaso quando se conta quantas vezes a pergunta foi feita.</p>'
    : '<p class="pt-nota"><b>' + ptInt(d.bh5_liq_SM) + '</b> indicadores sobrevivem a Benjamini-Hochberg ' +
      'depois do desconto do valor do elenco — são eles, e só eles, que a aba tem direito de chamar de ' +
      'característica em vez de dinheiro.</p>';

  const tabFam = chaves.length ? ptTabela({
    id: 'ptEt-3-familia',
    ordem: { col: 'testes', dir: 'desc' },
    colunas: [
      { k: 'familia', rot: 'família', tipo: 'texto', dica: 'a família é a unidade da correção' },
      { k: 'testes', rot: 'testes', casas: 0 },
      { k: 'esperados', rot: 'esperados por acaso a ' + (paAlfa() !== null ? ptPct(paAlfa() * 100, 0) : 'α'),
        casas: 2, fmt: (v, l) => paEsperados(l, 2),
        dica: 'o JSON só traz o esperado a 5%; fora disso a tela recalcula testes × α' },
      { k: 'passam5_SM', rot: 'passam S×M', casas: 0 },
      { k: 'bh5_SM', rot: 'BH S×M', casas: 0 },
      { k: 'passam5_SC', rot: 'passam S×C', casas: 0 },
      { k: 'bh5_SC', rot: 'BH S×C', casas: 0 },
      { k: 'passam5_liq_SM', rot: 'passam líquido S×M', casas: 0 },
      { k: 'bh5_liq_SM', rot: 'BH líquido S×M', casas: 0 },
    ],
    /* `esperados` é chave derivada só para a ordenação: a linha do JSON continua intacta, e
       quem decide se o número é o do campo ou o recalculado é o `paEsperadosVal`. */
    linhas: chaves.map(k => Object.assign({}, fam[k],
      { familia: paRot(k), esperados: paEsperadosVal(fam[k]) })),
  }) : ptFalta('o JSON não traz a quebra por família');

  /* O nulo do garimpo é a única medida aqui que precifica a BUSCA, e não o teste. Todas as
     outras contas desta etapa respondem "qual a chance deste indicador parecer bom por
     acaso?"; esta responde "qual a chance do MELHOR de 229 parecer bom por acaso?" — que é a
     pergunta que corresponde ao que foi realmente feito. */
  const g = d.nulo_do_garimpo || null;
  let cardGarimpo;
  if (!g) {
    cardGarimpo = ptFaltaBloco('O nulo do garimpo',
      'o JSON não traz o bloco `nulo_do_garimpo` — sem ele, nada nesta aba precifica o ato de ter ' +
      'escolhido o melhor entre centenas');
  } else {
    const marcas = [
      ['ganho_auc_nulo_media', 'média do sorteio', false],
      ['ganho_auc_nulo_p95', 'p95 do sorteio', false],
      ['ganho_auc_nulo_max', 'máximo do sorteio', false],
      ['ganho_auc_real_melhor', 'o melhor de verdade', true],
    ].filter(m => g[m[0]] !== undefined && g[m[0]] !== null);
    const topo = Math.max.apply(null, marcas.map(m => g[m[0]]));
    const E = 54, W = 580;
    const px = v => E + (topo ? v / topo * W : 0);
    /* Régua deitada em vez de quatro barras: o assunto é a DISTÂNCIA entre o melhor real e o
       que o sorteio entrega, e distância se lê num eixo, não em comprimentos empilhados. */
    const svg = '<svg viewBox="0 0 700 118" style="width:100%;height:auto" role="img">' +
      '<line x1="' + E + '" y1="52" x2="' + (E + W) + '" y2="52" stroke="var(--borda2)"/>' +
      marcas.map((m, i) => {
        const x = px(g[m[0]]);
        const alto = m[2];
        /* Rótulo centrado no risco, menos nas pontas: com o maior valor do sorteio colado na
           borda direita, o texto centrado saía do viewBox e o número aparecia cortado ao
           meio — que é o defeito exato que esta régua existe para não cometer. */
        const anc = x > E + W * 0.86 ? 'end' : (x < E + W * 0.14 ? 'start' : 'middle');
        return '<line x1="' + x.toFixed(1) + '" y1="' + (alto ? 30 : 44) + '" x2="' + x.toFixed(1) +
            '" y2="' + (alto ? 74 : 60) + '" stroke="var(--' + (alto ? 'pt-alto' : 'pt-baixo') +
            ')" stroke-width="' + (alto ? 3 : 2) + '"/>' +
          '<text x="' + x.toFixed(1) + '" y="' + (alto ? 22 : 78 + (i % 3) * 13) + '" text-anchor="' + anc + '" ' +
            'style="fill:var(--' + (alto ? 'tinta' : 'tinta3') + ');font-size:10.5px' +
            (alto ? ';font-weight:700' : '') + '">' + esc(m[1]) + ' ' + ptNum(g[m[0]], 4) + '</text>';
      }).join('') + '</svg>';

    cardGarimpo = ptCard('O nulo do garimpo',
      ptN(g.replicas, 'réplicas') + ' · ' + esc(g.metodo),
      svg +
      '<p class="pt-nota">O indicador é embaralhado <b>dentro do ano</b>, mantendo a base de valor intacta, ' +
        'e a escolha do melhor entre <b>' + ptInt(g.indicadores) + '</b> é refeita do zero. O que a régua ' +
        'mede é quanto o <b>melhor de ' + ptInt(g.indicadores) + '</b> ganha de AUC por puro sorteio. ' +
        (g.excluidos_por_cobertura_abaixo_de_90pct
          ? 'Ficaram de fora <b>' + ptInt(g.excluidos_por_cobertura_abaixo_de_90pct) +
            '</b> indicadores por cobertura insuficiente — garimpar em coluna com buraco inflaria o ganho ' +
            'dos dois lados. '
          : '') +
        'O melhor real é <code>' + esc(g.indicador_real_melhor || '') + '</code>.</p>',
      'Ganho real de AUC <b>' + ptNum(g.ganho_auc_real_melhor, 4) + '</b> contra p95 do nulo <b>' +
        ptNum(g.ganho_auc_nulo_p95, 4) + '</b> — ' + ptP(g.p_do_melhor) + ', com semente ' +
        ptInt(g.semente) + '. ' +
        (paAlfa() !== null && g.p_do_melhor !== null && g.p_do_melhor < paAlfa()
          ? 'Passa, e passa raspando: o sorteio sozinho chega perto demais para que este achado ' +
            'sustente uma contratação.'
          : 'Não passa: o que o melhor indicador ganha está dentro do que o sorteio entrega.'));
  }

  alvo.innerHTML =
    cabecalho +
    '<p class="pt-nota">Foram feitos <b>' + ptInt(d.testes_por_comparacao) + '</b> testes por comparação; ' +
      'a ' + paAlfaTxt() + ', cerca de <b>' + paEsperados(d) + '</b> passariam por ' +
      'acaso. A correção de Benjamini-Hochberg roda <b>dentro de cada família</b>, nunca no bolo e nunca ' +
      'por indicador isolado' +
      (somaTestes === d.testes_por_comparacao
        ? ' — as ' + ptInt(chaves.length) + ' famílias somam exatamente os ' + ptInt(d.testes_por_comparacao) +
          ' testes.'
        : ' — ' + paCinza('as famílias somam ' + ptInt(somaTestes) + ' e o total declarado é ' +
            ptInt(d.testes_por_comparacao)) + '.') + '</p>' +
    tabComp +
    duro +
    ptCard('Família por família', ptInt(chaves.length) + ' famílias · a correção roda dentro de cada uma',
      tabFam,
      'Sobreviver a BH em <b>sobe × cai</b> e não sobreviver em <b>sobe × meio</b> é o padrão da tabela, ' +
      'e não é achado: separar quem subiu de quem caiu é separar time bom de time ruim.') +
    cardGarimpo;
}

/* ================= ETAPA 4 — confiabilidade de cada medida ================= */

function ptEtapa4(alvo, d) {
  const L = (d.linhas || []).slice().sort((a, b) => b.conf - a.conf);
  const corte = d.corte_hachura;
  const abaixo = L.filter(l => l.hachura).length;
  const negativos = L.filter(l => l.conf !== null && l.conf < 0);

  /* A barra vai de 0 a 1 porque confiabilidade é teto, não quantidade: o máximo possível é
     a medida concordar perfeitamente com ela mesma. Hachura = abaixo do corte que o próprio
     JSON declara — nunca por gosto de quem desenha. O ρ entre as metades vai no `extra`
     junto do n, porque a correção de Spearman-Brown sobe o número e quem confere precisa ver
     de onde ele subiu. */
  const barras = L.map(l => ptBarra(l.conf, 1, {
    rot: l.coluna_jogo || l.indicador,
    dica: l.indicador,
    texto: ptNum(l.conf, 2),
    hachura: l.hachura,
    cor: l.hachura ? 'baixo' : 'alto',
    extra: ptN(l.n, 'clube-temporada') + ' · ρ entre as metades ' + ptNum(l.rho_meias, 3) +
      (l.conf !== null && l.conf < 0 ? ' · <b>as duas metades andam em sentidos opostos</b>' : ''),
  })).join('');

  /* A ausência é o conteúdo principal desta etapa. A lista de barras acima parece completa e é uma
     fração da lista pré-declarada: sem esta linha, quem passa o olho conclui que a confiabilidade foi
     medida em todos os indicadores — e ela não foi, porque a maior parte deles não existe por jogo. */
  const total = L.length + (d.sem_versao_por_jogo || 0);
  const declarados = (PROTO.etapa_0 || {}).indicadores_pre_declarados;
  const semJogo = d.sem_versao_por_jogo === undefined || d.sem_versao_por_jogo === null
    ? ptFaltaBloco('Quantos indicadores não têm confiabilidade medida',
        'o JSON não traz `sem_versao_por_jogo`')
    : ptFaltaBloco(ptInt(d.sem_versao_por_jogo) + ' indicadores não aparecem em barra nenhuma acima',
        'não existe versão por jogo deles: o valor é da temporada inteira, e sem duas metades não há ' +
        'split-half para calcular. Os ' + ptInt(L.length) + ' medidos aqui e esses ' +
        ptInt(d.sem_versao_por_jogo) + ' somam ' + ptInt(total) +
        (declarados !== undefined
          ? (total === declarados
              ? ', que é exatamente a lista pré-declarada.'
              : ', e a lista pré-declarada tem ' + ptInt(declarados) + ' — a diferença é do pipeline.')
          : '.') +
        ' Na etapa do catálogo, a coluna de confiabilidade desses indicadores está escrita como ausente, ' +
        'não como zero.');

  alvo.innerHTML =
    '<p class="pt-nota">Antes de perguntar se um indicador separa quem sobe, cabe perguntar se ele ' +
      'concorda com ele mesmo. O método é ' +
      (d.metodo ? '<b>' + esc(d.metodo) + '</b>' : ptFalta('o JSON não declara o método')) +
      ': as rodadas ímpares de um clube-temporada contra as pares dele mesmo. Um indicador que não ' +
      'repete dentro do próprio ano não pode separar coisa nenhuma entre anos — o teto de qualquer ' +
      'correlação dele é este número.</p>' +
    ptCard('Split-half corrigido, indicador por indicador',
      ptInt(L.length) + ' indicadores com versão por jogo',
      barras,
      (corte !== undefined && corte !== null
        ? '<b>A hachura marca o que está abaixo de ' + ptNum(corte, 2) + '</b>, o corte declarado no ' +
          'próprio JSON: ali a medida mal concorda com ela mesma de uma metade do campeonato para a outra. ' +
          'São <b>' + ptInt(abaixo) + '</b> de ' + ptInt(L.length) + ' — e barra sólida neles mentiria por ' +
          'omissão, porque o comprimento sozinho não diz que o número é instável. '
        : ptFalta('o JSON não declara o corte da hachura') + ' ') +
      (negativos.length
        ? 'Pior que isso: em <b>' + ptInt(negativos.length) + '</b> (' +
          negativos.map(l => '<code>' + esc(l.coluna_jogo || l.indicador) + '</code>').join(', ') +
          ') a correlação entre as metades é <b>negativa</b> — as duas metades do campeonato andam em ' +
          'sentidos opostos, e o que a coluna mede ali é ruído com nome de indicador.'
        : '')) +
    semJogo +
    '<p class="pt-nota">Esta coluna volta na tabela do catálogo, ao lado de cada linha: um <i>d</i> grande ' +
      'num indicador de confiabilidade baixa é, antes de tudo, um <i>d</i> medido com régua torta. ' +
      paIr(2) + '</p>';
}
