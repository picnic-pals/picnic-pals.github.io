/* p4 (2026-10-29): coloring pages. Original line art, 800x600. Each page is a list of fill regions in paint order
   (later ones sit on top) plus decoration lines (stroke only, never fillable). Big regions so a 2-year-old can tap them.
   req: null (always), {friend: id} (once met) or {place: id} (once the story reaches it). Locked pages are never listed. */
(function (A) {
  function C(cx, cy, r) { return 'M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + (2 * r) + ' 0a' + r + ' ' + r + ' 0 1 0 ' + (-2 * r) + ' 0Z'; }
  function E(cx, cy, rx, ry) { return 'M' + (cx - rx) + ' ' + cy + 'a' + rx + ' ' + ry + ' 0 1 0 ' + (2 * rx) + ' 0a' + rx + ' ' + ry + ' 0 1 0 ' + (-2 * rx) + ' 0Z'; }
  function R(x, y, w, h, r) { r = r || 0; return 'M' + (x + r) + ' ' + y + 'h' + (w - 2 * r) + (r ? 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r : '') + 'v' + (h - 2 * r) + (r ? 'a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + r : '') + 'h' + (2 * r - w) + (r ? 'a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + (-r) : '') + 'v' + (2 * r - h) + (r ? 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + (-r) : '') + 'Z'; }
  function cloud(x, y, s) { s = s || 1; return 'M' + x + ' ' + y + 'a' + 30 * s + ' ' + 30 * s + ' 0 0 1 ' + 50 * s + ' ' + (-22 * s) + 'a' + 38 * s + ' ' + 38 * s + ' 0 0 1 ' + 70 * s + ' ' + 8 * s + 'a' + 28 * s + ' ' + 28 * s + ' 0 0 1 ' + 12 * s + ' ' + 54 * s + 'h' + (-128 * s) + 'a' + 22 * s + ' ' + 22 * s + ' 0 0 1 ' + (-4 * s) + ' ' + (-40 * s) + 'Z'; }
  function flower(cx, cy, r) {   // petals as one region, center as another
    var d = '', k; for (k = 0; k < 5; k++) { var a = k * 2 * Math.PI / 5 - Math.PI / 2, px = Math.round(cx + Math.cos(a) * r * 1.1), py = Math.round(cy + Math.sin(a) * r * 1.1); d += C(px, py, Math.round(r * .75)); }
    return [d, C(cx, cy, Math.round(r * .62))];
  }
  var SKY = ['sky', R(0, 0, 800, 600)], SUN = ['sun', C(690, 95, 52)];
  function ground(y) { return ['ground', 'M0 ' + y + ' C 200 ' + (y - 40) + ' 420 ' + (y + 30) + ' 800 ' + (y - 20) + ' V600 H0Z']; }
  function face(cx, cy, s) {   // eyes + cheeks are regions; the smile is a line
    s = s || 1; return { r: [['eyeL', C(cx - 38 * s, cy, 14 * s)], ['eyeR', C(cx + 38 * s, cy, 14 * s)], ['cheekL', E(cx - 64 * s, cy + 34 * s, 18 * s, 11 * s)], ['cheekR', E(cx + 64 * s, cy + 34 * s, 18 * s, 11 * s)]],
      l: ['M' + (cx - 26 * s) + ' ' + (cy + 34 * s) + ' Q ' + cx + ' ' + (cy + 66 * s) + ' ' + (cx + 26 * s) + ' ' + (cy + 34 * s)] };
  }
  function page(id, name, req, regions, lines, f) {
    if (f) { regions = regions.concat(f.r); lines = (lines || []).concat(f.l); }
    return { id: id, name: name, req: req, regions: regions.map(function (r) { return { id: r[0], d: r[1] }; }), lines: lines || [] };
  }
  var fl1 = flower(110, 500, 26), fl2 = flower(700, 520, 22);
  var PAGES = [
    page('jammy', 'Jammy the strawberry', null, [SKY, SUN, ['cloud', cloud(80, 140)], ground(470), ['petals1', fl1[0]], ['center1', fl1[1]],
      ['body', 'M400 540 C 250 480 220 300 300 250 C 345 222 455 222 500 250 C 580 300 550 480 400 540 Z'],
      ['leaf1', 'M400 250 C 360 200 300 210 290 240 C 330 250 370 255 400 250 Z'], ['leaf2', 'M400 250 C 440 200 500 210 510 240 C 470 250 430 255 400 250 Z'],
      ['leaf3', 'M400 252 C 380 205 395 180 410 175 C 425 200 420 230 400 252 Z']],
      ['M330 420 l6 10', 'M470 420 l-6 10', 'M360 470 l5 9', 'M440 470 l-5 9', 'M400 495 l0 10', 'M300 360 l6 8', 'M500 360 l-6 8'], face(400, 345, 1)),
    page('crisp', 'Crisp the apple', null, [SKY, ['cloud', cloud(560, 120)], ground(480), ['petals1', fl1[0]], ['center1', fl1[1]],
      ['body', 'M400 270 C 330 225 245 265 250 370 C 255 480 340 545 400 515 C 460 545 545 480 550 370 C 555 265 470 225 400 270 Z'],
      ['stem', 'M392 272 C 390 240 395 215 405 195 L 418 200 C 408 222 404 245 406 272 Z'],
      ['leaf', 'M410 215 C 440 175 500 175 515 195 C 485 225 440 230 410 215 Z']], [], face(400, 375, 1)),
    page('niblet', 'Niblet the corn', null, [SKY, SUN, ground(500), ['husk1', 'M400 560 C 300 520 260 420 290 330 C 320 400 350 470 400 560 Z'],
      ['cob', E(400, 360, 95, 190)], ['husk2', 'M400 560 C 330 500 300 430 310 360 C 350 430 370 500 400 560 Z'], ['husk3', 'M400 560 C 500 520 540 420 510 330 C 480 400 450 470 400 560 Z']],
      ['M340 260 h120', 'M325 300 h150', 'M318 340 h164', 'M318 420 h164', 'M325 460 h150', 'M400 175 v40'], face(400, 370, .9)),
    page('bloop', 'Bloop the blueberry', null, [SKY, ['cloud', cloud(90, 120)], ['cloud2', cloud(560, 90, .8)], ground(490), ['petals2', fl2[0]], ['center2', fl2[1]],
      ['body', C(400, 370, 160)], ['crown', 'M340 222 L 360 180 L 385 210 L 400 170 L 415 210 L 440 180 L 460 222 C 425 236 375 236 340 222 Z']], [], face(400, 380, 1.05)),
    page('picnic', 'Picnic time', null, [SKY, SUN, ['cloud', cloud(100, 110)], ground(400), ['tree', C(130, 300, 90)], ['trunk', R(115, 370, 32, 110, 6)],
      ['blanket', 'M220 470 L 620 440 L 760 560 L 300 590 Z'], ['basket', 'M420 430 h170 l-18 90 h-134 Z'], ['handle', 'M440 432 C 450 360 560 360 570 432 L 556 432 C 548 382 462 382 454 432 Z'],
      ['apple', C(320, 520, 26)], ['cup', 'M640 500 h40 l-6 50 h-28 Z']], ['M260 500 L 690 470', 'M280 535 L 725 510', 'M380 465 L 430 585', 'M520 455 L 590 575']),
    page('meadow', 'Berry Meadow', null, [SKY, SUN, ['cloud', cloud(120, 120)], ['hill2', 'M0 380 C 160 300 360 330 520 400 V600 H0Z'], ['hill1', 'M300 420 C 480 330 680 340 800 380 V600 H300Z'],
      ['petals1', fl1[0]], ['center1', fl1[1]], ['petals2', fl2[0]], ['center2', fl2[1]], ['petals3', flower(420, 470, 30)[0]], ['center3', flower(420, 470, 30)[1]],
      ['wingL', 'M560 220 C 520 170 490 200 505 240 C 520 270 550 250 560 230 Z'], ['wingR', 'M570 220 C 610 170 640 200 625 240 C 610 270 580 250 570 230 Z'], ['bfly', E(565, 235, 8, 30)]],
      ['M110 530 v60', 'M700 545 v50', 'M420 505 v90', 'M560 205 C 550 185 540 180 530 182', 'M570 205 C 580 185 590 180 600 182']),
    page('banana', 'Peel the banana', { friend: 'banana' }, [SKY, SUN, ground(500), ['body', 'M250 260 C 280 480 520 540 610 380 C 630 350 600 330 580 350 C 500 450 340 420 300 250 C 295 230 255 235 250 260 Z'],
      ['tip', 'M248 262 C 240 235 250 215 268 212 C 285 215 300 232 300 250 C 285 248 262 252 248 262 Z']], ['M300 300 C 340 400 450 440 560 380'], face(430, 410, .7)),
    page('crunch', 'Crunch the carrot', { friend: 'carrot' }, [SKY, ['cloud', cloud(560, 110)], ground(500), ['body', 'M300 230 C 360 210 440 210 500 230 C 480 360 440 480 400 560 C 360 480 320 360 300 230 Z'],
      ['top1', 'M400 225 C 360 160 330 140 320 120 C 360 120 395 160 405 220 Z'], ['top2', 'M400 225 C 400 150 410 110 425 90 C 445 130 430 180 405 225 Z'], ['top3', 'M405 225 C 440 160 480 140 500 135 C 490 175 450 210 410 228 Z']],
      ['M330 300 h30', 'M450 330 h-28', 'M360 420 h24'], face(400, 300, .8)),
    page('petey', 'Petey the pear', { friend: 'pear' }, [SKY, SUN, ground(500), ['body', 'M400 220 C 350 220 345 300 330 340 C 270 400 280 540 400 545 C 520 540 530 400 470 340 C 455 300 450 220 400 220 Z'],
      ['stem', R(392, 180, 14, 44, 5)], ['leaf', 'M406 195 C 430 160 480 160 492 178 C 465 205 430 210 406 195 Z']], [], face(400, 410, .85)),
    page('sprinkles', 'Sprinkles the cupcake', { friend: 'cupcake' }, [SKY, ['cloud', cloud(90, 110)], ground(520),
      ['wrapper', 'M280 360 L 520 360 L 490 540 L 310 540 Z'], ['frosting', 'M260 370 C 240 300 300 250 340 260 C 350 200 450 200 460 260 C 500 250 560 300 540 370 Z'], ['cherry', C(400, 205, 28)]],
      ['M330 370 L 345 540', 'M380 370 L 385 540', 'M420 370 L 415 540', 'M470 370 L 455 540', 'M320 300 l14 -6', 'M450 300 l14 6', 'M390 260 l10 4'], face(400, 450, .7)),
    page('lagoon', 'Letter Lagoon', { place: 'lagoon' }, [SKY, SUN, ['water', 'M0 300 C 200 280 600 320 800 300 V600 H0Z'], ['pad1', E(140, 455, 105, 40)],
      ['pad2', E(560, 520, 110, 42)], ['pad3', E(640, 380, 70, 28)], ['frog', E(140, 410, 70, 50)], ['frogeyeL', C(110, 360, 20)], ['frogeyeR', C(170, 360, 20)],
      ['lotus', 'M560 500 C 540 450 560 430 580 470 C 590 420 620 420 620 470 C 640 430 660 450 640 500 Z']], ['M60 330 h40', 'M300 360 h50', 'M420 330 h40', 'M120 440 Q 140 455 160 440']),
    page('hills', 'Muffin Hills', { place: 'hills' }, [SKY, SUN, ['cloud', cloud(100, 110)], ['hill3', 'M0 360 C 150 260 330 280 420 380 V600 H0Z'], ['hill2', 'M300 400 C 450 290 650 300 800 360 V600 H300Z'],
      ['hill1', 'M0 470 C 250 420 500 470 800 450 V600 H0Z'], ['cup1', 'M150 490 h90 l-12 70 h-66 Z'], ['top1', 'M140 495 C 140 440 250 440 250 495 Z'], ['cup2', 'M560 470 h110 l-14 85 h-82 Z'], ['top2', 'M548 476 C 548 410 682 410 682 476 Z']], []),
    page('woods', 'Word Woods', { place: 'woods' }, [SKY, ['moon', 'M680 60 C 620 80 620 170 690 190 C 640 200 590 150 600 110 C 610 70 650 55 680 60 Z'], ground(500),
      ['tree1', 'M150 120 L 260 330 H 40 Z'], ['tree2', 'M650 160 L 760 380 H 540 Z'], ['tree3', 'M400 80 L 520 330 H 280 Z'], ['trunk1', R(135, 330, 30, 170)], ['trunk2', R(635, 380, 30, 130)], ['trunk3', R(385, 330, 30, 175)],
      ['owl', E(400, 400, 60, 70)], ['owleyeL', C(378, 380, 16)], ['owleyeR', C(422, 380, 16)]], ['M393 400 l7 12 l7 -12', 'M360 330 l15 25', 'M440 330 l-15 25']),
    page('peaks', 'Pancake Peaks', { place: 'peaks' }, [SKY, SUN, ['cloud', cloud(80, 140)], ['peak1', 'M0 520 L 220 180 L 440 520 Z'], ['snow1', 'M220 180 L 260 240 L 230 230 L 200 250 L 185 235 Z'],
      ['peak2', 'M330 520 L 560 140 L 800 520 Z'], ['snow2', 'M560 140 L 600 205 L 570 195 L 540 215 L 525 200 Z'], ground(520), ['stack1', R(320, 470, 160, 30, 15)], ['stack2', R(330, 440, 140, 30, 15)], ['butter', R(380, 425, 40, 18, 5)]], []),
    page('bay', 'Melon Bay', { place: 'bay' }, [SKY, SUN, ['cloud', cloud(110, 100)], ['sea', 'M0 280 C 200 300 600 260 800 290 V460 H0Z'], ['sand', 'M0 440 C 250 420 550 470 800 440 V600 H0Z'],
      ['boat', 'M220 300 H 520 C 500 380 240 380 220 300 Z'], ['rind', 'M220 300 H 520 C 518 312 515 322 510 330 C 450 370 290 370 230 330 C 225 322 222 312 220 300 Z'], ['sail', 'M370 120 L 370 290 L 480 290 Z'],
      ['crab', E(620, 520, 60, 36)], ['clawL', C(545, 490, 18)], ['clawR', C(695, 490, 18)], ['shell', 'M140 530 C 140 480 220 480 220 530 Z']], ['M370 120 v180', 'M300 320 l4 10', 'M370 330 l4 10', 'M440 320 l4 10', 'M160 530 l20 -40', 'M200 530 l-20 -40']),
    page('caves', 'Cookie Caves', { place: 'caves' }, [['rock', R(0, 0, 800, 600)], ['cave', 'M120 600 C 120 300 300 160 400 160 C 500 160 680 300 680 600 Z'],
      ['crystal1', 'M200 600 L 230 470 L 260 600 Z'], ['crystal2', 'M560 600 L 600 430 L 640 600 Z'], ['crystal3', 'M100 140 L 130 60 L 160 140 Z'], ['crystal4', 'M660 120 L 690 40 L 720 120 Z'],
      ['cookie', C(400, 470, 90)], ['chip1', C(370, 440, 12)], ['chip2', C(430, 460, 12)], ['chip3', C(390, 510, 12)], ['chip4', C(440, 420, 10)]], ['M300 300 C 320 280 340 290 350 270', 'M470 260 C 490 250 500 270 520 260'])
  ];
  var BY = {}; PAGES.forEach(function (p) { BY[p.id] = p; });
  function metOf(p) { return A.Story2 && A.Story2.met ? A.Story2.met(p) : ((A.Blobs && A.Blobs.STARTERS) || []); }
  function placeReached(p, id) {
    var S2 = A.Story2; if (!S2 || !p || !p.story) return false; var k = S2.PLACES.map(function (x) { return x.id; }).indexOf(id); if (k < 0) return false;
    try { if (S2.reached(p, k)) return true; } catch (e) {}
    var others = p.storyHeroes || {}, saved = p.story, hit = false;   // any hero's story counts
    Object.keys(others).forEach(function (h) { if (hit || !others[h] || others[h] === saved) return; try { p.story = others[h]; hit = S2.reached(p, k); } catch (e) {} p.story = saved; });
    return hit;
  }
  function open(p, pg) { var r = pg.req; if (!r) return true; if (r.friend) return metOf(p).indexOf(r.friend) >= 0; if (r.place) return placeReached(p, r.place); return false; }
  A.ColorPages = { PAGES: PAGES, byId: BY, available: function (p) { return PAGES.filter(function (pg) { return open(p, pg); }); }, isOpen: open };
})(window.Arcade);
