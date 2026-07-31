"use client";

import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

/* ── 3D layer · Three.js r128 (MIT) — everything below is procedural
      geometry + shaders authored in code: zero external models or
      textures, zero asset licences. ── */

function makeGlowTex(inner = "255,214,140", mid = "255,170,80") {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d");
  const rg = g.createRadialGradient(32, 32, 2, 32, 32, 31);
  rg.addColorStop(0, `rgba(${inner},0.95)`);
  rg.addColorStop(0.4, `rgba(${mid},0.45)`);
  rg.addColorStop(1, `rgba(${mid},0)`);
  g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/* Animated jewel-tone "silk nebula" backdrop — a single quad running a
   tiny 2-octave value-noise fragment shader. */
const NEBULA_VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const NEBULA_FRAG = `
precision mediump float; varying vec2 vUv;
uniform float uT; uniform float uAmp; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(h(i),h(i+vec2(1.0,0.0)),f.x), mix(h(i+vec2(0.0,1.0)),h(i+vec2(1.0,1.0)),f.x), f.y); }
void main(){
  float t=uT*0.045;
  float m = n(vUv*3.0+vec2(t,-t))*0.62 + n(vUv*7.0-vec2(t*1.4))*0.38;
  vec3 col = mix(uA, uB, smoothstep(0.18, 0.82, m));
  col = mix(col, uC, pow(n(vUv*2.0+vec2(t*1.7)), 3.0)*0.55);
  float vig = smoothstep(1.0, 0.22, distance(vUv, vec2(0.5)));
  gl_FragColor = vec4(col, m*vig*uAmp);
}`;

/* Brass kalash — lathe profile, coconut, mango-leaf fan, neck band. */
function buildKalash(gold, goldBright) {
  const grp = new THREE.Group();
  const prof = [
    [0.02, 0], [0.5, 0.03], [0.68, 0.2], [0.74, 0.46], [0.66, 0.7],
    [0.44, 0.86], [0.3, 0.94], [0.27, 1.05], [0.4, 1.12], [0.44, 1.18], [0.31, 1.22],
  ].map((p) => new THREE.Vector2(p[0], p[1]));
  grp.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 48), gold));
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.024, 12, 40), goldBright);
  band.rotation.x = Math.PI / 2; band.position.y = 0.99; grp.add(band);
  const coco = new THREE.Mesh(
    new THREE.SphereGeometry(0.235, 24, 18),
    new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 0.95 }));
  coco.scale.set(1, 1.14, 1); coco.position.y = 1.36; grp.add(coco);
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.1, 0.18, 0, 0.46);
  leafShape.quadraticCurveTo(-0.1, 0.18, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(leafShape);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f8f66, roughness: 0.55, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) {
    const pivot = new THREE.Group(); pivot.rotation.y = (i / 6) * Math.PI * 2;
    const lf = new THREE.Mesh(leafGeo, leafMat);
    lf.position.set(0.27, 1.13, 0); lf.rotation.set(0, Math.PI / 2, -1.05);
    pivot.add(lf); grp.add(pivot);
  }
  return grp;
}

/* Marigold toran — two catenary garland strands of instanced pompoms
   with leaf pairs, strung across the top of the hero. */
function buildToran(scene, small) {
  const per = small ? 11 : 15;
  const strands = [];
  const flowerGeo = new THREE.SphereGeometry(0.115, 10, 8);
  const mOrange = new THREE.MeshStandardMaterial({ color: 0xf07f1f, roughness: 0.75 });
  const mYellow = new THREE.MeshStandardMaterial({ color: 0xf5c331, roughness: 0.75 });
  const leafGeo = new THREE.ConeGeometry(0.05, 0.16, 6);
  const mLeaf = new THREE.MeshStandardMaterial({ color: 0x1f8f66, roughness: 0.6 });
  const dummy = new THREE.Object3D();
  [[3.05, 0.62, -1.6], [2.78, 0.5, -2.3]].forEach(([yEnd, sag, z], s) => {
    const grp = new THREE.Group();
    const pts = [];
    for (let i = 0; i < per; i++) {
      const u = i / (per - 1), x = (u - 0.5) * 8.6;
      pts.push(new THREE.Vector3(x, yEnd - sag * Math.sin(Math.PI * u), z));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    grp.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.012, 6),
      new THREE.MeshStandardMaterial({ color: 0x8a6b1e, roughness: 0.7 })));
    const instA = new THREE.InstancedMesh(flowerGeo, mOrange, Math.ceil(per / 2));
    const instB = new THREE.InstancedMesh(flowerGeo, mYellow, Math.floor(per / 2));
    const leaves = new THREE.InstancedMesh(leafGeo, mLeaf, per - 1);
    let a = 0, b = 0;
    pts.forEach((p, i) => {
      dummy.position.copy(p); dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.9 + ((i * 37) % 10) / 40);
      dummy.updateMatrix();
      if (i % 2 === 0) instA.setMatrixAt(a++, dummy.matrix); else instB.setMatrixAt(b++, dummy.matrix);
      if (i < per - 1) {
        dummy.position.lerpVectors(p, pts[i + 1], 0.5); dummy.position.y -= 0.05;
        dummy.rotation.set(Math.PI, 0, (i % 2 ? 0.5 : -0.5)); dummy.updateMatrix();
        leaves.setMatrixAt(i, dummy.matrix);
      }
    });
    [instA, instB, leaves].forEach((m) => { m.frustumCulled = false; grp.add(m); });
    grp.userData.ph = s * 1.7;
    scene.add(grp); strands.push(grp);
  });
  return strands;
}

/* Akash-kandil sky lanterns — emissive paper cylinders that rise & wrap. */
function buildLanterns(scene, glowTex, small) {
  const n = small ? 4 : 6;
  const bodyGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.34, 10);
  const capGeo = new THREE.ConeGeometry(0.16, 0.1, 10);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x8a2d12, emissive: 0xff7b2d, emissiveIntensity: 1.35, roughness: 0.6,
  });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x5a1c0c, roughness: 0.8 });
  return Array.from({ length: n }, (_, i) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(bodyGeo, mat));
    const cap = new THREE.Mesh(capGeo, capMat); cap.position.y = 0.22; g.add(cap);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.75 }));
    sp.scale.setScalar(1.1); g.add(sp);
    const side = i % 2 ? 1 : -1;
    g.position.set(side * (2.7 + Math.random() * 1.4), -3 + Math.random() * 6, -2.2 - Math.random() * 2);
    g.userData = { sp: 0.1 + Math.random() * 0.1, ph: Math.random() * 6.28, x0: g.position.x };
    scene.add(g); return g;
  });
}

/* Hero scene: nebula shader sky, kalash + chakra halo, floating diyas with
   flickering lights, toran garlands, rising lanterns, instanced petals,
   embers & haldi dust — theme-aware, scroll- and pointer-linked. */
export default function Scene3D({ heroP, theme, reduced }) {
  const hostRef = useRef(null);
  const pRef = useRef(heroP); pRef.current = heroP;
  const [ok, setOk] = useState(true);
  const apiRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current; if (!host) return;
    let R;
    try {
      R = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) { setOk(false); return; }
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    R.outputEncoding = THREE.sRGBEncoding;
    R.toneMapping = THREE.ACESFilmicToneMapping;
    R.toneMappingExposure = 1.12;
    R.setClearColor(0x000000, 0);
    host.appendChild(R.domElement);
    R.domElement.style.width = "100%"; R.domElement.style.height = "100%"; R.domElement.style.display = "block";

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e24, 0.05);
    const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    cam.position.set(0, 0.2, 7.2);

    const amb = new THREE.AmbientLight(0xffe9c4, 0.55);
    const key = new THREE.DirectionalLight(0xffd98a, 1.15); key.position.set(3.5, 5, 4);
    const rim = new THREE.DirectionalLight(0x8fb7ff, 0.5); rim.position.set(-4, 2, -3);
    scene.add(amb, key, rim);

    // nebula backdrop
    const nebula = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 15),
      new THREE.ShaderMaterial({
        vertexShader: NEBULA_VERT, fragmentShader: NEBULA_FRAG,
        transparent: true, depthWrite: false,
        uniforms: {
          uT: { value: 0 }, uAmp: { value: 0.55 },
          uA: { value: new THREE.Color(0x131938) },
          uB: { value: new THREE.Color(0x7c1f38) },
          uC: { value: new THREE.Color(0x1f8f66) },
        },
      }));
    nebula.position.set(0, 0.4, -7); scene.add(nebula);

    const gold = new THREE.MeshStandardMaterial({ color: 0xdfa93c, metalness: 0.88, roughness: 0.32, emissive: 0x2a1a05, emissiveIntensity: 0.6 });
    const goldBright = new THREE.MeshStandardMaterial({ color: 0xf3ca63, metalness: 0.9, roughness: 0.24, emissive: 0x33220a, emissiveIntensity: 0.7 });

    const kalash = buildKalash(gold, goldBright);
    kalash.position.set(0, -2.55, 0); kalash.scale.setScalar(1.35);
    scene.add(kalash);

    const glowTex = makeGlowTex();
    // chakra halo behind the kalash + soft aura
    const haloMat = () => new THREE.MeshBasicMaterial({ color: 0xf3ca63, transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending, depthWrite: false });
    const halos = [1.15, 1.5, 1.9].map((r, i) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 90), haloMat());
      m.position.set(0, -0.85, -0.8); m.rotation.x = 0.35 + i * 0.12;
      scene.add(m); return m;
    });
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5 }));
    aura.scale.setScalar(4.6); aura.position.set(0, -1.1, -1); scene.add(aura);

    // floating diyas
    const bowlGeo = new THREE.LatheGeometry(
      [[0.02, 0], [0.2, 0.02], [0.27, 0.09], [0.24, 0.13], [0.185, 0.14]].map((p) => new THREE.Vector2(p[0], p[1])), 28);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0xb0562e, roughness: 0.9, emissive: 0x30100a, emissiveIntensity: 0.5 });
    const flameGeo = new THREE.SphereGeometry(0.07, 10, 10);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffd88a });
    const diyaPos = [[-2.9, 0.35, -0.6], [2.9, 0.05, -0.4], [-2.15, -1.55, 0.6], [2.3, -1.35, 0.5], [-3.35, -0.7, -1.3], [3.4, 0.9, -1.5]];
    const diyas = diyaPos.map((pos, i) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(bowlGeo, bowlMat));
      const fl = new THREE.Mesh(flameGeo, flameMat);
      fl.scale.set(1, 1.7, 1); fl.position.y = 0.2; g.add(fl);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.9 }));
      sp.scale.setScalar(0.85); sp.position.y = 0.22; g.add(sp);
      let light = null;
      if (i < 4) { light = new THREE.PointLight(0xff9b4d, 0.85, 7, 2); light.position.y = 0.25; g.add(light); }
      g.position.set(pos[0], pos[1], pos[2]);
      scene.add(g);
      return { g, fl, sp, light, baseY: pos[1], ph: Math.random() * Math.PI * 2 };
    });

    const small = window.innerWidth < 640;
    const toran = buildToran(scene, small);
    const lanterns = buildLanterns(scene, glowTex, small);

    // instanced 3D petals
    const N = small ? 55 : 105;
    const petalGeo = new THREE.CircleGeometry(0.11, 10); petalGeo.scale(1, 0.42, 1);
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xf59a2b, roughness: 0.8, side: THREE.DoubleSide });
    const inst = new THREE.InstancedMesh(petalGeo, petalMat, N);
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    inst.frustumCulled = false;
    scene.add(inst);
    const petals = Array.from({ length: N }, () => ({
      x: (Math.random() - 0.5) * 8.4, y: Math.random() * 7 - 3.2, z: -2.4 + Math.random() * 3.6,
      sp: 0.22 + Math.random() * 0.35, ph: Math.random() * Math.PI * 2,
      rx: (Math.random() - 0.5) * 1.6, ry: (Math.random() - 0.5) * 1.6, rz: (Math.random() - 0.5) * 1.6,
    }));
    const dummy = new THREE.Object3D();

    // rising embers
    const en = small ? 40 : 70;
    const eGeo = new THREE.BufferGeometry();
    const ePos = new Float32Array(en * 3); const eVel = new Float32Array(en);
    for (let i = 0; i < en; i++) {
      ePos[i * 3] = (Math.random() - 0.5) * 7; ePos[i * 3 + 1] = -3 + Math.random() * 4; ePos[i * 3 + 2] = -1.5 + Math.random() * 2.5;
      eVel[i] = 0.25 + Math.random() * 0.45;
    }
    eGeo.setAttribute("position", new THREE.BufferAttribute(ePos, 3));
    const embers = new THREE.Points(eGeo, new THREE.PointsMaterial({ color: 0xffb066, size: 0.05, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(embers);

    // haldi dust
    const dn = small ? 90 : 150; const dGeo = new THREE.BufferGeometry();
    const dp = new Float32Array(dn * 3);
    for (let i = 0; i < dn; i++) { dp[i * 3] = (Math.random() - 0.5) * 9; dp[i * 3 + 1] = Math.random() * 7 - 3; dp[i * 3 + 2] = -3 + Math.random() * 4; }
    dGeo.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ color: 0xffe2a1, size: 0.035, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(dust);

    const resize = () => {
      const w = host.clientWidth || 1, h = host.clientHeight || 1;
      R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
      if (reduced) R.render(scene, cam);
    };
    const ro = new ResizeObserver(resize); ro.observe(host); resize();

    let tx = 0, ty = 0;
    const onMove = (e) => { tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5; };
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.02 });
    io.observe(host);

    const clock = new THREE.Clock();
    let raf = 0, alive = true;
    const step = () => {
      const dt = Math.min(clock.getDelta(), 0.05); const t = clock.elapsedTime;
      nebula.material.uniforms.uT.value = t;
      kalash.rotation.y = t * 0.28;
      halos.forEach((h, i) => { h.rotation.z = t * (0.18 + i * 0.09) * (i % 2 ? -1 : 1); h.rotation.x = 0.35 + i * 0.12 + Math.sin(t * 0.4 + i) * 0.08; });
      aura.material.opacity = 0.42 + Math.sin(t * 1.6) * 0.1;
      toran.forEach((g) => { g.rotation.z = Math.sin(t * 0.5 + g.userData.ph) * 0.02; g.position.y = Math.sin(t * 0.7 + g.userData.ph) * 0.05; });
      lanterns.forEach((L) => {
        L.position.y += L.userData.sp * dt;
        L.position.x = L.userData.x0 + Math.sin(t * 0.5 + L.userData.ph) * 0.25;
        L.rotation.z = Math.sin(t * 0.6 + L.userData.ph) * 0.08;
        if (L.position.y > 4.4) L.position.y = -3.6;
      });
      diyas.forEach((d, i) => {
        d.g.position.y = d.baseY + Math.sin(t * 0.9 + d.ph) * 0.16;
        d.g.rotation.z = Math.sin(t * 0.6 + d.ph) * 0.06;
        const fk = 0.86 + Math.sin(t * 11 + d.ph * 3) * 0.1 + Math.sin(t * 23 + i) * 0.05;
        d.fl.scale.y = 1.7 * fk; d.sp.material.opacity = 0.62 + fk * 0.3;
        if (d.light) d.light.intensity = 0.7 + fk * 0.35;
      });
      petals.forEach((p, i) => {
        p.y -= p.sp * dt; if (p.y < -3.4) { p.y = 3.9; p.x = (Math.random() - 0.5) * 8.4; }
        dummy.position.set(p.x + Math.sin(t * 0.7 + p.ph) * 0.4, p.y, p.z);
        dummy.rotation.set(t * p.rx + p.ph, t * p.ry, t * p.rz);
        dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
      });
      inst.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < en; i++) {
        ePos[i * 3 + 1] += eVel[i] * dt;
        if (ePos[i * 3 + 1] > 3.8) { ePos[i * 3 + 1] = -3.2; ePos[i * 3] = (Math.random() - 0.5) * 7; }
      }
      eGeo.attributes.position.needsUpdate = true;
      embers.material.opacity = 0.55 + Math.sin(t * 3.1) * 0.2;
      dust.rotation.y = t * 0.02;
      cam.position.x = THREE.MathUtils.lerp(cam.position.x, tx * 0.55, 0.04);
      cam.position.y = THREE.MathUtils.lerp(cam.position.y, 0.25 - pRef.current * 0.55 - ty * 0.3, 0.05);
      cam.lookAt(0, -0.2, 0);
      R.render(scene, cam);
    };
    const loop = () => { if (!alive) return; if (visible && !document.hidden) step(); raf = requestAnimationFrame(loop); };
    if (reduced) { step(); } else { raf = requestAnimationFrame(loop); }

    apiRef.current = {
      scene, amb, nebula,
      renderOnce: () => R.render(scene, cam),
    };

    return () => {
      alive = false; cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onMove);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { const m = Array.isArray(o.material) ? o.material : [o.material]; m.forEach((x) => { if (x.map) x.map.dispose(); x.dispose(); }); }
      });
      glowTex.dispose(); R.dispose();
      if (R.domElement.parentNode) R.domElement.parentNode.removeChild(R.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useEffect(() => {
    const a = apiRef.current; if (!a) return;
    const day = theme === "day";
    a.scene.fog.color.set(day ? 0xf8f0dd : 0x0a0e24);
    a.amb.intensity = day ? 0.85 : 0.55;
    const u = a.nebula.material.uniforms;
    u.uAmp.value = day ? 0.35 : 0.55;
    u.uA.value.set(day ? 0xf3e6c8 : 0x131938);
    u.uB.value.set(day ? 0xf2c9a0 : 0x7c1f38);
    u.uC.value.set(day ? 0xbfe3d2 : 0x1f8f66);
    if (reduced) a.renderOnce();
  }, [theme, reduced]);

  if (!ok) return null;
  return <div ref={hostRef} aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }} />;
}

/* Two interlocked wedding rings — gold & rose-gold tori, RSVP confirmation. */
