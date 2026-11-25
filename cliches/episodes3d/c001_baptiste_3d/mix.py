"""Original light-jazz bed + pops + ElevenLabs voice -> out/mix.wav"""
import json, os, sys
import numpy as np, soundfile as sf
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ.get('LIB', os.path.expanduser('~/lemo-opuscar')), 'core/audio'))
import sfx
from sfx import lp, hp, SR
TL = json.load(open(f'{H}/timeline.json'))
DUR = TL['dur']; N = int(DUR * SR)
rng = np.random.default_rng(5)
def tt(d): return np.arange(int(d * SR)) / SR
def mf(m): return 440 * 2 ** ((m - 69) / 12)
def put(buf, x, at, g=1.0):
    i = int(at * SR); j = min(len(buf), i + len(x))
    if j > i: buf[i:j] += x[:j - i] * g
def pluck(f, d=0.5, v=1.0, bright=1.0):  # pizzicato / mallet-ish
    t = tt(d); x = np.sin(2*np.pi*f*t) + 0.35*np.sin(4*np.pi*f*t)*bright + 0.12*np.sin(6*np.pi*f*t)*bright
    return (x * np.exp(-t/0.16) * np.minimum(1, t/0.003) * v * 0.4).astype(np.float32)
def bass(f, d, v=1.0):
    t = tt(d); x = np.sin(2*np.pi*f*t) + 0.2*np.sin(4*np.pi*f*t)
    return (x * np.exp(-t/0.35) * np.minimum(1, t/0.004) * v * 0.7).astype(np.float32)
def brush(d=0.18, v=1.0):
    n = int(d*SR); x = hp(rng.standard_normal(n), 3000) * np.exp(-tt(d)[:n]/0.05)
    return (x * v * 0.12).astype(np.float32)
def kick(v=1.0):
    d = 0.18; t = tt(d); f = 110*np.exp(-t*18)+45
    return (np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t/0.08) * v * 0.6).astype(np.float32)
mus = np.zeros(N, np.float32)
BPM = 116; B = 60/BPM
# ii-V-I in F + vi, swing walking bass, vibes comping, brushes
prog = [(55, [67,70,74,77]), (60, [64,67,70,74]), (53, [65,69,72,76]), (62, [65,69,72,74])]  # Gm7 C7 Fmaj7 Dm7
walk = {55:[55,57,58,59], 60:[60,58,57,56], 53:[53,55,57,58], 62:[62,60,59,57]}
t = 0.0; k = 0
while t < DUR - 1.0:
    root, ch = prog[k % 4]
    for b in range(4):
        tb = t + b*B
        put(mus, bass(mf(walk[root][b]-12), B*0.95), tb, 0.9)
        put(mus, brush(0.16, 0.8 if b % 2 else 0.5), tb)
        put(mus, brush(0.08, 0.4), tb + B*0.66)
        if b in (0, 2): put(mus, kick(0.5), tb)
    for off in (B*0.66, B*2.0, B*3.33):
        for m in ch: put(mus, pluck(mf(m), 0.4, 0.18), t + off)
    t += 4*B; k += 1
# small melodic stabs on scene starts
for name, a, b in TL['scenes']:
    for i, m in enumerate([77, 81, 84]): put(mus, pluck(mf(m), 0.35, 0.35, 1.4), a + i*0.07)
fade = int(1.5*SR); mus[-fade:] *= np.linspace(1, 0, fade)
# fx: pop on caption-independent scene beats (wipes) + light ticks
fx = np.zeros(N, np.float32)
for name, a, b in TL['scenes'][1:]:
    put(fx, (hp(rng.standard_normal(int(0.25*SR)), 1500) * np.sin(np.linspace(0, np.pi, int(0.25*SR))) * 0.12).astype(np.float32), a - 0.22)
W = TL['words']
def w(k): return W.get(k.lower().rstrip('.,?!…:'), [None])[0]
for k, kind in [('libéral.', 'pop'), ('doudoune', 'pop'), ('jamais.', 'pop'), ('cinq', 'ring'), ('poster', 'pop'), ('ceo.', 'pop'), ('salarié.', 'pop'),
                ('appli', 'pop'), ('abonnement.', 'pop'), ('disrupter', 'pop'), ("l'état,", 'pop'), ('aides,', 'pop'), ('innovation.', 'stamp'),
                ('je', 'pop'), ('chèque.', 'pop'), ('quatre-vingt', 'cash'), ('ferme.', 'thud'), ('post', 'pop'), ('likes.', 'cash'), ('podcast.', 'pop'), ('abonne-toi.', 'pop')]:
    t0 = w(k)
    if t0 is None: continue
    if kind == 'pop': put(fx, sfx.pop(0.7), t0, 0.5)
    elif kind == 'ring':
        d = 0.9; x = (np.sign(np.sin(2*np.pi*2400*tt(d))) * (np.sin(2*np.pi*14*tt(d)) > 0) * 0.08).astype(np.float32); put(fx, x, t0)
    elif kind == 'stamp': put(fx, sfx.thump(0.9), t0 + 0.1)
    elif kind == 'cash': put(fx, sfx.ding(0.6), t0); put(fx, sfx.ding(0.4), t0 + 0.12)
    elif kind == 'thud': put(fx, sfx.thump(0.8, 55), t0)
# GIMMICK: every « chut chut chut » cluster gets a slam + reversed whoosh (series signature)
_ch = sorted(W.get('chut', [])); _g = []
for _t in _ch:
    if not _g or _t - _g[-1] > 1.6: _g.append(_t)
for _t in _g:
    _n = int(0.35 * SR); _w = (hp(rng.standard_normal(_n), 800) * np.linspace(0, 1, _n) ** 2 * 0.25).astype(np.float32)
    put(fx, _w, _t - 0.35); put(fx, sfx.thump(1.0, 50), _t)
vo, sr = sf.read(f'{H}/voice/vo_long.wav' if os.path.exists(f'{H}/voice/vo_long.wav') else f'{H}/voice/vo.wav', dtype='float32')
if vo.ndim > 1: vo = vo.mean(1)
v = np.zeros(N, np.float32); v[:min(N, len(vo))] = vo[:N]
v = sfx.compress(v, thr=0.25, ratio=2.5)
v *= 0.2 / (np.sqrt(np.mean(v[np.abs(v) > 1e-3]**2)) + 1e-9)
env = np.convolve(np.abs(v), np.ones(480)/480, 'same'); g = np.where(env > 0.01, 0.45, 1.0).astype(np.float32)
g = np.convolve(g, np.ones(int(0.25*SR))/int(0.25*SR), 'same').astype(np.float32)
mus *= 0.06 / (np.sqrt(np.mean(mus**2)) + 1e-9)
mix = mus*g + fx*0.8 + v
mix = sfx.limit(mix, 0.95)
os.makedirs(f'{H}/out', exist_ok=True)
sf.write(f'{H}/out/mix.wav', np.stack([mix, mix], 1), SR)
print('ok', float(np.abs(mix).max()))
