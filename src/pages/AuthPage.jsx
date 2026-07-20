import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Cake,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
  Users,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { login, saveSession, signup } from '../lib/auth.js'
import { isMsisdnMode } from '../lib/billingMode.js'
import MsisdnAuthPage from './MsisdnAuthPage.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AuthPage({ mode }) {
  // Carrier-billing build: swap the whole email/password flow for the
  // mobile-number-only one.
  if (isMsisdnMode) return <MsisdnAuthPage mode={mode} />

  return <EmailAuthPage mode={mode} />
}

function EmailAuthPage({ mode }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isLogin = mode === 'login'

  // Where to go after success — e.g. checkout sends users here with ?next=/checkout?plan=...
  const next = params.get('next') || '/dashboard'
  const swapTo = (path) =>
    next === '/dashboard' ? path : `${path}?next=${encodeURIComponent(next)}`

  const [form, setForm] = useState({ name: '', email: '', password: '', gender: '', age: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null) // { message, items[] } | null
  const [showPw, setShowPw] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | success
  const [account, setAccount] = useState(null) // user returned by the API

  const set = (key) => (e) => {
    const { value } = e.target
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((er) => ({ ...er, [key]: undefined }))
    setSubmitError(null)
  }

  function validate() {
    const er = {}
    if (!isLogin) {
      const name = form.name.trim()
      if (name.length < 2 || name.length > 50) er.name = 'Use between 2 and 50 characters.'
    }
    if (!EMAIL_RE.test(form.email)) er.email = 'That email doesn’t look complete.'
    // No password rules on the client — the backend is the source of truth.
    if (!isLogin) {
      if (!form.gender) er.gender = 'Choose one.'
      const age = Number(form.age)
      if (!form.age || !Number.isInteger(age) || age < 1 || age > 120)
        er.age = 'Enter an age from 1 to 120.'
    }
    return er
  }

  async function submit(e) {
    e.preventDefault()
    if (status === 'loading') return
    setSubmitError(null)
    const er = validate()
    setErrors(er)
    if (Object.keys(er).length) return

    setStatus('loading')
    try {
      const session = isLogin
        ? await login({ email: form.email.trim(), password: form.password })
        : await signup({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            gender: form.gender,
            age: Number(form.age),
          })
      saveSession(session)
      setAccount(session.user)
      setStatus('success')
      setTimeout(() => navigate(next), 1300)
    } catch (err) {
      setStatus('idle')
      // 409 (email already in use) reads best pinned to the email field; every
      // other failure (401 invalid creds, 422 validation, 500, network) shows
      // as a banner above the form, with any server `errors` listed.
      if (err.status === 409) {
        setErrors((prev) => ({ ...prev, email: err.message }))
      } else {
        setSubmitError({ message: err.message, items: err.errors || [] })
      }
    }
  }

  const firstName = (account?.name || form.name).trim().split(' ')[0] || 'there'

  return (
    <div className="auth">
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card-logo">
            <Logo />
          </div>
          {status === 'success' ? (
            <div className="auth-success" role="status">
              <span className="ap-done-check auth-check">
                <Check size={26} />
              </span>
              <h1>
                {isLogin ? `Welcome back, ${firstName}.` : `Welcome to the path, ${firstName}.`}
              </h1>
              <p>Opening your dashboard…</p>
            </div>
          ) : (
            <>
              <p className="auth-kicker">{isLogin ? 'Log in' : 'Create your account'}</p>
              <h1 className="auth-title">
                {isLogin ? (
                  <>
                    Pick up <em>where you paused.</em>
                  </>
                ) : (
                  <>
                    Ten quiet minutes <em>starts here.</em>
                  </>
                )}
              </h1>
              <p className="auth-subtitle">
                {isLogin
                  ? 'Your sessions, your mood trend, and tomorrow’s unlock are exactly where you left them.'
                  : 'One honest assessment, a report that reads you back, and ten quiet minutes a day.'}
              </p>

              <form className="auth-form" onSubmit={submit} noValidate>
                {submitError && (
                  <div className="auth-form-error" role="alert">
                    <span>{submitError.message}</span>
                    {submitError.items.length > 0 && (
                      <ul>
                        {submitError.items.map((msg) => (
                          <li key={msg}>{msg}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {!isLogin && (
                  <label className={`auth-field ${errors.name ? 'has-error' : ''}`}>
                    <span className="auth-label">Your name</span>
                    <span className="auth-input">
                      <User size={16} />
                      <input
                        type="text"
                        value={form.name}
                        onChange={set('name')}
                        placeholder="What should we call you?"
                        autoComplete="name"
                      />
                    </span>
                    {errors.name && <em className="auth-error">{errors.name}</em>}
                  </label>
                )}

                <label className={`auth-field ${errors.email ? 'has-error' : ''}`}>
                  <span className="auth-label">Email</span>
                  <span className="auth-input">
                    <Mail size={16} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="you@somewhere.com"
                      autoComplete="email"
                    />
                  </span>
                  {errors.email && <em className="auth-error">{errors.email}</em>}
                </label>

                <label className={`auth-field ${errors.password ? 'has-error' : ''}`}>
                  <span className="auth-label">
                    Password
                    {isLogin && (
                      <Link to="#" className="auth-forgot">
                        Forgot?
                      </Link>
                    )}
                  </span>
                  <span className="auth-input">
                    <Lock size={16} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      placeholder={isLogin ? 'Your password' : 'Choose a password'}
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      className="auth-eye"
                      onClick={() => setShowPw((s) => !s)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </span>
                  {errors.password && <em className="auth-error">{errors.password}</em>}
                </label>

                {!isLogin && (
                  <div className="auth-row">
                    <label className={`auth-field ${errors.gender ? 'has-error' : ''}`}>
                      <span className="auth-label">Gender</span>
                      <span className="auth-input">
                        <Users size={16} />
                        <select value={form.gender} onChange={set('gender')} required>
                          <option value="" disabled>
                            Select
                          </option>
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                        </select>
                        <ChevronDown size={16} className="auth-select-caret" />
                      </span>
                      {errors.gender && <em className="auth-error">{errors.gender}</em>}
                    </label>

                    <label className={`auth-field ${errors.age ? 'has-error' : ''}`}>
                      <span className="auth-label">Age</span>
                      <span className="auth-input">
                        <Cake size={16} />
                        <input
                          type="number"
                          value={form.age}
                          onChange={set('age')}
                          placeholder="28"
                          min="1"
                          max="120"
                          inputMode="numeric"
                          autoComplete="off"
                        />
                      </span>
                      {errors.age && <em className="auth-error">{errors.age}</em>}
                    </label>
                  </div>
                )}

                <button className="btn btn-primary auth-submit" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={17} className="ap-spin" /> One moment…
                    </>
                  ) : isLogin ? (
                    <>
                      Continue your path <ArrowRight size={17} />
                    </>
                  ) : (
                    <>
                      Begin your path <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              {!isLogin && (
                <p className="auth-legal">
                  By continuing you agree to our Terms and acknowledge that Daybreak is a
                  self-reflection tool, not a clinical service.
                </p>
              )}

              <p className="auth-swap">
                {isLogin ? (
                  <>
                    New here?{' '}
                    <Link to={swapTo('/signup')}>
                      Create an account <Sparkles size={13} />
                    </Link>
                  </>
                ) : (
                  <>
                    Already walking a path? <Link to={swapTo('/login')}>Log in</Link>
                  </>
                )}
              </p>

              <Link to="/" className="auth-guest">
                ← Just browsing back to Daybreak
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
