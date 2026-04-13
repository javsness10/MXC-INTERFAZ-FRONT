/* =========================================================================
   MPC Atlas · Dashboard de Inteligencia Territorial / Climática
   México por el Clima · Módulo 3 · D3.js + Vanilla JS
   ========================================================================= */

const DASH_DATA_URL = 'data/dashboard_demo.json';
const DASH_FILTERS_KEY = 'mpc-dashboard-filters';
const DASH_VIEW_KEY = 'mpc-current-view';

let _dashData = null;
let _dashFiltered = null;
let _countdownInterval = null;
let _currentCurrency = 'usd';
let _currentEnvTab = 'carbono';

/* ===================== UTILITIES ===================== */

function dashFmt(n, decimals) {
  if (n == null) return '0';
  if (n >= 1e9) return (n / 1e9).toFixed(decimals ?? 1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(decimals ?? 1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(decimals ?? 1) + 'K';
  return n.toLocaleString('es-MX');
}

function dashFmtCurrency(n, currency) {
  if (currency === 'mxn') return '$' + dashFmt(n) + ' MXN';
  return '$' + dashFmt(n) + ' USD';
}

function dashSafeQS(sel) { return document.querySelector(sel); }
function dashSafeQSA(sel) { return document.querySelectorAll(sel); }

function dashGetFilters() {
  try {
    const raw = sessionStorage.getItem(DASH_FILTERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) { return {}; }
}

function dashSaveFilters(f) {
  try { sessionStorage.setItem(DASH_FILTERS_KEY, JSON.stringify(f)); } catch (_) {}
}

function dashSetView(view) {
  try { sessionStorage.setItem(DASH_VIEW_KEY, view); } catch (_) {}
}

function dashGetView() {
  try { return sessionStorage.getItem(DASH_VIEW_KEY) || 'dashboard'; } catch (_) { return 'dashboard'; }
}

/* ===================== DATA LOADING ===================== */

async function dashLoadData() {
  try {
    const res = await fetch(DASH_DATA_URL);
    if (!res.ok) throw new Error(res.status);
    _dashData = await res.json();
  } catch (e) {
    console.warn('Dashboard: no se pudo cargar datos', e);
    _dashData = null;
  }
  return _dashData;
}

/* ===================== FILTER ENGINE ===================== */

function dashApplyFilters() {
  if (!_dashData) return;

  const ubicacion = dashSafeQS('#dash-f-ubicacion')?.value || 'all';
  const sector = dashSafeQS('#dash-f-sector')?.value || 'all';
  const stakeholder = dashSafeQS('#dash-f-stakeholder')?.value || 'all';
  const clasificacion = dashSafeQS('#dash-f-clasificacion')?.value || 'all';

  dashSaveFilters({ ubicacion, sector, stakeholder, clasificacion });

  let proyectos = _dashData.proyectos.slice();

  if (ubicacion !== 'all') proyectos = proyectos.filter(p => p.estado === ubicacion);
  if (sector !== 'all') proyectos = proyectos.filter(p => p.sector === sector);
  if (stakeholder !== 'all') proyectos = proyectos.filter(p => p.tipo_org === stakeholder);
  if (clasificacion !== 'all') proyectos = proyectos.filter(p => p.clasificacion === clasificacion);

  const projectIds = new Set(proyectos.map(p => p.id));
  const actores = _dashData.actores.filter(a => a.proyectos.some(pid => projectIds.has(pid)));
  const desembolsos = _dashData.desembolsos.filter(d => projectIds.has(d.proyecto_id));
  const verificaciones = _dashData.verificaciones.filter(v => projectIds.has(v.proyecto_id));

  _dashFiltered = {
    proyectos,
    actores: actores.length ? actores : _dashData.actores,
    desembolsos,
    verificaciones,
    metas_nacionales: _dashData.metas_nacionales,
    eventos_mxc: _dashData.eventos_mxc,
  };

  dashRenderAll();
}

function dashRestoreFilters() {
  const f = dashGetFilters();
  if (f.ubicacion) { const el = dashSafeQS('#dash-f-ubicacion'); if (el) el.value = f.ubicacion; }
  if (f.sector) { const el = dashSafeQS('#dash-f-sector'); if (el) el.value = f.sector; }
  if (f.stakeholder) { const el = dashSafeQS('#dash-f-stakeholder'); if (el) el.value = f.stakeholder; }
  if (f.clasificacion) { const el = dashSafeQS('#dash-f-clasificacion'); if (el) el.value = f.clasificacion; }
}

function dashPopulateUbicaciones() {
  if (!_dashData) return;
  const sel = dashSafeQS('#dash-f-ubicacion');
  if (!sel) return;
  const estados = [...new Set(_dashData.proyectos.map(p => p.estado))].sort();
  estados.forEach(e => {
    const o = document.createElement('option');
    o.value = e;
    o.textContent = e;
    sel.appendChild(o);
  });
}

/* ===================== COUNTDOWN ===================== */

function dashInitCountdown() {
  if (!_dashData || !_dashData.eventos_mxc.length) return;

  const now = new Date();
  const upcoming = _dashData.eventos_mxc
    .map(e => ({ ...e, _date: new Date(e.fecha_inicio + 'T09:00:00') }))
    .filter(e => e._date > now)
    .sort((a, b) => a._date - b._date);

  const target = upcoming[0];
  if (!target) return;

  const labelEl = dashSafeQS('#dash-countdown-event');
  if (labelEl) labelEl.textContent = target.nombre;

  function tick() {
    const diff = target._date - Date.now();
    if (diff <= 0) {
      clearInterval(_countdownInterval);
      const dEl = dashSafeQS('#dash-cd-days'); if (dEl) dEl.textContent = '0';
      const hEl = dashSafeQS('#dash-cd-hours'); if (hEl) hEl.textContent = '00';
      const mEl = dashSafeQS('#dash-cd-mins'); if (mEl) mEl.textContent = '00';
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);

    const dEl = dashSafeQS('#dash-cd-days'); if (dEl) dEl.textContent = days;
    const hEl = dashSafeQS('#dash-cd-hours'); if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    const mEl = dashSafeQS('#dash-cd-mins'); if (mEl) mEl.textContent = String(mins).padStart(2, '0');
  }

  tick();
  _countdownInterval = setInterval(tick, 60000);
}

/* ===================== KPI CARDS ===================== */

function dashRenderKPIs() {
  const p = _dashFiltered.proyectos;

  const totalCapital = p.reduce((s, x) => s + (x.financiamiento_usd || 0), 0);
  const totalCO2 = p.reduce((s, x) => s + (x.co2_ton || 0), 0);
  const totalHa = p.reduce((s, x) => s + (x.hectareas || 0), 0);
  const totalEmpleos = p.reduce((s, x) => {
    const soc = x.social || {};
    return s + (soc.empleos_directos || 0) + (soc.empleos_indirectos || 0);
  }, 0);

  const kpiCapital = dashSafeQS('#kpi-capital');
  const kpiCO2 = dashSafeQS('#kpi-co2');
  const kpiHa = dashSafeQS('#kpi-hectareas');
  const kpiEmp = dashSafeQS('#kpi-empleos');

  if (kpiCapital) kpiCapital.textContent = '$' + dashFmt(totalCapital);
  if (kpiCO2) kpiCO2.textContent = dashFmt(totalCO2);
  if (kpiHa) kpiHa.textContent = dashFmt(totalHa, 0);
  if (kpiEmp) kpiEmp.textContent = dashFmt(totalEmpleos, 0);

  dashRenderSparkline('#spark-capital', p.map(x => x.financiamiento_usd || 0), '#F9A826');
  dashRenderSparkline('#spark-co2', p.map(x => x.co2_ton || 0), '#2CB67D');
  dashRenderSparkline('#spark-hectareas', p.map(x => x.hectareas || 0), '#3A9E9E');
  dashRenderSparkline('#spark-empleos', p.map(x => {
    const soc = x.social || {};
    return (soc.empleos_directos || 0) + (soc.empleos_indirectos || 0);
  }), '#6A4FC7');
}

/* ===================== D3 SPARKLINES ===================== */

function dashRenderSparkline(containerSel, values, color) {
  const container = dashSafeQS(containerSel);
  if (!container || typeof d3 === 'undefined') return;

  container.innerHTML = '';
  if (!values.length) return;

  const sorted = values.slice().sort((a, b) => b - a).slice(0, 12);
  if (sorted.every(v => v === 0)) return;

  const w = container.clientWidth || 140;
  const h = 36;
  const margin = { top: 4, right: 2, bottom: 2, left: 2 };
  const iw = w - margin.left - margin.right;
  const ih = h - margin.top - margin.bottom;

  const svg = d3.select(container).append('svg')
    .attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, sorted.length - 1]).range([0, iw]);
  const y = d3.scaleLinear().domain([0, d3.max(sorted)]).range([ih, 0]);

  const area = d3.area()
    .x((_, i) => x(i))
    .y0(ih)
    .y1(d => y(d))
    .curve(d3.curveMonotoneX);

  const line = d3.line()
    .x((_, i) => x(i))
    .y(d => y(d))
    .curve(d3.curveMonotoneX);

  g.append('path')
    .datum(sorted)
    .attr('d', area)
    .attr('fill', color)
    .attr('fill-opacity', 0.12);

  g.append('path')
    .datum(sorted)
    .attr('d', line)
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.7);
}

/* ===================== ACTOR RANKING ===================== */

function dashRenderActorRanking() {
  const list = dashSafeQS('#dash-actor-ranking');
  if (!list) return;

  const actors = _dashFiltered.actores.slice().sort((a, b) => b.iac_score - a.iac_score);
  const maxScore = actors[0]?.iac_score || 100;

  list.innerHTML = '';
  actors.forEach((actor, i) => {
    const li = document.createElement('li');
    li.className = 'dash-rank-item';
    li.setAttribute('role', 'listitem');
    li.dataset.actorId = actor.id;

    const posClass = i < 3 ? ` dash-rank-item__pos--${i + 1}` : '';
    li.innerHTML = `
      <span class="dash-rank-item__pos${posClass}">${i + 1}</span>
      <div class="dash-rank-item__info">
        <span class="dash-rank-item__name">${actor.nombre}</span>
        <span class="dash-rank-item__meta">${actor.tipo_actor.replace(/-/g, ' ')} · ${dashFmt(actor.co2_mitigado_ton)} tCO₂</span>
      </div>
      <div class="dash-rank-item__bar-wrap">
        <div class="dash-rank-item__bar" style="width:${(actor.iac_score / maxScore * 100).toFixed(0)}%"></div>
      </div>
      <span class="dash-rank-item__score">${actor.iac_score.toFixed(1)}</span>
    `;

    li.addEventListener('click', () => dashNavigateToActorOnMap(actor));
    list.appendChild(li);
  });
}

/* ===================== PROJECT RANKINGS ===================== */

function dashRenderProjectRankings() {
  dashRenderFinanceRanking();
  dashRenderEnvRanking();
  dashRenderSocialRanking();
}

function dashRenderFinanceRanking() {
  const list = dashSafeQS('#dash-rank-finance');
  if (!list) return;

  const key = _currentCurrency === 'mxn' ? 'financiamiento_mxn' : 'financiamiento_usd';
  const sorted = _dashFiltered.proyectos.slice()
    .filter(p => p[key] > 0)
    .sort((a, b) => b[key] - a[key])
    .slice(0, 8);

  const maxVal = sorted[0]?.[key] || 1;
  list.innerHTML = '';

  sorted.forEach((p, i) => {
    const li = document.createElement('li');
    li.className = 'dash-rank-item';
    li.setAttribute('role', 'listitem');

    const posClass = i < 3 ? ` dash-rank-item__pos--${i + 1}` : '';
    li.innerHTML = `
      <span class="dash-rank-item__pos${posClass}">${i + 1}</span>
      <div class="dash-rank-item__info">
        <span class="dash-rank-item__name">${p.nombre}</span>
        <span class="dash-rank-item__meta">${p.organizacion}</span>
      </div>
      <div class="dash-rank-item__bar-wrap">
        <div class="dash-rank-item__bar" style="width:${(p[key] / maxVal * 100).toFixed(0)}%;background:var(--mpc-yellow)"></div>
      </div>
      <span class="dash-rank-item__score">${dashFmtCurrency(p[key], _currentCurrency)}</span>
      <button type="button" class="dash-rank-item__action" data-project-id="${p.id}" title="Ver en mapa">⌖</button>
    `;

    li.querySelector('.dash-rank-item__action')?.addEventListener('click', (e) => {
      e.stopPropagation();
      dashNavigateToProjectOnMap(p);
    });
    li.addEventListener('click', () => dashNavigateToProjectOnMap(p));
    list.appendChild(li);
  });
}

function dashRenderEnvRanking() {
  const tab = _currentEnvTab;
  const proyectos = _dashFiltered.proyectos;

  if (tab === 'carbono') {
    const totalVerif = proyectos.reduce((s, p) => s + (p.ambiental?.co2_verificado || 0), 0);
    const totalHa = proyectos.reduce((s, p) => s + (p.ambiental?.hectareas_restauradas || 0), 0);
    const el1 = dashSafeQS('#env-co2-outcomes'); if (el1) el1.textContent = dashFmt(totalVerif);
    const el2 = dashSafeQS('#env-co2-ha'); if (el2) el2.textContent = dashFmt(totalHa);

    const sorted = proyectos.slice()
      .filter(p => (p.ambiental?.co2_verificado || 0) + (p.ambiental?.co2_reducido || 0) > 0)
      .sort((a, b) => {
        const aV = (a.ambiental?.co2_verificado || 0) + (a.ambiental?.co2_reducido || 0);
        const bV = (b.ambiental?.co2_verificado || 0) + (b.ambiental?.co2_reducido || 0);
        return bV - aV;
      })
      .slice(0, 6);

    dashRenderEnvList('#dash-rank-carbono', sorted, p => {
      const total = (p.ambiental?.co2_verificado || 0) + (p.ambiental?.co2_reducido || 0);
      return { value: total, label: dashFmt(total) + ' tCO₂eq' };
    });
  }

  if (tab === 'agua') {
    const totalM3 = proyectos.reduce((s, p) => s + (p.ambiental?.m3_infiltrados || 0) + (p.ambiental?.m3_tratados || 0), 0);
    const totalCAVs = proyectos.reduce((s, p) => s + (p.ambiental?.cavs_emitidos || 0), 0);
    const el1 = dashSafeQS('#env-agua-m3'); if (el1) el1.textContent = dashFmt(totalM3);
    const el2 = dashSafeQS('#env-agua-cavs'); if (el2) el2.textContent = totalCAVs;

    const sorted = proyectos.slice()
      .filter(p => (p.ambiental?.m3_infiltrados || 0) + (p.ambiental?.m3_tratados || 0) > 0)
      .sort((a, b) => {
        const aV = (a.ambiental?.m3_infiltrados || 0) + (a.ambiental?.m3_tratados || 0);
        const bV = (b.ambiental?.m3_infiltrados || 0) + (b.ambiental?.m3_tratados || 0);
        return bV - aV;
      })
      .slice(0, 6);

    dashRenderEnvList('#dash-rank-agua', sorted, p => {
      const total = (p.ambiental?.m3_infiltrados || 0) + (p.ambiental?.m3_tratados || 0);
      return { value: total, label: dashFmt(total) + ' m³' };
    });
  }

  if (tab === 'biodiversidad') {
    const totalEsp = proyectos.reduce((s, p) => s + (p.ambiental?.especies_recuperadas || 0), 0);
    const totalCorr = proyectos.reduce((s, p) => s + (p.ambiental?.corredores_conectados || 0), 0);
    const el1 = dashSafeQS('#env-bio-especies'); if (el1) el1.textContent = totalEsp;
    const el2 = dashSafeQS('#env-bio-corredores'); if (el2) el2.textContent = totalCorr;

    const sorted = proyectos.slice()
      .filter(p => (p.ambiental?.especies_recuperadas || 0) + (p.ambiental?.corredores_conectados || 0) > 0)
      .sort((a, b) => {
        const aV = (a.ambiental?.especies_recuperadas || 0) * 10 + (a.ambiental?.corredores_conectados || 0);
        const bV = (b.ambiental?.especies_recuperadas || 0) * 10 + (b.ambiental?.corredores_conectados || 0);
        return bV - aV;
      })
      .slice(0, 6);

    dashRenderEnvList('#dash-rank-biodiversidad', sorted, p => {
      const esp = p.ambiental?.especies_recuperadas || 0;
      const corr = p.ambiental?.corredores_conectados || 0;
      return { value: esp + corr, label: `${esp} esp · ${corr} corr` };
    });
  }
}

function dashRenderEnvList(containerSel, items, metricFn) {
  const list = dashSafeQS(containerSel);
  if (!list) return;
  list.innerHTML = '';

  const maxVal = items.length ? metricFn(items[0]).value : 1;

  items.forEach((p, i) => {
    const m = metricFn(p);
    const li = document.createElement('li');
    li.className = 'dash-rank-item';
    li.setAttribute('role', 'listitem');

    const posClass = i < 3 ? ` dash-rank-item__pos--${i + 1}` : '';
    li.innerHTML = `
      <span class="dash-rank-item__pos${posClass}">${i + 1}</span>
      <div class="dash-rank-item__info">
        <span class="dash-rank-item__name">${p.nombre}</span>
        <span class="dash-rank-item__meta">${p.estado}</span>
      </div>
      <div class="dash-rank-item__bar-wrap">
        <div class="dash-rank-item__bar" style="width:${(m.value / maxVal * 100).toFixed(0)}%;background:var(--mpc-green)"></div>
      </div>
      <span class="dash-rank-item__score" style="font-size:10px">${m.label}</span>
      <button type="button" class="dash-rank-item__action" title="Ver en mapa">⌖</button>
    `;

    li.querySelector('.dash-rank-item__action')?.addEventListener('click', (e) => {
      e.stopPropagation();
      dashNavigateToProjectOnMap(p);
    });
    li.addEventListener('click', () => dashNavigateToProjectOnMap(p));
    list.appendChild(li);
  });
}

function dashRenderSocialRanking() {
  const list = dashSafeQS('#dash-rank-social');
  if (!list) return;

  const proyectos = _dashFiltered.proyectos;
  const totalEmpleos = proyectos.reduce((s, p) => s + (p.social?.empleos_directos || 0) + (p.social?.empleos_indirectos || 0), 0);
  const totalComunidades = proyectos.reduce((s, p) => s + (p.social?.comunidades_beneficiadas || 0), 0);
  const totalAcuerdos = proyectos.reduce((s, p) => s + (p.social?.acuerdos_ejidales || 0) + (p.social?.acuerdos_indigenas || 0), 0);

  const el1 = dashSafeQS('#social-empleos-total'); if (el1) el1.textContent = dashFmt(totalEmpleos);
  const el2 = dashSafeQS('#social-comunidades-total'); if (el2) el2.textContent = totalComunidades;
  const el3 = dashSafeQS('#social-acuerdos-total'); if (el3) el3.textContent = totalAcuerdos;

  const sorted = proyectos.slice()
    .map(p => ({
      ...p,
      _socialScore: (p.social?.empleos_directos || 0) + (p.social?.empleos_indirectos || 0) +
                    (p.social?.comunidades_beneficiadas || 0) * 10 +
                    ((p.social?.acuerdos_ejidales || 0) + (p.social?.acuerdos_indigenas || 0)) * 20,
    }))
    .filter(p => p._socialScore > 0)
    .sort((a, b) => b._socialScore - a._socialScore)
    .slice(0, 8);

  const maxVal = sorted[0]?._socialScore || 1;
  list.innerHTML = '';

  sorted.forEach((p, i) => {
    const emp = (p.social?.empleos_directos || 0) + (p.social?.empleos_indirectos || 0);
    const com = p.social?.comunidades_beneficiadas || 0;
    const acuerdos = (p.social?.acuerdos_ejidales || 0) + (p.social?.acuerdos_indigenas || 0);

    const li = document.createElement('li');
    li.className = 'dash-rank-item';
    li.setAttribute('role', 'listitem');

    const posClass = i < 3 ? ` dash-rank-item__pos--${i + 1}` : '';
    li.innerHTML = `
      <span class="dash-rank-item__pos${posClass}">${i + 1}</span>
      <div class="dash-rank-item__info">
        <span class="dash-rank-item__name">${p.nombre}</span>
        <span class="dash-rank-item__meta">${emp} emp · ${com} com · ${acuerdos} acuerdos</span>
      </div>
      <div class="dash-rank-item__bar-wrap">
        <div class="dash-rank-item__bar" style="width:${(p._socialScore / maxVal * 100).toFixed(0)}%;background:#6A4FC7"></div>
      </div>
      <button type="button" class="dash-rank-item__action" title="Ver en mapa">⌖</button>
    `;

    li.querySelector('.dash-rank-item__action')?.addEventListener('click', (e) => {
      e.stopPropagation();
      dashNavigateToProjectOnMap(p);
    });
    li.addEventListener('click', () => dashNavigateToProjectOnMap(p));
    list.appendChild(li);
  });
}

/* ===================== GOALS / METAS ===================== */

function dashRenderGoals() {
  const container = dashSafeQS('#dash-goals');
  if (!container || !_dashFiltered) return;

  container.innerHTML = '';
  _dashFiltered.metas_nacionales.forEach(meta => {
    const pct = Math.min(100, (meta.current / meta.target * 100)).toFixed(1);
    const div = document.createElement('div');
    div.className = 'dash-goal-item';
    div.innerHTML = `
      <div class="dash-goal-item__head">
        <span class="dash-goal-item__name">${meta.nombre}</span>
        <span class="dash-goal-item__pct">${pct}%</span>
      </div>
      <div class="dash-goal-item__track">
        <div class="dash-goal-item__fill" style="width:${pct}%;background:${meta.color || 'var(--mpc-green)'}"></div>
      </div>
      <span class="dash-goal-item__detail">${meta.current.toLocaleString('es-MX')} / ${meta.target.toLocaleString('es-MX')} ${meta.unidad}</span>
    `;
    container.appendChild(div);
  });
}

/* ===================== D3 FINANCE CHART ===================== */

function dashRenderFinanceChart() {
  const container = dashSafeQS('#dash-chart-finance');
  if (!container || typeof d3 === 'undefined' || !_dashFiltered) return;

  container.innerHTML = '';
  const desembolsos = _dashFiltered.desembolsos.slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
  if (!desembolsos.length) {
    container.innerHTML = '<p style="color:rgba(255,255,255,0.3);font-size:11px;padding:2rem;text-align:center">Sin datos de desembolsos para los filtros actuales</p>';
    return;
  }

  const groupBy = dashSafeQS('#dash-timeline-group')?.value || 'total';

  const w = container.clientWidth || 500;
  const h = 180;
  const margin = { top: 16, right: 20, bottom: 28, left: 50 };
  const iw = w - margin.left - margin.right;
  const ih = h - margin.top - margin.bottom;

  const svg = d3.select(container).append('svg')
    .attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const parseDate = d3.timeParse('%Y-%m-%d');
  const data = desembolsos.map(d => ({ ...d, _date: parseDate(d.fecha) }));

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d._date))
    .range([0, iw]);

  if (groupBy === 'total') {
    let cumulative = 0;
    const cumData = data.map(d => { cumulative += d.monto_usd; return { date: d._date, value: cumulative }; });

    const y = d3.scaleLinear().domain([0, d3.max(cumData, d => d.value)]).nice().range([ih, 0]);

    const area = d3.area()
      .x(d => x(d.date))
      .y0(ih)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path').datum(cumData).attr('d', area)
      .attr('fill', '#2CB67D').attr('fill-opacity', 0.12);

    g.append('path').datum(cumData).attr('d', line)
      .attr('fill', 'none').attr('stroke', '#2CB67D').attr('stroke-width', 2);

    cumData.forEach(d => {
      g.append('circle')
        .attr('cx', x(d.date)).attr('cy', y(d.value))
        .attr('r', 3).attr('fill', '#2CB67D').attr('fill-opacity', 0.7);
    });

    g.append('g').attr('transform', `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%Y')))
      .call(g => g.selectAll('text').attr('fill', 'rgba(255,255,255,0.4)').attr('font-size', '9px'))
      .call(g => g.selectAll('line,path').attr('stroke', 'rgba(255,255,255,0.08)'));

    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => '$' + dashFmt(d)))
      .call(g => g.selectAll('text').attr('fill', 'rgba(255,255,255,0.4)').attr('font-size', '9px'))
      .call(g => g.selectAll('line,path').attr('stroke', 'rgba(255,255,255,0.08)'));

  } else {
    const sectorColors = { 'Ecosistemas Resilientes': '#2CB67D', 'Innovación Catalítica': '#F9A826', 'Despertar Planetario': '#E63946' };
    const tipoColors = { subvencion: '#2CB67D', donacion: '#3A9E9E', credito: '#F9A826', presupuesto: '#1E6091', equity: '#C7245E', cooperacion: '#6A4FC7', mixto: '#E8702A' };

    const projectMap = {};
    _dashFiltered.proyectos.forEach(p => { projectMap[p.id] = p; });

    let groupFn, colorMap;
    if (groupBy === 'sector') {
      groupFn = d => projectMap[d.proyecto_id]?.sector || 'Otro';
      colorMap = sectorColors;
    } else {
      groupFn = d => d.tipo || 'otro';
      colorMap = tipoColors;
    }

    const groups = d3.group(data, groupFn);
    const legendContainer = dashSafeQS('#dash-timeline-legend');
    if (legendContainer) {
      legendContainer.innerHTML = '';
      groups.forEach((_, key) => {
        const item = document.createElement('span');
        item.className = 'dash-legend-item';
        item.innerHTML = `<span class="dash-legend-dot" style="background:${colorMap[key] || '#888'}"></span>${key}`;
        legendContainer.appendChild(item);
      });
    }

    let allCum = [];
    groups.forEach((items, key) => {
      let cum = 0;
      items.sort((a, b) => a._date - b._date).forEach(d => {
        cum += d.monto_usd;
        allCum.push({ date: d._date, value: cum, group: key });
      });
    });

    const y = d3.scaleLinear().domain([0, d3.max(allCum, d => d.value)]).nice().range([ih, 0]);

    groups.forEach((_, key) => {
      const gData = allCum.filter(d => d.group === key);
      if (!gData.length) return;

      const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path').datum(gData).attr('d', line)
        .attr('fill', 'none').attr('stroke', colorMap[key] || '#888').attr('stroke-width', 2).attr('stroke-opacity', 0.8);

      gData.forEach(d => {
        g.append('circle')
          .attr('cx', x(d.date)).attr('cy', y(d.value))
          .attr('r', 2.5).attr('fill', colorMap[key] || '#888').attr('fill-opacity', 0.7);
      });
    });

    g.append('g').attr('transform', `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%Y')))
      .call(g => g.selectAll('text').attr('fill', 'rgba(255,255,255,0.4)').attr('font-size', '9px'))
      .call(g => g.selectAll('line,path').attr('stroke', 'rgba(255,255,255,0.08)'));

    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => '$' + dashFmt(d)))
      .call(g => g.selectAll('text').attr('fill', 'rgba(255,255,255,0.4)').attr('font-size', '9px'))
      .call(g => g.selectAll('line,path').attr('stroke', 'rgba(255,255,255,0.08)'));
  }
}

/* ===================== D3 VERIFICATION TIMELINE ===================== */

function dashRenderVerifTimeline() {
  const container = dashSafeQS('#dash-chart-verif');
  if (!container || typeof d3 === 'undefined' || !_dashFiltered) return;

  container.innerHTML = '';
  const verif = _dashFiltered.verificaciones.slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
  if (!verif.length) {
    container.innerHTML = '<p style="color:rgba(255,255,255,0.3);font-size:11px;padding:2rem;text-align:center">Sin verificaciones para los filtros actuales</p>';
    return;
  }

  const projectMap = {};
  _dashFiltered.proyectos.forEach(p => { projectMap[p.id] = p; });

  const w = container.clientWidth || 400;
  const h = 180;
  const margin = { top: 16, right: 20, bottom: 28, left: 45 };
  const iw = w - margin.left - margin.right;
  const ih = h - margin.top - margin.bottom;

  const svg = d3.select(container).append('svg')
    .attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const parseDate = d3.timeParse('%Y-%m-%d');
  const data = verif.map(v => ({ ...v, _date: parseDate(v.fecha), _project: projectMap[v.proyecto_id] }));

  const x = d3.scaleTime().domain(d3.extent(data, d => d._date)).range([0, iw]);
  const maxCredits = d3.max(data, d => d.creditos_ton) || 1;
  const rScale = d3.scaleSqrt().domain([0, maxCredits]).range([4, 18]);

  const stdColors = { VCS: '#2CB67D', CAR: '#F9A826', 'Plan Vivo': '#3A9E9E', 'Blue Carbon': '#1E6091', 'I-REC': '#C7245E', 'Gold Standard': '#E8702A', 'ISO 14064': '#6A4FC7', 'Rainforest Alliance': '#1B7A44' };

  g.append('line')
    .attr('x1', 0).attr('y1', ih / 2).attr('x2', iw).attr('y2', ih / 2)
    .attr('stroke', 'rgba(255,255,255,0.08)').attr('stroke-width', 1);

  data.forEach((d, i) => {
    const cx = x(d._date);
    const cy = ih / 2 + (i % 2 === 0 ? -20 : 20);
    const r = rScale(d.creditos_ton);
    const color = stdColors[d.estandar] || '#888';

    g.append('line')
      .attr('x1', cx).attr('y1', ih / 2).attr('x2', cx).attr('y2', cy)
      .attr('stroke', 'rgba(255,255,255,0.1)').attr('stroke-width', 1);

    g.append('circle')
      .attr('cx', cx).attr('cy', cy).attr('r', r)
      .attr('fill', color).attr('fill-opacity', 0.25)
      .attr('stroke', color).attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.7);

    g.append('text')
      .attr('x', cx).attr('y', cy + (i % 2 === 0 ? -r - 4 : r + 10))
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255,255,255,0.45)')
      .attr('font-size', '8px')
      .text(d.estandar + ' · ' + dashFmt(d.creditos_ton) + 't');
  });

  g.append('g').attr('transform', `translate(0,${ih})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%b %Y')))
    .call(g => g.selectAll('text').attr('fill', 'rgba(255,255,255,0.4)').attr('font-size', '9px'))
    .call(g => g.selectAll('line,path').attr('stroke', 'rgba(255,255,255,0.08)'));
}

/* ===================== RENDER ALL ===================== */

function dashRenderAll() {
  if (!_dashFiltered) return;
  dashRenderKPIs();
  dashRenderActorRanking();
  dashRenderProjectRankings();
  dashRenderGoals();
  dashRenderFinanceChart();
  dashRenderVerifTimeline();
}

/* ===================== NAVIGATION ===================== */

function dashShowDashboard() {
  const dash = dashSafeQS('#mpc-dashboard');
  const atlas = dashSafeQS('#mpc-atlas');
  const fab = dashSafeQS('#dash-map-fab');

  if (dash) { dash.classList.remove('is-hidden'); dash.setAttribute('aria-hidden', 'false'); }
  if (atlas) { atlas.classList.add('is-hidden'); atlas.setAttribute('aria-hidden', 'true'); }

  if (fab) {
    fab.classList.remove('is-hidden');
    fab.setAttribute('aria-hidden', 'false');
    const chartIcon = dashSafeQS('#fab-icon-chart');
    const globeIcon = dashSafeQS('#fab-icon-globe');
    if (chartIcon) chartIcon.classList.add('is-hidden');
    if (globeIcon) globeIcon.classList.remove('is-hidden');
  }

  dashSetView('dashboard');
  window.location.hash = 'dashboard';
}

function dashShowMap() {
  const dash = dashSafeQS('#mpc-dashboard');
  const atlas = dashSafeQS('#mpc-atlas');
  const fab = dashSafeQS('#dash-map-fab');

  if (dash) { dash.classList.add('is-hidden'); dash.setAttribute('aria-hidden', 'true'); }
  if (atlas) { atlas.classList.remove('is-hidden'); atlas.setAttribute('aria-hidden', 'false'); }

  if (fab) {
    fab.classList.remove('is-hidden');
    fab.setAttribute('aria-hidden', 'false');
    const chartIcon = dashSafeQS('#fab-icon-chart');
    const globeIcon = dashSafeQS('#fab-icon-globe');
    if (chartIcon) chartIcon.classList.remove('is-hidden');
    if (globeIcon) globeIcon.classList.add('is-hidden');
  }

  dashSetView('map');
  window.location.hash = 'map';

  if (typeof tryHideMpcMapLoading === 'function') tryHideMpcMapLoading();
  if (typeof setMpcMapLoading === 'function') setMpcMapLoading(false);

  if (typeof map !== 'undefined' && map && map.resize) {
    map.resize();

    const MX_CENTER = [-102.5, 23.5];
    const MX_ZOOM = 5;

    map.jumpTo({
      center: [-90, 20],
      zoom: 1.5,
      pitch: 0,
      bearing: 0,
    });

    setTimeout(() => {
      map.flyTo({
        center: MX_CENTER,
        zoom: MX_ZOOM,
        pitch: 25,
        bearing: 0,
        duration: 3200,
        essential: true,
        curve: 1.8,
      });
    }, 400);
  }
}

function dashToggleView() {
  const current = dashGetView();
  if (current === 'dashboard') dashShowMap();
  else dashShowDashboard();
}

function dashNavigateToProjectOnMap(project) {
  const dash = dashSafeQS('#mpc-dashboard');
  const atlas = dashSafeQS('#mpc-atlas');
  const fab = dashSafeQS('#dash-map-fab');

  if (dash) { dash.classList.add('is-hidden'); dash.setAttribute('aria-hidden', 'true'); }
  if (atlas) { atlas.classList.remove('is-hidden'); atlas.setAttribute('aria-hidden', 'false'); }
  if (fab) {
    fab.classList.remove('is-hidden');
    fab.setAttribute('aria-hidden', 'false');
    const chartIcon = dashSafeQS('#fab-icon-chart');
    const globeIcon = dashSafeQS('#fab-icon-globe');
    if (chartIcon) chartIcon.classList.remove('is-hidden');
    if (globeIcon) globeIcon.classList.add('is-hidden');
  }
  dashSetView('map');
  window.location.hash = 'map';

  if (typeof tryHideMpcMapLoading === 'function') tryHideMpcMapLoading();
  if (typeof setMpcMapLoading === 'function') setMpcMapLoading(false);

  if (typeof map !== 'undefined' && map) {
    map.resize();

    if (project.coordinates) {
      map.jumpTo({ center: [-90, 20], zoom: 1.5, pitch: 0, bearing: 0 });

      setTimeout(() => {
        map.flyTo({
          center: project.coordinates,
          zoom: 12,
          pitch: 45,
          duration: 3500,
          essential: true,
          curve: 1.6,
        });

        setTimeout(() => {
          if (typeof openMpcProjectDetail === 'function') {
            openMpcProjectDetail(project.id);
          }
        }, 3600);
      }, 400);
    }
  }
}

function dashNavigateToActorOnMap(actor) {
  if (!actor.proyectos || !actor.proyectos.length) return;

  const filterSector = dashSafeQS('#filter-tipo-org');
  const tipoMap = {
    'sociedad-civil': 'ONG / Sociedad Civil',
    'gobierno': 'Gobierno',
    'empresa': 'Empresa / Corporativo',
    'academia': 'Academia / Institución',
    'emprendimiento-climatico': 'Emprendedor / Startup',
    'fondo-inversion': 'Fondo de Inversión',
  };
  if (filterSector && tipoMap[actor.tipo_actor]) {
    filterSector.value = tipoMap[actor.tipo_actor];
  }

  dashShowMap();

  setTimeout(() => {
    if (typeof applyFilters === 'function') {
      const btn = document.getElementById('apply-filters');
      if (btn) btn.click();
    }
  }, 3500);
}

/* ===================== SYNC FILTERS TO MAP ===================== */

function dashSyncFiltersToMap() {
  const f = dashGetFilters();
  if (!f || !Object.keys(f).length) return;

  const sectorMap = { 'Ecosistemas Resilientes': 'Ecosistemas Resilientes', 'Innovación Catalítica': 'Innovación Catalítica', 'Despertar Planetario': 'Despertar Planetario' };

  const mapSector = dashSafeQS('#filter-sector');
  if (mapSector && f.sector && f.sector !== 'all' && sectorMap[f.sector]) {
    mapSector.value = f.sector;
  }

  const mapTipoOrg = dashSafeQS('#filter-tipo-org');
  if (mapTipoOrg && f.stakeholder && f.stakeholder !== 'all') {
    mapTipoOrg.value = f.stakeholder;
  }
}

/* ===================== EVENT BINDINGS ===================== */

function dashBindEvents() {
  const applyBtn = dashSafeQS('#dash-apply-filters');
  if (applyBtn) applyBtn.addEventListener('click', dashApplyFilters);

  const clearBtn = dashSafeQS('#dash-clear-filters');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    dashSafeQSA('.dash-select').forEach(s => { s.value = s.options[0]?.value || 'all'; });
    dashSaveFilters({});
    dashApplyFilters();
  });

  const goMapBtn = dashSafeQS('#dash-go-map');
  if (goMapBtn) goMapBtn.addEventListener('click', dashShowMap);

  const fab = dashSafeQS('#dash-map-fab');
  if (fab) fab.addEventListener('click', dashToggleView);

  dashSafeQSA('.dash-toggle-btn[data-currency]').forEach(btn => {
    btn.addEventListener('click', () => {
      _currentCurrency = btn.dataset.currency;
      dashSafeQSA('.dash-toggle-btn[data-currency]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      dashRenderFinanceRanking();
    });
  });

  dashSafeQSA('.dash-tab[data-env-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      _currentEnvTab = tab.dataset.envTab;
      dashSafeQSA('.dash-tab[data-env-tab]').forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      dashSafeQSA('.dash-env-panel').forEach(p => p.classList.add('is-hidden'));
      const panel = dashSafeQS(`#dash-env-panel-${_currentEnvTab}`);
      if (panel) panel.classList.remove('is-hidden');

      dashRenderEnvRanking();
    });
  });

  const timelineGroup = dashSafeQS('#dash-timeline-group');
  if (timelineGroup) timelineGroup.addEventListener('change', dashRenderFinanceChart);

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'map') dashShowMap();
    else if (hash === 'dashboard') dashShowDashboard();
  });

  window.addEventListener('resize', () => {
    if (dashGetView() === 'dashboard') {
      dashRenderFinanceChart();
      dashRenderVerifTimeline();
    }
  });
}

/* ===================== ROLE BADGE ===================== */

function dashUpdateRoleBadge() {
  const roleBadge = dashSafeQS('#dash-role-badge');
  if (!roleBadge) return;

  let actor = 'visitante';
  try { actor = sessionStorage.getItem('mpc-actor') || 'visitante'; } catch (_) {}

  const labels = {
    visitante: 'Visitante', empresa: 'Empresa', 'fondo-inversion': 'Fondo de inversión',
    'sociedad-civil': 'Sociedad civil', gobierno: 'Gobierno', academia: 'Academia',
    'emprendimiento-climatico': 'Emprendimiento', desarrollador: 'Consultor', administrador: 'Admin',
  };
  roleBadge.textContent = 'Rol: ' + (labels[actor] || actor);
}

/* ===================== INIT ===================== */

async function initDashboard() {
  await dashLoadData();
  if (!_dashData) return;

  dashPopulateUbicaciones();
  dashRestoreFilters();
  dashUpdateRoleBadge();
  dashInitCountdown();

  _dashFiltered = {
    proyectos: _dashData.proyectos,
    actores: _dashData.actores,
    desembolsos: _dashData.desembolsos,
    verificaciones: _dashData.verificaciones,
    metas_nacionales: _dashData.metas_nacionales,
    eventos_mxc: _dashData.eventos_mxc,
  };

  dashBindEvents();
  dashApplyFilters();
}
