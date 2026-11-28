// props.js — modèles de décor : maisons, arbres, voitures, lampadaires, clôtures, fanions, ballons, mobilier.
// Toutes les fonctions posent des objets STATIQUES (fusionnés au démarrage) sauf mention « dyn ».
import { THREE, box, cyl, ball, plane, mat, panel, textTex, glow, lamp, GLASS, BULB, SCREEN, P, rng, pick, STATIC, scene } from './core.js';

const grp = (x, z, ry = 0, parent = STATIC) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g); return g; };

// ---------- houses ----------
const roofGeo = (w, d, pitch = .42, over = .5) => { const s = new THREE.Shape(); s.moveTo(-w / 2 - over, 0); s.lineTo(0, (w / 2 + over) * pitch * 2); s.lineTo(w / 2 + over, 0); s.lineTo(-w / 2 - over, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: d + over * 2, bevelEnabled: false }); g.translate(0, 0, -(d + over * 2) / 2); return g; };
function window_(G, x, y, z, w = 1.8, h = 2, o = {}) { // frame + glass + cross, facing +z at depth z
  box(G, w + .36, h + .36, .2, o.frame ?? 0xf4f1ea, x, y, z, { cast: false });
  box(G, w, h, .1, GLASS, x, y, z + .08, { cast: false });
  box(G, .12, h, .14, o.frame ?? 0xf4f1ea, x, y, z + .12, { cast: false }); box(G, w, .12, .14, o.frame ?? 0xf4f1ea, x, y, z + .12, { cast: false });
  box(G, w + .6, .18, .45, o.frame ?? 0xf4f1ea, x, y - h / 2 - .2, z + .15);
  if (o.shutters) { box(G, .55, h + .3, .12, o.shutters, x - w / 2 - .55, y, z + .05, { cast: false }); box(G, .55, h + .3, .12, o.shutters, x + w / 2 + .55, y, z + .05, { cast: false }); }
}
// house(x,z,{ry,w,d,floors,color,roof,brick,door,garage,porch,chimney,fence,seed})  — front faces +z (rotated by ry)
export function house(x, z, o = {}) {
  const r = rng(o.seed ?? Math.round(x * 13 + z * 7)); const G = grp(x, z, o.ry || 0);
  const w = o.w ?? pick(r, [9, 10, 11]), d = o.d ?? 8, fl = o.floors ?? pick(r, [1, 2, 2]), fh = 3.6, h = fl * fh + .6;
  const wall = o.brick ? mat(o.color ?? 0xb5533f, { map: 'brick' }) : mat(o.color ?? 0xe9dcc6, { map: 'siding' });
  box(G, w, h, d, wall, 0, h / 2, 0, { map: true, tile: o.brick ? 3 : 2.4 });
  box(G, w + .2, .5, d + .2, 0x8d8a84, 0, .25, 0); // foundation
  const rf = new THREE.Mesh(roofGeo(w, d, o.pitch ?? .4), mat(o.roof ?? 0x4a4f5a, { r: .9 })); rf.position.y = h; rf.castShadow = rf.receiveShadow = true; G.add(rf);
  box(G, w + 1.1, .25, d + 1.1, o.trim ?? 0xf4f1ea, 0, h + .05, 0); // eave trim
  if (o.chimney ?? r() > .4) box(G, 1.2, 3, 1.2, o.brick ? 0x8a3a2c : 0xa45a46, w * .25, h + 2.2, -d * .15, { map: 'brick', tile: 2 });
  const zf = d / 2 + .02; const sh = o.shutters ?? (r() > .5 ? pick(r, [0x2f4a6b, 0x3d6b4a, 0x7a2e2e, 0x333333]) : 0);
  const door = o.door ?? pick(r, [0x7a2e2e, 0x2f4a6b, 0x3d6b4a, 0x5a3a2a, 0xe0b040]);
  const hasGarage = o.garage ?? (w >= 10 && r() > .45);
  const dx = hasGarage ? -w / 2 + 2.2 : (r() > .5 ? -w * .18 : w * .18);
  // door, step, porch
  box(G, 2.0, 3.3, .2, 0xf4f1ea, dx, 2.05, zf, { cast: false }); box(G, 1.6, 3.0, .26, door, dx, 1.95, zf + .02, { cast: false }); ball(G, .1, 0xd9b44a, dx + .55, 1.9, zf + .2, { cast: false });
  box(G, 2.6, .35, 1.4, 0xbab4aa, dx, .18, zf + .7);
  if (o.porch ?? r() > .55) { box(G, 3.6, .2, 2, o.trim ?? 0xf4f1ea, dx, 3.9, zf + 1, { round: .05 }); box(G, .2, 3.7, .2, 0xf4f1ea, dx - 1.6, 1.95, zf + 1.85); box(G, .2, 3.7, .2, 0xf4f1ea, dx + 1.6, 1.95, zf + 1.85); }
  // ground floor windows
  const slots = [];
  for (let i = 0; i < Math.max(1, Math.round(w / 4.5)); i++) slots.push(-w / 2 + (i + .5) * w / Math.max(1, Math.round(w / 4.5)));
  for (const sx of slots) { if (Math.abs(sx - dx) < 2.2) continue; if (hasGarage && sx > 0) continue; window_(G, sx, 2.2, zf, 1.8, 1.9, { shutters: sh }); }
  if (hasGarage) { const gx = w / 2 - 2.9; box(G, 4.6, 3, .22, 0xf0ede6, gx, 1.6, zf, { cast: false }); for (let i = 0; i < 4; i++) box(G, 4.4, .06, .3, 0xd8d4cc, gx, .5 + i * .7, zf + .02, { cast: false }); plane(G, 4.6, 6, mat(0xc9c4ba, { map: 'concrete' }), gx, .04, zf + 3.1, { map: true, tile: 3 }); }
  if (fl > 1) for (const sx of slots) window_(G, sx, fh + 2.2, zf, 1.8, 1.9, { shutters: sh });
  // side windows
  for (const sx of [-1, 1]) { const s = new THREE.Group(); s.position.set(sx * (w / 2 + .02), 0, 0); s.rotation.y = sx * Math.PI / 2; G.add(s); window_(s, 0, 2.2, 0, 1.6, 1.8); if (fl > 1) window_(s, 0, fh + 2.2, 0, 1.6, 1.8); }
  // yard: path, hedge, mailbox, fence
  plane(G, 1.8, 5, mat(0xd4cec2, { map: 'concrete' }), dx, .035, zf + 3.6, { map: true, tile: 1.8 });
  if (r() > .3) { box(G, 2.6, 1.1, 1, 0x3f7a3a, dx - 3, .55, zf + 1, { round: .3, flat: true }); }
  if (r() > .4) { cyl(G, .08, .08, 1.3, 0x555555, dx + 2.4, .65, zf + 5.6); box(G, .5, .5, .8, pick(r, [0x2f4a6b, 0x7a2e2e, 0x222222]), dx + 2.4, 1.5, zf + 5.6, { round: .1 }); }
  if (o.fence ?? r() > .35) fence(G, -w / 2 - 1, w / 2 + 1, zf + 6.2, { color: pick(r, [0xffffff, 0xffffff, 0x8a6a4a]), gap: dx });
  if (o.hoop) { cyl(G, .12, .12, 6, 0x333333, w / 2 + .5, 3, zf + 4); box(G, 2.4, 1.6, .12, 0xffffff, w / 2 + .5, 6.2, zf + 3.8); box(G, .8, .5, .14, 0xd04020, w / 2 + .5, 6, zf + 3.86, { cast: false }); }
  return G;
}
export function fence(G, x0, x1, z, o = {}) {
  const c = o.color ?? 0xffffff; const n = Math.round((x1 - x0) / .7);
  for (let i = 0; i <= n; i++) { const x = x0 + i * (x1 - x0) / n; if (o.gap !== undefined && Math.abs(x - o.gap) < 1.1) continue; box(G, .22, 1.5, .12, c, x, .75, z, { round: .05 }); }
  box(G, x1 - x0, .14, .1, c, (x0 + x1) / 2, 1.1, z - .1); box(G, x1 - x0, .14, .1, c, (x0 + x1) / 2, .45, z - .1);
}
export function woodFence(G, x0, x1, z, h = 2.4, c = 0x8a6040) { const n = Math.round((x1 - x0) / .9); for (let i = 0; i < n; i++) box(G || STATIC, .86, h, .14, i % 2 ? c : 0x7d5636, x0 + (i + .5) * (x1 - x0) / n, h / 2, z); }

// ---------- vegetation ----------
const leaf = [0x4f9a45, 0x5daa4e, 0x3f8a3f, 0x6bb35a];
export function tree(x, z, s = 1, o = {}) {
  const r = rng(o.seed ?? Math.round(x * 31 + z * 17)); const G = grp(x, z, r() * 6, o.parent); G.scale.setScalar(s * (.85 + r() * .3));
  const kind = o.kind ?? pick(r, ['round', 'round', 'pine', 'tall']);
  if (kind === 'pine') { cyl(G, .35, .45, 2, 0x6a4a32, 0, 1, 0, { seg: 7 }); for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(2.6 - i * .65, 2.8, 7), mat(0x3a7a44, { flat: true })); c.position.y = 2.6 + i * 1.5; c.castShadow = c.receiveShadow = true; G.add(c); } }
  else { cyl(G, .4, .55, kind === 'tall' ? 4.5 : 3, 0x6a4a32, 0, kind === 'tall' ? 2.25 : 1.5, 0, { seg: 7 });
    const lc = pick(r, leaf); const y0 = kind === 'tall' ? 5.6 : 4.2;
    ball(G, 2.4, mat(lc, { flat: true }), 0, y0, 0, { ico: 1 }); ball(G, 1.7, mat(pick(r, leaf), { flat: true }), 1.3, y0 + .9, .4, { ico: 1 }); ball(G, 1.6, mat(lc, { flat: true }), -1.2, y0 + .6, -.5, { ico: 1 }); if (kind === 'tall') ball(G, 1.5, mat(lc, { flat: true }), 0, y0 + 2, 0, { ico: 1 }); }
  return G;
}
export function bush(x, z, s = 1, parent) { const G = grp(x, z, 0, parent); ball(G, 1 * s, mat(0x3f7a3a, { flat: true }), 0, .7 * s, 0, { ico: 1, sy: .8 }); ball(G, .8 * s, mat(0x4f8a45, { flat: true }), .8 * s, .6 * s, .2, { ico: 1, sy: .8 }); return G; }
export function hills(cx, cz, o = {}) { // ring of soft low-poly hills on the horizon
  const r = rng(o.seed ?? 4); const n = o.n ?? 26; const R0 = o.r ?? 170;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + r() * .2; const d = R0 + r() * 60; const s = 40 + r() * 50;
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(pick(r, [0x5c9a4c, 0x6aa656, 0x4f8c45]), { flat: true }));
    m.scale.y = .35 + r() * .35; m.position.set(cx + Math.cos(a) * d, -2, cz + Math.sin(a) * d); m.receiveShadow = true; m.castShadow = false; STATIC.add(m);
    if (r() > .4) for (let k = 0; k < 4; k++) { const b = a + (r() - .5) * .25, dd = d - s * .6 + r() * 10; tree(cx + Math.cos(b) * dd, cz + Math.sin(b) * dd, 1.6 + r(), { kind: r() > .5 ? 'pine' : 'round' }); } }
}

// ---------- street furniture ----------
// lampadaire: pole on the pavement, arm towards +z by default (ry rotates); dark moods light its glow
export function streetLamp(x, z, ry = 0, o = {}) {
  const G = grp(x, z, ry); cyl(G, .14, .2, 7, 0x2b2f3a, 0, 3.5, 0, { seg: 8 }); box(G, .16, .16, 2.2, 0x2b2f3a, 0, 6.9, .95); box(G, .8, .35, 1.1, 0x2b2f3a, 0, 6.8, 1.9, { round: .1 }); box(G, .6, .1, .8, BULB, 0, 6.58, 1.9, { cast: false });
  const p = new THREE.Vector3(0, 0, 1.9).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry).add(new THREE.Vector3(x, 0, z));
  glow(p.x, .06, p.z, 10, 0xffd9a0, { op: .5 }); glow(p.x, 6.4, p.z, 5, 0xffe2b0, { halo: true, op: .55 });
  if (o.light) lamp(p.x, 6.2, p.z, 0xffd9a0, 60, 20);
  return G;
}
export function car(x, z, ry = 0, color = 0xc4281c, o = {}) {
  const G = grp(x, z, ry, o.parent); const c = mat(color, { r: .35 });
  box(G, 2.4, 1.1, 5, c, 0, .95, 0, { round: .25 }); box(G, 2.2, 1.0, 2.7, c, 0, 1.95, -.3, { round: .22 });
  box(G, 2.25, .75, 2.4, GLASS, 0, 2.0, -.3, { cast: false }); box(G, 2.0, .7, .1, GLASS, 0, 1.95, 1.0, { cast: false, rx: -.35 });
  for (const [wx, wz] of [[-1.15, 1.6], [1.15, 1.6], [-1.15, -1.6], [1.15, -1.6]]) { cyl(G, .55, .55, .45, 0x1d1d1d, wx, .55, wz, { rz: Math.PI / 2, seg: 14 }); cyl(G, .28, .28, .48, 0xbdbdbd, wx, .55, wz, { rz: Math.PI / 2, seg: 10, cast: false }); }
  box(G, .5, .25, .1, BULB, -.75, 1.05, 2.51, { cast: false }); box(G, .5, .25, .1, BULB, .75, 1.05, 2.51, { cast: false });
  box(G, .5, .25, .1, mat(0xd02020, { e: 0x800000, ei: .6 }), -.8, 1.1, -2.51, { cast: false }); box(G, .5, .25, .1, mat(0xd02020, { e: 0x800000, ei: .6 }), .8, 1.1, -2.51, { cast: false });
  box(G, 2.42, .25, .2, 0x2a2a2a, 0, .55, 2.5, { round: .08 }); box(G, 2.42, .25, .2, 0x2a2a2a, 0, .55, -2.5, { round: .08 });
  return G;
}
export function hydrant(x, z) { const G = grp(x, z); cyl(G, .28, .32, 1, 0xc4281c, 0, .5, 0, { seg: 10 }); ball(G, .28, 0xc4281c, 0, 1.05, 0); cyl(G, .12, .12, .8, 0xc4281c, 0, .7, 0, { rz: Math.PI / 2, seg: 8 }); return G; }
export function bin(x, z, c = 0x2f6a3a) { const G = grp(x, z); box(G, 1, 1.5, 1, c, 0, .75, 0, { round: .08 }); box(G, 1.1, .15, 1.1, c, 0, 1.55, 0, { round: .05 }); return G; }
// string of triangular flags between two points (sag in the middle)
export function bunting(a, b, o = {}) {
  const r = rng(o.seed ?? 3); const n = o.n ?? Math.round(a.distanceTo(b) / .9); const cols = o.colors ?? [0xe74c3c, 0xf1c40f, 0x2ecc71, 0x3498db, 0x9b59b6, 0xe67e22, 0xff6fa8];
  const pts = []; for (let i = 0; i <= 24; i++) { const k = i / 24; const p = a.clone().lerp(b, k); p.y -= Math.sin(k * Math.PI) * (o.sag ?? 1.2); pts.push(p); }
  const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, .03, 4), mat(0x333333)); STATIC.add(line);
  for (let i = 0; i < n; i++) { const k = (i + .5) / n; const p = a.clone().lerp(b, k); p.y -= Math.sin(k * Math.PI) * (o.sag ?? 1.2);
    const tri = new THREE.Shape(); tri.moveTo(-.32, 0); tri.lineTo(.32, 0); tri.lineTo(0, -.75); tri.lineTo(-.32, 0);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(tri), new THREE.MeshStandardMaterial({ color: cols[i % cols.length], side: THREE.DoubleSide, roughness: .8 }));
    m.position.copy(p); m.lookAt(p.x + (b.z - a.z), p.y, p.z - (b.x - a.x)); m.castShadow = true; STATIC.add(m); }
}
export function balloons(x, y, z, o = {}) { const r = rng(o.seed ?? Math.round(x * 3 + z)); const cols = [0xff6fa8, 0x6fc3ff, 0xffd84a, 0x8be07a, 0xc08bff, 0xff8a5a];
  for (let i = 0; i < (o.n ?? 5); i++) { const bx = x + (r() - .5) * 1.6, by = y + 2 + r() * 1.5, bz = z + (r() - .5) * 1.2; ball(STATIC, .55, mat(pick(r, cols), { r: .25 }), bx, by, bz, { sy: 1.15 });
    const l = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, by - y), mat(0xdddddd)); l.position.set((bx + x) / 2, (by + y) / 2, (bz + z) / 2); l.lookAt(bx, by, bz); l.rotateX(Math.PI / 2); STATIC.add(l); } }

// ---------- furniture (interiors) ----------
export function sofa(x, z, ry = 0, c = P.teal, w = 6) { const G = grp(x, z, ry); const m = mat(c, { r: .95 });
  box(G, w, 1.2, 2.6, m, 0, .9, 0, { round: .2 }); box(G, w, 2.4, .9, m, 0, 1.6, -1.1, { round: .3 }); box(G, .9, 1.9, 2.6, m, -w / 2 + .45, 1.2, 0, { round: .3 }); box(G, .9, 1.9, 2.6, m, w / 2 - .45, 1.2, 0, { round: .3 });
  for (let i = 0; i < 2; i++) box(G, w / 2 - .9, .45, 2.1, m, (i - .5) * (w / 2 - .6), 1.7, .15, { round: .2 });
  box(G, 1.3, 1.1, .4, mat(0xf3e1b0), -w / 2 + 1.5, 2.2, -.5, { round: .15, rz: .2 }); return G; }
export function armchair(x, z, ry = 0, c = P.coral) { return sofa(x, z, ry, c, 2.8); }
export function table(x, z, w = 5, d = 3, h = 2.6, c = 0x8a5a36, o = {}) { const G = grp(x, z, o.ry || 0); box(G, w, .25, d, mat(c, { map: 'wood' }), 0, h, 0, { map: true, tile: 3 }); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(G, .25, h, .25, c, a * (w / 2 - .3), h / 2, b * (d / 2 - .3)); if (o.cloth) box(G, w + .2, .05, d * .5, o.cloth, 0, h + .14, 0, { cast: false }); return G; }
export function chair(x, z, ry = 0, c = 0x8a5a36) { const G = grp(x, z, ry); box(G, 1.4, .2, 1.4, c, 0, 1.6, 0); box(G, 1.4, 1.8, .2, c, 0, 2.5, -.6); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(G, .16, 1.6, .16, c, a * .55, .8, b * .55); return G; }
export function tv(x, z, ry = 0, o = {}) { const G = grp(x, z, ry); box(G, 6, 1.6, 1.6, mat(o.unit ?? 0x3a3a40), 0, .8, 0, { round: .05 }); box(G, 5.2, 3, .2, 0x111111, 0, 3.4, -.3, { round: .05 });
  const s = o.text ? panel(G, 4.9, 2.7, o.text, { bg: '#1c2b44', fg: '#ffffff', glow: true }) : box(G, 4.9, 2.7, .05, SCREEN, 0, 3.4, -.18, { cast: false }); if (o.text) s.position.set(0, 3.4, -.18); return G; }
export function shelf(x, z, ry = 0, o = {}) { const r = rng(o.seed ?? 8); const G = grp(x, z, ry); const w = o.w ?? 4; box(G, w, 6, 1.2, mat(o.c ?? 0xf4f1ea), 0, 3, 0);
  for (let s = 0; s < 4; s++) { box(G, w - .3, .12, 1, mat(0xe0dbd0), 0, .9 + s * 1.4, .1, { cast: false }); let bx = -w / 2 + .3; while (bx < w / 2 - .5) { const bw = .2 + r() * .25, bh = .7 + r() * .4; box(G, bw, bh, .75, pick(r, [0xc4281c, 0x2457c9, 0xf5cd30, 0x4b974b, 0x6b3fa0, 0xda8541, 0x222222]), bx + bw / 2, .96 + s * 1.4 + bh / 2, .2, { cast: false }); bx += bw + .03; if (r() > .85) bx += .5; } } return G; }
export function plant(x, z, s = 1) { const G = grp(x, z); G.scale.setScalar(s); cyl(G, .55, .42, 1.1, 0xd9cbb4, 0, .55, 0, { seg: 12 }); for (let i = 0; i < 6; i++) { const l = box(G, .3, 1.8, .08, 0x3f8a3f, Math.cos(i) * .3, 1.8, Math.sin(i) * .3, { rz: Math.cos(i * 2) * .5, rx: Math.sin(i * 2) * .5 }); } ball(G, .9, mat(0x4f9a45, { flat: true }), 0, 2.3, 0, { ico: 1 }); return G; }
export function floorLamp(x, z, o = {}) { const G = grp(x, z); cyl(G, .5, .6, .15, 0x333333, 0, .08, 0); cyl(G, .06, .06, 5, 0x333333, 0, 2.5, 0, { seg: 6 }); cyl(G, .7, .9, 1, BULB, 0, 5.2, 0, { cast: false }); if (o.light !== false) lamp(x, 5, z, 0xffd9a0, 30, 16); return G; }
export function rug(x, z, w, d, c = 0xc0504d) { plane(STATIC, w, d, mat(c, { map: 'carpet', r: 1 }), x, .03, z, { map: true, tile: 2 }); plane(STATIC, w - .6, d - .6, mat(0xf1e6d0, { map: 'carpet', r: 1 }), x, .04, z, { map: true, tile: 2 }); plane(STATIC, w - 1.2, d - 1.2, mat(c, { map: 'carpet', r: 1 }), x, .05, z, { map: true, tile: 2 }); }
export function frame_(parent, x, y, z, w, h, ry = 0, seed = 1) { const r = rng(seed); const c = textTex([''], { w: 256, h: Math.round(256 * h / w), bg: pick(r, ['#f3d9a4', '#bfe0f0', '#f6c6c0', '#d6e9c6']), draw(g, W, H) { for (let i = 0; i < 4; i++) { g.fillStyle = pick(r, ['#e74c3c', '#2457c9', '#f5cd30', '#2ecc71', '#222']); g.beginPath(); g.arc(r() * W, r() * H, 20 + r() * 50, 0, 7); g.fill(); } } });
  const G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = ry; (parent || STATIC).add(G); box(G, w + .3, h + .3, .12, 0x222222, 0, 0, 0, { cast: false }); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: c, roughness: .7 })); m.position.z = .07; G.add(m); return G; }
export function bed(x, z, ry = 0, c = 0x3d6bb3) { const G = grp(x, z, ry); box(G, 5, 1.2, 8, 0x8a5a36, 0, .6, 0); box(G, 4.8, .8, 7.8, 0xf4f1ea, 0, 1.6, 0, { round: .2 }); box(G, 4.9, .3, 5, mat(c), 0, 2.05, 1.3, { round: .12 }); box(G, 2, .6, 1.2, 0xffffff, -1.1, 2.2, -3, { round: .25 }); box(G, 2, .6, 1.2, 0xffffff, 1.1, 2.2, -3, { round: .25 }); box(G, 5.2, 3.5, .4, 0x8a5a36, 0, 1.75, -4); return G; }
export function desk(x, z, ry = 0, o = {}) { const G = grp(x, z, ry); const w = o.w ?? 5; box(G, w, .2, 2.4, mat(o.c ?? 0xf4f1ea), 0, 2.6, 0); box(G, .2, 2.5, 2.2, 0x9a9a9a, -w / 2 + .2, 1.25, 0); box(G, .2, 2.5, 2.2, 0x9a9a9a, w / 2 - .2, 1.25, 0);
  if (o.monitor !== false) { box(G, 2.6, 1.6, .12, 0x1a1a1a, 0, 3.8, -.6, { round: .03 }); box(G, 2.4, 1.4, .05, SCREEN, 0, 3.8, -.53, { cast: false }); box(G, .2, .7, .2, 0x333333, 0, 3, -.7); box(G, 1.8, .06, .6, 0x2a2a2a, 0, 2.74, .3, { cast: false }); }
  if (o.mug) box(G, .3, .4, .3, 0xffffff, 1.6, 2.9, .2, { round: .05 }); if (o.plant) plant(x + Math.cos(ry) * (w / 2 - .6), z - Math.sin(ry) * (w / 2 - .6), .45); return G; }
export function officeChair(x, z, ry = 0, c = 0x222222) { const G = grp(x, z, ry); cyl(G, .9, .9, .12, 0x333333, 0, .2, 0, { seg: 5 }); cyl(G, .1, .1, 1.3, 0x777777, 0, .9, 0, { seg: 6 }); box(G, 1.6, .3, 1.6, c, 0, 1.65, 0, { round: .12 }); box(G, 1.5, 1.9, .3, c, 0, 2.7, -.75, { round: .12 }); return G; }
export function beanbag(x, z, c = 0xf5cd30) { ball(STATIC, 1.2, mat(c, { r: 1 }), x, .7, z, { sy: .6 }); }
export function pingpong(x, z, ry = 0) { const G = grp(x, z, ry); box(G, 5, .2, 9, 0x1f6fbf, 0, 2.5, 0); box(G, 5.1, .05, .06, 0xffffff, 0, 2.62, 0, { cast: false }); box(G, 5.4, .6, .08, 0xdddddd, 0, 2.9, 0, { t: .7 }); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(G, .2, 2.4, .2, 0x333333, a * 2.2, 1.2, b * 4); return G; }
export function fridge(x, z, ry = 0) { const G = grp(x, z, ry); box(G, 2.4, 6.4, 2.2, 0xe8e8e8, 0, 3.2, 0, { round: .1, r: .3 }); box(G, .12, 1.6, .15, 0x999999, -.9, 4.4, 1.12); box(G, .12, 1.2, .15, 0x999999, -.9, 2.2, 1.12); return G; }
export function counter(x, z, w = 8, ry = 0) { const G = grp(x, z, ry); box(G, w, 2.8, 2.2, 0xf4f1ea, 0, 1.4, 0); box(G, w + .2, .2, 2.4, 0x3a3a3a, 0, 2.9, .05); for (let i = 0; i < Math.floor(w / 2); i++) box(G, 1.8, 2.3, .08, 0xe8e2d6, -w / 2 + 1 + i * 2, 1.3, 1.12, { cast: false }); return G; }
export function ringLight(x, y, z, ry = 0) { const G = grp(x, z, ry); cyl(G, .06, .06, y, 0x222222, 0, y / 2, 0, { seg: 6 }); const t = new THREE.Mesh(new THREE.TorusGeometry(1.1, .14, 10, 32), BULB); t.position.y = y + .9; G.add(t); return G; }
export function micDesk(x, z, ry = 0) { const G = grp(x, z, ry); cyl(G, .05, .05, 1.2, 0x222222, 0, 3.3, .2, { seg: 6 }); box(G, .38, .8, .38, 0x2a2a2a, 0, 4.1, .2, { round: .15 }); return G; }
export function neon(parent, w, h, text, color = '#ff4fa8') { const m = panel(parent, w, h, text, { bg: 'none', fg: color, glow: true, gi: 1.6, font: 'Slab', weight: 400 }); return m; }
export function scoreboard(x, y, z, home = '18', guest = '0') { const G = grp(x, z); cyl(G, .25, .25, y, 0x222222, -2, y / 2, 0); cyl(G, .25, .25, y, 0x222222, 2, y / 2, 0);
  const s = panel(G, 6, 3.2, ['', ''], { bg: '#151515', draw(g, W, H) { g.fillStyle = '#ddd'; g.font = '700 110px Jost'; g.textAlign = 'center'; g.fillText('GUEST', W * .27, H * .25); g.fillText('HOME', W * .73, H * .25); g.fillStyle = '#ffcc33'; g.font = '800 260px Jost'; g.fillText(guest, W * .27, H * .78); g.fillText(home, W * .73, H * .78); } });
  s.position.set(0, y + 1.4, .1); box(G, 6.3, 3.5, .2, 0x111111, 0, y + 1.4, -.05); return G; }
export function hoop(x, z, ry = 0) { const G = grp(x, z, ry); cyl(G, .2, .25, 7, 0x333333, 0, 3.5, -1); box(G, .2, .2, 1.4, 0x333333, 0, 7, -.3); box(G, 3.2, 2.1, .14, 0xffffff, 0, 7.6, .4); box(G, 1.2, .8, .16, mat(0xd04020), 0, 7.3, .48, { cast: false }); const r = new THREE.Mesh(new THREE.TorusGeometry(.5, .05, 6, 18), mat(0xe05a1f)); r.rotation.x = Math.PI / 2; r.position.set(0, 6.9, 1); G.add(r); return G; }
export function bleachers(x, z, w = 24, rows = 5, ry = 0, c = 0x9a9a9a) { const G = grp(x, z, ry); for (let i = 0; i < rows; i++) { box(G, w, .35, 1.4, c, 0, .9 + i * .9, i * 1.4); box(G, w, .9 + i * .9, .15, 0x7a7a7a, 0, (.9 + i * .9) / 2, i * 1.4 - .7); } return G; }
