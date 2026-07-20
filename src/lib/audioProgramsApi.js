/**
 * Audio-library API — the standalone, purchasable audio programs shown on /audio.
 *
 * This is separate from the AI-generated daily plan (audioApi.js): programs are a
 * catalog you buy individually (or get free). Browsing is public; the JWT is attached
 * automatically when present so responses reflect ownership.
 *
 * Program card:  { id, title, slug, author, description, subDescription, coverText,
 *                  tags, price, currency, isFree, unlocked, clipsCount, totalMinutes }
 * Program detail adds: { freePreviewCount, clips: [{ order, free, locked,
 *                  session: { id, title, durationSeconds, category, tags, audioUrl } }] }
 *
 * start() decides access:
 *   - { free: true, requiresPayment: false }                       → open to all
 *   - { access, requiresPayment: false }                           → already owned / MSISDN free
 *   - { access, requiresPayment: true, clientSecret, amount, currency } → pay, then poll start
 */
import { apiDelete, apiGet, apiPost } from './api.js'

/** All active programs (cards), newest first. */
export const listAudioPrograms = () => apiGet('/api/audio-programs')

/** One program with its track list (by id or slug). */
export const getAudioProgram = (idOrSlug) => apiGet(`/api/audio-programs/${idOrSlug}`)

/** Unlock/purchase a program (or reuse an existing unlock). */
export const startAudioProgram = (idOrSlug) => apiPost(`/api/audio-programs/${idOrSlug}/start`)

/** Play one track — returns its audioUrl (locked tracks 403 without access). */
export const getAudioProgramClip = (idOrSlug, order) =>
  apiGet(`/api/audio-programs/${idOrSlug}/clips/${order}`)

/* ---- "your path" — enrolling owned/free programs and tracking progress ---- */

/** Add a program to the user's path (must be free or unlocked). Idempotent. */
export const addToPath = (idOrSlug) => apiPost(`/api/audio-programs/${idOrSlug}/add`)

/** The user's enrolled programs with progress + playable clips (feeds "Your paths"). */
export const getMyPrograms = () => apiGet('/api/audio-programs/mine')

/** Mark one track of an enrolled program played; resolves to the updated path card. */
export const markProgramPlayed = (idOrSlug, order) =>
  apiPost(`/api/audio-programs/${idOrSlug}/clips/${order}/played`)

/** Remove a program from the user's path. */
export const removeFromPath = (idOrSlug) => apiDelete(`/api/audio-programs/${idOrSlug}/remove`)
