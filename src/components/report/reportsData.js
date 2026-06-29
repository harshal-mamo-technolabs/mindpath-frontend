/**
 * Turn the raw `GET /api/scores` list into the grouped, trend-ready shape the
 * Reports library renders. The frontend owns the scoring engine, so each
 * attempt's direction-aware headline + per-dimension breakdown is recomputed
 * from `subCategoryScores` via the registry (falling back to the backend's
 * denormalised `report` summary, then the raw percentage).
 */
import { getRichReport } from './registry.js'

const RETAKE_DAYS = 60
const titleCase = (s) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase())

/* gauge/pill colour key → band-chip class (matches the report styles) */
export const bandClassOf = (healthKey) =>
  healthKey === 'good'
    ? 'band-good'
    : healthKey === 'ok'
      ? 'band-mid'
      : healthKey === 'growth'
        ? 'band-blue'
        : healthKey === 'poor'
          ? 'band-hot'
          : 'band-mid'

const daysSince = (iso) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000))

/** Normalise one score record into a comparable "attempt". */
export function deriveAttempt(score) {
  const slug = score.assessment?.slug
  const rich = getRichReport(slug)
  let headline, band, healthKey, scoreDirection, dims

  if (rich) {
    // recompute the live report — single source of truth for headline + dims
    const vm = rich.build(score)
    headline = vm.headline.value
    band = vm.headline.bandText
    healthKey = vm.headline.healthKey
    scoreDirection = vm.scoreDirection
    dims = vm.dims.map((d) => ({
      key: d.key,
      label: d.label,
      pct: d.pct,
      direction: d.direction,
    }))
  } else if (score.report?.available) {
    // no client config → use the backend's denormalised summary
    headline = score.report.headlineValue
    band = score.report.headlineBand
    scoreDirection = score.report.scoreDirection
    dims = (score.subCategoryScores || []).map((s) => ({
      key: s.subCategory,
      label: titleCase(s.subCategory),
      pct: Math.round(s.percentage),
      direction: null,
    }))
  } else {
    // last resort — the raw (direction-naive) percentage
    headline = Math.round(score.rawPercentage ?? 0)
    band = null
    scoreDirection = null
    dims = (score.subCategoryScores || []).map((s) => ({
      key: s.subCategory,
      label: titleCase(s.subCategory),
      pct: Math.round(s.percentage),
      direction: null,
    }))
  }

  return {
    id: score.id,
    slug,
    name: score.assessment?.name || titleCase(slug),
    attemptNumber: score.attemptNumber,
    maxAttempts: score.maxAttempts,
    createdAt: score.createdAt,
    headline,
    band,
    bandClass: bandClassOf(healthKey),
    scoreDirection,
    dims,
  }
}

/** Group all scores by assessment, oldest→newest, with trend/retake metadata. */
export function groupScores(scores) {
  const bySlug = new Map()
  for (const s of scores || []) {
    const slug = s.assessment?.slug || 'unknown'
    if (!bySlug.has(slug)) bySlug.set(slug, [])
    bySlug.get(slug).push(s)
  }

  const groups = []
  for (const [slug, list] of bySlug) {
    const attempts = list
      .map(deriveAttempt)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    const first = attempts[0]
    const latest = attempts[attempts.length - 1]
    const rich = getRichReport(slug)
    const dir = latest.scoreDirection
    const higherIsBetter = dir === 'higher_is_better'
    const delta = latest.headline - first.headline
    const improved = higherIsBetter ? delta > 0 : dir === 'lower_is_better' ? delta < 0 : false
    const lastDays = daysSince(latest.createdAt)
    const retakeIn = Math.max(0, RETAKE_DAYS - lastDays)

    groups.push({
      slug,
      name: latest.name,
      accent: rich?.accent || '#6450cf',
      Icon: rich?.Icon || null,
      scoreDirection: dir,
      higherIsBetter,
      attempts,
      first,
      latest,
      count: attempts.length,
      delta,
      improved,
      betterWord: higherIsBetter ? 'higher' : 'lower',
      lastDays,
      retakeIn,
      eligible: retakeIn === 0,
    })
  }

  // most recently taken assessment first
  groups.sort((a, b) => new Date(b.latest.createdAt) - new Date(a.latest.createdAt))
  return groups
}

/** Header tallies for the library hero. */
export function reportTotals(groups) {
  const reports = groups.reduce((n, g) => n + g.count, 0)
  const best = groups
    .filter((g) => g.count > 1 && g.improved)
    .reduce((b, g) => (Math.abs(g.delta) > Math.abs(b?.delta ?? 0) ? g : b), null)
  return { reports, topics: groups.length, best }
}
