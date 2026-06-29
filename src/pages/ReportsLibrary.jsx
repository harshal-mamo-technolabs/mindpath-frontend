import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  FileHeart,
  Loader2,
  Minus,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { getAssessments, getScores } from '../lib/assessmentsApi.js'
import { groupScores, reportTotals } from '../components/report/reportsData.js'

const fmtDate = (iso, long = false) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: long ? 'long' : 'short', year: 'numeric' })

const estMinutes = (q) => Math.max(2, Math.round(((q || 10) * 30) / 60))

/* ---- trend of the headline score across attempts ---- */
function TrendChart({ attempts, accent }) {
  const scores = attempts.map((a) => a.headline)
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const pad = Math.max(8, (max - min) * 0.6)
  const lo = Math.max(0, min - pad)
  const hi = Math.min(100, max + pad)
  const xOf = (i) => 8 + (i / (attempts.length - 1)) * 84
  const yOf = (s) => 86 - ((s - lo) / (hi - lo || 1)) * 72

  const pts = attempts.map((a, i) => [xOf(i), yOf(a.headline)])
  const line = pts.map((p) => p.join(',')).join(' ')
  const area = `${xOf(0)},100 ${line} ${xOf(attempts.length - 1)},100`

  return (
    <div className="r-trend">
      <div className="r-trend-plot">
        <svg className="r-trend-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
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
        {attempts.map((a, i) => {
          const isLast = i === attempts.length - 1
          return (
            <div
              key={a.id}
              className={`r-node ${isLast ? 'is-last' : ''}`}
              style={{ left: `${xOf(i)}%`, top: `${yOf(a.headline)}%` }}
            >
              <span className="r-node-score">{a.headline}</span>
              <span className="r-node-dot" style={{ borderColor: accent, background: isLast ? accent : '#fff' }} />
            </div>
          )
        })}
      </div>
      <div className="r-axis">
        {attempts.map((a, i) => (
          <span key={a.id} className="r-axis-tick" style={{ left: `${xOf(i)}%` }}>
            {fmtDate(a.createdAt)}
          </span>
        ))}
      </div>
    </div>
  )
}

function ReportGroup({ g, i }) {
  const Icon = g.Icon
  const multi = g.count > 1
  // icon follows the actual direction the score moved; colour tells good/bad
  const DeltaIcon = g.delta === 0 ? Minus : g.delta > 0 ? TrendingUp : TrendingDown
  // is a per-dimension change an improvement? problem ↓ good, strength ↑ good
  const dimImproved = (dim, change) =>
    dim.direction === 'problem' ? change < 0 : dim.direction === 'strength' ? change > 0 : g.higherIsBetter ? change > 0 : change < 0
  const latestDims = new Map(g.latest.dims.map((d) => [d.key, d]))

  return (
    <Reveal as="article" className="r-group" delay={i * 0.06} style={{ '--topic': g.accent }}>
      <header className="r-group-head">
        <span className="topic-ico r-group-ico" style={{ background: `${g.accent}1a`, color: g.accent }}>
          {Icon ? <Icon size={26} strokeWidth={1.8} /> : <FileHeart size={26} strokeWidth={1.8} />}
        </span>
        <div className="r-group-titles">
          <h2>{g.name}</h2>
          <p>
            {g.count} {g.count === 1 ? 'report' : 'reports'} · first taken {fmtDate(g.first.createdAt)}
          </p>
        </div>
        <div className="r-group-latest">
          <span className="r-group-score">{g.latest.headline}</span>
          {g.latest.band && <span className={`band-chip ${g.latest.bandClass}`}>{g.latest.band}</span>}
        </div>
      </header>

      {multi ? (
        <>
          <div className="r-progress-banner">
            <span className={`r-delta ${g.improved ? 'good' : 'rise'}`}>
              <DeltaIcon size={15} />
              {Math.abs(g.delta)} pts {g.delta === 0 ? 'unchanged' : g.improved ? 'better' : g.betterWord}
            </span>
            <p>
              Across {g.count} check-ins, your score has moved from <strong>{g.first.headline}</strong> to{' '}
              <strong>{g.latest.headline}</strong>
              {g.improved ? ' — that change is yours, not the measurement’s.' : '.'}
            </p>
          </div>

          <TrendChart attempts={g.attempts} accent={g.accent} />

          <div className="r-ba">
            <p className="r-sub-label">First check-in → latest, by dimension</p>
            {g.first.dims.map((f) => {
              const l = latestDims.get(f.key)
              if (!l) return null
              const ch = l.pct - f.pct
              const better = dimImproved(f, ch)
              const Arrow = ch === 0 ? Minus : ch < 0 ? ArrowDownRight : ArrowUpRight
              return (
                <div className="r-ba-row" key={f.key}>
                  <header>
                    <span>{f.label}</span>
                    <em className={ch === 0 ? '' : better ? 'good' : 'rise'}>
                      <Arrow size={13} /> {f.pct} → {l.pct}
                    </em>
                  </header>
                  <div className="r-ba-track">
                    <span className="r-ba-first" style={{ width: `${f.pct}%` }} />
                    <span className="r-ba-latest" style={{ width: `${l.pct}%`, background: g.accent }} />
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
            This is your <strong>baseline</strong> for {g.name.toLowerCase()}. Retake in {g.retakeIn} days to see the
            first movement in your numbers.
          </p>
        </div>
      )}

      <div className="r-takes">
        <p className="r-sub-label">All reports</p>
        <ol>
          {g.attempts
            .map((a, idx) => ({ a, idx }))
            .reverse()
            .map(({ a, idx }) => {
              const prev = g.attempts[idx - 1]
              const change = prev ? a.headline - prev.headline : null
              const changeBetter = change != null && (g.higherIsBetter ? change > 0 : change < 0)
              const isLatest = idx === g.count - 1
              return (
                <li key={a.id}>
                  <Link className="r-take-row" to={`/reports/${a.id}`}>
                    <span className="r-take-date">
                      {fmtDate(a.createdAt, true)}
                      {isLatest && <em className="r-latest-tag">Latest</em>}
                    </span>
                    <span className="r-take-score">{a.headline}</span>
                    {a.band && <span className={`band-chip ${a.bandClass}`}>{a.band}</span>}
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
            <Link to={`/assessments/${g.slug}/take`} className="btn btn-primary r-retake-btn">
              Retake now <ArrowRight size={17} />
            </Link>
            <p className="r-retake-note">
              <CalendarClock size={14} /> It’s been {g.lastDays} days — a retake now shows how far you’ve come.
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
              <i style={{ width: `${Math.min(100, (g.lastDays / 60) * 100)}%`, background: g.accent }} />
            </div>
            <small className="r-retake-sub">Retaking every 60–90 days keeps the comparison meaningful.</small>
          </div>
        )}
      </div>
    </Reveal>
  )
}

export default function ReportsLibrary() {
  const [state, setState] = useState({ status: 'loading' })
  const [catalog, setCatalog] = useState([])

  useEffect(() => {
    let alive = true
    getScores()
      .then((scores) => alive && setState({ status: 'ready', groups: groupScores(scores) }))
      .catch((err) => alive && setState({ status: 'error', error: err.message }))
    getAssessments()
      .then((list) => alive && setCatalog(list || []))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  if (state.status === 'loading') {
    return (
      <main className="reports">
        <div className="reports-state">
          <Loader2 size={26} className="ap-spin" />
          <p>Loading your reports…</p>
        </div>
      </main>
    )
  }

  if (state.status === 'error') {
    return (
      <main className="reports">
        <div className="reports-state" role="alert">
          <h1>We couldn’t load your reports</h1>
          <p>{state.error}</p>
          <Link to="/assessments" className="btn btn-primary">
            Browse assessments
          </Link>
        </div>
      </main>
    )
  }

  return <ReportsView groups={state.groups} catalog={catalog} />
}

/* Presentational — given grouped reports + the catalog, renders the page. */
export function ReportsView({ groups, catalog }) {
  const totals = reportTotals(groups)
  const takenSlugs = new Set(groups.map((g) => g.slug))
  const notTaken = catalog.filter((a) => !takenSlugs.has(a.slug))

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
            Every report you’ve unlocked, grouped by topic so each retake stacks into a story of where you started and
            how far you’ve come.
          </Reveal>

          {groups.length > 0 && (
            <Reveal className="reports-ledger" delay={0.2}>
              <div className="reports-ledger-item">
                <strong>{totals.reports}</strong>
                <small>reports archived</small>
              </div>
              <div className="reports-ledger-item">
                <strong>{totals.topics}</strong>
                <small>topics explored</small>
              </div>
              {totals.best && (
                <div className="reports-ledger-item">
                  <strong className="pos">
                    <TrendingUp size={18} strokeWidth={2.4} />
                    {Math.abs(totals.best.delta)}
                  </strong>
                  <small>pts · best shift</small>
                </div>
              )}
            </Reveal>
          )}
        </div>
      </header>

      <section className="reports-body">
        <div className="container">
          {groups.length === 0 ? (
            <Reveal className="reports-empty">
              <FileHeart size={28} />
              <h2>No reports yet</h2>
              <p>Take your first assessment and your report will appear here — then each retake stacks into a trend.</p>
              <Link to="/assessments" className="btn btn-primary">
                Take an assessment <ArrowRight size={17} />
              </Link>
            </Reveal>
          ) : (
            <div className="reports-grid">
              {groups.map((g, i) => (
                <ReportGroup key={g.slug} g={g} i={i} />
              ))}
            </div>
          )}

          {notTaken.length > 0 && (
            <Reveal className="reports-explore">
              <div className="reports-explore-head">
                <FileHeart size={20} />
                <div>
                  <h3>Topics you haven’t explored yet</h3>
                  <p>Each new assessment adds another report and another path to follow.</p>
                </div>
              </div>
              <div className="reports-explore-grid">
                {notTaken.map((a) => (
                  <Link key={a.slug} to={`/assessments/${a.slug}`} className="reports-explore-card">
                    <span className="topic-ico">
                      <FileHeart size={22} strokeWidth={1.8} />
                    </span>
                    <div>
                      <strong>{a.name}</strong>
                      <small>
                        {(a.subCategories?.length || 5)} dimensions · {estMinutes(a.questionsCount)} min
                      </small>
                    </div>
                    <span className="reports-explore-add">
                      <Plus size={16} />
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>
    </main>
  )
}
