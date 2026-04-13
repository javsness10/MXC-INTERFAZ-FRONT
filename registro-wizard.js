/**
 * registro-wizard.js  —  MXC Atlas · Wizard de Registro
 * Vanilla JS, sin dependencias. Expone window.MPC_REGISTRO.open(actorType, onComplete)
 */
(function () {
  'use strict';

  /* ── Tokens ─────────────────────────────────────────────── */
  var GBORDER = 'rgba(44,182,125,.22)';
  var GSHADOW = 'inset 0 1px 0 rgba(255,255,255,.07),0 32px 80px rgba(0,0,0,.8),0 0 0 1px rgba(44,182,125,.07)';
  var MAX_XP  = 275;
  var MIN_TAGS = 3;
  var XP_PER_STEP = {1:50,2:75,3:50,4:100};

  /* ── Roles ──────────────────────────────────────────────── */
  var ROLES = {
    energetico:{
      title:'Innovador Energético', color:'#D97706',
      shadow:'rgba(217,119,6,.45)', glow:'rgba(217,119,6,.1)',
      triggerTags:['Energía solar','Energía eólica','Tecnología verde','Almacenamiento de energía'],
      svg:'<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
    },
    guardian:{
      title:'Guardián de Ecosistemas', color:'#10B981',
      shadow:'rgba(16,185,129,.45)', glow:'rgba(16,185,129,.1)',
      triggerTags:['Reforestación','Biodiversidad','Océanos y costas','Suelos y agricultura'],
      svg:'<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>'
    },
    urbano:{
      title:'Arquitecto Urbano', color:'#06B6D4',
      shadow:'rgba(6,182,212,.45)', glow:'rgba(6,182,212,.1)',
      triggerTags:['Ciudades sostenibles','Movilidad limpia','Gestión de residuos','Agua y cuencas'],
      svg:'<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>'
    },
    estratega:{
      title:'Estratega Climático', color:'#8B5CF6',
      shadow:'rgba(139,92,246,.45)', glow:'rgba(139,92,246,.1)',
      triggerTags:['Finanzas climáticas','Política climática','Carbono y MRV','Gobernanza climática'],
      svg:'<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'
    },
    pionero:{
      title:'Pionero Climático', color:'#84cc16',
      shadow:'rgba(132,204,22,.45)', glow:'rgba(132,204,22,.1)',
      triggerTags:[],
      svg:'<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>'
    }
  };

  function calcRole(tags) {
    if (!tags || !tags.length) return ROLES.pionero;
    var best = null, score = 0;
    ['energetico','guardian','urbano','estratega'].forEach(function(k){
      var s = ROLES[k].triggerTags.filter(function(t){ return tags.indexOf(t) !== -1; }).length;
      if (s > score) { score = s; best = ROLES[k]; }
    });
    return score >= 1 ? best : ROLES.pionero;
  }

  /* ── Labels actor ────────────────────────────────────────── */
  var ACTOR_LABEL = {
    'empresa':'Empresa','fondo-inversion':'Fondo de Inversión',
    'gobierno':'Gobierno','academia':'Academia',
    'sociedad-civil':'Sociedad Civil',
    'emprendimiento-climatico':'Emprendimiento Climático',
    'desarrollador':'Consultor / Implementador',
    'visitante':'Visitante','administrador':'Administrador'
  };

  /* ── Campos Paso 2 (por tipo de actor) ───────────────────── */
  var STEP2 = {
    'empresa': [
      { key:'busca',   label:'¿Qué buscas en la red?',      type:'select',
        opts:['Socios estratégicos','Financiamiento verde','Proveedores sustentables','Certificaciones climáticas','Visibilidad institucional','Acceso a datos de impacto'] },
      { key:'ofrece',  label:'¿Qué puedes aportar?',         type:'select',
        opts:['Inversión o coinversión','Infraestructura existente','Tecnología propia','Escala y distribución','Datos del sector','Mentoría a startups'] },
      { key:'sector',  label:'Sector principal de operación', type:'select',
        opts:['Manufactura e industria','Energía y utilities','Construcción e infraestructura','Agroindustria','Retail y consumo','Tecnología y software','Transporte y logística','Servicios financieros','Otro'] }
    ],
    'fondo-inversion': [
      { key:'busca',   label:'¿Qué tipo de proyectos buscas?', type:'select',
        opts:['Startups de impacto climático','Proyectos de conservación y restauración','Energías renovables a escala','Economía circular','Infraestructura verde urbana','Agronegocios sostenibles','Adaptación comunitaria'] },
      { key:'ticket',  label:'Ticket promedio de inversión',    type:'select',
        opts:['< $100K USD (grants / micro)','$100K – $500K USD','$500K – $2M USD','$2M – $10M USD','> $10M USD'] },
      { key:'etapa',   label:'Etapa en la que inviertes',       type:'select',
        opts:['Pre-semilla / Idea','Semilla / MVP','Serie A – crecimiento','Escalamiento regional','Deuda verde / blended finance','Filantrópico o donación'] }
    ],
    'gobierno': [
      { key:'nivel',   label:'Nivel de gobierno',              type:'select',
        opts:['Federal – secretaría / agencia','Estatal – gobierno del estado','Municipal / Alcaldía','Organismo descentralizado','Empresa paraestatal'] },
      { key:'busca',   label:'¿Qué buscas en la red?',         type:'select',
        opts:['Proyectos para financiar o apoyar','Colaboración técnica y datos','Alianzas con sociedad civil','Implementadores en campo','Evidencia para política pública','Vigilancia y monitoreo ambiental'] },
      { key:'area',    label:'Área o dependencia',              type:'text',
        placeholder:'Ej. Secretaría de Medio Ambiente y Recursos Naturales' }
    ],
    'academia': [
      { key:'linea',   label:'Línea de investigación principal', type:'select',
        opts:['Cambio climático y adaptación','Energías renovables','Biodiversidad y ecosistemas','Economía y finanzas verdes','Políticas públicas ambientales','Ingeniería ambiental','Ciencias del suelo y agua','Ciencias sociales y comunidades'] },
      { key:'aporta',  label:'¿Cómo puedes contribuir?',         type:'select',
        opts:['Datos y estudios científicos','Modelos y proyecciones climáticas','Evaluación de impacto y MRV','Formación de capacidades','Publicaciones y evidencia','Laboratorio o infraestructura','Consultoría especializada'] },
      { key:'inst',    label:'Tipo de institución',              type:'select',
        opts:['Universidad pública','Universidad privada','Centro de investigación público','Instituto tecnológico nacional','Posgrado o think tank','Red de investigación interinstitucional'] }
    ],
    'sociedad-civil': [
      { key:'enfoque', label:'Enfoque principal de trabajo',    type:'select',
        opts:['Conservación y restauración ecológica','Educación y comunicación ambiental','Justicia climática y derechos','Comunidades y pueblos indígenas','Monitoreo ciudadano','Incidencia en política pública','Economía solidaria y circular'] },
      { key:'busca',   label:'¿Con quién buscas conectar?',     type:'select',
        opts:['Financiadores y fondos','Gobierno para incidencia','Academia y datos científicos','Empresas con agenda ESG','Otras OSC y redes','Medios y comunicadores','Voluntariado y comunidad'] },
      { key:'alcance', label:'Alcance territorial',             type:'select',
        opts:['Comunidad o colonia','Municipal','Estatal','Regional (varios estados)','Nacional','Transfronterizo / internacional'] }
    ],
    'emprendimiento-climatico': [
      { key:'etapa',   label:'Etapa de desarrollo actual',      type:'select',
        opts:['Idea / Investigación de mercado','Prototipo / MVP en pruebas','Piloto con primeros clientes','Comercialización temprana','Escala regional','Expansión internacional'] },
      { key:'necesita',label:'¿Qué necesitas más en este momento?', type:'select',
        opts:['Capital semilla o inversión','Clientes piloto y validación','Alianzas tecnológicas','Apoyo regulatorio o permisos','Mentorías y aceleración','Talento especializado','Visibilidad y comunidad'] },
      { key:'modelo',  label:'Modelo de negocio',               type:'select',
        opts:['B2B – empresas','B2C – consumidor final','B2G – gobierno','Plataforma / marketplace','Hardware / deep tech','SaaS / software','Servicios de consultoría','Economía circular / residuos'] }
    ],
    'desarrollador': [
      { key:'servicios', label:'Tipo de servicios que ofreces', type:'select',
        opts:['Consultoría de sostenibilidad','Implementación de proyectos en campo','Modelación y análisis de datos','Ingeniería ambiental y civil','Monitoreo, reporte y verificación (MRV)','Arquitectura y diseño sustentable','Gestión de programas y fondos','Formación y capacitación'] },
      { key:'busca',     label:'¿Qué buscas en la red?',        type:'select',
        opts:['Proyectos para implementar','Socios complementarios','Clientes del sector público','Clientes del sector privado','Financiadores para mis proyectos','Alianzas con academia','Visibilidad y reputación'] }
    ],
    'visitante': [
      { key:'razon',   label:'¿Por qué exploras el Atlas?',     type:'select',
        opts:['Curiosidad e información general','Busco organizaciones con quienes colaborar','Investigación académica o periodística','Interés en invertir o financiar','Quiero unirme a una iniciativa','Trabajo en política pública','Soy estudiante o joven profesional'] },
      { key:'interes', label:'¿Qué temas te interesan más?',    type:'select',
        opts:['Energía renovable','Biodiversidad y naturaleza','Ciudades sostenibles','Agua y cuencas','Justicia climática','Finanzas verdes','Innovación y tecnología'] }
    ],
    'administrador': [
      { key:'org',     label:'Organización que representas',    type:'text',
        placeholder:'Nombre completo de la institución' },
      { key:'acceso',  label:'Tipo de acceso requerido',        type:'select',
        opts:['Editor de contenido','Gestor de actores','Analista de datos','Administrador técnico','Super administrador'] }
    ]
  };

  /* ── Tags paso 3 ─────────────────────────────────────────── */
  var ALL_TAGS = [
    'Energía solar','Energía eólica','Almacenamiento de energía','Tecnología verde',
    'Reforestación','Biodiversidad','Océanos y costas','Suelos y agricultura',
    'Ciudades sostenibles','Movilidad limpia','Gestión de residuos','Agua y cuencas',
    'Finanzas climáticas','Política climática','Carbono y MRV','Gobernanza climática',
    'Adaptación climática','Educación ambiental','Innovación y startups',
    'Comunidades indígenas','Género y clima','Economía circular','Turismo regenerativo'
  ];

  /* ── Estado global ───────────────────────────────────────── */
  var S = {
    visible:false, step:1, xp:0,
    actorType:'', orgName:'', stepTwoData:{},
    selectedTags:[], locationName:'', role:ROLES.pionero, onComplete:null
  };

  /* ── SVG icons ───────────────────────────────────────────── */
  var IC = {
    check:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
    close:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    camera:  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.6"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    spark:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2CB67D" stroke-width="1.8"><path d="M12 3l1.88 5.76a1 1 0 0 0 .95.7H21l-4.94 3.59a1 1 0 0 0-.36 1.12L17.58 20 12 16.27 6.42 20l1.88-5.83a1 1 0 0 0-.36-1.12L3 9.46h6.17a1 1 0 0 0 .95-.7L12 3z"/></svg>',
    search:  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    mappin:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    users:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    map:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>'
  };

  /* ═══════════════════════════════════════════════════════════
     CSS
  ═══════════════════════════════════════════════════════════ */
  function injectCSS() {
    if (document.getElementById('mpc-reg-style')) return;
    var el = document.createElement('style');
    el.id = 'mpc-reg-style';
    el.textContent = [
      /* overlay */
      '#mpc-reg-overlay{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:1.25rem;opacity:0;pointer-events:none;transition:opacity .35s ease;}',
      '#mpc-reg-overlay.is-open{opacity:1;pointer-events:auto;}',

      /* fondo: imagen de nopal + blur + oscuro */
      '#mpc-reg-backdrop{position:absolute;inset:0;overflow:hidden;}',
      '#mpc-reg-bg-img{position:absolute;inset:-32px;background:url(registro-bg.jpg) center/cover no-repeat;filter:blur(14px);transform:scale(1.04);}',
      '#mpc-reg-bg-dark{position:absolute;inset:0;background:linear-gradient(160deg,rgba(2,10,4,.72) 0%,rgba(1,6,3,.78) 100%);}',

      /* tarjeta glassmorphism oscuro — sin imagen propia */
      '#mpc-reg-card{position:relative;z-index:1;width:100%;max-width:29rem;max-height:calc(100vh - 2.5rem);overflow-y:auto;border-radius:24px;padding:1.65rem;' +
        'background:linear-gradient(160deg,rgba(8,22,11,.82) 0%,rgba(4,14,7,.88) 100%);' +
        'backdrop-filter:blur(28px) saturate(1.4);-webkit-backdrop-filter:blur(28px) saturate(1.4);' +
        'border:1px solid '+GBORDER+';box-shadow:'+GSHADOW+';scrollbar-width:none;}',
      '#mpc-reg-card::-webkit-scrollbar{display:none;}',

      /* cerrar */
      '#mpc-reg-close{position:absolute;top:14px;right:14px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.4);cursor:pointer;z-index:2;transition:all .15s;}',
      '#mpc-reg-close:hover{background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);}',

      /* XP bar */
      '.reg-xpbar{margin-bottom:1rem;}',
      '.reg-xpbar-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;}',
      '.reg-xpbar-lbl{font:700 9px/1 "League Spartan",system-ui;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.3);}',
      '.reg-xpbar-val{font:600 10px/1 "League Spartan",system-ui;}',
      '.reg-xpbar-track{height:3px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;}',
      '.reg-xpbar-fill{height:100%;border-radius:3px;transition:width .7s cubic-bezier(.4,0,.2,1);background:linear-gradient(90deg,#2CB67D,#3AB89E);box-shadow:0 0 10px rgba(44,182,125,.5);}',

      /* stepper */
      '.reg-stepper{display:flex;align-items:flex-start;margin-bottom:1.4rem;}',
      '.reg-snode{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;}',
      '.reg-sci{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.1);font:700 11px/1 "League Spartan",sans-serif;color:rgba(255,255,255,.2);transition:all .3s;}',
      '.reg-sci.done{background:#2CB67D;border-color:#2CB67D;box-shadow:0 0 14px rgba(44,182,125,.4);}',
      '.reg-sci.active{border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.07);color:rgba(255,255,255,.9);}',
      '.reg-slbl{font:700 8px/1 "League Spartan",sans-serif;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,.18);transition:color .3s;}',
      '.reg-slbl.done{color:#2CB67D;} .reg-slbl.active{color:rgba(255,255,255,.6);}',
      '.reg-sline{flex:1;height:1px;background:rgba(255,255,255,.07);margin:14px 5px 0;transition:background .5s;}',
      '.reg-sline.done{background:rgba(44,182,125,.35);}',

      /* paneles */
      '.reg-panel{display:none;flex-direction:column;gap:1.1rem;}',
      '.reg-panel.active{display:flex;animation:regIn .25s ease;}',
      '.reg-panel.back{animation:regBack .25s ease;}',
      '@keyframes regIn{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}',
      '@keyframes regBack{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:translateX(0)}}',

      /* tipografía */
      '.reg-eye{font:700 9px/1 "League Spartan",sans-serif;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.28);margin:0;}',
      '.reg-h{font:700 22px/1.2 "League Spartan",sans-serif;letter-spacing:-.01em;color:rgba(255,255,255,.95);margin:.2rem 0 0;}',
      '.reg-sub{font-size:11.5px;line-height:1.5;color:rgba(255,255,255,.36);margin:.15rem 0 0;}',
      '.reg-lbl{display:block;font:700 9px/1 "League Spartan",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.36);margin-bottom:6px;}',

      /* inputs */
      '.reg-field{display:flex;flex-direction:column;gap:5px;}',
      '.reg-in,.reg-sel{width:100%;padding:11px 13px;font:400 13px/1 "Inter",system-ui;color:rgba(255,255,255,.85);background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);border-radius:12px;outline:none;transition:border-color .15s,background .15s;box-sizing:border-box;}',
      '.reg-in:focus,.reg-sel:focus{border-color:rgba(44,182,125,.45);background:rgba(0,0,0,.45);}',
      '.reg-in::placeholder{color:rgba(255,255,255,.2);}',
      '.reg-sel{-webkit-appearance:none;appearance:none;cursor:pointer;',
        'background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'rgba(255,255,255,.4)\' stroke-width=\'2.5\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E");',
        'background-repeat:no-repeat;background-position:right 13px center;padding-right:34px;}',
      '.reg-sel option{background:#0a140b;color:#d4e8d6;}',
      '.reg-search-wrap{position:relative;}',
      '.reg-search-ic{position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none;color:rgba(255,255,255,.3);}',
      '.reg-search-wrap .reg-in{padding-left:34px;}',

      /* xp banner */
      '.reg-banner{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:rgba(44,182,125,.08);border:1px solid rgba(44,182,125,.18);}',
      '.reg-banner span{font:600 11px/1 "League Spartan",sans-serif;color:#2CB67D;}',

      /* logo */
      '.reg-logo-wrap{display:flex;flex-direction:column;align-items:center;gap:7px;}',
      '.reg-logo-drop{width:84px;height:84px;border-radius:50%;border:2px dashed rgba(255,255,255,.2);background:rgba(0,0,0,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;transition:all .2s;}',
      '.reg-logo-drop:hover{border-color:rgba(44,182,125,.5);background:rgba(44,182,125,.07);}',
      '.reg-logo-drop.over{border-color:#2CB67D;background:rgba(44,182,125,.1);}',
      '.reg-logo-drop img{width:100%;height:100%;object-fit:cover;}',
      '.reg-logo-hint{font:700 8px/1 "League Spartan",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.2);}',

      /* chips */
      '.reg-chips{display:flex;flex-wrap:wrap;gap:6px;}',
      '.reg-chip{padding:5px 12px;border-radius:9999px;font:500 11px/1 "Inter",system-ui;cursor:pointer;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.3);color:rgba(255,255,255,.45);transition:all .15s;white-space:nowrap;}',
      '.reg-chip:hover{border-color:rgba(255,255,255,.22);color:rgba(255,255,255,.65);}',
      '.reg-chip.on{border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.08);color:rgba(255,255,255,.9);}',

      /* role card */
      '.reg-role-card{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.3);transition:all .3s;}',
      '.reg-role-eye{font:700 8px/1 "League Spartan",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.28);margin-bottom:3px;}',
      '.reg-role-name{font:700 13px/1 "League Spartan",sans-serif;transition:color .3s;}',
      '.reg-role-ct{font:700 13px/1 "League Spartan",sans-serif;color:rgba(255,255,255,.25);}',

      /* tag progress */
      '.reg-tagprog{display:flex;flex-direction:column;gap:5px;}',
      '.reg-tagprog-row{display:flex;justify-content:space-between;font:400 10px/1 "Inter",system-ui;color:rgba(255,255,255,.3);}',
      '.reg-tagprog-track{height:3px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden;}',
      '.reg-tagprog-fill{height:100%;border-radius:3px;transition:width .35s,background .35s;}',

      /* mock map */
      '.reg-map{width:100%;height:160px;border-radius:16px;overflow:hidden;position:relative;border:1px solid rgba(255,255,255,.07);background:linear-gradient(155deg,#050f07,#030907);}',
      '.reg-map-lbl{position:absolute;bottom:9px;left:12px;font:700 8px/1 "League Spartan",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.18);}',
      '.reg-map-pin{position:absolute;left:50%;top:44%;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;transition:opacity .3s;}',
      '.reg-map-pin.hide{opacity:0;}',
      '.reg-map-pin-c{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#2CB67D,#3AB89E);box-shadow:0 0 18px rgba(44,182,125,.6);border:2px solid rgba(255,255,255,.28);}',
      '.reg-map-pin-s{width:2px;height:9px;background:rgba(44,182,125,.55);}',

      /* botones */
      '.reg-row{display:flex;align-items:center;gap:8px;padding-top:4px;}',
      '.reg-btn{flex:1;padding:12px 18px;font:700 11px/1 "League Spartan",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#070f08;background:linear-gradient(180deg,#f0f2f0,#d5dcd5);border:1px solid rgba(255,255,255,.3);border-radius:10px;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.6);transition:filter .15s;display:flex;align-items:center;justify-content:center;gap:7px;}',
      '.reg-btn:hover{filter:brightness(1.06);}',
      '.reg-btn:disabled{opacity:.3;cursor:not-allowed;filter:none;}',
      '.reg-btn-sec{padding:11px 15px;font:700 11px/1 "League Spartan",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.55);background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.12);border-radius:10px;cursor:pointer;transition:all .15s;white-space:nowrap;}',
      '.reg-btn-sec:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.8);}',
      '.reg-btn-ghost{padding:12px 12px;font:700 10px/1 "League Spartan",sans-serif;letter-spacing:.05em;text-transform:uppercase;color:rgba(255,255,255,.28);background:none;border:none;cursor:pointer;white-space:nowrap;transition:color .15s;}',
      '.reg-btn-ghost:hover{color:rgba(255,255,255,.5);}',
      '.reg-btn-full{width:100%;display:flex;align-items:center;justify-content:center;gap:7px;}',

      /* success */
      '.reg-success{display:flex;flex-direction:column;align-items:center;text-align:center;gap:1.3rem;padding:.4rem 0;}',
      '.reg-sicon{position:relative;display:flex;align-items:center;justify-content:center;}',
      '.reg-sglow{position:absolute;width:130px;height:130px;border-radius:50%;filter:blur(16px);}',
      '.reg-spulse{position:absolute;width:96px;height:96px;border-radius:50%;border:1px solid;animation:regPulse 2.5s ease-in-out infinite;}',
      '.reg-sbadge{position:relative;width:78px;height:78px;border-radius:50%;display:flex;align-items:center;justify-content:center;}',
      '@keyframes regPulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.18);opacity:.18}}',
      '.reg-sovl{font:700 9px/1 "League Spartan",sans-serif;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.3);margin:0;}',
      '.reg-ssub{font:700 9px/1 "League Spartan",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.22);margin:.1rem 0;}',
      '.reg-srole{font:700 26px/1.15 "League Spartan",sans-serif;margin:.15rem 0 0;}',
      '.reg-stats{width:100%;border-radius:16px;background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.08);display:flex;}',
      '.reg-stat{flex:1;padding:13px 0;display:flex;flex-direction:column;align-items:center;gap:2px;border-right:1px solid rgba(255,255,255,.07);}',
      '.reg-stat:last-child{border:none;}',
      '.reg-stat-v{font:700 22px/1 "League Spartan",sans-serif;}',
      '.reg-stat-l{font:700 8px/1 "League Spartan",sans-serif;letter-spacing:.09em;text-transform:uppercase;color:rgba(255,255,255,.28);}'
    ].join('');
    document.head.appendChild(el);
  }

  /* ═══════════════════════════════════════════════════════════
     BUILDERS HTML
  ═══════════════════════════════════════════════════════════ */

  function stepperHTML(step) {
    var lbls = ['Identidad','Perfil','Intereses','Ubicación'];
    var h = '<div class="reg-stepper">';
    lbls.forEach(function(lbl, i) {
      var n = i + 1, done = step > n, active = step === n;
      h += '<div class="reg-snode">';
      h += '<div class="reg-sci' + (done?' done':active?' active':'') + '">' + (done ? IC.check : n) + '</div>';
      h += '<div class="reg-slbl' + (done?' done':active?' active':'') + '">' + lbl + '</div>';
      h += '</div>';
      if (i < 3) h += '<div class="reg-sline' + (step > n+1 || (step > n) ? ' done':'') + '"></div>';
    });
    return h + '</div>';
  }

  function xpbarHTML() {
    var pct = Math.min(Math.round(S.xp / MAX_XP * 100), 100);
    var lvl = S.xp >= 200 ? 4 : S.xp >= 125 ? 3 : S.xp >= 50 ? 2 : 1;
    return '<div class="reg-xpbar">' +
      '<div class="reg-xpbar-row">' +
      '<span class="reg-xpbar-lbl">Nivel ' + lvl + ' de Perfil</span>' +
      '<span class="reg-xpbar-val"><span style="color:#2CB67D">' + S.xp + '</span><span style="color:rgba(255,255,255,.25)"> / ' + MAX_XP + ' XP</span></span>' +
      '</div><div class="reg-xpbar-track"><div class="reg-xpbar-fill" style="width:' + pct + '%"></div></div></div>';
  }

  /* ── Paso 1: Identidad ─────────────────────────────────── */
  function step1HTML() {
    var lbl = ACTOR_LABEL[S.actorType] || 'Actor Climático';
    return '<div class="reg-panel active" id="rp1">' +
      '<div><p class="reg-eye">México por el Clima · Registro</p>' +
      '<h2 class="reg-h">Bienvenido, ' + lbl + '</h2>' +
      '<p class="reg-sub">Completa tu perfil para conectar con el ecosistema climático de México.</p></div>' +
      '<div class="reg-logo-wrap">' +
        '<label for="rl-logo" class="reg-logo-drop" id="rl-drop">' +
          '<div id="rl-inner"><div style="display:flex;flex-direction:column;align-items:center;gap:5px">' + IC.camera +
          '<span style="font:700 7px/1 \'League Spartan\',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.2)">Logo</span></div></div>' +
        '</label>' +
        '<input type="file" id="rl-logo" accept="image/*" style="display:none">' +
        '<p class="reg-logo-hint">Arrastra tu logo o haz clic</p>' +
      '</div>' +
      '<div class="reg-field"><label class="reg-lbl">Nombre de la organización</label>' +
        '<input class="reg-in" id="rl-name" type="text" placeholder="Ej. Innovación Verde S.A. de C.V." value="' + (S.orgName||'') + '"></div>' +
      '<div class="reg-banner">' + IC.spark + '<span>+50 XP al completar este paso</span></div>' +
      '<div class="reg-row"><button class="reg-btn-ghost" id="rl-skip">Hacerlo más tarde</button>' +
        '<button class="reg-btn" id="rl-next1">Siguiente →</button></div>' +
    '</div>';
  }

  /* ── Paso 2: Datos del Rol ─────────────────────────────── */
  function step2HTML() {
    var fields = STEP2[S.actorType] || [
      { key:'como', label:'¿Cómo te relacionas con el clima?', type:'text', placeholder:'Describe brevemente tu trabajo' }
    ];
    var lbl = ACTOR_LABEL[S.actorType] || 'Actor';

    var fieldsHtml = fields.map(function(f) {
      var val = S.stepTwoData[f.key] || '';
      if (f.type === 'select') {
        var opts = '<option value="" disabled' + (val===''?' selected':'') + '>Selecciona una opción…</option>';
        opts += f.opts.map(function(o){
          return '<option value="' + o + '"' + (val===o?' selected':'') + '>' + o + '</option>';
        }).join('');
        return '<div class="reg-field"><label class="reg-lbl">' + f.label + '</label>' +
          '<select class="reg-sel" data-key="' + f.key + '">' + opts + '</select></div>';
      }
      return '<div class="reg-field"><label class="reg-lbl">' + f.label + '</label>' +
        '<input class="reg-in" type="text" data-key="' + f.key + '" placeholder="' + (f.placeholder||'') + '" value="' + val + '"></div>';
    }).join('');

    return '<div class="reg-panel active" id="rp2">' +
      '<div><p class="reg-eye">Paso 2 de 4 · ' + lbl + '</p>' +
      '<h2 class="reg-h">Cuéntanos más<br>sobre ti</h2>' +
      '<p class="reg-sub">Esta información personaliza cómo apareces en la red y con quién te conectamos.</p></div>' +
      fieldsHtml +
      '<div class="reg-banner">' + IC.spark + '<span>+75 XP al completar este paso</span></div>' +
      '<div class="reg-row"><button class="reg-btn-sec" id="rl-prev2">← Anterior</button>' +
        '<button class="reg-btn" id="rl-next2">Siguiente →</button></div>' +
    '</div>';
  }

  /* ── Paso 3: Intereses ─────────────────────────────────── */
  function step3HTML() {
    var role = calcRole(S.selectedTags);
    var ct = S.selectedTags.length;
    var ok = ct >= MIN_TAGS;
    var pct = Math.min(ct / MIN_TAGS * 100, 100);
    var roleLabel = ct === 0 ? 'Selecciona al menos 3 temas…' :
                   ct < MIN_TAGS ? 'Elige ' + (MIN_TAGS - ct) + ' más para ver tu rol…' : role.title;

    var chips = ALL_TAGS.map(function(t){
      return '<button class="reg-chip' + (S.selectedTags.indexOf(t)!==-1?' on':'') + '" data-tag="' + t + '">' + t + '</button>';
    }).join('');

    return '<div class="reg-panel active" id="rp3">' +
      '<div><p class="reg-eye">Paso 3 de 4 · Intereses</p>' +
      '<h2 class="reg-h">¿En qué temas<br>te enfocas?</h2>' +
      '<p class="reg-sub">Elige los que mejor representan tu trabajo. Esto define tu rol en la red.</p></div>' +
      '<div class="reg-chips" id="rl-chips">' + chips + '</div>' +
      '<div class="reg-role-card" id="rl-rolecard" style="background:' + (ok?role.glow:'rgba(0,0,0,.3)') + ';border-color:' + (ok?role.color+'40':'rgba(255,255,255,.08)') + '">' +
        '<div><p class="reg-role-eye">Tu rol en la red</p>' +
        '<p class="reg-role-name" id="rl-rolename" style="color:' + (ok?role.color:'rgba(255,255,255,.4)') + '">' + roleLabel + '</p></div>' +
        '<span class="reg-role-ct" id="rl-rolect" style="color:' + (ok?role.color:'rgba(255,255,255,.22)') + '">' + ct + ' sel.</span>' +
      '</div>' +
      '<div class="reg-tagprog"><div class="reg-tagprog-row"><span>Temas seleccionados</span><span>' + ct + ' / mín. ' + MIN_TAGS + '</span></div>' +
        '<div class="reg-tagprog-track"><div id="rl-tagfill" class="reg-tagprog-fill" style="width:' + pct + '%;background:' + (ok?role.color:'rgba(255,255,255,.2)') + ';' + (ok?'box-shadow:0 0 8px '+role.shadow+';':'') + '"></div></div>' +
      '</div>' +
      '<div class="reg-banner">' + IC.spark + '<span>+50 XP al completar este paso</span></div>' +
      '<div class="reg-row"><button class="reg-btn-sec" id="rl-prev3">← Anterior</button>' +
        '<button class="reg-btn" id="rl-next3"' + (ok?'':' disabled') + '>Siguiente →</button></div>' +
    '</div>';
  }

  /* ── Paso 4: Ubicación ─────────────────────────────────── */
  function step4HTML() {
    var hasLoc = S.locationName.trim().length > 0;
    var dots = [[32,45,4],[55,38,6],[70,55,3],[45,62,5],[20,30,3],[80,40,4],[60,70,3],[38,72,5],[50,28,3]].map(function(d){
      return '<div style="position:absolute;left:'+d[0]+'%;top:'+d[1]+'%;width:'+d[2]+'px;height:'+d[2]+'px;background:rgba(44,182,125,.45);border-radius:50%;box-shadow:0 0 5px rgba(44,182,125,.3);transform:translate(-50%,-50%)"></div>';
    }).join('');

    return '<div class="reg-panel active" id="rp4">' +
      '<div><p class="reg-eye">Paso 4 de 4 · Ubicación</p>' +
      '<h2 class="reg-h">Ubica tu impacto<br>en el mapa</h2>' +
      '<p class="reg-sub">¿Dónde opera principalmente tu organización?</p></div>' +
      '<div class="reg-field"><label class="reg-lbl">Ciudad, estado o región</label>' +
        '<div class="reg-search-wrap"><span class="reg-search-ic">' + IC.search + '</span>' +
        '<input class="reg-in" id="rl-loc" type="text" placeholder="Ej. Ciudad de México, CDMX" value="' + (S.locationName||'') + '"></div></div>' +
      '<div class="reg-map">' +
        '<svg style="position:absolute;inset:0;width:100%;height:100%;opacity:.05"><defs><pattern id="rg" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0L0 0 0 28" fill="none" stroke="rgba(255,255,255,1)" stroke-width=".5"/></pattern></defs><rect width="100%" height="100%" fill="url(#rg)"/></svg>' +
        '<svg style="position:absolute;inset:0;width:100%;height:100%;opacity:.04"><ellipse cx="50%" cy="50%" rx="38%" ry="26%" fill="none" stroke="rgba(44,182,125,1)" stroke-width="1"/><ellipse cx="50%" cy="50%" rx="55%" ry="38%" fill="none" stroke="rgba(44,182,125,1)" stroke-width=".6"/></svg>' +
        '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(44,182,125,.05) 0%,transparent 65%)"></div>' +
        dots +
        '<div class="reg-map-pin' + (hasLoc?'':' hide') + '" id="rl-pin"><div class="reg-map-pin-c">' + IC.mappin + '</div><div class="reg-map-pin-s"></div></div>' +
        '<div class="reg-map-lbl">México · Vista territorial</div>' +
      '</div>' +
      '<div class="reg-banner">' + IC.spark + '<span>+100 XP al completar tu perfil</span></div>' +
      '<div class="reg-row"><button class="reg-btn-sec" id="rl-prev4">← Anterior</button>' +
        '<button class="reg-btn" id="rl-complete">' + IC.check + ' Completar perfil</button></div>' +
    '</div>';
  }

  /* ── Paso 5: Success ───────────────────────────────────── */
  function step5HTML() {
    var r = S.role, pct = Math.round(S.xp / MAX_XP * 100);
    return '<div class="reg-panel active" id="rp5">' +
      '<div class="reg-success">' +
        '<div class="reg-sicon">' +
          '<div class="reg-sglow" style="background:radial-gradient(circle,'+r.glow+' 0%,transparent 70%)"></div>' +
          '<div class="reg-spulse" style="border-color:'+r.color+'45"></div>' +
          '<div class="reg-sbadge" style="background:'+r.glow+';border:1.5px solid '+r.color+'55;box-shadow:0 0 28px '+r.shadow+',0 0 55px '+r.shadow+'">' +
            '<span style="color:'+r.color+'">'+r.svg+'</span>' +
          '</div>' +
        '</div>' +
        '<div><p class="reg-sovl">¡Perfil completado!</p>' +
          '<p class="reg-ssub">Tu rol en la red</p>' +
          '<h2 class="reg-srole" style="color:'+r.color+'">'+r.title+'</h2></div>' +
        '<div class="reg-stats">' +
          '<div class="reg-stat"><span class="reg-stat-v" style="color:'+r.color+'">'+S.xp+'</span><span class="reg-stat-l">Total XP</span></div>' +
          '<div class="reg-stat"><span class="reg-stat-v" style="color:'+r.color+'">'+pct+'%</span><span class="reg-stat-l">Perfil</span></div>' +
          '<div class="reg-stat"><span class="reg-stat-v" style="color:'+r.color+'">'+S.selectedTags.length+'</span><span class="reg-stat-l">Intereses</span></div>' +
        '</div>' +
        '<div style="width:100%;display:flex;flex-direction:column;gap:9px">' +
          '<button class="reg-btn reg-btn-full" id="rl-cta1">'+IC.users+' Conectar con el ecosistema →</button>' +
          '<button class="reg-btn-sec reg-btn-full" id="rl-cta2" style="width:100%">'+IC.map+' Explorar el mapa territorial</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER + DOM
  ═══════════════════════════════════════════════════════════ */
  var overlay, card;

  function injectHTML() {
    if (document.getElementById('mpc-reg-overlay')) {
      overlay = document.getElementById('mpc-reg-overlay');
      card    = document.getElementById('mpc-reg-card');
      return;
    }
    overlay = document.createElement('div');
    overlay.id = 'mpc-reg-overlay';
    overlay.innerHTML =
      '<div id="mpc-reg-backdrop">' +
        '<div id="mpc-reg-bg-img"></div>' +
        '<div id="mpc-reg-bg-dark"></div>' +
      '</div>' +
      '<div id="mpc-reg-card"></div>';
    document.body.appendChild(overlay);
    card = overlay.querySelector('#mpc-reg-card');
    overlay.querySelector('#mpc-reg-bg-dark').addEventListener('click', function(){
      if (S.step < 5) closeWizard();
    });
  }

  function render(back) {
    if (!card) return;
    var isSuccess = S.step === 5;
    var h = '';
    if (!isSuccess) { h += xpbarHTML(); h += stepperHTML(S.step); }
    h += ([step1HTML,step2HTML,step3HTML,step4HTML,step5HTML][S.step - 1])();
    if (!isSuccess) h += '<button id="mpc-reg-close">' + IC.close + '</button>';
    card.innerHTML = h;
    card.style.maxWidth = isSuccess ? '25rem' : '29rem';
    if (back) {
      var panel = card.querySelector('.reg-panel.active');
      if (panel) { panel.classList.add('back'); }
    }
    bindEvents();
  }

  function bindEvents() {
    /* cerrar */
    var cl = document.getElementById('mpc-reg-close');
    if (cl) cl.addEventListener('click', closeWizard);

    /* paso 1 */
    var nm = document.getElementById('rl-name');
    if (nm) nm.addEventListener('input', function(e){ S.orgName = e.target.value; });
    var drop = document.getElementById('rl-drop'), logo = document.getElementById('rl-logo');
    if (logo) logo.addEventListener('change', function(e){ handleLogo(e.target.files[0]); });
    if (drop) {
      drop.addEventListener('dragover', function(e){ e.preventDefault(); drop.classList.add('over'); });
      drop.addEventListener('dragleave', function(){ drop.classList.remove('over'); });
      drop.addEventListener('drop', function(e){ e.preventDefault(); drop.classList.remove('over'); handleLogo(e.dataTransfer.files[0]); });
    }
    q('rl-skip',  function(){ goNext(); });
    q('rl-next1', function(){ goNext(); });

    /* paso 2 */
    card.querySelectorAll('[data-key]').forEach(function(el){
      el.addEventListener('change', function(e){ S.stepTwoData[e.target.dataset.key] = e.target.value; });
      el.addEventListener('input',  function(e){ S.stepTwoData[e.target.dataset.key] = e.target.value; });
    });
    q('rl-prev2', goBack);
    q('rl-next2', function(){ goNext(); });

    /* paso 3 */
    var chips = document.getElementById('rl-chips');
    if (chips) chips.addEventListener('click', function(e){
      var chip = e.target.closest('.reg-chip');
      if (!chip) return;
      var tag = chip.dataset.tag, idx = S.selectedTags.indexOf(tag);
      if (idx === -1) S.selectedTags.push(tag); else S.selectedTags.splice(idx,1);
      updateChips();
    });
    q('rl-prev3', goBack);
    q('rl-next3', function(){ if(S.selectedTags.length >= MIN_TAGS) goNext(); });

    /* paso 4 */
    var loc = document.getElementById('rl-loc');
    if (loc) loc.addEventListener('input', function(e){
      S.locationName = e.target.value;
      var pin = document.getElementById('rl-pin');
      if (pin) pin.classList.toggle('hide', e.target.value.trim().length === 0);
    });
    q('rl-prev4',    goBack);
    q('rl-complete', function(){ goNext(); });

    /* success */
    q('rl-cta1', finish);
    q('rl-cta2', finish);
  }

  function q(id, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }

  function handleLogo(file) {
    if (!file || !file.type.startsWith('image/')) return;
    var url = URL.createObjectURL(file);
    var inner = document.getElementById('rl-inner');
    if (inner) inner.innerHTML = '<img src="' + url + '" style="width:84px;height:84px;object-fit:cover;border-radius:50%">';
  }

  function updateChips() {
    var ct = S.selectedTags.length, ok = ct >= MIN_TAGS;
    var role = calcRole(S.selectedTags);
    var pct = Math.min(ct / MIN_TAGS * 100, 100);

    document.querySelectorAll('.reg-chip').forEach(function(c){
      c.classList.toggle('on', S.selectedTags.indexOf(c.dataset.tag) !== -1);
    });
    var rc = document.getElementById('rl-rolecard');
    var rn = document.getElementById('rl-rolename');
    var rt = document.getElementById('rl-rolect');
    var fill = document.getElementById('rl-tagfill');
    var nb = document.getElementById('rl-next3');

    if (rc) { rc.style.background = ok ? role.glow : 'rgba(0,0,0,.3)'; rc.style.borderColor = ok ? role.color+'40' : 'rgba(255,255,255,.08)'; }
    if (rn) { rn.textContent = ct===0?'Selecciona al menos 3 temas…':ct<MIN_TAGS?'Elige '+(MIN_TAGS-ct)+' más para ver tu rol…':role.title; rn.style.color = ok?role.color:'rgba(255,255,255,.4)'; }
    if (rt) { rt.textContent = ct + ' sel.'; rt.style.color = ok?role.color:'rgba(255,255,255,.22)'; }
    if (fill) { fill.style.width=pct+'%'; fill.style.background=ok?role.color:'rgba(255,255,255,.2)'; fill.style.boxShadow=ok?'0 0 8px '+role.shadow:'none'; }
    if (nb)  nb.disabled = !ok;
    S.role = role;
  }

  /* ── Navegación ─────────────────────────────────────────── */
  function goNext() {
    S.xp = Math.min(S.xp + (XP_PER_STEP[S.step] || 0), MAX_XP);
    if (S.step === 3) S.role = calcRole(S.selectedTags);
    S.step++;
    render(false);
  }
  function goBack() { if (S.step > 1) { S.step--; render(true); } }
  function finish() { closeWizard(); if (S.onComplete) S.onComplete(); }
  function closeWizard() { overlay.classList.remove('is-open'); }

  /* ── Show ───────────────────────────────────────────────── */
  function show() {
    if (!overlay) injectHTML();
    render(false);
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ overlay.classList.add('is-open'); });
    });
  }

  /* ── Init ───────────────────────────────────────────────── */
  injectCSS();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHTML);
  } else {
    injectHTML();
  }

  /* ── API pública ────────────────────────────────────────── */
  window.MPC_REGISTRO = {
    open: function(actorType, onComplete) {
      S.actorType = actorType || '';
      S.onComplete = onComplete || null;
      S.step = 1; S.xp = 0;
      S.orgName = ''; S.stepTwoData = {};
      S.selectedTags = []; S.locationName = '';
      S.role = ROLES.pionero;
      show();
    }
  };

})();
