import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ClipboardList,
  CreditCard,
  Download,
  Loader2,
  MessagesSquare,
  Plus,
  RefreshCcw,
  Sparkles,
  Star,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { isMsisdnMode } from '../lib/billingMode.js'
import { getMyMsisdnSubscription } from '../lib/msisdn.js'
import { stripeConfigured, stripePromise } from '../lib/stripe.js'
import { formatPrice } from '../lib/plans.js'
import {
  cancelSubscription,
  CANCEL_REASONS,
  createSetupIntent,
  deletePaymentMethod,
  getMySubscription,
  getPaymentMethods,
  getTransactions,
  setDefaultPaymentMethod,
  WOULD_STAY_FOR,
} from '../lib/payments.js'

// Billing-history category → label + badge class.
const TX_KIND = {
  subscription: { label: 'Subscription', cls: 'subscription' },
  assessment: { label: 'Assessment', cls: 'assessment' },
  ebook: { label: 'Ebook', cls: 'ebook' },
  audio: { label: 'Audio program', cls: 'audio' },
  counselling: { label: 'Counselling', cls: 'counselling' },
  payg: { label: 'Pay-as-you-go', cls: 'payg' },
}

const ACCENT = '#6450cf'

const STRIPE_APPEARANCE = {
  theme: 'stripe',
  variables: { colorPrimary: ACCENT, fontFamily: 'Manrope, sans-serif', borderRadius: '12px' },
}

// Plan names arrive lowercase from the API ("balance") — capitalize for display.
const titleCase = (s) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase())

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

// status → label + the dot modifier class used on .bl-plan-status
const STATUS = {
  active: { label: 'Active', cls: 'live' },
  trialing: { label: 'Trial', cls: 'live' },
  past_due: { label: 'Past due', cls: 'warn' },
  incomplete: { label: 'Incomplete', cls: 'warn' },
  canceled: { label: 'Canceled', cls: 'off' },
}

// allowance/usage/remaining keys come straight from /subscriptions/me
const ALLOWANCE_ROWS = [
  {
    key: 'assessments',
    label: 'Assessments',
    icon: ClipboardList,
    unit: '',
    accent: '#4d3da8',
    to: '/assessments',
    cta: 'Buy an assessment',
  },
  {
    key: 'ebooks',
    label: 'Ebooks',
    icon: BookOpen,
    unit: '',
    accent: '#8a5420',
    to: '/ebooks',
    cta: 'Browse the shop',
  },
  {
    key: 'counsellingMinutes',
    label: 'Counselling minutes',
    icon: MessagesSquare,
    unit: ' min',
    accent: '#2e5f49',
    to: '/counselling',
    cta: 'Buy minutes',
  },
]

/** Add-a-card form — lives inside <Elements>; confirms a SetupIntent. */
function AddCardForm({ onSaved, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    onError('')
    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: `${window.location.origin}/subscription` },
      redirect: 'if_required',
    })
    if (error) {
      onError(error.message || 'That card could not be saved.')
      setSubmitting(false)
      return
    }
    await onSaved()
  }

  return (
    <form onSubmit={handleSave} className="checkout-form">
      <PaymentElement options={{ paymentMethodOrder: ['card'] }} />
      <button className="btn btn-primary checkout-pay" disabled={!stripe || submitting}>
        {submitting ? (
          <>
            <Loader2 size={17} className="ap-spin" /> Saving…
          </>
        ) : (
          'Save card'
        )}
      </button>
    </form>
  )
}

export default function BillingPage() {
  const { isAuthenticated, logout } = useAuth()

  const [status, setStatus] = useState('loading') // loading | ready | none | error
  const [sub, setSub] = useState(null)
  const [cards, setCards] = useState([])
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [modal, setModal] = useState(null) // 'cancel' | 'addCard'
  const [busy, setBusy] = useState(false)
  const [addCardSecret, setAddCardSecret] = useState('')
  const [addCardError, setAddCardError] = useState('')

  // cancellation survey
  const [reason, setReason] = useState('')
  const [wouldStayFor, setWouldStayFor] = useState([])
  const [cancelError, setCancelError] = useState('')

  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const say = (msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 3400)
  }
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  useEffect(() => {
    if (!isAuthenticated) return
    let alive = true
    ;(async () => {
      try {
        const me = await (isMsisdnMode ? getMyMsisdnSubscription() : getMySubscription())
        if (!alive) return
        if (!me) {
          setStatus('none')
          return
        }
        // MSISDN has no card/Stripe billing history — skip those calls.
        const [cardList, txns] = isMsisdnMode
          ? [[], []]
          : await Promise.all([
              getPaymentMethods().catch(() => []),
              getTransactions().catch(() => []),
            ])
        if (!alive) return
        setSub(me)
        setCards(cardList || [])
        setTransactions(txns || [])
        setStatus('ready')
      } catch (err) {
        if (alive) {
          setError(err.message)
          setStatus('error')
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [isAuthenticated, reloadKey])

  const reload = () => {
    setStatus('loading')
    setError('')
    setReloadKey((k) => k + 1)
  }

  function openCancel() {
    setReason('')
    setWouldStayFor([])
    setCancelError('')
    setModal('cancel')
  }

  function toggleWouldStay(key) {
    setWouldStayFor((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  async function confirmCancel() {
    if (!reason) {
      setCancelError('Please choose a reason.')
      return
    }
    setBusy(true)
    setCancelError('')
    try {
      const updated = await cancelSubscription({ reason, wouldStayFor })
      setSub((prev) => ({ ...prev, ...updated }))
      setModal(null)
      say(`Your plan ends on ${formatDate(updated.currentPeriodEnd)}.`)
    } catch (err) {
      if (err.status === 401) {
        logout() // token expired → the auth gate redirects to /login
      } else if (err.status === 404) {
        setModal(null)
        reload() // no active subscription anymore — refresh /me
      } else {
        // 422 (invalid/missing reason) or anything else — keep the modal open
        setCancelError(err.message || 'We couldn’t cancel just now. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  async function makeDefault(id) {
    setBusy(true)
    try {
      const updated = await setDefaultPaymentMethod(id)
      setCards(updated || [])
      say('Default card updated.')
    } catch (err) {
      say(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function removeCard(id) {
    setBusy(true)
    try {
      const updated = await deletePaymentMethod(id)
      setCards(updated || [])
      say('Card removed.')
    } catch (err) {
      say(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function openAddCard() {
    if (!stripeConfigured) {
      say('Payments aren’t configured (missing Stripe key).')
      return
    }
    setAddCardError('')
    setAddCardSecret('')
    setModal('addCard')
    try {
      const { clientSecret } = await createSetupIntent()
      setAddCardSecret(clientSecret)
    } catch (err) {
      say(err.message)
      setModal(null)
    }
  }

  async function onCardAdded() {
    setModal(null)
    setAddCardSecret('')
    say('Card saved.')
    try {
      const list = await getPaymentMethods()
      setCards(list || [])
    } catch {
      /* the card saved; the list will refresh on next load */
    }
  }

  if (!isAuthenticated) return <Navigate to="/login?next=/subscription" replace />

  if (status === 'loading') {
    return (
      <main className="billing">
        <div className="container bl-state">
          <Loader2 size={28} className="ap-spin" />
          <p>Loading your subscription…</p>
        </div>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="billing">
        <div className="container bl-state" role="alert">
          <h1>We couldn’t load your subscription</h1>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={reload}>
            <RefreshCcw size={16} /> Try again
          </button>
        </div>
      </main>
    )
  }

  if (status === 'none') {
    return (
      <main className="billing">
        <div className="container bl-state">
          <span className="bl-state-ico">
            <Sparkles size={22} />
          </span>
          <h1>No active subscription</h1>
          {isMsisdnMode ? (
            <>
              <p>Sign up with your mobile number to start your plan  it&rsquo;s billed to your phone.</p>
              <Link to="/signup" className="btn btn-primary">
                Create your account <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <p>Choose a plan to unlock assessments, ebooks, and counselling each month.</p>
              <Link to="/pricing" className="btn btn-primary">
                View plans <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </main>
    )
  }

  const planName = titleCase(sub.plan?.name)
  const priceLabel = sub.plan ? formatPrice(sub.plan.price, sub.plan.currency) : ''
  const per = sub.interval === 'year' ? 'yr' : 'mo'
  const statusInfo = STATUS[sub.status] || { label: sub.status, cls: 'warn' }
  const endsOn = formatDate(sub.currentPeriodEnd)

  return (
    <main className="billing">
      <div className="container">
        <Reveal as="header" className="bl-head">
          <div>
            <span className="eyebrow">Subscription</span>
            <h1 className="bl-title">Your subscription</h1>
          </div>
        </Reveal>

        {/* current plan */}
        <Reveal className="bl-plan-card" style={{ '--accent': ACCENT }}>
          <div className="bl-plan-main">
            <span className="plan-dot" style={{ background: '#e2dcf8', color: '#4d3da8' }}>
              <Sparkles size={20} />
            </span>
            <div>
              <p className={`bl-plan-status ${statusInfo.cls}`}>
                <span className="bl-status-dot" /> {statusInfo.label}
              </p>
              <h2>{planName} plan</h2>
              <p className="bl-plan-sub">
                {priceLabel}/{per} · {sub.cancelAtPeriodEnd ? `ends ${endsOn}` : `renews ${endsOn}`}
              </p>
            </div>
          </div>
          <div className="bl-plan-actions">
            {isMsisdnMode ? (
              <span className="bl-cancel-note">Billed to your mobile</span>
            ) : sub.cancelAtPeriodEnd ? (
              <span className="bl-cancel-note">Cancels {endsOn}</span>
            ) : (
              sub.status !== 'canceled' && (
                <button className="bl-cancel" onClick={openCancel}>
                  Cancel plan
                </button>
              )
            )}
          </div>
        </Reveal>

        {/* allowance usage */}
        <section className="bl-section">
          <h2 className="bl-section-title">This cycle&rsquo;s allowance</h2>
          <p className="bl-section-sub">
            Resets {endsOn}.{' '}
            {isMsisdnMode
              ? 'When an allowance is used up it refreshes next cycle  mobile billing has no pay-as-you-go.'
              : 'When an allowance is used up, that item switches to pay-as-you-go.'}
          </p>

          <div className="bl-allowance-grid">
            {ALLOWANCE_ROWS.map((row) => {
              const total = sub.allowances?.[row.key]
              const used = sub.usage?.[row.key] ?? 0
              const unlimited = total == null
              const left = unlimited
                ? Infinity
                : (sub.remaining?.[row.key] ?? Math.max(0, total - used))
              const exhausted = !unlimited && left <= 0
              const pct = unlimited ? 30 : total > 0 ? Math.min(100, (used / total) * 100) : 0
              const Icon = row.icon
              return (
                <div className={`bl-allowance ${exhausted ? 'is-exhausted' : ''}`} key={row.key}>
                  <div className="bl-allowance-head">
                    <span className="bl-allowance-ico" style={{ color: row.accent }}>
                      <Icon size={18} />
                    </span>
                    <h3>{row.label}</h3>
                    {exhausted ? (
                      isMsisdnMode ? (
                        <span className="bl-allowance-left bl-used-up">Used up</span>
                      ) : (
                        <span className="bl-badge-payg">
                          <Zap size={12} /> Pay-as-you-go
                        </span>
                      )
                    ) : (
                      <span className="bl-allowance-left">{unlimited ? '∞' : left} left</span>
                    )}
                  </div>

                  <div className="bl-allowance-bar">
                    <i
                      style={{
                        width: `${pct}%`,
                        background: exhausted ? 'var(--danger)' : row.accent,
                      }}
                    />
                  </div>

                  <p className="bl-allowance-meta">
                    {unlimited ? (
                      <>Unlimited on {planName}</>
                    ) : (
                      <>
                        {used} of {total}
                        {row.unit} used this cycle
                      </>
                    )}
                  </p>

                  {exhausted ? (
                    isMsisdnMode ? (
                      <p className="bl-allowance-ok">
                        <RefreshCcw size={13} /> Refreshes {endsOn}
                      </p>
                    ) : (
                      <div className="bl-payg-cta">
                        <Link to={row.to} className="bl-payg-btn">
                          <Plus size={14} /> {row.cta}
                        </Link>
                      </div>
                    )
                  ) : (
                    <p className="bl-allowance-ok">
                      <Check size={13} /> Included in your plan
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* payment methods (Stripe only) */}
        {!isMsisdnMode && (
        <section className="bl-section bl-pay">
          <div className="bl-invoices-head">
            <h2 className="bl-section-title">Payment methods</h2>
            <button className="bl-link-btn" onClick={openAddCard}>
              <Plus size={14} /> Add card
            </button>
          </div>

          {cards.length === 0 ? (
            <p className="bl-empty">No saved cards yet.</p>
          ) : (
            <div className="bl-cards">
              {cards.map((c) => (
                <div className="bl-card-row" key={c.id}>
                  <span className="bl-card-brand">
                    <CreditCard size={18} />
                  </span>
                  <div className="bl-card-info">
                    <strong>
                      {titleCase(c.brand)} •••• {c.last4}
                      {c.isDefault && <span className="bl-card-default">Default</span>}
                    </strong>
                    <small>
                      Expires {String(c.expMonth).padStart(2, '0')}/{c.expYear}
                    </small>
                  </div>
                  <div className="bl-card-actions">
                    {!c.isDefault && (
                      <button
                        className="bl-link-btn"
                        onClick={() => makeDefault(c.id)}
                        disabled={busy}
                      >
                        <Star size={14} /> Make default
                      </button>
                    )}
                    <button
                      className="bl-link-btn danger"
                      onClick={() => removeCard(c.id)}
                      disabled={busy}
                      aria-label="Remove card"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="bl-pay-note">Securely stored by Stripe.</p>
        </section>
        )}

        {/* billing history — subscription + every one-time purchase (Stripe only) */}
        {!isMsisdnMode && (
        <section className="bl-section">
          <div className="bl-invoices-head">
            <h2 className="bl-section-title">Billing history</h2>
            {transactions.length > 0 && (
              <button
                className="bl-link-btn"
                onClick={() =>
                  transactions.forEach((t) => t.receiptUrl && window.open(t.receiptUrl, '_blank'))
                }
              >
                <Download size={14} /> Export all
              </button>
            )}
          </div>
          <p className="bl-section-sub">
            Subscription renewals plus every one-time purchase — assessments, ebooks, audio
            programs, and counselling top-ups.
          </p>
          {transactions.length === 0 ? (
            <p className="bl-empty">No charges yet.</p>
          ) : (
            <div className="bl-invoices">
              {transactions.map((tx) => {
                const kind = TX_KIND[tx.type] || { label: tx.label, cls: 'payg' }
                return (
                  <div className="bl-invoice" key={tx.id}>
                    <span className="bl-inv-date">{formatDate(tx.date)}</span>
                    <span className="bl-inv-desc">
                      {tx.description || kind.label}
                      <em className={`bl-inv-kind ${kind.cls}`}>{kind.label}</em>
                    </span>
                    <span className="bl-inv-amount">{formatPrice(tx.amount, tx.currency)}</span>
                    {tx.receiptUrl ? (
                      <a
                        className="bl-inv-dl"
                        href={tx.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="View receipt"
                      >
                        <ArrowUpRight size={16} />
                      </a>
                    ) : (
                      <span className="bl-inv-dl" aria-hidden="true" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
        )}
      </div>

      {/* toast */}
      <div className="ap-toast-zone" aria-live="polite">
        {toast && (
          <p className="ap-toast">
            <Check size={14} /> {toast}
          </p>
        )}
      </div>

      {/* cancel modal */}
      {modal === 'cancel' && (
        <div
          className="ap-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Cancel plan"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="ap-modal bl-cancel-modal">
            <h3>Before you go…</h3>
            <p className="bl-cancel-lede">
              You&rsquo;ll keep {planName} until {endsOn}, then move to pay-as-you-go everything
              you&rsquo;ve unlocked stays yours.
            </p>

            {cancelError && (
              <p className="checkout-error" role="alert">
                {cancelError}
              </p>
            )}

            <fieldset className="bl-survey">
              <legend className="bl-survey-q">
                Tell us why you&rsquo;re canceling <span className="bl-req">*</span>
              </legend>
              <div className="bl-survey-opts">
                {CANCEL_REASONS.map((r) => (
                  <label key={r.key} className={`bl-radio ${reason === r.key ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="cancel-reason"
                      value={r.key}
                      checked={reason === r.key}
                      onChange={() => {
                        setReason(r.key)
                        setCancelError('')
                      }}
                    />
                    <span className="bl-radio-dot" />
                    {r.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="bl-survey">
              <legend className="bl-survey-q">Would you have stayed if we offered:</legend>
              <div className="bl-survey-opts">
                {WOULD_STAY_FOR.map((o) => {
                  const on = wouldStayFor.includes(o.key)
                  return (
                    <label key={o.key} className={`bl-check ${on ? 'checked' : ''}`}>
                      <input type="checkbox" checked={on} onChange={() => toggleWouldStay(o.key)} />
                      <span className="bl-check-box">
                        <Check size={12} />
                      </span>
                      {o.label}
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div className="ap-modal-actions">
              <button
                className="bl-cancel-confirm"
                onClick={confirmCancel}
                disabled={busy || !reason}
              >
                {busy ? (
                  <>
                    <Loader2 size={16} className="ap-spin" /> Cancelling…
                  </>
                ) : (
                  'Confirm cancellation'
                )}
              </button>
              <button className="ap-ghostlink" onClick={() => setModal(null)} disabled={busy}>
                Back
              </button>
            </div>
            <button className="ap-modal-close" onClick={() => setModal(null)} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* add-card modal */}
      {modal === 'addCard' && (
        <div
          className="ap-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Add a card"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="ap-modal bl-addcard-modal">
            <h3>Add a card</h3>
            {addCardError && (
              <p className="checkout-error" role="alert">
                {addCardError}
              </p>
            )}
            {addCardSecret ? (
              <Elements
                stripe={stripePromise}
                options={{ clientSecret: addCardSecret, appearance: STRIPE_APPEARANCE }}
              >
                <AddCardForm onSaved={onCardAdded} onError={setAddCardError} />
              </Elements>
            ) : (
              <div className="checkout-status checkout-status-inline">
                <Loader2 size={22} className="ap-spin" />
                <p>Preparing secure form…</p>
              </div>
            )}
            <button className="ap-modal-close" onClick={() => setModal(null)} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
