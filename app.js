/* =========================================================================
   MPC Atlas · Visualizar el Territorio
   México por el Clima · Módulo 3 · Mapbox GL JS
   ========================================================================= */

// Token leído desde config.local.js (no versionado) — ver config.example.js
const TOKEN_MAPBOX = window.MPC_MAPBOX_TOKEN || '';
mapboxgl.accessToken = TOKEN_MAPBOX;

/** Predio demo AOSENUMA: panel lateral + capas locales activos por defecto. Ocultar con ?predio=0 */
const PREDIO_MODE =
  typeof window === 'undefined' || new URLSearchParams(window.location.search).get('predio') !== '0';

/* ---------------------- Configuration ---------------------- */

const MX_CENTER = [-102.5, 23.5];
const MX_ZOOM = 5;

/** Vista inicial tipo “planeta” (globo + satélite puro) antes de acercar a México con el FAB */
const PLANET_CENTER = [-55, 18];
const PLANET_ZOOM = 1.35;
const PLANET_PITCH = 0;

const BASE_MAP_STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  'satellite-streets': 'mapbox://styles/mapbox/satellite-streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  streets: 'mapbox://styles/mapbox/streets-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
};

const SECTOR_COLORS = {
  'Ecosistemas Resilientes': '#2CB67D',
  'Innovación Catalítica': '#F9A826',
  'Despertar Planetario': '#E63946',
};

/** Misma escala de clases que PROYECTO_03 (MCDA 1–5) */
const SUITABILITY_CLASS_NAMES = {
  1: 'Muy Baja', 2: 'Baja', 3: 'Media', 4: 'Alta', 5: 'Muy Alta',
};

/** RdYlGn 5-class (D2 y usos no carbono) — alineado con PROYECTO_03 */
const SUITABILITY_CLASS_COLORS_RDYLGN = {
  1: '#d73027',
  2: '#fc8d59',
  3: '#fee08b',
  4: '#91cf60',
  5: '#1a9850',
};

/** Viridis-like (D1 carbono) — idéntico a PROYECTO_03 CARBON_CLASS_COLORS */
const SUITABILITY_CARBON_CLASS_COLORS = {
  1: '#440154',
  2: '#3b528b',
  3: '#21918c',
  4: '#35b779',
  5: '#fde725',
};

/* ---------------------- Layer Definitions ---------------------- */

const PROYECTOS_LAYERS = [
  { id: 'proyectos-mpc', label: 'Proyectos MPC (30)', color: 'color-proyectos-mpc', file: 'data/proyectos_mpc_demo.geojson', type: 'point', defaultOn: true },
  { id: 'proyectos-carbono', label: 'Carbono CAR / VCS (MX)', color: 'color-proyectos-carbono', file: 'data/proyectos_carbono_mx.geojson', type: 'point', defaultOn: true },
];

const AMBIENTAL_LAYERS = [
  { id: 'anp', label: 'Áreas Naturales Protegidas', color: 'color-anp', file: '../../assets/Conservation/ANP/anpmx.shp', type: 'polygon', note: 'Shapefile (requiere procesamiento)' },
  { id: 'restauracion', label: 'Sitios de Restauración (PNRA)', color: 'color-restauracion', file: '../../assets/Restoration /PNRA_POLIGONOS_TOTAL.geojson', type: 'polygon' },
  { id: 'vegetacion', label: 'Uso de Suelo y Vegetación', color: 'color-vegetacion', file: null, type: 'polygon', note: 'Capa raster (requiere tiles)' },
  { id: 'hidrografia', label: 'Red Hidrográfica Nacional', color: 'color-hidrografia', file: '../../assets/Water/Hidrografia_MX.geojson', type: 'line' },
];

const VULNERABILIDAD_LAYERS = [
  { id: 'zonas-desatendidas', label: 'Zonas Desatendidas', color: 'color-zonas-desatendidas', file: 'data/zonas_desatendidas_demo.geojson', type: 'polygon' },
  { id: 'riesgo-climatico', label: 'Riesgo Climático Municipal', color: 'color-riesgo', file: null, type: 'polygon', note: 'CENAPRED (requiere procesamiento)' },
  { id: 'ramsar', label: 'Sitios RAMSAR', color: 'color-ramsar', file: null, type: 'polygon', note: 'GeoPackage (requiere conversión)' },
];

const TERRITORIAL_LAYERS = [
  { id: 'subcuencas', label: 'Subcuencas Hidrológicas', color: 'color-subcuencas', file: null, type: 'polygon', note: 'Shapefile (requiere procesamiento)' },
  { id: 'acuiferos', label: 'Acuíferos de México', color: 'color-acuiferos', file: null, type: 'polygon', note: 'Shapefile (requiere procesamiento)' },
  { id: 'ejidos', label: 'Núcleos Agrarios (PHINA)', color: 'color-ejidos', file: '../../assets/Social/ejidos/Nucleos_Agrarios_PHINA_2024.geojson', type: 'polygon' },
  { id: 'indigenas', label: 'Territorios Pueblos Indígenas', color: 'color-indigenas', file: '../../assets/Social/pueblos_indigenas_contexto/01_capas/geojson/pciaf_territorios_pueb_indig_07_nal_a.geojson', type: 'polygon' },
  { id: 'carbono-car', label: 'Proyectos de Carbono (CAR)', color: 'color-carbono', file: null, type: 'point', note: 'Shapefile (requiere conversión)' },
];

const ALL_TOGGLE_LAYERS = [
  ...PROYECTOS_LAYERS,
  ...AMBIENTAL_LAYERS,
  ...VULNERABILIDAD_LAYERS,
  ...TERRITORIAL_LAYERS,
];

/** Capas bajo visor/predio_demo/. Panel visible salvo ?predio=0 */
const PREDIO_DEMO_LAYERS = [
  {
    id: 'predio-aoi',
    label: 'Límite predio',
    color: 'color-predio-aoi',
    file: 'predio_demo/aoi.geojson',
    type: 'predio-aoi',
    defaultOn: true,
  },
  {
    id: 'predio-d1',
    label: 'Idoneidad carbono (D1)',
    color: 'color-predio-d1',
    file: 'predio_demo/exports/suitability/suitability_D1.geojson',
    type: 'polygon',
    predioSuitability: true,
    defaultOn: false,
  },
  {
    id: 'predio-d2',
    label: 'Recarga / infiltración (D2)',
    color: 'color-predio-d2',
    file: 'predio_demo/exports/suitability/suitability_D2.geojson',
    type: 'polygon',
    predioSuitability: true,
    defaultOn: false,
  },
  {
    id: 'predio-deforest',
    label: 'Deforestación (Hansen por era)',
    color: 'color-predio-deforest',
    file: 'predio_demo/exports/deforestacion_multitemporal.geojson',
    type: 'polygon',
    predioDeforest: true,
    defaultOn: false,
  },
];

/** Textos ficha lateral · predio demo (AOSENUMA / Minería Autlán) */
const PREDIO_DEMO_FICHA = {
  titular: 'Minería Autlán',
  tema: 'Territorio, idoneidad ambiental y carbono (demo AOSENUMA)',
  descripcion:
    'Demostración de visualización territorial (Minería Autlán): el mapa muestra los proyectos MPC y carbono como siempre; sobre el predio, por defecto solo el límite — activá D1, D2 o deforestación en «Predio demo (AOSENUMA)» si las querés ver.',
};

/** Galería ficha predio (Parras + hero). Archivos en visor/assets/… */
const PREDIO_DEMO_GALLERY = [
  'assets/predio_demo/parras_1.jpeg',
  'assets/predio_demo/parras_2.jpg',
  'assets/predio_demo/parras_2.webp',
  'assets/hero/karl-magnuson-T2CJ4ZI7-hg-unsplash.jpg',
  'assets/hero/omar-oyervides-UljiQc8w5Ms-unsplash.jpg',
];

let predioAoiClickHandlersBound = false;

function getAllToggleLayers() {
  return PREDIO_MODE ? [...PREDIO_DEMO_LAYERS, ...ALL_TOGGLE_LAYERS] : ALL_TOGGLE_LAYERS;
}

const toggleLayerCache = {};

const MPC_ACTOR_KEY = 'mpc-actor';
const MPC_OPERATING_STATES_KEY = 'mpc-operating-states';
const MPC_INTENTS_KEY = 'mpc-project-intents-demo';
const MPC_DRAFT_PROJECTS_KEY = 'mpc-draft-projects-demo';

const MPC_NETWORK_DATA_URL = 'data/red_proyectos_mpc_demo.json';
const MPC_NETWORK_MAX_NODES = 40;
/** Fallback si fetch falla (file://, etc.); mismo contenido que data/red_proyectos_mpc_demo.json */
const MPC_NETWORK_JSON_FALLBACK = JSON.parse(`{"version":1,"description":"Vínculos demo entre proyectos MPC. role alinea con actores del atlas (no es dato verificado).","links":[{"source":1,"target":2,"role":"sociedad-civil","label":"Educación y corredor urbano CDMX"},{"source":1,"target":20,"role":"emprendimiento-climatico","label":"Agricultura urbana y humedal"},{"source":1,"target":28,"role":"sociedad-civil","label":"Educación ambiental infancias"},{"source":2,"target":5,"role":"gobierno","label":"Bosques urbanos y prevención de incendios"},{"source":3,"target":13,"role":"desarrollador","label":"Estudios de cuenca y captación"},{"source":3,"target":21,"role":"sociedad-civil","label":"Cuencas y restauración lacustre"},{"source":4,"target":11,"role":"sociedad-civil","label":"Selvas y agroforestería"},{"source":4,"target":25,"role":"fondo-inversion","label":"Línea de café y comunidades"},{"source":5,"target":27,"role":"gobierno","label":"CONAFOR y restauración"},{"source":6,"target":9,"role":"gobierno","label":"Humedales y monitoreo peninsular"},{"source":6,"target":14,"role":"sociedad-civil","label":"Costa y biodiversidad"},{"source":7,"target":18,"role":"empresa","label":"Transición energética regional"},{"source":7,"target":23,"role":"academia","label":"Industria y descarbonización"},{"source":8,"target":12,"role":"emprendimiento-climatico","label":"Turismo costero regenerativo"},{"source":9,"target":16,"role":"academia","label":"Monitoreo y educación climática"},{"source":10,"target":5,"role":"sociedad-civil","label":"Corredores forestales"},{"source":1,"target":3,"role":"desarrollador","label":"Estudio de ZMVM y agua"},{"source":15,"target":6,"role":"gobierno","label":"Costa y manglar"},{"source":15,"target":14,"role":"desarrollador","label":"Ingeniería costera adaptativa"},{"source":17,"target":19,"role":"academia","label":"Veracruz biodiversidad y agua"},{"source":18,"target":29,"role":"empresa","label":"Energía y agricultura regional"},{"source":20,"target":2,"role":"sociedad-civil","label":"Chinampas y bosque urbano"},{"source":22,"target":8,"role":"sociedad-civil","label":"Golfo de California y economía azul"},{"source":24,"target":11,"role":"sociedad-civil","label":"Territorios indígenas"},{"source":26,"target":7,"role":"gobierno","label":"Ciudades y movilidad"},{"source":30,"target":7,"role":"fondo-inversion","label":"Finanzas verdes y energía"},{"source":30,"target":12,"role":"fondo-inversion","label":"Impacto y turismo"},{"source":13,"target":27,"role":"emprendimiento-climatico","label":"Captación y zonas áridas"},{"source":19,"target":17,"role":"sociedad-civil","label":"Cuencas y ciudad esponja"},{"source":21,"target":3,"role":"desarrollador","label":"Modelación hídrica regional"},{"source":28,"target":1,"role":"sociedad-civil","label":"Red educativa CDMX"},{"source":29,"target":25,"role":"empresa","label":"Agricultura regenerativa"},{"source":4,"target":24,"role":"sociedad-civil","label":"Justicia climática en territorio"},{"source":12,"target":8,"role":"emprendimiento-climatico","label":"Experiencias costeras"},{"source":16,"target":28,"role":"academia","label":"Educación y monitoreo"},{"source":23,"target":30,"role":"fondo-inversion","label":"Finanzas e industria 4.0"},{"source":5,"target":10,"role":"gobierno","label":"Jalisco y corredores"},{"source":14,"target":22,"role":"sociedad-civil","label":"Arrecife y corredores marinos"}]}`);


const NETWORK_ROLE_LABELS = {
  empresa: 'Empresa',
  'fondo-inversion': 'Inversión / financiamiento',
  'sociedad-civil': 'Colaboración territorial / OSC',
  gobierno: 'Institucional / público',
  'emprendimiento-climatico': 'Innovación / emprendimiento',
  desarrollador: 'Implementación / consultoría',
  academia: 'Ciencia / datos',
  inferred: 'Inferido (demo)',
};

const NETWORK_ROLE_CATEGORY = {
  empresa: 'Financiamiento / inversión',
  'fondo-inversion': 'Financiamiento / inversión',
  'sociedad-civil': 'Colaboración territorial / OSC',
  gobierno: 'Institucional / público',
  'emprendimiento-climatico': 'Innovación / emprendimiento',
  desarrollador: 'Implementación / consultoría',
  academia: 'Ciencia / datos',
  inferred: 'Inferido (demo)',
};

const NETWORK_ROLE_COLORS = {
  empresa: '#E8702A',
  'fondo-inversion': '#F5A623',
  'sociedad-civil': '#1B7A44',
  gobierno: '#0E7C86',
  'emprendimiento-climatico': '#C7245E',
  desarrollador: '#2547A0',
  academia: '#6A4FC7',
  inferred: '#6B7280',
};

let mpcNetworkJsonCache = null;
let mpcNetworkGraphInstance = null;
let mpcNetworkForceGraphPromise = null;

const MPC_NETWORK_MAP_SOURCE = 'mpc-network-demo-geojson';
const MPC_NETWORK_LINE_LAYER = 'mpc-network-lines';

function waitForMpcNetworkLayoutPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function getMpcProjectCoord(projectId) {
  const features = toggleLayerCache['proyectos-mpc']?.features || [];
  const f = features.find((x) => Number(x.properties.id) === Number(projectId));
  const c = f?.geometry?.coordinates;
  if (!Array.isArray(c) || c.length < 2) return null;
  return [Number(c[0]), Number(c[1])];
}

/** Curva tipo arco en lng/lat (Bézier cuadrática) para que las aristas se lean mejor con pitch 3D del mapa. */
function mpcNetworkCurvedLineCoordinates(a, b, segments = 28) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dist = Math.hypot(dx, dy) || 1e-9;
  const nx = -dy / dist;
  const ny = dx / dist;
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const bulgeDeg = Math.min(dist * 0.22, 0.42);
  const ctrl = [mid[0] + nx * bulgeDeg, mid[1] + ny * bulgeDeg];
  const out = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const u = 1 - t;
    out.push([
      u * u * a[0] + 2 * u * t * ctrl[0] + t * t * b[0],
      u * u * a[1] + 2 * u * t * ctrl[1] + t * t * b[1],
    ]);
  }
  return out;
}

function mpcNetworkLineColorMatchExpression() {
  const expr = ['match', ['get', 'role']];
  for (const [role, color] of Object.entries(NETWORK_ROLE_COLORS)) {
    expr.push(role, color);
  }
  expr.push('#64748b');
  return expr;
}

function buildMpcNetworkMapGeoJSON(links) {
  const features = [];
  for (const L of links) {
    const a = getMpcProjectCoord(L.source);
    const b = getMpcProjectCoord(L.target);
    if (!a || !b) continue;
    const coords = mpcNetworkCurvedLineCoordinates(a, b);
    features.push({
      type: 'Feature',
      properties: { role: L.role || 'sociedad-civil' },
      geometry: { type: 'LineString', coordinates: coords },
    });
  }
  return { type: 'FeatureCollection', features };
}

function fitMapToMpcNetworkEndpoints(links) {
  const coords = [];
  for (const L of links) {
    const a = getMpcProjectCoord(L.source);
    const b = getMpcProjectCoord(L.target);
    if (!a || !b) continue;
    mpcNetworkCurvedLineCoordinates(a, b).forEach((p) => coords.push(p));
  }
  if (coords.length < 2) return;
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  coords.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  });
  if (!Number.isFinite(minLng)) return;
  try {
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: { top: 100, bottom: 120, left: 80, right: 80 }, maxZoom: 12, duration: 850 },
    );
  } catch (_) {}
}

function syncMpcNetworkMapLayers(links) {
  if (typeof map === 'undefined' || !map || !map.isStyleLoaded()) return;
  const geojson = buildMpcNetworkMapGeoJSON(links);
  try {
    if (map.getSource(MPC_NETWORK_MAP_SOURCE)) {
      map.getSource(MPC_NETWORK_MAP_SOURCE).setData(geojson);
    } else {
      map.addSource(MPC_NETWORK_MAP_SOURCE, {
        type: 'geojson',
        data: geojson,
      });
      const beforeId = map.getLayer('toggle-circle-proyectos-mpc') ? 'toggle-circle-proyectos-mpc' : undefined;
      map.addLayer(
        {
          id: MPC_NETWORK_LINE_LAYER,
          type: 'line',
          source: MPC_NETWORK_MAP_SOURCE,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': mpcNetworkLineColorMatchExpression(),
            'line-width': 2.35,
            'line-opacity': 0.92,
            'line-blur': 0.35,
          },
        },
        beforeId,
      );
    }
  } catch (e) {
    console.warn('MPC red mapa:', e);
  }
}

function clearMpcNetworkMapLayers() {
  if (typeof map === 'undefined' || !map || !map.isStyleLoaded()) return;
  try {
    if (map.getLayer(MPC_NETWORK_LINE_LAYER)) map.removeLayer(MPC_NETWORK_LINE_LAYER);
    if (map.getSource(MPC_NETWORK_MAP_SOURCE)) map.removeSource(MPC_NETWORK_MAP_SOURCE);
  } catch (_) {}
}

const ACTOR_LABELS_ES = {
  visitante: 'Visitante',
  empresa: 'Empresa',
  'fondo-inversion': 'Fondo de inversión',
  'sociedad-civil': 'Sociedad civil',
  gobierno: 'Gobierno',
  academia: 'Academia',
  'emprendimiento-climatico': 'Emprendimiento climático',
  desarrollador: 'Consultor / implementador',
  administrador: 'Administrador',
};

/** Descripción del panel explorador según rol (HTML seguro, solo <strong>). */
const EXPLORER_PURPOSE_BY_ACTOR = {
  visitante:
    'Explora el <strong>panorama</strong> del ecosistema, <strong>filtra</strong> por sector y necesidad y abre fichas para entender <strong>tracción e impacto</strong> antes de dar el siguiente paso.',
  empresa:
    'Alinea <strong>inversión u operación</strong> con proyectos en campo: filtra por <strong>territorio</strong>, revisa <strong>tracción e impacto declarado</strong> y <strong>conecta</strong> con quien busca socios, capital o pilotos (más allá de listados estáticos).',
  'fondo-inversion':
    'Construye <strong>tubería</strong> de oportunidades: prioriza por <strong>territorio y tesis</strong>, compara <strong>impacto CO₂</strong> declarado y acerca un <strong>primer filtro</strong> a proyectos que ya están en el mapa.',
  'sociedad-civil':
    '<strong>Visibiliza</strong> iniciativas y brechas, <strong>contrasta</strong> proyectos con capas ambientales o territoriales y encuentra <strong>aliados</strong> para incidencia o implementación, con el territorio como argumento.',
  gobierno:
    '<strong>Contextualiza</strong> políticas y programas con proyectos en campo: ubica <strong>iniciativas por estado</strong>, cruza con <strong>vulnerabilidad</strong> cuando actives capas y prioriza el <strong>diálogo</strong> con actores locales.',
  academia:
    'Conecta tu <strong>línea de investigación</strong> con proyectos en territorio: explora <strong>datos e impacto declarados</strong>, identifica <strong>colaboración de campo</strong> y valida <strong>hipótesis</strong> sin quedarte solo en bibliografía.',
  'emprendimiento-climatico':
    'Gana <strong>visibilidad</strong> frente a fondos y aliados: muestra <strong>tracción</strong>, filtra por <strong>financiamiento o networking</strong> y <strong>enciende</strong> conversaciones útiles, no solo un pin en el mapa.',
  desarrollador:
    'Para <strong>consultoras y empresas</strong> que <strong>desarrollan e implementan</strong> proyectos: cruza <strong>territorio y capas</strong>, prioriza <strong>dónde aportar estudios</strong> (línea base, factibilidad, diseño) y <strong>conecta</strong> con quien busca aliados para llevar obra o pilotos a campo (demo).',
  administrador:
    'Vista <strong>operativa</strong> del atlas (demo): revisa cómo se ven <strong>proyectos y capas</strong>, prueba <strong>filtros y flujos</strong> de interés como referencia para el equipo.',
};

function getCurrentActor() {
  try {
    return sessionStorage.getItem(MPC_ACTOR_KEY) || 'visitante';
  } catch (_) {
    return 'visitante';
  }
}

function getOperatingStates() {
  try {
    const raw = sessionStorage.getItem(MPC_OPERATING_STATES_KEY);
    if (!raw) return [];
    const a = JSON.parse(raw);
    return Array.isArray(a) ? a : [];
  } catch (_) {
    return [];
  }
}

function saveOperatingStates(states) {
  try {
    sessionStorage.setItem(MPC_OPERATING_STATES_KEY, JSON.stringify(states));
  } catch (_) {}
}

/* ---------------------- Terrain ---------------------- */

const Z_KEY = 'terrain:z:mpc';
const Z_MIN = 0, Z_MAX = 5, Z_STEP = 0.2;
let currentZ = parseFloat(localStorage.getItem(Z_KEY)) || 1.2;
if (!Number.isFinite(currentZ)) currentZ = 1.2;

/* ---------------------- Map ---------------------- */

const map = new mapboxgl.Map({
  container: 'map',
  style: BASE_MAP_STYLES.satellite,
  center: PLANET_CENTER,
  zoom: PLANET_ZOOM,
  pitch: PLANET_PITCH,
  bearing: 0,
  antialias: true,
  projection: 'globe',
  fadeDuration: 0,
  optimizeForTerrain: false,
});

const hoverPopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 14, maxWidth: '280px' });

map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
window.addEventListener('resize', () => map.resize());

let _mapPrewarmInterval = setInterval(() => {
  const atlas = document.getElementById('mpc-atlas');
  if (atlas && !atlas.classList.contains('is-hidden')) {
    clearInterval(_mapPrewarmInterval);
    return;
  }
  try { map.resize(); } catch (_) {}
}, 2000);

function setMpcMapLoading(active) {
  const el = document.getElementById('mpc-map-loading');
  if (!el) return;
  if (active) {
    el.classList.remove('mpc-map-loading--hidden');
    el.setAttribute('aria-busy', 'true');
    el.removeAttribute('aria-hidden');
  } else {
    el.classList.add('mpc-map-loading--hidden');
    el.setAttribute('aria-busy', 'false');
    el.setAttribute('aria-hidden', 'true');
  }
}

/** Mapa + capas iniciales listos; el overlay solo se oculta cuando el usuario ya pasó splash y actor (si no, nunca lo vería). */
const MIN_MPC_LOADING_MS = 750;
let mpcMapInitReady = false;
let mpcAtlasEnteredAt = null;
let mpcLoadingHideTimer = null;

function markMpcAtlasEnteredIfNeeded() {
  const splash = document.getElementById('splash');
  const actor = document.getElementById('actor-select');
  const pastSplash = splash?.classList.contains('is-hidden');
  const pastActor = actor?.classList.contains('is-hidden');
  if (pastSplash && pastActor && mpcAtlasEnteredAt == null) {
    mpcAtlasEnteredAt = Date.now();
  }
}

function tryHideMpcMapLoading() {
  markMpcAtlasEnteredIfNeeded();
  if (!mpcMapInitReady) return;
  const splash = document.getElementById('splash');
  const actor = document.getElementById('actor-select');
  const pastSplash = splash?.classList.contains('is-hidden');
  const pastActor = actor?.classList.contains('is-hidden');
  if (!pastSplash || !pastActor) return;

  if (mpcAtlasEnteredAt == null) mpcAtlasEnteredAt = Date.now();

  const hide = () => {
    mpcLoadingHideTimer = null;
    setMpcMapLoading(false);
  };

  const elapsed = Date.now() - mpcAtlasEnteredAt;
  const remaining = Math.max(0, MIN_MPC_LOADING_MS - elapsed);

  if (mpcLoadingHideTimer != null) {
    clearTimeout(mpcLoadingHideTimer);
  }
  mpcLoadingHideTimer = setTimeout(hide, remaining);
}

/* ---------------------- Data Loading ---------------------- */

async function loadGeoJSON(url, name) {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 30000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') console.error(`Timeout: ${name}`);
    else console.warn(`No se pudo cargar ${name}:`, err.message);
    return null;
  }
}

/** AOI exportada desde KMZ (PROYECTO_01_ANANALYTICS/AOI/La Herradura (2).kmz) → GeoJSON local */
const AOI_LA_HERRADURA_URL = 'data/la_herradura_aoi.geojson';

async function addLaHerraduraAoiLayer() {
  const data = await loadGeoJSON(AOI_LA_HERRADURA_URL, 'aoi-la-herradura');
  if (!data?.features?.length) return;

  if (map.getSource('aoi-la-herradura')) return;

  map.addSource('aoi-la-herradura', { type: 'geojson', data });

  map.addLayer({
    id: 'aoi-la-herradura-line',
    type: 'line',
    source: 'aoi-la-herradura',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': '#ffffff',
      'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1.5, 10, 2.5, 14, 4],
      'line-opacity': 0.98,
    },
  });

  try {
    const bbox = turf.bbox(data);
    map.fitBounds(
      [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
      { padding: { top: 100, bottom: 100, left: 100, right: 120 }, duration: 2200, maxZoom: 11.5 }
    );
  } catch (_) {}
}

/* ---------------------- Base Layers ---------------------- */

function addBaseLayers() {
  if (!map.getSource('mapbox-dem')) {
    map.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.terrain-rgb', tileSize: 512, maxzoom: 14 });
  }
  try { map.setTerrain({ source: 'mapbox-dem', exaggeration: currentZ }); } catch (_) {}

  if (!map.getLayer('sky')) {
    map.addLayer({ id: 'sky', type: 'sky', paint: { 'sky-type': 'atmosphere', 'sky-atmosphere-sun-intensity': 5.5 } });
  }
  if (!map.getLayer('terrain-hillshade')) {
    map.addLayer({
      id: 'terrain-hillshade', type: 'hillshade', source: 'mapbox-dem',
      paint: { 'hillshade-exaggeration': 0.2, 'hillshade-shadow-color': '#071320' }
    });
  }
}

/* ---------------------- Toggle Layers ---------------------- */

async function addToggleLayerToMap(layerDef) {
  const srcId = `toggle-src-${layerDef.id}`;

  if (map.getSource(srcId)) {
    showToggleLayers(layerDef, true);
    return;
  }

  if (!layerDef.file) {
    showLayerUnavailable(layerDef);
    return;
  }

  const toggle = document.querySelector(`input[data-toggle-layer="${layerDef.id}"]`);
  let spinner = null;
  if (toggle) {
    const item = toggle.closest('.layer-item');
    if (item) {
      spinner = document.createElement('span');
      spinner.className = 'loading-spinner loading-spinner--mpc';
      const img = document.createElement('img');
      img.className = 'loading-spinner__mpc';
      img.src = 'assets/mpc-circulo-loading.webp';
      img.alt = '';
      img.width = 14;
      img.height = 14;
      img.decoding = 'async';
      spinner.appendChild(img);
      item.appendChild(spinner);
    }
  }

  const data = await loadGeoJSON(layerDef.file, layerDef.id);
  if (spinner) spinner.remove();

  if (!data) {
    if (toggle) {
      toggle.checked = false;
      const item = toggle.closest('.layer-item');
      if (item) { item.style.borderColor = 'var(--accent-red)'; setTimeout(() => { item.style.borderColor = ''; }, 2000); }
    }
    return;
  }

  toggleLayerCache[layerDef.id] = data;
  map.addSource(srcId, { type: 'geojson', data });

  const bL = () => { try { return map.getLayer('terrain-hillshade') ? undefined : undefined; } catch(_) { return undefined; } };

  if (layerDef.id === 'proyectos-mpc') {
    addProyectosMPCLayers(srcId);
    // Expose features for Swipe Deck
    window._mpcProjectFeatures = data.features || [];
    if (typeof window._swipeDeckRefresh === 'function') window._swipeDeckRefresh();
  } else if (layerDef.id === 'proyectos-carbono') {
    addProyectosCarbonoLayers(srcId);
  } else if (layerDef.id === 'zonas-desatendidas') {
    addZonasDesatendidasLayers(srcId);
  } else if (layerDef.type === 'predio-aoi') {
    addPredioAoiLineLayer(srcId, layerDef.id);
  } else if (layerDef.predioSuitability) {
    addPredioSuitabilityLayers(layerDef, srcId);
  } else if (layerDef.predioDeforest) {
    addPredioDeforestLayers(layerDef, srcId);
  } else if (layerDef.type === 'polygon') {
    addGenericPolygonLayers(layerDef, srcId);
  } else if (layerDef.type === 'line') {
    addGenericLineLayers(layerDef, srcId);
  } else {
    addGenericPointLayers(layerDef, srcId);
  }

  setupHover(layerDef);
  updateLegend();
}

function addProyectosMPCLayers(srcId) {
  map.addLayer({
    id: 'toggle-circle-proyectos-mpc', type: 'circle', source: srcId,
    paint: {
      'circle-color': ['get', 'color'],
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 9, 2, 8, 4, 5, 8, 8, 12, 12],
      'circle-opacity': 0.95,
      'circle-stroke-color': 'rgba(255,255,255,0.75)',
      'circle-stroke-width': 1.25,
    }
  });

  map.addLayer({
    id: 'toggle-label-proyectos-mpc', type: 'symbol', source: srcId,
    minzoom: 7,
    layout: {
      'text-field': ['get', 'nombre'],
      'text-size': 10,
      'text-offset': [0, 2],
      'text-anchor': 'top',
      'text-allow-overlap': false,
      'text-max-width': 14,
      'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': 'rgba(12, 27, 42, 0.88)',
      'text-halo-width': 1.1,
    }
  });

  map.on('click', 'toggle-circle-proyectos-mpc', handleProjectClick);
}

function addProyectosCarbonoLayers(srcId) {
  map.addLayer({
    id: 'toggle-circle-proyectos-carbono',
    type: 'circle',
    source: srcId,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 7, 2, 6, 4, 3, 8, 6, 11, 9],
      'circle-color': [
        'match',
        ['get', 'carbon_program'],
        'VCS',
        '#B388FF',
        '#26C6DA',
      ],
      'circle-opacity': 0.92,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1.4,
    },
  });

  map.addLayer({
    id: 'toggle-label-proyectos-carbono',
    type: 'symbol',
    source: srcId,
    minzoom: 7,
    layout: {
      'text-field': ['coalesce', ['get', 'nombre'], ''],
      'text-size': 9,
      'text-offset': [0, 1.6],
      'text-anchor': 'top',
      'text-allow-overlap': false,
      'text-max-width': 12,
      'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
    },
    paint: {
      'text-color': '#f0f4f8',
      'text-halo-color': 'rgba(8, 12, 18, 0.92)',
      'text-halo-width': 1,
    },
  });

  map.on('click', 'toggle-circle-proyectos-carbono', handleCarbonProjectClick);
}

function addPredioAoiLineLayer(srcId, layerId) {
  map.addLayer({
    id: `toggle-fill-${layerId}`,
    type: 'fill',
    source: srcId,
    paint: {
      'fill-color': '#0b1220',
      'fill-opacity': 0.14,
    },
  });
  map.addLayer({
    id: `toggle-line-${layerId}`,
    type: 'line',
    source: srcId,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': '#ffffff',
      'line-width': ['interpolate', ['linear'], ['zoom'], 8, 2, 14, 3.5],
      'line-opacity': 0.95,
    },
  });

  if (!predioAoiClickHandlersBound) {
    predioAoiClickHandlersBound = true;
    map.on('click', ['toggle-fill-predio-aoi', 'toggle-line-predio-aoi'], handlePredioAoiClick);
  }
}

function addPredioSuitabilityLayers(layerDef, srcId) {
  const lid = layerDef.id;
  const palette = lid === 'predio-d1' ? SUITABILITY_CARBON_CLASS_COLORS : SUITABILITY_CLASS_COLORS_RDYLGN;
  const fillColor = [
    'match', ['get', 'class'],
    1, palette[1],
    2, palette[2],
    3, palette[3],
    4, palette[4],
    5, palette[5],
    '#64748b',
  ];
  map.addLayer({
    id: `toggle-fill-${lid}`,
    type: 'fill',
    source: srcId,
    paint: {
      'fill-color': fillColor,
      'fill-opacity': 0.65,
    },
  });
  map.addLayer({
    id: `toggle-line-${lid}`,
    type: 'line',
    source: srcId,
    paint: {
      'line-color': '#333333',
      'line-width': 0.3,
      'line-opacity': 0.4,
    },
  });
}

function addPredioDeforestLayers(layerDef, srcId) {
  const lid = layerDef.id;
  map.addLayer({
    id: `toggle-fill-${lid}`,
    type: 'fill',
    source: srcId,
    paint: {
      'fill-color': ['coalesce', ['get', 'color'], '#b71c1c'],
      'fill-opacity': 0.45,
    },
  });
  map.addLayer({
    id: `toggle-line-${lid}`,
    type: 'line',
    source: srcId,
    paint: {
      'line-color': ['coalesce', ['get', 'color'], '#b71c1c'],
      'line-width': 1,
      'line-opacity': 0.65,
    },
  });
}

function addZonasDesatendidasLayers(srcId) {
  map.addLayer({
    id: 'toggle-fill-zonas-desatendidas', type: 'fill', source: srcId,
    paint: {
      'fill-color': ['get', 'fill_color'],
      'fill-opacity': 0.35,
    }
  });
  map.addLayer({
    id: 'toggle-line-zonas-desatendidas', type: 'line', source: srcId,
    paint: {
      'line-color': '#FF8F00',
      'line-width': 2,
      'line-opacity': 0.8,
      'line-dasharray': [6, 3],
    }
  });
  map.addLayer({
    id: 'toggle-label-zonas-desatendidas', type: 'symbol', source: srcId,
    layout: {
      'text-field': ['concat', ['get', 'nombre'], '\n', 'Score: ', ['to-string', ['get', 'score']]],
      'text-size': 10,
      'text-anchor': 'center',
      'text-allow-overlap': false,
      'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
    },
    paint: {
      'text-color': '#FFB74D',
      'text-halo-color': 'rgba(12, 27, 42, 0.9)',
      'text-halo-width': 1.5,
    }
  });

  map.on('click', 'toggle-fill-zonas-desatendidas', handleZonaClick);
}

function addGenericPolygonLayers(layerDef, srcId) {
  const colors = {
    anp: { fill: '#2E7D32', line: '#66BB6A' },
    restauracion: { fill: '#558B2F', line: '#8BC34A' },
    ejidos: { fill: '#FF7043', line: '#FF5722' },
    indigenas: { fill: '#7B1FA2', line: '#CE93D8' },
    subcuencas: { fill: '#5C6BC0', line: '#7986CB' },
    acuiferos: { fill: '#00838F', line: '#26C6DA' },
    ramsar: { fill: '#00838F', line: '#4DD0E1' },
  };
  const c = colors[layerDef.id] || { fill: '#4db6ac', line: '#80CBC4' };

  map.addLayer({
    id: `toggle-fill-${layerDef.id}`, type: 'fill', source: srcId,
    paint: { 'fill-color': c.fill, 'fill-opacity': 0.2 }
  });
  map.addLayer({
    id: `toggle-line-${layerDef.id}`, type: 'line', source: srcId,
    paint: { 'line-color': c.line, 'line-width': 1.5, 'line-opacity': 0.7, 'line-dasharray': [4, 2] }
  });
}

function addGenericLineLayers(layerDef, srcId) {
  map.addLayer({
    id: `toggle-line-${layerDef.id}`, type: 'line', source: srcId,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#42A5F5', 'line-width': 1.5, 'line-opacity': 0.7 }
  });
}

function addGenericPointLayers(layerDef, srcId) {
  map.addLayer({
    id: `toggle-circle-${layerDef.id}`, type: 'circle', source: srcId,
    paint: {
      'circle-color': ['coalesce', ['get', 'color'], '#F9A826'],
      'circle-radius': 5,
      'circle-opacity': 0.9,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1,
    }
  });
}

function showToggleLayers(layerDef, visible) {
  const vis = visible ? 'visible' : 'none';
  const prefixes = ['fill', 'line', 'circle', 'label', 'glow', 'dash'];
  prefixes.forEach(p => {
    const lid = `toggle-${p}-${layerDef.id}`;
    if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', vis);
  });
}

function showLayerUnavailable(layerDef) {
  const toggle = document.querySelector(`input[data-toggle-layer="${layerDef.id}"]`);
  if (toggle) {
    toggle.checked = false;
    const item = toggle.closest('.layer-item');
    if (item) {
      item.style.borderColor = 'var(--accent-yellow)';
      const note = document.createElement('span');
      note.className = 'layer-note';
      note.textContent = layerDef.note || 'No disponible';
      note.style.cssText = 'font-size:9px;color:var(--accent-yellow);display:block;margin-top:2px;';
      if (!item.querySelector('.layer-note')) item.appendChild(note);
      setTimeout(() => { item.style.borderColor = ''; }, 3000);
    }
  }
}

/* ---------------------- Hover Popups ---------------------- */

function setupHover(layerDef) {
  let hoverLayer;
  if (layerDef.id === 'proyectos-mpc') hoverLayer = 'toggle-circle-proyectos-mpc';
  else if (layerDef.id === 'proyectos-carbono') hoverLayer = 'toggle-circle-proyectos-carbono';
  else if (layerDef.id === 'zonas-desatendidas') hoverLayer = 'toggle-fill-zonas-desatendidas';
  else if (layerDef.id === 'predio-aoi') hoverLayer = 'toggle-fill-predio-aoi';
  else if (layerDef.predioSuitability || layerDef.predioDeforest) hoverLayer = `toggle-fill-${layerDef.id}`;
  else if (layerDef.type === 'polygon') hoverLayer = `toggle-fill-${layerDef.id}`;
  else if (layerDef.type === 'line') hoverLayer = `toggle-line-${layerDef.id}`;
  else hoverLayer = `toggle-circle-${layerDef.id}`;

  if (!map.getLayer(hoverLayer)) return;

  map.on('mouseenter', hoverLayer, (e) => {
    map.getCanvas().style.cursor = 'pointer';
    if (!e.features?.length) return;
    const p = e.features[0].properties;
    let html = '';

    if (layerDef.id === 'proyectos-mpc') {
      html = `<div style="border-left:3px solid ${p.color || '#2CB67D'};padding-left:8px;">
        <strong>${p.nombre}</strong><br>
        <span style="color:${p.color || '#2CB67D'};font-size:10px;">${p.sector}</span><br>
        <span class="muted">${p.organizacion} · ${p.estado}</span><br>
        <span class="muted">${p.hectareas ? Number(p.hectareas).toLocaleString('es-MX') + ' ha' : ''} ${p.co2_ton ? '· ' + Number(p.co2_ton).toLocaleString('es-MX') + ' ton CO₂' : ''}</span>
      </div>`;
    } else if (layerDef.id === 'zonas-desatendidas') {
      html = `<div style="border-left:3px solid #FF8F00;padding-left:8px;">
        <strong style="color:#FF8F00;">${p.nombre}</strong><br>
        <span class="muted">Score: ${p.score} · Riesgo: ${p.riesgo}</span><br>
        <span class="muted">Población: ${Number(p.poblacion).toLocaleString('es-MX')}</span><br>
        <span class="muted">Proyectos activos: ${p.proyectos_activos}</span>
      </div>`;
    } else if (layerDef.id === 'proyectos-carbono') {
      const prog = p.carbon_program === 'VCS' ? 'VCS' : 'CAR';
      const col = prog === 'VCS' ? '#B388FF' : '#26C6DA';
      html = `<div style="border-left:3px solid ${col};padding-left:8px;">
        <strong>${p.nombre || 'Proyecto'}</strong><br>
        <span style="color:${col};font-size:10px;">${prog} · ${p.estado || ''}</span><br>
        <span class="muted">${p.organizacion || ''}</span><br>
        <span class="muted">${p.hectareas != null ? Number(p.hectareas).toLocaleString('es-MX') + ' ha' : ''}</span>
      </div>`;
    } else if (layerDef.predioSuitability) {
      const clsNum = p.class != null ? Number(p.class) : NaN;
      const pal = layerDef.id === 'predio-d1' ? SUITABILITY_CARBON_CLASS_COLORS : SUITABILITY_CLASS_COLORS_RDYLGN;
      const borderCol = Number.isFinite(clsNum) && pal[clsNum] ? pal[clsNum] : '#64748b';
      html = `<div style="border-left:3px solid ${borderCol};padding-left:8px;">
        <strong>${p.class_name || SUITABILITY_CLASS_NAMES[clsNum] || 'Clase'} · ${p.use_name || ''}</strong><br>
        <span class="muted">Clase ${p.class != null ? p.class : '—'} · ${p.area_ha != null ? Number(p.area_ha).toLocaleString('es-MX', { maximumFractionDigits: 2 }) + ' ha' : ''}</span>
      </div>`;
    } else if (layerDef.predioDeforest) {
      html = `<div style="border-left:3px solid ${p.color || '#c62828'};padding-left:8px;">
        <strong>${p.label || p.periodo || 'Pérdida forestal'}</strong><br>
        <span class="muted">${p.periodo || ''}</span>
      </div>`;
    } else if (layerDef.id === 'predio-aoi') {
      html = `<div style="border-left:3px solid #fff;padding-left:8px;">
        <strong>${p.name || 'Predio demo'}</strong><br>
        <span class="muted">${PREDIO_DEMO_FICHA.titular}</span><br>
        <span class="muted" style="font-size:10px;">Clic para ver la ficha</span>
      </div>`;
    } else {
      const nameField = Object.keys(p).find(k => /^(NOMBRE|nombre|NOM_|name)/i.test(k));
      html = `<strong>${nameField ? p[nameField] : layerDef.label}</strong>`;
    }

    if (html) hoverPopup.setLngLat(e.lngLat).setHTML(html).addTo(map);
  });

  map.on('mouseleave', hoverLayer, () => {
    map.getCanvas().style.cursor = '';
    hoverPopup.remove();
  });
}

/* ---------------------- Click Handlers ---------------------- */

function handleProjectClick(e) {
  if (!e.features?.length) return;
  fillMpcDetailPanel(e.features[0].properties);
  document.getElementById('detail-panel').classList.remove('hidden');
  document.getElementById('zona-panel').classList.add('hidden');
}

function handleCarbonProjectClick(e) {
  if (!e.features?.length) return;
  fillCarbonDetailPanel(e.features[0].properties);
  document.getElementById('detail-panel').classList.remove('hidden');
  document.getElementById('zona-panel').classList.add('hidden');
}

function handlePredioAoiClick(e) {
  if (!PREDIO_MODE || !e.features?.length) return;
  const feat = e.features[0];
  let areaHa = null;
  try {
    const a = turf.area(feat);
    areaHa = a / 10000;
  } catch (_) {}
  fillPredioDetailPanel(feat.properties || {}, areaHa);
  document.getElementById('detail-panel')?.classList.remove('hidden');
  document.getElementById('zona-panel')?.classList.add('hidden');
}

const PROJECT_IMAGES = {
  6: [
    'assets/proyectos/proyecto-6-1.png',
    'assets/proyectos/proyecto-6-2.jpeg',
  ],
};

function renderDetailGallery(projectId, imageUrlListOverride, imageAlt) {
  const el = document.getElementById('detail-gallery');
  if (!el) return;
  const imgs =
    Array.isArray(imageUrlListOverride) && imageUrlListOverride.length > 0
      ? imageUrlListOverride
      : projectId != null
        ? PROJECT_IMAGES[projectId]
        : null;
  if (!imgs || imgs.length === 0) {
    el.classList.add('hidden');
    el.innerHTML = '';
    return;
  }
  const altText = imageAlt || 'Foto del proyecto';
  el.classList.remove('hidden');
  el.innerHTML = imgs.map((src) =>
    `<img src="${src}" alt="${escapeDetailHtml(altText)}" loading="lazy">`
  ).join('');

  el.querySelectorAll('img').forEach((img) => {
    img.addEventListener('click', () => {
      const lb = document.createElement('div');
      lb.className = 'detail-lightbox';
      lb.innerHTML = `<img src="${img.src}" alt="Foto ampliada">`;
      lb.addEventListener('click', () => lb.remove());
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { lb.remove(); document.removeEventListener('keydown', esc); }
      });
      document.body.appendChild(lb);
    });
  });
}

function fillMpcDetailPanel(p) {
  const sectorClass = p.sector === 'Innovación Catalítica' ? 'sector-innovacion'
    : p.sector === 'Despertar Planetario' ? 'sector-despertar' : '';

  const badge = document.getElementById('detail-sector-badge');
  badge.textContent = p.sector;
  badge.className = 'sector-pill ' + sectorClass;

  document.getElementById('detail-title').textContent = p.nombre;
  document.getElementById('detail-org').textContent = p.organizacion;
  document.getElementById('detail-desc').textContent = p.descripcion || '';
  document.getElementById('detail-hectareas').textContent = p.hectareas ? Number(p.hectareas).toLocaleString('es-MX') : 'n/d';
  document.getElementById('detail-co2').textContent = p.co2_ton ? Number(p.co2_ton).toLocaleString('es-MX') : 'n/d';
  document.getElementById('detail-beneficiarios').textContent = p.beneficiarios ? Number(p.beneficiarios).toLocaleString('es-MX') : 'n/d';
  document.getElementById('detail-estado').textContent = p.estado || 'n/d';
  document.getElementById('detail-municipio').textContent = p.municipio || 'n/d';
  document.getElementById('detail-tipo-org').textContent = p.tipo_org || 'n/d';
  document.getElementById('detail-subsector').textContent = p.subsector || 'n/d';
  document.getElementById('detail-year').textContent = p.year || 'n/d';
  document.getElementById('detail-status').textContent = p.status || 'n/d';

  const needBadge = document.getElementById('detail-need');
  needBadge.textContent = p.necesidad ? `Busca ${p.necesidad.toLowerCase()}` : 'n/d';

  const dp = document.getElementById('detail-panel');
  dp.dataset.projectId = p.id != null ? String(p.id) : '';
  dp.dataset.detailKind = 'mpc';

  const tag = document.getElementById('detail-source-tag');
  if (tag) {
    tag.textContent = '';
    tag.classList.add('hidden');
    tag.setAttribute('aria-hidden', 'true');
  }
  document.getElementById('detail-kv-mpc')?.classList.remove('hidden');
  document.getElementById('detail-kv-carbon')?.classList.add('hidden');
  document.getElementById('detail-kv-predio')?.classList.add('hidden');
  document.getElementById('detail-cta-predio')?.classList.add('hidden');
  document.getElementById('detail-need-wrap')?.classList.remove('hidden');
  document.getElementById('detail-cta-mpc')?.classList.remove('hidden');
  document.getElementById('detail-cta-carbon')?.classList.add('hidden');
  document.getElementById('detail-metrics-grid')?.classList.remove('hidden');

  document.getElementById('detail-unit-m1').textContent = 'hectáreas';
  document.getElementById('detail-unit-m2').textContent = 'ton CO₂';
  document.getElementById('detail-unit-m3').textContent = 'beneficiarios';

  const legal = document.getElementById('detail-demo-legal');
  if (legal) {
    legal.textContent = 'Demo: manifestar interés solo guarda datos en este navegador; no es compromiso legal ni fiscal.';
  }

  renderDetailGallery(p.id != null ? Number(p.id) : null);

  refreshDetailCtas();
}

function escapeDetailHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fillCarbonDetailPanel(p) {
  const dp = document.getElementById('detail-panel');
  dp.dataset.projectId = p.id != null ? String(p.id) : '';
  dp.dataset.detailKind = 'carbono';

  const tag = document.getElementById('detail-source-tag');
  if (tag) {
    tag.textContent = 'Benchmark carbono · CAR / VCS · México (ago 2024)';
    tag.classList.remove('hidden');
    tag.setAttribute('aria-hidden', 'false');
  }

  const slug = p.sector_slug === 'carbono-vcs' ? 'sector-carbono-vcs' : 'sector-carbono-car';
  const badge = document.getElementById('detail-sector-badge');
  badge.textContent = p.sector || 'Carbono';
  badge.className = `sector-pill ${slug}`;

  document.getElementById('detail-title').textContent = p.nombre || 'n/d';
  document.getElementById('detail-org').textContent = p.organizacion || 'n/d';
  document.getElementById('detail-desc').textContent = p.descripcion || '';

  document.getElementById('detail-unit-m1').textContent = 'hectáreas';
  document.getElementById('detail-hectareas').textContent = p.hectareas != null ? Number(p.hectareas).toLocaleString('es-MX') : 'n/d';
  document.getElementById('detail-unit-m2').textContent = p.co2_label || 't CO₂e';
  const co2 = p.co2_ton != null && p.co2_ton !== '' ? Number(p.co2_ton) : null;
  document.getElementById('detail-co2').textContent = co2 != null && !Number.isNaN(co2) ? co2.toLocaleString('es-MX') : 'n/d';
  document.getElementById('detail-unit-m3').textContent = p.beneficiarios_label || 'n/d';
  document.getElementById('detail-beneficiarios').textContent = (p.beneficiarios_val && String(p.beneficiarios_val).slice(0, 96)) || 'n/d';

  document.getElementById('detail-kv-mpc')?.classList.add('hidden');
  document.getElementById('detail-kv-predio')?.classList.add('hidden');
  document.getElementById('detail-cta-predio')?.classList.add('hidden');
  document.getElementById('detail-metrics-grid')?.classList.remove('hidden');
  const kv = document.getElementById('detail-kv-carbon');
  kv.classList.remove('hidden');

  const rows = [
    ['Estándar', p.carbon_program === 'VCS' ? 'VCS (Verra)' : 'CAR (Climate Action Reserve)'],
    ['Estado / región', p.estado],
    ['Tipo', p.subsector],
    ['Estado en registro', p.status],
  ];
  if (p.credits_released != null && p.credits_released !== '') {
    const cr = Number(p.credits_released);
    rows.push(['Créditos (hist.)', Number.isFinite(cr) ? cr.toLocaleString('es-MX') : 'n/d']);
  }
  if (p.ton_ha != null && p.ton_ha !== '') {
    rows.push(['t CO₂ / ha', String(p.ton_ha)]);
  }
  if (p.est_anual != null && p.est_anual !== '') {
    const ea = Number(p.est_anual);
    rows.push(['Est. emisiones anuales (VCS)', Number.isFinite(ea) ? `${ea.toLocaleString('es-MX')} t CO₂e/año` : 'n/d']);
  }
  if (p.methodology && String(p.methodology).trim() && p.methodology !== 'n/d') {
    rows.push(['Metodología', String(p.methodology)]);
  }

  kv.innerHTML = rows.map(([k, v], i) => {
    const last = i === rows.length - 1 ? ' border-none' : '';
    return `<div class="detail-row${last}"><span class="detail-key">${escapeDetailHtml(k)}</span><span class="detail-val">${escapeDetailHtml(v)}</span></div>`;
  }).join('');

  document.getElementById('detail-need-wrap')?.classList.add('hidden');

  const legal = document.getElementById('detail-demo-legal');
  if (legal) {
    legal.textContent = 'Datos derivados de shapefiles públicos (benchmark). Las cifras pueden ser estimadas; no sustituyen verificación oficial CAR/VCS.';
  }
  document.getElementById('detail-intent-banner')?.classList.add('hidden');

  document.getElementById('detail-cta-mpc')?.classList.add('hidden');
  document.getElementById('detail-cta-carbon')?.classList.remove('hidden');
  const link = document.getElementById('detail-carbon-registry-link');
  if (link) {
    const url = (p.link_url || '').trim();
    if (url) {
      link.href = url;
      link.classList.remove('opacity-40', 'pointer-events-none');
    } else {
      link.href = '#';
      link.classList.add('opacity-40', 'pointer-events-none');
    }
  }

  const m2c = document.getElementById('detail-m2-btn-carbon');
  if (m2c) {
    m2c.onclick = () => {
      window.alert('La red de vínculos interactiva está disponible para proyectos MPC en esta demo.');
    };
  }

  renderDetailGallery(null);
}

function fillPredioDetailPanel(p, areaHa) {
  const dp = document.getElementById('detail-panel');
  if (!dp) return;
  dp.dataset.projectId = '';
  dp.dataset.detailKind = 'predio';

  const badge = document.getElementById('detail-sector-badge');
  badge.textContent = 'Predio demo · AOSENUMA';
  badge.className = 'sector-pill sector-predio-demo';

  const tag = document.getElementById('detail-source-tag');
  if (tag) {
    tag.textContent = 'Capa local · predio demo · aosenuma';
    tag.classList.remove('hidden');
    tag.setAttribute('aria-hidden', 'false');
  }

  document.getElementById('detail-title').textContent = p.name || 'Predio demo';
  document.getElementById('detail-org').textContent = PREDIO_DEMO_FICHA.titular;
  document.getElementById('detail-desc').textContent = PREDIO_DEMO_FICHA.descripcion;

  document.getElementById('detail-metrics-grid')?.classList.add('hidden');
  renderDetailGallery(null, PREDIO_DEMO_GALLERY, 'Imagen del predio demo');

  document.getElementById('detail-kv-mpc')?.classList.add('hidden');
  document.getElementById('detail-kv-carbon')?.classList.add('hidden');
  document.getElementById('detail-kv-predio')?.classList.remove('hidden');
  document.getElementById('detail-need-wrap')?.classList.add('hidden');

  const elTitular = document.getElementById('detail-predio-titular');
  const elTema = document.getElementById('detail-predio-tema');
  const elArea = document.getElementById('detail-predio-area');
  const elSource = document.getElementById('detail-predio-source');
  if (elTitular) elTitular.textContent = PREDIO_DEMO_FICHA.titular;
  if (elTema) elTema.textContent = PREDIO_DEMO_FICHA.tema;
  if (elArea) {
    elArea.textContent =
      areaHa != null && Number.isFinite(areaHa)
        ? `${areaHa.toLocaleString('es-MX', { maximumFractionDigits: 1 })} ha`
        : 'n/d';
  }
  if (elSource) elSource.textContent = (p.source && String(p.source).trim()) || 'predio_demo/aoi.geojson';

  document.getElementById('detail-cta-mpc')?.classList.add('hidden');
  document.getElementById('detail-cta-carbon')?.classList.add('hidden');
  document.getElementById('detail-cta-predio')?.classList.remove('hidden');

  const legal = document.getElementById('detail-demo-legal');
  if (legal) {
    legal.textContent =
      'Demo ilustrativa: datos y geometría son de referencia para la visualización; no sustituyen estudios de campo ni registros oficiales.';
  }
  document.getElementById('detail-intent-banner')?.classList.add('hidden');

  refreshDetailCtas();
}

function handleZonaClick(e) {
  if (!e.features?.length) return;
  const p = e.features[0].properties;

  document.getElementById('zona-title').textContent = p.nombre;
  document.getElementById('zona-score').textContent = p.score;
  document.getElementById('zona-riesgo').textContent = p.riesgo;
  document.getElementById('zona-poblacion').textContent = Number(p.poblacion).toLocaleString('es-MX');
  document.getElementById('zona-proyectos').textContent = p.proyectos_activos;
  document.getElementById('zona-area').textContent = Number(p.area_km2).toLocaleString('es-MX') + ' km²';

  document.getElementById('zona-panel').classList.remove('hidden');
  document.getElementById('detail-panel').classList.add('hidden');
}

/* ---------------------- UI Builders ---------------------- */

function buildToggleControls(containerId, layers) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  layers.forEach(ld => {
    const item = document.createElement('div');
    item.className = 'layer-item layer-row';

    const info = document.createElement('div');
    info.className = 'layer-info';
    const colorBox = document.createElement('span');
    colorBox.className = `layer-color ${ld.color}`;
    const name = document.createElement('span');
    name.className = 'layer-name';
    name.textContent = ld.label;
    info.appendChild(colorBox);
    info.appendChild(name);

    const toggle = document.createElement('label');
    toggle.className = 'toggle-switch';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.dataset.toggleLayer = ld.id;
    if (ld.defaultOn) input.checked = true;
    const slider = document.createElement('span');
    slider.className = 'toggle-slider';
    toggle.appendChild(input);
    toggle.appendChild(slider);

    item.appendChild(info);
    item.appendChild(toggle);
    container.appendChild(item);

    input.addEventListener('change', async () => {
      if (input.checked) {
        await addToggleLayerToMap(ld);
      } else {
        showToggleLayers(ld, false);
      }
      updateLegend();
    });
  });
}

/* ---------------------- Filters ---------------------- */

function getFilteredProjectFeatures() {
  const data = toggleLayerCache['proyectos-mpc'];
  if (!data?.features) return [];
  const sector = document.getElementById('filter-sector')?.value ?? 'all';
  const tipoOrg = document.getElementById('filter-tipo-org')?.value ?? 'all';
  const necesidad = document.getElementById('filter-necesidad')?.value ?? 'all';
  const states = getOperatingStates();
  return data.features.filter((f) => {
    const p = f.properties;
    if (sector !== 'all' && p.sector !== sector) return false;
    if (tipoOrg !== 'all' && p.tipo_org !== tipoOrg) return false;
    if (necesidad !== 'all' && p.necesidad !== necesidad) return false;
    if (states.length > 0 && !states.includes(p.estado)) return false;
    return true;
  });
}

function buildProjectMapFilterExpression() {
  const sector = document.getElementById('filter-sector')?.value ?? 'all';
  const tipoOrg = document.getElementById('filter-tipo-org')?.value ?? 'all';
  const necesidad = document.getElementById('filter-necesidad')?.value ?? 'all';
  const states = getOperatingStates();
  const parts = ['all'];
  if (sector !== 'all') parts.push(['==', ['get', 'sector'], sector]);
  if (tipoOrg !== 'all') parts.push(['==', ['get', 'tipo_org'], tipoOrg]);
  if (necesidad !== 'all') parts.push(['==', ['get', 'necesidad'], necesidad]);
  if (states.length > 0) {
    parts.push(['any', ...states.map((s) => ['==', ['get', 'estado'], s])]);
  }
  return parts.length > 1 ? parts : null;
}

function applyMapProjectFilter() {
  const mapFilter = buildProjectMapFilterExpression();
  ['toggle-circle-proyectos-mpc', 'toggle-label-proyectos-mpc'].forEach((lid) => {
    if (map.getLayer(lid)) map.setFilter(lid, mapFilter);
  });
}

const SECTOR_ROWS = [
  { key: 'Ecosistemas Resilientes', color: '#c4c4c4', label: 'Ecosistemas resilientes' },
  { key: 'Innovación Catalítica', color: '#8c8c8c', label: 'Innovación catalítica' },
  { key: 'Despertar Planetario', color: '#5a5a5a', label: 'Despertar planetario' },
];

function formatTonnesCo2(n) {
  if (!Number.isFinite(n) || n < 0) return 'n/d';
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(Math.round(n));
}

function updatePillarMetrics(filtered) {
  let nFin = 0;
  let nNet = 0;
  let nVol = 0;
  let co2 = 0;
  filtered.forEach((f) => {
    const p = f.properties;
    if (p.necesidad === 'Financiamiento') nFin += 1;
    if (p.necesidad === 'Aliados') nNet += 1;
    if (p.necesidad === 'Voluntarios') nVol += 1;
    co2 += Number(p.co2_ton) || 0;
  });
  const elFin = document.getElementById('pillar-count-fin');
  const elCo2 = document.getElementById('pillar-metric-co2');
  const elNet = document.getElementById('pillar-count-net');
  const elVol = document.getElementById('pillar-hint-vol');
  if (elFin) elFin.textContent = String(nFin);
  if (elCo2) elCo2.textContent = formatTonnesCo2(co2);
  if (elNet) elNet.textContent = String(nNet);
  if (elVol) {
    if (nVol > 0) {
      elVol.textContent = `+${nVol} buscan voluntarios`;
      elVol.removeAttribute('aria-hidden');
    } else {
      elVol.textContent = '';
      elVol.setAttribute('aria-hidden', 'true');
    }
  }
}

function updateExplorerStats() {
  const filtered = getFilteredProjectFeatures();
  updatePillarMetrics(filtered);
  const nEl = document.getElementById('explorer-visible-count');
  if (nEl) nEl.textContent = String(filtered.length);

  const counts = {
    'Ecosistemas Resilientes': 0,
    'Innovación Catalítica': 0,
    'Despertar Planetario': 0,
  };
  filtered.forEach((f) => {
    const s = f.properties.sector;
    if (counts[s] !== undefined) counts[s] += 1;
  });
  const total = filtered.length || 1;
  const box = document.getElementById('sector-distribution');
  if (!box) return;

  box.innerHTML = SECTOR_ROWS.map((row) => {
    const n = counts[row.key];
    const pct = Math.round((n / total) * 100);
    return `<div class="sector-bar-row" role="listitem">
      <div class="sector-bar-row__head">
        <span class="sector-bar-row__label">${row.label}</span>
        <span class="sector-bar-row__n">${n}</span>
      </div>
      <div class="sector-bar-row__track" aria-hidden="true">
        <div class="sector-bar-row__fill" style="width:${pct}%;background:${row.color}"></div>
      </div>
    </div>`;
  }).join('');
}

function applyFilters() {
  applyMapProjectFilter();
  updateExplorerStats();
}

function initPillarTiles() {
  document.querySelectorAll('.pillar-tile[data-pillar]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pillar = btn.dataset.pillar;
      const need = document.getElementById('filter-necesidad');
      if (pillar === 'financiamiento' && need) {
        need.value = 'Financiamiento';
        applyFilters();
      } else if (pillar === 'networking' && need) {
        need.value = 'Aliados';
        applyFilters();
      } else if (pillar === 'traccion') {
        clearFilters();
        document.getElementById('explorer-sector-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
}

function clearFilters() {
  document.getElementById('filter-sector').value = 'all';
  document.getElementById('filter-tipo-org').value = 'all';
  document.getElementById('filter-necesidad').value = 'all';
  applyMapProjectFilter();
  updateExplorerStats();
}

/* ---------------------- Actor context, intents, territorio ---------------------- */

function initExplorerRoleContext() {
  const a = getCurrentActor();
  const lbl = document.getElementById('explorer-role-label');
  if (lbl) {
    lbl.textContent = ACTOR_LABELS_ES[a] || a;
  }
  const purpose = document.getElementById('explorer-purpose');
  if (purpose) {
    purpose.innerHTML = EXPLORER_PURPOSE_BY_ACTOR[a] || EXPLORER_PURPOSE_BY_ACTOR.visitante;
  }
  const block = document.getElementById('explorer-territory-block');
  if (block) {
    const show = a === 'empresa' || a === 'fondo-inversion';
    block.classList.toggle('hidden', !show);
    block.setAttribute('aria-hidden', show ? 'false' : 'true');
  }
}

function initExplorerOperatingStates() {
  const data = toggleLayerCache['proyectos-mpc'];
  const box = document.getElementById('operating-states-list');
  if (!data?.features || !box) return;
  const set = new Set();
  data.features.forEach((f) => {
    if (f.properties.estado) set.add(f.properties.estado);
  });
  const sorted = [...set].sort((a, b) => a.localeCompare(b, 'es'));
  const saved = getOperatingStates();
  box.innerHTML = sorted
    .map((est, i) => {
      const id = `op-state-${i}`;
      const checked = saved.includes(est) ? 'checked' : '';
      return `<label for="${id}"><input type="checkbox" id="${id}" value="${est.replace(/"/g, '&quot;')}" ${checked} /> ${est}</label>`;
    })
    .join('');
  box.querySelectorAll('input[type="checkbox"]').forEach((inp) => {
    inp.addEventListener('change', () => {
      const selected = [...box.querySelectorAll('input[type="checkbox"]:checked')].map((el) => el.value);
      saveOperatingStates(selected);
      applyFilters();
    });
  });
  const clearBtn = document.getElementById('operating-states-clear');
  if (clearBtn && !clearBtn.dataset.mpcBound) {
    clearBtn.dataset.mpcBound = '1';
    clearBtn.addEventListener('click', () => {
      saveOperatingStates([]);
      box.querySelectorAll('input[type="checkbox"]').forEach((el) => { el.checked = false; });
      applyFilters();
    });
  }
}

function getIntentsList() {
  try {
    const raw = localStorage.getItem(MPC_INTENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveIntentsList(list) {
  localStorage.setItem(MPC_INTENTS_KEY, JSON.stringify(list));
}

function findIntentForProject(projectId) {
  const id = String(projectId);
  return getIntentsList()
    .filter((x) => String(x.projectId) === id)
    .sort((a, b) => b.ts - a.ts)[0];
}

function intentTypeForActor(actor) {
  if (actor === 'academia') return 'colaboracion';
  if (actor === 'empresa' || actor === 'fondo-inversion' || actor === 'administrador') return 'financiamiento';
  return 'conexion';
}

function primaryCtaLabelForActor(actor) {
  if (actor === 'visitante') return 'Crear cuenta para conectar (info)';
  if (actor === 'empresa' || actor === 'fondo-inversion' || actor === 'administrador') {
    return 'Manifestar interés de financiamiento (demo)';
  }
  if (actor === 'academia') return 'Solicitar colaboración o datos (demo)';
  if (actor === 'desarrollador') return 'Proponer colaboración en estudios u implementación (demo)';
  return 'Conectar con el proyecto (demo)';
}

function refreshDetailCtas() {
  const panel = document.getElementById('detail-panel');
  const primary = document.getElementById('detail-primary-cta');
  const banner = document.getElementById('detail-intent-banner');
  const pid = panel?.dataset.projectId;
  if (!primary || !panel) return;
  if (panel.dataset.detailKind === 'carbono') {
    banner?.classList.add('hidden');
    return;
  }
  if (panel.dataset.detailKind === 'predio') {
    banner?.classList.add('hidden');
    return;
  }
  if (!pid) {
    banner?.classList.add('hidden');
    return;
  }

  const actor = getCurrentActor();
  const existing = findIntentForProject(pid);

  if (existing) {
    const tipo = existing.intentType === 'financiamiento'
      ? 'interés de financiamiento'
      : existing.intentType === 'colaboracion'
        ? 'solicitud de colaboración'
        : 'conexión';
    if (banner) {
      banner.textContent = `Listo: registramos tu ${tipo} (demo, solo este navegador).`;
      banner.classList.remove('hidden');
    }
    primary.disabled = true;
    primary.textContent = 'Interés registrado (demo)';
  } else {
    banner?.classList.add('hidden');
    primary.disabled = false;
    primary.textContent = primaryCtaLabelForActor(actor);
  }
}

function recordIntent(projectId, intentType) {
  const list = getIntentsList();
  const actor = getCurrentActor();
  list.push({ projectId: String(projectId), actor, intentType, ts: Date.now() });
  saveIntentsList(list);
  refreshDetailCtas();
}

function initDetailPanelIntent() {
  const primary = document.getElementById('detail-primary-cta');
  if (!primary || primary.dataset.mpcBound) return;
  primary.dataset.mpcBound = '1';
  primary.addEventListener('click', () => {
    const dp = document.getElementById('detail-panel');
    if (dp?.dataset.detailKind === 'carbono' || dp?.dataset.detailKind === 'predio') return;
    const pid = dp.dataset.projectId;
    if (!pid) return;
    const actor = getCurrentActor();
    if (actor === 'visitante') {
      window.alert('En producción aquí iniciarías sesión o crearías cuenta. Puedes elegir otro rol al recargar (demo).');
      return;
    }
    if (findIntentForProject(pid)) return;
    recordIntent(pid, intentTypeForActor(actor));
  });
}

function parseKmlFirstCoordinate(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
  const coordsEl = doc.querySelector('coordinates');
  if (!coordsEl || !coordsEl.textContent) return null;
  const parts = coordsEl.textContent.trim().split(/[\s,]+/).filter(Boolean);
  const lng = parseFloat(parts[0]);
  const lat = parseFloat(parts[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  return [lng, lat];
}

function showKmlPreview(lng, lat) {
  if (!map.getSource('register-kml-preview')) {
    map.addSource('register-kml-preview', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({
      id: 'register-kml-preview-circle',
      type: 'circle',
      source: 'register-kml-preview',
      paint: {
        'circle-radius': 11,
        'circle-color': '#ffffff',
        'circle-opacity': 0.45,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });
  }
  map.getSource('register-kml-preview').setData({
    type: 'FeatureCollection',
    features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: {} }],
  });
  map.flyTo({ center: [lng, lat], zoom: 8, duration: 1400 });
}

function initRegisterProjectModal() {
  const modal = document.getElementById('register-project-modal');
  if (modal?.dataset.mpcInit) return;
  if (modal) modal.dataset.mpcInit = '1';
  const openBtn = document.getElementById('open-register-project');
  const closeBtn = document.getElementById('register-project-close');
  const backdrop = document.getElementById('register-project-backdrop');
  const form = document.getElementById('register-project-form');
  const fileInput = document.getElementById('reg-kml');
  const statusEl = document.getElementById('register-kml-status');

  function open() {
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
  function close() {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  openBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);

  const MAX_KML_BYTES = 8 * 1024 * 1024;

  fileInput?.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    if (!f || !statusEl) return;
    if (f.size > MAX_KML_BYTES) {
      statusEl.textContent = 'Archivo demasiado grande (máximo 8 MB en demo).';
      return;
    }
    if (f.name.toLowerCase().endsWith('.kmz')) {
      statusEl.textContent = 'KMZ: en producción se descomprime en servidor. Para vista previa en demo usa un archivo .kml exportado.';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const coord = parseKmlFirstCoordinate(text);
      if (coord) {
        statusEl.textContent = `Vista previa: ${coord[1].toFixed(4)}, ${coord[0].toFixed(4)} (WGS84)`;
        showKmlPreview(coord[0], coord[1]);
      } else {
        statusEl.textContent = 'No se encontraron coordenadas en el KML.';
      }
    };
    reader.readAsText(f);
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('reg-nombre')?.value?.trim();
    const org = document.getElementById('reg-org')?.value?.trim();
    const sector = document.getElementById('reg-sector')?.value;
    const necesidad = document.getElementById('reg-necesidad')?.value;
    const draft = { nombre, organizacion: org, sector, necesidad, ts: Date.now() };
    try {
      const raw = localStorage.getItem(MPC_DRAFT_PROJECTS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(draft);
      localStorage.setItem(MPC_DRAFT_PROJECTS_KEY, JSON.stringify(arr));
    } catch (_) {}
    close();
    window.alert('Borrador guardado solo en este navegador. Próximo paso: API + validación.');
    form.reset();
    if (statusEl) statusEl.textContent = '';
  });
}

/* ---------------------- Legend ---------------------- */

function updateLegend() {
  const legend = document.getElementById('dynamic-legend');
  if (!legend) return;

  let html = '<ul class="legend-list">';

  const sectorItems = [
    { label: 'Ecosistemas Resilientes', color: '#c4c4c4' },
    { label: 'Innovación Catalítica', color: '#8c8c8c' },
    { label: 'Despertar Planetario', color: '#5a5a5a' },
  ];
  sectorItems.forEach(s => {
    html += `<li><span class="legend-dot" style="background:${s.color};"></span><span class="legend-label">${s.label}</span></li>`;
  });

  const carbonIn = document.querySelector('input[data-toggle-layer="proyectos-carbono"]');
  if (carbonIn?.checked) {
    html += '<li><span class="legend-dot" style="background:#26C6DA;border:1px solid rgba(255,255,255,0.2);"></span><span class="legend-label">Carbono CAR</span></li>';
    html += '<li><span class="legend-dot" style="background:#B388FF;border:1px solid rgba(255,255,255,0.2);"></span><span class="legend-label">Carbono VCS</span></li>';
  }

  getAllToggleLayers().forEach(ld => {
    if (ld.id === 'proyectos-mpc' || ld.id === 'proyectos-carbono') return;
    const input = document.querySelector(`input[data-toggle-layer="${ld.id}"]`);
    if (input?.checked) {
      const colorMap = {
        'color-zonas-desatendidas': '#9a9a9a',
        'color-anp': '#b0b0b0',
        'color-restauracion': '#989898',
        'color-hidrografia': '#7a7a7a',
        'color-ejidos': '#868686',
        'color-indigenas': '#6e6e6e',
        'color-subcuencas': '#787878',
        'color-acuiferos': '#828282',
        'color-carbono': '#a2a2a2',
        'color-ramsar': '#767676',
        'color-vegetacion': '#8e8e8e',
        'color-riesgo': '#666666',
      };
      const c = colorMap[ld.color] || '#909090';
      html += `<li><span class="legend-color" style="background:${c}; border-color:${c};"></span><span class="legend-label">${ld.label}</span></li>`;
    }
  });

  const zonaInput = document.querySelector('input[data-toggle-layer="zonas-desatendidas"]');
  if (zonaInput?.checked) {
    html += '</ul><div class="legend-subtitle">Score de desatención</div><ul class="legend-list legend-list--nested">';
    [
      { label: 'Moderado (0.5-0.7)', color: '#b8b8b8' },
      { label: 'Alto (0.7-0.85)', color: '#888888' },
      { label: 'Crítico (0.85-1.0)', color: '#585858' },
    ].forEach(c => {
      html += `<li><span class="legend-color" style="background:${c.color}; border-color:${c.color};"></span><span class="legend-label">${c.label}</span></li>`;
    });
  }

  html += '</ul>';
  legend.innerHTML = html;
}

/* ---------------------- Opacity ---------------------- */

function initOpacity() {
  const slider = document.getElementById('opacity-range');
  const badge = document.getElementById('opacity-value');
  if (!slider) return;

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value) / 100;
    badge.textContent = `${slider.value}%`;

    getAllToggleLayers().forEach(ld => {
      const fid = `toggle-fill-${ld.id}`;
      const cid = `toggle-circle-${ld.id}`;
      if (map.getLayer(fid)) map.setPaintProperty(fid, 'fill-opacity', val * 0.45);
      if (map.getLayer(cid)) map.setPaintProperty(cid, 'circle-opacity', val);
    });
  });
}

/* ---------------------- Basemap ---------------------- */

function initBasemap() {
  const select = document.getElementById('basemap-select');
  if (!select) return;

  select.addEventListener('change', () => {
    const style = BASE_MAP_STYLES[select.value];
    if (!style) return;
    map.setStyle(style);
    map.once('style.load', () => {
      addBaseLayers();
      getAllToggleLayers().forEach(ld => {
        const input = document.querySelector(`input[data-toggle-layer="${ld.id}"]`);
        if (input?.checked && toggleLayerCache[ld.id]) {
          const srcId = `toggle-src-${ld.id}`;
          if (!map.getSource(srcId)) map.addSource(srcId, { type: 'geojson', data: toggleLayerCache[ld.id] });
          addToggleLayerToMap(ld);
        }
      });
    });
  });
}

/* ---------------------- Terrain ---------------------- */

function initTerrain() {
  const slider = document.getElementById('z-range');
  const badge = document.getElementById('z-value');
  if (!slider) return;

  function applyZ(val) {
    currentZ = Math.max(Z_MIN, Math.min(Z_MAX, val));
    slider.value = currentZ;
    badge.textContent = `${currentZ.toFixed(1)}×`;
    localStorage.setItem(Z_KEY, currentZ);
    try { map.setTerrain({ source: 'mapbox-dem', exaggeration: currentZ }); } catch (_) {}
  }

  slider.value = currentZ;
  badge.textContent = `${currentZ.toFixed(1)}×`;
  slider.addEventListener('input', () => applyZ(parseFloat(slider.value)));

  document.getElementById('z-dec')?.addEventListener('click', () => applyZ(currentZ - Z_STEP));
  document.getElementById('z-inc')?.addEventListener('click', () => applyZ(currentZ + Z_STEP));
  document.getElementById('z-reset')?.addEventListener('click', () => applyZ(1.2));

  document.getElementById('camera-reset')?.addEventListener('click', () => {
    map.flyTo({ center: MX_CENTER, zoom: MX_ZOOM, pitch: 25, bearing: 0, duration: 1200 });
  });
}

/* ---------------------- Collapsible Categories ---------------------- */

function initCollapsible() {
  document.querySelectorAll('.cat-header').forEach(header => {
    const toggle = () => {
      const catId = header.dataset.category;
      const content = document.getElementById(catId);
      if (!content) return;
      const open = content.classList.toggle('is-open');
      header.classList.toggle('is-open', open);
      header.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    header.setAttribute('aria-expanded', header.classList.contains('is-open') ? 'true' : 'false');
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

/* ---------------------- Sidebar panel (mobile + desktop) ---------------------- */

function isMobileViewport() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function syncFabAria(fab, sidebar) {
  if (!fab || !sidebar) return;
  let expanded;
  if (isMobileViewport()) {
    expanded = sidebar.classList.contains('is-mobile-open');
  } else {
    expanded = !sidebar.classList.contains('is-desktop-collapsed');
  }
  fab.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

function isSidebarPanelOpen(sidebar) {
  if (isMobileViewport()) {
    return sidebar.classList.contains('is-mobile-open');
  }
  return !sidebar.classList.contains('is-desktop-collapsed');
}

function flyMapToMexico() {
  map.flyTo({
    center: MX_CENTER,
    zoom: MX_ZOOM,
    pitch: 25,
    bearing: 0,
    duration: 2600,
    essential: true,
  });
}

function initSidebarPanelToggle() {
  const fab = document.getElementById('sidebar-fab');
  const sidebar = document.getElementById('sidebar');
  if (!fab || !sidebar) return;

  function toggle() {
    const wasOpen = isSidebarPanelOpen(sidebar);
    if (isMobileViewport()) {
      sidebar.classList.toggle('is-mobile-open');
    } else {
      sidebar.classList.toggle('is-desktop-collapsed');
    }
    const nowOpen = isSidebarPanelOpen(sidebar);
    if (nowOpen && !wasOpen) {
      try { map.resize(); } catch (_) {}
      requestAnimationFrame(() => {
        try { flyMapToMexico(); } catch (_) {}
      });
    }
    syncFabAria(fab, sidebar);
  }

  fab.addEventListener('click', toggle);

  window.addEventListener('resize', () => {
    if (isMobileViewport()) {
      sidebar.classList.remove('is-desktop-collapsed');
    } else {
      sidebar.classList.remove('is-mobile-open');
    }
    syncFabAria(fab, sidebar);
  });

  map.on('click', () => {
    if (isMobileViewport()) {
      sidebar.classList.remove('is-mobile-open');
      syncFabAria(fab, sidebar);
    }
  });

  syncFabAria(fab, sidebar);
}

function initPredioDemoFocusButton() {
  const btn = document.getElementById('predio-demo-focus-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    focusPredioDemoBoundary().catch(() => {});
  });
}

async function focusPredioDemoBoundary() {
  if (!PREDIO_MODE) return;
  const aoiDef = PREDIO_DEMO_LAYERS.find((x) => x.id === 'predio-aoi');
  for (const ld of PREDIO_DEMO_LAYERS) {
    if (ld.id === 'predio-aoi') continue;
    showToggleLayers(ld, false);
    const input = document.querySelector(`input[data-toggle-layer="${ld.id}"]`);
    if (input) input.checked = false;
  }
  if (aoiDef) {
    if (!toggleLayerCache['predio-aoi']) {
      await addToggleLayerToMap(aoiDef);
    } else {
      showToggleLayers(aoiDef, true);
    }
    const inputAoi = document.querySelector('input[data-toggle-layer="predio-aoi"]');
    if (inputAoi) inputAoi.checked = true;
    const geo = toggleLayerCache['predio-aoi'];
    if (geo?.features?.length) {
      try {
        const bbox = turf.bbox(geo);
        map.fitBounds(
          [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
          { padding: { top: 90, bottom: 90, left: 90, right: 110 }, duration: 1200, maxZoom: 12 }
        );
      } catch (_) {}
    }
  }
  updateLegend();
}

/* ---------------------- Splash ---------------------- */

function initSplash() {
  const splash = document.getElementById('splash');
  const btn = document.getElementById('splash-enter');
  if (!splash || !btn) return;
  btn.addEventListener('click', () => {
    splash.classList.add('is-hidden');
    tryHideMpcMapLoading();
  });
}

function initActorSelect() {
  const screen = document.getElementById('actor-select');
  if (!screen) return;
  screen.querySelectorAll('[data-actor]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const role = btn.dataset.actor;
      if (role) {
        try { sessionStorage.setItem(MPC_ACTOR_KEY, role); } catch (_) {}
      }
      initExplorerRoleContext();
      refreshDetailCtas();

      if (typeof initDashboard === 'function') {
        await initDashboard();
        if (typeof dashShowDashboard === 'function') dashShowDashboard();
        screen.classList.add('is-hidden');
        screen.setAttribute('aria-hidden', 'true');
      } else {
        screen.classList.add('is-hidden');
        screen.setAttribute('aria-hidden', 'true');
        tryHideMpcMapLoading();
      }
    });
  });
}

function openMpcProjectDetail(projectId) {
  const cache = toggleLayerCache['proyectos-mpc'];
  if (!cache) return;
  const features = cache.data?.features || cache.features || [];
  const feat = features.find(f => f.properties && String(f.properties.id) === String(projectId));
  if (feat) {
    fillMpcDetailPanel(feat.properties);
    document.getElementById('detail-panel')?.classList.remove('hidden');
    document.getElementById('zona-panel')?.classList.add('hidden');
  }
}
// Expose for Swipe Deck
window.openMpcDetail = openMpcProjectDetail;

/* ---------------------- Panels ---------------------- */

function initPanels() {
  document.getElementById('close-detail')?.addEventListener('click', () => {
    document.getElementById('detail-panel').classList.add('hidden');
  });
  document.getElementById('close-zona')?.addEventListener('click', () => {
    document.getElementById('zona-panel').classList.add('hidden');
  });
  document.getElementById('alert-dismiss')?.addEventListener('click', () => {
    document.getElementById('alert-overlay').classList.add('hidden');
  });
}

/* ---------------------- Search ---------------------- */

function initFocusMapSearch() {
  const btn = document.getElementById('focus-map-search');
  const input = document.getElementById('search-input');
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    input.focus();
    try { input.select(); } catch (_) {}
  });
}

function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const q = input.value.toLowerCase().trim();
    if (!q) return;

    const matchMpc = toggleLayerCache['proyectos-mpc']?.features?.find((f) => {
      const p = f.properties;
      return (p.nombre || '').toLowerCase().includes(q)
        || (p.organizacion || '').toLowerCase().includes(q)
        || (p.estado || '').toLowerCase().includes(q)
        || (p.municipio || '').toLowerCase().includes(q);
    });

    const matchCar = toggleLayerCache['proyectos-carbono']?.features?.find((f) => {
      const p = f.properties;
      return (p.nombre || '').toLowerCase().includes(q)
        || (p.organizacion || '').toLowerCase().includes(q)
        || (p.estado || '').toLowerCase().includes(q)
        || (p.subsector || '').toLowerCase().includes(q)
        || (p.carbon_program || '').toLowerCase().includes(q);
    });

    const match = matchMpc || matchCar;
    if (!match) return;

    const coords = match.geometry.type === 'Point'
      ? match.geometry.coordinates
      : (match.geometry.coordinates?.[0]?.[0] || [MX_CENTER[0], MX_CENTER[1]]);
    map.flyTo({ center: coords, zoom: 10, duration: 1200 });
    setTimeout(() => {
      if (match.properties?.detail_kind === 'carbono') {
        handleCarbonProjectClick({ features: [match] });
      } else {
        handleProjectClick({ features: [match] });
      }
    }, 1300);
  });
}

/* ---------------------- Alert System ---------------------- */

function checkVisibleZonas() {
  const zonaInput = document.querySelector('input[data-toggle-layer="zonas-desatendidas"]');
  if (!zonaInput?.checked) return;

  const bounds = map.getBounds();
  const data = toggleLayerCache['zonas-desatendidas'];
  if (!data?.features) return;

  const visible = data.features.filter(f => {
    try {
      const center = turf.centroid(f);
      const [lng, lat] = center.geometry.coordinates;
      return bounds.contains([lng, lat]);
    } catch (_) { return false; }
  });

  const critical = visible.filter(f => f.properties.score >= 0.85);
  if (critical.length > 0) {
    document.getElementById('alert-title').textContent = `${critical.length} zona(s) crítica(s) detectada(s)`;
    document.getElementById('alert-body').textContent = critical.map(f => f.properties.nombre).join(', ');
    document.getElementById('alert-overlay').classList.remove('hidden');
  }
}

/* ---------------------- Chat asistente (consulta local) ---------------------- */

function appendChatMessage(text, role) {
  const box = document.getElementById('mpc-chat-messages');
  if (!box) return;
  const div = document.createElement('div');
  div.className = `mpc-chat-msg mpc-chat-msg--${role}`;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function buildMpcChatReply(q) {
  const raw = q.trim();
  const t = raw.toLowerCase();
  if (!t) return 'Escribe una pregunta o parte del nombre de un proyecto.';

  if (/^(hola|buen|hey|qué\s+h|que\s+h|ayuda|help)\b/.test(t) || t === 'hola' || t === 'buenos días' || t === 'buenas') {
    return 'Puedo orientarte sobre el atlas: usa la búsqueda superior, el panel izquierdo (círculo de colores) para filtros y capas, y haz clic en un punto para abrir la ficha. Prueba preguntar: “carbono”, “filtros” o un nombre de proyecto.';
  }

  if (/carbono|\bcar\b|vcs|verra/.test(t)) {
    return 'Los proyectos CAR y VCS aparecen como puntos turquesa y violeta. Activa la capa “Carbono CAR / VCS” en el panel y abre una ficha para ver el estándar y el enlace al registro público.';
  }

  if (/filtro|capa|panel|sidebar|aplicar|restablecer/.test(t)) {
    return 'En el panel lateral puedes filtrar por sector, tipo de organización y necesidad. Los pilares Financiamiento / Networking aplican filtros rápidos. Pulsa “Aplicar filtros” para actualizar el mapa.';
  }

  if (/territorio|estado|operaci[oó]n|inversionista|fondo|empresa/.test(t)) {
    return 'Con rol empresa o fondo puedes marcar estados de operación (demo) para ver proyectos en ese territorio. El contador muestra coincidencias con filtros + territorio.';
  }

  if (/financ|inter[eé]s|manifestar|conectar|demo/.test(t)) {
    return 'En fichas MPC puedes manifestar interés (demo en este navegador). En proyectos carbono usa “Abrir registro público” para ir al listado oficial.';
  }

  if (/herradura|aoi|pol[ií]gono\s+blanco/i.test(t)) {
    return 'El contorno blanco “La Herradura” es un AOI de referencia; combínalo con proyectos y capas para contexto territorial.';
  }

  const mpc = toggleLayerCache['proyectos-mpc'];
  const carb = toggleLayerCache['proyectos-carbono'];
  const all = [...(mpc?.features || []), ...(carb?.features || [])];
  const terms = raw.split(/\s+/).map((w) => w.toLowerCase()).filter((w) => w.length > 2);
  const hit = all.find((f) => {
    const p = f.properties;
    const hay = `${p.nombre || ''} ${p.organizacion || ''} ${p.estado || ''} ${p.subsector || ''}`.toLowerCase();
    if (hay.includes(t)) return true;
    return terms.some((term) => hay.includes(term));
  });
  if (hit) {
    const p = hit.properties;
    const tag = p.detail_kind === 'carbono'
      ? `Carbono ${p.carbon_program || ''}`
      : (p.sector || 'MPC');
    return `Hay un proyecto que coincide: “${p.nombre}” (${tag}). Búscalo en el mapa o escribe el nombre exacto en la barra superior para centrarlo.`;
  }

  return 'No encontré una coincidencia clara. Prueba un nombre de proyecto, estado o palabras como “carbono”, “filtros” o “territorio”.';
}

function initMpcChat() {
  const fab = document.getElementById('mpc-chat-fab');
  const panel = document.getElementById('mpc-chat-panel');
  const closeBtn = document.getElementById('mpc-chat-close');
  const form = document.getElementById('mpc-chat-form');
  const input = document.getElementById('mpc-chat-input');
  const widget = document.getElementById('mpc-chat-widget');
  if (!fab || !panel || !form || !input || !widget) return;

  let seeded = false;

  function openPanel() {
    panel.classList.remove('hidden');
    panel.setAttribute('aria-hidden', 'false');
    fab.setAttribute('aria-expanded', 'true');
    if (!seeded) {
      seeded = true;
      const box = document.getElementById('mpc-chat-messages');
      if (box) box.innerHTML = '';
      appendChatMessage('Hola. Soy un asistente de consulta local (sin servidor). Pregúntame por proyectos, filtros, carbono o territorio.', 'bot');
    }
    setTimeout(() => input.focus(), 80);
  }

  function closePanel() {
    panel.classList.add('hidden');
    panel.setAttribute('aria-hidden', 'true');
    fab.setAttribute('aria-expanded', 'false');
  }

  fab.addEventListener('click', () => {
    if (panel.classList.contains('hidden')) openPanel();
    else closePanel();
  });
  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closePanel();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    appendChatMessage(q, 'user');
    input.value = '';
    const reply = buildMpcChatReply(q);
    window.setTimeout(() => appendChatMessage(reply, 'bot'), 300);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.classList.contains('hidden')) closePanel();
  });
}

/* ---------------------- Red de vínculos (force graph 2D, MPC demo) ---------------------- */

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(s);
  });
}

const FORCE_GRAPH_SCRIPT_URLS = [
  () => new URL('vendor/force-graph.min.js', window.location.href).href,
  'https://unpkg.com/force-graph@1.51.2/dist/force-graph.min.js',
  'https://cdn.jsdelivr.net/npm/force-graph@1.51.2/dist/force-graph.min.js',
];

function ensureMpcNetworkLibs() {
  if (typeof window.ForceGraph === 'function') return Promise.resolve();
  if (!mpcNetworkForceGraphPromise) {
    mpcNetworkForceGraphPromise = (async () => {
      let lastErr;
      for (const entry of FORCE_GRAPH_SCRIPT_URLS) {
        const src = typeof entry === 'function' ? entry() : entry;
        try {
          await loadScriptOnce(src);
          if (typeof window.ForceGraph === 'function') return;
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr || new Error('ForceGraph no disponible');
    })();
  }
  return mpcNetworkForceGraphPromise;
}

async function loadMpcNetworkJson() {
  if (mpcNetworkJsonCache) return mpcNetworkJsonCache;
  try {
    const res = await fetch(new URL(MPC_NETWORK_DATA_URL, window.location.href));
    if (!res.ok) throw new Error(`Red demo: HTTP ${res.status}`);
    mpcNetworkJsonCache = await res.json();
  } catch (_) {
    mpcNetworkJsonCache = JSON.parse(JSON.stringify(MPC_NETWORK_JSON_FALLBACK));
  }
  return mpcNetworkJsonCache;
}

function inferNeighborLinks(focusId, features, maxN) {
  const focus = features.find((f) => Number(f.properties.id) === focusId);
  if (!focus) return [];
  const est = focus.properties.estado;
  return features
    .filter((f) => Number(f.properties.id) !== focusId && f.properties.estado === est)
    .slice(0, maxN)
    .map((f) => ({
      source: focusId,
      target: Number(f.properties.id),
      role: 'inferred',
      label: 'Misma entidad (inferido, demo)',
    }));
}

function dedupeLinkKey(s, t, role) {
  const a = Math.min(s, t);
  const b = Math.max(s, t);
  return `${a}|${b}|${role || ''}`;
}

async function buildMpcNetworkGraphData(focusProjectId) {
  let focusId = Number(focusProjectId);
  if (!Number.isFinite(focusId)) focusId = 1;
  const raw = await loadMpcNetworkJson();
  const features = toggleLayerCache['proyectos-mpc']?.features || [];
  const idToFeature = new Map();
  features.forEach((f) => {
    const id = Number(f.properties.id);
    if (!Number.isNaN(id)) idToFeature.set(id, f);
  });

  const linkKeys = new Set();
  const rawLinks = [];

  function pushLink(L) {
    const s = Number(L.source);
    const t = Number(L.target);
    const k = dedupeLinkKey(s, t, L.role);
    if (linkKeys.has(k)) return;
    linkKeys.add(k);
    rawLinks.push({ source: s, target: t, role: L.role || 'sociedad-civil', label: L.label || '' });
  }

  for (const L of raw.links || []) {
    const s = Number(L.source);
    const t = Number(L.target);
    if (s === focusId || t === focusId) pushLink(L);
  }

  const idSet = new Set([focusId]);
  rawLinks.forEach((l) => { idSet.add(l.source); idSet.add(l.target); });

  for (const L of raw.links || []) {
    const s = Number(L.source);
    const t = Number(L.target);
    if (idSet.has(s) && idSet.has(t)) pushLink(L);
  }

  if (rawLinks.length === 0) {
    inferNeighborLinks(focusId, features, 8).forEach((L) => pushLink(L));
  }

  const projectIdSet = new Set([focusId]);
  rawLinks.forEach((l) => { projectIdSet.add(l.source); projectIdSet.add(l.target); });

  let projectIds = [...projectIdSet].filter((id) => idToFeature.has(id));
  if (!projectIds.includes(focusId) && idToFeature.has(focusId)) projectIds.push(focusId);
  if (projectIds.length === 0 && idToFeature.has(focusId)) projectIds = [focusId];

  if (projectIds.length > MPC_NETWORK_MAX_NODES) {
    const rest = projectIds.filter((id) => id !== focusId);
    projectIds = [focusId, ...rest.slice(0, MPC_NETWORK_MAX_NODES - 1)];
  }

  const validProjects = new Set(projectIds);
  const validRawLinks = rawLinks.filter((l) => validProjects.has(l.source) && validProjects.has(l.target));

  const projectNodes = projectIds.map((id) => {
    const f = idToFeature.get(id);
    const p = f?.properties || {};
    const fullName = p.nombre || `Proyecto ${id}`;
    return {
      id,
      name: fullName.length > 38 ? fullName.slice(0, 36) + '…' : fullName,
      org: p.organizacion || '',
      tipoOrg: p.tipo_org || '',
      sector: p.sector || '',
      estado: p.estado || '',
      isFocus: id === focusId,
      nodeType: 'project',
    };
  });

  const actorNodes = [];
  const graphLinks = [];
  let actorSeq = 10000;

  for (const L of validRawLinks) {
    const actorId = actorSeq++;
    const roleLabel = NETWORK_ROLE_LABELS[L.role] || L.role;
    actorNodes.push({
      id: actorId,
      name: L.label || roleLabel,
      role: L.role,
      nodeType: 'actor',
      connectsProjects: [L.source, L.target],
    });
    graphLinks.push({ source: L.source, target: actorId, role: L.role });
    graphLinks.push({ source: actorId, target: L.target, role: L.role });
  }

  let nodes = [...projectNodes, ...actorNodes];

  if (projectNodes.length === 0) {
    const fallbackF = idToFeature.get(focusId);
    const pp = fallbackF?.properties || {};
    nodes = [{
      id: focusId,
      name: pp.nombre || `Proyecto ${focusId}`,
      org: pp.organizacion || '', tipoOrg: pp.tipo_org || '',
      sector: pp.sector || '', estado: pp.estado || '',
      isFocus: true, nodeType: 'project',
    }];
  }

  const nProjects = projectNodes.length || 1;
  const nActors = actorNodes.length;
  const meta = `${nProjects} proyectos · ${nActors} actores/vínculos (demo)`;
  return { nodes, links: nodes.length <= 1 ? [] : graphLinks, meta, rawLinks: validRawLinks };
}

function renderMpcNetworkLegend(rawLinks) {
  const el = document.getElementById('mpc-network-legend');
  if (!el) return;
  const roles = [...new Set(rawLinks.map((l) => l.role).filter(Boolean))];
  roles.sort((a, b) => String(a).localeCompare(String(b), 'es'));

  const shapeKeys = `<span class="mpc-network-legend__item"><span class="mpc-network-legend__swatch" style="background:#c8d2dc;border-radius:50%"></span>Proyecto</span>`
    + `<span class="mpc-network-legend__item"><span class="mpc-network-legend__swatch" style="background:#6B7280;border-radius:1px;transform:rotate(45deg)"></span>Actor</span>`
    + `<span style="color:rgba(255,255,255,0.18);margin:0 0.2rem">|</span>`;

  el.innerHTML = shapeKeys + roles.map((role) => {
    const label = NETWORK_ROLE_LABELS[role] || role;
    const color = NETWORK_ROLE_COLORS[role] || '#94a3b8';
    return `<span class="mpc-network-legend__item"><span class="mpc-network-legend__swatch" style="background:${color}"></span>${label}</span>`;
  }).join('');

  const classEl = document.getElementById('mpc-network-classification');
  if (!classEl) return;
  if (roles.length === 0) { classEl.textContent = ''; return; }
  const categories = [...new Set(roles.map((r) => NETWORK_ROLE_CATEGORY[r] || r))];
  categories.sort((a, b) => a.localeCompare(b, 'es'));
  classEl.textContent = `Vínculos en esta vista: ${categories.join(', ')}.`;
}

function populateNetworkDash(nodes, rawLinks) {
  const focusNode = nodes.find((n) => n.isFocus) || nodes.find((n) => n.nodeType === 'project');
  const projectNodes = nodes.filter((n) => n.nodeType === 'project');
  const nodeMap = new Map(projectNodes.map((n) => [n.id, n]));

  const focusBody = document.getElementById('net-dash-focus-body');
  if (focusBody && focusNode) {
    focusBody.innerHTML = renderDashNodeCard(focusNode, true);
  }

  const linksBody = document.getElementById('net-dash-links-body');
  if (!linksBody) return;
  if (rawLinks.length === 0) {
    linksBody.innerHTML = '<p class="net-dash__text net-dash__text--dim">Sin vínculos en esta subred.</p>';
    return;
  }

  linksBody.innerHTML = rawLinks.map((l) => {
    const sName = nodeMap.get(l.source)?.name || `#${l.source}`;
    const tName = nodeMap.get(l.target)?.name || `#${l.target}`;
    const roleLabel = NETWORK_ROLE_LABELS[l.role] || l.role || '';
    const catLabel = NETWORK_ROLE_CATEGORY[l.role] || roleLabel;
    const color = NETWORK_ROLE_COLORS[l.role] || '#94a3b8';
    return `<div class="net-dash__link-card">
      <p class="net-dash__link-role" style="color:${color}">◆ ${roleLabel}</p>
      ${l.label ? `<p class="net-dash__link-motivo">"${l.label}"</p>` : ''}
      <p class="net-dash__link-pair">${sName} ↔ ${tName}</p>
      <p class="net-dash__link-why">Categoría: ${catLabel}</p>
    </div>`;
  }).join('');
}

function renderDashNodeCard(node, isCurrent) {
  if (!node) return '';
  if (node.nodeType === 'actor') {
    const color = NETWORK_ROLE_COLORS[node.role] || '#94a3b8';
    const roleLabel = NETWORK_ROLE_LABELS[node.role] || node.role || '';
    return `
      <p class="net-dash__focus-name" style="color:${color}">◆ ${node.name}</p>
      <p class="net-dash__focus-detail">Actor: ${roleLabel}</p>
      <p class="net-dash__focus-detail" style="margin-top:2px">Sin ubicación geográfica — conecta proyectos en el grafo.</p>
    `;
  }
  return `
    <p class="net-dash__focus-name">${isCurrent && node.isFocus ? '● ' : ''}${node.name}</p>
    ${node.org ? `<p class="net-dash__focus-org">${node.org}</p>` : ''}
    <p class="net-dash__focus-detail">${[node.tipoOrg, node.sector, node.estado].filter(Boolean).join(' · ')}</p>
  `;
}

function highlightNetworkDashNode(hoveredNode, allNodes) {
  const focusBody = document.getElementById('net-dash-focus-body');
  if (!focusBody) return;
  const node = hoveredNode || allNodes?.find((n) => n.isFocus) || null;
  if (!node) return;
  const heading = document.querySelector('#net-dash-focus h4');
  if (heading) heading.textContent = node.nodeType === 'actor' ? 'Actor / conector' : 'Proyecto seleccionado';
  focusBody.innerHTML = renderDashNodeCard(node, !hoveredNode);
}

function resizeMpcNetworkGraph() {
  const el = document.getElementById('mpc-network-graph');
  if (!el || !mpcNetworkGraphInstance) return;
  const w = Math.max(el.clientWidth || el.offsetWidth, 280);
  const h = Math.max(el.clientHeight || el.offsetHeight, 280);
  mpcNetworkGraphInstance.width(w).height(h);
}

function closeMpcNetworkModal() {
  const modal = document.getElementById('mpc-network-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

async function openMpcNetworkModal(projectId) {
  const modal = document.getElementById('mpc-network-modal');
  const container = document.getElementById('mpc-network-graph');
  const metaEl = document.getElementById('mpc-network-meta');
  if (!modal || !container) return;

  metaEl.textContent = 'Cargando red…';
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  try {
    await ensureMpcNetworkLibs();
    const { nodes, links, meta, rawLinks } = await buildMpcNetworkGraphData(projectId);
    metaEl.textContent = meta;
    renderMpcNetworkLegend(rawLinks || []);

    syncMpcNetworkMapLayers(rawLinks || []);
    fitMapToMpcNetworkEndpoints(rawLinks || []);

    if (mpcNetworkGraphInstance && typeof mpcNetworkGraphInstance._destructor === 'function') {
      try { mpcNetworkGraphInstance._destructor(); } catch (_) {}
    }
    mpcNetworkGraphInstance = null;
    container.replaceChildren();

    await waitForMpcNetworkLayoutPaint();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const Graph = window.ForceGraph;
    const w = Math.max(container.clientWidth || container.offsetWidth, 300);
    const h = Math.max(container.clientHeight || container.offsetHeight, 320);

    const PR = 7;
    const PR_FOCUS = 10;
    const AR = 4.5;

    function drawDiamond(ctx, x, y, r, fill) {
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r, y);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }

    mpcNetworkGraphInstance = new Graph(container)
      .width(w).height(h)
      .backgroundColor('#0a0f16')
      .nodeId('id')
      .nodeCanvasObjectMode(() => 'replace')
      .nodeCanvasObject((node, ctx, globalScale) => {
        const isActor = node.nodeType === 'actor';
        const fontSize = Math.max(2.8, 10 / globalScale);

        if (isActor) {
          const color = NETWORK_ROLE_COLORS[node.role] || '#6B7280';
          drawDiamond(ctx, node.x, node.y, AR + 1, color);
          ctx.font = `500 ${fontSize * 0.88}px Inter, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          const label = node.name.length > 30 ? node.name.slice(0, 28) + '…' : node.name;
          ctx.fillText(label, node.x, node.y + AR + fontSize * 0.4);
        } else {
          const r = node.isFocus ? PR_FOCUS : PR;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = node.isFocus ? '#f1f5f9' : 'rgba(200,210,220,0.7)';
          ctx.fill();
          if (node.isFocus) {
            ctx.strokeStyle = '#1B7A44';
            ctx.lineWidth = 2.2;
            ctx.stroke();
          }
          ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = node.isFocus ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.72)';
          const pName = node.name.length > 26 ? node.name.slice(0, 24) + '…' : node.name;
          ctx.fillText(pName, node.x, node.y + r + fontSize * 0.35);
        }
      })
      .nodePointerAreaPaint((node, color, ctx) => {
        const r = node.nodeType === 'actor' ? AR + 5 : (node.isFocus ? PR_FOCUS : PR) + 5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      })
      .linkColor((l) => {
        const hex = NETWORK_ROLE_COLORS[l.role] || '#475569';
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},0.45)`;
      })
      .linkWidth(1.2)
      .linkDirectionalParticles(reduceMotion ? 0 : 1)
      .linkDirectionalParticleWidth(1.4)
      .linkDirectionalParticleColor((l) => NETWORK_ROLE_COLORS[l.role] || '#94a3b8')
      .cooldownTicks(reduceMotion ? 50 : 300)
      .onNodeHover((node) => {
        container.style.cursor = node ? 'pointer' : 'grab';
        highlightNetworkDashNode(node, nodes);
      });

    mpcNetworkGraphInstance.d3Force('link')?.distance((l) => {
      const src = typeof l.source === 'object' ? l.source : nodes.find((n) => n.id === l.source);
      return src?.nodeType === 'actor' ? 55 : 80;
    });
    mpcNetworkGraphInstance.d3Force('charge')?.strength((n) => n.nodeType === 'actor' ? -80 : -200);

    mpcNetworkGraphInstance.graphData({ nodes, links });
    populateNetworkDash(nodes, rawLinks || []);
    resizeMpcNetworkGraph();
    window.setTimeout(() => {
      resizeMpcNetworkGraph();
      try {
        mpcNetworkGraphInstance.zoomToFit(600, 40);
      } catch (_) {}
    }, 320);
  } catch (err) {
    console.error('[MPC Red] openMpcNetworkModal falló:', err, err?.stack);
    mpcNetworkForceGraphPromise = null;
    clearMpcNetworkMapLayers();
    metaEl.textContent = 'No se pudo cargar la red demo.';
    renderMpcNetworkLegend([]);
  }
}

function initMpcNetworkModal() {
  const modal = document.getElementById('mpc-network-modal');
  const backdrop = document.getElementById('mpc-network-backdrop');
  const closeBtn = document.getElementById('mpc-network-close');
  const openBtn = document.getElementById('detail-m2-btn');

  function onBackdrop(e) {
    if (e.target === backdrop) closeMpcNetworkModal();
  }

  backdrop?.addEventListener('click', onBackdrop);
  closeBtn?.addEventListener('click', closeMpcNetworkModal);

  openBtn?.addEventListener('click', () => {
    const dp = document.getElementById('detail-panel');
    if (!dp || dp.dataset.detailKind !== 'mpc') return;
    const pid = dp.dataset.projectId;
    if (!pid) return;
    openMpcNetworkModal(pid);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!modal || modal.classList.contains('hidden')) return;
    closeMpcNetworkModal();
  });

  window.addEventListener('resize', () => {
    if (!modal?.classList.contains('hidden')) resizeMpcNetworkGraph();
  });
}

/* ---------------------- Initialization ---------------------- */

initSplash();
initActorSelect();
initExplorerRoleContext();

map.on('load', async () => {
  addBaseLayers();

  const predioGroup = document.getElementById('predio-demo-layer-group');
  if (PREDIO_MODE) {
    predioGroup?.classList.remove('hidden');
    buildToggleControls('predio-demo-controls', PREDIO_DEMO_LAYERS);
  } else {
    predioGroup?.classList.add('hidden');
  }

  buildToggleControls('proyectos-controls', PROYECTOS_LAYERS);
  buildToggleControls('ambiental-controls', AMBIENTAL_LAYERS);
  buildToggleControls('vulnerabilidad-controls', VULNERABILIDAD_LAYERS);
  buildToggleControls('territorial-controls', TERRITORIAL_LAYERS);

  const mpcLayer = PROYECTOS_LAYERS.find(ld => ld.id === 'proyectos-mpc' && ld.defaultOn);
  if (mpcLayer) await addToggleLayerToMap(mpcLayer);
  const carbonLayer = PROYECTOS_LAYERS.find(ld => ld.id === 'proyectos-carbono' && ld.defaultOn);
  if (carbonLayer) await addToggleLayerToMap(carbonLayer);

  updateExplorerStats();
  initExplorerRoleContext();
  initExplorerOperatingStates();
  initDetailPanelIntent();
  initRegisterProjectModal();
  initMpcNetworkModal();

  initBasemap();
  initTerrain();
  initOpacity();
  initCollapsible();
  initSidebarPanelToggle();
  initPanels();
  initSearch();
  initFocusMapSearch();
  initPillarTiles();
  initMpcChat();

  document.getElementById('apply-filters')?.addEventListener('click', applyFilters);
  document.getElementById('clear-filters')?.addEventListener('click', clearFilters);

  updateLegend();

  map.on('moveend', () => {
    checkVisibleZonas();
  });

  mpcMapInitReady = true;
  tryHideMpcMapLoading();

  if (typeof dashSyncFiltersToMap === 'function') dashSyncFiltersToMap();

  if (PREDIO_MODE) {
    const predioData = await loadGeoJSON('predio_demo/aoi.geojson', 'predio-aoi-bbox');
    if (predioData?.features?.length) {
      try {
        const bbox = turf.bbox(predioData);
        map.fitBounds(
          [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
          { padding: { top: 90, bottom: 90, left: 90, right: 110 }, duration: 2000, maxZoom: 12 }
        );
      } catch (_) {}
    }
    for (const ld of PREDIO_DEMO_LAYERS.filter((x) => x.defaultOn)) {
      await addToggleLayerToMap(ld);
    }
    initPredioDemoFocusButton();
    updateLegend();
  } else {
    const otherLayers = PROYECTOS_LAYERS.filter(
      (ld) => ld.defaultOn && ld.id !== 'proyectos-mpc' && ld.id !== 'proyectos-carbono'
    );
    for (const ld of otherLayers) {
      await addToggleLayerToMap(ld);
    }
    await addLaHerraduraAoiLayer();
    updateLegend();
  }
});
