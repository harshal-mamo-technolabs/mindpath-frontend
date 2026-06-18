import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Clock, ListChecks } from 'lucide-react'
import Reveal from './Reveal.jsx'
import { ASSESSMENTS } from '../data/assessments.js'

export default function Assessments() {
  return (
    <section className="section assessments" id="assessments">
      <div className="container">
        <div className="assess-head">
          <div>
            <Reveal as="span" className="eyebrow">
              The assessments
            </Reveal>
            <Reveal as="h2" className="h2" delay={0.08}>
              Start where it <em>hurts most.</em>
            </Reveal>
            <Reveal as="p" className="lede" delay={0.16}>
              Psychometric-style self-report instruments thoughtful questions scored across real
              dimensions, never a five-question quiz. Twenty topics, one honest starting point.
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Link to="/assessments" className="btn btn-ghost">
              Browse all 20 topics <ArrowUpRight size={18} />
            </Link>
          </Reveal>
        </div>

        <div className="assess-grid">
          {ASSESSMENTS.map(
            ({ id, icon: Icon, bg, fg, title, mins, questions, price, dims, featured }, i) => (
              <Reveal
                as={Link}
                to={`/assessments/${id}`}
                key={id}
                className={`topic-card ${featured ? 'featured' : ''}`}
                delay={(i % 3) * 0.1}
              >
                {featured && <span className="featured-tag">Most taken</span>}
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
                    <Clock size={14} /> {mins} min
                  </span>
                  <span>
                    <ListChecks size={14} /> {questions.length} questions
                  </span>
                </p>
                <div className="dim-chips">
                  {dims.map((d) => (
                    <span key={d.key}>{d.label.split(' ')[0].replace(/[&,]/g, '')}</span>
                  ))}
                </div>
                <div className="topic-cta">
                  Begin assessment
                  <span className="arrow">
                    <ArrowRight size={17} />
                  </span>
                </div>
              </Reveal>
            ),
          )}

          <Reveal as={Link} to="/assessments" className="topic-card" delay={0.2}>
            <div className="topic-top">
              <span className="topic-ico" style={{ background: '#efe9dd', color: '#57536e' }}>
                <ArrowUpRight size={24} strokeWidth={1.8} />
              </span>
              <span className="topic-price">+15 more</span>
            </div>
            <h3>Relationships, self-esteem, life transitions…</h3>
            <p className="topic-meta">
              <span>New topics added monthly</span>
            </p>
            <div className="topic-cta">
              See the full catalog
              <span className="arrow">
                <ArrowRight size={17} />
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal as="p" className="bundle-note" delay={0.1}>
          <strong>Bundle &amp; save</strong> Pair linked assessments like Stress &amp; Burnout →
          Emotional Intelligence and save 30% on the chain.
        </Reveal>
      </div>
    </section>
  )
}
