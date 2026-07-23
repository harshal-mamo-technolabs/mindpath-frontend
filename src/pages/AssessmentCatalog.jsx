import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const showPrice = useShowAssessmentPrice()
  const comingSoon = t('assess.catalog.comingSoon', { returnObjects: true })
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
            {t('assess.catalog.eyebrow')}
          </Reveal>
          <Reveal as="h1" className="h1 catalog-title" delay={0.08}>
            {t('assess.catalog.h1a')} <em>{t('assess.catalog.h1em')}</em>
          </Reveal>
          <Reveal as="p" className="lede" delay={0.16}>
            {t('assess.catalog.lede')}
          </Reveal>
          <Reveal className="catalog-trust" delay={0.24}>
            <span>
              <ShieldCheck size={15} /> {t('assess.catalog.trust1')}
            </span>
            <span>
              <Sparkles size={15} /> {t('assess.catalog.trust2')}
            </span>
            <span>
              <Layers size={15} /> {t('assess.catalog.trust3')}
            </span>
          </Reveal>
        </div>
      </header>

      <section className="section catalog-live">
        <div className="container">
          <Reveal className="catalog-section-head">
            <h2 className="h2 catalog-h2">{t('assess.catalog.availableNow')}</h2>
            {status === 'ready' && (
              <span className="catalog-count">
                {t('assess.catalog.count', { count: items.length })}
              </span>
            )}
          </Reveal>

          {status === 'loading' && (
            <div className="catalog-state">
              <Loader2 size={26} className="ap-spin" />
              <p>{t('assess.catalog.loading')}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="catalog-state" role="alert">
              <h3>{t('assess.catalog.errorTitle')}</h3>
              <p>{error}</p>
              <button className="btn btn-ghost" onClick={retry}>
                <RefreshCcw size={16} /> {t('assess.catalog.retry')}
              </button>
            </div>
          )}

          {status === 'ready' && items.length === 0 && (
            <div className="catalog-state">
              <h3>{t('assess.catalog.emptyTitle')}</h3>
              <p>{t('assess.catalog.emptyText')}</p>
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
                    {a.mostTaken && (
                      <span className="featured-tag">{t('assess.catalog.mostTaken')}</span>
                    )}
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
                          <Clock size={14} />{' '}
                          {t('assess.catalog.minAbbr', { min: estMinutes(a.questionsCount) })}
                        </span>
                        <span>
                          <ListChecks size={14} />{' '}
                          {t('assess.catalog.questions', { count: a.questionsCount })}
                        </span>
                      </p>
                      <span className="cat-go">
                        {t('assess.catalog.explore')}
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
            {t('assess.catalog.soonTitle')}
          </Reveal>
          <Reveal as="p" className="lede" delay={0.08}>
            {t('assess.catalog.soonLede')}
          </Reveal>
          <div className="soon-grid">
            {COMING_SOON.map(({ icon: Icon }, i) => (
              <Reveal as="article" key={i} className="soon-card" delay={(i % 3) * 0.08}>
                <span className="soon-ico">
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <h3>{comingSoon[i]?.title}</h3>
                <p>{comingSoon[i]?.dims.join(' · ')}</p>
                <span className="soon-bell">
                  <BellRing size={13} /> {t('assess.catalog.notifyMe')}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
