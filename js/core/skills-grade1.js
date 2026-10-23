/* Blob Arcade — 1st-grade Reading & Words skills (after the pre-K / K ones in skills-early.js, same ladder):
   CVC words (short vowels), digraphs sh / ch / th, sight words (Dolch primer + first grade), opposites, action vs naming words.
   Same shape as skills-early.js: 2 levels, gen(level) with good() / bad() cells, ask(level, n) via A.EarlySkills.askFrom,
   intro line + example, rule voice lines. Data is in grade1-words.js. Load after skills-early.js. */
(function (A) {
  'use strict';
  var C = A.Curriculum, E = A.EarlyWords, G = A.Grade1Words, ES = A.EarlySkills, pick = A.pick;
  if (!C || !E || !G || !ES) return;
  var askFrom = ES.askFrom, wl = G.wordLine;
  function em(t) { return '<b class="hl">' + t + '</b>'; }
  function others(arr, x) { return arr.filter(function (v) { return v !== x; }); }
  function emo(ch) { return '<span class="ea-emo" aria-hidden="true">' + ch + '</span>'; }
  function wordHtml(w) { return '<span class="ea-word">' + w + '</span>'; }
  function picWord(ch, w) { return '<span class="ea-pw">' + emo(ch) + '<span class="ea-cap">' + w + '</span></span>'; }
  var SK = [];
  // audio-only word prompt (sight words, long vowels): the target is NOT printed, only the speaker button + this line
  var LISTEN = '<span class="listen">Listen and find the word</span>';
  function alike(a, b) { return G.soundsAlike ? G.soundsAlike(a, b) : a === b; }

  /* ----- CVC words / short vowels ----- L1: picture -> pick the written word (look-alikes differ by one letter); L2: word -> pick its picture */
  SK.push({ id: 'cvc', name: 'Short vowel words', short: 'Read CVC words like cat, dog, sun', strand: 'Phonics', std: '1.RF.2b / 1.RF.3b', grade: '1', subject: 'reading', sayFact: true, secs: [11, 12],
    levels: ['Picture → word (cat · cot · cut)', 'Read the word → picture'],
    intro: { line: 'skill_cvc', example: emo(E.PICS.cat) + ' ' + wordHtml('cat') + ' · ' + emo(E.PICS.sun) + ' ' + wordHtml('sun') },
    gen: function (L) {
      var T = pick(G.CVC_PICS), tl = wl(T);
      if (!L) {
        var like = G.CVC_LIKE[T] || [];
        var mkW = function (w) { return { label: w, html: wordHtml(w), fact: w === T ? ['w_thats', wl(w)] : ['rule_cvc_word', tl], name: [], k: w }; };
        return { text: 'Munch the word for ' + emo(E.PICS[T]), noPrint: true, hint: 'Say the picture’s name slowly. Which vowel do you hear in the middle?', say: ['rule_cvc_word', tl], target: T, pic: E.PICS[T],
          good: function () { return mkW(T); }, bad: function () { return mkW(like.length && Math.random() < .6 ? pick(like) : pick(others(G.CVC_WORDS, T))); } };
      }
      var vow = T.charAt(1);
      var mkP = function (w) { return { label: w, html: emo(E.PICS[w]), fact: [wl(w)], name: [wl(w)], k: w }; };
      return { text: 'Read it, then munch its picture: ' + em(T), hint: 'Say each sound, then blend them.', say: ['rule_cvc_pic'], target: T,
        good: function () { return mkP(T); },
        bad: function () { var same = others(G.CVC[vow], T); return mkP(same.length && Math.random() < .45 ? pick(same) : pick(others(G.CVC_PICS, T))); } };
    } });
  SK[0].ask = askFrom(SK[0].gen, function (r) { return r.pic ? { text: 'Which word goes with ' + emo(r.pic) + '?', say: ['q_cvc_word'] } : { text: 'Which picture is ' + em(r.target) + '?', say: ['q_cvc_pic'] }; });

  /* ----- Digraphs sh / ch / th ----- L1: pictures; L2: written words. Wrong ones start with s, c, h or t (the look-alikes) */
  SK.push({ id: 'digraph', name: 'sh, ch, th', short: 'Two letters, one sound: sh, ch, th', strand: 'Phonics', std: '1.RF.3a', grade: '1', subject: 'reading', sayFact: true, secs: [11, 12],
    levels: ['Pictures that start with sh / ch / th', 'Words that start with sh / ch / th'],
    intro: { line: 'skill_digraph', example: emo(E.PICS.ship) + ' <b>sh</b> · ' + emo(E.PICS.chair) + ' <b>ch</b> · ' + emo(E.PICS.thumb) + ' <b>th</b>' },
    gen: function (L) {
      var T = pick(G.DIG), anc = G.DIG_ANCHOR[T][0], al = wl(anc);
      function mk(w, ok) { var l = wl(w); return { label: w, html: L ? wordHtml(w) : emo(E.PICS[w]), fact: [l, ok ? 'w_starts_like' : 'w_not_like', al], name: L ? [] : [l], k: ok ? T : 'x' + w.charAt(0) }; }
      var goodPool = L ? G.DIG_WORDS[T] : G.DIG_PICS[T], otherDig = [];
      G.DIG.forEach(function (d) { if (d !== T) otherDig = otherDig.concat(L ? G.DIG_WORDS[d] : G.DIG_PICS[d]); });
      var badPool = (L ? G.DIG_BAD_WORDS : G.DIG_BAD_PICS);
      return { text: 'Munch the ' + (L ? 'words' : 'things') + ' that start with ' + em(T.toUpperCase()), hint: L ? 'Look at the first two letters. Say the sound they make together.' : 'Say each name slowly. Listen for the first sound, like ' + E.PICS[anc] + ' ' + anc + '.', say: [(L ? 'rule_digw_' : 'rule_dig_') + T], target: T,
        good: function () { return mk(pick(goodPool), true); },
        bad: function () { var w = Math.random() < .35 ? pick(otherDig) : pick(badPool); var c = mk(w, false); if (otherDig.indexOf(w) >= 0) c.k = w.slice(0, 2); return c; } };
    } });
  SK[1].ask = askFrom(SK[1].gen, function (r) { return { text: 'Which one starts with ' + em(r.target.toUpperCase()) + '?', say: ['q_dig_' + r.target] }; });

  /* ----- Sight words, part 2: Dolch primer, then first grade ----- */
  function swLine(w) { return A.SightWords.lineId(w); }
  SK.push({ id: 'sight2', name: 'More sight words', short: 'Dolch primer and first-grade words', strand: 'Sight words', std: '1.RF.3g', grade: 'K–1', subject: 'reading', sayFact: true, listen: true, secs: [10, 11],
    levels: ['Primer words (52)', 'First-grade words (41)'],
    intro: { line: 'skill_sight2', example: wordHtml('said') + ' ' + wordHtml('they') + ' ' + wordHtml('when') },
    gen: function (L) {
      var pool = G.SIGHT2_LEVELS[L], T = pick(pool);
      var ok = pool.filter(function (w) { return !alike(w, T); });   // never a sound-alike (the prompt is audio only)
      var like = ok.filter(function (w) { return w.charAt(0) === T.charAt(0) || w.length === T.length; });
      function mk(w) { return { label: w, html: wordHtml(w), fact: w === T ? ['sw_that_says', swLine(w)] : ['rule_sight', swLine(T)], name: [], k: w.toLowerCase() }; }
      return { text: LISTEN, listen: true, hint: SIGHT_HINT, say: ['rule_sight', swLine(T)], target: T,
        good: function () { return mk(T); }, bad: function () { return mk(like.length && Math.random() < (L ? .6 : .45) ? pick(like) : pick(ok)); } };
    } });
  var SIGHT_HINT = 'Tap 🔊 to hear it again. Listen for the first sound, then look for the letter that makes it.';
  SK[2].ask = askFrom(SK[2].gen, function (r) { return { text: LISTEN, listen: true, say: ['sw_find', swLine(r.target)] }; });

  /* ----- Opposites ----- L1: picture words; L2: words only, more pairs (and the word itself as a trap) */
  SK.push({ id: 'opposites', name: 'Opposites', short: 'Hot and cold, big and small', strand: 'Vocabulary', std: 'K.L.5b / 1.L.5', grade: 'K–1', subject: 'reading', sayFact: true, secs: [11, 12],
    levels: ['Picture opposites (hot · cold)', 'Word opposites (push · pull)'],
    intro: { line: 'skill_opposites', example: picWord('🔥', 'hot') + ' ↔ ' + picWord('🧊', 'cold') },
    gen: function (L) {
      var pool = G.OPP_LEVELS[L], T = pick(pool), O = G.OPP[T], tl = wl(T);
      function mk(w) { var l = wl(w), ok = w === O; return { label: w, html: !L && G.OPP_EMO[w] ? picWord(G.OPP_EMO[w], w) : wordHtml(w), fact: [l, ok ? 'w_opposite_of' : 'w_not_opposite', tl], name: [l], k: ok ? 'opp' : 'x:' + w }; }
      var bads = pool.filter(function (w) { return w !== O && w !== T; });
      return { text: 'Munch the opposite of ' + em((!L ? G.OPP_EMO[T] + ' ' : '') + T), hint: 'Think of the word that means the other way around, like hot and cold.', say: ['rule_opposite', tl], target: T,
        good: function () { return mk(O); }, bad: function () { return mk(L && Math.random() < .15 ? T : pick(bads)); } };
    } });
  SK[3].ask = askFrom(SK[3].gen, function (r) { return { text: 'What is the opposite of ' + em(r.target) + '?', say: ['q_opposite', wl(r.target)] }; });

  /* ----- Action words vs naming words ----- L1: action words with pictures; L2: words only, action OR naming words */
  var VB = Object.keys(G.VERBS), NN = Object.keys(G.NOUNS);
  SK.push({ id: 'nounverb', name: 'Action words', short: 'Find the action word (verbs vs nouns)', strand: 'Grammar', std: '1.L.1b / 1.L.1e', grade: '1', subject: 'reading', sayFact: true, secs: [11, 12],
    levels: ['Action words (with pictures)', 'Action words or naming words'],
    intro: { line: 'skill_nounverb', example: picWord(G.VERBS.jump, 'jump') + ' ' + picWord(G.VERBS.swim, 'swim') + ' ' + picWord(G.VERBS.eat, 'eat') },
    gen: function (L) {
      var T = L && Math.random() < .4 ? 'noun' : 'verb';
      var vs = L ? VB.concat(G.VERBS2) : VB, ns = L ? NN.concat(G.NOUNS2) : NN;
      function mk(w, kind) { var l = wl(w), emoj = kind === 'verb' ? G.VERBS[w] : G.NOUNS[w];
        return { label: w, html: !L && emoj ? picWord(emoj, w) : wordHtml(w), fact: [l, kind === 'verb' ? 'w_is_action' : 'w_is_naming'], name: [l], k: kind }; }
      return { text: 'Munch the ' + em(T === 'verb' ? 'action words' : 'naming words'), hint: T === 'verb' ? 'Can you do it? Then munch it!' : 'Is it a thing, an animal or a person?', say: [T === 'verb' ? 'rule_verbs' : 'rule_nouns'], target: T,
        good: function () { return T === 'verb' ? mk(pick(vs), 'verb') : mk(pick(ns), 'noun'); }, bad: function () { return T === 'verb' ? mk(pick(ns), 'noun') : mk(pick(vs), 'verb'); } };
    } });
  SK[4].ask = function (L, n) {   // one right answer: the good kind once, the other kind for the rest
    var r = SK[4].gen(L), good = r.good(), cells = [good], seen = {}; seen[good.label] = 1;
    for (var g = 0; cells.length < n && g < 200; g++) { var b = r.bad(); if (!seen[b.label]) { seen[b.label] = 1; cells.push(b); } }
    var arr = A.shuffle(cells.slice());
    return { text: 'Which one is ' + (r.target === 'verb' ? 'an ' + em('action word') : 'a ' + em('naming word')) + '?', say: [r.target === 'verb' ? 'q_verb' : 'q_noun'], fact: good.fact, answer: arr.indexOf(good), target: r.target,
      choices: arr.map(function (c) { return { label: c.label, html: c.html, say: c.name, k: c.k }; }) };
  };

  /* ================= 2nd-3rd grade (word-reading: the choices are never read aloud, only the prompt) ================= */
  function silentAsk(gen, q) { var f = askFrom(gen, q); return function (L, n) { var r = f(L, n); r.choices.forEach(function (c) { c.say = []; }); return r; }; }
  function wordCell(w, fact) { return { label: w, html: wordHtml(w), fact: fact, name: [], k: w }; }
  function hard(L) { return L ? .6 : .5; }

  /* ----- Long vowels: silent e (cap / cape), then vowel teams (rain, tree, boat, leaf) ----- */
  SK.push({ id: 'longvowel', name: 'Long vowels', short: 'Silent e (cap · cape) and vowel teams (ai, ee, oa, ea)', strand: 'Phonics', std: '1.RF.3c / 2.RF.3a-b', grade: '1–2', subject: 'reading', sayFact: true, listen: true, secs: [11, 12],
    levels: ['Silent e (cap · cape)', 'Vowel teams (ai ee oa ea)'],
    intro: { line: 'skill_longvowel', example: wordHtml('cap') + ' → ' + wordHtml('cape') + ' · ' + wordHtml('rain') + ' ' + wordHtml('tree') + ' ' + wordHtml('boat') },
    gen: function (L) {
      var bank = G.LONG[L], all = Object.keys(bank), T = pick(all), like = bank[T].filter(function (w) { return !alike(w, T); }), pool = all.concat([].concat.apply([], all.map(function (w) { return bank[w]; })));
      pool = pool.filter(function (w, i) { return pool.indexOf(w) === i && !alike(w, T); });
      return { text: LISTEN, listen: true, hint: L ? 'Listen for the long vowel. Look for two vowels teaming up, like ai, ee, oa or ea.' : 'Look for the word with the magic e.', say: ['rule_find_word', wl(T)], target: T,
        good: function () { return wordCell(T, ['w_thats', wl(T)]); }, bad: function () { var w = like.length && Math.random() < .65 ? pick(like) : pick(pool); return wordCell(w, ['rule_find_word', wl(T)]); } };
    } });
  SK[SK.length - 1].ask = silentAsk(SK[SK.length - 1].gen, function (r) { return { text: LISTEN, listen: true, say: ['q_which_word', wl(r.target)] }; });

  /* ----- Sight words, part 3: Dolch 2nd and 3rd grade ----- */
  SK.push({ id: 'sight3', name: 'Big kid sight words', short: 'Dolch 2nd and 3rd grade words', strand: 'Sight words', std: '2.RF.3f / 3.RF.3d', grade: '2–3', subject: 'reading', sayFact: true, listen: true, secs: [10, 11],
    levels: ['2nd-grade words (46)', '3rd-grade words (41)'],
    intro: { line: 'skill_sight3', example: wordHtml('because') + ' ' + wordHtml('which') + ' ' + wordHtml('together') },
    gen: function (L) {
      var pool = L ? G.DOLCH3 : G.DOLCH2, T = pick(pool), same = G.SAME_SOUND[T];
      var ok = pool.filter(function (w) { return w !== T && w !== same && !alike(w, T); });
      var like = ok.filter(function (w) { return w.charAt(0) === T.charAt(0) || w.length === T.length; });
      function mk(w) { return { label: w, html: wordHtml(w), fact: w === T ? ['sw_that_says', swLine(w)] : ['rule_sight', swLine(T)], name: [], k: w.toLowerCase() }; }
      return { text: LISTEN, listen: true, hint: SIGHT_HINT, say: ['rule_sight', swLine(T)], target: T,
        good: function () { return mk(T); }, bad: function () { return mk(like.length && Math.random() < hard(L) ? pick(like) : pick(ok)); } };
    } });
  SK[SK.length - 1].ask = silentAsk(SK[SK.length - 1].gen, function (r) { return { text: LISTEN, listen: true, say: ['sw_find', swLine(r.target)] }; });

  /* ----- Homophones: pick the word that fits the sentence (the sentence is read aloud; it sounds the same either way) ----- */
  SK.push({ id: 'homophones', name: 'Homophones', short: 'to · two · too, there · their', strand: 'Spelling / vocabulary', std: '2.L.2 / 3.L.2', grade: '2–3', subject: 'reading', sayFact: false, secs: [13, 14],
    levels: ['to · two · too, see · sea, …', 'All homophone sentences'],
    intro: { line: 'skill_homophones', example: wordHtml('to') + ' ' + wordHtml('two') + ' ' + wordHtml('too') },
    gen: function (L) {
      var n = L ? G.HOMO.length : 12, i = A.rnd(0, n - 1), h = G.HOMO[i], T = h[1], grp = G.HOMO_GROUPS[h[2]];
      // wrong choices: only the real-word homophone partners (their / there / they're ...), never made-up spellings
      return { text: h[0].replace('___', '<span class="ea-blank">____</span>'), hint: 'They all sound the same. Think about what the sentence means, then pick the spelling with that meaning.', say: ['hom_' + i], target: T, hom: i,
        good: function () { return wordCell(T, ['hom_' + i]); }, bad: function () { return wordCell(pick(others(grp, T)), ['hom_' + i]); } };
    } });
  SK[SK.length - 1].ask = silentAsk(SK[SK.length - 1].gen, function (r) { return { text: 'Which word fits? ' + r.text, say: ['hom_' + r.hom] }; });

  /* ----- Prefixes & suffixes: un- / re-, then -ful / -less ----- */
  SK.push({ id: 'affixes', name: 'Prefixes & suffixes', short: 'un-, re-, -ful, -less', strand: 'Word parts', std: '2.L.4b / 3.L.4b', grade: '2–3', subject: 'reading', sayFact: false, secs: [13, 14],
    levels: ['un- (not) · re- (again)', '-ful (full of) · -less (without)'],
    intro: { line: 'skill_affixes', example: wordHtml('un+happy') + ' ' + wordHtml('re+do') + ' ' + wordHtml('help+ful') },
    gen: function (L) {
      var bank = G.AFFIX[L], a = pick(bank), T = a[0], traps = words2(G.AFFIX_TRAPS[T]), rest = bank.map(function (b) { return b[0]; }).filter(function (w) { return w !== T; });
      return { text: 'Munch the word that means ' + em(a[1]), hint: L ? '-ful = full of · -less = without' : 'un- = not · re- = again', say: ['aff_' + T], target: T,
        good: function () { return wordCell(T, ['aff_' + T]); }, bad: function () { return wordCell(Math.random() < .55 ? pick(traps) : pick(rest), ['aff_' + T]); } };
    } });
  function words2(s) { return String(s || '').split(/\s+/).filter(Boolean); }
  SK[SK.length - 1].ask = silentAsk(SK[SK.length - 1].gen, function (r) { return { text: 'Which word means ' + em(r.text.replace(/^.*means /, '').replace(/<[^>]+>/g, '')) + '?', say: ['aff_' + r.target] }; });

  /* ----- Reading comprehension: read a 1-2 sentence story, answer who / what / where ----- */
  SK.push({ id: 'comprehension', name: 'Reading stories', short: 'Read a short story: who / what, how did they feel, why, what next', strand: 'Comprehension', std: '1.RL.1 / 2.RL.1 / 3.RL.1', grade: '1–3', subject: 'reading', sayFact: false, secs: [16, 17], wideCells: true,
    levels: ['Short stories (what, who, how did they feel)', 'Longer stories (why, what first, what next)'],
    intro: { line: 'skill_comprehension', example: '<span class="ea-story">Jammy has a red kite.</span>' },
    gen: function (L) {
      var fx = /^rc_(\d)_(\d+)$/.exec(window.__forceRC || ''), i = fx && +fx[1] === L && G.RC[L][+fx[2]] ? +fx[2] : A.rnd(0, G.RC[L].length - 1), r = G.RC[L][i], T = r[2], wrong = G.rcWrong(r), id = 'rc_' + L + '_' + i;
      // say = passage + question (the speaker button); sayAuto = question only, used when "Read stories aloud" is off for this player
      return { text: '<span class="ea-story">' + r[0] + '</span> ' + em(r[1]), hint: r[4] === 'inf' ? 'The story doesn’t say it. Use the clues in the story and think!' : 'Look back at the story. Find the sentence that tells you.',
        say: [id], sayAuto: ['rcq_' + L + '_' + i], story: true, kind: r[4], target: T, rc: id, q: r[1],
        good: function () { return wordCell(T, [id]); }, bad: function () { return wordCell(pick(wrong), [id]); } };
    } });
  SK[SK.length - 1].ask = function (L, n) {
    var r = SK[SK.length - 1].gen(L), wrong = A.shuffle(G.rcWrong(G.RC[L][+r.rc.split('_')[2]])).slice(0, n - 1), cells = [r.good()].concat(wrong.map(function (w) { return wordCell(w, [r.rc]); }));
    var arr = A.shuffle(cells.slice());
    return { text: r.text, say: [r.rc], sayAuto: r.sayAuto, story: true, kind: r.kind, fact: cells[0].fact, answer: arr.indexOf(cells[0]), target: r.target, choices: arr.map(function (c) { return { label: c.label, html: c.html, say: [], k: c.k }; }) };
  };

  SK.forEach(function (s) { C.register(s); });
  A.Grade1Skills = { ids: SK.map(function (s) { return s.id; }) };
})(window.Arcade);

/* Per-subject starting levels (grown-up setting, also on the New player screen): p.levels = { math, reading, concepts }, each
   'auto' (by age) or a grade 'pk' 'k' '1' ... '5' (concepts also 'off'). A grade sets where that subject's ladder starts: earlier
   skills count as placed, and the normal adaptive rules move up / down from there. A grade above the highest content starts at the
   top rung ("more coming soon"). 'auto' uses the per-age table AGE_START (2026-10-21 ux3a: about one level above grade). */
(function (A) {
  'use strict';
  var C = A.Curriculum; if (!C) return;
  var GRADES = [['pk', 'Pre-K'], ['k', 'K'], ['1', '1st'], ['2', '2nd'], ['3', '3rd'], ['4', '4th'], ['5', '5th']];
  // the first skill for each grade (missing grade = above the content: top rung). An entry is a skill id or { id, level } (level 0-based).
  // A grown-up's explicit grade uses this table; 'auto' (by age) uses AGE_START below.
  var START = { math: { pk: 'count10', k: 'compare', 1: 'add10', 2: 'evenodd' },
    reading: { pk: 'letters', k: 'begsound', 1: 'cvc', 2: 'longvowel', 3: 'homophones' },
    concepts: { pk: 'colors', k: 'shapes' } };
  /* 'Auto (by age)': about one level above grade expectations (Learning Coach, age-start-and-pacing-2026-10-21 §2).
     Bands come from A.Age.band (util.js). 'none' (age skipped) starts like age 5. 'top' = the top rung ("more coming soon"). */
  var AGE_START = {
    toddler: { math: { id: 'count10', level: 0 }, reading: { id: 'letters', level: 0 }, concepts: { id: 'colors', level: 0 } },
    pre:     { math: { id: 'count10', level: 1 }, reading: { id: 'letters', level: 1 }, concepts: { id: 'colors', level: 1 } },
    pk:      { math: { id: 'compare', level: 0 }, reading: { id: 'begsound', level: 0 }, concepts: { id: 'shapes', level: 1 } },
    k:       { math: { id: 'add10', level: 0 }, reading: { id: 'sight', level: 0 }, concepts: { id: 'shapes', level: 1 } },
    g1:      { math: { id: 'add20', level: 0 }, reading: { id: 'cvc', level: 1 }, concepts: { id: 'shapes', level: 1 } },
    g2:      { math: { id: 'wordprob', level: 1 }, reading: { id: 'homophones', level: 0 }, concepts: { id: 'shapes', level: 1 } },
    g3:      { math: 'top', reading: { id: 'affixes', level: 1 }, concepts: { id: 'shapes', level: 1 } }
  };
  AGE_START.none = AGE_START.k;
  // short text for the new-player screen / grown-up area: what each age starts at
  var AGE_TEXT = { 2: 'Tiny Picnic: numbers 1–5, big letters, colors', 3: 'numbers to 10, big & little letters, colors', 4: 'bigger & smaller, beginning sounds, shapes',
    5: 'adding to 10, first sight words', 6: 'adding to 20, short-vowel words', 7: 'story problems, homophones', 8: 'even & odd to 20, prefixes & suffixes' };
  AGE_TEXT.skip = AGE_TEXT[5];
  function byAge(p, subj) { return 'age:' + A.Age.band(p); }   // a pseudo-grade: startFor() looks it up in AGE_START
  function grade(p, subj) { var v = p.levels && p.levels[subj]; return !v || v === 'auto' ? byAge(p, subj) : v; }
  function norm(e) { return typeof e === 'string' ? { id: e, level: 0 } : e; }
  function startFor(subj, g) {
    var L = C.list(subj); if (!L.length) return null;
    if (/^age:/.test(g)) {
      var e = (AGE_START[g.slice(4)] || AGE_START.none)[subj];
      if (e === 'top') { var t = L[L.length - 1]; return { id: t.id, level: t.levels.length - 1, soon: true }; }
      e = norm(e); if (e && C.byId[e.id]) return { id: e.id, level: e.level || 0, soon: false };
      return { id: L[0].id, level: 0, soon: false };
    }
    var m = START[subj] || {}, id = m[g] && norm(m[g]);
    if (id && C.byId[id.id]) return { id: id.id, level: id.level || 0, soon: false };
    var idx = GRADES.findIndex(function (x) { return x[0] === g; }), maxIdx = -1;
    Object.keys(m).forEach(function (k) { var i = GRADES.findIndex(function (x) { return x[0] === k; }); if (i > maxIdx) maxIdx = i; });
    if (idx > maxIdx) return { id: L[L.length - 1].id, level: 0, soon: true };
    return { id: L[0].id, level: 0, soon: false };
  }
  // place one subject (used for new players, age changes and when a grown-up changes the level).
  // opt.check (default true): offer the 5-question placement check on the starting skill (coach.js; can chain up 4 skills, or step back 1)
  function apply(p, subj, opt) {
    opt = opt || {};
    var g = grade(p, subj); if (g === 'off') return null;
    var s = startFor(subj, g); if (!s) return null;
    C.ensure(p);
    // reset the ladder's "placed" marks (never skills the kid earned in play), then place at the start rung
    C.list(subj).forEach(function (sk) { var st = p.skills[sk.id]; if (st.placed && st.status === 'mastered' && !st.attempts) { st.status = 'locked'; st.placed = false; st.level = 0; st.placeOffer = false; st.placeStart = false; } });
    if (s.id === C.list(subj)[0].id) { C.track(p, subj).current = s.id; var st0 = p.skills[s.id]; if (st0.status === 'locked') st0.status = 'open'; }
    else C.place(p, s.id);
    var cur = p.skills[s.id];
    if (!cur.attempts && cur.status !== 'mastered') {
      cur.level = Math.max(0, Math.min(s.level || 0, C.byId[s.id].levels.length - 1));
      // the placement check on the start skill (not in toddler mode, and not for a top rung that has nothing above it)
      if (opt.check !== false && !A.toddler(p) && !s.soon) { cur.placeOffer = true; cur.placeDone = false; cur.placeStart = true; var T = C.track(p, subj); T.placeSteps = 0; }
    }
    return s;
  }
  function applyAll(p, opt) { ['math', 'reading', 'concepts'].forEach(function (s) { if (C.list(s).length) apply(p, s, opt); }); return p; }
  // the grown-up changed the age: move the starting point (stars, prizes and skills earned in play are kept)
  function reAge(p, age, opt) { p.age = age; return applyAll(p, opt); }
  function set(p, subj, v) { p.levels = p.levels || {}; p.levels[subj] = v; return v === 'off' ? null : apply(p, subj); }
  function autoName(p, subj) { var s = startFor(subj, byAge(p, subj)); if (!s) return ''; var sk = C.byId[s.id]; return sk.name + (s.soon ? ' (top)' : sk.levels.length > 1 ? ' · level ' + (s.level + 1) : ''); }
  function ageText(age) { return AGE_TEXT[age == null ? 'skip' : Math.min(Math.max(age, 2), 8)]; }
  A.Levels = { autoName: autoName, ageText: ageText, GRADES: GRADES, START: START, AGE_START: AGE_START, AGE_TEXT: AGE_TEXT, reAge: reAge, byAge: byAge, grade: grade, startFor: startFor, apply: apply, applyAll: applyAll, set: set,
    soon: function (p, subj) { var g = grade(p, subj); return g !== 'off' && !!(startFor(subj, g) || {}).soon; },
    off: function (p, subj) { return !!(p.levels && p.levels[subj] === 'off'); } };

  /* "Read stories aloud" (grown-up setting per player): auto = on for age 5 and under (or no age), off for 6+.
     Off: a story question only says the question; the passage is still read by the speaker button. */
  function readOn(p) { if (!p) return true; if (p.readStories === true || p.readStories === false) return p.readStories; return p.age == null || A.Age.preReader(p); }
  A.ReadAloud = { on: readOn, set: function (p, v) { p.readStories = v; },
    // the parts to say automatically for a rule / question (the speaker button always uses .say)
    auto: function (p, r) { return r && r.sayAuto && !readOn(p) ? r.sayAuto : r && r.say; } };
})(window.Arcade);
