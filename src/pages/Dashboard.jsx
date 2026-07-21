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
  Frown,
  Gift,
  Headphones,
  Laugh,
  Loader2,
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
import { useAuth } from '../hooks/useAuth.js'
import { getAssessments, getScores } from '../lib/assessmentsApi.js'
import { getAudioPlans } from '../lib/audioApi.js'
import { getMyPrograms } from '../lib/audioProgramsApi.js'
import { listEbooks } from '../lib/ebooksApi.js'
import { groupScores, reportTotals } from '../components/report/reportsData.js'

const MOODS = [
  ['Heavy', Frown],
  ['Low', Meh],
  ['Okay', Smile],
  ['Good', Smile],
  ['Light', Laugh],
]

/* Cover gradients (defined in audio.css) + their accents, cycled by position. */
const COVERS = ['violet', 'tide', 'meadow', 'dusk', 'ember']
const ACCENTS = {
  violet: '#6450cf',
  tide: '#2f8f9d',
  meadow: '#4f9a6a',
  dusk: '#c56b57',
  ember: '#c98a2c',
}
const coverAt = (i) => COVERS[((i % COVERS.length) + COVERS.length) % COVERS.length]
const fmtLen = (s) => (s ? `${Math.round(s / 60)} min` : null)
const idOf = (x) => x._id || x.id
const val = (r) => (r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : [])

/* A generated audio plan → a light progress card (no daily-unlock logic needed here). */
function shapePlanLite(plan, i) {
  const played = plan.playedAt || {}
  const days = (plan.days || []).slice().sort((a, b) => a.day - b.day)
  const isDone = (d) => !!played[`day-${d.day}`] || !!d.completed
  const completed = days.filter(isDone).length
  const total = plan.durationDays || days.length || 1
  const next = days.find((d) => !isDone(d))
  const cover = coverAt(i)
  return {
    id: idOf(plan),
    title: plan.archetype || 'Daily audio plan',
    completed,
    total,
    nextTitle: next?.session?.title || next?.title || null,
    nextLen: next?.session?.durationSeconds ? fmtLen(next.session.durationSeconds) : null,
    cover,
    accent: ACCENTS[cover],
  }
}

/* An added library program (GET /audio-programs/mine) → the same progress card shape. */
function shapeProgramLite(p, i) {
  const played = p.playedAt || {}
  const clips = (p.clips || []).slice().sort((a, b) => a.order - b.order)
  const isDone = (c) => !!played[c.order] || !!played[String(c.order)]
  const completed = clips.filter(isDone).length
  const total = p.total || clips.length || 1
  const next = clips.find((c) => !isDone(c))
  const cover = coverAt(i + 2)
  return {
    id: p.id,
    title: p.title,
    completed,
    total,
    nextTitle: next?.title || null,
    nextLen: next?.durationSeconds ? fmtLen(next.durationSeconds) : null,
    cover,
    accent: ACCENTS[cover],
  }
}

export default function Dashboard() {
  const { theme, toggle } = useTheme()
  const { user } = useAuth()
  const firstName = (user?.name || 'there').trim().split(' ')[0]

  const [mood, setMood] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const [data, setData] = useState({ status: 'loading' })

  const say = useCallback((msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 3600)
  }, [])
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  /* Pull everything real, in parallel. Individual failures degrade to empty. */
  useEffect(() => {
    let alive = true
    Promise.allSettled([
      getAudioPlans(),
      getMyPrograms(),
      getScores(),
      getAssessments(),
      listEbooks(),
    ]).then(([plans, programs, scores, assessments, ebooks]) => {
      if (!alive) return
      setData({
        status: 'ready',
        plans: val(plans),
        programs: val(programs),
        scores: val(scores),
        assessments: val(assessments),
        ebooks: val(ebooks),
      })
    })
    return () => {
      alive = false
    }
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  function copyInvite() {
    navigator.clipboard?.writeText('daybreak.app/invite/DAYBREAK').catch(() => {})
    say('Invite link copied — you both get a free session.')
  }

  const ThemeToggle = (
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
  )

  if (data.status === 'loading') {
    return (
      <main className="dash">
        <div className="container">
          <div className="reports-state">
            <Loader2 size={26} className="ap-spin" />
            <p>Loading your dashboard…</p>
          </div>
        </div>
      </main>
    )
  }

  /* ----- shape real data ----- */
  const audio = [
    ...data.plans.map(shapePlanLite),
    ...data.programs.map(shapeProgramLite),
  ]
  const activeAudio = audio.filter((a) => a.completed < a.total)
  const primary = activeAudio[0] || audio[0] || null
  const sessionsDone = audio.reduce((n, a) => n + a.completed, 0)

  const groups = groupScores(data.scores)
  const totals = reportTotals(groups)
  const primaryGroup = groups.find((g) => g.count > 1) || groups[0] || null

  const takenSlugs = new Set(groups.map((g) => g.slug))
  const notTaken = (data.assessments || []).filter((a) => !takenSlugs.has(a.slug)).slice(0, 6)

  const shelf = (data.ebooks || []).filter((b) => b.onShelf)
  const reading =
    shelf.find((b) => b.progress > 0 && b.progress < 100) ||
    shelf.find((b) => (b.progress || 0) < 100) ||
    shelf[0] ||
    null
  const readingAccent = reading ? ACCENTS[coverAt((data.ebooks || []).indexOf(reading))] : '#6450cf'

  const subline = primary
    ? `Day ${Math.min(primary.completed + 1, primary.total)} of your ${primary.title.replace(' path', '')} is ready.`
    : groups.length
      ? `${totals.reports} ${totals.reports === 1 ? 'report' : 'reports'} and counting — keep going.`
      : 'Take your first assessment to begin your path.'

  return (
    <main className="dash">
      <div className="container">
        {/* ===== greeting ===== */}
        <Reveal className="dash-head">
          <div>
            <p className="dash-date">{dateLabel}</p>
            <h1 className="dash-greeting">
              {greeting}, {firstName}.
            </h1>
            <p className="dash-subline">{subline}</p>
          </div>
          <div className="dash-head-right">{ThemeToggle}</div>
        </Reveal>

        {/* ===== TODAY ===== */}
        <section className="dash-zone">
          <div className="dash-today-grid">
            {/* feature: today's session (or a CTA when there's no plan yet) */}
            {primary ? (
              <Reveal className={`dash-feature cover-${primary.cover}`}>
                <div className="dash-feature-scene" aria-hidden="true" />
                <div className="dash-feature-body">
                  <p className="dash-kicker">
                    {primary.completed < primary.total
                      ? `Today's session · ${primary.title} · Day ${primary.completed + 1} of ${primary.total}`
                      : `Complete · ${primary.title}`}
                  </p>
                  <h2>{primary.nextTitle || 'Every session walked'}</h2>
                  <p className="dash-feature-meta">
                    <Clock size={14} /> {primary.nextLen ? `${primary.nextLen} · ` : ''}
                    guided session
                  </p>
                  <div className="dash-feature-actions">
                    <Link to="/audio" className="btn btn-light">
                      <Play size={17} fill="currentColor" strokeWidth={0} />{' '}
                      {primary.completed < primary.total ? 'Begin session' : 'Replay a session'}
                    </Link>
                  </div>
                </div>
              </Reveal>
            ) : (
              <Reveal className="dash-feature cover-violet">
                <div className="dash-feature-scene" aria-hidden="true" />
                <div className="dash-feature-body">
                  <p className="dash-kicker">Your daily audio</p>
                  <h2>Unlock a path made for you</h2>
                  <p className="dash-feature-meta">
                    <Headphones size={14} /> Generated from your first assessment
                  </p>
                  <div className="dash-feature-actions">
                    <Link to="/assessments" className="btn btn-light">
                      <ArrowRight size={17} /> Take an assessment
                    </Link>
                  </div>
                </div>
              </Reveal>
            )}

            {/* mood check-in (a light daily check — not stored) */}
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
                      say('Mood noted — be gentle with yourself today.')
                    }}
                  >
                    <Icon size={22} strokeWidth={1.9} />
                  </button>
                ))}
              </div>
              <p className="dash-mood-note">
                {mood === null
                  ? 'One quiet tap before you begin.'
                  : `Thanks for checking in, ${firstName}.`}
              </p>
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
                {notTaken.map((a) => (
                  <Link key={a.slug} to={`/assessments/${a.slug}`} className="reports-explore-card">
                    <span className="topic-ico" style={{ background: '#efeafc', color: '#6450cf' }}>
                      <ClipboardList size={22} strokeWidth={1.8} />
                    </span>
                    <div>
                      <strong>{a.name}</strong>
                      <small>{a.questionsCount} questions</small>
                    </div>
                    <span className="reports-explore-add">
                      <Plus size={16} />
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}

          {/* the ledger — real numbers */}
          <div className="dash-ledger">
            <div className="dash-ledger-item">
              <strong>{totals.reports}</strong>
              <small>{totals.reports === 1 ? 'report' : 'reports'} archived</small>
            </div>
            <div className="dash-ledger-item">
              <strong>{groups.length}</strong>
              <small>topics explored</small>
            </div>
            <div className="dash-ledger-item">
              <strong>{sessionsDone}</strong>
              <small>sessions walked</small>
            </div>
            <div className="dash-ledger-item">
              <strong>{shelf.length}</strong>
              <small>{shelf.length === 1 ? 'book' : 'books'} on shelf</small>
            </div>
          </div>
        </section>

        {/* ===== YOUR JOURNEY ===== */}
        <section className="dash-zone">
          <h2 className="dash-zone-title">Your journey</h2>
          <div className="dash-journey-grid">
            {/* audio progress */}
            <Reveal className="dash-card dash-progress">
              <div className="dash-card-head">
                <h3>
                  <Headphones size={17} /> Audio progress
                </h3>
                <Link to="/audio" className="dash-card-link">
                  Open <ChevronRight size={15} />
                </Link>
              </div>
              {audio.length ? (
                <div className="dash-plan-list">
                  {audio.map((p) => {
                    const done = p.completed >= p.total
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
                              `${p.completed}/${p.total}`
                            )}
                          </span>
                        </div>
                        <div className="dash-plan-bar">
                          <i
                            style={{
                              width: `${Math.round((p.completed / p.total) * 100)}%`,
                              background: p.accent,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="dash-empty-note">
                  No audio plan yet. <Link to="/assessments">Take an assessment</Link> to unlock a
                  daily path.
                </p>
              )}
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
              {primaryGroup ? (
                <>
                  <p className="dash-report-topic">{primaryGroup.name}</p>
                  {primaryGroup.count > 1 ? (
                    <div className="dash-report-scores">
                      <span className="dash-report-from">{primaryGroup.first.headline}</span>
                      <span className="dash-report-arrow">
                        <ArrowRight size={16} />
                      </span>
                      <span className="dash-report-to">{primaryGroup.latest.headline}</span>
                      <span className="dash-report-delta">
                        {primaryGroup.improved ? (
                          <TrendingDown size={13} />
                        ) : (
                          <TrendingUp size={13} />
                        )}{' '}
                        {Math.abs(primaryGroup.delta)}{' '}
                        {primaryGroup.improved ? 'better' : primaryGroup.betterWord}
                      </span>
                    </div>
                  ) : (
                    <div className="dash-report-scores">
                      <span className="dash-report-to">{primaryGroup.latest.headline}</span>
                      {primaryGroup.latest.band && (
                        <span className={`band-chip ${primaryGroup.latest.bandClass}`}>
                          {primaryGroup.latest.band}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="dash-report-note">
                    {primaryGroup.count > 1
                      ? `Across ${primaryGroup.count} check-ins. It's been ${primaryGroup.lastDays} days — a retake shows how far you've come.`
                      : `Your first report. Retake in a few weeks to watch it move.`}
                  </p>
                  <Link
                    to={`/assessments/${primaryGroup.slug}/take`}
                    className="btn btn-primary dash-report-btn"
                  >
                    <RefreshCcw size={16} /> Retake now
                  </Link>
                </>
              ) : (
                <>
                  <p className="dash-report-note">
                    No reports yet — take your first assessment and it&rsquo;ll appear here, then
                    each retake stacks into a trend.
                  </p>
                  <Link to="/assessments" className="btn btn-primary dash-report-btn">
                    <ArrowRight size={16} /> Take an assessment
                  </Link>
                </>
              )}
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
              {reading ? (
                <div className="dash-read-row">
                  <div className="dash-book" style={{ '--accent': readingAccent }} aria-hidden="true">
                    <span className="dash-book-title">{reading.coverText || reading.title}</span>
                    <span className="dash-book-for">{reading.author}</span>
                  </div>
                  <div className="dash-read-text">
                    <h4>{reading.title}</h4>
                    <p>{reading.subtitle || reading.description}</p>
                  </div>
                  <div className="dash-read-prog">
                    <div className="dash-read-bar">
                      <i style={{ width: `${reading.progress || 0}%`, background: readingAccent }} />
                    </div>
                    <Link to="/ebooks" className="dash-read-link">
                      {reading.progress ? `Continue · ${reading.progress}%` : 'Start reading'}{' '}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="dash-empty-note">
                  Your shelf is empty. <Link to="/ebooks">Browse the ebook shop</Link> to add a
                  book.
                </p>
              )}
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
              <p>An AI advisor that has already read your report — start where you are, out loud.</p>
              <Link to="/counselling" className="dash-upsell-link">
                Explore counselling <ArrowRight size={15} />
              </Link>
            </Reveal>

            <Reveal className="dash-upsell dash-refer" delay={0.08}>
              <span className="dash-upsell-ico">
                <Gift size={22} />
              </span>
              <h3>Bring a friend</h3>
              <p>Invite someone walking their own path — you both get a free counselling session.</p>
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
