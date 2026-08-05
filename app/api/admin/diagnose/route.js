/* Connection diagnostics.
   Readable WITHOUT logging in, because the usual reason you need it is
   that logging in is broken. It never reveals the password or any guest
   data — only which variables are set, which connection method works,
   and what MySQL said. */
import { isConfigured, getPool, ensureSchema, candidates, probe, connectionLabel, isAuthFailure, credentials, envHadWhitespace, envRaw } from "@/lib/server/mysql";
export const dynamic = "force-dynamic";

const HINTS = {
  ECONNREFUSED: "Nothing is listening there. Try DB_HOST=localhost.",
  ER_ACCESS_DENIED_ERROR: "Username or password rejected for that host. See the per-method results below — if the socket works but TCP doesn't, your MySQL user is granted for 'localhost' only.",
  ER_BAD_DB_ERROR: "No database with that name.",
  ER_DBACCESS_DENIED_ERROR: "The user exists but isn't assigned to that database in hPanel.",
  ENOTFOUND: "DB_HOST couldn't be resolved — check for typos.",
  ETIMEDOUT: "No response. If DB_HOST isn't localhost, add this server's IP under Remote MySQL.",
  DB_NO_ROUTE: "Every connection method was refused — see the results below.",
};

export async function GET() {
  const c = credentials();
  const pw = c.password || "";
  /* A character-shape summary, never the password itself. If this doesn't
     match what you typed, the value was mangled on the way in. */
  const shape = pw
    ? `${pw.length} chars · ${/[^\x20-\x7E]/.test(pw) ? "contains non-ASCII" : "ASCII only"}` +
      (/[#'"\\$`]/.test(pw) ? " · contains # ' \" \\ $ or ` (these get mangled easily)" : "")
    : null;

  const env = {
    "using": envRaw("DATABASE_URL") ? "DATABASE_URL" : "DB_HOST / DB_USER / DB_PASSWORD / DB_NAME",
    host: c.host || null,
    port: c.port || 3306,
    database: c.database || null,
    user: c.user || null,
    password: shape,
    DB_SOCKET: process.env.DB_SOCKET || "(not set — will search)",
  };

  const whitespaceWarnings = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"]
    .filter(envHadWhitespace)
    .map((k) => `${k} had a leading or trailing space in hPanel — trimmed automatically, but fix it there too.`);

  const missing = ["DB_HOST", "DB_NAME", "DB_USER"].filter((k) => !String(process.env[k] || "").trim());

  if (!isConfigured()) {
    return Response.json({
      backend: "file", env, missing, whitespaceWarnings,
      verdict: missing.length
        ? `Missing ${missing.join(", ")} — the app is writing to data/kv.json, not MySQL. Add the variables in hPanel and restart the app.`
        : "Not configured for MySQL.",
    });
  }

  /* Try every method and report each result. This is the bit that
     actually tells you what to change. */
  const attempts = [];
  for (const cand of candidates()) {
    try {
      await probe(cand);
      attempts.push({ method: cand.label, result: "WORKS ✓" });
    } catch (e) {
      attempts.push({ method: cand.label, result: e.code || e.message });
    }
  }
  const working = attempts.find((a) => a.result === "WORKS ✓");

  if (!working) {
    /* The single most useful distinction: did MySQL answer and refuse us
       (an authentication problem — changing the host will not help), or
       did nothing answer at all (a routing problem)? */
    const reached = attempts.some((a) => isAuthFailure(a.result));
    const denied = attempts.filter((a) => a.result === "ER_ACCESS_DENIED_ERROR").length;
    const noDb = attempts.some((a) => a.result === "ER_BAD_DB_ERROR");
    const noRights = attempts.some((a) => a.result === "ER_DBACCESS_DENIED_ERROR");

    let verdict, fix;
    if (noDb) {
      verdict = "MySQL answered, but there is no database with that name.";
      fix = ["Copy DB_NAME exactly from hPanel → Databases (it includes the u… prefix).", "Restart the Node app after changing it."];
    } else if (noRights) {
      verdict = "The user exists but has no rights on that database.";
      fix = ["In hPanel → Databases, check the user is attached to this database.", "Restart the Node app."];
    } else if (denied) {
      verdict = `MySQL is reachable — it answered and rejected the login on ${denied} method(s). This is an authentication problem, so changing DB_HOST will not help.`;
      fix = [
        "FIRST: open phpMyAdmin from hPanel and log in with exactly this username and password. If that fails too, the credentials are wrong — nothing in the app can fix that.",
        "In hPanel → Databases → MySQL Databases, use 'Change password' on the user and set a NEW password with letters and numbers ONLY (a #, quote, backslash or space gets mangled in an environment variable).",
        "Re-paste it into DB_PASSWORD. Select the field contents and check there's no space at the end.",
        "Check the user is listed under this database in hPanel — a user can exist without being attached to it.",
        "Restart the Node app from the hPanel dashboard — environment variables are only read at startup.",
        "Alternative: set a single DATABASE_URL=mysql://user:password@localhost:3306/dbname instead of the four separate variables. This app supports it.",
      ];
    } else {
      verdict = "Nothing answered on any route — MySQL wasn't reached at all.";
      fix = ["Try DB_HOST=localhost.", "If your MySQL is on another host, add this server's IP under hPanel → Remote MySQL.", "Restart the Node app."];
    }

    return Response.json({
      backend: "mysql", ok: false, reachedServer: reached,
      env, attempts, whitespaceWarnings, verdict, whatToDo: fix,
    }, { status: 503 });
  }

  try {
    await ensureSchema();                      // idempotent: builds missing tables
    const pool = await getPool();
    const [[row]] = await pool.query("SELECT DATABASE() AS db, VERSION() AS version");
    const [tables] = await pool.query("SHOW TABLES");
    const names = tables.map((t) => Object.values(t)[0]);
    const [[counts]] = await pool.query(
      `SELECT (SELECT COUNT(*) FROM rsvps) AS rsvps,
              (SELECT COUNT(*) FROM blessings) AS blessings,
              (SELECT COALESCE(akshata,0) FROM ceremony WHERE id=1) AS akshata`
    ).catch(() => [[{}]]);

    return Response.json({
      backend: "mysql", ok: true, env, attempts, whitespaceWarnings,
      connectedVia: connectionLabel(),
      database: row.db, version: row.version,
      tables: names, rows: counts,
      verdict: `Connected via ${connectionLabel()}. ${names.length} tables ready — everything is being saved to MySQL.`,
    });
  } catch (e) {
    return Response.json({
      backend: "mysql", ok: false, env, attempts,
      code: e.code || null, message: e.message,
      verdict: HINTS[e.code] || "Connected, but something went wrong setting up the tables.",
    }, { status: 503 });
  }
}
