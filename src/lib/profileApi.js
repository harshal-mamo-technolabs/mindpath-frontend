import { apiGet, apiPut } from './api.js'

/**
 * The signed-in user's profile.
 *
 * Email isn't editable here — it's the login identifier and where reports are
 * sent, so changing it needs a verification flow rather than a text field.
 */
export const getProfile = () => apiGet('/api/profile')

export const updateProfile = (name) => apiPut('/api/profile', { name })
