/* Connection diagnostics. Deliberately readable WITHOUT logging in,
   because the usual reason you need it is that logging in is broken.
   It never reveals the password or any guest data — only which
   variables are present and what the database said. */
import { isConfigured, getPool, resolvedHost } from "@/lib/server/mysql";
export const dynamic = "force-dynamic";

const HINTS = {
  ECONNREFUSED: "Nothing is listening there. On Hostinger, DB_HOST should normally be 'localhost'.",
  ER_ACCESS_DENIED_ERROR: "Username or password rejected. On Hostinger the user is the full name, e.g. u123456789_akshayweds.",
  ER_BAD_DB_ERROR: "No database with that name.",
  ER_DBACCESS_DENIED_ERROR: "The user exists but isn't assigned to that database in hPanel.",
  ENOTFOUND: "DB_HOST couldn't be resolved — check for typos.",
  ETIMEDOUT: "No response. If DB_HOST isn't 'localhost', add this server's IP under Remote MySQL.",
};

export async function GET() {
  const env = {
    DB_HOST: process.env.DB_HOST || 'localhost',
    "→ actually connecting to": isConfigured() ? `${resolvedHost()} (IPv${process.env.DB_IP_FAMILY || 4})` : null,
    DB_PORT: process.env.DB_PORT || "3306 (default)",
    DB_NAME: process.env.DB_NAME || null,
    DB_USER: process.env.DB_USER || null,
    DB_PASSWORD: process.env.DB_PASSWORD ? `set (${process.env.DB_PASSWORD.length} characters)` : null,
  };

  const missing = ["DB_HOST", "DB_NAME", "DB_USER"].filter((k) => !process.env[k]);

  if (!isConfigured()) {
    return Response.json({
      backend: "file",
      env, missing,
      verdict: missing.length
        ? `Missing ${missing.join(", ")} — the app is storing data in data/kv.json instead of MySQL. Add the variables in hPanel and restart the app.`
        : "Not configured for MySQL.",
    });
  }

  try {
    const conn = await getPool().getConnection();
    try {
      const [[row]] = await conn.query("SELECT DATABASE() AS db, VERSION() AS version");
      const [tables] = await conn.query("SHOW TABLES");
      return Response.json({
        backend: "mysql", ok: true, env,
        database: row.db, version: row.version,
        tables: tables.map((t) => Object.values(t)[0]),
        verdict: "Connected. Everything is being saved to MySQL.",
      });
    } finally { conn.release(); }
  } catch (e) {
    return Response.json({
      backend: "mysql", ok: false, env,
      code: e.code || null,
      message: e.message,
      verdict: /@'::1'/.test(e.message || "")
        ? "Reached over IPv6 (::1) but the MySQL user is granted only for localhost/127.0.0.1. Set DB_HOST=127.0.0.1 and restart the app."
        : (HINTS[e.code] || "Couldn't connect — see the code above."),
    }, { status: 503 });
  }
}
