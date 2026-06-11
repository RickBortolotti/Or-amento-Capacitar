/* boot.js
 *
 * O conteudo do template visual contem placeholders nao-interpolados:
 *
 *   <img src="{{ p.img }}">
 *   <input type="number" value="{{ item.qtd }}">
 *
 * Se isso for parseado pelo navegador como HTML normal, ele:
 *   - tenta carregar a URL literal "{{ p.img }}" (gera 404)
 *   - emite warnings de "value cannot be parsed" para inputs numericos
 *
 * Estrategia: manter o template DENTRO de um <template id="dc-template"> (inerte)
 * e ter no <body> um <x-dc> VAZIO. Antes do dc-runtime inicializar, interceptamos
 * a property "innerHTML" do <x-dc> para devolver o conteudo cru do template ao
 * framework. Assim:
 *   - o framework consegue compilar o template normalmente
 *   - o navegador nunca anexa um <img> com placeholder ao DOM ativo
 *   - nenhuma request fantasma e disparada
 */
(function () {
  function setupBeforeRuntime() {
    var tpl = document.getElementById('dc-template');
    if (!tpl) return;

    // String crua do template (placeholders intactos)
    var rawHtml = tpl.innerHTML;

    // Cria um <x-dc> vazio no lugar do <template>, com um getter customizado
    // de innerHTML que devolve o template completo apenas para o framework.
    var xdc = document.createElement('x-dc');
    Object.defineProperty(xdc, 'innerHTML', {
      configurable: true,
      get: function () { return rawHtml; },
      set: function (v) {
        // Se algo tentar reescrever, voltamos ao comportamento padrao
        Object.defineProperty(this, 'innerHTML',
          Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML'));
        this.innerHTML = v;
      }
    });

    tpl.parentNode.replaceChild(xdc, tpl);
  }

  if (document.readyState === 'loading') {
    // capture:true + once:true → roda antes do listener do dc-runtime
    document.addEventListener('DOMContentLoaded', setupBeforeRuntime, {
      capture: true,
      once: true
    });
  } else {
    setupBeforeRuntime();
  }
})();
