import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ClipboardList,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { getPlan, priceFor } from '../data/billing.js'

function formatCard(v) {
  return v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

export default function CheckoutPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const plan = getPlan(params.get('plan')) || getPlan('balance')
  const cycle = params.get('cycle') === 'yearly' ? 'yearly' : 'monthly'

  const [card, setCard] = useState({ name: '', number: '', exp: '', cvc: '' })
  const [status, setStatus] = useState('idle')

  if (!plan) return <Navigate to="/pricing" replace />

  const total = priceFor(plan, cycle)
  const tax = Math.round(total * 0.08)

  function pay(e) {
    e.preventDefault()
    if (status !== 'idle') return
    setStatus('processing')
    setTimeout(() => {
      setStatus('done')
      setTimeout(() => navigate('/subscription'), 1700)
    }, 1700)
  }

  if (status === 'done') {
    return (
      <div className="checkout-done">
        <span className="ap-done-check">
          <Check size={28} />
        </span>
        <h1>You&rsquo;re on {plan.name}.</h1>
        <p>
          {plan.allowances.assessments} assessments, {plan.allowances.ebooks} ebooks, and{' '}
          {plan.allowances.counselling} counselling minutes are unlocked this cycle.
        </p>
        <p className="checkout-done-sub">Taking you to your billing dashboard…</p>
      </div>
    )
  }

  return (
    <div className="checkout" style={{ '--accent': plan.accent }}>
      <header className="take-bar">
        <Logo />
        <p className="take-topic">
          <Lock size={13} /> Secure checkout
        </p>
        <Link to="/pricing" className="take-exit" aria-label="Back to pricing">
          <ArrowLeft size={19} />
        </Link>
      </header>

      <main className="checkout-grid">
        {/* payment form */}
        <section className="checkout-form-side">
          <Link to="/pricing" className="crumb">
            <ArrowLeft size={15} /> Change plan
          </Link>
          <h1>Start your {plan.name} plan</h1>
          <p className="checkout-lede">
            {cycle === 'yearly' ? 'Billed yearly' : 'Billed monthly'} · cancel anytime from
            your billing page.
          </p>

          <form onSubmit={pay} className="checkout-form">
            <label className="auth-field">
              <span className="auth-label">Name on card</span>
              <span className="auth-input">
                <CreditCard size={16} />
                <input
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  placeholder="Maya Kapoor"
                  autoComplete="cc-name"
                  required
                />
              </span>
            </label>

            <label className="auth-field">
              <span className="auth-label">Card number</span>
              <span className="auth-input">
                <CreditCard size={16} />
                <input
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                  required
                />
              </span>
            </label>

            <div className="checkout-row">
              <label className="auth-field">
                <span className="auth-label">Expiry</span>
                <span className="auth-input">
                  <input
                    value={card.exp}
                    onChange={(e) =>
                      setCard({
                        ...card,
                        exp: e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 4)
                          .replace(/(.{2})(.+)/, '$1 / $2'),
                      })
                    }
                    placeholder="MM / YY"
                    inputMode="numeric"
                    required
                  />
                </span>
              </label>
              <label className="auth-field">
                <span className="auth-label">CVC</span>
                <span className="auth-input">
                  <input
                    value={card.cvc}
                    onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="123"
                    inputMode="numeric"
                    required
                  />
                </span>
              </label>
            </div>

            <button className="btn btn-primary checkout-pay" disabled={status === 'processing'}>
              {status === 'processing' ? (
                <>
                  <Loader2 size={17} className="ap-spin" /> Processing…
                </>
              ) : (
                <>
                  <Lock size={16} /> Subscribe · ${total + tax}
                </>
              )}
            </button>

            <p className="checkout-secure">
              <ShieldCheck size={14} /> Demo checkout  no card is charged. Real payments are
              processed by Stripe.
            </p>
          </form>
        </section>

        {/* order summary */}
        <aside className="checkout-summary">
          <div className="checkout-summary-card">
            <div className="checkout-plan">
              <span className="plan-dot" style={{ background: plan.bg, color: plan.fg }}>
                <Sparkles size={18} />
              </span>
              <div>
                <h3>{plan.name} plan</h3>
                <p>{cycle === 'yearly' ? 'Yearly billing' : 'Monthly billing'}</p>
              </div>
              <strong>${total}</strong>
            </div>

            <ul className="checkout-includes">
              <li>
                <ClipboardList size={15} /> {plan.allowances.assessments} assessments / month
              </li>
              <li>
                <BadgeCheck size={15} /> {plan.allowances.ebooks} ebooks
              </li>
              <li>
                <BadgeCheck size={15} /> {plan.allowances.counselling} min counselling
              </li>
            </ul>

            <div className="checkout-totals">
              <div>
                <span>Subtotal</span>
                <span>${total}</span>
              </div>
              <div>
                <span>Tax (est.)</span>
                <span>${tax}</span>
              </div>
              <div className="checkout-total-row">
                <span>Due today</span>
                <span>${total + tax}</span>
              </div>
            </div>

            <p className="checkout-renew">
              Renews {cycle === 'yearly' ? 'yearly' : 'monthly'} · then pay-as-you-go once an
              allowance is used.
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}
