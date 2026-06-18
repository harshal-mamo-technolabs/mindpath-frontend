import {
  AnxietyGlyph,
  EQGlyph,
  FocusGlyph,
  GriefGlyph,
  MindfulGlyph,
  RelationshipsGlyph,
  ResilienceGlyph,
  SelfEsteemGlyph,
  SleepGlyph,
  StressGlyph,
  TransitionsGlyph,
} from '../components/TopicIcons.jsx'

/**
 * Likert answers map to 0–4. Dimension scores are the mean of their
 * items, scaled to 0–100  deterministic, exactly like the product's
 * report framework. `reverse: true` flips positively-phrased items.
 */
export const LIKERT = ['Never', 'Rarely', 'Sometimes', 'Often', 'Almost always']

export const ASSESSMENTS = [
  {
    id: 'stress-burnout',
    title: 'Stress & Burnout',
    icon: StressGlyph,
    bg: '#f9e3cd',
    fg: '#8a5420',
    accent: '#d98b50',
    price: '$19',
    mins: 12,
    direction: 'load',
    ringLabel: 'Overall load',
    tagline: 'For when everything is fine on paper, and heavy everywhere else.',
    blurb:
      'A structured look at where your energy actually goes  and why rest stops working. Four dimensions, scored from your honest answers, turned into a plan that starts where your load is heaviest.',
    featured: true,
    dims: [
      {
        key: 'exhaustion',
        label: 'Exhaustion',
        desc: 'How depleted your energy reserves are  physically and emotionally.',
        hints: {
          low: 'Your energy reserves are holding steady. This is a genuine asset  your plan will help you keep it that way.',
          mid: 'Your energy dips are real but still rhythmic. The goal now is guarding the hours that refill you before the dips deepen.',
          high: 'Your energy account is running on overdraft. The first work is subtraction, not addition  your plan begins by taking things off the table.',
        },
        rec: 'Anchor one non-negotiable wind-down block before 9pm, every day for two weeks.',
      },
      {
        key: 'cynicism',
        label: 'Cynicism & detachment',
        desc: 'How much distance has crept in between you and the things that used to matter.',
        hints: {
          low: 'You still feel connected to what you do. That connection is protective  it makes recovery faster.',
          mid: 'Some distance is creeping in. It’s usually a shield, not a character change  and it softens as load drops.',
          high: 'Detachment has become your default shield. That numbness is information: it marks exactly where the load has been too heavy for too long.',
        },
        rec: 'Once a day, name one task that still feels meaningful  before opening anything else.',
      },
      {
        key: 'control',
        label: 'Sense of control',
        desc: 'How much agency you feel over your time, pace, and choices.',
        hints: {
          low: 'You feel authorship over your days. Keep making small choices visible to yourself  agency compounds.',
          mid: 'Your days are partly yours, partly the inbox’s. Reclaiming even one self-chosen hour shifts this score quickly.',
          high: 'Right now your days feel like they happen to you. Your plan rebuilds agency in the smallest possible units  minutes, not life changes.',
        },
        rec: 'Start each morning by choosing the first task yourself  before email chooses it for you.',
      },
      {
        key: 'recovery',
        label: 'Recovery capacity',
        desc: 'How well your rest actually restores you.',
        hints: {
          low: 'Your rest genuinely restores you  a rare strength worth protecting fiercely.',
          mid: 'Your rest works, but inconsistently. The fix is usually rhythm, not more hours.',
          high: 'Your rest isn’t reaching you  evenings pass, weekends pass, and the tank stays low. This is where your plan starts: evenings first.',
        },
        rec: 'Replace the last 20 minutes of screens with one audio session from your plan.',
      },
    ],
    questions: [
      { dim: 'exhaustion', text: 'I wake up tired, even after a full night of sleep.' },
      { dim: 'exhaustion', text: 'By mid-afternoon, I have little energy left for the things I care about.' },
      { dim: 'exhaustion', text: 'Small tasks feel heavier than they should.' },
      { dim: 'cynicism', text: 'I feel detached or indifferent about responsibilities that used to matter to me.' },
      { dim: 'cynicism', text: 'I catch myself thinking “what’s the point?” about daily tasks.' },
      { dim: 'control', text: 'My days feel like they happen to me, rather than being shaped by me.' },
      { dim: 'control', text: 'I can influence the pace and order of my day.', reverse: true },
      { dim: 'recovery', text: 'Evenings and weekends genuinely recharge me.', reverse: true },
      { dim: 'recovery', text: 'Even when I rest, my mind keeps working.' },
      { dim: 'recovery', text: 'I protect time in my week that is only for rest.', reverse: true },
    ],
    overall: {
      low: 'Your overall load is in a healthy range. The patterns below show where pressure tends to gather first for you  your plan works on keeping those channels clear.',
      mid: 'You are carrying real pressure, and still standing  but some systems that should refill you are running thin. Caught at this stage, the curve bends back quickly.',
      high: 'Your load is high across several dimensions at once. Nothing here is a verdict  high scores are simply where your plan begins, and these numbers move with practice.',
    },
    plan: {
      days: 14,
      welcome:
        'this plan begins with your evenings, because that’s where your answers say rest slips away…',
      sessions: [
        { day: 1, title: 'Putting the day down', len: '6 min' },
        { day: 2, title: 'The overdraft, named', len: '7 min' },
        { day: 3, title: 'One hour that is yours', len: '8 min' },
        { day: 4, title: 'Loosening the grip', len: '7 min' },
      ],
    },
    ebook: 'Quiet the Static',
  },

  {
    id: 'sleep-rest',
    title: 'Sleep & Rest',
    icon: SleepGlyph,
    bg: '#e2dcf8',
    fg: '#4d3da8',
    accent: '#6450cf',
    price: '$19',
    mins: 10,
    direction: 'load',
    ringLabel: 'Sleep strain',
    tagline: 'For tired-but-wired nights and mornings that start at a loss.',
    blurb:
      'Four dimensions of how your nights actually unfold  pressure, wind-down, rhythm, and the worry that arrives when the lights go out. Scored honestly, mapped to a nightly plan.',
    dims: [
      {
        key: 'debt',
        label: 'Sleep pressure',
        desc: 'How much accumulated tiredness you are carrying into each day.',
        hints: {
          low: 'You’re running on a mostly full tank  your sleep quantity is broadly meeting your needs.',
          mid: 'You’re accumulating a quiet debt  not dramatic, but it compounds. Small, regular repayments work best.',
          high: 'Your body is asking loudly for repayment. The plan prioritises consistent, slightly earlier nights over heroic weekend catch-ups.',
        },
        rec: 'Move bedtime 20 minutes earlier  just 20  for the next ten nights.',
      },
      {
        key: 'winddown',
        label: 'Wind-down',
        desc: 'How effectively your evenings shift you from doing-mode to resting-mode.',
        hints: {
          low: 'Your evenings already taper well. Your sessions will deepen a descent that’s working.',
          mid: 'Your wind-down works when you let it  the inconsistency, not the method, is the gap.',
          high: 'You’re going from sixth gear to parked with nothing in between. Your plan builds a 30-minute descent your body can learn.',
        },
        rec: 'Pick a fixed “lights lower” moment each evening  the audio session marks it.',
      },
      {
        key: 'rhythm',
        label: 'Rhythm consistency',
        desc: 'How steady your sleep and wake times are across the week.',
        hints: {
          low: 'Your body clock has a steady beat  protect it, it’s doing a lot of silent work for you.',
          mid: 'Your rhythm drifts on weekends and busy weeks. Anchoring just the wake time stabilises the rest.',
          high: 'Your body clock is getting mixed signals daily. One fixed wake time  even on weekends  is the single highest-leverage change.',
        },
        rec: 'Fix your wake time first; let bedtime find its own way to meet it.',
      },
      {
        key: 'nightworry',
        label: 'Worry at night',
        desc: 'How much your mind starts its second shift when the lights go out.',
        hints: {
          low: 'Your nights are mostly quiet upstairs. The plan keeps it that way with light maintenance.',
          mid: 'Worry visits some nights. Externalising it  paper, not pillow  usually shows results within a week.',
          high: 'The dark has become your mind’s busiest office. Your plan schedules worry earlier in the evening, so the bed stops being the meeting room.',
        },
        rec: 'Keep a 5-minute “worry window” at 8pm  written down, then closed.',
      },
    ],
    questions: [
      { dim: 'debt', text: 'I need an alarm  and snooze  to get up at the time I intend.' },
      { dim: 'debt', text: 'I feel properly rested when I wake.', reverse: true },
      { dim: 'winddown', text: 'I use screens until the moment I try to sleep.' },
      { dim: 'winddown', text: 'My evenings have a clear point where I begin slowing down.', reverse: true },
      { dim: 'rhythm', text: 'My sleep and wake times shift by more than an hour across the week.' },
      { dim: 'rhythm', text: 'I keep roughly the same wake time on weekends.', reverse: true },
      { dim: 'nightworry', text: 'When the lights go out, my mind gets louder.' },
      { dim: 'nightworry', text: 'I replay conversations or rehearse tomorrow while trying to fall asleep.' },
      { dim: 'debt', text: 'I rely on caffeine to get through an ordinary day.' },
      { dim: 'nightworry', text: 'I fall asleep within twenty minutes most nights.', reverse: true },
    ],
    overall: {
      low: 'Your sleep system is fundamentally working. The dimensions below show the early-warning gauges  your plan keeps them green.',
      mid: 'Your nights are under strain in specific, fixable places. Sleep responds fast to rhythm  most people feel the shift inside two weeks.',
      high: 'Your sleep is carrying strain across several dimensions. The good news: sleep is the system that responds most reliably to small, repeated changes.',
    },
    plan: {
      days: 14,
      welcome:
        'we start tonight  not with rules, but with a descent your body can learn by heart…',
      sessions: [
        { day: 1, title: 'The descent, learned', len: '8 min' },
        { day: 2, title: 'Closing the day’s tabs', len: '7 min' },
        { day: 3, title: 'A bed that means sleep', len: '6 min' },
        { day: 4, title: 'The worry window', len: '8 min' },
      ],
    },
    ebook: 'The Soft Landing',
  },

  {
    id: 'anxiety-worry',
    title: 'Anxiety & Worry',
    icon: AnxietyGlyph,
    bg: '#dde9dd',
    fg: '#2e5f49',
    accent: '#3c7a5e',
    price: '$19',
    mins: 12,
    direction: 'load',
    ringLabel: 'Worry load',
    tagline: 'For minds that run ahead to problems that haven’t happened yet.',
    blurb:
      'Where your worry lives, how it moves through your body, what it makes you avoid  and how easily you can find your way back to now. Mapped gently, scored precisely.',
    dims: [
      {
        key: 'rumination',
        label: 'Rumination',
        desc: 'How much your mind loops on the same worries without resolution.',
        hints: {
          low: 'Your thoughts mostly move through and out. That flow is worth noticing  it’s a skill you already have.',
          mid: 'Some thoughts get stuck on repeat. Loops weaken when they’re interrupted early  your sessions practise exactly that.',
          high: 'Your mind has worn deep grooves of repetition. Your plan doesn’t argue with the loops  it teaches your attention to step off the track.',
        },
        rec: 'When a loop starts, name it out loud once  “planning again”  then move your body.',
      },
      {
        key: 'body',
        label: 'Body signals',
        desc: 'How strongly worry shows up physically  chest, breath, stomach, jaw.',
        hints: {
          low: 'Your body stays mostly settled under stress  a strong foundation for everything else.',
          mid: 'Your body whispers before your mind notices. Learning its early signals turns them into useful alarms.',
          high: 'Your body is carrying the worry your mind won’t put down. Your plan starts physical  breath and muscle first, thoughts second.',
        },
        rec: 'Twice daily, exhale longer than you inhale for ten breaths. That’s the whole exercise.',
      },
      {
        key: 'avoidance',
        label: 'Avoidance',
        desc: 'How much worry has started narrowing what you’re willing to do.',
        hints: {
          low: 'Worry isn’t making your decisions. Your world is staying full-sized  keep it that way.',
          mid: 'A few doors have quietly closed. Reopening them in small steps is the most reliable anxiety work there is.',
          high: 'Worry has been redrawing your map, smaller each month. Your plan reverses this gently  one small reopened door at a time.',
        },
        rec: 'List three things you’ve stopped doing. Pick the easiest. Do 10% of it this week.',
      },
      {
        key: 'grounding',
        label: 'Grounding',
        desc: 'How easily you can return to the present when worry spikes.',
        hints: {
          low: 'You can find your way back to now  your anchor holds. Sessions will make it second nature.',
          mid: 'You can ground yourself when you remember to. The practice is making it automatic, not better.',
          high: 'When worry spikes, the present is hard to reach. Your plan drills short, physical anchors until they’re there when it matters.',
        },
        rec: 'Practise the 5-4-3-2-1 senses anchor once daily  when calm, so it works when not.',
      },
    ],
    questions: [
      { dim: 'rumination', text: 'I replay worries long after I can do anything about them.' },
      { dim: 'rumination', text: 'My mind jumps to worst-case versions of ordinary situations.' },
      { dim: 'body', text: 'I notice tension in my chest, jaw, or stomach during normal days.' },
      { dim: 'body', text: 'My breathing stays slow and easy under pressure.', reverse: true },
      { dim: 'avoidance', text: 'I put off tasks, calls, or places because of how they might make me feel.' },
      { dim: 'avoidance', text: 'I say yes to things even when they make me nervous.', reverse: true },
      { dim: 'grounding', text: 'When worry spikes, I can bring myself back to the present.', reverse: true },
      { dim: 'grounding', text: 'Once anxious, I stay anxious for hours.' },
      { dim: 'rumination', text: 'I lose sleep going over things that might go wrong.' },
      { dim: 'body', text: 'My body feels restless even when nothing urgent is happening.' },
    ],
    overall: {
      low: 'Your worry stays mostly in proportion  present, but not steering. The map below shows where it gathers when it does rise.',
      mid: 'Worry has taken real ground in specific places  and left other strengths intact. Your plan works the gaps and leans on the strengths.',
      high: 'Worry is currently loud across several channels. That’s exhausting  and workable. These four dimensions respond well to short, daily, physical practice.',
    },
    plan: {
      days: 21,
      welcome:
        'we won’t argue with your worries  we’ll practise coming home from them, daily…',
      sessions: [
        { day: 1, title: 'The anchor, learned', len: '7 min' },
        { day: 2, title: 'A longer exhale', len: '6 min' },
        { day: 3, title: 'Naming the loop', len: '8 min' },
        { day: 4, title: 'The first small door', len: '7 min' },
      ],
    },
    ebook: 'Loosening the Knot',
  },

  {
    id: 'focus-clarity',
    title: 'Focus & Clarity',
    icon: FocusGlyph,
    bg: '#f0edfb',
    fg: '#4d3da8',
    accent: '#8a76e8',
    price: '$19',
    mins: 11,
    direction: 'load',
    ringLabel: 'Fog index',
    tagline: 'For scattered days that end busy, blurry, and oddly empty.',
    blurb:
      'Where your attention leaks, what overloads it, when your clarity peaks, and how reachable deep work really is for you right now. A precise map of a foggy thing.',
    dims: [
      {
        key: 'distraction',
        label: 'Distraction pull',
        desc: 'How strongly interruptions and devices pull you off-task.',
        hints: {
          low: 'Your attention holds its line well. The sessions will sharpen an edge that already exists.',
          mid: 'You’re losing focus in small, frequent leaks rather than big breaks. Sealing two or three leaks changes whole days.',
          high: 'Your attention is being interrupted out of existence. Your plan rebuilds it the only way that works  short protected blocks, daily.',
        },
        rec: 'One 25-minute block daily: phone in another room. Not silenced. Another room.',
      },
      {
        key: 'overload',
        label: 'Mental overload',
        desc: 'How much you’re holding in your head instead of in a system.',
        hints: {
          low: 'Your head is mostly clear of open loops  your systems are carrying what they should.',
          mid: 'You’re holding more in memory than you need to. Every loop you write down returns a little clarity.',
          high: 'Your mind has become the warehouse, the inbox, and the alarm system at once. Your plan starts by getting everything out of your head and onto paper.',
        },
        rec: 'A nightly 3-minute “brain sweep”  every open loop, written, before sleep.',
      },
      {
        key: 'energy',
        label: 'Energy rhythm',
        desc: 'How well your work is aligned with when your mind is actually sharp.',
        hints: {
          low: 'You’re largely spending your best hours on your best work  rarer than you’d think.',
          mid: 'Your sharpest hours are partly going to your dullest tasks. Swapping even one hour pays immediately.',
          high: 'Your peak hours are being spent on email and meetings, leaving fog for what matters. Your plan reclaims one golden hour at a time.',
        },
        rec: 'Find your sharpest 90 minutes. Put your hardest thing there. Defend it.',
      },
      {
        key: 'deepwork',
        label: 'Deep work access',
        desc: 'How easily you can drop into  and stay in  absorbed concentration.',
        hints: {
          low: 'You can still reach depth when you choose to. That ability compounds  use it deliberately.',
          mid: 'Depth comes, but takes long warm-ups and breaks easily. Ritualising the entry shortens the runway.',
          high: 'Absorbed focus has become a rare visitor. It isn’t gone  it’s untrained. Your plan rebuilds the entrance ritual from scratch.',
        },
        rec: 'Same desk, same playlist, same first action  make starting a ritual, not a decision.',
      },
    ],
    questions: [
      { dim: 'distraction', text: 'I check my phone within minutes of starting focused work.' },
      { dim: 'distraction', text: 'I can work for thirty minutes without switching tasks.', reverse: true },
      { dim: 'overload', text: 'I keep important to-dos in my head rather than written down.' },
      { dim: 'overload', text: 'I feel behind on things I can’t even name.' },
      { dim: 'energy', text: 'My clearest hours go to meetings, email, or admin.' },
      { dim: 'energy', text: 'I plan demanding work for the time of day I think best.', reverse: true },
      { dim: 'deepwork', text: 'I can sink into a task deeply enough to lose track of time.', reverse: true },
      { dim: 'deepwork', text: 'Even simple documents take me far longer than they should.' },
      { dim: 'distraction', text: 'Notifications decide the order of my day.' },
      { dim: 'overload', text: 'My mind feels like a browser with forty tabs open.' },
    ],
    overall: {
      low: 'Your attention system is fundamentally sound  the dimensions below show where to invest, not repair.',
      mid: 'Your clarity is leaking in identifiable places. Focus is trainable, and leaks this size usually seal within a plan cycle.',
      high: 'The fog is thick right now  attention scattered, head overloaded, depth out of reach. All four of these dimensions are trainable, and your plan trains them daily.',
    },
    plan: {
      days: 14,
      welcome:
        'we begin with a single protected block  small enough to keep, real enough to matter…',
      sessions: [
        { day: 1, title: 'The first protected block', len: '6 min' },
        { day: 2, title: 'Sweeping the tabs', len: '7 min' },
        { day: 3, title: 'Finding your golden hour', len: '7 min' },
        { day: 4, title: 'The entrance ritual', len: '8 min' },
      ],
    },
    ebook: 'One Clear Hour',
  },

  {
    id: 'emotional-intelligence',
    title: 'Emotional Intelligence',
    icon: EQGlyph,
    bg: '#fbe5e0',
    fg: '#a04a35',
    accent: '#cf6450',
    price: '$24',
    mins: 14,
    direction: 'strength',
    ringLabel: 'EQ profile',
    tagline: 'For understanding the weather inside you  and reading it in others.',
    blurb:
      'Four capacities measured honestly: how well you notice your own states, steady them, read others, and say what’s true. Higher scores are strengths here  the report shows where to grow.',
    dims: [
      {
        key: 'awareness',
        label: 'Self-awareness',
        desc: 'How accurately you notice and name what you’re feeling, as it happens.',
        hints: {
          low: 'Feelings tend to reach you late  as moods, tension, or sudden reactions. Naming practice changes this faster than any other EQ skill.',
          mid: 'You catch your bigger feelings reliably; the subtler ones still slip past. Your sessions tune the finer instruments.',
          high: 'You read your inner weather early and accurately  the foundation every other capacity builds on.',
        },
        rec: 'Three times a day, one question: “What am I feeling, in one word?” That’s it.',
      },
      {
        key: 'regulation',
        label: 'Regulation',
        desc: 'How well you can steady a strong feeling without suppressing it.',
        hints: {
          low: 'Strong feelings currently drive  you ride along. Regulation is the most trainable EQ skill, and your plan drills it gently.',
          mid: 'You can steady yourself, with effort and a delay. Practice shrinks the delay.',
          high: 'You can hold a strong feeling without being held by it  composure that others can feel.',
        },
        rec: 'In heat: feel your feet on the floor, one slow breath, then speak. Order matters.',
      },
      {
        key: 'empathy',
        label: 'Empathy',
        desc: 'How accurately you read what others are feeling  beneath what they say.',
        hints: {
          low: 'Other people’s inner states often arrive as surprises. Curiosity, practised daily, is the entire fix.',
          mid: 'You read people well when you’re present; under stress your radar narrows. The work is keeping it on when it counts.',
          high: 'You hear what isn’t said. Used with care, this is the rarest kind of intelligence in any room.',
        },
        rec: 'Once a day, guess silently what someone is feeling  then check, gently, if you can.',
      },
      {
        key: 'expression',
        label: 'Expression',
        desc: 'How clearly and safely you can say what you actually feel and need.',
        hints: {
          low: 'What’s true for you tends to stay inside, or come out sideways. Small, low-stakes honesty reps build this faster than big conversations.',
          mid: 'You say what you feel when the stakes are low; the important conversations still get postponed. Your sessions rehearse exactly those.',
          high: 'You can say hard, true things in ways people can receive  the capstone skill, and you have it.',
        },
        rec: 'Once daily, one honest sentence that starts with “I feel…”  to anyone, about anything.',
      },
    ],
    questions: [
      { dim: 'awareness', text: 'I can name what I’m feeling while I’m feeling it.', reverse: true },
      { dim: 'awareness', text: 'I notice my moods only after they’ve affected my whole day.' },
      { dim: 'regulation', text: 'When something upsets me, I can steady myself within minutes.', reverse: true },
      { dim: 'regulation', text: 'I say or send things in the heat of a moment that I later regret.' },
      { dim: 'empathy', text: 'I sense how someone is feeling before they tell me.', reverse: true },
      { dim: 'empathy', text: 'People’s reactions often catch me completely off guard.' },
      { dim: 'expression', text: 'I can tell people what I need without it becoming a conflict.', reverse: true },
      { dim: 'expression', text: 'I keep my real feelings to myself until they leak out sideways.' },
      { dim: 'awareness', text: 'I understand why I reacted the way I did, shortly after.', reverse: true },
      { dim: 'regulation', text: 'Stress makes my reactions louder than I intend.' },
    ],
    overall: {
      low: 'Your EQ capacities are at the start of their curve  which is the steepest, fastest part. Every dimension below is trainable, and the plan trains them in order.',
      mid: 'You have real EQ foundations with clear growth edges. The report shows precisely which capacity to train next for the biggest shift.',
      high: 'Your emotional capacities are strong across the board. The work now is consistency under pressure  keeping these skills on when it costs something.',
    },
    plan: {
      days: 21,
      welcome:
        'we’ll train the four capacities in order  noticing first, because everything builds on it…',
      sessions: [
        { day: 1, title: 'One word for the weather', len: '6 min' },
        { day: 2, title: 'The pause, practised', len: '7 min' },
        { day: 3, title: 'Listening underneath', len: '8 min' },
        { day: 4, title: 'One honest sentence', len: '7 min' },
      ],
    },
    ebook: 'The Listening Heart',
  },
]

/** Catalog-only teasers for the rest of the 20-topic vision. */
export const COMING_SOON = [
  { title: 'Self-Esteem', icon: SelfEsteemGlyph, dims: ['Inner critic', 'Worth', 'Boundaries'] },
  { title: 'Relationships', icon: RelationshipsGlyph, dims: ['Attachment', 'Conflict', 'Repair'] },
  { title: 'Resilience', icon: ResilienceGlyph, dims: ['Setbacks', 'Flexibility', 'Outlook'] },
  { title: 'Life Transitions', icon: TransitionsGlyph, dims: ['Identity', 'Uncertainty', 'Direction'] },
  { title: 'Mindful Habits', icon: MindfulGlyph, dims: ['Consistency', 'Presence', 'Triggers'] },
  { title: 'Grief & Loss', icon: GriefGlyph, dims: ['Waves', 'Meaning', 'Support'] },
]

export const getAssessment = (id) => ASSESSMENTS.find((a) => a.id === id)

/** Mean of items per dimension, scaled to 0–100. Deterministic. */
export function scoreAnswers(assessment, answers) {
  const sums = {}
  const counts = {}
  assessment.questions.forEach((q, i) => {
    const raw = answers[i]
    if (raw == null) return
    const v = q.reverse ? 4 - raw : raw
    sums[q.dim] = (sums[q.dim] || 0) + v
    counts[q.dim] = (counts[q.dim] || 0) + 1
  })
  const dims = {}
  assessment.dims.forEach((d) => {
    dims[d.key] = counts[d.key]
      ? Math.round((sums[d.key] / (counts[d.key] * 4)) * 100)
      : 50
  })
  const overall = Math.round(
    assessment.dims.reduce((acc, d) => acc + dims[d.key], 0) / assessment.dims.length
  )
  return { dims, overall }
}

export const bandOf = (score) => (score < 40 ? 'low' : score <= 65 ? 'mid' : 'high')

/** Demo scores for direct visits to a report URL (no quiz answers). */
export const DEMO_SCORES = {
  'stress-burnout': { dims: { exhaustion: 72, cynicism: 58, control: 41, recovery: 68 }, overall: 60 },
  'sleep-rest': { dims: { debt: 66, winddown: 74, rhythm: 52, nightworry: 61 }, overall: 63 },
  'anxiety-worry': { dims: { rumination: 70, body: 55, avoidance: 38, grounding: 62 }, overall: 56 },
  'focus-clarity': { dims: { distraction: 76, overload: 64, energy: 49, deepwork: 58 }, overall: 62 },
  'emotional-intelligence': { dims: { awareness: 58, regulation: 44, empathy: 71, expression: 39 }, overall: 53 },
}
