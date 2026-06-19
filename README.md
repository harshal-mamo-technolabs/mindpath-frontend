# MindPath

An assessment-led mental-wellness web app (demo build). Take a short self-assessment,
get a deterministic scored report, and follow a matching daily-audio plan, ebooks,
counselling, and free music. React + Vite single-page app with no backend — all content
is served from static data modules.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command                | What it does                                          |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server with HMR                    |
| `npm run build`        | Production build to `dist/`                           |
| `npm run preview`      | Preview the production build locally                  |
| `npm run lint`         | Run ESLint                                            |
| `npm run format`       | Format `src/` with Prettier (data files excluded)     |
| `npm run format:check` | Check formatting without writing                      |

## Project layout

```
src/
  main.jsx      Entry point — mounts <App/> and imports stylesheets
  App.jsx       Routes and layout
  components/   Reusable UI components
  pages/        One component per route
  data/         Static content + pure helpers (hand-curated)
  hooks/        Custom React hooks (useTheme)
  lib/          Framework-agnostic helpers
  styles/       Design tokens (index.css) + per-feature CSS in styles/pages/
public/         Static assets
```

## Tech stack

React 19 · Vite 8 · react-router-dom 7 · lucide-react · plain CSS (token-driven theming).

## Deploying to Vercel

Vercel auto-detects Vite (build `vite build`, output `dist`). The repo includes a
[`vercel.json`](./vercel.json) that rewrites all routes to `index.html` so client-side
routes (`/dashboard`, `/pricing`, …) work on refresh and deep links.

Set these **Environment Variables** in the Vercel project (Settings → Environment
Variables) — they are inlined at build time, so a change requires a redeploy:

| Variable | Example | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `https://api.yourdomain.com` | Production backend URL (no trailing slash, no `/api`). |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` / `pk_test_…` | Stripe **publishable** key only. |

Then make sure the backend **allows the Vercel domain in CORS** and that Stripe’s
**webhook** points at the production backend (so subscriptions activate). The Node
version is pinned to 22 via [`.nvmrc`](./.nvmrc) / `package.json` `engines`.

## Contributing

See [`CLAUDE.md`](./CLAUDE.md) for architecture, conventions, the theming system, and
domain rules (non-clinical framing, deterministic scoring) before making changes.
