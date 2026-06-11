/* mobile.js
 *
 * Duas funcoes especificas para o uso no celular:
 *
 * 1) Reduzir a previa A4 (794px de largura fixa) para caber na tela
 *    via CSS transform: scale(...). A reducao e calculada na hora e
 *    ajustada quando a tela gira ou redimensiona.
 *
 * 2) Botao fixo "GERAR PDF" no rodape, sempre acessivel.
 *
 * No desktop (>820px) nada disso roda.
 */
(function () {
  var BREAKPOINT = 820;
  var PAGE_WIDTH = 794; // largura A4 a 96dpi
  var STAGE_PADDING = 14;

  function fitPage() {
    var mobile = window.innerWidth <= BREAKPOINT;
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      if (!mobile) {
        page.style.transform = '';
        page.style.transformOrigin = '';
        page.style.marginRight = '';
        page.style.marginBottom = '';
        continue;
      }
      var stage = page.parentElement;
      var available = (stage ? stage.clientWidth : window.innerWidth) - STAGE_PADDING * 2;
      var scale = Math.min(1, available / PAGE_WIDTH);
      if (!(scale > 0)) scale = 1;
      var unscaledHeight = page.offsetHeight;
      page.style.transformOrigin = 'top left';
      page.style.transform = 'scale(' + scale + ')';
      // Compensa o espaco "morto" que aparece a direita/abaixo apos o scale
      page.style.marginRight = (PAGE_WIDTH * (scale - 1)) + 'px';
      page.style.marginBottom = (unscaledHeight * (scale - 1)) + 'px';
    }
  }

  function createFab() {
    if (document.getElementById('m-fab')) return;
    var b = document.createElement('button');
    b.id = 'm-fab';
    b.type = 'button';
    b.textContent = 'GERAR PDF';
    b.style.cssText =
      "position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;" +
      "background:#dd2a1b;color:#fff;border:none;border-radius:10px;" +
      "font-family:'Barlow Condensed',sans-serif;font-weight:700;" +
      "font-size:17px;letter-spacing:.1em;padding:15px;" +
      "box-shadow:0 8px 22px -6px rgba(0,0,0,.55);cursor:pointer";
    b.onclick = function () { try { window.print(); } catch (e) {} };
    document.body.appendChild(b);
  }

  var debounceTimer;
  function schedule() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fitPage, 60);
  }

  function watch() {
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    if ('MutationObserver' in window) {
      var root = document.querySelector('.app') || document.body;
      new MutationObserver(schedule).observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
    // Ajustes extras apos o React terminar de hidratar
    setTimeout(fitPage, 300);
    setTimeout(fitPage, 900);
  }

  function boot() {
    createFab();
    // O .page so aparece depois que o React renderiza; aguardamos ate aparecer
    var tries = 0;
    var iv = setInterval(function () {
      if (document.querySelector('.page') || ++tries > 50) {
        clearInterval(iv);
        fitPage();
        watch();
      }
    }, 100);
  }

  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
