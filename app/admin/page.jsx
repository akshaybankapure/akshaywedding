"use client";

import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   Admin dashboard — /admin
   Default login: admin / admin123  (change it here, first thing.)
   ═══════════════════════════════════════════════════════════════════ */

const post = (url, body) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  }).then((r) => r.json().then((j) => ({ status: r.status, ...j })));

export default function Admin() {
  const [session, setSession] = useState(null);   // null = checking
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("rsvps");
  const [busy, setBusy] = useState(false);

  const loadSession = useCallback(async () => {
    const r = await fetch("/api/admin/session", { cache: "no-store" }).then((x) => x.json());
    setSession(r);
    return r;
  }, []);

  const loadData = useCallback(async () => {
    const r = await fetch("/api/admin/data", { cache: "no-store" });
    if (r.ok) setData(await r.json());
  }, []);

  useEffect(() => { loadSession(); }, [loadSession]);
  useEffect(() => { if (session?.auth) loadData(); }, [session, loadData]);

  // live refresh while the dashboard is open
  useEffect(() => {
    if (!session?.auth) return;
    const t = setInterval(loadData, 20000);
    return () => clearInterval(t);
  }, [session, loadData]);

  if (session === null) return <main className="ad"><p className="adMuted">Loading…</p></main>;
  if (!session.auth) return <Login onDone={loadSession} />;

  const s = data?.stats;

  return (
    <main className="ad">
      <header className="adTop">
        <div>
          <h1>Akshay ♥ Shraddha</h1>
          <p className="adMuted">Guest list · 09.08.2026</p>
        </div>
        <div className="adTopBtns">
          <button className="adBtn" onClick={loadData} disabled={busy}>Refresh</button>
          <button className="adBtn" onClick={async () => { await post("/api/admin/logout"); loadSession(); }}>
            Sign out
          </button>
        </div>
      </header>

      {session.isDefault && (
        <div className="adWarn">
          <b>You're still on the default password.</b> Anyone who knows it can read your guest
          list. Change it in <button className="adLink" onClick={() => setTab("settings")}>Settings</button>.
        </div>
      )}

      {s && (
        <section className="adStats">
          <Stat n={s.heads} label="People coming" big />
          <Stat n={s.responses} label="Responses" />
          <Stat n={s.attending} label="Attending" />
          <Stat n={s.notAttending} label="Can't make it" />
          <Stat n={s.blessings} label="Blessings" />
          <Stat n={s.akshata} label="Akshata thrown" />
        </section>
      )}

      {s && Object.keys(s.meals || {}).length > 0 && (
        <section className="adCard">
          <h2>Kitchen count</h2>
          <div className="adPills">
            {Object.entries(s.meals).map(([m, n]) => (
              <span className="adPill" key={m}><b>{n}</b> {m}</span>
            ))}
          </div>
          <p className="adMuted small">Counted by heads, not responses — this is the number to hand the caterer.</p>
        </section>
      )}

      <nav className="adTabs">
        {["rsvps", "blessings", "settings"].map((t) => (
          <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
            {t === "rsvps" ? "RSVPs" : t === "blessings" ? "Blessings" : "Settings"}
          </button>
        ))}
      </nav>

      {tab === "rsvps" && (
        <section className="adCard">
          <div className="adCardTop">
            <h2>RSVPs ({data?.rsvps?.length || 0})</h2>
            <a className="adBtn" href="/api/admin/export?type=rsvps">Download CSV</a>
          </div>
          {!data?.rsvps?.length ? <p className="adMuted">No RSVPs yet.</p> : (
            <div className="adScroll">
              <table className="adTable">
                <thead><tr><th>Name</th><th>Coming</th><th>Guests</th><th>Meal</th><th>Note</th><th>When</th></tr></thead>
                <tbody>
                  {[...data.rsvps].reverse().map((r, i) => (
                    <tr key={i}>
                      <td><b>{r.name || "—"}</b></td>
                      <td>{r.vibe === "afar"
                        ? <span className="adNo">No</span>
                        : <span className="adYes">Yes</span>}</td>
                      <td>{r.count || 1}</td>
                      <td>{r.meal || "—"}</td>
                      <td className="adNote">{r.note || ""}</td>
                      <td className="adMuted small">
                        {new Date(r.ts || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "blessings" && (
        <section className="adCard">
          <div className="adCardTop">
            <h2>Blessings ({data?.blessings?.length || 0})</h2>
            <a className="adBtn" href="/api/admin/export?type=blessings">Download CSV</a>
          </div>
          {!data?.blessings?.length ? <p className="adMuted">No blessings yet.</p> : (
            <div className="adList">
              {[...data.blessings].reverse().map((b) => (
                <div className={`adBless ${b.hidden ? "hidden" : ""}`} key={b.id}>
                  <p>{b.txt}</p>
                  <div className="adBlessFoot">
                    <span className="adMuted small">{b.who || "Anonymous"}</span>
                    <button className="adBtn tiny" disabled={busy} onClick={async () => {
                      setBusy(true);
                      await post("/api/admin/blessing", { id: b.id, hidden: !b.hidden });
                      await loadData(); setBusy(false);
                    }}>{b.hidden ? "Restore" : "Hide"}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="adMuted small">Hidden blessings stay in the database but disappear from the wall.</p>
        </section>
      )}

      {tab === "settings" && <Settings user={session.user} onDone={loadSession} />}
    </main>
  );
}

function Stat({ n, label, big }) {
  return (
    <div className={`adStat ${big ? "big" : ""}`}>
      <b>{n ?? 0}</b><span>{label}</span>
    </div>
  );
}

function Login({ onDone }) {
  const [user, setUser] = useState("admin");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setErr("");
    const r = await post("/api/admin/login", { user, password });
    setBusy(false);
    if (r.ok) onDone(); else setErr(r.error || "Login failed.");
  };

  return (
    <main className="ad adCentre">
      <div className="adCard adLogin">
        <h1>Guest list</h1>
        <p className="adMuted">Akshay ♥ Shraddha · 09.08.2026</p>
        <label>Username
          <input className="adInput" value={user} autoCapitalize="none"
            onChange={(e) => setUser(e.target.value)} />
        </label>
        <label>Password
          <input className="adInput" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
        </label>
        {err && <p className="adErr">{err}</p>}
        <button className="adBtn solid" onClick={submit} disabled={busy}>
          {busy ? "Checking…" : "Sign in"}
        </button>
      </div>
    </main>
  );
}

function Settings({ user, onDone }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState(null);
  const [nu, setNu] = useState(user);
  const [nup, setNup] = useState("");
  const [msg2, setMsg2] = useState(null);

  return (
    <>
      <section className="adCard">
        <h2>Change password</h2>
        <label>Current password
          <input className="adInput" type="password" value={cur} onChange={(e) => setCur(e.target.value)} />
        </label>
        <label>New password <span className="adMuted small">(at least 8 characters)</span>
          <input className="adInput" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
        </label>
        {msg && <p className={msg.ok ? "adOk" : "adErr"}>{msg.text}</p>}
        <button className="adBtn solid" onClick={async () => {
          const r = await post("/api/admin/password", { current: cur, next });
          setMsg(r.ok ? { ok: true, text: "Password changed. Other devices have been signed out." }
                      : { ok: false, text: r.error || "Could not change password." });
          if (r.ok) { setCur(""); setNext(""); onDone(); }
        }}>Update password</button>
      </section>

      <section className="adCard">
        <h2>Change username</h2>
        <label>New username
          <input className="adInput" value={nu} autoCapitalize="none" onChange={(e) => setNu(e.target.value)} />
        </label>
        <label>Confirm with your password
          <input className="adInput" type="password" value={nup} onChange={(e) => setNup(e.target.value)} />
        </label>
        {msg2 && <p className={msg2.ok ? "adOk" : "adErr"}>{msg2.text}</p>}
        <button className="adBtn" onClick={async () => {
          const r = await post("/api/admin/username", { password: nup, user: nu });
          setMsg2(r.ok ? { ok: true, text: "Username updated." }
                       : { ok: false, text: r.error || "Could not change username." });
          if (r.ok) { setNup(""); onDone(); }
        }}>Update username</button>
      </section>

      <section className="adCard">
        <h2>Where your data lives</h2>
        <p className="adMuted">
          Everything — RSVPs, blessings and the akshata count — is stored in
          <code> data/kv.json </code> on your server. Back it up by downloading the CSVs above,
          or by copying that one file. Deleting it resets everything.
        </p>
      </section>
    </>
  );
}
