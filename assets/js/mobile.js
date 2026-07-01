/* mobile.js
 *
 * Funcoes especificas para o uso no celular:
 *
 * 1) Reduzir a previa A4 (794px de largura fixa) para caber na tela via
 *    CSS transform: scale(...), recalculado ao girar/redimensionar a tela.
 *
 * 2) Botao fixo "GERAR PDF" no rodape, sempre acessivel.
 *
 * 3) Garantir que o PDF saia em A4 cheio: ANTES de imprimir removemos por
 *    completo o transform/margin de escala (deixando o elemento no tamanho
 *    real), e restauramos DEPOIS. Isso e necessario porque o Safari do iOS
 *    e alguns navegadores Android nao respeitam de forma confiavel o
 *    "transform: none" via @media print quando o valor esta no style inline
 *    — o elemento transformado vira um "containing block" e a paginacao da
 *    impressao sai cortada/torta.
 *
 * No desktop (>820px) a escala nunca e aplicada, entao o reset e inofensivo.
 */
(function () {
  var BREAKPOINT = 820;
  var PAGE_WIDTH = 794; // largura A4 a 96dpi
  var STAGE_PADDING = 14;

  var isPrinting = false;

  function fitPage() {
    if (isPrinting) return; // nao mexe na escala durante a impressao
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
      page.style.marginRight = (PAGE_WIDTH * (scale - 1)) + 'px';
      page.style.marginBottom = (unscaledHeight * (scale - 1)) + 'px';
    }
  }

  /* Zera COMPLETAMENTE os estilos inline de escala para a impressao. */
  function clearScaleForPrint() {
    isPrinting = true;
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      page.style.transform = 'none';
      page.style.transformOrigin = '';
      page.style.marginRight = '0';
      page.style.marginBottom = '0';
    }
  }

  /* Restaura a escala reduzida apos a impressao (ou cancelamento). */
  function restoreScaleAfterPrint() {
    isPrinting = false;
    fitPage();
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
      "box-shadow:0 8px 22px -6px rgba(0,0,0,.55);cursor:pointer;" +
      "-webkit-appearance:none;appearance:none";
    b.onclick = function () {
      // Limpa a escala sincronamente ANTES de abrir o dialogo de impressao.
      clearScaleForPrint();
      // Da um tick para o layout reflowar sem a escala, depois imprime.
      setTimeout(function () {
        try { window.print(); } catch (e) {}
        // afterprint nem sempre dispara no iOS; fallback por tempo.
        setTimeout(restoreScaleAfterPrint, 1200);
      }, 60);
    };
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

    // Cobre tambem o Ctrl+P / Cmd+P do navegador e o menu "Imprimir" do sistema.
    window.addEventListener('beforeprint', clearScaleForPrint);
    window.addEventListener('afterprint', restoreScaleAfterPrint);

    if ('MutationObserver' in window) {
      var root = document.querySelector('.app') || document.body;
      new MutationObserver(schedule).observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
    setTimeout(fitPage, 300);
    setTimeout(fitPage, 900);
  }

  function boot() {
    createFab();
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
