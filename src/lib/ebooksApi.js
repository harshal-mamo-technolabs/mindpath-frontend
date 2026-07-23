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
import { ebookLang } from '../i18n/index.js'

// Ebooks ship in English + German editions. The catalogue/detail follow the UI
// language, but only German has its own edition — every other language (en/fr/it)
// reads English (product rule). ebookLang() maps the UI language accordingly.

/** All active ebooks (cards), newest first, in the active edition language. */
export const listEbooks = () => apiGet(`/api/ebooks?language=${ebookLang()}`)

/** One ebook with its table of contents (by id or slug), in the active edition language. */
export const getEbook = (idOrSlug) => apiGet(`/api/ebooks/${idOrSlug}?language=${ebookLang()}`)

/** Unlock/purchase an ebook (or reuse an existing unlock). */
export const startEbook = (idOrSlug) => apiPost(`/api/ebooks/${idOrSlug}/start`)

/** Read one chapter's body (locked chapters 403 without access), in the active edition language. */
export const getEbookChapter = (idOrSlug, order) =>
  apiGet(`/api/ebooks/${idOrSlug}/chapters/${order}?language=${ebookLang()}`)

/**
 * Mark a chapter read (or unread). Requires the book on the shelf. Resolves to
 * { chaptersCount, chaptersRead, progress, readChapters }.
 */
export const markEbookProgress = (idOrSlug, order, read = true) =>
  apiPost(`/api/ebooks/${idOrSlug}/progress`, { order, read })
