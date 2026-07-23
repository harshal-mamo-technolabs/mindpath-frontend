import { useTranslation } from 'react-i18next'

export default function Marquee() {
  const { t } = useTranslation()
  const topics = t('home.marquee.topics', { returnObjects: true })
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((dup) => (
          <span key={dup} className="marquee-item">
            {topics.map((topic) => (
              <span key={topic} className="marquee-item">
                {topic}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}
