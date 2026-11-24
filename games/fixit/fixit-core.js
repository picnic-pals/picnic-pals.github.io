/* Fix-It Shop v1 (1123): pure rules. Tools, repair jobs, trays by age, finding the problem, picks, hints, project stages.
   No DOM. Progress lives in p.games.fixit. rng injection keeps jobs reproducible in tests.
   Ages: toddler (A.toddler) picks from 2 very different tools with the problem pointed out; pre-K (under 5) gets 3 tools with
   pointing; age 5 gets up to 4 tools with pointing; 6 and up finds the broken part first, then picks from 4 to 6 tools,
   with a look-alike tool (screwdriver / wrench, glue / paintbrush ...) in the tray when she owns one. */
(function (A) {
  'use strict';

  /* say: a built-in clip id when one exists (audio/voice-tts), else plain text for the speech voice */
  var TOOLS = [
    { id: 'hammer', word: 'hammer', say: 'pw_hammer', fam: 'hit', what: 'A hammer taps nails in.' },
    { id: 'screwdriver', word: 'screwdriver', say: { text: 'Screwdriver.' }, fam: 'turn', what: 'A screwdriver turns screws.' },
    { id: 'paintbrush', word: 'paintbrush', say: { text: 'Paintbrush.' }, fam: 'paint', what: 'A paintbrush adds paint and color.' },
    { id: 'wrench', word: 'wrench', say: { text: 'Wrench.' }, fam: 'turn', what: 'A wrench grabs and turns nuts and bolts.' },
    { id: 'glue', word: 'glue', say: { text: 'Glue.' }, fam: 'stick', what: 'Glue sticks pieces back together.' },
    { id: 'sandpaper', word: 'sandpaper', say: { text: 'Sandpaper.' }, fam: 'smooth', what: 'Sandpaper rubs rough wood smooth.' },
    { id: 'saw', word: 'saw', say: 'word_saw', fam: 'cut', what: 'A saw cuts wood.' },
    { id: 'tape', word: 'tape measure', say: { text: 'Tape measure.' }, fam: 'measure', what: 'A tape measure tells how long something is.' }
  ];
  var TOOL_BY = {}; TOOLS.forEach(function (t) { TOOL_BY[t.id] = t; });
  /* look-alikes: a tray for 6+ includes one of these when she owns it, so the word and the job both matter */
  var NEAR = { hammer: ['screwdriver', 'saw'], screwdriver: ['wrench', 'hammer'], wrench: ['screwdriver'], paintbrush: ['glue', 'sandpaper'],
    glue: ['paintbrush'], sandpaper: ['paintbrush', 'saw'], saw: ['sandpaper', 'hammer'], tape: ['saw'] };
  /* toddlers: the other tool is one of these, never a look-alike */
  var FAR = { hammer: ['paintbrush', 'glue', 'tape'], screwdriver: ['paintbrush', 'glue'], wrench: ['paintbrush', 'glue'], paintbrush: ['hammer', 'wrench', 'saw'],
    glue: ['hammer', 'saw', 'wrench'], sandpaper: ['hammer', 'wrench'], saw: ['paintbrush', 'glue'], tape: ['hammer', 'paintbrush', 'glue'] };

  var START = { little: ['hammer', 'paintbrush', 'screwdriver'], big: ['hammer', 'screwdriver', 'paintbrush', 'wrench'] };
  var ORDER = ['hammer', 'screwdriver', 'paintbrush', 'wrench', 'glue', 'sandpaper', 'saw', 'tape'];

  /* Original repair jobs. part: where the problem is in the 400x300 scene (measured on the locked art, art/games/fixit/jobs/anchors.json, 1124);
     r: how close a tap must be to count as finding it (at least 50).
     Each tool has 3 different jobs, and the same things come back broken in different ways (a chair, a fence, a bench, a table). */
  var JOBS = [
    { id: 'step_nail', tool: 'hammer', scene: 'step', text: 'A nail pokes up on my step!', done: 'No more pokey nail. Thank you!', hint: 'The nail sticks up. What taps a nail down?', part: { x: 211, y: 48 }, r: 50 },
    { id: 'picture', tool: 'hammer', scene: 'picture', text: 'My picture fell down. Can you hang it?', done: 'My picture is back up! Yay!', hint: 'The nail needs to go into the wall. What taps a nail in?', part: { x: 181, y: 164 }, r: 72 },
    { id: 'fence_board', tool: 'hammer', scene: 'fence', text: 'A fence board came loose!', done: 'The fence is strong again!', hint: 'A nail popped out of the board. What taps nails in?', part: { x: 171, y: 112 }, r: 50 },
    { id: 'chair_screw', tool: 'screwdriver', scene: 'chair', text: 'My chair wobbles! Can you fix it?', done: 'My chair is steady now!', hint: 'A screw came loose on the leg. What turns a screw?', part: { x: 212, y: 204 }, r: 50 },
    { id: 'cupboard_knob', tool: 'screwdriver', scene: 'cupboard', text: 'My cupboard knob is falling off!', done: 'The knob is tight! I can open my cupboard.', hint: 'The knob has a loose screw. What turns a screw?', part: { x: 181, y: 168 }, r: 50 },
    { id: 'toy_battery', tool: 'screwdriver', scene: 'toycar', text: 'The battery door on my toy car is open!', done: 'Vroom! My toy car works again!', hint: 'A little screw holds the door shut. What turns a screw?', part: { x: 192, y: 197 }, r: 50 },
    { id: 'sink_drip', tool: 'wrench', scene: 'sink', text: 'Drip, drip! My sink pipe leaks.', done: 'No more drips! Thank you!', hint: 'The big nut on the pipe is loose. What grabs and turns a nut?', part: { x: 200, y: 183 }, r: 50 },
    { id: 'bike_wheel', tool: 'wrench', scene: 'bike', text: 'My bike wheel is wobbly!', done: 'My wheel spins straight now!', hint: 'The nut fell off the wheel. What grabs and turns a nut?', part: { x: 304, y: 188 }, r: 50, alt: { x: 299, y: 248, r: 40 } },
    { id: 'swing_bolt', tool: 'wrench', scene: 'swing', text: 'My swing hangs crooked!', done: 'Wheee! My swing is level now!', hint: 'The bolt at the top is loose. What grabs and turns a bolt?', part: { x: 148, y: 45 }, r: 51 },
    { id: 'fence_paint', tool: 'paintbrush', scene: 'fencepaint', text: 'The paint on my fence is peeling!', done: 'My fence looks brand new!', hint: 'This board lost its color. What adds color?', part: { x: 158, y: 147 }, r: 50 },
    { id: 'mailbox', tool: 'paintbrush', scene: 'mailbox', text: 'My mailbox lost its color!', done: 'My mailbox is bright red again!', hint: 'The mailbox needs color. What adds color?', part: { x: 198, y: 100 }, r: 69 },
    { id: 'bench_bare', tool: 'paintbrush', scene: 'benchpaint', text: 'My bench has a bare spot!', done: 'My bench is all blue again!', hint: 'One spot has no paint. What adds color?', part: { x: 268, y: 186 }, r: 50 },
    { id: 'mug_handle', tool: 'glue', scene: 'mug', text: 'The handle came off my mug!', done: 'I can hold my mug again!', hint: 'The handle is in one piece. What sticks pieces back on?', part: { x: 240, y: 134 }, r: 56, alt: { x: 320, y: 232, r: 40 } },
    { id: 'robot_arm', tool: 'glue', scene: 'robot', text: "My toy robot's arm came off!", done: 'Beep boop! Two arms again!', hint: 'The arm needs to stick back on. What sticks things together?', part: { x: 245, y: 165 }, r: 50, alt: { x: 278, y: 238, r: 40 } },
    { id: 'crown_star', tool: 'glue', scene: 'crown', text: 'The star fell off my gold crown!', done: 'My gold crown shines again!', hint: 'The star needs to stick back on. What sticks things?', part: { x: 173, y: 125 }, r: 50, alt: { x: 319, y: 221, r: 45 } },
    { id: 'bench_rough', tool: 'sandpaper', scene: 'benchrough', text: 'My bench is rough. Ouch, splinters!', done: 'So smooth! No more splinters.', hint: 'The wood is rough and pointy. What rubs wood smooth?', part: { x: 190, y: 176 }, r: 50 },
    { id: 'spoon', tool: 'sandpaper', scene: 'spoon', text: 'My wooden spoon feels scratchy!', done: 'My spoon is smooth now!', hint: 'The spoon is rough. What rubs wood smooth?', part: { x: 206, y: 110 }, r: 50 },
    { id: 'drawer', tool: 'sandpaper', scene: 'drawer', text: 'My drawer sticks! The edge is rough.', done: 'My drawer slides open now!', hint: 'The drawer edge is rough. What rubs wood smooth?', part: { x: 233, y: 112 }, r: 50 },
    { id: 'branch', tool: 'saw', scene: 'branch', text: 'A branch is blocking my window!', done: 'Now I can see out my window!', hint: 'The branch is too long. What cuts wood?', part: { x: 186, y: 147 }, r: 60 },
    { id: 'shelf_long', tool: 'saw', scene: 'shelf', text: 'This shelf board sticks out too far!', done: 'The shelf fits just right!', hint: 'The board is too long. What cuts wood?', part: { x: 322, y: 173 }, r: 50 },
    { id: 'table_leg', tool: 'saw', scene: 'table', text: 'My table tips! One leg is too long.', done: 'My table stands flat now!', hint: 'One leg is longer than the others. What cuts wood?', part: { x: 324, y: 226 }, r: 56 },
    { id: 'board_len', tool: 'tape', scene: 'board', text: 'How long is this board?', done: 'It is 4 feet long!', hint: 'We need to know how long it is. What measures?', part: { x: 199, y: 136 }, r: 70 },
    { id: 'plant_tall', tool: 'tape', scene: 'plant', text: 'How tall did my plant grow?', done: 'It grew 12 inches tall!', hint: 'We need to know how tall it is. What measures?', part: { x: 254, y: 155 }, r: 50 },
    { id: 'window_wide', tool: 'tape', scene: 'window', text: 'How wide is my window? I need a curtain.', done: 'It is 3 feet wide. Curtain time!', hint: 'We need to know how wide it is. What measures?', part: { x: 156, y: 215 }, r: 72 }
  ];
  var JOB_BY = {}; JOBS.forEach(function (j) { JOB_BY[j.id] = j; });

  /* funny, gentle "that didn't work" lines, one per wrong tool */
  var FAIL = {
    hammer: 'Bonk, bonk! Nothing happened.',
    screwdriver: 'Twist, twist! Nothing turned.',
    wrench: 'The wrench could not grab anything!',
    paintbrush: 'Ooh, pretty! But it is still broken.',
    glue: 'Sticky, sticky! But it is still broken.',
    sandpaper: 'Scritch, scratch! Still broken.',
    saw: 'Squeak, squeak! Nothing to cut here.',
    tape: 'Zip out, zip back! That just measures.'
  };

  /* Projects: built in stages, a stage every few finished jobs. v1 has the birdhouse; the wagon, stand and treehouse come later. */
  var PROJECTS = [{ id: 'birdhouse', name: 'Birdhouse', stages: ['base', 'walls', 'roof', 'paint', 'perch'],
    stageText: ['The base is done!', 'The walls are up!', 'The roof is on!', 'It is painted!', 'The perch is on. A bird moved in!'] }];
  var JOBS_PER_STAGE = 3;
  var CHEERS = ['fb_great_job', 'fb_hooray', 'tp_yay_4'];

  function rngOf(rng) { return typeof rng === 'function' ? rng : Math.random; }
  function pick(rng, arr) { return arr[Math.floor(rngOf(rng)() * arr.length)]; }
  function shuffle(rng, arr) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(rngOf(rng)() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function ageOf(p) { if (A.Age && A.Age.of) return A.Age.of(p); var a = p && p.age; return (a == null || a === '') ? null : +a; }
  /* tier: 'toddler' | 'little' (pre-K) | 'k' (5) | 'big' (6 and up; age not set counts as big) */
  function tierOf(p) {
    if (!p) return 'big';
    if ((A.toddler && A.toddler(p)) || (!A.toddler && ageOf(p) != null && ageOf(p) <= 2)) return 'toddler';
    var a = ageOf(p);
    if (a != null && a < 5) return 'little';
    if (a != null && a < 6) return 'k';
    return 'big';
  }
  function finds(tier) { return tier === 'big'; }          /* she taps the broken part herself */
  function traySize(tier, owned) {
    var n = tier === 'toddler' ? 2 : tier === 'little' ? 3 : tier === 'k' ? 4 : (owned >= 7 ? 6 : owned >= 6 ? 5 : 4);
    return Math.max(2, Math.min(n, owned));
  }

  function state(p) {
    if (!p) return null;
    p.games = p.games || {};
    var st = p.games.fixit;
    if (!st || st.v !== 1) {
      var t = tierOf(p);
      st = p.games.fixit = { v: 1, tools: (t === 'big' || t === 'k' ? START.big : START.little).slice(), jobs: 0, stage: 0, inStage: 0, built: 0,
        project: 0, sessions: 0, pending: null, recent: [], seen: {} };
    }
    if (!Array.isArray(st.tools) || !st.tools.length) st.tools = START.little.slice();
    if (!Array.isArray(st.recent)) st.recent = [];
    if (!st.seen) st.seen = {};
    return st;
  }
  function nextTool(st) { for (var i = 0; i < ORDER.length; i++) if (st.tools.indexOf(ORDER[i]) < 0) return ORDER[i]; return null; }

  function newSession(p, rng) {
    var st = state(p), tier = tierOf(p);
    return { p: p, st: st, tier: tier, rng: rngOf(rng), job: null, tray: [], phase: 'pick', misses: 0, wrong: [], found: false, findMiss: 0,
      glow: null, teach: false, firstTry: true, n: 0, lastTools: [] };
  }

  /* the tray: the right tool plus others she owns. Toddlers: one far-apart tool. 6+: one look-alike when she has it. */
  function buildTray(g, job, rng) {
    var owned = g.st.tools.slice(), size = traySize(g.tier, owned.length), out = [job.tool], pool = owned.filter(function (t) { return t !== job.tool; });
    if (g.tier === 'toddler') {
      var far = pool.filter(function (t) { return FAR[job.tool].indexOf(t) >= 0; });
      out.push(pick(rng, far.length ? far : pool));
      return shuffle(rng, out.slice(0, size));
    }
    if (g.tier === 'big') {
      var near = pool.filter(function (t) { return NEAR[job.tool].indexOf(t) >= 0; });
      if (near.length) { var nt = pick(rng, near); out.push(nt); pool = pool.filter(function (t) { return t !== nt; }); }
    }
    pool = shuffle(rng, pool);
    while (out.length < size && pool.length) out.push(pool.shift());
    return shuffle(rng, out);
  }

  /* choose the next job: a pending new tool gets its teach job; else a tool not used in the last 2 jobs, and a job not seen lately */
  function chooseJob(g, rng, opt) {
    var st = g.st;
    if (opt && opt.job) return JOB_BY[opt.job];
    if (st.pending) {
      var tj = JOBS.filter(function (j) { return j.tool === st.pending; });
      return tj[0];
    }
    var tools = st.tools.filter(function (t) { return g.lastTools.slice(-2).indexOf(t) < 0; });
    if (!tools.length) tools = st.tools.slice();
    var tool = pick(rng, tools);
    var jobs = JOBS.filter(function (j) { return j.tool === tool && st.recent.indexOf(j.id) < 0; });
    if (!jobs.length) jobs = JOBS.filter(function (j) { return j.tool === tool; });
    return pick(rng, jobs);
  }
  function nextJob(g, opt) {
    opt = opt || {};
    var rng = rngOf(opt.rng || g.rng), job = chooseJob(g, rng, opt);
    g.teach = !!(g.st.pending && job.tool === g.st.pending);
    if (g.teach) g.st.pending = null;
    g.job = job; g.tray = opt.tray ? opt.tray.slice() : buildTray(g, job, rng);
    g.misses = 0; g.wrong = []; g.findMiss = 0; g.firstTry = true; g.glow = g.teach ? job.tool : null;
    g.found = !finds(g.tier) || g.teach;
    g.phase = g.found ? 'pick' : 'find';
    g.st.recent.push(job.id); if (g.st.recent.length > 6) g.st.recent.shift();
    g.lastTools.push(job.tool); if (g.lastTools.length > 3) g.lastTools.shift();
    g.n++;
    return job;
  }

  /* 6+: a tap in the scene (scene units). Near the part: found. Two misses: the part sparkles so she can see it. */
  function find(g, x, y) {
    if (g.phase !== 'find') return { ok: false, ignored: true };
    var j = g.job, d = Math.hypot(x - j.part.x, y - j.part.y), a = j.alt;
    /* alt: the piece that fell off (a nut, a star, a handle, an arm) lying on the floor counts too */
    if (d <= (j.r || 60) || (a && Math.hypot(x - a.x, y - a.y) <= a.r)) { g.found = true; g.phase = 'pick'; return { ok: true }; }
    g.findMiss++;
    return { ok: false, show: g.findMiss >= 2 };
  }

  /* a tool pick. Wrong: that tool greys out and a hint follows; the second miss (first for little ones) makes the right tool glow. */
  function choose(g, toolId) {
    if (g.phase !== 'pick') return { ok: false, ignored: true };
    if (g.wrong.indexOf(toolId) >= 0 || g.tray.indexOf(toolId) < 0) return { ok: false, ignored: true };
    var j = g.job;
    if (toolId === j.tool) {
      var first = g.firstTry;
      g.phase = 'done';
      return { ok: true, first: first };
    }
    g.firstTry = false; g.misses++; g.wrong.push(toolId);
    var glowAt = (g.tier === 'big' || g.tier === 'k') ? 2 : 1;
    if (g.misses >= glowAt) g.glow = j.tool;
    var hint = g.misses >= glowAt ? j.hint + ' Try the ' + TOOL_BY[j.tool].word + '!' : j.hint;
    return { ok: false, fail: FAIL[toolId], hint: hint, glow: g.glow };
  }

  /* after the fix animation: count the job; every JOBS_PER_STAGE jobs a project stage is built and the next tool is queued */
  function complete(g) {
    var st = g.st, proj = PROJECTS[st.project % PROJECTS.length], res = { stageUp: false, stage: st.stage, projectDone: false, newTool: null };
    st.jobs++; st.inStage++;
    if (st.inStage >= JOBS_PER_STAGE) {
      st.inStage = 0; st.stage++; res.stageUp = true; res.stage = st.stage;
      var nt = nextTool(st);
      if (nt) { st.tools.push(nt); st.pending = nt; res.newTool = nt; }
      if (st.stage >= proj.stages.length) { res.projectDone = true; }
    }
    return res;
  }
  /* "Build another": the finished one goes on the shelf and a new one starts */
  function newProject(st) { st.built++; st.stage = 0; st.inStage = 0; }

  A.FixIt = {
    TOOLS: TOOLS, TOOL_BY: TOOL_BY, JOBS: JOBS, JOB_BY: JOB_BY, FAIL: FAIL, NEAR: NEAR, FAR: FAR, ORDER: ORDER, START: START,
    PROJECTS: PROJECTS, JOBS_PER_STAGE: JOBS_PER_STAGE, CHEERS: CHEERS,
    tierOf: tierOf, finds: finds, traySize: traySize, state: state, newSession: newSession, nextJob: nextJob, buildTray: buildTray,
    find: find, choose: choose, complete: complete, newProject: newProject, nextTool: nextTool, shuffle: shuffle
  };
})(window.Arcade = window.Arcade || {});
