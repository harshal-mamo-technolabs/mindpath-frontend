import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Headphones, Leaf, Play, Star, TrendingUp } from 'lucide-react'
import Reveal from './Reveal.jsx'

const AVATARS = [
  ['SK', '#6450cf'],
  ['JM', '#3c7a5e'],
  ['AL', '#d98b50'],
  ['RT', '#4d3da8'],
]

function Spark() {
  return (
    <svg
      className="spark"
      width="96"
      height="34"
      viewBox="0 0 96 34"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 28 C 14 30, 18 22, 28 23 C 40 24, 44 14, 56 15 C 68 16, 74 8, 94 4"
        stroke="#3c7a5e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="94" cy="4" r="3.5" fill="#3c7a5e" />
    </svg>
  )
}

export default function Hero() {
  const { t } = useTranslation()
  return (
    <section className="hero" id="top">
      <div className="aurora" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <div className="container hero-inner">
        <div>
          <Reveal as="span" className="hero-badge">
            <span className="dot">
              <Leaf size={12} strokeWidth={2.5} />
            </span>
            {t('home.hero.badge')}
          </Reveal>

          <Reveal as="h1" className="h1" delay={0.08}>
            {t('home.hero.h1a')}{' '}
            <span className="underline-swash">
              {t('home.hero.h1swash')}
              <svg viewBox="0 0 220 24" fill="none" preserveAspectRatio="none" aria-hidden="true">
                <path
                  d="M4 16 C 50 22, 90 6, 130 12 C 160 16, 190 12, 216 8"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .<br />
            <em>{t('home.hero.h1b')}</em>
          </Reveal>

          <Reveal as="p" className="hero-sub" delay={0.16}>
            {t('home.hero.sub')}
          </Reveal>

          <Reveal className="hero-actions" delay={0.24}>
            <Link to="/assessments" className="btn btn-primary">
              {t('home.hero.findPath')} <ArrowRight size={18} />
            </Link>
            <Link to="/sound" className="btn btn-ghost">
              <Headphones size={18} /> {t('home.hero.listenFree')}
            </Link>
          </Reveal>

          <Reveal className="hero-proof" delay={0.32}>
            <div className="avatar-stack" aria-hidden="true">
              {AVATARS.map(([initials, bg]) => (
                <span key={initials} style={{ background: bg }}>
                  {initials}
                </span>
              ))}
            </div>
            <p className="hero-proof-text">
              <span className="stars" aria-label={t('home.hero.starsAria')}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                ))}
              </span>{' '}
              <strong>4.9</strong> {t('home.hero.ratingFrom')}
              <br />
              <strong>87%</strong> {t('home.hero.ratingCalmer')}
            </p>
          </Reveal>
        </div>

        <Reveal className="hero-scene" delay={0.2}>
          <div className="hero-art">
            <span className="hero-art-glow" aria-hidden="true" />
            <img
              src="/hero-calm.png"
              alt={t('home.hero.imageAlt')}
              loading="eager"
              width="1536"
              height="1024"
            />
          </div>

          <div className="float-card fc-report" aria-hidden="true">
            <p className="fc-label">{t('home.hero.fcReportLabel')}</p>
            <p className="fc-score">
              <strong>68</strong>
              <em>{t('home.hero.fcReportDelta')}</em>
            </p>
          </div>

          <div className="float-card fc-day" aria-hidden="true">
            <p className="fc-label">{t('home.hero.fcDayLabel')}</p>
            <div className="fc-day-row">
              <span className="play">
                <Play size={14} fill="currentColor" strokeWidth={0} />
              </span>
              <p>
                {t('home.hero.fcDayTitle')}
                <small>{t('home.hero.fcDayMeta')}</small>
              </p>
            </div>
          </div>

          <div className="float-card fc-mood" aria-hidden="true">
            <p className="fc-label">
              {t('home.hero.fcMoodLabel')} <TrendingUp size={12} style={{ display: 'inline' }} />
            </p>
            <Spark />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
