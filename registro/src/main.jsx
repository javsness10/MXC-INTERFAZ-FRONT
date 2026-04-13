import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// ─── Internal ref to the open function ────────────────────────────────────────
let _openFn = null
const _queue = []

// ─── Root wrapper that exposes the open API ───────────────────────────────────
function RegistroRoot() {
  const [state, setState] = useState({ visible: false, actorType: null })
  const callbackRef = useRef(null)

  const open = useCallback((actorType, onComplete) => {
    callbackRef.current = onComplete || null
    setState({ visible: true, actorType })
  }, [])

  useEffect(() => {
    _openFn = open
    // Flush any queued calls that came before the component mounted
    _queue.forEach(([a, cb]) => open(a, cb))
    _queue.length = 0
  }, [open])

  const handleClose = useCallback(() => {
    setState((s) => ({ ...s, visible: false }))
  }, [])

  const handleComplete = useCallback(() => {
    setState((s) => ({ ...s, visible: false }))
    if (callbackRef.current) {
      callbackRef.current()
      callbackRef.current = null
    }
  }, [])

  if (!state.visible || !state.actorType) return null

  return (
    <App
      actorType={state.actorType}
      onClose={handleClose}
      onComplete={handleComplete}
    />
  )
}

// ─── Mount ────────────────────────────────────────────────────────────────────
function mount() {
  const container = document.getElementById('mpc-registro-root')
  if (!container) {
    console.warn('[MPC Registro] #mpc-registro-root not found in DOM')
    return
  }
  const root = createRoot(container)
  root.render(<RegistroRoot />)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}

// ─── Public API ───────────────────────────────────────────────────────────────
window.MPC_REGISTRO = {
  open(actorType, onComplete) {
    if (_openFn) {
      _openFn(actorType, onComplete)
    } else {
      _queue.push([actorType, onComplete])
    }
  },
}
