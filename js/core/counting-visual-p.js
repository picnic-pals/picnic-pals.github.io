/* v0.4 preschool picture counting (counting_visual_p). P band, no written equations.
   1-20 is practice; 21-30 is a picture-only stretch after count-to-20 is steady.
   Audio is optional and never required. Load after steps-math.js. */
(function (A) {
  'use strict';
  var C = A.Curriculum, CV = A.CountVisual, pick = A.pick, rnd = A.rnd;
  if (!C || !CV || C.byId.counting_visual_p) return;

  function within(vals, lo, hi, ans) {
    var o = [], seen = {};
    vals.forEach(function (v) { if (v >= lo && v <= hi && v !== ans && !seen[v]) { seen[v] = 1; o.push(v); } });
    return o;
  }
  function numCell(v) { return { label: String(v), fact: ['w_thats', v], k: String(v) }; }
  function ready30(p) {
    if (!p || !C.state) return false;
    var st = C.state(p, 'pk_count20');
    return !!(st && (st.status === 'mastered' || st.placed));
  }

  var BB = [
    { id: 'cv_bb_13', style: 'how_many', n: 13, prompt: 'How many?', choices: [12, 13, 14, 10], pattern: 'ten_frames' },
    { id: 'cv_bb_07', style: 'how_many', n: 7, prompt: 'How many?', choices: [6, 7, 8, 5] },
    { id: 'cv_bb_24', style: 'how_many', n: 24, prompt: 'How many?', choices: [23, 24, 25, 20], stretch: true },
    { id: 'cv_bb_27', style: 'how_many', n: 27, prompt: 'How many?', choices: [26, 27, 28, 20], stretch: true },
    { id: 'cv_bb_04', style: 'how_many', n: 4, prompt: 'How many?', choices: [3, 4, 5, 2], pattern: 'dice' },
    { id: 'cv_bb_ql8', style: 'quick_look', n: 8, prompt: 'How many did you see?', choices: [7, 8, 9, 5], quick_look: true },
    { id: 'cv_bb_next16', style: 'number_path', n: 16, prompt: 'What number comes next?', answer: 17, choices: [15, 16, 17, 18] },
    { id: 'cv_bb_onemore', style: 'one_more_pic', n: 8, prompt: 'One more comes. How many now?', answer: 9, choices: [8, 9, 10, 7] }
  ];
  var MU = [
    { id: 'cv_mu_eight', rule: 'Munch the pictures that show 8.', n: 8, targets: [8, 8, 8, 8], distractors: [7, 9, 10, 5] },
    { id: 'cv_mu_thirteen', rule: 'Munch the pictures that show 13.', n: 13, targets: [13, 13, 13], distractors: [12, 3, 10, 14] },
    { id: 'cv_mu_more10', rule: 'Munch the pictures that show more than 10.', targets: [11, 13, 16, 14], distractors: [10, 8, 5, 9] }
  ];

  function bbItem(it) {
    if (it.style === 'number_path') {
      var ans = it.answer, nums = [it.n - 2, it.n - 1, it.n, null];
      return { text: it.prompt, pic: '<span class="st-track">' + nums.map(function (v) { return v == null ? '<b class="q">?</b>' : '<b>' + v + '</b>'; }).join('') + '</span>',
        say: ['st_what_next'], answer: ans, choices: it.choices.slice(), pictures: true, id: it.id };
    }
    var n = it.n, ans = it.answer != null ? it.answer : n, pic = CV.html(n, { pattern: it.pattern, quick_look: !!it.quick_look });
    if (it.style === 'one_more_pic') pic = CV.html(n) + '<span class="cv-arrive" aria-hidden="true">+ one</span>';
    return { text: it.prompt, pic: pic, say: ['st_how_many'], answer: ans, choices: it.choices.slice(), pictures: true, id: it.id, quick_look: !!it.quick_look };
  }

  function poolBB(p) {
    return BB.filter(function (it) { return !it.stretch || ready30(p); });
  }

  function ask(level, n, opt) {
    opt = opt || {};
    var p = opt.profile || (A.Learn && A.Learn.ctx && A.Learn.ctx.p) || (A.Store && A.Store.active && A.Store.active());
    var pool = poolBB(p), it = (opt && opt.id && pool.filter(function (x) { return x.id === opt.id; })[0]) || pick(pool), row = bbItem(it), ch = A.shuffle(row.choices.slice());
    var cells = ch.map(function (v) { var c = numCell(v); c.html = null; return c; });
    return {
      text: row.text + (row.pic ? '<span class="st-pic">' + row.pic + '</span>' : ''), plain: row.text, pic: row.pic,
      say: row.say, answer: ch.indexOf(row.answer), choices: cells, pictures: true, skill: 'counting_visual_p',
      meta: { id: row.id, n: it.n }
    };
  }

  function gen(L, opt) {
    opt = opt || {};
    var p = opt.profile || (A.Store && A.Store.active && A.Store.active());
    var boards = MU.filter(function (b) { return b.id !== 'cv_mu_thirteen' || ready30(p) || true; });
    if (opt && opt.id) { var hit = boards.filter(function (b) { return b.id === opt.id; }); if (hit.length) boards = hit; }
    /* 13 is 11-20 practice, always allowed in P; 24-only stretch is baseball. */
    var b = pick(boards), ti = 0, di = 0;
    function cell(n, ok) {
      return { label: String(n), html: CV.html(n, { pattern: n <= 5 ? 'dice' : null }), fact: ok ? ['w_thats', n] : [], k: (ok ? 't' : 'd') + n + '-' + Math.random().toString(36).slice(2, 5) };
    }
    return {
      text: b.rule, say: ['st_how_many'], pictures: true, target: b.id, skill: 'counting_visual_p',
      good: function () { var n = b.targets[ti++ % b.targets.length]; return cell(n, true); },
      bad: function () { var n = b.distractors[di++ % b.distractors.length]; return cell(n, false); }
    };
  }

  C.register({
    id: 'counting_visual_p', name: 'Picture counting', short: 'How many? Picture counting and number order to 30',
    strand: 'Counting', std: 'PK / K.CC', grade: 'PK', subject: 'math', band: 'P', sayFact: false, secs: [10, 11],
    levels: ['Pictures to 20', 'Pictures to 30'],
    intro: { line: 'st_intro_pk', example: CV.html(7) },
    gen: function (L) { return gen(L); },
    ask: ask
  }, 'pk_count20');
  A.CountVisualP = { BB: BB, MU: MU, ask: ask, gen: gen, item: function (id) { return BB.filter(function (x) { return x.id === id; })[0] || MU.filter(function (x) { return x.id === id; })[0]; } };
})(window.Arcade);
