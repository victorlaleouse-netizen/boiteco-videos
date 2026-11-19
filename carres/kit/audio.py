import sys, json, math, wave
import numpy as np
SR = 44100
base = sys.argv[1]
ev = json.load(open(base + '.events.json'))
dur = ev['n'] / 30 + 0.2
N = int(dur * SR)
out = np.zeros(N)
rng = np.random.default_rng(1)

def add(sig, t, gain=1.0):
    i = int(t * SR)
    if i >= N: return
    j = min(N, i + len(sig)); out[i:j] += sig[:j - i] * gain

def tone(f, d, kind='sine', decay=8.0, f2=None):
    tt = np.arange(int(d * SR)) / SR
    fr = f if f2 is None else f + (f2 - f) * tt / d
    ph = 2 * np.pi * np.cumsum(np.ones_like(tt) * fr) / SR
    s = np.sin(ph) if kind == 'sine' else np.sign(np.sin(ph)) * 0.5 + np.sin(ph) * 0.5
    env = np.exp(-decay * tt) * np.minimum(1, tt * 400)
    return s * env

def noise(d, decay=20.0, lp=0.3):
    s = rng.standard_normal(int(d * SR))
    y = np.zeros_like(s); a = 0
    for k in range(len(s)): a = a + lp * (s[k] - a); y[k] = a
    tt = np.arange(len(s)) / SR
    return y * np.exp(-decay * tt)

# ---- musique UNIQUE par video (TikTok coupe le son quand la meme piste revient a chaque post)
import hashlib, os
mseed = int(os.environ.get('MUSIC_SEED') or int(hashlib.md5((os.path.basename(base) + str(ev['n'])).encode()).hexdigest()[:8], 16))
mr = np.random.default_rng(mseed)
bpm = int(mr.integers(96, 136)); beat = 60 / bpm
key = 55.0 * 2 ** (int(mr.integers(-5, 7)) / 12)
SC = [0, 2, 3, 5, 7, 8, 10] if mr.random() < 0.5 else [0, 2, 4, 5, 7, 9, 11]
deg = [0] + list(mr.choice([1, 2, 3, 4, 5, 6], size=int(mr.choice([3, 5, 7])), replace=True))
prog = [key * 2 ** (SC[d] / 12) for d in deg]
bass_kind = 'sq' if mr.random() < 0.5 else 'sine'
lead_kind = 'sine' if mr.random() < 0.6 else 'sq'
arp = [int(x) for x in mr.choice([0, 2, 4, 7, 9, 11, 12], size=int(mr.choice([3, 4, 6])), replace=False)]
hat_on = mr.random() < 0.7; off_kick = mr.random() < 0.4
mel = [int(x) for x in mr.integers(0, 7, size=16)]
print('music', mseed, bpm, round(key, 1), deg, arp)
kick = tone(float(mr.uniform(90, 130)), 0.25, decay=18, f2=40)
hat = noise(0.05, decay=90, lp=float(mr.uniform(0.7, 0.95)))
t_end = ev['win']['t'] if ev['win'] else dur
b = 0
while b * beat < dur:
    t = b * beat
    bar = b // 4; root = prog[bar % len(prog)]
    inten = min(1.0, t / max(1, t_end))
    add(kick, t, 0.5)
    if off_kick and b % 4 == 3: add(kick, t + beat / 2, 0.3)
    if hat_on: add(hat, t + beat / 2, 0.08 + 0.08 * inten)
    add(tone(root * 2, beat * 0.9, bass_kind, decay=3.5), t, 0.11)
    if b % 2 == 0 and inten > 0.2:
        n = mel[(b // 2) % 16]
        add(tone(key * 8 * 2 ** (SC[n] / 12), beat * 1.6, lead_kind, decay=4), t, 0.05 + 0.04 * inten)
    if inten > 0.45:
        for k, m in enumerate(arp):
            add(tone(root * 4 * 2 ** (m / 12), beat / len(arp), 'sine', decay=14), t + k * beat / len(arp), 0.05 * inten)
    b += 1
if ev['win']:
    i = int(ev['win']['t'] * SR); out[i:] *= np.linspace(1, 0.15, N - i) ** 0.3

# ---- sfx
pitch = {'g': 660, 'y': 740, 'r': 520, 'b': 880}
last = {}
for e in ev['events']:
    t = e['t']
    if e['type'] == 'bounce':
        if t - last.get(e['c'], -1) < 0.07: continue
        last[e['c']] = t
        k = e['kind']
        if k == 'wall': add(tone(pitch[e['c']], 0.06, decay=60), t, 0.16)
        elif k == 'brick': add(noise(0.08, decay=45, lp=0.5), t, 0.5); add(tone(220, 0.08, decay=40), t, 0.2)
        elif k == 'hit': add(tone(pitch[e['c']] * 1.5, 0.05, decay=70), t, 0.12)
        elif k == 'water': add(noise(0.12, decay=25, lp=0.12), t, 0.25)
    elif e['type'] == 'break':
        add(noise(0.35, decay=10, lp=0.35), t, 0.8); add(tone(90, 0.3, decay=10, f2=50), t, 0.6)
    elif e['type'] == 'hammer':
        for k, f in enumerate((523, 659, 784, 1047)): add(tone(f, 0.18, decay=10), t + k * 0.07, 0.35)
    elif e['type'] == 'out':
        add(tone(440, 0.7, 'sq', decay=3, f2=110), t, 0.35); add(noise(0.5, decay=6, lp=0.1), t, 0.4)
    elif e['type'] == 'win':
        for k, f in enumerate((523, 659, 784)): add(tone(f, 0.25, 'sq', decay=6), t + k * 0.11, 0.3)
        for f in (523, 659, 784, 1047): add(tone(f, 1.8, 'sq', decay=1.6), t + 0.36, 0.16)
        add(noise(1.5, decay=2.5, lp=0.8), t + 0.36, 0.25)
# pas de compte a rebours (demande de Victor)

out = out / max(1e-9, np.max(np.abs(out))) * 0.89
pcm = (out * 32767).astype(np.int16)
with wave.open(base + '.wav', 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', dur)
