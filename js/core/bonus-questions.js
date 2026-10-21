/* Blob Arcade — bonus questions (general knowledge for ages 4–7).
   Each question: id, cat (category), d (1 = little kids / age 4+, 2 = a bit harder / age 6+), q (spoken + shown),
   c = choices [emoji, words]; the FIRST choice is the right answer (choices are shuffled when shown).
   Voice line ids: q_<id> for the question, c_<words> for each answer (shared), and the phrase
   bonus_wrong + c_<answer> ("Good try! The answer is ..."). Pictures are standard emoji so non-readers can play. */
(function (A) {
  'use strict';
  var CATS = { space: 'Space', animals: 'Animals', colors: 'Colors & shapes', seasons: 'Seasons & weather', body: 'My body', food: 'Food',
    opposites: 'Opposites', odd: 'Odd one out', rhymes: 'Rhymes', science: 'Simple science', world: 'Maps & places' };
  var Q = [
    // ---- space ----
    ['notplanet', 'space', 1, 'Which one is NOT a planet?', [['☀️', 'the Sun'], ['🌍', 'Earth'], ['🪐', 'Saturn']]],
    ['livein', 'space', 1, 'Which planet do we live on?', [['🌍', 'Earth'], ['🔴', 'Mars'], ['🪐', 'Saturn']]],
    ['daylight', 'space', 1, 'What gives us light and warmth in the daytime?', [['☀️', 'the Sun'], ['🌙', 'the Moon'], ['☁️', 'a cloud']]],
    ['rings', 'space', 2, 'Which planet has big, beautiful rings?', [['🪐', 'Saturn'], ['🌍', 'Earth'], ['🔴', 'Mars']]],
    ['redplanet', 'space', 2, 'Which planet is called the red planet?', [['🔴', 'Mars'], ['🌍', 'Earth'], ['🪐', 'Saturn']]],
    ['rocket', 'space', 1, 'What do astronauts ride into space?', [['🚀', 'a rocket'], ['🚌', 'a bus'], ['⛵', 'a sailboat']]],
    ['moonorbit', 'space', 2, 'What does the Moon go around and around?', [['🌍', 'Earth'], ['🪐', 'Saturn'], ['🔴', 'Mars']]],
    ['nightsky', 'space', 1, 'What do we see twinkling in the night sky?', [['⭐', 'stars'], ['🌈', 'a rainbow'], ['🦋', 'butterflies']]],
    ['spacesuit', 'space', 1, 'What does an astronaut wear in space?', [['🧑‍🚀', 'a space suit'], ['🩱', 'a swimsuit'], ['🧥', 'a raincoat']]],
    ['biggest', 'space', 2, 'Which one is the biggest?', [['☀️', 'the Sun'], ['🌍', 'Earth'], ['🌙', 'the Moon']]],
    ['sunstar', 'space', 2, 'The Sun is a big, hot...', [['⭐', 'star'], ['🌙', 'moon'], ['☁️', 'cloud']]],
    // ---- animals ----
    ['moo', 'animals', 1, 'Which animal says moo?', [['🐄', 'a cow'], ['🐈', 'a cat'], ['🦆', 'a duck']]],
    ['quack', 'animals', 1, 'Which animal says quack?', [['🦆', 'a duck'], ['🐕', 'a dog'], ['🐖', 'a pig']]],
    ['oink', 'animals', 1, 'Which animal says oink?', [['🐖', 'a pig'], ['🐄', 'a cow'], ['🐑', 'a sheep']]],
    ['roar', 'animals', 1, 'Which animal has a big, loud roar?', [['🦁', 'a lion'], ['🐭', 'a mouse'], ['🐑', 'a sheep']]],
    ['neck', 'animals', 1, 'Which animal has a very long neck?', [['🦒', 'a giraffe'], ['🐖', 'a pig'], ['🐸', 'a frog']]],
    ['trunk', 'animals', 1, 'Which animal has a long trunk?', [['🐘', 'an elephant'], ['🦁', 'a lion'], ['🦓', 'a zebra']]],
    ['stripes', 'animals', 1, 'Which animal has black and white stripes?', [['🦓', 'a zebra'], ['🐘', 'an elephant'], ['🦁', 'a lion']]],
    ['fly', 'animals', 1, 'Which animal has wings and can fly?', [['🐦', 'a bird'], ['🐟', 'a fish'], ['🐢', 'a turtle']]],
    ['fins', 'animals', 1, 'Which animal swims with fins?', [['🐟', 'a fish'], ['🐎', 'a horse'], ['🐇', 'a rabbit']]],
    ['puppy', 'animals', 1, 'A puppy grows up to be a...', [['🐕', 'dog'], ['🐈', 'cat'], ['🐄', 'cow']]],
    ['kitten', 'animals', 1, 'A kitten grows up to be a...', [['🐈', 'cat'], ['🐕', 'dog'], ['🐎', 'horse']]],
    ['tadpole', 'animals', 2, 'A tadpole grows up to be a...', [['🐸', 'frog'], ['🐟', 'fish'], ['🦆', 'duck']]],
    ['caterpillar', 'animals', 2, 'A caterpillar turns into a...', [['🦋', 'butterfly'], ['🕷️', 'spider'], ['🐌', 'snail']]],
    ['pouch', 'animals', 2, 'Which animal hops and carries its baby in a pouch?', [['🦘', 'a kangaroo'], ['🐄', 'a cow'], ['🐕', 'a dog']]],
    ['wool', 'animals', 2, 'Which animal gives us soft wool?', [['🐑', 'a sheep'], ['🐟', 'a fish'], ['🐔', 'a chicken']]],
    ['eggs', 'animals', 1, 'Which animal lays the eggs we eat for breakfast?', [['🐔', 'a chicken'], ['🐄', 'a cow'], ['🐕', 'a dog']]],
    ['eightlegs', 'animals', 2, 'Which animal has eight legs?', [['🕷️', 'a spider'], ['🐜', 'an ant'], ['🐦', 'a bird']]],
    ['shell', 'animals', 1, 'Which animal carries a hard shell on its back?', [['🐢', 'a turtle'], ['🐕', 'a dog'], ['🐦', 'a bird']]],
    ['honey', 'animals', 1, 'Which animal makes honey?', [['🐝', 'a bee'], ['🐜', 'an ant'], ['🦋', 'a butterfly']]],
    ['whale', 'animals', 2, 'Which animal is the biggest?', [['🐳', 'a whale'], ['🐭', 'a mouse'], ['🐈', 'a cat']]],
    ['penguin', 'animals', 2, 'Which bird cannot fly, but is a great swimmer?', [['🐧', 'a penguin'], ['🦜', 'a parrot'], ['🦉', 'an owl']]],
    ['hoot', 'animals', 1, 'Which bird says hoo hoo at night?', [['🦉', 'an owl'], ['🐔', 'a chicken'], ['🦆', 'a duck']]],
    ['milkfrom', 'animals', 1, 'Which animal gives us milk to drink?', [['🐄', 'a cow'], ['🐔', 'a chicken'], ['🐟', 'a fish']]],
    ['carrots', 'animals', 1, 'Which animal loves to munch carrots and has long ears?', [['🐇', 'a rabbit'], ['🦁', 'a lion'], ['🐟', 'a fish']]],
    ['bark', 'animals', 1, 'Which animal says woof?', [['🐕', 'a dog'], ['🐈', 'a cat'], ['🐄', 'a cow']]],
    // ---- colors & shapes ----
    ['sky', 'colors', 1, 'What color is the sky on a sunny day?', [['🟦', 'blue'], ['🟩', 'green'], ['🟥', 'red']]],
    ['grass', 'colors', 1, 'What color is grass?', [['🟩', 'green'], ['🟪', 'purple'], ['🟧', 'orange']]],
    ['banana', 'colors', 1, 'What color is a ripe banana?', [['🟨', 'yellow'], ['🟦', 'blue'], ['🟪', 'purple']]],
    ['snowcolor', 'colors', 1, 'What color is snow?', [['⬜', 'white'], ['⬛', 'black'], ['🟩', 'green']]],
    ['stopsign', 'colors', 1, 'What color is a stop sign?', [['🟥', 'red'], ['🟩', 'green'], ['🟦', 'blue']]],
    ['redyellow', 'colors', 2, 'Red and yellow paint mixed together make...', [['🟧', 'orange'], ['🟩', 'green'], ['🟪', 'purple']]],
    ['blueyellow', 'colors', 2, 'Blue and yellow paint mixed together make...', [['🟩', 'green'], ['🟧', 'orange'], ['🟥', 'red']]],
    ['redblue', 'colors', 2, 'Red and blue paint mixed together make...', [['🟪', 'purple'], ['🟩', 'green'], ['🟧', 'orange']]],
    ['triangle', 'colors', 1, 'Which shape has three sides?', [['🔺', 'a triangle'], ['🔵', 'a circle'], ['🟦', 'a square']]],
    ['circle', 'colors', 1, 'Which shape is round, like a ball?', [['🔵', 'a circle'], ['🔺', 'a triangle'], ['🟩', 'a square']]],
    ['squaresides', 'colors', 2, 'How many sides does a square have?', [['4️⃣', 'four'], ['3️⃣', 'three'], ['6️⃣', 'six']]],
    ['starpoints', 'colors', 1, 'Which shape has five points?', [['⭐', 'a star'], ['🔵', 'a circle'], ['🟦', 'a square']]],
    ['heartshape', 'colors', 1, 'Which one is a heart?', [['❤️', 'the heart'], ['⭐', 'the star'], ['🔵', 'the circle']]],
    // ---- seasons & weather ----
    ['leaves', 'seasons', 2, 'In which season do lots of leaves fall off the trees?', [['🍂', 'fall'], ['🏖️', 'summer'], ['🌷', 'spring']]],
    ['snowseason', 'seasons', 1, 'In which season do we often see snow?', [['⛄', 'winter'], ['🏖️', 'summer'], ['🌷', 'spring']]],
    ['bloom', 'seasons', 2, 'In which season do many flowers start to bloom?', [['🌷', 'spring'], ['⛄', 'winter'], ['🍂', 'fall']]],
    ['hottest', 'seasons', 1, 'Which season is the hottest?', [['🏖️', 'summer'], ['⛄', 'winter'], ['🍂', 'fall']]],
    ['umbrella', 'seasons', 1, 'What do you use to stay dry in the rain?', [['☂️', 'an umbrella'], ['🕶️', 'sunglasses'], ['🧤', 'mittens']]],
    ['rainbow', 'seasons', 1, 'What colorful thing can you see when the sun shines while it rains?', [['🌈', 'a rainbow'], ['⛄', 'a snowman'], ['🌙', 'the Moon']]],
    ['mittens', 'seasons', 1, 'What keeps your hands warm when it is cold?', [['🧤', 'mittens'], ['👡', 'sandals'], ['🩳', 'shorts']]],
    ['lightning', 'seasons', 2, 'What flashes bright in the sky during a storm?', [['⚡', 'lightning'], ['🌈', 'a rainbow'], ['⭐', 'a star']]],
    ['snowice', 'seasons', 2, 'Snowflakes are made of tiny bits of...', [['🧊', 'ice'], ['🍬', 'sugar'], ['📄', 'paper']]],
    ['snowman', 'seasons', 1, 'What can you build with snow?', [['⛄', 'a snowman'], ['🏖️', 'a beach'], ['🌻', 'a sunflower']]],
    // ---- body ----
    ['see', 'body', 1, 'What do you use to see?', [['👀', 'your eyes'], ['👂', 'your ears'], ['👃', 'your nose']]],
    ['hear', 'body', 1, 'What do you use to hear?', [['👂', 'your ears'], ['👀', 'your eyes'], ['✋', 'your hands']]],
    ['smell', 'body', 1, 'What do you use to smell a flower?', [['👃', 'your nose'], ['🦶', 'your feet'], ['👂', 'your ears']]],
    ['fingers', 'body', 1, 'How many fingers are on one hand?', [['5️⃣', 'five'], ['3️⃣', 'three'], ['🔟', 'ten']]],
    ['chew', 'body', 1, 'What do you use to chew your food?', [['🦷', 'your teeth'], ['👂', 'your ears'], ['👀', 'your eyes']]],
    ['heartbeat', 'body', 2, 'What goes thump-thump inside your chest?', [['❤️', 'your heart'], ['👃', 'your nose'], ['🦶', 'your foot']]],
    ['think', 'body', 2, 'What part of your body helps you think?', [['🧠', 'your brain'], ['🦵', 'your leg'], ['👂', 'your ear']]],
    ['wash', 'body', 1, 'What should you do before you eat?', [['🧼', 'wash your hands'], ['😴', 'take a nap'], ['🦘', 'hop like a kangaroo']]],
    ['legs', 'body', 1, 'How many legs do you have?', [['2️⃣', 'two'], ['4️⃣', 'four'], ['6️⃣', 'six']]],
    // ---- food ----
    ['fruit', 'food', 1, 'Which one is a fruit?', [['🍎', 'an apple'], ['🥕', 'a carrot'], ['🍞', 'bread']]],
    ['veggie', 'food', 2, 'Which one is a vegetable?', [['🥕', 'a carrot'], ['🍎', 'an apple'], ['🍌', 'a banana']]],
    ['frozen', 'food', 1, 'Which treat is cold and frozen?', [['🍦', 'ice cream'], ['🍲', 'soup'], ['🍞', 'toast']]],
    ['tree', 'food', 2, 'Which one grows on a tree?', [['🍎', 'an apple'], ['🥕', 'a carrot'], ['🥔', 'a potato']]],
    ['cheese', 'food', 2, 'Which food is made from milk?', [['🧀', 'cheese'], ['🍎', 'an apple'], ['🥕', 'a carrot']]],
    ['yellowfruit', 'food', 1, 'Which fruit is long and yellow?', [['🍌', 'a banana'], ['🍇', 'grapes'], ['🍓', 'a strawberry']]],
    ['strawberry', 'food', 2, 'Which red fruit has tiny seeds on the outside?', [['🍓', 'a strawberry'], ['🍌', 'a banana'], ['🍇', 'grapes']]],
    ['popcorn', 'food', 2, 'Popcorn is made from...', [['🌽', 'corn'], ['🍎', 'apples'], ['🥕', 'carrots']]],
    ['bees', 'food', 1, 'Bees make a sweet, sticky food called...', [['🍯', 'honey'], ['🧀', 'cheese'], ['🍞', 'bread']]],
    ['orangefruit', 'food', 1, 'Which fruit is orange, round and juicy?', [['🍊', 'an orange'], ['🍌', 'a banana'], ['🍇', 'grapes']]],
    // ---- opposites ----
    ['hot', 'opposites', 1, 'What is the opposite of hot?', [['🥶', 'cold'], ['☀️', 'sunny'], ['📢', 'loud']]],
    ['big', 'opposites', 1, 'What is the opposite of big?', [['🐭', 'small'], ['🦒', 'tall'], ['🐆', 'fast']]],
    ['up', 'opposites', 1, 'What is the opposite of up?', [['⬇️', 'down'], ['⬅️', 'left'], ['➡️', 'right']]],
    ['day', 'opposites', 1, 'What is the opposite of day?', [['🌙', 'night'], ['🌅', 'morning'], ['🥪', 'lunch']]],
    ['happy', 'opposites', 1, 'What is the opposite of happy?', [['😢', 'sad'], ['🤪', 'silly'], ['😴', 'sleepy']]],
    ['fast', 'opposites', 1, 'What is the opposite of fast?', [['🐢', 'slow'], ['📢', 'loud'], ['🥶', 'cold']]],
    ['open', 'opposites', 2, 'What is the opposite of open?', [['🔒', 'closed'], ['🥶', 'cold'], ['🐭', 'small']]],
    ['wet', 'opposites', 2, 'What is the opposite of wet?', [['🏜️', 'dry'], ['🥶', 'cold'], ['📢', 'loud']]],
    ['loud', 'opposites', 2, 'What is the opposite of loud?', [['🤫', 'quiet'], ['🐆', 'fast'], ['🦒', 'tall']]],
    // ---- odd one out ----
    ['notfruit', 'odd', 1, 'Which one is NOT a fruit?', [['🥕', 'the carrot'], ['🍎', 'the apple'], ['🍌', 'the banana'], ['🍇', 'the grapes']]],
    ['notanimal', 'odd', 1, 'Which one is NOT an animal?', [['🚗', 'the car'], ['🐈', 'the cat'], ['🐕', 'the dog'], ['🐄', 'the cow']]],
    ['notwear', 'odd', 1, 'Which one do you NOT wear on your feet?', [['🥄', 'the spoon'], ['🧦', 'the sock'], ['👟', 'the sneaker'], ['👢', 'the boot']]],
    ['cantfly', 'odd', 1, 'Which one can NOT fly?', [['🐟', 'the fish'], ['🐦', 'the bird'], ['✈️', 'the airplane'], ['🦋', 'the butterfly']]],
    ['notalive', 'odd', 2, 'Which one is NOT alive?', [['🧸', 'the teddy bear'], ['🌳', 'the tree'], ['🐸', 'the frog'], ['🐝', 'the bee']]],
    ['noteat', 'odd', 1, 'Which one can you NOT eat?', [['🧸', 'the teddy bear'], ['🍕', 'the pizza'], ['🍎', 'the apple'], ['🧀', 'the cheese']]],
    ['notwater', 'odd', 1, 'Which one does NOT live in the water?', [['🦁', 'the lion'], ['🐟', 'the fish'], ['🐙', 'the octopus'], ['🐳', 'the whale']]],
    ['nowheels', 'odd', 2, 'Which one does NOT have wheels?', [['⛵', 'the sailboat'], ['🚗', 'the car'], ['🚲', 'the bike'], ['🚌', 'the bus']]],
    ['notmusic', 'odd', 2, 'Which one is NOT a musical instrument?', [['🔨', 'the hammer'], ['🥁', 'the drum'], ['🎸', 'the guitar'], ['🎺', 'the trumpet']]],
    // ---- rhymes ----
    ['r_cat', 'rhymes', 1, 'Which one rhymes with cat?', [['🎩', 'hat'], ['🐕', 'dog'], ['☀️', 'sun']]],
    ['r_bee', 'rhymes', 1, 'Which one rhymes with bee?', [['🌳', 'tree'], ['🐄', 'cow'], ['🚌', 'bus']]],
    ['r_car', 'rhymes', 1, 'Which one rhymes with car?', [['⭐', 'star'], ['🌙', 'moon'], ['🐟', 'fish']]],
    ['r_frog', 'rhymes', 1, 'Which one rhymes with frog?', [['🐕', 'dog'], ['🐈', 'cat'], ['🐦', 'bird']]],
    ['r_cake', 'rhymes', 2, 'Which one rhymes with cake?', [['🐍', 'snake'], ['🍎', 'apple'], ['🥁', 'drum']]],
    ['r_goat', 'rhymes', 2, 'Which one rhymes with goat?', [['⛵', 'boat'], ['🐄', 'cow'], ['🐑', 'sheep']]],
    ['r_bear', 'rhymes', 2, 'Which one rhymes with bear?', [['🪑', 'chair'], ['🛏️', 'bed'], ['👟', 'shoe']]],
    ['r_mouse', 'rhymes', 1, 'Which one rhymes with mouse?', [['🏠', 'house'], ['🧀', 'cheese'], ['🐈', 'cat']]],
    ['r_moon', 'rhymes', 1, 'Which one rhymes with moon?', [['🥄', 'spoon'], ['⭐', 'star'], ['☀️', 'sun']]],
    ['r_king', 'rhymes', 2, 'Which one rhymes with king?', [['💍', 'ring'], ['👑', 'crown'], ['🏰', 'castle']]],
    ['r_fish', 'rhymes', 2, 'Which one rhymes with fish?', [['🍽️', 'dish'], ['🍴', 'fork'], ['🥤', 'cup']]],
    // ---- simple science ----
    ['plants', 'science', 1, 'What do plants need to grow?', [['💧', 'water'], ['🍬', 'candy'], ['🧸', 'toys']]],
    ['melt', 'science', 2, 'What happens to ice when it gets warm?', [['💧', 'it melts'], ['❄️', 'it gets colder'], ['🏀', 'it bounces']]],
    ['magnet', 'science', 2, 'Which one sticks to a magnet?', [['📎', 'a paper clip'], ['📄', 'paper'], ['🧸', 'a teddy bear']]],
    ['float', 'science', 2, 'Which one floats on water?', [['⛵', 'a boat'], ['🔑', 'a key'], ['🔨', 'a hammer']]],
    ['rainfall', 'science', 1, 'What falls from rain clouds?', [['💧', 'water'], ['🍂', 'leaves'], ['🍬', 'candy']]],
    ['seed', 'science', 1, 'A seed can grow into a...', [['🌱', 'plant'], ['☁️', 'cloud'], ['🚗', 'car']]],
    ['fire', 'science', 1, 'Which one is very hot?', [['🔥', 'fire'], ['🧊', 'ice'], ['⛄', 'a snowman']]],
    ['magnify', 'science', 2, 'Which tool helps you see tiny things up close?', [['🔍', 'a magnifying glass'], ['🥄', 'a spoon'], ['🧦', 'a sock']]],
    ['clock', 'science', 1, 'What do we use to tell the time?', [['⏰', 'a clock'], ['👟', 'a sneaker'], ['🍎', 'an apple']]],
    ['breathe', 'science', 2, 'What do we breathe in all day and all night?', [['🌬️', 'air'], ['🧃', 'juice'], ['🏖️', 'sand']]],
    // ---- maps & places ----
    ['ocean', 'world', 2, 'What do we call a giant, salty water with big waves?', [['🌊', 'the ocean'], ['💧', 'a puddle'], ['🥤', 'a cup']]],
    ['map', 'world', 1, 'What shows you where places are?', [['🗺️', 'a map'], ['⏰', 'a clock'], ['🥄', 'a spoon']]],
    ['compass', 'world', 2, 'Which tool always points north?', [['🧭', 'a compass'], ['🥄', 'a spoon'], ['🔨', 'a hammer']]],
    ['mountain', 'world', 1, 'What is very, very tall land with a pointy top?', [['⛰️', 'a mountain'], ['🏖️', 'a beach'], ['🌊', 'the ocean']]],
    ['beach', 'world', 1, 'Where can you find lots of sand next to the water?', [['🏖️', 'a beach'], ['🌲', 'a forest'], ['⛰️', 'a mountain']]],
    ['forest', 'world', 1, 'What place has lots and lots of trees?', [['🌲', 'a forest'], ['🏜️', 'a desert'], ['🌊', 'the ocean']]],
    ['desert', 'world', 2, 'Where is it very hot and dry, with lots of sand?', [['🏜️', 'a desert'], ['🌲', 'a forest'], ['🧊', 'an iceberg']]],
    ['earthshape', 'world', 2, 'The Earth is round, like a...', [['⚽', 'ball'], ['📦', 'box'], ['🔺', 'triangle']]],
    ['city', 'world', 2, 'What do we call a big place with lots of buildings and streets?', [['🏙️', 'a city'], ['🌊', 'an ocean'], ['🌲', 'a forest']]],
    ['penguinhome', 'world', 2, 'Many penguins live where it is very...', [['🥶', 'cold'], ['🔥', 'hot'], ['📢', 'loud']]]
  ];
  function slug(t) { return 'c_' + String(t).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); }
  var QS = Q.map(function (x) {
    return { id: x[0], line: 'q_' + x[0], cat: x[1], d: x[2], q: x[3], choices: x[4].map(function (c) { return { emoji: c[0], text: c[1], line: slug(c[1]) }; }), answer: 0 };
  });
  var BY = {}; QS.forEach(function (q) { BY[q.id] = q; });
  // pick a question for a player: never one of their recent ones, easier ones for little kids
  function pick(p) {
    var b = p.bonus || (p.bonus = { asked: 0, right: 0, recent: [] }), little = p.age != null ? p.age <= 5 : false;
    var recent = b.recent || [], keep = Math.min(60, QS.length - 10);
    var pool = QS.filter(function (q) { return recent.indexOf(q.id) < 0 && (!little || q.d === 1); });
    if (!pool.length) pool = QS.filter(function (q) { return recent.slice(-20).indexOf(q.id) < 0; });
    var q = pool[Math.floor(Math.random() * pool.length)];
    recent.push(q.id); while (recent.length > keep) recent.shift(); b.recent = recent; b.asked = (b.asked || 0) + 1;
    return q;
  }
  A.BonusQ = { CATS: CATS, QS: QS, byId: BY, pick: pick, slug: slug };
})(window.Arcade);
