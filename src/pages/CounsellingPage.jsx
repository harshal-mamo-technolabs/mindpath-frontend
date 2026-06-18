import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardList,
  Clock,
  Headphones,
  Loader2,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Plus,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import Logo from '../components/Logo.jsx'
import {
  ADVISOR,
  fmtSessionDate,
  getSession,
  includedMinutes,
  MINUTE_PACKS,
  PAST_SESSIONS,
  TOPICS,
} from '../data/counselling.js'

const SUGGEST_META = {
  ebook: { icon: BookOpen, label: 'Suggested ebook' },
  plan: { icon: Headphones, label: 'Suggested session' },
  assessment: { icon: ClipboardList, label: 'Suggested assessment' },
}

/* Premium living voice orb for the live call — a soft 3D blob whose internal
   light swirls, edge morphs, and halo pulses as the advisor speaks. */
function VoiceBlob({ speaking = false, connecting = false }) {
  return (
    <div
      className={`vblob ${speaking ? 'is-speaking' : ''} ${connecting ? 'is-connecting' : ''}`}
      aria-hidden="true"
    >
      <span className="vblob-glow" />
      <span className="vblob-ring r1" />
      <span className="vblob-ring r2" />
      <span className="vblob-core">
        <span className="vblob-lobe l1" />
        <span className="vblob-lobe l2" />
        <span className="vblob-lobe l3" />
        <span className="vblob-sheen" />
      </span>
    </div>
  )
}

const fmtClock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function CounsellingPage() {
  const [phase, setPhase] = useState('lobby') // lobby | connecting | call | summary
  const [topicId, setTopicId] = useState(TOPICS[0].id)
  const [minutes, setMinutes] = useState(() => {
    const m = includedMinutes()
    return m === Infinity ? 120 : m
  })
  const [revealed, setRevealed] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [muted, setMuted] = useState(false)
  const [buyOpen, setBuyOpen] = useState(false)
  const [buyStep, setBuyStep] = useState('offer')
  const [pack, setPack] = useState(MINUTE_PACKS[1])
  const [toast, setToast] = useState(null)
  const timers = useRef([])
  const transcriptRef = useRef(null)
  const toastTimer = useRef(null)

  const topic = TOPICS.find((t) => t.id === topicId)
  const script = useMemo(() => getSession(topic), [topic])
  const lines = script.lines
  const speaking = phase === 'call' && revealed > 0 && lines[revealed - 1]?.from === 'advisor'
  const ended = revealed >= lines.length

  const say = useCallback((msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 3600)
  }, [])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(
    () => () => {
      clearTimers()
      clearTimeout(toastTimer.current)
    },
    [],
  )

  // auto-play transcript while in call
  useEffect(() => {
    if (phase !== 'call' || revealed >= lines.length) return
    const line = lines[revealed]
    const dur = line.from === 'advisor' ? Math.min(5200, 1500 + line.text.length * 30) : 2600
    const t = setTimeout(() => setRevealed((r) => r + 1), dur)
    timers.current.push(t)
    return () => clearTimeout(t)
  }, [phase, revealed, lines])

  // call timer
  useEffect(() => {
    if (phase !== 'call') return
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [phase])

  // autoscroll transcript
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' })
  }, [revealed])

  function startCall() {
    setRevealed(0)
    setElapsed(0)
    setPhase('connecting')
    const t = setTimeout(() => setPhase('call'), 1600)
    timers.current.push(t)
  }

  function endCall() {
    clearTimers()
    setPhase('summary')
  }

  function backToLobby() {
    setPhase('lobby')
    setRevealed(0)
    setElapsed(0)
  }

  function confirmBuy() {
    setBuyStep('processing')
    setTimeout(() => setBuyStep('done'), 1300)
  }

  function finishBuy() {
    setMinutes((m) => m + pack.minutes)
    setBuyOpen(false)
    setBuyStep('offer')
    say(`${pack.minutes} minutes added  talk as long as you need.`)
  }

  const remaining = Math.max(0, minutes - Math.ceil(elapsed / 60))

  // ---------- CONNECTING / CALL / SUMMARY (focused, chrome-free) ----------
  if (phase === 'connecting' || phase === 'call' || phase === 'summary') {
    return (
      <div className="cn-stage" style={{ '--accent': topic.accent }}>
        <header className="take-bar cn-bar">
          <Logo />
          <p className="take-topic">
            {phase === 'summary' ? 'Session summary' : `Live · ${topic.title}`}
          </p>
          <button
            className="take-exit"
            onClick={phase === 'summary' ? backToLobby : endCall}
            aria-label="Close session"
          >
            <X size={20} />
          </button>
        </header>

        {phase === 'summary' ? (
          <main className="cn-summary">
            <span className="ap-done-check cn-summary-check">
              <Check size={26} />
            </span>
            <h1>Session complete</h1>
            <p className="cn-summary-meta">
              {topic.title} · {fmtClock(elapsed)} · {remaining} min left this cycle
            </p>

            <div className="cn-summary-card">
              <h3>What you and {ADVISOR.name} talked about</h3>
              <ul className="cn-takeaways">
                {script.takeaways.map((t) => (
                  <li key={t}>
                    <Check size={15} /> {t}
                  </li>
                ))}
              </ul>

              <Link to={script.suggest.to} className="cn-suggest cn-suggest-summary">
                <span className="cn-suggest-ico">
                  {(() => {
                    const Ico = SUGGEST_META[script.suggest.type].icon
                    return <Ico size={18} />
                  })()}
                </span>
                <div>
                  <small>{SUGGEST_META[script.suggest.type].label}</small>
                  <strong>{script.suggest.title}</strong>
                </div>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="cn-summary-actions">
              <button className="btn btn-light" onClick={backToLobby}>
                <PhoneCall size={16} /> New session
              </button>
              <button className="cn-textlink" onClick={() => setBuyOpen(true)}>
                Buy more minutes
              </button>
            </div>
          </main>
        ) : (
          <main className="cn-call">
            {/* advisor */}
            <div className="cn-call-stage">
              <VoiceBlob speaking={speaking} connecting={phase === 'connecting'} />
              <h2 className="cn-advisor-name">{ADVISOR.name}</h2>
              <p className="cn-advisor-state">
                {phase === 'connecting' ? (
                  <>
                    <Loader2 size={14} className="ap-spin" /> Connecting…
                  </>
                ) : speaking ? (
                  'Speaking…'
                ) : ended ? (
                  'Listening — take your time'
                ) : (
                  'Listening…'
                )}
              </p>
            </div>

            {/* transcript */}
            <div className="cn-transcript" ref={transcriptRef}>
              <p className="cn-grounded-note">
                <Sparkles size={13} />{' '}
                {topic.hasReport
                  ? `${ADVISOR.name} has your ${topic.title} report for extra context — but lead wherever you need.`
                  : topic.open
                    ? `No report, no agenda — just start talking, ${ADVISOR.name} will follow.`
                    : `No report needed — ${ADVISOR.name} will get to know this as you talk.`}
              </p>
              {lines.slice(0, revealed).map((line, i) => (
                <div key={i} className={`cn-msg ${line.from}`}>
                  <span className="cn-msg-who">
                    {line.from === 'advisor' ? ADVISOR.name : 'You'}
                  </span>
                  <p>{line.text}</p>
                </div>
              ))}
              {speaking && (
                <div className="cn-msg advisor">
                  <span className="cn-msg-who">{ADVISOR.name}</span>
                  <p className="cn-typing">
                    <i />
                    <i />
                    <i />
                  </p>
                </div>
              )}

              {/* mid-call suggestion */}
              {revealed >= lines.length - 1 && (
                <Link to={script.suggest.to} className="cn-suggest">
                  <span className="cn-suggest-ico">
                    {(() => {
                      const Ico = SUGGEST_META[script.suggest.type].icon
                      return <Ico size={18} />
                    })()}
                  </span>
                  <div>
                    <small>
                      {ADVISOR.name} suggests · {SUGGEST_META[script.suggest.type].label}
                    </small>
                    <strong>{script.suggest.title}</strong>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>

            {/* controls */}
            <div className="cn-controls">
              <div className="cn-timer">
                <Clock size={14} />
                <strong>{fmtClock(elapsed)}</strong>
                <span>· {remaining} min left</span>
              </div>
              <div className="cn-control-btns">
                <button
                  className={`cn-ctrl ${muted ? 'active' : ''}`}
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button className="cn-ctrl cn-end" onClick={endCall} aria-label="End session">
                  <PhoneOff size={22} />
                </button>
                <button
                  className="cn-ctrl"
                  onClick={() => setBuyOpen(true)}
                  aria-label="Buy minutes"
                >
                  <Plus size={20} />
                </button>
              </div>
              {remaining <= 5 && (
                <p className="cn-low">
                  <Zap size={13} /> Running low top up to keep talking.
                </p>
              )}
            </div>
          </main>
        )}

        {/* toast + buy modal shared below */}
        <Toasts toast={toast} />
        {buyOpen && (
          <BuyMinutes
            pack={pack}
            setPack={setPack}
            step={buyStep}
            onConfirm={confirmBuy}
            onFinish={finishBuy}
            onClose={() => {
              setBuyOpen(false)
              setBuyStep('offer')
            }}
          />
        )}
      </div>
    )
  }

  // ---------- LOBBY ----------
  const Icon = topic.icon
  const reportNote = topic.hasReport
    ? `${ADVISOR.name} comes in with your ${topic.title} report, so you can skip the backstory and go straight to what’s shifted — the report is context, never a script.`
    : topic.assessmentId
      ? `No report on this yet — ${ADVISOR.name} gets to know it live as you talk. Want sharper context first? A short ${topic.title} assessment maps it.`
      : topic.open
        ? `Nothing to name and no agenda — start talking and ${ADVISOR.name} follows the thread with you.`
        : `Bring it just as it is. ${ADVISOR.name} listens, reflects it back, and helps you find the next small step — no report needed.`
  const contextLink = topic.hasReport
    ? { to: '/reports', label: `View your ${topic.title} report` }
    : topic.assessmentId
      ? {
          to: `/assessments/${topic.assessmentId}`,
          label: `Take the ${topic.title} assessment first`,
        }
      : null

  return (
    <main className="cn">
      <div className="container">
        <Reveal as="header" className="cn-hero">
          <span className="eyebrow on-dark">AI counselling</span>
          <h1 className="cn-title">
            Talk it through, <em>out loud.</em>
          </h1>
          <p className="cn-lede">{ADVISOR.blurb}</p>
          <div className="cn-minutes-pill">
            <Clock size={15} />
            <strong>{minutes === Infinity ? '∞' : minutes} minutes</strong> available this cycle
            <button onClick={() => setBuyOpen(true)}>
              <Plus size={13} /> Top up
            </button>
          </div>
        </Reveal>

        <section className="cn-section">
          <h2 className="rp-h2 on-night">
            <Sparkles size={18} /> What would you like to talk about?
          </h2>
          <p className="cn-section-sub">
            Pick whatever you&rsquo;re carrying — no report required — and we&rsquo;ll show you how
            that session goes before you start.
          </p>
          <div className="cn-topics">
            {TOPICS.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  className={`cn-topic ${topicId === t.id ? 'active' : ''}`}
                  onClick={() => setTopicId(t.id)}
                  style={{ '--accent': t.accent }}
                >
                  <span className="cn-topic-ico" style={{ background: t.bg, color: t.fg }}>
                    <Icon size={22} strokeWidth={1.8} />
                  </span>
                  <span className="cn-topic-text">
                    <strong>{t.title}</strong>
                    <small>{t.line}</small>
                  </span>
                  {t.hasReport ? (
                    <span className="cn-topic-tag has-report">+ your report</span>
                  ) : (
                    <span className="cn-topic-tag open">Open</span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="cn-pick" key={topic.id} style={{ '--accent': topic.accent }}>
            <div className="cn-pick-main">
              <div className="cn-pick-head">
                <span className="cn-pick-ico" style={{ background: topic.bg, color: topic.fg }}>
                  <Icon size={26} strokeWidth={1.8} />
                </span>
                <div className="cn-pick-headtext">
                  <small>You chose</small>
                  <h3>{topic.title}</h3>
                  <p>{topic.line}</p>
                </div>
                {topic.hasReport ? (
                  <span className="cn-topic-tag has-report">+ your report</span>
                ) : (
                  <span className="cn-topic-tag open">Open</span>
                )}
              </div>

              <p className="cn-pick-note">{reportNote}</p>

              <div className="cn-pick-preview">
                <span className="cn-pick-label">
                  <Sparkles size={13} /> How {ADVISOR.name} opens
                </span>
                <p>&ldquo;{script.lines[0].text}&rdquo;</p>
              </div>

              {contextLink && (
                <Link className="cn-pick-link" to={contextLink.to}>
                  {contextLink.label} <ArrowRight size={14} />
                </Link>
              )}
            </div>

            <aside className="cn-pick-side">
              <div className="cn-pick-cost">
                <Clock size={16} />
                <div>
                  <strong>{minutes === Infinity ? '∞' : minutes} min</strong>
                  <small>available this cycle</small>
                </div>
              </div>
              <p className="cn-pick-costnote">
                Sessions draw from your minutes · ~15 min is typical · stop anytime.
              </p>
              <button
                className="btn btn-primary cn-start"
                onClick={startCall}
                disabled={minutes <= 0}
              >
                <PhoneCall size={18} /> Start session with {ADVISOR.name}
              </button>
              <button className="cn-pick-topup" onClick={() => setBuyOpen(true)}>
                {minutes <= 0 ? (
                  'Out of minutes — top up to start'
                ) : (
                  <>
                    <Plus size={13} /> Top up minutes
                  </>
                )}
              </button>
            </aside>
          </div>
        </section>

        {PAST_SESSIONS.length > 0 && (
          <section className="cn-section">
            <h2 className="rp-h2 on-night">Past sessions</h2>
            <div className="cn-past">
              {PAST_SESSIONS.map((s) => (
                <div className="cn-past-row" key={s.id}>
                  <span className="cn-past-date">{fmtSessionDate(s.date)}</span>
                  <div className="cn-past-info">
                    <strong>{s.topic}</strong>
                    <small>{s.note}</small>
                  </div>
                  <span className="cn-past-min">{s.minutes} min</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Toasts toast={toast} />
      {buyOpen && (
        <BuyMinutes
          pack={pack}
          setPack={setPack}
          step={buyStep}
          onConfirm={confirmBuy}
          onFinish={finishBuy}
          onClose={() => {
            setBuyOpen(false)
            setBuyStep('offer')
          }}
        />
      )}
    </main>
  )
}

function Toasts({ toast }) {
  return (
    <div className="ap-toast-zone" aria-live="polite">
      {toast && (
        <p className="ap-toast">
          <Check size={14} /> {toast}
        </p>
      )}
    </div>
  )
}

function BuyMinutes({ pack, setPack, step, onConfirm, onFinish, onClose }) {
  return (
    <div
      className="ap-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Buy counselling minutes"
      onClick={(e) => e.target === e.currentTarget && step !== 'processing' && onClose()}
    >
      <div className="ap-modal cn-buy">
        {step === 'offer' && (
          <>
            <h3>Add counselling minutes</h3>
            <p className="ap-modal-pitch">
              Use them whenever they stack on top of your plan&rsquo;s included minutes.
            </p>
            <div className="cn-packs">
              {MINUTE_PACKS.map((p) => (
                <button
                  key={p.id}
                  className={`cn-pack ${pack.id === p.id ? 'active' : ''}`}
                  onClick={() => setPack(p)}
                >
                  {p.popular && <span className="cn-pack-tag">Popular</span>}
                  <strong>{p.minutes} min</strong>
                  <span>${p.price}</span>
                </button>
              ))}
            </div>
            <div className="ap-modal-actions">
              <button className="btn btn-primary cn-buy-btn" onClick={onConfirm}>
                Buy {pack.minutes} min · ${pack.price}
              </button>
            </div>
            <p className="cn-buy-demo">Demo checkout no card is charged.</p>
            <button className="ap-modal-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </>
        )}
        {step === 'processing' && (
          <div className="ap-modal-processing">
            <Loader2 size={34} className="ap-spin" />
            <h3>Adding minutes…</h3>
            <p>Demo checkout no card, no charge.</p>
          </div>
        )}
        {step === 'done' && (
          <div className="ap-modal-done">
            <span className="ap-done-check">
              <Check size={26} />
            </span>
            <h3>{pack.minutes} minutes added</h3>
            <p>They&rsquo;re ready whenever you want to talk.</p>
            <div className="ap-modal-actions">
              <button className="btn btn-light" onClick={onFinish}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
