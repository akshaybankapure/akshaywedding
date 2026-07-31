"use client";

import { MapPin, CalendarPlus, Download, Clock } from "lucide-react";
import { GUIDE } from "@/lib/config";
import { prettyDate, to12h } from "@/lib/helpers";
import { gcalUrl, downloadICS } from "@/lib/calendar";
import Reveal from "@/components/fx/Reveal";
import Tilt from "@/components/fx/Tilt";

export default function EventCard({ e, i }) {
  return (
    <Reveal delay={i * 90}>
    <Tilt className="card event sheen">
      <span className="emoji" aria-hidden="true">{e.emoji}</span>
      <h3 className="display">{e.title}</h3>
      <span className="tag">{e.tag}</span>
      <div className="meta">
        <Clock size={14} aria-hidden="true" /> {prettyDate(e.date)} · {to12h(e.start)}–{to12h(e.end)}
      </div>
      <div className="meta"><MapPin size={14} aria-hidden="true" /> {e.place}</div>
      <div className="evBtns">
        <a className="btn ghost" href={gcalUrl(e)} target="_blank" rel="noopener noreferrer">
          <CalendarPlus size={14} /> Google
        </a>
        <button className="btn ghost" onClick={() => downloadICS(e)}>
          <Download size={14} /> Apple / .ics
        </button>
      </div>
      <div className="dressline"><b style={{ color: "var(--gold)" }}>Dress:</b> {e.dress} <em style={{ opacity: .8 }}>· {e.note}</em></div>
    </Tilt>
    </Reveal>
  );
}

/* ════════════════════════════════════════════════════════════════════
   VENUE MAP + LOCAL GUIDE
   ════════════════════════════════════════════════════════════════════ */
