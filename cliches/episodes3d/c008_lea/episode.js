// Épisode 8 : « Léa, 31 ans : militante hypocrite ultime ?! » (militant)
import * as K from './toon3d.js';
const { P, V } = K;
window.EP_TITLE = ['LÉA, 31 ANS :', 'MILITANTE HYPOCRITE ULTIME ?!'];
const S = {}; TL.scenes.forEach(([n, a, b]) => S[n] = [a, b]);
const nk = k => k.toLowerCase().replace(/[.,?!…:»«]+$/, '');
const W = (k, i = 0) => { const a = TL.words[nk(k)] || [0]; return a[Math.min(i, a.length - 1)]; };
const dur = n => S[n][1] - S[n][0];
const r0 = n => S[n][0];
const rel = (k, i = 0, n) => W(k, i) - r0(n) - .1;

// ---- décors ----
K.sky('day');
const STREET = K.SETS.street(0);
const HOME = K.SETS.home(1000);
const ROOM = K.SETS.bedroom(1100, { night: true, podcast: true, neon: '🔴 EN LIVE' });
const OFF = K.SETS.office(1200, { banner: ['LÉA ÉTHIQUE ®'], board: ['👜 TOTE BAG', 'ÉTHIQUE', '39 €'] });
const FAC = K.SETS.fac(2000, { title: 'FAC DE SOCIO', banners: ['BOYCOTT TOUT', 'FAC OCCUPÉE'] });
// la montagne de colis dans le salon (apparaît à « commande »)
const COLIS = [];
for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) for (let h = 0; h < 3 - (i % 2); h++)
  COLIS.push(K.box(K.STATIC, 1.3, 1, 1.1, [0xc49a5a, 0xb8894a, 0xd2a86a][(i + j + h) % 3], 1000 - 2.4 + i * 1.45, .5 + h * 1.02, -6 + j * 1.25, { round: .05 }));
// tote bags sur les bureaux de l'atelier
for (let i = -2; i <= 2; i++) K.box(K.STATIC, 1, 1.2, .2, 0xf1e6d0, 1200 + i * 7.5 + 1.6, 3.3, -6, { round: .05 });

// ---- personnages ----
const look = { outfit: 'hoodie', shirt: 0x4f9a45, print: 'BOYCOTT', printColor: '#ffffff', pants: 0x2a3550, hat: 'long', hairColor: 0xb5533f, glasses: 'round' };
const pro = { outfit: 'jacket', shirt: 0xe9dcc6, pants: 0x3a3a3a, hat: 'long', hairColor: 0xb5533f, glasses: 'round' };
const l31 = K.avatar({ ...pro, prop: 'phone', face: 'cry' });
const l19 = K.avatar({ ...look, hat: 'beanie', hatColor: 0xc4281c, prop: 'phone', face: 'smug', scale: .95 });
const l22 = K.avatar({ ...look, prop: 'laptop', face: 'grin' });
const l25 = K.avatar({ ...look, outfit: 'tee', print: 'RÉSISTE', printColor: '#F5CD30', prop: 'sign:BOYCOTT !', face: 'shout' });
const l25p = K.avatar({ ...look, outfit: 'tee', print: 'RÉSISTE', printColor: '#F5CD30', prop: 'phone', face: 'grin' });
const l28 = K.avatar({ ...pro, prop: 'money', face: 'smug' });
const papa = K.avatar({ outfit: 'suit', shirt: 0x2a3550, tie: P.red, pants: 0x2a3550, hat: 'bald', beard: 0x888888, glasses: true, prop: 'money', face: 'smile' });
const cout = K.avatar({ outfit: 'tee', shirt: 0xd96aa0, pants: 0x4a6aa0, hat: 'bun', hairColor: 0x2a1a10, prop: 'phone', face: 'angry', scale: .95 });
const ouv = K.crowd(4, 1200, -3.6, 7.5, { hats: ['curly', 'hair', 'bun', 'cap'], face: 'sad', outfits: ['tee', 'hoodie'], seed: 8 });
const manif = K.crowd(6, 3, 4, 2.6, { props: ['sign:STOP !', 'sign:NON', 'megaphone', 'sign:RÉSISTE', 'flag:#c4281c', 'sign:STOP !'], seed: 33, face: 'shout' });
const haters = K.crowd(5, 0, 3.2, 2.8, { props: ['sign:#BOYCOTTLÉA', 'phone', 'sign:#BOYCOTTLÉA', 'sign:HYPOCRITE', 'sign:#BOYCOTTLÉA'], seed: 12, face: 'angry' });
const etud = K.crowd(4, 2000, -4, 3.2, { seed: 4, face: 'flat' });
const all = [l31, l19, l22, l25, l25p, l28, papa, cout, ...ouv, ...manif, ...haters, ...etud];
const hideAll = () => all.forEach(a => a.hide(true));
const put = (av, s, dx = 0, dz = 0, ry) => { av.sitY = -.1; return av.hide(false).at(s.x + dx, s.z + dz, ry ?? s.ry ?? 0); };
const sitPhone = (av, t, pose = 'phone') => { av.pose(pose, t); av.legL.rotation.x = av.legR.rotation.x = -1.55; av.root.position.y = av.sitY ?? -.1; av.root.position.z = .2; return av; };
const liveCard = t => K.card(t, -1, 490, 1000, 470, ['🔴 EN LIVE', 'EN LARMES']);
const showColis = on => COLIS.forEach(b => b.visible = on);

const SC = {
  // ouverture à froid : en live, en larmes, tout Internet la boycotte
  hook(t, lt) { hideAll(); showColis(false); put(l31, ROOM.center, 0, 1.5, 0);
    l31.pose(t < W('pourtant') ? 'phone' : 'shrug', t).setFace(t < W('pourtant') ? 'cry' : 'sad', t);
    K.cuts([[0, (l, k) => K.push(l31, 'medium', k, { h: 'low', side: .15 })],
            [W('live') - .15, (l, k) => K.orbit(l31, 'full', -.5, -.2, k, { h: 'eye' })],
            [W('boycotte') - .1, (l, k) => K.push(l31, 'medium', k, { h: 'eye', side: -.1, dist: .9 })],
            [W('pourtant') - .1, (l, k) => K.orbit(l31, 'medium', .5, .2, k, { h: 'high' })]], lt, dur('hook'));
    return K.stamp(t, W('hypocrite'), 300, 640, 'HYPOCRITE', K.C.red, -7, 78)
      + (t < W('boycotte') - .1 ? liveCard(t) : '')
      + (t >= W('boycotte') - .1 && t < W('pourtant') ? K.stamp(t, W('boycotte'), 490, 1040, '#BOYCOTTLÉA', K.C.red, 5, 76) : '')
      + (t >= W('pourtant') ? K.card(t, W('boycott'), 490, 1000, 600, ['#BOYCOTT ?', "C'EST SON IDÉE"]) : ''); },
  // la meute devant chez elle + retour en arrière
  question(t, lt) { hideAll(); haters.forEach((v, i) => v.hide(false).pose(i % 2 ? 'shout' : 'angry', t + i * .4).setFace('angry', t));
    K.drone(V(-14, 11, 22), V(-5, 6, 15), V(0, 2.5, 2), V(0, 3, 3), lt / dur('question'), 56);
    return K.card(t, r0('question'), 490, 640, 640, ['COMMENT ON', 'EN ARRIVE LÀ ?']) + K.stamp(t, W('retour'), 490, 1040, '⏪ RETOUR À 19 ANS', K.C.red, -5, 62); },
  // 19 ans : militante en iPhone, financée par papa
  ecole(t, lt) { hideAll(); put(l19, FAC.square, -1.2, 0, .25); etud.forEach((v, i) => v.hide(false).pose('idle', t + i).setFace('flat', t));
    const dad = t >= W('parents') - .1; if (dad) put(papa, FAC.square, 2.8, .6, -.6).pose(t < W('virement') ? 'cross' : 'present', t).setFace(t < W('virement') ? 'flat' : 'smile', t);
    l19.pose([[0, 'proud'], [W('iphone') - .1, 'phone'], [W('boycotte', 1) - .1, 'shout'], [W('parents') - .1, 'cross'], [W('virement') - .1, 'cheer']], t)
      .setFace(t < W('iphone') ? 'smug' : t < W('parents') ? 'shout' : t < W('virement') ? 'angry' : 'happy', t);
    K.cuts([[0, (l, k) => K.drone(V(2012, 12, 24), V(2005, 7, 16), V(2000, 5, -6), V(1999, 2.5, 1), k, 54)],
            [rel('iphone', 0, 'ecole'), (l, k) => K.push(l19, 'medium', k, { h: 'low', side: -.2 })],
            [rel('boycotte', 1, 'ecole'), (l, k) => K.move(l19, 'full', 'medium', k, { h: 'low', side: -.3 }, { h: 'low', side: -.15 })],
            [rel('capitalisme', 0, 'ecole'), (l, k) => K.push(l19, 'medium', k, { h: 'eye', side: .25 })],
            [rel('parents', 0, 'ecole'), (l, k) => K.orbit(l19, 'wide', -.2, .2, k, { h: 'eye', dx: 2 })],
            [rel('virement', 0, 'ecole'), (l, k) => K.push(papa, 'full', k, { h: 'low', side: .3 })]], lt, dur('ecole'));
    return K.ageBadge(t, r0('ecole'), 800, 600, 19)
      + (t < W('boycotte', 1) - .1 ? K.card(t, W('iphone'), 490, 1000, 520, ['📱 IPHONE', '1 200 €']) : '')
      + (t >= W('boycotte', 1) - .1 && t < W('capitalisme') - .1 ? K.card(t, W('viande'), 490, 1000, 620, ['🚫 VIANDE · BANQUES', 'AVION']) : '')
      + (t >= W('capitalisme') - .1 && t < W('parents') - .1 ? K.stamp(t, W('capitalisme'), 490, 1030, '❌ CAPITALISME', K.C.red, -5, 70) : '')
      + (t >= W('parents') - .1 && t < W('virement') - .1 ? K.stamp(t, W('parents'), 490, 1030, 'BOYCOTT : PAPA', K.C.red, 5, 70) : '')
      + (t >= W('virement') - .1 ? K.card(t, W('virement'), 490, 1000, 560, ['💸 VIREMENT DE PAPA', 'ACCEPTÉ ✅']) : ''); },
  // 22 ans : #BoycottTout, puis 40 colis de fast fashion
  colis(t, lt) { hideAll(); showColis(t >= W('commande')); put(l22, HOME.sofa[0]); sitPhone(l22, t, t < W('commande') ? 'typing' : 'laugh').setFace(t < W('commande') ? 'smug' : 'laugh', t);
    K.cuts([[0, (l, k) => K.orbit(l22, 'medium', -.4, -.1, k, { h: 'high' })],
            [rel('hashtag', 0, 'colis'), (l, k) => K.push(l22, 'close', k, { h: 'low', side: .2 })],
            [rel('commande', 0, 'colis'), (l, k) => K.move(l22, 'full', 'wide', k, { h: 'eye', yaw: -.5, side: -.3 }, { h: 'high', yaw: -.6, side: -.3, fov: 60 })]], lt, dur('colis'));
    return K.ageBadge(t, r0('colis'), 800, 600, 22)
      + (t < W('commande') - .1 ? K.card(t, W('hashtag'), 490, 1000, 560, ['#BOYCOTTTOUT', '✊ 12 LIKES']) : '')
      + (t >= W('commande') - .1 && t < W('fashion') ? K.stamp(t, W('quarante'), 490, 1030, '📦 × 40 COLIS', K.C.red, -6, 76) : '')
      + (t >= W('fashion') ? K.card(t, W('fashion'), 490, 1000, 520, ['👗 FAST FASHION', 'LIVRÉ DEMAIN']) : ''); },
  // 25 ans : manifs, selfie, Uber, stories
  manif(t, lt) { hideAll(); const sel = t >= W('selfie') - .1;
    manif.forEach((v, i) => v.hide(false).pose(i % 2 ? 'shout' : 'armsUp', t + i * .3).setFace('shout', t));
    if (!sel) put(l25, STREET.front, 0, 1.2, 0).pose('shout', t).setFace('shout', t);
    else put(l25p, STREET.front, 0, 1.2, 0).pose(t < W('uber') ? 'phone' : 'wave', t).setFace(t < W('uber') ? 'grin' : 'happy', t);
    const L = sel ? l25p : l25;
    K.cuts([[0, (l, k) => K.drone(V(14, 11, 24), V(6, 7, 17), V(0, 2.5, 3), V(0, 3, 4), k, 58)],
            [rel('pancarte', 0, 'manif'), (l, k) => K.push(l25, 'medium', k, { h: 'low', side: .2 })],
            [rel('selfie', 0, 'manif'), (l, k) => K.push(L, 'close', k, { h: 'low', side: -.2 })],
            [rel('uber', 0, 'manif'), (l, k) => K.orbit(L, 'full', .4, .1, k, { h: 'eye' })],
            [rel('stories', 0, 'manif'), (l, k) => K.push(L, 'close', k, { h: 'low', side: .15 })]], lt, dur('manif'));
    return K.ageBadge(t, r0('manif'), 800, 600, 25)
      + (t < W('selfie') - .1 ? K.card(t, W('pancarte'), 490, 1000, 480, ['🪧 PANCARTE', 'FAITE PAR UN AMI']) : '')
      + (t >= W('selfie') - .1 && t < W('uber') - .1 ? K.stamp(t, W('selfie'), 490, 1030, '🤳 SELFIE', K.C.red, -6, 80) : '')
      + (t >= W('uber') - .1 && t < W('deux') + .5 ? K.card(t, W('uber'), 490, 1000, 480, ['🚗 UBER', '4,9 ★ · 38 €']) : '')
      + (t >= W('deux') + .5 && t < W('zéro') - .1 ? K.card(t, W('quatre'), 490, 1000, 600, ['2 H DE MANIF', '4 H DE STORIES']) : '')
      + (t >= W('zéro') - .1 ? K.stamp(t, W('zéro'), 490, 1030, '0 IDÉE', K.C.red, 6, 90) : ''); },
  // 28 ans : sa marque de tote bags « éthiques »
  marque(t, lt) { hideAll(); put(l28, OFF.front, 0, -1, 0).pose(t < W('cousus') ? 'present' : 'proud', t).setFace('smug', t);
    ouv.forEach((v, i) => { v.hide(false).at(OFF.desks[i].x, OFF.desks[i].z + 1, Math.PI); v.pose('typing', t + i * .2).setFace('sad', t); });
    K.cuts([[0, (l, k) => K.move(l28, 'wide', 'full', k, { h: 'high', side: .3, fov: 60 }, { h: 'eye', side: .2 })],
            [rel('tote', 0, 'marque'), (l, k) => K.push(l28, 'medium', k, { h: 'low', side: .3 })],
            [rel('cousus', 0, 'marque'), (l, k) => K.orbit(ouv[1], 'medium', 2.6, 2.9, k, { h: 'eye' })],
            [rel('visibilité', 0, 'marque'), (l, k) => K.push(l28, 'close', k, { h: 'low', side: -.2 })]], lt, dur('marque'));
    return K.ageBadge(t, r0('marque'), 800, 600, 28)
      + (t < W('cousus') - .1 ? K.card(t, W('tote'), 490, 1000, 560, ['👜 TOTE BAG ÉTHIQUE', '39 €']) : '')
      + (t >= W('cousus') - .1 && t < W('visibilité') - .1 ? K.card(t, W('abonnées'), 490, 1000, 540, ['🧵 COUTURIÈRES :', 'SES ABONNÉES']) : '')
      + (t >= W('visibilité') - .1 ? K.stamp(t, W('visibilité'), 490, 1030, 'SALAIRE : 0 €', K.C.red, -5, 76) : ''); },
  // 31 ans : une couturière craque
  chute(t, lt) { hideAll(); ouv.slice(0, 3).forEach((v, i) => { v.hide(false).at(OFF.desks[i].x, OFF.desks[i].z + 1, Math.PI); v.pose('typing', t + i * .2).setFace('sad', t); });
    put(cout, OFF.front, 1, -1, -.2).pose(t < W('hashtag', 1) ? 'angry' : 'phone', t).setFace('angry', t);
    K.cuts([[0, (l, k) => K.push(cout, 'medium', k, { h: 'low', side: .3 })],
            [rel('hashtag', 1, 'chute'), (l, k) => K.push(cout, 'close', k, { h: 'low', side: -.2 })]], lt, dur('chute'));
    return K.ageBadge(t, r0('chute'), 800, 600, 31)
      + (t >= W('hashtag', 1) - .1 ? K.stamp(t, W('boycott', 2), 490, 1030, '#BOYCOTTLÉA', K.C.red, -5, 80) : ''); },
  // en live, en larmes : « le boycott, c'est violent »
  live(t, lt) { hideAll(); put(l31, ROOM.center, 0, 1.5, 0).pose(t < W('boycott', 3) ? 'phone' : 'talk', t).setFace('cry', t);
    K.cuts([[0, (l, k) => K.orbit(l31, 'medium', -.4, -.1, k, { h: 'eye' })],
            [rel('boycott', 3, 'live'), (l, k) => K.push(l31, 'medium', k, { h: 'eye', side: .1, dist: .9 })]], lt, dur('live'));
    return t < W('boycott', 3) - .1 ? liveCard(t) : K.card(t, W('boycott', 3), 490, 1090, 620, ['« LE BOYCOTT,', "C'EST VIOLENT »"]); },
  insulte(t, lt) { hideAll(); put(l31, ROOM.center, 0, 1.5, 0).pose('shrug', t).setFace('cry', t);
    K.push(l31, 'medium', lt / dur('insulte'), { h: 'eye', side: -.2 });
    return K.card(t, W('éthique'), 490, 1090, 480, ['👜 « ÉTHIQUE »', 'HEIN ?']) + K.stamp(t, W("l'hypocrite"), 300, 640, 'HYPOCRITE', K.C.red, -7, 78); },
  fin(t, lt) { hideAll(); haters.forEach((v, i) => v.hide(false).pose(i % 2 ? 'laugh' : 'shout', t + i * .4).setFace(i % 2 ? 'laugh' : 'angry', t));
    K.drone(V(5, 5, 16), V(12, 10, 25), V(0, 3, 3), V(0, 3, 3), lt / dur('fin'), 56);
    return K.stamp(t, W('abonne-toi'), 490, 720, 'ABONNE-TOI', K.C.red, -6, 90) + K.card(t, W('demain'), 490, 1000, 560, ['DEMAIN :', 'UN AUTRE CLICHÉ']); },
};
const MOODS = { hook: 'night', question: 'dusk', ecole: 'golden', colis: 'interior', manif: 'day', marque: 'interior', chute: 'interior', live: 'night', insulte: 'night', fin: 'dusk' };
K.start({ scenes: SC, moods: MOODS });
