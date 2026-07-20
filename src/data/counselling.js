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
    'Pick whatever’s weighing on you and talk it through, out loud, with a speech-to-speech advisor. Anyone can — no report required. Have one? It just gives Sol more context to work from.',
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
  { id: 'stress', title: 'Stress & Pressure', icon: StressGlyph, accent: '#d98b50', bg: '#f9e3cd', fg: '#8a5420', line: 'When everything feels like too much at once.', assessmentId: 'stress-burnout' },
  { id: 'anxiety', title: 'Anxiety & Worry', icon: AnxietyGlyph, accent: '#3c7a5e', bg: '#dde9dd', fg: '#2e5f49', line: 'A mind that runs ahead to what might go wrong.', assessmentId: 'anxiety-worry' },
  { id: 'sleep', title: 'Sleep & Rest', icon: SleepGlyph, accent: '#6450cf', bg: '#e2dcf8', fg: '#4d3da8', line: 'Tired-but-wired nights, heavy mornings.', assessmentId: 'sleep-rest' },
  { id: 'feelings', title: 'Understanding My Feelings', icon: EQGlyph, accent: '#cf6450', bg: '#fbe5e0', fg: '#a04a35', line: 'Naming what’s going on inside, and why.', assessmentId: 'emotional-intelligence' },
  { id: 'focus', title: 'Focus & Overwhelm', icon: FocusGlyph, accent: '#8a76e8', bg: '#f0edfb', fg: '#4d3da8', line: 'Scattered days that end busy but blurry.', assessmentId: 'focus-clarity' },
  { id: 'relationships', title: 'Relationships', icon: RelationshipsGlyph, accent: '#c2607f', bg: '#f7e1ea', fg: '#8f3d5c', line: 'The people close to you — and the friction.', assessmentId: null },
  { id: 'self-worth', title: 'Self-Worth', icon: SelfEsteemGlyph, accent: '#d99c3a', bg: '#f7e8cf', fg: '#8a6418', line: 'The voice that says you’re not enough.', assessmentId: null },
  { id: 'direction', title: 'Work & Direction', icon: TransitionsGlyph, accent: '#4d8a9e', bg: '#dceaf0', fg: '#2c5a6b', line: 'Feeling stuck, or unsure what’s next.', assessmentId: null },
  { id: 'grief', title: 'Grief & Loss', icon: GriefGlyph, accent: '#7d72b0', bg: '#e8e4f3', fg: '#4a4280', line: 'Carrying something, or someone, you’ve lost.', assessmentId: null },
  { id: 'open', title: 'Something on my mind', icon: MessageCircle, accent: '#6450cf', bg: '#e2dcf8', fg: '#4d3da8', line: 'Not sure how to name it yet? Just start talking.', assessmentId: null, open: true },
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
      'Your recovery — not your effort — is the thinnest thread right now.',
      'One concrete boundary tonight: phone charges outside the bedroom from 9pm.',
      'Pair it with Day 4 of your audio plan, which works the same evening window.',
    ],
    lines: [
      { from: 'advisor', text: 'Hi Maya. I’ve got your Stress & Burnout report for context — but this is your time, so take it wherever you need. How are you arriving today?' },
      { from: 'you', text: 'Honestly? Tired. The kind sleep doesn’t seem to fix.' },
      { from: 'advisor', text: 'That tracks with what I’m seeing. Your exhaustion has eased since your first check-in, but recovery is still the thinnest thread. What do your evenings usually look like?' },
      { from: 'you', text: 'Work bleeds into them. I’m answering messages until I fall asleep.' },
      { from: 'advisor', text: 'So the day never really ends. That’s the loop we want to loosen — not by doing more, but by protecting the last hour. What’s one small thing you could hand off tonight?' },
      { from: 'you', text: 'Maybe… not checking email after dinner.' },
      { from: 'advisor', text: 'That’s a real boundary. Phone charges in another room from 9pm — just tonight, notice how it feels. And there’s a three-page chapter from your scores about exactly this; I can drop it on your shelf after.' },
    ],
  },
  sleep: {
    suggest: { type: 'plan', title: 'Tonight’s Sleep & Rest session', to: '/audio' },
    takeaways: [
      'Your wind-down works — it’s the consistency that slips.',
      'Anchor one fixed wake time; let bedtime find its way to meet it.',
      'Move worry to an 8pm “window” so the bed stops being the meeting room.',
    ],
    lines: [
      { from: 'advisor', text: 'Evening, Maya. I’ve read your Sleep & Rest report, so I’ve got the background — but talk to me about whatever’s actually on your mind. How have the nights been?' },
      { from: 'you', text: 'Falling asleep is fine. Staying asleep is the problem.' },
      { from: 'advisor', text: 'Your scores hint at that — your wind-down is good, but your rhythm drifts. When you wake at 3am, where does your mind tend to go?' },
      { from: 'you', text: 'Straight to tomorrow. Everything I haven’t done.' },
      { from: 'advisor', text: 'Then let’s give that thinking an earlier home — a five-minute worry window at 8pm, written down and closed, so the bed isn’t where the planning happens.' },
      { from: 'you', text: 'I could try that.' },
      { from: 'advisor', text: 'Good. Tonight’s audio session is built around exactly this descent — want me to queue it for after we hang up?' },
    ],
  },
  feelings: {
    suggest: { type: 'assessment', title: 'Retake to measure your growth', to: '/assessments/emotional-intelligence' },
    takeaways: [
      'You read others beautifully; turning that inward is the growth edge.',
      'Practice: one honest “I feel…” sentence a day, low stakes first.',
      'Regulation grows fastest — feet on the floor, one breath, then speak.',
    ],
    lines: [
      { from: 'advisor', text: 'Hi Maya. I already know your EQ profile, so we can skip the basics and go wherever you like — what’s actually on your mind today?' },
      { from: 'you', text: 'I notice everyone else’s mood but I lose track of my own.' },
      { from: 'advisor', text: 'That’s exactly what your scores show — high empathy, lower self-awareness. The good news: it’s the most trainable gap there is. Can you name what you’re feeling right now, in one word?' },
      { from: 'you', text: 'Umm… stretched.' },
      { from: 'advisor', text: 'A perfect start — you found it in seconds. Three times a day, just ask yourself that one question. No fixing, only naming. It rewires faster than you’d think.' },
      { from: 'advisor', text: 'And when you want to see the change in numbers, a retake in a few weeks will show it.' },
    ],
  },
}

/** Generic but warm session for any open topic (no report needed). */
function genericSession(topic) {
  const a = topic.assessmentId ? getAssessment(topic.assessmentId) : null
  const low = topic.title.toLowerCase()
  const suggest = a
    ? { type: 'assessment', title: `Take the ${topic.title} assessment for deeper context`, to: `/assessments/${a.id}` }
    : { type: 'assessment', title: 'Find the right starting point', to: '/assessments' }
  return {
    suggest,
    takeaways: [
      topic.open
        ? 'Putting words to what’s been sitting with you is already a real step.'
        : `You named ${low} as the thing to look at — that clarity is already a step.`,
      'Small, repeated steps move this more than big, occasional efforts.',
      a
        ? `A short ${topic.title} assessment would turn this into something specific to track.`
        : 'We can keep talking it through, no map required — the path can find itself.',
    ],
    lines: [
      {
        from: 'advisor',
        text: topic.open
          ? 'Hi Maya. No topic, no report — let’s just talk. What’s been sitting with you lately?'
          : `Hi Maya. We don’t have a report on ${low} yet, so I’ll get to know it as we talk — no blank-page pressure. What’s bringing you here today?`,
      },
      { from: 'you', text: 'I’ve been carrying it a while. I’m not even sure where to start.' },
      { from: 'advisor', text: 'That’s okay — not knowing where to start is a fair place to begin. When it’s loudest, is it more in your body, your thoughts, or your energy?' },
      { from: 'you', text: 'Mostly in my head. It just loops.' },
      { from: 'advisor', text: 'Then let’s give the loop somewhere to land. In one sentence, what’s the version of this that worries you most?' },
      { from: 'you', text: 'That I’ll keep going like this and nothing really changes.' },
      {
        from: 'advisor',
        text: a
          ? `That fear is workable — and it gets sharper with detail. A short ${topic.title} assessment would turn this vague weight into something specific we can actually move. Want me to line one up?`
          : 'That fear is workable. Change rarely arrives all at once — it’s one honest, repeated choice. What’s the smallest one you could make before we talk again?',
      },
    ],
  }
}

export const getSession = (topic) => AUTHORED[topic.id] || genericSession(topic)

export const PAST_SESSIONS = [
  { id: 's1', date: '2026-05-30', topic: 'Stress & Pressure', minutes: 18, note: 'Evening boundaries; phone out of the bedroom.' },
  { id: 's2', date: '2026-05-12', topic: 'Something on my mind', minutes: 12, note: 'Untangling a stuck feeling about work.' },
]

export const fmtSessionDate = (s) =>
  new Date(`${s}T12:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
