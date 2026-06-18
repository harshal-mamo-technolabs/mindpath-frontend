import { useState } from 'react'
import { Annoyed, Bell, Frown, Laugh, Meh, Mic, Pause, Play, Smile, Sparkles } from 'lucide-react'
import Reveal from './Reveal.jsx'

const MOODS = [
  ['Heavy', Frown],
  ['Low', Annoyed],
  ['Okay', Meh],
  ['Good', Smile],
  ['Light', Laugh],
]

const EQ_BARS = [38, 62, 84, 51, 95, 70, 44, 88, 60, 76, 35, 92, 55, 80, 47, 68, 90, 58, 73, 42]

/* ── the 14-day plan as a winding trail of stepping-stones ───────────── */
const TOTAL = 14
const TODAY_IDX = 3 // day 4 is today
const VB_W = 720
const VB_H = 232

const NODES = Array.from({ length: TOTAL }, (_, i) => {
  const t = i / (TOTAL - 1)
  const x = 44 + t * (VB_W - 88)
  const y = VB_H / 2 - Math.sin(t * Math.PI * 2.15 + 0.5) * 62
  const state = i < TODAY_IDX ? 'done' : i === TODAY_IDX ? 'today' : 'locked'
  return { n: i + 1, x, y, state }
})

// smooth Catmull-Rom curve through the stepping-stones
function trailPath(pts) {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : ''
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

const FULL_TRAIL = trailPath(NODES)
const WALKED_TRAIL = trailPath(NODES.slice(0, TODAY_IDX + 1))

function DayTrail() {
  return (
    <div className="day-trail">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        role="img"
        aria-label="Your 14-day plan — 3 days walked, day 4 is today, the rest unlock one per morning"
      >
        <defs>
          <linearGradient id="trailGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8fd4ae" />
            <stop offset="0.62" stopColor="#c4b2ef" />
            <stop offset="1" stopColor="#eeb381" />
          </linearGradient>
        </defs>

        <path className="dt-track" d={FULL_TRAIL} fill="none" />
        <path
          className="dt-walked"
          d={WALKED_TRAIL}
          fill="none"
          pathLength="1"
          stroke="url(#trailGrad)"
        />

        {NODES.map((nd, i) => (
          <g key={nd.n} className={`dt-node ${nd.state}`} style={{ '--d': `${300 + i * 55}ms` }}>
            {nd.state === 'today' && (
              <>
                <circle className="dt-ping" cx={nd.x} cy={nd.y} r="17" />
                <circle className="dt-ping d2" cx={nd.x} cy={nd.y} r="17" />
              </>
            )}
            <circle
              className="dt-dot"
              cx={nd.x}
              cy={nd.y}
              r={nd.state === 'today' ? 17 : nd.state === 'done' ? 13 : 9}
            />
            <text
              className="dt-num"
              x={nd.x}
              y={nd.y}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {nd.n}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function MoodSpark() {
  return (
    <svg
      className="mood-spark"
      width="100%"
      height="56"
      viewBox="0 0 320 56"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M6 44 C 40 50, 60 36, 90 40 C 124 44, 140 26, 175 30 C 210 34, 235 18, 268 16 C 288 15, 300 10, 314 8"
        fill="none"
        stroke="#8fd4ae"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {[
        [6, 44],
        [90, 40],
        [175, 30],
        [268, 16],
        [314, 8],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="4.5" fill="#8fd4ae" />
      ))}
    </svg>
  )
}

export default function AudioPlan() {
  const [playing, setPlaying] = useState(false)
  const [mood, setMood] = useState(3)

  return (
    <section className="section audio" id="audio">
      <div className="container">
        <div style={{ maxWidth: 680 }}>
          <Reveal as="span" className="eyebrow on-dark">
            Your daily audio path
          </Reveal>
          <Reveal as="h2" className="h2" delay={0.08}>
            Then, every day, <em>a small ritual.</em>
          </Reveal>
          <Reveal as="p" className="lede" delay={0.16}>
            Your report sequences a day-by-day plan of calming sessions chosen and ordered for your
            scores. One unlocks each morning, so the path becomes a habit, not a binge.
          </Reveal>
        </div>

        <div className="audio-inner">
          <div>
            <Reveal className="panel-dark" delay={0.1}>
              <p className="panel-title">
                Your 14-day plan <em>3 of 14 walked</em>
              </p>
              <DayTrail />
            </Reveal>

            <Reveal className="panel-dark" delay={0.2}>
              <p className="panel-title">
                Before today&rsquo;s session <em>one tap, that&rsquo;s all</em>
              </p>
              <div className="mood-row" role="radiogroup" aria-label="How are you arriving today?">
                {MOODS.map(([label, Icon], i) => (
                  <button
                    key={label}
                    role="radio"
                    aria-checked={mood === i}
                    aria-label={label}
                    className={`mood-btn ${mood === i ? 'active' : ''}`}
                    onClick={() => setMood(i)}
                  >
                    <Icon size={24} strokeWidth={1.8} />
                  </button>
                ))}
              </div>
              <MoodSpark />
              <p className="mood-spark-note">
                <Sparkles size={14} />
                Your mood trend, mapped over the plan <strong>up 32% since day 1.</strong>
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className={`player ${playing ? 'playing' : ''}`}>
              <p className="player-welcome">
                <Mic size={17} />
                &ldquo;Hi Maya this plan begins with your evenings, because that&rsquo;s where your
                report says rest slips away…&rdquo;
              </p>

              <div className="player-cover" aria-hidden="true">
                <span className="moon" />
                <span className="hill h1c" />
                <span className="hill h2c" />
              </div>

              <div className="player-meta">
                <div>
                  <h3>Day 4 · Loosening the grip</h3>
                  <p>Stress &amp; Burnout path · 7 min · evening session</p>
                </div>
                <button
                  className="play-btn"
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? 'Pause session preview' : 'Play session preview'}
                >
                  {playing ? (
                    <Pause size={24} fill="currentColor" strokeWidth={0} />
                  ) : (
                    <Play size={24} fill="currentColor" strokeWidth={0} style={{ marginLeft: 3 }} />
                  )}
                </button>
              </div>

              <div className="eq" aria-hidden="true">
                {EQ_BARS.map((h, i) => (
                  <i key={i} style={{ '--h': h, '--i': i }} />
                ))}
              </div>

              <div className="player-progress">
                <span>2:41</span>
                <span className="track">
                  <i />
                </span>
                <span>7:00</span>
              </div>

              <p className="player-foot">
                <Bell size={15} />
                <span>
                  <strong>Day 5 is ready tomorrow at 7:00.</strong> We&rsquo;ll nudge you, gently.
                </span>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
