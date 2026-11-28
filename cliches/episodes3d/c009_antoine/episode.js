// Épisode 9 : « Antoine, 45 ans : gauche caviar ultime ?! » (gauche)
import * as K from './toon3d.js';
const { P, V } = K;
window.EP_TITLE = ['ANTOINE, 45 ANS :', 'GAUCHE CAVIAR ULTIME ?!'];
const S = {}; TL.scenes.forEach(([n, a, b]) => S[n] = [a, b]);
const nk = k => k.toLowerCase().replace(/[.,?!…:»«]+$/, '');
const W = (k, i = 0) => { const a = TL.words[nk(k)] || [0]; return a[Math.min(i, a.length - 1)]; };
const dur = n => S[n][1] - S[n][0];
const r0 = n => S[n][0];
const rel = (k, i = 0, n) => W(k, i) - r0(n) - .1;

// ---- décors ----
K.sky('day');
const HOME = K.SETS.home(1000, { tvText: 'FRANCE CULTURE' });
const UNI = K.SETS.fac(2000, { title: 'UNIVERSITÉ', banners: ['TAXEZ LES RICHES', 'MIXITÉ !'] });
const PRIV = K.SETS.fac(2600, { title: 'COLLÈGE PRIVÉ LES TILLEULS', banners: ['EXCELLENCE', '4 000 € / AN'] });

// ---- personnages ----
const base = { hat: 'curly', hairColor: 0x5a3a22, glasses: 'round', pants: 0x3a4a3a };
const a20 = K.avatar({ ...base, outfit: 'hoodie', shirt: 0xcdb892, print: 'BIO', printColor: '#3a5a2a', prop: 'sign:ÉCOLE POUR TOUS', face: 'shout' });
const a28 = K.avatar({ ...base, outfit: 'jacket', shirt: 0x8a6a4a, beard: 0x5a3a22, prop: 'laptop', face: 'smug' });
const a28p = K.avatar({ ...base, outfit: 'jacket', shirt: 0x8a6a4a, beard: 0x5a3a22, prop: 'phone', face: 'grin' });
const a35 = K.avatar({ ...base, outfit: 'polo', shirt: 0x6a2a3a, beard: 0x5a3a22, prop: 'glass', face: 'talk' });
const a45 = K.avatar({ ...base, outfit: 'jacket', shirt: 0x4a5a6a, beard: 0x8a8070, hairColor: 0x8a8070, prop: 'phone', face: 'smug' });
const a45s = K.avatar({ ...base, outfit: 'jacket', shirt: 0x4a5a6a, beard: 0x8a8070, hairColor: 0x8a8070, prop: 'sign:ÉCOLE POUR TOUS', face: 'shout' });
const uni = { outfit: 'jacket', shirt: 0x1f2a55, tie: P.red, pants: 0x55555f, hat: 'long', hairColor: 0x5a3a22, scale: .78 };
const fille = K.avatar({ ...uni, face: 'happy' });
const fille11 = K.avatar({ ...uni, outfit: 'tee', shirt: 0xf2a0c0, tie: undefined, face: 'smile', scale: .72 });
const manif = K.crowd(6, 2600, 5.2, 2.6, { props: ['sign:PUBLIC !', 'flag:#c4281c', 'sign:NON', 'megaphone', 'sign:PUBLIC !', 'flag:#c4281c'], seed: 21, face: 'shout' });
const etud = K.crowd(5, 2000, 5, 3, { props: ['sign:TAXEZ !', '', 'flag:#c4281c', '', 'sign:GRÈVE'], seed: 9, face: 'shout' });
const invites = K.crowd(3, 1007, -.2, 2.2, { seed: 5, face: 'smile', outfits: ['polo', 'jacket', 'tee'] });
const all = [a20, a28, a28p, a35, a45, a45s, fille, fille11, ...manif, ...etud, ...invites];
const hideAll = () => all.forEach(a => a.hide(true));
const put = (av, s, dx = 0, dz = 0, ry) => { av.sitY = -.1; return av.hide(false).at(s.x + dx, s.z + dz, ry ?? s.ry ?? 0); };
const sit = (av, t, pose = 'sitTalk') => { av.pose(pose, t); av.legL.rotation.x = av.legR.rotation.x = -1.55; av.root.position.y = av.sitY ?? -.1; av.root.position.z = .2; return av; };
const manifOn = (t, look = false) => manif.forEach((v, i) => { v.hide(false); const p = look ? 'scared' : (i % 2 ? 'shout' : 'armsUp'); v.pose(p, t + i * .3).setFace(look ? 'shock' : 'shout', t); });

const SC = {
  // ouverture à froid : il hurle « école publique pour tous » devant le privé de sa fille
  hook(t, lt) { hideAll(); manifOn(t); put(a45s, PRIV.square, -1.2, 4.6, .15).pose('shout', t).setFace('shout', t);
    put(fille, PRIV.steps, 3, 1.5, -.2).pose(t < W('fille') ? 'wave' : 'laugh', t).setFace('happy', t);
    K.cuts([[0, (l, k) => K.push(a45s, 'medium', k, { h: 'low', side: .2 })],
            [W('hurle') - .1, (l, k) => K.orbit(a45s, 'full', -.4, -.1, k, { h: 'eye' })],
            [W('devant') - .1, (l, k) => K.drone(V(2612, 9, 22), V(2606, 7, 16), V(2600, 5, -6), V(2600, 4, -4), k, 58)],
            [W('fille') - .1, (l, k) => K.push(fille, 'medium', k, { h: 'low', side: -.2 })]], lt, dur('hook'));
    return K.stamp(t, W('caviar'), 490, 640, 'GAUCHO CAVIAR', K.C.red, -7, 66)
      + (t >= W('devant') - .1 && t < W('fille') - .1 ? K.card(t, W('privé'), 490, 1020, 600, ['🏫 COLLÈGE PRIVÉ', '4 000 € / AN']) : '')
      + (t >= W('fille') - .1 ? K.card(t, W('fille'), 490, 1020, 520, ['👧 SA FILLE', 'EN BLAZER']) : ''); },
  // comment on en arrive là ?
  question(t, lt) { hideAll(); manifOn(t); put(a45s, PRIV.square, -1.2, 4.6, .15).pose('shout', t).setFace('shout', t);
    K.drone(V(2585, 14, 30), V(2594, 9, 20), V(2600, 4, 0), V(2600, 3, 3), lt / dur('question'), 58);
    return K.card(t, r0('question'), 490, 640, 640, ['COMMENT ON', 'EN ARRIVE LÀ ?']) + K.stamp(t, W('retour'), 490, 1040, '⏪ RETOUR À 20 ANS', K.C.red, -5, 62); },
  // 20 ans : révolutionnaire en laine bio à la fac
  fac(t, lt) { hideAll(); etud.forEach((v, i) => v.hide(false).pose(i % 2 ? 'shout' : 'armsUp', t + i * .4).setFace('shout', t));
    put(a20, UNI.square, 0, 1.5, 0).pose([[0, 'proud'], [W('pancarte') - .1, 'shout'], [W('taxer') - .1, 'armsUp'], [W('mixité') - .1, 'point'], [W('sauf') - .1, 'shrug']], t)
      .setFace(t < W('pancarte') ? 'smug' : t < W('sauf') ? 'shout' : 'smug', t);
    K.cuts([[0, (l, k) => K.drone(V(2014, 12, 26), V(2006, 7, 17), V(2000, 5, -6), V(2000, 2.5, 2), k, 56)],
            [rel('antoine', 0, 'fac'), (l, k) => K.push(a20, 'medium', k, { h: 'low', side: -.2 })],
            [rel('pancarte', 0, 'fac'), (l, k) => K.orbit(a20, 'full', .4, .1, k, { h: 'eye' })],
            [rel('taxer', 0, 'fac'), (l, k) => K.push(a20, 'medium', k, { h: 'low', side: .25 })],
            [rel('mixité', 0, 'fac'), (l, k) => K.move(a20, 'full', 'wide', k, { h: 'eye', side: -.3 }, { h: 'high', side: -.2, fov: 60 })],
            [rel('sauf', 0, 'fac'), (l, k) => K.push(a20, 'close', k, { h: 'low', side: .15 })]], lt, dur('fac'));
    return K.ageBadge(t, r0('fac'), 800, 600, 20)
      + (t < W('pancarte') - .1 ? K.card(t, W('laine'), 490, 1020, 560, ['🧶 PULL LAINE BIO', '140 €']) : '')
      + (t >= W('pancarte') - .1 && t < W('taxer') - .1 ? K.card(t, W('pancarte'), 490, 1020, 640, ['🪧 « L\'ÉCOLE PUBLIQUE', 'POUR TOUS ! »']) : '')
      + (t >= W('taxer') - .1 && t < W('mixité') - .1 ? K.stamp(t, W('riches'), 490, 1030, '💰 TAXEZ LES RICHES', K.C.red, -5, 60) : '')
      + (t >= W('mixité') - .1 && t < W('sauf') - .1 ? K.card(t, W('mixité'), 490, 1020, 560, ['🤝 MIXITÉ SOCIALE', 'PARTOUT !']) : '')
      + (t >= W('sauf') - .1 ? K.stamp(t, W('immeuble'), 490, 1030, 'SAUF CHEZ LUI 🏠', K.C.red, 6, 70) : ''); },
  // 28 ans : prof de philo, pétitions et Airbnb
  philo(t, lt) { hideAll(); const ph = t >= W('loue') - .1; const A = ph ? a28p : a28; put(A, HOME.sofa[1]);
    sit(A, t, ph ? (t < W('retraite') - .1 ? 'phone' : 'sitTalk') : 'typing').setFace(ph ? (t < W('retraite') - .1 ? 'grin' : 'smug') : 'smug', t);
    K.cuts([[0, (l, k) => K.orbit(a28, 'medium', -.4, -.1, k, { h: 'high' })],
            [rel('pétitions', 0, 'philo'), (l, k) => K.push(a28, 'medium', k, { h: 'eye', side: .3 })],
            [rel('loue', 0, 'philo'), (l, k) => K.push(a28p, 'medium', k, { h: 'eye', side: -.25 })],
            [rel('cent', 0, 'philo'), (l, k) => K.orbit(a28p, 'full', .5, .2, k, { h: 'high' })],
            [rel('retraite', 0, 'philo'), (l, k) => K.push(a28p, 'medium', k, { h: 'eye', side: -.2, dist: .9 })]], lt, dur('philo'));
    return K.ageBadge(t, r0('philo'), 800, 600, 28)
      + (t < W('pétitions') - .1 ? K.card(t, W('prof'), 490, 1020, 520, ['👨‍🏫 PROF DE PHILO', 'MARX EN 1ÈRE']) : '')
      + (t >= W('pétitions') - .1 && t < W('loue') - .1 ? K.stamp(t, W('pétitions'), 490, 1030, '✍️ 214 PÉTITIONS', K.C.red, -6, 70) : '')
      + (t >= W('loue') - .1 && t < W('cent') - .1 ? K.card(t, W('airbnb'), 490, 1020, 560, ['🏠 2E APPART', 'SUR AIRBNB']) : '')
      + (t >= W('cent') - .1 && t < W('retraite') - .1 ? K.card(t, W('cent'), 490, 1020, 480, ['180 € / NUIT', '⭐ 4,9']) : '')
      + (t >= W('retraite') - .1 ? K.card(t, W('retraite'), 490, 1060, 600, ['« C\'EST POUR', 'MA RETRAITE »']) : ''); },
  // 35 ans : dîner quinoa et « ghettos de riches » dans un loft
  diner(t, lt) { hideAll(); const sleepy = t >= W('heures') + .2 && t < W('loft') - .1;
    invites.forEach((v, i) => { const s = HOME.sofa[i]; v.hide(false).at(s.x, s.z, s.ry); sit(v, t + i * .3, sleepy ? 'sleep' : 'sit'); v.setFace(sleepy ? 'sleepy' : 'smile', t); });
    put(a35, HOME.living, 3.5, -2.5, -.5).pose([[0, 'present'], [W('vin') - .1, 'drink'], [W('heures') - .1, 'talk'], [W('ghettos') - .1, 'shout'], [W('loft') - .1, 'proud']], t)
      .setFace(t < W('ghettos') - .1 ? 'talk' : t < W('loft') - .1 ? 'angry' : 'smug', t);
    K.cuts([[0, (l, k) => K.orbit(a35, 'wide', -.5, -.2, k, { h: 'high' })],
            [rel('quinoa', 0, 'diner'), (l, k) => K.push(a35, 'medium', k, { h: 'low', side: .2 })],
            [rel('heures', 0, 'diner'), (l, k) => K.orbit(invites[1], 'full', -.25, .15, k, { h: 'eye', dist: 1.3 })],
            [rel('ghettos', 0, 'diner'), (l, k) => K.push(a35, 'close', k, { h: 'low', side: -.2 })],
            [rel('loft', 0, 'diner'), (l, k) => K.orbit(a35, 'full', -.5, -.2, k, { h: 'eye' })]], lt, dur('diner'));
    return K.ageBadge(t, r0('diner'), 800, 600, 35)
      + (t < W('vin') - .1 ? K.card(t, W('quinoa'), 490, 1020, 480, ['🥗 QUINOA', 'DU PÉROU']) : '')
      + (t >= W('vin') - .1 && t < W('heures') - .1 ? K.card(t, W('vin'), 490, 1020, 520, ['🍷 VIN NATURE', '32 € LA BOUTEILLE']) : '')
      + (t >= W('heures') - .1 && t < W('ghettos') - .1 ? K.stamp(t, W('heures'), 490, 1030, '⏱️ 2 HEURES', K.C.red, -5, 76) : '')
      + (t >= W('ghettos') - .1 && t < W('loft') - .1 ? K.card(t, W('ghettos'), 490, 1020, 600, ['« LES GHETTOS', 'DE RICHES »']) : '')
      + (t >= W('loft') - .1 ? K.stamp(t, W('loft'), 490, 1030, 'LOFT 120 M²', K.C.red, 6, 80) : ''); },
  // 45 ans : la sixième de sa fille, direction le privé
  prive(t, lt) { hideAll(); put(a45, HOME.living, 1.2, 0, -.2).pose([[0, 'phone'], [W('quartier') - .1, 'think'], [W('sacrifier') - .1, 'cross'], [W('direction') - .1, 'present']], t)
      .setFace(t < W('quartier') - .1 ? 'smile' : t < W('sacrifier') - .1 ? 'worried' : t < W('direction') - .1 ? 'flat' : 'smug', t);
    put(fille11, HOME.living, -1.8, .4, .3).pose(t < W('direction') ? 'idle' : 'cheer', t).setFace('happy', t);
    K.cuts([[0, (l, k) => K.orbit(a45, 'wide', -.3, .1, k, { h: 'eye', dx: -1.5 })],
            [rel('quartier', 0, 'prive'), (l, k) => K.push(a45, 'medium', k, { h: 'low', side: .2 })],
            [rel('sacrifier', 0, 'prive'), (l, k) => K.push(a45, 'close', k, { h: 'low', side: -.2 })],
            [rel('direction', 0, 'prive'), (l, k) => K.orbit(a45, 'full', .4, .1, k, { h: 'high', dx: -1.5 })]], lt, dur('prive'));
    return K.ageBadge(t, r0('prive'), 800, 600, 45)
      + (t < W('quartier') - .1 ? K.card(t, W('sixième'), 490, 1020, 480, ['🎒 ENTRÉE', 'EN 6E']) : '')
      + (t >= W('quartier') - .1 && t < W('sacrifier') - .1 ? K.card(t, W('quartier'), 490, 1020, 560, ['🏫 COLLÈGE', 'DU QUARTIER ?']) : '')
      + (t >= W('sacrifier') - .1 && t < W('direction') - .1 ? K.stamp(t, W('sacrifier'), 490, 1030, '❌ NON MERCI', K.C.red, -6, 76) : '')
      + (t >= W('direction') - .1 ? K.card(t, W('quatre'), 490, 1020, 560, ['🏫 PRIVÉ ✅', '4 000 € / AN']) : ''); },
  // samedi : la manif passe devant le privé, sa fille sort
  chute(t, lt) { hideAll(); const out = t >= W('fille', 3) - .1; manifOn(t, t >= W('papa') - .1);
    put(a45s, PRIV.square, -1.2, 4.6, .15).pose([[0, 'shout'], [W('papa') - .1, 'scared'], [W('chèque') - .1, 'facepalm']], t)
      .setFace(t < W('papa') - .1 ? 'shout' : 'shock', t);
    if (out) put(fille, PRIV.steps, 3, 1.5, -.2).pose(t < W('chèque') ? 'wave' : 'laugh', t).setFace('happy', t);
    K.cuts([[0, (l, k) => K.drone(V(2590, 12, 28), V(2596, 8, 19), V(2600, 3, 4), V(2600, 3, 2), k, 58)],
            [rel('vieille', 0, 'chute'), (l, k) => K.push(a45s, 'medium', k, { h: 'low', side: .2 })],
            [rel('cortège', 0, 'chute'), (l, k) => K.drone(V(2612, 9, 22), V(2606, 7, 16), V(2600, 5, -6), V(2600, 4, -4), k, 58)],
            [rel('fille', 3, 'chute'), (l, k) => K.push(fille, 'medium', k, { h: 'low', side: -.2 })],
            [rel('chèque', 0, 'chute'), (l, k) => K.push(a45s, 'close', k, { h: 'low', side: .15 })]], lt, dur('chute'));
    return K.ageBadge(t, r0('chute'), 800, 600, 45)
      + (t < W('cortège') - .1 ? K.card(t, W('pancarte', 1), 490, 1020, 560, ['🪧 LA MÊME', 'PANCARTE']) : '')
      + (t >= W('cortège') - .1 && t < W('papa') - .1 ? K.card(t, W('privé', 2), 490, 1020, 600, ['🏫 COLLÈGE PRIVÉ', 'LES TILLEULS']) : '')
      + (t >= W('papa') - .1 && t < W('chut', 6) - .1 ? K.card(t, W('papa'), 490, 1060, 640, ['« PAPA ! T\'AS OUBLIÉ', 'MON CHÈQUE ! »']) : '')
      + (t >= W('chut', 6) - .1 ? K.stamp(t, W('chut', 6), 490, 1030, 'HYPOCRITE', K.C.red, -6, 90) : ''); },
  fin(t, lt) { hideAll(); manifOn(t, true); put(a45s, PRIV.square, -1.2, 4.6, .15).pose('facepalm', t).setFace('shock', t);
    put(fille, PRIV.steps, 3, 1.5, -.2).pose('laugh', t).setFace('laugh', t);
    K.drone(V(2606, 6, 18), V(2614, 11, 28), V(2600, 3, 2), V(2600, 3, 2), lt / dur('fin'), 56);
    return K.stamp(t, W('abonne-toi'), 490, 720, ' ABONNE-TOI ', K.C.red, -6, 74) + K.card(t, W('demain'), 490, 1020, 560, ['DEMAIN :', 'UN AUTRE CLICHÉ']); },
};
const MOODS = { hook: 'golden', question: 'golden', fac: 'day', philo: 'interior', diner: 'interior', prive: 'interior', chute: 'golden', fin: 'dusk' };
K.start({ scenes: SC, moods: MOODS });
