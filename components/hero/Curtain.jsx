"use client";

import { clamp } from "@/lib/helpers";

export default function Curtain({ p }) {
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
