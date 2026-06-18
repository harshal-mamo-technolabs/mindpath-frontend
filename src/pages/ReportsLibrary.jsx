import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  FileHeart,
  Minus,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { ASSESSMENTS, bandOf } from '../data/assessments.js'
import { BEST_IMPROVEMENT, fmtDate, REPORT_GROUPS, TOTAL_REPORTS } from '../data/reportHistory.js'

const BAND_META = {
  load: {
    low: { chip: 'Low load', cls: 'band-good' },
    mid: { chip: 'Moderate', cls: 'band-mid' },
    high: { chip: 'High load', cls: 'band-hot' },
  },
  strength: {
    low: { chip: 'Developing', cls: 'band-hot' },
    mid: { chip: 'Growing', cls: 'band-mid' },
    high: { chip: 'Strong', cls: 'band-good' },
  },
}

const bandFor = (score, direction) => BAND_META[direction][bandOf(score)]

function TrendChart({ takes, accent }) {
  const scores = takes.map((t) => t.overall)
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const pad = Math.max(8, (max - min) * 0.6)
  const lo = Math.max(0, min - pad)
  const hi = Math.min(100, max + pad)
  const xOf = (i) => 8 + (i / (takes.length - 1)) * 84
  const yOf = (s) => 86 - ((s - lo) / (hi - lo || 1)) * 72

  const pts = takes.map((t, i) => [xOf(i), yOf(t.overall)])
  const line = pts.map((p) => p.join(',')).join(' ')
  const area = `${xOf(0)},100 ${line} ${xOf(takes.length - 1)},100`

  return (
    <div className="r-trend">
      <div className="r-trend-plot">
        <svg
          className="r-trend-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`tg-${accent.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.26" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill={`url(#tg-${accent.slice(1)})`} />
          <polyline
            points={line}
            fill="none"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {takes.map((t, i) => {
          const isLast = i === takes.length - 1
          return (
            <div
              key={t.date}
              className={`r-node ${isLast ? 'is-last' : ''}`}
              style={{ left: `${xOf(i)}%`, top: `${yOf(t.overall)}%` }}
            >
              <span className="r-node-score">{t.overall}</span>
              <span
                className="r-node-dot"
                style={{ borderColor: accent, background: isLast ? accent : '#fff' }}
              />
            </div>
          )
        })}
      </div>
      <div className="r-axis">
        {takes.map((t, i) => (
          <span key={t.date} className="r-axis-tick" style={{ left: `${xOf(i)}%` }}>
            {fmtDate(t.date)}
          </span>
        ))}
      </div>
    </div>
  )
}

function ReportGroup({ g, i }) {
  const a = g.assessment
  const Icon = a.icon
  const latestBand = bandFor(g.latest.overall, a.direction)
  const multi = g.takes.length > 1
  const DeltaIcon = g.delta === 0 ? Minus : g.improved ? TrendingDown : TrendingUp

  return (
    <Reveal as="article" className="r-group" delay={i * 0.06} style={{ '--topic': a.accent }}>
      <header className="r-group-head">
        <span className="topic-ico r-group-ico" style={{ background: a.bg, color: a.fg }}>
          <Icon size={26} strokeWidth={1.8} />
        </span>
        <div className="r-group-titles">
          <h2>{a.title}</h2>
          <p>
            {g.takes.length} {g.takes.length === 1 ? 'report' : 'reports'} · first taken{' '}
            {fmtDate(g.first.date)}
          </p>
        </div>
        <div className="r-group-latest">
          <span className="r-group-score">{g.latest.overall}</span>
          <span className={`band-chip ${latestBand.cls}`}>{latestBand.chip}</span>
        </div>
      </header>

      {multi ? (
        <>
          <div className="r-progress-banner">
            <span className={`r-delta ${g.improved ? 'good' : 'rise'}`}>
              <DeltaIcon size={15} />
              {Math.abs(g.delta)} pts {g.improved ? g.betterWord : 'higher'}
            </span>
            <p>
              Across {g.takes.length} check-ins, your {a.ringLabel.toLowerCase()} has moved from{' '}
              <strong>{g.first.overall}</strong> to <strong>{g.latest.overall}</strong>
              {g.improved ? '  that change is yours, not the measurement’s.' : '.'}
            </p>
          </div>

          <TrendChart takes={g.takes} accent={a.accent} />

          <div className="r-ba">
            <p className="r-sub-label">First check-in → latest, by dimension</p>
            {a.dims.map((d) => {
              const f = g.first.dims[d.key]
              const l = g.latest.dims[d.key]
              const ch = l - f
              const better = a.direction === 'load' ? ch < 0 : ch > 0
              const Arrow = ch === 0 ? Minus : better ? ArrowDownRight : ArrowUpRight
              return (
                <div className="r-ba-row" key={d.key}>
                  <header>
                    <span>{d.label}</span>
                    <em className={ch === 0 ? '' : better ? 'good' : 'rise'}>
                      <Arrow size={13} /> {f} → {l}
                    </em>
                  </header>
                  <div className="r-ba-track">
                    <span className="r-ba-first" style={{ width: `${f}%` }} />
                    <span
                      className="r-ba-latest"
                      style={{ width: `${l}%`, background: a.accent }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="r-baseline">
          <Sparkles size={17} />
          <p>
            This is your <strong>baseline</strong> for {a.title.toLowerCase()}. Retake in{' '}
            {g.retakeIn} days to see the first movement in your numbers.
          </p>
        </div>
      )}

      <div className="r-takes">
        <p className="r-sub-label">All reports</p>
        <ol>
          {g.takes
            .map((t, idx) => ({ t, idx }))
            .reverse()
            .map(({ t, idx }) => {
              const prev = g.takes[idx - 1]
              const change = prev ? t.overall - prev.overall : null
              const changeBetter =
                change != null && (a.direction === 'load' ? change < 0 : change > 0)
              const band = bandFor(t.overall, a.direction)
              const isLatest = idx === g.takes.length - 1
              return (
                <li key={t.date}>
                  <Link
                    className="r-take-row"
                    to={`/assessments/${g.id}/report`}
                    state={{
                      view: true,
                      scores: { dims: t.dims, overall: t.overall },
                      name: 'Maya',
                      dateLabel: fmtDate(t.date, true),
                    }}
                  >
                    <span className="r-take-date">
                      {fmtDate(t.date, true)}
                      {isLatest && <em className="r-latest-tag">Latest</em>}
                    </span>
                    <span className="r-take-score">{t.overall}</span>
                    <span className={`band-chip ${band.cls}`}>{band.chip}</span>
                    {change != null ? (
                      <span className={`r-take-change ${changeBetter ? 'good' : 'rise'}`}>
                        {change < 0 ? (
                          <ArrowDownRight size={13} />
                        ) : change > 0 ? (
                          <ArrowUpRight size={13} />
                        ) : (
                          <Minus size={13} />
                        )}
                        {Math.abs(change)}
                      </span>
                    ) : (
                      <span className="r-take-change muted">baseline</span>
                    )}
                    <ChevronRight size={17} className="r-take-chev" />
                  </Link>
                </li>
              )
            })}
        </ol>
      </div>

      <div className="r-retake">
        {g.eligible ? (
          <>
            <Link to={`/assessments/${g.id}/take`} className="btn btn-primary r-retake-btn">
              Retake now <ArrowRight size={17} />
            </Link>
            <p className="r-retake-note">
              <CalendarClock size={14} /> It&rsquo;s been {g.lastDays} days a retake now shows how
              far you&rsquo;ve come.
            </p>
          </>
        ) : (
          <div className="r-retake-wait">
            <div className="r-retake-wait-head">
              <span>
                <CalendarClock size={14} /> Retake unlocks in {g.retakeIn} days
              </span>
              <small>{g.lastDays} / 60 days</small>
            </div>
            <div className="r-retake-bar">
              <i
                style={{
                  width: `${Math.min(100, (g.lastDays / 60) * 100)}%`,
                  background: a.accent,
                }}
              />
            </div>
            <small className="r-retake-sub">
              Retaking every 60–90 days keeps the comparison meaningful.
            </small>
          </div>
        )}
      </div>
    </Reveal>
  )
}

export default function ReportsLibrary() {
  const takenIds = new Set(REPORT_GROUPS.map((g) => g.id))
  const notTaken = ASSESSMENTS.filter((a) => !takenIds.has(a.id))

  return (
    <main className="reports">
      <header className="reports-hero">
        <div className="aurora" aria-hidden="true">
          <i />
          <i />
        </div>
        <div className="container">
          <Reveal as="span" className="eyebrow">
            Your reports
          </Reveal>
          <Reveal as="h1" className="h1 reports-title" delay={0.07}>
            Proof you can <em>watch move.</em>
          </Reveal>
          <Reveal as="p" className="lede" delay={0.14}>
            Every report you&rsquo;ve unlocked, grouped by topic so each retake stacks into a story
            of where you started and how far you&rsquo;ve come.
          </Reveal>

          <Reveal className="reports-ledger" delay={0.2}>
            <div className="reports-ledger-item">
              <strong>{TOTAL_REPORTS}</strong>
              <small>reports archived</small>
            </div>
            <div className="reports-ledger-item">
              <strong>{REPORT_GROUPS.length}</strong>
              <small>topics explored</small>
            </div>
            {BEST_IMPROVEMENT && (
              <div className="reports-ledger-item">
                <strong className="pos">
                  <TrendingDown size={18} strokeWidth={2.4} />
                  {Math.abs(BEST_IMPROVEMENT.delta)}
                </strong>
                <small>pts · best shift</small>
              </div>
            )}
          </Reveal>
        </div>
      </header>

      <section className="reports-body">
        <div className="container">
          <div className="reports-grid">
            {REPORT_GROUPS.map((g, i) => (
              <ReportGroup key={g.id} g={g} i={i} />
            ))}
          </div>

          {notTaken.length > 0 && (
            <Reveal className="reports-explore">
              <div className="reports-explore-head">
                <FileHeart size={20} />
                <div>
                  <h3>Topics you haven&rsquo;t explored yet</h3>
                  <p>Each new assessment adds another report and another path to follow.</p>
                </div>
              </div>
              <div className="reports-explore-grid">
                {notTaken.map((a) => {
                  const Icon = a.icon
                  return (
                    <Link key={a.id} to={`/assessments/${a.id}`} className="reports-explore-card">
                      <span className="topic-ico" style={{ background: a.bg, color: a.fg }}>
                        <Icon size={22} strokeWidth={1.8} />
                      </span>
                      <div>
                        <strong>{a.title}</strong>
                        <small>
                          {a.dims.length} dimensions · {a.mins} min
                        </small>
                      </div>
                      <span className="reports-explore-add">
                        <Plus size={16} />
                      </span>
                    </Link>
                  )
                })}
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </main>
  )
}
