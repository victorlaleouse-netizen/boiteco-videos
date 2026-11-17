"""Course de carrés : simulation déterministe (seed) d'une course de 4 carrés dans un labyrinthe avec eau montante."""
import math, random, json, sys

GRID = [
    "#############",
    "#...........#",
    "#...........#",
    "#...#######.#",
    "#yyy#..K....#",
    "#...#.K######",
    "#rrr#.......#",
    "#...#######.#",
    "#ggg#..K....#",
    "#...#####K###",
    "#bbb#.......#",
    "#...#######.#",
    "#...#.....K.#",
    "#...#.#######",
    "#...#...K...#",
    "#...######FF#",
    "#############",
]
H = len(GRID); W = len(GRID[0])
COLORS = ['g', 'y', 'r', 'b']
STARTS = {'g': (2.0, 9.5), 'y': (2.0, 5.5), 'r': (2.0, 7.5), 'b': (2.0, 13.5)}
SIZE = 0.56
FPS = 30


def run(seed, speed=5.2, brick_hp=1, k_hp=1, flood0=0.25, flood_acc=0.004, flood_delay=6.0, t_start=3.0, hammer_uses=4, max_t=95):
    rnd = random.Random(seed)
    tiles = [list(r) for r in GRID]
    hp = {}
    for y in range(H):
        for x in range(W):
            c = tiles[y][x]
            if c in COLORS: hp[(x, y)] = brick_hp
            if c == 'K': hp[(x, y)] = k_hp
    hammer_home = None
    hammer = {'pos': None, 'owner': None, 'uses': hammer_uses, 'respawn': None}
    sq = []
    for c in COLORS:
        a = rnd.uniform(0, 2 * math.pi)
        while min(abs(math.cos(a)), abs(math.sin(a))) < 0.3: a = rnd.uniform(0, 2 * math.pi)
        x0, y0 = STARTS[c]
        sq.append({'c': c, 'x': x0, 'y': y0, 'vx': math.cos(a), 'vy': math.sin(a), 'alive': True, 'out_t': None, 'hammer': False})
    flood = [[0.0] * W for _ in range(H)]
    frames, events = [], []
    winner = None; t = 0.0; dt = 1.0 / FPS; t_win = None
    sub = 4

    def solid(tx, ty):
        if tx < 0 or ty < 0 or tx >= W or ty >= H: return True
        return tiles[ty][tx] in '#K' or tiles[ty][tx] in COLORS or flood[ty][tx] >= 1.0

    def overlap(s):
        hs = SIZE / 2
        x0, x1 = int(math.floor(s['x'] - hs)), int(math.floor(s['x'] + hs - 1e-9))
        y0, y1 = int(math.floor(s['y'] - hs)), int(math.floor(s['y'] + hs - 1e-9))
        for ty in range(y0, y1 + 1):
            for tx in range(x0, x1 + 1):
                if solid(tx, ty): return (tx, ty)
        return None

    def open_for_flood(tx, ty):
        return 0 <= tx < W and 0 <= ty < H and tiles[ty][tx] in '.F'

    fi = 0
    level = 0.0
    front = 0.0
    while t < max_t:
        moving = t >= t_start and winner is None
        # flood follows the path: BFS distance from the source, front grows over time
        if t >= t_start + flood_delay:
            front += (flood0 + flood_acc * (t - t_start - flood_delay)) * dt
            dist = {}; q = [(x, 15) for x in (1, 2, 3) if open_for_flood(x, 15)]
            for p in q: dist[p] = 0
            k = 0
            while k < len(q):
                x, y = q[k]; k += 1
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    n = (x + dx, y + dy)
                    if n not in dist and open_for_flood(*n): dist[n] = dist[(x, y)] + 1; q.append(n)
            flood = [[0.0] * W for _ in range(H)]
            for (x, y), dd in dist.items():
                fr = max(0.0, min(1.0, front - dd))
                if fr > 0: flood[y][x] = fr
            level = front
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
                            tx, ty = hit; c = tiles[ty][tx]
                            kind = 'water' if flood[ty][tx] >= 1.0 else 'wall'
                            if (c == s['c']) or c == 'K':
                                hp[(tx, ty)] -= 1; kind = 'brick'
                                if hp[(tx, ty)] <= 0:
                                    tiles[ty][tx] = '.'; kind = 'break'
                                    events.append({'t': t, 'type': 'break', 'c': s['c'], 'tile': [tx, ty], 'k': c == 'K'})
                                    if c == 'K' and False:
                                        hammer['uses'] -= 1
                                        if hammer['uses'] <= 0:
                                            s['hammer'] = False; hammer['owner'] = None; hammer['respawn'] = t + 4; hammer['uses'] = hammer_uses
                                            events.append({'t': t, 'type': 'hammer_used', 'c': s['c']})
                            events.append({'t': t, 'type': 'bounce', 'c': s['c'], 'kind': kind})
                            a = math.atan2(s['vy'], s['vx']) + rnd.uniform(-0.18, 0.18)
                            if min(abs(math.cos(a)), abs(math.sin(a))) < 0.25: a += 0.3 * (1 if rnd.random() < .5 else -1)
                            nvx, nvy = math.cos(a), math.sin(a)
                            # keep the reflected direction sign on the hit axis
                            if axis == 0 and (nvx > 0) != (s['vx'] > 0): nvx = -nvx
                            if axis == 1 and (nvy > 0) != (s['vy'] > 0): nvy = -nvy
                            s['vx'], s['vy'] = nvx, nvy
                # flood: full tiles are walls; a caught square is pushed ahead, drowns only if trapped
                for s in sq:
                    if not s['alive'] or winner: continue
                    tx, ty = int(s['x']), int(s['y'])
                    if flood[ty][tx] >= 1.0:
                        best = None
                        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                            nx, ny = tx + dx, ty + dy
                            if 0 <= nx < W and 0 <= ny < H and tiles[ny][nx] in '.F' and flood[ny][nx] < 1.0:
                                if best is None or flood[ny][nx] < best[0]: best = (flood[ny][nx], dx, dy)
                        if best:
                            _, dx, dy = best
                            ox, oy = s['x'], s['y']
                            s['x'] = tx + 0.5 + dx * 0.75 if dx else s['x']; s['y'] = ty + 0.5 + dy * 0.75 if dy else s['y']
                            if dx: s['vx'] = abs(s['vx']) * dx
                            if dy: s['vy'] = abs(s['vy']) * dy
                            if overlap(s):
                                s['x'] = tx + 0.5 + dx; s['y'] = ty + 0.5 + dy
                                if overlap(s): best = None; s['x'], s['y'] = ox, oy
                        if not best:
                            s['alive'] = False; s['out_t'] = t; events.append({'t': t, 'type': 'out', 'c': s['c']})
                            alive = [q2 for q2 in sq if q2['alive']]
                            if len(alive) == 1:
                                winner = alive[0]['c']; t_win = t; events.append({'t': t, 'type': 'win', 'c': winner, 'how': 'survie'})
                al = [i for i, s in enumerate(sq) if s['alive']]
                for ii in range(len(al)):
                    for jj in range(ii + 1, len(al)):
                        A, B = sq[al[ii]], sq[al[jj]]
                        if abs(A['x'] - B['x']) < SIZE and abs(A['y'] - B['y']) < SIZE:
                            A['vx'], B['vx'] = B['vx'], A['vx']; A['vy'], B['vy'] = B['vy'], A['vy']
                            A['x'], A['y'] = prev[al[ii]]; B['x'], B['y'] = prev[al[jj]]
                            events.append({'t': t, 'type': 'bounce', 'c': A['c'], 'kind': 'hit'})
            # hammer
            if hammer['owner'] is None and hammer['respawn'] is not None and t >= hammer['respawn']:
                hammer['respawn'] = None
            for s in sq:
                if not s['alive']: continue
                if hammer['owner'] is None and hammer['pos'] and int(s['x']) == hammer['pos'][0] and int(s['y']) == hammer['pos'][1]:
                    hammer['owner'] = s['c']; s['hammer'] = True; hammer['pos'] = None
                    events.append({'t': t, 'type': 'hammer', 'c': s['c']})
                tx, ty = int(s['x']), int(s['y'])
                if tiles[ty][tx] == 'F' and winner is None:
                    winner = s['c']; t_win = t; events.append({'t': t, 'type': 'win', 'c': s['c'], 'how': 'drapeau'})
        frames.append({'t': round(t, 4), 'sq': [[s['x'], s['y'], s['vx'], s['vy'], s['alive'], s['hammer']] for s in sq],
                       'tiles': [''.join(r) for r in tiles] if fi % 1 == 0 else None,
                       'hp': {f"{k[0]},{k[1]}": v for k, v in hp.items() if tiles[k[1]][k[0]] != '.'},
                       'flood': [[round(v, 3) for v in row] for row in flood],
                       'hammer': hammer['pos'], 'level': level, 'hp_owner': hammer['owner']})
        fi += 1
        t += dt
        if winner and t > t_win + 4.0: break
        if all(not s['alive'] for s in sq):
            if t > max(s['out_t'] for s in sq) + 2: break
    return {'seed': seed, 'winner': winner, 't_win': t_win, 'events': events, 'frames': frames}


if __name__ == '__main__':
    res = []
    for seed in range(int(sys.argv[1]), int(sys.argv[2])):
        r = run(seed)
        outs = [e for e in r['events'] if e['type'] == 'out']
        ham = [e for e in r['events'] if e['type'] == 'hammer']
        kb = [e for e in r['events'] if e['type'] == 'break' and e['k']]
        print(seed, r['winner'], r['t_win'] and round(r['t_win'], 1), 'outs', [(e['c'], round(e['t'], 1)) for e in outs], 'ham', [(e['c'], round(e['t'], 1)) for e in ham][:4], 'K', len(kb), flush=True)
