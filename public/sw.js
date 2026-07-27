/* Service worker — receives Web Push messages from the backend and shows a system
   notification, even when the tab is backgrounded.

   This file is served from public/ as-is, so Vite can't inline VITE_APP_NAME here.
   The app passes it on the registration URL instead (see src/lib/push.js). */

const APP_NAME = new URL(self.location.href).searchParams.get('app') || 'MindPath'
const APP_TAG = APP_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'app'

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data && event.data.text() }
  }
  const title = data.title || APP_NAME
  const options = {
    body: data.body || '',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: APP_TAG,
    data: { url: data.url || '/' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    }),
  )
})
