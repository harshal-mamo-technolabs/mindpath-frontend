/* ===== Assets =====
   Images and audio are hosted in an S3 bucket, not in this app's public/ folder.
   Only the origin lives in an env var (VITE_ASSET_BASE_URL), so moving the bucket
   or putting a CDN in front of it is a one-line change — no code edits and no
   database migration.

   Paths are stored relative everywhere, including in the backend's database
   (`session.audioUrl`, `audioPlan.welcomeAudioUrl`), e.g. `audio/welcome/x.mp3`.
   Leave the env var blank and paths resolve against this app's own origin, which
   keeps a local public/ folder working as a fallback. */

const BASE = (import.meta.env?.VITE_ASSET_BASE_URL || '').trim().replace(/\/+$/, '')

/** Absolute URL for an asset path. Already-absolute URLs pass through untouched. */
export const assetUrl = (path) => {
  if (!path) return path
  if (/^(https?:)?\/\//.test(path)) return path
  return `${BASE}/${path.replace(/^\/+/, '')}`
}

/* CSS can't read env vars, so the theme cover art layered by the .cover-* rules in
   styles/pages/audio.css comes through these custom properties. Called once at boot;
   each rule declares `var(--cover-x, none)` so the gradient underneath still shows
   if the image is missing. */
const COVER_THEMES = ['dusk', 'meadow', 'tide', 'violet', 'ember']

export const installAssetCssVars = () => {
  for (const theme of COVER_THEMES) {
    document.documentElement.style.setProperty(
      `--cover-${theme}`,
      `url("${assetUrl(`audio/cover/${theme}.png`)}")`,
    )
  }
}
