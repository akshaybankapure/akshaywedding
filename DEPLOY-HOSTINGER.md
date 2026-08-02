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

## ⚠️ Do this before you send the invite out

**1. Move the database outside the app folder.** By default the guest list lives in `data/kv.json` inside the project. A redeploy can replace that folder — taking every RSVP with it. In hPanel → your app → **Environment Variables**, add:

```
DATA_DIR=/home/uXXXXXXXX/wedding-data
```

Use your real home path (find it in File Manager) and pick a folder *outside* `public_html` / the app directory. Create it once; the app writes the file itself. This one variable is the difference between "we have the guest list" and "we lost the guest list."

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
