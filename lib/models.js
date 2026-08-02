/* ═══════════════════════════════════════════════════════════════════
   REAL 3D ASSET SLOT
   ───────────────────────────────────────────────────────────────────
   The shipped scene is procedural (authored in code) so the invite has
   zero asset dependencies and zero licences to clear. If you'd rather
   drop in real miniature models — which will look richer than anything
   generated in code — this is the hook. Nothing else has to change.

   WHERE TO GET THEM (all free for commercial use, no attribution
   required unless noted):

     • Poly Haven          polyhaven.com          CC0 — HDRIs, models
       The single biggest upgrade: one 1K HDRI as scene.environment
       makes the brass and rings actually reflect their surroundings.
     • Quaternius          quaternius.com         CC0 — stylised packs
     • Kenney              kenney.nl/assets       CC0 — low-poly kits
     • ambientCG           ambientcg.com          CC0 — PBR textures
     • Sketchfab           sketchfab.com          filter to CC0 / CC-BY
       (CC-BY requires a visible credit — put it in the footer.)

   Search terms that pay off here: "lantern", "diya", "oil lamp",
   "marigold", "temple", "pavilion", "rickshaw", "brass pot".

   PREPARING A MODEL
     1. Export/convert to .glb (binary — one file, smaller).
     2. Compress:  npx gltf-transform optimize in.glb out.glb --texture-compress webp
        Target under ~300 KB per prop; the whole scene under ~1.5 MB.
     3. Drop it in  public/models/  and load it below.

   USAGE inside Stage3D's useEffect:

     import { loadModel, loadEnvironment } from "@/lib/models";

     loadModel("/models/lantern.glb").then((gltf) => {
       const lantern = gltf.scene;
       lantern.scale.setScalar(0.4);
       lantern.position.set(0, -1, -7);
       zone.add(lantern);
     });

     loadEnvironment(renderer, "/hdri/studio_1k.hdr").then((env) => {
       scene.environment = env;   // instant reflections on all metals
     });

   Both resolve after the frame loop has started, so models simply pop
   in when ready — the scene never blocks on them.
   ═══════════════════════════════════════════════════════════════════ */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

let gltfLoader = null;

function getLoader() {
  if (gltfLoader) return gltfLoader;
  gltfLoader = new GLTFLoader();
  // Draco is only fetched if a model actually uses it
  const draco = new DRACOLoader();
  draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
  gltfLoader.setDRACOLoader(draco);
  return gltfLoader;
}

const cache = new Map();

/** Load a .glb/.gltf once and reuse it. Returns the gltf object. */
export function loadModel(url) {
  if (cache.has(url)) return cache.get(url);
  const p = new Promise((resolve, reject) => {
    getLoader().load(url, resolve, undefined, reject);
  });
  cache.set(url, p);
  return p;
}

/** Clone a loaded model so one file can be placed many times. */
export async function instance(url, { scale = 1, position = [0, 0, 0] } = {}) {
  const gltf = await loadModel(url);
  const obj = gltf.scene.clone(true);
  obj.scale.setScalar(scale);
  obj.position.set(...position);
  return obj;
}

/** Load an .hdr and turn it into a PMREM environment map. */
export function loadEnvironment(renderer, url) {
  return new Promise((resolve, reject) => {
    new RGBELoader().load(url, (tex) => {
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const env = pmrem.fromEquirectangular(tex).texture;
      tex.dispose(); pmrem.dispose();
      resolve(env);
    }, undefined, reject);
  });
}
