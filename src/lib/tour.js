/**
 * Guided onboarding — a spotlight tour that walks a new arrival across the app.
 *
 * State lives in a tiny external store (the same `useSyncExternalStore` shape as
 * auth.js) so any page can start it and the overlay can live once at the router
 * root without a provider.
 *
 * Targets are given as a LIST of candidate selectors: the app renders a desktop
 * nav and a mobile bottom nav, and a step whose target is missing entirely
 * degrades to a centred card rather than breaking the tour.
 */

const DONE_KEY = 'mp-tour-done'
const PENDING_KEY = 'mp-tour-pending'

/** Chapters group the steps so progress reads as structure, not "3 of 11".
 *  Labels are i18n keys — `tour.chapters.<id>`. */
export const TOUR_CHAPTERS = [{ id: 'report' }, { id: 'plan' }, { id: 'explore' }]

/**
 * Steps — structure only. `path` may be a string or a fn of the context passed
 * to start(). `icon` is a lucide name resolved in the overlay.
 *
 * All copy lives in the translation files under `tour.steps.<id>.*`
 * (title / body / optional tip / optional cta) so the tour follows the language
 * the visitor picked. The overlay resolves those keys from `id` — a step needs
 * no copy fields here, and the product name comes from `{{appName}}` inside the
 * strings rather than being written into any language.
 */
export const TOUR_STEPS = [
  {
    id: 'welcome',
    kind: 'intro',
  },
  {
    id: 'score',
    chapter: 'report',
    icon: 'gauge',
    path: (ctx) => (ctx.scoreId ? `/reports/${ctx.scoreId}` : '/reports'),
    target: ['.srep-snapshot', '.srep-card'],
  },
  {
    id: 'pattern',
    chapter: 'report',
    icon: 'compass',
    target: ['.srep-pattern'],
  },
  {
    id: 'categories',
    chapter: 'report',
    icon: 'bars',
    target: ['.srep-radar-section', '.srep-flow'],
  },
  {
    id: 'plan',
    chapter: 'report',
    icon: 'list',
    target: ['.srep-plan'],
  },
  {
    id: 'audio',
    chapter: 'plan',
    icon: 'headphones',
    path: '/audio',
    target: ['.botnav-item[href="/audio"]', '.nav-links a[href="/audio"]'],
  },
  {
    id: 'assessments',
    chapter: 'explore',
    icon: 'clipboard',
    path: '/assessments',
    target: ['.botnav-item[href="/assessments"]', '.nav-links a[href="/assessments"]'],
  },
  {
    id: 'ebooks',
    chapter: 'explore',
    icon: 'book',
    path: '/ebooks',
    target: ['.botnav-item[href="/ebooks"]', '.nav-links a[href="/ebooks"]'],
  },
  {
    id: 'counselling',
    chapter: 'explore',
    icon: 'heart',
    path: '/counselling',
    target: ['.botnav-item[href="/counselling"]', '.nav-links a[href="/counselling"]'],
  },
  {
    id: 'dashboard',
    chapter: 'explore',
    icon: 'home',
    path: '/dashboard',
    target: ['.botnav-item[href="/dashboard"]', '.nav-links a[href="/dashboard"]'],
  },
  {
    id: 'done',
    kind: 'outro',
    // Returns to the report rather than the audio library: the report is the
    // thing they bought, and it is where the rest of the app makes sense from.
    ctaPath: (ctx) => (ctx.scoreId ? `/reports/${ctx.scoreId}` : '/reports'),
  },
]

/* ------------------------------- the store -------------------------------- */

const read = () => {
  try {
    return localStorage.getItem(DONE_KEY) === '1'
  } catch {
    return false
  }
}

let state = { active: false, index: 0, ctx: {}, completed: read() }
const listeners = new Set()
const emit = () => {
  state = { ...state }
  listeners.forEach((cb) => cb())
}

export const subscribe = (cb) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
export const getTourState = () => state

/** Queue the tour for the next page load — used by the funnel handoff, which
 *  navigates immediately after signing the buyer in. */
export function markTourPending() {
  try {
    localStorage.setItem(PENDING_KEY, '1')
  } catch {
    /* storage unavailable — the tour just won't auto-start */
  }
}

export function consumeTourPending() {
  try {
    const pending = localStorage.getItem(PENDING_KEY) === '1'
    if (pending) localStorage.removeItem(PENDING_KEY)
    return pending && !read()
  } catch {
    return false
  }
}

export function startTour(ctx = {}) {
  state = { ...state, active: true, index: 0, ctx }
  emit()
}

export function endTour({ completed = false } = {}) {
  if (completed) {
    try {
      localStorage.setItem(DONE_KEY, '1')
    } catch {
      /* nothing to persist to */
    }
  }
  state = { ...state, active: false, index: 0, completed: completed || state.completed }
  emit()
}

export function goToStep(index) {
  if (index < 0 || index >= TOUR_STEPS.length) return
  state = { ...state, index }
  emit()
}

export const nextStep = () => {
  if (state.index >= TOUR_STEPS.length - 1) return endTour({ completed: true })
  goToStep(state.index + 1)
}

export const prevStep = () => goToStep(state.index - 1)

/** Resolve a step's path against the context captured at start(). */
export const pathForStep = (step, ctx) =>
  typeof step.path === 'function' ? step.path(ctx || {}) : step.path

/** Same, for the final step's call-to-action destination. */
export const ctaPathForStep = (step, ctx) =>
  typeof step.ctaPath === 'function' ? step.ctaPath(ctx || {}) : step.ctaPath

/** Where a step sits within its chapter, for the "2 of 4" line. Returns the
 *  chapter `id`; the overlay translates it via `tour.chapters.<id>`. */
export function chapterProgress(index) {
  const step = TOUR_STEPS[index]
  if (!step?.chapter) return null
  const siblings = TOUR_STEPS.filter((s) => s.chapter === step.chapter)
  return {
    id: step.chapter,
    position: siblings.indexOf(step) + 1,
    total: siblings.length,
    chapterIndex: TOUR_CHAPTERS.findIndex((c) => c.id === step.chapter),
  }
}
