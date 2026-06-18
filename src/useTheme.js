import { useSyncExternalStore } from 'react'

/* Global light/dark theme, driven by the data-theme attribute on <html>
   and persisted to localStorage. Shared across every component so the
   toggle stays in sync wherever it's shown. */

const getTheme = () =>
  document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'

const listeners = new Set()
const subscribe = (cb) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function setTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') root.setAttribute('data-theme', 'dark')
  else root.removeAttribute('data-theme')
  try {
    localStorage.setItem('mp-theme', theme)
  } catch (e) {
    /* ignore */
  }
  listeners.forEach((cb) => cb())
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light')
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  return { theme, toggle, setTheme }
}
