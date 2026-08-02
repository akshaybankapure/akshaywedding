"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Heart, X } from "lucide-react";
import { CONFIG } from "@/lib/config";

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
