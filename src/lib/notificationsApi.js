/* Notification settings API — the backend stores each user's reminder/product-news prefs
   and browser push subscriptions, and sends the daily reminder push server-side. */
import { apiGet, apiPost, apiPut } from './api.js'

/** Current settings + the server's VAPID public key. */
export const getNotificationPrefs = () => apiGet('/api/notifications/me')

/** Save a subset of settings: { dailyReminder?, reminderTime?, productNews?, tzOffsetMinutes? }. */
export const updateNotificationPrefs = (prefs) => apiPut('/api/notifications', prefs)

/** Store a browser PushSubscription (add `tzOffsetMinutes`). */
export const subscribePush = (subscription) => apiPost('/api/notifications/subscribe', subscription)

/** Ask the backend to send an immediate confirmation push to this user. */
export const sendTestPush = (payload) => apiPost('/api/notifications/test', payload)
