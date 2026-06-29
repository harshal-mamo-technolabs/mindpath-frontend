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
 */
import { buildAssessmentReport } from './reportEngine.js'

const DIRECTION = {
  awareness: 'strength',
  regulation: 'strength',
  empathy: 'strength',
  relationships: 'strength',
  motivation: 'strength',
}

const LABEL = {
  awareness: 'Self-Awareness',
  regulation: 'Self-Regulation',
  empathy: 'Empathy',
  relationships: 'Relationship Management',
  motivation: 'Motivation',
}

const PROFILE = {
  awareness: 'The Reflective',
  regulation: 'The Composed',
  empathy: 'The Attuned',
  relationships: 'The Connector',
  motivation: 'The Driven',
}

/* positive 5-band scale (matches the reference EI report) */
export const eiBand = (v) =>
  v <= 20 ? 'Emerging' : v <= 40 ? 'Developing' : v <= 60 ? 'Moderate' : v <= 80 ? 'Strong' : 'Exceptional'

/* ===== per-category copy — growth framed as upside, never deficit ===== */
const CONTENT = {
  awareness: {
    strengthLabel: 'self-awareness',
    blurb: 'How clearly you notice your own emotions, triggers, and patterns as they happen.',
    note: {
      low: 'Self-awareness is your biggest area to grow — noticing what you feel, as you feel it, is the foundation everything else builds on.',
      mid: 'You’re building real self-awareness — you catch your emotions some of the time, and that’s growing.',
      high: 'You read your own emotions clearly and early. That insight is the engine of every other EI skill.',
    },
    bullets: [
      'Naming an emotion as it arises (“I’m frustrated”) is the single most powerful EI habit — it creates a pause before reaction.',
      'Self-awareness is a skill, not a fixed trait; brief daily check-ins build it surprisingly fast.',
    ],
    try: 'Twice a day, pause and name what you’re feeling in one word. No fixing — just noticing.',
  },
  regulation: {
    strengthLabel: 'self-regulation',
    blurb: 'How well you manage strong emotions and respond on purpose rather than on impulse.',
    note: {
      low: 'Self-regulation is a key area to build — strong feelings tend to drive the response before you can choose it. Very learnable.',
      mid: 'You can steady yourself some of the time; under real pressure it’s still a work in progress.',
      high: 'You handle strong emotions well — you can feel them fully and still choose your response.',
    },
    bullets: [
      'Regulation isn’t suppression — it’s feeling the emotion and still choosing the response.',
      'A slow exhale or a short pause buys the few seconds that turn reaction into choice.',
    ],
    try: 'Next time you feel a surge, take one slow breath before responding — that pause is the whole skill.',
  },
  empathy: {
    strengthLabel: 'empathy',
    blurb: 'How well you sense and understand what other people are feeling.',
    note: {
      low: 'Empathy is an area with real room to grow — tuning into others’ feelings is a skill that strengthens with attention.',
      mid: 'You pick up on others’ emotions some of the time; it deepens the more you look for it.',
      high: 'You read others well — you sense what people feel, often before they say it. A genuine strength.',
    },
    bullets: [
      'Empathy starts with curiosity — asking “what might they be feeling?” before responding.',
      'Listening to understand, rather than to reply, is the fastest way to strengthen it.',
    ],
    try: 'In one conversation today, focus entirely on understanding the other person’s feeling before you respond.',
  },
  relationships: {
    strengthLabel: 'relationship skills',
    blurb: 'How well you build, maintain, and navigate relationships — including the tricky moments.',
    note: {
      low: 'Managing relationships is your biggest growth area — handling tension and connection on purpose is a learnable craft.',
      mid: 'You manage relationships reasonably well; the harder conversations are where it’s still growing.',
      high: 'You navigate relationships skilfully — connecting, and handling friction without it derailing things.',
    },
    bullets: [
      'Most relationship skill is repair, not perfection — naming and mending small ruptures keeps trust strong.',
      'Clear, kind directness beats avoidance almost every time.',
    ],
    try: 'Have one slightly braver conversation this week — name something kindly that you’d normally let slide.',
  },
  motivation: {
    strengthLabel: 'inner drive',
    blurb: 'How much internal drive and persistence you bring toward what matters to you.',
    note: {
      low: 'Motivation is an area to nurture — reconnecting to what genuinely matters to you is where drive gets rebuilt.',
      mid: 'Your drive is there but uneven — stronger when the “why” is clear, thinner when it isn’t.',
      high: 'You’ve got real internal drive — you keep moving toward what matters without needing constant external push.',
    },
    bullets: [
      'Durable motivation comes from meaning, not willpower — a clear “why” outlasts any push.',
      'Small, visible progress feeds drive more than distant goals do.',
    ],
    try: 'Write down the one reason your current goal matters to you, and keep it somewhere you’ll see it.',
  },
}

export const EI_CONFIG = {
  scoreDirection: 'higher_is_better',
  direction: DIRECTION,
  label: LABEL,
  content: CONTENT,
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
    summary: `Your profile leads with ${dominant.label}.`,
  }),
  patternDetail: ({ dominant, priorities }) =>
    `Your profile leads with ${dominant.label} (${dominant.pct}%). The highest-leverage place to grow is ${priorities[0].label} (${priorities[0].pct}%) — real room to build, not a weakness.`,
}

export function buildEiReport(data) {
  return buildAssessmentReport(data, EI_CONFIG)
}
