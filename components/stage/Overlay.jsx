"use client";

import { useEffect, useRef } from "react";

/* Tap-anywhere confetti. One canvas, fixed to the viewport, idle until
   something actually bursts — the loop stops itself when no particles
   remain, so it costs nothing while you're just reading. */

export function Confetti({ reduced, bindRef }) {
  const cRef = useRef(null);
  useEffect(() => {
    if (reduced) return;
    const cv = cRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fit = () => {
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(cv);

    const parts = [];
    const COLORS = ["#f59a2b", "#ff5d8f", "#f7d87c", "#23c08f", "#fff3c8"];
    const burst = (x, y, n = 46) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 7;
        parts.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3,
          r: 2 + Math.random() * 5, rot: Math.random() * 6.3, vr: (Math.random() - .5) * .4,
          c: COLORS[(Math.random() * COLORS.length) | 0], life: 1,
          rice: Math.random() < .35,
        });
      }
      if (parts.length > 500) parts.splice(0, parts.length - 500);
      kick();
    };
    if (bindRef) bindRef.current = burst;

    const tap = (e) => {
      const t = e.touches?.[0] || e;
      burst(t.clientX, t.clientY, 30);
    };
    window.addEventListener("pointerdown", tap, { passive: true });

    let raf = 0, alive = true, running = false;
    const loop = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, W, H);
      if (!parts.length) { running = false; return; }   // idle → stop burning frames
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy += .22; p.vx *= .99; p.vy *= .99;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= .009;
        if (p.life <= 0 || p.y > H + 40) { parts.splice(i, 1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.rice ? "#fff8e6" : p.c;
        if (p.rice) ctx.fillRect(-1.4, -3, 2.8, 6);
        else { ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .55, 0, 0, 6.3); ctx.fill(); }
        ctx.restore();
      }
      raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };
    return () => {
      alive = false; cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener("pointerdown", tap);
      if (bindRef) bindRef.current = null;
    };
  }, [reduced, bindRef]);

  return <canvas ref={cRef} className="confetti" aria-hidden="true" />;
}
