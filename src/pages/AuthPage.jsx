import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function strengthOf(pw) {
  if (!pw) return null
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { label: 'Take a breath  too short', cls: 'weak', pct: 28 }
  if (score === 2) return { label: 'Getting steadier', cls: 'mid', pct: 55 }
  if (score === 3) return { label: 'Calm and solid', cls: 'good', pct: 80 }
  return { label: 'Deeply grounded', cls: 'good', pct: 100 }
}

export default function AuthPage({ mode }) {
  const navigate = useNavigate()
  const isLogin = mode === 'login'

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | success
  const strength = !isLogin ? strengthOf(form.password) : null

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: undefined }))
  }

  function validate() {
    const er = {}
    if (!isLogin && form.name.trim().length < 2) er.name = 'Tell us what to call you.'
    if (!EMAIL_RE.test(form.email)) er.email = 'That email doesn’t look complete.'
    if (form.password.length < 8) er.password = 'At least 8 characters keeps it safe.'
    return er
  }

  function submit(e) {
    e.preventDefault()
    if (status !== 'idle') return
    const er = validate()
    setErrors(er)
    if (Object.keys(er).length) return
    setStatus('loading')
    setTimeout(() => {
      setStatus('success')
      setTimeout(() => navigate('/dashboard'), 1300)
    }, 1300)
  }

  const firstName = form.name.trim().split(' ')[0] || 'Maya'

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
              <p className="auth-kicker">
                {isLogin ? 'Log in' : 'Create your account'}
              </p>
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
                      placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
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
                  {!isLogin && strength && (
                    <span className="auth-strength">
                      <span className={`auth-strength-bar ${strength.cls}`}>
                        <i style={{ width: `${strength.pct}%` }} />
                      </span>
                      <small>{strength.label}</small>
                    </span>
                  )}
                </label>

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
                  By continuing you agree to our Terms and acknowledge that MindPath is a
                  self-reflection tool, not a clinical service.
                </p>
              )}

              <p className="auth-swap">
                {isLogin ? (
                  <>
                    New here?{' '}
                    <Link to="/signup">
                      Create an account <Sparkles size={13} />
                    </Link>
                  </>
                ) : (
                  <>
                    Already walking a path? <Link to="/login">Log in</Link>
                  </>
                )}
              </p>

              <Link to="/" className="auth-guest">
                ← Just browsing  back to MindPath
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
