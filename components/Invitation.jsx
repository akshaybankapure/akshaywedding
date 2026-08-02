"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Music, VolumeX, Sun, Moon, MapPin, CalendarPlus, Download, ChevronDown,
  Sparkles, Heart, PartyPopper, Clock, Umbrella, Gift, Users,
} from "lucide-react";
import { CONFIG, EVENTS, RITUAL_CHIPS, PINS, GUIDE, ACTS } from "@/lib/config";
import { clamp } from "@/lib/helpers";
import { gcalUrl, downloadICS } from "@/lib/calendar";
import { Ambience } from "@/lib/ambience";
import Stage3D from "@/components/stage/Stage3D";
import { LiveRangoli, PhraseTicker, Confetti } from "@/components/stage/Overlay";
import Curtain from "@/components/hero/Curtain";
import Countdown from "@/components/events/Countdown";
import GuideTabs from "@/components/venue/GuideTabs";
import RSVP from "@/components/rsvp/Rsvp";
import BlessingsWall from "@/components/wall/BlessingsWall";
import LiveCeremony from "@/components/live/LiveCeremony";

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

export default function Invitation() {
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
