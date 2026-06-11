# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Vite dev server (http://localhost:5173)
npm run build          # blank build  -> dist/ (empty player list)
npm run build:roster   # roster build -> dist/ (pre-fills the ROSTER constant)
npm run lint           # eslint
npm run deploy         # blank build  -> Cloudflare Pages project `sweepstake`
npm run deploy:roster  # roster build -> Cloudflare Pages project `wc26-sweepstake-draw`
```

There are no tests. `build` runs `tsc -b` before `vite build`, so a type error fails the build.

## Architecture

Single-page React + TypeScript + Vite + Tailwind 4 app. Effectively one component: `src/SweepstakeDraw.tsx` holds all logic, types, tournament data, and UI. `src/main.tsx` just mounts it. There is no backend, no router, and no test suite.

### Determinism is the core invariant

A draw is fully reproducible from a **seed (number) + player list**. Nothing else affects the outcome. `buildSequence(players, seed)` is the single source of truth: it seeds `mulberry32`, Fisher-Yates `shuffle`s the 48 teams and the per-entry "slots", then deals teams to slots top-down. Two independent shuffles (teams and slot order) mean neither FIFA rank/group nor player insertion order influences who gets what. `min(totalEntries, 48)` teams are dealt; surplus teams stay `undrawn`.

Everything downstream relies on this: replay, saved recordings, and share links all just re-run `buildSequence` with a stored seed rather than persisting results. **Do not change the RNG, shuffle, or slot-building logic without understanding that it silently breaks every previously saved/shared draw**, since their seeds will now reproduce different outcomes.

### Two builds from one codebase

`VITE_PRELOAD_ROSTER=true` (set only by `build:roster`) flips `PRELOAD_ROSTER`, which decides whether the initial `players` state is the hardcoded `ROSTER` or empty. The two Cloudflare Pages projects (`sweepstake` = blank, `wc26-sweepstake-draw` = roster) are the same code built with/without that flag. Keep both deployable; don't make one diverge.

### Two independent persistence mechanisms

- **Saved recordings** — `localStorage`, keyed `wc26-draw:<id>` (`persistDraw`/`listDraws`/`removeDraw`). Per-browser, per-origin only. Survives redeploys (same domain) but does not sync across devices/people, and is separate per Pages domain.
- **Share links** — the draw is base64url-encoded into the URL hash `#/d/<blob>` (`encodeDraw`/`decodeDraw`/`shareLinkFor`). On load, `readSharedDraw` decodes the hash and auto-plays. The hash never reaches the server, so this needs no backend and no SPA redirect rules. This is the only cross-device/cross-person sharing path.

`normalise` (for localStorage) and `decodeDraw` (for links) both defensively coerce untrusted input and tolerate the legacy shape where `players` was an array of strings rather than `{name, entries}`.

### Tournament data

`TEAMS` (48 nations with group/rank/flag) is hardcoded. `ROSTER` (entrants for the specific sweepstake) is also hardcoded and only loaded in the roster build. Entries per player are capped at `MAX_ENTRIES_PER_PLAYER`.

## Conventions

Styling is a mix of Tailwind utility classes and inline `style` objects driven by the `PALETTE` / `GROUP_COLOURS` constants (the green-pitch theme). Match that pattern rather than introducing a CSS framework or new theming approach.
