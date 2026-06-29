/**
 * Serialise a report view-model into JSON for POST /api/scores/<scoreId>/report.
 *
 * This is the FULL-TEXT version: every piece of copy the on-screen / PDF report
 * shows is captured here, section by section — header, snapshot, pattern,
 * drivers, every category's blurb + note, the "closer read" bullets and tips,
 * the action plan, habits, and closing/disclaimer. Nothing visible is omitted.
 *
 * Pure: reads the engine view-model (lib/*Report.js) and the assessment's UI
 * copy (components/report/reportUi.jsx); never touches React or icon objects.
 */

/* static copy that the report component renders as fixed strings */
const HEADER_NOTE =
  'A self-awareness tool generated from your answers — not a clinical or diagnostic assessment.'
const LEAN_ON_TEXT =
  'This is what’s working for you right now. Spend it deliberately on the focus areas above — it’s what makes the rest of the plan stick.'
const DISCLAIMER =
  'MindPath is a self-reflection tool, not a clinical assessment, diagnosis, or treatment. If you’re struggling, reaching out to a licensed professional is a brave and worthwhile next step.'

const dateLabel = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : null

/**
 * @param report view-model from build*Report(data)
 * @param ui     the assessment's UI config (STRESS_UI, SLEEP_UI, …)
 * @param meta   { slug, name, generatedAt }
 */
export function buildReportJson(report, ui, meta = {}) {
  const r = report
  const name = meta.name || 'You'
  const planFocus = r.priorities.length ? r.priorities : r.topByLoad.slice(0, 2)
  const leanOn = r.strengths[0] || r.brightSpot
  const spotlight = ui.miniThirdKey === 'dominant' ? r.dominant : r.topDriver
  const completed = dateLabel(meta.generatedAt)

  return {
    schemaVersion: 2,
    generatedAt: meta.generatedAt || null,
    assessment: {
      slug: meta.slug || null,
      name: ui.assessmentName,
      kicker: ui.kicker,
      scoreDirection: r.scoreDirection, // ← backend denormalises from here
    },
    // Top-level summary at the exact paths the backend extracts for its
    // list/detail `report` block (headlineValue/Band, archetype) — keeps the
    // denormalisation working without the backend chasing nested paths.
    score: { value: r.headline.value, band: r.headline.bandText, label: ui.miniHeadlineLabel },
    archetype: { name: r.archetype.name, summary: r.archetype.summary },

    header: {
      eyebrow: `${ui.kicker} · attempt ${r.attempt}`,
      title: ui.headTitle(name),
      completed: completed ? `Completed ${completed} · ${ui.assessmentName}` : ui.assessmentName,
      note: HEADER_NOTE,
    },

    snapshot: {
      gauge: { value: r.headline.value, outOf: 100, unit: ui.gaugeLabel },
      band: `${r.headline.bandText}${ui.headlinePillSuffix || ''}`,
      spectrumScale: ui.spectrum.scale,
      archetype: r.archetype.name,
      text: `${r.archetype.summary} ${ui.scoreSentence(r.headline.value)}`,
      stats: [
        { value: `${r.headline.value}/100`, label: `${ui.miniHeadlineLabel} · ${r.headline.bandText}` },
        { value: `${r.priorities.length} / ${r.dims.length}`, label: ui.miniPriorityLabel },
        { value: spotlight?.label, label: `${ui.miniThirdLabel} · ${spotlight?.pct}%` },
      ],
    },

    pattern: {
      title: ui.patternTitle,
      mode: r.pattern.mode,
      archetype: r.archetype.name,
      detail: r.patternDetail,
      footnote: ui.patternFoot,
      ...(r.pattern.mode === 'profile'
        ? {
            spread: [...r.dims]
              .sort((a, b) => b.pct - a.pct)
              .map((d) => ({ label: d.label, percentage: d.pct, tag: d.tagText })),
          }
        : {
            axisLabels: { x: ui.quadXLabel, y: ui.quadYLabel },
            quadrants: { ...ui.quads, active: r.quadActive, activeLabel: ui.quads[r.quadActive] },
            balance: [
              { label: ui.balanceTop, value: r.difficulty },
              { label: ui.balanceBottom, value: r.resource },
            ],
          }),
    },

    profileChart: {
      title: ui.radarTitle,
      caption: ui.radarCaption,
      axisLabels: r.dims.map((d) => d.label.split(' ')[0]),
      drivers: {
        title: ui.driversTitle,
        items: r.topByLoad.slice(0, 3).map((d, i) => ({
          rank: i + 1,
          label: d.label,
          band: d.bandText,
          note: d.note,
        })),
      },
    },

    categories: {
      title: 'Category by category',
      legend: [ui.legendWarm, ui.legendGreen].filter(Boolean),
      items: r.dims.map((d) => ({
        key: d.key,
        label: d.label,
        blurb: d.blurb,
        percentage: d.pct,
        score: `${d.raw}/${d.max}`,
        direction: d.direction,
        barColor: d.direction === 'problem' ? 'warm' : 'green',
        tag: d.tagText,
        band: d.bandText,
        note: d.note,
      })),
    },

    closerRead: {
      title: 'A closer read',
      items: r.insights.map((d) => ({
        label: d.label,
        tag: d.tagText,
        band: d.bandText,
        bullets: d.bullets,
        tryThis: d.tryThis,
      })),
    },

    actionPlan: {
      title: 'Your action plan',
      focus: planFocus.map((d) => ({ tag: 'Focus', label: d.label, action: d.tryThis })),
      leanOn: leanOn
        ? { tag: 'Lean on this', title: `Lean on your ${leanOn.strengthLabel}`, text: LEAN_ON_TEXT }
        : null,
    },

    habits: { title: ui.habitsTitle, items: ui.habits },

    closing: {
      text: r.attempt > 1 ? ui.closingReturn : ui.closingBaseline,
      doors: ui.doors.map((d) => d.label),
      disclaimer: DISCLAIMER,
    },
  }
}

/** Fallback for assessments without a rich report — still carries its text. */
export function buildBasicReportJson(score, meta = {}) {
  return {
    schemaVersion: 2,
    generatedAt: meta.generatedAt || null,
    assessment: { slug: meta.slug || null, name: meta.assessmentName || null, hasRichReport: false },
    attempt: score.attemptNumber,
    headline: {
      value: score.rawPercentage ?? score.percentage,
      outOf: 100,
      label: 'Overall',
      raw: score.totalScore,
      max: score.maxScore,
    },
    categories: (score.subCategoryScores || []).map((s) => ({
      key: s.subCategory,
      percentage: Math.round(s.percentage),
      score: `${s.score}/${s.maxScore}`,
    })),
  }
}
