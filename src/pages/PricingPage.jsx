import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ClipboardList,
  MessagesSquare,
  Music,
  Sparkles,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { PAYG, PLANS, perMonth, SUBSCRIPTION } from '../data/billing.js'

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

export default function PricingPage() {
  const [cycle, setCycle] = useState('monthly')
  const currentId = SUBSCRIPTION.planId

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

          <Reveal className="pricing-toggle" delay={0.2}>
            <button
              className={cycle === 'monthly' ? 'active' : ''}
              onClick={() => setCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={cycle === 'yearly' ? 'active' : ''}
              onClick={() => setCycle('yearly')}
            >
              Yearly <span className="pricing-save">save ~20%</span>
            </button>
          </Reveal>
        </div>
      </header>

      <section className="pricing-plans">
        <div className="container">
          <div className="plan-grid">
            {PLANS.map((plan, i) => {
              const isCurrent = plan.id === currentId
              return (
                <Reveal
                  as="article"
                  key={plan.id}
                  className={`plan-card ${plan.popular ? 'plan-popular' : ''}`}
                  delay={i * 0.08}
                  style={{ '--accent': plan.accent }}
                >
                  {plan.popular && <span className="plan-tag">Most popular</span>}
                  <header className="plan-card-head">
                    <span className="plan-dot" style={{ background: plan.bg, color: plan.fg }}>
                      <Sparkles size={18} />
                    </span>
                    <h2>{plan.name}</h2>
                    <p>{plan.tagline}</p>
                  </header>

                  <div className="plan-price">
                    <strong>${perMonth(plan, cycle)}</strong>
                    <span>/mo</span>
                    {cycle === 'yearly' && <em>billed ${plan.yearly}/yr</em>}
                  </div>

                  <ul className="plan-allowance">
                    <li>
                      <ClipboardList size={16} />
                      <strong>{plan.allowances.assessments}</strong> assessments / month
                    </li>
                    <li>
                      <BookOpen size={16} />
                      <strong>{plan.allowances.ebooks}</strong> ebooks
                      {plan.allowances.ebooks !== 'Unlimited' && ' / month'}
                    </li>
                    <li>
                      <MessagesSquare size={16} />
                      <strong>{plan.allowances.counselling} min</strong> counselling / month
                    </li>
                  </ul>

                  <ul className="plan-perks">
                    {plan.perks.map((perk) => (
                      <li key={perk}>
                        <Check size={15} /> {perk}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Link to="/subscription" className="btn btn-ghost plan-btn">
                      <BadgeCheck size={17} /> Your current plan
                    </Link>
                  ) : (
                    <Link
                      to={`/checkout?plan=${plan.id}&cycle=${cycle}`}
                      className={`btn ${plan.popular ? 'btn-primary' : 'btn-ghost'} plan-btn`}
                    >
                      Choose {plan.name} <ArrowRight size={17} />
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
