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
  interpolation: { escapeValue: false },
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
    document.title = i18n.t('meta.title', { defaultValue: 'Daybreak — Your mind has a path' })
  }
}
applyLang(i18n.language)
i18n.on('languageChanged', applyLang)
setLanguageProvider(() => i18n.language || 'en')

/** The ebook edition to request for a UI language: German has its own edition;
    every other language (en/fr/it) reads the English edition (per product rule). */
export const ebookLang = (lng = i18n.language) => (lng === 'de' ? 'de' : 'en')

export default i18n
