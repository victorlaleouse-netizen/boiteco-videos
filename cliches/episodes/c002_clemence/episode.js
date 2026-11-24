// ---------- helpers on the timeline ----------
const S={}; TL.scenes.forEach(([n,a,b])=>S[n]=[a,b]);
const nk=k=>k.toLowerCase().replace(/[.,?!…:]+$/,''); const W=k=>(TL.words[nk(k)]||[0])[0];        // first time a word is spoken
const Wn=(k,i)=>(TL.words[nk(k)]||[])[i]??W(k);
const blinkAt=t=>((t*1.0)%3.7)<0.12;
const talkAt=(t,a,b)=>t>=a&&t<b&&Math.floor(t*12)%2===0;
window.EP_TITLE=['CLÉMENCE, 17 ANS :','ÉCOLO ULTIME ?!'];

// ---------- cast & props ----------
const RUST='#B5652B';
const clem=(x,y,s,o={})=>perso(x,y,s,Object.assign({hair:'long',hairCol:RUST,top:C.green,topStyle:'tshirt',pants:'#8A6A4A',shoes:C.sand},o));
const clem35=(x,y,s,o={})=>perso(x,y,s,Object.assign({hair:'bob',hairCol:RUST,top:C.beige,topStyle:'cardigan',topCol2:C.white,pants:C.navy,shoes:C.white,glasses:'sun'},o));
const fille=(x,y,s,o={})=>perso(x,y,s,Object.assign({hair:'bun',hairCol:RUST,top:C.green,topStyle:'hoodie',pants:'#8A6A4A',shoes:C.sand},o));
function tree(x,y,s=1){ return `<g transform="translate(${x},${y}) scale(${s})">${cel(P('M-50 0 L-40 -520 L40 -520 L50 0Z'),'#8A6A4A',{w:7})}<path d="M-20 -120 Q0 -160 10 -220 M18 -330 Q30 -380 20 -430" stroke="${INK}" stroke-width="5" fill="none"/>`
 +cel(E(-120,-600,140,120),C.green)+cel(E(120,-620,150,130),C.green)+cel(E(0,-760,180,150),C.green)+cel(E(0,-560,130,90),'#5E9160')+`</g>`; }
function stump(x,y){ return cel(P(`M${x-70} ${y} L${x-60} ${y-120} L${x+60} ${y-120} L${x+70} ${y}Z`),'#8A6A4A',{w:7})+cel(E(x,y-120,62,22),C.sand,{w:6})+`<ellipse cx="${x}" cy="${y-120}" rx="34" ry="11" fill="none" stroke="${INK}" stroke-width="4"/><ellipse cx="${x}" cy="${y-120}" rx="12" ry="4" fill="none" stroke="${INK}" stroke-width="4"/>`; }
function chain(x0,y0,x1,y1){ return `<path d="M${x0} ${y0} L${x1} ${y1}" stroke="${C.grey}" stroke-width="16" stroke-dasharray="26 10" stroke-linecap="round"/><path d="M${x0} ${y0} L${x1} ${y1}" stroke="${INK}" stroke-width="4" stroke-dasharray="26 10"/>`; }
function car(x,y,s,col,big=false){ const h=big?1.25:1; return `<g transform="translate(${x},${y}) scale(${s})">${cel(P(`M-260 -40 L-250 ${-150*h} Q-240 ${-170*h} -200 ${-175*h} L-150 ${-175*h} L-90 ${-280*h} L120 ${-280*h} L190 ${-175*h} L240 ${-165*h} Q262 ${-150*h} 262 -110 L262 -40Z`),col,{w:7})}`
 +cel(P(`M-130 ${-185*h} L-80 ${-262*h} L0 ${-262*h} L0 ${-185*h}Z`),C.powder,{w:5})+cel(P(`M20 ${-185*h} L20 ${-262*h} L110 ${-262*h} L160 ${-185*h}Z`),C.powder,{w:5})
 +cel(E(-150,-40,62,62),'#262A33',{w:6})+cel(E(-150,-40,24,24),C.grey,{w:5})+cel(E(150,-40,62,62),'#262A33',{w:6})+cel(E(150,-40,24,24),C.grey,{w:5})+`</g>`; }
function bike(x,y,s=1){ const B='#C9A35A'; return `<g transform="translate(${x},${y}) scale(${s})"><circle cx="-170" cy="-110" r="110" fill="none" stroke="${INK}" stroke-width="14"/><circle cx="170" cy="-110" r="110" fill="none" stroke="${INK}" stroke-width="14"/>`
 +`<path d="M-170 -110 L-40 -110 L80 -260 L-90 -260 Z M-40 -110 L-110 -300 M80 -260 L170 -110 M80 -260 L60 -330" stroke="${INK}" stroke-width="22" fill="none" stroke-linejoin="round"/><path d="M-170 -110 L-40 -110 L80 -260 L-90 -260 Z M-40 -110 L-110 -300 M80 -260 L170 -110 M80 -260 L60 -330" stroke="${B}" stroke-width="12" fill="none" stroke-linejoin="round"/>`
 +[[-100,-185],[20,-185],[-75,-200]].map(([a,b])=>`<circle cx="${a}" cy="${b}" r="5" fill="${INK}"/>`).join('')+cel(Rr(-150,-320,90,22,10),'#3A2A2A',{w:5})+`<path d="M30 -340 L100 -330" stroke="${INK}" stroke-width="10" stroke-linecap="round"/></g>`; }
function pass(x,y,city,col){ return card(x,y,300,150,C.white,16)+`<rect x="${x}" y="${y}" width="300" height="48" rx="16" fill="${col}"/>`+T('BOARDING PASS',x+150,y+34,24,C.white,{a:'middle'})+T(city,x+150,y+110,48,INK,{a:'middle',f:'Slab',wt:400}); }
function plane(x,y,s=1,rot=0){ return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">${cel(P('M-120 -14 Q-140 0 -120 14 L100 14 Q140 10 150 0 Q140 -10 100 -14Z'),C.white,{w:6})}${cel(P('M-10 -12 L-60 -90 L-20 -90 L50 -12Z M-10 12 L-60 90 L-20 90 L50 12Z M-110 -12 L-130 -50 L-100 -50 L-80 -12Z'),C.powder,{w:5})}</g>`; }
function sign(x,y,w,lines,col=C.white,rot=0,fs=52){ const h=40+lines.length*62; return `<g transform="rotate(${rot} ${x} ${y})"><line x1="${x}" y1="${y+h/2}" x2="${x}" y2="${y+h/2+260}" stroke="${INK}" stroke-width="12"/>${card(x-w/2,y-h/2,w,h,col,10)}${lines.map((l,i)=>T(l,x,y-h/2+72+i*62,fs,INK,{a:'middle',f:'Slab',wt:400})).join('')}</g>`; }
function pool(x,y,w,h){ return cel(Rr(x,y,w,h,20),'#5BB6D6',{w:7})+`<path d="M${x+40} ${y+40} q30 -14 60 0 q30 14 60 0 M${x+w-200} ${y+h-40} q30 -14 60 0 q30 14 60 0" stroke="${C.white}" stroke-width="6" fill="none"/>`; }

const SC={
hook(t){ const rot=t*0.15;
 return ground(C.coral,C.coralD)+sunburst(540,940,1100,C.mustard,rot)+`<circle cx="540" cy="940" r="${300+8*Math.sin(t*3)}" fill="${C.mustard}" opacity=".9"/>`
 +pop(t,0.05,540,330,script('Voici Clémence,',540,350,116,PAPER),0.35)
 +pop(t,W("l'écolo"),540,470,slab("L'ÉCOLO",540,500,110,PAPER,C.green))
 +pop(t,W('ultime'),540,610,slab('ULTIME',540,640,120,C.white,C.red),0.32)
 +sparkle(150,760,40)+sparkle(940,820,34,C.mustard)+sparkle(160,1180,26,C.white)
 +shadow(380,150,C.coralD)+sign(630,800,340,['SAUVEZ','LA PLANÈTE'],C.white,0,40)+clem(380,1460,0.78,{aR:130,aL:14,wink:t>2.2,blink:blinkAt(t)&&t<2.2,mouth:'smile'}); },
platane(t){ const tc=W("s'enchaîne"), tl=W('lycée'), ts=W('sauver');
 return ground(C.teal,C.tealD)
 +cel(Rr(60,1040,260,200,10),C.sand,{w:6})+T('LYCÉE',190,1110,42,INK,{a:'middle',f:'Slab',wt:400})+cel(Rr(150,1140,80,100,6),C.navy,{w:5})
 +tree(400,1300,1.0)
 +ageBadge(t,S.platane[0]+0.1,880,360,17)
 +shadow(560,140,C.tealD)+clem(560,1460,0.78,{aL:14,aR:-14,mouth:t>ts?'talk':'smile',brow:t>tc?'angry':'',blink:blinkAt(t)})
 +(t>tc?chain(340,1000,700,1040)+chain(340,1120,700,1150):'')
 +pop(t,tc+0.1,800,880,tag(650,820,360,['Chaîne : 80 €','(Amazon)'],C.white))
 +pop(t,ts,400,440,bubble(120,330,560,170,520,560,['Touchez pas','au platane !'],56))
 +stamp(t,Wn('platane',1),720,640,'HÉROÏNE',C.green,8); },
abattu(t){ const ta=W('abattu'), tl=W('lundi');
 return ground(C.slate,C.slateD)
 +stump(400,1300)+cel(Rr(600,1220,300,80,30),'#8A6A4A',{w:6})+cel(E(900,1260,30,40),C.sand,{w:5})
 +(t<ta?tree(400,1300,1.0):'')
 +pop(t,tl,800,420,card(660,330,300,220,C.white)+`<rect x="660" y="330" width="300" height="64" rx="22" fill="${C.red}"/>`+T('CALENDRIER',810,374,32,C.white,{a:'middle'})+T('LUNDI',810,478,64,INK,{a:'middle',f:'Slab',wt:400}))
 +stamp(t,ta,420,620,'ABATTU',C.red,-8)
 +shadow(640,120,C.slateD)+clem(640,1460,0.62,{mouth:'sad',brow:'up',aL:14,aR:-14,blink:blinkAt(t)}); },
vegan(t){ const tv=W('vegan'), tr=W('vrac'), tn=W('vinaigre');
 return ground(C.olive,C.oliveD)
 +ageBadge(t,S.vegan[0]+0.05,880,360,20)
 +pop(t,tv,250,450,card(80,360,340,180,C.white)+cel(P('M150 480 Q150 400 230 390 Q230 470 150 480Z'),C.green,{w:5})+T('VEGAN',300,470,52,INK,{a:'middle',f:'Slab',wt:400}))
 +pop(t,tr,240,760,cel(Rr(140,640,200,240,30),C.powder,{w:7})+cel(Rr(160,610,160,40,10),'#8A6A4A',{w:6})+`<circle cx="200" cy="800" r="14" fill="${C.mustard}" stroke="${INK}" stroke-width="3"/><circle cx="250" cy="830" r="14" fill="${C.mustard}" stroke="${INK}" stroke-width="3"/><circle cx="280" cy="790" r="14" fill="${C.mustard}" stroke="${INK}" stroke-width="3"/>`+T('VRAC',240,720,40,INK,{a:'middle'}))
 +pop(t,tn,230,1080,cel(Rr(170,960,120,240,30),C.white,{w:7})+cel(Rr(200,920,60,50,8),C.red,{w:5})+T('VINAIGRE',230,1100,26,INK,{a:'middle'}))
 +pop(t,tn+0.5,790,1010,tag(620,950,360,['Cheveux :','odeur salade'],C.white))
 +shadow(560,140,C.oliveD)+clem(560,1460,0.74,{prop:'bag',aR:-20,aL:14,mouth:t>tn?'smile':'talk',wink:t>tn+0.3,blink:blinkAt(t)}); },
velo(t){ const tb=W('bambou'), tm=W('mille'), tp=W('papa');
 return ground(C.mustard,C.mustardD)
 +bike(420,1300,1.05)
 +pop(t,tb,250,820,tag(80,760,330,['Vélo en','bambou'],C.white))
 +pop(t,tm,540,500,star(540,500,175,C.white,14)+slab('1 800 €',540,525,76,C.white,C.red))
 +pop(t,tp,800,780,card(640,700,330,170,C.white,16)+`<rect x="640" y="700" width="330" height="56" rx="16" fill="${C.teal}"/>`+T('FACTURE',805,740,30,C.white,{a:'middle'})+T('Payé par :',665,800,32,INK,{wt:500})+T('PAPA',805,850,52,INK,{a:'middle',f:'Slab',wt:400}))
 +stamp(t,tp+0.4,540,320,'MERCI PAPA',C.red,-6)
 +shadow(820,120,C.mustardD)+clem(820,1460,0.62,{aL:14,aR:-14,mouth:'smile',blink:blinkAt(t)}); },
oncle(t){ const ta=W("d'assassin"), td=W('diesel');
 return ground(C.powder,C.powderD)
 +car(760,1330,0.9,C.slate)
 +pop(t,td,610,1200,tag(470,1130,280,['Diesel','2009'],C.white))
 +shadow(820,110,C.powderD)+perso(820,1460,0.6,{hair:'bald',hairCol:'#7A6A5A',beard:'stache',top:C.navy,topStyle:'shirt',pants:'#5A4A3A',mouth:t>ta?'o':'smile',brow:t>ta?'up':'',blink:blinkAt(t+1)})
 +shadow(300,140,C.powderD)+clem(300,1460,0.74,{aR:t>ta-0.2?110:-14,aL:14,brow:'angry',mouth:talkAt(t,ta-0.3,td+0.4)?'talk':'flat',blink:blinkAt(t)})
 +pop(t,ta,400,430,bubble(150,330,560,170,330,560,['ASSASSIN !'],80))
 +stamp(t,td+0.3,380,640,'TONTON = CO2',C.red,-6); },
petrolier(t){ const tt=W('transition'), tp=W('pétrolier');
 return ground(C.plum,C.plumD)
 +ageBadge(t,S.petrolier[0]+0.05,880,360,25)
 +cel(Rr(90,380,520,920,8),C.sand,{w:7})+[0,1,2,3].map(r=>[0,1,2].map(c=>cel(Rr(130+c*160,460+r*170,110,110,6),C.powder,{w:5})).join('')).join('')
 +(t>tp-0.1?pop(t,tp-0.1,350,330,cel(Rr(110,290,480,90,10),'#262A33',{w:6})+T('FOSSIL CORP',350,352,52,C.mustard,{a:'middle',f:'Slab',wt:400})):'')
 +pop(t,tt,800,640,tag(640,580,340,['Chargée de','transition'],C.white))
 +stamp(t,tp,560,860,'PÉTROLIER',C.red,-8)
 +shadow(800,120,C.plumD)+clem(800,1460,0.6,{topStyle:'suit',top:C.navy,tie:C.green,badge:'ECO',aL:14,aR:-14,mouth:'smile',blink:blinkAt(t)}); },
systeme(t){ const tc=W('changer'), ti=W("l'intérieur");
 return ground(C.teal,C.tealD)
 +pop(t,tc,330,600,phone(70,230,520,700,`<rect x="94" y="270" width="472" height="70" rx="22" fill="${C.navy}"/>`+T('RÉSEAU PRO',330,318,34,C.white,{a:'middle'})+`<circle cx="150" cy="400" r="30" fill="${C.green}" stroke="${INK}" stroke-width="4"/>`+T('Clémence',196,396,32,INK)+T('Fossil Corp',196,428,24,C.grey,{wt:500})+T('Je change le',124,510,38,INK)+T('système de',124,558,38,INK)+T("l'intérieur.",124,606,38,C.green)+T('#impact #green',124,670,30,C.teal,{wt:500})+T('347 likes',124,820,32,INK)))
 +pop(t,ti,820,620,tag(640,540,370,['Salaire :','5 200 € net','+ prime pétrole'],C.white))
 +stamp(t,ti+0.5,560,1000,'SYSTÈME : INTACT',C.red,-6)
 +shadow(800,120,C.tealD)+clem(800,1460,0.6,{topStyle:'suit',top:C.navy,tie:C.green,prop:'phone',aR:-20,aL:14,wink:t>ti,blink:blinkAt(t)}); },
voyages(t){ const th=W('thaïlande'), tb=W('bali'), tc=W('costa'), ts=W('six');
 const px=-200+1500*seg(t,S.voyages[0],S.voyages[1]);
 return ground(C.coral,C.coralD)
 +ageBadge(t,S.voyages[0]+0.05,880,360,28)
 +plane(px,560,1.1,-8)
 +pop(t,th,240,820,pass(90,750,'BANGKOK',C.teal))
 +pop(t,tb,240,1000,pass(110,930,'BALI',C.plum))
 +pop(t,tc,240,1180,pass(130,1110,'SAN JOSÉ',C.navy))
 +pop(t,ts,540,420,slab('6 VOLS / AN',540,440,96,C.white,C.red))
 +pop(t,ts+0.5,810,980,tag(640,920,340,['CO2 :','9 tonnes'],C.white))
 +shadow(760,120,C.coralD)+clem(760,1460,0.6,{glasses:'sun',top:C.mustard,prop:'bag',aR:-20,aL:14,mouth:'smile',blink:blinkAt(t)}); },
arbre(t){ const tc=W('compense'), ta=W('arbre'), tp=W('appli');
 return ground(C.olive,C.oliveD)
 +pop(t,tc,330,640,phone(80,250,500,780,`<rect x="104" y="290" width="452" height="80" rx="22" fill="${C.green}"/>`+T('ARBRE+',330,346,44,C.white,{a:'middle',f:'Slab',wt:400})
   +(t>ta?`<g transform="translate(330 640) scale(${(0.3+0.7*eo(seg(t,ta,ta+0.5))).toFixed(3)})">`+cel(Rr(-12,0,24,90,4),'#8A6A4A',{w:5})+cel(E(0,-20,70,60),C.green,{w:6})+`</g>`:'')
   +(t>ta+0.3?T('1 arbre planté !',330,820,40,INK,{a:'middle'}):'')+(t>tp?`<rect x="140" y="860" width="380" height="70" rx="35" fill="${C.teal}" stroke="${INK}" stroke-width="5"/>`+T('PARTAGER',330,908,34,C.white,{a:'middle'}):'')))
 +pop(t,tp+0.2,810,600,tag(650,540,340,['Arbre réel :','introuvable'],C.white))
 +stamp(t,tp+0.6,560,1120,'COMPENSÉ ?',C.red,-6)
 +shadow(820,110,C.oliveD)+clem(820,1460,0.56,{glasses:'sun',top:C.mustard,aL:14,aR:-14,mouth:'smile',blink:blinkAt(t)}); },
suv(t){ const te=W('enfants'), tv=W('suv'), tp=W('piscine'), th=Wn('hybride',1), tco=W('compte');
 return ground(C.sand,C.sandD)
 +ageBadge(t,S.suv[0]+0.05,880,360,35)
 +pop(t,tv,330,1100,car(330,1320,1.05,'#3A3F4A',true)+cel(Rr(150,1050,200,50,10),C.green,{w:5})+T('HYBRIDE',250,1088,32,C.white,{a:'middle'}))
 +pop(t,tp,540,1600,pool(120,1380,840,150))
 +pop(t,tp+0.3,240,720,tag(80,650,330,['Piscine','chauffée 29°'],C.white))
 +pop(t,te,640,1460,perso(640,1460,0.34,{hair:'buzz',top:C.red,topStyle:'tshirt'})+perso(560,1460,0.3,{hair:'bun',hairCol:RUST,top:C.green,topStyle:'tshirt'}))
 +shadow(820,120,C.sandD)+clem35(820,1460,0.62,{aL:14,aR:t>th?-120:-14,mouth:talkAt(t,th,tco+0.4)?'talk':'smile',blink:blinkAt(t)})
 +pop(t,th,520,620,bubble(300,520,500,170,760,720,['Hybride,','ça compte.'],54))
 +stamp(t,tco+0.3,620,880,'ÇA COMPTE ?',C.red,-6); },
fille(t){ const tf=W('fille'), tp=W('portail'), tc=W('contre');
 let bars=''; for(let i=0;i<9;i++) bars+=cel(Rr(90+i*100,520,26,780,6),'#3A3F4A',{w:5});
 return ground(C.teal,C.tealD)
 +bars+cel(Rr(70,600,940,30,6),'#3A3F4A',{w:5})+cel(Rr(70,1120,940,30,6),'#3A3F4A',{w:5})
 +ageBadge(t,Wn('dix-sept',1),880,360,17)
 +shadow(420,140,C.tealD)+sign(640,760,300,['PISCINE','= CRIME'],C.white,0,48)+fille(420,1460,0.74,{aR:130,aL:14,brow:'angry',mouth:talkAt(t,tc,tc+0.9)?'talk':'flat',blink:blinkAt(t)})
 +(t>tp?chain(150,1000,840,1030)+chain(150,1150,840,1170):'')
 +pop(t,tc,250,360,tag(70,300,360,['Même chaîne','(la sienne)'],C.white)); },
gendarmes(t){ const te=W("d'extrémiste"), tg=W('gendarmes');
 const blink=Math.floor(t*6)%2;
 return ground(C.slate,C.slateD)+(t>tg?`<rect width="1080" height="1920" fill="${blink?C.navy:C.red}" opacity=".18"/>`:'')
 +shadow(330,130,C.slateD)+clem35(330,1460,0.66,{prop:'phone',aR:-20,aL:t>te?-130:14,brow:'angry',mouth:talkAt(t,te-0.3,tg+0.6)?'talk':'flat',blink:blinkAt(t)})
 +pop(t,te,460,430,bubble(150,320,640,180,330,560,['EXTRÉMISTE !'],84))
 +pop(t,tg,800,1460,perso(800,1460,0.62,{hair:'buzz',cap:C.navy,top:C.navy,topStyle:'shirt',pants:C.navy,shoes:'#262A33',badge:'GN',mouth:'flat'}))
 +stamp(t,tg+0.6,520,760,'ASSASSIN ?',C.red,-8); },
fin(t){ const ta=W('abonne-toi'), td=W('demain');
 const heads=[[250,C.red,'#3A2A2A'],[540,C.green,'#B9B2A6'],[830,C.plum,'#5A3A2A']];
 return ground(C.teal,C.tealD)+sunburst(540,1000,1200,C.white,t*0.25)
 +pop(t,ta,540,340,slab('ABONNE-TOI',540,370,118,C.mustard,C.red),0.32)
 +pop(t,td,540,540,card(170,470,740,130,C.white,30)+T('Demain : un autre cliché',540,555,52,INK,{a:'middle'}))
 +heads.map(([x,c,h],i)=>pop(t,td+0.35+i*0.2,x,1100,cel(Rr(x-90,1080,180,380,40),c)+cel(E(x,1000,90,100),C.skin)+cel(P(`M${x-92} 990 Q${x-90} 880 ${x} 885 Q${x+90} 880 ${x+92} 990 Q${x+40} 930 ${x} 935 Q${x-40} 930 ${x-92} 990Z`),h,{w:5})+T('?',x,1040,110,INK,{a:'middle',f:'Slab',wt:400}))).join(''); },
};

const GROUND={hook:C.coral,platane:C.teal,abattu:C.slate,vegan:C.olive,velo:C.mustard,oncle:C.powder,petrolier:C.plum,systeme:C.teal,voyages:C.coral,arbre:C.olive,suv:C.sand,fille:C.teal,gendarmes:C.slate,fin:C.teal};
startFilm(SC,GROUND);
