/**
 * Minimal API client.
 *
 * The backend base URL is read ONLY from the VITE_API_BASE_URL env var
 * (see .env / .env.example) — it is never hard-coded. Vite exposes env vars
 * prefixed with VITE_ to client code via import.meta.env.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// The auth module injects a token getter here so every request can carry the
// JWT, without api.js having to import auth.js (which would be circular).
let getAuthToken = () => null

/** Register a function that returns the current JWT (or null when signed out). */
export function setAuthTokenProvider(fn) {
  getAuthToken = fn
}

/** Thrown for any non-successful response; carries the server's detail. */
export class ApiError extends Error {
  constructor(message, { status, errors } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status ?? null
    this.errors = errors ?? []
  }
}

/**
 * Send a request to `path` and unwrap the standard
 * `{ success, message, data }` envelope.
 *
 * Resolves with `data` on success; throws an ApiError (with `status` and the
 * server's `errors` array) on failure or network error.
 */
async function request(path, { method = 'GET', body } = {}) {
  if (!BASE_URL) {
    throw new ApiError('API base URL is not configured — set VITE_API_BASE_URL in your .env.')
  }

  const options = { method, headers: {} }
  const token = getAuthToken()
  if (token) options.headers.Authorization = `Bearer ${token}`
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, options)
  } catch {
    throw new ApiError('Can’t reach the server. Check your connection and try again.')
  }

  let payload = {}
  try {
    payload = await res.json()
  } catch {
    /* non-JSON response (e.g. an HTML 500) — handled by the check below */
  }

  if (!res.ok || !payload.success) {
    throw new ApiError(payload.message || 'Something went wrong. Please try again.', {
      status: res.status,
      errors: payload.errors,
    })
  }

  return payload.data
}

/** GET `path`. Resolves with the response `data`. */
export const apiGet = (path) => request(path)

/** POST a JSON `body` to `path`. Resolves with the response `data`. */
export const apiPost = (path, body) => request(path, { method: 'POST', body })

/** DELETE `path`. Resolves with the response `data`. */
export const apiDelete = (path) => request(path, { method: 'DELETE' })
