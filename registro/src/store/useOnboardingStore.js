import { create } from 'zustand'

// ─── Role Configuration ───────────────────────────────────────────────────────
export const ROLES = {
  energetico: {
    id: 'energetico',
    title: 'Innovador Energético',
    triggerTags: ['Energía solar', 'Energía eólica', 'Tecnología verde'],
    color: '#D97706',
    tailwindText: 'text-amber-500',
    shadowColor: 'rgba(217, 119, 6, 0.45)',
    glowColor: 'rgba(217, 119, 6, 0.15)',
    iconName: 'Zap',
  },
  guardian: {
    id: 'guardian',
    title: 'Guardián de Ecosistemas',
    triggerTags: ['Reforestación', 'Biodiversidad', 'Océanos y costas'],
    color: '#10B981',
    tailwindText: 'text-emerald-500',
    shadowColor: 'rgba(16, 185, 129, 0.45)',
    glowColor: 'rgba(16, 185, 129, 0.15)',
    iconName: 'Leaf',
  },
  urbano: {
    id: 'urbano',
    title: 'Arquitecto Urbano',
    triggerTags: ['Ciudades sostenibles', 'Movilidad limpia', 'Industria verde'],
    color: '#06B6D4',
    tailwindText: 'text-cyan-400',
    shadowColor: 'rgba(6, 182, 212, 0.45)',
    glowColor: 'rgba(6, 182, 212, 0.15)',
    iconName: 'Building2',
  },
  estratega: {
    id: 'estratega',
    title: 'Estratega Climático',
    triggerTags: ['Finanzas climáticas', 'Política climática', 'Carbono y MRV'],
    color: '#8B5CF6',
    tailwindText: 'text-purple-500',
    shadowColor: 'rgba(139, 92, 246, 0.45)',
    glowColor: 'rgba(139, 92, 246, 0.15)',
    iconName: 'LineChart',
  },
  pionero: {
    id: 'pionero',
    title: 'Pionero Climático',
    triggerTags: [],
    color: '#84cc16',
    tailwindText: 'text-lime-400',
    shadowColor: 'rgba(132, 204, 22, 0.45)',
    glowColor: 'rgba(132, 204, 22, 0.15)',
    iconName: 'Sprout',
  },
}

// ─── Role Engine ──────────────────────────────────────────────────────────────
export function calculateRole(selectedTags) {
  if (!selectedTags || selectedTags.length === 0) return ROLES.pionero

  const scores = {}
  for (const [key, role] of Object.entries(ROLES)) {
    if (key === 'pionero') continue
    scores[key] = role.triggerTags.filter((t) => selectedTags.includes(t)).length
  }

  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) return ROLES.pionero

  const winners = Object.entries(scores).filter(([, s]) => s === maxScore)
  if (winners.length > 1) return ROLES.pionero

  return ROLES[winners[0][0]]
}

// ─── XP → Level ──────────────────────────────────────────────────────────────
const MAX_XP = 275
const XP_REWARDS = { 1: 50, 2: 75, 3: 50, 4: 100 }

function toLevel(xp) {
  if (xp >= 200) return 4
  if (xp >= 125) return 3
  if (xp >= 50) return 2
  return 1
}

// ─── Store ────────────────────────────────────────────────────────────────────
const INITIAL = {
  actorType: null,
  step: 1,
  xp: 0,
  profileLevel: 1,
  finalNetworkRole: ROLES.pionero,
  // Step 1
  orgName: '',
  logoPreview: null,
  // Step 2
  stepTwoData: {},
  // Step 3
  selectedTags: [],
  // Step 4
  locationName: '',
}

export const useOnboardingStore = create((set, get) => ({
  ...INITIAL,

  // ── Setters ──────────────────────────────────────────────────────────────
  setActorType: (type) => set({ actorType: type }),
  setOrgName: (v) => set({ orgName: v }),
  setLogoPreview: (v) => set({ logoPreview: v }),
  setStepTwoField: (key, val) =>
    set((s) => ({ stepTwoData: { ...s.stepTwoData, [key]: val } })),
  setLocationName: (v) => set({ locationName: v }),

  toggleTag: (tag) =>
    set((s) => {
      const tags = s.selectedTags.includes(tag)
        ? s.selectedTags.filter((t) => t !== tag)
        : [...s.selectedTags, tag]
      return { selectedTags: tags, finalNetworkRole: calculateRole(tags) }
    }),

  // ── Navigation ───────────────────────────────────────────────────────────
  nextStep: () => {
    const { step, xp, selectedTags } = get()
    const reward = XP_REWARDS[step] || 0
    const newXp = Math.min(xp + reward, MAX_XP)
    const newLevel = toLevel(newXp)
    const role = step === 3 ? calculateRole(selectedTags) : get().finalNetworkRole

    set({
      step: step + 1,
      xp: newXp,
      profileLevel: newLevel,
      finalNetworkRole: role,
    })
  },

  prevStep: () => {
    const { step } = get()
    if (step > 1) set({ step: step - 1 })
  },

  reset: () => set({ ...INITIAL }),

  MAX_XP,
}))
