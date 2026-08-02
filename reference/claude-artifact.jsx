import React, { useState, useEffect, useRef, useCallback } from "react";
import { CalendarPlus, Check, ChevronDown, Clock, Download, Gift, Heart, MapPin, Minus, Moon, Music, PartyPopper, Plane, Plus, Send, Shirt, Sparkles, Star, Sun, Umbrella, Users, Utensils, VolumeX, X } from "lucide-react";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════════
   AKSHAY ♥ SHRADDHA · 09.08.2026
   Smt. Malini Patil Bhavan · Gavani, Belagavi
   Preview build — the full project adds /admin and server-backed RSVPs.
   ═══════════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Sora:wght@300;400;600&family=Tiro+Devanagari+Marathi&family=Noto+Sans+Kannada:wght@300;400&display=swap');
/* ═══════════════════════════════════════════════════════════════════
   Akshay ♥ Shraddha — phone-first design system.
   Authored for a 380px viewport first; larger screens only get more
   breathing room. The whole invitation lives in one fixed viewport, so
   there is no page layout to speak of — only layers.
   ═══════════════════════════════════════════════════════════════════ */

:root {
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Sora', system-ui, sans-serif;
  --font-dev: 'Tiro Devanagari Marathi', 'Noto Sans Devanagari', serif;
  --font-kan: 'Noto Sans Kannada', sans-serif;

  --bg: #0a0e24; --bg2: #131938;
  --ink: #f4ead6; --muted: #b6a688;
  --gold: #e3b341; --gold2: #f7d87c;
  --rose: #ff5d8f; --emerald: #23c08f; --maroon: #7c1f38;
  --card: rgba(21, 27, 56, .72); --line: rgba(227, 179, 65, .28);
  --glass: rgba(9, 12, 30, .90);
  --safe-t: env(safe-area-inset-top, 0px);
  --safe-b: env(safe-area-inset-bottom, 0px);
}

.pswrap *, .viewport * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }



.pswrap {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  font-weight: 300;
  line-height: 1.6;
  overflow-x: hidden;
}

.display { font-family: var(--font-display); font-weight: 400; }
.dev { font-family: var(--font-dev); }
.kan { font-family: var(--font-kan); }

/* the tall empty element that provides scroll distance */
.scroller { width: 1px; pointer-events: none; }

/* everything visible lives here, pinned */
.viewport {
  position: fixed; inset: 0;
  color: var(--ink);
  overflow: hidden;
  background: linear-gradient(180deg, var(--bg), var(--bg2) 60%, var(--bg));
  transition: background .8s ease;
}
.viewport[data-theme='day'] {
  --bg: #fdf6e8; --bg2: #f7e7ca; --ink: #2b0d18; --muted: #6b4a36;
  --gold: #8a6210; --gold2: #a87c1c; --rose: #a8143f; --emerald: #0b6249;
  --card: rgba(255, 252, 245, .92); --line: rgba(138, 98, 16, .34);
  --glass: rgba(255, 251, 243, .94);
}
.viewport.party {
  --gold: #ffd23f; --rose: #ff2e88; --emerald: #14e3c2; --line: rgba(255, 46, 136, .4);
}

.grain::after {
  content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 6; opacity: .05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
}

.stage3d { position: absolute; inset: 0; z-index: 1; pointer-events: none; }

/* ── continuous SVG skin ─────────────────────────────────────── */

.liveRangoli {
  position: absolute; left: 50%; top: 50%;
  width: min(78vmin, 460px); height: min(78vmin, 460px);
  margin: calc(min(78vmin, 460px) / -2) 0 0 calc(min(78vmin, 460px) / -2);
  z-index: 2; pointer-events: none; opacity: .17;
  transition: transform .3s linear;
}
.liveRangoli ellipse {
  fill: none; stroke: var(--gold); stroke-width: 1.6; transform-origin: center;
  animation: breathe 5s ease-in-out infinite;
}
.liveRangoli .rgCore { fill: var(--rose); opacity: .8; }
.liveRangoli .rgRim {
  fill: none; stroke: var(--gold); stroke-width: .8; stroke-dasharray: 3 7;
  animation: spin 40s linear infinite; transform-origin: center;
}
.liveRangoli .rgRim.slow { stroke: var(--emerald); animation-duration: 70s; animation-direction: reverse; }
.liveRangoli.party { opacity: .3; }
@keyframes breathe { 50% { transform: scale(1.09) rotate(6deg); } }
@keyframes spin { to { transform: rotate(360deg); } }

.confetti { position: absolute; inset: 0; z-index: 5; pointer-events: none; width: 100%; height: 100%; }

/* ── chrome ──────────────────────────────────────────────────── */
.chrome {
  position: absolute; z-index: 7; left: 0; right: 0; top: 0;
  padding: calc(10px + var(--safe-t)) 14px 10px;
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(180deg, rgba(0, 0, 0, .35), transparent);
}
.viewport[data-theme='day'] .chrome { background: linear-gradient(180deg, rgba(255, 255, 255, .5), transparent); }
.mono {
  font-family: var(--font-display); font-style: italic; font-size: 17px;
  letter-spacing: .05em; color: var(--gold);
  display: inline-flex; align-items: center; gap: 5px;
}
.chromeBtns { display: flex; gap: 7px; }
.ic {
  width: 40px; height: 40px; border-radius: 50%;
  display: grid; place-items: center; cursor: pointer;
  background: var(--card); color: var(--ink);
  border: 1px solid var(--line); backdrop-filter: blur(8px);
  transition: transform .2s, color .2s, border-color .2s;
}
.ic:active { transform: scale(.9); }
.ic.on { color: var(--rose); border-color: var(--rose); box-shadow: 0 0 16px rgba(255, 46, 136, .5); }

/* act rail — bottom on phones, side on desktop */
.rail {
  position: absolute; z-index: 7; left: 0; right: 0; bottom: 0;
  padding: 8px 8px calc(8px + var(--safe-b));
  display: flex; gap: 4px; justify-content: center; align-items: center;
  background: linear-gradient(0deg, rgba(0, 0, 0, .45), transparent);
  overflow-x: auto; scrollbar-width: none;
}
.rail::-webkit-scrollbar { display: none; }
.railDot {
  flex: 0 0 auto; background: none; border: 0; cursor: pointer;
  padding: 8px 9px; min-height: 44px; color: var(--muted);
  font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase;
  border-bottom: 2px solid transparent; transition: color .3s, border-color .3s;
  font-family: inherit;
}
.railDot.on { color: var(--gold); border-bottom-color: var(--gold); }
.railFill { display: none; }

.ticker {
  position: absolute; z-index: 7; left: 0; right: 0; top: calc(58px + var(--safe-t));
  text-align: center; pointer-events: none;
  animation: tickIn .6s ease;
}
.ticker span { font-size: 15px; color: var(--gold); }
.ticker i {
  display: block; font-size: 10px; letter-spacing: .18em; text-transform: uppercase;
  color: var(--muted); font-style: normal; margin-top: 1px;
}
@keyframes tickIn { from { opacity: 0; transform: translateY(-6px); } }

/* ── act panels ──────────────────────────────────────────────── */
.panel {
  position: absolute; z-index: 4;
  left: 50%; top: 50%; translate: -50% -50%;
  width: min(92vw, 600px);
  max-width: calc(100vw - 22px);
  max-height: calc(100dvh - 176px);
  display: flex; flex-direction: column;
  will-change: transform, opacity;
}

/* text always sits on glass — never naked over the 3D */
.glass {
  display: flex; flex-direction: column; gap: 11px;
  flex: 0 1 auto; max-height: 100%; min-height: 0;
  padding: 18px 16px;
  border-radius: 22px;
  background: var(--glass);
  border: 1px solid var(--line);
  backdrop-filter: blur(18px) saturate(1.25);
  -webkit-backdrop-filter: blur(18px) saturate(1.25);
  box-shadow: 0 24px 70px rgba(0, 0, 0, .42), inset 0 1px 0 rgba(255, 255, 255, .08);
  overflow: hidden;
  min-height: 0;
}
.viewport[data-theme='day'] .beat,
.viewport[data-theme='day'] .ev,
.viewport[data-theme='day'] .pinCard,
.viewport[data-theme='day'] .foot { background: rgba(120, 80, 20, .06); }
.viewport[data-theme='day'] .glass { box-shadow: 0 20px 60px rgba(90, 50, 20, .18); }
.panel.center { text-align: center; align-items: center; }

.panel.center .flowWrap { position: relative; flex: 1 1 auto; min-height: 0; display: flex; }

.flow {
  flex: 1 1 auto; min-height: 0;
  overflow-y: auto;
  /* Keep this AUTO. The 'contain' value swallows the wheel and freezes
     the whole page; auto lets the scroll chain on to the journey. */
  overscroll-behavior-y: auto;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  scrollbar-width: thin;
  scrollbar-color: var(--line) transparent;
  padding-right: 6px;
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 12px, #000 calc(100% - 16px), transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0, #000 12px, #000 calc(100% - 16px), transparent 100%);
}
.flow::-webkit-scrollbar { width: 5px; }
.flow::-webkit-scrollbar-track { background: transparent; }
.flow::-webkit-scrollbar-thumb { background: var(--line); border-radius: 6px; }
.flow::-webkit-scrollbar-thumb:hover { background: var(--gold); }

.flowInner { display: flex; flex-direction: column; gap: 9px; padding-bottom: 10px; }

/* "there's more below" nudge */
.flowMore {
  position: absolute; left: 50%; bottom: -2px; translate: -50% 0;
  width: 30px; height: 30px; border-radius: 50%;
  display: grid; place-items: center; pointer-events: none;
  background: var(--glass); border: 1px solid var(--line); color: var(--gold);
  opacity: 0; transition: opacity .3s;
  animation: bob 2s ease-in-out infinite;
}
.flowMore.on { opacity: .9; }

.eyebrow { justify-content: center; }
.h2 { font-size: clamp(26px, 8vw, 46px); line-height: 1.08; letter-spacing: -.01em; }

.invok { font-size: clamp(11px, 3.4vw, 14px); color: var(--gold); letter-spacing: .04em; }
.names {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  gap: 8px; font-size: clamp(34px, 12vw, 78px); line-height: 1.02;
  transition: opacity .4s, transform .4s;
}
.names em { font-size: .5em; color: var(--rose); font-style: italic; }
.sub { font-size: clamp(13px, 4vw, 18px); color: var(--muted); }
.bigDate {
  font-size: clamp(24px, 8vw, 44px); color: var(--gold);
  letter-spacing: .1em; margin-top: 6px;
}
.muhurt { font-size: 12px; letter-spacing: .1em; color: var(--muted); text-transform: uppercase; }
.parents { font-size: 11.5px; opacity: .85; }

.shimmer {
  background: linear-gradient(108deg, var(--gold) 20%, #fff3c8 45%, var(--gold) 70%);
  background-size: 220% 100%; -webkit-background-clip: text; background-clip: text;
  color: transparent; animation: shim 5s ease-in-out infinite;
}
@keyframes shim { 0% { background-position: 130% 0; } 100% { background-position: -130% 0; } }

/* ── controls & cards ────────────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  min-height: 44px; padding: 11px 16px; border-radius: 999px;
  font-family: inherit; font-size: 13.5px; cursor: pointer;
  border: 1px solid var(--line); background: var(--card); color: var(--ink);
  backdrop-filter: blur(8px); transition: transform .18s, box-shadow .25s;
  text-decoration: none;
}
.btn:active { transform: scale(.96); }
.btn.solid {
  background: linear-gradient(120deg, var(--gold), var(--gold2));
  color: #241503; border-color: transparent; font-weight: 600;
  box-shadow: 0 10px 30px rgba(227, 179, 65, .3);
}
.cta { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 12px; transition: opacity .4s; }

.mode { display: flex; gap: 6px; }
.mode button {
  flex: 1; min-height: 44px; padding: 10px; border-radius: 12px; cursor: pointer;
  font-family: inherit; font-size: 12.5px;
  background: var(--card); border: 1px solid var(--line); color: var(--muted);
  transition: color .25s, border-color .25s;
}
.mode button.on { color: var(--gold); border-color: var(--gold); }

.beat, .ev, .pinCard, .foot {
  background: rgba(255, 255, 255, .045); border: 1px solid var(--line); border-radius: 14px;
  padding: 13px;
  animation: rise .55s cubic-bezier(.2, .9, .3, 1) both;
}
@keyframes rise { from { opacity: 0; transform: translateY(14px); } }
.beat h3, .ev h3, .pinCard h3 { font-size: 17px; margin: 3px 0 5px; }
.beat p, .ev p { font-size: 13.5px; }
.beat p { animation: fadeIn .45s ease; }
@keyframes fadeIn { from { opacity: 0; } }
.beatY { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--rose); }
.tag { font-family: var(--font-display); font-style: italic; font-size: 12.5px; color: var(--rose); }
.meta { font-size: 12px; color: var(--muted); }
.dress { font-size: 12px; color: var(--muted); margin-top: 4px; }
.dress b { color: var(--gold); }

.ev { display: flex; gap: 12px; align-items: flex-start; }
.evEmoji { font-size: 26px; line-height: 1; }
.evBody { flex: 1; min-width: 0; }
.evBtns { display: flex; gap: 6px; margin-top: 9px; flex-wrap: wrap; }
.evBtns .btn { min-height: 38px; padding: 8px 12px; font-size: 12px; }

.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  font-size: 11.5px; padding: 7px 11px; border-radius: 999px;
  border: 1px solid var(--line); color: var(--muted); background: var(--card);
}

.pinRow { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
.pinRow::-webkit-scrollbar { display: none; }
.pinChip {
  flex: 0 0 auto; min-height: 40px; padding: 9px 13px; border-radius: 999px; cursor: pointer;
  font-family: inherit; font-size: 12px; white-space: nowrap;
  background: var(--card); border: 1px solid var(--line); color: var(--muted);
  transition: color .25s, border-color .25s;
}
.pinChip.on { color: var(--gold); border-color: var(--gold); }
.note { font-size: 12px; color: var(--muted); display: flex; gap: 7px; align-items: flex-start; }

.foot { text-align: center; font-size: 12px; color: var(--muted); }
.foot .display { font-size: 19px; margin-bottom: 6px; }
.foot p + p { margin-top: 4px; }

.cue {
  position: absolute; z-index: 7; left: 50%; bottom: calc(64px + var(--safe-b));
  transform: translateX(-50%); text-align: center; color: var(--muted);
  animation: bob 2.2s ease-in-out infinite; pointer-events: none;
}
.cue span { display: block; font-family: var(--font-dev); font-size: 15px; color: var(--gold); }
.cue i { font-size: 10px; letter-spacing: .18em; text-transform: uppercase; font-style: normal; }
@keyframes bob { 50% { transform: translate(-50%, 8px); } }

/* ── larger screens: more room, rail moves to the side ───────── */
@media (min-width: 820px) {
  .panel {
    max-height: calc(100dvh - 150px);
    width: min(74vw, 620px);
    left: calc(50% - 68px);
  }
  .rail {
    left: auto; right: 14px; top: 50%; bottom: auto;
    transform: translateY(-50%); flex-direction: column;
    align-items: flex-end;
    background: none; padding: 0; gap: 1px;
    overflow: visible; max-width: 124px;
  }
  .railDot {
    border-bottom: 0; border-right: 2px solid transparent;
    text-align: right; white-space: nowrap;
    padding: 6px 9px 6px 4px; font-size: 9.5px; letter-spacing: .08em;
  }
  .railDot.on { border-right-color: var(--gold); }
  .ticker { top: auto; bottom: 22px; }
}

/* ── focus & motion ──────────────────────────────────────────── */
:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; border-radius: 6px; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   THE ANTARPAT — the one element everyone loved, kept intact.
   Two silk halves that part on scroll, with woven texture, gold border,
   tassels and self-drawing embroidery.
   ═══════════════════════════════════════════════════════════════════ */
.curtain { position: absolute; inset: 0; z-index: 8; pointer-events: none; overflow: hidden; }
.cloth {
  position: absolute; top: 0; bottom: 0; width: 51%;
  background:
    repeating-linear-gradient(90deg, rgba(255,255,255,.04) 0 2px, transparent 2px 5px),
    linear-gradient(160deg, #8e2440, #5d1229 45%, #7c1f38);
  box-shadow: inset 0 0 90px rgba(0,0,0,.55);
  will-change: transform;
}
.cloth.L { left: 0; border-right: 3px solid var(--gold); }
.cloth.R { right: 0; border-left: 3px solid var(--gold); }
.cloth::after {
  content: ''; position: absolute; inset: 8px;
  border: 1px solid rgba(227,179,65,.35); border-radius: 3px;
}
.tassels { position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-around; }
.tassels i {
  width: 3px; height: 26px; border-radius: 0 0 3px 3px;
  background: linear-gradient(180deg, var(--gold), transparent);
  animation: sway 3.4s ease-in-out infinite;
}
.tassels i:nth-child(2n) { animation-delay: .5s; height: 20px; }
.tassels i:nth-child(3n) { animation-delay: 1s; height: 30px; }
@keyframes sway { 50% { transform: rotate(5deg); } }

.embroid { position: absolute; left: 4%; right: 4%; bottom: 34px; height: 26px; opacity: .9; }
.embroid path {
  stroke: var(--gold2); fill: none; stroke-width: 1.3; stroke-linecap: round;
  stroke-dasharray: 1; stroke-dashoffset: 1; animation: emb 2.4s .4s ease forwards;
}
@keyframes emb { to { stroke-dashoffset: 0; } }

.clothText {
  position: absolute; inset: 0; display: grid; place-items: center;
  text-align: center; padding: 20px;
}
.clothText .big { font-size: clamp(20px, 6.4vw, 40px); color: var(--gold2); line-height: 1.25; }
.clothText .small {
  font-size: 11px; letter-spacing: .16em; text-transform: uppercase;
  color: rgba(244,234,214,.72); margin-top: 10px;
}

/* ═══════════════════════════════════════════════════════════════════
   Reused feature components (countdown, guide, RSVP, blessings)
   ═══════════════════════════════════════════════════════════════════ */
.card {
  background: var(--card); border: 1px solid var(--line); border-radius: 16px;
  padding: 14px; backdrop-filter: blur(10px);
}
.lede { font-size: 13.5px; color: var(--muted); }
.goldtxt { color: var(--gold); }

.count { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.tile {
  background: var(--card); border: 1px solid var(--line); border-radius: 14px;
  padding: 10px 4px; text-align: center;
}
.tile b {
  display: block; font-family: var(--font-display); font-weight: 500;
  font-size: clamp(20px, 7vw, 34px); color: var(--gold); line-height: 1.05;
}
.tile span { font-size: 9.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.humor { font-family: var(--font-display); font-style: italic; font-size: 12.5px; color: var(--muted); text-align: center; }

.tabs { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
.tabs::-webkit-scrollbar { display: none; }
.tabs button {
  flex: 0 0 auto; min-height: 40px; padding: 9px 13px; border-radius: 999px; cursor: pointer;
  font-family: inherit; font-size: 12px; white-space: nowrap;
  background: var(--card); border: 1px solid var(--line); color: var(--muted);
}
.tabs button.on { color: var(--gold); border-color: var(--gold); }
.guideRow { display: flex; gap: 9px; padding: 9px 0; border-bottom: 1px dashed var(--line); font-size: 13px; }
.guideRow:last-child { border-bottom: 0; }
.guideRow b { color: var(--gold); font-weight: 500; }

.vibes { display: flex; flex-direction: column; gap: 7px; }
.vibe {
  display: grid; grid-template-columns: auto 1fr auto; align-items: center;
  column-gap: 11px; row-gap: 1px; text-align: left; width: 100%;
  min-height: 56px; padding: 11px 13px; border-radius: 14px; cursor: pointer;
  font-family: inherit;
  background: rgba(255, 255, 255, .045); border: 1px solid var(--line); color: var(--ink);
  transition: border-color .22s, background .22s, transform .14s;
}
.viewport[data-theme='day'] .vibe { background: rgba(120, 80, 20, .06); }
.vibe:active { transform: scale(.985); }
.vibe.on { border-color: var(--gold); background: rgba(227, 179, 65, .1); }
.vibe .ve { grid-row: 1 / 3; font-size: 22px; line-height: 1; }
.vibe h4 { grid-column: 2; font-size: 14.5px; font-weight: 400; }
.vibe p { grid-column: 2; font-size: 12px; color: var(--muted); line-height: 1.35; }
.vibe .tick { grid-column: 3; grid-row: 1 / 3; color: var(--emerald); opacity: 0; transition: opacity .2s; }
.vibe.on .tick { opacity: 1; }

.field { display: flex; flex-direction: column; gap: 5px; }
.field > span { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
.input {
  width: 100%; min-height: 46px; padding: 12px 14px; border-radius: 12px;
  background: var(--card); border: 1px solid var(--line); color: var(--ink);
  font-family: inherit; font-size: 16px; /* 16px keeps iOS from zooming */
}
.input:focus { outline: none; border-color: var(--gold); }
.formRow { display: flex; gap: 8px; flex-wrap: wrap; }
.step { display: flex; align-items: center; gap: 4px; }
.step button {
  width: 44px; height: 44px; border-radius: 12px; cursor: pointer;
  background: var(--card); border: 1px solid var(--line); color: var(--ink);
  display: grid; place-items: center;
}
.step b { min-width: 38px; text-align: center; font-family: var(--font-display); font-size: 19px; }
.seg { display: flex; gap: 5px; flex-wrap: wrap; }
.seg button {
  flex: 1 1 auto; min-height: 42px; padding: 9px 11px; border-radius: 11px; cursor: pointer;
  font-family: inherit; font-size: 12px;
  background: var(--card); border: 1px solid var(--line); color: var(--muted);
}
.seg button.on { color: var(--gold); border-color: var(--gold); }

.confirm { text-align: center; }
.confRing {
  width: 72px; height: 72px; margin: 0 auto 14px; border-radius: 50%;
  border: 2px solid var(--emerald); display: grid; place-items: center; color: var(--emerald);
  box-shadow: 0 0 36px rgba(35,192,143,.4); animation: ringPop .7s cubic-bezier(.2,.9,.2,1.4);
}
@keyframes ringPop { from { transform: scale(.5); opacity: 0; } }
.meter { font-size: 12px; color: var(--muted); }
.privacyNote { font-size: 10.5px; color: var(--muted); opacity: .8; display: flex; gap: 6px; align-items: flex-start; }

.emos { display: flex; gap: 6px; flex-wrap: wrap; }
.emos button {
  min-width: 44px; min-height: 44px; border-radius: 12px; cursor: pointer; font-size: 19px;
  background: var(--card); border: 1px solid var(--line);
}
.wall { display: flex; flex-direction: column; gap: 8px; }
.bless {
  background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 12px;
  animation: rise .5s ease both;
}
.bless p { font-family: var(--font-display); font-size: 14.5px; line-height: 1.5; }
.bless b { display: block; margin-top: 6px; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--gold); font-weight: 400; }

/* ── hero: Akshay → family → weds → Shraddha → family ─────────── */
.couple { display: flex; flex-direction: column; gap: 12px; width: 100%; transition: opacity .4s; }
.side { display: flex; flex-direction: column; gap: 2px; }
.one {
  font-size: clamp(38px, 13vw, 76px); line-height: 1.0; letter-spacing: -.015em;
}
.oneDev { font-size: clamp(15px, 4.6vw, 22px); color: var(--muted); margin-top: 1px; }
.fam { font-size: clamp(11px, 3.1vw, 13px); color: var(--muted); line-height: 1.5; }
.fam.dim { opacity: .72; }

.weds { display: flex; align-items: center; gap: 12px; justify-content: center; margin: 2px 0; }
.weds em {
  font-style: italic; font-size: clamp(15px, 4.4vw, 21px);
  color: var(--rose); letter-spacing: .04em;
}
.wline { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--line), transparent); }

.venueLine { font-size: 12.5px; color: var(--ink); opacity: .9; }

/* ── parivar act ─────────────────────────────────────────────── */
.famCard {
  background: rgba(255, 255, 255, .045); border: 1px solid var(--line);
  border-radius: 14px; padding: 13px;
}
.viewport[data-theme='day'] .famCard { background: rgba(120, 80, 20, .06); }
.famTag {
  font-size: 9.5px; letter-spacing: .2em; text-transform: uppercase; color: var(--rose);
}
.famCard h3 { font-size: 18px; margin: 4px 0 6px; }
.famCard p { font-size: 13px; color: var(--muted); }
.famCard p.dim { opacity: .75; margin-top: 3px; }
.famJoin {
  text-align: center; font-family: var(--font-display); font-style: italic;
  font-size: 13px; color: var(--gold); padding: 4px 0;
}
.ritualLead {
  font-size: 10px; letter-spacing: .2em; text-transform: uppercase;
  color: var(--muted); margin-top: 4px;
}

/* ── no gifts ────────────────────────────────────────────────── */
.giftCard {
  text-align: center; padding: 16px 14px; border-radius: 16px;
  border: 1px solid var(--gold); color: var(--gold);
  background: linear-gradient(160deg, rgba(227, 179, 65, .12), rgba(227, 179, 65, .03));
}
.giftCard h3 { font-size: 19px; margin: 7px 0 5px; color: var(--gold); }
.giftCard p { font-size: 12.5px; color: var(--ink); opacity: .85; }
.giftFoot { color: var(--gold); font-family: var(--font-display); font-style: italic; font-size: 13px; }

/* ═══════════════════════════════════════════════════════════════════
   LIVE CEREMONY — the muhurat, for guests joining from afar
   ═══════════════════════════════════════════════════════════════════ */
.liveBar {
  position: absolute; z-index: 9; left: 10px; right: 10px;
  top: calc(58px + var(--safe-t));
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px 9px 12px; border-radius: 14px;
  background: var(--glass); border: 1px solid var(--gold);
  backdrop-filter: blur(14px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, .4);
  animation: rise .5s ease both;
}
.livePulse {
  width: 8px; height: 8px; border-radius: 50%; background: var(--rose); flex: 0 0 auto;
  box-shadow: 0 0 0 0 var(--rose); animation: pulseDot 1.8s infinite;
}
@keyframes pulseDot {
  70% { box-shadow: 0 0 0 9px rgba(255, 93, 143, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 93, 143, 0); }
}
.liveBarTxt { flex: 1; min-width: 0; line-height: 1.25; }
.liveBarTxt b { display: block; font-size: 12.5px; color: var(--ink); }
.liveBarTxt i { font-size: 10.5px; font-style: normal; color: var(--muted); }
.btn.tiny { min-height: 36px; padding: 8px 12px; font-size: 12px; flex: 0 0 auto; }
.liveX {
  background: none; border: 0; color: var(--muted); cursor: pointer;
  padding: 6px; display: grid; place-items: center;
}

.liveWrap {
  position: absolute; inset: 0; z-index: 10;
  display: grid; place-items: center; padding: 20px;
  background: radial-gradient(circle at 50% 42%, rgba(60, 12, 40, .84), rgba(6, 8, 22, .96));
  backdrop-filter: blur(10px);
  animation: fadeIn .5s ease;
}
.liveClose {
  position: absolute; top: calc(12px + var(--safe-t)); right: 14px;
  width: 40px; height: 40px; border-radius: 50%; cursor: pointer;
  background: var(--card); border: 1px solid var(--line); color: var(--ink);
  display: grid; place-items: center;
}
.liveInner { text-align: center; max-width: 460px; width: 100%; }
.liveEyebrow {
  font-size: 10px; letter-spacing: .22em; text-transform: uppercase; color: var(--rose);
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.liveClock {
  font-size: clamp(52px, 20vw, 96px); color: var(--gold); line-height: 1;
  letter-spacing: .02em; margin: 10px 0;
}
.liveTitle { font-size: clamp(26px, 9vw, 46px); color: var(--gold2); margin: 8px 0 4px; }
.liveSub { font-size: 13.5px; color: var(--ink); opacity: .9; margin-bottom: 20px; }

.akshataBtn {
  width: 100%; padding: 20px 16px; border-radius: 22px; cursor: pointer;
  font-family: inherit; color: #2a1704;
  background: radial-gradient(circle at 50% 0%, #ffe9a8, var(--gold) 70%);
  border: 0; box-shadow: 0 16px 44px rgba(227, 179, 65, .42);
  transition: transform .09s ease, box-shadow .2s;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  animation: breathe 2.6s ease-in-out infinite;
}
.akshataBtn:active { transform: scale(.955); box-shadow: 0 8px 24px rgba(227, 179, 65, .5); }
.akshataGrain { font-size: 30px; line-height: 1; }
.akshataBtn b { font-size: 19px; font-weight: 600; }
.akshataBtn i { font-size: 11.5px; font-style: normal; opacity: .8; }

.liveCounts { display: flex; justify-content: center; gap: 22px; margin: 20px 0 14px; flex-wrap: wrap; }
.liveCounts div { display: flex; flex-direction: column; }
.liveCounts b { font-family: var(--font-display); font-size: 28px; color: var(--gold); line-height: 1.1; }
.liveCounts span { font-size: 9.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.liveNote {
  font-size: 11.5px; color: var(--muted);
  display: flex; align-items: center; justify-content: center; gap: 6px;
}

@media (min-width: 820px) {
  .liveBar { left: auto; right: 150px; width: 380px; top: 16px; }
}

`;

/* ── lib/config.js ─────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════
   ✏️  EDIT ME — every name, date, venue and phone number lives here.
   Only real, confirmed details. Nothing invented.
   ═══════════════════════════════════════════════════════════════════ */

const CONFIG = {
  groom: {
    en: "Akshay", dev: "अक्षय", kan: "ಅಕ್ಷಯ್", surname: "Bankapure",
    family: "Bankapure parivaar",
    parents: "Son of Smt. Rupali Bankapure & Late Shri Ashok Bankapure",
    siblings: "Brother of Nishchay, Shweta (Pramod Khot) & Divya (Sharad Tirth)",
  },
  bride: {
    en: "Shraddha", dev: "श्रद्धा", kan: "ಶ್ರದ್ಧಾ", surname: "Sangave",
    family: "Sangave parivaar",
    // ✏️ TODO: append " & Late Smt. ______ Sangave" once the name is confirmed
    parents: "Daughter of Shri Babaso Sangave",
    siblings: "",
  },

  /* Heavenly blessings — footer. ✏️ TODO: add Shraddha's late aai here,
     format: "कै. सौ. ______ सांगवे · Late Smt. ______ Sangave" */
  remembrance: ["कै. श्री. अशोक बंकापुरे · Late Shri Ashok Bankapure"],
  familiesLine: "Bankapure · Magadum · Khot · Tirth  ×  Sangave",
  hashtag: "#AkshayWedsShraddha",

  /* ✏️ TODO: replace with the real muhurat once the panchang is set. */
  weddingISO: "2026-08-09T11:47:00+05:30",
  muhurtLabel: "Shubh Muhurat · 11:47 AM",

  venue: {
    name: "Smt. Malini Patil Bhavan",
    area: "Gavani, Belagavi district, Karnataka 591237",
    maps: "https://maps.app.goo.gl/GxjJJJymxGeagx9YA",
    q: "SMT. MALINI PATIL BHAVAN Gavani Karnataka",
    /* From the venue itself — genuinely useful for guests */
    note: "On a hill with ample parking. Dining hall on the ground floor, main hall one floor up.",
  },
  city: "Gavani, Belagavi",

  /* ✏️ TODO: real number before sending this out. */
  contact: "RSVP · +91 98XXX XXXXX (Nishchay Bankapure)",

  giftNote: "Your presence is the gift.",
  giftSub: "No gifts, please — we mean it. Come, eat well, bless us, dance a little.",
};

/* One day. Only the rituals that matter. */
const EVENTS = [
  {
    id: "haldi", emoji: "🪔", title: "Haldi",
    tag: "Turmeric, laughter, ruined clothes",
    date: "2026-08-09", start: "09:00", end: "10:30",
    place: "Smt. Malini Patil Bhavan",
    dress: "Something you're happy to sacrifice to haldi. Yellow earns bonus points.",
  },
  {
    id: "vivah", emoji: "💍", title: "Vivah Sohala",
    tag: "The antarpat drops. This is the one.",
    date: "2026-08-09", start: "11:00", end: "12:30",
    place: "Smt. Malini Patil Bhavan · Main hall (first floor)",
    dress: "Sarees & kurtas. Nauvari and saaj always welcome.",
  },
  {
    id: "bhojan", emoji: "🍛", title: "Bhojan",
    tag: "Lunch at the venue. Come hungry.",
    date: "2026-08-09", start: "12:30", end: "15:00",
    place: "Smt. Malini Patil Bhavan · Dining hall (ground floor)",
    dress: "Loose. Trust us.",
  },
];

/* The rituals of the day, in order. */
const RITUAL_CHIPS = [
  "Haldi", "Ganesh Puja", "Antarpat", "Mangalashtak", "Saat Phere", "Aashirwad", "Bhojan",
];

/* Bilingual phrases — each shown with its meaning, never as wordplay.
   mr = Marathi · kn = Kannada */
const PHRASES = [
  { txt: "सुस्वागतम्", lang: "mr", mean: "welcome" },
  { txt: "ಸುಸ್ವಾಗತ", lang: "kn", mean: "welcome" },
  { txt: "हळू हळू", lang: "mr", mean: "slowly, slowly" },
  { txt: "येता का मग?", lang: "mr", mean: "so, you're coming?" },
  { txt: "ಬನ್ನಿ", lang: "kn", mean: "do come" },
  { txt: "जेवण झालं का?", lang: "mr", mean: "have you eaten?" },
  { txt: "ಊಟ ಆಯ್ತಾ?", lang: "kn", mean: "have you eaten?" },
  { txt: "शुभमंगल सावधान", lang: "mr", mean: "the auspicious moment — be present" },
];

const VIBES = [
  { id: "yes", emoji: "🙌", title: "Yes, all of it", sub: "Haldi, phere, bhojan. The full day." },
  { id: "vivah", emoji: "💍", title: "Vivah & bhojan", sub: "There for the muhurat and lunch." },
  { id: "short", emoji: "🌸", title: "Blessings, then off", sub: "In, blessed, photographed, gone." },
  { id: "afar", emoji: "💛", title: "Wishing from afar", sub: "Can't travel — sending love and blessings." },
];

const MEALS = ["Jain (no kanda-lasun)", "Regular veg"];

const SEED_BLESSINGS = [
  { id: "s1", txt: "Two families, one very happy day. Blessings to you both. 🪔", who: "Bankapure kaka" },
  { id: "s2", txt: "सुखी संसार होवो! 🌸", who: "Sangave aatya" },
  { id: "s3", txt: "See you on the hill in Gavani. Save us a seat near the food. 🍛", who: "Pune cousins" },
];

const PINS = [
  { id: "venue", label: "Smt. Malini Patil Bhavan", km: "Gavani · the whole day happens here",
    q: "SMT. MALINI PATIL BHAVAN Gavani Karnataka",
    note: "On a hill, ample parking. Dining hall downstairs, main hall upstairs." },
  { id: "ixg", label: "Belagavi Airport (IXG)", km: "Nearest airport", q: "Belagavi Airport IXG" },
  { id: "kop", label: "Kolhapur", km: "Nearest big city on the Maharashtra side", q: "Kolhapur Maharashtra" },
  { id: "nippani", label: "Nippani", km: "Closest town for last-minute anything", q: "Nippani Karnataka" },
];

const GUIDE = {
  pravaas: [
    ["Fly", "Belagavi Airport (IXG) is the nearest. Kolhapur airport also works."],
    ["Train", "Ghataprabha / Kudchi and Miraj are the usable railheads; road the rest of the way."],
    ["Drive", "Right off the Pune–Bengaluru NH-48 corridor, near Nippani. Easiest way in."],
    ["At the venue", "It's up a hill — there's plenty of parking at the top."],
  ],
  pehnava: [
    ["Haldi", "Old clothes. Turmeric does not negotiate."],
    ["Vivah", "Sarees & kurtas. Nauvari and Kolhapuri saaj always look right."],
    ["Weather", "August in this belt means sudden rain. Umbrella in the bag, chappals with grip."],
  ],
  khaana: [
    ["Bhojan", "Lunch is served at the venue, ground floor. Pure veg."],
    ["Jain thali", "Available — just mark it in your RSVP so the kitchen knows."],
    ["Belagavi Kunda", "If you're passing through Belagavi, buy some. Thank us later."],
  ],
  insider: [
    ["Stairs", "Main hall is one floor up. Tell us in advance if anyone needs help with stairs."],
    ["Halu halu", "Means 'slowly' in both Marathi and Kannada. The day's only speed limit."],
    ["No gifts", "Genuinely. Your presence is the whole gift."],
  ],
};

/* The acts of the single continuous flight. */
const ACTS = [
  { id: "antarpat", label: "Antarpat", sub: "the curtain" },
  { id: "parivar", label: "Parivar", sub: "the families" },
  { id: "muhurat", label: "Muhurat", sub: "the day" },
  { id: "rasta", label: "Rasta", sub: "getting there" },
  { id: "yeta", label: "Yeta ka?", sub: "rsvp" },
  { id: "ashirwad", label: "Ashirwad", sub: "blessings" },
];
/* ── lib/helpers.js ─────────────────────────── */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad2 = (n) => String(n).padStart(2, "0");
const DAYNAME = { "2026-08-07": "Friday", "2026-08-08": "Saturday", "2026-08-09": "Sunday" };
const prettyDate = (d) => `${DAYNAME[d] || ""} · ${d.slice(8)} Aug`;
const to12h = (t) => { const [h, m] = t.split(":").map(Number); const ap = h >= 12 ? "PM" : "AM"; return `${((h + 11) % 12) + 1}:${pad2(m)} ${ap}`; };

/* fx bus — the petal canvas registers a burst() so any component can
   throw akshata + marigolds from a screen point. */
const fx = { burst: null };
/* ── lib/calendar.js ─────────────────────────── */
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
/* ── lib/store.js ─────────────────────────── */
/* Persistence adapter. Talks to the built-in /api/kv route (a JSON file
   on the server — perfect for local dev and any Node host). If the API is
   unreachable (e.g. a static export), it degrades to in-memory so the UI
   keeps working. Swap the fetch calls for Supabase later without touching
   any component. */
const mem = new Map();

const store = {
  async get(key, fallback) {
    try {
      const r = await fetch(`/api/kv?key=${encodeURIComponent(key)}`, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      if (j.value === null || j.value === undefined)
        return mem.has(key) ? mem.get(key) : fallback;
      return j.value;
    } catch {
      return mem.has(key) ? mem.get(key) : fallback;
    }
  },
  async set(key, value) {
    mem.set(key, value);
    try {
      await fetch("/api/kv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
    } catch { /* offline / static export — in-memory only */ }
  },
};
/* ── lib/ambience.js ─────────────────────────── */
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
/* ── components/stage/Stage3D.jsx ─────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════
   THE WORLD  —  art direction notes
   ───────────────────────────────────────────────────────────────────
   Six dioramas stacked down the Y axis; one camera flies through them.
   The rules that keep it looking composed rather than "programmer art":

   1. NOTHING sits closer to the camera than z = -4. All content lives
      behind the glass panels, never in front of the text.
   2. No solid primitives pretending to be objects (no box-with-wheels).
      Landforms are layered paper-cut silhouettes; props are either
      elegant lathe/torus forms or pure light.
   3. Everything warm is emissive, so it never renders as a grey blob
      when a light misses it.
   4. Each zone has a framing offset so the camera composes it, instead
      of flying through the middle of the geometry.

   All geometry is procedural — zero external models, zero textures.
   Three.js is MIT. (To drop in real CC0 miniatures, see ARCHITECTURE.md
   — the GLTF slot is already wired in the Next.js project.)
   ═══════════════════════════════════════════════════════════════════ */

const GAP = 20;
const ZONES = 6;
const DEPTH = GAP * (ZONES - 1);

function radialTex(inner, mid) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d");
  const rg = g.createRadialGradient(64, 64, 2, 64, 64, 62);
  rg.addColorStop(0, `rgba(${inner},1)`);
  rg.addColorStop(.35, `rgba(${mid},.55)`);
  rg.addColorStop(1, `rgba(${mid},0)`);
  g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* soft petal silhouette, drawn once and reused as a sprite */
function petalTex() {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 0, 64);
  grd.addColorStop(0, "rgba(255,196,92,.95)");
  grd.addColorStop(1, "rgba(240,116,26,.65)");
  g.fillStyle = grd;
  g.beginPath();
  g.ellipse(32, 32, 26, 13, 0, 0, Math.PI * 2);
  g.fill();
  return new THREE.CanvasTexture(c);
}

const SKY_VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
/* A calm vertical gradient with a slow drifting bloom — no noisy static. */
const SKY_FRAG = `
precision mediump float; varying vec2 vUv;
uniform float uT, uAmp; uniform vec3 uTop, uBot, uGlow;
void main(){
  float g = smoothstep(0., 1., vUv.y);
  vec3 col = mix(uBot, uTop, g);
  vec2 c = vec2(.5 + sin(uT*.06)*.16, .42 + cos(uT*.05)*.12);
  float bloom = pow(1. - clamp(distance(vUv, c)*1.6, 0., 1.), 3.);
  col = mix(col, uGlow, bloom * .55);
  gl_FragColor = vec4(col, uAmp);
}`;

/* ── props ──────────────────────────────────────────────────────── */

function makeKalash(gold, bright) {
  const g = new THREE.Group();
  const prof = [[.02,0],[.5,.03],[.68,.2],[.74,.46],[.66,.7],[.44,.86],[.3,.94],[.27,1.05],[.4,1.12],[.44,1.18],[.31,1.22]]
    .map(p => new THREE.Vector2(p[0], p[1]));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 64), gold));
  const band = new THREE.Mesh(new THREE.TorusGeometry(.285, .022, 12, 48), bright);
  band.rotation.x = Math.PI / 2; band.position.y = .99; g.add(band);
  const coco = new THREE.Mesh(new THREE.SphereGeometry(.23, 28, 20),
    new THREE.MeshStandardMaterial({ color: 0x7a5533, roughness: .85, metalness: .05 }));
  coco.scale.set(1, 1.12, 1); coco.position.y = 1.35; g.add(coco);
  const ls = new THREE.Shape();
  ls.moveTo(0, 0); ls.quadraticCurveTo(.11, .2, 0, .5); ls.quadraticCurveTo(-.11, .2, 0, 0);
  const lg = new THREE.ShapeGeometry(ls);
  const lm = new THREE.MeshStandardMaterial({
    color: 0x2fa877, roughness: .5, side: THREE.DoubleSide,
    emissive: 0x0d3d2a, emissiveIntensity: .6,
  });
  for (let i = 0; i < 7; i++) {
    const pv = new THREE.Group(); pv.rotation.y = (i / 7) * Math.PI * 2;
    const lf = new THREE.Mesh(lg, lm);
    lf.position.set(.26, 1.12, 0); lf.rotation.set(0, Math.PI / 2, -1.0);
    pv.add(lf); g.add(pv);
  }
  return g;
}

/* Layered paper-cut ridges. Reads as intentional illustration at any
   distance — the opposite of a bare cone. */
function ridgeLayer(width, height, seed, color, y, z, opacity) {
  const shape = new THREE.Shape();
  const steps = 40;
  shape.moveTo(-width / 2, -6);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, x = -width / 2 + t * width;
    const h = Math.sin(t * Math.PI * 2.2 + seed) * .5 + Math.sin(t * Math.PI * 5.7 + seed * 2) * .28 + Math.sin(t * Math.PI * 11 + seed) * .12;
    shape.lineTo(x, h * height);
  }
  shape.lineTo(width / 2, -6);
  shape.closePath();
  const m = new THREE.Mesh(new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
  m.position.set(0, y, z);
  return m;
}

function makeMandap(gold, bright) {
  const g = new THREE.Group();
  const pillar = new THREE.CylinderGeometry(.13, .17, 5, 20);
  const pts = [[-2.6, -1.4], [2.6, -1.4], [-2.6, 2.2], [2.6, 2.2]];
  pts.forEach(([x, z]) => {
    const p = new THREE.Mesh(pillar, gold); p.position.set(x, -.8, z - 2); g.add(p);
    const k = new THREE.Mesh(new THREE.SphereGeometry(.2, 20, 14), bright);
    k.position.set(x, 1.85, z - 2); g.add(k);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.28, .34, .22, 20), bright);
    base.position.set(x, -3.25, z - 2); g.add(base);
  });
  // draped canopy: four gentle catenary swags instead of a hard cone
  const swagMat = new THREE.MeshStandardMaterial({
    color: 0x8f2545, roughness: .85, side: THREE.DoubleSide,
    emissive: 0x3d0d1d, emissiveIntensity: .5,
  });
  [[[-2.6, -1.4], [2.6, -1.4]], [[-2.6, 2.2], [2.6, 2.2]],
   [[-2.6, -1.4], [-2.6, 2.2]], [[2.6, -1.4], [2.6, 2.2]]].forEach(([a, b]) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(a[0], 1.85, a[1] - 2),
      new THREE.Vector3((a[0] + b[0]) / 2, 1.15, (a[1] + b[1]) / 2 - 2),
      new THREE.Vector3(b[0], 1.85, b[1] - 2),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 28, .11, 10), swagMat));
  });
  return g;
}

function Stage3D({ prog, theme, reduced, party }) {
  const hostRef = useRef(null);
  const pRef = useRef(prog); pRef.current = prog;
  const partyRef = useRef(party); partyRef.current = party;
  const apiRef = useRef(null);
  const [ok, setOk] = useState(true);

  useEffect(() => {
    const host = hostRef.current; if (!host) return;
    let R;
    try { R = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
    catch { setOk(false); return; }

    const small = window.innerWidth < 700;
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.6 : 2));
    R.outputEncoding = THREE.sRGBEncoding;
    R.toneMapping = THREE.ACESFilmicToneMapping;
    R.toneMappingExposure = 1.05;
    R.setClearColor(0x000000, 0);
    host.appendChild(R.domElement);
    Object.assign(R.domElement.style, { width: "100%", height: "100%", display: "block" });

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0e24, 16, 46);
    const cam = new THREE.PerspectiveCamera(46, 1, .1, 90);

    /* lighting: warm key, cool rim, soft sky/ground fill.
       Nothing in the scene can fall to flat grey. */
    const hemi = new THREE.HemisphereLight(0xffe0b0, 0x2a1a3a, .75);
    const key = new THREE.DirectionalLight(0xffd08a, 1.35); key.position.set(4, 7, 6);
    const rim = new THREE.DirectionalLight(0x9ec4ff, .75); rim.position.set(-5, 2, -4);
    scene.add(hemi, key, rim);

    const sky = new THREE.Mesh(new THREE.PlaneGeometry(120, 70), new THREE.ShaderMaterial({
      vertexShader: SKY_VERT, fragmentShader: SKY_FRAG,
      depthWrite: false, transparent: true,
      uniforms: {
        uT: { value: 0 }, uAmp: { value: 1 },
        uTop: { value: new THREE.Color(0x0a0e24) },
        uBot: { value: new THREE.Color(0x2a1330) },
        uGlow: { value: new THREE.Color(0x7c1f38) },
      },
    }));
    sky.position.z = -34; cam.add(sky); scene.add(cam);

    const glowT = radialTex("255,222,160", "255,150,60");
    const petT = petalTex();

    const gold = new THREE.MeshStandardMaterial({
      color: 0xe8b84b, metalness: .95, roughness: .26,
      emissive: 0x3a2408, emissiveIntensity: .55,
    });
    const bright = new THREE.MeshStandardMaterial({
      color: 0xf9d97e, metalness: .9, roughness: .18,
      emissive: 0x4a3210, emissiveIntensity: .7,
    });

    const zones = [];
    const addZone = (i, build) => {
      const g = new THREE.Group();
      g.position.y = -i * GAP;
      build(g);
      scene.add(g); zones.push(g); return g;
    };

    const softGlow = (x, y, z, s, color, op = .8) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowT, transparent: true, blending: THREE.AdditiveBlending,
        depthWrite: false, color, opacity: op,
      }));
      sp.position.set(x, y, z); sp.scale.setScalar(s); return sp;
    };

    /* ── 0 · Antarpat: the kalash, haloed, with a hanging toran ── */
    addZone(0, (g) => {
      const k = makeKalash(gold, bright);
      k.position.set(0, -2.4, -6); k.scale.setScalar(1.7);
      g.add(k);
      g.userData.kalash = k;
      const halos = [1.5, 2.0, 2.6].map((r, i) => {
        const m = new THREE.Mesh(new THREE.TorusGeometry(r, .008, 8, 96),
          new THREE.MeshBasicMaterial({ color: 0xf9d97e, transparent: true, opacity: .32 - i * .06, depthWrite: false, blending: THREE.AdditiveBlending }));
        m.position.set(0, -1.2, -6.4); m.rotation.x = 1.15 + i * .06;
        g.add(m); return m;
      });
      g.userData.halos = halos;
      g.add(softGlow(0, -1.4, -6.6, 9, 0xffb066, .55));
      // toran swag across the top
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-7, 3.4, -8), new THREE.Vector3(0, 1.9, -8), new THREE.Vector3(7, 3.4, -8),
      ]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, .015, 6),
        new THREE.MeshBasicMaterial({ color: 0xb8891f })));
      const buds = [];
      for (let i = 0; i <= 22; i++) {
        const p = curve.getPointAt(i / 22);
        const b = softGlow(p.x, p.y - .22, p.z, .78, i % 2 ? 0xffa53d : 0xffd166, .95);
        g.add(b); buds.push(b);
      }
      g.userData.buds = buds;
    });

    /* ── 1 · Katha: a constellation, orbs joined by light ── */
    addZone(1, (g) => {
      const orbs = [];
      const pts = [];
      for (let i = 0; i < 22; i++) {
        const a = i * 2.4, r = 2 + (i % 5) * .95;
        const v = new THREE.Vector3(Math.cos(a) * r * 1.5, Math.sin(a * .7) * 4.2, -15 + Math.sin(a) * 3);
        pts.push(v);
        const s = softGlow(v.x, v.y, v.z, .5 + (i % 3) * .22,
          [0xffd166, 0xff8fb0, 0x8fe6c4][i % 3], .9);
        g.add(s); orbs.push(s);
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      g.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({
        color: 0xe8b84b, transparent: true, opacity: .12,
      })));
      g.userData.orbs = orbs;
    });

    /* ── 2 · Muhurat: six lanterns in a slow carousel ── */
    addZone(2, (g) => {
      const ring = new THREE.Group();
      const body = new THREE.CylinderGeometry(.2, .26, .5, 16);
      const capG = new THREE.ConeGeometry(.22, .16, 16);
      const capM = new THREE.MeshStandardMaterial({ color: 0x6b2410, roughness: .7, metalness: .2 });
      const tints = [0xff9b4d, 0xffd166, 0xff6f9c, 0x4fd6a8, 0xffa53d, 0xf9d97e];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const L = new THREE.Group();
        L.add(new THREE.Mesh(body, new THREE.MeshStandardMaterial({
          color: 0xd8622a, emissive: tints[i], emissiveIntensity: 1.5,
          roughness: .55, transparent: true, opacity: .96,
        })));
        const c = new THREE.Mesh(capG, capM); c.position.y = .32; L.add(c);
        L.add(softGlow(0, 0, 0, 2.1, tints[i], .75));
        L.position.set(Math.cos(a) * 4.4, Math.sin(a * 2) * .8, -14 + Math.sin(a) * 3);
        L.userData.ph = i * 1.05;
        ring.add(L);
      }
      g.add(ring); g.userData.ring = ring;
    });

    /* ── 3 · Rasta: paper-cut ridges + a glowing river ── */
    addZone(3, (g) => {
      const bands = [
        [40, 3.0, 1.1, 0x0e3328, -4.2, -26, .8],
        [34, 2.5, 2.7, 0x123f31, -4.8, -22, .72],
        [28, 2.0, 4.3, 0x17503d, -5.4, -18, .6],
      ];
      bands.forEach(([w, h, s, c, y, z, o]) => g.add(ridgeLayer(w, h, s, c, y, z, o)));
      // river: a wide flat ribbon of light, not a tube
      const riverShape = new THREE.Shape();
      riverShape.moveTo(-16, -.55); riverShape.lineTo(16, -.9);
      riverShape.lineTo(16, .9); riverShape.lineTo(-16, .55);
      const river = new THREE.Mesh(new THREE.ShapeGeometry(riverShape),
        new THREE.MeshBasicMaterial({ color: 0x2b7fb0, transparent: true, opacity: .32, depthWrite: false }));
      river.position.set(0, -5.6, -17); river.rotation.x = -.22;
      g.add(river);
      g.add(softGlow(0, -5.5, -16.6, 16, 0x3fa9e0, .18));
      // lantern boats drifting downstream — pure light, no boxes
      const boats = [];
      for (let i = 0; i < 7; i++) {
        const b = softGlow(-14 + i * 4.4, -5.35, -16.4, .9, 0xffb066, .8);
        g.add(b); boats.push(b);
      }
      g.userData.boats = boats;
    });

    /* ── 4 · Yeta ka: the mandap, rings turning under the canopy ── */
    addZone(4, (g) => {
      const m = makeMandap(gold, bright);
      m.position.set(0, -1.6, -13); m.scale.setScalar(1.0);
      g.add(m);
      const rG = new THREE.TorusGeometry(.66, .075, 20, 64);
      const r1 = new THREE.Mesh(rG, new THREE.MeshStandardMaterial({ color: 0xf0c65a, metalness: .95, roughness: .18, emissive: 0x4a3210, emissiveIntensity: .7 }));
      const r2 = new THREE.Mesh(rG, new THREE.MeshStandardMaterial({ color: 0xf2a898, metalness: .95, roughness: .2, emissive: 0x4a1a12, emissiveIntensity: .7 }));
      r1.position.x = -.38; r2.position.x = .38; r2.rotation.y = Math.PI / 2.15;
      const rings = new THREE.Group(); rings.add(r1, r2);
      rings.position.set(0, -1.0, -12); g.add(rings);
      g.add(softGlow(0, -1.0, -12.4, 6, 0xffc978, .4));
      g.userData.rings = rings;
    });

    /* ── 5 · Ashirwad: a sky of lanterns rising for good ── */
    addZone(5, (g) => {
      const n = small ? 70 : 120;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(n * 3), vel = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        pos[i * 3] = (Math.random() - .5) * 30;
        pos[i * 3 + 1] = -10 + Math.random() * 22;
        pos[i * 3 + 2] = -28 + Math.random() * 22;
        vel[i] = .4 + Math.random() * .9;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({
        map: glowT, size: 1.5, transparent: true, opacity: .95,
        blending: THREE.AdditiveBlending, depthWrite: false,
        color: 0xffb877, sizeAttenuation: true,
      }));
      g.add(pts);
      g.userData.sky = { pts, pos, vel, n };
    });

    /* ── petals: warm sprites, always BEHIND the panels ── */
    const PN = small ? 18 : 30;
    const petals = [];
    for (let i = 0; i < PN; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: petT, transparent: true, depthWrite: false,
        opacity: .28 + Math.random() * .22, rotation: Math.random() * 6.3,
      }));
      sp.scale.setScalar(.32 + Math.random() * .3);
      sp.position.set((Math.random() - .5) * 28, Math.random() * 24 - 12, -11 - Math.random() * 13);
      sp.userData = { s: .5 + Math.random() * .8, ph: Math.random() * 6.3, vr: (Math.random() - .5) * .5 };
      scene.add(sp); petals.push(sp);
    }

    const resize = () => {
      const w = host.clientWidth || 1, h = host.clientHeight || 1;
      R.setSize(w, h, false);
      cam.aspect = w / h;
      cam.fov = w / h < .7 ? 58 : w / h < 1 ? 52 : 46;
      cam.updateProjectionMatrix();
      if (reduced) R.render(scene, cam);
    };
    const ro = new ResizeObserver(resize); ro.observe(host); resize();

    let tx = 0, ty = 0;
    const onMove = (e) => { tx = e.clientX / window.innerWidth - .5; ty = e.clientY / window.innerHeight - .5; };
    const onTilt = (e) => {
      if (e.gamma == null) return;
      tx = Math.max(-.6, Math.min(.6, e.gamma / 50));
      ty = Math.max(-.6, Math.min(.6, (e.beta - 45) / 70));
    };
    if (!reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("deviceorientation", onTilt, { passive: true });
    }

    const PAL = {
      night: { top: 0x080b1e, bot: 0x2a1330, glow: 0x7c1f38, fog: 0x0a0e24, hemi: .75 },
      day:   { top: 0xdfe9f5, bot: 0xf6dcc0, glow: 0xf3b98a, fog: 0xe9e0cf, hemi: 1.15 },
      party: { top: 0x14042e, bot: 0x3d0b4a, glow: 0xff2e88, fog: 0x16062c, hemi: .9 },
    };

    const clock = new THREE.Clock();
    let raf = 0, alive = true, camY = 0;
    const step = () => {
      const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
      const p = pRef.current, pt = partyRef.current, sp = pt ? 2.2 : 1;
      sky.material.uniforms.uT.value = t * sp;

      /* the flight — eased, with a gentle drift so it never feels like
         an elevator, and always framed well back from the geometry */
      const targetY = -p * DEPTH;
      camY += (targetY - camY) * .075;
      cam.position.set(Math.sin(p * Math.PI * 2.4) * 1.4 + tx * 1.1,
                       camY + .6 - ty * .7,
                       7.2);
      cam.lookAt(Math.sin(p * Math.PI * 2.4) * .5, camY - .5, -8);

      const z0 = zones[0].userData;
      z0.kalash.rotation.y = t * .22 * sp;
      z0.halos.forEach((h, i) => { h.rotation.z = t * (.14 + i * .07) * (i % 2 ? -1 : 1) * sp; });
      z0.buds.forEach((b, i) => {
        b.material.opacity = .78 + Math.sin(t * 2 + i * .5) * .2;
        b.position.y += Math.sin(t * 1.4 + i) * .0012;
      });

      zones[1].userData.orbs.forEach((o, i) => {
        o.material.opacity = .5 + Math.sin(t * 1.6 + i) * .35;
        o.position.y += Math.sin(t * .7 + i) * .0018;
      });
      zones[1].rotation.y = Math.sin(t * .07) * .16;

      zones[2].userData.ring.rotation.y = t * .16 * sp;
      zones[2].userData.ring.children.forEach((L) => {
        L.position.y += Math.sin(t * 1.2 + L.userData.ph) * .0035;
      });

      zones[3].userData.boats.forEach((b, i) => {
        b.position.x += (.55 + i * .04) * dt * sp;
        if (b.position.x > 16) b.position.x = -16;
        b.material.opacity = .75 + Math.sin(t * 3 + i) * .25;
      });

      zones[4].userData.rings.rotation.y = t * .55 * sp;
      zones[4].userData.rings.rotation.x = Math.sin(t * .6) * .22;

      const S = zones[5].userData.sky;
      for (let i = 0; i < S.n; i++) {
        S.pos[i * 3 + 1] += S.vel[i] * dt * sp;
        if (S.pos[i * 3 + 1] > 14) S.pos[i * 3 + 1] = -12;
      }
      S.pts.geometry.attributes.position.needsUpdate = true;

      petals.forEach((q) => {
        const d = q.userData;
        q.position.y -= d.s * dt * sp;
        q.position.x += Math.sin(t * .6 + d.ph) * .006;
        q.material.rotation += d.vr * dt;
        if (q.position.y < camY - 13) {
          q.position.y = camY + 13;
          q.position.x = (Math.random() - .5) * 26;
        }
      });

      if (pt) {
        const beat = Math.pow(Math.abs(Math.sin(t * 3.1)), 8);
        hemi.intensity = .9 + beat * 1.1;
        key.intensity = 1.35 + beat * .9;
      }
      R.render(scene, cam);
    };
    const loop = () => { if (!alive) return; if (!document.hidden) step(); raf = requestAnimationFrame(loop); };
    if (reduced) step(); else raf = requestAnimationFrame(loop);

    apiRef.current = {
      apply(theme, party) {
        const c = party ? PAL.party : theme === "day" ? PAL.day : PAL.night;
        const u = sky.material.uniforms;
        u.uTop.value.set(c.top); u.uBot.value.set(c.bot); u.uGlow.value.set(c.glow);
        scene.fog.color.set(c.fog);
        hemi.intensity = c.hemi;
        if (reduced) R.render(scene, cam);
      },
    };

    return () => {
      alive = false; cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material])
          .forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
      });
      glowT.dispose(); petT.dispose(); R.dispose();
      if (R.domElement.parentNode) R.domElement.parentNode.removeChild(R.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useEffect(() => { apiRef.current?.apply(theme, party); }, [theme, party]);

  if (!ok) return null;
  return <div ref={hostRef} className="stage3d" aria-hidden="true" />;
}
/* ── components/stage/Overlay.jsx ─────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════
   The SVG skin over the 3D world. Like the scene below it, none of this
   unmounts — a single ribbon, a single rangoli and a single garland are
   drawn once and then continuously re-shaped by scroll progress.
   ═══════════════════════════════════════════════════════════════════ */

/* A rangoli that never redraws from scratch — it rotates, breathes and
   swaps petal counts continuously as you travel. */
function LiveRangoli({ prog, party }) {
  const petals = 8 + Math.round(prog * 8);
  const rot = prog * 420 + (party ? 0 : 0);
  return (
    <svg className={`liveRangoli ${party ? "party" : ""}`} viewBox="-60 -60 120 120" aria-hidden="true"
      style={{ transform: `rotate(${rot}deg) scale(${1 + Math.sin(prog * Math.PI) * 0.22})` }}>
      {Array.from({ length: petals }).map((_, i) => (
        <ellipse key={i} rx="9" ry="34" cx="0" cy="0"
          style={{ transform: `rotate(${(360 / petals) * i}deg)`, animationDelay: `${i * 90}ms` }} />
      ))}
      <circle r="9" className="rgCore" />
      <circle r="46" className="rgRim" />
      <circle r="54" className="rgRim slow" />
    </svg>
  );
}

/* Phrases with their meanings — no wordplay, no invented lines. */
function PhraseTicker({ prog }) {
  const i = Math.min(PHRASES.length - 1, Math.floor(prog * PHRASES.length));
  const ph = PHRASES[i];
  return (
    <div className="ticker" key={ph.txt}>
      <span className={ph.lang === "mr" ? "dev" : "kan"}>{ph.txt}</span>
      <i>{ph.mean}</i>
    </div>
  );
}

/* Tap/click anywhere → confetti of petals, akshata and sparks.
   Also fires automatically at each act boundary, so the whole journey
   keeps popping without the guest doing anything. */
function Confetti({ reduced, bindRef }) {
  const cRef = useRef(null);
  useEffect(() => {
    if (reduced) return;
    const cv = cRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fit = () => {
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(cv);

    const parts = [];
    const COLORS = ["#f59a2b", "#ff5d8f", "#f7d87c", "#23c08f", "#fff3c8"];
    const burst = (x, y, n = 46) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 7;
        parts.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3,
          r: 2 + Math.random() * 5, rot: Math.random() * 6.3, vr: (Math.random() - .5) * .4,
          c: COLORS[(Math.random() * COLORS.length) | 0], life: 1,
          rice: Math.random() < .35,
        });
      }
      if (parts.length > 700) parts.splice(0, parts.length - 700);
    };
    if (bindRef) bindRef.current = burst;

    const tap = (e) => {
      const t = e.touches?.[0] || e;
      burst(t.clientX, t.clientY, 30);
    };
    window.addEventListener("pointerdown", tap, { passive: true });

    let raf = 0, alive = true;
    const loop = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy += .22; p.vx *= .99; p.vy *= .99;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= .009;
        if (p.life <= 0 || p.y > H + 40) { parts.splice(i, 1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.rice ? "#fff8e6" : p.c;
        if (p.rice) ctx.fillRect(-1.4, -3, 2.8, 6);
        else { ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .55, 0, 0, 6.3); ctx.fill(); }
        ctx.restore();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      alive = false; cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener("pointerdown", tap);
      if (bindRef) bindRef.current = null;
    };
  }, [reduced, bindRef]);

  return <canvas ref={cRef} className="confetti" aria-hidden="true" />;
}
/* ── components/hero/Curtain.jsx ─────────────────────────── */
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
/* ── components/events/Countdown.jsx ─────────────────────────── */
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
        That's roughly <b>{chai}</b> cutting chais away — one hill in Gavani,
        two families, and a whole lot of haldi.
      </p>
    </div>
  );
}

/* Itinerary card with per-event calendar actions. */
/* ── components/venue/GuideTabs.jsx ─────────────────────────── */
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
/* ── components/rsvp/Rsvp.jsx ─────────────────────────── */
function RSVP() {
  const [vibe, setVibe] = useState(null);
  const [name, setName] = useState("");
  const [count, setCount] = useState(2);
  const [meal, setMeal] = useState(MEALS[0]);
  const [note, setNote] = useState("");
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
    log.push({ name: name.trim(), vibe, count, meal, note, ts: Date.now() });
    await store.set("ps-rsvp-log-v1", log);
    await store.set("ps-rsvp-tally-v1", newTally);
  };
  if (done) return (
    <div className="card confirm">
      <div className="confRing"><Check size={38} strokeWidth={2.5} /></div>
      <h3 className="display" style={{ fontSize: "clamp(24px,4vw,36px)" }}>
        Shubh Mangal <span className="goldtxt">SAVED-haan!</span> 🎉
      </h3>
      <p className="lede" style={{ margin: "10px auto 0" }}>
        {done.attending
          ? `${done.name}, you + ${done.count - 1 || "no"} more = counted, fed, and expected on the dance floor.`
          : `${done.name}, we'll miss you badly — we'll send you the photos.`}
      </p>
      <p className="meter"><b>{tally}+</b> have already said they're coming</p>
    </div>
  );
  return (
    <div>
      <div className="vibes" role="radiogroup" aria-label="How are you attending?">
        {VIBES.map((v, i) => (
          <button key={v.id} style={{ animationDelay: `${i * 70}ms` }} role="radio" aria-checked={vibe === v.id}
            className={`vibe ${vibe === v.id ? "on" : ""}`} onClick={() => setVibe(v.id)}>
            <span className="ve" aria-hidden="true">{v.emoji}</span>
            <h4 className="display">{v.title}</h4>
            <p>{v.sub}</p>
            <span className="tick"><Check size={13} /></span>
          </button>
        ))}
      </div>
      <div className="formRow">
        <div className="field">
          <label htmlFor="ps-name">Your good name</label>
          <input id="ps-name" className="input" value={name} maxLength={48}
            placeholder="e.g. Sneha Khot-Magadum" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>How many of you?</label>
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
          <label htmlFor="ps-note">Anything we should know?</label>
          <input id="ps-note" className="input" value={note} maxLength={90}
            placeholder="Travelling with elders / need help with stairs / arriving late"
            onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
      <button ref={btnRef} className="btn solid" style={{ fontSize: 15, padding: "14px 26px" }}
        disabled={!vibe || !name.trim()} onClick={submit}
        title={!vibe || !name.trim() ? "Pick a vibe + tell us your name" : "Lock it in"}>
        <PartyPopper size={16} /> Pakka done ✓
      </button>
      <p className="privacyNote" style={{ marginTop: 12 }}>
        Your RSVP lands straight on the family guest list — the tally above updates live.
      </p>
    </div>
  );
}
/* ── components/wall/BlessingsWall.jsx ─────────────────────────── */
function BlessingsWall() {
  const [items, setItems] = useState(SEED_BLESSINGS);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  useEffect(() => {
    store.get("ps-blessings-v1", []).then((saved) => {
      const live = (Array.isArray(saved) ? saved : []).filter((b) => !b.hidden);
      setItems([...live, ...SEED_BLESSINGS]);
    });
  }, []);
  const addEmoji = (e) => setMsg((m) => (m + " " + e).trim().slice(0, 160));
  const post = async () => {
    if (!msg.trim()) return;
    const entry = {
      id: `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      who: (name.trim() || "Someone lovely").slice(0, 30),
      txt: msg.trim().slice(0, 160),
      c: (Math.random() * 4) | 0,
      ts: Date.now(),
    };
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
          Everyone opening this invite can read the wall — so keep it lovely.
        </p>
      </div>
      <div className="wall">
        {items.map((b, i) => (
          <div className="card bless" key={b.id || b.ts || `seed-${i}`}
            style={{ background: tints[(b.c ?? i) % 4] }}>
            <p>{b.txt}</p><span>— {b.who}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN — full-screen story chapters
   ════════════════════════════════════════════════════════════════════ */
/* ── components/live/LiveCeremony.jsx ─────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════
   THE LIVE MUHURAT
   On 09.08.2026 the invitation quietly changes. Anyone who couldn't
   travel opens the link and joins the moment from wherever they are:
   the antarpat drops on their screen at the muhurat, and they throw
   akshata by tapping — their handful joins a live count shared by
   every remote guest, then they leave a blessing.

   Timeline (all IST):
     T-30 min  a gentle banner appears: "join the muhurat live"
     T-2 min   the ceremony can be opened; a countdown runs
     T-0       "शुभमंगल सावधान" — akshata throwing opens
     T+30 min  the moment closes, blessings stay open

   ?rehearsal=1 in the URL runs the whole thing any time, so you can
   test it before the day (the counter is shared, so rehearsal taps do
   add to the total — reset it in data/kv.json if you'd rather).
   ═══════════════════════════════════════════════════════════════════ */

const MUHURAT = new Date(CONFIG.weddingISO).getTime();
const PRE_BANNER = 30 * 60 * 1000;
const OPEN_EARLY = 2 * 60 * 1000;
const WINDOW_END = 30 * 60 * 1000;

function useNow(active) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

/* a stable per-device id, so the "guests joined" count is people not taps */
function deviceId() {
  try {
    const k = "aws-guest-id";
    let v = sessionStorage.getItem(k);
    if (!v) { v = Math.random().toString(36).slice(2, 10); sessionStorage.setItem(k, v); }
    return v;
  } catch { return Math.random().toString(36).slice(2, 10); }
}

function LiveCeremony({ burstRef, reduced }) {
  const [rehearsal, setRehearsal] = useState(false);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [count, setCount] = useState({ akshata: 0, guests: 0 });
  const [mine, setMine] = useState(0);
  const pending = useRef(0);
  const idRef = useRef(null);

  useEffect(() => {
    setRehearsal(new URLSearchParams(window.location.search).get("rehearsal") === "1");
    idRef.current = deviceId();
  }, []);

  const now = useNow(true);
  const delta = rehearsal ? 0 : MUHURAT - now;
  const showBanner = rehearsal || (delta < PRE_BANNER && delta > -WINDOW_END);
  const canOpen = rehearsal || (delta < OPEN_EARLY && delta > -WINDOW_END);
  const live = rehearsal || (delta <= 0 && delta > -WINDOW_END);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/ceremony", { cache: "no-store" });
      if (r.ok) setCount(await r.json());
    } catch {}
  }, []);

  useEffect(() => { if (open) refresh(); }, [open, refresh]);

  /* taps are batched — one request a second however fast they tap */
  useEffect(() => {
    if (!open) return;
    const t = setInterval(async () => {
      const n = pending.current;
      if (!n) { refresh(); return; }
      pending.current = 0;
      try {
        const r = await fetch("/api/ceremony", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ n, who: idRef.current }),
        });
        if (r.ok) setCount(await r.json());
      } catch {}
    }, 1000);
    return () => clearInterval(t);
  }, [open, refresh]);

  const throwAkshata = (e) => {
    if (!live) return;
    pending.current = Math.min(pending.current + 1, 30);
    setMine((m) => m + 1);
    setCount((c) => ({ ...c, akshata: c.akshata + 1 }));
    if (burstRef?.current && !reduced) {
      const r = e.currentTarget.getBoundingClientRect();
      burstRef.current(r.left + r.width / 2, r.top + r.height / 2, 34);
    }
    if (navigator.vibrate) { try { navigator.vibrate(18); } catch {} }
  };

  if (!showBanner || dismissed) return null;

  const mmss = () => {
    const d = Math.max(0, delta);
    const m = Math.floor(d / 60000), s = Math.floor((d % 60000) / 1000);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  if (!open) {
    return (
      <div className="liveBar" role="status">
        <span className="livePulse" aria-hidden="true" />
        <div className="liveBarTxt">
          <b>{live ? "The muhurat is happening now" : "Joining from afar?"}</b>
          <i>{live
            ? "Throw your akshata with everyone else"
            : rehearsal ? "Rehearsal mode" : `Live ceremony opens in ${mmss()}`}</i>
        </div>
        <button className="btn solid tiny" onClick={() => setOpen(true)} disabled={!canOpen}>
          {canOpen ? "Join live" : "Soon"}
        </button>
        <button className="liveX" onClick={() => setDismissed(true)} aria-label="Dismiss">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="liveWrap" role="dialog" aria-label="Live ceremony">
      <button className="liveClose" onClick={() => setOpen(false)} aria-label="Close">
        <X size={18} />
      </button>

      <div className="liveInner">
        {!live ? (
          <>
            <p className="liveEyebrow">The muhurat begins in</p>
            <div className="liveClock display">{mmss()}</div>
            <p className="liveNote dev">हळू हळू — stay with us</p>
          </>
        ) : (
          <>
            <p className="liveEyebrow"><Sparkles size={12} /> Live · {CONFIG.venue.name}</p>
            <h2 className="liveTitle display dev">शुभमंगल सावधान</h2>
            <p className="liveSub">The antarpat has dropped. Throw your akshata.</p>

            <button className="akshataBtn" onClick={throwAkshata} aria-label="Throw akshata">
              <span className="akshataGrain" aria-hidden="true">🌾</span>
              <b>Throw akshata</b>
              <i>tap as many times as your heart says</i>
            </button>

            <div className="liveCounts">
              <div><b>{count.akshata.toLocaleString("en-IN")}</b><span>grains thrown</span></div>
              <div><b>{count.guests.toLocaleString("en-IN")}</b><span>joining from afar</span></div>
              {mine > 0 && <div><b>{mine}</b><span>yours</span></div>}
            </div>

            <p className="liveNote">
              <Heart size={11} /> Your blessing goes on the wall below — they'll read every one.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
/* ── components/Invitation.jsx ─────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════
   THE FLIGHT
   The page is a single fixed viewport. Scrolling doesn't move content
   past you — it moves *time* forward. One global progress value (0→1)
   drives the 3D world, the SVG ribbon, the rangoli, the colours and
   which act is on screen. Nothing is stitched; it's one continuous take.
   ═══════════════════════════════════════════════════════════════════ */

const N = ACTS.length;
const smooth = (t) => t * t * (3 - 2 * t);

/* local 0→1 within an act, and how "present" that act is */
function actState(prog, i) {
  const band = 1 / N;
  const local = clamp((prog - i * band) / band, 0, 1);
  const inFade = smooth(clamp(local / 0.2, 0, 1));
  const outFade = 1 - smooth(clamp((local - 0.78) / 0.22, 0, 1));
  return { local, vis: Math.min(inFade, outFade) };
}


/* Scrollable content area.
   Two rules make this behave:
     1. It scrolls natively — real momentum on touch, real wheel response.
     2. overscroll-behavior stays AUTO, so when you hit the bottom the
        scroll chains straight on to the page and the journey continues.
        (The earlier bug was `contain`, which swallowed the wheel and
        froze the page — never set that here.)
   A chevron appears while there's more to read below. */
function ActFlow({ children }) {
  const ref = useRef(null);
  const [more, setMore] = useState(false);

  const check = useCallback(() => {
    const el = ref.current; if (!el) return;
    setMore(el.scrollHeight - el.clientHeight - el.scrollTop > 12);
  }, []);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    const t = setTimeout(check, 500);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, [check]);

  return (
    <div className="flowWrap">
      <div className="flow" ref={ref} onScroll={check} tabIndex={0}>
        <div className="flowInner">{children}</div>
      </div>
      <span className={`flowMore ${more ? "on" : ""}`} aria-hidden="true">
        <ChevronDown size={16} />
      </span>
    </div>
  );
}

function Panel({ i, prog, children, className = "" }) {
  const { local, vis } = actState(prog, i);
  if (vis <= 0.001) return null;                     // cheap, but never remounts the world
  return (
    <div className={`panel ${className}`} style={{
      opacity: vis,
      transform: `translate3d(0, ${(1 - vis) * 26}px, 0) scale(${0.965 + vis * 0.035})`,
      pointerEvents: vis > 0.55 ? "auto" : "none",
      filter: `blur(${(1 - vis) * 5}px)`,
      "--local": local,
    }}>
      <div className="glass">{children}</div>
    </div>
  );
}

function Invitation() {
  const [prog, setProg] = useState(0);
  const [theme, setTheme] = useState("night");
  const [party, setParty] = useState(false);
  const [sound, setSound] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [pin, setPin] = useState(PINS[0]?.id);
  const burstRef = useRef(null);
  const ambRef = useRef(null);
  const lastAct = useRef(-1);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  /* the single source of truth */
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProg(max > 0 ? clamp(window.scrollY / max, 0, 1) : 0);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    read();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const act = Math.min(N - 1, Math.floor(prog * N));

  /* every act boundary pops — the journey keeps celebrating itself */
  useEffect(() => {
    if (act !== lastAct.current) {
      if (lastAct.current !== -1 && burstRef.current && !reduced) {
        burstRef.current(window.innerWidth / 2, window.innerHeight * 0.42, 40);
      }
      lastAct.current = act;
    }
  }, [act, reduced]);

  useEffect(() => () => ambRef.current?.stop(), []);
  const toggleSound = () => {
    if (!ambRef.current) ambRef.current = new Ambience();
    if (sound) { ambRef.current.stop(); setSound(false); }
    else { ambRef.current.start(); setSound(true); }
  };

  const goAct = useCallback((i) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * ((i + 0.35) / N), behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);

  const heroP = clamp(prog * N * 1.55, 0, 1);   // curtain parts through act 0
  const nameIn = clamp((heroP - 0.42) / 0.35, 0, 1);

  return (
    <>
      {/* scroll distance only — the entire experience is fixed above it */}
      <div className="scroller" style={{ height: `${N * 118}dvh` }} aria-hidden="true" />

      <main className={`viewport grain ${party ? "party" : ""}`} data-theme={theme}>
        <Stage3D prog={prog} theme={theme} reduced={reduced} party={party} />
        <LiveRangoli prog={prog} party={party} />
        <Confetti reduced={reduced} bindRef={burstRef} />
        <LiveCeremony burstRef={burstRef} reduced={reduced} />

        {/* ── chrome ─────────────────────────────────────────── */}
        <header className="chrome">
          <span className="mono" aria-label="Akshay and Shraddha">A <Heart size={12} /> S</span>
          <div className="chromeBtns">
            <button className={`ic ${party ? "on" : ""}`} onClick={() => setParty(p => !p)}
              aria-pressed={party} aria-label="Party mode">
              <PartyPopper size={16} />
            </button>
            <button className="ic" onClick={toggleSound} aria-pressed={sound} aria-label="Ambient sound">
              {sound ? <Music size={16} /> : <VolumeX size={16} />}
            </button>
            <button className="ic" onClick={() => setTheme(t => t === "night" ? "day" : "night")}
              aria-label="Theme">{theme === "night" ? <Sun size={16} /> : <Moon size={16} />}</button>
          </div>
        </header>

        {/* act rail — doubles as the progress indicator */}
        <nav className="rail" aria-label="Chapters">
          {ACTS.map((a, i) => (
            <button key={a.id} className={`railDot ${i === act ? "on" : ""}`}
              onClick={() => goAct(i)} aria-label={`${a.label} — ${a.sub}`}>
              <b>{a.label}</b>
            </button>
          ))}
          <span className="railFill" style={{ transform: `scaleY(${prog})` }} aria-hidden="true" />
        </nav>

        <PhraseTicker prog={prog} />

        {/* ── ACT 0 · Antarpat ───────────────────────────────── */}
        <Panel i={0} prog={prog} className="center">
          <p className="invok dev">॥ श्री वीतरागाय नमः ॥ · ॥ श्री गणेशाय नमः ॥</p>

          <div className="couple" style={{ opacity: nameIn }}>
            <div className="side">
              <h1 className="one display shimmer">{CONFIG.groom.en}</h1>
              <p className="dev oneDev">{CONFIG.groom.dev}</p>
              <p className="fam">{CONFIG.groom.parents}</p>
              <p className="fam dim">{CONFIG.groom.siblings}</p>
            </div>

            <div className="weds" aria-hidden="true">
              <span className="wline" /><em className="display">weds</em><span className="wline" />
            </div>

            <div className="side">
              <h1 className="one display shimmer">{CONFIG.bride.en}</h1>
              <p className="dev oneDev">{CONFIG.bride.dev}</p>
              <p className="fam">{CONFIG.bride.parents}</p>
              {CONFIG.bride.siblings && <p className="fam dim">{CONFIG.bride.siblings}</p>}
            </div>
          </div>

          <div className="bigDate display" style={{ opacity: nameIn }}>09 · 08 · 2026</div>
          <p className="muhurt" style={{ opacity: nameIn }}>Sunday · {CONFIG.muhurtLabel}</p>
          <p className="venueLine" style={{ opacity: nameIn }}>
            {CONFIG.venue.name} · {CONFIG.city}
          </p>

          <div className="cta" style={{ opacity: nameIn, pointerEvents: nameIn > .5 ? "auto" : "none" }}>
            <button className="btn solid" onClick={() => downloadICS(EVENTS[1])}>
              <CalendarPlus size={15} /> Save the date
            </button>
          </div>
        </Panel>

        {/* ── ACT 1 · Parivar ───────────────────────────────── */}
        <Panel i={1} prog={prog}>
          <p className="eyebrow"><Users size={11} /> Act Two · Parivar</p>
          <h2 className="h2 display">Two families, <span className="shimmer">one day</span></h2>
          <ActFlow>
            <div className="famCard">
              <span className="famTag">Groom's side</span>
              <h3 className="display">{CONFIG.groom.family}</h3>
              <p>{CONFIG.groom.parents}</p>
              <p className="dim">{CONFIG.groom.siblings}</p>
            </div>
            <div className="famCard">
              <span className="famTag">Bride's side</span>
              <h3 className="display">{CONFIG.bride.family}</h3>
              <p>{CONFIG.bride.parents}</p>
            </div>
            <p className="famJoin">{CONFIG.familiesLine}</p>

            <div className="giftCard">
              <Gift size={20} />
              <h3 className="display">{CONFIG.giftNote}</h3>
              <p>{CONFIG.giftSub}</p>
            </div>

            <p className="ritualLead">The rituals of the day</p>
            <div className="chips">{RITUAL_CHIPS.map(c => <span className="chip" key={c}>✦ {c}</span>)}</div>
          </ActFlow>
        </Panel>

        {/* ── ACT 2 · Muhurat ────────────────────────────────── */}
        <Panel i={2} prog={prog}>
          <p className="eyebrow"><Clock size={11} /> Act Three · Muhurat</p>
          <h2 className="h2 display">One day. <span className="shimmer">Everything that matters.</span></h2>
          <Countdown />
          <ActFlow>
            {EVENTS.map((e, i) => (
              <article className="ev" key={e.id} style={{ animationDelay: `${i * 60}ms` }}>
                <span className="evEmoji" aria-hidden="true">{e.emoji}</span>
                <div className="evBody">
                  <h3 className="display">{e.title}</h3>
                  <span className="tag">{e.tag}</span>
                  <p className="meta">{e.place}</p>
                  <p className="dress"><b>Dress:</b> {e.dress}</p>
                  <div className="evBtns">
                    <a className="btn ghost" href={gcalUrl(e)} target="_blank" rel="noopener noreferrer">
                      <CalendarPlus size={13} /> Google
                    </a>
                    <button className="btn ghost" onClick={() => downloadICS(e)}>
                      <Download size={13} /> .ics
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </ActFlow>
        </Panel>

        {/* ── ACT 3 · Rasta ──────────────────────────────────── */}
        <Panel i={3} prog={prog}>
          <p className="eyebrow"><MapPin size={11} /> Act Four · Rasta</p>
          <h2 className="h2 display">Finding <span className="shimmer">the mandap</span></h2>
          <div className="pinRow">
            {PINS.map(p => (
              <button key={p.id} className={`pinChip ${pin === p.id ? "on" : ""}`} onClick={() => setPin(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
          {PINS.filter(p => p.id === pin).map(p => (
            <div className="pinCard" key={p.id}>
              <h3 className="display">{p.label}</h3>
              <p className="meta">{p.km}</p>
              {p.note && <p>{p.note}</p>}
              <a className="btn ghost" href={p.id === "venue" ? CONFIG.venue.maps : `https://maps.google.com/?q=${encodeURIComponent(p.q)}`}
                target="_blank" rel="noopener noreferrer"><MapPin size={13} /> Open in Maps</a>
            </div>
          ))}
          <ActFlow>
            <GuideTabs />
            <p className="note"><Umbrella size={12} /> August in this belt means sudden rain — umbrella in the bag.</p>
            <p className="note"><Gift size={12} /> {CONFIG.giftSub}</p>
          </ActFlow>
        </Panel>

        {/* ── ACT 4 · Yeta ka? ───────────────────────────────── */}
        <Panel i={4} prog={prog}>
          <p className="eyebrow"><Sparkles size={11} /> Act Five · येता का मग?</p>
          <h2 className="h2 display">So… <span className="shimmer">you're coming?</span></h2>
          <ActFlow><RSVP /></ActFlow>
        </Panel>

        {/* ── ACT 5 · Ashirwad ───────────────────────────────── */}
        <Panel i={5} prog={prog}>
          <p className="eyebrow"><Heart size={11} /> Act Six · Ashirwad</p>
          <h2 className="h2 display">Leave a <span className="shimmer">blessing</span></h2>
          <ActFlow>
            <BlessingsWall />
            <footer className="foot">
              <p className="display shimmer">{CONFIG.hashtag}</p>
              <p>{CONFIG.familiesLine}</p>
              <p className="dev">स्वर्गीय आशीर्वाद 🪔 {CONFIG.remembrance.join(" · ")}</p>
              <p className="giftFoot">{CONFIG.giftNote}</p>
              <p>{CONFIG.contact}</p>
            </footer>
          </ActFlow>
        </Panel>

        {/* the curtain stays — it's the one thing that opens onto everything */}
        <Curtain p={heroP} />

        {prog < 0.02 && (
          <div className="cue">
            <span className="dev">हळू हळू</span><i>scroll slowly</i><ChevronDown size={15} />
          </div>
        )}
      </main>
    </>
  );
}


export default function WeddingInvitation() {
  return (
    <div className="pswrap">
      <style>{CSS}</style>
      <Invitation />
    </div>
  );
}
