"""Build timeline (start times + per-frame mouth envelope) and the mixed voice track.
usage: python3 prepare.py ep1.json audio_dir out_dir
"""
import json, subprocess, sys, os
import numpy as np

FPS = 30
INTRO = 2.6     # seconds of hook card before first line
GAP = 0.45      # silence between lines
OUTRO = 4.2     # end card
MIN_TOTAL = 62.0

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
    clips.append((t, a))
    t += dur + GAP + ln.get('pause_after', 0)
end_dialog = t
total = max(MIN_TOTAL, end_dialog + OUTRO)
ep['outro_start'] = round(end_dialog + 0.2, 3)
ep['total'] = round(total, 3)
ep['fps'] = FPS
ep['intro'] = INTRO

mix = np.zeros(int(total * SR) + SR, dtype=np.float32)
for st, a in clips:
    i = int(st * SR); mix[i:i + len(a)] += a
mix = np.clip(mix * 0.98, -1, 1)
(np.int16(mix * 32767)).tofile(os.path.join(out, 'voice.raw'))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', os.path.join(out, 'voice.raw'),
                '-t', str(total), os.path.join(out, 'voice.wav')], check=True)
json.dump(ep, open(os.path.join(out, 'timeline.json'), 'w'), ensure_ascii=False)
print('total', total, 'dialog end', round(end_dialog, 2), 'lines', len(ep['lines']))
