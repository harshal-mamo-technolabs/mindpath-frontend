/**
 * Audio-plan API.
 *
 * A daily-audio plan is generated server-side inside the report POST (first
 * attempt only, and only when the assessment has audio clips), so by the time
 * the user reaches /audio it already exists. All routes require auth (the JWT
 * is attached automatically by api.js).
 *
 * Plan shape: { id, archetype, welcomeScript, welcomeAudioUrl, status,
 * durationDays, days: [{ day, title, focus, reason, completed, completedAt,
 * session: { _id, title, audioUrl, durationSeconds, category } }] }.
 *
 * The plan may not exist (later attempt / no clips / generation failed) — the
 * list then comes back empty, which callers handle as an empty state.
 */
import { apiGet, apiPost } from './api.js'

/** All of the user's plans, newest first. */
export const getAudioPlans = () => apiGet('/api/audio-plans')

/** The plan for one assessment (by assessment id), or undefined if none. */
export const getAudioPlanForAssessment = (assessmentId) =>
  apiGet(`/api/audio-plans?assessment=${encodeURIComponent(assessmentId)}`)

/** One plan by its id. */
export const getAudioPlan = (id) => apiGet(`/api/audio-plans/${id}`)

/**
 * Mark day `day` (1…durationDays) complete. Idempotent — re-completing keeps
 * the original completedAt. Resolves to the updated, populated plan. When every
 * day is done the plan's status flips to 'completed' server-side.
 */
export const completeAudioDay = (planId, day) =>
  apiPost(`/api/audio-plans/${planId}/days/${day}/complete`)
