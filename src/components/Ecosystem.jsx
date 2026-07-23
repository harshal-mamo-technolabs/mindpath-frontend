import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Play } from 'lucide-react'
import Reveal from './Reveal.jsx'

const VOICE_BARS = [40, 75, 55, 90, 65, 100, 70, 85, 50, 78, 60, 92, 45, 70]
const TRACK_LENS = ['24:00', '45:00', '12:00']

export default function Ecosystem() {
  const { t } = useTranslation()
  const min = t('home.ecosystem.min')
  const tracks = t('home.ecosystem.tracks', { returnObjects: true })
  return (
    <section className="section" id="explore">
      <div className="container">
        <Reveal as="span" className="eyebrow">
          {t('home.ecosystem.eyebrow')}
        </Reveal>
        <Reveal as="h2" className="h2" delay={0.08}>
          {t('home.ecosystem.h2a')} <em>{t('home.ecosystem.h2em')}</em>
        </Reveal>
        <Reveal as="p" className="lede" delay={0.16}>
          {t('home.ecosystem.lede')}
        </Reveal>

        <div className="eco-grid">
          <Reveal as="article" className="eco-card eco-ebook" delay={0.1}>
            <span className="eco-tag">{t('home.ecosystem.ebookTag')}</span>
            <h3>{t('home.ecosystem.ebookTitle')}</h3>
            <p>{t('home.ecosystem.ebookText')}</p>
            <Link className="eco-link" to="/ebooks" style={{ color: '#8a5420' }}>
              {t('home.ecosystem.ebookLink')} <ArrowRight size={16} />
            </Link>
            <div className="eco-book-mock" aria-hidden="true">
              <small>Daybreak Press</small>
              <h5>{t('home.ecosystem.ebookMockTitle')}</h5>
              <span className="for">{t('home.ecosystem.ebookMockFor')}</span>
            </div>
          </Reveal>

          <Reveal as="article" className="eco-card eco-voice" delay={0.2}>
            <span className="eco-tag">{t('home.ecosystem.voiceTag')}</span>
            <h3>{t('home.ecosystem.voiceTitle')}</h3>
            <p>{t('home.ecosystem.voiceText')}</p>
            <Link className="eco-link" to="/counselling">
              {t('home.ecosystem.voiceLink')} <ArrowRight size={16} />
            </Link>
            <div className="voice-viz" aria-hidden="true">
              {VOICE_BARS.map((h, i) => (
                <i key={i} style={{ '--h': h, '--i': i }} />
              ))}
            </div>
            <div className="minutes" aria-hidden="true">
              <span>15 {min}</span>
              <span className="hot">30 {min}</span>
              <span>60 {min}</span>
            </div>
          </Reveal>

          <Reveal as="article" className="eco-card eco-music" delay={0.3}>
            <span className="eco-tag">{t('home.ecosystem.musicTag')}</span>
            <h3>{t('home.ecosystem.musicTitle')}</h3>
            <p>{t('home.ecosystem.musicText')}</p>
            <Link className="eco-link" to="/sound">
              {t('home.ecosystem.musicLink')} <ArrowRight size={16} />
            </Link>
            <div className="music-rows">
              {TRACK_LENS.map((len, i) => (
                <span className="music-row" key={i}>
                  <span className="mr-play">
                    <Play size={13} fill="currentColor" strokeWidth={0} />
                  </span>
                  {tracks[i]}
                  <em>{len}</em>
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
