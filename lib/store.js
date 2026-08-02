/* Client-side data access. Talks to the app's own API routes, which are
   backed by MySQL on the server (or a JSON file if no database is
   configured). Fails soft: if the network is down the UI still works,
   it just won't persist. */

async function jsonFetch(url, options) {
  const r = await fetch(url, { cache: "no-store", ...options });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

export const rsvpApi = {
  summary: () => jsonFetch("/api/rsvp").catch(() => ({ heads: 0, responses: 0 })),
  submit: (entry) => jsonFetch("/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  }),
};

export const blessingsApi = {
  list: () => jsonFetch("/api/blessings").then((d) => d.items || []).catch(() => []),
  post: (entry) => jsonFetch("/api/blessings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  }).then((d) => d.items || []),
};
