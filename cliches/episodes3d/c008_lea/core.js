// core.js — renderer, post-processing, materials, procedural textures, sky & moods, static baking.
// Repère : 1 unité ≈ 1 bloc. Un avatar mesure ~5,4 de haut. Sol en y = 0. Les avatars regardent vers +z.
import * as THREE from 'three';
import { RoundedBoxGeometry } from '/node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from '/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
import { EffectComposer } from '/node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from '/node_modules/three/examples/jsm/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from '/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from '/node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from '/node_modules/three/examples/jsm/postprocessing/OutputPass.js';
export { THREE, RoundedBoxGeometry };

export const W = 1080, H = 1920;
// TikTok safe zone (1080x1920): top 0-250 search bar; bottom 1500-1920 caption/username; right x 940-1080 between y 700-1500 buttons.
export const SAFE = { x0: 60, x1: 920, y0: 260, y1: 1480 };
const Q = new URLSearchParams(location.search);
export const FAST = Q.has('fast');            // ?fast : no AO/bloom (quick previews)

// ---------- renderer ----------
const wrap = document.getElementById('wrap');
export const R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
R.setPixelRatio(1); R.setSize(innerWidth, innerHeight);
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.AgXToneMapping; R.toneMappingExposure = 1.0;
wrap.prepend(R.domElement);
export const scene = new THREE.Scene();
export const cam = new THREE.PerspectiveCamera(55, W / H, 0.1, 900);
export const STATIC = new THREE.Group(); scene.add(STATIC);   // everything that never moves goes here, merged at start()

// ---------- post ----------
let composer = null, aoPass = null, bloom = null, grade = null;
function setupPost() {
  const w = innerWidth, h = innerHeight;
  composer = new EffectComposer(R); composer.setPixelRatio(1); composer.setSize(w, h);
  composer.addPass(new RenderPass(scene, cam));
  if (!FAST) {
    aoPass = new GTAOPass(scene, cam, Math.round(w / 2), Math.round(h / 2));
    aoPass.updateGtaoMaterial({ radius: 0.9, distanceExponent: 1.4, thickness: 1.2, scale: 1.15, samples: 12, screenSpaceRadius: false });
    aoPass.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
    aoPass.blendIntensity = 0.85; composer.addPass(aoPass);
    bloom = new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), 0.35, 0.5, 0.92); composer.addPass(bloom);
  }
  grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, vig: { value: .32 }, warm: { value: 0 }, sat: { value: 1.08 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float vig, warm, sat; varying vec2 vUv;
      void main(){ vec4 c=texture2D(tDiffuse,vUv); float l=dot(c.rgb,vec3(.299,.587,.114)); c.rgb=mix(vec3(l),c.rgb,sat);
        c.rgb*=vec3(1.+warm*.06,1.,1.-warm*.06); vec2 d=vUv-.5; d.x*=.62; c.rgb*=1.-vig*smoothstep(.25,.75,length(d)*1.35); gl_FragColor=c; }` });
  composer.addPass(grade); composer.addPass(new OutputPass());
}

// ---------- seeded random ----------
export function rng(seed = 1) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const pick = (r, a) => a[Math.floor(r() * a.length)];

// ---------- palette ----------
export const P = {
  skin: 0xF5D0A9, skin2: 0xE2B48A, skin3: 0xB27A4E, skin4: 0x7A4E32, yellow: 0xF5CD30, blue: 0x2457C9, green: 0x4B974B, red: 0xC4281C,
  white: 0xF2F3F3, black: 0x22272E, grey: 0xA3A2A5, navy: 0x203A6B, pink: 0xE8A6C9, purple: 0x8E6CC2, orange: 0xDA8541, teal: 0x2FA89A,
  tan: 0xD7C59A, brown: 0x6E4A2E, olive: 0x7A8A3A, sky: 0x8FC7F0, grass: 0x5FA450, road: 0x3B3F47, sand: 0xE8D5A0, lilac: 0xB9A2D8, mint: 0x9ED9B0, coral: 0xF07A6A,
};

// ---------- procedural textures ----------
const texCache = {};
function canvasTex(key, size, draw, rep = true) {
  if (texCache[key]) return texCache[key];
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'); draw(g, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; texCache[key] = t; return t;
}
const speck = (g, s, n, cols, r0 = 1, r1 = 3, rnd = rng(7)) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[Math.floor(rnd() * cols.length)]; const r = r0 + rnd() * (r1 - r0); g.fillRect(rnd() * s, rnd() * s, r, r); } };
export const TEX = {
  grass: () => canvasTex('grass', 256, (g, s) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, s, s); speck(g, s, 2600, ['#e9f3e2', '#d5e8cc', '#f6fbf3', '#c9dfbf'], 1, 3); }),
  asphalt: () => canvasTex('asphalt', 256, (g, s) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, s, s); speck(g, s, 3500, ['#e6e6e6', '#d4d4d4', '#f4f4f4', '#c8c8c8'], 1, 2); }),
  concrete: () => canvasTex('concrete', 256, (g, s) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, s, s); speck(g, s, 1500, ['#eeeeee', '#e2e2e2'], 1, 3); g.strokeStyle = '#c9c9c9'; g.lineWidth = 4; g.strokeRect(0, 0, s, s); }),
  wood: () => canvasTex('wood', 256, (g, s) => { const r = rng(3); for (let i = 0; i < 8; i++) { const v = 225 + Math.floor(r() * 30); g.fillStyle = `rgb(${v},${v - 8},${v - 18})`; g.fillRect(0, i * 32, s, 32); g.fillStyle = 'rgba(80,50,20,.25)'; g.fillRect(0, i * 32, s, 2); g.fillRect(Math.floor(r() * s), i * 32, 2, 32); } }),
  siding: () => canvasTex('siding', 128, (g, s) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, s, s); for (let i = 0; i < 8; i++) { const gr = g.createLinearGradient(0, i * 16, 0, i * 16 + 16); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#dcdcdc'); g.fillStyle = gr; g.fillRect(0, i * 16, s, 16); g.fillStyle = '#bdbdbd'; g.fillRect(0, i * 16 + 15, s, 1.5); } }),
  brick: () => canvasTex('brick', 256, (g, s) => { g.fillStyle = '#e8e3dc'; g.fillRect(0, 0, s, s); const r = rng(11); for (let y = 0; y < 16; y++) for (let x = -1; x < 5; x++) { const v = 215 + Math.floor(r() * 40); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x * 64 + (y % 2) * 32 + 2, y * 16 + 2, 60, 12); } }),
  carpet: () => canvasTex('carpet', 128, (g, s) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, s, s); speck(g, s, 1800, ['#f0f0f0', '#e4e4e4'], 1, 2); }),
  tiles: () => canvasTex('tiles', 256, (g, s) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, s, s); g.strokeStyle = '#d0d0d0'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, s); g.moveTo(0, i * 64); g.lineTo(s, i * 64); g.stroke(); } }),
  glow: () => canvasTex('glow', 128, (g, s) => { const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, s, s); }, false),
  blob: () => canvasTex('blob', 128, (g, s) => { const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, s, s); }, false),
};

// ---------- materials ----------
const mats = new Map();
export function mat(c, o = {}) {
  const k = [c, o.r ?? .8, o.e || 0, o.ei || 0, o.map || '', o.t || 0, o.m || 0, o.flat ? 1 : 0].join('|');
  if (!o.fresh && mats.has(k)) return mats.get(k);
  const m = new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? .8, metalness: o.m || 0, emissive: o.e || 0, emissiveIntensity: o.ei ?? 1, flatShading: !!o.flat });
  if (o.map) m.map = TEX[o.map]();
  if (o.t) { m.transparent = true; m.opacity = o.t; }
  mats.set(k, m); return m;
}
// window glass and lamp bulbs switch with the mood (lit at dusk / night / indoors)
export const GLASS = new THREE.MeshStandardMaterial({ color: 0x2c3e5c, roughness: .15, metalness: .3, emissive: 0xffc27a, emissiveIntensity: 0 });
export const BULB = new THREE.MeshStandardMaterial({ color: 0xfff3d6, roughness: .4, emissive: 0xffe1a8, emissiveIntensity: .2 });
export const SCREEN = new THREE.MeshStandardMaterial({ color: 0x0a0f18, roughness: .3, emissive: 0x6fb6ff, emissiveIntensity: .9 });
export const BOUNDS = []; // interior rooms: the camera is kept inside them
export const VIEWS = []; // interior window views (dimmed when dark)
const GLOWS = []; // ground light pools + halos, visible when dark

// scale a BoxGeometry's uvs so a repeating texture keeps its world size (tile = world units per texture repeat)
function boxUV(g, w, h, d, tile) {
  const uv = g.attributes.uv; const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const j = f * 4 + i; uv.setXY(j, uv.getX(j) * dims[f][0] / tile, uv.getY(j) * dims[f][1] / tile); }
  uv.needsUpdate = true; return g;
}
// box(parent, w,h,d, color|material, x,y,z, {round, map, tile, ry, rx, rz, cast, e, ei, r})
export function box(parent, w, h, d, c, x, y, z, o = {}) {
  let g; if (o.round) g = new RoundedBoxGeometry(w, h, d, o.seg || 3, Math.min(w, h, d) * (o.round === true ? .12 : o.round)); else { g = new THREE.BoxGeometry(w, h, d); if (o.map) boxUV(g, w, h, d, o.tile || 4); }
  const m = new THREE.Mesh(g, c && c.isMaterial ? c : mat(c, o));
  m.position.set(x, y, z); m.castShadow = o.cast ?? true; m.receiveShadow = true;
  if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz; (parent || STATIC).add(m); return m;
}
export function cyl(parent, rt, rb, h, c, x, y, z, o = {}) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, o.seg || 16), c && c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = o.cast ?? true; m.receiveShadow = true; if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz; if (o.ry) m.rotation.y = o.ry; (parent || STATIC).add(m); return m; }
export function ball(parent, r, c, x, y, z, o = {}) { const m = new THREE.Mesh(o.ico ? new THREE.IcosahedronGeometry(r, o.ico) : new THREE.SphereGeometry(r, o.seg || 20, Math.round((o.seg || 20) * .7)), c && c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = o.cast ?? true; m.receiveShadow = true; if (o.sy) m.scale.y = o.sy; (parent || STATIC).add(m); return m; }
export function plane(parent, w, d, c, x, y, z, o = {}) { const g = new THREE.PlaneGeometry(w, d); if (o.map) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / (o.tile || 4), uv.getY(i) * d / (o.tile || 4)); }
  const m = new THREE.Mesh(g, c && c.isMaterial ? c : mat(c, o)); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; m.castShadow = false; (parent || STATIC).add(m); return m; }
export function glow(x, y, z, size = 8, color = 0xffd9a0, o = {}) { // light pool on the ground (o.halo: floating halo sprite instead)
  const m = o.halo ? new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.glow(), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: o.op ?? .7 }))
    : new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: TEX.glow(), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: o.op ?? .55 }));
  if (o.halo) m.scale.set(size, size, 1); else m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.userData.dyn = true; m.renderOrder = 2; scene.add(m); GLOWS.push(m); return m; }
export function blobShadow(parent, r = 1.6) { const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: TEX.blob(), transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = .03; m.renderOrder = 1; parent.add(m); return m; }

// canvas textures for signs, screens, prints
export function textTex(lines, o = {}) {
  const c = document.createElement('canvas'); c.width = o.w || 512; c.height = o.h || 256; const g = c.getContext('2d');
  if (o.bg !== 'none') { g.fillStyle = o.bg || '#ffffff'; g.fillRect(0, 0, c.width, c.height); }
  if (o.draw) o.draw(g, c.width, c.height);
  if (o.border) { g.strokeStyle = o.border; g.lineWidth = 14; g.strokeRect(7, 7, c.width - 14, c.height - 14); }
  const L = Array.isArray(lines) ? lines : [lines]; const fs = o.size || Math.min(140, Math.floor(c.width * .92 / (Math.max(1, ...L.map(l => l.length)) * 0.6)), Math.floor(c.height / (L.length * 1.25)));
  g.fillStyle = o.fg || '#1b1b1b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `${o.weight || 800} ${fs}px ${o.font || 'Jost'}, sans-serif`;
  L.forEach((l, i) => g.fillText(l, c.width / 2, c.height / 2 + (i - (L.length - 1) / 2) * fs * 1.15 + (o.dy || 0)));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
export function panel(parent, w, h, lines, o = {}) { // flat sign/screen with text, facing +z
  const cw = 1024, ch = Math.max(64, Math.round(1024 * h / w)); const tex = textTex(lines, { ...o, w: cw, h: ch });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: .6, transparent: o.bg === 'none', emissive: o.glow ? 0xffffff : 0x000000, emissiveMap: o.glow ? tex : null, emissiveIntensity: o.glow ? (o.gi ?? .9) : 0 }));
  m.receiveShadow = true; (parent || STATIC).add(m); return m;
}

// ---------- sky & moods ----------
const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bot: { value: new THREE.Color() } },
  vertexShader: 'varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: 'uniform vec3 top,hor,bot; varying vec3 vP; void main(){ float y=vP.y; vec3 c= y>0. ? mix(hor,top,pow(clamp(y*1.6,0.,1.),.7)) : mix(hor,bot,clamp(-y*4.,0.,1.)); gl_FragColor=vec4(c,1.); }' });
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(800, 32, 16), skyMat); skyDome.userData.dyn = true; scene.add(skyDome);
const orb = new THREE.Mesh(new THREE.CircleGeometry(14, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })); orb.userData.dyn = true; scene.add(orb);
const orbHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.glow(), color: 0xffffff, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); orbHalo.scale.set(90, 90, 1); orbHalo.userData.dyn = true; scene.add(orbHalo);
const stars = (() => { const r = rng(5), p = []; for (let i = 0; i < 500; i++) { const a = r() * Math.PI * 2, e = .12 + r() * 1.3; p.push(Math.cos(a) * Math.cos(e) * 700, Math.sin(e) * 700, Math.sin(a) * Math.cos(e) * 700); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); const s = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: .8 })); s.userData.dyn = true; scene.add(s); return s; })();
const clouds = new THREE.Group(); clouds.userData.dyn = true; scene.add(clouds);
{ const r = rng(9); const cm = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0xffffff, emissiveIntensity: .35, fog: false });
  for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2, d = 380 + r() * 200, y = 120 + r() * 90; const c = new THREE.Group(); c.position.set(Math.cos(a) * d, y, Math.sin(a) * d); c.lookAt(0, y, 0);
    for (let j = 0; j < 4; j++) { const b = new THREE.Mesh(new RoundedBoxGeometry(18 + r() * 22, 8 + r() * 6, 12, 2, 3), cm); b.position.set((j - 1.5) * 12 + r() * 6, r() * 5, r() * 6); c.add(b); } clouds.add(c); } }
export let sun, hemi; let mood = null; export let CUR_MOOD = 'day';
export const MOODS = {
  //        sky top   horizon   below    sun col   sun I  hemi sky  hemi gnd  hemi I exposure fog near/far  orb  dark  warm
  day:    [0x4f9cf0, 0xd7ecff, 0x9fc0d8, 0xfff4e0, 2.8, 0xcfe4ff, 0x7a8f5a, 1.05, 1.0, 140, 520, 'sun', 0, .2],
  golden: [0x8c9fd6, 0xffd3a8, 0xd9b99a, 0xffc48a, 2.4, 0xc9c4e8, 0x7a6a5a, 1.0, 1.02, 120, 460, 'sun', .35, .8],
  dusk:   [0x2d3a6e, 0xa88cb8, 0x5a5478, 0xffb98a, 1.2, 0x8a9ad6, 0x3a3a48, .75, 1.08, 100, 420, 'moon', .7, .3],
  night:  [0x0b1330, 0x2a3a6a, 0x1b2238, 0xa9bfff, .75, 0x5a6eb0, 0x1d2430, .55, 1.15, 90, 380, 'moon', 1, 0],
  interior: [0xf3e6d0, 0xf3e6d0, 0xf3e6d0, 0xfff0dc, 1.2, 0xfff6ea, 0x8a7a6a, .95, .92, 200, 600, 'none', .35, .4],
};
export function sky(kind = 'day') {
  CUR_MOOD = kind; const S = MOODS[kind] || MOODS.day;
  if (!sun) { sun = new THREE.DirectionalLight(); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = .03; sun.shadow.radius = 3; scene.add(sun); scene.add(sun.target);
    hemi = new THREE.HemisphereLight(); scene.add(hemi); }
  if (mood === kind) return; mood = kind;
  skyMat.uniforms.top.value.set(S[0]); skyMat.uniforms.hor.value.set(S[1]); skyMat.uniforms.bot.value.set(S[2]);
  sun.color.set(S[3]); sun.intensity = S[4]; hemi.color.set(S[5]); hemi.groundColor.set(S[6]); hemi.intensity = S[7]; R.toneMappingExposure = S[8];
  scene.fog = new THREE.Fog(S[1], S[9], S[10]); scene.background = new THREE.Color(S[1]);
  const dark = S[12]; GLASS.emissiveIntensity = dark > .3 ? 1.1 : 0; GLASS.color.set(dark > .3 ? 0x3a3020 : 0x2c3e5c); BULB.emissiveIntensity = .2 + dark * 2.2;
  for (const g of GLOWS) g.visible = dark > .3; for (const v of VIEWS) v.color.setScalar(kind === 'interior' ? 1 : 1 - dark * .75); for (const l of LAMPS) l.visible = dark > .3 || kind === 'interior';
  stars.visible = dark > .6; clouds.visible = dark < .5 && kind !== 'interior'; orb.visible = orbHalo.visible = S[11] !== 'none';
  orb.material.color.set(S[11] === 'moon' ? 0xf4f1ff : 0xfff6d8); orbHalo.material.color.set(S[11] === 'moon' ? 0x8899cc : 0xffe7b0); orbHalo.material.opacity = S[11] === 'moon' ? .5 : .9;
  if (bloom) { bloom.strength = .2 + dark * .45; bloom.threshold = dark > .5 ? .75 : .97; }
  if (grade) grade.uniforms.warm.value = S[13];
}
export const LAMPS = [];
export function lamp(x, y, z, color = 0xffd9a0, power = 40, dist = 18) { const l = new THREE.PointLight(color, power, dist, 1.6); l.position.set(x, y, z); l.userData.dyn = true; scene.add(l); LAMPS.push(l); return l; }
let shadowFocus = new THREE.Vector3(), shadowR = 26, manualFocus = false;
export function focusShadow(x, z, r = 26) { manualFocus = true; shadowFocus.set(x, 0, z); shadowR = r; }
function placeSun() {
  const S = MOODS[CUR_MOOD] || MOODS.day; const f = shadowFocus; const low = S[11] === 'moon' ? .9 : (CUR_MOOD === 'golden' ? .55 : 1.4);
  sun.position.set(f.x - 30, 30 * low + 8, f.z + 26); sun.target.position.copy(f); sun.target.updateMatrixWorld();
  const r = shadowR; Object.assign(sun.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 1, far: 160 }); sun.shadow.camera.updateProjectionMatrix();
  // orb on the sky in the sun direction (as seen from the camera)
  const dir = sun.position.clone().sub(sun.target.position).normalize(); orb.position.copy(cam.position).addScaledVector(dir, 600); orb.lookAt(cam.position); orbHalo.position.copy(orb.position);
  skyDome.position.copy(cam.position); stars.position.copy(cam.position); clouds.position.set(cam.position.x, 0, cam.position.z);
}

// ---------- static baking: merge every static mesh by material (far fewer draw calls) ----------
export function bake() {
  STATIC.updateMatrixWorld(true); const groups = new Map(); const kill = [];
  STATIC.traverse(o => { if (!o.isMesh || o.userData.dyn || Array.isArray(o.material)) return; const k = o.material.uuid + (o.castShadow ? 'c' : 'n'); if (!groups.has(k)) groups.set(k, { m: o.material, cast: o.castShadow, g: [] });
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
    for (const n of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(n)) g.deleteAttribute(n);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    if (!g.attributes.normal) g.computeVertexNormals(); g.clearGroups(); groups.get(k).g.push(g); kill.push(o); });
  for (const o of kill) o.parent.remove(o);
  for (const { m, cast, g } of groups.values()) { const merged = mergeGeometries(g, false); if (!merged) continue; const mesh = new THREE.Mesh(merged, m); mesh.castShadow = cast; mesh.receiveShadow = true; mesh.matrixAutoUpdate = false; STATIC.add(mesh); }
}

// ---------- tiny math ----------
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1), ss = x => x * x * (3 - 2 * x), eo = x => 1 - Math.pow(1 - x, 3), eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const lerp = (a, b, k) => a + (b - a) * k;

// ---------- frame render hook (used by camera.js / film.js) ----------
export function renderFrame(t) {
  if (!manualFocus) { /* camera.js sets shadowFocus via setShadowFocus */ }
  placeSun();
  if (!composer) setupPost();
  if (aoPass) aoPass.enabled = true;
  composer.render();
  manualFocus = false;
}
export function setShadowFocus(v, r = 26) { if (!manualFocus) { shadowFocus.copy(v); shadowFocus.y = 0; shadowR = r; } }
