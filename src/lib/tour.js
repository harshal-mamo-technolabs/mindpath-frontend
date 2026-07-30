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

/** Chapters group the steps so progress reads as structure, not "3 of 11". */
export const TOUR_CHAPTERS = [
  { id: 'report', label: 'Your report' },
  { id: 'plan', label: 'Your plan' },
  { id: 'explore', label: 'What else is here' },
]

/**
 * Steps. `path` may be a string or a fn of the context passed to start().
 * `icon` is a lucide name resolved in the overlay.
 */
export const TOUR_STEPS = [
  {
    id: 'welcome',
    kind: 'intro',
    title: 'Welcome to MindPath',
    body: "Your report is ready. Here's a quick look at what's in it and what happens next — about a minute, and you can leave any time.",
  },
  {
    id: 'score',
    chapter: 'report',
    icon: 'gauge',
    path: (ctx) => (ctx.scoreId ? `/reports/${ctx.scoreId}` : '/reports'),
    target: ['.srep-snapshot', '.srep-card'],
    title: 'Your overall load',
    body: 'All five areas blended into one number. Problems push it up, your strengths pull it down — so it moves as you do.',
    tip: 'Retake the check-in any time to see it shift.',
  },
  {
    id: 'pattern',
    chapter: 'report',
    icon: 'compass',
    target: ['.srep-pattern'],
    title: 'The pattern behind it',
    body: 'Your demands measured against your capacity to recover. Where those two sit relative to each other is what names your profile.',
  },
  {
    id: 'categories',
    chapter: 'report',
    icon: 'bars',
    target: ['.srep-radar-section', '.srep-flow'],
    title: 'Where the load sits',
    body: 'Warm bars are stress, green bars are strengths. This is the map of what to work on first.',
  },
  {
    id: 'plan',
    chapter: 'report',
    icon: 'list',
    target: ['.srep-plan'],
    title: 'What to actually do',
    body: 'Each focus area comes with one concrete action. Small enough to fit a real week — that is the whole point.',
  },
  {
    id: 'audio',
    chapter: 'plan',
    icon: 'headphones',
    path: '/audio',
    target: ['.botnav-item[href="/audio"]', '.nav-links a[href="/audio"]'],
    title: 'Your 7-day audio plan',
    body: 'A short guided session each day, chosen for your profile. One unlocks every day — the rhythm is what makes it work.',
    tip: 'Start with day one; it takes three minutes.',
  },
  {
    id: 'assessments',
    chapter: 'explore',
    icon: 'clipboard',
    path: '/assessments',
    target: ['.botnav-item[href="/assessments"]', '.nav-links a[href="/assessments"]'],
    title: 'More check-ins',
    body: 'Sleep, anxiety, focus and emotional intelligence each have their own profile and their own plan.',
  },
  {
    id: 'ebooks',
    chapter: 'explore',
    icon: 'book',
    path: '/ebooks',
    target: ['.botnav-item[href="/ebooks"]', '.nav-links a[href="/ebooks"]'],
    title: 'Guided reading',
    body: 'Short, practical books on the things your report surfaced — read at your own pace.',
  },
  {
    id: 'counselling',
    chapter: 'explore',
    icon: 'heart',
    path: '/counselling',
    target: ['.botnav-item[href="/counselling"]', '.nav-links a[href="/counselling"]'],
    title: 'Someone to talk to',
    body: 'When reading and listening are not enough, you can talk it through — whenever you need it.',
  },
  {
    id: 'dashboard',
    chapter: 'explore',
    icon: 'home',
    path: '/dashboard',
    target: ['.botnav-item[href="/dashboard"]', '.nav-links a[href="/dashboard"]'],
    title: 'Your home base',
    body: 'Progress, streaks and everything you have unlocked, all in one place.',
  },
  {
    id: 'done',
    kind: 'outro',
    title: "That's the tour",
    body: 'Your report is the thing to come back to — it is the map everything else works from. Your audio plan is waiting under Daily audio whenever you are ready to start day one.',
    cta: 'Back to my report',
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

/** Where a step sits within its chapter, for the "2 of 4" line. */
export function chapterProgress(index) {
  const step = TOUR_STEPS[index]
  if (!step?.chapter) return null
  const siblings = TOUR_STEPS.filter((s) => s.chapter === step.chapter)
  const chapter = TOUR_CHAPTERS.find((c) => c.id === step.chapter)
  return {
    label: chapter?.label ?? '',
    position: siblings.indexOf(step) + 1,
    total: siblings.length,
    chapterIndex: TOUR_CHAPTERS.findIndex((c) => c.id === step.chapter),
  }
}
