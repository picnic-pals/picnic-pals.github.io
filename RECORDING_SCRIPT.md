# Picnic Pals — Voice Recording Script

Hi grown-up! The arcade already talks, using friendly built-in voice clips (computer-generated, in `audio/voice-tts/`). Every line you record replaces that line with your voice — you can do a few at a time, in any order, and the grown-up area shows each line as “your voice”, “built-in clip” or “computer voice”.

## The short version

1. Start with the **Record first** sections: **1092 lines** (roughly 20–30 minutes). Everything else is for upcoming games and can wait.
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
| Picnic Munch story: Picnic Island | Later | 35 |
| Numbers 0–20 | **Record first** | 21 |
| Numbers 21–100 (optional, for later) | Later | 80 |
| Sight Words game (coming soon) | Later | 8 |
| Sight words: Dolch Pre-Primer (40) | Later | 40 |
| Sight words: Dolch Primer (52) | Later | 52 |
| Snack Slugger | **Record first** | 47 |
| Snack Slugger questions (sentence parts) | **Record first** | 9 |
| Penalty Kicks (coming soon) | Later | 15 |
| Picnic Spot | **Record first** | 38 |
| Coach v2: placement check, mistake hints, picnic story problems | **Record first** | 36 |
| Picnic friends: bios and room chatter | Later | 216 |
| Picnic Spot things (68) | Later | 68 |
| Dress Up hats and held items (34) | Later | 34 |
| Dress Up: how to earn each locked hat or item | Later | 26 |
| Bonus questions (127) | Later | 127 |
| Bonus question answers (232) | Later | 232 |
| Tiny Picnic (toddler mode) | **Record first** | 66 |
| Play-time limit & stretch breaks | **Record first** | 3 |
| **Record first, total** | | **1092** |
| Later (optional, upcoming games), total | | 933 |
| **Everything** | | **2025** |

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
| 619 | `rc_1_7.m4a` | Jammy heard a knock at the door. Jammy opened it and saw Grandma holding a big gift with a bow. What will Jammy do next? | reading passage + question (answers are not read aloud) |
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

## Picnic Munch story: Picnic Island — later (35)

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
| 888 | `beat_meadow.m4a` | Hi, I'm Jammy! The star-snacks landed in the corn. Let's count and find them! | Said by Strawberry when you arrive at Counting Cornfield |
| 889 | `beat_cliffs.m4a` | Crunch here! On Berry Beach, big and small numbers are hiding in the sand. Which one is bigger? | Said by Carrot when you arrive at Compare Berry Beach |
| 890 | `beat_beach.m4a` | Boing! I'm Bloop. The wind blew snacks under the broccoli trees. Let's add them up! | Said by Blueberry when you arrive at Add-Up Broccoli Woods |
| 891 | `beat_woods.m4a` | Hee hee! I'm Niblet. The squirrels nibbled some snacks. Take away and see what's left! | Said by Corn when you arrive at Take-Away Muffin Town |
| 892 | `beat_grove.m4a` | I'm Vinnie. The pancake gate only opens for numbers that make ten together! | Said by Grapes when you arrive at Make-Ten Pancake Peaks |
| 893 | `beat_town.m4a` | Welcome to the cocoa volcano! Every number here is ten and some more. | Said by Carrot when you arrive at Teen Cocoa Volcano |
| 894 | `beat_caves.m4a` | Ooh, a mystery at Melon Bay! A number is missing. Can you find the hidden one? | Said by Blueberry when you arrive at Mystery Melon Bay |
| 895 | `beat_bay.m4a` | The lolly lighthouse keeps lots of snacks. Time for bigger adding! | Said by Strawberry when you arrive at Big Sum Lolly Lighthouse |
| 896 | `beat_volcano.m4a` | So many apples! Take away big numbers to help the apple trees rest. | Said by Corn when you arrive at Take-Away Apple Grove |
| 897 | `beat_lighthouse.m4a` | The cookie caves echo even, odd, even, odd. This is the last area! | Said by Grapes when you arrive at Even-Odd Cookie Caves |
| 898 | `beat_lagoon.m4a` | Splish splash! Welcome to Letter Lemonade Lagoon. Colors, shapes, letters and words are floating in the lemonade. Let's munch them! | Said by Blueberry when you arrive at Letter Lemonade Lagoon |
| 899 | `beat_wordwoods.m4a` | Hello, reader! Welcome to Word Waffle Woods. Every waffle tree here has a word on it. Let's read them and munch them! | Said by Corn when you arrive at Word Waffle Woods |
| 900 | `unlock_mochi.m4a` | Dora Dumpling joined the team! |  |
| 901 | `hi_mochi.m4a` | Hi hi! I'm Dora Dumpling! Squishy hugs for everyone! Let's munch some snacks together! | Said by Dora Dumpling when they join the team (in their own personality) |
| 902 | `unlock_banana.m4a` | Peel joined the team! |  |
| 903 | `hi_banana.m4a` | Woo hoo! I'm Peel! Let's go bananas and munch together! | Said by Peel when they join the team (in their own personality) |
| 904 | `unlock_pear.m4a` | Petey Pear joined the team! |  |
| 905 | `hi_pear.m4a` | Hello, I'm Petey Pear. We make a great pair! Let's be friends. | Said by Petey Pear when they join the team (in their own personality) |
| 906 | `unlock_carrot.m4a` | Crunch joined the team! |  |
| 907 | `hi_carrot.m4a` | Crunch time! I'm Crunch! Ready, set, go! Let's run and munch together! | Said by Crunch when they join the team (in their own personality) |

## Numbers 0–20 — record first (21)

Say each number on its own, clearly and cheerfully (not like a question).

| # | File name | Say this | Note |
|---:|---|---|---|
| 908 | `num_0.m4a` | 0 |  |
| 909 | `num_1.m4a` | 1 |  |
| 910 | `num_2.m4a` | 2 |  |
| 911 | `num_3.m4a` | 3 |  |
| 912 | `num_4.m4a` | 4 |  |
| 913 | `num_5.m4a` | 5 |  |
| 914 | `num_6.m4a` | 6 |  |
| 915 | `num_7.m4a` | 7 |  |
| 916 | `num_8.m4a` | 8 |  |
| 917 | `num_9.m4a` | 9 |  |
| 918 | `num_10.m4a` | 10 |  |
| 919 | `num_11.m4a` | 11 |  |
| 920 | `num_12.m4a` | 12 |  |
| 921 | `num_13.m4a` | 13 |  |
| 922 | `num_14.m4a` | 14 |  |
| 923 | `num_15.m4a` | 15 |  |
| 924 | `num_16.m4a` | 16 |  |
| 925 | `num_17.m4a` | 17 |  |
| 926 | `num_18.m4a` | 18 |  |
| 927 | `num_19.m4a` | 19 |  |
| 928 | `num_20.m4a` | 20 |  |

## Numbers 21–100 (optional, for later) — later (80)

Only needed once games go past 20.

| # | File name | Say this | Note |
|---:|---|---|---|
| 929 | `num_21.m4a` | 21 |  |
| 930 | `num_22.m4a` | 22 |  |
| 931 | `num_23.m4a` | 23 |  |
| 932 | `num_24.m4a` | 24 |  |
| 933 | `num_25.m4a` | 25 |  |
| 934 | `num_26.m4a` | 26 |  |
| 935 | `num_27.m4a` | 27 |  |
| 936 | `num_28.m4a` | 28 |  |
| 937 | `num_29.m4a` | 29 |  |
| 938 | `num_30.m4a` | 30 |  |
| 939 | `num_31.m4a` | 31 |  |
| 940 | `num_32.m4a` | 32 |  |
| 941 | `num_33.m4a` | 33 |  |
| 942 | `num_34.m4a` | 34 |  |
| 943 | `num_35.m4a` | 35 |  |
| 944 | `num_36.m4a` | 36 |  |
| 945 | `num_37.m4a` | 37 |  |
| 946 | `num_38.m4a` | 38 |  |
| 947 | `num_39.m4a` | 39 |  |
| 948 | `num_40.m4a` | 40 |  |
| 949 | `num_41.m4a` | 41 |  |
| 950 | `num_42.m4a` | 42 |  |
| 951 | `num_43.m4a` | 43 |  |
| 952 | `num_44.m4a` | 44 |  |
| 953 | `num_45.m4a` | 45 |  |
| 954 | `num_46.m4a` | 46 |  |
| 955 | `num_47.m4a` | 47 |  |
| 956 | `num_48.m4a` | 48 |  |
| 957 | `num_49.m4a` | 49 |  |
| 958 | `num_50.m4a` | 50 |  |
| 959 | `num_51.m4a` | 51 |  |
| 960 | `num_52.m4a` | 52 |  |
| 961 | `num_53.m4a` | 53 |  |
| 962 | `num_54.m4a` | 54 |  |
| 963 | `num_55.m4a` | 55 |  |
| 964 | `num_56.m4a` | 56 |  |
| 965 | `num_57.m4a` | 57 |  |
| 966 | `num_58.m4a` | 58 |  |
| 967 | `num_59.m4a` | 59 |  |
| 968 | `num_60.m4a` | 60 |  |
| 969 | `num_61.m4a` | 61 |  |
| 970 | `num_62.m4a` | 62 |  |
| 971 | `num_63.m4a` | 63 |  |
| 972 | `num_64.m4a` | 64 |  |
| 973 | `num_65.m4a` | 65 |  |
| 974 | `num_66.m4a` | 66 |  |
| 975 | `num_67.m4a` | 67 |  |
| 976 | `num_68.m4a` | 68 |  |
| 977 | `num_69.m4a` | 69 |  |
| 978 | `num_70.m4a` | 70 |  |
| 979 | `num_71.m4a` | 71 |  |
| 980 | `num_72.m4a` | 72 |  |
| 981 | `num_73.m4a` | 73 |  |
| 982 | `num_74.m4a` | 74 |  |
| 983 | `num_75.m4a` | 75 |  |
| 984 | `num_76.m4a` | 76 |  |
| 985 | `num_77.m4a` | 77 |  |
| 986 | `num_78.m4a` | 78 |  |
| 987 | `num_79.m4a` | 79 |  |
| 988 | `num_80.m4a` | 80 |  |
| 989 | `num_81.m4a` | 81 |  |
| 990 | `num_82.m4a` | 82 |  |
| 991 | `num_83.m4a` | 83 |  |
| 992 | `num_84.m4a` | 84 |  |
| 993 | `num_85.m4a` | 85 |  |
| 994 | `num_86.m4a` | 86 |  |
| 995 | `num_87.m4a` | 87 |  |
| 996 | `num_88.m4a` | 88 |  |
| 997 | `num_89.m4a` | 89 |  |
| 998 | `num_90.m4a` | 90 |  |
| 999 | `num_91.m4a` | 91 |  |
| 1000 | `num_92.m4a` | 92 |  |
| 1001 | `num_93.m4a` | 93 |  |
| 1002 | `num_94.m4a` | 94 |  |
| 1003 | `num_95.m4a` | 95 |  |
| 1004 | `num_96.m4a` | 96 |  |
| 1005 | `num_97.m4a` | 97 |  |
| 1006 | `num_98.m4a` | 98 |  |
| 1007 | `num_99.m4a` | 99 |  |
| 1008 | `num_100.m4a` | 100 |  |

## Sight Words game (coming soon) — later (8)

| # | File name | Say this | Note |
|---:|---|---|---|
| 1009 | `sw_title.m4a` | Sight Words! |  |
| 1010 | `sw_find.m4a` | Find the word | + word |
| 1011 | `sw_read.m4a` | Can you read this word? |  |
| 1012 | `sw_listen.m4a` | Listen! |  |
| 1013 | `sw_that_says.m4a` | That word says | + word |
| 1014 | `sw_new_words.m4a` | Here are some new words! |  |
| 1015 | `sw_great_reading.m4a` | Great reading! |  |
| 1016 | `sw_sound_it.m4a` | Let's say it together. |  |

## Sight words: Dolch Pre-Primer (40) — later (40)

Say each word once, clearly, the way you would read it to a little one.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1017 | `word_a.m4a` | a |  |
| 1018 | `word_and.m4a` | and |  |
| 1019 | `word_away.m4a` | away |  |
| 1020 | `word_big.m4a` | big |  |
| 1021 | `word_blue.m4a` | blue |  |
| 1022 | `word_can.m4a` | can |  |
| 1023 | `word_come.m4a` | come |  |
| 1024 | `word_down.m4a` | down |  |
| 1025 | `word_find.m4a` | find |  |
| 1026 | `word_for.m4a` | for |  |
| 1027 | `word_funny.m4a` | funny |  |
| 1028 | `word_go.m4a` | go |  |
| 1029 | `word_help.m4a` | help |  |
| 1030 | `word_here.m4a` | here |  |
| 1031 | `word_i.m4a` | I |  |
| 1032 | `word_in.m4a` | in |  |
| 1033 | `word_is.m4a` | is |  |
| 1034 | `word_it.m4a` | it |  |
| 1035 | `word_jump.m4a` | jump |  |
| 1036 | `word_little.m4a` | little |  |
| 1037 | `word_look.m4a` | look |  |
| 1038 | `word_make.m4a` | make |  |
| 1039 | `word_me.m4a` | me |  |
| 1040 | `word_my.m4a` | my |  |
| 1041 | `word_not.m4a` | not |  |
| 1042 | `word_one.m4a` | one |  |
| 1043 | `word_play.m4a` | play |  |
| 1044 | `word_red.m4a` | red |  |
| 1045 | `word_run.m4a` | run |  |
| 1046 | `word_said.m4a` | said |  |
| 1047 | `word_see.m4a` | see |  |
| 1048 | `word_the.m4a` | the |  |
| 1049 | `word_three.m4a` | three |  |
| 1050 | `word_to.m4a` | to |  |
| 1051 | `word_two.m4a` | two |  |
| 1052 | `word_up.m4a` | up |  |
| 1053 | `word_we.m4a` | we |  |
| 1054 | `word_where.m4a` | where |  |
| 1055 | `word_yellow.m4a` | yellow |  |
| 1056 | `word_you.m4a` | you |  |

## Sight words: Dolch Primer (52) — later (52)

| # | File name | Say this | Note |
|---:|---|---|---|
| 1057 | `word_all.m4a` | all |  |
| 1058 | `word_am.m4a` | am |  |
| 1059 | `word_are.m4a` | are |  |
| 1060 | `word_at.m4a` | at |  |
| 1061 | `word_ate.m4a` | ate |  |
| 1062 | `word_be.m4a` | be |  |
| 1063 | `word_black.m4a` | black |  |
| 1064 | `word_brown.m4a` | brown |  |
| 1065 | `word_but.m4a` | but |  |
| 1066 | `word_came.m4a` | came |  |
| 1067 | `word_did.m4a` | did |  |
| 1068 | `word_do.m4a` | do |  |
| 1069 | `word_eat.m4a` | eat |  |
| 1070 | `word_four.m4a` | four |  |
| 1071 | `word_get.m4a` | get |  |
| 1072 | `word_good.m4a` | good |  |
| 1073 | `word_have.m4a` | have |  |
| 1074 | `word_he.m4a` | he |  |
| 1075 | `word_into.m4a` | into |  |
| 1076 | `word_like.m4a` | like |  |
| 1077 | `word_must.m4a` | must |  |
| 1078 | `word_new.m4a` | new |  |
| 1079 | `word_no.m4a` | no |  |
| 1080 | `word_now.m4a` | now |  |
| 1081 | `word_on.m4a` | on |  |
| 1082 | `word_our.m4a` | our |  |
| 1083 | `word_out.m4a` | out |  |
| 1084 | `word_please.m4a` | please |  |
| 1085 | `word_pretty.m4a` | pretty |  |
| 1086 | `word_ran.m4a` | ran |  |
| 1087 | `word_ride.m4a` | ride |  |
| 1088 | `word_saw.m4a` | saw |  |
| 1089 | `word_say.m4a` | say |  |
| 1090 | `word_she.m4a` | she |  |
| 1091 | `word_so.m4a` | so |  |
| 1092 | `word_soon.m4a` | soon |  |
| 1093 | `word_that.m4a` | that |  |
| 1094 | `word_there.m4a` | there |  |
| 1095 | `word_they.m4a` | they |  |
| 1096 | `word_this.m4a` | this |  |
| 1097 | `word_too.m4a` | too |  |
| 1098 | `word_under.m4a` | under |  |
| 1099 | `word_want.m4a` | want |  |
| 1100 | `word_was.m4a` | was |  |
| 1101 | `word_well.m4a` | well |  |
| 1102 | `word_went.m4a` | went |  |
| 1103 | `word_what.m4a` | what |  |
| 1104 | `word_white.m4a` | white |  |
| 1105 | `word_who.m4a` | who |  |
| 1106 | `word_will.m4a` | will |  |
| 1107 | `word_with.m4a` | with |  |
| 1108 | `word_yes.m4a` | yes |  |

## Snack Slugger — record first (47)

The umpire lines ("Strike!", "You're out!", "Home run!") can be big and loud, like a real umpire. Lines with "+ number" or "+ name" are followed by one.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1109 | `bb_title.m4a` | Snack Slugger! |  |
| 1110 | `bb_play_ball.m4a` | Play ball! |  |
| 1111 | `bb_batter_up.m4a` | Batter up! | Also followed by a name: "Batter up," + "Player 1!" |
| 1112 | `bb_swing.m4a` | Swing! |  |
| 1113 | `bb_strike.m4a` | Strike! |  |
| 1114 | `bb_strike_two.m4a` | Strike two! |  |
| 1115 | `bb_strike_three.m4a` | Strike three! You're out! |  |
| 1116 | `bb_ball.m4a` | Ball! |  |
| 1117 | `bb_foul.m4a` | Foul ball! |  |
| 1118 | `bb_hit.m4a` | It's a hit! |  |
| 1119 | `bb_single.m4a` | Single! |  |
| 1120 | `bb_double.m4a` | Double! |  |
| 1121 | `bb_triple.m4a` | Triple! |  |
| 1122 | `bb_home_run.m4a` | Home run! |  |
| 1123 | `bb_grand_slam.m4a` | A grand slam! |  |
| 1124 | `bb_run_scores.m4a` | A run scores! |  |
| 1125 | `bb_runs_score.m4a` | runs score! | After a number: "Two" + "runs score!" |
| 1126 | `bb_safe.m4a` | Safe! |  |
| 1127 | `bb_out.m4a` | You're out! |  |
| 1128 | `bb_caught.m4a` | Caught it! That's an out! |  |
| 1129 | `bb_three_outs.m4a` | Three outs! Switch sides! |  |
| 1130 | `bb_three_outs_next.m4a` | Three outs! On to the next inning! |  |
| 1131 | `bb_inning_over.m4a` | That's the inning! Great batting! |  |
| 1132 | `bb_inning.m4a` | Inning | + number, e.g. "Inning" + "2" |
| 1133 | `bb_last_inning.m4a` | Last inning! |  |
| 1134 | `bb_next_inning.m4a` | Next inning! |  |
| 1135 | `bb_great_swing.m4a` | Great swing! |  |
| 1136 | `bb_swing_tip.m4a` | Pick your swing! A single is easy. A home run is a challenge. Get it right, and you hit it! |  |
| 1137 | `bb_pick_swing.m4a` | Pick your swing! |  |
| 1138 | `bb_intro_howto.m4a` | Pick your swing, then answer the pitch! Harder questions hit farther! |  |
| 1139 | `bb_one_player_sub.m4a` | Three innings. Harder questions hit farther! |  |
| 1140 | `bb_sw_single.m4a` | A single! Nice and easy. |  |
| 1141 | `bb_sw_double.m4a` | A double! Just right. |  |
| 1142 | `bb_sw_triple.m4a` | A triple! Here comes a tricky one. |  |
| 1143 | `bb_sw_homer.m4a` | Going for a home run! Here comes a challenge! |  |
| 1144 | `bb_big_whiff.m4a` | Whoosh! What a big swing! That is just one strike. |  |
| 1145 | `bb_nudge.m4a` | The crowd wants a big swing! Want to try a double or a triple? |  |
| 1146 | `bb_time_strike.m4a` | Out of time! That's a strike. |  |
| 1147 | `bb_you_scored.m4a` | You scored | + number + "runs!" |
| 1148 | `bb_runs.m4a` | runs! |  |
| 1149 | `bb_run.m4a` | run! |  |
| 1150 | `bb_wins_game.m4a` | wins the game! | After a name: "Player 1" + "wins the game!" |
| 1151 | `bb_tie_game.m4a` | It's a tie game! What a game! |  |
| 1152 | `bb_you_win.m4a` | You win the game! |  |
| 1153 | `bb_good_game.m4a` | Good game! |  |
| 1154 | `bb_new_high.m4a` | A new high score! |  |
| 1155 | `bb_high_scores.m4a` | High scores! |  |

## Snack Slugger questions (sentence parts) — record first (9)

Question starters, joined with numbers: "What's" + "5" + "plus" + "7" → "What's five plus seven?". Say them like the start of a question.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1156 | `bbq_whats.m4a` | What's |  |
| 1157 | `bbq_how_many_dots.m4a` | How many dots? |  |
| 1158 | `bbq_find.m4a` | Find the number | + number |
| 1159 | `bbq_biggest.m4a` | Which number is the biggest? |  |
| 1160 | `bbq_smallest.m4a` | Which number is the smallest? |  |
| 1161 | `bbq_even.m4a` | Which number is even? |  |
| 1162 | `bbq_odd.m4a` | Which number is odd? |  |
| 1163 | `bbq_what_makes_ten.m4a` | what makes ten? | After a number: "6 plus" + "what makes ten?" |
| 1164 | `bbq_what_makes.m4a` | what makes | In the middle: "3 plus" + "what makes" + "7?" |

## Penalty Kicks (coming soon) — later (15)

| # | File name | Say this | Note |
|---:|---|---|---|
| 1165 | `pk_title.m4a` | Penalty Kicks! |  |
| 1166 | `pk_your_kick.m4a` | Your turn to kick! |  |
| 1167 | `pk_pick_spot.m4a` | Pick a spot to aim! |  |
| 1168 | `pk_goal.m4a` | Goal! |  |
| 1169 | `pk_blocked.m4a` | The goalie blocked it! |  |
| 1170 | `pk_save.m4a` | What a save! |  |
| 1171 | `pk_missed.m4a` | Just missed! |  |
| 1172 | `pk_off_post.m4a` | Off the post! |  |
| 1173 | `pk_your_goalie.m4a` | Now you're the goalie! |  |
| 1174 | `pk_dive.m4a` | Dive! |  |
| 1175 | `pk_great_kick.m4a` | Great kick! |  |
| 1176 | `pk_score_is.m4a` | The score is | + number + "to" + number |
| 1177 | `w_to.m4a` | to | as in "3 to 2" |
| 1178 | `pk_you_win.m4a` | You won the shootout! |  |
| 1179 | `pk_tie.m4a` | It's a tie! One more kick! |  |

## Picnic Spot — record first (38)

Cozy and warm, like showing a friend around your room.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1180 | `rm_title.m4a` | My Picnic Spot! |  |
| 1181 | `rm_it_costs.m4a` | It costs | Followed by a number, then "star bits. You have" + number |
| 1182 | `rm_bits_you_have.m4a` | star bits. You have |  |
| 1183 | `rm_welcome.m4a` | Welcome to your very own picnic spot! |  |
| 1184 | `rm_welcome_back.m4a` | Welcome home! |  |
| 1185 | `rm_shop.m4a` | Let's go shopping! What would you like? |  |
| 1186 | `rm_decorate.m4a` | Let's decorate! Pick a thing, then pick a spot. |  |
| 1187 | `rm_pick_spot.m4a` | Pick a spot! |  |
| 1188 | `rm_placed.m4a` | There! It looks great! |  |
| 1189 | `rm_bought.m4a` | It's yours! Hooray! |  |
| 1190 | `rm_need_more.m4a` | You need a few more star bits. Play a game to earn some! |  |
| 1191 | `rm_costs.m4a` | It costs | + number + "star bits." |
| 1192 | `rm_star_bits.m4a` | star bits. |  |
| 1193 | `rm_put_away.m4a` | Put away! |  |
| 1194 | `rm_undo.m4a` | Undo! |  |
| 1195 | `rm_flip.m4a` | Flip! |  |
| 1196 | `rm_spot_taken.m4a` | That spot is taken. Try another one! |  |
| 1197 | `rm_new_wall.m4a` | Ooh, new wallpaper! |  |
| 1198 | `rm_new_floor.m4a` | Ooh, a new floor! |  |
| 1199 | `rm_trophies.m4a` | Here is your trophy shelf! |  |
| 1200 | `rm_friends.m4a` | Here are your picnic friends! |  |
| 1201 | `rm_locked_friend.m4a` | This friend is still a secret! Win a story challenge to meet them. |  |
| 1202 | `rm_locked_item.m4a` | This one is a special prize! Keep playing to win it. |  |
| 1203 | `rm_prize_won.m4a` | You won a special prize for your room! |  |
| 1204 | `rm_friend_up.m4a` | You're even better friends now! |  |
| 1205 | `rm_shh.m4a` | Shh... they're napping. |  |
| 1206 | `rm_bye.m4a` | Bye bye! See you soon! |  |
| 1207 | `rm_owned.m4a` | You have this one! |  |
| 1208 | `rm_nothing.m4a` | Your things box is empty. Visit the shop! |  |
| 1209 | `fr_unlock_likes.m4a` | Now you know what I like! |  |
| 1210 | `fr_unlock_face.m4a` | I learned a new face! Look! |  |
| 1211 | `fr_unlock_more.m4a` | Now you know all about me! |  |
| 1212 | `fr_unlock_gift.m4a` | I made you a present for your room! |  |
| 1213 | `fr_lvl1.m4a` | New friend! |  |
| 1214 | `fr_lvl2.m4a` | Pal! |  |
| 1215 | `fr_lvl3.m4a` | Good friend! |  |
| 1216 | `fr_lvl4.m4a` | Best friend! |  |
| 1217 | `fr_lvl5.m4a` | Forever friend! |  |

## Coach v2: placement check, mistake hints, picnic story problems — record first (36)

Story problems are built from short parts, e.g. "Biscuit" + "found" + 3 + "apples" + "in the picnic basket, and" + 4 + "more under the blanket." + "How many" + "apples". A custom pet name is read by the browser voice.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1218 | `skill_wordprob.m4a` | Story problems! Listen to the picnic story, then find how many. |  |
| 1219 | `place_intro.m4a` | Let's see what you already know! |  |
| 1220 | `place_skip.m4a` | Wow! You already know this one. Let's skip ahead! |  |
| 1221 | `place_higher.m4a` | Great job! Let's start a little higher. |  |
| 1222 | `place_normal.m4a` | Thanks! Let's learn it together. |  |
| 1223 | `err_teen.m4a` | Teen numbers start with one ten. Tens first, then ones. |  |
| 1224 | `err_count_on.m4a` | Start from the number, then count up. |  |
| 1225 | `err_count_dots.m4a` | Touch each dot and count them. One, two, three! |  |
| 1226 | `err_count_back.m4a` | Start from the big number, then count back. |  |
| 1227 | `err_make_ten.m4a` | How many more make ten? Count up to ten on your fingers. |  |
| 1228 | `err_number_line.m4a` | Say the numbers in order. Which one is missing? |  |
| 1229 | `err_bed.m4a` | Make a bed with your hands. B comes first, d comes last. |  |
| 1230 | `err_story.m4a` | Let's picture the story. Are we putting together, or taking away? |  |
| 1231 | `err_first_letter.m4a` | Look at the first letter. |  |
| 1232 | `pet_biscuit.m4a` | Biscuit | The default pet name |
| 1233 | `wp_your_pet.m4a` | Your pet | Said instead of a custom pet name when there is no speech voice |
| 1234 | `wp_found.m4a` | found |  |
| 1235 | `wp_f_apples.m4a` | apples |  |
| 1236 | `wp_f_strawberries.m4a` | strawberries |  |
| 1237 | `wp_f_blueberries.m4a` | blueberries |  |
| 1238 | `wp_f_carrots.m4a` | carrots |  |
| 1239 | `wp_in_basket_and.m4a` | in the picnic basket, and |  |
| 1240 | `wp_more_blanket.m4a` | more under the blanket. |  |
| 1241 | `wp_how_many.m4a` | How many |  |
| 1242 | `wp_friends_sat.m4a` | food friends sat on the picnic blanket. |  |
| 1243 | `wp_more_came.m4a` | more came to the picnic. |  |
| 1244 | `wp_how_many_friends.m4a` | How many food friends are there now? |  |
| 1245 | `wp_had.m4a` | had |  |
| 1246 | `wp_in_basket.m4a` | in the picnic basket. |  |
| 1247 | `wp_ate.m4a` | ate |  |
| 1248 | `wp_left.m4a` | are left? |  |
| 1249 | `wp_there_were.m4a` | There were |  |
| 1250 | `wp_on_blanket.m4a` | on the blanket. |  |
| 1251 | `wp_took.m4a` | took |  |
| 1252 | `wp_away.m4a` | away. |  |
| 1253 | `wp_how_many_left.m4a` | How many are left? |  |

## Picnic friends: bios and room chatter — later (216)

Read by the browser voice until recorded. Each food friend talks about themselves. Give each one their own personality (see art/foods/bios.json).

| # | File name | Say this | Note |
|---:|---|---|---|
| 1254 | `fr_strawberry_hi.m4a` | This is Jammy! Jammy is sunny, sweet and always ready to start the fun. |  |
| 1255 | `fr_strawberry_likes.m4a` | Jammy's favorite thing is leading the picnic parade. |  |
| 1256 | `fr_strawberry_dislikes.m4a` | Jammy always says: Berry good job! |  |
| 1257 | `fr_strawberry_food.m4a` | Jammy is a strawberry and loves a good picnic. |  |
| 1258 | `fr_strawberry_tap1.m4a` | Berry good job! | When tapped in the room |
| 1259 | `fr_strawberry_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1260 | `fr_strawberry_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1261 | `fr_strawberry_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1262 | `fr_apple_hi.m4a` | This is Crisp! Crisp is calm and confident; a steady helper. |  |
| 1263 | `fr_apple_likes.m4a` | Crisp's favorite thing is crunchy autumn walks. |  |
| 1264 | `fr_apple_dislikes.m4a` | Crisp always says: Nice and crisp! |  |
| 1265 | `fr_apple_food.m4a` | Crisp is a apple and loves a good picnic. |  |
| 1266 | `fr_apple_tap1.m4a` | Nice and crisp! | When tapped in the room |
| 1267 | `fr_apple_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1268 | `fr_apple_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1269 | `fr_apple_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1270 | `fr_corn_hi.m4a` | This is Niblet! Niblet is goofy, toothy and full of giggles. |  |
| 1271 | `fr_corn_likes.m4a` | Niblet's favorite thing is telling corny jokes. |  |
| 1272 | `fr_corn_dislikes.m4a` | Niblet always says: Aw, shucks! |  |
| 1273 | `fr_corn_food.m4a` | Niblet is a corn on the cob and loves a good picnic. |  |
| 1274 | `fr_corn_tap1.m4a` | Aw, shucks! | When tapped in the room |
| 1275 | `fr_corn_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1276 | `fr_corn_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1277 | `fr_corn_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1278 | `fr_blueberry_hi.m4a` | This is Bloop! Bloop is tiny, curious and amazed by everything. |  |
| 1279 | `fr_blueberry_likes.m4a` | Bloop's favorite thing is asking "why?. |  |
| 1280 | `fr_blueberry_dislikes.m4a` | Bloop always says: Bloop bloop, I did it! |  |
| 1281 | `fr_blueberry_food.m4a` | Bloop is a blueberry and loves a good picnic. |  |
| 1282 | `fr_blueberry_tap1.m4a` | Bloop bloop, I did it! | When tapped in the room |
| 1283 | `fr_blueberry_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1284 | `fr_blueberry_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1285 | `fr_blueberry_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1286 | `fr_mochi_hi.m4a` | This is Dora Dumpling! Dora Dumpling is soft, cheerful and a little bit hungry. |  |
| 1287 | `fr_mochi_likes.m4a` | Dora Dumpling's favorite thing is snack time. |  |
| 1288 | `fr_mochi_dislikes.m4a` | Dora Dumpling always says: Squishy hugs for everyone! |  |
| 1289 | `fr_mochi_food.m4a` | Dora Dumpling is a rice dumpling and loves a good picnic. |  |
| 1290 | `fr_mochi_tap1.m4a` | Squishy hugs for everyone! | When tapped in the room |
| 1291 | `fr_mochi_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1292 | `fr_mochi_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1293 | `fr_mochi_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1294 | `fr_banana_hi.m4a` | This is Peel! Peel is silly and bendy; loves a good laugh. |  |
| 1295 | `fr_banana_likes.m4a` | Peel's favorite thing is bouncing on trampolines. |  |
| 1296 | `fr_banana_dislikes.m4a` | Peel always says: Let's go bananas! |  |
| 1297 | `fr_banana_food.m4a` | Peel is a banana and loves a good picnic. |  |
| 1298 | `fr_banana_tap1.m4a` | Let's go bananas! | When tapped in the room |
| 1299 | `fr_banana_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1300 | `fr_banana_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1301 | `fr_banana_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1302 | `fr_pear_hi.m4a` | This is Petey Pear! Petey Pear is dreamy and gentle; thinks before he speaks. |  |
| 1303 | `fr_pear_likes.m4a` | Petey Pear's favorite thing is cozy naps in the shade. |  |
| 1304 | `fr_pear_dislikes.m4a` | Petey Pear always says: We make a great pear! |  |
| 1305 | `fr_pear_food.m4a` | Petey Pear is a pear and loves a good picnic. |  |
| 1306 | `fr_pear_tap1.m4a` | We make a great pear! | When tapped in the room |
| 1307 | `fr_pear_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1308 | `fr_pear_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1309 | `fr_pear_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1310 | `fr_carrot_hi.m4a` | This is Crunch! Crunch is sporty and determined; never gives up. |  |
| 1311 | `fr_carrot_likes.m4a` | Crunch's favorite thing is racing to the finish line. |  |
| 1312 | `fr_carrot_dislikes.m4a` | Crunch always says: Crunch time! |  |
| 1313 | `fr_carrot_food.m4a` | Crunch is a carrot and loves a good picnic. |  |
| 1314 | `fr_carrot_tap1.m4a` | Crunch time! | When tapped in the room |
| 1315 | `fr_carrot_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1316 | `fr_carrot_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1317 | `fr_carrot_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1318 | `fr_broccoli_hi.m4a` | This is Brock! Brock is kind and strong, like a little tree. |  |
| 1319 | `fr_broccoli_likes.m4a` | Brock's favorite thing is climbing real trees. |  |
| 1320 | `fr_broccoli_dislikes.m4a` | Brock always says: Stand tall! |  |
| 1321 | `fr_broccoli_food.m4a` | Brock is a broccoli and loves a good picnic. |  |
| 1322 | `fr_broccoli_tap1.m4a` | Stand tall! | When tapped in the room |
| 1323 | `fr_broccoli_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1324 | `fr_broccoli_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1325 | `fr_broccoli_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1326 | `fr_sushi_hi.m4a` | This is Umi! Umi is polite, tidy and quietly clever. |  |
| 1327 | `fr_sushi_likes.m4a` | Umi's favorite thing is ocean waves. |  |
| 1328 | `fr_sushi_dislikes.m4a` | Umi always says: Roll with it! |  |
| 1329 | `fr_sushi_food.m4a` | Umi is a sushi and loves a good picnic. |  |
| 1330 | `fr_sushi_tap1.m4a` | Roll with it! | When tapped in the room |
| 1331 | `fr_sushi_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1332 | `fr_sushi_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1333 | `fr_sushi_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1334 | `fr_taco_hi.m4a` | This is Guac! Guac is wild, wacky and fun at parties. |  |
| 1335 | `fr_taco_likes.m4a` | Guac's favorite thing is taco Tuesday dance. |  |
| 1336 | `fr_taco_dislikes.m4a` | Guac always says: Let's taco 'bout it! |  |
| 1337 | `fr_taco_food.m4a` | Guac is a taco and loves a good picnic. |  |
| 1338 | `fr_taco_tap1.m4a` | Let's taco 'bout it! | When tapped in the room |
| 1339 | `fr_taco_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1340 | `fr_taco_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1341 | `fr_taco_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1342 | `fr_pizza_hi.m4a` | This is Slice! Slice is cool and confident; shares every slice. |  |
| 1343 | `fr_pizza_likes.m4a` | Slice's favorite thing is pizza parties with friends. |  |
| 1344 | `fr_pizza_dislikes.m4a` | Slice always says: You're a-pizza-zing! |  |
| 1345 | `fr_pizza_food.m4a` | Slice is a pizza slice and loves a good picnic. |  |
| 1346 | `fr_pizza_tap1.m4a` | You're a-pizza-zing! | When tapped in the room |
| 1347 | `fr_pizza_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1348 | `fr_pizza_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1349 | `fr_pizza_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1350 | `fr_pancake_hi.m4a` | This is Maple! Maple is warm and cozy, like a sunny morning. |  |
| 1351 | `fr_pancake_likes.m4a` | Maple's favorite thing is breakfast in bed. |  |
| 1352 | `fr_pancake_dislikes.m4a` | Maple always says: Stack it up! |  |
| 1353 | `fr_pancake_food.m4a` | Maple is a pancake stack and loves a good picnic. |  |
| 1354 | `fr_pancake_tap1.m4a` | Stack it up! | When tapped in the room |
| 1355 | `fr_pancake_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1356 | `fr_pancake_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1357 | `fr_pancake_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1358 | `fr_cupcake_hi.m4a` | This is Sprinkles! Sprinkles is sweet and sparkly; loves to celebrate. |  |
| 1359 | `fr_cupcake_likes.m4a` | Sprinkles's favorite thing is birthday candles. |  |
| 1360 | `fr_cupcake_dislikes.m4a` | Sprinkles always says: Sprinkle some joy! |  |
| 1361 | `fr_cupcake_food.m4a` | Sprinkles is a cupcake and loves a good picnic. |  |
| 1362 | `fr_cupcake_tap1.m4a` | Sprinkle some joy! | When tapped in the room |
| 1363 | `fr_cupcake_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1364 | `fr_cupcake_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1365 | `fr_cupcake_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1366 | `fr_avocado_hi.m4a` | This is Avo! Avo is super chill; calm in any storm. |  |
| 1367 | `fr_avocado_likes.m4a` | Avo's favorite thing is lazy hammock days. |  |
| 1368 | `fr_avocado_dislikes.m4a` | Avo always says: Avo great day! |  |
| 1369 | `fr_avocado_food.m4a` | Avo is a avocado and loves a good picnic. |  |
| 1370 | `fr_avocado_tap1.m4a` | Avo great day! | When tapped in the room |
| 1371 | `fr_avocado_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1372 | `fr_avocado_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1373 | `fr_avocado_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1374 | `fr_watermelon_hi.m4a` | This is Mellie! Mellie is sunny and splashy; the life of the picnic. |  |
| 1375 | `fr_watermelon_likes.m4a` | Mellie's favorite thing is summer water fights. |  |
| 1376 | `fr_watermelon_dislikes.m4a` | Mellie always says: One in a melon! |  |
| 1377 | `fr_watermelon_food.m4a` | Mellie is a watermelon slice and loves a good picnic. |  |
| 1378 | `fr_watermelon_tap1.m4a` | One in a melon! | When tapped in the room |
| 1379 | `fr_watermelon_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1380 | `fr_watermelon_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1381 | `fr_watermelon_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1382 | `fr_pretzel_hi.m4a` | This is Twist! Twist is cool and clever; loves a good puzzle. |  |
| 1383 | `fr_pretzel_likes.m4a` | Twist's favorite thing is brain teasers. |  |
| 1384 | `fr_pretzel_dislikes.m4a` | Twist always says: Let's twist again! |  |
| 1385 | `fr_pretzel_food.m4a` | Twist is a soft pretzel and loves a good picnic. |  |
| 1386 | `fr_pretzel_tap1.m4a` | Let's twist again! | When tapped in the room |
| 1387 | `fr_pretzel_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1388 | `fr_pretzel_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1389 | `fr_pretzel_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1390 | `fr_grapes_hi.m4a` | This is Vinnie! Vinnie is friendly and loyal; always brings friends. |  |
| 1391 | `fr_grapes_likes.m4a` | Vinnie's favorite thing is big group hugs. |  |
| 1392 | `fr_grapes_dislikes.m4a` | Vinnie always says: Grape to see you! |  |
| 1393 | `fr_grapes_food.m4a` | Vinnie is a grapes and loves a good picnic. |  |
| 1394 | `fr_grapes_tap1.m4a` | Grape to see you! | When tapped in the room |
| 1395 | `fr_grapes_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1396 | `fr_grapes_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1397 | `fr_grapes_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1398 | `fr_onigiri_hi.m4a` | This is Nori! Nori is quiet and steady; a really good friend. |  |
| 1399 | `fr_onigiri_likes.m4a` | Nori's favorite thing is lunchbox adventures. |  |
| 1400 | `fr_onigiri_dislikes.m4a` | Nori always says: Rice and easy! |  |
| 1401 | `fr_onigiri_food.m4a` | Nori is a onigiri and loves a good picnic. |  |
| 1402 | `fr_onigiri_tap1.m4a` | Rice and easy! | When tapped in the room |
| 1403 | `fr_onigiri_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1404 | `fr_onigiri_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1405 | `fr_onigiri_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1406 | `fr_pineapple_hi.m4a` | This is Spike! Spike is brave and bouncy; spiky outside, sweet inside. |  |
| 1407 | `fr_pineapple_likes.m4a` | Spike's favorite thing is tropical islands. |  |
| 1408 | `fr_pineapple_dislikes.m4a` | Spike always says: Stay sharp, stay sweet! |  |
| 1409 | `fr_pineapple_food.m4a` | Spike is a pineapple and loves a good picnic. |  |
| 1410 | `fr_pineapple_tap1.m4a` | Stay sharp, stay sweet! | When tapped in the room |
| 1411 | `fr_pineapple_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1412 | `fr_pineapple_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1413 | `fr_pineapple_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1414 | `fr_waffle_hi.m4a` | This is Wally! Wally is tidy and dependable; loves a plan. |  |
| 1415 | `fr_waffle_likes.m4a` | Wally's favorite thing is neat little squares. |  |
| 1416 | `fr_waffle_dislikes.m4a` | Wally always says: No waffling, let's go! |  |
| 1417 | `fr_waffle_food.m4a` | Wally is a waffle and loves a good picnic. |  |
| 1418 | `fr_waffle_tap1.m4a` | No waffling, let's go! | When tapped in the room |
| 1419 | `fr_waffle_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1420 | `fr_waffle_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1421 | `fr_waffle_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1422 | `fr_lemon_hi.m4a` | This is Zest! Zest is a little sour, a lot of fun. |  |
| 1423 | `fr_lemon_likes.m4a` | Zest's favorite thing is lemonade stands. |  |
| 1424 | `fr_lemon_dislikes.m4a` | Zest always says: Easy peasy, lemon squeezy! |  |
| 1425 | `fr_lemon_food.m4a` | Zest is a lemon and loves a good picnic. |  |
| 1426 | `fr_lemon_tap1.m4a` | Easy peasy, lemon squeezy! | When tapped in the room |
| 1427 | `fr_lemon_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1428 | `fr_lemon_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1429 | `fr_lemon_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1430 | `fr_donut_hi.m4a` | This is Minty! Minty is sweet and goofy; first to laugh. |  |
| 1431 | `fr_donut_likes.m4a` | Minty's favorite thing is fresh minty breezes. |  |
| 1432 | `fr_donut_dislikes.m4a` | Minty always says: Donut give up! |  |
| 1433 | `fr_donut_food.m4a` | Minty is a donut and loves a good picnic. |  |
| 1434 | `fr_donut_tap1.m4a` | Donut give up! | When tapped in the room |
| 1435 | `fr_donut_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1436 | `fr_donut_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1437 | `fr_donut_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1438 | `fr_popcorn_hi.m4a` | This is Popper! Popper is bursting with energy all day long. |  |
| 1439 | `fr_popcorn_likes.m4a` | Popper's favorite thing is movie night. |  |
| 1440 | `fr_popcorn_dislikes.m4a` | Popper always says: Pop pop hooray! |  |
| 1441 | `fr_popcorn_food.m4a` | Popper is a popcorn box and loves a good picnic. |  |
| 1442 | `fr_popcorn_tap1.m4a` | Pop pop hooray! | When tapped in the room |
| 1443 | `fr_popcorn_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1444 | `fr_popcorn_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1445 | `fr_popcorn_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1446 | `fr_peach_hi.m4a` | This is Peachy! Peachy is gentle and kind; gives the best hugs. |  |
| 1447 | `fr_peach_likes.m4a` | Peachy's favorite thing is sunny orchards. |  |
| 1448 | `fr_peach_dislikes.m4a` | Peachy always says: Everything's peachy! |  |
| 1449 | `fr_peach_food.m4a` | Peachy is a peach and loves a good picnic. |  |
| 1450 | `fr_peach_tap1.m4a` | Everything's peachy! | When tapped in the room |
| 1451 | `fr_peach_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1452 | `fr_peach_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1453 | `fr_peach_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1454 | `fr_cheese_hi.m4a` | This is Gouda! Gouda is funny and full of surprises (and holes!). |  |
| 1455 | `fr_cheese_likes.m4a` | Gouda's favorite thing is saying "cheese" for photos. |  |
| 1456 | `fr_cheese_dislikes.m4a` | Gouda always says: Gouda job! |  |
| 1457 | `fr_cheese_food.m4a` | Gouda is a cheese wedge and loves a good picnic. |  |
| 1458 | `fr_cheese_tap1.m4a` | Gouda job! | When tapped in the room |
| 1459 | `fr_cheese_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1460 | `fr_cheese_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1461 | `fr_cheese_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |
| 1462 | `fr_cookie_hi.m4a` | This is Chip! Chip is crunchy, cheerful and always shares. |  |
| 1463 | `fr_cookie_likes.m4a` | Chip's favorite thing is milk and cookie dunks. |  |
| 1464 | `fr_cookie_dislikes.m4a` | Chip always says: That's the way the cookie crumbles! |  |
| 1465 | `fr_cookie_food.m4a` | Chip is a chocolate-chip cookie and loves a good picnic. |  |
| 1466 | `fr_cookie_tap1.m4a` | That's the way the cookie crumbles! | When tapped in the room |
| 1467 | `fr_cookie_tap2.m4a` | Hi, friend! | When tapped in the room |
| 1468 | `fr_cookie_tap3.m4a` | It's picnic time! | When tapped in the room |
| 1469 | `fr_cookie_nap.m4a` | Zzz... picnic dreams... | Sleepy, while napping |

## Picnic Spot things (68) — later (68)

Item names, said brightly when a kid taps one in the shop.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1470 | `it_bed_simple.m4a` | Cozy bed! |  |
| 1471 | `it_bed_cloud.m4a` | Cloud bed! |  |
| 1472 | `it_sofa.m4a` | Comfy sofa! |  |
| 1473 | `it_beanbag_pink.m4a` | Pink cushion! |  |
| 1474 | `it_beanbag_blue.m4a` | Mint cushion! |  |
| 1475 | `it_chair.m4a` | Stump stool! |  |
| 1476 | `it_tent.m4a` | Parasol! |  |
| 1477 | `it_table_round.m4a` | Picnic table! |  |
| 1478 | `it_desk.m4a` | Desk! |  |
| 1479 | `it_bookshelf.m4a` | Bookshelf! |  |
| 1480 | `it_dresser.m4a` | Dresser! |  |
| 1481 | `it_toyshelf.m4a` | Toy shelf! |  |
| 1482 | `it_snackcart.m4a` | Cupcake stand! |  |
| 1483 | `it_fishtank.m4a` | Fish tank! |  |
| 1484 | `it_globe.m4a` | Globe! |  |
| 1485 | `it_piano.m4a` | Toy piano! |  |
| 1486 | `it_plates.m4a` | Picnic plates! |  |
| 1487 | `it_fruit_bowl.m4a` | Fruit bowl! |  |
| 1488 | `it_lemonade_jug.m4a` | Lemonade jug! |  |
| 1489 | `it_thermos.m4a` | Cocoa thermos! |  |
| 1490 | `it_plant_tall.m4a` | Leafy plant! |  |
| 1491 | `it_plant_cactus.m4a` | Cactus! |  |
| 1492 | `it_plant_flower.m4a` | Flower pot! |  |
| 1493 | `it_plant_tree.m4a` | Little tree! |  |
| 1494 | `it_lamp_floor.m4a` | Lantern! |  |
| 1495 | `it_lamp_star.m4a` | Star lamp! |  |
| 1496 | `it_lamp_mushroom.m4a` | Mushroom lamp! |  |
| 1497 | `it_toybox.m4a` | Picnic basket! |  |
| 1498 | `it_blocks.m4a` | Block tower! |  |
| 1499 | `it_train.m4a` | Toy train! |  |
| 1500 | `it_drum.m4a` | Drum! |  |
| 1501 | `it_rocket.m4a` | Toy rocket! |  |
| 1502 | `it_plush_bunny.m4a` | Bunny plush! |  |
| 1503 | `it_easel.m4a` | Paint easel! |  |
| 1504 | `it_telescope.m4a` | Telescope! |  |
| 1505 | `it_soccergoal.m4a` | Mini goal! |  |
| 1506 | `it_soccerball.m4a` | Soccer ball! |  |
| 1507 | `it_batrack.m4a` | Bat and glove rack! |  |
| 1508 | `it_hoop.m4a` | Mini hoop! |  |
| 1509 | `it_rug_round.m4a` | Picnic blanket! |  |
| 1510 | `it_rug_rainbow.m4a` | Rainbow rug! |  |
| 1511 | `it_rug_star.m4a` | Star rug! |  |
| 1512 | `it_rug_diamond.m4a` | Ballpark rug! |  |
| 1513 | `it_poster_space.m4a` | Space poster! |  |
| 1514 | `it_poster_mochi.m4a` | Dora Dumpling poster! |  |
| 1515 | `it_poster_baseball.m4a` | Baseball poster! |  |
| 1516 | `it_frame_sun.m4a` | Strawberry picture! |  |
| 1517 | `it_clock.m4a` | Clock! |  |
| 1518 | `it_shelf_wall.m4a` | Wall shelf! |  |
| 1519 | `it_fairylights.m4a` | Fairy lights! |  |
| 1520 | `it_pennant.m4a` | Bunting! |  |
| 1521 | `it_mirror.m4a` | Mirror! |  |
| 1522 | `it_wp_cream.m4a` | Cream wallpaper! |  |
| 1523 | `it_wp_stripes.m4a` | Candy stripes! |  |
| 1524 | `it_wp_dots.m4a` | Polka dots! |  |
| 1525 | `it_wp_stars.m4a` | Starry wallpaper! |  |
| 1526 | `it_wp_clouds.m4a` | Cloud wallpaper! |  |
| 1527 | `it_wp_leaves.m4a` | Leafy wallpaper! |  |
| 1528 | `it_fl_wood.m4a` | Wood floor! |  |
| 1529 | `it_fl_checker.m4a` | Checker floor! |  |
| 1530 | `it_fl_carpet.m4a` | Soft carpet! |  |
| 1531 | `it_fl_tiles.m4a` | Mint tiles! |  |
| 1532 | `it_trophy_story.m4a` | Story trophy! |  |
| 1533 | `it_bat_gold.m4a` | Golden bat! |  |
| 1534 | `it_plush_grumbly.m4a` | Grumbly plush! |  |
| 1535 | `it_rug_sticker.m4a` | Sticker rug! |  |
| 1536 | `it_star_big.m4a` | Giant star! |  |
| 1537 | `it_hr_ball.m4a` | Home run ball! |  |

## Dress Up hats and held items (34) — later (34)

Hat and held-item names, said brightly when a kid picks one in Dress Up.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1538 | `ow_bow.m4a` | Balloon! |  |
| 1539 | `ow_cap.m4a` | Sun hat! |  |
| 1540 | `ow_headband.m4a` | Ice-cream cone! |  |
| 1541 | `ow_sunglasses.m4a` | Bookworm glasses! |  |
| 1542 | `ow_flower.m4a` | Flower crown! |  |
| 1543 | `ow_partyhat.m4a` | Party hat! |  |
| 1544 | `ow_beanie.m4a` | Chef's hat! |  |
| 1545 | `ow_crown.m4a` | Crown! |  |
| 1546 | `ow_explorer.m4a` | Explorer cap! |  |
| 1547 | `ow_snorkel.m4a` | Snorkel mask! |  |
| 1548 | `ow_conductor.m4a` | Conductor cap! |  |
| 1549 | `ow_bee.m4a` | Bee antennae! |  |
| 1550 | `ow_dino.m4a` | Dino hood! |  |
| 1551 | `ow_headlamp.m4a` | Doctor's headlamp! |  |
| 1552 | `ow_rainhat.m4a` | Rain hat! |  |
| 1553 | `ow_safari.m4a` | Safari hat! |  |
| 1554 | `ow_astronaut.m4a` | Astronaut helmet! |  |
| 1555 | `ow_wizard.m4a` | Wizard hat! |  |
| 1556 | `ow_gradcap.m4a` | Graduation cap! |  |
| 1557 | `ow_kite.m4a` | Kite! |  |
| 1558 | `ow_lollipop.m4a` | Lollipop! |  |
| 1559 | `ow_bouquet.m4a` | Flower bouquet! |  |
| 1560 | `ow_book.m4a` | Book! |  |
| 1561 | `ow_trophy.m4a` | Trophy! |  |
| 1562 | `ow_bubbles.m4a` | Bubble wand! |  |
| 1563 | `ow_net.m4a` | Butterfly net! |  |
| 1564 | `ow_telescope.m4a` | Telescope! |  |
| 1565 | `ow_teddy.m4a` | Teddy bear! |  |
| 1566 | `ow_umbrella.m4a` | Umbrella! |  |
| 1567 | `ow_wand.m4a` | Magic wand! |  |
| 1568 | `ow_ukulele.m4a` | Ukulele! |  |
| 1569 | `ow_flag.m4a` | Flag! |  |
| 1570 | `ow_basket.m4a` | Picnic basket! |  |
| 1571 | `ow_golden_basket.m4a` | Golden picnic basket! |  |

## Dress Up: how to earn each locked hat or item — later (26)

Friendly and encouraging, said when a kid taps a locked hat or held item.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1572 | `ow_kite_hint.m4a` | Play on 3 days in one week to earn this! |  |
| 1573 | `ow_lollipop_hint.m4a` | Finish Compare Berry Beach to earn this! |  |
| 1574 | `ow_explorer_hint.m4a` | Finish Add-Up Broccoli Woods to earn this! |  |
| 1575 | `ow_book_hint.m4a` | Master 2 skills to earn this! |  |
| 1576 | `ow_bouquet_hint.m4a` | Collect 160 stars to earn this! |  |
| 1577 | `ow_trophy_hint.m4a` | Win 3 friend challenges with no oopsies to earn this! |  |
| 1578 | `ow_snorkel_hint.m4a` | Finish Mystery Melon Bay to earn this! |  |
| 1579 | `ow_conductor_hint.m4a` | Meet your weekly goal in 5 weeks to earn this! |  |
| 1580 | `ow_teddy_hint.m4a` | Play on 25 different days to earn this! |  |
| 1581 | `ow_bubbles_hint.m4a` | Get 3 stars on both stops of 2 island areas to earn this! |  |
| 1582 | `ow_bee_hint.m4a` | Get 3 stars on both stops of Take-Away Apple Grove to earn this! |  |
| 1583 | `ow_net_hint.m4a` | Finish Take-Away Apple Grove and meet your weekly goal in 5 weeks to earn this! |  |
| 1584 | `ow_headlamp_hint.m4a` | Finish Even-Odd Cookie Caves and master 4 skills to earn this! |  |
| 1585 | `ow_dino_hint.m4a` | Get 3 stars on both stops of Teen Cocoa Volcano to earn this! |  |
| 1586 | `ow_telescope_hint.m4a` | Get 3 stars on both stops of Big Sum Lolly Lighthouse to earn this! |  |
| 1587 | `ow_umbrella_hint.m4a` | Meet your weekly goal in 6 weeks to earn this! |  |
| 1588 | `ow_rainhat_hint.m4a` | Meet your weekly goal in 8 weeks to earn this! |  |
| 1589 | `ow_ukulele_hint.m4a` | Meet your weekly goal in 10 weeks to earn this! |  |
| 1590 | `ow_wand_hint.m4a` | Master 5 skills to earn this! |  |
| 1591 | `ow_wizard_hint.m4a` | Master 7 skills to earn this! |  |
| 1592 | `ow_gradcap_hint.m4a` | Master 10 skills to earn this! |  |
| 1593 | `ow_astronaut_hint.m4a` | Collect 450 stars to earn this! |  |
| 1594 | `ow_safari_hint.m4a` | Collect 600 stars to earn this! |  |
| 1595 | `ow_basket_hint.m4a` | Collect 750 stars to earn this! |  |
| 1596 | `ow_flag_hint.m4a` | Collect 900 stars and meet your weekly goal in 6 weeks to earn this! |  |
| 1597 | `ow_golden_basket_hint.m4a` | Finish the whole Picnic Island story to earn this! |  |

## Bonus questions (127) — later (127)

Read each question like a friendly quiz host. The built-in voice already covers these, so record them whenever you like.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1598 | `q_notplanet.m4a` | Which one is NOT a planet? | Space |
| 1599 | `q_livein.m4a` | Which planet do we live on? | Space |
| 1600 | `q_daylight.m4a` | What gives us light and warmth in the daytime? | Space |
| 1601 | `q_rings.m4a` | Which planet has big, beautiful rings? | Space |
| 1602 | `q_redplanet.m4a` | Which planet is called the red planet? | Space |
| 1603 | `q_rocket.m4a` | What do astronauts ride into space? | Space |
| 1604 | `q_moonorbit.m4a` | What does the Moon go around and around? | Space |
| 1605 | `q_nightsky.m4a` | What do we see twinkling in the night sky? | Space |
| 1606 | `q_spacesuit.m4a` | What does an astronaut wear in space? | Space |
| 1607 | `q_biggest.m4a` | Which one is the biggest? | Space |
| 1608 | `q_sunstar.m4a` | The Sun is a big, hot... | Space |
| 1609 | `q_moo.m4a` | Which animal says moo? | Animals |
| 1610 | `q_quack.m4a` | Which animal says quack? | Animals |
| 1611 | `q_oink.m4a` | Which animal says oink? | Animals |
| 1612 | `q_roar.m4a` | Which animal has a big, loud roar? | Animals |
| 1613 | `q_neck.m4a` | Which animal has a very long neck? | Animals |
| 1614 | `q_trunk.m4a` | Which animal has a long trunk? | Animals |
| 1615 | `q_stripes.m4a` | Which animal has black and white stripes? | Animals |
| 1616 | `q_fly.m4a` | Which animal has wings and can fly? | Animals |
| 1617 | `q_fins.m4a` | Which animal swims with fins? | Animals |
| 1618 | `q_puppy.m4a` | A puppy grows up to be a... | Animals |
| 1619 | `q_kitten.m4a` | A kitten grows up to be a... | Animals |
| 1620 | `q_tadpole.m4a` | A tadpole grows up to be a... | Animals |
| 1621 | `q_caterpillar.m4a` | A caterpillar turns into a... | Animals |
| 1622 | `q_pouch.m4a` | Which animal hops and carries its baby in a pouch? | Animals |
| 1623 | `q_wool.m4a` | Which animal gives us soft wool? | Animals |
| 1624 | `q_eggs.m4a` | Which animal lays the eggs we eat for breakfast? | Animals |
| 1625 | `q_eightlegs.m4a` | Which animal has eight legs? | Animals |
| 1626 | `q_shell.m4a` | Which animal carries a hard shell on its back? | Animals |
| 1627 | `q_honey.m4a` | Which animal makes honey? | Animals |
| 1628 | `q_whale.m4a` | Which animal is the biggest? | Animals |
| 1629 | `q_penguin.m4a` | Which bird cannot fly, but is a great swimmer? | Animals |
| 1630 | `q_hoot.m4a` | Which bird says hoo hoo at night? | Animals |
| 1631 | `q_milkfrom.m4a` | Which animal gives us milk to drink? | Animals |
| 1632 | `q_carrots.m4a` | Which animal loves to munch carrots and has long ears? | Animals |
| 1633 | `q_bark.m4a` | Which animal says woof? | Animals |
| 1634 | `q_sky.m4a` | What color is the sky on a sunny day? | Colors & shapes |
| 1635 | `q_grass.m4a` | What color is grass? | Colors & shapes |
| 1636 | `q_banana.m4a` | What color is a ripe banana? | Colors & shapes |
| 1637 | `q_snowcolor.m4a` | What color is snow? | Colors & shapes |
| 1638 | `q_stopsign.m4a` | What color is a stop sign? | Colors & shapes |
| 1639 | `q_redyellow.m4a` | Red and yellow paint mixed together make... | Colors & shapes |
| 1640 | `q_blueyellow.m4a` | Blue and yellow paint mixed together make... | Colors & shapes |
| 1641 | `q_redblue.m4a` | Red and blue paint mixed together make... | Colors & shapes |
| 1642 | `q_triangle.m4a` | Which shape has three sides? | Colors & shapes |
| 1643 | `q_circle.m4a` | Which shape is round, like a ball? | Colors & shapes |
| 1644 | `q_squaresides.m4a` | How many sides does a square have? | Colors & shapes |
| 1645 | `q_starpoints.m4a` | Which shape has five points? | Colors & shapes |
| 1646 | `q_heartshape.m4a` | Which one is a heart? | Colors & shapes |
| 1647 | `q_leaves.m4a` | In which season do lots of leaves fall off the trees? | Seasons & weather |
| 1648 | `q_snowseason.m4a` | In which season do we often see snow? | Seasons & weather |
| 1649 | `q_bloom.m4a` | In which season do many flowers start to bloom? | Seasons & weather |
| 1650 | `q_hottest.m4a` | Which season is the hottest? | Seasons & weather |
| 1651 | `q_umbrella.m4a` | What do you use to stay dry in the rain? | Seasons & weather |
| 1652 | `q_rainbow.m4a` | What colorful thing can you see when the sun shines while it rains? | Seasons & weather |
| 1653 | `q_mittens.m4a` | What keeps your hands warm when it is cold? | Seasons & weather |
| 1654 | `q_lightning.m4a` | What flashes bright in the sky during a storm? | Seasons & weather |
| 1655 | `q_snowice.m4a` | Snowflakes are made of tiny bits of... | Seasons & weather |
| 1656 | `q_snowman.m4a` | What can you build with snow? | Seasons & weather |
| 1657 | `q_see.m4a` | What do you use to see? | My body |
| 1658 | `q_hear.m4a` | What do you use to hear? | My body |
| 1659 | `q_smell.m4a` | What do you use to smell a flower? | My body |
| 1660 | `q_fingers.m4a` | How many fingers are on one hand? | My body |
| 1661 | `q_chew.m4a` | What do you use to chew your food? | My body |
| 1662 | `q_heartbeat.m4a` | What goes thump-thump inside your chest? | My body |
| 1663 | `q_think.m4a` | What part of your body helps you think? | My body |
| 1664 | `q_wash.m4a` | What should you do before you eat? | My body |
| 1665 | `q_legs.m4a` | How many legs do you have? | My body |
| 1666 | `q_fruit.m4a` | Which one is a fruit? | Food |
| 1667 | `q_veggie.m4a` | Which one is a vegetable? | Food |
| 1668 | `q_frozen.m4a` | Which treat is cold and frozen? | Food |
| 1669 | `q_tree.m4a` | Which one grows on a tree? | Food |
| 1670 | `q_cheese.m4a` | Which food is made from milk? | Food |
| 1671 | `q_yellowfruit.m4a` | Which fruit is long and yellow? | Food |
| 1672 | `q_strawberry.m4a` | Which red fruit has tiny seeds on the outside? | Food |
| 1673 | `q_popcorn.m4a` | Popcorn is made from... | Food |
| 1674 | `q_bees.m4a` | Bees make a sweet, sticky food called... | Food |
| 1675 | `q_orangefruit.m4a` | Which fruit is orange, round and juicy? | Food |
| 1676 | `q_hot.m4a` | What is the opposite of hot? | Opposites |
| 1677 | `q_big.m4a` | What is the opposite of big? | Opposites |
| 1678 | `q_up.m4a` | What is the opposite of up? | Opposites |
| 1679 | `q_day.m4a` | What is the opposite of day? | Opposites |
| 1680 | `q_happy.m4a` | What is the opposite of happy? | Opposites |
| 1681 | `q_fast.m4a` | What is the opposite of fast? | Opposites |
| 1682 | `q_open.m4a` | What is the opposite of open? | Opposites |
| 1683 | `q_wet.m4a` | What is the opposite of wet? | Opposites |
| 1684 | `q_loud.m4a` | What is the opposite of loud? | Opposites |
| 1685 | `q_notfruit.m4a` | Which one is NOT a fruit? | Odd one out |
| 1686 | `q_notanimal.m4a` | Which one is NOT an animal? | Odd one out |
| 1687 | `q_notwear.m4a` | Which one do you NOT wear on your feet? | Odd one out |
| 1688 | `q_cantfly.m4a` | Which one can NOT fly? | Odd one out |
| 1689 | `q_notalive.m4a` | Which one is NOT alive? | Odd one out |
| 1690 | `q_noteat.m4a` | Which one can you NOT eat? | Odd one out |
| 1691 | `q_notwater.m4a` | Which one does NOT live in the water? | Odd one out |
| 1692 | `q_nowheels.m4a` | Which one does NOT have wheels? | Odd one out |
| 1693 | `q_notmusic.m4a` | Which one is NOT a musical instrument? | Odd one out |
| 1694 | `q_r_cat.m4a` | Which one rhymes with cat? | Rhymes |
| 1695 | `q_r_bee.m4a` | Which one rhymes with bee? | Rhymes |
| 1696 | `q_r_car.m4a` | Which one rhymes with car? | Rhymes |
| 1697 | `q_r_frog.m4a` | Which one rhymes with frog? | Rhymes |
| 1698 | `q_r_cake.m4a` | Which one rhymes with cake? | Rhymes |
| 1699 | `q_r_goat.m4a` | Which one rhymes with goat? | Rhymes |
| 1700 | `q_r_bear.m4a` | Which one rhymes with bear? | Rhymes |
| 1701 | `q_r_mouse.m4a` | Which one rhymes with mouse? | Rhymes |
| 1702 | `q_r_moon.m4a` | Which one rhymes with moon? | Rhymes |
| 1703 | `q_r_king.m4a` | Which one rhymes with king? | Rhymes |
| 1704 | `q_r_fish.m4a` | Which one rhymes with fish? | Rhymes |
| 1705 | `q_plants.m4a` | What do plants need to grow? | Simple science |
| 1706 | `q_melt.m4a` | What happens to ice when it gets warm? | Simple science |
| 1707 | `q_magnet.m4a` | Which one sticks to a magnet? | Simple science |
| 1708 | `q_float.m4a` | Which one floats on water? | Simple science |
| 1709 | `q_rainfall.m4a` | What falls from rain clouds? | Simple science |
| 1710 | `q_seed.m4a` | A seed can grow into a... | Simple science |
| 1711 | `q_fire.m4a` | Which one is very hot? | Simple science |
| 1712 | `q_magnify.m4a` | Which tool helps you see tiny things up close? | Simple science |
| 1713 | `q_clock.m4a` | What do we use to tell the time? | Simple science |
| 1714 | `q_breathe.m4a` | What do we breathe in all day and all night? | Simple science |
| 1715 | `q_ocean.m4a` | What do we call a giant, salty water with big waves? | Maps & places |
| 1716 | `q_map.m4a` | What shows you where places are? | Maps & places |
| 1717 | `q_compass.m4a` | Which tool always points north? | Maps & places |
| 1718 | `q_mountain.m4a` | What is very, very tall land with a pointy top? | Maps & places |
| 1719 | `q_beach.m4a` | Where can you find lots of sand next to the water? | Maps & places |
| 1720 | `q_forest.m4a` | What place has lots and lots of trees? | Maps & places |
| 1721 | `q_desert.m4a` | Where is it very hot and dry, with lots of sand? | Maps & places |
| 1722 | `q_earthshape.m4a` | The Earth is round, like a... | Maps & places |
| 1723 | `q_city.m4a` | What do we call a big place with lots of buildings and streets? | Maps & places |
| 1724 | `q_penguinhome.m4a` | Many penguins live where it is very... | Maps & places |

## Bonus question answers (232) — later (232)

Say each answer on its own, brightly. They are read out as choices, and after "The answer is".

| # | File name | Say this | Note |
|---:|---|---|---|
| 1725 | `c_the_sun.m4a` | the Sun |  |
| 1726 | `c_earth.m4a` | Earth |  |
| 1727 | `c_saturn.m4a` | Saturn |  |
| 1728 | `c_mars.m4a` | Mars |  |
| 1729 | `c_the_moon.m4a` | the Moon |  |
| 1730 | `c_a_cloud.m4a` | a cloud |  |
| 1731 | `c_a_rocket.m4a` | a rocket |  |
| 1732 | `c_a_bus.m4a` | a bus |  |
| 1733 | `c_a_sailboat.m4a` | a sailboat |  |
| 1734 | `c_stars.m4a` | stars |  |
| 1735 | `c_a_rainbow.m4a` | a rainbow |  |
| 1736 | `c_butterflies.m4a` | butterflies |  |
| 1737 | `c_a_space_suit.m4a` | a space suit |  |
| 1738 | `c_a_swimsuit.m4a` | a swimsuit |  |
| 1739 | `c_a_raincoat.m4a` | a raincoat |  |
| 1740 | `c_star.m4a` | star |  |
| 1741 | `c_moon.m4a` | moon |  |
| 1742 | `c_cloud.m4a` | cloud |  |
| 1743 | `c_a_cow.m4a` | a cow |  |
| 1744 | `c_a_cat.m4a` | a cat |  |
| 1745 | `c_a_duck.m4a` | a duck |  |
| 1746 | `c_a_dog.m4a` | a dog |  |
| 1747 | `c_a_pig.m4a` | a pig |  |
| 1748 | `c_a_sheep.m4a` | a sheep |  |
| 1749 | `c_a_lion.m4a` | a lion |  |
| 1750 | `c_a_mouse.m4a` | a mouse |  |
| 1751 | `c_a_giraffe.m4a` | a giraffe |  |
| 1752 | `c_a_frog.m4a` | a frog |  |
| 1753 | `c_an_elephant.m4a` | an elephant |  |
| 1754 | `c_a_zebra.m4a` | a zebra |  |
| 1755 | `c_a_bird.m4a` | a bird |  |
| 1756 | `c_a_fish.m4a` | a fish |  |
| 1757 | `c_a_turtle.m4a` | a turtle |  |
| 1758 | `c_a_horse.m4a` | a horse |  |
| 1759 | `c_a_rabbit.m4a` | a rabbit |  |
| 1760 | `c_dog.m4a` | dog |  |
| 1761 | `c_cat.m4a` | cat |  |
| 1762 | `c_cow.m4a` | cow |  |
| 1763 | `c_horse.m4a` | horse |  |
| 1764 | `c_frog.m4a` | frog |  |
| 1765 | `c_fish.m4a` | fish |  |
| 1766 | `c_duck.m4a` | duck |  |
| 1767 | `c_butterfly.m4a` | butterfly |  |
| 1768 | `c_spider.m4a` | spider |  |
| 1769 | `c_snail.m4a` | snail |  |
| 1770 | `c_a_kangaroo.m4a` | a kangaroo |  |
| 1771 | `c_a_chicken.m4a` | a chicken |  |
| 1772 | `c_a_spider.m4a` | a spider |  |
| 1773 | `c_an_ant.m4a` | an ant |  |
| 1774 | `c_a_bee.m4a` | a bee |  |
| 1775 | `c_a_butterfly.m4a` | a butterfly |  |
| 1776 | `c_a_whale.m4a` | a whale |  |
| 1777 | `c_a_penguin.m4a` | a penguin |  |
| 1778 | `c_a_parrot.m4a` | a parrot |  |
| 1779 | `c_an_owl.m4a` | an owl |  |
| 1780 | `c_blue.m4a` | blue |  |
| 1781 | `c_green.m4a` | green |  |
| 1782 | `c_red.m4a` | red |  |
| 1783 | `c_purple.m4a` | purple |  |
| 1784 | `c_orange.m4a` | orange |  |
| 1785 | `c_yellow.m4a` | yellow |  |
| 1786 | `c_white.m4a` | white |  |
| 1787 | `c_black.m4a` | black |  |
| 1788 | `c_a_triangle.m4a` | a triangle |  |
| 1789 | `c_a_circle.m4a` | a circle |  |
| 1790 | `c_a_square.m4a` | a square |  |
| 1791 | `c_four.m4a` | four |  |
| 1792 | `c_three.m4a` | three |  |
| 1793 | `c_six.m4a` | six |  |
| 1794 | `c_a_star.m4a` | a star |  |
| 1795 | `c_the_heart.m4a` | the heart |  |
| 1796 | `c_the_star.m4a` | the star |  |
| 1797 | `c_the_circle.m4a` | the circle |  |
| 1798 | `c_fall.m4a` | fall |  |
| 1799 | `c_summer.m4a` | summer |  |
| 1800 | `c_spring.m4a` | spring |  |
| 1801 | `c_winter.m4a` | winter |  |
| 1802 | `c_an_umbrella.m4a` | an umbrella |  |
| 1803 | `c_sunglasses.m4a` | sunglasses |  |
| 1804 | `c_mittens.m4a` | mittens |  |
| 1805 | `c_a_snowman.m4a` | a snowman |  |
| 1806 | `c_sandals.m4a` | sandals |  |
| 1807 | `c_shorts.m4a` | shorts |  |
| 1808 | `c_lightning.m4a` | lightning |  |
| 1809 | `c_ice.m4a` | ice |  |
| 1810 | `c_sugar.m4a` | sugar |  |
| 1811 | `c_paper.m4a` | paper |  |
| 1812 | `c_a_beach.m4a` | a beach |  |
| 1813 | `c_a_sunflower.m4a` | a sunflower |  |
| 1814 | `c_your_eyes.m4a` | your eyes |  |
| 1815 | `c_your_ears.m4a` | your ears |  |
| 1816 | `c_your_nose.m4a` | your nose |  |
| 1817 | `c_your_hands.m4a` | your hands |  |
| 1818 | `c_your_feet.m4a` | your feet |  |
| 1819 | `c_five.m4a` | five |  |
| 1820 | `c_ten.m4a` | ten |  |
| 1821 | `c_your_teeth.m4a` | your teeth |  |
| 1822 | `c_your_heart.m4a` | your heart |  |
| 1823 | `c_your_foot.m4a` | your foot |  |
| 1824 | `c_your_brain.m4a` | your brain |  |
| 1825 | `c_your_leg.m4a` | your leg |  |
| 1826 | `c_your_ear.m4a` | your ear |  |
| 1827 | `c_wash_your_hands.m4a` | wash your hands |  |
| 1828 | `c_take_a_nap.m4a` | take a nap |  |
| 1829 | `c_hop_like_a_kangaroo.m4a` | hop like a kangaroo |  |
| 1830 | `c_two.m4a` | two |  |
| 1831 | `c_an_apple.m4a` | an apple |  |
| 1832 | `c_a_carrot.m4a` | a carrot |  |
| 1833 | `c_bread.m4a` | bread |  |
| 1834 | `c_a_banana.m4a` | a banana |  |
| 1835 | `c_ice_cream.m4a` | ice cream |  |
| 1836 | `c_soup.m4a` | soup |  |
| 1837 | `c_toast.m4a` | toast |  |
| 1838 | `c_a_potato.m4a` | a potato |  |
| 1839 | `c_cheese.m4a` | cheese |  |
| 1840 | `c_grapes.m4a` | grapes |  |
| 1841 | `c_a_strawberry.m4a` | a strawberry |  |
| 1842 | `c_corn.m4a` | corn |  |
| 1843 | `c_apples.m4a` | apples |  |
| 1844 | `c_carrots.m4a` | carrots |  |
| 1845 | `c_honey.m4a` | honey |  |
| 1846 | `c_an_orange.m4a` | an orange |  |
| 1847 | `c_cold.m4a` | cold |  |
| 1848 | `c_sunny.m4a` | sunny |  |
| 1849 | `c_loud.m4a` | loud |  |
| 1850 | `c_small.m4a` | small |  |
| 1851 | `c_tall.m4a` | tall |  |
| 1852 | `c_fast.m4a` | fast |  |
| 1853 | `c_down.m4a` | down |  |
| 1854 | `c_left.m4a` | left |  |
| 1855 | `c_right.m4a` | right |  |
| 1856 | `c_night.m4a` | night |  |
| 1857 | `c_morning.m4a` | morning |  |
| 1858 | `c_lunch.m4a` | lunch |  |
| 1859 | `c_sad.m4a` | sad |  |
| 1860 | `c_silly.m4a` | silly |  |
| 1861 | `c_sleepy.m4a` | sleepy |  |
| 1862 | `c_slow.m4a` | slow |  |
| 1863 | `c_closed.m4a` | closed |  |
| 1864 | `c_dry.m4a` | dry |  |
| 1865 | `c_quiet.m4a` | quiet |  |
| 1866 | `c_the_carrot.m4a` | the carrot |  |
| 1867 | `c_the_apple.m4a` | the apple |  |
| 1868 | `c_the_banana.m4a` | the banana |  |
| 1869 | `c_the_grapes.m4a` | the grapes |  |
| 1870 | `c_the_car.m4a` | the car |  |
| 1871 | `c_the_cat.m4a` | the cat |  |
| 1872 | `c_the_dog.m4a` | the dog |  |
| 1873 | `c_the_cow.m4a` | the cow |  |
| 1874 | `c_the_spoon.m4a` | the spoon |  |
| 1875 | `c_the_sock.m4a` | the sock |  |
| 1876 | `c_the_sneaker.m4a` | the sneaker |  |
| 1877 | `c_the_boot.m4a` | the boot |  |
| 1878 | `c_the_fish.m4a` | the fish |  |
| 1879 | `c_the_bird.m4a` | the bird |  |
| 1880 | `c_the_airplane.m4a` | the airplane |  |
| 1881 | `c_the_butterfly.m4a` | the butterfly |  |
| 1882 | `c_the_teddy_bear.m4a` | the teddy bear |  |
| 1883 | `c_the_tree.m4a` | the tree |  |
| 1884 | `c_the_frog.m4a` | the frog |  |
| 1885 | `c_the_bee.m4a` | the bee |  |
| 1886 | `c_the_pizza.m4a` | the pizza |  |
| 1887 | `c_the_cheese.m4a` | the cheese |  |
| 1888 | `c_the_lion.m4a` | the lion |  |
| 1889 | `c_the_octopus.m4a` | the octopus |  |
| 1890 | `c_the_whale.m4a` | the whale |  |
| 1891 | `c_the_sailboat.m4a` | the sailboat |  |
| 1892 | `c_the_bike.m4a` | the bike |  |
| 1893 | `c_the_bus.m4a` | the bus |  |
| 1894 | `c_the_hammer.m4a` | the hammer |  |
| 1895 | `c_the_drum.m4a` | the drum |  |
| 1896 | `c_the_guitar.m4a` | the guitar |  |
| 1897 | `c_the_trumpet.m4a` | the trumpet |  |
| 1898 | `c_hat.m4a` | hat |  |
| 1899 | `c_sun.m4a` | sun |  |
| 1900 | `c_tree.m4a` | tree |  |
| 1901 | `c_bus.m4a` | bus |  |
| 1902 | `c_bird.m4a` | bird |  |
| 1903 | `c_snake.m4a` | snake |  |
| 1904 | `c_apple.m4a` | apple |  |
| 1905 | `c_drum.m4a` | drum |  |
| 1906 | `c_boat.m4a` | boat |  |
| 1907 | `c_sheep.m4a` | sheep |  |
| 1908 | `c_chair.m4a` | chair |  |
| 1909 | `c_bed.m4a` | bed |  |
| 1910 | `c_shoe.m4a` | shoe |  |
| 1911 | `c_house.m4a` | house |  |
| 1912 | `c_spoon.m4a` | spoon |  |
| 1913 | `c_ring.m4a` | ring |  |
| 1914 | `c_crown.m4a` | crown |  |
| 1915 | `c_castle.m4a` | castle |  |
| 1916 | `c_dish.m4a` | dish |  |
| 1917 | `c_fork.m4a` | fork |  |
| 1918 | `c_cup.m4a` | cup |  |
| 1919 | `c_water.m4a` | water |  |
| 1920 | `c_candy.m4a` | candy |  |
| 1921 | `c_toys.m4a` | toys |  |
| 1922 | `c_it_melts.m4a` | it melts |  |
| 1923 | `c_it_gets_colder.m4a` | it gets colder |  |
| 1924 | `c_it_bounces.m4a` | it bounces |  |
| 1925 | `c_a_paper_clip.m4a` | a paper clip |  |
| 1926 | `c_a_teddy_bear.m4a` | a teddy bear |  |
| 1927 | `c_a_boat.m4a` | a boat |  |
| 1928 | `c_a_key.m4a` | a key |  |
| 1929 | `c_a_hammer.m4a` | a hammer |  |
| 1930 | `c_leaves.m4a` | leaves |  |
| 1931 | `c_plant.m4a` | plant |  |
| 1932 | `c_car.m4a` | car |  |
| 1933 | `c_fire.m4a` | fire |  |
| 1934 | `c_a_magnifying_glass.m4a` | a magnifying glass |  |
| 1935 | `c_a_spoon.m4a` | a spoon |  |
| 1936 | `c_a_sock.m4a` | a sock |  |
| 1937 | `c_a_clock.m4a` | a clock |  |
| 1938 | `c_a_sneaker.m4a` | a sneaker |  |
| 1939 | `c_air.m4a` | air |  |
| 1940 | `c_juice.m4a` | juice |  |
| 1941 | `c_sand.m4a` | sand |  |
| 1942 | `c_the_ocean.m4a` | the ocean |  |
| 1943 | `c_a_puddle.m4a` | a puddle |  |
| 1944 | `c_a_cup.m4a` | a cup |  |
| 1945 | `c_a_map.m4a` | a map |  |
| 1946 | `c_a_compass.m4a` | a compass |  |
| 1947 | `c_a_mountain.m4a` | a mountain |  |
| 1948 | `c_a_forest.m4a` | a forest |  |
| 1949 | `c_a_desert.m4a` | a desert |  |
| 1950 | `c_an_iceberg.m4a` | an iceberg |  |
| 1951 | `c_ball.m4a` | ball |  |
| 1952 | `c_box.m4a` | box |  |
| 1953 | `c_triangle.m4a` | triangle |  |
| 1954 | `c_a_city.m4a` | a city |  |
| 1955 | `c_an_ocean.m4a` | an ocean |  |
| 1956 | `c_hot.m4a` | hot |  |

## Tiny Picnic (toddler mode) — record first (66)

Slow, warm and simple, for a 2-year-old. Prompts, gentle "that's a ..." lines for any tap, and cheers.

| # | File name | Say this | Note |
|---:|---|---|---|
| 1957 | `tp_title.m4a` | Tiny Picnic! |  |
| 1958 | `tp_hello.m4a` | Tiny Picnic! Let's play! |  |
| 1959 | `tp_match.m4a` | Find the same one! |  |
| 1960 | `tp_yay_1.m4a` | Yay! You found it! |  |
| 1961 | `tp_yay_2.m4a` | Great job! |  |
| 1962 | `tp_yay_3.m4a` | Hooray! |  |
| 1963 | `tp_yay_4.m4a` | You did it! |  |
| 1964 | `tp_done.m4a` | Hooray! What a great picnic! |  |
| 1965 | `tp_again.m4a` | Play again? |  |
| 1966 | `tp_home.m4a` | Bye bye, picnic! |  |
| 1967 | `tp_find_strawberry.m4a` | Find the strawberry! |  |
| 1968 | `tp_is_strawberry.m4a` | That's a strawberry! |  |
| 1969 | `tp_find_apple.m4a` | Find the apple! |  |
| 1970 | `tp_is_apple.m4a` | That's an apple! |  |
| 1971 | `tp_find_banana.m4a` | Find the banana! |  |
| 1972 | `tp_is_banana.m4a` | That's a banana! |  |
| 1973 | `tp_find_corn.m4a` | Find the corn! |  |
| 1974 | `tp_is_corn.m4a` | That's corn! |  |
| 1975 | `tp_find_lemon.m4a` | Find the lemon! |  |
| 1976 | `tp_is_lemon.m4a` | That's a lemon! |  |
| 1977 | `tp_find_blueberry.m4a` | Find the blueberry! |  |
| 1978 | `tp_is_blueberry.m4a` | That's a blueberry! |  |
| 1979 | `tp_find_carrot.m4a` | Find the carrot! |  |
| 1980 | `tp_is_carrot.m4a` | That's a carrot! |  |
| 1981 | `tp_find_broccoli.m4a` | Find the broccoli! |  |
| 1982 | `tp_is_broccoli.m4a` | That's broccoli! |  |
| 1983 | `tp_find_pear.m4a` | Find the pear! |  |
| 1984 | `tp_is_pear.m4a` | That's a pear! |  |
| 1985 | `tp_find_grapes.m4a` | Find the grapes! |  |
| 1986 | `tp_is_grapes.m4a` | Those are grapes! |  |
| 1987 | `tp_find_watermelon.m4a` | Find the watermelon! |  |
| 1988 | `tp_is_watermelon.m4a` | That's a watermelon! |  |
| 1989 | `tp_find_pineapple.m4a` | Find the pineapple! |  |
| 1990 | `tp_is_pineapple.m4a` | That's a pineapple! |  |
| 1991 | `tp_find_cupcake.m4a` | Find the cupcake! |  |
| 1992 | `tp_is_cupcake.m4a` | That's a cupcake! |  |
| 1993 | `tp_find_cookie.m4a` | Find the cookie! |  |
| 1994 | `tp_is_cookie.m4a` | That's a cookie! |  |
| 1995 | `tp_find_circle.m4a` | Find the circle! |  |
| 1996 | `tp_is_circle.m4a` | That's a circle! |  |
| 1997 | `tp_find_square.m4a` | Find the square! |  |
| 1998 | `tp_is_square.m4a` | That's a square! |  |
| 1999 | `tp_find_triangle.m4a` | Find the triangle! |  |
| 2000 | `tp_is_triangle.m4a` | That's a triangle! |  |
| 2001 | `tp_find_star.m4a` | Find the star! |  |
| 2002 | `tp_is_star.m4a` | That's a star! |  |
| 2003 | `tp_find_heart.m4a` | Find the heart! |  |
| 2004 | `tp_is_heart.m4a` | That's a heart! |  |
| 2005 | `tp_color_red.m4a` | Which one is red? |  |
| 2006 | `tp_c_red.m4a` | That's red! |  |
| 2007 | `tp_color_yellow.m4a` | Which one is yellow? |  |
| 2008 | `tp_c_yellow.m4a` | That's yellow! |  |
| 2009 | `tp_color_blue.m4a` | Which one is blue? |  |
| 2010 | `tp_c_blue.m4a` | That's blue! |  |
| 2011 | `tp_color_green.m4a` | Which one is green? |  |
| 2012 | `tp_c_green.m4a` | That's green! |  |
| 2013 | `tp_color_orange.m4a` | Which one is orange? |  |
| 2014 | `tp_c_orange.m4a` | That's orange! |  |
| 2015 | `tp_color_purple.m4a` | Which one is purple? |  |
| 2016 | `tp_c_purple.m4a` | That's purple! |  |
| 2017 | `tp_count_1.m4a` | Find one! |  |
| 2018 | `tp_n_1.m4a` | That's one! |  |
| 2019 | `tp_count_2.m4a` | Find two! |  |
| 2020 | `tp_n_2.m4a` | That's two! |  |
| 2021 | `tp_count_3.m4a` | Find three! |  |
| 2022 | `tp_n_3.m4a` | That's three! |  |

## Play-time limit & stretch breaks — record first (3)

Calm and kind. Said at a natural stopping point, never mid-question.

| # | File name | Say this | Note |
|---:|---|---|---|
| 2023 | `pt_stop.m4a` | Great stopping point! You played so well today. Time to rest. |  |
| 2024 | `pt_bye.m4a` | Bye bye! See you next time! |  |
| 2025 | `pt_stretch.m4a` | Time for a stretch! Reach up high, wiggle your fingers, and take a big breath. |  |

---
*Generated from `js/core/voice-lines.js` by `tools/build-recording-script.js`. File names can end in .m4a, .mp3, .wav or .webm.*
