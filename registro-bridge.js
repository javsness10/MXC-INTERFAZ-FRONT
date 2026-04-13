/**
 * registro-bridge.js
 * Intercepta el clic en tiles de actor → abre el wizard de registro
 * → luego ejecuta el flujo original de app.js.
 *
 * FIX: actor-select-screen tiene position:fixed, por lo que offsetParent
 * siempre es null aunque esté visible. Solo usamos classList para detectarlo.
 */
(function () {
  'use strict';

  var _busy = false;

  /* Replica lo que hace initActorSelect() en app.js tras elegir un actor */
  function proceedWithActor(actor) {
    /* 1. Guardar en sesión (igual que app.js) */
    try { sessionStorage.setItem('mpc-actor', actor); } catch (_) {}

    /* 2. Actualizar contexto de rol y CTAs */
    if (typeof initExplorerRoleContext === 'function') initExplorerRoleContext();
    if (typeof refreshDetailCtas === 'function') refreshDetailCtas();

    /* 3. Inicializar dashboard y ocultar pantalla de selección */
    var screen = document.getElementById('actor-select');
    if (typeof initDashboard === 'function') {
      initDashboard().then(function () {
        if (typeof dashShowDashboard === 'function') dashShowDashboard();
        if (screen) {
          screen.classList.add('is-hidden');
          screen.setAttribute('aria-hidden', 'true');
        }
      });
    } else {
      if (screen) {
        screen.classList.add('is-hidden');
        screen.setAttribute('aria-hidden', 'true');
      }
      if (typeof tryHideMpcMapLoading === 'function') tryHideMpcMapLoading();
    }
  }

  /* Interceptar clics en actor-tiles en fase de captura (antes que app.js) */
  document.addEventListener('click', function (e) {
    if (_busy) return;

    var btn = e.target.closest('[data-actor]');
    if (!btn) return;

    /* Solo interceptar cuando actor-select está visible.
       NOTA: usa solo classList porque position:fixed hace offsetParent = null */
    var screen = document.getElementById('actor-select');
    if (!screen || screen.classList.contains('is-hidden')) return;

    /* Bloquear el evento original (no llega a app.js) */
    e.stopImmediatePropagation();
    e.preventDefault();

    var actor = btn.dataset.actor;

    if (window.MPC_REGISTRO && typeof window.MPC_REGISTRO.open === 'function') {
      window.MPC_REGISTRO.open(actor, function () {
        /* Después de cerrar el wizard, ejecutar el flujo de app.js */
        _busy = true;
        proceedWithActor(actor);
        _busy = false;
      });
    } else {
      /* Wizard no disponible: ejecutar flujo directamente */
      proceedWithActor(actor);
    }

  }, true /* capture */);

})();
