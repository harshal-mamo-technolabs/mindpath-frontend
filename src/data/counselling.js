import { MessageCircle } from 'lucide-react'
import {
  AnxietyGlyph,
  EQGlyph,
  FocusGlyph,
  GriefGlyph,
  RelationshipsGlyph,
  SelfEsteemGlyph,
  SleepGlyph,
  StressGlyph,
  TransitionsGlyph,
} from '../components/TopicIcons.jsx'
import { getAssessment } from './assessments.js'
import { REPORT_GROUPS } from './reportHistory.js'
import { getPlan, PAYG, SUBSCRIPTION } from './billing.js'

export const ADVISOR = {
  name: 'Sol',
  role: 'Your Daybreak advisor',
  blurb:
    'Pick whatever’s on your mind and talk it through out loud with an AI advisor you actually speak to. Anyone can, no report needed. Have one? It just helps Sol get to know you better.',
}

/** Localized advisor — role/blurb through t() (name stays "Sol"); English is the fallback. */
export const getAdvisor = (t) => {
  const tr = typeof t === 'function' ? t : (_k, d) => d
  return {
    ...ADVISOR,
    role: tr('counsel.advisor.role', ADVISOR.role),
    blurb: tr('counsel.advisor.blurb', ADVISOR.blurb),
  }
}

/** Minutes left in this billing cycle (subscription allowance). */
export const includedMinutes = () => {
  const plan = getPlan(SUBSCRIPTION.planId)
  const total = plan.allowances.counselling
  if (total === 'Unlimited') return Infinity
  return Math.max(0, total - SUBSCRIPTION.usage.counselling)
}

export const MINUTE_PACKS = [
  { id: 'm15', minutes: 15, price: 8 },
  { id: 'm30', minutes: PAYG.counselling.minutes, price: PAYG.counselling.price, popular: true },
  { id: 'm60', minutes: 60, price: 26 },
]

const reportExists = (id) => REPORT_GROUPS.some((g) => g.id === id)

/**
 * A library of things people actually bring to a session. Anyone can pick any
 * one and just talk. `assessmentId` links a topic to an assessment when one
 * exists — if the user has a *report* there, the advisor gets extra context
 * (the "edge"); if not, it's still a wide-open conversation.
 */
const RAW_TOPICS = [
  { id: 'stress', key: 'stress-and-pressure', title: 'Stress & Pressure', icon: StressGlyph, accent: '#d98b50', bg: '#f9e3cd', fg: '#8a5420', line: 'When everything feels like too much at once.', assessmentId: 'stress-burnout' },
  { id: 'anxiety', key: 'anxiety-and-worry', title: 'Anxiety & Worry', icon: AnxietyGlyph, accent: '#3c7a5e', bg: '#dde9dd', fg: '#2e5f49', line: 'When your mind races ahead to what might go wrong.', assessmentId: 'anxiety-worry' },
  { id: 'sleep', key: 'sleep-and-rest', title: 'Sleep & Rest', icon: SleepGlyph, accent: '#6450cf', bg: '#e2dcf8', fg: '#4d3da8', line: 'Tired but wired nights, heavy mornings.', assessmentId: 'sleep-rest' },
  { id: 'feelings', key: 'understanding-my-feelings', title: 'Understanding My Feelings', icon: EQGlyph, accent: '#cf6450', bg: '#fbe5e0', fg: '#a04a35', line: 'Naming what’s going on inside, and why.', assessmentId: 'emotional-intelligence' },
  { id: 'focus', key: 'focus-and-overwhelm', title: 'Focus & Overwhelm', icon: FocusGlyph, accent: '#8a76e8', bg: '#f0edfb', fg: '#4d3da8', line: 'Scattered days that end busy but blurry.', assessmentId: 'focus-clarity' },
  { id: 'relationships', key: 'relationships', title: 'Relationships', icon: RelationshipsGlyph, accent: '#c2607f', bg: '#f7e1ea', fg: '#8f3d5c', line: 'The people close to you, and the tension.', assessmentId: null },
  { id: 'self-worth', key: 'self-worth', title: 'Self-Worth', icon: SelfEsteemGlyph, accent: '#d99c3a', bg: '#f7e8cf', fg: '#8a6418', line: 'The voice that says you’re not enough.', assessmentId: null },
  { id: 'direction', key: 'work-and-direction', title: 'Work & Direction', icon: TransitionsGlyph, accent: '#4d8a9e', bg: '#dceaf0', fg: '#2c5a6b', line: 'Feeling stuck, or unsure what’s next.', assessmentId: null },
  { id: 'grief', key: 'grief-and-loss', title: 'Grief & Loss', icon: GriefGlyph, accent: '#7d72b0', bg: '#e8e4f3', fg: '#4a4280', line: 'Carrying something, or someone, you’ve lost.', assessmentId: null },
  { id: 'open', key: 'something-on-my-mind', title: 'Something on my mind', icon: MessageCircle, accent: '#6450cf', bg: '#e2dcf8', fg: '#4d3da8', line: 'Not sure how to name it yet? Just start talking.', assessmentId: null, open: true },
]

export const TOPICS = RAW_TOPICS.map((t) => ({
  ...t,
  hasReport: !!t.assessmentId && reportExists(t.assessmentId),
}))

export const getTopic = (id) => TOPICS.find((t) => t.id === id)

/* Richer authored sessions for the topics where a report exists. */
const AUTHORED = {
  stress: {
    suggest: { type: 'ebook', title: '“Quiet the Static” — the evenings chapter', to: '/ebooks' },
    takeaways: [
      'Your recovery, not your effort, is the weakest link right now.',
      'One clear limit tonight: charge your phone outside the bedroom from 9pm.',
      'Pair it with Day 4 of your audio plan, which works on the same evening time.',
    ],
    lines: [
      { from: 'advisor', text: 'Hi Maya. I’ve got your Stress & Burnout report to go on, but this is your time, so take it wherever you need. How are you feeling today?' },
      { from: 'you', text: 'Honestly? Tired. The kind sleep doesn’t seem to fix.' },
      { from: 'advisor', text: 'That fits what I’m seeing. Your exhaustion has eased since your first check-in, but recovery is still the weakest link. What do your evenings usually look like?' },
      { from: 'you', text: 'Work spills into them. I’m answering messages until I fall asleep.' },
      { from: 'advisor', text: 'So the day never really ends. That’s what we want to change, not by doing more, but by protecting the last hour. What’s one small thing you could let go of tonight?' },
      { from: 'you', text: 'Maybe… not checking email after dinner.' },
      { from: 'advisor', text: 'That’s a real limit. Charge your phone in another room from 9pm. Just for tonight, notice how it feels. And there’s a short chapter from your scores about exactly this. I can add it to your shelf after.' },
    ],
  },
  sleep: {
    suggest: { type: 'plan', title: 'Tonight’s Sleep & Rest session', to: '/audio' },
    takeaways: [
      'Your wind-down works. It’s doing it every night that slips.',
      'Set one fixed wake-up time, and let your bedtime follow.',
      'Move worry to an 8pm slot, so bed stops being where you sort things out.',
    ],
    lines: [
      { from: 'advisor', text: 'Evening, Maya. I’ve read your Sleep & Rest report, so I’ve got the background, but talk to me about whatever’s really on your mind. How have the nights been?' },
      { from: 'you', text: 'Falling asleep is fine. Staying asleep is the problem.' },
      { from: 'advisor', text: 'Your scores hint at that. Your wind-down is good, but your routine slips. When you wake at 3am, where does your mind tend to go?' },
      { from: 'you', text: 'Straight to tomorrow. Everything I haven’t done.' },
      { from: 'advisor', text: 'Then let’s give that thinking an earlier home. A five-minute worry time at 8pm, written down and set aside, so bed isn’t where you plan.' },
      { from: 'you', text: 'I could try that.' },
      { from: 'advisor', text: 'Good. Tonight’s audio session is built around exactly this wind-down. Want me to line it up for after we hang up?' },
    ],
  },
  feelings: {
    suggest: { type: 'assessment', title: 'Retake it to see how you’ve grown', to: '/assessments/emotional-intelligence' },
    takeaways: [
      'You read others really well. Turning that inward is where you can grow.',
      'Practice: one honest “I feel…” sentence a day, easy ones first.',
      'Calming yourself grows fastest. Feet on the floor, one breath, then speak.',
    ],
    lines: [
      { from: 'advisor', text: 'Hi Maya. I already know your EQ profile, so we can skip the basics and go wherever you like. What’s really on your mind today?' },
      { from: 'you', text: 'I notice everyone else’s mood but I lose track of my own.' },
      { from: 'advisor', text: 'That’s exactly what your scores show: high empathy, lower self-awareness. The good news: it’s the easiest gap to train. Can you name what you’re feeling right now, in one word?' },
      { from: 'you', text: 'Umm… stretched.' },
      { from: 'advisor', text: 'A perfect start. You found it in seconds. Three times a day, just ask yourself that one question. No fixing, only naming. It changes things faster than you’d think.' },
      { from: 'advisor', text: 'And when you want to see the change in numbers, a retake in a few weeks will show it.' },
    ],
  },
}

/** Pull a localized authored session (returnObjects arrays); English is the fallback. */
function localizeAuthored(id, t) {
  const base = AUTHORED[id]
  const takeaways = t(`counsel.session.${id}.takeaways`, {
    returnObjects: true,
    defaultValue: base.takeaways,
  })
  const lineTexts = t(`counsel.session.${id}.lines`, {
    returnObjects: true,
    defaultValue: base.lines.map((l) => l.text),
  })
  return {
    suggest: {
      ...base.suggest,
      title: t(`counsel.session.${id}.suggestTitle`, base.suggest.title),
    },
    takeaways: Array.isArray(takeaways) ? takeaways : base.takeaways,
    lines: base.lines.map((l, i) => ({ from: l.from, text: lineTexts?.[i] ?? l.text })),
  }
}

/** Generic but warm session for any open topic (no report needed). Localized via t(),
    with the English copy as the fallback default and {{topic}} filled per line. */
function genericSession(topic, t) {
  const a = topic.assessmentId ? getAssessment(topic.assessmentId) : null
  const low = topic.title.toLowerCase()
  const suggest = a
    ? {
        type: 'assessment',
        title: t('counsel.session.generic.suggestAssessment', {
          topic: topic.title,
          defaultValue: `Take the ${topic.title} assessment to learn more`,
        }),
        to: `/assessments/${a.id}`,
      }
    : {
        type: 'assessment',
        title: t('counsel.session.generic.suggestFallback', 'Find the right place to start'),
        to: '/assessments',
      }
  return {
    suggest,
    takeaways: [
      topic.open
        ? t(
            'counsel.session.generic.takeaway1Open',
            'Putting words to what’s been sitting with you is already a real step.',
          )
        : t('counsel.session.generic.takeaway1Named', {
            topic: low,
            defaultValue: `You named ${low} as the thing to look at, and that’s already a step.`,
          }),
      t(
        'counsel.session.generic.takeaway2',
        'Small, regular steps help more than big, now-and-then efforts.',
      ),
      a
        ? t('counsel.session.generic.takeaway3Assessment', {
            topic: topic.title,
            defaultValue: `A short ${topic.title} assessment would turn this into something clear to track.`,
          })
        : t(
            'counsel.session.generic.takeaway3None',
            'We can keep talking it through. No plan needed. The way can show itself.',
          ),
    ],
    lines: [
      {
        from: 'advisor',
        text: topic.open
          ? t(
              'counsel.session.generic.line1Open',
              'Hi Maya. No topic, no report, let’s just talk. What’s been on your mind lately?',
            )
          : t('counsel.session.generic.line1Named', {
              topic: low,
              defaultValue: `Hi Maya. We don’t have a report on ${low} yet, so I’ll get to know it as we talk. No pressure. What brings you here today?`,
            }),
      },
      {
        from: 'you',
        text: t(
          'counsel.session.generic.line2',
          'I’ve been carrying it a while. I’m not even sure where to start.',
        ),
      },
      {
        from: 'advisor',
        text: t(
          'counsel.session.generic.line3',
          'That’s okay. Not knowing where to start is a fine place to begin. When it’s loudest, is it more in your body, your thoughts, or your energy?',
        ),
      },
      {
        from: 'you',
        text: t('counsel.session.generic.line4', 'Mostly in my head. It just loops.'),
      },
      {
        from: 'advisor',
        text: t(
          'counsel.session.generic.line5',
          'Then let’s give the loop somewhere to land. In one sentence, what worries you most about this?',
        ),
      },
      {
        from: 'you',
        text: t(
          'counsel.session.generic.line6',
          'That I’ll keep going like this and nothing really changes.',
        ),
      },
      {
        from: 'advisor',
        text: a
          ? t('counsel.session.generic.line7Assessment', {
              topic: topic.title,
              defaultValue: `That fear can be worked on, and it gets clearer with detail. A short ${topic.title} assessment would turn this vague weight into something clear we can actually move. Want me to line one up?`,
            })
          : t(
              'counsel.session.generic.line7None',
              'That fear can be worked on. Change rarely comes all at once. It’s one honest choice, made again and again. What’s the smallest one you could make before we talk again?',
            ),
      },
    ],
  }
}

/** A topic's session, localized via t(). AUTHORED topics keep their hand-written script;
    the rest get a warm generic one. Works without t (falls back to English). */
export const getSession = (topic, t) => {
  const tr =
    typeof t === 'function' ? t : (_k, opt) => (opt && typeof opt === 'object' ? opt.defaultValue : opt)
  return AUTHORED[topic.id] ? localizeAuthored(topic.id, tr) : genericSession(topic, tr)
}

export const PAST_SESSIONS = [
  { id: 's1', date: '2026-05-30', topic: 'Stress & Pressure', minutes: 18, note: 'Evening limits; phone out of the bedroom.' },
  { id: 's2', date: '2026-05-12', topic: 'Something on my mind', minutes: 12, note: 'Untangling a stuck feeling about work.' },
]

export const fmtSessionDate = (s) =>
  new Date(`${s}T12:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
