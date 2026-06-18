const TOPICS = [
  'Stress & Burnout',
  'Sleep & Rest',
  'Anxiety & Worry',
  'Focus & Clarity',
  'Self-Esteem',
  'Emotional Intelligence',
  'Relationships',
  'Life Transitions',
  'Resilience',
  'Mindful Habits',
]

export default function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((dup) => (
          <span key={dup} className="marquee-item">
            {TOPICS.map((t) => (
              <span key={t} className="marquee-item">
                {t}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}
