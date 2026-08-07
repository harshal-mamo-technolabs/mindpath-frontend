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
      <span className="logo-text">{APP_NAME}</span>
    </Link>
  )
}
