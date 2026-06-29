/**
 * Registry of assessments that have a full visual report.
 *
 * Maps each assessment slug → { build, ui, accent, Icon }:
 *   build  — view-model builder (lib/*Report.js)
 *   ui     — presentation config (reportUi.jsx)
 *   accent — topic colour for the report chrome and the reports-library cards
 *   Icon   — topic icon (lucide) for the reports-library cards
 *
 * Shared by AssessmentTake (post-submit render + report JSON), the Reports
 * library (grouping/trends), and the single-report view. Slugs carry "and" in
 * the live app; the no-"and" spellings are kept as aliases.
 */
import { Brain, Crosshair, Flame, HeartHandshake, Moon } from 'lucide-react'
import { buildReport as buildStress } from '../../lib/stressReport.js'
import { buildSleepReport } from '../../lib/sleepReport.js'
import { buildAnxietyReport } from '../../lib/anxietyReport.js'
import { buildEiReport } from '../../lib/eiReport.js'
import { buildFocusReport } from '../../lib/focusReport.js'
import { STRESS_UI, SLEEP_UI, ANXIETY_UI, EI_UI, FOCUS_UI } from './reportUi.jsx'

const STRESS = { build: buildStress, ui: STRESS_UI, accent: '#c2604a', Icon: Flame }
const SLEEP = { build: buildSleepReport, ui: SLEEP_UI, accent: '#4f63b8', Icon: Moon }
const ANXIETY = { build: buildAnxietyReport, ui: ANXIETY_UI, accent: '#6450cf', Icon: Brain }
const EI = { build: buildEiReport, ui: EI_UI, accent: '#3c7a5e', Icon: HeartHandshake }
const FOCUS = { build: buildFocusReport, ui: FOCUS_UI, accent: '#c98a2c', Icon: Crosshair }

export const RICH_REPORTS = {
  'stress-and-burnout-profile': STRESS,
  'sleep-rest-and-recovery-profile': SLEEP,
  'sleep-rest-recovery-profile': SLEEP,
  'anxiety-and-overthinking-style': ANXIETY,
  'anxiety-overthinking-style': ANXIETY,
  'emotional-intelligence-profile': EI,
  'focus-and-productivity-profile': FOCUS,
  'focus-productivity-profile': FOCUS,
}

export const getRichReport = (slug) => RICH_REPORTS[slug] || null
