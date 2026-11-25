// toon3d.js — série « Clichés », look 3D « jeu de blocs » (avatars à la Roblox), rendu Three.js.
// Usage dans episode.js (module) : import * as K from './toon3d.js'; puis K.start({ scenes:{...}, setup(world){...} })
// Repère : 1 unité ≈ 1 bloc. Un avatar mesure ~5,2 de haut (jambes 2, torse 2, tête 1,2). Sol en y = 0.
import * as THREE from 'three';
import { RoundedBoxGeometry } from '/node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';

export { THREE };
export const W = 1080, H = 1920;
// TikTok safe zone (1080x1920): top 0-250 search bar; bottom 1500-1920 caption/username; right x 940-1080 between y 700-1500 buttons.
export const SAFE = { x0: 60, x1: 920, y0: 260, y1: 1480 };

// ---------- renderer ----------
const wrap = document.getElementById('wrap');
export const R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
R.setPixelRatio(1); R.setSize(innerWidth, innerHeight);
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.AgXToneMapping ?? THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.1;
wrap.prepend(R.domElement);
export const scene = new THREE.Scene();
export const cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 600);

// ---------- palette ----------
export const P = {
  skin: 0xF3D2AE, skin2: 0xE0B48A, skin3: 0xB07A52, skin4: 0x7A4E32, yellow: 0xF5CD30, blue: 0x0D69AC, green: 0x4B974B, red: 0xC4281C,
  white: 0xF2F3F3, black: 0x1B2A35, grey: 0xA3A2A5, navy: 0x203A6B, pink: 0xE8A6C9, purple: 0x6B3FA0, orange: 0xDA8541, teal: 0x2FA89A,
  tan: 0xD7C59A, brown: 0x6E4A2E, olive: 0x7A8A3A, sky: 0x8FC7F0, grass: 0x58A04A, road: 0x3B3F47, sand: 0xE8D5A0,
};
const mats = new Map();
export function mat(c, o = {}) {
  const k = c + '|' + (o.r ?? .55) + '|' + (o.e || 0) + '|' + (o.ei || 0);
  if (!o.fresh && mats.has(k)) return mats.get(k);
  const m = new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? .55, metalness: 0, emissive: o.e || 0, emissiveIntensity: o.ei ?? 1 });
  mats.set(k, m); return m;
}
export function box(parent, w, h, d, c, x, y, z, o = {}) {
  const g = o.round ? new RoundedBoxGeometry(w, h, d, 3, Math.min(w, h, d) * (o.round === true ? .12 : o.round)) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, typeof c === 'object' && !(c instanceof Number) && c.isMaterial ? c : mat(c, o));
  m.position.set(x, y, z); m.castShadow = o.cast ?? true; m.receiveShadow = true; if (o.ry) m.rotation.y = o.ry; parent.add(m); return m;
}
// canvas textures (signs, screens, t-shirt prints)
export function textTex(lines, o = {}) {
  const c = document.createElement('canvas'); c.width = o.w || 512; c.height = o.h || 256; const g = c.getContext('2d');
  g.fillStyle = o.bg || '#ffffff'; g.fillRect(0, 0, c.width, c.height);
  if (o.border) { g.strokeStyle = o.border; g.lineWidth = 14; g.strokeRect(7, 7, c.width - 14, c.height - 14); }
  const L = Array.isArray(lines) ? lines : [lines]; const fs = o.size || Math.min(120, Math.floor(c.width / (Math.max(...L.map(l => l.length)) * 0.62)), Math.floor(c.height / (L.length * 1.25)));
  g.fillStyle = o.fg || '#1b1b1b'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `800 ${fs}px Jost, sans-serif`;
  L.forEach((l, i) => g.fillText(l, c.width / 2, c.height / 2 + (i - (L.length - 1) / 2) * fs * 1.15));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
export function panel(parent, w, h, lines, o = {}) { // flat sign/screen with text, facing +z
  const cw = 1024, ch = Math.max(64, Math.round(1024 * h / w)); const tex = textTex(lines, { ...o, w: cw, h: ch });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: .6, emissive: o.glow ? 0xffffff : 0x000000, emissiveMap: o.glow ? tex : null, emissiveIntensity: o.glow ? .8 : 0 }));
  m.receiveShadow = true; parent.add(m); return m;
}

// ---------- faces (Roblox-like: two black ovals + simple mouth) ----------
const faceCache = new Map();
export function faceTex(expr = 'smile', skin = '#F3D2AE') {
  const k = expr + skin; if (faceCache.has(k)) return faceCache.get(k);
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.clearRect(0, 0, 256, 256); g.fillStyle = '#111'; g.strokeStyle = '#111'; g.lineCap = 'round'; g.lineJoin = 'round';
  const eyes = (style) => {
    if (style === 'happy') { g.lineWidth = 11; g.beginPath(); g.arc(86, 118, 18, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(170, 118, 18, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    else if (style === 'closed') { g.lineWidth = 10; g.beginPath(); g.moveTo(70, 112); g.lineTo(102, 112); g.moveTo(154, 112); g.lineTo(186, 112); g.stroke(); }
    else if (style === 'angry') { g.beginPath(); g.ellipse(86, 116, 13, 18, 0, 0, 7); g.ellipse(170, 116, 13, 18, 0, 0, 7); g.fill(); g.lineWidth = 10; g.beginPath(); g.moveTo(66, 84); g.lineTo(104, 98); g.moveTo(190, 84); g.lineTo(152, 98); g.stroke(); }
    else if (style === 'smug') { g.beginPath(); g.ellipse(86, 118, 13, 12, 0, 0, 7); g.ellipse(170, 118, 13, 12, 0, 0, 7); g.fill(); g.lineWidth = 9; g.beginPath(); g.moveTo(66, 100); g.lineTo(104, 96); g.moveTo(152, 96); g.lineTo(190, 100); g.stroke(); }
    else if (style === 'wide') { g.beginPath(); g.ellipse(86, 112, 16, 24, 0, 0, 7); g.ellipse(170, 112, 16, 24, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(91, 104, 5, 7, 0, 0, 7); g.ellipse(175, 104, 5, 7, 0, 0, 7); g.fill(); g.fillStyle = '#111'; }
    else { g.beginPath(); g.ellipse(86, 114, 12, 18, 0, 0, 7); g.ellipse(170, 114, 12, 18, 0, 0, 7); g.fill(); }
  };
  const E = { smile: ['n', 'smile'], happy: ['happy', 'grin'], smug: ['smug', 'smirk'], angry: ['angry', 'shout'], shout: ['n', 'shout'], sad: ['n', 'sad'], shock: ['wide', 'o'], shh: ['closed', 'o'], wink: ['n', 'smirk'], talk: ['n', 'talk'], flat: ['n', 'flat'], cry: ['closed', 'sad'] }[expr] || ['n', 'smile'];
  eyes(E[0]); if (expr === 'wink') { g.globalCompositeOperation = 'destination-out'; g.fillRect(150, 92, 44, 44); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#111'; g.lineWidth = 9; g.beginPath(); g.moveTo(154, 116); g.lineTo(188, 116); g.stroke(); }
  g.lineWidth = 10; const m = E[1];
  if (m === 'smile') { g.beginPath(); g.arc(128, 150, 44, Math.PI * .15, Math.PI * .85); g.stroke(); }
  else if (m === 'grin') { g.beginPath(); g.moveTo(80, 160); g.quadraticCurveTo(128, 238, 176, 160); g.closePath(); g.fill(); g.fillStyle = '#e8404a'; g.beginPath(); g.ellipse(128, 196, 22, 12, 0, 0, 7); g.fill(); }
  else if (m === 'smirk') { g.beginPath(); g.moveTo(92, 178); g.quadraticCurveTo(140, 196, 172, 162); g.stroke(); }
  else if (m === 'shout') { g.beginPath(); g.ellipse(128, 186, 34, 30, 0, 0, 7); g.fill(); g.fillStyle = '#e8404a'; g.beginPath(); g.ellipse(128, 200, 18, 10, 0, 0, 7); g.fill(); }
  else if (m === 'sad') { g.beginPath(); g.arc(128, 214, 40, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); if (expr === 'cry') { g.fillStyle = '#58b6ff'; g.fillRect(76, 124, 12, 40); g.fillRect(168, 124, 12, 40); } }
  else if (m === 'o') { g.beginPath(); g.ellipse(128, 186, 16, 20, 0, 0, 7); g.fill(); }
  else if (m === 'talk') { g.beginPath(); g.moveTo(94, 170); g.quadraticCurveTo(128, 214, 162, 170); g.closePath(); g.fill(); }
  else { g.beginPath(); g.moveTo(98, 182); g.lineTo(158, 182); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; faceCache.set(k, t); return t;
}

// ---------- avatars ----------
// avatar({ skin, shirt, pants, sleeves, shoes, print:'TEXTE', hat:'beanie'|'cap'|'party'|'hair'|'long'|'bun'|'mohawk'|'bald'|'helmet', hatColor, hairColor, glasses:true|'sun', beard:color, prop:'megaphone'|'phone'|'sign:TEXTE'|'mug'|'flag:#hex'|'briefcase'|'glass'|'money'|'sign2:L1|L2', scale })
export function avatar(o = {}) {
  const A = new THREE.Group(); const skin = o.skin ?? P.skin; const skinHex = '#' + new THREE.Color(skin).getHexString();
  const shirt = o.shirt ?? P.blue, pants = o.pants ?? P.green, sleeves = o.sleeves ?? shirt;
  const hip = new THREE.Group(); hip.position.y = 2; A.add(hip);
  const leg = (x) => { const g = new THREE.Group(); g.position.set(x, 0, 0); hip.add(g); box(g, .96, 2, 1, pants, 0, -1, 0, { round: .06 }); box(g, .98, .28, 1.04, o.shoes ?? P.black, 0, -1.86, .02, { round: .08 }); return g; };
  const legL = leg(-.5), legR = leg(.5);
  const torso = new THREE.Group(); torso.position.y = 2; A.add(torso);
  box(torso, 2, 2, 1, shirt, 0, 1, 0, { round: .07 });
  if (o.print) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.7, .8), new THREE.MeshStandardMaterial({ map: textTex(o.print, { bg: '#' + new THREE.Color(shirt).getHexString(), fg: o.printColor || '#ffffff', w: 512, h: 240 }), roughness: .6 })); p.position.set(0, 1.15, .505); torso.add(p); }
  if (o.tie) box(torso, .3, 1.3, .06, o.tie, 0, 1.2, .52, { cast: false });
  const arm = (x) => { const g = new THREE.Group(); g.position.set(x * 1.02, 1.9, 0); torso.add(g); box(g, .98, 2, 1, sleeves, 0, -.9, 0, { round: .07 }); box(g, .9, .4, .92, skin, 0, -1.75, 0, { round: .1 }); return g; };
  const armL = arm(-1.5), armR = arm(1.5);
  const head = new THREE.Group(); head.position.y = 2; torso.add(head);
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex(o.face || 'smile', skinHex), roughness: .55, transparent: true, alphaTest: .05 });
  const hs = mat(skin); const hg = new RoundedBoxGeometry(1.3, 1.25, 1.3, 6, .5);
  const hm = new THREE.Mesh(hg, hs); hm.position.y = .62; hm.castShadow = true; head.add(hm);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(.95, .95), faceMat); face.position.set(0, .62, .652); head.add(face);
  const hc = o.hatColor ?? o.hairColor ?? P.brown;
  const H = o.hat;
  if (H === 'beanie') { box(head, 1.34, .55, 1.3, hc, 0, 1.2, 0, { round: .2 }); }
  else if (H === 'cap') { box(head, 1.32, .42, 1.3, hc, 0, 1.25, 0, { round: .15 }); box(head, 1.1, .1, .7, hc, 0, 1.06, .85); }
  else if (H === 'party') { const c = new THREE.Mesh(new THREE.ConeGeometry(.42, 1.0, 20), mat(hc)); c.position.set(.1, 1.68, 0); c.rotation.z = -.15; c.castShadow = true; head.add(c); const b = new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 8), mat(P.white)); b.position.set(.17, 2.2, 0); head.add(b); }
  else if (H === 'hair') { box(head, 1.34, .4, 1.3, hc, 0, 1.22, -.02, { round: .15 }); box(head, 1.34, .9, .3, hc, 0, .9, -.52, { round: .1 }); box(head, .5, .26, .3, hc, -.35, 1.05, .55, { round: .1 }); }
  else if (H === 'long') { box(head, 1.4, .42, 1.32, hc, 0, 1.22, -.02, { round: .15 }); box(head, 1.42, 1.9, .4, hc, 0, .35, -.5, { round: .12 }); box(head, .3, 1.4, 1, hc, -.66, .55, 0, { round: .1 }); box(head, .3, 1.4, 1, hc, .66, .55, 0, { round: .1 }); }
  else if (H === 'bun') { box(head, 1.34, .4, 1.3, hc, 0, 1.22, -.02, { round: .15 }); const b = new THREE.Mesh(new THREE.SphereGeometry(.36, 16, 12), mat(hc)); b.position.set(0, 1.62, -.25); head.add(b); }
  else if (H === 'mohawk') { box(head, .32, .8, 1.1, hc, 0, 1.55, 0, { round: .1 }); }
  else if (H === 'helmet') { const s = new THREE.Mesh(new THREE.SphereGeometry(.78, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(hc)); s.position.y = 1.05; head.add(s); }
  if (o.glasses) { const gm = mat(o.glasses === 'sun' ? 0x111111 : 0x222222); box(head, .38, o.glasses === 'sun' ? .26 : .3, .06, gm, -.28, .72, .64, { cast: false }); box(head, .38, o.glasses === 'sun' ? .26 : .3, .06, gm, .28, .72, .64, { cast: false }); box(head, .2, .06, .06, gm, 0, .76, .64, { cast: false }); }
  if (o.beard) box(head, 1.1, .45, .2, o.beard, 0, .22, .58, { round: .08 });
  // props in the right hand
  const hand = new THREE.Group(); hand.position.set(0, -1.85, 0); armR.add(hand);
  const pr = o.prop || '';
  if (pr === 'megaphone') { const m = new THREE.Mesh(new THREE.CylinderGeometry(.16, .5, 1.1, 20, 1, true), new THREE.MeshStandardMaterial({ color: P.white, side: THREE.DoubleSide, roughness: .4 })); m.rotation.x = Math.PI / 2; m.position.set(0, -.1, .6); m.castShadow = true; hand.add(m); box(hand, .3, .3, .3, P.red, 0, -.1, .05); }
  else if (pr === 'phone') { box(hand, .55, .9, .1, 0x222222, 0, .1, .5, { round: .05 }); }
  else if (pr === 'mug') { box(hand, .5, .6, .5, P.white, 0, 0, .45, { round: .08 }); }
  else if (pr === 'glass') { const g = new THREE.Mesh(new THREE.CylinderGeometry(.22, .16, .6, 16), new THREE.MeshStandardMaterial({ color: 0xffd37a, transparent: true, opacity: .8 })); g.position.set(0, 0, .45); hand.add(g); }
  else if (pr === 'briefcase') { box(hand, .9, .7, .3, P.brown, 0, -.55, 0, { round: .06 }); }
  else if (pr === 'money') { for (let i = 0; i < 3; i++) box(hand, .8, .08, .4, 0x7bc96f, 0, -.1 + i * .09, .5); }
  else if (pr.startsWith('flag:')) { box(hand, .08, 2.6, .08, P.grey, 0, 1.1, .2); const f = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .9), new THREE.MeshStandardMaterial({ color: pr.slice(5), side: THREE.DoubleSide })); f.position.set(.72, 2, .2); hand.add(f); }
  else if (pr.startsWith('sign')) { const txt = pr.split(':').slice(1).join(':').split('|'); box(hand, .12, 2.4, .12, P.brown, 0, .9, .2); const s = panel(hand, 2.4, 1.3, txt, { bg: '#ffffff', fg: '#111111', border: '#111111' }); s.position.set(0, 2.5, .28); const back = box(hand, 2.5, 1.4, .08, P.white, 0, 2.5, .22); }
  A.scale.setScalar(o.scale || 1);
  scene.add(A);
  const av = { g: A, hip, torso, head, armL, armR, legL, legR, face: faceMat, skinHex, base: { x: 0, z: 0 },
    setFace(e) { faceMat.map = faceTex(e, skinHex); faceMat.needsUpdate = true; },
    at(x, z, ry = 0) { A.position.set(x, 0, z); A.rotation.y = ry; return av; },
    // pose(name, t, k): idle | talk | wave | point | armsUp | shrug | cross | walk | run | sit | shout | phone | facepalm | jump | dance | freeze
    pose(name, t = 0, k = 1) {
      const s = Math.sin; let aL = 0, aR = 0, aLz = 0, aRz = 0, lL = 0, lR = 0, ty = 0, hr = 0, hy = 0, sitY = 0;
      const breathe = s(t * 2.2) * .03;
      switch (name) {
        case 'talk': aR = -.5 - .25 * s(t * 7); aRz = .15; hr = .06 * s(t * 5); break;
        case 'wave': aR = -2.6; aRz = .35 + .35 * s(t * 10); break;
        case 'point': aR = -1.55; aRz = 0; hr = -.05; break;
        case 'armsUp': aL = -2.9; aR = -2.9; aLz = -.25; aRz = .25; ty = Math.abs(s(t * 8)) * .25; break;
        case 'shrug': aL = -.4; aR = -.4; aLz = -.6; aRz = .6; hr = .12; break;
        case 'cross': aL = -1.2; aR = -1.2; aLz = .9; aRz = -.9; break;
        case 'walk': lL = .55 * s(t * 8); lR = -lL; aL = -lL * .9; aR = lL * .9; ty = Math.abs(s(t * 8)) * .08; break;
        case 'run': lL = .9 * s(t * 12); lR = -lL; aL = -lL; aR = lL; ty = Math.abs(s(t * 12)) * .2; break;
        case 'sit': lL = -1.5; lR = -1.5; sitY = -1.0; aL = -.5; aR = -.5; break;
        case 'shout': aR = -2.2; aRz = .1; aL = -.3; hr = -.12; ty = Math.abs(s(t * 10)) * .05; break;
        case 'phone': aR = -1.25; aRz = -.35; hr = .18; break;
        case 'facepalm': aR = -2.5; aRz = -.75; hr = .25; break;
        case 'jump': ty = Math.max(0, s(t * 6)) * 1.1; aL = -2.7; aR = -2.7; aLz = -.4; aRz = .4; lL = -.3; lR = .3; break;
        case 'dance': aL = -1.5 + s(t * 9) * 1.2; aR = -1.5 - s(t * 9) * 1.2; hy = s(t * 4.5) * .4; ty = Math.abs(s(t * 9)) * .2; break;
        case 'freeze': break;
        default: aL = .05 * s(t * 1.7); aR = -.05 * s(t * 1.7);
      }
      armL.rotation.set(aL * k, 0, aLz * k); armR.rotation.set(aR * k, 0, aRz * k); legL.rotation.x = lL * k; legR.rotation.x = lR * k;
      head.rotation.set(hr * k, hy * k, 0); A.position.y = ty * k + sitY; torso.scale.y = 1 + (name === 'freeze' ? 0 : breathe * .3);
      return av;
    },
    hide(v = true) { A.visible = !v; return av; },
  };
  return av;
}
// handy crowd of extras (neighbours, students, colleagues)
export function crowd(n, x0, z0, spread = 1.6, o = {}) {
  const cols = [[P.blue, P.green], [P.red, P.black], [P.yellow, P.navy], [P.pink, P.grey], [P.teal, P.brown], [P.orange, P.navy], [P.purple, P.black]];
  const hats = ['hair', 'cap', 'party', 'long', 'beanie', 'hair', 'bun'];
  const skins = [P.skin, P.skin2, P.skin3, P.skin, P.skin4];
  const out = []; for (let i = 0; i < n; i++) { const c = cols[i % cols.length]; out.push(avatar({ shirt: c[0], pants: c[1], hat: o.hats ? o.hats[i % o.hats.length] : hats[i % hats.length], hatColor: [P.brown, P.black, P.yellow, P.red, P.orange][i % 5], skin: skins[i % skins.length], face: o.face || ['happy', 'smile', 'happy', 'talk'][i % 4], scale: o.scale || .85, prop: o.props ? o.props[i % o.props.length] : '' }).at(x0 + (i - (n - 1) / 2) * spread, z0 + ((i % 2) ? -.8 : 0), o.ry ?? 0)); }
  return out;
}

// ---------- lights & sky ----------
let sun, hemi; const lamps = [];
export function sky(kind = 'day') {
  const S = { day: [0x9fd4ff, 0xffffff, 2.3, 0xd6e8ff, 0x6a9a4a, 1.25, 1.1], dusk: [0x2a3560, 0xffc9a0, 1.2, 0x8fa3d9, 0x2a3d2a, .9, 1.0], night: [0x141a33, 0xc8d4ff, .9, 0x6f84c9, 0x1b261b, .7, 1.0], interior: [0xf3e6d0, 0xfff0dc, 1.3, 0xffffff, 0x8a7a6a, 1.1, 1.0] }[kind];
  scene.background = new THREE.Color(S[0]); scene.fog = new THREE.Fog(S[0], 60, 220);
  if (!sun) { sun = new THREE.DirectionalLight(); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; scene.add(sun); scene.add(sun.target); hemi = new THREE.HemisphereLight(); scene.add(hemi); }
  sun.color.set(S[1]); sun.intensity = S[2]; hemi.color.set(S[3]); hemi.groundColor.set(S[4]); hemi.intensity = S[5]; R.toneMappingExposure = 1.1 * S[6];
}
export function focusShadow(x, z, r = 22) { sun.position.set(x - 18, 34, z + 20); sun.target.position.set(x, 0, z); Object.assign(sun.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 1, far: 120 }); sun.shadow.camera.updateProjectionMatrix(); }
export function lamp(x, y, z, color = 0xffd9a0, power = 40, dist = 16) { const l = new THREE.PointLight(color, power, dist, 1.7); l.position.set(x, y, z); scene.add(l); lamps.push(l); return l; }

// ---------- sets (each built around an origin x; camera moves between them) ----------
const roofGeo = (w, d) => { const s = new THREE.Shape(); s.moveTo(-w / 2 - .3, 0); s.lineTo(0, w * .42); s.lineTo(w / 2 + .3, 0); s.lineTo(-w / 2 - .3, 0); const g = new THREE.ExtrudeGeometry(s, { depth: d + .6, bevelEnabled: false }); g.translate(0, 0, -(d + .6) / 2); return g; };
export function house(x, z, o = {}) {
  const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = o.ry || 0; scene.add(G);
  const w = o.w || 9, h = o.h || 5.5, d = o.d || 7;
  box(G, w, h, d, o.color ?? 0xd9c7a8, 0, h / 2, 0);
  const r = new THREE.Mesh(roofGeo(w, d), mat(o.roof ?? 0x8a3b32)); r.position.y = h; r.castShadow = true; G.add(r);
  const lit = o.lit ?? true;
  for (const dx of [-w / 3.2, w / 3.2]) box(G, 1.8, 1.5, .12, lit ? 0xffd38a : 0x3a4566, dx, h * .6, d / 2 + .02, { e: lit ? 0xffb347 : 0, ei: lit ? 1.1 : 0, cast: false });
  box(G, 1.6, 2.8, .14, o.door ?? 0x5a3a2a, 0, 1.4, d / 2 + .02, { cast: false });
  return G;
}
export function tree(x, z, s = 1) { const G = new THREE.Group(); G.position.set(x, 0, z); G.scale.setScalar(s); scene.add(G); box(G, .7, 3, .7, P.brown, 0, 1.5, 0); box(G, 3.2, 2.6, 3.2, P.green, 0, 4, 0, { round: .4 }); box(G, 2.2, 1.6, 2.2, 0x5fae55, 0, 5.6, 0, { round: .4 }); return G; }
export function ground(x, z, w, d, c, y = 0) { return box(scene, w, .2, d, c, x, y - .1, z, { cast: false }); }
export const SETS = {
  // suburban street, houses on the far side (z<0), pavement, road along x at z=8
  street(x0 = 0, o = {}) { ground(x0, 0, 120, 80, P.grass); ground(x0, 8, 120, 7, P.road, .02); for (let i = -14; i < 15; i++) box(scene, 2, .05, .25, P.yellow, x0 + i * 4, .06, 8, { cast: false }); ground(x0, 3.4, 120, 2.2, 0xb9b3a8, .12); ground(x0, 12.6, 120, 2.2, 0xb9b3a8, .12);
    const cols = [[0xd9c7a8, 0x8a3b32], [0xe7a9c9, 0x4a4f66], [0xa9c4d9, 0x7a3b2a], [0xc9d9a9, 0x4a4f66], [0xd9b0a0, 0x4a3f66]]; for (let i = -2; i <= 2; i++) house(x0 + i * 13, -6, { color: cols[(i + 5) % 5][0], roof: cols[(i + 5) % 5][1], lit: o.lit });
    for (let i = -2; i <= 2; i++) tree(x0 + i * 13 + 6.5, -1, .9);
    for (const dx of [-9, 9]) { box(scene, .3, 6, .3, 0x2b2f3a, x0 + dx, 3, 2.6); box(scene, 1.2, .35, .6, 0x2b2f3a, x0 + dx + .4, 6, 2.6); if (o.lamps !== false) lamp(x0 + dx + .5, 5.6, 2.9, 0xfff0c8, 30, 14); }
    return { x: x0, z: 0 }; },
  // living room (sofa, TV, coffee table), open front (+z)
  room(x0 = 200, o = {}) { const c = o.wall ?? 0xe9dcc6; ground(x0, 6, 44, 40, o.floor ?? 0xb98a5e); box(scene, 44, 16, .4, c, x0, 8, -7); box(scene, .4, 16, 40, c, x0 - 22, 8, 6); box(scene, .4, 16, 40, c, x0 + 22, 8, 6);
    box(scene, 7, 1.2, 2.6, o.sofa ?? P.teal, x0 - 2, .9, -4.6, { round: .2 }); box(scene, 7, 2.4, .8, o.sofa ?? P.teal, x0 - 2, 1.8, -5.8, { round: .2 }); box(scene, 1, 1.8, 2.6, o.sofa ?? P.teal, x0 - 5.6, 1.2, -4.6, { round: .2 }); box(scene, 1, 1.8, 2.6, o.sofa ?? P.teal, x0 + 1.6, 1.2, -4.6, { round: .2 });
    box(scene, 4, .3, 2, P.brown, x0 - 2, 1.1, -1.4); box(scene, .3, 1, .3, P.brown, x0 - 3.7, .5, -1.4); box(scene, .3, 1, .3, P.brown, x0 - .3, .5, -1.4);
    box(scene, 3.8, 2.2, .2, 0x111111, x0 + 5, 3.6, -6.7); box(scene, 3, 1.4, 1.2, P.brown, x0 + 5, .7, -6.2);
    box(scene, 3, 3.5, .1, 0x9fd0ff, x0 - 6, 5, -6.75, { e: 0x9fd0ff, ei: .4, cast: false }); lamp(x0, 7.5, -1, 0xfff0dc, 50, 22);
    return { x: x0, z: 0 }; },
  // open-plan office / start-up
  office(x0 = 400, o = {}) { ground(x0, 6, 50, 40, 0xcfcfcf); box(scene, 50, 16, .4, o.wall ?? 0xf2f2f2, x0, 8, -8); box(scene, .4, 16, 40, o.wall ?? 0xf2f2f2, x0 - 25, 8, 6); box(scene, .4, 16, 40, o.wall ?? 0xf2f2f2, x0 + 25, 8, 6); for (let i = -1; i <= 1; i++) { box(scene, 4.5, .25, 2.4, 0xffffff, x0 + i * 6.5, 2.6, -4); box(scene, .2, 2.5, 2, 0x888888, x0 + i * 6.5 - 2, 1.3, -4); box(scene, .2, 2.5, 2, 0x888888, x0 + i * 6.5 + 2, 1.3, -4); box(scene, 2, 1.3, .12, 0x222222, x0 + i * 6.5, 3.5, -4.6); }
    const p = panel(scene, 6, 2, o.banner || ['DISRUPT', 'OR DIE'], { bg: '#2B2F3A', fg: '#F5CD30' }); p.position.set(x0, 6.4, -7.75); box(scene, 2.5, .3, 2.5, 0xffffff, x0 + 8, .15, -2); lamp(x0, 8, 0, 0xffffff, 60, 26); return { x: x0, z: 0 }; },
  // university / protest square: building with banners, steps
  fac(x0 = 600, o = {}) { ground(x0, 0, 80, 60, 0xc9c2b0); box(scene, 26, 12, 6, 0xe3dccb, x0, 6, -10); for (let i = -3; i <= 3; i++) box(scene, 1.2, 10, 1.2, 0xf2ede0, x0 + i * 3.6, 5, -6.6); box(scene, 28, 1.6, 7, 0xd5cdb8, x0, 12.8, -10);
    const t = panel(scene, 14, 1.4, [o.title || 'FAC DE SOCIO'], { bg: '#e3dccb', fg: '#3a3a3a' }); t.position.set(x0, 11, -6.9);
    (o.banners || ['GRÈVE ILLIMITÉE', 'FAC OCCUPÉE']).forEach((b, i) => { const p = panel(scene, 7, 1.6, [b], { bg: i % 2 ? '#ffffff' : '#c4281c', fg: i % 2 ? '#c4281c' : '#ffffff' }); p.position.set(x0 + (i ? 6.5 : -6.5), 7.6, -6.5); });
    for (let i = 0; i < 3; i++) box(scene, 22 - i * 2, .5, 1.2, 0xd5cdb8, x0, .25 + i * .5, -5.6 + i * -1.2 + 2.4); return { x: x0, z: 0 }; },
  // villa with pool, palm-ish trees
  villa(x0 = 800, o = {}) { ground(x0, 0, 80, 60, 0x7dbb5a); box(scene, 16, 6, 8, 0xf7f1e6, x0, 3, -10); box(scene, 18, .5, 10, 0xdedad0, x0, 6.2, -10); for (let i = -2; i <= 2; i++) box(scene, 2.4, 3, .12, 0x9fd0ff, x0 + i * 3, 3, -5.95, { e: 0x9fd0ff, ei: .2, cast: false });
    box(scene, 12, .3, 6, 0x4cc3f0, x0 + 1, .05, -1, { e: 0x2aa0d8, ei: .25, cast: false }); box(scene, 13, .3, 7, 0xe8e2d2, x0 + 1, -.05, -1, { cast: false });
    for (const dx of [-12, 13]) { box(scene, .7, 7, .7, 0x8a6a4a, x0 + dx, 3.5, -4); box(scene, 4, .4, 1.2, 0x3f9a3f, x0 + dx, 7.1, -4); box(scene, 1.2, .4, 4, 0x3f9a3f, x0 + dx, 7.1, -4); }
    if (o.gate !== false) { for (let i = -6; i <= 6; i++) box(scene, .18, 3, .18, 0x2b2b2b, x0 + i * 1.1, 1.5, 5); box(scene, 14, .25, .2, 0x2b2b2b, x0, 2.9, 5); } return { x: x0, z: 0 }; },
  // street-basketball court / stadium-ish
  court(x0 = 1000, o = {}) { ground(x0, 0, 60, 50, P.grass); ground(x0, 0, 26, 16, 0x3e6fc9, .05); ground(x0, 0, 8, 8, 0xf5cd30, .07); box(scene, .4, 8, .4, 0x888888, x0, 4, -8.5); box(scene, 4, 2.4, .2, 0xffffff, x0, 8, -8.2); box(scene, 2, .1, 1.2, 0xff5a1f, x0, 7, -7.6);
    for (let i = 0; i < 4; i++) box(scene, 26, .5, 1.4, 0x9a9a9a, x0, .5 + i * .6, 10 + i * 1.4); return { x: x0, z: 0 }; },
};

// ---------- camera ----------
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1), ss = x => x * x * (3 - 2 * x), eo = x => 1 - Math.pow(1 - x, 3);
export function shot(from, to, lookA, lookB, k, fov = 38) { cam.fov = fov; cam.updateProjectionMatrix(); cam.position.lerpVectors(from, to, ss(k)); const l = new THREE.Vector3().lerpVectors(lookA, lookB || lookA, ss(k)); cam.lookAt(l); }
// framing helpers around an avatar standing at (x,z), height ~5.2: close = face, mid = waist up, full = whole body
export function frame(av, kind = 'mid', o = {}) { // portrait 9:16 frame: the width is the limit, so cameras sit far back
  const p = av.g.position, s = av.g.scale.x; const side = o.side || 0;
  if (kind === 'close') return [V(p.x + side * 3, 5.4 * s, p.z + 10.5 * s), V(p.x, 4.4 * s, p.z)];     // head + shoulders
  if (kind === 'mid') return [V(p.x + side * 5, 5.4 * s, p.z + 18 * s), V(p.x, 3.4 * s, p.z)];        // waist up / knees up
  if (kind === 'full') return [V(p.x + side * 6, 6 * s, p.z + 26 * s), V(p.x, 2.8 * s, p.z)];       // whole body + a bit of set
  return [V(p.x + side * 8, 11, p.z + 36), V(p.x, 3, p.z)]; }                                          // wide establishing

// ---------- overlay (SVG over the canvas) ----------
const ov = document.getElementById('ov');
const C = { white: '#FFFFFF', yellow: '#F5CD30', red: '#E5322D', ink: '#111111', panel: '#20242E' };
const backE = x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export function svgText(s, x, y, size, col, o = {}) { return `<text x="${x}" y="${y}" font-family="${o.f || 'Jost'}" font-weight="${o.wt || 800}" font-size="${size}" fill="${col}" text-anchor="${o.a || 'middle'}" stroke="${o.stroke || C.ink}" stroke-width="${o.sw ?? size * .2}" stroke-linejoin="round" paint-order="stroke" ${o.extra || ''}>${s}</text>`; }
export function stamp(t, t0, x, y, txt, col = C.red, rot = -8, size = 70) { if (t < t0) return ''; const k = seg(t, t0, t0 + .12), s = 1.6 - .6 * eo(k); const w = Math.max(280, txt.length * size * .66 + 60);
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s.toFixed(3)})" opacity="${(.4 + .6 * k).toFixed(2)}"><rect x="${-w / 2}" y="${-size * .95}" width="${w}" height="${size * 1.75}" rx="16" fill="#fff" fill-opacity=".9" stroke="${col}" stroke-width="12"/>${svgText(txt, 0, size * .33, size, col, { f: 'Slab', wt: 400, sw: 0 })}</g>`; }
export function ageBadge(t, t0, x, y, n, label = 'ANS') { if (t < t0) return ''; const s = backE(seg(t, t0, t0 + .25)); return `<g transform="translate(${x} ${y}) scale(${s.toFixed(3)})"><rect x="-95" y="-85" width="190" height="160" rx="24" fill="${C.panel}" stroke="${C.ink}" stroke-width="6"/>${svgText(String(n), 0, 18, 92, C.yellow, { f: 'Slab', wt: 400, sw: 0 })}${svgText(label, 0, 60, 32, C.white, { sw: 0 })}</g>`; }
export function card(t, t0, x, y, w, lines, o = {}) { if (t < t0) return ''; const s = backE(seg(t, t0, t0 + .25)); const h = 40 + lines.length * 62; return `<g transform="translate(${x} ${y}) scale(${s.toFixed(3)})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="22" fill="${o.bg || '#fff'}" stroke="${C.ink}" stroke-width="6"/>${lines.map((l, i) => svgText(l, 0, -h / 2 + 70 + i * 62, i ? 42 : 50, i ? '#333' : (o.fg || C.ink), { sw: 0, wt: i ? 600 : 800 })).join('')}</g>`; }
function titleBanner() { const L = window.EP_TITLE; if (!L) return ''; const y = 272, h = L.length > 1 ? 176 : 104; const s2 = L[1] ? Math.min(66, Math.floor(800 / (L[1].length * .72))) : 0, s1 = Math.min(52, Math.floor(820 / (L[0].length * .58)));
  return `<rect x="100" y="${y}" width="880" height="${h}" rx="26" fill="${C.panel}" stroke="${C.ink}" stroke-width="6"/>${svgText(L[0], 540, y + 66, s1, C.white, { sw: 0 })}${L[1] ? svgText(L[1], 540, y + 142, s2, C.yellow, { f: 'Slab', wt: 400, sw: 0 }) : ''}`; }
function captions(t) { let c = null; for (const k of TL.caps) if (t >= k.t0 && t < k.t1) c = k; if (!c) return ''; const s = backE(seg(t, c.t0, c.t0 + .16)); const nch = c.w.reduce((a, [w]) => a + w.length + 1, 0); const size = Math.min(86, Math.floor(820 / (nch * .6)));
  const parts = c.w.map(([w, h]) => `<tspan fill="${h === 2 ? C.red : (h ? C.yellow : C.white)}">${w} </tspan>`).join('');
  return `<g transform="translate(490 1270) scale(${(.85 + .15 * s).toFixed(3)})">${`<text x="0" y="0" font-family="Jost" font-weight="800" font-size="${size}" text-anchor="middle" stroke="${C.ink}" stroke-width="20" stroke-linejoin="round" paint-order="stroke">${parts}</text>`}</g>`; }
// the series gimmick: every « chut chut chut » in the voice → giant slammed text + freeze + flash
export const GIMMICKS = (() => { const ts = (TL.words['chut'] || []).slice().sort((a, b) => a - b); const out = []; for (const x of ts) if (!out.length || x - out[out.length - 1] > 1.6) out.push(x); return out; })();
export function inGimmick(t) { for (const g of GIMMICKS) if (t >= g - .05 && t < g + 1.35) return g; return null; }
function gimmick(t) { const g = inGimmick(t); if (g === null) return ''; const k = t - g; const s = k < .1 ? 1.8 - 8 * k : 1 + .03 * Math.sin(k * 40); const flash = k < .08 ? `<rect width="1080" height="1920" fill="#fff" opacity="${(.7 - k * 8).toFixed(2)}"/>` : '';
  const n = Math.min(3, 1 + Math.floor(k / .28));
  return flash + `<g transform="translate(490 860) rotate(-7) scale(${s.toFixed(3)})">${['CHUT', 'CHUT', 'CHUT !'].slice(0, n).map((w, i) => svgText(w, 0, -150 + i * 150, 150, i === 2 ? C.red : C.white, { f: 'Slab', wt: 400, sw: 22 })).join('')}</g>`; }

// ---------- film loop ----------
export function start({ scenes, ground: groundColors }) {
  const ORDER = TL.scenes.map(s => s[0]);
  const sceneAt = t => { for (const s of TL.scenes) if (t >= s[1] && t < s[2]) return s; return TL.scenes[TL.scenes.length - 1]; };
  window.DUR = TL.dur;
  window.render = function (t) {
    const [n, a, b] = sceneAt(t); const g = inGimmick(t); const tt = g !== null ? g : t; // freeze the world during the gimmick
    const extra = scenes[n](tt, tt - a, t) || '';
    // gimmick: small push-in + shake
    if (g !== null) { const k = t - g; cam.fov = Math.max(20, cam.fov - 10 * eo(Math.min(1, k / .25))); cam.updateProjectionMatrix(); cam.position.x += Math.sin(t * 90) * .04 * Math.max(0, 1 - k * 2); }
    R.render(scene, cam);
    const i = ORDER.indexOf(n); let wipe = '';
    if (i < ORDER.length - 1 && t > b - .18) { const p = eo(seg(t, b - .18, b)); wipe = `<rect x="${-1080 + 1080 * p}" y="0" width="1080" height="1920" fill="${(groundColors && groundColors[ORDER[i + 1]]) || '#F5CD30'}"/>`; }
    ov.innerHTML = `<svg viewBox="0 0 1080 1920" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">${extra}${wipe}${titleBanner()}${gimmick(t)}${captions(t)}</svg>`;
  };
  window.TEXTS = function (t) { let c = null; for (const k of TL.caps) if (t >= k.t0 && t < k.t1) c = k; return c ? [{ id: 'cap', text: c.w.map(x => x[0]).join(' '), x0: 70, y0: 1180, x1: 910, y1: 1300 }] : []; };
  document.fonts.ready.then(() => { window.READY = true; });
  if (!/HeadlessChrome/.test(navigator.userAgent)) { const t0 = performance.now(); (function loop() { window.render(((performance.now() - t0) / 1000) % TL.dur); requestAnimationFrame(loop); })(); }
}
