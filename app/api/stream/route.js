/* Public: what the invitation should show for the live stream.
   Reads the value an admin saved on the day; falls back to whatever is
   hard-coded in lib/config.js. */
import { getSetting } from "@/lib/server/data";
import { CONFIG } from "@/lib/config";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const saved = await getSetting("stream-v1", null);
    const s = saved || CONFIG.stream || {};
    return Response.json({
      url: s.url || "",
      label: s.label || CONFIG.stream?.label || "Watch live",
      note: s.note ?? CONFIG.stream?.note ?? "",
    });
  } catch {
    return Response.json({ url: CONFIG.stream?.url || "", label: CONFIG.stream?.label || "", note: "" });
  }
}
