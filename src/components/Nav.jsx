import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  ClipboardList,
  CreditCard,
  FileHeart,
  Headphones,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Music,
  Tag,
  User,
} from 'lucide-react'
import Logo from './Logo.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import { useAuth } from '../hooks/useAuth.js'
import ThemeToggle from './ThemeToggle.jsx'
import { isMsisdnMode } from '../lib/billingMode.js'

/* Primary product sections — desktop top nav + the mobile bottom tab bar.
   Labels are i18n keys under `nav.*` (full label + a `short*` label for the bar). */
const PRIMARY = [
  ['dashboard', '/dashboard', LayoutDashboard, 'shortDashboard'],
  ['assessments', '/assessments', ClipboardList, 'shortAssessments'],
  ['counselling', '/counselling', MessageCircle, 'shortCounselling'],
  ['reports', '/reports', FileHeart, 'shortReports'],
  ['audio', '/audio', Headphones, 'shortAudio'],
  ['ebooks', '/ebooks', BookOpen, 'shortEbooks'],
]
/* Secondary features — live in the account menu. */
const EXPLORE = [['freeMusic', '/sound', Music]]
/* Account & billing. In carrier-billing (MSISDN) mode there's no plan/pricing
   page — the subscription is provisioned at signup. */
const ACCOUNT = [
  ['profile', '/profile', User],
  ['subscription', '/subscription', CreditCard],
  ...(isMsisdnMode ? [] : [['pricing', '/pricing', Tag]]),
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const userRef = useRef(null)

  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const displayName = user?.name || 'Maya Kapoor'
  const email = user?.email || 'maya@example.com'
  const initial = displayName.trim().charAt(0).toUpperCase() || 'M'

  const isActive = (to) => pathname === to || (to !== '/' && pathname.startsWith(to))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setMenuOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  useEffect(() => setMenuOpen(false), [pathname])

  const MenuItem = ([labelKey, to, Icon]) => (
    <Link
      key={to}
      to={to}
      className={`nav-menu-item ${isActive(to) ? 'active' : ''}`}
      role="menuitem"
    >
      <Icon size={16} /> {t(`nav.${labelKey}`)}
    </Link>
  )

  return (
    <>
      <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <Logo />
          <nav aria-label={t('nav.ariaPrimary', 'Primary')}>
            <ul className="nav-links">
              {PRIMARY.map(([labelKey, to]) => (
                <li key={to}>
                  <Link to={to} className={isActive(to) ? 'active' : ''}>
                    {t(`nav.${labelKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-cta">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="nav-user" ref={userRef}>
              <button
                className={`nav-avatar ${menuOpen ? 'open' : ''}`}
                aria-label={t('nav.accountMenu')}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                {initial}
              </button>

              {menuOpen && (
                <div className="nav-menu" role="menu">
                  <div className="nav-menu-head">
                    <span className="nav-menu-avatar" aria-hidden="true">
                      {initial}
                    </span>
                    <div>
                      <strong>{displayName}</strong>
                      <small>{email}</small>
                    </div>
                  </div>

                  <div className="nav-menu-group">
                    <span className="nav-menu-label">{t('nav.explore')}</span>
                    {EXPLORE.map(MenuItem)}
                  </div>

                  <div className="nav-menu-group">
                    <span className="nav-menu-label">{t('nav.account')}</span>
                    {ACCOUNT.map(MenuItem)}
                  </div>

                  <div className="nav-menu-divider" />
                  <Link
                    to="/login"
                    className="nav-menu-item danger"
                    role="menuitem"
                    onClick={logout}
                  >
                    <LogOut size={16} /> {t('nav.logout')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* mobile bottom tab bar — quick access to the primary sections */}
      <nav className="botnav" aria-label={t('nav.ariaPrimary', 'Primary')}>
        {PRIMARY.map(([labelKey, to, Icon, shortKey]) => (
          <Link
            key={to}
            to={to}
            className={`botnav-item ${isActive(to) ? 'active' : ''}`}
            aria-label={t(`nav.${labelKey}`)}
            aria-current={isActive(to) ? 'page' : undefined}
          >
            <Icon size={21} />
            <span>{t(`nav.${shortKey}`)}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
