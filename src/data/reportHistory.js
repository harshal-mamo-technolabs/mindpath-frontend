import { getAssessment } from './assessments.js'

/**
 * Demo report archive. Each assessment can have multiple takes over time
 * (retakes are encouraged every 60–90 days), so reports are grouped by
 * topic and ordered oldest → newest to tell a progress story.
 *
 * TODAY is fixed so "days ago" and retake eligibility stay stable in the demo.
 */
export const TODAY = new Date('2026-06-11T12:00:00')
const RETAKE_DAYS = 60

const mean = (dims) => {
  const v = Object.values(dims)
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length)
}

const RAW = [
  {
    id: 'stress-burnout',
    takes: [
      { date: '2025-12-10', dims: { exhaustion: 78, cynicism: 64, control: 58, recovery: 80 } },
      { date: '2026-02-14', dims: { exhaustion: 70, cynicism: 55, control: 50, recovery: 68 } },
      { date: '2026-03-28', dims: { exhaustion: 58, cynicism: 47, control: 42, recovery: 55 } },
    ],
  },
  {
    id: 'sleep-rest',
    takes: [
      { date: '2026-04-20', dims: { debt: 72, winddown: 78, rhythm: 60, nightworry: 70 } },
      { date: '2026-05-28', dims: { debt: 60, winddown: 70, rhythm: 50, nightworry: 58 } },
    ],
  },
  {
    id: 'emotional-intelligence',
    takes: [
      { date: '2026-05-22', dims: { awareness: 58, regulation: 44, empathy: 71, expression: 39 } },
    ],
  },
]

export function daysSince(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`)
  return Math.round((TODAY - d) / 86400000)
}

export function fmtDate(dateStr, long = false) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: long ? 'long' : 'short',
    year: 'numeric',
  })
}

export const REPORT_GROUPS = RAW.map((g) => {
  const assessment = getAssessment(g.id)
  const takes = g.takes.map((t) => ({ ...t, overall: mean(t.dims) }))
  const first = takes[0]
  const latest = takes[takes.length - 1]
  const delta = latest.overall - first.overall // signed change in overall score
  // For "load" topics a lower score is better; for "strength" topics, higher.
  const improved = assessment.direction === 'load' ? delta < 0 : delta > 0
  const betterWord = assessment.direction === 'load' ? 'lighter' : 'stronger'
  const lastDays = daysSince(latest.date)
  const retakeIn = Math.max(0, RETAKE_DAYS - lastDays)
  return {
    ...g,
    assessment,
    takes,
    first,
    latest,
    delta,
    improved,
    betterWord,
    lastDays,
    retakeIn,
    eligible: retakeIn === 0,
  }
})

export const TOTAL_REPORTS = REPORT_GROUPS.reduce((n, g) => n + g.takes.length, 0)

/** Largest improvement across all multi-take groups (for the header stat). */
export const BEST_IMPROVEMENT = REPORT_GROUPS.filter((g) => g.takes.length > 1).reduce(
  (best, g) =>
    Math.abs(g.delta) > Math.abs(best?.delta ?? 0) && g.improved ? g : best,
  null
)
