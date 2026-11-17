"""Balayage de seeds sur un parcours : CARRES_TRACK=../tracks/x.json python3 sweep2.py speed flood0 flood_acc flood_delay seed0 seed1"""
import sys, sim2
sp, f0, fa, fd = map(float, sys.argv[1:5])
for seed in range(int(sys.argv[5]), int(sys.argv[6])):
    r = sim2.run(seed, speed=sp, flood0=f0, flood_acc=fa, flood_delay=fd, max_t=95)
    o = [(e['c'], round(e['t'])) for e in r['events'] if e['type'] == 'out']
    w = [e for e in r['events'] if e['type'] == 'win']
    br = [(e['c'], round(e['t'])) for e in r['events'] if e['type'] == 'break' and not e['k']]
    print(seed, r['winner'], r['t_win'] and round(r['t_win']), w and w[0]['how'], 'OUT', o, 'BR', br[:4], flush=True)
