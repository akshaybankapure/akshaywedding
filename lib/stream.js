/* ═══════════════════════════════════════════════════════════════════
   What kind of stream link is this, and can it be embedded?
   Shared by the public player and the admin panel so both agree.
   ═══════════════════════════════════════════════════════════════════ */

/** A specific video/stream id, from any of YouTube's share formats. */
export function youtubeId(url) {
  const m = String(url || "").match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{6,})/
  );
  return m ? m[1] : null;
}

/** A channel's "whatever is live right now" URL — embeddable by channel id. */
export function youtubeChannelId(url) {
  const m = String(url || "").match(/youtube\.com\/channel\/(UC[\w-]{10,})/);
  return m ? m[1] : null;
}

/** studio.youtube.com/video/<id>/livestreaming — the id is usable. */
function studioId(url) {
  const m = String(url || "").match(/studio\.youtube\.com\/video\/([\w-]{6,})/);
  return m ? m[1] : null;
}

/** The src an <iframe> should use, or null if it can't be embedded. */
export function embedSrc(url) {
  const id = youtubeId(url) || studioId(url);
  if (id) return `https://www.youtube.com/embed/${id}?rel=0&playsinline=1`;
  const ch = youtubeChannelId(url);
  if (ch) return `https://www.youtube.com/embed/live_stream?channel=${ch}&rel=0&playsinline=1`;
  return null;
}

/** Plain-language description for the admin, so there are no surprises. */
export function describeStream(url) {
  const u = String(url || "").trim();
  if (!u) return { kind: "none", ok: true, text: "No link set — the video section is hidden from guests." };

  if (!/^https?:\/\//i.test(u)) {
    return { kind: "invalid", ok: false, text: "That doesn't look like a link — it should start with https://" };
  }

  if (youtubeId(u) || studioId(u)) {
    return { kind: "youtube", ok: true, src: embedSrc(u),
      text: "YouTube — plays embedded inside the invitation. No limit on viewers." };
  }
  if (youtubeChannelId(u)) {
    return { kind: "youtube", ok: true, src: embedSrc(u),
      text: "YouTube channel — embeds whatever that channel is streaming live." };
  }

  /* The one that trips people up: copying the address bar from a channel
     page gives youtube.com/@handle/live, which has no id in it and cannot
     be embedded. Tell them exactly how to get a link that works. */
  if (/youtube\.com\/@[\w.-]+\/live/i.test(u)) {
    return {
      kind: "yt-handle", ok: false,
      text: "This is a channel handle link (…/@name/live) — it has no video id, so it can't be embedded. Open the live stream itself, tap Share, and paste that link instead (it will look like youtu.be/xxxxxxxx).",
    };
  }
  if (/youtube\.com|youtu\.be/i.test(u)) {
    return {
      kind: "yt-unknown", ok: false,
      text: "This looks like YouTube but has no video id in it. Open the stream, tap Share, and paste that link (youtu.be/xxxxxxxx).",
    };
  }

  if (/meet\.google\.com/i.test(u)) {
    return { kind: "meet", ok: true,
      text: "Google Meet — shows a Join button, because Google blocks video calls from being embedded. Free Meet stops at 100 people." };
  }
  return { kind: "other", ok: true, text: "Unrecognised provider — guests will get a Join button." };
}
