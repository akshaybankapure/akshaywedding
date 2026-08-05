/* Admin: set or clear the live-stream link on the day. */
import { requireAdmin } from "@/lib/server/auth";
import { getSetting, setSetting } from "@/lib/server/data";
import { describeStream } from "@/lib/stream";
import { CONFIG } from "@/lib/config";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: "unauthorised" }, { status: 401 });
  const saved = await getSetting("stream-v1", null);
  const s = saved || CONFIG.stream || {};
  return Response.json({ url: s.url || "", label: s.label || "", note: s.note || "", saved: !!saved });
}

export async function POST(req) {
  if (!await requireAdmin()) return Response.json({ error: "unauthorised" }, { status: 401 });
  const { url, label, note } = await req.json().catch(() => ({}));
  const clean = String(url || "").trim();

  const info = describeStream(clean);
  if (!info.ok) return Response.json({ ok: false, error: info.text }, { status: 400 });

  await setSetting("stream-v1", {
    url: clean,
    label: String(label || "").trim() || "Watch the muhurat live",
    note: String(note || "").trim(),
  });
  return Response.json({ ok: true, kind: info.kind, text: info.text });
}
