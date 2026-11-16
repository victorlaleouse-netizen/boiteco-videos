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
2. **Partir d'une vraie mise en situation de boulot, pas d'une nouveauté** (demande de Victor du 16/11). Choisir d'abord une galère concrète et universelle que le spectateur a déjà vécue (un client furieux, 200 mails non lus, un devis à rendre ce soir, une réunion qui part en vrille, un planning d'équipe impossible, une facture impayée, un fournisseur en retard, un recrutement, un salon demain, la compta de fin de mois…). Puis montrer comment l'IA, bien utilisée, la règle concrètement.
3. L'actu IA (2 ou 3 WebSearch sur les 7 derniers jours) ne sert qu'à **un épisode sur trois au maximum**, et toujours vécue dans une situation de ce type, jamais comme sujet en soi. Les autres épisodes utilisent des usages établis et vérifiés (rédiger/répondre à des mails, résumer, tableaux, agenda, connecteurs, tâches planifiées, projets, relire un contrat…).
4. Exactitude : n'affirmer que des faits trouvés dans les sources du jour ; rien d'inventé sur des produits réels ; pas de chiffres non sourcés (les chiffres « internes » de la boîte fictive sont libres). Pas de politique, pas de personnes réelles, pas de marques autres que les noms d'IA cités factuellement.

## 2 bis. Salle d'écriture : trouver une VRAIE histoire (obligatoire, demande de Victor du 16/11)
Victor veut des épisodes plus réfléchis : de vraies idées, de vraies discussions, de vraies histoires. Pas un enchaînement de répliques autour d'une fonction. Avant d'écrire le JSON :

1. **S'inspirer du réel** : 2 WebSearch sur des situations de bureau vécues (témoignages de salariés, galères de patrons de PME, anecdotes de clients, erreurs coûteuses, conflits d'équipe). On garde le mécanisme humain, jamais l'anecdote telle quelle, jamais de vraie personne ni d'entreprise réelle.
2. **Écrire 3 pitchs** (brouillon dans /tmp, pas dans le dépôt), chacun en 5 lignes :
   - la situation en une phrase (lieu, heure, enjeu) ;
   - ce que le personnage VEUT concrètement, et ce que ça lui coûte s'il échoue ;
   - l'obstacle, et pourquoi Claude ou un collègue n'est pas d'accord (les deux camps ont un vrai argument) ;
   - le retournement du milieu : une info qui change le sens de la scène ;
   - la fin : ce qui a changé pour un humain, et la dernière réplique.
3. **Noter chaque pitch sur 5** pour : vécu (le spectateur l'a déjà vécu), enjeu, surprise, astuce réelle utile, fin qu'on a envie de citer. Garder le meilleur (au moins 18/25). Sinon, réécrire les pitchs.
4. **Règles d'histoire** :
   - un personnage veut quelque chose, quelqu'un s'y oppose ;
   - l'IA n'est pas magique : elle a une limite, un prix ou un avis contraire ;
   - un détail posé au début (un prénom, un chiffre, un objet) revient et compte à la fin ;
   - la fin change quelque chose et ne dit pas la morale à voix haute.
5. **Règles de dialogue** :
   - les gens ne s'expliquent pas : sous-entendus, mauvaise foi, silences (`pause_after`) ;
   - chaque réplique répond à la précédente, aucune réplique « pour informer le spectateur » ;
   - chaque personnage a sa voix : le patron (images, exagérations, mauvaise foi), Claude (sec, précis, honnête), Sandrine (factuelle, pince-sans-rire), Léo (décontracté, malin) ;
   - au moins une réplique qu'un vrai patron ou un vrai collègue dirait mot pour mot ;
   - pas de formules d'IA génériques (« Excellente question », « Je comprends votre frustration ») ;
   - lire le dialogue à voix haute dans sa tête : s'il sonne écrit, réécrire.
6. **Relecture critique** avant les voix (les voix coûtent des crédits) :
   - relire comme un spectateur exigeant : regarderait-il encore à 3 s, à 10 s, à 30 s ?
   - chaque réplique est-elle nécessaire, et la fin est-elle méritée ?
   - corriger au moins une fois.
   Interdits : visite guidée d'une fonction, Claude qui fait la promo d'un produit, patron simplement émerveillé, morale énoncée à la fin.

## 3. Écrire l'épisode → `episodes/epNNN_slug.json`
NNN = numéro suivant (regarder le dossier). Même schéma que `episodes/ep001_rapport_du_lundi.json` :
```json
{
 "title": "…", "episode": NNN,
 "hook": "copie exacte du text de la réplique 1 (pour le journal ; rien n'est affiché à l'écran)",
 "outro_q": "Phrase finale affichée sur l'écran de fin : une punchline ou une phrase culte de l'épisode, JAMAIS une question au spectateur",
 "holo": {"cards": [ …1 à 3 écrans d'exemples concrets, voir « Hologramme » ci-dessous… ]},
 "caption": "Légende TikTok : une phrase intrigante ou la situation en une ligne (pas de question au spectateur, pas de « commente/partage »), puis 5-7 hashtags (#ia #claude …)",
 "tiktok_title": "≤ 60 car.",
 "lines": [ {"f":"01.mp3","who":"claude|boss","text":"sous-titre exact","say":"texte envoyé à ElevenLabs (peut contenir des tags d'émotion entre crochets)","shot":"wide|bot|boss|holo","emo":"…","act":"wave|jump","holo":{"show":true,"card":0,"visible":2,"hi":-1},"pause_after":0.5} ]
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
- **Compréhensible par tout le monde** : le spectateur doit comprendre sans rien connaître à l'IA. Pas de jargon ni de nom de fonction lâché sans montrer ce que ça fait (« Claude Meetings bêta » ❌ → « Claude, va à la réunion à ma place et note qui fait quoi » ✔). Chaque réplique fait avancer l'histoire ; on doit pouvoir la raconter en une phrase à un ami.

### Hologramme = un VRAI exemple à l'écran, pas une liste (demande de Victor du 16/11)
L'écran du milieu montre concrètement ce que fait l'IA : le message tapé à Claude et sa réponse, le mail qu'elle a rédigé, l'agenda réorganisé, le tableau corrigé, le compte rendu. 1 à 3 écrans par épisode (`cards`), qui s'enchaînent au fil de l'histoire. Types disponibles :
- `chat` : la conversation avec Claude. `{"type":"chat","title":"Claude","sub":"chat","items":[{"from":"me","text":"Réponds au client furieux, poli mais ferme."},{"from":"ai","text":"Voici la réponse : on reconnaît le retard et on offre 10 %…"}]}` (4 bulles max visibles, textes courts ≤ 120 car.)
- `email` : le mail rédigé. `{"type":"email","title":"Brouillon prêt","sub":"Gmail","items":["m.garnier@client.fr","Votre commande n°4512","Bonjour Madame Garnier,","Nous sommes désolés pour ce retard…","Bien cordialement,"],"status":"✔ Prêt à envoyer"}` (items = destinataire, objet, puis lignes du corps)
- `calendar` : l'agenda de la semaine. `{"type":"calendar","title":"Semaine du patron","sub":"Agenda","h0":8,"items":[[jour 0-4, heure début, heure fin, "libellé court", "#couleur"], …]}` (événements d'au moins 1 h 30 pour que le texte tienne)
- `table` : un tableau. `{"type":"table","title":"Devis en retard","sub":"Sheets","cols":["Client","Montant","Retard"],"items":[["Dupuis","4 200 €","6 j"], …]}` (≤ 7 lignes, 2 à 4 colonnes)
- `compare` : avant / après. `{"type":"compare","title":"Avant / Après","left":{"label":"Avant","items":["2 h de mails par jour", …]},"right":{"label":"Avec Claude","items":["15 min de tri", …]}}`
- `doc` : un document, un compte rendu, un contrat relu. `{"type":"doc","title":"Compte rendu","sub":"Réunion","items":["• Décision : …","• Sandrine gère …"]}`
- `list` : uniquement pour un compteur qui grimpe (escalade par paliers). Mêmes champs qu'avant : `{"type":"list","title":"…","sub":"…","items":[["✔","libellé","valeur","#6ee7a0"], …]}`
Dans `lines`, une réplique `holo` choisit l'écran et ce qui est révélé : `{"show": true, "card": 0, "visible": n, "hi": i}` → affiche l'écran n° `card`, révèle ses `n` premiers éléments (bulles, lignes de mail, événements, lignes de tableau…) et fait clignoter l'élément `i` (-1 = aucun). Révéler progressivement sur 2 ou 3 répliques (ex. la question du patron, puis la réponse de Claude). Les textes de l'hologramme sont lisibles à l'écran : phrases courtes, chiffres et prénoms précis, cohérents avec le dialogue. `"show": false` cache l'hologramme.
- `outro_q` : la punchline de l'épisode, affichée sur l'écran de fin (ex. « Le café n'est pas une dépense inutile. »). **Jamais de question posée au spectateur**, ni à l'écran, ni dans la légende, ni dans les dialogues (« Et toi… ? », « Dis-moi en commentaire » ❌).

### Faire réagir sans demander (commentaires et partages) — demande de Victor du 16/11
On ne demande jamais de commenter ou de partager : c'est l'histoire elle-même qui doit donner envie. Chaque épisode contient au moins DEUX de ces déclencheurs :
- **Identification « c'est trop mon boss / mon collègue »** : un comportement de bureau ultra reconnaissable (le patron qui répond « vu » à 23 h, la réunion qui aurait pu être un mail, le collègue qui met tout le monde en copie, la relance « comme convenu »). Les gens identifient quelqu'un et partagent la vidéo.
- **Un débat qui divise, sans réponse donnée** : la fin laisse deux camps possibles (« L'IA a eu raison de refuser ? », « Le patron a-t-il triché ? ») sans trancher : les gens viennent donner leur avis d'eux-mêmes.
- **Le « je savais pas que ça existait »** : une astuce ou un usage concret, vrai et vérifiable, que la plupart des gens ignorent (montré à l'hologramme). Les gens enregistrent et envoient à un collègue.
- **Une réplique culte** courte et répétable (la punchline de fin, qu'on a envie de citer en commentaire).
- **Un détail à repérer** : un élément drôle glissé à l'hologramme (une ligne du tableau, un événement de l'agenda, une phrase du mail) que les plus attentifs remarquent.
- **Une décision discutable du patron ou de Claude** (moralement limite mais inoffensive), qui fait réagir.
- **Une fin un peu ouverte ou un retournement** qu'on a envie de commenter (« attends, c'est Sandrine qui avait tout prévu ? »).
Interdits : pousser à l'engagement de façon artificielle (« like si… », « partage à… », « commente… »), fausses informations ou erreurs volontaires pour provoquer, sujets politiques, moqueries d'un groupe de personnes.

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
Le stagiaire (Léo), l'employée (Sandrine) et la femme du patron (Claire) peuvent apparaître à l'écran (voir « Personnages secondaires ») ; les autres (clients, fournisseurs) existent par les dialogues ou un message sur l'hologramme.

### Personnages secondaires (optionnels : seulement quand l'histoire en a besoin, pas à chaque épisode — en gros 1 épisode sur 3 au plus)
Ajouter `"cast": ["sandrine"]` (1 ou 2 noms max) au JSON de l'épisode ; sans `cast`, seuls le patron et Claude sont là. Un personnage du cast entre dans le décor (il glisse depuis le côté) juste avant sa première réplique, ou à la réplique qui porte `"enter": "<id>"` s'il doit être là avant de parler. Le 1er nom du cast se place derrière le patron (à droite), le 2e derrière Claude (à gauche) ; tous deux sont visibles en plan `wide`.
- `sandrine` : l'employée (compta, admin, qualité), la quarantaine, chignon roux et lunettes, pull vert. Pince-sans-rire, c'est elle qui vérifie et rattrape les erreurs. Voix `1TLYDjqJQ2RtnaajKcoY` (Charlotte, accent du Sud). Sous-titres vert d'eau.
- `leo` : le stagiaire, la vingtaine, sweat à capuche gris-bleu. Débrouillard, il a souvent déjà automatisé des choses sans rien dire. Voix `Ayvd8fDj52DfUWXZeAFe` (Nathan, détendu). Sous-titres bleu clair.
- `claire` : la femme du patron, cheveux blonds longs, manteau bordeaux et écharpe (elle passe au bureau). Tendre et lucide, pour les épisodes « vie perso / heure tardive ». Voix `NEjemlRxgWmL5ZGJetsB` (Claire, chaleureuse). Sous-titres rose clair.
Dans `lines` : `"who": "sandrine"` (etc.), `"shot": "sandrine"` pour un plan sur elle, `emo` ∈ surprised, shocked, triumph, awkward, sad, touched, rage. Les autres plans (`boss`, `bot`, `holo`, `wide`) restent disponibles ; mettre au moins un `wide` quand un secondaire est présent pour montrer tout le monde.

## 4. Voix (connecteur ElevenLabs, modèle `eleven_v4`)
- Claude : `SFB33nwu9KAKT7Dy3QNg` (Lucien). Patron : `3Tp5mYhT9wrfnry9pzvV` (Hugo). Secondaires : voir « Personnages secondaires ».
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
  `tiktokData: {"privacyOption":"PUBLIC_TO_EVERYONE","title": tiktok_title,"isAigc": false, "autoAddMusic": false}` (mention IA NON cochée : Victor l'ajoute lui-même à la main, demande du 16/11),
  si YouTube : `youtubeData: {"title": tiktok_title, "type":"short", "privacy":"public", "madeForKids": false, "isAiGeneratedContent": false, "category":"COMEDY"}` (idem, Victor gère la mention lui-même).
- Après l'heure de publication, `getScheduledPosts` pour lire le statut / `publicUrl` ; mettre le lien dans `episodes.log` (commit).

## 9. Compte rendu
Message final court : titre, sujet, lien TikTok (ou statut), crédits ElevenLabs restants.

## Arrêts (prévenir l'utilisateur et ne rien publier)
- Crédits ElevenLabs insuffisants, connecteur ElevenLabs ou Metricool indisponible, `elevenlabsusercontent.com` ou `raw.githubusercontent.com` injoignables, push GitHub refusé, rendu en échec deux fois, vidéo < 60 s.

## Finition motion design (déjà dans le kit, ne pas casser)
Émotions du patron fondues avec léger dépassement (easeOutBack), anticipation de Claude quand il prend la parole, caméra fluide (push-in, léger travelling latéral, respiration « caméra à l'épaule », zoom + traînée de mouvement sur chaque changement de plan), hologramme qui s'ouvre avec scintillement, éléments qui glissent/apparaissent un par un, texte de Claude et des mails tapé en direct avec curseur, lignes de balayage, sous-titres en « pop » à ressort avec ombre, étalonnage (vignettage + grain léger), écran de fin flouté avec logo, punchline mot à mot et bouton « Abonne-toi ». Pour en profiter, révéler l'hologramme progressivement (une bulle / une ligne / un événement par réplique `holo`) plutôt que tout d'un coup.
