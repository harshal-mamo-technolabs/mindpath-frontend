import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useConversation } from '@elevenlabs/react'
import { useTranslation } from 'react-i18next'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
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

// Icon per suggestion type — the label is translated at render (counsel.suggest.*).
const SUGGEST_ICONS = {
  ebook: BookOpen,
  plan: Headphones,
  assessment: ClipboardList,
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
      <span className="vblob-ring r3" />
      <span className="vblob-core">
        <span className="vblob-aurora" />
        <span className="vblob-lobe l1" />
        <span className="vblob-lobe l2" />
        <span className="vblob-lobe l3" />
        <span className="vblob-sheen" />
      </span>
      <span className="vblob-orbit" aria-hidden="true">
        <i />
      </span>
    </div>
  )
}

const fmtClock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function CounsellingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
    onError: (e) => say(typeof e === 'string' ? e : e?.message || t('counsel.err.voiceDropped')),
  })
  const status = conversation.status
  const connected = status === 'connected'

  useEffect(() => {
    refreshTopics()
  }, [refreshTopics, token])

  const backendByKey = useMemo(() => {
    const map = {}
    for (const bt of data?.topics ?? []) map[bt.key] = bt
    return map
  }, [data])

  // Merge the rich static visuals (glyphs, colors, authored summaries) with live backend
  // signal (hasReport, the real opening line, resume availability).
  const topics = useMemo(
    () =>
      TOPICS.map((tp) => {
        const b = backendByKey[tp.key]
        const merged = {
          ...tp,
          title: t(`counsel.topics.${tp.id}.title`, tp.title),
          line: t(`counsel.topics.${tp.id}.line`, tp.line),
          hasReport: b ? b.hasReport : tp.hasReport,
          canResume: b?.canResume ?? false,
        }
        return { ...merged, opening: b?.opening ?? getSession(merged, t).lines[0].text }
      }),
    [backendByKey, t],
  )

  const topic = topics.find((tp) => tp.id === topicId) || topics[0]
  const script = useMemo(() => getSession(topic, t), [topic, t])
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
    const timer = setTimeout(() => {
      say(t('counsel.toast.minutesUp'))
      endCall()
    }, 0)
    return () => clearTimeout(timer)
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
          ? t('counsel.err.micNeeded', { name: ADVISOR.name })
          : err?.message || t('counsel.err.couldNotStart'),
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
    say(t('counsel.toast.minutesAdded', { count: pack.minutes }))
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
            {phase === 'summary'
              ? t('counsel.summary.barTitle')
              : t('counsel.call.barLive', { title: topic.title })}
          </p>
          <button
            className="take-exit"
            onClick={phase === 'summary' ? backToLobby : endCall}
            aria-label={t('counsel.call.closeAria')}
          >
            <X size={20} />
          </button>
        </header>

        {phase === 'summary' ? (
          <main className="cn-summary">
            <span className="ap-done-check cn-summary-check">
              <Check size={26} />
            </span>
            <h1>{t('counsel.summary.complete')}</h1>
            <p className="cn-summary-meta">
              {t('counsel.summary.meta', {
                title: topic.title,
                clock: fmtClock(elapsed),
                remaining,
              })}
            </p>

            <div className="cn-summary-card">
              <h3>{t('counsel.summary.talkedAbout', { name: ADVISOR.name })}</h3>
              <ul className="cn-takeaways">
                {script.takeaways.map((item) => (
                  <li key={item}>
                    <Check size={15} /> {item}
                  </li>
                ))}
              </ul>

              <Link to={script.suggest.to} className="cn-suggest cn-suggest-summary">
                <span className="cn-suggest-ico">
                  {(() => {
                    const Ico = SUGGEST_ICONS[script.suggest.type]
                    return <Ico size={18} />
                  })()}
                </span>
                <div>
                  <small>{t(`counsel.suggest.${script.suggest.type}`)}</small>
                  <strong>{script.suggest.title}</strong>
                </div>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="cn-summary-actions">
              <button className="btn btn-light" onClick={backToLobby}>
                <PhoneCall size={16} /> {t('counsel.summary.newSession')}
              </button>
              {canTopUp && (
                <button className="cn-textlink" onClick={() => setBuyOpen(true)}>
                  {t('counsel.summary.buyMore')}
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
                    <Loader2 size={14} className="ap-spin" /> {t('counsel.call.connecting')}
                  </>
                ) : speaking ? (
                  t('counsel.call.speaking')
                ) : (
                  t('counsel.call.listening')
                )}
              </p>
            </div>

            {/* transcript */}
            <div className="cn-transcript" ref={transcriptRef}>
              <p className="cn-grounded-note">
                <Sparkles size={13} />{' '}
                {topic.hasReport
                  ? t('counsel.call.groundedReport', { name: ADVISOR.name, title: topic.title })
                  : topic.open
                    ? t('counsel.call.groundedOpen', { name: ADVISOR.name })
                    : t('counsel.call.groundedNone', { name: ADVISOR.name })}
              </p>
              {messages.map((line, i) => (
                <div key={i} className={`cn-msg ${line.who}`}>
                  <span className="cn-msg-who">
                    {line.who === 'advisor' ? ADVISOR.name : t('counsel.call.you')}
                  </span>
                  <p>{line.text}</p>
                </div>
              ))}
              {connected && messages.length === 0 && (
                <p className="cn-grounded-note">{t('counsel.call.sayHello')}</p>
              )}
            </div>

            {/* controls */}
            <div className="cn-controls">
              <div className="cn-timer">
                <Clock size={14} />
                <strong>{fmtClock(elapsed)}</strong>
                <span>· {t('counsel.call.minLeft', { remaining })}</span>
              </div>
              <div className="cn-control-btns">
                <div className="cn-ctrl-wrap">
                  <button
                    className={`cn-ctrl ${conversation.isMuted ? 'active' : ''}`}
                    onClick={() => conversation.setMuted(!conversation.isMuted)}
                    aria-label={conversation.isMuted ? t('counsel.call.unmute') : t('counsel.call.mute')}
                  >
                    {conversation.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <span className="cn-ctrl-label">
                    {conversation.isMuted ? t('counsel.call.unmute') : t('counsel.call.mute')}
                  </span>
                </div>
                <div className="cn-ctrl-wrap">
                  <button className="cn-ctrl cn-end" onClick={endCall} aria-label={t('counsel.call.endAria')}>
                    <PhoneOff size={22} />
                  </button>
                  <span className="cn-ctrl-label">{t('counsel.call.end')}</span>
                </div>
                {canTopUp && (
                  <div className="cn-ctrl-wrap">
                    <button
                      className="cn-ctrl"
                      onClick={() => setBuyOpen(true)}
                      aria-label={t('counsel.call.addMinutesAria')}
                    >
                      <Plus size={20} />
                    </button>
                    <span className="cn-ctrl-label">{t('counsel.call.minutes')}</span>
                  </div>
                )}
              </div>
              {remaining <= 5 && (
                <p className="cn-low">
                  <Zap size={13} />{' '}
                  {remaining <= 1 ? t('counsel.call.lowAlmost') : t('counsel.call.lowRunning')}
                  {canTopUp ? (
                    <button className="cn-low-topup" onClick={() => setBuyOpen(true)}>
                      {t('counsel.call.lowTopup')}
                    </button>
                  ) : (
                    t('counsel.call.lowWrap', { name: ADVISOR.name })
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
  const contextLink = topic.hasReport
    ? { to: '/reports', label: t('counsel.lobby.viewReport', { title: topic.title }) }
    : topic.assessmentId
      ? {
          to: `/assessments/${topic.assessmentId}`,
          label: t('counsel.lobby.takeAssessment', { title: topic.title }),
        }
      : null

  const minutesLabel = !isAuthenticated ? null : minutesAvail == null ? '—' : minutesAvail

  return (
    <main className="cn">
      <div className="container">
        <Reveal as="header" className="cn-hero">
          <span className="eyebrow on-dark">{t('counsel.lobby.eyebrow')}</span>
          <h1 className="cn-title">
            {t('counsel.lobby.titleA')} <em>{t('counsel.lobby.titleEm')}</em>
          </h1>
          <p className="cn-lede">{t('counsel.lobby.lede', { name: ADVISOR.name })}</p>
          <div className="cn-minutes-pill">
            <Clock size={15} />
            {isAuthenticated ? (
              <>
                <strong>
                  {minutesLabel} {t('counsel.lobby.minutesWord')}
                </strong>{' '}
                {t('counsel.lobby.availableThisCycle')}
              </>
            ) : (
              <>
                <Link to="/login?next=/counselling" style={{ color: 'inherit', fontWeight: 700 }}>
                  {t('counsel.lobby.signIn')}
                </Link>{' '}
                {t('counsel.lobby.signInPost')}
              </>
            )}
            {canTopUp && (
              <button onClick={() => setBuyOpen(true)}>
                <Plus size={13} /> {t('counsel.lobby.topUp')}
              </button>
            )}
          </div>
        </Reveal>

        <section className="cn-studio">
          <div className="cn-studio-topics">
            <h2 className="rp-h2 on-night">
              <Sparkles size={18} /> {t('counsel.lobby.whatTalk')}
            </h2>
            <div className="cn-topics">
              {topics.map((tp, i) => {
                const TIcon = tp.icon
                return (
                  <button
                    key={tp.id}
                    className={`cn-topic ${topicId === tp.id ? 'active' : ''}`}
                    onClick={() => {
                      setTopicId(tp.id)
                      setResume(false)
                    }}
                    style={{ '--accent': tp.accent, animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  >
                    <span className="cn-topic-ico" style={{ background: tp.bg, color: tp.fg }}>
                      <TIcon size={22} strokeWidth={1.8} />
                    </span>
                    <span className="cn-topic-text">
                      <strong>{tp.title}</strong>
                      <small>{tp.line}</small>
                    </span>
                    {tp.hasReport && (
                      <span className="cn-topic-tag has-report">{t('counsel.lobby.yourReport')}</span>
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
                  <small>{t('counsel.setup.yourSession')}</small>
                  <h3>{topic.title}</h3>
                </div>
                {topic.hasReport && (
                  <span className="cn-topic-tag has-report">{t('counsel.lobby.yourReport')}</span>
                )}
              </div>

              <div className="cn-pick-preview">
                <span className="cn-pick-label">
                  <Sparkles size={13} /> {t('counsel.setup.howOpens', { name: ADVISOR.name })}
                </span>
                <p>&ldquo;{topic.opening}&rdquo;</p>
              </div>

              {languages.length > 1 && (
                <div className="cn-lang">
                  <span className="cn-lang-label">{t('counsel.setup.talkIn')}</span>
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
                  {t('counsel.setup.resume')}
                </label>
              )}

              <div className="cn-setup-foot">
                <button
                  className="btn btn-primary cn-start"
                  onClick={startCall}
                  disabled={isAuthenticated && minutesAvail != null && minutesAvail < 1}
                >
                  <PhoneCall size={18} /> {t('counsel.setup.start', { name: ADVISOR.name })}
                </button>
                <p className="cn-setup-meta">
                  {isAuthenticated && minutesLabel != null && minutesLabel !== '—' ? (
                    <>
                      <strong>{t('counsel.setup.metaMin', { minutes: minutesLabel })}</strong>{' '}
                      {t('counsel.setup.metaAvail')}
                    </>
                  ) : (
                    t('counsel.setup.metaNoAuth')
                  )}
                </p>
                {canTopUp && minutesAvail != null && minutesAvail < 1 && (
                  <button className="cn-pick-topup" onClick={() => setBuyOpen(true)}>
                    {t('counsel.setup.outOfMinutes')}
                  </button>
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

// Dark Card Element style for the top-up modal (card-only — no Link/contact fields).
const CARD_STYLE = {
  hidePostalCode: true,
  style: {
    base: {
      fontFamily: 'Manrope, sans-serif',
      fontSize: '15px',
      fontWeight: '600',
      color: '#ece9fa',
      '::placeholder': { color: '#8a83a8', fontWeight: '500' },
    },
    invalid: { color: '#e2725b' },
  },
}

/* Stripe card confirmation for a top-up (Stripe billing mode only). */
function TopUpCard({ clientSecret, onDone, onError }) {
  const { t } = useTranslation()
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)

  async function pay(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    onError('')
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    })
    if (error) {
      onError(error.message || t('counsel.buy.cardError'))
      setSubmitting(false)
      return
    }
    onDone()
  }

  return (
    <form onSubmit={pay} className="checkout-form">
      <label className="apl-payform-label">{t('counsel.buy.cardDetails')}</label>
      <div className="apl-cardfield">
        <CardElement options={CARD_STYLE} />
      </div>
      <button className="btn btn-primary cn-buy-btn" disabled={!stripe || submitting}>
        {submitting ? (
          <>
            <Loader2 size={17} className="ap-spin" /> {t('counsel.buy.processing')}
          </>
        ) : (
          <>
            <Lock size={16} /> {t('counsel.buy.payAdd')}
          </>
        )}
      </button>
    </form>
  )
}

function BuyMinutes({ pack, setPack, pricing, onFinish, onClose }) {
  const { t } = useTranslation()
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
          if (!stripe) throw new Error(t('counsel.buy.noStripe'))
          const { error } = await stripe.confirmCardPayment(res.clientSecret, {
            payment_method: selectedCardId,
          })
          if (error) throw new Error(error.message || t('counsel.buy.cardError'))
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
      setErr(e?.message || t('counsel.buy.topupError'))
      setStep('offer')
    }
  }

  const payLabel = isMsisdnMode
    ? t('counsel.buy.payLabelMsisdn', { minutes: pack.minutes, price: priceOf(pack.minutes) })
    : !useNewCard && selectedCard
      ? t('counsel.buy.payLabelCard', {
          price: priceOf(pack.minutes),
          brand: selectedCard.brand,
          last4: selectedCard.last4,
        })
      : t('counsel.buy.payLabelContinue', { price: priceOf(pack.minutes) })

  return (
    <div
      className="ap-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t('counsel.buy.dialogAria')}
      onClick={(e) => e.target === e.currentTarget && step !== 'processing' && onClose()}
    >
      <div className="ap-modal cn-buy">
        {step === 'offer' && (
          <>
            <h3>{t('counsel.buy.addMinutes')}</h3>
            <p className="ap-modal-pitch">{t('counsel.buy.pitch')}</p>
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
                  {p.popular && <span className="cn-pack-tag">{t('counsel.buy.popular')}</span>}
                  <strong>{t('counsel.buy.packMin', { minutes: p.minutes })}</strong>
                  <span>{priceOf(p.minutes)}</span>
                </button>
              ))}
            </div>

            {!isMsisdnMode && !useNewCard && selectedCard && (
              <div className="cn-paywith">
                <span>
                  {t('counsel.buy.payingWith', {
                    brand: selectedCard.brand,
                    last4: selectedCard.last4,
                  })}
                </span>
                <button type="button" onClick={() => setUseNewCard(true)}>
                  {t('counsel.buy.differentCard')}
                </button>
              </div>
            )}
            {!isMsisdnMode && useNewCard && cards.length > 0 && (
              <div className="cn-paywith">
                <button type="button" onClick={() => setUseNewCard(false)}>
                  {t('counsel.buy.savedCard')}
                </button>
              </div>
            )}

            <div className="ap-modal-actions">
              <button className="btn btn-primary cn-buy-btn" onClick={confirm} disabled={!cardsLoaded}>
                {cardsLoaded ? (
                  payLabel
                ) : (
                  <>
                    <Loader2 size={16} className="ap-spin" /> {t('counsel.buy.checkingCard')}
                  </>
                )}
              </button>
            </div>
            <p className="cn-buy-demo">
              {isMsisdnMode ? t('counsel.buy.chargedMobile') : t('counsel.buy.securedStripe')}
            </p>
            <button className="ap-modal-close" onClick={onClose} aria-label={t('counsel.buy.close')}>
              <X size={18} />
            </button>
          </>
        )}
        {step === 'processing' && (
          <div className="ap-modal-processing">
            <Loader2 size={34} className="ap-spin" />
            <h3>{t('counsel.buy.addingMinutes')}</h3>
            <p>{isMsisdnMode ? t('counsel.buy.checkingPhone') : t('counsel.buy.confirmingPayment')}</p>
          </div>
        )}
        {step === 'card' && clientSecret && (
          <>
            <h3>{t('counsel.buy.payFor', { count: pack.minutes })}</h3>
            {err && (
              <p className="checkout-error" role="alert">
                {err}
              </p>
            )}
            <div style={{ marginTop: 16 }}>
              <Elements stripe={stripePromise}>
                <TopUpCard
                  clientSecret={clientSecret}
                  onDone={() => setStep('done')}
                  onError={setErr}
                />
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
                {t('counsel.buy.savedCardInstead')}
              </button>
            )}
            <button className="ap-modal-close" onClick={onClose} aria-label={t('counsel.buy.close')}>
              <X size={18} />
            </button>
          </>
        )}
        {step === 'done' && (
          <div className="ap-modal-done">
            <span className="ap-done-check">
              <Check size={26} />
            </span>
            <h3>{t('counsel.buy.doneAdded', { count: pack.minutes })}</h3>
            <p>{t('counsel.buy.ready')}</p>
            <div className="ap-modal-actions">
              <button className="btn btn-light" onClick={onFinish}>
                {t('counsel.buy.done')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
