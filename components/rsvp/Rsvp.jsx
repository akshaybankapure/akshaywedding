"use client";

import { useState, useEffect, useRef } from "react";
import { PartyPopper, Check, Plus, Minus } from "lucide-react";
import { VIBES, MEALS } from "@/lib/config";
import { clamp, fx } from "@/lib/helpers";
import { store } from "@/lib/store";
import { LotusBloom } from "@/components/decor/Ornaments";
import Reveal from "@/components/fx/Reveal";
import Rings3D from "@/components/rsvp/Rings3D";

export default function RSVP() {
  const [vibe, setVibe] = useState(null);
  const [name, setName] = useState("");
  const [count, setCount] = useState(2);
  const [meal, setMeal] = useState(MEALS[0]);
  const [song, setSong] = useState("");
  const [done, setDone] = useState(null);
  const [tally, setTally] = useState(87);
  const btnRef = useRef(null);
  useEffect(() => { store.get("ps-rsvp-tally-v1", 87).then((t) => setTally(Number(t) || 87)); }, []);
  const submit = async () => {
    if (!vibe || !name.trim()) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (fx.burst && rect) fx.burst(rect.left + rect.width / 2, rect.top);
    const attending = vibe !== "afar";
    const newTally = tally + (attending ? count : 0);
    setTally(newTally); setDone({ name: name.trim(), count, attending });
    const log = await store.get("ps-rsvp-log-v1", []);
    log.push({ name: name.trim(), vibe, count, meal, song, ts: Date.now() });
    await store.set("ps-rsvp-log-v1", log);
    await store.set("ps-rsvp-tally-v1", newTally);
  };
  if (done) return (
    <div className="card confirm">
      <div className="confRing"><Check size={38} strokeWidth={2.5} /></div>
      <LotusBloom />
      <Rings3D />
      <h3 className="display" style={{ fontSize: "clamp(24px,4vw,36px)" }}>
        Shubh Mangal <span className="goldtxt">SAVED-haan!</span> 🎉
      </h3>
      <p className="lede" style={{ margin: "10px auto 0" }}>
        {done.attending
          ? `${done.name}, you + ${done.count - 1 || "no"} more = counted, fed, and expected on the dance floor.`
          : `${done.name}, we'll miss you badly — a laddoo courier is being arranged.`}
      </p>
      <p className="humor" style={{ marginTop: 14 }}>Pro tip: stretch before the Sangeet.</p>
      <p className="meter"><b>{tally}+</b> guests have already said "yeta!"</p>
    </div>
  );
  return (
    <div>
      <div className="vibes" role="radiogroup" aria-label="How are you attending?">
        {VIBES.map((v, i) => (
          <Reveal as="button" key={v.id} delay={i * 70} role="radio" aria-checked={vibe === v.id}
            className={`vibe ${vibe === v.id ? "on" : ""}`} onClick={() => setVibe(v.id)}>
            <span className="ve" aria-hidden="true">{v.emoji}</span>
            <h4 className="display">{v.title}</h4>
            <p>{v.sub}</p>
            <span className="tick"><Check size={13} /></span>
          </Reveal>
        ))}
      </div>
      <div className="formRow">
        <div className="field">
          <label htmlFor="ps-name">Your good name</label>
          <input id="ps-name" className="input" value={name} maxLength={48}
            placeholder="e.g. Sneha Khot-Magadum" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Total jankar (people)</label>
          <div className="step">
            <button aria-label="Fewer guests" onClick={() => setCount((c) => Math.max(1, c - 1))}><Minus size={16} /></button>
            <b className="display">{count}</b>
            <button aria-label="More guests" onClick={() => setCount((c) => Math.min(8, c + 1))}><Plus size={16} /></button>
          </div>
        </div>
      </div>
      <div className="formRow">
        <div className="field">
          <label>Jevan preference (all pure veg)</label>
          <div className="seg" role="radiogroup" aria-label="Meal preference">
            {MEALS.map((m) => (
              <button key={m} role="radio" aria-checked={meal === m}
                className={meal === m ? "on" : ""} onClick={() => setMeal(m)}>{m}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="ps-song">One song you WILL dance to</label>
          <input id="ps-song" className="input" value={song} maxLength={64}
            placeholder="DJ takes bribes in Kunda" onChange={(e) => setSong(e.target.value)} />
        </div>
      </div>
      <button ref={btnRef} className="btn solid" style={{ fontSize: 15, padding: "14px 26px" }}
        disabled={!vibe || !name.trim()} onClick={submit}
        title={!vibe || !name.trim() ? "Pick a vibe + tell us your name" : "Lock it in"}>
        <PartyPopper size={16} /> Pakka done ✓
      </button>
      <p className="privacyNote" style={{ marginTop: 12 }}>
        Your RSVP lands straight on the family guest list — the tally above updates live.
      </p>
    </div>
  );
}

