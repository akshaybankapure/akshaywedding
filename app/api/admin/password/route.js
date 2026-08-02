import { requireAdmin, changePassword } from "@/lib/server/auth";
export const dynamic = "force-dynamic";
export async function POST(req) {
  if (!await requireAdmin()) return Response.json({ error: "unauthorised" }, { status: 401 });
  const { current, next } = await req.json().catch(() => ({}));
  const r = await changePassword(current, next);
  return Response.json(r, { status: r.ok ? 200 : 400 });
}
