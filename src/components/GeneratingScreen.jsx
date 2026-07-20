import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'

/**
 * A short "we're generating this for you" ceremony — an animated orb over a
 * checklist that lights up one step at a time, then calls `onDone`. Purely
 * presentational: the caller decides what the steps say and what happens after.
 *
 * Used for the report ceremony after submitting an assessment (full-screen) and
 * for the audio-plan ceremony before the welcome clip plays (`overlay`).
 *
 * Timing: `steps.length` × `stepMs`, plus a `holdMs` beat before `onDone`.
 * With the defaults that's ~6s — long enough to read as real work.
 */
export default function GeneratingScreen({
  title,
  steps,
  note,
  onDone,
  overlay = false,
  stepMs = 1350,
  holdMs = 700,
}) {
  const [reached, setReached] = useState(0)
  const firedDone = useRef(false)
  // keep the latest onDone without re-arming the step timer when it changes
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    if (reached >= steps.length) {
      if (firedDone.current) return
      firedDone.current = true
      const t = setTimeout(() => onDoneRef.current?.(), holdMs)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setReached((r) => r + 1), stepMs)
    return () => clearTimeout(t)
  }, [reached, steps.length, stepMs, holdMs])

  return (
    <div className={`genscreen${overlay ? ' genscreen-overlay' : ''}`}>
      <div className="orb gen-orb" aria-hidden="true">
        <span className="orb-ring" />
        <span className="orb-ring r2" />
        <div className="orb-core gen-core" />
      </div>
      <h1>{title}</h1>
      <ul className="gen-steps" aria-live="polite">
        {steps.map((s, i) => (
          <li key={s} className={i < reached ? 'done' : i === reached ? 'active' : ''}>
            <span className="gen-check">{i < reached ? <Check size={13} /> : null}</span>
            {s}
          </li>
        ))}
      </ul>
      {note ? <p className="gen-note">{note}</p> : null}
    </div>
  )
}
