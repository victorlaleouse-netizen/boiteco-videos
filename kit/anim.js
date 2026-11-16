// Episode animator: deterministic renderFrame(i) for a timeline produced by prepare.py
import * as THREE from 'three';
import { buildWorld } from './scene.js';

const W = 1080, H = 1920;
const COL = { claude: '#f2701e', boss: '#e0a93a' };
const SUB = { claude: '#ffa24f', boss: '#ffffff', sandrine: '#8fe3d0', leo: '#a9c8ff', claire: '#ffc2d1' };
const NAME = { claude: 'CLAUDE', boss: 'LE PATRON' };

const SHOTS = {
  wide: { pos: [-0.2, 3.1, 6.3], look: [0, 1.6, -0.4] },
  bot:  { pos: [-0.4, 2.35, 4.0], look: [-0.35, 1.8, -0.2] },
  boss: { pos: [0.3, 2.65, 3.4], look: [0.5, 1.95, -0.9] },
  holo: { pos: [-0.1, 2.55, 3.9], look: [-0.05, 2.15, -0.5] },
};

const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOutBack = (x) => { x = clamp01(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const easeOutExpo = (x) => (x >= 1 ? 1 : x <= 0 ? 0 : 1 - Math.pow(2, -10 * x));
const easeInOutCubic = (x) => { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const noise1 = (t, s = 0) => Math.sin(t * 1.7 + s) * 0.5 + Math.sin(t * 2.9 + s * 2.1) * 0.3 + Math.sin(t * 5.3 + s * 3.7) * 0.2;
// emotion poses for the boss (offsets applied on top of the idle pose, blended in/out)
const POSE = {
  surprised: { hx: -0.12, browY: 0.05 },
  shocked:   { hx: -0.14, browY: 0.06, hz: 0, back: -0.04 },
  triumph:   { armRx: -1.3, armRz: 0.28, browRz: 0.32 },
  awkward:   { hy: 0.5, hx: 0.08 },
  sad:       { hx: 0.22, browLz: -0.42, browRz: 0.48 },
  touched:   { hz: 0.18, browLz: -0.37, browRz: 0.43 },
  rage:      { armLx: -2.6, armRx: -2.6, armLz: -0.38, armRz: 0.38, browLz: -0.57, browRz: 0.63, browY: -0.02 },
};
const v3 = (a) => new THREE.Vector3(...a);

export async function setup(timelineUrl) {
  const tl = await (await fetch(timelineUrl)).json();
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const w = buildWorld(renderer, tl.holo, tl.cast || []);
  const { scene, camera, bot, boss, holo, beam, holoApi, extras } = w;
  if (tl.holo) { /* rows come from scene defaults; custom rows supported via makeHolo in scene */ }

  const comp = document.createElement('canvas'); comp.width = W; comp.height = H;
  const cx = comp.getContext('2d');
  document.body.appendChild(comp);

  const botBase = bot.position.clone(), botRotY = bot.rotation.y;
  const bossBase = boss.position.clone(), bossRotY = boss.rotation.y;
  const holoScale = holo.scale.clone();
  const lines = tl.lines;
  const fps = tl.fps;

  function lineAt(t) {
    for (let i = lines.length - 1; i >= 0; i--) if (t >= lines[i].start) return i;
    return -1;
  }
  function envAt(ln, t) {
    const k = Math.floor((t - ln.start) * fps);
    return k >= 0 && k < ln.env.length ? ln.env[k] : 0;
  }
  // holo state accumulates over lines
  function holoState(li) {
    let st = { show: false, visible: 0, hi: -1, card: 0, since: 0, cardSince: 0, showSince: 1e9 };
    for (let i = 0; i <= li; i++) if (lines[i].holo) {
      const h = lines[i].holo; const wasShown = st.show;
      const newCard = h.card != null && h.card !== st.card;
      if (newCard && h.visible == null) st.visible = 0;
      st = { ...st, ...h, show: h.show === false ? false : true, since: lines[i].start };
      if (newCard) st.cardSince = lines[i].start;
      if (st.show && !wasShown) { st.showSince = lines[i].start; st.cardSince = lines[i].start; }
    }
    return st;
  }
  function holoShowTime() {
    for (const l of lines) if (l.holo) return l.start;
    return 1e9;
  }
  const tHolo = holoShowTime();
  // secondary cast: enters (slides in) just before its first line, or at a line with "enter": "<id>"
  const extraIn = {};
  for (const id of Object.keys(extras || {})) {
    const l = lines.find((x) => x.who === id || x.enter === id);
    extraIn[id] = l ? l.start - 0.7 : 1e9;
  }
  function animExtra(id, p, t, ln, speaking, env) {
    const sl = p.userData.slot, ud = p.userData, head = ud.head;
    const k = (t - extraIn[id]) / 0.7;
    p.visible = k > 0;
    if (!p.visible) return;
    const e = ease(k);
    p.position.set(sl.pos[0] + sl.side * 1.6 * (1 - e), Math.abs(Math.sin(k * 9)) * 0.03 * (1 - e), sl.pos[2]);
    const talk = speaking === id;
    const emo = ln && ln.who === id && t < ln.start + ln.dur + 0.6 ? ln.emo : null;
    head.rotation.set(talk ? env * 0.08 - 0.02 : Math.sin(t * 0.7 + 1) * 0.02, talk ? 0 : -sl.side * 0.25 + 0.1 * Math.sin(t * 0.4), 0);
    ud.browL.position.y = ud.browR.position.y = ud.browY; ud.browL.rotation.z = 0.1; ud.browR.rotation.z = -0.1;
    ud.armL.rotation.set(0, 0, -0.1); ud.armR.rotation.set(0, 0, 0.1);
    if (talk) ud.armR.rotation.x = -0.4 - Math.sin(t * 5) * 0.15 * (0.4 + env);
    if (emo === 'surprised' || emo === 'shocked') { ud.browL.position.y += 0.04; ud.browR.position.y += 0.04; head.rotation.x -= 0.1; }
    if (emo === 'triumph') { ud.armR.rotation.x = -2.4; ud.armR.rotation.z = 0.3; }
    if (emo === 'awkward') { head.rotation.y += 0.4; }
    if (emo === 'sad' || emo === 'touched') { head.rotation.z = 0.15; ud.browL.rotation.z = -0.25; ud.browR.rotation.z = 0.25; }
    if (emo === 'rage') { ud.armL.rotation.x = ud.armR.rotation.x = -2.5; ud.browL.rotation.z = -0.4; ud.browR.rotation.z = 0.4; }
    p.rotation.y = sl.rotY + (talk ? 0 : -sl.side * 0.1);
    const open = (talk && env > 0.06) || emo === 'shocked';
    ud.mouth.visible = open; ud.smile.visible = !open && emo !== 'sad';
    if (open) ud.mouth.scale.set(0.85 + env * 0.25, 0.3 + env * 1.0, 1);
  }

  function wrap(text, maxW) {
    const words = text.split(' '); const out = []; let cur = '';
    for (const wd of words) { const t2 = cur ? cur + ' ' + wd : wd; if (cx.measureText(t2).width > maxW && cur) { out.push(cur); cur = wd; } else cur = t2; }
    if (cur) out.push(cur); return out;
  }
  function rr(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }

  const grain = document.createElement('canvas'); grain.width = grain.height = 256;
  { const g = grain.getContext('2d'); const im = g.createImageData(256, 256); let s = 1234567;
    for (let i = 0; i < im.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = (s / 2147483647) * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0); }
  const vig = cx.createRadialGradient(W / 2, H * 0.46, H * 0.28, W / 2, H * 0.5, H * 0.72);
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.42)');
  function grade(t) {
    cx.save(); cx.fillStyle = vig; cx.fillRect(0, 0, W, H);
    cx.globalAlpha = 0.045; cx.globalCompositeOperation = 'overlay';
    const fi = Math.floor(t * 30); const ox = (fi * 97) % 256, oy = (fi * 57) % 256;
    cx.fillStyle = cx.createPattern(grain, 'repeat'); cx.translate(-ox, -oy); cx.fillRect(0, 0, W + 256, H + 256);
    cx.restore();
  }

  function overlay(t, li) {
    // brand badge
    cx.save();
    cx.font = 'bold 40px "DejaVu Sans", sans-serif';
    cx.fillStyle = 'rgba(20,20,26,0.55)'; rr(40, 70, 300, 70, 35); cx.fill();
    cx.fillStyle = '#fff'; cx.fillText('BOÎTE', 68, 120); cx.fillStyle = COL.claude; cx.fillText('&', 200, 120); cx.fillStyle = '#fff'; cx.fillText('CO', 236, 120);
    cx.font = 'bold 28px "DejaVu Sans", sans-serif'; cx.fillStyle = 'rgba(255,255,255,0.85)'; 
    cx.restore();

    // intro hook
    if (tl.hook_banner && t < (tl.hook_dur || 3.2)) {
      const hd = tl.hook_dur || 3.2; const a = ease(t / 0.2) * (1 - ease((t - hd + 0.3) / 0.3));
      const s = 0.7 + 0.3 * ease(t / 0.25) + 0.03 * Math.sin(t * 8);
      cx.save(); cx.globalAlpha = a; cx.translate(W / 2, 400); cx.scale(s, s);
      cx.font = 'bold 82px "DejaVu Sans", sans-serif'; cx.textAlign = 'center';
      const hl = wrap(tl.hook, 920);
      const bh = hl.length * 100 + 60;
      cx.fillStyle = '#ffd23f'; rr(-500, -bh / 2, 1000, bh, 40); cx.fill();
      hl.forEach((l, i) => { cx.fillStyle = '#111'; cx.fillText(l, 0, -bh / 2 + 108 + i * 100); });
      cx.restore();
    }

    // subtitles: short word chunks synced to speech
    if (li >= 0 && t < tl.outro_start) {
      const ln = lines[li];
      const k = t - ln.start;
      if (k >= 0 && k < ln.dur + 0.15 && ln.chunks) {
        let ci = 0; for (let i = 0; i < ln.chunks.length; i++) if (k >= ln.chunks[i].t) ci = i;
        const ch = ln.chunks[ci];
        const kk = (k - ch.t) / 0.22;
        const pop = 0.82 + 0.18 * easeOutBack(kk);
        const rise = 14 * (1 - easeOutExpo(kk * 1.4));
        cx.save(); cx.textAlign = 'center'; cx.translate(W / 2, 1430 + rise); cx.scale(pop, pop);
        cx.shadowColor = 'rgba(0,0,0,0.45)'; cx.shadowBlur = 18; cx.shadowOffsetY = 6;
        cx.font = 'bold 76px "DejaVu Sans", sans-serif';
        const tw = cx.measureText(ch.w).width;
        cx.fillStyle = 'rgba(10,10,16,0.82)'; rr(-tw / 2 - 26, -66, tw + 52, 92, 22); cx.fill();
        cx.shadowColor = 'transparent';
        cx.lineWidth = 9; cx.strokeStyle = '#000'; cx.lineJoin = 'round'; cx.strokeText(ch.w, 0, 0);
        cx.fillStyle = SUB[ln.who]; cx.fillText(ch.w, 0, 0);
        cx.restore();
      }
    }

    // outro: blurred scene + staged reveal
    if (t >= tl.outro_start) {
      const ko = t - tl.outro_start;
      cx.save(); cx.globalAlpha = 0.62 * easeInOutCubic(ko / 0.5); cx.fillStyle = '#0d0f1c'; cx.fillRect(0, 0, W, H); cx.restore();
      // logo
      const k1 = easeOutBack((ko - 0.15) / 0.45);
      if (k1 > 0) { cx.save(); cx.translate(W / 2, 640); cx.scale(k1, k1); cx.textAlign = 'center';
        cx.font = 'bold 96px "DejaVu Sans", sans-serif';
        const a1 = 'BOÎTE', a2 = ' & ', a3 = 'CO'; const w1 = cx.measureText(a1).width, w2 = cx.measureText(a2).width, w3 = cx.measureText(a3).width;
        let sx = -(w1 + w2 + w3) / 2; cx.textAlign = 'left';
        cx.fillStyle = '#fff'; cx.fillText(a1, sx, 0); cx.fillStyle = COL.claude; cx.fillText(a2, sx + w1, 0); cx.fillStyle = '#fff'; cx.fillText(a3, sx + w1 + w2, 0);
        cx.restore(); }
      // punchline, word by word
      cx.save(); cx.textAlign = 'center'; cx.font = 'bold 64px "DejaVu Sans", sans-serif';
      const pl = wrap(tl.outro_q || '', 900); let wi = 0;
      pl.forEach((l, i) => { const ws = l.split(' '); let lw = cx.measureText(l).width; let xx = W / 2 - lw / 2; cx.textAlign = 'left';
        ws.forEach((wd) => { const kw = easeOutBack((ko - 0.55 - wi * 0.07) / 0.3); const ww = cx.measureText(wd + ' ').width;
          if (kw > 0) { cx.save(); cx.globalAlpha = clamp01(kw); cx.translate(xx, 880 + i * 84 + 30 * (1 - kw)); cx.fillStyle = '#fff'; cx.fillText(wd, 0, 0); cx.restore(); }
          xx += ww; wi++; }); });
      cx.restore();
      // subscribe button
      const k3 = easeOutBack((ko - 0.9 - wi * 0.07) / 0.4);
      if (k3 > 0) { const pulse = 1 + 0.03 * Math.sin(ko * 5); cx.save(); cx.translate(W / 2, 1200); cx.scale(k3 * pulse, k3 * pulse);
        cx.shadowColor = 'rgba(242,112,30,0.6)'; cx.shadowBlur = 40;
        cx.fillStyle = COL.claude; rr(-300, -58, 600, 108, 54); cx.fill(); cx.shadowColor = 'transparent';
        cx.textAlign = 'center'; cx.font = 'bold 50px "DejaVu Sans", sans-serif'; cx.fillStyle = '#fff'; cx.fillText('Abonne-toi', 0, 14); cx.restore(); }
    }
  }

  function animate(t) {
    const li = lineAt(t);
    const ln = li >= 0 ? lines[li] : null;
    const speaking = ln && t < ln.start + ln.dur ? ln.who : null;
    const env = speaking ? envAt(ln, t) : 0;

    // ---- bot ----
    const botLn = ln && ln.who === 'claude' ? ln : null;
    const kb = botLn ? t - botLn.start : 9;
    const antic = kb < 0.35 ? (kb < 0.1 ? -0.05 * ease(kb / 0.1) : -0.05 + 0.09 * easeOutBack((kb - 0.1) / 0.25) - 0.04 * ease((kb - 0.2) / 0.15)) : 0;
    const bob = Math.sin(t * 3.1) * 0.012 + (speaking === 'claude' ? env * 0.02 : 0) + Math.max(0, antic) * 0.4;
    bot.position.set(botBase.x, botBase.y + bob, botBase.z);
    const sq = 1 + (speaking === 'claude' ? env * 0.04 : 0) + antic + 0.008 * Math.sin(t * 2.2);
    bot.scale.set(0.9 / Math.sqrt(sq), 0.9 * sq, 0.9 / Math.sqrt(sq));
    bot.rotation.y = botRotY + (speaking === 'boss' ? 0.12 : 0) + Math.sin(t * 0.7) * 0.03;
    const blinkPh = (t % 3.3);
    bot.userData.eyes.scale.y = blinkPh > 3.15 ? 0.15 : 1;
    bot.userData.eyes.position.y = blinkPh > 3.15 ? 0.47 : 0;
    const botOpen = speaking === 'claude' && env > 0.06;
    bot.userData.mouth.visible = botOpen; bot.userData.smile.visible = !botOpen;
    if (botOpen) bot.userData.mouth.scale.set(0.85 + env * 0.25, 0.3 + env * 0.95, 1);
    const armR = bot.userData.armR, armL = bot.userData.armL;
    if (ln && ln.act === 'wave' && t < ln.start + ln.dur + 0.3) armR.rotation.z = -0.55 + Math.sin(t * 12) * 0.35;
    else if (speaking === 'claude') armR.rotation.z = -0.9 + Math.sin(t * 5) * 0.25 * (0.4 + env);
    else { const kr = botLn ? t - (botLn.start + botLn.dur) : 9; armR.rotation.z = lerp(-0.9, -2.5, easeInOutCubic(kr / 0.4)); }
    armL.rotation.z = -0.35 + (speaking === 'claude' ? Math.sin(t * 4 + 1) * 0.15 : 0);

    // ---- boss ----
    const ud = boss.userData, head = ud.head;
    const emo = ln && ln.who === 'boss' && t < ln.start + ln.dur + 0.6 ? ln.emo : null;
    const bossTalk = speaking === 'boss';
    // emotion blend: in over 0.25 s (overshoot), out over 0.35 s after the line
    const bossLn = ln && ln.who === 'boss' ? ln : null;
    let eb = 0, P = {};
    if (bossLn && bossLn.emo && POSE[bossLn.emo]) {
      P = POSE[bossLn.emo];
      const kin = (t - bossLn.start) / 0.25, kout = (t - (bossLn.start + bossLn.dur + 0.5)) / 0.35;
      eb = Math.min(easeOutBack(kin), 1 - easeInOutCubic(kout));
    }
    const idleY = bossTalk ? 0 : -0.25 + 0.12 * noise1(t * 0.4, 3);
    head.rotation.set(
      (bossTalk ? env * 0.09 - 0.02 : 0.02 * noise1(t * 0.6, 1)) + (P.hx || 0) * eb,
      lerp(head.rotation.y * 0 + idleY, idleY, 1) + (P.hy || 0) * eb,
      (P.hz || 0) * eb);
    head.position.z = 0.02 + (P.back || 0) * eb;
    ud.browL.position.y = 0.15 + (P.browY || 0) * eb; ud.browR.position.y = 0.17 + (P.browY || 0) * eb;
    ud.browL.rotation.z = 0.12 + (P.browLz || 0) * eb; ud.browR.rotation.z = -0.18 + (P.browRz || 0) * eb;
    ud.armL.rotation.set((P.armLx || 0) * eb, 0, -0.12 + (P.armLz || 0) * eb);
    ud.armR.rotation.set((P.armRx || 0) * eb + (bossTalk && !P.armRx ? -0.25 - 0.12 * Math.sin(t * 4.5) * (0.4 + env) : 0), 0, 0.12 + (P.armRz || 0) * eb);
    let hop = 0;
    if (emo === 'rage') { const k = t - ln.start; hop = Math.abs(Math.sin(k * 9)) * 0.12 * (k < 2.2 ? 1 : 0) * eb; head.rotation.z += Math.sin(k * 30) * 0.05 * eb; }
    boss.position.set(bossBase.x, bossBase.y + hop + Math.sin(t * 1.3) * 0.006, bossBase.z);
    boss.rotation.y = bossRotY + (bossTalk ? 0.12 : 0);
    const bossOpen = (bossTalk && env > 0.06) || emo === 'rage' || emo === 'shocked';
    ud.mouth.visible = bossOpen; ud.smile.visible = !bossOpen && emo !== 'sad';
    if (bossOpen) ud.mouth.scale.set(0.85 + env * 0.25, Math.max(0.3 + env * 1.0, emo === 'shocked' && !bossTalk ? 0.8 : 0), 1);

    // ---- secondary cast ----
    for (const [id, p] of Object.entries(extras || {})) animExtra(id, p, t, ln, speaking, env);

    // ---- holo ----
    const st = holoState(li);
    const ks = t - st.showSince;
    const hs = st.show ? easeOutBack(ks / 0.45) : 0;
    const flick = st.show && ks < 0.3 ? (Math.sin(ks * 90) > 0 ? 1 : 0.55) : 1;
    const kcard = t - st.cardSince; const cpop = st.cardSince > st.showSince && kcard < 0.25 ? 0.92 + 0.08 * easeOutBack(kcard / 0.25) : 1;
    holo.scale.set(holoScale.x * hs * cpop, holoScale.y * Math.max(0.02, hs) * cpop, 1); holo.visible = hs > 0.01;
    holo.material.opacity = flick; holo.material.transparent = true;
    beam.visible = hs > 0.01; beam.material.opacity = (0.10 + 0.03 * Math.sin(t * 6)) * hs;
    holo.position.y = 2.62 + Math.sin(t * 2) * 0.01;
    holoApi.draw({ card: st.card, visible: st.visible, hi: st.hi, blink: (Math.sin(t * 9) > 0 ? 1 : 0), age: t - st.since, t });

    // ---- camera ----
    let shot = 'wide';
    if (t >= tl.intro && ln) shot = ln.shot || 'wide';
    if (t >= tl.outro_start - 0.2) shot = 'wide';
    let S = SHOTS[shot];
    if (!S && extras && extras[shot]) {   // close shot on a secondary character
      const sl = extras[shot].userData.slot;
      S = { pos: [sl.pos[0] + sl.side * 0.2, 2.95, sl.pos[2] + 4.3], look: [sl.pos[0] - sl.side * 0.1, 2.0, sl.pos[2]] };
    }
    if (!S) S = SHOTS.wide;
    const t0 = ln && t >= tl.intro ? ln.start : 0;
    const k = Math.min(1, (t - t0) / 4);
    const p = v3(S.pos), l = v3(S.look);
    const dir = l.clone().sub(p);
    p.addScaledVector(dir, 0.07 * easeInOutCubic(k));      // slow push-in
    const kc = ln && t >= ln.start ? (t - ln.start) : 9;
    const cut = ln && li > 0 && (lines[li - 1].shot || 'wide') !== (ln.shot || 'wide');
    if (cut) p.addScaledVector(dir, -0.09 * (1 - easeOutExpo(kc / 0.4)));  // snap-in at each cut
    const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    p.addScaledVector(side, 0.05 * (easeInOutCubic(k) - 0.5) * (li % 2 ? 1 : -1));   // gentle lateral dolly (parallax)
    p.x += 0.012 * noise1(t * 0.8, 7); p.y += 0.008 * noise1(t * 0.9, 11);   // handheld breathing
    if (t < tl.intro) p.addScaledVector(dir, -0.12 * (1 - ease(t / tl.intro)));
    if (emo === 'rage') { const kr = t - ln.start; const sh = 0.03 * Math.max(0, 1 - kr / 1.2); p.x += sh * Math.sin(t * 61); p.y += sh * Math.sin(t * 47 + 1); }
    camera.position.copy(p); camera.lookAt(l);

    renderer.render(scene, camera);
    const inOutro = t >= tl.outro_start;
    if (inOutro) { const kb2 = clamp01((t - tl.outro_start) / 0.5); cx.filter = `blur(${(kb2 * 14).toFixed(1)}px) saturate(${1 - kb2 * 0.3})`; }
    cx.drawImage(renderer.domElement, 0, 0); cx.filter = 'none';
    if (cut && kc < 0.12) {   // zoom smear on cuts
      const sm = 1 - kc / 0.12; cx.save(); cx.globalAlpha = 0.28 * sm; const z = 1 + 0.04 * sm;
      cx.translate(W / 2, H / 2); cx.scale(z, z); cx.drawImage(renderer.domElement, -W / 2, -H / 2); cx.restore();
    }
    grade(t);
    overlay(t, li);
  }

  window.__tl = tl;
  window.renderFrame = (i) => { animate(i / fps); return comp.toDataURL('image/jpeg', 0.9); };
  window.__done = true;
}
