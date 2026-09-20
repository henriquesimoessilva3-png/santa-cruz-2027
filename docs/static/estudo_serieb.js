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

  function conclusaoHtml(c, compacta) {
    const n = c.n ? '<span class="esb-n">n = ' + esc(c.n) + '</span>' : '';
    const selos = '<span class="' + classeSelo(c.confianca) + '" ' +
      (c.confianca_motivo ? 'title="' + esc(c.confianca_motivo) + '"' : '') + '>' +
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
      '<th class="esb-num">fatia</th><th>contrato</th><th>ficha</th></tr>';
    const bloco = b => {
      if (!b.quantos) {
        return '<div class="esb-pos esb-pos-vazia"><h4>' + esc(b.posicao) +
          '<span class="esb-conta">nenhum, de ' + b.na_serie_b + ' na Série B</span></h4></div>';
      }
      return '<div class="esb-pos"><h4>' + esc(b.posicao) +
        '<span class="esb-conta">' + b.quantos + ' de ' + b.na_serie_b + ' na Série B · ' +
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
  function rankingHtml() {
    const K = D.ranking;
    if (!K || !K.serie_b || !K.serie_b.length) return '';
    const fmt = (v, c) => v == null ? '—' :
      Number(v).toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
    const linha = (j, i) => {
      const sel = j.atende === j.com_dado ? ' class="esb-forte"' : '';
      return '<tr' + sel + '><td class="esb-num">' + i + '</td>' +
        '<td>' + esc(j.jogador) +
        (j.estrangeiro ? ' <span class="esb-flag" title="estrangeiro: ocupa vaga">⚑</span>' : '') +
        (j.minutagem_regular ? ' <span class="esb-roda" title="minutagem alta e repetida">roda</span>' : '') +
        '</td><td>' + esc(j.clube || '—') + '</td>' +
        (K.exterior && K.exterior.length ? '' : '') +
        '<td class="esb-num">' + fmt(j.idade, 0) + '</td>' +
        '<td class="esb-num"><b>' + j.atende + '</b>/' + j.com_dado + '</td>' +
        '<td class="esb-num">' + fmt(j.aderencia, 1) + '</td>' +
        '<td class="esb-num ' + ((j.folga || 0) < 0 ? 'esb-neg' : '') + '">' +
          (j.folga > 0 ? '+' : '') + fmt(j.folga, 1) + '</td>' +
        '<td>' + (j.livre ? '<span class="esb-ct-ok">vencendo</span>' : '—') + '</td>' +
        '<td class="esb-suave esb-mini" title="' + esc(j.detalhe || '') + '">' +
          esc((j.detalhe || '').split(';').slice(0, 2).join(' ·')) + '…</td></tr>';
    };
    const bloco = (b, prefixo) => {
      const vis = b.jogadores.slice(0, 10);
      const resto = b.jogadores.slice(10);
      const cab = '<tr><th class="esb-num">#</th><th>jogador</th><th>clube</th>' +
        '<th class="esb-num">idade</th><th class="esb-num" title="critérios que ele cruza, ' +
        'de quantos foram medidos">atende</th>' +
        '<th class="esb-num" title="média do percentil dele nos critérios da posição, 0 a 100">aderência</th>' +
        '<th class="esb-num" title="média de (percentil − piso): negativo é abaixo do que a ficha pede">folga</th>' +
        '<th>contrato</th><th>onde ele está na ficha</th></tr>';
      return '<div class="esb-pos"><h4>' + esc(b.posicao) +
        '<span class="esb-conta">' + b.quantos + ' com dado · ficha de ' +
        b.criterios_da_ficha + ' critérios</span></h4>' +
        '<table class="esb-tab-tec"><thead>' + cab + '</thead><tbody>' +
        vis.map((j, i) => linha(j, i + 1)).join('') + '</tbody></table>' +
        (resto.length
          ? '<details class="esb-graf-tabela"><summary>ver os outros ' + resto.length +
            '</summary><table class="esb-tab-tec"><tbody>' +
            resto.map((j, i) => linha(j, i + 11)).join('') + '</tbody></table></details>'
          : '') + '</div>';
    };
    const fora = (K.exterior && K.exterior.length)
      ? '<h3 id="esb-ranking-fora">E os de fora, que a ficha quase não mede' +
        '<span class="esb-conta">' + K.exterior.reduce((a, b) => a + b.quantos, 0) +
        ' com rodagem na liga de origem</span></h3>' +
        '<p class="esb-aviso-forte"><b>Esta lista é mais fraca que a de cima, e a ordem dela é ' +
        'outra.</b> A base das ligas de origem mede no máximo 2 dos 4 a 6 critérios da ficha — o ' +
        'dado físico quase não existe fora daqui e o fator de conversão só traduz parte do ' +
        'técnico. Ordenar por aderência seria ordenar por um terço do perfil, e quem é medido em ' +
        'menos coisa erra menos. Então aqui a ordem é a <b>rodagem na liga de origem</b>, que é o ' +
        'que o J09 mostrou valer: estrangeiro que já vinha jogando muito fez mais minutos no ' +
        'primeiro ano de Série B. A coluna “atende” diz de quantos critérios a nota sai.</p>' +
        K.exterior.map(b => bloco(b, 'fora')).join('')
      : '';
    return '<section class="esb-secao esb-ranking" id="esb-ranking">' +
      '<h3>Quem mais se parece com o titular de quem subiu<span class="esb-conta">' +
      K.serie_b.reduce((a, b) => a + b.quantos, 0) + ' da Série B com dado</span></h3>' +
      '<p class="esb-aviso-forte"><b>Isto mede semelhança com o passado, não chance de dar certo.</b> ' +
      'A ficha de cada posição descreve o titular de quem subiu — e o J05 diz na manchete que ela ' +
      '“descreve quem subiu e não promete quem vai subir”. A ordem existe porque a ficha é uma ' +
      'conjunção de 4 a 6 pisos: exigir todos ao mesmo tempo responde quem é perfeito e esconde ' +
      'quem está perto. <b>atende</b> é quantos critérios ele cruza; <b>aderência</b> é a média do ' +
      'percentil dele nesses critérios, na mesma escala dos pisos; <b>folga</b> é o quanto ele ' +
      'fica acima ou abaixo do que a ficha pede.</p>' +
      K.serie_b.map(b => bloco(b, 'b')).join('') + fora +
      '<p class="esb-nota">Custo, disponibilidade e encaixe no modelo de jogo ficam para validação ' +
      'externa. O selo <b>roda</b> é minutagem alta e repetida; ⚑ é estrangeiro, que ocupa vaga.</p>' +
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
      '</div></div>' +
      sumarioHtml() +
      filtroHtml() +
      decidimosHtml() +
      secaoHtml('Que time montar', 'A') +
      reguaHtml() +
      secaoHtml('Que treinador buscar', 'T') +
      treinadoresHtml() +
      secaoHtml('Quem contratar', 'J') +
      livresHtml() +
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
    if (alvo.dataset.montado) return;   // a tela é estática; montar uma vez basta
    alvo.innerHTML = casca();
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
