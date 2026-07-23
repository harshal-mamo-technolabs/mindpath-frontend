import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router-dom'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
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

// Billing-history category → badge class (label is translated per key).
const TX_KIND_CLS = {
  subscription: 'subscription',
  assessment: 'assessment',
  ebook: 'ebook',
  audio: 'audio',
  counselling: 'counselling',
  payg: 'payg',
}

const ACCENT = '#6450cf'

// Dark Card Element style for the add-card modal (card-only — no Link/contact fields).
const CARD_STYLE = {
  hidePostalCode: true,
  style: {
    base: {
      fontFamily: 'Manrope, sans-serif',
      fontSize: '15px',
      fontWeight: '600',
      color: '#ece9fa',
      '::placeholder': { color: '#8a83a8', fontWeight: '500' },
    },
    invalid: { color: '#e2725b' },
  },
}

// Plan names arrive lowercase from the API ("balance") — capitalize for display.
const titleCase = (s) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase())

const formatDate = (iso, locale = 'en-US') =>
  iso
    ? new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

// status → the dot modifier class on .bl-plan-status (label is translated per code)
const STATUS_CLS = {
  active: 'live',
  trialing: 'live',
  past_due: 'warn',
  incomplete: 'warn',
  canceled: 'off',
}

// allowance/usage/remaining keys come straight from /subscriptions/me
// (label + cta are translated per key under billing.allowance.<key>)
const ALLOWANCE_ROWS = [
  { key: 'assessments', icon: ClipboardList, unit: '', accent: '#4d3da8', to: '/assessments' },
  { key: 'ebooks', icon: BookOpen, unit: '', accent: '#8a5420', to: '/ebooks' },
  {
    key: 'counsellingMinutes',
    icon: MessagesSquare,
    unit: ' min',
    accent: '#2e5f49',
    to: '/counselling',
  },
]

/** Add-a-card form — lives inside <Elements>; confirms a SetupIntent with the Card Element. */
function AddCardForm({ clientSecret, onSaved, onError }) {
  const { t } = useTranslation()
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    onError('')
    const { error } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    })
    if (error) {
      onError(error.message || t('billing.cardSaveFailed'))
      setSubmitting(false)
      return
    }
    await onSaved()
  }

  return (
    <form onSubmit={handleSave} className="checkout-form">
      <label className="apl-payform-label">{t('billing.cardDetailsLabel')}</label>
      <div className="apl-cardfield">
        <CardElement options={CARD_STYLE} />
      </div>
      <button className="btn btn-primary checkout-pay" disabled={!stripe || submitting}>
        {submitting ? (
          <>
            <Loader2 size={17} className="ap-spin" /> {t('billing.saving')}
          </>
        ) : (
          t('billing.saveCard')
        )}
      </button>
    </form>
  )
}

export default function BillingPage() {
  const { t, i18n } = useTranslation()
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
      setCancelError(t('billing.chooseReason'))
      return
    }
    setBusy(true)
    setCancelError('')
    try {
      const updated = await cancelSubscription({ reason, wouldStayFor })
      setSub((prev) => ({ ...prev, ...updated }))
      setModal(null)
      say(t('billing.toastPlanEnds', { date: formatDate(updated.currentPeriodEnd, i18n.language) }))
    } catch (err) {
      if (err.status === 401) {
        logout() // token expired → the auth gate redirects to /login
      } else if (err.status === 404) {
        setModal(null)
        reload() // no active subscription anymore — refresh /me
      } else {
        // 422 (invalid/missing reason) or anything else — keep the modal open
        setCancelError(err.message || t('billing.cancelFailed'))
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
      say(t('billing.toastDefaultUpdated'))
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
      say(t('billing.toastCardRemoved'))
    } catch (err) {
      say(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function openAddCard() {
    if (!stripeConfigured) {
      say(t('billing.paymentsNotSetup'))
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
    say(t('billing.toastCardSaved'))
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
          <p>{t('billing.loading')}</p>
        </div>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="billing">
        <div className="container bl-state" role="alert">
          <h1>{t('billing.errorTitle')}</h1>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={reload}>
            <RefreshCcw size={16} /> {t('billing.tryAgain')}
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
          <h1>{t('billing.noneTitle')}</h1>
          {isMsisdnMode ? (
            <>
              <p>{t('billing.noneMsisdnBody')}</p>
              <Link to="/signup" className="btn btn-primary">
                {t('billing.createAccount')} <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <p>{t('billing.noneBody')}</p>
              <Link to="/pricing" className="btn btn-primary">
                {t('billing.viewPlans')} <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </main>
    )
  }

  const planName = titleCase(sub.plan?.name)
  const priceLabel = sub.plan ? formatPrice(sub.plan.price, sub.plan.currency) : ''
  const per = sub.interval === 'year' ? t('billing.perYr') : t('billing.perMo')
  const statusCls = STATUS_CLS[sub.status] || 'warn'
  const statusLabel = STATUS_CLS[sub.status] ? t(`billing.status.${sub.status}`) : sub.status
  const endsOn = formatDate(sub.currentPeriodEnd, i18n.language)
  const reasonLabels = t('billing.cancelReasons', { returnObjects: true })
  const stayLabels = t('billing.wouldStayFor', { returnObjects: true })

  return (
    <main className="billing">
      <div className="container">
        <Reveal as="header" className="bl-head">
          <div>
            <span className="eyebrow">{t('billing.eyebrow')}</span>
            <h1 className="bl-title">{t('billing.title')}</h1>
          </div>
        </Reveal>

        {/* current plan */}
        <Reveal className="bl-plan-card" style={{ '--accent': ACCENT }}>
          <div className="bl-plan-main">
            <span className="plan-dot" style={{ background: '#e2dcf8', color: '#4d3da8' }}>
              <Sparkles size={20} />
            </span>
            <div>
              <p className={`bl-plan-status ${statusCls}`}>
                <span className="bl-status-dot" /> {statusLabel}
              </p>
              <h2>{t('billing.planLabel', { name: planName })}</h2>
              <p className="bl-plan-sub">
                {priceLabel}/{per} ·{' '}
                {sub.cancelAtPeriodEnd
                  ? t('billing.endsShort', { date: endsOn })
                  : t('billing.renewsShort', { date: endsOn })}
              </p>
            </div>
          </div>
          <div className="bl-plan-actions">
            {isMsisdnMode ? (
              <span className="bl-cancel-note">{t('billing.billedToMobile')}</span>
            ) : sub.cancelAtPeriodEnd ? (
              <span className="bl-cancel-note">{t('billing.cancelsOn', { date: endsOn })}</span>
            ) : (
              sub.status !== 'canceled' && (
                <button className="bl-cancel" onClick={openCancel}>
                  {t('billing.cancelPlan')}
                </button>
              )
            )}
          </div>
        </Reveal>

        {/* allowance usage */}
        <section className="bl-section">
          <h2 className="bl-section-title">{t('billing.includedTitle')}</h2>
          <p className="bl-section-sub">
            {t('billing.resetsOn', { date: endsOn })}{' '}
            {isMsisdnMode ? t('billing.resetsMsisdn') : t('billing.resetsStripe')}
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
                    <h3>{t(`billing.allowance.${row.key}.label`)}</h3>
                    {exhausted ? (
                      isMsisdnMode ? (
                        <span className="bl-allowance-left bl-used-up">{t('billing.usedUp')}</span>
                      ) : (
                        <span className="bl-badge-payg">
                          <Zap size={12} /> {t('billing.payPerItem')}
                        </span>
                      )
                    ) : (
                      <span className="bl-allowance-left">
                        {unlimited ? t('billing.leftInfinite') : t('billing.left', { count: left })}
                      </span>
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
                    {unlimited
                      ? t('billing.unlimitedOn', { name: planName })
                      : row.unit
                        ? t('billing.usageMetaMin', { used, total })
                        : t('billing.usageMeta', { used, total })}
                  </p>

                  {exhausted ? (
                    isMsisdnMode ? (
                      <p className="bl-allowance-ok">
                        <RefreshCcw size={13} /> {t('billing.comesBack', { date: endsOn })}
                      </p>
                    ) : (
                      <div className="bl-payg-cta">
                        <Link to={row.to} className="bl-payg-btn">
                          <Plus size={14} /> {t(`billing.allowance.${row.key}.cta`)}
                        </Link>
                      </div>
                    )
                  ) : (
                    <p className="bl-allowance-ok">
                      <Check size={13} /> {t('billing.includedInPlan')}
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
            <h2 className="bl-section-title">{t('billing.paymentMethods')}</h2>
            <button className="bl-link-btn" onClick={openAddCard}>
              <Plus size={14} /> {t('billing.addCard')}
            </button>
          </div>

          {cards.length === 0 ? (
            <p className="bl-empty">{t('billing.noCards')}</p>
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
                      {c.isDefault && <span className="bl-card-default">{t('billing.default')}</span>}
                    </strong>
                    <small>
                      {t('billing.expires', {
                        exp: `${String(c.expMonth).padStart(2, '0')}/${c.expYear}`,
                      })}
                    </small>
                  </div>
                  <div className="bl-card-actions">
                    {!c.isDefault && (
                      <button
                        className="bl-link-btn"
                        onClick={() => makeDefault(c.id)}
                        disabled={busy}
                      >
                        <Star size={14} /> {t('billing.makeDefault')}
                      </button>
                    )}
                    <button
                      className="bl-link-btn danger"
                      onClick={() => removeCard(c.id)}
                      disabled={busy}
                      aria-label={t('billing.removeCardAria')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="bl-pay-note">{t('billing.securelyStored')}</p>
        </section>
        )}

        {/* billing history — subscription + every one-time purchase (Stripe only) */}
        {!isMsisdnMode && (
        <section className="bl-section">
          <div className="bl-invoices-head">
            <h2 className="bl-section-title">{t('billing.historyTitle')}</h2>
            {transactions.length > 0 && (
              <button
                className="bl-link-btn"
                onClick={() =>
                  transactions.forEach((tx) => tx.receiptUrl && window.open(tx.receiptUrl, '_blank'))
                }
              >
                <Download size={14} /> {t('billing.exportAll')}
              </button>
            )}
          </div>
          <p className="bl-section-sub">{t('billing.historySub')}</p>
          {transactions.length === 0 ? (
            <p className="bl-empty">{t('billing.noCharges')}</p>
          ) : (
            <div className="bl-invoices">
              {transactions.map((tx) => {
                const kindCls = TX_KIND_CLS[tx.type] || 'payg'
                const kindLabel = TX_KIND_CLS[tx.type] ? t(`billing.txKind.${tx.type}`) : tx.label
                return (
                  <div className="bl-invoice" key={tx.id}>
                    <span className="bl-inv-date">{formatDate(tx.date, i18n.language)}</span>
                    <span className="bl-inv-desc">
                      {tx.description || kindLabel}
                      <em className={`bl-inv-kind ${kindCls}`}>{kindLabel}</em>
                    </span>
                    <span className="bl-inv-amount">{formatPrice(tx.amount, tx.currency)}</span>
                    {tx.receiptUrl ? (
                      <a
                        className="bl-inv-dl"
                        href={tx.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={t('billing.viewReceiptAria')}
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
          aria-label={t('billing.cancelPlan')}
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="ap-modal bl-cancel-modal">
            <h3>{t('billing.cancelHeading')}</h3>
            <p className="bl-cancel-lede">
              {t('billing.cancelLede', { name: planName, date: endsOn })}
            </p>

            {cancelError && (
              <p className="checkout-error" role="alert">
                {cancelError}
              </p>
            )}

            <fieldset className="bl-survey">
              <legend className="bl-survey-q">
                {t('billing.surveyReasonQ')} <span className="bl-req">*</span>
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
                    {reasonLabels[r.key]}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="bl-survey">
              <legend className="bl-survey-q">{t('billing.surveyStayQ')}</legend>
              <div className="bl-survey-opts">
                {WOULD_STAY_FOR.map((o) => {
                  const on = wouldStayFor.includes(o.key)
                  return (
                    <label key={o.key} className={`bl-check ${on ? 'checked' : ''}`}>
                      <input type="checkbox" checked={on} onChange={() => toggleWouldStay(o.key)} />
                      <span className="bl-check-box">
                        <Check size={12} />
                      </span>
                      {stayLabels[o.key]}
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
                    <Loader2 size={16} className="ap-spin" /> {t('billing.cancelling')}
                  </>
                ) : (
                  t('billing.yesCancel')
                )}
              </button>
              <button className="ap-ghostlink" onClick={() => setModal(null)} disabled={busy}>
                {t('billing.back')}
              </button>
            </div>
            <button
              className="ap-modal-close"
              onClick={() => setModal(null)}
              aria-label={t('billing.close')}
            >
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
          aria-label={t('billing.addCardTitle')}
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="ap-modal bl-addcard-modal">
            <h3>{t('billing.addCardTitle')}</h3>
            {addCardError && (
              <p className="checkout-error" role="alert">
                {addCardError}
              </p>
            )}
            {addCardSecret ? (
              <Elements stripe={stripePromise}>
                <AddCardForm
                  clientSecret={addCardSecret}
                  onSaved={onCardAdded}
                  onError={setAddCardError}
                />
              </Elements>
            ) : (
              <div className="checkout-status checkout-status-inline">
                <Loader2 size={22} className="ap-spin" />
                <p>{t('billing.preparingForm')}</p>
              </div>
            )}
            <button
              className="ap-modal-close"
              onClick={() => setModal(null)}
              aria-label={t('billing.close')}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
