"use client";

import { useEffect, useState } from "react";
import { Video, ExternalLink } from "lucide-react";
import { CONFIG } from "@/lib/config";
import { youtubeId } from "@/lib/stream";

/* ═══════════════════════════════════════════════════════════════════
   LIVE STREAM

   The link comes from the server, not the bundle, so someone can paste
   it into /admin on the morning of the wedding and it appears for
   everyone — including guests who already have the page open, because
   this polls every 40 seconds.

   YouTube plays embedded. Google Meet can't be embedded (Google sends
   X-Frame-Options: DENY), so a Meet link becomes a Join button instead
   of a blank box.
   ═══════════════════════════════════════════════════════════════════ */

export default function LiveStream({ compact = false }) {
  const [stream, setStream] = useState(() => CONFIG.stream || { url: "", label: "", note: "" });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/stream", { cache: "no-store" });
        if (!r.ok) return;
        const s = await r.json();
        if (alive) setStream(s);
      } catch { /* keep whatever we already have */ }
    };
    load();
    const id = setInterval(load, 40000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { alive = false; clearInterval(id); window.removeEventListener("focus", onFocus); };
  }, []);

  const url = (stream?.url || "").trim();
  if (!url) return null;

  const label = stream.label || "Watch the muhurat live";
  const yt = youtubeId(url);

  return (
    <div className={`streamCard ${compact ? "compact" : ""}`}>
      <span className="streamTag"><Video size={12} /> {label}</span>

      {yt ? (
        <div className="streamFrame">
          <iframe
            src={`https://www.youtube.com/embed/${yt}?rel=0&playsinline=1&autoplay=0`}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <a className="btn solid streamBtn" href={url} target="_blank" rel="noopener noreferrer">
          <Video size={16} /> Join the live stream <ExternalLink size={13} />
        </a>
      )}

      {stream.note && <p className="streamNote">{stream.note}</p>}
    </div>
  );
}
