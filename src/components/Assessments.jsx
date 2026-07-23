import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Clock, ListChecks } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Reveal from './Reveal.jsx'
import { ASSESSMENTS, localizeAssessment } from '../data/assessments.js'

export default function Assessments() {
  const { t } = useTranslation()
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
              {t(
                'home.assess.lede',
                'Careful, well-made assessments thoughtful questions scored across real areas, not a quick five-question quiz. Twenty topics, one honest place to start.',
              )}
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Link to="/assessments" className="btn btn-ghost">
              {t('home.assess.browseAll', 'Browse all 20 topics')} <ArrowUpRight size={18} />
            </Link>
          </Reveal>
        </div>

        <div className="assess-grid">
          {ASSESSMENTS.map((raw, i) => {
            const { id, icon: Icon, bg, fg, title, mins, questions, price, dims, featured } =
              localizeAssessment(raw)
            return (
              <Reveal
                as={Link}
                to={`/assessments/${id}`}
                key={id}
                className={`topic-card ${featured ? 'featured' : ''}`}
                delay={(i % 3) * 0.1}
              >
                {featured && (
                  <span className="featured-tag">{t('home.assess.mostTaken', 'Most taken')}</span>
                )}
                <div className="topic-top">
                  <span
                    className="topic-ico"
                    style={
                      featured
                        ? { background: 'rgba(255,255,255,.14)', color: '#fff' }
                        : { background: bg, color: fg }
                    }
                  >
                    <Icon size={24} strokeWidth={1.8} />
                  </span>
                  <span className="topic-price">{price}</span>
                </div>
                <h3>{title}</h3>
                <p className="topic-meta">
                  <span>
                    <Clock size={14} /> {mins} {t('home.assess.min', 'min')}
                  </span>
                  <span>
                    <ListChecks size={14} /> {questions.length} {t('home.assess.questions', 'questions')}
                  </span>
                </p>
                <div className="dim-chips">
                  {dims.map((d) => (
                    <span key={d.key}>{d.label.split(' ')[0].replace(/[&,]/g, '')}</span>
                  ))}
                </div>
                <div className="topic-cta">
                  {t('home.assess.begin', 'Begin assessment')}
                  <span className="arrow">
                    <ArrowRight size={17} />
                  </span>
                </div>
              </Reveal>
            )
          })}

          <Reveal as={Link} to="/assessments" className="topic-card" delay={0.2}>
            <div className="topic-top">
              <span className="topic-ico" style={{ background: '#efe9dd', color: '#57536e' }}>
                <ArrowUpRight size={24} strokeWidth={1.8} />
              </span>
              <span className="topic-price">{t('home.assess.more', '+15 more')}</span>
            </div>
            <h3>{t('home.assess.moreTitle', 'Relationships, self-esteem, life transitions…')}</h3>
            <p className="topic-meta">
              <span>{t('home.assess.moreMeta', 'New topics added monthly')}</span>
            </p>
            <div className="topic-cta">
              {t('home.assess.seeAll', 'See the full list')}
              <span className="arrow">
                <ArrowRight size={17} />
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal as="p" className="bundle-note" delay={0.1}>
          <strong>{t('home.assess.bundleStrong', 'Bundle & save')}</strong>{' '}
          {t(
            'home.assess.bundleText',
            'Take linked assessments like Stress & Burnout → Emotional Intelligence together and save 30%.',
          )}
        </Reveal>
      </div>
    </section>
  )
}
