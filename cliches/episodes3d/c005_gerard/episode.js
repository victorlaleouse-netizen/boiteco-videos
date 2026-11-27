// Épisode 5 : « Gérard, 58 ans : patriote made in China ultime ?! » (extrême droite / souverainiste)
import * as K from './toon3d.js';
const { P, V, seg, eo } = K;
window.EP_TITLE = ['GÉRARD, 58 ANS :', 'PATRIOTE MADE IN CHINA ULTIME ?!'];
const S = {}; TL.scenes.forEach(([n, a, b]) => S[n] = [a, b]);
const nk = k => k.toLowerCase().replace(/[.,?!…:»«]+$/, '');
const W = (k, i = 0) => { const a = TL.words[nk(k)] || [0]; return a[Math.min(i, a.length - 1)]; };
const dur = n => S[n][1] - S[n][0];
const TRI = [0x2457c9, 0xffffff, 0xc4281c];

// ---- décors ----
K.sky('day');
const STREET = K.SETS.street(0, { party: 15 });
const HOME = K.SETS.home(1000, { tvText: ['INFO EN', 'CONTINU'] });
K.F.bunting(V(9, 6.2, -2.8), V(21, 6.2, -2.8), { colors: TRI });
// barbecue dans le jardin de la fête
K.box(K.STATIC, 2.6, 1.2, 1.4, 0x222222, 10.5, 2.3, .8, { round: .1 });
for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) K.box(K.STATIC, .12, 1.8, .12, 0x333333, 10.5 + a * 1.1, .9, .8 + b * .5);
for (let i = 0; i < 4; i++) K.cyl(K.STATIC, .14, .14, 1.6, 0x9a4a2a, 10.5, 3.0, .4 + i * .28, { rz: Math.PI / 2, seg: 8 });
// mur d'affiches « Produisons français » (25 ans)
K.box(K.STATIC, 9, 3.6, .3, 0xb9b2a6, 30, 1.8, .6);
[-3, 0, 3].forEach((dx, i) => { const p = K.panel(K.scene, 2.6, 3, ['PRODUISONS', 'FRANÇAIS'], { bg: i === 1 ? '#ffffff' : '#2457C9', fg: i === 1 ? '#C4281C' : '#ffffff' }); p.position.set(30 + dx, 1.9, .78); p.rotation.z = (i - 1) * .05; });
// le carton saisi par la douane (ouverture + chute)
const carton = K.box(K.scene, 2.2, 1.6, 1.6, 0xc69a5a, 2.6, .8, 3.6, { round: .05 }); carton.rotation.y = -.3;
const lab = K.panel(carton, 2, 1.1, ['MADE IN', 'CHINA'], { bg: '#ffffff', fg: '#C4281C' }); lab.position.set(0, 0, .81);

// ---- personnages ----
const mid = { outfit: 'polo', shirt: P.navy, pants: 0x6c6457, shoes: P.brown, hat: 'hair', hairColor: 0x5a3a22, beard: 0x5a3a22, face: 'smug' };
const g25 = K.avatar({ ...mid, beard: undefined });
const g32 = K.avatar({ ...mid, outfit: 'tee', shirt: P.blue, print: 'BBQ', printColor: '#ffffff' });
const g45 = K.avatar({ ...mid, prop: 'glass' });
const g50 = K.avatar({ ...mid, hairColor: 0x8a8a8a, beard: 0x8a8a8a, prop: 'phone', glasses: true });
const old = { outfit: 'tee', shirt: P.white, print: ["FIER D'ÊTRE", 'FRANÇAIS'], printColor: '#2457C9', pants: P.navy, shoes: P.white, hat: 'cap', hatColor: P.blue, beard: 0xb0b0b0, face: 'shock' };
const g58 = K.avatar({ ...old });
const g58Meg = K.avatar({ ...old, prop: 'megaphone', face: 'happy' });
const douanier = K.avatar({ outfit: 'jacket', shirt: 0x1d2c4a, pants: 0x1d2c4a, hat: 'cap', hatColor: 0x1d2c4a, print: 'DOUANE', printColor: '#F5CD30', skin: P.skin2, face: 'flat' });
const gendre = K.avatar({ outfit: 'jacket', shirt: 0x7a8a3a, pants: P.black, hat: 'hair', hairColor: 0x222222, glasses: 'round', prop: 'glass', face: 'smile' });
const fille = K.avatar({ outfit: 'dress', shirt: 0xd96aa0, hat: 'long', hairColor: 0x5a3a22, face: 'smile' });
const voisins = K.crowd(5, 17, -1, 2.3, { hats: ['cap', 'party', 'hair', 'beanie', 'cap'], seed: 7 });
const all = [g25, g32, g45, g50, g58, g58Meg, douanier, gendre, fille, ...voisins];
const hideAll = () => { all.forEach(a => a.hide(true)); carton.visible = false; };
const put = (av, s, dx = 0, dz = 0, ry) => { av.sitY = -.1; return av.hide(false).at(s.x + dx, s.z + dz, ry ?? s.ry ?? 0); };
const B = STREET.front;
const douaneSet = (t, face) => { put(g58, B, -1.2, 0, .25); put(douanier, B, 2.8, -1.4, -.45); carton.visible = true; douanier.pose('idle', t).setFace('flat', t); };

const SC = {
  // ouverture à froid : la douane saisit ses drapeaux « made in China »
  hook(t, lt) { hideAll(); douaneSet(t); g58.pose([[0, 'shout'], [W('douane') - .2, 'angry'], [W('chine') - .2, 'facepalm']], t).setFace(t < W('douane') ? 'shout' : t < W('chine') ? 'angry' : 'shock', t);
    K.cuts([[0, (l, k) => K.move({ x: .4, z: 3.2, ry: 0 }, 'medium', 'medium', k, { h: 'low', side: .05, dist: 1.1 }, { h: 'low', side: 0, dist: .95 })],
            [W('beauf') - .1, (l, k) => K.push(g58, 'close', k, { h: 'low', side: .25 })],
            [W('douane') - .1, (l, k) => K.orbit(douanier, 'medium', .6, .2, k, { h: 'low' })],
            [W('chine') - .2, (l, k) => K.move(g58, 'medium', 'close', k, { h: 'low', side: -.2 }, { h: 'low', side: -.05 })]], lt, dur('hook'));
    return (t < W('chine') ? K.stamp(t, -1, 490, 1040, '100 % FRANÇAIS ?', K.C.red, -6, 70) : '')
      + K.stamp(t, W('beauf'), 300, 600, 'BEAUF', K.C.red, 6, 70) + K.stamp(t, W('saisit'), 700, 820, 'SAISI', K.C.red, 8, 80) + K.stamp(t, W('chine'), 490, 1040, 'FABRIQUÉS EN CHINE', K.C.red, -5, 62); },
  question(t, lt) { hideAll(); douaneSet(t); g58.pose('cry', t).setFace('cry', t);
    K.drone(V(6, 5, 16), V(-18, 30, 46), V(0, 2, 3), V(0, 1, 0), lt / dur('question'), 52);
    return K.card(t, S.question[0], 490, 640, 640, ['COMMENT ON', 'EN ARRIVE LÀ ?']) + K.stamp(t, W('retour'), 490, 1020, '⏪ RETOUR À 25 ANS', K.C.red, -5, 62); },
  // 25 ans : les affiches
  affiches(t, lt) { hideAll(); put(g25, { x: 27.5, z: 3, ry: .25 }); g25.pose([[0, 'proud'], [W('affiches') - .1, 'present'], [W('importée') - .1, 'shrug']], t).setFace(t < W('importée') ? 'smug' : 'worried', t);
    K.cuts([[0, (l, k) => K.move({ x: 29, z: 3, ry: 0 }, 'full', 'full', k, { h: 'high', side: .1, fov: 60 }, { h: 'eye', side: .05, dist: .8 })],
            [W('colle', 1) - S.affiches[0] - .2, (l, k) => K.push(g25, 'medium', k, { h: 'low', side: .3 })],
            [W('importée') - S.affiches[0] - .1, (l, k) => K.push(g25, 'close', k, { h: 'low', side: -.1 })]], lt, dur('affiches'));
    return K.ageBadge(t, S.affiches[0], 800, 600, 25) + (t < W('importée') - .1 ? K.card(t, W('colle', 1), 400, 640, 520, ['🧴 COLLE EN PROMO', '1,99 €']) : '') + K.stamp(t, W('importée'), 490, 1040, 'IMPORTÉE', K.C.red, 7, 90); },
  // 32 ans : barbecue avec les voisins
  bbq(t, lt) { hideAll(); put(g32, { x: 12.4, z: 1.2, ry: -.3 }); g32.pose([[0, 'talk'], [W('hurle') - .1, 'shout'], [W('saucisses') - .2, 'point'], [W('semaines') - .2, 'proud']], t).setFace(t < W('hurle') ? 'talk' : t < W('saucisses') ? 'shout' : 'smug', t);
    voisins.forEach((v, i) => v.hide(false).pose(t > W('foutue') ? (i % 2 ? 'shrug' : 'drink') : (i % 2 ? 'laugh' : 'idle'), t + i * .3).setFace(t > W('foutue') ? 'flat' : 'smile', t));
    K.cuts([[0, (l, k) => K.drone(V(28, 16, 26), V(20, 9, 15), V(13, 2, 0), V(13.5, 2.5, .3), k, 56)],
            [W('hurle') - S.bbq[0] - .1, (l, k) => K.move(g32, 'medium', 'close', k, { h: 'low', side: -.3 }, { h: 'low', side: -.1 })],
            [W('saucisses') - S.bbq[0] - .2, (l, k) => K.move({ x: 11.4, z: 1, ry: 0 }, 'medium', 'full', k, { h: 'high', side: -.2 }, { h: 'high', side: -.3 })],
            [W('semaines') - S.bbq[0] - .3, (l, k) => K.push(g32, 'medium', k, { h: 'low', side: -.2 })]], lt, dur('bbq'));
    return K.ageBadge(t, S.bbq[0], 800, 600, 32) + (t < W('saucisses') - .2 ? K.stamp(t, W('foutue'), 490, 1030, 'LA FRANCE EST FOUTUE !', K.C.red, -5, 56) : '')
      + K.card(t, W('barbecue', 1), 400, 640, 540, ['BARBECUE : 19 €', '📦 livré en 3 semaines']); },
  // 45 ans : repas de famille
  famille(t, lt) { hideAll(); put(gendre, HOME.table[1]); put(fille, HOME.table[0]); gendre.pose('sit', t); fille.pose('sit', t);
    put(g45, HOME.table[2], 2.6, 3.8, -.8); g45.pose([[0, 'talk'], [W('traite'), 'point'], [W('mondialiste') - .1, 'shout'], [W('lui') - .1, 'drink']], t).setFace(t < W('traite') ? 'talk' : t < W('lui') ? 'angry' : 'smug', t);
    gendre.setFace(t < W('mondialiste') ? 'smile' : 'shock', t); fille.setFace(t < W('mondialiste') ? 'smile' : 'worried', t);
    K.cuts([[0, (l, k) => K.drone(V(1014, 9, 9), V(1012, 7.5, 7), V(1006, 2.5, -4), V(1006.5, 2.6, -4), k, 58)],
            [W('traite') - S.famille[0], (l, k) => K.push(g45, 'medium', k, { h: 'low', side: .3 })],
            [W('vin') - S.famille[0] - .3, (l, k) => K.push(gendre, 'close', k, { side: -.2 })],
            [W('lui') - S.famille[0] - .1, (l, k) => K.move(g45, 'medium', 'close', k, { h: 'low', side: -.3 }, { h: 'low', side: -.1 })]], lt, dur('famille'));
    return K.ageBadge(t, S.famille[0], 800, 600, 45) + (t < W('vin') - .3 ? K.stamp(t, W('mondialiste'), 490, 1030, 'MONDIALISTE !', K.C.red, 6, 76) : '')
      + (t < W('lui') - .1 ? K.card(t, W('vin') - .3, 490, 980, 460, ['🍷 VIN ITALIEN']) : K.card(t, W('bière'), 490, 980, 460, ['🍺 BIÈRE BELGE'])); },
  // 50 ans : boycott sur les réseaux… depuis un téléphone importé
  reseaux(t, lt) { hideAll(); put(g50, HOME.sofa[1]); g50.pose('phone', t).setFace(t < W('téléphone') ? 'angry' : 'smug', t);
    K.cuts([[0, (l, k) => K.push(g50, 'medium', k, { side: -.25 })],
            [W('boycottez') - S.reseaux[0] - .2, (l, k) => K.orbit(g50, 'full', .5, -.1, k, { h: 'low' })],
            [W('téléphone') - S.reseaux[0] - .1, (l, k) => K.push(g50, 'close', k, { h: 'high', side: .2 })]], lt, dur('reseaux'));
    return K.ageBadge(t, S.reseaux[0], 800, 600, 50) + K.card(t, W('boycottez'), 400, 640, 540, ['« BOYCOTTEZ LES', 'PRODUITS ÉTRANGERS »']) + K.stamp(t, W('téléphone'), 490, 1040, 'TÉLÉPHONE : IMPORTÉ', K.C.red, -6, 58); },
  // 58 ans : sa fête du Made in France
  fete(t, lt) { hideAll(); put(g58Meg, { x: 15, z: .8, ry: 0 }); g58Meg.pose([[0, 'shout'], [W('drapeaux', 1), 'present'], [W('commandé') - .1, 'proud']], t).setFace(t < W('commandé') ? 'happy' : 'smug', t);
    voisins.forEach((v, i) => v.hide(false).pose(i % 2 ? 'cheer' : 'clap', t + i * .3).setFace('happy', t));
    K.cuts([[0, (l, k) => K.drone(V(-2, 14, 24), V(8, 8, 15), V(15, 2, -1), V(15, 2.5, 0), k, 56)],
            [W('drapeaux', 1) - S.fete[0] - .2, (l, k) => K.push(g58Meg, 'medium', k, { h: 'low', side: .3 })],
            [W('commandé') - S.fete[0] - .2, (l, k) => K.move(g58Meg, 'medium', 'close', k, { h: 'low', side: -.2 }, { h: 'low', side: -.05 })]], lt, dur('fete'));
    return K.ageBadge(t, S.fete[0], 800, 600, 58) + (t < W('commandé') - .2 ? K.card(t, W('drapeaux', 1), 400, 640, 520, ['🇫🇷 FÊTE DU', 'MADE IN FRANCE']) : K.card(t, W('commandé'), 400, 640, 520, ['🛒 SITE CHINOIS', '2 € PIÈCE']))
      + (t < W('commandé') - .2 ? K.stamp(t, W('fier'), 490, 1040, "FIER D'ÊTRE FRANÇAIS", K.C.panel, -5, 56) : ''); },
  // la chute : le colis bloqué en douane, contrefaçon
  douane(t, lt) { hideAll(); douaneSet(t); g58.pose(t < W('contrefaçon') ? 'scared' : t < W('bravo') ? 'cry' : 'facepalm', t).setFace(t < W('contrefaçon') ? 'shock' : 'cry', t);
    voisins.forEach((v, i) => v.hide(false).at(-4.5 + i * 1.9, -1.8 - (i % 2) * .8, .1 - i * .05).pose('laugh', t + i * .3).setFace('laugh', t));
    K.cuts([[0, (l, k) => K.move({ x: .2, z: 3.4, ry: 0 }, 'wide', 'full', k, { h: 'high', side: .3, fov: 58 }, { h: 'eye', side: .2 })],
            [W('contrefaçon') - S.douane[0] - .1, (l, k) => K.push(douanier, 'close', k, { h: 'low', side: .2 })],
            [W('bravo') - S.douane[0] - .05, (l, k) => K.move(g58, 'medium', 'close', k, { h: 'low', side: -.2 }, { h: 'low', side: -.05 })]], lt, dur('douane'));
    return (t < W('contrefaçon') ? K.stamp(t, W('colis'), 490, 640, 'BLOQUÉ EN DOUANE', K.C.panel, -4, 56) : '') + K.stamp(t, W('contrefaçon'), 490, 1040, 'CONTREFAÇON', K.C.red, 7, 92) + K.card(t, W('bravo'), 490, 820, 480, ['👏 BRAVO', 'LE PATRIOTE']); },
  fin(t, lt) { hideAll(); douaneSet(t); g58.pose('cry', t).setFace('cry', t);
    K.drone(V(4, 5, 13), V(20, 26, 44), V(0, 2.2, 3.2), V(0, 1, 0), lt / dur('fin'), 52);
    return K.stamp(t, W('abonne-toi'), 490, 720, 'ABONNE-TOI', K.C.red, -6, 90) + K.card(t, W('demain'), 490, 1000, 560, ['DEMAIN :', 'UN AUTRE CLICHÉ']); },
};
const MOODS = { hook: 'day', question: 'golden', affiches: 'day', bbq: 'golden', famille: 'interior', reseaux: 'interior', fete: 'day', douane: 'day', fin: 'golden' };
K.start({ scenes: SC, moods: MOODS });
