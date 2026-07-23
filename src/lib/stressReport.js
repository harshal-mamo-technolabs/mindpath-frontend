/**
 * Stress & Burnout — assessment config for the shared report engine.
 *
 *  - PROBLEM categories (exhaustion, cynicism, workload): higher % = worse.
 *  - STRENGTH categories (recovery, control): higher % = better.
 *
 * scoreDirection is 'lower_is_better': the headline is an OVERALL LOAD number
 * (less load = healthier), never the raw API `percentage` which ignores
 * direction. The engine handles all the maths; this file is just the config.
 *
 * All user-facing prose is localized imperatively via the i18next singleton, so
 * the config is rebuilt on every call (buildConfig) to reflect the live language.
 */
import { buildAssessmentReport } from './reportEngine.js'
import i18n from '../i18n/index.js'

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)

const DIRECTION = {
  exhaustion: 'problem',
  cynicism: 'problem',
  workload: 'problem',
  recovery: 'strength',
  control: 'strength',
}

const buildLabel = () => ({
  exhaustion: i18n.t('report.eng.stress.label.exhaustion', { defaultValue: 'Exhaustion' }),
  cynicism: i18n.t('report.eng.stress.label.cynicism', { defaultValue: 'Cynicism & detachment' }),
  workload: i18n.t('report.eng.stress.label.workload', { defaultValue: 'Workload' }),
  recovery: i18n.t('report.eng.stress.label.recovery', { defaultValue: 'Recovery capacity' }),
  control: i18n.t('report.eng.stress.label.control', { defaultValue: 'Sense of control' }),
})

/* ===== per-category copy (supportive, non-clinical) ===== */
const buildContent = () => ({
  exhaustion: {
    // positive phrasing of "this is going well" — used when a problem is low
    strengthLabel: i18n.t('report.eng.stress.content.exhaustion.strengthLabel', { defaultValue: 'steady energy' }),
    blurb: i18n.t('report.eng.stress.content.exhaustion.blurb', {
      defaultValue: 'How depleted you feel — physically and mentally — by the demands of your days.',
    }),
    note: {
      low: i18n.t('report.eng.stress.content.exhaustion.note.low', {
        defaultValue: 'Your tank is reading fairly full. Energy is showing up when you need it.',
      }),
      mid: i18n.t('report.eng.stress.content.exhaustion.note.mid', {
        defaultValue: 'You’re running warmer than is comfortable — noticeable tiredness that rest isn’t fully clearing.',
      }),
      high: i18n.t('report.eng.stress.content.exhaustion.note.high', {
        defaultValue: 'You’re depleted often. This is the body asking for real recovery, not just a weekend.',
      }),
    },
    bullets: i18n.t('report.eng.stress.content.exhaustion.bullets', {
      returnObjects: true,
      defaultValue: [
        'Tiredness that lingers past a normal night’s sleep is a load signal, not a character flaw.',
        'Exhaustion compounds quietly — small recovery habits matter more than one big reset.',
      ],
    }),
    try: i18n.t('report.eng.stress.content.exhaustion.try', {
      defaultValue: 'Pick one fixed “off switch” tonight — screens down 30 minutes before bed — and protect it for a week.',
    }),
  },
  cynicism: {
    strengthLabel: i18n.t('report.eng.stress.content.cynicism.strengthLabel', { defaultValue: 'sense of engagement' }),
    blurb: i18n.t('report.eng.stress.content.cynicism.blurb', {
      defaultValue: 'How connected — or detached and going-through-the-motions — you feel about your work and people.',
    }),
    note: {
      low: i18n.t('report.eng.stress.content.cynicism.note.low', {
        defaultValue: 'You’re still engaged and present. The work and people around you still land as meaningful.',
      }),
      mid: i18n.t('report.eng.stress.content.cynicism.note.mid', {
        defaultValue: 'Some distance is creeping in — moments of “why bother” or going through the motions.',
      }),
      high: i18n.t('report.eng.stress.content.cynicism.note.high', {
        defaultValue: 'You’re feeling detached a lot. Pulling back is a normal way the mind protects itself under strain.',
      }),
    },
    bullets: i18n.t('report.eng.stress.content.cynicism.bullets', {
      returnObjects: true,
      defaultValue: [
        'Cynicism is often a symptom of depletion, not your true outlook — it usually softens as reserves return.',
        'Naming one thing that still matters to you re-opens a little of the connection.',
      ],
    }),
    try: i18n.t('report.eng.stress.content.cynicism.try', {
      defaultValue: 'Each evening, note one small moment that felt genuinely worthwhile. No pressure for it to be big.',
    }),
  },
  workload: {
    strengthLabel: i18n.t('report.eng.stress.content.workload.strengthLabel', { defaultValue: 'manageable workload' }),
    blurb: i18n.t('report.eng.stress.content.workload.blurb', {
      defaultValue: 'How much the sheer volume and pace of demands outstrips the time and resources you have.',
    }),
    note: {
      low: i18n.t('report.eng.stress.content.workload.note.low', {
        defaultValue: 'The volume feels manageable. You generally have room to do things at a sustainable pace.',
      }),
      mid: i18n.t('report.eng.stress.content.workload.note.mid', {
        defaultValue: 'The load is bumping the ceiling — frequent stretches where there’s more to do than time to do it.',
      }),
      high: i18n.t('report.eng.stress.content.workload.note.high', {
        defaultValue: 'Demands are routinely outrunning your capacity. This is a structural pressure, not a willpower gap.',
      }),
    },
    bullets: i18n.t('report.eng.stress.content.workload.bullets', {
      returnObjects: true,
      defaultValue: [
        'Sustained overload is the single strongest driver of burnout — it’s worth treating as a real constraint.',
        'Protecting capacity often means subtracting commitments, not just working harder inside them.',
      ],
    }),
    try: i18n.t('report.eng.stress.content.workload.try', {
      defaultValue: 'Name the one task that drains the most for the least return — and ask what it would take to drop or hand it off.',
    }),
  },
  recovery: {
    strengthLabel: i18n.t('report.eng.stress.content.recovery.strengthLabel', { defaultValue: 'recovery capacity' }),
    blurb: i18n.t('report.eng.stress.content.recovery.blurb', {
      defaultValue: 'How well you’re able to switch off, rest, and genuinely recharge between demands.',
    }),
    note: {
      low: i18n.t('report.eng.stress.content.recovery.note.low', {
        defaultValue: 'Recovery is running thin. You’re rarely fully switching off, so the tank isn’t refilling.',
      }),
      mid: i18n.t('report.eng.stress.content.recovery.note.mid', {
        defaultValue: 'You get some recovery, but it’s patchy — rest that doesn’t quite reach the bottom of the tank.',
      }),
      high: i18n.t('report.eng.stress.content.recovery.note.high', {
        defaultValue: 'You recover well. You can put things down and come back genuinely refreshed — a real asset.',
      }),
    },
    bullets: i18n.t('report.eng.stress.content.recovery.bullets', {
      returnObjects: true,
      defaultValue: [
        'Recovery is a skill and a resource, not a reward for finishing — it works best scheduled, not earned.',
        'Even short, deliberate breaks protect you more than a single long collapse at the end.',
      ],
    }),
    try: i18n.t('report.eng.stress.content.recovery.try', {
      defaultValue: 'Block one genuinely off-duty pocket this week — phone elsewhere — and treat it as non-negotiable.',
    }),
  },
  control: {
    strengthLabel: i18n.t('report.eng.stress.content.control.strengthLabel', { defaultValue: 'sense of control' }),
    blurb: i18n.t('report.eng.stress.content.control.blurb', {
      defaultValue: 'How much agency and say you feel you have over how your days and work unfold.',
    }),
    note: {
      low: i18n.t('report.eng.stress.content.control.note.low', {
        defaultValue: 'Agency is feeling thin — a lot of your day shaped by forces you don’t feel you can steer.',
      }),
      mid: i18n.t('report.eng.stress.content.control.note.mid', {
        defaultValue: 'You have some say, but not as much as you’d like — pockets of feeling pushed along by events.',
      }),
      high: i18n.t('report.eng.stress.content.control.note.high', {
        defaultValue: 'You feel a real sense of agency. Knowing you can steer your days is protective under pressure.',
      }),
    },
    bullets: i18n.t('report.eng.stress.content.control.bullets', {
      returnObjects: true,
      defaultValue: [
        'Even small, reclaimed choices restore a sense of control that buffers against strain.',
        'Control is less about changing everything and more about owning the few levers you do have.',
      ],
    }),
    try: i18n.t('report.eng.stress.content.control.try', {
      defaultValue: 'Choose one small thing this week you’ll decide on your own terms — when you start, what you say no to.',
    }),
  },
})

// English lowercases a label mid-sentence; other languages keep the noun's own casing.
const lower = (s) => (i18n.language === 'en' ? s.toLowerCase() : s)

const buildConfig = () => ({
  scoreDirection: 'lower_is_better',
  direction: DIRECTION,
  label: buildLabel(),
  content: buildContent(),
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
      ? {
          name: i18n.t('report.eng.stress.archetype.runningOnEmpty.name', { defaultValue: 'Running on Empty' }),
          summary: i18n.t('report.eng.stress.archetype.runningOnEmpty.summary', {
            defaultValue: 'High demands, low recovery — a classic burnout pattern, and a reversible one.',
          }),
        }
      : difficulty >= 50 && resource >= 50
        ? {
            name: i18n.t('report.eng.stress.archetype.stretchedButResourced.name', { defaultValue: 'Stretched but Resourced' }),
            summary: i18n.t('report.eng.stress.archetype.stretchedButResourced.summary', {
              defaultValue: 'You’re carrying a lot, but you still have real ways to recharge.',
            }),
          }
        : difficulty < 50 && resource < 50
          ? {
              name: i18n.t('report.eng.stress.archetype.coastingOnLowReserves.name', { defaultValue: 'Coasting on Low Reserves' }),
              summary: i18n.t('report.eng.stress.archetype.coastingOnLowReserves.summary', {
                defaultValue: 'Not heavily strained yet, but your reserves are thin — an early-warning pattern worth tending.',
              }),
            }
          : {
              name: i18n.t('report.eng.stress.archetype.balancedAndSteady.name', { defaultValue: 'Balanced & Steady' }),
              summary: i18n.t('report.eng.stress.archetype.balancedAndSteady.summary', {
                defaultValue: 'Your demands and recovery are in a healthy balance right now.',
              }),
            },
  patternDetail: ({ dims, difficulty, resource }) => {
    const problems = dims.filter((d) => d.direction === 'problem')
    const resources = dims.filter((d) => d.direction === 'strength')
    const heaviest = [...problems].sort((a, b) => b.pct - a.pct)[0]
    const thinnest = [...resources].sort((a, b) => a.pct - b.pct)[0]
    const gap = difficulty - resource
    const connector =
      gap > 12
        ? i18n.t('report.eng.stress.patternDetail.demandsHeavier', {
            defaultValue: 'The demands side is clearly the heavier of the two right now — ',
          })
        : gap < -12
          ? i18n.t('report.eng.stress.patternDetail.reserveHigher', {
              defaultValue: 'You’ve got more in reserve than is being asked of you at the moment — ',
            })
          : i18n.t('report.eng.stress.patternDetail.evenlyMatched', {
              defaultValue: 'The two are fairly evenly matched — ',
            })
    return i18n.t('report.eng.stress.patternDetail.base', {
      difficulty,
      resource,
      connector,
      heaviest: lower(heaviest.label),
      thinnest: thinnest.strengthLabel,
      defaultValue:
        'Your demands are running at {{difficulty}}/100 and your capacity to recover sits at {{resource}}/100. {{connector}}{{heaviest}} is adding the most pressure, while {{thinnest}} is the resource most worth rebuilding.',
    })
  },
})

export function buildReport(data) {
  return buildAssessmentReport(data, buildConfig())
}
