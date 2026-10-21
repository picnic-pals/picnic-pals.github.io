/* Blob Arcade — the first non-math skills, plugged in with A.Curriculum.register (see curriculum-math.js):
   Early Concepts: colors, shapes · Reading & Words: letters, beginning sounds, rhymes, Dolch pre-primer sight words.
   Each skill: 2 levels, gen(level) for Mochi Munch (good() / bad() cells), ask(level, n) for Blob Baseball and bonus
   questions (exactly one right choice), intro line + example, rule voice lines. Data is in early-words.js.
   Load after curriculum-math.js (and questions.js where it is used). */
(function (A) {
  'use strict';
  var C = A.Curriculum, E = A.EarlyWords, rnd = A.rnd, pick = A.pick;
  if (!C || !E) return;
  function em(t) { return '<b class="hl">' + t + '</b>'; }
  function others(arr, x) { return arr.filter(function (v) { return v !== x; }); }
  var COL = {}; E.COLORS.forEach(function (c) { COL[c.id] = c; });
  function shade(hex, k) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; function f(v) { return Math.max(0, Math.min(255, Math.round(v * k))); } return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')'; }

  /* ---------- pictures ---------- */
  function emo(w) { return '<span class="ea-emo" aria-hidden="true">' + E.PICS[w] + '</span>'; }
  function picCell(w, fact) { var p = E.pic(w); return { label: w, html: emo(w), fact: fact, name: [p.line], k: w }; }
  // a blob of paint (color swatch)
  function swatch(id, cls) {
    var c = COL[id];
    return '<svg class="' + (cls || 'ea-svg') + '" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 9C73 7 92 25 90 49C89 72 73 92 49 90C26 92 9 74 10 50C9 27 27 10 50 9Z" fill="' + c.hex + '" stroke="' + shade(c.hex, .72) + '" stroke-width="4"/>' +
      '<ellipse cx="36" cy="33" rx="11" ry="7" fill="#fff" opacity=".35"/></svg>';
  }
  /* ---------- shapes (SVG, viewBox 100) ---------- */
  function starPts() { var p = []; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 19 : 45; p.push((50 + r * Math.cos(a)).toFixed(1) + ',' + (54 + r * Math.sin(a)).toFixed(1)); } return p.join(' '); }
  var STAR = starPts();
  function shapeEl(kind, v) {
    switch (kind) {
      case 'circle': return '<circle cx="50" cy="50" r="40"/>';
      case 'square': return '<rect x="14" y="14" width="72" height="72" rx="3"/>';
      case 'triangle': return ['<polygon points="50,10 92,86 8,86"/>', '<polygon points="50,6 80,90 20,90"/>', '<polygon points="14,12 14,88 88,88"/>'][v % 3];
      case 'star': return '<polygon points="' + STAR + '"/>';
      case 'heart': return '<path d="M50 88C24 70 6 52 14 30C22 12 44 12 50 30C56 12 78 12 86 30C94 52 76 70 50 88Z"/>';
      case 'rectangle': return v % 2 ? '<rect x="8" y="30" width="84" height="40" rx="2"/>' : '<rect x="10" y="26" width="80" height="48" rx="2"/>';
      case 'oval': return v % 2 ? '<ellipse cx="50" cy="50" rx="44" ry="26"/>' : '<ellipse cx="50" cy="50" rx="45" ry="29"/>';
      case 'diamond': return '<polygon points="50,4 80,50 50,96 20,50"/>';
    }
    return '';
  }
  var SHAPE_COLORS = ['#E53935', '#FB8C00', '#F9C80E', '#43A047', '#1E88E5', '#8E24AA', '#EC5F9A', '#00ACC1'];
  function shapeSVG(kind, L, color) {
    var v = rnd(0, 5), s = L ? rnd(55, 100) / 100 : rnd(72, 100) / 100, rot = 0, col = color || pick(SHAPE_COLORS);
    if (kind === 'triangle') rot = L ? pick([0, 0, 180, 15, -15, 90]) : pick([0, 0, 10, -10]);
    else if (kind === 'rectangle' || kind === 'oval') rot = pick([0, 90]);
    else if (kind === 'star' || kind === 'heart') rot = L ? pick([0, -12, 12]) : 0;
    else if (kind === 'diamond') rot = L ? pick([0, 0, 90]) : 0;
    return '<svg class="ea-svg" viewBox="0 0 100 100" aria-hidden="true"><g transform="translate(50 50) rotate(' + rot + ') scale(' + s.toFixed(2) + ') translate(-50 -50)" fill="' + col + '" stroke="' + shade(col, .7) + '" stroke-width="4" stroke-linejoin="round">' + shapeEl(kind, v) + '</g></svg>';
  }
  function shapeIcon(kind) { return '<svg class="ea-mini" viewBox="0 0 100 100" aria-hidden="true"><g fill="#fff" stroke="#6b5a8e" stroke-width="7" stroke-linejoin="round">' + shapeEl(kind, 0) + '</g></svg>'; }
  function ltrHtml(ch) { return '<span class="ea-ltr">' + ch + '</span>'; }
  function wordHtml(w) { return '<span class="ea-word">' + w + '</span>'; }

  /* ---------- question builder (Baseball / bonus): one good cell + bad cells with different keys ---------- */
  function askFrom(gen, q) {
    return function (L, n) {
      var r = gen(L), good = r.good(), cells = [good], keys = {}, labels = {}, g = 0; keys[good.k] = 1; labels[good.label] = 1;
      while (cells.length < n && g++ < 300) { var b = r.bad(); if (!keys[b.k] && !labels[b.label]) { keys[b.k] = 1; labels[b.label] = 1; cells.push(b); } }
      var arr = A.shuffle(cells.slice()), Q = q(r);
      return { text: Q.text, pic: Q.pic || null, say: Q.say, fact: good.fact, answer: arr.indexOf(good), target: r.target,
        choices: arr.map(function (c) { return { label: c.label, html: c.html, say: c.name, k: c.k }; }) };
    };
  }

  /* ================= skills ================= */
  var SK = [];
  /* ----- Colors (Early Concepts) ----- */
  SK.push({ id: 'colors', name: 'Colors', short: 'Find things by color', strand: 'Colors', std: 'PK colors', grade: 'PK', subject: 'concepts', sayFact: true, secs: [9, 10],
    levels: ['Red, yellow, blue, green', 'Eight colors'],
    intro: { line: 'skill_colors', example: swatch('red', 'ea-svg ex') + ' ' + emo('apple') + ' ' + emo('strawberry') + ' are red' },
    gen: function (L) {
      var pal = E.COLOR_LEVELS[L], T = pick(pal), tc = COL[T];
      function mk(cid) {
        var c = COL[cid], line = E.colorLine(cid);
        if (Math.random() < .35 || !c.things.length) return { label: cid + ' paint', html: swatch(cid), fact: ['w_thats', line], name: [line], k: cid, color: cid };
        var w = pick(c.things), p = E.pic(w); return { label: w, html: emo(w), fact: [p.line, p.pl ? 'w_are' : 'w_is', line], name: [p.line], k: cid, color: cid };
      }
      return { text: 'Munch the ' + swatch(T, 'ea-mini') + ' ' + em(T) + ' things', hint: 'Look for ' + T + '!', say: ['rule_color_' + T], target: T,
        good: function () { return mk(T); },
        bad: function () { var close = (E.COLOR_CLOSE[T] || []).filter(function (x) { return pal.indexOf(x) >= 0; }); return mk(L && close.length && Math.random() < .5 ? pick(close) : pick(others(pal, T))); } };
    } });
  SK[0].ask = askFrom(SK[0].gen, function (r) { return { text: 'Which one is ' + swatch(r.target, 'ea-mini') + ' ' + em(r.target) + '?', say: ['q_which_is', E.colorLine(r.target)] }; });

  /* ----- Shapes (Early Concepts) ----- */
  SK.push({ id: 'shapes', name: 'Shapes', short: 'Circles, squares, triangles and more', strand: 'Shapes', std: 'PK / K.G.2', grade: 'PK', subject: 'concepts', sayFact: true, secs: [9, 10],
    levels: ['Circle, square, triangle, star, heart', '+ rectangle, oval, diamond'],
    intro: { line: 'skill_shapes', example: shapeSVG('circle', 0, '#1E88E5') + shapeSVG('square', 0, '#43A047') + shapeSVG('triangle', 0, '#E53935') },
    gen: function (L) {
      var set = E.SHAPE_LEVELS[L], T = pick(set);
      function mk(kind) { return { label: kind, html: shapeSVG(kind, L), fact: ['w_thats', 'sh_' + kind], name: ['sh_' + kind], k: kind }; }
      return { text: 'Munch the ' + shapeIcon(T) + ' ' + em(E.SHAPES[T]), hint: 'Big or small, any color!', say: ['rule_shape_' + T], target: T,
        good: function () { return mk(T); },
        bad: function () { var close = (E.SHAPE_CLOSE[T] || []).filter(function (x) { return set.indexOf(x) >= 0; }); return mk(L && close.length && Math.random() < .45 ? pick(close) : pick(others(set, T))); } };
    } });
  SK[1].ask = askFrom(SK[1].gen, function (r) { return { text: 'Which one is ' + (/^[aeiou]/.test(r.target) ? 'an ' : 'a ') + em(r.target) + '?', say: ['q_which_is', 'sh_' + r.target] }; });

  /* ----- Letters (Reading & Words) ----- */
  SK.push({ id: 'letters', name: 'Letters', short: 'Find the letter (upper- and lowercase)', strand: 'Letters', std: 'PK / K.RF.1d', grade: 'PK', subject: 'reading', sayFact: true, secs: [9, 10],
    levels: ['Big letters (A B C)', 'Big and little letters (B b)'],
    intro: { line: 'skill_letters', example: ltrHtml('B') + ' ' + ltrHtml('b') + ' &nbsp;=&nbsp; B' },
    gen: function (L) {
      var pool = L ? E.LETTERS_BOTH : E.LETTERS, T = pick(pool);
      function mk(ch) { var up = !L || Math.random() < .5, s = up ? ch.toUpperCase() : ch; return { label: s, html: ltrHtml(s), fact: ['w_thats', 'lt_' + ch], name: ['lt_' + ch], k: ch }; }
      return { text: 'Munch the letter ' + em(L ? T.toUpperCase() + ' ' + T : T.toUpperCase()), hint: L ? 'Big ' + T.toUpperCase() + ' and little ' + T + '!' : 'Find ' + T.toUpperCase() + '!',
        say: L ? ['rule_letter', 'lt_' + T, 'w_big_little'] : ['rule_letter', 'lt_' + T], target: T,
        good: function () { return mk(T); },
        bad: function () { var close = (E.LETTER_CLOSE[T] || '').split('').filter(function (x) { return pool.indexOf(x) >= 0; }); return mk(close.length && Math.random() < (L ? .55 : .3) ? pick(close) : pick(others(pool, T))); } };
    } });
  SK[2].ask = askFrom(SK[2].gen, function (r) { return { text: 'Which one is the letter ' + em(r.target.toUpperCase()) + '?', say: ['q_which_letter', 'lt_' + r.target] }; });

  /* ----- Beginning sounds (Reading & Words) ----- */
  SK.push({ id: 'begsound', name: 'Beginning sounds', short: 'Pictures that start with a letter’s sound', strand: 'Phonics', std: 'K.RF.2d / K.RF.3a', grade: 'PK–K', subject: 'reading', sayFact: true, secs: [11, 12],
    levels: ['B, M, S, T, P, D', '13 letters'],
    intro: { line: 'skill_begsound', example: emo('banana') + ' ' + emo('bear') + ' ' + emo('bus') + ' start with ' + ltrHtml('B') },
    gen: function (L) {
      var lets = E.BEGIN_LEVELS[L], T = pick(lets), anchor = pick(E.BEGIN[T]), all = Object.keys(E.BEGIN);
      function mk(ch) { var w = pick(E.BEGIN[ch]); return picCell(w, [E.pic(w).line, 'w_starts_with', 'lt_' + ch]); }
      return { text: 'Munch the things that start with ' + em(T.toUpperCase()), hint: 'Like ' + E.PICS[anchor] + ' ' + anchor + '!', say: ['rule_begins', 'lt_' + T, 'w_like', E.pic(anchor).line], target: T,
        good: function () { return mk(T); }, bad: function () { return mk(pick(others(L ? all : lets.concat(pick([['f', 'g'], ['h', 'k'], ['l', 'r'], ['w', 'f']])), T))); } };
    } });
  SK[3].ask = askFrom(SK[3].gen, function (r) { return { text: 'Which one starts with ' + em(r.target.toUpperCase()) + '?', say: ['q_which_starts', 'lt_' + r.target] }; });

  /* ----- Rhymes (Reading & Words) ----- */
  var RHY_ALL = {}; Object.keys(E.RHYMES).forEach(function (k) { E.RHYMES[k].forEach(function (w) { RHY_ALL[w] = k; }); });
  SK.push({ id: 'rhymes', name: 'Rhymes', short: 'Pictures that rhyme', strand: 'Phonological awareness', std: 'K.RF.2a', grade: 'PK–K', subject: 'reading', sayFact: true, secs: [12, 13],
    levels: ['Easy rhymes', 'Tricky look-alikes (cat · car)'],
    intro: { line: 'skill_rhymes', example: emo('cat') + ' cat · ' + emo('hat') + ' hat · ' + emo('bat') + ' bat' },
    gen: function (L) {
      var setId = pick(E.RHYME_LEVELS[L]), set = E.RHYMES[setId], T = pick(set), tl = E.pic(T).line;
      var far = []; E.RHYME_LEVELS[L].forEach(function (k) { if (k !== setId) far = far.concat(E.RHYMES[k]); }); far = far.concat(E.RHYME_OTHERS);
      var same = Object.keys(E.PICS).filter(function (w) { return w.charAt(0) === T.charAt(0) && RHY_ALL[w] !== setId && w.indexOf(' ') < 0 && E.RHYME_OTHERS.concat(Object.keys(RHY_ALL)).indexOf(w) >= 0; });
      return { text: 'Munch the things that rhyme with ' + em(E.PICS[T] + ' ' + T), hint: 'Does it end like ' + T + '?', say: ['rule_rhymes', tl], target: T,
        good: function () { var w = pick(others(set, T)); return picCell(w, [E.pic(w).line, 'w_rhymes_with', tl]); },
        bad: function () { var w = L && same.length && Math.random() < .4 ? pick(same) : pick(far); return picCell(w, [E.pic(w).line, 'w_no_rhyme', tl]); } };
    } });
  SK[4].ask = askFrom(SK[4].gen, function (r) { return { text: 'Which one rhymes with ' + em(E.PICS[r.target] + ' ' + r.target) + '?', say: ['q_which_rhymes', E.pic(r.target).line] }; });

  /* ----- Sight words (Reading & Words) ----- */
  function swLine(w) { return A.SightWords.lineId(w); }
  SK.push({ id: 'sight', name: 'Sight words', short: 'Dolch pre-primer words', strand: 'Sight words', std: 'K.RF.3c', grade: 'PK–K', subject: 'reading', sayFact: false, secs: [10, 11],
    levels: ['First 20 words', 'All 40 pre-primer words'],
    intro: { line: 'skill_sight', example: wordHtml('the') + ' ' + wordHtml('and') + ' ' + wordHtml('see') },
    gen: function (L) {
      var pool = E.SIGHT_LEVELS[L], T = pick(pool);
      var like = pool.filter(function (w) { return w !== T && (w.charAt(0).toLowerCase() === T.charAt(0).toLowerCase() || w.length === T.length); });
      function mk(w) { return { label: w, html: wordHtml(w), fact: ['sw_that_says', swLine(w)], name: [swLine(w)], k: w.toLowerCase() }; }
      return { text: 'Munch the word ' + em(T), hint: 'Look at every letter!', say: ['rule_sight', swLine(T)], target: T,
        good: function () { return mk(T); }, bad: function () { return mk(like.length && Math.random() < (L ? .55 : .3) ? pick(like) : pick(others(pool, T))); } };
    } });
  SK[5].ask = askFrom(SK[5].gen, function (r) { return { text: 'Find the word ' + em(r.target), say: ['sw_find', swLine(r.target)] }; });

  // concepts first (colors, shapes), then reading (letters, beginning sounds, rhymes, sight words); math order is unchanged
  SK.forEach(function (s) { C.register(s); });
  A.EarlySkills = { ids: SK.map(function (s) { return s.id; }), swatch: swatch, shapeSVG: shapeSVG, askFrom: askFrom };
})(window.Arcade);

/* Bonus stars in Mochi Munch: some bonus questions come from the kid's reading / early-concepts skills (as often as her
   subject mix says), asked at her level and logged against that skill. Needs questions.js on the page. */
(function (A) {
  'use strict';
  var C = A.Curriculum, BQ = A.BonusQ;
  if (!C || !BQ || BQ.skillWrapped) return;
  var orig = BQ.pick; BQ.skillWrapped = true;
  function plain(h) { return String(h || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function fromSkill(p, subj) {
    var s = C.current(p, subj), st = C.state(p, s.id), b = p.bonus || (p.bonus = { asked: 0, right: 0, recent: [] }), recent = b.recent || (b.recent = []), q, id, g = 0;
    do { q = A.Questions.make(s, st.level, { choices: p.age != null && p.age <= 5 ? 3 : 4 }); id = 'skill:' + s.id + ':' + q.target + ':' + q.choices[q.answer].label; } while (recent.indexOf(id) >= 0 && g++ < 12);
    recent.push(id); while (recent.length > 60) recent.shift();   // not the same question again soon
    return { id: id, skill: s.id, level: st.level, cat: 'skill', d: 1, q: plain(q.text), line: null, parts: q.say, answer: q.answer,
      choices: q.choices.map(function (c) { return { emoji: c.html || A.esc(c.label), text: c.label, hideText: true, parts: c.say || [c.label] }; }) };
  }
  BQ.pick = function (p, opt) {
    var w = C.mixWeights(p), early = (w.reading || 0) + (w.concepts || 0);
    if (A.Questions && early > 0 && (opt && opt.skill || Math.random() < early * .8)) {
      var subj = (opt && opt.subject) || (Math.random() * early < (w.concepts || 0) ? 'concepts' : 'reading');
      if (C.list(subj).length) { var b = p.bonus || (p.bonus = { asked: 0, right: 0, recent: [] }); b.asked = (b.asked || 0) + 1; return fromSkill(p, subj); }
    }
    return orig(p);
  };
  BQ.fromSkill = fromSkill;
})(window.Arcade);
