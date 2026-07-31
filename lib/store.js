/* Persistence adapter. Talks to the built-in /api/kv route (a JSON file
   on the server — perfect for local dev and any Node host). If the API is
   unreachable (e.g. a static export), it degrades to in-memory so the UI
   keeps working. Swap the fetch calls for Supabase later without touching
   any component. */
const mem = new Map();

export const store = {
  async get(key, fallback) {
    try {
      const r = await fetch(`/api/kv?key=${encodeURIComponent(key)}`, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      if (j.value === null || j.value === undefined)
        return mem.has(key) ? mem.get(key) : fallback;
      return j.value;
    } catch {
      return mem.has(key) ? mem.get(key) : fallback;
    }
  },
  async set(key, value) {
    mem.set(key, value);
    try {
      await fetch("/api/kv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
    } catch { /* offline / static export — in-memory only */ }
  },
};
