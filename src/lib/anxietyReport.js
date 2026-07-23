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
 *
 * All user-facing prose is translated via the i18next singleton. The config is
 * rebuilt on every call (buildConfig) so the copy tracks the active language.
 */
import { buildAssessmentReport } from './reportEngine.js'
import i18n from '../i18n/index.js'

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)

/* Lowercase a translated label for mid-sentence use — only in English, where
   category labels read lowercased inline; other languages keep their casing. */
const lower = (s) => (i18n.language === 'en' ? s.toLowerCase() : s)

const DIRECTION = {
  worry: 'problem',
  rumination: 'problem',
  catastrophizing: 'problem',
  physical: 'problem',
  refocus: 'strength',
}

/* category labels — rebuilt per call so they follow the active language */
const buildLabels = () => ({
  worry: i18n.t('report.eng.anxiety.label.worry', { defaultValue: 'Worry' }),
  rumination: i18n.t('report.eng.anxiety.label.rumination', { defaultValue: 'Rumination' }),
  catastrophizing: i18n.t('report.eng.anxiety.label.catastrophizing', { defaultValue: 'Catastrophising' }),
  physical: i18n.t('report.eng.anxiety.label.physical', { defaultValue: 'Physical anxiety' }),
  refocus: i18n.t('report.eng.anxiety.label.refocus', { defaultValue: 'Ability to refocus' }),
})

/* ===== per-category copy (reassuring, non-clinical) — rebuilt per call ===== */
const buildContent = () => ({
  worry: {
    strengthLabel: i18n.t('report.eng.anxiety.content.worry.strengthLabel', { defaultValue: 'a calm baseline' }),
    blurb: i18n.t('report.eng.anxiety.content.worry.blurb', {
      defaultValue: 'How often anxious “what if” thoughts show up and how much space they take.',
    }),
    note: {
      low: i18n.t('report.eng.anxiety.content.worry.note.low', {
        defaultValue: 'Worry is staying in proportion — it shows up, but it isn’t running the show.',
      }),
      mid: i18n.t('report.eng.anxiety.content.worry.note.mid', {
        defaultValue: 'Worry is a frequent visitor — enough to be tiring, though not constant.',
      }),
      high: i18n.t('report.eng.anxiety.content.worry.note.high', {
        defaultValue: 'Worry is loud and frequent right now. That’s draining — and it’s also very workable.',
      }),
    },
    bullets: i18n.t('report.eng.anxiety.content.worry.bullets', {
      returnObjects: true,
      defaultValue: [
        'Worry is the mind trying to keep you safe — it over-fires, but it isn’t a flaw or a diagnosis.',
        'Most worries never happen; naming the specific fear shrinks it more than pushing it away.',
      ],
    }),
    try: i18n.t('report.eng.anxiety.content.worry.try', {
      defaultValue:
        'Set a 10-minute “worry window” each day — write the worries down then, and gently postpone them the rest of the day.',
    }),
  },
  rumination: {
    strengthLabel: i18n.t('report.eng.anxiety.content.rumination.strengthLabel', { defaultValue: 'a settled mind' }),
    blurb: i18n.t('report.eng.anxiety.content.rumination.blurb', {
      defaultValue: 'How much your mind replays past moments or loops on the same thoughts.',
    }),
    note: {
      low: i18n.t('report.eng.anxiety.content.rumination.note.low', {
        defaultValue: 'You’re not getting too stuck — thoughts come and go without looping for long.',
      }),
      mid: i18n.t('report.eng.anxiety.content.rumination.note.mid', {
        defaultValue: 'Some looping is happening — replaying conversations or decisions more than helps.',
      }),
      high: i18n.t('report.eng.anxiety.content.rumination.note.high', {
        defaultValue:
          'Your mind is caught in replay a lot. Looping feels productive but rarely resolves anything — that’s the trap.',
      }),
    },
    bullets: i18n.t('report.eng.anxiety.content.rumination.bullets', {
      returnObjects: true,
      defaultValue: [
        'Rumination masquerades as problem-solving, but it mostly recycles the problem without moving it.',
        'Shifting the body — a short walk, cold water — breaks a loop faster than thinking your way out.',
      ],
    }),
    try: i18n.t('report.eng.anxiety.content.rumination.try', {
      defaultValue:
        'When you notice the loop, name it (“that’s rumination”) and change your physical state — stand up, move, step outside.',
    }),
  },
  catastrophizing: {
    strengthLabel: i18n.t('report.eng.anxiety.content.catastrophizing.strengthLabel', {
      defaultValue: 'a balanced outlook',
    }),
    blurb: i18n.t('report.eng.anxiety.content.catastrophizing.blurb', {
      defaultValue: 'How often your mind jumps to the worst-case version of things.',
    }),
    note: {
      low: i18n.t('report.eng.anxiety.content.catastrophizing.note.low', {
        defaultValue: 'You’re mostly keeping perspective — the worst-case isn’t your default.',
      }),
      mid: i18n.t('report.eng.anxiety.content.catastrophizing.note.mid', {
        defaultValue: 'The worst-case shows up fairly often, colouring how risky things feel.',
      }),
      high: i18n.t('report.eng.anxiety.content.catastrophizing.note.high', {
        defaultValue:
          'Your mind leaps to the worst-case a lot. It feels like foresight, but it’s the anxiety talking, not the odds.',
      }),
    },
    bullets: i18n.t('report.eng.anxiety.content.catastrophizing.bullets', {
      returnObjects: true,
      defaultValue: [
        'Catastrophising overweights the scary outcome and underweights your ability to cope with it.',
        'Asking “what’s most likely?” and “could I handle it?” gently rebalances the picture.',
      ],
    }),
    try: i18n.t('report.eng.anxiety.content.catastrophizing.try', {
      defaultValue:
        'When you catch a worst-case thought, jot the feared outcome, the most likely outcome, and one way you’d cope.',
    }),
  },
  physical: {
    strengthLabel: i18n.t('report.eng.anxiety.content.physical.strengthLabel', { defaultValue: 'a settled body' }),
    blurb: i18n.t('report.eng.anxiety.content.physical.blurb', {
      defaultValue: 'How much anxiety shows up in your body — tension, racing heart, restlessness, shallow breath.',
    }),
    note: {
      low: i18n.t('report.eng.anxiety.content.physical.note.low', {
        defaultValue: 'Your body is staying fairly settled — anxiety isn’t showing up much physically.',
      }),
      mid: i18n.t('report.eng.anxiety.content.physical.note.mid', {
        defaultValue: 'There’s some physical tension — a tight chest, restlessness, or shallow breathing at times.',
      }),
      high: i18n.t('report.eng.anxiety.content.physical.note.high', {
        defaultValue:
          'Anxiety is showing up strongly in your body. Body and mind feed each other — calming one calms the other.',
      }),
    },
    bullets: i18n.t('report.eng.anxiety.content.physical.bullets', {
      returnObjects: true,
      defaultValue: [
        'Physical anxiety is your nervous system on high alert — real and very treatable, not weakness.',
        'Slow exhales are the fastest off-switch: a longer breath out tells the body it’s safe.',
      ],
    }),
    try: i18n.t('report.eng.anxiety.content.physical.try', {
      defaultValue:
        'Breathe in for 4, out for 6, for two minutes. The longer out-breath is what settles the nervous system.',
    }),
  },
  refocus: {
    strengthLabel: i18n.t('report.eng.anxiety.content.refocus.strengthLabel', { defaultValue: 'ability to refocus' }),
    blurb: i18n.t('report.eng.anxiety.content.refocus.blurb', {
      defaultValue: 'How well you can step out of an anxious spiral and bring your attention back.',
    }),
    note: {
      low: i18n.t('report.eng.anxiety.content.refocus.note.low', {
        defaultValue: 'This steadying skill is still developing — right now it’s hard to step out once the spiral starts.',
      }),
      mid: i18n.t('report.eng.anxiety.content.refocus.note.mid', {
        defaultValue: 'You can sometimes redirect your attention, though it doesn’t always hold.',
      }),
      high: i18n.t('report.eng.anxiety.content.refocus.note.high', {
        defaultValue:
          'You’re genuinely good at catching the spiral and refocusing. This is your strongest lever — lean on it.',
      }),
    },
    bullets: i18n.t('report.eng.anxiety.content.refocus.bullets', {
      returnObjects: true,
      defaultValue: [
        'Noticing “I’m spiralling” and redirecting is the single most protective anxiety skill there is.',
        'It’s a muscle, not a trait — every time you redirect on purpose, it gets a little easier.',
      ],
    }),
    try: i18n.t('report.eng.anxiety.content.refocus.try', {
      defaultValue:
        'Pick one grounding anchor — five things you can see, or your feet on the floor — and use it the moment you notice the spin.',
    }),
  },
})

/* full engine config — rebuilt per call so every translated string is fresh */
const buildConfig = () => ({
  scoreDirection: 'lower_is_better',
  direction: DIRECTION,
  label: buildLabels(),
  content: buildContent(),
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
      ? {
          name: i18n.t('report.eng.anxiety.archetype.caughtInTheSpin.name', { defaultValue: 'Caught in the Spin' }),
          summary: i18n.t('report.eng.anxiety.archetype.caughtInTheSpin.summary', {
            defaultValue: 'High anxious thinking with little ability to step out of it — and that ability is buildable.',
          }),
        }
      : difficulty >= 50 && resource >= 50
        ? {
            name: i18n.t('report.eng.anxiety.archetype.anxiousButAware.name', { defaultValue: 'Anxious but Aware' }),
            summary: i18n.t('report.eng.anxiety.archetype.anxiousButAware.summary', {
              defaultValue: 'Strong worry and overthinking, but you can catch and redirect it.',
            }),
          }
        : difficulty < 50 && resource < 50
          ? {
              name: i18n.t('report.eng.anxiety.archetype.quietlyTense.name', { defaultValue: 'Quietly Tense' }),
              summary: i18n.t('report.eng.anxiety.archetype.quietlyTense.summary', {
                defaultValue: 'Lower-grade anxiety, but few tools yet to settle it when it rises.',
              }),
            }
          : {
              name: i18n.t('report.eng.anxiety.archetype.steadyMind.name', { defaultValue: 'Steady Mind' }),
              summary: i18n.t('report.eng.anxiety.archetype.steadyMind.summary', {
                defaultValue: 'Low anxiety and a good ability to refocus.',
              }),
            },
  patternDetail: ({ dims, difficulty, resource }) => {
    const problems = dims.filter((d) => d.direction === 'problem')
    const heaviest = [...problems].sort((a, b) => b.pct - a.pct)[0]
    const connector =
      resource >= 50
        ? i18n.t('report.eng.anxiety.patternDetail.reassuring', {
            defaultValue:
              'The reassuring part: you can already catch and redirect the spiral — that’s the lever everything else turns on. ',
          })
        : i18n.t('report.eng.anxiety.patternDetail.build', {
            defaultValue:
              'The most useful thing to build is that catch-and-redirect skill — it’s what turns the volume down. ',
          })
    return i18n.t('report.eng.anxiety.patternDetail.base', {
      difficulty,
      resource,
      connector,
      heaviest: lower(heaviest.label),
      defaultValue:
        'Your anxious thinking averages {{difficulty}}/100, while your ability to refocus sits at {{resource}}/100. {{connector}}Right now {{heaviest}} is the loudest of the four.',
    })
  },
})

export function buildAnxietyReport(data) {
  return buildAssessmentReport(data, buildConfig())
}
