/**
 * Assessment API (the real take flow).
 *
 * Browsing is public; start/submit/scores require a logged-in user (the JWT is
 * attached automatically by api.js). The universal flow is:
 *
 *   start(idOrSlug)  → decides access (free | requiresPayment | denied/403)
 *     ↳ if payment needed: confirm clientSecret with Stripe.js, then start again
 *   submit(idOrSlug, answers) → scores the attempt
 *
 * `idOrSlug` accepts either the Mongo _id or the slug.
 */
import { apiGet, apiPost } from './api.js'

/** Browse active assessments (public). Resolves to an array. */
export const getAssessments = () => apiGet('/api/assessments')

/** Fetch one assessment by id or slug (public). Includes questions + scale. */
export const getAssessment = (idOrSlug) => apiGet(`/api/assessments/${idOrSlug}`)

/**
 * Begin an attempt. Resolves to one of:
 *  - { access, requiresPayment: false }                       → go straight to submit
 *  - { access, requiresPayment: true, clientSecret, amount, currency } → pay first
 * Throws ApiError(403) when an MSISDN allowance is exhausted (no fallback).
 */
export const startAssessment = (idOrSlug) => apiPost(`/api/assessments/${idOrSlug}/start`)

/**
 * Submit one answer per question. `answers` = [{ questionId, weight }, …].
 * Resolves to the scored result (totalScore, maxScore, percentage,
 * subCategoryScores[]). Retakes within maxAttempts are free.
 */
export const submitAssessment = (idOrSlug, answers) =>
  apiPost(`/api/assessments/${idOrSlug}/submit`, { answers })

/** All of the current user's scores (every attempt), for the reports library. */
export const getScores = () => apiGet('/api/scores')

/** A single score record by id — for the standalone report view. */
export const getScore = (id) => apiGet(`/api/scores/${id}`)

/** The full, stored report JSON for one score (the schema-v2 blob we POSTed). */
export const getScoreReport = (id) => apiGet(`/api/scores/${id}/report`)

/**
 * Persist the full, rendered report (the same content shown on screen / in the
 * PDF) as JSON against a scored attempt. `report` is the object from
 * buildReportJson()/buildBasicReportJson(); it's wrapped as { report } and the
 * JWT is attached automatically by api.js.
 */
export const sendScoreReport = (scoreId, report) =>
  apiPost(`/api/scores/${scoreId}/report`, { report })
