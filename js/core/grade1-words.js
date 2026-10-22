/* Blob Arcade — word & picture banks for the 1st-grade Reading & Words skills: CVC words (short vowels), digraphs
   sh / ch / th, Dolch primer + 1st-grade sight words, opposites, and action words vs naming words.
   Plain data + tiny helpers, no DOM. Load right after early-words.js (adds to A.EarlyWords: PICS, VOICE) and BEFORE
   voice-lines.js, so the voice lines below and the "Word Woods" island side trip are in the normal voice catalog.
   The skills themselves are in skills-grade1.js. */
(function (A) {
  'use strict';
  var E = A.EarlyWords; if (!E) return;
  function words(s) { return s.split(/\s+/).filter(Boolean); }
  var G = A.Grade1Words = {};
  // new picture words (added to the shared bank; existing ones such as cat, dog, sun, bus are reused)
  var NEW = { van: '🚐', can: '🥫', pen: '🖊️', ten: '🔟', leg: '🦵', pin: '📌', six: '6️⃣', box: '📦', log: '🪵', bug: '🐛', cup: '🥤',
    ship: '🚢', shoe: '👟', sheep: '🐑', shark: '🦈', shirt: '👕', chain: '⛓️', chocolate: '🍫', thumb: '👍', three: '3️⃣', thread: '🧵', thermometer: '🌡️' };
  Object.keys(NEW).forEach(function (w) { if (!E.PICS[w]) E.PICS[w] = NEW[w]; });

  /* ---------- CVC words (short vowels) ---------- pictured words (word -> picture) + extra real CVC words used as look-alikes */
  G.CVC = { a: words('cat bat hat map van can'), e: words('bed pen ten leg'), i: words('pig pin six'), o: words('dog fox box log'), u: words('sun bus bug cup') };
  G.CVC_PICS = [].concat(G.CVC.a, G.CVC.e, G.CVC.i, G.CVC.o, G.CVC.u);
  // look-alike words (one letter different, often the vowel): written-word distractors
  G.CVC_LIKE = { cat: 'cot cut cap', bat: 'bit but bag', hat: 'hot hit ham', map: 'mop mat man', van: 'vet fan ran', can: 'cap con cab',
    bed: 'bad bid red', pen: 'pan pin ten', ten: 'tan tin pen', leg: 'log lag beg', pig: 'peg big dig', pin: 'pan pen pit', six: 'sax fix sit',
    dog: 'dig dug log', fox: 'fix box fog', box: 'bax fox bog', log: 'leg lag dog', sun: 'son sum bun', bus: 'bun but gus', bug: 'big bag rug', cup: 'cap pup cut' };
  // keep only real, kid-safe words as look-alikes
  var REAL = words('cot cut cap bit but bag hot hit ham mop mat man vet fan ran bad bid red pan tan tin lag beg peg big dig pit sit fix fog dug sum bun rug pup mud hop');
  Object.keys(G.CVC_LIKE).forEach(function (w) { G.CVC_LIKE[w] = words(G.CVC_LIKE[w]).filter(function (x) { return REAL.indexOf(x) >= 0 || G.CVC_PICS.indexOf(x) >= 0; }); });
  G.CVC_WORDS = G.CVC_PICS.concat(REAL.filter(function (x) { return G.CVC_PICS.indexOf(x) < 0; }));

  /* ---------- digraphs sh / ch / th ---------- */
  G.DIG = ['sh', 'ch', 'th'];
  G.DIG_PICS = { sh: words('shell ship shoe sheep shark shirt'), ch: words('chick chair cheese cherries chain chocolate'), th: words('thumb three thread thermometer') };
  G.DIG_WORDS = { sh: words('ship shop shed shell shin shut'), ch: words('chip chin chop chat chick chest'), th: words('thin thick this that them then') };
  // pictures / words that start with s, c, h or t but NOT sh / ch / th (the tricky look-alikes)
  G.DIG_BAD_PICS = words('sun sock soap seal salad sandwich cat car cake tiger tent taco tooth turtle tomato hat house hippo hammer dog moon fish bus');
  G.DIG_BAD_WORDS = words('sip sit hip hop cap cop cat tin tip tap top hat ten sad sock tick hen hot cot sun six');
  G.DIG_ANCHOR = { sh: ['ship', 'shoe'], ch: ['chair', 'cheese'], th: ['thumb', 'three'] };

  /* ---------- Dolch sight words ---------- level 1 = Primer (52), level 2 = First grade (41) */
  G.DOLCH1 = words('after again an any as ask by could every fly from give going had has her him his how just know let live may of old once open over put round some stop take thank them then think walk were when');
  G.SIGHT2_LEVELS = [(A.SightWords ? A.SightWords.PRIMER : []).slice(), G.DOLCH1.slice()];

  /* ---------- opposites ---------- level 1 = with pictures, level 2 = words only (more pairs) */
  G.OPP_PICS = [['hot', '🔥', 'cold', '🧊'], ['day', '☀️', 'night', '🌙'], ['up', '⬆️', 'down', '⬇️'], ['happy', '😀', 'sad', '😢'], ['fast', '🏎️', 'slow', '🐌'],
    ['big', '🐘', 'small', '🐭'], ['open', '🔓', 'closed', '🔒'], ['stop', '🛑', 'go', '🟢'], ['loud', '📢', 'quiet', '🤫'], ['yes', '✅', 'no', '❌']];
  G.OPP_WORDS = [['old', 'new'], ['in', 'out'], ['on', 'off'], ['top', 'bottom'], ['left', 'right'], ['push', 'pull'], ['wet', 'dry'], ['full', 'empty'],
    ['long', 'short'], ['hard', 'soft'], ['first', 'last'], ['give', 'take']];
  G.OPP = {}; G.OPP_EMO = {};
  G.OPP_PICS.forEach(function (p) { G.OPP[p[0]] = p[2]; G.OPP[p[2]] = p[0]; G.OPP_EMO[p[0]] = p[1]; G.OPP_EMO[p[2]] = p[3]; });
  G.OPP_WORDS.forEach(function (p) { if (!G.OPP[p[0]]) G.OPP[p[0]] = p[1]; if (!G.OPP[p[1]]) G.OPP[p[1]] = p[0]; });
  G.OPP_LEVELS = [Object.keys(G.OPP_EMO), Object.keys(G.OPP).filter(function (w) { return G.OPP[G.OPP[w]] === w; })];

  /* ---------- action words (verbs) vs naming words (nouns) ---------- words that are clearly one or the other for a 6-year-old */
  G.VERBS = { run: '🏃', swim: '🏊', sing: '🎤', eat: '🍽️', sleep: '😴', clap: '👏', jump: '🦘', write: '✍️', read: '📖', dig: '⛏️' };
  G.NOUNS = { cat: '🐱', dog: '🐶', ball: '⚽', apple: '🍎', tree: '🌳', car: '🚗', hat: '🎩', duck: '🦆', cake: '🎂', shoe: '👟', book: '📕', moon: '🌙' };
  G.VERBS2 = words('sit hop kiss walk cry laugh throw catch climb bake');
  G.NOUNS2 = words('cup bed sock pig bus egg chair door rock frog');

  /* ---------- voice lines ---------- */
  var V = E.VOICE, have = {}; V.forEach(function (l) { have[l[0]] = 1; });
  function add(id, text, note) { if (!have[id]) { have[id] = 1; V.push(note ? [id, text, note] : [id, text]); } }
  function wl(w) { var l = E.lineFor(w); add(l, w); return l; }   // the bare word ("pw_cot" says "Cot.")
  G.wordLine = wl;
  add('skill_cvc', 'Short vowel words! Cat, dog, sun. Say each sound, then read the word.');
  add('skill_digraph', 'Two letters, one sound! S H says shh, C H says ch, and T H says th.');
  add('skill_sight2', 'More sight words! Read them fast, like a big kid.');
  add('skill_opposites', 'Opposites! Hot and cold. Big and small. Up and down.');
  add('skill_nounverb', 'Action words! An action word is something you can do, like run or jump.');
  add('rule_cvc_word', 'Munch the word', '+ word: "Munch the word" + "cat" (the picture is on screen)');
  add('rule_cvc_pic', 'Read the word. Then munch its picture!');
  add('q_cvc_word', 'Which word goes with the picture?'); add('q_cvc_pic', 'Read the word. Which picture is it?');
  add('rule_dig_sh', 'Munch the things that start like ship and shoe!'); add('rule_dig_ch', 'Munch the things that start like chair and cheese!');
  add('rule_dig_th', 'Munch the things that start like thumb and three!');
  add('rule_digw_sh', 'Munch the words that start like ship!'); add('rule_digw_ch', 'Munch the words that start like chair!'); add('rule_digw_th', 'Munch the words that start like thumb!');
  add('q_dig_sh', 'Which one starts like ship?'); add('q_dig_ch', 'Which one starts like chair?'); add('q_dig_th', 'Which one starts like thumb?');
  add('w_starts_like', 'starts like', '"ship" + "starts like" + "shoe"'); add('w_not_like', 'does not start like', '"sun" + "does not start like" + "ship"');
  add('rule_opposite', 'Munch the opposite of', '+ word'); add('q_opposite', 'What is the opposite of', '+ word');
  add('w_opposite_of', 'is the opposite of', '"cold" + "is the opposite of" + "hot"'); add('w_not_opposite', 'is not the opposite of', '"sad" + "is not the opposite of" + "hot"');
  add('rule_verbs', 'Munch the action words! Things you can do.'); add('rule_nouns', 'Munch the naming words! People, animals and things.');
  add('q_verb', 'Which one is an action word?'); add('q_noun', 'Which one is a naming word?');
  add('w_is_action', 'is an action word', '"jump" + "is an action word"'); add('w_is_naming', 'is a naming word', '"cat" + "is a naming word"');
  G.CVC_WORDS.forEach(wl);
  G.DIG.forEach(function (d) { G.DIG_PICS[d].concat(G.DIG_WORDS[d]).forEach(wl); }); G.DIG_BAD_PICS.concat(G.DIG_BAD_WORDS).forEach(wl);
  Object.keys(G.OPP).forEach(wl);
  Object.keys(G.VERBS).concat(Object.keys(G.NOUNS), G.VERBS2, G.NOUNS2).forEach(wl);
  G.DOLCH1.forEach(function (w) { add(A.SightWords.lineId(w), w, 'Dolch first-grade sight word'); });

  /* ================= 2nd-3rd grade ================= */
  // silent e (L1) and vowel teams (L2): target word + real look-alikes (never a homophone of the target)
  G.LONG = [
    { cape: 'cap cope tape', tape: 'tap type cape', made: 'mad mud make', cane: 'can cone cake', hope: 'hop hose home', note: 'not nose net', robe: 'rob rope ride',
      cube: 'cub cute tube', tube: 'tub tub tune', cute: 'cut cub kite', kite: 'kit bite kick', pine: 'pin pane line', ride: 'rid rode hide', hide: 'hid ride side',
      fine: 'fin five fan', bike: 'bake bite like', plane: 'plan plate planet', slide: 'slid side smile', home: 'hum hole hope', bone: 'bon cone bore' },
    { rain: 'ran rail main', paint: 'pant print pain', train: 'rain trail tray', wait: 'wit what wet', tree: 'free three try', feet: 'fat fit feel', green: 'grin grain greet',
      sleep: 'slip sheep slap', boat: 'bat beat bolt', coat: 'cot cat cost', soap: 'soup snap step', goat: 'got gate goal', seat: 'set sat sent', team: 'tame them tea',
      beach: 'bench bench each', leaf: 'loaf lean deaf', float: 'flat flat flute', street: 'stretch strut sweet' }
  ];
  var REAL2 = words('cap cope tape tap type mad mud make can cone cake hop hose home not nose net rob rope ride cub cute tube tub tune cut kite kit bite kick pin pane line rid rode hide hid side fin five fan bake like plan plate planet slid smile hum hole bore ' +
    'ran rail main pant print pain trail tray wit what wet free three try fat fit feel grin grain greet slip sheep slap bat beat bolt cot cat cost step soup snap got gate goal set sat sent tame them tea bench each loaf lean deaf flat flute stretch strut sweet');
  G.LONG.forEach(function (lv) { Object.keys(lv).forEach(function (w) { lv[w] = words(lv[w]).filter(function (x, i, a) { return x !== w && REAL2.indexOf(x) >= 0 && a.indexOf(x) === i; }); }); });
  // Dolch 2nd and 3rd grade
  G.DOLCH2 = words("always around because been before best both buy call cold does don't fast first five found gave goes green its made many off or pull read right sing sit sleep tell their these those upon us use very wash which why wish work would write your");
  G.DOLCH3 = words('about better bring carry clean cut done draw drink eight fall far full got grow hold hot hurt if keep kind laugh light long much myself never only own pick seven shall show six small start ten today together try warm');
  G.SAME_SOUND = { right: 'write', write: 'right', their: 'there', buy: 'by', eight: 'ate', read: 'red', its: "it's", one: 'won' };
  // homophones: [sentence with ___, answer, group]. The wrong choices are ONLY the real-word homophone partners that don't fit
  // the sentence (their / there / they're, to / too / two ...), never made-up misspellings. Pairs give 2 choices, trios 3.
  G.HOMO_GROUPS = { to: words('to two too'), there: words("there their they're"), sea: words('see sea'), ate: words('ate eight'), right: words('right write'), blue: words('blue blew'),
    one: words('one won'), four: words('for four'), buy: words('buy by bye'), here: words('here hear'), know: words('know no'), meet: words('meet meat'), sun: words('sun son') };
  // indices 0-23 are unchanged (their clips hom_0 .. hom_23 stay valid); new sentences are appended
  G.HOMO = [['I have ___ dogs.', 'two', 'to'], ['We walk ___ school.', 'to', 'to'], ['Can I come ___?', 'too', 'to'], ['The cat is over ___.', 'there', 'there'],
    ['They lost ___ ball.', 'their', 'there'], ["I think ___ late.", "they're", 'there'], ['Fish swim in the ___.', 'sea', 'sea'], ['I can ___ the moon.', 'see', 'sea'],
    ['She ___ a big apple.', 'ate', 'ate'], ['A spider has ___ legs.', 'eight', 'ate'], ['Can you ___ your name?', 'write', 'right'], ['Turn ___ at the tree.', 'right', 'right'],
    ['The wind ___ hard.', 'blew', 'blue'], ['The sky is ___.', 'blue', 'blue'], ['Our team ___ the game.', 'won', 'one'], ['I have ___ nose.', 'one', 'one'],
    ['This gift is ___ you.', 'for', 'four'], ['A dog has ___ legs.', 'four', 'four'], ['Dad will ___ some milk.', 'buy', 'buy'], ['Come ___ and sit.', 'here', 'here'],
    ['I can ___ the bird sing.', 'hear', 'here'], ['I ___ the answer.', 'know', 'know'], ['Nice to ___ you.', 'meet', 'meet'], ['We had ___ for dinner.', 'meat', 'meet'],
    ['Wave and say ___ to Grandma.', 'bye', 'buy'], ['The bus went ___ my house.', 'by', 'buy'], ['I said ___, thank you.', 'no', 'know'], ['The ___ is hot today.', 'sun', 'sun'],
    ['Mom and her ___ went to the park.', 'son', 'sun']];
  // words that sound the same (for audio-only sight-word prompts: never offer a sound-alike as a wrong choice)
  G.SOUND_ALIKE = Object.keys(G.HOMO_GROUPS).map(function (k) { return G.HOMO_GROUPS[k]; }).concat([words('red read'), words("its it's"), words('new knew'), words('be bee'), words('I eye'), words('so sew'), words('road rode'), words('would wood')]);
  G.soundsAlike = function (a, b) { a = String(a).toLowerCase(); b = String(b).toLowerCase(); return a === b || G.SOUND_ALIKE.some(function (g) { return g.indexOf(a) >= 0 && g.indexOf(b) >= 0; }); };
  // prefixes / suffixes: [word, meaning, root]; level 1 = un- / re-, level 2 = -ful / -less
  G.AFFIX = [
    [['unhappy', 'not happy', 'happy'], ['unkind', 'not kind', 'kind'], ['unfair', 'not fair', 'fair'], ['unlock', 'to open a lock', 'lock'], ['unsafe', 'not safe', 'safe'],
     ['redo', 'do again', 'do'], ['reread', 'read again', 'read'], ['refill', 'fill again', 'fill'], ['replay', 'play again', 'play'], ['rebuild', 'build again', 'build']],
    [['helpful', 'full of help', 'help'], ['helpless', 'without help', 'help'], ['careful', 'full of care', 'care'], ['careless', 'without care', 'care'], ['joyful', 'full of joy', 'joy'],
     ['colorful', 'full of color', 'color'], ['fearless', 'without fear', 'fear'], ['endless', 'without an end', 'end'], ['painless', 'without pain', 'pain'], ['playful', 'full of play', 'play']]];
  G.AFFIX_TRAPS = { unhappy: 'happy happily', unkind: 'kind kindly', unfair: 'fair fairly', unlock: 'lock locked', unsafe: 'safe safely', redo: 'do undo', reread: 'read reader', refill: 'fill filled',
    replay: 'play player', rebuild: 'build builder', helpful: 'helpless unhelpful', helpless: 'helpful help', careful: 'careless caring', careless: 'careful caring', joyful: 'joyless enjoy',
    colorful: 'colorless color', fearless: 'fearful fear', endless: 'ending end', painless: 'painful pain', playful: 'player replay' };
  // reading comprehension: [passage, question, answer, wrong choices (|-separated; every one uses words from the passage, so the
  // right answer is never "the only choice that is in the story"), kind: 'lit' (look back) or 'inf' (inference: feel / why / next)]
  G.RC = [
    [['Jammy has a red kite and a blue ball. Jammy flies the kite at the beach.', 'What color is the kite?', 'red', 'blue|ball|beach', 'lit'],
     ['Peel has a little dog and a big cat. The dog likes to dig. The cat likes to nap.', 'What does the dog like to do?', 'dig', 'nap|cat|big', 'lit'],
     ['Crunch ate a green grape. Then he gave a red grape to Bloop.', 'Who got the red grape?', 'Bloop', 'Crunch|green|grape', 'lit'],
     ['Bloop was sad and tired. Then she got a new puppy! She smiled and hugged it.', 'How did Bloop feel at the end?', 'happy', 'sad|tired|new', 'inf'],
     ['Dora was sleepy, but Crunch was not. His kite got stuck in a tall tree. He frowned and kicked a rock.', 'How did Crunch feel?', 'upset', 'sleepy|tall|stuck', 'inf'],
     ['Gray clouds filled the sky. Niblet put on his boots and took his umbrella.', 'What will happen next?', 'it will rain', 'Niblet will take off his boots|the sky will be green|the clouds will sleep', 'inf'],
     ['The cat hid under the bed when it heard the loud thunder.', 'Why did the cat hide?', 'it was scared', 'it wanted the bed|it liked the thunder|it was loud', 'inf'],
     ['Dora and Jammy baked a cake for the picnic. They put on pink frosting.', 'What did they bake?', 'cake', 'picnic|pink|frosting', 'lit']],
    [['The wind was strong, so Bloop held her hat with both hands. She walked home slowly.', 'Why did Bloop hold her hat?', 'the wind was strong', 'she walked home slowly|her hands were cold|her hat was new', 'inf'],
     ['Petey found a shiny shell on the sand. He put it in his pocket to show his friends.', 'Where did Petey put the shell?', 'pocket', 'sand|friends|shell', 'lit'],
     ['After school, Peel fed the fish. Then she did her homework at the kitchen table.', 'What did Peel do first?', 'fed the fish', 'did her homework|sat at the kitchen table|went to school', 'lit'],
     ['Crunch was nervous and a little sleepy before the show. He sang his song, and everyone clapped and cheered.', 'How did Crunch feel after the show?', 'proud', 'nervous|sleepy|little', 'inf'],
     ['Bloop packed a towel, sunscreen and a shovel. She did not pack her school bag. Then she ran to the car.', 'Where is Bloop probably going?', 'the beach', 'school|the car wash|the towel store', 'inf'],
     ['First Crisp mixed the flour. Next he cracked two eggs. Last he put the pan in the oven.', 'What did Crisp do after mixing the flour?', 'cracked the eggs', 'put the pan in the oven|mixed the flour|ate the oven', 'lit'],
     ["Dora's plant was brown and dry. She gave it water every day. Soon it had green leaves.", 'Why did the plant get green leaves?', 'she gave it water', 'it was brown|it was dry|it was a day', 'inf'],
     ['Jammy heard a knock at the door. Jammy opened it and saw Grandma holding a big gift with a bow.', 'What will Jammy do next?', 'open the gift', 'knock on the door|hold the bow|go to sleep at the door', 'inf'],
     ['The class went to the zoo. A lion was sleeping on a rock, but the monkeys were swinging and playing.', 'Who was sleeping on the rock?', 'the lion', 'the monkeys|the class|the zoo', 'lit']]];
  G.rcWrong = function (r) { return r[3].split('|'); };

  add('skill_longvowel', 'Long vowels! A silent e at the end makes the vowel say its name: cap, cape. Two vowels can team up too: rain, tree, boat.');
  add('skill_sight3', 'Big kid sight words! Second and third grade words.');
  add('skill_homophones', 'Homophones! Words that sound the same but are spelled differently, like to, two and too.');
  add('skill_affixes', 'Word parts! Un means not. Re means again. Ful means full of. Less means without.');
  add('skill_comprehension', 'Reading stories! Read the story, then answer the question.');
  add('rule_find_word', 'Munch the word', '+ word (the choices are never read aloud)');
  add('q_which_word', 'Which word is', '+ word'); add('rule_homophone', 'Munch the word that fits the sentence!'); add('rule_comprehension', 'Read the story. Munch the answer!');
  G.HOMO.forEach(function (h, i) { add('hom_' + i, h[0].replace('___', h[1].charAt(0).toUpperCase() === h[1].charAt(0) ? h[1] : h[1]).replace(/^./, function (c) { return c.toUpperCase(); }), 'homophone sentence (sounds the same whichever word fits)'); });
  G.AFFIX.forEach(function (lv) { lv.forEach(function (a) { add('aff_' + a[0], 'Which word means ' + a[1] + '?'); }); });
  G.RC.forEach(function (lv, L) { lv.forEach(function (r, i) { add('rc_' + L + '_' + i, r[0] + ' ' + r[1], 'reading passage + question (answers are not read aloud)'); add('rcq_' + L + '_' + i, r[1], 'story question only (when "Read stories aloud" is off)'); }); });
  G.LONG.forEach(function (lv) { Object.keys(lv).forEach(function (w) { wl(w); lv[w].forEach(wl); }); });
  G.DOLCH2.concat(G.DOLCH3).forEach(function (w) { add(A.SightWords.lineId(w), w, 'Dolch 2nd / 3rd grade sight word'); });

  /* ---------- Story mode: Word Woods (a second side trip, one stop per 1st-grade skill, open from the start) ---------- */
  if (A.Story && A.Story.addArea) A.Story.addArea({ id: 'wordwoods', name: 'Word Waffle Woods', emoji: '🧇', friend: 'corn', bg: '#bfe6a8', stroke: '#8fcf78', x: 85, y: 96, side: true,
    stops: words('cvc longvowel sight3 homophones affixes comprehension'), skill: 'cvc',
    beat: "Hello, reader! Welcome to Word Waffle Woods. Every waffle tree here has a word on it. Let's read them and munch them!" });
})(window.Arcade);
