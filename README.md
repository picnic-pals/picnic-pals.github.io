# Blob Arcade

A small, offline learning arcade for young kids (about 3–8). Plain HTML/CSS/JS: no build step, no internet, no ads,
accounts or analytics. Everything is saved in this browser (progress in localStorage, voice recordings in IndexedDB).

**Players:** there are no preset players. On the first visit the hub opens "+ New player": type a name (e.g. "Player 1"),
pick an age and a blob. The age drives the subject mix (5 and under: early concepts / letters / math; 6+: mostly math) and the
starting math skill (6+ start at "Adding to 10"). Players' names are spoken by the browser's speech voice (there are no name
clips); without a speech voice the games say "Welcome back!" / "Player 1" / "Player 2" instead.

## Open it
- **Easiest:** double-click `index.html` (Chrome or Edge work fully from `file://`).
- **Local server** (best for Safari/Firefox, and needed for the mic in some browsers): `python3 -m http.server` in this folder, then open http://localhost:8000
- **Hosting:** upload the whole `arcade/` folder to any static host (GitHub Pages, Netlify, S3…). All paths are relative, so it also works in a sub-folder.

Kids: tap/click your blob (or make one with the big **+ New player** tile) → pick a game. Grown-ups: **press and hold the gear** (top-right) → answer the multiplication question.

## What's here
```
index.html                 hub: who's playing (+ New player, ✏️ Edit players) → game picker → sticker book / dress up
games/munch/               Mochi Munch v3: index.html, menu.js (Story / Free Play / 2 Players), map.js (Blob Island story map), munch.js (game), munch.css
games/baseball/            Blob Baseball: index.html, baseball.js (menu + game), baseball.css
games/room/                Blob Room ("My Room"): index.html, room.js (room, shop, decorate, friends, trophy shelf), items-art.js (SVG art for every item), room.css
css/core.css, css/hub.css  shared + hub styles
js/core/util.js            helpers, event bus, arcade-root detection
js/core/storage.js         profiles & progress (versioned schema, migrations)
js/core/curriculum-math.js math skills, levels, mastery logic (active: within 20; "later" entries to 100 / grade 2) + register() plug-in point
js/core/skills-early.js    Early Concepts (colors, shapes) + Reading & Words (letters, beginning sounds, rhymes, sight words) skills; bonus stars ask from them
js/core/early-words.js     word/picture lists, colors, shapes, letters, rhyme sets, their voice lines, and the Letter Lagoon story area
js/core/skills-grade1.js   1st-grade Reading & Words skills: CVC words, sh/ch/th, more sight words, opposites, action words
js/core/grade1-words.js    their word/picture lists (CVC, digraphs, Dolch primer + first grade, opposites, verbs/nouns), voice lines, Word Woods area
js/core/questions.js       multiple-choice questions from any registered skill (skill.ask(level) or built from skill.gen) — used by Blob Baseball
js/core/gamepad.js         game controllers (Gamepad API): controller → the same keys, seats for 2 players, hot-plug, rumble, button glyphs
js/core/room-catalog.js    Blob Room shop: 64 items (categories, prices, special prizes and how they're won)
js/core/friends.js         blob friendships: levels, points (play as / visits / taps), bios and what each level unlocks
js/core/story.js           Blob Island story data: areas, stops, paths, scoring, high scores, friend challenges (blob unlocks)
js/core/bonus-questions.js 127 picture questions for Munch's bonus stars (ages 4–7, 11 categories)
js/core/music.js           live Web Audio music (hub, game, faster low-timer variant, victory jingle), ducks under the voice
js/core/sightwords.js      Dolch Pre-Primer (40) + Primer (52) lists for the upcoming Sight Words game
js/core/voice-lines.js     every spoken line with an ID (drives recorder, playback and the recording script)
js/core/audio.js           Web Audio sound effects + voice manager (your recording → your file → built-in clip → browser speech) + IndexedDB clip store
js/core/blobs.js           the blob cast (SVG), expressions, outfits, colours
js/core/rewards.js         stickers (SVG) + star-milestone unlocks + celebration cards
js/core/ui.js              cards, confetti, press-and-hold gear + grown-up check, keyboard navigation
js/core/parent.js          grown-up area: progress dashboard, skill override, voice recorder, settings, players
js/core/zip.js             tiny zip writer (store-only) and reader (stored + deflate)
audio/voice/               YOUR voice files go here (+ manifest.js listing them) — they always beat the built-in clips
audio/voice-tts/           built-in voice clips (computer-generated with Kokoro TTS, voice af_heart): 1072 line clips + 1364 whole-sentence clips
tools/                     make-voice-manifest (node/python), generate-tts.py + list-tts-jobs.js, build-recording-script, catalog loader
                           build-food-data.py, build-room-art.py, build-unlock-art.js, build-wear-art.py (Dress Up hats + held items -> js/core/wear-data.js, assets/picnic/wear/)
RECORDING_SCRIPT.md/.pdf   the script for recording the voice lines
fonts/Fredoka.ttf          bundled font (SIL OFL, see fonts/OFL.txt)
screenshots/               test screenshots + test-results.json
```

## Mochi Munch v3
The Munch start menu offers **Story**, **Free Play** and **2 Players**. Keyboard first everywhere (arrows + Space/Enter), mouse/touch also work.

- **Timer (on by default).** A rainbow bar shrinks; under 10 s (or 20%) it turns orange, the music speeds up and soft ticks play in the
  last 5 s. Time = (12 s + seconds-per-snack × snacks) × pace. Seconds per snack (level 1 / 2): count 9/10, compare 10/11, add10 11/12,
  sub10 12/13, make10 12/13, teen 10/11, missing 13/14, add20 13/14, sub20 14/15, even/odd 9/10. Pace: Relaxed ×1.4 (automatic for
  age ≤ 5, plus ×1.15 at age ≤ 4), Normal ×1, Speedy ×0.75 (grown-up Players tab). If a careful kid (≥ 80% right) runs out of time, that
  skill gets 15% more time next round (up to ×1.6) and the level does not drop. Time-up ends the round kindly ("Time's up! Let's see how
  you did"), with stars for what was munched (min 1). The clock pauses for cards, the grown-up area and hidden tabs. Grown-ups can turn it off.
- **Bonus stars.** In most rounds a sparkly star appears on a free square; walk onto it for a picture question (3–4 emoji choices, all
  read aloud; arrows/WASD + Space/F, 1–4, or click). Right = +15 s (or +1 star with the timer off); wrong = "Good try! The answer is …",
  no penalty. 127 questions in 11 categories; recently asked ones are skipped; age ≤ 5 gets the easier half.
- **Music.** Original, generated live (Web Audio, pentatonic marimba + bass + pad + light drums, new melody every few bars). Separate
  on/off and volume in Settings; 🎵 button or **M** to mute. It ducks under speech and starts after the first tap/key.
- **2 Players** (same keyboard): Player 1 = arrows + Space/Enter, Player 2 = W/A/S/D + F. Pick a partner (another profile or a Guest:
  easy/medium/hard), then **Team** (shared total and stars) or **Race** (first to finish wins; else more munched; ties are ties).
  The 6×4 grid has 12 cells per player, blue or orange with an initial badge, each player's rule uses their own skill and level.
  Munching the partner's cell just says "That one is for …". Results, stars and skill history go to each profile (Guests aren't saved).
- **Story: Blob Island.** Help Mochi find the star-snacks before the Blob Festival: 10 areas (Counting Meadow → Even-Odd Lighthouse),
  2 stops each = every skill level in order, short blob-friend dialogs between areas, a festival finale. Paths: **Big Steps** (each stop
  plays its level) or **Little Steps** (default for age ≤ 5: easier level, fewer snacks); a stop missed twice becomes a "helper" stop
  (fewer snacks, more time). Score per stop = 100 per snack + up to 200 accuracy + time bonus (5/s left, max 300) + 150 perfect; a
  journey adds up as you pass new stops. **High scores** (H): family board (best journey, avatars) + personal bests per area.
- **Friend challenges → blob unlocks.** New players start with Mochi and Poppy. Clem, Dewdrop, Pickle and Nova are won in the
  challenge at the end of Compare Cliffs, Adding Beach, Take-Away Woods and Ten Tree Grove: munch all snacks under a target time with
  at most 1 oops. Target ≈ (8 s + 60% of the normal seconds per snack × snacks) × the kid's pace, on their path's level, so a 4-year-old's are
  longer and easier. Winning plays an unlock scene (the blob says hi) and offers "Be <blob> now?". Unlocks are saved per profile;
  existing players keep their current blob. Grown-ups: Players → "Unlock all characters".
- **Between levels:** a 3–4 s cutscene (blob bouncing along a trail, cheering friends, fireworks, stars counting up, "Level N!"),
  skippable with Space or a tap; the new grid's tiles drop and flip in.

### Plugging in a new skill (any subject)
The game never hard-codes math. A skill is an object registered with `Arcade.Curriculum.register(skill, afterId)`:
```js
{ id: 'colors1', name: 'Find the color', short: '…', strand: 'Colors', grade: 'PK', levels: ['Basic colors', 'More colors'],
  status: 'active', sayFact: false, intro: { line: 'skill_colors1', example: '<b>🍎</b> is red' },
  gen: function (level) {            // one round
    return { text: 'Munch the <b>red</b> ones',  hint: 'optional',  say: ['rule_find_color', 'color_red'],   // shown + spoken rule
             good: function () { return { label: 'apple', html: '🍎', fact: ['w_apple'] }; },              // a correct cell
             bad:  function () { return { label: 'grapes', html: '🍇', fact: ['w_grapes'] }; } }; } }      // a wrong cell
```
Cells can be text, numbers, emoji, inline `<svg>` pictures, color swatches or shapes (`html`); `label` is the plain-text/aria version
and `fact` is what is said after munching it. Correctness = which generator made the cell. Free Play adapts through the same mastery
rules, 2 Players and story stops call the same `gen(level)`, and `Arcade.Story.addArea({id, skill, name, emoji, friend, bg, x, y, beat})`
(before `games/munch/map.js` loads) adds an island area. Add voice lines for new rule/word ids in `voice-lines.js` and run
`tools/generate-tts.py`. Give the skill a `subject` ('math', 'reading' or 'concepts'; default math) to put it on that subject's ladder.
(`js/core/curriculum-catalog.js` / `curriculum-content*.js` are unused partial drafts from an earlier attempt; nothing loads them and
the content files are left out of the zip.)

### Coaching engine v2 (js/core/coach.js, second block)
- **Per-item estimates (Elo-style):** a rating per player per skill (`p.coach.theta[skill]`) and a difficulty per item (`item.e`); P(right) = 1/(1+e^-(theta−e)). Mochi Munch draws 3 candidates for each right cell and keeps the one closest to **82.5 %** expected success (`Coach.pickItem`); after misses it aims easier (87–92 %), after a fast run a little harder (76 %). The 65/20/15 current/recent/review mix still picks the skill. Old (v1) coach data migrates on load (`coach.v` 1 → 2; ratings seeded from each item's history; nothing removed; save schema stays v3).
- **Error diagnosis:** `Coach.ERRORS` is a table of `{ id, label, test(ctx), hint }` rows (teen reversal, off-by-one counting on, b/d, wrong operation, look-alike word); `Coach.HINTS` holds the mini-lessons. Add a pattern by adding a row. Counts are saved per player in `p.coach.errors[skill]` (+ a short `errLog`). In Munch a diagnosed miss shows a small, non-blocking hint card, and the worked example leads with it.
- **Placement check:** when a skill opens because the one before it was finished, Free Play asks 5 quick questions first ("Let's see what you already know!"). 5/5 = skip (Mastered (placed), still reviewed), 4/5 = start a level higher, else start normally. Grown-up setting: Settings → "Placement check for new skills".
- **Picnic story problems** (`wordprob`, after "Take away to 20"; within 10, then within 20; 85 % over 20 answers on 2 days). The pet name is a device-only grown-up setting (`settings.pet`, default Biscuit the dog); the default name has a clip, a custom one is said by the browser voice (like player names).
- **Progress snapshot:** Grown-up area → Progress → "Copy progress summary" (plain text) or "Download .json", per player, with an option to show "Player 1" instead of the name.

### Subjects: Math, Reading & Words, Early Concepts
`Arcade.Curriculum.SUBJECTS`. Each subject is its own ladder (own "now practicing" skill, levels, mastery and every-4th-round review);
math progress lives where it always did (`p.math`), the others in `p.tracks.reading` / `p.tracks.concepts`.
- **Early Concepts**: Colors (red/yellow/blue/green, then 8 colors; paint swatches + colored pictures), Shapes (circle, square,
  triangle, star, heart, then + rectangle, oval, diamond; SVG in varied colors, sizes and turns).
- **Reading & Words**: Letters (find B; then big + little letters), Beginning sounds (picture cells: "things that start with B"),
  Rhymes (picture cells: "things that rhyme with cat"), Sight words (Dolch pre-primer: 20 most common, then all 40).
  Then 1st grade (same ladder): Short vowel words (CVC: picture → word with one-letter look-alikes like cat/cot/cut, then read the
  word → picture), sh/ch/th (pictures, then words; wrong ones start with s/c/h/t), More sight words (Dolch primer 52, then first
  grade 41), Opposites (picture pairs like 🔥 hot / 🧊 cold, then word pairs), Action words (verbs with pictures, then action or
  naming words). Then 2nd-3rd grade: Long vowels (silent e: cap/cape; vowel teams ai ee oa ea), Big kid sight words (Dolch 2nd 46,
  3rd 41), Homophones (pick the spelling that fits a read-aloud sentence), Prefixes & suffixes (un-, re-, then -ful, -less), Reading
  stories (read a 1-2 sentence story, answer who/what/where). Word-reading tasks speak only the prompt, never the answer choices.
- **Levels** (New player screen, optional; grown-up area → Progress → Levels): Math / Reading / Early Concepts, Auto (by age) or
  Pre-K … 5th (Early Concepts also Off). Sets where that ladder starts (earlier skills placed); adaptive up/down still applies. A grade
  above the content starts at the top rung with a "more coming soon" note. Reading: Pre-K letters, K beginning sounds, 1st CVC,
  2nd long vowels, 3rd homophones; Auto = age 6 → 1st, 7 → 2nd, 8+ → 3rd. Math Auto is unchanged (6+ at Adding to 10).
  New players aged 6+ start Reading & Words at Short vowel words (the pre-K skills count as placed); struggling
  there detours back to sight words like any skill, and a younger kid who masters sight words moves on to them.
- **Mix** (grown-up area → Progress → Subject mix, per kid): "Mixed (by age)" — age 5 and under about 40% Early Concepts, 30% Reading &
  Words, 30% math; older kids 80% math, 12% reading, 8% concepts — or "Only <subject>". The split is exact over time (smooth
  weighted round-robin, `p.mixCredit`) and applies to Free Play, 2 Players (each kid their own mix), Blob Baseball and bonus stars
  (bonus stars ask a question from the kid's reading/concepts skill about as often as those subjects come up).
- **Letter Lagoon**: a story side trip (🏝️, friend Dewdrop) with 6 stops, one per new skill, open from the start; ↓ on the map goes there.
  Side stops never change the main 20-stop journey, so old saves keep their progress.
- **Word Woods**: a second side trip (🌲, friend Pickle) with 6 stops (CVC words, long vowels, big-kid sight words, homophones, prefixes & suffixes, reading stories), open from the start; ↓ goes to
  Letter Lagoon, ↓ again to Word Woods (← → also walk from one to the other).
- Voice: rules and words are short clips stitched together (`rule_begins` + letter, `pw_<word>`, `lt_<letter>`); no new sentence clips.

## Blob Baseball
Offense only: every pitch is a question (read aloud, 3 big answer cards for age ≤ 5, else 4, exactly one right) from the kid's
current math skill and level — the same mastery data as Mochi Munch (each answer is logged; each half-inning counts as a round).

- **Pick your swing first.** Before every pitch the batter chooses one of four big buttons (read aloud):
  **⚾ Single** (easy), **⚾⚾ Double** (just right), **🔥 Triple** (tricky), **💥 Home Run** (challenge). The question's difficulty
  follows the swing, relative to her own round, using `Arcade.Questions.step(profile, round, offset)` over the curriculum ladder
  (every skill × level in order):
  - Single = one step down (the previous level, or the previous skill's top level; a review round stays put; at the very first step it's
    the same question with one fewer choice);
  - Double = her own skill and level;
  - Triple = her own level with bigger numbers (`Questions.make(..., {hard: true})` picks the biggest-number question of 8);
  - Home Run = the next step up (the next level, or the next skill's easy level; at the very top, bigger numbers with all 4 choices).
    **Fairness clamp:** age ≤ 4 never jumps to a new skill — a 4-year-old's challenge is the next level or bigger numbers in the same skill.
- **Right answer = exactly the chosen hit** (speed no longer matters; the old speed-to-hit-zone meter is gone). A home run still gets
  fireworks, crowd cheer, the organ charge and a trot around the bases — choosing it also gets "Going for a home run!" and the charge.
- **Logging:** every answer is recorded against the skill/level actually asked (`recordAnswer(p, q.skill, ok)`), and only her own-level
  pitches (Double, Triple) count toward the half-inning's level-up round, so easier or harder swings don't skew mastery. Per-swing
  counts are kept in `games.baseball.swings` ({sg, db, tr, hr} → {n, ok}).
- **Gentle nudge (never forced):** after 3 Singles in a row the crowd cheers "The crowd wants a big swing! Want to try a double or a
  triple?" and the bigger buttons wiggle. One right Triple or Home Run also earns the third star.
- **Wrong answer = a strike** (gentle: "Strike! 3 plus 4 is 7"); a wrong Home Run swing is a **BIG WHIFF** (a spin, "Whoosh! What a big swing! That is just one strike.") — still one strike. Three strikes = an out (a strikeout or a pop fly caught by a friendly fielder).
- Runners advance by the hit's bases; runs and hits show on the scoreboard. **3 innings**; a half ends at 3 outs or after 4 batters
  (age ≤ 4) / 5 (age 5) / 6 batters, so games stay short (2 players: 5 each).
- **End:** final scoreboard, stars (1 + accuracy ≥ 70% + (runs ≥ batters per inning, or at least one Triple/Home Run hit)), the **family leaderboard** (best runs in one game per
  profile; **H** in the menu), stickers "Play Ball!" and "Home Run Hero".
- **2 Players:** pick a partner (profile or Guest), alternating half-innings, each kid picks her own swings and gets her own questions.
- **Controls:** click/tap a swing button, then a card; **1–4** pick a swing / answer; **← → (or A/D) + Space/Enter/F**; **R** hear again; **M** music; **Esc** stop. Controller: D-pad + A pick the swing, then D-pad picks a card and A swings.
- **Shot clock:** off by default; grown-ups can set 30/20/15/10 s per pitch (running out = a strike, not counted as a wrong answer).

### Questions from any subject
`Arcade.Questions.make(skill, level, {choices: 4})` returns `{text, pic, say, choices: [{label, html, say}], answer, fact}`. It uses
`skill.ask(level, n)` if the skill has one, otherwise it builds a question from the skill's Munch `gen(level)` (one `good()` cell + distinct
`bad()` cells). So any skill registered with `Arcade.Curriculum.register` works in Baseball too, with no game changes.

## Blob Room ("My Room")
Each player has their own cozy room (the **My Room** tile in the game picker). Everything autosaves per player (`p.room`).

- **The room:** a cut-away room (back wall, side walls, a 7 × 4 floor grid and 6 wall spots) with warm lighting. Day / dusk / night follow
  the computer's clock (night: dark room, lamps and fairy lights glow, friends nap more); the window shows sun, moon and stars; seasonal
  touches by month (spring tulips + petals, summer shell + butterfly, autumn pumpkins + leaves, winter snow blob + snowfall, December garland).
  Test any time with `games/room/index.html?h=21&m=12` (hour, month).
- **Star bits:** every star earned in any game is also 1 star bit (`Arcade.Store.earnStars`); existing players started with bits = their stars.
  Grown-ups can give **+10 star bits** (Players tab).
- **Shop (🛍️, S):** 64 items with original SVG art — 2 free starters (cream wallpaper, wood floor), 56 to buy for 3–34 star bits
  (most 4–12, so a kid can buy something after a game or two; big things like the cloud bed 34, play tent 26, fish tank 24), and
  6 **special prizes** that can't be bought: Story trophy (finish Story mode), Golden bat (10 runs in a baseball game), Grumbly plush
  (beat Grumbly), Sticker rug (10 stickers), Giant star (100 stars), Home run ball (a home run). Prizes appear in the room with a celebration.
  Categories: Beds & seats, Furniture, Plants & lamps, Toys & sports, Rugs, Wall, Wallpaper & floors, Special prizes.
  Buying: confirm → "It's yours!" (star-bit rain) → **Place it now** or **Keep shopping**; not enough bits says how many more are needed.
- **Decorate (🎨, D):** pick a thing from the tray, then a spot (ghost preview; green = OK, red = taken). Tap/Space on a placed thing picks it
  up to move it. **Flip** (R) mirrors it, **Put away** (Delete/H) sends it back to the tray, **Undo** (Z) steps back, **Done** (Esc). Rugs go
  under furniture; wall things hang on the 6 wall spots; wallpapers and floors from the tray change the room instantly.
- **Blob friends:** every unlocked blob lives in the room. They wander, go to things they like (and sit on seats), nap (Zzz) and react
  when tapped with their own lines (voiced). **Friendship** (5 levels: New friend 0, Pal 8, Good friend 20, Best friend 40, Forever friend 70
  points): +1 per star while playing as that blob, +1 per daily room visit, +1 per tap (max 3 taps a day per friend). Levels unlock (in the
  friend's bio) what they like, a new face, dislikes + favorite food, and at level 5 a present (their favorite item) for the room.
- **Trophy shelf (🏆, T):** 8 trophies (Story champion, Munch high score, Perfect round, Grumbly buster, Baseball best, Home run hero,
  2-player win, Forever friend), the sticker collection, and the blob roster (locked blobs are silhouettes that say how to unlock them).
  Tap a friend for their bio card (read aloud). A mini trophy shelf on the room's wall opens it too.
- **Grown-ups:** Players tab → "✦ +10 star bits" and "🏠 Reset room" (tap twice; empties the layout back to the starter room — bought
  things stay in the tray).

| | Mouse / touch | Keyboard | Controller |
|---|---|---|---|
| choose a button / friend | tap | arrows + Space/Enter | D-pad + A |
| shop · decorate · trophies · friends | buttons | S · D · T · F | buttons |
| pick from tray, place, pick up | tap chip, tap spot / thing | Tab/↓ to tray, Space; arrows move the square | A, D-pad |
| flip · put away · undo · done | buttons | R · Delete · Z · Esc | Y · X · View · B |
| close a panel / go home | ✕ / 🏠 | Esc | B |

## Tiny Picnic (toddler mode)

`games/tiny/` — the main game for age-2 players (`A.toddler(p)`: grown-up setting per player in Grown-ups → Players, Auto = on for age 2, or On / Off).
Three or four BIG picture tiles (food friends from `assets/picnic/friends/`, simple shapes, colors, matching, counting 1–3) and one spoken
prompt (`js/core/tiny-data.js`, voice lines `tp_*`). Every tap is happy: the right one cheers, any other giggles and says its name, then the
prompt repeats. No timer, no hearts, nothing lost. 6 prompts a round, then a calm "Hooray!" card and back to the hub. One star a round and
the `tiny_*` stickers (3 / 8 / 15 / 25 rounds). The toddler hub shows Tiny Picnic as the big first tile (plus the Picnic Spot) and hides the
school-level games and goal bars.

## Play time, breaks and volume (grown-up Settings)

`js/core/playtime.js`: per-player daily limit (Off / 15 / 20 / 30 / 45 min) and an optional stretch reminder every 20 minutes. Play time is
kept only on this device (localStorage key `picnicpals-playtime`, not in saves or save codes) and resets each day. `PlayTime.checkpoint()`
is called only between rounds (hub, end-of-round cards in Munch / Baseball / Tiny Picnic, arriving in the Picnic Spot), so a child is never
cut off mid-question and keeps every reward. Only a grown-up (gate) can add time. Volume: `settings.voiceVol`, `sfxVol`, `musicVol` and `muteAll`.

## Game controllers
Xbox, PlayStation (DualShock 4 / DualSense), Switch Pro and most generic USB/Bluetooth pads, in Chrome and Edge (standard mapping).
`js/core/gamepad.js` turns controller presses into the same keys every page already understands, so menus, cards, cutscenes, unlock
scenes, bonus questions, the story map, high scores, Mochi Munch, Blob Baseball and the Blob Room all work with it
(in the room's Decorate mode: Y flips, X puts away, View undoes).

| Controller | Does | (key) |
|---|---|---|
| D-pad / left stick | move, choose (stick: big deadzone; holding repeats after 0.45 s, then ~4 per second) | arrows (Player 2: W A S D) |
| A (✕ on PlayStation; the bottom button on Switch) | munch / pick / answer / swing | Space (Player 2: F) |
| B (○) | back, pause | Esc |
| Y (△) | hear the rule again | R |
| X (□) | high scores in menus; swap controllers on the 2-player setup screen | H |
| Start / Options | pause menu | Esc |
| View / Share | music on/off | M |

- **2 players:** the first controller is Player 1, the next one joins as Player 2 ("Press A to join" on the 2-player setup screen; a
  joining press doesn't pick anything). With one controller plus a keyboard, the keyboard plays the free seat; X (or the ⇄ Swap button)
  moves the controller to the other player. Seats are remembered for this browser tab. In Baseball only the batter's controller works.
- **Hints:** while a controller is in use, button glyphs (A/B/X/Y, or ✕○□△ for PlayStation) replace the key hints; using the keyboard,
  mouse or touch switches back.
- **Hot-plug:** "Controller connected!" toasts. If a player's controller disconnects mid-game, a "Paused" card stops the clock until it's
  plugged back in (or OK to keep playing with the keyboard).
- **Rumble:** a light buzz on a correct munch and a bigger one on a home run, where the controller supports it (Chrome/Edge
  `vibrationActuator`). Grown-up Settings → "Controller rumble".
- **Grown-up area stays kid-proof:** controllers can't open it (press-and-hold the gear with a mouse/finger, or Enter on the focused gear
  from a real keyboard) and are ignored while the question or the panel is open.
- **Caveats:** browsers only reveal a controller after a button is pressed on that page (so press any button once after opening a page).
  Safari (macOS / iPadOS) supports MFi, Xbox and PlayStation pads, but rumble may not work there; Firefox works (no rumble), and some
  older or generic pads report a non-standard mapping (buttons may be in odd places);
  the Gamepad API needs the page to be in front (no input from background tabs).

## Saving
Players and progress live in this browser's localStorage (schema v3, with migrations; new keys fill in automatically). Chrome/Edge keep it from `file://` and http.
If storage is blocked, or the page is opened from `file://` in another browser (Safari/Firefox may not keep it), a gentle notice
says "Progress may not save in this browser… use Chrome or Edge, or the web link".

Stars: `p.stars` is the never-spent total (stickers and outfit/colour unlocks are milestones). Every star also goes into a spendable
`p.wallet = {bits, earned, spent}` ("star bits", existing players start with bits = their stars) through `Arcade.Store.earnStars(p, n)`;
`Arcade.Store.spendBits(p, n, itemId)` spends them and adds to `p.inventory[itemId] = {n, at}`; `p.room` is the Blob Room layout (`{wall, floor, items: [{u, id, c, r | s, f}], visits, gifts, prizes}`, null until the first visit)
and `p.friends[blob] = {pts, lvl, day, taps, visit, news}` the friendships.

## Adding a game
1. Make `games/<name>/index.html` that loads the same `js/core/*.js` scripts (copy the `<script>` list from Munch) and your own script.
2. In your script: `Arcade.UI.boot()`, get the kid with `Arcade.Store.active()`, draw them with `Arcade.Blobs.forProfile(p)`,
   speak with `Arcade.Voice.say(['line_id', 7])`, add stars with `Arcade.Store.earnStars(p, n, 'mygame')`, then `Arcade.Rewards.check(p)` → `Arcade.Rewards.celebrate(p, items)`, and `Arcade.Store.save()`.
3. Add its lines to `js/core/voice-lines.js` and re-run `node tools/build-recording-script.js` (add `--pdf /path/to/chrome` with puppeteer-core on NODE_PATH for the PDF).
4. Flip its tile to `ready: true` in the `GAMES` list in `js/hub.js`.
5. Controllers work for free if the game uses keys (arrows + Space); call `Arcade.Pad.context({game: true, two})` in the game screen.

## Voice
Each line plays the first source found:
1. **your voice** – a recording made in the grown-up area's Voice recorder (stored in this browser), or a file `audio/voice/<id>.m4a|mp3|wav|webm|ogg`
2. **built-in clip** – `audio/voice-tts/<id>.mp3`, plus whole-sentence clips in `audio/voice-tts/phrases/` (e.g. `num_3.w_plus.num_4.w_is.num_7.mp3`)
3. **computer voice** – the browser's speech voice

A sentence (e.g. "Munch the ones that make" + "7") plays in your voice once every part of it is in your voice; until then it uses the
built-in clips, so it never switches voices mid-sentence (Settings → "Mix voices" changes that). The recorder shows each line's source.
When served over http(s), clips are stitched with Web Audio: silence trimmed, volume evened out, ~40 ms between parts, ~0.28 s after a full sentence.
Opened as `file://`, it falls back to preloaded `<audio>` elements (no trimming).

After putting files in `audio/voice/`, run `node tools/make-voice-manifest.js` (or `python3 tools/make_voice_manifest.py`).
See `RECORDING_SCRIPT.md` for what to record.

### Regenerating the built-in clips
Kokoro TTS (Apache-2.0, offline): `pip install kokoro-onnx soundfile pyloudnorm`, download `kokoro-v1.0.onnx` + `voices-v1.0.bin`
(github.com/thewh1teagle/kokoro-onnx releases, "model-files-v1.0"), ffmpeg installed, then
`python tools/generate-tts.py --models <folder> --voice af_heart` (synthesized at speed 1.0, then slowed to 0.9 with rubberband) (only changed lines are re-rendered; `--force` redoes all;
`--audition af_heart,af_bella` writes comparison files to `audio/_auditions/`). Clips: mono MP3 48 kbps at Kokoro's own 24 kHz (`--kbps` to change; was 64 kbps 44.1 kHz until Blob Baseball); to keep the zip under 24 MB, num_21–40 and the new-subject clips (section 'early') use 32 kbps (`LOW_KBPS`), the optional num_41–100 lines get no built-in clip (`MAX_NUM_CLIP`), and whole-sentence clips stop at 20 ("Level 25" is stitched from two clips); clips no longer wanted are deleted on the next run, silence trimmed with
a ~35 ms / 90 ms pad, loudness normalized to −18 LUFS. Pronunciation fixes (e.g. "Mochi" = MOH-chee,) are at the top of the script.

## Tests
`cd ../_test && node arcade-test.js` (puppeteer-core + headless Chrome): plays Munch with the keyboard, checks rewards, dashboard,
recorder (with and without a fake microphone), zip export/import, voice playback order, file:// mode, console errors and network requests.
v3 adds: new-player/delete/reload persistence (http + file://), timer countdown/pause/time-up, bonus questions (keyboard + click),
music start/duck/mute, both key sets at once in 2 Players with results on both profiles, story map/score/finale/high scores,
friend-challenge unlocks (locked blob not selectable → win under time → unlocked after reload), the saving notice, and skill plug-in.
Blob Baseball: menu, swing picker (keys, arrows, click, controller), difficulty ladder per swing (incl. the age ≤ 4 clamp and bigger numbers), exactly-the-chosen-hit, big whiff, logging against the actual skill/level, the nudge, pitch/answer cards, home run, runners and scoring, strikes and outs, innings, game end, profile
results, leaderboard, keyboard (1–4, arrows + Space) and click, 2 Players, shot clock. Controllers: simulated pads (stubbed
`navigator.getGamepads`) for hub/menu navigation, movement/deadzone/repeat, munch + rumble, bonus questions, cutscenes, unlock scenes,
disconnect pause, 2 controllers in 2P, one controller + keyboard, baseball, and the grown-up gate.
Blob Room (`room-tests.js`, also runs alone: `node room-tests.js`): hub tile, first visit, buy (bits go down, inventory, not enough, locked
prize), place/move/flip/spot taken/put away/undo by keyboard, mouse and controller, wall spots, persistence after reload, wallpaper,
friends wandering/sitting/napping, taps (lines, voice, +1, daily cap), friendship from visits and play, level-up cards, bio unlocks,
level-5 present, achievement prize, trophy shelf/stickers/roster silhouettes, day/night/season, grown-up +10 bits and reset room.
New subjects (`early-tests.js`; alone: `node early-run.js`; generators only, no browser: `node early-check.js`): every skill/level's
5×4 grid has 5–9 correct cells that match the rule and 3–4-choice questions with exactly one right answer (thousands of samples), the
subject mix (40/30/30 for age ≤ 5, 80/12/8 older, pinned subject), older saves, Free Play / 2P / bonus star / Baseball with the new
skills, Letter Lagoon, and the dashboard by subject. 1st-grade reading (`grade1-tests.js`, also run by `node early-run.js`; Node
only: `node grade1-check.js`): same grid/question checks for the 5 skills, the age-6 start and drop-down, Free Play / 2P / bonus /
Baseball, and Word Woods. Zip: `python3 _test/build-zip.py` from the kids-games folder.
