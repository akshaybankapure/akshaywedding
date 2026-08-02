/* The live ceremony: a shared akshata counter for guests joining from
   afar at the muhurat. Increments server-side so simultaneous taps from
   hundreds of phones all count. */
import { get, mutate } from "@/lib/server/db";
export const dynamic = "force-dynamic";

const KEY = "ceremony-v1";
const MAX_PER_CALL = 30;

export async function GET() {
  const c = await get(KEY, { akshata: 0, guests: [] });
  return Response.json({ akshata: c.akshata || 0, guests: (c.guests || []).length });
}

export async function POST(req) {
  const { n, who } = await req.json().catch(() => ({}));
  const add = Math.max(1, Math.min(MAX_PER_CALL, Number(n) || 1));
  const c = await mutate((all) => {
    const cur = all[KEY] || { akshata: 0, guests: [] };
    cur.akshata = (cur.akshata || 0) + add;
    const id = String(who || "").slice(0, 40);
    if (id && !cur.guests.includes(id)) cur.guests.push(id);
    if (cur.guests.length > 5000) cur.guests = cur.guests.slice(-5000);
    all[KEY] = cur;
    return cur;
  });
  return Response.json({ akshata: c.akshata, guests: c.guests.length });
}
