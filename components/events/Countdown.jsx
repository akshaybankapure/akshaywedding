"use client";

import { useState, useEffect } from "react";
import { CONFIG } from "@/lib/config";
import { pad2 } from "@/lib/helpers";

export default function Countdown() {
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
