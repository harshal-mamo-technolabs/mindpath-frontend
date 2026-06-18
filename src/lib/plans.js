/**
 * Subscription plans (public endpoint — no auth).
 * GET /api/plans returns active plans, cheapest first.
 */
import { apiGet } from './api.js'

/** Fetch active plans. Resolves to an array (cheapest first). */
export function getPlans() {
  return apiGet('/api/plans')
}

/**
 * Format a plan price in its own currency, e.g. (4.99, "eur") → "€4.99".
 * Falls back to "<amount> <CODE>" if the currency code isn't recognized.
 */
export function formatPrice(amount, currency = 'usd') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  } catch {
    return `${amount} ${currency?.toUpperCase() ?? ''}`.trim()
  }
}
