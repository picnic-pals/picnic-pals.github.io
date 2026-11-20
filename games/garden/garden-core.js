/* Picnic Pals — Garden core: 6 plots, shelf planting, per-friend growth, age-banded questions, garden-only unlocks. */
(function (A) {
  'use strict';
  var SESSION_SOFT = 10;
  var PLOT_COUNT = 6;
  var FIRST_ID = 'peapod';
  var HOP_MS = 600;
  var NEED_FALLBACK = { peapod: 10, potato: 25, tomato: 25, cherries: 35, pumpkin: 50 };
  var HELPERS = ['carrot', 'banana']; /* Crunch and Peel */
  var STAGES = ['empty', 'seed', 'sprout', 'small', 'grown', 'peek', 'pop'];
  var FOODS = [
    { id: 'carrot', name: 'carrot', plural: 'carrots' },
    { id: 'seed', name: 'seed', plural: 'seeds' },
    { id: 'tomato', name: 'tomato', plural: 'tomatoes' },
    { id: 'potato', name: 'potato', plural: 'potatoes' },
    { id: 'pea', name: 'pea', plural: 'peas' },
    { id: 'pumpkin', name: 'pumpkin', plural: 'pumpkins' },
    { id: 'cherry', name: 'cherry', plural: 'cherries' },
    { id: 'sprout', name: 'sprout', plural: 'sprouts' }
  ];
  var SIGHT = ['the', 'and', 'see', 'a', 'to', 'is', 'you', 'me', 'we', 'go', 'can', 'look', 'up', 'in', 'on', 'my', 'it', 'at'];

  function ids() { return (A.GardenFriends && A.GardenFriends.ids) || ['peapod', 'potato', 'tomato', 'cherries', 'pumpkin']; }
  function nameOf(id) { return (A.GardenFriends && A.GardenFriends.nameOf) ? A.GardenFriends.nameOf(id) : 'friend'; }
  function needOf(id) {
    if (A.GardenFriends && A.GardenFriends.needOf) return A.GardenFriends.needOf(id);
    return NEED_FALLBACK[id] || 25;
  }
  function isGarden(id) { return ids().indexOf(id) >= 0; }
  function rngOf(rng) { return typeof rng === 'function' ? rng : Math.random; }
  function num(rng, lo, hi) { return lo + Math.floor(rngOf(rng)() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rngOf(rng)() * arr.length)]; }
  function shuffle(rng, arr) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(rngOf(rng)() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function rank(id) { return id === 'toddler' ? 0 : id === 'pre' ? 1 : id === 'k' ? 2 : id === 'g1' ? 3 : 4; }
  function bandFor(p) {
    var age = A.Age && A.Age.band ? A.Age.band(p) : 'none';
    var tod = A.toddler ? A.toddler(p) : age === 'toddler';
    var id;
    if (tod) id = 'toddler';
    else if (age === 'pre' || age === 'pk') id = 'pre';
    else if (age === 'k' || age === 'none') id = 'k';
    else if (age === 'g1') id = 'g1';
    else id = 'g2';
    var explicit = p && p.levels && p.levels.math;
    var floor = A.Learn && A.Learn.floor ? A.Learn.floor(p, 'math') : 0;
    if (explicit && explicit !== 'auto') {
      var up = +explicit >= 1 ? 'g1' : 'pre';
      if (rank(up) > rank(id)) id = up;
    }
    if (floor >= 3 && rank('g1') > rank(id)) id = 'g1';
    if (floor >= 4 && rank('g2') > rank(id)) id = 'g2';
    return { id: id, toddler: id === 'toddler', words: id === 'pre' || id === 'k', math: id === 'g1' || id === 'g2' };
  }
  function unlockedCount(st) {
    var n = 0;
    ids().forEach(function (id) { if (st.plants[id] && st.plants[id].unlocked) n++; });
    return n;
  }
  function answersOf(st, id) { return (st.plants[id] && st.plants[id].answers) || 0; }
  function stageOf(answers, need) {
    if (answers <= 0) return 'empty';
    if (answers >= need) return 'pop';
    var t = answers / need;
    if (t < 0.2) return 'seed';
    if (t < 0.4) return 'sprout';
    if (t < 0.6) return 'small';
    if (t < 0.8) return 'grown';
    return 'peek';
  }
  function stageIndex(stage) { var i = STAGES.indexOf(stage); return i < 0 ? 0 : i; }
  function jobOf(answersBefore) { return answersBefore <= 0 ? 'plant' : (answersBefore % 2 === 1 ? 'water' : 'sun'); }
  function jobLine(job, friendName) {
    if (job === 'plant') return 'A seed is in the soil!';
    if (job === 'water') return 'You watered the plant!';
    if (job === 'sun') return 'The sun helped it grow!';
    if (job === 'pop') return friendName + ' popped out to join you!';
    return 'The garden grew a little!';
  }

  function emptyPlants() {
    var o = {};
    ids().forEach(function (id) { o[id] = { answers: 0, unlocked: false }; });
    return o;
  }
  function emptyPlots() {
    var a = [], i;
    for (i = 0; i < PLOT_COUNT; i++) a.push({ id: null, answers: 0 });
    return a;
  }
  function growingOn(st, id) {
    var i;
    for (i = 0; i < (st.plots || []).length; i++) if (st.plots[i].id === id) return i;
    return -1;
  }
  function packetOpen(st, id) {
    if (!isGarden(id)) return false;
    if (st.plants[id] && st.plants[id].unlocked) return false;
    if (growingOn(st, id) >= 0) return false;
    if (id === FIRST_ID) return true;
    if (st.plants[FIRST_ID] && st.plants[FIRST_ID].unlocked) return true;
    if (growingOn(st, FIRST_ID) >= 0) return true;
    return false;
  }
  function packetsOpen(st) {
    return ids().filter(function (id) { return packetOpen(st, id); });
  }
  function canPlant(st, id) { return packetOpen(st, id); }
  function emptyPlotIndexes(st) {
    var out = [], i;
    for (i = 0; i < st.plots.length; i++) if (!st.plots[i].id) out.push(i);
    return out;
  }
  function plantAt(st, plotIndex, id) {
    if (plotIndex < 0 || plotIndex >= PLOT_COUNT) return false;
    if (st.plots[plotIndex].id) return false;
    if (!canPlant(st, id)) return false;
    st.plots[plotIndex] = { id: id, answers: answersOf(st, id) || 0 };
    st.selected = plotIndex;
    return true;
  }
  function selectPlot(st, index) {
    if (index == null || index < 0 || index >= PLOT_COUNT) return false;
    if (!st.plots[index] || !st.plots[index].id) return false;
    st.selected = index;
    return true;
  }
  function selectedPlot(st) {
    if (st.selected != null && st.plots[st.selected] && st.plots[st.selected].id) return st.plots[st.selected];
    var i;
    for (i = 0; i < st.plots.length; i++) {
      if (st.plots[i].id && !(st.plants[st.plots[i].id] && st.plants[st.plots[i].id].unlocked)) {
        st.selected = i;
        return st.plots[i];
      }
    }
    for (i = 0; i < st.plots.length; i++) if (st.plots[i].id) { st.selected = i; return st.plots[i]; }
    return null;
  }
  function clearPlot(st, index) {
    if (index == null || !st.plots[index]) return;
    st.plots[index] = { id: null, answers: 0 };
    if (st.selected === index) {
      st.selected = null;
      selectedPlot(st);
    }
  }
  function finishPop(G) {
    if (!G) return;
    var st = G.state, idx = G.popPlot;
    if (idx == null && G.justUnlocked) idx = growingOn(st, G.justUnlocked);
    if (idx != null) clearPlot(st, idx);
    G.justUnlocked = null;
    G.popPlot = null;
  }
  function currentId(st) {
    var sel = selectedPlot(st);
    if (sel && sel.id && !(st.plants[sel.id] && st.plants[sel.id].unlocked)) return sel.id;
    var i, pl, list, id;
    for (i = 0; i < st.plots.length; i++) {
      pl = st.plots[i];
      if (pl.id && !(st.plants[pl.id] && st.plants[pl.id].unlocked)) return pl.id;
    }
    list = ids();
    for (i = 0; i < list.length; i++) {
      id = list[i];
      if (!st.plants[id] || !st.plants[id].unlocked) return id;
    }
    return null;
  }
  function needFor(st, id) { return needOf(id || currentId(st)); }

  function loadState(p) {
    var saved = (p && p.games && p.games.garden) || {};
    var st = { sessions: saved.sessions || 0, plants: emptyPlants(), plots: emptyPlots(), selected: null, starredThis: false };
    Object.keys(st.plants).forEach(function (id) {
      var s = (saved.plants || {})[id];
      if (!s) return;
      st.plants[id] = { answers: Math.max(0, s.answers || 0), unlocked: !!s.unlocked };
    });
    var migrated = false, i, s, id, list, pln;
    if (Array.isArray(saved.plots) && saved.plots.length) {
      for (i = 0; i < PLOT_COUNT; i++) {
        s = saved.plots[i];
        if (!s || !s.id || !isGarden(s.id)) continue;
        if (st.plants[s.id] && st.plants[s.id].unlocked) continue;
        st.plots[i] = { id: s.id, answers: Math.max(0, s.answers != null ? s.answers : (st.plants[s.id].answers || 0)) };
      }
    } else {
      list = ids();
      for (i = 0; i < list.length; i++) {
        id = list[i];
        pln = st.plants[id];
        if (pln && pln.answers > 0 && !pln.unlocked) {
          st.plots[0] = { id: id, answers: pln.answers };
          st.selected = 0;
          migrated = true;
          break;
        }
      }
    }
    if (saved.selected != null) selectPlot(st, saved.selected);
    else selectedPlot(st);
    st._migrated = migrated;
    return st;
  }
  function saveState(p, st) {
    if (!p || p.guest) return;
    p.games = p.games || {};
    var out = { sessions: st.sessions || 0, plants: {}, plots: [], selected: st.selected };
    ids().forEach(function (id) {
      var s = st.plants[id] || { answers: 0, unlocked: false };
      out.plants[id] = { answers: s.answers || 0, unlocked: !!s.unlocked };
    });
    st.plots.forEach(function (pl) {
      out.plots.push({ id: pl.id || null, answers: pl.answers || 0 });
    });
    p.games.garden = out;
    if (A.Store && A.Store.save) A.Store.save();
  }

  function near(T, n, lo, hi, rng) {
    var out = [T], g = 0, offs = [-1, 1, -2, 2, -3, 3, 4, -4, 5, -5];
    while (out.length < n && g++ < 80) {
      var v = T + pick(rng, offs);
      if (v >= lo && v <= hi && out.indexOf(v) < 0) out.push(v);
    }
    var v2;
    for (v2 = lo; out.length < n && v2 <= hi + n; v2++) if (out.indexOf(v2) < 0) out.push(v2);
    return out;
  }
  function esc(s) {
    return (A.esc ? A.esc(s) : String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
  }
  function foodIcon(food, size) {
    var raw = (food && (food.icon || food.id || food.name)) || 'cherries';
    var byId = { cherry: 'food.cherries', cherries: 'food.cherries', sprout: 'scenery.seedling', seed: 'scenery.seedling', pea: 'scenery.seedling', tomato: 'food.tomato', carrot: 'food.carrot', potato: 'food.potato', pumpkin: 'gaps.pumpkin' };
    var id = byId[raw] || byId[(food && food.plural) || ''] || ('food.' + raw);
    var opt = { size: size || 40, decorative: true, cls: 'pp-pic gd-food', context: 'question', word: (food && (food.plural || food.name)) || raw };
    if (A.Icons && A.Icons.html) {
      var html = A.Icons.html(id, opt);
      if (html && html.indexOf('<img') >= 0) return html;
      html = A.Icons.html('', opt);
      if (html && html.indexOf('<img') >= 0) return html;
      return html;
    }
    return esc(String((food && food.name) || raw));
  }
  function arrayPic(food, rows, cols) {
    var r, c, h = '<div class="gd-array" role="img" aria-label="' + rows + ' rows of ' + cols + ' ' + esc(food.plural) + '">';
    for (r = 0; r < rows; r++) {
      h += '<div class="gd-arow">';
      for (c = 0; c < cols; c++) h += foodIcon(food, 36);
      h += '</div>';
    }
    return h + '</div>';
  }
  function countByHint(rows, cols) {
    var i, seq = [];
    for (i = 1; i <= rows; i++) seq.push(i * cols);
    return 'Count by ' + cols + 's: ' + seq.join(', ') + '.';
  }
  function numQ(text, say, T, vals, fact, skill, extra) {
    var arr = vals.slice(), q;
    q = {
      text: text, say: say, fact: fact || ('The answer is ' + T + '.'), skill: skill || null,
      choices: arr.map(function (v) { return { label: String(v), say: String(v), value: v }; }),
      answer: arr.indexOf(T)
    };
    if (extra) { var k; for (k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) q[k] = extra[k]; }
    return q;
  }

  function gardenMath(p, band, rng) {
    var food = pick(rng, FOODS), nChoices = band.id === 'g2' ? 4 : 3, T, a, b, rows, cols, kind;
    var hi = band.id === 'g2' ? 20 : (band.id === 'g1' ? 12 : 10);
    kind = pick(rng, band.id === 'pre' || band.id === 'k'
      ? ['count', 'addseeds']
      : ['rows', 'addseeds', 'pick', 'count']);
    if (band.id === 'g2' && rng() < 0.35) kind = 'rows';
    if (kind === 'rows') {
      rows = num(rng, 2, band.id === 'g2' ? 5 : 4);
      cols = num(rng, 2, band.id === 'g2' ? 5 : 4);
      if (rows * cols > (band.id === 'g2' ? 20 : 16)) { rows = 3; cols = 4; }
      T = rows * cols;
      return numQ(
        rows + ' rows of ' + cols + ' ' + food.plural + '. How many ' + food.plural + '?',
        rows + ' rows of ' + cols + ' ' + food.plural + '. How many ' + food.plural + '?',
        T, shuffle(rng, near(T, nChoices, 2, Math.max(hi, T + 4), rng)),
        rows + ' rows of ' + cols + ' is ' + T + '.',
        'wordprob',
        { pic: arrayPic(food, rows, cols), rows: rows, cols: cols, food: food, hint: countByHint(rows, cols) }
      );
    }
    if (kind === 'addseeds') {
      a = num(rng, 1, band.id === 'pre' ? 5 : (band.id === 'g2' ? 12 : 8));
      b = num(rng, 1, band.id === 'pre' ? 5 : (band.id === 'g2' ? 8 : 6));
      T = a + b;
      return numQ(
        'You planted ' + a + ' ' + (a === 1 ? food.name : food.plural) + ', then ' + b + ' more. How many ' + food.plural + ' now?',
        'You planted ' + a + ' ' + (a === 1 ? food.name : food.plural) + ', then ' + b + ' more. How many ' + food.plural + ' now?',
        T, shuffle(rng, near(T, nChoices, 1, Math.max(hi, T + 3), rng)),
        a + ' plus ' + b + ' is ' + T + '.',
        T <= 10 ? 'add10' : 'add20',
        { pic: arrayPic(food, 1, a) + '<span class="gd-op">+</span>' + arrayPic(food, 1, b), a: a, b: b, food: food,
          hint: 'Start at ' + a + ' and count on ' + b + ' more.' }
      );
    }
    if (kind === 'pick') {
      // lc1115b: grade 1 should not get 4-pick-1 style items
      a = num(rng, band.id === 'g1' ? 8 : 4, band.id === 'g2' ? 18 : (band.id === 'g1' ? 12 : 10));
      b = num(rng, band.id === 'g1' ? 2 : 1, Math.min(band.id === 'g1' ? 5 : 6, a - (band.id === 'g1' ? 3 : 1)));
      T = a - b;
      return numQ(
        'There are ' + a + ' ' + food.plural + '. You pick ' + b + '. How many ' + food.plural + ' are left?',
        'There are ' + a + ' ' + food.plural + '. You pick ' + b + '. How many ' + food.plural + ' are left?',
        T, shuffle(rng, near(T, nChoices, 0, Math.max(hi, a), rng)),
        a + ' minus ' + b + ' is ' + T + '.',
        a <= 10 ? 'sub10' : 'sub20',
        { pic: arrayPic(food, 1, a), a: a, b: b, food: food, hint: 'Start at ' + a + ' and take away ' + b + '.' }
      );
    }
    T = num(rng, 1, band.id === 'pre' ? 6 : 10);
    return numQ(
      'How many ' + (T === 1 ? food.name : food.plural) + '?',
      'How many ' + (T === 1 ? food.name : food.plural) + '?',
      T, shuffle(rng, near(T, nChoices, 1, 12, rng)),
      'There are ' + T + '.',
      'count10'
    );
  }

  function sightQ(rng) {
    var word = pick(rng, SIGHT);
    var wrong = shuffle(rng, SIGHT.filter(function (w) { return w !== word; })).slice(0, 2);
    var choices = shuffle(rng, [word].concat(wrong));
    return {
      text: 'Find the word ' + word + '.',
      say: 'Find the word ' + word + '.',
      fact: 'The word is ' + word + '.',
      skill: 'sight',
      choices: choices.map(function (w) { return { label: w, say: w, value: w }; }),
      answer: choices.indexOf(word)
    };
  }

  function curriculumQ(p, band, rng) {
    if (!A.Questions || !A.Questions.make || !A.Curriculum || !A.Curriculum.byId) return null;
    var floor = A.Learn && A.Learn.floor ? A.Learn.floor(p, 'math') : 0;
    var mathSkills, readSkills, pool, sid, level, q;
    if (band.id === 'pre') { mathSkills = ['count10']; readSkills = ['letters', 'sight']; }
    else if (band.id === 'k') { mathSkills = floor >= 2 ? ['count10', 'compare', 'add10'] : ['count10', 'compare']; readSkills = ['sight', 'letters']; }
    else if (band.id === 'g1') { mathSkills = floor >= 3 ? ['add10', 'sub10', 'make10', 'add20'] : ['add10', 'sub10', 'make10']; readSkills = ['sight', 'cvc']; }
    else { mathSkills = floor >= 4 ? ['add20', 'sub20', 'evenodd', 'missing'] : ['add20', 'sub20', 'make10']; readSkills = ['cvc', 'sight2']; }
    pool = mathSkills.concat(rng() < 0.35 ? readSkills : []);
    sid = pick(rng, pool);
    if (!A.Curriculum.byId[sid]) sid = pick(rng, mathSkills);
    if (!A.Curriculum.byId[sid]) return null;
    level = (floor >= 3 && (sid === 'add10' || sid === 'sub10' || sid === 'count10')) ? 1 : 0;
    try {
      q = A.Questions.make(sid, level, { choices: band.id === 'pre' ? 3 : 4, hard: band.id === 'g2' || floor >= 4 });
    } catch (e) { return null; }
    if (!q || !q.choices || q.answer == null) return null;
    return {
      text: String(q.text || '').replace(/<[^>]+>/g, ''),
      html: q.text,
      pic: q.pic || '',
      say: Array.isArray(q.say) ? q.say : (q.say || (q.text || '')),
      fact: Array.isArray(q.fact) ? q.fact : (q.fact || ''),
      skill: q.skill || sid,
      level: q.level || level,
      choices: q.choices.map(function (c) { return { label: c.label, html: c.html || null, say: c.say || c.label, value: c.value }; }),
      answer: q.answer
    };
  }

  function makeQuestion(p, opt) {
    opt = opt || {};
    var rng = rngOf(opt.rng);
    var band = opt.band || bandFor(p);
    if (band.toddler) return null;
    var q;
    if (opt.force === 'sight') q = sightQ(rng);
    else if (opt.force === 'garden' || (band.math && rng() < 0.45) || ((band.id === 'pre' || band.id === 'k') && rng() < 0.4)) q = gardenMath(p, band, rng);
    else q = curriculumQ(p, band, rng) || ((band.id === 'pre' || band.id === 'k') && rng() < 0.5 ? sightQ(rng) : gardenMath(p, band, rng));
    if (!q) q = gardenMath(p, band, rng);
    q.band = band.id;
    q.misses = 0;
    return q;
  }

  function hintFor(q) {
    if (!q) return 'Let us look again.';
    if (q.hint) return q.hint;
    if (q.rows && q.cols) return countByHint(q.rows, q.cols);
    if (q.misses >= 2 && q.fact) {
      if (typeof q.fact === 'string') return q.fact;
    }
    if (q.skill === 'sight' || q.skill === 'letters') return 'Listen again, then find the matching word.';
    if (q.skill === 'count10') return 'Count carefully, one at a time.';
    return 'Let us look again.';
  }

  function newSession(p) {
    var st = loadState(p);
    var band = bandFor(p);
    return {
      phase: 'title',
      band: band,
      state: st,
      friend: currentId(st),
      sessionRight: 0,
      question: null,
      lastJob: '',
      lastSay: '',
      nudge: '',
      heldPacket: null,
      pendingGrowth: false,
      doneAll: unlockedCount(st) >= ids().length
    };
  }

  function applyCorrect(p, G) {
    var st = G.state, plot = selectedPlot(st), id, need, before, job, after, unlocked, stage, soft, allDone;
    if (!plot || !plot.id) {
      G.nudge = 'Tap a seed packet, then a patch of soil.';
      return { job: '', stage: 'empty', needPlant: true, unlocked: false, friend: null, sessionDone: false, allDone: unlockedCount(st) >= ids().length };
    }
    if (st.plants[plot.id] && st.plants[plot.id].unlocked) {
      G.nudge = 'Tap a plant to water it, or plant a seed from the shelf.';
      return { job: '', stage: 'pop', needPlant: true, unlocked: false, friend: plot.id, sessionDone: false, allDone: unlockedCount(st) >= ids().length };
    }
    id = plot.id;
    need = needOf(id);
    before = plot.answers;
    job = jobOf(before);
    st.plants[id] = st.plants[id] || { answers: 0, unlocked: false };
    plot.answers = before + 1;
    st.plants[id].answers = plot.answers;
    G.sessionRight = (G.sessionRight || 0) + 1;
    after = plot.answers;
    unlocked = after >= need;
    if (unlocked) {
      st.plants[id].unlocked = true;
      st.plants[id].answers = need;
      plot.answers = need;
      if (A.Rewards && A.Rewards.freeFriend && p) A.Rewards.freeFriend(p, id);
      job = 'pop';
      G.phase = 'pop';
      G.justUnlocked = id;
      G.popPlot = st.selected;
    }
    stage = stageOf(after, need);
    G.lastJob = job;
    G.friend = currentId(st) || id;
    G.nudge = '';
    G.question = null;
    G.pendingGrowth = false;
    allDone = unlockedCount(st) >= ids().length;
    soft = !unlocked && G.sessionRight >= SESSION_SOFT && need > SESSION_SOFT;
    if (soft) G.phase = 'rest';
    saveState(p, st);
    return { job: job, stage: stage, unlocked: unlocked, friend: id, name: nameOf(id), sessionDone: soft || unlocked, allDone: allDone, need: need, answers: after, plot: st.selected, needPlant: false };
  }

  function snapshot(G) {
    var st = G.state, id = currentId(st) || G.justUnlocked || ids()[ids().length - 1];
    var grown = unlockedCount(st);
    if (G.justUnlocked && st.plants[G.justUnlocked] && st.plants[G.justUnlocked].unlocked) id = G.justUnlocked;
    var need = needOf(id);
    var plot = selectedPlot(st);
    var answers = (G.justUnlocked === id) ? need : (plot && plot.id === id ? plot.answers : answersOf(st, id));
    var plots = st.plots.map(function (pl, i) {
      var n = pl.id ? needOf(pl.id) : 0;
      return { i: i, id: pl.id, answers: pl.answers, stage: pl.id ? stageOf(pl.answers, n) : 'empty', selected: st.selected === i };
    });
    return {
      friend: id,
      name: nameOf(id),
      answers: answers,
      need: need,
      stage: stageOf(answers, need),
      unlocked: !!(st.plants[id] && st.plants[id].unlocked),
      grown: grown,
      left: ids().length - grown,
      plants: st.plants,
      plots: plots,
      selected: st.selected,
      packetsOpen: packetsOpen(st),
      toddler: !!(G.band && G.band.toddler),
      sessionRight: G.sessionRight || 0
    };
  }

  A.Garden = {
    SESSION_SOFT: SESSION_SOFT, NEED: NEED_FALLBACK, PLOT_COUNT: PLOT_COUNT, FIRST_ID: FIRST_ID, HOP_MS: HOP_MS,
    STAGES: STAGES, HELPERS: HELPERS, SIGHT: SIGHT,
    ids: ids, nameOf: nameOf, needOf: needOf, isGarden: isGarden, bandFor: bandFor,
    needFor: needFor, currentId: currentId, answersOf: answersOf,
    stageOf: stageOf, stageIndex: stageIndex, jobOf: jobOf, jobLine: jobLine,
    loadState: loadState, saveState: saveState, unlockedCount: unlockedCount,
    emptyPlots: emptyPlots, packetOpen: packetOpen, packetsOpen: packetsOpen,
    canPlant: canPlant, plantAt: plantAt, selectPlot: selectPlot, selectedPlot: selectedPlot,
    clearPlot: clearPlot, finishPop: finishPop, growingOn: growingOn, emptyPlotIndexes: emptyPlotIndexes,
    makeQuestion: makeQuestion, hintFor: hintFor, newSession: newSession,
    applyCorrect: applyCorrect, snapshot: snapshot
  };
})(window.Arcade = window.Arcade || {});
