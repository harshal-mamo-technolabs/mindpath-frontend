/**
 * Shared assessment-report engine.
 *
 * One scoring engine drives every wellness report. Each assessment supplies a
 * config (direction map, labels, copy, archetype rule) and the engine returns a
 * normalised view-model the generic <AssessmentReport/> renders.
 *
 * The only behavioural axis is `scoreDirection`:
 *   - 'lower_is_better'  → headline is a LOAD number (Burnout): less = healthier.
 *   - 'higher_is_better' → headline is a SCORE      (Sleep, EI): more = healthier.
 *
 * Internally everything is computed as "load" (problem → pct, strength →
 * 100−pct); the headline is flipped to a score when the assessment is positive.
 * Reports stay deterministic — same answers, same numbers.
 */

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)

/* problem band — higher load is worse */
export const loadBand = (v) => (v <= 33 ? 'low' : v <= 66 ? 'mid' : 'high')
/* strength band — higher pct is better */
export const strengthBand = (v) => (v <= 39 ? 'low' : v <= 66 ? 'mid' : 'high')

export const BAND_TEXT = {
  load: { low: 'Low', mid: 'Moderate', high: 'High' }, // problem categories / load headline
  strength: { low: 'Running low', mid: 'Building', high: 'Strong' }, // strength categories
  positive: { low: 'Low', mid: 'Developing', high: 'Strong' }, // positive headline (sleep, EI)
}

export const TAG_TEXT = {
  focus: 'Focus area',
  watch: 'Watch',
  good: 'Doing well',
  building: 'Building',
  strength: 'Strength',
  growth: 'Growth area', // all-strength profiles (EI): a low score is upside, not a problem
}

export const TAG_CLASS = {
  focus: 'band-hot',
  watch: 'band-mid',
  good: 'band-good',
  building: 'band-mid',
  strength: 'band-good',
  growth: 'band-blue', // distinct, non-alarming colour for growth areas
}

/* generic quadrant position from the two archetype axes (x = difficulty/bad,
   y = resource/good). Positions map to per-assessment names in the UI config. */
export function quadrantPosition(difficulty, resource) {
  if (difficulty >= 50 && resource >= 50) return 'TR'
  if (difficulty >= 50) return 'BR' // high difficulty, low resource — the danger corner
  if (resource >= 50) return 'TL' // low difficulty, high resource — the healthiest corner
  return 'BL'
}

/* default tag for the mixed problem/strength profiles */
function defaultTag(pct, dir) {
  return dir === 'problem'
    ? pct >= 67
      ? 'focus'
      : pct >= 34
        ? 'watch'
        : 'good'
    : pct <= 39
      ? 'focus'
      : pct <= 66
        ? 'building'
        : 'strength'
}

/**
 * Build the normalised report view-model.
 *
 * Required config: scoreDirection, direction{key→'problem'|'strength'},
 * label{key→text}, content{key→{strengthLabel,blurb,note{…},bullets[],try}},
 * selectPriorities(dims).
 *
 * Pattern: provide EITHER quadrant fields (difficulty, resource, archetype,
 * patternDetail) OR a profile fn (all-strength assessments like EI).
 *
 * Optional overrides (default to the mixed-profile behaviour, so existing
 * reports are unchanged): tagFor(pct,dir), bandTextFor(pct,dir), noteKeyFor(dim),
 * headlineBand(value)→{text,healthKey}, selectStrengths(dims).
 */
export function buildAssessmentReport(data, config) {
  const { scoreDirection, direction, label, content } = config
  const higher = scoreDirection === 'higher_is_better'

  const dims = (data.subCategoryScores || [])
    .filter((s) => direction[s.subCategory])
    .map((s) => {
      const dir = direction[s.subCategory]
      const pct = Math.round(s.percentage) // raw, for display
      const load = dir === 'problem' ? pct : 100 - pct // internal
      const health = 100 - load
      const tag = config.tagFor ? config.tagFor(pct, dir) : defaultTag(pct, dir)
      const band = dir === 'problem' ? loadBand(pct) : strengthBand(pct) // 3-band, default note key
      const noteKey = config.noteKeyFor ? config.noteKeyFor({ pct, dir, tag, band }) : band
      const c = content[s.subCategory] || {}
      return {
        key: s.subCategory,
        label: label[s.subCategory] || s.subCategory,
        direction: dir,
        pct,
        load,
        health,
        raw: s.score,
        max: s.maxScore,
        tag,
        band,
        bandText: config.bandTextFor
          ? config.bandTextFor(pct, dir)
          : BAND_TEXT[dir === 'problem' ? 'load' : 'strength'][band],
        tagText: TAG_TEXT[tag],
        tagClass: TAG_CLASS[tag],
        blurb: c.blurb || '',
        strengthLabel: c.strengthLabel || (label[s.subCategory] || '').toLowerCase(),
        note: c.note ? c.note[noteKey] : '',
        bullets: c.bullets || [],
        tryThis: c.try || '',
        // radar plots health when higher-is-better (bigger = healthier), else load
        radarValue: higher ? health : load,
      }
    })

  const overallLoad = Math.round(mean(dims.map((d) => d.load)))
  const headlineValue = higher ? 100 - overallLoad : overallLoad

  let headlineBandText, healthKey
  if (config.headlineBand) {
    const hb = config.headlineBand(headlineValue)
    headlineBandText = hb.text
    healthKey = hb.healthKey
  } else {
    const key = higher ? strengthBandToPos(headlineValue) : loadBand(headlineValue)
    headlineBandText = higher ? BAND_TEXT.positive[key] : BAND_TEXT.load[key]
    // gauge/pill colour: good=green when healthy
    healthKey = higher
      ? key === 'high'
        ? 'good'
        : key === 'mid'
          ? 'ok'
          : 'poor'
      : key === 'low'
        ? 'good'
        : key === 'mid'
          ? 'ok'
          : 'poor'
  }

  const topByLoad = [...dims].sort((a, b) => b.load - a.load)
  const priorities = config.selectPriorities(dims)
  const strengths = config.selectStrengths
    ? config.selectStrengths(dims)
    : dims.filter(
        (d) => (d.direction === 'strength' && d.pct >= 67) || (d.direction === 'problem' && d.pct <= 33),
      )
  const topDriver = topByLoad[0] // most load
  const brightSpot = topByLoad[topByLoad.length - 1] // least load = strongest / best
  const dominant = brightSpot

  // "A closer read" — always populated: the two biggest load contributors plus
  // the one bright spot, deduped, so the section is meaningful for any profile.
  const insights = []
  const seen = new Set()
  for (const d of [topByLoad[0], topByLoad[1], brightSpot]) {
    if (d && !seen.has(d.key)) {
      seen.add(d.key)
      insights.push(d)
    }
  }

  // Pattern section: quadrant (mixed profiles) or profile label (all-strength).
  let pattern
  if (config.profile) {
    pattern = { mode: 'profile' }
  } else {
    const difficulty = Math.round(config.difficulty(dims))
    const resource = Math.round(config.resource(dims))
    pattern = {
      mode: 'quadrant',
      difficulty,
      resource,
      quadActive: quadrantPosition(difficulty, resource),
    }
  }
  const archetype = config.profile ? config.profile(dims, dominant) : config.archetype(pattern)
  const patternDetail = config.patternDetail({
    dims,
    topByLoad,
    priorities,
    dominant,
    difficulty: pattern.difficulty,
    resource: pattern.resource,
  })

  return {
    attempt: data.attemptNumber || 1,
    scoreDirection,
    headline: { value: headlineValue, bandText: headlineBandText, healthKey },
    overallLoad,
    dims,
    topByLoad,
    priorities,
    strengths,
    topDriver,
    brightSpot,
    dominant,
    insights,
    archetype,
    pattern,
    difficulty: pattern.difficulty,
    resource: pattern.resource,
    quadActive: pattern.quadActive,
    patternDetail,
  }
}

/* positive headline uses the same 0–33 / 34–66 / 67–100 buckets as the bands */
function strengthBandToPos(v) {
  return v <= 33 ? 'low' : v <= 66 ? 'mid' : 'high'
}
