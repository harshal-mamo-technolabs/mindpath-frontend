/**
 * Emotional Intelligence — assessment config for the shared report engine.
 *
 * Every category is a STRENGTH, so this is an all-positive profile.
 * scoreDirection is 'higher_is_better'; the headline is an EI score (higher =
 * stronger). With no problem categories the EI score equals the mean of the
 * five percentages, but it's computed through the engine for consistency.
 *
 * This assessment uses the reference EI 5-band scale (Emerging → Exceptional)
 * and a blue "growth" tag — a low category is upside to build, never a deficit.
 *
 * All user-facing copy is translated through i18next. The config is rebuilt on
 * every call (see eiConfig()) so the active language is always reflected — the
 * strings are never frozen at import time.
 */
import { buildAssessmentReport } from './reportEngine.js'
import i18n from '../i18n/index.js'

const DIRECTION = {
  awareness: 'strength',
  regulation: 'strength',
  empathy: 'strength',
  relationships: 'strength',
  motivation: 'strength',
}

/* positive 5-band scale (matches the reference EI report) */
export const eiBand = (v) =>
  v <= 20
    ? i18n.t('report.eng.ei.band.emerging', { defaultValue: 'Emerging' })
    : v <= 40
      ? i18n.t('report.eng.ei.band.developing', { defaultValue: 'Developing' })
      : v <= 60
        ? i18n.t('report.eng.ei.band.moderate', { defaultValue: 'Moderate' })
        : v <= 80
          ? i18n.t('report.eng.ei.band.strong', { defaultValue: 'Strong' })
          : i18n.t('report.eng.ei.band.exceptional', { defaultValue: 'Exceptional' })

/* per-category labels (title case) */
const buildLabel = () => ({
  awareness: i18n.t('report.eng.ei.label.awareness', { defaultValue: 'Self-Awareness' }),
  regulation: i18n.t('report.eng.ei.label.regulation', { defaultValue: 'Self-Regulation' }),
  empathy: i18n.t('report.eng.ei.label.empathy', { defaultValue: 'Empathy' }),
  relationships: i18n.t('report.eng.ei.label.relationships', { defaultValue: 'Relationship Management' }),
  motivation: i18n.t('report.eng.ei.label.motivation', { defaultValue: 'Motivation' }),
})

/* profile name per dominant dimension (all-strength → no quadrant) */
const buildProfile = () => ({
  awareness: i18n.t('report.eng.ei.profile.awareness.name', { defaultValue: 'The Reflective' }),
  regulation: i18n.t('report.eng.ei.profile.regulation.name', { defaultValue: 'The Composed' }),
  empathy: i18n.t('report.eng.ei.profile.empathy.name', { defaultValue: 'The Attuned' }),
  relationships: i18n.t('report.eng.ei.profile.relationships.name', { defaultValue: 'The Connector' }),
  motivation: i18n.t('report.eng.ei.profile.motivation.name', { defaultValue: 'The Driven' }),
})

/* ===== per-category copy — growth framed as upside, never deficit ===== */
const buildContent = () => ({
  awareness: {
    strengthLabel: i18n.t('report.eng.ei.content.awareness.strengthLabel', { defaultValue: 'self-awareness' }),
    blurb: i18n.t('report.eng.ei.content.awareness.blurb', {
      defaultValue: 'How clearly you notice your own emotions, triggers, and patterns as they happen.',
    }),
    note: {
      low: i18n.t('report.eng.ei.content.awareness.note.low', {
        defaultValue:
          'Self-awareness is your biggest area to grow — noticing what you feel, as you feel it, is the foundation everything else builds on.',
      }),
      mid: i18n.t('report.eng.ei.content.awareness.note.mid', {
        defaultValue:
          'You’re building real self-awareness — you catch your emotions some of the time, and that’s growing.',
      }),
      high: i18n.t('report.eng.ei.content.awareness.note.high', {
        defaultValue:
          'You read your own emotions clearly and early. That insight is the engine of every other EI skill.',
      }),
    },
    bullets: i18n.t('report.eng.ei.content.awareness.bullets', {
      returnObjects: true,
      defaultValue: [
        'Naming an emotion as it arises (“I’m frustrated”) is the single most powerful EI habit — it creates a pause before reaction.',
        'Self-awareness is a skill, not a fixed trait; brief daily check-ins build it surprisingly fast.',
      ],
    }),
    try: i18n.t('report.eng.ei.content.awareness.try', {
      defaultValue: 'Twice a day, pause and name what you’re feeling in one word. No fixing — just noticing.',
    }),
  },
  regulation: {
    strengthLabel: i18n.t('report.eng.ei.content.regulation.strengthLabel', { defaultValue: 'self-regulation' }),
    blurb: i18n.t('report.eng.ei.content.regulation.blurb', {
      defaultValue: 'How well you manage strong emotions and respond on purpose rather than on impulse.',
    }),
    note: {
      low: i18n.t('report.eng.ei.content.regulation.note.low', {
        defaultValue:
          'Self-regulation is a key area to build — strong feelings tend to drive the response before you can choose it. Very learnable.',
      }),
      mid: i18n.t('report.eng.ei.content.regulation.note.mid', {
        defaultValue: 'You can steady yourself some of the time; under real pressure it’s still a work in progress.',
      }),
      high: i18n.t('report.eng.ei.content.regulation.note.high', {
        defaultValue: 'You handle strong emotions well — you can feel them fully and still choose your response.',
      }),
    },
    bullets: i18n.t('report.eng.ei.content.regulation.bullets', {
      returnObjects: true,
      defaultValue: [
        'Regulation isn’t suppression — it’s feeling the emotion and still choosing the response.',
        'A slow exhale or a short pause buys the few seconds that turn reaction into choice.',
      ],
    }),
    try: i18n.t('report.eng.ei.content.regulation.try', {
      defaultValue:
        'Next time you feel a surge, take one slow breath before responding — that pause is the whole skill.',
    }),
  },
  empathy: {
    strengthLabel: i18n.t('report.eng.ei.content.empathy.strengthLabel', { defaultValue: 'empathy' }),
    blurb: i18n.t('report.eng.ei.content.empathy.blurb', {
      defaultValue: 'How well you sense and understand what other people are feeling.',
    }),
    note: {
      low: i18n.t('report.eng.ei.content.empathy.note.low', {
        defaultValue:
          'Empathy is an area with real room to grow — tuning into others’ feelings is a skill that strengthens with attention.',
      }),
      mid: i18n.t('report.eng.ei.content.empathy.note.mid', {
        defaultValue: 'You pick up on others’ emotions some of the time; it deepens the more you look for it.',
      }),
      high: i18n.t('report.eng.ei.content.empathy.note.high', {
        defaultValue:
          'You read others well — you sense what people feel, often before they say it. A genuine strength.',
      }),
    },
    bullets: i18n.t('report.eng.ei.content.empathy.bullets', {
      returnObjects: true,
      defaultValue: [
        'Empathy starts with curiosity — asking “what might they be feeling?” before responding.',
        'Listening to understand, rather than to reply, is the fastest way to strengthen it.',
      ],
    }),
    try: i18n.t('report.eng.ei.content.empathy.try', {
      defaultValue:
        'In one conversation today, focus entirely on understanding the other person’s feeling before you respond.',
    }),
  },
  relationships: {
    strengthLabel: i18n.t('report.eng.ei.content.relationships.strengthLabel', { defaultValue: 'relationship skills' }),
    blurb: i18n.t('report.eng.ei.content.relationships.blurb', {
      defaultValue: 'How well you build, maintain, and navigate relationships — including the tricky moments.',
    }),
    note: {
      low: i18n.t('report.eng.ei.content.relationships.note.low', {
        defaultValue:
          'Managing relationships is your biggest growth area — handling tension and connection on purpose is a learnable craft.',
      }),
      mid: i18n.t('report.eng.ei.content.relationships.note.mid', {
        defaultValue:
          'You manage relationships reasonably well; the harder conversations are where it’s still growing.',
      }),
      high: i18n.t('report.eng.ei.content.relationships.note.high', {
        defaultValue:
          'You navigate relationships skilfully — connecting, and handling friction without it derailing things.',
      }),
    },
    bullets: i18n.t('report.eng.ei.content.relationships.bullets', {
      returnObjects: true,
      defaultValue: [
        'Most relationship skill is repair, not perfection — naming and mending small ruptures keeps trust strong.',
        'Clear, kind directness beats avoidance almost every time.',
      ],
    }),
    try: i18n.t('report.eng.ei.content.relationships.try', {
      defaultValue:
        'Have one slightly braver conversation this week — name something kindly that you’d normally let slide.',
    }),
  },
  motivation: {
    strengthLabel: i18n.t('report.eng.ei.content.motivation.strengthLabel', { defaultValue: 'inner drive' }),
    blurb: i18n.t('report.eng.ei.content.motivation.blurb', {
      defaultValue: 'How much internal drive and persistence you bring toward what matters to you.',
    }),
    note: {
      low: i18n.t('report.eng.ei.content.motivation.note.low', {
        defaultValue:
          'Motivation is an area to nurture — reconnecting to what genuinely matters to you is where drive gets rebuilt.',
      }),
      mid: i18n.t('report.eng.ei.content.motivation.note.mid', {
        defaultValue: 'Your drive is there but uneven — stronger when the “why” is clear, thinner when it isn’t.',
      }),
      high: i18n.t('report.eng.ei.content.motivation.note.high', {
        defaultValue:
          'You’ve got real internal drive — you keep moving toward what matters without needing constant external push.',
      }),
    },
    bullets: i18n.t('report.eng.ei.content.motivation.bullets', {
      returnObjects: true,
      defaultValue: [
        'Durable motivation comes from meaning, not willpower — a clear “why” outlasts any push.',
        'Small, visible progress feeds drive more than distant goals do.',
      ],
    }),
    try: i18n.t('report.eng.ei.content.motivation.try', {
      defaultValue: 'Write down the one reason your current goal matters to you, and keep it somewhere you’ll see it.',
    }),
  },
})

/* rebuilt each call so the active i18next language is always reflected */
const eiConfig = () => {
  const LABEL = buildLabel()
  const PROFILE = buildProfile()
  return {
    scoreDirection: 'higher_is_better',
    direction: DIRECTION,
    label: LABEL,
    content: buildContent(),
    // all-strength tag system: strength / building / growth (no problems)
    tagFor: (pct) => (pct >= 61 ? 'strength' : pct >= 41 ? 'building' : 'growth'),
    bandTextFor: (pct) => eiBand(pct),
    noteKeyFor: ({ tag }) => (tag === 'growth' ? 'low' : tag === 'building' ? 'mid' : 'high'),
    // EI 5-band headline → gauge colour: strong+ green, moderate amber, lower blue (growth, not alarm)
    headlineBand: (v) => ({ text: eiBand(v), healthKey: v >= 61 ? 'good' : v >= 41 ? 'ok' : 'growth' }),
    selectStrengths: (dims) => dims.filter((d) => d.pct >= 61),
    // growth areas = the three lowest dimensions (highest-leverage places to build)
    selectPriorities: (dims) => [...dims].sort((a, b) => a.pct - b.pct).slice(0, 3),
    // all-strength → profile label from the dominant dimension (no quadrant)
    profile: (dims, dominant) => ({
      name: PROFILE[dominant.key],
      summary: i18n.t('report.eng.ei.profile.summary', {
        label: dominant.label,
        defaultValue: 'Your profile leads with {{label}}.',
      }),
    }),
    patternDetail: ({ dominant, priorities }) =>
      i18n.t('report.eng.ei.patternDetail.text', {
        dominantLabel: dominant.label,
        dominantPct: dominant.pct,
        priorityLabel: priorities[0].label,
        priorityPct: priorities[0].pct,
        defaultValue:
          'Your profile leads with {{dominantLabel}} ({{dominantPct}}%). The highest-leverage place to grow is {{priorityLabel}} ({{priorityPct}}%) — real room to build, not a weakness.',
      }),
  }
}

export function buildEiReport(data) {
  return buildAssessmentReport(data, eiConfig())
}
