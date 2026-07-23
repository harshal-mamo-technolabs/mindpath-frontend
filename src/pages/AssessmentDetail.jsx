import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  exhaustion: 'How tired you feel — how much energy is left at the end of the day.',
  cynicism: 'Pulling away from work, people, or things you used to care about.',
  workload: 'How heavy your work feels, and whether you can keep it up.',
  recovery: 'How well rest helps you — whether you feel better after, or still worn out.',
  control: 'How much say you feel you have over how your days go.',
  // Sleep, Rest & Recovery
  sleeplessness: 'Trouble falling asleep or staying asleep at night.',
  quality: 'How good your sleep is, not just how long you sleep.',
  rest: 'Whether you let yourself take real breaks, or keep going without stopping.',
  energy: 'How awake and steady you feel during the day.',
  winddown: 'How well you slow down and relax before bed.',
  // Anxiety & Overthinking
  worry: 'How often your mind jumps to what might go wrong.',
  rumination: 'Getting stuck going over the same thoughts again and again.',
  catastrophizing: 'Jumping straight to the worst thing that could happen.',
  physical: 'How worry shows up in your body — tight muscles, feeling restless, a fast heartbeat.',
  refocus: 'How well you can stop worrying and come back to the moment.',
  // Emotional Intelligence
  awareness: 'How well you notice and name what you feel, as it happens.',
  regulation: 'Staying calm with your feelings — thinking before you react under pressure.',
  empathy: 'Sensing what other people feel, and letting it guide how you act.',
  relationships: 'Getting along, working through arguments, and making up with people.',
  motivation: 'The drive that gets you to start and keep going on what matters.',
  // Focus & Productivity
  distractibility: 'How easily you get pulled away from what you meant to do.',
  procrastination: 'The gap between meaning to start and actually starting.',
  attention: 'Staying focused on one thing without your mind wandering.',
  management: 'How you plan your tasks and time so your effort counts.',
}
const descFor = (sub) => DIM_DESC[norm(sub)] || 'One of the areas this assessment looks at.'

const estMinutes = (q) => Math.max(5, Math.round((q || 0) * 0.5))
const titleCaseWord = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

export default function AssessmentDetail() {
  const { t } = useTranslation()
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
          <p>{t('assess.detail.loading')}</p>
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
          <h3>{t('assess.detail.errorTitle')}</h3>
          <p>{error}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setReloadKey((k) => k + 1)}>
              <RefreshCcw size={16} /> {t('assess.detail.retry')}
            </button>
            <Link to="/assessments" className="btn btn-primary">
              {t('assess.detail.allAssessments')}
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
              <ArrowLeft size={15} /> {t('assess.detail.allAssessments')}
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
                  <Clock size={15} /> {t('assess.detail.minutes', { mins })}
                </span>
                <span>
                  <ListChecks size={15} /> {t('assess.detail.questions', { count: qCount })}
                </span>
                {dims.length > 0 && (
                  <span>
                    <FileHeart size={15} /> {t('assess.detail.areas', { count: dims.length })}
                  </span>
                )}
                {a.maxAttempts && (
                  <span>
                    <CalendarCheck size={15} />{' '}
                    {t('assess.detail.tries', { count: a.maxAttempts })}
                  </span>
                )}
              </Reveal>

              <Reveal className="detail-actions" delay={0.26}>
                <Link to={takeTo} className="btn btn-primary">
                  {t('assess.detail.begin')}
                  {showPrice ? ` · ${price}` : ''} <ArrowRight size={18} />
                </Link>
                <p className="detail-note">
                  <ShieldCheck size={14} /> {t('assess.detail.note')}
                </p>
              </Reveal>
            </div>

            {dims.length > 0 && (
              <Reveal className="detail-dims-card" delay={0.18}>
                <p className="panel-label">{t('assess.detail.whatWeMeasure')}</p>
                {dims.map((d, i) => (
                  <div className="detail-dim" key={`${d}-${i}`}>
                    <span className="detail-dim-num" style={{ background: bg, color: fg }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4>{t(`subCat.${norm(d)}.label`, dimLabel(i))}</h4>
                      <p>{t(`subCat.${norm(d)}.desc`, descFor(d))}</p>
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
              {t('assess.detail.scaleEyebrow')}
            </Reveal>
            <Reveal as="h2" className="h2" delay={0.08}>
              {t('assess.detail.scaleH2a')}{' '}
              <em>{t('assess.detail.scaleH2em', { n: scale.length })}</em>
            </Reveal>
            <Reveal as="p" className="lede" delay={0.14}>
              {t('assess.detail.scaleLede')}
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
            {t('assess.detail.receiveEyebrow')}
          </Reveal>
          <Reveal as="h2" className="h2" delay={0.08}>
            {t('assess.detail.receiveH2a')} <em>{t('assess.detail.receiveH2em')}</em>
          </Reveal>

          <div className="receive-grid">
            <Reveal as="article" className="receive-card" delay={0.1}>
              <span className="receive-ico" style={{ background: '#f0edfb', color: '#4d3da8' }}>
                <FileHeart size={24} strokeWidth={1.8} />
              </span>
              <h3>{t('assess.detail.reportTitle')}</h3>
              <p>{t('assess.detail.reportDesc')}</p>
              <ul className="receive-list">
                <li>{t('assess.detail.reportList1')}</li>
                <li>{t('assess.detail.reportList2')}</li>
                <li>{t('assess.detail.reportList3')}</li>
              </ul>
            </Reveal>

            <Reveal as="article" className="receive-card receive-dark" delay={0.2}>
              <span
                className="receive-ico"
                style={{ background: 'rgba(238,179,129,.16)', color: '#eeb381' }}
              >
                <Headphones size={24} strokeWidth={1.8} />
              </span>
              <h3>{t('assess.detail.planTitle')}</h3>
              <p>{t('assess.detail.planDesc')}</p>
              <div className="receive-plan">
                <p className="receive-welcome">
                  <MessagesSquare size={14} /> {t('assess.detail.planBuilt')}
                </p>
                <span className="receive-session">
                  <em>{t('assess.detail.planDayLabel', { n: 1 })}</em> {t('assess.detail.planDay1')}{' '}
                  <small>{t('assess.detail.planDay1Min')}</small>
                </span>
                <span className="receive-session">
                  <em>{t('assess.detail.planDayLabel', { n: 2 })}</em> {t('assess.detail.planDay2')}{' '}
                  <small>{t('assess.detail.planDay2Min')}</small>
                </span>
                <span className="receive-session locked">{t('assess.detail.planLocked')}</span>
              </div>
            </Reveal>

            <Reveal as="article" className="receive-card" delay={0.3}>
              <span className="receive-ico" style={{ background: '#f9e3cd', color: '#8a5420' }}>
                <Sparkles size={24} strokeWidth={1.8} />
              </span>
              <h3>{t('assess.detail.unlockTitle')}</h3>
              <p>{t('assess.detail.unlockDesc')}</p>
              <ul className="receive-unlocks">
                <li>
                  <BookOpen size={16} />
                  <div>
                    <strong>{t('assess.detail.unlockEbook')}</strong>
                    <small>{t('assess.detail.unlockEbookSmall')}</small>
                  </div>
                </li>
                <li>
                  <MessagesSquare size={16} />
                  <div>
                    <strong>{t('assess.detail.unlockCounselling')}</strong>
                    <small>{t('assess.detail.unlockCounsellingSmall')}</small>
                  </div>
                </li>
                <li>
                  <CalendarCheck size={16} />
                  <div>
                    <strong>{t('assess.detail.unlockRetake')}</strong>
                    <small>{t('assess.detail.unlockRetakeSmall')}</small>
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
                {t('assess.detail.ctaH2a')} <em>{t('assess.detail.ctaH2em', { mins })}</em>
              </h2>
              <p>{t('assess.detail.ctaDesc')}</p>
            </div>
            <Link to={takeTo} className="btn btn-light">
              {t('assess.detail.begin')} <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
