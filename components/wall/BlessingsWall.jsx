"use client";

import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { SEED_BLESSINGS } from "@/lib/config";
import { fx } from "@/lib/helpers";
import { blessingsApi } from "@/lib/store";

export default function BlessingsWall() {
  const [items, setItems] = useState(SEED_BLESSINGS);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  useEffect(() => {
    blessingsApi.list().then((live) => setItems([...live, ...SEED_BLESSINGS]));
  }, []);
  const addEmoji = (e) => setMsg((m) => (m + " " + e).trim().slice(0, 160));
  const post = async () => {
    if (!msg.trim()) return;
    const entry = {
      id: `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      who: (name.trim() || "Someone lovely").slice(0, 30),
      txt: msg.trim().slice(0, 160),
      c: (Math.random() * 4) | 0,
      ts: Date.now(),
    };
    setItems([entry, ...items]); setMsg(""); setSent(true);
    setTimeout(() => setSent(false), 2500);
    if (fx.burst) fx.burst(window.innerWidth / 2, window.innerHeight * 0.35);
    try {
      const live = await blessingsApi.post(entry);
      if (live.length) setItems([...live, ...SEED_BLESSINGS]);
    } catch { /* keep it on screen even if the save failed */ }
  };
  const tints = [
    "linear-gradient(150deg, rgba(227,179,65,.14), transparent)",
    "linear-gradient(150deg, rgba(255,93,143,.13), transparent)",
    "linear-gradient(150deg, rgba(35,192,143,.12), transparent)",
    "linear-gradient(150deg, rgba(124,31,56,.2), transparent)",
  ];
  return (
    <div>
      <div className="card" style={{ padding: 22, maxWidth: 720 }}>
        <div className="formRow" style={{ marginBottom: 12 }}>
          <div className="field">
            <label htmlFor="ps-bmsg">Your blessing (140-ish characters of pure love)</label>
            <input id="ps-bmsg" className="input" value={msg} maxLength={160}
              placeholder="May your arguments end in laughter and your fridge in laddoos…"
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && post()} />
          </div>
          <div className="field">
            <label htmlFor="ps-bname">From (optional)</label>
            <input id="ps-bname" className="input" value={name} maxLength={30}
              placeholder="Aaji, Kaka, college gang…" onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <div className="emos" aria-label="Quick emoji blessings">
            {["🙏", "❤️", "🪔", "🌸", "🥳", "🍛"].map((e) => (
              <button key={e} onClick={() => addEmoji(e)} aria-label={`Add ${e}`}>{e}</button>
            ))}
          </div>
          <button className="btn solid" onClick={post} disabled={!msg.trim()}>
            <Send size={14} /> {sent ? "Blessed! 🌸" : "Pin it to the wall"}
          </button>
        </div>
        <p className="privacyNote" style={{ marginTop: 12 }}>
          Everyone opening this invite can read the wall — so keep it lovely.
        </p>
      </div>
      <div className="wall">
        {items.map((b, i) => (
          <div className="card bless" key={b.id || b.ts || `seed-${i}`}
            style={{ background: tints[(b.c ?? i) % 4] }}>
            <p>{b.txt}</p><span>— {b.who}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN — full-screen story chapters
   ════════════════════════════════════════════════════════════════════ */
