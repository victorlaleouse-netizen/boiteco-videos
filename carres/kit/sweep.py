import sim,sys
sp,f0,fa,fd=map(float,sys.argv[1:5])
for seed in range(int(sys.argv[5]),int(sys.argv[6])):
    r=sim.run(seed,speed=sp,flood0=f0,flood_acc=fa,flood_delay=fd,max_t=90)
    o=[(e['c'],round(e['t'])) for e in r['events'] if e['type']=='out']
    h=[(e['c'],round(e['t'])) for e in r['events'] if e['type']=='hammer']
    k=sum(1 for e in r['events'] if e['type']=='break' and e['k'])
    w=[e for e in r['events'] if e['type']=='win']
    print(seed,r['winner'],r['t_win'] and round(r['t_win']),w and w[0]['how'],o,h,'K',k,flush=True)
