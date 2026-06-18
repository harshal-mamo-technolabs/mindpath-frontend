import { loadStripe } from '@stripe/stripe-js'

/**
 * Stripe.js, loaded once and shared app-wide. The publishable key (pk_...) is
 * safe on the client; the secret key never leaves the backend.
 *
 * Resolves to null if the key is missing so the app doesn't crash — the
 * checkout page surfaces that as a configuration error instead.
 */
const KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

/** True when a publishable key is present. If false, the dev server likely
 *  needs a restart after adding VITE_STRIPE_PUBLISHABLE_KEY to .env. */
export const stripeConfigured = Boolean(KEY)

export const stripePromise = KEY ? loadStripe(KEY) : Promise.resolve(null)
