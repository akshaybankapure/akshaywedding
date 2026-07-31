"use client";

import { PINS } from "@/lib/config";

export default function RegionMap({ active, setActive, reduced }) {
  const rideRoad = "M300 240 C 360 250, 420 265, 470 280 S 600 340, 645 385";
  const road = "M150 140 C 210 180, 250 210, 300 240 S 330 310, 330 330 M300 240 C 360 250, 420 265, 470 280 S 600 340, 645 385 M470 280 C 500 230, 530 170, 565 130";
  return (
    <svg className="mapSvg" viewBox="0 0 800 520" role="img"
      aria-label="Illustrated map of Belagavi region with venue and guest landmarks">
      <rect width="800" height="520" rx="14" fill="var(--bg2)" />
      {/* hills + river */}
      <path d="M0 470 Q 90 420 190 462 T 400 466 T 620 458 T 800 468 L 800 520 L 0 520 Z"
        fill="var(--maroon)" opacity=".18" />
      <path d="M0 495 Q 120 458 260 492 T 540 494 T 800 490 L 800 520 L 0 520 Z"
        fill="var(--gold)" opacity=".1" />
      <path d="M40 40 C 140 90, 120 200, 210 260 C 280 306, 300 380, 260 480"
        fill="none" stroke="var(--emerald)" strokeWidth="6" opacity=".28" strokeLinecap="round" />
      <text x="66" y="330" fill="var(--emerald)" opacity=".6" fontSize="11"
        style={{ letterSpacing: ".2em" }} transform="rotate(72 66 330)">GHATAPRABHA</text>
      {/* roads */}
      <path d={road} fill="none" stroke="var(--gold)" strokeWidth="2" opacity=".55" className="dash" />
      {!reduced && (
        <g aria-hidden="true">
          {/* auto-rickshaw shuttling Kolhapur ↔ Belagavi */}
          <g>
            <animateMotion dur="16s" repeatCount="indefinite" rotate="auto" calcMode="linear"
              keyPoints="0;1;0" keyTimes="0;0.5;1" path={rideRoad} />
            <rect x="-9" y="-7" width="18" height="10" rx="3" fill="var(--gold)" />
            <rect x="-5" y="-12" width="11" height="6" rx="2" fill="var(--rose)" />
            <circle cx="-5" cy="4" r="3" fill="var(--ink)" />
            <circle cx="5" cy="4" r="3" fill="var(--ink)" />
          </g>
          {/* monsoon birds */}
          <g stroke="var(--muted)" strokeWidth="1.6" fill="none" opacity=".75">
            <path d="M-6 0 Q-2 -4 0 0 Q2 -4 6 0">
              <animateMotion dur="19s" repeatCount="indefinite" path="M110 92 C 300 58 520 112 780 68" />
            </path>
            <path d="M-5 0 Q-1.6 -3.4 0 0 Q1.6 -3.4 5 0">
              <animateMotion dur="25s" repeatCount="indefinite" path="M50 142 C 260 100 540 150 790 108" />
            </path>
          </g>
        </g>
      )}
      {/* monsoon cloud */}
      <g transform="translate(660 52)" opacity=".85">
        <path d="M0 22 a14 14 0 0 1 26 -8 a12 12 0 0 1 22 6 a10 10 0 0 1 -4 19 h-36 a11 11 0 0 1 -8 -17z"
          fill="var(--card)" stroke="var(--line)" />
        <line className="drop" x1="14" y1="44" x2="10" y2="54" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" />
        <line className="drop d2" x1="30" y1="44" x2="26" y2="54" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" />
        <line className="drop d3" x1="46" y1="44" x2="42" y2="54" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" />
        <text x="-4" y="74" fontSize="10" fill="var(--muted)" style={{ letterSpacing: ".14em" }}>AUGUST MOOD</text>
      </g>
      {/* compass */}
      <g transform="translate(52 66)" stroke="var(--gold)" fill="none" opacity=".8">
        <circle r="18" /><path d="M0 -14 L4 0 L0 14 L-4 0 Z" fill="var(--gold)" />
        <text y="-24" textAnchor="middle" fill="var(--gold)" fontSize="11">N</text>
      </g>
      {/* pins */}
      {PINS.map((p) => {
        const on = active === p.id; const isVenue = p.id === "venue";
        return (
          <g key={p.id} className="pinbtn" tabIndex={0} role="button"
            aria-label={`${p.label} — ${p.km}`}
            onClick={() => setActive(p.id)}
            onKeyDown={(ev) => (ev.key === "Enter" || ev.key === " ") && setActive(p.id)}
            transform={`translate(${p.x} ${p.y})`}>
            <circle className="pinPulse" r="15" fill="none"
              stroke={isVenue ? "var(--rose)" : "var(--gold)"} strokeWidth="1.5" />
            <circle r={isVenue ? 17 : 13} fill={on ? "var(--gold)" : "var(--card)"}
              stroke={isVenue ? "var(--rose)" : "var(--gold)"} strokeWidth={on ? 2.4 : 1.5} />
            <text textAnchor="middle" dy="5" fontSize={isVenue ? 15 : 12}
              style={{ pointerEvents: "none" }}>{p.icon}</text>
            <text textAnchor="middle" y={isVenue ? 38 : 32} fontSize="11.5"
              fill={on ? "var(--gold)" : "var(--muted)"} fontWeight={on ? 700 : 400}
              style={{ pointerEvents: "none" }}>{p.label.split(" ").slice(0, 2).join(" ")}</text>
          </g>
        );
      })}
    </svg>
  );
}

