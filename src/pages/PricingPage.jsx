import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ClipboardList,
  MessagesSquare,
  Music,
  RefreshCcw,
  Sparkles,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { PAYG } from '../data/billing.js'
import { formatPrice, getPlans } from '../lib/plans.js'
import { getMySubscription } from '../lib/payments.js'

const FAQ = [
  [
    'What counts as one assessment?',
    'Any topic you choose  Stress & Burnout, Sleep, EQ, and so on. Your plan unlocks that many full assessments (with reports and audio plans) each cycle.',
  ],
  [
    'What happens when my allowance runs out?',
    'Nothing breaks. You simply switch to pay-as-you-go for that item  buy an extra assessment, ebook, or counselling minutes individually, at the à-la-carte price.',
  ],
  [
    'Can I change or cancel my plan?',
    'Anytime, from your billing page. Upgrades apply immediately; downgrades and cancellations take effect at the end of your current cycle.',
  ],
  [
    'Do unused allowances roll over?',
    'Allowances reset each cycle and don’t roll over  but everything you’ve already unlocked stays yours forever.',
  ],
]

// The API carries no presentation, so card colors cycle through the brand
// palette by position (cheapest first).
const ACCENTS = [
  { accent: '#3c7a5e', bg: '#dde9dd', fg: '#2e5f49' },
  { accent: '#6450cf', bg: '#e2dcf8', fg: '#4d3da8' },
  { accent: '#d98b50', bg: '#f9e3cd', fg: '#8a5420' },
]

// Plan names arrive lowercase from the API ("calm"); capitalize for display.
const titleCase = (s) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase())

export default function PricingPage() {
  const { isAuthenticated } = useAuth()
  const [state, setState] = useState({ status: 'loading', plans: [], sub: null, error: '' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const plans = await getPlans()
        // Logged-in users: load their subscription so we can block re-purchasing.
        const sub = isAuthenticated ? await getMySubscription().catch(() => null) : null
        if (alive) setState({ status: 'ready', plans, sub, error: '' })
      } catch (err) {
        if (alive) setState({ status: 'error', plans: [], sub: null, error: err.message })
      }
    })()
    return () => {
      alive = false
    }
  }, [reloadKey, isAuthenticated])

  const retry = () => {
    setState({ status: 'loading', plans: [], sub: null, error: '' })
    setReloadKey((k) => k + 1)
  }

  const { status, plans, sub, error } = state

  // An active/trialing subscription blocks buying another plan — there's no
  // upgrade/downgrade flow, so users manage the existing one from /subscription.
  const activeSub = sub && (sub.status === 'active' || sub.status === 'trialing') ? sub : null
  const currentPlanName = activeSub?.plan?.name?.toLowerCase()

  return (
    <main className="pricing">
      <header className="pricing-hero">
        <div className="aurora" aria-hidden="true">
          <i />
          <i />
        </div>
        <div className="container">
          <Reveal as="span" className="eyebrow">
            Plans &amp; pricing
          </Reveal>
          <Reveal as="h1" className="h1 pricing-title" delay={0.07}>
            Choose how you <em>walk the path.</em>
          </Reveal>
          <Reveal as="p" className="lede" delay={0.14}>
            A monthly plan unlocks a set number of assessments, ebooks, and counselling minutes. Run
            out? You only ever pay for the extras you choose.
          </Reveal>
        </div>
      </header>

      <section className="pricing-plans">
        <div className="container">
          {activeSub && (
            <Reveal className="pricing-current-banner">
              <BadgeCheck size={18} />
              <span>
                You&rsquo;re on the <strong>{titleCase(activeSub.plan?.name)}</strong> plan. You can
                only have one plan at a time.
              </span>
              <Link to="/subscription" className="pricing-current-link">
                Manage subscription <ArrowRight size={15} />
              </Link>
            </Reveal>
          )}

          <div className="plan-grid">
            {status === 'loading' &&
              [0, 1, 2].map((i) => (
                <div className="plan-card plan-skel" key={i} aria-hidden="true">
                  <span className="skel skel-dot" />
                  <span className="skel skel-title" />
                  <span className="skel skel-line" style={{ width: '80%' }} />
                  <span className="skel skel-price" />
                  <span className="skel skel-line" />
                  <span className="skel skel-line" />
                  <span className="skel skel-line" />
                  <span className="skel skel-btn" />
                </div>
              ))}

            {status === 'error' && (
              <div className="pricing-status" role="alert">
                <h3>We couldn’t load the plans</h3>
                <p>{error}</p>
                <button className="btn btn-ghost" onClick={retry}>
                  <RefreshCcw size={16} /> Try again
                </button>
              </div>
            )}

            {status === 'ready' && plans.length === 0 && (
              <div className="pricing-status">
                <h3>No plans available right now</h3>
                <p>Please check back soon.</p>
              </div>
            )}

            {status === 'ready' &&
              plans.map((plan, i) => {
                const color = ACCENTS[i % ACCENTS.length]
                // Highlight the middle tier when there's a full lineup — display only.
                const popular = plans.length >= 3 && i === 1
                const name = titleCase(plan.name)
                return (
                  <Reveal
                    as="article"
                    key={plan._id}
                    className={`plan-card ${popular ? 'plan-popular' : ''}`}
                    delay={i * 0.08}
                    style={{ '--accent': color.accent }}
                  >
                    {popular && <span className="plan-tag">Most popular</span>}
                    <header className="plan-card-head">
                      <span className="plan-dot" style={{ background: color.bg, color: color.fg }}>
                        <Sparkles size={18} />
                      </span>
                      <h2>{name}</h2>
                      {plan.description && <p>{plan.description}</p>}
                    </header>

                    <div className="plan-price">
                      <strong>{formatPrice(plan.price, plan.currency)}</strong>
                      <span>/mo</span>
                    </div>

                    <ul className="plan-allowance">
                      <li>
                        <ClipboardList size={16} />
                        <strong>{plan.allowedAssessments}</strong> assessments / month
                      </li>
                      <li>
                        <BookOpen size={16} />
                        <strong>{plan.allowedEbooks}</strong> ebooks / month
                      </li>
                      <li>
                        <MessagesSquare size={16} />
                        <strong>{plan.allowedCounsellingMinutes} min</strong> counselling / month
                      </li>
                    </ul>

                    {activeSub ? (
                      plan.name?.toLowerCase() === currentPlanName ? (
                        <Link to="/subscription" className="btn btn-ghost plan-btn">
                          <BadgeCheck size={17} /> Your current plan
                        </Link>
                      ) : (
                        <button className="btn btn-ghost plan-btn" disabled>
                          Choose {name}
                        </button>
                      )
                    ) : (
                      <Link
                        to={`/checkout?plan=${plan._id}`}
                        className={`btn ${popular ? 'btn-primary' : 'btn-ghost'} plan-btn`}
                      >
                        Choose {name} <ArrowRight size={17} />
                      </Link>
                    )}
                  </Reveal>
                )
              })}
          </div>

          {/* pay-as-you-go */}
          <Reveal className="payg-strip">
            <div className="payg-head">
              <Music size={20} />
              <div>
                <h3>Prefer to pay as you go?</h3>
                <p>
                  No plan needed and when a plan&rsquo;s allowance runs out, this is exactly what
                  kicks in. Buy only what you need.
                </p>
              </div>
            </div>
            <div className="payg-items">
              <span>
                <ClipboardList size={15} /> Assessment <strong>${PAYG.assessment}</strong>
              </span>
              <span>
                <BookOpen size={15} /> Ebook <strong>from ${PAYG.ebook}</strong>
              </span>
              <span>
                <MessagesSquare size={15} /> Counselling{' '}
                <strong>
                  ${PAYG.counselling.price}/{PAYG.counselling.minutes} min
                </strong>
              </span>
            </div>
          </Reveal>

          {/* faq */}
          <div className="pricing-faq">
            <h2 className="h2">Questions, answered</h2>
            <div className="faq-grid">
              {FAQ.map(([q, a]) => (
                <Reveal as="div" key={q} className="faq-item">
                  <h4>{q}</h4>
                  <p>{a}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
