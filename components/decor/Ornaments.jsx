"use client";

import { useState, useEffect, useRef } from "react";
import { CONFIG } from "@/lib/config";


/* Self-drawing rangoli chapter divider — strokes draw in when scrolled
   into view, paisley knot at the centre. */
export function RangoliDivider({ delay = 0 }) {
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

/* Blooming lotus — petals unfurl with a springy stagger. */
export function LotusBloom({ size = 132 }) {
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

/* Infinite phrase marquee — Belagavi × Kolhapur banter on a loop. */
export function Marquee() {
  const items = ["Lai Bhari", "शुभमंगल सावधान", "Nad Khula", "halu halu · ಹಾಲು ಬೇಡ, ಹಳು ಹಳು!",
    "Yeta ka mag?", "जेवण झालं का?", CONFIG.hashtag, "स्वागत · ಸುಸ್ವಾಗತ"];
  const row = (k) => items.map((t, i) => <span key={k + i}>✦&nbsp;&nbsp;{t}</span>);
  return (
    <div className="marq" aria-hidden="true">
      <div className="inner">{row("a")}{row("b")}</div>
    </div>
  );
}

