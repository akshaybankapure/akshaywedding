/* Connection diagnostics.
   Readable WITHOUT logging in, because the usual reason you need it is
   that logging in is broken. It never reveals the password or any guest
   data — only which variables are set, which connection method works,
   and what MySQL said. */
import { isConfigured, getPool, ensureSchema, candidates, probe, connectionLabel, isAuthFailure } from "@/lib/server/mysql";
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
  const env = {
    DB_HOST: process.env.DB_HOST || null,
    DB_PORT: process.env.DB_PORT || "3306 (default)",
    DB_NAME: process.env.DB_NAME || null,
    DB_USER: process.env.DB_USER || null,
    DB_PASSWORD: process.env.DB_PASSWORD
      ? `set (${process.env.DB_PASSWORD.length} characters)` : null,
    DB_SOCKET: process.env.DB_SOCKET || "(not set — will search)",
  };

  const missing = ["DB_HOST", "DB_NAME", "DB_USER"].filter((k) => !process.env[k]);

  if (!isConfigured()) {
    return Response.json({
      backend: "file", env, missing,
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
        "In hPanel → Databases, use 'Change password' on the MySQL user and set a NEW simple password (letters and numbers only — a # or quote in an environment variable is easily mangled).",
        "Paste exactly that into DB_PASSWORD. Check for a trailing space.",
        "Confirm DB_USER is the FULL name, e.g. u805448495_akshayweds — not the short one.",
        "Restart the Node app — variables are only read at startup.",
        "Verify the same username and password work in phpMyAdmin.",
      ];
    } else {
      verdict = "Nothing answered on any route — MySQL wasn't reached at all.";
      fix = ["Try DB_HOST=localhost.", "If your MySQL is on another host, add this server's IP under hPanel → Remote MySQL.", "Restart the Node app."];
    }

    return Response.json({
      backend: "mysql", ok: false, reachedServer: reached,
      env, attempts, verdict, whatToDo: fix,
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
      backend: "mysql", ok: true, env, attempts,
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
