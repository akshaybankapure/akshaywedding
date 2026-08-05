/* ═══════════════════════════════════════════════════════════════════
   Which kind of stream link is this?
   Shared by the public player and the admin panel so both agree.
   ═══════════════════════════════════════════════════════════════════ */

export function youtubeId(url) {
  const m = String(url || "").match(
    /(?:youtube\.com\/(?:watch\?v=|live\/|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/
  );
  return m ? m[1] : null;
}

/** Describes a link so the admin sees exactly what guests will get. */
export function describeStream(url) {
  const u = String(url || "").trim();
  if (!u) return { kind: "none", ok: true, text: "No link set — the stream section is hidden." };

  const yt = youtubeId(u);
  if (yt) {
    return {
      kind: "youtube", id: yt, ok: true,
      text: "YouTube — plays embedded inside the invitation. No participant limit.",
    };
  }
  if (/meet\.google\.com/i.test(u)) {
    return {
      kind: "meet", ok: true,
      text: "Google Meet — shows a Join button (Google blocks embedding). 100-person limit.",
    };
  }
  if (!/^https?:\/\//i.test(u)) {
    return { kind: "invalid", ok: false, text: "That doesn't look like a link — it should start with https://" };
  }
  return { kind: "other", ok: true, text: "Unknown provider — will show as a Join button." };
}
