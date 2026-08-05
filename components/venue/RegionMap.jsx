"use client";

import { PINS } from "@/lib/config";
import { useLang } from "@/lib/i18n";

/* ═══════════════════════════════════════════════════════════════════
   The region, drawn rather than embedded.

   Geography is real, north at the top: Kolhapur sits up in Maharashtra,
   the state line runs below it, then Nippani on the highway, then the
   venue up on Tavandi hill, and Belagavi with its airport furthest south. NH-48
   threads all four together — which is genuinely how most guests will
   arrive.

   Portrait viewBox because this is read on a phone first. Everything is
   flat vector illustration: no tiles to load, no API key, no cost, and
   it keeps working when the venue has no signal.
   ═══════════════════════════════════════════════════════════════════ */

/* the highway, and the path the little rickshaw drives */
const NH48 = "M262 44 C 246 104, 214 142, 196 190 C 182 226, 168 244, 156 268 C 140 300, 122 344, 110 392";

const PLACES = {
  kop:     { x: 262, y: 44,  label: "Kolhapur",        sub: "Maharashtra" },
  nippani: { x: 196, y: 190, label: "Nippani",         sub: "last stop for supplies" },
  venue:   { x: 156, y: 268, label: "Tavandi",         sub: "Shri Kshetra Stavanidhi" },
  ixg:     { x: 110, y: 392, label: "Belagavi · IXG",  sub: "nearest airport" },
};

export default function RegionMap({ active, setActive, reduced }) {
  const { t } = useLang();
  return (
    <div className="mapWrap">
      <svg className="regionMap" viewBox="0 0 380 440" role="img"
        aria-label="Map of the region: Kolhapur, Nippani, the venue on Tavandi hill at Shri Kshetra Stavanidhi, and Belagavi airport, linked by highway NH-48.">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--maroon)" stopOpacity=".16" />
            <stop offset="100%" stopColor="var(--emerald)" stopOpacity=".1" />
          </linearGradient>
          <linearGradient id="riverG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3fa9e0" stopOpacity=".15" />
            <stop offset="50%" stopColor="#3fa9e0" stopOpacity=".55" />
            <stop offset="100%" stopColor="#3fa9e0" stopOpacity=".15" />
          </linearGradient>
        </defs>

        <rect width="380" height="440" fill="url(#sky)" rx="16" />

        {/* layered ghats — paper-cut silhouettes, far to near */}
        <path className="ridge far"  d="M0 150 L46 118 L92 148 L140 106 L196 152 L250 116 L306 154 L380 118 L380 440 L0 440 Z" />
        <path className="ridge mid"  d="M0 214 L58 178 L118 216 L182 170 L244 214 L310 180 L380 218 L380 440 L0 440 Z" />
        <path className="ridge near" d="M0 300 L70 262 L142 302 L214 258 L286 300 L380 264 L380 440 L0 440 Z" />

        {/* rivers */}
        <path className="river" d="M-10 236 C 70 224, 130 258, 200 244 C 268 230, 320 256, 390 246" />
        <path className="river thin" d="M-10 340 C 80 330, 150 356, 230 344 C 300 334, 340 352, 390 344" />

        {/* the state line the two families meet across */}
        <path className="border" d="M0 132 C 90 122, 180 146, 270 130 C 320 121, 350 128, 380 124" />
        <text className="stateLabel" x="20" y="120">MAHARASHTRA</text>
        <text className="stateLabel" x="20" y="152">KARNATAKA</text>

        {/* NH-48 */}
        <path className="road" d={NH48} />
        <path className="roadDash" d={NH48} />
        <text className="roadLabel" x="232" y="120" transform="rotate(58 232 120)">NH-48</text>

        {/* a rickshaw making the trip, drawn flat and small */}
        {!reduced && (
          <g className="traveller">
            <animateMotion dur="22s" repeatCount="indefinite" rotate="auto" path={NH48} />
            <g transform="rotate(90)">
              <path d="M-7 2 L-7 -3 Q-7 -7 -3 -7 L3 -7 Q7 -7 7 -2 L7 2 Z" fill="var(--gold)" />
              <rect x="-7" y="2" width="14" height="2.4" rx="1" fill="var(--maroon)" />
              <circle cx="-4" cy="4.6" r="1.9" fill="var(--ink)" opacity=".85" />
              <circle cx="4" cy="4.6" r="1.9" fill="var(--ink)" opacity=".85" />
            </g>
          </g>
        )}

        {/* monsoon cloud — it is August, after all */}
        {!reduced && (
          <g className="cloud">
            <ellipse cx="86" cy="62" rx="34" ry="14" />
            <ellipse cx="66" cy="66" rx="22" ry="11" />
            <ellipse cx="108" cy="68" rx="24" ry="11" />
            {[0, 1, 2, 3].map((i) => (
              <line key={i} className="rain" x1={64 + i * 15} y1="76" x2={61 + i * 15} y2="90"
                style={{ animationDelay: `${i * 0.28}s` }} />
            ))}
          </g>
        )}

        {/* the four places */}
        {PINS.filter((p) => PLACES[p.id]).map((p) => {
          const g = PLACES[p.id];
          const on = active === p.id;
          const isVenue = p.id === "venue";
          return (
            <g key={p.id}
              className={`pin ${on ? "on" : ""} ${isVenue ? "venue" : ""}`}
              transform={`translate(${g.x} ${g.y})`}
              role="button" tabIndex={0}
              aria-label={`${g.label} — ${g.sub}`}
              onClick={() => setActive(p.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(p.id); } }}>
              {isVenue && !reduced && <circle className="halo" r="13" />}
              <circle className="hit" r="22" />
              <circle className="dot" r={isVenue ? 7 : 5} />
              {isVenue && <path className="star" d="M0 -13 L2.6 -5 L11 -5 L4.2 0 L6.8 8 L0 3 L-6.8 8 L-4.2 0 L-11 -5 L-2.6 -5 Z" />}
              <text className="pinLabel" x={g.x > 200 ? -14 : 14} y="-9"
                textAnchor={g.x > 200 ? "end" : "start"}>{g.label}</text>
              <text className="pinSub" x={g.x > 200 ? -14 : 14} y="3"
                textAnchor={g.x > 200 ? "end" : "start"}>{g.sub}</text>
            </g>
          );
        })}

        {/* compass */}
        <g className="compass" transform="translate(340 400)">
          <circle r="15" />
          <path d="M0 -10 L3.4 1 L0 -1.6 L-3.4 1 Z" className="needle" />
          <text y="-17" textAnchor="middle">N</text>
        </g>
      </svg>

      <p className="mapHint">{t("mapHint")}</p>
    </div>
  );
}
