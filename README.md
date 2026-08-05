# Akshay ♥ Shraddha — 09.08.2026

A single continuous scroll-flight digital wedding invitation for the Bankapure × Sangave families — Belagavi × Kolhapur, Digambar Jain × Maharashtrian, Apple-polish × aaji-approved humor. Built with Next.js (App Router), a hand-rolled CSS design system, a canvas petal/akshata engine, and a procedural Three.js layer (brass kalash, floating diyas, 3D marigolds — zero external 3D assets, so nothing needs a license check).

## Quickstart

```bash
npm install
npm run dev       # http://localhost:3000
```

`npm run build && npm start` for production on any Node ≥ 18.17 host.


## How it works (v3 — one continuous flight)

The page is **one fixed viewport**. A tall empty `.scroller` div supplies scroll distance, and a single global progress value (0→1) drives everything: the camera flying down the 3D world, the SVG ribbon drawing itself, the rangoli morphing, the palette shifting and which act is on screen. Nothing mounts or unmounts as you scroll, so there are no section seams anywhere — it's one take from the antarpat to the blessings.

`components/stage/Stage3D.jsx` builds the entire world at once, stacked down the Y axis: the kalash and halo at the top, a spiral of memory orbs, a ring of event lanterns, the valley with a rickshaw driving a real curve, the mandap with its rings, and the blessing sky. The camera flies a gentle S-curve through all of it. `components/stage/Overlay.jsx` is the SVG skin (ribbon, live rangoli, phrase ticker, tap-anywhere confetti). `components/Invitation.jsx` is the orchestrator.

**Phone-first:** every size is authored for a 380px viewport, the 3D lens widens on narrow aspect ratios, device tilt drives parallax, all touch targets are ≥44px, inputs are 16px so iOS never zooms, and safe-area insets are respected. Desktop only moves the act rail to the side and adds breathing room.

**Language:** all Marathi/Kannada phrases live in `PHRASES` in `lib/config.js` and are always shown with their English meaning.


## Admin dashboard — where the RSVPs go

Visit **`/admin`** on your site. Default login `admin` / `admin123` — **change it in Settings on first login** (the dashboard warns you until you do; passwords are stored as scrypt hashes, never plain text, and changing one signs out every other device).

It shows a live headcount, the split of who's coming vs. not, and a **kitchen count** of Jain vs. regular-veg meals counted by heads and excluding non-attendees — that's the number for the caterer. There's a full RSVP table with each guest's note, blessings moderation (hide/restore), and **Download CSV** for both.

Data lives in **MySQL** when the `DB_*` environment variables are set (Hostinger — see DEPLOY-HOSTINGER.md), and in a local JSON file otherwise. The app creates its own tables; there's no SQL to run. The dashboard states which backend is live.

## The live muhurat

On 09.08.2026 the invitation changes by itself. Thirty minutes before the muhurat a quiet banner appears for anyone who opens the link; at the muhurat it becomes a full-screen ceremony where guests who couldn't travel throw akshata by tapping. Their taps join a **shared live count** across every remote guest, with petals and akshata bursting on screen and a haptic tap on phones. Thirty minutes later it closes gracefully and the blessings wall stays open.

Test it any time with **`/?rehearsal=1`** — that runs the whole ceremony immediately.


## Languages

English is the default. Marathi and Kannada are one tap away via the switcher in the top bar, and the choice lives in the URL so you can send a link already in the right language:

| Link | Opens in |
|---|---|
| `yourdomain.com/` | English |
| `yourdomain.com/?lang=mr` | Marathi (`?lang=ma` also works) |
| `yourdomain.com/?lang=kn` | Kannada (`?lang=ka` also works) |

Send the Kolhapur side the Marathi link and the Belagavi side the Kannada one. All strings live in `lib/i18n.jsx` — add a key there and it's available everywhere via `t("key")`. Names of people and places are never translated, only shown in the script we have a verified spelling for.

## Handing the day to someone else

Whoever is helping only needs one link: **`/admin/help`**. It's a step-by-step guide inside the site — starting an Unlisted YouTube stream, pasting the link into the **Live stream** tab, and what each warning means. It has a Print button, and it's linked from the dashboard header and the stream panel. `FOR-THE-HELPER.md` is the same thing as a file if you'd rather forward that.

## Testing the wedding-day ceremony

See **TESTING-THE-WEDDING-DAY.md**. Short version: `/?rehearsal=1` opens it right now, and `/?at=-20` or `/?at=0` lets you stand at any moment around the muhurat without touching your clock.

## Edit your details

Everything content-ish lives in **`lib/config.js`** — names (Latin/Devanagari/Kannada), parents, siblings, the family roll-call, all six events, story beats, map pins, the local guide, RSVP options and seed blessings. The hero, calendar links, .ics files, footer and monogram all read from it.

Open TODOs (marked with ✏️ in `lib/config.js`):

1. **Bhojan timing** — lunch is assumed to run 1:00–3:30 pm, following the akshata. Adjust in `EVENTS` if the kitchen has a different plan.
2. **Bhastgi** — listed as the day's opening ritual at 8:30. Check the one-line description reads right to family.

Confirmed and in place: the date and running order (Bhastgi 8:30 · Haldi 9:30 · **Akshata 12:00** · Bhojan after), the venue (Smt. Malini Patil Bhavan, Gavani, Belagavi district — with the real Maps link), the single-day schedule (Haldi → Vivah → Bhojan, all at the venue), both families, and the no-gifts request.


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
