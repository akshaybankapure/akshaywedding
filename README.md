# Akshay ♥ Shraddha — 09.08.2026

A scroll-driven digital wedding invitation for the Bankapure × Sangave families — Belagavi × Kolhapur, Digambar Jain × Maharashtrian, Apple-polish × aaji-approved humor. Built with Next.js (App Router), a hand-rolled CSS design system, a canvas petal/akshata engine, and a procedural Three.js layer (brass kalash, floating diyas, 3D marigolds — zero external 3D assets, so nothing needs a license check).

## Quickstart

```bash
npm install
npm run dev       # http://localhost:3000
```

`npm run build && npm start` for production on any Node ≥ 18.17 host.

## Edit your details

Everything content-ish lives in **`lib/config.js`** — names (Latin/Devanagari/Kannada), parents, siblings, the family roll-call, all six events, story beats, map pins, the local guide, RSVP options and seed blessings. The hero, calendar links, .ics files, footer and monogram all read from it.

Open TODOs (marked with ✏️ in the file):

1. **Shraddha's aai** — append her name to `bride.parents` and add the "कै. सौ. …" entry to the `remembrance` array (template is in the comment). Honorific is set as *Smt.*
2. **Muhurat** — `weddingISO` + `muhurtLabel` currently 11:47 AM placeholder.
3. **Venue** — name, address line and `mapsQuery` (drives the "Open in Maps" links).
4. **RSVP helpline** — real number (Nishchay is currently the drafted "unofficial event manager").
5. **Story beats** — the five `STORY` items and their sweet/spice caption pairs are templates for your real katha.
6. **Tirth vs Teerth** — standardized to *Tirth*; flip in `siblings` + `familiesLine` if needed.

## Where things live

`app/` — layout (self-hosted fonts via Fontsource: Fraunces, Sora, Tiro Devanagari Marathi, Noto Sans Kannada; OG metadata), the page, `globals.css` (the whole design system, night/day themes via `[data-theme]` tokens), and `app/api/kv/route.js`. `components/` — the main `WeddingInvitation` assembly plus split features: hero (`Curtain` antarpat reveal, `Scene3D` WebGL), events (`Countdown`, `EventCard`), venue (`RegionMap`, `GuideTabs`), rsvp (`Rsvp`, `Rings3D`), wall (`BlessingsWall`), fx (`PetalCanvas`, `Reveal`), decor. `lib/` — config, helpers, calendar (Google link + .ics generator), the WebAudio `Ambience` synth, and the `store` adapter.

## Persistence (RSVPs, tally, blessings)

The client `store` talks to `/api/kv`, which writes `data/kv.json` on the server — perfect for local dev and any always-on Node host. Delete `data/kv.json` to reset during testing. **Serverless caveat:** on Vercel/Netlify functions the filesystem is ephemeral, so RSVPs won't persist between cold starts — either deploy to a persistent Node host (Railway, Render, a small VPS with `next start`), or swap the two helpers in `app/api/kv/route.js` for Supabase / Vercel KV; component code needs no changes. If the API is unreachable entirely, the client degrades to in-memory so the UI never breaks.

## Sound, images, 3D

Ambient sound is synthesized in WebAudio (tanpura drone + temple bells) and needs no files; to use a real track, drop `public/audio/ambience-tanpura.mp3` and swap `lib/ambience.js` for an `<audio loop>` (notes in ARCHITECTURE.md). Photos and the 1200×630 `og-invite.png` share card go in `public/img/`. Three.js is pinned to `0.128.0` because the scene code uses that renderer API (`outputEncoding`); ARCHITECTURE.md covers upgrading to modern three / react-three-fiber and lists CC0 sources (Poly Haven, Kenney, Quaternius, ambientCG) if you ever want richer models than the procedural ones.

## Accessibility & motion

`prefers-reduced-motion` collapses all animation (the 3D renders one static frame, the petal canvas doesn't mount), focus rings are visible throughout, map pins and RSVP options are keyboard-operable, and rendering pauses whenever the hero is offscreen or the tab is hidden.

Deeper design/porting notes: **ARCHITECTURE.md** in this folder.

Shubh vivah! 🪔
