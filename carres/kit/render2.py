"""Rendu façon square_derby (fond gris, murs gris, sols clairs cerclés de noir, eau violette) avec nos cubes animés. Aucun texte."""
import sys, json, math, subprocess, random, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import sim2 as sim

SEED = int(sys.argv[1]); PARAMS = json.loads(sys.argv[2]); OUT = sys.argv[3]
r = sim.run(SEED, max_t=100, **PARAMS)
T_START = PARAMS.get('t_start', 1.0)
frames, events = r['frames'], r['events']; SH, SW = r['shape']
FPS = 30; Wv, Hv = 1080, 1920
U = 60; OX = (Wv - sim.W * U) // 2; OY = (Hv - sim.H * U) // 2
SUBPX = U // sim.SUB
total = min(len(frames), int(os.environ.get('LIMIT', len(frames))))

COL = {'g': (22, 128, 74), 'y': (250, 214, 40), 'r': (214, 18, 24), 'b': (24, 104, 232)}
COLB = {'g': (24, 128, 72), 'y': (247, 208, 20), 'r': (214, 10, 16), 'b': (20, 96, 240)}
WALL = (163, 163, 160); FLOOR = (221, 221, 214); LINE = (22, 22, 24)
WATER = np.array([60, 49, 139], dtype=np.float32)
KCOL = (44, 46, 54); KMOR = (78, 82, 94)
MOR = {'g': (12, 80, 46), 'y': (168, 140, 20), 'r': (130, 10, 14), 'b': (14, 62, 150)}
FX = '/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'

# background gradient
yy = np.linspace(0, 1, Hv)[:, None]
g = (139 + (172 - 139) * (1 - np.abs(yy - 0.5) * 2))
BGARR = np.repeat(np.repeat(g[:, :, None], 3, axis=2), Wv, axis=1).astype(np.uint8)
BGARR[..., 2] = np.clip(BGARR[..., 2].astype(int) - 3, 0, 255)


def cell(x, y): return (OX + x * U, OY + y * U, OX + (x + 1) * U, OY + (y + 1) * U)


def bricks(d, x, y, base, mor):
    x0, y0, x1, y1 = cell(x, y)
    d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=base)
    h = U / 3
    for i in range(1, 3): d.line((x0 + 3, y0 + i * h, x1 - 4, y0 + i * h), fill=mor, width=2)
    for i in range(3):
        off = U / 4 if i % 2 == 0 else U * 0.6
        xx = x0 + off; d.line((xx, y0 + i * h + 3, xx, y0 + (i + 1) * h - 3), fill=mor, width=2)
        xx2 = xx + U / 2
        if xx2 < x1 - 4: d.line((xx2, y0 + i * h + 3, xx2, y0 + (i + 1) * h - 3), fill=mor, width=2)
    d.rectangle((x0, y0, x1 - 1, y1 - 1), outline=LINE, width=2)


def layers(tiles):
    base = Image.fromarray(BGARR.copy()); d = ImageDraw.Draw(base)
    top = Image.new('RGBA', (Wv, Hv), (0, 0, 0, 0)); dt = ImageDraw.Draw(top)
    isfloor = lambda x, y: 0 <= x < sim.W and 0 <= y < sim.H and tiles[y][x] != '#'
    # maze body grey
    d.rectangle((OX, OY, OX + sim.W * U - 1, OY + sim.H * U - 1), fill=WALL)
    for y in range(sim.H):
        for x in range(sim.W):
            if isfloor(x, y): d.rectangle(cell(x, y)[:2] + (cell(x, y)[2] - 1, cell(x, y)[3] - 1), fill=FLOOR)
    # top layer: walls (opaque) so water never shows on them, outlines, bricks, finish
    for y in range(sim.H):
        for x in range(sim.W):
            x0, y0, x1, y1 = cell(x, y); c = tiles[y][x]
            if c == '#':
                dt.rectangle((x0, y0, x1 - 1, y1 - 1), fill=WALL + (255,))
            elif c in 'gyrb': bricks(dt, x, y, COL[c], MOR[c])
            elif c == 'K': bricks(dt, x, y, KCOL, KMOR)
            elif c == 'F':
                q = U // 3
                for i in range(3):
                    for j in range(3):
                        dt.rectangle((x0 + i * q, y0 + j * q, x0 + (i + 1) * q - 1, y0 + (j + 1) * q - 1), fill=(20, 20, 22, 255) if (x * 3 + i + y * 3 + j) % 2 == 0 else (245, 245, 245, 255))
    # outside of the maze: background (walls on the outer ring blend into bg like the reference)
    bgimg = Image.fromarray(BGARR)
    for y in range(sim.H):
        for x in range(sim.W):
            if tiles[y][x] == '#' and (x in (0, sim.W - 1) or y in (0, sim.H - 1)):
                box = cell(x, y); patch = bgimg.crop(box)
                base.paste(patch, box[:2]); top.paste(patch.convert('RGBA'), box[:2])
    # outlines on floor/wall boundaries
    for y in range(sim.H):
        for x in range(sim.W):
            if not isfloor(x, y): continue
            x0, y0, x1, y1 = cell(x, y)
            if not isfloor(x, y - 1): dt.line((x0 - 1, y0, x1, y0), fill=LINE + (255,), width=3)
            if not isfloor(x, y + 1): dt.line((x0 - 1, y1 - 1, x1, y1 - 1), fill=LINE + (255,), width=3)
            if not isfloor(x - 1, y): dt.line((x0, y0 - 1, x0, y1), fill=LINE + (255,), width=3)
            if not isfloor(x + 1, y): dt.line((x1 - 1, y0 - 1, x1 - 1, y1), fill=LINE + (255,), width=3)
    return base, top


win = next((e for e in events if e['type'] == 'win'), None)
rng = random.Random(5)
conf = [(rng.uniform(0, Wv), rng.uniform(-700, 0), rng.uniform(-80, 80), rng.uniform(300, 600), rng.choice(list(COLB.values())), rng.uniform(0, 6), rng.uniform(0, 3)) for _ in range(220)]
F_CD = {k: ImageFont.truetype(FX, k) for k in (200, 230, 260)}
trail = {c: [] for c in 'gyrb'}

proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{Wv}x{Hv}', '-r', str(FPS), '-i', '-',
                         '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', OUT + '.video.mp4'], stdin=subprocess.PIPE)
last = None
for fi in range(total):
    fr = frames[fi]; t = fr['t']
    if fr['tiles'] != last: base, top = layers(fr['tiles']); last = fr['tiles']; base_arr = np.asarray(base).astype(np.float32)
    arr = base_arr.copy()
    if fr['wet'] is not None:
        a = np.unpackbits(fr['wet'])[:SH * SW].reshape(SH, SW).astype(np.float32)
        img = Image.fromarray((a * 255).astype(np.uint8)).resize((sim.W * U, sim.H * U), Image.BILINEAR)
        m = np.asarray(img).astype(np.float32)[:, :, None] / 255.0
        m = np.clip((m - 0.5) * 3 + 0.5, 0, 1)
        sl = arr[OY:OY + sim.H * U, OX:OX + sim.W * U]
        arr[OY:OY + sim.H * U, OX:OX + sim.W * U] = sl * (1 - m) + WATER * m
    im = Image.fromarray(arr.astype(np.uint8))
    im.paste(top, (0, 0), top)
    d = ImageDraw.Draw(im, 'RGBA')
    s = sim.SIZE * U / 2
    for i, c in enumerate('gyrb'):
        x, y, vx, vy, alive = fr['sq'][i]
        px, py = OX + x * U, OY + y * U
        if alive and t >= T_START:
            trail[c].append((px, py)); trail[c] = trail[c][-10:]
        if not alive:
            oe = next(e for e in events if e['type'] == 'out' and e['c'] == c)
            age = t - oe['t']
            if age > 0.8: continue
            k = max(0, 1 - age / 0.8); ss = s * (0.3 + 0.7 * k)
            d.rectangle((px - ss, py - ss, px + ss, py + ss), fill=COLB[c] + (int(255 * k),), outline=LINE + (int(255 * k),), width=2)
            continue
        # comet trail like the reference: a translucent triangle behind the square, against the motion
        if t >= T_START:
            nx_, ny_ = -vy, vx
            L = s * 3.2
            tri = [(px + nx_ * s * 0.9, py + ny_ * s * 0.9), (px - nx_ * s * 0.9, py - ny_ * s * 0.9), (px - vx * L, py - vy * L)]
            d.polygon(tri, fill=COLB[c] + (110,))
        d.rectangle((px - s, py - s, px + s, py + s), fill=COLB[c] + (255,), outline=LINE + (255,), width=2)
    # win: dim, winner cube big with crown, confetti
    if win and t >= win['t']:
        age = t - win['t']; c = win['c']; a = min(1, age / 0.3)
        d.rectangle((0, 0, Wv, Hv), fill=(18, 18, 22, int(140 * a)))
        sc = 1 + 0.3 * max(0, 1 - age / 0.4); S = 150 * sc * a
        cx, cy = Wv / 2, Hv / 2 + 40 + 10 * math.sin(age * 4)
        d.rectangle((cx - S, cy - S, cx + S, cy + S), fill=COLB[c] + (255,), outline=LINE + (255,), width=6)
        cw = 130 * sc * a; cyt = cy - S - 20
        crown = [(cx - cw, cyt), (cx - cw, cyt - 90 * a), (cx - cw * 0.5, cyt - 40 * a), (cx, cyt - 110 * a), (cx + cw * 0.5, cyt - 40 * a), (cx + cw, cyt - 90 * a), (cx + cw, cyt)]
        d.polygon(crown, fill=(255, 200, 40, 255), outline=(120, 80, 0, 255))
        for (x0, y0, vx, vy, col, ph, rot) in conf:
            yy2 = y0 + vy * age; xx2 = x0 + vx * age + 25 * math.sin(age * 3 + ph)
            if 0 < yy2 < Hv:
                w2 = 9 + 6 * math.sin(age * 8 + rot)
                d.rectangle((xx2, yy2, xx2 + abs(w2) + 3, yy2 + 9), fill=col + (255,))
    proc.stdin.write(im.tobytes())
    if fi % 300 == 0: print('frame', fi, '/', total, flush=True)
proc.stdin.close(); proc.wait()
json.dump({'events': events, 'n': total, 'win': win}, open(OUT + '.events.json', 'w'))
print('done', total)
