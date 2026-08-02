import { requireAdmin } from "@/lib/server/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const cred = await requireAdmin();
  return Response.json(cred
    ? { auth: true, user: cred.user, isDefault: !!cred.isDefault }
    : { auth: false });
}
