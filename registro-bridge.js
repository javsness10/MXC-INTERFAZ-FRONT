/**
 * registro-bridge.js
 * Intercepta los clics en los actor-tiles del actor-select screen
 * y abre el wizard de registro ANTES de continuar al dashboard/mapa.
 *
 * Requiere que registro-dist/registro.js ya esté cargado en la página
 * y que haya expuesto window.MPC_REGISTRO.open(actorType, onComplete).
 */
(function () {
  'use strict';

  var _skipIntercept = false;

  /**
   * Reproduce el comportamiento original del actor-tile click en app.js:
   * - Guarda el actor en sessionStorage
   * - Llama al flujo del dashboard
   */
  function proceedWithActor(btn) {
    _skipIntercept = true;
    // Dispatch un click sintético para que app.js lo maneje normalmente
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    _skipIntercept = false;
  }

  /**
   * Listener en fase de captura — se ejecuta ANTES que app.js (bubbling).
   */
  document.addEventListener(
    'click',
    function (e) {
      if (_skipIntercept) return;

      var btn = e.target.closest('[data-actor]');
      if (!btn) return;

      // Solo interceptar si el actor-select screen está visible
      var screen = document.getElementById('actor-select');
      if (!screen || screen.classList.contains('is-hidden')) return;

      // Detener propagación para que app.js NO maneje este clic ahora
      e.stopImmediatePropagation();

      var actor = btn.dataset.actor;

      if (window.MPC_REGISTRO && typeof window.MPC_REGISTRO.open === 'function') {
        window.MPC_REGISTRO.open(actor, function () {
          // Callback: cuando el usuario termina o cierra el wizard
          proceedWithActor(btn);
        });
      } else {
        // Fallback: si el wizard no cargó, continuar flujo normal
        proceedWithActor(btn);
      }
    },
    true // capture phase
  );
})();
