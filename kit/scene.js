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
  const mouth = mesh(new THREE.CircleGeometry(0.062, 28, Math.PI, Math.PI), flat(0x2a0f08), { x: 0.01, y: 0.49, z: 0.2135, cast: false });
  mouth.visible = false; g.add(mouth);
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
  const bmouth = mesh(new THREE.CircleGeometry(0.055, 24, Math.PI, Math.PI), flat(0x3a1410), { y: -0.14, z: 0.232, cast: false });
  bmouth.visible = false; head.add(bmouth);
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
// ---------- hologram: "cards" showing concrete examples ----------
// card types: list | chat | email | calendar | table | compare | doc
// each card: {type, title, sub?, items:[...]}; state: {card, visible, hi, blink}
export function makeHolo(cfgOrRows = HOLO_ROWS, title = 'Rapport du lundi', sub = 'Semaine 46') {
  let cards;
  if (Array.isArray(cfgOrRows)) cards = [{ type: 'list', title, sub, items: cfgOrRows }];
  else if (cfgOrRows && cfgOrRows.cards) cards = cfgOrRows.cards;
  else if (cfgOrRows && cfgOrRows.rows) cards = [{ type: 'list', title: cfgOrRows.title, sub: cfgOrRows.sub, items: cfgOrRows.rows }];
  else cards = [{ type: 'list', title, sub, items: HOLO_ROWS }];
  const c = document.createElement('canvas'); c.width = 1024; c.height = 680;
  const x = c.getContext('2d');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const F = (w, s) => `${w} ${s}px "DejaVu Sans", sans-serif`;
  const CYAN = '#5fe3ff', ORANGE = '#f2701e';
  function wrapT(text, maxW) { const ws = String(text).split(' '); const out = []; let cur = '';
    for (const w of ws) { const t2 = cur ? cur + ' ' + w : w; if (x.measureText(t2).width > maxW && cur) { out.push(cur); cur = w; } else cur = t2; }
    if (cur) out.push(cur); return out; }
  function frame(card) {
    x.clearRect(0, 0, 1024, 680);
    x.fillStyle = 'rgba(8,18,40,0.92)'; roundRect(x, 10, 10, 1004, 660, 36); x.fill();
    x.strokeStyle = CYAN; x.lineWidth = 8; roundRect(x, 10, 10, 1004, 660, 36); x.stroke();
    x.fillStyle = ORANGE; x.beginPath(); x.arc(64, 70, 18, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#fff'; x.font = F('bold', 40); x.fillText(card.title || '', 96, 84);
    const tw = x.measureText(card.title || '').width;
    if (card.sub) { x.fillStyle = '#8fb3d9'; x.font = F('', 28); const w = x.measureText(card.sub).width; if (96 + tw + 30 < 984 - w) x.fillText(card.sub, 984 - w, 82); }
  }
  const draws = {
    list(card, vis, hi, on) {
      let y = 175;
      card.items.forEach(([icon, label, val, col], i) => { if (i >= vis) return;
        x.save(); if (i === vis - 1) { x.globalAlpha = A.ap; x.translate(40 * (1 - A.ap), 0); }
        const lit = i === hi && on;
        x.fillStyle = lit ? col + '55' : 'rgba(255,255,255,0.06)'; roundRect(x, 46, y - 50, 932, 82, 18); x.fill();
        if (i === hi) { x.strokeStyle = col; x.lineWidth = 5; roundRect(x, 46, y - 50, 932, 82, 18); x.stroke(); }
        x.fillStyle = col; x.font = F('bold', 38); x.fillText(icon, 70, y + 4);
        x.fillStyle = '#fff'; x.font = F('', 34); x.fillText(label, 130, y + 2);
        x.fillStyle = col; x.font = F('bold', 36); const w = x.measureText(val).width; x.fillText(val, 950 - w, y + 2);
        x.restore(); y += 104; });
    },
    chat(card, vis, hi, on) {   // items: [{from:'me'|'ai', text}]
      let y = 128;
      const shown = card.items.slice(0, vis); const off = Math.max(0, shown.length - 4);
      shown.slice(-4).forEach((m, i, arr) => {
        const newest = off + i === vis - 1;
        x.font = F(m.from === 'ai' ? '' : 'bold', 30);
        const full = wrapT(m.text, 640).slice(0, 4); const h = full.length * 40 + 30;
        let lines = full;
        if (newest) { let left = Math.floor(A.chars * (m.from === 'ai' ? 1 : 2.2)); lines = full.map((l) => { const r = l.slice(0, Math.max(0, left)); left -= l.length + 1; return r; }); }
        x.save(); if (newest) { x.globalAlpha = Math.min(1, A.ap * 1.5); x.translate(0, 24 * (1 - A.ap)); }
        const me = m.from !== 'ai'; const bx = me ? 984 - 700 : 46;
        x.fillStyle = me ? '#2f6fb5' : 'rgba(255,255,255,0.10)'; roundRect(x, bx, y, 700, h, 22); x.fill();
        if (!me) { x.fillStyle = ORANGE; x.beginPath(); x.arc(bx + 26, y + 28, 10, 0, 7); x.fill(); }
        x.fillStyle = '#fff'; lines.forEach((l, k) => x.fillText(l, bx + (me ? 26 : 48), y + 44 + k * 40));
        if (newest && m.from === 'ai' && A.chars < m.text.length && Math.floor(A.age * 4) % 2 === 0) { x.fillStyle = ORANGE; x.fillRect(bx + 48 + x.measureText(lines.filter(Boolean).slice(-1)[0] || '').width + 4, y + 18 + (lines.filter(Boolean).length - 1) * 40, 14, 30); }
        x.restore(); y += h + 16; });
    },
    email(card, vis, hi, on) {  // items: [to, subject, line1, line2, ...]; last can be status
      const [to, subj, ...body] = card.items;
      x.font = F('', 28); x.fillStyle = '#8fb3d9'; x.fillText('À :', 50, 150); x.fillStyle = '#fff'; x.fillText(to || '', 110, 150);
      x.fillStyle = '#8fb3d9'; x.fillText('Objet :', 50, 196); x.fillStyle = '#fff'; x.font = F('bold', 28); x.fillText(subj || '', 160, 196);
      x.fillStyle = 'rgba(255,255,255,0.15)'; x.fillRect(46, 218, 932, 3);
      x.font = F('', 30); x.fillStyle = '#e8eef8'; let y = 270; let left = Math.floor(A.chars * 1.6);
      const shownB = body.slice(0, Math.max(0, vis - 2)); const prevN = Math.max(0, shownB.length - 1);
      shownB.forEach((l, bi) => { wrapT(l, 900).forEach((w) => { if (y < 600) { let ww = w; if (bi >= prevN && A.anim) { ww = w.slice(0, Math.max(0, left)); left -= w.length + 1; } x.fillText(ww, 50, y); y += 42; } }); y += 6; });
      if (vis >= card.items.length && card.status && (!A.anim || left > 0)) { x.fillStyle = '#6ee7a0'; roundRect(x, 690, 596, 290, 56, 28); x.fill(); x.fillStyle = '#082'; x.font = F('bold', 28); x.fillText(card.status, 714, 634); }
    },
    calendar(card, vis, hi, on) { // items: [[day, start, end, label, color], ...] days 0..4
      const days = card.days || ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven']; const x0 = 120, cw = 170, y0 = 150, hh = 52, h0 = card.h0 || 8;
      x.font = F('bold', 28); days.forEach((d, i) => { x.fillStyle = '#8fb3d9'; x.fillText(d, x0 + i * cw + 50, y0 - 12); });
      x.font = F('', 22); for (let h = 0; h < 9; h++) { x.fillStyle = 'rgba(255,255,255,0.08)'; x.fillRect(x0, y0 + h * hh, cw * 5, 2); x.fillStyle = '#6b84ad'; x.fillText((h0 + h) + 'h', 50, y0 + h * hh + 8); }
      card.items.slice(0, vis).forEach(([d, s, e, label, col], i) => {
        x.save(); if (i === vis - 1) { const sc = 0.6 + 0.4 * A.back; const cxp = x0 + d * cw + cw / 2, cyp = y0 + ((s + e) / 2 - h0) * hh; x.translate(cxp, cyp); x.scale(sc, sc); x.translate(-cxp, -cyp); x.globalAlpha = A.ap; }
        const lit = i === hi && on; x.fillStyle = (col || CYAN) + (lit ? 'ff' : 'cc');
        roundRect(x, x0 + d * cw + 6, y0 + (s - h0) * hh + 4, cw - 12, (e - s) * hh - 8, 10); x.fill();
        x.fillStyle = '#081a2e'; x.font = F('bold', 20); wrapT(label, cw - 28).slice(0, Math.max(1, Math.floor(((e - s) * hh - 14) / 24))).forEach((l, k) => x.fillText(l, x0 + d * cw + 16, y0 + (s - h0) * hh + 30 + k * 24)); x.restore(); });
    },
    table(card, vis, hi, on) { // card.cols: [..], items: rows [[..],[..]]
      const cols = card.cols || []; const n = cols.length || (card.items[0] || []).length; const cw = 932 / n;
      x.fillStyle = 'rgba(95,227,255,0.18)'; x.fillRect(46, 120, 932, 54);
      x.font = F('bold', 26); x.fillStyle = '#fff'; cols.forEach((h, i) => x.fillText(h, 60 + i * cw, 156));
      card.items.slice(0, vis).forEach((r, j) => { const y = 174 + j * 60; const lit = j === hi && on;
        x.save(); if (j === vis - 1) { x.globalAlpha = A.ap; x.translate(-60 * (1 - A.ap), 0); }
        x.fillStyle = lit ? 'rgba(255,183,77,0.35)' : (j % 2 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.09)'); x.fillRect(46, y, 932, 60);
        if (j === hi) { x.strokeStyle = '#ffb74d'; x.lineWidth = 4; x.strokeRect(46, y, 932, 60); }
        x.font = F('', 26); r.forEach((v, i) => { x.fillStyle = String(v).startsWith('-') || String(v).includes('❌') ? '#ff8a8a' : '#e8eef8'; x.fillText(String(v), 60 + i * cw, y + 40); }); x.restore(); });
    },
    compare(card, vis, hi, on) { // card.left {label, items}, card.right {label, items}
      const sides = [card.left, card.right]; const cols = ['#ff6b6b', '#6ee7a0'];
      sides.forEach((sd, k) => { if (!sd) return; const bx = 46 + k * 476;
        if (k === 1 && vis < 1) return;
        x.save(); if (k === 1 && vis === 1) { x.globalAlpha = A.ap; x.translate(60 * (1 - A.ap), 0); }
        x.fillStyle = cols[k] + '33'; roundRect(x, bx, 120, 456, 520, 22); x.fill();
        x.fillStyle = cols[k]; x.font = F('bold', 32); x.fillText(sd.label, bx + 24, 170);
        x.font = F('', 28); x.fillStyle = '#fff'; let y = 225; sd.items.forEach((l) => wrapT(l, 410).forEach((w) => { if (y < 620) { x.fillText(w, bx + 24, y); y += 40; } }));
        x.restore(); });
    },
    doc(card, vis, hi, on) { // items: paragraphs/bullets shown progressively
      x.font = F('', 30); let y = 160;
      card.items.slice(0, vis).forEach((p0, i) => { const lit = i === hi && on; const p = i === vis - 1 && A.anim ? p0.slice(0, Math.floor(A.chars * 1.4)) : p0;
        if (lit) { x.fillStyle = 'rgba(255,210,63,0.25)'; x.fillRect(40, y - 34, 944, 46 * Math.max(1, wrapT(p, 900).length)); }
        x.fillStyle = '#e8eef8'; wrapT(p, 900).forEach((w) => { if (y < 640) { x.fillText(w, 50, y); y += 46; } }); y += 10; });
    },
  };
  let last = ''; const A = { age: 9, anim: false, ap: 1, back: 1, chars: 1e9 };
  function draw(state = {}) {
    const ci = Math.min(state.card || 0, cards.length - 1); const card = cards[ci];
    const n = (card.items || []).length; const vis = Math.min(n, state.visible == null ? n : state.visible);
    const on = (state.blink || 0) > 0.5; const hi = state.hi == null ? -1 : state.hi;
    const age = state.age == null ? 9 : state.age;
    const anim = age < 2.4;
    A.age = age; A.anim = anim; A.ap = Math.min(1, Math.max(0, age / 0.35)); A.ap = 1 - Math.pow(1 - A.ap, 3);
    const xb = Math.min(1, Math.max(0, age / 0.4)); A.back = 1 + 2.70158 * Math.pow(xb - 1, 3) + 1.70158 * Math.pow(xb - 1, 2);
    A.chars = anim ? age * 48 : 1e9;
    const sweep = state.t == null ? 0 : Math.floor(state.t * 15);
    const key = ci + ':' + vis + ':' + hi + ':' + (on ? 1 : 0) + ':' + (anim ? Math.floor(age * 30) : 'x') + ':' + sweep;
    if (key === last) return; last = key;
    frame(card); (draws[card.type] || draws.list)(card, vis, hi, on);
    // scanlines + moving sweep band
    x.save(); roundRect(x, 10, 10, 1004, 660, 36); x.clip();
    x.fillStyle = 'rgba(95,227,255,0.035)'; for (let yy = 14; yy < 670; yy += 5) x.fillRect(10, yy, 1004, 1);
    const sy = ((state.t || 0) * 160) % 900 - 120; const gsw = x.createLinearGradient(0, sy, 0, sy + 110);
    gsw.addColorStop(0, 'rgba(95,227,255,0)'); gsw.addColorStop(0.5, 'rgba(95,227,255,0.07)'); gsw.addColorStop(1, 'rgba(95,227,255,0)');
    x.fillStyle = gsw; x.fillRect(10, sy, 1004, 110); x.restore();
    t.needsUpdate = true;
  }
  draw();
  return { tex: t, draw, cards };
}
function roundRect(x, a, b, w, h, r) {
  x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r);
  x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath();
}

// ---------- office ----------
export function buildOffice(scene) {
  const floor = mesh(new THREE.PlaneGeometry(14, 14), clay(0x3a2a1e, 0.9), { rx: -Math.PI / 2, cast: false });
  scene.add(floor);
  // rug
  scene.add(mesh(rbox(3.4, 0.02, 2.4, 0.01), clay(0x1b232c), { y: 0.01, z: 0.3, cast: false }));

  // back wall: exposed brick loft
  const bc = document.createElement('canvas'); bc.width = 1024; bc.height = 512;
  const b = bc.getContext('2d');
  b.fillStyle = '#14161c'; b.fillRect(0, 0, 1024, 512);
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let row = 0; row < 16; row++) for (let col = -1; col < 13; col++) {
    const x0 = col * 84 + (row % 2) * 42, y0 = row * 32;
    const l = 15 + rnd() * 6, h = 215 + rnd() * 15;
    b.fillStyle = `hsl(${h},${10 + rnd() * 8}%,${l}%)`;
    b.fillRect(x0 + 3, y0 + 3, 78, 26);
  }
  const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace;
  bt.wrapS = bt.wrapT = THREE.RepeatWrapping; bt.repeat.set(4.5, 3.2);
  scene.add(mesh(new THREE.PlaneGeometry(14, 6), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.95 }), { y: 3, z: -3, cast: false }));
  scene.add(mesh(new THREE.PlaneGeometry(10, 6), clay(0x1a1d24), { x: -3.5, y: 3, z: 1, ry: Math.PI / 2, cast: false }));

  // neon sign on brick
  const nc = document.createElement('canvas'); nc.width = 1024; nc.height = 256;
  const n = nc.getContext('2d');
  n.font = 'bold 150px "DejaVu Sans", sans-serif'; n.textBaseline = 'middle';
  n.shadowColor = '#ff8a3d'; n.shadowBlur = 40; n.fillStyle = '#ffd2a8';
  n.fillText('BOÎTE', 40, 128); n.shadowColor = '#4fd1ff'; n.fillStyle = '#c9f1ff'; n.fillText('&', 510, 128);
  n.shadowColor = '#ff8a3d'; n.fillStyle = '#ffd2a8'; n.fillText('CO', 640, 128);
  const ntx = new THREE.CanvasTexture(nc); ntx.colorSpace = THREE.SRGBColorSpace;
  scene.add(mesh(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshBasicMaterial({ map: ntx, transparent: true }), { x: 0.2, y: 3.75, z: -2.95, cast: false, receive: false }));
  const neonGlow = new THREE.PointLight(0xff9a50, 3.0, 4, 2); neonGlow.position.set(0.2, 3.7, -2.5); scene.add(neonGlow);

  // open shelving unit (back left)
  const shelfMat = clay(0x2b2b30, 0.6);
  const sx = -1.7;
  for (const y of [0.9, 1.7, 2.5, 3.3]) scene.add(mesh(rbox(1.6, 0.05, 0.45, 0.015), clay(0x3d2c22), { x: sx, y, z: -2.72 }));
  for (const xx of [sx - 0.8, sx + 0.8]) scene.add(mesh(rbox(0.05, 3.3, 0.45, 0.01), shelfMat, { x: xx, y: 1.65, z: -2.72 }));
  const books = [0x5a2f2c, 0x2a3446, 0x6b5530, 0x2f4236, 0x3d3348, 0x8a8478, 0x1f2a44, 0x6e4034];
  for (const [y, n0] of [[1.73, 0], [2.53, 3], [3.33, 5]]) for (let i = 0; i < 6; i++)
    scene.add(mesh(rbox(0.09, 0.32 + (i % 3) * 0.05, 0.28, 0.01), clay(books[(i + n0) % books.length]), { x: sx - 0.6 + i * 0.11, y: y + 0.17, z: -2.72, rz: i === 5 ? 0.25 : 0 }));
  addPlant(scene, sx + 0.45, 0.92, -2.72, 0.55);
  addPlant(scene, sx + 0.5, 2.52, -2.72, 0.45);
  // trophy
  scene.add(mesh(new THREE.CylinderGeometry(0.1, 0.05, 0.18, 16), clay(0xb08a2a, 0.3), { x: sx + 0.4, y: 1.85, z: -2.72 }));
  scene.add(mesh(rbox(0.12, 0.05, 0.12, 0.01), clay(0x2b2b30), { x: sx + 0.4, y: 1.75, z: -2.72 }));

  // window on the right (daylight, trees)
  const wc = document.createElement('canvas'); wc.width = 512; wc.height = 640;
  const w = wc.getContext('2d');
  const sky = w.createLinearGradient(0, 0, 0, 640); sky.addColorStop(0, '#070b18'); sky.addColorStop(1, '#1a2340');
  w.fillStyle = sky; w.fillRect(0, 0, 512, 640);
  for (let i = 0; i < 9; i++) { const bx = i * 60 - 10, bh = 220 + rnd() * 260; w.fillStyle = '#0d1222'; w.fillRect(bx, 640 - bh, 56, bh);
    for (let wy = 640 - bh + 14; wy < 630; wy += 22) for (let wx = bx + 8; wx < bx + 50; wx += 14) if (rnd() > 0.62) { w.fillStyle = rnd() > 0.3 ? '#ffc56b' : '#9fd4ff'; w.fillRect(wx, wy, 6, 9); } }
  w.fillStyle = 'rgba(255,240,210,0.9)'; w.beginPath(); w.arc(400, 90, 22, 0, Math.PI * 2); w.fill();
  const wt = new THREE.CanvasTexture(wc); wt.colorSpace = THREE.SRGBColorSpace;
  scene.add(mesh(new THREE.PlaneGeometry(1.5, 1.9), new THREE.MeshBasicMaterial({ map: wt }), { x: 2.3, y: 2.25, z: -2.97, cast: false }));
  const frame = clay(0x2b2b30);
  for (const [fx, fy, fw, fh] of [[2.3, 3.22, 1.6, 0.07], [2.3, 1.28, 1.6, 0.07], [1.52, 2.25, 0.07, 2.0], [3.08, 2.25, 0.07, 2.0], [2.3, 2.25, 0.04, 1.9], [2.3, 2.25, 1.5, 0.04]])
    scene.add(mesh(rbox(fw, fh, 0.06, 0.015), frame, { x: fx, y: fy, z: -2.93, cast: false }));

  // pendant lamps
  for (const px of [-0.6, 1.0]) {
    scene.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.4, 6), shelfMat, { x: px, y: 4.6, z: -0.6, cast: false }));
    scene.add(mesh(new THREE.ConeGeometry(0.22, 0.22, 24, 1, true), clay(0x23262c, 0.5), { x: px, y: 3.85, z: -0.6 }));
    scene.add(mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffd9a0 }), { x: px, y: 3.76, z: -0.6, cast: false }));
  }

  // company sign on side wall
  const sign = document.createElement('canvas'); sign.width = 512; sign.height = 160;
  const s = sign.getContext('2d');
  s.fillStyle = '#c9c3b8'; s.font = 'bold 84px "DejaVu Sans", sans-serif'; s.fillText('BOÎTE', 20, 110);
  s.fillStyle = '#f2701e'; s.fillText('&', 300, 110); s.fillStyle = '#c9c3b8'; s.fillText('CO', 360, 110);
  const st = new THREE.CanvasTexture(sign); st.colorSpace = THREE.SRGBColorSpace;
  scene.add(mesh(new THREE.PlaneGeometry(1.6, 0.5), new THREE.MeshBasicMaterial({ map: st, transparent: true }), { x: -3.48, y: 3.3, z: 0.4, ry: Math.PI / 2, cast: false }));
  scene.add(mesh(new THREE.PlaneGeometry(1.1, 0.34), new THREE.MeshStandardMaterial({ map: st, transparent: true, roughness: 0.9 }), { y: 0.72, z: 0.575, cast: false }));

  // shelf with binders + plant on side wall
  scene.add(mesh(rbox(0.4, 0.06, 1.8, 0.02), clay(0x3d2c22), { x: -3.28, y: 2.4, z: 0.4 }));
  const binderCols = [0x5a2f2c, 0x2a3446, 0x6b5530, 0x2f4236, 0x3d3348, 0x8a8478];
  binderCols.forEach((c, i) => scene.add(mesh(rbox(0.3, 0.42, 0.09, 0.015), clay(c), { x: -3.28, y: 2.64, z: -0.3 + i * 0.13 })));
  addPlant(scene, 3.4, 0, -2.3, 1.3);

  // desk
  const wood = clay(0x8a6446, 0.7);
  const desk = new THREE.Group();
  desk.add(mesh(rbox(2.6, 0.1, 1.2, 0.04), wood, { y: 1.05 }));
  desk.add(mesh(rbox(2.5, 0.75, 0.04, 0.02), clay(0x6e4f37, 0.8), { y: 0.6, z: 0.55 }));
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
  p.add(mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 18), clay(0x3a3a40), { y: 0.2 }));
  const leaf = clay(0x2c5a40);
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
export function buildWorld(renderer, holoCfg, cast = []) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0d12);
  scene.fog = new THREE.Fog(0x0b0d12, 7, 16);
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
  const holoApi = holoCfg ? makeHolo(holoCfg) : makeHolo();
  const holo = mesh(new THREE.PlaneGeometry(1.15, 0.76), new THREE.MeshBasicMaterial({ map: holoApi.tex, transparent: true, side: THREE.DoubleSide }),
    { x: -0.05, y: 2.62, z: -0.55, ry: 0.1, cast: false, receive: false });
  scene.add(holo);
  const beam = mesh(new THREE.ConeGeometry(0.55, 1.1, 32, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x5fe3ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }),
    { x: -0.08, y: 1.7, z: -0.48, cast: false, receive: false });
  scene.add(beam);

  // lights
  scene.add(new THREE.HemisphereLight(0x9fb2d8, 0x2a1c12, 0.45));
  const key = new THREE.DirectionalLight(0xffd2a0, 1.9);
  key.position.set(2.5, 5, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 20 });
  key.shadow.bias = -0.0005; key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7fb6ff, 1.6);
  rim.position.set(3, 3, -4);
  scene.add(rim);
  const pend = new THREE.SpotLight(0xffc98a, 6, 7, 0.75, 0.6, 1.5);
  pend.position.set(0.2, 3.8, -0.4); pend.target.position.set(0.1, 1.0, -0.4);
  scene.add(pend, pend.target);
  const fill = new THREE.PointLight(0xffe0c0, 1.2, 7, 2); fill.position.set(0, 2.4, 3.2); scene.add(fill);
  const holoLight = new THREE.PointLight(0x5fe3ff, 1.2, 2.5, 2);
  holoLight.position.set(-0.05, 2.6, -0.3);
  scene.add(holoLight);

  const camera = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.1, 50);
  camera.position.set(-0.2, 3.0, 5.0);
  camera.lookAt(0.0, 1.5, -0.4);

  const extras = {};
  cast.slice(0, 2).forEach((id, i) => {
    if (!CAST[id]) return;
    const p = buildPerson(CAST[id]); const sl = SLOTS[i];
    p.position.set(...sl.pos); p.rotation.y = sl.rotY; p.visible = false;
    p.userData.slot = sl; scene.add(p); extras[id] = p;
  });
  return { scene, camera, boss, bot, holo, beam, holoApi, chair, extras };
}

// ---------- Secondary cast (optional, only when an episode lists them in "cast") ----------
export const CAST = {
  sandrine: { skin: 0xd99a74, hair: 0x7a2e1c, top: 0x2f7d74, under: 0xefe6d8, pants: 0x2b2f3a, style: 'bun', glasses: true },
  leo:      { skin: 0xc68a63, hair: 0x1e1712, top: 0x4a5a78, under: 0xd8d8d8, pants: 0x30343c, style: 'short', glasses: false, hoodie: true },
  claire:   { skin: 0xf0c09c, hair: 0xd9b26a, top: 0x8a3b4a, under: 0xf3e3c8, pants: 0x2a2a30, style: 'long', glasses: false, scarf: true },
};
// two standing spots, visible in the wide shot (R = behind the boss's right shoulder, L = behind Claude)
export const SLOTS = [
  { pos: [1.25, 0, -1.85], rotY: -0.5, side: 1 },
  { pos: [-1.05, 0, -1.8], rotY: 0.5, side: -1 },
];

export function buildPerson(o) {
  const g = new THREE.Group();
  const skin = clay(o.skin), hair = clay(o.hair, 0.95), top = clay(o.top), under = clay(o.under), pants = clay(o.pants);
  const dark = flat(0x1a1a1a);
  const up = new THREE.Group(); up.position.y = 0.42; g.add(up);   // standing: upper body raised
  up.add(mesh(rbox(0.66, 0.8, 0.42, 0.17, 6), top, { y: 1.15 }));
  up.add(mesh(rbox(0.18, 0.5, 0.04, 0.02), under, { y: 1.3, z: 0.205 }));
  if (o.hoodie) up.add(mesh(new THREE.TorusGeometry(0.17, 0.06, 10, 20), top, { y: 1.55, z: -0.02, rx: Math.PI / 2 }));
  if (o.scarf) up.add(mesh(new THREE.TorusGeometry(0.15, 0.07, 10, 20), clay(0xe8c45a), { y: 1.56, rx: Math.PI / 2 }));
  up.add(mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.14, 16), skin, { y: 1.6 }));
  const head = new THREE.Group(); head.position.set(0, 1.84, 0.02);
  head.add(mesh(rbox(0.46, 0.5, 0.44, 0.2, 6), skin));
  head.add(mesh(new THREE.SphereGeometry(0.055, 14, 10), skin, { x: -0.24, y: -0.02 }));
  head.add(mesh(new THREE.SphereGeometry(0.055, 14, 10), skin, { x: 0.24, y: -0.02 }));
  head.add(mesh(new THREE.SphereGeometry(0.06, 16, 12), skin, { y: -0.03, z: 0.23 }));
  head.add(mesh(new THREE.SphereGeometry(0.03, 14, 10), dark, { x: -0.1, y: 0.06, z: 0.215 }));
  head.add(mesh(new THREE.SphereGeometry(0.03, 14, 10), dark, { x: 0.1, y: 0.06, z: 0.215 }));
  if (o.glasses) {
    const gm = flat(0x222222);
    for (const s of [-1, 1]) head.add(mesh(new THREE.TorusGeometry(0.06, 0.009, 8, 24), gm, { x: 0.1 * s, y: 0.06, z: 0.232, cast: false }));
    head.add(mesh(rbox(0.08, 0.012, 0.012, 0.004), gm, { y: 0.07, z: 0.232, cast: false }));
  }
  const browL = mesh(rbox(0.1, 0.025, 0.025, 0.01), hair, { x: -0.1, y: 0.15, z: 0.22, rz: 0.1 });
  const browR = mesh(rbox(0.1, 0.025, 0.025, 0.01), hair, { x: 0.1, y: 0.15, z: 0.22, rz: -0.1 });
  head.add(browL, browR);
  const smile = mesh(new THREE.TorusGeometry(0.04, 0.009, 8, 20, Math.PI * 0.8), dark, { y: -0.14, z: 0.222, rz: Math.PI * 1.1 });
  const mouth = mesh(new THREE.CircleGeometry(0.048, 24, Math.PI, Math.PI), flat(0x3a1410), { y: -0.12, z: 0.226, cast: false });
  mouth.visible = false; head.add(smile, mouth);
  // hair styles
  const cap = (r = 0.27) => { const c = mesh(new THREE.SphereGeometry(r, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), hair, { y: 0.17, z: -0.04 }); c.scale.set(0.98, 0.7, 0.98); return c; };
  if (o.style === 'bun') { head.add(cap()); head.add(mesh(new THREE.SphereGeometry(0.11, 16, 12), hair, { y: 0.33, z: -0.16 })); }
  if (o.style === 'long') { head.add(cap(0.28)); head.add(mesh(rbox(0.52, 0.62, 0.14, 0.06), hair, { y: -0.12, z: -0.2 }));
    for (const s of [-1, 1]) head.add(mesh(rbox(0.09, 0.5, 0.2, 0.04), hair, { x: 0.255 * s, y: -0.02, z: -0.14 })); }
  if (o.style === 'short') { head.add(cap(0.26));
    for (let i = 0; i < 6; i++) head.add(mesh(new THREE.SphereGeometry(0.08, 12, 10), hair, { x: -0.16 + i * 0.065, y: 0.3 + (i % 2) * 0.03, z: 0.04 - (i % 3) * 0.09 })); }
  up.add(head);
  for (const s of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(0.37 * s, 1.42, 0);
    arm.add(mesh(capsule(0.085, 0.28), top, { y: -0.2 }));
    const fore = new THREE.Group(); fore.position.y = -0.38;
    fore.add(mesh(capsule(0.08, 0.24), top, { z: 0.16, rx: Math.PI / 2 }));
    fore.add(mesh(new THREE.SphereGeometry(0.075, 14, 10), skin, { z: 0.38 }));
    fore.rotation.x = 1.25; arm.add(fore); arm.rotation.z = 0.1 * s;
    up.add(arm); g.userData['arm' + (s < 0 ? 'L' : 'R')] = arm;
  }
  for (const s of [-1, 1]) {
    g.add(mesh(capsule(0.11, 0.62), pants, { x: 0.15 * s, y: 0.55 }));
    g.add(mesh(rbox(0.17, 0.09, 0.28, 0.04), clay(0x2a2420), { x: 0.15 * s, y: 0.06, z: 0.06 }));
  }
  Object.assign(g.userData, { head, browL, browR, smile, mouth, browY: 0.15 });
  return g;
}
