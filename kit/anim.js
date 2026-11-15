// Episode animator: deterministic renderFrame(i) for a timeline produced by prepare.py
import * as THREE from 'three';
import { buildWorld } from './scene.js';

const W = 1080, H = 1920;
const COL = { claude: '#f2701e', boss: '#e0a93a' };
const SUB = { claude: '#ffa24f', boss: '#ffffff' };
const NAME = { claude: 'CLAUDE', boss: 'LE PATRON' };

const SHOTS = {
  wide: { pos: [-0.2, 3.0, 5.0], look: [0, 1.5, -0.4] },
  bot:  { pos: [-0.05, 1.95, 2.35], look: [-0.62, 1.52, 0.1] },
  boss: { pos: [0.1, 2.2, 1.75], look: [0.55, 1.8, -1.0] },
  holo: { pos: [-0.1, 2.5, 2.7], look: [-0.05, 2.3, -0.55] },
};

const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const lerp = (a, b, t) => a + (b - a) * t;
const v3 = (a) => new THREE.Vector3(...a);

export async function setup(timelineUrl) {
  const tl = await (await fetch(timelineUrl)).json();
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const w = buildWorld(renderer, tl.holo);
  const { scene, camera, bot, boss, holo, beam, holoApi } = w;
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
    let st = { show: false, visible: 0, hi: -1 };
    for (let i = 0; i <= li; i++) if (lines[i].holo) st = { ...st, ...lines[i].holo, show: true };
    return st;
  }
  function holoShowTime() {
    for (const l of lines) if (l.holo) return l.start;
    return 1e9;
  }
  const tHolo = holoShowTime();

  function wrap(text, maxW) {
    const words = text.split(' '); const out = []; let cur = '';
    for (const wd of words) { const t2 = cur ? cur + ' ' + wd : wd; if (cx.measureText(t2).width > maxW && cur) { out.push(cur); cur = wd; } else cur = t2; }
    if (cur) out.push(cur); return out;
  }
  function rr(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }

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
        const pop = 1 + 0.18 * (1 - ease((k - ch.t) / 0.12));
        cx.save(); cx.textAlign = 'center'; cx.translate(W / 2, 1330); cx.scale(pop, pop);
        cx.font = 'bold 76px "DejaVu Sans", sans-serif';
        const tw = cx.measureText(ch.w).width;
        cx.fillStyle = 'rgba(10,10,16,0.82)'; rr(-tw / 2 - 26, -66, tw + 52, 92, 22); cx.fill();
        cx.lineWidth = 9; cx.strokeStyle = '#000'; cx.lineJoin = 'round'; cx.strokeText(ch.w, 0, 0);
        cx.fillStyle = SUB[ln.who]; cx.fillText(ch.w, 0, 0);
        cx.restore();
      }
    }

    // outro
    if (t >= tl.outro_start) {
      const a = ease((t - tl.outro_start) / 0.5);
      cx.save(); cx.globalAlpha = a * 0.78; cx.fillStyle = '#101018'; cx.fillRect(0, 0, W, H); cx.restore();
      cx.save(); cx.globalAlpha = a; cx.textAlign = 'center';
      
      cx.font = 'bold 66px "DejaVu Sans", sans-serif'; cx.fillStyle = '#fff';
      wrap(tl.outro_q || '', 920).forEach((l, i) => cx.fillText(l, W / 2, 860 + i * 84));
      const pulse = 1 + 0.04 * Math.sin((t - tl.outro_start) * 6);
      cx.translate(W / 2, 1180); cx.scale(pulse, pulse);
      cx.fillStyle = COL.claude; rr(-330, -60, 660, 110, 55); cx.fill();
      cx.font = 'bold 52px "DejaVu Sans", sans-serif'; cx.fillStyle = '#fff'; cx.fillText('Abonne-toi', 0, 14);
      cx.restore();
    }
  }

  function animate(t) {
    const li = lineAt(t);
    const ln = li >= 0 ? lines[li] : null;
    const speaking = ln && t < ln.start + ln.dur ? ln.who : null;
    const env = speaking ? envAt(ln, t) : 0;

    // ---- bot ----
    const bob = Math.sin(t * 3.1) * 0.012 + (speaking === 'claude' ? env * 0.02 : 0);
    bot.position.set(botBase.x, botBase.y + bob, botBase.z);
    const sq = 1 + (speaking === 'claude' ? env * 0.04 : 0);
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
    else armR.rotation.z = lerp(armR.rotation.z, -2.5, 0.2);
    armL.rotation.z = -0.35 + (speaking === 'claude' ? Math.sin(t * 4 + 1) * 0.15 : 0);

    // ---- boss ----
    const ud = boss.userData, head = ud.head;
    const emo = ln && ln.who === 'boss' && t < ln.start + ln.dur + 0.6 ? ln.emo : null;
    const bossTalk = speaking === 'boss';
    head.rotation.set(0, 0, 0);
    head.rotation.x = bossTalk ? env * 0.09 - 0.02 : Math.sin(t * 0.8) * 0.02;
    head.rotation.y = 0.15 * Math.sin(t * 0.5) * (bossTalk ? 0 : 1) + (bossTalk ? 0 : -0.25);
    ud.browL.position.y = 0.15; ud.browR.position.y = 0.17; ud.browL.rotation.z = 0.12; ud.browR.rotation.z = -0.18;
    let hop = 0;
    ud.armL.rotation.set(0, 0, -0.12); ud.armR.rotation.set(0, 0, 0.12);
    if (emo === 'surprised' || emo === 'shocked') { ud.browL.position.y += 0.05; ud.browR.position.y += 0.05; head.rotation.x -= 0.1; }
    if (emo === 'shocked') { head.position.z = 0.02 - 0.04; } else head.position.z = 0.02;
    if (emo === 'triumph') { ud.armR.rotation.x = -1.3; ud.armR.rotation.z = 0.4; ud.browR.rotation.z = 0.2; }
    if (emo === 'awkward') { head.rotation.y = 0.45; head.rotation.x = 0.08; }
    if (emo === 'sad') { head.rotation.x = 0.22; ud.browL.rotation.z = -0.3; ud.browR.rotation.z = 0.3; }
    if (emo === 'touched') { head.rotation.z = 0.18; ud.browL.rotation.z = -0.25; ud.browR.rotation.z = 0.25; }
    if (emo === 'rage') {
      const k = t - ln.start; hop = Math.abs(Math.sin(k * 9)) * 0.12 * (k < 2.2 ? 1 : 0);
      ud.armL.rotation.x = -2.6; ud.armR.rotation.x = -2.6; ud.armL.rotation.z = -0.5; ud.armR.rotation.z = 0.5;
      ud.browL.rotation.z = -0.45; ud.browR.rotation.z = 0.45; ud.browL.position.y -= 0.02; ud.browR.position.y -= 0.02;
      head.rotation.z = Math.sin(k * 30) * 0.05;
    }
    boss.position.set(bossBase.x, bossBase.y + hop + Math.sin(t * 1.3) * 0.006, bossBase.z);
    boss.rotation.y = bossRotY + (bossTalk ? 0.12 : 0);
    const bossOpen = (bossTalk && env > 0.06) || emo === 'rage' || emo === 'shocked';
    ud.mouth.visible = bossOpen; ud.smile.visible = !bossOpen && emo !== 'sad';
    if (bossOpen) ud.mouth.scale.set(0.85 + env * 0.25, Math.max(0.3 + env * 1.0, emo === 'shocked' && !bossTalk ? 0.8 : 0), 1);

    // ---- holo ----
    const st = holoState(li);
    const hs = st.show ? ease((t - tHolo) / 0.35) : 0;
    holo.scale.set(holoScale.x * hs, holoScale.y * hs, 1); holo.visible = hs > 0.01;
    beam.visible = hs > 0.01; beam.material.opacity = 0.12 * hs;
    holo.position.y = 2.62 + Math.sin(t * 2) * 0.01;
    holoApi.draw({ visible: st.visible, hi: st.hi, blink: (Math.sin(t * 9) > 0 ? 1 : 0) });

    // ---- camera ----
    let shot = 'wide';
    if (t >= tl.intro && ln) shot = ln.shot || 'wide';
    if (t >= tl.outro_start - 0.2) shot = 'wide';
    const S = SHOTS[shot];
    const t0 = ln && t >= tl.intro ? ln.start : 0;
    const k = Math.min(1, (t - t0) / 4);
    const p = v3(S.pos), l = v3(S.look);
    const dir = l.clone().sub(p);
    p.addScaledVector(dir, 0.06 * ease(k));               // slow push-in
    const kc = ln && t >= ln.start ? (t - ln.start) : 9;
    p.addScaledVector(dir, -0.18 * (1 - ease(kc / 0.28)));  // snap-in at each cut
    p.x += Math.sin(t * 0.9) * 0.015; p.y += Math.sin(t * 1.3) * 0.01;
    if (t < tl.intro) p.addScaledVector(dir, -0.12 * (1 - ease(t / tl.intro)));
    if (emo === 'rage') { p.x += (Math.random() - 0.5) * 0.03; p.y += (Math.random() - 0.5) * 0.03; }
    camera.position.copy(p); camera.lookAt(l);

    renderer.render(scene, camera);
    cx.drawImage(renderer.domElement, 0, 0);
    overlay(t, li);
  }

  window.__tl = tl;
  window.renderFrame = (i) => { animate(i / fps); return comp.toDataURL('image/jpeg', 0.9); };
  window.__done = true;
}
