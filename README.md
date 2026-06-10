# World Cup 2026 Sweepstake

Static React + TypeScript + Vite + Tailwind 4 app. Pure-random, seeded,
replayable sweepstake draw for the 48-team tournament. No backend —
recordings persist in `localStorage` (per browser), and any draw can be
shared as a self-contained URL (`#/d/...`) that replays identically.

## Develop

```bash
npm install
npm run dev
```

## Two builds from one codebase

The player list can either start empty or come pre-filled with a roster.
This is controlled by the `VITE_PRELOAD_ROSTER` build flag.

```bash
npm run build          # blank build — empty player list
npm run build:roster   # pre-filled build — loads the roster in src/SweepstakeDraw.tsx
```

Both output to `dist/`.

## Deploy to Cloudflare Pages

Two live projects are served from this one repo:

| Project                | URL                              | Build                |
| ---------------------- | -------------------------------- | -------------------- |
| `sweepstake`           | sweepstake-33m.pages.dev         | blank (`build`)      |
| `wc26-sweepstake-draw` | wc26-sweepstake-draw.pages.dev   | roster (`build:roster`) |

```bash
npm run deploy          # blank build  -> sweepstake
npm run deploy:roster   # roster build -> wc26-sweepstake-draw
```

No SPA redirect rules needed — it's a single page; the shareable draw lives
in the URL hash, which never hits the server.
