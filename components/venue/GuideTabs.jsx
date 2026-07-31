"use client";

import { useState } from "react";
import { Utensils, Plane, Shirt, Star } from "lucide-react";
import { GUIDE } from "@/lib/config";
import RSVP from "@/components/rsvp/Rsvp";

export default function GuideTabs() {
  const [tab, setTab] = useState("khaana");
  const TABS = [
    ["khaana", "Khaana", Utensils], ["pehnava", "Pehnava", Shirt],
    ["pravaas", "Pravaas", Plane], ["insider", "Insider", Star],
  ];
  return (
    <div>
      <div className="tabs" role="tablist" aria-label="Local guide">
        {TABS.map(([id, label, Icon]) => (
          <button key={id} role="tab" aria-selected={tab === id}
            className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
            <Icon size={14} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {GUIDE[tab].map(([k, v]) => (
          <div className="guideRow" key={k}><b>{k}</b><span>{v}</span></div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   RSVP + BLESSINGS WALL (shared-visibility demo storage)
   ════════════════════════════════════════════════════════════════════ */
