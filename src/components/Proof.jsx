import { useTranslation } from 'react-i18next'
import Reveal from './Reveal.jsx'

const BA_ROWS = [
  { labelKey: 'rowExhaustion', was: '72%', now: '48%', val: '72 → 48' },
  { labelKey: 'rowEnergy', was: '35%', now: '68%', val: '35 → 68' },
]

const TESTIMONIAL_META = [
  { name: 'Sara K.', bg: '#6450cf', initials: 'SK' },
  { name: 'Jonas M.', bg: '#3c7a5e', initials: 'JM' },
]

export default function Proof() {
  const { t } = useTranslation()
  const testimonials = t('home.proof.testimonials', { returnObjects: true })
  return (
    <section className="section proof">
      <div className="container">
        <Reveal as="span" className="eyebrow">
          {t('home.proof.eyebrow')}
        </Reveal>
        <Reveal as="h2" className="h2" delay={0.08}>
          {t('home.proof.h2a')} <em>{t('home.proof.h2em')}</em>
        </Reveal>

        <div className="proof-grid">
          <Reveal as="article" className="progress-card" delay={0.1}>
            <span className="eco-tag">{t('home.proof.progressTag')}</span>
            <h3>{t('home.proof.progressTitle')}</h3>
            <div className="before-after">
              {BA_ROWS.map(({ labelKey, was, now, val }) => (
                <div className="ba-row" key={labelKey}>
                  <header>
                    <span>{t(`home.proof.${labelKey}`)}</span>
                    <em>{val}</em>
                  </header>
                  <div className="ba-track">
                    <span className="was" style={{ '--was': was }} />
                    <span className="now" style={{ '--now': now }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="progress-foot">{t('home.proof.progressFoot')}</p>
          </Reveal>

          {TESTIMONIAL_META.map(({ name, bg, initials }, i) => (
            <Reveal as="article" className="testimonial" key={name} delay={0.2 + i * 0.1}>
              <blockquote>&ldquo;{testimonials[i]?.quote}&rdquo;</blockquote>
              <div className="t-who">
                <span className="t-av" style={{ background: bg }}>
                  {initials}
                </span>
                <p>
                  {name}
                  <small>{testimonials[i]?.role}</small>
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
