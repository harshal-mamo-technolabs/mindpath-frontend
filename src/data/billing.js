/**
 * Billing model. Daybreak sells two ways:
 *  1) Subscriptions  a monthly/yearly plan grants an allowance of
 *     assessments (any topic), ebooks, and counselling minutes per cycle.
 *  2) Pay-as-you-go  once an allowance is exhausted (or with no plan),
 *     individual items are bought à la carte (the model already in the app).
 */
export const PLANS = [
  {
    id: 'calm',
    name: 'Calm',
    tagline: 'A gentle, steady start.',
    monthly: 12,
    yearly: 115,
    accent: '#3c7a5e',
    bg: '#dde9dd',
    fg: '#2e5f49',
    allowances: { assessments: 1, ebooks: 2, counselling: 15 },
    perks: [
      'Free yoga & meditation music',
      'Full general ebook library',
      'Daily audio plans for your topic',
    ],
  },
  {
    id: 'balance',
    name: 'Balance',
    tagline: 'For a real, ongoing practice.',
    monthly: 24,
    yearly: 230,
    popular: true,
    accent: '#6450cf',
    bg: '#e2dcf8',
    fg: '#4d3da8',
    allowances: { assessments: 3, ebooks: 6, counselling: 45 },
    perks: [
      'Everything in Calm',
      'Personalized ebooks from your reports',
      'Retake reminders & progress tracking',
    ],
  },
  {
    id: 'flourish',
    name: 'Flourish',
    tagline: 'The whole path, fully open.',
    monthly: 39,
    yearly: 374,
    accent: '#d98b50',
    bg: '#f9e3cd',
    fg: '#8a5420',
    allowances: { assessments: 6, ebooks: 'Unlimited', counselling: 120 },
    perks: [
      'Everything in Balance',
      'Priority AI counselling',
      'Early access to new assessment topics',
    ],
  },
]

export const getPlan = (id) => PLANS.find((p) => p.id === id)

export const priceFor = (plan, cycle) =>
  cycle === 'yearly' ? plan.yearly : plan.monthly

/** Per-month equivalent, for display under the yearly toggle. */
export const perMonth = (plan, cycle) =>
  cycle === 'yearly' ? Math.round(plan.yearly / 12) : plan.monthly

/** À-la-carte prices once an allowance is used up. */
export const PAYG = {
  assessment: 19,
  ebook: 8,
  counselling: { minutes: 30, price: 15 },
}

/** The demo user's live subscription + how much of each allowance is used. */
export const SUBSCRIPTION = {
  planId: 'balance',
  cycle: 'monthly',
  status: 'active',
  startedOn: '2026-03-09',
  renewsOn: '2026-07-09',
  card: { brand: 'Visa', last4: '4242', exp: '08 / 28' },
  // Maya has used all 3 assessments → assessments fall back to pay-as-you-go.
  usage: { assessments: 3, ebooks: 2, counselling: 0 },
}

export const INVOICES = [
  { id: 'in_1042', date: '2026-06-09', desc: 'Balance plan  monthly', amount: 24, kind: 'plan' },
  { id: 'in_1031', date: '2026-05-28', desc: 'Assessment  Anxiety & Worry', amount: 19, kind: 'payg' },
  { id: 'in_1020', date: '2026-05-09', desc: 'Balance plan  monthly', amount: 24, kind: 'plan' },
  { id: 'in_1009', date: '2026-04-12', desc: 'Ebook  The Worry Habit', amount: 8, kind: 'payg' },
  { id: 'in_0998', date: '2026-04-09', desc: 'Balance plan  monthly', amount: 24, kind: 'plan' },
  { id: 'in_0987', date: '2026-03-09', desc: 'Balance plan  monthly', amount: 24, kind: 'plan' },
]

export const fmtMoney = (n) => `$${n}`

export const fmtDate = (s) =>
  new Date(`${s}T12:00:00`).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
