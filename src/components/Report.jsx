import { useEffect, useState } from 'react'
import { BookOpen, Headphones, MessagesSquare, ScanSearch, ShieldCheck, Sparkles } from 'lucide-react'
import Reveal from './Reveal.jsx'

const POINTS = [
  {
    icon: ScanSearch,
    title: 'Plain language, not clinical jargon',
    text: 'Every score is interpreted for you — what it means, why it shows up, and what tends to help.',
  },
  {
    icon: ShieldCheck,
    title: 'Deterministic, consistent, safe',
    text: 'Reports come from a validated scoring framework — the same answers always produce the same insight. No AI guesswork.',
  },
  {
    icon: Sparkles,
    title: 'It powers everything after',
    text: 'Your audio plan, your personalized ebook, your counselling sessions — all sequenced from this one document.',
  },
]

const RING_C = 326.7 // 2πr, r = 52

const REPORTS = [
  {
    initial: 'M',
    name: 'Maya',
    topic: 'Stress & Burnout',
    date: 'June 2026',
    overall: 62,
    ringLabel: 'Overall load',
    accent: '#6450cf',
    avatar: 'linear-gradient(135deg, #eeb381, #e2906a)',
    plan: '14-day audio plan',
    bars: [
      { label: 'Exhaustion', value: 72, color: '#d98b50' },
      { label: 'Cynicism', value: 58, color: '#6450cf' },
      { label: 'Sense of control', value: 41, color: '#8a76e8' },
      { label: 'Recovery capacity', value: 35, color: '#3c7a5e' },
    ],
    quote: [
      'Maya, your exhaustion runs high while your recovery capacity is stretched thin — ',
      'your energy isn’t broken, your rest is.',
      ' Your 14-day plan starts there: evenings first.',
    ],
  },
  {
    initial: 'J',
    name: 'Jonas',
    topic: 'Sleep & Rest',
    date: 'May 2026',
    overall: 58,
    ringLabel: 'Sleep strain',
    accent: '#4d3da8',
    avatar: 'linear-gradient(135deg, #8d76ec, #5a48bd)',
    plan: '14-day audio plan',
    bars: [
      { label: 'Sleep pressure', value: 66, color: '#6450cf' },
      { label: 'Wind-down', value: 74, color: '#8a76e8' },
      { label: 'Rhythm', value: 52, color: '#3c7a5e' },
      { label: 'Worry at night', value: 61, color: '#d98b50' },
    ],
    quote: [
      'Jonas, your wind-down genuinely works — it’s the consistency that slips. ',
      'Anchor one fixed wake time',
      ' and let bedtime come to meet it. Your nights can hold.',
    ],
  },
  {
    initial: 'A',
    name: 'Aisha',
    topic: 'Emotional Intelligence',
    date: 'June 2026',
    overall: 71,
    ringLabel: 'EQ profile',
    accent: '#3c7a5e',
    avatar: 'linear-gradient(135deg, #6fbf8f, #2e5f49)',
    plan: '21-day audio plan',
    bars: [
      { label: 'Self-awareness', value: 58, color: '#cf6450' },
      { label: 'Regulation', value: 64, color: '#d98b50' },
      { label: 'Empathy', value: 82, color: '#3c7a5e' },
      { label: 'Expression', value: 70, color: '#6450cf' },
    ],
    quote: [
      'Aisha, you read others beautifully — empathy is a real strength. ',
      'The growth edge is turning that inward',
      ', one honest sentence a day.',
    ],
  },
]

function ReportCard({ r, active }) {
  const [filled, setFilled] = useState(false)
  useEffect(() => {
    if (!active) {
      setFilled(false)
      return
    }
    // wait for the crossfade-in to begin, then animate the ring + bars
    const t = setTimeout(() => setFilled(true), 240)
    return () => clearTimeout(t)
  }, [active])

  return (
    <figure className={`report-card ${active ? 'on' : ''}`} aria-hidden={!active}>
      <div className="rc-head">
        <span className="rc-avatar" style={{ background: r.avatar }} aria-hidden="true">
          {r.initial}
        </span>
        <div>
          <h4>{r.name}&rsquo;s Report</h4>
          <p>
            {r.topic} · {r.date}
          </p>
        </div>
        <span className="rc-badge">Complete</span>
      </div>

      <div className="rc-body">
        <div className="rc-ring">
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
                stroke: r.accent,
                strokeDasharray: RING_C,
                strokeDashoffset: filled ? RING_C * (1 - r.overall / 100) : RING_C,
              }}
            />
          </svg>
          <div className="rc-ring-label">
            <strong>{r.overall}</strong>
            <small>{r.ringLabel}</small>
          </div>
        </div>

        <div className="rc-bars">
          {r.bars.map((b) => (
            <div className="rc-bar-row" key={b.label}>
              <header>
                <span>{b.label}</span>
                <em>{b.value} / 100</em>
              </header>
              <span className="rc-bar">
                <i style={{ width: filled ? `${b.value}%` : 0, background: b.color }} />
              </span>
            </div>
          ))}
        </div>
      </div>

      <blockquote className="rc-quote">
        &ldquo;{r.quote[0]}
        <strong>{r.quote[1]}</strong>
        {r.quote[2]}&rdquo;
      </blockquote>

      <footer className="rc-foot">
        <span className="lbl">This report builds</span>
        <span>
          <Headphones size={13} /> {r.plan}
        </span>
        <span>
          <BookOpen size={13} /> Personal ebook
        </span>
        <span>
          <MessagesSquare size={13} /> Counselling context
        </span>
      </footer>
    </figure>
  )
}

export default function Report() {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIdx((i) => (i + 1) % REPORTS.length), 5000)
    return () => clearInterval(id)
  }, [paused])

  return (
    <section className="section report" id="report">
      <div className="container report-inner">
        <div>
          <Reveal as="span" className="eyebrow">
            Your personal report
          </Reveal>
          <Reveal as="h2" className="h2" delay={0.08}>
            A report that <em>reads you back.</em>
          </Reveal>
          <Reveal as="p" className="lede" delay={0.16}>
            Not a percentage and a pat on the back — a detailed profile of where you are,
            written like a kind, clear-eyed friend.
          </Reveal>

          <div className="report-points">
            {POINTS.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} className="rpoint" delay={0.2 + i * 0.1}>
                <span className="rpoint-ico">
                  <Icon size={21} strokeWidth={1.9} />
                </span>
                <div>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal
          className="report-figure"
          delay={0.15}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          aria-label="Example personal reports, cycling"
        >
          <div className="report-stack">
            <span className="report-back b2" aria-hidden="true" />
            <span className="report-back b1" aria-hidden="true" />
            <div className="report-cards">
              {REPORTS.map((rep, i) => (
                <ReportCard key={rep.name} r={rep} active={i === idx} />
              ))}
            </div>
          </div>
          <div className="report-dots" role="tablist" aria-label="Sample report">
            {REPORTS.map((rep, i) => (
              <button
                key={rep.name}
                className={i === idx ? 'on' : ''}
                aria-label={`${rep.name}'s report`}
                aria-selected={i === idx}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
