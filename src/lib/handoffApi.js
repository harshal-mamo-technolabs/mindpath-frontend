import { apiPost } from './api.js'

/**
 * Funnel handoff + password reset.
 *
 * These endpoints are public by necessity — the caller has no session yet.
 * `exchangeHandoff` trades a single-use token minted after a landing-page
 * purchase for a normal `{ token, user }` session, plus where to land.
 */
export const exchangeHandoff = (token) => apiPost('/api/funnel/handoff', { token })

export const requestPasswordReset = (email) => apiPost('/api/password-reset/request', { email })

export const confirmPasswordReset = (token, password) =>
  apiPost('/api/password-reset/confirm', { token, password })
