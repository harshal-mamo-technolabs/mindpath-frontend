import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Clock, ListChecks } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Reveal from './Reveal.jsx'
import {
  AnxietyGlyph,
  EQGlyph,
  FocusGlyph,
  SleepGlyph,
  StressGlyph,
} from './TopicIcons.jsx'
import { useShowAssessmentPrice } from '../hooks/useShowAssessmentPrice.js'
import { estMinutes, useOffer } from '../hooks/useOffer.js'
import { formatPrice } from '../lib/plans.js'

// Decorative only — the same palette the catalogue uses, so a topic looks the
// same on both pages.
const PALETTE = [
  { Icon: StressGlyph, bg: '#f9e3cd', fg: '#8a5420' },
  { Icon: SleepGlyph, bg: '#e2dcf8', fg: '#4d3da8' },
  { Icon: AnxietyGlyph, bg: '#dde9dd', fg: '#2e5f49' },
  { Icon: EQGlyph, bg: '#fbe5e0', fg: '#a04a35' },
  { Icon: FocusGlyph, bg: '#f0edfb', fg: '#4d3da8' },
]

/**
 * The home page's assessment section.
 *
 * Renders the REAL catalogue from the API rather than a hand-written list, so
 * the topic count, question counts, durations and prices shown here are exactly
 * the ones people meet at checkout. It previously used a demo fixture with
 * different topics and prices — the sort of contradiction that costs trust at
 * the moment someone decides to pay.
 */
export default function Assessments() {
  const { t } = useTranslation()
  const showPrice = useShowAssessmentPrice()
  const { status, assessments, count, priceLabel } = useOffer()

  return (
    <section className="section assessments" id="assessments">
      <div className="container">
        <div className="assess-head">
          <div>
            <Reveal as="span" className="eyebrow">
              {t('home.assess.eyebrow', 'The assessments')}
            </Reveal>
            <Reveal as="h2" className="h2" delay={0.08}>
              {t('home.assess.h2A', 'Start where it')} <em>{t('home.assess.h2Em', 'hurts most.')}</em>
            </Reveal>
            <Reveal as="p" className="lede" delay={0.16}>
              {t('home.assess.lede')}
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Link to="/assessments" className="btn btn-ghost">
              {count
                ? t('home.assess.browseCount', { count })
                : t('home.assess.browse', 'Browse the topics')}{' '}
              <ArrowUpRight size={18} />
            </Link>
          </Reveal>
        </div>

        <div className="assess-grid">
          {assessments.map((a, i) => {
            const { Icon, bg, fg } = PALETTE[i % PALETTE.length]
            return (
              <Reveal
                as={Link}
                to={`/assessments/${a.slug}`}
                key={a._id}
                className={`topic-card ${a.mostTaken ? 'featured' : ''}`}
                delay={(i % 3) * 0.1}
              >
                {a.mostTaken && (
                  <span className="featured-tag">{t('home.assess.mostTaken', 'Most taken')}</span>
                )}
                <div className="topic-top">
                  <span
                    className="topic-ico"
                    style={
                      a.mostTaken
                        ? { background: 'rgba(255,255,255,.14)', color: '#fff' }
                        : { background: bg, color: fg }
                    }
                  >
                    <Icon size={24} strokeWidth={1.8} />
                  </span>
                  {showPrice && (
                    <span className="topic-price">{formatPrice(a.cost, a.currency)}</span>
                  )}
                </div>
                <h3>{a.name}</h3>
                <p className="topic-meta">
                  <span>
                    <Clock size={14} /> {estMinutes(a.questionsCount)} {t('home.assess.min', 'min')}
                  </span>
                  <span>
                    <ListChecks size={14} /> {a.questionsCount}{' '}
                    {t('home.assess.questions', 'questions')}
                  </span>
                </p>
                {a.tags?.length > 0 && (
                  <div className="dim-chips">
                    {a.tags.map((tag) => (
                      <span key={tag}>{tag.split(' ')[0].replace(/[&,]/g, '')}</span>
                    ))}
                  </div>
                )}
                <div className="topic-cta">
                  {t('home.assess.begin', 'Begin assessment')}
                  <span className="arrow">
                    <ArrowRight size={17} />
                  </span>
                </div>
              </Reveal>
            )
          })}
        </div>

        {status === 'ready' && showPrice && priceLabel && (
          <Reveal as="p" className="bundle-note" delay={0.1}>
            {t('home.assess.priceNote', { price: priceLabel })}
          </Reveal>
        )}
      </div>
    </section>
  )
}
