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

## Contributing

See [`CLAUDE.md`](./CLAUDE.md) for architecture, conventions, the theming system, and
domain rules (non-clinical framing, deterministic scoring) before making changes.
