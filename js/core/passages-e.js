/* qpassages: Learning Coach E-band reading passages (RL/RI.1–2, F&P ~I–M estimate).
   Source: learning-coach/question-templates/reading_passages_e.json.
   Nonfiction claims fact-checked against public sources (see _plans/qquality1-report.md).
   Device voice via {id,text}; do NOT require generate-tts.py. Never emoji. */
(function (A) {
  'use strict';
  var RECENT_MAX = 4;   // block recently seen passages

  var PASSAGES = [
    {
      id: 'p01', title: 'The Lost Mitten', kind: 'fiction', level: 'I–J',
      text: 'Pip lost a red mitten at the pond. She looked under the bench. It was not there. She looked by the big rock. It was not there. Then Pip saw a duck sitting in the tall grass. The duck had made a soft nest. Part of the nest was red and fuzzy. "That is my mitten!" said Pip. She did not take it back. "You can keep it, duck," she said. "Your eggs need to stay warm."',
      questions: [
        { type: 'literal', q: 'Where did Pip lose her mitten?', choices: ['at the pond', 'at school', 'in the car'], answer: 0, evidence: 'Pip lost a red mitten at the pond.' },
        { type: 'sequence', q: 'Where did Pip look first?', choices: ['by the big rock', 'in the tall grass', 'under the bench'], answer: 2, evidence: 'She looked under the bench.' },
        { type: 'inference', q: 'How could Pip tell the duck had used her mitten?', choices: ['The duck quacked at her.', 'Part of the nest was red and fuzzy, like her mitten.', 'The nest was by the bench.'], answer: 1, evidence: ['Pip lost a red mitten', 'Part of the nest was red and fuzzy.'] },
        { type: 'vocab', q: "The nest was 'fuzzy'. Fuzzy means…", choices: ['soft and furry', 'wet and cold', 'hard and sharp'], answer: 0, evidence: 'soft nest… red and fuzzy' }
      ]
    },
    {
      id: 'p02', title: 'Seeds in a Cup', kind: 'fiction', level: 'I–J',
      text: 'Tully put three seeds in a cup of dirt. Every morning he gave the seeds a little water. He set the cup by the window so it could get sun. For five days, nothing happened. Tully felt grumpy, but he kept watering the seeds and kept the cup in the sun. On the sixth day, a tiny green sprout popped up. By the next week, there were three sprouts. Tully made a sign for the cup. It said, "Water, sun, and time."',
      questions: [
        { type: 'literal', q: 'Where did Tully set the cup?', choices: ['under the bed', 'by the window', 'in the fridge'], answer: 1, evidence: 'He set the cup by the window so it could get sun.' },
        { type: 'sequence', q: 'What happened on the sixth day?', choices: ['Tully planted the seeds.', 'Tully made a sign.', 'A tiny sprout popped up.'], answer: 2, evidence: 'On the sixth day, a tiny green sprout popped up.' },
        { type: 'cause_effect', q: 'Why did Tully feel grumpy?', choices: ['Nothing grew for five days.', 'He spilled the water.', 'The sun was too hot.'], answer: 0, evidence: 'For five days, nothing happened. Tully felt grumpy' },
        { type: 'inference', q: "What is Tully's sign telling other kids?", choices: ['Seeds grow without any help.', 'Keep caring for seeds and give them time.', 'Plants only need water.'], answer: 1, evidence: '"Water, sun, and time."' }
      ]
    },
    {
      id: 'p03', title: 'The Lemonade Stand', kind: 'fiction', level: 'J–K',
      text: 'Mo and {hero} set up a lemonade stand. They made a sign that said, "Cold Lemonade." At first, no one stopped. The sun was hot, and people walked fast. Then Mo had an idea. She added a second sign: "Free Ice Cube with Every Cup!" Soon a line of thirsty people waited at the stand. By the end of the day, the jug was empty. "Next time we need a bigger jug," said {hero}.',
      questions: [
        { type: 'literal', q: 'What did the first sign say?', choices: ['Free Ice Cube', 'Cold Lemonade', 'Bigger Jug'], answer: 1, evidence: 'They made a sign that said, "Cold Lemonade."' },
        { type: 'inference', q: 'Why did people start to stop?', choices: ['The second sign got their attention.', 'It started to rain.', 'The stand moved.'], answer: 0, evidence: 'She added a second sign… Soon a line of thirsty people waited' },
        { type: 'vocab', q: "'Thirsty' people want…", choices: ['a nap', 'a drink', 'a hat'], answer: 1, evidence: 'a line of thirsty people waited at the stand' },
        { type: 'inference', q: 'Why do they need a bigger jug next time?', choices: ['The jug broke.', 'They sold all the lemonade.', 'The jug was too heavy.'], answer: 1, evidence: 'By the end of the day, the jug was empty.' }
      ]
    },
    {
      id: 'p04', title: 'How Bees Make Honey', kind: 'nonfiction', level: 'K–L',
      /* Fact-checked 2026-11-09: honey stomach, enzymes, fanning to dry nectar, wax caps, winter food —
         Smithsonian Mag; NC State News; Natural History Museum. */
      text: 'Honeybees visit flowers to sip a sweet, watery juice called nectar. A bee sucks it up with its long tongue and keeps it in a special pouch called a honey stomach. There, the bee\'s body adds enzymes, tiny helpers that start to change the sugar in the nectar. Back at the hive, the bee passes the nectar to other bees. They keep working on it and then put it into the wax cells of the honeycomb. The nectar is still very watery, so the bees fan their wings to move air over it. Slowly the extra water dries away, and the nectar becomes thick, sticky honey. Finally, the bees cover each cell with a wax lid. The colony saves this honey as food for winter, when there are few flowers.',
      questions: [
        { type: 'literal', q: 'Where does a bee keep nectar on the way back to the hive?', choices: ['in its honey stomach', 'on its wings', 'in a flower'], answer: 0, evidence: 'keeps it in a special pouch called a honey stomach' },
        { type: 'sequence', q: 'What do the bees do after they cover the cells with wax lids?', choices: ['sip more nectar', 'save the honey as food for winter', 'fan their wings'], answer: 1, evidence: 'The colony saves this honey as food for winter' },
        { type: 'cause_effect', q: 'Why do bees fan their wings over the nectar?', choices: ['to keep warm', 'to scare away bugs', 'to dry away extra water'], answer: 2, evidence: 'the bees fan their wings… the extra water dries away' },
        { type: 'vocab', q: "In this text, 'enzymes' are…", choices: ['tiny helpers that change the sugar', 'wax lids', 'flowers'], answer: 0, evidence: 'enzymes, tiny helpers that start to change the sugar' }
      ]
    },
    {
      id: 'p05', title: 'The Kite Contest', kind: 'fiction', level: 'K–L',
      text: 'Every spring, the park held a kite contest. Pip wanted to win the prize for the highest kite. She built a kite from sticks and bright paper, but on the first try it spun in circles and crashed. Pip was disappointed, but she did not quit. She watched the other kites carefully. The best ones had long tails. That night, Pip tied a tail of ribbons to her kite. The next morning, the wind was strong. Her kite climbed steadily above the trees. Pip did not win first place, but the judges gave her a ribbon for the most improved kite. She grinned and decided it was better than winning.',
      questions: [
        { type: 'literal', q: 'What happened on the first try?', choices: ['The kite flew over the trees.', 'The kite spun and crashed.', 'The kite won first place.'], answer: 1, evidence: 'on the first try it spun in circles and crashed' },
        { type: 'inference', q: 'Why did Pip tie a ribbon tail to her kite?', choices: ['She wanted it to look pretty.', 'She saw that the best kites had long tails.', 'The judges told her to.'], answer: 1, evidence: 'The best ones had long tails. That night, Pip tied a tail of ribbons' },
        { type: 'vocab', q: "'Disappointed' means Pip felt…", choices: ['sad that it did not work', 'angry at the wind', 'sleepy'], answer: 0, evidence: 'Pip was disappointed, but she did not quit' },
        { type: 'central_message', q: 'What is the big lesson of the story?', choices: ['Kites are hard to fly.', 'Learning from mistakes helps you get better.', 'Always win first place.'], answer: 1, evidence: 'most improved… better than winning' }
      ]
    },
    {
      id: 'p06', title: 'Why Leaves Change Color', kind: 'nonfiction', level: 'L–M',
      /* Fact-checked 2026-11-09: chlorophyll / hidden yellows & oranges / maples make red / pines keep needles —
         Smithsonian (si.edu); National Geographic Family; NPS. Soft fix: "days get shorter" (Smithsonian). */
      text: 'In summer, the leaves of maples, oaks, and many other trees are green. The green comes from chlorophyll, which helps leaves use sunlight to make food for the tree. These leaves also hold yellow and orange colors, but in summer there is so much green that it covers them up. In fall, the days get shorter and the nights grow longer. Trees that drop their leaves each year stop making chlorophyll, and the green slowly breaks down. Now the hidden yellow and orange can show. Many maples also make new red colors in fall. Soon these leaves drop, and the tree rests until spring. Pine trees are different. They keep their green needles all winter.',
      questions: [
        { type: 'literal', q: 'What does chlorophyll help leaves do?', choices: ['fall off', 'use sunlight to make food', 'turn red'], answer: 1, evidence: 'chlorophyll, which helps leaves use sunlight to make food' },
        { type: 'cause_effect', q: 'Why can we see yellow on maple leaves in fall?', choices: ['The green breaks down and the yellow shows.', 'Painters color them.', 'Rain washes them yellow.'], answer: 0, evidence: 'the green slowly breaks down. Now the hidden yellow and orange can show.' },
        { type: 'sequence', q: 'What happens after these leaves drop?', choices: ['The leaves turn green.', 'The nights get longer.', 'The tree rests until spring.'], answer: 2, evidence: 'Soon these leaves drop, and the tree rests until spring.' },
        { type: 'inference', q: 'In the middle of winter, which tree would still look green?', choices: ['a maple', 'a pine', 'a maple with red leaves'], answer: 1, evidence: 'Pine trees… keep their green needles all winter.' }
      ]
    }
  ];

  function heroName(p) {
    var id = (p && p.blob) || (A.FoodData && A.FoodData.lead) || 'strawberry';
    var cast = A.FoodData && A.FoodData.cast;
    if (cast) {
      for (var i = 0; i < cast.length; i++) if (cast[i].id === id) return cast[i].name;
    }
    return 'Jammy';
  }
  function fillHero(text, p) { return String(text || '').split('{hero}').join(heroName(p)); }

  function state(p) {
    var l = (p && (p.learn || (p.learn = { v: 1 }))) || { v: 1 };
    l.passages = l.passages || { recent: [], cur: null };
    return l.passages;
  }

  function pickQs(pass) {
    // Prefer a mix: at least one literal/who-what, plus why/main idea/evidence when present. 2–3 questions.
    var qs = pass.questions.slice(), want = qs.length <= 2 ? qs.length : (Math.random() < .55 ? 3 : 2);
    var prefer = ['literal', 'cause_effect', 'inference', 'central_message', 'sequence', 'vocab'];
    qs.sort(function (a, b) { return prefer.indexOf(a.type) - prefer.indexOf(b.type); });
    // keep order variety but take first `want` after light shuffle of same-priority
    var out = [], used = {}, i, j;
    for (i = 0; i < prefer.length && out.length < want; i++) {
      for (j = 0; j < qs.length && out.length < want; j++) {
        if (qs[j].type === prefer[i] && !used[j]) { used[j] = 1; out.push(qs[j]); }
      }
    }
    for (j = 0; j < qs.length && out.length < want; j++) if (!used[j]) { used[j] = 1; out.push(qs[j]); }
    return A.shuffle(out.slice());
  }

  function pickPassage(p) {
    var st = state(p), recent = st.recent || [], pool = PASSAGES.filter(function (x) { return recent.indexOf(x.id) < 0; });
    if (!pool.length) { st.recent = []; pool = PASSAGES.slice(); }
    var pass = pool[A.rnd(0, pool.length - 1)];
    st.recent.push(pass.id); if (st.recent.length > RECENT_MAX) st.recent.shift();
    st.cur = { id: pass.id, qs: pickQs(pass).map(function (q) { return pass.questions.indexOf(q); }), i: 0 };
    return pass;
  }

  function current(p) {
    var st = state(p), pass, qi;
    if (st.cur && st.cur.i < (st.cur.qs || []).length) {
      pass = PASSAGES.filter(function (x) { return x.id === st.cur.id; })[0];
      if (pass) { qi = st.cur.qs[st.cur.i]; return { pass: pass, q: pass.questions[qi], qi: qi, n: st.cur.qs.length, step: st.cur.i }; }
    }
    pass = pickPassage(p);
    st = state(p);
    qi = st.cur.qs[0];
    return { pass: pass, q: pass.questions[qi], qi: qi, n: st.cur.qs.length, step: 0 };
  }

  function advance(p) {
    var st = state(p);
    if (st.cur) { st.cur.i++; if (st.cur.i >= (st.cur.qs || []).length) st.cur = null; }
  }

  function shuffleChoices(q) {
    var pairs = q.choices.map(function (c, i) { return { c: c, ok: i === q.answer }; });
    pairs = A.shuffle(pairs.slice());
    return { choices: pairs.map(function (x) { return x.c; }), answer: pairs.findIndex(function (x) { return x.ok; }) };
  }

  function renderPass(pass, p) {
    var body = fillHero(pass.text, p);
    return '<div class="qp-pass" data-pid="' + pass.id + '"><div class="qp-title">' + pass.title + '</div><p class="qp-body">' + body + '</p></div>';
  }

  function askOne(p) {
    var cur = current(p), pass = cur.pass, q = cur.q, sh = shuffleChoices(q);
    var body = fillHero(pass.text, p);
    var qText = fillHero(q.q, p);
    var passageHtml = renderPass(pass, p);
    var questionHtml = '<p class="qp-q">' + qText + '</p>';
    var html = passageHtml + questionHtml;
    var sayPass = [{ id: 'pass_' + pass.id, text: pass.title + '. ' + body }];
    var sayFull = [{ id: 'pass_' + pass.id + '_q' + cur.qi, text: pass.title + '. ' + body + ' ' + qText }];
    var sayQ = [{ id: 'passq_' + pass.id + '_q' + cur.qi, text: qText }];
    var cells = sh.choices.map(function (lab, i) {
      return { label: lab, html: null, say: [], k: pass.id + ':' + cur.qi + ':' + i, fact: i === sh.answer ? ['w_thats', { id: 'pass_ans', text: lab }] : [], long: true };
    });
    advance(p);
    return {
      text: html, passageHtml: passageHtml, questionHtml: questionHtml, pic: null,
      say: sayFull, sayPass: sayPass, sayAuto: sayQ, story: true, passage: true, kind: q.type,
      target: pass.id + ':' + cur.qi, fact: cells[sh.answer].fact, answer: sh.answer,
      hint: q.type === 'inference' || q.type === 'central_message' ? 'Use clues in the passage. Look back for the words that help.' : 'Look back at the passage. Find the sentence that tells you.',
      hint2: Array.isArray(q.evidence) ? q.evidence.join(' / ') : (q.evidence || ''),
      choices: cells.map(function (c) { return { label: c.label, html: c.html, say: [], k: c.k, long: true }; }),
      meta: { passageId: pass.id, title: pass.title, qType: q.type, step: cur.step, of: cur.n }
    };
  }

  function genBoard(p) {
    // Munch: same passage + question as the rule; good/bad are answer choices
    var q = askOne(p), good = q.choices[q.answer], others = q.choices.filter(function (_, i) { return i !== q.answer; }), bi = 0;
    return {
      text: q.text, say: q.say, sayAuto: q.sayAuto, story: true, passage: true, target: q.target, kind: q.kind,
      hint: q.hint, stepHint: function (cell, lvl) { return '<div class="st-hint"><p>' + (lvl >= 2 ? q.hint2 || q.hint : q.hint) + '</p></div>'; },
      good: function () { return { label: good.label, html: null, fact: good.fact || ['w_thats', { id: 'pass_ans', text: good.label }], k: good.k + 'g' }; },
      bad: function () { var c = others[bi++ % others.length]; return { label: c.label, html: null, fact: [], k: c.k + 'b' + bi }; }
    };
  }

  A.Passages = {
    ALL: PASSAGES, RECENT_MAX: RECENT_MAX, heroName: heroName, fillHero: fillHero,
    ask: askOne, gen: genBoard, state: state, current: current, renderPass: renderPass,
    byId: function (id) { return PASSAGES.filter(function (p) { return p.id === id; })[0] || null; }
  };
})(window.Arcade);
