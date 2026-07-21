/**
 * Subscriptions + saved cards (all auth-required — the JWT is attached
 * automatically by api.js). The backend creates a Stripe subscription as
 * `incomplete` and returns a `clientSecret`; the payment (and any 3D Secure
 * challenge) is confirmed on the client with Stripe.js, then the webhook flips
 * the subscription to `active`.
 */
import { apiDelete, apiGet, apiPost } from './api.js'

// ---------- subscriptions ----------

/**
 * Start a purchase. Pass `paymentMethodId` (a saved card) for one-click;
 * omit it to pay with a new card. Resolves to
 * `{ subscriptionId, status, clientSecret }`.
 */
export function createSubscription({ planId, paymentMethodId }) {
  return apiPost('/api/subscriptions', { planId, paymentMethodId })
}

/** Current subscription with usage + remaining, or null if the user has none. */
export function getMySubscription() {
  return apiGet('/api/subscriptions/me')
}

/** Record consumption (type: ebooks | assessments | counsellingMinutes). */
export function recordUsage({ type, amount }) {
  return apiPost('/api/subscriptions/usage', { type, amount })
}

/**
 * Cancel at period end — access continues until currentPeriodEnd. Collects a
 * short survey: `reason` (required, a CANCEL_REASONS key) and `wouldStayFor`
 * (optional, WOULD_STAY_FOR keys). Resolves with the updated subscription.
 */
export function cancelSubscription({ reason, wouldStayFor = [] }) {
  return apiPost('/api/subscriptions/cancel', { reason, wouldStayFor })
}

/** Q1 (required, single) — why the user is canceling. Send keys, render labels. */
export const CANCEL_REASONS = [
  { key: 'not_using_enough', label: "I wasn't using it often enough" },
  { key: 'too_expensive', label: 'Too expensive.' },
  { key: 'not_worth_value', label: "Didn't find the value worth the cost." },
  { key: 'unmet_needs', label: "It didn't meet my needs or expectations." },
  { key: 'missing_features', label: 'Features I needed were unavailable.' },
  { key: 'insights_too_basic', label: 'Reports or insights were too basic.' },
  { key: 'technical_problems', label: 'I encountered technical problems.' },
  { key: 'performance_issues', label: 'Poor app performance or usability issues.' },
  { key: 'repetitive_content', label: 'Information was repetitive or unhelpful.' },
  { key: 'other', label: 'Other' },
]

/** Q2 (optional, multi) — what might have kept the user. */
export const WOULD_STAY_FOR = [
  { key: 'lower_cost', label: 'Lower-cost subscription' },
  { key: 'annual_discount', label: 'Annual discounted rates' },
  { key: 'premium_content', label: 'Additional Premium content' },
]

/** Billing history (invoices), newest first. [] if never billed. */
export function getInvoices() {
  return apiGet('/api/subscriptions/invoices')
}

/**
 * Complete billing history — subscription charges PLUS every one-time purchase
 * (assessments, ebooks, audio programs, counselling top-ups). Newest first. Each row:
 * { id, date, amount, currency, status, type, label, description, receiptUrl }.
 */
export function getTransactions() {
  return apiGet('/api/subscriptions/transactions')
}

// ---------- saved cards ----------

/** Saved cards: [{ id, brand, last4, expMonth, expYear, isDefault }]. */
export function getPaymentMethods() {
  return apiGet('/api/payment-methods')
}

/** SetupIntent for saving a card without buying. Resolves to { clientSecret }. */
export function createSetupIntent() {
  return apiPost('/api/payment-methods/setup-intent')
}

/** Remove a saved card. Resolves with the updated card list. */
export function deletePaymentMethod(id) {
  return apiDelete(`/api/payment-methods/${id}`)
}

/** Make a saved card the default. Resolves with the updated card list. */
export function setDefaultPaymentMethod(id) {
  return apiPost(`/api/payment-methods/${id}/default`)
}

/**
 * Activation is webhook-driven, so poll /subscriptions/me after a successful
 * payment. Resolves the active subscription, or null if it's still pending
 * after `tries` attempts (the caller should show a "finalizing" state).
 */
export async function waitForActive(tries = 8, delayMs = 1500) {
  for (let i = 0; i < tries; i++) {
    const sub = await getMySubscription()
    if (sub && sub.status === 'active') return sub
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
  return null
}
