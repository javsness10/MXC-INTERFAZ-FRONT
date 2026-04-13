import React from 'react'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '../store/useOnboardingStore'

const ALL_TAGS = [
  // Energía
  'Energía solar', 'Energía eólica', 'Energía geotérmica', 'Tecnología verde',
  // Ecosistemas
  'Reforestación', 'Biodiversidad', 'Océanos y costas', 'Suelos y agricultura',
  // Urbano
  'Ciudades sostenibles', 'Movilidad limpia', 'Industria verde', 'Gestión de residuos',
  // Estrategia
  'Finanzas climáticas', 'Política climática', 'Carbono y MRV', 'Adaptación climática',
  // Social
  'Agua y cuencas', 'Educación ambiental', 'Gobernanza climática',
  'Innovación y startups', 'Comunidades indígenas', 'Género y clima',
]

const MIN_TAGS = 3

export default function StepIntereses() {
  const { selectedTags, toggleTag, finalNetworkRole, nextStep, prevStep } = useOnboardingStore()

  const count = selectedTags.length
  const pct = Math.min((count / MIN_TAGS) * 100, 100)
  const canProceed = count >= MIN_TAGS

  // Role feedback label
  const roleLabel =
    count === 0
      ? 'Selecciona al menos 3 temas…'
      : count < MIN_TAGS
      ? `Selecciona ${MIN_TAGS - count} más…`
      : finalNetworkRole.title

  return (
    <div className="flex flex-col gap-5">
      {/* Title */}
      <div>
        <p className="font-display text-[10px] font-bold tracking-[0.16em] uppercase text-white/32 mb-1">
          Paso 3 de 4
        </p>
        <h2 className="font-display text-[22px] font-bold text-white/95 tracking-tight leading-tight">
          ¿En qué temas te enfocas?
        </h2>
        <p className="text-[12px] text-white/38 mt-1">
          Elige los que más se alineen con tu trabajo.
        </p>
      </div>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-2">
        {ALL_TAGS.map((tag) => {
          const active = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`reg-chip ${active ? 'reg-chip--active' : ''}`}
            >
              {tag}
            </button>
          )
        })}
      </div>

      {/* Role feedback card */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300"
        style={{
          background: canProceed ? finalNetworkRole.glowColor : 'rgba(255,255,255,0.04)',
          borderColor: canProceed
            ? `${finalNetworkRole.color}40`
            : 'rgba(255,255,255,0.08)',
        }}
      >
        <div>
          <p
            className="font-display text-[9px] font-bold tracking-[0.12em] uppercase mb-0.5"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Tu rol
          </p>
          <p
            className="font-display text-[13px] font-bold transition-colors duration-300"
            style={{
              color: canProceed ? finalNetworkRole.color : 'rgba(255,255,255,0.45)',
            }}
          >
            {roleLabel}
          </p>
        </div>
        <span
          className="font-display text-[12px] font-bold tabular-nums"
          style={{ color: canProceed ? finalNetworkRole.color : 'rgba(255,255,255,0.28)' }}
        >
          {count} sel.
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.32)' }}>
            Progreso de selección
          </span>
          <span
            className="font-display text-[10px] font-bold tabular-nums"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {count} / mín. {MIN_TAGS}
          </span>
        </div>
        <div
          className="h-[3px] rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              background: canProceed
                ? `linear-gradient(90deg, ${finalNetworkRole.color}, ${finalNetworkRole.color}bb)`
                : 'rgba(255,255,255,0.25)',
              boxShadow: canProceed ? `0 0 8px ${finalNetworkRole.shadowColor}` : 'none',
            }}
          />
        </div>
      </div>

      {/* XP Banner */}
      <div className="reg-xp-banner">
        <Sparkles size={14} style={{ color: '#2CB67D', flexShrink: 0 }} />
        <span className="text-[11px] font-semibold" style={{ color: '#2CB67D' }}>
          +50 XP al completar este paso
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-1">
        <button className="reg-btn-secondary" onClick={prevStep}>
          ← Anterior
        </button>
        <button
          className="reg-btn-primary flex-1 transition-opacity duration-200"
          style={{ opacity: canProceed ? 1 : 0.38, cursor: canProceed ? 'pointer' : 'not-allowed' }}
          onClick={() => canProceed && nextStep()}
          disabled={!canProceed}
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}
