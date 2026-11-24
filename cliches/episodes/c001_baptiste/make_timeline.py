import json, re, os
H = os.path.dirname(os.path.abspath(__file__))
W = [w for w in json.load(open(f'{H}/voice/words.json'))['words'] if w.get('type','word')=='word']
W = [w for w in W if not w['text'].startswith('[') and not w['text'].endswith(']') and re.search(r'\w', w['text'])]
KEY = set('BAPTISTE LIBÉRAL DOUDOUNE JAMAIS CINQ POSTER CEO BOÎTE SALARIÉ CROISSANTS ABONNEMENT BOULANGERIE L\'ÉTAT PROBLÈME ASSISTÉS SUBVENTION INNOVATION PERSONNE SEUL PAPA CHÈQUE QUATRE-VINGT FERME ÉCHEC LEADERSHIP LIKES PODCAST ABONNE-TOI CLICHÉ DISRUPTER'.split())
def clean(t): return re.sub(r'[«»“”"]', '', t).strip()
groups, cur = [], []
for i, w in enumerate(W):
    cur.append(w)
    end_punct = re.search(r'[.,?!…:]$|»', w['text'])
    nxt = W[i+1] if i+1 < len(W) else None
    gap = nxt and nxt['start'] - w['end'] > 0.25
    if len(cur) >= 3 or end_punct or gap or nxt is None:
        groups.append(cur); cur = []
caps = []
for i, g in enumerate(groups):
    t0 = g[0]['start']; t1 = groups[i+1][0]['start'] if i+1 < len(groups) else g[-1]['end'] + 0.8
    t1 = min(t1, g[-1]['end'] + 0.9)
    words = []
    for w in g:
        txt = clean(w['text']).upper().rstrip('.,')
        words.append([txt, 1 if txt.rstrip('?!…:') in KEY else 0])
    caps.append(dict(t0=round(t0, 3), t1=round(t1, 3), w=words))
S = [('hook',0),('doudoune',3.1),('cinqh',7.2),('ceo',11.48),('croissant',16.6),('diner',22.5),('subvention',28.0),('toutseul',31.15),('cheque',34.75),('ferme',39.1),('post',42.1),('podcast',46.68),('fin',49.8)]
DUR = 54.0
scenes = [[n, a, S[i+1][1] if i+1 < len(S) else DUR] for i, (n, a) in enumerate(S)]
wt = {}
for w in W: wt.setdefault(clean(w['text']).lower().rstrip('.,?!…:'), []).append(w['start'])
TL = dict(dur=DUR, scenes=scenes, caps=caps, words=wt)
open(f'{H}/timeline.js','w').write('window.TL=' + json.dumps(TL, ensure_ascii=False) + ';')
json.dump(TL, open(f'{H}/timeline.json','w'), ensure_ascii=False, indent=1)
json.dump([dict(t0=c['t0'], t1=c['t1'], text=' '.join(x[0] for x in c['w'])) for c in caps], open(f'{H}/cues.json','w'), ensure_ascii=False)
print(len(caps)); print([ ' '.join(x[0] for x in c['w']) for c in caps][:60])
