/* Blob Arcade — every spoken line, with an ID. This one list drives:
   - the in-app recorder (parent area), - voice playback, - RECORDING_SCRIPT.md (tools/build-recording-script.js).
   File name for a line = <id>.mp3 (or .m4a / .wav / .webm).
   Sentences are COMPOSED from parts, e.g. ['munch_rule_make', 7] -> "Munch the ones that make" + "7". */
(function (A) {
  'use strict';
  var S = [];
  function sec(id, title, when, note, lines) {
    S.push({ id: id, title: title, when: when, note: note || '', lines: lines.map(function (l) { return { id: l[0], text: l[1], note: l[2] || '' }; }) });
  }

  sec('hub', 'Arcade home & menus', 'now', '', [
    ['hub_whos_playing', "Who's playing today?"],
    ['hub_hi', 'Hi,', 'Followed by the player\'s name (spoken by the browser voice), e.g. "Hi," + "Player 1!"'],
    ['hub_welcome_back', 'Welcome back!', 'Said instead of "Hi, <name>!" when the browser has no speech voice'],
    ['hub_pick_game', 'What do you want to play?'],
    ['hub_coming_soon', 'That game is coming soon!'],
    ['hub_stickers', 'Here is your sticker book!'],
    ['hub_closet', 'Dress-up time! Pick your blob, a color, and an outfit.'],
    ['hub_im', "Hi, I'm", 'Followed by a blob name, e.g. "Hi, I\'m" + "Mochi!"'],
    ['hub_looking_good', 'Looking good!'],
    ['hub_locked', 'Keep earning stars to unlock that one!'],
    ['hub_new_sticker', 'You got a new sticker!'],
    ['hub_new_outfit', 'You unlocked a new outfit!'],
    ['hub_new_color', 'You unlocked a new color!'],
    ['hub_grownups', 'That button is for grown-ups.'],
    ['hub_lets_go', "Let's go!"]
  ]);
  sec('names', 'Player & blob names', 'now', 'Say each name brightly, like you are introducing them. (Kids\' own names are spoken by the browser voice.)', [
    ['pl_one', 'Player 1!'], ['pl_two', 'Player 2!'],
    ['blob_mochi', 'Mochi!'], ['blob_poppy', 'Poppy!'], ['blob_dewdrop', 'Dewdrop!'],
    ['blob_pickle', 'Pickle!'], ['blob_nova', 'Nova!'], ['blob_clem', 'Clem!']
  ]);
  sec('munch', 'Mochi Munch', 'now', 'Rule lines are followed by a number clip, e.g. "Munch the ones that make" + "7".', [
    ['munch_title', 'Mochi Munch!'],
    ['munch_ready', 'Ready? Press the space bar, or tap Play!'],
    ['munch_intro', 'Help me munch the right ones!'],
    ['munch_how_keys', 'Use the arrow keys to move. Press space to munch!'],
    ['munch_how_touch', 'Tap a square to walk there. Tap me to munch!'],
    ['munch_rule_number', 'Munch the number', '+ number'],
    ['munch_rule_bigger', 'Munch the numbers bigger than', '+ number'],
    ['munch_rule_smaller', 'Munch the numbers smaller than', '+ number'],
    ['munch_rule_make', 'Munch the ones that make', '+ number'],
    ['munch_rule_make10', 'Make ten! Munch the pairs that make ten!'],
    ['munch_rule_missing', 'Munch the ones where the missing number is', '+ number'],
    ['munch_rule_even', 'Munch the even numbers!'],
    ['munch_rule_odd', 'Munch the odd numbers!'],
    ['munch_already', 'Already munched! Find another one.'],
    ['munch_snack', "That's okay! Let's have a snack break, and try again!"],
    ['munch_boing', 'Boing! Grumbly bumped me back to the corner!']
  ]);
  sec('mathwords', 'Math words (sentence parts)', 'now', 'Short connector words. Say them evenly, not as a question — they get joined with numbers, e.g. "3" + "plus" + "4" + "is" + "7".', [
    ['w_plus', 'plus'], ['w_minus', 'minus'], ['w_is', 'is'], ['w_makes', 'makes'],
    ['w_thats', "That's"], ['w_not', 'not'],
    ['w_bigger_than', 'is bigger than'], ['w_smaller_than', 'is smaller than'], ['w_same_as', 'is the same as'],
    ['w_is_even', 'is even'], ['w_is_odd', 'is odd'], ['w_so_box_is', 'so the box is']
  ]);
  sec('feedback', 'Praise & feedback (shared by all games)', 'now', '', [
    ['fb_yum', 'Yum!'], ['fb_nom', 'Nom nom nom!'], ['fb_yummy', 'Yummy!'], ['fb_great_job', 'Great job!'],
    ['fb_you_got_it', 'You got it!'], ['fb_delicious', 'Delicious!'], ['fb_super', 'Super!'], ['fb_wow', 'Wow!'],
    ['fb_oops', 'Oops!'], ['fb_so_close', 'So close!'],
    ['fb_hooray', 'Hooray!'], ['fb_you_got', 'You got', '+ number + "stars!"'], ['fb_star', 'star!'], ['fb_stars', 'stars!'],
    ['fb_perfect', 'Perfect! No mistakes!'],
    ['fb_level_up', 'Level up!'], ['fb_trickier', 'The next one is a little trickier!'],
    ['fb_one_more', 'Awesome! One more round like that and you have got it!'],
    ['fb_mastered', 'You mastered it! Time for something new!'],
    ['fb_champion', "You're a math champion!"],
    ['fb_practice_again', "Let's practice this one more time!"],
    ['fb_practice_more', "Let's practice some more. You can do it!"],
    ['fb_easier', "Let's try some easier ones!"],
    ['fb_detour', "Let's play one you know, then come back to this one!"],
    ['fb_back_now', "Nice! Now let's go back to the new one!"],
    ['fb_review_good', 'You still remember it! Great!'],
    ['fb_keep_going', 'Keep going!'],
    ['fb_new_skill', 'New skill!'],
    ['fb_try_again', 'Try again!']
  ]);
  sec('skills', 'New-skill intros (Munch)', 'now', 'Played when a new skill unlocks.', [
    ['skill_count10', 'Find the number! Look for the number, or count the dots.'],
    ['skill_compare', 'Bigger and smaller! Which numbers are more? Which are less?'],
    ['skill_add10', 'Adding! Put the numbers together to see how many.'],
    ['skill_sub10', 'Take away! Start with the big number and take some away.'],
    ['skill_make10', 'Make ten! Find two numbers that make ten together.'],
    ['skill_teen', 'Teen numbers! A teen number is ten, and some more.'],
    ['skill_missing', 'Missing number! What number is hiding in the box?'],
    ['skill_add20', 'Adding to twenty! Tip: make ten first, then add the rest.'],
    ['skill_sub20', 'Take away to twenty! Tip: take away to ten first.'],
    ['skill_evenodd', 'Even and odd! Even numbers make pairs. Odd numbers have one left over.']
  ]);
  if (A.EarlyWords) sec('early', 'Colors, shapes, letters & words (new skills)', 'now', 'Rules, letter names and picture words for the Reading & Words and Early Concepts skills. Say letter NAMES ("bee", not "buh"). Picture words: say each word on its own, clearly.', A.EarlyWords.VOICE);
  sec('munch2', 'Mochi Munch: timer, bonus questions & two players', 'now', 'Lines with "+ name" are followed by a player name, e.g. "That one is for" + "Player 2!".', [
    ['munch_times_up', "Time's up! Let's see how you did!"],
    ['munch_little_time', 'Just a little time left!'],
    ['fb_careful', "Careful munching! Let's try that one again."],
    ['munch_bonus_star', 'Ooh, a bonus star! Walk onto it!'],
    ['bonus_title', 'Bonus question!'],
    ['bonus_right', 'You got it! Extra time!'],
    ['bonus_right_star', 'You got it! A bonus star!'],
    ['bonus_wrong', 'Good try! The answer is', '+ answer, e.g. "the Sun!"'],
    ['munch_2p_team', 'Team munch! Munch your own color, and work together!'],
    ['munch_2p_race', 'Munch race! Munch your own color. Ready, set, go!'],
    ['munch_not_yours', 'That one is for', '+ name'],
    ['munch_all_done', 'All done! Great munching!'],
    ['munch_team_win', 'Teamwork! You did it together!'],
    ['munch_team_time', "Time's up! Look how much you munched together!"],
    ['munch_wins_race', 'wins the race!', 'Said after a name: "Player 1" + "wins the race!"'],
    ['munch_both_great', 'Great munching, both of you!'],
    ['munch_tie', "It's a tie! You both did great!"],
    ['hub_how_many', 'One player, or two players?'],
    ['hub_pick_friend', 'Who is playing with you?'],
    ['hub_team_or_race', 'Play as a team, or have a race?'],
    ['hub_one_player', 'One player!'], ['hub_two_players', 'Two players!'],
    ['hub_team', 'Team!'], ['hub_race', 'Race!'],
    ['name_guest', 'Guest!']
  ]);
  sec('munch3', 'Mochi Munch: menu, levels & high scores', 'now', 'Short, bright and friendly.', [
    ['menu_pick', 'Story, free play, or two players?'],
    ['menu_story', 'Story!'], ['menu_free', 'Free play!'],
    ['lvl_level', 'Level', '+ number, e.g. "Level" + "3"'],
    ['lvl_ready', 'Get ready!'],
    ['story_stop', 'Stop', '+ number, e.g. "Stop" + "4"'],
    ['story_next', 'On to the next stop!'],
    ['story_area_done', 'You finished this area! Off we go!'],
    ['story_one_more', 'One more stop here!'],
    ['story_new_best', 'A new high score!'],
    ['story_great_score', 'What a great score!'],
    ['story_locked', 'That stop is still locked. Keep going!'],
    ['story_pick', 'Pick a stop on the map!'],
    ['story_little', 'Little Steps!'], ['story_big', 'Big Steps!'],
    ['story_helper', "Let's make this one a little easier."],
    ['story_try_again', "Almost! Let's try this stop again."],
    ['story_practice', 'Practice round! Your journey is waiting at the star.'],
    ['story_high_scores', 'High scores!'],
    ['story_new_journey', 'A brand new journey! Here we go!'],
    ['hub_new_player', "Let's make a new player! What's your name?"],
    ['hub_pick_blob', 'Pick your blob!'],
    ['hub_pick_color', 'Pick a color!'],
    ['hub_welcome', 'Welcome to the arcade!'],
    ['hub_bye', 'Bye bye! See you soon!'],
    ['ch_title', 'Challenge time!'],
    ['ch_intro', 'Munch them all before the clock runs out, to meet a new friend!'],
    ['ch_again', 'Challenge time! Can you beat your best?'],
    ['ch_fail_time', "So close! Try the challenge again to meet your new friend."],
    ['ch_fail_acc', 'Careful munching wins the challenge. Try again!'],
    ['ch_won_again', 'You beat the challenge again! Super fast!'],
    ['unlock_pick', 'You can be your new friend in Dress Up!'],
    ['hub_locked_blob', 'That friend is waiting on Blob Island. Win the challenge in Story mode!']
  ]);
  if (A.Story) {
    var st = [['story_title', 'Blob Island!'], ['story_prologue', A.Story.PROLOGUE], ['story_finale', A.Story.FINALE]];
    A.Story.AREAS.forEach(function (a) { st.push(['area_' + a.id, a.name + '!', 'Area name on the island map']); });
    A.Story.AREAS.forEach(function (a) { st.push(['beat_' + a.id, a.beat, 'Said by ' + a.friend.charAt(0).toUpperCase() + a.friend.slice(1) + ' when you arrive at ' + a.name]); });
    A.Story.CH.forEach(function (c) { var nm = c.blob.charAt(0).toUpperCase() + c.blob.slice(1); st.push(['unlock_' + c.blob, nm + ' joined the team!']); st.push(['hi_' + c.blob, c.hi, 'Said by ' + nm + ' when they join the team (in their own personality)']); });
    sec('story', 'Mochi Munch story: Blob Island', 'later', 'Story-book voice, warm and excited. The built-in voice already covers these.', st);
  }
  var n20 = []; for (var i = 0; i <= 20; i++) n20.push(['num_' + i, String(i)]);
  sec('numbers', 'Numbers 0–20', 'now', 'Say each number on its own, clearly and cheerfully (not like a question).', n20);
  var n100 = []; for (var j = 21; j <= 100; j++) n100.push(['num_' + j, String(j)]);
  sec('numbers100', 'Numbers 21–100 (optional, for later)', 'later', 'Only needed once games go past 20.', n100);

  sec('sightgame', 'Sight Words game (coming soon)', 'later', '', [
    ['sw_title', 'Sight Words!'], ['sw_find', 'Find the word', '+ word'], ['sw_read', 'Can you read this word?'],
    ['sw_listen', 'Listen!'], ['sw_that_says', 'That word says', '+ word'], ['sw_new_words', 'Here are some new words!'],
    ['sw_great_reading', 'Great reading!'], ['sw_sound_it', "Let's say it together."]
  ]);
  function words(list) { return list.map(function (w) { return [A.SightWords.lineId(w), w]; }); }
  sec('dolch_pp', 'Sight words: Dolch Pre-Primer (40)', 'later', 'Say each word once, clearly, the way you would read it to a little one.', words(A.SightWords.PREPRIMER));
  sec('dolch_p', 'Sight words: Dolch Primer (52)', 'later', '', words(A.SightWords.PRIMER));

  sec('baseball', 'Blob Baseball', 'now', 'The umpire lines ("Strike!", "You\'re out!", "Home run!") can be big and loud, like a real umpire. Lines with "+ number" or "+ name" are followed by one.', [
    ['bb_title', 'Blob Baseball!'], ['bb_play_ball', 'Play ball!'], ['bb_batter_up', 'Batter up!', 'Also followed by a name: "Batter up," + "Player 1!"'],
    ['bb_swing', 'Swing!'], ['bb_strike', 'Strike!'], ['bb_strike_two', 'Strike two!'], ['bb_strike_three', "Strike three! You're out!"],
    ['bb_ball', 'Ball!'], ['bb_foul', 'Foul ball!'], ['bb_hit', "It's a hit!"], ['bb_single', 'Single!'],
    ['bb_double', 'Double!'], ['bb_triple', 'Triple!'], ['bb_home_run', 'Home run!'], ['bb_grand_slam', 'A grand slam!'],
    ['bb_run_scores', 'A run scores!'], ['bb_runs_score', 'runs score!', 'After a number: "Two" + "runs score!"'],
    ['bb_safe', 'Safe!'], ['bb_out', "You're out!"], ['bb_caught', 'Caught it! That\'s an out!'], ['bb_three_outs', 'Three outs! Switch sides!'], ['bb_three_outs_next', 'Three outs! On to the next inning!'],
    ['bb_inning_over', "That's the inning! Great batting!"], ['bb_inning', 'Inning', '+ number, e.g. "Inning" + "2"'], ['bb_last_inning', 'Last inning!'],
    ['bb_next_inning', 'Next inning!'], ['bb_great_swing', 'Great swing!'], ['bb_swing_tip', 'Pick your swing! A single is easy. A home run is a challenge. Get it right, and you hit it!'],
    ['bb_pick_swing', 'Pick your swing!'], ['bb_sw_single', 'A single! Nice and easy.'], ['bb_sw_double', 'A double! Just right.'],
    ['bb_sw_triple', 'A triple! Here comes a tricky one.'], ['bb_sw_homer', 'Going for a home run! Here comes a challenge!'],
    ['bb_big_whiff', 'Whoosh! What a big swing! That is just one strike.'], ['bb_nudge', 'The crowd wants a big swing! Want to try a double or a triple?'],
    ['bb_time_strike', "Out of time! That's a strike."], ['bb_you_scored', 'You scored', '+ number + "runs!"'], ['bb_runs', 'runs!'], ['bb_run', 'run!'],
    ['bb_wins_game', 'wins the game!', 'After a name: "Player 1" + "wins the game!"'], ['bb_tie_game', "It's a tie game! What a game!"],
    ['bb_you_win', 'You win the game!'], ['bb_good_game', 'Good game!'], ['bb_new_high', 'A new high score!'], ['bb_high_scores', 'High scores!']
  ]);
  sec('baseballq', 'Blob Baseball questions (sentence parts)', 'now', 'Question starters, joined with numbers: "What\'s" + "5" + "plus" + "7" → "What\'s five plus seven?". Say them like the start of a question.', [
    ['bbq_whats', "What's"], ['bbq_how_many_dots', 'How many dots?'], ['bbq_find', 'Find the number', '+ number'],
    ['bbq_biggest', 'Which number is the biggest?'], ['bbq_smallest', 'Which number is the smallest?'],
    ['bbq_even', 'Which number is even?'], ['bbq_odd', 'Which number is odd?'],
    ['bbq_what_makes_ten', 'what makes ten?', 'After a number: "6 plus" + "what makes ten?"'], ['bbq_what_makes', 'what makes', 'In the middle: "3 plus" + "what makes" + "7?"']
  ]);
  sec('kicks', 'Penalty Kicks (coming soon)', 'later', '', [
    ['pk_title', 'Penalty Kicks!'], ['pk_your_kick', 'Your turn to kick!'], ['pk_pick_spot', 'Pick a spot to aim!'],
    ['pk_goal', 'Goal!'], ['pk_blocked', 'The goalie blocked it!'], ['pk_save', 'What a save!'], ['pk_missed', 'Just missed!'],
    ['pk_off_post', 'Off the post!'], ['pk_your_goalie', "Now you're the goalie!"], ['pk_dive', 'Dive!'],
    ['pk_great_kick', 'Great kick!'], ['pk_score_is', 'The score is', '+ number + "to" + number'], ['w_to', 'to', 'as in "3 to 2"'], ['pk_you_win', 'You won the shootout!'],
    ['pk_tie', "It's a tie! One more kick!"]
  ]);

  sec('room', 'Blob Room', 'now', 'Cozy and warm, like showing a friend around your room.', [
    ['rm_title', 'My Room!'], ['rm_welcome', 'Welcome to your very own room!'], ['rm_welcome_back', 'Welcome home!'],
    ['rm_shop', "Let's go shopping! What would you like?"], ['rm_decorate', "Let's decorate! Pick a thing, then pick a spot."],
    ['rm_pick_spot', 'Pick a spot!'], ['rm_placed', 'There! It looks great!'], ['rm_bought', "It's yours! Hooray!"],
    ['rm_need_more', 'You need a few more star bits. Play a game to earn some!'], ['rm_costs', 'It costs', '+ number + "star bits."'],
    ['rm_star_bits', 'star bits.'], ['rm_put_away', 'Put away!'], ['rm_undo', 'Undo!'], ['rm_flip', 'Flip!'],
    ['rm_spot_taken', 'That spot is taken. Try another one!'], ['rm_new_wall', 'Ooh, new wallpaper!'], ['rm_new_floor', 'Ooh, a new floor!'],
    ['rm_trophies', 'Here is your trophy shelf!'], ['rm_friends', 'Here are your blob friends!'],
    ['rm_locked_friend', 'This friend is still a secret! Win a story challenge to meet them.'],
    ['rm_locked_item', 'This one is a special prize! Keep playing to win it.'], ['rm_prize_won', 'You won a special prize for your room!'],
    ['rm_friend_up', "You're even better friends now!"], ['rm_shh', "Shh... they're napping."], ['rm_bye', 'Bye bye! See you soon!'],
    ['rm_owned', 'You have this one!'], ['rm_nothing', 'Your things box is empty. Visit the shop!'],
    ['fr_unlock_likes', 'Now you know what I like!'], ['fr_unlock_face', 'I learned a new face! Look!'],
    ['fr_unlock_more', 'Now you know all about me!'], ['fr_unlock_gift', 'I made you a present for your room!'],
    ['fr_lvl1', 'New friend!'], ['fr_lvl2', 'Pal!'], ['fr_lvl3', 'Good friend!'], ['fr_lvl4', 'Best friend!'], ['fr_lvl5', 'Forever friend!']
  ]);
  if (A.Friends) {
    var fl = [];
    Object.keys(A.Friends.BIO).forEach(function (b) {
      var o = A.Friends.BIO[b];
      fl.push(['fr_' + b + '_hi', o.hi], ['fr_' + b + '_likes', o.lk], ['fr_' + b + '_dislikes', o.dl], ['fr_' + b + '_food', o.food]);
      o.taps.forEach(function (t, i) { fl.push(['fr_' + b + '_tap' + (i + 1), t, 'When tapped in the room']); });
      fl.push(['fr_' + b + '_nap', o.napLine, 'Sleepy, while napping']);
    });
    sec('friends', 'Blob friends: bios and room chatter', 'now', 'Each blob talks about themselves. Give each one their own personality (sweet, dreamy, sporty, curious, silly, starry).', fl);
  }
  if (A.RoomCatalog) sec('roomitems', 'Blob Room things (' + A.RoomCatalog.ITEMS.length + ')', 'later', 'Item names, said brightly when a kid taps one in the shop.',
    A.RoomCatalog.ITEMS.map(function (it) { return ['it_' + it.id, it.name + '!']; }));

  if (A.BonusQ) {
    sec('bonusq', 'Bonus questions (' + A.BonusQ.QS.length + ')', 'later', 'Read each question like a friendly quiz host. The built-in voice already covers these, so record them whenever you like.',
      A.BonusQ.QS.map(function (q) { return [q.line, q.q, A.BonusQ.CATS[q.cat]]; }));
    var seen = {}, ans = [];
    A.BonusQ.QS.forEach(function (q) { q.choices.forEach(function (c) { if (!seen[c.line]) { seen[c.line] = 1; ans.push([c.line, c.text]); } }); });
    sec('bonusc', 'Bonus question answers (' + ans.length + ')', 'later', 'Say each answer on its own, brightly. They are read out as choices, and after "The answer is".', ans);
  }
  var BY = {}, ALL = [];
  S.forEach(function (s) { s.lines.forEach(function (l) { l.section = s.id; BY[l.id] = l; ALL.push(l); }); });
  A.VoiceLines = { sections: S, byId: BY, all: ALL, EXTS: ['mp3', 'm4a', 'wav', 'webm', 'ogg'] };
})(window.Arcade);
