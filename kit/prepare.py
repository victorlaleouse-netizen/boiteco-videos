"""Build timeline (start times + per-frame mouth envelope) and the mixed voice track.
usage: python3 prepare.py ep1.json audio_dir out_dir
"""
import json, subprocess, sys, os
import numpy as np

FPS = 30
INTRO = 0.25    # dialogue starts almost immediately; hook text is overlaid
GAP = 0.18      # tight pacing between lines
OUTRO = 3.2     # end card
MIN_TOTAL = 61.0

ep_path, adir, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
ep = json.load(open(ep_path))
SR = 24000

def pcm(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0

t = INTRO
clips = []
for ln in ep['lines']:
    a = pcm(os.path.join(adir, ln['f']))
    # trim leading/trailing silence
    thr = 0.012
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx):
        a = a[max(0, idx[0] - int(0.03 * SR)): min(len(a), idx[-1] + int(0.08 * SR))]
    dur = len(a) / SR
    hop = SR // FPS
    env = [float(np.sqrt(np.mean(a[i:i + hop] ** 2))) if i < len(a) else 0.0 for i in range(0, len(a), hop)]
    m = max(env) or 1
    env = [round(min(1.0, (e / m) ** 0.7), 3) for e in env]
    ln['start'] = round(t, 3); ln['dur'] = round(dur, 3); ln['env'] = env
    # word chunks (<=3 words, <=16 chars) timed on voiced frames
    words = ln['text'].split()
    chunks, cur = [], []
    for wd in words:
        if cur and (len(cur) >= 3 or len(' '.join(cur + [wd])) > 16):
            chunks.append(' '.join(cur)); cur = []
        cur.append(wd)
        if wd[-1] in '.?!…,' and len(cur) >= 1:
            chunks.append(' '.join(cur)); cur = []
    if cur: chunks.append(' '.join(cur))
    voiced = [i for i, e in enumerate(env) if e > 0.12] or list(range(len(env)))
    total_c = sum(len(c) + 1 for c in chunks)
    acc, outc = 0, []
    for c in chunks:
        fi = voiced[min(len(voiced) - 1, int(acc / total_c * len(voiced)))]
        outc.append({'t': round(fi / FPS, 3), 'w': c}); acc += len(c) + 1
    outc[0]['t'] = 0.0
    ln['chunks'] = outc
    clips.append((t, a))
    t += dur + GAP + ln.get('pause_after', 0)
end_dialog = t
total = max(MIN_TOTAL, end_dialog + OUTRO)
ep['outro_start'] = round(end_dialog + 0.2, 3)
ep['total'] = round(total, 3)
ep['fps'] = FPS
ep['intro'] = INTRO
ep['hook_dur'] = 3.2

mix = np.zeros(int(total * SR) + SR, dtype=np.float32)
for st, a in clips:
    i = int(st * SR); mix[i:i + len(a)] += a
rng = np.random.default_rng(1)
prev = None
for ln in ep['lines']:
    if ln.get('shot') != prev:
        n = int(0.25 * SR); noise = rng.standard_normal(n).astype(np.float32)
        noise = np.convolve(noise, np.ones(24) / 24, mode='same')
        envw = np.sin(np.linspace(0, np.pi, n)) ** 2
        i = max(0, int((ln['start'] - 0.12) * SR)); mix[i:i + n] += noise * envw * 0.12
    prev = ln.get('shot')
# UI blip each time the hologram reveals a new row (or appears)
vis = 0
for ln in ep['lines']:
    h = ln.get('holo') or {}
    v = h.get('visible', vis) if (h.get('show') or vis or h) else vis
    if v > vis:
        n = int(0.09 * SR); tt = np.arange(n) / SR
        blip = np.sin(2 * np.pi * (1400 + 600 * tt / 0.09) * tt) * np.exp(-tt * 45)
        i = int((ln['start'] + 0.05) * SR); mix[i:i + n] += blip.astype(np.float32) * 0.10
    vis = v
# night ambience: soft low room tone + very quiet warm drone (A minor-ish), fades in/out
L = len(mix); tt = np.arange(L) / SR
room = rng.standard_normal(L).astype(np.float32)
room = np.convolve(room, np.ones(200) / 200, mode='same') * 0.9
drone = sum(np.sin(2 * np.pi * f * tt + k) * a for k, (f, a) in enumerate([(110, 1.0), (164.8, 0.6), (220, 0.35), (261.6, 0.25)]))
drone *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * tt)
fade = np.clip(tt / 1.5, 0, 1) * np.clip((total - tt) / 2.0, 0, 1)
mix += (room * 0.010 + drone.astype(np.float32) * 0.008) * fade.astype(np.float32)
mix = np.clip(mix * 0.98, -1, 1)
(np.int16(mix * 32767)).tofile(os.path.join(out, 'voice.raw'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', os.path.join(out, 'voice.raw'),
                '-t', str(total), os.path.join(out, 'voice.wav')], check=True)
json.dump(ep, open(os.path.join(out, 'timeline.json'), 'w'), ensure_ascii=False)
print('total', total, 'dialog end', round(end_dialog, 2), 'lines', len(ep['lines']))
