/**
 * Audio-plan API.
 *
 * A daily-audio plan is generated server-side inside the report POST (first
 * attempt only, and only when the assessment has audio clips), so by the time
 * the user reaches /audio it already exists. All routes require auth (the JWT
 * is attached automatically by api.js).
 *
 * Plan shape: { id, archetype, welcomeScript, welcomeAudioUrl, status,
 * durationDays, playedAt: { 'day-0': 'YYYY-MM-DD', ... },
 * days: [{ day, title, focus, reason,
 * session: { _id, title, audioUrl, durationSeconds, category } }] }.
 *
 * `playedAt` is the whole play log — "day-0" is the welcome clip, "day-1".."day-N"
 * the sessions, each mapped to the date it was played. The frontend derives which
 * clip is unlocked from it (next opens once today is past the last played date).
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
 * Record that a clip was played — `day` 0 is the welcome, 1…durationDays the
 * sessions. Stamps today's date into the plan's `playedAt` map. Idempotent (a
 * replay keeps the first date). A new play is gated to the daily pace server-side;
 * a locked clip rejects (ApiError 423) with a "come back tomorrow" message.
 * Resolves to the updated plan.
 */
export const markPlayed = (planId, day) => apiPost(`/api/audio-plans/${planId}/clips/${day}/played`)
