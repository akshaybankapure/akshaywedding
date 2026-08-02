/* Guests submit here. Returns only the public headcount — never the list. */
import { addRsvp, listRsvpSummary } from "@/lib/server/data";
export const dynamic = "force-dynamic";

export async function GET() {
  try { return Response.json(await listRsvpSummary()); }
  catch { return Response.json({ heads: 0, responses: 0 }); }
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || !String(body.name || "").trim())
    return Response.json({ error: "name required" }, { status: 400 });
  try {
    return Response.json({ ok: true, ...(await addRsvp(body)) });
  } catch (e) {
    console.error("RSVP save failed:", e.message);
    return Response.json({ error: "could not save" }, { status: 500 });
  }
}
