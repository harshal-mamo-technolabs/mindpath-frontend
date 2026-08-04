import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { APP_NAME } from '../lib/brand.js'

export default function Logo() {
  const { isAuthenticated } = useAuth()
  // Logged-in users land on their dashboard; visitors go to the marketing home.
  const to = isAuthenticated ? '/dashboard' : '/'

  return (
    <Link
      to={to}
      className="logo"
      aria-label={isAuthenticated ? `${APP_NAME} dashboard` : `${APP_NAME} home`}
    >
      <span className="logo-mark" aria-hidden="true">
        {/* a sun rising over calm water */}
        <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
          <path d="M21.5 32 A10.5 10.5 0 0 1 42.5 32 Z" fill="#F3C58A" />
          <path
            d="M14 33.5 Q23 29.5 32 33.5 T50 33.5"
            fill="none"
            stroke="#8B78F0"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <path
            d="M16 39.5 Q24 35.5 32 39.5 T48 39.5"
            fill="none"
            stroke="#8B78F0"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="logo-text">{APP_NAME}</span>
    </Link>
  )
}
