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

   Linguagem (revisão de 13/09/2026): o leitor é diretor, treinador, conselheiro — gente que
   entende muito de futebol e nada de estatística. Cada bloco abre com a frase que se diria em
   voz alta numa reunião, montada do dado; depois o número em forma simples, pelo vocabulário
   único de proto.js (ptTamanho, ptAcaso, ptSorte, ptJunto, ptAcerto); por último o número
   técnico em ptTecnico(), menor, que não some. Nenhuma palavra nova para a mesma coisa: se
   este arquivo disser "sólido" e o proto_c disser "provável", o leitor aprende que as palavras
   não querem dizer nada. E simplificar não é afirmar mais: toda ressalva que existia continua
   aqui, traduzida.

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
  tecnico_col: 'técnico do time',
  tecnico_ind: 'técnico do atleta',
  fisico_col: 'físico do time',
  fisico_ind: 'físico do atleta',
  fisico_col_elenco: 'físico do time · elenco inteiro',
  fisico_col_setor: 'físico do time · por setor',
  elenco: 'elenco (mercado, minutos e uso)',
  arquivo: 'o arquivo inteiro',
  ligas_alvo: 'nas ligas que interessam',
};
function paRot(chave) {
  if (chave === null || chave === undefined || chave === '') return 'sem grupo declarado';
  return PA_ROTULOS[chave] || String(chave).replace(/_/g, ' ');
}

/* O selo de cada indicador, dito pelo MOTIVO que o estudo mediu, e não por uma etiqueta.
   A etiqueta da letra (ptPortaTxt, em proto.js) resume a letra inteira, e uma letra junta
   motivos diferentes: dos indicadores com selo B, uns são firmes e o 1º turno não previu o 2º,
   outros são firmes e não têm versão por jogo, e outros separam sozinhos mas não sobram na conta
   dos muitos testes parecidos. Por isso a tela diz o motivo gravado, linha a linha, e a etiqueta
   da letra fica só na dica. A porta A é "firme e reaparece por outro caminho": só leitura, não é
   critério de contratação nem entra em nota nenhuma.

   Revisão de 15/09: saíram da régua o desconto pelo valor do elenco e a repetição do mesmo clube
   no ano seguinte, e a porta C deixou de existir. A palavra de sorte ao lado do motivo sai da
   CHAVE gravada na linha (`sorte_SM`) pelo ptSorte da casca — nunca do texto do motivo.

   `resumo` (para o filtro e a dica da letra): sem os números da linha e sem o sufixo da lista,
   para uma letra não virar dez rótulos só porque cada grupo tem um tamanho. */
function paMotivoTxt(cru, resumo) {
  const c = String(cru || '');
  const lista = /a lista tem mais achados do que a sorte produz/.test(c) && !resumo
    ? '; ' + ptListaSorte('tem_mais_achados_que_a_sorte') : '';
  if (/^não separa quem sobe do meio/.test(c)) {
    return 'não se viu diferença entre ' + ptFxRot('sobe') + ' e o ' + ptFxRot('meio');
  }
  if (/^firme e o 1º turno previu o 2º/.test(c)) {
    return 'e o 1º turno previu o 2º no lado esperado: reaparece por outro caminho';
  }
  if (/^firme, mas o 1º turno não previu o 2º/.test(c)) {
    return 'mas o 1º turno não previu o 2º: não reapareceu por outro caminho';
  }
  if (/^firme, sem versão por jogo/.test(c)) {
    return 'mas não tem versão por jogo: não deu para ver se vem antes do resultado';
  }
  const m = /^separa, mas não sobra na conta dos (\d+) parecidos/.exec(c);
  if (m) {
    return 'separa sozinho, mas não sobra contando ' +
      (resumo ? 'os testes parecidos do grupo' : 'os ' + ptInt(Number(m[1])) + ' testes parecidos do grupo') + lista;
  }
  return null;
}
/* A palavra de sorte da linha, da chave gravada (quem subiu × meio). */
function paSorteDaLinha(l) {
  const k = l ? l[ptK('sorte_{SM}')] : undefined;
  return k === null || k === undefined ? ptSorte(l ? l[ptK('p_bruto_{SM}')] : null, l ? l[ptK('q_{SM}')] : null) : ptSorte(k);
}
/* O rótulo de uma letra no filtro: os motivos gravados nas linhas daquela letra, cada um uma
   vez, com a palavra de sorte da própria linha. Sem linhas (ou motivo que o mapa não conhece),
   a etiqueta de proto.js. */
function paPorta(letra, linhas) {
  const sem = letra === null || letra === undefined || letra === '' || letra === '-';
  const doSelo = (linhas || []).filter(l => String(l.porta) === String(letra));
  const txts = doSelo.map(l => {
    const t = paMotivoTxt(l.porta_motivo, true);
    return t === null ? null : (sem ? t : paSorteDaLinha(l) + paJunta(t) + t);
  });
  const unicos = txts.filter((t, i) => t !== null && txts.indexOf(t) === i);
  const motivo = unicos.length && txts.indexOf(null) < 0 ? unicos.join('; ou ') : null;
  if (sem) return motivo ? 'sem selo: ' + motivo : 'sem selo';
  return motivo || ptPortaTxt(letra) || 'selo ' + String(letra);
}

/* O motivo do selo de UMA linha, em português: a palavra de sorte (chave gravada) e o porquê.
   O texto cru vai sempre ao lado, em ptTecnico. Motivo que o mapa não reconhece aparece só no
   ptTecnico, com uma frase dizendo que é o texto do estudo. */
function paMotivoSelo(l) {
  const cru = l && l.porta_motivo ? String(l.porta_motivo) : '';
  if (!cru) return paCinza('sem motivo registrado');
  const txt = paMotivoTxt(cru);
  if (txt === null) return 'motivo registrado pelo estudo, ao lado' + ptTecnico(esc(cru));
  const sem = !l.porta || l.porta === '-';
  return (sem ? esc(txt) : '<b>' + esc(paSorteDaLinha(l)) + '</b>' + paJunta(txt) + esc(txt)) +
    ptTecnico(esc(cru));
}
/* A costura entre a palavra de sorte e o motivo: "firme e o 1º turno…", "firme, mas…", "pode ser sorte: separa…". */
function paJunta(t) {
  return /^e /.test(t) ? ' ' : /^mas /.test(t) ? ', ' : ': ';
}

/* Acerto em pares COM o sentido. ptAcerto lê o número cru: um indicador em que quem subiu tem
   MENOS (distância do chute) sairia "acerta em 19 de cada 100", que é falso — pelo lado do
   próprio indicador, ele põe quem subiu na frente em 81. O sentido sai do valor (acima ou
   abaixo de 50) e o `sinal` declarado só diz se esse sentido é o esperado. */
function paAucEfetivo(v, sinal) {
  if (v === null || v === undefined) return null;
  return sinal === -1 ? 1 - Number(v) : Number(v);
}
function paAcertoComLado(v, sinal) {
  if (v === null || v === undefined || isNaN(Number(v))) return ptFalta('sem medida de acerto para este indicador');
  const n = Number(v);
  const acerto = Math.max(n, 1 - n);
  const pares = Math.round(acerto * 100), metade = Math.round(0.5 * 100);
  const lado = pares === metade ? '' : (n > 0.5 ? ', quem subiu tem mais' : ', quem subiu tem menos');
  const contra = pares !== metade && (sinal === 1 || sinal === -1) && ((n > 0.5) !== (sinal === 1))
    ? ' (ao contrário do que o estudo esperava)' : '';
  return ptAcerto(acerto) + lado + contra + ptTecnico('AUC ' + ptNum(n, 3));
}

/* Setor do elenco em voz alta. "meio" vira "meio-campo" porque nesta etapa a palavra "meio"
   já é a faixa da tabela (quem não subiu nem caiu) — a mesma palavra para as duas coisas, na
   mesma tabela, faria o leitor ler "o meio do meio". */
const PA_SETORES = { goleiro: 'goleiro', defesa: 'defesa', meio: 'meio-campo', ataque: 'ataque', total: 'elenco inteiro' };
function paSetor(s) {
  return PA_SETORES[s] || (s === null || s === undefined ? 'setor sem nome' : String(s).replace(/_/g, ' '));
}

/* Cinza itálico para o que existe mas NÃO entra na conta (o ano em andamento, o selo que o
   pipeline não deu). Não é ausência de dado — `ptFalta` é para isso —, é dado presente e
   deliberadamente fora, e a diferença entre as duas coisas tem que ser visível. */
function paCinza(texto, dica) {
  return '<span class="pt-falta"' + (dica ? ' title="' + esc(dica) + '"' : '') + '>' + esc(texto) + '</span>';
}

/* Contagem com a unidade dita por extenso ("80 temporadas de clube"), no lugar do "n = 80"
   que só o analista lê. Nulo continua virando motivo escrito, como fazia o ptN. */
function paQuantos(n, singular, plural) {
  if (n === null || n === undefined) return ptFalta('contagem não registrada no ' + ptArquivoDado());
  return ptInt(n) + ' ' + (Math.abs(Number(n)) === 1 ? singular : plural);
}

/* Ordinal para posição em ranking ("9º"). Ano nunca passa aqui. */
function paOrd(v) {
  return (v === null || v === undefined) ? '—' : ptInt(v) + 'º';
}

/* Pares de cada 100, com sinal, para dizer a DIFERENÇA entre dois acertos na mesma língua do
   ptAcerto ("acerta em 84 de cada 100 pares"). A escala de 100 é a do próprio ptAcerto. */
function paPares(x) {
  if (x === null || x === undefined || isNaN(Number(x))) return null;
  return Math.round(Number(x) * 100);
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
/* O atalho vai pelo `data-pt-ir` que a casca escuta no documento, com o prefixo da aba que
   está desenhando: com duas abas na página, um `onclick="ptIrParaEtapa(n)"` rolaria a etapa da
   última aba clicada, não a desta. */
function paIr(n) {
  const e = (typeof PT_ETAPAS !== 'undefined') ? PT_ETAPAS.find(x => x[0] === n) : null;
  if (!e) return '';
  return '<button class="bt mini" data-pt-ir="' + esc(String(n)) + '" data-pt-prefixo="' + esc(ptPrefixo()) + '">' +
    esc(e[1]) + ' →</button>';
}

/* O α não é 5% porque "todo mundo usa 5%": é o que o arquivo de dados declara, lido pela casca
   (ptAlfa), que sabe também do dado dividido por universo. Se a rodada mudar o α, toda frase
   desta aba que diz "a 5%" muda junto; se os universos declararem α diferentes, a casca devolve
   nulo e a tela escreve o motivo em vez de escolher um. */
function paAlfa() {
  const a = ptAlfa();
  return (a === undefined || a === null) ? null : a;
}
function paAlfaTxt() {
  const a = paAlfa();
  return a === null
    ? ptFalta(ptAlfaInfo().motivo || 'o ' + ptArquivoDado() + ' não declara o α em etapa_0.poder')
    : ptPct(a * 100, 0);
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
/* O corte que o campo gravado carrega sai do NOME do campo (`esperados_por_acaso_5pct` → 0,05),
   não de um 5 digitado: se o gerador trocar o corte e o nome, a tela acompanha. */
function paEsperadosCampo(o) {
  const k = o ? Object.keys(o).find(x => /^esperados_por_acaso_\d+(?:_\d+)?pct$/.test(x)) : null;
  if (!k) return null;
  const m = k.match(/_(\d+(?:_\d+)?)pct$/);
  return { k: k, alfa: Number(m[1].replace('_', '.')) / 100 };
}
function paEsperadosCorteTxt(o) {
  const c = paEsperadosCampo(o);
  return c ? ptPct(c.alfa * 100, 0) : 'um corte que o nome do campo não diz';
}
function paEsperadosVal(o) {
  if (!o) return null;
  const a = paAlfa();
  const c = paEsperadosCampo(o);
  if (c && (a === null || a === c.alfa)) {
    const v = o[c.k];
    return (v === undefined || v === null) ? null : Number(v);
  }
  const t = paEsperadosTestes(o);
  return t === null ? null : t * a;
}
function paEsperados(o, casas) {
  const v = paEsperadosVal(o);
  if (v === null) {
    return ptFalta('o ' + ptArquivoDado() + ' não traz o esperado por acaso nem os testes para recalculá-lo');
  }
  const a = paAlfa();
  const c = paEsperadosCampo(o);
  const txt = ptNum(v, casas === undefined ? 1 : casas);
  if (a === null) {
    return '<span title="' + esc('o α não está declarado em etapa_0.poder: este é o esperado a ' +
      paEsperadosCorteTxt(o) + ' que o ' + ptArquivoDado() + ' traz') + '">' + txt + '</span>';
  }
  if (!c || a !== c.alfa) {
    return '<span title="' + esc('recalculado na tela: o ' + ptArquivoDado() + ' só traz o esperado a ' +
      paEsperadosCorteTxt(o)) + '">' + txt + '</span>';
  }
  return txt;
}

/* (Até 14/09 havia aqui a régua de AUC do valor do elenco, que acendia no catálogo o indicador que
   acertava mais que o ranking de valor — o antigo Controle 1. Saiu com a decisão do dono: o valor do
   elenco é descrito na etapa 1, não é régua de linha.) */

/* Um número grande com legenda embaixo. Reaproveita `pt-controle` (caixa com fundo e borda,
   que já existe) em vez de pedir classe nova. */
function paBloco(valor, legenda, cor) {
  return '<div class="pt-controle" style="padding:12px 14px">' +
    '<b style="font-size:25px;font-weight:800;letter-spacing:-.03em;line-height:1;' +
      'font-variant-numeric:tabular-nums;display:block' + (cor ? ';color:var(--' + cor + ')' : '') + '">' +
      valor + '</b>' +
    '<p class="pt-nota" style="margin-top:6px">' + legenda + '</p></div>';
}

/* O tamanho de uma diferença em palavra, com o LADO junto. ptTamanho devolve só a força
   ("grande"), e numa coluna de indicador o sinal é metade da informação: quem subiu tem mais
   ou tem menos disto? Abaixo de "quase nenhuma" o lado não é dito — dizer "a favor" de uma
   diferença que o próprio vocabulário chama de quase nenhuma seria afirmar mais que o dado. */
function paTamanhoComLado(d) {
  if (d === null || d === undefined || isNaN(Number(d))) return ptFalta('sem medida de diferença');
  const t = ptTamanho(d);
  const lado = t === 'quase nenhuma' ? '' : (Number(d) > 0 ? ', mais em quem subiu' : ', menos em quem subiu');
  return t + lado + ptTecnico('d ' + ptD(d));
}
/* O veredito curto de sorte com o p técnico ao lado, pelo vocabulário único da casca. Com um p
   só, abaixo do corte sai "pode ser sorte" (nunca "firme"); `opc` passa {unico:true} quando é um
   teste único declarado (q = p) e {nTestes:N} quando é um de N testes sem a conta dos N gravada. */
function paSorteCel(p, rot, opc) {
  if (p === null || p === undefined) return ptFalta('sem medida de acaso');
  const r = ptChaveSorte(p, null, opc || {});
  return esc(ptSorte(p, null, opc || {})) + ptTecnico((rot || 'p') + ' ' + ptPv(p) + (r.nota ? ' · ' + esc(r.nota) : ''));
}

/* ================= ETAPA 0 — o que está sendo medido ================= */

function ptEtapa0(alvo, dEtapa) {
  /* As contagens de faixa e o poder moram em caminhos diferentes na aba de pontos (o universo
     das 80 temporadas, o poder por universo). A casca traduz o caminho da Protótipo para o do
     dado ativo (ptLer/ptCampo); na Protótipo, o caminho é o mesmo e nada muda. */
  const dd = ptDado(alvo);
  const e0 = c => ptLer('etapa_0.' + c, dd);
  const d = Object.assign({}, dEtapa, {
    linhas_no_arquivo: e0('linhas_no_arquivo'), linhas_completas: e0('linhas_completas'),
    sobe: e0('sobe'), meio: e0('meio'), cai: e0('cai'),
  });
  const cAno = f => ptCampo('etapa_0.por_ano', f, dd);
  const anos = (d.por_ano || []).map(a => Object.assign({}, a, { sobe: a[cAno('sobe')], meio: a[cAno('meio')], cai: a[cAno('cai')] }));
  const fora = anos.filter(a => !a.entra_nas_medias);
  const nFora = fora.reduce((s, a) => s + a.n, 0);
  const naoEntram = d.linhas_no_arquivo - d.linhas_completas;

  /* A frase de abertura é montada, não escrita: quantas linhas saíram das médias, quais anos
     são esses e em que rodada eles pararam. No dia em que 2026 fechar, o ano sai daqui
     sozinho e a frase deixa de existir — que é exatamente o que tem que acontecer. */
  const abertura =
    '<p class="pt-nota">O estudo olha <b>' + paQuantos(d.linhas_no_arquivo, 'temporada', 'temporadas') +
    '</b> de clubes da Série B. Entram na conta <b>' + ptInt(d.linhas_completas) + '</b>: <b>' + ptInt(d.sobe) +
    '</b> que subiram, <b>' + ptInt(d.meio) + '</b> que ficaram no meio da tabela e <b>' + ptInt(d.cai) +
    '</b> que caíram. Quem subiu é ' + ptPct(d.sobe / d.linhas_completas * 100, 0) + ' do que se compara. ' +
    (naoEntram > 0
      ? 'As outras <b>' + ptInt(naoEntram) + '</b> ficam de fora: ' +
        /* "parou na rodada" dizia que o campeonato acabou ali; o dado só diz quantas rodadas o
           arquivo tem daquele ano. Cada ano fora da conta com as suas rodadas. */
        (fora.length ? 'são o campeonato de ' + fora.map(a => ptAno(a.ano) + ' (' + ptInt(a.J) + ' de ' +
            ptInt(d.rodadas_completa) + ' rodadas no arquivo)').join(' e ') +
          '. Campeonato pela metade não entra em conta nenhuma, porque é outro campeonato, mais curto.'
          : ptFalta('o ' + ptArquivoDado() + ' não diz quais linhas ficaram de fora das médias')) +
        (nFora !== naoEntram
          ? ' ' + paCinza('atenção: a soma dos anos fora da conta (' + ptInt(nFora) +
              ') não fecha com a diferença entre as duas contagens') : '')
      : '') + '</p>';

  /* O ano em andamento em cinza, com as rodadas escritas ao lado — pedido explícito da
     seção 10. Cinza aqui não é decoração: é o aviso de que aquela linha existe no arquivo e
     não existe em nenhum número desta aba. */
  const tabAnos = ptTabela({
    id: 'ptEt-0-anos',
    ordem: { col: 'ano', dir: 'asc' },
    colunas: [
      { k: 'ano', rot: 'ano', fmt: (v, l) => l.entra_nas_medias ? ptAno(v) : paCinza(ptAno(v), 'fora da conta') },
      { k: 'n', rot: 'clubes', casas: 0 },
      { k: 'J', rot: 'rodadas', fmt: (v, l) => l.entra_nas_medias ? ptInt(v)
          : paCinza(ptInt(v) + ' de ' + ptInt(d.rodadas_completa), 'campeonato em andamento') },
      { k: 'sobe', rot: 'subiram', casas: 0 },
      { k: 'meio', rot: 'meio da tabela', casas: 0 },
      { k: 'cai', rot: 'caíram', casas: 0 },
      { k: 'entra_nas_medias', rot: 'entra na conta?', tipo: 'texto',
        fmt: (v, l) => v ? 'sim' : paCinza('não — ' + ptInt(l.J) + ' de ' + ptInt(d.rodadas_completa) +
          ' rodadas', 'não entra em conta nenhuma') },
    ],
    linhas: anos,
  });

  /* Poder: o menor efeito que este desenho conseguiria ver. A barra é lida ao contrário do
     habitual — quanto MENOR, melhor —, e por isso a lista vem em ordem crescente e o texto
     diz o que a barra significa antes de o olho concluir sozinho que barra curta é ruim.
     O valor da barra é o tamanho em palavra (ptTamanho): "grande" é o que o leitor precisa
     ouvir — só diferença grande aparece com 16 que subiram. O d mínimo fica em ptTecnico. */
  const pod = {};
  ['d_minimo_16x16', 'd_minimo_16x48', 'd_minimo_16x64', 'd_minimo_16x16_bonferroni',
    'testes_na_correcao_bonferroni', 'poder'].forEach(k => { pod[k] = e0('poder.' + k); });
  const recortes = [
    ['d_minimo_16x16', 'quem subiu contra os ' + ptInt(d.cai) + ' que caíram', ''],
    ['d_minimo_16x48', 'quem subiu contra os ' + ptInt(d.meio) + ' do meio', ''],
    ['d_minimo_16x64', 'quem subiu contra os outros ' + ptInt(d.meio + d.cai), 'o meio e quem caiu, juntos'],
    ['d_minimo_16x16_bonferroni', 'quem subiu contra os ' + ptInt(d.cai) + ' que caíram, com desconto',
      'com o desconto de ter testado ' + ptInt(pod.testes_na_correcao_bonferroni) + ' coisas de uma vez'],
  ].filter(r => pod[r[0]] !== undefined && pod[r[0]] !== null)
   .sort((a, b) => pod[a[0]] - pod[b[0]]);
  const maxD = recortes.length ? Math.max.apply(null, recortes.map(r => pod[r[0]])) : 1;
  /* O rótulo NÃO é ptTamanho: aqui o número é um LIMITE, não um resultado. "média" sozinho numa
     barra se lê como "a diferença foi média", e 0,793 cai na faixa média a 0,007 do grande —
     dizer "média ou maior" prometeria ver diferenças médias que esta amostra não vê. O limite
     é dito pela faixa em que ele cai e por qual das duas pontas da faixa está mais perto; as
     pontas saem de PT_FAIXAS_D, a mesma régua do ptTamanho. */
  const paLimite = v => {
    const n = Math.abs(Number(v));
    const f = PT_FAIXAS_D.slice().sort((a, b) => b[0] - a[0]);
    const i = f.findIndex(x => n >= x[0]);
    if (i <= 0) return 'a conta só vê diferença ' + f[0][1];
    const baixo = f[i][0], alto = f[i - 1][0];
    return (n - baixo) > (alto - n)
      ? 'a conta só vê diferença perto de ' + f[i - 1][1] + ' ou ' + f[i - 1][1]
      : 'a conta só vê diferença ' + f[i][1] + ' ou maior';
  };
  const barrasPoder = recortes.map(r => ptBarra(pod[r[0]], maxD, {
    rot: r[1], texto: paLimite(pod[r[0]]), cor: 'baixo',
    extra: (r[2] ? esc(r[2]) : '') + ptTecnico('d mínimo ' + ptNum(pod[r[0]], 2) +
      (r[0].indexOf('bonferroni') >= 0 ? ' · Bonferroni' : '')),
  })).join('');
  const menorD = recortes.length ? Math.abs(Number(pod[recortes[0][0]])) : null;
  const faixaMedia = PT_FAIXAS_D.find(f => f[1] === 'média');

  /* O n dos subgrupos não é uma opinião: quando a tipologia da etapa 8 já estiver no arquivo de dados,
     o menor grupo é lido de lá. Se ela ainda não estiver, a tela diz que não está — e não
     inventa um número de exemplo. */
  const tip = (((dd || {}).etapa_8 || {}).tipologia || {});
  const grupos = tip.grupos || null;
  const menorGrupo = grupos && grupos.length ? Math.min.apply(null, grupos.map(g => g.n)) : null;

  const cardPoder = ptCard('O que esse tamanho deixa ver, e o que não deixa',
    paQuantos(d.linhas_completas, 'temporada de clube na conta', 'temporadas de clube na conta'),
    '<p class="pt-nota">Com <b>' + ptInt(d.sobe) + '</b> times que subiram, ' +
      (recortes.length
        ? '<b>' + paLimite(pod[recortes[0][0]]).replace(/^a conta /, 'a conta, no melhor caso, ') + '</b>' +
          (faixaMedia && menorD !== null && menorD > faixaMedia[0]
            ? ' — uma diferença média passaria despercebida' : '') + '. ' +
          (pod.poder !== undefined && pod.poder !== null
            ? 'E mesmo nesse tamanho, em ' + ptInt(Math.round((1 - pod.poder) * 10)) +
              ' de cada 10 vezes a conta não veria a diferença. '
            : '')
        : ptFalta('o ' + ptArquivoDado() + ' não traz nenhum limite do que a amostra consegue ver') + ' ') +
      'Cada barra é o menor tamanho de diferença que a conta consegue enxergar numa comparação — quanto ' +
      'mais curta, melhor. Diferença menor que isso pode existir e esta amostra não veria.' +
      ptTecnico('poder ' + (pod.poder === undefined || pod.poder === null
        ? 'não declarado' : ptPct(pod.poder * 100, 0)) + ' · α ' + paAlfaTxt() + ' · d de Cohen mínimo') + '</p>' +
    barrasPoder +
    '<p class="pt-nota"><b>Quando esta aba disser "não separa", leia: "esta amostra não conseguiria ver".</b> ' +
      'Vale para cada linha reprovada das etapas seguintes.</p>' +
    '<p class="pt-nota">O que ela <b>não deixa</b>: partir em grupos menores. ' +
      (menorGrupo !== null
        ? 'Dividir os ' + ptInt(d.sobe) + ' que subiram nos ' + ptInt(grupos.length) +
          ' tipos de time da etapa 8 deixa o menor tipo com ' + paQuantos(menorGrupo, 'time', 'times') +
          ' — e, para esse tamanho, a conta nem calcula o que daria para ver. As barras acima são as únicas ' +
          'comparações com esse limite medido.'
        : ptFalta('a tipologia da etapa 8 ainda não está no ' + ptArquivoDado() + ' — sem ela não dá para dizer quantos ' +
          'sobram no menor grupo')) + '</p>');

  /* A independência que não existe (seção 6.6). Este bloco não é curiosidade: todo p de
     Welch e todo Benjamini-Hochberg das etapas 2 e 3 assume linhas independentes, e 80
     linhas de 40 clubes não são. A conferência da soma vai junto porque um mapa
     "vezes → quantos clubes" que não fecha com o total é erro de pipeline, e apareceria
     aqui antes de aparecer em qualquer outro lugar. */
  const ap = d.aparicoes_por_clube || {};
  const vezes = Object.keys(ap).sort((a, b) => Number(a) - Number(b));
  const somaClubes = vezes.reduce((s, k) => s + ap[k], 0);
  const somaLinhas = vezes.reduce((s, k) => s + ap[k] * Number(k), 0);
  const cardClubes = ptCard('O mesmo clube aparece mais de uma vez',
    paQuantos(d.clubes_distintos, 'clube diferente', 'clubes diferentes'),
    '<p class="pt-nota">' +
      (vezes.length
        ? 'As <b>' + ptInt(somaLinhas) + '</b> temporadas são de <b>' + ptInt(somaClubes) +
          '</b> clubes: ' + vezes.map(k => '<b>' + ptInt(ap[k]) + '</b> aparecem ' +
            (Number(k) === 1 ? 'uma vez' : ptInt(k) + ' vezes')).join(', ') + '. '
        : ptFalta('o ' + ptArquivoDado() + ' não traz o mapa de aparições por clube') + ' ') +
      (somaLinhas !== d.linhas_completas
        ? paCinza('a soma das aparições (' + ptInt(somaLinhas) + ') não bate com as temporadas na conta (' +
            ptInt(d.linhas_completas) + ')') + ' '
        : '') +
      'O mesmo clube volta com o mesmo estádio, a mesma diretoria e boa parte do mesmo elenco — então ' +
      'essas temporadas valem menos do que o mesmo número de clubes diferentes. As contas de sorte das ' +
      'etapas seguintes não sabem disso. ' +
      /* "cada diferença vem com uma margem" só é verdade se o catálogo trouxer a margem: confere no dado. */
      ((((dd || {}).etapa_2 || {}).linhas || []).some(l => Array.isArray(l.ic_bruto) && l.ic_bruto.length === 2)
        ? 'Por isso as diferenças do catálogo (etapa 2) vêm com uma <b>margem calculada sorteando clubes inteiros</b>, ' +
          'não temporadas soltas, e é essa margem que merece peso.' +
          ptTecnico('p assume independência · intervalo por bootstrap reamostrando clubes')
        : ptFalta('o ' + ptArquivoDado() + ' não traz, no catálogo, a margem calculada sorteando clubes inteiros')) + '</p>');

  /* Os indicadores declarados antes do primeiro teste. A soma das famílias é conferida
     contra o total declarado porque é essa pré-declaração que torna os p exibidos não
     decorativos: lista escolhida depois de ver o resultado transforma todos eles em enfeite. */
  const fam = d.indicadores_por_familia || {};
  const chavesFam = Object.keys(fam).sort((a, b) => fam[b] - fam[a]);
  const somaFam = chavesFam.reduce((s, k) => s + fam[k], 0);
  const maxFam = chavesFam.length ? Math.max.apply(null, chavesFam.map(k => fam[k])) : 1;
  const cardInd = ptCard('Os indicadores, escolhidos antes de olhar o resultado',
    paQuantos(d.indicadores_pre_declarados, 'indicador', 'indicadores') + ' · ' +
      paQuantos(chavesFam.length, 'grupo', 'grupos'),
    chavesFam.map(k => ptBarra(fam[k], maxFam, { rot: paRot(k), texto: ptInt(fam[k]) })).join('') +
    '<p class="pt-nota">A lista de ' + ptInt(d.indicadores_pre_declarados) + ' indicadores foi guardada ' +
      '<b>antes</b> da primeira conta. Isso importa: escolher o que medir depois de ver o resultado é ' +
      'garimpar, e aí qualquer achado desta aba vira enfeite. ' +
      (somaFam !== d.indicadores_pre_declarados
        ? paCinza('a soma dos grupos dá ' + ptInt(somaFam) + ' e o total declarado é ' +
            ptInt(d.indicadores_pre_declarados))
        : 'A soma dos grupos fecha com o total.') + '</p>');

  /* O funil, em SVG à mão — não há biblioteca de gráfico no projeto e não se deve adicionar
     uma. Aqui ele é resumo: cada degrau mostra quanto sobrou e quanto saiu, e o detalhe de
     POR QUE saiu é a etapa 12. A largura é proporcional ao primeiro degrau, então a queda do
     arquivo inteiro para o pool aparece como queda, e não como cinco barras parecidas. */
  const f = d.funil_candidatos || [];
  const n0 = f.length ? f[0].n : 0;
  const L = 400, ESQ = 150, ALT = 48;
  const funilSvg = !f.length ? ptFalta('o ' + ptArquivoDado() + ' não traz o funil de candidatos') :
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
    f.length ? 'de ' + ptInt(f[0].n) + ' atletas para ' + ptInt(f[f.length - 1].n) : '',
    funilSvg +
    /* A data da janela de contratos não é escrita aqui: ela é dado da etapa 12 e quem a
       imprime é quem tem a chave na mão. Este card diz o tamanho do degrau e manda para lá. */
    '<p class="pt-nota">Aqui é só quantos sobram em cada degrau. <b>Quem saiu e por quê</b>, e quanto da ' +
      'janela vence no mesmo mês, está na etapa do funil. ' +
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

/* ================= ETAPA 1 — o valor do elenco, descrito =================

   Esta etapa é a abertura do estudo, não uma nota de rodapé: quem lê encontra o valor do elenco
   ANTES de ver qualquer indicador de jogo. Desde 14/09 (decisão do dono) ele é DESCRIÇÃO, não
   régua: nenhum número da aba é descontado pelo valor do elenco, e nada aqui diz que um indicador
   "não serve" por não acertar mais que ele. O que fica escrito é a ressalva: elenco valioso tende
   a ter o que os números de jogo mostram, e o estudo não separa as duas coisas. */

/* ---- bloco novo: "dos 16, quantos estavam entre os mais caros?" ----

   O dono perguntou isso e deu um palpite (14 ou mais entre os 8 mais caros). O gerador grava a
   resposta em `curva_top_k.palpite_do_dono`, e a tela responde em voz alta a partir dali.
   Duas coisas que o bloco NÃO pode fazer:
     - desenhar o palpite como erro. Ele acertou a forma (o dinheiro concentra quase tudo; o
       acaso daria bem menos) e errou por dois times; a frase diz as duas metades;
     - tratar o degrau 8→9 como fronteira. Dois times em quatro anos são granulação de
       amostra; o `aviso_de_amostra` vai colado na resposta, não num rodapé.

   O número do palpite ("14") mora numa STRING (`afirmado: ">= 14"`) e no NOME de uma chave
   (`menor_k_com_14`). Ler as duas pela forma — e não por um 14 digitado aqui — é o que faz a
   frase continuar certa se o palpite mudar. */
function paPalpiteAlvo(pal) {
  const m = /(\d+)/.exec(String(pal.afirmado === undefined || pal.afirmado === null ? '' : pal.afirmado));
  return m ? Number(m[1]) : null;
}
function paMenorKCom(pal) {
  const k = Object.keys(pal).find(c => /^menor_k_com_\d+$/.test(c));
  return k ? { k: pal[k], alvo: Number(k.replace(/^menor_k_com_/, '')) } : null;
}

/* A curva, em SVG à mão. Eixo x: "até o k-ésimo mais caro do ano"; eixo y: quantos dos que
   subiram estavam ali. Três marcas: a linha cheia do medido, a tracejada do acaso e, no chão,
   quantos subiram EM cada posto (é ali que se vê o 7º e o 8º vazios e o 9º com dois). As
   verticais do top 4 e do top 8 saem do dado: o 4 do tamanho das listas de `top4_de_valor`,
   o 8 do `palpite_do_dono.k`. A horizontal do palpite sai do `afirmado`. */
function paCurvaSvg(c, marcas, alvoPalpite) {
  const pts = (c.curva || []).slice().sort((a, b) => a.k - b.k);
  if (!pts.length) return ptFalta('o bloco curva_top_k veio sem a lista `curva`');
  const cc = campo => ptCampo('etapa_1.curva_top_k.curva', campo);
  const total = c[ptCampo('etapa_1.curva_top_k', 'promovidos_total')];
  const E = 46, D = 18, T = 18, B = 46, VW = 700, VH = 300;
  const W = VW - E - D, H = VH - T - B;
  const K = pts[pts.length - 1].k;
  const x = k => E + (K > 1 ? (k - 1) / (K - 1) * W : W / 2);
  const y = v => T + H - (total ? v / total * H : 0);
  const passo = K > 1 ? W / (K - 1) : W;

  /* grade do eixo y em quartos do total de promovidos */
  let grade = '';
  for (let i = 0; i <= 4; i++) {
    const v = total * i / 4;
    grade += '<line x1="' + E + '" y1="' + y(v).toFixed(1) + '" x2="' + (E + W) + '" y2="' + y(v).toFixed(1) +
      '" stroke="var(--borda)" stroke-width="1"/>' +
      '<text x="' + (E - 8) + '" y="' + (y(v) + 4).toFixed(1) + '" text-anchor="end" ' +
      'style="fill:var(--tinta3);font-size:10.5px">' + ptInt(Math.round(v)) + '</text>';
  }
  const eixoX = pts.map(p => '<text x="' + x(p.k).toFixed(1) + '" y="' + (T + H + 16) + '" text-anchor="middle" ' +
    'style="fill:var(--tinta3);font-size:10px">' + paOrd(p.k) + '</text>').join('');

  /* os que subiram em cada posto, como barrinhas no chão */
  const cNoPosto = cc('promovidos_no_posto_k'), cAcum = cc('promovidos_acumulados');
  const barras = pts.map(p => p[cNoPosto] > 0
    ? '<rect x="' + (x(p.k) - passo * 0.22).toFixed(1) + '" y="' + y(p[cNoPosto]).toFixed(1) +
      '" width="' + (passo * 0.44).toFixed(1) + '" height="' + (T + H - y(p[cNoPosto])).toFixed(1) +
      '" fill="var(--pt-alto)" opacity=".22"><title>' + esc('Eram o ' + paOrd(p.k) + ' mais caro do ano: ' +
        paQuantos(p[cNoPosto], 'time que subiu', 'times que subiram')) + '</title></rect>'
    : '').join('');

  const verticais = marcas.map(m => '<line x1="' + x(m.k).toFixed(1) + '" y1="' + T + '" x2="' + x(m.k).toFixed(1) +
      '" y2="' + (T + H) + '" stroke="var(--tinta3)" stroke-dasharray="2 3"/>' +
    '<text x="' + (x(m.k) + 5).toFixed(1) + '" y="' + (T + 11) + '" style="fill:var(--tinta2);font-size:10.5px;font-weight:600">' +
      esc(m.rot) + '</text>').join('');

  const palpite = (alvoPalpite !== null && total)
    ? '<line x1="' + E + '" y1="' + y(alvoPalpite).toFixed(1) + '" x2="' + (E + W) + '" y2="' + y(alvoPalpite).toFixed(1) +
      '" stroke="var(--pt-baixo)" stroke-dasharray="6 4" opacity=".75"/>' +
      '<text x="' + (E + W) + '" y="' + (y(alvoPalpite) - 5).toFixed(1) + '" text-anchor="end" ' +
      'style="fill:var(--pt-baixo);font-size:10.5px;font-weight:600">o palpite: ' + ptInt(alvoPalpite) + '</text>'
    : '';

  const linha = campo => pts.map((p, i) => (i ? 'L' : 'M') + x(p.k).toFixed(1) + ' ' + y(p[campo]).toFixed(1)).join(' ');
  const acaso = '<path d="' + linha('esperado_por_acaso') + '" fill="none" stroke="var(--tinta3)" stroke-width="2" stroke-dasharray="5 4"/>';
  const medido = '<path d="' + linha(cAcum) + '" fill="none" stroke="var(--pt-alto)" stroke-width="2.5"/>' +
    pts.map(p => '<circle cx="' + x(p.k).toFixed(1) + '" cy="' + y(p[cAcum]).toFixed(1) + '" r="3.6" ' +
      'fill="var(--pt-alto)"><title>' + esc('Até o ' + paOrd(p.k) + ' mais caro do ano: ' + ptInt(p[cAcum]) +
        ' dos ' + ptInt(total) + ' que subiram (ao acaso seriam ' + ptNum(p.esperado_por_acaso, 1) + '). Desses ' +
        ptInt(p.clubes_no_top_k) + ' times, ' + ptPct(p[cc('taxa_de_subida_no_top_k_pct')], 0) + ' subiram.') +
      '</title></circle>').join('');

  /* rótulo do valor medido nas verticais marcadas — é o número que a frase do palpite cita */
  const rotulos = marcas.map(m => {
    const p = pts.find(q => q.k === m.k);
    return p ? '<text x="' + (x(p.k) - 6).toFixed(1) + '" y="' + (y(p[cAcum]) - 8).toFixed(1) +
      '" text-anchor="end" style="fill:var(--tinta);font-size:12px;font-weight:800">' + ptInt(p[cAcum]) + '</text>' : '';
  }).join('');

  return '<svg viewBox="0 0 ' + VW + ' ' + VH + '" style="width:100%;height:auto" role="img" ' +
      'aria-label="quantos dos que subiram estavam entre os k mais caros do ano, contra o acaso">' +
    grade + barras + verticais + palpite + acaso + medido + rotulos + eixoX +
    '<text x="' + (E + W / 2) + '" y="' + (VH - 6) + '" text-anchor="middle" style="fill:var(--tinta3);font-size:10.5px">' +
      'até o Nº elenco mais caro do seu ano</text>' +
    '</svg>' +
    '<p class="pt-nota" style="margin-top:2px">' +
      '<span style="color:var(--pt-alto);font-weight:800">━</span> quantos dos que subiram estavam ali · ' +
      '<span style="color:var(--tinta3);font-weight:800">╌</span> quantos estariam, se o dinheiro não importasse · ' +
      '<span style="color:var(--pt-alto);opacity:.45;font-weight:800">▮</span> quantos subiram exatamente naquela posição</p>';
}

function paCardCurva(e1) {
  const c = e1.curva_top_k;
  if (!c) {
    return ptFaltaBloco('Dos que subiram, quantos estavam entre os mais caros?',
      'o ' + ptArquivoDado() + ' não trouxe `etapa_1.curva_top_k` — o gerador não gravou o bloco nesta rodada, e sem ele a ' +
      'pergunta fica sem resposta nesta tela (os quatro elencos mais caros, logo abaixo, continuam valendo)');
  }
  /* O palpite do dono e o aviso do degrau existem só na Protótipo: na aba de pontos o mapa do
     próprio dado diz que foram removidos, e por quê. A tela escreve esse motivo, não a ausência muda. */
  const palRem = ptRemovida('etapa_1.curva_top_k.palpite_do_dono.k');
  const pal = palRem ? null : (c.palpite_do_dono || null);
  const total = c[ptCampo('etapa_1.curva_top_k', 'promovidos_total')];
  const nAnos = (c.anos || []).length;

  /* As verticais. O "4" sai do tamanho das listas do top-4 (dado de outro bloco da mesma
     etapa); o "8" sai do palpite. Se um deles faltar, a vertical simplesmente não é desenhada. */
  const t4 = ((ptLer('etapa_1.top4_de_valor') || {}).por_ano || [])[0];
  const cTop = ptCampo('etapa_1.top4_de_valor.por_ano', 'top4');
  const marcas = [];
  if (t4 && t4[cTop] && t4[cTop].length) marcas.push({ k: t4[cTop].length, rot: 'os ' + ptInt(t4[cTop].length) + ' mais caros' });
  if (pal && pal.k !== undefined && pal.k !== null && !marcas.some(m => m.k === pal.k)) {
    marcas.push({ k: pal.k, rot: 'os ' + ptInt(pal.k) + ' mais caros' });
  }
  const alvoPalpite = pal ? paPalpiteAlvo(pal) : null;

  /* A resposta ao palpite, em voz alta. */
  let resposta;
  if (!pal) {
    resposta = '<p class="pt-nota">' + ptFalta(palRem ? palRem.motivo : 'o bloco não trouxe `palpite_do_dono`') + '</p>';
  } else {
    const mk = paMenorKCom(pal);
    const faltou = alvoPalpite !== null && pal.medido !== null && pal.medido !== undefined ? alvoPalpite - pal.medido : null;
    resposta =
      '<p class="pt-nota" style="font-size:14px;color:var(--tinta)">' +
        'O palpite era: <b>' + (alvoPalpite !== null ? ptInt(alvoPalpite) + ' ou mais' : esc(String(pal.afirmado))) +
        '</b> dos ' + ptInt(total) + ' que subiram estariam entre os <b>' + ptInt(pal.k) + ' elencos mais caros</b> do ano. ' +
        (pal.confirma === true
          ? 'E foram <b>' + ptInt(pal.medido) + '</b>: o palpite se confirma.'
          : 'Foram <b>' + ptInt(pal.medido) + '</b>.' +
            (mk && mk.k !== null && mk.k !== undefined
              ? ' Os ' + ptInt(mk.alvo) + ' só aparecem quando se olha até o <b>' + paOrd(mk.k) + '</b> mais caro.'
              : '')) +
      '</p>' +
      '<p class="pt-nota">' +
        /* O palpite NÃO se confirma (`confirma: false`), e a frase abre por isso. Antes ela abria
           com "o palpite acertou a forma: o dinheiro concentra quase tudo" — "quase tudo" era
           adjetivo digitado, sem dado atrás, e mais forte que 12 de 16. */
        (pal.confirma === true ? '' :
          'O palpite não se confirma: foram <b>' + ptInt(pal.medido) + '</b>' +
          (alvoPalpite !== null ? ', não ' + ptInt(alvoPalpite) : '') +
          (faltou !== null && faltou > 0 ? ' — faltaram ' + paQuantos(faltou, 'time', 'times') : '') + '. ' +
          'Mas o dinheiro concentra muito: <b>' + ptInt(pal.medido) + ' de ' + ptInt(total) + '</b> estavam entre os ' +
          ptInt(pal.k) + ' mais caros do ano, quando o acaso daria <b>' + ptNum(pal.esperado_por_acaso_no_k, 1) + '</b>. ') +
        /* a pergunta do palpite é um teste só, escrito antes de olhar: q = p (vocabulário único) */
        'Concentração assim: ' + esc(ptSorte(pal.p_exato_do_medido, null, { unico: true })) + ' — ' + ptAcaso(pal.p_exato_do_medido) + '.' +
        ptTecnico('P(≥ ' + ptInt(pal.medido) + ') exata = ' + ptPv(pal.p_exato_do_medido) +
          (c.modelo_do_acaso ? ' · ' + esc(c.modelo_do_acaso) : '')) +
      '</p>';
  }

  /* O aviso do degrau, colado na resposta. */
  const avRem = ptRemovida('etapa_1.curva_top_k.aviso_de_amostra.promovidos_no_posto');
  const av = c.aviso_de_amostra || null;
  /* Os dois postos do degrau saem do NOME da chave (`degrau_k8_para_k9` → do 8º para o 9º), não
     do palpite + 1: se o gerador gravar outro degrau, a frase fala dos postos que ele mediu. */
  const degrau = (() => {
    const k = av ? Object.keys(av).find(x => /^degrau_k\d+_para_k\d+$/.test(x)) : null;
    if (!k || av[k] === null || av[k] === undefined) return null;
    const m = k.match(/^degrau_k(\d+)_para_k(\d+)$/);
    return { de: Number(m[1]), para: Number(m[2]), v: av[k] };
  })();
  const aviso = avRem
    ? '<p class="pt-nota">' + ptFalta(avRem.motivo) + (av && av.leitura ? ptTecnico(esc(av.leitura)) : '') + '</p>'
    : !av
    ? '<p class="pt-nota">' + ptFalta('o bloco não trouxe `aviso_de_amostra` — sem ele a tela não tem como dizer se o ' +
        'salto entre um posto e outro é fronteira ou acaso da amostra, e por isso não afirma nenhum dos dois') + '</p>'
    : '<div class="pt-controle"><span class="pt-rot">Cuidado com o degrau</span>' +
        '<p class="pt-nota">Posição por posição: ' +
          (av.promovidos_no_posto || []).map(x => 'dos que eram o <b>' + paOrd(x.posto) + '</b> mais caro do ano, ' +
            (x.promovidos === 0 ? '<b>nenhum</b> subiu' : '<b>' + ptInt(x.promovidos) + '</b> ' +
              (x.promovidos === 1 ? 'subiu' : 'subiram'))).join(' · ') + '. ' +
          (degrau
            ? 'O salto do ' + paOrd(degrau.de) + ' para o ' + paOrd(degrau.para) + ' é de <b>' +
              paQuantos(degrau.v, 'time', 'times') + ' em ' + paQuantos(av.anos_na_amostra, 'ano', 'anos') + '</b>. '
            : ptFalta('o aviso não traz o degrau entre dois postos') + ' ') +
          /* "é pouco demais: é o tamanho da amostra" era veredito digitado. O que o dado sustenta é
             que um salto desse tamanho, nesse número de anos, não separa as duas leituras. */
          'Com tão poucos times e anos, a conta não tem como dizer se esse salto é uma linha de corte de orçamento ' +
          'ou só o tamanho da amostra; com mais anos, ele pode mudar de lugar ou sumir.' +
          ptTecnico(esc(av.leitura || '')) + '</p></div>';

  /* Os que subiram, com a posição de cada um no ranking de valor do seu ano. A frase de
     cima diz quem ficou FORA do corte do palpite, por nome — é o que o diretor vai
     perguntar em seguida ("quem foram os que subiram sem dinheiro?"). */
  const prom = (c[ptCampo('etapa_1.curva_top_k', 'promovidos')] || []).slice().sort((a, b) => a.ano - b.ano || a.posto_valor - b.posto_valor);
  const foraDoCorte = pal ? prom.filter(p => p.posto_valor > pal.k) : [];
  const fraseFora = !prom.length ? ptFalta('o bloco não trouxe a lista `promovidos`')
    : !pal ? ''
    : foraDoCorte.length === 0
      ? 'Todos os que subiram estavam entre os ' + ptInt(pal.k) + ' mais caros do ano.'
      : 'Subiram de fora dos ' + ptInt(pal.k) + ' mais caros: ' +
        foraDoCorte.map(p => '<b>' + esc(p.clube) + '</b> (' + paOrd(p.posto_valor) + ' em ' + ptAno(p.ano) + ')').join(', ') + '.';
  const tabProm = prom.length ? ptTabela({
    id: 'ptEt-1-promovidos',
    colunas: [
      { k: 'ano', rot: 'ano', fmt: v => ptAno(v) },
      { k: 'clube', rot: 'clube que subiu', tipo: 'texto' },
      { k: 'posto_valor', rot: 'posição no ranking de valor do ano',
        dica: '1º = o elenco mais caro daquele ano; empate fica com a melhor posição',
        fmt: v => paOrd(v) + (pal && v > pal.k ? ' · fora dos ' + ptInt(pal.k) + ' mais caros' : '') },
      { k: 'valor_eur', rot: 'valor do elenco', fmt: v => ptEur(v) },
    ],
    linhas: prom,
  }) : '';

  /* A conta posto a posto, ABERTA (pedido do dono, "tudo aberto, sem clicar"): antes ficava
     num `<details>` fechado, e o que está atrás de um clique não é lido numa reunião. */
  const cCurva = campo => ptCampo('etapa_1.curva_top_k.curva', campo);
  const tabCurva = (c.curva || []).length ? ptTabela({
    id: 'ptEt-1-curva',
    ordem: { col: 'k', dir: 'asc' },
    colunas: [
      { k: 'k', rot: 'olhando até o', fmt: v => paOrd(v) + ' mais caro' },
      { k: 'clubes_no_top_k', rot: 'times nesse grupo', casas: 0 },
      { k: cCurva('promovidos_acumulados'), rot: 'dos que subiram, estavam ali', fmt: v => ptInt(v) + ' de ' + ptInt(total) },
      { k: 'esperado_por_acaso', rot: 'ao acaso seriam', casas: 1 },
      { k: cCurva('taxa_de_subida_no_top_k_pct'), rot: 'desse grupo, subiram', fmt: v => ptPct(v, 0) },
      /* Só a posição do palpite foi perguntada antes de olhar (teste único); as outras são uma de
         várias posições olhadas, sem a conta de todas elas — por isso nunca saem "firme". */
      { k: 'p_exato_maior_igual', rot: 'é sorte?',
        fmt: (v, l) => pal && l.k === pal.k
          ? paSorteCel(v, 'p', { unico: true }) + ' ' + paCinza('a posição do palpite')
          : paSorteCel(v, 'p', { nTestes: (c.curva || []).length }) },
    ],
    linhas: c.curva,
  }) : '';

  return ptCard('Dos ' + (total === undefined || total === null ? 'que subiram' : ptInt(total) + ' que subiram') +
      ', quantos estavam entre os mais caros?',
    (nAnos ? paQuantos(nAnos, 'ano', 'anos') + ' · ' : '') +
      ((c.clubes_por_ano || []).length ? ptInt(c.clubes_por_ano[0]) + ' clubes por ano · ' : '') +
      'o 1º é o elenco mais caro do seu ano',
    resposta +
    paCurvaSvg(c, marcas, alvoPalpite) +
    aviso +
    '<p class="pt-nota">' + fraseFora + '</p>' +
    tabProm +
    (tabCurva ? '<p class="pt-nota"><b>A conta posição por posição.</b></p>' + tabCurva : ''));
}

/* ---- bloco novo: o valor do elenco por setor ----

   Duas perguntas separadas, e a tela não pode deixar uma contaminar a outra:
     1) ONDE está o dinheiro de quem sobe, fica e cai (euro típico e fatia do elenco);
     2) em que setor o dinheiro mais SEPARA quem sobe.
   A segunda tem duas armadilhas, e as duas estão gravadas no JSON:
     - a defesa foi escolhida depois de olhar os 4 setores. A tela só diz que a defesa separa
       MAIS que o elenco inteiro se `pode_afirmar_que_supera_o_total` for verdadeiro E o
       intervalo não cruzar zero. Hoje cruza: a frase diz que as duas contas empatam;
     - a fatia do elenco na defesa (a partição) foi testada em 4 setores, e o desconto de
       testar 4 coisas vai junto — hoje não sobra nenhum.

   Pedido do dono de 14/09: a mesma pergunta PONDERADA pela quantidade de jogadores de cada
   setor (`ponderado_por_jogador`) e os elencos abertos, time a time (`times`). Duas regras dele
   mandam no texto desta parte:
     - jogador sem preço no Transfermarkt é jogador de valor baixo ou nenhum, não dado faltando:
       ele conta como jogador, com valor zero, e nenhuma frase daqui diz que a soma fica "por
       baixo" por causa dele;
     - o desconto pelo valor do elenco saiu de vez (decisão dele, 14/09): a leitura por jogador só
       leva a conta de ter testado vários setores, dita pelo vocabulário único de sorte.
   Com o arquivo antigo (sem os dois blocos) o quadro desenha como antes e diz, numa linha, o que
   ainda não veio. */

/* Contagem mediana: a mediana de 16 temporadas pode cair entre dois times ("18,5 jogadores"), e
   escrever "18,5" como "19" seria inventar um time que não existe; o inteiro sai sem casa. */
function paContagem(n) {
  if (n === null || n === undefined || isNaN(Number(n))) return null;
  return ptNum(n, Number.isInteger(Number(n)) ? 0 : 1);
}

/* Uma comparação por jogador numa célula: a palavra de sorte pelo p e pelo q (a casca aplica os
   cortes do gerador), com "firme por pouco" — o único sufixo permitido, e só atrás de "firme" — quando
   o q fica na metade de cima do corte. Existe porque o q do goleiro fica colado no corte, e "firme"
   sozinho leria um 0,047 igual a um 0,0001. A linha de referência (o elenco inteiro) não entra na
   conta dos setores: vale como um teste só, declarado antes de medir. */
function paQCel(p, q, l) {
  if (q === null || q === undefined) {
    if (p === null || p === undefined) return ptFalta('sem medida de acaso');
    return esc(ptSorte(p, null, { unico: true })) + ptTecnico('p ' + ptPv(p)) +
      (l && l.motivo_sem_q ? ' ' + paCinza('fora da conta dos setores', l.motivo_sem_q) : '');
  }
  return ptSorteHtml(p, q, { porPouco: true });
}

/* Estado da tabela por time: as linhas montadas no desenho, por id de tabela (com o prefixo da
   aba), para o filtro de grupo refazer a tabela sem recalcular nada e sem perder a ordenação que
   o leitor escolheu. É refeito a cada desenho da etapa. */
const PA_TIMES = {};

function paCardSetor(e1) {
  const v = e1.valor_por_setor;
  if (!v) {
    return ptFaltaBloco('Onde está o dinheiro: goleiro, defesa, meio-campo e ataque',
      'o ' + ptArquivoDado() + ' não trouxe `etapa_1.valor_por_setor` — o gerador não gravou o bloco nesta rodada, e a tela ' +
      'não reconstrói a divisão por setor por conta própria');
  }
  const S = v.setores || [];
  const fx = v.faixas || {};
  const setoresSo = S.filter(s => s.setor !== 'total');
  const m = v.melhor_setor_contra_total || null;
  const destaque = m ? S.find(s => s.setor === m.setor) : null;

  /* A conta por jogador. A linha do elenco inteiro é a referência: é a que NÃO está na família
     dos testes (`familia_do_bh.setores`), e é assim que ela é achada — o nome dela no bloco novo
     ("elenco") não é o do bloco antigo ("total"), e casar os dois por nome digitado quebraria no
     dia em que um deles mudar. */
  const pj = v.ponderado_por_jogador || null;
  const pjS = pj && Array.isArray(pj.setores) ? pj.setores : [];
  const familia = pj && pj.familia_do_bh && Array.isArray(pj.familia_do_bh.setores) ? pj.familia_do_bh.setores : [];
  const pjRef = familia.length ? pjS.find(x => familia.indexOf(x.setor) < 0) || null : null;
  const pjFam = pjS.filter(x => x !== pjRef);
  const pjDe = setor => pjS.find(x => x.setor === setor) || (setor === 'total' ? pjRef : null);
  const nomeSetor = s => (pjRef && s === pjRef.setor) ? paSetor('total') : paSetor(s);
  const semPrecoRegra = pj && pj.sem_preco && pj.sem_preco.entra_na_conta_como ? pj.sem_preco.entra_na_conta_como : null;

  const fxRotN = f => ptFxRot(f, { forma: 'nome' });
  const val = (o, base, f) => (o ? o[ptK(base, f)] : undefined);
  const nulo = x => x === null || x === undefined;

  /* A frase falada: o time típico de cada faixa, no setor que o JSON aponta como o que mais
     distingue. Sem esse apontamento, a frase não escolhe setor por conta própria. Com a conta por
     jogador, o valor por jogador vai colado no valor do setor — é o pedido do dono: o total do
     setor sozinho esconde se é muito dinheiro em pouca gente ou pouco dinheiro espalhado. */
  let frase;
  if (!destaque) {
    frase = '<p class="pt-nota">' + ptFalta('o bloco não aponta o setor que mais distingue (`melhor_setor_contra_total`)') + '</p>';
  } else {
    const pd = pjDe(destaque.setor);
    const porJog = f => {
      const x = val(pd, 'eur_por_jogador_mediano_', f);
      return nulo(x) ? '' : ptEur(x) + ' por jogador';
    };
    const fatias = f => {
      const pv = val(pd, 'pct_do_valor_mediano_', f), pg = val(pd, 'pct_dos_jogadores_mediano_', f);
      return nulo(pv) || nulo(pg) ? null : '<b>' + ptPct(pv, 0) + '</b> do valor com <b>' + ptPct(pg, 0) + '</b> dos jogadores';
    };
    frase = '<p class="pt-nota" style="font-size:14px;color:var(--tinta)">' +
      'O time típico que subiu tinha <b>' + ptEur(destaque[ptK('eur_mediano_', 'sobe')]) + '</b> na ' + esc(paSetor(destaque.setor)) +
        (pd ? ', <b>' + porJog('sobe') + '</b>' : '') +
      '; o do meio da tabela, <b>' + ptEur(destaque[ptK('eur_mediano_', 'meio')]) + '</b>' + (pd ? ' (' + porJog('meio') + ')' : '') +
      '; o que caiu, <b>' + ptEur(destaque[ptK('eur_mediano_', 'cai')]) + '</b>' + (pd ? ' (' + porJog('cai') + ')' : '') + '.' +
      (pd && fatias('sobe') && fatias('cai')
        ? ' Na ' + esc(paSetor(destaque.setor)) + ' do time típico que subiu estavam ' + fatias('sobe') +
          ' do elenco; na do que caiu, ' + fatias('cai') + '.'
        : '') +
      '</p>';
  }

  const celEur = (s, faixa) => {
    const eur = s[ptK('eur_mediano_', faixa)], pct = s[ptK('pct_do_elenco_mediano_', faixa)];
    const p = pjDe(s.setor);
    const eurTxt = nulo(eur) ? ptFalta('sem valor no ' + ptArquivoDado()) : ptEur(eur);
    if (!p) {
      const fatia = nulo(pct)
        ? (s.setor === 'total' ? paCinza('o elenco todo', 'o total não tem fatia: é a soma dos setores')
            : ptFalta('sem fatia do elenco no ' + ptArquivoDado()))
        : ptPct(pct, 0) + ' do elenco';
      return eurTxt + ' · ' + fatia;
    }
    /* Três linhas: o dinheiro do setor, a gente do setor (com quantos não têm preço — que contam
       como jogador, regra do dono) e as duas fatias lado a lado. */
    const nL = paContagem(val(p, 'n_listados_mediano_', faixa)), nS = paContagem(val(p, 'n_sem_preco_mediano_', faixa));
    const epj = val(p, 'eur_por_jogador_mediano_', faixa);
    const pv = val(p, 'pct_do_valor_mediano_', faixa), pg = val(p, 'pct_dos_jogadores_mediano_', faixa);
    const linha2 = (nL === null ? ptFalta('sem a contagem de jogadores') : nL + ' jogadores' +
        (nS === null ? '' : ' <span class="pt-n">(' + nS + ' sem preço)</span>')) +
      ' · <b>' + (nulo(epj) ? ptFalta('sem valor por jogador') : ptEur(epj)) + '</b> por jogador';
    const linha3 = (nulo(pv) || nulo(pg))
      ? (p.motivo_sem_fatia ? paCinza('o elenco todo', p.motivo_sem_fatia) : ptFalta('sem as fatias no ' + ptArquivoDado()))
      : ptPct(pv, 0) + ' do valor com ' + ptPct(pg, 0) + ' dos jogadores';
    /* A linha de referência é o elenco inteiro, não um setor: dizer "no setor" nela confundia a
       leitura linha a linha. Ela é reconhecida pelo mesmo objeto de referência (`pjRef`), nunca
       pelo nome digitado. */
    return eurTxt + (p === pjRef ? ' no elenco' : ' no setor') + '<br>' + linha2 + '<br>' + linha3;
  };
  const tabDinheiro = S.length ? ptTabela({
    id: 'ptEt-1-setor-eur',
    colunas: [
      { k: 'setor', rot: 'setor', tipo: 'texto', fmt: s => esc(paSetor(s)) },
      { k: ptK('eur_mediano_', 'sobe'), rot: 'quem subiu' + (fx[ptFx('sobe')] ? ' (' + ptInt(fx[ptFx('sobe')]) + ')' : ''), fmt: (x, l) => celEur(l, 'sobe') },
      { k: ptK('eur_mediano_', 'meio'), rot: 'meio da tabela' + (fx[ptFx('meio')] ? ' (' + ptInt(fx[ptFx('meio')]) + ')' : ''), fmt: (x, l) => celEur(l, 'meio') },
      { k: ptK('eur_mediano_', 'cai'), rot: 'quem caiu' + (fx[ptFx('cai')] ? ' (' + ptInt(fx[ptFx('cai')]) + ')' : ''), fmt: (x, l) => celEur(l, 'cai') },
    ],
    linhas: S,
  }) : ptFalta('o bloco não trouxe a lista `setores`');

  /* A soma dos setores contra o total: se não fecha, a tabela está lendo colunas erradas, e
     isso aparece aqui antes de qualquer conclusão. A conferência da conta por jogador (a soma do
     euro por jogador bate com o valor do setor, temporada a temporada) também é dita, porque a
     tabela nova lê OUTRO arquivo (a lista de jogadores) e poderia divergir da antiga em silêncio. */
  const soma = v.soma_dos_setores_sobre_total || null;
  const conferencia = !soma ? ptFalta('o bloco não traz a conferência da soma dos setores')
    : (soma.min === 1 && soma.max === 1 && !soma.nan)
      ? 'Em toda temporada, os ' + ptInt(setoresSo.length) + ' setores somam exatamente o valor do elenco.'
      : paCinza('atenção: a soma dos setores não fecha com o total em todas as temporadas (de ' +
          ptNum(soma.min, 3) + ' a ' + ptNum(soma.max, 3) + ' do total, ' + ptInt(soma.nan) + ' sem valor)');
  const cf = pj && pj.conferencia ? pj.conferencia : null;
  const conferenciaJog = !pj ? ''
    : !cf ? ' ' + ptFalta('a conta por jogador não traz a própria conferência')
    : cf.bate === true
      ? ' A conta por jogador lê a lista de jogadores de cada temporada e bate com o valor de cada setor em ' +
        ptInt(cf.temporadas_conferidas) + ' de ' + ptInt(cf.temporadas_conferidas) + ' temporadas.' +
        ptTecnico(esc(cf.arquivo || '') + (cf.linhas_usadas !== undefined ? ' · ' + ptInt(cf.linhas_usadas) + ' jogadores-temporada' : ''))
      : ' ' + paCinza('atenção: a conta por jogador não bate com o valor dos setores em todas as temporadas');

  const notaPj = pj
    ? '<p class="pt-nota"><b>Quem conta como jogador:</b> ' + esc((pj.universo && pj.universo.jogadores) || '') +
        (semPrecoRegra ? '; o jogador sem preço entra como ' + esc(semPrecoRegra) : '') + '. ' +
        'As duas fatias são o time típico de cada grupo, cada uma por si: por isso não somam 100 entre os setores, ' +
        'e o valor por jogador típico não sai da divisão de uma pela outra.' +
        ptTecnico(esc((pj.definicoes && pj.definicoes.mediana) || '') +
          (pj.pedido_do_dono_em ? ' · análise pedida em ' + esc(pj.pedido_do_dono_em) +
            (pj.declarada_antes_de_medir === true ? ', regra declarada antes de medir' : '') : '')) + '</p>'
    : '<p class="pt-nota">' + ptFalta('o ' + ptArquivoDado() + ' desta aba ainda não traz a conta por jogador de cada setor ' +
        'nem os elencos time a time: aparecem quando o gerador gravar esses blocos') + '</p>';

  /* O que separa: setor por setor, a mesma medida de acerto do ranking de valor inteiro. */
  const posicoes = s => ['sobe', 'meio', 'cai'].map(f => s[ptK('posicao_media_no_ano_', f)])
    .map(x => nulo(x) ? '—' : ptNum(x, 1) + 'º').join(' · ');
  const tabSepara = S.length ? ptTabela({
    id: 'ptEt-1-setor-separa',
    ordem: { col: ptK('auc_{sobe}_x_resto'), dir: 'desc' },
    colunas: [
      { k: 'setor', rot: 'setor', tipo: 'texto', fmt: s => esc(paSetor(s)) },
      { k: ptK('posicao_media_no_ano_', 'sobe'), rot: 'posição média no ranking do ano · subiu · meio · caiu',
        dica: 'o 1º é o mais caro do ano naquele setor; média de cada grupo', fmt: (x, l) => posicoes(l) },
      { k: ptK('auc_{sobe}_x_resto'), rot: 'põe quem subiu na frente?',
        dica: 'pegue um time que subiu e um que não subiu e compare a posição de cada um no ranking do seu ano',
        fmt: x => ptAcerto(x) + ptTecnico('AUC ' + ptNum(x, 3)) },
      /* os setores são 4 testes sem a conta dos 4 gravada nesta tabela; o elenco inteiro não é um
         deles — é um teste só, declarado (o mesmo número da conclusão sobre o valor do elenco) */
      { k: ptK('p_{sobe}_x_{meio}'), rot: 'subiu × meio da tabela: é sorte?',
        fmt: (x, l) => l.setor === 'total'
          ? paSorteCel(x, 'p', { unico: true })
          : paSorteCel(x, 'p', { nTestes: setoresSo.length }) },
    ],
    linhas: S,
  }) : '';

  /* O que separa POR JOGADOR: a mesma forma da tabela de cima, agora com o desconto de ter
     testado os setores (a família está gravada no bloco) e as duas comparações. */
  const nTestes = familia.length;
  const kPm = ptK('p_{sobe}_x_{meio}'), kPc = ptK('p_{sobe}_x_{cai}');
  const kQm = ptK('q_bh_{sobe}_x_{meio}'), kQc = ptK('q_bh_{sobe}_x_{cai}');
  const tabSeparaJog = pjS.length ? ptTabela({
    id: 'ptEt-1-setor-separa-jog',
    ordem: { col: ptK('auc_{sobe}_x_resto'), dir: 'desc' },
    colunas: [
      { k: 'setor', rot: 'setor', tipo: 'texto',
        fmt: (s, l) => esc(nomeSetor(s)) + (l === pjRef ? ' ' + paCinza('referência', (pj.familia_do_bh || {}).fora_da_familia || '') : '') },
      { k: ptK('posicao_media_no_ano_', 'sobe'), rot: 'posição média no ranking do ano, pelo valor por jogador · subiu · meio · caiu',
        dica: pj.regra_da_posicao || '', fmt: (x, l) => posicoes(l) },
      { k: ptK('auc_{sobe}_x_resto'), rot: 'põe quem subiu na frente?', dica: pj.regra_do_auc || '',
        fmt: x => nulo(x) ? ptFalta('sem medida') : ptAcerto(x) + ptTecnico('AUC ' + ptNum(x, 3)) },
      { k: kQm, rot: 'subiu × meio: é firme, contando os ' + ptInt(nTestes) + ' setores?',
        dica: 'firme = passa na conta dos ' + ptInt(nTestes) + ' setores testados · pode ser sorte = separa sozinho e não passa nessa conta · ordena pelo q',
        fmt: (x, l) => paQCel(l[kPm], x, l) },
      { k: kQc, rot: 'subiu × caiu: é firme, contando os ' + ptInt(nTestes) + ' setores?',
        dica: 'a mesma pergunta contra quem caiu · ordena pelo q',
        fmt: (x, l) => paQCel(l[kPc], x, l) },
    ],
    linhas: pjS,
  }) : '';

  /* A leitura por jogador em frase, e o confronto com a do valor total. A comparação é de igual
     para igual: a tabela do valor total não tem a conta dos setores, então o confronto usa o p
     SOZINHO das duas (a mesma palavra de sorte, sem q); o que a conta dos setores muda vem numa
     frase à parte, sem virar "contradição". Todo teste de rótulo compara a CHAVE, nunca o texto. */
  let leituraJog = '';
  if (pjFam.length) {
    const lista = xs => xs.length ? xs.map(x => '<b>' + esc(nomeSetor(x.setor)) + '</b>').join(', ') : 'nenhum';
    const chave = (x, kp, kq) => ptChaveSorte(x[kp], x[kq]);
    const firmes = (kp, kq) => pjFam.filter(x => chave(x, kp, kq).chave === 'firme');
    const pm = firmes(kPm, kQm), pc = firmes(kPc, kQc);
    const porPouco = pjFam.filter(x => (chave(x, kPm, kQm).chave === 'firme' && chave(x, kPm, kQm).porPouco) ||
      (chave(x, kPc, kQc).chave === 'firme' && chave(x, kPc, kQc).porPouco));
    const sorteMeio = pjFam.filter(x => chave(x, kPm, kQm).chave === 'pode_ser_sorte');

    const topo = xs => xs.filter(x => !nulo(x[ptK('auc_{sobe}_x_resto')]))
      .sort((a, b) => b[ptK('auc_{sobe}_x_resto')] - a[ptK('auc_{sobe}_x_resto')])[0] || null;
    const topoEur = topo(setoresSo), topoJog = topo(pjFam);
    const soP = p => ptChaveSorte(p, null, { nTestes: nTestes }).chave;
    const diverge = paAlfa() === null ? [] : pjFam.map(x => {
      const e = S.find(s => s.setor === x.setor);
      if (!e) return null;
      const out = [];
      [['meio', kPm], ['cai', kPc]].forEach(par => {
        const pe = e[par[1]], pjv = x[par[1]];
        if (nulo(pe) || nulo(pjv) || soP(pe) === soP(pjv)) return;
        out.push('contra ' + ptFxRot(par[0], { forma: 'quem' }) + ', pelo valor total "' + esc(ptSorte(pe)) +
          '" e, por jogador, "' + esc(ptSorte(pjv)) + '"' + ptTecnico('p ' + ptPv(pe) + ' → ' + ptPv(pjv)));
      });
      return out.length ? '<b>' + esc(nomeSetor(x.setor)) + '</b>: ' + out.join('; ') : null;
    }).filter(Boolean);
    const topoMuda = topoEur && topoJog && topoEur.setor !== topoJog.setor;

    leituraJog = '<p class="pt-nota"><b>Contando por jogador.</b> O ranking do ano agora é pelo valor por jogador de cada ' +
        'setor. Contando os ' + ptInt(nTestes) + ' setores testados, são firmes contra o meio da tabela ' +
        ptInt(pm.length) + ' de ' + ptInt(nTestes) + ' (' + lista(pm) + ') e contra quem caiu ' + ptInt(pc.length) + ' de ' +
        ptInt(nTestes) + ' (' + lista(pc) + ').' +
        /* a lista abre a oração: a primeira letra do nome do setor sobe para maiúscula */
        (porPouco.length ? ' ' + lista(porPouco).replace(/^<b>(.)/, (_, c) => '<b>' + c.toUpperCase()) + ' ' +
          (porPouco.length === 1 ? 'é' : 'são') +
          ' firme' + (porPouco.length === 1 ? '' : 's') + ' por pouco: o número fica colado no corte, e um ano a mais pode tirar ' +
          (porPouco.length === 1 ? 'esse setor' : 'esses setores') + ' da lista.' : '') +
        (sorteMeio.length ? ' Contra o meio da tabela, ' + lista(sorteMeio) + ' separa sozinho, mas ' +
          '<b>pode ser sorte</b> contando os ' + ptInt(nTestes) + ' setores; a tabela do valor total, acima, não tem essa conta.' : '') +
        ptTecnico(esc((pj.familia_do_bh || {}).correcao || 'correção não declarada')) + '</p>' +
      '<p class="pt-nota"><b>Valor total × valor por jogador.</b> ' +
        (diverge.length || topoMuda
          ? '<b>As duas leituras não dizem a mesma coisa.</b> ' +
            (topoMuda ? 'Pelo valor total, o setor que mais põe quem subiu na frente é o ' + esc(nomeSetor(topoEur.setor)) +
              '; por jogador, é o ' + esc(nomeSetor(topoJog.setor)) + '. ' : '') +
            (diverge.length ? 'Olhando cada setor sozinho: ' + diverge.join(' · ') + '.' : '')
          : 'Setor por setor, as duas leituras apontam para o mesmo lado: o mesmo setor põe quem subiu mais na frente ' +
            (topoJog ? '(' + esc(nomeSetor(topoJog.setor)) + ')' : '') + ', e, olhando cada setor sozinho, nenhum muda de ' +
            'palavra de sorte de uma conta para a outra.') +
        ' A margem da diferença entre um setor e o elenco inteiro só foi medida no valor total, então, por jogador, a ' +
        'tela não diz se algum setor separa mais que o elenco todo.' +
        ptTecnico(topoEur && topoJog ? 'AUC subiu × resto, maior setor: ' + ptNum(topoEur[ptK('auc_{sobe}_x_resto')], 3) +
          ' no valor total, ' + ptNum(topoJog[ptK('auc_{sobe}_x_resto')], 3) + ' por jogador' : '') + '</p>';
  }

  /* Defesa contra o elenco inteiro. A regra do dono: só diz que supera se o intervalo gravado
     não cruza zero. As três condições vêm do JSON; nenhuma é decidida aqui. */
  let versus;
  if (!m) {
    versus = ptFalta('o bloco não traz `melhor_setor_contra_total` — sem a margem da diferença, a tela não ' +
      'compara o setor com o elenco inteiro');
  } else {
    const lo = paPares(m.ic95_lo), hi = paPares(m.ic95_hi);
    const temIc = lo !== null && hi !== null;
    const supera = m.pode_afirmar_que_supera_o_total === true && m.ic_cruza_zero === false &&
      temIc && Number(m.ic95_lo) > 0;
    const margem = temIc
      ? 'A margem dessa diferença vai de ' + (lo < 0 ? ptInt(-lo) + ' pares a menos' : ptInt(lo) + ' pares a mais') +
        ' a ' + (hi < 0 ? ptInt(-hi) + ' pares a menos' : ptInt(hi) + ' pares a mais') + ' em cada 100'
      : ptFalta('sem os limites da margem no ' + ptArquivoDado());
    versus =
      '<p class="pt-nota">Olhando só o valor da <b>' + esc(paSetor(m.setor)) + '</b>, a conta ' + ptAcerto(m.auc_setor) +
        '; olhando o elenco inteiro, ' + ptAcerto(m.auc_total) + '. ' +
        (m.escolhido_depois_de_olhar
          ? 'Mas a ' + esc(paSetor(m.setor)) + ' foi escolhida <b>depois de olhar os ' + ptInt(m.entre) +
            ' setores</b> — o melhor de ' + ptInt(m.entre) + ' sempre parece um pouco melhor do que é. '
          : '') +
        margem + (temIc ? (supera ? ', e não passa pelo zero. ' : ', e <b>passa pelo zero</b>. ') : '. ') +
        (supera
          ? '<b>Aqui dá para dizer: o valor da ' + esc(paSetor(m.setor)) + ' separa quem sobe melhor que o valor do elenco inteiro.</b>'
          : '<b>As duas contas empatam dentro do que ' + paQuantos(v.n, 'temporada deixa', 'temporadas deixam') +
            ' medir.</b> A ' + esc(paSetor(m.setor)) + ' é o setor em que o dinheiro mais distingue quem sobe, mas ' +
            'não dá para dizer que ela separa melhor que o elenco todo.') +
        ptTecnico('diferença de AUC ' + ptD(m.diferenca) + ' · IC95 ' + ptNum(m.ic95_lo, 3) + ' a ' + ptNum(m.ic95_hi, 3) +
          (m.replicas ? ' · ' + ptInt(m.replicas) + ' réplicas' : '') + (m.reamostragem ? ' · ' + esc(m.reamostragem) : '')) +
      '</p>';
  }

  /* A partição: não o euro, a FATIA do elenco em cada setor. Com o desconto dos testes. A versão
     ponderada troca a fatia do valor pelo índice (fatia do valor ÷ fatia de jogadores): um setor
     com muita gente tem fatia grande de valor sem que cada jogador valha mais. */
  const tabParticao = (id, blocoP, rotPosto, dicaPosto) => ptTabela({
    id: id,
    ordem: { col: 'p_bruto', dir: 'asc' },
    colunas: [
      { k: 'setor', rot: 'setor', tipo: 'texto', fmt: s => esc(paSetor(s)) },
      { k: ptK('posto_medio_', 'sobe'), rot: rotPosto, dica: dicaPosto,
        fmt: (x, l) => ['sobe', 'meio', 'cai'].map(f => l[ptK('posto_medio_', f)])
          .map(y => nulo(y) ? '—' : ptInt(Math.round(y))).join(' · ') },
      /* a chave gravada (`sorte`) manda; p e q vão no número técnico */
      { k: 'p_bruto', rot: 'é firme, contando os ' + ptInt(blocoP.testes) + ' setores?',
        dica: 'firme = passa na conta dos ' + ptInt(blocoP.testes) + ' setores testados · pode ser sorte = separa sozinho e não passa nessa conta · ordena pelo p',
        fmt: (x, l) => ptSorteHtml({ chave: l.sorte, p: l.p_bruto, q: l.q_bh }) },
    ],
    linhas: blocoP.setores,
  });
  const firmesP = xs => xs.filter(s => ptChaveSorte({ chave: s.sorte, p: s.p_bruto, q: s.q_bh }).chave === 'firme').length;
  const pa = v.particao || null;
  const pp = pj && pj.particao && (pj.particao.setores || []).length ? pj.particao : null;
  let particao;
  if (!pa || !(pa.setores || []).length) {
    particao = ptFaltaBloco('A fatia do elenco em cada setor',
      'o bloco não traz a `particao` — sem ela a tela não diz se quem sobe divide o elenco de outro jeito');
  } else {
    const ps = pa.setores;
    const sobram = firmesP(ps);
    const chaveDe = s => ptChaveSorte({ chave: s.sorte, p: s.p_bruto, q: s.q_bh }).chave;
    const mp = pa.menor_p ? ps.find(s => s.setor === pa.menor_p.setor) : null;
    const tabPart = tabParticao('ptEt-1-setor-fatia', pa, 'posição média, de 0 a 100 · subiu · meio · caiu',
      'posição no ranking daquele ano da fatia do elenco no setor: 100 = a maior fatia do ano');

    /* A versão por jogador, e o confronto com a de cima pelo p sozinho de cada setor (as duas têm
       o mesmo desconto de 4 testes, então o "sobram" também é comparado). */
    let blocoPond = '';
    if (pj && !pp) {
      blocoPond = '<p class="pt-nota">' + ptFalta('a conta por jogador não traz a partição ponderada') + '</p>';
    } else if (pp) {
      const sobramP = firmesP(pp.setores);
      /* compara a CHAVE gravada de cada conta, nunca o texto */
      const trocam = pp.setores.map(x => {
        const e = ps.find(s => s.setor === x.setor);
        if (!e || !chaveDe(e) || !chaveDe(x) || chaveDe(e) === chaveDe(x)) return null;
        return '<b>' + esc(paSetor(x.setor)) + '</b>: pela fatia do valor, "' + esc(ptSorte({ chave: e.sorte, p: e.p_bruto, q: e.q_bh })) +
          '"; pela fatia do valor dividida pela de jogadores, "' + esc(ptSorte({ chave: x.sorte, p: x.p_bruto, q: x.q_bh })) + '"' +
          ptTecnico('p ' + ptPv(e.p_bruto) + ' → ' + ptPv(x.p_bruto) + ' · q ' + ptPv(e.q_bh) + ' → ' + ptPv(x.q_bh));
      }).filter(Boolean);
      const mpp = pp.menor_p ? pp.setores.find(s => s.setor === pp.menor_p.setor) : null;
      blocoPond =
        '<p class="pt-nota" style="margin-top:14px"><b>Pesando pela quantidade de jogadores.</b> Em vez da fatia do valor, ' +
          'a fatia do valor dividida pela fatia de jogadores do setor: acima de 1, cada jogador do setor vale mais que o ' +
          'jogador médio do elenco. ' +
          (mpp ? 'O setor em que quem subiu mais se afasta do meio da tabela é a <b>' + esc(paSetor(mpp.setor)) + '</b>: ' +
            ptAcaso(mpp.p_bruto) + '. ' : '') +
          '<b>Contando os ' + ptInt(pp.testes) + ' setores testados, são firmes ' + ptInt(sobramP) + ' de ' + ptInt(pp.testes) + '</b>' +
          (sobramP === 0 ? ' — por jogador, nenhuma divisão do elenco separa quem subiu do meio da tabela de forma firme.' : '.') +
          ' ' + (trocam.length
            ? '<b>Aqui as duas contas não dizem a mesma coisa:</b> ' + trocam.join(' · ') + '.' +
              (sobram === sobramP ? ' Em número de firmes, as duas terminam iguais: ' + ptInt(sobramP) + ' nas duas.' : '')
            : 'Setor por setor, a palavra de sorte é a mesma nas duas contas.') +
          ptTecnico(esc(pp.o_que_e || '') + (pp.correcao ? ' · ' + esc(pp.correcao) : '')) + '</p>' +
        tabParticao('ptEt-1-setor-fatia-jog', pp, 'posição média, de 0 a 100 · subiu · meio · caiu',
          'posição no ranking daquele ano da fatia do valor dividida pela fatia de jogadores: 100 = a maior do ano');
    }

    particao = ptCard('E a fatia do elenco? Quem sobe põe mais dinheiro na defesa?',
      'a parte do elenco em cada setor, e não o euro' + (pp ? '; e a mesma parte pesada pela quantidade de jogadores' : ''),
      (mp
        ? '<p class="pt-nota">No ranking do ano de "quanto do elenco está na ' + esc(paSetor(mp.setor)) +
            '", quem subiu fica em média na posição <b>' + ptInt(Math.round(mp[ptK('posto_medio_', 'sobe')])) + '</b> de 100; o meio da ' +
            'tabela, na <b>' + ptInt(Math.round(mp[ptK('posto_medio_', 'meio')])) + '</b>. Olhada sozinha, ' +
            ptAcaso(mp.p_bruto) + '. Mas foram testados <b>' + ptInt(pa.testes) + '</b> setores, e quando se testa ' +
            'muita coisa, alguma dá certo por sorte. <b>Contando os ' + ptInt(pa.testes) + ', são firmes ' + ptInt(sobram) + ' de ' +
            ptInt(pa.testes) + '</b> — a fatia da ' + esc(paSetor(mp.setor)) + ': <b>' +
            esc(ptSorte({ chave: mp.sorte, p: mp.p_bruto, q: mp.q_bh })) + '</b>.' +
            ptTecnico((pa.correcao ? esc(pa.correcao) : 'correção não declarada') + ' · q da ' + esc(paSetor(mp.setor)) +
              ' ' + ptPv(mp.q_bh)) + '</p>'
        : '<p class="pt-nota">' + ptFalta('o bloco não aponta o setor de menor p') + '</p>') +
      tabPart + blocoPond);
  }

  return ptCard('Onde está o dinheiro: goleiro, defesa, meio-campo e ataque',
    'o valor típico de cada setor em quem subiu, ficou no meio e caiu' + (pj ? ', com quantos jogadores e quanto vale cada um' : ''),
    frase +
    tabDinheiro +
    '<p class="pt-nota">Cada número é o time <b>típico</b> daquele grupo naquele setor; por isso os setores ' +
      'somados não dão o elenco típico. ' + conferencia + conferenciaJog +
      ptTecnico('mediana por faixa' + (v.fonte ? ' · ' + esc(v.fonte) : '')) + '</p>' +
    notaPj +
    '<p class="pt-nota" style="margin-top:14px"><b>O que separa.</b> Pegue um time que subiu e um que não subiu e ' +
      'compare a posição de cada um no ranking de valor do seu ano, setor por setor. 50 em 100 seria cara ou coroa. ' +
      'Estes testes não descontam a sorte de ter testado vários setores.</p>' +
    tabSepara +
    versus +
    (pjS.length ? '<p class="pt-nota" style="margin-top:14px"><b>O que separa, por jogador.</b> A mesma pergunta, com o ' +
      'valor de cada setor dividido pelos seus jogadores, e agora com o desconto de ter testado ' + ptInt(nTestes) +
      ' setores. O elenco inteiro fica na tabela como referência e não entra no desconto.</p>' + tabSeparaJog + leituraJog : '')) +
    particao +
    paCardTimes(v, pj);
}

/* ---- os elencos abertos, time a time (pedido do dono, 14/09) ----

   Uma linha por temporada de clube, sem clicar, com filtro por grupo. As colunas por setor são
   três e curtas (valor · jogadores · por jogador), para as 80 linhas caberem na largura da tela
   sem rolar de lado; as fatias do setor vão no `title` da contagem de jogadores. A tabela rola
   para baixo dentro da própria caixa, com o cabeçalho grudado, porque 80 linhas empurrariam o
   resto da etapa para longe. Nenhum número é recalculado aqui: tudo vem de `times[]`. */
function paCardTimes(v, pj) {
  const titulo = 'Os elencos, time a time';
  const times = Array.isArray(v.times) ? v.times : null;
  if (!times || !times.length) {
    return pj || times
      ? ptFaltaBloco(titulo, 'o ' + ptArquivoDado() + ' não traz a lista de elencos por temporada')
      : '';   /* arquivo antigo: a linha discreta do quadro de cima já diz que os dois blocos não vieram */
  }
  const familia = pj && pj.familia_do_bh && Array.isArray(pj.familia_do_bh.setores) ? pj.familia_do_bh.setores : null;
  /* A ordem das colunas de setor é a da família gravada; sem ela, a do primeiro time com setores. */
  const setores = familia || Object.keys((times.find(t => t.setores) || {}).setores || {});
  const nulo = x => x === null || x === undefined;
  const fxs = ptFxLista();
  const fxDe = f => fxs.find(x => x.interna === f || x.chave === f) || null;

  const linhas = times.map(t => {
    const l = {
      ano: t.ano, clube: t.clube, _fx: (fxDe(t.faixa) || {}).interna || t.faixa,
      grupo: fxDe(t.faixa) ? fxDe(t.faixa).nome : t.faixa, posicao_final: t.posicao_final,
      el_eur: t.valor_elenco_eur, el_n: t.jogadores_listados, el_epj: t.eur_por_jogador_elenco, _t: t,
    };
    setores.forEach(s => {
      const o = (t.setores || {})[s] || null;
      l[s + '_eur'] = o ? o.eur : null;
      l[s + '_n'] = o ? o.n_listados : null;
      l[s + '_epj'] = o ? o.eur_por_jogador : null;
    });
    return l;
  });
  const cEur = x => nulo(x) ? ptFalta('sem valor') : ptEur(x);
  const colsSetor = [];
  setores.forEach(s => {
    const motivo = l => ((l._t.setores || {})[s] || {}).motivo_null || 'o ' + ptArquivoDado() + ' não traz este setor neste time';
    colsSetor.push(
      { k: s + '_eur', rot: paSetor(s) + ' · valor', fmt: (x, l) => nulo(x) ? ptFalta(motivo(l)) : ptEur(x) },
      { k: s + '_n', rot: paSetor(s) + ' · jogadores', fmt: (x, l) => {
          const o = (l._t.setores || {})[s];
          if (!o || nulo(x)) return ptFalta(motivo(l));
          const dica = ptInt(x) + ' jogadores' + (nulo(o.n_com_preco) ? '' : ', ' + ptInt(o.n_com_preco) + ' com preço') +
            (nulo(o.pct_do_valor) || nulo(o.pct_dos_jogadores) ? ''
              : ': ' + ptPct(o.pct_do_valor, 1) + ' do valor do elenco com ' + ptPct(o.pct_dos_jogadores, 1) + ' dos jogadores');
          return '<span title="' + esc(dica) + '">' + ptInt(x) + '</span>';
        } },
      { k: s + '_epj', rot: paSetor(s) + ' · por jogador', fmt: (x, l) => nulo(x) ? ptFalta(motivo(l)) : ptEur(x) });
  });
  const colunas = [
    { k: 'ano', rot: 'ano', fmt: x => ptAno(x) },
    { k: 'clube', rot: 'clube', tipo: 'texto' },
    { k: 'grupo', rot: 'grupo', tipo: 'texto' },
    { k: 'posicao_final', rot: 'posição final', fmt: x => paOrd(x) },
    { k: 'el_eur', rot: 'elenco · valor', fmt: cEur },
    { k: 'el_n', rot: 'elenco · jogadores', fmt: (x, l) => nulo(x) ? ptFalta('sem contagem')
        : '<span title="' + esc(ptInt(x) + ' jogadores' + (nulo(l._t.jogadores_com_preco) ? '' : ', ' + ptInt(l._t.jogadores_com_preco) +
          ' com preço e ' + ptInt(l._t.jogadores_sem_preco) + ' sem preço')) + '">' + ptInt(x) + '</span>' },
    { k: 'el_epj', rot: 'elenco · por jogador', fmt: cEur },
  ].concat(colsSetor);

  const id = 'ptEt-1-times';
  PA_TIMES[ptTabId(id)] = { linhas: linhas, colunas: colunas };
  const conta = f => f ? linhas.filter(l => l._fx === f).length : linhas.length;
  const chips = [{ f: '', rot: 'todos' }].concat(fxs.map(x => ({ f: x.interna, rot: x.nome })))
    .map(c => '<button type="button" class="pt-chip' + (c.f === '' ? ' on' : '') + (conta(c.f) === 0 ? ' zero' : '') +
      '" data-pa-times-fx="' + esc(c.f) + '"' + (conta(c.f) === 0 ? ' title="nenhum time deste grupo na lista"' : '') + '>' +
      esc(c.rot) + '<span class="pt-chip-n">' + ptInt(conta(c.f)) + '</span></button>').join('');
  const anos = linhas.map(l => l.ano).filter((a, i, xs) => !nulo(a) && xs.indexOf(a) === i).sort((a, b) => a - b);
  const fonte = pj && pj.conferencia && pj.conferencia.arquivo ? pj.conferencia.arquivo : null;

  return ptCard(titulo,
    paQuantos(linhas.length, 'temporada de clube', 'temporadas de clube') +
      (anos.length ? ' · ' + ptAno(anos[0]) + (anos.length > 1 ? ' a ' + ptAno(anos[anos.length - 1]) : '') : '') +
      ' · Transfermarkt, por temporada',
    '<p class="pt-nota" style="margin-top:0">De onde vem: a lista de jogadores de cada clube no Transfermarkt, temporada a ' +
      'temporada' + (fonte ? ptTecnico(esc(fonte)) : '') + '. ' +
      '<b>Quem conta como jogador:</b> ' + esc((pj && pj.universo && pj.universo.jogadores) || 'o arquivo não diz') +
      (pj && pj.sem_preco && pj.sem_preco.entra_na_conta_como ? '; o sem preço entra como ' + esc(pj.sem_preco.entra_na_conta_como) : '') +
      '. Valor por jogador = valor do setor dividido por todos os jogadores do setor. Passe o mouse na contagem de jogadores ' +
      'para ver a fatia do valor e a fatia de jogadores do setor naquele time.' +
      (pj && pj.regra ? ptTecnico(esc(pj.regra)) : '') + '</p>' +
    '<div class="pt-filtros" data-pa-times-filtros><span>mostrar:</span>' + chips +
      '<span class="pt-filtros-conta" data-pa-times-conta>' + paTimesConta(linhas.length, linhas.length) + '</span></div>' +
    '<div data-pa-times-caixa>' + paTimesTabela(id, linhas, colunas, { col: 'ano', dir: 'asc' }) + '</div>');
}
function paTimesConta(n, de) {
  return 'mostrando ' + ptInt(n) + ' de ' + ptInt(de) + ' temporadas · clique no cabeçalho para ordenar';
}
/* A caixa ganha a rolagem vertical do contrato (`pt-rola-vertical`) trocando a classe na saída do
   ptTabela, que não aceita classe de caixa. A ordem de antes é passada de volta, para o filtro não
   desfazer a ordenação que o leitor escolheu. */
function paTimesTabela(id, linhas, colunas, ordem, el) {
  return ptTabela({ id: id, el: el, ordem: ordem, colunas: colunas, linhas: linhas,
    vazio: 'nenhum time deste grupo na lista' })
    .replace('<div class="pt-tab-rola">', '<div class="pt-tab-rola pt-rola-vertical">');
}
function paTimesLigar(alvo) {
  const barra = alvo.querySelector('[data-pa-times-filtros]');
  const caixa = alvo.querySelector('[data-pa-times-caixa]');
  if (!barra || !caixa) return;
  const idTab = ptTabId('ptEt-1-times', alvo);
  barra.querySelectorAll('[data-pa-times-fx]').forEach(bt => {
    bt.onclick = () => {
      const est = PA_TIMES[idTab];
      if (!est) return;
      const f = bt.getAttribute('data-pa-times-fx');
      const filtradas = f ? est.linhas.filter(l => l._fx === f) : est.linhas;
      const antes = PT_TABELAS[idTab];
      caixa.innerHTML = paTimesTabela('ptEt-1-times', filtradas, est.colunas,
        antes && antes.ordem ? antes.ordem : { col: 'ano', dir: 'asc' }, alvo);
      ptLigarTabelas(caixa);
      barra.querySelectorAll('[data-pa-times-fx]').forEach(b => b.classList.toggle('on', b === bt));
      const c = barra.querySelector('[data-pa-times-conta]');
      if (c) c.textContent = paTimesConta(filtradas.length, est.linhas.length);
    };
  });
}

function ptEtapa1(alvo, d) {
  /* Faixas de orçamento: ordenadas pelo valor típico, da mais cara para a mais barata, para
     que o nome ("a mais cara") saia da ordem do dinheiro e não do número do quartil. */
  const cQ = f => ptCampo('etapa_1.quartis', f);
  const q = (d.quartis || []).map(x => Object.assign({}, x, { taxa_pct: x[cQ('taxa_pct')], subiram: x[cQ('subiram')] }))
    .sort((a, b) => b.valor_mediano_eur - a.valor_mediano_eur);
  const maxTaxa = q.length ? Math.max.apply(null, q.map(x => x.taxa_pct)) : 1;
  const caro = q.length ? q[0] : null;
  const barato = q.length ? q[q.length - 1] : null;
  const nomeFaixa = i => i === 0 ? 'a faixa mais cara' : i === q.length - 1 ? 'a mais barata' : 'a ' + ptInt(i + 1) + 'ª mais cara';

  /* A barra da faixa vai até a MAIOR taxa observada, não até 100%: a leitura aqui é a
     razão entre as faixas, e uma barra de 55% contra um eixo de 100% pareceria modesta
     justamente onde está o assunto inteiro da aba. O `extra` carrega o valor típico, para
     que "mais caro" tenha preço ao lado e não seja só um rótulo ordinal. */
  /* Uma casa decimal, como no topo e na etapa 14: arredondado a 0, "5%" e "5%" escondiam que a
     faixa mais barata subiu um pouco mais que a 3ª — as duas empatam no ruído, mas o mesmo
     número não pode aparecer de dois jeitos na mesma aba. */
  const barras = q.map((x, i) => ptBarra(x.taxa_pct, maxTaxa, {
    rot: nomeFaixa(i),
    texto: ptPct(x.taxa_pct),
    extra: '<b>' + ptInt(x.subiram) + '</b> de ' + ptInt(x.n) + ' subiram · elenco típico ' + ptEur(x.valor_mediano_eur) +
      ptTecnico(ptInt(x.quartil) + 'º quartil'),
  })).join('');

  const c = d.curva_top_k || null;
  const pal = c && !ptRemovida('etapa_1.curva_top_k.palpite_do_dono.k') ? c.palpite_do_dono : null;
  const abertura =
    '<p class="pt-nota" style="font-size:14px;color:var(--tinta)">Antes de qualquer número de jogo, o ' +
    '<b>dinheiro</b>. ' +
    (pal && pal.medido !== undefined && pal.medido !== null
      ? 'Dos <b>' + ptInt(c[ptCampo('etapa_1.curva_top_k', 'promovidos_total')]) + '</b> que subiram, <b>' + ptInt(pal.medido) + '</b> estavam entre os <b>' +
        ptInt(pal.k) + '</b> elencos mais caros do seu ano. '
      : '') +
    (caro && barato
      ? 'Dividindo as ' + paQuantos(d.n, 'temporada', 'temporadas') + ' em ' + ptInt(q.length) + ' faixas de orçamento, a mais cara sobe <b>' +
        ptPct(caro.taxa_pct) + '</b> das vezes e a mais barata, <b>' + ptPct(barato.taxa_pct) + '</b>' +
        (barato.taxa_pct > 0
          ? ' — <b>' + ptNum(caro.taxa_pct / barato.taxa_pct, 0) + ' vezes mais</b>. '
          : ' — a mais barata não subiu nenhuma vez. ')
      : ptFalta('o ' + ptArquivoDado() + ' não traz as faixas de valor') + ' ') +
    'Aqui ele é descrito; como ler o resto da aba com ele na cabeça está no fim desta etapa.</p>';

  /* Top-4 de valor: a regra mais burra possível ("aposte nos quatro elencos mais caros do
     ano") contra o acaso. O acerto por ano vai junto porque a média esconde que em um dos
     anos a regra acertou os quatro e em outro acertou um — e um modelo que acerta 4 e depois
     1 não é o mesmo que um que acerta 2,5 todo ano. */
  const t4 = ptLer('etapa_1.top4_de_valor', ptDado(alvo)) || {};
  const anosT4 = t4.por_ano || [];
  const cTop4 = ptCampo('etapa_1.top4_de_valor.por_ano', 'top4');
  const nTop = anosT4.length && anosT4[0][cTop4] ? anosT4[0][cTop4].length : null;
  const tabTop4 = anosT4.length ? ptTabela({
    id: 'ptEt-1-top4',
    ordem: { col: 'ano', dir: 'asc' },
    colunas: [
      { k: 'ano', rot: 'ano', fmt: v => ptAno(v) },
      { k: 'acertos', rot: 'desses, quantos subiram', casas: 0 },
      { k: cTop4, rot: 'os elencos mais caros do ano', tipo: 'texto',
        fmt: v => (v || []).map(esc).join(' · ') },
    ],
    linhas: anosT4,
  }) : ptFalta('o ' + ptArquivoDado() + ' não traz o acerto dos mais caros ano a ano');

  const emAndamento = (((ptDado(alvo) || {}).etapa_0 || {}).por_ano || []).filter(a => !a.entra_nas_medias)
    .map(a => ({ txt: ptAno(a.ano), completa: a.completa }));
  const cardTop4 = ptCard('A regra mais simples: apostar nos ' + (nTop ? ptInt(nTop) + ' ' : '') + 'elencos mais caros',
    (t4.acertos !== undefined ? ptInt(t4.acertos) + ' de ' + ptInt(t4.de) + ' acertos' : ''),
    paGrade(150,
      paBloco(ptInt(t4.acertos) + ' de ' + ptInt(t4.de), 'dos que subiram estavam entre os ' +
        (nTop ? ptInt(nTop) + ' ' : '') + 'mais caros do ano', 'pt-alto') +
      paBloco(ptNum(t4.esperado_por_acaso, 1), 'estariam ali se o dinheiro não importasse') +
      paBloco((t4.esperado_por_acaso ? ptNum(t4.acertos / t4.esperado_por_acaso, 1) + '×' : ptFalta('sem o esperado ao acaso no ' + ptArquivoDado())),
        'quantas vezes o dinheiro acerta mais que o sorteio')) +
    tabTop4,
    'Contados os <b>' + ptInt(anosT4.length) + '</b> campeonatos completos' +
    /* o motivo só é dito quando o próprio arquivo marca o ano como incompleto (`completa` falso) */
    (emAndamento.length
      ? '; ' + emAndamento.map(a => a.txt).join(' e ') + ' não ' + (emAndamento.length === 1 ? 'entra' : 'entram') +
        (emAndamento.every(a => a.completa === false) ? ', porque o campeonato ainda não terminou no arquivo.' : '.')
      : '.'));

  /* AUC do posto de valor. A escala vai de 0 a 1 e por isso o MEIO da barra é a moeda: um
     classificador que não sabe nada fica exatamente ali. Sem essa frase, uma barra de 0,828
     parece "boa" sem referência, e o leitor não tem como saber que o piso não é zero. */
  const aucCru = d.auc_posto_de_valor || {};
  const a = {};
  ['sobe_x_resto', 'sobe_x_meio', 'sobe_x_cai', 'loso_sobe_x_resto'].forEach(k => {
    a[k] = aucCru[ptCampo('etapa_1.auc_posto_de_valor', k)];
  });
  Object.keys(aucCru).forEach(k => { if (!(k in a)) a[k] = aucCru[k]; });
  const aucs = [
    ['sobe_x_resto', 'contra todos os outros', ''],
    ['sobe_x_meio', 'contra o meio da tabela', 'a comparação que importa · '],
    ['sobe_x_cai', 'contra quem caiu', 'fácil demais: time bom contra time ruim · '],
    ['loso_sobe_x_resto', 'num ano que a conta não viu', 'contra todos os outros · '],
  ].filter(x => a[x[0]] !== undefined && a[x[0]] !== null);
  const barrasAuc = aucs.map(x => ptBarra(a[x[0]], 1, {
    rot: x[1], texto: ptInt(paPares(a[x[0]])) + ' em 100', extra: esc(x[2]) + ptAcerto(a[x[0]]) +
      ptTecnico('AUC ' + ptNum(a[x[0]], 3) + (x[0].indexOf('loso') === 0 ? ' · deixando um ano de fora' : '')),
    hachura: x[0].indexOf('loso') === 0,
  })).join('');
  const queda = (a.sobe_x_resto !== undefined && a.loso_sobe_x_resto !== undefined)
    ? a.sobe_x_resto - a.loso_sobe_x_resto : null;

  const cardAuc = ptCard('Só com o ranking de valor, quanto se acerta?',
    'nenhum número de jogo entra nesta conta',
    '<p class="pt-nota" style="margin-top:0">Pegue um time que subiu e um que não subiu. Em quantos de cada 100 pares ' +
      'o mais bem colocado no ranking de valor do ano é o que subiu? <b>50 seria cara ou coroa</b>; 100, acerto sempre.</p>' +
    barrasAuc +
    '<p class="pt-nota">A barra listrada é a versão honesta: a conta foi refeita sem um ano e testada nesse ano que ' +
      'ela não viu ' +
      /* "perde" só quando a conta de fato perde: com a diferença zero ou a favor, a frase muda. */
      (queda !== null
        ? (paPares(queda) > 0
            ? '— e perde <b>' + paQuantos(paPares(queda), 'par', 'pares') + ' em cada 100</b> no caminho. É o preço de ' +
              'ter sido ajustada nos mesmos dados que julga.'
            : paPares(queda) < 0
              ? '— e ganha <b>' + paQuantos(-paPares(queda), 'par', 'pares') + ' em cada 100</b> no caminho, o que não é o ' +
                'esperado: diferença desse tamanho cabe na variação entre as temporadas.'
              : '— e acerta o mesmo tanto de pares no caminho.') +
          ptTecnico('queda de AUC ' + ptNum(queda, 3))
        : ptFalta('o ' + ptArquivoDado() + ' não traz a versão testada num ano que a conta não viu')) + '</p>' +
    '<p class="pt-nota">' +
      (ptPoucaBase(a) || ptFalta('o ' + ptArquivoDado() + ' não traz eventos por parâmetro')) + '</p>');

  /* Caliper: quantos dos que subiram têm, no MESMO ano, clubes de orçamento parecido. Até 14/09
     isto era um controle ("o achado que aguenta as duas formas merece ir para a mesa"); saiu como
     controle junto com o desconto pelo valor do elenco, e fica só como descrição do orçamento. */
  const cal = (d.caliper || []).slice().sort((x, y) => x.caliper - y.caliper);
  const tabCal = cal.length ? ptTabela({
    id: 'ptEt-1-caliper',
    colunas: [
      { k: 'caliper', rot: 'quão parecido é o orçamento',
        fmt: v => 'até ' + ptInt(paPares(v)) + '% do ranking de distância' + ptTecnico('caliper ±' + ptNum(v, 2)) },
      { k: ptCampo('etapa_1.caliper', 'subidas_com_controle'), rot: 'dos que subiram, acharam vizinho',
        fmt: (v, l) => ptInt(v) + ' de ' + ptInt(l.de) },
      { k: 'controles_medios', rot: 'vizinhos por time', casas: 1 },
    ],
    linhas: cal,
  }) : ptFalta('o ' + ptArquivoDado() + ' não traz a comparação com vizinhos de orçamento');

  const cob = d.cobertura_do_valor || {};
  const cardCal = ptCard('Quem subiu tinha vizinhos de orçamento parecido?',
    'cada time que subiu e os times do mesmo ano com valor de elenco parecido',
    tabCal +
    '<p class="pt-nota">Quanto mais exigente o "parecido", menos times acham vizinho. É só uma descrição do orçamento: ' +
      'nenhum número da aba passa por esse pareamento.</p>' +
    (cob.rho_cobertura_x_valor !== undefined
      ? '<p class="pt-nota">E nem todo jogador tem preço: o Transfermarkt dá valor a <b>' +
        ptPct(cob.pct_do_plantel_min, 0) + '</b> a <b>' + ptPct(cob.pct_do_plantel_max, 0) +
        '</b> do plantel, conforme a temporada (no típico, ' + ptPct(cob.pct_do_plantel_mediana, 0) + ', ou ' +
        ptInt(cob.tm_com_valor_mediana) + ' atletas por temporada). A parte do plantel com preço e o valor do elenco ' +
        ptJunto(cob.rho_cobertura_x_valor) + ' (' + esc(ptSorte(cob.p_cobertura_x_valor, null, { unico: true, objeto: 'relacao' })) + ')' +
        /* "time pobre tem mais jogador sem preço" era afirmado sempre que o ρ existia. Só vale com o ρ
           positivo e fora da sorte; com ρ negativo é o contrário, e com sorte possível não se diz nada.
           Até 14/09 a frase seguia com "então o valor do time barato está por baixo ... esta conta não
           sabe dizer". O dono decidiu em 14/09 que jogador sem preço no Transfermarkt é jogador de valor
           baixo ou nenhum, e não preço que faltou: ele entra na soma com o valor que tem, e a soma não
           fica por baixo por causa dele. Então a falta de preço deixou de ser um defeito da conta, e a
           frase só descreve de que lado ela está. */
        (paAlfa() !== null && cob.p_cobertura_x_valor !== null && cob.p_cobertura_x_valor !== undefined &&
          cob.p_cobertura_x_valor < paAlfa() && Math.abs(Number(cob.rho_cobertura_x_valor)) >= 0.1
          ? (Number(cob.rho_cobertura_x_valor) > 0
              ? ': <b>time mais barato tem mais jogador sem preço</b>'
              : ': <b>time mais caro tem mais jogador sem preço</b>') + '.'
          : ': não se viu, com segurança, que a falta de preço fique mais de um lado.') +
        ' Jogador sem preço lá é jogador de valor baixo ou nenhum (decisão do dono): ele conta como jogador do elenco, ' +
        'com valor zero, e a soma do elenco não fica por baixo por causa dele.' +
        ptTecnico('ρ cobertura × valor ' + ptNum(cob.rho_cobertura_x_valor, 3) + ' · ' + ptP(cob.p_cobertura_x_valor)) + '</p>'
      : ptFaltaBloco('Quantos jogadores têm preço', 'o ' + ptArquivoDado() + ' não traz o bloco `cobertura_do_valor`')));

  alvo.innerHTML =
    abertura +
    paCardCurva(d) +
    ptCard('Quanto sobe cada faixa de orçamento', paQuantos(d.n, 'temporada de clube', 'temporadas de clube') +
        ' divididas em ' + ptInt(q.length) + ' faixas iguais',
      barras,
      'As faixas são do valor somado do elenco na própria temporada, e a subida é daquele mesmo ano.') +
    cardTop4 +
    paCardSetor(d) +
    cardAuc +
    cardCal +
    /* A ressalva do elenco valioso (decisão do dono, 14/09): sem desconto, o que um número de jogo
       mostra pode vir junto com o dinheiro, e a tela diz isso em vez de descontar. */
    '<p class="pt-nota"><b>Como ler o resto da aba com isto na cabeça.</b> Nenhum número de jogo das etapas seguintes é ' +
      'descontado pelo valor do elenco. Quando um deles separa quem sobe, vale a ressalva: <b>elenco valioso tende a ter ' +
      'isso; o estudo não separa as duas coisas.</b> O valor do elenco aparece de novo, como descrição, ao lado de cada ' +
      'proposta de elenco.</p>';
  /* O filtro de grupo da tabela por time liga depois do innerHTML, porque os botões só existem aí. */
  paTimesLigar(alvo);
}

/* ================= ETAPA 2 — o catálogo dos indicadores =================

   293 linhas auditáveis. O estado do filtro vive fora da função porque a etapa se redesenha a
   cada clique e não pode esquecer onde o leitor estava.

   O estado é POR ABA (prefixo) e amarrado ao objeto de dado com que nasceu: com duas abas na
   página, o filtro de uma não pode filtrar a outra, e um render com dado novo não pode herdar
   "grupo = x" de um arquivo em que esse grupo nem existe. O gancho da casca apaga o estado cuja
   aba passou a ter outro dado. */
const PA_ET2 = {};
function paEt2Estado(el) {
  const pre = ptPrefixo(el), dado = ptDado(el);
  if (!PA_ET2[pre] || PA_ET2[pre].dado !== dado) {
    PA_ET2[pre] = { dado: dado, f: { pilar: '', familia: '', setor: '', porta: '', busca: '' } };
  }
  return PA_ET2[pre].f;
}
if (typeof ptAoTrocarDado === 'function') {
  ptAoTrocarDado(function () {
    Object.keys(PA_ET2).forEach(pre => {
      const aba = (typeof PT_ABAS !== 'undefined') ? PT_ABAS[pre] : null;
      if (!aba || aba.dado !== PA_ET2[pre].dado) delete PA_ET2[pre];
    });
  });
}

/* Chave de ordenação para coluna de FRASE. A casca ordena coluna `tipo:'texto'` como texto, e
   coluna de frase precisa ser `tipo:'texto'` para quebrar linha (senão a coluna fica na
   largura da frase inteira e a tabela volta a rolar para o lado). A frase na célula continua
   saindo do número; a ordem sai desta chave, que escreve o número com casas fixas e
   deslocado para ficar positivo, de modo que a ordem do texto é a ordem do número. Ausente
   continua ausente (vai para o fim). */
function paOrdemTxt(v, desloca) {
  if (v === null || v === undefined || v === '' || isNaN(Number(v))) return null;
  const s = (Number(v) + (desloca || 0)).toFixed(9);
  return s.length >= 24 ? s : new Array(24 - s.length + 1).join('0') + s;
}

/* Casas da média: TRÊS, as mesmas da tabela antes de compactar. Houve aqui uma regra que
   tirava casas dos números grandes para caber, e a conferência de 14/09 mediu o custo: 193
   números mudaram de forma e, em "metros por minuto com a bola" (144,446 · 143,628 · 143,557),
   o meio e quem caiu apareceram iguais (143,6 · 143,6) sem serem. Compactar era juntar colunas,
   não arredondar: o trio quebra linha dentro da célula, e é isso que segura a largura. */
const PA_CASAS_MEDIA = 3;

/* O rótulo da coluna de confiabilidade mora num lugar só: a etapa 4 cita essa coluna pelo nome, e
   quando o catálogo trocou "repete?" por "repete dentro do ano?" a citação ficou apontando para uma
   coluna que não existia mais. */
const PA_ROT_CONF = 'repete dentro do ano?';

/* O nome do indicador na linha. É o nome INTEIRO (ptNomeIndicador), não a forma curta de
   cabeçalho (ptNomeCurto): a forma curta tira a fase e o setor ("número de piques" sem "a cada
   30 min sem a bola"; "duelos aéreos ganhos" sem "da zaga"), e numa lista de 293 linhas isso
   troca uma medida pela outra. A curta também ainda traz nomes que a casca corrigiu porque
   afirmavam mais que a conta (a reconferência de 14/09 mediu "Velocidade máxima" e "Defesas").
   O que o glossário sabe da medida vai na dica; código, coluna, grupo e setor, no número
   pequeno. */
function paEt2NomeCel(l) {
  const nome = ptNomeIndicador(l.indicador);
  const curto = ptNomeCurto(l.indicador);
  const dica = [ptDicaMedida(l.indicador),
    curto && curto !== nome ? 'forma curta: ' + curto : '',
    l.nome ? 'nome na base de origem: ' + l.nome : ''].filter(Boolean).join(' · ');
  const tec = [l.indicador,
    l.coluna_csv && l.coluna_csv !== l.indicador ? 'coluna ' + l.coluna_csv : '',
    'grupo ' + paRot(l.familia) + (l.pilar && l.pilar !== l.familia ? ' · pilar ' + paRot(l.pilar) : ''),
    l.setor ? 'setor ' + l.setor : ''].filter(Boolean).join(' · ');
  return '<span title="' + esc(dica) + '">' + esc(nome) + '</span>' + ptTecnico(esc(tec));
}

/* Três números numa célula (quem subiu · meio · quem caiu), na ordem do cabeçalho. */
function paTrio(l, base, casas) {
  const ks = ptFxLista().map(f => ptK(base, f.interna));
  const vals = ks.map(k => l[k]);
  if (vals.every(v => v === null || v === undefined)) return ptFalta('sem valor no arquivo de dados');
  return vals.map(v => v === null || v === undefined ? '—'
    : '<span title="' + esc(ptNum(v, 6)) + '">' + ptNum(v, casas === undefined ? PA_CASAS_MEDIA : casas) + '</span>')
    .join(' · ');
}

/* A coluna do acerto. Só o número, dito em pares: até 14/09 ela acendia quem acertava mais que o
   ranking de valor do elenco (o antigo Controle 1); o valor do elenco agora é descrito na etapa 1 e
   não é régua de linha. */
function paEt2ColAuc() {
  const kAuc = ptK('auc_{SM}');
  return {
    k: 'auc_ordem',
    rot: 'acerto ' + ptFxRot('sobe', { forma: 'nome' }) + ' × ' + ptFxRot('meio', { forma: 'nome' }),
    tipo: 'texto',
    dica: 'pegue um que subiu e um do meio da tabela: em quantos de cada 100 pares este indicador põe quem subiu na frente? ' +
      '50 é cara ou coroa, e abaixo de 50 o indicador separa ao contrário · ordena pelo número técnico',
    fmt: (v, l) => paAcertoComLado(l[kAuc], l ? l.sinal : undefined),
  };
}

/* O que o catálogo compacto consome das colunas que o gerador lista em `colunas`. Coluna que o
   gerador listar e não estiver aqui entra no fim da tabela, sozinha, com o nome cru: chave nova
   no arquivo aparece feia, mas aparece. */
function paEt2Consumidas() {
  const fx = ['sobe', 'meio', 'cai'];
  return ['indicador', 'nome', 'coluna_csv', 'pilar', 'familia', 'setor', 'n', 'conf',
    'ic_bruto', 'rho_1T_2T', 'p_1T_2T', 'porta', 'porta_motivo', 'rod_controle', 'rod_motivo']
    .concat(fx.map(f => ptK('m_', f)), fx.map(f => ptK('r_', f)))
    .concat(['d_bruto_{SM}', 'p_bruto_{SM}', 'q_{SM}', 'sorte_{SM}', 'd_bruto_{SC}', 'p_bruto_{SC}', 'q_{SC}', 'sorte_{SC}',
      'd_rod_{SM}', 'p_rod_{SM}', 'd_rod_{SC}', 'p_rod_{SC}', 'auc_{SM}'].map(k => ptK(k)));
}

/* A margem do bootstrap em palavras: se ela inclui o zero ou não. */
function paMargem(ic) {
  if (!(ic && ic.length === 2)) return null;
  return ic[0] <= 0 && ic[1] >= 0 ? 'pode ser zero' : 'não chega a zero';
}

/* Uma comparação numa célula: tamanho e sentido, a palavra de sorte da CHAVE gravada (a casca
   aplica os cortes do gerador só quando a chave não vem) e p/q no número técnico. ptEfeito é o
   helper da casca; o "para mais" dele é sempre de quem subiu. */
function paEfeitoCel(l, d, p, q, s) {
  if (d === null || d === undefined) return ptFalta('sem medida de diferença');
  return ptEfeito(d, p, q, { chave: s || undefined });
}

function paEt2Colunas(d, rod) {
  const nS = ptFxRot('sobe', { forma: 'nome' }), nM = ptFxRot('meio', { forma: 'nome' }),
    nC = ptFxRot('cai', { forma: 'nome' });
  const trioRot = ptFxLista().map(f => f.nome).join(' · ');
  const K = k => ptK(k);
  const replicas = d && d.linhas && d.linhas.length && d.linhas[0].replicas ? ptInt(d.linhas[0].replicas) + ' sorteios' : '';
  const cols = [
    { k: 'nome_tela', rot: 'indicador', tipo: 'texto',
      dica: 'passe o mouse no nome para ver o que ele mede, a unidade e como aparece na base de origem · ' +
        'em letra miúda: o código, a coluna na base, o grupo (o desconto da sorte de testar muito é feito dentro dele) e o setor',
      fmt: (v, l) => paEt2NomeCel(l) },
    { k: 'n', rot: 'times', casas: 0, dica: 'quantas temporadas de clube têm este número' },
    { k: 'conf_ordem', rot: PA_ROT_CONF, tipo: 'texto',
      dica: 'a medida dá o mesmo resultado se medida duas vezes (rodadas ímpares contra pares)? de 0 (nada) a 1 (sempre) · só existe para indicador medido jogo a jogo',
      fmt: (v, l) => l.conf === null || l.conf === undefined ? ptFalta('não é medido jogo a jogo') : ptNum(l.conf, 2) },
    { k: 'm_ordem', rot: 'média · ' + trioRot, tipo: 'texto',
      dica: 'a média de cada grupo, na unidade do próprio indicador (a unidade está na dica do nome) · o número inteiro fica na dica de cada valor · ordena pela média de quem subiu',
      fmt: (v, l) => paTrio(l, 'm_') },
    { k: 'r_ordem', rot: 'posição no ano · ' + trioRot, tipo: 'texto',
      dica: 'posição média no ranking daquele ano, de 0 a 100 (não é o valor medido) · ordena pela posição de quem subiu',
      fmt: (v, l) => paTrio(l, 'r_', 1) },
    paEt2ColAuc(),
    { k: 'sm_ordem', rot: nS + ' × ' + nM + ': é firme?', tipo: 'texto',
      dica: 'a diferença, o lado (para mais = quem subiu tem mais) e a palavra de sorte: firme = passa na conta dos muitos testes ' +
        'parecidos do grupo · pode ser sorte = separa sozinho e não passa nessa conta · sem diferença clara = nem sozinho separa · ' +
        'embaixo, a margem calculada sorteando CLUBES inteiros' + (replicas ? ' (' + replicas + ')' : '') +
        ': se ela inclui o zero, a diferença pode não existir; o arquivo não declara o nível dessa margem · ordena pelo q (empate pelo p)',
      fmt: (v, l) => {
        const mb = paMargem(l.ic_bruto);
        const num = ic => ic && ic.length === 2 ? ptNum(ic[0], 2) + ' a ' + ptNum(ic[1], 2) : 'sem margem';
        return paEfeitoCel(l, l[K('d_bruto_{SM}')], l[K('p_bruto_{SM}')], l[K('q_{SM}')], l[K('sorte_{SM}')]) +
          '<br>' + (mb === null ? ptFalta('sem margem no arquivo de dados') : 'margem: ' + mb + ptTecnico('margem ' + num(l.ic_bruto)));
      } },
    { k: 'sc_ordem', rot: nS + ' × ' + nC + ': é firme?', tipo: 'texto',
      dica: 'a comparação fácil: time bom contra time ruim · a diferença, o lado e a palavra de sorte, do mesmo jeito da coluna ao lado · ordena pelo tamanho da diferença',
      fmt: (v, l) => paEfeitoCel(l, l[K('d_bruto_{SC}')], l[K('p_bruto_{SC}')], l[K('q_{SC}')], l[K('sorte_{SC}')]) },
  ];
  /* O desconto só do rodízio (15/09): nas médias físicas POR ATLETA, a mesma diferença entre times
     que rodaram o elenco parecido. Existe porque quem sobe usa MENOS gente, e toda média física por
     atleta carrega esse tamanho de elenco dentro. É uma conferência (continua ou some), não uma
     palavra de sorte: o gerador não grava a conta dos muitos testes para ela. O valor do elenco não
     é descontado. As duas comparações vão numa célula só; sem o campo no arquivo, a coluna não é
     desenhada e a nota ao pé da tabela escreve a ausência. */
  if (rod.length) {
    const cna = ptLer('etapa_1.controle_n_atletas') || {};
    cols.push({
      k: 'rod_ordem', rot: 'entre times que rodaram o elenco parecido', tipo: 'texto',
      dica: 'a diferença descontado só o número de jogadores com dado físico que o time usou (o rodízio), nas duas comparações · ' +
        'continua = ainda separa (p abaixo do corte) · some = deixa de separar' +
        (cna.entra_como ? ' · ' + cna.entra_como : '') + ' · ordena pelo p de ' + nS + ' × ' + nM,
      fmt: (v, l) => rod.map(c => {
        const dv = l[c.d], pv = l[c.p];
        const corpo = (dv === undefined || dv === null)
          ? (/não é média por atleta/.test(String(l.rod_motivo || ''))
              ? paCinza('não se aplica: esta medida não é média por jogador', l.rod_motivo)
              : ptFalta(l.rod_motivo || 'este desconto não foi calculado para este indicador'))
          : (() => {
              const continua = paAlfa() !== null && pv !== null && pv !== undefined && pv < paAlfa();
              return '<span class="pt-liq' + (continua ? ' vive' : '') + '"><b>' + (continua ? 'continua' : 'some') + '</b> · ' +
                paTamanhoComLado(dv) + ptTecnico(ptP(pv) + (l.rod_controle ? ' · ' + esc(l.rod_controle) : '')) + '</span>';
            })();
        return '<b>' + esc(c.rot) + ':</b> ' + corpo;
      }).join('<br>'),
    });
  }
  /* Colunas que o gerador listou e o catálogo compacto não consome. Antes cada uma virava uma
     coluna crua no fim, e na aba de pontos a `consequencia_do_resultado` empurrava a tabela
     30 px para fora da caixa a 1.785 px. Agora entram DENTRO da célula do selo, uma por linha,
     com o nome cru: chave nova no arquivo continua aparecendo feia, mas aparece. */
  const usadas = paEt2Consumidas();
  const extras = (d.colunas || []).filter(k => usadas.indexOf(k) < 0);
  const extrasCel = l => extras.map(k => {
    const v = l[k];
    return '<br><b>' + esc(String(k).replace(/_/g, ' ')) + ':</b> ' +
      (v === null || v === undefined ? ptFalta('sem valor nesta linha')
        : typeof v === 'boolean' ? (v ? 'sim' : 'não')
        : typeof v === 'number' ? ptNum(v, 3) : esc(String(v)));
  }).join('');
  cols.push(
    { k: 't12_ordem', rot: 'o 1º turno prevê o 2º?', tipo: 'texto',
      dica: 'o número do 1º turno anda junto com os pontos do 2º, descontados os pontos do 1º turno? é o outro caminho que a porta A pede · ' +
        'só existe para indicador medido jogo a jogo · ordena pelo ρ parcial',
      fmt: (v, l) => l.rho_1T_2T === null || l.rho_1T_2T === undefined
        ? ptFalta('não é medido jogo a jogo')
        : ptJunto(l.rho_1T_2T) + ptTecnico('ρ parcial ' + ptNum(l.rho_1T_2T, 3) +
            (l.p_1T_2T === null || l.p_1T_2T === undefined ? '' : ' · ' + ptP(l.p_1T_2T))) },
    { k: 'porta', rot: 'selo e por quê', tipo: 'texto',
      /* O resumo de cada letra sai dos motivos GRAVADOS nas linhas daquela letra (paPorta, o mesmo do
         filtro), não da etiqueta fixa da casca: a letra B junta dois motivos, e a etiqueta resumida
         dizia menos do que as linhas dizem. Só entram as letras que existem no dado. */
      dica: 'o motivo que o estudo registrou para o selo, dito em português; o texto original e a letra do selo vão ao lado, em letra miúda · ' +
        (d.linhas || []).map(l => l.porta).filter((x, i, a) => x && x !== '-' && a.indexOf(x) === i).sort()
          .map(x => 'selo ' + x + ': ' + paPorta(x, d.linhas)).join(' · ') +
        (extras.length ? ' · embaixo, com o nome cru, ' + (extras.length === 1 ? 'a coluna' : 'as ' + extras.length + ' colunas') +
          ' que o ' + ptArquivoDado() + ' lista e esta tabela ainda não sabe dizer em português' : ''),
      fmt: (v, l) => (v && v !== '-' ? '' : paCinza('sem selo') + ' — ') + paMotivoSelo(l) +
        (v && v !== '-' ? ptTecnico('selo ' + esc(v)) : '') + extrasCel(l) }
  );
  return cols;
}

function paEt2Linhas(d, f) {
  const s = f.busca.trim().toLowerCase();
  const K = k => ptK(k);
  return (d.linhas || []).filter(l => {
    /* `String(...)` nos quatro: é o que faz a opção do vazio (chave 'null') casar com a
       linha sem valor. Para os campos que hoje nunca vêm nulos não muda nada. */
    if (f.pilar && String(l.pilar) !== f.pilar) return false;
    if (f.familia && String(l.familia) !== f.familia) return false;
    if (f.setor && String(l.setor) !== f.setor) return false;
    if (f.porta && String(l.porta) !== f.porta) return false;
    if (!s) return true;
    return [l.nome, l.indicador, l.coluna_csv, l.porta_motivo, ptNomeIndicador(l.indicador)]
      .some(x => x && String(x).toLowerCase().indexOf(s) >= 0);
  }).map(l => Object.assign({}, l, {
    /* chaves derivadas só para a ordenação: a linha original continua intacta */
    nome_tela: ptNomeIndicador(l.indicador),
    auc_ordem: paOrdemTxt(l[K('auc_{SM}')]),
    /* média e posição: coluna de texto para o trio quebrar entre os números; o deslocamento
       grande deixa positiva qualquer média (há indicador com média negativa, como saldos) */
    conf_ordem: paOrdemTxt(l.conf, 2),
    m_ordem: paOrdemTxt(l[K('m_{sobe}')], Math.pow(10, 12)),
    r_ordem: paOrdemTxt(l[K('r_{sobe}')]),
    /* pelo q, e o p desempata: as duas chaves com casas fixas, coladas, ordenam como texto */
    sm_ordem: paOrdemTxt(l[K('q_{SM}')]) === null ? null
      : paOrdemTxt(l[K('q_{SM}')]) + '|' + (paOrdemTxt(l[K('p_bruto_{SM}')]) || ''),
    sc_ordem: paOrdemTxt(l[K('d_bruto_{SC}')], Math.pow(10, 2)),
    /* o desconto do rodízio só existe nas linhas físicas: ausente vai para o fim */
    rod_ordem: paOrdemTxt(l[K('p_rod_{SM}')]),
    t12_ordem: paOrdemTxt(l.rho_1T_2T, 2),
    _dica: [l.coluna_csv, paRot(l.familia), l.setor ? 'setor ' + l.setor : '', l.porta_motivo || ''].filter(Boolean).join(' · '),
  }));
}

function paEt2Tabela(d, f) {
  const linhas = paEt2Linhas(d, f);
  const K = k => ptK(k);
  const nS = ptFxRot('sobe', { forma: 'nome' }), nM = ptFxRot('meio', { forma: 'nome' }),
    nC = ptFxRot('cai', { forma: 'nome' });
  const rod = [
    { d: K('d_rod_{SM}'), p: K('p_rod_{SM}'), rot: nS + ' × ' + nM },
    { d: K('d_rod_{SC}'), p: K('p_rod_{SC}'), rot: nS + ' × ' + nC },
  ].filter(c => (d.linhas || []).some(l => l[c.d] !== undefined && l[c.d] !== null));
  const colunas = paEt2Colunas(d, rod);
  const total = (d.linhas || []).length;
  const notaRod = rod.length ? '' :
    '<p class="pt-nota">' +
    ptFalta('esta rodada do ' + ptArquivoDado() + ' não traz a diferença entre times que rodaram o elenco parecido (d_rod/p_rod) — ' +
            'quando esses campos chegarem, a coluna aparece aqui sozinha') +
    '</p>';
  /* A caixa da tabela ganha altura máxima. Não é para esconder linha nenhuma — a contagem
     acima diz quantas existem e todas continuam a uma rolagem de distância —, é porque 293
     linhas soltas empurram as outras treze etapas para tão longe do olho que a aba deixa de
     ser lida como sequência. A altura entra inline na própria `.pt-tab-rola` porque é ela o
     contêiner que rola: pendurar a altura num pai faria o cabeçalho grudento perder a
     referência e sumir na primeira rolagem. */
  const tabela = ptTabela({
    id: 'ptEt-2-tab',
    ordem: { col: 'sm_ordem', dir: 'asc' },
    vazio: 'nenhum indicador passa neste filtro — e isto é o dado, não erro de tela',
    colunas: colunas,
    linhas: linhas,
  }).replace('<div class="pt-tab-rola">', '<div class="pt-tab-rola" style="max-height:66vh">');
  return '<p class="pt-nota" style="margin-top:0">Mostrando <b>' + ptInt(linhas.length) + '</b> de ' +
      ptInt(total) + ' indicadores' + (linhas.length < total ? ' · o filtro está ligado' : '') +
      ' · a caixa rola para baixo, e nenhuma linha fica de fora dela · cada célula junta os números de uma ' +
      'comparação (' + esc(ptFxLista().map(x => x.nome).join(' · ')) +
      '), e o número técnico fica em letra miúda</p>' +
      tabela + notaRod;
}

/* Montagem sob demanda do catálogo (conferência de 14/09: a aba inteira levava 1,6 s por
   redesenho, e as 293 linhas daqui são um quinto dos elementos da aba). Nada fica atrás de
   clique: a tabela é montada sozinha quando a caixa chega a uma tela e meia de distância, e fica
   montada. A casca cria o contêiner da etapa de novo a cada render, então "já montei" é guardado
   por contêiner — o "limpar", que redesenha a etapa no mesmo contêiner, monta na hora. Sem
   IntersectionObserver no navegador, monta na hora também. */
const PA_ET2_MONTADAS = (typeof WeakSet !== 'undefined') ? new WeakSet() : null;
function paEt2JaMonta(alvo) {
  return !PA_ET2_MONTADAS || !('IntersectionObserver' in window) || PA_ET2_MONTADAS.has(alvo);
}
function paEt2Espera(d) {
  return '<p class="pt-nota">A tabela dos ' + ptInt((d.linhas || []).length) + ' indicadores é montada quando a página ' +
    'chega nela, para a aba abrir mais depressa. Nenhuma linha fica de fora.</p>';
}
function paEt2Redesenhar(alvo, d) {
  const caixa = alvo.querySelector('#' + ptId('2-caixa', alvo));
  if (!caixa) return;
  if (PA_ET2_MONTADAS) PA_ET2_MONTADAS.add(alvo);
  caixa.innerHTML = paEt2Tabela(d, paEt2Estado(alvo));
  ptLigarTabelas(alvo);          /* tabela redesenhada nasce muda se isto não for chamado */
}

function ptEtapa2(alvo, d) {
  const L = d.linhas || [];
  const F = paEt2Estado(alvo);
  const K = k => ptK(k);
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
      '<select class="bt mini" id="' + esc(id) + '"><option value="">todos (' + ptInt(L.length) + ')</option>' +
      op.map(o => '<option value="' + esc(o[0]) + '">' +
        esc(o[0] === 'null' ? (vazioRot || 'sem valor declarado') : (formata ? formata(o[0]) : o[0])) +
        ' (' + ptInt(o[1]) + ')</option>').join('') +
      '</select></label>';
  };

  /* O resumo do sorteio repetido no topo da tabela, curto. A etapa 3 é o lugar dele; aqui
     ele existe porque a tabela abaixo tem 293 linhas e quem rola até ela precisa saber,
     ANTES de achar a primeira linha com p pequeno, quantas linhas com p pequeno o acaso
     entregaria de graça. */
  const e3 = (ptDado(alvo) || {}).etapa_3 || null;
  const aviso = !e3
    ? ptFaltaBloco('O aviso do sorteio não está no ' + ptArquivoDado(),
        'sem `etapa_3` esta tabela vira garimpo com cara de achado — o bloco existe para impedir isso')
    : '<div class="pt-controle">' +
        '<span class="pt-rot">Antes de ler a tabela</span>' +
        '<p class="pt-nota">Foram testados <b>' + ptInt(e3.testes_por_comparacao) + '</b> indicadores. Com esse tanto ' +
          'de teste, cerca de <b>' + paEsperados(e3) + '</b> dariam "certo" por pura sorte. Deram certo <b>' +
          ptInt(e3[K('passam5_{SM}')]) + '</b> (' + esc(ptFxRot('sobe')) + ' contra o ' + esc(ptFxRot('meio')) + '). ' +
          'Quando se testa muita coisa, alguma dá certo por sorte; <b>contando todos os testes parecidos, são firmes ' +
          ptInt(e3[K('bh5_{SM}')]) + '</b>. ' + paListasResumo(e3, 'SM') +
          ptTecnico('α ' + paAlfaTxt() + ' · Benjamini-Hochberg por família') + ' ' + paIr(3) + '</p></div>';

  const primaria = d.comparacao_primaria
    ? ptTecnico('comparação primária: ' + esc(d.comparacao_primaria))
    : ptFalta('o ' + ptArquivoDado() + ' não declara qual é a comparação principal');
  const passam = L.filter(l => l.resultado === true).length;
  const idCaixa = ptId('2-caixa', alvo);

  /* A classe que acende a coluna de AUC mora aqui e não no `style.css`, que é de outro dono.
     A regra vive dentro do próprio `alvo`, presa ao id do contêiner — com o prefixo da aba, para
     não acender a tabela da outra aba —, e por isso não alcança nenhuma outra etapa. */
  alvo.innerHTML =
    aviso +
    '<p class="pt-nota">Um indicador por linha; clique no nome de uma coluna para ordenar. A comparação principal é ' +
      '<b>' + esc(ptFxRot('sobe')) + ' contra quem ficou no ' + esc(ptFxRot('meio')) + '</b> — não contra ' +
      esc(ptFxRot('cai')) + ', porque essa é time bom contra time ruim, e isso qualquer um vê. É o meio da tabela que ' +
      'mostra o que o time que sobe tem de diferente. ' + primaria + ' ' +
      (passam === 0
        ? '<b>Nenhum dos ' + ptInt(L.length) + ' indicadores chega ao fim aprovado</b>; o motivo de cada um está na ' +
          'última coluna.' + ptTecnico('resultado = falso em todas as linhas')
        : '<b>' + ptInt(passam) + '</b> de ' + ptInt(L.length) + ' indicadores chegam ao fim aprovados.') + '</p>' +
    '<div class="filtros" style="border:1px solid var(--borda);border-radius:8px;background:var(--fundo2)">' +
      '<input type="text" id="' + esc(ptId('2-busca', alvo)) + '" placeholder="buscar indicador, coluna ou motivo">' +
      sel(ptId('2-pilar', alvo), 'pilar', 'pilar', paRot) +
      sel(ptId('2-familia', alvo), 'grupo', 'familia', paRot) +
      sel(ptId('2-setor', alvo), 'setor', 'setor', null, 'sem setor') +
      sel(ptId('2-porta', alvo), 'selo', 'porta', letra => paPorta(letra, L)) +
      '<button class="bt mini" id="' + esc(ptId('2-limpar', alvo)) + '">limpar</button>' +
    '</div>' +
    '<div id="' + esc(idCaixa) + '">' + (paEt2JaMonta(alvo) ? paEt2Tabela(d, F) : paEt2Espera(d)) + '</div>';
  if (!paEt2JaMonta(alvo)) {
    const caixa = alvo.querySelector('#' + idCaixa);
    const obs = new IntersectionObserver(ents => {
      if (!ents.some(e => e.isIntersecting)) return;
      obs.disconnect();
      /* o render seguinte troca o contêiner; o observador velho não desenha em caixa que saiu da página */
      if (!caixa.isConnected || PA_ET2_MONTADAS.has(alvo)) return;
      /* fora de evento de usuário: a aba certa (prefixo, dado, α) só vem com ptComAba */
      ptComAba(alvo, () => paEt2Redesenhar(alvo, d));
    }, { rootMargin: '150% 0px' });
    if (caixa) obs.observe(caixa);
  }
  if (PA_ET2_MONTADAS && paEt2JaMonta(alvo)) PA_ET2_MONTADAS.add(alvo);

  const liga = (sufixo, campo) => {
    const el = alvo.querySelector('#' + ptId(sufixo, alvo));
    if (!el) return;
    el.value = F[campo];
    el.oninput = () => { paEt2Estado(alvo)[campo] = el.value; paEt2Redesenhar(alvo, d); };
  };
  liga('2-busca', 'busca');
  liga('2-pilar', 'pilar');
  liga('2-familia', 'familia');
  liga('2-setor', 'setor');
  liga('2-porta', 'porta');
  const limpar = alvo.querySelector('#' + ptId('2-limpar', alvo));
  if (limpar) limpar.onclick = () => {
    const f = paEt2Estado(alvo);
    Object.keys(f).forEach(k => { f[k] = ''; });
    ptEtapa2(alvo, d);
  };
  /* A etapa se redesenha inteira pelo botão "limpar", e aí ninguém mais religa o clique de
     ordenar: sem esta linha, depois de limpar, os cabeçalhos da tabela ficavam mudos. */
  ptLigarTabelas(alvo);
}

/* ================= ETAPA 3 — o aviso do sorteio, em número =================

   Sem este bloco a etapa 2 vira garimpo com cara de achado. Ele não conta o que passou:
   conta quanto passaria sem nada acontecer. Desde 15/09 conta também a LISTA inteira de cada
   grupo contra o sorteio (`excesso.<comparação>.{bruto, rod}.lista`), sempre pela chave gravada. */

/* A lista inteira de cada grupo, contada pela CHAVE (ptChaveLista), numa frase: em quantos grupos a
   lista de uma comparação tem mais achados do que a sorte produz. Só conta chaves gravadas; grupo sem
   o bloco entra como ausente, escrito. */
function paListasResumo(e3, comp, curta) {
  const fam = (e3 && e3.por_familia) || {};
  const ks = Object.keys(fam);
  const com = ks.filter(k => fam[k].excesso && fam[k].excesso[comp] && fam[k].excesso[comp].bruto);
  if (!com.length) return ptFalta('o ' + ptArquivoDado() + ' não traz a conta da lista inteira de cada grupo');
  const tem = com.filter(k => ptChaveLista(fam[k].excesso[comp].bruto).chave === 'tem_mais_achados_que_a_sorte');
  return (curta ? 'em ' : 'E a lista inteira de cada grupo: em ') + '<b>' + ptInt(tem.length) + '</b> de ' + ptInt(com.length) + ' grupos, ' +
    esc(ptListaSorte('tem_mais_achados_que_a_sorte')) +
    (tem.length ? ' (' + tem.map(k => esc(paRot(k))).join(', ') + ')' : '') + '.' +
    (com.length < ks.length ? ' ' + ptFalta((ks.length - com.length) + ' grupo(s) sem essa conta no arquivo') : '');
}
/* Uma célula de lista: a frase da chave e, em letra miúda, achados · mediana do sorteio · p do
   excesso. Quando o gerador marcou a lista como colada no corte (`fronteira`), a célula diz isso. */
function paListaCel(bloco, motivo) {
  if (!bloco) return motivo ? paCinza('não se aplica', motivo) : ptFalta('sem a conta da lista neste grupo');
  const f = bloco.fronteira && bloco.fronteira.na_borda_do_sorteio === true
    ? ' ' + paCinza('colada no corte', bloco.fronteira.efeito_no_selo || bloco.fronteira.regra_declarada || '') : '';
  return ptListaSorteHtml(bloco) + f;
}

function ptEtapa3(alvo, d) {
  const fam = d.por_familia || {};
  const chaves = Object.keys(fam);
  const somaTestes = chaves.reduce((s, k) => s + fam[k].testes, 0);
  const aTxt = paAlfa() !== null ? ptPct(paAlfa() * 100, 0) : 'α';

  /* As duas comparações na mesma tabela: a primária e a fácil (time bom contra time ruim). Até
     14/09 havia uma terceira, "descontado o dinheiro"; saiu com a decisão do dono. */
  const K = k => ptK(k);
  const comparacoes = [
    { comp: 'quem subiu × meio da tabela', passam: d[K('passam5_{SM}')], bh: d[K('bh5_{SM}')], ordem: 1, c: 'SM' },
    { comp: 'quem subiu × quem caiu', passam: d[K('passam5_{SC}')], bh: d[K('bh5_{SC}')], ordem: 2, c: 'SC' },
  ].filter(c => c.passam !== undefined).map(c => Object.assign(c, { listas: paListasResumo(d, c.c, true) }));

  const tabComp = ptTabela({
    id: 'ptEt-3-comp',
    ordem: { col: 'ordem', dir: 'asc' },
    colunas: [
      { k: 'comp', rot: 'comparação', tipo: 'texto' },
      { k: 'passam', rot: 'separam sozinhos', casas: 0, dica: 'p abaixo de ' + aTxt + ', cada um olhado sozinho' },
      { k: 'bh', rot: 'firmes, contando todos os testes', casas: 0,
        dica: 'quando se testa muita coisa, alguma dá certo por sorte; firmes são os que passam na conta dos muitos testes parecidos do grupo' },
      { k: 'listas', rot: 'a lista inteira de cada grupo', tipo: 'texto', ordenavel: false,
        motivoFixa: 'frase: não tem ordem', fmt: v => v },
    ],
    linhas: comparacoes,
  });

  const cabecalho = paGrade(150,
    paBloco(ptInt(d.testes_por_comparacao), 'indicadores testados em cada comparação') +
    paBloco(paEsperados(d), 'dariam certo por pura sorte', 'pt-baixo') +
    paBloco(ptInt(d[K('passam5_{SM}')]), 'separam sozinhos, quem subiu × meio') +
    paBloco(ptInt(d[K('bh5_{SM}')]), 'são firmes, quem subiu × meio, contando todos os testes',
      d[K('bh5_{SM}')] === 0 ? 'coral-cl' : 'pt-ok'));

  /* A manchete, montada do dado: quem subiu × meio (separam sozinhos, o que a sorte daria, firmes)
     e a fácil ao lado, com o aviso de que ela é time bom contra time ruim. */
  const nOuFalta = v => v === undefined || v === null ? ptFalta('contagem não registrada') : '<b>' + ptInt(v) + '</b>';
  const manchete = '<p class="pt-nota" style="font-size:14px;color:var(--tinta)">Quem subiu contra o meio da tabela: ' +
      nOuFalta(d[K('passam5_{SM}')]) + ' indicadores separam sozinhos, quando a sorte daria cerca de <b>' + paEsperados(d) +
      '</b>; contando todos os testes parecidos, ' + nOuFalta(d[K('bh5_{SM}')]) + ' são firmes. ' +
      'Contra quem caiu, ' + nOuFalta(d[K('passam5_{SC}')]) + ' e ' + nOuFalta(d[K('bh5_{SC}')]) +
      ' — mas essa é time bom contra time ruim, e isso qualquer um vê.</p>';

  /* Nas famílias físicas, a mesma contagem entre times que rodaram o elenco parecido (só o rodízio
     descontado) e a lista dela. Coluna só aparece se algum grupo trouxer o campo. */
  const temRod = chaves.some(k => fam[k][K('passam5_rod_{SM}')] !== undefined);
  const exc = (l, c, n) => ((l.excesso || {})[c] || {})[n] || null;
  const excMotivo = (l, c) => ((l.excesso || {})[c] || {}).rod_motivo || '';
  const tabFam = chaves.length ? ptTabela({
    id: 'ptEt-3-familia',
    ordem: { col: 'testes', dir: 'desc' },
    colunas: [
      { k: 'familia', rot: 'grupo', tipo: 'texto', dica: 'a conta dos muitos testes é feita dentro de cada grupo' },
      { k: 'testes', rot: 'testes', casas: 0 },
      { k: 'esperados', rot: 'dariam certo por sorte',
        casas: 2, fmt: (v, l) => paEsperados(l, 1),
        dica: 'na régua de ' + aTxt + ' · o ' + ptArquivoDado() + ' só traz o esperado a ' +
          paEsperadosCorteTxt(fam[chaves[0]]) + '; fora disso a tela recalcula testes × α' },
      { k: K('passam5_{SM}'), rot: 'subiu × meio: separam sozinhos', casas: 0 },
      { k: K('bh5_{SM}'), rot: 'subiu × meio: firmes', casas: 0 },
      { k: 'lista_SM', rot: 'subiu × meio: a lista inteira', tipo: 'texto', ordenavel: false, motivoFixa: 'frase: não tem ordem',
        dica: 'os que separam sozinhos neste grupo são mais do que o sorteio dos rótulos dentro de cada ano produz?',
        fmt: (v, l) => paListaCel(exc(l._cru, 'SM', 'bruto')) },
      { k: K('passam5_{SC}'), rot: 'subiu × caiu: separam sozinhos', casas: 0 },
      { k: K('bh5_{SC}'), rot: 'subiu × caiu: firmes', casas: 0 },
      { k: 'lista_SC', rot: 'subiu × caiu: a lista inteira', tipo: 'texto', ordenavel: false, motivoFixa: 'frase: não tem ordem',
        fmt: (v, l) => paListaCel(exc(l._cru, 'SC', 'bruto')) },
    ].concat(temRod ? [
      { k: K('passam5_rod_{SM}'), rot: 'entre times que rodaram o elenco parecido · subiu × meio: separam', casas: 0,
        fmt: (v, l) => v === undefined || v === null ? paCinza('não se aplica', 'grupo sem média física por atleta') : ptInt(v) },
      { k: K('passam5_rod_{SC}'), rot: 'entre times que rodaram o elenco parecido · subiu × caiu: separam', casas: 0,
        fmt: (v, l) => v === undefined || v === null ? paCinza('não se aplica', 'grupo sem média física por atleta') : ptInt(v) },
      { k: 'lista_rod', rot: 'rodízio descontado · a lista inteira · subiu × meio · subiu × caiu', tipo: 'texto', ordenavel: false,
        motivoFixa: 'frase: não tem ordem',
        fmt: (v, l) => exc(l._cru, 'SM', 'rod') || exc(l._cru, 'SC', 'rod')
          ? paListaCel(exc(l._cru, 'SM', 'rod'), excMotivo(l._cru, 'SM')) + '<br>' + paListaCel(exc(l._cru, 'SC', 'rod'), excMotivo(l._cru, 'SC'))
          : paCinza('não se aplica', excMotivo(l._cru, 'SM') || 'grupo sem média física por atleta') },
    ] : []),
    /* `esperados` é chave derivada só para a ordenação: a linha do JSON continua intacta, e
       quem decide se o número é o do campo ou o recalculado é o `paEsperadosVal`. */
    linhas: chaves.map(k => Object.assign({}, fam[k],
      { familia: paRot(k), esperados: paEsperadosVal(fam[k]), _cru: fam[k] })),
  }) : ptFalta('o ' + ptArquivoDado() + ' não traz a quebra por grupo');

  /* O nulo do garimpo é a única medida aqui que precifica a BUSCA, e não o teste. Todas as
     outras contas desta etapa respondem "qual a chance deste indicador parecer bom por
     acaso?"; esta responde "qual a chance do MELHOR de 229 parecer bom por acaso?" — que é a
     pergunta que corresponde ao que foi realmente feito. */
  const g = d.nulo_do_garimpo || null;
  let cardGarimpo;
  if (!g) {
    cardGarimpo = ptFaltaBloco('E se o melhor indicador for sorte?',
      'o ' + ptArquivoDado() + ' não traz o bloco `nulo_do_garimpo` — sem ele, nada nesta aba mede o efeito de ter ' +
      'escolhido o melhor entre centenas');
  } else {
    /* Ganho de AUC não se lê; em pares de cada 100 — a mesma base do ptAcerto — se lê. */
    const pares = v => ptInt(paPares(v)) + ' pares';
    /* O percentil do sorteio sai do NOME da chave (`ganho_auc_nulo_p95` → 95), não de um 95 digitado. */
    const kP = Object.keys(g).find(x => /^ganho_auc_nulo_p\d+$/.test(x)) || 'ganho_auc_nulo_p95';
    const pctl = /\d+$/.exec(kP) ? Number(/\d+$/.exec(kP)[0]) : null;
    const marcas = [
      ['ganho_auc_nulo_media', 'sorteio, na média:', false],
      [kP, (pctl === null ? '' : ptInt(pctl)) + ' de 100 sorteios abaixo de', false],
      ['ganho_auc_nulo_max', 'o maior sorteio:', false],
      ['ganho_auc_real_melhor', 'o melhor de verdade:', true],
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
            (alto ? ';font-weight:700' : '') + '">' + esc(m[1]) + ' ' + pares(g[m[0]]) +
            '<title>' + esc('ganho de AUC ' + ptNum(g[m[0]], 3)) + '</title></text>';
      }).join('') + '</svg>';

    const passou = paAlfa() !== null && g.p_do_melhor !== null && g.p_do_melhor !== undefined && g.p_do_melhor < paAlfa();
    cardGarimpo = ptCard('E se o melhor indicador for sorte?',
      paQuantos(g.replicas, 'sorteio de comparação', 'sorteios de comparação'),
      svg +
      '<p class="pt-nota">Escolher o melhor entre <b>' + ptInt(g.indicadores) + '</b> indicadores já dá vantagem: ' +
        'o melhor de muitos sempre parece bom. Para medir essa vantagem, a conta embaralha quem subiu e quem não ' +
        'subiu <b>dentro de cada ano</b>, mantendo juntos os números de cada time, e procura de novo o melhor — ' +
        ptInt(g.replicas) + ' vezes. A régua mostra quanto o melhor indicador ganha de acerto por pura sorte, e onde ' +
        'fica o melhor de verdade. ' +
        (g.excluidos_por_cobertura_abaixo_de_90pct
          ? 'Ficaram de fora <b>' + ptInt(g.excluidos_por_cobertura_abaixo_de_90pct) +
            '</b> indicadores com dado faltando demais — garimpar em coluna com buraco inflaria o ganho ' +
            'dos dois lados. '
          : '') +
        'O melhor de verdade é <b>' + esc(ptNomeIndicador(g.indicador_real_melhor || '')) + '</b>.' +
        ptTecnico(esc(g.indicador_real_melhor || '')) + ptTecnico(esc(g.metodo || '')) + '</p>',
      'O melhor indicador de verdade melhora o acerto em <b>' + pares(g.ganho_auc_real_melhor) + '</b> de cada 100; ' +
        'nos sorteios, o melhor fica abaixo de <b>' + pares(g[kP]) + '</b> em ' + (pctl === null ? '' : ptInt(pctl)) +
        ' de cada 100 vezes: ' + ptAcaso(g.p_do_melhor) + '.' +
        ptTecnico('ganho de AUC ' + ptNum(g.ganho_auc_real_melhor, 3) + ' · ' + esc(kP.replace(/^ganho_auc_nulo_/, '')) +
          ' do sorteio ' + ptNum(g[kP], 3)) + ' ' +
        /* "passa raspando" e "sustente uma contratação" eram veredito e receita digitados. O que o dado
           diz é quantos sorteios chegaram ao melhor de verdade — isso vai escrito no lugar. */
        (passou
          ? '<b>Passa</b>' +
            (g.replicas_acima_do_real !== undefined && g.replicas_acima_do_real !== null && g.replicas
              ? ', mas em <b>' + ptInt(g.replicas_acima_do_real) + '</b> dos ' + ptInt(g.replicas) +
                ' sorteios o melhor por pura sorte chegou a ele ou passou dele.'
              : g.ganho_auc_nulo_max !== undefined && g.ganho_auc_nulo_max !== null && g.ganho_auc_nulo_max >= g.ganho_auc_real_melhor
                ? ', mas o maior sorteio chegou a ele ou passou dele.'
                : '.')
          : '<b>Não passa</b>: o melhor fica dentro do que o sorteio entrega.') +
        ptTecnico('ganho de AUC · ' + ptP(g.p_do_melhor) + ' · semente ' + ptInt(g.semente)));
  }

  alvo.innerHTML =
    cabecalho +
    '<p class="pt-nota">Quando se testa muita coisa, alguma dá certo por sorte. Aqui foram <b>' +
      ptInt(d.testes_por_comparacao) + '</b> testes em cada comparação; na régua usada, cerca de <b>' + paEsperados(d) +
      '</b> dariam certo sem nada acontecer. O desconto dessa sorte é feito <b>dentro de cada grupo de indicadores</b>, ' +
      'nunca no bolo e nunca indicador por indicador' +
      (somaTestes === d.testes_por_comparacao
        ? ' — os ' + ptInt(chaves.length) + ' grupos somam exatamente os ' + ptInt(d.testes_por_comparacao) +
          ' testes.'
        : ' — ' + paCinza('os grupos somam ' + ptInt(somaTestes) + ' e o total declarado é ' +
            ptInt(d.testes_por_comparacao)) + '.') +
      ptTecnico('α ' + paAlfaTxt() + ' · Benjamini-Hochberg por família') + '</p>' +
    manchete +
    tabComp +
    ptCard('Grupo por grupo', paQuantos(chaves.length, 'grupo', 'grupos') + ' · o desconto é feito dentro de cada um',
      tabFam,
      /* "é o padrão da tabela" era afirmado sem olhar a tabela: agora a contagem sai dos grupos. */
      (() => {
        const kSC = K('bh5_{SC}'), kSM = K('bh5_{SM}');
        const comAs2 = chaves.filter(k => fam[k][kSC] !== undefined && fam[k][kSC] !== null &&
          fam[k][kSM] !== undefined && fam[k][kSM] !== null);
        const mais = comAs2.filter(k => fam[k][kSC] > fam[k][kSM]).length;
        if (!comAs2.length) return ptFalta('os grupos não trazem as duas contagens para comparar');
        return 'Em <b>' + ptInt(mais) + '</b> de ' + ptInt(comAs2.length) + ' grupos sobram mais indicadores em ' +
          '<b>quem subiu × quem caiu</b> do que em <b>quem subiu × meio</b>' +
          (mais > 0 ? '. Isso não é achado: separar quem subiu de quem caiu é separar time bom de time ruim.' : '.');
      })()) +
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
    rot: ptNomeMedida(l.coluna_jogo || l.indicador),
    dica: l.indicador,
    texto: ptNum(l.conf, 2),
    hachura: l.hachura,
    cor: l.hachura ? 'baixo' : 'alto',
    extra: paQuantos(l.n, 'time', 'times') +
      (l.conf !== null && l.conf < 0 ? ' · <b>as duas metades andam em sentido contrário</b>' : '') +
      ptTecnico('ρ entre as metades ' + ptNum(l.rho_meias, 3)),
  })).join('');

  /* A ausência é o conteúdo principal desta etapa. A lista de barras acima parece completa e é uma
     fração da lista pré-declarada: sem esta linha, quem passa o olho conclui que a confiabilidade foi
     medida em todos os indicadores — e ela não foi, porque a maior parte deles não existe por jogo. */
  const total = L.length + (d.sem_versao_por_jogo || 0);
  const declarados = ptLer('etapa_0.indicadores_pre_declarados', ptDado(alvo));
  const semJogo = d.sem_versao_por_jogo === undefined || d.sem_versao_por_jogo === null
    ? ptFaltaBloco('Quantos indicadores ficaram sem essa medida',
        'o ' + ptArquivoDado() + ' não traz `sem_versao_por_jogo`')
    : ptFaltaBloco(ptInt(d.sem_versao_por_jogo) + ' indicadores não aparecem em barra nenhuma acima',
        'eles só existem como número da temporada inteira, e sem duas metades não dá para medir se ' +
        'repetem. Os ' + ptInt(L.length) + ' medidos aqui e esses ' +
        ptInt(d.sem_versao_por_jogo) + ' somam ' + ptInt(total) +
        (declarados !== undefined
          ? (total === declarados
              ? ', que é exatamente a lista escolhida antes da primeira conta.'
              : ', e a lista escolhida antes tem ' + ptInt(declarados) + ' — a diferença é do estudo.')
          : '.') +
        ' No catálogo, a coluna "' + PA_ROT_CONF + '" desses indicadores aparece como ausente, não como zero.');

  alvo.innerHTML =
    '<p class="pt-nota">Antes de perguntar se um número separa quem sobe, vale perguntar: <b>a medida dá o mesmo ' +
      'resultado se medida duas vezes?</b> A conta compara, para cada time, as rodadas ímpares com as rodadas pares ' +
      'da mesma temporada. Quanto menos um número se repete dentro do mesmo campeonato, menos ele consegue separar ' +
      'um time do outro: essa repetição é o teto do que se pode tirar daquela medida.' +
      (d.metodo ? ptTecnico(esc(d.metodo)) : ' ' + ptFalta('o ' + ptArquivoDado() + ' não declara o método')) + '</p>' +
    ptCard('A medida dá o mesmo resultado se medida duas vezes?',
      paQuantos(L.length, 'indicador medido jogo a jogo', 'indicadores medidos jogo a jogo') + ' · de 0 (nada) a 1 (sempre)',
      barras,
      (corte !== undefined && corte !== null
        ? '<b>A barra listrada marca quem fica abaixo de ' + ptNum(corte, 2) + '</b>, o corte gravado no próprio ' +
          'dado: ali a medida mal se repete de uma metade do campeonato para a outra. ' +
          'São <b>' + ptInt(abaixo) + '</b> de ' + ptInt(L.length) + ' — e barra lisa neles enganaria, porque o ' +
          'comprimento sozinho não diz que o número é instável. '
        : ptFalta('o ' + ptArquivoDado() + ' não declara o corte da hachura') + ' ') +
      (negativos.length
        ? 'Pior: em <b>' + ptInt(negativos.length) + '</b> (' +
          negativos.map(l => '<b>' + esc(ptNomeMedida(l.coluna_jogo || l.indicador)) + '</b>').join(', ') +
          ') as duas metades do campeonato <b>andam em sentido contrário</b>: ali não se viu a medida se repetir, ' +
          'e o número pode ser só barulho.'
        : '') +
      ptTecnico('split-half · Spearman-Brown · hachura = abaixo de corte_hachura')) +
    semJogo +
    '<p class="pt-nota">Esta medida volta no catálogo, ao lado de cada linha: uma diferença grande num indicador que ' +
      'mal se repete é, antes de tudo, uma diferença medida com régua torta. ' +
      paIr(2) + '</p>';
}
