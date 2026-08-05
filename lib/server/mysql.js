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

export function getPool() {
  if (!isConfigured()) return null;
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || "",
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_POOL || 4),   // shared hosting: stay modest
      queueLimit: 0,
      charset: "utf8mb4_general_ci",                        // Devanagari & Kannada safe
      enableKeepAlive: true,
    });
  }
  return pool;
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
      const p = getPool();
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
  const [rows] = await getPool().execute(sql, params);
  return rows;
}
