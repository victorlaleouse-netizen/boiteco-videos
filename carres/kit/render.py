"""Rendu vidéo de la course (PIL -> ffmpeg) + bande son synthétisée."""
import sys, json, math, subprocess, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import sim

SEED = int(sys.argv[1]); PARAMS = json.loads(sys.argv[2]); OUT = sys.argv[3]
r = sim.run(SEED, max_t=95, **PARAMS)
frames, events = r['frames'], r['events']
FPS = 30; Wv, Hv = 1080, 1920
T = 80; OX = (Wv - sim.W * T) // 2; OY = 320
END_PAD = 4.0
n_frames = len(frames)

FB = '/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'
FX = '/usr/share/fonts/truetype/google-fonts/Poppins-ExtraBold.ttf'
import os
if not os.path.exists(FX): FX = FB
FM = '/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf'
if not os.path.exists(FM): FM = FB
def font(p, s): return ImageFont.truetype(p, s)

COL = {'g': (34, 197, 94), 'y': (250, 204, 21), 'r': (239, 68, 68), 'b': (59, 130, 246)}
DARK = {k: tuple(int(c * 0.55) for c in v) for k, v in COL.items()}
NAME = {'g': 'VERT', 'y': 'JAUNE', 'r': 'ROUGE', 'b': 'BLEU'}
BG = (17, 20, 30); WALL = (36, 41, 56); WALL_EDGE = (58, 65, 86); FLOOR = (236, 232, 222); FLOOR_LINE = (222, 217, 205)
WATER = (20, 170, 200); WATER_D = (12, 110, 150)
KCOL = (70, 74, 88)


def tile_rect(x, y): return (OX + x * T, OY + y * T, OX + (x + 1) * T, OY + (y + 1) * T)


def draw_bricks(d, x, y, base, mortar, hp_frac=1.0):
    x0, y0, x1, y1 = tile_rect(x, y)
    d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=base)
    rows = 4; h = T / rows
    for i in range(1, rows): d.line((x0, y0 + i * h, x1, y0 + i * h), fill=mortar, width=3)
    for i in range(rows):
        off = 0 if i % 2 == 0 else T / 2
        for k in range(0, 3):
            xx = x0 + off + k * T / 2
            if x0 < xx < x1: d.line((xx, y0 + i * h, xx, y0 + (i + 1) * h), fill=mortar, width=3)
    if hp_frac < 1:  # cracks
        d.line((x0 + 12, y0 + 10, x0 + T / 2, y0 + T / 2, x0 + T - 18, y0 + T - 8), fill=mortar, width=4)
        d.line((x0 + T / 2, y0 + T / 2, x0 + T - 10, y0 + 20), fill=mortar, width=3)


def static_layer(tiles, hp):
    im = Image.new('RGB', (Wv, Hv), BG)
    d = ImageDraw.Draw(im)
    # subtle background dots
    for yy in range(0, Hv, 40):
        for xx in range(0, Wv, 40): d.point((xx, yy), fill=(28, 32, 46))
    d.rounded_rectangle((OX - 14, OY - 14, OX + sim.W * T + 14, OY + sim.H * T + 14), 26, fill=WALL)
    for y in range(sim.H):
        for x in range(sim.W):
            c = tiles[y][x]; x0, y0, x1, y1 = tile_rect(x, y)
            if c in '.HF' or c == ' ':
                d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=FLOOR)
                d.line((x0, y1 - 1, x1, y1 - 1), fill=FLOOR_LINE); d.line((x1 - 1, y0, x1 - 1, y1), fill=FLOOR_LINE)
            if c == 'F':
                q = T // 4
                for i in range(4):
                    for j in range(4):
                        if (i + j) % 2 == 0: d.rectangle((x0 + i * q, y0 + j * q, x0 + (i + 1) * q - 1, y0 + (j + 1) * q - 1), fill=(25, 25, 30))
            elif c in 'gyrb':
                draw_bricks(d, x, y, COL[c], DARK[c], hp.get(f'{x},{y}', 2) / 2)
            elif c == 'K':
                draw_bricks(d, x, y, KCOL, (40, 43, 52))
    # wall bevel edges
    for y in range(sim.H):
        for x in range(sim.W):
            if tiles[y][x] == '#':
                x0, y0, x1, y1 = tile_rect(x, y)
                for dx, dy, seg in ((0, -1, (x0, y0, x1, y0)), (0, 1, (x0, y1 - 1, x1, y1 - 1)), (-1, 0, (x0, y0, x0, y1)), (1, 0, (x1 - 1, y0, x1 - 1, y1))):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < sim.W and 0 <= ny < sim.H and tiles[ny][nx] != '#': d.line(seg, fill=WALL_EDGE, width=3)
    # flag pole on finish
    fx = [(x, y) for y in range(sim.H) for x in range(sim.W) if tiles[y][x] == 'F']
    return im


def draw_hammer(d, cx, cy, s=1.0, ang=-0.6):
    def rot(px, py):
        return (cx + (px * math.cos(ang) - py * math.sin(ang)) * s, cy + (px * math.sin(ang) + py * math.cos(ang)) * s)
    handle = [rot(-4, -2), rot(26, -2), rot(26, 4), rot(-4, 4)]
    handle = [rot(-5, -22), rot(5, -22), rot(5, 26), rot(-5, 26)]
    head = [rot(-22, -30), rot(22, -30), rot(22, -14), rot(-22, -14)]
    d.polygon(handle, fill=(196, 140, 72), outline=(80, 50, 20))
    d.polygon(head, fill=(150, 160, 175), outline=(40, 44, 52))


# ---------- events by frame
ev_by_f = {}
for e in events:
    ev_by_f.setdefault(int(round(e['t'] * FPS)), []).append(e)

toasts = []  # (t0, text, color)
for e in events:
    if e['type'] == 'break' and e['k']: toasts.append((e['t'], f"{NAME[e['c']]} casse un bloc", COL[e['c']]))
    elif e['type'] == 'break' and e['t'] > 6: toasts.append((e['t'], f"{NAME[e['c']]} ouvre sa porte", COL[e['c']]))
    elif e['type'] == 'out': toasts.append((e['t'], f"{NAME[e['c']]} est noyé", COL[e['c']]))
# de-dup toasts too close
tt = []
for t0, tx, c in sorted(toasts):
    if tt and t0 - tt[-1][0] < 1.2: continue
    tt.append((t0, tx, c))
toasts = tt
win = next((e for e in events if e['type'] == 'win'), None)

F_TITLE = font(FX, 64); F_SUB = font(FM, 34); F_TOAST = font(FB, 44); F_BIG = font(FX, 220); F_CHIP = font(FB, 30); F_WIN = font(FX, 96); F_WIN2 = font(FB, 40)

trail = {c: [] for c in 'gyrb'}
proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{Wv}x{Hv}', '-r', str(FPS), '-i', '-',
                         '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', OUT + '.video.mp4'], stdin=subprocess.PIPE)
last_key = None; base = None
total = min(n_frames, int(os.environ.get('LIMIT', n_frames)))
rng = random.Random(3)
conf = [(rng.uniform(0, Wv), rng.uniform(-600, 0), rng.uniform(-60, 60), rng.uniform(250, 520), rng.choice(list(COL.values())), rng.uniform(0, 6)) for _ in range(160)]
shake = 0.0

for fi in range(total):
    fr = frames[fi]; t = fr['t']
    key = (tuple(fr['tiles']), tuple(sorted(fr['hp'].items())))
    if key != last_key: base = static_layer(fr['tiles'], fr['hp']); last_key = key
    im = base.copy(); d = ImageDraw.Draw(im, 'RGBA')
    # water (follows the path)
    fl = fr['flood']
    for y in range(sim.H):
        for x in range(sim.W):
            w = fl[y][x]
            if w <= 0: continue
            x0, y0, x1, y1 = tile_rect(x, y)
            if w >= 1:
                d.rectangle((x0, y0, x1 - 1, y1 - 1), fill=WATER + (240,)); continue
            # grow from the flooded neighbour side
            box = None
            for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < sim.W and 0 <= ny < sim.H and fl[ny][nx] >= 1:
                    k = w * T
                    if dy == 1: box = (x0, y1 - k, x1 - 1, y1 - 1); edge = [(xx, y1 - k + 3 * math.sin(xx / 16 + t * 6)) for xx in range(x0, x1 + 1, 6)]
                    elif dy == -1: box = (x0, y0, x1 - 1, y0 + k); edge = [(xx, y0 + k + 3 * math.sin(xx / 16 + t * 6)) for xx in range(x0, x1 + 1, 6)]
                    elif dx == 1: box = (x1 - k, y0, x1 - 1, y1 - 1); edge = [(x1 - k + 3 * math.sin(yy / 16 + t * 6), yy) for yy in range(y0, y1 + 1, 6)]
                    else: box = (x0, y0, x0 + k, y1 - 1); edge = [(x0 + k + 3 * math.sin(yy / 16 + t * 6), yy) for yy in range(y0, y1 + 1, 6)]
                    break
            if box and box[2] > box[0] and box[3] > box[1]:
                d.rectangle(box, fill=WATER + (240,)); d.line(edge, fill=(170, 240, 250, 255), width=4)
    # hammer
    if fr['hammer']:
        hx, hy = fr['hammer']; cx, cy = OX + (hx + .5) * T, OY + (hy + .5) * T + 4 * math.sin(t * 4)
        d.ellipse((cx - 30, cy - 30, cx + 30, cy + 30), fill=(255, 220, 120, 70))
        draw_hammer(d, cx, cy, 0.9)
    # flag glow
    # squares
    for i, c in enumerate('gyrb'):
        x, y, vx, vy, alive, ham = fr['sq'][i]
        px, py = OX + x * T, OY + y * T
        if alive and t >= 3.0:
            trail[c].append((px, py))
            trail[c] = trail[c][-9:]
        if alive:
            for k, (tx, ty) in enumerate(trail[c][:-1]):
                a = int(25 + 110 * k / 9); s = sim.SIZE * T / 2 * (0.45 + 0.5 * k / 9)
                d.rounded_rectangle((tx - s, ty - s, tx + s, ty + s), 6, fill=COL[c] + (a,))
        s = sim.SIZE * T / 2
        if not alive:
            out_e = next(e for e in events if e['type'] == 'out' and e['c'] == c)
            age = t - out_e['t']
            if age > 1.6: continue
            col = tuple(int(v * 0.5 + 60) for v in COL[c]); a = int(255 * max(0, 1 - age / 1.6))
            d.rounded_rectangle((px - s, py - s + age * 20, px + s, py + s + age * 20), 8, fill=col + (a,))
            continue
        d.rounded_rectangle((px - s - 3, py - s - 3, px + s + 3, py + s + 3), 10, fill=(15, 18, 26, 255))
        d.rounded_rectangle((px - s, py - s, px + s, py + s), 8, fill=COL[c] + (255,))
        d.rounded_rectangle((px - s + 4, py - s + 4, px + s - 4, py - s + 12), 4, fill=(255, 255, 255, 70))
        # eyes looking where it goes
        for ex in (-9, 9):
            cx, cy = px + ex, py - 2
            d.ellipse((cx - 7, cy - 7, cx + 7, cy + 7), fill=(255, 255, 255, 255))
            d.ellipse((cx - 3.5 + vx * 3.5, cy - 3.5 + vy * 3.5, cx + 3.5 + vx * 3.5, cy + 3.5 + vy * 3.5), fill=(15, 18, 26, 255))
        if ham: draw_hammer(d, px + s + 6, py - s - 6, 0.55, -0.9)
    # ---- UI
    d.text((Wv / 2, 120), "LA COURSE DES CARRÉS", font=F_TITLE, fill=(255, 255, 255), anchor='mm')
    d.text((Wv / 2, 196), "Chacun casse sa couleur. L'eau arrive.", font=F_SUB, fill=(170, 180, 205), anchor='mm')
    # chips
    cw = 220; gap = 18; x0 = (Wv - (4 * cw + 3 * gap)) / 2; yb = OY + sim.H * T + 110
    for i, c in enumerate('gyrb'):
        alive = fr['sq'][i][4]; xx = x0 + i * (cw + gap)
        fill = COL[c] + (255,) if alive else (60, 64, 78, 255)
        d.rounded_rectangle((xx, yb - 34, xx + cw, yb + 34), 34, fill=fill)
        d.text((xx + cw / 2, yb), NAME[c], font=F_CHIP, fill=(15, 18, 26) if alive else (130, 135, 150), anchor='mm')
        if not alive: d.line((xx + 30, yb, xx + cw - 30, yb), fill=(130, 135, 150), width=4)
        if fr['sq'][i][5]: draw_hammer(d, xx + cw - 10, yb - 34, 0.6, -0.9)
    # countdown
    if t < 3.0:
        n = 3 - int(t); ph = t - int(t)
        sc = 1.25 - 0.25 * min(1, ph * 4)
        fnt = font(FX, int(220 * sc))
        d.text((Wv / 2, OY + 7 * T), str(n), font=fnt, fill=(255, 255, 255, int(255 * (1 - ph * 0.6))), anchor='mm', stroke_width=10, stroke_fill=(15, 18, 26))
    elif t < 3.7:
        d.text((Wv / 2, OY + 7 * T), "GO !", font=F_BIG, fill=(255, 255, 255, int(255 * (1 - (t - 3) / 0.7))), anchor='mm', stroke_width=10, stroke_fill=(15, 18, 26))
    # toasts
    for t0, txt, c in toasts:
        age = t - t0
        if 0 <= age < 1.8 and not (win and t >= win['t']):
            a = min(1, age / 0.15, (1.8 - age) / 0.3); yy = 262 - 10 * (1 - min(1, age / 0.2))
            wtxt = d.textlength(txt, font=F_TOAST)
            d.text((Wv / 2, OY + 9.5 * T), txt, font=F_TOAST, fill=c + (int(255 * a),), anchor='mm', stroke_width=7, stroke_fill=(15, 18, 26, int(255 * a)))
    # win
    if win and t >= win['t']:
        age = t - win['t']; c = win['c']
        a = min(1, age / 0.25)
        d.rectangle((0, 0, Wv, Hv), fill=(10, 12, 18, int(150 * a)))
        sc = 1 + 0.25 * max(0, 1 - age / 0.35)
        fw = font(FX, int(110 * sc))
        d.text((Wv / 2, Hv / 2 - 80), f"{NAME[c]} GAGNE !", font=fw, fill=COL[c] + (int(255 * a),), anchor='mm', stroke_width=10, stroke_fill=(15, 18, 26, int(255 * a)))
        sub = "Premier au drapeau." if win.get('how') == 'drapeau' else "Dernier survivant."
        d.text((Wv / 2, Hv / 2 + 40), sub, font=F_WIN2, fill=(230, 235, 245, int(255 * a)), anchor='mm')
        for (cx, cy, vx, vy, col, ph) in conf:
            yy = cy + vy * age; xx = cx + vx * age + 20 * math.sin(age * 3 + ph)
            if 0 < yy < Hv: d.rectangle((xx, yy, xx + 14, yy + 8), fill=col + (int(255 * a),))
    proc.stdin.write(im.tobytes())
    if fi % 300 == 0: print('frame', fi, '/', total, flush=True)
proc.stdin.close(); proc.wait()
json.dump({'events': events, 'n': total, 'win': win}, open(OUT + '.events.json', 'w'))
print('done', total)
