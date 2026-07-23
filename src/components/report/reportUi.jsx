/**
 * Per-assessment presentation config for the shared <AssessmentReport/>.
 *
 * The view-model (lib/*Report.js) holds the numbers and copy that depend on the
 * user's scores; this holds the static, assessment-specific chrome: section
 * titles, axis labels, icons, generic habits, closing copy.
 *
 * Each config is a FUNCTION (not a plain object) so its copy is resolved through
 * i18next on every call — a language switch re-renders the report in the new
 * language. English strings are the inline `defaultValue`s, so the report reads
 * correctly in English even before translations load. Icons and routes are not
 * translatable and stay as-is.
 */
import {
  Anchor,
  Armchair,
  BatteryCharging,
  BedDouble,
  Brain,
  CloudLightning,
  CloudRain,
  Compass,
  Crosshair,
  Eye,
  Flame,
  Focus,
  Headphones,
  Heart,
  HeartHandshake,
  HeartPulse,
  Hourglass,
  ListChecks,
  Moon,
  Repeat,
  Rocket,
  Shuffle,
  Star,
  Sun,
  Users,
  Zap,
} from 'lucide-react'
import i18n from '../../i18n/index.js'

const t = (key, defaultValue, opts) => i18n.t(key, { defaultValue, ...opts })
const arr = (key, defaultValue) => i18n.t(key, { returnObjects: true, defaultValue })

/* ===================== Stress & Burnout (lower-is-better) ===================== */
export const STRESS_UI = () => ({
  kicker: t('report.ui.stress.kicker', 'Stress & burnout'),
  headTitle: (name) =>
    i18n.t('report.ui.stress.headTitle', {
      name,
      defaultValue: '{{name}}, here’s how stress and burnout are showing up for you.',
    }),
  assessmentName: t('report.ui.stress.assessmentName', 'Stress & Burnout Profile'),
  gaugeLabel: t('report.ui.stress.gaugeLabel', '/ 100 load'),
  headlinePillSuffix: t('report.ui.stress.headlinePillSuffix', ' load'),
  scoreSentence: (v) =>
    i18n.t('report.ui.stress.scoreSentence', {
      v,
      defaultValue:
        'Your overall load is {{v}} / 100. This blends all the areas together — problems add to the load, and your strengths take away from it.',
    }),
  spectrum: {
    segments: ['seg-low', 'seg-mid', 'seg-high'],
    scale: arr('report.ui.stress.spectrumScale', ['0 · light', '50', '100 · heavy']),
  },
  miniHeadlineLabel: t('report.ui.stress.miniHeadlineLabel', 'Overall load'),
  miniPriorityLabel: t('report.ui.stress.miniPriorityLabel', 'Focus areas'),
  miniThirdLabel: t('report.ui.stress.miniThirdLabel', 'Biggest cause'),
  patternTitle: t('report.ui.stress.patternTitle', 'Your burnout pattern'),
  patternFoot: t(
    'report.ui.stress.patternFoot',
    'Burnout sits in the bottom-right corner — lots of demands and little recovery. The further your dot is from there, the safer you are.',
  ),
  quadXLabel: t('report.ui.stress.quadXLabel', 'more demands →'),
  quadYLabel: t('report.ui.stress.quadYLabel', 'more recovery →'),
  quads: {
    TL: t('report.ui.stress.quads.TL', 'Balanced & steady'),
    TR: t('report.ui.stress.quads.TR', 'Busy but coping'),
    BL: t('report.ui.stress.quads.BL', 'Quiet but tired'),
    BR: t('report.ui.stress.quads.BR', 'Running on empty'),
  },
  balanceTop: t('report.ui.stress.balanceTop', 'Demands'),
  balanceBottom: t('report.ui.stress.balanceBottom', 'Recovery'),
  radarTitle: t('report.ui.stress.radarTitle', 'Where the load sits'),
  radarCaption: t('report.ui.stress.radarCaption', 'A bigger shape means more stress in that area.'),
  driversTitle: t('report.ui.stress.driversTitle', 'What’s adding the most stress'),
  catIcons: {
    exhaustion: BatteryCharging,
    cynicism: Brain,
    workload: Flame,
    recovery: Heart,
    control: Compass,
  },
  legendWarm: t('report.ui.stress.legendWarm', 'warm = stress (shorter is better)'),
  legendGreen: t('report.ui.stress.legendGreen', 'green = strengths (longer is better)'),
  habitsTitle: t('report.ui.stress.habitsTitle', 'Five daily habits'),
  habits: arr('report.ui.stress.habits', [
    'Take one real break each day — a proper lunch away from your screen, or a short walk.',
    'Do the tiring tasks in one block instead of spreading them across the whole day.',
    'Set one limit you can keep: a set finish time, or notifications off after a certain hour.',
    'Each day, name one thing you got to decide for yourself — it helps you feel more in control.',
    'End the day by noting one moment that felt good, however small.',
  ]),
  closingBaseline: t(
    'report.ui.stress.closingBaseline',
    'This is your starting point. There’s nothing to fix today — just one small thing to work on. Come back in 60–90 days and see what changes.',
  ),
  closingReturn: t(
    'report.ui.stress.closingReturn',
    'This is one more check-in on your path — watch how these numbers change over time. Change is the proof.',
  ),
  doors: [
    { to: '/audio', Icon: Headphones, label: t('report.ui.stress.doors.audio', 'Start your daily audio plan') },
    { to: '/counselling', Icon: Heart, label: t('report.ui.stress.doors.counselling', 'Talk to someone') },
  ],
})

/* ===================== Sleep, Rest & Recovery (higher-is-better) ===================== */
export const SLEEP_UI = () => ({
  kicker: t('report.ui.sleep.kicker', 'Sleep, rest & recovery'),
  headTitle: (name) =>
    i18n.t('report.ui.sleep.headTitle', {
      name,
      defaultValue: '{{name}}, here’s how your sleep and recovery are holding up.',
    }),
  assessmentName: t('report.ui.sleep.assessmentName', 'Sleep, Rest & Recovery Profile'),
  gaugeLabel: t('report.ui.sleep.gaugeLabel', '/ 100 score'),
  headlinePillSuffix: t('report.ui.sleep.headlinePillSuffix', ''),
  scoreSentence: (v) =>
    i18n.t('report.ui.sleep.scoreSentence', {
      v,
      defaultValue:
        'Your sleep and recovery score is {{v}} / 100. It blends how easily you sleep with how well you recover. Higher is better.',
    }),
  // reversed track: low score sits in the red zone (left), strong in the green (right)
  spectrum: {
    segments: ['seg-high', 'seg-mid', 'seg-low'],
    scale: arr('report.ui.sleep.spectrumScale', ['0 · low', '50', '100 · strong']),
  },
  miniHeadlineLabel: t('report.ui.sleep.miniHeadlineLabel', 'Sleep & Recovery'),
  miniPriorityLabel: t('report.ui.sleep.miniPriorityLabel', 'Focus areas'),
  miniThirdLabel: t('report.ui.sleep.miniThirdLabel', 'Biggest cause'),
  patternTitle: t('report.ui.sleep.patternTitle', 'Your sleep pattern'),
  patternFoot: t(
    'report.ui.sleep.patternFoot',
    'The best corner is the top-left — easy sleep and strong recovery. The further your dot is from the bottom-right, the better you’re sleeping.',
  ),
  quadXLabel: t('report.ui.sleep.quadXLabel', 'more sleep trouble →'),
  quadYLabel: t('report.ui.sleep.quadYLabel', 'more recovery →'),
  quads: {
    TL: t('report.ui.sleep.quads.TL', 'Rested & recharged'),
    TR: t('report.ui.sleep.quads.TR', 'Restless but coping'),
    BL: t('report.ui.sleep.quads.BL', 'Calm but not rested'),
    BR: t('report.ui.sleep.quads.BR', 'Wired and worn out'),
  },
  balanceTop: t('report.ui.sleep.balanceTop', 'Sleep trouble'),
  balanceBottom: t('report.ui.sleep.balanceBottom', 'Recovery'),
  radarTitle: t('report.ui.sleep.radarTitle', 'Where your sleep stands'),
  radarCaption: t(
    'report.ui.sleep.radarCaption',
    'A bigger shape means better sleep and recovery in that area.',
  ),
  driversTitle: t('report.ui.sleep.driversTitle', 'What needs the most attention'),
  catIcons: {
    sleeplessness: Moon,
    quality: Star,
    rest: Armchair,
    energy: Sun,
    winddown: BedDouble,
  },
  legendWarm: t('report.ui.sleep.legendWarm', 'warm = sleep trouble (shorter is better)'),
  legendGreen: t('report.ui.sleep.legendGreen', 'green = sleep and recovery (longer is better)'),
  habitsTitle: t('report.ui.sleep.habitsTitle', 'Five better-sleep habits'),
  habits: arr('report.ui.sleep.habits', [
    'Wake up at the same time every day, weekends too — a steady wake-up time sets the whole rhythm.',
    'Get daylight within an hour of waking up — it helps you feel sleepy earlier at night.',
    'Stop caffeine after early afternoon — it stays in your body longer than you think.',
    'Turn the lights down and put screens away for the last hour — give your brain time to slow down.',
    'If you can’t sleep, get up and reset instead of lying there — keep your bed just for sleep.',
  ]),
  closingBaseline: t(
    'report.ui.sleep.closingBaseline',
    'This is your sleep starting point. Pick one habit above and try it for two weeks — sleep changes slowly at first, then all at once.',
  ),
  closingReturn: t(
    'report.ui.sleep.closingReturn',
    'This is one more check-in on your path — watch how these numbers change over time. Change is the proof.',
  ),
  doors: [
    { to: '/audio', Icon: Headphones, label: t('report.ui.sleep.doors.audio', 'Start a sleep audio plan') },
    { to: '/counselling', Icon: Heart, label: t('report.ui.sleep.doors.counselling', 'Talk to someone') },
  ],
})

/* ===================== Anxiety & Overthinking (lower-is-better) ===================== */
export const ANXIETY_UI = () => ({
  kicker: t('report.ui.anxiety.kicker', 'Anxiety & overthinking'),
  headTitle: (name) =>
    i18n.t('report.ui.anxiety.headTitle', {
      name,
      defaultValue: '{{name}}, here’s how anxiety and overthinking are showing up for you.',
    }),
  assessmentName: t('report.ui.anxiety.assessmentName', 'Anxiety & Overthinking Style'),
  gaugeLabel: t('report.ui.anxiety.gaugeLabel', '/ 100 load'),
  headlinePillSuffix: t('report.ui.anxiety.headlinePillSuffix', ' load'),
  scoreSentence: (v) =>
    i18n.t('report.ui.anxiety.scoreSentence', {
      v,
      defaultValue:
        'Your overall load is {{v}} / 100. This blends all the areas — anxious habits add to the load, and your ability to refocus takes away from it.',
    }),
  spectrum: {
    segments: ['seg-low', 'seg-mid', 'seg-high'],
    scale: arr('report.ui.anxiety.spectrumScale', ['0 · calm', '50', '100 · loud']),
  },
  miniHeadlineLabel: t('report.ui.anxiety.miniHeadlineLabel', 'Overall load'),
  miniPriorityLabel: t('report.ui.anxiety.miniPriorityLabel', 'Focus areas'),
  miniThirdLabel: t('report.ui.anxiety.miniThirdLabel', 'Biggest cause'),
  patternTitle: t('report.ui.anxiety.patternTitle', 'Your anxiety pattern'),
  patternFoot: t(
    'report.ui.anxiety.patternFoot',
    'Being “caught in the spin” sits in the bottom-right — lots of anxious thinking with little room to step back. The further your dot is from there, the calmer things are.',
  ),
  quadXLabel: t('report.ui.anxiety.quadXLabel', 'more anxious thinking →'),
  quadYLabel: t('report.ui.anxiety.quadYLabel', 'more able to refocus →'),
  quads: {
    TL: t('report.ui.anxiety.quads.TL', 'Steady mind'),
    TR: t('report.ui.anxiety.quads.TR', 'Anxious but aware'),
    BL: t('report.ui.anxiety.quads.BL', 'Quietly tense'),
    BR: t('report.ui.anxiety.quads.BR', 'Caught in the spin'),
  },
  balanceTop: t('report.ui.anxiety.balanceTop', 'Anxious thinking'),
  balanceBottom: t('report.ui.anxiety.balanceBottom', 'Refocus'),
  radarTitle: t('report.ui.anxiety.radarTitle', 'Where the load sits'),
  radarCaption: t('report.ui.anxiety.radarCaption', 'A bigger shape means more anxiety in that area.'),
  driversTitle: t('report.ui.anxiety.driversTitle', 'What’s adding the most anxiety'),
  catIcons: {
    worry: CloudRain,
    rumination: Repeat,
    catastrophizing: CloudLightning,
    physical: HeartPulse,
    refocus: Focus,
  },
  legendWarm: t('report.ui.anxiety.legendWarm', 'warm = anxiety (shorter is better)'),
  legendGreen: t('report.ui.anxiety.legendGreen', 'green = ability to refocus (longer is better)'),
  habitsTitle: t('report.ui.anxiety.habitsTitle', 'Five calming habits'),
  habits: arr('report.ui.anxiety.habits', [
    'Name it to calm it — when anxiety rises, say to yourself “this is worry.” Naming it loosens its hold.',
    'Breathe out slowly when your body tightens — in for 4, out for 6. The long out-breath helps you feel safe.',
    'Give worry a set time — 10 minutes to write it down, so it doesn’t spill into the whole day.',
    'Move when you get stuck — a short walk or changing rooms stops the loop faster than thinking harder.',
    'Come back to your senses — name five things you can see, or feel your feet on the floor — to step out of the spin.',
  ]),
  closingBaseline: t(
    'report.ui.anxiety.closingBaseline',
    'This is your starting point — a snapshot of your habits, not a label. Pick one calming habit above and practise it gently. These numbers change with practice.',
  ),
  closingReturn: t(
    'report.ui.anxiety.closingReturn',
    'This is one more check-in on your path — watch how these numbers settle over time. Practice is the proof.',
  ),
  doors: [
    { to: '/audio', Icon: Headphones, label: t('report.ui.anxiety.doors.audio', 'Start a calming audio plan') },
    { to: '/counselling', Icon: Heart, label: t('report.ui.anxiety.doors.counselling', 'Talk to someone') },
  ],
})

/* ===================== Emotional Intelligence (all-strength, higher-is-better) ===================== */
export const EI_UI = () => ({
  kicker: t('report.ui.ei.kicker', 'Emotional intelligence'),
  headTitle: (name) =>
    i18n.t('report.ui.ei.headTitle', {
      name,
      defaultValue: '{{name}}, here’s your emotional-intelligence profile.',
    }),
  assessmentName: t('report.ui.ei.assessmentName', 'Emotional Intelligence Profile'),
  gaugeLabel: t('report.ui.ei.gaugeLabel', '/ 100 EI'),
  headlinePillSuffix: t('report.ui.ei.headlinePillSuffix', ' EI'),
  scoreSentence: (v) =>
    i18n.t('report.ui.ei.scoreSentence', {
      v,
      defaultValue: 'Your EI score is {{v}} / 100 — the average across your five areas. Higher is stronger.',
    }),
  // blue → amber → green: a low score sits in the growth (blue) zone, not red
  spectrum: {
    segments: ['seg-growth', 'seg-mid', 'seg-low'],
    scale: arr('report.ui.ei.spectrumScale', ['0 · early', '50', '100 · very strong']),
  },
  miniHeadlineLabel: t('report.ui.ei.miniHeadlineLabel', 'EI score'),
  miniPriorityLabel: t('report.ui.ei.miniPriorityLabel', 'Growth areas'),
  miniThirdLabel: t('report.ui.ei.miniThirdLabel', 'Strongest'),
  miniThirdKey: 'dominant',
  patternTitle: t('report.ui.ei.patternTitle', 'Your EI profile'),
  patternFoot: t(
    'report.ui.ei.patternFoot',
    'A few strong areas lift the rest — your growth areas are simply the best place to build next.',
  ),
  radarTitle: t('report.ui.ei.radarTitle', 'Your five areas'),
  radarCaption: t(
    'report.ui.ei.radarCaption',
    'A bigger shape means stronger emotional intelligence in that area.',
  ),
  driversTitle: t('report.ui.ei.driversTitle', 'The best areas to grow next'),
  catIcons: {
    awareness: Eye,
    regulation: Anchor,
    empathy: HeartHandshake,
    relationships: Users,
    motivation: Rocket,
  },
  legendWarm: t('report.ui.ei.legendWarm', ''), // no problem categories → no warm bars
  legendGreen: t('report.ui.ei.legendGreen', 'every bar is green — longer is stronger'),
  habitsTitle: t('report.ui.ei.habitsTitle', 'Five habits that build EI'),
  habits: arr('report.ui.ei.habits', [
    'Name your feeling as it comes up — “I’m anxious,” “I’m excited.” Naming it builds the self-awareness everything else rests on.',
    'Pause before you react — one slow breath turns a snap reaction into a choice.',
    'Get curious about others — ask “what might they be feeling?” before you reply.',
    'Fix small upsets early — a quick, honest “that came out wrong” keeps trust strong.',
    'Remember your why — keep the reason your goals matter somewhere you’ll see it.',
  ]),
  closingBaseline: t(
    'report.ui.ei.closingBaseline',
    'This is your starting point — a map of your strengths and room to grow, not a judgement. Emotional intelligence can be learned; pick one habit above and practise it.',
  ),
  closingReturn: t(
    'report.ui.ei.closingReturn',
    'This is one more check-in on your growth — watch these areas climb over time. Practice is the proof.',
  ),
  doors: [
    { to: '/audio', Icon: Headphones, label: t('report.ui.ei.doors.audio', 'Start a guided practice') },
    { to: '/counselling', Icon: Heart, label: t('report.ui.ei.doors.counselling', 'Talk to someone') },
  ],
})

/* ===================== Focus & Productivity (mixed, higher-is-better) ===================== */
export const FOCUS_UI = () => ({
  kicker: t('report.ui.focus.kicker', 'Focus & productivity'),
  headTitle: (name) =>
    i18n.t('report.ui.focus.headTitle', {
      name,
      defaultValue: '{{name}}, here’s how your focus and productivity are holding up.',
    }),
  assessmentName: t('report.ui.focus.assessmentName', 'Focus & Productivity Profile'),
  gaugeLabel: t('report.ui.focus.gaugeLabel', '/ 100 score'),
  headlinePillSuffix: t('report.ui.focus.headlinePillSuffix', ''),
  scoreSentence: (v) =>
    i18n.t('report.ui.focus.scoreSentence', {
      v,
      defaultValue:
        'Your focus and productivity score is {{v}} / 100. It blends how little you get distracted with how strong your focus skills are. Higher is better.',
    }),
  spectrum: {
    segments: ['seg-high', 'seg-mid', 'seg-low'],
    scale: arr('report.ui.focus.spectrumScale', ['0 · low', '50', '100 · strong']),
  },
  miniHeadlineLabel: t('report.ui.focus.miniHeadlineLabel', 'Focus & Productivity'),
  miniPriorityLabel: t('report.ui.focus.miniPriorityLabel', 'Focus areas'),
  miniThirdLabel: t('report.ui.focus.miniThirdLabel', 'Biggest cause'),
  patternTitle: t('report.ui.focus.patternTitle', 'Your focus pattern'),
  patternFoot: t(
    'report.ui.focus.patternFoot',
    'The best corner is the top-left — few distractions and strong skills. The further your dot is from the bottom-right, the more you’re in the zone.',
  ),
  quadXLabel: t('report.ui.focus.quadXLabel', 'more distraction →'),
  quadYLabel: t('report.ui.focus.quadYLabel', 'more skill →'),
  quads: {
    TL: t('report.ui.focus.quads.TL', 'In the zone'),
    TR: t('report.ui.focus.quads.TR', 'Willing but distracted'),
    BL: t('report.ui.focus.quads.BL', 'Calm but coasting'),
    BR: t('report.ui.focus.quads.BR', 'Scattered and stuck'),
  },
  balanceTop: t('report.ui.focus.balanceTop', 'Distraction'),
  balanceBottom: t('report.ui.focus.balanceBottom', 'Skill'),
  radarTitle: t('report.ui.focus.radarTitle', 'Where your focus stands'),
  radarCaption: t(
    'report.ui.focus.radarCaption',
    'A bigger shape means stronger focus and productivity in that area.',
  ),
  driversTitle: t('report.ui.focus.driversTitle', 'What’s pulling your score down'),
  catIcons: {
    distractibility: Shuffle,
    procrastination: Hourglass,
    attention: Crosshair,
    management: ListChecks,
    motivation: Zap,
  },
  legendWarm: t('report.ui.focus.legendWarm', 'warm = distraction (shorter is better)'),
  legendGreen: t('report.ui.focus.legendGreen', 'green = focus skills (longer is better)'),
  habitsTitle: t('report.ui.focus.habitsTitle', 'Five focus habits'),
  habits: arr('report.ui.focus.habits', [
    'Work in short blocks — 25 focused minutes, phone away, one task. Short and clear beats long and scattered.',
    'Start before you feel ready — do just two minutes on the thing you’re avoiding, and the rest follows.',
    'Do one thing at a time — finish it before you open the next. Switching is where focus leaks away.',
    'Plan your day in two minutes — pick the three things that matter and do the hardest first.',
    'Fix your surroundings, not just your willpower — remove the nearest distraction before you start.',
  ]),
  closingBaseline: t(
    'report.ui.focus.closingBaseline',
    'This is your starting point — a snapshot of your habits, not a judgement. Pick one focus habit above and try it for two weeks. These numbers change with practice.',
  ),
  closingReturn: t(
    'report.ui.focus.closingReturn',
    'This is one more check-in on your path — watch how these numbers climb over time. Practice is the proof.',
  ),
  doors: [
    { to: '/audio', Icon: Headphones, label: t('report.ui.focus.doors.audio', 'Start a focus audio plan') },
    { to: '/counselling', Icon: Heart, label: t('report.ui.focus.doors.counselling', 'Talk to someone') },
  ],
})
