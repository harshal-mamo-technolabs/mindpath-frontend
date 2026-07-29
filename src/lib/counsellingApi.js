/**
 * Voice counselling ("Sol") API — the backend mints a short-lived ElevenLabs signed URL
 * (+ per-session context) that the browser SDK connects to directly; minutes are metered
 * server-side. The JWT is attached automatically by api.js. Browsing topics is public.
 *
 * Topics response: { topics: [{ key, title, blurb, icon, accent, hasReport, canResume,
 *                    wasCutOff, opening }], minutes: { available, planRemaining,
 *                    walletMinutes, billing } | null, languages: ['en',…], pricing:
 *                    { perMinute, currency, minTopup } }
 * me()    → { minutes, pricing, languages, sessions: [{ id, topic, topicTitle, status,
 *             endReason, durationSeconds, minutesBilled, summary, canResume, createdAt }] }
 * session() → one session + its transcript ([{ role, message }])
 * start() → { sessionId, signedUrl, language, opening, dynamicVariables, overrides,
 *             remainingMinutes, maxSessionMinutes }
 * topup() → { credited, requiresPayment, minutes, ... } (MSISDN credits instantly;
 *            Stripe returns a clientSecret to confirm)
 */
import { apiGet, apiPost } from './api.js'

/** Topic catalog + the caller's minutes/languages/pricing (public; richer when signed in). */
export const getCounsellingTopics = () => apiGet('/api/counselling/topics')

/** The user's minutes, pricing, and session history (hanging sessions are closed out here). */
export const getCounsellingMe = () => apiGet('/api/counselling/me')

/** One session in full — summary + transcript. Polled after a call while the summary lands. */
export const getCounsellingSession = (id) => apiGet(`/api/counselling/sessions/${id}`)

/**
 * Start a voice session. Resolves with the signed URL + context for the ElevenLabs SDK.
 * `resumeSessionId` continues one exact past conversation; `resume` just takes the latest
 * one on this topic.
 */
export const startCounsellingSession = ({ topic, language, resume, resumeSessionId }) =>
  apiPost('/api/counselling/sessions', { topic, language, resume, resumeSessionId })

/**
 * Soft end signal — records the conversation id, elapsed seconds, and the transcript the
 * browser collected, so a summary exists even if the post-call webhook is slow or lost.
 */
export const endCounsellingSession = (id, { conversationId, durationSeconds, transcript } = {}) =>
  apiPost(`/api/counselling/sessions/${id}/end`, { conversationId, durationSeconds, transcript })

/** Buy minutes. MSISDN credits instantly; Stripe returns a PaymentIntent clientSecret. */
export const topUpCounselling = ({ minutes }) => apiPost('/api/counselling/topup', { minutes })
