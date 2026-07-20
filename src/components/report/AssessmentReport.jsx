import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Compass,
  Download,
  Gauge,
  Headphones,
  Lightbulb,
  Loader2,
  Quote,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getAudioPlanForAssessment } from '../../lib/audioApi.js'

/* gauge / pill colour keyed by health (good = green, whatever the direction).
   'growth' (blue) is the all-strength case — a low score is upside, not alarm. */
const HEALTH_COLOR = { good: 'var(--sage)', ok: '#e0a23c', poor: '#d2654a', growth: '#5a78c9' }
const healthPill = (k) =>
  k === 'good' ? 'band-good' : k === 'ok' ? 'band-mid' : k === 'growth' ? 'band-blue' : 'band-hot'

/* insight-card accent from the category's tag */
const insightVariant = (d) =>
  d.tag === 'strength' || d.tag === 'good'
    ? 'is-strength'
    : d.tag === 'growth'
      ? 'is-growth'
      : d.tag === 'building'
        ? 'is-building'
        : 'is-focus'

/* ---- semicircle gauge ---- */
function GaugeArc({ value, healthKey, label }) {
  const d = 'M 14 80 A 66 66 0 0 1 146 80' // pathLength 100 → offset == 100-value
  return (
    <div className="srep-gauge">
      <svg viewBox="0 0 160 96" width="220" aria-hidden="true">
        <path
          className="srep-gauge-track"
          d={d}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          className="srep-gauge-val"
          d={d}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          pathLength="100"
          style={{
            stroke: HEALTH_COLOR[healthKey],
            strokeDasharray: 100,
            strokeDashoffset: 100 - value,
          }}
        />
      </svg>
      <div className="srep-gauge-num">
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </div>
  )
}

/* ---- radar / pentagon over each category's radarValue ---- */
function Radar({ dims }) {
  const size = 260
  const c = size / 2
  const R = 96
  const n = dims.length
  const pt = (frac, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return [c + Math.cos(ang) * R * frac, c + Math.sin(ang) * R * frac]
  }
  const ring = (frac) => dims.map((_, i) => pt(frac, i).join(',')).join(' ')
  const shape = dims.map((d, i) => pt(d.radarValue / 100, i).join(',')).join(' ')

  return (
    <svg
      className="srep-radar"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Profile across the five categories"
    >
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} className="srep-radar-grid" points={ring(f)} />
      ))}
      {dims.map((d, i) => {
        const [x, y] = pt(1, i)
        return <line key={d.key} className="srep-radar-spoke" x1={c} y1={c} x2={x} y2={y} />
      })}
      <polygon className="srep-radar-shape" points={shape} />
      {dims.map((d, i) => {
        const [x, y] = pt(d.radarValue / 100, i)
        return <circle key={d.key} className="srep-radar-dot" cx={x} cy={y} r="3.5" />
      })}
      {dims.map((d, i) => {
        const [x, y] = pt(1.16, i)
        return (
          <text
            key={d.key}
            className="srep-radar-label"
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {d.label.split(' ')[0]}
          </text>
        )
      })}
    </svg>
  )
}

function BandPill({ cls, children }) {
  return <span className={`band-chip ${cls}`}>{children}</span>
}

/* ---- difficulty × resource quadrant map (visualises the archetype) ---- */
const QUAD_POS = [
  { pos: 'TL', col: 0, row: 0 },
  { pos: 'TR', col: 1, row: 0 },
  { pos: 'BL', col: 0, row: 1 },
  { pos: 'BR', col: 1, row: 1 },
]

function Quadrant({ difficulty, resource, active, quads, xLabel, yLabel }) {
  const S = 240
  const pad = 34
  const inner = S - pad * 2
  const half = inner / 2
  const x = pad + (difficulty / 100) * inner
  const y = pad + (1 - resource / 100) * inner // invert: more resource = higher

  return (
    <svg
      className="srep-quad"
      viewBox={`0 0 ${S} ${S}`}
      role="img"
      aria-label="Your pattern across the two axes"
    >
      {QUAD_POS.map((q) => (
        <rect
          key={q.pos}
          className={`srep-quad-cell q-${q.pos} ${active === q.pos ? 'active' : ''}`}
          x={pad + q.col * half}
          y={pad + q.row * half}
          width={half}
          height={half}
        />
      ))}
      {QUAD_POS.map((q) => {
        const cx = pad + q.col * half + half / 2
        const cy = pad + q.row * half + half / 2
        const words = (quads[q.pos] || '').split(' ')
        const lines =
          words.length > 2
            ? [words.slice(0, 2).join(' '), words.slice(2).join(' ')]
            : [words.join(' ')]
        return (
          <text
            key={q.pos}
            className={`srep-quad-label ${active === q.pos ? 'active' : ''}`}
            x={cx}
            y={cy}
            textAnchor="middle"
          >
            {lines.map((ln, i) => (
              <tspan
                key={ln}
                x={cx}
                dy={i === 0 ? (lines.length > 1 ? '-0.3em' : '0.3em') : '1.1em'}
              >
                {ln}
              </tspan>
            ))}
          </text>
        )
      })}
      <line className="srep-quad-div" x1={pad + half} y1={pad} x2={pad + half} y2={pad + inner} />
      <line className="srep-quad-div" x1={pad} y1={pad + half} x2={pad + inner} y2={pad + half} />
      <text className="srep-quad-axis" x={pad + inner} y={pad + inner + 20} textAnchor="end">
        {xLabel}
      </text>
      <text
        className="srep-quad-axis"
        x={14}
        y={S / 2}
        textAnchor="middle"
        transform={`rotate(-90 14 ${S / 2})`}
      >
        {yLabel}
      </text>
      <circle className="srep-quad-halo" cx={x} cy={y} r="9" />
      <circle className="srep-quad-dot" cx={x} cy={y} r="5" />
    </svg>
  )
}

/* ---- two opposing bars: difficulty against recovery ---- */
function BalanceBars({ topLabel, topValue, bottomLabel, bottomValue }) {
  return (
    <div className="srep-balance">
      <div className="srep-balance-row">
        <span className="srep-balance-label">{topLabel}</span>
        <span className="srep-balance-track">
          <i className="warm" style={{ width: `${topValue}%` }} />
        </span>
        <span className="srep-balance-val">{topValue}</span>
      </div>
      <div className="srep-balance-row">
        <span className="srep-balance-label">{bottomLabel}</span>
        <span className="srep-balance-track">
          <i className="green" style={{ width: `${bottomValue}%` }} />
        </span>
        <span className="srep-balance-val">{bottomValue}</span>
      </div>
    </div>
  )
}

/* ---- 0–100 spectrum with the user's marker ---- */
function Spectrum({ value, segments, scale }) {
  return (
    <div className="srep-spectrum">
      <div className="srep-spectrum-track">
        {segments.map((seg) => (
          <span key={seg} className={`srep-spectrum-seg ${seg}`} />
        ))}
        <span className="srep-spectrum-mark" style={{ left: `${value}%` }} aria-hidden="true" />
      </div>
      <div className="srep-spectrum-scale">
        {scale.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
    </div>
  )
}

/* tag → spread-bar colour (all-strength profiles) */
const spreadTone = (tag) => (tag === 'growth' ? 'blue' : tag === 'building' ? 'amber' : 'green')

/* ---- ranked dimension bars (the all-strength "profile spread") ---- */
function ProfileSpread({ dims }) {
  const ranked = [...dims].sort((a, b) => b.pct - a.pct)
  return (
    <div className="srep-spread">
      {ranked.map((d) => (
        <div className="srep-spread-row" key={d.key}>
          <span className="srep-spread-label">{d.label}</span>
          <span className="srep-spread-track">
            <i className={spreadTone(d.tag)} style={{ width: `${d.pct}%` }} />
          </span>
          <span className="srep-spread-val">{d.pct}</span>
        </div>
      ))}
    </div>
  )
}

/* ===================================================================== */
export default function AssessmentReport({
  report,
  ui,
  name = 'You',
  attempt,
  onRetake,
  assessmentId,
}) {
  const r = report
  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  // third snapshot stat: the strongest dimension (EI) or the heaviest driver (load profiles)
  const spotlight = ui.miniThirdKey === 'dominant' ? r.dominant : r.topDriver
  const planFocus = r.priorities.length ? r.priorities : r.topByLoad.slice(0, 2)
  const leanOn = r.strengths[0] || r.brightSpot
  const navigate = useNavigate()

  // The "Audio" button hands off to the audio library, which plays this
  // assessment's welcome clip.
  const openWelcomeAudio = () => navigate('/audio', { state: { welcomeFor: assessmentId } })

  // Audio-plan availability for the toolbar button:
  //  - 'ready'       → a plan exists → the button links to /audio.
  //  - 'preparing'   → attempt 1, plan still generating server-side → poll for it.
  //  - 'unavailable' → no plan and none coming (a retake never generates one, or
  //                    this assessment produces no audio) → hide the button.
  // The plan is created atomically once generation finishes (welcome included),
  // so "a plan exists" is the single, reliable readiness signal.
  const [audioState, setAudioState] = useState(assessmentId ? 'preparing' : 'unavailable')
  const pollRef = useRef(null)

  useEffect(() => {
    if (!assessmentId) return // initial state is already 'unavailable' in this case
    let alive = true
    let tries = 0
    const MAX_TRIES = 12 // ~48s of polling while a first attempt generates

    const check = async () => {
      let plans = []
      try {
        plans = await getAudioPlanForAssessment(assessmentId)
      } catch {
        // treat a failed lookup like "not ready yet" and retry within budget
      }
      if (!alive) return
      if (Array.isArray(plans) && plans.length > 0) {
        setAudioState('ready')
        return
      }
      // No plan. A retake (attempt > 1) never triggers generation, so it's final.
      if (attempt && attempt > 1) {
        setAudioState('unavailable')
        return
      }
      tries += 1
      if (tries >= MAX_TRIES) {
        setAudioState('unavailable') // first attempt but nothing generated (e.g. no audio for this assessment)
        return
      }
      setAudioState('preparing')
      pollRef.current = setTimeout(check, 4000)
    }

    check()
    return () => {
      alive = false
      clearTimeout(pollRef.current)
    }
  }, [assessmentId, attempt])

  // Always print in light mode, even if the app is in dark mode — guarantees a
  // clean PDF. Catches the button and the browser's own Print (Ctrl/Cmd-P).
  useEffect(() => {
    const html = document.documentElement
    let restore = null
    const before = () => {
      if (html.getAttribute('data-theme') === 'dark') {
        restore = 'dark'
        html.removeAttribute('data-theme')
      }
    }
    const after = () => {
      if (restore) {
        html.setAttribute('data-theme', restore)
        restore = null
      }
    }
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
    }
  }, [])

  return (
    <div className="srep">
      {/* toolbar (hidden in print) */}
      <div className="srep-toolbar">
        {audioState === 'ready' && (
          <button className="btn btn-ghost srep-tool-btn" onClick={openWelcomeAudio}>
            <Headphones size={16} /> Audio
          </button>
        )}
        {audioState === 'preparing' && (
          <button
            className="btn btn-ghost srep-tool-btn"
            disabled
            aria-disabled="true"
            title="Your audio plan is still being prepared"
          >
            <Loader2 size={15} className="ap-spin" /> Preparing audio…
          </button>
        )}
        <button className="btn btn-ghost srep-tool-btn" onClick={() => window.print()}>
          <Download size={16} /> Download PDF
        </button>
        <button className="btn btn-ghost srep-tool-btn" onClick={onRetake}>
          <RefreshCcw size={16} /> Retake
        </button>
      </div>

      {/* 1 — header */}
      <header className="srep-head">
        <span className="srep-avatar">{name[0].toUpperCase()}</span>
        <div className="srep-head-text">
          <p className="srep-kicker">
            {ui.kicker} · attempt {attempt || r.attempt}
          </p>
          <h1>{ui.headTitle(name)}</h1>
          <p className="srep-head-meta">
            Completed {today} · {ui.assessmentName}
          </p>
          <p className="srep-head-note">
            <ShieldCheck size={13} /> A self-awareness tool generated from your answers — not a
            clinical or diagnostic assessment.
          </p>
        </div>
      </header>

      {/* 2 — snapshot */}
      <section className="srep-card srep-snapshot">
        <div className="srep-snapshot-gauge">
          <GaugeArc
            value={r.headline.value}
            healthKey={r.headline.healthKey}
            label={ui.gaugeLabel}
          />
          <BandPill cls={healthPill(r.headline.healthKey)}>
            {r.headline.bandText}
            {ui.headlinePillSuffix}
          </BandPill>
        </div>
        <div className="srep-snapshot-body">
          <h2 className="srep-archetype">
            <Sparkles size={18} /> {r.archetype.name}
          </h2>
          <p className="srep-snapshot-text">
            {r.archetype.summary} {ui.scoreSentence(r.headline.value)}
          </p>
          <Spectrum
            value={r.headline.value}
            segments={ui.spectrum.segments}
            scale={ui.spectrum.scale}
          />
          <div className="srep-mini">
            <div className="srep-mini-stat">
              <Gauge size={16} />
              <strong>{r.headline.value}/100</strong>
              <small>
                {ui.miniHeadlineLabel} · {r.headline.bandText}
              </small>
            </div>
            <div className="srep-mini-stat">
              <Target size={16} />
              <strong>
                {r.priorities.length} / {r.dims.length}
              </strong>
              <small>{ui.miniPriorityLabel}</small>
            </div>
            <div className="srep-mini-stat">
              <Activity size={16} />
              <strong>{spotlight?.label}</strong>
              <small>
                {ui.miniThirdLabel} · {spotlight?.pct}%
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — pattern: quadrant (mixed profiles) or profile spread (all-strength) */}
      <section className="srep-card srep-pattern">
        <h2 className="srep-h2">
          <Compass size={18} /> {ui.patternTitle}
        </h2>
        {r.pattern.mode === 'profile' ? (
          <div className="srep-pattern-wrap">
            <div className="srep-spread-box">
              <ProfileSpread dims={r.dims} />
            </div>
            <div className="srep-pattern-text">
              <span className="srep-pattern-name">{r.archetype.name}</span>
              <p>{r.patternDetail}</p>
              <p className="srep-pattern-foot">{ui.patternFoot}</p>
            </div>
          </div>
        ) : (
          <div className="srep-pattern-wrap">
            <div className="srep-quad-box">
              <Quadrant
                difficulty={r.difficulty}
                resource={r.resource}
                active={r.quadActive}
                quads={ui.quads}
                xLabel={ui.quadXLabel}
                yLabel={ui.quadYLabel}
              />
            </div>
            <div className="srep-pattern-text">
              <span className="srep-pattern-name">{r.archetype.name}</span>
              <p>{r.patternDetail}</p>
              <BalanceBars
                topLabel={ui.balanceTop}
                topValue={r.difficulty}
                bottomLabel={ui.balanceBottom}
                bottomValue={r.resource}
              />
              <p className="srep-pattern-foot">{ui.patternFoot}</p>
            </div>
          </div>
        )}
      </section>

      {/* 4 — radar + ranked drivers */}
      <section className="srep-card srep-radar-section">
        <h2 className="srep-h2">
          <Activity size={18} /> {ui.radarTitle}
        </h2>
        <div className="srep-radar-wrap">
          <div className="srep-radar-box">
            <Radar dims={r.dims} />
            <p className="srep-radar-cap">{ui.radarCaption}</p>
          </div>
          <div className="srep-drivers">
            <h3>{ui.driversTitle}</h3>
            {r.topByLoad.slice(0, 3).map((d, i) => (
              <div className="srep-driver" key={d.key}>
                <span className="srep-driver-num">{i + 1}</span>
                <div className="srep-driver-text">
                  <div className="srep-driver-top">
                    <strong>{d.label}</strong>
                    <BandPill cls={d.tagClass}>{d.bandText}</BandPill>
                  </div>
                  <p>{d.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — category detail */}
      <section className="srep-card srep-flow">
        <h2 className="srep-h2">
          <Gauge size={18} /> Category by category
        </h2>
        <p className="srep-legend">
          {ui.legendWarm && (
            <span>
              <i className="srep-key srep-key-warm" /> {ui.legendWarm}
            </span>
          )}
          <span>
            <i className="srep-key srep-key-green" /> {ui.legendGreen}
          </span>
        </p>
        <div className="srep-cats">
          {r.dims.map((d) => {
            const Icon = ui.catIcons[d.key] || Activity
            return (
              <article className="srep-cat" key={d.key}>
                <div className="srep-cat-head">
                  <span className="srep-cat-ico">
                    <Icon size={17} />
                  </span>
                  <div className="srep-cat-title">
                    <h3>{d.label}</h3>
                    <p>{d.blurb}</p>
                  </div>
                  <div className="srep-cat-score">
                    <strong>{d.pct}%</strong>
                    <small>
                      {d.raw}/{d.max}
                    </small>
                  </div>
                </div>
                <div className="srep-bar">
                  <i
                    className={d.direction === 'problem' ? 'warm' : 'green'}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <div className="srep-cat-foot">
                  <BandPill cls={d.tagClass}>{d.tagText}</BandPill>
                  <p>{d.note}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* 6 — a closer read (always populated) */}
      <section className="srep-card">
        <h2 className="srep-h2">
          <Lightbulb size={18} /> A closer read
        </h2>
        <div className="srep-insights">
          {r.insights.map((d) => (
            <article className={`srep-insight ${insightVariant(d)}`} key={d.key}>
              <div className="srep-insight-head">
                <h3>{d.label}</h3>
                <BandPill cls={d.tagClass}>{d.tagText}</BandPill>
              </div>
              <ul className="srep-insight-bullets">
                {d.bullets.map((b) => (
                  <li key={b}>
                    <CheckCircle2 size={14} /> {b}
                  </li>
                ))}
              </ul>
              {d.tryThis && (
                <p className="srep-try">
                  <Lightbulb size={14} />
                  <span>
                    <strong>Try this:</strong> {d.tryThis}
                  </span>
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* 7 — action plan */}
      <section className="srep-card srep-plan">
        <h2 className="srep-h2">
          <Target size={18} /> Your action plan
        </h2>
        <div className="srep-actions-grid">
          {planFocus.map((d) => (
            <article className="srep-action" key={d.key}>
              <span className="srep-action-tag">Focus</span>
              <h3>{d.label}</h3>
              <p>{d.tryThis}</p>
            </article>
          ))}
          {leanOn && (
            <article className="srep-action use-strength">
              <span className="srep-action-tag strength">Lean on this</span>
              <h3>Lean on your {leanOn.strengthLabel}</h3>
              <p>
                This is what’s working for you right now. Spend it deliberately on the focus areas
                above — it’s what makes the rest of the plan stick.
              </p>
            </article>
          )}
        </div>
      </section>

      {/* 8 — habits */}
      <section className="srep-card">
        <h2 className="srep-h2">
          <CalendarCheck size={18} /> {ui.habitsTitle}
        </h2>
        <ol className="srep-habits">
          {ui.habits.map((h, i) => (
            <li key={h}>
              <span className="srep-habit-num">{i + 1}</span>
              {h}
            </li>
          ))}
        </ol>
      </section>

      {/* 9 — closing */}
      <section className="srep-card srep-closing">
        <Quote size={22} className="srep-quote-ico" />
        <p className="srep-closing-text">{r.attempt > 1 ? ui.closingReturn : ui.closingBaseline}</p>
        <div className="srep-doors">
          {ui.doors.map(({ to, Icon, label }) => (
            <Link to={to} className="srep-door" key={label}>
              <Icon size={18} />
              <span>{label}</span>
              <ArrowRight size={15} />
            </Link>
          ))}
        </div>
        <p className="srep-disclaimer">
          <ShieldCheck size={14} /> Daybreak is a self-reflection tool, not a clinical assessment,
          diagnosis, or treatment. If you’re struggling, reaching out to a licensed professional is
          a brave and worthwhile next step.
        </p>
        <div className="srep-closing-actions">
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Download size={16} /> Download this report
          </button>
          <Link to="/reports" className="btn btn-ghost">
            All my reports
          </Link>
        </div>
      </section>
    </div>
  )
}
