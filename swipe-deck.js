/* =========================================================================
   MPC Atlas · Proyectos Destacados
   Carousel de tarjetas desplegadas sobre el mapa + panel de conexión
   ========================================================================= */

(() => {
  'use strict';

  const DECK_SIZE = 12;
  const MPC_INTENTS_KEY = 'mpc-project-intents-demo';

  /* ---------------------- Helpers ---------------------- */

  function getCurrentActor() {
    try { return sessionStorage.getItem('mpc-actor') || 'visitante'; } catch (_) { return 'visitante'; }
  }

  function getOperatingStates() {
    try {
      const raw = sessionStorage.getItem('mpc-operating-states');
      return raw ? JSON.parse(raw) : [];
    } catch (_) { return []; }
  }

  function getIntentsList() {
    try {
      const raw = localStorage.getItem(MPC_INTENTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) { return []; }
  }

  function saveIntentsList(list) {
    localStorage.setItem(MPC_INTENTS_KEY, JSON.stringify(list));
  }

  function hasIntent(pid) {
    return getIntentsList().some(x => String(x.projectId) === String(pid));
  }

  function intentTypeForActor(actor) {
    if (actor === 'academia') return 'colaboracion';
    if (['empresa', 'fondo-inversion', 'administrador'].includes(actor)) return 'financiamiento';
    return 'conexion';
  }

  function fmtN(n) {
    if (!n || n === 0) return '—';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toLocaleString('es-MX');
  }

  function sectorColor(s) {
    return { 'Ecosistemas Resilientes': '#2CB67D', 'Innovación Catalítica': '#F9A826', 'Despertar Planetario': '#E63946' }[s] || '#3A9E9E';
  }

  function sectorBg(s) {
    return { 'Ecosistemas Resilientes': 'rgba(44,182,125,0.10)', 'Innovación Catalítica': 'rgba(249,168,38,0.10)', 'Despertar Planetario': 'rgba(230,57,70,0.10)' }[s] || 'rgba(58,158,158,0.10)';
  }

  /* ---------------------- Ranking ---------------------- */

  function rankProjects(features, actor) {
    const opStates = getOperatingStates();
    const intented = new Set(getIntentsList().map(x => String(x.projectId)));
    const needMap = { empresa: 'Financiamiento', 'fondo-inversion': 'Financiamiento', academia: 'Aliados', desarrollador: 'Tecnología', 'sociedad-civil': 'Aliados', gobierno: 'Aliados', 'emprendimiento-climatico': 'Financiamiento' };
    const preferredNeed = needMap[actor] || '';

    return features
      .filter(f => !intented.has(String(f.properties?.id)))
      .map(f => {
        const p = f.properties || {};
        let score = 0;
        if (opStates.length > 0 && opStates.includes(p.estado)) score += 40;
        if (preferredNeed && p.necesidad === preferredNeed) score += 30;
        score += Math.min((p.co2_ton || 0) / 100, 15);
        score += Math.min((p.hectareas || 0) / 50, 15);
        score += Math.random() * 3;
        return { feature: f, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, DECK_SIZE)
      .map(x => x.feature);
  }

  /* ---------------------- Card HTML ---------------------- */

  function buildMiniCard(feature) {
    const p = feature.properties || {};
    const color = sectorColor(p.sector);
    const connected = hasIntent(p.id);

    return `
      <article class="pcard" data-pid="${p.id}" tabindex="0" role="button"
              aria-label="${p.nombre}" ${connected ? 'data-connected' : ''}>
        <div class="pcard__strip" style="border-color:${color}">
          <span class="pcard__sector" style="color:${color}">${p.sector || 'Proyecto'}</span>
          ${connected ? '<span class="pcard__connected-tag">Conectado</span>' : ''}
        </div>
        <h3 class="pcard__name">${p.nombre || 'Sin nombre'}</h3>
        <p class="pcard__org">${p.organizacion || ''}</p>
        <div class="pcard__kpis">
          <span><strong>${fmtN(p.hectareas)}</strong> ha</span>
          <span class="pcard__kpi-sep" aria-hidden="true"></span>
          <span><strong>${fmtN(p.co2_ton)}</strong> tCO₂</span>
          <span class="pcard__kpi-sep" aria-hidden="true"></span>
          <span><strong>${fmtN(p.beneficiarios)}</strong> benef.</span>
        </div>
        <div class="pcard__loc">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${[p.municipio, p.estado].filter(Boolean).join(', ') || 'México'}
        </div>
      </article>
    `;
  }

  /* ---------------------- Indicators Table ---------------------- */

  function buildIndicatorsTable(p) {
    const rows = [
      ['Hectáreas bajo manejo', fmtN(p.hectareas), 'ha'],
      ['CO₂eq mitigadas', fmtN(p.co2_ton), 'ton'],
      ['Beneficiarios directos', fmtN(p.beneficiarios), 'personas'],
      ['Necesidad declarada', p.necesidad || '—', ''],
      ['Tipo de organización', p.tipo_org || '—', ''],
      ['Subsector', p.subsector || '—', ''],
      ['Estado actual', p.status || 'Activo', ''],
      ['Año de inicio', p.year || '—', ''],
    ];

    return `
      <table class="conn__indicators" aria-label="Indicadores del proyecto">
        <thead>
          <tr><th>Indicador</th><th>Valor</th><th>Unidad</th></tr>
        </thead>
        <tbody>
          ${rows.map(([label, val, unit]) => `<tr><td>${label}</td><td class="conn__ind-val">${val}</td><td class="conn__ind-unit">${unit}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
  }

  /* ---------------------- Connection Panel ---------------------- */

  function openConnectionPanel(feature) {
    const panel = document.getElementById('conn-panel');
    if (!panel) return;

    const p = feature.properties || {};
    const color = sectorColor(p.sector);
    const bg = sectorBg(p.sector);
    const actor = getCurrentActor();
    const already = hasIntent(p.id);

    document.getElementById('conn-sector').textContent = p.sector || '';
    document.getElementById('conn-sector').style.borderColor = color;
    document.getElementById('conn-sector').style.color = color;
    document.getElementById('conn-name').textContent = p.nombre || 'Proyecto';
    document.getElementById('conn-org').textContent = p.organizacion || '';
    document.getElementById('conn-desc').textContent = p.descripcion || '';
    document.getElementById('conn-loc').textContent = [p.municipio, p.estado].filter(Boolean).join(', ') || 'México';
    document.getElementById('conn-need').textContent = p.necesidad || 'Conexión';
    document.getElementById('conn-need').style.borderColor = color;

    // Indicators table
    document.getElementById('conn-indicators-wrap').innerHTML = buildIndicatorsTable(p);

    // CTA state
    const ctaConnect = document.getElementById('conn-cta-connect');
    const intentLabel = { financiamiento: 'Conectar · Financiamiento', colaboracion: 'Conectar · Colaboración', conexion: 'Conectar con proyecto' };
    if (already) {
      ctaConnect.textContent = 'Conexión registrada';
      ctaConnect.disabled = true;
      ctaConnect.classList.add('conn__cta--done');
    } else if (actor === 'visitante') {
      ctaConnect.textContent = 'Inicia sesión para conectar';
      ctaConnect.disabled = true;
      ctaConnect.classList.remove('conn__cta--done');
    } else {
      ctaConnect.textContent = intentLabel[intentTypeForActor(actor)] || 'Conectar';
      ctaConnect.disabled = false;
      ctaConnect.classList.remove('conn__cta--done');
    }

    // Bind connect
    ctaConnect.onclick = () => {
      if (already || actor === 'visitante') return;
      const list = getIntentsList();
      list.push({ projectId: String(p.id), actor, intentType: intentTypeForActor(actor), ts: Date.now() });
      saveIntentsList(list);
      ctaConnect.textContent = 'Conexión registrada';
      ctaConnect.disabled = true;
      ctaConnect.classList.add('conn__cta--done');
      // Mark card as connected
      document.querySelector(`.pcard[data-pid="${p.id}"]`)?.setAttribute('data-connected', '');
      refreshCards(); // re-render to show connected state
    };

    // Store current pid for map fly
    panel.dataset.pid = p.id;

    // Show
    panel.classList.remove('hidden');
    panel.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => panel.classList.add('conn-panel--open'));

    // Fly to project on map
    const coords = feature.geometry?.coordinates;
    if (coords && typeof map !== 'undefined') {
      try { map.flyTo({ center: coords, zoom: 7, duration: 1200 }); } catch (_) {}
    }
  }

  function closeConnectionPanel() {
    const panel = document.getElementById('conn-panel');
    if (!panel) return;
    panel.classList.remove('conn-panel--open');
    setTimeout(() => {
      panel.classList.add('hidden');
      panel.setAttribute('aria-hidden', 'true');
    }, 280);
  }

  /* ---------------------- Carousel ---------------------- */

  let carouselProjects = [];

  function refreshCards() {
    const track = document.getElementById('pcard-track');
    if (!track) return;

    const features = window._mpcProjectFeatures || [];
    if (features.length === 0) return;

    const actor = getCurrentActor();
    carouselProjects = rankProjects(features, actor);

    track.innerHTML = carouselProjects.map(f => buildMiniCard(f)).join('');

    // Update counter
    const counter = document.getElementById('pcard-count');
    if (counter) counter.textContent = `${carouselProjects.length} proyectos para ti`;

    // Bind clicks
    track.querySelectorAll('.pcard').forEach((card, i) => {
      card.addEventListener('click', () => openConnectionPanel(carouselProjects[i]));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openConnectionPanel(carouselProjects[i]); }
      });
    });
  }

  /* ---------------------- Toggle Bar ---------------------- */

  function toggleBar() {
    const bar = document.getElementById('pcard-bar');
    if (!bar) return;
    const isVisible = !bar.classList.contains('hidden');
    if (isVisible) {
      bar.classList.add('pcard-bar--closing');
      setTimeout(() => {
        bar.classList.add('hidden');
        bar.classList.remove('pcard-bar--closing');
      }, 300);
    } else {
      bar.classList.remove('hidden');
      refreshCards();
      requestAnimationFrame(() => bar.classList.add('pcard-bar--open'));
    }
  }

  /* ---------------------- Scroll Arrows ---------------------- */

  function scrollTrack(direction) {
    const track = document.getElementById('pcard-track');
    if (!track) return;
    const scrollAmount = 280;
    track.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
  }

  /* ---------------------- Init ---------------------- */

  function init() {
    document.getElementById('deck-fab')?.addEventListener('click', toggleBar);
    document.getElementById('pcard-close')?.addEventListener('click', toggleBar);
    document.getElementById('conn-close')?.addEventListener('click', closeConnectionPanel);
    document.getElementById('conn-backdrop')?.addEventListener('click', closeConnectionPanel);
    document.getElementById('pcard-arrow-left')?.addEventListener('click', () => scrollTrack('left'));
    document.getElementById('pcard-arrow-right')?.addEventListener('click', () => scrollTrack('right'));

    // Solicitar docs button
    document.getElementById('conn-cta-docs')?.addEventListener('click', () => {
      const panel = document.getElementById('conn-panel');
      const pid = panel?.dataset.pid;
      if (pid) {
        alert('Demo: Se enviaría solicitud de documentación técnica para el proyecto #' + pid + '. En producción esto genera un correo/notificación al operador del proyecto.');
      }
    });

    // View on map
    document.getElementById('conn-cta-map')?.addEventListener('click', () => {
      closeConnectionPanel();
      const panel = document.getElementById('conn-panel');
      const pid = panel?.dataset.pid;
      if (pid && typeof window.openMpcDetail === 'function') {
        window.openMpcDetail(Number(pid));
      }
    });

    // Keyboard: Escape closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const conn = document.getElementById('conn-panel');
        if (conn && !conn.classList.contains('hidden')) { closeConnectionPanel(); return; }
        const bar = document.getElementById('pcard-bar');
        if (bar && !bar.classList.contains('hidden')) toggleBar();
      }
    });
  }

  window._swipeDeckRefresh = refreshCards;
  window._swipeDeckToggle = toggleBar;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
