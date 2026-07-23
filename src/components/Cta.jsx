import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Gift, Headphones } from 'lucide-react'
import Reveal from './Reveal.jsx'

export default function Cta() {
  const { t } = useTranslation()
  return (
    <section className="cta">
      <div className="container">
        <Reveal className="cta-panel">
          <div className="aurora" aria-hidden="true">
            <i />
            <i />
          </div>
          <h2>
            {t('home.cta.h2a')}
            <br />
            <em>{t('home.cta.h2em')}</em>
          </h2>
          <p>{t('home.cta.text')}</p>
          <div className="cta-actions">
            <Link to="/assessments" className="btn btn-light">
              {t('home.cta.primary')} <ArrowRight size={18} />
            </Link>
            <Link
              to="/sound"
              className="btn btn-ghost"
              style={{ color: '#fff', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.4)' }}
            >
              <Headphones size={18} /> {t('home.cta.secondary')}
            </Link>
          </div>
          <span className="cta-referral">
            <Gift size={16} />
            {t('home.cta.referral')}
          </span>
        </Reveal>
      </div>
    </section>
  )
}
