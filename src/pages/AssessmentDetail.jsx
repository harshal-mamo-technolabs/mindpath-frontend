import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Clock,
  FileHeart,
  Headphones,
  ListChecks,
  Loader2,
  MessagesSquare,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import {
  AnxietyGlyph,
  EQGlyph,
  FocusGlyph,
  SleepGlyph,
  StressGlyph,
} from '../components/TopicIcons.jsx'
import { getAssessment } from '../lib/assessmentsApi.js'
import { formatPrice } from '../lib/plans.js'
import { useShowAssessmentPrice } from '../hooks/useShowAssessmentPrice.js'

const PALETTE = [
  { Icon: StressGlyph, accent: '#d98b50', bg: '#f9e3cd', fg: '#8a5420' },
  { Icon: SleepGlyph, accent: '#6450cf', bg: '#e2dcf8', fg: '#4d3da8' },
  { Icon: AnxietyGlyph, accent: '#3c7a5e', bg: '#dde9dd', fg: '#2e5f49' },
  { Icon: EQGlyph, accent: '#cf6450', bg: '#fbe5e0', fg: '#a04a35' },
  { Icon: FocusGlyph, accent: '#8a76e8', bg: '#f0edfb', fg: '#4d3da8' },
]
// Stable colour per slug so detail matches its catalog card reasonably well.
const slotFor = (slug = '') =>
  PALETTE[[...slug].reduce((n, c) => n + c.charCodeAt(0), 0) % PALETTE.length]

// Dimension descriptions are fixed (the sub-categories never change), so they
// live here as static copy — the API only carries the labels.
const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const DIM_DESC = {
  // Stress & Burnout
  exhaustion: 'How drained you feel — the physical and emotional fuel left at the end of a day.',
  cynicism: 'Quiet distancing from work, people, or things you once cared about.',
  workload: 'The weight and relentlessness of what’s on your plate, and how sustainable it feels.',
  recovery: 'How well rest actually restores you — whether you bounce back or stay depleted.',
  control: 'Your sense of agency — how much say you feel you have over how your days go.',
  // Sleep, Rest & Recovery
  sleeplessness: 'Trouble falling or staying asleep — the nights that refuse to let go.',
  quality: 'How restorative your sleep is, beyond just the hours you spend in bed.',
  rest: 'Whether you allow yourself genuine downtime, or run without ever truly pausing.',
  energy: 'Your daytime vitality — the alertness and steadiness sleep is meant to fund.',
  winddown: 'The evening runway into sleep — how well you decelerate before bed.',
  // Anxiety & Overthinking
  worry: 'How often the mind runs ahead to what might go wrong.',
  rumination: 'Getting stuck replaying the same thoughts without resolution.',
  catastrophizing: 'Jumping to the worst-case ending before the story has even unfolded.',
  physical: 'Where anxiety shows up in the body — tension, restlessness, a racing pulse.',
  refocus: 'Your ability to step out of the spiral and bring attention back to now.',
  // Emotional Intelligence
  awareness: 'How clearly you notice and name what you’re feeling, as it happens.',
  regulation: 'Steadying your own emotions — responding rather than reacting under pressure.',
  empathy: 'Reading what others feel, and letting it inform how you show up.',
  relationships: 'Navigating connection, conflict, and repair with the people around you.',
  motivation: 'The inner drive that gets you to begin and keep going toward what matters.',
  // Focus & Productivity
  distractibility: 'How easily your attention gets pulled away from what you meant to do.',
  procrastination: 'The gap between intending to start and actually starting.',
  attention: 'Sustaining deep focus on one thing without fragmenting.',
  management: 'How you organise tasks and time so effort lands where it counts.',
}
const descFor = (sub) => DIM_DESC[norm(sub)] || 'One of the areas this assessment scores you across.'

const estMinutes = (q) => Math.max(5, Math.round((q || 0) * 0.5))
const titleCaseWord = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

export default function AssessmentDetail() {
  const { id } = useParams()
  const showPrice = useShowAssessmentPrice()
  const [state, setState] = useState({ status: 'loading', a: null, error: '' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const a = await getAssessment(id)
        if (alive) setState({ status: 'ready', a, error: '' })
      } catch (err) {
        if (alive) setState({ status: err.status === 404 ? 'notfound' : 'error', a: null, error: err.message })
      }
    })()
    return () => {
      alive = false
    }
  }, [id, reloadKey])

  const { status, a, error } = state

  if (status === 'notfound') return <Navigate to="/assessments" replace />

  if (status === 'loading') {
    return (
      <main className="detail">
        <div className="catalog-state" style={{ minHeight: '60vh', justifyContent: 'center' }}>
          <Loader2 size={28} className="ap-spin" />
          <p>Loading assessment…</p>
        </div>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="detail">
        <div
          className="catalog-state"
          role="alert"
          style={{ minHeight: '60vh', justifyContent: 'center' }}
        >
          <h3>We couldn’t load this assessment</h3>
          <p>{error}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setReloadKey((k) => k + 1)}>
              <RefreshCcw size={16} /> Try again
            </button>
            <Link to="/assessments" className="btn btn-primary">
              All assessments
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const { Icon, accent, bg, fg } = slotFor(a.slug)
  const dims = a.subCategories || []
  const tags = a.tags || []
  const questions = a.questions || []
  const qCount = questions.length || a.questionsCount || 0
  const scale = a.scaleLabels || []
  const mins = estMinutes(qCount)
  const price = formatPrice(a.cost, a.currency)
  const takeTo = `/assessments/${a.slug}/take`

  // display label per dimension (the API gives nicely-cased tags in order)
  const dimLabel = (i) => tags[i] || titleCaseWord(dims[i])

  return (
    <main className="detail">
      <header className="detail-hero" style={{ '--topic': accent }}>
        <div className="aurora" aria-hidden="true">
          <i />
          <i />
        </div>
        <div className="container">
          <Reveal>
            <Link to="/assessments" className="crumb">
              <ArrowLeft size={15} /> All assessments
            </Link>
          </Reveal>

          <div className="detail-hero-grid">
            <div>
              <Reveal className="detail-title-row" delay={0.06}>
                <span className="topic-ico detail-ico" style={{ background: bg, color: fg }}>
                  <Icon size={30} strokeWidth={1.8} />
                </span>
                <div>
                  <h1>{a.name}</h1>
                  {a.subDescription && <p className="detail-tagline">{a.subDescription}</p>}
                </div>
              </Reveal>

              <Reveal as="p" className="lede" delay={0.14}>
                {a.description}
              </Reveal>

              <Reveal className="detail-meta" delay={0.2}>
                <span>
                  <Clock size={15} /> ~{mins} minutes
                </span>
                <span>
                  <ListChecks size={15} /> {qCount} questions
                </span>
                {dims.length > 0 && (
                  <span>
                    <FileHeart size={15} /> {dims.length} dimensions
                  </span>
                )}
                {a.maxAttempts && (
                  <span>
                    <CalendarCheck size={15} /> {a.maxAttempts} attempts included
                  </span>
                )}
              </Reveal>

              <Reveal className="detail-actions" delay={0.26}>
                <Link to={takeTo} className="btn btn-primary">
                  Begin assessment{showPrice ? ` · ${price}` : ''} <ArrowRight size={18} />
                </Link>
                <p className="detail-note">
                  <ShieldCheck size={14} /> A self-reflection instrument not a clinical or
                  diagnostic tool.
                </p>
              </Reveal>
            </div>

            {dims.length > 0 && (
              <Reveal className="detail-dims-card" delay={0.18}>
                <p className="panel-label">What we measure</p>
                {dims.map((d, i) => (
                  <div className="detail-dim" key={`${d}-${i}`}>
                    <span className="detail-dim-num" style={{ background: bg, color: fg }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4>{dimLabel(i)}</h4>
                      <p>{descFor(d)}</p>
                    </div>
                  </div>
                ))}
              </Reveal>
            )}
          </div>
        </div>
      </header>

      {scale.length > 0 && (
        <section className="section detail-scale-section" style={{ '--topic': accent }}>
          <div className="container">
            <Reveal as="span" className="eyebrow">
              How you&rsquo;ll answer
            </Reveal>
            <Reveal as="h2" className="h2" delay={0.08}>
              Each statement, on a <em>{scale.length}-point scale.</em>
            </Reveal>
            <Reveal as="p" className="lede" delay={0.14}>
              Rate how often each one is true for you lately. There are no right answers only honest
              ones.
            </Reveal>
            <Reveal className="detail-scale-row" delay={0.2}>
              {scale.map((label, i) => (
                <div className="detail-scale-step" key={`${label}-${i}`}>
                  <span className="likert-dot" data-strength={i} />
                  <strong>{label}</strong>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      <section className="section detail-receive">
        <div className="container">
          <Reveal as="span" className="eyebrow">
            What your answers become
          </Reveal>
          <Reveal as="h2" className="h2" delay={0.08}>
            One honest quarter-hour, <em>three things back.</em>
          </Reveal>

          <div className="receive-grid">
            <Reveal as="article" className="receive-card" delay={0.1}>
              <span className="receive-ico" style={{ background: '#f0edfb', color: '#4d3da8' }}>
                <FileHeart size={24} strokeWidth={1.8} />
              </span>
              <h3>Your personal report</h3>
              <p>
                Scores across every dimension with plain-language interpretation what each number
                means for you and what tends to help. Generated deterministically from a validated
                framework: same answers, same insight, every time.
              </p>
              <ul className="receive-list">
                <li>Overall profile &amp; per-dimension scores</li>
                <li>What&rsquo;s protecting you, what&rsquo;s draining you</li>
                <li>Concrete next steps, ranked by leverage</li>
              </ul>
            </Reveal>

            <Reveal as="article" className="receive-card receive-dark" delay={0.2}>
              <span
                className="receive-ico"
                style={{ background: 'rgba(238,179,129,.16)', color: '#eeb381' }}
              >
                <Headphones size={24} strokeWidth={1.8} />
              </span>
              <h3>A daily audio plan</h3>
              <p>
                Sessions selected and ordered from your scores one unlocks each morning, 5–10
                minutes each. It opens with a welcome recorded for you, by name.
              </p>
              <div className="receive-plan">
                <p className="receive-welcome">
                  <MessagesSquare size={14} /> Sequenced from this exact report
                </p>
                <span className="receive-session">
                  <em>Day 1</em> Putting the day down <small>6 min</small>
                </span>
                <span className="receive-session">
                  <em>Day 2</em> The overdraft, named <small>7 min</small>
                </span>
                <span className="receive-session locked">One new session each morning</span>
              </div>
            </Reveal>

            <Reveal as="article" className="receive-card" delay={0.3}>
              <span className="receive-ico" style={{ background: '#f9e3cd', color: '#8a5420' }}>
                <Sparkles size={24} strokeWidth={1.8} />
              </span>
              <h3>Unlocked after your report</h3>
              <p>
                Your report opens doors that stay personal each one built from your dimensions, not
                a template.
              </p>
              <ul className="receive-unlocks">
                <li>
                  <BookOpen size={16} />
                  <div>
                    <strong>A personalized ebook</strong>
                    <small>Written from your profile, cover with your name</small>
                  </div>
                </li>
                <li>
                  <MessagesSquare size={16} />
                  <div>
                    <strong>AI counselling sessions</strong>
                    <small>A voice advisor that has already read your report</small>
                  </div>
                </li>
                <li>
                  <CalendarCheck size={16} />
                  <div>
                    <strong>Retake in 60–90 days</strong>
                    <small>Before/after comparison that proves the path worked</small>
                  </div>
                </li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="detail-cta">
        <div className="container">
          <Reveal className="detail-cta-panel">
            <div>
              <h2>
                Ready when you are. <em>It takes ~{mins} quiet minutes.</em>
              </h2>
              <p>
                Answer as the person you are this week not your best week, not your worst. Honest in,
                useful out.
              </p>
            </div>
            <Link to={takeTo} className="btn btn-light">
              Begin assessment <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
