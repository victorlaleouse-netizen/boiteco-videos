'use strict';
'use strict';
const INK='#2B2320', PAPER='#F3E9D2';
const C={coral:'#E07A5F',coralD:'#C9654B',mustard:'#E9B949',mustardD:'#D29F2F',teal:'#3E9C94',tealD:'#2F7F78',powder:'#A9C9D6',powderD:'#8FB3C2',plum:'#7D5170',plumD:'#664059',olive:'#8C9A57',oliveD:'#76834A',sand:'#E8D5B0',sandD:'#D4BD92',slate:'#6F7F95',slateD:'#5A6A80',skin:'#F2C9A1',hair:'#5A3A2A',navy:'#34476B',beige:'#D8C3A0',white:'#FFFDF6',grey:'#9A948A',red:'#D9544A',green:'#6BA368'};
let seed=1; const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), seg=(t,a,b)=>clamp((t-a)/(b-a),0,1);
const eo=x=>1-Math.pow(1-x,3), back=x=>{const c=1.9;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)}, ss=x=>x*x*(3-2*x);
function cel(geo, fill, o={}){
  const dx=o.noOff?0:5+Math.round(rnd()*4), dy=o.noOff?0:5+Math.round(rnd()*4);
  const w=o.w||7, brk=o.solid?'':`stroke-dasharray="${170+rnd()*170} ${9+rnd()*14}" stroke-dashoffset="${rnd()*200}"`;
  const f=fill?geo.replace('/>',` fill="${fill}" transform="translate(${dx},${dy})"/>`):'';
  const l=o.noLine?'':geo.replace('/>',` fill="none" stroke="${INK}" stroke-width="${w*(0.85+rnd()*0.3)}" stroke-linecap="round" stroke-linejoin="round" ${brk}/>`);
  return f+l;
}
const P=d=>`<path d="${d}"/>`, E=(cx,cy,rx,ry)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`, Rr=(x,y,w,h,r=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
const T=(s,x,y,size,col,o={})=>`<text x="${x}" y="${y}" font-family="${o.f||'Jost'}" font-weight="${o.wt||700}" font-size="${size}" fill="${col}" text-anchor="${o.a||'start'}" ${o.extra||''}>${s}</text>`;
function pop(t,t0,cx,cy,inner,d=0.28){ if(t<t0) return ''; const s=back(seg(t,t0,t0+d)); return `<g transform="translate(${cx},${cy}) scale(${s.toFixed(3)}) translate(${-cx},${-cy})">${inner}</g>`; }
function ground(col,colD,h=1300){ return `<rect width="1080" height="1920" fill="${col}"/><rect y="${h}" width="1080" height="${1920-h}" fill="${colD}"/><path d="M0 ${h} H330 M372 ${h} H760 M796 ${h} H1080" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`; }
function sunburst(cx,cy,r,col,rot=0,n=30){ let s=''; for(let i=0;i<n;i+=2){const a0=i/n*Math.PI*2+rot,a1=(i+1)/n*Math.PI*2+rot; s+=`<path d="M${cx} ${cy} L${cx+Math.cos(a0)*r} ${cy+Math.sin(a0)*r} L${cx+Math.cos(a1)*r} ${cy+Math.sin(a1)*r}Z" fill="${col}" opacity=".33"/>`;} return s; }
function sparkle(x,y,s,col=C.white){ return `<path d="M${x} ${y-s} Q${x} ${y} ${x+s} ${y} Q${x} ${y} ${x} ${y+s} Q${x} ${y} ${x-s} ${y} Q${x} ${y} ${x} ${y-s}Z" fill="${col}" stroke="${INK}" stroke-width="4"/>`; }
function star(x,y,r,col,n=12){ let d=''; for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2-Math.PI/2, rr=i%2?r*.62:r; d+=(i?'L':'M')+(x+Math.cos(a)*rr).toFixed(1)+' '+(y+Math.sin(a)*rr).toFixed(1);} return cel(P(d+'Z'),col,{w:6}); }
function slab(text,x,y,size,col,plate){ return `<text x="${x+8}" y="${y+8}" font-family="Slab" font-size="${size}" text-anchor="middle" fill="${plate}">${text}</text><text x="${x}" y="${y}" font-family="Slab" font-size="${size}" text-anchor="middle" fill="${col}" stroke="${INK}" stroke-width="${size*0.06}" paint-order="stroke">${text}</text>`; }
function script(text,x,y,size,col){ return `<text x="${x+6}" y="${y+6}" font-family="Oleo" font-weight="700" font-size="${size}" text-anchor="middle" fill="${INK}" opacity=".85">${text}</text><text x="${x}" y="${y}" font-family="Oleo" font-weight="700" font-size="${size}" text-anchor="middle" fill="${col}">${text}</text>`; }
function card(x,y,w,h,col=C.white,r=22){ return cel(Rr(x,y,w,h,r),col,{w:6}); }
function tag(x,y,w,lines,col=PAPER){ const h=38+lines.length*52; return card(x,y,w,h,col)+lines.map((l,i)=>T(l,x+28,y+60+i*52,i?36:42,INK,{wt:i?500:700})).join('')+sparkle(x+w-8,y+8,18,C.mustard); }
function bubble(x,y,w,h,tx,ty,lines,size=50){ const d=`M${x+28} ${y} H${x+w-28} Q${x+w} ${y} ${x+w} ${y+28} V${y+h-28} Q${x+w} ${y+h} ${x+w-28} ${y+h} H${Math.min(x+w-60,Math.max(x+60,tx+40))} L${tx} ${ty} L${Math.min(x+w-120,Math.max(x+20,tx-20))} ${y+h} H${x+28} Q${x} ${y+h} ${x} ${y+h-28} V${y+28} Q${x} ${y} ${x+28} ${y}Z`; return cel(P(d),C.white,{w:7})+lines.map((l,i)=>T(l,x+w/2,y+h/2-(lines.length-1)*size*0.6+i*size*1.2+size*0.35,size,INK,{a:'middle'})).join(''); }
function phone(x,y,w,h,inner){ return cel(Rr(x,y,w,h,46),'#262A33',{w:8})+`<rect x="${x+24}" y="${y+40}" width="${w-48}" height="${h-80}" rx="22" fill="${C.white}"/>`+inner; }
// ---------- characters ----------
function glove(x,y,s=1,rot=0,flip=false){ return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${flip?-s:s},${s})">${cel(P('M-26 -18 Q-30 22 -6 30 Q22 34 30 10 L40 -6 Q44 -16 34 -16 L24 -6 L26 -30 Q24 -40 14 -36 L10 -22 L4 -38 Q-4 -44 -10 -34 Z'),C.white,{w:6})}<path d="M2 -6 L4 12 M14 -8 L14 10" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g>`; }
// arms always swing outward: small angles = resting, large = raised (sign ignored)
const armL=a=>Math.abs(a)<=40?-Math.max(14,Math.abs(a)):-Math.abs(a), armR=a=>Math.abs(a)<=40?Math.max(14,Math.abs(a)):Math.abs(a);
function arm(sx,sy,ang,len,col,glv=true){ const a=ang*Math.PI/180, ex=sx+Math.sin(a)*len, ey=sy+Math.cos(a)*len;
  return `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${INK}" stroke-width="48" stroke-linecap="round"/><line x1="${sx+4}" y1="${sy+4}" x2="${ex+4}" y2="${ey+4}" stroke="${col}" stroke-width="34" stroke-linecap="round"/>`+(glv?glove(ex,ey+8,1,-ang*0.4,ang<0):''); }
function face(ey,o){ const g=[];
  const bl=o.blink;
  if(o.eyes==='side'){ g.push(`<ellipse cx="34" cy="${ey}" rx="9" ry="12" fill="${INK}"/><ellipse cx="86" cy="${ey}" rx="9" ry="12" fill="${INK}"/>`); }
  else if(bl){ g.push(`<path d="M10 ${ey} H34 M62 ${ey} H86" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`); }
  else { g.push(o.wink?`<path d="M10 ${ey} Q22 ${ey-8} 34 ${ey}" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`:`<ellipse cx="22" cy="${ey}" rx="9" ry="12" fill="${INK}"/>`); g.push(`<ellipse cx="74" cy="${ey}" rx="9" ry="12" fill="${INK}"/>`); }
  const by=o.brow==='up'?-44:(o.brow==='angry'?-24:-32);
  g.push(o.brow==='angry'?`<path d="M2 ${ey-38} L40 ${ey-26} M60 ${ey-26} L94 ${ey-36}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`:`<path d="M-2 ${ey+by} Q20 ${ey+by-10} 40 ${ey+by} M62 ${ey+by} Q78 ${ey+by-8} 92 ${ey+by}" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`);
  const m=o.mouth||'smile';
  if(m==='o') g.push(`<ellipse cx="44" cy="-706" rx="14" ry="18" fill="${INK}"/>`);
  else if(m==='talk') g.push(`<path d="M14 -716 Q44 -682 74 -716 Z" fill="${INK}"/>`);
  else if(m==='flat') g.push(`<path d="M16 -712 H70" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`);
  else if(m==='sad') g.push(`<path d="M14 -700 Q44 -722 74 -700" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`);
  else g.push(`<path d="M6 -712 Q40 -690 70 -716" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`);
  g.push(`<ellipse cx="-18" cy="-728" rx="16" ry="9" fill="${C.coral}" opacity=".45"/>`);
  return g.join('');
}
function baptiste(x,y,s=1,o={}){ const g=[];
  g.push(cel(P('M-70 -330 L-78 -40 L-22 -40 L-6 -250 L10 -250 L26 -40 L82 -40 L74 -330 Z'),C.beige));
  g.push(cel(P('M-96 -40 Q-100 -2 -60 0 L-8 0 Q4 -2 -4 -22 L-18 -46 L-80 -46 Z'),C.white,{w:6}));
  g.push(cel(P('M14 -46 L8 -20 Q4 0 26 0 L92 0 Q112 -4 96 -30 L80 -46 Z'),C.white,{w:6}));
  const aL=o.aL??12, aR=o.aR??-12;
  if(!o.backArms) {}
  const ARMS=arm(-104,-594,armL(aL),230,C.powder,!o.noGloveL)+arm(104,-594,armR(aR),230,C.powder,!o.phone);
  g.push(cel(P('M-100 -610 Q-110 -470 -84 -320 L88 -320 Q110 -470 100 -610 Q0 -650 -100 -610Z'),C.powder));
  let q=''; for(let i=0;i<5;i++) q+=`<path d="M-92 ${-570+i*52} Q0 ${-556+i*52} 92 ${-570+i*52}" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  g.push(cel(P('M-104 -606 Q-112 -470 -90 -322 L92 -322 Q112 -470 104 -606 Q60 -630 30 -626 L0 -520 L-30 -626 Q-60 -630 -104 -606Z'),C.navy)+q+`<path d="M0 -520 L0 -326" stroke="${INK}" stroke-width="5"/>`);
  g.push(cel(P('M-34 -628 L0 -580 L34 -628 L18 -640 L0 -610 L-18 -640 Z'),C.white,{w:5}));
  g.push(ARMS);
  if(o.phone){ const a=armR(aR)*Math.PI/180, ex=104+Math.sin(a)*230, ey=-594+Math.cos(a)*230; g.push(cel(Rr(ex-26,ey-70,56,100,12),'#262A33',{w:6})+`<rect x="${ex-18}" y="${ey-60}" width="40" height="76" rx="6" fill="${C.powder}"/>`+glove(ex,ey+10,1,0)); }
  if(o.chest) g.push(glove(-10,-470,1.05,-20,true));
  g.push(cel(Rr(-26,-676,52,50,10),C.skin,{w:6}));
  g.push(cel(P('M-96 -790 Q-104 -900 -10 -912 Q86 -916 96 -820 Q100 -790 92 -770 Q118 -760 112 -738 Q104 -716 88 -722 Q84 -660 6 -650 Q-90 -654 -96 -790Z'),C.skin));
  g.push(cel(P('M-104 -800 Q-118 -930 -4 -944 Q110 -950 112 -840 Q90 -880 40 -884 Q-20 -900 -60 -860 Q-84 -836 -88 -792 Z'),C.hair));
  if(o.headphones) g.push(`<path d="M-110 -790 Q-120 -980 0 -985 Q118 -980 112 -800" stroke="${INK}" stroke-width="16" fill="none"/>`+cel(Rr(-130,-820,40,80,16),C.red,{w:6})+cel(Rr(96,-820,40,80,16),C.red,{w:6}));
  g.push(cel(E(-92,-770,18,26),C.skin,{w:6})+(o.headphones?'':cel(Rr(-108,-768,14,30,7),C.white,{w:4})));
  g.push(face(-786,o));
  const sc=s*(o.squash||1);
  return `<g transform="translate(${x},${y}) scale(${s},${sc})">${g.join('')}</g>`;
}
function papa(x,y,s=1,o={}){ const g=[];
  g.push(cel(P('M-80 -320 L-86 0 L-20 0 L-4 -240 L12 -240 L28 0 L92 0 L84 -320Z'),'#6C6457'));
  g.push(cel(P('M-120 -600 Q-140 -460 -100 -320 L104 -320 Q140 -460 120 -600 Q0 -650 -120 -600Z'),C.olive));
  g.push(`<path d="M0 -610 L0 -330" stroke="${INK}" stroke-width="5"/>`+[-560,-500,-440,-380].map(yy=>`<circle cx="18" cy="${yy}" r="7" fill="${C.mustard}" stroke="${INK}" stroke-width="3"/>`).join(''));
  g.push(arm(-124,-584,armL(o.aL??14),220,C.olive)+arm(124,-584,armR(o.aR??-14),220,C.olive,!o.pen));
  if(o.pen){ const a=armR(o.aR??-14)*Math.PI/180, ex=124+Math.sin(a)*220, ey=-584+Math.cos(a)*220; g.push(`<line x1="${ex}" y1="${ey}" x2="${ex+40}" y2="${ey+50}" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>`+glove(ex,ey,1,10)); }
  g.push(cel(Rr(-24,-670,48,44,10),C.skin,{w:6}));
  g.push(cel(E(0,-770,104,108),C.skin));
  g.push(cel(P('M-96 -800 Q-90 -880 0 -884 Q-60 -860 -70 -790 Z'),'#B9B2A6',{w:5})+cel(P('M96 -800 Q90 -880 10 -884 Q70 -860 76 -790 Z'),'#B9B2A6',{w:5}));
  const ex=o.eyes==='side'?12:0;
  g.push(`<circle cx="-34" cy="-786" r="26" fill="none" stroke="${INK}" stroke-width="6"/><circle cx="34" cy="-786" r="26" fill="none" stroke="${INK}" stroke-width="6"/><path d="M-8 -786 H8" stroke="${INK}" stroke-width="6"/>`);
  g.push(o.blink?`<path d="M-44 -786 H-24 M24 -786 H44" stroke="${INK}" stroke-width="6"/>`:`<circle cx="${-34+ex}" cy="-786" r="7" fill="${INK}"/><circle cx="${34+ex}" cy="-786" r="7" fill="${INK}"/>`);
  g.push(cel(P('M-46 -730 Q0 -760 46 -730 Q20 -716 0 -726 Q-20 -716 -46 -730Z'),'#B9B2A6',{w:5}));
  return `<g transform="translate(${x},${y}) scale(${s})">${g.join('')}</g>`;
}
function maman(x,y,s=1,o={}){ const g=[];
  g.push(cel(P('M-50 -300 L-56 -40 L-16 -40 L-8 -300Z M50 -300 L56 -40 L16 -40 L8 -300Z'),C.skin,{w:6}));
  g.push(cel(P('M-60 -40 Q-70 0 -20 0 L-12 -40Z M60 -40 Q70 0 20 0 L12 -40Z'),C.red,{w:6}));
  g.push(cel(P('M-96 -600 Q-110 -480 -150 -280 L150 -280 Q110 -480 96 -600 Q0 -640 -96 -600Z'),C.plum));
  g.push(arm(-100,-584,armL(o.aL??16),210,C.plum)+arm(100,-584,armR(o.aR??-16),210,C.plum));
  g.push(cel(Rr(-22,-660,44,40,10),C.skin,{w:6}));
  g.push(cel(P('M-120 -700 Q-140 -900 0 -910 Q140 -900 120 -700 Q110 -640 80 -650 L-80 -650 Q-110 -640 -120 -700Z'),'#3A2A2A'));
  g.push(cel(E(0,-766,86,98),C.skin));
  g.push(cel(P('M-92 -790 Q-80 -880 0 -880 Q80 -880 92 -790 Q60 -840 0 -836 Q-60 -840 -92 -790Z'),'#3A2A2A',{w:5}));
  const ex=o.eyes==='side'?-12:0;
  g.push(o.blink?`<path d="M-44 -776 H-20 M20 -776 H44" stroke="${INK}" stroke-width="6"/>`:`<ellipse cx="${-30+ex}" cy="-776" rx="8" ry="11" fill="${INK}"/><ellipse cx="${30+ex}" cy="-776" rx="8" ry="11" fill="${INK}"/>`);
  g.push(o.mouth==='flat'?`<path d="M-22 -716 H22" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`:`<path d="M-24 -720 Q0 -700 24 -720" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`);
  g.push(`<circle cx="-50" cy="-736" r="14" fill="${C.coral}" opacity=".45"/><circle cx="50" cy="-736" r="14" fill="${C.coral}" opacity=".45"/>`);
  return `<g transform="translate(${x},${y}) scale(${s})">${g.join('')}</g>`;
}
const shadow=(x,w,col)=>`<ellipse cx="${x+10}" cy="1462" rx="${w}" ry="22" fill="${col}"/>`;
// ---------- captions ----------
function captions(t){ let c=null; for(const k of TL.caps) if(t>=k.t0&&t<k.t1) c=k; if(!c) return '';
 const s=back(seg(t,c.t0,c.t0+0.18)); const nch=c.w.reduce((a,[w])=>a+w.length+1,0); const size=Math.min(92,Math.floor(940/(nch*0.6)));
 const parts=c.w.map(([w,h])=>`<tspan fill="${h===2?C.red:(h?C.mustard:C.white)}">${w} </tspan>`).join('');
 return `<g transform="translate(540 1650) scale(${(0.85+0.15*s).toFixed(3)})"><text x="0" y="0" font-family="Jost" font-weight="700" font-size="${size}" text-anchor="middle" stroke="${INK}" stroke-width="22" stroke-linejoin="round" paint-order="stroke" letter-spacing="1">${parts}</text></g>`; }


// ---------- series furniture ----------
// Title banner kept on screen for the whole film (the hook): set window.EP_TITLE=['KYLIAN, 17 ANS :','GAUCHISTE ULTIME ?!'] in episode.js.
function titleBanner(t){ const L=window.EP_TITLE; if(!L) return ''; const s=back(seg(t,0,0.3));
  return `<g transform="translate(540 120) scale(${s.toFixed(3)}) translate(-540 -120)">${cel(Rr(90,40,900,L.length>1?170:100,26),'#2B2F3A',{w:6})}`+T(L[0],540,104,52,C.white,{a:'middle'})+(L[1]?T(L[1],540,176,62,C.mustard,{a:'middle',f:'Slab',wt:400}):'')+`</g>`; }
// Age / year badge that ticks up between life stages: ageBadge(t, t0, 900, 300, 22, 'ANS')
function ageBadge(t,t0,x,y,n,label='ANS'){ return pop(t,t0,x,y,cel(Rr(x-90,y-80,180,150,22),'#2B2F3A',{w:6})+T(String(n),x,y+12,84,C.mustard,{a:'middle',f:'Slab',wt:400})+T(label,x,y+56,30,C.white,{a:'middle'})); }
// Rubber stamp slammed on the picture: stamp(t, t0, 540, 400, 'PAS TOUCHE !', C.red, -8)
function stamp(t,t0,x,y,txt,col=C.red,rot=-8){ if(t<t0) return ''; const k=seg(t,t0,t0+0.12), s=1.6-0.6*eo(k); const w=Math.max(280,txt.length*46+50);
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s.toFixed(3)})" opacity="${(0.4+0.6*k).toFixed(2)}"><rect x="${-w/2}" y="-60" width="${w}" height="120" rx="14" fill="${C.white}" fill-opacity=".85" stroke="${col}" stroke-width="12"/>${T(txt,0,22,64,col,{a:'middle',f:'Slab',wt:400})}</g>`; }

// ---------- generic character (use for every new cliché) ----------
// o: hair 'side'|'bob'|'curly'|'bald'|'bun'|'long'|'buzz'|'mohawk', hairCol, top color, topStyle 'puffer'|'shirt'|'hoodie'|'cardigan'|'suit'|'tshirt'|'dress'|'vest',
//    topCol2 (trim), pants color, shoes color, glasses true|'round'|'sun', beard 'full'|'stache'|'goatee', skin, aL/aR arm angles (deg, 0 = down, + = towards +x),
//    prop 'phone'|'mug'|'sign:TEXT'|'bag'|'flag:COLOR' in the right hand, face options as for baptiste (mouth smile|talk|o|flat|sad, eyes side, wink, blink, brow up|angry), badge text, cap colour.
function perso(x,y,s=1,o={}){ const g=[]; const skin=o.skin||C.skin, top=o.top||C.teal, t2=o.topCol2||C.white, pants=o.pants||C.navy, shoes=o.shoes||C.white, hc=o.hairCol||C.hair;
  if(o.topStyle==='dress'){ g.push(cel(P('M-50 -300 L-56 -40 L-16 -40 L-8 -300Z M50 -300 L56 -40 L16 -40 L8 -300Z'),skin,{w:6})); }
  else g.push(cel(P('M-70 -330 L-78 -40 L-22 -40 L-6 -250 L10 -250 L26 -40 L82 -40 L74 -330 Z'),pants));
  g.push(cel(P('M-96 -40 Q-100 -2 -60 0 L-8 0 Q4 -2 -4 -22 L-18 -46 L-80 -46 Z'),shoes,{w:6}));
  g.push(cel(P('M14 -46 L8 -20 Q4 0 26 0 L92 0 Q112 -4 96 -30 L80 -46 Z'),shoes,{w:6}));
  const sleeve=(o.topStyle==='tshirt'||o.topStyle==='vest'||o.topStyle==='puffer')?(o.sleeve||skin):top;
  const aL=o.aL??12, aR=o.aR??-12; const hasProp=!!o.prop;
  const ARMS=arm(-104,-594,armL(aL),230,sleeve)+arm(104,-594,armR(aR),230,sleeve,!hasProp);
  if(o.topStyle==='dress') g.push(cel(P('M-96 -600 Q-110 -480 -150 -280 L150 -280 Q110 -480 96 -600 Q0 -640 -96 -600Z'),top));
  else g.push(cel(P('M-100 -610 Q-110 -470 -84 -320 L88 -320 Q110 -470 100 -610 Q0 -650 -100 -610Z'),top));
  if(o.topStyle==='puffer'||o.topStyle==='vest'){ let q=''; if(o.topStyle==='puffer') for(let i=0;i<5;i++) q+=`<path d="M-92 ${-570+i*52} Q0 ${-556+i*52} 92 ${-570+i*52}" stroke="${INK}" stroke-width="5" fill="none"/>`; g.push(q+`<path d="M0 -600 L0 -326" stroke="${INK}" stroke-width="5"/>`); }
  if(o.topStyle==='suit'){ g.push(cel(P('M-30 -626 L0 -540 L30 -626 Z'),t2,{w:5})+cel(P('M-10 -600 L10 -600 L14 -470 L0 -450 L-14 -470Z'),o.tie||C.red,{w:5})+`<path d="M-34 -626 L-6 -480 M34 -626 L6 -480" stroke="${INK}" stroke-width="5"/>`); }
  if(o.topStyle==='hoodie'){ g.push(cel(P('M-70 -640 Q0 -580 70 -640 Q60 -600 0 -590 Q-60 -600 -70 -640Z'),top,{w:5})+`<path d="M-20 -600 L-24 -540 M20 -600 L24 -540" stroke="${INK}" stroke-width="5"/>`+cel(Rr(-60,-450,120,70,20),top,{w:5})); }
  if(o.topStyle==='shirt'||o.topStyle==='cardigan'||o.topStyle==='puffer') g.push(cel(P('M-34 -628 L0 -580 L34 -628 L18 -640 L0 -610 L-18 -640 Z'),t2,{w:5}));
  if(o.topStyle==='cardigan') g.push(`<path d="M0 -600 L0 -330" stroke="${INK}" stroke-width="5"/>`+[-560,-500,-440,-380].map(yy=>`<circle cx="18" cy="${yy}" r="7" fill="${C.mustard}" stroke="${INK}" stroke-width="3"/>`).join(''));
  g.push(ARMS);
  if(o.badge) g.push(cel(E(-50,-540,34,34),C.white,{w:5})+T(o.badge,-50,-530,20,INK,{a:'middle'}));
  if(hasProp){ const a=armR(aR)*Math.PI/180, ex=104+Math.sin(a)*230, ey=-594+Math.cos(a)*230; const p=o.prop;
    if(p==='phone') g.push(cel(Rr(ex-26,ey-70,56,100,12),'#262A33',{w:6})+`<rect x="${ex-18}" y="${ey-60}" width="40" height="76" rx="6" fill="${C.powder}"/>`);
    else if(p==='mug') g.push(cel(Rr(ex-30,ey-60,60,70,10),C.white,{w:6})+`<path d="M${ex+30} ${ey-45} q24 0 24 20 q0 20 -24 20" stroke="${INK}" stroke-width="6" fill="none"/>`);
    else if(p==='bag') g.push(cel(Rr(ex-50,ey,100,90,14),C.beige,{w:6}));
    else if(p.startsWith('sign:')){ const tx=p.slice(5); g.push(`<line x1="${ex}" y1="${ey+20}" x2="${ex}" y2="${ey-260}" stroke="${INK}" stroke-width="12"/>`+cel(Rr(ex-150,ey-400,300,150,10),C.white,{w:6})+T(tx,ex,ey-312,Math.min(48,560/tx.length),INK,{a:'middle'})); }
    else if(p.startsWith('flag:')){ g.push(`<line x1="${ex}" y1="${ey+20}" x2="${ex}" y2="${ey-300}" stroke="${INK}" stroke-width="10"/>`+cel(P(`M${ex} ${ey-300} L${ex+180} ${ey-260} L${ex} ${ey-200}Z`),p.slice(5),{w:6})); }
    g.push(glove(ex,ey+10,1,0)); }
  g.push(cel(Rr(-26,-676,52,50,10),skin,{w:6}));
  if(o.hair==='long'||o.hair==='bob') g.push(cel(P(o.hair==='long'?'M-120 -700 Q-150 -930 0 -940 Q150 -930 120 -700 Q130 -560 70 -560 L-70 -560 Q-130 -560 -120 -700Z':'M-120 -700 Q-140 -930 0 -940 Q140 -930 120 -700 Q110 -640 80 -650 L-80 -650 Q-110 -640 -120 -700Z'),hc));
  g.push(cel(P('M-96 -790 Q-104 -900 -10 -912 Q86 -916 96 -820 Q100 -790 92 -770 Q118 -760 112 -738 Q104 -716 88 -722 Q84 -660 6 -650 Q-90 -654 -96 -790Z'),skin));
  const H={side:'M-104 -800 Q-118 -930 -4 -944 Q110 -950 112 -840 Q90 -880 40 -884 Q-20 -900 -60 -860 Q-84 -836 -88 -792 Z',
    bob:'M-104 -790 Q-110 -940 0 -946 Q110 -940 110 -820 Q60 -870 0 -866 Q-60 -870 -84 -800 Z', long:'M-104 -790 Q-110 -940 0 -946 Q110 -940 110 -820 Q60 -880 0 -876 Q-60 -880 -84 -800 Z',
    buzz:'M-98 -830 Q-90 -920 0 -924 Q96 -920 100 -840 Q60 -890 0 -892 Q-60 -890 -98 -830Z', bald:'M-100 -790 Q-110 -820 -96 -840 Q-80 -820 -84 -790Z M100 -800 Q110 -830 96 -846 Q84 -826 88 -800Z',
    mohawk:'M-20 -910 Q-30 -1010 0 -1030 Q30 -1010 20 -910Z', bun:'M-104 -800 Q-110 -940 0 -946 Q110 -940 110 -820 Q60 -880 0 -876 Q-60 -880 -84 -800 Z M-40 -940 Q-50 -1010 0 -1014 Q50 -1010 40 -940Z'};
  if(o.hair==='curly'){ let c=''; for(let i=0;i<9;i++){ const a=Math.PI*(1.05+i*0.11); c+=cel(E(Math.cos(a)*100,-800+Math.sin(a)*120,40,40),hc,{w:5}); } g.push(c); }
  else if(o.hair!=='none') g.push(cel(P(H[o.hair||'side']),hc));
  if(o.cap) g.push(cel(P('M-104 -830 Q-100 -950 0 -952 Q100 -950 104 -830Z'),o.cap)+cel(P('M60 -840 Q150 -840 170 -820 L104 -816Z'),o.cap,{w:6}));
  g.push(cel(E(-92,-770,18,26),skin,{w:6}));
  g.push(face(-786,o));
  if(o.glasses) g.push(o.glasses==='sun'?`<path d="M0 -800 H100" stroke="${INK}" stroke-width="7"/>`+cel(Rr(0,-806,44,34,10),INK,{w:4,noOff:true})+cel(Rr(56,-806,44,34,10),INK,{w:4,noOff:true}):`<circle cx="22" cy="-786" r="26" fill="none" stroke="${INK}" stroke-width="6"/><circle cx="76" cy="-786" r="26" fill="none" stroke="${INK}" stroke-width="6"/><path d="M48 -786 H50" stroke="${INK}" stroke-width="6"/>`);
  if(o.beard==='full') g.push(cel(P('M-60 -740 Q-40 -640 30 -640 Q96 -650 92 -740 Q60 -700 30 -704 Q-20 -700 -60 -740Z'),hc,{w:5}));
  if(o.beard==='stache') g.push(cel(P('M10 -730 Q44 -750 78 -730 Q60 -718 44 -726 Q28 -718 10 -730Z'),hc,{w:5}));
  if(o.beard==='goatee') g.push(cel(P('M24 -690 Q44 -650 64 -690Z'),hc,{w:5}));
  return `<g transform="translate(${x},${y}) scale(${s})">${g.join('')}</g>`;
}
// ---------- render ----------
function startFilm(SC,GROUND){
const ORDER=TL.scenes.map(s=>s[0]);
function sceneAt(t){ for(const [n,a,b] of TL.scenes) if(t>=a&&t<b) return [n,a,b]; const l=TL.scenes[TL.scenes.length-1]; return l; }
const st=document.getElementById('st');
window.DUR=TL.dur;
window.render=function(t){
  const [n,a,b]=sceneAt(t); seed=1+Math.floor(t*12)*7+ORDER.indexOf(n)*1000; // cel jitter on twos
  const push=1+0.025*seg(t,a,b);
  let body=`<g transform="translate(540 960) scale(${push.toFixed(4)}) translate(-540 -960)">${SC[n](t,t-a)}</g>`;
  // colour-block wipe into the next scene
  const i=ORDER.indexOf(n); if(i<ORDER.length-1&&t>b-0.22){ const p=eo(seg(t,b-0.22,b)); body+=`<rect x="${-1080+1080*p}" y="0" width="1080" height="1920" fill="${GROUND[ORDER[i+1]]}"/><rect x="${1080*p-8}" y="0" width="10" height="1920" fill="${INK}"/>`; }
  const grain=`<rect width="1080" height="1920" filter="url(#gr)"/>`;
  const vig=`<rect width="1080" height="1920" fill="url(#vg)"/>`;
  st.innerHTML=`<svg viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg"><defs><filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${Math.floor(t*12)%7}"/><feColorMatrix values="0 0 0 0 .17 0 0 0 0 .14 0 0 0 0 .12 0 0 0 .09 0"/><feComposite in2="SourceGraphic" operator="in"/></filter><radialGradient id="vg" cx=".5" cy=".5" r=".75"><stop offset=".65" stop-color="#2B2320" stop-opacity="0"/><stop offset="1" stop-color="#2B2320" stop-opacity=".22"/></radialGradient></defs>${body}${grain}${vig}${titleBanner(t)}${captions(t)}</svg>`;
};
// events for the mix: pop-ins come from words used above
window.EV=[];
window.TEXTS=function(t){ let c=null; for(const k of TL.caps) if(t>=k.t0&&t<k.t1) c=k; return c?[{id:'cap',text:c.w.map(x=>x[0]).join(' '),x0:60,y0:1560,x1:1020,y1:1690}]:[]; };
document.fonts.ready.then(()=>{ window.READY=true; });
if(!/HeadlessChrome/.test(navigator.userAgent)){ const t0=performance.now(); (function loop(){ window.render(((performance.now()-t0)/1000)%TL.dur); requestAnimationFrame(loop); })(); }
}
