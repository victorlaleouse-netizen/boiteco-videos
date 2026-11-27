import json, re, os
H = os.path.dirname(os.path.abspath(__file__))
W = [w for w in json.load(open(f'{H}/voice/words.json'))['words'] if w.get('type','word')=='word']
# --- comedic pauses: silence inserted after these words (seconds). Use them to land gags and to push the film past 61 s.
PAUSES = {'écrans.': 0.2, 'beauf.': 0.6, 'jour.': 0.3, 'mardi.': 0.9, 'débile': 0.5, 'bonjour.': 0.7, 'parlait.': 0.4, 'tocard.': 0.9}
import wave, struct
def _insert_pauses(W):
    cuts = []
    used = set()
    for w in W:
        if w['text'] in PAUSES and w['text'] not in used:
            cuts.append((w['end'] + 0.05, PAUSES[w['text']])); used.add(w['text'])
    cuts.sort()
    def sh(t): return t + sum(d for (c, d) in cuts if c <= t)
    for w in W: w['start'] = round(sh(w['start']), 3); w['end'] = round(sh(w['end']), 3)
    src = wave.open(f'{H}/voice/vo.wav'); sr = src.getframerate(); n = src.getnframes(); nch = src.getnchannels(); sw = src.getsampwidth()
    data = src.readframes(n); src.close(); bpf = nch * sw; out = b''; last = 0
    for c, d in cuts:
        i = min(n, int(c * sr)); out += data[last*bpf:i*bpf] + b'\x00' * (int(d * sr) * bpf); last = i
    out += data[last*bpf:]
    dst = wave.open(f'{H}/voice/vo_long.wav', 'wb'); dst.setnchannels(nch); dst.setsampwidth(sw); dst.setframerate(sr); dst.writeframes(out); dst.close()
    return sh, (len(out) // bpf) / sr
SHIFT, VOICE_LEN = _insert_pauses(W)
W = [w for w in W if not w['text'].startswith('[') and not w['text'].endswith(']') and re.search(r'\w', w['text'])]
KEY = set('CHRISTIAN PETIT-FILS NOËL JEUNES ÉCRANS VINGT CHEVEUX MOBYLETTE PÈRE AVANT TRENTE-HUIT CONSOLE DÉBRANCHE BÂTON TÉLÉ HUIT HEURES CINQUANTE-CINQ PMU PASTIS DEUX EUROS QUARANTE BOSSER PRÉRETRAITE MARDI SOIXANTE-DEUX TABLETTE JAMAIS NEUF FACEBOOK QUATRE CENTS CHATS BONJOUR FRANCE SOIXANTE-SEPT DESSIN YEUX PAPY TEMPS PARLAIT ABONNE-TOI CLICHÉ'.split())
# words highlighted in RED (insults, verdicts, punchlines), e.g. {'CONNARD','FEIGNASSES','ULTIME'}
KEY_RED = set('CHUT RÉAC COMPTOIR BEAUF DÉBILE TOCARD MIEUX'.split())
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
        b = txt.rstrip('?!…:'); words.append([txt, 2 if b in KEY_RED else (1 if b in KEY else 0)])
    caps.append(dict(t0=0.0 if i == 0 else round(t0, 3), t1=round(t1, 3), w=words))
S = [('hook',0),('question',6.9),('jeune',10.1),('console',18.1),('pmu',29.1),('tablette',36.52),('facebook',41.42),('noel',48.7),('chute',58.84),('fin',60.68)]
S = [(n, round(SHIFT(a), 3)) for n, a in S]   # scene starts are written in original voice time
DUR = round(VOICE_LEN + 1.8, 2)                 # must stay above 61 s for TikTok monetisation
scenes = [[n, a, S[i+1][1] if i+1 < len(S) else DUR] for i, (n, a) in enumerate(S)]
print('DUR', DUR, '(OK > 61 s)' if DUR > 61 else '(TOO SHORT: add pauses or words)')
wt = {}
for w in W: wt.setdefault(clean(w['text']).lower().rstrip('.,?!…:'), []).append(w['start'])
TL = dict(dur=DUR, scenes=scenes, caps=caps, words=wt)
open(f'{H}/timeline.js','w').write('window.TL=' + json.dumps(TL, ensure_ascii=False) + ';')
json.dump(TL, open(f'{H}/timeline.json','w'), ensure_ascii=False, indent=1)
json.dump([dict(t0=c['t0'], t1=c['t1'], text=' '.join(x[0] for x in c['w'])) for c in caps], open(f'{H}/cues.json','w'), ensure_ascii=False)
print(len(caps)); print([ ' '.join(x[0] for x in c['w']) for c in caps][:60])
