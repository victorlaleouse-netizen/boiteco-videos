// sets.js — décors complets. Chaque décor est construit autour d'une abscisse x0 (ils sont très éloignés les uns des autres).
// Abscisses par défaut : street 0 · home 1000 · bedroom 1100 (un 2e : 1150) · office 1200 · fac 2000 · villa 3000 · court 4000. Garder 1000 entre deux décors extérieurs.
// Chaque fonction renvoie un objet « spots » : des positions utiles {x,z,ry} pour placer les personnages.
import { THREE, box, cyl, ball, plane, mat, panel, textTex, glow, lamp, GLASS, BULB, SCREEN, P, rng, pick, STATIC, V, VIEWS, BOUNDS } from './core.js';
import * as F from './props.js';

const ground = (x, z, w, d, c, y = 0, map = 'grass', tile = 6) => plane(STATIC, w, d, mat(c, { map, r: 1 }), x, y, z, { map: true, tile });
// sky view seen through interior windows
function skyView(w, h, kind = 'day') { const t = textTex([''], { w: 512, h: Math.round(512 * h / w), bg: 'none', draw(g, W, H) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, kind === 'city' ? '#7fb2ee' : '#6fb0f0'); gr.addColorStop(1, '#dff0ff'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (kind === 'city') { const r = rng(2); for (let x = 0; x < W;) { const bw = 30 + r() * 60, bh = H * (.25 + r() * .55); g.fillStyle = pick(r, ['#8ea4c0', '#9fb3cc', '#7d93b3', '#a9bbd2']); g.fillRect(x, H - bh, bw, bh); g.fillStyle = 'rgba(255,255,255,.5)'; for (let yy = H - bh + 8; yy < H - 8; yy += 14) for (let xx = x + 5; xx < x + bw - 8; xx += 12) g.fillRect(xx, yy, 6, 7); x += bw + 4; } }
    else { g.fillStyle = '#7fbf6a'; g.beginPath(); g.moveTo(0, H * .8); for (let x = 0; x <= W; x += 32) g.lineTo(x, H * .74 + Math.sin(x * .02) * 14); g.lineTo(W, H); g.lineTo(0, H); g.fill(); g.fillStyle = '#4f9a45'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(40 + i * 90, H * .72, 28, 0, 7); g.fill(); } } } });
  const m = new THREE.MeshBasicMaterial({ map: t, fog: false, toneMapped: true }); VIEWS.push(m); return m; }
function windowIn(x, y, z, w, h, ry = 0, kind = 'day') { const G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = ry; STATIC.add(G);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), skyView(w, h, kind)); m.position.z = .02; G.add(m);
  box(G, w + .5, .35, .5, 0xf4f1ea, 0, -h / 2 - .1, .2); box(G, w + .5, .3, .3, 0xf4f1ea, 0, h / 2 + .1, .1); box(G, .3, h + .5, .3, 0xf4f1ea, -w / 2 - .1, 0, .1); box(G, .3, h + .5, .3, 0xf4f1ea, w / 2 + .1, 0, .1); box(G, .18, h, .2, 0xf4f1ea, 0, 0, .1); box(G, w, .18, .2, 0xf4f1ea, 0, 0, .1);
  if (kind !== 'city') { box(G, 1.1, h + 1.2, .25, 0xc0504d, -w / 2 - .9, -.1, .35, { round: .1 }); box(G, 1.1, h + 1.2, .25, 0xc0504d, w / 2 + .9, -.1, .35, { round: .1 }); }
  return G; }
// closed room shell: floor, 4 walls, ceiling, baseboards. walls: color, floor: material name
function shell(x0, z0, w, d, h, o = {}) {
  BOUNDS.push({ x0: x0 - w / 2, x1: x0 + w / 2, z0: z0 - d / 2, z1: z0 + d / 2, h });
  const wm = mat(o.wall ?? 0xe9dcc6, { r: .95 }); ground(x0, z0, w, d, o.floorColor ?? 0xc89a6a, .01, o.floor ?? 'wood', o.floorTile ?? 5);
  box(STATIC, w, h, .4, wm, x0, h / 2, z0 - d / 2, { cast: false }); box(STATIC, w, h, .4, wm, x0, h / 2, z0 + d / 2, { cast: false });
  box(STATIC, .4, h, d, wm, x0 - w / 2, h / 2, z0, { cast: false }); box(STATIC, .4, h, d, wm, x0 + w / 2, h / 2, z0, { cast: false });
  box(STATIC, w, .4, d, mat(o.ceil ?? 0xf6f2ea), x0, h, z0, { cast: false });
  const bb = mat(o.base ?? 0xf4f1ea); box(STATIC, w - .4, .5, .2, bb, x0, .25, z0 - d / 2 + .3, { cast: false }); box(STATIC, .2, .5, d - .4, bb, x0 - w / 2 + .3, .25, z0, { cast: false }); box(STATIC, .2, .5, d - .4, bb, x0 + w / 2 - .3, .25, z0, { cast: false });
  if (o.stripe) box(STATIC, w - .4, h * .42, .08, mat(o.stripe, { r: .95 }), x0, h * .21, z0 - d / 2 + .25, { cast: false });
}

export const SETS = {
  // ===== quartier pavillonnaire : route le long de x en z=8, maisons au nord (z<0) et au sud (z>16)
  street(x0 = 0, o = {}) {
    const r = rng(o.seed ?? 12);
    ground(x0, 8, 700, 700, P.grass, 0, 'grass', 5);
    plane(STATIC, 700, 8, mat(0x4a4e57, { map: 'asphalt', r: .95 }), x0, .03, 8, { map: true, tile: 6 });
    for (let i = -70; i < 70; i++) plane(STATIC, 2.4, .25, mat(0xf2c230, { r: .6 }), x0 + i * 5, .05, 8);
    for (const zz of [4.3, 11.7]) plane(STATIC, 700, .18, mat(0xeeeeee), x0, .05, zz);
    for (const zz of [2.8, 13.2]) { box(STATIC, 700, .3, 2.6, mat(0xcfcac2, { map: 'concrete' }), x0, .15, zz, { map: true, tile: 2.6, cast: false }); box(STATIC, 700, .34, .25, 0xb0aba3, x0, .17, zz + (zz < 8 ? 1.3 : -1.3), { cast: false }); }
    const pal = [[0xe9dcc6, 0x4a4f5a], [0x5b7fc7, 0x3a3f4a], [0xf2d27a, 0x6a3a2a], [0xb5533f, 0x3a3a3a, true], [0xf4f1ea, 0x5a4a6a], [0xe7a9b8, 0x4a4f5a], [0x9cc8a0, 0x4a3f3a], [0xd9a066, 0x3a3f4a], [0xa8b8c8, 0x7a3a2a], [0x8a4a3a, 0x2a2a2a, true]];
    const party = o.party;
    for (let i = -7; i <= 7; i++) {
      const hx = x0 + i * 15; const c = pal[(i + 70 + 3) % pal.length]; const c2 = pal[(i + 70) * 7 % pal.length];
      F.house(hx, -8, { color: c[0], roof: c[1], brick: c[2], seed: 100 + i, hoop: i === 2 });
      F.house(hx + 7, 25, { ry: Math.PI, color: c2[0], roof: c2[1], brick: c2[2], seed: 200 + i });
      if (r() > .3) F.tree(hx + 7.5, -3.5 + r() * 2, 1); if (r() > .5) F.tree(hx, 19, 1);
      F.streetLamp(hx + 4, 1.8, 0); if (i % 2) F.streetLamp(hx + 11, 14.2, Math.PI);
      if (r() > .45) F.car(hx + 6 + r() * 4, 5.5, Math.PI / 2 + (r() > .5 ? 0 : Math.PI), pick(r, [0x2f9e5a, 0xc4281c, 0xf2f2f2, 0x2457c9, 0xe0b040, 0x333333]));
      if (r() > .55) F.car(hx + 2 + r() * 4, 10.5, -Math.PI / 2, pick(r, [0x2f9e5a, 0xc4281c, 0xf2f2f2, 0x2457c9, 0x7a7a7a]));
      if (r() > .6) F.bin(hx - 4.5, 1.6, pick(r, [0x2f6a3a, 0x2a4a8a, 0x555555]));
      if (i === -1) F.hydrant(hx + 9, 1.6);
    }
    // backyards: wooden fences behind houses, more houses further back (depth)
    F.woodFence(STATIC, x0 - 110, x0 + 110, -16.5, 2.6);
    for (let i = -6; i <= 6; i++) { F.house(x0 + i * 17 + 5, -30, { seed: 300 + i, color: pal[(i + 60) % pal.length][0], roof: pal[(i + 61) % pal.length][1], fence: false }); F.tree(x0 + i * 17 - 3, -22, 1.2); }
    F.hills(x0, 8, { r: 170 });
    if (party !== undefined) {
      const px = x0 + party; F.bunting(V(px - 6, 5.5, -1), V(px + 6, 5.5, -1)); F.bunting(V(px - 6, 4.6, -4.5), V(px + 6, 4.6, -1.5), { seed: 4 });
      F.table(px - 2, -1.5, 6, 2.6, 2.4, 0xf4f1ea, { cloth: 0xff6fa8 }); box(STATIC, 1.4, .8, 1.4, 0xffffff, px - 2, 3.0, -1.5, { round: .2 }); box(STATIC, 1.4, .2, 1.4, 0xff6fa8, px - 2, 3.4, -1.5, { round: .1 });
      for (let k = 0; k < 4; k++) box(STATIC, .5, .6, .5, pick(r, [0xff6fa8, 0x6fc3ff, 0xffd84a, 0x8be07a]), px - 4.2 + k * .9, 2.9, -1.2, { round: .1 });
      F.balloons(px - 6, 1.6, -1); F.balloons(px + 5.5, 1.6, -1.5, { seed: 9 }); box(STATIC, .1, 1.6, .1, 0x888888, px - 6, .8, -1); box(STATIC, .1, 1.6, .1, 0x888888, px + 5.5, .8, -1.5);
      for (let k = 0; k < 2; k++) glow(px - 4 + k * 6, 4.8, -2.5, 3, 0xfff0c0, { halo: true, op: .5 });
    }
    return { x: x0, front: { x: x0, z: 3.2, ry: 0 }, road: { x: x0, z: 8 }, party: party !== undefined ? { x: x0 + party, z: 0.5 } : null };
  },

  // ===== maison : salon (gauche) + salle à manger / cuisine (droite). Pièce 32 x 26, hauteur 10.
  home(x0 = 1000, o = {}) {
    const z0 = 1; shell(x0, z0, 32, 26, 10, { wall: o.wall ?? 0xead9bf, stripe: o.stripe ?? 0xc9b48f, floorColor: 0xd2a676 });
    windowIn(x0 - 7, 5.6, z0 - 12.75, 5.5, 4, 0); windowIn(x0 + 8, 5.6, z0 - 12.75, 4.5, 4, 0);
    // living
    F.sofa(x0 - 7, -8.2, 0, o.sofa ?? 0x3f8fa0, 7); F.rug(x0 - 7, -3, 10, 7, 0xc0504d); F.table(x0 - 7, -3.6, 4, 2, 1.3, 0x7a4e2e);
    box(STATIC, .9, .5, .6, 0xc4281c, x0 - 7.8, 1.65, -3.6, { round: .1 }); box(STATIC, .6, .7, .6, 0xffffff, x0 - 6, 1.75, -3.4, { round: .1 });
    F.tv(x0 - 15.2, -3, Math.PI / 2, { text: o.tvText }); F.shelf(x0 - 14.6, -9.5, Math.PI / 2, { w: 4.5 }); F.plant(x0 - 13.6, -11, 1.1); F.floorLamp(x0 - 1.6, -10.6);
    F.frame_(STATIC, x0 - 7, 7.6, z0 - 12.75, 3.4, 1.8, 0, 2);
    // dining
    F.table(x0 + 7, -3, 7, 3.6, 2.6, 0x8a5a36); for (const dx of [-2.2, 0, 2.2]) { F.chair(x0 + 7 + dx, -5.6, 0, 0x6a4a32); F.chair(x0 + 7 + dx, -.4, Math.PI, 0x6a4a32); }
    for (let k = 0; k < 4; k++) box(STATIC, .9, .1, .9, 0xffffff, x0 + 5 + k * 1.4, 2.8, -3.6 + (k % 2) * 1.2, { round: .03 });
    cyl(STATIC, .04, .04, 3, 0x222222, x0 + 7, 8.5, -3, { seg: 4 }); cyl(STATIC, .5, 1.4, 1, BULB, x0 + 7, 6.6, -3, { seg: 16 }); lamp(x0 + 7, 6.2, -3, 0xffd9a0, 45, 18);
    F.counter(x0 + 14.6, -4, 9, -Math.PI / 2); F.fridge(x0 + 14.4, -10.5, -Math.PI / 2); F.frame_(STATIC, x0 + 15.7, 6.5, 2, 2.4, 3, -Math.PI / 2, 5);
    // ceiling lights
    lamp(x0 - 7, 8.8, -2, 0xfff1dc, 40, 22); lamp(x0, 8.8, 6, 0xfff1dc, 25, 20); for (const dx of [-7, 0]) cyl(STATIC, .8, .8, .15, BULB, x0 + dx, 9.75, dx ? -2 : 6, { seg: 16, cast: false });
    F.plant(x0 + 1.5, -11, 1.3); F.shelf(x0 - 14.6, 8, Math.PI / 2, { w: 3.5, seed: 3 });
    return { x: x0, sofa: [{ x: x0 - 9, z: -8.4, ry: 0 }, { x: x0 - 7, z: -8.4, ry: 0 }, { x: x0 - 5, z: -8.4, ry: 0 }], table: [{ x: x0 + 4.8, z: -5.8, ry: 0 }, { x: x0 + 7, z: -5.8, ry: 0 }, { x: x0 + 9.2, z: -5.8, ry: 0 }, { x: x0 + 4.8, z: -.2, ry: Math.PI }, { x: x0 + 7, z: -.2, ry: Math.PI }, { x: x0 + 9.2, z: -.2, ry: Math.PI }], living: { x: x0 - 7, z: 1 }, kitchen: { x: x0 + 10, z: 2 } };
  },

  // ===== chambre / studio podcast (lumières LED violettes)
  bedroom(x0 = 1100, o = {}) {
    const z0 = 0; shell(x0, z0, 24, 22, 9.5, { wall: o.wall ?? 0x3d4a8a, floorColor: 0x9a7a5a, base: 0x2a2f55 });
    windowIn(x0 + 6, 5.4, z0 - 10.75, 4.5, 3.6, 0, o.night ? 'city' : 'day');
    F.bed(x0 - 7, -6, 0, 0x7a5ad0); F.desk(x0 + 5, -8.6, 0, { w: 6, mug: true }); F.officeChair(x0 + 5, -6.4, Math.PI, 0xd04040);
    F.frame_(STATIC, x0 - 2, 6.2, -10.75, 2.4, 3.2, 0, 7); F.frame_(STATIC, x0 - 9, 6.8, -10.75, 3, 2, 0, 8); F.shelf(x0 + 11.6, -2, -Math.PI / 2, { w: 4, c: 0x2a2f55, seed: 4 }); F.plant(x0 + 10.6, -9.6, .9); F.rug(x0, -1, 9, 7, 0x2fa89a);
    // LED strip
    box(STATIC, 23, .15, .15, mat(0xb070ff, { e: 0xb070ff, ei: 2 }), x0, 9.1, -10.6, { cast: false }); lamp(x0, 8, -8, 0xb070ff, 30, 18); lamp(x0 + 3, 7, 2, 0xffe2c0, 30, 18);
    if (o.podcast) { F.table(x0, -2.2, 5, 2.2, 2.6, 0x2a2a2a); F.micDesk(x0, -2.2); F.ringLight(x0 - 3.6, 5.5, -3.5, .4); const s = F.neon(STATIC, 6, 1.6, [o.neon ?? 'ON AIR'], '#ff4f6a'); s.position.set(x0, 7.2, -10.7); }
    return { x: x0, desk: { x: x0 + 5, z: -6.2, ry: Math.PI }, bed: { x: x0 - 4.2, z: -5, ry: Math.PI / 2 }, mic: { x: x0, z: -.2, ry: Math.PI }, center: { x: x0, z: 1 } };
  },

  // ===== open space de start-up
  office(x0 = 1200, o = {}) {
    const z0 = 0; shell(x0, z0, 46, 32, 11, { wall: 0xf4f4f2, floor: 'concrete', floorColor: 0xbdbdbd, floorTile: 6, ceil: 0xffffff, base: 0x888888 });
    for (const dx of [-15, -5, 5, 15]) windowIn(x0 + dx, 5.8, z0 - 15.75, 8.5, 7, 0, 'city');
    const nb = F.neon(STATIC, 14, 2.4, o.banner ?? ['DISRUPT OR DIE'], '#ff4fa8'); nb.position.set(x0, 9.6, -15.7);
    for (let row = 0; row < 2; row++) for (let i = -2; i <= 2; i++) { const dx = x0 + i * 7.5, dz = -6 + row * 7; F.desk(dx, dz, 0, { w: 6, mug: (i + row) % 2 === 0, monitor: true }); F.officeChair(dx, dz + 2.3, Math.PI, pick(rng(i * 5 + row), [0x222222, 0x3a3a3a, 0xd04040])); }
    // meeting glass box on the right
    for (const [a, b, w, d] of [[x0 + 18, 9, 9, .2], [x0 + 13.5, 6, .2, 6]]) box(STATIC, w, 8, d, mat(0xbfe3ff, { t: .25, r: .1 }), a, 4, b, { cast: false });
    F.pingpong(x0 - 17, 8, Math.PI / 2); F.beanbag(x0 - 9, 11, 0xf5cd30); F.beanbag(x0 - 6.5, 12, 0xff6fa8); F.beanbag(x0 + 9, 12, 0x6fc3ff);
    F.plant(x0 - 21.5, -14, 1.3); F.plant(x0 + 21.5, -14, 1.3); F.plant(x0 - 21.5, 6, 1.1); F.plant(x0 + 21, 13, 1.2);
    const wb = panel(STATIC, 7, 4, o.board ?? ['KPI ↗ ↗ ↗', 'LEVÉE DE FONDS', 'MOONSHOT'], { bg: '#ffffff', fg: '#2457c9', border: '#999999' }); wb.position.set(x0 + 22.75, 5, -4); wb.rotation.y = -Math.PI / 2;
    box(STATIC, 3, 4, 2, 0x333333, x0 - 21.5, 2, -6); box(STATIC, 2.4, 1, .2, SCREEN, x0 - 21.5, 3.2, -4.95, { cast: false });
    for (let i = -2; i <= 2; i++) for (let j = 0; j < 3; j++) { box(STATIC, 5, .15, 2, BULB, x0 + i * 9, 10.75, -10 + j * 10, { cast: false }); }
    lamp(x0, 9, -6, 0xffffff, 30, 30); lamp(x0, 9, 8, 0xffffff, 25, 30);
    return { x: x0, desks: [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0]].map(([i]) => ({ x: x0 + i * 7.5, z: -3.6, ry: Math.PI })), front: { x: x0, z: 7.5, ry: 0 }, pingpong: { x: x0 - 17, z: 8 }, meeting: { x: x0 + 18, z: 3 } };
  },

  // ===== fac / place de manif
  fac(x0 = 2000, o = {}) {
    ground(x0, 0, 500, 500, P.grass, 0, 'grass', 5); plane(STATIC, 70, 40, mat(0xd6cfbf, { map: 'concrete' }), x0, .02, 0, { map: true, tile: 3 });
    box(STATIC, 40, 16, 10, mat(0xe8e0cc, { map: 'brick' }), x0, 8, -16, { map: true, tile: 4 }); box(STATIC, 44, 1.6, 12, 0xd5cdb8, x0, 16.8, -16);
    for (let i = -5; i <= 5; i++) cyl(STATIC, .7, .8, 12, 0xf2ede0, x0 + i * 3.6, 6.4, -10.4, { seg: 12 });
    for (let i = -4; i <= 4; i++) for (let j = 0; j < 2; j++) F.frame_(STATIC, x0 + i * 4.2, 13 - j * 0, -10.95, 1.8, 2, 0, i);
    const t = panel(STATIC, 18, 1.6, [o.title || 'UNIVERSITÉ'], { bg: '#e8e0cc', fg: '#3a3a3a', font: 'Slab', weight: 400 }); t.position.set(x0, 15, -10.9);
    (o.banners || ['GRÈVE ILLIMITÉE', 'FAC OCCUPÉE']).forEach((b, i) => { const p = panel(STATIC, 9, 2, [b], { bg: i % 2 ? '#ffffff' : '#c4281c', fg: i % 2 ? '#c4281c' : '#ffffff' }); p.position.set(x0 + (i ? 9 : -9), 9, -10); });
    for (let i = 0; i < 4; i++) box(STATIC, 30 - i * 2, .5, 1.4, 0xd5cdb8, x0, .25 + i * .5, -8.6 - i * 1.2 + 1.2);
    for (const dx of [-28, -18, 18, 28]) F.tree(x0 + dx, 4, 1.2); F.bin(x0 + 12, 4); F.bunting(V(x0 - 20, 7, 2), V(x0 + 20, 7, 2), { colors: [0xc4281c, 0xffffff, 0x222222] });
    F.hills(x0, 0, { r: 160, seed: 7 });
    return { x: x0, steps: { x: x0, z: -6, ry: 0 }, square: { x: x0, z: 2, ry: 0 } };
  },

  // ===== villa avec piscine
  villa(x0 = 3000, o = {}) {
    ground(x0, 0, 500, 500, 0x7dbb5a, 0, 'grass', 5); plane(STATIC, 34, 22, mat(0xeae2d0, { map: 'tiles' }), x0, .02, -2, { map: true, tile: 3 });
    box(STATIC, 22, 7, 10, 0xf7f1e6, x0, 3.5, -16); box(STATIC, 24, .6, 12, 0xdedad0, x0, 7.3, -16); box(STATIC, 12, 5, 8, 0xf7f1e6, x0 - 4, 10.1, -17); box(STATIC, 13, .5, 9, 0xdedad0, x0 - 4, 12.8, -17);
    for (let i = -3; i <= 3; i++) box(STATIC, 2.6, 5, .12, GLASS, x0 + i * 3, 3, -10.95, { cast: false });
    box(STATIC, 16, .3, 8, mat(0x39b6ea, { e: 0x1a8fd0, ei: .35, r: .1 }), x0 + 1, .06, -1, { cast: false }); box(STATIC, 17, .4, 9, 0xe8e2d2, x0 + 1, -.1, -1, { cast: false });
    for (const [dx, c] of [[-9.5, 0xffffff], [-12, 0xffffff]]) { box(STATIC, 1.6, .5, 4.4, c, x0 + dx, .7, 6, { round: .15 }); box(STATIC, 1.6, 1.4, .4, c, x0 + dx, 1.2, 4, { round: .1, rx: -.4 }); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.9, .35, 8, 20), mat(0xff6fa8)); ring.rotation.x = Math.PI / 2; ring.position.set(x0 + 3, .3, -2); STATIC.add(ring);
    for (const dx of [-16, 17, -20]) { cyl(STATIC, .35, .5, 9, 0x8a6a4a, x0 + dx, 4.5, -6, { seg: 7, rz: .08 }); for (let k = 0; k < 6; k++) box(STATIC, 4.2, .2, 1, 0x3f9a3f, x0 + dx + Math.cos(k) * 1.8, 9, -6 + Math.sin(k) * 1.8, { ry: k, rz: -.3 }); }
    if (o.gate !== false) { for (let i = -10; i <= 10; i++) box(STATIC, .2, 3.4, .2, 0x2b2b2b, x0 + i * 1.1, 1.7, 12); box(STATIC, 23, .25, .25, 0x2b2b2b, x0, 3.3, 12); }
    F.car(x0 + 13, 6, -.3, 0x111111); F.hills(x0, 0, { r: 160, seed: 9 }); F.bunting(V(x0 - 12, 6, -9), V(x0 + 12, 6, -9));
    return { x: x0, pool: { x: x0 + 1, z: 5, ry: 0 }, deck: { x: x0 - 9, z: 6, ry: 0 }, house: { x: x0, z: -8, ry: 0 } };
  },

  // ===== terrain de basket avec gradins et tableau des scores
  court(x0 = 4000, o = {}) {
    ground(x0, 0, 500, 500, P.grass, 0, 'grass', 5); plane(STATIC, 36, 24, mat(0x3a66c4, { r: .7 }), x0, .03, 0); plane(STATIC, 30, 18, mat(0x4a78d6, { r: .7 }), x0, .04, 0);
    const lines = mat(0xffffff); for (const [w, d, x, z] of [[30, .2, 0, -9], [30, .2, 0, 9], [.2, 18, -15, 0], [.2, 18, 15, 0], [.2, 18, 0, 0]]) plane(STATIC, w, d, lines, x0 + x, .05, z);
    plane(STATIC, 6, 6, mat(0xf07a3a), x0 - 12, .05, 0); plane(STATIC, 6, 6, mat(0xf07a3a), x0 + 12, .05, 0); plane(STATIC, 4, 4, mat(0xf5cd30), x0, .05, 0);
    F.hoop(x0 - 15.5, 0, Math.PI / 2); F.hoop(x0 + 15.5, 0, -Math.PI / 2);
    F.bleachers(x0, -14, 26, 5, 0); F.scoreboard(x0, -20, 7, o.home ?? '18', o.guest ?? '0');
    for (let i = -9; i <= 9; i++) { box(STATIC, .15, 5, .15, 0x333333, x0 + i * 2, 2.5, 13); } box(STATIC, 38, 4.6, .05, mat(0xffffff, { t: .5 }), x0, 2.5, 13, { cast: false });
    const ban = panel(STATIC, 16, 1.8, [o.banner ?? 'SUMMER PARTY GAME'], { bg: '#f5cd30', fg: '#6b3fa0', font: 'Slab', weight: 400 }); ban.position.set(x0, 5.8, -12.5);
    F.bunting(V(x0 - 18, 7, -12), V(x0 + 18, 7, -12)); F.bunting(V(x0 - 18, 7, 12.5), V(x0 + 18, 7, 12.5), { seed: 8 });
    for (const dx of [-24, 24]) F.tree(x0 + dx, -8, 1.3); F.hills(x0, 0, { r: 160, seed: 3 });
    for (let i = -3; i <= 3; i++) F.house(x0 + i * 16, -40, { seed: 500 + i, fence: false });
    return { x: x0, center: { x: x0, z: 0, ry: 0 }, stands: { x: x0, z: -12, ry: 0 } };
  },
};
