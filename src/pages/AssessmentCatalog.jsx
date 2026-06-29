import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BellRing,
  Clock,
  Layers,
  ListChecks,
  Loader2,
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
import { COMING_SOON } from '../data/assessments.js'
import { getAssessments } from '../lib/assessmentsApi.js'
import { formatPrice } from '../lib/plans.js'
import { useShowAssessmentPrice } from '../hooks/useShowAssessmentPrice.js'

// The API carries no icon/colour, so cards take a brand-palette slot by
// position (the list comes back in a stable order). New topics cycle the set.
const PALETTE = [
  { Icon: StressGlyph, bg: '#f9e3cd', fg: '#8a5420' },
  { Icon: SleepGlyph, bg: '#e2dcf8', fg: '#4d3da8' },
  { Icon: AnxietyGlyph, bg: '#dde9dd', fg: '#2e5f49' },
  { Icon: EQGlyph, bg: '#fbe5e0', fg: '#a04a35' },
  { Icon: FocusGlyph, bg: '#f0edfb', fg: '#4d3da8' },
]

// No duration on the assessment — estimate ~30s per question.
const estMinutes = (q) => Math.max(5, Math.round((q || 0) * 0.5))

export default function AssessmentCatalog() {
  const showPrice = useShowAssessmentPrice()
  const [state, setState] = useState({ status: 'loading', items: [], error: '' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const items = await getAssessments()
        if (alive) setState({ status: 'ready', items: items || [], error: '' })
      } catch (err) {
        if (alive) setState({ status: 'error', items: [], error: err.message })
      }
    })()
    return () => {
      alive = false
    }
  }, [reloadKey])

  const { status, items, error } = state
  const retry = () => {
    setState({ status: 'loading', items: [], error: '' })
    setReloadKey((k) => k + 1)
  }

  return (
    <main className="catalog">
      <header className="catalog-hero">
        <div className="aurora" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="container">
          <Reveal as="span" className="eyebrow">
            The catalog
          </Reveal>
          <Reveal as="h1" className="h1 catalog-title" delay={0.08}>
            Start with the one <em>that aches.</em>
          </Reveal>
          <Reveal as="p" className="lede" delay={0.16}>
            Every MindPath journey begins with one honest assessment a psychometric-style
            questionnaire scored across real dimensions. Pick the topic that names what you&rsquo;re
            carrying.
          </Reveal>
          <Reveal className="catalog-trust" delay={0.24}>
            <span>
              <ShieldCheck size={15} /> Self-report instruments, not diagnosis
            </span>
            <span>
              <Sparkles size={15} /> Deterministic reports no AI guesswork
            </span>
            <span>
              <Layers size={15} /> A report, an audio plan &amp; an ebook from every one
            </span>
          </Reveal>
        </div>
      </header>

      <section className="section catalog-live">
        <div className="container">
          <Reveal className="catalog-section-head">
            <h2 className="h2 catalog-h2">Available now</h2>
            {status === 'ready' && (
              <span className="catalog-count">
                {String(items.length).padStart(2, '0')} paths · scored, not guessed
              </span>
            )}
          </Reveal>

          {status === 'loading' && (
            <div className="catalog-state">
              <Loader2 size={26} className="ap-spin" />
              <p>Loading assessments…</p>
            </div>
          )}

          {status === 'error' && (
            <div className="catalog-state" role="alert">
              <h3>We couldn’t load the assessments</h3>
              <p>{error}</p>
              <button className="btn btn-ghost" onClick={retry}>
                <RefreshCcw size={16} /> Try again
              </button>
            </div>
          )}

          {status === 'ready' && items.length === 0 && (
            <div className="catalog-state">
              <h3>No assessments available yet</h3>
              <p>Please check back soon.</p>
            </div>
          )}

          {status === 'ready' && items.length > 0 && (
            <div className="catalog-grid">
              {items.map((a, i) => {
                const { Icon, bg, fg } = PALETTE[i % PALETTE.length]
                return (
                  <Reveal
                    as={Link}
                    to={`/assessments/${a.slug}`}
                    key={a._id}
                    className={`cat-card ${a.mostTaken ? 'cat-featured' : ''}`}
                    delay={(i % 2) * 0.1}
                  >
                    {a.mostTaken && <span className="featured-tag">Most taken</span>}
                    <div className="cat-card-head">
                      <span className="topic-ico" style={{ background: bg, color: fg }}>
                        <Icon size={26} strokeWidth={1.8} />
                      </span>
                      <div>
                        <h3>{a.name}</h3>
                        <p className="cat-tagline">{a.subDescription}</p>
                      </div>
                      {showPrice && (
                        <span className="topic-price">{formatPrice(a.cost, a.currency)}</span>
                      )}
                    </div>
                    {a.tags?.length > 0 && (
                      <div className="dim-chips">
                        {a.tags.map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="cat-card-foot">
                      <p className="topic-meta">
                        <span>
                          <Clock size={14} /> ~{estMinutes(a.questionsCount)} min
                        </span>
                        <span>
                          <ListChecks size={14} /> {a.questionsCount} questions
                        </span>
                      </p>
                      <span className="cat-go">
                        Explore this path
                        <span className="arrow">
                          <ArrowRight size={16} />
                        </span>
                      </span>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="section catalog-soon">
        <div className="container">
          <Reveal as="h2" className="h2 catalog-h2">
            On the path ahead
          </Reveal>
          <Reveal as="p" className="lede" delay={0.08}>
            The next topics being calibrated one new assessment lands each month.
          </Reveal>
          <div className="soon-grid">
            {COMING_SOON.map(({ title, icon: Icon, dims }, i) => (
              <Reveal as="article" key={title} className="soon-card" delay={(i % 3) * 0.08}>
                <span className="soon-ico">
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <h3>{title}</h3>
                <p>{dims.join(' · ')}</p>
                <span className="soon-bell">
                  <BellRing size={13} /> Notify me
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
