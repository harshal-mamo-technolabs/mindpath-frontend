/**
 * Ebook shop API — the ebook catalog shown on /ebooks.
 *
 * Browsing is public; the JWT is attached automatically when present so responses
 * reflect ownership (`unlocked`) and owned books return every chapter body.
 *
 * Card:   { _id, title, slug, author, subtitle, description, subDescription, coverText,
 *           category, tags, pages, readMinutes, cost, currency, isFree, unlocked,
 *           chaptersCount }
 * Detail adds: { freeChapterCount, chapters: [{ _id, order, title, free, locked, body }] }
 *
 * start() decides access:
 *   - { free: true, requiresPayment: false }                       → free ebook, open to all
 *   - { access, requiresPayment: false }                           → covered by plan / MSISDN
 *   - { access, requiresPayment: true, clientSecret, amount, currency } → pay, then poll start
 */
import { apiGet, apiPost } from './api.js'

/** All active ebooks (cards), newest first. */
export const listEbooks = () => apiGet('/api/ebooks')

/** One ebook with its table of contents (by id or slug). */
export const getEbook = (idOrSlug) => apiGet(`/api/ebooks/${idOrSlug}`)

/** Unlock/purchase an ebook (or reuse an existing unlock). */
export const startEbook = (idOrSlug) => apiPost(`/api/ebooks/${idOrSlug}/start`)

/** Read one chapter's body (locked chapters 403 without access). */
export const getEbookChapter = (idOrSlug, order) =>
  apiGet(`/api/ebooks/${idOrSlug}/chapters/${order}`)

/**
 * Mark a chapter read (or unread). Requires the book on the shelf. Resolves to
 * { chaptersCount, chaptersRead, progress, readChapters }.
 */
export const markEbookProgress = (idOrSlug, order, read = true) =>
  apiPost(`/api/ebooks/${idOrSlug}/progress`, { order, read })
