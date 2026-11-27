// Épisode 7 : « Thibault, 31 ans : connard de LinkedIn ultime ?! » (start-up nation)
import * as K from './toon3d.js';
const { P, V } = K;
window.EP_TITLE = ['THIBAULT, 31 ANS :', 'CONNARD DE LINKEDIN ULTIME ?!'];
const S = {}; TL.scenes.forEach(([n, a, b]) => S[n] = [a, b]);
const nk = k => k.toLowerCase().replace(/[.,?!…:»«]+$/, '');
const W = (k, i = 0) => { const a = TL.words[nk(k)] || [0]; return a[Math.min(i, a.length - 1)]; };
const dur = n => S[n][1] - S[n][0];
const r0 = n => S[n][0];

// ---- décors ----
K.sky('day');
const STREET = K.SETS.street(0);
// l'agence pour l'emploi, côté nord de la rue (façade en z≈0)
const AX = 40;
K.box(K.STATIC, 16, 7, .4, 0x8a9bb0, AX, 3.5, .2);
const ens = K.panel(K.scene, 10, 1.5, ["AGENCE POUR L'EMPLOI"], { bg: '#2457c9', fg: '#ffffff' }); ens.position.set(AX, 6, .45);
K.box(K.STATIC, 3, 4, .1, K.GLASS, AX, 2, .45); K.box(K.STATIC, 3.4, 2.4, .1, K.GLASS, AX - 5, 2.6, .45); K.box(K.STATIC, 3.4, 2.4, .1, K.GLASS, AX + 5, 2.6, .45);
const HOME = K.SETS.home(1000);
const ROOM = K.SETS.bedroom(1100, { night: true });
const OFF = K.SETS.office(1200, { banner: ['SOCKS.IO'], board: ['🧦 CHAUSSETTES', 'CONNECTÉES', '49 €'] });
const AG = K.SETS.office(1300, { banner: ["AGENCE POUR L'EMPLOI"], board: ['OFFRES', "D'EMPLOI", '→ EN FACE'] });
const FAC = K.SETS.fac(2000, { title: 'ÉCOLE DE COMMERCE', banners: ['NETWORKING NIGHT', 'AFTERWORK'] });
const CT = K.SETS.court(4000, { banner: 'START-UP SUMMIT', home: '0', guest: '€' });
// carton de chaussettes dans l'open space
for (let i = 0; i < 3; i++) K.box(K.STATIC, 1.6, 1.2, 1.6, 0xc49a5a, 1200 - 3 + i * 1.8, .6, 5.5, { round: .05 });

// ---- personnages ----
const look = { outfit: 'polo', shirt: P.white, vest: 0x1f2a44, vestLogo: 'CEO', pants: 0xc8b99a, hat: 'hair', hairColor: 0x8a5a2a };
const t31 = K.avatar({ ...look, shoes: P.white, prop: 'phone', face: 'smug' });
const t31b = K.avatar({ ...look, shoes: P.white, prop: 'phone', face: 'sad' });
const t22 = K.avatar({ ...look, vestLogo: 'HEC?', prop: 'laptop', face: 'smug' });
const maman = K.avatar({ outfit: 'dress', shirt: 0xb0306a, hat: 'bun', hairColor: 0xd9b060, glasses: 'sun', prop: 'money', face: 'happy' });
const t25 = K.avatar({ ...look, prop: 'phone', face: 'grin' });
const t28 = K.avatar({ ...look, prop: 'laptop', face: 'smug' });
const kevin = K.avatar({ outfit: 'hoodie', shirt: 0x6a8a4a, pants: P.navy, hat: 'curly', hairColor: 0x2a1a10, prop: 'phone', face: 'sad', scale: .95 });
const t30 = K.avatar({ ...look, shoes: P.white, prop: 'mic', face: 'shout' });
const kevinC = K.avatar({ outfit: 'suit', shirt: 0x2a3550, tie: P.red, pants: 0x2a3550, hat: 'curly', hairColor: 0x2a1a10, glasses: true, face: 'smug', scale: .95 });
const fan = K.crowd(6, 4000, -12, 3, { seed: 21 });
const file = K.crowd(3, AX - 6, 2.4, 2.2, { hats: ['cap', 'beanie', 'hair'], seed: 5, face: 'flat' });
const all = [t31, t31b, t22, maman, t25, t28, kevin, t30, kevinC, ...fan, ...file];
const hideAll = () => all.forEach(a => a.hide(true));
const put = (av, s, dx = 0, dz = 0, ry) => { av.sitY = -.1; return av.hide(false).at(s.x + dx, s.z + dz, ry ?? s.ry ?? 0); };
const sitPhone = (av, t) => { av.pose('phone', t); av.legL.rotation.x = av.legR.rotation.x = -1.55; av.root.position.y = av.sitY ?? -.1; av.root.position.z = .2; return av; };
// traversée de la rue : du trottoir sud (z 13) à la façade (z 3)
const cross = (av, k) => { const z = K.lerp(12.5, 3.4, K.clamp(k, 0, 1)); av.hide(false).at(AX + 1.5, z, Math.PI * .85); return z; };

const SC = {
  // ouverture à froid : il traverse la rue… vers l'agence pour l'emploi
  hook(t, lt) { hideAll(); cross(t31, .15 + lt / dur('hook') * .4); t31.pose(t < W('chômage') ? 'walk' : 'phone', t).setFace(t < W('chômage') ? 'smug' : 'shock', t);
    K.cuts([[0, (l, k) => K.move(t31, 'medium', 'medium', k, { h: 'low', yaw: .9, side: .2, dist: 1.2 }, { h: 'low', yaw: .6, side: .1, dist: 1.05 })],
            [W('rue') - .2, (l, k) => K.drone(V(AX + 14, 9, 22), V(AX + 9, 7, 17), V(AX, 3, 2), V(AX + 1, 3, 4), k, 58)],
            [W('chômage') - .1, (l, k) => K.drone(V(AX + 8, 4.2, 1.6), V(AX + 7, 4, 2.2), V(AX + 1.5, 3.2, 8), V(AX + 1.5, 3.4, 8), k, 55)]], lt, dur('hook'));
    return K.stamp(t, W('connard'), 300, 620, 'CONNARD', K.C.red, -7, 80)
      + (t < W('chômage') - .1 ? K.card(t, -1, 640, 1000, 440, ['💼 « CEO »', 'DE RIEN DU TOUT']) : '')
      + (t >= W('chômage') ? K.stamp(t, W('chômage'), 490, 1030, 'CHÔMAGE', K.C.red, 5, 80) : ''); },
  question(t, lt) { hideAll(); cross(t31, .85); t31.pose('phone', t).setFace('worried', t); file.forEach((v, i) => v.hide(false).pose('idle', t + i).setFace('flat', t));
    K.drone(V(AX - 12, 10, 20), V(AX - 4, 7, 15), V(AX, 2.5, 3), V(AX + 1, 3, 3), lt / dur('question'), 56);
    return K.card(t, r0('question'), 490, 640, 640, ['COMMENT ON', 'EN ARRIVE LÀ ?']) + K.stamp(t, W('retour'), 490, 1040, '⏪ RETOUR À 22 ANS', K.C.red, -5, 62); },
  // 22 ans : école de commerce payée par maman
  ecole(t, lt) { hideAll(); put(t22, FAC.square, -1.5, 0, .3); put(maman, FAC.square, 2.6, .8, -.6);
    t22.pose(t < W('premier') ? 'proud' : 'typing', t).setFace(t < W('premier') ? 'smug' : 'grin', t);
    maman.pose(t < W('payée') ? 'idle' : 'present', t).setFace('happy', t);
    K.cuts([[0, (l, k) => K.drone(V(2012, 12, 24), V(2006, 7, 16), V(2000, 5, -6), V(2000, 2.5, 1), k, 54)],
            [W('gilet') - r0('ecole') - .1, (l, k) => K.move(t22, 'full', 'medium', k, { h: 'low', side: -.3 }, { h: 'low', side: -.15 })],
            [W('payée') - r0('ecole') - .1, (l, k) => K.push(maman, 'medium', k, { h: 'low', side: .3 })],
            [W('premier') - r0('ecole') - .1, (l, k) => K.push(t22, 'close', k, { h: 'low', side: -.2 })]], lt, dur('ecole'));
    return K.ageBadge(t, r0('ecole'), 800, 600, 22)
      + (t < W('payée') - .1 ? K.card(t, W('gilet'), 400, 1000, 460, ['🦺 GILET', 'SANS MANCHES']) : '')
      + (t >= W('payée') - .1 && t < W('premier') - .1 ? K.card(t, W('payée'), 490, 1000, 520, ['💸 15 000 € / AN', 'PAYÉ PAR MAMAN']) : '')
      + (t >= W('premier') - .1 ? K.card(t, W('travail'), 490, 980, 640, ['💼 « DU TRAVAIL ?', 'TRAVERSE LA RUE »']) : ''); },
  // 25 ans : les chaussettes connectées
  startup(t, lt) { hideAll(); put(t25, OFF.front, 0, -2, 0);
    t25.pose([[0, 'present'], [W('zéro') - .1, 'shrug'], [W('poste', 0) - .1, 'phone']], t).setFace(t < W('zéro') ? 'grin' : t < W('poste') ? 'shock' : 'smug', t);
    K.cuts([[0, (l, k) => K.move(t25, 'wide', 'full', k, { h: 'high', side: .3, fov: 60 }, { h: 'eye', side: .2 })],
            [W('chaussettes') - r0('startup') - .1, (l, k) => K.push(t25, 'medium', k, { h: 'low', side: .3 })],
            [W('zéro') - r0('startup') - .1, (l, k) => K.orbit(t25, 'full', -.5, .3, k, { h: 'high' })],
            [W('poste') - r0('startup') - .1, (l, k) => K.push(t25, 'close', k, { h: 'low', side: -.2 })]], lt, dur('startup'));
    return K.ageBadge(t, r0('startup'), 800, 600, 25)
      + (t < W('zéro') - .1 ? K.card(t, W('chaussettes'), 490, 1000, 560, ['🧦 CHAUSSETTES', 'CONNECTÉES · 49 €']) : '')
      + (t >= W('zéro') - .1 && t < W('poste') - .1 ? K.stamp(t, W('zéro'), 490, 1030, '0 CLIENT', K.C.red, -6, 90) : '')
      + (t >= W('poste') - .1 ? K.card(t, W("l'échec"), 490, 980, 600, ['📱 « L\'ÉCHEC', "N'EXISTE PAS »"]) : ''); },
  // 28 ans : il vire Kévin par message, dimanche 23 h
  stagiaire(t, lt) { hideAll(); t28.hide(false).at(ROOM.x - 6, -5, 0); t28.sitY = .45; t28.pose('typing', t); t28.legL.rotation.x = t28.legR.rotation.x = -1.55; t28.root.position.y = .45; t28.root.position.z = .2; t28.setFace(t < W('famille') ? 'smug' : 'grin', t);
    put(kevin, HOME.sofa[1]); sitPhone(kevin, t).setFace(t < W('message') ? 'smile' : 'cry', t);
    K.cuts([[0, (l, k) => K.orbit(t28, 'medium', -.5, -.1, k, { h: 'high' })],
            [W('kévin') - r0('stagiaire') - .1, (l, k) => K.push(kevin, 'medium', k, { h: 'eye', side: .3 })],
            [W('dimanche') - r0('stagiaire') - .1, (l, k) => K.orbit(t28, 'medium', .9, .3, k, { h: 'high' })],
            [W('famille') - r0('stagiaire') - .3, (l, k) => K.push(t28, 'close', k, { h: 'low', yaw: .4, side: .1 })],
            [W('champions') - r0('stagiaire') - .1, (l, k) => K.move(kevin, 'medium', 'close', k, { h: 'eye', side: .2 }, { h: 'eye', side: .05 })]], lt, dur('stagiaire'));
    return K.ageBadge(t, r0('stagiaire'), 800, 600, 28)
      + (t < W('dimanche') - .1 ? K.card(t, W('message'), 490, 1000, 480, ['✉ « T\'ES VIRÉ »', 'ENVOYÉ PAR APPLI']) : '')
      + (t >= W('dimanche') - .1 && t < W('famille') - .3 ? K.stamp(t, W('dimanche'), 490, 1030, 'DIMANCHE 23 H', K.C.red, -5, 66) : '')
      + (t >= W('famille') - .3 ? K.card(t, W('famille'), 490, 1090, 640, ['« ON EST UNE ÉQUIPE', 'DE CHAMPIONS »']) : ''); },
  // 30 ans : conférence, les aides c'est pour les assistés
  scene(t, lt) { hideAll(); put(t30, CT.center, 0, 2, 0);
    t30.pose(t < W('sa') ? 'shout' : t < W('subventions') ? 'talk' : 'proud', t).setFace(t < W('subventions') ? 'shout' : 'smug', t);
    fan.forEach((v, i) => v.hide(false).pose(t < W('sa') ? 'clap' : 'cheer', t + i * .3));
    K.cuts([[0, (l, k) => K.drone(V(4016, 11, 22), V(4008, 6, 14), V(4000, 3, 0), V(4000, 3, 1.5), k, 56)],
            [W('baskets') - r0('scene') - .1, (l, k) => K.move(t30, 'full', 'full', k, { h: 'low', side: .2, dy: -1.5 }, { h: 'low', side: .1, dy: -1 })],
            [W('aides') - r0('scene') - .1, (l, k) => K.push(t30, 'close', k, { h: 'low', side: .2 })],
            [W('subventions') - r0('scene') - .4, (l, k) => K.orbit(t30, 'medium', -.6, .2, k, { h: 'eye' })],
            [W('prêt') - r0('scene') - .1, (l, k) => K.push(t30, 'close', k, { h: 'low', side: -.15 })]], lt, dur('scene'));
    return K.ageBadge(t, r0('scene'), 800, 600, 30)
      + (t < W('aides') - .1 ? K.card(t, W('baskets'), 400, 1000, 460, ['👟 BASKETS', 'BLANCHES']) : '')
      + (t >= W('aides') - .1 && t < W('subventions') - .4 ? K.stamp(t, W('assistés'), 490, 1030, 'ASSISTÉS !', K.C.red, -6, 80) : '')
      + (t >= W('subventions') - .4 && t < W('prêt') - .1 ? K.card(t, W('subventions'), 490, 1000, 520, ['💶 SUBVENTION', '× 3']) : '')
      + (t >= W('prêt') - .1 ? K.card(t, W('prêt'), 490, 1000, 600, ['🏛 PRÊT GARANTI', "PAR L'ÉTAT"]) : ''); },
  // 31 ans : plus un centime, il traverse la rue
  rue(t, lt) { hideAll(); const k = K.clamp((t - W('traverse', 1)) / 2.4, 0, 1);
    file.forEach((v, i) => v.hide(false).pose('idle', t + i).setFace('flat', t));
    if (t < W('dans')) { cross(t31b, k); t31b.pose(t < W('traverse', 1) || k >= 1 ? 'idle' : 'walk', t).setFace('sad', t); }
    else { t31b.hide(false).at(AX - 9.8, 3.8, .15); t31b.pose('phone', t).setFace('grin', t); }
    K.cuts([[0, (l, k) => K.push(t31b, 'close', k, { h: 'high', side: .2, yaw: .8 })],
            [W('traverse', 1) - r0('rue') - .1, (l, k) => K.drone(V(AX + 10, 10, 24), V(AX + 4, 8, 18), V(AX + 1.5, 2, 9), V(AX + 1, 3, 3), k, 58)],
            [W('face') - r0('rue') - .3, (l, k) => K.drone(V(AX + 4, 4.5, 15), V(AX + 2.5, 4, 11.5), V(AX, 3.5, 1), V(AX + .5, 3.2, 1.5), k, 55)],
            [W('dans') - r0('rue') - .1, (l, k) => K.push(t31b, 'medium', k, { h: 'low', side: -.3, yaw: -.3 })],
            [W('ravi') - r0('rue') - .1, (l, k) => K.push(t31b, 'close', k, { h: 'low', side: -.3, yaw: -.3 })]], lt, dur('rue'));
    return K.ageBadge(t, r0('rue'), 800, 600, 31)
      + (t < W('traverse', 1) - .1 ? K.stamp(t, W('centime'), 490, 1030, 'SOLDE : 0,00 €', K.C.red, -5, 70) : '')
      + (t >= W('face') - .3 && t < W('dans') - .1 ? K.stamp(t, W("l'agence"), 490, 1030, "L'AGENCE POUR L'EMPLOI", K.C.panel, 4, 50) : '')
      + (t >= W('ravi') - .1 ? K.card(t, W('ravi'), 490, 980, 620, ['📱 « RAVI D\'ANNONCER', 'MON NOUVEAU DÉFI ! »']) : ''); },
  // l'agence : son conseiller, c'est Kévin
  agence(t, lt) { hideAll(); const d = AG.desks[2];
    kevinC.hide(false).at(AG.x, 7, 0); kevinC.pose(t < W('sourit') ? 'cross' : 'present', t).setFace(t < W('sourit') ? 'flat' : 'smug', t);
    t31b.hide(false).at(AG.x + .4, 12.4, Math.PI); t31b.pose(t < W('kévin', 1) ? 'idle' : 'scared', t).setFace(t < W('kévin', 1) ? 'worried' : 'shock', t);
    K.cuts([[0, (l, k) => K.orbit(kevinC, 'full', 1.15, .95, k, { h: 'eye', dist: 1.5 })],
            [W('kévin', 1) - r0('agence') - .1, (l, k) => K.push(kevinC, 'medium', k, { h: 'low', side: .3, yaw: .35 })],
            [W('stagiaire', 1) - r0('agence') - .1, (l, k) => K.push(t31b, 'medium', k, { h: 'eye', yaw: .5, side: .1 })],
            [W('sourit') - r0('agence') - .1, (l, k) => K.push(kevinC, 'close', k, { h: 'low', side: -.15, yaw: .3 })]], lt, dur('agence'));
    return (t < W('sourit') - .1 ? K.card(t, W('conseiller'), 490, 1000, 500, ['👔 CONSEILLER :', 'KÉVIN (EX-STAGIAIRE)']) : '')
      + (t >= W('sourit') - .1 ? K.card(t, W('travail', 1), 490, 1090, 640, ['« DU TRAVAIL ?', 'TRAVERSE LA RUE »']) : ''); },
  chute(t, lt) { const d = AG.desks[2]; hideAll(); kevinC.hide(false).at(AG.x, 7, 0).pose('laugh', t).setFace('laugh', t);
    t31b.hide(false).at(AG.x + .4, 12.4, Math.PI).pose('cry', t).setFace('cry', t);
    K.cuts([[0, (l, k) => K.move(t31b, 'full', 'medium', k, { h: 'eye', yaw: .5, side: .2 }, { h: 'eye', yaw: .4, side: .05 })]], lt, dur('chute'));
    return K.card(t, r0('chute'), 490, 700, 560, ['« NOUVEAU', 'DÉFI »']) + K.stamp(t, W('bouffon'), 490, 1040, 'BOUFFON', K.C.red, 7, 100); },
  fin(t, lt) { hideAll(); cross(t31b, 1); t31b.pose('cry', t).setFace('cry', t); file.forEach((v, i) => v.hide(false).pose('laugh', t + i).setFace('laugh', t));
    K.drone(V(AX + 8, 5, 15), V(AX + 14, 10, 24), V(AX, 3, 2), V(AX, 3, 3), lt / dur('fin'), 56);
    return K.stamp(t, W('abonne-toi'), 490, 720, 'ABONNE-TOI', K.C.red, -6, 90) + K.card(t, W('demain'), 490, 1000, 560, ['DEMAIN :', 'UN AUTRE CLICHÉ']); },
};
const MOODS = { hook: 'day', question: 'day', ecole: 'golden', startup: 'interior', stagiaire: 'night', scene: 'golden', rue: 'dusk', agence: 'interior', chute: 'interior', fin: 'dusk' };
K.start({ scenes: SC, moods: MOODS });
