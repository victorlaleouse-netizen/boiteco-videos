import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ---------- helpers ----------
const clay = (color, rough = 0.85) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 });
const flat = (color) => new THREE.MeshBasicMaterial({ color });

function mesh(geo, mat, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}
const rbox = (w, h, d, r = 0.05, seg = 4) => new RoundedBoxGeometry(w, h, d, seg, r);
const capsule = (r, len) => new THREE.CapsuleGeometry(r, len, 6, 12);

// ---------- AI character (Vic's design: orange rounded block) ----------
export function buildBot() {
  const g = new THREE.Group();
  const orange = clay(0xf2701e, 0.9);
  const body = mesh(rbox(0.62, 0.56, 0.42, 0.09, 6), orange, { y: 0.52 });
  g.add(body);

  // eyes
  const eyeWhite = flat(0xfbf1e6);
  const pupil = flat(0x111111);
  const eyes = new THREE.Group();
  for (const [ex, px] of [[-0.12, -0.105], [0.13, 0.115]]) {
    const w = mesh(new THREE.CircleGeometry(0.075, 32), eyeWhite, { x: ex, y: 0.56, z: 0.2115, cast: false });
    const p = mesh(new THREE.CircleGeometry(0.036, 24), pupil, { x: px, y: 0.555, z: 0.213, cast: false });
    eyes.add(w, p);
  }
  g.add(eyes);
  g.userData.eyes = eyes;

  // smile
  const smile = mesh(new THREE.TorusGeometry(0.06, 0.009, 8, 24, Math.PI * 0.75), flat(0x151515),
    { x: 0.01, y: 0.47, z: 0.213, rz: Math.PI + Math.PI * 0.125, cast: false });
  g.add(smile);
  const mouth = mesh(new THREE.CircleGeometry(0.045, 24), flat(0x2a0f08), { x: 0.01, y: 0.455, z: 0.2135, cast: false });
  mouth.scale.set(1, 0.01, 1); g.add(mouth);
  g.userData.smile = smile; g.userData.mouth = mouth;

  // legs + feet
  for (const lx of [-0.12, 0.12]) {
    g.add(mesh(capsule(0.055, 0.12), orange, { x: lx, y: 0.17 }));
    const foot = mesh(new THREE.SphereGeometry(0.09, 20, 14), orange, { x: lx, y: 0.05, z: 0.04 });
    foot.scale.set(1, 0.6, 1.3);
    g.add(foot);
  }
  // left arm (down)
  const armL = new THREE.Group();
  armL.position.set(-0.33, 0.6, 0);
  armL.add(mesh(capsule(0.05, 0.2), orange, { y: -0.14 }));
  armL.add(mesh(new THREE.SphereGeometry(0.07, 18, 12), orange, { y: -0.28 }));
  armL.rotation.z = -0.35;
  g.add(armL);
  // right arm (waving)
  const armR = new THREE.Group();
  armR.position.set(0.33, 0.6, 0);
  armR.add(mesh(capsule(0.05, 0.2), orange, { y: 0.14 }));
  const hand = new THREE.Group();
  hand.position.y = 0.29;
  hand.add(mesh(new THREE.SphereGeometry(0.07, 18, 12), orange));
  hand.add(mesh(capsule(0.025, 0.05), orange, { x: -0.06, y: 0.03, rz: 0.7 }));
  hand.add(mesh(capsule(0.028, 0.06), orange, { x: 0.01, y: 0.07 }));
  hand.add(mesh(capsule(0.028, 0.06), orange, { x: 0.05, y: 0.06, rz: -0.35 }));
  armR.add(hand);
  armR.rotation.z = -0.55;
  g.add(armR);
  g.userData.armR = armR;
  g.userData.armL = armL;
  g.userData.body = body;
  return g;
}

// ---------- Boss character (original) ----------
export function buildBoss() {
  const g = new THREE.Group();
  const skin = clay(0xe0a782);
  const hair = clay(0x5a3420, 0.95);
  const shirt = clay(0xf3efe7);
  const cardigan = clay(0xd9a03a);
  const pants = clay(0x3b4252);
  const dark = flat(0x1a1a1a);

  // seated body
  const torso = mesh(rbox(0.78, 0.82, 0.48, 0.18, 6), cardigan, { y: 1.15 });
  g.add(torso);
  // shirt placket + collar
  g.add(mesh(rbox(0.2, 0.7, 0.05, 0.02), shirt, { y: 1.18, z: 0.235 }));
  g.add(mesh(new THREE.ConeGeometry(0.09, 0.12, 3), shirt, { x: -0.07, y: 1.52, z: 0.22, rz: Math.PI, rx: 0.3 }));
  g.add(mesh(new THREE.ConeGeometry(0.09, 0.12, 3), shirt, { x: 0.07, y: 1.52, z: 0.22, rz: Math.PI, rx: 0.3 }));
  // buttons
  for (let i = 0; i < 3; i++) g.add(mesh(new THREE.SphereGeometry(0.018, 10, 8), clay(0x7a5418), { x: 0.13, y: 1.32 - i * 0.16, z: 0.24 }));

  // neck + head
  g.add(mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.14, 16), skin, { y: 1.6 }));
  const head = new THREE.Group();
  head.position.set(0, 1.86, 0.02);
  head.add(mesh(rbox(0.5, 0.52, 0.46, 0.2, 6), skin));
  // ears
  head.add(mesh(new THREE.SphereGeometry(0.06, 14, 10), skin, { x: -0.26, y: -0.02 }));
  head.add(mesh(new THREE.SphereGeometry(0.06, 14, 10), skin, { x: 0.26, y: -0.02 }));
  // nose (big, friendly)
  head.add(mesh(new THREE.SphereGeometry(0.075, 18, 14), clay(0xd59472), { y: -0.03, z: 0.24 }));
  // eyes
  head.add(mesh(new THREE.SphereGeometry(0.032, 14, 10), dark, { x: -0.11, y: 0.06, z: 0.225 }));
  head.add(mesh(new THREE.SphereGeometry(0.032, 14, 10), dark, { x: 0.11, y: 0.06, z: 0.225 }));
  // eyebrows (raised, curious)
  const browL = mesh(rbox(0.12, 0.03, 0.03, 0.012), hair, { x: -0.11, y: 0.15, z: 0.225, rz: 0.12 });
  const browR = mesh(rbox(0.12, 0.03, 0.03, 0.012), hair, { x: 0.11, y: 0.17, z: 0.225, rz: -0.18 });
  head.add(browL, browR);
  g.userData.browL = browL; g.userData.browR = browR;
  // moustache
  head.add(mesh(rbox(0.22, 0.05, 0.05, 0.024), hair, { y: -0.11, z: 0.225 }));
  // mouth
  const bsmile = mesh(new THREE.TorusGeometry(0.045, 0.01, 8, 20, Math.PI * 0.8), dark, { y: -0.16, z: 0.228, rz: Math.PI * 1.1 });
  head.add(bsmile);
  const bmouth = mesh(new THREE.CircleGeometry(0.05, 20), flat(0x3a1410), { y: -0.17, z: 0.232, cast: false });
  bmouth.scale.set(1, 0.01, 1); head.add(bmouth);
  g.userData.smile = bsmile; g.userData.mouth = bmouth;
  // hair: wavy top
  const hairTop = new THREE.Group();
  const blobs = [[-0.15, 0.25, 0.05, 0.13], [0.0, 0.29, 0.08, 0.15], [0.15, 0.26, 0.04, 0.13], [-0.07, 0.27, -0.12, 0.14], [0.1, 0.25, -0.13, 0.13], [-0.22, 0.12, -0.05, 0.1], [0.22, 0.12, -0.05, 0.1], [0, 0.18, -0.2, 0.15]];
  for (const [x, y, z, r] of blobs) hairTop.add(mesh(new THREE.SphereGeometry(r, 16, 12), hair, { x, y, z }));
  head.add(hairTop);
  g.add(head);
  g.userData.head = head;

  // arms resting on desk
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(0.42 * s, 1.42, 0);
    arm.add(mesh(capsule(0.1, 0.28), cardigan, { y: -0.2 }));
    const fore = new THREE.Group();
    fore.position.y = -0.38;
    fore.add(mesh(capsule(0.09, 0.26), cardigan, { z: 0.18, rx: Math.PI / 2 }));
    fore.add(mesh(new THREE.SphereGeometry(0.085, 14, 10), skin, { z: 0.42 }));
    arm.add(fore);
    arm.rotation.z = 0.12 * s;
    g.add(arm);
    g.userData['arm' + (s < 0 ? 'L' : 'R')] = arm;
  }
  // legs (seated)
  for (const s of [-1, 1]) {
    g.add(mesh(capsule(0.12, 0.35), pants, { x: 0.18 * s, y: 0.72, z: 0.22, rx: Math.PI / 2 }));
    g.add(mesh(capsule(0.11, 0.42), pants, { x: 0.18 * s, y: 0.38, z: 0.45 }));
    g.add(mesh(rbox(0.18, 0.1, 0.3, 0.04), clay(0x3a2a20), { x: 0.18 * s, y: 0.08, z: 0.52 }));
  }
  return g;
}

// ---------- hologram screen ----------
export const HOLO_ROWS = [
  ['✔', 'Factures envoyées', '42', '#6ee7a0'],
  ['✔', 'Mails triés', '318', '#6ee7a0'],
  ['⚠', 'Devis en retard', '3', '#ffb74d'],
  ['✖', 'Café commandé', '0', '#ff6b6b'],
];
export function makeHolo(rows = HOLO_ROWS, title = 'Rapport du lundi', sub = 'Semaine 46') {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 680;
  const x = c.getContext('2d');
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  let last = '';
  function draw(state = {}) {
    const { visible = rows.length, hi = -1, blink = 0 } = state;
    const key = visible + ':' + hi + ':' + (blink > 0.5 ? 1 : 0);
    if (key === last) return; last = key;
    x.clearRect(0, 0, 1024, 680);
    x.fillStyle = 'rgba(8,18,40,0.9)'; roundRect(x, 10, 10, 1004, 660, 36); x.fill();
    x.strokeStyle = '#5fe3ff'; x.lineWidth = 8; roundRect(x, 10, 10, 1004, 660, 36); x.stroke();
    x.fillStyle = '#f2701e'; x.beginPath(); x.arc(70, 78, 20, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#ffffff'; x.font = 'bold 46px "DejaVu Sans", sans-serif'; x.fillText(title, 106, 94);
    x.fillStyle = '#8fb3d9'; x.font = '30px "DejaVu Sans", sans-serif'; x.fillText(sub, 760, 92);
    let y = 180;
    rows.forEach(([icon, label, val, col], i) => {
      if (i >= visible) return;
      const on = i === hi && blink > 0.5;
      x.fillStyle = on ? col + '55' : 'rgba(255,255,255,0.06)'; roundRect(x, 50, y - 52, 924, 86, 18); x.fill();
      if (i === hi) { x.strokeStyle = col; x.lineWidth = 5; roundRect(x, 50, y - 52, 924, 86, 18); x.stroke(); }
      x.fillStyle = col; x.font = 'bold 40px "DejaVu Sans", sans-serif'; x.fillText(icon, 75, y + 4);
      x.fillStyle = '#ffffff'; x.font = '36px "DejaVu Sans", sans-serif'; x.fillText(label, 140, y + 2);
      x.fillStyle = col; x.font = 'bold 38px "DejaVu Sans", sans-serif';
      const w = x.measureText(val).width; x.fillText(val, 950 - w, y + 2);
      y += 108;
    });
    t.needsUpdate = true;
  }
  draw();
  return { tex: t, draw };
}
function roundRect(x, a, b, w, h, r) {
  x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r);
  x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath();
}

// ---------- office ----------
export function buildOffice(scene) {
  const floor = mesh(new THREE.PlaneGeometry(14, 14), clay(0xb98d63, 0.9), { rx: -Math.PI / 2, cast: false });
  scene.add(floor);
  // rug
  scene.add(mesh(rbox(3.4, 0.02, 2.4, 0.01), clay(0x2f4a5c), { y: 0.01, z: 0.3, cast: false }));

  // back wall: exposed brick loft
  const bc = document.createElement('canvas'); bc.width = 1024; bc.height = 512;
  const b = bc.getContext('2d');
  b.fillStyle = '#cfc8be'; b.fillRect(0, 0, 1024, 512);
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let row = 0; row < 16; row++) for (let col = -1; col < 13; col++) {
    const x0 = col * 84 + (row % 2) * 42, y0 = row * 32;
    const l = 86 + rnd() * 7, h = 30 + rnd() * 10;
    b.fillStyle = `hsl(${h},${8 + rnd() * 10}%,${l}%)`;
    b.fillRect(x0 + 3, y0 + 3, 78, 26);
  }
  const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace;
  bt.wrapS = bt.wrapT = THREE.RepeatWrapping; bt.repeat.set(4.5, 3.2);
  scene.add(mesh(new THREE.PlaneGeometry(14, 6), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.95 }), { y: 3, z: -3, cast: false }));
  scene.add(mesh(new THREE.PlaneGeometry(10, 6), clay(0xe8e4dc), { x: -3.5, y: 3, z: 1, ry: Math.PI / 2, cast: false }));

  // neon sign on brick
  const nc = document.createElement('canvas'); nc.width = 1024; nc.height = 256;
  const n = nc.getContext('2d');
  n.font = 'bold 150px "DejaVu Sans", sans-serif'; n.textBaseline = 'middle';
  n.shadowColor = '#ff8a3d'; n.shadowBlur = 40; n.fillStyle = '#ffd2a8';
  n.fillText('BOÎTE', 40, 128); n.shadowColor = '#4fd1ff'; n.fillStyle = '#c9f1ff'; n.fillText('&', 510, 128);
  n.shadowColor = '#ff8a3d'; n.fillStyle = '#ffd2a8'; n.fillText('CO', 640, 128);
  const ntx = new THREE.CanvasTexture(nc); ntx.colorSpace = THREE.SRGBColorSpace;
  scene.add(mesh(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshBasicMaterial({ map: ntx, transparent: true }), { x: 0.2, y: 3.75, z: -2.95, cast: false, receive: false }));
  const neonGlow = new THREE.PointLight(0xff9a50, 1.5, 3, 2); neonGlow.position.set(0.2, 3.7, -2.5); scene.add(neonGlow);

  // open shelving unit (back left)
  const shelfMat = clay(0x2b2b30, 0.6);
  const sx = -1.7;
  for (const y of [0.9, 1.7, 2.5, 3.3]) scene.add(mesh(rbox(1.6, 0.05, 0.45, 0.015), clay(0xb9875a), { x: sx, y, z: -2.72 }));
  for (const xx of [sx - 0.8, sx + 0.8]) scene.add(mesh(rbox(0.05, 3.3, 0.45, 0.01), shelfMat, { x: xx, y: 1.65, z: -2.72 }));
  const books = [0xd9534f, 0x2f6fb5, 0xf2b134, 0x3a9d6b, 0x7a5cc2, 0xe8e8e8, 0x1f2a44, 0xe07a5f];
  for (const [y, n0] of [[1.73, 0], [2.53, 3], [3.33, 5]]) for (let i = 0; i < 6; i++)
    scene.add(mesh(rbox(0.09, 0.32 + (i % 3) * 0.05, 0.28, 0.01), clay(books[(i + n0) % books.length]), { x: sx - 0.6 + i * 0.11, y: y + 0.17, z: -2.72, rz: i === 5 ? 0.25 : 0 }));
  addPlant(scene, sx + 0.45, 0.92, -2.72, 0.55);
  addPlant(scene, sx + 0.5, 2.52, -2.72, 0.45);
  // trophy
  scene.add(mesh(new THREE.CylinderGeometry(0.1, 0.05, 0.18, 16), clay(0xe7b416, 0.3), { x: sx + 0.4, y: 1.85, z: -2.72 }));
  scene.add(mesh(rbox(0.12, 0.05, 0.12, 0.01), clay(0x2b2b30), { x: sx + 0.4, y: 1.75, z: -2.72 }));

  // window on the right (daylight, trees)
  const wc = document.createElement('canvas'); wc.width = 512; wc.height = 640;
  const w = wc.getContext('2d');
  const sky = w.createLinearGradient(0, 0, 0, 640); sky.addColorStop(0, '#8ed0ff'); sky.addColorStop(1, '#dff3ff');
  w.fillStyle = sky; w.fillRect(0, 0, 512, 640);
  for (let i = 0; i < 9; i++) { w.fillStyle = `hsl(${105 + rnd() * 30},45%,${38 + rnd() * 12}%)`; w.beginPath(); w.arc(rnd() * 512, 470 + rnd() * 120, 90 + rnd() * 60, 0, Math.PI * 2); w.fill(); }
  w.fillStyle = 'rgba(255,255,255,0.85)'; for (const [cx, cy] of [[120, 120], [360, 200]]) { w.beginPath(); w.ellipse(cx, cy, 70, 26, 0, 0, Math.PI * 2); w.fill(); }
  const wt = new THREE.CanvasTexture(wc); wt.colorSpace = THREE.SRGBColorSpace;
  scene.add(mesh(new THREE.PlaneGeometry(1.5, 1.9), new THREE.MeshBasicMaterial({ map: wt }), { x: 2.3, y: 2.25, z: -2.97, cast: false }));
  const frame = clay(0x2b2b30);
  for (const [fx, fy, fw, fh] of [[2.3, 3.22, 1.6, 0.07], [2.3, 1.28, 1.6, 0.07], [1.52, 2.25, 0.07, 2.0], [3.08, 2.25, 0.07, 2.0], [2.3, 2.25, 0.04, 1.9], [2.3, 2.25, 1.5, 0.04]])
    scene.add(mesh(rbox(fw, fh, 0.06, 0.015), frame, { x: fx, y: fy, z: -2.93, cast: false }));

  // pendant lamps
  for (const px of [-0.6, 1.0]) {
    scene.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.4, 6), shelfMat, { x: px, y: 4.6, z: -0.6, cast: false }));
    scene.add(mesh(new THREE.ConeGeometry(0.22, 0.22, 24, 1, true), clay(0x2f6b5a, 0.5), { x: px, y: 3.85, z: -0.6 }));
    scene.add(mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff1d0 }), { x: px, y: 3.76, z: -0.6, cast: false }));
  }

  // company sign on side wall
  const sign = document.createElement('canvas'); sign.width = 512; sign.height = 160;
  const s = sign.getContext('2d');
  s.fillStyle = '#2b2b30'; s.font = 'bold 84px "DejaVu Sans", sans-serif'; s.fillText('BOÎTE', 20, 110);
  s.fillStyle = '#f2701e'; s.fillText('&', 300, 110); s.fillStyle = '#2b2b30'; s.fillText('CO', 360, 110);
  const st = new THREE.CanvasTexture(sign); st.colorSpace = THREE.SRGBColorSpace;
  scene.add(mesh(new THREE.PlaneGeometry(1.6, 0.5), new THREE.MeshBasicMaterial({ map: st, transparent: true }), { x: -3.48, y: 3.3, z: 0.4, ry: Math.PI / 2, cast: false }));
  scene.add(mesh(new THREE.PlaneGeometry(1.1, 0.34), new THREE.MeshStandardMaterial({ map: st, transparent: true, roughness: 0.9 }), { y: 0.72, z: 0.575, cast: false }));

  // shelf with binders + plant on side wall
  scene.add(mesh(rbox(0.4, 0.06, 1.8, 0.02), clay(0x8a6242), { x: -3.28, y: 2.4, z: 0.4 }));
  const binderCols = [0xd9534f, 0x2f6fb5, 0xf2b134, 0x3a9d6b, 0x7a5cc2, 0xe8e8e8];
  binderCols.forEach((c, i) => scene.add(mesh(rbox(0.3, 0.42, 0.09, 0.015), clay(c), { x: -3.28, y: 2.64, z: -0.3 + i * 0.13 })));
  addPlant(scene, 3.4, 0, -2.3, 1.3);

  // desk
  const wood = clay(0xd8b48a, 0.75);
  const desk = new THREE.Group();
  desk.add(mesh(rbox(2.6, 0.1, 1.2, 0.04), wood, { y: 1.05 }));
  desk.add(mesh(rbox(2.5, 0.75, 0.04, 0.02), clay(0xc9a37a, 0.8), { y: 0.6, z: 0.55 }));
  for (const [lx, lz] of [[-1.2, -0.5], [1.2, -0.5], [-1.2, 0.5], [1.2, 0.5]])
    desk.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 10), clay(0x3a3a40, 0.4), { x: lx, y: 0.5, z: lz }));
  scene.add(desk);

  // laptop
  const lap = new THREE.Group();
  lap.add(mesh(rbox(0.6, 0.025, 0.42, 0.01), clay(0x9aa0a8, 0.4), { y: 1.115 }));
  const screen = mesh(rbox(0.6, 0.4, 0.02, 0.01), clay(0x9aa0a8, 0.4), { y: 1.31, z: -0.21, rx: -0.25 });
  lap.add(screen);
  lap.position.set(1.05, 0, 0.05);
  lap.rotation.y = -1.1;
  scene.add(lap);
  // mug
  const mug = new THREE.Group();
  mug.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.15, 18), clay(0xf2701e, 0.6), { y: 1.18 }));
  mug.add(mesh(new THREE.TorusGeometry(0.045, 0.014, 8, 16), clay(0xf2701e, 0.6), { x: 0.08, y: 1.18, ry: 0 }));
  mug.position.set(0.35, 0, 0.3);
  scene.add(mug);
  // papers + pen
  scene.add(mesh(rbox(0.32, 0.01, 0.42, 0.003), clay(0xffffff, 0.9), { x: -0.2, y: 1.105, z: 0.3, ry: 0.25 }));
  scene.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 8), clay(0x222222), { x: -0.05, y: 1.12, z: 0.35, rz: Math.PI / 2, ry: 0.6 }));
  // holo emitter puck
  scene.add(mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.04, 28), clay(0x1c1c22, 0.3), { x: -0.1, y: 1.12, z: -0.45 }));
  scene.add(mesh(new THREE.TorusGeometry(0.1, 0.008, 8, 32), flat(0x5fe3ff), { x: -0.1, y: 1.142, z: -0.45, rx: Math.PI / 2, cast: false }));
  // desk lamp
  const lamp = new THREE.Group();
  lamp.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.03, 20), clay(0x2b2b30, 0.4), { y: 1.115 }));
  lamp.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 8), clay(0x2b2b30, 0.4), { y: 1.33, rz: 0.2 }));
  lamp.add(mesh(new THREE.ConeGeometry(0.11, 0.16, 20, 1, true), clay(0x2b2b30, 0.4), { x: -0.07, y: 1.55, rz: -0.6 }));
  lamp.position.set(-1.05, 0, -0.35);
  scene.add(lamp);
  const lampLight = new THREE.PointLight(0xffc27a, 2.2, 3, 1.5);
  lampLight.position.set(-1.15, 1.45, -0.3);
  scene.add(lampLight);

  // office chair for boss
  const chair = new THREE.Group();
  const chairMat = clay(0x2d2f36, 0.7);
  chair.add(mesh(rbox(0.75, 0.12, 0.7, 0.05), chairMat, { y: 0.62 }));
  chair.add(mesh(rbox(0.75, 0.95, 0.12, 0.06), chairMat, { y: 1.15, z: -0.36 }));
  chair.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 10), clay(0x888888, 0.3), { y: 0.33 }));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    chair.add(mesh(rbox(0.35, 0.04, 0.06, 0.015), clay(0x888888, 0.3), { x: Math.cos(a) * 0.17, y: 0.07, z: Math.sin(a) * 0.17, ry: -a }));
  }
  return { desk, chair };
}

function addPlant(scene, x, y, z, s) {
  const p = new THREE.Group();
  p.add(mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 18), clay(0xe7e2d8), { y: 0.2 }));
  const leaf = clay(0x3f8f5a);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const l = mesh(new THREE.SphereGeometry(0.1, 10, 8), leaf, { x: Math.cos(a) * 0.12, y: 0.55 + (i % 3) * 0.15, z: Math.sin(a) * 0.12 });
    l.scale.set(0.6, 2.2, 0.35); l.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
    p.add(l);
  }
  p.position.set(x, y, z); p.scale.setScalar(s);
  scene.add(p);
}

// ---------- assemble ----------
export function buildWorld(renderer, holoCfg) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdfe9f2);
  const { chair } = buildOffice(scene);

  const boss = buildBoss();
  boss.position.set(0.55, 0, -1.0);
  boss.rotation.y = -0.35;
  chair.position.copy(boss.position);
  chair.rotation.y = boss.rotation.y;
  scene.add(chair, boss);

  const bot = buildBot();
  bot.position.set(-0.6, 1.1, 0.15);
  bot.rotation.y = 0.55;
  bot.scale.setScalar(0.9);
  scene.add(bot);

  // hologram
  const holoApi = holoCfg ? makeHolo(holoCfg.rows, holoCfg.title, holoCfg.sub) : makeHolo();
  const holo = mesh(new THREE.PlaneGeometry(1.15, 0.76), new THREE.MeshBasicMaterial({ map: holoApi.tex, transparent: true, side: THREE.DoubleSide }),
    { x: -0.05, y: 2.62, z: -0.55, ry: 0.1, cast: false, receive: false });
  scene.add(holo);
  const beam = mesh(new THREE.ConeGeometry(0.55, 1.1, 32, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x5fe3ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }),
    { x: -0.08, y: 1.7, z: -0.48, cast: false, receive: false });
  scene.add(beam);

  // lights
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x8a6a50, 1.3));
  const key = new THREE.DirectionalLight(0xffe2c0, 2.4);
  key.position.set(3, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 20 });
  key.shadow.bias = -0.0005; key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfe3ff, 0.8);
  rim.position.set(3, 3, -4);
  scene.add(rim);
  const holoLight = new THREE.PointLight(0x5fe3ff, 0.6, 2.0, 2);
  holoLight.position.set(-0.05, 2.6, -0.3);
  scene.add(holoLight);

  const camera = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.1, 50);
  camera.position.set(-0.2, 3.0, 5.0);
  camera.lookAt(0.0, 1.5, -0.4);

  return { scene, camera, boss, bot, holo, beam, holoApi, chair };
}
