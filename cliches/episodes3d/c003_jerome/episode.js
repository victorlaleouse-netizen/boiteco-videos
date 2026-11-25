// Épisode 3 : « Jérôme, 45 ans : tocard apolitique ultime ?! »
import * as K from './toon3d.js';
const { P, V, seg, eo } = K;
window.EP_TITLE = ['JÉRÔME, 45 ANS :', 'TOCARD « APOLITIQUE » ULTIME ?!'];
const S = {}; TL.scenes.forEach(([n, a, b]) => S[n] = [a, b]);
const nk = k => k.toLowerCase().replace(/[.,?!…:]+$/, '');
const W = (k, i = 0) => { const a = TL.words[nk(k)] || [0]; return a[Math.min(i, a.length - 1)]; };
const RED = '#E5322D', INK = '#20242E', GREEN = '#2FA84A';

// ---- world ----
K.sky('day');
K.SETS.street(0); K.SETS.room(200, { sofa: P.orange });
K.SETS.office(400, { banner: ['BAR-TABAC', 'CHEZ JOJO'] });
K.SETS.fac(600, { title: 'MAIRIE', banners: ['ÉLECTIONS', 'MUNICIPALES'] });
// posters « VOTEZ JÉRÔME » scotchés sur la mairie (callback fin)
[-5.4, -1.8, 1.8, 5.4].forEach((dx, i) => { const p = K.panel(K.scene, 2.2, 2.6, ['VOTEZ', 'JÉRÔME', 'ni G ni D'], { bg: '#F5CD30', fg: '#111111' }); p.position.set(600 + dx, 3.4, -5.85 + (i % 2) * .03); p.rotation.z = (i % 2 ? .06 : -.05); });
const board = K.panel(K.scene, 7, 3.6, ['RÉSULTATS', 'JÉRÔME : 112', "L'AUTRE : 113"], { bg: '#20242E', fg: '#F5CD30' }); board.position.set(606, 4.2, -2.2); board.rotation.y = -.35;

// characters (même look à tous les âges : casquette rouge, t-shirt TOUS POURRIS)
const look = { shirt: P.grey, sleeves: P.grey, pants: P.navy, shoes: P.white, hat: 'cap', hatColor: P.red, print: 'TOUS POURRIS', printColor: '#C4281C', face: 'smug' };
const jeune = K.avatar({ ...look });
const jeunePh = K.avatar({ ...look, prop: 'phone' });
const vieux = K.avatar({ ...look, beard: 0x6E4A2E, pants: P.black });
const vieuxSign = K.avatar({ ...look, beard: 0x6E4A2E, pants: P.black, prop: 'sign:VOTEZ|JÉRÔME' });
const rod = K.box(jeune.armR, .1, 4.2, .1, P.brown, 0, -1.7, 1.6); rod.rotation.x = 1.0; rod.visible = false;
const mamie = K.avatar({ shirt: P.purple, pants: P.black, hat: 'bun', hairColor: 0xd8d8d8, glasses: true, skin: P.skin2, face: 'smile', scale: .9 });
const tonton = K.avatar({ shirt: P.olive, pants: 0x6c6457, hat: 'bald', beard: 0xb9b2a6, face: 'smile' });
const voteSign = K.avatar({ shirt: P.blue, pants: P.black, hat: 'hair', hairColor: P.black, prop: 'sign:BUREAU|DE VOTE', face: 'smile', scale: .9 });
const bar = K.crowd(3, 400, -2.2, 3.2, { props: ['glass'] });
const all = [jeune, jeunePh, vieux, vieuxSign, mamie, tonton, voteSign, ...bar];

const up = (l, d) => V(l.x, l.y + d, l.z);
function place(av, x, z, ry = 0) { av.hide(false).at(x, z, ry); return av; }
function hideAll() { all.forEach(a => a.hide(true)); rod.visible = false; }
const age = (t, n) => K.ageBadge(t, 0, 180, 580, n);
const results = (t, t0, cnt) => { const k = cnt ? eo(seg(t, t0, t0 + 1.6)) : 1; return K.card(t, t0, 560, 620, 540, ['RÉSULTATS 🗳', 'JÉRÔME : ' + Math.round(112 * k), "L'AUTRE : " + Math.round(113 * k)]); };

const SC = {
  // cold open: la chute
  hook(t, lt) { hideAll(); place(vieux, 600, 1, .25).pose('facepalm', t); vieux.setFace('cry'); K.focusShadow(600, 0);
    const [f, l] = K.frame(vieux, 'mid', { side: .5 }); K.shot(V(f.x, f.y + .6, f.z + 3), f, up(l, .7), up(l, .7), lt / 6, 40);
    return results(t, -1) + (t < W('sienne') ? K.stamp(t, W('voix'), 480, 1060, '-1 VOIX', RED, -6, 80) : K.stamp(t, W('sienne'), 490, 1060, 'LA SIENNE', RED, 5, 76)); },
  question(t, lt) { hideAll(); place(vieux, 600, 1, .2).pose('shrug', t); vieux.setFace('shock'); K.focusShadow(600, 0);
    const a = lt * .5; K.shot(V(600 + 30 * Math.sin(a), 12, 1 + 30 * Math.cos(a)), V(600 + 30 * Math.sin(a), 12, 1 + 30 * Math.cos(a)), V(600, 3, -1), null, 0, 40);
    return K.card(t, W('comment'), 540, 640, 640, ['COMMENT ON', 'EN ARRIVE LÀ ? 🤔']); },
  jeune(t, lt) { hideAll(); place(jeune, 0, 4, -.1).pose(t > W('pourris') ? 'point' : 'talk', t); jeune.setFace(t > W('pourris') ? 'smug' : 'talk'); K.focusShadow(0, 2);
    const [f, l] = K.frame(jeune, 'mid', { side: .6 }); K.shot(V(f.x + 2, f.y + 1, f.z + 4), f, up(l, .6), up(l, .6), lt / 3, 40);
    const top = t < W('apolitique') ? K.stamp(t, S.jeune[0] + .05, 560, 640, '⏪ 27 ANS PLUS TÔT', INK, -3, 56) : K.card(t, W('apolitique'), 560, 640, 520, ['APOLITIQUE', 'professionnel 🧢']);
    return age(t, 18) + top + K.stamp(t, W('pourris'), 490, 1010, '« TOUS POURRIS ! »', RED, -5, 62); },
  peche(t, lt) { hideAll(); place(voteSign, -3.2, 3.4, .3).pose('wave', t); place(jeune, 1 + lt * .3, 4.6, 1.4).pose('walk', t); rod.visible = true; jeune.setFace('happy'); K.focusShadow(0, 2);
    K.shot(V(-.5, 6, 25), V(.6, 5.8, 24), V(-.6, 3.8, 3), V(.9, 3.8, 3), lt / 4, 40);
    return age(t, 18) + K.card(t, W('premier'), 560, 620, 520, ['1er VOTE ?', '🎣 PÊCHE']) + K.stamp(t, W('zéro'), 490, 1010, 'POISSONS : 0', RED, 6, 70); },
  bar(t, lt) { hideAll(); place(jeune, 400, 1.5, -.1).pose(t > W('politique') ? 'cross' : 'talk', t); jeune.setFace(t > W('politique') ? 'smug' : 'talk');
    bar.forEach((e, i) => e.hide(false).pose('idle', t + i)); K.focusShadow(400, 0, 16);
    const [f, l] = K.frame(jeune, 'full', { side: -.5 }); K.shot(f, V(f.x + 2, f.y, f.z - 3), up(l, 1), up(l, 1), lt / 4, 40);
    return age(t, 25) + K.card(t, W('jure'), 560, 620, 560, ['« MOI, JE FAIS', 'PAS DE POLITIQUE »']) + K.stamp(t, W('bar-tabac'), 470, 1100, 'BAR-TABAC 🍺', INK, -4, 60); },
  lune(t, lt) { hideAll(); place(jeune, 400, 1.5, .2).pose(t > W('lune') ? 'armsUp' : 'shout', t); jeune.setFace('shout');
    bar.forEach((e, i) => { e.hide(false).pose('idle', t + i); e.setFace(t > W('heures') ? 'flat' : 'smile'); }); K.focusShadow(400, 0, 16);
    const [f, l] = K.frame(jeune, 'mid', { side: .8 }); K.shot(f, V(f.x - 1, f.y - .3, f.z - 2), up(l, .6), up(l, .6), lt / 4);
    const h = Math.min(2, 2 * seg(t, W('pendant'), W('lune'))); const clock = K.card(t, W('pendant'), 560, 600, 400, ['⏱ ' + h.toFixed(1).replace('.', ',') + ' H']);
    const st = t > W('lune') ? K.stamp(t, W('lune'), 500, 1010, '🌙 ET LA LUNE', RED, 5, 66) : t > W("l'europe") ? K.stamp(t, W("l'europe"), 500, 1010, "L'EUROPE", INK, -4, 66) : K.stamp(t, W('france'), 500, 1010, 'LA FRANCE', INK, 4, 66);
    return age(t, 25) + clock + st; },
  comm(t, lt) { hideAll(); place(jeunePh, 198, -1.2, .3).pose('phone', t); jeunePh.setFace('angry'); K.focusShadow(200, -2, 14);
    const [f, l] = K.frame(jeunePh, 'mid', { side: -.8 }); K.shot(f, V(f.x + 1, f.y - .2, f.z - 1.5), up(l, .9), up(l, .9), lt / 6);
    const L = ['PAGE DE LA MAIRIE', '💬 HONTEUX !!!', '💬 TOUS DES VOLEURS', '💬 RÉVEILLEZ-VOUS']; const n = 1 + Math.min(3, Math.floor(Math.max(0, t - W('poste')) / .9));
    const sub = t > W('rond-point') ? ['ROND-POINT : 800 000 €', RED] : t > W('impôts') ? ['IMPÔTS 💸', INK] : t > W('nids-de-poule') ? ['NIDS-DE-POULE', INK] : t > W('quarante') ? ['40 COMMENTAIRES / JOUR', RED] : null;
    return age(t, 30) + K.card(t, W('poste'), 560, 660, 560, L.slice(0, n)) + (sub ? K.stamp(t, t, 490, 1090, sub[0], sub[1], -4, 52) : ''); },
  voter(t, lt) { hideAll(); place(jeunePh, 198, -1.2, -.2).pose('shout', t); jeunePh.setFace('shout'); K.focusShadow(200, -2, 14);
    const [f, l] = K.frame(jeunePh, 'mid', { side: .6 }); K.shot(f, V(f.x - .6, f.y - .1, f.z - 2.5), up(l, .8), up(l, .8), lt / 3, 40);
    return age(t, 30) + K.card(t, W('voter'), 560, 620, 560, ['VOTER ?', '« ÇA SERT À RIEN »']) + K.stamp(t, W('moutons'), 490, 1080, 'BANDE DE MOUTONS 🐑', RED, -5, 56); },
  repas(t, lt) { hideAll(); place(mamie, 196, -4.6).pose('sit', t); place(tonton, 199.5, -4.6).pose('sit', t); place(vieux, 203, -1.5, -.5).pose(t > W('libre') ? 'armsUp' : 'idle', t);
    vieux.setFace(t > W('libre') ? 'smug' : 'smile'); mamie.setFace(t > W('mamie') ? 'talk' : 'smile'); tonton.setFace('smile'); K.focusShadow(200, -3, 14);
    K.shot(V(206, 7, 19), V(205, 6.5, 16.5), V(199.5, 3.6, -3), V(200, 3.6, -3), lt / 5, 42);
    const c = t < W('libre') ? K.card(t, W('mamie'), 560, 620, 560, ['MAMIE :', '« TU VOTES POUR QUI ? »']) : K.card(t, W('libre'), 560, 620, 560, ['« MOI, JE SUIS', 'LIBRE. » 🦅']);
    return age(t, 35) + K.stamp(t, S.repas[0] + .1, 490, 1110, 'REPAS DE FAMILLE', INK, 3, 50) + c; },
  carte(t, lt) { hideAll(); place(mamie, 196, -4.6).pose('sit', t); place(tonton, 199.5, -4.6).pose('facepalm', t); place(vieux, 203, -1.5, -.5).pose('shrug', t);
    vieux.setFace('flat'); mamie.setFace('shock'); tonton.setFace('flat'); K.focusShadow(200, -3, 14);
    const [f, l] = K.frame(vieux, 'mid', { side: -.6 }); K.shot(f, V(f.x + .5, f.y, f.z - 1), up(l, .7), up(l, .7), lt / 3);
    return age(t, 35) + K.card(t, W('carte'), 560, 620, 560, ["CARTE D'ÉLECTEUR", '❌ AUCUNE']) + K.stamp(t, W("d'électeur") + .3, 490, 1080, 'MÊME PAS INSCRIT', RED, -6, 62); },
  mairie(t, lt) { hideAll(); place(vieuxSign, 600, 2).pose(t > W('gauche') ? 'armsUp' : 'wave', t); vieuxSign.setFace('happy'); K.focusShadow(600, 0);
    const [f, l] = K.frame(vieuxSign, 'mid', { side: -.4 }); K.shot(V(f.x, f.y + 1, f.z + 5), V(f.x, f.y + 1.2, f.z + 2), up(l, 2), up(l, 2), lt / 4, 42);
    return age(t, 45) + K.card(t, W('liste'), 560, 620, 600, ['NI GAUCHE NI DROITE', 'JUSTE JÉRÔME 🇫🇷']) + K.stamp(t, W('présente'), 490, 1090, 'CANDIDAT !', GREEN, -5, 70); },
  affiches(t, lt) { hideAll(); place(vieux, 599, -2.6, Math.PI - .3).pose('armsUp', t); K.focusShadow(600, -2);
    K.shot(V(596, 6.5, 20), V(597.5, 6, 17), V(599.5, 4.6, -4), V(600, 4.6, -4), lt / 3, 40);
    return age(t, 45) + K.card(t, W('affiches'), 560, 620, 460, ['SCOTCH', '1,50 €']) + K.stamp(t, W('lui-même'), 490, 1090, 'FAIT MAISON', INK, 5, 62); },
  resultat(t, lt) { hideAll(); place(vieux, 600, 1, .25).pose(t > W('sienne', 1) ? 'facepalm' : 'idle', t); vieux.setFace(t > W('sienne', 1) ? 'cry' : 'shock'); K.focusShadow(600, 0);
    const [f, l] = K.frame(vieux, 'full', { side: .7 }); K.shot(f, K.frame(vieux, 'mid', { side: .5 })[0], up(l, 1.1), up(K.frame(vieux, 'mid')[1], .7), lt / 6, 40);
    const st = t > W('inscrit') ? K.stamp(t, W('inscrit'), 490, 1070, 'JAMAIS INSCRIT', RED, -6, 72) : t > W('sienne', 1) ? K.stamp(t, W('sienne', 1), 490, 1070, 'LA SIENNE', RED, 5, 80) : K.stamp(t, W('voix', 2), 480, 1070, '-1 VOIX', RED, -6, 80);
    return age(t, 45) + results(t, S.resultat[0] + .2, true) + st; },
  fin(t, lt) { hideAll(); place(vieux, 600, 1, .25).pose('facepalm', t); vieux.setFace('cry'); K.focusShadow(600, 0);
    const [f, l] = K.frame(vieux, 'mid', { side: .5 }); K.shot(V(f.x, f.y + 2, f.z + 8), V(f.x, f.y + .6, f.z + 3), up(l, .7), up(l, .7), lt / 4, 40);
    return results(t, S.fin[0]) + K.stamp(t, W('abonne-toi'), 490, 930, '  ABONNE-TOI  ', RED, -6, 64) + K.card(t, W('demain'), 490, 1110, 640, ['DEMAIN : UN AUTRE CLICHÉ']); },
};
const GROUND = { hook: '#E07A5F', question: '#20242E', jeune: '#E9B949', peche: '#3E9C94', bar: '#E07A5F', lune: '#7D5170', comm: '#A9C9D6', voter: '#E07A5F', repas: '#E9B949', carte: '#3E9C94', mairie: '#8C9A57', affiches: '#E9B949', resultat: '#E07A5F', fin: '#3E9C94' };
K.start({ scenes: SC, ground: GROUND });
