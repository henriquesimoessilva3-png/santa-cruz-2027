/* 02/11/2026 — print em alta resolução (Henrique: "os prints que eu recorto, copio e colo no WhatsApp estão saindo ruins").
   O monitor LG é 1x (o Mac é Retina, 2x): o print da tela tem poucos pontos e a letra borra. Este botão desenha a tela
   aberta (a ficha do jogador, se estiver aberta; senão a página da aba) em 3x, inteira (não só o que cabe na tela), e
   copia a imagem — é só colar no WhatsApp. Também baixa o PNG. Biblioteca: static/modern-screenshot.min.js (v4.6.0). */
(function () {
  'use strict';
  const visivel = e => !!e && e.offsetParent !== null && !e.classList.contains('oculta');
  function alvo() {
    const f = document.getElementById('ficha'); if (visivel(f)) return f;
    const m = document.querySelector('main'); if (!m) return document.body;
    const filhos = [...m.querySelectorAll(':scope > *')].filter(e => visivel(e) && e.offsetHeight > 60);
    return filhos.length === 1 ? filhos[0] : m;
  }
  const nomeArq = () => {
    const f = document.getElementById('ficha');
    const n = visivel(f) && typeof fichaAtual !== 'undefined' && fichaAtual ? fichaAtual.n : (document.querySelector('.abas .on, .abas .ativo') || {}).textContent || 'tela';
    return 'print-' + String(n).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase() + '.png';
  };
  const aviso = (t, c) => { try { toast(t, c); } catch (e) { console.log(t); } };
  /* 03/11 (Henrique): o print da ficha sai sempre na organização do monitor grande (1.920 px: físico + os 4 blocos do
     técnico numa linha, minutagem/cobrador/finalizador numa linha), inteira e sem os botões, em 3x — em qualquer tela.
     Usa as regras de static/ficha_escala.js (classe ficha-escalada) com o zoom desligado enquanto desenha. */
  const CSS_PRINT = `#ficha.ficha-escalada.modo-print{zoom:1!important;width:1920px!important;min-width:1920px!important;max-width:none!important;height:auto!important;max-height:none!important;flex:none!important}
#ficha.modo-print .ficha-rolagem{height:auto!important;max-height:none!important;overflow:visible!important;flex:none!important}
#ficha.modo-print .ficha-topo button{display:none!important}
#ficha.modo-print .fi-res b{white-space:nowrap}
#ficha.ficha-escalada.modo-print.print-cel{width:1180px!important;min-width:1180px!important}
#ficha.modo-print.print-cel .sf-layout{grid-template-columns:minmax(0,1fr) minmax(0,1.9fr)!important}
#ficha.modo-print.print-cel .sf-tec-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
#ficha.modo-print.print-cel .sf-extra,#ficha.modo-print.print-cel .sf-extra:has(.bp-2){grid-template-columns:minmax(0,1fr)!important}`;
  /* 10/11 (Henrique: "a qualidade do print ainda não tá top… faz um mega Full HD"): o WhatsApp reduz a foto para 1.600 px
     (normal) ou 4.096 px (HD) no lado maior. O print largo (1.920 px de ficha, 2,5 × 1) encolhia a letra para menos da metade.
     O 📱 Celular monta a ficha em pé (1.180 px: físico ao lado do técnico em 2 × 2, minutagem/cobrador/finalizador embaixo)
     e desenha com o lado maior em 4.096 px — o tamanho exato do HD do WhatsApp, sem ele reduzir de novo. A letra fica
     ~1,6 vez maior no celular. O 📷 Print (largo) continua igual.
     13/11 (Henrique: "não quero esse negócio de celular… quero o print para computador, com a qualidade top"): sai o botão
     📱 Celular. O 📷 Print fica no formato do computador (1.920 px de ficha, tudo numa tela) e é desenhado com o lado maior
     em 4.096 px — o tamanho do HD do WhatsApp, que então não reduz a imagem de novo. Sem marcar HD, o WhatsApp corta para
     1.600 px e a letra borra: marcar HD ou mandar como documento. */
  const HD = 4096;
  const quadro = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 250))));
  async function gerar(el, cel) {
    const bg = getComputedStyle(document.body).backgroundColor || '#0d0f13';
    const ehFicha = el.id === 'ficha';
    let st = null;
    if (ehFicha) {
      st = document.createElement('style'); st.id = 'cssModoPrint'; st.textContent = CSS_PRINT; document.head.appendChild(st);
      el.classList.add('modo-print', 'ficha-escalada'); if (cel) el.classList.add('print-cel'); await quadro();
    }
    try {
      const larg = Math.max(el.scrollWidth, el.offsetWidth), alt = Math.max(el.scrollHeight, el.offsetHeight);
      const esc = Math.max(2, HD / Math.max(larg, alt));
      return await window.modernScreenshot.domToBlob(el, {
        scale: esc, backgroundColor: bg, type: 'image/png', width: larg, height: alt,
        filter: n => !(n.id === 'btPrintAlta' || n.id === 'btPrintCel'),
        fetch: { requestInit: { mode: 'cors', cache: 'force-cache' }, placeholderImage: '' },
        timeout: 15000,
      });
    } finally {
      if (ehFicha) { el.classList.remove('modo-print'); el.classList.remove('ficha-escalada'); el.classList.remove('print-cel'); if (st) st.remove(); if (window.fichaEscalaAjustar) window.fichaEscalaAjustar(); }
    }
  }
  async function printar(cel) {
    cel = cel === true;
    if (!window.modernScreenshot) { aviso('Gerador de print indisponível', 'ruim'); return; }
    const el = alvo(); const nome = nomeArq().replace(/\.png$/, cel ? '-celular.png' : '.png');
    if (cel && el.id !== 'ficha') { aviso('O print 📱 Celular é da ficha do jogador — abra uma ficha', 'ruim'); return; }
    aviso('Gerando print em alta (4.096 px)…');
    const pBlob = gerar(el, cel);
    let copiou = false;
    try {   /* a promessa vai direto para o ClipboardItem: o Chrome mantém o clique como gesto do usuário */
      if (navigator.clipboard && window.ClipboardItem) { await navigator.clipboard.write([new ClipboardItem({ 'image/png': pBlob })]); copiou = true; }
    } catch (e) { console.warn('print: área de transferência', e); }
    try {
      const b = await pBlob;
      const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nome; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      aviso((copiou ? 'Print copiado — no WhatsApp, marque HD (ou envie como documento) para não perder qualidade. ' : '') + 'Também salvo como ' + nome, 'bom');
    } catch (e) { aviso('Não deu para gerar o print: ' + ((e && e.message) || e), 'ruim'); }
  }
  window.printAlta = () => printar(false); window.printCelular = () => printar(true);
  function botao() {
    if (document.getElementById('btPrintAlta')) return;
    const b = document.createElement('button'); b.id = 'btPrintAlta'; b.type = 'button'; b.textContent = '📷 Print';
    b.title = 'Print em alta (4.096 px, o HD do WhatsApp) da tela aberta — a ficha sai no formato do computador. Copia e baixa o PNG (atalho: Alt+P). No WhatsApp, marque HD ou envie como documento.';
    b.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:950;padding:7px 12px;border-radius:18px;border:1px solid #3aa0a0;background:#123;color:#9fe;font:600 12px Arial,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.4)';
    b.onclick = () => printar(false); document.body.appendChild(b);
  }
  document.addEventListener('keydown', e => { if (e.altKey && !e.metaKey && !e.ctrlKey && (e.code === 'KeyP')) { e.preventDefault(); printar(false); } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', botao); else botao();
})();
