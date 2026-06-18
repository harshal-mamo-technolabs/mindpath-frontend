import { Link } from 'react-router-dom'
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
            Assessment-led mental wellness
          </Reveal>

          <Reveal as="h1" className="h1" delay={0.08}>
            Your mind has{' '}
            <span className="underline-swash">
              a path
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
            <em>Let&rsquo;s walk it together.</em>
          </Reveal>

          <Reveal as="p" className="hero-sub" delay={0.16}>
            Take a guided self-assessment, get a personal report that actually reads like
            you  then follow a daily audio plan, ebooks, and counselling shaped around
            your scores. Ten quiet minutes a day.
          </Reveal>

          <Reveal className="hero-actions" delay={0.24}>
            <Link to="/assessments" className="btn btn-primary">
              Find your path <ArrowRight size={18} />
            </Link>
            <Link to="/music" className="btn btn-ghost">
              <Headphones size={18} /> Listen free first
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
              <span className="stars" aria-label="Rated 4.9 out of 5 stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                ))}
              </span>{' '}
              <strong>4.9</strong> from 12,000+ journeys
              <br />
              <strong>87%</strong> report calmer mornings by day 14
            </p>
          </Reveal>
        </div>

        <Reveal className="hero-scene" delay={0.2}>
          <div className="hero-art">
            <span className="hero-art-glow" aria-hidden="true" />
            <img
              src="/hero-calm.png"
              alt="A person sitting calmly at a tidy desk with a hand resting on their heart, beside a plant, a cup of tea, an open journal and books"
              loading="eager"
              width="1536"
              height="1024"
            />
          </div>

          <div className="float-card fc-report" aria-hidden="true">
            <p className="fc-label">Recovery capacity</p>
            <p className="fc-score">
              <strong>68</strong>
              <em>+21 since retake</em>
            </p>
          </div>

          <div className="float-card fc-day" aria-hidden="true">
            <p className="fc-label">Today on your path</p>
            <div className="fc-day-row">
              <span className="play">
                <Play size={14} fill="currentColor" strokeWidth={0} />
              </span>
              <p>
                Day 4 · Loosening the grip
                <small>7 min · unlocked this morning</small>
              </p>
            </div>
          </div>

          <div className="float-card fc-mood" aria-hidden="true">
            <p className="fc-label">
              Mood trend <TrendingUp size={12} style={{ display: 'inline' }} />
            </p>
            <Spark />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
