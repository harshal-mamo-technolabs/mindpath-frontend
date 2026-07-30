/**
 * The marketing landing page that hosts the check-in funnel.
 *
 * Set VITE_LANDING_PAGE_URL to send "Find your path" out to the funnel. With no
 * value configured we keep people inside the app (the assessments catalogue)
 * rather than sending them to a broken link.
 */
const configured = import.meta.env.VITE_LANDING_PAGE_URL?.trim()

export const LANDING_PAGE_URL = configured ? configured.replace(/\/$/, '') : null

/**
 * URL that drops the visitor straight into the check-in, skipping the landing
 * page's own home screen. The funnel reads `?start=1` and opens on the first
 * question rather than its marketing page.
 */
export const landingCheckinUrl = () => (LANDING_PAGE_URL ? `${LANDING_PAGE_URL}/?start=1` : null)
