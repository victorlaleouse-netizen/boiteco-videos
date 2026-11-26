// Épisode 4 : « Maxime, 34 ans : gauchiasse fils à papa ultime ?! » (extrême gauche)
import * as K from './toon3d.js';
const { P, V, seg, eo } = K;
window.EP_TITLE = ['MAXIME, 34 ANS :', 'GAUCHIASSE FILS À PAPA ?!'];
const S = {}; TL.scenes.forEach(([n, a, b]) => S[n] = [a, b]);
const nk = k => k.toLowerCase().replace(/[.,?!…:]+$/, '');
const W = (k, i = 0) => { const a = TL.words[nk(k)] || [0]; return a[Math.min(i, a.length - 1)]; };
const dur = n => S[n][1] - S[n][0];
const RED = K.C.red, INK = K.C.panel, GREEN = K.C.green;

// ---- décors ----
K.sky('day');
const STREET = K.SETS.street(0);
const HOME = K.SETS.home(1000);
const ROOM = K.SETS.bedroom(1100);
const EPI = K.SETS.office(1200, { banner: ['ÉPICERIE COOP'], board: ['CROISSANT : 6 €', '100 % SOLIDAIRE', 'STAGIAIRES : 3'] });
const APP = K.SETS.office(1400, { banner: ['MAXI LIVRAISON'], board: ['COURSE : 3 €', 'LIVREURS : 200', 'MARGE ↗ ↗ ↗'] });
const FAC = K.SETS.fac(2000, { title: 'FAC DE SOCIO', banners: ['AMPHI BLOQUÉ', 'À BAS LES PATRONS'] });

// ---- personnages ----
const young = { outfit: 'hoodie', shirt: 0xc4281c, print: '★ CHE', printColor: '#111111', pants: 0x222222, shoes: 0x111111, hat: 'curly', hairColor: 0x4a3020, face: 'smug' };
const maxJ = K.avatar(young);
const maxJSign = K.avatar({ ...young, prop: 'sign:À BAS|LES PATRONS' });
const maxJMeg = K.avatar({ ...young, prop: 'megaphone' });
const maxJPh = K.avatar({ ...young, prop: 'phone' });
const maxE = K.avatar({ outfit: 'tee', shirt: 0x4fae6a, print: 'SOLIDAIRE', printColor: '#ffffff', pants: 0x6c5a44, shoes: 0x111111, hat: 'curly', hairColor: 0x4a3020, glasses: 'round', beard: 0x4a3020, prop: 'croissant', face: 'smug' });
const boss = { outfit: 'suit', shirt: 0x1f2d4f, tie: 0xc4281c, pants: 0x1f2d4f, shoes: 0x111111, hat: 'hair', hairColor: 0x4a3020, beard: 0x4a3020, face: 'angry' };
const maxB = K.avatar(boss);
const maxBMeg = K.avatar({ ...boss, prop: 'megaphone' });
const papa = K.avatar({ outfit: 'suit', shirt: 0x3a3a3a, tie: 0x2457c9, pants: 0x3a3a3a, hat: 'bald', glasses: true, beard: 0xd0cabd, skin: P.skin2, face: 'smile' });
const papaPh = K.avatar({ outfit: 'suit', shirt: 0x3a3a3a, tie: 0x2457c9, pants: 0x3a3a3a, hat: 'bald', glasses: true, beard: 0xd0cabd, skin: P.skin2, prop: 'phone', face: 'smile' });
const maman = K.avatar({ outfit: 'jacket', shirt: 0x9b6ad0, pants: 0x2a2a2a, hat: 'long', hairColor: 0x5a3a2a, face: 'smile' });
const gardien = K.avatar({ outfit: 'jacket', shirt: 0x2457c9, pants: 0x2a3550, hat: 'cap', hatColor: 0x2457c9, beard: 0x888888, skin: P.skin3, face: 'sleepy' });
const broom = K.box(gardien.armR, .1, 3.0, .1, P.brown, 0, -1.7, .5); broom.rotation.x = .35; K.box(broom, 1.1, .35, .4, 0xd9a040, 0, -1.6, 0);
const livreurs = K.crowd(4, 3, 8.6, 2.3, { hats: ['helmet'], outfits: ['jacket'], ry: Math.PI, face: 'worried', seed: 4 });
const syndic = K.avatar({ outfit: 'jacket', shirt: 0x3ab0c0, pants: 0x2a3550, hat: 'helmet', hatColor: 0xf5cd30, prop: 'sign:SYNDICAT|?', face: 'worried' });
const etudiants = K.crowd(6, 2000, 1.5, 2.4, { ry: Math.PI, hats: ['beanie', 'curly', 'long', 'hair', 'bun', 'cap'], seed: 9 });
const stagiaires = K.crowd(3, 1200, 2.5, 3, { outfits: ['tee'], face: 'flat', seed: 13 });
const all = [maxJ, maxJSign, maxJMeg, maxJPh, maxE, maxB, maxBMeg, papa, papaPh, maman, gardien, syndic, ...livreurs, ...etudiants, ...stagiaires];
const hideAll = () => all.forEach(a => a.hide(true));
const put = (av, s, dx = 0, dz = 0, ry) => { av.sitY = -.1; return av.hide(false).at(s.x + dx, s.z + dz, ry ?? s.ry ?? 0); };
const age = (t, t0, n) => K.ageBadge(t, t0, 170, 590, n);
const showLivreurs = (t, pose = 'idle', face = 'worried') => livreurs.forEach((l, i) => { l.hide(false).at(4 + i * 1.9, 2.6 + (i % 2) * 1.4, -Math.PI / 2 + (i - 1.5) * .15).pose(pose, t + i * .3).setFace(face, t); });

const SC = {
  // cold open : 34 ans, costard, mégaphone, il gueule sur ses livreurs
  hook(t, lt) { hideAll(); put(maxBMeg, { x: 0, z: 3.4 }, 0, 0, .8); maxBMeg.pose('shout', t).setFace('shout', t); showLivreurs(t, 'scared');
    K.cuts([[0, (l, k) => K.move(maxBMeg, 'full', 'medium', k, { h: 'low', side: -.3 }, { h: 'low', side: -.15 })],
            [1.6, (l, k) => K.drone(V(-4, 7, 18), V(-2, 6, 16), V(3, 2, 3), V(4, 2, 3.2), k, 55)]], lt, dur('hook'));
    return K.stamp(t, W('feignasses'), 490, 1060, 'FEIGNASSES !', RED, -6, 84); },
  // retour à 19 ans : pancarte « À BAS LES PATRONS »
  question(t, lt) { hideAll(); put(maxJSign, STREET.front, 0, 0, 0); maxJSign.pose([[0, 'idle'], [W('abolir'), 'armsUp']], t).setFace(t < W('abolir') ? 'talk' : 'shout', t);
    const c = W('comment') - S.question[0];
    K.cuts([[0, (l, k) => K.orbit(maxJSign, 'full', -.6, -.1, k, { h: 'low' })],
            [c, (l, k) => K.drone(V(-20, 26, 40), V(-8, 12, 22), V(0, 1, 2), V(0, 3, 3), k, 52)]], lt, dur('question'));
    const top = t < W('comment') ? K.card(t, W('dix-neuf'), 490, 640, 560, ['À 19 ANS :', '« À BAS LES PATRONS »']) : K.card(t, W('comment'), 490, 640, 600, ['COMMENT ON', 'EN ARRIVE LÀ ? 🤔']);
    return age(t, W('dix-neuf'), 19) + top + K.stamp(t, W('retour'), 490, 1060, '⏪ RETOUR EN ARRIÈRE', INK, -4, 58); },
  // le canapé de papa, notaire
  canape(t, lt) { hideAll(); put(maxJPh, HOME.sofa[1]); maxJPh.pose('sit', t).setFace(t < W('canapé') ? 'smug' : 'cool', t); put(papa, HOME.sofa[1], 4.2, 3.2, -.6); papa.pose(t > W('notaire') ? 'proud' : 'idle', t).setFace('smile', t);
    K.cuts([[0, (l, k) => K.push(maxJPh, 'medium', k, { side: .3, h: 'low' })],
            [W('canapé') - S.canape[0], (l, k) => K.move(maxJPh, 'full', 'wide', k, { side: .4, dx: 1.5 }, { side: .3, dx: 2 })]], lt, dur('canape'));
    const st = t > W('notaire') ? K.stamp(t, W('notaire'), 490, 1060, 'PAPA = NOTAIRE', RED, 5, 62) : K.stamp(t, W('canapé'), 490, 1060, 'LE CANAPÉ DE PAPA 🛋', INK, -4, 54);
    return age(t, S.canape[0], 19) + K.card(t, W('révolutionnaire'), 490, 640, 580, ['RÉVOLUTIONNAIRE', 'à plein temps ✊']) + st; },
  // la panoplie
  look(t, lt) { hideAll(); put(maxJMeg, ROOM.center, 0, 0, 0); maxJMeg.pose([[0, 'proud'], [W('mégaphone'), 'shout']], t).setFace(t < W('mégaphone') ? 'smug' : 'shout', t);
    K.cuts([[0, (l, k) => K.move(maxJMeg, 'close', 'medium', k, { dy: -1.2, side: .3 }, { side: .1 })],
            [W('martens') - S.look[0] - .2, (l, k) => K.crane(maxJMeg, 'full', 'high', 'low', k, { side: -.3 })],
            [W('mégaphone') - S.look[0], (l, k) => K.push(maxJMeg, 'medium', k, { h: 'low', side: -.2 })]], lt, dur('look'));
    const c = t > W('carte') ? K.card(t, W('carte'), 490, 640, 560, ['MÉGAPHONE', 'CB DE MAMAN 💳']) : t > W('martens') ? K.card(t, W('martens'), 490, 640, 520, ['DOC MARTENS', 'NEUVES 👢']) : K.card(t, W('sweat'), 490, 640, 520, ['SWEAT DU CHE', '80 €']);
    return age(t, S.look[0], 19) + c; },
  // la fac de socio bloquée
  fac(t, lt) { hideAll(); put(maxJMeg, FAC.steps, 0, 0, 0); maxJMeg.pose([[0, 'shout'], [W('libérer'), 'armsUp']], t).setFace('shout', t);
    etudiants.forEach((e, i) => e.hide(false).pose(t > W('libérer') ? 'cheer' : 'clap', t + i * .4).setFace('happy', t));
    K.cuts([[0, (l, k) => K.drone(V(2018, 14, 22), V(2010, 10, 18), V(2000, 2, -4), V(2000, 3, -5), k, 56)],
            [W('libérer') - S.fac[0], (l, k) => K.move(maxJMeg, 'medium', 'close', k, { h: 'low', side: .3 }, { h: 'low', side: .15 })]], lt, dur('fac'));
    return age(t, S.fac[0], 19) + K.stamp(t, W("l'amphi"), 490, 1060, 'AMPHI BLOQUÉ', RED, -5, 70) + K.card(t, W('libérer'), 490, 640, 580, ['LIBÉRER LE', 'PROLÉTARIAT ✊']); },
  // le prolétariat, c'est le gardien
  gardien(t, lt) { hideAll(); put(gardien, FAC.square, -1, 0, .3); gardien.pose('walk', t).setFace('sleepy', t);
    K.cuts([[0, (l, k) => K.push(gardien, 'medium', k, { side: .4 })],
            [W('nettoie') - S.gardien[0], (l, k) => K.move(gardien, 'full', 'wide', k, { h: 'high', fov: 58, side: -.3 }, { h: 'high', fov: 60, side: -.4 })]], lt, dur('gardien'));
    return K.stamp(t, W('gardien'), 490, 640, 'LE PROLÉTARIAT 🧹', INK, -4, 60) + K.card(t, W('minuit'), 490, 1050, 420, ['⏰ 00:00']); },
  // repas de famille : « sale bourgeois »
  repas(t, lt) { hideAll(); put(papa, HOME.table[1]); put(maman, HOME.table[0]); papa.pose('sit', t); maman.pose('sit', t);
    put(maxJ, HOME.table[2], 3.5, 4.5, -.9); maxJ.pose([[0, 'talk'], [W('bourgeois'), 'shout']], t).setFace(t < W('bourgeois') ? 'talk' : 'angry', t);
    papa.setFace(t < W('bourgeois') ? 'smile' : 'flat', t); maman.setFace(t < W('bourgeois') ? 'smile' : 'shock', t);
    K.cuts([[0, (l, k) => K.drone(V(1014, 9, 9), V(1012, 7.5, 7), V(1006, 2.5, -4), V(1006.5, 2.6, -4), k, 58)],
            [W('bourgeois') - S.repas[0] - .3, (l, k) => K.move(maxJ, 'medium', 'close', k, { h: 'low', side: .4 }, { h: 'low', side: .2 })]], lt, dur('repas'));
    return age(t, S.repas[0], 21) + K.stamp(t, W('famille'), 490, 640, 'REPAS DE FAMILLE', INK, 3, 52) + K.stamp(t, W('bourgeois'), 490, 1060, '« SALE BOURGEOIS ! »', RED, -5, 60); },
  // papa vire le loyer : merci camarade
  loyer(t, lt) { hideAll(); put(papaPh, HOME.sofa[1]); papaPh.pose('sit', t).setFace('smile', t); put(maxJ, HOME.sofa[2], 2.8, 3, -.5); maxJ.pose(t > W('camarade') ? 'cheer' : 'idle', t).setFace(t > W('camarade') ? 'laugh' : 'wow', t);
    K.cuts([[0, (l, k) => K.push(papaPh, 'close', k, { side: -.2 })],
            [W('camarade') - S.loyer[0] - .6, (l, k) => K.move(maxJ, 'medium', 'full', k, { side: .2, h: 'low' }, { side: .3 })]], lt, dur('loyer'));
    const n = Math.round(800 * eo(seg(t, W('huit'), W('huit') + 1)));
    return age(t, S.loyer[0], 21) + K.card(t, W('loyer'), 490, 640, 520, ['VIREMENT DE PAPA', n + ' € 💸']) + K.stamp(t, W('camarade'), 490, 1060, '« MERCI, CAMARADE »', RED, -5, 58); },
  // 25 ans : l'épicerie coopérative et solidaire
  epicerie(t, lt) { hideAll(); put(maxE, EPI.front, 0, -3, 0); maxE.pose([[0, 'present'], [W('croissant'), 'proud'], [W('stagiaires'), 'point']], t).setFace(t < W('stagiaires') ? 'happy' : 'smug', t);
    stagiaires.forEach((s, i) => s.hide(false).pose(t > W('compliments') ? 'shrug' : 'idle', t + i).setFace(t > W('compliments') ? 'sad' : 'flat', t));
    K.cuts([[0, (l, k) => K.move(maxE, 'full', 'medium', k, { side: .3, h: 'low' }, { side: .1 })],
            [W('croissant') - S.epicerie[0], (l, k) => K.push(maxE, 'medium', k, { side: -.25, h: 'low' })],
            [W('salariés') - S.epicerie[0], (l, k) => K.move({ x: 1200, z: 2.5, ry: 0 }, 'full', 'wide', k, { h: 'eye' }, { h: 'high', fov: 58 })]], lt, dur('epicerie'));
    const c = t > W('stagiaires') ? K.card(t, W('stagiaires'), 490, 640, 520, ['SALARIÉS :', '3 STAGIAIRES']) : t > W('croissant') ? K.card(t, W('croissant'), 490, 640, 460, ['🥐 CROISSANT', '6,00 €']) : K.card(t, W('épicerie'), 490, 640, 600, ['ÉPICERIE COOP', '& SOLIDAIRE ✊']);
    return age(t, S.epicerie[0], 25) + c + K.stamp(t, W('compliments'), 490, 1060, 'PAYÉS EN COMPLIMENTS', RED, -4, 52); },
  // 30 ans : l'appli de livraison
  appli(t, lt) { hideAll(); put(maxB, APP.front, 0, -2, 0); maxB.pose([[0, 'present'], [W('livraison') + .2, 'proud']], t).setFace('smug', t);
    K.cuts([[0, (l, k) => K.move(maxB, 'full', 'medium', k, { h: 'low', side: .3 }, { h: 'low', side: .1 })]], lt, dur('appli'));
    return age(t, S.appli[0], 30) + K.card(t, W('appli'), 490, 640, 560, ['MAXI LIVRAISON 📱', 'CEO : MAXIME']); },
  // les livreurs sous la pluie
  pluie(t, lt) { hideAll(); livreurs.forEach((l, i) => l.hide(false).at(-8 + lt * 2.2 + i * 2.6, 8 + (i % 2) * .8, Math.PI / 2).pose('run', t + i * .2).setFace('sad', t));
    K.cuts([[0, (l, k) => K.drone(V(-6, 7, 23), V(2, 7, 23), V(-4, 1.5, 8), V(3, 1.5, 8), k, 55)]], lt, dur('pluie'));
    return age(t, S.pluie[0], 30) + K.card(t, W('trois'), 490, 640, 520, ['🌧 3 € LA COURSE']); },
  // un livreur ose dire « syndicat »
  syndicat(t, lt) { hideAll(); put(syndic, { x: 2, z: 8.4 }, 0, 0, 0); syndic.pose([[0, 'idle'], [W('syndicat') - .3, 'armsUp']], t).setFace(t < W('syndicat') ? 'worried' : 'shout', t);
    K.cuts([[0, (l, k) => K.move(syndic, 'full', 'medium', k, { side: .3 }, { side: .15, h: 'low' })]], lt, dur('syndicat'));
    return age(t, S.syndicat[0], 34) + K.stamp(t, W('syndicat'), 490, 1060, 'SYNDICAT ?!', RED, -6, 80); },
  // le même mégaphone
  megaphone(t, lt) { hideAll(); put(maxBMeg, { x: 0, z: 3.4 }, 0, 0, .8); maxBMeg.pose([[0, 'idle'], [W('mégaphone', 1), 'shout']], t).setFace(t < W('mégaphone', 1) ? 'smug' : 'shout', t); showLivreurs(t, t > W('boulot') ? 'scared' : 'idle');
    K.cuts([[0, (l, k) => K.push(maxBMeg, 'medium', k, { side: .4 })],
            [W('même') - S.megaphone[0], (l, k) => K.move(maxBMeg, 'medium', 'close', k, { h: 'low', side: -.3 }, { h: 'low', side: -.2 })],
            [W('boulot') - S.megaphone[0] - .2, (l, k) => K.push(maxBMeg, 'medium', k, { side: -.5 })]], lt, dur('megaphone'));
    const st = t > W('boulot') ? K.card(t, W('boulot'), 490, 640, 640, ['« AU BOULOT, BANDE', 'DE FEIGNASSES ! »']) : K.stamp(t, W('même'), 490, 640, 'LE MÊME 📣', RED, -5, 70);
    return age(t, S.megaphone[0], 34) + st; },
  // fin : on revient sur l'image du début, la caméra s'envole
  fin(t, lt) { hideAll(); put(maxBMeg, { x: 0, z: 3.4 }, 0, 0, .8); maxBMeg.pose('shout', t).setFace('shout', t); showLivreurs(t, 'scared');
    K.drone(V(-4, 4, 14), V(-14, 22, 38), V(1, 2.5, 5), V(2, 1.5, 5), lt / dur('fin'), 52);
    return K.stamp(t, W('abonne-toi'), 490, 720, 'ABONNE-TOI', RED, -6, 90) + K.card(t, W('demain'), 490, 1000, 620, ['DEMAIN : UN AUTRE CLICHÉ']); },
};
const MOODS = { hook: 'dusk', question: 'golden', canape: 'interior', look: 'interior', fac: 'day', gardien: 'night', repas: 'interior', loyer: 'interior', epicerie: 'interior', appli: 'interior', pluie: 'night', syndicat: 'night', megaphone: 'dusk', fin: 'dusk' };
K.start({ scenes: SC, moods: MOODS });
