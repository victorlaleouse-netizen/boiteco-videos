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
 "hook": "Accroche affichée en gros sur bandeau jaune pendant les 3 premières secondes (≤ 8 mots)",
 "outro_q": "Question au spectateur pour les commentaires",
 "holo": {"title": "≤ 22 car.", "sub": "≤ 12 car.", "rows": [["✔|⚠|✖", "libellé ≤ 22 car.", "valeur courte", "#6ee7a0|#ffb74d|#ff6b6b"], …3 ou 4 lignes]},
 "caption": "Légende TikTok + 5-7 hashtags (#ia #claude …)",
 "tiktok_title": "≤ 60 car.",
 "lines": [ {"f":"01.mp3","who":"claude|boss","text":"sous-titre exact","say":"texte envoyé à ElevenLabs (peut contenir des tags d'émotion entre crochets)","shot":"wide|bot|boss|holo","emo":"…","act":"wave|jump","holo":{"show":true,"visible":2,"hi":-1},"pause_after":0.5} ]
}
```
Règles d'écriture (le plus important : retenir le spectateur dès la 1re seconde) :
- **Hook** (champ `hook`) : ≤ 8 mots, qui pose un PROBLÈME ou une promesse concrète que le spectateur vit lui-même, ou une phrase choc/intrigante. Exemples : « Tu perds 2 h par jour dans tes mails ? », « Mon IA a refusé de bosser pour moi », « Personne ne connaît ce réglage de Claude », « J'ai viré mon assistante… enfin presque ». Jamais de titre plat (« Le rapport du lundi » ❌).
- **Réplique 1 = le problème, tout de suite** : pas de « Bonjour », pas de mise en place. Le patron (ou Claude) attaque direct sur la galère (« Claude, j'ai 200 mails non lus et un client qui hurle ! »). En 5 secondes, on doit avoir compris le problème et avoir envie de voir la solution.
- Structure : problème (0-5 s) → tension / mauvaise idée du patron → solution concrète de Claude (ce que fait vraiment l'IA, l'astuce, le connecteur) → rebondissement → chute drôle (réplique finale courte et punchy).
- **Rythme** : répliques COURTES (5 à 14 mots, jamais plus de 18), ping-pong rapide, beaucoup de réactions du patron. 18 à 24 répliques, **1 000 à 1 250 caractères au total** de `text` (≈ 55-60 s de voix ; la vidéo fait ≥ 61 s avec l'outro).
- Claude : calme, précis, pince-sans-rire, honnête sur ses limites. Patron : expressif, de mauvaise foi, dépassé, il ne se rend pas compte de tout ce qu'il automatise déjà.
- `text` = ce qui s'affiche en sous-titres (découpé automatiquement en petits groupes de 1 à 3 mots synchronisés). Pas de crochets. `say` = même phrase, éventuellement 1 tag d'émotion en tête : `[surpris]`, `[choqué]`, `[agacé]`, `[paniqué]`, `[pensif]`, `[touché]`, `[gêné]`, `[triomphant]`, `[doucement]`, `[il crie, outré]`. Nombres > 100 en lettres dans `say`.
- `shot` : changer de plan presque à chaque réplique (chaque changement = zoom « snap » + whoosh automatique). `boss` / `bot` pour les répliques, `holo` quand Claude montre des chiffres ou une démo, `wide` 2-3 fois max.
- `emo` (boss) ∈ surprised, shocked, triumph, awkward, sad, touched, rage. Utiliser beaucoup les émotions. `act` : `jump` (boss explose, pour la chute) ; `wave` seulement si Claude salue (rare).
- `holo` : `{"show": true, "visible": n, "hi": index}` révèle n lignes et fait clignoter la ligne `hi`. L'hologramme doit illustrer le problème ou la solution (ex. « Mails non lus 214 » → « Mails triés 214 ✔ »).
- `outro_q` : question qui pousse à commenter (« Et toi, combien de mails non lus ? »).

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
