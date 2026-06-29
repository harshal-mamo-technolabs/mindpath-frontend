/**
 * Stress & Burnout — assessment config for the shared report engine.
 *
 *  - PROBLEM categories (exhaustion, cynicism, workload): higher % = worse.
 *  - STRENGTH categories (recovery, control): higher % = better.
 *
 * scoreDirection is 'lower_is_better': the headline is an OVERALL LOAD number
 * (less load = healthier), never the raw API `percentage` which ignores
 * direction. The engine handles all the maths; this file is just the config.
 */
import { buildAssessmentReport } from './reportEngine.js'

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)

const DIRECTION = {
  exhaustion: 'problem',
  cynicism: 'problem',
  workload: 'problem',
  recovery: 'strength',
  control: 'strength',
}

const LABEL = {
  exhaustion: 'Exhaustion',
  cynicism: 'Cynicism & detachment',
  workload: 'Workload',
  recovery: 'Recovery capacity',
  control: 'Sense of control',
}

/* ===== per-category copy (supportive, non-clinical) ===== */
const CONTENT = {
  exhaustion: {
    // positive phrasing of "this is going well" — used when a problem is low
    strengthLabel: 'steady energy',
    blurb: 'How depleted you feel — physically and mentally — by the demands of your days.',
    note: {
      low: 'Your tank is reading fairly full. Energy is showing up when you need it.',
      mid: 'You’re running warmer than is comfortable — noticeable tiredness that rest isn’t fully clearing.',
      high: 'You’re depleted often. This is the body asking for real recovery, not just a weekend.',
    },
    bullets: [
      'Tiredness that lingers past a normal night’s sleep is a load signal, not a character flaw.',
      'Exhaustion compounds quietly — small recovery habits matter more than one big reset.',
    ],
    try: 'Pick one fixed “off switch” tonight — screens down 30 minutes before bed — and protect it for a week.',
  },
  cynicism: {
    strengthLabel: 'sense of engagement',
    blurb: 'How connected — or detached and going-through-the-motions — you feel about your work and people.',
    note: {
      low: 'You’re still engaged and present. The work and people around you still land as meaningful.',
      mid: 'Some distance is creeping in — moments of “why bother” or going through the motions.',
      high: 'You’re feeling detached a lot. Pulling back is a normal way the mind protects itself under strain.',
    },
    bullets: [
      'Cynicism is often a symptom of depletion, not your true outlook — it usually softens as reserves return.',
      'Naming one thing that still matters to you re-opens a little of the connection.',
    ],
    try: 'Each evening, note one small moment that felt genuinely worthwhile. No pressure for it to be big.',
  },
  workload: {
    strengthLabel: 'manageable workload',
    blurb: 'How much the sheer volume and pace of demands outstrips the time and resources you have.',
    note: {
      low: 'The volume feels manageable. You generally have room to do things at a sustainable pace.',
      mid: 'The load is bumping the ceiling — frequent stretches where there’s more to do than time to do it.',
      high: 'Demands are routinely outrunning your capacity. This is a structural pressure, not a willpower gap.',
    },
    bullets: [
      'Sustained overload is the single strongest driver of burnout — it’s worth treating as a real constraint.',
      'Protecting capacity often means subtracting commitments, not just working harder inside them.',
    ],
    try: 'Name the one task that drains the most for the least return — and ask what it would take to drop or hand it off.',
  },
  recovery: {
    strengthLabel: 'recovery capacity',
    blurb: 'How well you’re able to switch off, rest, and genuinely recharge between demands.',
    note: {
      low: 'Recovery is running thin. You’re rarely fully switching off, so the tank isn’t refilling.',
      mid: 'You get some recovery, but it’s patchy — rest that doesn’t quite reach the bottom of the tank.',
      high: 'You recover well. You can put things down and come back genuinely refreshed — a real asset.',
    },
    bullets: [
      'Recovery is a skill and a resource, not a reward for finishing — it works best scheduled, not earned.',
      'Even short, deliberate breaks protect you more than a single long collapse at the end.',
    ],
    try: 'Block one genuinely off-duty pocket this week — phone elsewhere — and treat it as non-negotiable.',
  },
  control: {
    strengthLabel: 'sense of control',
    blurb: 'How much agency and say you feel you have over how your days and work unfold.',
    note: {
      low: 'Agency is feeling thin — a lot of your day shaped by forces you don’t feel you can steer.',
      mid: 'You have some say, but not as much as you’d like — pockets of feeling pushed along by events.',
      high: 'You feel a real sense of agency. Knowing you can steer your days is protective under pressure.',
    },
    bullets: [
      'Even small, reclaimed choices restore a sense of control that buffers against strain.',
      'Control is less about changing everything and more about owning the few levers you do have.',
    ],
    try: 'Choose one small thing this week you’ll decide on your own terms — when you start, what you say no to.',
  },
}

export const STRESS_CONFIG = {
  scoreDirection: 'lower_is_better',
  direction: DIRECTION,
  label: LABEL,
  content: CONTENT,
  // burnout's focus areas are the flagged categories, ranked by load
  selectPriorities: (dims) =>
    dims
      .filter((d) => d.tag === 'focus')
      .sort((a, b) => b.load - a.load)
      .slice(0, 3),
  difficulty: (dims) => mean(dims.filter((d) => d.direction === 'problem').map((d) => d.pct)),
  resource: (dims) => mean(dims.filter((d) => d.direction === 'strength').map((d) => d.pct)),
  archetype: ({ difficulty, resource }) =>
    difficulty >= 50 && resource < 50
      ? { name: 'Running on Empty', summary: 'High demands, low recovery — a classic burnout pattern, and a reversible one.' }
      : difficulty >= 50 && resource >= 50
        ? { name: 'Stretched but Resourced', summary: 'You’re carrying a lot, but you still have real ways to recharge.' }
        : difficulty < 50 && resource < 50
          ? {
              name: 'Coasting on Low Reserves',
              summary: 'Not heavily strained yet, but your reserves are thin — an early-warning pattern worth tending.',
            }
          : { name: 'Balanced & Steady', summary: 'Your demands and recovery are in a healthy balance right now.' },
  patternDetail: ({ dims, difficulty, resource }) => {
    const problems = dims.filter((d) => d.direction === 'problem')
    const resources = dims.filter((d) => d.direction === 'strength')
    const heaviest = [...problems].sort((a, b) => b.pct - a.pct)[0]
    const thinnest = [...resources].sort((a, b) => a.pct - b.pct)[0]
    const gap = difficulty - resource
    return (
      `Your demands are running at ${difficulty}/100 and your capacity to recover sits at ${resource}/100. ` +
      (gap > 12
        ? 'The demands side is clearly the heavier of the two right now — '
        : gap < -12
          ? 'You’ve got more in reserve than is being asked of you at the moment — '
          : 'The two are fairly evenly matched — ') +
      `${heaviest.label.toLowerCase()} is adding the most pressure, while ${thinnest.strengthLabel} is the resource most worth rebuilding.`
    )
  },
}

export function buildReport(data) {
  return buildAssessmentReport(data, STRESS_CONFIG)
}
