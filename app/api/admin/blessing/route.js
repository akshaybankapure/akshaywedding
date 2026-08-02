/* Moderate the blessings wall: hide or restore a message. */
import { requireAdmin } from "@/lib/server/auth";
import { mutate } from "@/lib/server/db";
export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!await requireAdmin()) return Response.json({ error: "unauthorised" }, { status: 401 });
  const { id, hidden } = await req.json().catch(() => ({}));
  await mutate((all) => {
    const list = all["ps-blessings-v1"] || [];
    const row = list.find((b) => b.id === id);
    if (row) row.hidden = !!hidden;
    all["ps-blessings-v1"] = list;
  });
  return Response.json({ ok: true });
}
