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
import i18n from '../i18n/index.js'

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)

// translate a sleep-report key, with the original English as the fallback
const t = (path, opts) => i18n.t(`report.eng.sleep.${path}`, opts)

const DIRECTION = {
  sleeplessness: 'problem',
  quality: 'strength',
  rest: 'strength',
  energy: 'strength',
  winddown: 'strength',
}

/**
 * Build the config fresh on every report so all copy tracks the live language
 * (i18next is a singleton read imperatively at call time).
 */
function buildSleepConfig() {
  const LABEL = {
    sleeplessness: t('label.sleeplessness', { defaultValue: 'Sleeplessness' }),
    quality: t('label.quality', { defaultValue: 'Sleep quality' }),
    rest: t('label.rest', { defaultValue: 'Rest & downtime' }),
    energy: t('label.energy', { defaultValue: 'Daytime energy' }),
    winddown: t('label.winddown', { defaultValue: 'Wind-down routine' }),
  }

  /* ===== per-category copy (supportive, non-clinical) ===== */
  const CONTENT = {
    sleeplessness: {
      // positive phrasing when sleeplessness is low (a problem doing well)
      strengthLabel: t('content.sleeplessness.strengthLabel', { defaultValue: 'easy sleep onset' }),
      blurb: t('content.sleeplessness.blurb', {
        defaultValue: 'How much trouble you have falling asleep, staying asleep, or settling a busy mind at night.',
      }),
      note: {
        low: t('content.sleeplessness.note.low', {
          defaultValue: 'Sleep is coming fairly easily — you’re falling and staying asleep without much of a fight.',
        }),
        mid: t('content.sleeplessness.note.mid', {
          defaultValue: 'Sleep is bumpy — some nights you lie awake or wake and struggle to drop back off.',
        }),
        high: t('content.sleeplessness.note.high', {
          defaultValue:
            'You’re wrestling with sleep often — trouble falling or staying asleep. This is the piece most worth tending.',
        }),
      },
      bullets: t('content.sleeplessness.bullets', {
        returnObjects: true,
        defaultValue: [
          'A racing mind at night is usually daytime overflow — what’s unprocessed surfaces once it’s finally quiet.',
          'Sleeplessness responds to a steady wind-down far better than to “trying harder” to fall asleep.',
        ],
      }),
      try: t('content.sleeplessness.try', {
        defaultValue:
          'If you’re awake past ~20 minutes, get up, keep lights low, and do something dull until sleepy — keep the bed for sleep, not struggle.',
      }),
    },
    quality: {
      strengthLabel: t('content.quality.strengthLabel', { defaultValue: 'sleep quality' }),
      blurb: t('content.quality.blurb', {
        defaultValue: 'How restorative your sleep actually feels — deep, unbroken, and leaving you refreshed.',
      }),
      note: {
        low: t('content.quality.note.low', {
          defaultValue: 'Your sleep isn’t restoring you much — light or broken nights that don’t leave you refreshed.',
        }),
        mid: t('content.quality.note.mid', {
          defaultValue: 'Your sleep quality is okay but inconsistent — some genuinely good nights, some that don’t land.',
        }),
        high: t('content.quality.note.high', {
          defaultValue: 'Your sleep is genuinely restorative — deep, refreshing rest. A real asset to lean on.',
        }),
      },
      bullets: t('content.quality.bullets', {
        returnObjects: true,
        defaultValue: [
          'Quality beats quantity — seven solid hours rebuilds you more than nine broken ones.',
          'A cool, dark, screen-free room is the single biggest lever on sleep quality.',
        ],
      }),
      try: t('content.quality.try', {
        defaultValue: 'Make the room properly cool and dark tonight — eye mask or blackout — and notice how the morning feels.',
      }),
    },
    rest: {
      strengthLabel: t('content.rest.strengthLabel', { defaultValue: 'rest & downtime' }),
      blurb: t('content.rest.blurb', {
        defaultValue: 'How much genuine rest and downtime you get while awake — not just sleep, but true off-duty time.',
      }),
      note: {
        low: t('content.rest.note.low', {
          defaultValue: 'Daytime rest is thin — you’re rarely fully off-duty, so the day never lets up before night.',
        }),
        mid: t('content.rest.note.mid', {
          defaultValue: 'You get some downtime, but it’s patchy — rest that’s often half-attention or interrupted.',
        }),
        high: t('content.rest.note.high', {
          defaultValue: 'You give yourself real downtime — genuine off-duty pockets that let the system settle.',
        }),
      },
      bullets: t('content.rest.bullets', {
        returnObjects: true,
        defaultValue: [
          'Rest while awake sets up rest while asleep — a day with no pauses rarely ends in a calm night.',
          'Real rest is undivided — scrolling counts less than ten quiet minutes with nothing demanded of you.',
        ],
      }),
      try: t('content.rest.try', {
        defaultValue: 'Schedule one genuinely off-duty pocket tomorrow — no phone, no task — and protect it like an appointment.',
      }),
    },
    energy: {
      strengthLabel: t('content.energy.strengthLabel', { defaultValue: 'daytime energy' }),
      blurb: t('content.energy.blurb', {
        defaultValue: 'How much steady, usable energy you have through the day — the daytime payoff of good rest.',
      }),
      note: {
        low: t('content.energy.note.low', {
          defaultValue: 'Daytime energy is running low — you’re pushing through dips rather than feeling genuinely fuelled.',
        }),
        mid: t('content.energy.note.mid', {
          defaultValue: 'Your energy is okay but uneven — decent stretches broken by real slumps.',
        }),
        high: t('content.energy.note.high', {
          defaultValue: 'Your daytime energy is strong and steady — a clear sign your rest is doing its job.',
        }),
      },
      bullets: t('content.energy.bullets', {
        returnObjects: true,
        defaultValue: [
          'Steady energy is the clearest daytime read on whether your nights are working.',
          'Morning light and movement stabilise energy more reliably than caffeine timing.',
        ],
      }),
      try: t('content.energy.try', {
        defaultValue: 'Get a few minutes of daylight within an hour of waking — it anchors your body clock and steadies energy.',
      }),
    },
    winddown: {
      strengthLabel: t('content.winddown.strengthLabel', { defaultValue: 'wind-down routine' }),
      blurb: t('content.winddown.blurb', {
        defaultValue:
          'How consistent and calming your pre-sleep routine is — the runway that tells your body it’s nearly night.',
      }),
      note: {
        low: t('content.winddown.note.low', {
          defaultValue: 'There’s little wind-down — you go from full-on straight to lights-out, with no runway to land.',
        }),
        mid: t('content.winddown.note.mid', {
          defaultValue: 'You have some wind-down, but it’s inconsistent — good some nights, skipped on busy ones.',
        }),
        high: t('content.winddown.note.high', {
          defaultValue:
            'You’ve got a real wind-down routine — a consistent runway that eases you toward sleep. Lean on it.',
        }),
      },
      bullets: t('content.winddown.bullets', {
        returnObjects: true,
        defaultValue: [
          'A predictable runway matters more than a perfect one — the same order of calm steps, most nights.',
          'Dimming lights and screens in the last hour is the strongest cue that night is coming.',
        ],
      }),
      try: t('content.winddown.try', {
        defaultValue:
          'Pick a fixed “last hour” ritual — dim lights, no screens, one calm activity — and run it three nights this week.',
      }),
    },
  }

  return {
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
        ? {
            name: t('archetype.wiredWorn.name', { defaultValue: 'Wired & Worn' }),
            summary: t('archetype.wiredWorn.summary', {
              defaultValue: 'Trouble sleeping and low recovery — sleep needs real attention.',
            }),
          }
        : difficulty >= 50 && resource >= 50
          ? {
              name: t('archetype.restlessButResourced.name', { defaultValue: 'Restless but Resourced' }),
              summary: t('archetype.restlessButResourced.summary', {
                defaultValue: 'Sleep is disrupted, but you have recovery habits to build on.',
              }),
            }
          : difficulty < 50 && resource < 50
            ? {
                name: t('archetype.quietButUnderRested.name', { defaultValue: 'Quiet but Under-rested' }),
                summary: t('archetype.quietButUnderRested.summary', {
                  defaultValue: 'You fall asleep okay, but you’re not truly recovering.',
                }),
              }
            : {
                name: t('archetype.restedRecharged.name', { defaultValue: 'Rested & Recharged' }),
                summary: t('archetype.restedRecharged.summary', {
                  defaultValue: 'Healthy sleep and recovery across the board.',
                }),
              },
    patternDetail: ({ dims, difficulty, resource }) => {
      const resources = dims.filter((d) => d.direction === 'strength')
      const thinnest = [...resources].sort((a, b) => a.pct - b.pct)[0]
      const connector =
        difficulty >= 50
          ? t('patternDetail.highDifficulty', {
              defaultValue: 'Falling and staying asleep is the harder part right now — ',
            })
          : t('patternDetail.lowDifficulty', { defaultValue: 'Getting to sleep isn’t the main issue — ' })
      return t('patternDetail.base', {
        difficulty,
        resource,
        connector,
        strengthLabel: thinnest.strengthLabel,
        defaultValue:
          'Your sleep difficulty reads {{difficulty}}/100, and your recovery resources — quality, rest, energy and wind-down — average {{resource}}/100. {{connector}}the resource most worth building is {{strengthLabel}}.',
      })
    },
  }
}

export function buildSleepReport(data) {
  return buildAssessmentReport(data, buildSleepConfig())
}
