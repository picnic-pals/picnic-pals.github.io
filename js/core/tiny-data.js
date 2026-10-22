/* Picnic Pals — Tiny Picnic (toddler mode) content: foods, shapes, colors and every spoken line (ids tp_*). */
(function (A) {
  'use strict';
  // food friend art from assets/picnic/friends/<id>/; c = color word used by "Which one is red?" (null = not used for colors)
  var FOODS = [
    { id: 'strawberry', w: 'strawberry', find: 'Find the strawberry!', is: "That's a strawberry!", c: 'red' },
    { id: 'apple', w: 'apple', find: 'Find the apple!', is: "That's an apple!", c: 'red' },
    { id: 'banana', w: 'banana', find: 'Find the banana!', is: "That's a banana!", c: 'yellow' },
    { id: 'corn', w: 'corn', find: 'Find the corn!', is: "That's corn!", c: 'yellow' },
    { id: 'lemon', w: 'lemon', find: 'Find the lemon!', is: "That's a lemon!", c: 'yellow' },
    { id: 'blueberry', w: 'blueberry', find: 'Find the blueberry!', is: "That's a blueberry!", c: 'blue' },
    { id: 'carrot', w: 'carrot', find: 'Find the carrot!', is: "That's a carrot!", c: 'orange' },
    { id: 'broccoli', w: 'broccoli', find: 'Find the broccoli!', is: "That's broccoli!", c: 'green' },
    { id: 'pear', w: 'pear', find: 'Find the pear!', is: "That's a pear!", c: 'green' },
    { id: 'grapes', w: 'grapes', find: 'Find the grapes!', is: 'Those are grapes!', c: 'purple' },
    { id: 'watermelon', w: 'watermelon', find: 'Find the watermelon!', is: "That's a watermelon!", c: null },
    { id: 'pineapple', w: 'pineapple', find: 'Find the pineapple!', is: "That's a pineapple!", c: null },
    { id: 'cupcake', w: 'cupcake', find: 'Find the cupcake!', is: "That's a cupcake!", c: null },
    { id: 'cookie', w: 'cookie', find: 'Find the cookie!', is: "That's a cookie!", c: null }
  ];
  var SHAPES = [
    { id: 'circle', find: 'Find the circle!', is: "That's a circle!", d: '<circle cx="50" cy="50" r="38"/>' },
    { id: 'square', find: 'Find the square!', is: "That's a square!", d: '<rect x="14" y="14" width="72" height="72" rx="8"/>' },
    { id: 'triangle', find: 'Find the triangle!', is: "That's a triangle!", d: '<path d="M50 10 L90 86 H10 Z" stroke-linejoin="round"/>' },
    { id: 'star', find: 'Find the star!', is: "That's a star!", d: '<path d="M50 6 L61 37 L94 38 L68 58 L77 90 L50 71 L23 90 L32 58 L6 38 L39 37 Z" stroke-linejoin="round"/>' },
    { id: 'heart', find: 'Find the heart!', is: "That's a heart!", d: '<path d="M50 88 C20 66 6 48 10 30 C14 12 38 8 50 28 C62 8 86 12 90 30 C94 48 80 66 50 88 Z"/>' }
  ];
  var COLORS = [
    { id: 'red', hex: '#ff4d5e', ask: 'Which one is red?', is: "That's red!" }, { id: 'yellow', hex: '#ffd21f', ask: 'Which one is yellow?', is: "That's yellow!" },
    { id: 'blue', hex: '#4d7cff', ask: 'Which one is blue?', is: "That's blue!" }, { id: 'green', hex: '#3cc45a', ask: 'Which one is green?', is: "That's green!" },
    { id: 'orange', hex: '#ff9a2e', ask: 'Which one is orange?', is: "That's orange!" }, { id: 'purple', hex: '#a35ad8', ask: 'Which one is purple?', is: "That's purple!" }
  ];
  var NUM = ['', 'one', 'two', 'three'];
  var lines = [['tp_title', 'Tiny Picnic!'], ['tp_hello', "Tiny Picnic! Let's play!"], ['tp_match', 'Find the same one!'],
    ['tp_yay_1', 'Yay! You found it!'], ['tp_yay_2', 'Great job!'], ['tp_yay_3', 'Hooray!'], ['tp_yay_4', 'You did it!'],
    ['tp_done', 'Hooray! What a great picnic!'], ['tp_again', 'Play again?'], ['tp_home', 'Bye bye, picnic!']];
  FOODS.forEach(function (f) { lines.push(['tp_find_' + f.id, f.find]); lines.push(['tp_is_' + f.id, f.is]); });
  SHAPES.forEach(function (s) { lines.push(['tp_find_' + s.id, s.find]); lines.push(['tp_is_' + s.id, s.is]); });
  COLORS.forEach(function (c) { lines.push(['tp_color_' + c.id, c.ask]); lines.push(['tp_c_' + c.id, c.is]); });
  [1, 2, 3].forEach(function (n) { lines.push(['tp_count_' + n, 'Find ' + NUM[n] + '!']); lines.push(['tp_n_' + n, "That's " + NUM[n] + '!']); });
  var PT = [['pt_stop', 'Great stopping point! You played so well today. Time to rest.'], ['pt_bye', 'Bye bye! See you next time!'],
    ['pt_stretch', 'Time for a stretch! Reach up high, wiggle your fingers, and take a big breath.']];
  A.Tiny = { FOODS: FOODS, SHAPES: SHAPES, COLORS: COLORS, NUM: NUM, LINES: lines, PT_LINES: PT, ROUND: 6 };
})(window.Arcade);
