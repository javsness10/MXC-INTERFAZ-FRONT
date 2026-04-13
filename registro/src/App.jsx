import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

import { useOnboardingStore } from './store/useOnboardingStore'
import TopBar from './components/TopBar'
import Stepper from './components/Stepper'
import StepIdentidad from './components/StepIdentidad'
import StepPerfil from './components/StepPerfil'
import StepIntereses from './components/StepIntereses'
import StepUbicacion from './components/StepUbicacion'
import SuccessScreen from './components/SuccessScreen'

const STEP_COMPONENTS = {
  1: StepIdentidad,
  2: StepPerfil,
  3: StepIntereses,
  4: StepUbicacion,
  5: SuccessScreen,
}

export default function App({ actorType, onClose, onComplete }) {
  const { step, setActorType, reset } = useOnboardingStore()

  React.useEffect(() => {
    reset()
    setActorType(actorType)
  }, [actorType])

  const StepComponent = STEP_COMPONENTS[step] || SuccessScreen
  const isSuccess = step >= 5

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(4, 5, 4, 0.88)', backdropFilter: 'blur(10px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!isSuccess ? onClose : undefined}
      />

      {/* Card */}
      <motion.div
        className="relative z-10 w-full"
        style={{ maxWidth: isSuccess ? '26rem' : '30rem' }}
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div
          className="reg-glass rounded-[20px] px-6 py-6 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 2rem)' }}
        >
          {/* Close button */}
          {!isSuccess && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.32)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.32)'
              }}
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          )}

          {/* Header (hidden on success) */}
          {!isSuccess && (
            <>
              <TopBar />
              <Stepper />
            </>
          )}

          {/* Step content with animation */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              >
                <StepComponent onComplete={onComplete} onClose={onClose} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
