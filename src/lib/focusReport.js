/**
 * Focus & Productivity — assessment config for the shared report engine.
 *
 * Mixed profile: two PROBLEMS (distractibility, procrastination) and three
 * STRENGTHS (attention, management, motivation). Shown with a POSITIVE headline
 * (scoreDirection 'higher_is_better') — focus is something people want more of,
 * so the two problems pull the score down and the three strengths lift it.
 *
 * The headline is a Focus & Productivity score, never the raw API `percentage`
 * (which counts the problems the wrong way). The engine handles the maths.
 *
 * All user-facing copy is translated via i18next (slug `focus`). The config is
 * rebuilt on every call so it reflects the current language; the inline English
 * defaultValues are the source of truth and the seed for the translation files.
 */
import { buildAssessmentReport } from './reportEngine.js'
import i18n from '../i18n/index.js'

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)

// Lowercase a translated label for mid-sentence use — English only; other
// languages keep their own casing (e.g. German nouns stay capitalised).
const lower = (s) => (i18n.language === 'en' ? s.toLowerCase() : s)

const DIRECTION = {
  distractibility: 'problem',
  procrastination: 'problem',
  attention: 'strength',
  management: 'strength',
  motivation: 'strength',
}

// Build the config fresh each call so i18next resolves the active language.
function buildFocusConfig() {
  const LABEL = {
    distractibility: i18n.t('report.eng.focus.label.distractibility', { defaultValue: 'Distractibility' }),
    procrastination: i18n.t('report.eng.focus.label.procrastination', { defaultValue: 'Procrastination' }),
    attention: i18n.t('report.eng.focus.label.attention', { defaultValue: 'Sustained attention' }),
    management: i18n.t('report.eng.focus.label.management', { defaultValue: 'Task & time management' }),
    motivation: i18n.t('report.eng.focus.label.motivation', { defaultValue: 'Motivation & energy' }),
  }

  /* ===== per-category copy (supportive, non-clinical) ===== */
  const CONTENT = {
    distractibility: {
      strengthLabel: i18n.t('report.eng.focus.content.distractibility.strengthLabel', { defaultValue: 'steady focus' }),
      blurb: i18n.t('report.eng.focus.content.distractibility.blurb', {
        defaultValue: 'How easily your attention gets pulled away from what you meant to do.',
      }),
      note: {
        low: i18n.t('report.eng.focus.content.distractibility.note.low', {
          defaultValue: 'You hold your focus well — distractions don’t pull you off course much.',
        }),
        mid: i18n.t('report.eng.focus.content.distractibility.note.mid', {
          defaultValue: 'Distractions catch you fairly often — enough to fragment a focused stretch.',
        }),
        high: i18n.t('report.eng.focus.content.distractibility.note.high', {
          defaultValue:
            'You’re getting pulled off task a lot. That’s hard on follow-through — and very workable with the right setup.',
        }),
      },
      bullets: i18n.t('report.eng.focus.content.distractibility.bullets', {
        returnObjects: true,
        defaultValue: [
          'Most distraction is environmental, not a willpower failure — the fix is usually the setup, not trying harder.',
          'Every switch back to a task costs minutes of refocus; protecting a clear runway pays off fast.',
        ],
      }),
      try: i18n.t('report.eng.focus.content.distractibility.try', {
        defaultValue:
          'Pick one 25-minute block today with your phone in another room and notifications off. One block, fully protected.',
      }),
    },
    procrastination: {
      strengthLabel: i18n.t('report.eng.focus.content.procrastination.strengthLabel', { defaultValue: 'easy starts' }),
      blurb: i18n.t('report.eng.focus.content.procrastination.blurb', {
        defaultValue: 'How much you delay or avoid starting the things that matter.',
      }),
      note: {
        low: i18n.t('report.eng.focus.content.procrastination.note.low', {
          defaultValue: 'You tend to get started without much delay — avoidance isn’t a big drag on you.',
        }),
        mid: i18n.t('report.eng.focus.content.procrastination.note.mid', {
          defaultValue: 'Some delaying is happening — tasks slipping or starting later than you’d like.',
        }),
        high: i18n.t('report.eng.focus.content.procrastination.note.high', {
          defaultValue:
            'Putting things off is a real pattern right now. Starting is the hard part — and the part with the best leverage.',
        }),
      },
      bullets: i18n.t('report.eng.focus.content.procrastination.bullets', {
        returnObjects: true,
        defaultValue: [
          'Procrastination is usually about the feeling a task brings up, not laziness — shrinking the first step shrinks the dread.',
          'Starting is the whole battle; momentum almost always follows the first two minutes.',
        ],
      }),
      try: i18n.t('report.eng.focus.content.procrastination.try', {
        defaultValue:
          'Pick the task you’re avoiding and commit to just two minutes on it. Permission to stop after — you usually won’t.',
      }),
    },
    attention: {
      strengthLabel: i18n.t('report.eng.focus.content.attention.strengthLabel', { defaultValue: 'sustained attention' }),
      blurb: i18n.t('report.eng.focus.content.attention.blurb', {
        defaultValue: 'How well you can hold sustained concentration on one thing over time.',
      }),
      note: {
        low: i18n.t('report.eng.focus.content.attention.note.low', {
          defaultValue:
            'Sustained attention is the skill most worth building — holding focus over time is hard right now, and it’s trainable.',
        }),
        mid: i18n.t('report.eng.focus.content.attention.note.mid', {
          defaultValue: 'You can concentrate for a while, though it’s not yet a reliable, deep stretch.',
        }),
        high: i18n.t('report.eng.focus.content.attention.note.high', {
          defaultValue: 'You can sink into deep, sustained focus — a genuine asset for getting real work done.',
        }),
      },
      bullets: i18n.t('report.eng.focus.content.attention.bullets', {
        returnObjects: true,
        defaultValue: [
          'Attention is a muscle — focused blocks, even short ones, build the capacity for longer ones.',
          'Single-tasking trains attention; constant switching erodes it.',
        ],
      }),
      try: i18n.t('report.eng.focus.content.attention.try', {
        defaultValue:
          'Do one task at a time today, start to finish, before opening anything else. Notice how much further you get.',
      }),
    },
    management: {
      strengthLabel: i18n.t('report.eng.focus.content.management.strengthLabel', { defaultValue: 'task management' }),
      blurb: i18n.t('report.eng.focus.content.management.blurb', {
        defaultValue: 'How well you organise tasks, plan your time, and keep things from piling up.',
      }),
      note: {
        low: i18n.t('report.eng.focus.content.management.note.low', {
          defaultValue:
            'Task and time management is an area to build — without a system, things pile up and pull at your attention.',
        }),
        mid: i18n.t('report.eng.focus.content.management.note.mid', {
          defaultValue: 'You’ve got some structure, but it’s inconsistent — enough slips through to add friction.',
        }),
        high: i18n.t('report.eng.focus.content.management.note.high', {
          defaultValue: 'You manage tasks and time well — a clear system that keeps things moving and your head clear.',
        }),
      },
      bullets: i18n.t('report.eng.focus.content.management.bullets', {
        returnObjects: true,
        defaultValue: [
          'A trusted external list frees your mind from holding everything — and that frees up focus.',
          'Planning the day in a couple of minutes beats reacting to it for hours.',
        ],
      }),
      try: i18n.t('report.eng.focus.content.management.try', {
        defaultValue: 'Each morning, write the three things that would make the day a win — and do the hardest first.',
      }),
    },
    motivation: {
      strengthLabel: i18n.t('report.eng.focus.content.motivation.strengthLabel', { defaultValue: 'drive & energy' }),
      blurb: i18n.t('report.eng.focus.content.motivation.blurb', {
        defaultValue: 'How much drive and energy you bring to getting things done.',
      }),
      note: {
        low: i18n.t('report.eng.focus.content.motivation.note.low', {
          defaultValue: 'Drive is running low right now — reconnecting to why the work matters is where energy gets rebuilt.',
        }),
        mid: i18n.t('report.eng.focus.content.motivation.note.mid', {
          defaultValue: 'Your motivation is there but uneven — stronger when the goal is clear, thinner when it isn’t.',
        }),
        high: i18n.t('report.eng.focus.content.motivation.note.high', {
          defaultValue: 'You’ve got real drive and energy — a strong engine to point at what matters most.',
        }),
      },
      bullets: i18n.t('report.eng.focus.content.motivation.bullets', {
        returnObjects: true,
        defaultValue: [
          'Energy follows meaning — a clear “why” sustains effort better than any push.',
          'Visible progress feeds drive; break big goals into wins you can actually see.',
        ],
      }),
      try: i18n.t('report.eng.focus.content.motivation.try', {
        defaultValue: 'Name the one reason your current goal matters, and put it where you’ll see it while you work.',
      }),
    },
  }

  return {
    scoreDirection: 'higher_is_better',
    direction: DIRECTION,
    label: LABEL,
    content: CONTENT,
    selectPriorities: (dims) =>
      dims
        .filter((d) => d.load >= 50)
        .sort((a, b) => b.load - a.load)
        .slice(0, 3),
    // archetype axes: x = friction (the two problems), y = capability (the three strengths)
    difficulty: (dims) => mean(dims.filter((d) => d.direction === 'problem').map((d) => d.pct)),
    resource: (dims) => mean(dims.filter((d) => d.direction === 'strength').map((d) => d.pct)),
    archetype: ({ difficulty, resource }) =>
      difficulty >= 50 && resource < 50
        ? {
            name: i18n.t('report.eng.focus.archetype.scatteredStalling.name', { defaultValue: 'Scattered & Stalling' }),
            summary: i18n.t('report.eng.focus.archetype.scatteredStalling.summary', {
              defaultValue: 'High distraction and delay with limited focus tools — all of it buildable.',
            }),
          }
        : difficulty >= 50 && resource >= 50
          ? {
              name: i18n.t('report.eng.focus.archetype.willingButPulled.name', { defaultValue: 'Willing but Pulled' }),
              summary: i18n.t('report.eng.focus.archetype.willingButPulled.summary', {
                defaultValue: 'You have drive and ability, but distraction and delay keep derailing you.',
              }),
            }
          : difficulty < 50 && resource < 50
            ? {
                name: i18n.t('report.eng.focus.archetype.calmButCoasting.name', { defaultValue: 'Calm but Coasting' }),
                summary: i18n.t('report.eng.focus.archetype.calmButCoasting.summary', {
                  defaultValue: 'Few distractions, but low focus and drive — easy to drift.',
                }),
              }
            : {
                name: i18n.t('report.eng.focus.archetype.inTheZone.name', { defaultValue: 'In the Zone' }),
                summary: i18n.t('report.eng.focus.archetype.inTheZone.summary', {
                  defaultValue: 'Strong focus and follow-through with little friction.',
                }),
              },
    patternDetail: ({ dims, difficulty, resource }) => {
      const problems = dims.filter((d) => d.direction === 'problem')
      const resources = dims.filter((d) => d.direction === 'strength')
      const heaviest = [...problems].sort((a, b) => b.pct - a.pct)[0]
      const thinnest = [...resources].sort((a, b) => a.pct - b.pct)[0]
      const connector =
        difficulty >= resource
          ? i18n.t('report.eng.focus.patternDetail.frictionHeavier', {
              defaultValue: 'Right now the friction side is what’s pulling your score down — ',
            })
          : i18n.t('report.eng.focus.patternDetail.capabilityLifting', {
              defaultValue: 'Your capability is doing the heavy lifting — ',
            })
      return i18n.t('report.eng.focus.patternDetail.base', {
        difficulty,
        resource,
        connector,
        heaviest: lower(heaviest.label),
        thinnest: thinnest.strengthLabel,
        defaultValue:
          'Your friction — distraction and delay — averages {{difficulty}}/100, while your focus capability sits at {{resource}}/100. {{connector}}{{heaviest}} is the biggest drag, while {{thinnest}} is the skill most worth building.',
      })
    },
  }
}

export function buildFocusReport(data) {
  return buildAssessmentReport(data, buildFocusConfig())
}
