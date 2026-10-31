# Picnic Pals — Voice Recording Script

Hi grown-up! The arcade already talks, using friendly built-in voice clips (computer-generated, in `audio/voice-tts/`). Every line you record replaces that line with your voice — you can do a few at a time, in any order, and the grown-up area shows each line as “your voice”, “built-in clip” or “computer voice”.

## The short version

1. Start with the **Record first** sections: **1121 lines** (roughly 20–30 minutes). Everything else is for upcoming games and can wait.
2. Record **one line per file**, using the exact **file name** in the table (e.g. `munch_rule_make.m4a`).
3. Say it **cheerfully**, a little slower than normal, and leave a **short pause** (about half a second) before and after.

## Tips

- Quiet room; soft stuff around you helps (a closet full of clothes is perfect). Fans and TV off.
- A phone voice memo is totally fine. Hold the phone about a hand-width from your mouth, a little to the side.
- Smile while you talk — kids can hear it.
- Numbers and little words (“plus”, “is”, “That’s”) get stitched into sentences, so say them in an even, middle-of-a-sentence tone — not like a question, not too final.
- Lines marked “+ number” are followed by a number clip. Say them as if a number comes next: “Munch the ones that make…”.
- Made a mistake? Just re-record that one line. Nothing else changes.

## Two ways to add recordings

**A. In the app (easiest).** Press and hold the gear (top-right corner) → answer the grown-up question → **Voice recorder**. Every line below is listed with **● Record / ▶ Play / Re-record**. Recordings are saved in that browser on that device. To move them to another device (e.g. laptop → iPad): **Export (.zip)**, then **Import** on the other device.

**B. Record on your phone, send files.** Name each file exactly as in the **File name** column (any of .m4a, .mp3, .wav or .webm is fine, e.g. `num_7.m4a`). Then either import them in the Voice recorder (it takes a zip or a bunch of audio files at once), or drop them into the website’s `audio/voice/` folder and run `node tools/make-voice-manifest.js` (or `python3 tools/make_voice_manifest.py`) so the games know they are there.

## How sentences are built

To keep the list short, sentences are put together from pieces:

| Kids hear | Built from |
|---|---|
| “Munch the ones that make 7!” | `munch_rule_make + num_7` |
| “Yum! 3 plus 4 is 7!” | `fb_yum + num_3 + w_plus + num_4 + w_is + num_7` |
| “Oops! That’s 5, not 7.” | `fb_oops + w_thats + num_5 + w_not + num_7` |
| “Welcome back! What do you want to play?” | `hub_welcome_back + hub_pick_game` |
| “Hooray! You got 3 stars!” | `fb_hooray + fb_you_got + num_3 + fb_stars` |

A sentence plays in your voice once every piece of it is recorded. Until then it uses the built-in clips (which include whole-sentence versions), so it never sounds half-and-half. The game trims silence at the start and end of each piece and evens out the volume when it stitches them (when the arcade is opened from a web address; opened as a file, keep your pauses short).

## Line counts

| Section | When | Lines |
|---|---|---:|
| Arcade home & menus | **Record first** | 20 |
| Prizes & goals | **Record first** | 6 |
| Player & friend names | **Record first** | 29 |
| Picnic Munch | **Record first** | 17 |
| Math words (sentence parts) | **Record first** | 12 |
| Praise & feedback (shared by all games) | **Record first** | 34 |
| New-skill intros (Munch) | **Record first** | 10 |
| Colors, shapes, letters & words (new skills) | **Record first** | 686 |
| Picnic Munch: timer, bonus questions & two players | **Record first** | 25 |
| Picnic Munch: menu, levels & high scores | **Record first** | 33 |
| Picnic Munch story: Picnic Island | Later | 55 |
| Numbers 0–20 | **Record first** | 21 |
| Numbers 21–100 (optional, for later) | Later | 80 |
| Sight Words game (coming soon) | Later | 8 |
| Sight words: Dolch Pre-Primer (40) | Later | 40 |
| Sight words: Dolch Primer (52) | Later | 52 |
| Snack Slugger | **Record first** | 47 |
| Snack Slugger questions (sentence parts) | **Record first** | 9 |
| Penalty Kicks (coming soon) | Later | 15 |
| Picnic Spot | **Record first** | 47 |
| Coach v2: placement check, mistake hints, picnic story problems | **Record first** | 36 |
| Picnic friends: bios and room chatter | Later | 216 |
| Picnic Spot things (68) | Later | 68 |
| Dress Up hats and held items (34) | Later | 34 |
| Dress Up: how to earn each locked hat or item | Later | 26 |
| Bonus questions (198) | Later | 198 |
| Bonus question answers (388) | Later | 388 |
| Tiny Picnic (toddler mode) | **Record first** | 66 |
| Play-time limit & stretch breaks | **Record first** | 3 |
| Number steps (counting, facts to 20) | **Record first** | 20 |
| Topic questions (animals, colors & shapes, seasons & weather, letters) | Later | 622 |
| Lemonade Stand | Later | 134 |
| Bubble Pop | Later | 87 |
| Story mode v2 | Later | 33 |
| Fun breaks and coloring | Later | 161 |
| Quality pass 1 (new questions and asks) | Later | 31 |
| **Record first, total** | | **1121** |
| Later (optional, upcoming games), total | | 2248 |
| **Everything** | | **3369** |

## Arcade home & menus — record first (20)

| # | File name | Say this | Note |
|---:|---|---|---|
| 1 | `hub_whos_playing.m4a` | Who's playing today? |  |
| 2 | `hub_hi.m4a` | Hi, | Followed by the player's name (spoken by the browser voice), e.g. "Hi," + "Player 1!" |
| 3 | `hub_welcome_back.m4a` | Welcome back! | Said instead of "Hi, <name>!" when the browser has no speech voice |
| 4 | `hub_pick_game.m4a` | What do you want to play? |  |
| 5 | `hub_coming_soon.m4a` | That game is coming soon! |  |
| 6 | `hub_stickers.m4a` | Here is your sticker book! |  |
| 7 | `hub_closet.m4a` | Dress-up time! Pick your friend, a backdrop color, a hat, and something to hold. |  |
| 8 | `hub_im.m4a` | Hi, I'm | Followed by a friend name, e.g. "Hi, I'm" + "Jammy!" |
| 9 | `hub_looking_good.m4a` | Looking good! |  |
| 10 | `hub_locked.m4a` | Keep earning stars to unlock that one! |  |
| 11 | `hub_you_need.m4a` | You need | Followed by a number, then "more stars to go!" |
| 12 | `hub_more_stars.m4a` | more stars to go! |  |
| 13 | `hub_more_star.m4a` | more star to go! |  |
| 14 | `hub_new_sticker.m4a` | You got a new sticker! |  |
| 15 | `hub_new_outfit.m4a` | You unlocked a new outfit! |  |
| 16 | `hub_new_color.m4a` | You unlocked a new color! |  |
| 17 | `hub_grownups.m4a` | That button is for grown-ups. |  |
| 18 | `hub_ask_grownup.m4a` | Ask a grown-up for help. |  |
| 19 | `hub_lets_go.m4a` | Let's go! |  |
| 20 | `hub_continue.m4a` | Let's keep playing! |  |

## Prizes & goals — record first (6)

End-of-session prize card, save toast and goals.

| # | File name | Say this | Note |
|---:|---|---|---|
| 21 | `rw_session_prizes.m4a` | Look at the prizes you earned today! |  |
| 22 | `rw_new_friend.m4a` | You made a new friend! |  |
| 23 | `rw_you_learned.m4a` | You learned something new. Hooray for you! |  |
| 24 | `rw_more_next_time.m4a` | More prizes are waiting for next time! |  |
| 25 | `rw_saved.m4a` | All saved! |  |
| 26 | `rw_next_goal.m4a` | Here's your next goal! |  |

## Player & friend names — record first (29)

Say each name brightly, like you are introducing them. (Kids' own names are spoken by the browser voice.) Friend names marked * are placeholders.

| # | File name | Say this | Note |
|---:|---|---|---|
| 27 | `pl_one.m4a` | Player 1! |  |
| 28 | `pl_two.m4a` | Player 2! |  |
| 29 | `blob_strawberry.m4a` | Jammy! | Strawberry |
| 30 | `blob_apple.m4a` | Crisp! | Apple |
| 31 | `blob_corn.m4a` | Niblet! | Corn on the cob |
| 32 | `blob_blueberry.m4a` | Bloop! | Blueberry |
| 33 | `blob_mochi.m4a` | Dora Dumpling! | Rice dumpling (was Mochi) |
| 34 | `blob_banana.m4a` | Peel! | Banana |
| 35 | `blob_pear.m4a` | Petey Pear! | Pear |
| 36 | `blob_carrot.m4a` | Crunch! | Carrot |
| 37 | `blob_broccoli.m4a` | Brock! | Broccoli |
| 38 | `blob_sushi.m4a` | Umi! | Sushi (salmon nigiri) |
| 39 | `blob_taco.m4a` | Guac! | Taco |
| 40 | `blob_pizza.m4a` | Slice! | Pizza slice |
| 41 | `blob_pancake.m4a` | Maple! | Pancake stack |
| 42 | `blob_cupcake.m4a` | Sprinkles! | Cupcake |
| 43 | `blob_avocado.m4a` | Avo! | Avocado (half) (placeholder name) |
| 44 | `blob_watermelon.m4a` | Mellie! | Watermelon slice (placeholder name) |
| 45 | `blob_pretzel.m4a` | Twist! | Soft pretzel (placeholder name) |
| 46 | `blob_grapes.m4a` | Vinnie! | Grapes (bunch) (placeholder name) |
| 47 | `blob_onigiri.m4a` | Nori! | Onigiri (rice ball) (placeholder name) |
| 48 | `blob_pineapple.m4a` | Spike! | Pineapple (placeholder name) |
| 49 | `blob_waffle.m4a` | Wally! | Waffle (placeholder name) |
| 50 | `blob_lemon.m4a` | Zest! | Lemon (placeholder name) |
| 51 | `blob_donut.m4a` | Minty! | Donut (mint glaze) (placeholder name) |
| 52 | `blob_popcorn.m4a` | Popper! | Popcorn box (placeholder name) |
| 53 | `blob_peach.m4a` | Peachy! | Peach (placeholder name) |
| 54 | `blob_cheese.m4a` | Gouda! | Cheese wedge (placeholder name) |
| 55 | `blob_cookie.m4a` | Chip! | Chocolate-chip cookie (placeholder name) |

## Picnic Munch — record first (17)

Rule lines are followed by a number clip, e.g. "Munch the ones that make" + "7".

| # | File name | Say this | Note |
|---:|---|---|---|
| 56 | `munch_title.m4a` | Picnic Munch! |  |
| 57 | `munch_ready.m4a` | Ready? Press the space bar, or tap Play! |  |
| 58 | `munch_ready_touch.m4a` | Ready? Tap a square to walk, and tap your friend to munch. Tap Play! | Touch screens (no keyboard) |
| 59 | `munch_intro.m4a` | Help me munch the right ones! |  |
| 60 | `munch_how_keys.m4a` | Use the arrow keys to move. Press space to munch! |  |
| 61 | `munch_how_touch.m4a` | Tap a square to walk there. Tap me to munch! |  |
| 62 | `munch_rule_number.m4a` | Munch the number | + number |
| 63 | `munch_rule_bigger.m4a` | Munch the numbers bigger than | + number |
| 64 | `munch_rule_smaller.m4a` | Munch the numbers smaller than | + number |
| 65 | `munch_rule_make.m4a` | Munch the ones that make | + number |
| 66 | `munch_rule_make10.m4a` | Make ten! Munch the pairs that make ten! |  |
| 67 | `munch_rule_missing.m4a` | Munch the ones where the missing number is | + number |
| 68 | `munch_rule_even.m4a` | Munch the even numbers! |  |
| 69 | `munch_rule_odd.m4a` | Munch the odd numbers! |  |
| 70 | `munch_already.m4a` | Already munched! Find another one. |  |
| 71 | `munch_snack.m4a` | That's okay! Let's have a snack break, and try again! |  |
| 72 | `munch_boing.m4a` | Boing! Grumbly bumped me back to the corner! |  |

## Math words (sentence parts) — record first (12)

Short connector words. Say them evenly, not as a question — they get joined with numbers, e.g. "3" + "plus" + "4" + "is" + "7".

| # | File name | Say this | Note |
|---:|---|---|---|
| 73 | `w_plus.m4a` | plus |  |
| 74 | `w_minus.m4a` | minus |  |
| 75 | `w_is.m4a` | is |  |
| 76 | `w_makes.m4a` | makes |  |
| 77 | `w_thats.m4a` | That's |  |
| 78 | `w_not.m4a` | not |  |
| 79 | `w_bigger_than.m4a` | is bigger than |  |
| 80 | `w_smaller_than.m4a` | is smaller than |  |
| 81 | `w_same_as.m4a` | is the same as |  |
| 82 | `w_is_even.m4a` | is even |  |
| 83 | `w_is_odd.m4a` | is odd |  |
| 84 | `w_so_box_is.m4a` | so the box is |  |

## Praise & feedback (shared by all games) — record first (34)

| # | File name | Say this | Note |
|---:|---|---|---|
| 85 | `fb_yum.m4a` | Yum! |  |
| 86 | `fb_nom.m4a` | Nom nom nom! |  |
| 87 | `fb_yummy.m4a` | Yummy! |  |
| 88 | `fb_great_job.m4a` | Great job! |  |
| 89 | `fb_you_got_it.m4a` | You got it! |  |
| 90 | `fb_delicious.m4a` | Delicious! |  |
| 91 | `fb_super.m4a` | Super! |  |
| 92 | `fb_wow.m4a` | Wow! |  |
| 93 | `fb_oops.m4a` | Oops! |  |
| 94 | `fb_so_close.m4a` | So close! |  |
| 95 | `fb_hooray.m4a` | Hooray! |  |
| 96 | `fb_you_got.m4a` | You got | + number + "stars!" |
| 97 | `fb_star.m4a` | star! |  |
| 98 | `fb_stars.m4a` | stars! |  |
| 99 | `fb_perfect.m4a` | Perfect! No mistakes! |  |
| 100 | `fb_level_up.m4a` | Level up! |  |
| 101 | `fb_trickier.m4a` | The next one is a little trickier! |  |
| 102 | `fb_one_more.m4a` | Awesome! One more round like that and you have got it! |  |
| 103 | `fb_mastered.m4a` | You mastered it! Time for something new! |  |
| 104 | `fb_champion.m4a` | You're a math champion! |  |
| 105 | `fb_practice_again.m4a` | Let's practice this one more time! |  |
| 106 | `fb_practice_more.m4a` | Let's practice some more. You can do it! |  |
| 107 | `fb_easier.m4a` | Let's try some easier ones! |  |
| 108 | `fb_detour.m4a` | Let's play one you know, then come back to this one! |  |
| 109 | `fb_back_now.m4a` | Nice! Now let's go back to the new one! |  |
| 110 | `fb_review_good.m4a` | You still remember it! Great! |  |
| 111 | `coach_streak5.m4a` | Five in a row! Super streak! | Streak reward (with confetti) after 5 right answers in a row |
| 112 | `coach_streak10.m4a` | Ten in a row! You are amazing! | Streak reward after 10, 15, 20 … right answers in a row |
| 113 | `coach_watch_me.m4a` | Let's do one together. Watch me! | Worked example after 3 misses in a row |
| 114 | `coach_easy_one.m4a` | Let's try an easy one. You can do it! | Ease off after 2 misses in a row (an easier snack glows) |
| 115 | `coach_test_out.m4a` | You are so speedy! Next round is a quick test to skip ahead! | After 5 fast right answers in a row: the next round is a 5-question test-out |
| 116 | `fb_keep_going.m4a` | Keep going! |  |
| 117 | `fb_new_skill.m4a` | New skill! |  |
| 118 | `fb_try_again.m4a` | Try again! |  |

## New-skill intros (Munch) — record first (10)

Played when a new skill unlocks.

| # | File name | Say this | Note |
|---:|---|---|---|
| 119 | `skill_count10.m4a` | Find the number! Look for the number, or count the dots. |  |
| 120 | `skill_compare.m4a` | Bigger and smaller! Which numbers are more? Which are less? |  |
| 121 | `skill_add10.m4a` | Adding! Put the numbers together to see how many. |  |
| 122 | `skill_sub10.m4a` | Take away! Start with the big number and take some away. |  |
| 123 | `skill_make10.m4a` | Make ten! Find two numbers that make ten together. |  |
| 124 | `skill_teen.m4a` | Teen numbers! A teen number is ten, and some more. |  |
| 125 | `skill_missing.m4a` | Missing number! What number is hiding in the box? |  |
| 126 | `skill_add20.m4a` | Adding to twenty! Tip: make ten first, then add the rest. |  |
| 127 | `skill_sub20.m4a` | Take away to twenty! Tip: take away to ten first. |  |
| 128 | `skill_evenodd.m4a` | Even and odd! Even numbers make pairs. Odd numbers have one left over. |  |

## Colors, shapes, letters & words (new skills) — record first (686)

Rules, letter names and picture words for the Reading & Words and Early Concepts skills. Say letter NAMES ("bee", not "buh"). Picture words: say each word on its own, clearly.

| # | File name | Say this | Note |
|---:|---|---|---|
| 129 | `rule_color_red.m4a` | Munch the red things! |  |
| 130 | `rule_color_yellow.m4a` | Munch the yellow things! |  |
| 131 | `rule_color_blue.m4a` | Munch the blue things! |  |
| 132 | `rule_color_green.m4a` | Munch the green things! |  |
| 133 | `rule_color_orange.m4a` | Munch the orange things! |  |
| 134 | `rule_color_purple.m4a` | Munch the purple things! |  |
| 135 | `rule_color_pink.m4a` | Munch the pink things! |  |
| 136 | `rule_color_brown.m4a` | Munch the brown things! |  |
| 137 | `rule_shape_circle.m4a` | Munch the circles! |  |
| 138 | `rule_shape_square.m4a` | Munch the squares! |  |
| 139 | `rule_shape_triangle.m4a` | Munch the triangles! |  |
| 140 | `rule_shape_star.m4a` | Munch the stars! |  |
| 141 | `rule_shape_heart.m4a` | Munch the hearts! |  |
| 142 | `rule_shape_rectangle.m4a` | Munch the rectangles! |  |
| 143 | `rule_shape_oval.m4a` | Munch the ovals! |  |
| 144 | `rule_shape_diamond.m4a` | Munch the diamonds! |  |
| 145 | `sh_circle.m4a` | a circle |  |
| 146 | `sh_square.m4a` | a square |  |
| 147 | `sh_triangle.m4a` | a triangle |  |
| 148 | `sh_star.m4a` | a star |  |
| 149 | `sh_heart.m4a` | a heart |  |
| 150 | `sh_rectangle.m4a` | a rectangle |  |
| 151 | `sh_oval.m4a` | an oval |  |
| 152 | `sh_diamond.m4a` | a diamond |  |
| 153 | `rule_letter.m4a` | Munch the letter | + letter, e.g. "Munch the letter" + "B" |
| 154 | `w_big_little.m4a` | big and little! |  |
| 155 | `rule_begins.m4a` | Munch the things that start with | + letter + "like" + word: "...start with" + "B" + "like" + "banana" |
| 156 | `w_like.m4a` | like |  |
| 157 | `w_starts_with.m4a` | starts with | "banana" + "starts with" + "B" |
| 158 | `rule_rhymes.m4a` | Munch the things that rhyme with | + word |
| 159 | `w_rhymes_with.m4a` | rhymes with | "hat" + "rhymes with" + "cat" |
| 160 | `w_no_rhyme.m4a` | does not rhyme with | "dog" + "does not rhyme with" + "cat" |
| 161 | `rule_sight.m4a` | Munch the word | + sight word |
| 162 | `w_are.m4a` | are | "grapes" + "are" + "purple" |
| 163 | `q_which_is.m4a` | Which one is | + color or shape: "Which one is" + "red?" |
| 164 | `q_which_letter.m4a` | Which one is the letter | + letter |
| 165 | `q_which_starts.m4a` | Which one starts with | + letter |
| 166 | `q_which_rhymes.m4a` | Which one rhymes with | + word |
| 167 | `fb_star_learner.m4a` | You're a super learner! |  |
| 168 | `skill_colors.m4a` | Colors! Find the things that are the same color. |  |
| 169 | `skill_shapes.m4a` | Shapes! Circles, squares, triangles, and more. |  |
| 170 | `skill_letters.m4a` | Letters! Find the letter. Big letters and little letters. |  |
| 171 | `skill_begsound.m4a` | First sounds! Say the name of the picture. What sound does it start with? |  |
| 172 | `skill_rhymes.m4a` | Rhymes! Cat, hat and bat all sound the same at the end. |  |
| 173 | `skill_sight.m4a` | Sight words! Little words we see in every book. |  |
| 174 | `lt_a.m4a` | A | the letter name |
| 175 | `lt_b.m4a` | B | the letter name |
| 176 | `lt_c.m4a` | C | the letter name |
| 177 | `lt_d.m4a` | D | the letter name |
| 178 | `lt_e.m4a` | E | the letter name |
| 179 | `lt_f.m4a` | F | the letter name |
| 180 | `lt_g.m4a` | G | the letter name |
| 181 | `lt_h.m4a` | H | the letter name |
| 182 | `lt_i.m4a` | I | the letter name |
| 183 | `lt_j.m4a` | J | the letter name |
| 184 | `lt_k.m4a` | K | the letter name |
| 185 | `lt_l.m4a` | L | the letter name |
| 186 | `lt_m.m4a` | M | the letter name |
| 187 | `lt_n.m4a` | N | the letter name |
| 188 | `lt_o.m4a` | O | the letter name |
| 189 | `lt_p.m4a` | P | the letter name |
| 190 | `lt_q.m4a` | Q | the letter name |
| 191 | `lt_r.m4a` | R | the letter name |
| 192 | `lt_s.m4a` | S | the letter name |
| 193 | `lt_t.m4a` | T | the letter name |
| 194 | `lt_u.m4a` | U | the letter name |
| 195 | `lt_v.m4a` | V | the letter name |
| 196 | `lt_w.m4a` | W | the letter name |
| 197 | `lt_x.m4a` | X | the letter name |
| 198 | `lt_y.m4a` | Y | the letter name |
| 199 | `lt_z.m4a` | Z | the letter name |
| 200 | `pw_pink.m4a` | pink |  |
| 201 | `pw_brown.m4a` | brown |  |
| 202 | `pw_strawberry.m4a` | strawberry |  |
| 203 | `pw_cherries.m4a` | cherries |  |
| 204 | `pw_tomato.m4a` | tomato |  |
| 205 | `pw_fire_truck.m4a` | fire truck |  |
| 206 | `pw_heart.m4a` | heart |  |
| 207 | `pw_carrot.m4a` | carrot |  |
| 208 | `pw_pumpkin.m4a` | pumpkin |  |
| 209 | `pw_basketball.m4a` | basketball |  |
| 210 | `pw_fox.m4a` | fox |  |
| 211 | `pw_banana.m4a` | banana |  |
| 212 | `pw_lemon.m4a` | lemon |  |
| 213 | `pw_chick.m4a` | chick |  |
| 214 | `pw_sunflower.m4a` | sunflower |  |
| 215 | `pw_broccoli.m4a` | broccoli |  |
| 216 | `pw_clover.m4a` | clover |  |
| 217 | `pw_cucumber.m4a` | cucumber |  |
| 218 | `pw_green_apple.m4a` | green apple |  |
| 219 | `pw_cactus.m4a` | cactus |  |
| 220 | `pw_turtle.m4a` | turtle |  |
| 221 | `pw_blueberries.m4a` | blueberries |  |
| 222 | `pw_whale.m4a` | whale |  |
| 223 | `pw_water_drop.m4a` | water drop |  |
| 224 | `pw_jeans.m4a` | jeans |  |
| 225 | `pw_cap.m4a` | cap |  |
| 226 | `pw_eggplant.m4a` | eggplant |  |
| 227 | `pw_pig.m4a` | pig |  |
| 228 | `pw_cherry_blossom.m4a` | cherry blossom |  |
| 229 | `pw_flamingo.m4a` | flamingo |  |
| 230 | `pw_bear.m4a` | bear |  |
| 231 | `pw_cookie.m4a` | cookie |  |
| 232 | `pw_potato.m4a` | potato |  |
| 233 | `pw_chestnut.m4a` | chestnut |  |
| 234 | `pw_bee.m4a` | bee |  |
| 235 | `pw_bell.m4a` | bell |  |
| 236 | `pw_book.m4a` | book |  |
| 237 | `pw_balloon.m4a` | balloon |  |
| 238 | `pw_dolphin.m4a` | dolphin |  |
| 239 | `pw_dinosaur.m4a` | dinosaur |  |
| 240 | `pw_door.m4a` | door |  |
| 241 | `pw_deer.m4a` | deer |  |
| 242 | `pw_monkey.m4a` | monkey |  |
| 243 | `pw_mouse.m4a` | mouse |  |
| 244 | `pw_milk.m4a` | milk |  |
| 245 | `pw_mushroom.m4a` | mushroom |  |
| 246 | `pw_magnet.m4a` | magnet |  |
| 247 | `pw_map.m4a` | map |  |
| 248 | `pw_pizza.m4a` | pizza |  |
| 249 | `pw_pear.m4a` | pear |  |
| 250 | `pw_penguin.m4a` | penguin |  |
| 251 | `pw_popcorn.m4a` | popcorn |  |
| 252 | `pw_panda.m4a` | panda |  |
| 253 | `pw_pineapple.m4a` | pineapple |  |
| 254 | `pw_pencil.m4a` | pencil |  |
| 255 | `pw_sock.m4a` | sock |  |
| 256 | `pw_sandwich.m4a` | sandwich |  |
| 257 | `pw_soap.m4a` | soap |  |
| 258 | `pw_seal.m4a` | seal |  |
| 259 | `pw_salad.m4a` | salad |  |
| 260 | `pw_tiger.m4a` | tiger |  |
| 261 | `pw_tent.m4a` | tent |  |
| 262 | `pw_taco.m4a` | taco |  |
| 263 | `pw_tooth.m4a` | tooth |  |
| 264 | `pw_foot.m4a` | foot |  |
| 265 | `pw_goat.m4a` | goat |  |
| 266 | `pw_guitar.m4a` | guitar |  |
| 267 | `pw_ghost.m4a` | ghost |  |
| 268 | `pw_hippo.m4a` | hippo |  |
| 269 | `pw_helicopter.m4a` | helicopter |  |
| 270 | `pw_hammer.m4a` | hammer |  |
| 271 | `pw_kite.m4a` | kite |  |
| 272 | `pw_key.m4a` | key |  |
| 273 | `pw_kangaroo.m4a` | kangaroo |  |
| 274 | `pw_koala.m4a` | koala |  |
| 275 | `pw_lion.m4a` | lion |  |
| 276 | `pw_leaf.m4a` | leaf |  |
| 277 | `pw_lollipop.m4a` | lollipop |  |
| 278 | `pw_lock.m4a` | lock |  |
| 279 | `pw_ladybug.m4a` | ladybug |  |
| 280 | `pw_lizard.m4a` | lizard |  |
| 281 | `pw_rainbow.m4a` | rainbow |  |
| 282 | `pw_rocket.m4a` | rocket |  |
| 283 | `pw_robot.m4a` | robot |  |
| 284 | `pw_watermelon.m4a` | watermelon |  |
| 285 | `pw_worm.m4a` | worm |  |
| 286 | `pw_window.m4a` | window |  |
| 287 | `pw_bat.m4a` | bat |  |
| 288 | `pw_cake.m4a` | cake |  |
| 289 | `pw_snowflake.m4a` | snowflake |  |
| 290 | `pw_raccoon.m4a` | raccoon |  |
| 291 | `pw_coat.m4a` | coat |  |
| 292 | `pw_clock.m4a` | clock |  |
| 293 | `pw_sled.m4a` | sled |  |
| 294 | `pw_pie.m4a` | pie |  |
| 295 | `pw_tie.m4a` | tie |  |
| 296 | `pw_eye.m4a` | eye |  |
| 297 | `pw_train.m4a` | train |  |
| 298 | `pw_rain.m4a` | rain |  |
| 299 | `pw_chain.m4a` | chain |  |
| 300 | `pw_nose.m4a` | nose |  |
| 301 | `pw_rose.m4a` | rose |  |
| 302 | `pw_shell.m4a` | shell |  |
| 303 | `skill_cvc.m4a` | Short vowel words! Cat, dog, sun. Say each sound, then read the word. |  |
| 304 | `skill_digraph.m4a` | Two letters, one sound! S H says shh, C H says ch, and T H says th. |  |
| 305 | `skill_sight2.m4a` | More sight words! Read them fast, like a big kid. |  |
| 306 | `skill_opposites.m4a` | Opposites! Hot and cold. Big and small. Up and down. |  |
| 307 | `skill_nounverb.m4a` | Action words! An action word is something you can do, like run or jump. |  |
| 308 | `rule_cvc_word.m4a` | Munch the word | + word: "Munch the word" + "cat" (the picture is on screen) |
| 309 | `rule_cvc_pic.m4a` | Read the word. Then munch its picture! |  |
| 310 | `q_cvc_word.m4a` | Which word goes with the picture? |  |
| 311 | `q_cvc_pic.m4a` | Read the word. Which picture is it? |  |
| 312 | `rule_dig_sh.m4a` | Munch the things that start like ship and shoe! |  |
| 313 | `rule_dig_ch.m4a` | Munch the things that start like chair and cheese! |  |
| 314 | `rule_dig_th.m4a` | Munch the things that start like thumb and three! |  |
| 315 | `rule_digw_sh.m4a` | Munch the words that start like ship! |  |
| 316 | `rule_digw_ch.m4a` | Munch the words that start like chair! |  |
| 317 | `rule_digw_th.m4a` | Munch the words that start like thumb! |  |
| 318 | `q_dig_sh.m4a` | Which one starts like ship? |  |
| 319 | `q_dig_ch.m4a` | Which one starts like chair? |  |
| 320 | `q_dig_th.m4a` | Which one starts like thumb? |  |
| 321 | `w_starts_like.m4a` | starts like | "ship" + "starts like" + "shoe" |
| 322 | `w_not_like.m4a` | does not start like | "sun" + "does not start like" + "ship" |
| 323 | `rule_opposite.m4a` | Munch the opposite of | + word |
| 324 | `q_opposite.m4a` | What is the opposite of | + word |
| 325 | `w_opposite_of.m4a` | is the opposite of | "cold" + "is the opposite of" + "hot" |
| 326 | `w_not_opposite.m4a` | is not the opposite of | "sad" + "is not the opposite of" + "hot" |
| 327 | `rule_verbs.m4a` | Munch the action words! Things you can do. |  |
| 328 | `rule_nouns.m4a` | Munch the naming words! People, animals and things. |  |
| 329 | `q_verb.m4a` | Which one is an action word? |  |
| 330 | `q_noun.m4a` | Which one is a naming word? |  |
| 331 | `w_is_action.m4a` | is an action word | "jump" + "is an action word" |
| 332 | `w_is_naming.m4a` | is a naming word | "cat" + "is a naming word" |
| 333 | `c_cat.m4a` | cat |  |
| 334 | `c_hat.m4a` | hat |  |
| 335 | `pw_van.m4a` | van |  |
| 336 | `pw_can.m4a` | can |  |
| 337 | `c_bed.m4a` | bed |  |
| 338 | `pw_pen.m4a` | pen |  |
| 339 | `c_ten.m4a` | ten |  |
| 340 | `pw_leg.m4a` | leg |  |
| 341 | `pw_pin.m4a` | pin |  |
| 342 | `c_six.m4a` | six |  |
| 343 | `c_dog.m4a` | dog |  |
| 344 | `c_box.m4a` | box |  |
| 345 | `pw_log.m4a` | log |  |
| 346 | `c_sun.m4a` | sun |  |
| 347 | `c_bus.m4a` | bus |  |
| 348 | `pw_bug.m4a` | bug |  |
| 349 | `c_cup.m4a` | cup |  |
| 350 | `pw_cot.m4a` | cot |  |
| 351 | `pw_cut.m4a` | cut |  |
| 352 | `pw_bit.m4a` | bit |  |
| 353 | `pw_but.m4a` | but |  |
| 354 | `pw_bag.m4a` | bag |  |
| 355 | `c_hot.m4a` | hot |  |
| 356 | `pw_hit.m4a` | hit |  |
| 357 | `pw_ham.m4a` | ham |  |
| 358 | `pw_mop.m4a` | mop |  |
| 359 | `pw_mat.m4a` | mat |  |
| 360 | `pw_man.m4a` | man |  |
| 361 | `pw_vet.m4a` | vet |  |
| 362 | `pw_fan.m4a` | fan |  |
| 363 | `pw_ran.m4a` | ran |  |
| 364 | `pw_bad.m4a` | bad |  |
| 365 | `pw_bid.m4a` | bid |  |
| 366 | `c_red.m4a` | red |  |
| 367 | `pw_pan.m4a` | pan |  |
| 368 | `pw_tan.m4a` | tan |  |
| 369 | `pw_tin.m4a` | tin |  |
| 370 | `pw_lag.m4a` | lag |  |
| 371 | `pw_beg.m4a` | beg |  |
| 372 | `pw_peg.m4a` | peg |  |
| 373 | `pw_big.m4a` | big |  |
| 374 | `pw_dig.m4a` | dig |  |
| 375 | `pw_pit.m4a` | pit |  |
| 376 | `pw_sit.m4a` | sit |  |
| 377 | `pw_fix.m4a` | fix |  |
| 378 | `pw_fog.m4a` | fog |  |
| 379 | `pw_dug.m4a` | dug |  |
| 380 | `pw_sum.m4a` | sum |  |
| 381 | `pw_bun.m4a` | bun |  |
| 382 | `pw_rug.m4a` | rug |  |
| 383 | `pw_pup.m4a` | pup |  |
| 384 | `pw_mud.m4a` | mud |  |
| 385 | `pw_hop.m4a` | hop |  |
| 386 | `pw_ship.m4a` | ship |  |
| 387 | `c_shoe.m4a` | shoe |  |
| 388 | `c_sheep.m4a` | sheep |  |
| 389 | `pw_shark.m4a` | shark |  |
| 390 | `pw_shirt.m4a` | shirt |  |
| 391 | `pw_shop.m4a` | shop |  |
| 392 | `pw_shed.m4a` | shed |  |
| 393 | `pw_shin.m4a` | shin |  |
| 394 | `pw_shut.m4a` | shut |  |
| 395 | `c_chair.m4a` | chair |  |
| 396 | `c_cheese.m4a` | cheese |  |
| 397 | `pw_chocolate.m4a` | chocolate |  |
| 398 | `pw_chip.m4a` | chip |  |
| 399 | `pw_chin.m4a` | chin |  |
| 400 | `pw_chop.m4a` | chop |  |
| 401 | `pw_chat.m4a` | chat |  |
| 402 | `pw_chest.m4a` | chest |  |
| 403 | `pw_thumb.m4a` | thumb |  |
| 404 | `c_three.m4a` | three |  |
| 405 | `pw_thread.m4a` | thread |  |
| 406 | `pw_thermometer.m4a` | thermometer |  |
| 407 | `pw_thin.m4a` | thin |  |
| 408 | `pw_thick.m4a` | thick |  |
| 409 | `pw_this.m4a` | this |  |
| 410 | `pw_that.m4a` | that |  |
| 411 | `pw_them.m4a` | them |  |
| 412 | `pw_then.m4a` | then |  |
| 413 | `c_car.m4a` | car |  |
| 414 | `c_house.m4a` | house |  |
| 415 | `c_moon.m4a` | moon |  |
| 416 | `c_fish.m4a` | fish |  |
| 417 | `pw_sip.m4a` | sip |  |
| 418 | `pw_hip.m4a` | hip |  |
| 419 | `pw_cop.m4a` | cop |  |
| 420 | `pw_tip.m4a` | tip |  |
| 421 | `pw_tap.m4a` | tap |  |
| 422 | `pw_top.m4a` | top |  |
| 423 | `c_sad.m4a` | sad |  |
| 424 | `pw_tick.m4a` | tick |  |
| 425 | `pw_hen.m4a` | hen |  |
| 426 | `c_cold.m4a` | cold |  |
| 427 | `pw_day.m4a` | day |  |
| 428 | `c_night.m4a` | night |  |
| 429 | `pw_up.m4a` | up |  |
| 430 | `c_down.m4a` | down |  |
| 431 | `pw_happy.m4a` | happy |  |
| 432 | `c_fast.m4a` | fast |  |
| 433 | `c_slow.m4a` | slow |  |
| 434 | `c_small.m4a` | small |  |
| 435 | `pw_open.m4a` | open |  |
| 436 | `c_closed.m4a` | closed |  |
| 437 | `pw_stop.m4a` | stop |  |
| 438 | `pw_go.m4a` | go |  |
| 439 | `c_loud.m4a` | loud |  |
| 440 | `c_quiet.m4a` | quiet |  |
| 441 | `pw_yes.m4a` | yes |  |
| 442 | `pw_no.m4a` | no |  |
| 443 | `pw_old.m4a` | old |  |
| 444 | `pw_new.m4a` | new |  |
| 445 | `pw_in.m4a` | in |  |
| 446 | `pw_out.m4a` | out |  |
| 447 | `pw_on.m4a` | on |  |
| 448 | `pw_off.m4a` | off |  |
| 449 | `pw_bottom.m4a` | bottom |  |
| 450 | `c_left.m4a` | left |  |
| 451 | `c_right.m4a` | right |  |
| 452 | `pw_push.m4a` | push |  |
| 453 | `pw_pull.m4a` | pull |  |
| 454 | `pw_wet.m4a` | wet |  |
| 455 | `c_dry.m4a` | dry |  |
| 456 | `pw_full.m4a` | full |  |
| 457 | `pw_empty.m4a` | empty |  |
| 458 | `pw_long.m4a` | long |  |
| 459 | `pw_short.m4a` | short |  |
| 460 | `pw_hard.m4a` | hard |  |
| 461 | `pw_soft.m4a` | soft |  |
| 462 | `pw_first.m4a` | first |  |
| 463 | `pw_last.m4a` | last |  |
| 464 | `pw_give.m4a` | give |  |
| 465 | `pw_take.m4a` | take |  |
| 466 | `pw_run.m4a` | run |  |
| 467 | `pw_swim.m4a` | swim |  |
| 468 | `pw_sing.m4a` | sing |  |
| 469 | `pw_eat.m4a` | eat |  |
| 470 | `pw_sleep.m4a` | sleep |  |
| 471 | `pw_clap.m4a` | clap |  |
| 472 | `pw_jump.m4a` | jump |  |
| 473 | `pw_write.m4a` | write |  |
| 474 | `pw_read.m4a` | read |  |
| 475 | `c_ball.m4a` | ball |  |
| 476 | `c_apple.m4a` | apple |  |
| 477 | `c_tree.m4a` | tree |  |
| 478 | `c_duck.m4a` | duck |  |
| 479 | `pw_kiss.m4a` | kiss |  |
| 480 | `pw_walk.m4a` | walk |  |
| 481 | `pw_cry.m4a` | cry |  |
| 482 | `pw_laugh.m4a` | laugh |  |
| 483 | `pw_throw.m4a` | throw |  |
| 484 | `pw_catch.m4a` | catch |  |
| 485 | `pw_climb.m4a` | climb |  |
| 486 | `pw_bake.m4a` | bake |  |
| 487 | `pw_egg.m4a` | egg |  |
| 488 | `pw_rock.m4a` | rock |  |
| 489 | `c_frog.m4a` | frog |  |
| 490 | `word_after.m4a` | after | Dolch first-grade sight word |
| 491 | `word_again.m4a` | again | Dolch first-grade sight word |
| 492 | `word_an.m4a` | an | Dolch first-grade sight word |
| 493 | `word_any.m4a` | any | Dolch first-grade sight word |
| 494 | `word_as.m4a` | as | Dolch first-grade sight word |
| 495 | `word_ask.m4a` | ask | Dolch first-grade sight word |
| 496 | `word_by.m4a` | by | Dolch first-grade sight word |
| 497 | `word_could.m4a` | could | Dolch first-grade sight word |
| 498 | `word_every.m4a` | every | Dolch first-grade sight word |
| 499 | `word_fly.m4a` | fly | Dolch first-grade sight word |
| 500 | `word_from.m4a` | from | Dolch first-grade sight word |
| 501 | `word_give.m4a` | give | Dolch first-grade sight word |
| 502 | `word_going.m4a` | going | Dolch first-grade sight word |
| 503 | `word_had.m4a` | had | Dolch first-grade sight word |
| 504 | `word_has.m4a` | has | Dolch first-grade sight word |
| 505 | `word_her.m4a` | her | Dolch first-grade sight word |
| 506 | `word_him.m4a` | him | Dolch first-grade sight word |
| 507 | `word_his.m4a` | his | Dolch first-grade sight word |
| 508 | `word_how.m4a` | how | Dolch first-grade sight word |
| 509 | `word_just.m4a` | just | Dolch first-grade sight word |
| 510 | `word_know.m4a` | know | Dolch first-grade sight word |
| 511 | `word_let.m4a` | let | Dolch first-grade sight word |
| 512 | `word_live.m4a` | live | Dolch first-grade sight word |
| 513 | `word_may.m4a` | may | Dolch first-grade sight word |
| 514 | `word_of.m4a` | of | Dolch first-grade sight word |
| 515 | `word_old.m4a` | old | Dolch first-grade sight word |
| 516 | `word_once.m4a` | once | Dolch first-grade sight word |
| 517 | `word_open.m4a` | open | Dolch first-grade sight word |
| 518 | `word_over.m4a` | over | Dolch first-grade sight word |
| 519 | `word_put.m4a` | put | Dolch first-grade sight word |
| 520 | `word_round.m4a` | round | Dolch first-grade sight word |
| 521 | `word_some.m4a` | some | Dolch first-grade sight word |
| 522 | `word_stop.m4a` | stop | Dolch first-grade sight word |
| 523 | `word_take.m4a` | take | Dolch first-grade sight word |
| 524 | `word_thank.m4a` | thank | Dolch first-grade sight word |
| 525 | `word_them.m4a` | them | Dolch first-grade sight word |
| 526 | `word_then.m4a` | then | Dolch first-grade sight word |
| 527 | `word_think.m4a` | think | Dolch first-grade sight word |
| 528 | `word_walk.m4a` | walk | Dolch first-grade sight word |
| 529 | `word_were.m4a` | were | Dolch first-grade sight word |
| 530 | `word_when.m4a` | when | Dolch first-grade sight word |
| 531 | `skill_longvowel.m4a` | Long vowels! A silent e at the end makes the vowel say its name: cap, cape. Two vowels can team up too: rain, tree, boat. |  |
| 532 | `skill_sight3.m4a` | Big kid sight words! Second and third grade words. |  |
| 533 | `skill_homophones.m4a` | Homophones! Words that sound the same but are spelled differently, like to, two and too. |  |
| 534 | `skill_affixes.m4a` | Word parts! Un means not. Re means again. Ful means full of. Less means without. |  |
| 535 | `skill_comprehension.m4a` | Reading stories! Read the story, then answer the question. |  |
| 536 | `rule_find_word.m4a` | Munch the word | + word (the choices are never read aloud) |
| 537 | `q_which_word.m4a` | Which word is | + word |
| 538 | `rule_homophone.m4a` | Munch the word that fits the sentence! |  |
| 539 | `rule_comprehension.m4a` | Read the story. Munch the answer! |  |
| 540 | `hom_0.m4a` | I have two dogs. | homophone sentence (sounds the same whichever word fits) |
| 541 | `hom_1.m4a` | We walk to school. | homophone sentence (sounds the same whichever word fits) |
| 542 | `hom_2.m4a` | Can I come too? | homophone sentence (sounds the same whichever word fits) |
| 543 | `hom_3.m4a` | The cat is over there. | homophone sentence (sounds the same whichever word fits) |
| 544 | `hom_4.m4a` | They lost their ball. | homophone sentence (sounds the same whichever word fits) |
| 545 | `hom_5.m4a` | I think they're late. | homophone sentence (sounds the same whichever word fits) |
| 546 | `hom_6.m4a` | Fish swim in the sea. | homophone sentence (sounds the same whichever word fits) |
| 547 | `hom_7.m4a` | I can see the moon. | homophone sentence (sounds the same whichever word fits) |
| 548 | `hom_8.m4a` | She ate a big apple. | homophone sentence (sounds the same whichever word fits) |
| 549 | `hom_9.m4a` | A spider has eight legs. | homophone sentence (sounds the same whichever word fits) |
| 550 | `hom_10.m4a` | Can you write your name? | homophone sentence (sounds the same whichever word fits) |
| 551 | `hom_11.m4a` | Turn right at the tree. | homophone sentence (sounds the same whichever word fits) |
| 552 | `hom_12.m4a` | The wind blew hard. | homophone sentence (sounds the same whichever word fits) |
| 553 | `hom_13.m4a` | The sky is blue. | homophone sentence (sounds the same whichever word fits) |
| 554 | `hom_14.m4a` | Our team won the game. | homophone sentence (sounds the same whichever word fits) |
| 555 | `hom_15.m4a` | I have one nose. | homophone sentence (sounds the same whichever word fits) |
| 556 | `hom_16.m4a` | This gift is for you. | homophone sentence (sounds the same whichever word fits) |
| 557 | `hom_17.m4a` | A dog has four legs. | homophone sentence (sounds the same whichever word fits) |
| 558 | `hom_18.m4a` | Dad will buy some milk. | homophone sentence (sounds the same whichever word fits) |
| 559 | `hom_19.m4a` | Come here and sit. | homophone sentence (sounds the same whichever word fits) |
| 560 | `hom_20.m4a` | I can hear the bird sing. | homophone sentence (sounds the same whichever word fits) |
| 561 | `hom_21.m4a` | I know the answer. | homophone sentence (sounds the same whichever word fits) |
| 562 | `hom_22.m4a` | Nice to meet you. | homophone sentence (sounds the same whichever word fits) |
| 563 | `hom_23.m4a` | We had meat for dinner. | homophone sentence (sounds the same whichever word fits) |
| 564 | `hom_24.m4a` | Wave and say bye to Grandma. | homophone sentence (sounds the same whichever word fits) |
| 565 | `hom_25.m4a` | The bus went by my house. | homophone sentence (sounds the same whichever word fits) |
| 566 | `hom_26.m4a` | I said no, thank you. | homophone sentence (sounds the same whichever word fits) |
| 567 | `hom_27.m4a` | The sun is hot today. | homophone sentence (sounds the same whichever word fits) |
| 568 | `hom_28.m4a` | Mom and her son went to the park. | homophone sentence (sounds the same whichever word fits) |
| 569 | `aff_unhappy.m4a` | Which word means not happy? |  |
| 570 | `aff_unkind.m4a` | Which word means not kind? |  |
| 571 | `aff_unfair.m4a` | Which word means not fair? |  |
| 572 | `aff_unlock.m4a` | Which word means to open a lock? |  |
| 573 | `aff_unsafe.m4a` | Which word means not safe? |  |
| 574 | `aff_redo.m4a` | Which word means do again? |  |
| 575 | `aff_reread.m4a` | Which word means read again? |  |
| 576 | `aff_refill.m4a` | Which word means fill again? |  |
| 577 | `aff_replay.m4a` | Which word means play again? |  |
| 578 | `aff_rebuild.m4a` | Which word means build again? |  |
| 579 | `aff_helpful.m4a` | Which word means full of help? |  |
| 580 | `aff_helpless.m4a` | Which word means without help? |  |
| 581 | `aff_careful.m4a` | Which word means full of care? |  |
| 582 | `aff_careless.m4a` | Which word means without care? |  |
| 583 | `aff_joyful.m4a` | Which word means full of joy? |  |
| 584 | `aff_colorful.m4a` | Which word means full of color? |  |
| 585 | `aff_fearless.m4a` | Which word means without fear? |  |
| 586 | `aff_endless.m4a` | Which word means without an end? |  |
| 587 | `aff_painless.m4a` | Which word means without pain? |  |
| 588 | `aff_playful.m4a` | Which word means full of play? |  |
| 589 | `rc_0_0.m4a` | Jammy has a red kite and a blue ball. Jammy flies the kite at the beach. What color is the kite? | reading passage + question (answers are not read aloud) |
| 590 | `rcq_0_0.m4a` | What color is the kite? | story question only (when "Read stories aloud" is off) |
| 591 | `rc_0_1.m4a` | Peel has a little dog and a big cat. The dog likes to dig. The cat likes to nap. What does the dog like to do? | reading passage + question (answers are not read aloud) |
| 592 | `rcq_0_1.m4a` | What does the dog like to do? | story question only (when "Read stories aloud" is off) |
| 593 | `rc_0_2.m4a` | Crunch ate a green grape. Then he gave a red grape to Bloop. Who got the red grape? | reading passage + question (answers are not read aloud) |
| 594 | `rcq_0_2.m4a` | Who got the red grape? | story question only (when "Read stories aloud" is off) |
| 595 | `rc_0_3.m4a` | Bloop was sad and tired. Then she got a new puppy! She smiled and hugged it. How did Bloop feel at the end? | reading passage + question (answers are not read aloud) |
| 596 | `rcq_0_3.m4a` | How did Bloop feel at the end? | story question only (when "Read stories aloud" is off) |
| 597 | `rc_0_4.m4a` | Dora was sleepy, but Crunch was not. His kite got stuck in a tall tree. He frowned and kicked a rock. How did Crunch feel? | reading passage + question (answers are not read aloud) |
| 598 | `rcq_0_4.m4a` | How did Crunch feel? | story question only (when "Read stories aloud" is off) |
| 599 | `rc_0_5.m4a` | Gray clouds filled the sky. Niblet put on his boots and took his umbrella. What will happen next? | reading passage + question (answers are not read aloud) |
| 600 | `rcq_0_5.m4a` | What will happen next? | story question only (when "Read stories aloud" is off) |
| 601 | `rc_0_6.m4a` | The cat hid under the bed when it heard the loud thunder. Why did the cat hide? | reading passage + question (answers are not read aloud) |
| 602 | `rcq_0_6.m4a` | Why did the cat hide? | story question only (when "Read stories aloud" is off) |
| 603 | `rc_0_7.m4a` | Dora and Jammy baked a cake for the picnic. They put on pink frosting. What did they bake? | reading passage + question (answers are not read aloud) |
| 604 | `rcq_0_7.m4a` | What did they bake? | story question only (when "Read stories aloud" is off) |
| 605 | `rc_1_0.m4a` | The wind was strong, so Bloop held her hat with both hands. She walked home slowly. Why did Bloop hold her hat? | reading passage + question (answers are not read aloud) |
| 606 | `rcq_1_0.m4a` | Why did Bloop hold her hat? | story question only (when "Read stories aloud" is off) |
| 607 | `rc_1_1.m4a` | Petey found a shiny shell on the sand. He put it in his pocket to show his friends. Where did Petey put the shell? | reading passage + question (answers are not read aloud) |
| 608 | `rcq_1_1.m4a` | Where did Petey put the shell? | story question only (when "Read stories aloud" is off) |
| 609 | `rc_1_2.m4a` | After school, Peel fed the fish. Then she did her homework at the kitchen table. What did Peel do first? | reading passage + question (answers are not read aloud) |
| 610 | `rcq_1_2.m4a` | What did Peel do first? | story question only (when "Read stories aloud" is off) |
| 611 | `rc_1_3.m4a` | Crunch was nervous and a little sleepy before the show. He sang his song, and everyone clapped and cheered. How did Crunch feel after the show? | reading passage + question (answers are not read aloud) |
| 612 | `rcq_1_3.m4a` | How did Crunch feel after the show? | story question only (when "Read stories aloud" is off) |
| 613 | `rc_1_4.m4a` | Bloop packed a towel, sunscreen and a shovel. She did not pack her school bag. Then she ran to the car. Where is Bloop probably going? | reading passage + question (answers are not read aloud) |
| 614 | `rcq_1_4.m4a` | Where is Bloop probably going? | story question only (when "Read stories aloud" is off) |
| 615 | `rc_1_5.m4a` | First Crisp mixed the flour. Next he cracked two eggs. Last he put the pan in the oven. What did Crisp do after mixing the flour? | reading passage + question (answers are not read aloud) |
| 616 | `rcq_1_5.m4a` | What did Crisp do after mixing the flour? | story question only (when "Read stories aloud" is off) |
| 617 | `rc_1_6.m4a` | Dora's plant was brown and dry. She gave it water every day. Soon it had green leaves. Why did the plant get green leaves? | reading passage + question (answers are not read aloud) |
| 618 | `rcq_1_6.m4a` | Why did the plant get green leaves? | story question only (when "Read stories aloud" is off) |
| 619 | `rc_1_7.m4a` | Jammy heard a knock at the door. Jammy opened it and saw Grandma holding a big gift with a bow. “This is for you!” said Grandma. What will Jammy do next? | reading passage + question (answers are not read aloud) |
| 620 | `rcq_1_7.m4a` | What will Jammy do next? | story question only (when "Read stories aloud" is off) |
| 621 | `rc_1_8.m4a` | The class went to the zoo. A lion was sleeping on a rock, but the monkeys were swinging and playing. Who was sleeping on the rock? | reading passage + question (answers are not read aloud) |
| 622 | `rcq_1_8.m4a` | Who was sleeping on the rock? | story question only (when "Read stories aloud" is off) |
| 623 | `pw_cape.m4a` | cape |  |
| 624 | `pw_cope.m4a` | cope |  |
| 625 | `pw_tape.m4a` | tape |  |
| 626 | `pw_type.m4a` | type |  |
| 627 | `pw_made.m4a` | made |  |
| 628 | `pw_mad.m4a` | mad |  |
| 629 | `pw_make.m4a` | make |  |
| 630 | `pw_cane.m4a` | cane |  |
| 631 | `pw_cone.m4a` | cone |  |
| 632 | `pw_hope.m4a` | hope |  |
| 633 | `pw_hose.m4a` | hose |  |
| 634 | `pw_home.m4a` | home |  |
| 635 | `pw_note.m4a` | note |  |
| 636 | `pw_not.m4a` | not |  |
| 637 | `pw_net.m4a` | net |  |
| 638 | `pw_robe.m4a` | robe |  |
| 639 | `pw_rob.m4a` | rob |  |
| 640 | `pw_rope.m4a` | rope |  |
| 641 | `pw_ride.m4a` | ride |  |
| 642 | `pw_cube.m4a` | cube |  |
| 643 | `pw_cub.m4a` | cub |  |
| 644 | `pw_cute.m4a` | cute |  |
| 645 | `pw_tube.m4a` | tube |  |
| 646 | `pw_tub.m4a` | tub |  |
| 647 | `pw_tune.m4a` | tune |  |
| 648 | `pw_kit.m4a` | kit |  |
| 649 | `pw_bite.m4a` | bite |  |
| 650 | `pw_kick.m4a` | kick |  |
| 651 | `pw_pine.m4a` | pine |  |
| 652 | `pw_pane.m4a` | pane |  |
| 653 | `pw_line.m4a` | line |  |
| 654 | `pw_rid.m4a` | rid |  |
| 655 | `pw_rode.m4a` | rode |  |
| 656 | `pw_hide.m4a` | hide |  |
| 657 | `pw_hid.m4a` | hid |  |
| 658 | `pw_side.m4a` | side |  |
| 659 | `pw_fine.m4a` | fine |  |
| 660 | `pw_fin.m4a` | fin |  |
| 661 | `c_five.m4a` | five |  |
| 662 | `pw_bike.m4a` | bike |  |
| 663 | `pw_like.m4a` | like |  |
| 664 | `pw_plane.m4a` | plane |  |
| 665 | `pw_plan.m4a` | plan |  |
| 666 | `pw_plate.m4a` | plate |  |
| 667 | `pw_planet.m4a` | planet |  |
| 668 | `pw_slide.m4a` | slide |  |
| 669 | `pw_slid.m4a` | slid |  |
| 670 | `pw_smile.m4a` | smile |  |
| 671 | `pw_hum.m4a` | hum |  |
| 672 | `pw_hole.m4a` | hole |  |
| 673 | `pw_bone.m4a` | bone |  |
| 674 | `pw_bore.m4a` | bore |  |
| 675 | `pw_rail.m4a` | rail |  |
| 676 | `pw_main.m4a` | main |  |
| 677 | `pw_paint.m4a` | paint |  |
| 678 | `pw_pant.m4a` | pant |  |
| 679 | `pw_print.m4a` | print |  |
| 680 | `pw_pain.m4a` | pain |  |
| 681 | `pw_trail.m4a` | trail |  |
| 682 | `pw_tray.m4a` | tray |  |
| 683 | `pw_wait.m4a` | wait |  |
| 684 | `pw_wit.m4a` | wit |  |
| 685 | `pw_what.m4a` | what |  |
| 686 | `pw_free.m4a` | free |  |
| 687 | `pw_try.m4a` | try |  |
| 688 | `pw_feet.m4a` | feet |  |
| 689 | `pw_fat.m4a` | fat |  |
| 690 | `pw_fit.m4a` | fit |  |
| 691 | `pw_feel.m4a` | feel |  |
| 692 | `c_green.m4a` | green |  |
| 693 | `pw_grin.m4a` | grin |  |
| 694 | `pw_grain.m4a` | grain |  |
| 695 | `pw_greet.m4a` | greet |  |
| 696 | `pw_slip.m4a` | slip |  |
| 697 | `pw_slap.m4a` | slap |  |
| 698 | `c_boat.m4a` | boat |  |
| 699 | `pw_beat.m4a` | beat |  |
| 700 | `pw_bolt.m4a` | bolt |  |
| 701 | `pw_cost.m4a` | cost |  |
| 702 | `c_soup.m4a` | soup |  |
| 703 | `pw_snap.m4a` | snap |  |
| 704 | `pw_step.m4a` | step |  |
| 705 | `pw_got.m4a` | got |  |
| 706 | `pw_gate.m4a` | gate |  |
| 707 | `pw_goal.m4a` | goal |  |
| 708 | `pw_seat.m4a` | seat |  |
| 709 | `pw_set.m4a` | set |  |
| 710 | `pw_sat.m4a` | sat |  |
| 711 | `pw_sent.m4a` | sent |  |
| 712 | `pw_team.m4a` | team |  |
| 713 | `pw_tame.m4a` | tame |  |
| 714 | `pw_tea.m4a` | tea |  |
| 715 | `pw_beach.m4a` | beach |  |
| 716 | `pw_bench.m4a` | bench |  |
| 717 | `pw_each.m4a` | each |  |
| 718 | `pw_loaf.m4a` | loaf |  |
| 719 | `pw_lean.m4a` | lean |  |
| 720 | `pw_deaf.m4a` | deaf |  |
| 721 | `pw_float.m4a` | float |  |
| 722 | `pw_flat.m4a` | flat |  |
| 723 | `pw_flute.m4a` | flute |  |
| 724 | `pw_street.m4a` | street |  |
| 725 | `pw_stretch.m4a` | stretch |  |
| 726 | `pw_strut.m4a` | strut |  |
| 727 | `pw_sweet.m4a` | sweet |  |
| 728 | `word_always.m4a` | always | Dolch 2nd / 3rd grade sight word |
| 729 | `word_around.m4a` | around | Dolch 2nd / 3rd grade sight word |
| 730 | `word_because.m4a` | because | Dolch 2nd / 3rd grade sight word |
| 731 | `word_been.m4a` | been | Dolch 2nd / 3rd grade sight word |
| 732 | `word_before.m4a` | before | Dolch 2nd / 3rd grade sight word |
| 733 | `word_best.m4a` | best | Dolch 2nd / 3rd grade sight word |
| 734 | `word_both.m4a` | both | Dolch 2nd / 3rd grade sight word |
| 735 | `word_buy.m4a` | buy | Dolch 2nd / 3rd grade sight word |
| 736 | `word_call.m4a` | call | Dolch 2nd / 3rd grade sight word |
| 737 | `word_cold.m4a` | cold | Dolch 2nd / 3rd grade sight word |
| 738 | `word_does.m4a` | does | Dolch 2nd / 3rd grade sight word |
| 739 | `word_dont.m4a` | don't | Dolch 2nd / 3rd grade sight word |
| 740 | `word_fast.m4a` | fast | Dolch 2nd / 3rd grade sight word |
| 741 | `word_first.m4a` | first | Dolch 2nd / 3rd grade sight word |
| 742 | `word_five.m4a` | five | Dolch 2nd / 3rd grade sight word |
| 743 | `word_found.m4a` | found | Dolch 2nd / 3rd grade sight word |
| 744 | `word_gave.m4a` | gave | Dolch 2nd / 3rd grade sight word |
| 745 | `word_goes.m4a` | goes | Dolch 2nd / 3rd grade sight word |
| 746 | `word_green.m4a` | green | Dolch 2nd / 3rd grade sight word |
| 747 | `word_its.m4a` | its | Dolch 2nd / 3rd grade sight word |
| 748 | `word_made.m4a` | made | Dolch 2nd / 3rd grade sight word |
| 749 | `word_many.m4a` | many | Dolch 2nd / 3rd grade sight word |
| 750 | `word_off.m4a` | off | Dolch 2nd / 3rd grade sight word |
| 751 | `word_or.m4a` | or | Dolch 2nd / 3rd grade sight word |
| 752 | `word_pull.m4a` | pull | Dolch 2nd / 3rd grade sight word |
| 753 | `word_read.m4a` | read | Dolch 2nd / 3rd grade sight word |
| 754 | `word_right.m4a` | right | Dolch 2nd / 3rd grade sight word |
| 755 | `word_sing.m4a` | sing | Dolch 2nd / 3rd grade sight word |
| 756 | `word_sit.m4a` | sit | Dolch 2nd / 3rd grade sight word |
| 757 | `word_sleep.m4a` | sleep | Dolch 2nd / 3rd grade sight word |
| 758 | `word_tell.m4a` | tell | Dolch 2nd / 3rd grade sight word |
| 759 | `word_their.m4a` | their | Dolch 2nd / 3rd grade sight word |
| 760 | `word_these.m4a` | these | Dolch 2nd / 3rd grade sight word |
| 761 | `word_those.m4a` | those | Dolch 2nd / 3rd grade sight word |
| 762 | `word_upon.m4a` | upon | Dolch 2nd / 3rd grade sight word |
| 763 | `word_us.m4a` | us | Dolch 2nd / 3rd grade sight word |
| 764 | `word_use.m4a` | use | Dolch 2nd / 3rd grade sight word |
| 765 | `word_very.m4a` | very | Dolch 2nd / 3rd grade sight word |
| 766 | `word_wash.m4a` | wash | Dolch 2nd / 3rd grade sight word |
| 767 | `word_which.m4a` | which | Dolch 2nd / 3rd grade sight word |
| 768 | `word_why.m4a` | why | Dolch 2nd / 3rd grade sight word |
| 769 | `word_wish.m4a` | wish | Dolch 2nd / 3rd grade sight word |
| 770 | `word_work.m4a` | work | Dolch 2nd / 3rd grade sight word |
| 771 | `word_would.m4a` | would | Dolch 2nd / 3rd grade sight word |
| 772 | `word_write.m4a` | write | Dolch 2nd / 3rd grade sight word |
| 773 | `word_your.m4a` | your | Dolch 2nd / 3rd grade sight word |
| 774 | `word_about.m4a` | about | Dolch 2nd / 3rd grade sight word |
| 775 | `word_better.m4a` | better | Dolch 2nd / 3rd grade sight word |
| 776 | `word_bring.m4a` | bring | Dolch 2nd / 3rd grade sight word |
| 777 | `word_carry.m4a` | carry | Dolch 2nd / 3rd grade sight word |
| 778 | `word_clean.m4a` | clean | Dolch 2nd / 3rd grade sight word |
| 779 | `word_cut.m4a` | cut | Dolch 2nd / 3rd grade sight word |
| 780 | `word_done.m4a` | done | Dolch 2nd / 3rd grade sight word |
| 781 | `word_draw.m4a` | draw | Dolch 2nd / 3rd grade sight word |
| 782 | `word_drink.m4a` | drink | Dolch 2nd / 3rd grade sight word |
| 783 | `word_eight.m4a` | eight | Dolch 2nd / 3rd grade sight word |
| 784 | `word_fall.m4a` | fall | Dolch 2nd / 3rd grade sight word |
| 785 | `word_far.m4a` | far | Dolch 2nd / 3rd grade sight word |
| 786 | `word_full.m4a` | full | Dolch 2nd / 3rd grade sight word |
| 787 | `word_got.m4a` | got | Dolch 2nd / 3rd grade sight word |
| 788 | `word_grow.m4a` | grow | Dolch 2nd / 3rd grade sight word |
| 789 | `word_hold.m4a` | hold | Dolch 2nd / 3rd grade sight word |
| 790 | `word_hot.m4a` | hot | Dolch 2nd / 3rd grade sight word |
| 791 | `word_hurt.m4a` | hurt | Dolch 2nd / 3rd grade sight word |
| 792 | `word_if.m4a` | if | Dolch 2nd / 3rd grade sight word |
| 793 | `word_keep.m4a` | keep | Dolch 2nd / 3rd grade sight word |
| 794 | `word_kind.m4a` | kind | Dolch 2nd / 3rd grade sight word |
| 795 | `word_laugh.m4a` | laugh | Dolch 2nd / 3rd grade sight word |
| 796 | `word_light.m4a` | light | Dolch 2nd / 3rd grade sight word |
| 797 | `word_long.m4a` | long | Dolch 2nd / 3rd grade sight word |
| 798 | `word_much.m4a` | much | Dolch 2nd / 3rd grade sight word |
| 799 | `word_myself.m4a` | myself | Dolch 2nd / 3rd grade sight word |
| 800 | `word_never.m4a` | never | Dolch 2nd / 3rd grade sight word |
| 801 | `word_only.m4a` | only | Dolch 2nd / 3rd grade sight word |
| 802 | `word_own.m4a` | own | Dolch 2nd / 3rd grade sight word |
| 803 | `word_pick.m4a` | pick | Dolch 2nd / 3rd grade sight word |
| 804 | `word_seven.m4a` | seven | Dolch 2nd / 3rd grade sight word |
| 805 | `word_shall.m4a` | shall | Dolch 2nd / 3rd grade sight word |
| 806 | `word_show.m4a` | show | Dolch 2nd / 3rd grade sight word |
| 807 | `word_six.m4a` | six | Dolch 2nd / 3rd grade sight word |
| 808 | `word_small.m4a` | small | Dolch 2nd / 3rd grade sight word |
| 809 | `word_start.m4a` | start | Dolch 2nd / 3rd grade sight word |
| 810 | `word_ten.m4a` | ten | Dolch 2nd / 3rd grade sight word |
| 811 | `word_today.m4a` | today | Dolch 2nd / 3rd grade sight word |
| 812 | `word_together.m4a` | together | Dolch 2nd / 3rd grade sight word |
| 813 | `word_try.m4a` | try | Dolch 2nd / 3rd grade sight word |
| 814 | `word_warm.m4a` | warm | Dolch 2nd / 3rd grade sight word |

## Picnic Munch: timer, bonus questions & two players — record first (25)

Lines with "+ name" are followed by a player name, e.g. "That one is for" + "Player 2!".

| # | File name | Say this | Note |
|---:|---|---|---|
| 815 | `munch_times_up.m4a` | Time's up! Let's see how you did! |  |
| 816 | `munch_little_time.m4a` | Just a little time left! |  |
| 817 | `fb_careful.m4a` | Careful munching! Let's try that one again. |  |
| 818 | `munch_bonus_star.m4a` | Ooh, a bonus star! Walk onto it! |  |
| 819 | `bonus_title.m4a` | Bonus question! |  |
| 820 | `bonus_right.m4a` | You got it! Extra time! |  |
| 821 | `bonus_right_star.m4a` | You got it! A bonus star! |  |
| 822 | `bonus_wrong.m4a` | Good try! The answer is | + answer, e.g. "the Sun!" |
| 823 | `munch_2p_team.m4a` | Team munch! Munch your own color, and work together! |  |
| 824 | `munch_2p_race.m4a` | Munch race! Munch your own color. Ready, set, go! |  |
| 825 | `munch_not_yours.m4a` | That one is for | + name |
| 826 | `munch_all_done.m4a` | All done! Great munching! |  |
| 827 | `munch_team_win.m4a` | Teamwork! You did it together! |  |
| 828 | `munch_team_time.m4a` | Time's up! Look how much you munched together! |  |
| 829 | `munch_wins_race.m4a` | wins the race! | Said after a name: "Player 1" + "wins the race!" |
| 830 | `munch_both_great.m4a` | Great munching, both of you! |  |
| 831 | `munch_tie.m4a` | It's a tie! You both did great! |  |
| 832 | `hub_how_many.m4a` | One player, or two players? |  |
| 833 | `hub_pick_friend.m4a` | Who is playing with you? |  |
| 834 | `hub_team_or_race.m4a` | Play as a team, or have a race? |  |
| 835 | `hub_one_player.m4a` | One player! |  |
| 836 | `hub_two_players.m4a` | Two players! |  |
| 837 | `hub_team.m4a` | Team! |  |
| 838 | `hub_race.m4a` | Race! |  |
| 839 | `name_guest.m4a` | Guest! |  |

## Picnic Munch: menu, levels & high scores — record first (33)

Short, bright and friendly.

| # | File name | Say this | Note |
|---:|---|---|---|
| 840 | `menu_pick.m4a` | Story, free play, or two players? |  |
| 841 | `menu_story.m4a` | Story! |  |
| 842 | `menu_free.m4a` | Free play! |  |
| 843 | `lvl_level.m4a` | Level | + number, e.g. "Level" + "3" |
| 844 | `lvl_ready.m4a` | Get ready! |  |
| 845 | `story_stop.m4a` | Stop | + number, e.g. "Stop" + "4" |
| 846 | `story_next.m4a` | On to the next stop! |  |
| 847 | `story_area_done.m4a` | You finished this area! Off we go! |  |
| 848 | `story_one_more.m4a` | One more stop here! |  |
| 849 | `story_new_best.m4a` | A new high score! |  |
| 850 | `story_great_score.m4a` | What a great score! |  |
| 851 | `story_locked.m4a` | That stop is still locked. Keep going! |  |
| 852 | `story_pick.m4a` | Pick a stop on the map! |  |
| 853 | `story_little.m4a` | Little Steps! |  |
| 854 | `story_big.m4a` | Big Steps! |  |
| 855 | `story_helper.m4a` | Let's make this one a little easier. |  |
| 856 | `story_try_again.m4a` | Almost! Let's try this stop again. |  |
| 857 | `story_practice.m4a` | Practice round! Your journey is waiting at the star. |  |
| 858 | `story_high_scores.m4a` | High scores! |  |
| 859 | `story_new_journey.m4a` | A brand new journey! Here we go! |  |
| 860 | `hub_new_player.m4a` | Let's make a new player! What's your name? |  |
| 861 | `hub_pick_blob.m4a` | Pick your friend! |  |
| 862 | `hub_pick_color.m4a` | Pick a color! |  |
| 863 | `hub_welcome.m4a` | Welcome to the arcade! |  |
| 864 | `hub_bye.m4a` | Bye bye! See you soon! |  |
| 865 | `ch_title.m4a` | Challenge time! |  |
| 866 | `ch_intro.m4a` | Munch them all before the clock runs out, to meet a new friend! |  |
| 867 | `ch_again.m4a` | Challenge time! Can you beat your best? |  |
| 868 | `ch_fail_time.m4a` | So close! Try the challenge again to meet your new friend. |  |
| 869 | `ch_fail_acc.m4a` | Careful munching wins the challenge. Try again! |  |
| 870 | `ch_won_again.m4a` | You beat the challenge again! Super fast! |  |
| 871 | `unlock_pick.m4a` | You can be your new friend in Dress Up! |  |
| 872 | `hub_locked_blob.m4a` | That friend is still on the way. Keep learning to meet them! |  |

## Picnic Munch story: Picnic Island — later (55)

Story-book voice, warm and excited. The built-in voice already covers these.

| # | File name | Say this | Note |
|---:|---|---|---|
| 873 | `story_title.m4a` | Picnic Island! |  |
| 874 | `story_prologue.m4a` | Oh no! A big wind blew the star-snacks all over Picnic Island. Help Jammy and friends find them before the Picnic Party tonight! |  |
| 875 | `story_finale.m4a` | You found every star-snack! Jammy, Crisp, Niblet and Bloop say thank you. The Picnic Party can begin. Hooray for you! |  |
| 876 | `area_meadow.m4a` | Counting Cornfield! | Area name on the island map |
| 877 | `area_cliffs.m4a` | Compare Berry Beach! | Area name on the island map |
| 878 | `area_beach.m4a` | Add-Up Broccoli Woods! | Area name on the island map |
| 879 | `area_woods.m4a` | Take-Away Muffin Town! | Area name on the island map |
| 880 | `area_grove.m4a` | Make-Ten Pancake Peaks! | Area name on the island map |
| 881 | `area_town.m4a` | Teen Cocoa Volcano! | Area name on the island map |
| 882 | `area_caves.m4a` | Mystery Melon Bay! | Area name on the island map |
| 883 | `area_bay.m4a` | Big Sum Lolly Lighthouse! | Area name on the island map |
| 884 | `area_volcano.m4a` | Take-Away Apple Grove! | Area name on the island map |
| 885 | `area_lighthouse.m4a` | Even-Odd Cookie Caves! | Area name on the island map |
| 886 | `area_lagoon.m4a` | Letter Lemonade Lagoon! | Area name on the island map |
| 887 | `area_wordwoods.m4a` | Word Waffle Woods! | Area name on the island map |
| 888 | `area_trail_meadow.m4a` | Berry Meadow! | Area name on the island map |
| 889 | `area_boss_meadow.m4a` | Berry Meadow! | Area name on the island map |
| 890 | `area_trail_hills.m4a` | Muffin Hills! | Area name on the island map |
| 891 | `area_boss_hills.m4a` | Muffin Hills! | Area name on the island map |
| 892 | `area_trail_peaks.m4a` | Pancake Peaks! | Area name on the island map |
| 893 | `area_boss_peaks.m4a` | Pancake Peaks! | Area name on the island map |
| 894 | `area_trail_bay.m4a` | Melon Bay! | Area name on the island map |
| 895 | `area_boss_bay.m4a` | Melon Bay! | Area name on the island map |
| 896 | `area_trail_caves.m4a` | Cookie Caves! | Area name on the island map |
| 897 | `area_boss_caves.m4a` | Cookie Caves! | Area name on the island map |
| 898 | `beat_meadow.m4a` | Hi, I'm Jammy! The star-snacks landed in the corn. Let's count and find them! | Said by Strawberry when you arrive at Counting Cornfield |
| 899 | `beat_cliffs.m4a` | Crunch here! On Berry Beach, big and small numbers are hiding in the sand. Which one is bigger? | Said by Carrot when you arrive at Compare Berry Beach |
| 900 | `beat_beach.m4a` | Boing! I'm Bloop. The wind blew snacks under the broccoli trees. Let's add them up! | Said by Blueberry when you arrive at Add-Up Broccoli Woods |
| 901 | `beat_woods.m4a` | Hee hee! I'm Niblet. The squirrels nibbled some snacks. Take away and see what's left! | Said by Corn when you arrive at Take-Away Muffin Town |
| 902 | `beat_grove.m4a` | I'm Vinnie. The pancake gate only opens for numbers that make ten together! | Said by Grapes when you arrive at Make-Ten Pancake Peaks |
| 903 | `beat_town.m4a` | Welcome to the cocoa volcano! Every number here is ten and some more. | Said by Carrot when you arrive at Teen Cocoa Volcano |
| 904 | `beat_caves.m4a` | Ooh, a mystery at Melon Bay! A number is missing. Can you find the hidden one? | Said by Blueberry when you arrive at Mystery Melon Bay |
| 905 | `beat_bay.m4a` | The lolly lighthouse keeps lots of snacks. Time for bigger adding! | Said by Strawberry when you arrive at Big Sum Lolly Lighthouse |
| 906 | `beat_volcano.m4a` | So many apples! Take away big numbers to help the apple trees rest. | Said by Corn when you arrive at Take-Away Apple Grove |
| 907 | `beat_lighthouse.m4a` | The cookie caves echo even, odd, even, odd. This is the last area! | Said by Grapes when you arrive at Even-Odd Cookie Caves |
| 908 | `beat_lagoon.m4a` | Splish splash! Welcome to Letter Lemonade Lagoon. Colors, shapes, letters and words are floating in the lemonade. Let's munch them! | Said by Blueberry when you arrive at Letter Lemonade Lagoon |
| 909 | `beat_wordwoods.m4a` | Hello, reader! Welcome to Word Waffle Woods. Every waffle tree here has a word on it. Let's read them and munch them! | Said by Corn when you arrive at Word Waffle Woods |
| 910 | `beat_trail_meadow.m4a` |  | Said by Strawberry when you arrive at Berry Meadow |
| 911 | `beat_boss_meadow.m4a` |  | Said by Strawberry when you arrive at Berry Meadow |
| 912 | `beat_trail_hills.m4a` |  | Said by Strawberry when you arrive at Muffin Hills |
| 913 | `beat_boss_hills.m4a` |  | Said by Strawberry when you arrive at Muffin Hills |
| 914 | `beat_trail_peaks.m4a` |  | Said by Strawberry when you arrive at Pancake Peaks |
| 915 | `beat_boss_peaks.m4a` |  | Said by Strawberry when you arrive at Pancake Peaks |
| 916 | `beat_trail_bay.m4a` |  | Said by Strawberry when you arrive at Melon Bay |
| 917 | `beat_boss_bay.m4a` |  | Said by Strawberry when you arrive at Melon Bay |
| 918 | `beat_trail_caves.m4a` |  | Said by Strawberry when you arrive at Cookie Caves |
| 919 | `beat_boss_caves.m4a` |  | Said by Strawberry when you arrive at Cookie Caves |
| 920 | `unlock_mochi.m4a` | Dora Dumpling joined the team! |  |
| 921 | `hi_mochi.m4a` | Hi hi! I'm Dora Dumpling! Squishy hugs for everyone! Let's munch some snacks together! | Said by Dora Dumpling when they join the team (in their own personality) |
| 922 | `unlock_banana.m4a` | Peel joined the team! |  |
| 923 | `hi_banana.m4a` | Woo hoo! I'm Peel! Let's go bananas and munch together! | Said by Peel when they join the team (in their own personality) |
| 924 | `unlock_pear.m4a` | Petey Pear joined the team! |  |
| 925 | `hi_pear.m4a` | Hello, I'm Petey Pear. We make a great pair! Let's be friends. | Said by Petey Pear when they join the team (in their own personality) |
| 926 | `unlock_carrot.m4a` | Crunch joined the team! |  |
| 927 | `hi_carrot.m4a` | Crunch time! I'm Crunch! Ready, set, go! Let's run and munch together! | Said by Crunch when they join the team (in their own personality) |

## Numbers 0–20 — record first (21)

Say each number on its own, clearly and cheerfully (not like a question).

| # | File name | Say this | Note |
|---:|---|---|---|
| 928 | `num_0.m4a` | 0 |  |
| 929 | `num_1.m4a` | 1 |  |
| 930 | `num_2.m4a` | 2 |  |
| 931 | `num_3.m4a` | 3 |  |
| 932 | `num_4.m4a` | 4 |  |
| 933 | `num_5.m4a` | 5 |  |
| 934 | `num_6.m4a` | 6 |  |
| 935 | `num_7.m4a` | 7 |  |
| 936 | `num_8.m4a` | 8 |  |
| 937 | `num_9.m4a` | 9 |  |
| 938 | `num_10.m4a` | 10 |  |
| 939 | `num_11.m4a` | 11 |  |
| 940 | `num_12.m4a` | 12 |  |
| 941 | `num_13.m4a` | 13 |  |
| 942 | `num_14.m4a` | 14 |  |
| 943 | `num_15.m4a` | 15 |  |
| 944 | `num_16.m4a` | 16 |  |
| 945 | `num_17.m4a` | 17 |  |
| 946 | `num_18.m4a` | 18 |  |
| 947 | `num_19.m4a` | 19 |  |
| 948 | `num_20.m4a` | 20 |  |

## Numbers 21–100 (optional, for later) — later (80)

Only needed once games go past 20.

| # | File name | Say this | Note |
|---:|---|---|---|
| 949 | `num_21.m4a` | 21 |  |
| 950 | `num_22.m4a` | 22 |  |
| 951 | `num_23.m4a` | 23 |  |
| 952 | `num_24.m4a` | 24 |  |
| 953 | `num_25.m4a` | 25 |  |
| 954 | `num_26.m4a` | 26 |  |
| 955 | `num_27.m4a` | 27 |  |
| 956 | `num_28.m4a` | 28 |  |
| 957 | `num_29.m4a` | 29 |  |
| 958 | `num_30.m4a` | 30 |  |
| 959 | `num_31.m4a` | 31 |  |
| 960 | `num_32.m4a` | 32 |  |
| 961 | `num_33.m4a` | 33 |  |
| 962 | `num_34.m4a` | 34 |  |
| 963 | `num_35.m4a` | 35 |  |
| 964 | `num_36.m4a` | 36 |  |
| 965 | `num_37.m4a` | 37 |  |
| 966 | `num_38.m4a` | 38 |  |
| 967 | `num_39.m4a` | 39 |  |
| 968 | `num_40.m4a` | 40 |  |
| 969 | `num_41.m4a` | 41 |  |
| 970 | `num_42.m4a` | 42 |  |
| 971 | `num_43.m4a` | 43 |  |
| 972 | `num_44.m4a` | 44 |  |
| 973 | `num_45.m4a` | 45 |  |
| 974 | `num_46.m4a` | 46 |  |
| 975 | `num_47.m4a` | 47 |  |
| 976 | `num_48.m4a` | 48 |  |
| 977 | `num_49.m4a` | 49 |  |
| 978 | `num_50.m4a` | 50 |  |
| 979 | `num_51.m4a` | 51 |  |
| 980 | `num_52.m4a` | 52 |  |
| 981 | `num_53.m4a` | 53 |  |
| 982 | `num_54.m4a` | 54 |  |
| 983 | `num_55.m4a` | 55 |  |
| 984 | `num_56.m4a` | 56 |  |
| 985 | `num_57.m4a` | 57 |  |
| 986 | `num_58.m4a` | 58 |  |
| 987 | `num_59.m4a` | 59 |  |
| 988 | `num_60.m4a` | 60 |  |
| 989 | `num_61.m4a` | 61 |  |
| 990 | `num_62.m4a` | 62 |  |
| 991 | `num_63.m4a` | 63 |  |
| 992 | `num_64.m4a` | 64 |  |
| 993 | `num_65.m4a` | 65 |  |
| 994 | `num_66.m4a` | 66 |  |
| 995 | `num_67.m4a` | 67 |  |
| 996 | `num_68.m4a` | 68 |  |
| 997 | `num_69.m4a` | 69 |  |
| 998 | `num_70.m4a` | 70 |  |
| 999 | `num_71.m4a` | 71 |  |
| 1000 | `num_72.m4a` | 72 |  |
| 1001 | `num_73.m4a` | 73 |  |
| 1002 | `num_74.m4a` | 74 |  |
| 1003 | `num_75.m4a` | 75 |  |
| 1004 | `num_76.m4a` | 76 |  |
| 1005 | `num_77.m4a` | 77 |  |
| 1006 | `num_78.m4a` | 78 |  |
| 1007 | `num_79.m4a` | 79 |  |
| 1008 | `num_80.m4a` | 80 |  |
| 1009 | `num_81.m4a` | 81 |  |
| 1010 | `num_82.m4a` | 82 |  |
| 1011 | `num_83.m4a` | 83 |  |
| 1012 | `num_84.m4a` | 84 |  |
| 1013 | `num_85.m4a` | 85 |  |
| 1014 | `num_86.m4a` | 86 |  |
| 1015 | `num_87.m4a` | 87 |  |
| 1016 | `num_88.m4a` | 88 |  |
| 1017 | `num_89.m4a` | 89 |  |
| 1018 | `num_90.m4a` | 90 |  |
| 1019 | `num_91.m4a` | 91 |  |
| 1020 | `num_92.m4a` | 92 |  |
| 1021 | `num_93.m4a` | 93 |  |
| 1022 | `num_94.m4a` | 94 |  |
| 1023 | `num_95.m4a` | 95 |  |
| 1024 | `num_96.m4a` | 96 |  |
| 1025 | `num_97.m4a` | 97 |  |
| 1026 | `num_98.m4a` | 98 |  |
| 1027 | `num_99.m4a` | 99 |  |
| 1028 | `num_100.m4a` | 100 |  |

## Sight Words game (coming soon) — later (8)

| # | File name | Say this | Note |
|---:|---|---|---|
| 1029 | `sw_title.m4a` | Sight Words! |  |
| 1030 | `sw_find.m4a` | Find the word | + word |
| 1031 | `sw_read.m4a` | Can you read this word? |  |
| 1032 | `sw_listen.m4a` | Listen! |  |
| 1033 | `sw_that_says.m4a` | That word says | + word |
| 1034 | `sw_new_words.m4a` | Here are some new words! |  |
| 1035 | `sw_great_reading.m4a` | Great reading! |  |
| 1036 | `sw_sound_it.m4a` | Let's say it together. |  |

## Sight words: Dolch Pre-Primer (40) — later (40)

Say each word once, clearly, the way you would read it to a little one.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1037 | `word_a.m4a` | a |  |
| 1038 | `word_and.m4a` | and |  |
| 1039 | `word_away.m4a` | away |  |
| 1040 | `word_big.m4a` | big |  |
| 1041 | `word_blue.m4a` | blue |  |
| 1042 | `word_can.m4a` | can |  |
| 1043 | `word_come.m4a` | come |  |
| 1044 | `word_down.m4a` | down |  |
| 1045 | `word_find.m4a` | find |  |
| 1046 | `word_for.m4a` | for |  |
| 1047 | `word_funny.m4a` | funny |  |
| 1048 | `word_go.m4a` | go |  |
| 1049 | `word_help.m4a` | help |  |
| 1050 | `word_here.m4a` | here |  |
| 1051 | `word_i.m4a` | I |  |
| 1052 | `word_in.m4a` | in |  |
| 1053 | `word_is.m4a` | is |  |
| 1054 | `word_it.m4a` | it |  |
| 1055 | `word_jump.m4a` | jump |  |
| 1056 | `word_little.m4a` | little |  |
| 1057 | `word_look.m4a` | look |  |
| 1058 | `word_make.m4a` | make |  |
| 1059 | `word_me.m4a` | me |  |
| 1060 | `word_my.m4a` | my |  |
| 1061 | `word_not.m4a` | not |  |
| 1062 | `word_one.m4a` | one |  |
| 1063 | `word_play.m4a` | play |  |
| 1064 | `word_red.m4a` | red |  |
| 1065 | `word_run.m4a` | run |  |
| 1066 | `word_said.m4a` | said |  |
| 1067 | `word_see.m4a` | see |  |
| 1068 | `word_the.m4a` | the |  |
| 1069 | `word_three.m4a` | three |  |
| 1070 | `word_to.m4a` | to |  |
| 1071 | `word_two.m4a` | two |  |
| 1072 | `word_up.m4a` | up |  |
| 1073 | `word_we.m4a` | we |  |
| 1074 | `word_where.m4a` | where |  |
| 1075 | `word_yellow.m4a` | yellow |  |
| 1076 | `word_you.m4a` | you |  |

## Sight words: Dolch Primer (52) — later (52)

| # | File name | Say this | Note |
|---:|---|---|---|
| 1077 | `word_all.m4a` | all |  |
| 1078 | `word_am.m4a` | am |  |
| 1079 | `word_are.m4a` | are |  |
| 1080 | `word_at.m4a` | at |  |
| 1081 | `word_ate.m4a` | ate |  |
| 1082 | `word_be.m4a` | be |  |
| 1083 | `word_black.m4a` | black |  |
| 1084 | `word_brown.m4a` | brown |  |
| 1085 | `word_but.m4a` | but |  |
| 1086 | `word_came.m4a` | came |  |
| 1087 | `word_did.m4a` | did |  |
| 1088 | `word_do.m4a` | do |  |
| 1089 | `word_eat.m4a` | eat |  |
| 1090 | `word_four.m4a` | four |  |
| 1091 | `word_get.m4a` | get |  |
| 1092 | `word_good.m4a` | good |  |
| 1093 | `word_have.m4a` | have |  |
| 1094 | `word_he.m4a` | he |  |
| 1095 | `word_into.m4a` | into |  |
| 1096 | `word_like.m4a` | like |  |
| 1097 | `word_must.m4a` | must |  |
| 1098 | `word_new.m4a` | new |  |
| 1099 | `word_no.m4a` | no |  |
| 1100 | `word_now.m4a` | now |  |
| 1101 | `word_on.m4a` | on |  |
| 1102 | `word_our.m4a` | our |  |
| 1103 | `word_out.m4a` | out |  |
| 1104 | `word_please.m4a` | please |  |
| 1105 | `word_pretty.m4a` | pretty |  |
| 1106 | `word_ran.m4a` | ran |  |
| 1107 | `word_ride.m4a` | ride |  |
| 1108 | `word_saw.m4a` | saw |  |
| 1109 | `word_say.m4a` | say |  |
| 1110 | `word_she.m4a` | she |  |
| 1111 | `word_so.m4a` | so |  |
| 1112 | `word_soon.m4a` | soon |  |
| 1113 | `word_that.m4a` | that |  |
| 1114 | `word_there.m4a` | there |  |
| 1115 | `word_they.m4a` | they |  |
| 1116 | `word_this.m4a` | this |  |
| 1117 | `word_too.m4a` | too |  |
| 1118 | `word_under.m4a` | under |  |
| 1119 | `word_want.m4a` | want |  |
| 1120 | `word_was.m4a` | was |  |
| 1121 | `word_well.m4a` | well |  |
| 1122 | `word_went.m4a` | went |  |
| 1123 | `word_what.m4a` | what |  |
| 1124 | `word_white.m4a` | white |  |
| 1125 | `word_who.m4a` | who |  |
| 1126 | `word_will.m4a` | will |  |
| 1127 | `word_with.m4a` | with |  |
| 1128 | `word_yes.m4a` | yes |  |

## Snack Slugger — record first (47)

The umpire lines ("Strike!", "You're out!", "Home run!") can be big and loud, like a real umpire. Lines with "+ number" or "+ name" are followed by one.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1129 | `bb_title.m4a` | Snack Slugger! |  |
| 1130 | `bb_play_ball.m4a` | Play ball! |  |
| 1131 | `bb_batter_up.m4a` | Batter up! | Also followed by a name: "Batter up," + "Player 1!" |
| 1132 | `bb_swing.m4a` | Swing! |  |
| 1133 | `bb_strike.m4a` | Strike! |  |
| 1134 | `bb_strike_two.m4a` | Strike two! |  |
| 1135 | `bb_strike_three.m4a` | Strike three! You're out! |  |
| 1136 | `bb_ball.m4a` | Ball! |  |
| 1137 | `bb_foul.m4a` | Foul ball! |  |
| 1138 | `bb_hit.m4a` | It's a hit! |  |
| 1139 | `bb_single.m4a` | Single! |  |
| 1140 | `bb_double.m4a` | Double! |  |
| 1141 | `bb_triple.m4a` | Triple! |  |
| 1142 | `bb_home_run.m4a` | Home run! |  |
| 1143 | `bb_grand_slam.m4a` | A grand slam! |  |
| 1144 | `bb_run_scores.m4a` | A run scores! |  |
| 1145 | `bb_runs_score.m4a` | runs score! | After a number: "Two" + "runs score!" |
| 1146 | `bb_safe.m4a` | Safe! |  |
| 1147 | `bb_out.m4a` | You're out! |  |
| 1148 | `bb_caught.m4a` | Caught it! That's an out! |  |
| 1149 | `bb_three_outs.m4a` | Three outs! Switch sides! |  |
| 1150 | `bb_three_outs_next.m4a` | Three outs! On to the next inning! |  |
| 1151 | `bb_inning_over.m4a` | That's the inning! Great batting! |  |
| 1152 | `bb_inning.m4a` | Inning | + number, e.g. "Inning" + "2" |
| 1153 | `bb_last_inning.m4a` | Last inning! |  |
| 1154 | `bb_next_inning.m4a` | Next inning! |  |
| 1155 | `bb_great_swing.m4a` | Great swing! |  |
| 1156 | `bb_swing_tip.m4a` | Pick your swing! A single is easy. A home run is a challenge. Get it right, and you hit it! |  |
| 1157 | `bb_pick_swing.m4a` | Pick your swing! |  |
| 1158 | `bb_intro_howto.m4a` | Pick your swing, then answer the pitch! Harder questions hit farther! |  |
| 1159 | `bb_one_player_sub.m4a` | Three innings. Harder questions hit farther! |  |
| 1160 | `bb_sw_single.m4a` | A single! Nice and easy. |  |
| 1161 | `bb_sw_double.m4a` | A double! Just right. |  |
| 1162 | `bb_sw_triple.m4a` | A triple! Here comes a tricky one. |  |
| 1163 | `bb_sw_homer.m4a` | Going for a home run! Here comes a challenge! |  |
| 1164 | `bb_big_whiff.m4a` | Whoosh! What a big swing! That is just one strike. |  |
| 1165 | `bb_nudge.m4a` | The crowd wants a big swing! Want to try a double or a triple? |  |
| 1166 | `bb_time_strike.m4a` | Out of time! That's a strike. |  |
| 1167 | `bb_you_scored.m4a` | You scored | + number + "runs!" |
| 1168 | `bb_runs.m4a` | runs! |  |
| 1169 | `bb_run.m4a` | run! |  |
| 1170 | `bb_wins_game.m4a` | wins the game! | After a name: "Player 1" + "wins the game!" |
| 1171 | `bb_tie_game.m4a` | It's a tie game! What a game! |  |
| 1172 | `bb_you_win.m4a` | You win the game! |  |
| 1173 | `bb_good_game.m4a` | Good game! |  |
| 1174 | `bb_new_high.m4a` | A new high score! |  |
| 1175 | `bb_high_scores.m4a` | High scores! |  |

## Snack Slugger questions (sentence parts) — record first (9)

Question starters, joined with numbers: "What's" + "5" + "plus" + "7" → "What's five plus seven?". Say them like the start of a question.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1176 | `bbq_whats.m4a` | What's |  |
| 1177 | `bbq_how_many_dots.m4a` | How many dots? |  |
| 1178 | `bbq_find.m4a` | Find the number | + number |
| 1179 | `bbq_biggest.m4a` | Which number is the biggest? |  |
| 1180 | `bbq_smallest.m4a` | Which number is the smallest? |  |
| 1181 | `bbq_even.m4a` | Which number is even? |  |
| 1182 | `bbq_odd.m4a` | Which number is odd? |  |
| 1183 | `bbq_what_makes_ten.m4a` | what makes ten? | After a number: "6 plus" + "what makes ten?" |
| 1184 | `bbq_what_makes.m4a` | what makes | In the middle: "3 plus" + "what makes" + "7?" |

## Penalty Kicks (coming soon) — later (15)

| # | File name | Say this | Note |
|---:|---|---|---|
| 1185 | `pk_title.m4a` | Penalty Kicks! |  |
| 1186 | `pk_your_kick.m4a` | Your turn to kick! |  |
| 1187 | `pk_pick_spot.m4a` | Pick a spot to aim! |  |
| 1188 | `pk_goal.m4a` | Goal! |  |
| 1189 | `pk_blocked.m4a` | The goalie blocked it! |  |
| 1190 | `pk_save.m4a` | What a save! |  |
| 1191 | `pk_missed.m4a` | Just missed! |  |
| 1192 | `pk_off_post.m4a` | Off the post! |  |
| 1193 | `pk_your_goalie.m4a` | Now you're the goalie! |  |
| 1194 | `pk_dive.m4a` | Dive! |  |
| 1195 | `pk_great_kick.m4a` | Great kick! |  |
| 1196 | `pk_score_is.m4a` | The score is | + number + "to" + number |
| 1197 | `w_to.m4a` | to | as in "3 to 2" |
| 1198 | `pk_you_win.m4a` | You won the shootout! |  |
| 1199 | `pk_tie.m4a` | It's a tie! One more kick! |  |

## Picnic Spot — record first (47)

Cozy and warm, like showing a friend around your room.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1200 | `rm_title.m4a` | My Picnic Spot! |  |
| 1201 | `rm_it_costs.m4a` | It costs | Followed by a number, then "star bits. You have" + number |
| 1202 | `rm_bits_you_have.m4a` | star bits. You have |  |
| 1203 | `rm_welcome.m4a` | Welcome to your very own picnic spot! |  |
| 1204 | `rm_welcome_back.m4a` | Welcome home! |  |
| 1205 | `rm_shop.m4a` | Let's go shopping! What would you like? |  |
| 1206 | `rm_decorate.m4a` | Let's decorate! Pick a thing, then pick a spot. |  |
| 1207 | `rm_pick_spot.m4a` | Pick a spot! |  |
| 1208 | `rm_placed.m4a` | There! It looks great! |  |
| 1209 | `rm_bought.m4a` | It's yours! Hooray! |  |
| 1210 | `rm_need_more.m4a` | You need a few more star bits. Play a game to earn some! |  |
| 1211 | `rm_costs.m4a` | It costs | + number + "star bits." |
| 1212 | `rm_star_bits.m4a` | star bits. |  |
| 1213 | `rm_put_away.m4a` | Put away! |  |
| 1214 | `rm_undo.m4a` | Undo! |  |
| 1215 | `rm_flip.m4a` | Flip! |  |
| 1216 | `rm_spot_taken.m4a` | That spot is taken. Try another one! |  |
| 1217 | `rm_new_wall.m4a` | Ooh, new wallpaper! |  |
| 1218 | `rm_new_floor.m4a` | Ooh, a new floor! |  |
| 1219 | `rm_trophies.m4a` | Here is your trophy shelf! |  |
| 1220 | `rm_friends.m4a` | Here are your picnic friends! |  |
| 1221 | `rm_locked_friend.m4a` | This friend is still a secret! Win a story challenge to meet them. |  |
| 1222 | `rm_locked_item.m4a` | This one is a special prize! Keep playing to win it. |  |
| 1223 | `rm_prize_won.m4a` | You won a special prize for your room! |  |
| 1224 | `rm_friend_up.m4a` | You're even better friends now! |  |
| 1225 | `rm_shh.m4a` | Shh... they're napping. |  |
| 1226 | `rm_bye.m4a` | Bye bye! See you soon! |  |
| 1227 | `rm_owned.m4a` | You have this one! |  |
| 1228 | `rm_nothing.m4a` | Your things box is empty. Visit the shop! |  |
| 1229 | `rm_demo.m4a` | Tap a thing to pick it. Then drag it where you want! |  |
| 1230 | `rm_drag.m4a` | Drag it where you want! |  |
| 1231 | `rm_things.m4a` | Here are your things! Tap one to put it out. |  |
| 1232 | `rm_jar_set.m4a` | Saving up for it! Your jar fills up as you play. |  |
| 1233 | `rm_jar_ready.m4a` | Your jar is full! You can buy it now! |  |
| 1234 | `rm_jar_empty.m4a` | Pick something in the shop to save up for! |  |
| 1235 | `rm_no_room.m4a` | Your picnic spot is full! Put something away first. |  |
| 1236 | `rm_buy_it.m4a` | Do you want to buy it? |  |
| 1237 | `rm_new_shop.m4a` | Something new is in the shop! Come and see! |  |
| 1238 | `fr_unlock_likes.m4a` | Now you know what I like! |  |
| 1239 | `fr_unlock_face.m4a` | I learned a new face! Look! |  |
| 1240 | `fr_unlock_more.m4a` | Now you know all about me! |  |
| 1241 | `fr_unlock_gift.m4a` | I made you a present for your room! |  |
| 1242 | `fr_lvl1.m4a` | New friend! |  |
| 1243 | `fr_lvl2.m4a` | Pal! |  |
| 1244 | `fr_lvl3.m4a` | Good friend! |  |
| 1245 | `fr_lvl4.m4a` | Best friend! |  |
| 1246 | `fr_lvl5.m4a` | Forever friend! |  |

## Coach v2: placement check, mistake hints, picnic story problems — record first (36)

Story problems are built from short parts, e.g. "Biscuit" + "found" + 3 + "apples" + "in the picnic basket, and" + 4 + "more under the blanket." + "How many" + "apples". A custom pet name is read by the browser voice.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1247 | `skill_wordprob.m4a` | Story problems! Listen to the picnic story, then find how many. |  |
| 1248 | `place_intro.m4a` | Let's see what you already know! |  |
| 1249 | `place_skip.m4a` | Wow! You already know this one. Let's skip ahead! |  |
| 1250 | `place_higher.m4a` | Great job! Let's start a little higher. |  |
| 1251 | `place_normal.m4a` | Thanks! Let's learn it together. |  |
| 1252 | `err_teen.m4a` | Teen numbers start with one ten. Tens first, then ones. |  |
| 1253 | `err_count_on.m4a` | Start from the number, then count up. |  |
| 1254 | `err_count_dots.m4a` | Touch each dot and count them. One, two, three! |  |
| 1255 | `err_count_back.m4a` | Start from the big number, then count back. |  |
| 1256 | `err_make_ten.m4a` | How many more make ten? Count up to ten on your fingers. |  |
| 1257 | `err_number_line.m4a` | Say the numbers in order. Which one is missing? |  |
| 1258 | `err_bed.m4a` | Make a bed with your hands. B comes first, d comes last. |  |
| 1259 | `err_story.m4a` | Let's picture the story. Are we putting together, or taking away? |  |
| 1260 | `err_first_letter.m4a` | Look at the first letter. |  |
| 1261 | `pet_biscuit.m4a` | Biscuit | The default pet name |
| 1262 | `wp_your_pet.m4a` | Your pet | Said instead of a custom pet name when there is no speech voice |
| 1263 | `wp_found.m4a` | found |  |
| 1264 | `wp_f_apples.m4a` | apples |  |
| 1265 | `wp_f_strawberries.m4a` | strawberries |  |
| 1266 | `wp_f_blueberries.m4a` | blueberries |  |
| 1267 | `wp_f_carrots.m4a` | carrots |  |
| 1268 | `wp_in_basket_and.m4a` | in the picnic basket, and |  |
| 1269 | `wp_more_blanket.m4a` | more under the blanket. |  |
| 1270 | `wp_how_many.m4a` | How many |  |
| 1271 | `wp_friends_sat.m4a` | food friends sat on the picnic blanket. |  |
| 1272 | `wp_more_came.m4a` | more came to the picnic. |  |
| 1273 | `wp_how_many_friends.m4a` | How many food friends are there now? |  |
| 1274 | `wp_had.m4a` | had |  |
| 1275 | `wp_in_basket.m4a` | in the picnic basket. |  |
| 1276 | `wp_ate.m4a` | ate |  |
| 1277 | `wp_left.m4a` | are left? |  |
| 1278 | `wp_there_were.m4a` | There were |  |
| 1279 | `wp_on_blanket.m4a` | on the blanket. |  |
| 1280 | `wp_took.m4a` | took |  |
| 1281 | `wp_away.m4a` | away. |  |
| 1282 | `wp_how_many_left.m4a` | How many are left? |  |

## Picnic friends: bios and room chatter — later (216)

Read by the browser voice until recorded. Each food friend talks about themselves. Give each one their own personality (see art/foods/bios.json).

| # | File name | Say this | Note |
|---:|---|---|---|
| 1283 | `fr_strawberry_hi.m4a` | This is Jammy! Jammy is sunny, sweet and always ready to start the fun. |  |
| 1284 | `fr_strawberry_likes.m4a` | Jammy's favorite thing is leading the picnic parade. |  |
| 1285 | `fr_strawberry_dislikes.m4a` | Jammy always says: Berry good job! |  |
| 1286 | `fr_strawberry_food.m4a` | Jammy is a strawberry and loves a good picnic. |  |
| 1287 | `fr_strawberry_tap1.m4a` | Berry good job! | When tapped in the room |
| 1288 | `fr_strawberry_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1289 | `fr_strawberry_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1290 | `fr_strawberry_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1291 | `fr_apple_hi.m4a` | This is Crisp! Crisp is calm and confident; a steady helper. |  |
| 1292 | `fr_apple_likes.m4a` | Crisp's favorite thing is crunchy autumn walks. |  |
| 1293 | `fr_apple_dislikes.m4a` | Crisp always says: Nice and crisp! |  |
| 1294 | `fr_apple_food.m4a` | Crisp is a apple and loves a good picnic. |  |
| 1295 | `fr_apple_tap1.m4a` | Nice and crisp! | When tapped in the room |
| 1296 | `fr_apple_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1297 | `fr_apple_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1298 | `fr_apple_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1299 | `fr_corn_hi.m4a` | This is Niblet! Niblet is goofy, toothy and full of giggles. |  |
| 1300 | `fr_corn_likes.m4a` | Niblet's favorite thing is telling corny jokes. |  |
| 1301 | `fr_corn_dislikes.m4a` | Niblet always says: Aw, shucks! |  |
| 1302 | `fr_corn_food.m4a` | Niblet is a corn on the cob and loves a good picnic. |  |
| 1303 | `fr_corn_tap1.m4a` | Aw, shucks! | When tapped in the room |
| 1304 | `fr_corn_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1305 | `fr_corn_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1306 | `fr_corn_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1307 | `fr_blueberry_hi.m4a` | This is Bloop! Bloop is tiny, curious and amazed by everything. |  |
| 1308 | `fr_blueberry_likes.m4a` | Bloop's favorite thing is asking "why?. |  |
| 1309 | `fr_blueberry_dislikes.m4a` | Bloop always says: Bloop bloop, I did it! |  |
| 1310 | `fr_blueberry_food.m4a` | Bloop is a blueberry and loves a good picnic. |  |
| 1311 | `fr_blueberry_tap1.m4a` | Bloop bloop, I did it! | When tapped in the room |
| 1312 | `fr_blueberry_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1313 | `fr_blueberry_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1314 | `fr_blueberry_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1315 | `fr_mochi_hi.m4a` | This is Dora Dumpling! Dora Dumpling is soft, cheerful and a little bit hungry. |  |
| 1316 | `fr_mochi_likes.m4a` | Dora Dumpling's favorite thing is snack time. |  |
| 1317 | `fr_mochi_dislikes.m4a` | Dora Dumpling always says: Squishy hugs for everyone! |  |
| 1318 | `fr_mochi_food.m4a` | Dora Dumpling is a rice dumpling and loves a good picnic. |  |
| 1319 | `fr_mochi_tap1.m4a` | Squishy hugs for everyone! | When tapped in the room |
| 1320 | `fr_mochi_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1321 | `fr_mochi_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1322 | `fr_mochi_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1323 | `fr_banana_hi.m4a` | This is Peel! Peel is silly and bendy; loves a good laugh. |  |
| 1324 | `fr_banana_likes.m4a` | Peel's favorite thing is bouncing on trampolines. |  |
| 1325 | `fr_banana_dislikes.m4a` | Peel always says: Let's go bananas! |  |
| 1326 | `fr_banana_food.m4a` | Peel is a banana and loves a good picnic. |  |
| 1327 | `fr_banana_tap1.m4a` | Let's go bananas! | When tapped in the room |
| 1328 | `fr_banana_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1329 | `fr_banana_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1330 | `fr_banana_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1331 | `fr_pear_hi.m4a` | This is Petey Pear! Petey Pear is dreamy and gentle; thinks before he speaks. |  |
| 1332 | `fr_pear_likes.m4a` | Petey Pear's favorite thing is cozy naps in the shade. |  |
| 1333 | `fr_pear_dislikes.m4a` | Petey Pear always says: We make a great pear! |  |
| 1334 | `fr_pear_food.m4a` | Petey Pear is a pear and loves a good picnic. |  |
| 1335 | `fr_pear_tap1.m4a` | We make a great pear! | When tapped in the room |
| 1336 | `fr_pear_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1337 | `fr_pear_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1338 | `fr_pear_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1339 | `fr_carrot_hi.m4a` | This is Crunch! Crunch is sporty and determined; never gives up. |  |
| 1340 | `fr_carrot_likes.m4a` | Crunch's favorite thing is racing to the finish line. |  |
| 1341 | `fr_carrot_dislikes.m4a` | Crunch always says: Crunch time! |  |
| 1342 | `fr_carrot_food.m4a` | Crunch is a carrot and loves a good picnic. |  |
| 1343 | `fr_carrot_tap1.m4a` | Crunch time! | When tapped in the room |
| 1344 | `fr_carrot_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1345 | `fr_carrot_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1346 | `fr_carrot_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1347 | `fr_broccoli_hi.m4a` | This is Brock! Brock is kind and strong, like a little tree. |  |
| 1348 | `fr_broccoli_likes.m4a` | Brock's favorite thing is climbing real trees. |  |
| 1349 | `fr_broccoli_dislikes.m4a` | Brock always says: Stand tall! |  |
| 1350 | `fr_broccoli_food.m4a` | Brock is a broccoli and loves a good picnic. |  |
| 1351 | `fr_broccoli_tap1.m4a` | Stand tall! | When tapped in the room |
| 1352 | `fr_broccoli_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1353 | `fr_broccoli_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1354 | `fr_broccoli_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1355 | `fr_sushi_hi.m4a` | This is Umi! Umi is polite, tidy and quietly clever. |  |
| 1356 | `fr_sushi_likes.m4a` | Umi's favorite thing is ocean waves. |  |
| 1357 | `fr_sushi_dislikes.m4a` | Umi always says: Roll with it! |  |
| 1358 | `fr_sushi_food.m4a` | Umi is a sushi and loves a good picnic. |  |
| 1359 | `fr_sushi_tap1.m4a` | Roll with it! | When tapped in the room |
| 1360 | `fr_sushi_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1361 | `fr_sushi_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1362 | `fr_sushi_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1363 | `fr_taco_hi.m4a` | This is Guac! Guac is wild, wacky and fun at parties. |  |
| 1364 | `fr_taco_likes.m4a` | Guac's favorite thing is taco Tuesday dance. |  |
| 1365 | `fr_taco_dislikes.m4a` | Guac always says: Let's taco 'bout it! |  |
| 1366 | `fr_taco_food.m4a` | Guac is a taco and loves a good picnic. |  |
| 1367 | `fr_taco_tap1.m4a` | Let's taco 'bout it! | When tapped in the room |
| 1368 | `fr_taco_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1369 | `fr_taco_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1370 | `fr_taco_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1371 | `fr_pizza_hi.m4a` | This is Slice! Slice is cool and confident; shares every slice. |  |
| 1372 | `fr_pizza_likes.m4a` | Slice's favorite thing is pizza parties with friends. |  |
| 1373 | `fr_pizza_dislikes.m4a` | Slice always says: You're a-pizza-zing! |  |
| 1374 | `fr_pizza_food.m4a` | Slice is a pizza slice and loves a good picnic. |  |
| 1375 | `fr_pizza_tap1.m4a` | You're a-pizza-zing! | When tapped in the room |
| 1376 | `fr_pizza_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1377 | `fr_pizza_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1378 | `fr_pizza_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1379 | `fr_pancake_hi.m4a` | This is Maple! Maple is warm and cozy, like a sunny morning. |  |
| 1380 | `fr_pancake_likes.m4a` | Maple's favorite thing is breakfast in bed. |  |
| 1381 | `fr_pancake_dislikes.m4a` | Maple always says: Stack it up! |  |
| 1382 | `fr_pancake_food.m4a` | Maple is a pancake stack and loves a good picnic. |  |
| 1383 | `fr_pancake_tap1.m4a` | Stack it up! | When tapped in the room |
| 1384 | `fr_pancake_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1385 | `fr_pancake_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1386 | `fr_pancake_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1387 | `fr_cupcake_hi.m4a` | This is Sprinkles! Sprinkles is sweet and sparkly; loves to celebrate. |  |
| 1388 | `fr_cupcake_likes.m4a` | Sprinkles's favorite thing is birthday candles. |  |
| 1389 | `fr_cupcake_dislikes.m4a` | Sprinkles always says: Sprinkle some joy! |  |
| 1390 | `fr_cupcake_food.m4a` | Sprinkles is a cupcake and loves a good picnic. |  |
| 1391 | `fr_cupcake_tap1.m4a` | Sprinkle some joy! | When tapped in the room |
| 1392 | `fr_cupcake_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1393 | `fr_cupcake_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1394 | `fr_cupcake_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1395 | `fr_avocado_hi.m4a` | This is Avo! Avo is super chill; calm in any storm. |  |
| 1396 | `fr_avocado_likes.m4a` | Avo's favorite thing is lazy hammock days. |  |
| 1397 | `fr_avocado_dislikes.m4a` | Avo always says: Avo great day! |  |
| 1398 | `fr_avocado_food.m4a` | Avo is a avocado and loves a good picnic. |  |
| 1399 | `fr_avocado_tap1.m4a` | Avo great day! | When tapped in the room |
| 1400 | `fr_avocado_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1401 | `fr_avocado_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1402 | `fr_avocado_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1403 | `fr_watermelon_hi.m4a` | This is Mellie! Mellie is sunny and splashy; the life of the picnic. |  |
| 1404 | `fr_watermelon_likes.m4a` | Mellie's favorite thing is summer water fights. |  |
| 1405 | `fr_watermelon_dislikes.m4a` | Mellie always says: One in a melon! |  |
| 1406 | `fr_watermelon_food.m4a` | Mellie is a watermelon slice and loves a good picnic. |  |
| 1407 | `fr_watermelon_tap1.m4a` | One in a melon! | When tapped in the room |
| 1408 | `fr_watermelon_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1409 | `fr_watermelon_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1410 | `fr_watermelon_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1411 | `fr_pretzel_hi.m4a` | This is Twist! Twist is cool and clever; loves a good puzzle. |  |
| 1412 | `fr_pretzel_likes.m4a` | Twist's favorite thing is brain teasers. |  |
| 1413 | `fr_pretzel_dislikes.m4a` | Twist always says: Let's twist again! |  |
| 1414 | `fr_pretzel_food.m4a` | Twist is a soft pretzel and loves a good picnic. |  |
| 1415 | `fr_pretzel_tap1.m4a` | Let's twist again! | When tapped in the room |
| 1416 | `fr_pretzel_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1417 | `fr_pretzel_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1418 | `fr_pretzel_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1419 | `fr_grapes_hi.m4a` | This is Vinnie! Vinnie is friendly and loyal; always brings friends. |  |
| 1420 | `fr_grapes_likes.m4a` | Vinnie's favorite thing is big group hugs. |  |
| 1421 | `fr_grapes_dislikes.m4a` | Vinnie always says: Grape to see you! |  |
| 1422 | `fr_grapes_food.m4a` | Vinnie is a grapes and loves a good picnic. |  |
| 1423 | `fr_grapes_tap1.m4a` | Grape to see you! | When tapped in the room |
| 1424 | `fr_grapes_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1425 | `fr_grapes_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1426 | `fr_grapes_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1427 | `fr_onigiri_hi.m4a` | This is Nori! Nori is quiet and steady; a really good friend. |  |
| 1428 | `fr_onigiri_likes.m4a` | Nori's favorite thing is lunchbox adventures. |  |
| 1429 | `fr_onigiri_dislikes.m4a` | Nori always says: Rice and easy! |  |
| 1430 | `fr_onigiri_food.m4a` | Nori is a onigiri and loves a good picnic. |  |
| 1431 | `fr_onigiri_tap1.m4a` | Rice and easy! | When tapped in the room |
| 1432 | `fr_onigiri_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1433 | `fr_onigiri_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1434 | `fr_onigiri_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1435 | `fr_pineapple_hi.m4a` | This is Spike! Spike is brave and bouncy; spiky outside, sweet inside. |  |
| 1436 | `fr_pineapple_likes.m4a` | Spike's favorite thing is tropical islands. |  |
| 1437 | `fr_pineapple_dislikes.m4a` | Spike always says: Stay sharp, stay sweet! |  |
| 1438 | `fr_pineapple_food.m4a` | Spike is a pineapple and loves a good picnic. |  |
| 1439 | `fr_pineapple_tap1.m4a` | Stay sharp, stay sweet! | When tapped in the room |
| 1440 | `fr_pineapple_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1441 | `fr_pineapple_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1442 | `fr_pineapple_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1443 | `fr_waffle_hi.m4a` | This is Wally! Wally is tidy and dependable; loves a plan. |  |
| 1444 | `fr_waffle_likes.m4a` | Wally's favorite thing is neat little squares. |  |
| 1445 | `fr_waffle_dislikes.m4a` | Wally always says: No waffling, let's go! |  |
| 1446 | `fr_waffle_food.m4a` | Wally is a waffle and loves a good picnic. |  |
| 1447 | `fr_waffle_tap1.m4a` | No waffling, let's go! | When tapped in the room |
| 1448 | `fr_waffle_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1449 | `fr_waffle_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1450 | `fr_waffle_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1451 | `fr_lemon_hi.m4a` | This is Zest! Zest is a little sour, a lot of fun. |  |
| 1452 | `fr_lemon_likes.m4a` | Zest's favorite thing is lemonade stands. |  |
| 1453 | `fr_lemon_dislikes.m4a` | Zest always says: Easy peasy, lemon squeezy! |  |
| 1454 | `fr_lemon_food.m4a` | Zest is a lemon and loves a good picnic. |  |
| 1455 | `fr_lemon_tap1.m4a` | Easy peasy, lemon squeezy! | When tapped in the room |
| 1456 | `fr_lemon_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1457 | `fr_lemon_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1458 | `fr_lemon_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1459 | `fr_donut_hi.m4a` | This is Minty! Minty is sweet and goofy; first to laugh. |  |
| 1460 | `fr_donut_likes.m4a` | Minty's favorite thing is fresh minty breezes. |  |
| 1461 | `fr_donut_dislikes.m4a` | Minty always says: Donut give up! |  |
| 1462 | `fr_donut_food.m4a` | Minty is a donut and loves a good picnic. |  |
| 1463 | `fr_donut_tap1.m4a` | Donut give up! | When tapped in the room |
| 1464 | `fr_donut_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1465 | `fr_donut_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1466 | `fr_donut_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1467 | `fr_popcorn_hi.m4a` | This is Popper! Popper is bursting with energy all day long. |  |
| 1468 | `fr_popcorn_likes.m4a` | Popper's favorite thing is movie night. |  |
| 1469 | `fr_popcorn_dislikes.m4a` | Popper always says: Pop pop hooray! |  |
| 1470 | `fr_popcorn_food.m4a` | Popper is a popcorn box and loves a good picnic. |  |
| 1471 | `fr_popcorn_tap1.m4a` | Pop pop hooray! | When tapped in the room |
| 1472 | `fr_popcorn_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1473 | `fr_popcorn_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1474 | `fr_popcorn_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1475 | `fr_peach_hi.m4a` | This is Peachy! Peachy is gentle and kind; gives the best hugs. |  |
| 1476 | `fr_peach_likes.m4a` | Peachy's favorite thing is sunny orchards. |  |
| 1477 | `fr_peach_dislikes.m4a` | Peachy always says: Everything's peachy! |  |
| 1478 | `fr_peach_food.m4a` | Peachy is a peach and loves a good picnic. |  |
| 1479 | `fr_peach_tap1.m4a` | Everything's peachy! | When tapped in the room |
| 1480 | `fr_peach_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1481 | `fr_peach_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1482 | `fr_peach_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1483 | `fr_cheese_hi.m4a` | This is Gouda! Gouda is funny and full of surprises (and holes!). |  |
| 1484 | `fr_cheese_likes.m4a` | Gouda's favorite thing is saying "cheese" for photos. |  |
| 1485 | `fr_cheese_dislikes.m4a` | Gouda always says: Gouda job! |  |
| 1486 | `fr_cheese_food.m4a` | Gouda is a cheese wedge and loves a good picnic. |  |
| 1487 | `fr_cheese_tap1.m4a` | Gouda job! | When tapped in the room |
| 1488 | `fr_cheese_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1489 | `fr_cheese_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1490 | `fr_cheese_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1491 | `fr_cookie_hi.m4a` | This is Chip! Chip is crunchy, cheerful and always shares. |  |
| 1492 | `fr_cookie_likes.m4a` | Chip's favorite thing is milk and cookie dunks. |  |
| 1493 | `fr_cookie_dislikes.m4a` | Chip always says: That's the way the cookie crumbles! |  |
| 1494 | `fr_cookie_food.m4a` | Chip is a chocolate-chip cookie and loves a good picnic. |  |
| 1495 | `fr_cookie_tap1.m4a` | That's the way the cookie crumbles! | When tapped in the room |
| 1496 | `fr_cookie_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1497 | `fr_cookie_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1498 | `fr_cookie_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |

## Picnic Spot things (68) — later (68)

Item names, said brightly when a kid taps one in the shop.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1499 | `it_bed_simple.m4a` | Cozy bed! |  |
| 1500 | `it_bed_cloud.m4a` | Cloud bed! |  |
| 1501 | `it_sofa.m4a` | Comfy sofa! |  |
| 1502 | `it_beanbag_pink.m4a` | Pink cushion! |  |
| 1503 | `it_beanbag_blue.m4a` | Mint cushion! |  |
| 1504 | `it_chair.m4a` | Stump stool! |  |
| 1505 | `it_tent.m4a` | Parasol! |  |
| 1506 | `it_table_round.m4a` | Picnic table! |  |
| 1507 | `it_desk.m4a` | Desk! |  |
| 1508 | `it_bookshelf.m4a` | Bookshelf! |  |
| 1509 | `it_dresser.m4a` | Dresser! |  |
| 1510 | `it_toyshelf.m4a` | Toy shelf! |  |
| 1511 | `it_snackcart.m4a` | Cupcake stand! |  |
| 1512 | `it_fishtank.m4a` | Fish tank! |  |
| 1513 | `it_globe.m4a` | Globe! |  |
| 1514 | `it_piano.m4a` | Toy piano! |  |
| 1515 | `it_plates.m4a` | Picnic plates! |  |
| 1516 | `it_fruit_bowl.m4a` | Fruit bowl! |  |
| 1517 | `it_lemonade_jug.m4a` | Lemonade jug! |  |
| 1518 | `it_thermos.m4a` | Cocoa thermos! |  |
| 1519 | `it_plant_tall.m4a` | Leafy plant! |  |
| 1520 | `it_plant_cactus.m4a` | Cactus! |  |
| 1521 | `it_plant_flower.m4a` | Flower pot! |  |
| 1522 | `it_plant_tree.m4a` | Little tree! |  |
| 1523 | `it_lamp_floor.m4a` | Lantern! |  |
| 1524 | `it_lamp_star.m4a` | Star lamp! |  |
| 1525 | `it_lamp_mushroom.m4a` | Mushroom lamp! |  |
| 1526 | `it_toybox.m4a` | Picnic basket! |  |
| 1527 | `it_blocks.m4a` | Block tower! |  |
| 1528 | `it_train.m4a` | Toy train! |  |
| 1529 | `it_drum.m4a` | Drum! |  |
| 1530 | `it_rocket.m4a` | Toy rocket! |  |
| 1531 | `it_plush_bunny.m4a` | Bunny plush! |  |
| 1532 | `it_easel.m4a` | Paint easel! |  |
| 1533 | `it_telescope.m4a` | Telescope! |  |
| 1534 | `it_soccergoal.m4a` | Mini goal! |  |
| 1535 | `it_soccerball.m4a` | Soccer ball! |  |
| 1536 | `it_batrack.m4a` | Bat and glove rack! |  |
| 1537 | `it_hoop.m4a` | Mini hoop! |  |
| 1538 | `it_rug_round.m4a` | Picnic blanket! |  |
| 1539 | `it_rug_rainbow.m4a` | Rainbow rug! |  |
| 1540 | `it_rug_star.m4a` | Star rug! |  |
| 1541 | `it_rug_diamond.m4a` | Ballpark rug! |  |
| 1542 | `it_poster_space.m4a` | Space poster! |  |
| 1543 | `it_poster_mochi.m4a` | Dora Dumpling poster! |  |
| 1544 | `it_poster_baseball.m4a` | Baseball poster! |  |
| 1545 | `it_frame_sun.m4a` | Strawberry picture! |  |
| 1546 | `it_clock.m4a` | Clock! |  |
| 1547 | `it_shelf_wall.m4a` | Wall shelf! |  |
| 1548 | `it_fairylights.m4a` | Fairy lights! |  |
| 1549 | `it_pennant.m4a` | Bunting! |  |
| 1550 | `it_mirror.m4a` | Mirror! |  |
| 1551 | `it_wp_cream.m4a` | Cream wallpaper! |  |
| 1552 | `it_wp_stripes.m4a` | Candy stripes! |  |
| 1553 | `it_wp_dots.m4a` | Polka dots! |  |
| 1554 | `it_wp_stars.m4a` | Starry wallpaper! |  |
| 1555 | `it_wp_clouds.m4a` | Cloud wallpaper! |  |
| 1556 | `it_wp_leaves.m4a` | Leafy wallpaper! |  |
| 1557 | `it_fl_wood.m4a` | Wood floor! |  |
| 1558 | `it_fl_checker.m4a` | Checker floor! |  |
| 1559 | `it_fl_carpet.m4a` | Soft carpet! |  |
| 1560 | `it_fl_tiles.m4a` | Mint tiles! |  |
| 1561 | `it_trophy_story.m4a` | Story trophy! |  |
| 1562 | `it_bat_gold.m4a` | Golden bat! |  |
| 1563 | `it_plush_grumbly.m4a` | Grumbly plush! |  |
| 1564 | `it_rug_sticker.m4a` | Sticker rug! |  |
| 1565 | `it_star_big.m4a` | Giant star! |  |
| 1566 | `it_hr_ball.m4a` | Home run ball! |  |

## Dress Up hats and held items (34) — later (34)

Hat and held-item names, said brightly when a kid picks one in Dress Up.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1567 | `ow_bow.m4a` | Balloon! |  |
| 1568 | `ow_cap.m4a` | Sun hat! |  |
| 1569 | `ow_headband.m4a` | Ice-cream cone! |  |
| 1570 | `ow_sunglasses.m4a` | Bookworm glasses! |  |
| 1571 | `ow_flower.m4a` | Flower crown! |  |
| 1572 | `ow_partyhat.m4a` | Party hat! |  |
| 1573 | `ow_beanie.m4a` | Chef's hat! |  |
| 1574 | `ow_crown.m4a` | Crown! |  |
| 1575 | `ow_explorer.m4a` | Explorer cap! |  |
| 1576 | `ow_snorkel.m4a` | Snorkel mask! |  |
| 1577 | `ow_conductor.m4a` | Conductor cap! |  |
| 1578 | `ow_bee.m4a` | Bee antennae! |  |
| 1579 | `ow_dino.m4a` | Dino hood! |  |
| 1580 | `ow_headlamp.m4a` | Doctor's headlamp! |  |
| 1581 | `ow_rainhat.m4a` | Rain hat! |  |
| 1582 | `ow_safari.m4a` | Safari hat! |  |
| 1583 | `ow_astronaut.m4a` | Astronaut helmet! |  |
| 1584 | `ow_wizard.m4a` | Wizard hat! |  |
| 1585 | `ow_gradcap.m4a` | Graduation cap! |  |
| 1586 | `ow_kite.m4a` | Kite! |  |
| 1587 | `ow_lollipop.m4a` | Lollipop! |  |
| 1588 | `ow_bouquet.m4a` | Flower bouquet! |  |
| 1589 | `ow_book.m4a` | Book! |  |
| 1590 | `ow_trophy.m4a` | Trophy! |  |
| 1591 | `ow_bubbles.m4a` | Bubble wand! |  |
| 1592 | `ow_net.m4a` | Butterfly net! |  |
| 1593 | `ow_telescope.m4a` | Telescope! |  |
| 1594 | `ow_teddy.m4a` | Teddy bear! |  |
| 1595 | `ow_umbrella.m4a` | Umbrella! |  |
| 1596 | `ow_wand.m4a` | Magic wand! |  |
| 1597 | `ow_ukulele.m4a` | Ukulele! |  |
| 1598 | `ow_flag.m4a` | Flag! |  |
| 1599 | `ow_basket.m4a` | Picnic basket! |  |
| 1600 | `ow_golden_basket.m4a` | Golden picnic basket! |  |

## Dress Up: how to earn each locked hat or item — later (26)

Friendly and encouraging, said when a kid taps a locked hat or held item.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1601 | `ow_kite_hint.m4a` | Play on 3 days in one week to earn this! |  |
| 1602 | `ow_lollipop_hint.m4a` | Finish Compare Berry Beach to earn this! |  |
| 1603 | `ow_explorer_hint.m4a` | Finish Add-Up Broccoli Woods to earn this! |  |
| 1604 | `ow_book_hint.m4a` | Master 2 skills to earn this! |  |
| 1605 | `ow_bouquet_hint.m4a` | Collect 160 stars to earn this! |  |
| 1606 | `ow_trophy_hint.m4a` | Win 3 friend challenges with no oopsies to earn this! |  |
| 1607 | `ow_snorkel_hint.m4a` | Finish Mystery Melon Bay to earn this! |  |
| 1608 | `ow_conductor_hint.m4a` | Meet your weekly goal in 5 weeks to earn this! |  |
| 1609 | `ow_teddy_hint.m4a` | Play on 25 different days to earn this! |  |
| 1610 | `ow_bubbles_hint.m4a` | Get 3 stars on both stops of 2 island areas to earn this! |  |
| 1611 | `ow_bee_hint.m4a` | Get 3 stars on both stops of Take-Away Apple Grove to earn this! |  |
| 1612 | `ow_net_hint.m4a` | Finish Take-Away Apple Grove and meet your weekly goal in 5 weeks to earn this! |  |
| 1613 | `ow_headlamp_hint.m4a` | Finish Even-Odd Cookie Caves and master 4 skills to earn this! |  |
| 1614 | `ow_dino_hint.m4a` | Get 3 stars on both stops of Teen Cocoa Volcano to earn this! |  |
| 1615 | `ow_telescope_hint.m4a` | Get 3 stars on both stops of Big Sum Lolly Lighthouse to earn this! |  |
| 1616 | `ow_umbrella_hint.m4a` | Meet your weekly goal in 6 weeks to earn this! |  |
| 1617 | `ow_rainhat_hint.m4a` | Meet your weekly goal in 8 weeks to earn this! |  |
| 1618 | `ow_ukulele_hint.m4a` | Meet your weekly goal in 10 weeks to earn this! |  |
| 1619 | `ow_wand_hint.m4a` | Master 5 skills to earn this! |  |
| 1620 | `ow_wizard_hint.m4a` | Master 7 skills to earn this! |  |
| 1621 | `ow_gradcap_hint.m4a` | Master 10 skills to earn this! |  |
| 1622 | `ow_astronaut_hint.m4a` | Collect 450 stars to earn this! |  |
| 1623 | `ow_safari_hint.m4a` | Collect 600 stars to earn this! |  |
| 1624 | `ow_basket_hint.m4a` | Collect 750 stars to earn this! |  |
| 1625 | `ow_flag_hint.m4a` | Collect 900 stars and meet your weekly goal in 6 weeks to earn this! |  |
| 1626 | `ow_golden_basket_hint.m4a` | Finish the whole Picnic Island story to earn this! |  |

## Bonus questions (198) — later (198)

Read each question like a friendly quiz host. The built-in voice already covers these, so record them whenever you like.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1627 | `q_notplanet.m4a` | Which one is NOT a planet? | Space |
| 1628 | `q_livein.m4a` | Which planet do we live on? | Space |
| 1629 | `q_daylight.m4a` | What gives us light and warmth in the daytime? | Space |
| 1630 | `q_rings.m4a` | Which planet has big, beautiful rings? | Space |
| 1631 | `q_redplanet.m4a` | Which planet is called the red planet? | Space |
| 1632 | `q_rocket.m4a` | What do astronauts ride into space? | Space |
| 1633 | `q_moonorbit.m4a` | What does the Moon go around and around? | Space |
| 1634 | `q_nightsky.m4a` | What do we see twinkling in the night sky? | Space |
| 1635 | `q_spacesuit.m4a` | What does an astronaut wear in space? | Space |
| 1636 | `q_biggest.m4a` | Which one is the biggest in real life? | Space |
| 1637 | `q_sunstar.m4a` | The Sun is a big, hot... | Space |
| 1638 | `q_moo.m4a` | Which animal says moo? | Animals |
| 1639 | `q_quack.m4a` | Which animal says quack? | Animals |
| 1640 | `q_oink.m4a` | Which animal says oink? | Animals |
| 1641 | `q_roar.m4a` | Which animal has a big, loud roar? | Animals |
| 1642 | `q_neck.m4a` | Which animal has a very long neck? | Animals |
| 1643 | `q_trunk.m4a` | Which animal has a long trunk? | Animals |
| 1644 | `q_stripes.m4a` | Which animal has black and white stripes? | Animals |
| 1645 | `q_fly.m4a` | Which animal has wings and can fly? | Animals |
| 1646 | `q_fins.m4a` | Which animal swims with fins? | Animals |
| 1647 | `q_puppy.m4a` | A puppy grows up to be a... | Animals |
| 1648 | `q_kitten.m4a` | A kitten grows up to be a... | Animals |
| 1649 | `q_tadpole.m4a` | A tadpole grows up to be a... | Animals |
| 1650 | `q_caterpillar.m4a` | A caterpillar turns into a... | Animals |
| 1651 | `q_pouch.m4a` | Which animal hops and carries its baby in a pouch? | Animals |
| 1652 | `q_wool.m4a` | Which animal gives us soft wool? | Animals |
| 1653 | `q_eggs.m4a` | Which animal lays the eggs we eat for breakfast? | Animals |
| 1654 | `q_eightlegs.m4a` | Which animal has eight legs? | Animals |
| 1655 | `q_shell.m4a` | Which animal carries a hard shell on its back? | Animals |
| 1656 | `q_honey.m4a` | Which animal makes honey? | Animals |
| 1657 | `q_whale.m4a` | Which animal is the biggest? | Animals |
| 1658 | `q_penguin.m4a` | Which bird cannot fly, but is a great swimmer? | Animals |
| 1659 | `q_hoot.m4a` | Which bird says hoo hoo at night? | Animals |
| 1660 | `q_milkfrom.m4a` | Which animal gives us milk to drink? | Animals |
| 1661 | `q_carrots.m4a` | Which animal loves to munch carrots and has long ears? | Animals |
| 1662 | `q_bark.m4a` | Which animal says woof? | Animals |
| 1663 | `q_sky.m4a` | What color is the sky on a sunny day? | Colors & shapes |
| 1664 | `q_grass.m4a` | What color is grass? | Colors & shapes |
| 1665 | `q_banana.m4a` | What color is a ripe banana? | Colors & shapes |
| 1666 | `q_snowcolor.m4a` | What color is snow? | Colors & shapes |
| 1667 | `q_stopsign.m4a` | What color is a stop sign? | Colors & shapes |
| 1668 | `q_redyellow.m4a` | Red and yellow paint mixed together make... | Colors & shapes |
| 1669 | `q_blueyellow.m4a` | Blue and yellow paint mixed together make... | Colors & shapes |
| 1670 | `q_redblue.m4a` | Red and blue paint mixed together make... | Colors & shapes |
| 1671 | `q_triangle.m4a` | Which shape has three sides? | Colors & shapes |
| 1672 | `q_circle.m4a` | Which shape is round, like a ball? | Colors & shapes |
| 1673 | `q_squaresides.m4a` | How many sides does a square have? | Colors & shapes |
| 1674 | `q_starpoints.m4a` | Which shape has five points? | Colors & shapes |
| 1675 | `q_heartshape.m4a` | Which one is a heart? | Colors & shapes |
| 1676 | `q_leaves.m4a` | In which season do lots of leaves fall off the trees? | Seasons & weather |
| 1677 | `q_snowseason.m4a` | In which season do we often see snow? | Seasons & weather |
| 1678 | `q_bloom.m4a` | In which season do many flowers start to bloom? | Seasons & weather |
| 1679 | `q_hottest.m4a` | Which season is the hottest? | Seasons & weather |
| 1680 | `q_umbrella.m4a` | What do you use to stay dry in the rain? | Seasons & weather |
| 1681 | `q_rainbow.m4a` | What colorful thing can you see when the sun shines while it rains? | Seasons & weather |
| 1682 | `q_mittens.m4a` | What keeps your hands warm when it is cold? | Seasons & weather |
| 1683 | `q_lightning.m4a` | What flashes bright in the sky during a storm? | Seasons & weather |
| 1684 | `q_snowice.m4a` | Snowflakes are made of tiny bits of... | Seasons & weather |
| 1685 | `q_snowman.m4a` | What can you build with snow? | Seasons & weather |
| 1686 | `q_see.m4a` | What do you use to see? | My body |
| 1687 | `q_hear.m4a` | What do you use to hear? | My body |
| 1688 | `q_smell.m4a` | What do you use to smell a flower? | My body |
| 1689 | `q_fingers.m4a` | How many fingers are on one hand? | My body |
| 1690 | `q_chew.m4a` | What do you use to chew your food? | My body |
| 1691 | `q_heartbeat.m4a` | What goes thump-thump inside your chest? | My body |
| 1692 | `q_think.m4a` | What part of your body helps you think? | My body |
| 1693 | `q_wash.m4a` | What should you do before you eat? | My body |
| 1694 | `q_legs.m4a` | How many legs do you have? | My body |
| 1695 | `q_fruit.m4a` | Which one is a fruit? | Food |
| 1696 | `q_veggie.m4a` | Which one is a vegetable? | Food |
| 1697 | `q_frozen.m4a` | Which treat is cold and frozen? | Food |
| 1698 | `q_tree.m4a` | Which one grows on a tree? | Food |
| 1699 | `q_cheese.m4a` | Which food is made from milk? | Food |
| 1700 | `q_yellowfruit.m4a` | Which fruit is long and yellow? | Food |
| 1701 | `q_strawberry.m4a` | Which red fruit has tiny seeds on the outside? | Food |
| 1702 | `q_popcorn.m4a` | Popcorn is made from... | Food |
| 1703 | `q_bees.m4a` | Bees make a sweet, sticky food called... | Food |
| 1704 | `q_orangefruit.m4a` | Which fruit is orange, round and juicy? | Food |
| 1705 | `q_hot.m4a` | What is the opposite of hot? | Opposites |
| 1706 | `q_big.m4a` | What is the opposite of big? | Opposites |
| 1707 | `q_up.m4a` | What is the opposite of up? | Opposites |
| 1708 | `q_day.m4a` | What is the opposite of day? | Opposites |
| 1709 | `q_happy.m4a` | What is the opposite of happy? | Opposites |
| 1710 | `q_fast.m4a` | What is the opposite of fast? | Opposites |
| 1711 | `q_open.m4a` | What is the opposite of open? | Opposites |
| 1712 | `q_wet.m4a` | What is the opposite of wet? | Opposites |
| 1713 | `q_loud.m4a` | What is the opposite of loud? | Opposites |
| 1714 | `q_notfruit.m4a` | Which one is NOT a fruit? | Odd one out |
| 1715 | `q_notanimal.m4a` | Which one is NOT an animal? | Odd one out |
| 1716 | `q_notwear.m4a` | Which one do you NOT wear on your feet? | Odd one out |
| 1717 | `q_cantfly.m4a` | Which one can NOT fly? | Odd one out |
| 1718 | `q_notalive.m4a` | Which one is NOT alive? | Odd one out |
| 1719 | `q_noteat.m4a` | Which one can you NOT eat? | Odd one out |
| 1720 | `q_notwater.m4a` | Which one does NOT live in the water? | Odd one out |
| 1721 | `q_nowheels.m4a` | Which one does NOT have wheels? | Odd one out |
| 1722 | `q_notmusic.m4a` | Which one is NOT a musical instrument? | Odd one out |
| 1723 | `q_r_cat.m4a` | Which one rhymes with cat? | Rhymes |
| 1724 | `q_r_bee.m4a` | Which one rhymes with bee? | Rhymes |
| 1725 | `q_r_car.m4a` | Which one rhymes with car? | Rhymes |
| 1726 | `q_r_frog.m4a` | Which one rhymes with frog? | Rhymes |
| 1727 | `q_r_cake.m4a` | Which one rhymes with cake? | Rhymes |
| 1728 | `q_r_goat.m4a` | Which one rhymes with goat? | Rhymes |
| 1729 | `q_r_bear.m4a` | Which one rhymes with bear? | Rhymes |
| 1730 | `q_r_mouse.m4a` | Which one rhymes with mouse? | Rhymes |
| 1731 | `q_r_moon.m4a` | Which one rhymes with moon? | Rhymes |
| 1732 | `q_r_king.m4a` | Which one rhymes with king? | Rhymes |
| 1733 | `q_r_fish.m4a` | Which one rhymes with fish? | Rhymes |
| 1734 | `q_plants.m4a` | What do plants need to grow? | Simple science |
| 1735 | `q_melt.m4a` | What happens to ice when it gets warm? | Simple science |
| 1736 | `q_magnet.m4a` | Which one sticks to a magnet? | Simple science |
| 1737 | `q_float.m4a` | Which one floats on water? | Simple science |
| 1738 | `q_rainfall.m4a` | What falls from rain clouds? | Simple science |
| 1739 | `q_seed.m4a` | A seed can grow into a... | Simple science |
| 1740 | `q_fire.m4a` | Which one is very hot? | Simple science |
| 1741 | `q_magnify.m4a` | Which tool helps you see tiny things up close? | Simple science |
| 1742 | `q_clock.m4a` | What do we use to tell the time? | Simple science |
| 1743 | `q_breathe.m4a` | What do we breathe in all day and all night? | Simple science |
| 1744 | `q_ocean.m4a` | What do we call a giant, salty water with big waves? | Maps & places |
| 1745 | `q_map.m4a` | What shows you where places are? | Maps & places |
| 1746 | `q_compass.m4a` | Which tool always points north? | Maps & places |
| 1747 | `q_mountain.m4a` | What is very, very tall land with a pointy top? | Maps & places |
| 1748 | `q_beach.m4a` | Where can you find lots of sand next to the water? | Maps & places |
| 1749 | `q_forest.m4a` | What place has lots and lots of trees? | Maps & places |
| 1750 | `q_desert.m4a` | Where is it very hot and dry, with lots of sand? | Maps & places |
| 1751 | `q_earthshape.m4a` | The Earth is round, like a... | Maps & places |
| 1752 | `q_city.m4a` | What do we call a big place with lots of buildings and streets? | Maps & places |
| 1753 | `q_penguinhome.m4a` | Many penguins live where it is very... | Maps & places |
| 1754 | `q_shadow.m4a` | What makes a shadow? | Simple science |
| 1755 | `q_vibrate.m4a` | When you pluck a guitar string, it shakes back and forth. That shaking makes... | Simple science |
| 1756 | `q_mirror.m4a` | What bounces light back so you can see yourself? | Simple science |
| 1757 | `q_roots.m4a` | Which part of a plant takes in water from the soil? | Simple science |
| 1758 | `q_leafsun.m4a` | Which part of a plant catches sunlight to make food? | Simple science |
| 1759 | `q_babylook.m4a` | Baby animals usually look a lot like... | Animals |
| 1760 | `q_sunrise.m4a` | In the morning, where does the Sun come up? | Space |
| 1761 | `q_moonphase.m4a` | The Moon seems to change shape during the month. What are these shapes called? | Space |
| 1762 | `q_longdays.m4a` | In which season are the days the longest? | Seasons & weather |
| 1763 | `q_turtlesafe.m4a` | How does a turtle stay safe from danger? | Animals |
| 1764 | `q_spines.m4a` | Which animal has sharp spines to keep it safe? | Animals |
| 1765 | `q_seedneeds.m4a` | What does a seed need to start growing? | Simple science |
| 1766 | `q_opaque.m4a` | Which one does NOT let light through? | Simple science |
| 1767 | `q_firefighter.m4a` | Who puts out fires in our town? | Maps & places |
| 1768 | `q_mailcarrier.m4a` | Who brings letters to your home? | Maps & places |
| 1769 | `q_needwant.m4a` | Which one is a NEED, something we must have to live? | Maps & places |
| 1770 | `q_mapkey.m4a` | On a map, the box that tells what each little picture means is called the... | Maps & places |
| 1771 | `q_globe.m4a` | What is a round model of the Earth called? | Maps & places |
| 1772 | `q_weekdays.m4a` | How many days are in one week? | Maps & places |
| 1773 | `q_aftermonday.m4a` | Which day comes right after Monday? | Maps & places |
| 1774 | `q_usflag.m4a` | The flag of the United States has stars and... | Maps & places |
| 1775 | `q_loudest.m4a` | Which one makes the loudest sound? | Simple science |
| 1776 | `q_hibernate.m4a` | Some bears sleep through the long winter. What is that called? | Animals |
| 1777 | `q_migrate.m4a` | Many birds fly to warmer places for the winter. What is that called? | Animals |
| 1778 | `q_planteater.m4a` | Which animal eats only plants? | Animals |
| 1779 | `q_camouflage.m4a` | A green frog sits on a green leaf. Why is its color helpful? | Animals |
| 1780 | `q_gills.m4a` | Fish breathe under water using their... | Animals |
| 1781 | `q_insectlegs.m4a` | How many legs does an insect have? | Animals |
| 1782 | `q_solid.m4a` | Which one is a solid? | Simple science |
| 1783 | `q_pulldrawer.m4a` | When you open a drawer toward you, you... | Simple science |
| 1784 | `q_wind.m4a` | What do we call moving air? | Seasons & weather |
| 1785 | `q_thermometer.m4a` | Which tool tells us how hot or cold it is? | Seasons & weather |
| 1786 | `q_recycle.m4a` | Putting old cans and paper in a special bin so they can be made into new things is called... | Maps & places |
| 1787 | `q_nocturnal.m4a` | Which animal sleeps in the day and is awake at night? | Animals |
| 1788 | `q_daystars.m4a` | Why can’t we see the stars in the daytime? | Space |
| 1789 | `q_earthspin.m4a` | Day and night happen because the Earth... | Space |
| 1790 | `q_healthysnack.m4a` | Which one is the healthiest snack? | My body |
| 1791 | `q_bones.m4a` | What hard parts inside your body hold you up? | My body |
| 1792 | `q_lungs.m4a` | What part of your body fills up with air when you breathe in? | My body |
| 1793 | `q_liquid.m4a` | Which one is a liquid? | Simple science |
| 1794 | `q_steam.m4a` | Steam rising from a hot pot is a... | Simple science |
| 1795 | `q_freezes.m4a` | When water gets very cold, it freezes and turns into... | Simple science |
| 1796 | `q_puddle.m4a` | A puddle dries up on a sunny day. Where did the water go? | Simple science |
| 1797 | `q_erosion.m4a` | Wind and water slowly wear away rocks and soil. This is called... | Maps & places |
| 1798 | `q_volcano.m4a` | Which kind of mountain can send out hot, melted rock? | Maps & places |
| 1799 | `q_continents.m4a` | How many continents are there on Earth? | Maps & places |
| 1800 | `q_uscontinent.m4a` | The United States is on which continent? | Maps & places |
| 1801 | `q_pacific.m4a` | Which one is an ocean? | Maps & places |
| 1802 | `q_desertanimal.m4a` | Which animal is best at living in the hot, dry desert? | Animals |
| 1803 | `q_arcticanimal.m4a` | Which animal lives on the cold Arctic ice? | Animals |
| 1804 | `q_pollen.m4a` | Bees help flowers make seeds by carrying... | Simple science |
| 1805 | `q_dandelion.m4a` | How do dandelion seeds travel to new places? | Simple science |
| 1806 | `q_butterflyegg.m4a` | What comes first in a butterfly’s life? | Animals |
| 1807 | `q_mammal.m4a` | Which animal is a mammal, with fur, that feeds its babies milk? | Animals |
| 1808 | `q_reptile.m4a` | Which animal is a reptile with dry, scaly skin? | Animals |
| 1809 | `q_amphibian.m4a` | Which animal starts life in water and later lives on land? | Animals |
| 1810 | `q_iron.m4a` | Which material does a magnet pull? | Simple science |
| 1811 | `q_months.m4a` | How many months are in one year? | Maps & places |
| 1812 | `q_aftermarch.m4a` | Which month comes right after March? | Maps & places |
| 1813 | `q_quarter.m4a` | Which coin is worth the most? | Maps & places |
| 1814 | `q_dime.m4a` | How many cents is a dime worth? | Maps & places |
| 1815 | `q_northup.m4a` | On most maps, which direction is at the top? | Maps & places |
| 1816 | `q_goods.m4a` | A baker makes bread to sell. Bread is a... | Maps & places |
| 1817 | `q_vote.m4a` | When people choose a leader by each picking one, they... | Maps & places |
| 1818 | `q_sunfood.m4a` | Plants make their own food using... | Simple science |
| 1819 | `q_chocolate.m4a` | What happens to chocolate when it gets hot? | Simple science |
| 1820 | `q_soundwaves.m4a` | Sound moves through the air as... | Simple science |
| 1821 | `q_island.m4a` | Land with water all around it is called... | Maps & places |
| 1822 | `q_fossil.m4a` | What do we call the remains of plants or animals from long ago, saved in rock? | Simple science |
| 1823 | `q_blood.m4a` | What does your heart pump all around your body? | My body |
| 1824 | `q_mercury.m4a` | Which planet is closest to the Sun? | Space |

## Bonus question answers (388) — later (388)

Say each answer on its own, brightly. They are read out as choices, and after "The answer is".

| # | File name | Say this | Note |
|---:|---|---|---|
| 1825 | `c_the_sun.m4a` | the Sun |  |
| 1826 | `c_earth.m4a` | Earth |  |
| 1827 | `c_saturn.m4a` | Saturn |  |
| 1828 | `c_mars.m4a` | Mars |  |
| 1829 | `c_the_moon.m4a` | the Moon |  |
| 1830 | `c_a_cloud.m4a` | a cloud |  |
| 1831 | `c_a_rocket.m4a` | a rocket |  |
| 1832 | `c_a_bus.m4a` | a bus |  |
| 1833 | `c_a_sailboat.m4a` | a sailboat |  |
| 1834 | `c_stars.m4a` | stars |  |
| 1835 | `c_a_rainbow.m4a` | a rainbow |  |
| 1836 | `c_butterflies.m4a` | butterflies |  |
| 1837 | `c_a_space_suit.m4a` | a space suit |  |
| 1838 | `c_a_swimsuit.m4a` | a swimsuit |  |
| 1839 | `c_a_raincoat.m4a` | a raincoat |  |
| 1840 | `c_star.m4a` | star |  |
| 1841 | `c_moon.m4a` | moon |  |
| 1842 | `c_cloud.m4a` | cloud |  |
| 1843 | `c_a_cow.m4a` | a cow |  |
| 1844 | `c_a_cat.m4a` | a cat |  |
| 1845 | `c_a_duck.m4a` | a duck |  |
| 1846 | `c_a_dog.m4a` | a dog |  |
| 1847 | `c_a_pig.m4a` | a pig |  |
| 1848 | `c_a_sheep.m4a` | a sheep |  |
| 1849 | `c_a_lion.m4a` | a lion |  |
| 1850 | `c_a_mouse.m4a` | a mouse |  |
| 1851 | `c_a_giraffe.m4a` | a giraffe |  |
| 1852 | `c_a_frog.m4a` | a frog |  |
| 1853 | `c_an_elephant.m4a` | an elephant |  |
| 1854 | `c_a_zebra.m4a` | a zebra |  |
| 1855 | `c_a_bird.m4a` | a bird |  |
| 1856 | `c_a_fish.m4a` | a fish |  |
| 1857 | `c_a_turtle.m4a` | a turtle |  |
| 1858 | `c_a_horse.m4a` | a horse |  |
| 1859 | `c_a_rabbit.m4a` | a rabbit |  |
| 1860 | `c_dog.m4a` | dog |  |
| 1861 | `c_cat.m4a` | cat |  |
| 1862 | `c_cow.m4a` | cow |  |
| 1863 | `c_horse.m4a` | horse |  |
| 1864 | `c_frog.m4a` | frog |  |
| 1865 | `c_fish.m4a` | fish |  |
| 1866 | `c_duck.m4a` | duck |  |
| 1867 | `c_butterfly.m4a` | butterfly |  |
| 1868 | `c_spider.m4a` | spider |  |
| 1869 | `c_snail.m4a` | snail |  |
| 1870 | `c_a_kangaroo.m4a` | a kangaroo |  |
| 1871 | `c_a_chicken.m4a` | a chicken |  |
| 1872 | `c_a_spider.m4a` | a spider |  |
| 1873 | `c_an_ant.m4a` | an ant |  |
| 1874 | `c_a_bee.m4a` | a bee |  |
| 1875 | `c_a_butterfly.m4a` | a butterfly |  |
| 1876 | `c_a_whale.m4a` | a whale |  |
| 1877 | `c_a_penguin.m4a` | a penguin |  |
| 1878 | `c_a_parrot.m4a` | a parrot |  |
| 1879 | `c_an_owl.m4a` | an owl |  |
| 1880 | `c_blue.m4a` | blue |  |
| 1881 | `c_green.m4a` | green |  |
| 1882 | `c_red.m4a` | red |  |
| 1883 | `c_purple.m4a` | purple |  |
| 1884 | `c_orange.m4a` | orange |  |
| 1885 | `c_yellow.m4a` | yellow |  |
| 1886 | `c_white.m4a` | white |  |
| 1887 | `c_black.m4a` | black |  |
| 1888 | `c_a_triangle.m4a` | a triangle |  |
| 1889 | `c_a_circle.m4a` | a circle |  |
| 1890 | `c_a_square.m4a` | a square |  |
| 1891 | `c_four.m4a` | four |  |
| 1892 | `c_three.m4a` | three |  |
| 1893 | `c_six.m4a` | six |  |
| 1894 | `c_a_star.m4a` | a star |  |
| 1895 | `c_the_heart.m4a` | the heart |  |
| 1896 | `c_the_star.m4a` | the star |  |
| 1897 | `c_the_circle.m4a` | the circle |  |
| 1898 | `c_fall.m4a` | fall |  |
| 1899 | `c_summer.m4a` | summer |  |
| 1900 | `c_spring.m4a` | spring |  |
| 1901 | `c_winter.m4a` | winter |  |
| 1902 | `c_an_umbrella.m4a` | an umbrella |  |
| 1903 | `c_sunglasses.m4a` | sunglasses |  |
| 1904 | `c_mittens.m4a` | mittens |  |
| 1905 | `c_a_snowman.m4a` | a snowman |  |
| 1906 | `c_sandals.m4a` | sandals |  |
| 1907 | `c_shorts.m4a` | shorts |  |
| 1908 | `c_lightning.m4a` | lightning |  |
| 1909 | `c_ice.m4a` | ice |  |
| 1910 | `c_sugar.m4a` | sugar |  |
| 1911 | `c_paper.m4a` | paper |  |
| 1912 | `c_a_beach.m4a` | a beach |  |
| 1913 | `c_a_sunflower.m4a` | a sunflower |  |
| 1914 | `c_your_eyes.m4a` | your eyes |  |
| 1915 | `c_your_ears.m4a` | your ears |  |
| 1916 | `c_your_nose.m4a` | your nose |  |
| 1917 | `c_your_hands.m4a` | your hands |  |
| 1918 | `c_your_feet.m4a` | your feet |  |
| 1919 | `c_five.m4a` | five |  |
| 1920 | `c_ten.m4a` | ten |  |
| 1921 | `c_your_teeth.m4a` | your teeth |  |
| 1922 | `c_your_heart.m4a` | your heart |  |
| 1923 | `c_your_foot.m4a` | your foot |  |
| 1924 | `c_your_brain.m4a` | your brain |  |
| 1925 | `c_your_leg.m4a` | your leg |  |
| 1926 | `c_your_ear.m4a` | your ear |  |
| 1927 | `c_wash_your_hands.m4a` | wash your hands |  |
| 1928 | `c_take_a_nap.m4a` | take a nap |  |
| 1929 | `c_hop_like_a_kangaroo.m4a` | hop like a kangaroo |  |
| 1930 | `c_two.m4a` | two |  |
| 1931 | `c_an_apple.m4a` | an apple |  |
| 1932 | `c_a_carrot.m4a` | a carrot |  |
| 1933 | `c_bread.m4a` | bread |  |
| 1934 | `c_a_banana.m4a` | a banana |  |
| 1935 | `c_ice_cream.m4a` | ice cream |  |
| 1936 | `c_soup.m4a` | soup |  |
| 1937 | `c_toast.m4a` | toast |  |
| 1938 | `c_a_potato.m4a` | a potato |  |
| 1939 | `c_cheese.m4a` | cheese |  |
| 1940 | `c_grapes.m4a` | grapes |  |
| 1941 | `c_a_strawberry.m4a` | a strawberry |  |
| 1942 | `c_corn.m4a` | corn |  |
| 1943 | `c_apples.m4a` | apples |  |
| 1944 | `c_carrots.m4a` | carrots |  |
| 1945 | `c_honey.m4a` | honey |  |
| 1946 | `c_an_orange.m4a` | an orange |  |
| 1947 | `c_cold.m4a` | cold |  |
| 1948 | `c_sunny.m4a` | sunny |  |
| 1949 | `c_loud.m4a` | loud |  |
| 1950 | `c_small.m4a` | small |  |
| 1951 | `c_tall.m4a` | tall |  |
| 1952 | `c_fast.m4a` | fast |  |
| 1953 | `c_down.m4a` | down |  |
| 1954 | `c_left.m4a` | left |  |
| 1955 | `c_right.m4a` | right |  |
| 1956 | `c_night.m4a` | night |  |
| 1957 | `c_morning.m4a` | morning |  |
| 1958 | `c_lunch.m4a` | lunch |  |
| 1959 | `c_sad.m4a` | sad |  |
| 1960 | `c_silly.m4a` | silly |  |
| 1961 | `c_sleepy.m4a` | sleepy |  |
| 1962 | `c_slow.m4a` | slow |  |
| 1963 | `c_closed.m4a` | closed |  |
| 1964 | `c_dry.m4a` | dry |  |
| 1965 | `c_quiet.m4a` | quiet |  |
| 1966 | `c_the_carrot.m4a` | the carrot |  |
| 1967 | `c_the_apple.m4a` | the apple |  |
| 1968 | `c_the_banana.m4a` | the banana |  |
| 1969 | `c_the_grapes.m4a` | the grapes |  |
| 1970 | `c_the_car.m4a` | the car |  |
| 1971 | `c_the_cat.m4a` | the cat |  |
| 1972 | `c_the_dog.m4a` | the dog |  |
| 1973 | `c_the_cow.m4a` | the cow |  |
| 1974 | `c_the_spoon.m4a` | the spoon |  |
| 1975 | `c_the_sock.m4a` | the sock |  |
| 1976 | `c_the_sneaker.m4a` | the sneaker |  |
| 1977 | `c_the_boot.m4a` | the boot |  |
| 1978 | `c_the_fish.m4a` | the fish |  |
| 1979 | `c_the_bird.m4a` | the bird |  |
| 1980 | `c_the_airplane.m4a` | the airplane |  |
| 1981 | `c_the_butterfly.m4a` | the butterfly |  |
| 1982 | `c_the_teddy_bear.m4a` | the teddy bear |  |
| 1983 | `c_the_tree.m4a` | the tree |  |
| 1984 | `c_the_frog.m4a` | the frog |  |
| 1985 | `c_the_bee.m4a` | the bee |  |
| 1986 | `c_the_pizza.m4a` | the pizza |  |
| 1987 | `c_the_cheese.m4a` | the cheese |  |
| 1988 | `c_the_lion.m4a` | the lion |  |
| 1989 | `c_the_octopus.m4a` | the octopus |  |
| 1990 | `c_the_whale.m4a` | the whale |  |
| 1991 | `c_the_sailboat.m4a` | the sailboat |  |
| 1992 | `c_the_bike.m4a` | the bike |  |
| 1993 | `c_the_bus.m4a` | the bus |  |
| 1994 | `c_the_hammer.m4a` | the hammer |  |
| 1995 | `c_the_drum.m4a` | the drum |  |
| 1996 | `c_the_guitar.m4a` | the guitar |  |
| 1997 | `c_the_trumpet.m4a` | the trumpet |  |
| 1998 | `c_hat.m4a` | hat |  |
| 1999 | `c_sun.m4a` | sun |  |
| 2000 | `c_tree.m4a` | tree |  |
| 2001 | `c_bus.m4a` | bus |  |
| 2002 | `c_bird.m4a` | bird |  |
| 2003 | `c_snake.m4a` | snake |  |
| 2004 | `c_apple.m4a` | apple |  |
| 2005 | `c_drum.m4a` | drum |  |
| 2006 | `c_boat.m4a` | boat |  |
| 2007 | `c_sheep.m4a` | sheep |  |
| 2008 | `c_chair.m4a` | chair |  |
| 2009 | `c_bed.m4a` | bed |  |
| 2010 | `c_shoe.m4a` | shoe |  |
| 2011 | `c_house.m4a` | house |  |
| 2012 | `c_spoon.m4a` | spoon |  |
| 2013 | `c_ring.m4a` | ring |  |
| 2014 | `c_crown.m4a` | crown |  |
| 2015 | `c_castle.m4a` | castle |  |
| 2016 | `c_dish.m4a` | dish |  |
| 2017 | `c_fork.m4a` | fork |  |
| 2018 | `c_cup.m4a` | cup |  |
| 2019 | `c_water.m4a` | water |  |
| 2020 | `c_candy.m4a` | candy |  |
| 2021 | `c_toys.m4a` | toys |  |
| 2022 | `c_it_melts.m4a` | it melts |  |
| 2023 | `c_it_gets_colder.m4a` | it gets colder |  |
| 2024 | `c_it_bounces.m4a` | it bounces |  |
| 2025 | `c_a_paper_clip.m4a` | a paper clip |  |
| 2026 | `c_a_teddy_bear.m4a` | a teddy bear |  |
| 2027 | `c_a_boat.m4a` | a boat |  |
| 2028 | `c_a_key.m4a` | a key |  |
| 2029 | `c_a_hammer.m4a` | a hammer |  |
| 2030 | `c_leaves.m4a` | leaves |  |
| 2031 | `c_plant.m4a` | plant |  |
| 2032 | `c_car.m4a` | car |  |
| 2033 | `c_fire.m4a` | fire |  |
| 2034 | `c_a_magnifying_glass.m4a` | a magnifying glass |  |
| 2035 | `c_a_spoon.m4a` | a spoon |  |
| 2036 | `c_a_sock.m4a` | a sock |  |
| 2037 | `c_a_clock.m4a` | a clock |  |
| 2038 | `c_a_sneaker.m4a` | a sneaker |  |
| 2039 | `c_air.m4a` | air |  |
| 2040 | `c_juice.m4a` | juice |  |
| 2041 | `c_sand.m4a` | sand |  |
| 2042 | `c_the_ocean.m4a` | the ocean |  |
| 2043 | `c_a_puddle.m4a` | a puddle |  |
| 2044 | `c_a_cup.m4a` | a cup |  |
| 2045 | `c_a_map.m4a` | a map |  |
| 2046 | `c_a_compass.m4a` | a compass |  |
| 2047 | `c_a_mountain.m4a` | a mountain |  |
| 2048 | `c_a_forest.m4a` | a forest |  |
| 2049 | `c_a_desert.m4a` | a desert |  |
| 2050 | `c_an_iceberg.m4a` | an iceberg |  |
| 2051 | `c_ball.m4a` | ball |  |
| 2052 | `c_box.m4a` | box |  |
| 2053 | `c_triangle.m4a` | triangle |  |
| 2054 | `c_a_city.m4a` | a city |  |
| 2055 | `c_an_ocean.m4a` | an ocean |  |
| 2056 | `c_hot.m4a` | hot |  |
| 2057 | `c_something_blocking_the_light.m4a` | something blocking the light |  |
| 2058 | `c_water_on_the_ground.m4a` | water on the ground |  |
| 2059 | `c_a_loud_sound.m4a` | a loud sound |  |
| 2060 | `c_sound.m4a` | sound |  |
| 2061 | `c_light.m4a` | light |  |
| 2062 | `c_snow.m4a` | snow |  |
| 2063 | `c_a_mirror.m4a` | a mirror |  |
| 2064 | `c_a_brick.m4a` | a brick |  |
| 2065 | `c_the_roots.m4a` | the roots |  |
| 2066 | `c_the_flower.m4a` | the flower |  |
| 2067 | `c_the_fruit.m4a` | the fruit |  |
| 2068 | `c_the_leaves.m4a` | the leaves |  |
| 2069 | `c_the_seed.m4a` | the seed |  |
| 2070 | `c_their_parents.m4a` | their parents |  |
| 2071 | `c_rocks.m4a` | rocks |  |
| 2072 | `c_clouds.m4a` | clouds |  |
| 2073 | `c_in_the_east.m4a` | in the east |  |
| 2074 | `c_in_the_west.m4a` | in the west |  |
| 2075 | `c_in_the_north.m4a` | in the north |  |
| 2076 | `c_phases.m4a` | phases |  |
| 2077 | `c_rainbows.m4a` | rainbows |  |
| 2078 | `c_snowflakes.m4a` | snowflakes |  |
| 2079 | `c_it_hides_in_its_shell.m4a` | it hides in its shell |  |
| 2080 | `c_it_flies_away.m4a` | it flies away |  |
| 2081 | `c_it_climbs_a_tree.m4a` | it climbs a tree |  |
| 2082 | `c_a_hedgehog.m4a` | a hedgehog |  |
| 2083 | `c_water_and_warmth.m4a` | water and warmth |  |
| 2084 | `c_ice_and_snow.m4a` | ice and snow |  |
| 2085 | `c_rocks_and_sand.m4a` | rocks and sand |  |
| 2086 | `c_a_brick_wall.m4a` | a brick wall |  |
| 2087 | `c_a_clear_window.m4a` | a clear window |  |
| 2088 | `c_clear_water.m4a` | clear water |  |
| 2089 | `c_firefighters.m4a` | firefighters |  |
| 2090 | `c_cooks.m4a` | cooks |  |
| 2091 | `c_farmers.m4a` | farmers |  |
| 2092 | `c_a_mail_carrier.m4a` | a mail carrier |  |
| 2093 | `c_a_doctor.m4a` | a doctor |  |
| 2094 | `c_a_chef.m4a` | a chef |  |
| 2095 | `c_a_video_game.m4a` | a video game |  |
| 2096 | `c_a_lollipop.m4a` | a lollipop |  |
| 2097 | `c_map_key.m4a` | map key |  |
| 2098 | `c_map_door.m4a` | map door |  |
| 2099 | `c_map_cap.m4a` | map cap |  |
| 2100 | `c_a_globe.m4a` | a globe |  |
| 2101 | `c_a_book.m4a` | a book |  |
| 2102 | `c_a_balloon.m4a` | a balloon |  |
| 2103 | `c_seven.m4a` | seven |  |
| 2104 | `c_tuesday.m4a` | Tuesday |  |
| 2105 | `c_sunday.m4a` | Sunday |  |
| 2106 | `c_friday.m4a` | Friday |  |
| 2107 | `c_stripes.m4a` | stripes |  |
| 2108 | `c_circles.m4a` | circles |  |
| 2109 | `c_triangles.m4a` | triangles |  |
| 2110 | `c_a_big_drum.m4a` | a big drum |  |
| 2111 | `c_a_feather_falling.m4a` | a feather falling |  |
| 2112 | `c_an_ant_walking.m4a` | an ant walking |  |
| 2113 | `c_hibernating.m4a` | hibernating |  |
| 2114 | `c_swimming.m4a` | swimming |  |
| 2115 | `c_singing.m4a` | singing |  |
| 2116 | `c_migrating.m4a` | migrating |  |
| 2117 | `c_napping.m4a` | napping |  |
| 2118 | `c_eating.m4a` | eating |  |
| 2119 | `c_a_shark.m4a` | a shark |  |
| 2120 | `c_it_is_hard_to_see.m4a` | it is hard to see |  |
| 2121 | `c_it_is_loud.m4a` | it is loud |  |
| 2122 | `c_it_stays_cold.m4a` | it stays cold |  |
| 2123 | `c_gills.m4a` | gills |  |
| 2124 | `c_ears.m4a` | ears |  |
| 2125 | `c_feet.m4a` | feet |  |
| 2126 | `c_eight.m4a` | eight |  |
| 2127 | `c_milk.m4a` | milk |  |
| 2128 | `c_steam.m4a` | steam |  |
| 2129 | `c_pull_it.m4a` | pull it |  |
| 2130 | `c_push_it.m4a` | push it |  |
| 2131 | `c_pop_it.m4a` | pop it |  |
| 2132 | `c_wind.m4a` | wind |  |
| 2133 | `c_rain.m4a` | rain |  |
| 2134 | `c_a_thermometer.m4a` | a thermometer |  |
| 2135 | `c_a_ruler.m4a` | a ruler |  |
| 2136 | `c_recycling.m4a` | recycling |  |
| 2137 | `c_painting.m4a` | painting |  |
| 2138 | `c_resting.m4a` | resting |  |
| 2139 | `c_the_sun_is_too_bright.m4a` | the Sun is too bright |  |
| 2140 | `c_the_stars_go_away.m4a` | the stars go away |  |
| 2141 | `c_the_moon_hides_them.m4a` | the Moon hides them |  |
| 2142 | `c_spins_around.m4a` | spins around |  |
| 2143 | `c_gets_cold.m4a` | gets cold |  |
| 2144 | `c_gets_rainy.m4a` | gets rainy |  |
| 2145 | `c_a_donut.m4a` | a donut |  |
| 2146 | `c_your_bones.m4a` | your bones |  |
| 2147 | `c_your_hair.m4a` | your hair |  |
| 2148 | `c_your_nails.m4a` | your nails |  |
| 2149 | `c_your_lungs.m4a` | your lungs |  |
| 2150 | `c_a_rock.m4a` | a rock |  |
| 2151 | `c_an_ice_cube.m4a` | an ice cube |  |
| 2152 | `c_gas.m4a` | gas |  |
| 2153 | `c_solid.m4a` | solid |  |
| 2154 | `c_liquid.m4a` | liquid |  |
| 2155 | `c_into_the_air.m4a` | into the air |  |
| 2156 | `c_into_a_rock.m4a` | into a rock |  |
| 2157 | `c_to_the_moon.m4a` | to the Moon |  |
| 2158 | `c_erosion.m4a` | erosion |  |
| 2159 | `c_an_eruption.m4a` | an eruption |  |
| 2160 | `c_a_volcano.m4a` | a volcano |  |
| 2161 | `c_a_snowy_hill.m4a` | a snowy hill |  |
| 2162 | `c_a_sand_dune.m4a` | a sand dune |  |
| 2163 | `c_north_america.m4a` | North America |  |
| 2164 | `c_africa.m4a` | Africa |  |
| 2165 | `c_asia.m4a` | Asia |  |
| 2166 | `c_the_pacific.m4a` | the Pacific |  |
| 2167 | `c_the_rockies.m4a` | the Rockies |  |
| 2168 | `c_the_sahara.m4a` | the Sahara |  |
| 2169 | `c_a_camel.m4a` | a camel |  |
| 2170 | `c_a_polar_bear.m4a` | a polar bear |  |
| 2171 | `c_pollen.m4a` | pollen |  |
| 2172 | `c_pebbles.m4a` | pebbles |  |
| 2173 | `c_the_wind_blows_them.m4a` | the wind blows them |  |
| 2174 | `c_they_walk.m4a` | they walk |  |
| 2175 | `c_they_swim.m4a` | they swim |  |
| 2176 | `c_an_egg.m4a` | an egg |  |
| 2177 | `c_a_caterpillar.m4a` | a caterpillar |  |
| 2178 | `c_a_snake.m4a` | a snake |  |
| 2179 | `c_a_crocodile.m4a` | a crocodile |  |
| 2180 | `c_iron.m4a` | iron |  |
| 2181 | `c_wood.m4a` | wood |  |
| 2182 | `c_twelve.m4a` | twelve |  |
| 2183 | `c_april.m4a` | April |  |
| 2184 | `c_january.m4a` | January |  |
| 2185 | `c_october.m4a` | October |  |
| 2186 | `c_a_quarter.m4a` | a quarter |  |
| 2187 | `c_a_penny.m4a` | a penny |  |
| 2188 | `c_a_nickel.m4a` | a nickel |  |
| 2189 | `c_10_cents.m4a` | 10 cents |  |
| 2190 | `c_5_cents.m4a` | 5 cents |  |
| 2191 | `c_1_cent.m4a` | 1 cent |  |
| 2192 | `c_north.m4a` | north |  |
| 2193 | `c_south.m4a` | south |  |
| 2194 | `c_east.m4a` | east |  |
| 2195 | `c_good.m4a` | good |  |
| 2196 | `c_service.m4a` | service |  |
| 2197 | `c_vote.m4a` | vote |  |
| 2198 | `c_nap.m4a` | nap |  |
| 2199 | `c_paint.m4a` | paint |  |
| 2200 | `c_sunlight.m4a` | sunlight |  |
| 2201 | `c_salt.m4a` | salt |  |
| 2202 | `c_moonlight.m4a` | moonlight |  |
| 2203 | `c_it_freezes.m4a` | it freezes |  |
| 2204 | `c_it_glows.m4a` | it glows |  |
| 2205 | `c_vibrations.m4a` | vibrations |  |
| 2206 | `c_colors.m4a` | colors |  |
| 2207 | `c_an_island.m4a` | an island |  |
| 2208 | `c_fossils.m4a` | fossils |  |
| 2209 | `c_seeds.m4a` | seeds |  |
| 2210 | `c_blood.m4a` | blood |  |
| 2211 | `c_food.m4a` | food |  |
| 2212 | `c_mercury.m4a` | Mercury |  |

## Tiny Picnic (toddler mode) — record first (66)

Slow, warm and simple, for a 2-year-old. Prompts, gentle "that's a ..." lines for any tap, and cheers.

| # | File name | Say this | Note |
|---:|---|---|---|
| 2213 | `tp_title.m4a` | Tiny Picnic! |  |
| 2214 | `tp_hello.m4a` | Tiny Picnic! Let's play! |  |
| 2215 | `tp_match.m4a` | Find the same one! |  |
| 2216 | `tp_yay_1.m4a` | Yay! You found it! |  |
| 2217 | `tp_yay_2.m4a` | Great job! |  |
| 2218 | `tp_yay_3.m4a` | Hooray! |  |
| 2219 | `tp_yay_4.m4a` | You did it! |  |
| 2220 | `tp_done.m4a` | Hooray! What a great picnic! |  |
| 2221 | `tp_again.m4a` | Play again? |  |
| 2222 | `tp_home.m4a` | Bye bye, picnic! |  |
| 2223 | `tp_find_strawberry.m4a` | Find the strawberry! |  |
| 2224 | `tp_is_strawberry.m4a` | That's a strawberry! |  |
| 2225 | `tp_find_apple.m4a` | Find the apple! |  |
| 2226 | `tp_is_apple.m4a` | That's an apple! |  |
| 2227 | `tp_find_banana.m4a` | Find the banana! |  |
| 2228 | `tp_is_banana.m4a` | That's a banana! |  |
| 2229 | `tp_find_corn.m4a` | Find the corn! |  |
| 2230 | `tp_is_corn.m4a` | That's corn! |  |
| 2231 | `tp_find_lemon.m4a` | Find the lemon! |  |
| 2232 | `tp_is_lemon.m4a` | That's a lemon! |  |
| 2233 | `tp_find_blueberry.m4a` | Find the blueberry! |  |
| 2234 | `tp_is_blueberry.m4a` | That's a blueberry! |  |
| 2235 | `tp_find_carrot.m4a` | Find the carrot! |  |
| 2236 | `tp_is_carrot.m4a` | That's a carrot! |  |
| 2237 | `tp_find_broccoli.m4a` | Find the broccoli! |  |
| 2238 | `tp_is_broccoli.m4a` | That's broccoli! |  |
| 2239 | `tp_find_pear.m4a` | Find the pear! |  |
| 2240 | `tp_is_pear.m4a` | That's a pear! |  |
| 2241 | `tp_find_grapes.m4a` | Find the grapes! |  |
| 2242 | `tp_is_grapes.m4a` | Those are grapes! |  |
| 2243 | `tp_find_watermelon.m4a` | Find the watermelon! |  |
| 2244 | `tp_is_watermelon.m4a` | That's a watermelon! |  |
| 2245 | `tp_find_pineapple.m4a` | Find the pineapple! |  |
| 2246 | `tp_is_pineapple.m4a` | That's a pineapple! |  |
| 2247 | `tp_find_cupcake.m4a` | Find the cupcake! |  |
| 2248 | `tp_is_cupcake.m4a` | That's a cupcake! |  |
| 2249 | `tp_find_cookie.m4a` | Find the cookie! |  |
| 2250 | `tp_is_cookie.m4a` | That's a cookie! |  |
| 2251 | `tp_find_circle.m4a` | Find the circle! |  |
| 2252 | `tp_is_circle.m4a` | That's a circle! |  |
| 2253 | `tp_find_square.m4a` | Find the square! |  |
| 2254 | `tp_is_square.m4a` | That's a square! |  |
| 2255 | `tp_find_triangle.m4a` | Find the triangle! |  |
| 2256 | `tp_is_triangle.m4a` | That's a triangle! |  |
| 2257 | `tp_find_star.m4a` | Find the star! |  |
| 2258 | `tp_is_star.m4a` | That's a star! |  |
| 2259 | `tp_find_heart.m4a` | Find the heart! |  |
| 2260 | `tp_is_heart.m4a` | That's a heart! |  |
| 2261 | `tp_color_red.m4a` | Which one is red? |  |
| 2262 | `tp_c_red.m4a` | That's red! |  |
| 2263 | `tp_color_yellow.m4a` | Which one is yellow? |  |
| 2264 | `tp_c_yellow.m4a` | That's yellow! |  |
| 2265 | `tp_color_blue.m4a` | Which one is blue? |  |
| 2266 | `tp_c_blue.m4a` | That's blue! |  |
| 2267 | `tp_color_green.m4a` | Which one is green? |  |
| 2268 | `tp_c_green.m4a` | That's green! |  |
| 2269 | `tp_color_orange.m4a` | Which one is orange? |  |
| 2270 | `tp_c_orange.m4a` | That's orange! |  |
| 2271 | `tp_color_purple.m4a` | Which one is purple? |  |
| 2272 | `tp_c_purple.m4a` | That's purple! |  |
| 2273 | `tp_count_1.m4a` | Find one! |  |
| 2274 | `tp_n_1.m4a` | That's one! |  |
| 2275 | `tp_count_2.m4a` | Find two! |  |
| 2276 | `tp_n_2.m4a` | That's two! |  |
| 2277 | `tp_count_3.m4a` | Find three! |  |
| 2278 | `tp_n_3.m4a` | That's three! |  |

## Play-time limit & stretch breaks — record first (3)

Calm and kind. Said at a natural stopping point, never mid-question.

| # | File name | Say this | Note |
|---:|---|---|---|
| 2279 | `pt_stop.m4a` | Great stopping point! You played so well today. Time to rest. |  |
| 2280 | `pt_bye.m4a` | Bye bye! See you next time! |  |
| 2281 | `pt_stretch.m4a` | Time for a stretch! Reach up high, wiggle your fingers, and take a big breath. |  |

## Number steps (counting, facts to 20) — record first (20)

Read by the device voice until recorded (v2p2a). Warm and simple.

| # | File name | Say this | Note |
|---:|---|---|---|
| 2282 | `st_speedy.m4a` | Speedy! You know this one. Let's skip ahead! | After 5 fast right answers in a row on a step: the kid jumps to the next step |
| 2283 | `st_warmup.m4a` | Warm-up time! Just a few quick ones. | Before a new number ladder: about 6 quick picks |
| 2284 | `st_how_many.m4a` | How many? |  |
| 2285 | `st_find.m4a` | Find | + number, e.g. "Find" + "14" |
| 2286 | `st_what_next.m4a` | What comes next? |  |
| 2287 | `st_what_before.m4a` | What comes before? |  |
| 2288 | `st_whats_missing.m4a` | Which number is missing? |  |
| 2289 | `st_one_more.m4a` | One more comes! How many now? | After a number, e.g. "3" + this line |
| 2290 | `st_one_less.m4a` | Jammy eats one. How many now? | After a number, e.g. "5" + this line |
| 2291 | `st_one_more_than.m4a` | What is one more than | + number |
| 2292 | `st_one_less_than.m4a` | What is one less than | + number |
| 2293 | `st_which_more.m4a` | Which has more? |  |
| 2294 | `st_bigger.m4a` | Which number is bigger? |  |
| 2295 | `st_same.m4a` | They are the same! |  |
| 2296 | `st_fill5.m4a` | How many more to fill it? | Make 5: a five-frame with some dots |
| 2297 | `st_two_make5.m4a` | Which two plates make five dots? | Make 5: pictures only |
| 2298 | `st_back_up.m4a` | Great job! Now back to your step. | After a short, easier round |
| 2299 | `st_new_step.m4a` | A new step! |  |
| 2300 | `st_intro_pk.m4a` | Let's count and find numbers! | First counting step |
| 2301 | `st_intro_e20.m4a` | Adding and taking away to twenty! Let's go! | First step of the facts to 20 |

## Topic questions (animals, colors & shapes, seasons & weather, letters) — later (622)

Read by the device voice until recorded (v2p2b). Generated from the spec; edit the spec, then re-run tools/build-topics.js.

| # | File name | Say this | Note |
|---:|---|---|---|
| 2302 | `tq_an_t1_1.m4a` | Who says moo? | Animals / Animal sounds (T) |
| 2303 | `tw_cow.m4a` | cow | topic answer word |
| 2304 | `tw_dog.m4a` | dog | topic answer word |
| 2305 | `tq_an_t1_2.m4a` | Who says woof? | Animals / Animal sounds (T) |
| 2306 | `tw_cat.m4a` | cat | topic answer word |
| 2307 | `tq_an_t1_3.m4a` | Who says meow? | Animals / Animal sounds (T) |
| 2308 | `tw_duck.m4a` | duck | topic answer word |
| 2309 | `tq_an_t1_4.m4a` | Who says quack? | Animals / Animal sounds (T) |
| 2310 | `tq_an_t1_5.m4a` | Who says baa? | Animals / Animal sounds (T) |
| 2311 | `tw_sheep.m4a` | sheep | topic answer word |
| 2312 | `tw_pig.m4a` | pig | topic answer word |
| 2313 | `tq_an_t1_6.m4a` | Who says oink? | Animals / Animal sounds (T) |
| 2314 | `tw_horse.m4a` | horse | topic answer word |
| 2315 | `tq_an_t1_7.m4a` | Who says neigh? | Animals / Animal sounds (T) |
| 2316 | `tq_an_t1_8.m4a` | Who says roar? | Animals / Animal sounds (T) |
| 2317 | `tw_lion.m4a` | lion | topic answer word |
| 2318 | `tq_an_t1_9.m4a` | Who says hiss? | Animals / Animal sounds (T) |
| 2319 | `tw_snake.m4a` | snake | topic answer word |
| 2320 | `tq_an_t1_10.m4a` | Who says cluck? | Animals / Animal sounds (T) |
| 2321 | `tw_chicken.m4a` | chicken | topic answer word |
| 2322 | `tq_an_t2_1.m4a` | Find the dog | Animals / Find the animal (T) |
| 2323 | `tq_an_t2_2.m4a` | Find the fish | Animals / Find the animal (T) |
| 2324 | `tq_an_t2_3.m4a` | Find the bird | Animals / Find the animal (T) |
| 2325 | `tq_an_t2_4.m4a` | Find the cat | Animals / Find the animal (T) |
| 2326 | `tq_an_t2_5.m4a` | Find the elephant | Animals / Find the animal (T) |
| 2327 | `tq_an_t2_6.m4a` | Find the frog | Animals / Find the animal (T) |
| 2328 | `tq_an_t2_7.m4a` | Find the bunny | Animals / Find the animal (T) |
| 2329 | `tq_an_t2_8.m4a` | Find the bear | Animals / Find the animal (T) |
| 2330 | `tq_an_t2_9.m4a` | Find the monkey | Animals / Find the animal (T) |
| 2331 | `tq_an_t2_10.m4a` | Find the duck | Animals / Find the animal (T) |
| 2332 | `tq_an_t3_1.m4a` | Which one is big? | Animals / Big or little (T) |
| 2333 | `tq_an_t3_2.m4a` | Which one is little? | Animals / Big or little (T) |
| 2334 | `tq_an_t3_3.m4a` | Which one is big? | Animals / Big or little (T) |
| 2335 | `tq_an_t3_4.m4a` | Which one is little? | Animals / Big or little (T) |
| 2336 | `tq_an_t3_5.m4a` | Which one is big? | Animals / Big or little (T) |
| 2337 | `tq_an_t3_6.m4a` | Which one is little? | Animals / Big or little (T) |
| 2338 | `tq_an_t3_7.m4a` | Which one is big? | Animals / Big or little (T) |
| 2339 | `tq_an_t3_8.m4a` | Which one is little? | Animals / Big or little (T) |
| 2340 | `tq_an_t3_9.m4a` | Which one is big? | Animals / Big or little (T) |
| 2341 | `tq_an_t3_10.m4a` | Which one is little? | Animals / Big or little (T) |
| 2342 | `tq_an_p1_1.m4a` | A puppy grows up to be a... | Animals / Baby animals (P) |
| 2343 | `tq_an_p1_2.m4a` | A kitten grows up to be a... | Animals / Baby animals (P) |
| 2344 | `tq_an_p1_3.m4a` | A calf grows up to be a... | Animals / Baby animals (P) |
| 2345 | `tq_an_p1_4.m4a` | A chick grows up to be a... | Animals / Baby animals (P) |
| 2346 | `tw_owl.m4a` | owl | topic answer word |
| 2347 | `tq_an_p1_5.m4a` | A duckling grows up to be a... | Animals / Baby animals (P) |
| 2348 | `tw_frog.m4a` | frog | topic answer word |
| 2349 | `tq_an_p1_6.m4a` | A lamb grows up to be a... | Animals / Baby animals (P) |
| 2350 | `tw_goat.m4a` | goat | topic answer word |
| 2351 | `tq_an_p1_7.m4a` | A piglet grows up to be a... | Animals / Baby animals (P) |
| 2352 | `tq_an_p1_8.m4a` | A foal grows up to be a... | Animals / Baby animals (P) |
| 2353 | `tw_deer.m4a` | deer | topic answer word |
| 2354 | `tq_an_p1_9.m4a` | A joey grows up to be a... | Animals / Baby animals (P) |
| 2355 | `tw_kangaroo.m4a` | kangaroo | topic answer word |
| 2356 | `tw_bear.m4a` | bear | topic answer word |
| 2357 | `tw_rabbit.m4a` | rabbit | topic answer word |
| 2358 | `tq_an_p1_10.m4a` | A tadpole grows up to be a... | Animals / Baby animals (P) |
| 2359 | `tw_fish.m4a` | fish | topic answer word |
| 2360 | `tq_an_p2_1.m4a` | How does a fish move? | Animals / Fly, swim or walk (P) |
| 2361 | `tw_swim.m4a` | swim | topic answer word |
| 2362 | `tw_fly.m4a` | fly | topic answer word |
| 2363 | `tw_walk.m4a` | walk | topic answer word |
| 2364 | `tq_an_p2_2.m4a` | How does a bird move? | Animals / Fly, swim or walk (P) |
| 2365 | `tq_an_p2_3.m4a` | How does a dog move? | Animals / Fly, swim or walk (P) |
| 2366 | `tq_an_p2_4.m4a` | How does a butterfly move? | Animals / Fly, swim or walk (P) |
| 2367 | `tq_an_p2_5.m4a` | How does a whale move? | Animals / Fly, swim or walk (P) |
| 2368 | `tq_an_p2_6.m4a` | How does an elephant move? | Animals / Fly, swim or walk (P) |
| 2369 | `tq_an_p2_7.m4a` | How does a bee move? | Animals / Fly, swim or walk (P) |
| 2370 | `tq_an_p2_8.m4a` | How does a shark move? | Animals / Fly, swim or walk (P) |
| 2371 | `tq_an_p2_9.m4a` | How does a horse move? | Animals / Fly, swim or walk (P) |
| 2372 | `tq_an_p2_10.m4a` | How does an octopus move? | Animals / Fly, swim or walk (P) |
| 2373 | `tq_an_p3_1.m4a` | What does a panda eat? | Animals / What do they eat? (P) |
| 2374 | `tw_bamboo.m4a` | bamboo | topic answer word |
| 2375 | `tw_meat.m4a` | meat | topic answer word |
| 2376 | `tq_an_p3_2.m4a` | What does a rabbit eat? | Animals / What do they eat? (P) |
| 2377 | `tw_carrot.m4a` | carrot | topic answer word |
| 2378 | `tq_an_p3_3.m4a` | What does a cow eat? | Animals / What do they eat? (P) |
| 2379 | `tw_grass.m4a` | grass | topic answer word |
| 2380 | `tw_cake.m4a` | cake | topic answer word |
| 2381 | `tq_an_p3_4.m4a` | What does a bee drink from? | Animals / What do they eat? (P) |
| 2382 | `tw_flowers.m4a` | flowers | topic answer word |
| 2383 | `tw_rocks.m4a` | rocks | topic answer word |
| 2384 | `tq_an_p3_5.m4a` | What does a squirrel eat? | Animals / What do they eat? (P) |
| 2385 | `tw_nuts.m4a` | nuts | topic answer word |
| 2386 | `tq_an_p3_6.m4a` | What does a lion eat? | Animals / What do they eat? (P) |
| 2387 | `tw_carrots.m4a` | carrots | topic answer word |
| 2388 | `tq_an_p3_7.m4a` | What does a giraffe eat? | Animals / What do they eat? (P) |
| 2389 | `tw_leaves.m4a` | leaves | topic answer word |
| 2390 | `tq_an_p3_8.m4a` | What does a robin eat? | Animals / What do they eat? (P) |
| 2391 | `tw_worms.m4a` | worms | topic answer word |
| 2392 | `tq_an_p3_9.m4a` | What does a caterpillar eat? | Animals / What do they eat? (P) |
| 2393 | `tq_an_p3_10.m4a` | What does a horse eat? | Animals / What do they eat? (P) |
| 2394 | `tw_hay.m4a` | hay | topic answer word |
| 2395 | `tq_an_p4_1.m4a` | Where does a bird live? | Animals / Animal homes (P) |
| 2396 | `tw_nest.m4a` | nest | topic answer word |
| 2397 | `tw_hive.m4a` | hive | topic answer word |
| 2398 | `tw_web.m4a` | web | topic answer word |
| 2399 | `tq_an_p4_2.m4a` | Where do bees live? | Animals / Animal homes (P) |
| 2400 | `tw_cave.m4a` | cave | topic answer word |
| 2401 | `tq_an_p4_3.m4a` | What does a spider make? | Animals / Animal homes (P) |
| 2402 | `tq_an_p4_4.m4a` | Where does a fish live? | Animals / Animal homes (P) |
| 2403 | `tw_water.m4a` | water | topic answer word |
| 2404 | `tw_tree.m4a` | tree | topic answer word |
| 2405 | `tq_an_p4_5.m4a` | Where does a bear sleep in winter? | Animals / Animal homes (P) |
| 2406 | `tw_den_cave.m4a` | den/cave | topic answer word |
| 2407 | `tw_pond.m4a` | pond | topic answer word |
| 2408 | `tq_an_p4_6.m4a` | Where does a rabbit live? | Animals / Animal homes (P) |
| 2409 | `tw_burrow.m4a` | burrow | topic answer word |
| 2410 | `tq_an_p4_7.m4a` | Where do ants live? | Animals / Animal homes (P) |
| 2411 | `tw_anthill.m4a` | anthill | topic answer word |
| 2412 | `tq_an_p4_8.m4a` | Where does a horse sleep on a farm? | Animals / Animal homes (P) |
| 2413 | `tw_barn.m4a` | barn | topic answer word |
| 2414 | `tq_an_p4_9.m4a` | Where does a frog live? | Animals / Animal homes (P) |
| 2415 | `tw_desert.m4a` | desert | topic answer word |
| 2416 | `tq_an_p4_10.m4a` | Where does a beaver live? | Animals / Animal homes (P) |
| 2417 | `tw_lodge.m4a` | lodge | topic answer word |
| 2418 | `tq_an_e1_1.m4a` | A dog is a... | Animals / Mammal, bird or fish (E) |
| 2419 | `tw_mammal.m4a` | mammal | topic answer word |
| 2420 | `tw_bird.m4a` | bird | topic answer word |
| 2421 | `tf_an_e1_1.m4a` | Mammals have hair or fur and feed their babies milk. | fact after a right answer (spoken at 2-5, read at 6+) |
| 2422 | `tq_an_e1_2.m4a` | An eagle is a... | Animals / Mammal, bird or fish (E) |
| 2423 | `tf_an_e1_2.m4a` | All birds have feathers. | fact after a right answer (spoken at 2-5, read at 6+) |
| 2424 | `tq_an_e1_3.m4a` | A salmon is a... | Animals / Mammal, bird or fish (E) |
| 2425 | `tf_an_e1_3.m4a` | Fish breathe with gills. | fact after a right answer (spoken at 2-5, read at 6+) |
| 2426 | `tq_an_e1_4.m4a` | A whale is a... | Animals / Mammal, bird or fish (E) |
| 2427 | `tf_an_e1_4.m4a` | Whales breathe air through a blowhole. | fact after a right answer (spoken at 2-5, read at 6+) |
| 2428 | `tq_an_e1_5.m4a` | A penguin is a... | Animals / Mammal, bird or fish (E) |
| 2429 | `tf_an_e1_5.m4a` | Penguins can't fly, but they have feathers. | fact after a right answer (spoken at 2-5, read at 6+) |
| 2430 | `tq_an_e1_6.m4a` | A bat is a... | Animals / Mammal, bird or fish (E) |
| 2431 | `tf_an_e1_6.m4a` | Bats are the only mammals that can really fly. | fact after a right answer (spoken at 2-5, read at 6+) |
| 2432 | `tq_an_e1_7.m4a` | A shark is a... | Animals / Mammal, bird or fish (E) |
| 2433 | `tq_an_e1_8.m4a` | A dolphin is a... | Animals / Mammal, bird or fish (E) |
| 2434 | `tq_an_e1_9.m4a` | An owl is a... | Animals / Mammal, bird or fish (E) |
| 2435 | `tq_an_e1_10.m4a` | A goldfish is a... | Animals / Mammal, bird or fish (E) |
| 2436 | `tq_an_e2_1.m4a` | Where does a polar bear live? | Animals / Habitats (E) |
| 2437 | `tw_arctic.m4a` | Arctic | topic answer word |
| 2438 | `tw_rainforest.m4a` | rainforest | topic answer word |
| 2439 | `tq_an_e2_2.m4a` | Where does a camel live? | Animals / Habitats (E) |
| 2440 | `tw_ocean.m4a` | ocean | topic answer word |
| 2441 | `tq_an_e2_3.m4a` | Where do most monkeys live? | Animals / Habitats (E) |
| 2442 | `tq_an_e2_4.m4a` | Where does an octopus live? | Animals / Habitats (E) |
| 2443 | `tq_an_e2_5.m4a` | Where does a frog live? | Animals / Habitats (E) |
| 2444 | `tq_an_e2_6.m4a` | Where does a deer live? | Animals / Habitats (E) |
| 2445 | `tw_forest.m4a` | forest | topic answer word |
| 2446 | `tq_an_e2_7.m4a` | Where do emperor penguins live? | Animals / Habitats (E) |
| 2447 | `tw_antarctica.m4a` | Antarctica | topic answer word |
| 2448 | `tq_an_e2_8.m4a` | Where does a parrot live? | Animals / Habitats (E) |
| 2449 | `tq_an_e2_9.m4a` | Where does a starfish live? | Animals / Habitats (E) |
| 2450 | `tq_an_e2_10.m4a` | Where does a lizard like the gila monster live? | Animals / Habitats (E) |
| 2451 | `tq_an_e3_1.m4a` | A snake is a... | Animals / Reptiles, amphibians, insects (E) |
| 2452 | `tw_reptile.m4a` | reptile | topic answer word |
| 2453 | `tw_insect.m4a` | insect | topic answer word |
| 2454 | `tw_amphibian.m4a` | amphibian | topic answer word |
| 2455 | `tf_an_e3_1.m4a` | Reptiles have dry, scaly skin. | fact after a right answer (spoken at 2-5, read at 6+) |
| 2456 | `tq_an_e3_2.m4a` | A frog is an... | Animals / Reptiles, amphibians, insects (E) |
| 2457 | `tf_an_e3_2.m4a` | Amphibians live in water when young and on land later. | fact after a right answer (spoken at 2-5, read at 6+) |
| 2458 | `tq_an_e3_3.m4a` | An ant is an... | Animals / Reptiles, amphibians, insects (E) |
| 2459 | `tf_an_e3_3.m4a` | Insects have 6 legs. | fact after a right answer (spoken at 2-5, read at 6+) |
| 2460 | `tq_an_e3_4.m4a` | How many legs does an insect have? | Animals / Reptiles, amphibians, insects (E) |
| 2461 | `tq_an_e3_5.m4a` | How many legs does a spider have? | Animals / Reptiles, amphibians, insects (E) |
| 2462 | `tf_an_e3_5.m4a` | Spiders are not insects. | fact after a right answer (spoken at 2-5, read at 6+) |
| 2463 | `tq_an_e3_6.m4a` | A turtle is a... | Animals / Reptiles, amphibians, insects (E) |
| 2464 | `tq_an_e3_7.m4a` | A salamander is an... | Animals / Reptiles, amphibians, insects (E) |
| 2465 | `tq_an_e3_8.m4a` | A butterfly is an... | Animals / Reptiles, amphibians, insects (E) |
| 2466 | `tq_an_e3_9.m4a` | A crocodile is a... | Animals / Reptiles, amphibians, insects (E) |
| 2467 | `tq_an_e3_10.m4a` | A bee is an... | Animals / Reptiles, amphibians, insects (E) |
| 2468 | `tq_an_e4_1.m4a` | An octopus has eight arms. How many arms? | Animals / Read a fact (E) |
| 2469 | `tq_an_e4_2.m4a` | Hummingbirds can fly backward. Which bird can fly backward? | Animals / Read a fact (E) |
| 2470 | `tw_hummingbird.m4a` | hummingbird | topic answer word |
| 2471 | `tw_penguin.m4a` | penguin | topic answer word |
| 2472 | `tq_an_e4_3.m4a` | A baby kangaroo is called a joey. What is a baby kangaroo called? | Animals / Read a fact (E) |
| 2473 | `tw_joey.m4a` | joey | topic answer word |
| 2474 | `tw_cub.m4a` | cub | topic answer word |
| 2475 | `tw_calf.m4a` | calf | topic answer word |
| 2476 | `tq_an_e4_4.m4a` | Cheetahs are the fastest land animals. Which is fastest on land? | Animals / Read a fact (E) |
| 2477 | `tw_cheetah.m4a` | cheetah | topic answer word |
| 2478 | `tw_turtle.m4a` | turtle | topic answer word |
| 2479 | `tw_elephant.m4a` | elephant | topic answer word |
| 2480 | `tq_an_e4_5.m4a` | Bats sleep upside down. How do bats sleep? | Animals / Read a fact (E) |
| 2481 | `tw_upside_down.m4a` | upside down | topic answer word |
| 2482 | `tw_in_water.m4a` | in water | topic answer word |
| 2483 | `tw_standing_up.m4a` | standing up | topic answer word |
| 2484 | `tq_an_e4_6.m4a` | A giraffe's long neck helps it reach leaves. Why is the neck long? | Animals / Read a fact (E) |
| 2485 | `tw_to_reach_leaves.m4a` | to reach leaves | topic answer word |
| 2486 | `tw_to_swim.m4a` | to swim | topic answer word |
| 2487 | `tw_to_dig.m4a` | to dig | topic answer word |
| 2488 | `tq_an_e4_7.m4a` | Penguins cannot fly, but they swim fast. What are penguins good at? | Animals / Read a fact (E) |
| 2489 | `tw_swimming.m4a` | swimming | topic answer word |
| 2490 | `tw_flying.m4a` | flying | topic answer word |
| 2491 | `tw_climbing_trees.m4a` | climbing trees | topic answer word |
| 2492 | `tq_an_e4_8.m4a` | Bees make honey. What do bees make? | Animals / Read a fact (E) |
| 2493 | `tw_honey.m4a` | honey | topic answer word |
| 2494 | `tw_milk.m4a` | milk | topic answer word |
| 2495 | `tw_jam.m4a` | jam | topic answer word |
| 2496 | `tq_an_e4_9.m4a` | Frogs start life as tadpoles. What is a baby frog? | Animals / Read a fact (E) |
| 2497 | `tw_tadpole.m4a` | tadpole | topic answer word |
| 2498 | `tw_chick.m4a` | chick | topic answer word |
| 2499 | `tq_an_e4_10.m4a` | A snail carries its shell on its back. Where is its shell? | Animals / Read a fact (E) |
| 2500 | `tw_on_its_back.m4a` | on its back | topic answer word |
| 2501 | `tw_in_a_nest.m4a` | in a nest | topic answer word |
| 2502 | `tw_under_a_rock.m4a` | under a rock | topic answer word |
| 2503 | `tq_cs_t1_1.m4a` | Find red | Colors & shapes / Find the color (T) |
| 2504 | `tq_cs_t1_2.m4a` | Find blue | Colors & shapes / Find the color (T) |
| 2505 | `tq_cs_t1_3.m4a` | Find yellow | Colors & shapes / Find the color (T) |
| 2506 | `tq_cs_t1_4.m4a` | Find green | Colors & shapes / Find the color (T) |
| 2507 | `tq_cs_t1_5.m4a` | Find red | Colors & shapes / Find the color (T) |
| 2508 | `tq_cs_t1_6.m4a` | Find yellow | Colors & shapes / Find the color (T) |
| 2509 | `tq_cs_t1_7.m4a` | Find green | Colors & shapes / Find the color (T) |
| 2510 | `tq_cs_t1_8.m4a` | Find blue | Colors & shapes / Find the color (T) |
| 2511 | `tq_cs_t1_9.m4a` | Find red | Colors & shapes / Find the color (T) |
| 2512 | `tq_cs_t1_10.m4a` | Find yellow | Colors & shapes / Find the color (T) |
| 2513 | `tq_cs_t2_1.m4a` | Find the circle | Colors & shapes / Find the shape (T) |
| 2514 | `tq_cs_t2_2.m4a` | Find the square | Colors & shapes / Find the shape (T) |
| 2515 | `tq_cs_t2_3.m4a` | Find the triangle | Colors & shapes / Find the shape (T) |
| 2516 | `tq_cs_t2_4.m4a` | Find the circle | Colors & shapes / Find the shape (T) |
| 2517 | `tq_cs_t2_5.m4a` | Find the triangle | Colors & shapes / Find the shape (T) |
| 2518 | `tq_cs_t2_6.m4a` | Find the square | Colors & shapes / Find the shape (T) |
| 2519 | `tq_cs_t2_7.m4a` | Find the circle | Colors & shapes / Find the shape (T) |
| 2520 | `tq_cs_t2_8.m4a` | Find the triangle | Colors & shapes / Find the shape (T) |
| 2521 | `tq_cs_t2_9.m4a` | Find the square | Colors & shapes / Find the shape (T) |
| 2522 | `tq_cs_t2_10.m4a` | Find the circle | Colors & shapes / Find the shape (T) |
| 2523 | `tq_cs_p1_1.m4a` | Find orange | Colors & shapes / More colors (P) |
| 2524 | `tq_cs_p1_2.m4a` | Find purple | Colors & shapes / More colors (P) |
| 2525 | `tq_cs_p1_3.m4a` | Find pink | Colors & shapes / More colors (P) |
| 2526 | `tq_cs_p1_4.m4a` | Find brown | Colors & shapes / More colors (P) |
| 2527 | `tq_cs_p1_5.m4a` | Find black | Colors & shapes / More colors (P) |
| 2528 | `tq_cs_p1_6.m4a` | Find white | Colors & shapes / More colors (P) |
| 2529 | `tq_cs_p1_7.m4a` | Find orange | Colors & shapes / More colors (P) |
| 2530 | `tq_cs_p1_8.m4a` | Find purple | Colors & shapes / More colors (P) |
| 2531 | `tq_cs_p1_9.m4a` | Find brown | Colors & shapes / More colors (P) |
| 2532 | `tq_cs_p1_10.m4a` | Find pink | Colors & shapes / More colors (P) |
| 2533 | `tq_cs_p2_1.m4a` | Find the rectangle | Colors & shapes / Shape names (P) |
| 2534 | `tw_long_box.m4a` | long box | topic answer word |
| 2535 | `tq_cs_p2_2.m4a` | Find the star | Colors & shapes / Shape names (P) |
| 2536 | `tq_cs_p2_3.m4a` | Find the heart | Colors & shapes / Shape names (P) |
| 2537 | `tq_cs_p2_4.m4a` | Find the oval | Colors & shapes / Shape names (P) |
| 2538 | `tw_shape.m4a` | shape | topic answer word |
| 2539 | `tq_cs_p2_5.m4a` | Find the diamond | Colors & shapes / Shape names (P) |
| 2540 | `tq_cs_p2_6.m4a` | Find the triangle | Colors & shapes / Shape names (P) |
| 2541 | `tq_cs_p2_7.m4a` | Find the circle | Colors & shapes / Shape names (P) |
| 2542 | `tw_oval.m4a` | oval | topic answer word |
| 2543 | `tq_cs_p2_8.m4a` | Find the square | Colors & shapes / Shape names (P) |
| 2544 | `tq_cs_p2_9.m4a` | Find the rectangle | Colors & shapes / Shape names (P) |
| 2545 | `tq_cs_p2_10.m4a` | Find the star | Colors & shapes / Shape names (P) |
| 2546 | `tq_cs_p3_1.m4a` | What shape is a pizza slice? | Colors & shapes / Shapes in real things (P) |
| 2547 | `tw_triangle.m4a` | triangle | topic answer word |
| 2548 | `tw_circle.m4a` | circle | topic answer word |
| 2549 | `tw_square.m4a` | square | topic answer word |
| 2550 | `tq_cs_p3_2.m4a` | What shape is a clock? | Colors & shapes / Shapes in real things (P) |
| 2551 | `tw_star.m4a` | star | topic answer word |
| 2552 | `tq_cs_p3_3.m4a` | What shape is a door? | Colors & shapes / Shapes in real things (P) |
| 2553 | `tw_rectangle.m4a` | rectangle | topic answer word |
| 2554 | `tq_cs_p3_4.m4a` | What shape is an egg? | Colors & shapes / Shapes in real things (P) |
| 2555 | `tq_cs_p3_5.m4a` | What shape is a cookie? | Colors & shapes / Shapes in real things (P) |
| 2556 | `tq_cs_p3_6.m4a` | What shape is a slice of bread? | Colors & shapes / Shapes in real things (P) |
| 2557 | `tq_cs_p3_7.m4a` | What shape is a window pane? | Colors & shapes / Shapes in real things (P) |
| 2558 | `tq_cs_p3_8.m4a` | What shape is a phone? | Colors & shapes / Shapes in real things (P) |
| 2559 | `tq_cs_p3_9.m4a` | What shape is a slice of watermelon? | Colors & shapes / Shapes in real things (P) |
| 2560 | `tq_cs_p3_10.m4a` | What shape is a wheel? | Colors & shapes / Shapes in real things (P) |
| 2561 | `tq_cs_p4_1.m4a` | Red and yellow make... | Colors & shapes / Color mixing (P) |
| 2562 | `tw_orange.m4a` | orange | topic answer word |
| 2563 | `tw_green.m4a` | green | topic answer word |
| 2564 | `tw_purple.m4a` | purple | topic answer word |
| 2565 | `tq_cs_p4_2.m4a` | Blue and yellow make... | Colors & shapes / Color mixing (P) |
| 2566 | `tw_pink.m4a` | pink | topic answer word |
| 2567 | `tq_cs_p4_3.m4a` | Red and blue make... | Colors & shapes / Color mixing (P) |
| 2568 | `tq_cs_p4_4.m4a` | Red and white make... | Colors & shapes / Color mixing (P) |
| 2569 | `tw_brown.m4a` | brown | topic answer word |
| 2570 | `tq_cs_p4_5.m4a` | Yellow and red make... | Colors & shapes / Color mixing (P) |
| 2571 | `tw_blue.m4a` | blue | topic answer word |
| 2572 | `tq_cs_p4_6.m4a` | Yellow and blue make... | Colors & shapes / Color mixing (P) |
| 2573 | `tw_red.m4a` | red | topic answer word |
| 2574 | `tq_cs_p4_7.m4a` | Blue and red make... | Colors & shapes / Color mixing (P) |
| 2575 | `tw_yellow.m4a` | yellow | topic answer word |
| 2576 | `tq_cs_p4_8.m4a` | White and red make... | Colors & shapes / Color mixing (P) |
| 2577 | `tw_black.m4a` | black | topic answer word |
| 2578 | `tq_cs_p4_9.m4a` | Black and white make... | Colors & shapes / Color mixing (P) |
| 2579 | `tw_gray.m4a` | gray | topic answer word |
| 2580 | `tq_cs_p4_10.m4a` | Which two make green? | Colors & shapes / Color mixing (P) |
| 2581 | `tw_blue_and_yellow.m4a` | blue and yellow | topic answer word |
| 2582 | `tw_red_and_blue.m4a` | red and blue | topic answer word |
| 2583 | `tw_red_and_yellow.m4a` | red and yellow | topic answer word |
| 2584 | `tq_cs_e1_1.m4a` | How many sides does a triangle have? | Colors & shapes / Sides and corners (E) |
| 2585 | `tq_cs_e1_2.m4a` | How many sides does a square have? | Colors & shapes / Sides and corners (E) |
| 2586 | `tq_cs_e1_3.m4a` | How many corners does a rectangle have? | Colors & shapes / Sides and corners (E) |
| 2587 | `tq_cs_e1_4.m4a` | How many sides does a pentagon have? | Colors & shapes / Sides and corners (E) |
| 2588 | `tq_cs_e1_5.m4a` | How many sides does a hexagon have? | Colors & shapes / Sides and corners (E) |
| 2589 | `tf_cs_e1_5.m4a` | Honeycomb cells are hexagons. | fact after a right answer (spoken at 2-5, read at 6+) |
| 2590 | `tq_cs_e1_6.m4a` | A stop sign has 8 sides. What shape is it? | Colors & shapes / Sides and corners (E) |
| 2591 | `tw_octagon.m4a` | octagon | topic answer word |
| 2592 | `tw_hexagon.m4a` | hexagon | topic answer word |
| 2593 | `tw_pentagon.m4a` | pentagon | topic answer word |
| 2594 | `tq_cs_e1_7.m4a` | How many corners does a circle have? | Colors & shapes / Sides and corners (E) |
| 2595 | `tq_cs_e1_8.m4a` | Which shape has 3 corners? | Colors & shapes / Sides and corners (E) |
| 2596 | `tq_cs_e1_9.m4a` | Which shape has 6 sides? | Colors & shapes / Sides and corners (E) |
| 2597 | `tq_cs_e1_10.m4a` | Which shape has 5 sides? | Colors & shapes / Sides and corners (E) |
| 2598 | `tq_cs_e2_1.m4a` | A ball is shaped like a... | Colors & shapes / Solid (E) |
| 2599 | `tw_sphere.m4a` | sphere | topic answer word |
| 2600 | `tw_cube.m4a` | cube | topic answer word |
| 2601 | `tw_cone.m4a` | cone | topic answer word |
| 2602 | `tq_cs_e2_2.m4a` | A dice is shaped like a... | Colors & shapes / Solid (E) |
| 2603 | `tw_cylinder.m4a` | cylinder | topic answer word |
| 2604 | `tq_cs_e2_3.m4a` | A soup can is shaped like a... | Colors & shapes / Solid (E) |
| 2605 | `tq_cs_e2_4.m4a` | An ice cream cone is shaped like a... | Colors & shapes / Solid (E) |
| 2606 | `tq_cs_e2_5.m4a` | The pyramids in Egypt are shaped like a... | Colors & shapes / Solid (E) |
| 2607 | `tw_pyramid.m4a` | pyramid | topic answer word |
| 2608 | `tq_cs_e2_6.m4a` | A party hat is shaped like a... | Colors & shapes / Solid (E) |
| 2609 | `tq_cs_e2_7.m4a` | An orange is shaped like a... | Colors & shapes / Solid (E) |
| 2610 | `tq_cs_e2_8.m4a` | A cereal box is a... | Colors & shapes / Solid (E) |
| 2611 | `tw_rectangular_prism.m4a` | rectangular prism | topic answer word |
| 2612 | `tq_cs_e2_9.m4a` | How many faces does a cube have? | Colors & shapes / Solid (E) |
| 2613 | `tq_cs_e2_10.m4a` | Which shape can roll? | Colors & shapes / Solid (E) |
| 2614 | `tq_cs_e3_1.m4a` | A pizza is cut into 2 equal parts. Each part is a... | Colors & shapes / Halves and fourths (E) |
| 2615 | `tw_half.m4a` | half | topic answer word |
| 2616 | `tw_fourth.m4a` | fourth | topic answer word |
| 2617 | `tw_whole.m4a` | whole | topic answer word |
| 2618 | `tq_cs_e3_2.m4a` | A pie is cut into 4 equal parts. Each part is a... | Colors & shapes / Halves and fourths (E) |
| 2619 | `tw_third.m4a` | third | topic answer word |
| 2620 | `tq_cs_e3_3.m4a` | Which shows halves? | Colors & shapes / Halves and fourths (E) |
| 2621 | `tw_2_equal_parts.m4a` | 2 equal parts | topic answer word |
| 2622 | `tw_2_unequal_parts.m4a` | 2 unequal parts | topic answer word |
| 2623 | `tw_3_parts.m4a` | 3 parts | topic answer word |
| 2624 | `tq_cs_e3_4.m4a` | How many halves make a whole? | Colors & shapes / Halves and fourths (E) |
| 2625 | `tq_cs_e3_5.m4a` | How many fourths make a whole? | Colors & shapes / Halves and fourths (E) |
| 2626 | `tq_cs_e3_6.m4a` | Which is bigger: a half or a fourth of the same pizza? | Colors & shapes / Halves and fourths (E) |
| 2627 | `tw_same.m4a` | same | topic answer word |
| 2628 | `tq_cs_e3_7.m4a` | A sandwich is cut into 2 equal parts. How many halves? | Colors & shapes / Halves and fourths (E) |
| 2629 | `tq_cs_e3_8.m4a` | Which pie is cut into fourths? | Colors & shapes / Halves and fourths (E) |
| 2630 | `tw_4_equal_slices.m4a` | 4 equal slices | topic answer word |
| 2631 | `tw_4_unequal_slices.m4a` | 4 unequal slices | topic answer word |
| 2632 | `tw_2_slices.m4a` | 2 slices | topic answer word |
| 2633 | `tq_cs_e3_9.m4a` | A quarter is another name for a... | Colors & shapes / Halves and fourths (E) |
| 2634 | `tq_cs_e4_1.m4a` | Which is a primary color? | Colors & shapes / Primary colors and mixing (E) |
| 2635 | `tf_cs_e4_1.m4a` | Red, yellow and blue are the primary colors. | fact after a right answer (spoken at 2-5, read at 6+) |
| 2636 | `tq_cs_e4_2.m4a` | Which is a primary color? | Colors & shapes / Primary colors and mixing (E) |
| 2637 | `tq_cs_e4_3.m4a` | Which is a primary color? | Colors & shapes / Primary colors and mixing (E) |
| 2638 | `tq_cs_e4_4.m4a` | Which is NOT a primary color? | Colors & shapes / Primary colors and mixing (E) |
| 2639 | `tq_cs_e4_5.m4a` | Orange is made from... | Colors & shapes / Primary colors and mixing (E) |
| 2640 | `tw_red_yellow.m4a` | red + yellow | topic answer word |
| 2641 | `tw_blue_yellow.m4a` | blue + yellow | topic answer word |
| 2642 | `tw_red_blue.m4a` | red + blue | topic answer word |
| 2643 | `tq_cs_e4_6.m4a` | Purple is made from... | Colors & shapes / Primary colors and mixing (E) |
| 2644 | `tw_yellow_blue.m4a` | yellow + blue | topic answer word |
| 2645 | `tq_cs_e4_7.m4a` | Green is made from... | Colors & shapes / Primary colors and mixing (E) |
| 2646 | `tw_red_white.m4a` | red + white | topic answer word |
| 2647 | `tq_cs_e4_8.m4a` | A rainbow starts with red. What comes next? | Colors & shapes / Primary colors and mixing (E) |
| 2648 | `tq_cs_e4_9.m4a` | What color comes after yellow in a rainbow? | Colors & shapes / Primary colors and mixing (E) |
| 2649 | `tq_cs_e4_10.m4a` | What color is last in a rainbow? | Colors & shapes / Primary colors and mixing (E) |
| 2650 | `tw_violet.m4a` | violet | topic answer word |
| 2651 | `tq_sw_t1_1.m4a` | Find the sun | Seasons & weather / Sun or rain (T) |
| 2652 | `tq_sw_t1_2.m4a` | Find the rain | Seasons & weather / Sun or rain (T) |
| 2653 | `tq_sw_t1_3.m4a` | Find the snow | Seasons & weather / Sun or rain (T) |
| 2654 | `tq_sw_t1_4.m4a` | Find the cloud | Seasons & weather / Sun or rain (T) |
| 2655 | `tq_sw_t1_5.m4a` | Find the rainbow | Seasons & weather / Sun or rain (T) |
| 2656 | `tq_sw_t1_6.m4a` | Find the sun | Seasons & weather / Sun or rain (T) |
| 2657 | `tq_sw_t1_7.m4a` | Find the snowman | Seasons & weather / Sun or rain (T) |
| 2658 | `tq_sw_t1_8.m4a` | Find the rain | Seasons & weather / Sun or rain (T) |
| 2659 | `tq_sw_t1_9.m4a` | Find the moon | Seasons & weather / Sun or rain (T) |
| 2660 | `tq_sw_t1_10.m4a` | Find the snow | Seasons & weather / Sun or rain (T) |
| 2661 | `tq_sw_t2_1.m4a` | It's raining! What do we need? | Seasons & weather / What do we wear? (T) |
| 2662 | `tw_umbrella.m4a` | umbrella | topic answer word |
| 2663 | `tq_sw_t2_2.m4a` | It's snowing! What do we wear? | Seasons & weather / What do we wear? (T) |
| 2664 | `tw_mittens.m4a` | mittens | topic answer word |
| 2665 | `tq_sw_t2_3.m4a` | It's sunny! What do we wear? | Seasons & weather / What do we wear? (T) |
| 2666 | `tw_sunglasses.m4a` | sunglasses | topic answer word |
| 2667 | `tq_sw_t2_4.m4a` | It's cold! What do we wear? | Seasons & weather / What do we wear? (T) |
| 2668 | `tw_coat.m4a` | coat | topic answer word |
| 2669 | `tq_sw_t2_5.m4a` | Puddles! What do we wear? | Seasons & weather / What do we wear? (T) |
| 2670 | `tw_boots.m4a` | boots | topic answer word |
| 2671 | `tq_sw_t2_6.m4a` | It's hot! Where do we play? | Seasons & weather / What do we wear? (T) |
| 2672 | `tw_beach.m4a` | beach | topic answer word |
| 2673 | `tq_sw_t2_7.m4a` | Snow day! What do we build? | Seasons & weather / What do we wear? (T) |
| 2674 | `tq_sw_t2_8.m4a` | It's sunny! What do we put on our heads? | Seasons & weather / What do we wear? (T) |
| 2675 | `tw_hat.m4a` | hat | topic answer word |
| 2676 | `tq_sw_t2_9.m4a` | It's cold! What goes on our heads? | Seasons & weather / What do we wear? (T) |
| 2677 | `tw_warm_hat.m4a` | warm hat | topic answer word |
| 2678 | `tq_sw_t2_10.m4a` | Rain! What do we wear? | Seasons & weather / What do we wear? (T) |
| 2679 | `tw_raincoat.m4a` | raincoat | topic answer word |
| 2680 | `tq_sw_p1_1.m4a` | What's the weather? | Seasons & weather / Weather words (P) |
| 2681 | `tw_sunny.m4a` | sunny | topic answer word |
| 2682 | `tw_snowy.m4a` | snowy | topic answer word |
| 2683 | `tw_rainy.m4a` | rainy | topic answer word |
| 2684 | `tq_sw_p1_2.m4a` | What's the weather? | Seasons & weather / Weather words (P) |
| 2685 | `tw_windy.m4a` | windy | topic answer word |
| 2686 | `tq_sw_p1_3.m4a` | What's the weather? | Seasons & weather / Weather words (P) |
| 2687 | `tw_cloudy.m4a` | cloudy | topic answer word |
| 2688 | `tq_sw_p1_4.m4a` | What's the weather? (kites, blowing leaves) | Seasons & weather / Weather words (P) |
| 2689 | `tq_sw_p1_5.m4a` | What's the weather? | Seasons & weather / Weather words (P) |
| 2690 | `tq_sw_p1_6.m4a` | What's the weather? | Seasons & weather / Weather words (P) |
| 2691 | `tw_stormy.m4a` | stormy | topic answer word |
| 2692 | `tq_sw_p1_7.m4a` | Kites fly best when it is... | Seasons & weather / Weather words (P) |
| 2693 | `tq_sw_p1_8.m4a` | We see a rainbow after... | Seasons & weather / Weather words (P) |
| 2694 | `tw_rain.m4a` | rain | topic answer word |
| 2695 | `tw_snow.m4a` | snow | topic answer word |
| 2696 | `tw_night.m4a` | night | topic answer word |
| 2697 | `tq_sw_p1_9.m4a` | A snowman needs a day that is... | Seasons & weather / Weather words (P) |
| 2698 | `tw_sunny_and_hot.m4a` | sunny and hot | topic answer word |
| 2699 | `tq_sw_p1_10.m4a` | Thunder and lightning means it is... | Seasons & weather / Weather words (P) |
| 2700 | `tq_sw_p2_1.m4a` | Snow and sledding happen in... | Seasons & weather / The four seasons (P) |
| 2701 | `tw_winter.m4a` | winter | topic answer word |
| 2702 | `tw_summer.m4a` | summer | topic answer word |
| 2703 | `tw_spring.m4a` | spring | topic answer word |
| 2704 | `tq_sw_p2_2.m4a` | Flowers start to bloom in... | Seasons & weather / The four seasons (P) |
| 2705 | `tw_fall.m4a` | fall | topic answer word |
| 2706 | `tq_sw_p2_3.m4a` | Swimming and hot days are in... | Seasons & weather / The four seasons (P) |
| 2707 | `tq_sw_p2_4.m4a` | Leaves turn red and fall down in... | Seasons & weather / The four seasons (P) |
| 2708 | `tq_sw_p2_5.m4a` | We pick pumpkins in... | Seasons & weather / The four seasons (P) |
| 2709 | `tq_sw_p2_6.m4a` | We build snowmen in... | Seasons & weather / The four seasons (P) |
| 2710 | `tq_sw_p2_7.m4a` | Baby birds hatch in... | Seasons & weather / The four seasons (P) |
| 2711 | `tq_sw_p2_8.m4a` | Ice cream on the beach is a... treat | Seasons & weather / The four seasons (P) |
| 2712 | `tq_sw_p2_9.m4a` | We jump in leaf piles in... | Seasons & weather / The four seasons (P) |
| 2713 | `tq_sw_p2_10.m4a` | We wear mittens in... | Seasons & weather / The four seasons (P) |
| 2714 | `tq_sw_p3_1.m4a` | After winter comes... | Seasons & weather / What comes next? (P) |
| 2715 | `tq_sw_p3_2.m4a` | After spring comes... | Seasons & weather / What comes next? (P) |
| 2716 | `tq_sw_p3_3.m4a` | After summer comes... | Seasons & weather / What comes next? (P) |
| 2717 | `tq_sw_p3_4.m4a` | After fall comes... | Seasons & weather / What comes next? (P) |
| 2718 | `tq_sw_p3_5.m4a` | Before summer comes... | Seasons & weather / What comes next? (P) |
| 2719 | `tq_sw_p3_6.m4a` | Before winter comes... | Seasons & weather / What comes next? (P) |
| 2720 | `tq_sw_p3_7.m4a` | Before fall comes... | Seasons & weather / What comes next? (P) |
| 2721 | `tq_sw_p3_8.m4a` | Before spring comes... | Seasons & weather / What comes next? (P) |
| 2722 | `tq_sw_p3_9.m4a` | How many seasons are there? | Seasons & weather / What comes next? (P) |
| 2723 | `tq_sw_p3_10.m4a` | Which season is the coldest? | Seasons & weather / What comes next? (P) |
| 2724 | `tq_sw_e1_1.m4a` | December is in... | Seasons & weather / Months and seasons (E) |
| 2725 | `tq_sw_e1_2.m4a` | July is in... | Seasons & weather / Months and seasons (E) |
| 2726 | `tq_sw_e1_3.m4a` | April is in... | Seasons & weather / Months and seasons (E) |
| 2727 | `tq_sw_e1_4.m4a` | October is in... | Seasons & weather / Months and seasons (E) |
| 2728 | `tq_sw_e1_5.m4a` | Which month comes after March? | Seasons & weather / Months and seasons (E) |
| 2729 | `tw_april.m4a` | April | topic answer word |
| 2730 | `tw_may.m4a` | May | topic answer word |
| 2731 | `tw_february.m4a` | February | topic answer word |
| 2732 | `tq_sw_e1_6.m4a` | Which month comes before June? | Seasons & weather / Months and seasons (E) |
| 2733 | `tw_july.m4a` | July | topic answer word |
| 2734 | `tq_sw_e1_7.m4a` | How many months are in a year? | Seasons & weather / Months and seasons (E) |
| 2735 | `tq_sw_e1_8.m4a` | January is in... | Seasons & weather / Months and seasons (E) |
| 2736 | `tq_sw_e1_9.m4a` | Which month is first in the year? | Seasons & weather / Months and seasons (E) |
| 2737 | `tw_january.m4a` | January | topic answer word |
| 2738 | `tw_december.m4a` | December | topic answer word |
| 2739 | `tw_march.m4a` | March | topic answer word |
| 2740 | `tq_sw_e1_10.m4a` | August is in... | Seasons & weather / Months and seasons (E) |
| 2741 | `tq_sw_e2_1.m4a` | A thermometer measures... | Seasons & weather / Weather science (E) |
| 2742 | `tw_temperature.m4a` | temperature | topic answer word |
| 2743 | `tw_wind.m4a` | wind | topic answer word |
| 2744 | `tq_sw_e2_2.m4a` | Snow is frozen... | Seasons & weather / Weather science (E) |
| 2745 | `tw_sand.m4a` | sand | topic answer word |
| 2746 | `tw_sugar.m4a` | sugar | topic answer word |
| 2747 | `tq_sw_e2_3.m4a` | Clouds are made of tiny drops of... | Seasons & weather / Weather science (E) |
| 2748 | `tw_cotton.m4a` | cotton | topic answer word |
| 2749 | `tw_smoke.m4a` | smoke | topic answer word |
| 2750 | `tq_sw_e2_4.m4a` | To see a rainbow you need sun and... | Seasons & weather / Weather science (E) |
| 2751 | `tq_sw_e2_5.m4a` | Which comes first in a storm? | Seasons & weather / Weather science (E) |
| 2752 | `tw_lightning.m4a` | lightning | topic answer word |
| 2753 | `tw_thunder.m4a` | thunder | topic answer word |
| 2754 | `tw_they_are_always_together.m4a` | they are always together | topic answer word |
| 2755 | `tf_sw_e2_5.m4a` | Light travels faster than sound, so you see the flash before you hear the boom. | fact after a right answer (spoken at 2-5, read at 6+) |
| 2756 | `tq_sw_e2_6.m4a` | When water gets very cold it turns into... | Seasons & weather / Weather science (E) |
| 2757 | `tw_ice.m4a` | ice | topic answer word |
| 2758 | `tw_steam.m4a` | steam | topic answer word |
| 2759 | `tq_sw_e2_7.m4a` | When the sun warms a puddle, the water goes up into the... | Seasons & weather / Weather science (E) |
| 2760 | `tw_air.m4a` | air | topic answer word |
| 2761 | `tw_ground.m4a` | ground | topic answer word |
| 2762 | `tw_ocean_floor.m4a` | ocean floor | topic answer word |
| 2763 | `tq_sw_e2_8.m4a` | A wind sock shows... | Seasons & weather / Weather science (E) |
| 2764 | `tw_which_way_the_wind_blows.m4a` | which way the wind blows | topic answer word |
| 2765 | `tw_how_hot_it_is.m4a` | how hot it is | topic answer word |
| 2766 | `tw_how_much_rain_fell.m4a` | how much rain fell | topic answer word |
| 2767 | `tq_sw_e2_9.m4a` | What falls from clouds? | Seasons & weather / Weather science (E) |
| 2768 | `tw_rain_or_snow.m4a` | rain or snow | topic answer word |
| 2769 | `tq_sw_e2_10.m4a` | The sun gives us light and... | Seasons & weather / Weather science (E) |
| 2770 | `tw_heat.m4a` | heat | topic answer word |
| 2771 | `tq_sw_e3_1.m4a` | Every snowflake has six sides or points. How many points? | Seasons & weather / Read a fact (E) |
| 2772 | `tq_sw_e3_2.m4a` | Some trees lose their leaves in fall to rest for winter. When do they lose leaves? | Seasons & weather / Read a fact (E) |
| 2773 | `tq_sw_e3_3.m4a` | Bears sleep through much of the winter in a den. Where do bears rest? | Seasons & weather / Read a fact (E) |
| 2774 | `tw_den.m4a` | den | topic answer word |
| 2775 | `tq_sw_e3_4.m4a` | Hail is balls of ice that fall in some storms. What is hail? | Seasons & weather / Read a fact (E) |
| 2776 | `tw_balls_of_ice.m4a` | balls of ice | topic answer word |
| 2777 | `tq_sw_e3_5.m4a` | Many birds fly south when it gets cold. Which way do they fly? | Seasons & weather / Read a fact (E) |
| 2778 | `tw_south.m4a` | south | topic answer word |
| 2779 | `tw_north.m4a` | north | topic answer word |
| 2780 | `tw_up_to_the_moon.m4a` | up to the moon | topic answer word |
| 2781 | `tq_sw_e3_6.m4a` | A tornado is a spinning column of wind. What does a tornado do? | Seasons & weather / Read a fact (E) |
| 2782 | `tw_spins.m4a` | spins | topic answer word |
| 2783 | `tw_freezes.m4a` | freezes | topic answer word |
| 2784 | `tw_glows.m4a` | glows | topic answer word |
| 2785 | `tq_sw_e3_7.m4a` | Fog is a cloud close to the ground. Where is fog? | Seasons & weather / Read a fact (E) |
| 2786 | `tw_near_the_ground.m4a` | near the ground | topic answer word |
| 2787 | `tw_in_space.m4a` | in space | topic answer word |
| 2788 | `tw_under_water.m4a` | under water | topic answer word |
| 2789 | `tq_sw_e3_8.m4a` | Spring rain helps plants grow. What does spring rain help? | Seasons & weather / Read a fact (E) |
| 2790 | `tw_plants_grow.m4a` | plants grow | topic answer word |
| 2791 | `tw_snow_fall.m4a` | snow fall | topic answer word |
| 2792 | `tw_leaves_drop.m4a` | leaves drop | topic answer word |
| 2793 | `tq_sw_e3_9.m4a` | Days are longest in summer. When are days longest? | Seasons & weather / Read a fact (E) |
| 2794 | `tq_sw_e3_10.m4a` | Frost forms on cold nights. When does frost form? | Seasons & weather / Read a fact (E) |
| 2795 | `tw_cold_nights.m4a` | cold nights | topic answer word |
| 2796 | `tw_hot_days.m4a` | hot days | topic answer word |
| 2797 | `tw_rainy_afternoons.m4a` | rainy afternoons | topic answer word |
| 2798 | `tq_lt_p3_1.m4a` | A | Letters / Match capital to lowercase (P) |
| 2799 | `tq_lt_p3_2.m4a` | B | Letters / Match capital to lowercase (P) |
| 2800 | `tq_lt_p3_3.m4a` | D | Letters / Match capital to lowercase (P) |
| 2801 | `tq_lt_p3_4.m4a` | G | Letters / Match capital to lowercase (P) |
| 2802 | `tq_lt_p3_5.m4a` | R | Letters / Match capital to lowercase (P) |
| 2803 | `tq_lt_p3_6.m4a` | E | Letters / Match capital to lowercase (P) |
| 2804 | `tq_lt_p3_7.m4a` | Q | Letters / Match capital to lowercase (P) |
| 2805 | `tq_lt_p3_8.m4a` | H | Letters / Match capital to lowercase (P) |
| 2806 | `tq_lt_p3_9.m4a` | N | Letters / Match capital to lowercase (P) |
| 2807 | `tq_lt_p3_10.m4a` | T | Letters / Match capital to lowercase (P) |
| 2808 | `tq_lt_p4_1.m4a` | Which starts with /b/? | Letters / First sounds (P) |
| 2809 | `tw_ball.m4a` | ball | topic answer word |
| 2810 | `tw_sun.m4a` | sun | topic answer word |
| 2811 | `tq_lt_p4_2.m4a` | Which starts with /s/? | Letters / First sounds (P) |
| 2812 | `tw_moon.m4a` | moon | topic answer word |
| 2813 | `tq_lt_p4_3.m4a` | Which starts with /m/? | Letters / First sounds (P) |
| 2814 | `tq_lt_p4_4.m4a` | Which starts with /k/? | Letters / First sounds (P) |
| 2815 | `tq_lt_p4_5.m4a` | Which starts with /d/? | Letters / First sounds (P) |
| 2816 | `tw_bed.m4a` | bed | topic answer word |
| 2817 | `tq_lt_p4_6.m4a` | Which starts with /f/? | Letters / First sounds (P) |
| 2818 | `tw_van.m4a` | van | topic answer word |
| 2819 | `tw_sock.m4a` | sock | topic answer word |
| 2820 | `tq_lt_p4_7.m4a` | Which starts with /p/? | Letters / First sounds (P) |
| 2821 | `tw_bee.m4a` | bee | topic answer word |
| 2822 | `tw_top.m4a` | top | topic answer word |
| 2823 | `tq_lt_p4_8.m4a` | Which starts with /t/? | Letters / First sounds (P) |
| 2824 | `tw_tiger.m4a` | tiger | topic answer word |
| 2825 | `tq_lt_p4_9.m4a` | Which starts with /h/? | Letters / First sounds (P) |
| 2826 | `tw_apple.m4a` | apple | topic answer word |
| 2827 | `tw_cup.m4a` | cup | topic answer word |
| 2828 | `tq_lt_p4_10.m4a` | Which starts with /r/? | Letters / First sounds (P) |
| 2829 | `tw_wing.m4a` | wing | topic answer word |
| 2830 | `tw_leaf.m4a` | leaf | topic answer word |
| 2831 | `tq_lt_e1_1.m4a` | What comes after K? | Letters / ABC order (E) |
| 2832 | `tq_lt_e1_2.m4a` | What comes before G? | Letters / ABC order (E) |
| 2833 | `tq_lt_e1_3.m4a` | What comes after P? | Letters / ABC order (E) |
| 2834 | `tq_lt_e1_4.m4a` | What comes between R and T? | Letters / ABC order (E) |
| 2835 | `tq_lt_e1_5.m4a` | What comes before N? | Letters / ABC order (E) |
| 2836 | `tq_lt_e1_6.m4a` | What comes after W? | Letters / ABC order (E) |
| 2837 | `tq_lt_e1_7.m4a` | What comes between C and E? | Letters / ABC order (E) |
| 2838 | `tq_lt_e1_8.m4a` | What is the last letter? | Letters / ABC order (E) |
| 2839 | `tq_lt_e1_9.m4a` | What comes before J? | Letters / ABC order (E) |
| 2840 | `tq_lt_e1_10.m4a` | What comes after T? | Letters / ABC order (E) |
| 2841 | `tq_lt_e2_1.m4a` | Which comes first? | Letters / ABC order (E) |
| 2842 | `tw_banana.m4a` | banana | topic answer word |
| 2843 | `tw_cherry.m4a` | cherry | topic answer word |
| 2844 | `tq_lt_e2_2.m4a` | Which comes first? | Letters / ABC order (E) |
| 2845 | `tw_bat.m4a` | bat | topic answer word |
| 2846 | `tq_lt_e2_3.m4a` | Which comes first? | Letters / ABC order (E) |
| 2847 | `tw_log.m4a` | log | topic answer word |
| 2848 | `tq_lt_e2_4.m4a` | Which comes first? | Letters / ABC order (E) |
| 2849 | `tq_lt_e2_5.m4a` | Which comes first? | Letters / ABC order (E) |
| 2850 | `tw_cookie.m4a` | cookie | topic answer word |
| 2851 | `tw_cupcake.m4a` | cupcake | topic answer word |
| 2852 | `tq_lt_e2_6.m4a` | Which comes first? | Letters / ABC order (E) |
| 2853 | `tw_pear.m4a` | pear | topic answer word |
| 2854 | `tw_plum.m4a` | plum | topic answer word |
| 2855 | `tw_pumpkin.m4a` | pumpkin | topic answer word |
| 2856 | `tq_lt_e2_7.m4a` | Which comes first? | Letters / ABC order (E) |
| 2857 | `tw_ant.m4a` | ant | topic answer word |
| 2858 | `tw_wasp.m4a` | wasp | topic answer word |
| 2859 | `tq_lt_e2_8.m4a` | Which comes first? | Letters / ABC order (E) |
| 2860 | `tw_storm.m4a` | storm | topic answer word |
| 2861 | `tq_lt_e2_9.m4a` | Which comes first? | Letters / ABC order (E) |
| 2862 | `tw_jelly.m4a` | jelly | topic answer word |
| 2863 | `tw_juice.m4a` | juice | topic answer word |
| 2864 | `tq_lt_e2_10.m4a` | Which comes last? | Letters / ABC order (E) |
| 2865 | `tw_zebra.m4a` | zebra | topic answer word |
| 2866 | `tw_yak.m4a` | yak | topic answer word |
| 2867 | `tw_wolf.m4a` | wolf | topic answer word |
| 2868 | `tq_lt_e3_1.m4a` | Which is a vowel? | Letters / Vowels and long or short sounds (E) |
| 2869 | `tf_lt_e3_1.m4a` | The vowels are a, e, i, o, u. | fact after a right answer (spoken at 2-5, read at 6+) |
| 2870 | `tq_lt_e3_2.m4a` | Which is a vowel? | Letters / Vowels and long or short sounds (E) |
| 2871 | `tq_lt_e3_3.m4a` | Which is NOT a vowel? | Letters / Vowels and long or short sounds (E) |
| 2872 | `tq_lt_e3_4.m4a` | Which word has a short a? | Letters / Vowels and long or short sounds (E) |
| 2873 | `tq_lt_e3_5.m4a` | Which word has a long a? | Letters / Vowels and long or short sounds (E) |
| 2874 | `tq_lt_e3_6.m4a` | Which word has a long i? | Letters / Vowels and long or short sounds (E) |
| 2875 | `tw_kite.m4a` | kite | topic answer word |
| 2876 | `tw_sit.m4a` | sit | topic answer word |
| 2877 | `tq_lt_e3_7.m4a` | Which word has a short o? | Letters / Vowels and long or short sounds (E) |
| 2878 | `tw_boat.m4a` | boat | topic answer word |
| 2879 | `tw_nose.m4a` | nose | topic answer word |
| 2880 | `tq_lt_e3_8.m4a` | Which word has a long o? | Letters / Vowels and long or short sounds (E) |
| 2881 | `tw_hot.m4a` | hot | topic answer word |
| 2882 | `tw_pot.m4a` | pot | topic answer word |
| 2883 | `tq_lt_e3_9.m4a` | Which word has a short u? | Letters / Vowels and long or short sounds (E) |
| 2884 | `tw_bug.m4a` | bug | topic answer word |
| 2885 | `tw_flute.m4a` | flute | topic answer word |
| 2886 | `tq_lt_e3_10.m4a` | Which word has a long e? | Letters / Vowels and long or short sounds (E) |
| 2887 | `tw_net.m4a` | net | topic answer word |
| 2888 | `tq_lt_e4_1.m4a` | Which word starts with sh? | Letters / Letter teams (E) |
| 2889 | `tw_ship.m4a` | ship | topic answer word |
| 2890 | `tw_chip.m4a` | chip | topic answer word |
| 2891 | `tw_tip.m4a` | tip | topic answer word |
| 2892 | `tq_lt_e4_2.m4a` | Which word starts with ch? | Letters / Letter teams (E) |
| 2893 | `tw_chair.m4a` | chair | topic answer word |
| 2894 | `tw_share.m4a` | share | topic answer word |
| 2895 | `tw_hair.m4a` | hair | topic answer word |
| 2896 | `tq_lt_e4_3.m4a` | Which word starts with th? | Letters / Letter teams (E) |
| 2897 | `tw_thumb.m4a` | thumb | topic answer word |
| 2898 | `tw_dumb.m4a` | dumb | topic answer word |
| 2899 | `tw_chum.m4a` | chum | topic answer word |
| 2900 | `tq_lt_e4_4.m4a` | Which word starts with wh? | Letters / Letter teams (E) |
| 2901 | `tw_whale.m4a` | whale | topic answer word |
| 2902 | `tw_tale.m4a` | tale | topic answer word |
| 2903 | `tw_shale.m4a` | shale | topic answer word |
| 2904 | `tq_lt_e4_5.m4a` | Which word ends with ck? | Letters / Letter teams (E) |
| 2905 | `tw_dug.m4a` | dug | topic answer word |
| 2906 | `tw_dusk.m4a` | dusk | topic answer word |
| 2907 | `tq_lt_e4_6.m4a` | Which word ends with sh? | Letters / Letter teams (E) |
| 2908 | `tw_fist.m4a` | fist | topic answer word |
| 2909 | `tw_fit.m4a` | fit | topic answer word |
| 2910 | `tq_lt_e4_7.m4a` | Which word ends with ch? | Letters / Letter teams (E) |
| 2911 | `tw_lunch.m4a` | lunch | topic answer word |
| 2912 | `tw_lung.m4a` | lung | topic answer word |
| 2913 | `tw_luck.m4a` | luck | topic answer word |
| 2914 | `tq_lt_e4_8.m4a` | Which word ends with th? | Letters / Letter teams (E) |
| 2915 | `tw_bath.m4a` | bath | topic answer word |
| 2916 | `tw_bash.m4a` | bash | topic answer word |
| 2917 | `tq_lt_e4_9.m4a` | Which word starts with sh? | Letters / Letter teams (E) |
| 2918 | `tw_cheap.m4a` | cheap | topic answer word |
| 2919 | `tw_jeep.m4a` | jeep | topic answer word |
| 2920 | `tq_lt_e4_10.m4a` | Which word starts with ch? | Letters / Letter teams (E) |
| 2921 | `tw_cheese.m4a` | cheese | topic answer word |
| 2922 | `tw_sneeze.m4a` | sneeze | topic answer word |
| 2923 | `tw_these.m4a` | these | topic answer word |

## Lemonade Stand — later (134)

Read by the device voice until recorded (stand1). Friendly shop-keeper voice; customers giggle, never grumble.

| # | File name | Say this | Note |
|---:|---|---|---|
| 2924 | `ls_title.m4a` | Lemonade Stand |  |
| 2925 | `ls_hello.m4a` | Welcome to the lemonade stand! Let's help our friends. |  |
| 2926 | `ls_sunny.m4a` | It's a sunny day! One more friend is coming. |  |
| 2927 | `ls_warmup.m4a` | Let's warm up! | Before the first stand orders on a new ladder |
| 2928 | `ls_easy.m4a` | Here's an easy one! | An easier customer after a few oopsies |
| 2929 | `ls_speedy.m4a` | Speedy! You know this one. Let's try something new! |  |
| 2930 | `ls_this_one.m4a` | Can I have this one, please? | Toddler order: match the picture |
| 2931 | `ls_color_yellow.m4a` | Can I have the yellow one, please? |  |
| 2932 | `ls_color_pink.m4a` | Can I have the pink one, please? |  |
| 2933 | `ls_color_blue.m4a` | Can I have the blue one, please? |  |
| 2934 | `ls_color_green.m4a` | Can I have the green one, please? |  |
| 2935 | `ls_i_want.m4a` | Can I have | Followed by a number and a food, e.g. "Can I have" + "3" + "strawberries" |
| 2936 | `ls_have.m4a` | I have | Counting on: "I have" + 4 + "strawberries." + "Then" + 1 + "more, please!" |
| 2937 | `ls_then.m4a` | Then |  |
| 2938 | `ls_more.m4a` | more, please! |  |
| 2939 | `ls_only.m4a` | Can I have | Sorting: "Can I have" + 3 + "red" + "fruits? Only that color, please!" |
| 2940 | `ls_fruit.m4a` | fruits? Only that color, please! |  |
| 2941 | `ls_read_ticket.m4a` | Here's my order. Can you read my ticket? |  |
| 2942 | `ls_and.m4a` | and |  |
| 2943 | `ls_no.m4a` | No |  |
| 2944 | `ls_silly.m4a` | Hee hee! A silly order! Can I have | Followed by a number and pickles |
| 2945 | `ls_giggle.m4a` | Hee hee! Pickle lemonade! |  |
| 2946 | `ls_oops_no.m4a` | Oops! I said no | Followed by the food, e.g. "Oops! I said no" + "cheese" |
| 2947 | `ls_oops_more.m4a` | Hmm, I think I need a little more! |  |
| 2948 | `ls_oops_less.m4a` | Whoa, that's a lot! A little less, please. |  |
| 2949 | `ls_oops_wrong.m4a` | Hee hee, that's not on my order! |  |
| 2950 | `ls_oops_color.m4a` | Hee hee, that one's a different color! |  |
| 2951 | `ls_that_is.m4a` | That's | Followed by a number and "dollars." |
| 2952 | `ls_dollar.m4a` | dollar. |  |
| 2953 | `ls_dollars.m4a` | dollars. |  |
| 2954 | `ls_price_is.m4a` | It's | Adding prices: "It's" + 3 + "plus" + 2 |
| 2955 | `ls_plus.m4a` | plus |  |
| 2956 | `ls_enough.m4a` | Do I have enough? |  |
| 2957 | `ls_yes_enough.m4a` | Yes! I have enough. Here you go! |  |
| 2958 | `ls_not_enough.m4a` | Not enough? That's okay! I'll get a smaller one. |  |
| 2959 | `ls_enough_oops.m4a` | Hmm, let's count my bills together. |  |
| 2960 | `ls_pay_more.m4a` | Hmm, I think I owe a little more. |  |
| 2961 | `ls_pay_less.m4a` | Oops, that's too much! Give some back. |  |
| 2962 | `ls_thanks.m4a` | Thank you! |  |
| 2963 | `ls_tip.m4a` | Here's a tip for you! |  |
| 2964 | `ls_surprise_tip.m4a` | Surprise! An extra tip! |  |
| 2965 | `ls_rush_ask.m4a` | Rush hour! Some friends are in a hurry. Want to try? |  |
| 2966 | `ls_rush_go.m4a` | Ready, set, go! |  |
| 2967 | `ls_rush_win.m4a` | Rush bonus! You were super speedy! |  |
| 2968 | `ls_rush_done.m4a` | Phew! Rush hour is over. Great helping! |  |
| 2969 | `ls_jar.m4a` | Let's count the tip jar! |  |
| 2970 | `ls_jar_tap.m4a` | Tap each one to count. |  |
| 2971 | `ls_jar_oops.m4a` | Let's count together! |  |
| 2972 | `ls_day_done.m4a` | What a great day at the stand! |  |
| 2973 | `ls_a.m4a` | a | Longer tickets: "a" + "sandwich" |
| 2974 | `ls_with.m4a` | with | "a sandwich" + "with" + 2 + "pickles" |
| 2975 | `ls_but_no.m4a` | but no | "... but no" + "cheese" |
| 2976 | `ls_id_like.m4a` | I'd like | Followed by a number and a food |
| 2977 | `ls_please.m4a` | please! |  |
| 2978 | `ls_and_round.m4a` | things that are round, please! | Two-rule sorting: "Can I have" + 3 + "red" + "things that are round, please!" |
| 2979 | `ls_not_round.m4a` | things that are NOT round, please! | Two-rule sorting: "Can I have" + 3 + "green" + "things that are NOT round, please!" |
| 2980 | `ls_oops_round.m4a` | Hee hee, I said round ones! |  |
| 2981 | `ls_oops_notround.m4a` | Hee hee, that one's round! I said NOT round. |  |
| 2982 | `ls_make_it.m4a` | Make it | Doubling: "Make it" + 2 + "sandwiches" + "with" + 3 + "pickles" + "each, please!" |
| 2983 | `ls_each.m4a` | each, please! |  |
| 2984 | `ls_double.m4a` | Now double it all, please! | Doubling: after the list, make two times as many of everything |
| 2985 | `ls_remember.m4a` | Here's my order. Can you remember it? My ticket will flip over! | Remember the order: then the ticket is read aloud |
| 2986 | `ls_peek.m4a` | Peek! Here it is again. |  |
| 2987 | `ls_it_lemonade.m4a` | lemonade |  |
| 2988 | `ls_its_lemonade.m4a` | lemonades |  |
| 2989 | `ls_it_pinklem.m4a` | pink lemonade |  |
| 2990 | `ls_its_pinklem.m4a` | pink lemonades |  |
| 2991 | `ls_it_bluelem.m4a` | blueberry lemonade |  |
| 2992 | `ls_its_bluelem.m4a` | blueberry lemonades |  |
| 2993 | `ls_it_greenlem.m4a` | mint lemonade |  |
| 2994 | `ls_its_greenlem.m4a` | mint lemonades |  |
| 2995 | `ls_it_cookie.m4a` | cookie |  |
| 2996 | `ls_its_cookie.m4a` | cookies |  |
| 2997 | `ls_it_pretzel.m4a` | pretzel |  |
| 2998 | `ls_its_pretzel.m4a` | pretzels |  |
| 2999 | `ls_it_strawberry.m4a` | strawberry |  |
| 3000 | `ls_its_strawberry.m4a` | strawberries |  |
| 3001 | `ls_it_apple.m4a` | apple |  |
| 3002 | `ls_its_apple.m4a` | apples |  |
| 3003 | `ls_it_cherry.m4a` | cherry |  |
| 3004 | `ls_its_cherry.m4a` | cherries |  |
| 3005 | `ls_it_banana.m4a` | banana |  |
| 3006 | `ls_its_banana.m4a` | bananas |  |
| 3007 | `ls_it_blueberry.m4a` | blueberry |  |
| 3008 | `ls_its_blueberry.m4a` | blueberries |  |
| 3009 | `ls_it_grapes.m4a` | grape |  |
| 3010 | `ls_its_grapes.m4a` | grapes |  |
| 3011 | `ls_it_kiwi.m4a` | kiwi |  |
| 3012 | `ls_its_kiwi.m4a` | kiwis |  |
| 3013 | `ls_it_orange.m4a` | orange |  |
| 3014 | `ls_its_orange.m4a` | oranges |  |
| 3015 | `ls_it_sandwich.m4a` | sandwich |  |
| 3016 | `ls_its_sandwich.m4a` | sandwiches |  |
| 3017 | `ls_it_ice.m4a` | ice cube |  |
| 3018 | `ls_its_ice.m4a` | ice cubes |  |
| 3019 | `ls_it_cheese.m4a` | cheese |  |
| 3020 | `ls_its_cheese.m4a` | cheese |  |
| 3021 | `ls_it_pickle.m4a` | pickle |  |
| 3022 | `ls_its_pickle.m4a` | pickles |  |
| 3023 | `ls_c_red.m4a` | red |  |
| 3024 | `ls_c_yellow.m4a` | yellow |  |
| 3025 | `ls_c_blue.m4a` | blue |  |
| 3026 | `ls_c_green.m4a` | green |  |
| 3027 | `ls_c_pink.m4a` | pink |  |
| 3028 | `ls_c_purple.m4a` | purple |  |
| 3029 | `ls_c_orange.m4a` | orange |  |
| 3030 | `ls_c_brown.m4a` | brown |  |
| 3031 | `ls_react_strawberry.m4a` | Berry yummy! Thank you! | Said by Jammy after a Lemonade Stand order |
| 3032 | `ls_react_apple.m4a` | Mmm, nice and crisp! Thank you! | Said by Crisp after a Lemonade Stand order |
| 3033 | `ls_react_corn.m4a` | Aw, shucks! That is a-maize-ing! | Said by Niblet after a Lemonade Stand order |
| 3034 | `ls_react_blueberry.m4a` | Bloop bloop! So yummy! | Said by Bloop after a Lemonade Stand order |
| 3035 | `ls_react_mochi.m4a` | Squishy hugs for you! Yum! | Said by Dora Dumpling after a Lemonade Stand order |
| 3036 | `ls_react_banana.m4a` | I am going bananas! Yum! | Said by Peel after a Lemonade Stand order |
| 3037 | `ls_react_pear.m4a` | We make a great pear! Thank you! | Said by Petey Pear after a Lemonade Stand order |
| 3038 | `ls_react_carrot.m4a` | Crunch crunch! So good! | Said by Crunch after a Lemonade Stand order |
| 3039 | `ls_react_broccoli.m4a` | That makes me stand tall! Thanks! | Said by Brock after a Lemonade Stand order |
| 3040 | `ls_react_sushi.m4a` | Perfect! Thank you very much. | Said by Umi after a Lemonade Stand order |
| 3041 | `ls_react_taco.m4a` | Taco-tastic! Woo hoo! | Said by Guac after a Lemonade Stand order |
| 3042 | `ls_react_pizza.m4a` | You're a-pizza-zing! | Said by Slice after a Lemonade Stand order |
| 3043 | `ls_react_pancake.m4a` | Stack it up! Yummy! | Said by Maple after a Lemonade Stand order |
| 3044 | `ls_react_cupcake.m4a` | Sprinkle sprinkle! So sweet! | Said by Sprinkles after a Lemonade Stand order |
| 3045 | `ls_react_avocado.m4a` | Avo great day! Thanks! | Said by Avo after a Lemonade Stand order |
| 3046 | `ls_react_watermelon.m4a` | You're one in a melon! | Said by Mellie after a Lemonade Stand order |
| 3047 | `ls_react_pretzel.m4a` | Twisty-licious! Thank you! | Said by Twist after a Lemonade Stand order |
| 3048 | `ls_react_grapes.m4a` | Grape job! Thanks! | Said by Vinnie after a Lemonade Stand order |
| 3049 | `ls_react_onigiri.m4a` | Rice and easy! Thank you. | Said by Nori after a Lemonade Stand order |
| 3050 | `ls_react_pineapple.m4a` | Sharp and sweet! Thanks! | Said by Spike after a Lemonade Stand order |
| 3051 | `ls_react_waffle.m4a` | No waffling, that is perfect! | Said by Wally after a Lemonade Stand order |
| 3052 | `ls_react_lemon.m4a` | Easy peasy, lemon squeezy! | Said by Zest after a Lemonade Stand order |
| 3053 | `ls_react_donut.m4a` | Donut you worry, it is perfect! | Said by Minty after a Lemonade Stand order |
| 3054 | `ls_react_popcorn.m4a` | Pop pop hooray! | Said by Popper after a Lemonade Stand order |
| 3055 | `ls_react_peach.m4a` | Everything's peachy! Thank you! | Said by Peachy after a Lemonade Stand order |
| 3056 | `ls_react_cheese.m4a` | Gouda job! Hee hee! | Said by Gouda after a Lemonade Stand order |
| 3057 | `ls_react_cookie.m4a` | Crunchy and yummy! Thanks! | Said by Chip after a Lemonade Stand order |

## Bubble Pop — later (87)

Read by the device voice until recorded (bubble1). Light, bubbly voice; a wrong pop is only ever a giggle.

| # | File name | Say this | Note |
|---:|---|---|---|
| 3058 | `bp_title.m4a` | Bubble Pop |  |
| 3059 | `bp_hello.m4a` | Let's pop some bubbles! |  |
| 3060 | `bp_warmup.m4a` | Let's warm up! |  |
| 3061 | `bp_easy.m4a` | Here's an easy one! |  |
| 3062 | `bp_speedy.m4a` | Speedy! You know this one. Let's try something new! |  |
| 3063 | `bp_next.m4a` | Next one! |  |
| 3064 | `bp_hint.m4a` | Look for the shiny ones! |  |
| 3065 | `bp_pop_any.m4a` | Pop the bubbles! | Toddlers: every bubble pops |
| 3066 | `bp_pop_the.m4a` | Pop the | Followed by the target, e.g. "Pop the" + 7 |
| 3067 | `bp_ones.m4a` | ones! |  |
| 3068 | `bp_bubble.m4a` | bubble! |  |
| 3069 | `bp_bubbles.m4a` | bubbles! |  |
| 3070 | `bp_peek.m4a` | Peekaboo! Pop a bubble! |  |
| 3071 | `bp_boo.m4a` | Boo! |  |
| 3072 | `bp_its_a.m4a` | It's a |  |
| 3073 | `bp_big.m4a` | Pop the big bubbles! |  |
| 3074 | `bp_little.m4a` | Pop the little bubbles! |  |
| 3075 | `bp_w_big.m4a` | big |  |
| 3076 | `bp_w_little.m4a` | little |  |
| 3077 | `bp_count.m4a` | Let's count! Pop | Followed by 3 or 5 and "bubbles!" |
| 3078 | `bp_pop_n.m4a` | Pop | "Pop" + 3 + "ducks" |
| 3079 | `bp_says.m4a` | Pop the animal that says | Followed by the animal sound |
| 3080 | `bp_starts.m4a` | Pop the letter that starts | Followed by a word, e.g. "ball" |
| 3081 | `bp_bigger.m4a` | Which is bigger? | "Which is bigger?" + 6 + "or" + 9 |
| 3082 | `bp_or.m4a` | or |  |
| 3083 | `bp_order.m4a` | Pop the numbers in order, from 1 to | Followed by 5 or 10 |
| 3084 | `bp_find_word.m4a` | Find the word | Followed by a sight word |
| 3085 | `bp_answer.m4a` | Pop the answer! | "Pop the answer!" + 8 + "plus" + 5 |
| 3086 | `bp_plus.m4a` | plus |  |
| 3087 | `bp_even.m4a` | even numbers! |  |
| 3088 | `bp_odd.m4a` | odd numbers! |  |
| 3089 | `bp_rhyme.m4a` | Pop the words that rhyme with | Followed by a word, e.g. "cat" |
| 3090 | `bp_missing.m4a` | Which letter is missing? Pop it! The word is | Followed by the word |
| 3091 | `bp_make10.m4a` | Pop all the ways to make 10! |  |
| 3092 | `bp_make.m4a` | Pop all the ways to make | Followed by 5, 8, 12, 14 or 15 |
| 3093 | `bp_minus.m4a` | minus |  |
| 3094 | `bp_skip.m4a` | Skip-count by | Followed by 2, 5 or 10; pop them in order |
| 3095 | `bp_spell.m4a` | Spell | Followed by the word; pop its letters in order |
| 3096 | `bp_giggle.m4a` | Hee hee! Boing! | A wrong bubble bounces away (never a penalty) |
| 3097 | `bp_yay.m4a` | Pop! |  |
| 3098 | `bp_great.m4a` | Great popping! |  |
| 3099 | `bp_golden.m4a` | Ooh! A golden bubble! |  |
| 3100 | `bp_storm_ask.m4a` | Bubble storm! Want to pop as many as you can, super fast? |  |
| 3101 | `bp_storm_go.m4a` | Ready, set, pop! |  |
| 3102 | `bp_storm_win.m4a` | Storm bonus! You were super speedy! |  |
| 3103 | `bp_storm_done.m4a` | Phew! The storm is over. Great popping! |  |
| 3104 | `bp_round_done.m4a` | Pop-tastic! What a lot of bubbles! |  |
| 3105 | `bp_c_red.m4a` | red |  |
| 3106 | `bp_c_blue.m4a` | blue |  |
| 3107 | `bp_c_yellow.m4a` | yellow |  |
| 3108 | `bp_c_green.m4a` | green |  |
| 3109 | `bp_c_purple.m4a` | purple |  |
| 3110 | `bp_c_orange.m4a` | orange |  |
| 3111 | `bp_sh_circle.m4a` | circle |  |
| 3112 | `bp_shs_circle.m4a` | circles! |  |
| 3113 | `bp_sh_square.m4a` | square |  |
| 3114 | `bp_shs_square.m4a` | squares! |  |
| 3115 | `bp_sh_triangle.m4a` | triangle |  |
| 3116 | `bp_shs_triangle.m4a` | triangles! |  |
| 3117 | `bp_sh_star.m4a` | star |  |
| 3118 | `bp_shs_star.m4a` | stars! |  |
| 3119 | `bp_sh_heart.m4a` | heart |  |
| 3120 | `bp_shs_heart.m4a` | hearts! |  |
| 3121 | `bp_an_cow.m4a` | cow |  |
| 3122 | `bp_ans_cow.m4a` | cows! |  |
| 3123 | `bp_snd_cow.m4a` | moo |  |
| 3124 | `bp_an_duck.m4a` | duck |  |
| 3125 | `bp_ans_duck.m4a` | ducks! |  |
| 3126 | `bp_snd_duck.m4a` | quack |  |
| 3127 | `bp_an_frog.m4a` | frog |  |
| 3128 | `bp_ans_frog.m4a` | frogs! |  |
| 3129 | `bp_snd_frog.m4a` | ribbit |  |
| 3130 | `bp_an_pig.m4a` | pig |  |
| 3131 | `bp_ans_pig.m4a` | pigs! |  |
| 3132 | `bp_snd_pig.m4a` | oink |  |
| 3133 | `bp_an_dog.m4a` | dog |  |
| 3134 | `bp_ans_dog.m4a` | dogs! |  |
| 3135 | `bp_snd_dog.m4a` | woof |  |
| 3136 | `bp_an_cat.m4a` | cat |  |
| 3137 | `bp_ans_cat.m4a` | cats! |  |
| 3138 | `bp_snd_cat.m4a` | meow |  |
| 3139 | `bp_an_sheep.m4a` | sheep |  |
| 3140 | `bp_ans_sheep.m4a` | sheep! |  |
| 3141 | `bp_snd_sheep.m4a` | baa |  |
| 3142 | `bp_an_fish.m4a` | fish |  |
| 3143 | `bp_ans_fish.m4a` | fish! |  |
| 3144 | `bp_snd_fish.m4a` | blub |  |

## Story mode v2 — later (33)

Read by the device voice until recorded (story2). Warm, cozy storyteller; the mini boss is a fun challenge, never scary.

| # | File name | Say this | Note |
|---:|---|---|---|
| 3145 | `s2_world.m4a` | Here is our picnic world! Tap a place. |  |
| 3146 | `s2_new_place.m4a` | Yay! A new place! |  |
| 3147 | `s2_boss.m4a` | Mini boss! A big, fun challenge. Take your time. |  |
| 3148 | `s2_who.m4a` | Who is the hero? Pick a friend. |  |
| 3149 | `s2_tomorrow.m4a` | Hooray! You did the mini boss! A new path will be ready next time. |  |
| 3150 | `s2_switched.m4a` | Now the hero is | Followed by the friend name (device voice) |
| 3151 | `s2_place_meadow.m4a` | Berry Meadow! Butterflies and flowers everywhere. |  |
| 3152 | `s2_place_lagoon.m4a` | Letter Lagoon! Hop along the lily pads with the frog. |  |
| 3153 | `s2_place_hills.m4a` | Muffin Hills! Ding ding, the muffin bells are ringing. |  |
| 3154 | `s2_place_woods.m4a` | Word Woods! The fireflies glow and the owl says hoo hoo. |  |
| 3155 | `s2_place_peaks.m4a` | Pancake Peaks! Up, up the fluffy mountains. |  |
| 3156 | `s2_place_bay.m4a` | Melon Bay! Splash in the waves and find the shells. |  |
| 3157 | `s2_place_caves.m4a` | Cookie Caves! Sparkly crystals, drip, drop. |  |
| 3158 | `s2_tag_strawberry.m4a` | With a picnic plan, we will find everyone! | Hero line at a new place (strawberry) |
| 3159 | `s2_bosscheer_strawberry.m4a` | A plan and a smile. You can do it! | Hero cheer before a mini boss (strawberry) |
| 3160 | `s2_tag_apple.m4a` | My compass points this way. Let's explore! | Hero line at a new place (apple) |
| 3161 | `s2_bosscheer_apple.m4a` | Explorers try big things. Let's try! | Hero cheer before a mini boss (apple) |
| 3162 | `s2_tag_corn.m4a` | Knock knock! It's us, coming to find you! | Hero line at a new place (corn) |
| 3163 | `s2_bosscheer_corn.m4a` | Big challenge? Big giggles! Let's go! | Hero cheer before a mini boss (corn) |
| 3164 | `s2_tag_blueberry.m4a` | Boing! I can see far from up here! | Hero line at a new place (blueberry) |
| 3165 | `s2_bosscheer_blueberry.m4a` | Boing boing! Let's bounce through it! | Hero cheer before a mini boss (blueberry) |
| 3166 | `s2_tag_other.m4a` | Let's go find our friends together! | Hero line at a new place (other) |
| 3167 | `s2_bosscheer_other.m4a` | This one is big and fun. Let's try! | Hero cheer before a mini boss (other) |
| 3168 | `story2_intro_1_simple.m4a` | The sun is out. {hero} and the friends have a big picnic. | Intro page 1 (simple); {hero} and {food} are filled in by the device voice |
| 3169 | `story2_intro_1_rich.m4a` | It was a bright, sunny morning, and {hero} the {food} had planned the biggest picnic ever. | Intro page 1 (rich); {hero} and {food} are filled in by the device voice |
| 3170 | `story2_intro_2_simple.m4a` | Niblet is so silly! We all laugh and play. | Intro page 2 (simple); {hero} and {food} are filled in by the device voice |
| 3171 | `story2_intro_2_rich.m4a` | The food friends munched and played on the checkered blanket. Niblet told a corny joke, and everyone giggled. | Intro page 2 (rich); {hero} and {food} are filled in by the device voice |
| 3172 | `story2_intro_3_simple.m4a` | The friends look up. Oh no! The sky is gray. | Intro page 3 (simple); {hero} and {food} are filled in by the device voice |
| 3173 | `story2_intro_3_rich.m4a` | Suddenly the friends looked up. The sun was gone, and the sky turned gloomy and gray. | Intro page 3 (rich); {hero} and {food} are filled in by the device voice |
| 3174 | `story2_intro_4_simple.m4a` | Whoosh! Away go some of our friends! | Intro page 4 (simple); {hero} and {food} are filled in by the device voice |
| 3175 | `story2_intro_4_rich.m4a` | Whoosh! Balloons, books, and the picnic basket swirled into the air, and some of our friends tumbled away like dandelion fluff. | Intro page 4 (rich); {hero} and {food} are filled in by the device voice |
| 3176 | `story2_intro_5_simple.m4a` | {hero} and the friends are sad. "We can find them," said {hero}. "Let's go!" | Intro page 5 (simple); {hero} and {food} are filled in by the device voice |
| 3177 | `story2_intro_5_rich.m4a` | {hero} and the other friends stared at the empty blanket. Then {hero} stood tall. "Let's go! We will follow the paths and find every single friend." | Intro page 5 (rich); {hero} and {food} are filled in by the device voice |

## Fun breaks and coloring — later (161)

Read by the device voice until recorded (p4). Giggly, playful, never a test: no right or wrong.

| # | File name | Say this | Note |
|---:|---|---|---|
| 3178 | `br_skip.m4a` | Skip | Big skip button |
| 3179 | `br_done.m4a` | All done! Back to play! | End of a break |
| 3180 | `br_fun.m4a` | Fun break time! | Start of a break |
| 3181 | `br_dance.m4a` | Dance party! Copy the moves! | Dance break |
| 3182 | `br_freeze.m4a` | Freeze! | Freeze dance: the music stops |
| 3183 | `br_unfreeze.m4a` | Ha ha! Dance again! | Freeze dance: the music restarts |
| 3184 | `br_count.m4a` | Let us count together! | Counting dance (readers) |
| 3185 | `br_jump5.m4a` | Jump five times! | Counting dance |
| 3186 | `br_clap5.m4a` | Clap five times! | Counting dance |
| 3187 | `br_stomp5.m4a` | Stomp five times! | Counting dance |
| 3188 | `br_joke.m4a` | Joke time! Tap to hear the silly part! | Joke break |
| 3189 | `br_tapjoke.m4a` | Tap for the silly part! | Joke: waiting for the tap |
| 3190 | `br_laugh.m4a` | Ha ha ha! Hee hee hee! | Friends crack up |
| 3191 | `br_skit.m4a` | Silly show! Tap to see what happens! | Skit break |
| 3192 | `br_tapnext.m4a` | Tap to see what happens next! | Skit: waiting for the tap |
| 3193 | `br_peek.m4a` | Peekaboo! Where is your friend hiding? | Peekaboo break |
| 3194 | `br_peek_found.m4a` | Peekaboo! You found me! | Peekaboo: found |
| 3195 | `br_peek_bug.m4a` | Not here! Just a ladybug. Hee hee! | Peekaboo: a funny surprise in an empty spot |
| 3196 | `br_sounds.m4a` | Silly sounds! Tap your friends to make a song! | Sound machine break |
| 3197 | `br_playsong.m4a` | Here is your song! | Sound machine: play back |
| 3198 | `br_dress.m4a` | Dress up time! Tap a hat, glasses or a cape! | Dress-up break |
| 3199 | `br_surprise.m4a` | Ooh! A surprise outfit! | Dress-up: a rare outfit appears |
| 3200 | `br_concert.m4a` | Concert time! Tap a friend to play or stop! | Mini concert break |
| 3201 | `br_pop.m4a` | Pop, pop, pop! Pop all you want! | Pop break |
| 3202 | `br_snow.m4a` | It is snowing! Catch the snowflakes! | Weather break: snow |
| 3203 | `br_rain.m4a` | Rain! Tap to splash in the puddles! | Weather break: rain |
| 3204 | `br_rainbow.m4a` | A rainbow! Tap for sparkles! | Weather break: rainbow |
| 3205 | `br_color.m4a` | Coloring time! Tap a color, then tap the picture! | Coloring break |
| 3206 | `cl_title.m4a` | Coloring | Free Play tile |
| 3207 | `cl_pick.m4a` | Pick a picture to color! | Page picker |
| 3208 | `cl_fill.m4a` | Tap a color, then tap a part of the picture! | Fill tool |
| 3209 | `cl_brush.m4a` | Draw with your finger! | Brush tool |
| 3210 | `cl_stickers.m4a` | Drag a sticker onto your picture! | Sticker tool |
| 3211 | `cl_undo.m4a` | Oops! Back one step. | Undo |
| 3212 | `cl_clear.m4a` | Start over! A fresh page. | Start over |
| 3213 | `cl_saved.m4a` | Beautiful! It is in your gallery! | Saved to the gallery |
| 3214 | `cl_gallery.m4a` | Your gallery! Swipe to see your pictures. | Gallery |
| 3215 | `cl_newpage.m4a` | A new picture to color! | A coloring page unlocked |
| 3216 | `cl_full.m4a` | Your gallery is full! A grown-up can make room. | Gallery cap |
| 3217 | `br_mv_wiggle.m4a` | Wiggle! | Dance move call-out |
| 3218 | `br_mv_spin.m4a` | Spin around! | Dance move call-out |
| 3219 | `br_mv_jump.m4a` | Jump! | Dance move call-out |
| 3220 | `br_mv_sway.m4a` | Sway side to side! | Dance move call-out |
| 3221 | `br_mv_clap.m4a` | Clap your hands! | Dance move call-out |
| 3222 | `br_mv_stomp.m4a` | Stomp your feet! | Dance move call-out |
| 3223 | `br_mv_shake.m4a` | Shake, shake, shake! | Dance move call-out |
| 3224 | `br_mv_reach.m4a` | Reach up high! | Dance move call-out |
| 3225 | `br_mv_squat.m4a` | Squish down low! | Dance move call-out |
| 3226 | `br_mv_twist.m4a` | Twist and twist! | Dance move call-out |
| 3227 | `br_j01_q.m4a` | What did the corn say when it got a big hug? | Joke setup (corn) |
| 3228 | `br_j01_p.m4a` | Aww, shucks! | Joke punchline (strawberry / corn) |
| 3229 | `br_j02_q.m4a` | Why did the strawberry call for help? | Joke setup (strawberry) |
| 3230 | `br_j02_p.m4a` | It was in a jam! | Joke punchline (blueberry / strawberry) |
| 3231 | `br_j03_q.m4a` | What does a blueberry say on a trampoline? | Joke setup (blueberry) |
| 3232 | `br_j03_p.m4a` | Boing, boing, berry fun! | Joke punchline (apple / blueberry) |
| 3233 | `br_j04_q.m4a` | What is red and goes up and down? | Joke setup (apple) |
| 3234 | `br_j04_p.m4a` | An apple in an elevator! | Joke punchline (corn / apple) |
| 3235 | `br_j05_q.m4a` | Knock knock! Who is there? Cow says. Cow says who? | Joke setup (corn) |
| 3236 | `br_j05_p.m4a` | No, silly! A cow says moo! | Joke punchline (blueberry / corn) |
| 3237 | `br_j06_q.m4a` | Knock knock! Who is there? Boo. Boo who? | Joke setup (strawberry) |
| 3238 | `br_j06_p.m4a` | Don't cry! It is only a joke! | Joke punchline (corn / strawberry) |
| 3239 | `br_j07_q.m4a` | Knock knock! Who is there? Lettuce. Lettuce who? | Joke setup (apple) |
| 3240 | `br_j07_p.m4a` | Lettuce in, it is chilly out here! | Joke punchline (strawberry / apple) |
| 3241 | `br_j08_q.m4a` | What do you call a sleeping dinosaur? | Joke setup (blueberry) |
| 3242 | `br_j08_p.m4a` | A dino-snore! Zzzz! | Joke punchline (strawberry / blueberry) |
| 3243 | `br_j09_q.m4a` | Why did the cookie go to the doctor? | Joke setup (corn) |
| 3244 | `br_j09_p.m4a` | It felt crummy! | Joke punchline (apple / corn) |
| 3245 | `br_j10_q.m4a` | What has ears but cannot hear? | Joke setup (apple) |
| 3246 | `br_j10_p.m4a` | A corn cob! Hey, that is me! | Joke punchline (corn / apple) |
| 3247 | `br_j11_q.m4a` | What do you call a bear with no teeth? | Joke setup (blueberry) |
| 3248 | `br_j11_p.m4a` | A gummy bear! | Joke punchline (corn / blueberry) |
| 3249 | `br_j12_q.m4a` | What did one plate say to the other plate? | Joke setup (corn) |
| 3250 | `br_j12_p.m4a` | Lunch is on me! | Joke punchline (strawberry / corn) |
| 3251 | `br_j13_q.m4a` | Why did the teddy bear say no to dessert? | Joke setup (strawberry) |
| 3252 | `br_j13_p.m4a` | It was already stuffed! | Joke punchline (blueberry / strawberry) |
| 3253 | `br_j14_q.m4a` | What do you call a funny mountain? | Joke setup (apple) |
| 3254 | `br_j14_p.m4a` | Hill-arious! | Joke punchline (blueberry / apple) |
| 3255 | `br_j15_q.m4a` | How do you make a tissue dance? | Joke setup (blueberry) |
| 3256 | `br_j15_p.m4a` | Put a little boogie in it! | Joke punchline (apple / blueberry) |
| 3257 | `br_j16_q.m4a` | Why did the banana go to the doctor? | Joke setup (corn) |
| 3258 | `br_j16_p.m4a` | It was not peeling well! | Joke punchline (blueberry / corn) |
| 3259 | `br_j17_q.m4a` | What falls down but never gets hurt? | Joke setup (strawberry) |
| 3260 | `br_j17_p.m4a` | Rain! Pitter patter! | Joke punchline (apple / strawberry) |
| 3261 | `br_j18_q.m4a` | What kind of tree fits in your hand? | Joke setup (apple) |
| 3262 | `br_j18_p.m4a` | A palm tree! | Joke punchline (strawberry / apple) |
| 3263 | `br_j19_q.m4a` | Knock knock! Who is there? Interrupting cow. Interrupting c... | Joke setup (corn) |
| 3264 | `br_j19_p.m4a` | Moooo! | Joke punchline (apple / corn) |
| 3265 | `br_j20_q.m4a` | Why are fish so smart? | Joke setup (strawberry) |
| 3266 | `br_j20_p.m4a` | They swim in schools! | Joke punchline (apple / strawberry) |
| 3267 | `br_j21_q.m4a` | What sound does a sneezing cow make? | Joke setup (apple) |
| 3268 | `br_j21_p.m4a` | Ah... ah... ah-MOO! | Joke punchline (blueberry / apple) |
| 3269 | `br_j22_q.m4a` | Why did the cow go to the movies? | Joke setup (blueberry) |
| 3270 | `br_j22_p.m4a` | To see a moo-vie! | Joke punchline (corn / blueberry) |
| 3271 | `br_j23_q.m4a` | What does a snowman eat for breakfast? | Joke setup (corn) |
| 3272 | `br_j23_p.m4a` | Snowflakes! Crunch, crunch! | Joke punchline (strawberry / corn) |
| 3273 | `br_j24_q.m4a` | Why did the egg hide? | Joke setup (strawberry) |
| 3274 | `br_j24_p.m4a` | It was a little chicken! | Joke punchline (blueberry / strawberry) |
| 3275 | `br_j25_q.m4a` | What is a cat's favorite color? | Joke setup (apple) |
| 3276 | `br_j25_p.m4a` | Purr-ple! | Joke punchline (corn / apple) |
| 3277 | `br_j26_q.m4a` | What is a ghost's favorite fruit? | Joke setup (blueberry) |
| 3278 | `br_j26_p.m4a` | Boo-berries! Like me! | Joke punchline (apple / blueberry) |
| 3279 | `br_j27_q.m4a` | What do you call a train that sneezes? | Joke setup (corn) |
| 3280 | `br_j27_p.m4a` | An achoo-choo train! | Joke punchline (blueberry / corn) |
| 3281 | `br_j28_q.m4a` | What does a cloud wear under its raincoat? | Joke setup (strawberry) |
| 3282 | `br_j28_p.m4a` | Thunderwear! | Joke punchline (corn / strawberry) |
| 3283 | `br_j29_q.m4a` | Why did the sun go to school? | Joke setup (apple) |
| 3284 | `br_j29_p.m4a` | To get brighter! | Joke punchline (strawberry / apple) |
| 3285 | `br_j30_q.m4a` | What do you call a duck that tells jokes? | Joke setup (blueberry) |
| 3286 | `br_j30_p.m4a` | A quack-up! | Joke punchline (strawberry / blueberry) |
| 3287 | `br_j31_q.m4a` | What room has no doors and no windows? | Joke setup (corn) |
| 3288 | `br_j31_p.m4a` | A mushroom! | Joke punchline (apple / corn) |
| 3289 | `br_j32_q.m4a` | What do you call a sleepy pancake? | Joke setup (strawberry) |
| 3290 | `br_j32_p.m4a` | A flap-snack! Yawn! | Joke punchline (blueberry / strawberry) |
| 3291 | `br_j33_q.m4a` | Why did the banana wear sunscreen? | Joke setup (banana) |
| 3292 | `br_j33_p.m4a` | So it would not peel! | Joke punchline (strawberry / banana) |
| 3293 | `br_j34_q.m4a` | What do you call two pears? | Joke setup (pear) |
| 3294 | `br_j34_p.m4a` | A pair! Hee hee! | Joke punchline (apple / pear) |
| 3295 | `br_j35_q.m4a` | What does a bunny use to fix its hair? | Joke setup (carrot) |
| 3296 | `br_j35_p.m4a` | A hare brush! | Joke punchline (corn / carrot) |
| 3297 | `br_j36_q.m4a` | Why was the pancake so happy? | Joke setup (pancake) |
| 3298 | `br_j36_p.m4a` | It had a whole stack of friends! | Joke punchline (blueberry / pancake) |
| 3299 | `br_k01_1.m4a` | Look! A butterfly! | Skit "The Butterfly" beat 1 |
| 3300 | `br_k01_2.m4a` | Bloop bounces after it. Boing! Boing! | Skit "The Butterfly" beat 2 |
| 3301 | `br_k01_3.m4a` | The butterfly lands on Bloop's nose! | Skit "The Butterfly" beat 3 |
| 3302 | `br_k01_4.m4a` | Ah... ah... achoo! Flutter, flutter! Hee hee! | Skit "The Butterfly" beat 4 |
| 3303 | `br_k02_1.m4a` | What a windy day! Whoosh! | Skit "The Windy Hat" beat 1 |
| 3304 | `br_k02_2.m4a` | Oh no! The hat blows away! | Skit "The Windy Hat" beat 2 |
| 3305 | `br_k02_3.m4a` | Crisp runs and runs after it! | Skit "The Windy Hat" beat 3 |
| 3306 | `br_k02_4.m4a` | The hat lands on a bird! Tweet tweet! Ha ha! | Skit "The Windy Hat" beat 4 |
| 3307 | `br_k03_1.m4a` | Niblet's nose feels tickly... | Skit "The Big Sneeze" beat 1 |
| 3308 | `br_k03_2.m4a` | Ah... ah... ah... | Skit "The Big Sneeze" beat 2 |
| 3309 | `br_k03_3.m4a` | Achoo! Niblet bounces up high! | Skit "The Big Sneeze" beat 3 |
| 3310 | `br_k03_4.m4a` | Boing, boing, plop! Bless you! | Skit "The Big Sneeze" beat 4 |
| 3311 | `br_k04_1.m4a` | Jammy makes a sandwich. | Skit "The Tall Sandwich" beat 1 |
| 3312 | `br_k04_2.m4a` | One more layer... and one more! | Skit "The Tall Sandwich" beat 2 |
| 3313 | `br_k04_3.m4a` | It is sooo tall! Wobble, wobble! | Skit "The Tall Sandwich" beat 3 |
| 3314 | `br_k04_4.m4a` | Plop! Sandwiches for everyone! Yum! | Skit "The Tall Sandwich" beat 4 |
| 3315 | `br_k05_1.m4a` | Crisp sits on top of the hill. | Skit "Roly-Poly Hill" beat 1 |
| 3316 | `br_k05_2.m4a` | Uh oh! Roll, roll, roll! | Skit "Roly-Poly Hill" beat 2 |
| 3317 | `br_k05_3.m4a` | Bump! Into a big pile of leaves! | Skit "Roly-Poly Hill" beat 3 |
| 3318 | `br_k05_4.m4a` | Crisp pops out with leafy hair! Ta-da! | Skit "Roly-Poly Hill" beat 4 |
| 3319 | `br_k06_1.m4a` | Hic! Bloop has the hiccups! | Skit "Hiccups" beat 1 |
| 3320 | `br_k06_2.m4a` | Hic! Every hiccup is a bounce! Hic! | Skit "Hiccups" beat 2 |
| 3321 | `br_k06_3.m4a` | Hold your breath, Bloop! Puff! | Skit "Hiccups" beat 3 |
| 3322 | `br_k06_4.m4a` | Pop! All gone! Hooray! | Skit "Hiccups" beat 4 |
| 3323 | `br_k07_1.m4a` | Here come the ants! March, march! | Skit "The Ant Parade" beat 1 |
| 3324 | `br_k07_2.m4a` | They carry one tiny crumb. | Skit "The Ant Parade" beat 2 |
| 3325 | `br_k07_3.m4a` | Now a giant cookie! Heave, ho! | Skit "The Ant Parade" beat 3 |
| 3326 | `br_k07_4.m4a` | Bye bye, ants! Wave bye bye! | Skit "The Ant Parade" beat 4 |
| 3327 | `br_k08_1.m4a` | Look! A big puddle! | Skit "The Big Puddle" beat 1 |
| 3328 | `br_k08_2.m4a` | One, two, three... jump! | Skit "The Big Puddle" beat 2 |
| 3329 | `br_k08_3.m4a` | Splash! Everyone is wet! | Skit "The Big Puddle" beat 3 |
| 3330 | `br_k08_4.m4a` | Shake, shake, shake! Like a puppy! | Skit "The Big Puddle" beat 4 |
| 3331 | `br_k09_1.m4a` | Let us build a snowman! | Skit "The Silly Snowman" beat 1 |
| 3332 | `br_k09_2.m4a` | Roll a big ball. Roll a small ball. | Skit "The Silly Snowman" beat 2 |
| 3333 | `br_k09_3.m4a` | A nose? Oops, it is a corn nose! | Skit "The Silly Snowman" beat 3 |
| 3334 | `br_k09_4.m4a` | The snowman giggles! Snow everywhere! | Skit "The Silly Snowman" beat 4 |
| 3335 | `br_k10_1.m4a` | Jammy throws the ball. Up, up! | Skit "The Bouncy Ball" beat 1 |
| 3336 | `br_k10_2.m4a` | Bloop wants to catch it! | Skit "The Bouncy Ball" beat 2 |
| 3337 | `br_k10_3.m4a` | Boing! The ball bounces on Bloop's head! | Skit "The Bouncy Ball" beat 3 |
| 3338 | `br_k10_4.m4a` | Bloop is the ball now! Bounce, bounce! | Skit "The Bouncy Ball" beat 4 |

## Quality pass 1 (new questions and asks) — later (31)

Read by the device voice until recorded (quality1). Calm, clear, like a teacher reading a question.

| # | File name | Say this | Note |
|---:|---|---|---|
| 3339 | `q1_bp_tens1.m4a` | Pop the number with | Bubble Pop tens and ones: + number, then "tens and" |
| 3340 | `q1_bp_tens2.m4a` | tens and | + number, then "ones." |
| 3341 | `q1_bp_tens3.m4a` | ones. |  |
| 3342 | `q1_bp_more10.m4a` | Pop the number that is 10 more than | + number |
| 3343 | `q1_bp_less10.m4a` | Pop the number that is 10 less than | + number |
| 3344 | `q1_bp_cloze.m4a` | Pop the word that fits. | Followed by the sentence |
| 3345 | `q1_ls_costs.m4a` | It costs | + number + "dollars" |
| 3346 | `q1_ls_paid.m4a` | They paid | + number + "dollars" |
| 3347 | `q1_ls_change.m4a` | How much change do they get back? |  |
| 3348 | `q1_tq_abc.m4a` | Which word comes first in ABC order? |  |
| 3349 | `q1_tq_thunder.m4a` | Thunder is the sound made by... |  |
| 3350 | `tw_east.m4a` | east | topic answer word |
| 3351 | `q1_howto.m4a` | How to play | Title of the how-to card |
| 3352 | `q1_howto_munch.m4a` | Read the question at the top. Walk your friend to a right answer and munch it! | How-to card: Picnic Munch |
| 3353 | `q1_howto_bubble.m4a` | Listen, or read the card at the top. Pop the bubbles that match! | How-to card: Bubble Pop |
| 3354 | `q1_howto_stand.m4a` | Listen to the order, or read the ticket. Tap what they ask for, then tap the big button! | How-to card: Lemonade Stand |
| 3355 | `q1_howto_tiny.m4a` | Listen for what to find. Tap the picture. Every tap is OK! | How-to card: Tiny Picnic |
| 3356 | `q1_howto_story.m4a` | Walk the path with your friends. Play each stop to find the missing star-snacks! | How-to card: Story |
| 3357 | `q1_pv_count.m4a` | How many in all? Count the tens, then the ones. |  |
| 3358 | `q1_pv_tensones1.m4a` | What number has | + number + "tens and" |
| 3359 | `q1_pv_tensones2.m4a` | tens and | + number + "ones?" |
| 3360 | `q1_pv_tensones3.m4a` | ones? |  |
| 3361 | `q1_pv_greater.m4a` | Which number is greater? |  |
| 3362 | `q1_pv_sign.m4a` | Which sign goes between | + number + "and" + number |
| 3363 | `q1_pv_and.m4a` | and |  |
| 3364 | `q1_pv_gt.m4a` | is greater than | between two numbers |
| 3365 | `q1_pv_lt.m4a` | is less than | between two numbers |
| 3366 | `q1_pv_eq.m4a` | is equal to | between two numbers |
| 3367 | `q1_pv_10more.m4a` | What is 10 more than | + number |
| 3368 | `q1_pv_10less.m4a` | What is 10 less than | + number |
| 3369 | `q1_pv_check.m4a` | Quick check! Tens and ones. | Place-value test-out card for players already past it |

---
*Generated from `js/core/voice-lines.js` by `tools/build-recording-script.js`. File names can end in .m4a, .mp3, .wav or .webm.*
