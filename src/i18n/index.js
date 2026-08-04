/**
 * i18n engine (react-i18next). Four languages — English, German, French, Italian —
 * with English as the fallback for any missing key. The choice persists to
 * localStorage (`mp-lang`), syncs `<html lang>`, and is pushed to api.js so every
 * backend request carries an `Accept-Language` header (the backend localizes content
 * and falls back to English). Translation strings live in ./locales/<lng>.json.
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import de from './locales/de.json'
import fr from './locales/fr.json'
import it from './locales/it.json'
import { setLanguageProvider } from '../lib/api.js'
import { APP_NAME } from '../lib/brand.js'

export const LANGS = ['en', 'de', 'fr', 'it']
export const LANG_NAMES = { en: 'English', de: 'Deutsch', fr: 'Français', it: 'Italiano' }

const stored = (() => {
  try {
    return localStorage.getItem('mp-lang')
  } catch {
    return null
  }
})()
const initial = LANGS.includes(stored) ? stored : 'en'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
    fr: { translation: fr },
    it: { translation: it },
  },
  lng: initial,
  fallbackLng: 'en',
  supportedLngs: LANGS,
  // `appName` is available to every string as {{appName}} without passing it at the
  // call site — that's how the product name stays env-driven across all languages.
  interpolation: { escapeValue: false, defaultVariables: { appName: APP_NAME } },
  returnEmptyString: false, // empty string → fall back to English
})

// Keep the document + storage in sync, and let api.js read the current language.
const applyLang = (lng) => {
  try {
    localStorage.setItem('mp-lang', lng)
  } catch {
    /* storage blocked — non-fatal */
  }
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', lng)
    // Localize the browser-tab title (the static index.html title is English-only).
    document.title = i18n.t('meta.title', { defaultValue: `${APP_NAME} — Your mind has a path` })
  }
}
applyLang(i18n.language)
i18n.on('languageChanged', applyLang)
setLanguageProvider(() => i18n.language || 'en')

/**
 * Adopt a language chosen on another origin.
 *
 * The landing page persists the visitor's choice under the same `mp-lang` key this app
 * uses, but it runs on a different host, so localStorage never reaches us. The handoff
 * exchange returns the language instead and this applies it — `applyLang` above then
 * stores it, so the rest of the session and every later visit stay in that language.
 * Ignores anything we don't ship a translation for.
 */
export const adoptLanguage = (lng) => {
  if (LANGS.includes(lng) && lng !== i18n.language) i18n.changeLanguage(lng)
}

/** The ebook edition to request for a UI language — each language reads its own
    edition; the backend serves the English one for books not yet authored in it. */
export const ebookLang = (lng = i18n.language) => (LANGS.includes(lng) ? lng : 'en')

export default i18n
