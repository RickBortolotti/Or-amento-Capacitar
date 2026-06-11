/* fetch-shim.js
 *
 * O dc-runtime foi feito para rodar em um servidor de desenvolvimento que
 * serve componentes como arquivos .dc.html separados. Em produção (GitHub
 * Pages, etc.) o app inteiro mora em uma única página, mas o runtime ainda
 * tenta fazer dois fetches automáticos:
 *
 *   1) fetch(location.href) — para reler o template e detectar mudancas.
 *   2) fetch("./<Nome>.dc.html") — quando um componente filho é referenciado.
 *
 * Esses fetches retornam o HTML do site (que NAO esta no formato cru
 * .dc.html), o que ou gera ruido no console ou tenta executar tags que
 * nao fazem parte do app. Aqui interceptamos os dois casos.
 */
(function () {
  var _fetch = window.fetch;
  window.fetch = function (input, init) {
    var url = (typeof input === 'string' ? input : (input && input.url) || '');
    try { url = new URL(url, location.href).href; } catch (e) { /* noop */ }

    var here = location.href.replace(/#.*$/, '');
    var that = url.replace(/#.*$/, '');

    // Self-fetch: devolve um fragmento valido com <x-dc> vazio.
    if (that === here) {
      var body = '<x-dc></x-dc><script type="text/x-dc" data-dc-script></' + 'script>';
      return Promise.resolve(new Response(body, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }));
    }

    // Sibling fetch: arquivo .dc.html inexistente (todos os componentes
    // estao embutidos). Retornar 404 silenciosamente.
    if (/\.dc\.html?(\?.*)?$/.test(that)) {
      return Promise.resolve(new Response('', { status: 404 }));
    }

    return _fetch.apply(this, arguments);
  };
})();
