/**
 * Anxiety & Overthinking — assessment config for the shared report engine.
 *
 *  - PROBLEM:  worry, rumination, catastrophizing, physical (more → worse)
 *  - STRENGTH: refocus (better able to redirect/settle the mind → better)
 *
 * Four problems, one strength → a load profile. scoreDirection is
 * 'lower_is_better': the headline is an overall LOAD number (less = calmer),
 * never the raw API `percentage` (which counts refocus the wrong way).
 *
 * Anxiety is a sensitive topic — copy here is deliberately reassuring and
 * non-clinical: patterns, not diagnoses; skills that develop, not deficits.
 */
import { buildAssessmentReport } from './reportEngine.js'

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)

const DIRECTION = {
  worry: 'problem',
  rumination: 'problem',
  catastrophizing: 'problem',
  physical: 'problem',
  refocus: 'strength',
}

const LABEL = {
  worry: 'Worry',
  rumination: 'Rumination',
  catastrophizing: 'Catastrophising',
  physical: 'Physical anxiety',
  refocus: 'Ability to refocus',
}

/* ===== per-category copy (reassuring, non-clinical) ===== */
const CONTENT = {
  worry: {
    strengthLabel: 'a calm baseline',
    blurb: 'How often anxious “what if” thoughts show up and how much space they take.',
    note: {
      low: 'Worry is staying in proportion — it shows up, but it isn’t running the show.',
      mid: 'Worry is a frequent visitor — enough to be tiring, though not constant.',
      high: 'Worry is loud and frequent right now. That’s draining — and it’s also very workable.',
    },
    bullets: [
      'Worry is the mind trying to keep you safe — it over-fires, but it isn’t a flaw or a diagnosis.',
      'Most worries never happen; naming the specific fear shrinks it more than pushing it away.',
    ],
    try: 'Set a 10-minute “worry window” each day — write the worries down then, and gently postpone them the rest of the day.',
  },
  rumination: {
    strengthLabel: 'a settled mind',
    blurb: 'How much your mind replays past moments or loops on the same thoughts.',
    note: {
      low: 'You’re not getting too stuck — thoughts come and go without looping for long.',
      mid: 'Some looping is happening — replaying conversations or decisions more than helps.',
      high: 'Your mind is caught in replay a lot. Looping feels productive but rarely resolves anything — that’s the trap.',
    },
    bullets: [
      'Rumination masquerades as problem-solving, but it mostly recycles the problem without moving it.',
      'Shifting the body — a short walk, cold water — breaks a loop faster than thinking your way out.',
    ],
    try: 'When you notice the loop, name it (“that’s rumination”) and change your physical state — stand up, move, step outside.',
  },
  catastrophizing: {
    strengthLabel: 'a balanced outlook',
    blurb: 'How often your mind jumps to the worst-case version of things.',
    note: {
      low: 'You’re mostly keeping perspective — the worst-case isn’t your default.',
      mid: 'The worst-case shows up fairly often, colouring how risky things feel.',
      high: 'Your mind leaps to the worst-case a lot. It feels like foresight, but it’s the anxiety talking, not the odds.',
    },
    bullets: [
      'Catastrophising overweights the scary outcome and underweights your ability to cope with it.',
      'Asking “what’s most likely?” and “could I handle it?” gently rebalances the picture.',
    ],
    try: 'When you catch a worst-case thought, jot the feared outcome, the most likely outcome, and one way you’d cope.',
  },
  physical: {
    strengthLabel: 'a settled body',
    blurb: 'How much anxiety shows up in your body — tension, racing heart, restlessness, shallow breath.',
    note: {
      low: 'Your body is staying fairly settled — anxiety isn’t showing up much physically.',
      mid: 'There’s some physical tension — a tight chest, restlessness, or shallow breathing at times.',
      high: 'Anxiety is showing up strongly in your body. Body and mind feed each other — calming one calms the other.',
    },
    bullets: [
      'Physical anxiety is your nervous system on high alert — real and very treatable, not weakness.',
      'Slow exhales are the fastest off-switch: a longer breath out tells the body it’s safe.',
    ],
    try: 'Breathe in for 4, out for 6, for two minutes. The longer out-breath is what settles the nervous system.',
  },
  refocus: {
    strengthLabel: 'ability to refocus',
    blurb: 'How well you can step out of an anxious spiral and bring your attention back.',
    note: {
      low: 'This steadying skill is still developing — right now it’s hard to step out once the spiral starts.',
      mid: 'You can sometimes redirect your attention, though it doesn’t always hold.',
      high: 'You’re genuinely good at catching the spiral and refocusing. This is your strongest lever — lean on it.',
    },
    bullets: [
      'Noticing “I’m spiralling” and redirecting is the single most protective anxiety skill there is.',
      'It’s a muscle, not a trait — every time you redirect on purpose, it gets a little easier.',
    ],
    try: 'Pick one grounding anchor — five things you can see, or your feet on the floor — and use it the moment you notice the spin.',
  },
}

export const ANXIETY_CONFIG = {
  scoreDirection: 'lower_is_better',
  direction: DIRECTION,
  label: LABEL,
  content: CONTENT,
  selectPriorities: (dims) =>
    dims
      .filter((d) => d.load >= 50)
      .sort((a, b) => b.load - a.load)
      .slice(0, 3),
  // archetype axes: x = anxious-thinking level, y = ability to refocus
  difficulty: (dims) => mean(dims.filter((d) => d.direction === 'problem').map((d) => d.pct)),
  resource: (dims) => dims.find((d) => d.key === 'refocus')?.pct ?? 0,
  archetype: ({ difficulty, resource }) =>
    difficulty >= 50 && resource < 50
      ? { name: 'Caught in the Spin', summary: 'High anxious thinking with little ability to step out of it — and that ability is buildable.' }
      : difficulty >= 50 && resource >= 50
        ? { name: 'Anxious but Aware', summary: 'Strong worry and overthinking, but you can catch and redirect it.' }
        : difficulty < 50 && resource < 50
          ? { name: 'Quietly Tense', summary: 'Lower-grade anxiety, but few tools yet to settle it when it rises.' }
          : { name: 'Steady Mind', summary: 'Low anxiety and a good ability to refocus.' },
  patternDetail: ({ dims, difficulty, resource }) => {
    const problems = dims.filter((d) => d.direction === 'problem')
    const heaviest = [...problems].sort((a, b) => b.pct - a.pct)[0]
    return (
      `Your anxious thinking averages ${difficulty}/100, while your ability to refocus sits at ${resource}/100. ` +
      (resource >= 50
        ? 'The reassuring part: you can already catch and redirect the spiral — that’s the lever everything else turns on. '
        : 'The most useful thing to build is that catch-and-redirect skill — it’s what turns the volume down. ') +
      `Right now ${heaviest.label.toLowerCase()} is the loudest of the four.`
    )
  },
}

export function buildAnxietyReport(data) {
  return buildAssessmentReport(data, ANXIETY_CONFIG)
}
