"use client";

import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════════
   THE WORLD  —  art direction notes
   ───────────────────────────────────────────────────────────────────
   Six dioramas stacked down the Y axis; one camera flies through them.
   The rules that keep it looking composed rather than "programmer art":

   1. NOTHING sits closer to the camera than z = -4. All content lives
      behind the glass panels, never in front of the text.
   2. No solid primitives pretending to be objects (no box-with-wheels).
      Landforms are layered paper-cut silhouettes; props are either
      elegant lathe/torus forms or pure light.
   3. Everything warm is emissive, so it never renders as a grey blob
      when a light misses it.
   4. Each zone has a framing offset so the camera composes it, instead
      of flying through the middle of the geometry.

   All geometry is procedural — zero external models, zero textures.
   Three.js is MIT. (To drop in real CC0 miniatures, see ARCHITECTURE.md
   — the GLTF slot is already wired in the Next.js project.)
   ═══════════════════════════════════════════════════════════════════ */

const GAP = 20;
const ZONES = 6;
const DEPTH = GAP * (ZONES - 1);

function radialTex(inner, mid) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d");
  const rg = g.createRadialGradient(64, 64, 2, 64, 64, 62);
  rg.addColorStop(0, `rgba(${inner},1)`);
  rg.addColorStop(.35, `rgba(${mid},.55)`);
  rg.addColorStop(1, `rgba(${mid},0)`);
  g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* soft petal silhouette, drawn once and reused as a sprite */
function petalTex() {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 0, 64);
  grd.addColorStop(0, "rgba(255,196,92,.95)");
  grd.addColorStop(1, "rgba(240,116,26,.65)");
  g.fillStyle = grd;
  g.beginPath();
  g.ellipse(32, 32, 26, 13, 0, 0, Math.PI * 2);
  g.fill();
  return new THREE.CanvasTexture(c);
}

const SKY_VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
/* A calm vertical gradient with a slow drifting bloom — no noisy static. */
const SKY_FRAG = `
precision mediump float; varying vec2 vUv;
uniform float uT, uAmp; uniform vec3 uTop, uBot, uGlow;
void main(){
  float g = smoothstep(0., 1., vUv.y);
  vec3 col = mix(uBot, uTop, g);
  vec2 c = vec2(.5 + sin(uT*.06)*.16, .42 + cos(uT*.05)*.12);
  float bloom = pow(1. - clamp(distance(vUv, c)*1.6, 0., 1.), 3.);
  col = mix(col, uGlow, bloom * .55);
  gl_FragColor = vec4(col, uAmp);
}`;

/* ── props ──────────────────────────────────────────────────────── */

function makeKalash(gold, bright) {
  const g = new THREE.Group();
  const prof = [[.02,0],[.5,.03],[.68,.2],[.74,.46],[.66,.7],[.44,.86],[.3,.94],[.27,1.05],[.4,1.12],[.44,1.18],[.31,1.22]]
    .map(p => new THREE.Vector2(p[0], p[1]));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 64), gold));
  const band = new THREE.Mesh(new THREE.TorusGeometry(.285, .022, 12, 48), bright);
  band.rotation.x = Math.PI / 2; band.position.y = .99; g.add(band);
  const coco = new THREE.Mesh(new THREE.SphereGeometry(.23, 28, 20),
    new THREE.MeshStandardMaterial({ color: 0x7a5533, roughness: .85, metalness: .05 }));
  coco.scale.set(1, 1.12, 1); coco.position.y = 1.35; g.add(coco);
  const ls = new THREE.Shape();
  ls.moveTo(0, 0); ls.quadraticCurveTo(.11, .2, 0, .5); ls.quadraticCurveTo(-.11, .2, 0, 0);
  const lg = new THREE.ShapeGeometry(ls);
  const lm = new THREE.MeshStandardMaterial({
    color: 0x2fa877, roughness: .5, side: THREE.DoubleSide,
    emissive: 0x0d3d2a, emissiveIntensity: .6,
  });
  for (let i = 0; i < 7; i++) {
    const pv = new THREE.Group(); pv.rotation.y = (i / 7) * Math.PI * 2;
    const lf = new THREE.Mesh(lg, lm);
    lf.position.set(.26, 1.12, 0); lf.rotation.set(0, Math.PI / 2, -1.0);
    pv.add(lf); g.add(pv);
  }
  return g;
}

/* Layered paper-cut ridges. Reads as intentional illustration at any
   distance — the opposite of a bare cone. */
function ridgeLayer(width, height, seed, color, y, z, opacity) {
  const shape = new THREE.Shape();
  const steps = 40;
  shape.moveTo(-width / 2, -6);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, x = -width / 2 + t * width;
    const h = Math.sin(t * Math.PI * 2.2 + seed) * .5 + Math.sin(t * Math.PI * 5.7 + seed * 2) * .28 + Math.sin(t * Math.PI * 11 + seed) * .12;
    shape.lineTo(x, h * height);
  }
  shape.lineTo(width / 2, -6);
  shape.closePath();
  const m = new THREE.Mesh(new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
  m.position.set(0, y, z);
  return m;
}

function makeMandap(gold, bright) {
  const g = new THREE.Group();
  const pillar = new THREE.CylinderGeometry(.13, .17, 5, 20);
  const pts = [[-2.6, -1.4], [2.6, -1.4], [-2.6, 2.2], [2.6, 2.2]];
  pts.forEach(([x, z]) => {
    const p = new THREE.Mesh(pillar, gold); p.position.set(x, -.8, z - 2); g.add(p);
    const k = new THREE.Mesh(new THREE.SphereGeometry(.2, 20, 14), bright);
    k.position.set(x, 1.85, z - 2); g.add(k);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.28, .34, .22, 20), bright);
    base.position.set(x, -3.25, z - 2); g.add(base);
  });
  // draped canopy: four gentle catenary swags instead of a hard cone
  const swagMat = new THREE.MeshStandardMaterial({
    color: 0x8f2545, roughness: .85, side: THREE.DoubleSide,
    emissive: 0x3d0d1d, emissiveIntensity: .5,
  });
  [[[-2.6, -1.4], [2.6, -1.4]], [[-2.6, 2.2], [2.6, 2.2]],
   [[-2.6, -1.4], [-2.6, 2.2]], [[2.6, -1.4], [2.6, 2.2]]].forEach(([a, b]) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(a[0], 1.85, a[1] - 2),
      new THREE.Vector3((a[0] + b[0]) / 2, 1.15, (a[1] + b[1]) / 2 - 2),
      new THREE.Vector3(b[0], 1.85, b[1] - 2),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 28, .11, 10), swagMat));
  });
  return g;
}

function isCoarse() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

export default function Stage3D({ progRef, theme, reduced, party }) {
  const hostRef = useRef(null);
  const pRef = progRef;
  const partyRef = useRef(party); partyRef.current = party;
  const apiRef = useRef(null);
  const [ok, setOk] = useState(true);

  useEffect(() => {
    const host = hostRef.current; if (!host) return;
    let R;
    try { R = new THREE.WebGLRenderer({ antialias: !isCoarse(), alpha: true, powerPreference: "high-performance" }); }
    catch { setOk(false); return; }

    /* Quality tiers. A phone GPU rendering a full scene at DPR 2 every
       frame is what made this crawl. Mobile now runs at ~1x resolution,
       capped to 30fps, with far fewer objects. */
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.innerWidth < 820 || coarse;
    const lowPower = small || (navigator.hardwareConcurrency || 8) <= 4;
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5));
    R.outputEncoding = THREE.sRGBEncoding;
    R.toneMapping = THREE.ACESFilmicToneMapping;
    R.toneMappingExposure = 1.05;
    R.setClearColor(0x000000, 0);
    host.appendChild(R.domElement);
    Object.assign(R.domElement.style, { width: "100%", height: "100%", display: "block" });

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0e24, 16, 46);
    const cam = new THREE.PerspectiveCamera(46, 1, .1, 90);

    /* lighting: warm key, cool rim, soft sky/ground fill.
       Nothing in the scene can fall to flat grey. */
    const hemi = new THREE.HemisphereLight(0xffe0b0, 0x2a1a3a, .75);
    const key = new THREE.DirectionalLight(0xffd08a, 1.35); key.position.set(4, 7, 6);
    const rim = new THREE.DirectionalLight(0x9ec4ff, .75); rim.position.set(-5, 2, -4);
    scene.add(hemi, key, rim);

    const sky = new THREE.Mesh(new THREE.PlaneGeometry(120, 70), new THREE.ShaderMaterial({
      vertexShader: SKY_VERT, fragmentShader: SKY_FRAG,
      depthWrite: false, transparent: true,
      uniforms: {
        uT: { value: 0 }, uAmp: { value: 1 },
        uTop: { value: new THREE.Color(0x0a0e24) },
        uBot: { value: new THREE.Color(0x2a1330) },
        uGlow: { value: new THREE.Color(0x7c1f38) },
      },
    }));
    sky.position.z = -34; cam.add(sky); scene.add(cam);

    const glowT = radialTex("255,222,160", "255,150,60");
    const petT = petalTex();

    const gold = new THREE.MeshStandardMaterial({
      color: 0xe8b84b, metalness: .95, roughness: .26,
      emissive: 0x3a2408, emissiveIntensity: .55,
    });
    const bright = new THREE.MeshStandardMaterial({
      color: 0xf9d97e, metalness: .9, roughness: .18,
      emissive: 0x4a3210, emissiveIntensity: .7,
    });

    const zones = [];
    const addZone = (i, build) => {
      const g = new THREE.Group();
      g.position.y = -i * GAP;
      build(g);
      scene.add(g); zones.push(g); return g;
    };

    const softGlow = (x, y, z, s, color, op = .8) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowT, transparent: true, blending: THREE.AdditiveBlending,
        depthWrite: false, color, opacity: op,
      }));
      sp.position.set(x, y, z); sp.scale.setScalar(s); return sp;
    };

    /* ── 0 · Antarpat: the kalash, haloed, with a hanging toran ── */
    addZone(0, (g) => {
      const k = makeKalash(gold, bright);
      k.position.set(0, -2.4, -6); k.scale.setScalar(1.7);
      g.add(k);
      g.userData.kalash = k;
      const halos = [1.5, 2.0, 2.6].map((r, i) => {
        const m = new THREE.Mesh(new THREE.TorusGeometry(r, .008, 8, 96),
          new THREE.MeshBasicMaterial({ color: 0xf9d97e, transparent: true, opacity: .32 - i * .06, depthWrite: false, blending: THREE.AdditiveBlending }));
        m.position.set(0, -1.2, -6.4); m.rotation.x = 1.15 + i * .06;
        g.add(m); return m;
      });
      g.userData.halos = halos;
      g.add(softGlow(0, -1.4, -6.6, 9, 0xffb066, .55));
      // toran swag across the top
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-7, 3.4, -8), new THREE.Vector3(0, 1.9, -8), new THREE.Vector3(7, 3.4, -8),
      ]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, .015, 6),
        new THREE.MeshBasicMaterial({ color: 0xb8891f })));
      const buds = [];
      for (let i = 0; i <= 22; i++) {
        const p = curve.getPointAt(i / 22);
        const b = softGlow(p.x, p.y - .22, p.z, .78, i % 2 ? 0xffa53d : 0xffd166, .95);
        g.add(b); buds.push(b);
      }
      g.userData.buds = buds;
    });

    /* ── 1 · Katha: a constellation, orbs joined by light ── */
    addZone(1, (g) => {
      const orbs = [];
      const pts = [];
      for (let i = 0; i < 22; i++) {
        const a = i * 2.4, r = 2 + (i % 5) * .95;
        const v = new THREE.Vector3(Math.cos(a) * r * 1.5, Math.sin(a * .7) * 4.2, -15 + Math.sin(a) * 3);
        pts.push(v);
        const s = softGlow(v.x, v.y, v.z, .5 + (i % 3) * .22,
          [0xffd166, 0xff8fb0, 0x8fe6c4][i % 3], .9);
        g.add(s); orbs.push(s);
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      g.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({
        color: 0xe8b84b, transparent: true, opacity: .12,
      })));
      g.userData.orbs = orbs;
    });

    /* ── 2 · Muhurat: six lanterns in a slow carousel ── */
    addZone(2, (g) => {
      const ring = new THREE.Group();
      const body = new THREE.CylinderGeometry(.2, .26, .5, 16);
      const capG = new THREE.ConeGeometry(.22, .16, 16);
      const capM = new THREE.MeshStandardMaterial({ color: 0x6b2410, roughness: .7, metalness: .2 });
      const tints = [0xff9b4d, 0xffd166, 0xff6f9c, 0x4fd6a8, 0xffa53d, 0xf9d97e];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const L = new THREE.Group();
        L.add(new THREE.Mesh(body, new THREE.MeshStandardMaterial({
          color: 0xd8622a, emissive: tints[i], emissiveIntensity: 1.5,
          roughness: .55, transparent: true, opacity: .96,
        })));
        const c = new THREE.Mesh(capG, capM); c.position.y = .32; L.add(c);
        L.add(softGlow(0, 0, 0, 2.1, tints[i], .75));
        L.position.set(Math.cos(a) * 4.4, Math.sin(a * 2) * .8, -14 + Math.sin(a) * 3);
        L.userData.ph = i * 1.05;
        ring.add(L);
      }
      g.add(ring); g.userData.ring = ring;
    });

    /* ── 3 · Rasta: paper-cut ridges + a glowing river ── */
    addZone(3, (g) => {
      const bands = [
        [40, 3.0, 1.1, 0x0e3328, -4.2, -26, .8],
        [34, 2.5, 2.7, 0x123f31, -4.8, -22, .72],
        [28, 2.0, 4.3, 0x17503d, -5.4, -18, .6],
      ];
      bands.forEach(([w, h, s, c, y, z, o]) => g.add(ridgeLayer(w, h, s, c, y, z, o)));
      // river: a wide flat ribbon of light, not a tube
      const riverShape = new THREE.Shape();
      riverShape.moveTo(-16, -.55); riverShape.lineTo(16, -.9);
      riverShape.lineTo(16, .9); riverShape.lineTo(-16, .55);
      const river = new THREE.Mesh(new THREE.ShapeGeometry(riverShape),
        new THREE.MeshBasicMaterial({ color: 0x2b7fb0, transparent: true, opacity: .32, depthWrite: false }));
      river.position.set(0, -5.6, -17); river.rotation.x = -.22;
      g.add(river);
      g.add(softGlow(0, -5.5, -16.6, 16, 0x3fa9e0, .18));
      // lantern boats drifting downstream — pure light, no boxes
      const boats = [];
      for (let i = 0; i < 7; i++) {
        const b = softGlow(-14 + i * 4.4, -5.35, -16.4, .9, 0xffb066, .8);
        g.add(b); boats.push(b);
      }
      g.userData.boats = boats;
    });

    /* ── 4 · Yeta ka: the mandap, rings turning under the canopy ── */
    addZone(4, (g) => {
      const m = makeMandap(gold, bright);
      m.position.set(0, -1.6, -13); m.scale.setScalar(1.0);
      g.add(m);
      const rG = new THREE.TorusGeometry(.66, .075, 20, 64);
      const r1 = new THREE.Mesh(rG, new THREE.MeshStandardMaterial({ color: 0xf0c65a, metalness: .95, roughness: .18, emissive: 0x4a3210, emissiveIntensity: .7 }));
      const r2 = new THREE.Mesh(rG, new THREE.MeshStandardMaterial({ color: 0xf2a898, metalness: .95, roughness: .2, emissive: 0x4a1a12, emissiveIntensity: .7 }));
      r1.position.x = -.38; r2.position.x = .38; r2.rotation.y = Math.PI / 2.15;
      const rings = new THREE.Group(); rings.add(r1, r2);
      rings.position.set(0, -1.0, -12); g.add(rings);
      g.add(softGlow(0, -1.0, -12.4, 6, 0xffc978, .4));
      g.userData.rings = rings;
    });

    /* ── 5 · Ashirwad: a sky of lanterns rising for good ── */
    addZone(5, (g) => {
      const n = lowPower ? 26 : 70;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(n * 3), vel = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        pos[i * 3] = (Math.random() - .5) * 30;
        pos[i * 3 + 1] = -10 + Math.random() * 22;
        pos[i * 3 + 2] = -28 + Math.random() * 22;
        vel[i] = .4 + Math.random() * .9;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({
        map: glowT, size: 1.5, transparent: true, opacity: .95,
        blending: THREE.AdditiveBlending, depthWrite: false,
        color: 0xffb877, sizeAttenuation: true,
      }));
      g.add(pts);
      g.userData.sky = { pts, pos, vel, n };
    });

    /* ── petals: warm sprites, always BEHIND the panels ── */
    const PN = lowPower ? 8 : 20;
    const petals = [];
    for (let i = 0; i < PN; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: petT, transparent: true, depthWrite: false,
        opacity: .28 + Math.random() * .22, rotation: Math.random() * 6.3,
      }));
      sp.scale.setScalar(.32 + Math.random() * .3);
      sp.position.set((Math.random() - .5) * 28, Math.random() * 24 - 12, -11 - Math.random() * 13);
      sp.userData = { s: .5 + Math.random() * .8, ph: Math.random() * 6.3, vr: (Math.random() - .5) * .5 };
      scene.add(sp); petals.push(sp);
    }

    const resize = () => {
      const w = host.clientWidth || 1, h = host.clientHeight || 1;
      R.setSize(w, h, false);
      cam.aspect = w / h;
      cam.fov = w / h < .7 ? 58 : w / h < 1 ? 52 : 46;
      cam.updateProjectionMatrix();
      if (reduced) R.render(scene, cam);
    };
    let lastW = 0, lastH = 0;
    const onResize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      // ignore the small height changes a mobile address bar causes
      if (w === lastW && Math.abs(h - lastH) < 120) return;
      lastW = w; lastH = h; resize();
    };
    const ro = new ResizeObserver(onResize); ro.observe(host); resize();
    lastW = host.clientWidth; lastH = host.clientHeight;

    let tx = 0, ty = 0;
    const onMove = (e) => { tx = e.clientX / window.innerWidth - .5; ty = e.clientY / window.innerHeight - .5; };
    const onTilt = (e) => {
      if (e.gamma == null) return;
      tx = Math.max(-.6, Math.min(.6, e.gamma / 50));
      ty = Math.max(-.6, Math.min(.6, (e.beta - 45) / 70));
    };
    if (!reduced && !coarse) window.addEventListener("pointermove", onMove, { passive: true });
    if (!reduced && coarse) window.addEventListener("deviceorientation", onTilt, { passive: true });

    const PAL = {
      night: { top: 0x080b1e, bot: 0x2a1330, glow: 0x7c1f38, fog: 0x0a0e24, hemi: .75 },
      day:   { top: 0xdfe9f5, bot: 0xf6dcc0, glow: 0xf3b98a, fog: 0xe9e0cf, hemi: 1.15 },
      party: { top: 0x14042e, bot: 0x3d0b4a, glow: 0xff2e88, fog: 0x16062c, hemi: .9 },
    };

    const clock = new THREE.Clock();
    let raf = 0, alive = true, camY = 0;
    const step = () => {
      const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
      const p = pRef.current || 0, pt = partyRef.current, sp = pt ? 2.2 : 1;
      sky.material.uniforms.uT.value = t * sp;

      /* the flight — eased, with a gentle drift so it never feels like
         an elevator, and always framed well back from the geometry */
      const targetY = -p * DEPTH;
      camY += (targetY - camY) * .075;
      cam.position.set(Math.sin(p * Math.PI * 2.4) * 1.4 + tx * 1.1,
                       camY + .6 - ty * .7,
                       7.2);
      cam.lookAt(Math.sin(p * Math.PI * 2.4) * .5, camY - .5, -8);

      const z0 = zones[0].userData;
      z0.kalash.rotation.y = t * .22 * sp;
      z0.halos.forEach((h, i) => { h.rotation.z = t * (.14 + i * .07) * (i % 2 ? -1 : 1) * sp; });
      z0.buds.forEach((b, i) => {
        b.material.opacity = .78 + Math.sin(t * 2 + i * .5) * .2;
        b.position.y += Math.sin(t * 1.4 + i) * .0012;
      });

      zones[1].userData.orbs.forEach((o, i) => {
        o.material.opacity = .5 + Math.sin(t * 1.6 + i) * .35;
        o.position.y += Math.sin(t * .7 + i) * .0018;
      });
      zones[1].rotation.y = Math.sin(t * .07) * .16;

      zones[2].userData.ring.rotation.y = t * .16 * sp;
      zones[2].userData.ring.children.forEach((L) => {
        L.position.y += Math.sin(t * 1.2 + L.userData.ph) * .0035;
      });

      zones[3].userData.boats.forEach((b, i) => {
        b.position.x += (.55 + i * .04) * dt * sp;
        if (b.position.x > 16) b.position.x = -16;
        b.material.opacity = .75 + Math.sin(t * 3 + i) * .25;
      });

      zones[4].userData.rings.rotation.y = t * .55 * sp;
      zones[4].userData.rings.rotation.x = Math.sin(t * .6) * .22;

      const S = zones[5].userData.sky;
      for (let i = 0; i < S.n; i++) {
        S.pos[i * 3 + 1] += S.vel[i] * dt * sp;
        if (S.pos[i * 3 + 1] > 14) S.pos[i * 3 + 1] = -12;
      }
      S.pts.geometry.attributes.position.needsUpdate = true;

      petals.forEach((q) => {
        const d = q.userData;
        q.position.y -= d.s * dt * sp;
        q.position.x += Math.sin(t * .6 + d.ph) * .006;
        q.material.rotation += d.vr * dt;
        if (q.position.y < camY - 13) {
          q.position.y = camY + 13;
          q.position.x = (Math.random() - .5) * 26;
        }
      });

      if (pt) {
        const beat = Math.pow(Math.abs(Math.sin(t * 3.1)), 8);
        hemi.intensity = .9 + beat * 1.1;
        key.intensity = 1.35 + beat * .9;
      }
      R.render(scene, cam);
    };
    const minDt = lowPower ? 1000 / 30 : 1000 / 60;   // cap the frame rate
    let lastFrame = 0;
    const loop = (t) => {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (t - lastFrame < minDt) return;
      lastFrame = t;
      step();
    };
    if (reduced) step(); else raf = requestAnimationFrame(loop);

    apiRef.current = {
      apply(theme, party) {
        const c = party ? PAL.party : theme === "day" ? PAL.day : PAL.night;
        const u = sky.material.uniforms;
        u.uTop.value.set(c.top); u.uBot.value.set(c.bot); u.uGlow.value.set(c.glow);
        scene.fog.color.set(c.fog);
        hemi.intensity = c.hemi;
        if (reduced) R.render(scene, cam);
      },
    };

    return () => {
      alive = false; cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material])
          .forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
      });
      glowT.dispose(); petT.dispose(); R.dispose();
      if (R.domElement.parentNode) R.domElement.parentNode.removeChild(R.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useEffect(() => { apiRef.current?.apply(theme, party); }, [theme, party]);

  if (!ok) return null;
  return <div ref={hostRef} className="stage3d" aria-hidden="true" />;
}
