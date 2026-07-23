import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown } from 'lucide-react'
import { LANGS, LANG_NAMES } from '../i18n/index.js'

// Country flag per language (macOS/most platforms render these as flags).
const FLAGS = { en: '🇬🇧', de: '🇩🇪', fr: '🇫🇷', it: '🇮🇹' }

/* Language picker (EN/DE/FR/IT) for the nav. Switches the whole app language via
   i18next — the choice persists to localStorage and rides on every API request. */
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = (i18n.language || 'en').slice(0, 2)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (code) => {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div className="nav-lang" ref={ref}>
      <button
        type="button"
        className={`nav-theme nav-lang-btn ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('lang.label')}
        title={t('lang.label')}
      >
        <span className="nav-lang-flag">{FLAGS[current] || '🌐'}</span>
        <span className="nav-lang-code">{current.toUpperCase()}</span>
        <ChevronDown size={14} className="nav-lang-chevron" />
      </button>

      {open && (
        <div className="nav-lang-menu" role="menu">
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={current === code}
              className={`nav-lang-item ${current === code ? 'active' : ''}`}
              onClick={() => pick(code)}
            >
              <span className="nav-lang-flag">{FLAGS[code] || '🌐'}</span>
              <span className="nav-lang-name">{LANG_NAMES[code]}</span>
              {current === code && <Check size={15} className="nav-lang-tick" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
