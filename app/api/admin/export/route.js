/* CSV download — open in Excel, or hand to the caterer. */
import { requireAdmin } from "@/lib/server/auth";
import { listRsvps, listBlessings } from "@/lib/server/data";
export const dynamic = "force-dynamic";

const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const when = (ts) => new Date(ts || Date.now()).toLocaleString("en-IN");

export async function GET(req) {
  if (!await requireAdmin()) return new Response("unauthorised", { status: 401 });
  const which = new URL(req.url).searchParams.get("type") || "rsvps";
  let head, rows, name;

  if (which === "blessings") {
    name = "blessings";
    head = ["When", "Name", "Message", "Hidden"];
    rows = (await listBlessings({ includeHidden: true }))
      .map((b) => [when(b.ts), b.who, b.txt, b.hidden ? "yes" : ""]);
  } else {
    name = "rsvps";
    head = ["When", "Name", "Attending", "Guests", "Meal", "Note"];
    rows = (await listRsvps())
      .map((r) => [when(r.ts), r.name, r.attending ? "yes" : "no", r.count, r.meal, r.note]);
  }

  const csv = "\uFEFF" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="akshay-shraddha-${name}.csv"`,
    },
  });
}
