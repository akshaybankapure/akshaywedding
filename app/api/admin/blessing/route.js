import { requireAdmin } from "@/lib/server/auth";
import { setBlessingHidden } from "@/lib/server/data";
export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!await requireAdmin()) return Response.json({ error: "unauthorised" }, { status: 401 });
  const { id, hidden } = await req.json().catch(() => ({}));
  await setBlessingHidden(id, hidden);
  return Response.json({ ok: true });
}
