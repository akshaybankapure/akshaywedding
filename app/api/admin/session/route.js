import { requireAdmin } from "@/lib/server/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const cred = await requireAdmin();
    return Response.json(cred
      ? { auth: true, user: cred.user, isDefault: !!cred.isDefault }
      : { auth: false });
  } catch (e) {
    // never let a database hiccup return an HTML error page
    return Response.json({ auth: false, error: e?.code || "server error" }, { status: 200 });
  }
}
