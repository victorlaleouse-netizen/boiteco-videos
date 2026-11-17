"""Course des carrés v3 : grille fine façon square_derby, eau qui s'écoule le long du chemin (champ de distance sur sous-grille)."""
import math, random, heapq

GRID = [
    "################",
    "#..............#",
    "#.....K.K.K....#",
    "#....######....#",
    "#....#.........#",
    "#....#......K..#",
    "#....#.........#",
    "#yygg#....######",
    "#....#.........#",
    "#....#..K......#",
    "#....#.........#",
    "#....#K#####...#",
    "#rrrr#.........#",
    "#....#......K..#",
    "#....#.........#",
    "#....#....######",
    "#....#.........#",
    "#bbbb#..K......#",
    "#....#.........#",
    "#....##K####...#",
    "#....#.........#",
    "#....#......K..#",
    "#....#.........#",
    "#....#....######",
    "#....#.........#",
    "#....#.......FF#",
    "################",
]
H = len(GRID); W = len(GRID[0])
COLORS = ['g', 'y', 'r', 'b']
STARTS = {'y': (2.0, 9.0), 'g': (3.3, 10.2), 'r': (2.6, 14.5), 'b': (2.4, 22.5)}
SIZE = 0.8
FPS = 30
SUB = 4  # water sub-cells per cell
PUSH_R = (0.08, 0.16, 0.25)
SOURCES = [(x, 25) for x in (1, 2, 3, 4)]


def run(seed, speed=4.6, flood0=1.0, flood_acc=0.01, flood_delay=5.0, t_start=0.3, max_t=95):
    rnd = random.Random(seed)
    tiles = [list(r) for r in GRID]
    sq = []
    for c in COLORS:
        a = rnd.uniform(0, 2 * math.pi)
        while min(abs(math.cos(a)), abs(math.sin(a))) < 0.3: a = rnd.uniform(0, 2 * math.pi)
        x0, y0 = STARTS[c]
        sq.append({'c': c, 'x': x0, 'y': y0, 'vx': math.cos(a), 'vy': math.sin(a), 'alive': True, 'out_t': None})
    SW, SH = W * SUB, H * SUB
    dist = None; front = 0.0
    frames, events = [], []
    winner = None; t_win = None; t = 0.0; dt = 1.0 / FPS; sub = 4
    wetm = None
    dlist = []
    import numpy as _np

    def floor_cell(x, y):
        return 0 <= x < W and 0 <= y < H and tiles[y][x] in '.F'

    def compute_dist():
        """Harmonic potential (Laplace) on the water's connected area: 0 at the source, 1 at the exits.
        Iso-lines are perpendicular to walls -> straight fronts like a real flow. Returns (phi, order, comp_size)."""
        import numpy as np
        from scipy.sparse import lil_matrix
        from scipy.sparse.linalg import spsolve
        fl = np.zeros((SH, SW), bool)
        for y in range(H):
            for x in range(W):
                if floor_cell(x, y): fl[y * SUB:(y + 1) * SUB, x * SUB:(x + 1) * SUB] = True
        src = np.zeros((SH, SW), bool)
        for (x, y) in SOURCES: src[y * SUB:(y + 1) * SUB, x * SUB:(x + 1) * SUB] = True
        if wetm is not None: src |= wetm
        # component reachable from source
        comp = np.zeros((SH, SW), bool); st = list(zip(*np.nonzero(src & fl)))
        for p in st: comp[p] = True
        while st:
            y, x = st.pop()
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < SH and 0 <= nx < SW and fl[ny, nx] and not comp[ny, nx]: comp[ny, nx] = True; st.append((ny, nx))
        # exits: finish cells in comp, else comp cells touching a breakable brick
        ex = np.zeros((SH, SW), bool)
        for y in range(H):
            for x in range(W):
                if tiles[y][x] == 'F': ex[y * SUB:(y + 1) * SUB, x * SUB:(x + 1) * SUB] = True
        ex &= comp
        if not ex.any():
            for y in range(H):
                for x in range(W):
                    if tiles[y][x] in 'Kgyrb':
                        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                            ny, nx = y + dy, x + dx
                            if floor_cell(nx, ny):
                                blk = np.zeros((SH, SW), bool); blk[ny * SUB:(ny + 1) * SUB, nx * SUB:(nx + 1) * SUB] = True
                                ex |= blk & comp
        idx = -np.ones((SH, SW), int); cells = np.argwhere(comp); idx[comp] = np.arange(len(cells))
        n = len(cells); A = lil_matrix((n, n)); bvec = np.zeros(n)
        for k, (y, x) in enumerate(cells):
            if src[y, x]: A[k, k] = 1; bvec[k] = 0; continue
            if ex[y, x]: A[k, k] = 1; bvec[k] = 1; continue
            deg = 0
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < SH and 0 <= nx < SW and comp[ny, nx]: A[k, idx[ny, nx]] = -1; deg += 1
            A[k, k] = deg if deg else 1
        sol = spsolve(A.tocsr(), bvec) if ex.any() else np.zeros(n)
        phi = np.full((SH, SW), 9.0); phi[comp] = sol
        order = np.argsort(phi, axis=None)[:n]
        return phi, order, n

    def is_wet(px, py):
        if wetm is None: return False
        sx, sy = int(px * SUB), int(py * SUB)
        if 0 <= sx < SW and 0 <= sy < SH: return bool(wetm[sy, sx])
        return False

    def overlap(s, x=None, y=None):
        x = s['x'] if x is None else x; y = s['y'] if y is None else y
        hs = SIZE / 2
        x0, x1 = int(math.floor(x - hs)), int(math.floor(x + hs - 1e-9))
        y0, y1 = int(math.floor(y - hs)), int(math.floor(y + hs - 1e-9))
        for ty in range(y0, y1 + 1):
            for tx in range(x0, x1 + 1):
                if tx < 0 or ty < 0 or tx >= W or ty >= H or tiles[ty][tx] not in '.F': return ('cell', tx, ty)
        if wetm is not None:
            for py in (y - hs + 0.02, y, y + hs - 0.02):
                for px in (x - hs + 0.02, x, x + hs - 0.02):
                    if is_wet(px, py): return ('water', 0, 0)
        return None

    while t < max_t:
        moving = t >= t_start and winner is None
        if t >= t_start + flood_delay and winner is None:
            if dist is None:
                dist, order, csize = compute_dist(); wetm = _np.zeros((SH, SW), bool)
                for (sx0, sy0) in SOURCES: wetm[sy0 * SUB + SUB - 1:(sy0 + 1) * SUB, sx0 * SUB:(sx0 + 1) * SUB] = True
                front = float(wetm.sum())
            front = min(front + (flood0 + flood_acc * (t - t_start - flood_delay)) * SUB * SUB * dt, csize)
            nw = _np.zeros(SH * SW, bool); nw[order[:int(front)]] = True
            wetm |= nw.reshape(SH, SW)
        broke = False
        if moving:
            for _ in range(sub):
                h = dt / sub
                prev = [(s['x'], s['y']) for s in sq]
                for s in sq:
                    if not s['alive']: continue
                    for axis in (0, 1):
                        mv = (s['vx'] if axis == 0 else s['vy']) * speed * h
                        if axis == 0: s['x'] += mv
                        else: s['y'] += mv
                        hit = overlap(s)
                        if hit:
                            if axis == 0: s['x'] -= mv; s['vx'] = -s['vx']
                            else: s['y'] -= mv; s['vy'] = -s['vy']
                            kind = 'water' if hit[0] == 'water' else 'wall'
                            if hit[0] == 'cell':
                                _, tx, ty = hit; c = tiles[ty][tx] if 0 <= tx < W and 0 <= ty < H else '#'
                                if c == s['c'] or c == 'K':
                                    tiles[ty][tx] = '.'; kind = 'break'; broke = True
                                    events.append({'t': t, 'type': 'break', 'c': s['c'], 'tile': [tx, ty], 'k': c == 'K'})
                            events.append({'t': t, 'type': 'bounce', 'c': s['c'], 'kind': kind})
                            a = math.atan2(s['vy'], s['vx']) + rnd.uniform(-0.2, 0.2)
                            if min(abs(math.cos(a)), abs(math.sin(a))) < 0.25: a += 0.3 * (1 if rnd.random() < .5 else -1)
                            nvx, nvy = math.cos(a), math.sin(a)
                            if axis == 0 and (nvx > 0) != (s['vx'] > 0): nvx = -nvx
                            if axis == 1 and (nvy > 0) != (s['vy'] > 0): nvy = -nvy
                            s['vx'], s['vy'] = nvx, nvy
                al = [i for i, s in enumerate(sq) if s['alive']]
                for ii in range(len(al)):
                    for jj in range(ii + 1, len(al)):
                        A, B = sq[al[ii]], sq[al[jj]]
                        dx = A['x'] - B['x']; dy = A['y'] - B['y']
                        px_, py_ = SIZE - abs(dx), SIZE - abs(dy)
                        if px_ > 0 and py_ > 0:
                            if px_ < py_:
                                sgn = 1 if dx >= 0 else -1
                                if (A['vx'] - B['vx']) * sgn < 0: A['vx'], B['vx'] = B['vx'], A['vx']
                                for S, k in ((A, 1), (B, -1)):
                                    ox = S['x']; S['x'] += k * sgn * (px_ / 2 + 0.01)
                                    if overlap(S): S['x'] = ox
                            else:
                                sgn = 1 if dy >= 0 else -1
                                if (A['vy'] - B['vy']) * sgn < 0: A['vy'], B['vy'] = B['vy'], A['vy']
                                for S, k in ((A, 1), (B, -1)):
                                    oy = S['y']; S['y'] += k * sgn * (py_ / 2 + 0.01)
                                    if overlap(S): S['y'] = oy
                            events.append({'t': t, 'type': 'bounce', 'c': A['c'], 'kind': 'hit'})
            if broke and dist is not None:
                dist, order, csize = compute_dist(); front = int(wetm.sum())
            # water grew onto a square: small push ahead, eliminated if it cannot escape
            if wetm is not None:
                for s in sq:
                    if not s['alive'] or winner: continue
                    if overlap(s) == ('water', 0, 0):
                        best = None
                        for k in range(16):
                            ang = k * math.pi / 8
                            for rr in PUSH_R:
                                nx, ny = s['x'] + math.cos(ang) * rr, s['y'] + math.sin(ang) * rr
                                if not overlap(s, nx, ny):
                                    sc = dist[int(ny * SUB), int(nx * SUB)]
                                    if best is None or sc > best[0]: best = (sc, nx, ny, ang)
                                    break
                        if best:
                            _, s['x'], s['y'], ang = best
                            if math.cos(ang) * s['vx'] + math.sin(ang) * s['vy'] < 0: s['vx'], s['vy'] = -s['vx'], -s['vy']
                        still = overlap(s) == ('water', 0, 0) or is_wet(s['x'], s['y'])
                        s['wet_t'] = s.get('wet_t', 0) + dt if (still or best is None) else 0
                        if s['wet_t'] < 0.25: continue
                        if True:
                            s['alive'] = False; s['out_t'] = t; events.append({'t': t, 'type': 'out', 'c': s['c']})
                            alive = [q for q in sq if q['alive']]
                            if len(alive) == 1 and winner is None:
                                winner = alive[0]['c']; t_win = t; events.append({'t': t, 'type': 'win', 'c': winner, 'how': 'survie'})
            for s in sq:
                if s['alive'] and winner is None and tiles[int(s['y'])][int(s['x'])] == 'F':
                    winner = s['c']; t_win = t; events.append({'t': t, 'type': 'win', 'c': s['c'], 'how': 'drapeau'})
        frames.append({'t': round(t, 4), 'sq': [[s['x'], s['y'], s['vx'], s['vy'], s['alive']] for s in sq],
                       'tiles': [''.join(r) for r in tiles], 'wet': None if wetm is None else _np.packbits(wetm)})
        t += dt
        if winner and t > t_win + 4.0: break
        if all(not s['alive'] for s in sq): break
    return {'seed': seed, 'winner': winner, 't_win': t_win, 'events': events, 'frames': frames, 'shape': (SH, SW)}


if __name__ == '__main__':
    import sys
    sp, f0, fa, fd = map(float, sys.argv[1:5])
    for seed in range(int(sys.argv[5]), int(sys.argv[6])):
        r = run(seed, speed=sp, flood0=f0, flood_acc=fa, flood_delay=fd)
        o = [(e['c'], round(e['t'])) for e in r['events'] if e['type'] == 'out']
        k = sum(1 for e in r['events'] if e['type'] == 'break' and e['k'])
        w = [e for e in r['events'] if e['type'] == 'win']
        print(seed, r['winner'], r['t_win'] and round(r['t_win']), w and w[0]['how'], 'OUT', o, 'K', k, flush=True)
