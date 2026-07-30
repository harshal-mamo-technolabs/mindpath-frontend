import { useEffect, useState } from 'react'
import { getAssessments } from '../lib/assessmentsApi.js'
import { formatPrice } from '../lib/plans.js'

/**
 * The canonical offer — one source of truth for every public claim about what
 * we sell: how many assessments exist, how long they take, how many questions
 * they ask, and what they cost.
 *
 * Everything here comes from GET /api/assessments (public, no auth), so the
 * marketing page and the catalogue can never drift apart. Previously the home
 * page rendered a hand-written demo file with different topic counts and
 * prices to the real product, which is exactly the kind of contradiction people
 * notice at the moment they're deciding to pay.
 */

/** Same estimate the catalogue uses, so the two never disagree. */
export const estMinutes = (questions) => Math.max(5, Math.round((questions || 0) * 0.5))

const range = (values) => {
  if (!values.length) return null
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  return { lo, hi, label: lo === hi ? `${lo}` : `${lo}–${hi}` }
}

export function useOffer() {
  const [state, setState] = useState({ status: 'loading', assessments: [] })

  useEffect(() => {
    let alive = true
    getAssessments()
      .then((rows) => alive && setState({ status: 'ready', assessments: rows || [] }))
      .catch(() => alive && setState({ status: 'error', assessments: [] }))
    return () => {
      alive = false
    }
  }, [])

  const list = state.assessments
  const questions = range(list.map((a) => a.questionsCount).filter(Boolean))
  const minutes = range(list.map((a) => estMinutes(a.questionsCount)).filter(Boolean))
  const prices = list.map((a) => a.cost).filter((c) => typeof c === 'number')
  const currency = list[0]?.currency ?? 'eur'

  return {
    ...state,
    count: list.length,
    questions,
    minutes,
    // A single price when every assessment costs the same, otherwise "from X".
    priceLabel: prices.length
      ? Math.min(...prices) === Math.max(...prices)
        ? formatPrice(Math.min(...prices), currency)
        : `from ${formatPrice(Math.min(...prices), currency)}`
      : null,
  }
}
