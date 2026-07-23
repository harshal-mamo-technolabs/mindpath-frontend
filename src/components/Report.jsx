import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  Headphones,
  MessagesSquare,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Reveal from './Reveal.jsx'

const POINT_ICONS = [ScanSearch, ShieldCheck, Sparkles]

const RING_C = 326.7 // 2πr, r = 52

/* Visual/numeric fields per sample report; the text (topic, date, ring label, bar
   labels, quote) comes from the `home.report.samples` translations by index. */
const REPORT_META = [
  {
    initial: 'M',
    name: 'Maya',
    overall: 62,
    accent: '#6450cf',
    avatar: 'linear-gradient(135deg, #eeb381, #e2906a)',
    days: 14,
    bars: [
      { value: 72, color: '#d98b50' },
      { value: 58, color: '#6450cf' },
      { value: 41, color: '#8a76e8' },
      { value: 35, color: '#3c7a5e' },
    ],
  },
  {
    initial: 'J',
    name: 'Jonas',
    overall: 58,
    accent: '#4d3da8',
    avatar: 'linear-gradient(135deg, #8d76ec, #5a48bd)',
    days: 14,
    bars: [
      { value: 66, color: '#6450cf' },
      { value: 74, color: '#8a76e8' },
      { value: 52, color: '#3c7a5e' },
      { value: 61, color: '#d98b50' },
    ],
  },
  {
    initial: 'A',
    name: 'Aisha',
    overall: 71,
    accent: '#3c7a5e',
    avatar: 'linear-gradient(135deg, #6fbf8f, #2e5f49)',
    days: 21,
    bars: [
      { value: 58, color: '#cf6450' },
      { value: 64, color: '#d98b50' },
      { value: 82, color: '#3c7a5e' },
      { value: 70, color: '#6450cf' },
    ],
  },
]

function ReportCard({ r, text, active, t }) {
  const [filled, setFilled] = useState(false)
  useEffect(() => {
    if (!active) {
      setFilled(false)
      return
    }
    // wait for the crossfade-in to begin, then animate the ring + bars
    const to = setTimeout(() => setFilled(true), 240)
    return () => clearTimeout(to)
  }, [active])

  return (
    <figure className={`report-card ${active ? 'on' : ''}`} aria-hidden={!active}>
      <div className="rc-head">
        <span className="rc-avatar" style={{ background: r.avatar }} aria-hidden="true">
          {r.initial}
        </span>
        <div>
          <h4>{t('home.report.reportTitle', { name: r.name })}</h4>
          <p>
            {text.topic} · {text.date}
          </p>
        </div>
        <span className="rc-badge">{t('home.report.complete')}</span>
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
            <small>{text.ringLabel}</small>
          </div>
        </div>

        <div className="rc-bars">
          {r.bars.map((b, i) => (
            <div className="rc-bar-row" key={i}>
              <header>
                <span>{text.bars[i]}</span>
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
        &ldquo;{text.quote[0]}
        <strong>{text.quote[1]}</strong>
        {text.quote[2]}&rdquo;
      </blockquote>

      <footer className="rc-foot">
        <span className="lbl">{t('home.report.builds')}</span>
        <span>
          <Headphones size={13} /> {t('home.report.planDays', { days: r.days })}
        </span>
        <span>
          <BookOpen size={13} /> {t('home.report.ebook')}
        </span>
        <span>
          <MessagesSquare size={13} /> {t('home.report.counsellingNotes')}
        </span>
      </footer>
    </figure>
  )
}

export default function Report() {
  const { t } = useTranslation()
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const points = t('home.report.points', { returnObjects: true })
  const samples = t('home.report.samples', { returnObjects: true })

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIdx((i) => (i + 1) % REPORT_META.length), 5000)
    return () => clearInterval(id)
  }, [paused])

  return (
    <section className="section report" id="report">
      <div className="container report-inner">
        <div>
          <Reveal as="span" className="eyebrow">
            {t('home.report.eyebrow')}
          </Reveal>
          <Reveal as="h2" className="h2" delay={0.08}>
            {t('home.report.h2a')} <em>{t('home.report.h2em')}</em>
          </Reveal>
          <Reveal as="p" className="lede" delay={0.16}>
            {t('home.report.lede')}
          </Reveal>

          <div className="report-points">
            {POINT_ICONS.map((Icon, i) => (
              <Reveal key={i} className="rpoint" delay={0.2 + i * 0.1}>
                <span className="rpoint-ico">
                  <Icon size={21} strokeWidth={1.9} />
                </span>
                <div>
                  <h4>{points[i]?.title}</h4>
                  <p>{points[i]?.text}</p>
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
          aria-label={t('home.report.ariaExamples', 'Example personal reports')}
        >
          <div className="report-stack">
            <span className="report-back b2" aria-hidden="true" />
            <span className="report-back b1" aria-hidden="true" />
            <div className="report-cards">
              {REPORT_META.map((rep, i) => (
                <ReportCard key={rep.name} r={rep} text={samples[i]} active={i === idx} t={t} />
              ))}
            </div>
          </div>
          <div className="report-dots" role="tablist" aria-label={t('home.report.ariaTablist', 'Sample report')}>
            {REPORT_META.map((rep, i) => (
              <button
                key={rep.name}
                className={i === idx ? 'on' : ''}
                aria-label={t('home.report.dotAria', { name: rep.name })}
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
