import React, { useCallback, useState } from 'react'
import { Camera, Sparkles } from 'lucide-react'
import { useOnboardingStore } from '../store/useOnboardingStore'

const ACTOR_LABELS = {
  empresa: 'Empresa',
  'fondo-inversion': 'Fondo de Inversión',
  gobierno: 'Gobierno',
  academia: 'Academia',
  'sociedad-civil': 'Sociedad Civil',
  'emprendimiento-climatico': 'Emprendimiento Climático',
  visitante: 'Visitante',
  administrador: 'Administrador',
}

export default function StepIdentidad() {
  const { actorType, orgName, setOrgName, setLogoPreview, logoPreview, nextStep } =
    useOnboardingStore()
  const [isDragging, setIsDragging] = useState(false)

  const label = ACTOR_LABELS[actorType] || actorType || 'Actor'

  const processFile = useCallback(
    (file) => {
      if (file && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        setLogoPreview(url)
      }
    },
    [setLogoPreview]
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      processFile(e.dataTransfer.files[0])
    },
    [processFile]
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Title */}
      <div>
        <p className="font-display text-[10px] font-bold tracking-[0.16em] uppercase text-white/32 mb-1">
          Bienvenido
        </p>
        <h2 className="font-display text-[26px] font-bold text-white/95 tracking-tight leading-tight">
          {label}
        </h2>
        <p className="text-[12px] text-white/38 mt-1">
          Cuéntanos sobre tu organización para empezar.
        </p>
      </div>

      {/* Logo Upload */}
      <div className="flex flex-col items-center gap-2">
        <input
          type="file"
          id="reg-logo-upload"
          accept="image/*"
          className="hidden"
          onChange={(e) => processFile(e.target.files[0])}
        />
        <label
          htmlFor="reg-logo-upload"
          className="relative w-[88px] h-[88px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden"
          style={{
            border: `2px dashed ${isDragging ? '#2CB67D' : 'rgba(255,255,255,0.18)'}`,
            background: isDragging
              ? 'rgba(44,182,125,0.08)'
              : logoPreview
              ? 'transparent'
              : 'rgba(255,255,255,0.04)',
            boxShadow: isDragging ? '0 0 20px rgba(44,182,125,0.2)' : 'none',
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Camera size={24} style={{ color: 'rgba(255,255,255,0.28)' }} />
              <span
                className="font-display text-[8px] font-bold tracking-[0.1em] uppercase"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                Logo
              </span>
            </div>
          )}
        </label>
        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
          Arrastra tu logo o haz clic para subir
        </p>
      </div>

      {/* Org Name */}
      <div className="reg-field">
        <label className="reg-label">Nombre de la organización</label>
        <input
          type="text"
          className="reg-input"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Ej. Innovación Verde S.A. de C.V."
        />
      </div>

      {/* XP Banner */}
      <div className="reg-xp-banner">
        <Sparkles size={14} style={{ color: '#2CB67D', flexShrink: 0 }} />
        <span className="text-[11px] font-semibold" style={{ color: '#2CB67D' }}>
          +50 XP al completar este paso
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-1">
        <button className="reg-btn-ghost" onClick={nextStep}>
          Hacerlo más tarde
        </button>
        <button className="reg-btn-primary flex-1" onClick={nextStep}>
          Siguiente →
        </button>
      </div>
    </div>
  )
}
