// film.js — caméra (cadrages, mouvements, caméra à l'épaule), surcouche SVG (titre, sous-titres, cartes, tampons, gimmick) et boucle du film.
import { THREE, cam, scene, R, V, clamp, seg, ss, eo, eio, lerp, renderFrame, setShadowFocus, bake, LAMPS, CUR_MOOD, MOODS, sky, BOUNDS } from './core.js';

// ---------- camera ----------
// Portrait 9:16 : c'est la largeur qui limite. Les cadrages sont définis par la largeur de champ au niveau du sujet.
const WIDTH = { xclose: 1.9, close: 2.7, medium: 4.4, mid: 4.4, cowboy: 5.6, full: 7.2, wide: 13, xwide: 24 };
const AIM = { xclose: 4.95, close: 4.8, medium: 4.2, mid: 4.2, cowboy: 3.7, full: 2.9, wide: 2.6, xwide: 2.4 };
let HAND = .05; export function handheld(a) { HAND = a; }
let lastLook = new THREE.Vector3();
function hfovTan(fov) { return Math.tan(THREE.MathUtils.degToRad(fov) / 2) * cam.aspect; }
// frame(av | {x,z,ry,s}, kind, { yaw (rad, 0 = de face), side (-1..1 ≈ ±40°), h:'low'|'eye'|'high'|'top'|number, fov, dist (×), dx, dy (décalage visée) })
// → [positionCaméra, pointVisé]
export function frame(av, kind = 'mid', o = {}) {
  const g = av.g ? av.g : null; const px = g ? g.position.x : av.x, pz = g ? g.position.z : av.z, ry = g ? g.rotation.y : (av.ry || 0), s = g ? g.scale.x : (av.s || 1);
  const fov = o.fov ?? 50; const wv = (WIDTH[kind] ?? 4.4) * s * (o.dist ?? 1); const d = (wv / 2) / hfovTan(fov);
  const yaw = ry + (o.yaw ?? (o.side ?? 0) * .7); const aim = (AIM[kind] ?? 4) * s + (o.dy ?? 0);
  const hh = o.h ?? 'eye'; const camY = typeof hh === 'number' ? hh : hh === 'low' ? aim - d * .32 : hh === 'high' ? aim + d * .45 : hh === 'top' ? aim + d * 1.4 : aim + d * .06;
  const look = V(px + (o.dx ?? 0) * Math.cos(ry), aim, pz - (o.dx ?? 0) * Math.sin(ry));
  const pos = V(px + Math.sin(yaw) * d, Math.max(.6, camY), pz + Math.cos(yaw) * d);
  pos.userData = { fov }; return [pos, look, fov];
}
// pair of frames between two points (midpoint of two avatars) — o same as frame()
export function frame2(a, b, kind = 'full', o = {}) { const ga = a.g.position, gb = b.g.position; const mid = { x: (ga.x + gb.x) / 2, z: (ga.z + gb.z) / 2, ry: o.ry ?? 0 }; const span = Math.hypot(ga.x - gb.x, ga.z - gb.z); return frame(mid, kind, { ...o, dist: (o.dist ?? 1) * Math.max(1, (span + 3.5) / (WIDTH[kind] ?? 7)) }); }
function applyHand(t) { if (!HAND) return; const n = (f, p) => Math.sin(t * f + p) * .6 + Math.sin(t * f * 2.3 + p * 1.7) * .4; cam.position.x += n(1.3, 0) * HAND; cam.position.y += n(1.7, 2) * HAND * .8; cam.rotation.z += n(.9, 4) * HAND * .04; }
// shot(from, to, lookA, lookB, k, fov) — straight move between two framings with easing
export function shot(from, to, lookA, lookB, k, fov) {
  fov = fov ?? (from.userData?.fov) ?? 50; cam.fov = fov; cam.updateProjectionMatrix(); const e = eio(clamp(k, 0, 1));
  cam.position.lerpVectors(from, to, e); const l = new THREE.Vector3().lerpVectors(lookA, lookB || lookA, e); cam.lookAt(l); lastLook.copy(l);
}
// move(av, kindA, kindB, k, oA, oB) — from one framing to another (push-in, pull-out, orbit, crane…)
export function move(av, kindA, kindB, k, oA = {}, oB = oA) { const [p1, l1, f1] = frame(av, kindA, oA); const [p2, l2, f2] = frame(av, kindB, oB); cam.fov = lerp(f1, f2, eio(clamp(k, 0, 1))); cam.updateProjectionMatrix();
  const e = eio(clamp(k, 0, 1)); cam.position.lerpVectors(p1, p2, e); const l = l1.clone().lerp(l2, e); cam.lookAt(l); lastLook.copy(l); }
export const push = (av, kind, k, o = {}) => move(av, kind, kind, k, { ...o, dist: (o.dist ?? 1) * 1.22 }, { ...o, dist: (o.dist ?? 1) * .95 });
export const pull = (av, kind, k, o = {}) => move(av, kind, kind, k, { ...o, dist: (o.dist ?? 1) * .9 }, { ...o, dist: (o.dist ?? 1) * 1.2 });
export const orbit = (av, kind, yaw0, yaw1, k, o = {}) => move(av, kind, kind, k, { ...o, yaw: yaw0 }, { ...o, yaw: yaw1 });
export const crane = (av, kind, h0, h1, k, o = {}) => move(av, kind, kind, k, { ...o, h: h0 }, { ...o, h: h1 });
// drone(p0,p1,l0,l1,k,fov) — aerial move over the set (same as shot but no handheld)
export function drone(p0, p1, l0, l1, k, fov = 55) { shot(p0, p1, l0, l1, k, fov); NOHAND = true; }
let NOHAND = false; export function still() { NOHAND = true; }
// pick one of several shots by time: cuts([[t0, fn], [t1, fn] ...], lt) → calls the active fn(lt - t0, k) — hard cuts inside a scene
export function cuts(list, lt, dur) { let i = 0; for (let j = 0; j < list.length; j++) if (lt >= list[j][0]) i = j; const a = list[i][0], b = i + 1 < list.length ? list[i + 1][0] : (dur ?? a + 4); return list[i][1](lt - a, clamp((lt - a) / Math.max(.01, b - a), 0, 1)); }

// keep the camera inside the room its target is in; when it has to come closer, the lens widens to keep the framing
function clampCam() {
  const l = lastLook; const b = BOUNDS.find(b => l.x > b.x0 && l.x < b.x1 && l.z > b.z0 && l.z < b.z1); if (!b) return;
  const m = .7, p = cam.position; const inside = q => q.x > b.x0 + m && q.x < b.x1 - m && q.z > b.z0 + m && q.z < b.z1 - m && q.y < b.h - m && q.y > .4;
  if (inside(p)) return; const d0 = p.distanceTo(l); let lo = 0, hi = 1; for (let i = 0; i < 18; i++) { const k = (lo + hi) / 2; inside(l.clone().lerp(p, k)) ? lo = k : hi = k; }
  const np = l.clone().lerp(p, lo); const d1 = np.distanceTo(l); p.copy(np);
  const f = Math.min(100, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * d0 / Math.max(.5, d1)))); cam.fov = f; cam.updateProjectionMatrix(); cam.lookAt(l);
}

// ---------- overlay (SVG over the canvas) ----------
const ov = document.getElementById('ov');
export const C = { white: '#FFFFFF', yellow: '#F5CD30', red: '#E5322D', ink: '#111111', panel: '#20242E', green: '#2FA84A' };
const backE = x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export function svgText(s, x, y, size, col, o = {}) { return `<text x="${x}" y="${y}" font-family="${o.f || 'Jost'}" font-weight="${o.wt || 800}" font-size="${size}" fill="${col}" text-anchor="${o.a || 'middle'}" stroke="${o.stroke || C.ink}" stroke-width="${o.sw ?? size * .2}" stroke-linejoin="round" paint-order="stroke" ${o.extra || ''}>${s}</text>`; }
export function stamp(t, t0, x, y, txt, col = C.red, rot = -8, size = 70) { if (t < t0) return ''; const k = seg(t, t0, t0 + .12), s = 1.6 - .6 * eo(k); const w = Math.max(280, txt.length * size * .66 + 60);
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s.toFixed(3)})" opacity="${(.4 + .6 * k).toFixed(2)}"><rect x="${-w / 2}" y="${-size * .95}" width="${w}" height="${size * 1.75}" rx="16" fill="#fff" fill-opacity=".92" stroke="${col}" stroke-width="12"/>${svgText(txt, 0, size * .33, size, col, { f: 'Slab', wt: 400, sw: 0 })}</g>`; }
export function ageBadge(t, t0, x, y, n, label = 'ANS') { if (t < t0) return ''; const s = backE(seg(t, t0, t0 + .25)); return `<g transform="translate(${x} ${y}) scale(${s.toFixed(3)})"><rect x="-95" y="-85" width="190" height="160" rx="24" fill="${C.panel}" stroke="${C.ink}" stroke-width="6"/>${svgText(String(n), 0, 18, 92, C.yellow, { f: 'Slab', wt: 400, sw: 0 })}${svgText(label, 0, 60, 32, C.white, { sw: 0 })}</g>`; }
export function card(t, t0, x, y, w, lines, o = {}) { if (t < t0) return ''; const s = backE(seg(t, t0, t0 + .25)); const h = 40 + lines.length * 62; return `<g transform="translate(${x} ${y}) scale(${s.toFixed(3)})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="22" fill="${o.bg || '#fff'}" stroke="${C.ink}" stroke-width="6"/>${lines.map((l, i) => svgText(l, 0, -h / 2 + 70 + i * 62, i ? 42 : 50, i ? '#333' : (o.fg || C.ink), { sw: 0, wt: i ? 600 : 800 })).join('')}</g>`; }
function titleBanner() { const L = window.EP_TITLE; if (!L) return ''; const y = 272, h = L.length > 1 ? 176 : 104; const s2 = L[1] ? Math.min(66, Math.floor(800 / (L[1].length * .72))) : 0, s1 = Math.min(52, Math.floor(820 / (L[0].length * .58)));
  return `<rect x="100" y="${y}" width="880" height="${h}" rx="26" fill="${C.panel}" stroke="${C.ink}" stroke-width="6"/>${svgText(L[0], 540, y + 66, s1, C.white, { sw: 0 })}${L[1] ? svgText(L[1], 540, y + 142, s2, C.yellow, { f: 'Slab', wt: 400, sw: 0 }) : ''}`; }
function captions(t) { let c = null; for (const k of TL.caps) if (t >= k.t0 && t < k.t1) c = k; if (!c) return ''; const s = backE(seg(t, c.t0, c.t0 + .16)); const nch = c.w.reduce((a, [w]) => a + w.length + 1, 0); const size = Math.min(86, Math.floor(820 / (nch * .6)));
  const parts = c.w.map(([w, h]) => `<tspan fill="${h === 2 ? C.red : (h ? C.yellow : C.white)}">${w} </tspan>`).join('');
  return `<g transform="translate(490 1270) scale(${(.85 + .15 * s).toFixed(3)})"><text x="0" y="0" font-family="Jost" font-weight="800" font-size="${size}" text-anchor="middle" stroke="${C.ink}" stroke-width="20" stroke-linejoin="round" paint-order="stroke">${parts}</text></g>`; }
// the series gimmick: every « chut chut chut » in the voice → giant slammed text + freeze + flash
export const GIMMICKS = (() => { const ts = ((window.TL && TL.words['chut']) || []).slice().sort((a, b) => a - b); const out = []; for (const x of ts) if (!out.length || x - out[out.length - 1] > 1.6) out.push(x); return out; })();
export function inGimmick(t) { for (const g of GIMMICKS) if (t >= g - .05 && t < g + 1.35) return g; return null; }
function gimmick(t) { const g = inGimmick(t); if (g === null) return ''; const k = t - g; const s = k < .1 ? 1.8 - 8 * k : 1 + .03 * Math.sin(k * 40); const flash = k < .08 ? `<rect width="1080" height="1920" fill="#fff" opacity="${(.7 - k * 8).toFixed(2)}"/>` : '';
  const n = Math.min(3, 1 + Math.floor(k / .28));
  return flash + `<g transform="translate(490 860) rotate(-7) scale(${s.toFixed(3)})">${['CHUT', 'CHUT', 'CHUT !'].slice(0, n).map((w, i) => svgText(w, 0, -150 + i * 150, 150, i === 2 ? C.red : C.white, { f: 'Slab', wt: 400, sw: 22 })).join('')}</g>`; }

// ---------- film loop ----------
// start({ scenes: {name(t, lt, realT) → svg}, moods: {name: 'day'|'golden'|'dusk'|'night'|'interior'}, punch: true })
export function start({ scenes, moods = {}, punch = true }) {
  bake();
  const ORDER = TL.scenes.map(s => s[0]);
  const sceneAt = t => { for (const s of TL.scenes) if (t >= s[1] && t < s[2]) return s; return TL.scenes[TL.scenes.length - 1]; };
  window.DUR = TL.dur;
  window.render = function (t) {
    const g = inGimmick(t); const tt = g !== null ? g : t; const [n, a, b] = sceneAt(tt); // the world freezes during the gimmick
    sky(moods[n] || moods.default || 'day');
    NOHAND = false; cam.rotation.z = 0;
    const extra = scenes[n](tt, tt - a, t) || '';
    clampCam(); if (!NOHAND) applyHand(t);
    // cut punch: tiny zoom settle on each new scene
    if (punch && g === null && t - a < .25 && a > 0) { cam.fov *= 1 - .06 * (1 - eo((t - a) / .25)); cam.updateProjectionMatrix(); }
    if (g !== null) { const k = t - g; cam.fov = Math.max(18, cam.fov * (1 - .3 * eo(Math.min(1, k / .25)))); cam.updateProjectionMatrix(); cam.position.x += Math.sin(t * 90) * .05 * Math.max(0, 1 - k * 2); }
    setShadowFocus(lastLook, 26);
    const dark = (MOODS[CUR_MOOD] || MOODS.day)[12]; for (const l of LAMPS) l.visible = (dark > .3 || CUR_MOOD === 'interior') && l.position.distanceTo(cam.position) < 55;
    renderFrame(t);
    ov.innerHTML = `<svg viewBox="0 0 1080 1920" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">${extra}${titleBanner()}${gimmick(t)}${captions(t)}</svg>`;
  };
  window.TEXTS = function (t) { let c = null; for (const k of TL.caps) if (t >= k.t0 && t < k.t1) c = k; return c ? [{ id: 'cap', text: c.w.map(x => x[0]).join(' '), x0: 70, y0: 1180, x1: 910, y1: 1300 }] : []; };
  document.fonts.ready.then(() => { window.READY = true; });
  if (!/HeadlessChrome/.test(navigator.userAgent)) { const t0 = performance.now(); (function loop() { window.render(((performance.now() - t0) / 1000) % TL.dur); requestAnimationFrame(loop); })(); }
}
