# Boîte & Co : fabriquer et publier UN épisode (mode automatique)

Série TikTok (compte **lebonticket**) en 3D cartoon : un **patron** de PME et **Claude**, l'IA (petit bloc orange) qui gère sa boîte.
Chaque exécution produit **un épisode indépendant** (pas de suite, jamais « épisode 2 », pas de numéro affiché), le rend en MP4 1080×1920 ≥ 60 s et le publie via Metricool.
Personne n'est là pour valider : suivre ce document à la lettre, décider seul, et ne s'arrêter que sur un vrai blocage (voir « Arrêts »).

## 0. Mise en place (≈1 min)
```bash
cd /home/claude && git clone --depth 1 https://github.com/victorlaleouse-netizen/boiteco-videos   # après add_repo(push)
cd boiteco-videos/kit && npm install --silent
ln -sf /opt/npm-tools/node_modules/playwright node_modules/playwright
ln -sf /opt/npm-tools/node_modules/playwright-core node_modules/playwright-core
nohup python3 -m http.server 8765 >/tmp/http.log 2>&1 &
```
Outils requis : node, google-chrome (/usr/bin/google-chrome), ffmpeg, python3 + numpy. Réseau : `elevenlabsusercontent.com` doit répondre (sinon voir Arrêts).

## 1. Crédits ElevenLabs
`account_get_usage` (connecteur ElevenLabs). Il faut **≥ 1 300 caractères restants** (character_limit − character_count). Sinon : Arrêt.

## 2. Choisir le sujet
1. Lire `episodes.log` : ne pas refaire un sujet/une chute déjà utilisés dans les 30 dernières entrées.
2. Faire 2 à 4 WebSearch sur l'actu IA des 7 derniers jours (nouveaux modèles, nouvelles fonctions de Claude/ChatGPT/Gemini, connecteurs, agents, régulation, usages en entreprise).
3. Choisir UN angle parmi (en alternant d'un épisode à l'autre) :
   - **Actu** : une vraie nouveauté expliquée simplement et testée « dans la boîte ».
   - **Galère du quotidien** que tout le monde a (mails, réunions, devis, planning, compta, SAV) et comment l'IA l'automatise.
   - **Connecteurs / astuces peu connues** qui changent l'usage (agenda, mails, Drive, CRM, tâches planifiées…).
   - **Le patron ne se rend pas compte** de tout ce qu'il a déjà automatisé et qu'il est devenu plus productif.
   - **Mini-débat** (travail, emploi, confiance, erreurs de l'IA, ce qui reste humain) avec une chute drôle.
4. Exactitude : n'affirmer que des faits trouvés dans les sources du jour ; rien d'inventé sur des produits réels ; pas de chiffres non sourcés (les chiffres « internes » de la boîte fictive sont libres). Pas de politique, pas de personnes réelles, pas de marques autres que les noms d'IA cités factuellement.

## 3. Écrire l'épisode → `episodes/epNNN_slug.json`
NNN = numéro suivant (regarder le dossier). Même schéma que `episodes/ep001_rapport_du_lundi.json` :
```json
{
 "title": "…", "episode": NNN,
 "hook": "copie exacte du text de la réplique 1 (pour le journal ; rien n'est affiché à l'écran)",
 "outro_q": "Question au spectateur pour les commentaires",
 "holo": {"title": "≤ 22 car.", "sub": "≤ 12 car.", "rows": [["✔|⚠|✖", "libellé ≤ 22 car.", "valeur courte", "#6ee7a0|#ffb74d|#ff6b6b"], …3 ou 4 lignes]},
 "caption": "Légende TikTok + 5-7 hashtags (#ia #claude …)",
 "tiktok_title": "≤ 60 car.",
 "lines": [ {"f":"01.mp3","who":"claude|boss","text":"sous-titre exact","say":"texte envoyé à ElevenLabs (peut contenir des tags d'émotion entre crochets)","shot":"wide|bot|boss|holo","emo":"…","act":"wave|jump","holo":{"show":true,"visible":2,"hi":-1},"pause_after":0.5} ]
}
```
Règles d'écriture (le plus important : retenir le spectateur dès la 1re seconde) :
- **Le hook = la toute première phrase prononcée** (réplique 1, pas de bandeau à l'écran) : ≤ 10 mots, dite avec émotion, qui pose un PROBLÈME concret que le spectateur vit lui-même, ou une phrase choc/intrigante. Exemples : « Claude, j'ai 214 mails non lus et un client qui hurle ! », « Pourquoi t'as refusé de faire mon devis ?! », « Attends… tu peux lire mon agenda, toi ?! », « Qui a annulé ma réunion de 8 h ?! ». Jamais de « Bonjour », jamais de mise en place.
- En 5 secondes, on doit avoir compris le problème et avoir envie de voir la solution. Réplique 1 souvent au patron, en plan `boss`, avec une `emo` forte (shocked, rage, surprised).
- Structure : problème (0-5 s) → tension / mauvaise idée du patron → solution concrète de Claude (ce que fait vraiment l'IA, l'astuce, le connecteur) → rebondissement → chute drôle (réplique finale courte et punchy).
- **Rythme** : répliques COURTES (5 à 14 mots, jamais plus de 18), ping-pong rapide, beaucoup de réactions du patron. 18 à 24 répliques, **1 000 à 1 250 caractères au total** de `text` (≈ 55-60 s de voix ; la vidéo fait ≥ 61 s avec l'outro).
- Claude : calme, précis, pince-sans-rire, honnête sur ses limites. Patron : expressif, de mauvaise foi, dépassé, il ne se rend pas compte de tout ce qu'il automatise déjà.
- `text` = ce qui s'affiche en sous-titres (découpé automatiquement en petits groupes de 1 à 3 mots synchronisés). Pas de crochets. `say` = même phrase, éventuellement 1 tag d'émotion en tête : `[surpris]`, `[choqué]`, `[agacé]`, `[paniqué]`, `[pensif]`, `[touché]`, `[gêné]`, `[triomphant]`, `[doucement]`, `[il crie, outré]`. Nombres > 100 en lettres dans `say`.
- `shot` : changer de plan presque à chaque réplique (chaque changement = zoom « snap » + whoosh automatique). `boss` / `bot` pour les répliques, `holo` quand Claude montre des chiffres ou une démo, `wide` 2-3 fois max. Les plans sont volontairement larges (on voit le décor et les deux persos) et le décor est un bureau de nuit sombre et feutré : ne pas revenir à des gros plans serrés ni à un décor clair et coloré (demande de Victor du 15/11).
- `emo` (boss) ∈ surprised, shocked, triumph, awkward, sad, touched, rage. Utiliser beaucoup les émotions. `act` : `jump` (boss explose, pour la chute) ; `wave` seulement si Claude salue (rare).
- `holo` : `{"show": true, "visible": n, "hi": index}` révèle n lignes et fait clignoter la ligne `hi`. L'hologramme doit illustrer le problème ou la solution (ex. « Mails non lus 214 » → « Mails triés 214 ✔ »).
- `outro_q` : question qui pousse à commenter (« Et toi, combien de mails non lus ? »).

Inspirations narratives (référence : compte @system_ia, analysé le 15/11) :
- **Le fond de chaque épisode : ce que donne l'IA quand quelqu'un la pousse bien.** Un humain de la boîte (le patron ou un employé) l'utilise intelligemment : il délègue une tâche entière, crée ses propres agents, branche un connecteur, planifie une tâche, et surtout **vérifie** ce que fait l'IA. Le spectateur doit repartir avec UNE façon concrète de mieux s'en servir (réutilisable chez lui), montrée dans l'histoire et pas expliquée comme un tuto. Uniquement des usages qui existent vraiment (vérifiés dans les sources du jour ou documentés).
- **Hook = un ordre donné à Claude, suivi d'une réponse inattendue dans les 2 s.** Ex. « Claude, remplace Thomas. » → « C'est déjà fait. » / « Claude, fais la réunion à ma place. » / « Claude, un client me commande dix fois plus pour lundi. » La surprise de la 2e réplique tient le spectateur.
- **Montrer l'actu en scène, sans l'expliquer** : la nouveauté de la semaine est vécue dans une situation (Claude rejoint un appel vidéo, Claude lance cent agents pour tenir un délai), jamais présentée comme une fiche produit.
- **Escalade par paliers** : « Et de deux… Et de trois… Sept. » L'hologramme se remplit à chaque palier (une ligne de plus par réplique `holo`).
- **Du concret ultra-précis** : des prénoms d'employés de la boîte (fictifs : Sandrine, Thomas, Inès…), des heures et des chiffres exacts (« 210 commandes traitées à 6 h 12 », « 44 119 € »). Ça rend l'histoire crédible.
- **Une question humaine avant la fin** (« Et le vrai Thomas, il fait quoi ? », « Et les cent agents, ils deviennent quoi ? ») et une **chute tendre ou ironique qui donne le beau rôle à un humain** (« Pour Sandrine, qui a tout vérifié. »), pas seulement une colère du patron.
- **Varier les registres**, pas que la comédie : certains épisodes sont tendres. Ex. (@system_ia) : minuit, le patron veut finir le devis Ferreira, sa femme vient le chercher ; on découvre que Claude lui écrit depuis 22 h « Va te coucher, ta femme t'attend », programme les relances pour 8 h (tâche planifiée) et conclut : « Demain soir, il est à vous. » L'IA est du côté de la vie de l'humain.
- **Rythme lent → rapide → lent** (leçon motion design @troiscoups) : poser la situation calmement, accélérer pendant l'escalade (répliques de 2-4 mots, plans qui s'enchaînent), ralentir pour la chute (une pause `pause_after` de 0,6 à 0,9 s juste avant la dernière réplique).
- **Moins de cris** : ton plus posé, chuchoté, pince-sans-rire ; `[il crie, outré]` au plus une fois par épisode, souvent zéro. Répliques encore plus courtes quand c'est possible (2 à 8 mots).

### Banque de contextes et d'histoires (s'en servir, varier, ne jamais reprendre telle quelle une histoire de @system_ia)
Chaque histoire = un **contexte** (moment + enjeu humain) + **un vrai usage de l'IA** + **une chute humaine**. Toujours vérifier que la fonction existe vraiment avant de l'utiliser.
- **Minuit au bureau** : le patron s'acharne sur un devis ; Claude a déjà programmé les relances pour 8 h et le renvoie chez lui. (tâches planifiées)
- **Le patron part en vacances** : il prépare 3 pages de consignes ; Claude a déjà trié les mails, préparé les réponses, il ne reste qu'à valider. Chute : il revient, rien n'a brûlé… sauf sa plante. (connecteurs mail/agenda)
- **Le stagiaire qui en sait plus que le patron** : le patron découvre que le stagiaire a monté ses propres assistants pour ses tâches répétitives ; au lieu de s'énerver, il lui demande de le faire pour toute la boîte. (agents / projets)
- **La réunion de trop** : le patron veut une réunion d'une heure pour un sujet ; Claude a déjà lu tous les échanges et résume en trois lignes ce qui est décidé. (lecture des fils de mails / documents)
- **Le client qui hurle** : 40 messages en colère ; Claude retrouve la commande, la facture et la livraison avant que le patron ait fini de paniquer ; c'est l'humain qui appelle le client pour s'excuser. (connecteurs)
- **Le salon / la tournée terrain** : le patron est dans sa voiture entre deux clients ; Claude lui prépare chaque rendez-vous (historique, dernier devis) avant qu'il sorte de la voiture.
- **L'erreur de l'IA** : Claude se trompe (un chiffre, un nom) ; l'employée qui relit l'attrape ; leçon : on vérifie toujours, et le patron découvre que c'est elle la vraie garantie de qualité.
- **L'anniversaire de la boîte** (ou d'un salarié) : tout le monde a oublié sauf Claude… qui n'a pas le droit de commander un gâteau sans validation. Chute tendre.
- **La nouveauté de la semaine** (actu du jour) : vécue dans une scène concrète, jamais expliquée comme une fiche produit.
- **Le patron qui ne se rend pas compte** : il se plaint de « tout faire tout seul » ; Claude lui montre la liste de tout ce qui tourne déjà sans lui.
Contraintes du kit actuel : seuls le patron et Claude sont à l'écran ; les autres (stagiaire, employée, conjoint, client) existent par ce qu'en disent les personnages, par un message affiché sur l'hologramme (ex. « Sandrine : 3 erreurs corrigées »), ou ne sont pas montrés.

## 4. Voix (connecteur ElevenLabs, modèle `eleven_v4`)
- Claude : `SFB33nwu9KAKT7Dy3QNg` (Lucien). Patron : `3Tp5mYhT9wrfnry9pzvV` (Hugo).
- `creative_create_flow` (nom = titre), puis `creative_generate_speech` une fois par réplique avec `prompt = say` et **`generations_count: 1`** (une seule prise par réplique : choix explicite de Victor pour économiser les crédits ; ne jamais relancer une génération réussie).
- `creative_get_flow_run_status` avec la 1re session_id de chaque réplique → `content_url` de la prise.
- Télécharger dans l'ordre : `curl -sS -o audio/NN.mp3 "<content_url>"` (dossier `kit/audio_epNNN/`).

## 5. Rendu
```bash
cd kit
python3 prepare.py ../episodes/epNNN_slug.json audio_epNNN build/epNNN
nohup node render.mjs build/epNNN > /tmp/render.log 2>&1 &   # ≈ 25 min, NE PAS lancer au premier plan
```
Surveiller avec `sleep 300; tail -2 /tmp/render.log` jusqu'à `done`. Résultat : `build/epNNN/video_tmp.mp4`.
Le titre de l'outro vient de `outro_q`.

## 6. Contrôle qualité (obligatoire)
- `ffprobe` : durée ≥ 60 s, vidéo 1080×1920 + piste audio.
- Extraire 5 images (ffmpeg -ss) et les regarder : personnages visibles, sous-titres lisibles et corrects, hologramme cohérent. Si un défaut grave : corriger le JSON et relancer le rendu (une seule fois).

## 7. Héberger
Copier en `videos/epNNN_slug.mp4`, ajouter le JSON, ajouter une ligne à `episodes.log` (`date | midi|soir | fichier | sujet | lien`), commit (auteur Claude) et `git push`.
URL publique : `https://raw.githubusercontent.com/victorlaleouse-netizen/boiteco-videos/main/videos/epNNN_slug.mp4` (vérifier 200 avec curl).

## 8. Publier (connecteur Metricool, blogId `8124259`, timezone Europe/Paris)
- `getBrandSettings` : réseaux connectés. Toujours `tiktok` ; ajouter `youtube` si une chaîne YouTube est connectée.
- `createScheduledPost` : date = créneau du jour (**12:30** pour la tâche de midi, **18:30** pour celle du soir ; si l'heure est déjà passée, maintenant + 5 min), `autoPublish: true`, `media: [url]`, `text: caption`,
  `tiktokData: {"privacyOption":"PUBLIC_TO_EVERYONE","title": tiktok_title,"isAigc": true, "autoAddMusic": false}`,
  si YouTube : `youtubeData: {"title": tiktok_title, "type":"short", "privacy":"public", "madeForKids": false, "isAiGeneratedContent": true, "category":"COMEDY"}`.
- Après l'heure de publication, `getScheduledPosts` pour lire le statut / `publicUrl` ; mettre le lien dans `episodes.log` (commit).

## 9. Compte rendu
Message final court : titre, sujet, lien TikTok (ou statut), crédits ElevenLabs restants.

## Arrêts (prévenir l'utilisateur et ne rien publier)
- Crédits ElevenLabs insuffisants, connecteur ElevenLabs ou Metricool indisponible, `elevenlabsusercontent.com` ou `raw.githubusercontent.com` injoignables, push GitHub refusé, rendu en échec deux fois, vidéo < 60 s.
