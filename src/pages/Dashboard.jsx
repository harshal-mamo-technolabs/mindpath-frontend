import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardList,
  Clock,
  Copy,
  FileHeart,
  Flame,
  Frown,
  Gift,
  Headphones,
  Laugh,
  Meh,
  MessagesSquare,
  Moon,
  Music,
  Play,
  Plus,
  RefreshCcw,
  Smile,
  Sun,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { useTheme } from '../hooks/useTheme.js'
import { ASSESSMENTS } from '../data/assessments.js'
import { AUDIO_PLANS } from '../data/audioPlans.js'
import { REPORT_GROUPS } from '../data/reportHistory.js'
import { PERSONAL_EBOOKS, READING_PROGRESS } from '../data/ebooks.js'

const NAME = 'Maya'
const STREAK = 9

const MOODS = [
  ['Heavy', Frown],
  ['Low', Meh],
  ['Okay', Smile],
  ['Good', Smile],
  ['Light', Laugh],
]

function Spark({ data, accent }) {
  const w = 116
  const h = 36
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * (w - 8) + 4},${h - 5 - ((v - 1) / 4) * (h - 11)}`)
    .join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={((data.length - 1) / (data.length - 1)) * (w - 8) + 4}
        cy={h - 5 - ((data[data.length - 1] - 1) / 4) * (h - 11)}
        r="3.5"
        fill={accent}
      />
    </svg>
  )
}

export default function Dashboard() {
  const { theme, toggle } = useTheme()
  const [mood, setMood] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const say = useCallback((msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 3600)
  }, [])
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // ----- derive everything from the real data modules -----
  const activePlans = AUDIO_PLANS.filter((p) => !p.locked && p.completed < p.days)
  const completedPlans = AUDIO_PLANS.filter((p) => !p.locked && p.completed >= p.days)
  const primary = activePlans[0]
  const nextSession = primary.sessions[primary.completed]
  const sessionsDone = AUDIO_PLANS.filter((p) => !p.locked).reduce((n, p) => n + p.completed, 0)
  const minutesDone = sessionsDone * 7

  const retakeGroup = REPORT_GROUPS.find((g) => g.eligible) || REPORT_GROUPS[0]
  const ebook = PERSONAL_EBOOKS[0]
  const ebookPct = READING_PROGRESS[ebook.id] ?? 0

  const takenIds = new Set(REPORT_GROUPS.map((g) => g.id))
  const notTaken = ASSESSMENTS.filter((a) => !takenIds.has(a.id))

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  function copyInvite() {
    const link = 'mindpath.app/invite/MAYA-CALM'
    navigator.clipboard?.writeText(link).catch(() => {})
    say('Invite link copied  you both get a free session.')
  }

  return (
    <main className="dash">
      <div className="container">
        {/* ===== greeting ===== */}
        <Reveal className="dash-head">
          <div>
            <p className="dash-date">{dateLabel}</p>
            <h1 className="dash-greeting">
              {greeting}, {NAME}.
            </h1>
            <p className="dash-subline">
              You&rsquo;re on a <strong>{STREAK}-day streak</strong> Day {primary.completed + 1} of
              your {primary.title.replace(' path', '')} is ready.
            </p>
          </div>
          <div className="dash-head-right">
            <button
              className="dash-theme-toggle"
              onClick={toggle}
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label={theme === 'dark' ? 'Switch to day mode' : 'Switch to night mode'}
              title={theme === 'dark' ? 'Day mode' : 'Night mode'}
            >
              <span className="dash-theme-track">
                <span className="dash-theme-ico sun">
                  <Sun size={14} />
                </span>
                <span className="dash-theme-ico moon">
                  <Moon size={14} />
                </span>
                <span className="dash-theme-knob" />
              </span>
              <span className="dash-theme-label">{theme === 'dark' ? 'Night' : 'Day'}</span>
            </button>
            <div className="dash-streak-badge">
              <Flame size={20} />
              <strong>{STREAK}</strong>
              <span>day streak</span>
            </div>
          </div>
        </Reveal>

        {/* ===== TODAY ===== */}
        <section className="dash-zone">
          <div className="dash-today-grid">
            {/* feature: today's session */}
            <Reveal className={`dash-feature cover-${primary.cover}`}>
              <div className="dash-feature-scene" aria-hidden="true" />
              <div className="dash-feature-body">
                <p className="dash-kicker">
                  Today&rsquo;s session · {primary.title} · Day {primary.completed + 1} of{' '}
                  {primary.days}
                </p>
                <h2>{nextSession.title}</h2>
                <p className="dash-feature-meta">
                  <Clock size={14} /> {nextSession.len} · evening session
                </p>
                <div className="dash-feature-actions">
                  <Link to="/audio" className="btn btn-light">
                    <Play size={17} fill="currentColor" strokeWidth={0} /> Begin session
                  </Link>
                  <span className="dash-feature-next">
                    Day {primary.completed + 2} unlocks tomorrow · 7:00
                  </span>
                </div>
              </div>
            </Reveal>

            {/* mood check-in */}
            <Reveal className="dash-card dash-mood" delay={0.1}>
              <div className="dash-card-head">
                <h3>How are you arriving?</h3>
                <span className="dash-card-tag">Daily</span>
              </div>
              <div className="dash-mood-row" role="radiogroup" aria-label="Mood check-in">
                {MOODS.map(([label, Icon], i) => (
                  <button
                    key={label}
                    role="radio"
                    aria-checked={mood === i}
                    aria-label={label}
                    className={`dash-mood-btn ${mood === i ? 'active' : ''}`}
                    onClick={() => {
                      setMood(i)
                      say('Mood logged  your trend is climbing.')
                    }}
                  >
                    <Icon size={22} strokeWidth={1.9} />
                  </button>
                ))}
              </div>
              <div className="dash-mood-trend">
                <Spark data={primary.moodTrend} accent="var(--sage)" />
                <div>
                  <span className="dash-mood-delta">
                    <TrendingUp size={13} /> {primary.moodDelta}
                  </span>
                  <small>
                    {mood === null ? 'One tap before your session' : 'across this plan'}
                  </small>
                </div>
              </div>
            </Reveal>
          </div>

          {/* topics you haven't explored yet */}
          {notTaken.length > 0 && (
            <Reveal className="reports-explore dash-explore" delay={0.12}>
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

          {/* the ledger — your numbers, set like a masthead */}
          <div className="dash-ledger">
            <div className="dash-ledger-item">
              <strong>{STREAK}</strong>
              <small>day streak</small>
            </div>
            <div className="dash-ledger-item">
              <strong>{sessionsDone}</strong>
              <small>sessions walked</small>
            </div>
            <div className="dash-ledger-item">
              <strong>{Math.round((minutesDone / 60) * 10) / 10}h</strong>
              <small>time invested</small>
            </div>
            <div className="dash-ledger-item">
              <strong className="pos">
                <TrendingDown size={20} strokeWidth={2.4} />
                {Math.abs(retakeGroup.delta)}
              </strong>
              <small>points lighter</small>
            </div>
          </div>
        </section>

        {/* ===== YOUR JOURNEY ===== */}
        <section className="dash-zone">
          <h2 className="dash-zone-title">Your journey</h2>
          <div className="dash-journey-grid">
            {/* active plans progress */}
            <Reveal className="dash-card dash-progress">
              <div className="dash-card-head">
                <h3>
                  <Headphones size={17} /> Audio progress
                </h3>
                <Link to="/audio" className="dash-card-link">
                  Open <ChevronRight size={15} />
                </Link>
              </div>
              <div className="dash-plan-list">
                {[...activePlans, ...completedPlans].map((p) => {
                  const done = p.completed >= p.days
                  return (
                    <div className="dash-plan" key={p.id}>
                      <div className="dash-plan-top">
                        <span className="dash-plan-name">{p.title.replace(' path', '')}</span>
                        <span className="dash-plan-count">
                          {done ? (
                            <span className="dash-plan-done">
                              <BadgeCheck size={13} /> Done
                            </span>
                          ) : (
                            `${p.completed}/${p.days}`
                          )}
                        </span>
                      </div>
                      <div className="dash-plan-bar">
                        <i
                          style={{
                            width: `${(p.completed / p.days) * 100}%`,
                            background: p.accent,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Reveal>

            {/* report + retake */}
            <Reveal className="dash-card dash-report" delay={0.08}>
              <div className="dash-card-head">
                <h3>
                  <FileHeart size={17} /> Progress &amp; retake
                </h3>
                <Link to="/reports" className="dash-card-link">
                  Reports <ChevronRight size={15} />
                </Link>
              </div>
              <p className="dash-report-topic">{retakeGroup.assessment.title}</p>
              <div className="dash-report-scores">
                <span className="dash-report-from">{retakeGroup.first.overall}</span>
                <span className="dash-report-arrow">
                  <ArrowRight size={16} />
                </span>
                <span className="dash-report-to">{retakeGroup.latest.overall}</span>
                <span className="dash-report-delta">
                  <TrendingDown size={13} /> {Math.abs(retakeGroup.delta)} lighter
                </span>
              </div>
              <p className="dash-report-note">
                Across {retakeGroup.takes.length} check-ins. It&rsquo;s been {retakeGroup.lastDays}{' '}
                days a retake now proves how far you&rsquo;ve come.
              </p>
              <Link
                to={`/assessments/${retakeGroup.id}/take`}
                className="btn btn-primary dash-report-btn"
              >
                <RefreshCcw size={16} /> Retake now
              </Link>
            </Reveal>

            {/* continue reading */}
            <Reveal className="dash-card dash-read" delay={0.16}>
              <div className="dash-card-head">
                <h3>
                  <BookOpen size={17} /> Continue reading
                </h3>
                <Link to="/ebooks" className="dash-card-link">
                  Shelf <ChevronRight size={15} />
                </Link>
              </div>
              <div className="dash-read-row">
                <div className="dash-book" style={{ '--accent': ebook.accent }} aria-hidden="true">
                  <span className="dash-book-title">{ebook.title}</span>
                  <span className="dash-book-for">for {ebook.forName}</span>
                </div>
                <div className="dash-read-text">
                  <h4>{ebook.title}</h4>
                  <p>{ebook.fromReport}</p>
                </div>
                <div className="dash-read-prog">
                  <div className="dash-read-bar">
                    <i style={{ width: `${ebookPct}%`, background: ebook.accent }} />
                  </div>
                  <Link to="/ebooks" className="dash-read-link">
                    Continue · {ebookPct}% <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ===== AROUND YOUR PATH ===== */}
        <section className="dash-zone">
          <h2 className="dash-zone-title">Around your path</h2>
          <div className="dash-explore-grid">
            <Reveal className="dash-upsell dash-counsel">
              <span className="dash-upsell-ico">
                <MessagesSquare size={22} />
              </span>
              <h3>Talk it through</h3>
              <p>An AI advisor that has already read your report start where you are, out loud.</p>
              <Link to="/counselling" className="dash-upsell-link">
                Explore counselling <ArrowRight size={15} />
              </Link>
            </Reveal>

            <Reveal className="dash-upsell dash-refer" delay={0.08}>
              <span className="dash-upsell-ico">
                <Gift size={22} />
              </span>
              <h3>Bring a friend</h3>
              <p>Invite someone walking their own path you both get a free counselling session.</p>
              <button className="dash-upsell-link" onClick={copyInvite}>
                <Copy size={15} /> Copy invite link
              </button>
            </Reveal>

            <Reveal className="dash-upsell dash-music" delay={0.16}>
              <span className="dash-upsell-ico">
                <Music size={22} />
              </span>
              <h3>Free music</h3>
              <p>Yoga &amp; meditation tracks, open whenever you need somewhere calm to land.</p>
              <Link to="/music" className="dash-upsell-link">
                Open the library <ArrowRight size={15} />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ===== quick nav ===== */}
        <div className="dash-jump">
          <span className="dash-jump-label">Everything, one tap away</span>
          <div className="dash-jump-row">
            {[
              ['Assessments', ClipboardList, '/assessments'],
              ['Your reports', FileHeart, '/reports'],
              ['Daily audio', Headphones, '/audio'],
              ['Ebook shop', BookOpen, '/ebooks'],
              ['Counselling', MessagesSquare, '/counselling'],
              ['Free music', Music, '/music'],
            ].map(([label, Icon, to]) => (
              <Link key={label} to={to} className="dash-jump-chip">
                <Icon size={16} strokeWidth={1.9} />
                {label}
                <ArrowUpRight size={14} className="dash-jump-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* toast */}
      <div className="ap-toast-zone dash-toast-zone" aria-live="polite">
        {toast && (
          <p className="ap-toast">
            <Check size={14} /> {toast}
          </p>
        )}
      </div>
    </main>
  )
}
