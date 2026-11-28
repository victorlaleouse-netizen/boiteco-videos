// avatar.js — personnages en blocs (proportions R6), visages dessinés, tenues, chapeaux, accessoires, poses animées et mélangées.
import { THREE, RoundedBoxGeometry, scene, box, cyl, ball, mat, textTex, panel, blobShadow, P, rng, pick, SCREEN, clamp, seg, ss } from './core.js';

// ---------- faces ----------
const faceCache = new Map();
// expressions : smile happy laugh grin smug angry shout sad shock wow shh wink talk flat cry worried sleepy cool
export function faceTex(expr = 'smile', blink = false) {
  const k = expr + (blink ? '_b' : ''); if (faceCache.has(k)) return faceCache.get(k);
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); g.scale(2, 2);
  g.fillStyle = '#111'; g.strokeStyle = '#111'; g.lineCap = 'round'; g.lineJoin = 'round';
  const oval = (x, y, rx, ry, hl = true) => { g.fillStyle = '#111'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); if (hl) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x + rx * .3, y - ry * .38, rx * .32, ry * .26, 0, 0, 7); g.fill(); } g.fillStyle = '#111'; };
  const E = { smile: ['n', 'smile'], happy: ['n', 'grin'], laugh: ['happy', 'grin'], grin: ['n', 'grin'], smug: ['smug', 'smirk'], angry: ['angry', 'shout'], shout: ['n', 'shout'], sad: ['sad', 'sad'],
    shock: ['wide', 'o'], wow: ['ring', 'oBig'], shh: ['closed', 'o'], wink: ['wink', 'grin'], talk: ['n', 'talk'], flat: ['n', 'flat'], cry: ['closed', 'sad'], worried: ['sad', 'wavy'], sleepy: ['closed', 'flat'], cool: ['n', 'smirk'] }[expr] || ['n', 'smile'];
  let eye = blink && !['closed', 'happy'].includes(E[0]) ? 'closed' : E[0];
  g.lineWidth = 7;
  if (eye === 'happy') { g.beginPath(); g.arc(88, 120, 17, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(168, 120, 17, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  else if (eye === 'closed') { g.beginPath(); g.moveTo(72, 116); g.quadraticCurveTo(88, 124, 104, 116); g.moveTo(152, 116); g.quadraticCurveTo(168, 124, 184, 116); g.stroke(); }
  else if (eye === 'angry') { oval(88, 118, 11, 15); oval(168, 118, 11, 15); g.lineWidth = 8; g.beginPath(); g.moveTo(68, 90); g.lineTo(106, 102); g.moveTo(188, 90); g.lineTo(150, 102); g.stroke(); }
  else if (eye === 'sad') { oval(88, 120, 10, 14); oval(168, 120, 10, 14); g.lineWidth = 7; g.beginPath(); g.moveTo(70, 96); g.lineTo(104, 88); g.moveTo(186, 96); g.lineTo(152, 88); g.stroke(); }
  else if (eye === 'smug') { oval(88, 120, 12, 10); oval(168, 120, 12, 10); g.lineWidth = 7; g.beginPath(); g.moveTo(70, 104); g.lineTo(106, 100); g.moveTo(150, 100); g.lineTo(186, 104); g.stroke(); }
  else if (eye === 'wide') { oval(88, 114, 15, 22); oval(168, 114, 15, 22); }
  else if (eye === 'ring') { for (const x of [88, 168]) { g.fillStyle = '#fff'; g.beginPath(); g.arc(x, 114, 22, 0, 7); g.fill(); g.lineWidth = 6; g.stroke(); oval(x, 114, 9, 9, false); } }
  else if (eye === 'wink') { oval(88, 116, 11, 16); g.lineWidth = 7; g.beginPath(); g.moveTo(152, 110); g.lineTo(184, 120); g.lineTo(152, 128); g.stroke(); }
  else { oval(88, 116, 11, 16); oval(168, 116, 11, 16); }
  const m = E[1]; g.lineWidth = 7; g.fillStyle = '#111';
  const tongue = (x, y, rx, ry) => { g.save(); g.clip(); g.fillStyle = '#e8404a'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); g.restore(); };
  if (m === 'smile') { g.beginPath(); g.arc(128, 150, 36, Math.PI * .2, Math.PI * .8); g.stroke(); }
  else if (m === 'grin') { g.beginPath(); g.moveTo(86, 160); g.quadraticCurveTo(128, 162, 170, 160); g.quadraticCurveTo(160, 222, 128, 222); g.quadraticCurveTo(96, 222, 86, 160); g.fill(); tongue(128, 212, 26, 14); }
  else if (m === 'smirk') { g.beginPath(); g.moveTo(98, 176); g.quadraticCurveTo(140, 188, 168, 160); g.stroke(); }
  else if (m === 'shout') { g.beginPath(); g.ellipse(128, 186, 30, 28, 0, 0, 7); g.fill(); tongue(128, 204, 18, 10); }
  else if (m === 'sad') { g.beginPath(); g.arc(128, 214, 34, Math.PI * 1.22, Math.PI * 1.78); g.stroke(); if (expr === 'cry') { g.fillStyle = '#58b6ff'; g.fillRect(80, 126, 10, 46); g.fillRect(162, 126, 10, 46); } }
  else if (m === 'o') { g.beginPath(); g.ellipse(128, 186, 12, 16, 0, 0, 7); g.fill(); }
  else if (m === 'oBig') { g.beginPath(); g.ellipse(128, 190, 20, 26, 0, 0, 7); g.fill(); tongue(128, 206, 14, 8); }
  else if (m === 'talk') { g.beginPath(); g.moveTo(98, 168); g.quadraticCurveTo(128, 210, 158, 168); g.closePath(); g.fill(); }
  else if (m === 'wavy') { g.beginPath(); g.moveTo(100, 184); g.quadraticCurveTo(114, 174, 128, 184); g.quadraticCurveTo(142, 194, 156, 184); g.stroke(); }
  else { g.beginPath(); g.moveTo(104, 182); g.lineTo(152, 182); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; faceCache.set(k, t); return t;
}

// ---------- clothing texture (front of torso): print text, stars, pocket, drawstrings are geometry ----------
function chestTex(o, shirtHex) {
  return textTex(o.print ? (Array.isArray(o.print) ? o.print : [o.print]) : [''], { w: 512, h: 512, bg: shirtHex, fg: o.printColor || '#F5CD30', font: o.printFont || 'Slab', weight: 400, dy: -40,
    size: o.print ? Math.min(150, Math.floor(470 / (Math.max(...[].concat(o.print).map(s => s.length)) * .62))) : 10,
    draw(g, W, H) { if (o.stars) { const r = rng(3); g.fillStyle = o.printColor || '#F5CD30'; for (let i = 0; i < 26; i++) { const x = r() * W, y = r() * H, s = 6 + r() * 8; g.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, rr = k % 2 ? s * .45 : s; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); } }
      if (o.outfit === 'hoodie' || !o.outfit) { g.fillStyle = 'rgba(0,0,0,.10)'; g.fillRect(W * .2, H * .64, W * .6, H * .24); }
      if (o.outfit === 'tee' || o.outfit === 'polo') { g.fillStyle = o.skinHex; g.beginPath(); g.ellipse(W / 2, 0, W * .17, H * .09, 0, 0, 7); g.fill(); }
      if (o.outfit === 'suit') { g.fillStyle = '#f4f4f4'; g.beginPath(); g.moveTo(W * .32, 0); g.lineTo(W * .5, H * .55); g.lineTo(W * .68, 0); g.fill(); g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.moveTo(W * .3, 0); g.lineTo(W * .5, H * .58); g.lineTo(W * .36, 0); g.moveTo(W * .7, 0); g.lineTo(W * .5, H * .58); g.lineTo(W * .64, 0); g.fill(); }
      if (o.outfit === 'dress') { g.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 18; i++) { g.beginPath(); g.arc((i * 97) % W, (i * 173) % H, 10, 0, 7); g.fill(); } } } });
}

// ---------- avatar ----------
// avatar({ skin, outfit:'hoodie'|'tee'|'polo'|'suit'|'dress'|'jacket', shirt, sleeves, pants, shoes, print:'TEXTE'|[l1,l2], printColor, stars,
//          hat:'beanie'|'cap'|'party'|'hair'|'long'|'bun'|'mohawk'|'bald'|'helmet'|'curly'|'headphones'|'crown'|'tophat', hatColor, hairColor, star (étoile sur le bonnet),
//          glasses:true|'sun'|'round', beard:color, tie:color, prop:'megaphone'|'phone'|'sign:TEXTE'|'mug'|'flag:#hex'|'briefcase'|'glass'|'money'|'ball'|'laptop'|'mic'|'croissant'|'cig', scale, face, seed })
let N = 0;
export function avatar(o = {}) {
  const id = N++; const A = new THREE.Group(); const skin = o.skin ?? P.skin; const skinHex = '#' + new THREE.Color(skin).getHexString();
  const shirt = o.shirt ?? P.blue, pants = o.pants ?? P.navy, sleeves = o.sleeves ?? shirt, outfit = o.outfit ?? 'hoodie';
  const shirtHex = '#' + new THREE.Color(shirt).getHexString(); const fab = c => mat(c, { r: .9 });
  const root = new THREE.Group(); A.add(root); // root bobs; A is placed by at()
  blobShadow(A, 2.1);
  const hip = new THREE.Group(); hip.position.y = 2; root.add(hip);
  const leg = (x) => { const g = new THREE.Group(); g.position.set(x, 0, 0); hip.add(g); box(g, .98, 2, 1, fab(outfit === 'dress' ? skin : pants), 0, -1, 0, { round: .08 }); box(g, 1.02, .34, 1.12, o.shoes ?? 0x2a2a2a, 0, -1.84, .05, { round: .12 }); if (outfit === 'dress') box(g, 1, .5, 1.02, fab(shirt), 0, -.25, 0, { round: .08 }); return g; };
  const legL = leg(-.5), legR = leg(.5);
  const torso = new THREE.Group(); torso.position.y = 2; root.add(torso);
  const chestMat = new THREE.MeshStandardMaterial({ map: chestTex({ ...o, outfit, skinHex }, shirtHex), roughness: .9 });
  const tg = new RoundedBoxGeometry(2, 2, 1, 3, .1); const tm = new THREE.Mesh(tg, [fab(shirt), fab(shirt), fab(shirt), fab(shirt), chestMat, fab(shirt)]);
  // RoundedBoxGeometry has no groups by face: add front face as separate plane for the print
  tm.material = fab(shirt); tm.position.y = 1; tm.castShadow = true; tm.receiveShadow = true; torso.add(tm);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(1.84, 1.84), chestMat); front.position.set(0, 1, .505); torso.add(front);
  if (outfit === 'dress') box(torso, 2.3, .9, 1.25, fab(shirt), 0, .05, 0, { round: .15 });
  if (outfit === 'hoodie') { box(torso, 1.7, .75, .55, fab(shirt), 0, 1.75, -.55, { round: .25 }); // hood
    for (const sx of [-.28, .28]) { cyl(torso, .045, .045, .85, o.strings ?? 0xF5CD30, sx, 1.5, .56, { seg: 6 }); box(torso, .12, .2, .12, 0xd8d8d8, sx, 1.02, .56, { round: .03 }); } }
  if (outfit === 'jacket') { box(torso, .12, 1.95, .06, 0x888888, 0, 1, .53, { cast: false }); box(torso, 2.08, .45, 1.1, fab(shirt), 0, 1.85, 0, { round: .15 }); }
  if (outfit === 'polo') { box(torso, .9, .25, .2, fab(sleeves), -.35, 1.9, .45, { rz: -.3 }); box(torso, .9, .25, .2, fab(sleeves), .35, 1.9, .45, { rz: .3 }); }
  if (o.vest) { const vm = mat(o.vest, { r: .45 }); box(torso, 2.07, 1.9, 1.08, vm, 0, 1.03, 0, { round: .12 }); box(torso, .1, 1.86, 1.12, mat(0x999999, { r: .3, m: .5 }), 0, 1.02, 0, { cast: false });
    for (let i = 0; i < 3; i++) box(torso, 2.09, .04, 1.1, mat(new THREE.Color(o.vest).multiplyScalar(.7).getHex()), 0, .55 + i * .5, 0, { cast: false });
    box(torso, 1.3, .3, 1.12, vm, 0, 1.98, 0, { round: .12 }); if (o.vestLogo) { const l = panel(torso, .5, .25, [o.vestLogo], { bg: '#' + new THREE.Color(o.vest).getHexString(), fg: '#ffffff' }); l.position.set(.55, 1.5, .6); } }
  if (o.tie) { box(torso, .32, 1.15, .06, o.tie, 0, 1.25, .54, { cast: false }); box(torso, .4, .3, .08, o.tie, 0, 1.88, .54, { cast: false }); }
  const arm = (x) => { const g = new THREE.Group(); g.position.set(x * 1.0, 1.9, 0); torso.add(g); const short = outfit === 'tee' || outfit === 'polo' || outfit === 'dress';
    box(g, .98, short ? .9 : 1.75, 1, fab(short ? shirt : sleeves), 0, short ? -.35 : -.8, 0, { round: .1 }); if (short) box(g, .94, 1.1, .96, skin, 0, -1.3, 0, { round: .1 });
    box(g, .94, .4, .96, skin, 0, -1.8, 0, { round: .14 }); return g; };
  const armL = arm(-1.5), armR = arm(1.5);
  const head = new THREE.Group(); head.position.y = 2; torso.add(head);
  box(head, .7, .3, .7, skin, 0, .1, 0, { round: .1 }); // neck
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex(o.face || 'smile'), roughness: .6, transparent: true, alphaTest: .05, polygonOffset: true, polygonOffsetFactor: -2 });
  const hg = new RoundedBoxGeometry(1.5, 1.4, 1.42, 6, .5); const hm = new THREE.Mesh(hg, mat(skin, { r: .55 })); hm.position.y = .9; hm.castShadow = true; head.add(hm);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 1.12), faceMat); face.position.set(0, .88, .715); head.add(face);
  const hc = o.hatColor ?? o.hairColor ?? P.brown; const Hh = o.hat; const hm2 = mat(hc, { r: .85 });
  if (Hh === 'beanie') { box(head, 1.62, .85, 1.56, hm2, 0, 1.55, -.02, { round: .38, seg: 5 }); box(head, 1.66, .34, 1.6, hm2, 0, 1.25, -.02, { round: .15 }); if (o.star !== false) { const s = new THREE.Shape(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 + Math.PI / 2, rr = k % 2 ? .09 : .21; s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } const m = new THREE.Mesh(new THREE.ShapeGeometry(s), mat(0xF5CD30, { e: 0x4a3a00, ei: .3 })); m.position.set(0, 1.55, .78); head.add(m); } }
  else if (Hh === 'cap') { box(head, 1.58, .55, 1.5, hm2, 0, 1.6, 0, { round: .25 }); box(head, 1.3, .1, .9, hm2, 0, 1.38, .95, { round: .04 }); }
  else if (Hh === 'party') { if (o.hairColor) box(head, 1.56, .4, 1.48, mat(o.hairColor), 0, 1.6, -.02, { round: .18 }); const c = new THREE.Mesh(new THREE.ConeGeometry(.5, 1.3, 20), mat(hc)); c.position.set(.12, 2.3, 0); c.rotation.z = -.15; c.castShadow = true; head.add(c);
    for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(.42 - i * .12, .045, 6, 20), mat(0xffffff)); r.rotation.x = Math.PI / 2; r.position.set(.12 - (i * .08), 1.9 + i * .35, 0); head.add(r); } ball(head, .17, 0xffffff, .26, 2.98, 0); }
  else if (Hh === 'hair') { box(head, 1.56, .34, 1.48, hm2, 0, 1.62, -.02, { round: .15 }); box(head, 1.56, .8, .3, hm2, 0, 1.3, -.6, { round: .12 }); box(head, .95, .26, .34, hm2, -.25, 1.5, .6, { round: .1, rz: .12 }); box(head, .2, .45, 1.1, hm2, -.76, 1.3, -.1, { round: .08 }); box(head, .2, .45, 1.1, hm2, .76, 1.3, -.1, { round: .08 }); }
  else if (Hh === 'curly') { for (let i = 0; i < 12; i++) ball(head, .36, hm2, Math.cos(i * 1.7) * .55, 1.55 + (i % 3) * .14, Math.sin(i * 1.7) * .5 - .1, { ico: 1 }); }
  else if (Hh === 'long') { box(head, 1.62, .48, 1.52, hm2, 0, 1.6, -.02, { round: .2 }); box(head, 1.66, 2.2, .45, hm2, 0, .65, -.6, { round: .15 }); box(head, .32, 1.7, 1.2, hm2, -.78, .85, -.05, { round: .12 }); box(head, .32, 1.7, 1.2, hm2, .78, .85, -.05, { round: .12 }); }
  else if (Hh === 'bun') { box(head, 1.58, .45, 1.5, hm2, 0, 1.6, -.02, { round: .2 }); ball(head, .42, hm2, 0, 2.05, -.3); }
  else if (Hh === 'mohawk') { box(head, .36, .9, 1.3, hm2, 0, 1.95, 0, { round: .12 }); }
  else if (Hh === 'helmet') { const s = new THREE.Mesh(new THREE.SphereGeometry(.9, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), hm2); s.position.y = 1.35; head.add(s); }
  else if (Hh === 'headphones') { box(head, 1.58, .45, 1.5, mat(o.hairColor ?? P.brown), 0, 1.6, -.02, { round: .2 }); box(head, 1.9, .2, .3, 0x222222, 0, 1.95, 0, { round: .08 }); box(head, .3, .7, .7, 0x222222, -.85, 1, 0, { round: .12 }); box(head, .3, .7, .7, 0x222222, .85, 1, 0, { round: .12 }); }
  else if (Hh === 'tophat') { cyl(head, .55, .55, 1.1, hm2, 0, 2.15, 0, { seg: 20 }); cyl(head, .95, .95, .08, hm2, 0, 1.62, 0, { seg: 20 }); cyl(head, .57, .57, .2, 0xd04070, 0, 1.75, 0, { seg: 20 }); }
  else if (Hh === 'crown') { cyl(head, .7, .7, .5, mat(0xf5cd30, { r: .3, m: .5 }), 0, 1.85, 0, { seg: 8 }); }
  if (o.glasses) { const gm = mat(0x1a1a1a, { r: .3 }); if (o.glasses === 'sun') { box(head, .62, .34, .08, gm, -.32, .98, .74, { cast: false }); box(head, .62, .34, .08, gm, .32, .98, .74, { cast: false }); }
    else { for (const sx of [-.33, .33]) { box(head, .56, .44, .06, gm, sx, .98, .73, { cast: false }); box(head, .44, .32, .07, mat(0xe8f4ff, { t: .12, r: .1 }), sx, .98, .74, { cast: false }); } } box(head, .16, .07, .07, gm, 0, 1.02, .74, { cast: false }); }
  if (o.beard) { box(head, 1.36, .32, .2, o.beard, 0, .3, .66, { round: .08 }); }
  // props in the right hand
  const hand = new THREE.Group(); hand.position.set(0, -1.85, 0); armR.add(hand);
  const pr = o.prop || ''; const propObj = new THREE.Group(); hand.add(propObj);
  if (pr === 'megaphone') { const m = new THREE.Mesh(new THREE.CylinderGeometry(.16, .55, 1.2, 20, 1, true), new THREE.MeshStandardMaterial({ color: P.white, side: THREE.DoubleSide, roughness: .4 })); m.rotation.x = Math.PI / 2; m.position.set(0, -.1, .7); m.castShadow = true; propObj.add(m); box(propObj, .3, .3, .3, P.red, 0, -.1, .05); }
  else if (pr === 'phone') { box(propObj, .6, 1, .1, 0x222222, 0, .15, .5, { round: .05 }); box(propObj, .5, .85, .02, SCREEN, 0, .15, .44, { cast: false }); }
  else if (pr === 'mug') { box(propObj, .55, .65, .55, P.white, 0, 0, .5, { round: .08 }); }
  else if (pr === 'glass') { const g = new THREE.Mesh(new THREE.CylinderGeometry(.24, .17, .7, 16), new THREE.MeshStandardMaterial({ color: 0xffd37a, transparent: true, opacity: .85, roughness: .1 })); g.position.set(0, 0, .5); propObj.add(g); }
  else if (pr === 'briefcase') { box(propObj, 1, .8, .35, P.brown, 0, -.6, 0, { round: .06 }); }
  else if (pr === 'money') { for (let i = 0; i < 4; i++) box(propObj, .9, .08, .45, 0x7bc96f, 0, -.1 + i * .09, .5); }
  else if (pr === 'ball') { ball(propObj, .55, mat(0xd9772b, { r: .7 }), 0, -.6, .3); }
  else if (pr === 'laptop') { box(propObj, 1.6, .08, 1.1, 0xbfc3c8, 0, -.05, .5); box(propObj, 1.6, 1.0, .06, 0xbfc3c8, 0, .45, -.02, { rx: -.2 }); box(propObj, 1.45, .85, .02, SCREEN, 0, .45, .02, { cast: false, rx: -.2 }); }
  else if (pr === 'mic') { box(propObj, .22, .8, .22, 0x222222, 0, 0, .4, { round: .06 }); ball(propObj, .24, 0x555555, 0, .5, .4); }
  else if (pr === 'croissant') { const t = new THREE.Mesh(new THREE.TorusGeometry(.35, .18, 8, 16, Math.PI * 1.2), mat(0xd99a40)); t.position.set(0, 0, .5); t.rotation.z = -.9; propObj.add(t); }
  else if (pr.startsWith('flag:')) { box(propObj, .08, 2.6, .08, P.grey, 0, 1.1, .2); const f = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .9), new THREE.MeshStandardMaterial({ color: pr.slice(5), side: THREE.DoubleSide })); f.position.set(.72, 2, .2); propObj.add(f); }
  else if (pr.startsWith('sign')) { const txt = pr.split(':').slice(1).join(':').split('|'); box(propObj, .12, 2.4, .12, P.brown, 0, .9, .2); const s = panel(propObj, 2.4, 1.3, txt, { bg: '#ffffff', fg: '#111111', border: '#111111' }); s.position.set(0, 2.5, .28); box(propObj, 2.5, 1.4, .08, P.white, 0, 2.5, .22); }
  A.scale.setScalar(o.scale || 1);
  scene.add(A);
  A.traverse(m => { if (m.isMesh) m.userData.dyn = true; });
  let curFace = o.face || 'smile', curBlink = false; const blinkOff = (id * 1.37) % 3.1;
  const av = { g: A, root, hip, torso, head, armL, armR, legL, legR, face: faceMat, propObj, id,
    setFace(e, t) { curFace = e; const b = t !== undefined && ((t + blinkOff) % 3.4) < .12 && !['shh', 'cry', 'laugh', 'sleepy'].includes(e); if (faceMat.map !== faceTex(e, b)) { faceMat.map = faceTex(e, b); faceMat.needsUpdate = true; } return av; },
    at(x, z, ry = 0) { A.position.set(x, 0, z); A.rotation.y = ry; return av; },
    lookAt(x, z) { A.rotation.y = Math.atan2(x - A.position.x, z - A.position.z); return av; },
    sitY: -.1, // seat height offset when sitting (0 ≈ chair/sofa, +.5 ≈ bed)
    // pose(name | [[t0,name],[t1,name],...], t, k)  — a list blends from one pose to the next over 0.3 s
    pose(name, t = 0, k = 1) {
      let p; if (Array.isArray(name)) { let i = 0; for (let j = 0; j < name.length; j++) if (t >= name[j][0]) i = j; const cur = POSE(name[i][1], t, id); if (i > 0 && t - name[i][0] < .3) { const prev = POSE(name[i - 1][1], t, id); p = mix(prev, cur, ss((t - name[i][0]) / .3)); } else p = cur; }
      else p = POSE(name, t, id);
      armL.rotation.set(p.aL * k, p.aLy * k, p.aLz * k); armR.rotation.set(p.aR * k, p.aRy * k, p.aRz * k); legL.rotation.set(p.lL * k, 0, p.lLz * k); legR.rotation.set(p.lR * k, 0, p.lRz * k);
      head.rotation.set(p.hr * k, p.hy * k, p.hz * k); torso.rotation.set(p.tr * k, p.ty * k, p.tz * k); root.position.y = p.y * k + (p.sit ? (av.sitY ?? -.1) : 0); root.position.z = p.sitZ || 0;
      torso.scale.y = 1 + p.br; return av;
    },
    hide(v = true) { A.visible = !v; return av; },
  };
  return av;
}
const Z = () => ({ aL: 0, aR: 0, aLy: 0, aRy: 0, aLz: 0, aRz: 0, lL: 0, lR: 0, lLz: 0, lRz: 0, hr: 0, hy: 0, hz: 0, tr: 0, ty: 0, tz: 0, y: 0, sit: 0, sitZ: 0, br: 0 });
function mix(a, b, k) { const o = {}; for (const key in a) o[key] = a[key] + (b[key] - a[key]) * k; return o; }
// poses: idle talk wave point armsUp cheer shrug cross walk run sit sitTalk shout phone facepalm jump dance freeze clap laugh think angry cry typing present flex drink dribble lean scared proud sleep
function POSE(name, t, id) {
  const s = Math.sin, p = Z(); const o = id * .77; p.br = s(t * 2.2 + o) * .012;
  // idle life: tiny sway + look-around
  const idle = () => { p.aL = .06 * s(t * 1.7 + o); p.aR = -.06 * s(t * 1.7 + o); p.aLz = -.06; p.aRz = .06; p.hy = .12 * s(t * .7 + o); p.hz = .03 * s(t * .9 + o); p.tz = .02 * s(t * 1.1 + o); };
  switch (name) {
    case 'talk': idle(); p.aR = -.7 - .3 * s(t * 6 + o); p.aRz = .25; p.aRy = -.3; p.aL = -.3 - .15 * s(t * 5 + 1); p.aLz = -.15; p.hr = .06 * s(t * 5); p.hy = .1 * s(t * 1.3); break;
    case 'wave': idle(); p.aR = -2.7; p.aRz = .3 + .4 * s(t * 11); p.hz = -.08; break;
    case 'point': idle(); p.aR = -1.6; p.aRz = 0; p.aRy = 0; p.hr = -.05; p.tz = -.04; break;
    case 'present': idle(); p.aR = -1.2; p.aRz = .9; p.aL = -.2; p.hy = .3; break;
    case 'armsUp': p.aL = -2.9; p.aR = -2.9; p.aLz = -.3; p.aRz = .3; p.y = Math.abs(s(t * 8 + o)) * .25; p.hr = -.15; break;
    case 'cheer': p.aL = -2.8 + .25 * s(t * 12); p.aR = -2.8 - .25 * s(t * 12); p.aLz = -.35; p.aRz = .35; p.y = Math.max(0, s(t * 7 + o)) * .9; p.hr = -.15; break;
    case 'shrug': idle(); p.aL = -.5; p.aR = -.5; p.aLz = -.7; p.aRz = .7; p.hz = .15; p.hr = .05; break;
    case 'cross': idle(); p.aL = -1.25; p.aR = -1.25; p.aLz = .95; p.aRz = -.95; p.aLy = .2; p.aRy = -.2; p.hr = -.08; break;
    case 'proud': p.aL = -.4; p.aR = -.4; p.aLz = -.9; p.aRz = .9; p.aLy = .9; p.aRy = -.9; p.hr = -.18; p.tr = -.06; p.hy = .08 * s(t); break;
    case 'walk': { const f = t * 7 + o; p.lL = .6 * s(f); p.lR = -p.lL; p.aL = -p.lL * .9; p.aR = p.lL * .9; p.y = Math.abs(s(f)) * .12; p.tz = .03 * s(f); p.hy = .05 * s(f * .5); break; }
    case 'run': { const f = t * 12 + o; p.lL = 1 * s(f); p.lR = -p.lL; p.aL = -p.lL * 1.1; p.aR = p.lL * 1.1; p.y = Math.abs(s(f)) * .3; p.tr = .15; break; }
    case 'sit': idle(); p.lL = -1.55; p.lR = -1.55; p.sit = -1.15; p.sitZ = .2; p.aL = -.6; p.aR = -.6; p.aLz = -.05; p.aRz = .05; break;
    case 'sitTalk': idle(); p.lL = -1.55; p.lR = -1.55; p.sit = -1.15; p.sitZ = .2; p.aR = -.9 - .3 * s(t * 6); p.aRz = .25; p.aL = -.6; p.hr = .06 * s(t * 5); break;
    case 'shout': p.aR = -2.3; p.aRz = .15; p.aL = -.35 - .2 * s(t * 9); p.aLz = -.2; p.hr = -.15; p.y = Math.abs(s(t * 10)) * .06; p.tr = -.05; break;
    case 'angry': p.aL = -.25; p.aR = -.25; p.aLz = -.35 + .08 * s(t * 30); p.aRz = .35 - .08 * s(t * 30); p.tr = .1; p.hr = .12; p.y = Math.abs(s(t * 14)) * .05; break;
    case 'phone': idle(); p.aR = -1.35; p.aRz = -.45; p.aRy = .3; p.hr = .25; p.hy = 0; p.aL = -.2; break;
    case 'typing': p.aL = -1.25 + .08 * s(t * 20); p.aR = -1.25 + .08 * s(t * 23 + 1); p.aLz = .25; p.aRz = -.25; p.hr = .15; break;
    case 'facepalm': p.aR = -2.55; p.aRz = -.8; p.aRy = .2; p.hr = .3; p.tr = .1; p.aL = -.1; break;
    case 'cry': p.aR = -2.4; p.aRz = -.85; p.aL = -2.4; p.aLz = .85; p.hr = .3; p.tr = .12; p.y = Math.abs(s(t * 9)) * .05; break;
    case 'jump': p.y = Math.max(0, s(t * 6 + o)) * 1.3; p.aL = -2.7; p.aR = -2.7; p.aLz = -.4; p.aRz = .4; p.lL = -.35; p.lR = .35; break;
    case 'dance': p.aL = -1.5 + s(t * 9 + o) * 1.2; p.aR = -1.5 - s(t * 9 + o) * 1.2; p.aLz = -.4; p.aRz = .4; p.hy = s(t * 4.5) * .35; p.ty = s(t * 4.5) * .2; p.y = Math.abs(s(t * 9 + o)) * .25; p.lL = .2 * s(t * 9); p.lR = -p.lL; break;
    case 'clap': idle(); { const c = Math.abs(s(t * 9 + o)); p.aL = -1.3; p.aR = -1.3; p.aLz = .55 * c + .2; p.aRz = -.55 * c - .2; p.y = c * .05; } break;
    case 'laugh': { const c = s(t * 14 + o); p.aL = -.6; p.aR = -.6; p.aLz = .55; p.aRz = -.55; p.tr = -.18 + .05 * c; p.hr = -.3 + .06 * c; p.y = Math.abs(c) * .05; break; }
    case 'think': idle(); p.aR = -2.2; p.aRz = -.55; p.aRy = .3; p.aL = -1.1; p.aLz = .7; p.hr = -.1; p.hz = .12; p.hy = .2; break;
    case 'flex': p.aL = -1.6; p.aR = -1.6; p.aLz = -1.3 + .1 * s(t * 8); p.aRz = 1.3 - .1 * s(t * 8); p.hr = -.15; p.tr = -.05; break;
    case 'drink': idle(); p.aR = -2.3; p.aRz = -.4; p.hr = -.3; break;
    case 'dribble': { const b = Math.abs(s(t * 7 + o)); idle(); p.aR = -.7 + b * .4; p.aRz = .1; p.lL = .15; p.lR = -.15; p.tr = .1; p.y = -.1; break; }
    case 'lean': idle(); p.tz = .12; p.hz = -.1; p.aL = -.2; p.aLz = -.4; p.aRz = .25; p.lLz = -.1; break;
    case 'scared': p.aL = -1.9; p.aR = -1.9; p.aLz = .6 + .06 * s(t * 40); p.aRz = -.6 - .06 * s(t * 40); p.tr = -.1; p.hr = -.05; p.y = Math.abs(s(t * 30)) * .03; break;
    case 'sleep': p.hr = .45; p.hz = .2; p.aL = -.2; p.aR = -.2; p.br = s(t * 1.5) * .03; break;
    case 'freeze': break;
    default: idle();
  }
  return p;
}
// handy crowd of extras (neighbours, students, colleagues). o: { hats, props, face, scale, ry, pose, seed, outfits }
export function crowd(n, x0, z0, spread = 2.6, o = {}) {
  const r = rng(o.seed ?? 21);
  const shirts = [0x2457c9, 0xe05a4a, 0x4fae6a, 0xf5cd30, 0xb58ad8, 0xff8a5a, 0x3ab0c0, 0xf2f2f2, 0xd96aa0, 0x6a8a3a];
  const pants = [0x2a3550, 0x3a3a3a, 0x6c5a44, 0x4a6aa0, 0x222222];
  const hats = ['hair', 'cap', 'party', 'long', 'beanie', 'curly', 'bun', 'hair', 'bald'];
  const skins = [P.skin, P.skin2, P.skin3, P.skin, P.skin4];
  const out = []; for (let i = 0; i < n; i++) out.push(avatar({ outfit: o.outfits ? o.outfits[i % o.outfits.length] : pick(r, ['hoodie', 'tee', 'tee', 'polo', 'jacket']), shirt: pick(r, shirts), pants: pick(r, pants), hat: o.hats ? o.hats[i % o.hats.length] : pick(r, hats), hatColor: pick(r, [P.brown, 0x222222, 0xF5CD30, 0xd04040, 0xd98a3a, 0x6fc3ff]), hairColor: pick(r, [0x4a3020, 0x222222, 0xd9a040]), skin: pick(r, skins), face: o.face || pick(r, ['happy', 'smile', 'laugh', 'talk', 'grin']), scale: o.scale || .92, prop: o.props ? o.props[i % o.props.length] : '', star: false })
    .at(x0 + (i - (n - 1) / 2) * spread + (r() - .5) * .6, z0 + (r() - .5) * 1.6, (o.ry ?? 0) + (r() - .5) * .5));
  return out;
}
