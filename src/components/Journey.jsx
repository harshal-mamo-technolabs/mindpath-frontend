import { useTranslation } from 'react-i18next'
import { ClipboardList, FileHeart, Headphones, RefreshCcw, Repeat } from 'lucide-react'
import Reveal from './Reveal.jsx'

const STEP_STYLES = [
  { icon: ClipboardList, bg: '#f0edfb', fg: '#4d3da8' },
  { icon: FileHeart, bg: '#f9e3cd', fg: '#8a5420' },
  { icon: Headphones, bg: '#dde9dd', fg: '#2e5f49' },
  { icon: RefreshCcw, bg: '#e2dcf8', fg: '#4d3da8' },
]

export default function Journey() {
  const { t } = useTranslation()
  const steps = t('home.journey.steps', { returnObjects: true })
  return (
    <section className="section journey" id="journey">
      <div className="container">
        <div className="journey-head">
          <Reveal as="span" className="eyebrow">
            {t('home.journey.eyebrow')}
          </Reveal>
          <Reveal as="h2" className="h2" delay={0.08}>
            {t('home.journey.h2a')} <em>{t('home.journey.h2em')}</em>
          </Reveal>
          <Reveal as="p" className="lede" delay={0.16}>
            {t('home.journey.lede')}
          </Reveal>
        </div>

        <Reveal className="journey-map" reveal={false}>
          <svg
            className="journey-path-svg"
            viewBox="0 0 1140 190"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M30 150 C 140 40, 230 40, 320 90 C 410 140, 480 160, 570 110 C 660 60, 730 40, 820 90 C 910 140, 990 150, 1110 60"
              stroke="currentColor"
              strokeWidth="2.5"
            />
          </svg>

          <div className="journey-steps">
            {STEP_STYLES.map(({ icon: Icon, bg, fg }, i) => (
              <Reveal key={i} className="step-card" delay={i * 0.12}>
                <span className="step-num">
                  {t('home.journey.step')} {String(i + 1).padStart(2, '0')}
                </span>
                <span className="step-ico" style={{ background: bg, color: fg }}>
                  <Icon size={24} strokeWidth={1.8} />
                </span>
                <h3>{steps[i]?.title}</h3>
                <p>{steps[i]?.text}</p>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal className="journey-loop-note" delay={0.2}>
          <span className="loop-pill">
            <Repeat size={16} />
            {t('home.journey.loopNote')}
          </span>
        </Reveal>
      </div>
    </section>
  )
}
