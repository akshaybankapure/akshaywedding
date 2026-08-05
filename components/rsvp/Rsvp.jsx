"use client";

import { useState, useEffect, useRef } from "react";
import { PartyPopper, Check, Plus, Minus } from "lucide-react";
import { VIBES, MEALS, CONFIG } from "@/lib/config";
import { useLang } from "@/lib/i18n";
import { clamp, fx } from "@/lib/helpers";
import { rsvpApi } from "@/lib/store";

export default function RSVP() {
  const { t } = useLang();
  const [vibe, setVibe] = useState(null);
  const [name, setName] = useState("");
  const [count, setCount] = useState(2);
  const [meal, setMeal] = useState(MEALS[0]);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(null);
  const [tally, setTally] = useState(0);
  const [saveErr, setSaveErr] = useState(false);
  const btnRef = useRef(null);
  useEffect(() => { rsvpApi.summary().then((d) => setTally(Number(d.heads) || 0)); }, []);
  const submit = async () => {
    if (!vibe || !name.trim()) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (fx.burst && rect) fx.burst(rect.left + rect.width / 2, rect.top);
    const attending = vibe !== "afar";
    setDone({ name: name.trim(), count, attending });
    try {
      const res = await rsvpApi.submit({ name: name.trim(), vibe, count, meal, note });
      if (typeof res.heads === "number") setTally(res.heads);
    } catch {
      setSaveErr(true);           // tell them honestly rather than pretending
    }
  };
  if (done) return (
    <div className="card confirm">
      <div className="confRing"><Check size={38} strokeWidth={2.5} /></div>
      <h3 className="display" style={{ fontSize: "clamp(24px,4vw,36px)" }}>
        Shubh Mangal <span className="goldtxt">SAVED-haan!</span> 🎉
      </h3>
      <p className="lede" style={{ margin: "10px auto 0" }}>
        {done.attending
          ? `${done.name}, you + ${done.count - 1 || "no"} more = counted, fed, and expected on the dance floor.`
          : `${done.name}, we'll miss you badly — we'll send you the photos.`}
      </p>
      {tally > 0 && <p className="meter"><b>{tally}</b> {t("alreadyComing")}</p>}
      {saveErr && (
        <p className="meter" style={{ color: "var(--rose)" }}>
          We couldn't reach the server — please call {CONFIG.contact.replace("RSVP · ", "")} so we don't miss you.
        </p>
      )}
    </div>
  );
  return (
    <div>
      <div className="vibes" role="radiogroup" aria-label="How are you attending?">
        {VIBES.map((v, i) => (
          <button key={v.id} style={{ animationDelay: `${i * 70}ms` }} role="radio" aria-checked={vibe === v.id}
            className={`vibe ${vibe === v.id ? "on" : ""}`} onClick={() => setVibe(v.id)}>
            <span className="ve" aria-hidden="true">{v.emoji}</span>
            <h4 className="display">{v.title}</h4>
            <p>{v.sub}</p>
            <span className="tick"><Check size={13} /></span>
          </button>
        ))}
      </div>
      <div className="formRow">
        <div className="field">
          <label htmlFor="ps-name">{t("yourName")}</label>
          <input id="ps-name" className="input" value={name} maxLength={48}
            placeholder="e.g. Sneha Khot-Magadum" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>{t("howMany")}</label>
          <div className="step">
            <button aria-label="Fewer guests" onClick={() => setCount((c) => Math.max(1, c - 1))}><Minus size={16} /></button>
            <b className="display">{count}</b>
            <button aria-label="More guests" onClick={() => setCount((c) => Math.min(8, c + 1))}><Plus size={16} /></button>
          </div>
        </div>
      </div>
      <div className="formRow">
        <div className="field">
          <label>{t("mealPref")}</label>
          <div className="seg" role="radiogroup" aria-label="Meal preference">
            {MEALS.map((m) => (
              <button key={m} role="radio" aria-checked={meal === m}
                className={meal === m ? "on" : ""} onClick={() => setMeal(m)}>{m}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="ps-note">{t("anythingKnow")}</label>
          <input id="ps-note" className="input" value={note} maxLength={90}
            placeholder="Travelling with elders / need help with stairs / arriving late"
            onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
      <button ref={btnRef} className="btn solid" style={{ fontSize: 15, padding: "14px 26px" }}
        disabled={!vibe || !name.trim()} onClick={submit}
        title={!vibe || !name.trim() ? "Pick a vibe + tell us your name" : "Lock it in"}>
        <PartyPopper size={16} /> {t("sendRsvp")} ✓
      </button>
      <p className="privacyNote" style={{ marginTop: 12 }}>
        Your RSVP lands straight on the family guest list — the tally above updates live.
      </p>
    </div>
  );
}

