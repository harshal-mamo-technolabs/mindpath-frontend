import { Link } from 'react-router-dom'
import { ArrowRight, BellRing, Clock, Layers, ListChecks, ShieldCheck, Sparkles } from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { ASSESSMENTS, COMING_SOON } from '../data/assessments.js'

export default function AssessmentCatalog() {
  return (
    <main className="catalog">
      <header className="catalog-hero">
        <div className="aurora" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="container">
          <Reveal as="span" className="eyebrow">
            The catalog
          </Reveal>
          <Reveal as="h1" className="h1 catalog-title" delay={0.08}>
            Twenty paths. <em>Start with the one that aches.</em>
          </Reveal>
          <Reveal as="p" className="lede" delay={0.16}>
            Every MindPath journey begins with one honest assessment  a
            psychometric-style questionnaire scored across real dimensions. Pick the
            topic that names what you&rsquo;re carrying.
          </Reveal>
          <Reveal className="catalog-trust" delay={0.24}>
            <span>
              <ShieldCheck size={15} /> Self-report instruments, not diagnosis
            </span>
            <span>
              <Sparkles size={15} /> Deterministic reports  no AI guesswork
            </span>
            <span>
              <Layers size={15} /> Bundles save 30%
            </span>
          </Reveal>
        </div>
      </header>

      <section className="section catalog-live">
        <div className="container">
          <Reveal className="catalog-section-head">
            <h2 className="h2 catalog-h2">Available now</h2>
            <span className="catalog-count">
              {String(ASSESSMENTS.length).padStart(2, '0')} paths · scored, not guessed
            </span>
          </Reveal>
          <div className="catalog-grid">
            {ASSESSMENTS.map((a, i) => {
              const Icon = a.icon
              return (
                <Reveal
                  as={Link}
                  to={`/assessments/${a.id}`}
                  key={a.id}
                  className={`cat-card ${a.featured ? 'cat-featured' : ''}`}
                  delay={(i % 2) * 0.1}
                >
                  {a.featured && <span className="featured-tag">Most taken</span>}
                  <div className="cat-card-head">
                    <span className="topic-ico" style={{ background: a.bg, color: a.fg }}>
                      <Icon size={26} strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3>{a.title}</h3>
                      <p className="cat-tagline">{a.tagline}</p>
                    </div>
                    <span className="topic-price">{a.price}</span>
                  </div>
                  <div className="dim-chips">
                    {a.dims.map((d) => (
                      <span key={d.key}>{d.label}</span>
                    ))}
                  </div>
                  <div className="cat-card-foot">
                    <p className="topic-meta">
                      <span>
                        <Clock size={14} /> {a.mins} min
                      </span>
                      <span>
                        <ListChecks size={14} /> {a.questions.length} questions
                      </span>
                      <span>{a.plan.days}-day audio plan</span>
                    </p>
                    <span className="cat-go">
                      Explore this path
                      <span className="arrow">
                        <ArrowRight size={16} />
                      </span>
                    </span>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section catalog-soon">
        <div className="container">
          <Reveal as="h2" className="h2 catalog-h2">
            On the path ahead
          </Reveal>
          <Reveal as="p" className="lede" delay={0.08}>
            The next topics being calibrated  one new assessment lands each month.
          </Reveal>
          <div className="soon-grid">
            {COMING_SOON.map(({ title, icon: Icon, dims }, i) => (
              <Reveal as="article" key={title} className="soon-card" delay={(i % 3) * 0.08}>
                <span className="soon-ico">
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <h3>{title}</h3>
                <p>{dims.join(' · ')}</p>
                <span className="soon-bell">
                  <BellRing size={13} /> Notify me
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
