"use client";

import { fx } from "@/lib/helpers";

export const Mandala = ({ style }) => (
  <svg className="mandala" style={style} viewBox="0 0 400 400" aria-hidden="true">
    <g fill="none" stroke="var(--gold)" strokeWidth="0.8">
      <circle cx="200" cy="200" r="196" opacity=".5" />
      <circle cx="200" cy="200" r="150" opacity=".6" />
      <circle cx="200" cy="200" r="96" opacity=".7" />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * Math.PI) / 12;
        const x1 = 200 + Math.cos(a) * 96, y1 = 200 + Math.sin(a) * 96;
        const x2 = 200 + Math.cos(a) * 196, y2 = 200 + Math.sin(a) * 196;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} opacity=".35" />;
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI) / 6;
        const cx = 200 + Math.cos(a) * 150, cy = 200 + Math.sin(a) * 150;
        return <ellipse key={i} cx={cx} cy={cy} rx="26" ry="11"
          transform={`rotate(${(i * 30) + 90} ${cx} ${cy})`} opacity=".55" />;
      })}
      <path d="M200 118 C 218 146, 218 162, 200 178 C 182 162, 182 146, 200 118 Z" opacity=".8" />
      <path d="M200 282 C 218 254, 218 238, 200 222 C 182 238, 182 254, 200 282 Z" opacity=".8" />
      <path d="M118 200 C 146 182, 162 182, 178 200 C 162 218, 146 218, 118 200 Z" opacity=".8" />
      <path d="M282 200 C 254 182, 238 182, 222 200 C 238 218, 254 218, 282 200 Z" opacity=".8" />
    </g>
  </svg>
);


export const Diya = ({ style, slow }) => (
  <svg className="diya" style={style} viewBox="0 0 60 60" aria-hidden="true">
    <ellipse cx="30" cy="46" rx="20" ry="8" fill="var(--maroon)" stroke="var(--gold)" strokeWidth="1.4" />
    <ellipse cx="30" cy="43" rx="14" ry="4.5" fill="#3a0d18" />
    <g className={slow ? "flame f2" : "flame"}>
      <path d="M30 18 C 36 27, 35 34, 30 38 C 25 34, 24 27, 30 18 Z" fill="#ffb347" />
      <path d="M30 24 C 33 29, 33 33, 30 36 C 27 33, 27 29, 30 24 Z" fill="#ffe9a8" />
    </g>
  </svg>
);

/* Petal + akshata particle engine — marigold petals drift ambiently,
   grains + petals burst on demand via fx.burst(x, y). */
