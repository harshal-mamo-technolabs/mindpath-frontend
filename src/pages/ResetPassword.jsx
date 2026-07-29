import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, LockKeyhole, Mail, TriangleAlert } from 'lucide-react'

import Logo from '../components/Logo.jsx'
import { apiGet } from '../lib/api.js'
import { confirmPasswordReset, requestPasswordReset } from '../lib/handoffApi.js'

/**
 * One page, two jobs.
 *
 * With a `token` in the URL it's the "choose a password" form — used both by
 * forgot-password and by funnel buyers, whose accounts are created with a random
 * password they never see. Without a token it's the request form.
 */
export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')

  const [check, setCheck] = useState(token ? { status: 'checking' } : { status: 'no-token' })
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | done

  // Tell a live link from a dead one before showing the form, so an expired
  // link fails immediately rather than after someone picks a password.
  useEffect(() => {
    if (!token) return
    apiGet(`/api/password-reset/verify?token=${encodeURIComponent(token)}`)
      .then((data) => setCheck({ status: 'valid', ...data }))
      .catch((err) => setCheck({ status: 'invalid', message: err.message }))
  }, [token])

  const submitNewPassword = async (e) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Use at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Those two passwords don’t match.')
      return
    }

    setStatus('loading')
    try {
      await confirmPasswordReset(token, password)
      setStatus('done')
      setTimeout(() => navigate('/login', { replace: true }), 1800)
    } catch (err) {
      setStatus('idle')
      setError(err.message)
    }
  }

  const submitRequest = async (e) => {
    e.preventDefault()
    setError(null)
    setStatus('loading')
    try {
      await requestPasswordReset(email)
      setStatus('done')
    } catch (err) {
      setStatus('idle')
      setError(err.message)
    }
  }

  const shell = (children) => (
    <div className="auth">
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card-logo">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  )

  if (check.status === 'checking') {
    return shell(
      <>
        <h1 className="auth-title">Checking your link…</h1>
        <p className="auth-subtitle">One moment.</p>
      </>,
    )
  }

  if (check.status === 'invalid') {
    return shell(
      <>
        <p className="auth-kicker" style={{ color: 'var(--danger)' }}>
          <TriangleAlert size={14} style={{ verticalAlign: '-2px' }} /> Link expired
        </p>
        <h1 className="auth-title">This link is no longer valid</h1>
        <p className="auth-subtitle">{check.message}</p>
        <p className="auth-subtitle">Request a fresh one and we’ll email it over.</p>
        <Link
          to="/reset-password"
          className="btn btn-primary auth-submit"
          style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}
        >
          Send me a new link
        </Link>
      </>,
    )
  }

  if (status === 'done' && check.status === 'valid') {
    return shell(
      <div className="auth-success" role="status">
        <span className="ap-done-check auth-check">
          <Check size={26} />
        </span>
        <h1>Password saved</h1>
        <p>Taking you to sign in…</p>
      </div>,
    )
  }

  // Request form — no token in the URL.
  if (check.status === 'no-token') {
    if (status === 'done') {
      return shell(
        <div className="auth-success" role="status">
          <span className="ap-done-check auth-check">
            <Check size={26} />
          </span>
          <h1>Check your inbox</h1>
          <p>If that address has an account, a reset link is on its way.</p>
        </div>,
      )
    }

    return shell(
      <>
        <p className="auth-kicker">Forgotten password</p>
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-subtitle">
          Enter your email and we’ll send you a link to choose a new one.
        </p>
        <form className="auth-form" onSubmit={submitRequest} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="reset-email">
              Email
            </label>
            <div className="auth-input">
              <Mail size={18} />
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          {error && <em className="auth-error">{error}</em>}
          <button className="btn btn-primary auth-submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <p className="auth-subtitle" style={{ marginTop: '1rem' }}>
          <Link to="/login">Back to sign in</Link>
        </p>
      </>,
    )
  }

  // Set-a-new-password form.
  return shell(
    <>
      <p className="auth-kicker">{check.name ? `Hi ${check.name.split(' ')[0]}` : 'Almost there'}</p>
      <h1 className="auth-title">Choose a password</h1>
      <p className="auth-subtitle">
        {check.email
          ? `This sets the password for ${check.email}, so you can sign in from any device.`
          : 'Pick something you’ll remember.'}
      </p>
      <form className="auth-form" onSubmit={submitNewPassword} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="new-password">
            New password
          </label>
          <div className="auth-input">
            <LockKeyhole size={18} />
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </div>
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="confirm-password">
            Confirm password
          </label>
          <div className="auth-input">
            <LockKeyhole size={18} />
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type it once more"
              required
            />
          </div>
        </div>
        {error && <em className="auth-error">{error}</em>}
        <button className="btn btn-primary auth-submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </>,
  )
}
