import { useEffect, useState } from 'react'
import { useAuth } from './useAuth.js'
import { isMsisdnMode } from '../lib/billingMode.js'
import { getMySubscription } from '../lib/payments.js'

/**
 * Whether to show per-assessment prices anywhere in the portal.
 *
 *  - MSISDN mode → never (carrier billing has no per-assessment charge).
 *  - Stripe with an ACTIVE subscription that still has assessment allowance
 *    left → hidden (the assessment is included).
 *  - Stripe pay-as-you-go (no subscription, or the assessment allowance is
 *    used up) → shown, because the user pays per assessment.
 *
 * To avoid a "price flashes then hides" on covered accounts, logged-in Stripe
 * users start hidden and reveal the price only once we confirm they're PAYG.
 */
export function useShowAssessmentPrice() {
  const { isAuthenticated } = useAuth()
  const [show, setShow] = useState(() => !isMsisdnMode && !isAuthenticated)

  useEffect(() => {
    if (isMsisdnMode) {
      setShow(false)
      return
    }
    if (!isAuthenticated) {
      setShow(true) // no session → pay-as-you-go → show price
      return
    }
    let alive = true
    ;(async () => {
      const sub = await getMySubscription().catch(() => null)
      if (!alive) return
      const active = sub && (sub.status === 'active' || sub.status === 'trialing')
      const remaining = sub?.remaining?.assessments
      const covered = active && (remaining == null || remaining > 0)
      setShow(!covered) // covered → hide; no sub or exhausted → show
    })()
    return () => {
      alive = false
    }
  }, [isAuthenticated])

  return show
}
