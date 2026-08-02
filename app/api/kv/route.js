/* Public key-value endpoint used by the invitation (RSVPs, blessings).
   Reads are open; writes are limited to the invite's own keys so this
   can't be used as a general-purpose store by anyone who finds it. */
import { get, mutate } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const WRITABLE = /^(ps-rsvp-log-v1|ps-rsvp-tally-v1|ps-blessings-v1)$/;
const MAX_BYTES = 400_000;

export async function GET(req) {
  const key = new URL(req.url).searchParams.get("key");
  if (!key) return Response.json({ error: "key required" }, { status: 400 });
  return Response.json({ key, value: await get(key, null) });
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "bad json" }, { status: 400 }); }
  const { key, value } = body || {};
  if (typeof key !== "string" || !WRITABLE.test(key))
    return Response.json({ error: "key not writable" }, { status: 403 });
  if (JSON.stringify(value ?? null).length > MAX_BYTES)
    return Response.json({ error: "too large" }, { status: 413 });
  await mutate((all) => { all[key] = value; });
  return Response.json({ ok: true });
}
