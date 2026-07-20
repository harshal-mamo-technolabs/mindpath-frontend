import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
  X,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import AudioPrograms from '../components/audio/AudioPrograms.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getAudioPlans, markPlayed } from '../lib/audioApi.js'
import { getMyPrograms, markProgramPlayed } from '../lib/audioProgramsApi.js'
import { formatTime } from '../lib/time.js'

/* Map an added audio-library program (from GET /audio-programs/mine) into the SAME shape
   as a generated plan, so it flows through shapePlan → the hero, the side session panel,
   the detail modal and the shared player exactly like an assessment plan. Its play log
   (keyed by clip order) is rekeyed to "day-<order>" to match the plan's daily unlock; it
   has no welcome clip, so track 1 opens right away. `kind: 'program'` marks it so play
   progress is saved via the program endpoint. */
function mapProgramToPlan(p) {
  const playedAt = {}
  Object.entries(p.playedAt || {}).forEach(([order, date]) => {
    playedAt[`day-${order}`] = date
  })
  return {
    id: p.id,
    kind: 'program',
    programId: p.id,
    archetype: p.title, // shapePlan uses this as the card/hero title
    welcomeAudioUrl: null,
    welcomeScript: null,
    status: p.status,
    durationDays: p.total,
    playedAt,
    days: (p.clips || []).map((c) => ({
      day: c.order,
      title: c.title,
      focus: c.category || 'session',
      session: {
        _id: `prog-${p.id}-${c.order}`,
        title: c.title,
        audioUrl: c.audioUrl,
        durationSeconds: c.durationSeconds,
        category: c.category,
      },
    })),
  }
}

/* today as a UTC calendar day ("YYYY-MM-DD") — the same basis the server stamps
   plays with, so the two never disagree on where the day boundary falls. */
const todayUTC = () => new Date().toISOString().slice(0, 10)

const EQ_BARS = [44, 70, 52, 88, 63, 95, 58, 78, 49, 84, 66, 91]
const COVERS = ['cover-violet', 'cover-tide', 'cover-meadow', 'cover-dusk', 'cover-ember']
const ACCENTS = {
  'cover-violet': '#6450cf',
  'cover-tide': '#2f8f9d',
  'cover-meadow': '#4f9a6a',
  'cover-dusk': '#c56b57',
  'cover-ember': '#c98a2c',
}

/* Derive the view model from a raw API plan, computing the daily unlock from its
   `playedAt` log: "day-0" is the welcome, "day-1".."day-N" the sessions. The next
   clip opens once today is PAST the last played date — welcome + Day 1 share the
   first day, every later session needs a fresh day. */
function shapePlan(plan, i) {
  const played = plan.playedAt || {}
  const today = todayUTC()
  const dates = Object.values(played)
  const lastPlayedDate = dates.length ? dates.slice().sort().at(-1) : null
  const hasWelcome = !!plan.welcomeAudioUrl
  const welcomePlayed = !!played['day-0']
  const welcomeSatisfied = welcomePlayed || !hasWelcome

  // completion of each session day comes straight from the play log
  const sorted = [...(plan.days || [])]
    .map((d) => ({ ...d, completed: !!played[`day-${d.day}`] }))
    .sort((a, b) => a.day - b.day)
  const next = sorted.find((d) => !d.completed) || null

  // why the next clip is locked (or null → it's playable right now)
  let reason = null // 'welcome' | 'tomorrow' | null
  if (next) {
    if (!welcomeSatisfied) reason = 'welcome'
    else if (next.day >= 2 && !(lastPlayedDate && today > lastPlayedDate)) reason = 'tomorrow'
  }

  const days = sorted.map((d) => {
    if (d.completed) return { ...d, available: false, locked: false }
    const isNext = next && d.day === next.day
    const available = isNext && reason === null
    return { ...d, available, locked: !available }
  })

  const nextDay = days.find((d) => !d.completed) || null
  const doneCount = days.filter((d) => d.completed).length
  const total = plan.durationDays || days.length
  const cover = COVERS[i % COVERS.length]
  return {
    ...plan,
    days,
    doneCount,
    nextDay,
    total,
    playedAt: played,
    welcomePlayed,
    gate: {
      welcomePlayed,
      nextDay: next?.day ?? null,
      nextAvailable: !!next && reason === null,
      reason,
      lastPlayedDate,
    },
    isComplete: plan.status === 'completed' || (total > 0 && doneCount >= total),
    cover,
    accent: ACCENTS[cover],
    title: plan.archetype || 'Your daily audio plan',
  }
}

/* Message for a locked session row / button. */
function lockReason(plan, d) {
  if (plan.nextDay && d.day === plan.nextDay.day) {
    return plan.gate?.reason === 'welcome'
      ? 'Play the welcome clip first to open Day 1.'
      : 'You’ve already unlocked today’s session — the next one opens tomorrow.'
  }
  return 'Finish the earlier sessions to unlock this one.'
}

export default function AudioLibrary() {
  const { user, isAuthenticated } = useAuth()
  const firstName = (user?.name || '').split(' ')[0] || 'there'

  const [state, setState] = useState({ status: 'loading', plans: [] })
  const [reloadKey, setReloadKey] = useState(0)
  const [nowPlaying, setNowPlaying] = useState(null) // { planId, kind, day, title, subtitle, url, cover, accent, durationSeconds }
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [toast, setToast] = useState(null)
  const [detailPlanId, setDetailPlanId] = useState(null) // plan whose session list is open
  const [pathKey, setPathKey] = useState(0) // bump to resync added-program state across sections
  const autoWelcome = useRef(false) // guard: only auto-open the welcome once per visit
  const audioRef = useRef(null)
  const toastTimer = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  const say = useCallback((msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 4600)
  }, [])
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  /* fetch the user's plans */
  useEffect(() => {
    if (!isAuthenticated) {
      setState({ status: 'unauth', plans: [] })
      return
    }
    let alive = true
    setState({ status: 'loading', plans: [] })
    // Generated plans + the user's added library programs, merged into one "paths" list
    // so both render through the same hero / side panel / modal / player.
    Promise.all([getAudioPlans(), getMyPrograms().catch(() => [])])
      .then(([list, progs]) => {
        if (!alive) return
        const generated = (Array.isArray(list) ? list : []).map((p) => ({ ...p, kind: 'plan' }))
        const programs = (Array.isArray(progs) ? progs : []).map(mapProgramToPlan)
        const plans = [...generated, ...programs]
        setState({ status: plans.length ? 'ready' : 'empty', plans })
      })
      .catch((err) => alive && setState({ status: 'error', error: err.message, plans: [] }))
    return () => {
      alive = false
    }
  }, [isAuthenticated, reloadKey, pathKey])

  const plans = useMemo(() => state.plans.map(shapePlan), [state.plans])
  // The hero follows whatever's playing (so playing a clip from "Your paths"
  // pulls that library up top); otherwise it defaults to the first active plan.
  const primary =
    plans.find((p) => p.id === nowPlaying?.planId) || plans.find((p) => !p.isComplete) || plans[0]
  const detailPlan = detailPlanId ? plans.find((p) => p.id === detailPlanId) : null

  /* replace one plan in state with a fresh server copy (after mark/complete) */
  const patchPlan = useCallback((updated) => {
    setState((s) => ({ ...s, plans: s.plans.map((p) => (p.id === updated.id ? updated : p)) }))
  }, [])

  /* bring the hero into view when a clip is launched from lower on the page */
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  /* ----- playback (real <audio>) ----- */
  const playTrack = useCallback(
    (track) => {
      if (!track.url) {
        say('That session’s audio isn’t ready yet.')
        return
      }
      setNowPlaying(track)
      setElapsed(0)
      setDuration(track.durationSeconds || 0)
    },
    [say],
  )

  // load + play whenever the track changes
  useEffect(() => {
    const el = audioRef.current
    if (!el || !nowPlaying) return
    el.load()
    const p = el.play()
    if (p && p.catch) p.catch(() => setPlaying(false))
  }, [nowPlaying])

  // Record a clip as played (day 0 = welcome, 1..N = sessions) and fold the updated
  // path back into state. Generated plans hit the audio-plan endpoint; added library
  // programs hit the audio-program endpoint (kind === 'program'). Both stamp the date
  // into playedAt server-side and enforce the same daily unlock (423 when locked).
  const recordPlayed = useCallback(
    async (planId, day) => {
      const target = state.plans.find((p) => p.id === planId)
      const isProgram = target?.kind === 'program'
      try {
        if (isProgram) {
          const prog = await markProgramPlayed(planId, day)
          patchPlan(mapProgramToPlan(prog))
          const total = prog.total || (prog.clips || []).length
          say(
            prog.status === 'completed'
              ? `Path complete — all ${total} sessions done. Beautiful work.`
              : `Day ${day} done — Day ${day + 1} opens tomorrow.`,
          )
          return
        }
        const updated = await markPlayed(planId, day)
        patchPlan({ ...updated, kind: 'plan' })
        if (day === 0) {
          say('Welcome played — Day 1 is unlocked.')
          return
        }
        const total = updated.durationDays || (updated.days || []).length
        const sessionsDone = Object.keys(updated.playedAt || {}).filter((k) => k !== 'day-0').length
        say(
          sessionsDone >= total
            ? `Path complete — all ${total} days walked. Beautiful work.`
            : `Day ${day} done — Day ${day + 1} opens tomorrow.`,
        )
      } catch (e) {
        // server rejects a locked clip with a friendly 423 message
        say(e?.message || 'Couldn’t save your progress — check your connection and try again.')
      }
    },
    [state.plans, patchPlan, say],
  )

  const onEnded = () => {
    setPlaying(false)
    if (nowPlaying?.kind === 'day') recordPlayed(nowPlaying.planId, nowPlaying.day)
    else if (nowPlaying?.kind === 'welcome') recordPlayed(nowPlaying.planId, 0)
  }

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (el.paused) el.play()
    else el.pause()
  }

  const seek = (e) => {
    const el = audioRef.current
    if (!el || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    el.currentTime = ratio * duration
  }

  const playWelcome = (p) =>
    playTrack({
      planId: p.id,
      kind: 'welcome',
      title: 'Welcome from your guide',
      subtitle: p.title,
      url: p.welcomeAudioUrl,
      cover: p.cover,
      accent: p.accent,
      durationSeconds: 0,
    })

  const playDay = (p, d) =>
    playTrack({
      planId: p.id,
      kind: 'day',
      day: d.day,
      title: d.session?.title || d.title,
      subtitle: `${p.title} · Day ${d.day}`,
      url: d.session?.audioUrl,
      cover: p.cover,
      accent: p.accent,
      durationSeconds: d.session?.durationSeconds || 0,
    })

  /* The welcome + day rows for a plan — shared by the hero and the library
     detail modal. Completed and available sessions play on click; locked ones
     explain when they open. `afterPlay` lets the modal close once one starts. */
  const renderSessions = (plan, afterPlay) => (
    <div className="ap-also-list">
      {plan.welcomeAudioUrl && (
        <button
          className={`ap-also-row ap-also-session ${plan.welcomePlayed ? 'done' : 'today'} ${
            nowPlaying?.planId === plan.id && nowPlaying?.kind === 'welcome' ? 'current' : ''
          }`}
          onClick={() => {
            playWelcome(plan)
            afterPlay?.()
          }}
        >
          <span className="ap-also-state">
            {plan.welcomePlayed ? <Check size={13} /> : <Sparkles size={12} />}
          </span>
          <span className="ap-also-text">
            <strong>Welcome · a short hello</strong>
          </span>
          <span className="ap-also-len">{plan.welcomePlayed ? 'played' : 'intro'}</span>
        </button>
      )}
      {plan.days.map((d) => {
        const isCurrent =
          nowPlaying?.planId === plan.id && nowPlaying?.kind === 'day' && nowPlaying?.day === d.day
        const cls = d.completed ? 'done' : d.available ? 'today' : 'locked'
        return (
          <button
            key={d.day}
            className={`ap-also-row ap-also-session ${cls} ${isCurrent ? 'current' : ''}`}
            onClick={() => {
              if (d.locked) {
                say(lockReason(plan, d))
                return
              }
              playDay(plan, d)
              afterPlay?.()
            }}
          >
            <span
              className="ap-also-state"
              style={d.available ? { background: plan.accent, color: '#fff' } : undefined}
            >
              {d.completed ? (
                <Check size={13} />
              ) : d.locked ? (
                <Lock size={12} />
              ) : (
                <Play size={11} fill="currentColor" strokeWidth={0} />
              )}
            </span>
            <span className="ap-also-text">
              <strong>
                Day {d.day} · {d.session?.title || d.title}
              </strong>
            </span>
            <span className="ap-also-len">
              {d.session?.durationSeconds ? formatTime(d.session.durationSeconds) : '—'}
            </span>
          </button>
        )
      })}
    </div>
  )

  /* Arriving from a report's "Audio" button: once the plans are in, play the
     welcome for THAT assessment's plan only (never another one). The nav state
     is then cleared so a refresh doesn't replay it. */
  useEffect(() => {
    if (autoWelcome.current || state.status !== 'ready') return
    const target = location.state?.welcomeFor
    if (!target) return
    autoWelcome.current = true
    navigate(location.pathname, { replace: true, state: null })
    const plan = plans.find((p) => String(p.assessment) === String(target))
    // land on the library either way; only auto-play if this plan has a welcome clip
    if (!plan || !plan.welcomeAudioUrl) return
    // start on the next frame (after paint) so playback flows from the click
    const raf = requestAnimationFrame(() => playWelcome(plan))
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, plans])

  /* close the library detail modal on Escape */
  useEffect(() => {
    if (!detailPlanId) return
    const onKey = (e) => e.key === 'Escape' && setDetailPlanId(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [detailPlanId])

  /* ----- non-ready states ----- */
  if (state.status === 'loading') {
    return (
      <main className="ap ap-state-wrap">
        <div className="ap-state">
          <Loader2 size={26} className="ap-spin" />
          <p>Loading your audio plan…</p>
        </div>
      </main>
    )
  }

  if (state.status === 'unauth') {
    return (
      <main className="ap ap-state-wrap">
        <div className="ap-state">
          <Headphones size={30} />
          <h1>Your audio plans live here</h1>
          <p>Log in to see the daily audio plan generated from your assessment.</p>
          <Link to="/login?next=/audio" className="btn btn-primary">
            Log in
          </Link>
        </div>
      </main>
    )
  }

  if (state.status === 'error') {
    return (
      <main className="ap ap-state-wrap">
        <div className="ap-state" role="alert">
          <h1>We couldn’t load your plans</h1>
          <p>{state.error}</p>
          <button className="btn btn-primary" onClick={() => setReloadKey((k) => k + 1)}>
            Try again
          </button>
        </div>
      </main>
    )
  }

  if (state.status === 'empty') {
    return (
      <main className="ap">
        <div className="ap-state">
          <Headphones size={30} />
          <h1>No audio plan yet</h1>
          <p>
            A personalised daily-audio plan is generated from your <strong>first</strong> attempt at
            an assessment. Take one to unlock a guided path sequenced from your report.
          </p>
          <Link to="/assessments" className="btn btn-primary">
            Explore assessments <ArrowRight size={16} />
          </Link>
        </div>
        {/* standalone purchasable audio library — always available, even with no plan */}
        <AudioPrograms pathKey={pathKey} onChange={() => setPathKey((k) => k + 1)} />
      </main>
    )
  }

  /* ----- ready ----- */
  const gate = primary?.gate || {}
  const nextD = primary?.nextDay || null
  // what the hero's "up next" card shows
  const heroMode = !primary
    ? null
    : !primary.welcomePlayed && primary.welcomeAudioUrl
      ? 'welcome'
      : primary.isComplete
        ? 'complete'
        : nextD
          ? gate.nextAvailable
            ? 'day-open'
            : 'day-locked'
          : 'complete'
  // while a clip is playing, the hero card shows THAT clip instead of "up next"
  const isPlayingHero = !!nowPlaying && nowPlaying.planId === primary?.id

  return (
    <main className="ap">
      {/* ===== hero / up next ===== */}
      <header className="ap-hero">
        <div className="container">
          <Reveal as="span" className="eyebrow on-dark">
            Your audio library
          </Reveal>
          <Reveal as="h1" className="ap-h1" delay={0.07}>
            {primary?.isComplete ? (
              <>
                Nicely done, {firstName}. <em>Your path is complete.</em>
              </>
            ) : heroMode === 'day-locked' ? (
              <>
                Good work today, {firstName}. <em>Day {nextD?.day} opens tomorrow.</em>
              </>
            ) : heroMode === 'welcome' ? (
              <>
                Welcome, {firstName}. <em>Your plan is ready.</em>
              </>
            ) : (
              <>
                Good to see you, {firstName}.{' '}
                <em>{nextD ? `Day ${nextD.day} is ready.` : 'Your plan is ready.'}</em>
              </>
            )}
          </Reveal>

          <div className="ap-upnext">
            {primary && (
              <Reveal className={`ap-primary ${primary.cover}`} delay={0.14}>
                <div className="ap-primary-scene" aria-hidden="true" />
                <div className="ap-primary-body">
                  {isPlayingHero ? (
                    <>
                      <p className="ap-kicker ap-kicker-live">
                        <span className={`ap-now-eq${playing ? ' on' : ''}`} aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                        {playing ? 'Now playing' : 'Paused'} · {primary.title}
                      </p>
                      <h2>{nowPlaying.title}</h2>
                      <p className="ap-primary-meta">{nowPlaying.subtitle}</p>
                      <div className="ap-now-bar" aria-hidden="true">
                        <i style={{ width: `${duration ? (elapsed / duration) * 100 : 0}%` }} />
                      </div>
                      <div className="ap-primary-actions">
                        <button className="btn btn-light" onClick={togglePlay}>
                          {playing ? (
                            <>
                              <Pause size={17} fill="currentColor" strokeWidth={0} /> Pause
                            </>
                          ) : (
                            <>
                              <Play size={17} fill="currentColor" strokeWidth={0} /> Resume
                            </>
                          )}
                        </button>
                        <span className="ap-now-time">
                          {formatTime(elapsed)} / {formatTime(duration)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {heroMode === 'welcome' && (
                        <>
                          <p className="ap-kicker">Start here · {primary.title}</p>
                          <h2>Welcome from your guide</h2>
                          <p className="ap-primary-meta">
                            A short hello, then {primary.total} days — one session each.
                          </p>
                          <div className="ap-primary-actions">
                            <button className="btn btn-light" onClick={() => playWelcome(primary)}>
                              <Play size={17} fill="currentColor" strokeWidth={0} /> Play welcome
                            </button>
                            <button
                              className="ap-mark-btn"
                              onClick={() => recordPlayed(primary.id, 0)}
                            >
                              <Check size={15} /> Mark as played
                            </button>
                          </div>
                        </>
                      )}

                      {heroMode === 'day-open' && nextD && (
                        <>
                          <p className="ap-kicker">
                            Up next · {primary.title} · Day {nextD.day} of {primary.total}
                          </p>
                          <h2>{nextD.session?.title || nextD.title}</h2>
                          <p className="ap-primary-meta">
                            {nextD.session?.durationSeconds
                              ? `${formatTime(nextD.session.durationSeconds)} · `
                              : ''}
                            {nextD.focus || 'guided session'}
                          </p>
                          <div className="ap-primary-actions">
                            <button
                              className="btn btn-light"
                              onClick={() => playDay(primary, nextD)}
                            >
                              <Play size={17} fill="currentColor" strokeWidth={0} /> Begin Day{' '}
                              {nextD.day}
                            </button>
                            <button
                              className="ap-mark-btn"
                              onClick={() => recordPlayed(primary.id, nextD.day)}
                            >
                              <Check size={15} /> Mark as completed
                            </button>
                          </div>
                        </>
                      )}

                      {heroMode === 'day-locked' && nextD && (
                        <>
                          <p className="ap-kicker">
                            Up next · {primary.title} · Day {nextD.day} of {primary.total}
                          </p>
                          <h2>{nextD.session?.title || nextD.title}</h2>
                          <p className="ap-primary-meta">
                            {nextD.session?.durationSeconds
                              ? `${formatTime(nextD.session.durationSeconds)} · `
                              : ''}
                            {nextD.focus || 'guided session'}
                          </p>
                          <div className="ap-primary-actions">
                            <span className="ap-locked-btn">
                              <Lock size={16} /> Opens tomorrow
                            </span>
                          </div>
                          <p className="ap-locked-note">
                            <Sparkles size={13} /> One session a day — you’ve done today’s. Come
                            back tomorrow for Day {nextD.day}.
                          </p>
                        </>
                      )}

                      {heroMode === 'complete' && (
                        <>
                          <p className="ap-kicker">Complete · {primary.title}</p>
                          <h2>Every day walked.</h2>
                          <p className="ap-primary-meta">
                            All {primary.total} sessions done. Replay any of them any time.
                          </p>
                          <div className="ap-primary-actions">
                            <button
                              className="btn btn-light"
                              onClick={() => playDay(primary, primary.days[0])}
                            >
                              <Play size={17} fill="currentColor" strokeWidth={0} /> Replay Day 1
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </Reveal>
            )}

            {primary && (
              <Reveal className="ap-alsotoday" delay={0.22}>
                <div className="ap-also-inner">
                  <p className="panel-title">
                    Session by session{' '}
                    <em>
                      {primary.doneCount}/{primary.total}
                    </em>
                  </p>
                  {renderSessions(primary)}
                  <p className="ap-also-note">
                    <Sparkles size={13} /> One new session unlocks each day.
                  </p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </header>

      {/* ===== all plans ===== */}
      <section className="ap-section">
        <div className="container">
          <div className="ap-section-head">
            <h2 className="rp-h2 on-night">
              <Headphones size={19} /> Your paths
            </h2>
            <span className="ap-section-count">
              {plans.filter((p) => !p.isComplete).length} active ·{' '}
              {plans.filter((p) => p.isComplete).length} complete
            </span>
          </div>
          <div className="ap-plans-grid">
            {plans.map((p, i) => (
              <Reveal
                as="article"
                key={p.id}
                className="ap-plan-card"
                delay={(i % 3) * 0.08}
                onClick={() => setDetailPlanId(p.id)}
              >
                <div className={`ap-plan-cover ${p.cover}`}>
                  {p.isComplete ? (
                    <span className="ap-done-badge">
                      <BadgeCheck size={14} /> Completed
                    </span>
                  ) : (
                    <span className="ap-day-badge">
                      Day {p.doneCount + 1} of {p.total}
                    </span>
                  )}
                </div>
                <div className="ap-plan-body">
                  <h3>{p.title}</h3>
                  <div className="ap-progress">
                    <div className="ap-progress-track">
                      <i
                        style={{ width: `${(p.doneCount / p.total) * 100}%`, background: p.accent }}
                      />
                    </div>
                    <span>
                      {p.doneCount}/{p.total}
                    </span>
                  </div>
                  <div className="ap-plan-actions">
                    {p.isComplete ? (
                      <button
                        className="ap-btn-play"
                        onClick={(e) => {
                          e.stopPropagation()
                          playDay(p, p.days[0])
                          scrollToTop()
                        }}
                      >
                        <Play size={14} fill="currentColor" strokeWidth={0} /> Replay Day 1
                      </button>
                    ) : !p.welcomePlayed && p.welcomeAudioUrl ? (
                      <button
                        className="ap-btn-play"
                        onClick={(e) => {
                          e.stopPropagation()
                          playWelcome(p)
                          scrollToTop()
                        }}
                      >
                        <Play size={14} fill="currentColor" strokeWidth={0} /> Play welcome
                      </button>
                    ) : p.gate?.nextAvailable ? (
                      <button
                        className="ap-btn-play"
                        onClick={(e) => {
                          e.stopPropagation()
                          playDay(p, p.nextDay || p.days[0])
                          scrollToTop()
                        }}
                      >
                        <Play size={14} fill="currentColor" strokeWidth={0} /> Begin Day{' '}
                        {p.doneCount + 1}
                      </button>
                    ) : (
                      <span className="ap-btn-play locked">
                        <Lock size={14} /> Opens tomorrow
                      </span>
                    )}
                    <button
                      className="ap-plan-view"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDetailPlanId(p.id)
                      }}
                    >
                      View sessions <ArrowRight size={14} />
                    </button>
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

      {/* ===== library detail: what's in this path + play any unlocked session ===== */}
      {detailPlan && (
        <div className="ap-modal-overlay" onClick={() => setDetailPlanId(null)}>
          <div className="ap-modal ap-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="ap-modal-close"
              onClick={() => setDetailPlanId(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className={`ap-modal-cover ${detailPlan.cover}`} aria-hidden="true" />
            <p className="ap-kicker">
              {detailPlan.isComplete
                ? `Complete · ${detailPlan.total} sessions`
                : `${detailPlan.doneCount}/${detailPlan.total} done · Day ${detailPlan.doneCount + 1} up next`}
            </p>
            <h3>{detailPlan.title}</h3>
            <p className="ap-modal-pitch">
              Everything in this path. Play any session you’ve unlocked — new ones open one a day.
            </p>
            {renderSessions(detailPlan, () => {
              setDetailPlanId(null)
              scrollToTop()
            })}
          </div>
        </div>
      )}

      {/* ===== standalone purchasable audio library ===== */}
      <AudioPrograms pathKey={pathKey} onChange={() => setPathKey((k) => k + 1)} />

      {/* real audio element (hidden) */}
      <audio
        ref={audioRef}
        src={nowPlaying?.url || undefined}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={onEnded}
        onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          // some streams report Infinity until fully buffered — keep the known
          // durationSeconds (set in playTrack) unless the audio gives a real one
          const d = e.currentTarget.duration
          if (Number.isFinite(d) && d > 0) setDuration(d)
        }}
      />

      {/* ===== player bar ===== */}
      {nowPlaying && (
        <div className={`ap-player ${playing ? 'playing' : ''}`}>
          <div className="container ap-player-inner">
            <span className={`ap-mini-cover lg ${nowPlaying.cover}`} aria-hidden="true" />
            <div className="ap-player-meta">
              <strong>{nowPlaying.title}</strong>
              <small>{nowPlaying.subtitle}</small>
            </div>
            <div className="ap-player-eq" aria-hidden="true">
              {EQ_BARS.map((h, i) => (
                <i key={i} style={{ '--h': h, '--i': i }} />
              ))}
            </div>
            <div className="ap-player-progress">
              <span>{formatTime(elapsed)}</span>
              <button className="ap-seek" onClick={seek} aria-label="Seek within session">
                <i
                  style={{
                    width: `${duration ? (elapsed / duration) * 100 : 0}%`,
                    background: nowPlaying.accent,
                  }}
                />
              </button>
              <span>{formatTime(duration)}</span>
            </div>
            <button
              className="ap-player-toggle"
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                <Pause size={20} fill="currentColor" strokeWidth={0} />
              ) : elapsed > 0 && duration && elapsed >= duration ? (
                <CheckCheck size={20} />
              ) : (
                <Play size={20} fill="currentColor" strokeWidth={0} style={{ marginLeft: 2 }} />
              )}
            </button>
            <button
              className="ap-player-close"
              onClick={() => {
                audioRef.current?.pause()
                setNowPlaying(null)
              }}
              aria-label="Close player"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
