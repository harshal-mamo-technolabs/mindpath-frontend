import { useEffect, useRef, useState } from 'react'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import {
  ArrowRight,
  Check,
  CreditCard,
  Headphones,
  Loader2,
  Lock,
  Pause,
  Play,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react'
import { isStripeMode } from '../../lib/billingMode.js'
import { stripeConfigured, stripePromise } from '../../lib/stripe.js'
import { getPaymentMethods } from '../../lib/payments.js'
import {
  addToPath,
  getAudioProgram,
  getMyPrograms,
  listAudioPrograms,
  startAudioProgram,
} from '../../lib/audioProgramsApi.js'
import '../../styles/pages/audioPrograms.css'

/* The standalone, purchasable audio library shown on /audio — separate from the
   AI-generated daily plan. Lists programs, opens one in a modal to preview/play tracks,
   unlocks paid ones with a one-time charge (reusing the user's saved card for one-click),
   and adds owned/free programs to "your path". */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const idOf = (p) => p._id || p.id
const titleCase = (s) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase())

// Same named cover classes (gradient + orb) the generated plans use, for a matching look.
const COVERS = ['cover-violet', 'cover-tide', 'cover-meadow', 'cover-dusk', 'cover-ember']
const coverFor = (i) => COVERS[i % COVERS.length]

const fmtLen = (s) => {
  if (!s) return ''
  const m = Math.floor(s / 60)
  const sec = Math.round(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

const priceTag = (p) => `€${Number(p.price || 0).toFixed(2)}`

// Badge shown on a card cover: the user's relationship to this program.
const badgeFor = (p) => {
  if (p.isFree) return { label: 'Free', tone: 'free' }
  if (p.unlocked) return { label: isStripeMode ? 'Owned' : 'Included', tone: 'owned' }
  return { label: priceTag(p), tone: 'price' }
}

/* ---- new-card form (must live inside <Elements>) ---- */
function NewCardForm({ clientSecret, label, onPaid, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setBusy(true)
    onError('')
    const card = elements.getElement(CardElement)
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    })
    if (error) {
      onError(error.message || 'Your card could not be charged. Try another card.')
      setBusy(false)
      return
    }
    if (paymentIntent) await onPaid()
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="apl-payform">
      <label className="apl-payform-label">Card details</label>
      <div className="apl-cardfield">
        <CardElement
          options={{
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
          }}
        />
      </div>
      <button className="btn btn-primary apl-paybtn" disabled={!stripe || busy}>
        {busy ? (
          <>
            <Loader2 size={15} className="ap-spin" /> Processing…
          </>
        ) : (
          <>
            <Lock size={15} /> Pay {label}
          </>
        )}
      </button>
    </form>
  )
}

/* ---- payment step: one-click with a saved card, or a new card ---- */
function ProgramPay({ clientSecret, amount, onPaid }) {
  const [cards, setCards] = useState(null) // null = loading
  const [selected, setSelected] = useState(null)
  const [useNew, setUseNew] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const label = `€${Number(amount || 0).toFixed(2)}`

  useEffect(() => {
    let alive = true
    getPaymentMethods()
      .then((list) => {
        if (!alive) return
        const arr = list || []
        setCards(arr)
        setSelected(arr.find((c) => c.isDefault)?.id || arr[0]?.id || null)
        setUseNew(arr.length === 0)
      })
      .catch(() => {
        if (alive) {
          setCards([])
          setUseNew(true)
        }
      })
    return () => {
      alive = false
    }
  }, [])

  async function paySaved() {
    if (!selected) return
    setBusy(true)
    setError('')
    try {
      const stripe = await stripePromise
      if (!stripe) throw new Error('Payments are not configured (missing Stripe key).')
      const { error: err } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: selected,
      })
      if (err) throw new Error(err.message || 'Your card could not be charged.')
      await onPaid()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (!stripeConfigured) {
    return (
      <p className="apl-error">
        Payments aren’t configured — add VITE_STRIPE_PUBLISHABLE_KEY and restart.
      </p>
    )
  }
  if (cards === null) {
    return (
      <div className="apl-pay-loading">
        <Loader2 size={18} className="ap-spin" /> Preparing secure checkout…
      </div>
    )
  }

  return (
    <div className="apl-pay">
      {error && <p className="apl-error">{error}</p>}

      {!useNew && cards.length > 0 ? (
        <>
          <div className="apl-pay-cards">
            {cards.map((c) => (
              <button
                type="button"
                key={c.id}
                className={`apl-pay-card ${selected === c.id ? 'selected' : ''}`}
                onClick={() => setSelected(c.id)}
                aria-pressed={selected === c.id}
              >
                <CreditCard size={17} />
                <span className="apl-pay-card-info">
                  <strong>
                    {titleCase(c.brand)} •••• {c.last4}
                  </strong>
                  <small>
                    Expires {String(c.expMonth).padStart(2, '0')}/{c.expYear}
                    {c.isDefault ? ' · default' : ''}
                  </small>
                </span>
                {selected === c.id && <Check size={15} className="apl-pay-check" />}
              </button>
            ))}
          </div>
          <button className="btn btn-primary apl-paybtn" onClick={paySaved} disabled={busy || !selected}>
            {busy ? (
              <>
                <Loader2 size={15} className="ap-spin" /> Processing…
              </>
            ) : (
              <>
                <Lock size={15} /> Pay {label}
              </>
            )}
          </button>
          <button type="button" className="apl-pay-switch" onClick={() => setUseNew(true)}>
            Use a new card instead
          </button>
        </>
      ) : (
        <>
          <Elements stripe={stripePromise}>
            <NewCardForm clientSecret={clientSecret} label={label} onPaid={onPaid} onError={setError} />
          </Elements>
          {cards.length > 0 && (
            <button type="button" className="apl-pay-switch" onClick={() => setUseNew(false)}>
              ← Use a saved card
            </button>
          )}
        </>
      )}

      <p className="apl-pay-secure">
        <ShieldCheck size={13} /> Secured by Stripe · 3D Secure handled automatically.
      </p>
    </div>
  )
}

export default function AudioPrograms({ pathKey = 0, onChange }) {
  const [programs, setPrograms] = useState(null) // null = loading
  const [listError, setListError] = useState('')

  const [detail, setDetail] = useState(null) // full program (with clips)
  const [detailBusy, setDetailBusy] = useState(false)

  const [unlocking, setUnlocking] = useState(false)
  const [pay, setPay] = useState(null) // { clientSecret, amount, programId }
  const [payError, setPayError] = useState('')

  const [inPath, setInPath] = useState(() => new Set())
  const [adding, setAdding] = useState(false)

  // one shared audio element for the library preview
  const audioRef = useRef(null)
  const [now, setNow] = useState(null) // { programId, order, title }
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    let alive = true
    listAudioPrograms()
      .then((d) => alive && setPrograms(d || []))
      .catch((e) => alive && setListError(e.message))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    getMyPrograms()
      .then((d) => alive && setInPath(new Set((d || []).map((p) => String(p.id)))))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [pathKey])

  const addPath = async (program) => {
    setAdding(true)
    setPayError('')
    try {
      await addToPath(idOf(program))
      setInPath((s) => new Set(s).add(String(idOf(program))))
      onChange?.()
    } catch (e) {
      setPayError(e.message)
    } finally {
      setAdding(false)
    }
  }

  const openDetail = async (id) => {
    setDetailBusy(true)
    setPayError('')
    try {
      setDetail(await getAudioProgram(id))
    } catch (e) {
      setListError(e.message)
    } finally {
      setDetailBusy(false)
    }
  }

  const closeDetail = () => {
    audioRef.current?.pause()
    setNow(null)
    setDetail(null)
    setPay(null)
    setPayError('')
  }

  const refreshDetail = async (id) => {
    const fresh = await getAudioProgram(id)
    setDetail(fresh)
    setPrograms((list) =>
      (list || []).map((p) => (idOf(p) === id ? { ...p, unlocked: fresh.unlocked } : p)),
    )
    return fresh
  }

  const playClip = (program, clip) => {
    if (clip.locked || !clip.session.audioUrl) return
    const i = (programs || []).findIndex((x) => idOf(x) === idOf(program))
    setNow({
      programId: idOf(program),
      order: clip.order,
      title: clip.session.title,
      cover: coverFor(i >= 0 ? i : 0),
    })
    const el = audioRef.current
    if (el) {
      document.querySelectorAll('audio').forEach((a) => a !== el && a.pause())
      el.src = clip.session.audioUrl
      el.play().catch(() => {})
    }
  }

  const togglePlay = () => {
    const el = audioRef.current
    if (!el || !el.src) return
    el.paused ? el.play().catch(() => {}) : el.pause()
  }

  const unlock = async (program) => {
    setUnlocking(true)
    setPayError('')
    try {
      const res = await startAudioProgram(idOf(program))
      if (!res.requiresPayment) {
        await refreshDetail(idOf(program))
        return
      }
      setPay({ clientSecret: res.clientSecret, amount: res.amount, programId: idOf(program) })
    } catch (e) {
      setPayError(e.message)
    } finally {
      setUnlocking(false)
    }
  }

  const onPaid = async () => {
    const id = pay.programId
    for (let i = 0; i < 10; i += 1) {
      const res = await startAudioProgram(id)
      if (!res.requiresPayment) break
      await sleep(1200)
    }
    await refreshDetail(id)
    setPay(null)
  }

  if (listError) {
    return (
      <section className="ap-section apl-store">
        <div className="container">
          <p className="apl-error">Couldn’t load the audio library — {listError}</p>
        </div>
      </section>
    )
  }

  if (programs !== null && programs.length === 0) return null

  const detailIdx = detail ? (programs || []).findIndex((x) => idOf(x) === idOf(detail)) : -1
  const detailCover = coverFor(detailIdx >= 0 ? detailIdx : 0)

  return (
    <section className="ap-section apl-store">
      <div className="container">
        <div className="ap-section-head">
          <h2 className="rp-h2 on-night">
            <Headphones size={19} /> Audio library
          </h2>
        </div>
        <p className="apl-store-sub">
          Guided programs you can start anytime — standalone audio journeys, no assessment needed.
          Some are free; others unlock with a one-time purchase.
        </p>

        {programs === null ? (
          <div className="apl-loading">
            <Loader2 size={22} className="ap-spin" /> Loading the library…
          </div>
        ) : (
          <div className="ap-plans-grid">
            {programs.map((p, i) => {
              const badge = badgeFor(p)
              const owned = p.isFree || p.unlocked
              return (
                <article key={idOf(p)} className="ap-plan-card apl-store-card" onClick={() => openDetail(idOf(p))}>
                  <div className={`ap-plan-cover ${coverFor(i)}`}>
                    <span className={`apl-cover-badge ${badge.tone}`}>{badge.label}</span>
                    {inPath.has(String(idOf(p))) && (
                      <span className="apl-path-tag">
                        <Check size={11} /> In your path
                      </span>
                    )}
                  </div>
                  <div className="ap-plan-body">
                    <h3>{p.title}</h3>
                    <p className="apl-store-desc">{p.subDescription || p.description}</p>
                    <div className="apl-store-meta">
                      {p.clipsCount} {p.clipsCount === 1 ? 'track' : 'tracks'}
                      {p.totalMinutes ? ` · ${p.totalMinutes} min` : ''}
                    </div>
                    <div className="ap-plan-actions">
                      <button
                        className="ap-btn-play"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDetail(idOf(p))
                        }}
                      >
                        {owned ? (
                          <>
                            <Play size={14} fill="currentColor" strokeWidth={0} /> Open
                          </>
                        ) : (
                          <>
                            <Lock size={14} /> Unlock · {priceTag(p)}
                          </>
                        )}
                      </button>
                      <button
                        className="ap-plan-view"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDetail(idOf(p))
                        }}
                      >
                        Details <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {/* shared (hidden) audio element for previews */}
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      {/* ===== program detail modal (matches the plan detail modal) ===== */}
      {(detail || detailBusy) && (
        <div className="ap-modal-overlay" onClick={closeDetail}>
          <div className="ap-modal ap-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ap-modal-close" onClick={closeDetail} aria-label="Close">
              <X size={18} />
            </button>

            {detailBusy || !detail ? (
              <div className="apl-loading">
                <Loader2 size={22} className="ap-spin" /> Loading…
              </div>
            ) : (
              <>
                <div className={`ap-modal-cover ${detailCover}`} aria-hidden="true" />
                <p className="ap-kicker">
                  {detail.author} · {detail.clipsCount} {detail.clipsCount === 1 ? 'track' : 'tracks'}
                  {detail.totalMinutes ? ` · ${detail.totalMinutes} min` : ''} ·{' '}
                  {detail.isFree ? 'Free' : detail.unlocked ? 'Unlocked' : priceTag(detail)}
                </p>
                <h3>{detail.title}</h3>
                <p className="ap-modal-pitch">{detail.description}</p>

                {/* Unlock CTA — paid, not-yet-owned, before the payment step opens */}
                {isStripeMode && !detail.isFree && !detail.unlocked && !pay && (
                  <div className="apl-unlock">
                    <button
                      className="btn btn-primary apl-unlock-btn"
                      onClick={() => unlock(detail)}
                      disabled={unlocking}
                    >
                      {unlocking ? (
                        <>
                          <Loader2 size={16} className="ap-spin" /> Preparing…
                        </>
                      ) : (
                        <>
                          <Lock size={15} /> Unlock full program · {priceTag(detail)}
                        </>
                      )}
                    </button>
                    <span className="apl-unlock-note">
                      First {detail.freePreviewCount || 1} track
                      {(detail.freePreviewCount || 1) > 1 ? 's' : ''} free to preview.
                    </span>
                    {payError && <span className="apl-error">{payError}</span>}
                  </div>
                )}

                {/* Payment step — one-click saved card or a new card */}
                {pay && (
                  <div className="apl-unlock">
                    <ProgramPay clientSecret={pay.clientSecret} amount={pay.amount} onPaid={onPaid} />
                  </div>
                )}

                {/* Add to your path — once the program is playable (free or owned) */}
                {(detail.isFree || detail.unlocked) && !pay && (
                  inPath.has(String(idOf(detail))) ? (
                    <div className="apl-inpath">
                      <Check size={15} /> In your path
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary apl-addpath-btn"
                      onClick={() => addPath(detail)}
                      disabled={adding}
                    >
                      {adding ? (
                        <>
                          <Loader2 size={15} className="ap-spin" /> Adding…
                        </>
                      ) : (
                        <>
                          <Plus size={15} /> Add to your path
                        </>
                      )}
                    </button>
                  )
                )}

                <div className="ap-also-list">
                  {detail.clips.map((c) => {
                    const isCurrent = now?.programId === idOf(detail) && now?.order === c.order
                    return (
                      <button
                        key={c.order}
                        className={`ap-also-row ap-also-session ${c.locked ? 'locked' : 'today'} ${isCurrent ? 'current' : ''}`}
                        onClick={() => playClip(detail, c)}
                        disabled={c.locked}
                      >
                        <span className="ap-also-state">
                          {c.locked ? (
                            <Lock size={12} />
                          ) : isCurrent && playing ? (
                            <Pause size={12} fill="currentColor" strokeWidth={0} />
                          ) : (
                            <Play size={11} fill="currentColor" strokeWidth={0} />
                          )}
                        </span>
                        <span className="ap-also-text">
                          <strong>{c.session.title}</strong>
                        </span>
                        <span className="ap-also-len">
                          {c.free && !detail.isFree ? 'free' : fmtLen(c.session.durationSeconds)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== mini player (matches the plan player) ===== */}
      {now && (
        <div className={`ap-player ${playing ? 'playing' : ''}`}>
          <div className="container ap-player-inner">
            <span className={`ap-mini-cover lg ${now.cover || 'cover-violet'}`} aria-hidden="true" />
            <div className="ap-player-meta">
              <strong>{now.title}</strong>
              <small>Audio library · preview</small>
            </div>
            <button className="ap-player-toggle" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? (
                <Pause size={20} fill="currentColor" strokeWidth={0} />
              ) : (
                <Play size={20} fill="currentColor" strokeWidth={0} style={{ marginLeft: 2 }} />
              )}
            </button>
            <button
              className="ap-player-close"
              onClick={() => {
                audioRef.current?.pause()
                setNow(null)
              }}
              aria-label="Close player"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
