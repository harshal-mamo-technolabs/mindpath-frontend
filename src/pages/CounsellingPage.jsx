import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useConversation } from '@elevenlabs/react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardList,
  Clock,
  Headphones,
  Loader2,
  Lock,
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
import { useAuth } from '../hooks/useAuth.js'
import { isMsisdnMode } from '../lib/billingMode.js'
import { stripePromise } from '../lib/stripe.js'
import { getPaymentMethods } from '../lib/payments.js'
import { ADVISOR, getSession, MINUTE_PACKS, TOPICS } from '../data/counselling.js'
import {
  endCounsellingSession,
  getCounsellingTopics,
  startCounsellingSession,
  topUpCounselling,
} from '../lib/counsellingApi.js'

const SUGGEST_META = {
  ebook: { icon: BookOpen, label: 'Suggested ebook' },
  plan: { icon: Headphones, label: 'Suggested session' },
  assessment: { icon: ClipboardList, label: 'Suggested assessment' },
}

const LANG_LABELS = { en: 'English', hi: 'हिन्दी', de: 'Deutsch', fr: 'Français', es: 'Español' }

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
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuth()

  const [phase, setPhase] = useState('lobby') // lobby | call | summary
  const [topicId, setTopicId] = useState(TOPICS[0].id)
  const [data, setData] = useState(null) // backend topics response
  const [language, setLanguage] = useState(null)
  const [resume, setResume] = useState(false)
  const [messages, setMessages] = useState([]) // { who: 'advisor' | 'you', text }
  const [elapsed, setElapsed] = useState(0)
  const [buyOpen, setBuyOpen] = useState(false)
  const [pack, setPack] = useState(MINUTE_PACKS[1])
  const [toast, setToast] = useState(null)
  const [minutesAtStart, setMinutesAtStart] = useState(0)

  const startedAtRef = useRef(null)
  const convIdRef = useRef(null)
  const sessionRef = useRef(null)
  const finishingRef = useRef(false)
  const endingRef = useRef(false)
  const warnedRef = useRef(false)
  const transcriptRef = useRef(null)
  const toastTimer = useRef(null)

  const say = useCallback((msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 3600)
  }, [])

  // ---- backend topics (public; richer when signed in) ----
  const refreshTopics = useCallback(() => {
    getCounsellingTopics()
      .then(setData)
      .catch(() => {})
  }, [])

  // Finalize a call exactly once — report the end (so minutes reconcile) and move to the
  // summary. Runs whether the USER ends it or SOL / the connection ends it (onDisconnect),
  // guarded so the two triggers don't double-fire.
  const finalizeCall = useCallback(() => {
    if (finishingRef.current) return
    if (!sessionRef.current && !startedAtRef.current) return
    finishingRef.current = true
    const s = sessionRef.current
    if (s?.sessionId) {
      const durationSeconds = startedAtRef.current
        ? Math.round((Date.now() - startedAtRef.current) / 1000)
        : undefined
      endCounsellingSession(s.sessionId, {
        conversationId: convIdRef.current || undefined,
        durationSeconds,
      }).catch(() => {})
    }
    sessionRef.current = null
    startedAtRef.current = null
    convIdRef.current = null
    setPhase('summary')
    refreshTopics()
  }, [refreshTopics])

  // ---- ElevenLabs voice conversation ----
  const conversation = useConversation({
    onConnect: (p) => {
      startedAtRef.current = Date.now()
      if (p?.conversationId) convIdRef.current = p.conversationId
    },
    onMessage: (p) => {
      if (p?.message)
        setMessages((prev) => [...prev, { who: p.source === 'user' ? 'you' : 'advisor', text: p.message }])
    },
    // Sol can hang up itself (end-call tool), or the connection can drop — end the UI too.
    onDisconnect: () => finalizeCall(),
    onError: (e) => say(typeof e === 'string' ? e : e?.message || 'The voice connection dropped.'),
  })
  const status = conversation.status
  const connected = status === 'connected'

  useEffect(() => {
    refreshTopics()
  }, [refreshTopics, token])

  const backendByKey = useMemo(() => {
    const map = {}
    for (const t of data?.topics ?? []) map[t.key] = t
    return map
  }, [data])

  // Merge the rich static visuals (glyphs, colors, authored summaries) with live backend
  // signal (hasReport, the real opening line, resume availability).
  const topics = useMemo(
    () =>
      TOPICS.map((t) => {
        const b = backendByKey[t.key]
        return {
          ...t,
          hasReport: b ? b.hasReport : t.hasReport,
          canResume: b?.canResume ?? false,
          opening: b?.opening ?? getSession(t).lines[0].text,
        }
      }),
    [backendByKey],
  )

  const topic = topics.find((t) => t.id === topicId) || topics[0]
  const script = useMemo(() => getSession(topic), [topic])
  const languages = data?.languages ?? ['en']
  const lang = language ?? languages[0]
  const pricing = data?.pricing ?? null
  const minutesAvail = data?.minutes?.available ?? null // number when signed in, else null
  // MSISDN users buy minutes via their carrier plan, not here — no counselling top-ups.
  const canTopUp = isAuthenticated && !isMsisdnMode

  const speaking = phase === 'call' && connected && conversation.isSpeaking
  const remaining = Math.max(0, (minutesAtStart || 0) - Math.ceil(elapsed / 60))

  // call timer (only while actually connected)
  useEffect(() => {
    if (phase !== 'call' || !connected) return
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [phase, connected])

  // About a minute left → nudge Sol to bring the conversation to a warm close (once).
  useEffect(() => {
    if (phase !== 'call' || !connected || warnedRef.current || remaining > 1) return
    warnedRef.current = true
    try {
      conversation.sendContextualUpdate?.(
        "The user's session time is almost up — about a minute left. Gently begin bringing the conversation to a warm close and say your goodbyes soon.",
      )
    } catch {
      /* SDK not ready — the hard stop below still applies */
    }
  }, [phase, connected, remaining, conversation])

  // Allowance spent → gracefully end the call (backstop if Sol hasn't wrapped up itself).
  // Deferred so a same-tick top-up (which lifts `remaining`) cancels it via the cleanup.
  useEffect(() => {
    if (phase !== 'call' || !connected || remaining > 0) return
    const t = setTimeout(() => {
      say('Your minutes are up — the session has ended.')
      endCall()
    }, 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, connected, remaining])

  // autoscroll transcript
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  async function startCall() {
    if (!isAuthenticated) {
      navigate('/login?next=/counselling')
      return
    }
    if (minutesAvail != null && minutesAvail < 1) {
      if (canTopUp) setBuyOpen(true)
      return
    }
    setMessages([])
    setElapsed(0)
    setMinutesAtStart(minutesAvail ?? 0)
    finishingRef.current = false
    endingRef.current = false
    warnedRef.current = false
    setPhase('call')
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      const res = await startCounsellingSession({ topic: topic.key, language: lang, resume })
      sessionRef.current = res
      await conversation.startSession({
        signedUrl: res.signedUrl,
        connectionType: 'websocket',
        dynamicVariables: res.dynamicVariables,
        overrides: res.overrides,
      })
    } catch (err) {
      sessionRef.current = null
      setPhase('lobby')
      say(
        err?.name === 'NotAllowedError'
          ? 'Microphone access is needed to talk with Sol.'
          : err?.message || 'Could not start the session.',
      )
    }
  }

  async function endCall() {
    if (endingRef.current) return
    endingRef.current = true
    try {
      await conversation.endSession()
    } catch {
      /* already closed */
    }
    finalizeCall()
  }

  function backToLobby() {
    setPhase('lobby')
    setElapsed(0)
    setMessages([])
  }

  // ---- top-up ----
  function finishBuy() {
    setBuyOpen(false)
    // Topped up mid-call → extend the live allowance so the session keeps going.
    if (phase === 'call') {
      setMinutesAtStart((m) => m + pack.minutes)
      warnedRef.current = false
    }
    refreshTopics()
    say(`${pack.minutes} minutes added — talk as long as you need.`)
  }

  const buyProps = {
    pack,
    setPack,
    pricing,
    onFinish: finishBuy,
    onClose: () => setBuyOpen(false),
  }

  // ---------- CALL / SUMMARY (focused, chrome-free) ----------
  if (phase === 'call' || phase === 'summary') {
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
              {canTopUp && (
                <button className="cn-textlink" onClick={() => setBuyOpen(true)}>
                  Buy more minutes
                </button>
              )}
            </div>
          </main>
        ) : (
          <main className="cn-call">
            {/* advisor */}
            <div className="cn-call-stage">
              <VoiceBlob speaking={speaking} connecting={!connected} />
              <h2 className="cn-advisor-name">{ADVISOR.name}</h2>
              <p className="cn-advisor-state">
                {!connected ? (
                  <>
                    <Loader2 size={14} className="ap-spin" /> Connecting…
                  </>
                ) : speaking ? (
                  'Speaking…'
                ) : (
                  'Listening — take your time'
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
              {messages.map((line, i) => (
                <div key={i} className={`cn-msg ${line.who}`}>
                  <span className="cn-msg-who">{line.who === 'advisor' ? ADVISOR.name : 'You'}</span>
                  <p>{line.text}</p>
                </div>
              ))}
              {connected && messages.length === 0 && (
                <p className="cn-grounded-note">Say hello whenever you’re ready.</p>
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
                <div className="cn-ctrl-wrap">
                  <button
                    className={`cn-ctrl ${conversation.isMuted ? 'active' : ''}`}
                    onClick={() => conversation.setMuted(!conversation.isMuted)}
                    aria-label={conversation.isMuted ? 'Unmute' : 'Mute'}
                  >
                    {conversation.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <span className="cn-ctrl-label">{conversation.isMuted ? 'Unmute' : 'Mute'}</span>
                </div>
                <div className="cn-ctrl-wrap">
                  <button className="cn-ctrl cn-end" onClick={endCall} aria-label="End session">
                    <PhoneOff size={22} />
                  </button>
                  <span className="cn-ctrl-label">End</span>
                </div>
                {canTopUp && (
                  <div className="cn-ctrl-wrap">
                    <button className="cn-ctrl" onClick={() => setBuyOpen(true)} aria-label="Add minutes">
                      <Plus size={20} />
                    </button>
                    <span className="cn-ctrl-label">Minutes</span>
                  </div>
                )}
              </div>
              {remaining <= 5 && (
                <p className="cn-low">
                  <Zap size={13} />{' '}
                  {remaining <= 1 ? 'Almost out of minutes — ' : 'Running low — '}
                  {canTopUp ? (
                    <button className="cn-low-topup" onClick={() => setBuyOpen(true)}>
                      add minutes to keep talking
                    </button>
                  ) : (
                    'Sol will bring things to a gentle close.'
                  )}
                </p>
              )}
            </div>
          </main>
        )}

        <Toasts toast={toast} />
        {buyOpen && <BuyMinutes {...buyProps} />}
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
      ? { to: `/assessments/${topic.assessmentId}`, label: `Take the ${topic.title} assessment first` }
      : null

  const minutesLabel = !isAuthenticated ? null : minutesAvail == null ? '—' : minutesAvail

  return (
    <main className="cn">
      <div className="container">
        <Reveal as="header" className="cn-hero">
          <div className="cn-hero-text">
            <span className="eyebrow on-dark">AI counselling</span>
            <h1 className="cn-title">
              Talk it through, <em>out loud.</em>
            </h1>
            <p className="cn-lede">{ADVISOR.blurb}</p>
            <div className="cn-minutes-pill">
              <Clock size={15} />
              {isAuthenticated ? (
                <>
                  <strong>{minutesLabel} minutes</strong> available this cycle
                </>
              ) : (
                <>
                  <Link to="/login?next=/counselling" style={{ color: 'inherit', fontWeight: 700 }}>
                    Sign in
                  </Link>{' '}
                  to see your minutes
                </>
              )}
              {canTopUp && (
                <button onClick={() => setBuyOpen(true)}>
                  <Plus size={13} /> Top up
                </button>
              )}
            </div>
          </div>
          <div className="cn-hero-orb" aria-hidden="true">
            <VoiceBlob />
            <span className="cn-hero-orb-label">{ADVISOR.name} · {ADVISOR.role}</span>
          </div>
        </Reveal>

        <section className="cn-studio">
          <div className="cn-studio-topics">
            <h2 className="rp-h2 on-night">
              <Sparkles size={18} /> What would you like to talk about?
            </h2>
            <p className="cn-section-sub">
              Pick whatever you&rsquo;re carrying — no report required. We&rsquo;ll show you exactly
              how the session opens before you start.
            </p>
            <div className="cn-topics">
              {topics.map((t, i) => {
                const TIcon = t.icon
                return (
                  <button
                    key={t.id}
                    className={`cn-topic ${topicId === t.id ? 'active' : ''}`}
                    onClick={() => {
                      setTopicId(t.id)
                      setResume(false)
                    }}
                    style={{ '--accent': t.accent, animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  >
                    <span className="cn-topic-ico" style={{ background: t.bg, color: t.fg }}>
                      <TIcon size={22} strokeWidth={1.8} />
                    </span>
                    <span className="cn-topic-text">
                      <strong>{t.title}</strong>
                      <small>{t.line}</small>
                    </span>
                    {t.hasReport ? (
                      <span className="cn-topic-tag has-report">Your report</span>
                    ) : (
                      <span className="cn-topic-tag open">Open</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <aside className="cn-setup">
            <div className="cn-setup-card" key={topic.id} style={{ '--accent': topic.accent }}>
              <div className="cn-setup-head">
                <span className="cn-setup-ico" style={{ background: topic.bg, color: topic.fg }}>
                  <Icon size={24} strokeWidth={1.8} />
                </span>
                <div className="cn-setup-headtext">
                  <small>Your session</small>
                  <h3>{topic.title}</h3>
                </div>
                {topic.hasReport ? (
                  <span className="cn-topic-tag has-report">Your report</span>
                ) : (
                  <span className="cn-topic-tag open">Open</span>
                )}
              </div>

              <p className="cn-setup-note">{reportNote}</p>

              <div className="cn-pick-preview">
                <span className="cn-pick-label">
                  <Sparkles size={13} /> How {ADVISOR.name} opens
                </span>
                <p>&ldquo;{topic.opening}&rdquo;</p>
              </div>

              {languages.length > 1 && (
                <div className="cn-lang">
                  <span className="cn-lang-label">Talk in</span>
                  <div className="cn-lang-opts">
                    {languages.map((code) => (
                      <button
                        key={code}
                        className={`cn-lang-opt ${lang === code ? 'active' : ''}`}
                        onClick={() => setLanguage(code)}
                      >
                        {LANG_LABELS[code] || code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {topic.canResume && (
                <label className="cn-resume">
                  <input type="checkbox" checked={resume} onChange={(e) => setResume(e.target.checked)} />
                  Pick up where we left off last time
                </label>
              )}

              <div className="cn-setup-foot">
                <button
                  className="btn btn-primary cn-start"
                  onClick={startCall}
                  disabled={isAuthenticated && minutesAvail != null && minutesAvail < 1}
                >
                  <PhoneCall size={18} /> Start session with {ADVISOR.name}
                </button>
                <p className="cn-setup-meta">
                  {isAuthenticated && minutesLabel != null && minutesLabel !== '—' ? (
                    <>
                      <strong>{minutesLabel} min</strong> available · ~15 min is typical · stop anytime
                    </>
                  ) : (
                    'Sessions draw from your minutes · ~15 min is typical · stop anytime'
                  )}
                </p>
                {canTopUp ? (
                  <button className="cn-pick-topup" onClick={() => setBuyOpen(true)}>
                    {minutesAvail != null && minutesAvail < 1 ? (
                      'Out of minutes — top up to start'
                    ) : (
                      <>
                        <Plus size={13} /> Top up minutes
                      </>
                    )}
                  </button>
                ) : (
                  isAuthenticated &&
                  minutesAvail != null &&
                  minutesAvail < 1 && (
                    <p className="cn-setup-out">You&rsquo;re out of minutes this cycle.</p>
                  )
                )}
                {contextLink && (
                  <Link className="cn-pick-link" to={contextLink.to}>
                    {contextLink.label} <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </section>

      </div>

      <Toasts toast={toast} />
      {buyOpen && <BuyMinutes {...buyProps} />}
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

/* Stripe card confirmation for a top-up (Stripe billing mode only). */
function TopUpCard({ onDone, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)

  async function pay(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    onError('')
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/counselling` },
      redirect: 'if_required',
    })
    if (error) {
      onError(error.message || 'Your card could not be charged.')
      setSubmitting(false)
      return
    }
    onDone()
  }

  return (
    <form onSubmit={pay} className="checkout-form">
      <PaymentElement options={{ paymentMethodOrder: ['card'] }} />
      <button className="btn btn-primary cn-buy-btn" disabled={!stripe || submitting}>
        {submitting ? (
          <>
            <Loader2 size={17} className="ap-spin" /> Processing…
          </>
        ) : (
          <>
            <Lock size={16} /> Pay & add minutes
          </>
        )}
      </button>
    </form>
  )
}

function BuyMinutes({ pack, setPack, pricing, onFinish, onClose }) {
  const [step, setStep] = useState('offer') // offer | processing | card | done
  const [err, setErr] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [cards, setCards] = useState([])
  const [selectedCardId, setSelectedCardId] = useState(null)
  const [useNewCard, setUseNewCard] = useState(false)
  const [cardsLoaded, setCardsLoaded] = useState(isMsisdnMode) // MSISDN needs no card lookup

  // Load the cards already on file (from plan purchase) so top-up is one-click. The pay
  // button stays disabled until this resolves — otherwise a fast click would fall through
  // to the card form before we know a saved card exists.
  useEffect(() => {
    if (isMsisdnMode) return
    let alive = true
    getPaymentMethods()
      .then((list) => {
        if (!alive) return
        const saved = list || []
        setCards(saved)
        setSelectedCardId(saved.find((c) => c.isDefault)?.id || saved[0]?.id || null)
        setUseNewCard(saved.length === 0)
        setCardsLoaded(true)
      })
      .catch(() => {
        if (!alive) return
        setUseNewCard(true)
        setCardsLoaded(true)
      })
    return () => {
      alive = false
    }
  }, [])

  const priceOf = (min) => {
    if (pricing?.perMinute != null) {
      const cur = (pricing.currency || 'eur').toUpperCase()
      return `${cur} ${(min * pricing.perMinute).toFixed(2)}`
    }
    const p = MINUTE_PACKS.find((x) => x.minutes === min)
    return `$${p?.price ?? min}`
  }

  const selectedCard = cards.find((c) => c.id === selectedCardId)

  async function confirm() {
    setErr('')
    setStep('processing')
    try {
      const res = await topUpCounselling({ minutes: pack.minutes })

      // MSISDN (carrier) — credited instantly, no card.
      if (res.credited) {
        setStep('done')
        return
      }

      if (res.requiresPayment && res.clientSecret) {
        // Reuse the card on file → one-click, no re-entry.
        if (!useNewCard && selectedCardId) {
          const stripe = await stripePromise
          if (!stripe) throw new Error('Payments are not configured (missing Stripe key).')
          const { error } = await stripe.confirmCardPayment(res.clientSecret, {
            payment_method: selectedCardId,
          })
          if (error) throw new Error(error.message || 'Your card could not be charged.')
          setStep('done')
          return
        }
        // No saved card (or "use a different card") → collect one with the Payment Element.
        setClientSecret(res.clientSecret)
        setStep('card')
        return
      }

      setStep('done')
    } catch (e) {
      setErr(e?.message || 'Could not complete the top-up.')
      setStep('offer')
    }
  }

  const payLabel = isMsisdnMode
    ? `Buy ${pack.minutes} min · ${priceOf(pack.minutes)}`
    : !useNewCard && selectedCard
      ? `Pay ${priceOf(pack.minutes)} · ${selectedCard.brand} •••• ${selectedCard.last4}`
      : `Continue to payment · ${priceOf(pack.minutes)}`

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
              Top up whenever you need — even mid-conversation. Minutes never expire.
            </p>
            {err && (
              <p className="checkout-error" role="alert">
                {err}
              </p>
            )}
            <div className="cn-packs">
              {MINUTE_PACKS.map((p) => (
                <button
                  key={p.id}
                  className={`cn-pack ${pack.id === p.id ? 'active' : ''}`}
                  onClick={() => setPack(p)}
                >
                  {p.popular && <span className="cn-pack-tag">Popular</span>}
                  <strong>{p.minutes} min</strong>
                  <span>{priceOf(p.minutes)}</span>
                </button>
              ))}
            </div>

            {!isMsisdnMode && !useNewCard && selectedCard && (
              <div className="cn-paywith">
                <span>
                  Paying with {selectedCard.brand} •••• {selectedCard.last4}
                </span>
                <button type="button" onClick={() => setUseNewCard(true)}>
                  Use a different card
                </button>
              </div>
            )}
            {!isMsisdnMode && useNewCard && cards.length > 0 && (
              <div className="cn-paywith">
                <button type="button" onClick={() => setUseNewCard(false)}>
                  ← Use saved card
                </button>
              </div>
            )}

            <div className="ap-modal-actions">
              <button className="btn btn-primary cn-buy-btn" onClick={confirm} disabled={!cardsLoaded}>
                {cardsLoaded ? (
                  payLabel
                ) : (
                  <>
                    <Loader2 size={16} className="ap-spin" /> Checking your saved card…
                  </>
                )}
              </button>
            </div>
            <p className="cn-buy-demo">
              {isMsisdnMode ? 'Charged to your mobile bill.' : 'Secured by Stripe.'}
            </p>
            <button className="ap-modal-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </>
        )}
        {step === 'processing' && (
          <div className="ap-modal-processing">
            <Loader2 size={34} className="ap-spin" />
            <h3>Adding minutes…</h3>
            <p>{isMsisdnMode ? 'Confirming with your carrier.' : 'Confirming your payment.'}</p>
          </div>
        )}
        {step === 'card' && clientSecret && (
          <>
            <h3>Pay for {pack.minutes} minutes</h3>
            {err && (
              <p className="checkout-error" role="alert">
                {err}
              </p>
            )}
            <div style={{ marginTop: 16 }}>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <TopUpCard onDone={() => setStep('done')} onError={setErr} />
              </Elements>
            </div>
            {cards.length > 0 && (
              <button
                type="button"
                className="cn-textlink"
                style={{ marginTop: 12 }}
                onClick={() => {
                  setUseNewCard(false)
                  setStep('offer')
                }}
              >
                ← Use saved card instead
              </button>
            )}
            <button className="ap-modal-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </>
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
