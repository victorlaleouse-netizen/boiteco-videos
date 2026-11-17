"""Course de carrés : simulation déterministe (seed) d'une course de 4 carrés dans un labyrinthe avec eau montante."""
import math, random, json, sys

GRID = [
    "#############",
    "#FFF#.......#",
    "#FFF#.......#",
    "#KKK#..#H#..#",
    "#...K..#.#..#",
    "#...#.......#",
    "#...#.......#",
    "#...##....###",
    "#...#.......#",
    "#KKK#.......#",
    "#...........#",
    "#...........#",
    "#...........#",
    "#gg#yy#rr#bb#",
    "#..#..#..#..#",
    "#############",
]
H = len(GRID); W = len(GRID[0])
COLORS = ['g', 'y', 'r', 'b']
STARTS = {'g': (1.5, 14.5), 'y': (4.5, 14.5), 'r': (7.5, 14.5), 'b': (10.5, 14.5)}
SIZE = 0.56
FPS = 30


def run(seed, speed=5.2, brick_hp=2, k_hp=1, flood0=0.25, flood_acc=0.004, flood_delay=6.0, t_start=3.0, hammer_uses=4, max_t=95):
    rnd = random.Random(seed)
    tiles = [list(r) for r in GRID]
    hp = {}
    for y in range(H):
        for x in range(W):
            c = tiles[y][x]
            if c in COLORS: hp[(x, y)] = brick_hp
            if c == 'K': hp[(x, y)] = k_hp
    hammer_home = next((x, y) for y in range(H) for x in range(W) if tiles[y][x] == 'H')
    tiles[hammer_home[1]][hammer_home[0]] = '.'
    hammer = {'pos': hammer_home, 'owner': None, 'uses': hammer_uses, 'respawn': None}
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
        return tiles[ty][tx] in '#K' or tiles[ty][tx] in COLORS

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
    level = 15.0
    while t < max_t:
        moving = t >= t_start and winner is None
        # flood = rising water level, spreading only through connected open tiles
        if t >= t_start + flood_delay:
            level -= (flood0 + flood_acc * (t - t_start - flood_delay)) * dt
            wet = [[0.0] * W for _ in range(H)]
            seen = set(); stack = [(x, 14) for x in range(W) if open_for_flood(x, 14)]
            while stack:
                x, y = stack.pop()
                if (x, y) in seen or not open_for_flood(x, y): continue
                fr = max(0.0, min(1.0, y + 1 - level))
                if fr <= 0: continue
                seen.add((x, y)); wet[y][x] = fr
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    stack.append((x + dx, y + dy))
            flood = wet
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
                            kind = 'wall'
                            if (c == s['c']) or (c == 'K' and s['hammer']):
                                hp[(tx, ty)] -= 1; kind = 'brick'
                                if hp[(tx, ty)] <= 0:
                                    tiles[ty][tx] = '.'; kind = 'break'
                                    events.append({'t': t, 'type': 'break', 'c': s['c'], 'tile': [tx, ty], 'k': c == 'K'})
                                    if c == 'K':
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
                # water surface: bounce, or drown if no room above
                for s in sq:
                    if not s['alive'] or winner: continue
                    hs = SIZE / 2
                    tx = int(s['x']); ty = int(min(H - 1, s['y'] + hs))
                    if s['y'] + hs > level and (flood[ty][tx] > 0 or flood[int(s['y'])][tx] > 0):
                        oy = s['y']; s['y'] = level - hs - 1e-4
                        if overlap(s) or s['y'] < oy - 0.5:
                            s['y'] = oy; s['alive'] = False; s['out_t'] = t; events.append({'t': t, 'type': 'out', 'c': s['c']})
                            if s['hammer']:
                                s['hammer'] = False; hammer['owner'] = None; hammer['respawn'] = t + 3
                            alive = [q for q in sq if q['alive']]
                            if len(alive) == 1:
                                winner = alive[0]['c']; t_win = t; events.append({'t': t, 'type': 'win', 'c': winner, 'how': 'survie'})
                        else:
                            if s['vy'] > 0: s['vy'] = -s['vy']; events.append({'t': t, 'type': 'bounce', 'c': s['c'], 'kind': 'water'})
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
                hammer['pos'] = hammer_home; hammer['respawn'] = None
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
