/* Live muhurat: shared akshata counter. */
import { getCeremony, addAkshata } from "@/lib/server/data";
export const dynamic = "force-dynamic";

export async function GET() {
  try { return Response.json(await getCeremony()); }
  catch { return Response.json({ akshata: 0, guests: 0 }); }
}

export async function POST(req) {
  const { n, who } = await req.json().catch(() => ({}));
  try { return Response.json(await addAkshata(n, who)); }
  catch { return Response.json({ akshata: 0, guests: 0 }, { status: 500 }); }
}
