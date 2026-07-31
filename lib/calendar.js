import { CONFIG } from "@/lib/config";

const gcalStamp = (date, time) => `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
export const gcalUrl = (e) => {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${e.emoji} ${e.title} — ${CONFIG.hashtag}`,
    dates: `${gcalStamp(e.date, e.start)}/${gcalStamp(e.date, e.end)}`,
    ctz: "Asia/Kolkata",
    details: `${e.tag}. ${e.note}`,
    location: `${e.place}, ${CONFIG.city}`,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
};
const utcStamp = (date, time) =>
  new Date(`${date}T${time}:00+05:30`).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
export const downloadICS = (e) => {
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AkshayShraddha//Wedding//EN", "BEGIN:VEVENT",
    `UID:${e.id}-2026@parshva-sayali`, `DTSTAMP:${utcStamp("2026-07-30", "00:00")}`,
    `DTSTART:${utcStamp(e.date, e.start)}`, `DTEND:${utcStamp(e.date, e.end)}`,
    `SUMMARY:${e.emoji} ${e.title} — ${CONFIG.hashtag}`,
    `DESCRIPTION:${e.tag}. ${e.note}`, `LOCATION:${e.place}, ${CONFIG.city}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${e.id}-parshva-sayali.ics`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
};

