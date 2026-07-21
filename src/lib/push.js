/* Web Push helpers — register the service worker and create a PushSubscription the backend
   can send to (with the server's VAPID public key). */

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i)
  return out
}

export const pushSupported = () =>
  typeof navigator !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window

/**
 * Ensure notification permission + a push subscription for this browser, registering the
 * service worker if needed. Returns the subscription JSON ({ endpoint, keys }) to send to
 * the backend. Throws Error('permission-denied') when the user blocks notifications.
 */
export const ensurePushSubscription = async (vapidPublicKey) => {
  if (!pushSupported()) throw new Error('Push notifications aren’t supported in this browser.')
  if (!vapidPublicKey) throw new Error('Push isn’t configured on the server.')

  let permission = Notification.permission
  if (permission === 'default') permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('permission-denied')

  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
  }
  return subscription.toJSON()
}
