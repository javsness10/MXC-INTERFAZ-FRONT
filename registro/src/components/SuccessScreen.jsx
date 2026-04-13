import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Zap, Leaf, Building2, LineChart, Sprout,
  Users, Map, Check,
} from 'lucide-react'
import { useOnboardingStore } from '../store/useOnboardingStore'

const ICON_MAP = { Zap, Leaf, Building2, LineChart, Sprout }

function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / 40)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(start)
    }, 28)
    return () => clearInterval(timer)
  }, [target])
  return <>{val}{suffix}</>
}

export default function SuccessScreen({ onComplete, onClose }) {
  const { finalNetworkRole, selectedTags, xp } = useOnboardingStore()
  const RoleIcon = ICON_MAP[finalNetworkRole.iconName] || Sprout

  const handleExplore = () => { if (onComplete) onComplete() }
  const handleMap = () => { if (onComplete) onComplete() }

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">

      {/* Hero icon with glow */}
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
      >
        {/* Outer glow ring */}
        <div
          className="absolute w-32 h-32 rounded-full"
          style={{
            background: `radial-gradient(circle, ${finalNetworkRole.glowColor} 0%, transparent 70%)`,
            filter: 'blur(12px)',
          }}
        />
        {/* Pulse ring */}
        <motion.div
          className="absolute w-24 h-24 rounded-full border"
          style={{ borderColor: `${finalNetworkRole.color}40` }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Icon badge */}
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(145deg, ${finalNetworkRole.color}22, ${finalNetworkRole.color}0a)`,
            border: `1.5px solid ${finalNetworkRole.color}50`,
            boxShadow: `0 0 32px ${finalNetworkRole.shadowColor}, 0 0 64px ${finalNetworkRole.shadowColor}`,
          }}
        >
          <RoleIcon size={36} style={{ color: finalNetworkRole.color }} strokeWidth={1.6} />
        </div>
      </motion.div>

      {/* Overline + Title */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <p
          className="font-display text-[10px] font-bold tracking-[0.2em] uppercase mb-1"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          ¡Perfil completado!
        </p>
        <p
          className="font-display text-[11px] font-bold tracking-[0.1em] uppercase mb-2"
          style={{ color: 'rgba(255,255,255,0.28)' }}
        >
          Tu rol en la red
        </p>
        <h2
          className="font-display text-[28px] font-bold tracking-tight leading-tight"
          style={{ color: finalNetworkRole.color }}
        >
          {finalNetworkRole.title}
        </h2>
      </motion.div>

      {/* Stats card */}
      <motion.div
        className="w-full rounded-2xl"
        style={{
          background: 'linear-gradient(165deg, rgba(38,38,40,0.65) 0%, rgba(20,20,22,0.75) 100%)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.45 }}
      >
        <div className="flex items-stretch divide-x" style={{ divideColor: 'rgba(255,255,255,0.07)' }}>
          {[
            { value: xp, suffix: ' XP', label: 'Total' },
            { value: Math.round((xp / 275) * 100), suffix: '%', label: 'Perfil' },
            { value: selectedTags.length, suffix: '', label: 'Intereses' },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex-1 py-4 flex flex-col items-center gap-0.5"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <span
                className="font-display text-[22px] font-bold tabular-nums leading-none"
                style={{ color: finalNetworkRole.color }}
              >
                <Counter target={stat.value} suffix={stat.suffix} />
              </span>
              <span
                className="font-display text-[9px] font-bold tracking-[0.1em] uppercase"
                style={{ color: 'rgba(255,255,255,0.32)' }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        className="w-full flex flex-col gap-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.45 }}
      >
        <button
          className="reg-btn-primary w-full flex items-center justify-center gap-2"
          onClick={handleExplore}
        >
          <Users size={15} strokeWidth={2} />
          Conectar con el ecosistema →
        </button>
        <button
          className="reg-btn-secondary w-full flex items-center justify-center gap-2"
          onClick={handleMap}
        >
          <Map size={14} strokeWidth={2} />
          Explorar el mapa territorial
        </button>
      </motion.div>

    </div>
  )
}
