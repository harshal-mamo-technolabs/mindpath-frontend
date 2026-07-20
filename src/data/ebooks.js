import { REPORT_GROUPS } from './reportHistory.js'

const NAME = 'Maya'

/**
 * Personalized ebooks  one per assessment the user has a report for.
 * Generated from the report (name + topic on the cover), free because the
 * assessment already paid for it, and gated to assessed topics only.
 */
const PERSONAL_CONTENT = {
  'stress-burnout': {
    chapters: [
      'Your evenings, first',
      'The overdraft you didn’t sign up for',
      'Subtraction before addition',
      'An hour that is yours',
      'Rest that actually reaches you',
      'Keeping the calm you build',
    ],
    sample:
      'Maya  your report said something quietly important: your energy isn’t broken, your rest is. That single line is where this book begins. Not with more discipline, not with another morning routine, but with your evenings  the place your own answers told us the recovery slips away.',
  },
  'sleep-rest': {
    chapters: [
      'The descent your body forgot',
      'Closing the day’s open tabs',
      'A bed that means sleep',
      'The worry window',
      'One fixed wake time',
      'Nights that finally hold',
    ],
    sample:
      'Maya  somewhere along the way your nights stopped being a place of rest and started being a second shift. Your scores point to a wind-down that never quite lands. So that’s where we’ll work: a descent gentle enough that your body can learn it by heart.',
  },
  'emotional-intelligence': {
    chapters: [
      'One word for the weather',
      'The pause that changes everything',
      'Listening underneath the words',
      'One honest sentence a day',
      'Steady when it costs something',
      'Fluent in your own feeling',
    ],
    sample:
      'Maya  you read other people beautifully; your empathy score says so. The work now is turning that same fluent attention inward, and saying the true thing out loud before it leaks out sideways. This book is a short course in exactly that.',
  },
}

export const PERSONAL_EBOOKS = REPORT_GROUPS.map((g) => {
  const a = g.assessment
  return {
    id: `p-${a.id}`,
    kind: 'personal',
    assessmentId: a.id,
    title: a.ebook,
    forName: NAME,
    topic: a.title,
    subtitle: `A ${a.plan.days}-day companion`,
    fromReport: `Generated from your ${a.title} report`,
    accent: a.accent,
    bg: a.bg,
    fg: a.fg,
    pages: 30 + a.dims.length * 2,
    readMin: 42,
    chapters: PERSONAL_CONTENT[a.id].chapters,
    sample: PERSONAL_CONTENT[a.id].sample,
  }
})

/* Category palettes for general-library covers. */
export const CATEGORY_THEME = {
  Stress: { accent: '#d98b50', bg: '#f9e3cd', fg: '#8a5420' },
  Sleep: { accent: '#6450cf', bg: '#e2dcf8', fg: '#4d3da8' },
  Anxiety: { accent: '#3c7a5e', bg: '#dde9dd', fg: '#2e5f49' },
  Focus: { accent: '#8a76e8', bg: '#f0edfb', fg: '#4d3da8' },
  Relationships: { accent: '#cf6450', bg: '#fbe5e0', fg: '#a04a35' },
  'Self-Esteem': { accent: '#d99c3a', bg: '#f7e8cf', fg: '#8a6418' },
  Mindfulness: { accent: '#3e8e7a', bg: '#d6ecdf', fg: '#2c5f52' },
}

const G = (b) => ({ kind: 'general', ...CATEGORY_THEME[b.category], ...b })

export const GENERAL_EBOOKS = [
  G({
    id: 'evening-reset',
    title: 'The Evening Reset',
    author: 'Dr. Lena Okafor',
    category: 'Stress',
    pages: 142,
    readMin: 168,
    rating: 4.7,
    ratings: '2.1k',
    price: '$8',
    blurb:
      'A practical wind-down for people whose minds clock in the moment the lights go out.',
    chapters: [
      'Why evenings decide your days',
      'The thirty-minute descent',
      'Putting tomorrow down',
      'Boundaries after hours',
      'The unhurried morning',
    ],
    sample:
      'Most stress isn’t made in the meeting  it’s made at 10:47pm, when the day refuses to end and your mind keeps rehearsing it. The reset starts earlier than you think.',
  }),
  G({
    id: 'burnout-badge',
    title: 'Burnout Is Not a Badge',
    author: 'Marco Reyes',
    category: 'Stress',
    pages: 188,
    readMin: 210,
    rating: 4.8,
    ratings: '4.6k',
    price: '$9',
    blurb: 'On unlearning the story that exhaustion is the price of mattering.',
    chapters: [
      'The cult of the tired',
      'Cynicism is information',
      'Reclaiming an ordinary week',
      'The slow comeback',
    ],
    sample:
      'We hand out exhaustion like a medal, then wonder why we feel hollow at the ceremony. Burnout is not proof you cared enough. It is proof the system asked too much.',
  }),
  G({
    id: 'sleep-skill',
    title: 'Sleep Is a Skill',
    author: 'Dr. Hana Veldt',
    category: 'Sleep',
    pages: 164,
    readMin: 190,
    rating: 4.6,
    ratings: '3.2k',
    price: '$8',
    blurb: 'Less a lullaby, more a training plan  sleep as something you can practise.',
    chapters: [
      'The body clock you can set',
      'Light, the loudest signal',
      'When the mind won’t clock out',
      'Rhythm over willpower',
    ],
    sample:
      'You don’t fall asleep so much as you stop preventing it. This book is about removing the small obstacles you didn’t know you’d built between you and rest.',
  }),
  G({
    id: 'worry-habit',
    title: 'The Worry Habit',
    author: 'Priya Nandakumar',
    category: 'Anxiety',
    pages: 176,
    readMin: 198,
    rating: 4.7,
    ratings: '5.1k',
    price: '$8',
    blurb: 'Worry isn’t a character flaw. It’s a loop  and loops can be interrupted.',
    chapters: [
      'The grooves we wear',
      'Bodies sound the alarm first',
      'Reopening small doors',
      'Coming home to now',
    ],
    sample:
      'Your mind isn’t trying to torment you. It’s trying to protect you, using the only tool it trusts: rehearsing the worst, again and again. We can teach it a gentler way.',
  }),
  G({
    id: 'deep-work-tired',
    title: 'Deep Work for Tired People',
    author: 'Sam Boateng',
    category: 'Focus',
    pages: 152,
    readMin: 174,
    rating: 4.5,
    ratings: '1.8k',
    price: '$9',
    blurb: 'Focus advice that assumes you’re already depleted  and starts there anyway.',
    chapters: [
      'The first protected block',
      'Sweeping the open tabs',
      'Your one golden hour',
      'An entrance ritual',
    ],
    sample:
      'Most focus books are written for the well-rested. This one isn’t. It assumes you’re running on fumes and asks only for twenty-five honest minutes  phone in another room.',
  }),
  G({
    id: 'repair-conversation',
    title: 'The Repair Conversation',
    author: 'Dr. Iris Møller',
    category: 'Relationships',
    pages: 198,
    readMin: 224,
    rating: 4.9,
    ratings: '6.3k',
    price: '$9',
    blurb: 'The small, brave talks that mend what silence slowly breaks.',
    chapters: [
      'The cost of the unsaid',
      'Saying the true thing kindly',
      'Repair, not winning',
      'After the apology',
    ],
    sample:
      'Closeness isn’t the absence of rupture  it’s the presence of repair. The couples who last aren’t the ones who never fracture; they’re the ones who know how to come back.',
  }),
  G({
    id: 'enough-as-you-are',
    title: 'Enough, As You Are',
    author: 'Talia Brooks',
    category: 'Self-Esteem',
    pages: 158,
    readMin: 180,
    rating: 4.6,
    ratings: '2.9k',
    price: '$8',
    blurb: 'Quieting the inner critic without pretending it never had a point.',
    chapters: [
      'Meet the critic',
      'Worth that isn’t earned',
      'Boundaries as self-respect',
      'A kinder inner voice',
    ],
    sample:
      'The critic in your head isn’t lying to be cruel; it learned, somewhere, that you’d be safer if you were harder on yourself. It was wrong. You can thank it and let it rest.',
  }),
  G({
    id: 'anchored',
    title: 'Anchored',
    author: 'Dr. Nico Ferraro',
    category: 'Anxiety',
    pages: 144,
    readMin: 166,
    rating: 4.7,
    ratings: '3.7k',
    price: '$9',
    blurb: 'Five-minute grounding practices for the moments worry spikes.',
    chapters: ['The longer exhale', 'Five senses, one breath', 'Naming the wave', 'The steady body'],
    sample:
      'When the wave comes, you don’t have to fight it or outrun it. You only have to find one anchor  the floor, the breath, the weight of your own hands  and hold until it passes.',
  }),
  G({
    id: 'five-minutes',
    title: 'Five Minutes of Quiet',
    author: 'Daybreak Press',
    category: 'Mindfulness',
    pages: 64,
    readMin: 48,
    rating: 4.8,
    ratings: '9.4k',
    price: 'Free',
    free: true,
    blurb: 'A free pocket guide  ten tiny practices for ten ordinary moments.',
    chapters: ['Arriving', 'The kettle minute', 'A breath at the desk', 'Closing the day'],
    sample:
      'You don’t need a cushion, an hour, or a quiet house. You need five minutes and a willingness to be where you already are. Start here, with this breath, with this page.',
  }),
  G({
    id: 'unhurried-mind',
    title: 'The Unhurried Mind',
    author: 'Rowan Ellis',
    category: 'Mindfulness',
    pages: 172,
    readMin: 196,
    rating: 4.7,
    ratings: '4.0k',
    price: 'Free',
    free: true,
    blurb: 'A gentle introduction to presence for people who think they’re “bad at it.”',
    chapters: ['There is no bad at this', 'Thoughts as weather', 'The kind eye', 'Beginning again'],
    sample:
      'Mindfulness isn’t emptying your mind  no one can. It’s noticing it has wandered and, without scolding, walking it gently back. You will do this ten thousand times. That’s the practice.',
  }),
]

export const CATEGORIES = ['All', ...Object.keys(CATEGORY_THEME)]

export const ALL_EBOOKS = [...PERSONAL_EBOOKS, ...GENERAL_EBOOKS]
export const getEbook = (id) => ALL_EBOOKS.find((b) => b.id === id)

/* ---- readable chapter prose -------------------------------------------
   Each book ships with chapter titles + a sample; the body is composed
   deterministically from a pool of calm, on-theme passages so every
   chapter reads as real, finished text (and can be exported). */
const lc = (s) => (s || '').toLowerCase()
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

const BODY = [
  (t, topic) =>
    `We tend to treat ${lc(topic)} as something that ought to come naturally, then feel quietly ashamed when it doesn’t. Set that shame down for a moment. What this chapter asks of you is a skill — something practised, fumbled, and practised again — never a trait you either have or don’t.`,
  () =>
    `Start smaller than feels worthwhile. A single honest minute, repeated, reshapes more than an ambitious hour you can’t sustain. The point was never intensity; it is return — coming back to this gently, on ordinary days as much as on hard ones.`,
  (t) =>
    `Notice the story you carry into ${lc(t)}. Often it isn’t the situation that tightens us but the running commentary about it — the quiet should, the weary again, the what-does-this-say-about-me. You can let that commentary pass through without believing every word of it.`,
  (t, topic) =>
    `${cap(lc(topic))} rarely changes in one dramatic stroke. It loosens. A degree of ease here, a softer evening there, until one week you notice that a weight you had carried for months has quietly set itself down. Trust the small numbers; they are where real change actually lives.`,
  () =>
    `If today went badly, that is information, not a verdict. The work is not to be flawless at this — it is to begin again without the long detour through self-blame. Beginning again, it turns out, is the whole of the practice, and you will be handed a thousand chances to do it.`,
  () =>
    `Much of what tires us is the effort of pretending we are fine. This chapter asks for the opposite: a small, deliberate honesty, first with yourself, and then, where it is safe, out loud. The relief that follows is its own quiet reward.`,
  (t) =>
    `Picture the version of you a month from now who has practised ${lc(t)} a handful of times. Not transformed — just a little steadier, a little kinder under pressure. That person is not a fantasy. They are the sum of the small, unglamorous choices you make this week.`,
  () =>
    `When it feels like too much, narrow your attention to the next single thing — the next breath, the next glass of water, the next small kindness owed to yourself. The whole of it does not need solving tonight. Only the next thing does.`,
  () =>
    `Give the difficult feeling somewhere to be rather than something to fix. Named and allowed room, most of what we dread loses its edge surprisingly fast. You are not here to win a contest against yourself; you are here, more simply, to keep yourself good company.`,
]

const closer = (t) =>
  `Before you turn the page, keep just one sentence from “${t}” — the one that landed. A book you half-remember but actually use will always beat one you finish and forget. Let that single line come with you into the rest of today.`

export function chapterContent(book, idx) {
  const t = book.chapters[idx]
  const topic = (book.kind === 'personal' ? book.topic : book.category) || 'this'
  const paras = [idx === 0 ? book.sample : BODY[(idx * 3) % BODY.length](t, topic)]
  for (let k = 1; k <= 3; k++) paras.push(BODY[(idx * 3 + k) % BODY.length](t, topic))
  paras.push(closer(t))
  return paras
}

/* Pre-owned shelf state for the demo. */
export const INITIAL_OWNED = ['p-stress-burnout', 'evening-reset']
/* Reading progress for owned books. */
export const READING_PROGRESS = {
  'p-stress-burnout': 64,
  'evening-reset': 28,
}
