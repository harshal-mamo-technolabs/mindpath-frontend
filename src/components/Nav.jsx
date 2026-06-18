import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
import { useAuth } from '../hooks/useAuth.js'

/* Primary product sections — desktop top nav + the mobile bottom tab bar.
   4th item is a short label for the narrow bottom bar. */
const PRIMARY = [
  ['Dashboard', '/dashboard', LayoutDashboard, 'Dashboard'],
  ['Assessments', '/assessments', ClipboardList, 'Assess'],
  ['Your reports', '/reports', FileHeart, 'Reports'],
  ['Daily audio', '/audio', Headphones, 'Audio'],
  ['Ebooks', '/ebooks', BookOpen, 'Ebooks'],
]
/* Secondary features — live in the account menu. */
const EXPLORE = [
  ['Counselling', '/counselling', MessageCircle],
  ['Free music', '/music', Music],
]
/* Account & billing. */
const ACCOUNT = [
  ['Profile', '/profile', User],
  ['Subscription', '/subscription', CreditCard],
  ['Plans & pricing', '/pricing', Tag],
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const userRef = useRef(null)

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

  const MenuItem = ([label, to, Icon]) => (
    <Link
      key={to}
      to={to}
      className={`nav-menu-item ${isActive(to) ? 'active' : ''}`}
      role="menuitem"
    >
      <Icon size={16} /> {label}
    </Link>
  )

  return (
    <>
      <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <Logo />
          <nav aria-label="Primary">
            <ul className="nav-links">
              {PRIMARY.map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className={isActive(to) ? 'active' : ''}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-cta">
            <div className="nav-user" ref={userRef}>
              <button
                className={`nav-avatar ${menuOpen ? 'open' : ''}`}
                aria-label="Account & menu"
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
                    <span className="nav-menu-label">Explore</span>
                    {EXPLORE.map(MenuItem)}
                  </div>

                  <div className="nav-menu-group">
                    <span className="nav-menu-label">Account</span>
                    {ACCOUNT.map(MenuItem)}
                  </div>

                  <div className="nav-menu-divider" />
                  <Link
                    to="/login"
                    className="nav-menu-item danger"
                    role="menuitem"
                    onClick={logout}
                  >
                    <LogOut size={16} /> Log out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* mobile bottom tab bar — quick access to the primary sections */}
      <nav className="botnav" aria-label="Primary">
        {PRIMARY.map(([label, to, Icon, short]) => (
          <Link
            key={to}
            to={to}
            className={`botnav-item ${isActive(to) ? 'active' : ''}`}
            aria-label={label}
            aria-current={isActive(to) ? 'page' : undefined}
          >
            <Icon size={21} />
            <span>{short}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
