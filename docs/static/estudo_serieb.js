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
    const prem = c.premissa
      ? '<p class="esb-premissa"><b>Premissa:</b> ' + esc(c.premissa) + '</p>'
      : (c.premissa_motivo
         ? '<p class="esb-premissa esb-premissa-vazia"><b>Premissa:</b> ' + esc(c.premissa_motivo) + '</p>'
         : '');
    return '<article class="esb-concl">' +
      '<h4>' + esc(c.manchete) + '</h4>' +
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
      return '<div class="esb-parte esb-pendente">' +
        '<span class="esb-id">' + esc(p.id) + '</span>' +
        '<span class="esb-pergunta">' + esc(p.pergunta) + '</span>' +
        '<span class="esb-status">ainda não respondida</span>' +
        '</div>';
    }
    const marca = p.status === 'validada' ? 'validada' : 'rascunho';
    return '<div class="esb-parte esb-' + marca + '">' +
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
      decidimosHtml() +
      secaoHtml('Que time montar', 'A') +
      secaoHtml('Que treinador buscar', 'T') +
      secaoHtml('Quem contratar', 'J') +
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
