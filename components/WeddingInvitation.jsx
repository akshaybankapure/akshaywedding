"use client";

import { useState, useEffect, useRef } from "react";
import { Music, VolumeX, Sun, Moon, MapPin, CalendarPlus, ChevronDown, Sparkles, Heart, PartyPopper, Hotel, Umbrella, Flame, Clock } from "lucide-react";
import { CONFIG, EVENTS, STORY, RITUAL_CHIPS, PINS, GUIDE, CHAPTERS } from "@/lib/config";
import { clamp, fx } from "@/lib/helpers";
import { downloadICS } from "@/lib/calendar";
import { Ambience } from "@/lib/ambience";
import { Diya, Mandala } from "@/components/decor/Decor";
import { Marquee, RangoliDivider } from "@/components/decor/Ornaments";
import PetalCanvas from "@/components/fx/PetalCanvas";
import Reveal from "@/components/fx/Reveal";
import CursorGlow from "@/components/fx/CursorGlow";
import Scene3D from "@/components/hero/Scene3D";
import Curtain from "@/components/hero/Curtain";
import RSVP from "@/components/rsvp/Rsvp";
import Countdown from "@/components/events/Countdown";
import EventCard from "@/components/events/EventCard";
import RegionMap from "@/components/venue/RegionMap";
import GuideTabs from "@/components/venue/GuideTabs";
import BlessingsWall from "@/components/wall/BlessingsWall";

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
