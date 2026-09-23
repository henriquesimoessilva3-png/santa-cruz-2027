/* Aba "Estudo Série B".

   O DADO vem de static/estudo_serieb_dados.js (gerado por gerar_estudo_serieb_js.py): o roteiro
   das 29 perguntas com o status de cada uma, e as conclusões das partes já respondidas com os
   números já trocados pelos valores medidos. Aqui não se calcula nada — nem uma média. Se um
   número estiver errado, o erro está no <ID>.json da parte, não nesta tela.

   A aba existe desde antes das respostas: pergunta pendente aparece dizendo que ainda não foi
   respondida, com o ID da parte. É o roteiro do estudo, não só o resultado dele.

   Arquivo próprio, sem encostar no app.js e sem depender do proto.js (que sai com a Protótipo):
   os poucos ajudantes de texto estão aqui embaixo. A troca de aba continua sendo a do irParaAba,
   e um observador acompanha só o botão desta aba para mostrar e esconder a página junto — mesmo
   caminho do static/minutagem_serieb.js e do static/bola_parada.js. */
(function () {
  'use strict';

  const D = (typeof ESTUDO_SERIEB !== 'undefined') ? ESTUDO_SERIEB : null;

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* O selo de confiança usa as três palavras do estudo, e só elas. */
  const SELO = { firme: 'firme', provável: 'provável', provavel: 'provável', indício: 'indício',
                 indicio: 'indício' };
  const selo = c => SELO[String(c || '').toLowerCase()] || (c ? esc(c) : '—');
  const classeSelo = c => 'esb-selo esb-selo-' + (selo(c) === 'firme' ? 'firme' :
                          selo(c) === 'provável' ? 'provavel' : 'indicio');

  /* ---------------- pedaços ---------------- */

  /* O "por que esta confiança" era o title= do selo, e tooltip não rola, não copia e não
     abre no celular. O maior destes textos tem mais de 8 mil caracteres de prova — nada
     ali é supérfluo. Vira bloco que abre e fecha, no molde do "ver os números" do gráfico.

     O texto vai INTEIRO e literal: a única coisa que o código faz é começar parágrafo onde
     o próprio autor já marcou seção — um trecho em maiúsculas ("ROBUSTEZ", "FICA EM ABERTO")
     ou um item enumerado ("(1)", "(a)"). Nenhuma frase é cortada, juntada ou reordenada. */
  const FIM_FRASE = /(?<=[.!?])\s+/;
  const CABECALHO = /^(?:[A-ZÁÂÃÉÊÍÓÔÕÚÜÇ]{2,}[^a-z]{0,3}){2,}/;
  const ENUMERADOR = /^\((?:\d+|[a-z]{1,3})\)/;

  function motivoParagrafos(txt) {
    const paras = [];
    let atual = [];
    String(txt).split(FIM_FRASE).forEach(f => {
      if (atual.length && (CABECALHO.test(f) || ENUMERADOR.test(f))) {
        paras.push(atual.join(' '));
        atual = [];
      }
      atual.push(f);
    });
    if (atual.length) paras.push(atual.join(' '));
    return paras;
  }

  function motivoHtml(c) {
    if (!c.confianca_motivo) return '';
    return '<details class="esb-motivo">' +
      '<summary>por que esta confiança</summary>' +
      '<div class="esb-motivo-corpo">' +
        motivoParagrafos(c.confianca_motivo).map(p => '<p>' + esc(p) + '</p>').join('') +
      '</div></details>';
  }

  function conclusaoHtml(c, compacta) {
    const n = c.n ? '<span class="esb-n">n = ' + esc(c.n) + '</span>' : '';
    const selos = '<span class="' + classeSelo(c.confianca) + '">' +
      selo(c.confianca) + '</span>' + n;
    if (compacta) {
      return '<article class="esb-concl esb-compacta">' +
        '<h4>' + esc(c.manchete) + '</h4>' +
        '<p class="esb-uso">' + esc(c.para_o_santa_cruz) + '</p>' +
        '<div class="esb-rodape">' + selos + '<span class="esb-fonte">' + esc(c.parte) + '</span></div>' +
        '</article>';
    }
    /* O campo `premissa` é o ID em dados/premissas.json ("m2", "p20"); quem lê precisa do
       título. O código fica no title, para quem for procurar a premissa na aba própria. */
    const premTxt = c.premissa
      ? (c.premissa_titulo
         ? '<span title="' + esc(c.premissa) +
           (c.premissa_grupo ? ' · ' + esc(c.premissa_grupo) : '') + '">' +
           esc(c.premissa_titulo) + '</span>'
         : esc(c.premissa))
      : '';
    const prem = c.premissa
      ? '<p class="esb-premissa"><b>Premissa:</b> ' + premTxt + '</p>'
      : (c.premissa_motivo
         ? '<p class="esb-premissa esb-premissa-vazia"><b>Premissa:</b> ' + esc(c.premissa_motivo) + '</p>'
         : '');
    return '<article class="esb-concl" id="esb-' + esc(c.id || '') + '"' +
      ' data-status="' + esc(c.status || 'rascunho') + '"' +
      ' data-busca="' + esc(((c.manchete || '') + ' ' + (c.o_que_vimos || '') + ' ' +
                             (c.para_o_santa_cruz || '') + ' ' + (c.id || '')).toLowerCase()) + '">' +
      '<h4>' + esc(c.manchete) +
      '<a class="esb-ancora" href="#esb-' + esc(c.id || '') + '" title="link para esta conclusão"' +
      ' aria-label="link para esta conclusão">#</a></h4>' +
      '<p class="esb-vimos">' + esc(c.o_que_vimos) + '</p>' +
      (c.grafico ? '<div class="esb-graf-slot" data-concl="' + esc(c.id || '') + '"></div>' : '') +
      '<p class="esb-uso"><b>Para o Santa Cruz:</b> ' + esc(c.para_o_santa_cruz) + '</p>' +
      prem +
      '<div class="esb-rodape">' + selos +
        '<span class="esb-fonte">' + esc(c.parte) + (c.id ? ' · ' + esc(c.id) : '') + '</span>' +
      '</div>' +
      motivoHtml(c) +
      '</article>';
  }

  function parteHtml(p) {
    if (p.status === 'pendente') {
      return '<div class="esb-parte esb-pendente" id="esb-' + esc(p.id) + '"' +
        ' data-status="pendente"' +
        ' data-busca="' + esc(((p.id || '') + ' ' + (p.pergunta || '')).toLowerCase()) + '">' +
        '<span class="esb-id">' + esc(p.id) + '</span>' +
        '<span class="esb-pergunta">' + esc(p.pergunta) + '</span>' +
        '<span class="esb-status">ainda não respondida</span>' +
        '</div>';
    }
    const marca = p.status === 'validada' ? 'validada' : 'rascunho';
    return '<div class="esb-parte esb-' + marca + '" id="esb-' + esc(p.id) + '"' +
      ' data-status="' + marca + '"' +
      ' data-busca="' + esc(((p.id || '') + ' ' + (p.pergunta || '') + ' ' + (p.titulo || '') + ' ' +
        (p.conclusoes || []).map(c => c.manchete || '').join(' ')).toLowerCase()) + '">' +
      '<div class="esb-parte-topo">' +
        '<span class="esb-id">' + esc(p.id) + '</span>' +
        '<span class="esb-pergunta">' + esc(p.pergunta) + '</span>' +
        '<span class="esb-status esb-' + marca + '-tag">' + marca + '</span>' +
      '</div>' +
      p.conclusoes.filter(c => !c.negativa).map(c => conclusaoHtml(c, false)).join('') +
      (p.em_aberto ? '<p class="esb-aberto"><b>Em aberto:</b> ' + esc(p.em_aberto) + '</p>' : '') +
      '</div>';
  }

  function secaoHtml(titulo, bloco) {
    const ps = D.partes.filter(p => p.bloco === bloco);
    const feitas = ps.filter(p => p.status !== 'pendente').length;
    return '<section class="esb-secao">' +
      '<h3>' + esc(titulo) + '<span class="esb-conta">' + feitas + ' de ' + ps.length +
      ' respondidas</span></h3>' + ps.map(parteHtml).join('') + '</section>';
  }

  function decidimosHtml() {
    if (!D.validadas.length) {
      return '<section class="esb-secao esb-decidimos">' +
        '<h3>O que decidimos</h3>' +
        '<p class="esb-nota">Nenhuma conclusão validada ainda. Conclusão nasce como rascunho e só ' +
        'sobe para cá depois que você validar o texto — os números já vêm conferidos do estudo.</p>' +
        '</section>';
    }
    return '<section class="esb-secao esb-decidimos">' +
      '<h3>O que decidimos<span class="esb-conta">' + D.validadas.length + ' de até 7</span></h3>' +
      D.validadas.map(c => conclusaoHtml(c, true)).join('') + '</section>';
  }

  function negativasHtml() {
    if (!D.negativas.length) {
      return '<section class="esb-secao"><h3>Parece, mas não é</h3>' +
        '<p class="esb-nota">Aqui entram os resultados negativos: o que parecia importante e não ' +
        'separa quem sobe. Nenhum registrado ainda.</p></section>';
    }
    return '<section class="esb-secao"><h3>Parece, mas não é<span class="esb-conta">' +
      D.negativas.length + '</span></h3>' +
      D.negativas.map(c => conclusaoHtml(c, false)).join('') + '</section>';
  }

  function sabemosHtml() {
    // Só parte de análise entra aqui: tarefa de tela (bloco E) não tem prova a mostrar.
    const feitas = D.partes.filter(p => p.status !== 'pendente' && p.bloco !== 'E');
    if (!feitas.length) {
      return '<section class="esb-secao"><h3>Como sabemos</h3>' +
        '<p class="esb-nota">As provas de cada conclusão aparecem aqui, com a linguagem técnica.' +
        '</p></section>';
    }
    return '<section class="esb-secao esb-sabemos"><h3>Como sabemos</h3>' +
      '<table class="esb-provas"><thead><tr><th>Parte</th><th>O que é</th>' +
      '<th>Prova</th><th>Script</th></tr></thead><tbody>' +
      feitas.map(p => '<tr><td><b>' + esc(p.id) + '</b></td>' +
        '<td>' + esc(p.titulo || p.pergunta) + '</td>' +
        '<td>' + esc((p.conclusoes[0] || {}).prova || '—') + '</td>' +
        '<td class="esb-mono">' + esc(p.prova_arquivos || '—') + '</td></tr>').join('') +
      '</tbody></table></section>';
  }

  function tarefasHtml() {
    const ps = D.partes.filter(p => p.bloco === 'E');
    return '<section class="esb-secao esb-tarefas"><h3>Tarefas da tela</h3>' +
      ps.map(p => '<div class="esb-parte esb-' + (p.status === 'feita' ? 'validada' : 'pendente') +
        '"><span class="esb-id">' + esc(p.id) + '</span>' +
        '<span class="esb-pergunta">' + esc(p.pergunta) + '</span>' +
        '<span class="esb-status' + (p.status === 'feita' ? ' esb-validada-tag' : '') + '">' +
        (p.status === 'feita' ? 'feita em ' + esc(p.feita_em) : 'pendente') +
        '</span></div>').join('') + '</section>';
  }

  /* ---------------- montagem ---------------- */

  /* ---------------- navegação ----------------
     Por que existe: são 27 perguntas e 70 conclusões numa página só. Sem índice, sem âncora e
     sem filtro, achar "o que o estudo diz sobre bola parada" é rolar até topar. O índice é
     gerado do mesmo dado da página — não há lista de perguntas escrita à mão em lugar nenhum. */

  const SECOES = [['A', 'Que time montar'], ['T', 'Que treinador buscar'], ['J', 'Quem contratar']];

  function sumarioHtml() {
    const linha = p => {
      const marca = p.status === 'pendente' ? 'pendente'
                  : (p.status === 'validada' ? 'validada' : 'rascunho');
      const quantas = (p.conclusoes || []).length;
      return '<li><a href="#esb-' + esc(p.id) + '" class="esb-sum-item esb-sum-' + marca + '">' +
        '<span class="esb-sum-id">' + esc(p.id) + '</span>' +
        '<span class="esb-sum-perg">' + esc(p.pergunta) + '</span>' +
        '<span class="esb-sum-marca">' + (quantas ? quantas + (quantas > 1 ? ' conclusões' : ' conclusão') : marca) +
        '</span></a></li>';
    };
    return '<details class="esb-sumario" open><summary>As ' +
      D.partes.filter(p => p.bloco !== 'E').length + ' perguntas, e onde cada uma está</summary>' +
      SECOES.map(([b, t]) => {
        const ps = D.partes.filter(p => p.bloco === b);
        if (!ps.length) return '';
        return '<div class="esb-sum-bloco"><h4>' + esc(t) + '</h4><ul>' +
          ps.map(linha).join('') + '</ul></div>';
      }).join('') + '</details>';
  }

  function filtroHtml() {
    const b = (v, r) => '<button type="button" class="esb-filtro-bt" data-filtro="' + v + '"' +
      (v === 'todas' ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>' + r + '</button>';
    return '<div class="esb-filtros">' +
      '<label class="esb-busca"><span class="esb-busca-lupa" aria-hidden="true">⌕</span>' +
      '<input type="search" id="esBusca" placeholder="procurar na manchete, na pergunta, no uso prático…" ' +
      'aria-label="procurar no estudo"></label>' +
      '<div class="esb-filtro-grupo" role="group" aria-label="filtrar por estado">' +
      b('todas', 'todas') + b('validada', 'validadas') + b('rascunho', 'rascunho') +
      b('pendente', 'pendentes') + '</div>' +
      '<span class="esb-filtro-conta" id="esFiltroConta"></span></div>';
  }

  /* A lista nominal. O rótulo é o do próprio arquivo: NÃO é lista de alvos. O J06 não publicou
     nome nenhum porque o backtest da §8.6 não autorizou, e a ficha de perfil do J05 descreve
     quem subiu sem prometer quem vai subir. O que sobra, e que a base sustenta, é isto:
     contrato vencendo, as duas fontes concordando na data, e minutagem regular. */
  function livresHtml() {
    const L = D.elenco_livre;
    if (!L) return '';
    const fmt = (v, c) => v == null ? '—' :
      Number(v).toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
    const cab = '<tr><th>jogador</th><th>clube</th><th class="esb-num">idade</th>' +
      '<th class="esb-num">minutos</th><th class="esb-num">jogos</th>' +
      '<th class="esb-num">fatia</th><th>contrato</th>' +
      '<th class="esb-num" title="valor de mercado no Transfermarkt, em EURO">valor</th>' +
      '<th>ficha</th></tr>';
    const bloco = b => {
      if (!b.quantos) {
        return '<div class="esb-pos esb-pos-vazia"><h4>' + esc(b.posicao) +
          '<span class="esb-conta">nenhum, de ' + b.na_serie_b + ' na Série B</span></h4></div>';
      }
      /* O denominador é do SETOR, não do bloco: o J06 conta a oferta da Série B por setor, e
         dividir a lista por lado não divide essa contagem. Então o bloco dividido diz de quem é o
         denominador — "4 · 106 laterais na Série B, os dois lados" —, em vez de deixar
         "4 de 106" parecer quatro laterais direitos entre 106 laterais direitos. */
      const PLURAL = { Lateral: 'laterais', Meia: 'meias', Zaga: 'zagueiros', Volante: 'volantes',
                       Extremo: 'extremos', Atacante: 'atacantes', Goleiro: 'goleiros' };
      const doSetor = (b.na_serie_b_de && b.na_serie_b_de !== b.posicao)
        ? b.quantos + ' · ' + b.na_serie_b + ' ' +
          esc(PLURAL[b.na_serie_b_de] || b.na_serie_b_de.toLowerCase()) +
          ' na Série B, os dois blocos juntos · '
        : b.quantos + ' de ' + b.na_serie_b + ' na Série B · ';
      return '<div class="esb-pos"><h4>' + esc(b.posicao) +
        '<span class="esb-conta">' + doSetor +
        b.com_contrato_confirmado + ' com contrato confirmado' +
        (b.com_a_ficha_inteira ? ' · ' + b.com_a_ficha_inteira + ' com a ficha inteira' : '') +
        '</span></h4><table class="esb-tab-livres"><thead>' + cab + '</thead><tbody>' +
        b.jogadores.map(j => '<tr' + (j.contrato_confirmado ? '' : ' class="esb-lin-fraca"') + '>' +
          '<td>' + esc(j.jogador) +
          (j.estrangeiro ? ' <span class="esb-flag" title="estrangeiro: ocupa vaga">⚑</span>' : '') +
          (j.motivo_sem_par
            ? ' <span class="esb-sempar" title="' + esc(j.motivo_sem_par) +
              '">sem par no app</span>' : '') +
          '</td><td>' + esc(j.clube) + '</td>' +
          '<td class="esb-num">' + fmt(j.idade, 0) + '</td>' +
          '<td class="esb-num">' + fmt(j.minutos, 0) + '</td>' +
          '<td class="esb-num">' + fmt(j.jogos, 0) + '</td>' +
          '<td class="esb-num">' + fmt(j.fatia_pct, 0) + '%</td>' +
          '<td>' + (j.contrato_confirmado
            ? '<span class="esb-ct-ok" title="as duas fontes concordam na data">confirmado</span>'
            : '<span class="esb-ct-fraco" title="as fontes divergem na data do contrato">uma fonte só</span>') +
          '</td>' +
          celulaValor(j.jogador, j.clube) +
          '<td>' + (j.atende_perfil ? '<b>atende</b>'
                   : (String(j.indicadores_com_dado) === '0'
                      ? '<span class="esb-semdado">sem dado</span>'
                      : 'viola ' + esc(j.violados))) + '</td></tr>').join('') +
        '</tbody></table></div>';
    };
    const sempar = (L.sem_par_no_app || []).length
      ? '<p class="esb-nota"><b>Sem par na base do app (' + L.sem_par_no_app.length + '):</b> ' +
        L.sem_par_no_app.map(esc).join(' · ') + '. Eles continuam na lista, que é do estudo — só ' +
        'não viram linha clicável na aba Fim de contrato. Caso ambíguo é listado, nunca adivinhado.</p>'
      : '';
    return '<section class="esb-secao esb-livres" id="esb-livres">' +
      '<h3>Quem está livre e roda<span class="esb-conta">' + L.total + ' jogadores · ' +
      L.com_contrato_confirmado + ' com contrato confirmado</span></h3>' +
      '<p class="esb-aviso-forte"><b>Isto não é uma lista de alvos.</b> O J06 não publicou nome ' +
      'nenhum porque o teste que autorizaria não passou, e a ficha de perfil descreve quem subiu ' +
      'sem prometer quem vai subir. O que esta lista tem é o único requisito que a base sustenta: ' +
      'contrato vencendo na virada e minutagem regular pelo corte de cada posição. É quem está ' +
      'disponível e joga, não quem faz subir.</p>' +
      L.por_posicao.map(bloco).join('') +
      '<p class="esb-nota">“viola N” conta os pisos da ficha que o jogador não atinge. “sem dado” ' +
      'não é aprovação nem reprovação: são os que não têm indicador medido, e por isso a ficha ' +
      'não se aplica a eles. “uma fonte só” é contrato que o Transfermarkt e o Wyscout datam ' +
      'diferente — vale conferir antes de ligar para o empresário. Na aba <b>Fim de contrato</b> ' +
      'eles aparecem marcados, e de lá o botão leva o jogador ao campograma.</p>' + sempar +
      '</section>';
  }

  /* A lista inteira de treinadores, aberta. Ela ORDENA O QUE ACONTECEU: as duas premissas que
     sustentariam lê-la como previsão falharam (T02, o histórico de G4 não se transfere entre
     clubes; T03, o perfil de jogo não é traço do treinador). Os dois critérios vão lado a lado
     porque trocar um pelo outro muda o pódio — e essa instabilidade é o achado do T04. */
  /* A régua do A14, peça por peça. O gráfico dela mostra a nota por faixa; esta tabela mostra
     DE QUE a nota é feita e qual peça pesa mais — sem isso a legenda "0 a 100" não diz nada a
     quem chega no desenho. O `d` é o tamanho do efeito medido na parte de origem. */
  function reguaHtml() {
    const R = D.regua;
    if (!R || !R.indice || !R.indice.length) return '';
    const ROT = {
      H_dinheiro: 'valor do elenco',
      dist_remate: 'de que distância o time finaliza',
      E_qualidade_chance: 'qualidade da chance que cria',
      xg_por_remate_contra: 'qualidade da chance que cede',
      duelos_def_pct: 'duelo defensivo ganho',
      xgc_casa: 'chance cedida em casa',
      dd_casa: 'duelo defensivo em casa',
      dd_fora: 'duelo defensivo fora',
      F_solidez: 'solidez defensiva',
    };
    const rot = k => ROT[k] || k;
    const d = new Map((R.candidatos || []).map(c => [c.indicador, c]));
    const dentro = R.indice.slice()
      .sort((a, b) => ((d.get(b) || {}).d || 0) - ((d.get(a) || {}).d || 0));
    const maior = dentro.length ? (d.get(dentro[0]) || {}).d : null;
    const linha = k => {
      const c = d.get(k) || {};
      const forte = c.d === maior ? ' class="esb-forte"' : '';
      return '<tr' + forte + '><td>' + esc(rot(k)) + '</td>' +
        '<td class="esb-mono esb-suave">' + esc(k) + '</td>' +
        '<td class="esb-suave">' + esc(c.parte || '—') + '</td>' +
        '<td class="esb-num">' + (c.d == null ? '—'
          : Number(c.d).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) +
        '</td></tr>';
    };
    const desc = (R.descartados || []).length
      ? '<p class="esb-nota"><b>Ficaram de fora por medir a mesma coisa que outra peça:</b> ' +
        R.descartados.map(x => esc(rot(x[0])) + ' (repete ' + esc(rot(x[1])) + ', ' +
          String(x[2]).replace('.', ',') + ')').join(' · ') + '.</p>'
      : '';
    return '<section class="esb-secao esb-regua" id="esb-regua">' +
      '<h3>A régua, peça por peça<span class="esb-conta">' + R.indice.length + ' indicadores</span></h3>' +
      '<p class="esb-nota">A nota de 0 a 100 do gráfico do A14 sai da mistura destas ' +
      R.indice.length + '. A coluna da direita é o tamanho do efeito medido na parte de origem: ' +
      'quanto maior, mais aquela peça separa quem sobe de quem fica no meio.</p>' +
      '<table class="esb-tab-tec"><thead><tr><th>o que é</th><th>nome técnico</th>' +
      '<th>de onde vem</th><th class="esb-num" title="tamanho do efeito na parte de origem">peso</th>' +
      '</tr></thead><tbody>' + dentro.map(linha).join('') + '</tbody></table>' + desc +
      '</section>';
  }

  /* A lista por posição ORDENADA POR ADERÊNCIA, e não por passar ou não passar na ficha.
     A ficha de J05 é uma conjunção de 4 a 6 pisos: ela responde "quem é perfeito" e joga fora a
     informação de quão perto cada um está, que é a que serve para montar elenco. Aqui a nota é a
     média do percentil do jogador nos critérios da posição, na mesma escala dos pisos. */
  /* Valor de mercado do Transfermarkt, em EURO (20/09). A aba carrega o mesmo
     static/valor_mercado.js que o app, mas NÃO depende do app.js — ela é autocontida por
     desenho. Quem não tem ficha fica sem número, e não com zero: "não sei" e "não vale
     nada" são coisas diferentes, e somar zero por quem falta barateia o elenco de mentira. */
  const VMER = (typeof VALOR_MERCADO !== 'undefined') ? VALOR_MERCADO : null;

  const normVm = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/-/g, ' ').split(/\s+/).filter(Boolean).join(' ');

  /* DUAS FONTES, e a lista tem de dizer qual é qual. A coleta do Transfermarkt cobre a
     Série B; as listas do exterior (J09) são de outras ligas e ficavam quase todas com
     traço. O `mv` do Wyscout cobre as 40 mil linhas da base e entra como SEGUNDA fonte —
     separada, nunca misturada: nos jogadores presentes nas duas a razão mediana é 1,33,
     porque são datas diferentes. */
  function valorDe(nome, clube) {
    if (!VMER) return null;
    const n = normVm(nome), c = normVm(clube);
    const v = VMER.jogadores[n + '|' + c];
    if (v != null) return { eur: v, fonte: 'tm' };
    const so = VMER.por_nome[n];
    if (so != null) return { eur: so, fonte: 'tm' };
    const w = VMER.wyscout ? VMER.wyscout[n + '|' + c] : null;
    return w == null ? null : { eur: w, fonte: 'wy' };
  }

  const eurCurto = n => n == null ? '—'
    : (Math.abs(n) >= 1e6 ? '€ ' + (n / 1e6).toFixed(1).replace('.', ',') + ' mi'
                          : '€ ' + Math.round(n / 1000) + ' mil');

  /* A célula, com a fonte marcada. Quem veio do Wyscout ganha um "w" discreto e o title
     explica por quê — sem isso a lista somaria maçã com laranja em silêncio. */
  function celulaValor(nome, clube) {
    const v = valorDe(nome, clube);
    if (!v) return '<td class="esb-num esb-vm" title="sem valor de mercado em nenhuma das ' +
      'duas fontes: nem no Transfermarkt da Série B, nem na base do Wyscout">—</td>';
    const t = v.fonte === 'tm'
      ? 'Transfermarkt, Série B ' + (VMER.temporada || '') + ' (' + (VMER.coletado_em || '') + ')'
      : 'Wyscout — este jogador não está no elenco da Série B, que é o que a coleta do ' +
        'Transfermarkt cobre. É outra data, e por isso vem marcado.';
    return '<td class="esb-num esb-vm' + (v.fonte === 'wy' ? ' esb-vm-wy' : '') +
      '" title="' + esc(t) + '">' + eurCurto(v.eur) +
      (v.fonte === 'wy' ? '<i class="esb-vm-fnt">w</i>' : '') + '</td>';
  }

  /* A ficha de cada posição, aberta em colunas — 20/09.

     Antes, os critérios vinham num campo de texto só, cortado em dois e com o resto no title=:
     "Velocidade de pico, média dos 5 melhores jogos (k…". Não dava para comparar dois jogadores
     no mesmo critério, que é justamente o que a lista serve para fazer, e a tela sobrava largura
     à direita. Agora é uma coluna por critério, na mesma ordem para todos do bloco.

     O texto continua sendo a fonte: ele vem do gerador como "<nome> <percentil>/<piso>", separado
     por ponto e vírgula, e alguns critérios não têm piso (medidos, mas sem exigência). A leitura
     é feita do FIM para o começo, porque o nome tem vírgula, "%" e "/90" dentro dele — partir
     pelo primeiro separador quebraria "Passes progressivos/90". */
  const RE_FICHA = /^(.*?)\s+(\d+(?:[.,]\d+)?)(?:\/(\d+(?:[.,]\d+)?))?$/;

  function criteriosDe(detalhe) {
    return String(detalhe || '').split(';').map(t => t.trim()).filter(Boolean).map(t => {
      const m = RE_FICHA.exec(t);
      if (!m) return { nome: t, pct: null, piso: null };
      return { nome: m[1].trim(), pct: Number(String(m[2]).replace(',', '.')),
               piso: m[3] == null ? null : Number(String(m[3]).replace(',', '.')) };
    });
  }

  /* O cabeçalho precisa caber: "Velocidade de pico, média dos 5 melhores jogos (km/h)" vira
     "Velocidade de pico". O nome inteiro fica no title da coluna, não se perde. */
  function nomeCurto(nome) {
    return String(nome).replace(/\s*\([^)]*\)/g, '').split(',')[0].replace(/\/90$/, '').trim();
  }

  /* A LISTA, com os quatro mercados no mesmo plano (21/09, 2ª rodada).

     Ate entao a lista de fora vinha embaixo, como anexo, por duas premissas que se mostraram
     DEFEITO e nao dado: (1) "la fora a ficha mede no maximo 2 criterios" — era a busca da coluna
     pelo nome, consertada de manha; (2) "o eixo la fora e' meio eixo, porque toques na area nao
     existe" — a coluna esta nos 115 cabecalhos de TODAS as ligas, e o que faltava era extrai-la.
     Sem premissa que as separe, elas viram uma lista so' por posicao.

     O QUE A TELA TEM DE DIZER, e diz: o ajuste de liga de J08 tem TETO ARITMETICO. Na familia do
     eixo ele para em 76,4, enquanto a Serie B vai a 100 — entao o topo de cada lista e' da Serie B
     por construcao do ajuste, nao por merito medido. Por isso cada linha de fora leva o percentil
     de ORIGEM ao lado do ajustado e o desconto entre os dois: sem esses dois numeros, a lista
     afirma que um atacante da Serie B e' melhor apostar que Neymar, quando o que ela mediu foi o
     desconto de 24,6 pontos que a conversao aplica. */
  /* OS NOMES QUE O ESTUDO PUBLICA. Sao quatro, e e' a unica lista nominal que a parte J09
     autoriza — tudo o mais na tela e' candidato ordenado, nao alvo.

     Por que so' apareceram em 22/09: antes do conserto da chave do painel temporal, o funil
     do J09 nao deixava passar ninguem e o arquivo nem era escrito. Com a chave certa a
     amostra foi de 960 para 3.741 e quatro nomes atravessaram.

     O QUE A TELA TEM DE DIZER JUNTO, senao ela promete o que a parte nao promete: os quatro
     passam a ficha na leitura da ORIGEM e NENHUM passa depois do desconto de conversao de
     liga; tres dos quatro vem de liga com fator fraco; e nenhum e' sul-americano, que e' o
     mercado de foco. Por isso o rotulo e' `rastrear`, e nao `alvo`. */
  function alvosHtml() {
    const A = D.alvos_fora;
    if (!A || !A.length) return '';
    const fmt = (v, c) => v == null ? '—' :
      Number(v).toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
    const forte = A.filter(a => a.forca_do_fator === 'forte').length;
    /* A MESMA MARCA DA LISTA. Sem ela esta secao contradiria o resto da tela: o unico fator
       `forte` entre os quatro e' o de Portugal A, que e' justamente o que o painel
       comprometido sustenta com tres transferencias de uma temporada de rotulo errado.
       Dizer "forte" ali e "comprometido" na lista de baixo seria a tela discordando de si. */
    const COMP = {};
    (((D.ranking || {}).painel_suspeito || {}).ligas_afetadas || [])
      .forEach(x => { COMP[x.liga] = x.por_que; });
    const marcados = A.filter(a => COMP[a.liga]).length;
    const ajust = A.filter(a => a.passa_ajustado).length;
    const linha = a =>
      '<tr><td>' + esc(a.jogador) +
        (a.estrangeiro ? ' <span class="esb-flag" title="estrangeiro: ocupa vaga">⚑</span>' : '') +
        (a.nascido_em ? ' <span class="esb-pass">' + esc(a.nascido_em) + '</span>' : '') +
      '</td>' +
      '<td>' + esc(a.setor) + '<span class="esb-liga"> ' + esc(a.posicao || '') + '</span></td>' +
      '<td>' + esc(a.clube || '—') + ' <span class="esb-liga">' + esc(a.liga || '') + '</span></td>' +
      '<td class="esb-num">' + fmt(a.idade, 0) + '</td>' +
      '<td class="esb-num">' + fmt(a.fatia_pct, 0) + '%</td>' +
      '<td>' + (a.contrato ? esc(a.contrato) : '—') + '</td>' +
      '<td class="esb-num">' + esc(a.criterios) + '/' + esc(a.exigencias) + '</td>' +
      '<td><span class="' + (a.forca_do_fator === 'forte' ? 'esb-ct-ok' : 'esb-neg') + '">' +
        esc(a.forca_do_fator) + '</span>' +
        (a.casos_do_fator ? '<span class="esb-liga"> ' + fmt(a.casos_do_fator, 0) + ' casos</span>' : '') +
        (COMP[a.liga] ? '<span class="esb-comp-fator" title="' + esc(COMP[a.liga]) +
          ' — a conversão desta liga não tem a mesma confiança das outras">⚠</span>' : '') +
      '</td>' +
      '<td class="esb-num esb-neg">' + (a.passa_ajustado ? 'passa' : 'não') + '</td></tr>';
    return '<section class="esb-secao esb-alvos" id="esb-alvos">' +
      '<h3>Os nomes que o estudo publica<span class="esb-conta">' + A.length +
      ' · rótulo <b>rastrear</b></span></h3>' +
      '<p class="esb-aviso-forte"><b>Esta é a única lista nominal que o estudo autoriza, e ela ' +
      'não é uma lista de alvos.</b> São os que atravessam a ficha inteira da posição na leitura ' +
      'da liga de ORIGEM. Passado o desconto de conversão de liga, <b>' +
      (ajust === 0 ? 'nenhum dos ' + A.length + ' sobrevive' : ajust + ' de ' + A.length +
      ' sobrevivem') + '</b> — a última coluna mostra isso linha a linha. ' +
      '<b>' + forte + ' de ' + A.length + '</b> vem de liga com fator de conversão forte; os ' +
      'outros vêm de fator fraco, que é palpite mais frouxo' +
      (marcados ? ' — e o fator de <b>' + marcados + '</b> del' + (marcados > 1 ? 'es' : 'e') +
        ' está marcado com ⚠ porque depende de uma temporada com o rótulo errado no painel, ' +
        'que é o mesmo aviso da lista abaixo' : '') + '. E <b>nenhum é sul-americano</b>, ' +
      'que é o mercado de foco. Servem para começar conversa, com vídeo e olho por cima — ' +
      'nunca para fechar contratação.</p>' +
      '<table class="esb-tab-tec"><thead><tr><th>jogador</th><th>posição</th><th>clube</th>' +
      '<th class="esb-num">idade</th>' +
      '<th class="esb-num" title="fatia dos minutos do elenco na liga de origem">rodagem</th>' +
      '<th>contrato</th>' +
      '<th class="esb-num" title="critérios medidos, de quantos a ficha da posição exige">ficha</th>' +
      '<th title="força do fator de conversão da liga, do J08">conversão</th>' +
      '<th class="esb-num" title="passa a ficha depois do desconto de conversão?">ajustado</th>' +
      '</tr></thead><tbody>' + A.map(linha).join('') + '</tbody></table>' +
      '<p class="esb-nota">Vêm do <b>J09_alvos.csv</b>, escrito pela própria parte. Até 22/09 o ' +
      'arquivo não existia: o funil não deixava passar ninguém, e foi o conserto da chave do ' +
      'painel de temporadas que mudou isso.</p>' +
      '</section>';
  }

  function rankingHtml() {
    const K = D.ranking;
    if (!K || !K.listas || !K.listas.length) return '';
    const fmt = (v, c) => v == null ? '—' :
      Number(v).toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
    const TETO = (K.teto_do_ajuste || {}).volume;
    const CLASSE_MERC = { 'Série B': 'b', 'Série A': 'a', 'Sul-americano': 'sa', 'Exterior': 'ex' };
    const linha = (j, i, cols) => {
      const sel = (j.aderencia_eixo != null && j.aderencia_eixo >= 66.7) ? ' class="esb-forte"' : '';
      const meus = {};
      criteriosDe(j.detalhe).forEach(c => { meus[c.nome] = c; });
      const celulas = (cols || []).map(nome => {
        const c = meus[nome];
        if (!c || c.pct == null) return '<td class="esb-num esb-crit esb-suave">—</td>';
        const cls = c.piso == null ? 'esb-crit-neutro'
                  : (c.pct >= c.piso ? 'esb-crit-ok' : 'esb-crit-fraco');
        const piso = c.piso == null ? '' : '<span class="esb-crit-piso">/' + fmt(c.piso, 0) + '</span>';
        const t = c.nome + ': ' + fmt(c.pct, 0) +
                  (c.piso == null ? ' (medido, sem piso na ficha)' : ' · a ficha pede ' + fmt(c.piso, 0));
        return '<td class="esb-num esb-crit ' + cls + '" title="' + esc(t) + '">' +
               fmt(c.pct, 0) + piso + '</td>';
      }).join('');
      /* O desconto de liga, na propria celula do eixo. Linha da Serie B nao tem desconto: ela JA
         esta na escala. Linha que encostou no teto ganha marca, porque ali a ordem parou de
         medir merito e passou a medir o limite da conversao. */
      const noTeto = (j.aderencia_eixo != null && TETO != null && j.aderencia_eixo >= TETO - 0.2);
      const origem = (j.aderencia_eixo_origem == null) ? '' :
        '<span class="esb-orig" title="percentil na liga de origem, antes do desconto de ' +
        'conversão de J08">' + fmt(j.aderencia_eixo_origem, 0) + '→</span>';
      const desconto = (j.desconto_do_eixo == null) ? '' :
        '<span class="esb-desc" title="o que a conversão de liga de J08 desconta deste jogador">' +
        fmt(j.desconto_do_eixo, 1) + '</span>';
      const merc = j.mercado || 'Série B';
      /* O FATOR COMPROMETIDO. A conversão de liga vem do J08, que é ajustado sobre um painel em
         que algumas liga-temporada têm o rótulo errado (elenco de outro país, ou várias divisões
         sob um nome só). Onde isso acontece a linha ganha marca: o número dela não tem a mesma
         confiança dos outros, e sair igual seria a tela afirmando o que não mediu. */
      const comp = j.fator_comprometido
        ? '<span class="esb-comp-fator" title="' + esc(j.fator_comprometido) +
          ' — a conversão desta liga não tem a mesma confiança das outras">⚠</span>'
        : '';
      const cls = (sel ? ' class="esb-forte' : ' class="') + (j.fator_comprometido ? ' esb-linha-comp' : '') + '"';
      return '<tr' + cls + '><td class="esb-num">' + i + '</td>' +
        '<td>' + esc(j.jogador) +
        (j.estrangeiro ? ' <span class="esb-flag" title="estrangeiro: ocupa vaga">⚑</span>' : '') +
        (j.passaporte ? ' <span class="esb-pass" title="passaporte ' + esc(j.passaporte) +
          (j.estrangeiro ? '' : ' — não ocupa vaga de estrangeiro') + '">' +
          esc(j.passaporte) + '</span>' : '') +
        '</td>' +
        '<td><span class="esb-merc esb-merc-' + (CLASSE_MERC[merc] || 'ex') + '">' + esc(merc) +
        '</span></td>' +
        '<td>' + esc(j.clube || '—') +
        (merc === 'Série B' ? '' : ' <span class="esb-liga" title="liga de origem' +
          (j.forca_do_fator ? ' · fator de conversão ' + esc(j.forca_do_fator) : '') + '">' +
          esc(j.liga || '') + '</span>') + '</td>' +
        '<td class="esb-num">' + fmt(j.idade, 0) + '</td>' +
        '<td class="esb-num' + (noTeto ? ' esb-no-teto' : '') + '"' +
          (j.eixo_detalhe ? ' title="' + esc(j.eixo_detalhe) + '"' : '') + '>' +
          origem + '<b>' + (j.aderencia_eixo == null ? '—' : fmt(j.aderencia_eixo, 1)) + '</b>' +
          desconto + comp + '</td>' +
        '<td class="esb-num">' + (j.aderencia_desempate == null ? '—' : fmt(j.aderencia_desempate, 1)) + '</td>' +
        '<td class="esb-num esb-suave">' + j.atende + '/' + j.com_dado + '</td>' +
        '<td class="esb-num esb-suave">' + fmt(j.aderencia, 1) + '</td>' +
        '<td class="esb-num ' + ((j.folga || 0) < 0 ? 'esb-neg' : '') + '">' +
          (j.folga > 0 ? '+' : '') + fmt(j.folga, 1) + '</td>' +
        '<td>' + (j.livre ? '<span class="esb-ct-ok">vencendo</span>' : '—') + '</td>' +
        celulaValor(j.jogador, j.clube) + celulas + '</tr>';
    };
    const bloco = (b) => {
      const vis = b.jogadores.slice(0, 12);
      const resto = b.jogadores.slice(12);
      const cols = [];
      b.jogadores.forEach(j => criteriosDe(j.detalhe).forEach(c => {
        if (c.nome && cols.indexOf(c.nome) < 0) cols.push(c.nome);
      }));
      const pisos = {};
      b.jogadores.forEach(j => criteriosDe(j.detalhe).forEach(c => {
        if (c.piso != null && pisos[c.nome] == null) pisos[c.nome] = c.piso;
      }));
      const cabCrit = cols.map(n => {
        const p = pisos[n];
        const t = n + (p == null ? ' — medido, mas a ficha não exige piso'
                                 : ' — a ficha pede ' + fmt(p, 0) + ' de percentil');
        return '<th class="esb-num esb-crit-cab" title="' + esc(t) + '">' + esc(nomeCurto(n)) +
               (p == null ? '' : '<span class="esb-crit-piso"> ' + fmt(p, 0) + '</span>') + '</th>';
      }).join('');
      const cab = '<tr><th class="esb-num">#</th><th>jogador</th><th>mercado</th>' +
        '<th>clube</th><th class="esb-num">idade</th>' +
        '<th class="esb-num" title="MANDA NA ORDEM: média do percentil dele em toques na área e ' +
        'passes progressivos — o eixo da qualidade da chance, o único traço firme do estudo. ' +
        'Em quem vem de fora, o número pequeno à esquerda é o percentil na liga de origem e o da ' +
        'direita é o desconto que a conversão de J08 aplica.">eixo</th>' +
        '<th class="esb-num" title="DESEMPATE: média do percentil dele nos critérios de físico e ' +
        'de duelo da ficha da posição">físico e duelo</th>' +
        '<th class="esb-num esb-suave" title="critérios que ele cruza, de quantos foram medidos. ' +
        'NÃO manda na ordem: como conjunção, a ficha reprova quase todo mundo (J06-1).">atende</th>' +
        '<th class="esb-num esb-suave" title="média do percentil dele em TODOS os critérios da ' +
        'posição, 0 a 100">aderência</th>' +
        '<th class="esb-num" title="média de (percentil − piso): negativo é abaixo do que a ficha pede">folga</th>' +
        '<th>contrato</th>' +
        '<th class="esb-num" title="valor de mercado no Transfermarkt' +
          (VMER ? ', ' + esc(VMER.coletado_em) : '') + ' — em EURO. Quem não tem ficha sai ' +
          'com traço, e não com zero.">valor</th>' + cabCrit + '</tr>';
      const deQuem = (b.ficha_de && b.ficha_de !== b.posicao)
        ? ' · ficha de ' + esc(b.ficha_de) + ', ' + b.criterios_da_ficha + ' critérios'
        : ' · ficha de ' + b.criterios_da_ficha + ' critérios';
      const comp = Object.keys(b.por_mercado || {})
        .map(m => esc(m) + ' ' + b.por_mercado[m]).join(' · ');
      return '<div class="esb-pos"><h4>' + esc(b.posicao) +
        '<span class="esb-conta">' + b.quantos + ' com rodagem' + deQuem +
        (comp ? '<span class="esb-comp">' + comp + '</span>' : '') + '</span></h4>' +
        '<table class="esb-tab-tec"><thead>' + cab + '</thead><tbody>' +
        vis.map((j, i) => linha(j, i + 1, cols)).join('') + '</tbody></table>' +
        (resto.length
          ? '<details class="esb-graf-tabela"><summary>ver os outros ' + resto.length +
            '</summary><table class="esb-tab-tec"><tbody>' +
            resto.map((j, i) => linha(j, i + 13, cols)).join('') + '</tbody></table></details>'
          : '') + '</div>';
    };
    const corte = K.corte_de_minutagem;
    const total = K.listas.reduce((a, L) => a + L.quantos, 0);
    return '<section class="esb-secao esb-ranking" id="esb-ranking">' +
      '<h3>Quem roda, na ordem do eixo do modelo<span class="esb-conta">' +
      total + ' nomes em três listas' +
      (corte ? ' · ' + corte['saíram'] + ' saíram no corte da Série B' : '') + '</span></h3>' +
      '<p class="esb-aviso-forte"><b>Minutagem elimina; o resto ordena.</b> Só entra aqui quem tem ' +
      'minutagem alta e repetida — o <i>único</i> requisito que a base sustenta por posição ' +
      '(J05-3). A ordem é o <b>eixo</b>: toques na área e passes progressivos, a tradução no ' +
      'jogador de “chegar a finalizar de dentro”, que é o único traço firme do estudo (A02-1) e o ' +
      'que o A15-1 confirmou dentro do próprio time. <b>Físico e duelo</b> desempatam. ' +
      '<b>atende</b> e <b>aderência</b> ficam na tabela e não mandam na ordem: como conjunção de ' +
      '4 a 6 pisos, a ficha reprova quase todo mundo, e foi isso que o J06-1 mediu. ' +
      '<b>Isto mede semelhança com o passado, não chance de dar certo</b> — o J05 diz na manchete ' +
      'que o perfil “descreve quem subiu e não promete quem vai subir”. Quem jogou pouco por ' +
      '<i>lesão</i> cai no corte junto com quem jogou pouco por escolha: o J01-2 mediu que a base ' +
      'não distingue os dois, e por isso o número de quem saiu vai à vista, no topo.</p>' +
      '<p class="esb-aviso-forte"><b>Três listas separadas, e uma régua com teto.</b> ' +
      'Série B primeiro; depois os demais campeonatos sul-americanos, com a Série A dentro; e ' +
      'por fim brasileiros e sul-americanos espalhados pelo resto do mundo. As três seguem a ' +
      'mesma regra, e vão separadas de propósito: quem monta elenco não escolhe entre um volante ' +
      'da Série B e um do Manchester City — escolhe dentro de um mercado por vez. ' +
      'Quem vem de fora tem o percentil ' +
      'convertido para a escala da Série B pelo fator de liga do J08 — e essa conversão tem ' +
      '<b>teto aritmético' + (TETO != null ? ' de ' + fmt(TETO, 1) : '') + '</b> na família do ' +
      'eixo, enquanto quem já está na Série B pode chegar a 100. <b>Por isso o topo de cada ' +
      'posição é da Série B por construção, não por mérito medido.</b> Para que a ordem seja ' +
      'legível em vez de absurda, cada linha de fora traz o percentil <i>na liga de origem</i> à ' +
      'esquerda e o <i>desconto</i> à direita: é assim que se vê que um atacante que aparece ' +
      'abaixo de outro tinha 98 em casa e levou 25 pontos de desconto na conversão. ' +
      '<b>Passaporte à vista:</b> quem tem passaporte brasileiro não ocupa vaga de estrangeiro, ' +
      'jogue onde jogar, e ⚑ marca quem ocupa. No <b>gol</b> só há Série B: nenhum goleiro de ' +
      'fora tem regularidade verificável, que é a mesma lacuna do J09-3.</p>' +
      /* A ressalva do painel. Ela e' montada do _painel_suspeito.json, regeneravel: quando o
         Portal Ranking corrigir o rotulo, o arquivo esvazia e este paragrafo some sozinho. */
      (function () {
        const P = K.painel_suspeito;
        if (!P || !(P.liga_temporada_comprometida || []).length) return '';
        const marcadas = K.listas.reduce((t, L) => t + L.blocos.reduce((a, b) =>
          a + b.jogadores.filter(j => j.fator_comprometido).length, 0), 0);
        const ligas = P.ligas_afetadas.map(x => esc(x.liga)).join(', ');
        const pa = (P.sensibilidade_do_fator.por_fator || [])
          .filter(x => x.liga === 'Portugal A');
        const conta = pa.map(x => esc(x.familia) + ' de ' + fmt(x.publicado, 2) + ' para ' +
          fmt(x.sem_os_casos, 2)).join(' e ');
        const lt = P.liga_temporada_comprometida.map(x =>
          '<li><b>' + esc(x.liga) + ' ' + esc(x.temporada) + '</b> — ' + esc(x.tipo) + ': ' +
          x.times + ' times onde a mediana da liga é ' + x.mediana_da_liga + ', e ' +
          x.sobreposicao_pct + '% deles aparecem nessa liga em outra temporada</li>').join('');
        return '<div class="esb-painel-aviso"><h4>⚠ ' + marcadas + ' linhas têm o fator de ' +
          'conversão comprometido</h4>' +
          '<p>O número que converte o percentil de fora para a escala da Série B sai do J08, que ' +
          'é ajustado sobre o painel de temporadas do Wyscout. Em ' +
          P.liga_temporada_comprometida.length + ' liga-temporada esse painel está com o ' +
          '<b>rótulo errado</b> — ou o elenco é de outro país, ou várias divisões estão sob um ' +
          'nome só. As linhas de <b>' + ligas + '</b> dependem disso e vão marcadas com ⚠.</p>' +
          '<ul class="esb-painel-lista">' + lt + '</ul>' +
          '<p><b>O tamanho do problema, medido.</b> Rodando o J08 sem os ' +
          P.sensibilidade_do_fator.casos_afetados + ' casos afetados (de ' +
          P.sensibilidade_do_fator.casos_totais + '), o fator de Portugal A vai de ' + conta +
          ' — ou seja, o degrau positivo de Portugal é sustentado por três transferências de uma ' +
          'temporada em que 74 times foram empilhados sob esse rótulo. ' +
          esc(P.sensibilidade_do_fator.o_que_nao_se_move) + ' ' +
          esc(P.sensibilidade_do_fator.conclusoes_do_j08) + '</p>' +
          '<p class="esb-painel-pe"><b>Isto não é conserto.</b> ' +
          esc(P.sensibilidade_do_fator.o_que_nao_e) + ' O painel é copiado do Portal Ranking, e é ' +
          'lá que o rótulo precisa ser corrigido; além disso o percentil de cada foto já vem ' +
          'normalizado da fonte, dentro de liga e posição, então a conta errada nasce antes de ' +
          'chegar aqui. Enquanto isso, a marca serve para que ninguém leia estas linhas como se ' +
          'fossem iguais às outras.</p></div>';
      })() +
      /* AS TRES LISTAS, 22/09. Ate entao era uma lista so' por posicao, com a Serie B
         embolada com estrangeiro e com o exterior INTEIRO dentro — o que trouxe meio top-5
         europeu para uma tela de montagem de elenco do Santa Cruz. Nenhum deles e' alvo, e a
         ordem unica escondia isso atras de um numero bem calculado. */
      K.listas.map(function (L, i) {
        return '<div class="esb-lista-bloco" id="esb-lista-' + esc(L.chave) + '">' +
          '<h4 class="esb-lista-titulo"><span class="esb-lista-n">' + (i + 1) + '</span>' +
          esc(L.titulo) + '<span class="esb-conta">' + L.quantos + ' nomes' +
          (L.candidatos && L.candidatos !== L.quantos
            ? ' de ' + L.candidatos + ' com rodagem' : '') + '</span></h4>' +
          '<p class="esb-lista-sub">' + esc(L.subtitulo) +
          (L.teto_por_mercado ? ' Entram os ' + L.teto_por_mercado +
            ' primeiros de cada mercado, por posição.' : '') + '</p>' +
          L.blocos.map(bloco).join('') + '</div>';
      }).join('') +
      '<p class="esb-nota">Custo, disponibilidade e encaixe no modelo de jogo ficam para validação ' +
      'externa. Na Série B a rodagem é no próprio campeonato; nas outras duas listas, na liga ' +
      'de origem.</p>' +
      /* 22/09. O filtro de rodagem nos mercados de fora PERDEU a justificacao medida, e a
         tela tem de dizer isso em vez de continuar citando o achado que caiu. */
      '<p class="esb-nota"><b>Por que a rodagem elimina, e o que mudou em 22/09.</b> Até ' +
      'ontem esta tela dizia que o filtro vinha de um achado medido — o J09-1, “estrangeiro ' +
      'que já rodava joga mais no primeiro ano”. Aquele achado <b>caiu</b>: ele era efeito ' +
      'de um defeito na chave que cruza a base com o painel de temporadas, que só casava ' +
      'nomes escritos por extenso — ou seja, brasileiros. Com a chave certa o efeito ' +
      'desaparece (o J09-1 reescrito mostra os números). A rodagem <b>continua ' +
      'eliminando</b>, mas como critério prático da casa: quem não joga na liga dele não é ' +
      'alvo. É uma regra de triagem, e não um número — e é assim que ela deve ser ' +
      'defendida numa reunião.</p>' +
      '</section>';
  }

  function treinadoresHtml() {
    const T = D.treinadores;
    if (!T || !T.lista || !T.lista.length) return '';
    const fmt = (v, c) => v == null ? '—' :
      Number(v).toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
    const porMedia = T.lista.slice().sort((a, b) => b.pct_g4_medio - a.pct_g4_medio);
    const porPior = T.lista.slice().sort((a, b) => b.pct_g4_pior - a.pct_g4_pior);
    const postoPior = new Map(porPior.map((t, i) => [t.treinador, i + 1]));
    const postoMedia = new Map(porMedia.map((t, i) => [t.treinador, i + 1]));
    const linha = (t, i) => '<tr>' +
      '<td class="esb-num">' + (i + 1) + '</td>' +
      '<td>' + esc(t.treinador) + '</td>' +
      '<td class="esb-num">' + fmt(t.pct_g4_medio, 1) + '</td>' +
      '<td class="esb-num">' + fmt(t.pct_g4_pior, 1) + '</td>' +
      '<td class="esb-num esb-suave">' + postoMedia.get(t.treinador) + 'º / ' +
        postoPior.get(t.treinador) + 'º</td>' +
      '<td class="esb-num">' + t.passagens + '</td>' +
      '<td class="esb-num">' + t.clubes + '</td>' +
      '<td class="esb-num">' + t.rodadas + '</td>' +
      '<td class="esb-num">' + fmt(t.ppj, 2) + '</td>' +
      '<td class="esb-num esb-suave">' + fmt(t.posto_valor_mediano, 1) + 'º</td></tr>';
    const tabela = (lista, id, oculta) =>
      '<table class="esb-tab-tec' + (oculta ? ' esb-oculto' : '') + '" data-ord="' + id + '"><thead>' +
      '<tr><th class="esb-num">#</th><th>treinador</th>' +
      '<th class="esb-num" title="média das passagens">% G4 média</th>' +
      '<th class="esb-num" title="a pior passagem dele">% G4 piso</th>' +
      '<th class="esb-num" title="posto por média / posto por piso">posto</th>' +
      '<th class="esb-num">pass.</th><th class="esb-num">clubes</th>' +
      '<th class="esb-num">rodadas</th><th class="esb-num" title="pontos por jogo">ppj</th>' +
      '<th class="esb-num" title="posto mediano do valor do elenco no ano">$ elenco</th></tr>' +
      '</thead><tbody>' + lista.map(linha).join('') + '</tbody></table>';
    const falharam = T.premissas_que_falharam || {};
    return '<section class="esb-secao esb-tec" id="esb-treinadores">' +
      '<h3>Todos os treinadores, do melhor para o pior<span class="esb-conta">' +
      T.lista.length + ' com ' + (T.min_rodadas_total || 30) + ' rodadas ou mais</span></h3>' +
      '<p class="esb-aviso-forte"><b>Esta lista ordena o que aconteceu, não quem é melhor.</b> ' +
      'As duas premissas que permitiriam lê-la como previsão falharam: ' +
      Object.keys(falharam).map(k => '<b>' + esc(k) + '</b> — ' + esc(falharam[k])).join('; ') +
      '. Por isso ela vai com os dois critérios lado a lado: trocar a média pelo piso muda o ' +
      'pódio, e é essa instabilidade que a parte T04 publica como achado.</p>' +
      '<div class="esb-filtro-grupo esb-tec-ord" role="group" aria-label="ordenar a lista">' +
      '<button type="button" class="esb-filtro-bt" data-tec="media" aria-pressed="true">pela média</button>' +
      '<button type="button" class="esb-filtro-bt" data-tec="pior" aria-pressed="false">pelo piso</button>' +
      '</div>' +
      tabela(porMedia, 'media', false) + tabela(porPior, 'pior', true) +
      '<p class="esb-nota">' + esc(T.criterio || '') + '</p>' +
      '</section>';
  }

  /* ============================ A PÁGINA DE DECISÕES ============================
     O estudo responde 27 perguntas e tem 74 conclusões. Quem decide não lê 74 conclusões, e
     nem deveria: a decisão já está lá dentro, só espalhada. Esta seção traz a decisão para a
     frente e deixa as perguntas como o anexo que a sustenta.

     Três coisas que ela faz de propósito, e que a separam de um slide:

     1. **Cada decisão leva o selo da conclusão de origem.** "Monte para 64 pontos" (indício) e
        "o eixo do modelo é a qualidade da chance" (firme) não têm o mesmo peso de prova, e
        quem decide precisa saber em qual dos dois está pisando. Esconder isso seria vender
        certeza que não existe.
     2. **Cada decisão leva a RESSALVA junto**, no mesmo bloco, não num rodapé. A ressalva é a
        primeira coisa que morre quando se resume — e numa página que vai para a diretoria ela
        é justamente o que evita a decisão errada.
     3. **Nenhum número é digitado aqui.** Eles vêm resolvidos do gerar_decisoes.py, que lê os
        mesmos <ID>_numeros.json que o portão confere e FALHA se um marcador não existir. */
  function decisoesHtml() {
    const D2 = D.decisoes;
    if (!D2 || !D2.decisoes || !D2.decisoes.length) return '';
    const grupos = [];
    D2.decisoes.forEach(d => {
      let g = grupos.find(x => x.nome === d.grupo);
      if (!g) { g = { nome: d.grupo, itens: [] }; grupos.push(g); }
      g.itens.push(d);
    });
    const item = d =>
      '<article class="esb-dec" id="esb-' + esc(d.id) + '">' +
        '<div class="esb-dec-topo">' +
          '<span class="esb-dec-id">' + esc(d.id) + '</span>' +
          '<h4>' + esc(d.decisao) + '</h4>' +
          '<span class="' + classeSelo(d.confianca) + '">' + selo(d.confianca) + '</span>' +
        '</div>' +
        '<p class="esb-dec-porque">' + esc(d.porque) + '</p>' +
        '<p class="esb-dec-ressalva"><b>Mas:</b> ' + esc(d.ressalva) + '</p>' +
        '<div class="esb-dec-pe">' +
          (d.conclusao
            ? '<a href="#esb-' + esc(d.conclusao) + '">' + esc(d.conclusao) + '</a>'
            : '<span>' + esc(d.de) + '</span>') +
          '<span class="esb-dec-de">' + esc(d.de) + '</span></div>' +
      '</article>';
    return '<section class="esb-secao esb-decisoes" id="esb-decisoes">' +
      '<h3>O que fazer<span class="esb-conta">' + D2.decisoes.length + ' decisões</span></h3>' +
      '<p class="esb-nota">' + esc(D2.como_ler) + '</p>' +
      grupos.map(g => '<div class="esb-dec-grupo"><h4 class="esb-dec-gnome">' + esc(g.nome) +
        '</h4>' + g.itens.map(item).join('') + '</div>').join('') +
      '</section>';
  }

  /* As quatro regras de leitura. Por que elas estao NA TELA, e nao so no CLAUDE.md: o CLAUDE.md
     e o manual de quem RODA a analise, e quem le a analise nunca abriu esse arquivo. Cada regra
     nasceu de um numero que este estudo produziu e que teria enganado a casa — por isso vem com
     a conta junto, e nao como decalogo de metodo. O texto e os numeros chegam prontos do
     scripts/gerar_regras.py, que falha se um marcador sumir. */
  function regrasHtml() {
    const G = D.regras;
    if (!G || !G.regras || !G.regras.length) return '';
    const item = r =>
      '<article class="esb-regra" id="esb-' + esc(r.id) + '">' +
        '<div class="esb-regra-topo">' +
          '<span class="esb-regra-n">' + esc(r.id.replace('R', '')) + '</span>' +
          '<h4>' + esc(r.regra) + '</h4>' +
        '</div>' +
        '<p class="esb-regra-evita"><b>Evita:</b> ' + esc(r.evita) + '</p>' +
        '<p class="esb-regra-conta">' + esc(r.conta) + '</p>' +
        '<div class="esb-dec-pe">' +
          (r.conclusao
            ? '<a href="#esb-' + esc(r.conclusao) + '">' + esc(r.conclusao) + '</a>'
            : '<span>' + esc(r.de) + '</span>') +
          '<span class="esb-dec-de">' + esc(r.de) +
          (r.decisao ? ' · ' + esc(r.decisao) : '') + '</span></div>' +
      '</article>';
    return '<section class="esb-secao esb-regras" id="esb-regras">' +
      '<h3>Como ler um número daqui<span class="esb-conta">' + G.regras.length +
      ' regras</span></h3>' +
      '<p class="esb-nota">' + esc(G.como_ler) + '</p>' +
      G.regras.map(item).join('') + '</section>';
  }

  /* A secao de fisico. Oito partes mediram corrida (A07, A10, A11, A20 no time; J04, J05, J10,
     J11 no jogador) e nenhuma responde sozinha "afinal o fisico importa?": quem le so a A07
     conclui que nao, quem le so o J10-2 conclui que se contrata volante por corrida forte. As
     duas leituras estao erradas. Junta-se aqui porque e o assunto em que a casa mais gasta sem
     numero, e termina na ficha de contratacao porque e nisso que toda parte tem de terminar. */
  function fisicoHtml() {
    const F = D.fisico;
    if (!F || !F.blocos || !F.blocos.length) return '';
    const bloco = b =>
      '<article class="esb-fis" id="esb-' + esc(b.id) + '">' +
        '<div class="esb-fis-topo">' +
          '<h4>' + esc(b.titulo) + '</h4>' +
          '<span class="' + classeSelo(b.confianca) + '">' + selo(b.confianca) + '</span>' +
        '</div>' +
        '<p class="esb-fis-texto">' + esc(b.texto) + '</p>' +
        '<div class="esb-dec-pe">' +
          (b.conclusao
            ? '<a href="#esb-' + esc(b.conclusao) + '">' + esc(b.conclusao) + '</a>'
            : '<span>' + esc(b.de) + '</span>') +
          '<span class="esb-dec-de">' + esc(b.de) + '</span></div>' +
      '</article>';
    return '<section class="esb-secao esb-fisico" id="esb-fisico">' +
      '<h3>O que sabemos do físico<span class="esb-conta">' +
      (F.partes || []).length + ' partes</span></h3>' +
      '<p class="esb-nota">' + esc(F.como_ler) + '</p>' +
      F.blocos.map(bloco).join('') +
      '<div class="esb-fis-limites"><h4>Os limites desta seção</h4>' +
      (F.limites || []).map(l => '<p><b>' + esc(l.titulo) + '</b> ' + esc(l.texto) + '</p>').join('') +
      '</div></section>';
  }

  function casca() {
    const c = D.contagem;
    return '<div class="esb-topo">' +
      '<h2>Estudo Série B</h2>' +
      '<p class="esb-sub">O que diferencia os times por faixa, qual o treinador ideal e quem ' +
      'contratar em cada posição. Uma pergunta por vez — o roteiro inteiro está abaixo, com o ' +
      'estado de cada uma.</p>' +
      '<div class="esb-barra">' +
        '<span class="esb-pill esb-pill-val">' + c.validada + ' validadas</span>' +
        '<span class="esb-pill esb-pill-ras">' + c.rascunho + ' em rascunho</span>' +
        '<span class="esb-pill esb-pill-pen">' + c.pendente + ' pendentes</span>' +
        '<span class="esb-gerado">dado de ' + esc(D.gerado_em) + '</span>' +
      '</div>' +
      /* R01, 20/09. As abas Análise Série B e Protótipo saíram da barra do app: o conteúdo delas
         migrou para cá, mas elas continuam sendo de onde muita conclusão veio, e apagá-las
         apagaria a prova. Viram material auxiliar deste estudo, a um clique daqui. O botão
         original continua no index.html, escondido — é dele que o irParaAba() do app.js depende
         para trocar de página, e chamá-lo é o mesmo caminho da barra, sem duplicar nada. */
      '<p class="esb-atalhos">Atalhos: <a href="#esb-decisoes">o que fazer</a> · <a href="#esb-regras">como ler um número</a> · <a href="#esb-fisico">o físico</a></p>' +
      '<p class="esb-auxiliar">Material de onde este estudo partiu, fora da barra de abas: ' +
        '<a href="#" data-ir="serieb">Análise Série B</a> · ' +
        '<a href="#" data-ir="prototipo">Protótipo</a></p>' +
      '</div>' +
      decisoesHtml() +
      regrasHtml() +
      sumarioHtml() +
      filtroHtml() +
      decidimosHtml() +
      secaoHtml('Que time montar', 'A') +
      reguaHtml() +
      secaoHtml('Que treinador buscar', 'T') +
      treinadoresHtml() +
      fisicoHtml() +
      secaoHtml('Quem contratar', 'J') +
      livresHtml() +
      alvosHtml() +
      rankingHtml() +
      negativasHtml() +
      sabemosHtml() +
      tarefasHtml();
  }

  /* Os graficos sao elementos, e a tela e montada como texto: por isso o encaixe vazio
     no HTML e esta passada depois. Sem o estudo_serieb_grafico.js a aba segue funcionando,
     so sem desenho — nada aqui depende dele para renderizar o texto. */
  function montarGraficos(alvo) {
    if (!window.ESB_GRAFICO || !D) return;
    const porId = {};
    (D.partes || []).forEach(function (p) {
      (p.conclusoes || []).forEach(function (c) { if (c.id) porId[c.id] = c; });
    });
    alvo.querySelectorAll('.esb-graf-slot').forEach(function (slot) {
      const c = porId[slot.dataset.concl];
      if (!c) return;
      const fig = window.ESB_GRAFICO.montar(c, {}, slot.clientWidth || 560);
      if (fig) slot.appendChild(fig); else slot.remove();
    });
  }

  /* O filtro é de TELA, não de dado: ele esconde e mostra o que já está montado. Nada é
     recalculado, nada some do dado — quem abrir o console vê as 70 conclusões sempre. */
  function ligarFiltros(alvo) {
    const busca = alvo.querySelector('#esBusca');
    const bts = [...alvo.querySelectorAll('.esb-filtro-bt')];
    const conta = alvo.querySelector('#esFiltroConta');
    if (!busca || !bts.length) return;
    let estado = 'todas';

    const aplicar = () => {
      const termo = busca.value.trim().toLowerCase();
      let vistas = 0, total = 0;
      alvo.querySelectorAll('.esb-parte').forEach(el => {
        const okEstado = estado === 'todas' || el.dataset.status === estado;
        const okBusca = !termo || (el.dataset.busca || '').includes(termo);
        const mostra = okEstado && okBusca;
        el.classList.toggle('esb-oculto', !mostra);
        /* A conta é de PERGUNTA do estudo: E00 e R01 são tarefas de tela e ficam de fora,
           senão o rodapé diz 29 onde o estudo tem 27. */
        if (!el.closest('.esb-tarefas')) { total++; if (mostra) vistas++; }
      });
      /* As conclusões soltas ("O que decidimos", "Parece, mas não é") seguem só a busca: o
         estado delas já está dito pela seção em que estão. */
      alvo.querySelectorAll('.esb-decidimos .esb-concl, .esb-secao > .esb-concl').forEach(el => {
        const okBusca = !termo || (el.dataset.busca || '').includes(termo);
        el.classList.toggle('esb-oculto', !okBusca);
      });
      /* Seção que ficou sem nada visível sai junto, para não sobrar título órfão. */
      alvo.querySelectorAll('.esb-secao').forEach(sec => {
        if (sec.classList.contains('esb-livres')) return;
        const filhos = sec.querySelectorAll('.esb-parte, .esb-concl');
        const algum = [...filhos].some(el => !el.classList.contains('esb-oculto'));
        sec.classList.toggle('esb-oculto', filhos.length > 0 && !algum);
      });
      conta.textContent = (estado === 'todas' && !termo)
        ? '' : vistas + ' de ' + total + (total === 1 ? ' pergunta' : ' perguntas');
    };

    bts.forEach(bt => bt.addEventListener('click', () => {
      estado = bt.dataset.filtro;
      bts.forEach(o => o.setAttribute('aria-pressed', String(o === bt)));
      aplicar();
    }));
    busca.addEventListener('input', aplicar);
    /* A troca de critério da lista de treinadores: as duas tabelas já estão montadas, o botão
       só decide qual aparece. Trocar de ordem não recalcula nada. */
    alvo.querySelectorAll('.esb-tec-ord .esb-filtro-bt').forEach(bt => {
      bt.addEventListener('click', () => {
        alvo.querySelectorAll('.esb-tec-ord .esb-filtro-bt').forEach(o =>
          o.setAttribute('aria-pressed', String(o === bt)));
        alvo.querySelectorAll('.esb-tab-tec').forEach(t =>
          t.classList.toggle('esb-oculto', t.dataset.ord !== bt.dataset.tec));
      });
    });
    busca.addEventListener('keydown', e => {
      if (e.key === 'Escape') { busca.value = ''; aplicar(); }
    });
  }

  function render() {
    const alvo = document.getElementById('esCorpoPagina');
    if (!alvo) return;
    if (!D) {
      alvo.innerHTML = '<p class="esb-nota">O dado do estudo não carregou: falta o ' +
        'static/estudo_serieb_dados.js (rode o gerar_estudo_serieb_js.py).</p>';
      return;
    }
    /* com a subaba V1 escondida nao monta: os graficos medem a largura. estudo_v2.js chama
       window.esRender de novo quando a V1 aparece. */
    if (alvo.offsetParent === null) return;
    if (alvo.dataset.montado) return;   // a tela é estática; montar uma vez basta
    alvo.innerHTML = casca();
    alvo.querySelectorAll('[data-ir]').forEach(a => {
      a.onclick = e => {
        e.preventDefault();
        const b = document.querySelector('.aba[data-aba="' + a.dataset.ir + '"]');
        if (b) b.click();          /* mesmo caminho da barra: o onclick dela chama irParaAba */
      };
    });
    montarGraficos(alvo);
    ligarFiltros(alvo);
    alvo.dataset.montado = '1';
  }

  /* Trocar de tema tem de repintar o desenho: a paleta e escolhida na hora de montar, e o
     SVG nao herda cor do CSS. Os encaixes ficam, so as figuras sao refeitas. */
  function repintarGraficos(alvo) {
    alvo.querySelectorAll('.esb-graf-slot').forEach(function (slot) { slot.textContent = ''; });
    montarGraficos(alvo);
  }

  function ligar() {
    const bt = document.querySelector('.aba[data-aba="estudo"]');
    const pg = document.getElementById('pgEstudo');
    if (!bt || !pg) return;
    const sync = () => {
      const on = bt.classList.contains('on');
      pg.classList.toggle('oculta', !on);
      if (on) render();
    };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(function () {
      const alvo = document.getElementById('esCorpoPagina');
      if (alvo && alvo.dataset.montado) repintarGraficos(alvo);
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  window.esRender = render;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar);
  else ligar();
})();
