/* p4 (2026-10-29): content for the fun breaks (between levels) and the coloring game. Loaded before voice-lines.js, which
   registers every line here for the device voice (section 'breaks'). Friend ids are food ids (A.Blobs). Jokes and skits only
   run when every friend in them has been met; most use the four starters, so there is always plenty to pick from.
   All original. Kind, silly and simple enough for a 4-year-old. No scores, no right or wrong. */
(function (A) {
  var J = [   // [id, teller, partner, setup, punchline]
    ['j01', 'corn', 'strawberry', 'What did the corn say when it got a big hug?', 'Aww, shucks!'],
    ['j02', 'strawberry', 'blueberry', 'Why did the strawberry call for help?', 'It was in a jam!'],
    ['j03', 'blueberry', 'apple', 'What does a blueberry say on a trampoline?', 'Boing, boing, berry fun!'],
    ['j04', 'apple', 'corn', 'What is red and goes up and down?', 'An apple in an elevator!'],
    ['j05', 'corn', 'blueberry', 'Knock knock! Who is there? Cow says. Cow says who?', 'No, silly! A cow says moo!'],
    ['j06', 'strawberry', 'corn', 'Knock knock! Who is there? Boo. Boo who?', 'Don\'t cry! It is only a joke!'],
    ['j07', 'apple', 'strawberry', 'Knock knock! Who is there? Lettuce. Lettuce who?', 'Lettuce in, it is chilly out here!'],
    ['j08', 'blueberry', 'strawberry', 'What do you call a sleeping dinosaur?', 'A dino-snore! Zzzz!'],
    ['j09', 'corn', 'apple', 'Why did the cookie go to the doctor?', 'It felt crummy!'],
    ['j10', 'apple', 'corn', 'What has ears but cannot hear?', 'A corn cob! Hey, that is me!'],
    ['j11', 'blueberry', 'corn', 'What do you call a bear with no teeth?', 'A gummy bear!'],
    ['j12', 'corn', 'strawberry', 'What did one plate say to the other plate?', 'Lunch is on me!'],
    ['j13', 'strawberry', 'blueberry', 'Why did the teddy bear say no to dessert?', 'It was already stuffed!'],
    ['j14', 'apple', 'blueberry', 'What do you call a funny mountain?', 'Hill-arious!'],
    ['j15', 'blueberry', 'apple', 'How do you make a tissue dance?', 'Put a little boogie in it!'],
    ['j16', 'corn', 'blueberry', 'Why did the banana go to the doctor?', 'It was not peeling well!'],
    ['j17', 'strawberry', 'apple', 'What falls down but never gets hurt?', 'Rain! Pitter patter!'],
    ['j18', 'apple', 'strawberry', 'What kind of tree fits in your hand?', 'A palm tree!'],
    ['j19', 'corn', 'apple', 'Knock knock! Who is there? Interrupting cow. Interrupting c...', 'Moooo!'],
    ['j20', 'strawberry', 'apple', 'Why are fish so smart?', 'They swim in schools!'],
    ['j21', 'apple', 'blueberry', 'What sound does a sneezing cow make?', 'Ah... ah... ah-MOO!'],
    ['j22', 'blueberry', 'corn', 'Why did the cow go to the movies?', 'To see a moo-vie!'],
    ['j23', 'corn', 'strawberry', 'What does a snowman eat for breakfast?', 'Snowflakes! Crunch, crunch!'],
    ['j24', 'strawberry', 'blueberry', 'Why did the egg hide?', 'It was a little chicken!'],
    ['j25', 'apple', 'corn', 'What is a cat\'s favorite color?', 'Purr-ple!'],
    ['j26', 'blueberry', 'apple', 'What is a ghost\'s favorite fruit?', 'Boo-berries! Like me!'],
    ['j27', 'corn', 'blueberry', 'What do you call a train that sneezes?', 'An achoo-choo train!'],
    ['j28', 'strawberry', 'corn', 'What does a cloud wear under its raincoat?', 'Thunderwear!'],
    ['j29', 'apple', 'strawberry', 'Why did the sun go to school?', 'To get brighter!'],
    ['j30', 'blueberry', 'strawberry', 'What do you call a duck that tells jokes?', 'A quack-up!'],
    ['j31', 'corn', 'apple', 'What room has no doors and no windows?', 'A mushroom!'],
    ['j32', 'strawberry', 'blueberry', 'What do you call a sleepy pancake?', 'A flap-snack! Yawn!'],
    ['j33', 'banana', 'strawberry', 'Why did the banana wear sunscreen?', 'So it would not peel!'],
    ['j34', 'pear', 'apple', 'What do you call two pears?', 'A pair! Hee hee!'],
    ['j35', 'carrot', 'corn', 'What does a bunny use to fix its hair?', 'A hare brush!'],
    ['j36', 'pancake', 'blueberry', 'Why was the pancake so happy?', 'It had a whole stack of friends!']
  ];
  // skits: tap to make the next silly beat happen. star = the friend it is about; f = the beat's look (see breaks.css)
  var K = [
    { id: 'k01', title: 'The Butterfly', cast: ['blueberry'], beats: [
      ['Look! A butterfly!', 'prop-in', '🦋'], ['Bloop bounces after it. Boing! Boing!', 'f-hop', '🦋'],
      ['The butterfly lands on Bloop\'s nose!', 'prop-nose', '🦋'], ['Ah... ah... achoo! Flutter, flutter! Hee hee!', 'f-sneeze', '🦋'] ] },
    { id: 'k02', title: 'The Windy Hat', cast: ['apple'], beats: [
      ['What a windy day! Whoosh!', 'wind', '🎩'], ['Oh no! The hat blows away!', 'prop-away', '🎩'],
      ['Crisp runs and runs after it!', 'f-run', '🎩'], ['The hat lands on a bird! Tweet tweet! Ha ha!', 'prop-bird', '🎩'] ] },
    { id: 'k03', title: 'The Big Sneeze', cast: ['corn'], beats: [
      ['Niblet\'s nose feels tickly...', 'f-wobble', '🌼'], ['Ah... ah... ah...', 'f-puff', '🌼'],
      ['Achoo! Niblet bounces up high!', 'f-jumphigh', '💨'], ['Boing, boing, plop! Bless you!', 'f-giggle', '✨'] ] },
    { id: 'k04', title: 'The Tall Sandwich', cast: ['strawberry'], beats: [
      ['Jammy makes a sandwich.', 'prop-stack1', '🥪'], ['One more layer... and one more!', 'prop-stack2', '🥪'],
      ['It is sooo tall! Wobble, wobble!', 'prop-stack3', '🥪'], ['Plop! Sandwiches for everyone! Yum!', 'prop-rain', '🥪'] ] },
    { id: 'k05', title: 'Roly-Poly Hill', cast: ['apple'], beats: [
      ['Crisp sits on top of the hill.', 'f-top', '🍂'], ['Uh oh! Roll, roll, roll!', 'f-roll', '🍂'],
      ['Bump! Into a big pile of leaves!', 'prop-pile', '🍂'], ['Crisp pops out with leafy hair! Ta-da!', 'f-pop', '🍂'] ] },
    { id: 'k06', title: 'Hiccups', cast: ['blueberry'], beats: [
      ['Hic! Bloop has the hiccups!', 'f-hic', '💬'], ['Hic! Every hiccup is a bounce! Hic!', 'f-hop', '💬'],
      ['Hold your breath, Bloop! Puff!', 'f-puff', '🎈'], ['Pop! All gone! Hooray!', 'f-giggle', '✨'] ] },
    { id: 'k07', title: 'The Ant Parade', cast: ['corn', 'strawberry'], beats: [
      ['Here come the ants! March, march!', 'prop-march', '🐜'], ['They carry one tiny crumb.', 'prop-march', '🐜'],
      ['Now a giant cookie! Heave, ho!', 'prop-cookie', '🍪'], ['Bye bye, ants! Wave bye bye!', 'f-wave', '🐜'] ] },
    { id: 'k08', title: 'The Big Puddle', cast: ['apple', 'blueberry'], beats: [
      ['Look! A big puddle!', 'prop-puddle', '💧'], ['One, two, three... jump!', 'f-jumphigh', '💧'],
      ['Splash! Everyone is wet!', 'prop-splash', '💦'], ['Shake, shake, shake! Like a puppy!', 'f-shake', '💦'] ] },
    { id: 'k09', title: 'The Silly Snowman', cast: ['corn'], beats: [
      ['Let us build a snowman!', 'prop-snow1', '⛄'], ['Roll a big ball. Roll a small ball.', 'prop-snow2', '⛄'],
      ['A nose? Oops, it is a corn nose!', 'f-wobble', '🌽'], ['The snowman giggles! Snow everywhere!', 'prop-snowfall', '❄️'] ] },
    { id: 'k10', title: 'The Bouncy Ball', cast: ['strawberry', 'blueberry'], beats: [
      ['Jammy throws the ball. Up, up!', 'prop-up', '⚽'], ['Bloop wants to catch it!', 'f-hop', '⚽'],
      ['Boing! The ball bounces on Bloop\'s head!', 'prop-bonk', '⚽'], ['Bloop is the ball now! Bounce, bounce!', 'f-jumphigh', '✨'] ] }
  ];
  var MOVES = [   // dance moves: [id, call-out, css class]
    ['wiggle', 'Wiggle!', 'mv-wiggle'], ['spin', 'Spin around!', 'mv-spin'], ['jump', 'Jump!', 'mv-jump'], ['sway', 'Sway side to side!', 'mv-sway'],
    ['clap', 'Clap your hands!', 'mv-clap'], ['stomp', 'Stomp your feet!', 'mv-stomp'], ['shake', 'Shake, shake, shake!', 'mv-shake'], ['reach', 'Reach up high!', 'mv-reach'],
    ['squat', 'Squish down low!', 'mv-squat'], ['twist', 'Twist and twist!', 'mv-twist']
  ];
  var LINES = [   // [id, text, note]
    ['br_skip', 'Skip', 'Big skip button'], ['br_done', 'All done! Back to play!', 'End of a break'], ['br_fun', 'Fun break time!', 'Start of a break'],
    ['br_dance', 'Dance party! Copy the moves!', 'Dance break'], ['br_freeze', 'Freeze!', 'Freeze dance: the music stops'],
    ['br_unfreeze', 'Ha ha! Dance again!', 'Freeze dance: the music restarts'], ['br_count', 'Let us count together!', 'Counting dance (readers)'],
    ['br_jump5', 'Jump five times!', 'Counting dance'], ['br_clap5', 'Clap five times!', 'Counting dance'], ['br_stomp5', 'Stomp five times!', 'Counting dance'],
    ['br_joke', 'Joke time! Tap to hear the silly part!', 'Joke break'], ['br_tapjoke', 'Tap for the silly part!', 'Joke: waiting for the tap'],
    ['br_laugh', 'Ha ha ha! Hee hee hee!', 'Friends crack up'], ['br_skit', 'Silly show! Tap to see what happens!', 'Skit break'],
    ['br_tapnext', 'Tap to see what happens next!', 'Skit: waiting for the tap'],
    ['br_peek', 'Peekaboo! Where is your friend hiding?', 'Peekaboo break'], ['br_peek_found', 'Peekaboo! You found me!', 'Peekaboo: found'],
    ['br_peek_bug', 'Not here! Just a ladybug. Hee hee!', 'Peekaboo: a funny surprise in an empty spot'],
    ['br_sounds', 'Silly sounds! Tap your friends to make a song!', 'Sound machine break'], ['br_playsong', 'Here is your song!', 'Sound machine: play back'],
    ['br_dress', 'Dress up time! Tap a hat, glasses or a cape!', 'Dress-up break'], ['br_surprise', 'Ooh! A surprise outfit!', 'Dress-up: a rare outfit appears'],
    ['br_concert', 'Concert time! Tap a friend to play or stop!', 'Mini concert break'],
    ['br_pop', 'Pop, pop, pop! Pop all you want!', 'Pop break'],
    ['br_snow', 'It is snowing! Catch the snowflakes!', 'Weather break: snow'], ['br_rain', 'Rain! Tap to splash in the puddles!', 'Weather break: rain'],
    ['br_rainbow', 'A rainbow! Tap for sparkles!', 'Weather break: rainbow'],
    ['br_color', 'Coloring time! Tap a color, then tap the picture!', 'Coloring break'],
    // coloring game
    ['cl_title', 'Coloring', 'Free Play tile'], ['cl_pick', 'Pick a picture to color!', 'Page picker'], ['cl_fill', 'Tap a color, then tap a part of the picture!', 'Fill tool'],
    ['cl_brush', 'Draw with your finger!', 'Brush tool'], ['cl_stickers', 'Drag a sticker onto your picture!', 'Sticker tool'],
    ['cl_undo', 'Oops! Back one step.', 'Undo'], ['cl_clear', 'Start over! A fresh page.', 'Start over'],
    ['cl_saved', 'Beautiful! It is in your gallery!', 'Saved to the gallery'], ['cl_gallery', 'Your gallery! Swipe to see your pictures.', 'Gallery'],
    ['cl_newpage', 'A new picture to color!', 'A coloring page unlocked'], ['cl_full', 'Your gallery is full! A grown-up can make room.', 'Gallery cap']
  ];
  // sound machine: each friend's silly sound (anything else: by index)
  var SOUNDS = { strawberry: 'sing', apple: 'boing', corn: 'laugh', blueberry: 'boing2', banana: 'slide', pear: 'sing2', carrot: 'burp', mochi: 'pop', pancake: 'drum' };
  var INSTR = ['drum', 'horn', 'piano', 'guitar', 'shaker'];
  A.BreaksData = {
    JOKES: J.map(function (j) { return { id: j[0], a: j[1], b: j[2], q: j[3], p: j[4] }; }),
    SKITS: K, MOVES: MOVES.map(function (m) { return { id: m[0], call: m[1], cls: m[2] }; }), LINES: LINES, SOUNDS: SOUNDS, INSTR: INSTR
  };
})(window.Arcade = window.Arcade || {});
