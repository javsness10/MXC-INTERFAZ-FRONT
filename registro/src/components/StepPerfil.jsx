import React from 'react'
import { Sparkles } from 'lucide-react'
import { useOnboardingStore } from '../store/useOnboardingStore'

// ─── Field configs per actor ──────────────────────────────────────────────────
const FIELDS = {
  empresa: [
    {
      key: 'sector',
      label: 'Sector industrial',
      type: 'select',
      options: ['Manufactura', 'Retail / Consumo', 'Servicios financieros', 'Tecnología',
                'Energía', 'Construcción', 'Agroindustria', 'Transporte', 'Otro'],
    },
    {
      key: 'tamano',
      label: 'Tamaño de la organización',
      type: 'select',
      options: ['Micro (< 10 empleados)', 'Pequeña (10–50)', 'Mediana (51–250)', 'Grande (> 250)'],
    },
  ],
  'fondo-inversion': [
    {
      key: 'tipo_capital',
      label: 'Tipo de capital',
      type: 'select',
      options: ['Seed / Pre-seed', 'Serie A', 'Serie B+', 'Deuda verde', 'Capital de riesgo',
                'Filantrópico / Donación', 'Blended Finance'],
    },
    {
      key: 'ticket',
      label: 'Ticket promedio de inversión',
      type: 'select',
      options: ['< $100K USD', '$100K – $1M USD', '$1M – $10M USD', '> $10M USD'],
    },
  ],
  gobierno: [
    {
      key: 'nivel',
      label: 'Nivel de administración',
      type: 'select',
      options: ['Federal', 'Estatal', 'Municipal / Alcaldía'],
    },
    {
      key: 'area',
      label: 'Área o dependencia',
      type: 'text',
      placeholder: 'Ej. Secretaría de Medio Ambiente',
    },
  ],
  academia: [
    {
      key: 'linea',
      label: 'Línea de investigación principal',
      type: 'select',
      options: ['Cambio climático y adaptación', 'Energías renovables', 'Biodiversidad y ecosistemas',
                'Economía verde y circular', 'Políticas públicas ambientales', 'Oceanografía',
                'Ciencias del suelo', 'Otro'],
    },
    {
      key: 'tipo_inst',
      label: 'Tipo de institución',
      type: 'select',
      options: ['Universidad pública', 'Universidad privada', 'Centro de investigación público',
                'Centro de investigación privado', 'Instituto tecnológico', 'Otro'],
    },
  ],
  'sociedad-civil': [
    {
      key: 'area_impacto',
      label: 'Área principal de impacto',
      type: 'select',
      options: ['Conservación y restauración', 'Educación ambiental', 'Justicia climática',
                'Comunidades vulnerables', 'Biodiversidad', 'Agricultura sostenible', 'Otro'],
    },
    {
      key: 'alcance',
      label: 'Alcance territorial',
      type: 'select',
      options: ['Local (municipio)', 'Estatal', 'Regional (varios estados)', 'Nacional',
                'Internacional'],
    },
  ],
  'emprendimiento-climatico': [
    {
      key: 'etapa',
      label: 'Etapa de desarrollo',
      type: 'select',
      options: ['Idea / Concepto', 'MVP / Prototipo', 'Comercial', 'Escala / Expansión'],
    },
    {
      key: 'modelo',
      label: 'Modelo de negocio',
      type: 'select',
      options: ['B2B', 'B2C', 'B2G', 'Plataforma / Marketplace', 'Hardware / Deep-tech', 'SaaS',
                'Otro'],
    },
  ],
}

const DEFAULT_FIELDS = [
  {
    key: 'descripcion',
    label: '¿Cómo te enteraste de México por el Clima?',
    type: 'text',
    placeholder: 'Redes sociales, un colega, evento…',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function StepPerfil() {
  const { actorType, stepTwoData, setStepTwoField, nextStep, prevStep } = useOnboardingStore()

  const fields = FIELDS[actorType] || DEFAULT_FIELDS

  return (
    <div className="flex flex-col gap-5">
      {/* Title */}
      <div>
        <p className="font-display text-[10px] font-bold tracking-[0.16em] uppercase text-white/32 mb-1">
          Paso 2 de 4
        </p>
        <h2 className="font-display text-[22px] font-bold text-white/95 tracking-tight leading-tight">
          Háblanos un poco más
        </h2>
        <p className="text-[12px] text-white/38 mt-1">
          Para ajustar tu experiencia en el Cerebro IA.
        </p>
      </div>

      {/* Dynamic fields */}
      <div className="flex flex-col gap-4">
        {fields.map((field) => (
          <div key={field.key} className="reg-field">
            <label className="reg-label">{field.label}</label>
            {field.type === 'select' ? (
              <select
                className="reg-select"
                value={stepTwoData[field.key] || ''}
                onChange={(e) => setStepTwoField(field.key, e.target.value)}
              >
                <option value="" disabled>
                  Selecciona una opción…
                </option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="reg-input"
                value={stepTwoData[field.key] || ''}
                onChange={(e) => setStepTwoField(field.key, e.target.value)}
                placeholder={field.placeholder || ''}
              />
            )}
          </div>
        ))}
      </div>

      {/* XP Banner */}
      <div className="reg-xp-banner">
        <Sparkles size={14} style={{ color: '#2CB67D', flexShrink: 0 }} />
        <span className="text-[11px] font-semibold" style={{ color: '#2CB67D' }}>
          +75 XP al completar este paso
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-1">
        <button className="reg-btn-secondary" onClick={prevStep}>
          ← Anterior
        </button>
        <button className="reg-btn-primary flex-1" onClick={nextStep}>
          Siguiente →
        </button>
      </div>
    </div>
  )
}
