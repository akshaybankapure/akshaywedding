import { CONFIG } from "@/lib/config";

/* ═══════════════════════════════════════════════════════════════════
   Calendar links.

   Both formats point at the venue's exact coordinates rather than a
   text address — the pin sits on Tavandi but Google files the area
   under a neighbouring village name, and a text search could send a
   guest to the wrong place. Coordinates are unambiguous.
   ═══════════════════════════════════════════════════════════════════ */

const placeText = (e) => `${e.place}, ${CONFIG.venue.area}`;

const gcalStamp = (date, time) => `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;

export const gcalUrl = (e) => {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${e.emoji} ${e.title} — ${CONFIG.hashtag}`,
    dates: `${gcalStamp(e.date, e.start)}/${gcalStamp(e.date, e.end)}`,
    ctz: "Asia/Kolkata",
    details: `${e.tag}\n\n${placeText(e)}\nMap: ${CONFIG.venue.maps}`,
    location: `${placeText(e)} (${CONFIG.venue.geo})`,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
};

const utcStamp = (date, time) =>
  new Date(`${date}T${time}:00+05:30`).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

/* RFC 5545 §3.3.11: backslash, semicolon, comma and newline must be
   escaped inside a TEXT value. The venue coordinates contain a comma,
   so skipping this would truncate the location in Apple Calendar. */
const esc = (v) => String(v)
  .replace(/\\/g, "\\\\")
  .replace(/;/g, "\\;")
  .replace(/,/g, "\\,")
  .replace(/\r?\n/g, "\\n");

export const downloadICS = (e) => {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AkshayShraddha//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${e.id}-2026@akshay-weds-shraddha`,
    `DTSTAMP:${utcStamp("2026-08-01", "00:00")}`,
    `DTSTART:${utcStamp(e.date, e.start)}`,
    `DTEND:${utcStamp(e.date, e.end)}`,
    `SUMMARY:${esc(`${e.emoji} ${e.title} — ${CONFIG.hashtag}`)}`,
    `DESCRIPTION:${esc(`${e.tag}\n\nDress: ${e.dress}\nMap: ${CONFIG.venue.maps}`)}`,
    `LOCATION:${esc(`${placeText(e)} (${CONFIG.venue.geo})`)}`,
    /* the machine-readable pin — phones use this to drop a marker */
    `GEO:${CONFIG.venue.lat};${CONFIG.venue.lng}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.id}-akshay-weds-shraddha.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
};
