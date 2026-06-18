import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ShieldCheck, X } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { getAssessment, LIKERT, scoreAnswers } from '../data/assessments.js'

export default function AssessmentTake() {
  const { id } = useParams()
  const navigate = useNavigate()
  const a = getAssessment(id)

  const [started, setStarted] = useState(false)
  const [name, setName] = useState('')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [leaving, setLeaving] = useState(false)
  const advanceTimer = useRef(null)

  const total = a ? a.questions.length : 0

  useEffect(() => () => clearTimeout(advanceTimer.current), [])

  // Keyboard: 1–5 answers, backspace goes back
  useEffect(() => {
    if (!started || !a) return
    const onKey = (e) => {
      const n = Number(e.key)
      if (n >= 1 && n <= 5) select(n - 1)
      if (e.key === 'Backspace' && step > 0) back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!a) return <Navigate to="/assessments" replace />

  const q = a.questions[step]
  const dim = a.dims.find((d) => d.key === q.dim)
  const progress = (step / total) * 100

  function select(value) {
    if (leaving) return
    const next = [...answers]
    next[step] = value
    setAnswers(next)
    setLeaving(true)
    advanceTimer.current = setTimeout(() => {
      if (step + 1 >= total) {
        const scores = scoreAnswers(a, next)
        navigate(`/assessments/${a.id}/report`, {
          state: { scores, name: name.trim() || 'Friend' },
        })
      } else {
        setStep(step + 1)
        setLeaving(false)
      }
    }, 420)
  }

  function back() {
    clearTimeout(advanceTimer.current)
    setLeaving(false)
    setStep((s) => Math.max(0, s - 1))
  }

  return (
    <div className="take" style={{ '--topic': a.accent }}>
      <header className="take-bar">
        <Logo />
        <p className="take-topic">{a.title}</p>
        <Link to={`/assessments/${a.id}`} className="take-exit" aria-label="Exit assessment">
          <X size={20} />
        </Link>
      </header>

      <div
        className="take-progress"
        role="progressbar"
        aria-valuenow={started ? step : 0}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Assessment progress"
      >
        <i style={{ width: started ? `${progress}%` : '0%' }} />
      </div>

      {!started ? (
        <main className="take-stage">
          <div className="take-card take-intro">
            <span className="dim-tag" style={{ background: a.bg, color: a.fg }}>
              {a.title} · {total} questions · ~{a.mins} min
            </span>
            <h1>Answer as this week&rsquo;s you.</h1>
            <p>
              Not your best week, not your worst just the one you&rsquo;re in. Each statement asks
              how often it&rsquo;s true for you lately. There are no right answers, only honest
              ones.
            </p>
            <label className="take-name">
              What should your report call you? <small>(optional)</small>
              <input
                type="text"
                value={name}
                maxLength={24}
                placeholder="Your first name"
                onChange={(e) => setName(e.target.value)}
                autoComplete="given-name"
              />
            </label>
            <button className="btn btn-primary" onClick={() => setStarted(true)}>
              Start <ArrowRight size={18} />
            </button>
            <p className="take-legal">
              <ShieldCheck size={13} /> Self-reflection instrument not a clinical or diagnostic
              tool.
            </p>
          </div>
        </main>
      ) : (
        <main className="take-stage" key={step}>
          <div className={`take-card ${leaving ? 'leaving' : ''}`}>
            <div className="take-card-top">
              <span className="dim-tag" style={{ background: a.bg, color: a.fg }}>
                {dim.label}
              </span>
              <span className="take-count">
                {step + 1} <em>/ {total}</em>
              </span>
            </div>
            <h1 className="take-q">{q.text}</h1>
            <div className="likert" role="group" aria-label="How often is this true for you?">
              {LIKERT.map((label, i) => (
                <button
                  key={label}
                  className={`likert-btn ${answers[step] === i ? 'picked' : ''}`}
                  onClick={() => select(i)}
                >
                  <span className="likert-dot" data-strength={i} />
                  {label}
                  <kbd>{i + 1}</kbd>
                </button>
              ))}
            </div>
            <div className="take-foot">
              {step > 0 ? (
                <button className="take-back" onClick={back}>
                  <ArrowLeft size={15} /> Previous
                </button>
              ) : (
                <span />
              )}
              <p className="take-hint">Lately = the last two weeks</p>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
