// Épisode 6 : « Christian, 67 ans : réac de comptoir ultime ?! » (réac)
import * as K from './toon3d.js';
const { P, V } = K;
window.EP_TITLE = ['CHRISTIAN, 67 ANS :', 'RÉAC DE COMPTOIR ULTIME ?!'];
const S = {}; TL.scenes.forEach(([n, a, b]) => S[n] = [a, b]);
const nk = k => k.toLowerCase().replace(/[.,?!…:»«]+$/, '');
const W = (k, i = 0) => { const a = TL.words[nk(k)] || [0]; return a[Math.min(i, a.length - 1)]; };
const dur = n => S[n][1] - S[n][0];

// ---- décors ----
K.sky('day');
const STREET = K.SETS.street(0);
const HOME = K.SETS.home(1000, { tvText: ['CHAÎNE', 'NOSTALGIE'] });
// sapin de Noël dans le salon (ouverture + chute)
K.F.tree(1000 + .6, -8, .9, { kind: 'pine', seed: 3 });
[[0xc4281c, 1.6, 3.4, 1.2], [0xf5cd30, -1.4, 3.6, 1.1], [0x2457c9, .9, 4.9, 1.2], [0xc4281c, -.8, 5.4, 1.0], [0xf5cd30, .2, 6.4, .8], [0x2457c9, -1.8, 2.6, 1.4], [0xf5cd30, 1.9, 2.3, 1.2]]
  .forEach(([c, dx, y, dz]) => K.ball(K.STATIC, .28, K.mat(c, { e: c, ei: .4 }), 1000.6 + dx, y, -8 + dz));
K.ball(K.STATIC, .45, K.mat(0xf5cd30, { e: 0xf5cd30, ei: 1.2 }), 1000.6, 7.6, -8);
for (const [dx, c] of [[-1.6, 0xc4281c], [1.4, 0x2fa84a], [0, 0x2457c9]]) K.box(K.STATIC, 1.1, .9, 1.1, c, 1000.6 + dx, .45, -5.8, { round: .05 });
// la mobylette trafiquée (20 ans)
const MX = 30, MZ = 3.6;
for (const dx of [-1.3, 1.3]) K.cyl(K.STATIC, .75, .75, .3, 0x1a1a1a, MX + dx, .75, MZ, { rz: Math.PI / 2, seg: 16 });
K.box(K.STATIC, 2.2, .7, .5, 0x2457c9, MX, 1.3, MZ, { round: .15 }); K.box(K.STATIC, 1.1, .25, .6, 0x222222, MX - .4, 1.8, MZ, { round: .1 });
K.box(K.STATIC, .15, 1.6, .15, 0x888888, MX + 1.2, 1.6, MZ); K.box(K.STATIC, .15, .15, 1.4, 0x888888, MX + 1.2, 2.4, MZ);
K.cyl(K.STATIC, .14, .14, 1.4, 0x999999, MX - 1.1, .9, MZ + .35, { rz: Math.PI / 2 - .2, seg: 8 });
// le PMU (55 ans)
const BX = 60;
K.box(K.STATIC, 12, 6, .4, 0x7a2a22, BX, 3, .2);
const enseigne = K.panel(K.scene, 7, 1.4, ['BAR TABAC PMU'], { bg: '#1d6b3a', fg: '#ffffff' }); enseigne.position.set(BX, 5.2, .45);
K.box(K.STATIC, 3.2, 2.6, .1, K.GLASS, BX - 3, 2.4, .45); K.box(K.STATIC, 3.2, 2.6, .1, K.GLASS, BX + 3, 2.4, .45);
K.F.table(BX + 1.6, 2.2, 2, 2, 2.4, 0xd9d9d9); K.F.chair(BX - .6, 2.4, Math.PI / 2, 0x8a8a8a); K.F.chair(BX + 3.6, 2.4, -Math.PI / 2, 0x8a8a8a);
K.cyl(K.STATIC, .18, .14, .5, 0xf2c230, BX + 1.4, 2.9, 2.0, { seg: 10 });

// ---- personnages ----
const kid = { outfit: 'hoodie', shirt: P.red, pants: P.navy, shoes: P.white, hat: 'hair', hairColor: 0x6a4a2a, scale: .62, face: 'smile' };
const c20 = K.avatar({ outfit: 'jacket', shirt: P.black, pants: 0x3a5a8a, shoes: P.brown, hat: 'long', hairColor: 0x5a3a22, glasses: 'sun', face: 'cool', prop: 'cig' });
const pere = K.avatar({ outfit: 'polo', shirt: 0x6a6a5a, pants: P.brown, hat: 'bald', beard: 0x9a9a9a, glasses: true, face: 'shout' });
const c38 = K.avatar({ outfit: 'polo', shirt: P.teal, pants: 0x6c6457, shoes: P.brown, hat: 'hair', hairColor: 0x5a3a22, beard: 0x5a3a22, face: 'angry' });
const fils = K.avatar({ ...kid, prop: 'phone' });
const c55 = K.avatar({ outfit: 'polo', shirt: P.white, pants: P.navy, shoes: P.brown, hat: 'cap', hatColor: 0x1d6b3a, beard: 0x8a8a8a, prop: 'glass', face: 'smug' });
const pote = K.avatar({ outfit: 'jacket', shirt: 0x6a4a3a, pants: P.black, hat: 'beanie', hatColor: P.red, beard: 0x5a3a22, prop: 'glass', face: 'laugh' });
const old = { outfit: 'jacket', shirt: 0x8a6a4a, pants: 0x5a5a5a, shoes: P.brown, hat: 'hair', hairColor: 0xd0d0d0, beard: 0xd0d0d0, glasses: true };
const c62 = K.avatar({ ...old, face: 'angry' });
const c62tab = K.avatar({ ...old, prop: 'phone', face: 'smug' });
const c67 = K.avatar({ ...old, shirt: P.red, print: 'NOËL', printColor: '#ffffff', prop: 'phone', face: 'smug' });
const fille = K.avatar({ outfit: 'dress', shirt: 0x8e6cc2, hat: 'long', hairColor: 0x5a3a22, prop: 'laptop', face: 'smile' });
const fille2 = K.avatar({ outfit: 'dress', shirt: 0x8e6cc2, hat: 'long', hairColor: 0x5a3a22, prop: 'glass', face: 'smile' });
const petit = K.avatar({ ...kid, shirt: P.green, prop: 'sign:POUR|PAPY ❤', face: 'happy' });
const potes = K.crowd(2, BX + 5, 3.2, 2, { hats: ['cap', 'beanie'], seed: 11 });
const all = [c20, pere, c38, fils, c55, pote, c62, c62tab, c67, fille, fille2, petit, ...potes];
const hideAll = () => all.forEach(a => a.hide(true));
const put = (av, s, dx = 0, dz = 0, ry) => { av.sitY = -.1; return av.hide(false).at(s.x + dx, s.z + dz, ry ?? s.ry ?? 0); };
const SOFA = HOME.sofa;
const sitPhone = (av, t) => { av.pose('phone', t); av.legL.rotation.x = av.legR.rotation.x = -1.55; av.root.position.y = av.sitY ?? -.1; av.root.position.z = .2; return av; };
// le salon de Noël : papy scotché à son téléphone, le petit-fils à côté avec son dessin
const noelSet = (t, kidFace = 'happy') => {
  put(c67, SOFA[1]); sitPhone(c67, t);
  put(petit, SOFA[1], 2.6, 2.4, -.55); put(fille2, HOME.table[1], 0, 0); fille2.pose('sit', t).setFace('worried', t);
  petit.setFace(kidFace, t);
};

const SC = {
  // ouverture à froid : Noël, il ignore son petit-fils pour poster sur les écrans
  hook(t, lt) { hideAll(); noelSet(t, t < W('poster') ? 'happy' : 'sad');
    c67.setFace(t < W('écrans') ? 'smug' : 'angry', t);
    petit.pose(t < W('poster') ? 'present' : 'idle', t);
    K.cuts([[0, (l, k) => K.move(c67, 'medium', 'medium', k, { h: 'low', side: .35, dist: 1.25 }, { h: 'low', side: .25, dist: 1.05 })],
            [W('petit-fils') - .1, (l, k) => K.push(petit, 'medium', k, { h: 'eye', side: .35 })],
            [W('poster') - .1, (l, k) => K.push(c67, 'close', k, { h: 'low', side: .2 })],
            [W('écrans') - .1, (l, k) => K.orbit(c67, 'medium', .7, .3, k, { h: 'high' })]], lt, dur('hook'));
    return K.stamp(t, W('réac'), 300, 620, 'RÉAC', K.C.red, -7, 80)
      + (t < W('poster') ? K.card(t, W('petit-fils'), 640, 1000, 420, ['🎨 « REGARDE', 'PAPY ! »']) : K.card(t, W('poster'), 490, 980, 640, ['📱 « LES JEUNES SONT', 'ACCROS AUX ÉCRANS »'])); },
  question(t, lt) { hideAll(); noelSet(t, 'cry'); petit.pose('cry', t);
    K.drone(V(1006, 8.5, 8), V(1003, 6, 4), V(999, 2, -7), V(999.5, 2.5, -7.5), lt / dur('question'), 56);
    return K.card(t, S.question[0], 490, 640, 640, ['COMMENT ON', 'EN ARRIVE LÀ ?']) + K.stamp(t, W('retour'), 490, 1040, '⏪ RETOUR À 20 ANS', K.C.red, -5, 62); },
  // 20 ans : cheveux longs, mobylette, le père qui hurle
  jeune(t, lt) { hideAll(); put(c20, { x: MX - 2.6, z: MZ + .4, ry: .3 }); put(pere, { x: MX + 3.2, z: 1.4, ry: -.5 });
    c20.pose(t < W('jure') ? 'lean' : 'cross', t).setFace(t < W('jure') ? 'cool' : 'angry', t);
    pere.pose(t < W('hurle') ? 'idle' : 'shout', t).setFace(t < W('hurle') ? 'flat' : 'shout', t);
    K.cuts([[0, (l, k) => K.drone(V(MX + 14, 11, 20), V(MX + 6, 5, 13), V(MX, 1.5, MZ), V(MX - 1, 2.2, MZ), k, 52)],
            [W('mobylette') - S.jeune[0] - .1, (l, k) => K.move(c20, 'full', 'medium', k, { h: 'low', side: -.3 }, { h: 'low', side: -.2 })],
            [W('père') - S.jeune[0] - .1, (l, k) => K.push(pere, 'close', k, { h: 'low', side: .2 })],
            [W('jure') - S.jeune[0] - .1, (l, k) => K.push(c20, 'close', k, { h: 'low', side: -.15 })]], lt, dur('jeune'));
    return K.ageBadge(t, S.jeune[0], 800, 600, 20)
      + (t < W('père') - .1 ? K.card(t, W('mobylette'), 400, 1000, 500, ['🛵 MOBYLETTE', 'TRAFIQUÉE']) : '')
      + (t < W('jure') - .1 ? K.stamp(t, W('mieux'), 490, 1020, "« C'ÉTAIT MIEUX AVANT ! »", K.C.red, -5, 52) : K.stamp(t, W('jamais'), 490, 1020, 'JAMAIS COMME LUI !', K.C.panel, 5, 60))
      + K.stamp(t, W('beauf'), 700, 760, 'BEAUF', K.C.red, 8, 80); },
  // 38 ans : il débranche la console de son fils
  console(t, lt) { hideAll(); put(fils, SOFA[0]); (t < W('débranche') ? sitPhone(fils, t) : fils.pose('sit', t)); fils.setFace(t < W('débranche') ? 'happy' : 'cry', t);
    put(c38, SOFA[2], 1.5, 4.2, -.6); c38.pose([[0, 'idle'], [W('débranche') - .1, 'angry'], [W('temps') - .1, 'shout'], [W('lui') - .1, 'cross']], t).setFace(t < W('lui') ? 'shout' : 'smug', t);
    const tele = t > W('regardait') - .1;
    K.cuts([[0, (l, k) => K.drone(V(1004, 8, 7), V(1001, 7, 4), V(993, 2.5, -7), V(993.5, 2.6, -7), k, 58)],
            [W('débranche') - S.console[0] - .1, (l, k) => K.push(c38, 'medium', k, { h: 'low', side: .3 })],
            [W('temps') - S.console[0] - .1, (l, k) => K.move(c38, 'medium', 'close', k, { h: 'low', side: .2 }, { h: 'low', side: .05 })],
            [W('lui') - S.console[0] - .1, (l, k) => K.orbit(fils, 'medium', -.4, .2, k, { h: 'eye' })],
            [W('regardait') - S.console[0] - .1, (l, k) => K.push(c38, 'close', k, { h: 'high', side: -.2 })]], lt, dur('console'));
    return K.ageBadge(t, S.console[0], 800, 600, 38)
      + (t < W('débranche') - .1 ? K.card(t, W('console'), 400, 1000, 460, ['🎮 CONSOLE', '1 H / JOUR']) : '')
      + (t >= W('débranche') && t < W('temps') - .1 ? K.stamp(t, W('débranche'), 490, 1030, 'DÉBRANCHÉ !', K.C.red, -6, 76) : '')
      + (t >= W('temps') && !tele ? K.card(t, W('bâton'), 490, 980, 520, ['🪵 « JOUEZ AVEC', 'UN BÂTON ! »']) : '')
      + (tele ? K.card(t, W('regardait'), 490, 980, 560, ['📺 LUI EN 1970 :', '8 H DE TÉLÉ / JOUR']) : ''); },
  // 55 ans : au PMU, les jeunes ne veulent plus bosser
  pmu(t, lt) { hideAll(); put(c55, { x: BX - .4, z: 3.2, ry: .5 }); put(pote, { x: BX + 3.4, z: 3.4, ry: -.6 });
    c55.pose([[0, 'drink'], [W('jeunes', 1) - .1, 'shout'], [W('préretraite') - .1, 'drink']], t).setFace(t < W('jeunes', 1) ? 'smug' : t < W('préretraite') ? 'shout' : 'smug', t);
    pote.pose(t < W('préretraite') ? 'drink' : 'laugh', t).setFace(t < W('préretraite') ? 'smile' : 'laugh', t);
    potes.forEach((v, i) => v.hide(false).pose(i ? 'drink' : 'laugh', t + i * .4).setFace('smile', t));
    K.cuts([[0, (l, k) => K.drone(V(BX - 12, 10, 18), V(BX - 5, 6, 13), V(BX, 2, 2), V(BX + 1, 2.4, 2.5), k, 54)],
            [W('pastis') - S.pmu[0] - .2, (l, k) => K.push(c55, 'medium', k, { h: 'low', side: .3 })],
            [W('jeunes', 1) - S.pmu[0] - .1, (l, k) => K.move(c55, 'medium', 'close', k, { h: 'low', side: .2 }, { h: 'low', side: .05 })],
            [W('préretraite') - S.pmu[0] - .3, (l, k) => K.orbit(pote, 'medium', .5, .1, k, { h: 'low' })]], lt, dur('pmu'));
    return K.ageBadge(t, S.pmu[0], 800, 600, 55)
      + (t < W('jeunes', 1) - .1 ? K.card(t, W('pastis'), 400, 1000, 420, ['🥃 PASTIS', '2,40 €']) : '')
      + (t >= W('jeunes', 1) && t < W('préretraite') - .3 ? K.stamp(t, W('bosser'), 490, 1030, 'FEIGNASSES !', K.C.red, -6, 76) : '')
      + K.stamp(t, W('préretraite'), 490, 1030, 'PRÉRETRAITÉ DEPUIS MARDI', K.C.red, 5, 50); },
  // 62 ans : sa fille lui offre une tablette
  tablette(t, lt) { hideAll(); c62.hide(false).at(992.5, 1, .45); fille.hide(false).at(996.5, 2.2, -.9);
    fille.pose('present', t).setFace(t < W('jamais', 1) ? 'happy' : 'sad', t);
    c62.pose([[0, 'idle'], [W('jamais', 1) - .1, 'cross'], [W('débile') - .1, 'angry']], t).setFace(t < W('jamais', 1) ? 'flat' : 'angry', t);
    K.cuts([[0, (l, k) => K.move(fille, 'medium', 'medium', k, { h: 'low', side: -.4, yaw: .3 }, { h: 'low', side: -.3, yaw: .2 })],
            [W('jamais', 1) - S.tablette[0] - .1, (l, k) => K.push(c62, 'close', k, { h: 'low', side: .2 })],
            [W('débile') - S.tablette[0] - .2, (l, k) => K.orbit(c62, 'medium', -.3, .2, k, { h: 'eye' })]], lt, dur('tablette'));
    return K.ageBadge(t, S.tablette[0], 800, 600, 62)
      + (t < W('jamais', 1) - .1 ? K.card(t, W('tablette'), 400, 1000, 420, ['🎁 TABLETTE', 'CADEAU']) : '')
      + K.stamp(t, W('jamais', 1), 300, 760, 'JAMAIS !', K.C.red, -8, 76) + K.stamp(t, W('débile'), 600, 1030, 'ÇA REND DÉBILE', K.C.red, 6, 64); },
  // 3 semaines après : 9 h par jour sur Facebook
  facebook(t, lt) { hideAll(); put(c62tab, SOFA[1]); sitPhone(c62tab, t).setFace(t < W('chats') ? 'smug' : 'laugh', t);
    K.cuts([[0, (l, k) => K.move(c62tab, 'full', 'medium', k, { h: 'high', side: .3 }, { h: 'eye', side: .2 })],
            [W('chats') - S.facebook[0] - .2, (l, k) => K.push(c62tab, 'close', k, { h: 'low', side: -.25 })],
            [W('partage') - S.facebook[0] - .1, (l, k) => K.orbit(c62tab, 'medium', .6, .1, k, { h: 'high' })]], lt, dur('facebook'));
    return K.stamp(t, S.facebook[0], 490, 620, '3 SEMAINES APRÈS', K.C.panel, -4, 56)
      + (t < W('chats') - .2 ? K.stamp(t, W('facebook'), 490, 1030, '9 H / JOUR SUR FACEBOOK', K.C.red, -5, 50) : '')
      + (t >= W('chats') - .2 && t < W('partage') - .1 ? K.card(t, W('chats'), 490, 960, 480, ['🐱 « BON MARDI ! »', '× 400']) : '')
      + K.card(t, W('partage'), 490, 980, 600, ['« PARTAGE SI TU', 'REGRETTES LA', "FRANCE D'AVANT »"]); },
  // 67 ans, Noël : la chute
  noel(t, lt) { hideAll(); noelSet(t, t < W('yeux') ? 'happy' : t < W('soupire') ? 'sad' : 'flat');
    c67.setFace(t < W('papy') ? 'laugh' : 'shock', t);
    petit.pose(t < W('soupire') ? 'present' : t < W('chut', 6) ? 'cross' : 'shrug', t);
    K.cuts([[0, (l, k) => K.drone(V(1007, 9, 8), V(1004, 7, 5), V(999.5, 2, -7), V(1000, 2.5, -7.5), k, 58)],
            [W('dessin') - S.noel[0] - .2, (l, k) => K.push(petit, 'medium', k, { h: 'eye', side: .35 })],
            [W('yeux') - S.noel[0] - .5, (l, k) => K.push(c67, 'close', k, { h: 'low', side: .2 })],
            [W('papy') - S.noel[0] - .2, (l, k) => K.move(petit, 'medium', 'close', k, { h: 'eye', side: .3 }, { h: 'eye', side: .15 })]], lt, dur('noel'));
    return K.ageBadge(t, S.noel[0], 800, 600, 67)
      + (t < W('yeux') - .5 ? K.card(t, W('dessin'), 400, 1000, 460, ['🎨 DESSIN', 'POUR PAPY ❤']) : '')
      + (t >= W('yeux') - .5 && t < W('papy') - .2 ? K.stamp(t, W('yeux'), 490, 1030, '📱 SCOTCHÉ', K.C.red, -6, 72) : '')
      + K.card(t, W('papy'), 490, 980, 600, ['« PAPY, DE MON TEMPS,', 'ON SE PARLAIT. »']); },
  chute(t, lt) { hideAll(); noelSet(t, 'flat'); petit.pose('cross', t); c67.setFace(t < W('tocard') ? 'shock' : 'cry', t);
    K.cuts([[0, (l, k) => K.move(c67, 'medium', 'close', k, { h: 'low', side: .3 }, { h: 'low', side: .1 })],
            [W('tocard') - S.chute[0] - .1, (l, k) => K.push(c67, 'close', k, { h: 'low', side: -.1 })]], lt, dur('chute'));
    return K.card(t, S.chute[0], 490, 700, 560, ["« C'ÉTAIT", 'MIEUX AVANT »']) + K.stamp(t, W('tocard'), 490, 1040, 'TOCARD', K.C.red, 7, 100); },
  fin(t, lt) { hideAll(); noelSet(t, 'flat'); petit.pose('cross', t); c67.setFace('cry', t);
    K.drone(V(1003, 5, 2), V(1008, 8.5, 9), V(999.5, 2.2, -7.5), V(999.5, 2, -7.5), lt / dur('fin'), 56);
    return K.stamp(t, W('abonne-toi'), 490, 720, 'ABONNE-TOI', K.C.red, -6, 90) + K.card(t, W('demain'), 490, 1000, 560, ['DEMAIN :', 'UN AUTRE CLICHÉ']); },
};
const MOODS = { hook: 'interior', question: 'interior', jeune: 'golden', console: 'interior', pmu: 'day', tablette: 'interior', facebook: 'interior', noel: 'interior', chute: 'interior', fin: 'interior' };
K.start({ scenes: SC, moods: MOODS });
