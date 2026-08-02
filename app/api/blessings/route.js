/* The public wall: read visible blessings, post a new one. */
import { addBlessing, listBlessings } from "@/lib/server/data";
export const dynamic = "force-dynamic";

export async function GET() {
  try { return Response.json({ items: await listBlessings() }); }
  catch { return Response.json({ items: [] }); }
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || !String(body.txt || "").trim())
    return Response.json({ error: "message required" }, { status: 400 });
  try {
    return Response.json({ ok: true, items: await addBlessing(body) });
  } catch (e) {
    console.error("Blessing save failed:", e.message);
    return Response.json({ error: "could not save" }, { status: 500 });
  }
}
