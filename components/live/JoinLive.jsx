"use client";

import { useState, useEffect } from "react";
import { Video, Lock } from "lucide-react";
import { CONFIG } from "@/lib/config";
import { useLang } from "@/lib/i18n";

/* ═══════════════════════════════════════════════════════════════════
   JOIN THE MUHURAT — the always-visible button.

   It sits in the page from the day the invitation goes out, deliberately
   disabled, so guests who can't travel know the moment exists and can
   plan around it. It unlocks itself two minutes before the akshata and
   locks again half an hour after.

   Opening the ceremony is handled by LiveCeremony, which owns that
   state; this button just fires a window event it listens for. That
   keeps one source of truth for the ceremony rather than two.
   ═══════════════════════════════════════════════════════════════════ */

const MUHURAT = new Date(CONFIG.weddingISO).getTime();
const OPEN_EARLY = 2 * 60 * 1000;
const WINDOW_END = 30 * 60 * 1000;

export default function JoinLive() {
  const { t } = useLang();
  const [now, setNow] = useState(null);       // null until mounted
  const [forced, setForced] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const at = Number(q.get("at"));
    const rehearsal = q.get("rehearsal") === "1";
    setForced(rehearsal);
    const offset = (!Number.isNaN(at) && q.get("at") !== null) ? at * 60000 : 0;

    const tick = () => setNow(Date.now() + offset);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return (
      <button className="joinLive" disabled aria-disabled="true">
        <Lock size={15} /> <b>{t("joinLive")}</b>
      </button>
    );
  }

  const delta = forced ? 0 : MUHURAT - now;
  const live = forced || (delta <= 0 && delta > -WINDOW_END);
  const unlocked = forced || (delta < OPEN_EARLY && delta > -WINDOW_END);
  const over = !forced && delta <= -WINDOW_END;

  const when = new Date(MUHURAT).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", day: "numeric", month: "short",
    hour: "numeric", minute: "2-digit",
  });

  if (over) {
    return (
      <div className="joinDone">
        <b>The akshata has been thrown 🌾</b>
        <span>Thank you to everyone who joined from afar.</span>
      </div>
    );
  }

  return (
    <button
      className={`joinLive ${live ? "live" : ""}`}
      disabled={!unlocked}
      aria-disabled={!unlocked}
      onClick={() => window.dispatchEvent(new CustomEvent("aws:open-ceremony"))}
    >
      {unlocked ? <Video size={16} /> : <Lock size={14} />}
      <span className="joinTxt">
        <b>{live ? t("happeningNow") : t("joinLive")}</b>
        <i>{unlocked ? t("tapAsMany") : `Opens ${when} IST · throw akshata from wherever you are`}</i>
      </span>
      {live && <span className="livePulse" aria-hidden="true" />}
    </button>
  );
}
