import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarClock,
  ClipboardList,
  Lock,
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
import { getMyMsisdnSubscription } from '../lib/msisdn.js'
import { isMsisdnMode } from '../lib/billingMode.js'

// The API carries no presentation, so card colors cycle through the brand
// palette by position (cheapest first).
const ACCENTS = [
  { accent: '#3c7a5e', bg: '#dde9dd', fg: '#2e5f49' },
  { accent: '#6450cf', bg: '#e2dcf8', fg: '#4d3da8' },
  { accent: '#d98b50', bg: '#f9e3cd', fg: '#8a5420' },
]

// Plan names arrive lowercase from the API ("calm"); capitalize for display.
const titleCase = (s) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase())

const fmtDate = (iso, fallback = 'next month') => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return fallback
  }
}

export default function PricingPage() {
  // Carrier-billing build has no plan/pricing page — the subscription is set up
  // at signup and managed on /subscription.
  if (isMsisdnMode) return <Navigate to="/subscription" replace />

  return <StripePricingPage />
}

function StripePricingPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [state, setState] = useState({ status: 'loading', plans: [], sub: null, error: '' })
  const [reloadKey, setReloadKey] = useState(0)

  // FAQ is built here (not at module scope) so the copy can be localized. The
  // "what happens when I run out" answer differs by billing model.
  const faq = [
    { q: t('pricing.faq.assessment.q'), a: t('pricing.faq.assessment.a') },
    {
      q: t('pricing.faq.runOut.q'),
      a: isMsisdnMode ? t('pricing.faq.runOut.aMsisdn') : t('pricing.faq.runOut.aStripe'),
    },
    { q: t('pricing.faq.change.q'), a: t('pricing.faq.change.a') },
    { q: t('pricing.faq.carry.q'), a: t('pricing.faq.carry.a') },
  ]

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const plans = await getPlans()
        // Logged-in users: load their subscription (the right rail for the mode)
        // so we can gate pricing on the assessment allowance.
        const fetchSub = isMsisdnMode ? getMyMsisdnSubscription : getMySubscription
        const sub = isAuthenticated ? await fetchSub().catch(() => null) : null
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

  const activeSub = sub && (sub.status === 'active' || sub.status === 'trialing') ? sub : null
  const remaining = activeSub?.remaining?.assessments
  const exhausted = activeSub && typeof remaining === 'number' && remaining <= 0
  const covered = activeSub && !exhausted
  const allowance = activeSub?.allowances?.assessments
  const currentPlanName = activeSub?.plan?.name?.toLowerCase()

  // What to render once loaded:
  //   covered            → has allowance left → hide pricing entirely
  //   exhausted + msisdn → hard stop, no pay-as-you-go
  //   exhausted + stripe → show pricing (pay-as-you-go kicks in) + plans
  //   no active sub      → show plans to subscribe
  const view =
    status !== 'ready'
      ? status
      : covered
        ? 'covered'
        : exhausted && isMsisdnMode
          ? 'blocked'
          : 'open'

  // Plans + the PAYG strip are only shown in the "open" pricing state.
  const showPricing = view === 'open'

  return (
    <main className="pricing">
      <header className="pricing-hero">
        <div className="aurora" aria-hidden="true">
          <i />
          <i />
        </div>
        <div className="container">
          <Reveal as="span" className="eyebrow">
            {t('pricing.eyebrow')}
          </Reveal>
          <Reveal as="h1" className="h1 pricing-title" delay={0.07}>
            {t('pricing.h1a')} <em>{t('pricing.h1em')}</em>
          </Reveal>
          <Reveal as="p" className="lede" delay={0.14}>
            {t('pricing.ledeBase')}{' '}
            {isMsisdnMode ? t('pricing.ledeMsisdn') : t('pricing.ledeStripe')}
          </Reveal>
        </div>
      </header>

      <section className="pricing-plans">
        <div className="container">
          {/* ---- covered: active plan with assessments left → no pricing ---- */}
          {view === 'covered' && (
            <Reveal className="pricing-covered">
              <span className="pricing-covered-ico">
                <BadgeCheck size={26} />
              </span>
              <h2>{t('pricing.coveredTitle', { plan: titleCase(activeSub.plan?.name) })}</h2>
              <p>
                {typeof remaining === 'number' ? (
                  <>
                    <strong>{t('pricing.coveredRemaining', { remaining, allowance })}</strong>{' '}
                    {t('pricing.coveredLeft')}
                  </>
                ) : (
                  t('pricing.coveredActive')
                )}{' '}
                {t('pricing.coveredTake')}
              </p>
              <div className="pricing-covered-actions">
                <Link to="/assessments" className="btn btn-primary">
                  {t('pricing.takeAssessment')} <ArrowRight size={17} />
                </Link>
                <Link to="/subscription" className="btn btn-ghost">
                  {t('pricing.manageSubscription')}
                </Link>
              </div>
            </Reveal>
          )}

          {/* ---- exhausted on MSISDN: hard stop, no pay-as-you-go ---- */}
          {view === 'blocked' && (
            <Reveal className="pricing-blocked" role="status">
              <span className="pricing-blocked-ico">
                <Lock size={24} />
              </span>
              <h2>{t('pricing.blockedTitle')}</h2>
              <p>
                {t('pricing.blockedBody', {
                  allowance,
                  plan: titleCase(activeSub.plan?.name),
                })}
              </p>
              <p className="pricing-blocked-reset">
                <CalendarClock size={15} /> {t('pricing.blockedResetPre')}{' '}
                <strong>{fmtDate(activeSub.currentPeriodEnd, t('pricing.nextMonth'))}</strong>.
              </p>
              <p className="pricing-blocked-note">{t('pricing.blockedNote')}</p>
              <Link to="/subscription" className="btn btn-ghost">
                {t('pricing.viewSubscription')}
              </Link>
            </Reveal>
          )}

          {/* ---- exhausted on Stripe: pricing reappears (PAYG kicks in) ---- */}
          {view === 'open' && exhausted && (
            <Reveal className="pricing-current-banner exhausted">
              <CalendarClock size={18} />
              <span>
                {t('pricing.exhaustedPre', { allowance })}{' '}
                <strong>{titleCase(activeSub.plan?.name)}</strong>{' '}
                {t('pricing.exhaustedPost', { price: PAYG.assessment })}
              </span>
              <Link to="/subscription" className="pricing-current-link">
                {t('pricing.manageSubscription')} <ArrowRight size={15} />
              </Link>
            </Reveal>
          )}

          {showPricing && (
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

              {status === 'ready' && plans.length === 0 && (
                <div className="pricing-status">
                  <h3>{t('pricing.emptyTitle')}</h3>
                  <p>{t('pricing.emptyBody')}</p>
                </div>
              )}

              {status === 'ready' &&
                plans.map((plan, i) => {
                  const color = ACCENTS[i % ACCENTS.length]
                  const popular = plans.length >= 3 && i === 1
                  const name = titleCase(plan.name)
                  const isCurrent = plan.name?.toLowerCase() === currentPlanName
                  return (
                    <Reveal
                      as="article"
                      key={plan._id}
                      className={`plan-card ${popular ? 'plan-popular' : ''}`}
                      delay={i * 0.08}
                      style={{ '--accent': color.accent }}
                    >
                      {popular && <span className="plan-tag">{t('pricing.mostPopular')}</span>}
                      <header className="plan-card-head">
                        <span className="plan-dot" style={{ background: color.bg, color: color.fg }}>
                          <Sparkles size={18} />
                        </span>
                        <h2>{name}</h2>
                        {plan.description && <p>{plan.description}</p>}
                      </header>

                      <div className="plan-price">
                        <strong>{formatPrice(plan.price, plan.currency)}</strong>
                        <span>{t('pricing.perMonth')}</span>
                      </div>

                      <ul className="plan-allowance">
                        <li>
                          <ClipboardList size={16} />
                          <strong>{plan.allowedAssessments}</strong> {t('pricing.rowAssessments')}
                        </li>
                        <li>
                          <BookOpen size={16} />
                          <strong>{plan.allowedEbooks}</strong> {t('pricing.rowEbooks')}
                        </li>
                        <li>
                          <MessagesSquare size={16} />
                          <strong>
                            {plan.allowedCounsellingMinutes} {t('pricing.unitMin')}
                          </strong>{' '}
                          {t('pricing.rowCounselling')}
                        </li>
                      </ul>

                      {activeSub ? (
                        isCurrent ? (
                          <Link to="/subscription" className="btn btn-ghost plan-btn">
                            <BadgeCheck size={17} /> {t('pricing.yourCurrentPlan')}
                          </Link>
                        ) : (
                          <button className="btn btn-ghost plan-btn" disabled>
                            {t('pricing.choosePlan', { plan: name })}
                          </button>
                        )
                      ) : (
                        <Link
                          to={`/checkout?plan=${plan._id}`}
                          className={`btn ${popular ? 'btn-primary' : 'btn-ghost'} plan-btn`}
                        >
                          {t('pricing.choosePlan', { plan: name })} <ArrowRight size={17} />
                        </Link>
                      )}
                    </Reveal>
                  )
                })}
            </div>
          )}

          {status === 'error' && (
            <div className="pricing-status" role="alert">
              <h3>{t('pricing.errorTitle')}</h3>
              <p>{error}</p>
              <button className="btn btn-ghost" onClick={retry}>
                <RefreshCcw size={16} /> {t('pricing.tryAgain')}
              </button>
            </div>
          )}

          {/* pay-as-you-go (Stripe side only; never in MSISDN mode) ---- */}
          {showPricing && !isMsisdnMode && (
            <Reveal className="payg-strip">
              <div className="payg-head">
                <Music size={20} />
                <div>
                  <h3>{t('pricing.paygTitle')}</h3>
                  <p>{t('pricing.paygBody')}</p>
                </div>
              </div>
              <div className="payg-items">
                <span>
                  <ClipboardList size={15} /> {t('pricing.paygAssessment')}{' '}
                  <strong>${PAYG.assessment}</strong>
                </span>
                <span>
                  <BookOpen size={15} /> {t('pricing.paygEbook')}{' '}
                  <strong>
                    {t('pricing.paygFrom')} ${PAYG.ebook}
                  </strong>
                </span>
                <span>
                  <MessagesSquare size={15} /> {t('pricing.paygCounselling')}{' '}
                  <strong>
                    ${PAYG.counselling.price}/{PAYG.counselling.minutes} {t('pricing.unitMin')}
                  </strong>
                </span>
              </div>
            </Reveal>
          )}

          {/* faq */}
          <div className="pricing-faq">
            <h2 className="h2">{t('pricing.faqTitle')}</h2>
            <div className="faq-grid">
              {faq.map(({ q, a }) => (
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
