import { verifyLogin, startSession } from "@/lib/server/auth";
export const dynamic = "force-dynamic";

/* Turns a raw driver error into something a human can act on. A database
   problem must never surface as an HTML 500 page — the browser then fails
   to parse it and the real cause is lost. */
function explain(e) {
  const code = e?.code || "";
  /* user@'::1' means the connection arrived over IPv6 while the grant is
     for localhost/127.0.0.1 — the password is fine, the host isn't. */
  if (/@'::1'/.test(e?.message || "")) {
    return "The database was reached over IPv6 (::1) but your MySQL user is only granted for localhost/127.0.0.1. Set DB_HOST=127.0.0.1 in hPanel and restart the app.";
  }
  const map = {
    ECONNREFUSED: "The database refused the connection. On Hostinger, DB_HOST is usually 'localhost' — a remote host also needs your IP whitelisted under Remote MySQL.",
    ER_ACCESS_DENIED_ERROR: "The database rejected the username or password. Check DB_USER and DB_PASSWORD in hPanel — the user is usually the full name like u123456789_akshayweds.",
    ER_BAD_DB_ERROR: "That database name doesn't exist. Check DB_NAME.",
    ENOTFOUND: "DB_HOST couldn't be resolved. Check it for typos.",
    ETIMEDOUT: "The database didn't respond in time. If DB_HOST isn't 'localhost', whitelist this server under Remote MySQL.",
    ER_DBACCESS_DENIED_ERROR: "That user has no rights on that database. Re-assign the user to the database in hPanel.",
  };
  return map[code] || (code ? `Database error (${code}).` : "Unexpected server error.");
}

export async function POST(req) {
  const { user, password } = await req.json().catch(() => ({}));
  try {
    const cred = await verifyLogin(user, password);
    if (!cred) {
      await new Promise((r) => setTimeout(r, 600));      // slow down guessing
      return Response.json({ ok: false, error: "Wrong username or password." }, { status: 401 });
    }
    await startSession();
    return Response.json({ ok: true, isDefault: !!cred.isDefault });
  } catch (e) {
    console.error("Admin login failed:", e?.code, e?.message);
    return Response.json({ ok: false, error: explain(e), code: e?.code || null }, { status: 503 });
  }
}
