/**
 * MSISDN (carrier-billing) subscriptions — Model C.
 *
 * The plan is charged to the user's mobile bill instead of a card. Allowances
 * are snapshotted from the plan exactly like a Stripe subscription, but there
 * is NO pay-as-you-go fallback: once the assessment allowance is exhausted,
 * /start returns 403 and the UI shows an out-of-allowance state.
 *
 * No Stripe / clientSecret here — the subscription is active immediately.
 * Only used when isMsisdnMode is true.
 */
import { apiGet, apiPost } from './api.js'

/** Subscribe with a mobile number. Resolves to the active subscription. */
export const createMsisdnSubscription = ({ planId, msisdn }) =>
  apiPost('/api/msisdn-subscriptions', { planId, msisdn })

/** Current MSISDN subscription with usage + remaining, or null if none. */
export const getMyMsisdnSubscription = () => apiGet('/api/msisdn-subscriptions/me')
