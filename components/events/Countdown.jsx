"use client";

import { useState, useEffect } from "react";
import { CONFIG } from "@/lib/config";
import { useLang } from "@/lib/i18n";
import { pad2 } from "@/lib/helpers";

export default function Countdown() {
  const { t } = useLang();
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
        {[[d, t("days")], [h, t("hours")], [m, t("minutes")], [s, t("seconds")]].map(([v, l]) => (
          <div className="tile" key={l}><b key={v} className="display">{pad2(v)}</b><span>{l}</span></div>
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
