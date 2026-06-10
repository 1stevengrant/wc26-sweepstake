# World Cup 2026 Sweepstake

Static React + TypeScript + Vite + Tailwind 4 app. Pure-random, seeded,
replayable sweepstake draw for the 48-team tournament. No backend —
recordings persist in `localStorage` (per browser).

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
```

## Deploy to Cloudflare Pages

### Option A — Wrangler (direct upload)

```bash
npm run build
npx wrangler pages deploy dist --project-name=wc26-sweepstake
```

### Option B — Git integration (dashboard)

Connect the repo in the Cloudflare dashboard with:

- Build command: `npm run build`
- Build output directory: `dist`
- Framework preset: Vite

No SPA redirect rules needed — it's a single page with no client routing.
