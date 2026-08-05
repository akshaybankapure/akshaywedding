/* ═══════════════════════════════════════════════════════════════════
   The one data API the whole app talks to.

   Backed by MySQL when DB_* env vars are set (Hostinger), and by the
   JSON file otherwise (local dev, or if you never set up a database).
   Every function behaves identically either way, so no component or
   route needs to know which is in use.

   Why this is better than the old read-modify-write on a JSON blob:
   inserts are single atomic statements, so two guests submitting at the
   same instant can no longer overwrite each other.
   ═══════════════════════════════════════════════════════════════════ */

import { isConfigured, query } from "@/lib/server/mysql";
import * as file from "@/lib/server/db";

export const usingMysql = isConfigured;

const clip = (v, n) => (v == null ? null : String(v).slice(0, n));

/* ── RSVPs ─────────────────────────────────────────────────────── */

export async function addRsvp(r) {
  const row = {
    name: clip(r.name, 80) || "Someone",
    attending: r.vibe === "afar" ? 0 : 1,
    vibe: clip(r.vibe, 24),
    guests: Math.max(1, Math.min(20, Number(r.count) || 1)),
    meal: clip(r.meal, 60),
    note: clip(r.note, 200),
  };
  if (isConfigured()) {
    await query(
      `INSERT INTO rsvps (name, attending, vibe, guests, meal, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [row.name, row.attending, row.vibe, row.guests, row.meal, row.note]
    );
  } else {
    await file.mutate((all) => {
      const list = all["ps-rsvp-log-v1"] || [];
      list.push({ ...row, count: row.guests, ts: Date.now() });
      all["ps-rsvp-log-v1"] = list;
    });
  }
  return listRsvpSummary();
}

export async function listRsvps() {
  if (isConfigured()) {
    const rows = await query(
      `SELECT id, name, attending, vibe, guests, meal, note, created_at
         FROM rsvps ORDER BY created_at DESC LIMIT 2000`
    );
    return rows.map((r) => ({
      id: r.id, name: r.name, vibe: r.vibe,
      attending: !!r.attending, count: r.guests,
      meal: r.meal, note: r.note,
      ts: new Date(r.created_at).getTime(),
    }));
  }
  const list = (await file.get("ps-rsvp-log-v1", [])) || [];
  return [...list].reverse().map((r) => ({ ...r, attending: r.vibe !== "afar" }));
}

/** Headcount for the public "N are coming" line — no personal data. */
export async function listRsvpSummary() {
  if (isConfigured()) {
    const [r] = await query(
      `SELECT COALESCE(SUM(guests),0) AS heads, COUNT(*) AS responses
         FROM rsvps WHERE attending = 1`
    );
    return { heads: Number(r?.heads || 0), responses: Number(r?.responses || 0) };
  }
  const list = (await file.get("ps-rsvp-log-v1", [])) || [];
  const going = list.filter((r) => r.vibe !== "afar");
  return {
    heads: going.reduce((n, r) => n + (Number(r.count) || 1), 0),
    responses: going.length,
  };
}

/* ── Blessings ─────────────────────────────────────────────────── */

export async function addBlessing(b) {
  const who = clip(b.who, 60) || "Someone lovely";
  const message = clip(b.txt, 200);
  if (!message || !message.trim()) return listBlessings();
  const tint = Math.max(0, Math.min(3, Number(b.c) || 0));

  if (isConfigured()) {
    await query(`INSERT INTO blessings (who, message, tint) VALUES (?, ?, ?)`,
      [who, message.trim(), tint]);
  } else {
    await file.mutate((all) => {
      const list = all["ps-blessings-v1"] || [];
      list.unshift({
        id: `b${Date.now().toString(36)}`,
        who, txt: message.trim(), c: tint, ts: Date.now(),
      });
      all["ps-blessings-v1"] = list.slice(0, 300);
    });
  }
  return listBlessings();
}

export async function listBlessings({ includeHidden = false } = {}) {
  if (isConfigured()) {
    const rows = await query(
      `SELECT id, who, message, tint, hidden, created_at FROM blessings
        ${includeHidden ? "" : "WHERE hidden = 0"}
        ORDER BY created_at DESC LIMIT 300`
    );
    return rows.map((r) => ({
      id: String(r.id), who: r.who, txt: r.message, c: r.tint,
      hidden: !!r.hidden, ts: new Date(r.created_at).getTime(),
    }));
  }
  const list = (await file.get("ps-blessings-v1", [])) || [];
  return includeHidden ? list : list.filter((b) => !b.hidden);
}

export async function setBlessingHidden(id, hidden) {
  if (isConfigured()) {
    await query(`UPDATE blessings SET hidden = ? WHERE id = ?`, [hidden ? 1 : 0, Number(id)]);
    return;
  }
  await file.mutate((all) => {
    const list = all["ps-blessings-v1"] || [];
    const row = list.find((b) => String(b.id) === String(id));
    if (row) row.hidden = !!hidden;
    all["ps-blessings-v1"] = list;
  });
}

/* ── Live ceremony ─────────────────────────────────────────────── */

export async function getCeremony() {
  if (isConfigured()) {
    const [c] = await query(`SELECT akshata FROM ceremony WHERE id = 1`);
    const [g] = await query(`SELECT COUNT(*) AS n FROM ceremony_guests`);
    const [nm] = await query(`SELECT COUNT(*) AS n FROM ceremony_guests WHERE name IS NOT NULL AND name <> ''`);
    return {
      akshata: Number(c?.akshata || 0),
      guests: Number(g?.n || 0),
      named: Number(nm?.n || 0),
    };
  }
  const c = (await file.get("ceremony-v1", {})) || {};
  const people = Object.values(c.people || {});
  return {
    akshata: c.akshata || 0,
    guests: people.length,
    named: people.filter((p) => p.name).length,
  };
}

export async function addAkshata(n, deviceId, name) {
  const add = Math.max(1, Math.min(30, Number(n) || 1));
  const id = clip(deviceId, 48);
  const who = clip(name, 80);

  if (isConfigured()) {
    // both are single atomic statements — hundreds of phones can tap at once
    await query(`UPDATE ceremony SET akshata = akshata + ? WHERE id = 1`, [add]);
    if (id) {
      await query(
        `INSERT INTO ceremony_guests (device_id, name, akshata, last_at)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           akshata = akshata + VALUES(akshata),
           name = COALESCE(VALUES(name), name),
           last_at = NOW()`,
        [id, who, add]
      );
    }
    return getCeremony();
  }

  await file.mutate((all) => {
    const cur = all["ceremony-v1"] || { akshata: 0, people: {} };
    cur.people = cur.people || {};
    cur.akshata = (cur.akshata || 0) + add;
    if (id) {
      const row = cur.people[id] || { name: null, akshata: 0, joined: Date.now() };
      row.akshata += add;
      if (who) row.name = who;
      row.last = Date.now();
      cur.people[id] = row;
    }
    all["ceremony-v1"] = cur;
  });
  return getCeremony();
}

/** Who threw akshata, and how much — for the admin registry. */
export async function listAkshataGuests() {
  if (isConfigured()) {
    const rows = await query(
      `SELECT device_id, name, akshata, joined_at, last_at
         FROM ceremony_guests ORDER BY akshata DESC, joined_at ASC LIMIT 2000`
    );
    return rows.map((r) => ({
      id: r.device_id,
      name: r.name || null,
      akshata: Number(r.akshata || 0),
      joined: r.joined_at ? new Date(r.joined_at).getTime() : null,
      last: r.last_at ? new Date(r.last_at).getTime() : null,
    }));
  }
  const cur = (await file.get("ceremony-v1", {})) || {};
  return Object.entries(cur.people || {})
    .map(([id, v]) => ({ id, name: v.name || null, akshata: v.akshata || 0, joined: v.joined, last: v.last }))
    .sort((a, b) => b.akshata - a.akshata);
}

/* ── Settings (admin credentials) ───────────────────────────────── */

export async function getSetting(key, fallback = null) {
  if (isConfigured()) {
    const [r] = await query(`SELECT v FROM settings WHERE k = ?`, [key]);
    if (!r) return fallback;
    try { return JSON.parse(r.v); } catch { return fallback; }
  }
  return file.get(key, fallback);
}

export async function setSetting(key, value) {
  if (isConfigured()) {
    await query(
      `INSERT INTO settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)`,
      [key, JSON.stringify(value)]
    );
    return value;
  }
  return file.set(key, value);
}

/** Shown on the admin dashboard so you can see which store is live. */
export async function backendStatus() {
  if (!isConfigured()) return { backend: "file", ok: true, detail: "data/kv.json" };
  try {
    await query(`SELECT 1`);
    return { backend: "mysql", ok: true, detail: `${process.env.DB_NAME} @ ${process.env.DB_HOST}` };
  } catch (e) {
    return { backend: "mysql", ok: false, detail: e.code || e.message };
  }
}
