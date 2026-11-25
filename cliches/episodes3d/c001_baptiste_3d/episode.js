// Épisode de référence 3D v2 : « Baptiste, 26 ans : start-uppeur ultime ?! »
import * as K from './toon3d.js';
const { P, V, seg, eo } = K;
window.EP_TITLE = ['BAPTISTE, 26 ANS :', 'START-UPPEUR ULTIME ?!'];
const S = {}; TL.scenes.forEach(([n, a, b]) => S[n] = [a, b]);
const nk = k => k.toLowerCase().replace(/[.,?!…:]+$/, ''); const W = k => (TL.words[nk(k)] || [0])[0];
const dur = n => S[n][1] - S[n][0];

// ---- décors (chacun à sa propre abscisse) ----
K.sky('day');
const STREET = K.SETS.street(0, { party: 15 });
const HOME = K.SETS.home(1000);
const ROOM = K.SETS.bedroom(1100);
const STUDIO = K.SETS.bedroom(1150, { podcast: true, neon: 'BAPTISTE TALKS' });
const OFFICE = K.SETS.office(1200, { banner: ['CROISSANT BOX'], board: ['KPI ↗ ↗ ↗', 'MOONSHOT 🚀', 'LEVÉE : 0 €'] });

// ---- personnages ----
const look = { outfit: 'tee', shirt: 0xf2f2f2, vest: 0x1f2d4f, vestLogo: 'CEO', pants: 0xc9b48f, shoes: 0xffffff, hat: 'hair', hairColor: 0x7a4e2e, face: 'smug' };
const bap = K.avatar(look);
const bapHP = K.avatar({ ...look, hat: 'headphones' });
const papa = K.avatar({ outfit: 'polo', shirt: 0x6a8a3a, pants: 0x6c6457, hat: 'bald', glasses: true, beard: 0xd0cabd, skin: P.skin2, face: 'smile' });
const maman = K.avatar({ outfit: 'jacket', shirt: 0x9b6ad0, pants: 0x2a2a2a, hat: 'long', hairColor: 0x5a3a2a, face: 'smile' });
const voisins = K.crowd(6, 15, -1, 2.4, { hats: ['party', 'party', 'curly', 'party', 'cap', 'party'] });
const all = [bap, bapHP, papa, maman, ...voisins];
const hideAll = () => all.forEach(a => a.hide(true));
const put = (av, s, dx = 0, dz = 0, ry) => { av.sitY = -.1; return av.hide(false).at(s.x + dx, s.z + dz, ry ?? s.ry ?? 0); };
const B = STREET.front;

const SC = {
  // cold open : vue drone du quartier qui plonge sur Baptiste, puis gros plan en contre-plongée
  hook(t, lt) { hideAll(); put(bap, B, 0, 0, 0); bap.setFace(lt < 1.3 ? 'happy' : 'wink', t).pose(lt < 1.3 ? 'wave' : 'proud', t);
    voisins.forEach((v, i) => v.hide(false).pose('dance', t + i * .4).setFace('laugh', t));
    K.cuts([[0, (l, k) => K.drone(V(-26, 34, 48), V(-6, 7.5, 17), V(0, 1, 0), V(0, 3.6, 3.2), k * 1.05, 52)],
            [1.28, (l, k) => K.move(bap, 'medium', 'close', k, { h: 'low', side: .25 }, { h: 'low', side: .05 })]], lt, dur('hook'));
    return K.stamp(t, W('libéral'), 490, 1060, 'LIBÉRAL', K.C.red, -6); },
  doudoune(t, lt) { hideAll(); put(bap, B, 1, 0, -.25); bap.setFace(t < W('jamais') ? 'smug' : 'cool', t).pose(t < W('doudoune') ? 'proud' : 'flex', t);
    K.cuts([[0, (l, k) => K.orbit(bap, 'full', -.7, -.1, k, { h: 'low' })],
            [W('doudoune') - S.doudoune[0], (l, k) => K.move(bap, 'close', 'medium', k, { dy: -1.4, side: .3 }, { side: -.2 })]], lt, dur('doudoune'));
    return K.ageBadge(t, W('ans') - .3, 760, 600, 26) + K.card(t, W('doudoune'), 330, 640, 380, ['DOUDOUNE', 'sans manches']) + K.stamp(t, W('jamais'), 470, 1000, '365 J / AN', K.C.red, 5, 60); },
  // 5 h du matin, chambre dans le noir
  cinqh(t, lt) { hideAll(); put(bap, ROOM.bed); bap.sitY = .45; bap.pose([[0, 'sit'], [W('poster'), 'phone']], t); if (t >= W('poster')) { bap.legL.rotation.x = bap.legR.rotation.x = -1.55; bap.root.position.y = .45; } bap.setFace(t < W('cinq') ? 'sleepy' : t < W('poster') ? 'shock' : 'smug', t);
    K.cuts([[0, (l, k) => K.push(bap, 'medium', k, { side: .5, h: 'high' })],
            [W('poster') - S.cinqh[0], (l, k) => K.move(bap, 'close', 'xclose', k, { side: -.35, dy: -.5 }, { side: -.2, dy: -.3 })]], lt, dur('cinqh'));
    return K.stamp(t, W('cinq'), 480, 640, '5:00', K.C.red, -4, 96) + K.card(t, W('poster') + .4, 680, 980, 380, ['Réveil : 5h00', 'Post : 5h01']); },
  // open space vide : il est CEO… et seul salarié
  ceo(t, lt) { hideAll(); put(bap, OFFICE.front, 0, 0, 0); bap.setFace(t < W('ceo') ? 'smug' : 'laugh', t).pose([[0, 'phone'], [W('ceo') - .1, 'armsUp'], [W('salarié') - .3, 'proud']], t);
    K.cuts([[0, (l, k) => K.move(bap, 'medium', 'full', k, { side: .4 }, { side: .1, h: 'low' })],
            [W('salarié') - S.ceo[0] - .3, (l, k) => K.drone(V(1216, 10, 15.5), V(1212, 9.5, 15), V(1200, 1.5, 5), V(1200, 2, 6), k, 60)]], lt, dur('ceo'));
    return K.card(t, W('ceo'), 490, 600, 520, ['BAPTISTE', 'CEO & Founder 🚀']) + K.stamp(t, W('salarié'), 490, 980, 'SALARIÉS : 1 (LUI)', K.C.red, -5, 58); },
  croissant(t, lt) { hideAll(); put(bap, OFFICE.front, -2, -1.5, .25); bap.setFace(t < W('disrupter') ? 'talk' : 'laugh', t).pose([[0, 'talk'], [W('abonnement'), 'present'], [W('disrupter'), 'cheer']], t);
    K.cuts([[0, (l, k) => K.push(bap, 'medium', k, { side: -.3 })],
            [W('abonnement') - S.croissant[0], (l, k) => K.orbit(bap, 'full', .5, -.3, k, { h: 'low' })],
            [W('disrupter') - S.croissant[0], (l, k) => K.move(bap, 'full', 'wide', k, { h: 'low' }, { h: 'eye', side: .2 })]], lt, dur('croissant'));
    return K.card(t, W('appli'), 490, 600, 520, ['🥐 CROISSANT BOX', '19,99 € / mois']) + K.stamp(t, W('disrupter'), 490, 990, 'DISRUPTER LA BOULANGERIE', K.C.red, -4, 46); },
  // repas de famille
  diner(t, lt) { hideAll(); put(papa, HOME.table[1]); put(maman, HOME.table[0]); papa.pose('sit', t); maman.pose('sit', t);
    put(bap, HOME.table[2], 3.5, 4.5, -.9); bap.pose([[0, 'talk'], [W("l'état"), 'shout'], [W('assistés'), 'angry']], t); bap.setFace(t < W("l'état") ? 'talk' : 'angry', t);
    papa.setFace(t < W('aides') ? 'smile' : 'flat', t); maman.setFace(t < W('aides') ? 'smile' : 'worried', t);
    K.cuts([[0, (l, k) => K.drone(V(1014, 9, 9), V(1012, 7.5, 7), V(1006, 2.5, -4), V(1006.5, 2.6, -4), k, 58)],
            [W("l'état") - S.diner[0], (l, k) => K.push(bap, 'medium', k, { h: 'low', side: .3 })],
            [W('aides') - S.diner[0], (l, k) => K.move({ x: 1006, z: -5.8, ry: 0 }, 'wide', 'full', k, { h: 'eye' }, { h: 'eye' })],
            [W('assistés') - S.diner[0], (l, k) => K.move(bap, 'medium', 'close', k, { h: 'low', side: .5 })]], lt, dur('diner'));
    return K.card(t, W("l'état"), 490, 620, 620, ["« L'ÉTAT, C'EST", 'LE PROBLÈME ! »']) + K.stamp(t, W('assistés'), 480, 1000, 'ASSISTÉS !', K.C.red, 6); },
  // le lendemain : dossier de subvention
  subvention(t, lt) { hideAll(); put(bap, OFFICE.desks[2]); bap.pose('typing', t).setFace(t < W('innovation') ? 'smug' : 'wink', t);
    K.cuts([[0, (l, k) => K.move(bap, 'full', 'medium', k, { yaw: Math.PI + .5, h: 'high', dy: -.6 }, { yaw: Math.PI + .3, h: 'high', dy: -.6 })],
            [W('innovation') - S.subvention[0] - .2, (l, k) => K.push(bap, 'close', k, { h: 'high', side: .15 })]], lt, dur('subvention'));
    const pre = t < W('innovation') - .2;
    return (t < S.subvention[0] + 1.6 ? K.card(t, S.subvention[0], 490, 600, 420, ['LE LENDEMAIN…']) : '') + (pre ? K.card(t, W('dossier'), 490, 1040, 640, ['DEMANDE DE', 'SUBVENTION INNOVATION', 'Montant : 30 000 €']) : '') + K.stamp(t, W('innovation') + .1, 520, 1080, 'ENVOYÉ ✓', K.C.green, -10); },
  // devant les voisins : « je me suis fait tout seul »
  toutseul(t, lt) { hideAll(); put(bap, { x: 15, z: 3.2, ry: 0 }); bap.pose([[0, 'talk'], [W('je') - .1, 'proud']], t).setFace(t < W('je') ? 'talk' : 'smug', t);
    voisins.forEach((v, i) => v.hide(false).pose(t > W('je') + .8 ? (i % 2 ? 'laugh' : 'shrug') : 'idle', t + i).setFace(t > W('je') + .8 ? (i % 2 ? 'laugh' : 'flat') : 'smile', t));
    K.cuts([[0, (l, k) => K.move(bap, 'wide', 'full', k, { side: .5, h: 'high', fov: 60 }, { side: .25, h: 'eye', fov: 56 })],
            [W('je') - S.toutseul[0], (l, k) => K.push(bap, 'medium', k, { h: 'low', side: -.15 })],
            [W('je') - S.toutseul[0] + 1.6, (l, k) => K.move({ x: 15, z: -1, ry: 0 }, 'wide', 'full', k, { h: 'high', fov: 60, side: -.3 }, { h: 'eye', fov: 58, side: -.2 })]], lt, dur('toutseul'));
    return K.card(t, W('je'), 490, 620, 640, ['« JE ME SUIS FAIT', 'TOUT SEUL. »']); },
  // pendant ce temps, papa signe le chèque
  cheque(t, lt) { hideAll(); put(papa, HOME.sofa[1]); papa.pose('sitTalk', t).setFace('smile', t); put(bap, HOME.sofa[2], 2.8, 3, -.5); bap.pose([[0, 'idle'], [W('chèque'), 'cheer']], t).setFace('laugh', t);
    K.cuts([[0, (l, k) => K.push(papa, 'close', k, { side: -.2 })],
            [W('chèque') - S.cheque[0], (l, k) => K.move(papa, 'full', 'wide', k, { side: .3, dx: 1.8 }, { side: .2, dx: 2 })]], lt, dur('cheque'));
    return K.card(t, W('chèque'), 490, 600, 560, ['CHÈQUE DE PAPA', '80 000 €']) + K.stamp(t, W('quatre-vingt'), 490, 980, 'MERCI PAPA', K.C.red, 7, 60); },
  // six mois plus tard : l'open space est vide, la start-up ferme
  ferme(t, lt) { hideAll(); put(bap, OFFICE.front, 0, -1, 0); bap.pose([[0, 'idle'], [W('ferme'), 'cry']], t).setFace(t < W('ferme') ? 'worried' : 'cry', t);
    K.cuts([[0, (l, k) => K.drone(V(1217, 10, 15.5), V(1209, 8, 15), V(1200, 2, 5), V(1200, 3, 5.5), k, 60)],
            [W('ferme') - S.ferme[0], (l, k) => K.push(bap, 'medium', k, { h: 'high' })]], lt, dur('ferme'));
    return K.stamp(t, S.ferme[0] + .1, 300, 560, '+ 6 MOIS', K.C.panel, -3, 54) + K.stamp(t, W('ferme'), 490, 1060, 'FERMÉ', K.C.red, -9, 110); },
  // le post « ce que mon échec m'a appris »
  post(t, lt) { hideAll(); const turn = t >= W('leadership'); put(bap, ROOM.desk, 0, 0, turn ? Math.PI - 1.3 : Math.PI); bap.pose(turn ? 'sitTalk' : 'typing', t).setFace(t < W('échec') ? 'flat' : 'smug', t);
    K.cuts([[0, (l, k) => K.move(bap, 'full', 'medium', k, { yaw: Math.PI + .5, h: 'high', dy: -.6 }, { yaw: Math.PI + .35, h: 'high', dy: -.6 })],
            [W('leadership') - S.post[0], (l, k) => K.push(bap, 'close', k, { side: .1 })]], lt, dur('post'));
    return K.card(t, W('long'), 490, 640, 640, ['CE QUE MON ÉCHEC', "M'A APPRIS SUR", 'LE LEADERSHIP 🧵']); },
  podcast(t, lt) { hideAll(); put(bapHP, STUDIO.mic, 0, -3.4, 0); bapHP.pose(t > W('podcast') ? 'talk' : 'cheer', t).setFace(t > W('podcast') ? 'talk' : 'wow', t);
    K.cuts([[0, (l, k) => K.push(bapHP, 'medium', k, { side: .3 })],
            [W('podcast') - S.podcast[0], (l, k) => K.orbit(bapHP, 'full', .6, -.2, k, { h: 'eye' })]], lt, dur('podcast'));
    const n = Math.round(3000 * eo(seg(t, S.podcast[0], W('likes') + .4)));
    return K.card(t, S.podcast[0], 490, 600, 460, ['👍 ' + (n >= 1000 ? Math.floor(n / 1000) + ' ' + String(n % 1000).padStart(3, '0') : n)]) + K.stamp(t, W('podcast'), 500, 980, 'ON AIR 🎙', K.C.red, -6, 70); },
  // fin : la fête des voisins, la caméra s'envole
  fin(t, lt) { hideAll(); put(bap, { x: 15, z: .6, ry: 0 }); bap.pose('dance', t).setFace('laugh', t); voisins.forEach((v, i) => v.hide(false).pose('dance', t + i * .3).setFace('laugh', t));
    K.drone(V(21, 8, 14), V(30, 26, 44), V(15, 3, 0), V(10, 2, -2), lt / dur('fin'), 52);
    return K.stamp(t, W('abonne-toi'), 490, 720, 'ABONNE-TOI', K.C.red, -6, 90) + K.card(t, W('demain'), 490, 980, 620, ['DEMAIN : UN AUTRE CLICHÉ']); },
};
const MOODS = { hook: 'day', doudoune: 'day', cinqh: 'night', ceo: 'interior', croissant: 'interior', diner: 'interior', subvention: 'interior', toutseul: 'golden', cheque: 'interior', ferme: 'night', post: 'night', podcast: 'night', fin: 'dusk' };
K.start({ scenes: SC, moods: MOODS });
