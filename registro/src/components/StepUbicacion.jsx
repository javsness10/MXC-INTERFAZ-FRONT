import React from 'react'
import { Search, MapPin, Sparkles, Check } from 'lucide-react'
import { useOnboardingStore } from '../store/useOnboardingStore'

// Mock map dots data
const DOTS = [
  { x: '32%', y: '45%', size: 4 }, { x: '55%', y: '38%', size: 6 },
  { x: '70%', y: '55%', size: 3 }, { x: '45%', y: '60%', size: 5 },
  { x: '20%', y: '30%', size: 3 }, { x: '80%', y: '40%', size: 4 },
  { x: '60%', y: '70%', size: 3 }, { x: '38%', y: '72%', size: 5 },
]

function MockMap({ active }) {
  return (
    <div
      className="relative w-full h-44 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(165deg, #0a1a12 0%, #081510 50%, #060e0b 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.07 }}>
        <defs>
          <pattern id="reg-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#reg-grid)" />
      </svg>

      {/* Contour lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.06 }}>
        <ellipse cx="50%" cy="50%" rx="38%" ry="25%" fill="none" stroke="rgba(44,182,125,0.8)" strokeWidth="1" />
        <ellipse cx="50%" cy="50%" rx="52%" ry="36%" fill="none" stroke="rgba(44,182,125,0.8)" strokeWidth="0.7" />
        <ellipse cx="50%" cy="50%" rx="65%" ry="46%" fill="none" stroke="rgba(44,182,125,0.8)" strokeWidth="0.5" />
      </svg>

      {/* Green ambient glow */}
      <div
        className="absolute"
        style={{
          top: '20%', left: '30%', right: '30%', bottom: '20%',
          background: 'radial-gradient(ellipse, rgba(44,182,125,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Data dots */}
      {DOTS.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: d.x, top: d.y,
            width: d.size, height: d.size,
            background: 'rgba(44,182,125,0.55)',
            boxShadow: '0 0 6px rgba(44,182,125,0.4)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Active pin */}
      {active && (
        <div
          className="absolute flex flex-col items-center"
          style={{ left: '50%', top: '45%', transform: 'translate(-50%, -100%)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #2CB67D, #3A9E9E)',
              boxShadow: '0 0 18px rgba(44,182,125,0.55)',
              border: '2px solid rgba(255,255,255,0.25)',
            }}
          >
            <MapPin size={14} color="white" />
          </div>
          <div
            className="w-0.5 h-3"
            style={{ background: 'rgba(44,182,125,0.6)' }}
          />
        </div>
      )}

      {/* Label */}
      <div className="absolute bottom-3 left-3">
        <span
          className="font-display text-[8px] font-bold tracking-[0.1em] uppercase"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          México · Vista territorial
        </span>
      </div>
    </div>
  )
}

export default function StepUbicacion() {
  const { locationName, setLocationName, nextStep, prevStep } = useOnboardingStore()
  const hasLocation = locationName.trim().length > 0

  return (
    <div className="flex flex-col gap-5">
      {/* Title */}
      <div>
        <p className="font-display text-[10px] font-bold tracking-[0.16em] uppercase text-white/32 mb-1">
          Paso 4 de 4
        </p>
        <h2 className="font-display text-[22px] font-bold text-white/95 tracking-tight leading-tight">
          Ubica tu impacto en el mapa
        </h2>
        <p className="text-[12px] text-white/38 mt-1">
          ¿Dónde opera principalmente tu organización?
        </p>
      </div>

      {/* Search input */}
      <div className="reg-field">
        <label className="reg-label">Buscar ubicación</label>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'rgba(255,255,255,0.28)' }}
          />
          <input
            type="text"
            className="reg-input pl-8"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Ciudad, estado o región…"
          />
        </div>
      </div>

      {/* Mock Map */}
      <MockMap active={hasLocation} />

      {/* Location name */}
      <div className="reg-field">
        <label className="reg-label">Nombre de la ubicación</label>
        <input
          type="text"
          className="reg-input"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="Ej. Guadalajara, Jalisco"
        />
      </div>

      {/* XP Banner */}
      <div className="reg-xp-banner">
        <Sparkles size={14} style={{ color: '#2CB67D', flexShrink: 0 }} />
        <span className="text-[11px] font-semibold" style={{ color: '#2CB67D' }}>
          +100 XP al completar el perfil
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-1">
        <button className="reg-btn-secondary" onClick={prevStep}>
          ← Anterior
        </button>
        <button
          className="reg-btn-primary flex-1 flex items-center justify-center gap-2"
          onClick={nextStep}
        >
          <Check size={15} strokeWidth={2.5} />
          Completar perfil
        </button>
      </div>
    </div>
  )
}
