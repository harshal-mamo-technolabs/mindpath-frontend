import { useSyncExternalStore } from 'react'
import { clearSession, getSession, subscribe } from '../lib/auth.js'

const SIGNED_OUT = { token: null, user: null }

/**
 * Read the current auth session. Re-renders on sign-in / sign-out (and when
 * another tab changes it). Returns the user, token, an isAuthenticated flag,
 * and a logout() that clears the session.
 */
export function useAuth() {
  const session = useSyncExternalStore(subscribe, getSession, () => SIGNED_OUT)
  return {
    user: session.user,
    token: session.token,
    isAuthenticated: Boolean(session.token),
    logout: clearSession,
  }
}
