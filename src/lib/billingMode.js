/**
 * Frontend billing-mode toggle.
 *
 * The app runs EITHER the Stripe side (subscriptions + pay-as-you-go) OR the
 * MSISDN carrier-billing side — never both at once. This is a frontend flag;
 * the backend supports all models. When MSISDN mode is on, hide every
 * card / Stripe UI.
 *
 * Set VITE_BILLING_MODE=msisdn in .env to switch. Defaults to 'stripe'.
 */
export const BILLING_MODE = (import.meta.env.VITE_BILLING_MODE || 'stripe').toLowerCase()

export const isMsisdnMode = BILLING_MODE === 'msisdn'
export const isStripeMode = !isMsisdnMode
