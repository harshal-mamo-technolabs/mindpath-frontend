/**
 * Auth: API calls + a tiny reactive session store.
 *
 * signup/login hit POST /api/auth/* and resolve to `{ token, user }`.
 * The token + user are persisted to localStorage (so the session survives
 * reloads), kept in an in-memory snapshot, and broadcast to subscribers so the
 * UI updates on sign-in/sign-out. The token is also wired into api.js, which
 * attaches it as `Authorization: Bearer <token>` on every request.
 *
 * React components read this via the useAuth() hook (src/hooks/useAuth.js).
 */
import { apiPost, setAuthTokenProvider } from './api.js'

const TOKEN_KEY = 'mp-token'
const USER_KEY = 'mp-user'

// ---------- API ----------

/** Register a new account. `age` must be a number. Resolves to { token, user }. */
export function signup({ name, email, password, gender, age }) {
  return apiPost('/api/auth/signup', { name, email, password, gender, age })
}

/** Authenticate an existing user. Resolves to { token, user }. */
export function login({ email, password }) {
  return apiPost('/api/auth/login', { email, password })
}

// ---------- reactive session store ----------

function readFromStorage() {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    return { token: token || null, user: user || null }
  } catch {
    return { token: null, user: null }
  }
}

// One stable snapshot object, replaced only when the session actually changes
// (required for useSyncExternalStore to avoid re-render loops).
let session = readFromStorage()
const listeners = new Set()
const emit = () => listeners.forEach((cb) => cb())

export function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export const getSession = () => session
export const getToken = () => session.token
export const getUser = () => session.user
export const isAuthenticated = () => Boolean(session.token)

/** Persist + broadcast the `{ token, user }` returned by signup/login. */
export function saveSession({ token, user }) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch {
    /* storage unavailable (private mode, etc.) — keep it in memory for this tab */
  }
  session = { token: token || null, user: user || null }
  emit()
}

/** Sign out: drop the stored token + user and broadcast. */
export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    /* nothing persisted to clear */
  }
  session = { token: null, user: null }
  emit()
}

// Keep other tabs in sync when the session changes in one of them.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === TOKEN_KEY || e.key === USER_KEY) {
      session = readFromStorage()
      emit()
    }
  })
}

// Let api.js read the live token for the Authorization header.
setAuthTokenProvider(() => session.token)
