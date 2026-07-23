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
      'The energy debt you didn’t choose',
      'Do less before you do more',
      'An hour that is yours',
      'Rest that really helps',
      'Keeping the calm you build',
    ],
    sample:
      'Maya, your report said something important: your energy isn’t broken, your rest is. That’s where this book begins. Not with more willpower or another morning routine, but with your evenings, the place your own answers said your rest slips away.',
  },
  'sleep-rest': {
    chapters: [
      'The wind-down your body forgot',
      'Shutting off the day',
      'A bed just for sleep',
      'The worry window',
      'One fixed wake-up time',
      'Nights that finally stay calm',
    ],
    sample:
      'Maya, somewhere along the way your nights stopped being rest and became a second shift. Your scores point to a wind-down that never quite lands. So that’s where we’ll work: a wind-down gentle enough for your body to learn.',
  },
  'emotional-intelligence': {
    chapters: [
      'One word for how you feel',
      'The pause that helps',
      'Listening for what’s underneath',
      'One honest sentence a day',
      'Staying steady when it’s hard',
      'At ease with your own feelings',
    ],
    sample:
      'Maya, you read other people really well; your empathy score says so. The work now is turning that same attention inward, and saying the true thing out loud before it comes out the wrong way. This book is a short course in exactly that.',
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
    subtitle: `A ${a.plan.days}-day guide`,
    fromReport: `Made from your ${a.title} report`,
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
      'A simple wind-down for people whose minds switch on the moment the lights go out.',
    chapters: [
      'Why evenings decide your days',
      'The thirty-minute wind-down',
      'Setting tomorrow aside',
      'Limits after work',
      'A slow morning',
    ],
    sample:
      'Most stress doesn’t come from the meeting. It comes at 10:47pm, when the day won’t end and your mind keeps replaying it. The reset starts earlier than you think.',
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
    blurb: 'On letting go of the idea that being exhausted is the price of mattering.',
    chapters: [
      'The worship of being busy',
      'What feeling distant is telling you',
      'Taking back a normal week',
      'The slow comeback',
    ],
    sample:
      'We treat being exhausted like a prize, then wonder why we feel empty. Burnout isn’t proof you cared enough. It’s proof you were asked to give too much.',
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
    blurb: 'Not a lullaby, more a training plan. Sleep as something you can practise.',
    chapters: [
      'The body clock you can set',
      'Light, the strongest signal',
      'When your mind won’t switch off',
      'Routine beats willpower',
    ],
    sample:
      'You don’t really make yourself fall asleep; you stop getting in the way of it. This book is about removing the small blocks you didn’t know you’d put between you and rest.',
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
    blurb: 'Worry isn’t a flaw in you. It’s a loop, and loops can be broken.',
    chapters: [
      'The ruts we wear in',
      'Your body sounds the alarm first',
      'Taking small steps again',
      'Coming back to the present',
    ],
    sample:
      'Your mind isn’t trying to hurt you. It’s trying to protect you, using the only trick it trusts: going over the worst, again and again. We can teach it a gentler way.',
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
    blurb: 'Focus advice that assumes you’re already worn out, and starts there anyway.',
    chapters: [
      'Your first quiet work time',
      'Clearing your head',
      'Your one best hour',
      'A routine to start',
    ],
    sample:
      'Most focus books are written for people who are well rested. This one isn’t. It assumes you’re running on empty and asks for just twenty-five honest minutes, phone in another room.',
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
    blurb: 'The small, brave talks that fix what silence slowly breaks.',
    chapters: [
      'What goes unsaid costs you',
      'Saying the true thing, kindly',
      'Fixing things, not winning',
      'After the apology',
    ],
    sample:
      'Being close doesn’t mean never fighting. It means knowing how to make up. The couples who last aren’t the ones who never argue; they’re the ones who know how to come back.',
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
    blurb: 'Calming the harsh voice in your head without pretending it was always wrong.',
    chapters: [
      'Meet the voice in your head',
      'Worth you don’t have to earn',
      'Setting limits as self-respect',
      'A kinder inner voice',
    ],
    sample:
      'The harsh voice in your head isn’t being cruel on purpose. Somewhere, it learned you’d be safer if you were hard on yourself. It was wrong. You can thank it and let it rest.',
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
    blurb: 'Five-minute ways to steady yourself when worry spikes.',
    chapters: ['A longer breath out', 'Five senses, one breath', 'Naming the feeling', 'A steady body'],
    sample:
      'When the wave comes, you don’t have to fight it or run from it. You just find one thing to hold on to: the floor, your breath, the weight of your own hands, and stay with it until it passes.',
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
    blurb: 'A free little guide: ten tiny practices for ten everyday moments.',
    chapters: ['Arriving', 'A minute by the kettle', 'A breath at the desk', 'Ending the day'],
    sample:
      'You don’t need a cushion, an hour, or a quiet house. You need five minutes and a willingness to just be where you are. Start here, with this breath, with this page.',
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
    blurb: 'A gentle guide to being present, for people who think they’re “bad at it.”',
    chapters: ['There is no bad at this', 'Thoughts come and go', 'Being kind to yourself', 'Starting over'],
    sample:
      'Being mindful isn’t emptying your mind; no one can. It’s noticing your mind has wandered and, without telling yourself off, gently bringing it back. You’ll do this thousands of times. That’s the practice.',
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
    `We often treat ${lc(topic)} like something that should come naturally, then feel quietly ashamed when it doesn’t. Put that shame down for a moment. This chapter asks you to build a skill — something you practise, get wrong, and practise again — not something you’re just born with or without.`,
  () =>
    `Start smaller than feels worth it. One honest minute, done often, changes more than a big hour you can’t keep up. The point was never to go hard. It’s to keep coming back to this gently, on normal days as much as on hard ones.`,
  (t) =>
    `Notice the story you bring to ${lc(t)}. Often it isn’t the situation that tightens us, but the running voice about it — the quiet “I should,” the tired “not again,” the “what does this say about me.” You can let that voice pass through without believing every word.`,
  (t, topic) =>
    `${cap(lc(topic))} rarely changes all at once. It eases. A little more ease here, a softer evening there, until one week you notice a weight you carried for months has quietly set itself down. Trust the small steps. That’s where real change lives.`,
  () =>
    `If today went badly, that’s information, not a verdict. The goal isn’t to be perfect at this. It’s to start again without the long detour through blaming yourself. Starting again, it turns out, is the whole practice, and you’ll get a thousand chances to do it.`,
  () =>
    `A lot of what tires us is the effort of pretending we’re fine. This chapter asks for the opposite: a small, honest moment, first with yourself, and then, where it’s safe, out loud. The relief that follows is its own quiet reward.`,
  (t) =>
    `Picture yourself a month from now, after practising ${lc(t)} a handful of times. Not a whole new person — just a little steadier, a little kinder under pressure. That person is real. They’re the result of the small, ordinary choices you make this week.`,
  () =>
    `When it feels like too much, shrink your focus to the next single thing — the next breath, the next glass of water, the next small kindness to yourself. You don’t have to solve all of it tonight. Just the next thing.`,
  () =>
    `Give a hard feeling room to be, instead of a problem to fix. Once you name it and let it be there, most of what we dread loses its sting surprisingly fast. You’re not here to beat yourself in a contest. You’re here, more simply, to keep yourself good company.`,
]

const closer = (t) =>
  `Before you turn the page, keep just one sentence from “${t}” — the one that stuck. A book you half-remember but actually use beats one you finish and forget. Let that one line come with you through the rest of today.`

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
