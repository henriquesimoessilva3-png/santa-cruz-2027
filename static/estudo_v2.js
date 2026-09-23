/* Aba "Estudo Série B" com duas subabas: V2 (o estudo Santa Cruz V2, set/26) e V1 (o estudo
   antigo, desenhado por estudo_serieb.js). O V2 e texto do proprio estudo: os .md de
   `Santa Cruz V2/` convertidos por gerar_estudo_v2_js.py em static/estudo_v2_dados.js.
   Menu a esquerda por grupo (Conclusoes, Recomendacao, Blocos, Metodo), um documento por vez.
   A subaba e o documento abertos ficam no navegador. */
(function () {
  const D = window.ESTUDO_V2;
  const LS_SUB = 'esSubaba', LS_DOC = 'esV2Doc';
  const ler = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let docAtual = ler(LS_DOC);   /* em memoria: sem localStorage (aba privada) o clique vale igual */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function dataBR(iso) { return iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4) : ''; }

  function menuHtml(atual) {
    const grupos = [];
    D.docs.forEach(d => {
      let g = grupos.find(x => x.t === d.grupo);
      if (!g) grupos.push(g = { t: d.grupo, docs: [] });
      g.docs.push(d);
    });
    return grupos.map(g => '<div class="esv-grupo"><div class="esv-grupo-t">' + esc(g.t) + '</div>' +
      g.docs.map(d => '<button class="esv-item' + (d.id === atual ? ' on' : '') + '" data-doc="' +
        d.id + '">' + esc(d.rotulo) + '</button>').join('') + '</div>').join('');
  }

  function docHtml(d) {
    return '<article class="esv-doc">' +
      '<div class="esv-doc-meta">' + esc(d.grupo) + ' · <code>' + esc(d.arquivo) + '</code> · ' +
      dataBR(d.data) + '</div>' +
      '<h2>' + esc(d.titulo) + '</h2>' + d.html + '</article>';
  }

  function renderV2() {
    const alvo = document.getElementById('esV2Corpo');
    if (!alvo) return;
    if (!D || !D.docs || !D.docs.length) {
      alvo.innerHTML = '<p class="esv-vazio">O dado do estudo V2 não carregou: rode ' +
        '<code>python3 gerar_estudo_v2_js.py</code>.</p>';
      return;
    }
    let atual = docAtual;
    if (!D.docs.some(d => d.id === atual)) atual = D.docs[0].id;
    const doc = D.docs.find(d => d.id === atual);
    alvo.innerHTML =
      '<nav class="esv-menu">' +
        '<div class="esv-cab"><b>Santa Cruz V2</b><span>estudo novo, do zero · Série B 2022–2026</span>' +
        '<span>gerado em ' + dataBR(D.gerado) + '</span></div>' +
        menuHtml(atual) +
      '</nav>' +
      '<div class="esv-leitura">' + docHtml(doc) + '</div>';
    alvo.querySelectorAll('.esv-item').forEach(b => {
      b.onclick = () => {
        docAtual = b.dataset.doc;
        gravar(LS_DOC, docAtual);
        renderV2();
        const l = alvo.querySelector('.esv-leitura');
        if (l) l.scrollTop = 0;
      };
    });
  }

  function mostrar(sub) {
    const v2 = document.getElementById('esV2Wrap'), v1 = document.getElementById('esV1Wrap');
    if (!v2 || !v1) return;
    v2.hidden = sub !== 'v2';
    v1.hidden = sub !== 'v1';
    document.querySelectorAll('.esv-sub-bt').forEach(b => b.classList.toggle('on', b.dataset.sub === sub));
    gravar(LS_SUB, sub);
    if (sub === 'v2') renderV2();
    else if (window.esRender) window.esRender();   /* o V1 so monta visivel: os graficos medem a largura */
  }

  function ligar() {
    document.querySelectorAll('.esv-sub-bt').forEach(b => { b.onclick = () => mostrar(b.dataset.sub); });
    const bt = document.querySelector('.aba[data-aba="estudo"]');
    const sync = () => { if (bt && bt.classList.contains('on')) mostrar(ler(LS_SUB) === 'v1' ? 'v1' : 'v2'); };
    if (bt) new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar);
  else ligar();
})();
