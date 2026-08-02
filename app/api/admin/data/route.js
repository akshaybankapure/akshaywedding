/* Everything the dashboard needs, in one call. */
import { requireAdmin } from "@/lib/server/auth";
import { readAll } from "@/lib/server/db";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: "unauthorised" }, { status: 401 });
  const all = await readAll();
  const rsvps = all["ps-rsvp-log-v1"] || [];
  const blessings = all["ps-blessings-v1"] || [];
  const ceremony = all["ceremony-v1"] || { akshata: 0, guests: [] };

  const attending = rsvps.filter((r) => r.vibe !== "afar");
  const heads = attending.reduce((n, r) => n + (Number(r.count) || 1), 0);
  // meals count HEADS and only those actually coming — this is the caterer's number
  const meals = attending.reduce((m, r) => {
    const k = r.meal || "—"; m[k] = (m[k] || 0) + (Number(r.count) || 1); return m;
  }, {});
  const vibes = rsvps.reduce((m, r) => {
    const k = r.vibe || "—"; m[k] = (m[k] || 0) + 1; return m;
  }, {});

  return Response.json({
    rsvps, blessings,
    stats: {
      responses: rsvps.length,
      attending: attending.length,
      notAttending: rsvps.length - attending.length,
      heads,
      meals, vibes,
      blessings: blessings.length,
      akshata: ceremony.akshata || 0,
      liveGuests: (ceremony.guests || []).length,
    },
  });
}
