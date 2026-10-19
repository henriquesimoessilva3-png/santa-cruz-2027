/* 19/10/2026 — aba Treinador: mostra a página #pgTreinador quando o botão da aba está ligado (mesmo gesto da tipo_a.js);
   o PDF só carrega na primeira vez que a aba abre */
(function () {
  function ligar() {
    const bt = document.querySelector('.aba[data-aba="treinador"]'), pg = document.getElementById('pgTreinador');
    if (!bt || !pg) return;
    const sync = () => { const on = bt.classList.contains('on'); pg.classList.toggle('oculta', !on);
      if (on) { const f = pg.querySelector('iframe.tr-pdf'); if (f && !f.src) f.src = f.dataset.src; } };
    new MutationObserver(sync).observe(bt, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
