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
 */
import { buildAssessmentReport } from './reportEngine.js'

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)

const DIRECTION = {
  distractibility: 'problem',
  procrastination: 'problem',
  attention: 'strength',
  management: 'strength',
  motivation: 'strength',
}

const LABEL = {
  distractibility: 'Distractibility',
  procrastination: 'Procrastination',
  attention: 'Sustained attention',
  management: 'Task & time management',
  motivation: 'Motivation & energy',
}

/* ===== per-category copy (supportive, non-clinical) ===== */
const CONTENT = {
  distractibility: {
    strengthLabel: 'steady focus',
    blurb: 'How easily your attention gets pulled away from what you meant to do.',
    note: {
      low: 'You hold your focus well — distractions don’t pull you off course much.',
      mid: 'Distractions catch you fairly often — enough to fragment a focused stretch.',
      high: 'You’re getting pulled off task a lot. That’s hard on follow-through — and very workable with the right setup.',
    },
    bullets: [
      'Most distraction is environmental, not a willpower failure — the fix is usually the setup, not trying harder.',
      'Every switch back to a task costs minutes of refocus; protecting a clear runway pays off fast.',
    ],
    try: 'Pick one 25-minute block today with your phone in another room and notifications off. One block, fully protected.',
  },
  procrastination: {
    strengthLabel: 'easy starts',
    blurb: 'How much you delay or avoid starting the things that matter.',
    note: {
      low: 'You tend to get started without much delay — avoidance isn’t a big drag on you.',
      mid: 'Some delaying is happening — tasks slipping or starting later than you’d like.',
      high: 'Putting things off is a real pattern right now. Starting is the hard part — and the part with the best leverage.',
    },
    bullets: [
      'Procrastination is usually about the feeling a task brings up, not laziness — shrinking the first step shrinks the dread.',
      'Starting is the whole battle; momentum almost always follows the first two minutes.',
    ],
    try: 'Pick the task you’re avoiding and commit to just two minutes on it. Permission to stop after — you usually won’t.',
  },
  attention: {
    strengthLabel: 'sustained attention',
    blurb: 'How well you can hold sustained concentration on one thing over time.',
    note: {
      low: 'Sustained attention is the skill most worth building — holding focus over time is hard right now, and it’s trainable.',
      mid: 'You can concentrate for a while, though it’s not yet a reliable, deep stretch.',
      high: 'You can sink into deep, sustained focus — a genuine asset for getting real work done.',
    },
    bullets: [
      'Attention is a muscle — focused blocks, even short ones, build the capacity for longer ones.',
      'Single-tasking trains attention; constant switching erodes it.',
    ],
    try: 'Do one task at a time today, start to finish, before opening anything else. Notice how much further you get.',
  },
  management: {
    strengthLabel: 'task management',
    blurb: 'How well you organise tasks, plan your time, and keep things from piling up.',
    note: {
      low: 'Task and time management is an area to build — without a system, things pile up and pull at your attention.',
      mid: 'You’ve got some structure, but it’s inconsistent — enough slips through to add friction.',
      high: 'You manage tasks and time well — a clear system that keeps things moving and your head clear.',
    },
    bullets: [
      'A trusted external list frees your mind from holding everything — and that frees up focus.',
      'Planning the day in a couple of minutes beats reacting to it for hours.',
    ],
    try: 'Each morning, write the three things that would make the day a win — and do the hardest first.',
  },
  motivation: {
    strengthLabel: 'drive & energy',
    blurb: 'How much drive and energy you bring to getting things done.',
    note: {
      low: 'Drive is running low right now — reconnecting to why the work matters is where energy gets rebuilt.',
      mid: 'Your motivation is there but uneven — stronger when the goal is clear, thinner when it isn’t.',
      high: 'You’ve got real drive and energy — a strong engine to point at what matters most.',
    },
    bullets: [
      'Energy follows meaning — a clear “why” sustains effort better than any push.',
      'Visible progress feeds drive; break big goals into wins you can actually see.',
    ],
    try: 'Name the one reason your current goal matters, and put it where you’ll see it while you work.',
  },
}

export const FOCUS_CONFIG = {
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
      ? { name: 'Scattered & Stalling', summary: 'High distraction and delay with limited focus tools — all of it buildable.' }
      : difficulty >= 50 && resource >= 50
        ? { name: 'Willing but Pulled', summary: 'You have drive and ability, but distraction and delay keep derailing you.' }
        : difficulty < 50 && resource < 50
          ? { name: 'Calm but Coasting', summary: 'Few distractions, but low focus and drive — easy to drift.' }
          : { name: 'In the Zone', summary: 'Strong focus and follow-through with little friction.' },
  patternDetail: ({ dims, difficulty, resource }) => {
    const problems = dims.filter((d) => d.direction === 'problem')
    const resources = dims.filter((d) => d.direction === 'strength')
    const heaviest = [...problems].sort((a, b) => b.pct - a.pct)[0]
    const thinnest = [...resources].sort((a, b) => a.pct - b.pct)[0]
    return (
      `Your friction — distraction and delay — averages ${difficulty}/100, while your focus capability sits at ${resource}/100. ` +
      (difficulty >= resource
        ? 'Right now the friction side is what’s pulling your score down — '
        : 'Your capability is doing the heavy lifting — ') +
      `${heaviest.label.toLowerCase()} is the biggest drag, while ${thinnest.strengthLabel} is the skill most worth building.`
    )
  },
}

export function buildFocusReport(data) {
  return buildAssessmentReport(data, FOCUS_CONFIG)
}
