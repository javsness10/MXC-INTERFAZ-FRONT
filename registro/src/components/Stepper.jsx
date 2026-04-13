import React from 'react'
import { Check } from 'lucide-react'
import { useOnboardingStore } from '../store/useOnboardingStore'

const LABELS = ['Identidad', 'Perfil', 'Intereses', 'Ubicación']

export default function Stepper() {
  const { step } = useOnboardingStore()

  return (
    <div className="flex items-start mb-5 px-0.5">
      {LABELS.map((label, i) => {
        const n = i + 1
        const done = step > n
        const active = step === n

        return (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-400"
                style={{
                  background: done
                    ? '#2CB67D'
                    : active
                    ? 'rgba(255,255,255,0.08)'
                    : 'transparent',
                  borderColor: done
                    ? '#2CB67D'
                    : active
                    ? 'rgba(255,255,255,0.38)'
                    : 'rgba(255,255,255,0.1)',
                  boxShadow: done
                    ? '0 0 12px rgba(44,182,125,0.35)'
                    : active
                    ? '0 0 0 3px rgba(255,255,255,0.04)'
                    : 'none',
                }}
              >
                {done ? (
                  <Check size={13} color="white" strokeWidth={2.5} />
                ) : (
                  <span
                    className="font-display text-[11px] font-bold"
                    style={{ color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.22)' }}
                  >
                    {n}
                  </span>
                )}
              </div>
              <span
                className="font-display text-[8px] tracking-[0.08em] uppercase font-bold transition-colors duration-300"
                style={{
                  color: done
                    ? '#2CB67D'
                    : active
                    ? 'rgba(255,255,255,0.62)'
                    : 'rgba(255,255,255,0.2)',
                }}
              >
                {label}
              </span>
            </div>

            {i < LABELS.length - 1 && (
              <div
                className="flex-1 h-px mt-3.5 mx-1.5 transition-all duration-500"
                style={{
                  background: step > n ? 'rgba(44,182,125,0.45)' : 'rgba(255,255,255,0.07)',
                }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
