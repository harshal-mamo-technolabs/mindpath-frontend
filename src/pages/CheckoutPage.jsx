import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
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
import { stripeConfigured, stripePromise } from '../lib/stripe.js'
import { formatPrice, getPlans } from '../lib/plans.js'
import { createSubscription, getPaymentMethods, waitForActive } from '../lib/payments.js'

const ACCENT = '#6450cf'

// Plan names arrive lowercase from the API ("calm") — capitalize for display.
const titleCase = (s) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase())

// Style the Stripe Payment Element to match the app.
const STRIPE_APPEARANCE = {
  theme: 'stripe',
  variables: {
    colorPrimary: ACCENT,
    fontFamily: 'Manrope, sans-serif',
    borderRadius: '12px',
  },
}

/** The new-card form — must live inside <Elements>. Confirms the payment
 *  (Stripe.js shows the 3D Secure modal automatically when required). */
function NewCardForm({ onConfirmed, onError, priceLabel }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)

  async function handlePay(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    onError('')
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/subscription` },
      redirect: 'if_required', // stay on the page unless the bank forces a redirect
    })
    if (error) {
      onError(error.message || 'Your card could not be charged. Please try another card.')
      setSubmitting(false)
      return
    }
    await onConfirmed()
  }

  return (
    <form onSubmit={handlePay} className="checkout-form">
      <PaymentElement options={{ paymentMethodOrder: ['card'] }} />
      <button className="btn btn-primary checkout-pay" disabled={!stripe || submitting}>
        {submitting ? (
          <>
            <Loader2 size={17} className="ap-spin" /> Processing…
          </>
        ) : (
          <>
            <Lock size={16} /> Pay {priceLabel}
          </>
        )}
      </button>
      <p className="checkout-secure">
        <ShieldCheck size={14} /> Secured by Stripe. Test mode — use card 4242 4242 4242 4242.
      </p>
    </form>
  )
}

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth()
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
          setError('That plan is no longer available.')
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
      if (!stripe) throw new Error('Payments are not configured (missing Stripe key).')
      const { error: stripeErr } = await stripe.confirmCardPayment(secret, {
        payment_method: selectedCardId,
      })
      if (stripeErr) throw new Error(stripeErr.message || 'Your card could not be charged.')
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
          <Lock size={13} /> Secure checkout
        </p>
        <Link to="/pricing" className="take-exit" aria-label="Back to pricing">
          <ArrowLeft size={19} />
        </Link>
      </header>

      {status === 'loading' && (
        <div className="checkout-status">
          <Loader2 size={30} className="ap-spin" />
          <p>Preparing your checkout…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="checkout-status" role="alert">
          <h1>Something went wrong</h1>
          <p>{error}</p>
          <div className="checkout-done-actions">
            <button className="btn btn-primary" onClick={retryLoad}>
              <RefreshCcw size={16} /> Try again
            </button>
            <Link to="/pricing" className="btn btn-ghost">
              Back to plans
            </Link>
          </div>
        </div>
      )}

      {status === 'finalizing' && (
        <div className="checkout-status">
          <Loader2 size={30} className="ap-spin" />
          <h1>Finalizing your subscription…</h1>
          <p>Confirming your payment. This only takes a moment.</p>
        </div>
      )}

      {(status === 'done' || status === 'pending') && (
        <div className="checkout-done">
          <span className="ap-done-check">
            <Check size={28} />
          </span>
          {status === 'done' ? (
            <>
              <h1>You&rsquo;re on {name}.</h1>
              {subscription?.allowances ? (
                <p>
                  {subscription.allowances.assessments} assessments,{' '}
                  {subscription.allowances.ebooks} ebooks, and{' '}
                  {subscription.allowances.counsellingMinutes} counselling minutes are unlocked this
                  cycle.
                </p>
              ) : (
                <p>Your plan is active.</p>
              )}
            </>
          ) : (
            <>
              <h1>Payment received.</h1>
              <p>
                We&rsquo;re finalizing your {name} subscription it usually activates within a
                moment. You can refresh your subscription page shortly.
              </p>
            </>
          )}
          <div className="checkout-done-actions">
            <Link to="/dashboard" className="btn btn-primary">
              Go to dashboard
            </Link>
            <Link to="/subscription" className="btn btn-ghost">
              View subscription
            </Link>
          </div>
        </div>
      )}

      {status === 'ready' && plan && (
        <main className="checkout-grid">
          <section className="checkout-form-side">
            <Link to="/pricing" className="crumb">
              <ArrowLeft size={15} /> Change plan
            </Link>
            <h1>Start your {name} plan</h1>
            <p className="checkout-lede">Billed monthly · cancel anytime from your billing page.</p>

            {error && (
              <p className="checkout-error" role="alert">
                {error}
              </p>
            )}

            {!stripeConfigured && (
              <p className="checkout-error" role="alert">
                Payments aren’t configured. Add <code>VITE_STRIPE_PUBLISHABLE_KEY</code> to{' '}
                <code>.env</code> and restart the dev server.
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
                          Expires {String(c.expMonth).padStart(2, '0')}/{c.expYear}
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
                      <Loader2 size={17} className="ap-spin" /> Processing…
                    </>
                  ) : (
                    <>
                      <Lock size={16} /> Pay {priceLabel}
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
                  Pay with a new card instead
                </button>
                <p className="checkout-secure">
                  <ShieldCheck size={14} /> Secured by Stripe · 3D Secure handled automatically.
                </p>
              </>
            )}

            {stripeConfigured &&
              useNewCard &&
              (clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
                >
                  <NewCardForm onConfirmed={finalize} onError={setError} priceLabel={priceLabel} />
                </Elements>
              ) : (
                <div className="checkout-status checkout-status-inline">
                  <Loader2 size={24} className="ap-spin" />
                  <p>Preparing secure card form…</p>
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
                ← Use a saved card
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
                  <h3>{name} plan</h3>
                  <p>Monthly billing</p>
                </div>
                <strong>{priceLabel}</strong>
              </div>

              <ul className="checkout-includes">
                <li>
                  <ClipboardList size={15} /> {plan.allowedAssessments} assessments / month
                </li>
                <li>
                  <BookOpen size={15} /> {plan.allowedEbooks} ebooks / month
                </li>
                <li>
                  <MessagesSquare size={15} /> {plan.allowedCounsellingMinutes} min counselling /
                  month
                </li>
              </ul>

              <div className="checkout-totals">
                <div className="checkout-total-row">
                  <span>Due today</span>
                  <span>{priceLabel}</span>
                </div>
              </div>

              <p className="checkout-renew">Renews monthly · cancel anytime.</p>
            </div>
          </aside>
        </main>
      )}
    </div>
  )
}
