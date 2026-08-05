# Deploying to Hostinger (Business plan)

Your plan supports this app as-is. Hostinger's **Node.js Web Apps** hosting is available on Business and Cloud plans, and it runs the real Next.js server — so the API routes, the RSVP form, the admin dashboard and the live ceremony all work. You do **not** need a static export, and you must not use one: `output: 'export'` would delete every server route and break the entire guest list.

## Deploy

In hPanel: **Websites → Add Website → Node.js App**. You have three options — connect a GitHub repository (easiest, redeploys on every push), upload the project as a `.zip`, or use the Hostinger Connector from your IDE.

Settings to confirm:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Start command | `npm start` |
| Node version | 18 or higher |
| Install command | `npm install` |

Point your domain at the app, and you're live.


## Connect the MySQL database (recommended)

You already have one: `u805448495_akshayweds`. Using it beats the JSON file in three ways — it survives redeploys, two guests submitting in the same second can't overwrite each other, and you can read the rows in phpMyAdmin.

In hPanel → your Node.js app → **Environment Variables**, add five:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u805448495_akshayweds
DB_USER=u805448495_akshayweds
DB_PASSWORD=<the password you set for that MySQL user>
```

Redeploy, then open `/admin`. The dashboard shows which store is live — it should read **mysql** with your database name. That's the whole setup: **the app creates its own tables on first use**, so you never run SQL by hand.

To connect from your laptop instead of the server, use hPanel → Databases → **Remote MySQL** to whitelist your IP, and set `DB_HOST` to the hostname shown there (not `localhost`).

### Tables it creates

| Table | Contents |
|---|---|
| `rsvps` | name, attending, guests, meal, note, timestamp |
| `blessings` | who, message, hidden flag, timestamp |
| `ceremony` | running akshata total |
| `ceremony_guests` | one row per device that joined live |
| `settings` | admin username and password hash |

All `utf8mb4`, so Marathi, Kannada and emoji store correctly.

**If the `DB_*` variables are missing the app silently falls back to the JSON file.** That's convenient locally, but it means a typo in a variable name looks like "my RSVPs vanished." The `/admin` dashboard always states which backend is actually in use — check there first.

**Backups:** phpMyAdmin → Export for a full `.sql` dump; the dashboard CSVs for the caterer.

## ⚠️ Do this before you send the invite out

**1. Set the `DB_*` variables above**, so the guest list lives in MySQL rather than in a file inside the deploy folder. (If you skip MySQL, at least set `DATA_DIR` to a path outside the app directory, or a redeploy can erase every RSVP.)

**2. Change the admin password.** Visit `https://yourdomain.com/admin`, sign in with `admin` / `admin123`, and change it immediately in **Settings**. Until you do, the dashboard shows a red warning — because anyone who reads this repo knows the default.

**3. Force HTTPS.** hPanel installs a free SSL certificate; turn on "Force HTTPS". The admin session cookie is marked `secure` in production, so login will not persist over plain HTTP.

## Backups

The whole database is a single file. Two ways to keep a copy:

- **From the dashboard** — the Download CSV buttons on the RSVPs and Blessings tabs. Do this the week of the wedding and again the night before; hand the meal counts to the caterer.
- **From the server** — copy `kv.json` out of your `DATA_DIR` via File Manager or FTP.

To reset everything (after testing, say), delete `kv.json`. It regenerates empty, and a fresh admin credential is seeded on the next login.

## Resource usage

The hPanel dashboard graphs CPU, RAM and I/O against your plan's limit. This app is light — it's a single page plus small JSON reads — but the 3D scene is rendered on the *guest's* device, not the server, so a burst of visitors costs you almost nothing. The one moment to watch is 11:00 AM on the wedding day, when remote guests tap akshata: taps are batched to one request per second per device, so even a few hundred people stay comfortably within a Business plan.

## Sanity check before the day

1. Open the site on a phone over mobile data (not your home wifi).
2. Submit a test RSVP, then confirm it appears at `/admin`.
3. Leave a test blessing, then hide it from the dashboard and check it disappears from the wall.
4. Open `https://yourdomain.com/?rehearsal=1` — the live ceremony opens immediately. Throw some akshata and confirm the counter moves.
5. Delete your test rows: download the CSVs first, then clear `kv.json` if you want a clean slate.


## If the admin page won't log in

Open **`yourdomain.com/api/admin/diagnose`** in a browser. It works without logging in — because the usual reason you need it is that logging in is broken — and it never shows your password or any guest data.

It tells you which variables the app can see and exactly what MySQL said:

```json
{ "backend": "mysql", "ok": true,
  "database": "u805448495_akshayweds",
  "tables": ["blessings","ceremony","ceremony_guests","rsvps","settings"],
  "verdict": "Connected. Everything is being saved to MySQL." }
```

The common failures and their fixes:

| What you'll see | Cause | Fix |
|---|---|---|
| `ECONNREFUSED` | Wrong host | Set `DB_HOST=localhost` |
| `ER_ACCESS_DENIED_ERROR` mentioning `@'::1'` | **IPv6.** `localhost` resolved to the IPv6 loopback, but your MySQL user is granted for `localhost`/`127.0.0.1` — so the password is fine, the *host* isn't | Set `DB_HOST=127.0.0.1` and restart. (The app now pins IPv4 automatically, so this shouldn't recur.) |
| `ER_ACCESS_DENIED_ERROR` (no `::1`) | Wrong user or password | The user is the **full** name, `u123456789_akshayweds`, not the short one |
| `ER_DBACCESS_DENIED_ERROR` | User isn't attached to the database | Assign the user to the database in hPanel → Databases |
| `ER_BAD_DB_ERROR` | Wrong database name | Copy it exactly from hPanel |
| `ETIMEDOUT` | Remote host not whitelisted | Use `localhost`, or add the server IP under Remote MySQL |
| `"backend": "file"` with a `missing` list | Variables not picked up | Add them in hPanel → your app → Environment Variables, then **restart the app** |

That last one is worth knowing about: **if the variables are missing the app doesn't crash — it quietly writes to `data/kv.json` instead.** Everything appears to work, but a redeploy can wipe it. The `/admin` Settings tab and this endpoint both state which backend is actually live.

**Environment variables are read when the app starts**, so after changing them in hPanel you must restart the Node app for them to take effect.


## A note on `localhost` vs `127.0.0.1`

MySQL grants are per-host, and `localhost` is ambiguous — Node can resolve it to the IPv6 loopback `::1`, while your grant covers `localhost`/`127.0.0.1`. The connection then arrives as `user@'::1'` and MySQL refuses it with *Access denied*, even though the password is correct. It's a confusing failure because everything looks right.

The app now resolves `localhost` to `127.0.0.1` and opens the socket with IPv4 explicitly, so this can't bite you. If you ever need the old behaviour, set `DB_IP_FAMILY=0` (automatic) or `6`.
