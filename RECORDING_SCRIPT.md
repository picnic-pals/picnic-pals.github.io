# Blob Arcade — Voice Recording Script

Hi grown-up! The arcade already talks, using friendly built-in voice clips (computer-generated, in `audio/voice-tts/`). Every line you record replaces that line with your voice — you can do a few at a time, in any order, and the grown-up area shows each line as “your voice”, “built-in clip” or “computer voice”.

## The short version

1. Start with the **Record first** sections: **481 lines** (roughly 20–30 minutes). Everything else is for upcoming games and can wait.
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
| Arcade home & menus | **Record first** | 15 |
| Player & blob names | **Record first** | 8 |
| Mochi Munch | **Record first** | 16 |
| Math words (sentence parts) | **Record first** | 12 |
| Praise & feedback (shared by all games) | **Record first** | 29 |
| New-skill intros (Munch) | **Record first** | 10 |
| Colors, shapes, letters & words (new skills) | **Record first** | 174 |
| Mochi Munch: timer, bonus questions & two players | **Record first** | 25 |
| Mochi Munch: menu, levels & high scores | **Record first** | 33 |
| Mochi Munch story: Blob Island | Later | 33 |
| Numbers 0–20 | **Record first** | 21 |
| Numbers 21–100 (optional, for later) | Later | 80 |
| Sight Words game (coming soon) | Later | 8 |
| Sight words: Dolch Pre-Primer (40) | Later | 40 |
| Sight words: Dolch Primer (52) | Later | 52 |
| Blob Baseball | **Record first** | 45 |
| Blob Baseball questions (sentence parts) | **Record first** | 9 |
| Penalty Kicks (coming soon) | Later | 15 |
| Blob Room | **Record first** | 36 |
| Blob friends: bios and room chatter | **Record first** | 48 |
| Blob Room things (64) | Later | 64 |
| Bonus questions (127) | Later | 127 |
| Bonus question answers (232) | Later | 232 |
| **Record first, total** | | **481** |
| Later (optional, upcoming games), total | | 651 |
| **Everything** | | **1132** |

## Arcade home & menus — record first (15)

| # | File name | Say this | Note |
|---:|---|---|---|
| 1 | `hub_whos_playing.m4a` | Who's playing today? |  |
| 2 | `hub_hi.m4a` | Hi, | Followed by the player's name (spoken by the browser voice), e.g. "Hi," + "Player 1!" |
| 3 | `hub_welcome_back.m4a` | Welcome back! | Said instead of "Hi, <name>!" when the browser has no speech voice |
| 4 | `hub_pick_game.m4a` | What do you want to play? |  |
| 5 | `hub_coming_soon.m4a` | That game is coming soon! |  |
| 6 | `hub_stickers.m4a` | Here is your sticker book! |  |
| 7 | `hub_closet.m4a` | Dress-up time! Pick your blob, a color, and an outfit. |  |
| 8 | `hub_im.m4a` | Hi, I'm | Followed by a blob name, e.g. "Hi, I'm" + "Mochi!" |
| 9 | `hub_looking_good.m4a` | Looking good! |  |
| 10 | `hub_locked.m4a` | Keep earning stars to unlock that one! |  |
| 11 | `hub_new_sticker.m4a` | You got a new sticker! |  |
| 12 | `hub_new_outfit.m4a` | You unlocked a new outfit! |  |
| 13 | `hub_new_color.m4a` | You unlocked a new color! |  |
| 14 | `hub_grownups.m4a` | That button is for grown-ups. |  |
| 15 | `hub_lets_go.m4a` | Let's go! |  |

## Player & blob names — record first (8)

Say each name brightly, like you are introducing them. (Kids' own names are spoken by the browser voice.)

| # | File name | Say this | Note |
|---:|---|---|---|
| 16 | `pl_one.m4a` | Player 1! |  |
| 17 | `pl_two.m4a` | Player 2! |  |
| 18 | `blob_mochi.m4a` | Mochi! |  |
| 19 | `blob_poppy.m4a` | Poppy! |  |
| 20 | `blob_dewdrop.m4a` | Dewdrop! |  |
| 21 | `blob_pickle.m4a` | Pickle! |  |
| 22 | `blob_nova.m4a` | Nova! |  |
| 23 | `blob_clem.m4a` | Clem! |  |

## Mochi Munch — record first (16)

Rule lines are followed by a number clip, e.g. "Munch the ones that make" + "7".

| # | File name | Say this | Note |
|---:|---|---|---|
| 24 | `munch_title.m4a` | Mochi Munch! |  |
| 25 | `munch_ready.m4a` | Ready? Press the space bar, or tap Play! |  |
| 26 | `munch_intro.m4a` | Help me munch the right ones! |  |
| 27 | `munch_how_keys.m4a` | Use the arrow keys to move. Press space to munch! |  |
| 28 | `munch_how_touch.m4a` | Tap a square to walk there. Tap me to munch! |  |
| 29 | `munch_rule_number.m4a` | Munch the number | + number |
| 30 | `munch_rule_bigger.m4a` | Munch the numbers bigger than | + number |
| 31 | `munch_rule_smaller.m4a` | Munch the numbers smaller than | + number |
| 32 | `munch_rule_make.m4a` | Munch the ones that make | + number |
| 33 | `munch_rule_make10.m4a` | Make ten! Munch the pairs that make ten! |  |
| 34 | `munch_rule_missing.m4a` | Munch the ones where the missing number is | + number |
| 35 | `munch_rule_even.m4a` | Munch the even numbers! |  |
| 36 | `munch_rule_odd.m4a` | Munch the odd numbers! |  |
| 37 | `munch_already.m4a` | Already munched! Find another one. |  |
| 38 | `munch_snack.m4a` | That's okay! Let's have a snack break, and try again! |  |
| 39 | `munch_boing.m4a` | Boing! Grumbly bumped me back to the corner! |  |

## Math words (sentence parts) — record first (12)

Short connector words. Say them evenly, not as a question — they get joined with numbers, e.g. "3" + "plus" + "4" + "is" + "7".

| # | File name | Say this | Note |
|---:|---|---|---|
| 40 | `w_plus.m4a` | plus |  |
| 41 | `w_minus.m4a` | minus |  |
| 42 | `w_is.m4a` | is |  |
| 43 | `w_makes.m4a` | makes |  |
| 44 | `w_thats.m4a` | That's |  |
| 45 | `w_not.m4a` | not |  |
| 46 | `w_bigger_than.m4a` | is bigger than |  |
| 47 | `w_smaller_than.m4a` | is smaller than |  |
| 48 | `w_same_as.m4a` | is the same as |  |
| 49 | `w_is_even.m4a` | is even |  |
| 50 | `w_is_odd.m4a` | is odd |  |
| 51 | `w_so_box_is.m4a` | so the box is |  |

## Praise & feedback (shared by all games) — record first (29)

| # | File name | Say this | Note |
|---:|---|---|---|
| 52 | `fb_yum.m4a` | Yum! |  |
| 53 | `fb_nom.m4a` | Nom nom nom! |  |
| 54 | `fb_yummy.m4a` | Yummy! |  |
| 55 | `fb_great_job.m4a` | Great job! |  |
| 56 | `fb_you_got_it.m4a` | You got it! |  |
| 57 | `fb_delicious.m4a` | Delicious! |  |
| 58 | `fb_super.m4a` | Super! |  |
| 59 | `fb_wow.m4a` | Wow! |  |
| 60 | `fb_oops.m4a` | Oops! |  |
| 61 | `fb_so_close.m4a` | So close! |  |
| 62 | `fb_hooray.m4a` | Hooray! |  |
| 63 | `fb_you_got.m4a` | You got | + number + "stars!" |
| 64 | `fb_star.m4a` | star! |  |
| 65 | `fb_stars.m4a` | stars! |  |
| 66 | `fb_perfect.m4a` | Perfect! No mistakes! |  |
| 67 | `fb_level_up.m4a` | Level up! |  |
| 68 | `fb_trickier.m4a` | The next one is a little trickier! |  |
| 69 | `fb_one_more.m4a` | Awesome! One more round like that and you have got it! |  |
| 70 | `fb_mastered.m4a` | You mastered it! Time for something new! |  |
| 71 | `fb_champion.m4a` | You're a math champion! |  |
| 72 | `fb_practice_again.m4a` | Let's practice this one more time! |  |
| 73 | `fb_practice_more.m4a` | Let's practice some more. You can do it! |  |
| 74 | `fb_easier.m4a` | Let's try some easier ones! |  |
| 75 | `fb_detour.m4a` | Let's play one you know, then come back to this one! |  |
| 76 | `fb_back_now.m4a` | Nice! Now let's go back to the new one! |  |
| 77 | `fb_review_good.m4a` | You still remember it! Great! |  |
| 78 | `fb_keep_going.m4a` | Keep going! |  |
| 79 | `fb_new_skill.m4a` | New skill! |  |
| 80 | `fb_try_again.m4a` | Try again! |  |

## New-skill intros (Munch) — record first (10)

Played when a new skill unlocks.

| # | File name | Say this | Note |
|---:|---|---|---|
| 81 | `skill_count10.m4a` | Find the number! Look for the number, or count the dots. |  |
| 82 | `skill_compare.m4a` | Bigger and smaller! Which numbers are more? Which are less? |  |
| 83 | `skill_add10.m4a` | Adding! Put the numbers together to see how many. |  |
| 84 | `skill_sub10.m4a` | Take away! Start with the big number and take some away. |  |
| 85 | `skill_make10.m4a` | Make ten! Find two numbers that make ten together. |  |
| 86 | `skill_teen.m4a` | Teen numbers! A teen number is ten, and some more. |  |
| 87 | `skill_missing.m4a` | Missing number! What number is hiding in the box? |  |
| 88 | `skill_add20.m4a` | Adding to twenty! Tip: make ten first, then add the rest. |  |
| 89 | `skill_sub20.m4a` | Take away to twenty! Tip: take away to ten first. |  |
| 90 | `skill_evenodd.m4a` | Even and odd! Even numbers make pairs. Odd numbers have one left over. |  |

## Colors, shapes, letters & words (new skills) — record first (174)

Rules, letter names and picture words for the Reading & Words and Early Concepts skills. Say letter NAMES ("bee", not "buh"). Picture words: say each word on its own, clearly.

| # | File name | Say this | Note |
|---:|---|---|---|
| 91 | `rule_color_red.m4a` | Munch the red things! |  |
| 92 | `rule_color_yellow.m4a` | Munch the yellow things! |  |
| 93 | `rule_color_blue.m4a` | Munch the blue things! |  |
| 94 | `rule_color_green.m4a` | Munch the green things! |  |
| 95 | `rule_color_orange.m4a` | Munch the orange things! |  |
| 96 | `rule_color_purple.m4a` | Munch the purple things! |  |
| 97 | `rule_color_pink.m4a` | Munch the pink things! |  |
| 98 | `rule_color_brown.m4a` | Munch the brown things! |  |
| 99 | `rule_shape_circle.m4a` | Munch the circles! |  |
| 100 | `rule_shape_square.m4a` | Munch the squares! |  |
| 101 | `rule_shape_triangle.m4a` | Munch the triangles! |  |
| 102 | `rule_shape_star.m4a` | Munch the stars! |  |
| 103 | `rule_shape_heart.m4a` | Munch the hearts! |  |
| 104 | `rule_shape_rectangle.m4a` | Munch the rectangles! |  |
| 105 | `rule_shape_oval.m4a` | Munch the ovals! |  |
| 106 | `rule_shape_diamond.m4a` | Munch the diamonds! |  |
| 107 | `sh_circle.m4a` | a circle |  |
| 108 | `sh_square.m4a` | a square |  |
| 109 | `sh_triangle.m4a` | a triangle |  |
| 110 | `sh_star.m4a` | a star |  |
| 111 | `sh_heart.m4a` | a heart |  |
| 112 | `sh_rectangle.m4a` | a rectangle |  |
| 113 | `sh_oval.m4a` | an oval |  |
| 114 | `sh_diamond.m4a` | a diamond |  |
| 115 | `rule_letter.m4a` | Munch the letter | + letter, e.g. "Munch the letter" + "B" |
| 116 | `w_big_little.m4a` | big and little! |  |
| 117 | `rule_begins.m4a` | Munch the things that start with | + letter + "like" + word: "...start with" + "B" + "like" + "banana" |
| 118 | `w_like.m4a` | like |  |
| 119 | `w_starts_with.m4a` | starts with | "banana" + "starts with" + "B" |
| 120 | `rule_rhymes.m4a` | Munch the things that rhyme with | + word |
| 121 | `w_rhymes_with.m4a` | rhymes with | "hat" + "rhymes with" + "cat" |
| 122 | `w_no_rhyme.m4a` | does not rhyme with | "dog" + "does not rhyme with" + "cat" |
| 123 | `rule_sight.m4a` | Munch the word | + sight word |
| 124 | `w_are.m4a` | are | "grapes" + "are" + "purple" |
| 125 | `q_which_is.m4a` | Which one is | + color or shape: "Which one is" + "red?" |
| 126 | `q_which_letter.m4a` | Which one is the letter | + letter |
| 127 | `q_which_starts.m4a` | Which one starts with | + letter |
| 128 | `q_which_rhymes.m4a` | Which one rhymes with | + word |
| 129 | `fb_star_learner.m4a` | You're a super learner! |  |
| 130 | `skill_colors.m4a` | Colors! Find the things that are the same color. |  |
| 131 | `skill_shapes.m4a` | Shapes! Circles, squares, triangles, and more. |  |
| 132 | `skill_letters.m4a` | Letters! Find the letter. Big letters and little letters. |  |
| 133 | `skill_begsound.m4a` | First sounds! Say the name of the picture. What sound does it start with? |  |
| 134 | `skill_rhymes.m4a` | Rhymes! Cat, hat and bat all sound the same at the end. |  |
| 135 | `skill_sight.m4a` | Sight words! Little words we see in every book. |  |
| 136 | `lt_a.m4a` | A | the letter name |
| 137 | `lt_b.m4a` | B | the letter name |
| 138 | `lt_c.m4a` | C | the letter name |
| 139 | `lt_d.m4a` | D | the letter name |
| 140 | `lt_e.m4a` | E | the letter name |
| 141 | `lt_f.m4a` | F | the letter name |
| 142 | `lt_g.m4a` | G | the letter name |
| 143 | `lt_h.m4a` | H | the letter name |
| 144 | `lt_i.m4a` | I | the letter name |
| 145 | `lt_j.m4a` | J | the letter name |
| 146 | `lt_k.m4a` | K | the letter name |
| 147 | `lt_l.m4a` | L | the letter name |
| 148 | `lt_m.m4a` | M | the letter name |
| 149 | `lt_n.m4a` | N | the letter name |
| 150 | `lt_o.m4a` | O | the letter name |
| 151 | `lt_p.m4a` | P | the letter name |
| 152 | `lt_q.m4a` | Q | the letter name |
| 153 | `lt_r.m4a` | R | the letter name |
| 154 | `lt_s.m4a` | S | the letter name |
| 155 | `lt_t.m4a` | T | the letter name |
| 156 | `lt_u.m4a` | U | the letter name |
| 157 | `lt_v.m4a` | V | the letter name |
| 158 | `lt_w.m4a` | W | the letter name |
| 159 | `lt_x.m4a` | X | the letter name |
| 160 | `lt_y.m4a` | Y | the letter name |
| 161 | `lt_z.m4a` | Z | the letter name |
| 162 | `pw_pink.m4a` | pink |  |
| 163 | `pw_brown.m4a` | brown |  |
| 164 | `pw_strawberry.m4a` | strawberry |  |
| 165 | `pw_cherries.m4a` | cherries |  |
| 166 | `pw_tomato.m4a` | tomato |  |
| 167 | `pw_fire_truck.m4a` | fire truck |  |
| 168 | `pw_heart.m4a` | heart |  |
| 169 | `pw_carrot.m4a` | carrot |  |
| 170 | `pw_pumpkin.m4a` | pumpkin |  |
| 171 | `pw_basketball.m4a` | basketball |  |
| 172 | `pw_fox.m4a` | fox |  |
| 173 | `pw_banana.m4a` | banana |  |
| 174 | `pw_lemon.m4a` | lemon |  |
| 175 | `pw_chick.m4a` | chick |  |
| 176 | `pw_sunflower.m4a` | sunflower |  |
| 177 | `pw_broccoli.m4a` | broccoli |  |
| 178 | `pw_clover.m4a` | clover |  |
| 179 | `pw_cucumber.m4a` | cucumber |  |
| 180 | `pw_green_apple.m4a` | green apple |  |
| 181 | `pw_cactus.m4a` | cactus |  |
| 182 | `pw_turtle.m4a` | turtle |  |
| 183 | `pw_blueberries.m4a` | blueberries |  |
| 184 | `pw_whale.m4a` | whale |  |
| 185 | `pw_water_drop.m4a` | water drop |  |
| 186 | `pw_jeans.m4a` | jeans |  |
| 187 | `pw_cap.m4a` | cap |  |
| 188 | `pw_eggplant.m4a` | eggplant |  |
| 189 | `pw_pig.m4a` | pig |  |
| 190 | `pw_cherry_blossom.m4a` | cherry blossom |  |
| 191 | `pw_flamingo.m4a` | flamingo |  |
| 192 | `pw_bear.m4a` | bear |  |
| 193 | `pw_cookie.m4a` | cookie |  |
| 194 | `pw_potato.m4a` | potato |  |
| 195 | `pw_chestnut.m4a` | chestnut |  |
| 196 | `pw_bee.m4a` | bee |  |
| 197 | `pw_bell.m4a` | bell |  |
| 198 | `pw_book.m4a` | book |  |
| 199 | `pw_balloon.m4a` | balloon |  |
| 200 | `pw_dolphin.m4a` | dolphin |  |
| 201 | `pw_dinosaur.m4a` | dinosaur |  |
| 202 | `pw_door.m4a` | door |  |
| 203 | `pw_deer.m4a` | deer |  |
| 204 | `pw_monkey.m4a` | monkey |  |
| 205 | `pw_mouse.m4a` | mouse |  |
| 206 | `pw_milk.m4a` | milk |  |
| 207 | `pw_mushroom.m4a` | mushroom |  |
| 208 | `pw_magnet.m4a` | magnet |  |
| 209 | `pw_map.m4a` | map |  |
| 210 | `pw_pizza.m4a` | pizza |  |
| 211 | `pw_pear.m4a` | pear |  |
| 212 | `pw_penguin.m4a` | penguin |  |
| 213 | `pw_popcorn.m4a` | popcorn |  |
| 214 | `pw_panda.m4a` | panda |  |
| 215 | `pw_pineapple.m4a` | pineapple |  |
| 216 | `pw_pencil.m4a` | pencil |  |
| 217 | `pw_sock.m4a` | sock |  |
| 218 | `pw_sandwich.m4a` | sandwich |  |
| 219 | `pw_soap.m4a` | soap |  |
| 220 | `pw_seal.m4a` | seal |  |
| 221 | `pw_salad.m4a` | salad |  |
| 222 | `pw_tiger.m4a` | tiger |  |
| 223 | `pw_tent.m4a` | tent |  |
| 224 | `pw_taco.m4a` | taco |  |
| 225 | `pw_tooth.m4a` | tooth |  |
| 226 | `pw_foot.m4a` | foot |  |
| 227 | `pw_goat.m4a` | goat |  |
| 228 | `pw_guitar.m4a` | guitar |  |
| 229 | `pw_ghost.m4a` | ghost |  |
| 230 | `pw_hippo.m4a` | hippo |  |
| 231 | `pw_helicopter.m4a` | helicopter |  |
| 232 | `pw_hammer.m4a` | hammer |  |
| 233 | `pw_kite.m4a` | kite |  |
| 234 | `pw_key.m4a` | key |  |
| 235 | `pw_kangaroo.m4a` | kangaroo |  |
| 236 | `pw_koala.m4a` | koala |  |
| 237 | `pw_lion.m4a` | lion |  |
| 238 | `pw_leaf.m4a` | leaf |  |
| 239 | `pw_lollipop.m4a` | lollipop |  |
| 240 | `pw_lock.m4a` | lock |  |
| 241 | `pw_ladybug.m4a` | ladybug |  |
| 242 | `pw_lizard.m4a` | lizard |  |
| 243 | `pw_rainbow.m4a` | rainbow |  |
| 244 | `pw_rocket.m4a` | rocket |  |
| 245 | `pw_robot.m4a` | robot |  |
| 246 | `pw_watermelon.m4a` | watermelon |  |
| 247 | `pw_worm.m4a` | worm |  |
| 248 | `pw_window.m4a` | window |  |
| 249 | `pw_bat.m4a` | bat |  |
| 250 | `pw_cake.m4a` | cake |  |
| 251 | `pw_snowflake.m4a` | snowflake |  |
| 252 | `pw_raccoon.m4a` | raccoon |  |
| 253 | `pw_coat.m4a` | coat |  |
| 254 | `pw_clock.m4a` | clock |  |
| 255 | `pw_sled.m4a` | sled |  |
| 256 | `pw_pie.m4a` | pie |  |
| 257 | `pw_tie.m4a` | tie |  |
| 258 | `pw_eye.m4a` | eye |  |
| 259 | `pw_train.m4a` | train |  |
| 260 | `pw_rain.m4a` | rain |  |
| 261 | `pw_chain.m4a` | chain |  |
| 262 | `pw_nose.m4a` | nose |  |
| 263 | `pw_rose.m4a` | rose |  |
| 264 | `pw_shell.m4a` | shell |  |

## Mochi Munch: timer, bonus questions & two players — record first (25)

Lines with "+ name" are followed by a player name, e.g. "That one is for" + "Player 2!".

| # | File name | Say this | Note |
|---:|---|---|---|
| 265 | `munch_times_up.m4a` | Time's up! Let's see how you did! |  |
| 266 | `munch_little_time.m4a` | Just a little time left! |  |
| 267 | `fb_careful.m4a` | Careful munching! Let's try that one again. |  |
| 268 | `munch_bonus_star.m4a` | Ooh, a bonus star! Walk onto it! |  |
| 269 | `bonus_title.m4a` | Bonus question! |  |
| 270 | `bonus_right.m4a` | You got it! Extra time! |  |
| 271 | `bonus_right_star.m4a` | You got it! A bonus star! |  |
| 272 | `bonus_wrong.m4a` | Good try! The answer is | + answer, e.g. "the Sun!" |
| 273 | `munch_2p_team.m4a` | Team munch! Munch your own color, and work together! |  |
| 274 | `munch_2p_race.m4a` | Munch race! Munch your own color. Ready, set, go! |  |
| 275 | `munch_not_yours.m4a` | That one is for | + name |
| 276 | `munch_all_done.m4a` | All done! Great munching! |  |
| 277 | `munch_team_win.m4a` | Teamwork! You did it together! |  |
| 278 | `munch_team_time.m4a` | Time's up! Look how much you munched together! |  |
| 279 | `munch_wins_race.m4a` | wins the race! | Said after a name: "Player 1" + "wins the race!" |
| 280 | `munch_both_great.m4a` | Great munching, both of you! |  |
| 281 | `munch_tie.m4a` | It's a tie! You both did great! |  |
| 282 | `hub_how_many.m4a` | One player, or two players? |  |
| 283 | `hub_pick_friend.m4a` | Who is playing with you? |  |
| 284 | `hub_team_or_race.m4a` | Play as a team, or have a race? |  |
| 285 | `hub_one_player.m4a` | One player! |  |
| 286 | `hub_two_players.m4a` | Two players! |  |
| 287 | `hub_team.m4a` | Team! |  |
| 288 | `hub_race.m4a` | Race! |  |
| 289 | `name_guest.m4a` | Guest! |  |

## Mochi Munch: menu, levels & high scores — record first (33)

Short, bright and friendly.

| # | File name | Say this | Note |
|---:|---|---|---|
| 290 | `menu_pick.m4a` | Story, free play, or two players? |  |
| 291 | `menu_story.m4a` | Story! |  |
| 292 | `menu_free.m4a` | Free play! |  |
| 293 | `lvl_level.m4a` | Level | + number, e.g. "Level" + "3" |
| 294 | `lvl_ready.m4a` | Get ready! |  |
| 295 | `story_stop.m4a` | Stop | + number, e.g. "Stop" + "4" |
| 296 | `story_next.m4a` | On to the next stop! |  |
| 297 | `story_area_done.m4a` | You finished this area! Off we go! |  |
| 298 | `story_one_more.m4a` | One more stop here! |  |
| 299 | `story_new_best.m4a` | A new high score! |  |
| 300 | `story_great_score.m4a` | What a great score! |  |
| 301 | `story_locked.m4a` | That stop is still locked. Keep going! |  |
| 302 | `story_pick.m4a` | Pick a stop on the map! |  |
| 303 | `story_little.m4a` | Little Steps! |  |
| 304 | `story_big.m4a` | Big Steps! |  |
| 305 | `story_helper.m4a` | Let's make this one a little easier. |  |
| 306 | `story_try_again.m4a` | Almost! Let's try this stop again. |  |
| 307 | `story_practice.m4a` | Practice round! Your journey is waiting at the star. |  |
| 308 | `story_high_scores.m4a` | High scores! |  |
| 309 | `story_new_journey.m4a` | A brand new journey! Here we go! |  |
| 310 | `hub_new_player.m4a` | Let's make a new player! What's your name? |  |
| 311 | `hub_pick_blob.m4a` | Pick your blob! |  |
| 312 | `hub_pick_color.m4a` | Pick a color! |  |
| 313 | `hub_welcome.m4a` | Welcome to the arcade! |  |
| 314 | `hub_bye.m4a` | Bye bye! See you soon! |  |
| 315 | `ch_title.m4a` | Challenge time! |  |
| 316 | `ch_intro.m4a` | Munch them all before the clock runs out, to meet a new friend! |  |
| 317 | `ch_again.m4a` | Challenge time! Can you beat your best? |  |
| 318 | `ch_fail_time.m4a` | So close! Try the challenge again to meet your new friend. |  |
| 319 | `ch_fail_acc.m4a` | Careful munching wins the challenge. Try again! |  |
| 320 | `ch_won_again.m4a` | You beat the challenge again! Super fast! |  |
| 321 | `unlock_pick.m4a` | You can be your new friend in Dress Up! |  |
| 322 | `hub_locked_blob.m4a` | That friend is waiting on Blob Island. Win the challenge in Story mode! |  |

## Mochi Munch story: Blob Island — later (33)

Story-book voice, warm and excited. The built-in voice already covers these.

| # | File name | Say this | Note |
|---:|---|---|---|
| 323 | `story_title.m4a` | Blob Island! |  |
| 324 | `story_prologue.m4a` | Oh no! A big wind blew the star-snacks all over Blob Island. Help Mochi find them before the Blob Festival tonight! |  |
| 325 | `story_finale.m4a` | You found every star-snack! The Blob Festival can begin. Hooray for you! |  |
| 326 | `area_meadow.m4a` | Counting Meadow! | Area name on the island map |
| 327 | `area_cliffs.m4a` | Compare Cliffs! | Area name on the island map |
| 328 | `area_beach.m4a` | Adding Beach! | Area name on the island map |
| 329 | `area_woods.m4a` | Take-Away Woods! | Area name on the island map |
| 330 | `area_grove.m4a` | Ten Tree Grove! | Area name on the island map |
| 331 | `area_town.m4a` | Teen Town! | Area name on the island map |
| 332 | `area_caves.m4a` | Mystery Caves! | Area name on the island map |
| 333 | `area_bay.m4a` | Big Sum Bay! | Area name on the island map |
| 334 | `area_volcano.m4a` | Volcano Valley! | Area name on the island map |
| 335 | `area_lighthouse.m4a` | Even-Odd Lighthouse! | Area name on the island map |
| 336 | `area_lagoon.m4a` | Letter Lagoon! | Area name on the island map |
| 337 | `beat_meadow.m4a` | Hi, I'm Poppy! The star-snacks landed in my flowers. Let's count and find them! | Said by Poppy when you arrive at Counting Meadow |
| 338 | `beat_cliffs.m4a` | Clem here! Up on the cliffs, big and small numbers are hiding. Which one is bigger? | Said by Clem when you arrive at Compare Cliffs |
| 339 | `beat_beach.m4a` | Splash! I'm Dewdrop. The waves washed snacks onto the sand. Let's add them up! | Said by Dewdrop when you arrive at Adding Beach |
| 340 | `beat_woods.m4a` | Hee hee! I'm Pickle. The squirrels nibbled some snacks. Take away and see what's left! | Said by Pickle when you arrive at Take-Away Woods |
| 341 | `beat_grove.m4a` | I'm Nova. The ten tree only opens for numbers that make ten together! | Said by Nova when you arrive at Ten Tree Grove |
| 342 | `beat_town.m4a` | Welcome to Teen Town! Every number here is ten and some more. | Said by Clem when you arrive at Teen Town |
| 343 | `beat_caves.m4a` | Ooh, spooky caves! A number is missing. Can you find the hidden one? | Said by Dewdrop when you arrive at Mystery Caves |
| 344 | `beat_bay.m4a` | The boats in the bay carry lots of snacks. Time for bigger adding! | Said by Poppy when you arrive at Big Sum Bay |
| 345 | `beat_volcano.m4a` | Hot, hot, hot! Take away big numbers to cool down the sleepy volcano. | Said by Pickle when you arrive at Volcano Valley |
| 346 | `beat_lighthouse.m4a` | The lighthouse blinks even, odd, even, odd. This is the last area! | Said by Nova when you arrive at Even-Odd Lighthouse |
| 347 | `beat_lagoon.m4a` | Splish splash! Welcome to Letter Lagoon. Colors, shapes, letters and words are floating in the water. Let's munch them! | Said by Dewdrop when you arrive at Letter Lagoon |
| 348 | `unlock_clem.m4a` | Clem joined the team! |  |
| 349 | `hi_clem.m4a` | Hey hey! I'm Clem! Ready, set, go! Let's run and munch together! | Said by Clem when they join the team (in their own personality) |
| 350 | `unlock_dewdrop.m4a` | Dewdrop joined the team! |  |
| 351 | `hi_dewdrop.m4a` | Hi! I'm Dewdrop! Ooh, why is the sea so splashy? Let's find out together! | Said by Dewdrop when they join the team (in their own personality) |
| 352 | `unlock_pickle.m4a` | Pickle joined the team! |  |
| 353 | `hi_pickle.m4a` | Hee hee! I'm Pickle! Knock knock! Who's there? Me, your new friend! | Said by Pickle when they join the team (in their own personality) |
| 354 | `unlock_nova.m4a` | Nova joined the team! |  |
| 355 | `hi_nova.m4a` | Hello, I'm Nova. I love the stars, and now I have a new friend. Twinkle twinkle! | Said by Nova when they join the team (in their own personality) |

## Numbers 0–20 — record first (21)

Say each number on its own, clearly and cheerfully (not like a question).

| # | File name | Say this | Note |
|---:|---|---|---|
| 356 | `num_0.m4a` | 0 |  |
| 357 | `num_1.m4a` | 1 |  |
| 358 | `num_2.m4a` | 2 |  |
| 359 | `num_3.m4a` | 3 |  |
| 360 | `num_4.m4a` | 4 |  |
| 361 | `num_5.m4a` | 5 |  |
| 362 | `num_6.m4a` | 6 |  |
| 363 | `num_7.m4a` | 7 |  |
| 364 | `num_8.m4a` | 8 |  |
| 365 | `num_9.m4a` | 9 |  |
| 366 | `num_10.m4a` | 10 |  |
| 367 | `num_11.m4a` | 11 |  |
| 368 | `num_12.m4a` | 12 |  |
| 369 | `num_13.m4a` | 13 |  |
| 370 | `num_14.m4a` | 14 |  |
| 371 | `num_15.m4a` | 15 |  |
| 372 | `num_16.m4a` | 16 |  |
| 373 | `num_17.m4a` | 17 |  |
| 374 | `num_18.m4a` | 18 |  |
| 375 | `num_19.m4a` | 19 |  |
| 376 | `num_20.m4a` | 20 |  |

## Numbers 21–100 (optional, for later) — later (80)

Only needed once games go past 20.

| # | File name | Say this | Note |
|---:|---|---|---|
| 377 | `num_21.m4a` | 21 |  |
| 378 | `num_22.m4a` | 22 |  |
| 379 | `num_23.m4a` | 23 |  |
| 380 | `num_24.m4a` | 24 |  |
| 381 | `num_25.m4a` | 25 |  |
| 382 | `num_26.m4a` | 26 |  |
| 383 | `num_27.m4a` | 27 |  |
| 384 | `num_28.m4a` | 28 |  |
| 385 | `num_29.m4a` | 29 |  |
| 386 | `num_30.m4a` | 30 |  |
| 387 | `num_31.m4a` | 31 |  |
| 388 | `num_32.m4a` | 32 |  |
| 389 | `num_33.m4a` | 33 |  |
| 390 | `num_34.m4a` | 34 |  |
| 391 | `num_35.m4a` | 35 |  |
| 392 | `num_36.m4a` | 36 |  |
| 393 | `num_37.m4a` | 37 |  |
| 394 | `num_38.m4a` | 38 |  |
| 395 | `num_39.m4a` | 39 |  |
| 396 | `num_40.m4a` | 40 |  |
| 397 | `num_41.m4a` | 41 |  |
| 398 | `num_42.m4a` | 42 |  |
| 399 | `num_43.m4a` | 43 |  |
| 400 | `num_44.m4a` | 44 |  |
| 401 | `num_45.m4a` | 45 |  |
| 402 | `num_46.m4a` | 46 |  |
| 403 | `num_47.m4a` | 47 |  |
| 404 | `num_48.m4a` | 48 |  |
| 405 | `num_49.m4a` | 49 |  |
| 406 | `num_50.m4a` | 50 |  |
| 407 | `num_51.m4a` | 51 |  |
| 408 | `num_52.m4a` | 52 |  |
| 409 | `num_53.m4a` | 53 |  |
| 410 | `num_54.m4a` | 54 |  |
| 411 | `num_55.m4a` | 55 |  |
| 412 | `num_56.m4a` | 56 |  |
| 413 | `num_57.m4a` | 57 |  |
| 414 | `num_58.m4a` | 58 |  |
| 415 | `num_59.m4a` | 59 |  |
| 416 | `num_60.m4a` | 60 |  |
| 417 | `num_61.m4a` | 61 |  |
| 418 | `num_62.m4a` | 62 |  |
| 419 | `num_63.m4a` | 63 |  |
| 420 | `num_64.m4a` | 64 |  |
| 421 | `num_65.m4a` | 65 |  |
| 422 | `num_66.m4a` | 66 |  |
| 423 | `num_67.m4a` | 67 |  |
| 424 | `num_68.m4a` | 68 |  |
| 425 | `num_69.m4a` | 69 |  |
| 426 | `num_70.m4a` | 70 |  |
| 427 | `num_71.m4a` | 71 |  |
| 428 | `num_72.m4a` | 72 |  |
| 429 | `num_73.m4a` | 73 |  |
| 430 | `num_74.m4a` | 74 |  |
| 431 | `num_75.m4a` | 75 |  |
| 432 | `num_76.m4a` | 76 |  |
| 433 | `num_77.m4a` | 77 |  |
| 434 | `num_78.m4a` | 78 |  |
| 435 | `num_79.m4a` | 79 |  |
| 436 | `num_80.m4a` | 80 |  |
| 437 | `num_81.m4a` | 81 |  |
| 438 | `num_82.m4a` | 82 |  |
| 439 | `num_83.m4a` | 83 |  |
| 440 | `num_84.m4a` | 84 |  |
| 441 | `num_85.m4a` | 85 |  |
| 442 | `num_86.m4a` | 86 |  |
| 443 | `num_87.m4a` | 87 |  |
| 444 | `num_88.m4a` | 88 |  |
| 445 | `num_89.m4a` | 89 |  |
| 446 | `num_90.m4a` | 90 |  |
| 447 | `num_91.m4a` | 91 |  |
| 448 | `num_92.m4a` | 92 |  |
| 449 | `num_93.m4a` | 93 |  |
| 450 | `num_94.m4a` | 94 |  |
| 451 | `num_95.m4a` | 95 |  |
| 452 | `num_96.m4a` | 96 |  |
| 453 | `num_97.m4a` | 97 |  |
| 454 | `num_98.m4a` | 98 |  |
| 455 | `num_99.m4a` | 99 |  |
| 456 | `num_100.m4a` | 100 |  |

## Sight Words game (coming soon) — later (8)

| # | File name | Say this | Note |
|---:|---|---|---|
| 457 | `sw_title.m4a` | Sight Words! |  |
| 458 | `sw_find.m4a` | Find the word | + word |
| 459 | `sw_read.m4a` | Can you read this word? |  |
| 460 | `sw_listen.m4a` | Listen! |  |
| 461 | `sw_that_says.m4a` | That word says | + word |
| 462 | `sw_new_words.m4a` | Here are some new words! |  |
| 463 | `sw_great_reading.m4a` | Great reading! |  |
| 464 | `sw_sound_it.m4a` | Let's say it together. |  |

## Sight words: Dolch Pre-Primer (40) — later (40)

Say each word once, clearly, the way you would read it to a little one.

| # | File name | Say this | Note |
|---:|---|---|---|
| 465 | `word_a.m4a` | a |  |
| 466 | `word_and.m4a` | and |  |
| 467 | `word_away.m4a` | away |  |
| 468 | `word_big.m4a` | big |  |
| 469 | `word_blue.m4a` | blue |  |
| 470 | `word_can.m4a` | can |  |
| 471 | `word_come.m4a` | come |  |
| 472 | `word_down.m4a` | down |  |
| 473 | `word_find.m4a` | find |  |
| 474 | `word_for.m4a` | for |  |
| 475 | `word_funny.m4a` | funny |  |
| 476 | `word_go.m4a` | go |  |
| 477 | `word_help.m4a` | help |  |
| 478 | `word_here.m4a` | here |  |
| 479 | `word_i.m4a` | I |  |
| 480 | `word_in.m4a` | in |  |
| 481 | `word_is.m4a` | is |  |
| 482 | `word_it.m4a` | it |  |
| 483 | `word_jump.m4a` | jump |  |
| 484 | `word_little.m4a` | little |  |
| 485 | `word_look.m4a` | look |  |
| 486 | `word_make.m4a` | make |  |
| 487 | `word_me.m4a` | me |  |
| 488 | `word_my.m4a` | my |  |
| 489 | `word_not.m4a` | not |  |
| 490 | `word_one.m4a` | one |  |
| 491 | `word_play.m4a` | play |  |
| 492 | `word_red.m4a` | red |  |
| 493 | `word_run.m4a` | run |  |
| 494 | `word_said.m4a` | said |  |
| 495 | `word_see.m4a` | see |  |
| 496 | `word_the.m4a` | the |  |
| 497 | `word_three.m4a` | three |  |
| 498 | `word_to.m4a` | to |  |
| 499 | `word_two.m4a` | two |  |
| 500 | `word_up.m4a` | up |  |
| 501 | `word_we.m4a` | we |  |
| 502 | `word_where.m4a` | where |  |
| 503 | `word_yellow.m4a` | yellow |  |
| 504 | `word_you.m4a` | you |  |

## Sight words: Dolch Primer (52) — later (52)

| # | File name | Say this | Note |
|---:|---|---|---|
| 505 | `word_all.m4a` | all |  |
| 506 | `word_am.m4a` | am |  |
| 507 | `word_are.m4a` | are |  |
| 508 | `word_at.m4a` | at |  |
| 509 | `word_ate.m4a` | ate |  |
| 510 | `word_be.m4a` | be |  |
| 511 | `word_black.m4a` | black |  |
| 512 | `word_brown.m4a` | brown |  |
| 513 | `word_but.m4a` | but |  |
| 514 | `word_came.m4a` | came |  |
| 515 | `word_did.m4a` | did |  |
| 516 | `word_do.m4a` | do |  |
| 517 | `word_eat.m4a` | eat |  |
| 518 | `word_four.m4a` | four |  |
| 519 | `word_get.m4a` | get |  |
| 520 | `word_good.m4a` | good |  |
| 521 | `word_have.m4a` | have |  |
| 522 | `word_he.m4a` | he |  |
| 523 | `word_into.m4a` | into |  |
| 524 | `word_like.m4a` | like |  |
| 525 | `word_must.m4a` | must |  |
| 526 | `word_new.m4a` | new |  |
| 527 | `word_no.m4a` | no |  |
| 528 | `word_now.m4a` | now |  |
| 529 | `word_on.m4a` | on |  |
| 530 | `word_our.m4a` | our |  |
| 531 | `word_out.m4a` | out |  |
| 532 | `word_please.m4a` | please |  |
| 533 | `word_pretty.m4a` | pretty |  |
| 534 | `word_ran.m4a` | ran |  |
| 535 | `word_ride.m4a` | ride |  |
| 536 | `word_saw.m4a` | saw |  |
| 537 | `word_say.m4a` | say |  |
| 538 | `word_she.m4a` | she |  |
| 539 | `word_so.m4a` | so |  |
| 540 | `word_soon.m4a` | soon |  |
| 541 | `word_that.m4a` | that |  |
| 542 | `word_there.m4a` | there |  |
| 543 | `word_they.m4a` | they |  |
| 544 | `word_this.m4a` | this |  |
| 545 | `word_too.m4a` | too |  |
| 546 | `word_under.m4a` | under |  |
| 547 | `word_want.m4a` | want |  |
| 548 | `word_was.m4a` | was |  |
| 549 | `word_well.m4a` | well |  |
| 550 | `word_went.m4a` | went |  |
| 551 | `word_what.m4a` | what |  |
| 552 | `word_white.m4a` | white |  |
| 553 | `word_who.m4a` | who |  |
| 554 | `word_will.m4a` | will |  |
| 555 | `word_with.m4a` | with |  |
| 556 | `word_yes.m4a` | yes |  |

## Blob Baseball — record first (45)

The umpire lines ("Strike!", "You're out!", "Home run!") can be big and loud, like a real umpire. Lines with "+ number" or "+ name" are followed by one.

| # | File name | Say this | Note |
|---:|---|---|---|
| 557 | `bb_title.m4a` | Blob Baseball! |  |
| 558 | `bb_play_ball.m4a` | Play ball! |  |
| 559 | `bb_batter_up.m4a` | Batter up! | Also followed by a name: "Batter up," + "Player 1!" |
| 560 | `bb_swing.m4a` | Swing! |  |
| 561 | `bb_strike.m4a` | Strike! |  |
| 562 | `bb_strike_two.m4a` | Strike two! |  |
| 563 | `bb_strike_three.m4a` | Strike three! You're out! |  |
| 564 | `bb_ball.m4a` | Ball! |  |
| 565 | `bb_foul.m4a` | Foul ball! |  |
| 566 | `bb_hit.m4a` | It's a hit! |  |
| 567 | `bb_single.m4a` | Single! |  |
| 568 | `bb_double.m4a` | Double! |  |
| 569 | `bb_triple.m4a` | Triple! |  |
| 570 | `bb_home_run.m4a` | Home run! |  |
| 571 | `bb_grand_slam.m4a` | A grand slam! |  |
| 572 | `bb_run_scores.m4a` | A run scores! |  |
| 573 | `bb_runs_score.m4a` | runs score! | After a number: "Two" + "runs score!" |
| 574 | `bb_safe.m4a` | Safe! |  |
| 575 | `bb_out.m4a` | You're out! |  |
| 576 | `bb_caught.m4a` | Caught it! That's an out! |  |
| 577 | `bb_three_outs.m4a` | Three outs! Switch sides! |  |
| 578 | `bb_three_outs_next.m4a` | Three outs! On to the next inning! |  |
| 579 | `bb_inning_over.m4a` | That's the inning! Great batting! |  |
| 580 | `bb_inning.m4a` | Inning | + number, e.g. "Inning" + "2" |
| 581 | `bb_last_inning.m4a` | Last inning! |  |
| 582 | `bb_next_inning.m4a` | Next inning! |  |
| 583 | `bb_great_swing.m4a` | Great swing! |  |
| 584 | `bb_swing_tip.m4a` | Pick your swing! A single is easy. A home run is a challenge. Get it right, and you hit it! |  |
| 585 | `bb_pick_swing.m4a` | Pick your swing! |  |
| 586 | `bb_sw_single.m4a` | A single! Nice and easy. |  |
| 587 | `bb_sw_double.m4a` | A double! Just right. |  |
| 588 | `bb_sw_triple.m4a` | A triple! Here comes a tricky one. |  |
| 589 | `bb_sw_homer.m4a` | Going for a home run! Here comes a challenge! |  |
| 590 | `bb_big_whiff.m4a` | Whoosh! What a big swing! That is just one strike. |  |
| 591 | `bb_nudge.m4a` | The crowd wants a big swing! Want to try a double or a triple? |  |
| 592 | `bb_time_strike.m4a` | Out of time! That's a strike. |  |
| 593 | `bb_you_scored.m4a` | You scored | + number + "runs!" |
| 594 | `bb_runs.m4a` | runs! |  |
| 595 | `bb_run.m4a` | run! |  |
| 596 | `bb_wins_game.m4a` | wins the game! | After a name: "Player 1" + "wins the game!" |
| 597 | `bb_tie_game.m4a` | It's a tie game! What a game! |  |
| 598 | `bb_you_win.m4a` | You win the game! |  |
| 599 | `bb_good_game.m4a` | Good game! |  |
| 600 | `bb_new_high.m4a` | A new high score! |  |
| 601 | `bb_high_scores.m4a` | High scores! |  |

## Blob Baseball questions (sentence parts) — record first (9)

Question starters, joined with numbers: "What's" + "5" + "plus" + "7" → "What's five plus seven?". Say them like the start of a question.

| # | File name | Say this | Note |
|---:|---|---|---|
| 602 | `bbq_whats.m4a` | What's |  |
| 603 | `bbq_how_many_dots.m4a` | How many dots? |  |
| 604 | `bbq_find.m4a` | Find the number | + number |
| 605 | `bbq_biggest.m4a` | Which number is the biggest? |  |
| 606 | `bbq_smallest.m4a` | Which number is the smallest? |  |
| 607 | `bbq_even.m4a` | Which number is even? |  |
| 608 | `bbq_odd.m4a` | Which number is odd? |  |
| 609 | `bbq_what_makes_ten.m4a` | what makes ten? | After a number: "6 plus" + "what makes ten?" |
| 610 | `bbq_what_makes.m4a` | what makes | In the middle: "3 plus" + "what makes" + "7?" |

## Penalty Kicks (coming soon) — later (15)

| # | File name | Say this | Note |
|---:|---|---|---|
| 611 | `pk_title.m4a` | Penalty Kicks! |  |
| 612 | `pk_your_kick.m4a` | Your turn to kick! |  |
| 613 | `pk_pick_spot.m4a` | Pick a spot to aim! |  |
| 614 | `pk_goal.m4a` | Goal! |  |
| 615 | `pk_blocked.m4a` | The goalie blocked it! |  |
| 616 | `pk_save.m4a` | What a save! |  |
| 617 | `pk_missed.m4a` | Just missed! |  |
| 618 | `pk_off_post.m4a` | Off the post! |  |
| 619 | `pk_your_goalie.m4a` | Now you're the goalie! |  |
| 620 | `pk_dive.m4a` | Dive! |  |
| 621 | `pk_great_kick.m4a` | Great kick! |  |
| 622 | `pk_score_is.m4a` | The score is | + number + "to" + number |
| 623 | `w_to.m4a` | to | as in "3 to 2" |
| 624 | `pk_you_win.m4a` | You won the shootout! |  |
| 625 | `pk_tie.m4a` | It's a tie! One more kick! |  |

## Blob Room — record first (36)

Cozy and warm, like showing a friend around your room.

| # | File name | Say this | Note |
|---:|---|---|---|
| 626 | `rm_title.m4a` | My Room! |  |
| 627 | `rm_welcome.m4a` | Welcome to your very own room! |  |
| 628 | `rm_welcome_back.m4a` | Welcome home! |  |
| 629 | `rm_shop.m4a` | Let's go shopping! What would you like? |  |
| 630 | `rm_decorate.m4a` | Let's decorate! Pick a thing, then pick a spot. |  |
| 631 | `rm_pick_spot.m4a` | Pick a spot! |  |
| 632 | `rm_placed.m4a` | There! It looks great! |  |
| 633 | `rm_bought.m4a` | It's yours! Hooray! |  |
| 634 | `rm_need_more.m4a` | You need a few more star bits. Play a game to earn some! |  |
| 635 | `rm_costs.m4a` | It costs | + number + "star bits." |
| 636 | `rm_star_bits.m4a` | star bits. |  |
| 637 | `rm_put_away.m4a` | Put away! |  |
| 638 | `rm_undo.m4a` | Undo! |  |
| 639 | `rm_flip.m4a` | Flip! |  |
| 640 | `rm_spot_taken.m4a` | That spot is taken. Try another one! |  |
| 641 | `rm_new_wall.m4a` | Ooh, new wallpaper! |  |
| 642 | `rm_new_floor.m4a` | Ooh, a new floor! |  |
| 643 | `rm_trophies.m4a` | Here is your trophy shelf! |  |
| 644 | `rm_friends.m4a` | Here are your blob friends! |  |
| 645 | `rm_locked_friend.m4a` | This friend is still a secret! Win a story challenge to meet them. |  |
| 646 | `rm_locked_item.m4a` | This one is a special prize! Keep playing to win it. |  |
| 647 | `rm_prize_won.m4a` | You won a special prize for your room! |  |
| 648 | `rm_friend_up.m4a` | You're even better friends now! |  |
| 649 | `rm_shh.m4a` | Shh... they're napping. |  |
| 650 | `rm_bye.m4a` | Bye bye! See you soon! |  |
| 651 | `rm_owned.m4a` | You have this one! |  |
| 652 | `rm_nothing.m4a` | Your things box is empty. Visit the shop! |  |
| 653 | `fr_unlock_likes.m4a` | Now you know what I like! |  |
| 654 | `fr_unlock_face.m4a` | I learned a new face! Look! |  |
| 655 | `fr_unlock_more.m4a` | Now you know all about me! |  |
| 656 | `fr_unlock_gift.m4a` | I made you a present for your room! |  |
| 657 | `fr_lvl1.m4a` | New friend! |  |
| 658 | `fr_lvl2.m4a` | Pal! |  |
| 659 | `fr_lvl3.m4a` | Good friend! |  |
| 660 | `fr_lvl4.m4a` | Best friend! |  |
| 661 | `fr_lvl5.m4a` | Forever friend! |  |

## Blob friends: bios and room chatter — record first (48)

Each blob talks about themselves. Give each one their own personality (sweet, dreamy, sporty, curious, silly, starry).

| # | File name | Say this | Note |
|---:|---|---|---|
| 662 | `fr_mochi_hi.m4a` | This is Mochi! Mochi is sweet, cheerful, and always a little bit hungry. |  |
| 663 | `fr_mochi_likes.m4a` | Mochi likes snacks, sunshine, and giving big squishy hugs. |  |
| 664 | `fr_mochi_dislikes.m4a` | Mochi doesn't like rainy days with no snacks. |  |
| 665 | `fr_mochi_food.m4a` | Mochi's favorite food is a warm, sticky rice bun. |  |
| 666 | `fr_mochi_tap1.m4a` | Hee hee, that tickles! | When tapped in the room |
| 667 | `fr_mochi_tap2.m4a` | Is it snack time yet? | When tapped in the room |
| 668 | `fr_mochi_tap3.m4a` | You're my best buddy! | When tapped in the room |
| 669 | `fr_mochi_nap.m4a` | Mmm... dreaming of dumplings... | Sleepy, while napping |
| 670 | `fr_poppy_hi.m4a` | This is Poppy! Poppy is dreamy and cozy, and loves slow, happy hums. |  |
| 671 | `fr_poppy_likes.m4a` | Poppy likes naps, soft pillows, and humming sleepy songs. |  |
| 672 | `fr_poppy_dislikes.m4a` | Poppy doesn't like loud, beeping alarm clocks. |  |
| 673 | `fr_poppy_food.m4a` | Poppy's favorite food is warm milk with honey. |  |
| 674 | `fr_poppy_tap1.m4a` | Mmm... hello, sleepyhead! | When tapped in the room |
| 675 | `fr_poppy_tap2.m4a` | Let's snuggle on the beanbag. | When tapped in the room |
| 676 | `fr_poppy_tap3.m4a` | Hum, hum, hum... la la la. | When tapped in the room |
| 677 | `fr_poppy_nap.m4a` | Zzz... five more minutes... | Sleepy, while napping |
| 678 | `fr_clem_hi.m4a` | This is Clem! Clem is sporty and brave, and loves to run, kick, and cheer. |  |
| 679 | `fr_clem_likes.m4a` | Clem likes running races, kicking balls, and cheering really loud! |  |
| 680 | `fr_clem_dislikes.m4a` | Clem doesn't like sitting still for too long. |  |
| 681 | `fr_clem_food.m4a` | Clem's favorite food is orange slices after a big game. |  |
| 682 | `fr_clem_tap1.m4a` | Ready, set, go! | When tapped in the room |
| 683 | `fr_clem_tap2.m4a` | Wanna race me? Let's go! | When tapped in the room |
| 684 | `fr_clem_tap3.m4a` | High five! Yeah! | When tapped in the room |
| 685 | `fr_clem_nap.m4a` | Zzz... scoring a goal... zzz... | Sleepy, while napping |
| 686 | `fr_dewdrop_hi.m4a` | This is Dewdrop! Dewdrop is curious about everything, and asks why a lot. |  |
| 687 | `fr_dewdrop_likes.m4a` | Dewdrop likes rain puddles, bubbles, and finding things out. |  |
| 688 | `fr_dewdrop_dislikes.m4a` | Dewdrop doesn't like it when nobody answers her questions. |  |
| 689 | `fr_dewdrop_food.m4a` | Dewdrop's favorite food is cold, juicy watermelon. |  |
| 690 | `fr_dewdrop_tap1.m4a` | Why is the sky blue? Do you know? | When tapped in the room |
| 691 | `fr_dewdrop_tap2.m4a` | Ooh, bubbles! Pop, pop! | When tapped in the room |
| 692 | `fr_dewdrop_tap3.m4a` | Hi hi! Let's explore! | When tapped in the room |
| 693 | `fr_dewdrop_nap.m4a` | Zzz... splish, splash... | Sleepy, while napping |
| 694 | `fr_pickle_hi.m4a` | This is Pickle! Pickle is a silly joker, and is always up to something fun. |  |
| 695 | `fr_pickle_likes.m4a` | Pickle likes jokes, funny faces, and playing hide and seek. |  |
| 696 | `fr_pickle_dislikes.m4a` | Pickle doesn't like being bored. Boring is so boring! |  |
| 697 | `fr_pickle_food.m4a` | Pickle's favorite food is crunchy pickles, of course! |  |
| 698 | `fr_pickle_tap1.m4a` | Knock knock! Who's there? Pickle! Hee hee! | When tapped in the room |
| 699 | `fr_pickle_tap2.m4a` | Boo! Did I surprise you? | When tapped in the room |
| 700 | `fr_pickle_tap3.m4a` | Let's make silly faces! | When tapped in the room |
| 701 | `fr_pickle_nap.m4a` | Zzz... hee hee... zzz... | Sleepy, while napping |
| 702 | `fr_nova_hi.m4a` | This is Nova! Nova is a dreamer and a stargazer, and hums little songs. |  |
| 703 | `fr_nova_likes.m4a` | Nova likes the stars, the moon, and making wishes. |  |
| 704 | `fr_nova_dislikes.m4a` | Nova doesn't like cloudy nights, because the stars hide. |  |
| 705 | `fr_nova_food.m4a` | Nova's favorite food is star-shaped cookies. |  |
| 706 | `fr_nova_tap1.m4a` | Twinkle, twinkle! Hello, friend. | When tapped in the room |
| 707 | `fr_nova_tap2.m4a` | Did you make a wish today? | When tapped in the room |
| 708 | `fr_nova_tap3.m4a` | Look up! Can you see a star? | When tapped in the room |
| 709 | `fr_nova_nap.m4a` | Zzz... floating on the moon... | Sleepy, while napping |

## Blob Room things (64) — later (64)

Item names, said brightly when a kid taps one in the shop.

| # | File name | Say this | Note |
|---:|---|---|---|
| 710 | `it_bed_simple.m4a` | Cozy bed! |  |
| 711 | `it_bed_cloud.m4a` | Cloud bed! |  |
| 712 | `it_sofa.m4a` | Comfy sofa! |  |
| 713 | `it_beanbag_pink.m4a` | Pink beanbag! |  |
| 714 | `it_beanbag_blue.m4a` | Blue beanbag! |  |
| 715 | `it_chair.m4a` | Little chair! |  |
| 716 | `it_tent.m4a` | Play tent! |  |
| 717 | `it_table_round.m4a` | Round table! |  |
| 718 | `it_desk.m4a` | Desk! |  |
| 719 | `it_bookshelf.m4a` | Bookshelf! |  |
| 720 | `it_dresser.m4a` | Dresser! |  |
| 721 | `it_toyshelf.m4a` | Toy shelf! |  |
| 722 | `it_snackcart.m4a` | Snack cart! |  |
| 723 | `it_fishtank.m4a` | Fish tank! |  |
| 724 | `it_globe.m4a` | Globe! |  |
| 725 | `it_piano.m4a` | Toy piano! |  |
| 726 | `it_plant_tall.m4a` | Leafy plant! |  |
| 727 | `it_plant_cactus.m4a` | Cactus! |  |
| 728 | `it_plant_flower.m4a` | Flower pot! |  |
| 729 | `it_plant_tree.m4a` | Little tree! |  |
| 730 | `it_lamp_floor.m4a` | Floor lamp! |  |
| 731 | `it_lamp_star.m4a` | Star lamp! |  |
| 732 | `it_lamp_mushroom.m4a` | Mushroom lamp! |  |
| 733 | `it_toybox.m4a` | Toy box! |  |
| 734 | `it_blocks.m4a` | Block tower! |  |
| 735 | `it_train.m4a` | Toy train! |  |
| 736 | `it_drum.m4a` | Drum! |  |
| 737 | `it_rocket.m4a` | Toy rocket! |  |
| 738 | `it_plush_bunny.m4a` | Bunny plush! |  |
| 739 | `it_easel.m4a` | Paint easel! |  |
| 740 | `it_telescope.m4a` | Telescope! |  |
| 741 | `it_soccergoal.m4a` | Mini goal! |  |
| 742 | `it_soccerball.m4a` | Soccer ball! |  |
| 743 | `it_batrack.m4a` | Bat and glove rack! |  |
| 744 | `it_hoop.m4a` | Mini hoop! |  |
| 745 | `it_rug_round.m4a` | Round rug! |  |
| 746 | `it_rug_rainbow.m4a` | Rainbow rug! |  |
| 747 | `it_rug_star.m4a` | Star rug! |  |
| 748 | `it_rug_diamond.m4a` | Ballpark rug! |  |
| 749 | `it_poster_space.m4a` | Space poster! |  |
| 750 | `it_poster_mochi.m4a` | Mochi poster! |  |
| 751 | `it_poster_baseball.m4a` | Baseball poster! |  |
| 752 | `it_frame_sun.m4a` | Sunny painting! |  |
| 753 | `it_clock.m4a` | Clock! |  |
| 754 | `it_shelf_wall.m4a` | Wall shelf! |  |
| 755 | `it_fairylights.m4a` | Fairy lights! |  |
| 756 | `it_pennant.m4a` | Pennant! |  |
| 757 | `it_mirror.m4a` | Mirror! |  |
| 758 | `it_wp_cream.m4a` | Cream wallpaper! |  |
| 759 | `it_wp_stripes.m4a` | Candy stripes! |  |
| 760 | `it_wp_dots.m4a` | Polka dots! |  |
| 761 | `it_wp_stars.m4a` | Starry wallpaper! |  |
| 762 | `it_wp_clouds.m4a` | Cloud wallpaper! |  |
| 763 | `it_wp_leaves.m4a` | Leafy wallpaper! |  |
| 764 | `it_fl_wood.m4a` | Wood floor! |  |
| 765 | `it_fl_checker.m4a` | Checker floor! |  |
| 766 | `it_fl_carpet.m4a` | Soft carpet! |  |
| 767 | `it_fl_tiles.m4a` | Mint tiles! |  |
| 768 | `it_trophy_story.m4a` | Story trophy! |  |
| 769 | `it_bat_gold.m4a` | Golden bat! |  |
| 770 | `it_plush_grumbly.m4a` | Grumbly plush! |  |
| 771 | `it_rug_sticker.m4a` | Sticker rug! |  |
| 772 | `it_star_big.m4a` | Giant star! |  |
| 773 | `it_hr_ball.m4a` | Home run ball! |  |

## Bonus questions (127) — later (127)

Read each question like a friendly quiz host. The built-in voice already covers these, so record them whenever you like.

| # | File name | Say this | Note |
|---:|---|---|---|
| 774 | `q_notplanet.m4a` | Which one is NOT a planet? | Space |
| 775 | `q_livein.m4a` | Which planet do we live on? | Space |
| 776 | `q_daylight.m4a` | What gives us light and warmth in the daytime? | Space |
| 777 | `q_rings.m4a` | Which planet has big, beautiful rings? | Space |
| 778 | `q_redplanet.m4a` | Which planet is called the red planet? | Space |
| 779 | `q_rocket.m4a` | What do astronauts ride into space? | Space |
| 780 | `q_moonorbit.m4a` | What does the Moon go around and around? | Space |
| 781 | `q_nightsky.m4a` | What do we see twinkling in the night sky? | Space |
| 782 | `q_spacesuit.m4a` | What does an astronaut wear in space? | Space |
| 783 | `q_biggest.m4a` | Which one is the biggest? | Space |
| 784 | `q_sunstar.m4a` | The Sun is a big, hot... | Space |
| 785 | `q_moo.m4a` | Which animal says moo? | Animals |
| 786 | `q_quack.m4a` | Which animal says quack? | Animals |
| 787 | `q_oink.m4a` | Which animal says oink? | Animals |
| 788 | `q_roar.m4a` | Which animal has a big, loud roar? | Animals |
| 789 | `q_neck.m4a` | Which animal has a very long neck? | Animals |
| 790 | `q_trunk.m4a` | Which animal has a long trunk? | Animals |
| 791 | `q_stripes.m4a` | Which animal has black and white stripes? | Animals |
| 792 | `q_fly.m4a` | Which animal has wings and can fly? | Animals |
| 793 | `q_fins.m4a` | Which animal swims with fins? | Animals |
| 794 | `q_puppy.m4a` | A puppy grows up to be a... | Animals |
| 795 | `q_kitten.m4a` | A kitten grows up to be a... | Animals |
| 796 | `q_tadpole.m4a` | A tadpole grows up to be a... | Animals |
| 797 | `q_caterpillar.m4a` | A caterpillar turns into a... | Animals |
| 798 | `q_pouch.m4a` | Which animal hops and carries its baby in a pouch? | Animals |
| 799 | `q_wool.m4a` | Which animal gives us soft wool? | Animals |
| 800 | `q_eggs.m4a` | Which animal lays the eggs we eat for breakfast? | Animals |
| 801 | `q_eightlegs.m4a` | Which animal has eight legs? | Animals |
| 802 | `q_shell.m4a` | Which animal carries a hard shell on its back? | Animals |
| 803 | `q_honey.m4a` | Which animal makes honey? | Animals |
| 804 | `q_whale.m4a` | Which animal is the biggest? | Animals |
| 805 | `q_penguin.m4a` | Which bird cannot fly, but is a great swimmer? | Animals |
| 806 | `q_hoot.m4a` | Which bird says hoo hoo at night? | Animals |
| 807 | `q_milkfrom.m4a` | Which animal gives us milk to drink? | Animals |
| 808 | `q_carrots.m4a` | Which animal loves to munch carrots and has long ears? | Animals |
| 809 | `q_bark.m4a` | Which animal says woof? | Animals |
| 810 | `q_sky.m4a` | What color is the sky on a sunny day? | Colors & shapes |
| 811 | `q_grass.m4a` | What color is grass? | Colors & shapes |
| 812 | `q_banana.m4a` | What color is a ripe banana? | Colors & shapes |
| 813 | `q_snowcolor.m4a` | What color is snow? | Colors & shapes |
| 814 | `q_stopsign.m4a` | What color is a stop sign? | Colors & shapes |
| 815 | `q_redyellow.m4a` | Red and yellow paint mixed together make... | Colors & shapes |
| 816 | `q_blueyellow.m4a` | Blue and yellow paint mixed together make... | Colors & shapes |
| 817 | `q_redblue.m4a` | Red and blue paint mixed together make... | Colors & shapes |
| 818 | `q_triangle.m4a` | Which shape has three sides? | Colors & shapes |
| 819 | `q_circle.m4a` | Which shape is round, like a ball? | Colors & shapes |
| 820 | `q_squaresides.m4a` | How many sides does a square have? | Colors & shapes |
| 821 | `q_starpoints.m4a` | Which shape has five points? | Colors & shapes |
| 822 | `q_heartshape.m4a` | Which one is a heart? | Colors & shapes |
| 823 | `q_leaves.m4a` | In which season do lots of leaves fall off the trees? | Seasons & weather |
| 824 | `q_snowseason.m4a` | In which season do we often see snow? | Seasons & weather |
| 825 | `q_bloom.m4a` | In which season do many flowers start to bloom? | Seasons & weather |
| 826 | `q_hottest.m4a` | Which season is the hottest? | Seasons & weather |
| 827 | `q_umbrella.m4a` | What do you use to stay dry in the rain? | Seasons & weather |
| 828 | `q_rainbow.m4a` | What colorful thing can you see when the sun shines while it rains? | Seasons & weather |
| 829 | `q_mittens.m4a` | What keeps your hands warm when it is cold? | Seasons & weather |
| 830 | `q_lightning.m4a` | What flashes bright in the sky during a storm? | Seasons & weather |
| 831 | `q_snowice.m4a` | Snowflakes are made of tiny bits of... | Seasons & weather |
| 832 | `q_snowman.m4a` | What can you build with snow? | Seasons & weather |
| 833 | `q_see.m4a` | What do you use to see? | My body |
| 834 | `q_hear.m4a` | What do you use to hear? | My body |
| 835 | `q_smell.m4a` | What do you use to smell a flower? | My body |
| 836 | `q_fingers.m4a` | How many fingers are on one hand? | My body |
| 837 | `q_chew.m4a` | What do you use to chew your food? | My body |
| 838 | `q_heartbeat.m4a` | What goes thump-thump inside your chest? | My body |
| 839 | `q_think.m4a` | What part of your body helps you think? | My body |
| 840 | `q_wash.m4a` | What should you do before you eat? | My body |
| 841 | `q_legs.m4a` | How many legs do you have? | My body |
| 842 | `q_fruit.m4a` | Which one is a fruit? | Food |
| 843 | `q_veggie.m4a` | Which one is a vegetable? | Food |
| 844 | `q_frozen.m4a` | Which treat is cold and frozen? | Food |
| 845 | `q_tree.m4a` | Which one grows on a tree? | Food |
| 846 | `q_cheese.m4a` | Which food is made from milk? | Food |
| 847 | `q_yellowfruit.m4a` | Which fruit is long and yellow? | Food |
| 848 | `q_strawberry.m4a` | Which red fruit has tiny seeds on the outside? | Food |
| 849 | `q_popcorn.m4a` | Popcorn is made from... | Food |
| 850 | `q_bees.m4a` | Bees make a sweet, sticky food called... | Food |
| 851 | `q_orangefruit.m4a` | Which fruit is orange, round and juicy? | Food |
| 852 | `q_hot.m4a` | What is the opposite of hot? | Opposites |
| 853 | `q_big.m4a` | What is the opposite of big? | Opposites |
| 854 | `q_up.m4a` | What is the opposite of up? | Opposites |
| 855 | `q_day.m4a` | What is the opposite of day? | Opposites |
| 856 | `q_happy.m4a` | What is the opposite of happy? | Opposites |
| 857 | `q_fast.m4a` | What is the opposite of fast? | Opposites |
| 858 | `q_open.m4a` | What is the opposite of open? | Opposites |
| 859 | `q_wet.m4a` | What is the opposite of wet? | Opposites |
| 860 | `q_loud.m4a` | What is the opposite of loud? | Opposites |
| 861 | `q_notfruit.m4a` | Which one is NOT a fruit? | Odd one out |
| 862 | `q_notanimal.m4a` | Which one is NOT an animal? | Odd one out |
| 863 | `q_notwear.m4a` | Which one do you NOT wear on your feet? | Odd one out |
| 864 | `q_cantfly.m4a` | Which one can NOT fly? | Odd one out |
| 865 | `q_notalive.m4a` | Which one is NOT alive? | Odd one out |
| 866 | `q_noteat.m4a` | Which one can you NOT eat? | Odd one out |
| 867 | `q_notwater.m4a` | Which one does NOT live in the water? | Odd one out |
| 868 | `q_nowheels.m4a` | Which one does NOT have wheels? | Odd one out |
| 869 | `q_notmusic.m4a` | Which one is NOT a musical instrument? | Odd one out |
| 870 | `q_r_cat.m4a` | Which one rhymes with cat? | Rhymes |
| 871 | `q_r_bee.m4a` | Which one rhymes with bee? | Rhymes |
| 872 | `q_r_car.m4a` | Which one rhymes with car? | Rhymes |
| 873 | `q_r_frog.m4a` | Which one rhymes with frog? | Rhymes |
| 874 | `q_r_cake.m4a` | Which one rhymes with cake? | Rhymes |
| 875 | `q_r_goat.m4a` | Which one rhymes with goat? | Rhymes |
| 876 | `q_r_bear.m4a` | Which one rhymes with bear? | Rhymes |
| 877 | `q_r_mouse.m4a` | Which one rhymes with mouse? | Rhymes |
| 878 | `q_r_moon.m4a` | Which one rhymes with moon? | Rhymes |
| 879 | `q_r_king.m4a` | Which one rhymes with king? | Rhymes |
| 880 | `q_r_fish.m4a` | Which one rhymes with fish? | Rhymes |
| 881 | `q_plants.m4a` | What do plants need to grow? | Simple science |
| 882 | `q_melt.m4a` | What happens to ice when it gets warm? | Simple science |
| 883 | `q_magnet.m4a` | Which one sticks to a magnet? | Simple science |
| 884 | `q_float.m4a` | Which one floats on water? | Simple science |
| 885 | `q_rainfall.m4a` | What falls from rain clouds? | Simple science |
| 886 | `q_seed.m4a` | A seed can grow into a... | Simple science |
| 887 | `q_fire.m4a` | Which one is very hot? | Simple science |
| 888 | `q_magnify.m4a` | Which tool helps you see tiny things up close? | Simple science |
| 889 | `q_clock.m4a` | What do we use to tell the time? | Simple science |
| 890 | `q_breathe.m4a` | What do we breathe in all day and all night? | Simple science |
| 891 | `q_ocean.m4a` | What do we call a giant, salty water with big waves? | Maps & places |
| 892 | `q_map.m4a` | What shows you where places are? | Maps & places |
| 893 | `q_compass.m4a` | Which tool always points north? | Maps & places |
| 894 | `q_mountain.m4a` | What is very, very tall land with a pointy top? | Maps & places |
| 895 | `q_beach.m4a` | Where can you find lots of sand next to the water? | Maps & places |
| 896 | `q_forest.m4a` | What place has lots and lots of trees? | Maps & places |
| 897 | `q_desert.m4a` | Where is it very hot and dry, with lots of sand? | Maps & places |
| 898 | `q_earthshape.m4a` | The Earth is round, like a... | Maps & places |
| 899 | `q_city.m4a` | What do we call a big place with lots of buildings and streets? | Maps & places |
| 900 | `q_penguinhome.m4a` | Many penguins live where it is very... | Maps & places |

## Bonus question answers (232) — later (232)

Say each answer on its own, brightly. They are read out as choices, and after "The answer is".

| # | File name | Say this | Note |
|---:|---|---|---|
| 901 | `c_the_sun.m4a` | the Sun |  |
| 902 | `c_earth.m4a` | Earth |  |
| 903 | `c_saturn.m4a` | Saturn |  |
| 904 | `c_mars.m4a` | Mars |  |
| 905 | `c_the_moon.m4a` | the Moon |  |
| 906 | `c_a_cloud.m4a` | a cloud |  |
| 907 | `c_a_rocket.m4a` | a rocket |  |
| 908 | `c_a_bus.m4a` | a bus |  |
| 909 | `c_a_sailboat.m4a` | a sailboat |  |
| 910 | `c_stars.m4a` | stars |  |
| 911 | `c_a_rainbow.m4a` | a rainbow |  |
| 912 | `c_butterflies.m4a` | butterflies |  |
| 913 | `c_a_space_suit.m4a` | a space suit |  |
| 914 | `c_a_swimsuit.m4a` | a swimsuit |  |
| 915 | `c_a_raincoat.m4a` | a raincoat |  |
| 916 | `c_star.m4a` | star |  |
| 917 | `c_moon.m4a` | moon |  |
| 918 | `c_cloud.m4a` | cloud |  |
| 919 | `c_a_cow.m4a` | a cow |  |
| 920 | `c_a_cat.m4a` | a cat |  |
| 921 | `c_a_duck.m4a` | a duck |  |
| 922 | `c_a_dog.m4a` | a dog |  |
| 923 | `c_a_pig.m4a` | a pig |  |
| 924 | `c_a_sheep.m4a` | a sheep |  |
| 925 | `c_a_lion.m4a` | a lion |  |
| 926 | `c_a_mouse.m4a` | a mouse |  |
| 927 | `c_a_giraffe.m4a` | a giraffe |  |
| 928 | `c_a_frog.m4a` | a frog |  |
| 929 | `c_an_elephant.m4a` | an elephant |  |
| 930 | `c_a_zebra.m4a` | a zebra |  |
| 931 | `c_a_bird.m4a` | a bird |  |
| 932 | `c_a_fish.m4a` | a fish |  |
| 933 | `c_a_turtle.m4a` | a turtle |  |
| 934 | `c_a_horse.m4a` | a horse |  |
| 935 | `c_a_rabbit.m4a` | a rabbit |  |
| 936 | `c_dog.m4a` | dog |  |
| 937 | `c_cat.m4a` | cat |  |
| 938 | `c_cow.m4a` | cow |  |
| 939 | `c_horse.m4a` | horse |  |
| 940 | `c_frog.m4a` | frog |  |
| 941 | `c_fish.m4a` | fish |  |
| 942 | `c_duck.m4a` | duck |  |
| 943 | `c_butterfly.m4a` | butterfly |  |
| 944 | `c_spider.m4a` | spider |  |
| 945 | `c_snail.m4a` | snail |  |
| 946 | `c_a_kangaroo.m4a` | a kangaroo |  |
| 947 | `c_a_chicken.m4a` | a chicken |  |
| 948 | `c_a_spider.m4a` | a spider |  |
| 949 | `c_an_ant.m4a` | an ant |  |
| 950 | `c_a_bee.m4a` | a bee |  |
| 951 | `c_a_butterfly.m4a` | a butterfly |  |
| 952 | `c_a_whale.m4a` | a whale |  |
| 953 | `c_a_penguin.m4a` | a penguin |  |
| 954 | `c_a_parrot.m4a` | a parrot |  |
| 955 | `c_an_owl.m4a` | an owl |  |
| 956 | `c_blue.m4a` | blue |  |
| 957 | `c_green.m4a` | green |  |
| 958 | `c_red.m4a` | red |  |
| 959 | `c_purple.m4a` | purple |  |
| 960 | `c_orange.m4a` | orange |  |
| 961 | `c_yellow.m4a` | yellow |  |
| 962 | `c_white.m4a` | white |  |
| 963 | `c_black.m4a` | black |  |
| 964 | `c_a_triangle.m4a` | a triangle |  |
| 965 | `c_a_circle.m4a` | a circle |  |
| 966 | `c_a_square.m4a` | a square |  |
| 967 | `c_four.m4a` | four |  |
| 968 | `c_three.m4a` | three |  |
| 969 | `c_six.m4a` | six |  |
| 970 | `c_a_star.m4a` | a star |  |
| 971 | `c_the_heart.m4a` | the heart |  |
| 972 | `c_the_star.m4a` | the star |  |
| 973 | `c_the_circle.m4a` | the circle |  |
| 974 | `c_fall.m4a` | fall |  |
| 975 | `c_summer.m4a` | summer |  |
| 976 | `c_spring.m4a` | spring |  |
| 977 | `c_winter.m4a` | winter |  |
| 978 | `c_an_umbrella.m4a` | an umbrella |  |
| 979 | `c_sunglasses.m4a` | sunglasses |  |
| 980 | `c_mittens.m4a` | mittens |  |
| 981 | `c_a_snowman.m4a` | a snowman |  |
| 982 | `c_sandals.m4a` | sandals |  |
| 983 | `c_shorts.m4a` | shorts |  |
| 984 | `c_lightning.m4a` | lightning |  |
| 985 | `c_ice.m4a` | ice |  |
| 986 | `c_sugar.m4a` | sugar |  |
| 987 | `c_paper.m4a` | paper |  |
| 988 | `c_a_beach.m4a` | a beach |  |
| 989 | `c_a_sunflower.m4a` | a sunflower |  |
| 990 | `c_your_eyes.m4a` | your eyes |  |
| 991 | `c_your_ears.m4a` | your ears |  |
| 992 | `c_your_nose.m4a` | your nose |  |
| 993 | `c_your_hands.m4a` | your hands |  |
| 994 | `c_your_feet.m4a` | your feet |  |
| 995 | `c_five.m4a` | five |  |
| 996 | `c_ten.m4a` | ten |  |
| 997 | `c_your_teeth.m4a` | your teeth |  |
| 998 | `c_your_heart.m4a` | your heart |  |
| 999 | `c_your_foot.m4a` | your foot |  |
| 1000 | `c_your_brain.m4a` | your brain |  |
| 1001 | `c_your_leg.m4a` | your leg |  |
| 1002 | `c_your_ear.m4a` | your ear |  |
| 1003 | `c_wash_your_hands.m4a` | wash your hands |  |
| 1004 | `c_take_a_nap.m4a` | take a nap |  |
| 1005 | `c_hop_like_a_kangaroo.m4a` | hop like a kangaroo |  |
| 1006 | `c_two.m4a` | two |  |
| 1007 | `c_an_apple.m4a` | an apple |  |
| 1008 | `c_a_carrot.m4a` | a carrot |  |
| 1009 | `c_bread.m4a` | bread |  |
| 1010 | `c_a_banana.m4a` | a banana |  |
| 1011 | `c_ice_cream.m4a` | ice cream |  |
| 1012 | `c_soup.m4a` | soup |  |
| 1013 | `c_toast.m4a` | toast |  |
| 1014 | `c_a_potato.m4a` | a potato |  |
| 1015 | `c_cheese.m4a` | cheese |  |
| 1016 | `c_grapes.m4a` | grapes |  |
| 1017 | `c_a_strawberry.m4a` | a strawberry |  |
| 1018 | `c_corn.m4a` | corn |  |
| 1019 | `c_apples.m4a` | apples |  |
| 1020 | `c_carrots.m4a` | carrots |  |
| 1021 | `c_honey.m4a` | honey |  |
| 1022 | `c_an_orange.m4a` | an orange |  |
| 1023 | `c_cold.m4a` | cold |  |
| 1024 | `c_sunny.m4a` | sunny |  |
| 1025 | `c_loud.m4a` | loud |  |
| 1026 | `c_small.m4a` | small |  |
| 1027 | `c_tall.m4a` | tall |  |
| 1028 | `c_fast.m4a` | fast |  |
| 1029 | `c_down.m4a` | down |  |
| 1030 | `c_left.m4a` | left |  |
| 1031 | `c_right.m4a` | right |  |
| 1032 | `c_night.m4a` | night |  |
| 1033 | `c_morning.m4a` | morning |  |
| 1034 | `c_lunch.m4a` | lunch |  |
| 1035 | `c_sad.m4a` | sad |  |
| 1036 | `c_silly.m4a` | silly |  |
| 1037 | `c_sleepy.m4a` | sleepy |  |
| 1038 | `c_slow.m4a` | slow |  |
| 1039 | `c_closed.m4a` | closed |  |
| 1040 | `c_dry.m4a` | dry |  |
| 1041 | `c_quiet.m4a` | quiet |  |
| 1042 | `c_the_carrot.m4a` | the carrot |  |
| 1043 | `c_the_apple.m4a` | the apple |  |
| 1044 | `c_the_banana.m4a` | the banana |  |
| 1045 | `c_the_grapes.m4a` | the grapes |  |
| 1046 | `c_the_car.m4a` | the car |  |
| 1047 | `c_the_cat.m4a` | the cat |  |
| 1048 | `c_the_dog.m4a` | the dog |  |
| 1049 | `c_the_cow.m4a` | the cow |  |
| 1050 | `c_the_spoon.m4a` | the spoon |  |
| 1051 | `c_the_sock.m4a` | the sock |  |
| 1052 | `c_the_sneaker.m4a` | the sneaker |  |
| 1053 | `c_the_boot.m4a` | the boot |  |
| 1054 | `c_the_fish.m4a` | the fish |  |
| 1055 | `c_the_bird.m4a` | the bird |  |
| 1056 | `c_the_airplane.m4a` | the airplane |  |
| 1057 | `c_the_butterfly.m4a` | the butterfly |  |
| 1058 | `c_the_teddy_bear.m4a` | the teddy bear |  |
| 1059 | `c_the_tree.m4a` | the tree |  |
| 1060 | `c_the_frog.m4a` | the frog |  |
| 1061 | `c_the_bee.m4a` | the bee |  |
| 1062 | `c_the_pizza.m4a` | the pizza |  |
| 1063 | `c_the_cheese.m4a` | the cheese |  |
| 1064 | `c_the_lion.m4a` | the lion |  |
| 1065 | `c_the_octopus.m4a` | the octopus |  |
| 1066 | `c_the_whale.m4a` | the whale |  |
| 1067 | `c_the_sailboat.m4a` | the sailboat |  |
| 1068 | `c_the_bike.m4a` | the bike |  |
| 1069 | `c_the_bus.m4a` | the bus |  |
| 1070 | `c_the_hammer.m4a` | the hammer |  |
| 1071 | `c_the_drum.m4a` | the drum |  |
| 1072 | `c_the_guitar.m4a` | the guitar |  |
| 1073 | `c_the_trumpet.m4a` | the trumpet |  |
| 1074 | `c_hat.m4a` | hat |  |
| 1075 | `c_sun.m4a` | sun |  |
| 1076 | `c_tree.m4a` | tree |  |
| 1077 | `c_bus.m4a` | bus |  |
| 1078 | `c_bird.m4a` | bird |  |
| 1079 | `c_snake.m4a` | snake |  |
| 1080 | `c_apple.m4a` | apple |  |
| 1081 | `c_drum.m4a` | drum |  |
| 1082 | `c_boat.m4a` | boat |  |
| 1083 | `c_sheep.m4a` | sheep |  |
| 1084 | `c_chair.m4a` | chair |  |
| 1085 | `c_bed.m4a` | bed |  |
| 1086 | `c_shoe.m4a` | shoe |  |
| 1087 | `c_house.m4a` | house |  |
| 1088 | `c_spoon.m4a` | spoon |  |
| 1089 | `c_ring.m4a` | ring |  |
| 1090 | `c_crown.m4a` | crown |  |
| 1091 | `c_castle.m4a` | castle |  |
| 1092 | `c_dish.m4a` | dish |  |
| 1093 | `c_fork.m4a` | fork |  |
| 1094 | `c_cup.m4a` | cup |  |
| 1095 | `c_water.m4a` | water |  |
| 1096 | `c_candy.m4a` | candy |  |
| 1097 | `c_toys.m4a` | toys |  |
| 1098 | `c_it_melts.m4a` | it melts |  |
| 1099 | `c_it_gets_colder.m4a` | it gets colder |  |
| 1100 | `c_it_bounces.m4a` | it bounces |  |
| 1101 | `c_a_paper_clip.m4a` | a paper clip |  |
| 1102 | `c_a_teddy_bear.m4a` | a teddy bear |  |
| 1103 | `c_a_boat.m4a` | a boat |  |
| 1104 | `c_a_key.m4a` | a key |  |
| 1105 | `c_a_hammer.m4a` | a hammer |  |
| 1106 | `c_leaves.m4a` | leaves |  |
| 1107 | `c_plant.m4a` | plant |  |
| 1108 | `c_car.m4a` | car |  |
| 1109 | `c_fire.m4a` | fire |  |
| 1110 | `c_a_magnifying_glass.m4a` | a magnifying glass |  |
| 1111 | `c_a_spoon.m4a` | a spoon |  |
| 1112 | `c_a_sock.m4a` | a sock |  |
| 1113 | `c_a_clock.m4a` | a clock |  |
| 1114 | `c_a_sneaker.m4a` | a sneaker |  |
| 1115 | `c_air.m4a` | air |  |
| 1116 | `c_juice.m4a` | juice |  |
| 1117 | `c_sand.m4a` | sand |  |
| 1118 | `c_the_ocean.m4a` | the ocean |  |
| 1119 | `c_a_puddle.m4a` | a puddle |  |
| 1120 | `c_a_cup.m4a` | a cup |  |
| 1121 | `c_a_map.m4a` | a map |  |
| 1122 | `c_a_compass.m4a` | a compass |  |
| 1123 | `c_a_mountain.m4a` | a mountain |  |
| 1124 | `c_a_forest.m4a` | a forest |  |
| 1125 | `c_a_desert.m4a` | a desert |  |
| 1126 | `c_an_iceberg.m4a` | an iceberg |  |
| 1127 | `c_ball.m4a` | ball |  |
| 1128 | `c_box.m4a` | box |  |
| 1129 | `c_triangle.m4a` | triangle |  |
| 1130 | `c_a_city.m4a` | a city |  |
| 1131 | `c_an_ocean.m4a` | an ocean |  |
| 1132 | `c_hot.m4a` | hot |  |

---
*Generated from `js/core/voice-lines.js` by `tools/build-recording-script.js`. File names can end in .m4a, .mp3, .wav or .webm.*
