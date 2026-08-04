# Parshva ♥ Sayali — Production Architecture Guide

The `wedding-invitation.jsx` artifact is a fully working single-file demo tuned for the Claude artifact sandbox (no build step, no external assets, storage-adapter fallbacks). This document maps that demo onto a production-grade Next.js codebase, records the design system it implements, and gives you the recipes for the signature animations so your team can extend rather than reverse-engineer.

## Concept and signature element

The whole experience is staged as six full-screen "chapters" instead of a scrolling brochure. The signature moment — the one thing guests will remember — is the **antarpat reveal**: the silk cloth held between bride and groom in a Maharashtrian/Jain ceremony, rendered as a scroll-driven curtain. The guest scrolls, the mangalashtak line on the cloth changes to "शुभमंगल… सावधान!", the cloth parts with a fabric-like ease, akshata (rice grains) and marigold petals burst across the screen, and the names + muhurat are revealed. Every other animation on the page is deliberately quieter so this one lands.

## Suggested Next.js structure

```
app/
├── layout.tsx                  # fonts (next/font), metadata, OG image
├── page.tsx                    # assembles the six chapters
├── api/
│   ├── rsvp/route.ts           # POST → Google Sheets / Supabase
│   └── blessings/route.ts      # GET/POST with rate-limit + profanity filter
components/
├── chrome/    TopBar.tsx · DotNav.tsx · ProgressBar.tsx
├── hero/      HeroChapter.tsx · AntarpatCurtain.tsx · Mandala.tsx · Diya.tsx
├── story/     StoryChapter.tsx · Timeline.tsx · ModeToggle.tsx
├── events/    EventsChapter.tsx · EventCard.tsx · Countdown.tsx · AddToCalendar.tsx
├── venue/     VenueChapter.tsx · RegionMap.tsx · GuideTabs.tsx
├── rsvp/      RsvpChapter.tsx · VibePicker.tsx · Confirmation.tsx
├── wall/      WallChapter.tsx · BlessingCard.tsx · Composer.tsx
└── fx/        PetalCanvas.tsx · Ambience.ts · useReveal.ts · useScrollProgress.ts
lib/
├── config.ts                   # the single EDIT-ME block (names, dates, venues)
├── calendar.ts                 # gcalUrl() + downloadICS()
└── storage.ts                  # swap the demo adapter for your API client
content/
└── strings.ts                  # all copy, keyed en / mr / kn for localisation
public/
├── audio/ambience-tanpura.mp3  # replaces the synthesized WebAudio drone
├── img/couple/*.webp           # hero + story photos (AVIF/WebP, ≤ 200 KB each)
├── img/og-invite.png           # 1200×630 share card with names + date
└── lottie/*.json               # optional Lottie diyas/kalash if you outgrow SVG
```

In the artifact, all of this lives in one file in the same order: CONFIG and data → helpers → CSS → decor/engine components → feature components → main assembly. Splitting is mostly cut-and-paste.

## Design tokens

Both themes are driven entirely by CSS custom properties on the root wrapper (`data-theme="night" | "day"`), so re-skinning is a token edit, never a component edit.

```css
/* Raat (default) — silk at night */
--bg:#0a0e24; --bg2:#131938; --ink:#f4ead6; --muted:#b6a688;
--gold:#e3b341; --gold2:#f7d87c; --rose:#ff5d8f; --emerald:#23c08f;
--maroon:#7c1f38; --card:rgba(21,27,56,.72); --line:rgba(227,179,65,.28);

/* Divas — haldi ivory */
--bg:#f8f0dd; --ink:#3c1220; --gold:#a97c14; --rose:#c2185b; /* …see CSS */
```

Type roles: **Fraunces** (display serif — names, chapter titles, countdown digits; its optical-size axis gives the big settings real character), **Sora 300/400** (body/UI), **Tiro Devanagari Marathi** (all Devanagari lines — invocations, नावं, the mangalashtak on the cloth). Kannada lines fall back to system Kannada fonts; in production add `Noto Sans Kannada` via `next/font` for guaranteed rendering. Texture comes from an inline SVG `feTurbulence` grain overlay at 7% opacity plus a subtle woven-silk gradient on the curtain — cheap, asset-free depth.

## Animation recipes

**Antarpat scroll reveal.** The hero track is `280vh`; a child is `position: sticky; top: 0; height: 100dvh`. Progress is simply `p = clamp(scrollTop / (1.8 × viewportHeight), 0, 1)` because the hero is the first section. The two cloth halves translate `±108%` with a cubic ease-out (`1 − (1−p)³`) and a 1.6° rotation for fabric weight; the couple's names counter-scale from 0.94→1 as `p` crosses the reveal band; a one-shot `useEffect` fires the akshata burst at `p > 0.5`. In production you can swap the hand-rolled progress for GSAP ScrollTrigger (`scrub: true`, `pin: true`) or Framer Motion's `useScroll` + `useTransform` — the math transfers one-to-one. The demo avoids those libraries only because the artifact runtime doesn't ship them.

**Petal + akshata engine.** One fixed, pointer-events-none `<canvas>` runs ~30 ambient marigold petals (quadratic-curve petal shapes, sinusoidal sway, gentle pointer repulsion within 90px) and exposes a global `fx.burst(x, y)` that adds 26 petals + 70 rice grains with gravity and decay. Frame loop pauses on `document.hidden`, respects `devicePixelRatio` (capped at 2), drops to ~20 particles under 640px, and unmounts cleanly. RSVP submission and blessing posts both call `fx.burst` at the trigger's screen coordinates so the physics feels causal, not decorative.

**Reveal system.** A single `Reveal` wrapper (IntersectionObserver at 0.15 threshold, fire-once) toggles a `.rv → .rv.in` transition; stagger is just `transitionDelay = index × 80ms` passed inline. Chapter dots highlight via a second observer with `rootMargin: "-42% 0px -42%"` (center-line detection).

**Reduced motion.** A `prefers-reduced-motion` media query kills all CSS animation/transition durations, the petal canvas doesn't mount at all, and programmatic scrolling switches to `behavior: "auto"`. Keep this wiring when you port — it is part of the quality floor, not an option.

**Ambient sound.** The demo synthesizes a tanpura-ish drone (C#2/C#3 + fifth through a slowly-LFO'd lowpass) and a random pentatonic temple bell every 7–12s in raw WebAudio, started only on user gesture. In production, replace `Ambience` with an `<audio loop>` of a real recorded track at `/public/audio/ambience-tanpura.mp3` (~1 MB Opus/AAC), keep the same toggle button, and fade via `GainNode` for the same graceful start/stop.

## The 3D layer (Three.js, MIT — fully license-clean)

The invite now carries a real-time WebGL scene, and it is deliberately built so that **nothing in it needs a licence check**: the only 3D dependency is Three.js r128 (MIT), and every object is procedural geometry authored in code — no downloaded models, no textures beyond two runtime-generated canvas gradients. The hero scene renders a **brass kalash** (a ~12-point `LatheGeometry` profile for the pot/neck/rim, a `TorusGeometry` neck band, a squashed-sphere coconut and six `ShapeGeometry` mango leaves fanned on pivot groups), six **floating clay diyas** — lathe bowls whose flames flicker by scaling a small emissive sphere, with additive-blended glow sprites and real `PointLight`s on four of them so the gold actually responds to the fire — plus ~105 **instanced 3D marigold petals** (`InstancedMesh` of flattened `CircleGeometry`, per-instance fall/sway/tumble via a dummy `Object3D`) and an additive `Points` cloud of "haldi dust." A second tiny scene, two interlocked gold and rose-gold tori, spins on the RSVP confirmation card.

The scene is wired into the same systems as everything else: `FogExp2` recolours on the Raat/Divas theme toggle so objects fade into the CSS background; the camera dollies with hero scroll progress and parallaxes with the pointer; an `IntersectionObserver` stops rendering the moment the hero leaves the viewport (and `document.hidden` pauses it too); DPR is capped at 1.75; petal/dust counts drop under 640px; `prefers-reduced-motion` renders a single static frame instead of a loop; and if `WebGLRenderer` construction throws, the component returns `null` and the 2D mandala simply carries the hero alone. Everything is disposed on unmount (geometries, materials, textures, renderer).

**Porting and free assets.** In Next.js, lift this into `react-three-fiber` + `drei` (`<Canvas frameloop="demand">`, `useTexture`, `Instances`) — the object graph transfers directly. If you later want richer models than the procedural ones, stick to sources that are free for commercial use: **Poly Haven** (CC0 — its HDRIs are the single best upgrade here: one 1K studio HDRI as `scene.environment` makes the brass genuinely reflective), **Kenney.nl** and **Quaternius** (CC0 model packs), **ambientCG** (CC0 PBR textures), and **Sketchfab filtered to CC0/CC-BY** (CC-BY needs a visible credit line — put it in the footer). Load GLTFs with `GLTFLoader` + Draco/Meshopt compression, keep the hero under ~1.5 MB of 3D payload, and prefer one `<Canvas>` per page — mount the rings scene into the same canvas via a portal if Lighthouse complains about contexts.

**v2 effects pack.** The hero scene now also runs a jewel-tone value-noise ShaderMaterial "silk nebula" quad behind everything, a counter-rotating chakra halo (three additive tori) plus a breathing aura sprite behind the kalash, two catenary marigold **toran** garland strands (tube + three InstancedMeshes each), rising akash-kandil sky lanterns, and an ember Points system — and the RSVP rings gained an orbiting sparkle ring. On the DOM side: self-drawing rangoli SVG chapter dividers and embroidered curtain stitching (`pathLength`/dashoffset draw-on), a story vine that grows with scroll progress, SMIL `animateMotion` travellers on the map (an auto-rickshaw shuttling the Kolhapur↔Belagavi road and two monsoon birds, rendered statically under reduced motion), letter-staggered shimmer names (`background-clip: text`), conic-gradient sheen borders via `@property --ang`, pointer-tilt event cards with a tracked glare, a cursor glow on `mix-blend-mode: screen`, and a bilingual phrase marquee. Every effect obeys the same budgets as before: reduced-motion collapse, offscreen pause, capped DPR, and lower particle counts on phones.


## Art direction rules for the 3D layer

Four rules keep the scene reading as design rather than programmer art, and they should survive any future edit:

1. **Nothing renders in front of the text.** Every object sits at z ≤ -4; the glass panels own the foreground. Petals used to drift between the camera and the copy, which made them read as grey blobs over the type — they now live behind everything.
2. **No solid primitives pretending to be objects.** A box with two torus wheels does not read as a rickshaw; it reads as a mistake. Props are either elegant surfaces of revolution (kalash, pillars, rings), catenary swags (toran, canopy drapes), layered paper-cut silhouettes (the ridge lines in the Rasta zone), or pure light (lantern boats, memory orbs). If a shape can't be made beautiful in code, it becomes light instead.
3. **Everything warm is emissive.** Any object relying purely on a light hitting it will eventually render flat grey when the camera moves. Emissive materials plus additive glow sprites mean the palette holds from every angle.
4. **The camera frames; it never flies through.** Each zone is composed at a fixed standoff (camera z ≈ 7.2, geometry at z ≈ -6 to -20) with a slow drift. The earlier version put the camera inside the hills, which is why everything looked like flat coloured triangles at point-blank range.

Lighting is a warm key, a cool rim, and a hemisphere fill so nothing is ever unlit. Fog is linear (16→46) so distant zones dissolve instead of popping. `lib/models.js` is the drop-in slot for real CC0 miniatures (Poly Haven, Quaternius, Kenney, ambientCG) plus HDRI environment loading — the fastest single upgrade is one 1K HDRI as `scene.environment`, which gives the brass real reflections.


## Two failure modes worth never repeating

**Never nest a scroll container inside a scroll-driven page.** An inner `overflow-y: auto` with `overscroll-behavior: contain` silently eats the wheel: the guest scrolls over the middle of the screen, the page freezes, and they have to find the margins to continue. Long content is now handled by `ActFlow`, which measures its overflow and translates it upward in step with the act's local progress — the page scroll is the only scroll, and the content still moves.

**Keep the token block intact when generating the single-file build.** The artifact is generated from these sources by stripping imports and swapping font declarations. An over-greedy regex once deleted the whole `:root {}` block instead of just its four font lines, which took every colour token with it — `--ink`, `--gold`, `--glass` — so text fell back to browser-default black on a dark background and the entire invite rendered nearly invisible. The generator now replaces the font lines individually and asserts that `--ink`, `--glass` and `--gold` are still present before writing.

## Data and integrations

**Calendar** needs no backend: `gcalUrl()` builds a `calendar.google.com/render` link with `ctz=Asia/Kolkata`, and `downloadICS()` generates an RFC-5545 VEVENT (IST converted to UTC stamps) as a Blob — this covers Apple/Outlook. Both already work in the demo.

**RSVP.** The demo appends to a shared key-value store (last-write-wins, fine for a demo; in the artifact this data is visible to anyone viewing it, and the UI says so). For the real wedding, POST to `/api/rsvp` and write to a Google Sheet (googleapis + service account) or a Supabase table `rsvps(name, vibe, party_size, meal, song, created_at)`; the meal field matters — the caterer will genuinely want the Jain / regular-veg / teekha split. Keep the client optimistic: burst first, sync after.

**Blessings wall.** Same swap: `GET /api/blessings` on mount, `POST` on submit, 160-char cap server-side, a light profanity filter, and moderation via a `hidden` flag (aunties will test you). **Audio blessings** — omitted in the sandbox because iframes don't get mic permission — are straightforward in production: `MediaRecorder` → 20s cap → upload webm/opus to Supabase Storage or S3 → render as a card with a play button. Fall back to text when `getUserMedia` is denied.

**Map.** The illustrated SVG region map (venue, IXG airport, railway station, Gokak Falls, Kolhapur, Belagavi Fort's Kamal Basadi) is intentionally a designed object, not a Google Maps embed — keep it, and let each pin's "Open in Maps" link do the real navigation. If you want live directions inline, mount a Mapbox GL map behind a "switch to live map" toggle rather than replacing the illustration.

## Customisation checklist (10 minutes)

Everything editable lives in the `CONFIG`, `EVENTS`, `STORY`, `PINS`, `GUIDE`, `VIBES`, and `SEED_BLESSINGS` blocks at the top of the file. The real names are now in — **Akshay Bankapure & Shraddha Sangave** (Latin, Devanagari and Kannada), parents on the hero (Smt. Rupali & Late Shri Ashok Bankapure; Shri Babaso Sangave), siblings and the Bankapure · Magadum · Khot · Tirth family roll-call in the footer, and a "स्वर्गीय आशीर्वाद" remembrance line. Two marked TODOs remain in `CONFIG`: append Shraddha's late mother's name to `bride.parents` and add her to the `remembrance` array (a commented template shows the exact format). Still placeholders: the muhurat time in `weddingISO` + `muhurtLabel` (11:47 AM), venue name/address/`mapsQuery`, the hotel block-booking line, the RSVP helpline number, and the five story beats with their "sweet vs. spice" caption pairs, which are written as templates for the couple's real katha. The hashtag string feeds the monogram, calendar entries and footer.

## Quality floor

Ship with: `next/font` self-hosted fonts (no FOUT on the names), OG/Twitter cards with the couple + date, `prefers-reduced-motion` honored, visible `:focus-visible` rings (already styled), keyboard-operable map pins and radio groups (already `role`/`aria-checked` wired), Lighthouse ≥ 90 mobile (the canvas and blur layers are the budget — cap `backdrop-filter` usage if low-end Androids stutter), and a plain-HTML fallback `<noscript>` block with names, date, venue and the RSVP phone number, because at least one beloved elder will open this on a 2014 tablet.
