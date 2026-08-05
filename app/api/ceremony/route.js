/* Live muhurat: shared akshata counter. */
import { getCeremony, addAkshata } from "@/lib/server/data";
export const dynamic = "force-dynamic";

/* One line per distinct problem per minute. Without this, a database
   outage during the ceremony writes thousands of identical lines into
   the host's log while hundreds of phones retry. */
const seen = new Map();
function logOnce(tag, e) {
  const key = `${tag}:${e?.code || e?.message}`;
  const now = Date.now();
  if (now - (seen.get(key) || 0) < 60000) return;
  seen.set(key, now);
  console.error(`${tag} failing:`, e?.code || e?.message);
  if (e?.attempts) for (const a of e.attempts) console.error("      " + a);
}

export async function GET() {
  try { return Response.json(await getCeremony()); }
  catch { return Response.json({ akshata: 0, guests: 0 }); }
}

export async function POST(req) {
  const { n, who, name } = await req.json().catch(() => ({}));
  try { return Response.json(await addAkshata(n, who, name)); }
  catch (e) {
    logOnce("akshata", e);
    return Response.json({ akshata: 0, guests: 0, error: e.code || "server error" }, { status: 503 });
  }
}
