import { requireAdmin, changeUsername } from "@/lib/server/auth";
export const dynamic = "force-dynamic";
export async function POST(req) {
  if (!await requireAdmin()) return Response.json({ error: "unauthorised" }, { status: 401 });
  const { password, user } = await req.json().catch(() => ({}));
  const r = await changeUsername(password, user);
  return Response.json(r, { status: r.ok ? 200 : 400 });
}
