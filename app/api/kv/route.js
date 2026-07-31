/* Tiny JSON-file key-value store backing RSVPs, the guest tally and the
   blessings wall. Great for local dev and any Node host (VPS, Railway,
   Render, `next start` behind nginx). On serverless platforms the file
   system is ephemeral — swap the read/write helpers for Supabase or
   Vercel KV; the route signature can stay identical. */
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const FILE = path.join(process.cwd(), "data", "kv.json");
const MAX_VALUE_BYTES = 200_000;

async function readAll() {
  try { return JSON.parse(await fs.readFile(FILE, "utf8")); }
  catch { return {}; }
}
async function writeAll(obj) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(obj, null, 2));
}

export async function GET(req) {
  const key = new URL(req.url).searchParams.get("key");
  if (!key) return Response.json({ error: "key required" }, { status: 400 });
  const all = await readAll();
  return Response.json({ key, value: key in all ? all[key] : null });
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "bad json" }, { status: 400 }); }
  const { key, value } = body || {};
  if (typeof key !== "string" || !key || key.length > 200)
    return Response.json({ error: "bad key" }, { status: 400 });
  if (JSON.stringify(value ?? null).length > MAX_VALUE_BYTES)
    return Response.json({ error: "value too large" }, { status: 413 });
  const all = await readAll();
  all[key] = value;
  await writeAll(all);
  return Response.json({ ok: true });
}
