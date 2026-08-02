/* CSV download — open it in Excel or hand it to the caterer. */
import { requireAdmin } from "@/lib/server/auth";
import { readAll } from "@/lib/server/db";
export const dynamic = "force-dynamic";

const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET(req) {
  if (!await requireAdmin()) return new Response("unauthorised", { status: 401 });
  const which = new URL(req.url).searchParams.get("type") || "rsvps";
  const all = await readAll();
  let head, rows, name;

  if (which === "blessings") {
    name = "blessings";
    head = ["When", "Name", "Message", "Hidden"];
    rows = (all["ps-blessings-v1"] || []).map((b) => [
      new Date(b.ts || Date.now()).toLocaleString("en-IN"), b.who || "", b.txt || "", b.hidden ? "yes" : "",
    ]);
  } else {
    name = "rsvps";
    head = ["When", "Name", "Attending", "Guests", "Meal", "Note"];
    rows = (all["ps-rsvp-log-v1"] || []).map((r) => [
      new Date(r.ts || Date.now()).toLocaleString("en-IN"),
      r.name || "", r.vibe === "afar" ? "no" : "yes",
      r.count || 1, r.meal || "", r.note || "",
    ]);
  }

  const csv = "\uFEFF" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="akshay-shraddha-${name}.csv"`,
    },
  });
}
