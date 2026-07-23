import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  BookOpen,
  Check,
  ClipboardList,
  CreditCard,
  Loader2,
  Lock,
  MessagesSquare,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useTheme } from '../hooks/useTheme.js'
import { stripeConfigured, stripePromise } from '../lib/stripe.js'
import { formatPrice, getPlans } from '../lib/plans.js'
import { createSubscription, getPaymentMethods, waitForActive } from '../lib/payments.js'

const ACCENT = '#6450cf'

// Plan names arrive lowercase from the API ("calm") — capitalize for display.
const titleCase = (s) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase())

// Theme-aware styling for the Stripe Card Element (card-only — no Link/contact fields).
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

/** The new-card form — must live inside <Elements>. Confirms the payment with the split
 *  Card Element (Stripe.js shows the 3D Secure modal automatically when required). */
function NewCardForm({ clientSecret, onConfirmed, onError, priceLabel }) {
  const stripe = useStripe()
  const elements = useElements()
  const { theme } = useTheme()
  const { t } = useTranslation()
  const [submitting, setSubmitting] = useState(false)

  async function handlePay(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    onError('')
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    })
    if (error) {
      onError(error.message || t('checkout.errorChargeFailedRetry'))
      setSubmitting(false)
      return
    }
    await onConfirmed()
  }

  return (
    <form onSubmit={handlePay} className="checkout-form">
      <label className="checkout-card-label">{t('checkout.cardDetails')}</label>
      <div className="checkout-card-field">
        <CardElement options={{ style: cardStyle(theme === 'dark'), hidePostalCode: true }} />
      </div>
      <button className="btn btn-primary checkout-pay" disabled={!stripe || submitting}>
        {submitting ? (
          <>
            <Loader2 size={17} className="ap-spin" /> {t('checkout.processing')}
          </>
        ) : (
          <>
            <Lock size={16} /> {t('checkout.pay', { price: priceLabel })}
          </>
        )}
      </button>
      <p className="checkout-secure">
        <ShieldCheck size={14} /> {t('checkout.secureTest')}
      </p>
    </form>
  )
}

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const planId = params.get('plan')

  const [status, setStatus] = useState('loading') // loading | ready | finalizing | pending | done | error
  const [plan, setPlan] = useState(null)
  const [cards, setCards] = useState([])
  const [selectedCardId, setSelectedCardId] = useState(null)
  const [useNewCard, setUseNewCard] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const [subscription, setSubscription] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  // Load the chosen plan + any saved cards.
  useEffect(() => {
    if (!isAuthenticated || !planId) return
    let alive = true
    ;(async () => {
      try {
        const [plans, methods] = await Promise.all([getPlans(), getPaymentMethods()])
        if (!alive) return
        const found = plans.find((p) => p._id === planId)
        if (!found) {
          setError(t('checkout.errorPlanUnavailable'))
          setStatus('error')
          return
        }
        const saved = methods || []
        setPlan(found)
        setCards(saved)
        setSelectedCardId(saved.find((c) => c.isDefault)?.id || saved[0]?.id || null)
        setUseNewCard(saved.length === 0)
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
  }, [isAuthenticated, planId, reloadKey])

  // The new-card path needs a clientSecret before the Payment Element can mount.
  useEffect(() => {
    if (status !== 'ready' || !useNewCard || clientSecret || !plan) return
    let alive = true
    ;(async () => {
      try {
        const data = await createSubscription({ planId: plan._id })
        if (alive) setClientSecret(data.clientSecret)
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
  }, [status, useNewCard, clientSecret, plan])

  // Payment confirmed → poll until the webhook flips the subscription to active.
  async function finalize() {
    setStatus('finalizing')
    try {
      const sub = await waitForActive()
      if (sub) {
        setSubscription(sub)
        setStatus('done')
      } else {
        setStatus('pending')
      }
    } catch {
      // Payment most likely succeeded; activation is just lagging.
      setStatus('pending')
    }
  }

  // One-click with a saved card.
  async function payWithSavedCard() {
    if (!selectedCardId) return
    setBusy(true)
    setError('')
    try {
      const { clientSecret: secret } = await createSubscription({
        planId: plan._id,
        paymentMethodId: selectedCardId,
      })
      const stripe = await stripePromise
      if (!stripe) throw new Error(t('checkout.errorStripeMissing'))
      const { error: stripeErr } = await stripe.confirmCardPayment(secret, {
        payment_method: selectedCardId,
      })
      if (stripeErr) throw new Error(stripeErr.message || t('checkout.errorChargeFailed'))
      await finalize()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const retryLoad = () => {
    setStatus('loading')
    setError('')
    setClientSecret('')
    setReloadKey((k) => k + 1)
  }

  if (!isAuthenticated) {
    const next = `/checkout${planId ? `?plan=${planId}` : ''}`
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }
  if (!planId) return <Navigate to="/pricing" replace />

  const name = titleCase(plan?.name)
  const priceLabel = plan ? formatPrice(plan.price, plan.currency) : ''

  return (
    <div className="checkout" style={{ '--accent': ACCENT }}>
      <header className="take-bar">
        <Logo />
        <p className="take-topic">
          <Lock size={13} /> {t('checkout.secureCheckout')}
        </p>
        <Link to="/pricing" className="take-exit" aria-label={t('checkout.backToPricingAria')}>
          <ArrowLeft size={19} />
        </Link>
      </header>

      {status === 'loading' && (
        <div className="checkout-status">
          <Loader2 size={30} className="ap-spin" />
          <p>{t('checkout.loading')}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="checkout-status" role="alert">
          <h1>{t('checkout.errorTitle')}</h1>
          <p>{error}</p>
          <div className="checkout-done-actions">
            <button className="btn btn-primary" onClick={retryLoad}>
              <RefreshCcw size={16} /> {t('checkout.tryAgain')}
            </button>
            <Link to="/pricing" className="btn btn-ghost">
              {t('checkout.backToPlans')}
            </Link>
          </div>
        </div>
      )}

      {status === 'finalizing' && (
        <div className="checkout-status">
          <Loader2 size={30} className="ap-spin" />
          <h1>{t('checkout.finalizingTitle')}</h1>
          <p>{t('checkout.finalizingBody')}</p>
        </div>
      )}

      {(status === 'done' || status === 'pending') && (
        <div className="checkout-done">
          <span className="ap-done-check">
            <Check size={28} />
          </span>
          {status === 'done' ? (
            <>
              <h1>{t('checkout.doneTitle', { plan: name })}</h1>
              {subscription?.allowances ? (
                <p>
                  {t('checkout.doneAllowances', {
                    assessments: subscription.allowances.assessments,
                    ebooks: subscription.allowances.ebooks,
                    minutes: subscription.allowances.counsellingMinutes,
                  })}
                </p>
              ) : (
                <p>{t('checkout.doneActive')}</p>
              )}
            </>
          ) : (
            <>
              <h1>{t('checkout.pendingTitle')}</h1>
              <p>{t('checkout.pendingBody', { plan: name })}</p>
            </>
          )}
          <div className="checkout-done-actions">
            <Link to="/dashboard" className="btn btn-primary">
              {t('checkout.goToDashboard')}
            </Link>
            <Link to="/subscription" className="btn btn-ghost">
              {t('checkout.viewSubscription')}
            </Link>
          </div>
        </div>
      )}

      {status === 'ready' && plan && (
        <main className="checkout-grid">
          <section className="checkout-form-side">
            <Link to="/pricing" className="crumb">
              <ArrowLeft size={15} /> {t('checkout.changePlan')}
            </Link>
            <h1>{t('checkout.startPlanTitle', { plan: name })}</h1>
            <p className="checkout-lede">{t('checkout.lede')}</p>

            {error && (
              <p className="checkout-error" role="alert">
                {error}
              </p>
            )}

            {!stripeConfigured && (
              <p className="checkout-error" role="alert">
                {t('checkout.stripeMissingPre')}
                <code>VITE_STRIPE_PUBLISHABLE_KEY</code>
                {t('checkout.stripeMissingMid')}
                <code>.env</code>
                {t('checkout.stripeMissingPost')}
              </p>
            )}

            {stripeConfigured && !useNewCard && cards.length > 0 && (
              <>
                <div className="pay-methods">
                  {cards.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      className={`pay-card ${selectedCardId === c.id ? 'selected' : ''}`}
                      onClick={() => setSelectedCardId(c.id)}
                      aria-pressed={selectedCardId === c.id}
                    >
                      <CreditCard size={18} />
                      <span className="pay-card-info">
                        <strong>
                          {c.brand} •••• {c.last4}
                        </strong>
                        <small>
                          {t('checkout.cardExpires', {
                            month: String(c.expMonth).padStart(2, '0'),
                            year: c.expYear,
                          })}
                        </small>
                      </span>
                      {selectedCardId === c.id && <Check size={16} className="pay-card-check" />}
                    </button>
                  ))}
                </div>
                <button
                  className="btn btn-primary checkout-pay"
                  onClick={payWithSavedCard}
                  disabled={busy || !selectedCardId}
                >
                  {busy ? (
                    <>
                      <Loader2 size={17} className="ap-spin" /> {t('checkout.processing')}
                    </>
                  ) : (
                    <>
                      <Lock size={16} /> {t('checkout.pay', { price: priceLabel })}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="pay-switch"
                  onClick={() => {
                    setUseNewCard(true)
                    setError('')
                  }}
                >
                  {t('checkout.payNewCard')}
                </button>
                <p className="checkout-secure">
                  <ShieldCheck size={14} /> {t('checkout.secureSaved')}
                </p>
              </>
            )}

            {stripeConfigured &&
              useNewCard &&
              (clientSecret ? (
                <Elements stripe={stripePromise}>
                  <NewCardForm
                    clientSecret={clientSecret}
                    onConfirmed={finalize}
                    onError={setError}
                    priceLabel={priceLabel}
                  />
                </Elements>
              ) : (
                <div className="checkout-status checkout-status-inline">
                  <Loader2 size={24} className="ap-spin" />
                  <p>{t('checkout.cardFormLoading')}</p>
                </div>
              ))}

            {stripeConfigured && useNewCard && cards.length > 0 && (
              <button
                type="button"
                className="pay-switch"
                onClick={() => {
                  setUseNewCard(false)
                  setError('')
                }}
              >
                {t('checkout.useSavedCard')}
              </button>
            )}
          </section>

          <aside className="checkout-summary">
            <div className="checkout-summary-card">
              <div className="checkout-plan">
                <span className="plan-dot" style={{ background: '#e2dcf8', color: '#4d3da8' }}>
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3>{t('checkout.summaryPlan', { plan: name })}</h3>
                  <p>{t('checkout.summaryBilled')}</p>
                </div>
                <strong>{priceLabel}</strong>
              </div>

              <ul className="checkout-includes">
                <li>
                  <ClipboardList size={15} />{' '}
                  {t('checkout.summaryAssessments', { count: plan.allowedAssessments })}
                </li>
                <li>
                  <BookOpen size={15} /> {t('checkout.summaryEbooks', { count: plan.allowedEbooks })}
                </li>
                <li>
                  <MessagesSquare size={15} />{' '}
                  {t('checkout.summaryMinutes', { count: plan.allowedCounsellingMinutes })}
                </li>
              </ul>

              <div className="checkout-totals">
                <div className="checkout-total-row">
                  <span>{t('checkout.dueToday')}</span>
                  <span>{priceLabel}</span>
                </div>
              </div>

              <p className="checkout-renew">{t('checkout.renew')}</p>
            </div>
          </aside>
        </main>
      )}
    </div>
  )
}
