# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## What this is

**Daybreak** is an assessment-led mental-wellness web app (demo/marketing build). A
visitor takes a short self-assessment, gets a **deterministic** scored report, and is
guided into a matching daily-audio plan, ebooks, counselling, and free music. It is a
React single-page app with no backend — all content lives in static data modules under
`src/data/`.

### Domain rules (read before touching copy or scoring)

- **Non-clinical framing.** This is wellness, not diagnosis or therapy. Never describe
  assessments as clinical/diagnostic, never imply medical claims, and keep result copy
  supportive rather than labelling. Bands are `low` / `mid` / `high`, never
  "disorder"-style language.
- **Deterministic reports.** The same answers must always produce the same scores. See
  `scoreAnswers` in `src/data/assessments.js` (mean of items per dimension, reverse-scored
  where flagged, scaled 0–100, averaged to an overall). Do not introduce randomness into
  scoring.

## Tech stack

- **React 19** + **Vite 8** (`@vitejs/plugin-react`)
- **react-router-dom 7** for routing
- **lucide-react** for icons
- Plain CSS with design tokens (no CSS framework, no CSS-in-JS)
- **Prettier** for formatting, **ESLint** (flat config) for linting
- No TypeScript, no test runner currently

## Commands

```bash
npm run dev          # start Vite dev server (HMR)
npm run build        # production build to dist/
npm run preview      # preview the production build
npm run lint         # ESLint
npm run format       # Prettier --write over src (data/ is intentionally excluded)
npm run format:check # Prettier --check (use in CI)
```

## Project structure

```
src/
  main.jsx              App entry — mounts <App/>, imports all stylesheets
  App.jsx               Routes + layout (see "Routing" below)

  components/           Reusable / presentational components (Nav, Logo, Hero,
                        Reveal, section blocks for the marketing home, icon sets…)
  pages/                One component per route (screens). Page-level state lives here.
  data/                 Static, hand-curated content modules + pure helpers
                        (assessments, audioPlans, music, ebooks, billing, counselling,
                        reportHistory). Treated like fixtures — see formatting note.
  hooks/                Custom React hooks (useTheme).
  lib/                  Framework-agnostic helpers (time.js: formatTime / *toSeconds).

  styles/
    index.css           Design tokens, base/reset, global element styles
    pages/*.css         Per-feature stylesheets, one file per area

public/                 Static assets served as-is (images, favicon)
```

### Where things go

- A **new screen/route** → `pages/Foo.jsx` + a route in `App.jsx`, with its CSS in
  `styles/pages/foo.css` imported from `main.jsx`.
- A **reused piece of UI** → `components/`.
- **Content/data** (lists, copy, scoring config) → `data/`.
- A **pure helper** with no React → `lib/`. A **stateful/React helper** → `hooks/`.

## Routing

`App.jsx` defines all routes. Two groups:

- **Site layout** (`SiteLayout`) — wraps pages in the persistent `<Nav/>`. Used for the
  home page, dashboard, catalog, libraries, profile, pricing, etc.
- **Chrome-free flows** — full-screen, no nav: taking an assessment, the report view,
  auth (`/login`, `/signup`), and checkout. Add focused flows here, outside `SiteLayout`.

`ScrollManager` resets scroll on navigation and honors in-page `#hash` targets.

## Styling & theming

- The UI is **token-driven**. Colors, type, radii, shadows, and spacing live as CSS
  custom properties in `styles/index.css` (`--violet`, `--ink`, `--surface`,
  `--line-rgb`, …). Style with tokens, not hard-coded values, so theming stays free.
- **Day/night theme**: `useTheme` (`src/hooks/useTheme.js`) flips the `data-theme="dark"`
  attribute on `<html>` and persists to `localStorage`. The dark theme is just a second
  block of token values in `index.css` — token-driven components adapt automatically. The
  toggle currently lives on the Dashboard.
- For hairlines/borders use `rgba(var(--line-rgb), <alpha>)`; for raised vs inset
  surfaces use `--surface` / `--surface-2`.

## Code style & conventions

- Prettier config (`.prettierrc.json`): **no semicolons**, **single quotes**, trailing
  commas, 2-space indent, 100-char width. Run `npm run format` before committing.
- **`src/data/` is excluded from Prettier** (`.prettierignore`). Those files are
  hand-laid-out content tables (one record per line); auto-formatting either explodes the
  rows or collapses wrapped prose. Keep them tidy by hand.
- Components are **function components** with hooks — no classes.
- Data modules export **pure data + pure helpers** only; keep React out of `data/`.
- Keep the existing comment style: short section banners (`/* ===== … ===== */`) and
  intent-explaining comments over restating code.

## Known issues / gotchas

- `npm run lint` currently reports ~12 errors from the strict
  `eslint-plugin-react-hooks` v7 rules (`set-state-in-effect`, `refs`) and one
  `react-refresh/only-export-components`. They fire on **working, idiomatic patterns**
  (closing a menu on route change, animation/auto-advance timers, syncing a prop into
  state, a data file that also exports a component). The build is clean. Treat these as a
  deliberate follow-up: fix the effects carefully **with manual verification**, or, if the
  team prefers, downgrade those specific v7 rules to `warn` in `eslint.config.js`. Do not
  silently rewrite the timer/animation effects without checking behavior.
- No backend: "auth", "checkout", and "billing" are UI-only demos.
