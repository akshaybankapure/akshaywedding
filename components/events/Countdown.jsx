"use client";

import { useState, useEffect } from "react";
import { CONFIG } from "@/lib/config";
import { useLang } from "@/lib/i18n";
import { pad2 } from "@/lib/helpers";

/* `compact` is the hero's version: the same clock, slim enough to sit
   directly above the join button without pushing the couple off screen.
   The full one — tiles plus the chai line — stays in the muhurat act. */
export default function Countdown({ compact = false }) {
  const { t } = useLang();
  const target = new Date(CONFIG.weddingISO).getTime();
  /* The clock is rendered on the server too, so the second it prints is
     already stale by the time the browser hydrates. The digits are told
     to expect that; everything around them still hydrates strictly. */
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000) % 24,
    m = Math.floor(diff / 60000) % 60, s = Math.floor(diff / 1000) % 60;
  const chai = Math.max(1, Math.floor(diff / 3600000 / 3));
  const misal = Math.max(1, d);
  /* The symbols carry the compact row instead of the translated words:
     they stay one line wide in every language, and the full labels are
     right there on the tiles in the muhurat act. */
  const units = [[d, t("days"), "d"], [h, t("hours"), "h"], [m, t("minutes"), "m"], [s, t("seconds"), "s"]];

  if (diff === 0) return compact ? (
    <p className="countNow dev" role="status">आत्ताच · right now</p>
  ) : (
    <div className="humor" role="status" style={{ fontSize: 20 }}>
      It's happening. Someone find the groom's safa. 🥁
    </div>
  );

  if (compact) return (
    <p className="countMini" role="timer" aria-label="Countdown to the wedding">
      {units.map(([v, l, u]) => (
        <span key={u}>
          <b className="display" suppressHydrationWarning>{pad2(v)}</b>
          <i aria-label={l}>{u}</i>
        </span>
      ))}
    </p>
  );

  return (
    <div>
      <div className="count" role="timer" aria-label="Countdown to the wedding">
        {units.map(([v, l]) => (
          <div className="tile" key={l}>
            <b key={v} className="display" suppressHydrationWarning>{pad2(v)}</b>
            <span>{l}</span>
          </div>
        ))}
      </div>
      <p className="humor">
        That's roughly <b>{chai}</b> cutting chais until the akshata — one hill at Tavandi,
        two families, and a whole lot of haldi.
      </p>
    </div>
  );
}

/* Itinerary card with per-event calendar actions. */
