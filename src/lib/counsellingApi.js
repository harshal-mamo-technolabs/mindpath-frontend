/**
 * Voice counselling ("Sol") API — the backend mints a short-lived ElevenLabs signed URL
 * (+ per-session context) that the browser SDK connects to directly; minutes are metered
 * server-side. The JWT is attached automatically by api.js. Browsing topics is public.
 *
 * Topics response: { topics: [{ key, title, blurb, icon, accent, hasReport, canResume,
 *                    opening }], minutes: { available, planRemaining, walletMinutes,
 *                    billing } | null, languages: ['en',…], pricing: { perMinute, currency,
 *                    minTopup } }
 * start() → { sessionId, signedUrl, language, opening, dynamicVariables, overrides,
 *             remainingMinutes, maxSessionMinutes }
 * topup() → { credited, requiresPayment, minutes, ... } (MSISDN credits instantly;
 *            Stripe returns a clientSecret to confirm)
 */
import { apiGet, apiPost } from './api.js'

/** Topic catalog + the caller's minutes/languages/pricing (public; richer when signed in). */
export const getCounsellingTopics = () => apiGet('/api/counselling/topics')

/** The user's minutes, pricing, and recent sessions. */
export const getCounsellingMe = () => apiGet('/api/counselling/me')

/** Start a voice session. Resolves with the signed URL + context for the ElevenLabs SDK. */
export const startCounsellingSession = ({ topic, language, resume }) =>
  apiPost('/api/counselling/sessions', { topic, language, resume })

/** Soft end signal — records the conversation id + elapsed seconds (webhook is the billing truth). */
export const endCounsellingSession = (id, { conversationId, durationSeconds } = {}) =>
  apiPost(`/api/counselling/sessions/${id}/end`, { conversationId, durationSeconds })

/** Buy minutes. MSISDN credits instantly; Stripe returns a PaymentIntent clientSecret. */
export const topUpCounselling = ({ minutes }) => apiPost('/api/counselling/topup', { minutes })
