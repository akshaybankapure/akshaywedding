/* The public wall: read visible blessings, post a new one. */
import { addBlessing, listBlessings } from "@/lib/server/data";
export const dynamic = "force-dynamic";

let lastLog = 0;
function logOnce(e) {
  const now = Date.now();
  if (now - lastLog < 60000) return;
  lastLog = now;
  console.error("blessings failing:", e?.code || e?.message);
  if (e?.attempts) for (const a of e.attempts) console.error("      " + a);
}

export async function GET() {
  try { return Response.json({ items: await listBlessings() }); }
  catch (e) { logOnce(e); return Response.json({ items: [] }); }
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || !String(body.txt || "").trim())
    return Response.json({ error: "message required" }, { status: 400 });
  try {
    return Response.json({ ok: true, items: await addBlessing(body) });
  } catch (e) {
    logOnce(e);
    return Response.json({ error: "could not save" }, { status: 503 });
  }
}
