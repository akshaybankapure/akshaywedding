"use client";

import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import * as THREE from "three";
import RSVP from "@/components/rsvp/Rsvp";

/* Two interlocked wedding rings — gold & rose-gold tori, RSVP confirmation. */
export default function Rings3D() {
  const hostRef = useRef(null);
  useEffect(() => {
    const host = hostRef.current; if (!host) return;
    let R;
    try { R = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch (e) { return; }
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    R.outputEncoding = THREE.sRGBEncoding;
    R.toneMapping = THREE.ACESFilmicToneMapping;
    R.setClearColor(0x000000, 0);
    R.setSize(230, 150, false);
    R.domElement.style.width = "230px"; R.domElement.style.height = "150px";
    host.appendChild(R.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(38, 230 / 150, 0.1, 20); cam.position.z = 3.4;
    scene.add(new THREE.AmbientLight(0xffe9c4, 0.7));
    const key = new THREE.DirectionalLight(0xfff1c9, 1.3); key.position.set(2, 3, 4); scene.add(key);
    const ringGeo = new THREE.TorusGeometry(0.62, 0.085, 24, 64);
    const g1 = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0xe6b64c, metalness: 0.95, roughness: 0.22, emissive: 0x2a1a05, emissiveIntensity: 0.5 }));
    const g2 = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0xe89a8a, metalness: 0.95, roughness: 0.24, emissive: 0x2a0f0a, emissiveIntensity: 0.5 }));
    g1.position.x = -0.36; g2.position.x = 0.36; g2.rotation.y = Math.PI / 2.15;
    const grp = new THREE.Group(); grp.add(g1, g2); grp.rotation.x = 0.35; scene.add(grp);
    const sn = 26; const sGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(sn * 3);
    for (let i = 0; i < sn; i++) {
      const a = (i / sn) * Math.PI * 2, r = 1.02 + (i % 3) * 0.09;
      sPos[i * 3] = Math.cos(a) * r; sPos[i * 3 + 1] = Math.sin(a) * r * 0.55; sPos[i * 3 + 2] = Math.sin(a * 2) * 0.2;
    }
    sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    const sparkles = new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xffe2a1, size: 0.045, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(sparkles);
    const clock = new THREE.Clock();
    let raf = 0, alive = true;
    const loop = () => {
      if (!alive) return;
      grp.rotation.y = clock.elapsedTime * 0.7;
      grp.rotation.x = 0.35 + Math.sin(clock.elapsedTime * 0.8) * 0.12;
      sparkles.rotation.y = -clock.elapsedTime * 1.1;
      sparkles.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.3;
      sparkles.material.opacity = 0.65 + Math.sin(clock.elapsedTime * 4) * 0.25;
      R.render(scene, cam);
      if (!reduced) raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      alive = false; cancelAnimationFrame(raf);
      ringGeo.dispose(); g1.material.dispose(); g2.material.dispose(); sGeo.dispose(); sparkles.material.dispose(); R.dispose();
      if (R.domElement.parentNode) R.domElement.parentNode.removeChild(R.domElement);
    };
  }, []);
  return <div ref={hostRef} aria-hidden="true" style={{ display: "flex", justifyContent: "center", margin: "2px 0 6px" }} />;
}


/* Pointer-tracked 3D tilt with a moving glare highlight. Disabled for
   touch pointers and reduced motion. */
