"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Music, VolumeX, Sun, Moon, MapPin, CalendarPlus, Download, ChevronDown,
  Sparkles, Heart, PartyPopper, Clock, Umbrella, Gift, Users, Navigation,
} from "lucide-react";
import { CONFIG, EVENTS, RITUAL_CHIPS, PINS, ACTS } from "@/lib/config";
import { gcalUrl, downloadICS } from "@/lib/calendar";
import { Ambience } from "@/lib/ambience";
import Stage3D from "@/components/stage/Stage3D";
import { Confetti } from "@/components/stage/Overlay";
import Curtain from "@/components/hero/Curtain";
import Countdown from "@/components/events/Countdown";
import RegionMap from "@/components/venue/RegionMap";
import GuideTabs from "@/components/venue/GuideTabs";
import RSVP from "@/components/rsvp/Rsvp";
import BlessingsWall from "@/components/wall/BlessingsWall";
import LiveCeremony from "@/components/live/LiveCeremony";

/* ═══════════════════════════════════════════════════════════════════
   Why this is an ordinary scrolling page.

   Earlier versions pinned everything into a fixed viewport and scrolled
   content inside boxes. That created three problems that can't be
   patched away: inner scrollers fight the page, content gets clipped,
   and every scroll frame re-rendered the whole React tree.

   Now the 3D world is a fixed backdrop and the invitation is a normal
   document. Scrolling is the browser's own — smooth on any phone,
   nothing to trap, nothing to clip.

   Scroll progress goes into a ref and a CSS variable inside one rAF
   loop. React state changes only when the act changes — six times in
   the entire journey — so scrolling triggers no re-renders.
   ═══════════════════════════════════════════════════════════════════ */

export default function Invitation() {
  const [theme, setTheme] = useState("night");
  const [party, setParty] = useState(false);
  const [sound, setSound] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [act, setAct] = useState(0);
  const [pin, setPin] = useState(PINS[0]?.id);
  const [copied, setCopied] = useState(false);

  const progRef = useRef(0);
  const rootRef = useRef(null);
  const burstRef = useRef(null);
  const ambRef = useRef(null);
  const actRef = useRef(0);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    let raf = 0, queued = false;
    const read = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progRef.current = p;

      const el = rootRef.current;
      if (el) {
        el.style.setProperty("--prog", p.toFixed(4));
        const heroP = Math.min(1, window.scrollY / (window.innerHeight * 1.25));
        el.style.setProperty("--heroP", heroP.toFixed(4));
      }

      const i = Math.min(ACTS.length - 1, Math.floor(p * ACTS.length * 0.999));
      if (i !== actRef.current) { actRef.current = i; setAct(i); }
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(read);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    read();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => () => ambRef.current?.stop(), []);
  const toggleSound = () => {
    if (!ambRef.current) ambRef.current = new Ambience();
    if (sound) { ambRef.current.stop(); setSound(false); }
    else { ambRef.current.start(); setSound(true); }
  };

  const goto = useCallback((id) => {
    document.getElementById(`act-${id}`)?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth", block: "start",
    });
  }, [reduced]);

  return (
    <div ref={rootRef} className={`root ${party ? "party" : ""}`} data-theme={theme}>
      <div className="bg">
        <Stage3D progRef={progRef} theme={theme} reduced={reduced} party={party} />
      </div>
      <Confetti reduced={reduced} bindRef={burstRef} />
      <LiveCeremony burstRef={burstRef} reduced={reduced} />

      <header className="chrome">
        <span className="mono">A <Heart size={12} /> S</span>
        <div className="chromeBtns">
          <button className={`ic ${party ? "on" : ""}`} onClick={() => setParty(p => !p)}
            aria-pressed={party} aria-label="Party mode"><PartyPopper size={16} /></button>
          <button className="ic" onClick={toggleSound} aria-pressed={sound} aria-label="Ambient sound">
            {sound ? <Music size={16} /> : <VolumeX size={16} />}
          </button>
          <button className="ic" onClick={() => setTheme(t => t === "night" ? "day" : "night")}
            aria-label="Switch theme">{theme === "night" ? <Sun size={16} /> : <Moon size={16} />}</button>
        </div>
      </header>

      <span className="progressBar" aria-hidden="true" />

      {/* ── ONE · the antarpat ──────────────────────────────── */}
      {/* The hero is a tall scroll track containing a sticky pin: the
          invitation itself holds perfectly still while the antarpat
          parts above it, and only starts moving once it's fully open. */}
      <section className="act hero" id="act-antarpat">
        <div className="heroPin">
        <Curtain />
        <div className="heroInner">
          <p className="invok dev">॥ श्री वीतरागाय नमः ॥</p>
          <p className="invokSub dev">णमोकार महामंत्र</p>

          <div className="couple">
            <div className="side">
              <h1 className="one display">{CONFIG.groom.en}</h1>
              <p className="dev oneDev">{CONFIG.groom.dev}</p>
              <p className="fam">{CONFIG.groom.parents}</p>
              <p className="fam dim">{CONFIG.groom.siblings}</p>
            </div>

            <div className="weds"><span className="wline" /><em className="display">weds</em><span className="wline" /></div>

            <div className="side">
              <h1 className="one display">{CONFIG.bride.en}</h1>
              <p className="dev oneDev">{CONFIG.bride.dev}</p>
              <p className="fam">{CONFIG.bride.parents}</p>
              <p className="fam dim">{CONFIG.bride.siblings}</p>
            </div>
          </div>

          <div className="bigDate display">09 · 08 · 2026</div>
          <p className="muhurt">Sunday · {CONFIG.muhurtLabel}</p>
          <p className="venueLine">{CONFIG.venue.name}</p>
          <p className="venueSub">{CONFIG.venue.area}</p>

          <div className="cta">
            <button className="btn solid" onClick={() => downloadICS(EVENTS[1])}>
              <CalendarPlus size={15} /> Save the date
            </button>
            <a className="btn" href={CONFIG.venue.maps} target="_blank" rel="noopener noreferrer">
              <MapPin size={15} /> Venue
            </a>
          </div>
        </div>

        <button className="cue" onClick={() => goto("parivar")} aria-label="Scroll down">
          <span className="dev">हळू हळू</span><i>scroll slowly</i><ChevronDown size={16} />
        </button>
        </div>
      </section>

      {/* ── TWO · families ──────────────────────────────────── */}
      <section className="act" id="act-parivar">
        <p className="eyebrow"><Users size={11} /> Two · Parivar</p>
        <h2 className="h2 display">Two families, one day</h2>

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
          <p className="dim">{CONFIG.bride.siblings}</p>
        </div>
        <p className="famJoin">{CONFIG.familiesLine}</p>

        <div className="giftCard">
          <Gift size={20} />
          <h3 className="display">{CONFIG.giftNote}</h3>
          <p>{CONFIG.giftSub}</p>
        </div>

        <div className="crewCard">
          <span className="crewTag">{CONFIG.cousinsLineEn}</span>
          <p className="crewLine dev">{CONFIG.cousinsLine}</p>
          <div className="kidsNames">
            {CONFIG.cousins.map((c) => <span className="kidChip" key={c}>{c}</span>)}
          </div>
          <p className="kidsRole">{CONFIG.cousinsRole}</p>
        </div>

        <div className="seniorCrewCard">
          <span className="seniorCrewTag">{CONFIG.seniorCousinsLineEn}</span>
          <p className="seniorCrewLine dev">{CONFIG.seniorCousinsLine}</p>
          <div className="kidsNames">
            {CONFIG.seniorCousins.map((c) => <span className="kidChip" key={c}>{c}</span>)}
          </div>
          <p className="seniorCrewRole">{CONFIG.seniorCousinsRole}</p>
        </div>

        <div className="kidsCard">
          <span className="kidsTag">A message from the small people</span>
          <p className="kidsLine dev">{CONFIG.kidsLine}</p>
          <p className="kidsLineEn">{CONFIG.kidsLineEn}</p>
          <div className="kidsNames">
            {CONFIG.kids.map((k) => <span className="kidChip" key={k}>{k}</span>)}
          </div>
          <p className="kidsRole">{CONFIG.kidsRole}</p>
        </div>

        <p className="ritualLead">The rituals of the day</p>
        <div className="chips">{RITUAL_CHIPS.map(c => <span className="chip" key={c}>✦ {c}</span>)}</div>
      </section>

      {/* ── THREE · the day ─────────────────────────────────── */}
      <section className="act" id="act-muhurat">
        <p className="eyebrow"><Clock size={11} /> Three · Muhurat</p>
        <h2 className="h2 display">One day. Everything that matters.</h2>
        <Countdown />
        {EVENTS.map((e) => (
          <article className="ev" key={e.id}>
            <span className="evEmoji" aria-hidden="true">{e.emoji}</span>
            <div className="evBody">
              <h3 className="display">{e.title}</h3>
              <span className="tag">{e.tag}</span>
              <p className="meta">{e.place}</p>
              <p className="dress"><b>Dress:</b> {e.dress}</p>
              <div className="evBtns">
                <a className="btn sm" href={gcalUrl(e)} target="_blank" rel="noopener noreferrer">
                  <CalendarPlus size={13} /> Google
                </a>
                <button className="btn sm" onClick={() => downloadICS(e)}>
                  <Download size={13} /> .ics
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* ── FOUR · getting there ────────────────────────────── */}
      <section className="act" id="act-rasta">
        <p className="eyebrow"><MapPin size={11} /> Four · Rasta</p>
        <h2 className="h2 display">Finding the mandap</h2>

        <RegionMap active={pin} setActive={setPin} reduced={reduced} />

        <div className="pinRow">
          {PINS.map(p => (
            <button key={p.id} className={`pinChip ${pin === p.id ? "on" : ""}`}
              onClick={() => setPin(p.id)}>{p.label}</button>
          ))}
        </div>
        {PINS.filter(p => p.id === pin).map(p => {
          const isVenue = p.id === "venue";
          return (
            <div className="pinCard" key={p.id}>
              <h3 className="display">{p.label}</h3>
              <p className="meta">{p.km}</p>
              {p.note && <p>{p.note}</p>}

              <div className="evBtns">
                <a className="btn sm"
                  href={isVenue ? CONFIG.venue.maps : `https://maps.google.com/?q=${encodeURIComponent(p.q)}`}
                  target="_blank" rel="noopener noreferrer">
                  <MapPin size={13} /> Open in Maps
                </a>
                {isVenue && (
                  <a className="btn sm"
                    href={`https://www.google.com/maps/search/?api=1&query=${CONFIG.venue.geo}`}
                    target="_blank" rel="noopener noreferrer">
                    <Navigation size={13} /> Navigate by GPS
                  </a>
                )}
              </div>

              {isVenue && (
                <>
                  <p className="coords">
                    {CONFIG.venue.geo}
                    <button className="copyBtn" onClick={() => {
                      navigator.clipboard?.writeText(CONFIG.venue.geo);
                      setCopied(true); setTimeout(() => setCopied(false), 1800);
                    }}>{copied ? "copied ✓" : "copy"}</button>
                  </p>
                  <p className="aliasNote">{CONFIG.venue.aliasNote}</p>
                </>
              )}
            </div>
          );
        })}

        <GuideTabs />
        <p className="note"><Umbrella size={12} /> August in this belt means sudden rain — umbrella in the bag.</p>
        <p className="note"><Gift size={12} /> {CONFIG.giftSub}</p>
      </section>

      {/* ── FIVE · rsvp ─────────────────────────────────────── */}
      <section className="act" id="act-yeta">
        <p className="eyebrow"><Sparkles size={11} /> Five · येता का मग?</p>
        <h2 className="h2 display">So… you're coming?</h2>
        <RSVP />
      </section>

      {/* ── SIX · blessings ─────────────────────────────────── */}
      <section className="act" id="act-ashirwad">
        <p className="eyebrow"><Heart size={11} /> Six · Ashirwad</p>
        <h2 className="h2 display">Leave a blessing</h2>
        <BlessingsWall />

        <footer className="foot">
          <p className="display">{CONFIG.hashtag}</p>
          <p>{CONFIG.familiesLine}</p>
          <p className="dev">स्वर्गीय आशीर्वाद 🪔 {CONFIG.remembrance.join(" · ")}</p>
          <p className="giftFoot">{CONFIG.giftNote}</p>
          <p>{CONFIG.contact}</p>
        </footer>
      </section>

      {/* a jump list — never a scroll mechanism */}
      <nav className="rail" aria-label="Sections">
        {ACTS.map((a, i) => (
          <button key={a.id} className={`railDot ${i === act ? "on" : ""}`}
            onClick={() => goto(a.id)} aria-label={`${a.label} — ${a.sub}`}>
            <b>{a.label}</b>
          </button>
        ))}
      </nav>
    </div>
  );
}
