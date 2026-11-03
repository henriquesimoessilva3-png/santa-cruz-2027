/* 03/11/2026 — ficha na mesma organização em qualquer tela (Henrique: "no Mac as informações ficam espalhadas mais para
   baixo; queria essa mesma organização do monitor grande dentro do Mac", para o print sair bom).
   Em tela com menos de 1.900 px de largura a ficha é montada como no monitor grande (1.920 px: físico + os 4 blocos do
   técnico numa linha, minutagem/cobrador/finalizador numa linha) e reduzida inteira (zoom) para caber na largura.
   No Mac (Retina) cada ponto da ficha ainda tem ~1,6 pixel de tela, então o print fica mais nítido que o do monitor. */
(function () {
  'use strict';
  const LARG = 1920, LIMITE = 1900;
  const css = document.createElement('style'); css.id = 'cssFichaEscala';
  css.textContent = `
#ficha.ficha-escalada{width:${LARG}px!important;min-width:${LARG}px!important;max-width:none!important;flex:none!important;zoom:var(--fichaZ,1);height:var(--fichaH,auto)!important;max-height:none!important}
#ficha.ficha-escalada .sf-tec-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}
#ficha.ficha-escalada .sf-layout{grid-template-columns:minmax(290px,1fr) minmax(0,4fr)!important}
#ficha.ficha-escalada .sf-extra{grid-template-columns:repeat(2,minmax(0,1fr))!important}
#ficha.ficha-escalada .sf-extra:has(.bp-2){grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) minmax(0,.95fr)!important}
#ficha.ficha-escalada .sf-grid{grid-template-columns:repeat(auto-fit,minmax(330px,1fr))!important}
#fiCorpo.cmp-on #ficha.ficha-escalada .sf-layout,#ficha.ficha-escalada #fiCorpo.cmp-on .sf-layout{grid-template-columns:minmax(430px,1.25fr) minmax(0,4fr)!important}`;
  document.head.appendChild(css);
  let pend = false;
  function ajustar() {
    pend = false;
    const f = document.getElementById('ficha'), pg = document.getElementById('pgCampo');
    if (!f || !pg) return;
    if (f.classList.contains('modo-print')) return;            /* o 📷 Print cuida da ficha enquanto desenha */
    const aberta = !f.classList.contains('oculta') && pg.offsetParent !== null;
    const w = pg.clientWidth, h = pg.clientHeight;
    if (!aberta || !w || w >= LIMITE) {
      if (f.classList.contains('ficha-escalada')) { f.classList.remove('ficha-escalada'); f.style.removeProperty('--fichaZ'); f.style.removeProperty('--fichaH'); }
      return;
    }
    const z = w / LARG;
    const alturaOutros = [...pg.children].filter(e => e !== f && e.offsetParent !== null).reduce((s, e) => s + e.offsetHeight, 0);
    const zt = z.toFixed(4), ht = Math.max(200, (h - alturaOutros) / z).toFixed(1) + 'px';
    /* só mexe quando muda: mexer na classe sem mudar nada também avisa o observador e virava um laço a cada quadro */
    if (f.style.getPropertyValue('--fichaZ') !== zt) f.style.setProperty('--fichaZ', zt);
    if (f.style.getPropertyValue('--fichaH') !== ht) f.style.setProperty('--fichaH', ht);
    if (!f.classList.contains('ficha-escalada')) f.classList.add('ficha-escalada');
  }
  const agenda = () => { if (!pend) { pend = true; requestAnimationFrame(ajustar); } };
  window.fichaEscalaAjustar = ajustar;
  function ligar() {
    const f = document.getElementById('ficha'), pg = document.getElementById('pgCampo');
    if (!f || !pg) return setTimeout(ligar, 500);
    new MutationObserver(agenda).observe(f, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(agenda).observe(pg, { attributes: true, attributeFilter: ['class', 'style'] });
    if (window.ResizeObserver) new ResizeObserver(agenda).observe(pg);
    window.addEventListener('resize', agenda);
    agenda();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar); else ligar();
})();
