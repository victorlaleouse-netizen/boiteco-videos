// usage: node render.mjs build/ep1 [startFrame endFrame | --stills t1,t2,...]
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';

const dir = process.argv[2];
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', (e) => console.log('[err]', e.message));
await page.goto(`http://127.0.0.1:8765/anim.html?tl=${dir}/timeline.json`);
await page.waitForFunction(() => window.__done || window.__err, null, { timeout: 120000 });
const err = await page.evaluate(() => window.__err);
if (err) { console.log(err); process.exit(1); }
const tl = await page.evaluate(() => window.__tl);
const fps = tl.fps;

if (process.argv[3] === '--stills') {
  for (const s of process.argv[4].split(',')) {
    const t = parseFloat(s);
    const url = await page.evaluate((i) => window.renderFrame(i), Math.round(t * fps));
    fs.writeFileSync(`${dir}/still_${s}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
  }
  await browser.close(); process.exit(0);
}

const N = Math.ceil(tl.total * fps);
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-i', `${dir}/voice.wav`, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', `${dir}/video_tmp.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let i = 0; i < N; i++) {
  const url = await page.evaluate((k) => window.renderFrame(k), i);
  const buf = Buffer.from(url.split(',')[1], 'base64');
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % 150 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close();
console.log('done', N, 'frames in', ((Date.now() - t0) / 1000).toFixed(0), 's');
