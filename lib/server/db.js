/* ═══════════════════════════════════════════════════════════════════
   Server-side data store.
   A single JSON file on disk. This is the right choice for Hostinger's
   Node.js hosting (Business plan) because the filesystem is persistent
   — unlike serverless platforms, where it would be wiped between
   invocations.

   Every write goes through a promise queue so two guests submitting at
   the same instant can't clobber each other's row.
   ═══════════════════════════════════════════════════════════════════ */

import { promises as fs } from "fs";
import path from "path";

/* DATA_DIR lets you keep the database OUTSIDE the app folder — important
   on Hostinger, where a redeploy can replace the deployed directory and
   would otherwise take your guest list with it. Set it in hPanel →
   Environment Variables, e.g.  DATA_DIR=/home/uXXXXXXX/wedding-data
   Falls back to ./data for local development. */
const DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DIR, "kv.json");

let queue = Promise.resolve();

export async function readAll() {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return {};
  }
}

async function writeAll(obj) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(obj, null, 2));
  await fs.rename(tmp, FILE);           // atomic swap — never a half-written file
}

export async function get(key, fallback = null) {
  const all = await readAll();
  return key in all ? all[key] : fallback;
}

export async function set(key, value) {
  return mutate((all) => { all[key] = value; return value; });
}

/** Run a read-modify-write safely against concurrent callers. */
export function mutate(fn) {
  const next = queue.then(async () => {
    const all = await readAll();
    const result = await fn(all);
    await writeAll(all);
    return result;
  });
  queue = next.catch(() => {});
  return next;
}
