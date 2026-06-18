import { Link } from 'react-router-dom'
import { ArrowRight, Gift, Headphones } from 'lucide-react'
import Reveal from './Reveal.jsx'

export default function Cta() {
  return (
    <section className="cta">
      <div className="container">
        <Reveal className="cta-panel">
          <div className="aurora" aria-hidden="true">
            <i />
            <i />
          </div>
          <h2>
            Begin where you are.
            <br />
            <em>Arrive somewhere lighter.</em>
          </h2>
          <p>
            Twelve minutes of honest answers today. A clearer picture of yourself tomorrow morning
            and a path that walks with you after that.
          </p>
          <div className="cta-actions">
            <Link to="/assessments" className="btn btn-light">
              Take your first assessment <ArrowRight size={18} />
            </Link>
            <Link
              to="/music"
              className="btn btn-ghost"
              style={{ color: '#fff', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.4)' }}
            >
              <Headphones size={18} /> Just the free music, for now
            </Link>
          </div>
          <span className="cta-referral">
            <Gift size={16} />
            Walking with a friend helps invite one, you both get a free session.
          </span>
        </Reveal>
      </div>
    </section>
  )
}
