"use client";

import { useRef } from "react";

/* Pointer-tracked 3D tilt with a moving glare highlight. Disabled for
   touch pointers and reduced motion. */
export default function Tilt({ className = "", children, max = 7, ...rest }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia && (window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", ((px - 0.5) * 2 * max).toFixed(2) + "deg");
    el.style.setProperty("--rx", ((0.5 - py) * 2 * max).toFixed(2) + "deg");
    el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
    el.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
    el.style.setProperty("--go", 1);
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--go", 0);
  };
  return (
    <div ref={ref} className={`tilt ${className}`} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      {children}<span className="glare" aria-hidden="true" />
    </div>
  );
}

/* Soft gold glow that trails the cursor (screen blend). */
