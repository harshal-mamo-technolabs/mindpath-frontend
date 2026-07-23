import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { msisdnLogin, msisdnSignup, saveSession } from '../lib/auth.js'

/* Carrier-billing auth (VITE_BILLING_MODE=msisdn): no email/password.
   Login = mobile number only. Signup = name, gender, age + mobile number,
   which also provisions an active subscription server-side. */

const cleanMsisdn = (s) => s.replace(/[^\d+]/g, '')
const validMsisdn = (s) => /^\+?\d{8,15}$/.test(s)

export default function MsisdnAuthPage({ mode }) {
  const { t } = useTranslation()
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
      if (name.length < 2 || name.length > 50) er.name = t('auth.errName')
      if (!form.gender) er.gender = t('auth.errGender')
      const age = Number(form.age)
      if (!form.age || !Number.isInteger(age) || age < 1 || age > 120)
        er.age = t('auth.errAge')
    }
    if (!validMsisdn(cleanMsisdn(form.msisdn))) er.msisdn = t('auth.errMsisdn')
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
        setErrors((prev) => ({ ...prev, msisdn: t('auth.errMsisdnExists') }))
      } else if (err.status === 401) {
        setErrors((prev) => ({ ...prev, msisdn: t('auth.errMsisdnNoAccount') }))
      } else {
        // 422 validation (any field) and 404 default-plan-missing → banner.
        setSubmitError({ message: err.message, items: err.errors || [] })
      }
    }
  }

  const firstName = form.name.trim().split(' ')[0] || t('auth.defaultName')

  return (
    <div className="auth">
      <div className="auth-topbar">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
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
                {isLogin ? t('auth.successBackPlain') : t('auth.successName', { name: firstName })}
              </h1>
              <p>{t('auth.opening')}</p>
            </div>
          ) : (
            <>
              <p className="auth-kicker">
                {isLogin ? t('auth.kickerLogin') : t('auth.kickerSignup')}
              </p>
              <h1 className="auth-title">
                {isLogin ? (
                  <>
                    {t('auth.titleBackA') && <>{t('auth.titleBackA')} </>}
                    <em>{t('auth.titleBackEm')}</em>
                  </>
                ) : (
                  <>
                    {t('auth.titleStartA') && <>{t('auth.titleStartA')} </>}
                    <em>{t('auth.titleStartEm')}</em>
                  </>
                )}
              </h1>
              <p className="auth-subtitle">
                {isLogin ? t('auth.subtitleLoginMsisdn') : t('auth.subtitleSignupMsisdn')}
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
                    <span className="auth-label">{t('auth.nameLabel')}</span>
                    <span className="auth-input">
                      <User size={16} />
                      <input
                        type="text"
                        value={form.name}
                        onChange={set('name')}
                        placeholder={t('auth.namePlaceholder')}
                        autoComplete="name"
                      />
                    </span>
                    {errors.name && <em className="auth-error">{errors.name}</em>}
                  </label>
                )}

                {!isLogin && (
                  <div className="auth-row">
                    <label className={`auth-field ${errors.gender ? 'has-error' : ''}`}>
                      <span className="auth-label">{t('auth.genderLabel')}</span>
                      <span className="auth-input">
                        <Users size={16} />
                        <select value={form.gender} onChange={set('gender')} required>
                          <option value="" disabled>
                            {t('auth.select')}
                          </option>
                          <option value="female">{t('auth.female')}</option>
                          <option value="male">{t('auth.male')}</option>
                          <option value="other">{t('auth.other')}</option>
                        </select>
                        <ChevronDown size={16} className="auth-select-caret" />
                      </span>
                      {errors.gender && <em className="auth-error">{errors.gender}</em>}
                    </label>

                    <label className={`auth-field ${errors.age ? 'has-error' : ''}`}>
                      <span className="auth-label">{t('auth.ageLabel')}</span>
                      <span className="auth-input">
                        <Cake size={16} />
                        <input
                          type="number"
                          value={form.age}
                          onChange={set('age')}
                          placeholder={t('auth.agePlaceholder')}
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
                  <span className="auth-label">{t('auth.mobileLabel')}</span>
                  <span className="auth-input">
                    <Smartphone size={16} />
                    <input
                      type="tel"
                      value={form.msisdn}
                      onChange={set('msisdn')}
                      placeholder={t('auth.mobilePlaceholder')}
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </span>
                  {errors.msisdn && <em className="auth-error">{errors.msisdn}</em>}
                </label>

                <button className="btn btn-primary auth-submit" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={17} className="ap-spin" /> {t('auth.submitLoading')}
                    </>
                  ) : isLogin ? (
                    <>
                      {t('auth.submitLogin')} <ArrowRight size={17} />
                    </>
                  ) : (
                    <>
                      {t('auth.submitCreate')} <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              {!isLogin && <p className="auth-legal">{t('auth.legalMsisdn')}</p>}

              <p className="auth-swap">
                {isLogin ? (
                  <>
                    {t('auth.swapNew')}{' '}
                    <Link to={swapTo('/signup')}>
                      {t('auth.createLink')} <Sparkles size={13} />
                    </Link>
                  </>
                ) : (
                  <>
                    {t('auth.haveAccount')} <Link to={swapTo('/login')}>{t('auth.loginLink')}</Link>
                  </>
                )}
              </p>

              <Link to="/" className="auth-guest">
                {t('auth.guest')}
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
