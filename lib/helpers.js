export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const pad2 = (n) => String(n).padStart(2, "0");
const DAYNAME = { "2026-08-07": "Friday", "2026-08-08": "Saturday", "2026-08-09": "Sunday" };
export const prettyDate = (d) => `${DAYNAME[d] || ""} · ${d.slice(8)} Aug`;
export const to12h = (t) => { const [h, m] = t.split(":").map(Number); const ap = h >= 12 ? "PM" : "AM"; return `${((h + 11) % 12) + 1}:${pad2(m)} ${ap}`; };

/* fx bus — the petal canvas registers a burst() so any component can
   throw akshata + marigolds from a screen point. */
export const fx = { burst: null };
