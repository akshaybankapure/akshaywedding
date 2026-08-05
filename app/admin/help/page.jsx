"use client";

import Link from "next/link";
import { ArrowLeft, Printer, Video, Users, Flower2, Heart, AlertTriangle } from "lucide-react";

/* The same guide as FOR-THE-HELPER.md, but living inside the admin so
   whoever is helping on the day can just be sent /admin/help — no file
   to find, no app to install, and it prints to a single page. */

export default function HelperGuide() {
  return (
    <main className="ad adHelp">
      <header className="adTop">
        <div>
          <h1>Putting the live stream up</h1>
          <p className="adMuted">A two-minute guide · 9 August</p>
        </div>
        <div className="adTopBtns">
          <Link className="adBtn" href="/admin"><ArrowLeft size={14} /> Back</Link>
          <button className="adBtn" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
        </div>
      </header>

      <section className="adCard">
        <h2>What you're doing</h2>
        <p className="adMuted">
          Akshay and Shraddha's invitation has a space for a live video. It stays empty
          until someone pastes the link in — that's the whole job. Relatives who couldn't
          travel will be watching through it.
        </p>
      </section>

      <section className="adCard">
        <h2><Video size={15} /> Step 1 — Start the stream</h2>
        <p className="adMuted">On a well-charged phone, on a tripod, pointed at the mandap:</p>
        <ol className="adSteps">
          <li>Open the <b>YouTube</b> app → <b>+</b> → <b>Go live</b></li>
          <li>Title it <i>Akshay &amp; Shraddha — Akshata Muhurat</i></li>
          <li>Set visibility to <b>Unlisted</b> — not Public, not Private</li>
          <li>Start it a few minutes before <b>12:00 PM</b></li>
          <li>Tap <b>Share</b> and copy the link</li>
        </ol>
        <p className="adTip">
          <AlertTriangle size={13} /> Unlisted means anyone with the invitation can watch,
          but it won't appear in YouTube search. Private would lock guests out.
        </p>
      </section>

      <section className="adCard">
        <h2>Step 2 — Paste it in</h2>
        <ol className="adSteps">
          <li>You're already here — go to the <Link className="adLink" href="/admin">Live stream tab</Link></li>
          <li>Paste the link into the box</li>
          <li>
            Check the message underneath. It should read
            <b className="adOkInline"> “YouTube — plays embedded inside the invitation”</b>,
            and a preview of the video should appear.
          </li>
          <li>Optionally add a note like <i>“Starts at 11:55”</i></li>
          <li>Press <b>Save link</b></li>
        </ol>
        <p className="adMuted">
          That's it. Within a minute every guest sees the video — including people who
          opened the invitation hours ago.
        </p>
      </section>

      <section className="adCard">
        <h2>If something looks wrong</h2>
        <dl className="adFaq">
          <dt>Red text: “doesn't look like a link”</dt>
          <dd>What you pasted isn't a web address. It needs to start with <code>https://</code>.</dd>

          <dt>It says “Google Meet — shows a Join button”</dt>
          <dd>
            You've pasted the Meet link rather than YouTube. That still works — guests get a
            button that opens the Meet app — it just doesn't play inside the page, because
            Google blocks video calls from being embedded.
          </dd>

          <dt>No preview appears</dt>
          <dd>The stream is probably set to Private. Change it to Unlisted in YouTube.</dd>

          <dt>You need to take it down</dt>
          <dd>Press <b>Clear</b>, then <b>Save link</b>. The video section disappears.</dd>
        </dl>
      </section>

      <section className="adCard">
        <h2>The other tabs, in case anyone asks</h2>
        <div className="adFaq">
          <dt><Users size={13} /> RSVPs</dt>
          <dd>Who's coming, and the meal counts for the kitchen.</dd>
          <dt><Flower2 size={13} /> Akshata</dt>
          <dd>
            Guests watching from far away can throw rice on their phones at 12:00.
            This shows who did, and how much.
          </dd>
          <dt><Heart size={13} /> Blessings</dt>
          <dd>Messages guests have left. If anything inappropriate appears, press <b>Hide</b>.</dd>
        </div>
        <p className="adTip">
          <AlertTriangle size={13} /> Please don't change the password — Akshay needs it after the wedding.
        </p>
      </section>

      <p className="adThanks">
        Thank you, truly. This is the part that lets the people who couldn't travel be there.
      </p>
    </main>
  );
}
