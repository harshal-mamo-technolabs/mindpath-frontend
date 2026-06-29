import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  CreditCard,
  Loader2,
  Lock,
  RefreshCcw,
  ShieldCheck,
  X,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useTheme } from '../hooks/useTheme.js'
import { isMsisdnMode } from '../lib/billingMode.js'
import { stripeConfigured, stripePromise } from '../lib/stripe.js'
import { formatPrice } from '../lib/plans.js'
import { getPaymentMethods } from '../lib/payments.js'
import {
  getAssessment,
  startAssessment,
  submitAssessment,
  sendScoreReport,
} from '../lib/assessmentsApi.js'
import { buildReportJson, buildBasicReportJson } from '../lib/reportJson.js'
import AssessmentReport from '../components/report/AssessmentReport.jsx'
import { RICH_REPORTS } from '../components/report/registry.js'

const ACCENT = '#6450cf'
const titleCase = (s) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase())
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const cardStyle = (isDark) => ({
  base: {
    fontFamily: 'Manrope, sans-serif',
    fontSize: '15px',
    fontWeight: '600',
    color: isDark ? '#ece9fa' : '#23203b',
    '::placeholder': { color: '#8a83a8', fontWeight: '500' },
  },
  invalid: { color: '#c2452f' },
})

/* ---- new-card form (must live inside <Elements>) ---- */
function NewCardForm({ clientSecret, priceLabel, onPaid, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const { theme } = useTheme()
  const [busy, setBusy] = useState(false)
  const [focused, setFocused] = useState(false)

  async function handle(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setBusy(true)
    onError('')
    const card = elements.getElement(CardElement)
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    })
    if (error) {
      onError(error.message || 'Your card could not be charged. Try another card.')
      setBusy(false)
      return
    }
    if (paymentIntent) await onPaid()
  }

  return (
    <form onSubmit={handle} className="take-card-form">
      <label className="take-card-field-label">Card details</label>
      <div className={`take-card-field${focused ? ' focused' : ''}`}>
        <CardElement
          options={{ style: cardStyle(theme === 'dark'), hidePostalCode: true }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
      <button className="btn btn-primary take-pay-btn" disabled={!stripe || busy}>
        {busy ? (
          <>
            <Loader2 size={17} className="ap-spin" /> Processing…
          </>
        ) : (
          <>
            <Lock size={16} /> Pay {priceLabel}
          </>
        )}
      </button>
    </form>
  )
}

/* ---- the payment step (only ever shown when requiresPayment) ---- */
function PaymentStep({ clientSecret, amount, currency, onPaid }) {
  const [cards, setCards] = useState([])
  const [selected, setSelected] = useState(null)
  const [useNew, setUseNew] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const priceLabel = formatPrice(amount ?? 0, currency || 'eur')

  useEffect(() => {
    let alive = true
    getPaymentMethods()
      .then((list) => {
        if (!alive) return
        const arr = list || []
        setCards(arr)
        setSelected(arr.find((c) => c.isDefault)?.id || arr[0]?.id || null)
        setUseNew(arr.length === 0)
      })
      .catch(() => alive && setUseNew(true))
      .finally(() => alive && setLoaded(true))
    return () => {
      alive = false
    }
  }, [])

  async function paySaved() {
    if (!selected) return
    setBusy(true)
    setError('')
    try {
      const stripe = await stripePromise
      if (!stripe) throw new Error('Payments are not configured (missing Stripe key).')
      const { error: err } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: selected,
      })
      if (err) throw new Error(err.message || 'Your card could not be charged.')
      await onPaid()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (!stripeConfigured) {
    return (
      <p className="checkout-error" role="alert">
        Payments aren’t configured. Add <code>VITE_STRIPE_PUBLISHABLE_KEY</code> to{' '}
        <code>.env</code> and restart the dev server.
      </p>
    )
  }

  if (!loaded) {
    return (
      <div className="checkout-status checkout-status-inline">
        <Loader2 size={22} className="ap-spin" />
        <p>Preparing secure checkout…</p>
      </div>
    )
  }

  return (
    <div className="take-pay-body">
      {error && (
        <p className="checkout-error" role="alert">
          {error}
        </p>
      )}

      {!useNew && cards.length > 0 ? (
        <>
          <div className="pay-methods">
            {cards.map((c) => (
              <button
                type="button"
                key={c.id}
                className={`pay-card ${selected === c.id ? 'selected' : ''}`}
                onClick={() => setSelected(c.id)}
                aria-pressed={selected === c.id}
              >
                <CreditCard size={18} />
                <span className="pay-card-info">
                  <strong>
                    {titleCase(c.brand)} •••• {c.last4}
                  </strong>
                  <small>
                    Expires {String(c.expMonth).padStart(2, '0')}/{c.expYear}
                  </small>
                </span>
                {selected === c.id && <Check size={16} className="pay-card-check" />}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary checkout-pay"
            onClick={paySaved}
            disabled={busy || !selected}
          >
            {busy ? (
              <>
                <Loader2 size={17} className="ap-spin" /> Processing…
              </>
            ) : (
              <>
                <Lock size={16} /> Pay {priceLabel}
              </>
            )}
          </button>
          <button type="button" className="pay-switch" onClick={() => setUseNew(true)}>
            Pay with a new card instead
          </button>
        </>
      ) : (
        <>
          <Elements stripe={stripePromise}>
            <NewCardForm clientSecret={clientSecret} priceLabel={priceLabel} onPaid={onPaid} onError={setError} />
          </Elements>
          {cards.length > 0 && (
            <button type="button" className="pay-switch" onClick={() => setUseNew(false)}>
              ← Use a saved card
            </button>
          )}
        </>
      )}

      <p className="checkout-secure">
        <ShieldCheck size={14} /> Secured by Stripe · 3D Secure handled automatically.
      </p>
    </div>
  )
}

export default function AssessmentTake() {
  const { id: slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  // assessment (questions + scale)
  const [load, setLoad] = useState({ status: 'loading', a: null, error: '' })
  // flow: checking | intro | pay | questions | submitting | result | denied | error
  const [phase, setPhase] = useState('checking')
  const [start, setStart] = useState(null) // { requiresPayment, clientSecret, amount, currency }
  const [flowError, setFlowError] = useState('')
  const [score, setScore] = useState(null)

  // question progress
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({}) // { [questionId]: weight }
  const [leaving, setLeaving] = useState(false)
  const advanceTimer = useRef(null)
  const [checkKey, setCheckKey] = useState(0) // bump to re-run the access check

  useEffect(() => () => clearTimeout(advanceTimer.current), [])

  // On load: confirm the user can take this assessment — auth first (redirect
  // if not), then the /start access/payment gate. The result decides the
  // landing state (ready intro / pay / out-of-allowance). The "Start" button
  // then just begins the questions; it does NOT re-check.
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`, { replace: true })
      return
    }
    let alive = true
    setLoad({ status: 'loading', a: null, error: '' })
    setPhase('checking')
    setFlowError('')
    ;(async () => {
      // 1) fetch the assessment (questions + scale)
      let assessment
      try {
        assessment = await getAssessment(slug)
      } catch (err) {
        if (!alive) return
        setLoad({
          status: err.status === 404 ? 'notfound' : 'error',
          a: null,
          error: err.message,
        })
        return
      }
      if (!alive) return
      setLoad({ status: 'ready', a: assessment, error: '' })

      // 2) access / payment gate
      try {
        const data = await startAssessment(slug)
        if (!alive) return
        if (data.requiresPayment) {
          setStart(data)
          setPhase('pay')
        } else {
          setPhase('intro')
        }
      } catch (err) {
        if (!alive) return
        if (err.status === 403) setPhase('denied')
        else {
          setFlowError(err.message)
          setPhase('error')
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [slug, isAuthenticated, navigate, location.pathname, checkKey])

  const a = load.a
  const questions = a?.questions || []
  const labels = a?.scaleLabels?.length ? a.scaleLabels : ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
  const weights = a?.scaleWeights?.length ? a.scaleWeights : [0, 1, 2, 3, 4]
  const total = questions.length

  // keyboard 1..n while answering
  useEffect(() => {
    if (phase !== 'questions') return
    const onKey = (e) => {
      const n = Number(e.key)
      if (n >= 1 && n <= labels.length) select(weights[n - 1])
      if (e.key === 'Backspace' && step > 0) back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // ----- the take flow -----
  // Access was already confirmed on load, so this just starts the questions.
  function begin() {
    setPhase('questions')
  }

  // After confirmCardPayment: activation is webhook-driven (async), so poll
  // /start until the access flips to active (requiresPayment:false).
  async function onPaid() {
    setPhase('checking')
    setFlowError('')
    try {
      for (let i = 0; i < 6; i++) {
        const data = await startAssessment(slug)
        if (!data.requiresPayment) {
          setPhase('intro')
          return
        }
        await sleep(1500)
      }
      // still pending — let them retry the gate
      setFlowError('Payment received — still finalizing. Give it a moment and try again.')
      setPhase('error')
    } catch (err) {
      if (err.status === 403) setPhase('denied')
      else {
        setFlowError(err.message)
        setPhase('error')
      }
    }
  }

  function select(weight) {
    if (leaving || phase !== 'questions') return
    const q = questions[step]
    const next = { ...answers, [q._id]: weight }
    setAnswers(next)
    setLeaving(true)
    advanceTimer.current = setTimeout(() => {
      if (step + 1 >= total) submitAll(next)
      else {
        setStep(step + 1)
        setLeaving(false)
      }
    }, 420)
  }

  function back() {
    clearTimeout(advanceTimer.current)
    setLeaving(false)
    setStep((s) => Math.max(0, s - 1))
  }

  async function submitAll(finalAnswers) {
    setPhase('submitting')
    const payload = questions.map((q) => ({ questionId: q._id, weight: finalAnswers[q._id] }))
    try {
      const s = await submitAssessment(slug, payload)
      setScore(s)
      setPhase('result')
      persistReport(s) // fire-and-forget: store the full report JSON server-side
    } catch (err) {
      setFlowError(err.message)
      setPhase('error')
    }
  }

  // Build the same report we render as detailed JSON and POST it to
  // /api/scores/<scoreId>/report. Best-effort: never blocks or breaks the
  // result view if it fails.
  function persistReport(s) {
    const scoreId = s.scoreId || s._id || s.id
    if (!scoreId) {
      console.warn('No score id on the submit response — cannot POST the report.', s)
      return
    }
    const meta = {
      slug,
      name: (user?.name || '').split(' ')[0] || 'You',
      generatedAt: new Date().toISOString(),
    }
    const rich = RICH_REPORTS[slug]
    const report = rich
      ? buildReportJson(rich.build(s), rich.ui, meta)
      : buildBasicReportJson(s, { ...meta, assessmentName: a?.name })
    sendScoreReport(scoreId, report).catch((err) => {
      console.warn('Could not persist report JSON:', err?.message || err)
    })
  }

  // Reset the attempt and re-run the access gate (lands on intro or pay).
  function retake() {
    clearTimeout(advanceTimer.current)
    setAnswers({})
    setStep(0)
    setScore(null)
    setLeaving(false)
    setCheckKey((k) => k + 1)
  }

  // ----- render -----
  if (load.status === 'notfound') return <Navigate to="/assessments" replace />

  if (load.status === 'loading') {
    return (
      <div className="take">
        <div className="take-center">
          <Loader2 size={28} className="ap-spin" />
          <p>Loading assessment…</p>
        </div>
      </div>
    )
  }

  if (load.status === 'error') {
    return (
      <div className="take">
        <div className="take-center" role="alert">
          <h1>We couldn’t load this assessment</h1>
          <p>{load.error}</p>
          <Link to="/assessments" className="btn btn-primary">
            All assessments
          </Link>
        </div>
      </div>
    )
  }

  const exitTo = `/assessments/${slug}`
  const progress = phase === 'questions' ? (step / total) * 100 : 0
  const q = questions[step]

  return (
    <div className="take" style={{ '--topic': ACCENT }}>
      <header className="take-bar">
        <Logo />
        <p className="take-topic">{a.name}</p>
        <Link to={exitTo} className="take-exit" aria-label="Exit assessment">
          <X size={20} />
        </Link>
      </header>

      <div
        className="take-progress"
        role="progressbar"
        aria-valuenow={phase === 'questions' ? step : 0}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <i style={{ width: `${progress}%` }} />
      </div>

      {/* intro (public) */}
      {phase === 'intro' && (
        <main className="take-stage">
          <div className="take-card take-intro">
            <span className="dim-tag">
              {a.name} · {total} questions
            </span>
            <h1>Answer as this week’s you.</h1>
            <p>
              Not your best week, not your worst just the one you’re in. Each statement asks how
              often it’s true for you lately. There are no right answers, only honest ones.
            </p>
            <div className="take-scale-preview" aria-hidden="true">
              {labels.map((l, i) => (
                <span key={l}>
                  <i className="likert-dot" data-strength={i} />
                  {l}
                </span>
              ))}
            </div>
            <button className="btn btn-primary" onClick={begin}>
              Start <ArrowRight size={18} />
            </button>
            <p className="take-legal">
              <ShieldCheck size={13} /> Self-reflection instrument not a clinical or diagnostic tool.
            </p>
          </div>
        </main>
      )}

      {/* checking access (on load) / finalizing (after pay) */}
      {phase === 'checking' && (
        <main className="take-stage">
          <div className="take-center">
            <Loader2 size={28} className="ap-spin" />
            <p>Checking your access…</p>
          </div>
        </main>
      )}

      {/* payment */}
      {phase === 'pay' && (
        <main className="take-stage">
          <div className="take-card take-pay">
            <h1>Unlock this assessment</h1>
            <p className="take-pay-sub">
              {a.name} · {formatPrice(start?.amount ?? a.cost, start?.currency || a.currency)} · one
              assessment, with up to {a.maxAttempts || 3} attempts.
            </p>
            <PaymentStep
              clientSecret={start.clientSecret}
              amount={start.amount}
              currency={start.currency}
              onPaid={onPaid}
            />
          </div>
        </main>
      )}

      {/* questions */}
      {phase === 'questions' && q && (
        <main className="take-stage" key={step}>
          <div className={`take-card ${leaving ? 'leaving' : ''}`}>
            <div className="take-card-top">
              <span className="dim-tag">{titleCase(q.subCategory || a.category || 'Reflect')}</span>
              <span className="take-count">
                {step + 1} <em>/ {total}</em>
              </span>
            </div>
            <h1 className="take-q">{q.text}</h1>
            <div className="likert" role="group" aria-label="How often is this true for you?">
              {labels.map((label, i) => (
                <button
                  key={label}
                  className={`likert-btn ${answers[q._id] === weights[i] ? 'picked' : ''}`}
                  onClick={() => select(weights[i])}
                >
                  <span className="likert-dot" data-strength={i} />
                  {label}
                  <kbd>{i + 1}</kbd>
                </button>
              ))}
            </div>
            <div className="take-foot">
              {step > 0 ? (
                <button className="take-back" onClick={back}>
                  <ArrowLeft size={15} /> Previous
                </button>
              ) : (
                <span />
              )}
              <p className="take-hint">Lately = the last two weeks</p>
            </div>
          </div>
        </main>
      )}

      {/* submitting */}
      {phase === 'submitting' && (
        <main className="take-stage">
          <div className="take-center">
            <Loader2 size={28} className="ap-spin" />
            <p>Scoring your answers…</p>
          </div>
        </main>
      )}

      {/* result — rich visual report when the assessment has one, else card */}
      {phase === 'result' && score && RICH_REPORTS[slug] && (
        <main className="take-report-stage">
          <AssessmentReport
            report={RICH_REPORTS[slug].build(score)}
            ui={RICH_REPORTS[slug].ui}
            name={(user?.name || '').split(' ')[0] || 'You'}
            attempt={score.attemptNumber}
            onRetake={retake}
          />
        </main>
      )}

      {phase === 'result' && score && !RICH_REPORTS[slug] && (
        <main className="take-stage">
          <div className="take-card take-result">
            <span className="ap-done-check take-result-check">
              <CheckCheck size={26} />
            </span>
            <h1>Assessment scored.</h1>
            <p className="take-result-sub">
              {a.name} · attempt {score.attemptNumber}
            </p>

            <div className="take-result-overall">
              <strong>{score.rawPercentage ?? score.percentage}%</strong>
              <small>
                overall · {score.totalScore}/{score.maxScore}
              </small>
            </div>

            <ul className="take-result-dims">
              {(score.subCategoryScores || []).map((s) => (
                <li key={s.subCategory}>
                  <span className="take-result-dim-label">{titleCase(s.subCategory)}</span>
                  <span className="take-result-dim-bar">
                    <i style={{ width: `${s.percentage}%` }} />
                  </span>
                  <span className="take-result-dim-pct">{s.percentage}%</span>
                </li>
              ))}
            </ul>

            <div className="take-result-actions">
              <Link to="/reports" className="btn btn-primary">
                View my reports <ArrowRight size={16} />
              </Link>
              <Link to="/assessments" className="btn btn-ghost">
                Another assessment
              </Link>
            </div>
          </div>
        </main>
      )}

      {/* denied (MSISDN allowance exhausted) */}
      {phase === 'denied' && (
        <main className="take-stage">
          <div className="take-card take-denied">
            <span className="take-denied-ico">
              <Lock size={24} />
            </span>
            <h1>You’re out of assessments this cycle.</h1>
            <p>
              Your plan’s assessment allowance is used up. It refreshes at the start of your next
              billing period {isMsisdnMode ? '— carrier billing has no pay-as-you-go.' : '.'}
            </p>
            <div className="take-result-actions">
              <Link to="/subscription" className="btn btn-primary">
                View subscription
              </Link>
              <Link to="/assessments" className="btn btn-ghost">
                Back to assessments
              </Link>
            </div>
          </div>
        </main>
      )}

      {/* error */}
      {phase === 'error' && (
        <main className="take-stage">
          <div className="take-card take-denied" role="alert">
            <h1>Something went wrong</h1>
            <p>{flowError}</p>
            <div className="take-result-actions">
              <button className="btn btn-primary" onClick={() => setCheckKey((k) => k + 1)}>
                <RefreshCcw size={16} /> Try again
              </button>
              <Link to={exitTo} className="btn btn-ghost">
                Back
              </Link>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
