/* Everything the dashboard needs, in one call. */
import { requireAdmin } from "@/lib/server/auth";
import { listRsvps, listBlessings, getCeremony, backendStatus } from "@/lib/server/data";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!await requireAdmin()) return Response.json({ error: "unauthorised" }, { status: 401 });

  const [rsvps, blessings, ceremony, backend] = await Promise.all([
    listRsvps(), listBlessings({ includeHidden: true }), getCeremony(), backendStatus(),
  ]);

  const attending = rsvps.filter((r) => r.attending);
  // meals count HEADS and only those actually coming — the caterer's number
  const meals = attending.reduce((m, r) => {
    const k = r.meal || "—"; m[k] = (m[k] || 0) + (Number(r.count) || 1); return m;
  }, {});
  const vibes = rsvps.reduce((m, r) => {
    const k = r.vibe || "—"; m[k] = (m[k] || 0) + 1; return m;
  }, {});

  return Response.json({
    rsvps, blessings, backend,
    stats: {
      responses: rsvps.length,
      attending: attending.length,
      notAttending: rsvps.length - attending.length,
      heads: attending.reduce((n, r) => n + (Number(r.count) || 1), 0),
      meals, vibes,
      blessings: blessings.length,
      akshata: ceremony.akshata,
      liveGuests: ceremony.guests,
    },
  });
}
