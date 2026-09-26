/* Aba "Estudo Série B V2": o estudo Santa Cruz V2 (set/26). Texto do proprio estudo — os .md de
   `Santa Cruz V2/` convertidos por gerar_estudo_v2_js.py em static/estudo_v2_dados.js.
   Menu a esquerda por grupo (Conclusoes, Recomendacao, Blocos, Metodo), um documento por vez.
   O estudo antigo (Estudo Série B V1) e as abas Análise Série B e Protótipo viraram material
   auxiliar: botoes escondidos na barra, alcancados pelo link no alto do menu. */
(function () {
  const D = window.ESTUDO_V2;
  const LS_DOC = 'esV2Doc';
  const ler = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let docAtual = ler(LS_DOC);   /* em memoria: sem localStorage (aba privada) o clique vale igual */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dataBR = iso => iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4) : '';

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

  function render() {
    const alvo = document.getElementById('esV2Corpo');
    if (!alvo) return;
    if (!D || !D.docs || !D.docs.length) {
      alvo.innerHTML = '<p class="esv-vazio">O dado do estudo V2 não carregou: rode ' +
        '<code>python3 gerar_estudo_v2_js.py</code>.</p>';
      return;
    }
    if (!D.docs.some(d => d.id === docAtual)) docAtual = D.docs[0].id;
    const d = D.docs.find(x => x.id === docAtual);
    /* o menu e' remontado a cada clique: guarda onde ele estava rolado, senao volta ao topo (26/09) */
    const menuAntes = alvo.querySelector('.esv-menu'); const rolMenu = menuAntes ? menuAntes.scrollTop : 0;
    alvo.innerHTML =
      '<nav class="esv-menu">' +
        '<div class="esv-cab"><b>Santa Cruz V2</b><span>estudo novo, do zero · Série B 2022–2026</span>' +
        '<span>gerado em ' + dataBR(D.gerado) + '</span></div>' +
        menuHtml(docAtual) +
        '<div class="esv-grupo"><div class="esv-grupo-t">Estudos anteriores</div>' +
          '<a href="#" class="esv-item esv-aux" data-ir="estudo">Estudo Série B V1</a>' +
          '<a href="#" class="esv-item esv-aux" data-ir="serieb">Análise Série B</a>' +
          '<a href="#" class="esv-item esv-aux" data-ir="prototipo">Protótipo</a></div>' +
      '</nav>' +
      '<div class="esv-leitura"><article class="esv-doc">' +
        '<div class="esv-doc-meta">' + esc(d.grupo) + ' · <code>' + esc(d.arquivo) + '</code> · ' +
        dataBR(d.data) + '</div><h2>' + esc(d.titulo) + '</h2>' + d.html + '</article></div>';
    const menuDepois = alvo.querySelector('.esv-menu'); if (menuDepois) menuDepois.scrollTop = rolMenu;
    const leitura = alvo.querySelector('.esv-leitura'); if (leitura) leitura.scrollTop = 0;   /* o documento novo comeca do inicio; o menu fica onde estava */
    alvo.querySelectorAll('button.esv-item').forEach(b => {
      b.onclick = () => {
        docAtual = b.dataset.doc;
        gravar(LS_DOC, docAtual);
        render();
      };
    });
    /* nome em negrito dentro de tabela = jogador: clique abre a ficha da Consulta (26/09) */
    if (window.csJanela) alvo.querySelectorAll('.esv-doc table td > strong, .esv-doc table td > b').forEach(el => {
      const td = el.parentElement, tr = td.parentElement;
      const nome = el.textContent.trim(); if (nome.length < 3 || /^\d/.test(nome)) return;
      const prox = td.nextElementSibling ? td.nextElementSibling.textContent.trim() : '';
      if (!window.csExiste(nome, prox)) return;
      el.classList.add('esv-jog'); el.title = 'ver ficha'; el.onclick = () => window.csJanela(nome, prox);
    });
    alvo.querySelectorAll('[data-ir]').forEach(a => {
      a.onclick = e => {
        e.preventDefault();
        const b = document.querySelector('.aba[data-aba="' + a.dataset.ir + '"]');
        if (b) b.click();   /* mesmo caminho da barra: o onclick dela chama irParaAba */
      };
    });
  }

  function ligar() {
    const bt = document.querySelector('.aba[data-aba="estudo2"]');
    const pg = document.getElementById('pgEstudoV2');
    if (!bt || !pg) return;
    const sync = () => {
      const on = bt.classList.contains('on');
      pg.classList.toggle('oculta', !on);
      if (on) render();
    };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  window.esV2Render = render;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar);
  else ligar();
})();
