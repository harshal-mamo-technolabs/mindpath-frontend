import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Check,
  CheckCheck,
  Headphones,
  Loader2,
  Lock,
  Pause,
  Play,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { AUDIO_PLANS, fmtTime, lenToSeconds } from '../data/audioPlans.js'

/* Demo time runs faster than the clock so sessions can be finished. */
const DEMO_SPEED = 14

const EQ_BARS = [44, 70, 52, 88, 63, 95, 58, 78, 49, 84, 66, 91]

function MoodSpark({ data, accent }) {
  const w = 92
  const h = 30
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * (w - 8) + 4},${h - 4 - ((v - 1) / 4) * (h - 9)}`)
    .join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function AudioLibrary() {
  const [unlocked, setUnlocked] = useState(
    () => new Set(AUDIO_PLANS.filter((p) => !p.locked).map((p) => p.id))
  )
  const [progress, setProgress] = useState(() =>
    Object.fromEntries(AUDIO_PLANS.map((p) => [p.id, p.completed || 0]))
  )
  const [nowPlaying, setNowPlaying] = useState(null) // {planId, day, title, len}
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [modal, setModal] = useState(null) // {plan, step}
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const plans = useMemo(
    () =>
      AUDIO_PLANS.map((p) => ({
        ...p,
        isUnlocked: unlocked.has(p.id),
        done: progress[p.id] ?? 0,
      })),
    [unlocked, progress]
  )
  const active = plans.filter((p) => p.isUnlocked && p.done < p.days)
  const completedPlans = plans.filter((p) => p.isUnlocked && p.done >= p.days)
  const lockedPlans = plans.filter((p) => !p.isUnlocked)
  const primary = active[0]

  const say = useCallback((msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 4200)
  }, [])

  const duration = nowPlaying ? lenToSeconds(nowPlaying.len) : 0

  const finishSession = useCallback(() => {
    setPlaying(false)
    const { planId, day } = nowPlaying
    const plan = plans.find((p) => p.id === planId)
    if (day === plan.done + 1) {
      setProgress((prev) => ({ ...prev, [planId]: day }))
      say(
        day >= plan.days
          ? `Path complete  all ${plan.days} days walked. Time for a retake?`
          : `Day ${day} complete. Day ${day + 1} unlocks tomorrow at 7:00.`
      )
    } else {
      say(`Day ${day} replayed  revisiting is part of the practice.`)
    }
  }, [nowPlaying, plans, say])

  useEffect(() => {
    if (!playing || !nowPlaying) return
    const id = setInterval(() => {
      setElapsed((e) => Math.min(duration, e + DEMO_SPEED))
    }, 1000)
    return () => clearInterval(id)
  }, [playing, nowPlaying, duration])

  useEffect(() => {
    if (nowPlaying && elapsed >= duration && duration > 0) finishSession()
  }, [elapsed, duration, nowPlaying, finishSession])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  function play(plan, session) {
    if (session.day > plan.done + 1) {
      const wait = session.day - plan.done - 1
      say(
        wait === 1
          ? `Day ${session.day} unlocks tomorrow at 7:00  one day at a time.`
          : `Day ${session.day} is ${wait} mornings away  one day at a time.`
      )
      return
    }
    setNowPlaying({ planId: plan.id, planTitle: plan.title, cover: plan.cover, accent: plan.accent, ...session })
    setElapsed(0)
    setPlaying(true)
  }

  function togglePlay() {
    if (elapsed >= duration) setElapsed(0)
    setPlaying((p) => !p)
  }

  function seek(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    setElapsed(Math.round(ratio * duration))
  }

  function startUnlock(plan) {
    setModal({ plan, step: 'offer' })
  }

  function confirmUnlock() {
    setModal((m) => ({ ...m, step: 'processing' }))
    setTimeout(() => setModal((m) => ({ ...m, step: 'done' })), 1500)
  }

  function finishUnlock(playNow) {
    const plan = modal.plan
    setUnlocked((prev) => new Set([...prev, plan.id]))
    setProgress((prev) => ({ ...prev, [plan.id]: 0 }))
    setModal(null)
    if (playNow) {
      setNowPlaying({
        planId: plan.id,
        planTitle: plan.title,
        cover: plan.cover,
        accent: plan.accent,
        ...plan.sessions[0],
      })
      setElapsed(0)
      setPlaying(true)
    } else {
      say(`${plan.title} unlocked  Day 1 is ready when you are.`)
    }
  }

  const nextOf = (p) => p.sessions[p.done] // next session object

  return (
    <main className="ap">
      {/* ===== header / up next ===== */}
      <header className="ap-hero">
        <div className="container">
          <Reveal as="span" className="eyebrow on-dark">
            Your audio library
          </Reveal>
          <Reveal as="h1" className="ap-h1" delay={0.07}>
            Good evening, Maya. <em>Day {primary ? primary.done + 1 : 1} is ready.</em>
          </Reveal>

          <div className="ap-upnext">
            {primary && (
              <Reveal className={`ap-primary cover-${primary.cover}`} delay={0.14}>
                <div className="ap-primary-scene" aria-hidden="true" />
                <div className="ap-primary-body">
                  <p className="ap-kicker">
                    Up next · {primary.title} · Day {primary.done + 1} of {primary.days}
                  </p>
                  <h2>{nextOf(primary).title}</h2>
                  <p className="ap-primary-meta">
                    {nextOf(primary).len} · evening session · last visited{' '}
                    {primary.lastListened || 'just now'}
                  </p>
                  <div className="ap-primary-actions">
                    <button className="btn btn-light" onClick={() => play(primary, nextOf(primary))}>
                      <Play size={17} fill="currentColor" strokeWidth={0} /> Begin Day{' '}
                      {primary.done + 1}
                    </button>
                  </div>
                </div>
              </Reveal>
            )}

            <Reveal className="ap-alsotoday" delay={0.22}>
              <div className="ap-also-inner">
                {primary ? (
                  <>
                  <p className="panel-title">
                    Session by session <em>{primary.done}/{primary.days}</em>
                  </p>
                  <div className="ap-also-list">
                    {primary.sessions.map((s) => {
                      const state =
                        s.day <= primary.done
                          ? 'done'
                          : s.day === primary.done + 1
                            ? 'today'
                            : 'locked'
                      const isCurrent =
                        nowPlaying?.planId === primary.id && nowPlaying?.day === s.day
                      return (
                        <button
                          key={s.day}
                          className={`ap-also-row ap-also-session ${state} ${isCurrent ? 'current' : ''}`}
                          onClick={() => play(primary, s)}
                          aria-label={`Day ${s.day}: ${s.title}, ${
                            state === 'locked'
                              ? 'locked'
                              : state === 'done'
                                ? 'completed, replay'
                                : 'play'
                          }`}
                        >
                          <span
                            className="ap-also-state"
                            style={
                              state === 'today'
                                ? { background: primary.accent, color: '#fff' }
                                : undefined
                            }
                          >
                            {state === 'done' ? (
                              <Check size={13} />
                            ) : state === 'today' ? (
                              <Play size={11} fill="currentColor" strokeWidth={0} />
                            ) : (
                              <Lock size={11} />
                            )}
                          </span>
                          <span className="ap-also-text">
                            <strong>
                              Day {s.day} · {s.title}
                            </strong>
                          </span>
                          <span className="ap-also-len">
                            {state === 'locked' ? `+${s.day - primary.done - 1}d` : s.len}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                    <p className="ap-also-note">
                      <Sparkles size={13} /> One new session unlocks each morning.
                    </p>
                  </>
                ) : (
                  <p className="ap-also-empty">
                    No active path right now  unlock one below to begin.
                  </p>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      {/* ===== your paths ===== */}
      <section className="ap-section">
        <div className="container">
          <div className="ap-section-head">
            <h2 className="rp-h2 on-night">
              <Headphones size={19} /> Your paths
            </h2>
            <span className="ap-section-count">
              {active.length} active · {completedPlans.length} complete
            </span>
          </div>
          <div className="ap-plans-grid">
            {[...active, ...completedPlans].map((p, i) => {
              const isDone = p.done >= p.days
              return (
                <Reveal as="article" key={p.id} className="ap-plan-card" delay={(i % 3) * 0.08}>
                  <div className={`ap-plan-cover cover-${p.cover}`}>
                    {isDone ? (
                      <span className="ap-done-badge">
                        <BadgeCheck size={14} /> Completed
                      </span>
                    ) : (
                      <span className="ap-day-badge">
                        Day {p.done + 1} of {p.days}
                      </span>
                    )}
                    {p.free && <span className="ap-free-badge">Free</span>}
                  </div>
                  <div className="ap-plan-body">
                    <h3>{p.title}</h3>
                    <div className="ap-progress">
                      <div className="ap-progress-track">
                        <i style={{ width: `${(p.done / p.days) * 100}%`, background: p.accent }} />
                      </div>
                      <span>
                        {p.done}/{p.days}
                      </span>
                    </div>
                    {p.moodTrend ? (
                      <div className="ap-plan-mood">
                        <MoodSpark data={p.moodTrend} accent={p.accent} />
                        <span className="ap-mood-delta">
                          <TrendingUp size={12} /> mood {p.moodDelta}
                        </span>
                      </div>
                    ) : (
                      <p className="ap-mood-pending">
                        Your mood trend appears after the first check-ins.
                      </p>
                    )}
                    <div className="ap-plan-actions">
                      {isDone ? (
                        <>
                          <button className="ap-btn-play" onClick={() => play(p, p.sessions[0])}>
                            <Play size={14} fill="currentColor" strokeWidth={0} /> Replay Day 1
                          </button>
                          <Link className="ap-ghostlink" to={`/assessments/${p.id}`}>
                            Retake <ArrowRight size={14} />
                          </Link>
                        </>
                      ) : (
                        <button className="ap-btn-play" onClick={() => play(p, nextOf(p))}>
                          <Play size={14} fill="currentColor" strokeWidth={0} /> Begin Day {p.done + 1}
                        </button>
                      )}
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>


      {/* ===== locked plans ===== */}
      <section className="ap-section ap-locked-section">
        <div className="container">
          <div className="ap-section-head">
            <h2 className="rp-h2 on-night">
              <Lock size={18} /> Paths waiting for you
            </h2>
            <span className="ap-section-count">{lockedPlans.length} paths</span>
          </div>
          <p className="ap-locked-sub">
            Each plan is sequenced from its assessment report  or unlock the plan alone and
            start with the standard sequence.
          </p>
          <div className="ap-plans-grid">
            {lockedPlans.map((p, i) => (
              <Reveal as="article" key={p.id} className="ap-plan-card ap-locked-card" delay={(i % 3) * 0.08}>
                <div className={`ap-plan-cover cover-${p.cover} is-locked`}>
                  <span className="ap-lock-overlay">
                    <Lock size={18} />
                  </span>
                  <span className="ap-day-badge">{p.days} days</span>
                </div>
                <div className="ap-plan-body">
                  <h3>{p.title}</h3>
                  <p className="ap-pitch">{p.pitch}</p>
                  <ul className="ap-preview">
                    {p.sessions.slice(0, 3).map((s) => (
                      <li key={s.day}>
                        <Lock size={11} /> Day {s.day} · {s.title}
                      </li>
                    ))}
                    <li className="ap-preview-more">…and {p.days - 3} more, one each morning</li>
                  </ul>
                  <div className="ap-plan-actions">
                    <button className="ap-btn-unlock" onClick={() => startUnlock(p)}>
                      Unlock · {p.price}
                    </button>
                    <Link className="ap-ghostlink" to={`/assessments/${p.assessmentId}`}>
                      Or take the assessment <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== toast ===== */}
      <div className="ap-toast-zone" aria-live="polite">
        {toast && (
          <p className="ap-toast">
            <Bell size={14} /> {toast}
          </p>
        )}
      </div>

      {/* ===== player bar ===== */}
      {nowPlaying && (
        <div className={`ap-player ${playing ? 'playing' : ''}`}>
          <div className="container ap-player-inner">
            <span className={`ap-mini-cover lg cover-${nowPlaying.cover}`} aria-hidden="true" />
            <div className="ap-player-meta">
              <strong>
                Day {nowPlaying.day} · {nowPlaying.title}
              </strong>
              <small>{nowPlaying.planTitle}</small>
            </div>
            <div className="ap-player-eq" aria-hidden="true">
              {EQ_BARS.map((h, i) => (
                <i key={i} style={{ '--h': h, '--i': i }} />
              ))}
            </div>
            <div className="ap-player-progress">
              <span>{fmtTime(elapsed)}</span>
              <button
                className="ap-seek"
                onClick={seek}
                aria-label="Seek within session"
              >
                <i
                  style={{
                    width: `${duration ? (elapsed / duration) * 100 : 0}%`,
                    background: nowPlaying.accent,
                  }}
                />
              </button>
              <span>{fmtTime(duration)}</span>
            </div>
            <button
              className="ap-player-toggle"
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {elapsed >= duration ? (
                <CheckCheck size={20} />
              ) : playing ? (
                <Pause size={20} fill="currentColor" strokeWidth={0} />
              ) : (
                <Play size={20} fill="currentColor" strokeWidth={0} style={{ marginLeft: 2 }} />
              )}
            </button>
            <button
              className="ap-player-close"
              onClick={() => {
                setPlaying(false)
                setNowPlaying(null)
              }}
              aria-label="Close player"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {/* ===== unlock modal ===== */}
      {modal && (
        <div
          className="ap-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Unlock ${modal.plan.title}`}
          onClick={(e) => {
            if (e.target === e.currentTarget && modal.step !== 'processing') setModal(null)
          }}
        >
          <div className="ap-modal">
            {modal.step === 'offer' && (
              <>
                <div className={`ap-modal-cover cover-${modal.plan.cover}`} aria-hidden="true" />
                <h3>{modal.plan.title}</h3>
                <p className="ap-modal-pitch">{modal.plan.pitch}</p>
                <ul className="ap-modal-list">
                  <li>
                    <Check size={15} /> {modal.plan.days} sessions, 5–10 minutes each
                  </li>
                  <li>
                    <Check size={15} /> One new session unlocks every morning
                  </li>
                  <li>
                    <Check size={15} /> Welcome audio recorded with your name
                  </li>
                  <li>
                    <Check size={15} /> Mood check-ins &amp; trend tracking
                  </li>
                </ul>
                <p className="ap-modal-reco">
                  <Sparkles size={14} /> Best results: take the {modal.plan.days >= 21 ? '12' : '11'}-minute
                  assessment first  your sessions get sequenced from your report, and the plan
                  is included.
                </p>
                <div className="ap-modal-actions">
                  <Link to={`/assessments/${modal.plan.assessmentId}`} className="btn btn-light">
                    Take the assessment · $19
                  </Link>
                  <button className="ap-btn-unlock lg" onClick={confirmUnlock}>
                    Unlock plan only · {modal.plan.price}
                  </button>
                </div>
                <button className="ap-modal-close" onClick={() => setModal(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </>
            )}
            {modal.step === 'processing' && (
              <div className="ap-modal-processing">
                <Loader2 size={34} className="ap-spin" />
                <h3>Securing your sessions…</h3>
                <p>Demo checkout  no card, no charge.</p>
              </div>
            )}
            {modal.step === 'done' && (
              <div className="ap-modal-done">
                <span className="ap-done-check">
                  <Check size={26} />
                </span>
                <h3>{modal.plan.title} unlocked</h3>
                <p>
                  Day 1 is ready right now. Day 2 arrives tomorrow at 7:00  the path works one
                  morning at a time.
                </p>
                <div className="ap-modal-actions">
                  <button className="btn btn-light" onClick={() => finishUnlock(true)}>
                    <Play size={16} fill="currentColor" strokeWidth={0} /> Play Day 1 now
                  </button>
                  <button className="ap-ghostlink" onClick={() => finishUnlock(false)}>
                    Later tonight
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
