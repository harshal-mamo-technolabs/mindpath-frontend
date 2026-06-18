import Reveal from './Reveal.jsx'

const BA_ROWS = [
  { label: 'Exhaustion', was: '72%', now: '48%', val: '72 → 48' },
  { label: 'Recovery capacity', was: '35%', now: '68%', val: '35 → 68' },
]

const TESTIMONIALS = [
  {
    quote:
      'The report named something I couldn’t. “Your energy isn’t broken, your rest is”  I think about that line every evening.',
    name: 'Sara K.',
    role: 'Stress & Burnout path · day 41',
    bg: '#6450cf',
    initials: 'SK',
  },
  {
    quote:
      'Ten minutes a day felt almost too small to matter. Then I retook the assessment and the numbers moved.',
    name: 'Jonas M.',
    role: 'Sleep & Rest path · retake +27',
    bg: '#3c7a5e',
    initials: 'JM',
  },
]

export default function Proof() {
  return (
    <section className="section proof">
      <div className="container">
        <Reveal as="span" className="eyebrow">
          Proof, not promises
        </Reveal>
        <Reveal as="h2" className="h2" delay={0.08}>
          The path is real <em>when you can measure it.</em>
        </Reveal>

        <div className="proof-grid">
          <Reveal as="article" className="progress-card" delay={0.1}>
            <span className="eco-tag">Retake after 60–90 days</span>
            <h3>Maya&rsquo;s before &amp; after</h3>
            <div className="before-after">
              {BA_ROWS.map(({ label, was, now, val }) => (
                <div className="ba-row" key={label}>
                  <header>
                    <span>{label}</span>
                    <em>{val}</em>
                  </header>
                  <div className="ba-track">
                    <span className="was" style={{ '--was': was }} />
                    <span className="now" style={{ '--now': now }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="progress-foot">
              Same questions, same framework so the change you see is yours, not the
              measurement&rsquo;s.
            </p>
          </Reveal>

          {TESTIMONIALS.map(({ quote, name, role, bg, initials }, i) => (
            <Reveal as="article" className="testimonial" key={name} delay={0.2 + i * 0.1}>
              <blockquote>&ldquo;{quote}&rdquo;</blockquote>
              <div className="t-who">
                <span className="t-av" style={{ background: bg }}>
                  {initials}
                </span>
                <p>
                  {name}
                  <small>{role}</small>
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
