import React from 'react'
import { motion } from 'framer-motion'
import { useOnboardingStore } from '../store/useOnboardingStore'

export default function TopBar() {
  const { xp, profileLevel, MAX_XP } = useOnboardingStore()
  const pct = Math.min(Math.round((xp / MAX_XP) * 100), 100)

  return (
    <div className="mb-4 px-0.5">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-display text-[9px] font-bold tracking-[0.14em] uppercase text-white/35">
          Nivel de Perfil {profileLevel}
        </span>
        <span className="font-display text-[10px] font-semibold tabular-nums">
          <span style={{ color: '#2CB67D' }}>{xp}</span>
          <span className="text-white/25"> / {MAX_XP} XP</span>
        </span>
      </div>
      <div className="h-[3px] bg-white/[0.07] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{
            background: 'linear-gradient(90deg, #2CB67D 0%, #3A9E9E 100%)',
            boxShadow: '0 0 10px rgba(44, 182, 125, 0.5)',
          }}
        />
      </div>
    </div>
  )
}
