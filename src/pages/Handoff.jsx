import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LoaderCircle, TriangleAlert } from 'lucide-react'

import Logo from '../components/Logo.jsx'
import { saveSession } from '../lib/auth.js'
import { exchangeHandoff } from '../lib/handoffApi.js'
import { markTourPending } from '../lib/tour.js'
import { adoptLanguage } from '../i18n/index.js'

/** Marks the one failure we raise ourselves, so it can be translated at render. */
const NO_TOKEN = 'auth.handoff.errorNoToken'

/**
 * Signs in a buyer arriving from the landing-page funnel.
 *
 * The token in the URL is single-use and short-lived: it's exchanged for a real
 * session, then the user is replaced onto their report. Because the token burns
 * on first use this must run exactly once — hence the ref guard, which also
 * survives StrictMode's double-invoked effects in development.
 */
export default function Handoff() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')
  const startedRef = useRef(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    if (!token) {
      // Stored as a key, not a sentence: the exchange runs once (startedRef), so
      // translating here would freeze this in whatever language was active then.
      // Render-time translation lets it follow a later language switch.
      setError(NO_TOKEN)
      return
    }

    exchangeHandoff(token)
      .then((data) => {
        // Persist before navigating so the report's first fetch carries the JWT.
        saveSession({ token: data.token, user: data.user })
        // Carry over the language they used on the landing page, before the redirect,
        // so the page they land on is already translated.
        adoptLanguage(data.language)
        // Queue the walkthrough for the page we're about to land on — arriving
        // here means this is someone's very first minute in the app.
        if (data.isFirstVisit) markTourPending()
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
                <TriangleAlert size={14} style={{ verticalAlign: '-2px' }} />{' '}
                {t('auth.handoff.errorKicker')}
              </p>
              <h1 className="auth-title">{t('auth.handoff.errorTitle')}</h1>
              {/* our own failure is a translation key; anything else is the
                  API's message, which the backend already localizes */}
              <p className="auth-subtitle">{error === NO_TOKEN ? t(NO_TOKEN) : error}</p>
              <p className="auth-subtitle">{t('auth.handoff.errorBody')}</p>
              <Link
                to="/login"
                className="btn btn-primary auth-submit"
                style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}
              >
                {t('auth.handoff.errorCta')}
              </Link>
            </>
          ) : (
            <>
              <p className="auth-kicker">{t('auth.handoff.welcome')}</p>
              <h1 className="auth-title">{t('auth.handoff.signingIn')}</h1>
              <p className="auth-subtitle">{t('auth.handoff.openingReport')}</p>
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
