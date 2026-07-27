/* ===== Brand =====
   Single source of truth for the product name. Set VITE_APP_NAME in `.env` and the
   whole app rebrands: the nav logo, copy in every language ({{brand}} in the locale
   files), the tab title, push notifications, invite links and generated ebook PDFs.
   Vite inlines env vars at build time — restart `npm run dev` after changing it. */

const env = (key) => (import.meta.env?.[key] || '').trim()

/** Display name, e.g. "MindPath". */
export const APP_NAME = env('VITE_APP_NAME') || 'MindPath'

/** URL/id-safe form, e.g. "mindpath" — used for storage keys, tags and slugs. */
export const APP_SLUG =
  APP_NAME.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'app'

/** Marketing domain used in demo invite links. Override with VITE_APP_DOMAIN. */
export const APP_DOMAIN = env('VITE_APP_DOMAIN') || `${APP_SLUG}.app`

/** The ebook imprint, e.g. "MindPath Press". */
export const APP_PRESS = `${APP_NAME} Press`
