import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LoaderCircle, TriangleAlert } from 'lucide-react'

import Logo from '../components/Logo.jsx'
import { saveSession } from '../lib/auth.js'
import { exchangeHandoff } from '../lib/handoffApi.js'

/**
 * Signs in a buyer arriving from the landing-page funnel.
 *
 * The token in the URL is single-use and short-lived: it's exchanged for a real
 * session, then the user is replaced onto their report. Because the token burns
 * on first use this must run exactly once — hence the ref guard, which also
 * survives StrictMode's double-invoked effects in development.
 */
export default function Handoff() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')
  const startedRef = useRef(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    if (!token) {
      setError('This sign-in link is missing its token.')
      return
    }

    exchangeHandoff(token)
      .then((data) => {
        // Persist before navigating so the report's first fetch carries the JWT.
        saveSession({ token: data.token, user: data.user })
        navigate(data.redirectPath || '/dashboard', { replace: true })
      })
      .catch((err) => setError(err.message))
  }, [token, navigate])

  return (
    <div className="auth">
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card-logo">
            <Logo />
          </div>

          {error ? (
            <>
              <p className="auth-kicker" style={{ color: 'var(--danger)' }}>
                <TriangleAlert size={14} style={{ verticalAlign: '-2px' }} /> Link problem
              </p>
              <h1 className="auth-title">This link didn’t work</h1>
              <p className="auth-subtitle">{error}</p>
              <p className="auth-subtitle">
                Sign-in links are single-use and expire quickly — but your report is saved to your
                account, so signing in normally will take you straight to it.
              </p>
              <Link
                to="/login"
                className="btn btn-primary auth-submit"
                style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}
              >
                Go to sign in
              </Link>
            </>
          ) : (
            <>
              <p className="auth-kicker">Welcome to MindPath</p>
              <h1 className="auth-title">Signing you in…</h1>
              <p className="auth-subtitle">Opening your report.</p>
              <span
                style={{
                  display: 'inline-flex',
                  marginTop: '1.25rem',
                  color: 'var(--violet)',
                  animation: 'spin 1s linear infinite',
                }}
              >
                <LoaderCircle size={26} />
              </span>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
