/**
 * Time helpers shared by the audio and music players.
 *
 * Two different source formats appear in the demo data, so each gets its
 * own clearly named parser instead of the old look-alike pair
 * (`lenToSeconds` / `lenToSecs`):
 *   - audio sessions use a minutes label, e.g. "7 min"
 *   - soundscapes use a clock string, e.g. "12:00"
 */

/** Minutes label to seconds: "7 min" -> 420. */
export const minutesToSeconds = (label) => parseInt(label, 10) * 60

/** Clock string to seconds: "12:00" -> 720. */
export const clockToSeconds = (clock) => {
  const [m, s] = clock.split(':').map(Number)
  return m * 60 + s
}

/** Seconds to a clock string for the player timeline: 420 -> "7:00". */
export const formatTime = (secs) => {
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
