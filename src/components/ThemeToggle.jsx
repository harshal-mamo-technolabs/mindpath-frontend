import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.js'

/* Day/night toggle button. Shared by the top nav and the (nav-less) auth pages,
   so the control looks and behaves the same everywhere. */
export default function ThemeToggle({ className = 'nav-theme' }) {
  const { t } = useTranslation()
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      aria-label={theme === 'dark' ? t('nav.switchToDay') : t('nav.switchToNight')}
      title={theme === 'dark' ? t('nav.dayMode') : t('nav.nightMode')}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
