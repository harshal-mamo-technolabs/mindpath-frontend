import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Cake,
  Check,
  ChevronDown,
  Loader2,
  Smartphone,
  Sparkles,
  User,
  Users,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { msisdnLogin, msisdnSignup, saveSession } from '../lib/auth.js'

/* Carrier-billing auth (VITE_BILLING_MODE=msisdn): no email/password.
   Login = mobile number only. Signup = name, gender, age + mobile number,
   which also provisions an active subscription server-side. */

const cleanMsisdn = (s) => s.replace(/[^\d+]/g, '')
const validMsisdn = (s) => /^\+?\d{8,15}$/.test(s)

export default function MsisdnAuthPage({ mode }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isLogin = mode === 'login'

  const next = params.get('next') || '/dashboard'
  const swapTo = (path) =>
    next === '/dashboard' ? path : `${path}?next=${encodeURIComponent(next)}`

  const [form, setForm] = useState({ name: '', gender: '', age: '', msisdn: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null) // { message, items[] } | null
  const [status, setStatus] = useState('idle') // idle | loading | success

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
      if (!form.gender) er.gender = 'Choose one.'
      const age = Number(form.age)
      if (!form.age || !Number.isInteger(age) || age < 1 || age > 120)
        er.age = 'Enter an age from 1 to 120.'
    }
    if (!validMsisdn(cleanMsisdn(form.msisdn)))
      er.msisdn = 'Enter a valid mobile number (8–15 digits).'
    return er
  }

  async function submit(e) {
    e.preventDefault()
    if (status === 'loading') return
    setSubmitError(null)
    const er = validate()
    setErrors(er)
    if (Object.keys(er).length) return

    const msisdn = cleanMsisdn(form.msisdn)
    setStatus('loading')
    try {
      const data = isLogin
        ? await msisdnLogin({ msisdn })
        : await msisdnSignup({
            name: form.name.trim(),
            gender: form.gender,
            age: Number(form.age),
            msisdn,
          })
      saveSession({ token: data.token, user: data.user })
      setStatus('success')
      setTimeout(() => navigate(next), 1300)
    } catch (err) {
      setStatus('idle')
      if (err.status === 409) {
        setErrors((prev) => ({
          ...prev,
          msisdn: 'This number already has an account — log in instead.',
        }))
      } else if (err.status === 401) {
        setErrors((prev) => ({
          ...prev,
          msisdn: 'No account found for this number — create one first.',
        }))
      } else {
        // 422 validation (any field) and 404 default-plan-missing → banner.
        setSubmitError({ message: err.message, items: err.errors || [] })
      }
    }
  }

  const firstName = form.name.trim().split(' ')[0] || 'there'

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
                {isLogin ? 'Welcome back.' : `Welcome to the path, ${firstName}.`}
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
                  ? 'Enter the mobile number you signed up with to continue.'
                  : 'A few details and your number — that’s it. Your plan is billed to your phone and set up automatically.'}
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

                <label className={`auth-field ${errors.msisdn ? 'has-error' : ''}`}>
                  <span className="auth-label">Mobile number</span>
                  <span className="auth-input">
                    <Smartphone size={16} />
                    <input
                      type="tel"
                      value={form.msisdn}
                      onChange={set('msisdn')}
                      placeholder="9876543210"
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </span>
                  {errors.msisdn && <em className="auth-error">{errors.msisdn}</em>}
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
                  self-reflection tool, not a clinical service. Your subscription is charged to your
                  mobile bill.
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
                ← Just browsing — back to MindPath
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
