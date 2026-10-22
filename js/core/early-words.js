/* Blob Arcade — word & picture banks for the first non-math skills (pre-K / K): colors, shapes, letters,
   beginning sounds, rhymes and Dolch pre-primer sight words. Plain data + tiny helpers, no DOM.
   Loaded after story.js / bonus-questions.js and BEFORE voice-lines.js, so the voice lines below (A.EarlyWords.VOICE)
   and the "Letter Lagoon" island area are part of the normal voice catalog. The skills themselves are in skills-early.js.
   Picture rules: only emoji whose everyday name is clear (no 🐰 "rabbit/bunny", 🐴 "horse/pony", 🕸️ "web/spider web"). */
(function (A) {
  'use strict';
  function words(s) { return s.split(/\s+/).filter(Boolean); }
  var E = A.EarlyWords = {};

  /* ---------- picture words: word -> emoji (pl = the emoji shows more than one, for "are") ---------- */
  var PICS = {
    apple: '🍎', strawberry: '🍓', cherries: '🍒', tomato: '🍅', 'fire truck': '🚒', heart: '❤️',
    orange: '🍊', carrot: '🥕', pumpkin: '🎃', basketball: '🏀', fox: '🦊',
    banana: '🍌', lemon: '🍋', chick: '🐤', sunflower: '🌻', cheese: '🧀',
    frog: '🐸', broccoli: '🥦', clover: '🍀', cucumber: '🥒', 'green apple': '🍏', cactus: '🌵', turtle: '🐢',
    blueberries: '🫐', whale: '🐳', 'water drop': '💧', jeans: '👖', cap: '🧢',
    grapes: '🍇', eggplant: '🍆', pig: '🐷', 'cherry blossom': '🌸', flamingo: '🦩',
    bear: '🐻', cookie: '🍪', potato: '🥔', chestnut: '🌰',
    bee: '🐝', bus: '🚌', bed: '🛏️', bell: '🔔', book: '📖', balloon: '🎈',
    dog: '🐶', duck: '🦆', dolphin: '🐬', dinosaur: '🦕', door: '🚪', deer: '🦌',
    moon: '🌙', monkey: '🐒', mouse: '🐭', milk: '🥛', mushroom: '🍄', magnet: '🧲', map: '🗺️',
    pizza: '🍕', pear: '🍐', penguin: '🐧', popcorn: '🍿', panda: '🐼', pineapple: '🍍', pencil: '✏️',
    sun: '☀️', sock: '🧦', sandwich: '🥪', soap: '🧼', seal: '🦭', salad: '🥗',
    tiger: '🐯', tent: '⛺', taco: '🌮', tooth: '🦷',
    fish: '🐟', fire: '🔥', foot: '🦶', goat: '🐐', guitar: '🎸', ghost: '👻',
    hippo: '🦛', helicopter: '🚁', hammer: '🔨', house: '🏠',
    kite: '🪁', key: '🔑', kangaroo: '🦘', koala: '🐨',
    lion: '🦁', leaf: '🍁', lollipop: '🍭', lock: '🔒', ladybug: '🐞', lizard: '🦎',
    rainbow: '🌈', rocket: '🚀', robot: '🤖', ring: '💍',
    watermelon: '🍉', worm: '🪱', window: '🪟',
    cat: '🐱', bat: '🦇', hat: '🎩', tree: '🌳', car: '🚗', star: '⭐', cake: '🎂', snake: '🐍', snowflake: '❄️',
    spoon: '🥄', raccoon: '🦝', boat: '⛵', coat: '🧥', chair: '🪑', clock: '⏰', sled: '🛷', bread: '🍞',
    pie: '🥧', tie: '👔', eye: '👁️', train: '🚆', rain: '🌧️', chain: '⛓️', nose: '👃', rose: '🌹', shell: '🐚'
  };
  var PLURAL = { cherries: 1, blueberries: 1, jeans: 1, grapes: 1 };
  // reuse the bonus-question answer clips that are just the bare word ("c_apple" says "Apple."), else a new pw_<word> line
  var ANS = {}; if (A.BonusQ) A.BonusQ.QS.forEach(function (q) { q.choices.forEach(function (c) { ANS[c.line] = 1; }); });
  function slug(w) { return String(w).toLowerCase().replace(/[^a-z0-9]+/g, '_'); }
  function lineFor(w) { var c = 'c_' + slug(w); return ANS[c] ? c : 'pw_' + slug(w); }
  E.PICS = PICS; E.lineFor = lineFor;
  E.pic = function (w) { return { word: w, emoji: PICS[w], line: lineFor(w), pl: !!PLURAL[w] }; };

  /* ---------- colors ---------- (things = emoji whose real color is iconic and the same on every platform) */
  E.COLORS = [
    { id: 'red', hex: '#E53935', things: words('apple strawberry cherries tomato heart').concat(['fire truck']) },
    { id: 'yellow', hex: '#FDD835', things: words('banana lemon chick sunflower cheese') },
    { id: 'blue', hex: '#1E88E5', things: words('blueberries whale jeans cap').concat(['water drop']) },
    { id: 'green', hex: '#43A047', things: words('frog broccoli clover cucumber cactus turtle').concat(['green apple']) },
    { id: 'orange', hex: '#FB8C00', things: words('orange carrot pumpkin basketball fox') },
    { id: 'purple', hex: '#8E24AA', things: words('grapes eggplant') },
    { id: 'pink', hex: '#EC5F9A', things: words('pig flamingo').concat(['cherry blossom']) },
    { id: 'brown', hex: '#8D6E63', things: words('bear cookie potato chestnut') }
  ];
  E.COLOR_LEVELS = [['red', 'yellow', 'blue', 'green'], ['red', 'yellow', 'blue', 'green', 'orange', 'purple', 'pink', 'brown']];
  E.COLOR_CLOSE = { red: ['orange', 'pink'], orange: ['red', 'yellow', 'brown'], yellow: ['orange', 'green'], green: ['blue', 'yellow'], blue: ['purple', 'green'], purple: ['blue', 'pink'], pink: ['red', 'purple'], brown: ['orange', 'red'] };
  E.colorLine = function (id) { return ANS['c_' + id] ? 'c_' + id : 'pw_' + id; };

  /* ---------- shapes ---------- (plural for the rule; drawn by skills-early.js in varied colors and sizes) */
  E.SHAPES = { circle: 'circles', square: 'squares', triangle: 'triangles', star: 'stars', heart: 'hearts', rectangle: 'rectangles', oval: 'ovals', diamond: 'diamonds' };
  E.SHAPE_LEVELS = [words('circle square triangle star heart'), words('circle square triangle star heart rectangle oval diamond')];
  E.SHAPE_CLOSE = { square: ['rectangle', 'diamond'], rectangle: ['square', 'oval'], circle: ['oval'], oval: ['circle', 'rectangle'], diamond: ['square', 'triangle'], triangle: ['diamond'], star: ['heart'], heart: ['star'] };

  /* ---------- letters ---------- (spoken letter names; level 2 mixes upper/lower case, minus I/l which look alike in many fonts) */
  E.LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
  E.LETTERS_BOTH = E.LETTERS.filter(function (c) { return c !== 'i' && c !== 'l'; });
  E.LETTER_CLOSE = { b: 'dpq', d: 'bpq', p: 'bdq', q: 'pdb', m: 'nw', n: 'mhu', w: 'mv', v: 'wy', u: 'nv', e: 'fc', f: 'et', t: 'f', h: 'nk', c: 'oe', o: 'ca', g: 'qy', a: 'o', s: 'z', z: 's', k: 'x', x: 'k', y: 'v', r: 'n', j: 'g' };

  /* ---------- beginning sounds ---------- every word starts with the letter AND its usual sound (no c/k, ph, kn, "sh" words) */
  E.BEGIN = {
    b: words('banana bear bee bus bed bell book balloon'), d: words('dog duck dolphin dinosaur door deer'),
    m: words('moon monkey mouse milk mushroom magnet map'), p: words('pig pizza pear penguin popcorn panda pineapple pencil'),
    s: words('sun sock sandwich soap seal salad'), t: words('tiger turtle tomato tent taco tooth'),
    f: words('fish fox fire foot'), g: words('goat guitar ghost'), h: words('heart hippo helicopter hammer house'),
    k: words('kite key kangaroo koala'), l: words('lion lemon leaf lollipop lock ladybug lizard'),
    r: words('rainbow rocket robot ring'), w: words('watermelon worm window')
  };
  E.BEGIN_LEVELS = [words('b m s t p d'), words('b m s t p d f g h k l r w')];

  /* ---------- rhymes ---------- sets of pictures that rhyme; no word in one set rhymes with a word in another set */
  E.RHYMES = {
    at: words('cat bat hat'), ee: words('bee tree key'), ar: words('car star guitar'), ake: words('cake snake snowflake'),
    oon: words('moon spoon balloon raccoon'), oat: words('boat goat coat'), air: words('bear chair pear'),
    ock: words('sock clock lock'), ed: words('bed sled bread'), ie: words('pie tie eye'), ain: words('train rain chain')
  };
  E.RHYME_LEVELS = [words('at ee ar oon oat ake'), words('at ee ar ake oon oat air ock ed ie ain')];
  // pictures that rhyme with none of the sets above (extra "wrong" cells)
  E.RHYME_OTHERS = words('house mouse nose rose shell dog pig sun duck fish lion banana rocket tiger');

  /* ---------- sight words (Dolch pre-primer) ---------- level 1 = the 20 most frequent, level 2 = all 40 */
  E.SIGHT_LEVELS = [words('a I the to and is it in see go can my me we up you big red look not'), (A.SightWords ? A.SightWords.PREPRIMER : []).slice()];

  /* ---------- spoken lines (added to the voice catalog by voice-lines.js) ---------- */
  var V = [];
  E.COLORS.forEach(function (c) { V.push(['rule_color_' + c.id, 'Munch the ' + c.id + ' things!']); });
  Object.keys(E.SHAPES).forEach(function (k) { V.push(['rule_shape_' + k, 'Munch the ' + E.SHAPES[k] + '!']); });
  Object.keys(E.SHAPES).forEach(function (k) { V.push(['sh_' + k, (/^[aeiou]/.test(k) ? 'an ' : 'a ') + k]); });
  V.push(['rule_letter', 'Munch the letter', '+ letter, e.g. "Munch the letter" + "B"'], ['w_big_little', 'big and little!'],
    ['rule_begins', 'Munch the things that start with', '+ letter + "like" + word: "...start with" + "B" + "like" + "banana"'], ['w_like', 'like'],
    ['w_starts_with', 'starts with', '"banana" + "starts with" + "B"'], ['rule_rhymes', 'Munch the things that rhyme with', '+ word'],
    ['w_rhymes_with', 'rhymes with', '"hat" + "rhymes with" + "cat"'], ['w_no_rhyme', 'does not rhyme with', '"dog" + "does not rhyme with" + "cat"'],
    ['rule_sight', 'Munch the word', '+ sight word'], ['w_are', 'are', '"grapes" + "are" + "purple"'],
    ['q_which_is', 'Which one is', '+ color or shape: "Which one is" + "red?"'], ['q_which_letter', 'Which one is the letter', '+ letter'],
    ['q_which_starts', 'Which one starts with', '+ letter'], ['q_which_rhymes', 'Which one rhymes with', '+ word'],
    ['fb_star_learner', "You're a super learner!"],
    ['skill_colors', 'Colors! Find the things that are the same color.'], ['skill_shapes', 'Shapes! Circles, squares, triangles, and more.'],
    ['skill_letters', 'Letters! Find the letter. Big letters and little letters.'], ['skill_begsound', 'First sounds! Say the name of the picture. What sound does it start with?'],
    ['skill_rhymes', 'Rhymes! Cat, hat and bat all sound the same at the end.'], ['skill_sight', 'Sight words! Little words we see in every book.']);
  var LN = { a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'gee', h: 'aitch', i: 'eye', j: 'jay', k: 'kay', l: 'ell', m: 'em', n: 'en', o: 'oh', p: 'pee', q: 'cue', r: 'ar', s: 'ess', t: 'tee', u: 'you', v: 'vee', w: 'double-u', x: 'ex', y: 'why', z: 'zee' };
  E.LETTER_SAY = LN;   // how the built-in voice says each letter name (tools/generate-tts.py)
  E.LETTERS.forEach(function (c) { V.push(['lt_' + c, c.toUpperCase(), 'the letter name']); });
  var seen = {};
  E.COLORS.forEach(function (c) { var l = E.colorLine(c.id); if (/^pw_/.test(l) && !seen[l]) { seen[l] = 1; V.push([l, c.id]); } });
  Object.keys(PICS).forEach(function (w) { var l = lineFor(w); if (/^pw_/.test(l) && !seen[l]) { seen[l] = 1; V.push([l, w]); } });
  E.VOICE = V;

  /* ---------- Story mode: Letter Lagoon (a side trip on Picnic Island, one stop per skill, open from the start) ---------- */
  if (A.Story && A.Story.addArea) A.Story.addArea({ id: 'lagoon', name: 'Letter Lemonade Lagoon', emoji: '🍋', friend: 'blueberry', bg: '#a8e4f0', x: 44, y: 86, side: true,
    stops: words('colors shapes letters begsound rhymes sight'), skill: 'colors',
    beat: "Splish splash! Welcome to Letter Lemonade Lagoon. Colors, shapes, letters and words are floating in the lemonade. Let's munch them!" });
})(window.Arcade);
