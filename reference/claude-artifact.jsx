import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Music, VolumeX, Sun, Moon, MapPin, CalendarPlus, Download, ChevronDown,
  Sparkles, Heart, Send, PartyPopper, Utensils, Plane,
  Shirt, Hotel, Umbrella, Check, Plus, Minus, Star, Flame, Mic, Clock
} from "lucide-react";
import * as THREE from "three";

/* ════════════════════════════════════════════════════════════════════
   ✏️  EDIT ME — every name, date, venue and phone number lives here.
   ════════════════════════════════════════════════════════════════════ */
const CONFIG = {
  groom: {
    en: "Akshay", dev: "अक्षय", kan: "ಅಕ್ಷಯ್", surname: "Bankapure",
    family: "the Bankapure parivaar, Belagavi",
    parents: "Son of Smt. Rupali Bankapure & Late Shri Ashok Bankapure",
  },
  bride: {
    en: "Shraddha", dev: "श्रद्धा", kan: "ಶ್ರದ್ಧಾ", surname: "Sangave",
    family: "the Sangave parivaar, Kolhapur",
    // ✏️ TODO: when ready, append " & Late Smt. <aai's name> Sangave" below
    parents: "Daughter of Shri Babaso Sangave",
  },
  /* Heavenly blessings — shown in the footer.
     ✏️ TODO: add Shraddha's late aai's name as a second entry, e.g.
     "कै. सौ. ______ सांगवे · Late Smt. ______ Sangave" */
  remembrance: ["कै. श्री. अशोक बंकापुरे · Late Shri Ashok Bankapure"],
  siblings: "Nishchay · Shweta & Pramod Khot · Divya & Sharad Tirth",
  familiesLine: "Bankapure · Magadum · Khot · Tirth × Sangave",
  hashtag: "#AkshayWedsShraddha",
  weddingISO: "2026-08-09T11:47:00+05:30", // Shubh Muhurat
  muhurtLabel: "Shubh Muhurat · 11:47 AM",
  city: "Belagavi, Karnataka",
  venue: {
    name: "Shri Mangal Lawns",
    line: "Fort Road, Belagavi 590016",
    mapsQuery: "Shri Mangal Lawns Fort Road Belagavi",
  },
  hotel: "Hotel Sankam Residency (say “Shraddha–Akshay shaadi” for the blocked rate)",
  contact: "RSVP helpline · +91 98XXX XXXXX (Nishchay — the groom's bhau & unofficial event manager)",
};

const EVENTS = [
  {
    id: "haldi", emoji: "🪔", title: "Haldi", tag: "Turmeric threat level: maximum",
    date: "2026-08-07", start: "10:00", end: "13:00", place: "Bankapure Residence courtyard",
    dress: "Anything you're ready to sacrifice to haldi. Yellow earns bonus points.",
    note: "Ukhaane optional, giggling mandatory.",
  },
  {
    id: "mehendi", emoji: "🌿", title: "Mehendi", tag: "Free hand-art. Patience required.",
    date: "2026-08-07", start: "16:00", end: "20:00", place: "Shri Mangal Lawns · Garden wing",
    dress: "Greens & pastels. Sleeves you can roll up.",
    note: "Chaha + kanda bhaji on loop (it's monsoon, obviously).",
  },
  {
    id: "sangeet", emoji: "💃", title: "Sangeet", tag: "Lavani vs. bhajan-remix dance-off",
    date: "2026-08-08", start: "19:00", end: "23:30", place: "Shri Mangal Lawns · Main hall",
    dress: "Sparkle. The DJ has been warned about 'Nad Khula'.",
    note: "Both aajis have rehearsed. Nobody is safe.",
  },
  {
    id: "phere", emoji: "🐎", title: "Baraat · Granthi Bandhan · Phere", tag: "The main event",
    date: "2026-08-09", start: "09:30", end: "12:30", place: "Shri Mangal Lawns · Mandap",
    dress: "Sarees & kurtas. Nauvari + Kolhapuri saaj = front-row respect.",
    note: "Mangalashtak at full family volume. Akshata will fly. Muhurat 11:47 AM sharp-ish.",
  },
  {
    id: "bhojan", emoji: "🍛", title: "Grand Jain Bhojan", tag: "Kanda-lasun free. Flavor overloaded.",
    date: "2026-08-09", start: "12:30", end: "15:00", place: "Shri Mangal Lawns · Bhojan hall",
    dress: "Elastic waistbands are a valid cultural choice.",
    note: "Unlimited jilebi. Shudh ghee. Zero compromise.",
  },
  {
    id: "reception", emoji: "✨", title: "Reception", tag: "Kolhapuri spice meets Belagavi sweet",
    date: "2026-08-09", start: "19:00", end: "22:30", place: "Shri Mangal Lawns · Lawns",
    dress: "Smart festive. Kolhapuri chappals are dance-floor legal.",
    note: "Belagavi Kunda counter closes only when the Kunda does.",
  },
];

const STORY = [
  {
    y: "Once upon…", t: "Two kids, 120 km apart",
    sweet: "One home began mornings with the Navkar Mantra; the other with aarti and a shamelessly loud bell. Both agreed on the essentials: Sundays mean sheera.",
    spice: "He was the topper who feared haldi stains on his notebooks. She once traded homework answers for an extra pedha. Balance.",
  },
  {
    y: "2019", t: "The Misal Summit, Kolhapur",
    sweet: "She asked for extra tarri. He asked for “Jain misal, no kanda-lasun.” The waiter needed a moment of silence. So did he — she was laughing at him already.",
    spice: "She judged his spice tolerance for exactly eleven seconds, then decided to marry it into shape.",
  },
  {
    y: "2019–24", t: "Long distance, short patience",
    sweet: "Pune ↔ Bengaluru. 4,217 video calls (approx.), two train apps, one shared playlist titled “halu halu”.",
    spice: "NH-48 has witnessed more of this love story than both families combined.",
  },
  {
    y: "2025", t: "The Yes ×2",
    sweet: "He asked in Marathi. Then again in Kannada, for the Belagavi quorum. She said “Ho!” and “Howdu!” — motion passed unanimously.",
    spice: "The ring was insured. The knees, tragically, were not.",
  },
  {
    y: "2026", t: "Sweets were exchanged",
    sweet: "Belagavi Kunda met Kolhapur pedha. Two families, one sugar rush, zero regrets.",
    spice: "Both aajis are now locked in a silent, ghee-based arms race. Guests win either way.",
  },
];

const RITUAL_CHIPS = [
  "Navkar Mantra opening", "Mangalashtak — full family volume", "Antarpat & Akshata",
  "Granthi Bandhan", "Saat Phere", "Aashirwad + one enormous group photo",
];

const VIBES = [
  { id: "dance", emoji: "🕺", title: "Nachnaar. Nad khula!", sub: "On the floor till 2 AM. DJ, brace yourself." },
  { id: "food", emoji: "🍛", title: "Fakt jevayla yenar", sub: "Mainly here for the jevan. Honestly? Respect." },
  { id: "phere", emoji: "🌸", title: "Phere-only professional", sub: "Muhurat, blessings, 400 photos, home by nap time." },
  { id: "afar", emoji: "💛", title: "Wishing from afar", sub: "Can't make it — sending love. Laddoo courier expected." },
];
const MEALS = ["Jain (no kanda-lasun)", "Regular veg", "Kolhapuri teekha 🌶️"];

const SEED_BLESSINGS = [
  { n: "Aaji", m: "Eat first, dance later. This is not a suggestion. 🙏", c: 0 },
  { n: "Prakash Kaka", m: "ಶುಭಾಶಯಗಳು! Lai bhari jodi. Border-city approved. 🪔", c: 1 },
  { n: "Cousin Rohan", m: "May your Wi-Fi be strong and your arguments short. ❤️", c: 2 },
  { n: "Magadum Kaku", m: "May your love be like Kunda — slow-cooked, rich, impossible to stop at one serving. 🍯", c: 3 },
];

const PINS = [
  { id: "venue", x: 300, y: 240, icon: "★", label: "Shri Mangal Lawns", sub: "The venue · Fort Road, Belagavi", km: "You are needed here", q: CONFIG.venue.mapsQuery },
  { id: "air", x: 150, y: 140, icon: "✈", label: "Belagavi Airport (IXG)", sub: "Sambra · direct from BLR, BOM, HYD", km: "≈ 10 km from venue", q: "Belagavi Airport" },
  { id: "rail", x: 330, y: 330, icon: "🚉", label: "Belagavi Railway Stn", sub: "Rani Chennamma Exp fans, this is you", km: "≈ 4 km from venue", q: "Belagavi Railway Station" },
  { id: "gokak", x: 565, y: 130, icon: "💧", label: "Gokak Falls", sub: "August = full monsoon flow. Go.", km: "≈ 60 km · day trip", q: "Gokak Falls" },
  { id: "kolhapur", x: 645, y: 385, icon: "🛕", label: "Kolhapur", sub: "Mahalaxmi darshan, Rankala katta, chappal shopping", km: "≈ 2.5 hrs by road", q: "Mahalaxmi Temple Kolhapur" },
  { id: "fort", x: 470, y: 280, icon: "🏰", label: "Belagavi Fort & Kamal Basadi", sub: "12th-century Jain basadi inside the fort", km: "≈ 3 km · morning walk", q: "Kamal Basadi Belagavi Fort" },
];

const GUIDE = {
  khaana: [
    ["Belagavi Kunda", "Caramelised-milk magic. Buy two kilos. Thank us later."],
    ["Mande", "Paper-thin, ghee-soaked sweet. Eaten with both hands and no dignity."],
    ["Karadantu (Gokak)", "Edible souvenir. Survives flights, never survives the week."],
    ["Misal", "Order 'medium' unless you've trained. 'Extra tarri' is a lifestyle."],
    ["Cutting chai + kanda bhaji", "Monsoon's official pairing. Non-negotiable in August."],
  ],
  pehnava: [
    ["Haldi", "Old kurta you can donate to turmeric. White = brave."],
    ["Sangeet", "Sparkle first, comfort second — or Kolhapuri chappals and both."],
    ["Wedding", "Sarees & kurtas. Nauvari + saaj = front-row respect at the mandap."],
    ["Reception", "Smart festive. August drizzle is romantic; soggy mojaris are not — carry an umbrella."],
  ],
  pravaas: [
    ["Fly", "Belagavi Airport (IXG), ~25 min away. Kolhapur airport works too."],
    ["Train", "Rani Chennamma Express from Bengaluru does the overnight classic."],
    ["Drive", "Pune → Belagavi ≈ 5–6 hrs on NH-48. Ghat-section selfies are mandatory."],
    ["Stay", CONFIG.hotel],
  ],
  insider: [
    ["Learn two phrases", "“Lai bhari!” (Marathi) and “Bhaari chennagide!” (Kannada). Instant family."],
    ["“Jevan zala ka?”", "It's a greeting, not a catering audit. Correct answer: smile, say ho, eat again."],
    ["Halu halu", "Means 'slowly' in Marathi and Kannada. The only speed limit this weekend."],
    ["Monsoon rule", "Umbrella in bag, chappals with grip, heart fully open."],
  ],
};

/* ── tiny utilities ─────────────────────────────────────────────── */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad2 = (n) => String(n).padStart(2, "0");
const DAYNAME = { "2026-08-07": "Friday", "2026-08-08": "Saturday", "2026-08-09": "Sunday" };
const prettyDate = (d) => `${DAYNAME[d] || ""} · ${d.slice(8)} Aug`;
const to12h = (t) => { const [h, m] = t.split(":").map(Number); const ap = h >= 12 ? "PM" : "AM"; return `${((h + 11) % 12) + 1}:${pad2(m)} ${ap}`; };

const gcalStamp = (date, time) => `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
const gcalUrl = (e) => {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${e.emoji} ${e.title} — ${CONFIG.hashtag}`,
    dates: `${gcalStamp(e.date, e.start)}/${gcalStamp(e.date, e.end)}`,
    ctz: "Asia/Kolkata",
    details: `${e.tag}. ${e.note}`,
    location: `${e.place}, ${CONFIG.city}`,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
};
const utcStamp = (date, time) =>
  new Date(`${date}T${time}:00+05:30`).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
const downloadICS = (e) => {
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AkshayShraddha//Wedding//EN", "BEGIN:VEVENT",
    `UID:${e.id}-2026@parshva-sayali`, `DTSTAMP:${utcStamp("2026-07-30", "00:00")}`,
    `DTSTART:${utcStamp(e.date, e.start)}`, `DTEND:${utcStamp(e.date, e.end)}`,
    `SUMMARY:${e.emoji} ${e.title} — ${CONFIG.hashtag}`,
    `DESCRIPTION:${e.tag}. ${e.note}`, `LOCATION:${e.place}, ${CONFIG.city}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${e.id}-parshva-sayali.ics`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
};

/* Shared persistence — uses the artifact's window.storage when present
   (blessings + RSVP tallies are shared across everyone viewing this
   invite), and quietly falls back to in-memory state elsewhere. */
const store = {
  async get(key, fallback) {
    try {
      if (typeof window === "undefined" || !window.storage) return fallback;
      const r = await window.storage.get(key, true);
      return r && r.value ? JSON.parse(r.value) : fallback;
    } catch { return fallback; }
  },
  async set(key, val) {
    try {
      if (typeof window === "undefined" || !window.storage) return;
      await window.storage.set(key, JSON.stringify(val), true);
    } catch { /* last-write-wins demo store; failures are non-fatal */ }
  },
};

/* fx bus — the petal canvas registers a burst() so any component can
   throw akshata + marigolds from a screen point. */
const fx = { burst: null };

/* Ambient soundscape — a synthesized tanpura-ish drone + temple bell,
   built on raw WebAudio so the invite ships with zero audio assets. */
class Ambience {
  start() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const t = this.ctx.currentTime;
    this.master = this.ctx.createGain();
    this.master.gain.setValueAtTime(0.0001, t);
    this.master.gain.exponentialRampToValueAtTime(0.055, t + 2.5);
    this.master.connect(this.ctx.destination);
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 520; lp.Q.value = 0.6;
    lp.connect(this.master);
    this.oscs = [[138.59, "sine", 0.5], [138.59 * 1.5, "triangle", 0.22], [69.3, "sine", 0.3]]
      .map(([f, type, g]) => {
        const o = this.ctx.createOscillator(); const og = this.ctx.createGain();
        o.type = type; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 7;
        og.gain.value = g; o.connect(og); og.connect(lp); o.start(); return o;
      });
    this.lfo = this.ctx.createOscillator(); this.lfoG = this.ctx.createGain();
    this.lfo.frequency.value = 0.09; this.lfoG.gain.value = 120;
    this.lfo.connect(this.lfoG); this.lfoG.connect(lp.frequency); this.lfo.start();
    const bell = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const f = [554.37, 659.25, 739.99, 830.61][Math.floor(Math.random() * 4)];
      const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
      o.type = "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      o.connect(g); g.connect(this.master); o.start(now); o.stop(now + 3.4);
    };
    this.bellTimer = setInterval(bell, 7000 + Math.random() * 5000);
    setTimeout(bell, 1200);
  }
  stop() {
    if (!this.ctx) return;
    clearInterval(this.bellTimer);
    const t = this.ctx.currentTime;
    try { this.master.gain.exponentialRampToValueAtTime(0.0001, t + 1.2); } catch {}
    const ctx = this.ctx; this.ctx = null;
    setTimeout(() => { try { ctx.close(); } catch {} }, 1400);
  }
}

/* ════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — silk-at-night default, haldi-ivory day theme.
   ════════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Sora:wght@300;400;600&family=Tiro+Devanagari+Marathi:ital@0;1&display=swap');

.pswrap, .pswrap * { box-sizing: border-box; margin: 0; }
.pswrap {
  --bg: #0a0e24; --bg2: #131938; --ink: #f4ead6; --muted: #b6a688;
  --gold: #e3b341; --gold2: #f7d87c; --rose: #ff5d8f; --emerald: #23c08f;
  --maroon: #7c1f38; --card: rgba(21, 27, 56, 0.72); --line: rgba(227, 179, 65, 0.28);
  --glow: 0 0 22px rgba(227,179,65,.35), 0 0 60px rgba(255,93,143,.12);
  --silk: linear-gradient(160deg, #171c3f 0%, #0a0e24 55%, #191238 100%);
  height: 100vh; height: 100dvh; overflow-y: auto; overflow-x: hidden;
  background: var(--bg); color: var(--ink);
  font-family: 'Sora', system-ui, sans-serif; font-weight: 300;
  font-size: 16px; line-height: 1.6; scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
}
.pswrap[data-theme='day'] {
  --bg: #f8f0dd; --bg2: #f1e5c9; --ink: #3c1220; --muted: #8a6a4e;
  --gold: #a97c14; --gold2: #7c5a0a; --rose: #c2185b; --emerald: #0d7a5c;
  --maroon: #7c1f38; --card: rgba(255, 252, 243, 0.82); --line: rgba(124, 31, 56, 0.25);
  --glow: 0 10px 28px rgba(124,31,56,.12);
  --silk: linear-gradient(160deg, #fdf6e6 0%, #f6ead0 55%, #f9efdc 100%);
}
.pswrap::-webkit-scrollbar { width: 10px; }
.pswrap::-webkit-scrollbar-thumb { background: var(--line); border-radius: 8px; }

.grain::after {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: .07;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E");
}
.display { font-family: 'Fraunces', Georgia, serif; font-weight: 400; }
.dev { font-family: 'Tiro Devanagari Marathi', 'Noto Sans Devanagari', serif; }
.goldtxt {
  background: linear-gradient(100deg, var(--gold) 15%, var(--gold2) 40%, var(--gold) 65%, var(--gold2) 90%);
  background-size: 220% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: shimmer 7s ease-in-out infinite;
}
@keyframes shimmer { 0%,100% { background-position: 0% 0; } 50% { background-position: 100% 0; } }

.chapter { position: relative; min-height: 100vh; min-height: 100dvh; padding: clamp(84px, 12vh, 130px) clamp(20px, 6vw, 88px); display: flex; flex-direction: column; justify-content: center; z-index: 2; }
.chapter.tight { min-height: 0; }
.eyebrow { letter-spacing: .32em; text-transform: uppercase; font-size: 11px; color: var(--gold); font-weight: 600; }
.h2 { font-size: clamp(30px, 5.2vw, 56px); line-height: 1.08; margin: 14px 0 10px; letter-spacing: -0.01em; }
.lede { color: var(--muted); max-width: 620px; font-size: clamp(14px, 1.6vw, 17px); }
.ornament { display: flex; align-items: center; gap: 14px; margin: 26px 0 34px; color: var(--gold); }
.ornament::before, .ornament::after { content: ''; height: 1px; width: min(140px, 22vw); background: linear-gradient(90deg, transparent, var(--line)); }
.ornament::after { background: linear-gradient(90deg, var(--line), transparent); }

/* reveal-on-scroll */
.rv { opacity: 0; transform: translateY(28px); transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1); }
.rv.in { opacity: 1; transform: none; }

/* topbar + dot nav */
.topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 14px clamp(16px, 4vw, 40px); backdrop-filter: blur(10px); background: linear-gradient(180deg, rgba(8,10,28,.55), transparent); }
.pswrap[data-theme='day'] .topbar { background: linear-gradient(180deg, rgba(248,240,221,.7), transparent); }
.mono { font-family: 'Fraunces', serif; font-style: italic; font-size: 20px; letter-spacing: .06em; color: var(--gold); }
.iconbtn { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--line); background: var(--card); color: var(--ink); border-radius: 999px; padding: 8px 14px; font: inherit; font-size: 12.5px; cursor: pointer; transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
.iconbtn:hover { transform: translateY(-1px); border-color: var(--gold); box-shadow: var(--glow); }
.iconbtn:focus-visible, .btn:focus-visible, .chip:focus-visible, .vibe:focus-visible, .pinbtn:focus-visible { outline: 2px solid var(--rose); outline-offset: 3px; }
.progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, var(--gold), var(--rose)); z-index: 60; box-shadow: 0 0 12px rgba(255,93,143,.6); transition: width .15s linear; }
.dots { position: fixed; right: 18px; top: 50%; transform: translateY(-50%); z-index: 50; display: flex; flex-direction: column; gap: 14px; }
.dot { width: 9px; height: 9px; border-radius: 50%; border: 1px solid var(--gold); background: transparent; cursor: pointer; padding: 0; position: relative; transition: all .3s ease; }
.dot.on { background: var(--gold); box-shadow: 0 0 12px var(--gold); transform: scale(1.35); }
.dot span { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); white-space: nowrap; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); opacity: 0; transition: opacity .25s; pointer-events: none; }
.dot:hover span { opacity: 1; }

/* hero + antarpat */
.heroTrack { height: 280vh; position: relative; }
.heroPin { position: sticky; top: 0; height: 100vh; height: 100dvh; overflow: hidden; display: grid; place-items: center; background: var(--silk); }
.mandala { position: absolute; width: min(120vmin, 900px); opacity: .16; animation: spinSlow 140s linear infinite; }
@keyframes spinSlow { to { transform: rotate(360deg); } }
.heroInner { position: relative; z-index: 5; text-align: center; padding: 0 22px; }
.invok { font-size: clamp(11px, 1.4vw, 14px); letter-spacing: .12em; color: var(--gold); }
.names { font-size: clamp(46px, 11vw, 128px); line-height: 1.02; letter-spacing: -0.015em; margin: 18px 0 6px; }
.names .amp { font-style: italic; color: var(--rose); font-size: .55em; vertical-align: middle; padding: 0 .12em; text-shadow: 0 0 24px rgba(255,93,143,.55); }
.namesDev { font-size: clamp(18px, 3vw, 30px); color: var(--muted); }
.namesKan { font-size: clamp(13px, 1.8vw, 17px); color: var(--muted); opacity: .85; margin-top: 4px; }
.dateRow { display: flex; align-items: baseline; justify-content: center; gap: clamp(10px, 2.4vw, 22px); margin: 30px 0 8px; }
.dateNum { font-size: clamp(40px, 7.5vw, 84px); color: var(--gold); }
.dateDot { color: var(--rose); font-size: clamp(20px, 3vw, 34px); }
.muhurt { color: var(--muted); font-size: clamp(12px, 1.5vw, 15px); letter-spacing: .1em; }
.heroCtas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 26px; }
.scrollcue { position: absolute; bottom: 26px; left: 50%; transform: translateX(-50%); z-index: 6; display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--muted); font-size: 11.5px; letter-spacing: .18em; text-transform: uppercase; animation: bob 2.6s ease-in-out infinite; }
@keyframes bob { 0%,100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, 8px); } }

.curtain { position: absolute; inset: 0; z-index: 20; pointer-events: none; }
.cloth { position: absolute; top: 0; bottom: 0; width: 51%; will-change: transform;
  background:
    radial-gradient(120% 60% at 50% -10%, rgba(255,255,255,.08), transparent 60%),
    repeating-linear-gradient(93deg, rgba(255,255,255,.05) 0 2px, transparent 2px 9px),
    linear-gradient(180deg, #8e2440 0%, #6d1830 52%, #521026 100%);
  box-shadow: inset 0 0 90px rgba(0,0,0,.5);
}
.cloth.L { left: -0.6%; border-right: 14px solid transparent; border-image: repeating-linear-gradient(45deg, var(--gold) 0 9px, #521026 9px 18px) 14; }
.cloth.R { right: -0.6%; border-left: 14px solid transparent; border-image: repeating-linear-gradient(-45deg, var(--gold) 0 9px, #521026 9px 18px) 14; }
.tassels { position: absolute; bottom: -16px; left: 0; right: 0; display: flex; justify-content: space-around; }
.tassels i { width: 3px; height: 26px; background: var(--gold); border-radius: 2px; display: block; transform-origin: top; animation: sway 3.4s ease-in-out infinite; box-shadow: 0 0 8px rgba(227,179,65,.5); }
.tassels i:nth-child(2n) { animation-delay: .7s; height: 32px; }
@keyframes sway { 0%,100% { transform: rotate(-6deg);} 50% { transform: rotate(6deg);} }
.clothText { position: absolute; inset: 0; z-index: 21; display: grid; place-items: center; text-align: center; color: #f6e3c0; pointer-events: none; padding: 0 20px; }
.clothText .big { font-size: clamp(24px, 5vw, 52px); text-shadow: 0 2px 24px rgba(0,0,0,.6); }
.clothText .small { letter-spacing: .3em; text-transform: uppercase; font-size: 11px; opacity: .85; margin-top: 12px; }

/* buttons + chips + cards */
.btn { display: inline-flex; align-items: center; gap: 9px; padding: 12px 20px; border-radius: 999px; border: 1px solid var(--gold); background: linear-gradient(120deg, rgba(227,179,65,.16), rgba(255,93,143,.10)); color: var(--ink); font: inherit; font-size: 14px; font-weight: 400; cursor: pointer; transition: transform .25s ease, box-shadow .25s ease; text-decoration: none; }
.btn:hover { transform: translateY(-2px) scale(1.015); box-shadow: var(--glow); }
.btn.solid { background: linear-gradient(120deg, var(--gold), #c98f1f); color: #241004; font-weight: 600; border-color: transparent; }
.btn.ghost { background: transparent; border-color: var(--line); }
.chip { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); font-size: 12.5px; color: var(--ink); cursor: default; }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 22px; backdrop-filter: blur(10px); box-shadow: 0 18px 50px rgba(0,0,0,.22); }
.pswrap[data-theme='day'] .card { box-shadow: 0 14px 40px rgba(124,31,56,.08); }

/* diya */
.diya { position: absolute; width: 46px; z-index: 6; filter: drop-shadow(0 0 14px rgba(255,170,60,.55)); }
.flame { transform-origin: 50% 90%; animation: flick 1.7s ease-in-out infinite; }
.flame.f2 { animation-duration: 2.3s; animation-delay: .4s; }
@keyframes flick { 0%,100% { transform: scaleY(1) rotate(-2deg); opacity: .95; } 30% { transform: scaleY(1.18) rotate(2deg); opacity: 1; } 60% { transform: scaleY(.9) rotate(-1.5deg); opacity: .88; } }

@media (max-width: 760px) {
  .dots { display: none; }
  .chapter { padding-left: 20px; padding-right: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .pswrap * { animation: none !important; transition-duration: .01ms !important; }
  .pswrap { scroll-behavior: auto; }
}
`;

const CSS2 = `
/* story timeline */
.mode { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; padding: 4px; gap: 4px; background: var(--card); }
.mode button { border: 0; background: transparent; color: var(--muted); font: inherit; font-size: 13px; padding: 8px 16px; border-radius: 999px; cursor: pointer; transition: all .3s ease; }
.mode button.on { background: linear-gradient(120deg, var(--gold), #c98f1f); color: #241004; font-weight: 600; box-shadow: 0 4px 16px rgba(227,179,65,.35); }
.tl { position: relative; margin-top: 44px; }
.tl::before { content: ''; position: absolute; left: 18px; top: 6px; bottom: 6px; width: 2px; background: linear-gradient(180deg, var(--gold), var(--rose), var(--emerald)); opacity: .5; }
.tlItem { position: relative; padding: 0 0 34px 58px; }
.tlItem::before { content: ''; position: absolute; left: 11px; top: 4px; width: 16px; height: 16px; border-radius: 50%; background: var(--bg); border: 2px solid var(--gold); box-shadow: 0 0 14px rgba(227,179,65,.6); }
.tlYear { font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: var(--rose); font-weight: 600; }
.tlTitle { font-size: clamp(20px, 2.6vw, 27px); margin: 4px 0 6px; }
.tlBody { color: var(--muted); max-width: 640px; min-height: 3.2em; transition: opacity .35s ease; }
.tlBody.swap { opacity: 0; }
@media (min-width: 900px) {
  .tl::before { left: 50%; }
  .tlItem { width: 50%; padding: 0 48px 46px 0; text-align: right; }
  .tlItem:nth-child(even) { margin-left: 50%; padding: 0 0 46px 48px; text-align: left; }
  .tlItem::before { left: auto; right: -9px; }
  .tlItem:nth-child(even)::before { right: auto; left: -9px; }
  .tlItem .tlBody { margin-left: auto; }
  .tlItem:nth-child(even) .tlBody { margin-left: 0; }
}

/* itinerary */
.grid { display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); margin-top: 40px; }
.event { padding: 24px; display: flex; flex-direction: column; gap: 10px; position: relative; overflow: hidden; transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s ease; }
.event:hover { transform: translateY(-6px); box-shadow: 0 26px 60px rgba(0,0,0,.35), 0 0 0 1px var(--gold) inset; }
.event .emoji { font-size: 32px; filter: drop-shadow(0 0 12px rgba(255,170,60,.4)); }
.event h3 { font-size: 21px; }
.event .tag { color: var(--rose); font-size: 13px; font-style: italic; font-family: 'Fraunces', serif; }
.meta { display: flex; flex-wrap: wrap; gap: 8px 16px; color: var(--muted); font-size: 13px; align-items: center; }
.meta svg { color: var(--gold); }
.evBtns { display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap; }
.evBtns .btn { padding: 8px 14px; font-size: 12.5px; }
.dressline { font-size: 12.5px; color: var(--muted); border-top: 1px dashed var(--line); padding-top: 10px; }

/* countdown */
.count { display: flex; gap: clamp(10px, 2.4vw, 22px); flex-wrap: wrap; margin: 30px 0 12px; }
.tile { min-width: clamp(74px, 10vw, 112px); padding: 16px 10px 12px; text-align: center; border-radius: 18px; border: 1px solid var(--line); background: var(--card); position: relative; overflow: hidden; }
.tile::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,.06), transparent 45%); pointer-events: none; }
.tile b { display: block; font-family: 'Fraunces', serif; font-weight: 500; font-size: clamp(30px, 5vw, 52px); color: var(--gold); line-height: 1; animation: pop .5s ease; }
@keyframes pop { from { transform: translateY(6px); opacity: .3; } to { transform: none; opacity: 1; } }
.tile span { font-size: 10.5px; letter-spacing: .24em; text-transform: uppercase; color: var(--muted); }
.humor { color: var(--muted); font-size: 14px; font-style: italic; font-family: 'Fraunces', serif; }
.humor b { color: var(--gold); font-weight: 500; }

/* map + guide */
.venueGrid { display: grid; gap: 26px; grid-template-columns: 1.25fr 1fr; align-items: start; margin-top: 36px; }
@media (max-width: 980px) { .venueGrid { grid-template-columns: 1fr; } }
.mapCard { padding: 14px; }
.mapSvg { width: 100%; height: auto; display: block; border-radius: 14px; }
.pinbtn { cursor: pointer; }
.pinPulse { animation: pinPulse 2.2s ease-out infinite; transform-origin: center; transform-box: fill-box; }
@keyframes pinPulse { 0% { transform: scale(.6); opacity: .8; } 100% { transform: scale(2.1); opacity: 0; } }
.dash { stroke-dasharray: 7 8; animation: dashmove 26s linear infinite; }
@keyframes dashmove { to { stroke-dashoffset: -600; } }
.drop { animation: rainDrop 1.6s linear infinite; }
.drop.d2 { animation-delay: .5s; } .drop.d3 { animation-delay: 1s; }
@keyframes rainDrop { 0% { transform: translateY(0); opacity: 0; } 25% { opacity: .8; } 100% { transform: translateY(26px); opacity: 0; } }
.pinInfo { padding: 20px 22px; margin-top: 14px; display: flex; flex-direction: column; gap: 6px; }
.tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
.tabs button { border: 1px solid var(--line); background: var(--card); color: var(--muted); border-radius: 999px; padding: 9px 16px; font: inherit; font-size: 13px; cursor: pointer; display: inline-flex; gap: 8px; align-items: center; transition: all .3s ease; }
.tabs button.on { color: var(--ink); border-color: var(--gold); box-shadow: var(--glow); background: linear-gradient(120deg, rgba(227,179,65,.18), rgba(255,93,143,.1)); }
.guideRow { display: grid; grid-template-columns: 150px 1fr; gap: 6px 18px; padding: 13px 4px; border-bottom: 1px dashed var(--line); font-size: 14px; }
.guideRow b { color: var(--gold); font-weight: 600; font-size: 13.5px; }
.guideRow span { color: var(--muted); }
@media (max-width: 560px) { .guideRow { grid-template-columns: 1fr; } }

/* rsvp */
.vibes { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin: 30px 0; }
.vibe { text-align: left; padding: 18px; border-radius: 18px; border: 1px solid var(--line); background: var(--card); color: var(--ink); font: inherit; cursor: pointer; transition: all .3s cubic-bezier(.2,.7,.2,1); position: relative; }
.vibe:hover { transform: translateY(-4px); border-color: var(--gold); }
.vibe.on { border-color: var(--rose); box-shadow: 0 0 0 1px var(--rose), 0 0 30px rgba(255,93,143,.28); transform: translateY(-4px) scale(1.01); }
.vibe .ve { font-size: 26px; }
.vibe h4 { margin: 8px 0 4px; font-size: 16px; }
.vibe p { color: var(--muted); font-size: 12.5px; line-height: 1.5; }
.vibe .tick { position: absolute; top: 12px; right: 12px; width: 22px; height: 22px; border-radius: 50%; background: var(--rose); display: grid; place-items: center; color: white; opacity: 0; transform: scale(.4); transition: all .3s ease; }
.vibe.on .tick { opacity: 1; transform: scale(1); }
.field { display: flex; flex-direction: column; gap: 8px; }
.field label { font-size: 11.5px; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); }
.input { background: var(--card); border: 1px solid var(--line); color: var(--ink); border-radius: 14px; padding: 13px 16px; font: inherit; font-size: 14.5px; width: 100%; transition: border-color .25s, box-shadow .25s; }
.input:focus { outline: none; border-color: var(--gold); box-shadow: var(--glow); }
.formRow { display: grid; gap: 18px; grid-template-columns: 1.4fr 1fr; align-items: end; margin-bottom: 18px; }
@media (max-width: 700px) { .formRow { grid-template-columns: 1fr; } }
.step { display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--line); border-radius: 14px; background: var(--card); }
.step button { border: 0; background: transparent; color: var(--gold); width: 44px; height: 46px; cursor: pointer; display: grid; place-items: center; }
.step b { min-width: 40px; text-align: center; font-family: 'Fraunces', serif; font-size: 20px; font-weight: 500; }
.seg { display: flex; flex-wrap: wrap; gap: 8px; }
.seg button { border: 1px solid var(--line); background: var(--card); color: var(--muted); border-radius: 999px; padding: 9px 15px; font: inherit; font-size: 12.5px; cursor: pointer; transition: all .25s ease; }
.seg button.on { color: var(--ink); border-color: var(--emerald); box-shadow: 0 0 16px rgba(35,192,143,.3); }
.confirm { text-align: center; padding: 46px 26px; animation: confIn .8s cubic-bezier(.2,.9,.25,1.2); }
@keyframes confIn { from { transform: scale(.86); opacity: 0; } to { transform: none; opacity: 1; } }
.confRing { width: 84px; height: 84px; margin: 0 auto 18px; border-radius: 50%; border: 2px solid var(--emerald); display: grid; place-items: center; color: var(--emerald); box-shadow: 0 0 40px rgba(35,192,143,.4); animation: ringPop .7s cubic-bezier(.2,.9,.2,1.4); }
@keyframes ringPop { 0% { transform: scale(0) rotate(-40deg); } 70% { transform: scale(1.15); } 100% { transform: scale(1); } }
.meter { font-size: 13px; color: var(--muted); margin-top: 16px; }
.meter b { color: var(--gold); }

/* blessings wall */
.wall { column-count: 3; column-gap: 18px; margin-top: 30px; }
@media (max-width: 980px) { .wall { column-count: 2; } }
@media (max-width: 620px) { .wall { column-count: 1; } }
.bless { break-inside: avoid; margin: 0 0 18px; padding: 20px 20px 16px; position: relative; animation: blessIn .6s cubic-bezier(.2,.8,.2,1.1); }
@keyframes blessIn { from { transform: translateY(18px) scale(.96); opacity: 0; } to { transform: none; opacity: 1; } }
.bless::before { content: '❁'; position: absolute; top: -10px; left: 50%; transform: translateX(-50%); color: var(--gold); font-size: 15px; text-shadow: 0 0 10px rgba(227,179,65,.7); }
.bless:nth-child(3n) { transform: rotate(.7deg); } .bless:nth-child(3n+1) { transform: rotate(-.6deg); }
.bless p { font-family: 'Fraunces', serif; font-size: 15.5px; line-height: 1.55; }
.bless span { display: block; margin-top: 10px; font-size: 11.5px; letter-spacing: .18em; text-transform: uppercase; color: var(--rose); }
.emos { display: flex; gap: 8px; flex-wrap: wrap; }
.emos button { border: 1px solid var(--line); background: var(--card); border-radius: 12px; font-size: 18px; padding: 7px 11px; cursor: pointer; transition: transform .2s ease; }
.emos button:hover { transform: translateY(-3px) scale(1.12); }
.privacyNote { font-size: 11.5px; color: var(--muted); opacity: .85; }

.footer { text-align: center; padding: 70px 20px 90px; color: var(--muted); font-size: 13.5px; position: relative; z-index: 2; }
.footer .display { color: var(--gold); font-size: 22px; font-style: italic; }

/* ── modern effects layer ─────────────────────────────────────── */
@property --ang { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.sheen { position: relative; }
.sheen::before {
  content: ''; position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
  background: conic-gradient(from var(--ang), transparent 0 38%, rgba(247,216,124,.85) 50%, transparent 62% 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  animation: spinAng 7s linear infinite; pointer-events: none;
}
@keyframes spinAng { to { --ang: 360deg; } }

.shimmer {
  background: linear-gradient(108deg, var(--gold) 22%, #fff3c8 42%, var(--gold) 62%);
  background-size: 220% 100%; -webkit-background-clip: text; background-clip: text;
  color: transparent; animation: shim 5.5s ease-in-out infinite;
}
@keyframes shim { 0% { background-position: 130% 0; } 100% { background-position: -130% 0; } }

.lt { display: inline-block; opacity: 0; transform: translateY(.55em) rotate(6deg); }
.ltsIn .lt { animation: ltIn .7s cubic-bezier(.2, .9, .25, 1.25) forwards; animation-delay: calc(var(--i) * 60ms); }
@keyframes ltIn { to { opacity: 1; transform: none; } }

.marq { overflow: hidden; border-block: 1px solid var(--line); padding: 13px 0; margin: 8px 0; }
.marq .inner { display: flex; gap: 44px; width: max-content; animation: marq 28s linear infinite; }
.marq span { white-space: nowrap; font-family: 'Fraunces', serif; font-style: italic;
  color: var(--muted); letter-spacing: .14em; text-transform: uppercase; font-size: 12.5px; }
@keyframes marq { to { transform: translateX(-50%); } }

.rangoli { display: block; margin: 6px auto; width: min(560px, 82%); overflow: visible; }
.rangoli path { fill: none; stroke: var(--gold); stroke-width: 1.5; stroke-linecap: round;
  stroke-dasharray: 1; stroke-dashoffset: 1; opacity: .85; }
.rangoli.draw path { transition: stroke-dashoffset 1.5s cubic-bezier(.4, 0, .2, 1); stroke-dashoffset: 0; }
.rangoli .dot { fill: var(--rose); opacity: 0; transition: opacity .6s ease 1s; }
.rangoli.draw .dot { opacity: .9; }

.lotus { display: block; margin: 2px auto; }
.lotus .pet { fill: var(--rose); opacity: .92; transform-origin: 66px 84px; transform: scale(.06);
  animation: petBloom .85s cubic-bezier(.2, .8, .3, 1.18) forwards; }
.lotus .lcore { fill: var(--gold2); opacity: 0; animation: fadeCore .5s ease 1s forwards; }
.lotus .lbase { fill: var(--emerald); opacity: .8; }
@keyframes petBloom { to { transform: scale(1); } }
@keyframes fadeCore { to { opacity: 1; } }

.tilt { position: relative; transform-style: preserve-3d; will-change: transform;
  transform: perspective(950px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform .18s ease; }
.tilt .glare { position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: radial-gradient(320px circle at var(--gx, 50%) var(--gy, 50%), rgba(255, 240, 200, .16), transparent 55%);
  opacity: var(--go, 0); transition: opacity .3s ease; }

.cglow { position: fixed; left: 0; top: 0; width: 340px; height: 340px; border-radius: 50%;
  pointer-events: none; z-index: 2; mix-blend-mode: screen; filter: blur(6px);
  background: radial-gradient(circle, rgba(247, 216, 124, .13), rgba(255, 93, 143, .05) 45%, transparent 70%); }
[data-theme='day'] .cglow { mix-blend-mode: multiply; opacity: .5; }

.vineWrap { position: absolute; left: 50%; top: 0; height: 100%; width: 70px;
  transform: translateX(-50%); pointer-events: none; }
.vineWrap svg { width: 100%; height: 100%; overflow: visible; }
.vineWrap path { stroke: var(--gold); stroke-width: 2; fill: none; opacity: .8;
  filter: drop-shadow(0 0 6px rgba(227, 179, 65, .4)); }
@media (max-width: 900px) { .vineWrap { display: none; } }

.embroid { position: absolute; left: 4%; right: 4%; bottom: 16px; height: 26px; opacity: .9; }
.embroid path { stroke: var(--gold2); fill: none; stroke-width: 1.3; stroke-linecap: round;
  stroke-dasharray: 1; stroke-dashoffset: 1; animation: emb 2.4s .5s ease forwards; }
@keyframes emb { to { stroke-dashoffset: 0; } }
`;

/* ════════════════════════════════════════════════════════════════════
   DECOR + ENGINE COMPONENTS
   ════════════════════════════════════════════════════════════════════ */
const Mandala = ({ style }) => (
  <svg className="mandala" style={style} viewBox="0 0 400 400" aria-hidden="true">
    <g fill="none" stroke="var(--gold)" strokeWidth="0.8">
      <circle cx="200" cy="200" r="196" opacity=".5" />
      <circle cx="200" cy="200" r="150" opacity=".6" />
      <circle cx="200" cy="200" r="96" opacity=".7" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * Math.PI) / 12;
        const x1 = 200 + Math.cos(a) * 96, y1 = 200 + Math.sin(a) * 96;
        const x2 = 200 + Math.cos(a) * 196, y2 = 200 + Math.sin(a) * 196;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} opacity=".35" />;
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI) / 6;
        const cx = 200 + Math.cos(a) * 150, cy = 200 + Math.sin(a) * 150;
        return <ellipse key={i} cx={cx} cy={cy} rx="26" ry="11"
          transform={`rotate(${(i * 30) + 90} ${cx} ${cy})`} opacity=".55" />;
      })}
      <path d="M200 118 C 218 146, 218 162, 200 178 C 182 162, 182 146, 200 118 Z" opacity=".8" />
      <path d="M200 282 C 218 254, 218 238, 200 222 C 182 238, 182 254, 200 282 Z" opacity=".8" />
      <path d="M118 200 C 146 182, 162 182, 178 200 C 162 218, 146 218, 118 200 Z" opacity=".8" />
      <path d="M282 200 C 254 182, 238 182, 222 200 C 238 218, 254 218, 282 200 Z" opacity=".8" />
    </g>
  </svg>
);

const Diya = ({ style, slow }) => (
  <svg className="diya" style={style} viewBox="0 0 60 60" aria-hidden="true">
    <ellipse cx="30" cy="46" rx="20" ry="8" fill="var(--maroon)" stroke="var(--gold)" strokeWidth="1.4" />
    <ellipse cx="30" cy="43" rx="14" ry="4.5" fill="#3a0d18" />
    <g className={slow ? "flame f2" : "flame"}>
      <path d="M30 18 C 36 27, 35 34, 30 38 C 25 34, 24 27, 30 18 Z" fill="#ffb347" />
      <path d="M30 24 C 33 29, 33 33, 30 36 C 27 33, 27 29, 30 24 Z" fill="#ffe9a8" />
    </g>
  </svg>
);

/* Petal + akshata particle engine — marigold petals drift ambiently,
   grains + petals burst on demand via fx.burst(x, y). */
function PetalCanvas({ reduced }) {
  const ref = useRef(null);
  useEffect(() => {
    if (reduced) return;
    const cv = ref.current; const ctx = cv.getContext("2d");
    let W = 0, H = 0, raf = 0, parts = [], mouse = { x: -999, y: -999 };
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => { W = window.innerWidth; H = window.innerHeight; cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + "px"; cv.style.height = H + "px"; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
    resize(); window.addEventListener("resize", resize);
    const PALETTE = ["#f2a33c", "#e8842c", "#f6c25a", "#e26a4a", "#ffd98e"];
    const petal = (burst, x, y) => ({
      x: burst ? x : Math.random() * W, y: burst ? y : -20 - Math.random() * H * 0.3,
      vx: burst ? (Math.random() - 0.5) * 7 : (Math.random() - 0.5) * 0.5,
      vy: burst ? -(2 + Math.random() * 6) : 0.4 + Math.random() * 0.8,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.06,
      s: 5 + Math.random() * 7, c: PALETTE[(Math.random() * PALETTE.length) | 0],
      sway: Math.random() * Math.PI * 2, life: 1, type: "petal", burst,
    });
    const grain = (x, y) => ({
      x, y, vx: (Math.random() - 0.5) * 9, vy: -(3 + Math.random() * 7),
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      s: 2 + Math.random() * 1.6, c: Math.random() > 0.4 ? "#fff3d6" : "#f4c445",
      life: 1, type: "grain", burst: true,
    });
    const AMBIENT = W < 640 ? 20 : 34;
    for (let i = 0; i < AMBIENT; i++) { const p = petal(false); p.y = Math.random() * H; parts.push(p); }
    fx.burst = (x = W / 2, y = H / 2) => {
      for (let i = 0; i < 26; i++) parts.push(petal(true, x, y));
      for (let i = 0; i < 70; i++) parts.push(grain(x, y));
    };
    const onMove = (e) => { const t = e.touches ? e.touches[0] : e; mouse.x = t.clientX; mouse.y = t.clientY; };
    window.addEventListener("pointermove", onMove, { passive: true });
    let hidden = false;
    const onVis = () => { hidden = document.hidden; };
    document.addEventListener("visibilitychange", onVis);
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (hidden) return;
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (p.type === "grain") { p.vy += 0.22; p.life -= 0.012; }
        else if (p.burst) { p.vy += 0.12; p.vx *= 0.985; p.life -= 0.006; }
        else { p.sway += 0.015; p.vx += Math.sin(p.sway) * 0.008; p.vx *= 0.99; }
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 8100) { const d = Math.sqrt(d2) || 1; p.vx += (dx / d) * 0.35; p.vy += (dy / d) * 0.2; }
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (!p.burst && (p.y > H + 24 || p.x < -30 || p.x > W + 30)) { parts[i] = petal(false); continue; }
        if (p.burst && (p.life <= 0 || p.y > H + 30)) { parts.splice(i, 1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.min(1, p.life) * (p.type === "grain" ? 0.95 : 0.8);
        ctx.fillStyle = p.c;
        if (p.type === "grain") { ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
        else {
          ctx.beginPath();
          ctx.moveTo(0, -p.s);
          ctx.quadraticCurveTo(p.s * 0.9, -p.s * 0.2, 0, p.s);
          ctx.quadraticCurveTo(-p.s * 0.9, -p.s * 0.2, 0, -p.s);
          ctx.fill();
        }
        ctx.restore();
      }
    };
    tick();
    return () => {
      cancelAnimationFrame(raf); fx.burst = null;
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduced]);
  if (reduced) return null;
  return <canvas ref={ref} aria-hidden="true"
    style={{ position: "fixed", inset: 0, zIndex: 3, pointerEvents: "none" }} />;
}

/* Reveal wrapper — fades chapters/blocks in on first viewport entry. */

/* ── 3D layer · Three.js r128 (MIT) — everything below is procedural
      geometry + shaders authored in code: zero external models or
      textures, zero asset licences. ── */

function makeGlowTex(inner = "255,214,140", mid = "255,170,80") {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d");
  const rg = g.createRadialGradient(32, 32, 2, 32, 32, 31);
  rg.addColorStop(0, `rgba(${inner},0.95)`);
  rg.addColorStop(0.4, `rgba(${mid},0.45)`);
  rg.addColorStop(1, `rgba(${mid},0)`);
  g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* Animated jewel-tone "silk nebula" backdrop — a single quad running a
   tiny 2-octave value-noise fragment shader. */
const NEBULA_VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const NEBULA_FRAG = `
precision mediump float; varying vec2 vUv;
uniform float uT; uniform float uAmp; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h(i),h(i+vec2(1.0,0.0)),f.x), mix(h(i+vec2(0.0,1.0)),h(i+vec2(1.0,1.0)),f.x), f.y); }
void main(){
  float t=uT*0.045;
  float m = n(vUv*3.0+vec2(t,-t))*0.62 + n(vUv*7.0-vec2(t*1.4))*0.38;
  vec3 col = mix(uA, uB, smoothstep(0.18, 0.82, m));
  col = mix(col, uC, pow(n(vUv*2.0+vec2(t*1.7)), 3.0)*0.55);
  float vig = smoothstep(1.0, 0.22, distance(vUv, vec2(0.5)));
  gl_FragColor = vec4(col, m*vig*uAmp);
}`;

/* Brass kalash — lathe profile, coconut, mango-leaf fan, neck band. */
function buildKalash(gold, goldBright) {
  const grp = new THREE.Group();
  const prof = [
    [0.02, 0], [0.5, 0.03], [0.68, 0.2], [0.74, 0.46], [0.66, 0.7],
    [0.44, 0.86], [0.3, 0.94], [0.27, 1.05], [0.4, 1.12], [0.44, 1.18], [0.31, 1.22],
  ].map((p) => new THREE.Vector2(p[0], p[1]));
  grp.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 48), gold));
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.024, 12, 40), goldBright);
  band.rotation.x = Math.PI / 2; band.position.y = 0.99; grp.add(band);
  const coco = new THREE.Mesh(
    new THREE.SphereGeometry(0.235, 24, 18),
    new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 0.95 }));
  coco.scale.set(1, 1.14, 1); coco.position.y = 1.36; grp.add(coco);
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.1, 0.18, 0, 0.46);
  leafShape.quadraticCurveTo(-0.1, 0.18, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(leafShape);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f8f66, roughness: 0.55, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) {
    const pivot = new THREE.Group(); pivot.rotation.y = (i / 6) * Math.PI * 2;
    const lf = new THREE.Mesh(leafGeo, leafMat);
    lf.position.set(0.27, 1.13, 0); lf.rotation.set(0, Math.PI / 2, -1.05);
    pivot.add(lf); grp.add(pivot);
  }
  return grp;
}

/* Marigold toran — two catenary garland strands of instanced pompoms
   with leaf pairs, strung across the top of the hero. */
function buildToran(scene, small) {
  const per = small ? 11 : 15;
  const strands = [];
  const flowerGeo = new THREE.SphereGeometry(0.115, 10, 8);
  const mOrange = new THREE.MeshStandardMaterial({ color: 0xf07f1f, roughness: 0.75 });
  const mYellow = new THREE.MeshStandardMaterial({ color: 0xf5c331, roughness: 0.75 });
  const leafGeo = new THREE.ConeGeometry(0.05, 0.16, 6);
  const mLeaf = new THREE.MeshStandardMaterial({ color: 0x1f8f66, roughness: 0.6 });
  const dummy = new THREE.Object3D();
  [[3.05, 0.62, -1.6], [2.78, 0.5, -2.3]].forEach(([yEnd, sag, z], s) => {
    const grp = new THREE.Group();
    const pts = [];
    for (let i = 0; i < per; i++) {
      const u = i / (per - 1), x = (u - 0.5) * 8.6;
      pts.push(new THREE.Vector3(x, yEnd - sag * Math.sin(Math.PI * u), z));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    grp.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.012, 6),
      new THREE.MeshStandardMaterial({ color: 0x8a6b1e, roughness: 0.7 })));
    const instA = new THREE.InstancedMesh(flowerGeo, mOrange, Math.ceil(per / 2));
    const instB = new THREE.InstancedMesh(flowerGeo, mYellow, Math.floor(per / 2));
    const leaves = new THREE.InstancedMesh(leafGeo, mLeaf, per - 1);
    let a = 0, b = 0;
    pts.forEach((p, i) => {
      dummy.position.copy(p); dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.9 + ((i * 37) % 10) / 40);
      dummy.updateMatrix();
      if (i % 2 === 0) instA.setMatrixAt(a++, dummy.matrix); else instB.setMatrixAt(b++, dummy.matrix);
      if (i < per - 1) {
        dummy.position.lerpVectors(p, pts[i + 1], 0.5); dummy.position.y -= 0.05;
        dummy.rotation.set(Math.PI, 0, (i % 2 ? 0.5 : -0.5)); dummy.updateMatrix();
        leaves.setMatrixAt(i, dummy.matrix);
      }
    });
    [instA, instB, leaves].forEach((m) => { m.frustumCulled = false; grp.add(m); });
    grp.userData.ph = s * 1.7;
    scene.add(grp); strands.push(grp);
  });
  return strands;
}

/* Akash-kandil sky lanterns — emissive paper cylinders that rise & wrap. */
function buildLanterns(scene, glowTex, small) {
  const n = small ? 4 : 6;
  const bodyGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.34, 10);
  const capGeo = new THREE.ConeGeometry(0.16, 0.1, 10);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x8a2d12, emissive: 0xff7b2d, emissiveIntensity: 1.35, roughness: 0.6,
  });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x5a1c0c, roughness: 0.8 });
  return Array.from({ length: n }, (_, i) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(bodyGeo, mat));
    const cap = new THREE.Mesh(capGeo, capMat); cap.position.y = 0.22; g.add(cap);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.75 }));
    sp.scale.setScalar(1.1); g.add(sp);
    const side = i % 2 ? 1 : -1;
    g.position.set(side * (2.7 + Math.random() * 1.4), -3 + Math.random() * 6, -2.2 - Math.random() * 2);
    g.userData = { sp: 0.1 + Math.random() * 0.1, ph: Math.random() * 6.28, x0: g.position.x };
    scene.add(g); return g;
  });
}

/* Hero scene: nebula shader sky, kalash + chakra halo, floating diyas with
   flickering lights, toran garlands, rising lanterns, instanced petals,
   embers & haldi dust — theme-aware, scroll- and pointer-linked. */
function Scene3D({ heroP, theme, reduced }) {
  const hostRef = useRef(null);
  const pRef = useRef(heroP); pRef.current = heroP;
  const [ok, setOk] = useState(true);
  const apiRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current; if (!host) return;
    let R;
    try {
      R = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) { setOk(false); return; }
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    R.outputEncoding = THREE.sRGBEncoding;
    R.toneMapping = THREE.ACESFilmicToneMapping;
    R.toneMappingExposure = 1.12;
    R.setClearColor(0x000000, 0);
    host.appendChild(R.domElement);
    R.domElement.style.width = "100%"; R.domElement.style.height = "100%"; R.domElement.style.display = "block";

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e24, 0.05);
    const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    cam.position.set(0, 0.2, 7.2);

    const amb = new THREE.AmbientLight(0xffe9c4, 0.55);
    const key = new THREE.DirectionalLight(0xffd98a, 1.15); key.position.set(3.5, 5, 4);
    const rim = new THREE.DirectionalLight(0x8fb7ff, 0.5); rim.position.set(-4, 2, -3);
    scene.add(amb, key, rim);

    // nebula backdrop
    const nebula = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 15),
      new THREE.ShaderMaterial({
        vertexShader: NEBULA_VERT, fragmentShader: NEBULA_FRAG,
        transparent: true, depthWrite: false,
        uniforms: {
          uT: { value: 0 }, uAmp: { value: 0.55 },
          uA: { value: new THREE.Color(0x131938) },
          uB: { value: new THREE.Color(0x7c1f38) },
          uC: { value: new THREE.Color(0x1f8f66) },
        },
      }));
    nebula.position.set(0, 0.4, -7); scene.add(nebula);

    const gold = new THREE.MeshStandardMaterial({ color: 0xdfa93c, metalness: 0.88, roughness: 0.32, emissive: 0x2a1a05, emissiveIntensity: 0.6 });
    const goldBright = new THREE.MeshStandardMaterial({ color: 0xf3ca63, metalness: 0.9, roughness: 0.24, emissive: 0x33220a, emissiveIntensity: 0.7 });

    const kalash = buildKalash(gold, goldBright);
    kalash.position.set(0, -2.55, 0); kalash.scale.setScalar(1.35);
    scene.add(kalash);

    const glowTex = makeGlowTex();
    // chakra halo behind the kalash + soft aura
    const haloMat = () => new THREE.MeshBasicMaterial({ color: 0xf3ca63, transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending, depthWrite: false });
    const halos = [1.15, 1.5, 1.9].map((r, i) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 90), haloMat());
      m.position.set(0, -0.85, -0.8); m.rotation.x = 0.35 + i * 0.12;
      scene.add(m); return m;
    });
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5 }));
    aura.scale.setScalar(4.6); aura.position.set(0, -1.1, -1); scene.add(aura);

    // floating diyas
    const bowlGeo = new THREE.LatheGeometry(
      [[0.02, 0], [0.2, 0.02], [0.27, 0.09], [0.24, 0.13], [0.185, 0.14]].map((p) => new THREE.Vector2(p[0], p[1])), 28);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0xb0562e, roughness: 0.9, emissive: 0x30100a, emissiveIntensity: 0.5 });
    const flameGeo = new THREE.SphereGeometry(0.07, 10, 10);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd88a });
    const diyaPos = [[-2.9, 0.35, -0.6], [2.9, 0.05, -0.4], [-2.15, -1.55, 0.6], [2.3, -1.35, 0.5], [-3.35, -0.7, -1.3], [3.4, 0.9, -1.5]];
    const diyas = diyaPos.map((pos, i) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(bowlGeo, bowlMat));
      const fl = new THREE.Mesh(flameGeo, flameMat);
      fl.scale.set(1, 1.7, 1); fl.position.y = 0.2; g.add(fl);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 }));
      sp.scale.setScalar(0.85); sp.position.y = 0.22; g.add(sp);
      let light = null;
      if (i < 4) { light = new THREE.PointLight(0xff9b4d, 0.85, 7, 2); light.position.y = 0.25; g.add(light); }
      g.position.set(pos[0], pos[1], pos[2]);
      scene.add(g);
      return { g, fl, sp, light, baseY: pos[1], ph: Math.random() * Math.PI * 2 };
    });

    const small = window.innerWidth < 640;
    const toran = buildToran(scene, small);
    const lanterns = buildLanterns(scene, glowTex, small);

    // instanced 3D petals
    const N = small ? 55 : 105;
    const petalGeo = new THREE.CircleGeometry(0.11, 10); petalGeo.scale(1, 0.42, 1);
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xf59a2b, roughness: 0.8, side: THREE.DoubleSide });
    const inst = new THREE.InstancedMesh(petalGeo, petalMat, N);
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    inst.frustumCulled = false;
    scene.add(inst);
    const petals = Array.from({ length: N }, () => ({
      x: (Math.random() - 0.5) * 8.4, y: Math.random() * 7 - 3.2, z: -2.4 + Math.random() * 3.6,
      sp: 0.22 + Math.random() * 0.35, ph: Math.random() * Math.PI * 2,
      rx: (Math.random() - 0.5) * 1.6, ry: (Math.random() - 0.5) * 1.6, rz: (Math.random() - 0.5) * 1.6,
    }));
    const dummy = new THREE.Object3D();

    // rising embers
    const en = small ? 40 : 70;
    const eGeo = new THREE.BufferGeometry();
    const ePos = new Float32Array(en * 3); const eVel = new Float32Array(en);
    for (let i = 0; i < en; i++) {
      ePos[i * 3] = (Math.random() - 0.5) * 7; ePos[i * 3 + 1] = -3 + Math.random() * 4; ePos[i * 3 + 2] = -1.5 + Math.random() * 2.5;
      eVel[i] = 0.25 + Math.random() * 0.45;
    }
    eGeo.setAttribute("position", new THREE.BufferAttribute(ePos, 3));
    const embers = new THREE.Points(eGeo, new THREE.PointsMaterial({ color: 0xffb066, size: 0.05, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(embers);

    // haldi dust
    const dn = small ? 90 : 150; const dGeo = new THREE.BufferGeometry();
    const dp = new Float32Array(dn * 3);
    for (let i = 0; i < dn; i++) { dp[i * 3] = (Math.random() - 0.5) * 9; dp[i * 3 + 1] = Math.random() * 7 - 3; dp[i * 3 + 2] = -3 + Math.random() * 4; }
    dGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ color: 0xffe2a1, size: 0.035, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(dust);

    const resize = () => {
      const w = host.clientWidth || 1, h = host.clientHeight || 1;
      R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
      if (reduced) R.render(scene, cam);
    };
    const ro = new ResizeObserver(resize); ro.observe(host); resize();

    let tx = 0, ty = 0;
    const onMove = (e) => { tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5; };
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.02 });
    io.observe(host);

    const clock = new THREE.Clock();
    let raf = 0, alive = true;
    const step = () => {
      const dt = Math.min(clock.getDelta(), 0.05); const t = clock.elapsedTime;
      nebula.material.uniforms.uT.value = t;
      kalash.rotation.y = t * 0.28;
      halos.forEach((h, i) => { h.rotation.z = t * (0.18 + i * 0.09) * (i % 2 ? -1 : 1); h.rotation.x = 0.35 + i * 0.12 + Math.sin(t * 0.4 + i) * 0.08; });
      aura.material.opacity = 0.42 + Math.sin(t * 1.6) * 0.1;
      toran.forEach((g) => { g.rotation.z = Math.sin(t * 0.5 + g.userData.ph) * 0.02; g.position.y = Math.sin(t * 0.7 + g.userData.ph) * 0.05; });
      lanterns.forEach((L) => {
        L.position.y += L.userData.sp * dt;
        L.position.x = L.userData.x0 + Math.sin(t * 0.5 + L.userData.ph) * 0.25;
        L.rotation.z = Math.sin(t * 0.6 + L.userData.ph) * 0.08;
        if (L.position.y > 4.4) L.position.y = -3.6;
      });
      diyas.forEach((d, i) => {
        d.g.position.y = d.baseY + Math.sin(t * 0.9 + d.ph) * 0.16;
        d.g.rotation.z = Math.sin(t * 0.6 + d.ph) * 0.06;
        const fk = 0.86 + Math.sin(t * 11 + d.ph * 3) * 0.1 + Math.sin(t * 23 + i) * 0.05;
        d.fl.scale.y = 1.7 * fk; d.sp.material.opacity = 0.62 + fk * 0.3;
        if (d.light) d.light.intensity = 0.7 + fk * 0.35;
      });
      petals.forEach((p, i) => {
        p.y -= p.sp * dt; if (p.y < -3.4) { p.y = 3.9; p.x = (Math.random() - 0.5) * 8.4; }
        dummy.position.set(p.x + Math.sin(t * 0.7 + p.ph) * 0.4, p.y, p.z);
        dummy.rotation.set(t * p.rx + p.ph, t * p.ry, t * p.rz);
        dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
      });
      inst.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < en; i++) {
        ePos[i * 3 + 1] += eVel[i] * dt;
        if (ePos[i * 3 + 1] > 3.8) { ePos[i * 3 + 1] = -3.2; ePos[i * 3] = (Math.random() - 0.5) * 7; }
      }
      eGeo.attributes.position.needsUpdate = true;
      embers.material.opacity = 0.55 + Math.sin(t * 3.1) * 0.2;
      dust.rotation.y = t * 0.02;
      cam.position.x = THREE.MathUtils.lerp(cam.position.x, tx * 0.55, 0.04);
      cam.position.y = THREE.MathUtils.lerp(cam.position.y, 0.25 - pRef.current * 0.55 - ty * 0.3, 0.05);
      cam.lookAt(0, -0.2, 0);
      R.render(scene, cam);
    };
    const loop = () => { if (!alive) return; if (visible && !document.hidden) step(); raf = requestAnimationFrame(loop); };
    if (reduced) { step(); } else { raf = requestAnimationFrame(loop); }

    apiRef.current = {
      scene, amb, nebula,
      renderOnce: () => R.render(scene, cam),
    };

    return () => {
      alive = false; cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onMove);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { const m = Array.isArray(o.material) ? o.material : [o.material]; m.forEach((x) => { if (x.map) x.map.dispose(); x.dispose(); }); }
      });
      glowTex.dispose(); R.dispose();
      if (R.domElement.parentNode) R.domElement.parentNode.removeChild(R.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useEffect(() => {
    const a = apiRef.current; if (!a) return;
    const day = theme === "day";
    a.scene.fog.color.set(day ? 0xf8f0dd : 0x0a0e24);
    a.amb.intensity = day ? 0.85 : 0.55;
    const u = a.nebula.material.uniforms;
    u.uAmp.value = day ? 0.35 : 0.55;
    u.uA.value.set(day ? 0xf3e6c8 : 0x131938);
    u.uB.value.set(day ? 0xf2c9a0 : 0x7c1f38);
    u.uC.value.set(day ? 0xbfe3d2 : 0x1f8f66);
    if (reduced) a.renderOnce();
  }, [theme, reduced]);

  if (!ok) return null;
  return <div ref={hostRef} aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }} />;
}

/* Two interlocked wedding rings — gold & rose-gold tori, RSVP confirmation. */
function Rings3D() {
  const hostRef = useRef(null);
  useEffect(() => {
    const host = hostRef.current; if (!host) return;
    let R;
    try { R = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch (e) { return; }
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    R.outputEncoding = THREE.sRGBEncoding;
    R.toneMapping = THREE.ACESFilmicToneMapping;
    R.setClearColor(0x000000, 0);
    R.setSize(230, 150, false);
    R.domElement.style.width = "230px"; R.domElement.style.height = "150px";
    host.appendChild(R.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(38, 230 / 150, 0.1, 20); cam.position.z = 3.4;
    scene.add(new THREE.AmbientLight(0xffe9c4, 0.7));
    const key = new THREE.DirectionalLight(0xfff1c9, 1.3); key.position.set(2, 3, 4); scene.add(key);
    const ringGeo = new THREE.TorusGeometry(0.62, 0.085, 24, 64);
    const g1 = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0xe6b64c, metalness: 0.95, roughness: 0.22, emissive: 0x2a1a05, emissiveIntensity: 0.5 }));
    const g2 = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0xe89a8a, metalness: 0.95, roughness: 0.24, emissive: 0x2a0f0a, emissiveIntensity: 0.5 }));
    g1.position.x = -0.36; g2.position.x = 0.36; g2.rotation.y = Math.PI / 2.15;
    const grp = new THREE.Group(); grp.add(g1, g2); grp.rotation.x = 0.35; scene.add(grp);
    const sn = 26; const sGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(sn * 3);
    for (let i = 0; i < sn; i++) {
      const a = (i / sn) * Math.PI * 2, r = 1.02 + (i % 3) * 0.09;
      sPos[i * 3] = Math.cos(a) * r; sPos[i * 3 + 1] = Math.sin(a) * r * 0.55; sPos[i * 3 + 2] = Math.sin(a * 2) * 0.2;
    }
    sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    const sparkles = new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xffe2a1, size: 0.045, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(sparkles);
    const clock = new THREE.Clock();
    let raf = 0, alive = true;
    const loop = () => {
      if (!alive) return;
      grp.rotation.y = clock.elapsedTime * 0.7;
      grp.rotation.x = 0.35 + Math.sin(clock.elapsedTime * 0.8) * 0.12;
      sparkles.rotation.y = -clock.elapsedTime * 1.1;
      sparkles.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.3;
      sparkles.material.opacity = 0.65 + Math.sin(clock.elapsedTime * 4) * 0.25;
      R.render(scene, cam);
      if (!reduced) raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      alive = false; cancelAnimationFrame(raf);
      ringGeo.dispose(); g1.material.dispose(); g2.material.dispose(); sGeo.dispose(); sparkles.material.dispose(); R.dispose();
      if (R.domElement.parentNode) R.domElement.parentNode.removeChild(R.domElement);
    };
  }, []);
  return <div ref={hostRef} aria-hidden="true" style={{ display: "flex", justifyContent: "center", margin: "2px 0 6px" }} />;
}


/* Pointer-tracked 3D tilt with a moving glare highlight. Disabled for
   touch pointers and reduced motion. */
function Tilt({ className = "", children, max = 7, ...rest }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia && (window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", ((px - 0.5) * 2 * max).toFixed(2) + "deg");
    el.style.setProperty("--rx", ((0.5 - py) * 2 * max).toFixed(2) + "deg");
    el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
    el.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
    el.style.setProperty("--go", 1);
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--go", 0);
  };
  return (
    <div ref={ref} className={`tilt ${className}`} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      {children}<span className="glare" aria-hidden="true" />
    </div>
  );
}

/* Soft gold glow that trails the cursor (screen blend). */
function CursorGlow() {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y, raf;
    const mv = (e) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      if (ref.current) ref.current.style.transform = `translate(${x - 170}px, ${y - 170}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", mv, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("pointermove", mv); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="cglow" aria-hidden="true" />;
}

/* Self-drawing rangoli chapter divider — strokes draw in when scrolled
   into view, paisley knot at the centre. */
function RangoliDivider({ delay = 0 }) {
  const ref = useRef(null); const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <svg ref={ref} className={`rangoli ${on ? "draw" : ""}`} viewBox="0 0 560 64" aria-hidden="true">
      <path pathLength="1" style={{ transitionDelay: `${delay}ms` }} d="M16 32 H196 M364 32 H544" />
      <path pathLength="1" style={{ transitionDelay: `${delay + 220}ms` }}
        d="M196 32 C224 4 250 4 266 26 C269 31 275 31 278 26 C294 4 320 4 348 32 C320 60 294 60 278 38 C275 33 269 33 266 38 C250 60 224 60 196 32 Z" />
      <path pathLength="1" style={{ transitionDelay: `${delay + 460}ms` }}
        d="M258 32 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M264 32 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0" />
      <circle className="dot" cx="196" cy="32" r="3.2" />
      <circle className="dot" cx="364" cy="32" r="3.2" />
      <circle className="dot" cx="272" cy="32" r="2.4" />
    </svg>
  );
}

/* Blooming lotus — petals unfurl with a springy stagger. */
function LotusBloom({ size = 132 }) {
  return (
    <svg className="lotus" width={size} height={size * 0.7} viewBox="0 0 132 92" aria-hidden="true">
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
        <g key={i} style={{ transform: `rotate(${i * 17}deg)`, transformOrigin: "66px 84px" }}>
          <path className="pet" style={{ animationDelay: `${(3 - Math.abs(i)) * 110 + 150}ms` }}
            d="M66 84 C54 56 56 32 66 12 C76 32 78 56 66 84 Z" />
        </g>
      ))}
      <circle className="lcore" cx="66" cy="70" r="7" />
      <ellipse className="lbase" cx="66" cy="85" rx="30" ry="6" />
    </svg>
  );
}

/* Infinite phrase marquee — Belagavi × Kolhapur banter on a loop. */
function Marquee() {
  const items = ["Lai Bhari", "शुभमंगल सावधान", "Nad Khula", "halu halu · ಹಾಲು ಬೇಡ, ಹಳು ಹಳು!",
    "Yeta ka mag?", "जेवण झालं का?", CONFIG.hashtag, "स्वागत · ಸುಸ್ವಾಗತ"];
  const row = (k) => items.map((t, i) => <span key={k + i}>✦&nbsp;&nbsp;{t}</span>);
  return (
    <div className="marq" aria-hidden="true">
      <div className="inner">{row("a")}{row("b")}</div>
    </div>
  );
}

function Reveal({ children, delay = 0, as: Tag = "div", className = "", style, ...rest }) {
  const ref = useRef(null); const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`rv ${on ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }} {...rest}>{children}</Tag>
  );
}

/* Antarpat — the silk cloth that parts as you scroll. p ∈ [0,1]. */
function Curtain({ p }) {
  const open = clamp((p - 0.12) / 0.5, 0, 1);
  const eased = 1 - Math.pow(1 - open, 3);
  const textPhase = p < 0.16 ? 0 : p < 0.34 ? 1 : 2;
  const EMB = Array.from({ length: 8 }, (_, i) => {
    const x = i * 50 + 8;
    return `M${x} 20 q10 -16 20 0 q-6 6 -10 2 q-4 -4 2 -8 M${x + 30} 18 q5 -8 10 0`;
  }).join(" ");
  return (
    <div className="curtain" aria-hidden="true" style={{ opacity: p > 0.95 ? 0 : 1, transition: "opacity .4s" }}>
      <div className="cloth L" style={{ transform: `translateX(${-eased * 108}%) rotate(${-eased * 1.6}deg)` }}>
        <div className="tassels">{Array.from({ length: 9 }).map((_, i) => <i key={i} />)}</div>
        <svg className="embroid" viewBox="0 0 400 26" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d={EMB} /></svg>
      </div>
      <div className="cloth R" style={{ transform: `translateX(${eased * 108}%) rotate(${eased * 1.6}deg)` }}>
        <div className="tassels">{Array.from({ length: 9 }).map((_, i) => <i key={i} />)}</div>
        <svg className="embroid" viewBox="0 0 400 26" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d={EMB} style={{ animationDelay: ".8s" }} /></svg>
      </div>
      <div className="clothText" style={{ opacity: 1 - eased * 1.6 }}>
        <div>
          <div className="big display dev">
            {textPhase < 2 ? "मंगलाष्टकं चालू आहे…" : "शुभमंगल… सावधान!"}
          </div>
          <div className="small">{textPhase === 0 ? "Scroll halu halu — 'slowly' in both our languages" : "Keep scrolling · the antarpat is about to drop"}</div>
        </div>
      </div>
    </div>
  );
}

/* Countdown — live, with regionally calibrated time units. */
function Countdown() {
  const target = new Date(CONFIG.weddingISO).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000) % 24,
    m = Math.floor(diff / 60000) % 60, s = Math.floor(diff / 1000) % 60;
  const chai = Math.max(1, Math.floor(diff / 3600000 / 3));
  const misal = Math.max(1, d);
  if (diff === 0) return (
    <div className="humor" role="status" style={{ fontSize: 20 }}>
      It's happening. Someone find the groom's safa. 🥁
    </div>
  );
  return (
    <div>
      <div className="count" role="timer" aria-label="Countdown to the wedding">
        {[[d, "Divas"], [h, "Taas"], [m, "Minit"], [s, "Sekand"]].map(([v, l]) => (
          <div className="tile" key={l}><b key={v} className="display">{pad2(v)}</b><span>{l}</span></div>
        ))}
      </div>
      <p className="humor">
        That's roughly <b>{misal}</b> misal breakfasts, <b>{chai}</b> cutting chais,
        and <b>one</b> very busy Aaji away.
      </p>
    </div>
  );
}

/* Itinerary card with per-event calendar actions. */
function EventCard({ e, i }) {
  return (
    <Reveal delay={i * 90}>
    <Tilt className="card event sheen">
      <span className="emoji" aria-hidden="true">{e.emoji}</span>
      <h3 className="display">{e.title}</h3>
      <span className="tag">{e.tag}</span>
      <div className="meta">
        <Clock size={14} aria-hidden="true" /> {prettyDate(e.date)} · {to12h(e.start)}–{to12h(e.end)}
      </div>
      <div className="meta"><MapPin size={14} aria-hidden="true" /> {e.place}</div>
      <div className="evBtns">
        <a className="btn ghost" href={gcalUrl(e)} target="_blank" rel="noopener noreferrer">
          <CalendarPlus size={14} /> Google
        </a>
        <button className="btn ghost" onClick={() => downloadICS(e)}>
          <Download size={14} /> Apple / .ics
        </button>
      </div>
      <div className="dressline"><b style={{ color: "var(--gold)" }}>Dress:</b> {e.dress} <em style={{ opacity: .8 }}>· {e.note}</em></div>
    </Tilt>
    </Reveal>
  );
}

/* ════════════════════════════════════════════════════════════════════
   VENUE MAP + LOCAL GUIDE
   ════════════════════════════════════════════════════════════════════ */
function RegionMap({ active, setActive, reduced }) {
  const rideRoad = "M300 240 C 360 250, 420 265, 470 280 S 600 340, 645 385";
  const road = "M150 140 C 210 180, 250 210, 300 240 S 330 310, 330 330 M300 240 C 360 250, 420 265, 470 280 S 600 340, 645 385 M470 280 C 500 230, 530 170, 565 130";
  return (
    <svg className="mapSvg" viewBox="0 0 800 520" role="img"
      aria-label="Illustrated map of Belagavi region with venue and guest landmarks">
      <rect width="800" height="520" rx="14" fill="var(--bg2)" />
      {/* hills + river */}
      <path d="M0 470 Q 90 420 190 462 T 400 466 T 620 458 T 800 468 L 800 520 L 0 520 Z"
        fill="var(--maroon)" opacity=".18" />
      <path d="M0 495 Q 120 458 260 492 T 540 494 T 800 490 L 800 520 L 0 520 Z"
        fill="var(--gold)" opacity=".1" />
      <path d="M40 40 C 140 90, 120 200, 210 260 C 280 306, 300 380, 260 480"
        fill="none" stroke="var(--emerald)" strokeWidth="6" opacity=".28" strokeLinecap="round" />
      <text x="66" y="330" fill="var(--emerald)" opacity=".6" fontSize="11"
        style={{ letterSpacing: ".2em" }} transform="rotate(72 66 330)">GHATAPRABHA</text>
      {/* roads */}
      <path d={road} fill="none" stroke="var(--gold)" strokeWidth="2" opacity=".55" className="dash" />
      {!reduced && (
        <g aria-hidden="true">
          {/* auto-rickshaw shuttling Kolhapur ↔ Belagavi */}
          <g>
            <animateMotion dur="16s" repeatCount="indefinite" rotate="auto" calcMode="linear"
              keyPoints="0;1;0" keyTimes="0;0.5;1" path={rideRoad} />
            <rect x="-9" y="-7" width="18" height="10" rx="3" fill="var(--gold)" />
            <rect x="-5" y="-12" width="11" height="6" rx="2" fill="var(--rose)" />
            <circle cx="-5" cy="4" r="3" fill="var(--ink)" />
            <circle cx="5" cy="4" r="3" fill="var(--ink)" />
          </g>
          {/* monsoon birds */}
          <g stroke="var(--muted)" strokeWidth="1.6" fill="none" opacity=".75">
            <path d="M-6 0 Q-2 -4 0 0 Q2 -4 6 0">
              <animateMotion dur="19s" repeatCount="indefinite" path="M110 92 C 300 58 520 112 780 68" />
            </path>
            <path d="M-5 0 Q-1.6 -3.4 0 0 Q1.6 -3.4 5 0">
              <animateMotion dur="25s" repeatCount="indefinite" path="M50 142 C 260 100 540 150 790 108" />
            </path>
          </g>
        </g>
      )}
      {/* monsoon cloud */}
      <g transform="translate(660 52)" opacity=".85">
        <path d="M0 22 a14 14 0 0 1 26 -8 a12 12 0 0 1 22 6 a10 10 0 0 1 -4 19 h-36 a11 11 0 0 1 -8 -17z"
          fill="var(--card)" stroke="var(--line)" />
        <line className="drop" x1="14" y1="44" x2="10" y2="54" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" />
        <line className="drop d2" x1="30" y1="44" x2="26" y2="54" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" />
        <line className="drop d3" x1="46" y1="44" x2="42" y2="54" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" />
        <text x="-4" y="74" fontSize="10" fill="var(--muted)" style={{ letterSpacing: ".14em" }}>AUGUST MOOD</text>
      </g>
      {/* compass */}
      <g transform="translate(52 66)" stroke="var(--gold)" fill="none" opacity=".8">
        <circle r="18" /><path d="M0 -14 L4 0 L0 14 L-4 0 Z" fill="var(--gold)" />
        <text y="-24" textAnchor="middle" fill="var(--gold)" fontSize="11">N</text>
      </g>
      {/* pins */}
      {PINS.map((p) => {
        const on = active === p.id; const isVenue = p.id === "venue";
        return (
          <g key={p.id} className="pinbtn" tabIndex={0} role="button"
            aria-label={`${p.label} — ${p.km}`}
            onClick={() => setActive(p.id)}
            onKeyDown={(ev) => (ev.key === "Enter" || ev.key === " ") && setActive(p.id)}
            transform={`translate(${p.x} ${p.y})`}>
            <circle className="pinPulse" r="15" fill="none"
              stroke={isVenue ? "var(--rose)" : "var(--gold)"} strokeWidth="1.5" />
            <circle r={isVenue ? 17 : 13} fill={on ? "var(--gold)" : "var(--card)"}
              stroke={isVenue ? "var(--rose)" : "var(--gold)"} strokeWidth={on ? 2.4 : 1.5} />
            <text textAnchor="middle" dy="5" fontSize={isVenue ? 15 : 12}
              style={{ pointerEvents: "none" }}>{p.icon}</text>
            <text textAnchor="middle" y={isVenue ? 38 : 32} fontSize="11.5"
              fill={on ? "var(--gold)" : "var(--muted)"} fontWeight={on ? 700 : 400}
              style={{ pointerEvents: "none" }}>{p.label.split(" ").slice(0, 2).join(" ")}</text>
          </g>
        );
      })}
    </svg>
  );
}

function GuideTabs() {
  const [tab, setTab] = useState("khaana");
  const TABS = [
    ["khaana", "Khaana", Utensils], ["pehnava", "Pehnava", Shirt],
    ["pravaas", "Pravaas", Plane], ["insider", "Insider", Star],
  ];
  return (
    <div>
      <div className="tabs" role="tablist" aria-label="Local guide">
        {TABS.map(([id, label, Icon]) => (
          <button key={id} role="tab" aria-selected={tab === id}
            className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
            <Icon size={14} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {GUIDE[tab].map(([k, v]) => (
          <div className="guideRow" key={k}><b>{k}</b><span>{v}</span></div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   RSVP + BLESSINGS WALL (shared-visibility demo storage)
   ════════════════════════════════════════════════════════════════════ */
function RSVP() {
  const [vibe, setVibe] = useState(null);
  const [name, setName] = useState("");
  const [count, setCount] = useState(2);
  const [meal, setMeal] = useState(MEALS[0]);
  const [song, setSong] = useState("");
  const [done, setDone] = useState(null);
  const [tally, setTally] = useState(87);
  const btnRef = useRef(null);
  useEffect(() => { store.get("ps-rsvp-tally-v1", 87).then((t) => setTally(Number(t) || 87)); }, []);
  const submit = async () => {
    if (!vibe || !name.trim()) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (fx.burst && rect) fx.burst(rect.left + rect.width / 2, rect.top);
    const attending = vibe !== "afar";
    const newTally = tally + (attending ? count : 0);
    setTally(newTally); setDone({ name: name.trim(), count, attending });
    const log = await store.get("ps-rsvp-log-v1", []);
    log.push({ name: name.trim(), vibe, count, meal, song, ts: Date.now() });
    await store.set("ps-rsvp-log-v1", log);
    await store.set("ps-rsvp-tally-v1", newTally);
  };
  if (done) return (
    <div className="card confirm">
      <div className="confRing"><Check size={38} strokeWidth={2.5} /></div>
      <LotusBloom />
      <Rings3D />
      <h3 className="display" style={{ fontSize: "clamp(24px,4vw,36px)" }}>
        Shubh Mangal <span className="goldtxt">SAVED-haan!</span> 🎉
      </h3>
      <p className="lede" style={{ margin: "10px auto 0" }}>
        {done.attending
          ? `${done.name}, you + ${done.count - 1 || "no"} more = counted, fed, and expected on the dance floor.`
          : `${done.name}, we'll miss you badly — a laddoo courier is being arranged.`}
      </p>
      <p className="humor" style={{ marginTop: 14 }}>Pro tip: stretch before the Sangeet.</p>
      <p className="meter"><b>{tally}+</b> guests have already said "yeta!"</p>
    </div>
  );
  return (
    <div>
      <div className="vibes" role="radiogroup" aria-label="How are you attending?">
        {VIBES.map((v, i) => (
          <Reveal as="button" key={v.id} delay={i * 70} role="radio" aria-checked={vibe === v.id}
            className={`vibe ${vibe === v.id ? "on" : ""}`} onClick={() => setVibe(v.id)}>
            <span className="ve" aria-hidden="true">{v.emoji}</span>
            <h4 className="display">{v.title}</h4>
            <p>{v.sub}</p>
            <span className="tick"><Check size={13} /></span>
          </Reveal>
        ))}
      </div>
      <div className="formRow">
        <div className="field">
          <label htmlFor="ps-name">Your good name</label>
          <input id="ps-name" className="input" value={name} maxLength={48}
            placeholder="e.g. Sneha Khot-Magadum" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Total jankar (people)</label>
          <div className="step">
            <button aria-label="Fewer guests" onClick={() => setCount((c) => Math.max(1, c - 1))}><Minus size={16} /></button>
            <b className="display">{count}</b>
            <button aria-label="More guests" onClick={() => setCount((c) => Math.min(8, c + 1))}><Plus size={16} /></button>
          </div>
        </div>
      </div>
      <div className="formRow">
        <div className="field">
          <label>Jevan preference (all pure veg)</label>
          <div className="seg" role="radiogroup" aria-label="Meal preference">
            {MEALS.map((m) => (
              <button key={m} role="radio" aria-checked={meal === m}
                className={meal === m ? "on" : ""} onClick={() => setMeal(m)}>{m}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="ps-song">One song you WILL dance to</label>
          <input id="ps-song" className="input" value={song} maxLength={64}
            placeholder="DJ takes bribes in Kunda" onChange={(e) => setSong(e.target.value)} />
        </div>
      </div>
      <button ref={btnRef} className="btn solid" style={{ fontSize: 15, padding: "14px 26px" }}
        disabled={!vibe || !name.trim()} onClick={submit}
        title={!vibe || !name.trim() ? "Pick a vibe + tell us your name" : "Lock it in"}>
        <PartyPopper size={16} /> Pakka done ✓
      </button>
      <p className="privacyNote" style={{ marginTop: 12 }}>
        Demo note: RSVPs & the guest tally are stored in this artifact's shared space —
        counts are visible to everyone viewing this invite.
      </p>
    </div>
  );
}

function BlessingsWall() {
  const [items, setItems] = useState(SEED_BLESSINGS);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  useEffect(() => {
    store.get("ps-blessings-v1", []).then((saved) =>
      setItems([...(Array.isArray(saved) ? saved : []), ...SEED_BLESSINGS]));
  }, []);
  const addEmoji = (e) => setMsg((m) => (m + " " + e).trim().slice(0, 160));
  const post = async () => {
    if (!msg.trim()) return;
    const entry = { n: (name.trim() || "Someone lovely").slice(0, 30), m: msg.trim().slice(0, 160), c: (Math.random() * 4) | 0, ts: Date.now() };
    const next = [entry, ...items];
    setItems(next); setMsg(""); setSent(true);
    setTimeout(() => setSent(false), 2500);
    if (fx.burst) fx.burst(window.innerWidth / 2, window.innerHeight * 0.35);
    const saved = await store.get("ps-blessings-v1", []);
    await store.set("ps-blessings-v1", [entry, ...(Array.isArray(saved) ? saved : [])].slice(0, 120));
  };
  const tints = [
    "linear-gradient(150deg, rgba(227,179,65,.14), transparent)",
    "linear-gradient(150deg, rgba(255,93,143,.13), transparent)",
    "linear-gradient(150deg, rgba(35,192,143,.12), transparent)",
    "linear-gradient(150deg, rgba(124,31,56,.2), transparent)",
  ];
  return (
    <div>
      <div className="card" style={{ padding: 22, maxWidth: 720 }}>
        <div className="formRow" style={{ marginBottom: 12 }}>
          <div className="field">
            <label htmlFor="ps-bmsg">Your blessing (140-ish characters of pure love)</label>
            <input id="ps-bmsg" className="input" value={msg} maxLength={160}
              placeholder="May your arguments end in laughter and your fridge in laddoos…"
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && post()} />
          </div>
          <div className="field">
            <label htmlFor="ps-bname">From (optional)</label>
            <input id="ps-bname" className="input" value={name} maxLength={30}
              placeholder="Aaji, Kaka, college gang…" onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <div className="emos" aria-label="Quick emoji blessings">
            {["🙏", "❤️", "🪔", "🌸", "🥳", "🍛"].map((e) => (
              <button key={e} onClick={() => addEmoji(e)} aria-label={`Add ${e}`}>{e}</button>
            ))}
          </div>
          <button className="btn solid" onClick={post} disabled={!msg.trim()}>
            <Send size={14} /> {sent ? "Blessed! 🌸" : "Pin it to the wall"}
          </button>
        </div>
        <p className="privacyNote" style={{ marginTop: 12 }}>
          <Mic size={11} style={{ verticalAlign: "-1px" }} /> Voice blessings? There's a mic booth at
          the venue. And yes — this wall is public to everyone opening this invite. Bless responsibly.
        </p>
      </div>
      <div className="wall">
        {items.map((b, i) => (
          <div className="card bless" key={b.ts || `seed-${i}`}
            style={{ background: tints[b.c % 4] }}>
            <p>{b.m}</p><span>— {b.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN — full-screen story chapters
   ════════════════════════════════════════════════════════════════════ */
const CHAPTERS = [
  ["home", "Antarpat"], ["story", "Katha"], ["events", "Muhurat"],
  ["venue", "Rasta"], ["rsvp", "Yeta ka?"], ["wall", "Ashirwad"],
];

export default function WeddingInvitation() {
  const [theme, setTheme] = useState("night");
  const [sound, setSound] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [vh, setVh] = useState(800);
  const [activeCh, setActiveCh] = useState("home");
  const [storyMode, setStoryMode] = useState("sweet");
  const storyRef = useRef(null);
  const [sg, setSg] = useState({ top: 0, h: 1 });
  useEffect(() => {
    const measure = () => {
      const el = storyRef.current, w = rootRef.current;
      if (el && w) setSg({
        top: el.getBoundingClientRect().top + w.scrollTop - w.getBoundingClientRect().top,
        h: el.offsetHeight || 1,
      });
    };
    measure();
    const t = setTimeout(measure, 900);
    window.addEventListener("resize", measure);
    return () => { window.removeEventListener("resize", measure); clearTimeout(t); };
  }, []);
  const [modeFlip, setModeFlip] = useState(false);
  const [activePin, setActivePin] = useState("venue");
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef(null);
  const ambRef = useRef(null);
  const burstOnce = useRef(false);
  const tick = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMq = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", onMq);
    const onResize = () => setVh(window.innerHeight);
    onResize(); window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); mq.removeEventListener?.("change", onMq); };
  }, []);

  useEffect(() => () => ambRef.current?.stop(), []);

  useEffect(() => {
    const secs = CHAPTERS.map(([id]) => document.getElementById(`ps-${id}`)).filter(Boolean);
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActiveCh(e.target.dataset.ch)),
      { rootMargin: "-42% 0px -42% 0px" }
    );
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const onScroll = (e) => {
    const st = e.currentTarget.scrollTop;
    if (!tick.current) {
      tick.current = true;
      requestAnimationFrame(() => { setScrollY(st); tick.current = false; });
    }
  };

  const heroP = clamp(scrollY / (vh * 1.8 || 1), 0, 1);
  useEffect(() => {
    if (heroP > 0.5 && !burstOnce.current && fx.burst && !reduced) {
      burstOnce.current = true;
      fx.burst(window.innerWidth / 2, vh * 0.28);
    }
  }, [heroP, vh, reduced]);
  const total = rootRef.current ? rootRef.current.scrollHeight - rootRef.current.clientHeight : 1;
  const progress = clamp(scrollY / (total || 1), 0, 1);

  const toggleSound = () => {
    if (!sound) { ambRef.current = new Ambience(); ambRef.current.start(); }
    else { ambRef.current?.stop(); ambRef.current = null; }
    setSound(!sound);
  };
  const jump = (id) => document.getElementById(`ps-${id}`)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  const switchMode = (m) => {
    if (m === storyMode) return;
    setModeFlip(true);
    setTimeout(() => { setStoryMode(m); setModeFlip(false); }, 240);
  };
  const nameReveal = clamp((heroP - 0.2) / 0.45, 0, 1);

  return (
    <div ref={rootRef} className="pswrap grain" data-theme={theme} onScroll={onScroll}>
      <style>{CSS}</style><style>{CSS2}</style>
      <PetalCanvas reduced={reduced} />
      <CursorGlow />
      <div className="progress" style={{ width: `${progress * 100}%` }} />

      <header className="topbar">
        <span className="mono" aria-label="Akshay and Shraddha monogram">A <Heart size={13} style={{ color: "var(--rose)", verticalAlign: "-1px" }} /> S</span>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="iconbtn" onClick={toggleSound} aria-pressed={sound}
            title="Toggle ambient tanpura + temple-bell soundscape (synthesized live)">
            {sound ? <Music size={14} /> : <VolumeX size={14} />}
            <span style={{ minWidth: 52, textAlign: "left" }}>{sound ? "Shanta…" : "Ambience"}</span>
          </button>
          <button className="iconbtn" onClick={() => setTheme(theme === "night" ? "day" : "night")}
            aria-pressed={theme === "day"} title="Switch between Raat and Divas themes">
            {theme === "night" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "night" ? "Divas" : "Raat"}
          </button>
        </div>
      </header>

      <nav className="dots" aria-label="Chapters">
        {CHAPTERS.map(([id, label]) => (
          <button key={id} className={`dot ${activeCh === id ? "on" : ""}`}
            onClick={() => jump(id)} aria-label={`Go to ${label}`}>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* ── CH 1 · HERO / ANTARPAT ─────────────────────────────── */}
      <section id="ps-home" data-ch="home" className="heroTrack">
        <div className="heroPin">
          <Mandala style={{ transform: `rotate(${scrollY * 0.02}deg) scale(${1 + heroP * 0.12})` }} />
          <Scene3D heroP={heroP} theme={theme} reduced={reduced} />
          <Diya style={{ left: "6%", bottom: "10%" }} />
          <Diya style={{ right: "6%", bottom: "10%" }} slow />
          <Diya style={{ left: "12%", top: "14%", width: 34 }} slow />
          <Diya style={{ right: "12%", top: "14%", width: 34 }} />
          <div className="heroInner" style={{
            opacity: 0.25 + nameReveal * 0.75,
            transform: `scale(${0.94 + nameReveal * 0.06}) translateY(${(1 - nameReveal) * 18}px)`,
          }}>
            <p className="invok dev">॥ श्री वीतरागाय नमः ॥ &nbsp;·&nbsp; ॥ श्री गणेशाय नमः ॥</p>
            <h1 className="display names">
              <span className={`goldtxt shimmer lts ${nameReveal > 0.45 ? "ltsIn" : ""}`}>{[...CONFIG.groom.en].map((c, i) => <span key={i} className="lt" style={{ "--i": i }}>{c}</span>)}</span>
              <span className="amp display">&amp;</span>
              <span className={`goldtxt shimmer lts ${nameReveal > 0.45 ? "ltsIn" : ""}`}>{[...CONFIG.bride.en].map((c, i) => <span key={i} className="lt" style={{ "--i": i + 2 }}>{c}</span>)}</span>
            </h1>
            <p className="dev namesDev">{CONFIG.groom.dev} ♥ {CONFIG.bride.dev}</p>
            <p className="namesKan">{CONFIG.groom.kan} ♥ {CONFIG.bride.kan}</p>
            <div className="dateRow display" aria-label="9 August 2026">
              <span className="dateNum">09</span><span className="dateDot">✦</span>
              <span className="dateNum">08</span><span className="dateDot">✦</span>
              <span className="dateNum">2026</span>
            </div>
            <p className="muhurt">Sunday · {CONFIG.muhurtLabel} · {CONFIG.city}</p>
            <p style={{ fontSize: 12.5, letterSpacing: ".04em", opacity: .88, margin: "12px auto 0", maxWidth: 560 }}>{CONFIG.groom.parents}</p>
            <p style={{ fontSize: 12.5, letterSpacing: ".04em", opacity: .88, margin: "3px auto 0", maxWidth: 560 }}>{CONFIG.bride.parents}</p>
            <p className="lede" style={{ margin: "18px auto 0", maxWidth: 520 }}>
              Two traditions. Two languages. One decidedly <em>lai bhari</em> love story —
              and you're invited to all of it.
            </p>
            <div className="heroCtas" style={{ opacity: nameReveal, pointerEvents: nameReveal > 0.3 ? "auto" : "none" }}>
              <button className="btn solid" onClick={() => downloadICS(EVENTS[3])}>
                <CalendarPlus size={15} /> Save the muhurat
              </button>
              <button className="btn ghost" onClick={() => jump("story")}>
                <Sparkles size={15} /> Read the katha
              </button>
            </div>
          </div>
          <Curtain p={heroP} />
          {heroP < 0.05 && (
            <div className="scrollcue"><span>Scroll halu halu</span><ChevronDown size={16} /></div>
          )}
        </div>
      </section>

      {/* ── CH 2 · STORY ───────────────────────────────────────── */}
      <RangoliDivider />
      <section id="ps-story" data-ch="story" className="chapter">
        <Reveal>
          <p className="eyebrow"><Flame size={11} style={{ verticalAlign: "-1px" }} /> Chapter Two · The Katha</p>
          <h2 className="display h2">Two homes, <span className="goldtxt">one story</span></h2>
          <p className="lede">
            A Digambar Jain household from Belagavi. A Maharashtrian household from Kolhapur.
            120 km, two scripts, one shared weakness for sweets. Toggle for the version the aajis approve of.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mode" role="radiogroup" aria-label="Story mode" style={{ marginTop: 24 }}>
            <button className={storyMode === "sweet" ? "on" : ""} role="radio"
              aria-checked={storyMode === "sweet"} onClick={() => switchMode("sweet")}>Aaji-approved 🤍</button>
            <button className={storyMode === "spice" ? "on" : ""} role="radio"
              aria-checked={storyMode === "spice"} onClick={() => switchMode("spice")}>Katta gossip 🌶️</button>
          </div>
        </Reveal>
        <div className="tl" ref={storyRef} style={{ position: "relative" }}>
          <div className="vineWrap" aria-hidden="true">
            <svg viewBox="0 0 70 1000" preserveAspectRatio="none">
              <path pathLength="1" style={{
                strokeDasharray: 1,
                strokeDashoffset: 1 - clamp((scrollY + vh * 0.85 - sg.top) / (sg.h || 1), 0, 1),
              }} d="M35 0 C56 90 14 180 35 270 C56 360 14 450 35 540 C56 630 14 720 35 810 C56 900 35 950 35 1000" />
            </svg>
          </div>
          {STORY.map((s, i) => (
            <Reveal className="tlItem" key={s.t} delay={i * 80}>
              <div className="tlYear">{s.y}</div>
              <h3 className="display tlTitle">{s.t}</h3>
              <p className={`tlBody ${modeFlip ? "swap" : ""}`}>{s[storyMode]}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={100}>
          <div className="ornament display" style={{ justifyContent: "flex-start" }}>❁ how the day blends both ❁</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {RITUAL_CHIPS.map((c) => <span className="chip" key={c}>✦ {c}</span>)}
          </div>
        </Reveal>
      </section>

      {/* ── CH 3 · ITINERARY + COUNTDOWN ───────────────────────── */}
      <Marquee />
      <RangoliDivider delay={120} />
      <section id="ps-events" data-ch="events" className="chapter">
        <Reveal>
          <p className="eyebrow"><Clock size={11} style={{ verticalAlign: "-1px" }} /> Chapter Three · The Muhurat</p>
          <h2 className="display h2">Three days of <span className="goldtxt">shubh chaos</span></h2>
          <p className="lede">Every card adds itself to your calendar — because "arre, konta din hota?" is not an excuse we accept.</p>
        </Reveal>
        <Reveal delay={140}><Countdown /></Reveal>
        <div className="grid">
          {EVENTS.map((e, i) => <EventCard e={e} i={i} key={e.id} />)}
        </div>
      </section>

      {/* ── CH 4 · VENUE + GUIDE ───────────────────────────────── */}
      <RangoliDivider />
      <section id="ps-venue" data-ch="venue" className="chapter">
        <Reveal>
          <p className="eyebrow"><MapPin size={11} style={{ verticalAlign: "-1px" }} /> Chapter Four · The Rasta</p>
          <h2 className="display h2">Getting to <span className="goldtxt">{CONFIG.venue.name}</span></h2>
          <p className="lede">{CONFIG.venue.line}. Tap a pin — the map doubles as your weekend hit-list, out-of-towners.</p>
        </Reveal>
        <div className="venueGrid">
          <Reveal className="card mapCard" delay={100}>
            <RegionMap active={activePin} setActive={setActivePin} reduced={reduced} />
            {(() => {
              const p = PINS.find((x) => x.id === activePin);
              return (
                <div className="pinInfo card" key={p.id} style={{ border: "1px dashed var(--line)" }}>
                  <b className="display" style={{ fontSize: 18 }}>{p.icon} {p.label}</b>
                  <span style={{ color: "var(--muted)", fontSize: 13.5 }}>{p.sub}</span>
                  <span style={{ color: "var(--gold)", fontSize: 12.5 }}>{p.km}</span>
                  <a className="btn ghost" style={{ alignSelf: "flex-start", marginTop: 6, padding: "8px 14px", fontSize: 12.5 }}
                    href={`https://maps.google.com/?q=${encodeURIComponent(p.q)}`}
                    target="_blank" rel="noopener noreferrer">
                    <MapPin size={13} /> Open in Maps
                  </a>
                </div>
              );
            })()}
          </Reveal>
          <Reveal className="card" delay={200} style={{ padding: 24 }}>
            <h3 className="display" style={{ fontSize: 22, marginBottom: 16 }}>The out-of-towner's guide</h3>
            <GuideTabs />
            <div className="meta" style={{ marginTop: 18 }}>
              <Hotel size={14} /> {CONFIG.hotel}
            </div>
            <div className="meta" style={{ marginTop: 8 }}>
              <Umbrella size={14} /> August in Belagavi = drizzle with drama. Pack accordingly.
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CH 5 · RSVP ────────────────────────────────────────── */}
      <RangoliDivider delay={120} />
      <section id="ps-rsvp" data-ch="rsvp" className="chapter">
        <Reveal>
          <p className="eyebrow"><PartyPopper size={11} style={{ verticalAlign: "-1px" }} /> Chapter Five · The Big Question</p>
          <h2 className="display h2">Yeta ka mag? <span className="goldtxt">(So… you're coming, right?)</span></h2>
          <p className="lede">No boring forms. Pick your honest vibe — all four are valid life choices.</p>
        </Reveal>
        <Reveal delay={120}><RSVP /></Reveal>
      </section>

      {/* ── CH 6 · BLESSINGS ───────────────────────────────────── */}
      <RangoliDivider />
      <section id="ps-wall" data-ch="wall" className="chapter">
        <Reveal>
          <p className="eyebrow"><Heart size={11} style={{ verticalAlign: "-1px" }} /> Chapter Six · Ashirwad</p>
          <h2 className="display h2">The blessings <span className="goldtxt">wall</span></h2>
          <p className="lede">Leave a line, an emoji, a threat to out-dance the groom. Collect good karma instantly.</p>
        </Reveal>
        <Reveal delay={120}><BlessingsWall /></Reveal>
      </section>

      <footer className="footer">
        <div className="ornament" style={{ justifyContent: "center" }}>
          <Diya style={{ position: "static", width: 40 }} />
        </div>
        <p className="display shimmer">{CONFIG.hashtag}</p>
        <p style={{ marginTop: 8 }}>With love from {CONFIG.groom.family} &amp; {CONFIG.bride.family}</p>
        <p style={{ marginTop: 4, fontSize: 13, opacity: .9 }}>{CONFIG.familiesLine} — ekach parivaar aata.</p>
        <p style={{ marginTop: 4, fontSize: 13, opacity: .9 }}>Cheering squad: {CONFIG.siblings}</p>
        <p className="dev" style={{ marginTop: 14, opacity: .85 }}>स्वर्गीय आशीर्वाद 🪔 {CONFIG.remembrance.join(" · ")}</p>
        <p style={{ marginTop: 10 }}>{CONFIG.contact}</p>
        <p style={{ marginTop: 16, opacity: .7 }}>Crafted with ♥, cutting chai, and a little haldi · Belagavi × Kolhapur · 09.08.2026</p>
      </footer>
    </div>
  );
}
