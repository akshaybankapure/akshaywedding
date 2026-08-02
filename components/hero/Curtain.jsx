"use client";

/* The antarpat — the signature moment, kept exactly as it was.

   It's driven entirely by a CSS variable (--heroP, 0→1) written by the
   scroll loop, so parting the curtain costs no React renders at all.
   The maths that used to run in JS now lives in calc() on the GPU. */
export default function Curtain() {
  const EMB = Array.from({ length: 8 }, (_, i) => {
    const x = i * 50 + 8;
    return `M${x} 20 q10 -16 20 0 q-6 6 -10 2 q-4 -4 2 -8 M${x + 30} 18 q5 -8 10 0`;
  }).join(" ");
  const tassels = Array.from({ length: 9 }).map((_, i) => <i key={i} />);

  return (
    <div className="curtain" aria-hidden="true">
      <div className="cloth L">
        <div className="tassels">{tassels}</div>
        <svg className="embroid" viewBox="0 0 400 26" preserveAspectRatio="none"><path pathLength="1" d={EMB} /></svg>
      </div>
      <div className="cloth R">
        <div className="tassels">{tassels}</div>
        <svg className="embroid" viewBox="0 0 400 26" preserveAspectRatio="none">
          <path pathLength="1" d={EMB} style={{ animationDelay: ".8s" }} />
        </svg>
      </div>
      <div className="clothText">
        <div>
          <div className="big display dev phase1">मंगलाष्टकं चालू आहे…</div>
          <div className="big display dev phase2">शुभमंगल… सावधान!</div>
          <div className="small">Scroll <span className="dev">हळू हळू</span> — the antarpat is about to drop</div>
        </div>
      </div>
    </div>
  );
}
