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
import i18n from '../i18n/index.js'

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
    tagline: 'For when life looks fine on the outside but feels heavy inside.',
    blurb:
      'A clear look at where your energy goes, and why rest stops helping. We look at four parts of your life, score your honest answers, and build a plan that starts where you feel it most.',
    featured: true,
    dims: [
      {
        key: 'exhaustion',
        label: 'Exhaustion',
        desc: 'How low your energy is, in body and mind.',
        hints: {
          low: 'Your energy is holding steady. That is a real strength, and your plan will help you keep it.',
          mid: 'Your energy dips, but not too much yet. The goal now is to protect the hours that refill you, before the dips get worse.',
          high: 'Your energy is running on empty. The first step is to do less, not more. Your plan starts by taking things off your plate.',
        },
        rec: 'Set one quiet wind-down time before 9pm, every day for two weeks. Do not skip it.',
      },
      {
        key: 'cynicism',
        label: 'Feeling distant',
        desc: 'How far you feel from the things that used to matter to you.',
        hints: {
          low: 'You still feel connected to what you do. That helps you bounce back faster.',
          mid: 'You are starting to feel a bit distant. This is usually a way to protect yourself, not a change in who you are. It eases as the pressure drops.',
          high: 'Feeling distant has become your way to cope. That numb feeling is a sign. It shows where things have been too heavy for too long.',
        },
        rec: 'Once a day, name one task that still feels worth doing, before you open anything else.',
      },
      {
        key: 'control',
        label: 'Sense of control',
        desc: 'How much say you feel you have over your time, speed, and choices.',
        hints: {
          low: 'You feel in charge of your days. Keep noticing the small choices you make. That sense of control grows.',
          mid: 'Your days are partly yours and partly your inbox’s. Taking back even one hour you choose will move this score fast.',
          high: 'Right now your days feel like they just happen to you. Your plan rebuilds your sense of control in tiny steps. Minutes, not big life changes.',
        },
        rec: 'Each morning, pick your first task yourself, before email picks it for you.',
      },
      {
        key: 'recovery',
        label: 'Recovery capacity',
        desc: 'How well your rest really refreshes you.',
        hints: {
          low: 'Your rest really refreshes you. That is rare, and worth protecting.',
          mid: 'Your rest works, but not every time. The fix is usually a steady routine, not more hours.',
          high: 'Your rest is not reaching you. Evenings pass, weekends pass, and you still feel empty. This is where your plan starts: evenings first.',
        },
        rec: 'Swap your last 20 minutes of screen time for one audio session from your plan.',
      },
    ],
    questions: [
      { dim: 'exhaustion', text: 'I wake up tired, even after a full night of sleep.' },
      { dim: 'exhaustion', text: 'By mid-afternoon, I have little energy left for the things I care about.' },
      { dim: 'exhaustion', text: 'Small tasks feel heavier than they should.' },
      { dim: 'cynicism', text: 'I feel distant or like I don’t care about things that used to matter to me.' },
      { dim: 'cynicism', text: 'I catch myself thinking “what’s the point?” about daily tasks.' },
      { dim: 'control', text: 'My days feel like they just happen to me, instead of me shaping them.' },
      { dim: 'control', text: 'I can choose the speed and order of my day.', reverse: true },
      { dim: 'recovery', text: 'Evenings and weekends really recharge me.', reverse: true },
      { dim: 'recovery', text: 'Even when I rest, my mind keeps working.' },
      { dim: 'recovery', text: 'I keep time in my week that is just for rest.', reverse: true },
    ],
    overall: {
      low: 'Your overall load is in a healthy range. The parts below show where pressure builds up first for you. Your plan works on keeping those clear.',
      mid: 'You are under real pressure and still standing. But some things that should refill you are running low. Caught now, this turns around fast.',
      high: 'Your load is high in several parts at once. None of this is a judgment. High scores just show where your plan begins, and these numbers move with practice.',
    },
    plan: {
      days: 14,
      welcome:
        'this plan starts with your evenings, because that’s where your answers say your rest slips away…',
      sessions: [
        { day: 1, title: 'Letting the day end', len: '6 min' },
        { day: 2, title: 'Seeing what drains you', len: '7 min' },
        { day: 3, title: 'One hour that is yours', len: '8 min' },
        { day: 4, title: 'Letting go a little', len: '7 min' },
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
    ringLabel: 'Sleep trouble',
    tagline: 'For nights when you’re tired but wired, and mornings that start off rough.',
    blurb:
      'A look at four parts of your nights: sleep pressure, winding down, your routine, and the worry that shows up when the lights go out. Scored honestly, turned into a nightly plan.',
    dims: [
      {
        key: 'debt',
        label: 'Sleep pressure',
        desc: 'How much built-up tiredness you carry into each day.',
        hints: {
          low: 'You’re running on a mostly full tank. You’re getting about the sleep you need.',
          mid: 'You’re building up a small sleep debt. It’s not huge, but it adds up. Small, regular catch-ups work best.',
          high: 'Your body badly needs to catch up. The plan aims for steady, slightly earlier nights instead of big weekend catch-ups.',
        },
        rec: 'Go to bed 20 minutes earlier, just 20, for the next ten nights.',
      },
      {
        key: 'winddown',
        label: 'Wind-down',
        desc: 'How well your evenings help you switch from doing to resting.',
        hints: {
          low: 'Your evenings already slow down well. Your sessions will build on what’s working.',
          mid: 'Your wind-down works when you let it. The gap is doing it every night, not the method itself.',
          high: 'You go from full speed to stopped with nothing in between. Your plan builds a 30-minute wind-down your body can learn.',
        },
        rec: 'Pick a set time each evening to lower the lights. The audio session marks it.',
      },
      {
        key: 'rhythm',
        label: 'A steady routine',
        desc: 'How steady your sleep and wake times are during the week.',
        hints: {
          low: 'Your body clock keeps a steady beat. Protect it. It’s quietly doing a lot for you.',
          mid: 'Your routine slips on weekends and busy weeks. Just keeping one fixed wake-up time steadies the rest.',
          high: 'Your body clock gets mixed signals every day. One fixed wake-up time, even on weekends, is the single biggest change you can make.',
        },
        rec: 'Set your wake-up time first. Let your bedtime follow.',
      },
      {
        key: 'nightworry',
        label: 'Worry at night',
        desc: 'How much your mind starts racing when the lights go out.',
        hints: {
          low: 'Your mind is mostly quiet at night. The plan keeps it that way with a little upkeep.',
          mid: 'Worry shows up some nights. Writing it down, instead of holding it in bed, usually helps within a week.',
          high: 'Nighttime has become when your mind works hardest. Your plan moves worry to earlier in the evening, so bed stops being the place you sort things out.',
        },
        rec: 'Take 5 minutes at 8pm to write down your worries, then set them aside.',
      },
    ],
    questions: [
      { dim: 'debt', text: 'I need an alarm, and the snooze button, to get up when I mean to.' },
      { dim: 'debt', text: 'I feel properly rested when I wake up.', reverse: true },
      { dim: 'winddown', text: 'I use screens right up until I try to sleep.' },
      { dim: 'winddown', text: 'My evenings have a clear point where I start slowing down.', reverse: true },
      { dim: 'rhythm', text: 'My sleep and wake times change by more than an hour during the week.' },
      { dim: 'rhythm', text: 'I get up at about the same time on weekends.', reverse: true },
      { dim: 'nightworry', text: 'When the lights go out, my mind gets louder.' },
      { dim: 'nightworry', text: 'I go over conversations or plan tomorrow while trying to fall asleep.' },
      { dim: 'debt', text: 'I need caffeine to get through a normal day.' },
      { dim: 'nightworry', text: 'I fall asleep within twenty minutes most nights.', reverse: true },
    ],
    overall: {
      low: 'Your sleep is basically working. The parts below are early warning signs. Your plan keeps them in the clear.',
      mid: 'Your nights are strained in a few places you can fix. Sleep improves fast with a steady routine. Most people feel the change within two weeks.',
      high: 'Your sleep is strained in several parts. The good news: sleep responds better than almost anything to small, repeated changes.',
    },
    plan: {
      days: 14,
      welcome:
        'we start tonight. Not with rules, but with a gentle wind-down your body can learn…',
      sessions: [
        { day: 1, title: 'Learning to wind down', len: '8 min' },
        { day: 2, title: 'Shutting off the day', len: '7 min' },
        { day: 3, title: 'A bed just for sleep', len: '6 min' },
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
    ringLabel: 'Worry level',
    tagline: 'For when your mind jumps ahead to things that haven’t happened.',
    blurb:
      'Where your worry sits, how it shows up in your body, what it makes you avoid, and how easily you can come back to the present. Mapped gently, scored clearly.',
    dims: [
      {
        key: 'rumination',
        label: 'Going in circles',
        desc: 'How much your mind loops on the same worries without solving them.',
        hints: {
          low: 'Your thoughts mostly pass through and move on. That’s worth noticing. It’s a skill you already have.',
          mid: 'Some thoughts get stuck on repeat. Loops weaken when you catch them early. Your sessions practise exactly that.',
          high: 'Your mind has worn deep grooves of the same thoughts. Your plan doesn’t argue with the loops. It teaches you to step off the track.',
        },
        rec: 'When a loop starts, say it out loud once, like “planning again,” then get up and move.',
      },
      {
        key: 'body',
        label: 'Body signals',
        desc: 'How strongly worry shows up in your body: chest, breath, stomach, jaw.',
        hints: {
          low: 'Your body stays mostly calm under stress. That’s a strong base for everything else.',
          mid: 'Your body warns you before your mind notices. Learning its early signals turns them into helpful alerts.',
          high: 'Your body is holding the worry your mind won’t put down. Your plan starts with the body: breath and muscles first, thoughts second.',
        },
        rec: 'Twice a day, breathe out longer than you breathe in, for ten breaths. That’s the whole exercise.',
      },
      {
        key: 'avoidance',
        label: 'Avoidance',
        desc: 'How much worry has started to shrink what you’re willing to do.',
        hints: {
          low: 'Worry isn’t making your choices. Your world is staying full-sized. Keep it that way.',
          mid: 'A few doors have quietly closed. Opening them again in small steps is the most reliable way to work on anxiety.',
          high: 'Worry has been making your world smaller each month. Your plan turns this around gently, one small step at a time.',
        },
        rec: 'List three things you’ve stopped doing. Pick the easiest. Do a little of it this week.',
      },
      {
        key: 'grounding',
        label: 'Grounding',
        desc: 'How easily you can come back to the present when worry spikes.',
        hints: {
          low: 'You can find your way back to the present. Sessions will make it second nature.',
          mid: 'You can steady yourself when you remember to. The practice is making it automatic.',
          high: 'When worry spikes, the present is hard to reach. Your plan drills short, physical ways to steady yourself until they’re there when you need them.',
        },
        rec: 'Practise the 5-4-3-2-1 senses exercise once a day, while calm, so it works when you’re not.',
      },
    ],
    questions: [
      { dim: 'rumination', text: 'I keep going over worries long after I can do anything about them.' },
      { dim: 'rumination', text: 'My mind jumps to the worst version of everyday situations.' },
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
      low: 'Your worry mostly stays in proportion. It’s there, but not running the show. The map below shows where it builds up when it does rise.',
      mid: 'Worry has taken real hold in some places, while other strengths stay intact. Your plan works on the weak spots and builds on the strengths.',
      high: 'Worry is loud in several areas right now. That’s tiring, and it can be worked on. These four parts respond well to short, daily, physical practice.',
    },
    plan: {
      days: 21,
      welcome:
        'we won’t fight your worries. We’ll practise coming back from them, a little each day…',
      sessions: [
        { day: 1, title: 'Learning to steady yourself', len: '7 min' },
        { day: 2, title: 'A longer breath out', len: '6 min' },
        { day: 3, title: 'Naming the worry loop', len: '8 min' },
        { day: 4, title: 'The first small step', len: '7 min' },
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
    ringLabel: 'How foggy',
    tagline: 'For scattered days that end busy, blurry, and strangely empty.',
    blurb:
      'Where your focus leaks, what overloads it, when your mind is sharpest, and how easily you can get real, deep work done right now. A clear map of a foggy thing.',
    dims: [
      {
        key: 'distraction',
        label: 'Pull of distractions',
        desc: 'How strongly interruptions and devices pull you off task.',
        hints: {
          low: 'Your focus holds well. The sessions will sharpen a skill you already have.',
          mid: 'You’re losing focus in small, frequent leaks rather than big breaks. Fixing two or three of them changes whole days.',
          high: 'You’re interrupted so often you can barely focus at all. Your plan rebuilds it the only way that works: short blocks of quiet time, daily.',
        },
        rec: 'One 25-minute block daily: phone in another room. Not silenced. Another room.',
      },
      {
        key: 'overload',
        label: 'Too much in your head',
        desc: 'How much you’re keeping in your head instead of written down.',
        hints: {
          low: 'Your head is mostly clear. Your notes and lists are holding what they should.',
          mid: 'You’re holding more in your head than you need to. Every thing you write down clears your mind a little.',
          high: 'Your mind is trying to store everything, remember everything, and remind you of everything at once. Your plan starts by getting it all out of your head and onto paper.',
        },
        rec: 'Each night, take 3 minutes to write down everything on your mind before sleep.',
      },
      {
        key: 'energy',
        label: 'Your energy pattern',
        desc: 'How well your work lines up with the times your mind is actually sharp.',
        hints: {
          low: 'You mostly spend your best hours on your best work. That’s rarer than you’d think.',
          mid: 'Some of your sharpest hours go to your most boring tasks. Swapping even one hour helps right away.',
          high: 'Your best hours go to email and meetings, leaving only fog for what matters. Your plan takes back one good hour at a time.',
        },
        rec: 'Find your sharpest 90 minutes. Put your hardest thing there. Defend it.',
      },
      {
        key: 'deepwork',
        label: 'Getting into deep focus',
        desc: 'How easily you can get into, and stay in, deep focus.',
        hints: {
          low: 'You can still get into deep focus when you choose to. That skill grows. Use it on purpose.',
          mid: 'Deep focus comes, but it takes a long warm-up and breaks easily. A set start routine gets you there faster.',
          high: 'Deep focus has become rare. It’s not gone, it’s just out of practice. Your plan rebuilds your start routine from scratch.',
        },
        rec: 'Same desk, same playlist, same first step. Make starting a routine, not a decision.',
      },
    ],
    questions: [
      { dim: 'distraction', text: 'I check my phone within minutes of starting focused work.' },
      { dim: 'distraction', text: 'I can work for thirty minutes without switching tasks.', reverse: true },
      { dim: 'overload', text: 'I keep important to-dos in my head rather than written down.' },
      { dim: 'overload', text: 'I feel behind on things I can’t even name.' },
      { dim: 'energy', text: 'My clearest hours go to meetings, email, or admin.' },
      { dim: 'energy', text: 'I save hard work for the time of day I focus best.', reverse: true },
      { dim: 'deepwork', text: 'I can sink into a task deeply enough to lose track of time.', reverse: true },
      { dim: 'deepwork', text: 'Even simple tasks take me far longer than they should.' },
      { dim: 'distraction', text: 'Notifications decide the order of my day.' },
      { dim: 'overload', text: 'My mind feels like a browser with forty tabs open.' },
    ],
    overall: {
      low: 'Your focus is basically solid. The parts below show where to build, not fix.',
      mid: 'Your focus is leaking in clear places. Focus can be trained, and leaks this size usually close within one plan.',
      high: 'The fog is thick right now. Your focus is scattered, your head is overloaded, and deep work feels out of reach. All four of these can be trained, and your plan trains them daily.',
    },
    plan: {
      days: 14,
      welcome:
        'we begin with one small block of quiet time. Small enough to keep, real enough to matter…',
      sessions: [
        { day: 1, title: 'Your first quiet work time', len: '6 min' },
        { day: 2, title: 'Clearing your head', len: '7 min' },
        { day: 3, title: 'Finding your best hour', len: '7 min' },
        { day: 4, title: 'A routine to start', len: '8 min' },
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
    ringLabel: 'Feelings score',
    tagline: 'For understanding your own feelings, and reading them in others.',
    blurb:
      'Four skills, measured honestly: how well you notice your own feelings, calm them, read others, and say what’s true. Here, higher scores are strengths, and the report shows where to grow.',
    dims: [
      {
        key: 'awareness',
        label: 'Self-awareness',
        desc: 'How well you notice and name what you’re feeling, as it happens.',
        hints: {
          low: 'Feelings tend to reach you late, as moods, tension, or sudden reactions. Practising naming them changes this faster than any other skill here.',
          mid: 'You catch your bigger feelings well, but the smaller ones still slip past. Your sessions help you notice the subtle ones.',
          high: 'You notice your own feelings early and clearly. That’s the base every other skill builds on.',
        },
        rec: 'Three times a day, one question: “What am I feeling, in one word?” That’s it.',
      },
      {
        key: 'regulation',
        label: 'Calming yourself',
        desc: 'How well you can calm a strong feeling without pushing it away.',
        hints: {
          low: 'Right now strong feelings are in charge and you go along for the ride. Calming yourself is the most trainable skill here, and your plan builds it gently.',
          mid: 'You can calm yourself, but it takes effort and a bit of time. Practice makes it faster.',
          high: 'You can hold a strong feeling without it taking over. Others can feel how steady you are.',
        },
        rec: 'When things heat up: feel your feet on the floor, take one slow breath, then speak. The order matters.',
      },
      {
        key: 'empathy',
        label: 'Empathy',
        desc: 'How well you read what others are feeling, under what they say.',
        hints: {
          low: 'Other people’s feelings often catch you by surprise. Staying curious, every day, is the whole fix.',
          mid: 'You read people well when you’re present, but stress narrows your view. The work is keeping it on when it counts.',
          high: 'You pick up on what isn’t said. Used with care, that’s a rare and valuable skill.',
        },
        rec: 'Once a day, quietly guess what someone is feeling, then gently check if you can.',
      },
      {
        key: 'expression',
        label: 'Speaking up',
        desc: 'How clearly and safely you can say what you really feel and need.',
        hints: {
          low: 'What’s true for you tends to stay inside, or come out the wrong way. Small, low-pressure moments of honesty build this faster than big talks.',
          mid: 'You say what you feel when it’s easy, but the important talks still get put off. Your sessions practise exactly those.',
          high: 'You can say hard, honest things in a way people can hear. That’s the top skill, and you have it.',
        },
        rec: 'Once a day, say one honest sentence that starts with “I feel…” to anyone, about anything.',
      },
    ],
    questions: [
      { dim: 'awareness', text: 'I can name what I’m feeling while I’m feeling it.', reverse: true },
      { dim: 'awareness', text: 'I notice my moods only after they’ve affected my whole day.' },
      { dim: 'regulation', text: 'When something upsets me, I can calm myself within minutes.', reverse: true },
      { dim: 'regulation', text: 'I say or send things in the heat of a moment that I later regret.' },
      { dim: 'empathy', text: 'I sense how someone is feeling before they tell me.', reverse: true },
      { dim: 'empathy', text: 'People’s reactions often catch me completely off guard.' },
      { dim: 'expression', text: 'I can tell people what I need without it turning into a fight.', reverse: true },
      { dim: 'expression', text: 'I keep my real feelings in until they come out the wrong way.' },
      { dim: 'awareness', text: 'I understand why I reacted the way I did, soon after.', reverse: true },
      { dim: 'regulation', text: 'Stress makes me react more strongly than I mean to.' },
    ],
    overall: {
      low: 'These skills are just getting started for you, which is when they grow the fastest. Every part below can be trained, and the plan trains them in order.',
      mid: 'You have a real base here, with clear room to grow. The report shows exactly which skill to work on next for the biggest change.',
      high: 'These skills are strong across the board. The work now is staying steady under pressure, keeping them going when it’s hard.',
    },
    plan: {
      days: 21,
      welcome:
        'we’ll build four skills in order. Noticing first, because everything else builds on it…',
      sessions: [
        { day: 1, title: 'One word for how you feel', len: '6 min' },
        { day: 2, title: 'Practising the pause', len: '7 min' },
        { day: 3, title: 'Listening for what’s underneath', len: '8 min' },
        { day: 4, title: 'One honest sentence', len: '7 min' },
      ],
    },
    ebook: 'The Listening Heart',
  },
]

/** Catalog-only teasers for the rest of the 20-topic vision. */
export const COMING_SOON = [
  { title: 'Self-Esteem', icon: SelfEsteemGlyph, dims: ['Inner critic', 'Self-worth', 'Limits'] },
  { title: 'Relationships', icon: RelationshipsGlyph, dims: ['Closeness', 'Conflict', 'Making up'] },
  { title: 'Resilience', icon: ResilienceGlyph, dims: ['Setbacks', 'Bouncing back', 'Outlook'] },
  { title: 'Life Transitions', icon: TransitionsGlyph, dims: ['Who you are', 'Not knowing', 'Direction'] },
  { title: 'Mindful Habits', icon: MindfulGlyph, dims: ['Sticking with it', 'Being present', 'Triggers'] },
  { title: 'Grief & Loss', icon: GriefGlyph, dims: ['Waves', 'Meaning', 'Support'] },
]

export const getAssessment = (id) => ASSESSMENTS.find((a) => a.id === id)

/** The 5 Likert labels in the active language (English is the inline fallback). */
export const likertLabels = () =>
  i18n.t('assessData.likert', { returnObjects: true, defaultValue: LIKERT })

/**
 * Return a copy of a demo assessment with every user-facing string resolved
 * through i18next (English strings are the inline fallbacks). Structure, keys,
 * scoring fields and order are untouched — only the prose is localized. Call it
 * from a component that uses `useTranslation`, so it re-runs on a language switch.
 */
export function localizeAssessment(a) {
  if (!a) return a
  const k = (path, def) => i18n.t(`assessData.${a.id}.${path}`, { defaultValue: def })
  const sessionTitles = i18n.t(`assessData.${a.id}.plan.sessions`, {
    returnObjects: true,
    defaultValue: a.plan.sessions.map((s) => s.title),
  })
  const questionTexts = i18n.t(`assessData.${a.id}.questions`, {
    returnObjects: true,
    defaultValue: a.questions.map((q) => q.text),
  })
  return {
    ...a,
    title: k('title', a.title),
    tagline: k('tagline', a.tagline),
    blurb: k('blurb', a.blurb),
    ringLabel: k('ringLabel', a.ringLabel),
    overall: {
      low: k('overall.low', a.overall.low),
      mid: k('overall.mid', a.overall.mid),
      high: k('overall.high', a.overall.high),
    },
    plan: {
      ...a.plan,
      welcome: k('plan.welcome', a.plan.welcome),
      sessions: a.plan.sessions.map((s, i) => ({ ...s, title: sessionTitles[i] ?? s.title })),
    },
    dims: a.dims.map((d) => ({
      ...d,
      label: k(`dims.${d.key}.label`, d.label),
      desc: k(`dims.${d.key}.desc`, d.desc),
      rec: k(`dims.${d.key}.rec`, d.rec),
      hints: {
        low: k(`dims.${d.key}.hints.low`, d.hints.low),
        mid: k(`dims.${d.key}.hints.mid`, d.hints.mid),
        high: k(`dims.${d.key}.hints.high`, d.hints.high),
      },
    })),
    questions: a.questions.map((q, i) => ({ ...q, text: questionTexts[i] ?? q.text })),
    ebook: k('ebook', a.ebook),
  }
}

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
