import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import {
  Anchor,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Check,
  Crosshair,
  FileHeart,
  Headphones,
  Lightbulb,
  Lock,
  MessagesSquare,
  Mic,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { bandOf, DEMO_SCORES, getAssessment } from '../data/assessments.js'

const GEN_STEPS = (a) => [
  'Scoring your answers',
  `Mapping ${a.dims.length} dimensions`,
  'Writing your interpretation',
  `Sequencing your ${a.plan.days}-day audio plan`,
]

const BAND_META = {
  load: {
    low: { chip: 'Low load', cls: 'band-good' },
    mid: { chip: 'Moderate load', cls: 'band-mid' },
    high: { chip: 'High load', cls: 'band-hot' },
  },
  strength: {
    low: { chip: 'Developing', cls: 'band-hot' },
    mid: { chip: 'Growing', cls: 'band-mid' },
    high: { chip: 'Strong', cls: 'band-good' },
  },
}

const PROFILE_TITLES = {
  load: {
    low: 'On steady ground',
    mid: 'Under pressure, still standing',
    high: 'Carrying a heavy load',
  },
  strength: {
    low: 'At the trailhead',
    mid: 'Growing steadily',
    high: 'A strong foundation',
  },
}

function GeneratingScreen({ a, done }) {
  const steps = GEN_STEPS(a)
  const [reached, setReached] = useState(0)

  useEffect(() => {
    if (reached >= steps.length) {
      const t = setTimeout(done, 700)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setReached((r) => r + 1), 1050)
    return () => clearTimeout(t)
  }, [reached, steps.length, done])

  return (
    <div className="genscreen">
      <div className="orb gen-orb" aria-hidden="true">
        <span className="orb-ring" />
        <span className="orb-ring r2" />
        <div className="orb-core gen-core" />
      </div>
      <h1>Reading your answers…</h1>
      <ul className="gen-steps" aria-live="polite">
        {steps.map((s, i) => (
          <li key={s} className={i < reached ? 'done' : i === reached ? 'active' : ''}>
            <span className="gen-check">{i < reached ? <Check size={13} /> : null}</span>
            {s}
          </li>
        ))}
      </ul>
      <p className="gen-note">Deterministic framework · same answers, same report, every time</p>
    </div>
  )
}

export default function AssessmentReport() {
  const { id } = useParams()
  const { state } = useLocation()
  const a = getAssessment(id)

  // Viewing an existing report from the library skips the generation ceremony.
  const isViewing = !!state?.view
  const [phase, setPhase] = useState(isViewing ? 'ready' : 'generating')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (phase === 'ready') {
      const t = requestAnimationFrame(() => setMounted(true))
      return () => cancelAnimationFrame(t)
    }
  }, [phase])

  if (!a) return <Navigate to="/assessments" replace />

  const scores = state?.scores || DEMO_SCORES[id]
  const name = state?.name || 'Maya'
  const overallBand = bandOf(scores.overall)
  const bandMeta = BAND_META[a.direction]

  // anchor = healthiest dimension, focus = the one needing most care
  const ranked = [...a.dims].sort((x, y) => scores.dims[x.key] - scores.dims[y.key])
  const anchor = a.direction === 'load' ? ranked[0] : ranked[ranked.length - 1]
  const focus = a.direction === 'load' ? ranked[ranked.length - 1] : ranked[0]

  const RING_C = 326.7
  const today =
    state?.dateLabel ||
    new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  if (phase === 'generating') {
    return <GeneratingScreen a={a} done={() => setPhase('ready')} />
  }

  return (
    <div className={`reportpage ${mounted ? 'in' : ''}`} style={{ '--topic': a.accent }}>
      <header className="take-bar">
        <Logo />
        <p className="take-topic">{isViewing ? `Report · ${today}` : 'Personal report'}</p>
        <Link
          to={isViewing ? '/reports' : '/assessments'}
          className="take-exit"
          aria-label={isViewing ? 'Back to your reports' : 'Back to assessments'}
        >
          <RefreshCcw size={18} />
        </Link>
      </header>

      <main className="report-wrap">
        {/* ---- header card ---- */}
        <section className="rp-head">
          <div className="rc-head rp-head-row">
            <span className="rc-avatar" aria-hidden="true">
              {name[0].toUpperCase()}
            </span>
            <div>
              <h1>{name}&rsquo;s Report</h1>
              <p>
                {a.title} · {today}
              </p>
            </div>
            <span className="rc-badge">Complete</span>
          </div>

          <div className="rp-overview">
            <div className="rc-ring rp-ring">
              <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
                <circle className="track" cx="66" cy="66" r="52" fill="none" strokeWidth="11" />
                <circle
                  className="val"
                  cx="66"
                  cy="66"
                  r="52"
                  fill="none"
                  strokeWidth="11"
                  style={{
                    stroke: a.accent,
                    strokeDasharray: RING_C,
                    strokeDashoffset: mounted ? RING_C * (1 - scores.overall / 100) : RING_C,
                  }}
                />
              </svg>
              <div className="rc-ring-label">
                <strong>{scores.overall}</strong>
                <small>{a.ringLabel}</small>
              </div>
            </div>
            <div>
              <span className={`band-chip ${bandMeta[overallBand].cls}`}>
                {PROFILE_TITLES[a.direction][overallBand]}
              </span>
              <p className="rp-overall-text">{a.overall[overallBand]}</p>
            </div>
          </div>
        </section>

        {/* ---- anchor & focus ---- */}
        <section className="rp-duo">
          <article className="rp-duo-card anchor">
            <span className="rp-duo-ico">
              <Anchor size={18} />
            </span>
            <div>
              <h3>Your anchor {anchor.label}</h3>
              <p>
                At {scores.dims[anchor.key]}, this is the dimension holding you steadiest right now.
                Your plan leans on it deliberately.
              </p>
            </div>
          </article>
          <article className="rp-duo-card focus">
            <span className="rp-duo-ico">
              <Crosshair size={18} />
            </span>
            <div>
              <h3>Your focus {focus.label}</h3>
              <p>
                At {scores.dims[focus.key]}, this is where the work starts. The first week of your
                plan is built around it.
              </p>
            </div>
          </article>
        </section>

        {/* ---- dimensions ---- */}
        <section className="rp-dims">
          <h2 className="rp-h2">
            <FileHeart size={19} /> The four dimensions, read closely
          </h2>
          {a.dims.map((d) => {
            const score = scores.dims[d.key]
            const band = bandOf(score)
            return (
              <article className="rp-dim" key={d.key}>
                <header>
                  <div>
                    <h3>{d.label}</h3>
                    <p className="rp-dim-desc">{d.desc}</p>
                  </div>
                  <div className="rp-dim-score">
                    <strong>{score}</strong>
                    <span className={`band-chip ${bandMeta[band].cls}`}>{bandMeta[band].chip}</span>
                  </div>
                </header>
                <div className="rc-bar rp-bar">
                  <i
                    style={{
                      width: mounted ? `${score}%` : 0,
                      background: a.accent,
                    }}
                  />
                </div>
                <p className="rp-dim-hint">{d.hints[band]}</p>
                <p className="rp-dim-rec">
                  <Lightbulb size={15} />
                  <span>
                    <strong>Try this:</strong> {d.rec}
                  </span>
                </p>
              </article>
            )
          })}
        </section>

        {/* ---- plan preview ---- */}
        <section className="rp-plan">
          <h2 className="rp-h2 on-night">
            <Headphones size={19} /> Your {a.plan.days}-day plan, sequenced from this report
          </h2>
          <p className="rp-plan-welcome">
            <Mic size={15} /> &ldquo;Hi {name} {a.plan.welcome}&rdquo;
          </p>
          <div className="rp-sessions">
            {a.plan.sessions.map((s) => (
              <div className="rp-session" key={s.day}>
                <span className="rp-session-day">Day {s.day}</span>
                <p>{s.title}</p>
                <small>{s.len}</small>
              </div>
            ))}
            <div className="rp-session locked">
              <span className="rp-session-day">
                <Lock size={12} />
              </span>
              <p>
                Days {a.plan.sessions.length + 1}–{a.plan.days}
              </p>
              <small>one each morning</small>
            </div>
          </div>
          <Link to="/audio" className="btn btn-light rp-plan-btn">
            Unlock my audio plan <ArrowRight size={17} />
          </Link>
        </section>

        {/* ---- next doors ---- */}
        <section className="rp-next">
          <h2 className="rp-h2">
            <ArrowRight size={19} /> Doors this report opens
          </h2>
          <div className="rp-next-grid">
            <Link to="/#explore" className="rp-next-card">
              <BookOpen size={20} />
              <div>
                <strong>
                  &ldquo;{a.ebook}: {name}&rsquo;s {a.plan.days} Days&rdquo;
                </strong>
                <small>Your personalized ebook, generated from these scores</small>
              </div>
            </Link>
            <Link to="/#explore" className="rp-next-card">
              <MessagesSquare size={20} />
              <div>
                <strong>Talk it through</strong>
                <small>An AI advisor that has already read this report</small>
              </div>
            </Link>
            <Link to={`/assessments/${a.id}/take`} className="rp-next-card">
              <CalendarCheck size={20} />
              <div>
                <strong>Retake in 60–90 days</strong>
                <small>Watch these numbers move that&rsquo;s the proof</small>
              </div>
            </Link>
          </div>
        </section>

        <footer className="rp-foot">
          <p>
            <ShieldCheck size={14} /> This report is a self-reflection tool generated from your
            answers by a fixed scoring framework. It is not a clinical assessment, diagnosis, or
            treatment plan. If you&rsquo;re struggling, a licensed professional is the right next
            step and a brave one.
          </p>
          <div className="rp-foot-actions">
            <Link to="/assessments" className="btn btn-ghost">
              Explore another path
            </Link>
            <Link to="/" className="btn btn-primary">
              Back to Daybreak
            </Link>
          </div>
        </footer>
      </main>
    </div>
  )
}
