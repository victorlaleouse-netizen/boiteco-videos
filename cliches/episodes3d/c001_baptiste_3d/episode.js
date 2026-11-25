// Épisode de référence 3D : « Baptiste, 26 ans : start-uppeur ultime ?! »
import * as K from './toon3d.js';
const { P, V, seg, eo } = K;
window.EP_TITLE = ['BAPTISTE, 26 ANS :', 'START-UPPEUR ULTIME ?!'];
const S = {}; TL.scenes.forEach(([n, a, b]) => S[n] = [a, b]);
const nk = k => k.toLowerCase().replace(/[.,?!…:]+$/, ''); const W = k => (TL.words[nk(k)] || [0])[0];

// ---- world ----
K.sky('day');
const STREET = K.SETS.street(0), ROOM = K.SETS.room(200), OFFICE = K.SETS.office(400, { banner: ['CROISSANT BOX', 'DISRUPT OR DIE'] });
// characters
const bap = K.avatar({ shirt: P.navy, sleeves: 0x9cc3e6, pants: P.tan, shoes: P.white, hat: 'hair', hairColor: P.brown, print: 'CEO', face: 'smug' });
const papa = K.avatar({ shirt: P.olive, pants: 0x6c6457, hat: 'bald', glasses: true, beard: 0xb9b2a6, skin: P.skin2, face: 'smile' });
const maman = K.avatar({ shirt: P.purple, pants: P.black, hat: 'long', hairColor: 0x3a2a2a, face: 'smile' });
const extras = K.crowd(4, 0, -2.4, 2.6);
const phoneBig = K.panel(K.scene, 3, 5.2, ['RÉSEAU PRO', '', 'Debout à 5h ☀', 'Pendant que vous', 'dormez, je construis', 'mon empire.', '#mindset'], { bg: '#ffffff', fg: '#20242E', glow: true });
phoneBig.visible = false;

function place(av, x, z, ry = 0) { av.hide(false).at(x, z, ry); return av; }
function hideAll() { [bap, papa, maman, ...extras].forEach(a => a.hide(true)); phoneBig.visible = false; }

const SC = {
  hook(t, lt) { hideAll(); place(bap, 0, 4, -.15).pose('wave', t); bap.setFace('wink'); extras.forEach((e, i) => e.hide(false).pose('dance', t + i));
    K.focusShadow(0, 2); const [f, l] = K.frame(bap, 'close', { side: .6 }); K.shot(V(f.x + 1, f.y + .4, f.z + 3), f, l, l, lt / 3, 40);
    return K.stamp(t, 1.2, 490, 1060, 'LIBÉRAL', '#E5322D', -6); },
  doudoune(t, lt) { hideAll(); place(bap, 0, 4, .2).pose('cross', t); bap.setFace('smug'); K.focusShadow(0, 2);
    const [f, l] = K.frame(bap, 'mid', { side: -.8 }); K.shot(f, V(f.x + 1.5, f.y, f.z - 1), l, l, lt / 4);
    return K.card(t, W('doudoune'), 700, 620, 360, ['DOUDOUNE', 'sans manches']) + K.stamp(t, W('jamais'), 470, 980, '365 J / AN', '#E5322D', 5, 60); },
  cinqh(t, lt) { hideAll(); place(bap, 198, -1, .3).pose(t > W('poster') ? 'phone' : 'idle', t); bap.setFace(t > W('poster') ? 'smug' : 'shock'); K.focusShadow(200, -2, 14);
    const [f, l] = K.frame(bap, 'mid', { side: 1 }); K.shot(f, V(f.x - 1, f.y - .3, f.z - 1.2), l, l, lt / 4);
    return K.stamp(t, W('cinq'), 480, 620, '5:00', '#E5322D', -4, 90) + K.card(t, W('poster') + .4, 700, 980, 380, ['Réveil : 5h00', 'Post : 5h01']); },
  ceo(t, lt) { hideAll(); place(bap, 400, -1).pose(t > W('ceo') ? 'armsUp' : 'talk', t); bap.setFace('happy'); K.focusShadow(400, -2, 16);
    const [f, l] = K.frame(bap, 'full'); K.shot(V(f.x + 4, f.y + 1, f.z + 3), f, l, l, lt / 5);
    return K.card(t, W('ceo'), 490, 560, 520, ['BAPTISTE', 'CEO & Founder 🚀']) + K.stamp(t, W('salarié'), 490, 960, 'SALARIÉS : 1 (LUI)', '#E5322D', -5, 58); },
  croissant(t, lt) { hideAll(); place(bap, 403, -1, -.2).pose('point', t); bap.setFace('talk'); K.focusShadow(400, -2, 16);
    const [f, l] = K.frame(bap, 'mid', { side: -1 }); K.shot(f, V(f.x + 1, f.y + .5, f.z - 2), l, l, lt / 6);
    return K.card(t, W('appli'), 490, 600, 520, ['🥐 CROISSANT BOX', '19,99 € / mois']) + K.stamp(t, W('disrupter'), 490, 980, 'DISRUPTER LA BOULANGERIE', '#E5322D', -4, 46); },
  diner(t, lt) { hideAll(); place(maman, 195, -4.6).pose('sit', t); place(papa, 199, -4.6).pose('sit', t); place(bap, 202.5, -1.5, -.5).pose(t > W("l'état") ? 'shout' : 'talk', t);
    bap.setFace(t > W("l'état") ? 'angry' : 'talk'); papa.setFace(t > W('aides') ? 'flat' : 'smile'); maman.setFace(t > W('aides') ? 'flat' : 'smile'); K.focusShadow(200, -3, 14);
    K.shot(V(206, 6.5, 16), V(205, 6, 14), V(199.5, 2.8, -3), V(200, 2.8, -3), lt / 5, 42);
    return K.card(t, W("l'état"), 490, 620, 620, ["« L'ÉTAT, C'EST", 'LE PROBLÈME ! »']) + K.stamp(t, W('assistés'), 480, 990, 'ASSISTÉS !', '#E5322D', 6); },
  subvention(t, lt) { hideAll(); place(bap, 400, -2.6, 0).pose('phone', t); bap.setFace(t > W('innovation') ? 'wink' : 'smug'); K.focusShadow(400, -3, 14);
    const [f, l] = K.frame(bap, 'mid', { side: .8 }); K.shot(f, V(f.x, f.y - .4, f.z - 1.5), l, l, lt / 4);
    return K.card(t, S.subvention[0] + .3, 490, 640, 640, ['DEMANDE DE', 'SUBVENTION INNOVATION', 'Montant : 30 000 €']) + K.stamp(t, W('innovation') + .1, 520, 980, 'ENVOYÉ ✓', '#2FA84A', -10); },
  toutseul(t, lt) { hideAll(); place(bap, 0, 4).pose(t > W('je') ? 'armsUp' : 'idle', t); bap.setFace('happy'); extras.forEach((e, i) => e.hide(false).pose('idle', t + i)); K.focusShadow(0, 2);
    const [f, l] = K.frame(bap, 'full', { side: .5 }); K.shot(V(f.x, f.y - 1, f.z + 4), f, l, l, lt / 5, 42);
    return K.card(t, W('je'), 490, 600, 640, ['« JE ME SUIS FAIT', 'TOUT SEUL. »']); },
  cheque(t, lt) { hideAll(); place(papa, 198, -1, .4).pose(t > W('papa') ? 'point' : 'idle', t); place(bap, 202, -1, -.4).pose('wave', t); bap.setFace('happy'); K.focusShadow(200, -2, 14);
    K.shot(V(200, 6, 22), V(200, 5.4, 19), V(200, 3.2, -1), V(200, 3.2, -1), lt / 5, 40);
    return K.card(t, W('chèque'), 490, 600, 560, ['CHÈQUE DE PAPA', '80 000 €']) + K.stamp(t, W('quatre-vingt'), 490, 960, 'MERCI PAPA', '#E5322D', 7, 60); },
  ferme(t, lt) { hideAll(); place(bap, 400, 0).pose('facepalm', t); bap.setFace('cry'); K.focusShadow(400, -2, 16);
    const [f, l] = K.frame(bap, 'full'); K.shot(V(f.x, f.y + 3, f.z + 8), f, l, l, lt / 4, 42);
    return K.stamp(t, S.ferme[0] + .1, 300, 560, '+ 6 MOIS', '#20242E', -3, 54) + K.stamp(t, W('ferme'), 490, 860, 'FERMÉ', '#E5322D', -9, 120); },
  post(t, lt) { hideAll(); place(bap, 198, -1, .3).pose('phone', t); bap.setFace('flat'); K.focusShadow(200, -2, 14);
    const [f, l] = K.frame(bap, 'close', { side: 1 }); K.shot(f, V(f.x - .5, f.y - .2, f.z - .8), l, l, lt / 4, 40);
    return K.card(t, W('post'), 490, 640, 640, ['CE QUE MON ÉCHEC', "M'A APPRIS SUR", 'LE LEADERSHIP 🧵']); },
  podcast(t, lt) { hideAll(); place(bap, 198, -1, .1).pose(t > W('podcast') ? 'talk' : 'idle', t); bap.setFace(t > W('podcast') ? 'talk' : 'shock'); K.focusShadow(200, -2, 14);
    const [f, l] = K.frame(bap, 'mid', { side: -.6 }); K.shot(f, V(f.x + .5, f.y, f.z - 1), l, l, lt / 4);
    const n = Math.round(3000 * eo(seg(t, S.podcast[0], W('likes') + .3)));
    return K.card(t, S.podcast[0], 490, 560, 460, ['👍 ' + (n >= 1000 ? Math.floor(n / 1000) + ' ' + String(n % 1000).padStart(3, '0') : n)]) + K.stamp(t, W('podcast'), 500, 960, 'ON AIR 🎙', '#E5322D', -6, 70); },
  fin(t, lt) { hideAll(); place(bap, 0, 4).pose('dance', t); bap.setFace('happy'); extras.forEach((e, i) => e.hide(false).pose('dance', t + i * .3)); K.focusShadow(0, 2);
    K.shot(V(0, 10, 40), V(0, 8, 32), V(0, 3, 1), V(0, 3, 1), lt / 4, 40);
    return K.stamp(t, W('abonne-toi'), 490, 700, 'ABONNE-TOI', '#E5322D', -6, 90) + K.card(t, W('demain'), 490, 960, 620, ['DEMAIN : UN AUTRE CLICHÉ']); },
};
const GROUND = { hook: '#E07A5F', doudoune: '#E9B949', cinqh: '#3E9C94', ceo: '#A9C9D6', croissant: '#E07A5F', diner: '#E9B949', subvention: '#3E9C94', toutseul: '#7D5170', cheque: '#8C9A57', ferme: '#6F7F95', post: '#E07A5F', podcast: '#E9B949', fin: '#3E9C94' };
K.start({ scenes: SC, ground: GROUND });
