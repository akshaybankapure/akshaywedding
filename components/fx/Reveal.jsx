"use client";

import { useState, useEffect, useRef } from "react";

export default function Reveal({ children, delay = 0, as: Tag = "div", className = "", style, ...rest }) {
  const ref = useRef(null); const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`rv ${on ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }} {...rest}>{children}</Tag>
  );
}

/* Antarpat — the silk cloth that parts as you scroll. p ∈ [0,1]. */
