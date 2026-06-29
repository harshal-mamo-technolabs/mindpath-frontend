/**
 * Per-assessment presentation config for the shared <AssessmentReport/>.
 *
 * The view-model (lib/*Report.js) holds the numbers and copy that depend on the
 * user's scores; this holds the static, assessment-specific chrome: section
 * titles, axis labels, icons, generic habits, closing copy. One component, two
 * (soon more) assessments.
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

/* ===================== Stress & Burnout (lower-is-better) ===================== */
export const STRESS_UI = {
  kicker: 'Stress & burnout',
  headTitle: (name) => `${name}, here’s how stress and burnout are showing up for you.`,
  assessmentName: 'Stress & Burnout Profile',
  gaugeLabel: '/ 100 load',
  headlinePillSuffix: ' load',
  scoreSentence: (v) =>
    `Your overall load sits at ${v} / 100 — the average once every category is read in the right direction (problems as pressure, strengths as reserves).`,
  spectrum: { segments: ['seg-low', 'seg-mid', 'seg-high'], scale: ['0 · light', '50', '100 · heavy'] },
  miniHeadlineLabel: 'Overall load',
  miniPriorityLabel: 'Focus areas',
  miniThirdLabel: 'Top driver',
  patternTitle: 'Your burnout pattern',
  patternFoot:
    'Burnout lives in the bottom-right — high demands meeting low recovery. The further your dot sits from there, the more protected you are.',
  quadXLabel: 'more demands →',
  quadYLabel: 'more recovery →',
  quads: {
    TL: 'Balanced & steady',
    TR: 'Stretched but resourced',
    BL: 'Coasting on low reserves',
    BR: 'Running on empty',
  },
  balanceTop: 'Demands',
  balanceBottom: 'Recovery',
  radarTitle: 'Where the load sits',
  radarCaption: 'A bigger shape means more burnout load on that category.',
  driversTitle: 'What’s adding the most load',
  catIcons: {
    exhaustion: BatteryCharging,
    cynicism: Brain,
    workload: Flame,
    recovery: Heart,
    control: Compass,
  },
  legendWarm: 'warm = load (shorter is better)',
  legendGreen: 'green = resources (longer is better)',
  habitsTitle: 'Five daily habits',
  habits: [
    'Anchor the day with one fixed recovery moment — a real lunch away from the screen, or a short walk.',
    'Batch the draining tasks into one window instead of letting them bleed across the whole day.',
    'Set one boundary you can keep: a hard stop time, or notifications off after a certain hour.',
    'Name one thing each day you got to decide for yourself — it rebuilds a sense of control.',
    'Close the day by noting one moment that felt worthwhile, however small.',
  ],
  closingBaseline:
    'This is your baseline. There’s nothing to fix today — just one small thing to tend. Come back in 60–90 days and watch what shifts.',
  closingReturn:
    'This is one more data point on your path — watch how these numbers move over time. Movement is the proof.',
  doors: [
    { to: '/audio', Icon: Headphones, label: 'Start your daily audio plan' },
    { to: '/counselling', Icon: Heart, label: 'Talk to someone' },
  ],
}

/* ===================== Sleep, Rest & Recovery (higher-is-better) ===================== */
export const SLEEP_UI = {
  kicker: 'Sleep, rest & recovery',
  headTitle: (name) => `${name}, here’s how your sleep and recovery are holding up.`,
  assessmentName: 'Sleep, Rest & Recovery Profile',
  gaugeLabel: '/ 100 score',
  headlinePillSuffix: '',
  scoreSentence: (v) =>
    `Your Sleep & Recovery score is ${v} / 100 — a blend of how easily you sleep and how fully you recover. Higher is healthier.`,
  // reversed track: low score sits in the red zone (left), strong in the green (right)
  spectrum: { segments: ['seg-high', 'seg-mid', 'seg-low'], scale: ['0 · low', '50', '100 · strong'] },
  miniHeadlineLabel: 'Sleep & Recovery',
  miniPriorityLabel: 'Priority areas',
  miniThirdLabel: 'Top driver',
  patternTitle: 'Your sleep pattern',
  patternFoot:
    'The healthiest corner is the top-left — easy sleep meeting strong recovery. The further your dot sits from the bottom-right, the better you’re sleeping.',
  quadXLabel: 'more sleep trouble →',
  quadYLabel: 'more recovery →',
  quads: {
    TL: 'Rested & recharged',
    TR: 'Restless but resourced',
    BL: 'Quiet but under-rested',
    BR: 'Wired & worn',
  },
  balanceTop: 'Sleep trouble',
  balanceBottom: 'Recovery',
  radarTitle: 'Where your sleep stands',
  radarCaption: 'A bigger shape means healthier sleep & recovery on that category.',
  driversTitle: 'What needs the most attention',
  catIcons: {
    sleeplessness: Moon,
    quality: Star,
    rest: Armchair,
    energy: Sun,
    winddown: BedDouble,
  },
  legendWarm: 'warm = sleeplessness (shorter is better)',
  legendGreen: 'green = sleep & recovery (longer is better)',
  habitsTitle: 'Five better-sleep habits',
  habits: [
    'Keep the same wake-up time every day, weekends included — a steady rise time anchors the whole cycle.',
    'Get daylight within an hour of waking; it sets your body clock for an earlier, easier night.',
    'Cut caffeine after early afternoon — it lingers far longer than it feels.',
    'Dim the lights and put screens down for the last hour — give your brain a runway to night.',
    'If sleep won’t come, get up and reset rather than lying there — keep the bed for sleep.',
  ],
  closingBaseline:
    'This is your sleep baseline. Pick one habit above and run it for two weeks — sleep moves slowly, then all at once.',
  closingReturn:
    'This is one more night logged on your path — watch how these numbers move over time. Movement is the proof.',
  doors: [
    { to: '/audio', Icon: Headphones, label: 'Start a sleep audio plan' },
    { to: '/counselling', Icon: Heart, label: 'Talk to someone' },
  ],
}

/* ===================== Anxiety & Overthinking (lower-is-better) ===================== */
export const ANXIETY_UI = {
  kicker: 'Anxiety & overthinking',
  headTitle: (name) => `${name}, here’s how anxiety and overthinking are showing up for you.`,
  assessmentName: 'Anxiety & Overthinking Style',
  gaugeLabel: '/ 100 load',
  headlinePillSuffix: ' load',
  scoreSentence: (v) =>
    `Your overall load sits at ${v} / 100 — the average once every category is read in the right direction (anxious patterns as load, your refocus skill as a resource).`,
  spectrum: { segments: ['seg-low', 'seg-mid', 'seg-high'], scale: ['0 · calm', '50', '100 · loud'] },
  miniHeadlineLabel: 'Overall load',
  miniPriorityLabel: 'Priority areas',
  miniThirdLabel: 'Top driver',
  patternTitle: 'Your anxiety pattern',
  patternFoot:
    'Being “caught in the spin” lives in the bottom-right — loud anxious thinking with little room to step out. The further your dot sits from there, the more settled things are.',
  quadXLabel: 'more anxious thinking →',
  quadYLabel: 'more able to refocus →',
  quads: {
    TL: 'Steady mind',
    TR: 'Anxious but aware',
    BL: 'Quietly tense',
    BR: 'Caught in the spin',
  },
  balanceTop: 'Anxious thinking',
  balanceBottom: 'Refocus',
  radarTitle: 'Where the load sits',
  radarCaption: 'A bigger shape means more anxious load on that category.',
  driversTitle: 'What’s adding the most load',
  catIcons: {
    worry: CloudRain,
    rumination: Repeat,
    catastrophizing: CloudLightning,
    physical: HeartPulse,
    refocus: Focus,
  },
  legendWarm: 'warm = anxious load (shorter is better)',
  legendGreen: 'green = refocus skill (longer is better)',
  habitsTitle: 'Five calming habits',
  habits: [
    'Name it to tame it — when anxiety rises, label it: “this is worry.” Naming loosens its grip.',
    'Use a slow exhale when your body tenses — in for 4, out for 6. The long out-breath signals safety.',
    'Give worry a container — a fixed 10-minute window to write it down, so it doesn’t leak into the whole day.',
    'Move when you loop — a short walk or a change of room breaks rumination faster than thinking harder.',
    'Come back to your senses — five things you can see, or your feet on the floor — to step out of the spin.',
  ],
  closingBaseline:
    'This is your baseline — a snapshot of patterns, not a label. Pick one calming habit above and practise it gently. These numbers move with practice.',
  closingReturn:
    'This is one more check-in on your path — watch how these numbers settle over time. Practice is the proof.',
  doors: [
    { to: '/audio', Icon: Headphones, label: 'Start a calming audio plan' },
    { to: '/counselling', Icon: Heart, label: 'Talk to someone' },
  ],
}

/* ===================== Emotional Intelligence (all-strength, higher-is-better) ===================== */
export const EI_UI = {
  kicker: 'Emotional intelligence',
  headTitle: (name) => `${name}, here’s your emotional-intelligence profile.`,
  assessmentName: 'Emotional Intelligence Profile',
  gaugeLabel: '/ 100 EI',
  headlinePillSuffix: ' EI',
  scoreSentence: (v) =>
    `Your EI score is ${v} / 100 — the average of your five emotional-intelligence dimensions. Higher is stronger.`,
  // blue → amber → green: a low score sits in the growth (blue) zone, not red
  spectrum: { segments: ['seg-growth', 'seg-mid', 'seg-low'], scale: ['0 · emerging', '50', '100 · exceptional'] },
  miniHeadlineLabel: 'EI score',
  miniPriorityLabel: 'Growth areas',
  miniThirdLabel: 'Strongest',
  miniThirdKey: 'dominant',
  patternTitle: 'Your EI profile',
  patternFoot:
    'A few strong dimensions lift the rest — your growth areas are simply the highest-leverage place to build next.',
  radarTitle: 'Your five dimensions',
  radarCaption: 'A bigger shape means stronger emotional intelligence on that dimension.',
  driversTitle: 'Your highest-leverage growth areas',
  catIcons: {
    awareness: Eye,
    regulation: Anchor,
    empathy: HeartHandshake,
    relationships: Users,
    motivation: Rocket,
  },
  legendWarm: '', // no problem categories → no warm bars
  legendGreen: 'every bar is green — longer is stronger',
  habitsTitle: 'Five habits that build EI',
  habits: [
    'Name your feeling as it arises — “I’m anxious,” “I’m excited.” Naming builds the self-awareness everything rests on.',
    'Pause before reacting — one slow breath turns an impulse into a choice.',
    'Get curious about others — ask “what might they be feeling?” before you respond.',
    'Repair small ruptures early — a quick, honest “that came out wrong” keeps trust strong.',
    'Reconnect to your why — keep the reason your goals matter somewhere you’ll see it.',
  ],
  closingBaseline:
    'This is your baseline — a map of strengths and room to grow, not a verdict. Emotional intelligence is famously learnable; pick one habit above and practise it.',
  closingReturn:
    'This is one more check-in on your growth — watch these dimensions climb over time. Practice is the proof.',
  doors: [
    { to: '/audio', Icon: Headphones, label: 'Start a guided practice' },
    { to: '/counselling', Icon: Heart, label: 'Talk to someone' },
  ],
}

/* ===================== Focus & Productivity (mixed, higher-is-better) ===================== */
export const FOCUS_UI = {
  kicker: 'Focus & productivity',
  headTitle: (name) => `${name}, here’s how your focus and productivity are holding up.`,
  assessmentName: 'Focus & Productivity Profile',
  gaugeLabel: '/ 100 score',
  headlinePillSuffix: '',
  scoreSentence: (v) =>
    `Your Focus & Productivity score is ${v} / 100 — a blend of how little distraction pulls at you and how strong your focus skills are. Higher is better.`,
  spectrum: { segments: ['seg-high', 'seg-mid', 'seg-low'], scale: ['0 · low', '50', '100 · strong'] },
  miniHeadlineLabel: 'Focus & Productivity',
  miniPriorityLabel: 'Priority areas',
  miniThirdLabel: 'Top driver',
  patternTitle: 'Your focus pattern',
  patternFoot:
    'The best corner is the top-left — low friction meeting strong capability. The further your dot sits from the bottom-right, the more you’re in the zone.',
  quadXLabel: 'more friction →',
  quadYLabel: 'more capability →',
  quads: {
    TL: 'In the zone',
    TR: 'Willing but pulled',
    BL: 'Calm but coasting',
    BR: 'Scattered & stalling',
  },
  balanceTop: 'Friction',
  balanceBottom: 'Capability',
  radarTitle: 'Where your focus stands',
  radarCaption: 'A bigger shape means stronger focus & productivity on that category.',
  driversTitle: 'What’s pulling your score down',
  catIcons: {
    distractibility: Shuffle,
    procrastination: Hourglass,
    attention: Crosshair,
    management: ListChecks,
    motivation: Zap,
  },
  legendWarm: 'warm = friction (shorter is better)',
  legendGreen: 'green = focus skills (longer is better)',
  habitsTitle: 'Five focus habits',
  habits: [
    'Work in protected blocks — 25 focused minutes, phone away, one task. Short and clean beats long and fragmented.',
    'Start before you feel ready — commit to two minutes on the thing you’re avoiding; momentum follows.',
    'Single-task on purpose — finish one thing before opening the next. Switching is where focus leaks.',
    'Plan the day in two minutes — pick the three that matter and do the hardest first.',
    'Tame the environment, not just the willpower — remove the nearest distraction before you start.',
  ],
  closingBaseline:
    'This is your baseline — a snapshot of habits, not a verdict. Pick one focus habit above and run it for two weeks. These numbers move with practice.',
  closingReturn:
    'This is one more check-in on your path — watch how these numbers climb over time. Practice is the proof.',
  doors: [
    { to: '/audio', Icon: Headphones, label: 'Start a focus audio plan' },
    { to: '/counselling', Icon: Heart, label: 'Talk to someone' },
  ],
}
