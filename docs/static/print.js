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
#ficha.modo-print .ficha-topo button{display:none!important}`;
  const quadro = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 250))));
  async function gerar(el) {
    const bg = getComputedStyle(document.body).backgroundColor || '#0d0f13';
    const ehFicha = el.id === 'ficha';
    let st = null;
    if (ehFicha) {
      st = document.createElement('style'); st.id = 'cssModoPrint'; st.textContent = CSS_PRINT; document.head.appendChild(st);
      el.classList.add('modo-print', 'ficha-escalada'); await quadro();
    }
    try {
      const larg = Math.max(el.scrollWidth, el.offsetWidth), alt = Math.max(el.scrollHeight, el.offsetHeight);
      return await window.modernScreenshot.domToBlob(el, {
        scale: 3, backgroundColor: bg, type: 'image/png', width: larg, height: alt,
        filter: n => !(n.id === 'btPrintAlta'),
        fetch: { requestInit: { mode: 'cors', cache: 'force-cache' }, placeholderImage: '' },
        timeout: 15000,
      });
    } finally {
      if (ehFicha) { el.classList.remove('modo-print'); el.classList.remove('ficha-escalada'); if (st) st.remove(); if (window.fichaEscalaAjustar) window.fichaEscalaAjustar(); }
    }
  }
  async function printar() {
    if (!window.modernScreenshot) { aviso('Gerador de print indisponível', 'ruim'); return; }
    const el = alvo(); const nome = nomeArq();
    aviso('Gerando print em alta…');
    const pBlob = gerar(el);
    let copiou = false;
    try {   /* a promessa vai direto para o ClipboardItem: o Chrome mantém o clique como gesto do usuário */
      if (navigator.clipboard && window.ClipboardItem) { await navigator.clipboard.write([new ClipboardItem({ 'image/png': pBlob })]); copiou = true; }
    } catch (e) { console.warn('print: área de transferência', e); }
    try {
      const b = await pBlob;
      const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nome; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      aviso((copiou ? 'Print copiado — cole no WhatsApp e marque HD para sair nítido. ' : '') + 'Também salvo como ' + nome, 'bom');
    } catch (e) { aviso('Não deu para gerar o print: ' + ((e && e.message) || e), 'ruim'); }
  }
  window.printAlta = printar;
  function botao() {
    if (document.getElementById('btPrintAlta')) return;
    const b = document.createElement('button'); b.id = 'btPrintAlta'; b.type = 'button'; b.textContent = '📷 Print';
    b.title = 'Print em alta resolução da tela aberta (a ficha, se estiver aberta) — copia para colar no WhatsApp e baixa o PNG (atalho: Alt+P)';
    b.style.cssText = 'position:fixed;right:14px;bottom:14px;z-index:950;padding:7px 12px;border-radius:18px;border:1px solid #3aa0a0;background:#123;color:#9fe;font:600 12px Arial,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.4)';
    b.onclick = printar; document.body.appendChild(b);
  }
  document.addEventListener('keydown', e => { if (e.altKey && !e.metaKey && !e.ctrlKey && (e.code === 'KeyP')) { e.preventDefault(); printar(); } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', botao); else botao();
})();
