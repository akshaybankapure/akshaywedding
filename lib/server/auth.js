/* ═══════════════════════════════════════════════════════════════════
   Admin authentication.
   Uses only Node's built-in crypto — no extra dependencies to install
   on shared hosting.

   • The password is never stored. Only a scrypt hash + random salt.
   • The default password is "admin123". CHANGE IT from the dashboard
     the first time you log in — the UI nags you until you do.
   • Sessions are signed cookies (HMAC-SHA256). The signing secret is
     generated once, at random, and kept in data/kv.json. Changing the
     password rotates the secret, which logs out every other device.
   ═══════════════════════════════════════════════════════════════════ */

import crypto from "crypto";
import { cookies } from "next/headers";
import { getSetting, setSetting } from "@/lib/server/data";

const CRED_KEY = "admin-cred-v1";
const COOKIE = "aws_admin";
const MAX_AGE = 60 * 60 * 12;            // 12 hours
const DEFAULT_PASSWORD = "admin123";
export const DEFAULT_USER = "admin";

function scrypt(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => err ? reject(err) : resolve(key.toString("hex")));
  });
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/** Read the stored credential, seeding the default on first run. */
async function getCred() {
  let cred = await getSetting(CRED_KEY);
  if (!cred) {
    const salt = crypto.randomBytes(16).toString("hex");
    cred = {
      user: DEFAULT_USER,
      salt,
      hash: await scrypt(DEFAULT_PASSWORD, salt),
      secret: crypto.randomBytes(32).toString("hex"),
      isDefault: true,
    };
    await setSetting(CRED_KEY, cred);
  }
  return cred;
}

export async function verifyLogin(user, password) {
  const cred = await getCred();
  if (!safeEqual(String(user || "").trim(), cred.user)) return null;
  const hash = await scrypt(String(password || ""), cred.salt);
  return safeEqual(hash, cred.hash) ? cred : null;
}

function sign(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

function unsign(token, secret) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [body, mac] = token.split(".");
  const expect = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (!safeEqual(mac, expect)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    return payload.exp > Date.now() ? payload : null;
  } catch { return null; }
}

export async function startSession() {
  const cred = await getCred();
  const token = sign({ u: cred.user, exp: Date.now() + MAX_AGE * 1000 }, cred.secret);
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function endSession() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** Returns the credential record when the caller is a logged-in admin. */
export async function requireAdmin() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const cred = await getCred();
  return unsign(token, cred.secret) ? cred : null;
}

export async function changePassword(current, next) {
  const cred = await getCred();
  const currentHash = await scrypt(String(current || ""), cred.salt);
  if (!safeEqual(currentHash, cred.hash)) return { ok: false, error: "Current password is incorrect." };
  const pw = String(next || "");
  if (pw.length < 8) return { ok: false, error: "New password must be at least 8 characters." };

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await scrypt(pw, salt);
  const secret = crypto.randomBytes(32).toString("hex");   // rotate → other devices log out
  await setSetting(CRED_KEY, { ...cred, salt, hash, secret, isDefault: false });
  await startSession();                                     // keep this device signed in
  return { ok: true };
}

export async function changeUsername(password, nextUser) {
  const cred = await getCred();
  const hash = await scrypt(String(password || ""), cred.salt);
  if (!safeEqual(hash, cred.hash)) return { ok: false, error: "Password is incorrect." };
  const u = String(nextUser || "").trim();
  if (u.length < 3) return { ok: false, error: "Username must be at least 3 characters." };
  await setSetting(CRED_KEY, { ...cred, user: u });
  await startSession();
  return { ok: true };
}
