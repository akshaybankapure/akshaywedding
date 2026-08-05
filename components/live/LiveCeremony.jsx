"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Heart, X, Check } from "lucide-react";
import { CONFIG } from "@/lib/config";
import { useLang } from "@/lib/i18n";
import LiveStream from "@/components/live/LiveStream";

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

export default function LiveCeremony({ burstRef, reduced }) {
  const { t } = useLang();
  const [rehearsal, setRehearsal] = useState(false);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [count, setCount] = useState({ akshata: 0, guests: 0 });
  const [name, setName] = useState("");
  const [named, setNamed] = useState(false);
  const [shower, setShower] = useState([]);   // visible grains
  const [mine, setMine] = useState(0);
  const pending = useRef(0);
  const idRef = useRef(null);

  const [offsetMin, setOffsetMin] = useState(0);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setRehearsal(q.get("rehearsal") === "1");
    /* ?at=-5 pretends it is 5 minutes BEFORE the muhurat, ?at=2 pretends
       2 minutes after. Lets you rehearse the countdown, the opening
       moment and the closing without touching your device clock. */
    const at = Number(q.get("at"));
    if (!Number.isNaN(at) && q.get("at") !== null) setOffsetMin(at);
    idRef.current = deviceId();
    try {
      const saved = sessionStorage.getItem("aws-guest-name");
      if (saved) { setName(saved); setNamed(true); }
    } catch {}
  }, []);

  const now = useNow(true);
  const delta = rehearsal ? 0 : (MUHURAT - now) - offsetMin * 60000;
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

  /* the in-page Join button asks us to open — one source of truth */
  useEffect(() => {
    const onOpen = () => { setOpen(true); setDismissed(false); };
    window.addEventListener("aws:open-ceremony", onOpen);
    return () => window.removeEventListener("aws:open-ceremony", onOpen);
  }, []);

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
          body: JSON.stringify({ n, who: idRef.current, name: name || null }),
        });
        if (r.ok) setCount(await r.json());
      } catch {}
    }, 1000);
    return () => clearInterval(t);
  }, [open, refresh, name]);

  const throwAkshata = (e) => {
    if (!live) return;
    pending.current = Math.min(pending.current + 1, 30);
    setMine((m) => m + 1);
    setCount((c) => ({ ...c, akshata: c.akshata + 1 }));

    if (!reduced) {
      /* a handful of rice actually leaves your hand: grains scatter from
         the button, tumble, and fall away down the screen */
      const id = Date.now() + Math.random();
      const grains = Array.from({ length: 14 }, (_, i) => ({
        k: `${id}-${i}`,
        dx: (Math.random() - 0.5) * 260,
        dy: 120 + Math.random() * 260,
        rot: (Math.random() - 0.5) * 720,
        delay: Math.random() * 90,
        scale: 0.7 + Math.random() * 0.7,
      }));
      setShower((s) => [...s.slice(-90), ...grains]);
      setTimeout(() => {
        setShower((s) => s.filter((g) => !g.k.startsWith(String(id))));
      }, 1500);

      if (burstRef?.current) {
        const r = e.currentTarget.getBoundingClientRect();
        burstRef.current(r.left + r.width / 2, r.top + r.height / 2, 30);
      }
    }
    if (navigator.vibrate) { try { navigator.vibrate([12, 30, 18]); } catch {} }
  };

  const saveName = () => {
    const v = name.trim();
    if (!v) return;
    try { sessionStorage.setItem("aws-guest-name", v); } catch {}
    setNamed(true);
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
          <b>{live ? t("happeningNow") : t("joiningAfar")}</b>
          <i>{live
            ? "Throw your akshata with everyone else"
            : rehearsal ? "Rehearsal mode" : `Live ceremony opens in ${mmss()}`}</i>
        </div>
        <button className="btn solid tiny" onClick={() => setOpen(true)} disabled={!canOpen}>
          {canOpen ? t("joinLive") : "…"}
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
            <p className="liveEyebrow">{t("beginsIn")}</p>
            <div className="liveClock display">{mmss()}</div>
            <p className="liveNote dev">हळू हळू — {t("stayWithUs")}</p>
          </>
        ) : (
          <>
            <p className="liveEyebrow"><Sparkles size={12} /> Live · {CONFIG.venue.name}</p>
            <h2 className="liveTitle display dev">शुभमंगल सावधान</h2>
            <p className="liveSub">The antarpat has dropped. Throw your akshata.</p>

            {!named ? (
              <div className="nameGate">
                <label htmlFor="live-name">Your name, so they know who blessed them</label>
                <div className="nameRow">
                  <input id="live-name" className="input" value={name} maxLength={60}
                    placeholder="e.g. Sneha Khot-Magadum" autoComplete="name"
                    onChange={(ev) => setName(ev.target.value)}
                    onKeyDown={(ev) => ev.key === "Enter" && saveName()} />
                  <button className="btn solid" onClick={saveName} disabled={!name.trim()}>
                    <Check size={15} />
                  </button>
                </div>
                <button className="skipName" onClick={() => setNamed(true)}>
                  throw without a name
                </button>
              </div>
            ) : (
              <>
                <button className="akshataBtn" onClick={throwAkshata} aria-label={t("throwAkshata")}>
                  <span className="akshataGrain" aria-hidden="true">🌾</span>
                  <b>{t("throwAkshata")}</b>
                  <i>{t("tapAsMany")}</i>
                </button>
                {name && <p className="whoAmI">throwing as <b>{name}</b></p>}
              </>
            )}

            <div className="shower" aria-hidden="true">
              {shower.map((g) => (
                <span key={g.k} className="grain" style={{
                  "--dx": `${g.dx}px`, "--dy": `${g.dy}px`,
                  "--rot": `${g.rot}deg`, "--sc": g.scale,
                  animationDelay: `${g.delay}ms`,
                }} />
              ))}
            </div>

            <div className="liveCounts">
              <div><b>{count.akshata.toLocaleString("en-IN")}</b><span>{t("grainsThrown")}</span></div>
              <div><b>{count.guests.toLocaleString("en-IN")}</b><span>{t("joiningFromAfar")}</span></div>
              {mine > 0 && <div><b>{mine}</b><span>{t("yours")}</span></div>}
            </div>

            <LiveStream compact />

            <p className="liveNote">
              <Heart size={11} /> Your blessing goes on the wall below — they'll read every one.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
