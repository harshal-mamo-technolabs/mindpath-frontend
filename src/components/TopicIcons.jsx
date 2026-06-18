/**
 * MindPath topic glyphs  bespoke, hand-drawn SVGs in the brand's organic
 * line style (rounded caps/joins, ~1.6 stroke), each a meaningful metaphor
 * for its topic rather than a generic stock icon. Drop-in for Lucide:
 * they accept the same `size` / `strokeWidth` props.
 */
function Glyph({ size = 24, strokeWidth = 1.6, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

/* Stress & Burnout  a flame, settling. */
export function StressGlyph(props) {
  return (
    <Glyph {...props}>
      <path d="M12 3.2c3 3.3 4.8 5.8 4.8 9.1A4.8 4.8 0 0 1 7.2 12.3c0-1.9 1-3.5 2.3-4.9.3 1.3 1.1 2 2 2.2C10.8 7.1 11.1 5 12 3.2Z" />
      <path d="M12 19.4a2.6 2.6 0 0 0 2.6-2.7c0-1.4-1.3-2.4-2.6-4-1.3 1.6-2.6 2.6-2.6 4A2.6 2.6 0 0 0 12 19.4Z" />
    </Glyph>
  )
}

/* Sleep & Rest  crescent moon with a quiet spark. */
export function SleepGlyph(props) {
  return (
    <Glyph {...props}>
      <path d="M18 14.2A6.6 6.6 0 1 1 10.2 6.4 5.3 5.3 0 0 0 18 14.2Z" />
      <path d="M16.4 4l.55 1.45L18.4 6l-1.45.55L16.4 8l-.55-1.45L14.4 6l1.45-.55Z" />
    </Glyph>
  )
}

/* Anxiety & Worry  ripples settling out from a still centre. */
export function AnxietyGlyph(props) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <path d="M8.6 15.4a4.8 4.8 0 0 1 0-6.8" />
      <path d="M15.4 8.6a4.8 4.8 0 0 1 0 6.8" />
      <path d="M6.2 17.8a8.2 8.2 0 0 1 0-11.6" />
      <path d="M17.8 6.2a8.2 8.2 0 0 1 0 11.6" />
    </Glyph>
  )
}

/* Focus & Clarity  attention narrowing to one clear point. */
export function FocusGlyph(props) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="3.4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="M12 3v2.6M12 18.4V21M3 12h2.6M18.4 12H21" />
    </Glyph>
  )
}

/* Emotional Intelligence  a heart that grows a small leaf. */
export function EQGlyph(props) {
  return (
    <Glyph {...props}>
      <path d="M12 20C7 16.6 4.6 13.5 4.6 10.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7.4 2.3C19.4 13.5 17 16.6 12 20Z" />
      <path d="M12 16.5c0-2 .9-3.3 2.6-3.9" />
    </Glyph>
  )
}

/* Self-Esteem  a seedling rising on its own stem. */
export function SelfEsteemGlyph(props) {
  return (
    <Glyph {...props}>
      <path d="M12 21v-7.5" />
      <path d="M12 14c-2.8.4-4.6-1.2-4.6-3.9 2.7 0 4.5 1.4 4.6 3.9Z" />
      <path d="M12 12.4c.1-2.5 1.9-3.9 4.6-3.9 0 2.7-1.8 4.3-4.6 3.9Z" />
    </Glyph>
  )
}

/* Relationships  two lives meeting, sharing the middle. */
export function RelationshipsGlyph(props) {
  return (
    <Glyph {...props}>
      <circle cx="9" cy="12" r="4.6" />
      <circle cx="15" cy="12" r="4.6" />
    </Glyph>
  )
}

/* Resilience  standing tall through the climb. */
export function ResilienceGlyph(props) {
  return (
    <Glyph {...props}>
      <path d="M3 19h18" />
      <path d="M4.5 19l4.8-9 3.2 5.4 2.2-3.6L20 19" />
      <circle cx="16.6" cy="6.2" r="1.7" />
    </Glyph>
  )
}

/* Life Transitions  a compass finding a new direction. */
export function TransitionsGlyph(props) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M15.2 8.8 13 13.2 8.8 15.2 11 10.8Z" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </Glyph>
  )
}

/* Mindful Habits  a single leaf with its quiet vein. */
export function MindfulGlyph(props) {
  return (
    <Glyph {...props}>
      <path d="M5 19c0-7.7 6.3-14 14-14 0 7.7-6.3 14-14 14Z" />
      <path d="M6.5 17.5C10 14 13.5 10.5 17 7" />
    </Glyph>
  )
}

/* Grief & Loss  one bloom, held gently. */
export function GriefGlyph(props) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10V6.6M12 14v3.4M10 12H6.6M14 12h3.4M10.6 10.6 8.2 8.2M13.4 10.6l2.4-2.4M10.6 13.4l-2.4 2.4M13.4 13.4l2.4 2.4" />
    </Glyph>
  )
}
