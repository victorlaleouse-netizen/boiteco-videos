// ---------- helpers on the timeline ----------
const S={}; TL.scenes.forEach(([n,a,b])=>S[n]=[a,b]);
const nk=k=>k.toLowerCase().replace(/[.,?!…:]+$/,''); const W=k=>(TL.words[nk(k)]||[0])[0];        // first time a word is spoken
const Wn=(k,i)=>(TL.words[nk(k)]||[])[i]??W(k);
const blinkAt=t=>((t*1.0)%3.7)<0.12;
const talkAt=(t,a,b)=>t>=a&&t<b&&Math.floor(t*12)%2===0;
const SC={
hook(t){ const rot=t*0.15; return ground(C.coral,C.coralD)+sunburst(540,940,1100,C.mustard,rot)+`<circle cx="540" cy="940" r="${300+8*Math.sin(t*3)}" fill="${C.mustard}" opacity=".9"/>`
 +pop(t,0.05,540,230,script('Voici Baptiste,',540,250,120,PAPER),0.35)
 +pop(t,W('le')||1.28,540,360,slab('LE JEUNE',540,390,104,PAPER,C.teal))
 +pop(t,W('entrepreneur'),540,480,slab('ENTREPRENEUR',540,510,104,PAPER,C.teal))
 +pop(t,W('libéral.'),540,600,slab('LIBÉRAL',540,630,104,C.mustard,C.teal),0.32)
 +sparkle(150,700,40)+sparkle(940,760,34,C.mustard)+sparkle(880,1000,24)
 +shadow(540,170,C.coralD)+baptiste(540,1460,0.8,{phone:true,wink:t>2.3,aR:-12,blink:blinkAt(t)&&t<2.3,mouth:'smile'});},
doudoune(t,lt){ const t1=W('doudoune'), t2=W('jamais.');
 return ground(C.mustard,C.mustardD)+shadow(400,170,C.mustardD)+baptiste(400,1460,0.92,{blink:blinkAt(t),aL:14,aR:-14})
 +pop(t,t1,800,520,tag(640,420,380,['Doudoune','sans manches']))
 +(t>t1?`<path d="M650 560 Q560 620 500 820" stroke="${INK}" stroke-width="7" fill="none" stroke-dasharray="22 14" stroke-linecap="round"/>`:'')
 +pop(t,t2-0.2,800,860,card(620,760,380,230,C.white)+`<rect x="620" y="760" width="380" height="64" rx="22" fill="${C.red}"/>`+T('CALENDRIER',810,806,36,C.white,{a:'middle'})+T('365 / 365',810,900,64,INK,{a:'middle',f:'Slab',wt:400})+T('jours portée',810,960,32,C.grey,{a:'middle',wt:500}))
 +pop(t,t2,520,300,slab('JAMAIS',540,300,120,C.white,C.red)); },
cinqh(t){ const tc=W('cinq'), tp=W('poster'); const ring=t>tc&&t<tc+0.9; const sh=ring?Math.sin(t*90)*6:0;
 return ground(C.teal,C.tealD)
 +`<g transform="translate(${sh},0)">${cel(E(830,330,110,110),C.white,{w:7})}<path d="M830 260 V330 L880 356" stroke="${INK}" stroke-width="9" stroke-linecap="round" fill="none"/>${cel(E(750,232,30,30),C.mustard,{w:6})}${cel(E(910,232,30,30),C.mustard,{w:6})}</g>`
 +(ring?`<path d="M690 260 L650 240 M700 330 L650 330 M970 260 L1010 240 M960 330 L1010 330" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`:'')
 +pop(t,tc,830,520,slab('5:00',830,540,90,C.white,C.coral))
 +pop(t,tp,330,480,phone(70,170,520,620,`<rect x="94" y="210" width="472" height="70" rx="22" fill="${C.navy}"/>`+T('RÉSEAU PRO',330,258,34,C.white,{a:'middle'})+`<circle cx="150" cy="340" r="30" fill="${C.powder}" stroke="${INK}" stroke-width="4"/>`+T('Baptiste · CEO',196,335,30,INK)+T('Fondateur · Visionnaire',196,368,24,C.grey,{wt:500})+T('Debout à 5h. ☀',124,440,36,INK)+T('Pendant que vous dormez,',124,492,32,INK,{wt:500})+T('je construis mon empire.',124,534,32,INK,{wt:500})+T('#mindset #grind',124,586,32,C.teal,{wt:500})+T('👍 347   💬 52',124,690,34,INK)))
 +shadow(560,170,C.tealD)+baptiste(560,1460,0.92,{aL:t>tp?160:12,phone:true,aR:-12,mouth:t>tp?'smile':'o',brow:t>tc&&t<tp?'up':'',blink:blinkAt(t)})
 +pop(t,tp+0.6,860,1060,tag(700,980,330,['Réveil : 5h00','Post : 5h01'],C.white)); },
ceo(t){ const tc=W('ceo.'), ts=W('salarié.')||15.84, tb=Wn('boîte.',0);
 let org=''; if(t>tb){ const nodes=[[540,700],[330,900],[750,900]]; org+=`<path d="M540 760 V830 H330 V860 M540 830 H750 V860" stroke="${INK}" stroke-width="7" fill="none"/>`;
  nodes.forEach(([x,y],i)=>{ org+=pop(t,tb+i*0.18,x,y,card(x-150,y-56,300,112,i?C.sand:C.mustard)+T(i?['DRH','COMPTA'][i-1]:'CEO',x,y-6,34,INK,{a:'middle'})+T('Baptiste',x,y+36,30,INK,{a:'middle',wt:500}));}); }
 return ground(C.powder,C.powderD)
 +pop(t,S.ceo[0]+0.1,540,330,card(140,180,800,300,C.white)+`<rect x="140" y="180" width="800" height="90" rx="22" fill="${C.navy}"/>`+T('RÉSEAU PRO',540,240,40,C.white,{a:'middle'})+`<circle cx="250" cy="370" r="60" fill="${C.powder}" stroke="${INK}" stroke-width="5"/>`+T('Baptiste',340,360,52,INK)+(t>tc?T('CEO & Founder 🚀',340,420,40,C.teal,{wt:700}):''))
 +org
 +shadow(540,170,C.powderD)+baptiste(540,1460,0.62,{blink:blinkAt(t),chest:t>tc&&t<tb})
 +pop(t,ts,830,1150,tag(660,1080,370,['Salariés : 1','(lui)'],C.white)); },
croissant(t){ const ta=W('appli'), tab=W('abonnement.'), td=W('disrupter');
 const cro=(x,y,s)=>`<g transform="translate(${x},${y}) scale(${s})">${cel(P('M-120 20 Q-130 -60 -60 -80 Q0 -100 60 -80 Q130 -60 120 20 Q100 -20 60 -30 Q0 -50 -60 -30 Q-100 -20 -120 20Z'),C.mustard,{w:7})}<path d="M-50 -70 Q-40 -40 -55 -28 M0 -86 Q8 -56 0 -42 M50 -70 Q40 -40 55 -28" stroke="${INK}" stroke-width="5" fill="none"/></g>`;
 return ground(C.coral,C.coralD)
 +pop(t,ta,330,500,phone(80,180,500,640,`<rect x="104" y="220" width="452" height="80" rx="22" fill="${C.mustard}"/>`+T('CROISSANT BOX',330,274,40,INK,{a:'middle',f:'Slab',wt:400})+cro(330,440,1.1)+(t>tab?card(150,560,360,120,C.white)+T('19,99 €',330,628,56,INK,{a:'middle',f:'Slab',wt:400})+T('/ mois',330,664,28,C.grey,{a:'middle',wt:500}):'')+(t>tab+0.3?`<rect x="150" y="700" width="360" height="66" rx="33" fill="${C.teal}" stroke="${INK}" stroke-width="5"/>`+T("S'ABONNER",330,744,32,C.white,{a:'middle'}):'')))
 +(t>ta?cro(860,340,0.7)+cro(900,560,0.5):'')
 +shadow(760,150,C.coralD)+baptiste(760,1460,0.8,{aL:t>td?-150:12,aR:-12,mouth:t>td?'talk':'smile',blink:blinkAt(t)})
 +pop(t,td,540,1050,`<g transform="rotate(-4 540 1050)">${card(90,960,900,190,C.mustard,30)}${slab('DISRUPTER',540,1040,80,C.white,C.red)}${slab('LA BOULANGERIE',540,1120,66,C.white,C.red)}</g>`); },
diner(t){ const te=W("l'état,"), ta=W('aides,'), tg=W('assistés.');
 const side=t>ta+0.2;
 return ground(C.mustard,C.mustardD)
 +cel(Rr(140,230,260,190,8),PAPER,{w:7})+`<path d="M160 400 L230 310 L290 360 L340 300 L380 400Z" fill="${C.olive}" stroke="${INK}" stroke-width="5"/>`
 +maman(200,1460,0.68,{blink:blinkAt(t+1),eyes:side?'side':'',mouth:side?'flat':''})+papa(880,1460,0.68,{blink:blinkAt(t+2),eyes:side?'side':'',aL:12})
 +baptiste(540,1460,0.68,{aL:t>te?-140:12,aR:-12,mouth:talkAt(t,te-0.3,tg+0.5)?'talk':'smile',brow:t>te?'angry':'',blink:blinkAt(t)})
 +cel(Rr(20,1160,1040,60,10),C.white,{w:7})+cel(Rr(60,1220,40,240,6),'#8A6A4A',{w:6})+cel(Rr(980,1220,40,240,6),'#8A6A4A',{w:6})
 +cel(E(540,1140,110,50),'#C98A4B',{w:7})+`<path d="M470 1120 Q540 1090 610 1120" stroke="${INK}" stroke-width="5" fill="none"/>`
 +pop(t,te,540,450,bubble(150,330,780,180,600,560,["L'État, c'est","le problème !"],60))
 +pop(t,ta,540,700,bubble(220,620,640,150,560,760,['Les aides = assistés.'],52)); },
subvention(t){ const ts=W('subvention'), ti=W('innovation.');
 const fill=k=>seg(t,S.subvention[0]+0.4+k*0.45,S.subvention[0]+0.8+k*0.45);
 const line=(y,k,txt)=>`<rect x="180" y="${y}" width="${Math.round(560*fill(k))}" height="10" rx="5" fill="${C.grey}"/>`+T(txt,180,y-14,28,INK,{wt:500});
 return ground(C.teal,C.tealD)
 +cel(Rr(110,180,860,760,26),'#262A33',{w:8})+`<rect x="140" y="210" width="800" height="700" rx="14" fill="${C.white}"/>`
 +`<rect x="140" y="210" width="800" height="110" rx="14" fill="${C.navy}"/>`+T('DEMANDE DE',540,256,38,C.white,{a:'middle'})+T('SUBVENTION INNOVATION',540,302,44,C.mustard,{a:'middle'})
 +line(410,0,'Nom : Baptiste')+line(510,1,'Projet : Croissant Box')+line(610,2,'Montant demandé : 30 000 €')+line(710,3,'Motivation : « disrupter »')
 +cel(Rr(380,950,320,30,6),'#4A4F5A',{w:6})
 +pop(t,ti+0.1,760,800,`<g transform="rotate(-12 760 800)"><rect x="560" y="730" width="400" height="140" rx="16" fill="none" stroke="${C.red}" stroke-width="12"/>${T('ENVOYÉ ✓',760,826,64,C.red,{a:'middle',f:'Slab',wt:400})}</g>`,0.18)
 +shadow(540,170,C.tealD)+baptiste(540,1460,0.55,{blink:blinkAt(t),wink:t>ti+0.3,aL:12,aR:-12}); },
toutseul(t){ const tq=W('je'), ty=Wn('seul.',0);
 return ground(C.plum,C.plumD)+sunburst(540,900,1100,C.mustard,t*0.2)
 +shadow(540,170,C.plumD)+baptiste(540,1460,0.95,{chest:t>tq-0.3,aL:12,aR:t>tq?-150:-12,mouth:talkAt(t,tq,ty+0.6)?'talk':'smile',brow:'up',blink:blinkAt(t)})
 +pop(t,tq,540,330,bubble(120,170,840,300,600,520,['« Je me suis fait','tout seul. »'],70))
 +sparkle(170,700,36,C.mustard)+sparkle(910,640,30)+star(900,1060,50,C.mustard); },
cheque(t){ const tp=W('papa'), tc=W('chèque.'), tq=W('quatre-vingt');
 const sign=seg(t,tp+0.3,tc+0.4); const wig=Math.sin(t*28)*6*(sign>0&&sign<1);
 return ground(C.olive,C.oliveD)
 +cel(Rr(30,1120,640,50,10),'#8A6A4A',{w:7})+cel(Rr(80,1170,36,290,6),'#6E5238',{w:6})+cel(Rr(590,1170,36,290,6),'#6E5238',{w:6})
 +papa(330,1460,0.72,{pen:true,aR:-60+wig,blink:blinkAt(t)})
 +pop(t,tp,330,420,card(100,300,480,250,C.white,14)+`<rect x="100" y="300" width="480" height="62" rx="14" fill="${C.teal}"/>`+T('CHÈQUE · DE PAPA',120,344,34,C.white)+(t>tq?T('80 000 €',120,450,78,INK,{f:'Slab',wt:400}):'')+`<path d="M330 ${515} ${Array.from({length:12},(_,i)=>`L${330+i*18*sign} ${515+Math.sin(i*1.7)*14}`).join(' ')}" stroke="${C.navy}" stroke-width="5" fill="none"/>`)
 +shadow(840,160,C.oliveD)+baptiste(840,1460,0.72,{blink:blinkAt(t),wink:t>tq,aL:12,aR:-12})
 +pop(t,tq,820,560,star(820,560,120,C.mustard,14)+slab('80 000 €',820,585,62,C.white,C.red)); },
ferme(t){ const tf=W('ferme.'); const sw=t>tf?Math.sin((t-tf)*7)*Math.exp(-(t-tf)*1.4)*16:0;
 return ground(C.slate,C.slateD)
 +cel(Rr(160,300,760,1000,8),C.sand,{w:7})+cel(Rr(200,340,680,120,8),C.mustard,{w:6})+T('CROISSANT BOX',540,420,58,INK,{a:'middle',f:'Slab',wt:400})
 +cel(Rr(380,560,320,740,8),C.teal,{w:7})+`<circle cx="660" cy="940" r="12" fill="${C.mustard}" stroke="${INK}" stroke-width="4"/>`
 +(t>tf-0.2?`<g transform="rotate(${sw} 540 640)"><path d="M480 600 L540 560 L600 600" stroke="${INK}" stroke-width="5" fill="none"/>${card(400,600,280,120,C.white,10)}${T('FERMÉ',540,684,64,C.red,{a:'middle',f:'Slab',wt:400})}</g>`:'')
 +pop(t,S.ferme[0]+0.05,240,240,tag(60,170,300,['+ 6 mois'],C.white))
 +shadow(860,130,C.slateD)+baptiste(860,1460,0.62,{mouth:'sad',brow:'up',blink:blinkAt(t)})
 ; },
post(t){ const tp=W('post'), tc=W('ce'), tl=W('leadership');
 return ground(C.coral,C.coralD)
 +pop(t,tp,540,480,phone(140,140,800,700,`<rect x="164" y="180" width="752" height="80" rx="22" fill="${C.navy}"/>`+T('RÉSEAU PRO',540,234,38,C.white,{a:'middle'})+`<circle cx="230" cy="330" r="36" fill="${C.powder}" stroke="${INK}" stroke-width="4"/>`+T('Baptiste · CEO (ex)',284,326,34,INK)+T('il y a 2 min',284,362,26,C.grey,{wt:500})
   +(t>tc?T('Ce que mon échec',190,450,46,INK)+T("m'a appris sur",190,506,46,INK):'')+(t>tl?T('le LEADERSHIP 🧵',190,562,46,C.teal):'')
   +(t>tl+0.2?`<rect x="190" y="600" width="600" height="12" rx="6" fill="${C.grey}"/><rect x="190" y="630" width="520" height="12" rx="6" fill="${C.grey}"/><rect x="190" y="660" width="560" height="12" rx="6" fill="${C.grey}"/>`+T('…voir plus',190,730,30,C.grey,{wt:500}):'')))
 +shadow(540,170,C.coralD)+baptiste(540,1460,0.62,{phone:true,aR:-150,brow:'up',mouth:'flat',blink:blinkAt(t)}); },
podcast(t){ const tl=W('likes.'), tp=W('podcast.'); const n=Math.round(3000*eo(seg(t,S.podcast[0],tl+0.3)));
 return ground(C.mustard,C.mustardD)+(t>tp?sunburst(540,900,1100,C.white,t*0.3):'')
 +card(240,170,600,200,C.white,30)+T('👍',300,300,90,INK)+T((n>=1000?Math.floor(n/1000)+' '+String(n%1000).padStart(3,'0'):String(n)),430,305,110,INK,{f:'Slab',wt:400})
 +pop(t,tp,820,560,card(640,470,380,170,C.red,24)+T('ON AIR',830,580,76,C.white,{a:'middle',f:'Slab',wt:400}))
 +pop(t,tp-0.1,300,800,`<line x1="300" y1="760" x2="300" y2="1300" stroke="${INK}" stroke-width="14"/>`+cel(Rr(250,640,100,170,50),C.grey,{w:7})+`<path d="M262 690 H338 M262 730 H338 M262 770 H338" stroke="${INK}" stroke-width="5"/>`+cel(Rr(220,1290,160,24,10),C.grey,{w:6}))
 +shadow(640,170,C.mustardD)+baptiste(640,1460,0.82,{headphones:t>tp,wink:t>tp+0.4,aL:12,aR:t>tp?-120:-12,mouth:t>tp?'talk':'o',blink:blinkAt(t)}); },
fin(t){ const ta=W('abonne-toi.'), td=W('demain,');
 const heads=[[250,C.red,'#3A2A2A'],[540,C.green,'#B9B2A6'],[830,C.plum,'#5A3A2A']];
 return ground(C.teal,C.tealD)+sunburst(540,1000,1200,C.white,t*0.25)
 +pop(t,ta,540,320,slab('ABONNE-TOI',540,350,118,C.mustard,C.red),0.32)
 +pop(t,td,540,520,card(170,450,740,130,C.white,30)+T('Demain : un autre cliché',540,535,52,INK,{a:'middle'}))
 +heads.map(([x,c,h],i)=>pop(t,td+0.35+i*0.2,x,1100,cel(Rr(x-90,1080,180,380,40),c)+cel(E(x,1000,90,100),C.skin)+cel(P(`M${x-92} 990 Q${x-90} 880 ${x} 885 Q${x+90} 880 ${x+92} 990 Q${x+40} 930 ${x} 935 Q${x-40} 930 ${x-92} 990Z`),h,{w:5})+T('?',x,1040,110,INK,{a:'middle',f:'Slab',wt:400}))).join(''); },
};

const GROUND={hook:C.coral,doudoune:C.mustard,cinqh:C.teal,ceo:C.powder,croissant:C.coral,diner:C.mustard,subvention:C.teal,toutseul:C.plum,cheque:C.olive,ferme:C.slate,post:C.coral,podcast:C.mustard,fin:C.teal};
startFilm(SC,GROUND);
