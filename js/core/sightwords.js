/* Blob Arcade — Sight Words data (stub for the upcoming Sight Words game).
   Standard Dolch lists: Pre-Primer (40 words) and Primer (52 words). */
(function (A) {
  'use strict';
  var PREPRIMER = ['a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for', 'funny', 'go', 'help', 'here', 'I', 'in', 'is', 'it', 'jump', 'little',
    'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said', 'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you'];
  var PRIMER = ['all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came', 'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like',
    'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran', 'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this',
    'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will', 'with', 'yes'];
  function id(w) { return 'word_' + String(w).toLowerCase().replace(/[^a-z]/g, ''); }

  /* quality1 C2: a mute fallback for "listen and find the word". When the device can't speak,
     a sight-word ask becomes a fill-in sentence. Each entry: [word, sentence, words that do NOT fit].
     The "bad" words were picked so they cannot complete the sentence (wrong word class), so the
     sentence has exactly one right answer among the choices shown. Checked by tools/content-lint.js. */
  var CLOZE = [
    ['go', 'Can we ___ to the park?', ['yellow', 'three', 'the', 'my', 'funny']],
    ['see', 'I can ___ the moon in the sky.', ['yellow', 'three', 'the', 'you', 'and']],
    ['the', 'Look at ___ big sun!', ['jump', 'is', 'and', 'said', 'go']],
    ['and', 'I like cats ___ dogs.', ['the', 'red', 'my', 'run', 'we']],
    ['is', 'The sun ___ hot.', ['go', 'the', 'my', 'run', 'three']],
    ['can', 'Birds ___ fly.', ['the', 'yellow', 'my', 'is', 'three']],
    ['run', 'Dogs like to ___ fast.', ['the', 'yellow', 'my', 'is', 'three']],
    ['jump', 'Frogs ___ up high.', ['the', 'yellow', 'my', 'and', 'three']],
    ['play', 'Let\u2019s ___ a game.', ['the', 'yellow', 'my', 'is', 'three']],
    ['help', 'Can you ___ me?', ['the', 'yellow', 'my', 'three', 'and']],
    ['find', 'Did you ___ my hat?', ['the', 'yellow', 'three', 'and', 'is']],
    ['come', 'Please ___ here.', ['the', 'yellow', 'my', 'three', 'and']],
    ['said', '\u201cHi!\u201d ___ the cat.', ['the', 'yellow', 'my', 'three', 'go']],
    ['you', 'Thank ___!', ['the', 'yellow', 'my', 'go', 'is']],
    ['my', 'This is ___ dog.', ['go', 'is', 'and', 'said', 'jump']],
    ['we', 'Mom and I said, \u201c___ can do it!\u201d', ['the', 'yellow', 'my', 'go', 'said']],
    ['me', 'Come with ___.', ['the', 'yellow', 'three', 'go', 'and']],
    ['to', 'I want ___ go home.', ['the', 'yellow', 'my', 'is', 'and']],
    ['up', 'The balloon went ___ in the sky.', ['the', 'yellow', 'my', 'is', 'said']],
    ['down', 'Sit ___ on the rug.', ['the', 'yellow', 'my', 'is', 'said']],
    ['here', 'Come over ___.', ['the', 'yellow', 'my', 'is', 'said']],
    ['where', '___ is my cat?', ['the', 'yellow', 'go', 'said', 'and']],
    ['one', 'A cat has ___ tail.', ['go', 'is', 'and', 'said', 'jump']],
    ['two', 'I have ___ hands.', ['go', 'is', 'and', 'said', 'jump']],
    ['three', 'A triangle has ___ sides.', ['go', 'is', 'and', 'said', 'jump']],
    ['red', 'A fire truck is ___.', ['go', 'and', 'said', 'jump', 'the']],
    ['blue', 'The sky is ___.', ['go', 'and', 'said', 'jump', 'the']],
    ['yellow', 'A banana is ___.', ['go', 'and', 'said', 'jump', 'the']],
    ['big', 'An elephant is very ___.', ['go', 'and', 'said', 'jump', 'the']],
    ['little', 'A baby mouse is very ___.', ['go', 'and', 'said', 'jump', 'the']],
    ['not', 'A fish can ___ walk.', ['the', 'yellow', 'my', 'and', 'three']],
    ['for', 'This gift is ___ you.', ['the', 'yellow', 'go', 'jump', 'three']],
    ['make', 'Let\u2019s ___ a cake.', ['the', 'yellow', 'my', 'is', 'three']],
    ['away', 'The bird flew ___.', ['the', 'my', 'is', 'said', 'and']],
    ['look', '___ at the stars!', ['the', 'my', 'is', 'said', 'three']],
    ['funny', 'The clown is ___.', ['go', 'and', 'said', 'jump', 'the']],
    ['it', 'I like ___!', ['the', 'and', 'said', 'is', 'my']],
    ['are', 'We ___ friends.', ['the', 'yellow', 'go', 'said', 'under']],
    ['was', 'The cake ___ good.', ['the', 'they', 'go', 'under', 'she']],
    ['she', 'Mom said ___ is happy.', ['the', 'under', 'went', 'ran', 'into']],
    ['have', 'I ___ a pet dog.', ['the', 'under', 'into', 'they', 'she']],
    ['like', 'Do you ___ pizza?', ['the', 'under', 'into', 'they', 'she']],
    ['what', '___ is your name?', ['the', 'under', 'into', 'did', 'ran']],
    ['there', 'Put the box over ___.', ['the', 'she', 'ran', 'into', 'did']],
    ['under', 'The cat hid ___ the bed.', ['she', 'ran', 'they', 'did', 'was']],
    ['into', 'The frog jumped ___ the pond.', ['she', 'they', 'did', 'was', 'have']],
    ['good', 'This pie is so ___!', ['she', 'they', 'into', 'under', 'did']],
    ['please', 'Can I have some milk, ___?', ['she', 'they', 'into', 'under', 'ran']],
    ['went', 'Yesterday we ___ to the zoo.', ['she', 'they', 'into', 'under', 'our']],
    ['white', 'Snow is ___.', ['she', 'they', 'into', 'did', 'went']],
    ['eat', 'Cows ___ grass.', ['she', 'they', 'into', 'under', 'our']],
    ['four', 'A dog has ___ legs.', ['she', 'they', 'into', 'did', 'went']],
    ['with', 'Come and play ___ me.', ['she', 'they', 'did', 'went', 'our']],
    ['who', '___ is at the door?', ['into', 'did', 'our', 'under', 'went']],
    ['ride', 'I can ___ my bike.', ['she', 'they', 'into', 'under', 'our']],
    // 1st-grade Dolch
    ['again', 'Can you read it ___?', ['of', 'her', 'them', 'from', 'an']],
    ['could', 'I ___ not find my sock.', ['of', 'her', 'them', 'from', 'an']],
    ['from', 'This card is ___ my dad.', ['could', 'were', 'them', 'walk', 'has']],
    ['had', 'Yesterday I ___ a cold.', ['of', 'them', 'were', 'an', 'from']],
    ['her', 'The girl lost ___ hat.', ['of', 'were', 'could', 'has', 'walk']],
    ['how', '___ old are you?', ['of', 'were', 'them', 'an', 'has']],
    ['of', 'I want a cup ___ milk.', ['were', 'them', 'could', 'has', 'her']],
    ['open', 'Please ___ the door.', ['of', 'were', 'could', 'has', 'an']],
    ['them', 'I fed the ducks and waved at ___.', ['of', 'were', 'could', 'has', 'an']],
    ['were', 'We ___ at the beach.', ['of', 'them', 'an', 'has', 'from']],
    ['walk', 'I like to ___ my dog.', ['of', 'were', 'them', 'an', 'her']],
    ['thank', '___ you for the gift!', ['of', 'were', 'them', 'an', 'has']],
    ['when', 'Wake me up ___ it is time.', ['of', 'were', 'them', 'an', 'has']],
    ['every', 'I brush my teeth ___ day.', ['of', 'were', 'them', 'has', 'could']],
    ['fly', 'Birds can ___.', ['of', 'were', 'them', 'an', 'her']],
    // 2nd-grade Dolch
    ['always', 'I ___ brush my teeth at night.', ['green', 'five', 'those', 'upon', 'its']],
    ['because', 'I wore a coat ___ it was cold.', ['green', 'five', 'those', 'its', 'sing']],
    ['before', 'Wash your hands ___ you eat.', ['green', 'five', 'its', 'sing', 'those']],
    ['cold', 'Ice cream is ___.', ['sing', 'upon', 'those', 'which', 'write']],
    ['first', 'A is the ___ letter of the alphabet.', ['sing', 'upon', 'those', 'write', 'wash']],
    ['green', 'Grass is ___.', ['sing', 'upon', 'those', 'which', 'write']],
    ['their', 'The kids ate ___ lunch.', ['sing', 'upon', 'which', 'write', 'wash']],
    ['which', '___ way is the park?', ['sing', 'upon', 'those', 'write', 'five']],
    ['why', '___ is the sky blue?', ['sing', 'upon', 'those', 'write', 'green']],
    ['write', 'Can you ___ your name?', ['upon', 'those', 'green', 'five', 'its']],
    ['sleep', 'At night I go to ___.', ['upon', 'those', 'green', 'its', 'which']],
    ['five', 'I have ___ fingers on one hand.', ['sing', 'upon', 'write', 'wash', 'which']],
    ['found', 'I ___ my lost shoe!', ['upon', 'those', 'green', 'its', 'which']],
    ['very', 'The bear is ___ big.', ['sing', 'upon', 'those', 'write', 'which']],
    ['would', '___ you like some juice?', ['sing', 'upon', 'those', 'green', 'its']],
    ['pull', 'Push or ___ the wagon.', ['upon', 'those', 'green', 'its', 'which']],
    // 3rd-grade Dolch
    ['carry', 'Can you help me ___ this heavy box?', ['eight', 'warm', 'together', 'today', 'small']],
    ['laugh', 'Funny jokes make me ___.', ['eight', 'warm', 'together', 'today', 'myself']],
    ['eight', 'A spider has ___ legs.', ['laugh', 'carry', 'together', 'today', 'myself']],
    ['warm', 'A blanket keeps you ___.', ['laugh', 'carry', 'eight', 'today', 'myself']],
    ['together', 'We built the fort ___.', ['eight', 'carry', 'laugh', 'small', 'if']],
    ['today', '___ is my birthday!', ['eight', 'carry', 'laugh', 'small', 'if']],
    ['never', 'Fish ___ walk on land.', ['eight', 'carry', 'laugh', 'small', 'warm']],
    ['grow', 'Plants need water to ___.', ['eight', 'small', 'myself', 'if', 'together']],
    ['drink', 'I ___ milk with lunch.', ['eight', 'small', 'myself', 'if', 'together']],
    ['light', 'Turn on the ___. It is dark.', ['eight', 'carry', 'laugh', 'myself', 'if']],
    ['myself', 'I made my bed all by ___.', ['eight', 'carry', 'laugh', 'warm', 'if']],
    ['bring', 'Please ___ your book to school.', ['eight', 'small', 'myself', 'if', 'together']]
  ];
  var CLOZE_BY = {};
  CLOZE.forEach(function (c) { CLOZE_BY[c[0]] = { word: c[0], text: c[1], bad: c[2] }; });
  A.SightWords = {
    CLOZE: CLOZE,
    // no voice can play (voice switch off, mute-all, voice volume 0, or this child's talking set to Off)
    quiet: function () {
      var st = (A.Store && A.Store.settings) || {};
      if (st.voice === false || st.muteAll || (st.voiceVol != null && +st.voiceVol === 0)) return true;
      try { return !!(A.Talk && A.Talk.mode() === 'off'); } catch (e) { return false; }
    },
    // turn a "listen and find the word" generator result into a fill-in sentence when quiet (or force)
    // r: {text, say, target, good(), bad()}; pool: the level's words; mk(w): the cell builder
    mute: function (r, pool, mk, force) {
      if (!force && !A.SightWords.quiet()) return r;
      var can = pool.filter(function (w) { return CLOZE_BY[String(w).toLowerCase()]; });
      if (!can.length) return r;
      var T = can[Math.floor(Math.random() * can.length)], c = CLOZE_BY[T.toLowerCase()];
      var html = '<span class="cloze">' + c.text.replace('___', '<span class="blank">____</span>') + '</span>';
      return { text: html, plainText: c.text, listen: false, cloze: true, hint: 'Read the sentence. Which word makes sense in the blank?', say: r.say, target: T,
        good: function () { return mk(T); }, bad: function () { return mk(c.bad[Math.floor(Math.random() * c.bad.length)]); } };
    },
    cloze: function (w) { return CLOZE_BY[String(w).toLowerCase()] || null; },
    lists: [
      { id: 'dolch_preprimer', name: 'Dolch Pre-Primer', words: PREPRIMER },
      { id: 'dolch_primer', name: 'Dolch Primer', words: PRIMER }
    ],
    PREPRIMER: PREPRIMER, PRIMER: PRIMER, lineId: id,
    // Planned game flow (not built yet): introduce 3–4 new words at a time, mastery = read correctly on 3 separate days.
    plan: { newPerSession: 3, masteryDays: 3 }
  };
})(window.Arcade);
