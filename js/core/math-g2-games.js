/* v0.4 grade-2 Baseball (1 of 4) and Munch (one rule) items, gated on place-value readiness.
   Within-20 practice is not replaced. Load after steps-math.js. */
(function (A) {
  'use strict';
  var C = A.Curriculum, pick = A.pick;
  if (!C || C.byId.g2_bb) return;

  function placedOrMastered(p, id) {
    if (!p || !C.state || !C.byId[id]) return false;
    var st = C.state(p, id);
    return !!(st && (st.status === 'mastered' || st.placed));
  }
  /* Map Learning Coach gate phrases onto existing step ids. */
  var GATE = {
    g2_bb_cmp3: ['pv_hto'],
    g2_bb_10more: ['pv_tens'],
    g2_bb_100less: ['pv_hto'],
    g2_bb_skip5: ['pv_tens'],
    g2_bb_clock: ['skip_count', 'time_hour_half'],
    g2_bb_money: ['skip_count'],
    g2_bb_array: ['a_dbl', 'evenodd'],
    g2_bb_addreg: ['pv_tens', 'a_mk10', 's_split'],
    g2_mu_4tens: ['pv_tens'],
    g2_mu_skip10: ['skip_count'],
    g2_mu_halfpast: ['time_hour_half'],
    g2_mu_25c: ['skip_count', 'money_coins'],
    g2_mu_array12: ['arrays'],
    g2_mu_gt500: ['pv_hto', 'pv_cmp3']
  };
  function gateOk(p, id) {
    var ids = GATE[id] || [];
    if (!ids.length) return false;
    return ids.every(function (k) { return placedOrMastered(p, k); });
  }

  var BB = [
    { id: 'g2_bb_cmp3', prompt: 'Which is true?', choices: ['602 < 598', '602 = 598', '602 > 598', '598 > 602'], answer: '602 > 598' },
    { id: 'g2_bb_10more', prompt: 'What is 10 more than 395?', choices: [305, 396, 405, 385], answer: 405 },
    { id: 'g2_bb_100less', prompt: 'What is 100 less than 740?', choices: [640, 730, 840, 639], answer: 640 },
    { id: 'g2_bb_skip5', prompt: 'Count by 5s: 35, 40, 45, ?', choices: [46, 50, 55, 40], answer: 50 },
    { id: 'g2_bb_clock', prompt: 'What time does the clock show?', choices: ['3:20', '4:15', '3:04', '2:20'], answer: '3:20',
      pic: function () { return clockPic(3, 20); } },
    { id: 'g2_bb_money', prompt: 'How much money?', choices: ['53¢', '7¢', '48¢', '43¢'], answer: '53¢',
      pic: function () { return coinPic('1 quarter, 2 dimes, 1 nickel, 3 pennies'); } },
    { id: 'g2_bb_array', prompt: '3 rows of 4. How many?', choices: [7, 4, 12, 3], answer: 12,
      pic: function () { return arrayPic(3, 4); } },
    { id: 'g2_bb_addreg', prompt: '38 + 25 = ?', choices: [53, 63, 73, 13], answer: 63 }
  ];
  var MU = [
    { id: 'g2_mu_4tens', rule: 'Munch the numbers with 4 tens.', targets: [40, 43, 47, 49], distractors: [14, 34, 4, 54] },
    { id: 'g2_mu_skip10', rule: 'Munch the numbers you say when you count by 10s, starting at 20.', targets: [20, 30, 40, 50, 60], distractors: [21, 25, 35, 45, 52] },
    { id: 'g2_mu_halfpast', rule: 'Munch the clocks that show half past.', targets: ['1:30', '4:30', '8:30', '11:30'], distractors: ['1:00', '4:15', '8:00', '3:20'], clock: true },
    { id: 'g2_mu_25c', rule: 'Munch the coin sets that equal 25¢.',
      targets: ['1 quarter', '2 dimes and 1 nickel', '5 nickels', '1 dime and 3 nickels'],
      distractors: ['2 dimes', '3 nickels', '1 quarter and 1 nickel', '4 dimes'], coins: true },
    { id: 'g2_mu_array12', rule: 'Munch the arrays that show 12.', targets: ['3×4', '4×3', '2×6', '6×2'], distractors: ['3×3', '2×5', '5×3', '4×4'], arrays: true },
    { id: 'g2_mu_gt500', rule: 'Munch the numbers greater than 500.', targets: [512, 603, 750, 890], distractors: [499, 500, 405, 250] }
  ];

  function clockPic(h, m) {
    var angH = ((h % 12) + m / 60) * 30, angM = m * 6;
    return '<span class="g2-clock" role="img" aria-label="' + h + ':' + (m < 10 ? '0' : '') + m + '"><svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="46" fill="#fff8f0" stroke="#5a3d8a" stroke-width="4"/>' +
      [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (n, i) {
        var a = (i * 30 - 90) * Math.PI / 180, x = 50 + Math.cos(a) * 34, y = 50 + Math.sin(a) * 34;
        return '<text x="' + x + '" y="' + (y + 4) + '" text-anchor="middle" font-size="9" font-weight="700" fill="#3b2d55">' + n + '</text>';
      }).join('') +
      '<line x1="50" y1="50" x2="' + (50 + Math.cos((angH - 90) * Math.PI / 180) * 22) + '" y2="' + (50 + Math.sin((angH - 90) * Math.PI / 180) * 22) + '" stroke="#3b2d55" stroke-width="4" stroke-linecap="round"/>' +
      '<line x1="50" y1="50" x2="' + (50 + Math.cos((angM - 90) * Math.PI / 180) * 32) + '" y2="' + (50 + Math.sin((angM - 90) * Math.PI / 180) * 32) + '" stroke="#b71c1c" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="50" cy="50" r="3" fill="#3b2d55"/></svg></span>';
  }
  function coinPic(set) {
    return '<span class="g2-coins" aria-hidden="true">' + A.esc(set) + '</span>';
  }
  function arrayPic(r, c) {
    var h = '<span class="g2-array" style="grid-template-columns:repeat(' + c + ', 14px)" aria-hidden="true">', i, j;
    for (i = 0; i < r; i++) for (j = 0; j < c; j++) h += '<i></i>';
    return h + '</span>';
  }
  function parseArray(s) { var m = String(s).replace('×', 'x').split('x'); return [+m[0], +m[1]]; }

  function profile(opt) {
    return (opt && opt.profile) || (A.Learn && A.Learn.ctx && A.Learn.ctx.p) || (A.Store && A.Store.active && A.Store.active());
  }
  function openBB(p) { return BB.filter(function (e) { return gateOk(p, e.id); }); }
  function openMU(p) { return MU.filter(function (e) { return gateOk(p, e.id); }); }

  function ask(level, n, opt) {
    var p = profile(opt), pool = openBB(p), it = (opt && opt.id && pool.filter(function (x) { return x.id === opt.id; })[0]) || (pool.length ? pick(pool) : null);
    if (!it) return { text: 'Which is true?', choices: [{ label: '602 > 598' }, { label: '602 < 598' }, { label: '602 = 598' }, { label: '598 > 602' }], answer: 0, pictures: true };
    var ch = A.shuffle(it.choices.slice()), pic = it.pic ? it.pic() : null;
    return {
      text: it.prompt + (pic ? '<span class="st-pic">' + pic + '</span>' : ''), plain: it.prompt, pic: pic,
      say: [], answer: ch.indexOf(it.answer), pictures: true, skill: 'g2_bb', meta: { id: it.id },
      choices: ch.map(function (v) { return { label: String(v), fact: v === it.answer ? ['w_thats', String(v)] : [], k: String(v) }; })
    };
  }
  function gen(L, opt) {
    var p = profile(opt), pool = openMU(p), b = (opt && opt.id && (pool.filter(function (x) { return x.id === opt.id; })[0] || MU.filter(function (x) { return x.id === opt.id; })[0])) || (pool.length ? pick(pool) : MU[0]), ti = 0, di = 0;
    function cell(v, ok) {
      var html = null, lab = String(v);
      if (b.clock) html = clockPic(+lab.split(':')[0], +lab.split(':')[1]);
      else if (b.coins) { lab = v; html = coinPic(v); }
      else if (b.arrays) { var rc = parseArray(v); html = arrayPic(rc[0], rc[1]); }
      return { label: lab, html: html, fact: ok ? ['w_thats', lab] : [], k: (ok ? 't' : 'd') + lab, long: !!(b.coins || b.arrays || b.clock) };
    }
    return {
      text: b.rule, say: [], pictures: true, target: b.id, skill: 'g2_mu',
      good: function () { return cell(b.targets[ti++ % b.targets.length], true); },
      bad: function () { return cell(b.distractors[di++ % b.distractors.length], false); }
    };
  }

  C.register({
    id: 'g2_bb', name: 'Grade 2 pitches', short: 'Place-value, clocks, coins and arrays (1 of 4)',
    strand: 'Place value', std: '2.NBT', grade: '2', subject: 'math', band: 'E', sayFact: true, secs: [16, 18],
    levels: ['Grade 2 pitches'], intro: { line: 'st_new_step', example: '' },
    gen: function (L) { return gen(L); }, ask: ask
  }, 'pv_hto');
  C.register({
    id: 'g2_mu', name: 'Grade 2 munch rules', short: 'One simple rule: tens, skip count, clocks, coins, arrays',
    strand: 'Place value', std: '2.NBT', grade: '2', subject: 'math', band: 'E', sayFact: true, secs: [16, 18],
    levels: ['Grade 2 rules'], intro: { line: 'st_new_step', example: '' },
    gen: gen, ask: ask
  }, 'g2_bb');

  A.MathG2Games = { gateOk: gateOk, openBB: openBB, openMU: openMU, BB: BB, MU: MU, clockPic: clockPic, arrayPic: arrayPic };

  /* Do not start these steps until at least one item's gate is met. */
  var basePick = C.pickRound;
  C.pickRound = function (p, opt) {
    var r = basePick(p, opt); if (!r || !r.skill || !p) return r;
    if ((r.skill.id === 'g2_bb' && !openBB(p).length) || (r.skill.id === 'g2_mu' && !openMU(p).length)) {
      var T = C.track(p, 'math');
      if (T.current === r.skill.id) T.current = C.byId.pv_tens ? 'pv_tens' : (C.byId.a_mix ? 'a_mix' : T.current);
      return basePick(p, opt);
    }
    return r;
  };
})(window.Arcade);
