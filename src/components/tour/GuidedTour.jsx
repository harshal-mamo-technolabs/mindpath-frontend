import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardList,
  Compass,
  Gauge,
  Headphones,
  Heart,
  Home,
  ListChecks,
  Lightbulb,
  Eye,
  Sparkles,
  X,
} from 'lucide-react'

import Logo from '../Logo.jsx'
import {
  TOUR_CHAPTERS,
  TOUR_STEPS,
  chapterProgress,
  endTour,
  getTourState,
  nextStep,
  ctaPathForStep,
  pathForStep,
  prevStep,
  subscribe,
} from '../../lib/tour.js'

const PAD = 10 // breathing room around the spotlight
const GAP = 14 // between spotlight and card
const MARGIN = 12 // minimum distance from any viewport edge
const CARD_W = 360
const FIND_TIMEOUT_MS = 6000

const ICONS = {
  gauge: Gauge,
  compass: Compass,
  bars: BarChart3,
  list: ListChecks,
  headphones: Headphones,
  clipboard: ClipboardList,
  book: BookOpen,
  heart: Heart,
  home: Home,
}

/** First candidate selector that resolves to something actually visible. */
function findTarget(selectors = []) {
  for (const selector of selectors) {
    const el = document.querySelector(selector)
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) return el
  }
  return null
}

const rectOf = (el) => {
  const r = el.getBoundingClientRect()
  return { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 }
}

/**
 * Scrolls a target into the upper part of the viewport rather than the middle,
 * so there is room beneath it for the card. Fixed-position elements (the mobile
 * bottom nav) don't move, which is fine — placement handles those by opening
 * upward.
 */
function isFixed(node) {
  for (let n = node; n && n !== document.body; n = n.parentElement) {
    if (getComputedStyle(n).position === 'fixed') return true
  }
  return false
}

function scrollTargetIntoPlace(el, instant) {
  if (isFixed(el)) return

  const r = el.getBoundingClientRect()
  const target = r.top + window.scrollY - window.innerHeight * 0.24
  window.scrollTo({ top: Math.max(0, target), behavior: instant ? 'auto' : 'smooth' })
}

/**
 * Decides where the card goes, using its MEASURED size rather than a guess.
 * Returns absolute viewport coordinates plus where the caret should point.
 *
 * The old version assumed a card height and could push the card off-screen —
 * especially on phones, where a tall card next to a bottom-anchored target had
 * nowhere to go.
 */
function place(rect, card, vw, vh) {
  const width = Math.min(CARD_W, vw - MARGIN * 2)
  if (!rect) {
    return { centred: true, width }
  }

  const roomBelow = vh - (rect.top + rect.height) - GAP - MARGIN
  const roomAbove = rect.top - GAP - MARGIN

  let side
  if (roomBelow >= card.height) side = 'below'
  else if (roomAbove >= card.height) side = 'above'
  else side = roomBelow >= roomAbove ? 'below' : 'above' // neither fits; take the bigger

  const left = Math.min(Math.max(MARGIN, rect.left + rect.width / 2 - width / 2), vw - width - MARGIN)

  let top =
    side === 'below' ? rect.top + rect.height + GAP : rect.top - GAP - card.height
  // Never let it leave the screen, even when neither side truly fits.
  top = Math.min(Math.max(MARGIN, top), Math.max(MARGIN, vh - card.height - MARGIN))

  // The caret points at the target's centre, clamped inside the card's edges.
  const caretX = Math.min(Math.max(rect.left + rect.width / 2 - left, 22), width - 22)
  // Hide the caret if the card had to move so far it no longer touches the target.
  const touching =
    side === 'below' ? Math.abs(top - (rect.top + rect.height + GAP)) < 2 : Math.abs(top + card.height + GAP - rect.top) < 2

  // A report section can be taller than the space left beside the card — on a
  // phone that is simply unavoidable. Rather than ring a box that runs under
  // the card, clip the spotlight to the region actually on show, so the
  // highlight always frames exactly what the reader can see.
  const regionTop = side === 'above' ? top + card.height + GAP : MARGIN
  const regionBottom = side === 'below' ? top - GAP : vh - MARGIN
  const spotTop = Math.max(rect.top, regionTop)
  const spotBottom = Math.min(rect.top + rect.height, regionBottom)
  const spot =
    spotBottom - spotTop > 24
      ? { top: spotTop, left: rect.left, width: rect.width, height: spotBottom - spotTop }
      : rect

  return { centred: false, width, top, left, side, caretX, caret: touching, spot }
}

/**
 * The onboarding overlay.
 *
 * Mounted once at the router root. For each step it navigates to the step's
 * page, waits for the target, scrolls it into a workable position, measures the
 * card, then places the card and spotlight.
 *
 * A step whose target never appears falls back to a centred card, so a missing
 * or renamed element degrades the tour instead of trapping the user in it.
 */
export default function GuidedTour() {
  const { active, index, ctx } = useSyncExternalStore(subscribe, getTourState, getTourState)
  const navigate = useNavigate()
  const location = useLocation()

  const [rect, setRect] = useState(null)
  const [ready, setReady] = useState(false)
  const [pos, setPos] = useState(null)
  // Lets the reader tuck the card away to inspect what's highlighted beneath it.
  const [peeking, setPeeking] = useState(false)
  const cardRef = useRef(null)
  const fittedRef = useRef(null)

  const step = active ? TOUR_STEPS[index] : null
  const isLast = index === TOUR_STEPS.length - 1
  const chapter = step ? chapterProgress(index) : null
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  /* --- navigate to the step's page before looking for its target --- */
  useEffect(() => {
    if (!step) return
    const path = pathForStep(step, ctx)
    if (path && location.pathname !== path) navigate(path)
  }, [step, ctx, navigate, location.pathname])

  /* --- locate the target, scroll it somewhere workable, then measure --- */
  useEffect(() => {
    if (!step) return

    setReady(false)
    setRect(null)
    setPos(null)
    setPeeking(false)

    if (!step.target?.length) {
      setReady(true)
      return
    }

    let cancelled = false
    const startedAt = Date.now()

    const settle = (el) => {
      if (cancelled) return
      scrollTargetIntoPlace(el, reduced)
      setTimeout(() => {
        if (cancelled) return
        setRect(rectOf(el))
        setReady(true)
      }, reduced ? 60 : 430)
    }

    const look = () => {
      if (cancelled) return
      const el = findTarget(step.target)
      if (el) return settle(el)
      if (Date.now() - startedAt > FIND_TIMEOUT_MS) {
        setRect(null)
        setReady(true)
        return
      }
      setTimeout(look, 120)
    }

    look()
    return () => {
      cancelled = true
    }
  }, [step, location.pathname, reduced])

  /* --- place the card once it (and the target) have real dimensions --- */
  useLayoutEffect(() => {
    if (!ready) return

    const reposition = () => {
      const card = cardRef.current?.getBoundingClientRect()
      if (!card) return
      const live = step?.target?.length ? findTarget(step.target) : null
      const r = live ? rectOf(live) : null
      const placed = place(r, card, window.innerWidth, window.innerHeight)
      setRect(r)
      setPos(placed)

      // The card is opaque, so the part of the screen it covers is unusable.
      // Scroll the highlighted element into the region it leaves free — this is
      // what stops the card sitting on top of the very section it describes,
      // which is unavoidable on a phone otherwise. Runs once per step; fixed
      // elements (the bottom nav) don't move on scroll, so they're skipped.
      if (!r || placed.centred || fittedRef.current === index || !live) return
      if (isFixed(live)) {
        fittedRef.current = index
        return
      }

      const vh = window.innerHeight
      const regionTop = placed.side === 'above' ? placed.top + card.height + GAP : MARGIN
      const regionBottom = placed.side === 'below' ? placed.top - GAP : vh - MARGIN
      const regionH = regionBottom - regionTop

      let delta = 0
      if (r.height >= regionH) delta = r.top - regionTop // taller than the gap: show its top
      else if (r.top < regionTop) delta = r.top - regionTop
      else if (r.bottom > regionBottom) delta = r.bottom - regionBottom

      fittedRef.current = index
      if (Math.abs(delta) > 4) window.scrollBy({ top: delta, behavior: 'auto' })
    }

    reposition()

    // The card's height changes with its content, so watch it as well as the
    // window — a taller card may no longer fit on the side we first chose.
    const ro = new ResizeObserver(reposition)
    if (cardRef.current) ro.observe(cardRef.current)
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [ready, step, index])

  /* --- keyboard: arrows move, Esc leaves --- */
  const handleKey = useCallback(
    (e) => {
      if (!active) return
      if (e.key === 'Escape') endTour()
      else if (e.key === 'ArrowRight') nextStep()
      else if (e.key === 'ArrowLeft' && index > 0) prevStep()
    },
    [active, index],
  )

  useEffect(() => {
    if (!active) return
    window.addEventListener('keydown', handleKey)
    document.body.classList.add('tour-open')
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.classList.remove('tour-open')
    }
  }, [active, handleKey])

  useEffect(() => {
    if (ready && cardRef.current) cardRef.current.focus({ preventScroll: true })
  }, [ready, index])

  if (!active || !step || !ready) return null

  const finish = () => {
    const dest = ctaPathForStep(step, ctx)
    if (dest) navigate(dest)
    endTour({ completed: true })
  }

  const Icon = ICONS[step.icon] ?? Sparkles
  const centred = pos?.centred ?? true
  const style = centred
    ? { width: pos?.width ?? CARD_W }
    : { top: pos.top, left: pos.left, width: pos.width }

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label="Product tour">
      {rect && !centred ? (
        <div
          className="tour-spot"
          style={{
            top: (pos.spot ?? rect).top,
            left: (pos.spot ?? rect).left,
            width: (pos.spot ?? rect).width,
            height: (pos.spot ?? rect).height,
          }}
        />
      ) : (
        <div className="tour-veil" />
      )}

      <div
        ref={cardRef}
        tabIndex={-1}
        className={`tour-card${centred ? ' tour-card-center' : ''}${peeking ? ' tour-card-peek' : ''}`}
        style={style}
      >
        {!centred && pos.caret && (
          <span className={`tour-caret tour-caret-${pos.side}`} style={{ left: pos.caretX }} />
        )}

        {/* chapter rail — progress as structure, not a bare count */}
        {chapter && (
          <div className="tour-chapters" aria-hidden="true">
            {TOUR_CHAPTERS.map((c, i) => (
              <span
                key={c.id}
                className={`tour-chapter${i === chapter.chapterIndex ? ' current' : ''}${
                  i < chapter.chapterIndex ? ' done' : ''
                }`}
              />
            ))}
          </div>
        )}

        <div className="tour-card-tools">
          {/* Some sections are taller than the space the card leaves free —
              this tucks the card out of the way so they can be read. */}
          {!centred && (
            <button
              type="button"
              className="tour-peek"
              onClick={() => setPeeking((v) => !v)}
              aria-pressed={peeking}
              aria-label={peeking ? 'Show the tour card' : 'Hide the card to look underneath'}
            >
              <Eye size={15} />
              <span>{peeking ? 'Show' : 'Peek'}</span>
            </button>
          )}
          <button type="button" className="tour-close" onClick={() => endTour()} aria-label="Leave the tour">
            <X size={16} />
          </button>
        </div>

        {step.kind === 'intro' || step.kind === 'outro' ? (
          <div className="tour-bookend">
            <span className="tour-bookend-logo">
              <Logo />
            </span>
            <h2 className="tour-card-title">{step.title}</h2>
            <p className="tour-card-body">{step.body}</p>
            {step.kind === 'intro' && (
              <ul className="tour-agenda">
                {TOUR_CHAPTERS.map((c) => (
                  <li key={c.id}>
                    <Sparkles size={13} /> {c.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <>
            <p className="tour-eyebrow">
              <span className="tour-eyebrow-icon">
                <Icon size={13} />
              </span>
              {chapter.label}
              <span className="tour-eyebrow-count">
                {chapter.position}/{chapter.total}
              </span>
            </p>
            <h2 className="tour-card-title">{step.title}</h2>
            <p className="tour-card-body">{step.body}</p>
            {step.tip && (
              <p className="tour-tip">
                <Lightbulb size={13} /> {step.tip}
              </p>
            )}
          </>
        )}

        <div className="tour-actions">
          {index > 0 ? (
            <button type="button" className="tour-back" onClick={prevStep}>
              <ArrowLeft size={15} /> Back
            </button>
          ) : (
            <button type="button" className="tour-back" onClick={() => endTour()}>
              Skip tour
            </button>
          )}

          <span className="tour-count">
            {index + 1} / {TOUR_STEPS.length}
          </span>

          <button
            type="button"
            className="btn btn-primary tour-next"
            onClick={isLast ? finish : nextStep}
          >
            {isLast ? step.cta || 'Finish' : index === 0 ? 'Show me' : 'Next'}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
