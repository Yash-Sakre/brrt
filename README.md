# brrt

A fast, minimal typing speed test. Multiple modes, polished themes, detailed
per-run analytics — all client-side, no account required.

![status](https://img.shields.io/badge/build-passing-a78bfa) ![license](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Modes** — time (15/30/60/120s), words (10/25/50/100), quote, zen, and custom text
- **Toggles** — punctuation and numbers, across `english`, `english 1k`, and `code` wordlists
- **Live feedback** — animated caret (line / block / underline), smooth line scrolling, optional keypress sound
- **Rich results** — net & raw WPM, accuracy, consistency, CPM, a per-second WPM chart, character breakdown, and a keyboard "trouble keys" heatmap
- **Progress** — per-mode personal bests, run history, and daily streaks (persisted locally)
- **Command palette** — `⌘K` / `Ctrl K` to switch mode, theme, or jump anywhere
- **6 themes**, fully responsive, mobile-friendly typing, reduced-motion aware

## Tech stack

React 18 · TypeScript · Vite 5 · Tailwind CSS · Radix UI · Zustand · cmdk

## Architecture

The codebase is split into a framework-agnostic core and a thin React binding —
this keeps the hard logic pure and unit-tested, and isolates UI concerns.

```
src/
  core/            Pure TypeScript — no React, no side effects, fully tested
    engine.ts        Typing state machine (a deterministic reducer)
    metrics.ts       WPM / accuracy / consistency / char-stat math
    result.ts        Finalize an engine run into a TestResult
    words.ts         Text generation (punctuation, numbers)
    wordlists/       Curated word pools and quotes
    storage.ts       StoragePort — the single IO boundary (swap for a backend)
  stores/          Zustand stores wiring the core to React
    useTestStore     Live test orchestration (engine + timing + sampling)
    useSettingsStore Config + appearance (persisted)
    useStatsStore    History, personal bests, streaks (persisted)
    useUiStore       Transient overlay / focus state
  features/        Feature-first UI (typing-test, results, settings, history, …)
  components/ui/    Reusable primitives (button, dialog, command, …)
  config/          Themes and presets
```

Why this shape:

- **The engine is a pure reducer.** It never reads the wall clock — every action
  carries its own timestamp — so it is deterministic and trivial to test.
- **Storage is an interface.** All persistence flows through `StoragePort`, so
  swapping localStorage for a backend (accounts, cloud sync) is a single change.
- **Stores are thin.** They translate user intent into engine actions and own
  only the side effects (timers, RNG, persistence).

## Getting started

```bash
pnpm install
pnpm dev          # start the dev server
pnpm lint         # eslint
pnpm typecheck    # tsc project references
pnpm build        # production build to dist/
```

## Keyboard shortcuts

| Key            | Action                    |
| -------------- | ------------------------- |
| `esc` / `tab`  | restart the current test  |
| `⌘K` / `Ctrl K`| open the command palette  |
| `enter`        | finish a zen test         |

## Deployment

Pushing to `main` runs lint and a build via GitHub Actions, then publishes
`dist/` to the `gh-pages` branch. The app is a static site and can be
hosted anywhere (Netlify, Vercel, GitHub Pages, …).

## License

MIT — see [LICENSE](./LICENSE).
