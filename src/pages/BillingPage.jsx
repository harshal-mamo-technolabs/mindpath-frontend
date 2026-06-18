import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardList,
  CreditCard,
  Download,
  MessagesSquare,
  Plus,
  RefreshCcw,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import {
  fmtDate,
  getPlan,
  INVOICES,
  PAYG,
  priceFor,
  SUBSCRIPTION,
} from '../data/billing.js'

const ALLOWANCE_ROWS = [
  {
    key: 'assessments',
    label: 'Assessments',
    icon: ClipboardList,
    unit: '',
    accent: '#4d3da8',
    payg: `$${PAYG.assessment} each`,
    paygTo: '/assessments',
    paygLabel: 'Buy an assessment',
  },
  {
    key: 'ebooks',
    label: 'Ebooks',
    icon: BookOpen,
    unit: '',
    accent: '#8a5420',
    payg: `from $${PAYG.ebook}`,
    paygTo: '/ebooks',
    paygLabel: 'Browse the shop',
  },
  {
    key: 'counselling',
    label: 'Counselling minutes',
    icon: MessagesSquare,
    unit: ' min',
    accent: '#2e5f49',
    payg: `$${PAYG.counselling.price}/${PAYG.counselling.minutes} min`,
    paygTo: '/counselling',
    paygLabel: 'Buy minutes',
  },
]

export default function BillingPage() {
  const plan = getPlan(SUBSCRIPTION.planId)
  const [modal, setModal] = useState(null) // 'cancel'
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const say = (msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 3400)
  }
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  return (
    <main className="billing">
      <div className="container">
        <Reveal as="header" className="bl-head">
          <div>
            <span className="eyebrow">Subscription</span>
            <h1 className="bl-title">Your subscription</h1>
          </div>
          <Link to="/pricing" className="btn btn-ghost">
            <RefreshCcw size={16} /> Change plan
          </Link>
        </Reveal>

        {/* current plan */}
        <Reveal className="bl-plan-card" style={{ '--accent': plan.accent }}>
          <div className="bl-plan-main">
            <span className="plan-dot" style={{ background: plan.bg, color: plan.fg }}>
              <Sparkles size={20} />
            </span>
            <div>
              <p className="bl-plan-status">
                <span className="bl-dot-live" /> Active
              </p>
              <h2>{plan.name} plan</h2>
              <p className="bl-plan-sub">
                ${priceFor(plan, SUBSCRIPTION.cycle)}/{SUBSCRIPTION.cycle === 'yearly' ? 'yr' : 'mo'} ·
                renews {fmtDate(SUBSCRIPTION.renewsOn)}
              </p>
            </div>
          </div>
          <div className="bl-plan-actions">
            <Link to="/pricing" className="bl-upgrade">
              Upgrade <ArrowRight size={15} />
            </Link>
            <button className="bl-cancel" onClick={() => setModal('cancel')}>
              Cancel plan
            </button>
          </div>
        </Reveal>

        {/* allowance usage  the dual model */}
        <section className="bl-section">
          <h2 className="bl-section-title">This cycle&rsquo;s allowance</h2>
          <p className="bl-section-sub">
            Resets {fmtDate(SUBSCRIPTION.renewsOn)}. When an allowance is used up, that item
            switches to pay-as-you-go automatically.
          </p>

          <div className="bl-allowance-grid">
            {ALLOWANCE_ROWS.map((row) => {
              const total = plan.allowances[row.key]
              const used = SUBSCRIPTION.usage[row.key]
              const unlimited = total === 'Unlimited'
              const left = unlimited ? Infinity : Math.max(0, total - used)
              const exhausted = !unlimited && left === 0
              const pct = unlimited ? 30 : Math.min(100, (used / total) * 100)
              const Icon = row.icon
              return (
                <div className={`bl-allowance ${exhausted ? 'is-exhausted' : ''}`} key={row.key}>
                  <div className="bl-allowance-head">
                    <span className="bl-allowance-ico" style={{ color: row.accent }}>
                      <Icon size={18} />
                    </span>
                    <h3>{row.label}</h3>
                    {exhausted ? (
                      <span className="bl-badge-payg">
                        <Zap size={12} /> Pay-as-you-go
                      </span>
                    ) : (
                      <span className="bl-allowance-left">
                        {unlimited ? '∞' : left} left
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
                    {unlimited ? (
                      <>Unlimited on {plan.name}</>
                    ) : (
                      <>
                        {used} of {total}
                        {row.unit} used this cycle
                      </>
                    )}
                  </p>

                  {exhausted ? (
                    <div className="bl-payg-cta">
                      <span>
                        Need more? <strong>{row.payg}</strong>
                      </span>
                      <Link to={row.paygTo} className="bl-payg-btn">
                        <Plus size={14} /> {row.paygLabel}
                      </Link>
                    </div>
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

        <div className="bl-two-col">
          {/* payment method */}
          <section className="bl-section bl-pay">
            <h2 className="bl-section-title">Payment method</h2>
            <div className="bl-card-row">
              <span className="bl-card-brand">
                <CreditCard size={18} />
              </span>
              <div>
                <strong>
                  {SUBSCRIPTION.card.brand} ending in {SUBSCRIPTION.card.last4}
                </strong>
                <small>Expires {SUBSCRIPTION.card.exp}</small>
              </div>
              <button className="bl-link-btn" onClick={() => say('Card update is a demo.')}>
                Update
              </button>
            </div>
            <p className="bl-pay-note">
              Payments are securely handled by Stripe. This is a demo  no real card is stored.
            </p>
          </section>

          {/* upsell to higher plan */}
          <section className="bl-section bl-upsell-card">
            <span className="bl-upsell-ico">
              <Sparkles size={20} />
            </span>
            <h3>Running out of assessments?</h3>
            <p>
              Flourish unlocks 6 assessments, unlimited ebooks, and 120 counselling minutes
              every month  often cheaper than topping up.
            </p>
            <Link to="/checkout?plan=flourish&cycle=monthly" className="btn btn-light">
              Upgrade to Flourish <ArrowRight size={16} />
            </Link>
          </section>
        </div>

        {/* invoices */}
        <section className="bl-section">
          <div className="bl-invoices-head">
            <h2 className="bl-section-title">Billing history</h2>
            <button className="bl-link-btn" onClick={() => say('Export is a demo.')}>
              <Download size={14} /> Export all
            </button>
          </div>
          <div className="bl-invoices">
            {INVOICES.map((inv) => (
              <div className="bl-invoice" key={inv.id}>
                <span className="bl-inv-date">{fmtDate(inv.date)}</span>
                <span className="bl-inv-desc">
                  {inv.desc}
                  <em className={`bl-inv-kind ${inv.kind}`}>
                    {inv.kind === 'plan' ? 'Subscription' : 'Pay-as-you-go'}
                  </em>
                </span>
                <span className="bl-inv-amount">${inv.amount}</span>
                <button className="bl-inv-dl" onClick={() => say('Receipt download is a demo.')} aria-label="Download receipt">
                  <Download size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>
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
            <h3>Cancel your {plan.name} plan?</h3>
            <p>
              You&rsquo;ll keep your allowances until {fmtDate(SUBSCRIPTION.renewsOn)}, then move
              to pay-as-you-go. Everything you&rsquo;ve unlocked stays yours.
            </p>
            <div className="ap-modal-actions">
              <button
                className="bl-cancel-confirm"
                onClick={() => {
                  setModal(null)
                  say('Demo  your plan is still active.')
                }}
              >
                Cancel at period end
              </button>
              <button className="ap-ghostlink" onClick={() => setModal(null)}>
                Keep my plan
              </button>
            </div>
            <button className="ap-modal-close" onClick={() => setModal(null)} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
