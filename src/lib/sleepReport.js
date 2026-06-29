/**
 * Sleep, Rest & Recovery — assessment config for the shared report engine.
 *
 * Four of the five categories are STRENGTHS, so this is a positive health
 * profile. scoreDirection is 'higher_is_better': the headline is a Sleep &
 * Recovery SCORE (higher = healthier), computed as 100 − overallLoad. It is
 * NOT the raw API `percentage`, which counts sleeplessness the wrong way.
 *
 *  - PROBLEM:  sleeplessness (more trouble sleeping → worse)
 *  - STRENGTH: quality, rest, energy, winddown (more → better)
 */
import { buildAssessmentReport } from './reportEngine.js'

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)

const DIRECTION = {
  sleeplessness: 'problem',
  quality: 'strength',
  rest: 'strength',
  energy: 'strength',
  winddown: 'strength',
}

const LABEL = {
  sleeplessness: 'Sleeplessness',
  quality: 'Sleep quality',
  rest: 'Rest & downtime',
  energy: 'Daytime energy',
  winddown: 'Wind-down routine',
}

/* ===== per-category copy (supportive, non-clinical) ===== */
const CONTENT = {
  sleeplessness: {
    // positive phrasing when sleeplessness is low (a problem doing well)
    strengthLabel: 'easy sleep onset',
    blurb: 'How much trouble you have falling asleep, staying asleep, or settling a busy mind at night.',
    note: {
      low: 'Sleep is coming fairly easily — you’re falling and staying asleep without much of a fight.',
      mid: 'Sleep is bumpy — some nights you lie awake or wake and struggle to drop back off.',
      high: 'You’re wrestling with sleep often — trouble falling or staying asleep. This is the piece most worth tending.',
    },
    bullets: [
      'A racing mind at night is usually daytime overflow — what’s unprocessed surfaces once it’s finally quiet.',
      'Sleeplessness responds to a steady wind-down far better than to “trying harder” to fall asleep.',
    ],
    try: 'If you’re awake past ~20 minutes, get up, keep lights low, and do something dull until sleepy — keep the bed for sleep, not struggle.',
  },
  quality: {
    strengthLabel: 'sleep quality',
    blurb: 'How restorative your sleep actually feels — deep, unbroken, and leaving you refreshed.',
    note: {
      low: 'Your sleep isn’t restoring you much — light or broken nights that don’t leave you refreshed.',
      mid: 'Your sleep quality is okay but inconsistent — some genuinely good nights, some that don’t land.',
      high: 'Your sleep is genuinely restorative — deep, refreshing rest. A real asset to lean on.',
    },
    bullets: [
      'Quality beats quantity — seven solid hours rebuilds you more than nine broken ones.',
      'A cool, dark, screen-free room is the single biggest lever on sleep quality.',
    ],
    try: 'Make the room properly cool and dark tonight — eye mask or blackout — and notice how the morning feels.',
  },
  rest: {
    strengthLabel: 'rest & downtime',
    blurb: 'How much genuine rest and downtime you get while awake — not just sleep, but true off-duty time.',
    note: {
      low: 'Daytime rest is thin — you’re rarely fully off-duty, so the day never lets up before night.',
      mid: 'You get some downtime, but it’s patchy — rest that’s often half-attention or interrupted.',
      high: 'You give yourself real downtime — genuine off-duty pockets that let the system settle.',
    },
    bullets: [
      'Rest while awake sets up rest while asleep — a day with no pauses rarely ends in a calm night.',
      'Real rest is undivided — scrolling counts less than ten quiet minutes with nothing demanded of you.',
    ],
    try: 'Schedule one genuinely off-duty pocket tomorrow — no phone, no task — and protect it like an appointment.',
  },
  energy: {
    strengthLabel: 'daytime energy',
    blurb: 'How much steady, usable energy you have through the day — the daytime payoff of good rest.',
    note: {
      low: 'Daytime energy is running low — you’re pushing through dips rather than feeling genuinely fuelled.',
      mid: 'Your energy is okay but uneven — decent stretches broken by real slumps.',
      high: 'Your daytime energy is strong and steady — a clear sign your rest is doing its job.',
    },
    bullets: [
      'Steady energy is the clearest daytime read on whether your nights are working.',
      'Morning light and movement stabilise energy more reliably than caffeine timing.',
    ],
    try: 'Get a few minutes of daylight within an hour of waking — it anchors your body clock and steadies energy.',
  },
  winddown: {
    strengthLabel: 'wind-down routine',
    blurb: 'How consistent and calming your pre-sleep routine is — the runway that tells your body it’s nearly night.',
    note: {
      low: 'There’s little wind-down — you go from full-on straight to lights-out, with no runway to land.',
      mid: 'You have some wind-down, but it’s inconsistent — good some nights, skipped on busy ones.',
      high: 'You’ve got a real wind-down routine — a consistent runway that eases you toward sleep. Lean on it.',
    },
    bullets: [
      'A predictable runway matters more than a perfect one — the same order of calm steps, most nights.',
      'Dimming lights and screens in the last hour is the strongest cue that night is coming.',
    ],
    try: 'Pick a fixed “last hour” ritual — dim lights, no screens, one calm activity — and run it three nights this week.',
  },
}

export const SLEEP_CONFIG = {
  scoreDirection: 'higher_is_better',
  direction: DIRECTION,
  label: LABEL,
  content: CONTENT,
  // priorities = whatever is adding the most load (≥50), ranked, capped at 3
  selectPriorities: (dims) =>
    dims
      .filter((d) => d.load >= 50)
      .sort((a, b) => b.load - a.load)
      .slice(0, 3),
  // archetype axes: x = sleep difficulty (sleeplessness), y = recovery resources
  difficulty: (dims) => dims.find((d) => d.key === 'sleeplessness')?.pct ?? 0,
  resource: (dims) => mean(dims.filter((d) => d.direction === 'strength').map((d) => d.pct)),
  archetype: ({ difficulty, resource }) =>
    difficulty >= 50 && resource < 50
      ? { name: 'Wired & Worn', summary: 'Trouble sleeping and low recovery — sleep needs real attention.' }
      : difficulty >= 50 && resource >= 50
        ? { name: 'Restless but Resourced', summary: 'Sleep is disrupted, but you have recovery habits to build on.' }
        : difficulty < 50 && resource < 50
          ? { name: 'Quiet but Under-rested', summary: 'You fall asleep okay, but you’re not truly recovering.' }
          : { name: 'Rested & Recharged', summary: 'Healthy sleep and recovery across the board.' },
  patternDetail: ({ dims, difficulty, resource }) => {
    const resources = dims.filter((d) => d.direction === 'strength')
    const thinnest = [...resources].sort((a, b) => a.pct - b.pct)[0]
    return (
      `Your sleep difficulty reads ${difficulty}/100, and your recovery resources — quality, rest, energy and wind-down — average ${resource}/100. ` +
      (difficulty >= 50
        ? 'Falling and staying asleep is the harder part right now — '
        : 'Getting to sleep isn’t the main issue — ') +
      `the resource most worth building is ${thinnest.strengthLabel}.`
    )
  },
}

export function buildSleepReport(data) {
  return buildAssessmentReport(data, SLEEP_CONFIG)
}
