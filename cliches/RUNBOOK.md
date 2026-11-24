# Série « Clichés » : runbook d'un épisode

Une vidéo TikTok verticale de 62 à 70 s (OBLIGATOIRE : plus d'une minute, sinon pas de rémunération TikTok) : « Voici X, le/la <cliché> », une mini-histoire racontée par une voix off, qui finit sur une chute où le personnage est rattrapé par ses contradictions. Style « Mid-century Cartoon » (bibliothèque Lemo-Opuscar, style 55) : personnages géométriques dessinés en code, aplats chauds, sous-titres mot à mot en capitales avec le mot clé en jaune. Référence : `episodes/c001_baptiste/` et `../videos/cliches_001.mp4`.

## 0. Garde-fous budget (avant tout)
- ElevenLabs : `account_get_usage`. Crédits restants = character_limit − character_count. S'il en reste moins de 1 500, ne fais rien et préviens Victor.
- Buffer : `list_posts` (organizationId 6b054fe1f6bf23fb46b084e9, channelIds [6b0550098541f09ecb86c06b], status ["scheduled"]). Si 10 posts sont déjà programmés, ne fais rien et préviens Victor.
- UNE SEULE prise de voix par vidéo (`generations_count: 1`). Ne régénère jamais une voix « pour mieux » : seulement si la génération a échoué, et une fois au maximum.

## 1. Mise en place (session neuve)
```sh
cd /home/claude/boiteco-videos && git pull
# bibliothèque de rendu Lemo-Opuscar
[ -f ~/lemo-opuscar/AGENTS.md ] || git clone --quiet --depth 1 --filter=blob:none --sparse --branch main https://github.com/lemomo-ai/lemo-opuscar.git ~/lemo-opuscar
cd ~/lemo-opuscar && git sparse-checkout set --no-cone '/*' '!/styles/*/demo/' '!/styleboard/' '!/docs/readme/' && git config lemo.managed true
sh plugin/skills/lemo-opuscar/scripts/setup.sh        # affiche LIB=...
sh plugin/skills/lemo-opuscar/scripts/setup.sh deps   # Node, Chromium, venv Python (quelques minutes)
# ffmpeg 7 (mux.sh le demande)
pip install --break-system-packages -q imageio-ffmpeg
mkdir -p ~/bin && ln -sf "$(python3 -c 'import imageio_ffmpeg,os;print(os.path.dirname(imageio_ffmpeg.__file__))')"/binaries/ffmpeg-linux-x86_64-v* ~/bin/ffmpeg
export PATH=~/bin:$PATH LIB=~/lemo-opuscar
```

## 2. Choisir le cliché
- Lis `cliches.log` : ne reprends jamais un personnage ni une chute déjà faits.
- Fais tourner l'échiquier, dans cet ordre de bords, en reprenant là où le log s'est arrêté : gauche, droite, centre / libéral, écolo, « apolitique », extrême gauche, extrême droite, réac, start-up nation, militant, puis on recommence. Exemples de personnages : l'insoumis en fac de socio qui vit chez ses parents, le néo-réac qui regrette « la France d'avant » depuis sa Tesla, l'écolo qui prend l'avion 6 fois par an, le macroniste de LinkedIn, le « je suis pas raciste mais », le militant qui fait la révolution sur Twitter, le boomer chaînes info, le souverainiste qui achète tout sur Amazon, le coach crypto anti-système, la bobo du 11e qui vote pour la décroissance, l'élu local qui inaugure un rond-point, le lycéen anar qui demande 50 € à papa…
- Personnages INVENTÉS avec un prénom courant. JAMAIS un vrai politicien, parti nommé de façon diffamatoire, journaliste ou personne réelle.

## 3. Écrire le texte (le plus important)
Ton : trash, mordant, cynique, limite, exactement comme les vidéos de référence que Victor a envoyées : on se moque sans pitié du cliché, de ses contradictions, de sa mauvaise foi, de son train de vie. Escalade absurde, détails ultra précis (prix, marques génériques, chiffres), retournements secs.
- 160 à 180 mots (≈ 55 à 60 s de voix, ≈ 1 000 à 1 100 crédits ElevenLabs), phrases courtes, présent de narration, voix off à la 3e personne. La durée finale passe au-dessus de 61 s grâce aux pauses comiques (section 5), pas en rallongeant la voix.
- Structure : accroche « Voici <Prénom>. <Le cliché> » → 2 ou 3 détails qui posent le personnage → 3 ou 4 scènes de sa vie (soirée, repas de famille, boulot, réseaux, manif, vacances…) → la contradiction qui monte → une chute sèche, ironique, qui le retourne contre lui-même → « Abonne-toi. Demain, c'est le tour d'un autre cliché. »
- Écris les nombres en lettres dans le texte envoyé à ElevenLabs. Tu peux mettre UNE balise d'intention ([amused], [sarcastic], [laughs softly]) au maximum deux fois.
- Limites qui ne bougent pas (elles protègent le compte et la rémunération) : on se moque des opinions, des postures et des modes de vie, jamais de l'origine, de la couleur de peau, de la religion, de l'orientation sexuelle, du genre ou d'un handicap ; pas d'insultes racistes, homophobes ou sexistes, pas de contenu sexuel, pas d'appel à la violence, pas de fausse information présentée comme vraie, pas de vraie personne. Gros mots légers tolérés (« bordel », « putain » une fois maximum), pas plus.
- Équilibre : sur toute la série, chaque bord doit en prendre autant.

## 4. Voix (ElevenLabs, connecteur)
1. `creative_create_flow` (nom « Clichés #NNN – Prénom »).
2. `creative_generate_speech` : flow_id, voice_id `3Tp5mYhT9wrfnry9pzvV` (Hugo – Punchy French Creator), model_id `eleven_v4`, `generations_count: 1`, prompt = le texte.
3. Attends ~25 s, puis `creative_get_flow_run_status` (flow_id, session_ids) → `media[0].url` ; télécharge-le avec curl en `voice/vo.mp3`, puis `ffmpeg -i voice/vo.mp3 -ar 48000 -ac 1 voice/vo.wav`.
4. `creative_transcribe_audio` (model_id `eleven_scribe_v1`, flow_id, connect_from [node_id de la voix]) — gratuit. Attends ~15 s, `creative_get_flow_run_status` → `transcripts[0].words_download_url` ; télécharge-le en `voice/words.json`.

## 5. Animation
- Crée `episodes/cNNN_<slug>/` ; copie `kit/toon.js`, `kit/fonts/`, `kit/make_timeline.py`, `kit/mix.py`, et `episodes/c001_baptiste/index.html` (tel quel : il charge timeline.js, toon.js, episode.js).
- Édite `make_timeline.py` : `PAUSES` (5 à 8 silences de 1 à 1,6 s après les mots qui portent un gag, pour laisser le visuel claquer ; c'est ce qui fait passer le film au-dessus de 61 s : le script affiche DUR et doit dire OK), la liste `S` (nom de scène, seconde de début ; une scène toutes les 3 à 5 s, calée sur le début d'une phrase dans words.json ; la dernière = la fin « Abonne-toi »), et `KEY` (les mots clés surlignés en jaune, en capitales). Lance-le.
- Écris `episode.js` sur le modèle de `episodes/c001_baptiste/episode.js` : un objet `SC` avec une fonction par scène qui renvoie du SVG, `GROUND` (couleur de fond par scène, on alterne coral, mustard, teal, powder, plum, olive, slate, sand), puis `startFilm(SC,GROUND)`. Outils de `toon.js` : `perso()` (personnage générique : cheveux, haut, lunettes, barbe, casquette, accessoire, bras), `baptiste/papa/maman` (exemples), `cel`, `card`, `tag`, `bubble`, `phone`, `slab`, `script`, `star`, `sparkle`, `sunburst`, `pop(t,t0,cx,cy,svg)` pour faire apparaître un élément sur le mot prononcé (`W('mot')` donne l'instant où le mot est dit). Chaque scène : un fond d'une couleur, le personnage, 1 ou 2 accessoires-gags qui apparaissent sur le bon mot (téléphone, ticket de caisse, pancarte, notification, prix…). Les sous-titres et les transitions sont automatiques. Les bras sont dessinés devant le corps et partent toujours vers l'extérieur : petit angle (≤ 40) = bras le long du corps, grand angle (90 à 170) = bras levé ; vérifie sur la planche que chaque personnage a ses deux bras visibles.
- Garde la zone des sous-titres libre (y 1560 à 1720) et rien d'important à droite entre y 800 et 1500 (icônes TikTok).

## 6. Rendu et contrôle
```sh
cd $LIB && P=/home/claude/boiteco-videos/cliches/episodes/cNNN_slug
node core/render/still.mjs $P <8 à 12 instants> --size 1080x1920
.venv/bin/python core/render/sheet.py /tmp/sheet.jpg $P/stills/*.jpg --cols 6 --w 280
```
REGARDE la planche : rien qui se chevauche (têtes cachées par une carte), textes lisibles, sous-titres dans le cadre, accessoires au bon moment. Corrige puis :
```sh
node core/render/video.mjs $P --size 1080x1920 --fps 24 --workers 4 --out $P/out/video.mp4
LIB=$LIB .venv/bin/python $P/mix.py      # édite d'abord la liste de mots à bruitages dans mix.py
sh core/render/mux.sh $P/out/video.mp4 $P/out/mix.wav /home/claude/boiteco-videos/videos/cliches_NNN.mp4 24 0
```
ffprobe : 1080×1920, une piste audio, durée STRICTEMENT supérieure à 61 s (sinon ajoute des pauses et refais le rendu). Supprime `$P/stills` et `$P/out` avant le commit (trop lourds).

## 7. Héberger et publier
- Ligne dans `cliches.log` : `AAAA-MM-JJ | cNNN | <Prénom>, <cliché> | <bord> | <chute en une phrase> | (programmé Buffer HH:MM)`.
- `git add` épisode + vidéo + log, commit (auteur Claude), `git push origin HEAD:main`. Vérifie que `https://raw.githubusercontent.com/victorlaleouse-netizen/boiteco-videos/main/videos/cliches_NNN.mp4` répond 200.
- Buffer `create_post` : channelId `6b0550098541f09ecb86c06b`, schedulingType `automatic`, mode `customScheduled`, dueAt aujourd'hui 19:00 heure de Paris (format `AAAA-MM-JJT19:00:00+01:00`, ou maintenant + 10 min si c'est passé), assets `[{"video":{"url":<url raw>}}]`, text = une phrase d'accroche qui donne envie + 1 ou 2 emojis + `#humour #cliché #politique #france #fyp`, metadata `{"tiktok":{"title":"Voici <Prénom>","isAiGenerated":true}}`. Vérifie avec `list_posts`.
