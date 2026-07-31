"use client";

import { useEffect, useRef } from "react";

/* Soft gold glow that trails the cursor (screen blend). */
export default function CursorGlow() {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y, raf;
    const mv = (e) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      if (ref.current) ref.current.style.transform = `translate(${x - 170}px, ${y - 170}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", mv, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("pointermove", mv); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="cglow" aria-hidden="true" />;
}

/* Self-drawing rangoli chapter divider — strokes draw in when scrolled
   into view, paisley knot at the centre. */
