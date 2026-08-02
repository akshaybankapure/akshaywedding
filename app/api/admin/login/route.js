import { verifyLogin, startSession } from "@/lib/server/auth";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const { user, password } = await req.json().catch(() => ({}));
  const cred = await verifyLogin(user, password);
  if (!cred) {
    await new Promise(r => setTimeout(r, 600));      // slow down guessing
    return Response.json({ ok: false, error: "Wrong username or password." }, { status: 401 });
  }
  await startSession();
  return Response.json({ ok: true, isDefault: !!cred.isDefault });
}
