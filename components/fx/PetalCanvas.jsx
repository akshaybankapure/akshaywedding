"use client";

import { useEffect, useRef } from "react";
import { fx } from "@/lib/helpers";
import Reveal from "@/components/fx/Reveal";

export default function PetalCanvas({ reduced }) {
  const ref = useRef(null);
  useEffect(() => {
    if (reduced) return;
    const cv = ref.current; const ctx = cv.getContext("2d");
    let W = 0, H = 0, raf = 0, parts = [], mouse = { x: -999, y: -999 };
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => { W = window.innerWidth; H = window.innerHeight; cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + "px"; cv.style.height = H + "px"; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
    resize(); window.addEventListener("resize", resize);
    const PALETTE = ["#f2a33c", "#e8842c", "#f6c25a", "#e26a4a", "#ffd98e"];
    const petal = (burst, x, y) => ({
      x: burst ? x : Math.random() * W, y: burst ? y : -20 - Math.random() * H * 0.3,
      vx: burst ? (Math.random() - 0.5) * 7 : (Math.random() - 0.5) * 0.5,
      vy: burst ? -(2 + Math.random() * 6) : 0.4 + Math.random() * 0.8,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.06,
      s: 5 + Math.random() * 7, c: PALETTE[(Math.random() * PALETTE.length) | 0],
      sway: Math.random() * Math.PI * 2, life: 1, type: "petal", burst,
    });
    const grain = (x, y) => ({
      x, y, vx: (Math.random() - 0.5) * 9, vy: -(3 + Math.random() * 7),
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      s: 2 + Math.random() * 1.6, c: Math.random() > 0.4 ? "#fff3d6" : "#f4c445",
      life: 1, type: "grain", burst: true,
    });
    const AMBIENT = W < 640 ? 20 : 34;
    for (let i = 0; i < AMBIENT; i++) { const p = petal(false); p.y = Math.random() * H; parts.push(p); }
    fx.burst = (x = W / 2, y = H / 2) => {
      for (let i = 0; i < 26; i++) parts.push(petal(true, x, y));
      for (let i = 0; i < 70; i++) parts.push(grain(x, y));
    };
    const onMove = (e) => { const t = e.touches ? e.touches[0] : e; mouse.x = t.clientX; mouse.y = t.clientY; };
    window.addEventListener("pointermove", onMove, { passive: true });
    let hidden = false;
    const onVis = () => { hidden = document.hidden; };
    document.addEventListener("visibilitychange", onVis);
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (hidden) return;
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (p.type === "grain") { p.vy += 0.22; p.life -= 0.012; }
        else if (p.burst) { p.vy += 0.12; p.vx *= 0.985; p.life -= 0.006; }
        else { p.sway += 0.015; p.vx += Math.sin(p.sway) * 0.008; p.vx *= 0.99; }
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 8100) { const d = Math.sqrt(d2) || 1; p.vx += (dx / d) * 0.35; p.vy += (dy / d) * 0.2; }
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (!p.burst && (p.y > H + 24 || p.x < -30 || p.x > W + 30)) { parts[i] = petal(false); continue; }
        if (p.burst && (p.life <= 0 || p.y > H + 30)) { parts.splice(i, 1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.min(1, p.life) * (p.type === "grain" ? 0.95 : 0.8);
        ctx.fillStyle = p.c;
        if (p.type === "grain") { ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
        else {
          ctx.beginPath();
          ctx.moveTo(0, -p.s);
          ctx.quadraticCurveTo(p.s * 0.9, -p.s * 0.2, 0, p.s);
          ctx.quadraticCurveTo(-p.s * 0.9, -p.s * 0.2, 0, -p.s);
          ctx.fill();
        }
        ctx.restore();
      }
    };
    tick();
    return () => {
      cancelAnimationFrame(raf); fx.burst = null;
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduced]);
  if (reduced) return null;
  return <canvas ref={ref} aria-hidden="true"
    style={{ position: "fixed", inset: 0, zIndex: 3, pointerEvents: "none" }} />;
}

/* Reveal wrapper — fades chapters/blocks in on first viewport entry. */

/* ── 3D layer · Three.js r128 (MIT) — everything below is procedural
      geometry + shaders authored in code: zero external models or
      textures, zero asset licences. ── */

