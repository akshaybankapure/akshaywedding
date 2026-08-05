/* ═══════════════════════════════════════════════════════════════════
   MySQL connection (Hostinger).
   Enabled by setting DB_HOST / DB_NAME / DB_USER / DB_PASSWORD in
   hPanel → your Node.js app → Environment Variables. If they're absent,
   the app quietly falls back to the JSON file, so local development
   needs no database at all.

   The schema is created on first use — you never have to run SQL by
   hand, though everything is plain enough to browse in phpMyAdmin.
   ═══════════════════════════════════════════════════════════════════ */

import mysql from "mysql2/promise";

let pool = null;
let ready = null;

export function isConfigured() {
  return Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER);
}

/* ─────────────────────────────────────────────────────────────────
   CONNECTING TO MYSQL ON SHARED HOSTING

   MySQL grants are per-host, and on shared hosting the same server can
   refuse you three different ways depending on how you knock:

     • host "localhost" may resolve to the IPv6 loopback ::1, which the
       grant 'user'@'localhost' does not cover  → ACCESS DENIED
     • a TCP connection from 127.0.0.1 is matched literally when the
       server runs with skip-name-resolve, which 'user'@'localhost'
       also does not cover                       → ACCESS DENIED
     • the unix socket IS matched by 'user'@'localhost'  → works

   Rather than guess, we try the sensible options once, in order, and
   keep the first that works. Set DB_SOCKET to skip the search.
   ───────────────────────────────────────────────────────────────── */

const COMMON_SOCKETS = [
  "/var/lib/mysql/mysql.sock",
  "/var/run/mysqld/mysqld.sock",
  "/run/mysqld/mysqld.sock",
  "/tmp/mysql.sock",
  "/var/run/mysqld/mysqld.sock2",
  "/var/lib/mysql/mysql.sock1",
  "/opt/lampp/var/mysql/mysql.sock",
];

/* If the failure is an auth failure rather than a routing failure, a
   different host won't help — say so plainly. */
export function isAuthFailure(codeOrErr) {
  const c = typeof codeOrErr === "string" ? codeOrErr : codeOrErr?.code;
  return c === "ER_ACCESS_DENIED_ERROR" || c === "ER_DBACCESS_DENIED_ERROR" || c === "ER_BAD_DB_ERROR";
}

function isLocal(h) {
  const v = String(h || "").toLowerCase();
  return v === "localhost" || v === "127.0.0.1" || v === "::1" || v === "";
}

/** Every way we're willing to try, best first. */
export function candidates() {
  const host = (process.env.DB_HOST || "").trim();
  const port = Number(process.env.DB_PORT || 3306);
  const list = [];

  if (process.env.DB_SOCKET) {
    list.push({ label: `socket ${process.env.DB_SOCKET}`, socketPath: process.env.DB_SOCKET });
  }
  if (isLocal(host)) {
    // the socket is what 'user'@'localhost' grants actually match
    for (const p of COMMON_SOCKETS) list.push({ label: `socket ${p}`, socketPath: p });
    list.push({ label: "tcp 127.0.0.1", host: "127.0.0.1", port });
    list.push({ label: "tcp localhost", host: "localhost", port });
  } else {
    list.push({ label: `tcp ${host}`, host, port });
  }
  return list;
}

const BASE = () => ({
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  charset: "utf8mb4_general_ci",
});

/** Try one candidate with a short-lived connection. */
export async function probe(cand) {
  const conn = await mysql.createConnection({
    ...BASE(), ...stripLabel(cand), connectTimeout: 6000,
  });
  try { await conn.query("SELECT 1"); } finally { await conn.end().catch(() => {}); }
}

function stripLabel({ label, ...rest }) { return rest; }

let lastRouteLog = 0;
let chosen = null;
let negotiating = null;

async function negotiate() {
  const errors = [];
  for (const cand of candidates()) {
    try {
      await probe(cand);
      console.log(`[db] connected via ${cand.label}`);
      return cand;
    } catch (e) {
      errors.push(`${cand.label}: ${e.code || e.message}`);
    }
  }
  const err = new Error(
    "Could not connect to MySQL by any method — " + errors.join(" | ")
  );
  err.code = "DB_NO_ROUTE";
  err.attempts = errors;
  /* Log the evidence once, not once per request. Without this the host
     log just repeats "DB_NO_ROUTE", which says nothing actionable. */
  const now = Date.now();
  if (now - lastRouteLog > 60000) {
    lastRouteLog = now;
    console.error("[db] every connection method failed:");
    for (const line of errors) console.error("      " + line);
    console.error("[db] DB_HOST=" + (process.env.DB_HOST || "(unset)") +
      "  DB_NAME=" + (process.env.DB_NAME || "(unset)") +
      "  DB_USER=" + (process.env.DB_USER || "(unset)") +
      "  DB_PASSWORD=" + (process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length + " chars" : "(unset)"));
  }
  throw err;
}

/** The shared pool, built on whichever method turned out to work. */
export async function getPool() {
  if (!isConfigured()) return null;
  if (pool) return pool;
  if (!chosen) {
    if (!negotiating) negotiating = negotiate().catch((e) => { negotiating = null; throw e; });
    chosen = await negotiating;
  }
  pool = mysql.createPool({
    ...BASE(),
    ...stripLabel(chosen),
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL || 4),   // shared hosting: stay modest
    queueLimit: 0,
    enableKeepAlive: true,
  });
  return pool;
}

/** How we're actually connected — shown in diagnostics. */
export function connectionLabel() {
  return chosen?.label || null;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS rsvps (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(80) NOT NULL,
     attending TINYINT(1) NOT NULL DEFAULT 1,
     vibe VARCHAR(24) DEFAULT NULL,
     guests INT NOT NULL DEFAULT 1,
     meal VARCHAR(60) DEFAULT NULL,
     note VARCHAR(200) DEFAULT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     INDEX idx_created (created_at)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS blessings (
     id INT AUTO_INCREMENT PRIMARY KEY,
     who VARCHAR(60) DEFAULT NULL,
     message VARCHAR(220) NOT NULL,
     tint TINYINT NOT NULL DEFAULT 0,
     hidden TINYINT(1) NOT NULL DEFAULT 0,
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     INDEX idx_visible (hidden, created_at)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS settings (
     k VARCHAR(64) PRIMARY KEY,
     v MEDIUMTEXT
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS ceremony (
     id TINYINT PRIMARY KEY,
     akshata BIGINT NOT NULL DEFAULT 0
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  /* One row per person who joined the muhurat from afar — who they are,
     how many grains they threw, and when they last threw one. */
  `CREATE TABLE IF NOT EXISTS ceremony_guests (
     device_id VARCHAR(48) PRIMARY KEY,
     name VARCHAR(80) DEFAULT NULL,
     akshata INT NOT NULL DEFAULT 0,
     joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     last_at TIMESTAMP NULL DEFAULT NULL,
     INDEX idx_akshata (akshata)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `INSERT IGNORE INTO ceremony (id, akshata) VALUES (1, 0)`,
];

/* Columns added after the first deploy. Each runs on its own and a
   "duplicate column" error is expected and ignored — this is how the
   schema upgrades itself without anyone running SQL by hand. */
const MIGRATIONS = [
  `ALTER TABLE ceremony_guests ADD COLUMN name VARCHAR(80) DEFAULT NULL`,
  `ALTER TABLE ceremony_guests ADD COLUMN akshata INT NOT NULL DEFAULT 0`,
  `ALTER TABLE ceremony_guests ADD COLUMN last_at TIMESTAMP NULL DEFAULT NULL`,
];

/** Runs once per process; safe to call before every query. */
export function ensureSchema() {
  if (!isConfigured()) return Promise.resolve(false);
  if (!ready) {
    ready = (async () => {
      const p = await getPool();
      for (const sql of SCHEMA) await p.query(sql);
      for (const sql of MIGRATIONS) {
        try { await p.query(sql); }
        catch (e) { if (e.code !== "ER_DUP_FIELDNAME") throw e; }
      }
      return true;
    })().catch((e) => {
      ready = null;                    // let the next request retry
      throw e;
    });
  }
  return ready;
}

export async function query(sql, params = []) {
  await ensureSchema();
  const p = await getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}
